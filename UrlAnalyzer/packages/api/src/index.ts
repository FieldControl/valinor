import 'reflect-metadata';
import { createCache } from 'container/cache.js';
import { createRouter } from 'routes/index.js';
import { createExpressApp } from './container/express.js';
import { createImgurClient } from './container/imgur.js';
import { createPostgres } from './container/postgres.js';
import { createPromRegistry } from './container/prometheus.js';
import { createPuppeteerBrowser } from './container/puppeteer.js';
import { createRedis } from './container/redis.js';
import logger from './logger.js';

createPromRegistry();
logger.success('Prometheus registry created');

createExpressApp();
logger.success('Express app created');

createRedis();
logger.success('Redis client created');

createPostgres();
logger.success('Postgres client created');

createImgurClient();
logger.success('Imgur client created');

createCache();
logger.success('Cache created');

await createPuppeteerBrowser();
logger.success('Puppeteer browser created');

await createRouter();
logger.success('Routes created');
