/* eslint-disable global-require */
import Router from 'koa-router';
import { koaBody } from 'koa-body';
import { strict as assert } from 'node:assert';
import marko from "marko";

import Account from '../../services/account.js';
import { sessionCheckMiddleware } from '../error/index.js';
const loginTmpl = marko.load("./pages/login-flow/login.marko");
const repostTmpl = marko.load("./pages/login-flow/repost.marko");
const consentTmpl = marko.load("./pages/login-flow/consent.marko");

const debug = (obj) => JSON.stringify(obj);

export default (provider) => {
  const router = new Router();
  const body = koaBody({
    text: false, json: false, patchNode: true, patchKoa: true,
  });

  // Default for interaction routes, don't store anything
  router.use(sessionCheckMiddleware);

  //https://markojs.com/docs/syntax/#SnippetTab
  router.get('/interaction/:uid', async (ctx, next) => {
    const {
      uid, prompt, params, session,
    } = await provider.interactionDetails(ctx.req, ctx.res);
    const client = await provider.Client.find(params.client_id);

    switch (prompt.name) {
      case 'login': {
        ctx.type = "html";
        ctx.body = loginTmpl.stream({
          html: ctx.state.html,
          title: ctx.state.t('login.title'),
          client,
          uid,
          details: prompt.details,
          params,
          title: 'Sign-in',
          google: ctx.google,
          session: session ? debug(session) : undefined,
          dbg: {
            params: debug(params),
            prompt: debug(prompt),
          },
        });
        return;
      }
      case 'consent': {
        ctx.type = "html";
        const missingOIDCScope = new Set(prompt.details.missingOIDCScope);
        missingOIDCScope.delete('openid');
        missingOIDCScope.delete('offline_access');
        const missingOIDCClaims = new Set(prompt.details.missingOIDCClaims);
        ['sub', 'sid', 'auth_time', 'acr', 'amr', 'iss'].forEach(Set.prototype.delete.bind(missingOIDCClaims));
        const missingResourceScopes = prompt.details.missingResourceScopes;
        ctx.body = consentTmpl.stream({
          html: ctx.state.html,
          title: ctx.state.t('login.title'),
          client,
          uid,
          missingOIDCScope,
          missingOIDCClaims,
          missingResourceScopes,
          params,
          title: 'Authorize',
          session: session ? debug(session) : undefined,
          dbg: {
            params: debug(params),
            prompt: debug(prompt),
          },
        });
        return;
      }
      default:
        return next();
    }
  });

  router.get('/interaction/callback/google', (ctx) => {
    const nonce = ctx.res.locals.cspNonce;
    ctx.body = repostTmpl.stream({
      html: ctx.state.html,
      title: ctx.state.t('login.title'),
      layout: false,
      upstream: 'google',
      nonce,
    });
    return;
  });

  router.post('/interaction/:uid/login', body, async (ctx) => {
    const { prompt: { name } } = await provider.interactionDetails(ctx.req, ctx.res);
    assert.equal(name, 'login');

    const account = await Account.findByLogin(ctx.request.body.login);

    const result = {
      login: {
        accountId: account.accountId,
      },
    };

    return provider.interactionFinished(ctx.req, ctx.res, result, {
      mergeWithLastSubmission: false,
    });
  });

  router.post('/interaction/:uid/federated', body, async (ctx) => {
    const { prompt: { name } } = await provider.interactionDetails(ctx.req, ctx.res);
    assert.equal(name, 'login');

    const path = `/interaction/${ctx.params.uid}/federated`;

    switch (ctx.request.body.upstream) {
      case 'google': {
        const callbackParams = ctx.google.callbackParams(ctx.req);

        // init
        if (!Object.keys(callbackParams).length) {
          const state = `${ctx.params.uid}|${crypto.randomBytes(32).toString('hex')}`;
          const nonce = crypto.randomBytes(32).toString('hex');

          ctx.cookies.set('google.state', state, { path, sameSite: 'strict' });
          ctx.cookies.set('google.nonce', nonce, { path, sameSite: 'strict' });

          ctx.status = 303;
          return ctx.redirect(ctx.google.authorizationUrl({
            state, nonce, scope: 'openid email profile',
          }));
        }

        // callback
        const state = ctx.cookies.get('google.state');
        ctx.cookies.set('google.state', null, { path });
        const nonce = ctx.cookies.get('google.nonce');
        ctx.cookies.set('google.nonce', null, { path });

        const tokenset = await ctx.google.callback(undefined, callbackParams, { state, nonce, response_type: 'id_token' });
        const account = await Account.findByFederated('google', tokenset.claims());

        const result = {
          login: {
            accountId: account.accountId,
          },
        };
        return provider.interactionFinished(ctx.req, ctx.res, result, {
          mergeWithLastSubmission: false,
        });
      }
      default:
        return undefined;
    }
  });

  router.post('/interaction/:uid/confirm', body, async (ctx) => {
    const interactionDetails = await provider.interactionDetails(ctx.req, ctx.res);
    const { prompt: { name, details }, params, session: { accountId } } = interactionDetails;
    assert.equal(name, 'consent');

    let { grantId } = interactionDetails;
    let grant;

    if (grantId) {
      // we'll be modifying existing grant in existing session
      grant = await provider.Grant.find(grantId);
    } else {
      // we're establishing a new grant
      grant = new provider.Grant({
        accountId,
        clientId: params.client_id,
      });
    }

    if (details.missingOIDCScope) {
      grant.addOIDCScope(details.missingOIDCScope.join(' '));
    }
    if (details.missingOIDCClaims) {
      grant.addOIDCClaims(details.missingOIDCClaims);
    }
    if (details.missingResourceScopes) {
      for (const [indicator, scope] of Object.entries(details.missingResourceScopes)) {
        grant.addResourceScope(indicator, scope.join(' '));
      }
    }

    grantId = await grant.save();

    const consent = {};
    if (!interactionDetails.grantId) {
      // we don't have to pass grantId to consent, we're just modifying existing one
      consent.grantId = grantId;
    }

    const result = { consent };
    return provider.interactionFinished(ctx.req, ctx.res, result, {
      mergeWithLastSubmission: true,
    });
  });

  router.get('/interaction/:uid/abort', async (ctx) => {
    const result = {
      error: 'access_denied',
      error_description: 'End-User aborted interaction',
    };

    return provider.interactionFinished(ctx.req, ctx.res, result, {
      mergeWithLastSubmission: false,
    });
  });

  return router;
}

/*export default ctx => {
  ctx.type = "html";
  ctx.body = template.stream({
    name: "Frank",
    count: 30,
    colors: ["red", "green", "blue"]
  });
};*/
