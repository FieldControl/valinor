import { readFileSync } from 'node:fs';
import { createServer as createHttpServer } from 'node:http';
import { createServer as createHttpsServer } from 'node:https';
import process from 'node:process';
import { URL } from 'node:url';
import { commonFunctionsMiddleware } from '@functions/middleware/commonFunctions.js';
import { createJsonValidatorMiddleware } from '@functions/middleware/jsonValidator.js';
import { createMetricsMiddleware } from '@functions/middleware/metricsMiddleware.js';
import { createRequestValidatorMiddleware } from '@functions/middleware/requestValidator.js';
import { globToRegex } from '@utils/globToRegex.js';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { container } from 'tsyringe';
import logger from '../logger.js';
import { kExpress } from '../tokens.js';

export function createExpressApp() {
	const app = express();

	const cert = readFileSync(new URL('../../../../url_analyzer_selfsigned.crt', import.meta.url));
	const key = readFileSync(new URL('../../../../url_analyzer_selfsigned.key', import.meta.url));

	const credentials = {
		cert,
		key,
	};

	const middlewares = [
		// Responsible for CORS
		cors(),
		// Responsible for adding security headers
		helmet(),
		// Responsible for tracking metrics
		createMetricsMiddleware(),
		// Responsible for validating the request
		createRequestValidatorMiddleware(),
		// Responsible for validating the body
		createJsonValidatorMiddleware({
			allowEmptyBody: false,
			methods: ['POST', 'PUT', 'PATCH'],
		}),
		// Responsible for authenticating the user
		commonFunctionsMiddleware({
			noAuthRoutes: ['/metrics', '/api/v1/oauth2/*', '/api/v1/scan/*'].map((route) => globToRegex(route)),
		}),
	];

	for (const middleware of middlewares) {
		app.use(middleware);
	}

	const httpServer = createHttpServer(app);
	httpServer.listen(process.env.PORT ?? 3_000);

	const httpsServer = createHttpsServer(credentials, app);
	httpsServer.listen(process.env.HTTPS_PORT ?? 8_080);

	// Set port
	logger.info(`[HTTP] - Express app listening on port ${process.env.PORT ?? 3_000}`);
	logger.info(`[HTTPS] - Express app listening on port ${process.env.HTTPS_PORT ?? 8_080}`);

	container.register(kExpress, { useValue: app });
}
