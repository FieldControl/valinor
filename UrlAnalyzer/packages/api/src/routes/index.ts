import { readdirSync } from 'node:fs';
import { URL } from 'node:url';
import { RouteManager } from '@structures/routeClass.js';
import { dynamicImport } from '@utils/dynamicImport.js';
import type { Express } from 'express';
import { container } from 'tsyringe';
import logger from '../logger.js';
import { kExpress } from '../tokens.js';
import { createBaseRoute, fallBackRoute, faviconRoute, metricsRoute } from './base.js';

export async function createRouter() {
	const app = container.resolve<Express>(kExpress);

	createBaseRoute();
	logger.info('Base route created');

	faviconRoute();
	logger.info('Favicon route created');

	metricsRoute();
	logger.info('Metrics route created');

	const paths = readdirSync(new URL('paths', import.meta.url)).filter((path) => path.endsWith('.js'));

	logger.debug(`Found ${paths.length} routes`, paths);

	for (const path of paths) {
		const pathUrl = new URL(`paths/${path}`, import.meta.url).href;

		logger.debug(`Creating route ${path}`, pathUrl);

		const dynamic = dynamicImport<new () => RouteManager>(async () => import(pathUrl));
		const RouteManagerClass = container.resolve<RouteManager>((await dynamic()).default);

		if (!RouteManager) {
			logger.warn(`Route ${path} does not export a RouteManager extended class`);
			continue;
		}

		RouteManagerClass.registerRoutes(app);
		logger.info(`Route ${path} created`);
	}

	fallBackRoute();
	logger.info('Fallback route created');
}
