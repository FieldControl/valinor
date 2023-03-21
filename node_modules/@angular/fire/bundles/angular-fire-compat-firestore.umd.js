(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('rxjs'), require('@angular/fire'), require('rxjs/operators'), require('@angular/fire/compat'), require('@angular/common'), require('firebase/compat/auth'), require('firebase/compat/firestore'), require('@angular/fire/compat/auth'), require('@angular/fire/app-check'), require('firebase/compat/app')) :
    typeof define === 'function' && define.amd ? define('@angular/fire/compat/firestore', ['exports', '@angular/core', 'rxjs', '@angular/fire', 'rxjs/operators', '@angular/fire/compat', '@angular/common', 'firebase/compat/auth', 'firebase/compat/firestore', '@angular/fire/compat/auth', '@angular/fire/app-check', 'firebase/compat/app'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.angular = global.angular || {}, global.angular.fire = global.angular.fire || {}, global.angular.fire.compat = global.angular.fire.compat || {}, global.angular.fire.compat.firestore = {}), global.ng.core, global.rxjs, global.angular.fire, global.rxjs.operators, global.angular.fire.compat, global.ng.common, null, null, global.angular.fire.compat.auth, global.angular.fire['app-check'], global.firebase));
}(this, (function (exports, i0, rxjs, i1, operators, compat, common, auth, firestore, i2, i3, firebase) { 'use strict';

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

    function _fromRef(ref, scheduler) {
        if (scheduler === void 0) { scheduler = rxjs.asyncScheduler; }
        return new rxjs.Observable(function (subscriber) {
            var unsubscribe;
            if (scheduler != null) {
                scheduler.schedule(function () {
                    unsubscribe = ref.onSnapshot({ includeMetadataChanges: true }, subscriber);
                });
            }
            else {
                unsubscribe = ref.onSnapshot({ includeMetadataChanges: true }, subscriber);
            }
            return function () {
                if (unsubscribe != null) {
                    unsubscribe();
                }
            };
        });
    }
    function fromRef(ref, scheduler) {
        return _fromRef(ref, scheduler);
    }
    function fromDocRef(ref, scheduler) {
        return fromRef(ref, scheduler)
            .pipe(operators.startWith(undefined), operators.pairwise(), operators.map(function (_a) {
            var _b = __read(_a, 2), priorPayload = _b[0], payload = _b[1];
            if (!payload.exists) {
                return { payload: payload, type: 'removed' };
            }
            if (!(priorPayload === null || priorPayload === void 0 ? void 0 : priorPayload.exists)) {
                return { payload: payload, type: 'added' };
            }
            return { payload: payload, type: 'modified' };
        }));
    }
    function fromCollectionRef(ref, scheduler) {
        return fromRef(ref, scheduler).pipe(operators.map(function (payload) { return ({ payload: payload, type: 'query' }); }));
    }

    /**
     * Return a stream of document changes on a query. These results are not in sort order but in
     * order of occurence.
     */
    function docChanges(query, scheduler) {
        return fromCollectionRef(query, scheduler)
            .pipe(operators.startWith(undefined), operators.pairwise(), operators.map(function (_a) {
            var _b = __read(_a, 2), priorAction = _b[0], action = _b[1];
            var docChanges = action.payload.docChanges();
            var actions = docChanges.map(function (change) { return ({ type: change.type, payload: change }); });
            // the metadata has changed from the prior emission
            if (priorAction && JSON.stringify(priorAction.payload.metadata) !== JSON.stringify(action.payload.metadata)) {
                // go through all the docs in payload and figure out which ones changed
                action.payload.docs.forEach(function (currentDoc, currentIndex) {
                    var docChange = docChanges.find(function (d) { return d.doc.ref.isEqual(currentDoc.ref); });
                    var priorDoc = priorAction === null || priorAction === void 0 ? void 0 : priorAction.payload.docs.find(function (d) { return d.ref.isEqual(currentDoc.ref); });
                    if (docChange && JSON.stringify(docChange.doc.metadata) === JSON.stringify(currentDoc.metadata) ||
                        !docChange && priorDoc && JSON.stringify(priorDoc.metadata) === JSON.stringify(currentDoc.metadata)) {
                        // document doesn't appear to have changed, don't log another action
                    }
                    else {
                        // since the actions are processed in order just push onto the array
                        actions.push({
                            type: 'modified',
                            payload: {
                                oldIndex: currentIndex,
                                newIndex: currentIndex,
                                type: 'modified',
                                doc: currentDoc
                            }
                        });
                    }
                });
            }
            return actions;
        }));
    }
    /**
     * Return a stream of document changes on a query. These results are in sort order.
     */
    function sortedChanges(query, events, scheduler) {
        return docChanges(query, scheduler)
            .pipe(operators.scan(function (current, changes) { return combineChanges(current, changes.map(function (it) { return it.payload; }), events); }, []), operators.distinctUntilChanged(), // cut down on unneed change cycles
        operators.map(function (changes) { return changes.map(function (c) { return ({ type: c.type, payload: c }); }); }));
    }
    /**
     * Combines the total result set from the current set of changes from an incoming set
     * of changes.
     */
    function combineChanges(current, changes, events) {
        changes.forEach(function (change) {
            // skip unwanted change types
            if (events.indexOf(change.type) > -1) {
                current = combineChange(current, change);
            }
        });
        return current;
    }
    /**
     * Splice arguments on top of a sliced array, to break top-level ===
     * this is useful for change-detection
     */
    function sliceAndSplice(original, start, deleteCount) {
        var args = [];
        for (var _i = 3; _i < arguments.length; _i++) {
            args[_i - 3] = arguments[_i];
        }
        var returnArray = original.slice();
        returnArray.splice.apply(returnArray, __spreadArray([start, deleteCount], __read(args)));
        return returnArray;
    }
    /**
     * Creates a new sorted array from a new change.
     * Build our own because we allow filtering of action types ('added', 'removed', 'modified') before scanning
     * and so we have greater control over change detection (by breaking ===)
     */
    function combineChange(combined, change) {
        switch (change.type) {
            case 'added':
                if (combined[change.newIndex] && combined[change.newIndex].doc.ref.isEqual(change.doc.ref)) {
                    // Not sure why the duplicates are getting fired
                }
                else {
                    return sliceAndSplice(combined, change.newIndex, 0, change);
                }
                break;
            case 'modified':
                if (combined[change.oldIndex] == null || combined[change.oldIndex].doc.ref.isEqual(change.doc.ref)) {
                    // When an item changes position we first remove it
                    // and then add it's new position
                    if (change.oldIndex !== change.newIndex) {
                        var copiedArray = combined.slice();
                        copiedArray.splice(change.oldIndex, 1);
                        copiedArray.splice(change.newIndex, 0, change);
                        return copiedArray;
                    }
                    else {
                        return sliceAndSplice(combined, change.newIndex, 1, change);
                    }
                }
                break;
            case 'removed':
                if (combined[change.oldIndex] && combined[change.oldIndex].doc.ref.isEqual(change.doc.ref)) {
                    return sliceAndSplice(combined, change.oldIndex, 1);
                }
                break;
        }
        return combined;
    }

    function validateEventsArray(events) {
        if (!events || events.length === 0) {
            events = ['added', 'removed', 'modified'];
        }
        return events;
    }
    /**
     * AngularFirestoreCollection service
     *
     * This class creates a reference to a Firestore Collection. A reference and a query are provided in
     * in the constructor. The query can be the unqueried reference if no query is desired.The class
     * is generic which gives you type safety for data update methods and data streaming.
     *
     * This class uses Symbol.observable to transform into Observable using Observable.from().
     *
     * This class is rarely used directly and should be created from the AngularFirestore service.
     *
     * Example:
     *
     * const collectionRef = firebase.firestore.collection('stocks');
     * const query = collectionRef.where('price', '>', '0.01');
     * const fakeStock = new AngularFirestoreCollection<Stock>(collectionRef, query);
     *
     * // NOTE!: the updates are performed on the reference not the query
     * await fakeStock.add({ name: 'FAKE', price: 0.01 });
     *
     * // Subscribe to changes as snapshots. This provides you data updates as well as delta updates.
     * fakeStock.valueChanges().subscribe(value => console.log(value));
     */
    var AngularFirestoreCollection = /** @class */ (function () {
        /**
         * The constructor takes in a CollectionReference and Query to provide wrapper methods
         * for data operations and data streaming.
         *
         * Note: Data operation methods are done on the reference not the query. This means
         * when you update data it is not updating data to the window of your query unless
         * the data fits the criteria of the query. See the AssociatedRefence type for details
         * on this implication.
         */
        function AngularFirestoreCollection(ref, query, afs) {
            this.ref = ref;
            this.query = query;
            this.afs = afs;
        }
        /**
         * Listen to the latest change in the stream. This method returns changes
         * as they occur and they are not sorted by query order. This allows you to construct
         * your own data structure.
         */
        AngularFirestoreCollection.prototype.stateChanges = function (events) {
            var source = docChanges(this.query, this.afs.schedulers.outsideAngular);
            if (events && events.length > 0) {
                source = source.pipe(operators.map(function (actions) { return actions.filter(function (change) { return events.indexOf(change.type) > -1; }); }));
            }
            return source.pipe(
            // We want to filter out empty arrays, but always emit at first, so the developer knows
            // that the collection has been resolve; even if it's empty
            operators.startWith(undefined), operators.pairwise(), operators.filter(function (_a) {
                var _b = __read(_a, 2), prior = _b[0], current = _b[1];
                return current.length > 0 || !prior;
            }), operators.map(function (_a) {
                var _b = __read(_a, 2), prior = _b[0], current = _b[1];
                return current;
            }), i1.keepUnstableUntilFirst);
        };
        /**
         * Create a stream of changes as they occur it time. This method is similar to stateChanges()
         * but it collects each event in an array over time.
         */
        AngularFirestoreCollection.prototype.auditTrail = function (events) {
            return this.stateChanges(events).pipe(operators.scan(function (current, action) { return __spreadArray(__spreadArray([], __read(current)), __read(action)); }, []));
        };
        /**
         * Create a stream of synchronized changes. This method keeps the local array in sorted
         * query order.
         */
        AngularFirestoreCollection.prototype.snapshotChanges = function (events) {
            var validatedEvents = validateEventsArray(events);
            var scheduledSortedChanges$ = sortedChanges(this.query, validatedEvents, this.afs.schedulers.outsideAngular);
            return scheduledSortedChanges$.pipe(i1.keepUnstableUntilFirst);
        };
        AngularFirestoreCollection.prototype.valueChanges = function (options) {
            if (options === void 0) { options = {}; }
            return fromCollectionRef(this.query, this.afs.schedulers.outsideAngular)
                .pipe(operators.map(function (actions) { return actions.payload.docs.map(function (a) {
                var _a;
                if (options.idField) {
                    return Object.assign(Object.assign({}, a.data()), (_a = {}, _a[options.idField] = a.id, _a));
                }
                else {
                    return a.data();
                }
            }); }), i1.keepUnstableUntilFirst);
        };
        /**
         * Retrieve the results of the query once.
         */
        AngularFirestoreCollection.prototype.get = function (options) {
            return rxjs.from(this.query.get(options)).pipe(i1.keepUnstableUntilFirst);
        };
        /**
         * Add data to a collection reference.
         *
         * Note: Data operation methods are done on the reference not the query. This means
         * when you update data it is not updating data to the window of your query unless
         * the data fits the criteria of the query.
         */
        AngularFirestoreCollection.prototype.add = function (data) {
            return this.ref.add(data);
        };
        /**
         * Create a reference to a single document in a collection.
         */
        AngularFirestoreCollection.prototype.doc = function (path) {
            // TODO is there a better way to solve this type issue
            return new AngularFirestoreDocument(this.ref.doc(path), this.afs);
        };
        return AngularFirestoreCollection;
    }());

    /**
     * AngularFirestoreDocument service
     *
     * This class creates a reference to a Firestore Document. A reference is provided in
     * in the constructor. The class is generic which gives you type safety for data update
     * methods and data streaming.
     *
     * This class uses Symbol.observable to transform into Observable using Observable.from().
     *
     * This class is rarely used directly and should be created from the AngularFirestore service.
     *
     * Example:
     *
     * const fakeStock = new AngularFirestoreDocument<Stock>(doc('stocks/FAKE'));
     * await fakeStock.set({ name: 'FAKE', price: 0.01 });
     * fakeStock.valueChanges().map(snap => {
     *   if(snap.exists) return snap.data();
     *   return null;
     * }).subscribe(value => console.log(value));
     * // OR! Transform using Observable.from() and the data is unwrapped for you
     * Observable.from(fakeStock).subscribe(value => console.log(value));
     */
    var AngularFirestoreDocument = /** @class */ (function () {
        /**
         * The constructor takes in a DocumentReference to provide wrapper methods
         * for data operations, data streaming, and Symbol.observable.
         */
        function AngularFirestoreDocument(ref, afs) {
            this.ref = ref;
            this.afs = afs;
        }
        /**
         * Create or overwrite a single document.
         */
        AngularFirestoreDocument.prototype.set = function (data, options) {
            return this.ref.set(data, options);
        };
        /**
         * Update some fields of a document without overwriting the entire document.
         */
        AngularFirestoreDocument.prototype.update = function (data) {
            return this.ref.update(data);
        };
        /**
         * Delete a document.
         */
        AngularFirestoreDocument.prototype.delete = function () {
            return this.ref.delete();
        };
        /**
         * Create a reference to a sub-collection given a path and an optional query
         * function.
         */
        AngularFirestoreDocument.prototype.collection = function (path, queryFn) {
            var collectionRef = this.ref.collection(path);
            var _a = associateQuery(collectionRef, queryFn), ref = _a.ref, query = _a.query;
            return new AngularFirestoreCollection(ref, query, this.afs);
        };
        /**
         * Listen to snapshot updates from the document.
         */
        AngularFirestoreDocument.prototype.snapshotChanges = function () {
            var scheduledFromDocRef$ = fromDocRef(this.ref, this.afs.schedulers.outsideAngular);
            return scheduledFromDocRef$.pipe(i1.keepUnstableUntilFirst);
        };
        AngularFirestoreDocument.prototype.valueChanges = function (options) {
            if (options === void 0) { options = {}; }
            return this.snapshotChanges().pipe(operators.map(function (_a) {
                var _b;
                var payload = _a.payload;
                return options.idField ? Object.assign(Object.assign({}, payload.data()), (_b = {}, _b[options.idField] = payload.id, _b)) : payload.data();
            }));
        };
        /**
         * Retrieve the document once.
         */
        AngularFirestoreDocument.prototype.get = function (options) {
            return rxjs.from(this.ref.get(options)).pipe(i1.keepUnstableUntilFirst);
        };
        return AngularFirestoreDocument;
    }());

    /**
     * AngularFirestoreCollectionGroup service
     *
     * This class holds a reference to a Firestore Collection Group Query.
     *
     * This class uses Symbol.observable to transform into Observable using Observable.from().
     *
     * This class is rarely used directly and should be created from the AngularFirestore service.
     *
     * Example:
     *
     * const collectionGroup = firebase.firestore.collectionGroup('stocks');
     * const query = collectionRef.where('price', '>', '0.01');
     * const fakeStock = new AngularFirestoreCollectionGroup<Stock>(query, afs);
     *
     * // Subscribe to changes as snapshots. This provides you data updates as well as delta updates.
     * fakeStock.valueChanges().subscribe(value => console.log(value));
     */
    var AngularFirestoreCollectionGroup = /** @class */ (function () {
        /**
         * The constructor takes in a CollectionGroupQuery to provide wrapper methods
         * for data operations and data streaming.
         */
        function AngularFirestoreCollectionGroup(query, afs) {
            this.query = query;
            this.afs = afs;
        }
        /**
         * Listen to the latest change in the stream. This method returns changes
         * as they occur and they are not sorted by query order. This allows you to construct
         * your own data structure.
         */
        AngularFirestoreCollectionGroup.prototype.stateChanges = function (events) {
            if (!events || events.length === 0) {
                return docChanges(this.query, this.afs.schedulers.outsideAngular).pipe(i1.keepUnstableUntilFirst);
            }
            return docChanges(this.query, this.afs.schedulers.outsideAngular)
                .pipe(operators.map(function (actions) { return actions.filter(function (change) { return events.indexOf(change.type) > -1; }); }), operators.filter(function (changes) { return changes.length > 0; }), i1.keepUnstableUntilFirst);
        };
        /**
         * Create a stream of changes as they occur it time. This method is similar to stateChanges()
         * but it collects each event in an array over time.
         */
        AngularFirestoreCollectionGroup.prototype.auditTrail = function (events) {
            return this.stateChanges(events).pipe(operators.scan(function (current, action) { return __spreadArray(__spreadArray([], __read(current)), __read(action)); }, []));
        };
        /**
         * Create a stream of synchronized changes. This method keeps the local array in sorted
         * query order.
         */
        AngularFirestoreCollectionGroup.prototype.snapshotChanges = function (events) {
            var validatedEvents = validateEventsArray(events);
            var scheduledSortedChanges$ = sortedChanges(this.query, validatedEvents, this.afs.schedulers.outsideAngular);
            return scheduledSortedChanges$.pipe(i1.keepUnstableUntilFirst);
        };
        AngularFirestoreCollectionGroup.prototype.valueChanges = function (options) {
            if (options === void 0) { options = {}; }
            var fromCollectionRefScheduled$ = fromCollectionRef(this.query, this.afs.schedulers.outsideAngular);
            return fromCollectionRefScheduled$
                .pipe(operators.map(function (actions) { return actions.payload.docs.map(function (a) {
                var _a;
                if (options.idField) {
                    return Object.assign((_a = {}, _a[options.idField] = a.id, _a), a.data());
                }
                else {
                    return a.data();
                }
            }); }), i1.keepUnstableUntilFirst);
        };
        /**
         * Retrieve the results of the query once.
         */
        AngularFirestoreCollectionGroup.prototype.get = function (options) {
            return rxjs.from(this.query.get(options)).pipe(i1.keepUnstableUntilFirst);
        };
        return AngularFirestoreCollectionGroup;
    }());

    /**
     * The value of this token determines whether or not the firestore will have persistance enabled
     */
    var ENABLE_PERSISTENCE = new i0.InjectionToken('angularfire2.enableFirestorePersistence');
    var PERSISTENCE_SETTINGS = new i0.InjectionToken('angularfire2.firestore.persistenceSettings');
    var SETTINGS = new i0.InjectionToken('angularfire2.firestore.settings');
    var USE_EMULATOR = new i0.InjectionToken('angularfire2.firestore.use-emulator');
    /**
     * A utility methods for associating a collection reference with
     * a query.
     *
     * @param collectionRef - A collection reference to query
     * @param queryFn - The callback to create a query
     *
     * Example:
     * const { query, ref } = associateQuery(docRef.collection('items'), ref => {
     *  return ref.where('age', '<', 200);
     * });
     */
    function associateQuery(collectionRef, queryFn) {
        if (queryFn === void 0) { queryFn = function (ref) { return ref; }; }
        var query = queryFn(collectionRef);
        var ref = collectionRef;
        return { query: query, ref: ref };
    }
    /**
     * AngularFirestore Service
     *
     * This service is the main entry point for this feature module. It provides
     * an API for creating Collection and Reference services. These services can
     * then be used to do data updates and observable streams of the data.
     *
     * Example:
     *
     * import { Component } from '@angular/core';
     * import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
     * import { Observable } from 'rxjs/Observable';
     * import { from } from 'rxjs/observable';
     *
     * @Component({
     *   selector: 'app-my-component',
     *   template: `
     *    <h2>Items for {{ (profile | async)?.name }}
     *    <ul>
     *       <li *ngFor="let item of items | async">{{ item.name }}</li>
     *    </ul>
     *    <div class="control-input">
     *       <input type="text" #itemname />
     *       <button (click)="addItem(itemname.value)">Add Item</button>
     *    </div>
     *   `
     * })
     * export class MyComponent implements OnInit {
     *
     *   // services for data operations and data streaming
     *   private readonly itemsRef: AngularFirestoreCollection<Item>;
     *   private readonly profileRef: AngularFirestoreDocument<Profile>;
     *
     *   // observables for template
     *   items: Observable<Item[]>;
     *   profile: Observable<Profile>;
     *
     *   // inject main service
     *   constructor(private readonly afs: AngularFirestore) {}
     *
     *   ngOnInit() {
     *     this.itemsRef = afs.collection('items', ref => ref.where('user', '==', 'davideast').limit(10));
     *     this.items = this.itemsRef.valueChanges().map(snap => snap.docs.map(data => doc.data()));
     *     // this.items = from(this.itemsRef); // you can also do this with no mapping
     *
     *     this.profileRef = afs.doc('users/davideast');
     *     this.profile = this.profileRef.valueChanges();
     *   }
     *
     *   addItem(name: string) {
     *     const user = 'davideast';
     *     this.itemsRef.add({ name, user });
     *   }
     * }
     */
    var AngularFirestore = /** @class */ (function () {
        /**
         * Each Feature of AngularFire has a FirebaseApp injected. This way we
         * don't rely on the main Firebase App instance and we can create named
         * apps and use multiple apps.
         */
        function AngularFirestore(options, name, shouldEnablePersistence, settings, 
        // tslint:disable-next-line:ban-types
        platformId, zone, schedulers, persistenceSettings, _useEmulator, auth, useAuthEmulator, authSettings, // can't use firebase.auth.AuthSettings here
        tenantId, languageCode, useDeviceLanguage, persistence, _appCheckInstances) {
            var _a;
            this.schedulers = schedulers;
            var app = compat.ɵfirebaseAppFactory(options, zone, name);
            var useEmulator = _useEmulator;
            if (auth) {
                i2.ɵauthFactory(app, zone, useAuthEmulator, tenantId, languageCode, useDeviceLanguage, authSettings, persistence);
            }
            _a = __read(compat.ɵcacheInstance(app.name + ".firestore", 'AngularFirestore', app.name, function () {
                var firestore = zone.runOutsideAngular(function () { return app.firestore(); });
                if (settings) {
                    firestore.settings(settings);
                }
                if (useEmulator) {
                    firestore.useEmulator.apply(firestore, __spreadArray([], __read(useEmulator)));
                }
                if (shouldEnablePersistence && !common.isPlatformServer(platformId)) {
                    // We need to try/catch here because not all enablePersistence() failures are caught
                    // https://github.com/firebase/firebase-js-sdk/issues/608
                    var enablePersistence = function () {
                        try {
                            return rxjs.from(firestore.enablePersistence(persistenceSettings || undefined).then(function () { return true; }, function () { return false; }));
                        }
                        catch (e) {
                            if (typeof console !== 'undefined') {
                                console.warn(e);
                            }
                            return rxjs.of(false);
                        }
                    };
                    return [firestore, zone.runOutsideAngular(enablePersistence)];
                }
                else {
                    return [firestore, rxjs.of(false)];
                }
            }, [settings, useEmulator, shouldEnablePersistence]), 2), this.firestore = _a[0], this.persistenceEnabled$ = _a[1];
        }
        AngularFirestore.prototype.collection = function (pathOrRef, queryFn) {
            var collectionRef;
            if (typeof pathOrRef === 'string') {
                collectionRef = this.firestore.collection(pathOrRef);
            }
            else {
                collectionRef = pathOrRef;
            }
            var _a = associateQuery(collectionRef, queryFn), ref = _a.ref, query = _a.query;
            var refInZone = this.schedulers.ngZone.run(function () { return ref; });
            return new AngularFirestoreCollection(refInZone, query, this);
        };
        /**
         * Create a reference to a Firestore Collection Group based on a collectionId
         * and an optional query function to narrow the result
         * set.
         */
        AngularFirestore.prototype.collectionGroup = function (collectionId, queryGroupFn) {
            var queryFn = queryGroupFn || (function (ref) { return ref; });
            var collectionGroup = this.firestore.collectionGroup(collectionId);
            return new AngularFirestoreCollectionGroup(queryFn(collectionGroup), this);
        };
        AngularFirestore.prototype.doc = function (pathOrRef) {
            var ref;
            if (typeof pathOrRef === 'string') {
                ref = this.firestore.doc(pathOrRef);
            }
            else {
                ref = pathOrRef;
            }
            var refInZone = this.schedulers.ngZone.run(function () { return ref; });
            return new AngularFirestoreDocument(refInZone, this);
        };
        /**
         * Returns a generated Firestore Document Id.
         */
        AngularFirestore.prototype.createId = function () {
            return this.firestore.collection('_').doc().id;
        };
        return AngularFirestore;
    }());
    AngularFirestore.ɵfac = i0__namespace.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0__namespace, type: AngularFirestore, deps: [{ token: compat.FIREBASE_OPTIONS }, { token: compat.FIREBASE_APP_NAME, optional: true }, { token: ENABLE_PERSISTENCE, optional: true }, { token: SETTINGS, optional: true }, { token: i0.PLATFORM_ID }, { token: i0__namespace.NgZone }, { token: i1__namespace.ɵAngularFireSchedulers }, { token: PERSISTENCE_SETTINGS, optional: true }, { token: USE_EMULATOR, optional: true }, { token: i2__namespace.AngularFireAuth, optional: true }, { token: i2.USE_EMULATOR, optional: true }, { token: i2.SETTINGS, optional: true }, { token: i2.TENANT_ID, optional: true }, { token: i2.LANGUAGE_CODE, optional: true }, { token: i2.USE_DEVICE_LANGUAGE, optional: true }, { token: i2.PERSISTENCE, optional: true }, { token: i3__namespace.AppCheckInstances, optional: true }], target: i0__namespace.ɵɵFactoryTarget.Injectable });
    AngularFirestore.ɵprov = i0__namespace.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0__namespace, type: AngularFirestore, providedIn: 'any' });
    i0__namespace.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0__namespace, type: AngularFirestore, decorators: [{
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
                            args: [ENABLE_PERSISTENCE]
                        }] }, { type: undefined, decorators: [{
                            type: i0.Optional
                        }, {
                            type: i0.Inject,
                            args: [SETTINGS]
                        }] }, { type: Object, decorators: [{
                            type: i0.Inject,
                            args: [i0.PLATFORM_ID]
                        }] }, { type: i0__namespace.NgZone }, { type: i1__namespace.ɵAngularFireSchedulers }, { type: undefined, decorators: [{
                            type: i0.Optional
                        }, {
                            type: i0.Inject,
                            args: [PERSISTENCE_SETTINGS]
                        }] }, { type: undefined, decorators: [{
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

    var AngularFirestoreModule = /** @class */ (function () {
        function AngularFirestoreModule() {
            firebase__default['default'].registerVersion('angularfire', i1.VERSION.full, 'fst-compat');
        }
        /**
         * Attempt to enable persistent storage, if possible
         */
        AngularFirestoreModule.enablePersistence = function (persistenceSettings) {
            return {
                ngModule: AngularFirestoreModule,
                providers: [
                    { provide: ENABLE_PERSISTENCE, useValue: true },
                    { provide: PERSISTENCE_SETTINGS, useValue: persistenceSettings },
                ]
            };
        };
        return AngularFirestoreModule;
    }());
    AngularFirestoreModule.ɵfac = i0__namespace.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0__namespace, type: AngularFirestoreModule, deps: [], target: i0__namespace.ɵɵFactoryTarget.NgModule });
    AngularFirestoreModule.ɵmod = i0__namespace.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0__namespace, type: AngularFirestoreModule });
    AngularFirestoreModule.ɵinj = i0__namespace.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0__namespace, type: AngularFirestoreModule, providers: [AngularFirestore] });
    i0__namespace.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0__namespace, type: AngularFirestoreModule, decorators: [{
                type: i0.NgModule,
                args: [{
                        providers: [AngularFirestore]
                    }]
            }], ctorParameters: function () { return []; } });

    /**
     * Generated bundle index. Do not edit.
     */

    exports.AngularFirestore = AngularFirestore;
    exports.AngularFirestoreCollection = AngularFirestoreCollection;
    exports.AngularFirestoreCollectionGroup = AngularFirestoreCollectionGroup;
    exports.AngularFirestoreDocument = AngularFirestoreDocument;
    exports.AngularFirestoreModule = AngularFirestoreModule;
    exports.ENABLE_PERSISTENCE = ENABLE_PERSISTENCE;
    exports.PERSISTENCE_SETTINGS = PERSISTENCE_SETTINGS;
    exports.SETTINGS = SETTINGS;
    exports.USE_EMULATOR = USE_EMULATOR;
    exports.associateQuery = associateQuery;
    exports.combineChange = combineChange;
    exports.combineChanges = combineChanges;
    exports.docChanges = docChanges;
    exports.fromCollectionRef = fromCollectionRef;
    exports.fromDocRef = fromDocRef;
    exports.fromRef = fromRef;
    exports.sortedChanges = sortedChanges;
    exports.validateEventsArray = validateEventsArray;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=angular-fire-compat-firestore.umd.js.map
