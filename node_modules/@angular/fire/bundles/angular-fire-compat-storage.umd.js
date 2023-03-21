(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('rxjs'), require('rxjs/operators'), require('@angular/fire'), require('@angular/core'), require('@angular/fire/compat'), require('firebase/compat/storage'), require('@angular/fire/app-check'), require('@angular/common'), require('@angular/platform-browser'), require('firebase/compat/app')) :
    typeof define === 'function' && define.amd ? define('@angular/fire/compat/storage', ['exports', 'rxjs', 'rxjs/operators', '@angular/fire', '@angular/core', '@angular/fire/compat', 'firebase/compat/storage', '@angular/fire/app-check', '@angular/common', '@angular/platform-browser', 'firebase/compat/app'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.angular = global.angular || {}, global.angular.fire = global.angular.fire || {}, global.angular.fire.compat = global.angular.fire.compat || {}, global.angular.fire.compat.storage = {}), global.rxjs, global.rxjs.operators, global.angular.fire, global.ng.core, global.angular.fire.compat, null, global.angular.fire['app-check'], global.ng.common, global.ng.platformBrowser, global.firebase));
}(this, (function (exports, rxjs, operators, i1, i0, compat, storage, i2, common, i2$1, firebase) { 'use strict';

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

    var i1__namespace = /*#__PURE__*/_interopNamespace(i1);
    var i0__namespace = /*#__PURE__*/_interopNamespace(i0);
    var i2__namespace = /*#__PURE__*/_interopNamespace(i2);
    var i2__namespace$1 = /*#__PURE__*/_interopNamespace(i2$1);
    var firebase__default = /*#__PURE__*/_interopDefaultLegacy(firebase);

    // Things aren't working great, I'm having to put in a lot of work-arounds for what
    // appear to be Firebase JS SDK bugs https://github.com/firebase/firebase-js-sdk/issues/4158
    function fromTask(task) {
        return new rxjs.Observable(function (subscriber) {
            var progress = function (snap) { return subscriber.next(snap); };
            var error = function (e) { return subscriber.error(e); };
            var complete = function () { return subscriber.complete(); };
            // emit the current snapshot, so they don't have to wait for state_changes
            // to fire next... this is stale if the task is no longer running :(
            progress(task.snapshot);
            var unsub = task.on('state_changed', progress);
            // it turns out that neither task snapshot nor 'state_changed' fire the last
            // snapshot before completion, the one with status 'success" and 100% progress
            // so let's use the promise form of the task for that
            task.then(function (snapshot) {
                progress(snapshot);
                complete();
            }, function (e) {
                // TODO investigate, again this is stale, we never fire a canceled or error it seems
                progress(task.snapshot);
                error(e);
            });
            // on's type if Function, rather than () => void, need to wrap
            return function unsubscribe() {
                unsub();
            };
        }).pipe(
        // deal with sync emissions from first emitting `task.snapshot`, this makes sure
        // that if the task is already finished we don't emit the old running state
        operators.debounceTime(0));
    }

    /**
     * Create an AngularFireUploadTask from a regular UploadTask from the Storage SDK.
     * This method creates an observable of the upload and returns on object that provides
     * multiple methods for controlling and monitoring the file upload.
     */
    function createUploadTask(task) {
        var inner$ = fromTask(task);
        return {
            task: task,
            then: task.then.bind(task),
            catch: task.catch.bind(task),
            pause: task.pause.bind(task),
            cancel: task.cancel.bind(task),
            resume: task.resume.bind(task),
            snapshotChanges: function () { return inner$; },
            percentageChanges: function () { return inner$.pipe(operators.map(function (s) { return s.bytesTransferred / s.totalBytes * 100; })); }
        };
    }

    /**
     * Create an AngularFire wrapped Storage Reference. This object
     * creates observable methods from promise based methods.
     */
    function createStorageRef(ref) {
        return {
            getDownloadURL: function () { return rxjs.of(undefined).pipe(i1.observeOutsideAngular, operators.switchMap(function () { return ref.getDownloadURL(); }), i1.keepUnstableUntilFirst); },
            getMetadata: function () { return rxjs.of(undefined).pipe(i1.observeOutsideAngular, operators.switchMap(function () { return ref.getMetadata(); }), i1.keepUnstableUntilFirst); },
            delete: function () { return rxjs.from(ref.delete()); },
            child: function (path) { return createStorageRef(ref.child(path)); },
            updateMetadata: function (meta) { return rxjs.from(ref.updateMetadata(meta)); },
            put: function (data, metadata) {
                var task = ref.put(data, metadata);
                return createUploadTask(task);
            },
            putString: function (data, format, metadata) {
                var task = ref.putString(data, format, metadata);
                return createUploadTask(task);
            },
            list: function (options) { return rxjs.from(ref.list(options)); },
            listAll: function () { return rxjs.from(ref.listAll()); }
        };
    }

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

    var BUCKET = new i0.InjectionToken('angularfire2.storageBucket');
    var MAX_UPLOAD_RETRY_TIME = new i0.InjectionToken('angularfire2.storage.maxUploadRetryTime');
    var MAX_OPERATION_RETRY_TIME = new i0.InjectionToken('angularfire2.storage.maxOperationRetryTime');
    var USE_EMULATOR = new i0.InjectionToken('angularfire2.storage.use-emulator');
    /**
     * AngularFireStorage Service
     *
     * This service is the main entry point for this feature module. It provides
     * an API for uploading and downloading binary files from Cloud Storage for
     * Firebase.
     */
    var AngularFireStorage = /** @class */ (function () {
        function AngularFireStorage(options, name, storageBucket, 
        // tslint:disable-next-line:ban-types
        platformId, zone, schedulers, maxUploadRetryTime, maxOperationRetryTime, _useEmulator, _appCheckInstances) {
            var app = compat.ɵfirebaseAppFactory(options, zone, name);
            this.storage = compat.ɵcacheInstance(app.name + ".storage." + storageBucket, 'AngularFireStorage', app.name, function () {
                var storage = zone.runOutsideAngular(function () { return app.storage(storageBucket || undefined); });
                var useEmulator = _useEmulator;
                if (useEmulator) {
                    storage.useEmulator.apply(storage, __spreadArray([], __read(useEmulator)));
                }
                if (maxUploadRetryTime) {
                    storage.setMaxUploadRetryTime(maxUploadRetryTime);
                }
                if (maxOperationRetryTime) {
                    storage.setMaxOperationRetryTime(maxOperationRetryTime);
                }
                return storage;
            }, [maxUploadRetryTime, maxOperationRetryTime]);
        }
        AngularFireStorage.prototype.ref = function (path) {
            return createStorageRef(this.storage.ref(path));
        };
        AngularFireStorage.prototype.refFromURL = function (path) {
            return createStorageRef(this.storage.refFromURL(path));
        };
        AngularFireStorage.prototype.upload = function (path, data, metadata) {
            var storageRef = this.storage.ref(path);
            var ref = createStorageRef(storageRef);
            return ref.put(data, metadata);
        };
        return AngularFireStorage;
    }());
    AngularFireStorage.ɵfac = i0__namespace.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0__namespace, type: AngularFireStorage, deps: [{ token: compat.FIREBASE_OPTIONS }, { token: compat.FIREBASE_APP_NAME, optional: true }, { token: BUCKET, optional: true }, { token: i0.PLATFORM_ID }, { token: i0__namespace.NgZone }, { token: i1__namespace.ɵAngularFireSchedulers }, { token: MAX_UPLOAD_RETRY_TIME, optional: true }, { token: MAX_OPERATION_RETRY_TIME, optional: true }, { token: USE_EMULATOR, optional: true }, { token: i2__namespace.AppCheckInstances, optional: true }], target: i0__namespace.ɵɵFactoryTarget.Injectable });
    AngularFireStorage.ɵprov = i0__namespace.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0__namespace, type: AngularFireStorage, providedIn: 'any' });
    i0__namespace.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0__namespace, type: AngularFireStorage, decorators: [{
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
                            args: [BUCKET]
                        }] }, { type: Object, decorators: [{
                            type: i0.Inject,
                            args: [i0.PLATFORM_ID]
                        }] }, { type: i0__namespace.NgZone }, { type: i1__namespace.ɵAngularFireSchedulers }, { type: undefined, decorators: [{
                            type: i0.Optional
                        }, {
                            type: i0.Inject,
                            args: [MAX_UPLOAD_RETRY_TIME]
                        }] }, { type: undefined, decorators: [{
                            type: i0.Optional
                        }, {
                            type: i0.Inject,
                            args: [MAX_OPERATION_RETRY_TIME]
                        }] }, { type: undefined, decorators: [{
                            type: i0.Optional
                        }, {
                            type: i0.Inject,
                            args: [USE_EMULATOR]
                        }] }, { type: i2__namespace.AppCheckInstances, decorators: [{
                            type: i0.Optional
                        }] }];
        } });

    /** to be used with in combination with | async */
    var GetDownloadURLPipe = /** @class */ (function () {
        function GetDownloadURLPipe(storage, cdr, state) {
            this.storage = storage;
            this.state = state;
            this.asyncPipe = new common.AsyncPipe(cdr);
        }
        GetDownloadURLPipe.prototype.transform = function (path) {
            var _this = this;
            var _a;
            if (path !== this.path) {
                this.path = path;
                var key_1 = i2$1.makeStateKey("|getDownloadURL|" + path);
                var existing = (_a = this.state) === null || _a === void 0 ? void 0 : _a.get(key_1, undefined);
                this.downloadUrl$ = existing ? rxjs.of(existing) : this.storage.ref(path).getDownloadURL().pipe(operators.tap(function (it) { var _a; return (_a = _this.state) === null || _a === void 0 ? void 0 : _a.set(key_1, it); }));
            }
            return this.asyncPipe.transform(this.downloadUrl$);
        };
        GetDownloadURLPipe.prototype.ngOnDestroy = function () {
            this.asyncPipe.ngOnDestroy();
        };
        return GetDownloadURLPipe;
    }());
    GetDownloadURLPipe.ɵfac = i0__namespace.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0__namespace, type: GetDownloadURLPipe, deps: [{ token: AngularFireStorage }, { token: i0__namespace.ChangeDetectorRef }, { token: i2__namespace$1.TransferState, optional: true }], target: i0__namespace.ɵɵFactoryTarget.Pipe });
    GetDownloadURLPipe.ɵpipe = i0__namespace.ɵɵngDeclarePipe({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0__namespace, type: GetDownloadURLPipe, name: "getDownloadURL", pure: false });
    i0__namespace.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0__namespace, type: GetDownloadURLPipe, decorators: [{
                type: i0.Pipe,
                args: [{
                        name: 'getDownloadURL',
                        pure: false,
                    }]
            }], ctorParameters: function () {
            return [{ type: AngularFireStorage }, { type: i0__namespace.ChangeDetectorRef }, { type: i2__namespace$1.TransferState, decorators: [{
                            type: i0.Optional
                        }] }];
        } });
    var GetDownloadURLPipeModule = /** @class */ (function () {
        function GetDownloadURLPipeModule() {
        }
        return GetDownloadURLPipeModule;
    }());
    GetDownloadURLPipeModule.ɵfac = i0__namespace.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0__namespace, type: GetDownloadURLPipeModule, deps: [], target: i0__namespace.ɵɵFactoryTarget.NgModule });
    GetDownloadURLPipeModule.ɵmod = i0__namespace.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0__namespace, type: GetDownloadURLPipeModule, declarations: [GetDownloadURLPipe], exports: [GetDownloadURLPipe] });
    GetDownloadURLPipeModule.ɵinj = i0__namespace.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0__namespace, type: GetDownloadURLPipeModule });
    i0__namespace.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0__namespace, type: GetDownloadURLPipeModule, decorators: [{
                type: i0.NgModule,
                args: [{
                        declarations: [GetDownloadURLPipe],
                        exports: [GetDownloadURLPipe],
                    }]
            }] });

    var AngularFireStorageModule = /** @class */ (function () {
        function AngularFireStorageModule() {
            firebase__default['default'].registerVersion('angularfire', i1.VERSION.full, 'gcs-compat');
        }
        return AngularFireStorageModule;
    }());
    AngularFireStorageModule.ɵfac = i0__namespace.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0__namespace, type: AngularFireStorageModule, deps: [], target: i0__namespace.ɵɵFactoryTarget.NgModule });
    AngularFireStorageModule.ɵmod = i0__namespace.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0__namespace, type: AngularFireStorageModule, exports: [GetDownloadURLPipeModule] });
    AngularFireStorageModule.ɵinj = i0__namespace.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0__namespace, type: AngularFireStorageModule, providers: [AngularFireStorage], imports: [GetDownloadURLPipeModule] });
    i0__namespace.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0__namespace, type: AngularFireStorageModule, decorators: [{
                type: i0.NgModule,
                args: [{
                        exports: [GetDownloadURLPipeModule],
                        providers: [AngularFireStorage]
                    }]
            }], ctorParameters: function () { return []; } });

    /**
     * Generated bundle index. Do not edit.
     */

    exports.AngularFireStorage = AngularFireStorage;
    exports.AngularFireStorageModule = AngularFireStorageModule;
    exports.BUCKET = BUCKET;
    exports.GetDownloadURLPipe = GetDownloadURLPipe;
    exports.GetDownloadURLPipeModule = GetDownloadURLPipeModule;
    exports.MAX_OPERATION_RETRY_TIME = MAX_OPERATION_RETRY_TIME;
    exports.MAX_UPLOAD_RETRY_TIME = MAX_UPLOAD_RETRY_TIME;
    exports.USE_EMULATOR = USE_EMULATOR;
    exports.createStorageRef = createStorageRef;
    exports.createUploadTask = createUploadTask;
    exports.fromTask = fromTask;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=angular-fire-compat-storage.umd.js.map
