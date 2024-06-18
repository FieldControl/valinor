import type { WithRequired } from '@apollo/utils.withrequired';
import type { Trace } from '@apollo/usage-reporting-protobuf';
import type { BaseContext } from './context.js';
import type { GraphQLInProgressResponse, GraphQLRequest, GraphQLResponse } from './graphql.js';
import type { Logger } from '@apollo/utils.logger';
import type { KeyValueCache } from '@apollo/utils.keyvaluecache';
import type { DocumentNode, GraphQLError, GraphQLSchema, OperationDefinitionNode } from 'graphql';
import type { CachePolicy } from '@apollo/cache-control-types';
import type { NonFtv1ErrorPath } from '@apollo/server-gateway-interface';
export interface GraphQLRequestMetrics {
    captureTraces?: boolean;
    persistedQueryHit?: boolean;
    persistedQueryRegister?: boolean;
    responseCacheHit?: boolean;
    forbiddenOperation?: boolean;
    registeredOperation?: boolean;
    startHrTime?: [number, number];
    queryPlanTrace?: Trace.QueryPlanNode;
    nonFtv1ErrorPaths?: NonFtv1ErrorPath[];
}
export interface GraphQLRequestContext<TContext extends BaseContext> {
    readonly logger: Logger;
    readonly cache: KeyValueCache<string>;
    readonly request: GraphQLRequest;
    readonly response: GraphQLInProgressResponse;
    readonly schema: GraphQLSchema;
    readonly contextValue: TContext;
    readonly queryHash?: string;
    readonly document?: DocumentNode;
    readonly source?: string;
    readonly operationName?: string | null;
    readonly operation?: OperationDefinitionNode;
    readonly errors?: ReadonlyArray<GraphQLError>;
    readonly metrics: GraphQLRequestMetrics;
    readonly overallCachePolicy: CachePolicy;
    readonly requestIsBatched: boolean;
}
export type GraphQLRequestContextDidResolveSource<TContext extends BaseContext> = WithRequired<GraphQLRequestContext<TContext>, 'source' | 'queryHash'>;
export type GraphQLRequestContextParsingDidStart<TContext extends BaseContext> = GraphQLRequestContextDidResolveSource<TContext>;
export type GraphQLRequestContextValidationDidStart<TContext extends BaseContext> = GraphQLRequestContextParsingDidStart<TContext> & WithRequired<GraphQLRequestContext<TContext>, 'document'>;
export type GraphQLRequestContextDidResolveOperation<TContext extends BaseContext> = GraphQLRequestContextValidationDidStart<TContext> & WithRequired<GraphQLRequestContext<TContext>, 'operationName'>;
export type GraphQLRequestContextDidEncounterErrors<TContext extends BaseContext> = WithRequired<GraphQLRequestContext<TContext>, 'errors'>;
export type GraphQLRequestContextResponseForOperation<TContext extends BaseContext> = WithRequired<GraphQLRequestContext<TContext>, 'source' | 'document' | 'operation' | 'operationName'>;
export type GraphQLRequestContextExecutionDidStart<TContext extends BaseContext> = GraphQLRequestContextParsingDidStart<TContext> & WithRequired<GraphQLRequestContext<TContext>, 'document' | 'operation' | 'operationName'>;
export type GraphQLRequestContextWillSendResponse<TContext extends BaseContext> = GraphQLRequestContextDidResolveSource<TContext> & {
    readonly response: GraphQLResponse;
};
export type GraphQLRequestContextDidEncounterSubsequentErrors<TContext extends BaseContext> = GraphQLRequestContextWillSendResponse<TContext>;
export type GraphQLRequestContextWillSendSubsequentPayload<TContext extends BaseContext> = GraphQLRequestContextWillSendResponse<TContext>;
//# sourceMappingURL=requestPipeline.d.ts.map