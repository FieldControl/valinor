import { CacheItem, CacheItemInterface } from './cache-item';
export declare class Cache {
    static items: Map<string, CacheItem>;
    static getCacheFor(cacheCandidate: CacheItemInterface): CacheItem;
    static remove(cacheItem: CacheItem): boolean;
    static get(key: string): CacheItem;
    protected static set(cacheItem: CacheItem): void;
}
