// Add application endpoint management (helper but should rely on oidc later)
import Router from 'koa-router';
import cors from '@koa/cors';
import { 
  HashAlgorithm,
  InMemoryECSigner,
  SignatureAlgorithm,
  InMemoryECPrivateKey,
  TransactionAuthorizer
} from '../forked/freshmint.js';
import constant from '../configurations/constant.js';

const router = new Router();
router.use(cors())

router.options('/api/(.*)', verify_token, (ctx) => {
  ctx.status = 204;
});
router.head('/api/(.*)', verify_token, (ctx) => {
  ctx.status = 204;
});

// https://testnet.flowscan.org/

// https://github.com/onflow/fcl-js/blob/master/packages/fcl/src/wallet-provider-spec/provable-authn.md
// https://github.com/onflow/fcl-js/blob/master/packages/fcl/src/wallet-provider-spec/authorization-function.md
// https://github.com/onflow/fcl-js/blob/82243080b498d40909def3ef97fa1750ae6bef3f/packages/config/utils/utils.test.js

//https://github.com/onflow/flow-account-api
//https://github.com/justinbarry/simple-fcl-grpc-test/blob/main/index.js
// Move a child from a parent account to a new account
router.post('/api/flow/child/move', (ctx) => {
  // ctx.flow <- flowClient
  console.log(ctx.oidc)
  ctx.body = {};
});
/*
https://github.com/panva/node-oidc-provider/blob/433d131989558e24c0c74970d2d700af2199485d/lib/actions/userinfo.js
const accessToken = await ctx.oidc.provider.AccessToken.find(accessTokenValue);

    ctx.assert(accessToken, new InvalidToken('access token not found'));
*/
// List account that the current logged user can use [own accounts, app accounts]
router.get('/api/flow/my/accounts', (ctx) => {
  ctx.body = {};
});

// Move to flow service if working
const privateKey = InMemoryECPrivateKey.fromHex(
  constant.account.flowMain.private,
  SignatureAlgorithm.ECDSA_P256
);
const signer = new InMemoryECSigner(privateKey, HashAlgorithm.SHA3_256);
const ownerAuthorizer = new TransactionAuthorizer({
  address: constant.account.flowMain.address,
  keyIndex: 0,
  signer,
});
// end of flow service check

const authz = ownerAuthorizer.toFCLAuthorizationFunction();

router.get('/api/flow/account/create', async (ctx) => {

  const transactionId = await ctx.flow
    .send([
      ctx.flow.transaction(
        `transaction() {prepare(auth: AuthAccount) { log("hello")} }`
      ),
      ctx.flow.args([]),
      ctx.flow.limit(9999),
      ctx.flow.proposer(authz),
      ctx.flow.payer(authz),
      ctx.flow.authorizations([authz]),
    ])
    .then(ctx.flow.decode)
  ctx.log.debug({
    transactionId,
  }, '[/api/flow/account/create]');
  try {
    const status = await ctx.flow
      .tx({
        transactionId,
      })
      .onceSealed();
    ctx.body = status;
  } catch (e) {
    ctx.log.error({
      err: e,
    }, '[/api/flow/account/create]');
    throw e;
  }
});

export default router;

