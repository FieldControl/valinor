import { InMemoryLRUCache } from "..";
import { PrefixingKeyValueCache } from "../PrefixingKeyValueCache";

describe("PrefixingKeyValueCache", () => {
  it("prefixes", async () => {
    const inner = new InMemoryLRUCache();
    const prefixing = new PrefixingKeyValueCache(inner, "prefix:");
    await prefixing.set("foo", "bar");
    expect(await prefixing.get("foo")).toBe("bar");
    expect(await inner.get("prefix:foo")).toBe("bar");
    await prefixing.delete("foo");
    expect(await prefixing.get("foo")).toBe(undefined);
  });
  it("PrefixesAreUnnecessaryForIsolationCache", async () => {
    const inner = new InMemoryLRUCache();
    const prefixesAreUnnecessaryForIsolationCache =
      PrefixingKeyValueCache.cacheDangerouslyDoesNotNeedPrefixesForIsolation(
        inner,
      );
    const prefixing = new PrefixingKeyValueCache(
      prefixesAreUnnecessaryForIsolationCache,
      "prefix:",
    );

    for (const cache of [prefixesAreUnnecessaryForIsolationCache, prefixing]) {
      await cache.set("x", "a");
      expect(await cache.get("x")).toBe("a");
      expect(inner.keys().length).toBe(1);
      // The prefix is not applied!
      expect(await inner.get("x")).toBe("a");
      await cache.delete("x");
      expect(await cache.get("x")).toBe(undefined);
      expect(inner.keys().length).toBe(0);
    }

    expect(
      PrefixingKeyValueCache.prefixesAreUnnecessaryForIsolation(inner),
    ).toBe(false);
    expect(
      PrefixingKeyValueCache.prefixesAreUnnecessaryForIsolation(
        prefixesAreUnnecessaryForIsolationCache,
      ),
    ).toBe(true);
    expect(
      PrefixingKeyValueCache.prefixesAreUnnecessaryForIsolation(prefixing),
    ).toBe(true);
  });
});
