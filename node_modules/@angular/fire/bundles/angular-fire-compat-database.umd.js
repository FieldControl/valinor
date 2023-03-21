(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('rxjs'), require('rxjs/operators'), require('@angular/fire'), require('@angular/fire/compat'), require('firebase/compat/auth'), require('firebase/compat/database'), require('@angular/fire/compat/auth'), require('@angular/fire/app-check'), require('firebase/compat/app')) :
    typeof define === 'function' && define.amd ? define('@angular/fire/compat/database', ['exports', '@angular/core', 'rxjs', 'rxjs/operators', '@angular/fire', '@angular/fire/compat', 'firebase/compat/auth', 'firebase/compat/database', '@angular/fire/compat/auth', '@angular/fire/app-check', 'firebase/compat/app'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.angular = global.angular || {}, global.angular.fire = global.angular.fire || {}, global.angular.fire.compat = global.angular.fire.compat || {}, global.angular.fire.compat.database = {}), global.ng.core, global.rxjs, global.rxjs.operators, global.angular.fire, global.angular.fire.compat, null, null, global.angular.fire.compat.auth, global.angular.fire['app-check'], global.firebase));
}(this, (function (exports, i0, rxjs, operators, i1, compat, auth, database, i2, i3, firebase) { 'use strict';

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
    var i3__namespace = /*#__PURE__*/_interopNamespace(i3);
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

    function isString(value) {
        return typeof value === 'string';
    }
    function isFirebaseDataSnapshot(value) {
        return typeof value.exportVal === 'function';
    }
    function isNil(obj) {
        return obj === undefined || obj === null;
    }
    function isFirebaseRef(value) {
        return typeof value.set === 'function';
    }
    /**
     * Returns a database reference given a Firebase App and an
     * absolute or relative path.
     * @param database - Firebase Database
     * @param pathRef - Database path, relative or absolute
     */
    function getRef(database, pathRef) {
        // if a db ref was passed in, just return it
        return isFirebaseRef(pathRef) ? pathRef
            : database.ref(pathRef);
    }
    function checkOperationCases(item, cases) {
        if (isString(item)) {
            return cases.stringCase();
        }
        else if (isFirebaseRef(item)) {
            return cases.firebaseCase();
        }
        else if (isFirebaseDataSnapshot(item)) {
            return cases.snapshotCase();
        }
        throw new Error("Expects a string, snapshot, or reference. Got: " + typeof item);
    }

    /**
     * Create an observable from a Database Reference or Database Query.
     * @param ref Database Reference
     * @param event Listen event type ('value', 'added', 'changed', 'removed', 'moved')
     * @param listenType 'on' or 'once'
     * @param scheduler - Rxjs scheduler
     */
    function fromRef(ref, event, listenType, scheduler) {
        if (listenType === void 0) { listenType = 'on'; }
        if (scheduler === void 0) { scheduler = rxjs.asyncScheduler; }
        return new rxjs.Observable(function (subscriber) {
            var fn = null;
            fn = ref[listenType](event, function (snapshot, prevKey) {
                scheduler.schedule(function () {
                    subscriber.next({ snapshot: snapshot, prevKey: prevKey });
                });
                if (listenType === 'once') {
                    scheduler.schedule(function () { return subscriber.complete(); });
                }
            }, function (err) {
                scheduler.schedule(function () { return subscriber.error(err); });
            });
            if (listenType === 'on') {
                return {
                    unsubscribe: function () {
                        if (fn != null) {
                            ref.off(event, fn);
                        }
                    }
                };
            }
            else {
                return {
                    unsubscribe: function () {
                    }
                };
            }
        }).pipe(operators.map(function (payload) {
            var snapshot = payload.snapshot, prevKey = payload.prevKey;
            var key = null;
            if (snapshot.exists()) {
                key = snapshot.key;
            }
            return { type: event, payload: snapshot, prevKey: prevKey, key: key };
        }), operators.share());
    }

    function listChanges(ref, events, scheduler) {
        return fromRef(ref, 'value', 'once', scheduler).pipe(operators.switchMap(function (snapshotAction) {
            var childEvent$ = [rxjs.of(snapshotAction)];
            events.forEach(function (event) { return childEvent$.push(fromRef(ref, event, 'on', scheduler)); });
            return rxjs.merge.apply(void 0, __spreadArray([], __read(childEvent$))).pipe(operators.scan(buildView, []));
        }), operators.distinctUntilChanged());
    }
    function positionFor(changes, key) {
        var len = changes.length;
        for (var i = 0; i < len; i++) {
            if (changes[i].payload.key === key) {
                return i;
            }
        }
        return -1;
    }
    function positionAfter(changes, prevKey) {
        if (isNil(prevKey)) {
            return 0;
        }
        else {
            var i = positionFor(changes, prevKey);
            if (i === -1) {
                return changes.length;
            }
            else {
                return i + 1;
            }
        }
    }
    function buildView(current, action) {
        var payload = action.payload, prevKey = action.prevKey, key = action.key;
        var currentKeyPosition = positionFor(current, key);
        var afterPreviousKeyPosition = positionAfter(current, prevKey);
        switch (action.type) {
            case 'value':
                if (action.payload && action.payload.exists()) {
                    var prevKey_1 = null;
                    action.payload.forEach(function (payload) {
                        var action = { payload: payload, type: 'value', prevKey: prevKey_1, key: payload.key };
                        prevKey_1 = payload.key;
                        current = __spreadArray(__spreadArray([], __read(current)), [action]);
                        return false;
                    });
                }
                return current;
            case 'child_added':
                if (currentKeyPosition > -1) {
                    // check that the previouskey is what we expect, else reorder
                    var previous = current[currentKeyPosition - 1];
                    if ((previous && previous.key || null) !== prevKey) {
                        current = current.filter(function (x) { return x.payload.key !== payload.key; });
                        current.splice(afterPreviousKeyPosition, 0, action);
                    }
                }
                else if (prevKey == null) {
                    return __spreadArray([action], __read(current));
                }
                else {
                    current = current.slice();
                    current.splice(afterPreviousKeyPosition, 0, action);
                }
                return current;
            case 'child_removed':
                return current.filter(function (x) { return x.payload.key !== payload.key; });
            case 'child_changed':
                return current.map(function (x) { return x.payload.key === key ? action : x; });
            case 'child_moved':
                if (currentKeyPosition > -1) {
                    var data = current.splice(currentKeyPosition, 1)[0];
                    current = current.slice();
                    current.splice(afterPreviousKeyPosition, 0, data);
                    return current;
                }
                return current;
            // default will also remove null results
            default:
                return current;
        }
    }

    function validateEventsArray(events) {
        if (isNil(events) || events.length === 0) {
            events = ['child_added', 'child_removed', 'child_changed', 'child_moved'];
        }
        return events;
    }

    function snapshotChanges(query, events, scheduler) {
        events = validateEventsArray(events);
        return listChanges(query, events, scheduler);
    }

    function stateChanges(query, events, scheduler) {
        events = validateEventsArray(events);
        var childEvent$ = events.map(function (event) { return fromRef(query, event, 'on', scheduler); });
        return rxjs.merge.apply(void 0, __spreadArray([], __read(childEvent$)));
    }

    function auditTrail(query, events, scheduler) {
        var auditTrail$ = stateChanges(query, events)
            .pipe(operators.scan(function (current, action) { return __spreadArray(__spreadArray([], __read(current)), [action]); }, []));
        return waitForLoaded(query, auditTrail$, scheduler);
    }
    function loadedData(query, scheduler) {
        // Create an observable of loaded values to retrieve the
        // known dataset. This will allow us to know what key to
        // emit the "whole" array at when listening for child events.
        return fromRef(query, 'value', 'on', scheduler)
            .pipe(operators.map(function (data) {
            // Store the last key in the data set
            var lastKeyToLoad;
            // Loop through loaded dataset to find the last key
            data.payload.forEach(function (child) {
                lastKeyToLoad = child.key;
                return false;
            });
            // return data set and the current last key loaded
            return { data: data, lastKeyToLoad: lastKeyToLoad };
        }));
    }
    function waitForLoaded(query, action$, scheduler) {
        var loaded$ = loadedData(query, scheduler);
        return loaded$
            .pipe(operators.withLatestFrom(action$), 
        // Get the latest values from the "loaded" and "child" datasets
        // We can use both datasets to form an array of the latest values.
        operators.map(function (_a) {
            var _b = __read(_a, 2), loaded = _b[0], actions = _b[1];
            // Store the last key in the data set
            var lastKeyToLoad = loaded.lastKeyToLoad;
            // Store all child keys loaded at this point
            var loadedKeys = actions.map(function (snap) { return snap.key; });
            return { actions: actions, lastKeyToLoad: lastKeyToLoad, loadedKeys: loadedKeys };
        }), 
        // This is the magical part, only emit when the last load key
        // in the dataset has been loaded by a child event. At this point
        // we can assume the dataset is "whole".
        operators.skipWhile(function (meta) { return meta.loadedKeys.indexOf(meta.lastKeyToLoad) === -1; }), 
        // Pluck off the meta data because the user only cares
        // to iterate through the snapshots
        operators.map(function (meta) { return meta.actions; }));
    }

    function createDataOperationMethod(ref, operation) {
        return function dataOperation(item, value) {
            return checkOperationCases(item, {
                stringCase: function () { return ref.child(item)[operation](value); },
                firebaseCase: function () { return item[operation](value); },
                snapshotCase: function () { return item.ref[operation](value); }
            });
        };
    }

    // TODO(davideast): Find out why TS thinks this returns firebase.Primise
    // instead of Promise.
    function createRemoveMethod(ref) {
        return function remove(item) {
            if (!item) {
                return ref.remove();
            }
            return checkOperationCases(item, {
                stringCase: function () { return ref.child(item).remove(); },
                firebaseCase: function () { return item.remove(); },
                snapshotCase: function () { return item.ref.remove(); }
            });
        };
    }

    function createListReference(query, afDatabase) {
        var outsideAngularScheduler = afDatabase.schedulers.outsideAngular;
        var refInZone = afDatabase.schedulers.ngZone.run(function () { return query.ref; });
        return {
            query: query,
            update: createDataOperationMethod(refInZone, 'update'),
            set: createDataOperationMethod(refInZone, 'set'),
            push: function (data) { return refInZone.push(data); },
            remove: createRemoveMethod(refInZone),
            snapshotChanges: function (events) {
                return snapshotChanges(query, events, outsideAngularScheduler).pipe(i1.keepUnstableUntilFirst);
            },
            stateChanges: function (events) {
                return stateChanges(query, events, outsideAngularScheduler).pipe(i1.keepUnstableUntilFirst);
            },
            auditTrail: function (events) {
                return auditTrail(query, events, outsideAngularScheduler).pipe(i1.keepUnstableUntilFirst);
            },
            valueChanges: function (events, options) {
                var snapshotChanges$ = snapshotChanges(query, events, outsideAngularScheduler);
                return snapshotChanges$.pipe(operators.map(function (actions) { return actions.map(function (a) {
                    var _a;
                    if (options && options.idField) {
                        return Object.assign(Object.assign({}, a.payload.val()), (_a = {},
                            _a[options.idField] = a.key,
                            _a));
                    }
                    else {
                        return a.payload.val();
                    }
                }); }), i1.keepUnstableUntilFirst);
            }
        };
    }

    function createObjectSnapshotChanges(query, scheduler) {
        return function snapshotChanges() {
            return fromRef(query, 'value', 'on', scheduler);
        };
    }

    function createObjectReference(query, afDatabase) {
        return {
            query: query,
            snapshotChanges: function () {
                return createObjectSnapshotChanges(query, afDatabase.schedulers.outsideAngular)().pipe(i1.keepUnstableUntilFirst);
            },
            update: function (data) { return query.ref.update(data); },
            set: function (data) { return query.ref.set(data); },
            remove: function () { return query.ref.remove(); },
            valueChanges: function () {
                var snapshotChanges$ = createObjectSnapshotChanges(query, afDatabase.schedulers.outsideAngular)();
                return snapshotChanges$.pipe(i1.keepUnstableUntilFirst, operators.map(function (action) { return action.payload.exists() ? action.payload.val() : null; }));
            },
        };
    }

    var URL = new i0.InjectionToken('angularfire2.realtimeDatabaseURL');
    var USE_EMULATOR = new i0.InjectionToken('angularfire2.database.use-emulator');
    var AngularFireDatabase = /** @class */ (function () {
        function AngularFireDatabase(options, name, databaseURL, 
        // tslint:disable-next-line:ban-types
        platformId, zone, schedulers, _useEmulator, // tuple isn't working here
        auth, useAuthEmulator, authSettings, // can't use firebase.auth.AuthSettings here
        tenantId, languageCode, useDeviceLanguage, persistence, _appCheckInstances) {
            this.schedulers = schedulers;
            var useEmulator = _useEmulator;
            var app = compat.ɵfirebaseAppFactory(options, zone, name);
            if (auth) {
                i2.ɵauthFactory(app, zone, useAuthEmulator, tenantId, languageCode, useDeviceLanguage, authSettings, persistence);
            }
            this.database = compat.ɵcacheInstance(app.name + ".database." + databaseURL, 'AngularFireDatabase', app.name, function () {
                var database = zone.runOutsideAngular(function () { return app.database(databaseURL || undefined); });
                if (useEmulator) {
                    database.useEmulator.apply(database, __spreadArray([], __read(useEmulator)));
                }
                return database;
            }, [useEmulator]);
        }
        AngularFireDatabase.prototype.list = function (pathOrRef, queryFn) {
            var _this = this;
            var ref = this.schedulers.ngZone.runOutsideAngular(function () { return getRef(_this.database, pathOrRef); });
            var query = ref;
            if (queryFn) {
                query = queryFn(ref);
            }
            return createListReference(query, this);
        };
        AngularFireDatabase.prototype.object = function (pathOrRef) {
            var _this = this;
            var ref = this.schedulers.ngZone.runOutsideAngular(function () { return getRef(_this.database, pathOrRef); });
            return createObjectReference(ref, this);
        };
        AngularFireDatabase.prototype.createPushId = function () {
            var _this = this;
            var ref = this.schedulers.ngZone.runOutsideAngular(function () { return _this.database.ref(); });
            return ref.push().key;
        };
        return AngularFireDatabase;
    }());
    AngularFireDatabase.ɵfac = i0__namespace.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0__namespace, type: AngularFireDatabase, deps: [{ token: compat.FIREBASE_OPTIONS }, { token: compat.FIREBASE_APP_NAME, optional: true }, { token: URL, optional: true }, { token: i0.PLATFORM_ID }, { token: i0__namespace.NgZone }, { token: i1__namespace.ɵAngularFireSchedulers }, { token: USE_EMULATOR, optional: true }, { token: i2__namespace.AngularFireAuth, optional: true }, { token: i2.USE_EMULATOR, optional: true }, { token: i2.SETTINGS, optional: true }, { token: i2.TENANT_ID, optional: true }, { token: i2.LANGUAGE_CODE, optional: true }, { token: i2.USE_DEVICE_LANGUAGE, optional: true }, { token: i2.PERSISTENCE, optional: true }, { token: i3__namespace.AppCheckInstances, optional: true }], target: i0__namespace.ɵɵFactoryTarget.Injectable });
    AngularFireDatabase.ɵprov = i0__namespace.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0__namespace, type: AngularFireDatabase, providedIn: 'any' });
    i0__namespace.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0__namespace, type: AngularFireDatabase, decorators: [{
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
                            args: [URL]
                        }] }, { type: Object, decorators: [{
                            type: i0.Inject,
                            args: [i0.PLATFORM_ID]
                        }] }, { type: i0__namespace.NgZone }, { type: i1__namespace.ɵAngularFireSchedulers }, { type: undefined, decorators: [{
                            type: i0.Optional
                        }, {
                            type: i0.Inject,
                            args: [USE_EMULATOR]
                        }] }, { type: i2__namespace.AngularFireAuth, decorators: [{
                            type: i0.Optional
                        }] }, { type: undefined, decorators: [{
                            type: i0.Optional
                        }, {
                            type: i0.Inject,
                            args: [i2.USE_EMULATOR]
                        }] }, { type: undefined, decorators: [{
                            type: i0.Optional
                        }, {
                            type: i0.Inject,
                            args: [i2.SETTINGS]
                        }] }, { type: undefined, decorators: [{
                            type: i0.Optional
                        }, {
                            type: i0.Inject,
                            args: [i2.TENANT_ID]
                        }] }, { type: undefined, decorators: [{
                            type: i0.Optional
                        }, {
                            type: i0.Inject,
                            args: [i2.LANGUAGE_CODE]
                        }] }, { type: undefined, decorators: [{
                            type: i0.Optional
                        }, {
                            type: i0.Inject,
                            args: [i2.USE_DEVICE_LANGUAGE]
                        }] }, { type: undefined, decorators: [{
                            type: i0.Optional
                        }, {
                            type: i0.Inject,
                            args: [i2.PERSISTENCE]
                        }] }, { type: i3__namespace.AppCheckInstances, decorators: [{
                            type: i0.Optional
                        }] }];
        } });

    var AngularFireDatabaseModule = /** @class */ (function () {
        function AngularFireDatabaseModule() {
            firebase__default['default'].registerVersion('angularfire', i1.VERSION.full, 'rtdb-compat');
        }
        return AngularFireDatabaseModule;
    }());
    AngularFireDatabaseModule.ɵfac = i0__namespace.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0__namespace, type: AngularFireDatabaseModule, deps: [], target: i0__namespace.ɵɵFactoryTarget.NgModule });
    AngularFireDatabaseModule.ɵmod = i0__namespace.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0__namespace, type: AngularFireDatabaseModule });
    AngularFireDatabaseModule.ɵinj = i0__namespace.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0__namespace, type: AngularFireDatabaseModule, providers: [AngularFireDatabase] });
    i0__namespace.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0__namespace, type: AngularFireDatabaseModule, decorators: [{
                type: i0.NgModule,
                args: [{
                        providers: [AngularFireDatabase]
                    }]
            }], ctorParameters: function () { return []; } });

    /**
     * Generated bundle index. Do not edit.
     */

    exports.AngularFireDatabase = AngularFireDatabase;
    exports.AngularFireDatabaseModule = AngularFireDatabaseModule;
    exports.URL = URL;
    exports.USE_EMULATOR = USE_EMULATOR;
    exports.auditTrail = auditTrail;
    exports.createListReference = createListReference;
    exports.fromRef = fromRef;
    exports.listChanges = listChanges;
    exports.snapshotChanges = snapshotChanges;
    exports.stateChanges = stateChanges;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=angular-fire-compat-database.umd.js.map
