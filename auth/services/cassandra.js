import driver from 'cassandra-driver';

import { logger } from './logger.js';
import constant from '../configurations/constant.js';

const cql = new driver.Client(constant.database);

cql.on('log', (level, loggerName, message, furtherInfo) => {
  logger.info(`${level} - ${loggerName}:  ${message}`);
});

export {
  cql,
  driver,
}
