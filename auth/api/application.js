// Add application endpoint management (helper but should rely on oidc later)
import Router from 'koa-router';
import { verify_token } from './default.js';
import cors from '@koa/cors';

const router = new Router();
router.use(cors())

router.options('/api/(.*)', verify_token, (ctx) => {
  ctx.status = 204;
});
router.head('/api/(.*)', verify_token, (ctx) => {
  ctx.status = 204;
});

router.get('/api/applications', verify_token, (ctx) => {
  ctx.body = ctx.state;
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

