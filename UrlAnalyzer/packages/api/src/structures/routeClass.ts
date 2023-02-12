import process from 'node:process';
import type { Request, Response, Express } from 'express';
import logger from '../logger.js';

type RoutesMethod = 'delete' | 'get' | 'patch' | 'post' | 'put';

type SubRoutes = Partial<
	Record<
		RoutesMethod,
		{
			handler(req: Request, res: Response): Promise<void>;
			route: string;
		}[]
	>
>;

type NativeHandler = (req: Request, res: Response) => Promise<void>;

export class RouteManager {
	public readonly route: string;

	public readonly subRoutes: SubRoutes;

	public constructor(baseRoute: string, subRoutes?: SubRoutes) {
		this.route = baseRoute;

		this.subRoutes = {
			get: subRoutes?.get ?? [],
			post: subRoutes?.post ?? [],
			put: subRoutes?.put ?? [],
			delete: subRoutes?.delete ?? [],
			patch: subRoutes?.patch ?? [],
		};
	}

	public getRoute(override?: string): string {
		return RouteManager.getBaseApiRoute() + this.route + (override ?? '');
	}

	public registerRoutes(app: Express) {
		for (const method of Object.keys(this.subRoutes) as RoutesMethod[]) {
			const override = this.subRoutes[method];

			if (override?.length) {
				for (const route of override) {
					logger.debug(`Registering subRoute: ${method.toUpperCase()} ${this.getRoute(route.route)}`);
					app[method](this.getRoute(route.route), (route.handler as NativeHandler).bind(this));
				}
			}
		}
	}

	public static getBaseApiRoute(route?: string): string {
		return `/api/v${process.env.API_VERSION!}${route ?? ''}`;
	}
}
