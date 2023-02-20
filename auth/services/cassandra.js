import driver from 'cassandra-driver';

import { logger } from './logger.js';
import constant from '../configurations/constant.js';

const client = new driver.Client(constant.database);

client.on('log', (level, loggerName, message, furtherInfo) => {
  logger.info(`${level} - ${loggerName}:  ${message}`);
});

export {
  client,
  driver,
}
