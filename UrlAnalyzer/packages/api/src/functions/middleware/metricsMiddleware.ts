import process from 'node:process';
import { clearMetricUrl } from '@utils/clearMetricUrl.js';
import type { NextFunction, Request, Response } from 'express';
import { Counter, Histogram } from 'prom-client';
import logger from '../../logger.js';

export function createMetricsMiddleware() {
	const httpRequestDurationMicroseconds = new Histogram({
		name: 'url_analyzer_api_http_request_duration_microseconds',
		help: 'Duration of HTTP requests in ms',
		labelNames: ['method', 'route', 'status', 'static'],
		buckets: [0.1, 5, 15, 50, 100, 500],
	});

	const httpEndpointCounter = new Counter({
		name: 'url_analyzer_api_http_endpoint_counter',
		help: 'Number of HTTP requests',
		labelNames: ['method', 'route', 'status', 'static'],
	});

	return async (req: Request, res: Response, next: NextFunction) => {
		const start = process.hrtime();

		res.on('finish', () => {
			const elapsed = process.hrtime(start);
			const elapsedMs = elapsed[0] * 1e3 + elapsed[1] * 1e-6;

			const cleanUrl = clearMetricUrl(req.url);

			logger.info('Request finished', {
				method: req.method,
				url: cleanUrl,
				status: res.statusCode,
				elapsed: elapsedMs,
				isStatic: !req.url.startsWith('/api'),
				ip: req.ip,
				UserAgent: req.headers['user-agent'],
			});

			httpEndpointCounter
				.labels(req.method, cleanUrl, res.statusCode.toString(), String(!req.url.startsWith('/api')))
				.inc();

			httpRequestDurationMicroseconds
				.labels(req.method, cleanUrl, res.statusCode.toString(), String(!req.url.startsWith('/api')))
				.observe(elapsedMs);
		});

		next();
	};
}
