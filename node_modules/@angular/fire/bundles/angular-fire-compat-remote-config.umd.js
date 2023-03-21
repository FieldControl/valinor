(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('rxjs'), require('rxjs/operators'), require('@angular/fire'), require('@angular/fire/compat'), require('firebase/remote-config'), require('firebase/compat/app')) :
    typeof define === 'function' && define.amd ? define('@angular/fire/compat/remote-config', ['exports', '@angular/core', 'rxjs', 'rxjs/operators', '@angular/fire', '@angular/fire/compat', 'firebase/remote-config', 'firebase/compat/app'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.angular = global.angular || {}, global.angular.fire = global.angular.fire || {}, global.angular.fire.compat = global.angular.fire.compat || {}, global.angular.fire.compat['remote-config'] = {}), global.ng.core, global.rxjs, global.rxjs.operators, global.angular.fire, global.angular.fire.compat, global.remoteConfig, global.firebase));
}(this, (function (exports, i0, rxjs, operators, i1, compat, remoteConfig, firebase) { 'use strict';

    function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

    function _interopNamespace(e) {
        if (e && e.__esModule) return e;
        var n = Object.create(null);
        if (e) {
            Object.keys(e).forEach(function (k) {
                if (k !== 'default') {
                    var d = Object.getOwnPropertyDescriptor(e, k);
                    Object.defineProperty(n, k, d.get ? d : {
                        enumerable: true,
                        get: function () {
                            return e[k];
                        }
                    });
                }
            });
        }
        n['default'] = e;
        return Object.freeze(n);
    }

    var i0__namespace = /*#__PURE__*/_interopNamespace(i0);
    var i1__namespace = /*#__PURE__*/_interopNamespace(i1);
    var firebase__default = /*#__PURE__*/_interopDefaultLegacy(firebase);

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b)
                if (Object.prototype.hasOwnProperty.call(b, p))
                    d[p] = b[p]; };
        return extendStatics(d, b);
    };
    function __extends(d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }
    var __assign = function () {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s)
                    if (Object.prototype.hasOwnProperty.call(s, p))
                        t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };
    function __rest(s, e) {
        var t = {};
        for (var p in s)
            if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
                t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    }
    function __decorate(decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
            r = Reflect.decorate(decorators, target, key, desc);
        else
            for (var i = decorators.length - 1; i >= 0; i--)
                if (d = decorators[i])
                    r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    }
    function __param(paramIndex, decorator) {
        return function (target, key) { decorator(target, key, paramIndex); };
    }
    function __metadata(metadataKey, metadataValue) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
            return Reflect.metadata(metadataKey, metadataValue);
    }
    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try {
                step(generator.next(value));
            }
            catch (e) {
                reject(e);
            } }
            function rejected(value) { try {
                step(generator["throw"](value));
            }
            catch (e) {
                reject(e);
            } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }
    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function () { if (t[0] & 1)
                throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function () { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f)
                throw new TypeError("Generator is already executing.");
            while (_)
                try {
                    if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
                        return t;
                    if (y = 0, t)
                        op = [op[0] & 2, t.value];
                    switch (op[0]) {
                        case 0:
                        case 1:
                            t = op;
                            break;
                        case 4:
                            _.label++;
                            return { value: op[1], done: false };
                        case 5:
                            _.label++;
                            y = op[1];
                            op = [0];
                            continue;
                        case 7:
                            op = _.ops.pop();
                            _.trys.pop();
                            continue;
                        default:
                            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                                _ = 0;
                                continue;
                            }
                            if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                                _.label = op[1];
                                break;
                            }
                            if (op[0] === 6 && _.label < t[1]) {
                                _.label = t[1];
                                t = op;
                                break;
                            }
                            if (t && _.label < t[2]) {
                                _.label = t[2];
                                _.ops.push(op);
                                break;
                            }
                            if (t[2])
                                _.ops.pop();
                            _.trys.pop();
                            continue;
                    }
                    op = body.call(thisArg, _);
                }
                catch (e) {
                    op = [6, e];
                    y = 0;
                }
                finally {
                    f = t = 0;
                }
            if (op[0] & 5)
                throw op[1];
            return { value: op[0] ? op[1] : void 0, done: true };
        }
    }
    var __createBinding = Object.create ? (function (o, m, k, k2) {
        if (k2 === undefined)
            k2 = k;
        Object.defineProperty(o, k2, { enumerable: true, get: function () { return m[k]; } });
    }) : (function (o, m, k, k2) {
        if (k2 === undefined)
            k2 = k;
        o[k2] = m[k];
    });
    function __exportStar(m, o) {
        for (var p in m)
            if (p !== "default" && !Object.prototype.hasOwnProperty.call(o, p))
                __createBinding(o, m, p);
    }
    function __values(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m)
            return m.call(o);
        if (o && typeof o.length === "number")
            return {
                next: function () {
                    if (o && i >= o.length)
                        o = void 0;
                    return { value: o && o[i++], done: !o };
                }
            };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    }
    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m)
            return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done)
                ar.push(r.value);
        }
        catch (error) {
            e = { error: error };
        }
        finally {
            try {
                if (r && !r.done && (m = i["return"]))
                    m.call(i);
            }
            finally {
                if (e)
                    throw e.error;
            }
        }
        return ar;
    }
    /** @deprecated */
    function __spread() {
        for (var ar = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(__read(arguments[i]));
        return ar;
    }
    /** @deprecated */
    function __spreadArrays() {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++)
            s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    }
    function __spreadArray(to, from) {
        for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
            to[j] = from[i];
        return to;
    }
    function __await(v) {
        return this instanceof __await ? (this.v = v, this) : new __await(v);
    }
    function __asyncGenerator(thisArg, _arguments, generator) {
        if (!Symbol.asyncIterator)
            throw new TypeError("Symbol.asyncIterator is not defined.");
        var g = generator.apply(thisArg, _arguments || []), i, q = [];
        return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
        function verb(n) { if (g[n])
            i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
        function resume(n, v) { try {
            step(g[n](v));
        }
        catch (e) {
            settle(q[0][3], e);
        } }
        function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
        function fulfill(value) { resume("next", value); }
        function reject(value) { resume("throw", value); }
        function settle(f, v) { if (f(v), q.shift(), q.length)
            resume(q[0][0], q[0][1]); }
    }
    function __asyncDelegator(o) {
        var i, p;
        return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
        function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
    }
    function __asyncValues(o) {
        if (!Symbol.asyncIterator)
            throw new TypeError("Symbol.asyncIterator is not defined.");
        var m = o[Symbol.asyncIterator], i;
        return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
        function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
        function settle(resolve, reject, d, v) { Promise.resolve(v).then(function (v) { resolve({ value: v, done: d }); }, reject); }
    }
    function __makeTemplateObject(cooked, raw) {
        if (Object.defineProperty) {
            Object.defineProperty(cooked, "raw", { value: raw });
        }
        else {
            cooked.raw = raw;
        }
        return cooked;
    }
    ;
    var __setModuleDefault = Object.create ? (function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function (o, v) {
        o["default"] = v;
    };
    function __importStar(mod) {
        if (mod && mod.__esModule)
            return mod;
        var result = {};
        if (mod != null)
            for (var k in mod)
                if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
                    __createBinding(result, mod, k);
        __setModuleDefault(result, mod);
        return result;
    }
    function __importDefault(mod) {
        return (mod && mod.__esModule) ? mod : { default: mod };
    }
    function __classPrivateFieldGet(receiver, state, kind, f) {
        if (kind === "a" && !f)
            throw new TypeError("Private accessor was defined without a getter");
        if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
            throw new TypeError("Cannot read private member from an object whose class did not declare it");
        return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
    }
    function __classPrivateFieldSet(receiver, state, value, kind, f) {
        if (kind === "m")
            throw new TypeError("Private method is not writable");
        if (kind === "a" && !f)
            throw new TypeError("Private accessor was defined without a setter");
        if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
            throw new TypeError("Cannot write private member to an object whose class did not declare it");
        return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
    }

    // DO NOT MODIFY, this file is autogenerated by tools/build.ts
    // Export a null object with the same keys as firebase/compat/remote-config, so Proxy can work with proxy-polyfill in Internet Explorer
    var proxyPolyfillCompat = {
        app: null,
        settings: null,
        defaultConfig: null,
        fetchTimeMillis: null,
        lastFetchStatus: null,
        activate: null,
        ensureInitialized: null,
        fetch: null,
        fetchAndActivate: null,
        getAll: null,
        getBoolean: null,
        getNumber: null,
        getString: null,
        getValue: null,
        setLogLevel: null,
    };

    var SETTINGS = new i0.InjectionToken('angularfire2.remoteConfig.settings');
    var DEFAULTS = new i0.InjectionToken('angularfire2.remoteConfig.defaultConfig');
    var AS_TO_FN = { strings: 'asString', numbers: 'asNumber', booleans: 'asBoolean' };
    var STATIC_VALUES = { numbers: 0, booleans: false, strings: undefined };
    // TODO look into the types here, I don't like the anys
    var proxyAll = function (observable, as) { return new Proxy(observable.pipe(mapToObject(as)), {
        get: function (self, name) { return self[name] || observable.pipe(operators.map(function (all) { return all.find(function (p) { return p.key === name; }); }), operators.map(function (param) { return param ? param[AS_TO_FN[as]]() : STATIC_VALUES[as]; }), operators.distinctUntilChanged()); }
    }); };
    // TODO export as implements Partial<...> so minor doesn't break us
    var Value = /** @class */ (function () {
        // tslint:disable-next-line:variable-name
        function Value(_source, _value) {
            this._source = _source;
            this._value = _value;
        }
        Value.prototype.asBoolean = function () {
            return ['1', 'true', 't', 'y', 'yes', 'on'].indexOf(this._value.toLowerCase()) > -1;
        };
        Value.prototype.asString = function () {
            return this._value;
        };
        Value.prototype.asNumber = function () {
            return Number(this._value) || 0;
        };
        Value.prototype.getSource = function () {
            return this._source;
        };
        return Value;
    }());
    // SEMVER use ConstructorParameters when we can support Typescript 3.6
    var Parameter = /** @class */ (function (_super) {
        __extends(Parameter, _super);
        function Parameter(key, fetchTimeMillis, source, value) {
            var _this = _super.call(this, source, value) || this;
            _this.key = key;
            _this.fetchTimeMillis = fetchTimeMillis;
            return _this;
        }
        return Parameter;
    }(Value));
    // If it's a Parameter array, test any, else test the individual Parameter
    var filterTest = function (fn) { return operators.filter(function (it) { return Array.isArray(it) ? it.some(fn) : fn(it); }); };
    // Allow the user to bypass the default values and wait till they get something from the server, even if it's a cached copy;
    // if used in conjuntion with first() it will only fetch RC values from the server if they aren't cached locally
    var filterRemote = function () { return filterTest(function (p) { return p.getSource() === 'remote'; }); };
    // filterFresh allows the developer to effectively set up a maximum cache time
    var filterFresh = function (howRecentInMillis) { return filterTest(function (p) { return p.fetchTimeMillis + howRecentInMillis >= new Date().getTime(); }); };
    // I ditched loading the defaults into RC and a simple map for scan since we already have our own defaults implementation.
    // The idea here being that if they have a default that never loads from the server, they will be able to tell via fetchTimeMillis
    // on the Parameter. Also if it doesn't come from the server it won't emit again in .changes, due to the distinctUntilChanged,
    // which we can simplify to === rather than deep comparison
    var scanToParametersArray = function (remoteConfig) { return rxjs.pipe(operators.withLatestFrom(remoteConfig), operators.scan(function (existing, _a) {
        var _b = __read(_a, 2), all = _b[0], rc = _b[1];
        // SEMVER use "new Set" to unique once we're only targeting es6
        // at the scale we expect remote config to be at, we probably won't see a performance hit from this unoptimized uniqueness
        // implementation.
        // const allKeys = [...new Set([...existing.map(p => p.key), ...Object.keys(all)])];
        var allKeys = __spreadArray(__spreadArray([], __read(existing.map(function (p) { return p.key; }))), __read(Object.keys(all))).filter(function (v, i, a) { return a.indexOf(v) === i; });
        return allKeys.map(function (key) {
            var updatedValue = all[key];
            return updatedValue ? new Parameter(key, rc ? rc.fetchTimeMillis : -1, updatedValue.getSource(), updatedValue.asString())
                : existing.find(function (p) { return p.key === key; });
        });
    }, [])); };
    var AngularFireRemoteConfig = /** @class */ (function () {
        function AngularFireRemoteConfig(options, name, settings, defaultConfig, zone, schedulers, 
        // tslint:disable-next-line:ban-types
        platformId) {
            this.zone = zone;
            var remoteConfig$ = rxjs.of(undefined).pipe(operators.observeOn(schedulers.outsideAngular), operators.switchMap(function () { return remoteConfig.isSupported(); }), operators.switchMap(function (isSupported) { return isSupported ? rxjs.of(undefined) : rxjs.EMPTY; }), operators.map(function () { return compat.ɵfirebaseAppFactory(options, zone, name); }), operators.map(function (app) { return compat.ɵcacheInstance(app.name + ".remote-config", 'AngularFireRemoteConfig', app.name, function () {
                var rc = app.remoteConfig();
                if (settings) {
                    rc.settings = settings;
                }
                if (defaultConfig) {
                    rc.defaultConfig = defaultConfig;
                }
                return rc;
            }, [settings, defaultConfig]); }), operators.startWith(undefined), operators.shareReplay({ bufferSize: 1, refCount: false }));
            var loadedRemoteConfig$ = remoteConfig$.pipe(operators.filter(function (rc) { return !!rc; }));
            var default$ = rxjs.of(Object.keys(defaultConfig || {}).reduce(function (c, k) {
                var _a;
                return (Object.assign(Object.assign({}, c), (_a = {}, _a[k] = new Value('default', defaultConfig[k].toString()), _a)));
            }, {}));
            // we should filter out the defaults we provided to RC, since we have our own implementation
            // that gives us a -1 for fetchTimeMillis (so filterFresh can filter them out)
            var filterOutDefaults = operators.map(function (all) { return Object.keys(all)
                .filter(function (key) { return all[key].getSource() !== 'default'; })
                .reduce(function (acc, key) {
                var _a;
                return (Object.assign(Object.assign({}, acc), (_a = {}, _a[key] = all[key], _a)));
            }, {}); });
            var existing$ = loadedRemoteConfig$.pipe(operators.switchMap(function (rc) { return rc.activate()
                .then(function () { return rc.ensureInitialized(); })
                .then(function () { return rc.getAll(); }); }), filterOutDefaults);
            var fresh$ = loadedRemoteConfig$.pipe(operators.switchMap(function (rc) { return zone.runOutsideAngular(function () { return rc.fetchAndActivate()
                .then(function () { return rc.ensureInitialized(); })
                .then(function () { return rc.getAll(); }); }); }), filterOutDefaults);
            this.parameters = rxjs.concat(default$, existing$, fresh$).pipe(scanToParametersArray(remoteConfig$), i1.keepUnstableUntilFirst, operators.shareReplay({ bufferSize: 1, refCount: true }));
            this.changes = this.parameters.pipe(operators.switchMap(function (params) { return rxjs.of.apply(void 0, __spreadArray([], __read(params))); }), operators.groupBy(function (param) { return param.key; }), operators.mergeMap(function (group) { return group.pipe(operators.distinctUntilChanged()); }));
            this.strings = proxyAll(this.parameters, 'strings');
            this.booleans = proxyAll(this.parameters, 'booleans');
            this.numbers = proxyAll(this.parameters, 'numbers');
            return compat.ɵlazySDKProxy(this, loadedRemoteConfig$, zone);
        }
        return AngularFireRemoteConfig;
    }());
    AngularFireRemoteConfig.ɵfac = i0__namespace.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0__namespace, type: AngularFireRemoteConfig, deps: [{ token: compat.FIREBASE_OPTIONS }, { token: compat.FIREBASE_APP_NAME, optional: true }, { token: SETTINGS, optional: true }, { token: DEFAULTS, optional: true }, { token: i0__namespace.NgZone }, { token: i1__namespace.ɵAngularFireSchedulers }, { token: i0.PLATFORM_ID }], target: i0__namespace.ɵɵFactoryTarget.Injectable });
    AngularFireRemoteConfig.ɵprov = i0__namespace.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0__namespace, type: AngularFireRemoteConfig, providedIn: 'any' });
    i0__namespace.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0__namespace, type: AngularFireRemoteConfig, decorators: [{
                type: i0.Injectable,
                args: [{
                        providedIn: 'any'
                    }]
            }], ctorParameters: function () {
            return [{ type: undefined, decorators: [{
                            type: i0.Inject,
                            args: [compat.FIREBASE_OPTIONS]
                        }] }, { type: undefined, decorators: [{
                            type: i0.Optional
                        }, {
                            type: i0.Inject,
                            args: [compat.FIREBASE_APP_NAME]
                        }] }, { type: undefined, decorators: [{
                            type: i0.Optional
                        }, {
                            type: i0.Inject,
                            args: [SETTINGS]
                        }] }, { type: undefined, decorators: [{
                            type: i0.Optional
                        }, {
                            type: i0.Inject,
                            args: [DEFAULTS]
                        }] }, { type: i0__namespace.NgZone }, { type: i1__namespace.ɵAngularFireSchedulers }, { type: Object, decorators: [{
                            type: i0.Inject,
                            args: [i0.PLATFORM_ID]
                        }] }];
        } });
    var budget = function (interval) { return function (source) { return new rxjs.Observable(function (observer) {
        var timedOut = false;
        // TODO use scheduler task rather than settimeout
        var timeout = setTimeout(function () {
            observer.complete();
            timedOut = true;
        }, interval);
        return source.subscribe({
            next: function (val) {
                if (!timedOut) {
                    observer.next(val);
                }
            },
            error: function (err) {
                if (!timedOut) {
                    clearTimeout(timeout);
                    observer.error(err);
                }
            },
            complete: function () {
                if (!timedOut) {
                    clearTimeout(timeout);
                    observer.complete();
                }
            }
        });
    }); }; };
    var typedMethod = function (it) {
        switch (typeof it) {
            case 'string':
                return 'asString';
            case 'boolean':
                return 'asBoolean';
            case 'number':
                return 'asNumber';
            default:
                return 'asString';
        }
    };
    function scanToObject(to) {
        if (to === void 0) { to = 'strings'; }
        return rxjs.pipe(
        // TODO cleanup
        operators.scan(function (c, p) {
            var _a;
            return (Object.assign(Object.assign({}, c), (_a = {}, _a[p.key] = typeof to === 'object' ?
                p[typedMethod(to[p.key])]() :
                p[AS_TO_FN[to]](), _a)));
        }, typeof to === 'object' ?
            to :
            {}), operators.debounceTime(1), budget(10), operators.distinctUntilChanged(function (a, b) { return JSON.stringify(a) === JSON.stringify(b); }));
    }
    function mapToObject(to) {
        if (to === void 0) { to = 'strings'; }
        return rxjs.pipe(
        // TODO this is getting a little long, cleanup
        operators.map(function (params) { return params.reduce(function (c, p) {
            var _a;
            return (Object.assign(Object.assign({}, c), (_a = {}, _a[p.key] = typeof to === 'object' ?
                p[typedMethod(to[p.key])]() :
                p[AS_TO_FN[to]](), _a)));
        }, typeof to === 'object' ?
            to :
            {}); }), operators.distinctUntilChanged(function (a, b) { return JSON.stringify(a) === JSON.stringify(b); }));
    }
    compat.ɵapplyMixins(AngularFireRemoteConfig, [proxyPolyfillCompat]);

    var AngularFireRemoteConfigModule = /** @class */ (function () {
        function AngularFireRemoteConfigModule() {
            firebase__default['default'].registerVersion('angularfire', i1.VERSION.full, 'rc-compat');
        }
        return AngularFireRemoteConfigModule;
    }());
    AngularFireRemoteConfigModule.ɵfac = i0__namespace.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0__namespace, type: AngularFireRemoteConfigModule, deps: [], target: i0__namespace.ɵɵFactoryTarget.NgModule });
    AngularFireRemoteConfigModule.ɵmod = i0__namespace.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0__namespace, type: AngularFireRemoteConfigModule });
    AngularFireRemoteConfigModule.ɵinj = i0__namespace.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0__namespace, type: AngularFireRemoteConfigModule, providers: [AngularFireRemoteConfig] });
    i0__namespace.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0__namespace, type: AngularFireRemoteConfigModule, decorators: [{
                type: i0.NgModule,
                args: [{
                        providers: [AngularFireRemoteConfig]
                    }]
            }], ctorParameters: function () { return []; } });

    /**
     * Generated bundle index. Do not edit.
     */

    exports.AngularFireRemoteConfig = AngularFireRemoteConfig;
    exports.AngularFireRemoteConfigModule = AngularFireRemoteConfigModule;
    exports.DEFAULTS = DEFAULTS;
    exports.Parameter = Parameter;
    exports.SETTINGS = SETTINGS;
    exports.Value = Value;
    exports.budget = budget;
    exports.filterFresh = filterFresh;
    exports.filterRemote = filterRemote;
    exports.mapToObject = mapToObject;
    exports.scanToObject = scanToObject;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=angular-fire-compat-remote-config.umd.js.map
