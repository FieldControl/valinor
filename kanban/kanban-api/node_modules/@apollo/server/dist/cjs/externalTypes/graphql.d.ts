import type { FormattedExecutionResult } from 'graphql';
import type { BaseContext } from './context.js';
import type { HTTPGraphQLHead, HTTPGraphQLRequest } from './http.js';
import type { WithRequired } from '@apollo/utils.withrequired';
import type { GraphQLExperimentalFormattedInitialIncrementalExecutionResult, GraphQLExperimentalFormattedSubsequentIncrementalExecutionResult } from './incrementalDeliveryPolyfill.js';
export interface GraphQLRequest<TVariables extends VariableValues = VariableValues> {
    query?: string;
    operationName?: string;
    variables?: TVariables;
    extensions?: Record<string, any>;
    http?: HTTPGraphQLRequest;
}
export type VariableValues = {
    [name: string]: any;
};
export type GraphQLResponseBody<TData = Record<string, unknown>> = {
    kind: 'single';
    singleResult: FormattedExecutionResult<TData>;
} | {
    kind: 'incremental';
    initialResult: GraphQLExperimentalFormattedInitialIncrementalExecutionResult;
    subsequentResults: AsyncIterable<GraphQLExperimentalFormattedSubsequentIncrementalExecutionResult>;
};
export type GraphQLInProgressResponse<TData = Record<string, unknown>> = {
    http: HTTPGraphQLHead;
    body?: GraphQLResponseBody<TData>;
};
export type GraphQLResponse<TData = Record<string, unknown>> = WithRequired<GraphQLInProgressResponse<TData>, 'body'>;
export interface ExecuteOperationOptions<TContext extends BaseContext> {
    contextValue?: TContext;
}
//# sourceMappingURL=graphql.d.ts.map