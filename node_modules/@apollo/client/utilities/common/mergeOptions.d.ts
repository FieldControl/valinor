import type { QueryOptions, WatchQueryOptions, MutationOptions, OperationVariables } from "../../core";
type OptionsUnion<TData, TVariables extends OperationVariables, TContext> = WatchQueryOptions<TVariables, TData> | QueryOptions<TVariables, TData> | MutationOptions<TData, TVariables, TContext>;
export declare function mergeOptions<TOptions extends Partial<OptionsUnion<any, any, any>>>(defaults: TOptions | Partial<TOptions> | undefined, options: TOptions | Partial<TOptions>): TOptions;
export {};
//# sourceMappingURL=mergeOptions.d.ts.map