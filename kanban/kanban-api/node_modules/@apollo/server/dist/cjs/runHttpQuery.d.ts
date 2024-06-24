import type { BaseContext, HTTPGraphQLHead, HTTPGraphQLRequest, HTTPGraphQLResponse } from './externalTypes/index.js';
import { type ApolloServer, type ApolloServerInternals, type SchemaDerivedData } from './ApolloServer.js';
import { type FormattedExecutionResult } from 'graphql';
export declare function runHttpQuery<TContext extends BaseContext>({ server, httpRequest, contextValue, schemaDerivedData, internals, sharedResponseHTTPGraphQLHead, }: {
    server: ApolloServer<TContext>;
    httpRequest: HTTPGraphQLRequest;
    contextValue: TContext;
    schemaDerivedData: SchemaDerivedData;
    internals: ApolloServerInternals<TContext>;
    sharedResponseHTTPGraphQLHead: HTTPGraphQLHead | null;
}): Promise<HTTPGraphQLResponse>;
export declare function prettyJSONStringify(value: FormattedExecutionResult): string;
export declare function newHTTPGraphQLHead(status?: number): HTTPGraphQLHead;
export declare function mergeHTTPGraphQLHead(target: HTTPGraphQLHead, source: HTTPGraphQLHead): void;
//# sourceMappingURL=runHttpQuery.d.ts.map