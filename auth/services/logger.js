import Pino from 'pino';
import os from 'node:os';

import pkg from '../package.json' assert { type: 'json' };
import constant from '../configurations/constant.js';

export const logger = new Pino({
  level: constant.isProduction ? 'trace' : 'info',
  base: {
    app_name: pkg.name,
    app_host: os.hostname(),
  }
})
//https://github.com/pinojs/pino-http/blob/master/logger.js
//https://github.com/marko-js/examples/tree/master/examples/lasso-koa