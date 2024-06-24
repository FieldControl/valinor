import type { KeyValueCache } from '@apollo/utils.keyvaluecache';
import type { Logger } from '@apollo/utils.logger';
import type { GraphQLError, GraphQLResolveInfo, GraphQLSchema } from 'graphql';
import type { ApolloConfig } from './constructor.js';
import type { BaseContext } from './context.js';
import type { GraphQLResponse } from './graphql.js';
import type { GraphQLExperimentalFormattedSubsequentIncrementalExecutionResult } from './incrementalDeliveryPolyfill.js';
import type { GraphQLRequestContext, GraphQLRequestContextDidEncounterErrors, GraphQLRequestContextDidEncounterSubsequentErrors, GraphQLRequestContextDidResolveOperation, GraphQLRequestContextDidResolveSource, GraphQLRequestContextExecutionDidStart, GraphQLRequestContextParsingDidStart, GraphQLRequestContextResponseForOperation, GraphQLRequestContextValidationDidStart, GraphQLRequestContextWillSendResponse, GraphQLRequestContextWillSendSubsequentPayload } from './requestPipeline.js';
export interface GraphQLServerContext {
    readonly logger: Logger;
    readonly cache: KeyValueCache<string>;
    schema: GraphQLSchema;
    apollo: ApolloConfig;
    startedInBackground: boolean;
}
export interface GraphQLSchemaContext {
    apiSchema: GraphQLSchema;
    coreSupergraphSdl?: string;
}
export interface ApolloServerPlugin<in TContext extends BaseContext = BaseContext> {
    serverWillStart?(service: GraphQLServerContext): Promise<GraphQLServerListener | void>;
    requestDidStart?(requestContext: GraphQLRequestContext<TContext>): Promise<GraphQLRequestListener<TContext> | void>;
    unexpectedErrorProcessingRequest?({ requestContext, error, }: {
        requestContext: GraphQLRequestContext<TContext>;
        error: Error;
    }): Promise<void>;
    contextCreationDidFail?({ error }: {
        error: Error;
    }): Promise<void>;
    invalidRequestWasReceived?({ error }: {
        error: Error;
    }): Promise<void>;
    startupDidFail?({ error }: {
        error: Error;
    }): Promise<void>;
}
export interface GraphQLServerListener {
    schemaDidLoadOrUpdate?(schemaContext: GraphQLSchemaContext): void;
    drainServer?(): Promise<void>;
    serverWillStop?(): Promise<void>;
    renderLandingPage?(): Promise<LandingPage>;
}
export interface LandingPage {
    html: string | (() => Promise<string>);
}
export type GraphQLRequestListenerParsingDidEnd = (err?: Error) => Promise<void>;
export type GraphQLRequestListenerValidationDidEnd = (err?: ReadonlyArray<Error>) => Promise<void>;
export type GraphQLRequestListenerExecutionDidEnd = (err?: Error) => Promise<void>;
export type GraphQLRequestListenerDidResolveField = (error: Error | null, result?: any) => void;
export interface GraphQLRequestListener<TContext extends BaseContext> {
    didResolveSource?(requestContext: GraphQLRequestContextDidResolveSource<TContext>): Promise<void>;
    parsingDidStart?(requestContext: GraphQLRequestContextParsingDidStart<TContext>): Promise<GraphQLRequestListenerParsingDidEnd | void>;
    validationDidStart?(requestContext: GraphQLRequestContextValidationDidStart<TContext>): Promise<GraphQLRequestListenerValidationDidEnd | void>;
    didResolveOperation?(requestContext: GraphQLRequestContextDidResolveOperation<TContext>): Promise<void>;
    didEncounterErrors?(requestContext: GraphQLRequestContextDidEncounterErrors<TContext>): Promise<void>;
    responseForOperation?(requestContext: GraphQLRequestContextResponseForOperation<TContext>): Promise<GraphQLResponse | null>;
    executionDidStart?(requestContext: GraphQLRequestContextExecutionDidStart<TContext>): Promise<GraphQLRequestExecutionListener<TContext> | void>;
    willSendResponse?(requestContext: GraphQLRequestContextWillSendResponse<TContext>): Promise<void>;
    didEncounterSubsequentErrors?(requestContext: GraphQLRequestContextDidEncounterSubsequentErrors<TContext>, errors: ReadonlyArray<GraphQLError>): Promise<void>;
    willSendSubsequentPayload?(requestContext: GraphQLRequestContextWillSendSubsequentPayload<TContext>, payload: GraphQLExperimentalFormattedSubsequentIncrementalExecutionResult): Promise<void>;
}
export type GraphQLFieldResolverParams<TSource, TContext, TArgs = {
    [argName: string]: any;
}> = {
    source: TSource;
    args: TArgs;
    contextValue: TContext;
    info: GraphQLResolveInfo;
};
export interface GraphQLRequestExecutionListener<TContext extends BaseContext> {
    executionDidEnd?: GraphQLRequestListenerExecutionDidEnd;
    willResolveField?(fieldResolverParams: GraphQLFieldResolverParams<any, TContext>): GraphQLRequestListenerDidResolveField | void;
}
//# sourceMappingURL=plugins.d.ts.map