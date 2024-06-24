import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { ModulesContainer } from '@nestjs/core/injector/modules-container';
import { BaseExplorerService, GqlModuleOptions } from '@nestjs/graphql';
export declare class PluginsExplorerService extends BaseExplorerService {
    private readonly modulesContainer;
    constructor(modulesContainer: ModulesContainer);
    explore(options: GqlModuleOptions): any[];
    filterPlugins<T = any>(wrapper: InstanceWrapper<T>): T;
}
//# sourceMappingURL=plugins-explorer.service.d.ts.map