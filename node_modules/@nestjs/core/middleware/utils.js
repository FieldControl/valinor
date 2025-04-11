"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapToClass = exports.filterMiddleware = exports.mapToExcludeRoute = void 0;
exports.isMiddlewareClass = isMiddlewareClass;
exports.assignToken = assignToken;
exports.isMiddlewareRouteExcluded = isMiddlewareRouteExcluded;
const common_1 = require("@nestjs/common");
const shared_utils_1 = require("@nestjs/common/utils/shared.utils");
const iterare_1 = require("iterare");
const path_to_regexp_1 = require("path-to-regexp");
const uid_1 = require("uid");
const legacy_route_converter_1 = require("../router/legacy-route-converter");
const utils_1 = require("../router/utils");
const mapToExcludeRoute = (routes) => {
    return routes.map(route => {
        const originalPath = (0, shared_utils_1.isString)(route) ? route : route.path;
        const path = legacy_route_converter_1.LegacyRouteConverter.tryConvert(originalPath);
        try {
            if ((0, shared_utils_1.isString)(route)) {
                return {
                    path,
                    requestMethod: common_1.RequestMethod.ALL,
                    pathRegex: (0, path_to_regexp_1.pathToRegexp)((0, shared_utils_1.addLeadingSlash)(path)).regexp,
                };
            }
            return {
                path,
                requestMethod: route.method,
                pathRegex: (0, path_to_regexp_1.pathToRegexp)((0, shared_utils_1.addLeadingSlash)(path)).regexp,
            };
        }
        catch (e) {
            if (e instanceof TypeError) {
                legacy_route_converter_1.LegacyRouteConverter.printError(originalPath);
            }
            throw e;
        }
    });
};
exports.mapToExcludeRoute = mapToExcludeRoute;
const filterMiddleware = (middleware, routes, httpAdapter) => {
    const excludedRoutes = (0, exports.mapToExcludeRoute)(routes);
    return (0, iterare_1.iterate)([])
        .concat(middleware)
        .filter(shared_utils_1.isFunction)
        .map((item) => (0, exports.mapToClass)(item, excludedRoutes, httpAdapter))
        .toArray();
};
exports.filterMiddleware = filterMiddleware;
const mapToClass = (middleware, excludedRoutes, httpAdapter) => {
    if (isMiddlewareClass(middleware)) {
        if (excludedRoutes.length <= 0) {
            return middleware;
        }
        const MiddlewareHost = class extends middleware {
            use(...params) {
                const [req, _, next] = params;
                const isExcluded = isMiddlewareRouteExcluded(req, excludedRoutes, httpAdapter);
                if (isExcluded) {
                    return next();
                }
                return super.use(...params);
            }
        };
        return assignToken(MiddlewareHost, middleware.name);
    }
    return assignToken(class {
        constructor() {
            this.use = (...params) => {
                const [req, _, next] = params;
                const isExcluded = isMiddlewareRouteExcluded(req, excludedRoutes, httpAdapter);
                if (isExcluded) {
                    return next();
                }
                return middleware(...params);
            };
        }
    });
};
exports.mapToClass = mapToClass;
function isMiddlewareClass(middleware) {
    const middlewareStr = middleware.toString();
    if (middlewareStr.substring(0, 5) === 'class') {
        return true;
    }
    const middlewareArr = middlewareStr.split(' ');
    return (middlewareArr[0] === 'function' &&
        /[A-Z]/.test(middlewareArr[1]?.[0]) &&
        (0, shared_utils_1.isFunction)(middleware.prototype?.use));
}
function assignToken(metatype, token = (0, uid_1.uid)(21)) {
    Object.defineProperty(metatype, 'name', { value: token });
    return metatype;
}
function isMiddlewareRouteExcluded(req, excludedRoutes, httpAdapter) {
    if (excludedRoutes.length <= 0) {
        return false;
    }
    const reqMethod = httpAdapter.getRequestMethod(req);
    const originalUrl = httpAdapter.getRequestUrl(req);
    const queryParamsIndex = originalUrl ? originalUrl.indexOf('?') : -1;
    const pathname = queryParamsIndex >= 0
        ? originalUrl.slice(0, queryParamsIndex)
        : originalUrl;
    return (0, utils_1.isRouteExcluded)(excludedRoutes, pathname, common_1.RequestMethod[reqMethod]);
}
