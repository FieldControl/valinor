"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApolloFederationDriver = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const load_package_util_1 = require("@nestjs/common/utils/load-package.util");
const core_1 = require("@nestjs/core");
const graphql_1 = require("@nestjs/graphql");
const plugins_explorer_service_1 = require("../services/plugins-explorer.service");
const apollo_base_driver_1 = require("./apollo-base.driver");
let ApolloFederationDriver = class ApolloFederationDriver extends apollo_base_driver_1.ApolloBaseDriver {
    constructor(graphqlFederationFactory, modulesContainer) {
        super();
        this.graphqlFederationFactory = graphqlFederationFactory;
        this.pluginsExplorerService = new plugins_explorer_service_1.PluginsExplorerService(modulesContainer);
    }
    async start(options) {
        options.plugins = (0, graphql_1.extend)(options.plugins || [], this.pluginsExplorerService.explore(options));
        if (options.definitions && options.definitions.path) {
            const { printSubgraphSchema } = (0, load_package_util_1.loadPackage)('@apollo/subgraph', 'ApolloFederation', () => require('@apollo/subgraph'));
            await this.graphQlFactory.generateDefinitions(printSubgraphSchema(options.schema), options);
        }
        await super.start(options);
        if (options.installSubscriptionHandlers || options.subscriptions) {
            // TL;DR <https://github.com/apollographql/apollo-server/issues/2776>
            throw new Error('No support for subscriptions yet when using Apollo Federation');
        }
    }
    generateSchema(options) {
        return this.graphqlFederationFactory.generateSchema(options);
    }
};
exports.ApolloFederationDriver = ApolloFederationDriver;
exports.ApolloFederationDriver = ApolloFederationDriver = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [graphql_1.GraphQLFederationFactory,
        core_1.ModulesContainer])
], ApolloFederationDriver);
