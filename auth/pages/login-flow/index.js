/* eslint-disable global-require */
import Router from 'koa-router';
import { koaBody } from 'koa-body';
import { strict as assert } from 'node:assert';
import marko from "marko";
import { nanoid } from 'nanoid';
import { verifyMessage } from 'ethers'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

import Account from '../../services/account.js';
import { sessionCheckMiddleware } from '../error/index.js';
/*export const loginTmpl = marko.load("./pages/login-flow/login.marko");
const repostTmpl = marko.load("./pages/login-flow/repost.marko");
const consentTmpl = marko.load("./pages/login-flow/consent.marko");*/
export const loginTmpl = marko.load(join(__dirname, "../../templates/wallet_login.marko"));
const repostTmpl = marko.load(join(__dirname, "../../templates/repost.marko"));
const consentTmpl = marko.load(join(__dirname, "../../templates/wallet_consent.marko"));

const validateEmail = (email) => {
  const structureEmail = email.split('@');
  if (structureEmail.length !== 2) {
    return (1);
  }
  if (structureEmail[1].indexOf(' ') !== -1) {
    return (1);
  }
  const domainEmail = structureEmail[1].split('.');
  if ((domainEmail.length < 2)
        || (domainEmail[0].length === 0)
        || (domainEmail[1].length === 0)
        || (structureEmail[0].length === 0)) {
    return (2);
  }
  return (0);
}
/**
 * Helper definition to create validation functions
 * @typedef ValidationError
 * @type {object}
 * @property {boolean} error - false by default, true if an error occured
 * @property {Object.<string,string>} wrongData - List of object name with a string description ex: 'field': 'text'
 */
/**
 * Check if the parameters passed in the register forms are well formed.
 * @param {Object} body
 * @return {ValidationError} Standard error object
 */
const registerValidator = (body) => {
  const validation = {
    error: false,
    wrongData: {},
  };
  if (body.email && body.pwd) {
    // dirty email validation
    const emailCheck = validateEmail(body.email);
    if (emailCheck !== 0) {
      if (emailCheck === 2) {
        validation.wrongData.email = 'Email is malformed, domain is not valid';
        validation.error = true;
      } else {
        validation.wrongData.email = 'Email is malformed';
        validation.error = true;
      }
    }
    // password validation
    if ((!body.pwd) || (body.pwd.length < 8)) {
      validation.wrongData.pwd = 'Password length is too small, please use more than 8 characters';
      validation.error = true;
    }
  } else {
    validation.wrongData.fields = 'Missing parameters';
    validation.error = true;
  }

  return (validation);
}

const getAccountProof = (proof) => {
  for (let i = 0; i < proof.services.length; i++) {
    if (proof.services[i].type === "account-proof") {
      return proof.services[i].data;
    }
  }
  return null;
}

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
    if ((session) && (session.accountId)) {
      ctx.request.app_sub = session.accountId;
    }
    const csrf = nanoid(14);
    ctx.cookies.set('_xsecfflg', csrf, { signed: false, httpOnly: true, sameSite: 'strict' });
    switch (prompt.name) {
      case 'login': {
        ctx.type = "html";
        ctx.body = loginTmpl.stream({
          html: ctx.state.html,
          title: ctx.state.t('loginFlow.title'),
          csrf,
          uid,
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
        /*
          FIND INFORMATION ABOUT HOW WE WILL CREATE THE FLOW ACCOUNT AND PRPOSE THE CREATION
        */
        ctx.body = consentTmpl.stream({
          html: ctx.state.html,
          title: ctx.state.t('loginFlow.title'),
          client,
          uid,
          csrf,
          missingOIDCScope,
          missingOIDCClaims,
          missingResourceScopes,
          params,
        });
        return;
      }
      default:
        return next();
    }
  });

  router.get('/test/consent', async (ctx) => {
    const client = await provider.Client.find('ABCgWwsfyRQ0XRAE');
    console.log(client)
    ctx.request.app_client = client.clientId;
    //The key is set in the route/social.js. The reason being that passport works with redirections
    ctx.type = "html";
    ctx.body = consentTmpl.stream({
      html: ctx.state.html,
      title: ctx.state.t('loginFlow.title'),
      client,
      uid: '14qdfqsdf',
      csrf: 'sfqdsfqsf',
      missingOIDCScope: new Set(),
      missingOIDCClaims: new Set(),
      missingResourceScopes: new Set(),
      params: {
        scope: 'test'
      },
    });
  });

  router.get('/test/login', async (ctx) => {
    const client = await provider.Client.find('ABCgWwsfyRQ0XRAE');
    console.log(client)
    ctx.request.app_client = client.clientId;
    //The key is set in the route/social.js. The reason being that passport works with redirections
    ctx.type = "html";
    ctx.body = loginTmpl.stream({
      html: ctx.state.html,
      csrf: nanoid(12),
      title: ctx.state.t('loginFlow.title'),
      uid: 'tresqfd',
    });
  });

  router.get('/interaction/callback/google', (ctx) => {
    const nonce = ctx.res.locals.cspNonce;
    ctx.body = repostTmpl.stream({
      html: ctx.state.html,
      title: ctx.state.t('loginFlow.title'),
      layout: false,
      upstream: 'google',
      nonce,
    });
    return;
  });

  router.post('/interaction/:uid/login', body, async (ctx) => {
    const { uid, params } = await provider.interactionDetails(ctx.req, ctx.res);
    ctx.request.app_client = params.client_id;
    let error = null;
    let account = null;
    if ((ctx.request.body.email) && (ctx.request.body.password)) {
      account = await Account.findByLogin(ctx, params);
    }
    if (account === null) {
      error = ctx.errors.getError('001');
    }
    if (account && account === false) {
      error = ctx.errors.getError('004');
    }
    if (error !== null) {
      ctx.type = 'html';
      ctx.status = error.statusCode;
      const csrf = nanoid(14);
      ctx.cookies.set('_xsecfflg', csrf, { signed: false, httpOnly: true, sameSite: 'strict' });
      ctx.body = loginTmpl.stream({
        html: ctx.state.html,
        title: ctx.state.t('loginFlow.title'),
        csrf,
        uid,
        error,
      });
      return;
    }
    // debug purpose, remove later no tracking needed :D
    Account.updateLastLogin(ctx, account.email);

    const result = {
      login: {
        accountId: account.subject,
        acr: 'urn:mace:incommon:iap:bronze',
        amr: [
          'login',
          account.mfa_type,
          account.profile_location,
          account.profile_update,
        ],
        ts: Math.floor(Date.now() / 1000),
      },
      meta: {
      },
    };
    ctx.request.app_sub = account.subject;
    return provider.interactionFinished(ctx.req, ctx.res, result, {
      mergeWithLastSubmission: false,
    });
  });

  router.post('/interaction/:uid/register', body, async (ctx) => {
    const { uid, params } = await provider.interactionDetails(ctx.req);
    try {
      // validate the data passed
      const validation = registerValidator(ctx.request.body);
      if (validation.error === true) {
        // ( iID, iMoreInfo, iHTTPCode, iWrongData )
        let error = ctx.errors.getError('002', validation.wrongData);
        ctx.type = 'html';
        ctx.response.status = error.statusCode;
        const csrf = nanoid(14);
        ctx.cookies.set('_xsecfflg', csrf, { signed: false, httpOnly: true, sameSite: 'strict' });
        ctx.body = loginTmpl.stream({
          html: ctx.state.html,
          title: ctx.state.t('loginFlow.title'),
          register: true,
          csrf,
          uid,
          error,
        });
        return;
      }
      const account = await Account.registerAccount(ctx);
      ctx.request.app_sub = account.subject;
      ctx.request.app_client = params.client_id;
      const result = {
        login: {
          accountId: account.subject, // TODO check what the account is used for
          acr: 'urn:mace:incommon:iap:bronze',
          amr: [
            'reg',
            false,
            account.profile_location,
            account.profile_update,
          ],
          ts: Math.floor(Date.now() / 1000),
        },
        meta: {
        },
      };
      return provider.interactionFinished(ctx.req, ctx.res, result, {
        mergeWithLastSubmission: false,
      });
    } catch (err) {
      err.app_rid = ctx.request.app_rid;
      let errorCode = '005';
      if (err.message === 'ERR_UNIQUE') { // email exist
        errorCode = '006';
      } else {
        ctx.log.error(err, '[Route::Registration::post]');
      }
      const error = ctx.errors.getError(errorCode);
      ctx.type = 'html';
      ctx.response.status = error.statusCode;
      const csrf = nanoid(14);
      ctx.cookies.set('_xsecfflg', csrf, { signed: false, httpOnly: true, sameSite: 'strict' });
      ctx.body = loginTmpl.stream({
        html: ctx.state.html,
        title: ctx.state.t('loginFlow.title'),
        register: true,
        csrf,
        uid,
        error,
      });
      return;
    }
  });

  router.post('/interaction/:uid/wagmi', body, async (ctx) => {
    const { uid, params } = await provider.interactionDetails(ctx.req, ctx.res);
    ctx.request.app_client = params.client_id;
    let error = null;
    let accountProof = null;
    if (ctx.request.body.wagmi && ctx.request.body.sigmi) {
      try {
        const address = verifyMessage(ctx.request.body.wagmi, ctx.request.body.sigmi);
        accountProof = JSON.parse(ctx.request.body.wagmi);
        if (accountProof.address !== address || ctx.cookies.get('nonrf') !== accountProof.nonce || (Date.now() > accountProof.exp)) {
          ctx.log.error({ accountProof, nonce: ctx.cookies.get('nonrf') }, "[Wagmi:verification]");
          error = ctx.errors.getError('016');
        }
      } catch (err) {
        ctx.log.error({ err }, '[Wagmi registration]')
        error = ctx.errors.getError('017');
      }
    }
    if (error !== null || accountProof === null) {
      ctx.type = 'html';
      ctx.status = 400;
      const csrf = nanoid(14);
      ctx.cookies.set('_xsecfflg', csrf, { signed: false, httpOnly: true, sameSite: 'strict' });
      ctx.body = loginTmpl.stream({
        html: ctx.state.html,
        title: ctx.state.t('loginFlow.title'),
        csrf,
        uid,
        error,
      });
      return;
    }
    const account = await Account.findOrCreateWagmi(ctx, accountProof.address, accountProof.chainID);
    if (account.suspended === true) {
      ctx.type = 'html';
      ctx.status = 400;
      const csrf = nanoid(14);
      ctx.cookies.set('_xsecfflg', csrf, { signed: false, httpOnly: true, sameSite: 'strict' });
      ctx.body = loginTmpl.stream({
        html: ctx.state.html,
        title: ctx.state.t('loginFlow.title'),
        csrf,
        uid,
        error,
      });
      return;
    }
    const result = {
      login: {
        accountId: account.subject,
        acr: 'urn:mace:incommon:iap:bronze',
        amr: [
          `wagmi:${accountProof.chainID}:${account.address}`,
          account.mfa_type,
          account.profile_location,
          account.profile_update,
        ],
        ts: Math.floor(Date.now() / 1000),
      },
      meta: {
      },
    };
    ctx.request.app_sub = account.subject;
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
    ctx.request.byme_sub = accountId;
    ctx.request.byme_client = params.client_id;
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
    const scopes = grant.openid.scope.split(' ');
    const claims = [];
    const consent = {};
    if (!interactionDetails.grantId) {
      // we don't have to pass grantId to consent, we're just modifying existing one
      consent.grantId = grantId;
    }
    let result = { consent };
    const consentDetails = {
      prevConsent: null,
    };
    consentDetails.prevConsent = await Account.findConsent(
      ctx, accountId,
      params.client_id,
    );
    try {
      await Account.CreateOrUpdateConsent(ctx, consentDetails, {
        subject: accountId,
        client_id: params.client_id,
        consent: true,
        details: {
          rejectedScopes: result.consent.rejectedScopes,
          rejectedClaims: result.consent.rejectedClaims,
          promptedScopes: scopes,
          promptedClaims: claims,
          flow_account: '',
          flow_parent_account: '',
          flow_custody: 0,
          whitelisted_addresses: {},
        },
      });
    } catch (err) {
      err.app_rid = ctx.request.app_rid;
      ctx.log.error(err, '[Route::interaction_confirm::post]');
      result = {
        error: 'access_denied',
        error_description: 'Internal server error',
      };
    }
    return provider.interactionFinished(ctx.req, ctx.res, result, {
      mergeWithLastSubmission: true,
    });
  });

  router.get('/interaction/:uid/abort', async (ctx) => {
    const interactionDetails = await provider.interactionDetails(ctx.req, ctx.res);
    const { prompt: { details }, params, session: { accountId } } = interactionDetails;
    ctx.request.byme_sub = accountId;
    ctx.request.byme_client = params.client_id;
    const result = {
      error: 'access_denied',
      error_description: 'End-User aborted interaction',
    };
    await Account.CreateOrUpdateConsent(ctx, details, {
      subject: accountId,
      client_id: params.client_id,
      consent: false,
      details: null,
    });
    return provider.interactionFinished(ctx.req, ctx.res, result, {
      mergeWithLastSubmission: false,
    });
  });

  router.get('/interaction/:uid/social/:strategy_id', async (ctx) => {
    const details = await provider.interactionDetails(ctx.req);
    ctx.request.app_client = details.params.client_id;
    const multi = await ctx.redis.multi();
    //The key is set in the route/social.js. The reason being that passport works with redirections
    const key = `social:${details.uid}:${ctx.params.strategy_id}`;
    multi.get(key);
    multi.del(key);
    let socialObject = await multi.exec();
    try {
      socialObject = JSON.parse(socialObject[0][1]);
      if ((socialObject.xd !== ctx.query.xd)) {
        // Log the ip calling this function and having errors because
        // it might be an attempt to fish the values in the database
        throw (new Error('Session not found'));
      }
      if (!socialObject.subject) {
        throw (new Error(`Object parse error ${JSON.stringify(socialObject)}`));
      }
    } catch (err) {
      err.app_rid = ctx.request.app_rid;
      ctx.log.warn(err, '[GET:SocialLogin]');
      return provider.interactionFinished(ctx.req, ctx.res, {
        error: 'access_denied',
        error_description: 'End-User social interaction login error',
      }, {
        mergeWithLastSubmission: false,
      });
    }
    // might be useful but then against privacy
    // Account.updateLastUseSocial(ctx, socialObject.provider_subject);
    const result = {
      login: {
        accountId: socialObject.subject, // TODO check what the account is used for
        acr: 'urn:mace:incommon:iap:bronze',
        amr: [
          `social:${ctx.params.strategy_id}`,
          socialObject.mfa_type,
          socialObject.profile_location,
          socialObject.profile_update,
        ],
        ts: Math.floor(Date.now() / 1000),
      },
      meta: {
      },
    };
    ctx.request.app_sub = socialObject.subject;
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
