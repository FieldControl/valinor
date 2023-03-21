(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/fire'), require('rxjs'), require('rxjs/operators'), require('@angular/core'), require('@angular/fire/app'), require('firebase/app'), require('@angular/router'), require('firebase/analytics'), require('@angular/platform-browser'), require('@angular/fire/auth')) :
    typeof define === 'function' && define.amd ? define('@angular/fire/analytics', ['exports', '@angular/fire', 'rxjs', 'rxjs/operators', '@angular/core', '@angular/fire/app', 'firebase/app', '@angular/router', 'firebase/analytics', '@angular/platform-browser', '@angular/fire/auth'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.angular = global.angular || {}, global.angular.fire = global.angular.fire || {}, global.angular.fire.analytics = {}), global.angular.fire, global.rxjs, global.rxjs.operators, global.ng.core, global.angular.fire.app, global.app, global.ng.router, global['firebase-analytics'], global.ng.platformBrowser, global.angular.fire.auth));
}(this, (function (exports, fire, rxjs, operators, i0, app$1, app, i1$1, analytics, i2, i1) { 'use strict';

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
    var i1__namespace$1 = /*#__PURE__*/_interopNamespace(i1$1);
    var i2__namespace = /*#__PURE__*/_interopNamespace(i2);
    var i1__namespace = /*#__PURE__*/_interopNamespace(i1);

    var Analytics = /** @class */ (function () {
        function Analytics(analytics) {
            return analytics;
        }
        return Analytics;
    }());
    var ANALYTICS_PROVIDER_NAME = 'analytics';
    var AnalyticsInstances = /** @class */ (function () {
        function AnalyticsInstances() {
            return fire.ɵgetAllInstancesOf(ANALYTICS_PROVIDER_NAME);
        }
        return AnalyticsInstances;
    }());
    var analyticInstance$ = rxjs.timer(0, 300).pipe(operators.concatMap(function () { return rxjs.from(fire.ɵgetAllInstancesOf(ANALYTICS_PROVIDER_NAME)); }), operators.distinct());

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

    var isSupported = fire.ɵisAnalyticsSupportedFactory.async;

    // DO NOT MODIFY, this file is autogenerated by tools/build.ts
    var getAnalytics = fire.ɵzoneWrap(analytics.getAnalytics, true);
    var initializeAnalytics = fire.ɵzoneWrap(analytics.initializeAnalytics, true);
    var logEvent = fire.ɵzoneWrap(analytics.logEvent, true);
    var setAnalyticsCollectionEnabled = fire.ɵzoneWrap(analytics.setAnalyticsCollectionEnabled, true);
    var setCurrentScreen = fire.ɵzoneWrap(analytics.setCurrentScreen, true);
    var settings = fire.ɵzoneWrap(analytics.settings, true);
    var setUserId = fire.ɵzoneWrap(analytics.setUserId, true);
    var setUserProperties = fire.ɵzoneWrap(analytics.setUserProperties, true);

    var UserTrackingService = /** @class */ (function () {
        function UserTrackingService(auth, zone, injector) {
            var _this = this;
            this.disposables = [];
            app.registerVersion('angularfire', fire.VERSION.full, 'user-tracking');
            var resolveInitialized;
            this.initialized = zone.runOutsideAngular(function () { return new Promise(function (resolve) { resolveInitialized = resolve; }); });
            // The APP_INITIALIZER that is making isSupported() sync for the sake of convenient DI
            // may not be done when services are initialized. Guard the functionality by first ensuring
            // that the (global) promise has resolved, then get Analytics from the injector.
            isSupported().then(function () {
                var analytics = injector.get(Analytics);
                if (analytics) {
                    _this.disposables = [
                        // TODO add credential tracking back in
                        i1.authState(auth).subscribe(function (user) {
                            setUserId(analytics, user === null || user === void 0 ? void 0 : user.uid);
                            resolveInitialized();
                        }),
                    ];
                }
                else {
                    resolveInitialized();
                }
            });
        }
        UserTrackingService.prototype.ngOnDestroy = function () {
            this.disposables.forEach(function (it) { return it.unsubscribe(); });
        };
        return UserTrackingService;
    }());
    UserTrackingService.ɵfac = i0__namespace.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0__namespace, type: UserTrackingService, deps: [{ token: i1__namespace.Auth }, { token: i0__namespace.NgZone }, { token: i0__namespace.Injector }], target: i0__namespace.ɵɵFactoryTarget.Injectable });
    UserTrackingService.ɵprov = i0__namespace.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0__namespace, type: UserTrackingService });
    i0__namespace.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0__namespace, type: UserTrackingService, decorators: [{
                type: i0.Injectable
            }], ctorParameters: function () { return [{ type: i1__namespace.Auth }, { type: i0__namespace.NgZone }, { type: i0__namespace.Injector }]; } });

    var FIREBASE_EVENT_ORIGIN_KEY = 'firebase_event_origin';
    var FIREBASE_PREVIOUS_SCREEN_CLASS_KEY = 'firebase_previous_class';
    var FIREBASE_PREVIOUS_SCREEN_INSTANCE_ID_KEY = 'firebase_previous_id';
    var FIREBASE_PREVIOUS_SCREEN_NAME_KEY = 'firebase_previous_screen';
    var FIREBASE_SCREEN_CLASS_KEY = 'firebase_screen_class';
    var FIREBASE_SCREEN_INSTANCE_ID_KEY = 'firebase_screen_id';
    var FIREBASE_SCREEN_NAME_KEY = 'firebase_screen';
    var OUTLET_KEY = 'outlet';
    var PAGE_PATH_KEY = 'page_path';
    var PAGE_TITLE_KEY = 'page_title';
    var SCREEN_CLASS_KEY = 'screen_class';
    var SCREEN_NAME_KEY = 'screen_name';
    var SCREEN_VIEW_EVENT = 'screen_view';
    var EVENT_ORIGIN_AUTO = 'auto';
    var SCREEN_INSTANCE_DELIMITER = '#';
    // this is an INT64 in iOS/Android but use INT32 cause javascript
    var nextScreenInstanceID = Math.floor(Math.random() * (Math.pow(2, 32) - 1)) - Math.pow(2, 31);
    var knownScreenInstanceIDs = {};
    var getScreenInstanceID = function (params) {
        // unique the screen class against the outlet name
        var screenInstanceKey = [
            params[SCREEN_CLASS_KEY],
            params[OUTLET_KEY]
        ].join(SCREEN_INSTANCE_DELIMITER);
        if (knownScreenInstanceIDs.hasOwnProperty(screenInstanceKey)) {
            return knownScreenInstanceIDs[screenInstanceKey];
        }
        else {
            var ret = nextScreenInstanceID++;
            knownScreenInstanceIDs[screenInstanceKey] = ret;
            return ret;
        }
    };
    var ɵscreenViewEvent = function (router, title, componentFactoryResolver) {
        var activationEndEvents = router.events.pipe(operators.filter(function (e) { return e instanceof i1$1.ActivationEnd; }));
        return activationEndEvents.pipe(operators.switchMap(function (activationEnd) {
            var _b, _c, _d;
            var _a;
            // router parseUrl is having trouble with outlets when they're empty
            // e.g, /asdf/1(bob://sally:asdf), so put another slash in when empty
            var urlTree = router.parseUrl(router.url.replace(/(?:\().+(?:\))/g, function (a) { return a.replace('://', ':///'); }));
            var pagePath = ((_a = urlTree.root.children[activationEnd.snapshot.outlet]) === null || _a === void 0 ? void 0 : _a.toString()) || '';
            var actualSnapshot = router.routerState.root.children.map(function (it) { return it; }).find(function (it) { return it.outlet === activationEnd.snapshot.outlet; });
            if (!actualSnapshot) {
                return rxjs.of(null);
            }
            var actualDeep = actualSnapshot;
            while (actualDeep.firstChild) {
                actualDeep = actualDeep.firstChild;
            }
            var screenName = actualDeep.pathFromRoot.map(function (s) { var _a; return (_a = s.routeConfig) === null || _a === void 0 ? void 0 : _a.path; }).filter(function (it) { return it; }).join('/') || '/';
            var params = (_b = {},
                _b[SCREEN_NAME_KEY] = screenName,
                _b[PAGE_PATH_KEY] = "/" + pagePath,
                _b[FIREBASE_EVENT_ORIGIN_KEY] = EVENT_ORIGIN_AUTO,
                _b[FIREBASE_SCREEN_NAME_KEY] = screenName,
                _b[OUTLET_KEY] = activationEnd.snapshot.outlet,
                _b);
            if (title) {
                params[PAGE_TITLE_KEY] = title.getTitle();
            }
            var component = actualSnapshot.component;
            if (component) {
                if (component === i1$1.ɵEmptyOutletComponent) {
                    var deepSnapshot = activationEnd.snapshot;
                    // TODO when might there be mutple children, different outlets? explore
                    while (deepSnapshot.firstChild) {
                        deepSnapshot = deepSnapshot.firstChild;
                    }
                    component = deepSnapshot.component;
                }
            }
            else {
                component = activationEnd.snapshot.component;
            }
            if (typeof component === 'string') {
                return rxjs.of(Object.assign(Object.assign({}, params), (_c = {}, _c[SCREEN_CLASS_KEY] = component, _c)));
            }
            else if (component) {
                var componentFactory = componentFactoryResolver.resolveComponentFactory(component);
                return rxjs.of(Object.assign(Object.assign({}, params), (_d = {}, _d[SCREEN_CLASS_KEY] = componentFactory.selector, _d)));
            }
            // lazy loads cause extra activations, ignore
            return rxjs.of(null);
        }), operators.filter(function (it) { return !!it; }), operators.map(function (params) {
            var _b;
            return (Object.assign((_b = {}, _b[FIREBASE_SCREEN_CLASS_KEY] = params[SCREEN_CLASS_KEY], _b[FIREBASE_SCREEN_INSTANCE_ID_KEY] = getScreenInstanceID(params), _b), params));
        }), operators.groupBy(function (it) { return it[OUTLET_KEY]; }), operators.mergeMap(function (it) { return it.pipe(operators.distinctUntilChanged(function (a, b) { return JSON.stringify(a) === JSON.stringify(b); }), operators.startWith(undefined), operators.pairwise(), operators.map(function (_b) {
            var _c;
            var _d = __read(_b, 2), prior = _d[0], current = _d[1];
            return prior ? Object.assign((_c = {}, _c[FIREBASE_PREVIOUS_SCREEN_CLASS_KEY] = prior[SCREEN_CLASS_KEY], _c[FIREBASE_PREVIOUS_SCREEN_NAME_KEY] = prior[SCREEN_NAME_KEY], _c[FIREBASE_PREVIOUS_SCREEN_INSTANCE_ID_KEY] = prior[FIREBASE_SCREEN_INSTANCE_ID_KEY], _c), current) : current;
        })); }));
    };
    var ScreenTrackingService = /** @class */ (function () {
        function ScreenTrackingService(router, title, componentFactoryResolver, zone, userTrackingService, injector) {
            var _this = this;
            app.registerVersion('angularfire', fire.VERSION.full, 'screen-tracking');
            // The APP_INITIALIZER that is making isSupported() sync for the sake of convenient DI
            // may not be done when services are initialized. Guard the functionality by first ensuring
            // that the (global) promise has resolved, then get Analytics from the injector.
            isSupported().then(function () {
                var analytics = injector.get(Analytics);
                if (!router || !analytics) {
                    return;
                }
                zone.runOutsideAngular(function () {
                    _this.disposable = ɵscreenViewEvent(router, title, componentFactoryResolver).pipe(operators.switchMap(function (params) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    if (!userTrackingService) return [3 /*break*/, 2];
                                    return [4 /*yield*/, userTrackingService.initialized];
                                case 1:
                                    _b.sent();
                                    _b.label = 2;
                                case 2: return [2 /*return*/, logEvent(analytics, SCREEN_VIEW_EVENT, params)];
                            }
                        });
                    }); })).subscribe();
                });
            });
        }
        ScreenTrackingService.prototype.ngOnDestroy = function () {
            if (this.disposable) {
                this.disposable.unsubscribe();
            }
        };
        return ScreenTrackingService;
    }());
    ScreenTrackingService.ɵfac = i0__namespace.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0__namespace, type: ScreenTrackingService, deps: [{ token: i1__namespace$1.Router, optional: true }, { token: i2__namespace.Title, optional: true }, { token: i0__namespace.ComponentFactoryResolver }, { token: i0__namespace.NgZone }, { token: UserTrackingService, optional: true }, { token: i0__namespace.Injector }], target: i0__namespace.ɵɵFactoryTarget.Injectable });
    ScreenTrackingService.ɵprov = i0__namespace.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0__namespace, type: ScreenTrackingService });
    i0__namespace.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0__namespace, type: ScreenTrackingService, decorators: [{
                type: i0.Injectable
            }], ctorParameters: function () {
            return [{ type: i1__namespace$1.Router, decorators: [{
                            type: i0.Optional
                        }] }, { type: i2__namespace.Title, decorators: [{
                            type: i0.Optional
                        }] }, { type: i0__namespace.ComponentFactoryResolver }, { type: i0__namespace.NgZone }, { type: UserTrackingService, decorators: [{
                            type: i0.Optional
                        }] }, { type: i0__namespace.Injector }];
        } });

    var PROVIDED_ANALYTICS_INSTANCES = new i0.InjectionToken('angularfire2.analytics-instances');
    function defaultAnalyticsInstanceFactory(provided, defaultApp) {
        if (!fire.ɵisAnalyticsSupportedFactory.sync()) {
            return null;
        }
        var defaultAnalytics = fire.ɵgetDefaultInstanceOf(ANALYTICS_PROVIDER_NAME, provided, defaultApp);
        return defaultAnalytics && new Analytics(defaultAnalytics);
    }
    function analyticsInstanceFactory(fn) {
        return function (zone, injector) {
            if (!fire.ɵisAnalyticsSupportedFactory.sync()) {
                return null;
            }
            var analytics = zone.runOutsideAngular(function () { return fn(injector); });
            return new Analytics(analytics);
        };
    }
    var ANALYTICS_INSTANCES_PROVIDER = {
        provide: AnalyticsInstances,
        deps: [
            [new i0.Optional(), PROVIDED_ANALYTICS_INSTANCES],
        ]
    };
    var DEFAULT_ANALYTICS_INSTANCE_PROVIDER = {
        provide: Analytics,
        useFactory: defaultAnalyticsInstanceFactory,
        deps: [
            [new i0.Optional(), PROVIDED_ANALYTICS_INSTANCES],
            app$1.FirebaseApp,
        ]
    };
    var AnalyticsModule = /** @class */ (function () {
        function AnalyticsModule(_screenTrackingService, _userTrackingService) {
            app.registerVersion('angularfire', fire.VERSION.full, 'analytics');
        }
        return AnalyticsModule;
    }());
    AnalyticsModule.ɵfac = i0__namespace.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0__namespace, type: AnalyticsModule, deps: [{ token: ScreenTrackingService, optional: true }, { token: UserTrackingService, optional: true }], target: i0__namespace.ɵɵFactoryTarget.NgModule });
    AnalyticsModule.ɵmod = i0__namespace.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0__namespace, type: AnalyticsModule });
    AnalyticsModule.ɵinj = i0__namespace.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0__namespace, type: AnalyticsModule, providers: [
            DEFAULT_ANALYTICS_INSTANCE_PROVIDER,
            ANALYTICS_INSTANCES_PROVIDER,
            {
                provide: i0.APP_INITIALIZER,
                useValue: fire.ɵisAnalyticsSupportedFactory.async,
                multi: true,
            }
        ] });
    i0__namespace.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0__namespace, type: AnalyticsModule, decorators: [{
                type: i0.NgModule,
                args: [{
                        providers: [
                            DEFAULT_ANALYTICS_INSTANCE_PROVIDER,
                            ANALYTICS_INSTANCES_PROVIDER,
                            {
                                provide: i0.APP_INITIALIZER,
                                useValue: fire.ɵisAnalyticsSupportedFactory.async,
                                multi: true,
                            }
                        ]
                    }]
            }], ctorParameters: function () {
            return [{ type: ScreenTrackingService, decorators: [{
                            type: i0.Optional
                        }] }, { type: UserTrackingService, decorators: [{
                            type: i0.Optional
                        }] }];
        } });
    function provideAnalytics(fn) {
        var deps = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            deps[_i - 1] = arguments[_i];
        }
        return {
            ngModule: AnalyticsModule,
            providers: [{
                    provide: PROVIDED_ANALYTICS_INSTANCES,
                    useFactory: analyticsInstanceFactory(fn),
                    multi: true,
                    deps: __spreadArray([
                        i0.NgZone,
                        i0.Injector,
                        fire.ɵAngularFireSchedulers,
                        app$1.FirebaseApps
                    ], __read(deps))
                }]
        };
    }

    /**
     * Generated bundle index. Do not edit.
     */

    exports.Analytics = Analytics;
    exports.AnalyticsInstances = AnalyticsInstances;
    exports.AnalyticsModule = AnalyticsModule;
    exports.ScreenTrackingService = ScreenTrackingService;
    exports.UserTrackingService = UserTrackingService;
    exports.analyticInstance$ = analyticInstance$;
    exports.getAnalytics = getAnalytics;
    exports.initializeAnalytics = initializeAnalytics;
    exports.isSupported = isSupported;
    exports.logEvent = logEvent;
    exports.provideAnalytics = provideAnalytics;
    exports.setAnalyticsCollectionEnabled = setAnalyticsCollectionEnabled;
    exports.setCurrentScreen = setCurrentScreen;
    exports.setUserId = setUserId;
    exports.setUserProperties = setUserProperties;
    exports.settings = settings;
    exports.ɵscreenViewEvent = ɵscreenViewEvent;
    Object.keys(analytics).forEach(function (k) {
        if (k !== 'default' && !exports.hasOwnProperty(k)) Object.defineProperty(exports, k, {
            enumerable: true,
            get: function () {
                return analytics[k];
            }
        });
    });

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=angular-fire-analytics.umd.js.map
