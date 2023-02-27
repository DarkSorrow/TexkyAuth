import Provider from 'oidc-provider';
import { randomUUID } from 'crypto';
import mount from "koa-mount";
import serve from "koa-static";
import { configure } from "lasso";
/*import { promisify } from 'util';
// revisit after to create rules with clients origins
import helmet from 'helmet';*/
//pm2 start app.js --node-args="-r esm"
import * as cassandra from './services/cassandra.js';
import { redisClient } from './services/redis.js';
import { flowClient } from './services/flow.js';
import { logger } from './services/logger.js';
import oidcConfig from './configurations/oidc.js';
import constant from './configurations/constant.js';
import { LANGUAGE_LIST, i18nInstances, setRequestLanguage } from './services/i18n.js';
import DefaultAdapter from './adapters/default_adapter.js';
import loginFlow from './pages/login-flow/index.js';
import homeRouter from './pages/home/index.js';
import socialRouter from './pages/social/index.js';
import apiApplicationRouter from './api/application.js';
import apiFlowRouter from './api/flow.js';
import apiSubjectRouter from './api/subject.js';
import errors from './services/error.js';

//Configure lasso bundle for marko templates
configure({
  plugins: [
    "lasso-marko", // Allow Marko templates to be compiled and transported to the browser,
    "lasso-sass"
  ],
  outputDir: "static",
  /*bundles: [
    {
      name: "pico",
      dependencies: [
        "require: @picocss/pico",
      ]
    }
  ],*/
  minify: constant.isProduction, // Only minify JS and CSS code in production
  bundlingEnabled: constant.isProduction, // Only enable bundling in production
  fingerprintsEnabled: constant.isProduction // Only add fingerprints to URLs in production
});

/*const directives = helmet.contentSecurityPolicy.getDefaultDirectives();
delete directives['form-action'];
const pHelmet = promisify(helmet({
  contentSecurityPolicy: {
    useDefaults: false,
    directives,
  },
}));*/

//Configure koa access with oidc
const provider = new Provider(constant.issuer, { DefaultAdapter, ...oidcConfig });
function handleClientAuthErrors(ctx, err) {
  logger.error({
    err,
    client: ctx.oidc.client,
    body: ctx.oidc.body,
    authorization: ctx.headers.authorization
  }, 'Client auth error')
  // console.log(err);
  //{ headers: { authorization }, oidc: { body, client } }
  // save error details out-of-bands for the client developers, `authorization`, `body`, `client`
  // are just some details available, you can dig in ctx object for more.
}
provider.on('grant.error', handleClientAuthErrors);
provider.on('introspection.error', handleClientAuthErrors);
provider.on('revocation.error', handleClientAuthErrors);

// Adding services
provider.app.context.log = logger;
provider.app.context.cassandra = cassandra;
provider.app.context.redis = redisClient;
provider.app.context.flow = flowClient;
provider.app.context.errors = errors;

// Before logging information
provider.use(mount("/static", serve("static")));

provider.use(async (ctx, next) => { // loggin calls, use for metrics?
  const start = Date.now();
  //await pHelmet(ctx.req, ctx.res);
  ctx.request.app_rid = (ctx.request.header['x-req-id']) ? ctx.request.header['x-req-id'] : randomUUID();
  // Language construction part
  const lang = setRequestLanguage(ctx);
  ctx.state.t = i18nInstances[lang].t; // don't push the main object so it doesn't get changed
  ctx.state.lang = lang;
  ctx.state.html = {
    lang,
    dir: LANGUAGE_LIST[lang].d || 'ltr',
  }
  // end of language construction
  await next();
  // Logging the result of the request
  logger[(ctx.response.status < 500) ? 'info' : 'error']({
    app_rid: ctx.request.app_rid,
    app_sub: ctx.request.app_sub || '',
    app_client: ctx.request.app_client || '',
    method: ctx.request.method,
    url: ctx.request.url,
    ip: ctx.request.ip,
    respTime: Date.now() - start,
    status: ctx.response.status,
    // Only for test purpose in hackathon
    //body: ctx.request.body,
    //query: ctx.request.query,
  }, '');
});

if (constant.isProduction) {
  provider.proxy = true;
  set(configuration, 'cookies.short.secure', true);
  set(configuration, 'cookies.long.secure', true);

  provider.use(async (ctx, next) => {
    if (ctx.secure) {
      await next();
    } else if (ctx.method === 'GET' || ctx.method === 'HEAD') {
      ctx.status = 303;
      ctx.redirect(ctx.href.replace(/^http:\/\//i, 'https://'));
    } else {
      ctx.body = {
        error: 'invalid_request',
        error_description: 'do yourself a favor and only use https',
      };
      ctx.status = 400;
    }
  });
}

// Add the routes
provider.use(loginFlow(provider).routes());
provider.use(socialRouter(provider).routes());
provider.use(homeRouter.routes());
provider.use(apiApplicationRouter.routes());
provider.use(apiFlowRouter.routes());
provider.use(apiSubjectRouter.routes());
// Start the server
const server = provider.listen(constant.port, () => {
  logger.warn(`oidc-provider listening on port ${constant.port}, check ${constant.issuer}/.well-known/openid-configuration`);
  let graceful = false;
  function gracefulExit() {
    if (graceful) {
      return ;
    }
    graceful = true;
    logger.warn('[App::gracefulExit] Received kill signal (SIGTERM|SIGINT), shutting down...');
    if (!constant.isProduction) {
      process.exit(0);
    }
    setTimeout(() => {
      logger.error('[App::gracefulExit] Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 8000);
    server.close(async (err) => {
      if (err) {
        logger.error({ err }, '[App::gracefulExit] Closed with error');
      } else {
        logger.info('[App::gracefulExit] Closed out remaining connections');
      }
    });
  }
  process.on('SIGTERM', gracefulExit);
  process.on('SIGINT', gracefulExit);

  if (process.send) {
    process.send("online");
  }
});

// https://github.com/TarekRaafat/autoComplete.js
// https://picocss.com/examples/sign-in/