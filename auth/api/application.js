// Add application endpoint management (helper but should rely on oidc later)
import Router from 'koa-router';
import cors from '@koa/cors';
import { koaBody } from 'koa-body';

import { verify_token } from './default.js';
import { clientApplication } from '../services/client_app.js';
import { passwordManager } from '../configurations/password.js';
import { nanoid } from 'nanoid';
/* {subject: '1db47620-b476-11ed-ae89-032bbc01911d', 
clientId: 'ABCgWwsfyRQ0XRAE', 
legals: '1db49d30-b476-11ed-b56e-4df59fac69f4'} */
const body = koaBody({
  text: false,
  json: true,
});

const router = new Router();
router.use(cors())

router.options('/api/(.*)', (ctx) => {
  ctx.status = 204;
});
router.head('/api/(.*)', (ctx) => {
  ctx.status = 204;
});

const erroObject = (errorMsg) => ({
  status: -1,
  data: [],
  options: {
    error: errorMsg
  }
}) 

router.get('/api/applications', verify_token, async (ctx) => {
  const options = { prepare : true, fetchSize :  200 };
  if (ctx.request.query.pageState) {
    try {
      const stateObject = await passwordManager.decryptHackathon(ctx.request.query.pageState);
      options.pageState = stateObject.pageState
    } catch (err) {
      ctx.log.error({ err }, '[StateObjectError]');
      ctx.status = 400;
      ctx.body = erroObject('PageStateError');
      return;
    }
  }
  try {
    const result = await ctx.cassandra.cql.execute(
      'SELECT (client_id, suspended, application_type, logo_uri, client_name, client_application_type, consent_flow, flow_custody, flow_account_creation, updated_at) FROM account.legal_application WHERE legal_id = ?;',
      [ctx.state.legal], options,
    );
    let pageID = null;
    if (result.pageState) {
      pageID = await passwordManager.encryptHackathon({
        pageState: result.pageState
      });
    }
    ctx.body = {
      status: 1,
      data: result.rows,
      options: {
        pageID
      }
    };
  } catch (err) {
    ctx.log.error({ err }, '[SelectionError]');
    ctx.status = 400;
    ctx.body = erroObject('SelectionError');
    return;
  }
});

router.get('/api/application/:clientID', verify_token, async (ctx) => {
  // ctx.request.params.clientID
  try {
    const result = await ctx.cassandra.cql.execute(
      'SELECT client_id,client_secret,suspended,application_type,logo_uri,subject_type,client_name,client_uri,policy_uri,tos_uri,contacts,client_application_type,sector_identifier_uri,response_types,redirect_uris,grant_types,default_acr,post_logout_redirect_uris,cors_allowed,notif_params_json,consent_flow,flow_custody,flow_account_creation,flow_contracts,legal_id,updated_at FROM account.application WHERE client_id = ?;',
      [ctx.request.params.clientID], { prepare : true },
    );
    if (result.rowLength === 1 && ctx.state.legal.equals(result.rows[0].legal_id)) {
      ctx.body = {
        status: 1,
        data: result.rows[0],
      };
      return;
    }
    ctx.body = erroObject('NotFound');
  } catch (err) {
    ctx.log.error({ err }, '[SelectionError]');
    ctx.status = 400;
    ctx.body = erroObject('SelectionError');
  }
});

router.get('/api/application/:clientID/subjects', verify_token, async (ctx) => {
  const options = { prepare : true, fetchSize :  200 };
  if (ctx.request.query.pageState) {
    try {
      const stateObject = await passwordManager.decryptHackathon(ctx.request.query.pageState);
      options.pageState = stateObject.pageState
    } catch (err) {
      ctx.log.error({ err }, '[StateObjectError]');
      ctx.status = 400;
      ctx.body = erroObject('PageStateError');
      return;
    }
  }
  const legalApp = await clientApplication.checkClient(ctx.request.params.clientID);
  if (legalApp.equals(ctx.state.legal)) {
    ctx.request.body.legal_id = ctx.state.legal;
    const result = await ctx.cassandra.cql.execute(
      'SELECT subject,consent,detail_json,updated_at,created_at FROM account.consent_application WHERE client_id = ?;',
      [ctx.request.params.clientID], options,
    );
    let pageID = null;
    if (result.pageState) {
      pageID = await passwordManager.encryptHackathon({
        pageState: result.pageState
      });
    }
    ctx.body = {
      status: 1,
      data: result.rows,
      options: {
        pageID,
      }
    };
    return;
  }
  ctx.status = 404;
  ctx.body = erroObject('NotFound');
});

router.post('/api/application', body, verify_token, async (ctx) => {
  if (ctx.request.body.client_id) {
    // update
    const legalApp = await clientApplication.checkClient(ctx.request.body.client_id);
    if (legalApp.equals(ctx.state.legal)) {
      ctx.request.body.legal_id = ctx.state.legal;
      await clientApplication.upsertClient(ctx.request.body.client_id, ctx.request.body);
      ctx.body = {
        status: 1,
        data: true,
      };
      return;
    }
    ctx.status = 404;
    ctx.body = erroObject('NotFound');
    return;
  } else if (ctx.request.body.client_name) {
    // insert
    ctx.request.body.legal_id = ctx.state.legal;
    ctx.request.body.client_secret = nanoid();
    await clientApplication.upsertClient(nanoid(), ctx.request.body);
    ctx.body = {
      status: 1,
      data: true,
    };
    return;
  }
  ctx.status = 400;
  ctx.body = erroObject('NoClientNameProvided');
});

/**
 * Should use this to reset client_secret later
 */
router.post('/api/application/:clientID/reset', verify_token, async (ctx) => {
  // ctx.request.params.clientID
  const legalApp = await clientApplication.checkClient(ctx.request.params.clientID);
  if (legalApp.equals(ctx.state.legal)) {
    ctx.body.legal_id = ctx.state.legal;
    // clientApplication.upsertClient(ctx.request.params.clientID, ctx.body);
  }
  ctx.status = 404;
  ctx.body = erroObject('NotFound');
});

router.delete('/api/application/:clientID', verify_token, async (ctx) => {
  // ctx.request.params.clientID
  if (ctx.request.params.clientID) {
    // update
    const legalApp = await clientApplication.checkClient(ctx.request.params.clientID);
    if (legalApp.equals(ctx.state.legal)) {
      await clientApplication.deleteClient(ctx.request.params.clientID);
      ctx.body = {
        status: 1,
        data: true,
      };
      return;
    }
  }
  ctx.status = 404;
  ctx.body = erroObject('NotFound');
});
export default router;

