// Add application endpoint management (helper but should rely on oidc later)
import Router from 'koa-router';
import cors from '@koa/cors';

import { verify_token } from './default.js';
import { clientApplication } from '../services/client_app.js';
import { passwordManager } from '../configurations/password.js';
/* {subject: '1db47620-b476-11ed-ae89-032bbc01911d', 
clientId: 'ABCgWwsfyRQ0XRAE', 
legals: '1db49d30-b476-11ed-b56e-4df59fac69f4'} */
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

router.get('/api/application/:clientID', verify_token, (ctx) => {
  ctx.body = {};
});
router.options('/api/applications', verify_token, (ctx) => {
  ctx.status = 204;
});
router.post('/api/application', verify_token, (ctx) => {
  ctx.body = {};
});
router.delete('/api/application', verify_token, (ctx) => {
  ctx.body = {};
});
export default router;

