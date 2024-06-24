# KeyValueCache interface

```ts
export interface KeyValueCache<V = string> {
  get(key: string): Promise<V | undefined>;
  set(key: string, value: V, options?: KeyValueCacheSetOptions): Promise<void>;
  delete(key: string): Promise<boolean | void>;
}
```

This interface defines a minimally-compatible cache intended for (but not limited to) use by Apollo Server. It is notably implemented by `KeyvAdapter` from the `@apollo/utils.keyvadapter` package. (`KeyvAdapter` in conjunction with a `Keyv` is probably more interesting to you unless you're actually building a cache!)

# InMemoryLRUCache

This class wraps `lru-cache` and implements the `KeyValueCache` interface. It accepts `LRUCache.Options` as the constructor argument and passes them to the `LRUCache` which is created. A default `maxSize` and `sizeCalculator` are provided in order to prevent an unbounded cache; these can both be tweaked via the constructor argument.

```ts
const cache = new InMemoryLRUCache({
  // create a larger-than-default `LRUCache`
  maxSize: Math.pow(2, 20) * 50,
});
```

# PrefixingKeyValueCache

This class wraps a `KeyValueCache` in order to provide a specified prefix for keys entering the cache via this wrapper.

```ts
const cache = new InMemoryLRUCache();
const prefixedCache = new PrefixingKeyValueCache(cache, "apollo:");
```

One reason to use this is if a single piece of software wants to use a cache for multiple features. For example, you can pass a `KeyValueCache` as the `cache` option to `@apollo/server`'s `ApolloServer` class; it provides this cache to plugins and other features as a default cache to use (if the user does not provide the specific plugin its own cache). Each feature uses `PrefixingKeyValueCache` with a different prefix to prevent different features from stomping on each others' data.

However, if you are configuring one of those features explicitly, you may _not_ want this prefix to be added. In that case, you can wrap your cache in a cache returned by `PrefixingKeyValueCache.cacheDangerouslyDoesNotNeedPrefixesForIsolation`. The only difference between this cache and the cache that it wraps is that when it is passed directly to a `PrefixingKeyValueCache`, no prefix is applied.

That is, let's say you are using a class that is implemented like this:

```ts
class SomePlugin {
  private cache: KeyValueCache;
  constructor(cache: KeyValueCache) {
    this.cache = new PrefixingKeyValueCache(cache, "some:");
  }
}
```

If you set up your plugin as `new SomePlugin({ cache: myRedisCache })` then the plugin will add `some:` to all keys when interacting with your cache, but if you set it up as `new SomePlugin({ cache: PrefixingKeyValueCache.cacheDangerouslyDoesNotNeedPrefixesForIsolation(myRedisCache) })`, then the plugin will not apply its prefix. You should only do this if you feel confident that this feature's use of this cache will not overlap with another feature: perhaps this is the only feature you have configured to use this cache, or perhaps the feature provides suitable control over cache keys that you can ensure isolation without needing the plugin's prefix.

Software like `ApolloServer` that passes a single `KeyValueCache` to several features should throw if a `PrefixesAreUnnecessaryForIsolationCache` is provided to it; it can check this condition with the static `PrefixingKeyValueCache.prefixesAreUnnecessaryForIsolation` method (which is safer than an `instanceof` check in case there are multiple copies of `@apollo/utils.keyvaluecache` installed).

# ErrorsAreMissesCache

This class wraps a `KeyValueCache` in order to provide error tolerance for caches which connect via a client like Redis. In the event that there's an _error_, this wrapper will treat it as a cache miss (and log the error instead, if a `logger` is provided).

An example usage (which makes use of the `keyv` Redis client and our `KeyvAdapter`) would look something like this:

```ts
import Keyv from "keyv";
import { KeyvAdapter } from "@apollo/utils.keyvadapter";
import { ErrorsAreMissesCache } from "@apollo/utils.keyvaluecache";

const redisCache = new Keyv("redis://user:pass@localhost:6379");
const faultTolerantCache = new ErrorsAreMissesCache(
  new KeyvAdapter(redisCache),
);
```
