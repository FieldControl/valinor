import { __assign } from "tslib";
import { equal } from "@wry/equality";
import { createFulfilledPromise, wrapPromiseWithState, } from "../../../utilities/index.js";
var FragmentReference = /** @class */ (function () {
    function FragmentReference(client, watchFragmentOptions, options) {
        var _this = this;
        this.key = {};
        this.listeners = new Set();
        this.references = 0;
        this.dispose = this.dispose.bind(this);
        this.handleNext = this.handleNext.bind(this);
        this.handleError = this.handleError.bind(this);
        this.observable = client.watchFragment(watchFragmentOptions);
        if (options.onDispose) {
            this.onDispose = options.onDispose;
        }
        var diff = this.getDiff(client, watchFragmentOptions);
        // Start a timer that will automatically dispose of the query if the
        // suspended resource does not use this fragmentRef in the given time. This
        // helps prevent memory leaks when a component has unmounted before the
        // query has finished loading.
        var startDisposeTimer = function () {
            var _a;
            if (!_this.references) {
                _this.autoDisposeTimeoutId = setTimeout(_this.dispose, (_a = options.autoDisposeTimeoutMs) !== null && _a !== void 0 ? _a : 30000);
            }
        };
        this.promise =
            diff.complete ?
                createFulfilledPromise(diff.result)
                : this.createPendingPromise();
        this.subscribeToFragment();
        this.promise.then(startDisposeTimer, startDisposeTimer);
    }
    FragmentReference.prototype.listen = function (listener) {
        var _this = this;
        this.listeners.add(listener);
        return function () {
            _this.listeners.delete(listener);
        };
    };
    FragmentReference.prototype.retain = function () {
        var _this = this;
        this.references++;
        clearTimeout(this.autoDisposeTimeoutId);
        var disposed = false;
        return function () {
            if (disposed) {
                return;
            }
            disposed = true;
            _this.references--;
            setTimeout(function () {
                if (!_this.references) {
                    _this.dispose();
                }
            });
        };
    };
    FragmentReference.prototype.dispose = function () {
        this.subscription.unsubscribe();
        this.onDispose();
    };
    FragmentReference.prototype.onDispose = function () {
        // noop. overridable by options
    };
    FragmentReference.prototype.subscribeToFragment = function () {
        this.subscription = this.observable.subscribe(this.handleNext.bind(this), this.handleError.bind(this));
    };
    FragmentReference.prototype.handleNext = function (result) {
        var _a;
        switch (this.promise.status) {
            case "pending": {
                if (result.complete) {
                    return (_a = this.resolve) === null || _a === void 0 ? void 0 : _a.call(this, result.data);
                }
                this.deliver(this.promise);
                break;
            }
            case "fulfilled": {
                // This can occur when we already have a result written to the cache and
                // we subscribe for the first time. We create a fulfilled promise in the
                // constructor with a value that is the same as the first emitted value
                // so we want to skip delivering it.
                if (equal(this.promise.value, result.data)) {
                    return;
                }
                this.promise =
                    result.complete ?
                        createFulfilledPromise(result.data)
                        : this.createPendingPromise();
                this.deliver(this.promise);
            }
        }
    };
    FragmentReference.prototype.handleError = function (error) {
        var _a;
        (_a = this.reject) === null || _a === void 0 ? void 0 : _a.call(this, error);
    };
    FragmentReference.prototype.deliver = function (promise) {
        this.listeners.forEach(function (listener) { return listener(promise); });
    };
    FragmentReference.prototype.createPendingPromise = function () {
        var _this = this;
        return wrapPromiseWithState(new Promise(function (resolve, reject) {
            _this.resolve = resolve;
            _this.reject = reject;
        }));
    };
    FragmentReference.prototype.getDiff = function (client, options) {
        var cache = client.cache;
        var from = options.from, fragment = options.fragment, fragmentName = options.fragmentName;
        var diff = cache.diff(__assign(__assign({}, options), { query: cache["getFragmentDoc"](fragment, fragmentName), returnPartialData: true, id: from, optimistic: true }));
        return __assign(__assign({}, diff), { result: client["queryManager"].maskFragment({
                fragment: fragment,
                fragmentName: fragmentName,
                data: diff.result,
            }) });
    };
    return FragmentReference;
}());
export { FragmentReference };
//# sourceMappingURL=FragmentReference.js.map