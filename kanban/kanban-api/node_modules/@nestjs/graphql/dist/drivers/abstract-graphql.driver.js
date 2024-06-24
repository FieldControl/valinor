"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractGraphQLDriver = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const graphql_factory_1 = require("../graphql.factory");
const utils_1 = require("../utils");
class AbstractGraphQLDriver {
    async mergeDefaultOptions(options, defaults = {
        path: '/graphql',
        fieldResolverEnhancers: [],
    }) {
        const clonedOptions = {
            ...defaults,
            ...options,
        };
        clonedOptions.path =
            this.getNormalizedPath(clonedOptions);
        return clonedOptions;
    }
    generateSchema(options) {
        return this.graphQlFactory.generateSchema(options);
    }
    subscriptionWithFilter(instanceRef, filterFn, createSubscribeContext) {
        return createSubscribeContext();
    }
    getNormalizedPath(options) {
        const prefix = this.applicationConfig?.getGlobalPrefix() ?? '';
        const useGlobalPrefix = prefix && options.useGlobalPrefix;
        const gqlOptionsPath = (0, utils_1.normalizeRoutePath)(options.path);
        return useGlobalPrefix
            ? (0, utils_1.normalizeRoutePath)(prefix) + gqlOptionsPath
            : gqlOptionsPath;
    }
}
exports.AbstractGraphQLDriver = AbstractGraphQLDriver;
tslib_1.__decorate([
    (0, common_1.Inject)(),
    tslib_1.__metadata("design:type", core_1.HttpAdapterHost)
], AbstractGraphQLDriver.prototype, "httpAdapterHost", void 0);
tslib_1.__decorate([
    (0, common_1.Inject)(),
    tslib_1.__metadata("design:type", core_1.ApplicationConfig)
], AbstractGraphQLDriver.prototype, "applicationConfig", void 0);
tslib_1.__decorate([
    (0, common_1.Inject)(),
    tslib_1.__metadata("design:type", graphql_factory_1.GraphQLFactory)
], AbstractGraphQLDriver.prototype, "graphQlFactory", void 0);
