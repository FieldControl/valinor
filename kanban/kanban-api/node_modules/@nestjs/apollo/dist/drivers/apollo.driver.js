"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApolloDriver = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const graphql_1 = require("@nestjs/graphql");
const graphql_2 = require("graphql");
const plugins_explorer_service_1 = require("../services/plugins-explorer.service");
const apollo_base_driver_1 = require("./apollo-base.driver");
let ApolloDriver = class ApolloDriver extends apollo_base_driver_1.ApolloBaseDriver {
    constructor(modulesContainer) {
        super();
        this.pluginsExplorerService = new plugins_explorer_service_1.PluginsExplorerService(modulesContainer);
    }
    async start(options) {
        options.plugins = (0, graphql_1.extend)(options.plugins || [], this.pluginsExplorerService.explore(options));
        if (options.definitions && options.definitions.path) {
            await this.graphQlFactory.generateDefinitions((0, graphql_2.printSchema)(options.schema), options);
        }
        await this.registerServer(options);
        if (options.installSubscriptionHandlers || options.subscriptions) {
            const subscriptionsOptions = options.subscriptions || { 'subscriptions-transport-ws': {} };
            this._subscriptionService = new graphql_1.GqlSubscriptionService({
                schema: options.schema,
                path: options.path,
                context: options.context,
                ...subscriptionsOptions,
            }, this.httpAdapterHost.httpAdapter?.getHttpServer());
        }
    }
    async registerServer(apolloOptions) {
        const httpAdapter = this.httpAdapterHost.httpAdapter;
        const platformName = httpAdapter.getType();
        if (platformName === 'express') {
            await this.registerExpress(apolloOptions);
        }
        else if (platformName === 'fastify') {
            await this.registerFastify(apolloOptions);
        }
        else {
            throw new Error(`No support for current HttpAdapter: ${platformName}`);
        }
    }
    async stop() {
        await this._subscriptionService?.stop();
        await super.stop();
    }
};
exports.ApolloDriver = ApolloDriver;
exports.ApolloDriver = ApolloDriver = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [core_1.ModulesContainer])
], ApolloDriver);
