"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginsExplorerService = void 0;
const graphql_1 = require("@nestjs/graphql");
const constants_1 = require("../constants");
class PluginsExplorerService extends graphql_1.BaseExplorerService {
    constructor(modulesContainer) {
        super();
        this.modulesContainer = modulesContainer;
    }
    explore(options) {
        const modules = this.getModules(this.modulesContainer, options.include || []);
        return this.flatMap(modules, (instance) => this.filterPlugins(instance));
    }
    filterPlugins(wrapper) {
        const { instance } = wrapper;
        if (!instance) {
            return undefined;
        }
        const metadata = Reflect.getMetadata(constants_1.PLUGIN_METADATA, instance.constructor);
        return metadata ? instance : undefined;
    }
}
exports.PluginsExplorerService = PluginsExplorerService;
