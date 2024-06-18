import type { KeyValueCache } from '@apollo/utils.keyvaluecache';
import type { DocumentNode, ExecutionResult, GraphQLError, GraphQLFormattedError, GraphQLSchema, OperationDefinitionNode } from 'graphql';
import type { Logger } from '@apollo/utils.logger';
import type { Trace } from '@apollo/usage-reporting-protobuf';
import type { FetcherHeaders } from '@apollo/utils.fetcher';
export interface GatewayInterface {
    onSchemaLoadOrUpdate(callback: GatewaySchemaLoadOrUpdateCallback): GatewayUnsubscriber;
    load(options: {
        apollo: GatewayApolloConfig;
    }): Promise<GatewayLoadResult>;
    stop(): Promise<void>;
}
export type GatewaySchemaLoadOrUpdateCallback = (schemaContext: {
    apiSchema: GraphQLSchema;
    coreSupergraphSdl: string;
}) => void;
export type GatewayUnsubscriber = () => void;
export interface GatewayApolloConfig {
    key?: string;
    keyHash?: string;
    graphRef?: string;
}
export interface GatewayLoadResult {
    executor: GatewayExecutor | null;
}
export type GatewayExecutor = (requestContext: GatewayGraphQLRequestContext) => Promise<GatewayExecutionResult>;
export type GatewayExecutionResult = ExecutionResult<Record<string, any>, Record<string, any>>;
export interface GatewayGraphQLRequestContext<TContext = Record<string, any>> {
    readonly request: GatewayGraphQLRequest;
    readonly response?: GatewayGraphQLResponse;
    logger: Logger;
    readonly schema: GraphQLSchema;
    readonly schemaHash: GatewaySchemaHash;
    readonly context: TContext;
    readonly cache: KeyValueCache;
    readonly queryHash: string;
    readonly document: DocumentNode;
    readonly source: string;
    readonly operationName: string | null;
    readonly operation: OperationDefinitionNode;
    readonly errors?: ReadonlyArray<GraphQLError>;
    readonly metrics: GatewayGraphQLRequestMetrics;
    debug?: boolean;
    readonly overallCachePolicy: any;
    readonly requestIsBatched?: boolean;
}
export interface GatewayGraphQLRequest {
    query?: string;
    operationName?: string;
    variables?: Record<string, any>;
    extensions?: Record<string, any>;
    http?: GatewayHTTPRequest;
}
export interface GatewayHTTPRequest {
    readonly method: string;
    readonly url: string;
    readonly headers: FetcherHeaders;
}
export interface GatewayGraphQLResponse {
    data?: Record<string, any> | null;
    errors?: ReadonlyArray<GraphQLFormattedError>;
    extensions?: Record<string, any>;
    http?: GatewayHTTPResponse;
}
export interface GatewayHTTPResponse {
    readonly headers: FetcherHeaders;
    status?: number;
}
export type GatewaySchemaHash = string & {
    __fauxpaque: 'SchemaHash';
};
export interface NonFtv1ErrorPath {
    subgraph: string;
    path: GraphQLError['path'];
}
export interface GatewayGraphQLRequestMetrics {
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
export interface GatewayCachePolicy extends GatewayCacheHint {
    replace(hint: GatewayCacheHint): void;
    restrict(hint: GatewayCacheHint): void;
    policyIfCacheable(): Required<GatewayCacheHint> | null;
}
export interface GatewayCacheHint {
    maxAge?: number;
    scope?: any;
}
//# sourceMappingURL=index.d.ts.map