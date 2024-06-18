"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouteInfoPathExtractor = void 0;
const common_1 = require("@nestjs/common");
const shared_utils_1 = require("@nestjs/common/utils/shared.utils");
const utils_1 = require("../router/utils");
const route_path_factory_1 = require("./../router/route-path-factory");
class RouteInfoPathExtractor {
    constructor(applicationConfig) {
        this.applicationConfig = applicationConfig;
        this.routePathFactory = new route_path_factory_1.RoutePathFactory(applicationConfig);
        this.prefixPath = (0, shared_utils_1.stripEndSlash)((0, shared_utils_1.addLeadingSlash)(this.applicationConfig.getGlobalPrefix()));
        this.excludedGlobalPrefixRoutes =
            this.applicationConfig.getGlobalPrefixOptions().exclude;
        this.versioningConfig = this.applicationConfig.getVersioning();
    }
    extractPathsFrom({ path, method, version }) {
        const versionPaths = this.extractVersionPathFrom(version);
        if (this.isAWildcard(path)) {
            const entries = versionPaths.length > 0
                ? versionPaths
                    .map(versionPath => [
                    this.prefixPath + versionPath + '$',
                    this.prefixPath + versionPath + (0, shared_utils_1.addLeadingSlash)(path),
                ])
                    .flat()
                : this.prefixPath
                    ? [this.prefixPath + '$', this.prefixPath + (0, shared_utils_1.addLeadingSlash)(path)]
                    : [(0, shared_utils_1.addLeadingSlash)(path)];
            return Array.isArray(this.excludedGlobalPrefixRoutes)
                ? [
                    ...entries,
                    ...this.excludedGlobalPrefixRoutes.map(route => versionPaths + (0, shared_utils_1.addLeadingSlash)(route.path)),
                ]
                : entries;
        }
        return this.extractNonWildcardPathsFrom({ path, method, version });
    }
    extractPathFrom(route) {
        if (this.isAWildcard(route.path) && !route.version) {
            return [(0, shared_utils_1.addLeadingSlash)(route.path)];
        }
        return this.extractNonWildcardPathsFrom(route);
    }
    isAWildcard(path) {
        return ['*', '/*', '/*/', '(.*)', '/(.*)'].includes(path);
    }
    extractNonWildcardPathsFrom({ path, method, version, }) {
        const versionPaths = this.extractVersionPathFrom(version);
        if (Array.isArray(this.excludedGlobalPrefixRoutes) &&
            (0, utils_1.isRouteExcluded)(this.excludedGlobalPrefixRoutes, path, method)) {
            if (!versionPaths.length) {
                return [(0, shared_utils_1.addLeadingSlash)(path)];
            }
            return versionPaths.map(versionPath => versionPath + (0, shared_utils_1.addLeadingSlash)(path));
        }
        if (!versionPaths.length) {
            return [this.prefixPath + (0, shared_utils_1.addLeadingSlash)(path)];
        }
        return versionPaths.map(versionPath => this.prefixPath + versionPath + (0, shared_utils_1.addLeadingSlash)(path));
    }
    extractVersionPathFrom(versionValue) {
        if (!versionValue || this.versioningConfig?.type !== common_1.VersioningType.URI)
            return [];
        const versionPrefix = this.routePathFactory.getVersionPrefix(this.versioningConfig);
        if (Array.isArray(versionValue)) {
            return versionValue.map(version => (0, shared_utils_1.addLeadingSlash)(versionPrefix + version.toString()));
        }
        return [(0, shared_utils_1.addLeadingSlash)(versionPrefix + versionValue.toString())];
    }
}
exports.RouteInfoPathExtractor = RouteInfoPathExtractor;
