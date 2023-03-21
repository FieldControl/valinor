(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('firebase/compat/app'), require('@angular/fire')) :
    typeof define === 'function' && define.amd ? define('@angular/fire/compat', ['exports', '@angular/core', 'firebase/compat/app', '@angular/fire'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.angular = global.angular || {}, global.angular.fire = global.angular.fire || {}, global.angular.fire.compat = {}), global.ng.core, global.firebase, global.angular.fire));
}(this, (function (exports, i0, firebase, fire) { 'use strict';

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

    // DEBUG quick debugger function for inline logging that typescript doesn't complain about
    //       wrote it for debugging the ɵlazySDKProxy, commenting out for now; should consider exposing a
    //       verbose mode for AngularFire in a future release that uses something like this in multiple places
    //       usage: () => log('something') || returnValue
    // const log = (...args: any[]): false => { console.log(...args); return false }
    // The problem here are things like ngOnDestroy are missing, then triggering the service
    // rather than dig too far; I'm capturing these as I go.
    var noopFunctions = ['ngOnDestroy'];
    // INVESTIGATE should we make the Proxy revokable and do some cleanup?
    //             right now it's fairly simple but I'm sure this will grow in complexity
    var ɵlazySDKProxy = function (klass, observable, zone, options) {
        if (options === void 0) { options = {}; }
        return new Proxy(klass, {
            get: function (_, name) { return zone.runOutsideAngular(function () {
                var _a;
                if (klass[name]) {
                    if ((_a = options === null || options === void 0 ? void 0 : options.spy) === null || _a === void 0 ? void 0 : _a.get) {
                        options.spy.get(name, klass[name]);
                    }
                    return klass[name];
                }
                if (noopFunctions.indexOf(name) > -1) {
                    return function () {
                    };
                }
                var promise = observable.toPromise().then(function (mod) {
                    var ret = mod && mod[name];
                    // TODO move to proper type guards
                    if (typeof ret === 'function') {
                        return ret.bind(mod);
                    }
                    else if (ret && ret.then) {
                        return ret.then(function (res) { return zone.run(function () { return res; }); });
                    }
                    else {
                        return zone.run(function () { return ret; });
                    }
                });
                // recurse the proxy
                return new Proxy(function () { }, {
                    get: function (_, name) { return promise[name]; },
                    // TODO handle callbacks as transparently as I can
                    apply: function (self, _, args) { return promise.then(function (it) {
                        var _a;
                        var res = it && it.apply(void 0, __spreadArray([], __read(args)));
                        if ((_a = options === null || options === void 0 ? void 0 : options.spy) === null || _a === void 0 ? void 0 : _a.apply) {
                            options.spy.apply(name, args, res);
                        }
                        return res;
                    }); }
                });
            }); }
        });
    };
    var ɵapplyMixins = function (derivedCtor, constructors) {
        constructors.forEach(function (baseCtor) {
            Object.getOwnPropertyNames(baseCtor.prototype || baseCtor).forEach(function (name) {
                Object.defineProperty(derivedCtor.prototype, name, Object.getOwnPropertyDescriptor(baseCtor.prototype || baseCtor, name));
            });
        });
    };

    var FirebaseApp = /** @class */ (function () {
        function FirebaseApp(app) {
            return app;
        }
        return FirebaseApp;
    }());

    var FIREBASE_OPTIONS = new i0.InjectionToken('angularfire2.app.options');
    var FIREBASE_APP_NAME = new i0.InjectionToken('angularfire2.app.name');
    function ɵfirebaseAppFactory(options, zone, nameOrConfig) {
        var name = typeof nameOrConfig === 'string' && nameOrConfig || '[DEFAULT]';
        var config = typeof nameOrConfig === 'object' && nameOrConfig || {};
        config.name = config.name || name;
        // Added any due to some inconsistency between @firebase/app and firebase types
        var existingApp = firebase__default['default'].apps.filter(function (app) { return app && app.name === config.name; })[0];
        // We support FirebaseConfig, initializeApp's public type only accepts string; need to cast as any
        // Could be solved with https://github.com/firebase/firebase-js-sdk/pull/1206
        var app = (existingApp || zone.runOutsideAngular(function () { return firebase__default['default'].initializeApp(options, config); }));
        try {
            if (JSON.stringify(options) !== JSON.stringify(app.options)) {
                var hmr = !!module.hot;
                log$1('error', app.name + " Firebase App already initialized with different options" + (hmr ? ', you may need to reload as Firebase is not HMR aware.' : '.'));
            }
        }
        catch (e) { }
        return new FirebaseApp(app);
    }
    var log$1 = function (level) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (i0.isDevMode() && typeof console !== 'undefined') {
            console[level].apply(console, __spreadArray([], __read(args)));
        }
    };
    var FIREBASE_APP_PROVIDER = {
        provide: FirebaseApp,
        useFactory: ɵfirebaseAppFactory,
        deps: [
            FIREBASE_OPTIONS,
            i0.NgZone,
            [new i0.Optional(), FIREBASE_APP_NAME]
        ]
    };
    var AngularFireModule = /** @class */ (function () {
        // tslint:disable-next-line:ban-types
        function AngularFireModule(platformId) {
            firebase__default['default'].registerVersion('angularfire', fire.VERSION.full, 'core');
            firebase__default['default'].registerVersion('angularfire', fire.VERSION.full, 'app-compat');
            firebase__default['default'].registerVersion('angular', i0.VERSION.full, platformId.toString());
        }
        AngularFireModule.initializeApp = function (options, nameOrConfig) {
            return {
                ngModule: AngularFireModule,
                providers: [
                    { provide: FIREBASE_OPTIONS, useValue: options },
                    { provide: FIREBASE_APP_NAME, useValue: nameOrConfig }
                ]
            };
        };
        return AngularFireModule;
    }());
    AngularFireModule.ɵfac = i0__namespace.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0__namespace, type: AngularFireModule, deps: [{ token: i0.PLATFORM_ID }], target: i0__namespace.ɵɵFactoryTarget.NgModule });
    AngularFireModule.ɵmod = i0__namespace.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0__namespace, type: AngularFireModule });
    AngularFireModule.ɵinj = i0__namespace.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0__namespace, type: AngularFireModule, providers: [FIREBASE_APP_PROVIDER] });
    i0__namespace.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0__namespace, type: AngularFireModule, decorators: [{
                type: i0.NgModule,
                args: [{
                        providers: [FIREBASE_APP_PROVIDER]
                    }]
            }], ctorParameters: function () {
            return [{ type: Object, decorators: [{
                            type: i0.Inject,
                            args: [i0.PLATFORM_ID]
                        }] }];
        } });

    function ɵcacheInstance(cacheKey, moduleName, appName, fn, deps) {
        var _a = __read(globalThis.ɵAngularfireInstanceCache.find(function (it) { return it[0] === cacheKey; }) || [], 3), instance = _a[1], cachedDeps = _a[2];
        if (instance) {
            if (!matchDep(deps, cachedDeps)) {
                log('error', moduleName + " was already initialized on the " + appName + " Firebase App with different settings." + (IS_HMR ? ' You may need to reload as Firebase is not HMR aware.' : ''));
                log('warn', { is: deps, was: cachedDeps });
            }
            return instance;
        }
        else {
            var newInstance = fn();
            globalThis.ɵAngularfireInstanceCache.push([cacheKey, newInstance, deps]);
            return newInstance;
        }
    }
    function matchDep(a, b) {
        try {
            return a.toString() === b.toString();
        }
        catch (_) {
            return a === b;
        }
    }
    var IS_HMR = !!module.hot;
    var log = function (level) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (i0.isDevMode() && typeof console !== 'undefined') {
            console[level].apply(console, __spreadArray([], __read(args)));
        }
    };
    globalThis.ɵAngularfireInstanceCache || (globalThis.ɵAngularfireInstanceCache = []);

    /**
     * Generated bundle index. Do not edit.
     */

    exports.AngularFireModule = AngularFireModule;
    exports.FIREBASE_APP_NAME = FIREBASE_APP_NAME;
    exports.FIREBASE_OPTIONS = FIREBASE_OPTIONS;
    exports.FirebaseApp = FirebaseApp;
    exports.ɵapplyMixins = ɵapplyMixins;
    exports.ɵcacheInstance = ɵcacheInstance;
    exports.ɵfirebaseAppFactory = ɵfirebaseAppFactory;
    exports.ɵlazySDKProxy = ɵlazySDKProxy;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=angular-fire-compat.umd.js.map
