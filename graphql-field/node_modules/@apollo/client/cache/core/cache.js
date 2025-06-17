import { __assign, __rest } from "tslib";
import { wrap } from "optimism";
import { Observable, cacheSizes, getFragmentDefinition, getFragmentQueryDocument, mergeDeepArray, } from "../../utilities/index.js";
import { WeakCache } from "@wry/caches";
import { getApolloCacheMemoryInternals } from "../../utilities/caching/getMemoryInternals.js";
import { equalByQuery } from "../../core/equalByQuery.js";
import { invariant } from "../../utilities/globals/index.js";
import { maskFragment } from "../../masking/index.js";
var ApolloCache = /** @class */ (function () {
    function ApolloCache() {
        this.assumeImmutableResults = false;
        // Make sure we compute the same (===) fragment query document every
        // time we receive the same fragment in readFragment.
        this.getFragmentDoc = wrap(getFragmentQueryDocument, {
            max: cacheSizes["cache.fragmentQueryDocuments"] ||
                1000 /* defaultCacheSizes["cache.fragmentQueryDocuments"] */,
            cache: WeakCache,
        });
    }
    // Function used to lookup a fragment when a fragment definition is not part
    // of the GraphQL document. This is useful for caches, such as InMemoryCache,
    // that register fragments ahead of time so they can be referenced by name.
    ApolloCache.prototype.lookupFragment = function (fragmentName) {
        return null;
    };
    // Transactional API
    // The batch method is intended to replace/subsume both performTransaction
    // and recordOptimisticTransaction, but performTransaction came first, so we
    // provide a default batch implementation that's just another way of calling
    // performTransaction. Subclasses of ApolloCache (such as InMemoryCache) can
    // override the batch method to do more interesting things with its options.
    ApolloCache.prototype.batch = function (options) {
        var _this = this;
        var optimisticId = typeof options.optimistic === "string" ? options.optimistic
            : options.optimistic === false ? null
                : void 0;
        var updateResult;
        this.performTransaction(function () { return (updateResult = options.update(_this)); }, optimisticId);
        return updateResult;
    };
    ApolloCache.prototype.recordOptimisticTransaction = function (transaction, optimisticId) {
        this.performTransaction(transaction, optimisticId);
    };
    // Optional API
    // Called once per input document, allowing the cache to make static changes
    // to the query, such as adding __typename fields.
    ApolloCache.prototype.transformDocument = function (document) {
        return document;
    };
    // Called before each ApolloLink request, allowing the cache to make dynamic
    // changes to the query, such as filling in missing fragment definitions.
    ApolloCache.prototype.transformForLink = function (document) {
        return document;
    };
    ApolloCache.prototype.identify = function (object) {
        return;
    };
    ApolloCache.prototype.gc = function () {
        return [];
    };
    ApolloCache.prototype.modify = function (options) {
        return false;
    };
    // DataProxy API
    ApolloCache.prototype.readQuery = function (options, optimistic) {
        if (optimistic === void 0) { optimistic = !!options.optimistic; }
        return this.read(__assign(__assign({}, options), { rootId: options.id || "ROOT_QUERY", optimistic: optimistic }));
    };
    /** {@inheritDoc @apollo/client!ApolloClient#watchFragment:member(1)} */
    ApolloCache.prototype.watchFragment = function (options) {
        var _this = this;
        var fragment = options.fragment, fragmentName = options.fragmentName, from = options.from, _a = options.optimistic, optimistic = _a === void 0 ? true : _a, otherOptions = __rest(options, ["fragment", "fragmentName", "from", "optimistic"]);
        var query = this.getFragmentDoc(fragment, fragmentName);
        // While our TypeScript types do not allow for `undefined` as a valid
        // `from`, its possible `useFragment` gives us an `undefined` since it
        // calls` cache.identify` and provides that value to `from`. We are
        // adding this fix here however to ensure those using plain JavaScript
        // and using `cache.identify` themselves will avoid seeing the obscure
        // warning.
        var id = typeof from === "undefined" || typeof from === "string" ?
            from
            : this.identify(from);
        var dataMasking = !!options[Symbol.for("apollo.dataMasking")];
        if (globalThis.__DEV__ !== false) {
            var actualFragmentName = fragmentName || getFragmentDefinition(fragment).name.value;
            if (!id) {
                globalThis.__DEV__ !== false && invariant.warn(1, actualFragmentName);
            }
        }
        var diffOptions = __assign(__assign({}, otherOptions), { returnPartialData: true, id: id, query: query, optimistic: optimistic });
        var latestDiff;
        return new Observable(function (observer) {
            return _this.watch(__assign(__assign({}, diffOptions), { immediate: true, callback: function (diff) {
                    var data = dataMasking ?
                        maskFragment(diff.result, fragment, _this, fragmentName)
                        : diff.result;
                    if (
                    // Always ensure we deliver the first result
                    latestDiff &&
                        equalByQuery(query, { data: latestDiff.result }, { data: data }, 
                        // TODO: Fix the type on WatchFragmentOptions so that TVars
                        // extends OperationVariables
                        options.variables)) {
                        return;
                    }
                    var result = {
                        data: data,
                        complete: !!diff.complete,
                    };
                    if (diff.missing) {
                        result.missing = mergeDeepArray(diff.missing.map(function (error) { return error.missing; }));
                    }
                    latestDiff = __assign(__assign({}, diff), { result: data });
                    observer.next(result);
                } }));
        });
    };
    ApolloCache.prototype.readFragment = function (options, optimistic) {
        if (optimistic === void 0) { optimistic = !!options.optimistic; }
        return this.read(__assign(__assign({}, options), { query: this.getFragmentDoc(options.fragment, options.fragmentName), rootId: options.id, optimistic: optimistic }));
    };
    ApolloCache.prototype.writeQuery = function (_a) {
        var id = _a.id, data = _a.data, options = __rest(_a, ["id", "data"]);
        return this.write(Object.assign(options, {
            dataId: id || "ROOT_QUERY",
            result: data,
        }));
    };
    ApolloCache.prototype.writeFragment = function (_a) {
        var id = _a.id, data = _a.data, fragment = _a.fragment, fragmentName = _a.fragmentName, options = __rest(_a, ["id", "data", "fragment", "fragmentName"]);
        return this.write(Object.assign(options, {
            query: this.getFragmentDoc(fragment, fragmentName),
            dataId: id,
            result: data,
        }));
    };
    ApolloCache.prototype.updateQuery = function (options, update) {
        return this.batch({
            update: function (cache) {
                var value = cache.readQuery(options);
                var data = update(value);
                if (data === void 0 || data === null)
                    return value;
                cache.writeQuery(__assign(__assign({}, options), { data: data }));
                return data;
            },
        });
    };
    ApolloCache.prototype.updateFragment = function (options, update) {
        return this.batch({
            update: function (cache) {
                var value = cache.readFragment(options);
                var data = update(value);
                if (data === void 0 || data === null)
                    return value;
                cache.writeFragment(__assign(__assign({}, options), { data: data }));
                return data;
            },
        });
    };
    return ApolloCache;
}());
export { ApolloCache };
if (globalThis.__DEV__ !== false) {
    ApolloCache.prototype.getMemoryInternals = getApolloCacheMemoryInternals;
}
//# sourceMappingURL=cache.js.map