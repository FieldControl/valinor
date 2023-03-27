import { DocumentNode, GraphQLError } from 'graphql';
import { ApolloCache } from '../cache';
import { FetchResult } from '../link/core';
import { ApolloError } from '../errors';
import { QueryInfo } from './QueryInfo';
import { NetworkStatus } from './networkStatus';
import { Resolver } from './LocalState';
import { ObservableQuery } from './ObservableQuery';
import { QueryOptions } from './watchQueryOptions';
import { Cache } from '../cache';
import { IsStrictlyAny } from '../utilities';
export { TypedDocumentNode } from '@graphql-typed-document-node/core';
export interface DefaultContext extends Record<string, any> {
}
export type QueryListener = (queryInfo: QueryInfo) => void;
export type OnQueryUpdated<TResult> = (observableQuery: ObservableQuery<any>, diff: Cache.DiffResult<any>, lastDiff: Cache.DiffResult<any> | undefined) => boolean | TResult;
export type RefetchQueryDescriptor = string | DocumentNode;
export type InternalRefetchQueryDescriptor = RefetchQueryDescriptor | QueryOptions;
type RefetchQueriesIncludeShorthand = "all" | "active";
export type RefetchQueriesInclude = RefetchQueryDescriptor[] | RefetchQueriesIncludeShorthand;
export type InternalRefetchQueriesInclude = InternalRefetchQueryDescriptor[] | RefetchQueriesIncludeShorthand;
export interface RefetchQueriesOptions<TCache extends ApolloCache<any>, TResult> {
    updateCache?: (cache: TCache) => void;
    include?: RefetchQueriesInclude;
    optimistic?: boolean;
    onQueryUpdated?: OnQueryUpdated<TResult> | null;
}
export type RefetchQueriesPromiseResults<TResult> = IsStrictlyAny<TResult> extends true ? any[] : TResult extends boolean ? ApolloQueryResult<any>[] : TResult extends PromiseLike<infer U> ? U[] : TResult[];
export interface RefetchQueriesResult<TResult> extends Promise<RefetchQueriesPromiseResults<TResult>> {
    queries: ObservableQuery<any>[];
    results: InternalRefetchQueriesResult<TResult>[];
}
export interface InternalRefetchQueriesOptions<TCache extends ApolloCache<any>, TResult> extends Omit<RefetchQueriesOptions<TCache, TResult>, "include"> {
    include?: InternalRefetchQueriesInclude;
    removeOptimistic?: string;
}
export type InternalRefetchQueriesResult<TResult> = TResult extends boolean ? Promise<ApolloQueryResult<any>> : TResult;
export type InternalRefetchQueriesMap<TResult> = Map<ObservableQuery<any>, InternalRefetchQueriesResult<TResult>>;
export type { QueryOptions as PureQueryOptions };
export type OperationVariables = Record<string, any>;
export type ApolloQueryResult<T> = {
    data: T;
    errors?: ReadonlyArray<GraphQLError>;
    error?: ApolloError;
    loading: boolean;
    networkStatus: NetworkStatus;
    partial?: boolean;
};
export type MutationQueryReducer<T> = (previousResult: Record<string, any>, options: {
    mutationResult: FetchResult<T>;
    queryName: string | undefined;
    queryVariables: Record<string, any>;
}) => Record<string, any>;
export type MutationQueryReducersMap<T = {
    [key: string]: any;
}> = {
    [queryName: string]: MutationQueryReducer<T>;
};
export type MutationUpdaterFn<T = {
    [key: string]: any;
}> = (cache: ApolloCache<T>, mutationResult: FetchResult<T>) => void;
export type MutationUpdaterFunction<TData, TVariables, TContext, TCache extends ApolloCache<any>> = (cache: TCache, result: Omit<FetchResult<TData>, 'context'>, options: {
    context?: TContext;
    variables?: TVariables;
}) => void;
export interface Resolvers {
    [key: string]: {
        [field: string]: Resolver;
    };
}
//# sourceMappingURL=types.d.ts.map