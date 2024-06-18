import type { ApolloServerPlugin } from '../../externalTypes/index.js';
import type { CacheHint } from '@apollo/cache-control-types';
export interface ApolloServerPluginCacheControlOptions {
    defaultMaxAge?: number;
    calculateHttpHeaders?: boolean | 'if-cacheable';
    __testing__cacheHints?: Map<string, CacheHint>;
}
export declare function ApolloServerPluginCacheControl(options?: ApolloServerPluginCacheControlOptions): ApolloServerPlugin;
//# sourceMappingURL=index.d.ts.map