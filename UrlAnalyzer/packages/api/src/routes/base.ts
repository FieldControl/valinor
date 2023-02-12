import { createPgMetrics } from '@functions/metrics/createPgMetrics.js';
import { createRedisMetrics } from '@functions/metrics/createRedisMetrics.js';
import { HttpError } from '@structures/httpError.js';
import { errorResponse } from '@utils/respond.js';
import type { Express } from 'express';
import logger from 'logger.js';
import type { Registry } from 'prom-client';
import { container } from 'tsyringe';
import { kExpress, kPrometheus } from '../tokens.js';

export function createBaseRoute() {
	const app = container.resolve<Express>(kExpress);

	app.get('/', (_, res) => {
		res.send({
			message: 'Success',
		});
	});
}

export function fallBackRoute() {
	const app = container.resolve<Express>(kExpress);

	app.all('*', (_, res) => {
		errorResponse(new HttpError(404, 'RouteNotFound'), res);
	});
}

export function metricsRoute() {
	const register = container.resolve<Registry>(kPrometheus);

	const pgMetrics = createPgMetrics();
	const redisMetrics = createRedisMetrics();

	const express = container.resolve<Express>(kExpress);

	express.get('/metrics', async (_, res) => {
		logger.debug('Metrics requested', {
			ip: _.ip,
		});

		await pgMetrics();
		await redisMetrics();

		res.set('Content-Type', register.contentType);
		res.end(await register.metrics());
	});
}

export function faviconRoute() {
	const app = container.resolve<Express>(kExpress);

	app.get('/favicon.ico', (_, res) => {
		res.sendFile('favicon.ico', { root: './public' });
	});
}
