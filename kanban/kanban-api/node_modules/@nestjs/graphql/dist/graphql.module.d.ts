import { DynamicModule, OnModuleDestroy, OnModuleInit } from '@nestjs/common/interfaces';
import { HttpAdapterHost } from '@nestjs/core';
import { AbstractGraphQLDriver } from './drivers/abstract-graphql.driver';
import { GraphQLSchemaHost } from './graphql-schema.host';
import { GraphQLTypesLoader } from './graphql-types.loader';
import { GqlModuleAsyncOptions, GqlModuleOptions, GqlOptionsFactory } from './interfaces/gql-module-options.interface';
export declare class GraphQLModule<TAdapter extends AbstractGraphQLDriver = AbstractGraphQLDriver> implements OnModuleInit, OnModuleDestroy {
    private readonly httpAdapterHost;
    private readonly options;
    private readonly _graphQlAdapter;
    private readonly graphQlTypesLoader;
    private readonly gqlSchemaHost;
    private static readonly logger;
    private readonly metadataLoader;
    get graphQlAdapter(): TAdapter;
    constructor(httpAdapterHost: HttpAdapterHost, options: GqlModuleOptions, _graphQlAdapter: AbstractGraphQLDriver, graphQlTypesLoader: GraphQLTypesLoader, gqlSchemaHost: GraphQLSchemaHost);
    onModuleDestroy(): Promise<void>;
    static forRoot<TOptions extends Record<string, any> = GqlModuleOptions>(options?: TOptions): DynamicModule;
    static forRootAsync<TOptions extends Record<string, any> = GqlModuleOptions>(options: GqlModuleAsyncOptions<TOptions, GqlOptionsFactory<TOptions>>): DynamicModule;
    private static createAsyncProviders;
    private static createAsyncOptionsProvider;
    onModuleInit(): Promise<void>;
    private static assertDriver;
}
//# sourceMappingURL=graphql.module.d.ts.map