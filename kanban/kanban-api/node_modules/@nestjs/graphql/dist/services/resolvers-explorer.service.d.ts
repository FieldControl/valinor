import { MetadataScanner, ModuleRef, ModulesContainer } from '@nestjs/core';
import { ExternalContextCreator } from '@nestjs/core/helpers/external-context-creator';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { Module } from '@nestjs/core/injector/module';
import { SerializedGraph } from '@nestjs/core/inspector/serialized-graph';
import { SubscriptionOptions } from '../decorators/subscription.decorator';
import { AbstractGraphQLDriver } from '../drivers/abstract-graphql.driver';
import { GqlModuleOptions } from '../interfaces';
import { ResolverMetadata } from '../interfaces/resolver-metadata.interface';
import { BaseExplorerService } from './base-explorer.service';
export declare class ResolversExplorerService extends BaseExplorerService {
    private readonly modulesContainer;
    private readonly metadataScanner;
    private readonly externalContextCreator;
    private readonly gqlOptions;
    private readonly moduleRef;
    private readonly serializedGraph;
    private readonly logger;
    private readonly gqlParamsFactory;
    private readonly injector;
    constructor(modulesContainer: ModulesContainer, metadataScanner: MetadataScanner, externalContextCreator: ExternalContextCreator, gqlOptions: GqlModuleOptions, moduleRef: ModuleRef, serializedGraph: SerializedGraph);
    explore(): any;
    filterResolvers(gqlAdapter: AbstractGraphQLDriver, wrapper: InstanceWrapper, moduleRef: Module): ResolverMetadata[];
    createContextCallback<T extends Record<string, any>>(instance: T, prototype: any, wrapper: InstanceWrapper, moduleRef: Module, resolver: ResolverMetadata, isRequestScoped: boolean, transform?: Function): Function;
    createSubscriptionMetadata(gqlAdapter: AbstractGraphQLDriver, createSubscribeContext: Function, subscriptionOptions: SubscriptionOptions, resolverMetadata: ResolverMetadata, instanceRef: Record<string, any>): {
        callback: {
            subscribe: any;
            resolve: any;
        };
        name: string;
        type: string;
        methodName: string;
    };
    getAllCtors(): Function[];
    private mapToCtor;
    private registerContextProvider;
    private registerFieldMiddlewareIfExists;
    private getContextId;
    private assignResolverConstructorUniqueId;
}
//# sourceMappingURL=resolvers-explorer.service.d.ts.map