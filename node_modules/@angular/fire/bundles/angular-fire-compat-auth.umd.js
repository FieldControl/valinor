(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('firebase/compat/auth'), require('@angular/core'), require('rxjs'), require('rxjs/operators'), require('@angular/fire'), require('@angular/fire/compat'), require('@angular/common'), require('@angular/fire/app-check'), require('firebase/compat/app')) :
    typeof define === 'function' && define.amd ? define('@angular/fire/compat/auth', ['exports', 'firebase/compat/auth', '@angular/core', 'rxjs', 'rxjs/operators', '@angular/fire', '@angular/fire/compat', '@angular/common', '@angular/fire/app-check', 'firebase/compat/app'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.angular = global.angular || {}, global.angular.fire = global.angular.fire || {}, global.angular.fire.compat = global.angular.fire.compat || {}, global.angular.fire.compat.auth = {}), null, global.ng.core, global.rxjs, global.rxjs.operators, global.angular.fire, global.angular.fire.compat, global.ng.common, global.angular.fire['app-check'], global.firebase));
}(this, (function (exports, auth, i0, rxjs, operators, i1, compat, common, i2, firebase) { 'use strict';

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
    var i2__namespace = /*#__PURE__*/_interopNamespace(i2);
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
    // Export a null object with the same keys as firebase/compat/auth, so Proxy can work with proxy-polyfill in Internet Explorer
    var proxyPolyfillCompat = {
        name: null,
        config: null,
        emulatorConfig: null,
        app: null,
        applyActionCode: null,
        checkActionCode: null,
        confirmPasswordReset: null,
        createUserWithEmailAndPassword: null,
        currentUser: null,
        fetchSignInMethodsForEmail: null,
        isSignInWithEmailLink: null,
        getRedirectResult: null,
        languageCode: null,
        settings: null,
        onAuthStateChanged: null,
        onIdTokenChanged: null,
        sendSignInLinkToEmail: null,
        sendPasswordResetEmail: null,
        setPersistence: null,
        signInAndRetrieveDataWithCredential: null,
        signInAnonymously: null,
        signInWithCredential: null,
        signInWithCustomToken: null,
        signInWithEmailAndPassword: null,
        signInWithPhoneNumber: null,
        signInWithEmailLink: null,
        signInWithPopup: null,
        signInWithRedirect: null,
        signOut: null,
        tenantId: null,
        updateCurrentUser: null,
        useDeviceLanguage: null,
        useEmulator: null,
        verifyPasswordResetCode: null,
    };

    var USE_EMULATOR = new i0.InjectionToken('angularfire2.auth.use-emulator');
    var SETTINGS = new i0.InjectionToken('angularfire2.auth.settings');
    var TENANT_ID = new i0.InjectionToken('angularfire2.auth.tenant-id');
    var LANGUAGE_CODE = new i0.InjectionToken('angularfire2.auth.langugage-code');
    var USE_DEVICE_LANGUAGE = new i0.InjectionToken('angularfire2.auth.use-device-language');
    var PERSISTENCE = new i0.InjectionToken('angularfire.auth.persistence');
    var ɵauthFactory = function (app, zone, useEmulator, tenantId, languageCode, useDeviceLanguage, settings, persistence) { return compat.ɵcacheInstance(app.name + ".auth", 'AngularFireAuth', app.name, function () {
        var e_1, _a;
        var auth = zone.runOutsideAngular(function () { return app.auth(); });
        if (useEmulator) {
            auth.useEmulator.apply(auth, __spreadArray([], __read(useEmulator)));
        }
        if (tenantId) {
            auth.tenantId = tenantId;
        }
        auth.languageCode = languageCode;
        if (useDeviceLanguage) {
            auth.useDeviceLanguage();
        }
        if (settings) {
            try {
                for (var _b = __values(Object.entries(settings)), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var _d = __read(_c.value, 2), k = _d[0], v = _d[1];
                    auth.settings[k] = v;
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
        if (persistence) {
            auth.setPersistence(persistence);
        }
        return auth;
    }, [useEmulator, tenantId, languageCode, useDeviceLanguage, settings, persistence]); };
    var AngularFireAuth = /** @class */ (function () {
        function AngularFireAuth(options, name, 
        // tslint:disable-next-line:ban-types
        platformId, zone, schedulers, useEmulator, // can't use the tuple here
        settings, // can't use firebase.auth.AuthSettings here
        tenantId, languageCode, useDeviceLanguage, persistence, _appCheckInstances) {
            var logins = new rxjs.Subject();
            var auth = rxjs.of(undefined).pipe(operators.observeOn(schedulers.outsideAngular), operators.switchMap(function () { return zone.runOutsideAngular(function () { return rxjs.of(undefined); }); }), operators.map(function () { return compat.ɵfirebaseAppFactory(options, zone, name); }), operators.map(function (app) { return ɵauthFactory(app, zone, useEmulator, tenantId, languageCode, useDeviceLanguage, settings, persistence); }), operators.shareReplay({ bufferSize: 1, refCount: false }));
            if (common.isPlatformServer(platformId)) {
                this.authState = this.user = this.idToken = this.idTokenResult = this.credential = rxjs.of(null);
            }
            else {
                // HACK, as we're exporting auth.Auth, rather than auth, developers importing firebase.auth
                //       (e.g, `import { auth } from 'firebase/compat/app'`) are getting an undefined auth object unexpectedly
                //       as we're completely lazy. Let's eagerly load the Auth SDK here.
                //       There could potentially be race conditions still... but this greatly decreases the odds while
                //       we reevaluate the API.
                var _ = auth.pipe(operators.first()).subscribe();
                var redirectResult = auth.pipe(operators.switchMap(function (auth) { return auth.getRedirectResult().then(function (it) { return it; }, function () { return null; }); }), i1.keepUnstableUntilFirst, operators.shareReplay({ bufferSize: 1, refCount: false }));
                var authStateChanged = auth.pipe(operators.switchMap(function (auth) { return new rxjs.Observable(function (sub) { return ({ unsubscribe: zone.runOutsideAngular(function () { return auth.onAuthStateChanged(function (next) { return sub.next(next); }, function (err) { return sub.error(err); }, function () { return sub.complete(); }); }) }); }); }));
                var idTokenChanged = auth.pipe(operators.switchMap(function (auth) { return new rxjs.Observable(function (sub) { return ({ unsubscribe: zone.runOutsideAngular(function () { return auth.onIdTokenChanged(function (next) { return sub.next(next); }, function (err) { return sub.error(err); }, function () { return sub.complete(); }); }) }); }); }));
                this.authState = redirectResult.pipe(operators.switchMapTo(authStateChanged), operators.subscribeOn(schedulers.outsideAngular), operators.observeOn(schedulers.insideAngular));
                this.user = redirectResult.pipe(operators.switchMapTo(idTokenChanged), operators.subscribeOn(schedulers.outsideAngular), operators.observeOn(schedulers.insideAngular));
                this.idToken = this.user.pipe(operators.switchMap(function (user) { return user ? rxjs.from(user.getIdToken()) : rxjs.of(null); }));
                this.idTokenResult = this.user.pipe(operators.switchMap(function (user) { return user ? rxjs.from(user.getIdTokenResult()) : rxjs.of(null); }));
                this.credential = rxjs.merge(redirectResult, logins, 
                // pipe in null authState to make credential zipable, just a weird devexp if
                // authState and user go null to still have a credential
                this.authState.pipe(operators.filter(function (it) { return !it; }))).pipe(
                // handle the { user: { } } when a user is already logged in, rather have null
                // TODO handle the type corcersion better
                operators.map(function (credential) { return (credential === null || credential === void 0 ? void 0 : credential.user) ? credential : null; }), operators.subscribeOn(schedulers.outsideAngular), operators.observeOn(schedulers.insideAngular));
            }
            return compat.ɵlazySDKProxy(this, auth, zone, { spy: {
                    apply: function (name, _, val) {
                        // If they call a signIn or createUser function listen into the promise
                        // this will give us the user credential, push onto the logins Subject
                        // to be consumed in .credential
                        if (name.startsWith('signIn') || name.startsWith('createUser')) {
                            // TODO fix the types, the trouble is UserCredential has everything optional
                            val.then(function (user) { return logins.next(user); });
                        }
                    }
                } });
        }
        return AngularFireAuth;
    }());
    AngularFireAuth.ɵfac = i0__namespace.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0__namespace, type: AngularFireAuth, deps: [{ token: compat.FIREBASE_OPTIONS }, { token: compat.FIREBASE_APP_NAME, optional: true }, { token: i0.PLATFORM_ID }, { token: i0__namespace.NgZone }, { token: i1__namespace.ɵAngularFireSchedulers }, { token: USE_EMULATOR, optional: true }, { token: SETTINGS, optional: true }, { token: TENANT_ID, optional: true }, { token: LANGUAGE_CODE, optional: true }, { token: USE_DEVICE_LANGUAGE, optional: true }, { token: PERSISTENCE, optional: true }, { token: i2__namespace.AppCheckInstances, optional: true }], target: i0__namespace.ɵɵFactoryTarget.Injectable });
    AngularFireAuth.ɵprov = i0__namespace.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0__namespace, type: AngularFireAuth, providedIn: 'any' });
    i0__namespace.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0__namespace, type: AngularFireAuth, decorators: [{
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
                        }] }, { type: Object, decorators: [{
                            type: i0.Inject,
                            args: [i0.PLATFORM_ID]
                        }] }, { type: i0__namespace.NgZone }, { type: i1__namespace.ɵAngularFireSchedulers }, { type: undefined, decorators: [{
                            type: i0.Optional
                        }, {
                            type: i0.Inject,
                            args: [USE_EMULATOR]
                        }] }, { type: undefined, decorators: [{
                            type: i0.Optional
                        }, {
                            type: i0.Inject,
                            args: [SETTINGS]
                        }] }, { type: undefined, decorators: [{
                            type: i0.Optional
                        }, {
                            type: i0.Inject,
                            args: [TENANT_ID]
                        }] }, { type: undefined, decorators: [{
                            type: i0.Optional
                        }, {
                            type: i0.Inject,
                            args: [LANGUAGE_CODE]
                        }] }, { type: undefined, decorators: [{
                            type: i0.Optional
                        }, {
                            type: i0.Inject,
                            args: [USE_DEVICE_LANGUAGE]
                        }] }, { type: undefined, decorators: [{
                            type: i0.Optional
                        }, {
                            type: i0.Inject,
                            args: [PERSISTENCE]
                        }] }, { type: i2__namespace.AppCheckInstances, decorators: [{
                            type: i0.Optional
                        }] }];
        } });
    compat.ɵapplyMixins(AngularFireAuth, [proxyPolyfillCompat]);

    var AngularFireAuthModule = /** @class */ (function () {
        function AngularFireAuthModule() {
            firebase__default['default'].registerVersion('angularfire', i1.VERSION.full, 'auth-compat');
        }
        return AngularFireAuthModule;
    }());
    AngularFireAuthModule.ɵfac = i0__namespace.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0__namespace, type: AngularFireAuthModule, deps: [], target: i0__namespace.ɵɵFactoryTarget.NgModule });
    AngularFireAuthModule.ɵmod = i0__namespace.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0__namespace, type: AngularFireAuthModule });
    AngularFireAuthModule.ɵinj = i0__namespace.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0__namespace, type: AngularFireAuthModule, providers: [AngularFireAuth] });
    i0__namespace.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0__namespace, type: AngularFireAuthModule, decorators: [{
                type: i0.NgModule,
                args: [{
                        providers: [AngularFireAuth]
                    }]
            }], ctorParameters: function () { return []; } });

    /**
     * Generated bundle index. Do not edit.
     */

    exports.AngularFireAuth = AngularFireAuth;
    exports.AngularFireAuthModule = AngularFireAuthModule;
    exports.LANGUAGE_CODE = LANGUAGE_CODE;
    exports.PERSISTENCE = PERSISTENCE;
    exports.SETTINGS = SETTINGS;
    exports.TENANT_ID = TENANT_ID;
    exports.USE_DEVICE_LANGUAGE = USE_DEVICE_LANGUAGE;
    exports.USE_EMULATOR = USE_EMULATOR;
    exports.ɵauthFactory = ɵauthFactory;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=angular-fire-compat-auth.umd.js.map
