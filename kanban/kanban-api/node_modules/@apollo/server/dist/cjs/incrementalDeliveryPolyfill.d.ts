import { type ExecutionArgs, type ExecutionResult, type GraphQLError } from 'graphql';
interface ObjMap<T> {
    [key: string]: T;
}
export interface GraphQLExperimentalInitialIncrementalExecutionResult<TData = ObjMap<unknown>, TExtensions = ObjMap<unknown>> extends ExecutionResult<TData, TExtensions> {
    hasNext: boolean;
    incremental?: ReadonlyArray<GraphQLExperimentalIncrementalResult<TData, TExtensions>>;
    extensions?: TExtensions;
}
export interface GraphQLExperimentalSubsequentIncrementalExecutionResult<TData = ObjMap<unknown>, TExtensions = ObjMap<unknown>> {
    hasNext: boolean;
    incremental?: ReadonlyArray<GraphQLExperimentalIncrementalResult<TData, TExtensions>>;
    extensions?: TExtensions;
}
type GraphQLExperimentalIncrementalResult<TData = ObjMap<unknown>, TExtensions = ObjMap<unknown>> = GraphQLExperimentalIncrementalDeferResult<TData, TExtensions> | GraphQLExperimentalIncrementalStreamResult<TData, TExtensions>;
interface GraphQLExperimentalIncrementalDeferResult<TData = ObjMap<unknown>, TExtensions = ObjMap<unknown>> extends ExecutionResult<TData, TExtensions> {
    path?: ReadonlyArray<string | number>;
    label?: string;
}
interface GraphQLExperimentalIncrementalStreamResult<TData = Array<unknown>, TExtensions = ObjMap<unknown>> {
    errors?: ReadonlyArray<GraphQLError>;
    items?: TData | null;
    path?: ReadonlyArray<string | number>;
    label?: string;
    extensions?: TExtensions;
}
export interface GraphQLExperimentalIncrementalExecutionResults<TData = ObjMap<unknown>, TExtensions = ObjMap<unknown>> {
    initialResult: GraphQLExperimentalInitialIncrementalExecutionResult<TData, TExtensions>;
    subsequentResults: AsyncGenerator<GraphQLExperimentalSubsequentIncrementalExecutionResult<TData, TExtensions>, void, void>;
}
export declare function executeIncrementally(args: ExecutionArgs): Promise<ExecutionResult | GraphQLExperimentalIncrementalExecutionResults>;
export {};
//# sourceMappingURL=incrementalDeliveryPolyfill.d.ts.map