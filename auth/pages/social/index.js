/* eslint-disable max-len */
import Router from 'koa-router';
import { koaBody } from 'koa-body';
import { nanoid } from 'nanoid';

import constant from '../../configurations/constant.js';
import passport from '../../services/passeport.js';
import { errorMiddleware } from '../error/index.js';
import { loginTmpl } from '../login-flow/index.js';

// delay in second for redis
const ACTIVATE_SOCIAL_TIME = 4 * 60 * 60;
const EMAIL_SEND_DELAY = 30;
const listSocialStrategy = Object.keys(constant.social);

function verifyStrategy(ctx, next) {
  ctx.state.socialStrategy = ctx.params.social;
  if (listSocialStrategy.includes(ctx.state.socialStrategy)) {
    return next();
  }
  ctx.log.error(new Error('Strategy not found'), `[verifyStrategy:callback/${ctx.params.social}/${ctx.params.application}/]`);
  ctx.status = 404;
  errorMiddleware(ctx, {}, {
    statusCode: 400,
    error_description: 'Social network: strategy not found',
  });
}

export default (provider) => {
  const router = new Router();
  const body = koaBody({
    text: false,
    json: true,
  });
  router.use(passport.initialize());

  /**
   * Login into social account
   */
  router.get('/social/login/:social/:application/:uid', verifyStrategy,
    (ctx, next) => passport.authenticate(ctx.state.socialStrategy, constant.social[ctx.state.socialStrategy].config(ctx))(ctx, next));

  // Create it as /social/callback/:social/:appId or make the fb_tql into a :social_provider
  router.get('/social/callback/:social/:application', verifyStrategy,
  (ctx, next) => passport.authenticate(ctx.state.socialStrategy, async (err, user) => {
    if (!ctx.query.state) {
      //return ctx.redirect(`/interaction/${ctx.query.state}?error=internal_error`);
      ctx.log.error(new Error('Social strategy with no state'), `[Get:callback/${ctx.params.social}/${ctx.params.application}/]`);
      const error = ctx.errors.getError('011');
      ctx.type = 'html';
      ctx.status = error.statusCode;
      return errorMiddleware(ctx, {}, {
        statusCode: 400,
        error_description: 'Social network: strategy not found',
      });
    }
    try {
      const state = JSON.parse(
        Buffer.from(ctx.query.state.replace('-', '+').replace('_', '/'), 'base64').toString(),
      );
      if (err) {
        let error;
        if (typeof err === 'string') {
          error = ctx.errors.getError(err);
        } else {
          ctx.log.error(err, `[Get:callback/${ctx.params.social}/${ctx.params.application}/]`);
          error = ctx.errors.getError('005');
        }
        ctx.type = 'html';
        ctx.body = loginTmpl.stream({
          html: ctx.state.html,
          title: ctx.state.t('loginFlow.title'),
          uid: state.uid,
          params: state.params,
          csrf: nanoid(14),
          client: {},
          title: 'Sign-in',
          error,
        });
        return;
      }
      // Safe check to be sure we are calling the page from within a generated query
      const xd = nanoid(20);
      ctx.redis.setex(`social:${state.uid}:${ctx.params.social}`, 60, JSON.stringify({
        xd,
        subject: user.subject,
        email: user.email,
        mfa_type: user.mfa_type,
        profile_location: user.profile_location,
        profile_update: user.profile_update,
      }));
      return ctx.redirect(`/interaction/${state.uid}/social/${ctx.params.social}?xd=${xd}`);
    } catch (errorCb) {
      ctx.log.error({ errorCb }, '[Soccial::SocialCallbackCatch]');
      return errorMiddleware(ctx, {}, {
        statusCode: 400,
        error_description: 'Social network: state problems',
      });
    }
  })(ctx, next));

  router.post('/social/callback/:social/:application', body, verifyStrategy,
    (ctx, next) => passport.authenticate(ctx.state.socialStrategy, async (err, user) => {
      // ctx.log.info({ body: ctx.request.body, params: ctx.params, user }, `[POST:callback/${ctx.params.social}/${ctx.params.application}/]`);
      if (!ctx.request.body.state) {
        ctx.log.error(new Error('Social strategy with no state'), `[POST:callback/${ctx.params.social}/${ctx.params.application}/]`);
        ctx.status = 400;
        return errorMiddleware(ctx, {}, {
          statusCode: 400,
          error_description: 'Social network: strategy not found',
        });
      }
      const state = JSON.parse(
        Buffer.from(ctx.request.body.state.replace('-', '+').replace('_', '/'), 'base64').toString(),
      );
      const redirectObject = {
        title: 'social redirect',
        redirectURL: '',
        layout: false,
      };
      if (err) {
        err.app_rid = ctx.request.app_rid;
        let error;
        if (typeof err === 'string') {
          error = ctx.errors.getError(err);
        } else {
          ctx.log.error(err, `[Get:callback/${ctx.params.social}/${ctx.params.application}/]`);
          error = ctx.errors.getError('005');
        }
        ctx.type = 'html';
        ctx.response.status = error.statusCode;
        ctx.body = loginTmpl.stream({
          html: ctx.state.html,
          title: ctx.state.t('loginFlow.title'),
          uid: state.uid,
          params: state.params,
          csrf: nanoid(14),
          client: {},
          details: prompt.details,
          title: 'Sign-in',
          google: ctx.google,
        });
        return;
      }
      if (state.uid.length > 21) {
        ctx.log.error(new Error('State is too long'), `[POST:callback/${ctx.params.social}/${ctx.params.application}/]`);
        redirectObject.redirectURL = `/interaction/${state.uid}?error=internal_error`;
        return ctx.render('redirect', redirectObject);
      }
      // Safe check to be sure we are calling the page from within a generated query
      const xd = nanoid(20);
      await ctx.redis.setex(`social:${state.uid}:${ctx.params.social}`, 60, JSON.stringify({
        xd,
        subject: user.subject,
        mfa_type: user.mfa_type,
        profile_location: user.profile_location,
        profile_update: user.profile_update,
      }));
      redirectObject.redirectURL = `/interaction/${state.uid}/social/${ctx.params.social}?xd=${xd}`;
      return ctx.render('redirect', redirectObject);
      // return ctx.redirect(`/interaction/${ctx.body.state}/social/${ctx.params.social}?xd=${xd}`);
    })(ctx, next));

  /**
   * Linked account
   * Those account are to link the social account to existing account, disregarding the email
   * being used by the person
   */

  router.get('/.well-known/apple-developer-domain-association.txt',
    (ctx) => {
      ctx.status = 200;
      ctx.type = 'text';
      ctx.body = `${constant.issuer}/social/callback/apple/flowpenid\n${constant.issuer}/social/callback/apple/link\n`;
    });
  return router;
};
