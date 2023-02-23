// Add application endpoint management (helper but should rely on oidc later)
import Router from 'koa-router';

const router = new Router();

// https://github.com/onflow/fcl-js/blob/master/packages/fcl/src/wallet-provider-spec/provable-authn.md
// https://github.com/onflow/fcl-js/blob/master/packages/fcl/src/wallet-provider-spec/authorization-function.md
// https://github.com/onflow/fcl-js/blob/82243080b498d40909def3ef97fa1750ae6bef3f/packages/config/utils/utils.test.js

//https://github.com/onflow/flow-account-api
//https://github.com/justinbarry/simple-fcl-grpc-test/blob/main/index.js
// Move a child from a parent account to a new account
router.post('/api/flow/child/move', (ctx) => {
  // ctx.flow <- flowClient
  
  ctx.body = {};
});

// List account that the current logged user can use [own accounts, app accounts]
router.get('/api/flow/my/accounts', (ctx) => {
  ctx.body = {};
});

export default router;

