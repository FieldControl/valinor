import type { GraphQLCompositeType, GraphQLResolveInfo } from 'graphql';
export type CacheScope = 'PUBLIC' | 'PRIVATE';
export interface CacheHint {
    maxAge?: number;
    scope?: CacheScope;
}
export interface CachePolicy extends CacheHint {
    replace(hint: CacheHint): void;
    restrict(hint: CacheHint): void;
    policyIfCacheable(): Required<CacheHint> | null;
}
export interface ResolveInfoCacheControl {
    cacheHint: CachePolicy;
    setCacheHint(hint: CacheHint): void;
    cacheHintFromType(t: GraphQLCompositeType): CacheHint | undefined;
}
export interface GraphQLResolveInfoWithCacheControl extends Omit<GraphQLResolveInfo, 'cacheControl'> {
    cacheControl: ResolveInfoCacheControl;
}
export declare function maybeCacheControlFromInfo(info: GraphQLResolveInfo): ResolveInfoCacheControl | null;
export declare function cacheControlFromInfo(info: GraphQLResolveInfo): ResolveInfoCacheControl;
//# sourceMappingURL=index.d.ts.map