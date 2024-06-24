import type { GraphQLRequestContext, BaseContext, GraphQLResponse } from './externalTypes/index.js';
import type { ApolloServer, ApolloServerInternals, SchemaDerivedData } from './ApolloServer.js';
export declare const APQ_CACHE_PREFIX = "apq:";
type Mutable<T> = {
    -readonly [P in keyof T]: T[P];
};
export declare function processGraphQLRequest<TContext extends BaseContext>(schemaDerivedData: SchemaDerivedData, server: ApolloServer<TContext>, internals: ApolloServerInternals<TContext>, requestContext: Mutable<GraphQLRequestContext<TContext>>): Promise<GraphQLResponse>;
export {};
//# sourceMappingURL=requestPipeline.d.ts.map