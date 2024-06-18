"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrefixingKeyValueCache = void 0;
const prefixesAreUnnecessaryForIsolationSymbol = Symbol("prefixesAreUnnecessaryForIsolation");
class PrefixingKeyValueCache {
    constructor(wrapped, prefix) {
        this.wrapped = wrapped;
        if (PrefixingKeyValueCache.prefixesAreUnnecessaryForIsolation(wrapped)) {
            this.prefix = "";
            this[prefixesAreUnnecessaryForIsolationSymbol] = true;
        }
        else {
            this.prefix = prefix;
        }
    }
    get(key) {
        return this.wrapped.get(this.prefix + key);
    }
    set(key, value, options) {
        return this.wrapped.set(this.prefix + key, value, options);
    }
    delete(key) {
        return this.wrapped.delete(this.prefix + key);
    }
    static prefixesAreUnnecessaryForIsolation(c) {
        return prefixesAreUnnecessaryForIsolationSymbol in c;
    }
    static cacheDangerouslyDoesNotNeedPrefixesForIsolation(c) {
        return new PrefixesAreUnnecessaryForIsolationCache(c);
    }
}
exports.PrefixingKeyValueCache = PrefixingKeyValueCache;
class PrefixesAreUnnecessaryForIsolationCache {
    constructor(wrapped) {
        this.wrapped = wrapped;
        this[_a] = true;
    }
    get(key) {
        return this.wrapped.get(key);
    }
    set(key, value, options) {
        return this.wrapped.set(key, value, options);
    }
    delete(key) {
        return this.wrapped.delete(key);
    }
}
_a = prefixesAreUnnecessaryForIsolationSymbol;
//# sourceMappingURL=PrefixingKeyValueCache.js.map