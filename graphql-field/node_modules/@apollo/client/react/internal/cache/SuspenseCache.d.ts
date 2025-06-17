import type { ApolloClient, ObservableQuery, WatchFragmentOptions } from "../../../core/index.js";
import { InternalQueryReference } from "./QueryReference.js";
import type { CacheKey, FragmentCacheKey } from "./types.js";
import { FragmentReference } from "./FragmentReference.js";
export interface SuspenseCacheOptions {
    /**
     * Specifies the amount of time, in milliseconds, the suspense cache will wait
     * for a suspended component to read from the suspense cache before it
     * automatically disposes of the query. This prevents memory leaks when a
     * component unmounts before a suspended resource finishes loading. Increase
     * the timeout if your queries take longer than than the specified time to
     * prevent your queries from suspending over and over.
     *
     * Defaults to 30 seconds.
     */
    autoDisposeTimeoutMs?: number;
}
export declare class SuspenseCache {
    private queryRefs;
    private fragmentRefs;
    private options;
    constructor(options?: SuspenseCacheOptions);
    getQueryRef<TData = any>(cacheKey: CacheKey, createObservable: () => ObservableQuery<TData>): InternalQueryReference<TData>;
    getFragmentRef<TData, TVariables>(cacheKey: FragmentCacheKey, client: ApolloClient<any>, options: WatchFragmentOptions<TData, TVariables> & {
        from: string;
    }): FragmentReference<TData, TVariables>;
    add(cacheKey: CacheKey, queryRef: InternalQueryReference<unknown>): void;
}
//# sourceMappingURL=SuspenseCache.d.ts.map