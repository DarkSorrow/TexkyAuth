// Add application endpoint management (helper but should rely on oidc later)
import Router from 'koa-router';

const router = new Router();

router.get('/api/applications', (ctx) => {
  ctx.body = {};
});

router.get('/api/application/:clientID', (ctx) => {
  ctx.body = {};
});

router.post('/api/application', (ctx) => {
  ctx.body = {};
});

router.delete('/api/application', (ctx) => {
  ctx.body = {};
});

export default router;

