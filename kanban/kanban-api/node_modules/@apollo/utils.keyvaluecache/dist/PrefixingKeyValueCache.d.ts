import type { KeyValueCache, KeyValueCacheSetOptions } from ".";
declare const prefixesAreUnnecessaryForIsolationSymbol: unique symbol;
export declare class PrefixingKeyValueCache<V = string> implements KeyValueCache<V> {
    private wrapped;
    private prefix;
    [prefixesAreUnnecessaryForIsolationSymbol]?: true;
    constructor(wrapped: KeyValueCache<V>, prefix: string);
    get(key: string): Promise<V | undefined>;
    set(key: string, value: V, options?: KeyValueCacheSetOptions): Promise<void>;
    delete(key: string): Promise<boolean | void>;
    static prefixesAreUnnecessaryForIsolation<V = string>(c: KeyValueCache<V>): boolean;
    static cacheDangerouslyDoesNotNeedPrefixesForIsolation<V = string>(c: KeyValueCache<V>): KeyValueCache<V>;
}
export {};
//# sourceMappingURL=PrefixingKeyValueCache.d.ts.map