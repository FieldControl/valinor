import type { BaseContext, HTTPGraphQLRequest, HTTPGraphQLResponse } from './externalTypes/index.js';
import type { ApolloServer, ApolloServerInternals, SchemaDerivedData } from './ApolloServer';
export declare function runPotentiallyBatchedHttpQuery<TContext extends BaseContext>(server: ApolloServer<TContext>, httpGraphQLRequest: HTTPGraphQLRequest, contextValue: TContext, schemaDerivedData: SchemaDerivedData, internals: ApolloServerInternals<TContext>): Promise<HTTPGraphQLResponse>;
//# sourceMappingURL=httpBatching.d.ts.map