// Add application endpoint management (helper but should rely on oidc later)
import Router from 'koa-router';
import cors from '@koa/cors';
import { koaBody } from 'koa-body';

import { verify_token } from './default.js';
import { passwordManager } from '../configurations/password.js';

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

router.get('/api/profile/applications', verify_token, async (ctx) => {
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
    ctx.request.query.legal_id = ctx.state.legal;
    const result = await ctx.cassandra.cql.execute(
      'SELECT client_id,consent,detail_json,updated_at,created_at FROM account.consent_subject WHERE subject = ?;',
      [ctx.state.subject], options,
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
  } catch (err) {
    ctx.log.error({ err }, '[SelectionError]');
    ctx.status = 400;
    ctx.body = erroObject('SelectionError');
    return;
  }
});

export default router;

