"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LegacyRouteConverter = void 0;
const common_1 = require("@nestjs/common");
const UNSUPPORTED_PATH_MESSAGE = (text, route) => `Unsupported route path: "${route}". In previous versions, the symbols ?, *, and + were used to denote optional or repeating path parameters. The latest version of "path-to-regexp" now requires the use of named parameters. For example, instead of using a route like /users/* to capture all routes starting with "/users", you should use /users/*path. For more details, refer to the migration guide.`;
class LegacyRouteConverter {
    /**
     * Convert legacy routes to the new format (syntax).
     * path-to-regexp used by Express>=v5 and @fastify/middie>=v9 no longer support unnamed wildcards.
     * This method attempts to convert the old syntax to the new one, and logs an error if it fails.
     * @param route The route to convert.
     * @returns The converted route, or the original route if it cannot be converted.
     */
    static tryConvert(route) {
        // Normalize path to eliminate additional conditions.
        const routeWithLeadingSlash = route.startsWith('/') ? route : `/${route}`;
        const normalizedRoute = route.endsWith('/')
            ? routeWithLeadingSlash
            : `${routeWithLeadingSlash}/`;
        if (normalizedRoute.endsWith('/(.*)/')) {
            // Skip printing warning for the "all" wildcard.
            if (normalizedRoute !== '/(.*)/') {
                this.printWarning(route);
            }
            return route.replace('(.*)', '{*path}');
        }
        if (normalizedRoute.endsWith('/*/')) {
            // Skip printing warning for the "all" wildcard.
            if (normalizedRoute !== '/*/') {
                this.printWarning(route);
            }
            return route.replace('*', '{*path}');
        }
        if (normalizedRoute.endsWith('/+/')) {
            this.printWarning(route);
            return route.replace('/+', '/*path');
        }
        return route;
    }
    static printError(route) {
        this.logger.error(UNSUPPORTED_PATH_MESSAGE `${route}`);
    }
    static printWarning(route) {
        this.logger.warn(UNSUPPORTED_PATH_MESSAGE `${route}` + ' Attempting to convert...');
    }
}
exports.LegacyRouteConverter = LegacyRouteConverter;
LegacyRouteConverter.logger = new common_1.Logger(LegacyRouteConverter.name);
