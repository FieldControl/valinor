"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApolloGatewayDriver = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const load_package_util_1 = require("@nestjs/common/utils/load-package.util");
const core_1 = require("@nestjs/core");
const graphql_1 = require("@nestjs/graphql");
const plugins_explorer_service_1 = require("../services/plugins-explorer.service");
const apollo_base_driver_1 = require("./apollo-base.driver");
let ApolloGatewayDriver = class ApolloGatewayDriver extends apollo_base_driver_1.ApolloBaseDriver {
    constructor(modulesContainer) {
        super();
        this.pluginsExplorerService = new plugins_explorer_service_1.PluginsExplorerService(modulesContainer);
    }
    async start(options) {
        options.server.plugins = (0, graphql_1.extend)(options.server.plugins || [], this.pluginsExplorerService.explore(options));
        const { ApolloGateway } = (0, load_package_util_1.loadPackage)('@apollo/gateway', 'ApolloGateway', () => require('@apollo/gateway'));
        const { server: serverOpts = {}, gateway: gatewayOpts = {} } = options;
        const gateway = new ApolloGateway(gatewayOpts);
        await super.start({
            ...serverOpts,
            gateway,
        });
    }
    async mergeDefaultOptions(options) {
        return {
            ...options,
            server: await super.mergeDefaultOptions(options?.server ?? {}),
        };
    }
    generateSchema(_) {
        return null;
    }
};
exports.ApolloGatewayDriver = ApolloGatewayDriver;
exports.ApolloGatewayDriver = ApolloGatewayDriver = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [core_1.ModulesContainer])
], ApolloGatewayDriver);
