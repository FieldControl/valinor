import type { FormattedExecutionResult, GraphQLFormattedError } from 'graphql';
interface ObjMap<T> {
    [key: string]: T;
}
export interface GraphQLExperimentalFormattedInitialIncrementalExecutionResult<TData = ObjMap<unknown>, TExtensions = ObjMap<unknown>> extends FormattedExecutionResult<TData, TExtensions> {
    hasNext: boolean;
    incremental?: ReadonlyArray<GraphQLExperimentalFormattedIncrementalResult<TData, TExtensions>>;
    extensions?: TExtensions;
}
export interface GraphQLExperimentalFormattedSubsequentIncrementalExecutionResult<TData = ObjMap<unknown>, TExtensions = ObjMap<unknown>> {
    hasNext: boolean;
    incremental?: ReadonlyArray<GraphQLExperimentalFormattedIncrementalResult<TData, TExtensions>>;
    extensions?: TExtensions;
}
export type GraphQLExperimentalFormattedIncrementalResult<TData = ObjMap<unknown>, TExtensions = ObjMap<unknown>> = GraphQLExperimentalFormattedIncrementalDeferResult<TData, TExtensions> | GraphQLExperimentalFormattedIncrementalStreamResult<TData, TExtensions>;
export interface GraphQLExperimentalFormattedIncrementalDeferResult<TData = ObjMap<unknown>, TExtensions = ObjMap<unknown>> extends FormattedExecutionResult<TData, TExtensions> {
    path?: ReadonlyArray<string | number>;
    label?: string;
}
export interface GraphQLExperimentalFormattedIncrementalStreamResult<TData = Array<unknown>, TExtensions = ObjMap<unknown>> {
    errors?: ReadonlyArray<GraphQLFormattedError>;
    items?: TData | null;
    path?: ReadonlyArray<string | number>;
    label?: string;
    extensions?: TExtensions;
}
export {};
//# sourceMappingURL=incrementalDeliveryPolyfill.d.ts.map