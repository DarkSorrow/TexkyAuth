import Redis from 'ioredis';

import { logger } from './logger.js';
import constant from '../configurations/constant.js';

const redisClient = new Redis(constant.redis_cluster);
redisClient.on('ready', () => {
  logger.warn({}, '[redis::init:ready]');
});

//With cluster the log with node should work
//const redisClient = new Redis.Cluster(env.redis_cluster);
redisClient.on('node error', (error, key) => {
  logger.error({ key, ...error }, '[redis::init:nodeError]');
});
redisClient.on('error', (error) => {
  logger.error(error, '[redis::init:error]');
});

redisClient.on('+node', (redis) => {
  logger.warn({ host: redis.options.host, port: redis.options.port, role: redis.options.role }, '[redis::init:+node]');
});

redisClient.on('-node', (redis) => {
  logger.warn({ host: redis.options.host, port: redis.options.port, role: redis.options.role }, '[redis::init:-node]');
});

redisClient.on('reconnecting', (timeReconnectiong) => {
  logger.warn('[redis::init:-reconnecting]', timeReconnectiong);
});

export { redisClient }