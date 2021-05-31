(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/cdk/testing'), require('@angular/core/testing'), require('rxjs/operators'), require('rxjs'), require('@angular/cdk/keycodes')) :
    typeof define === 'function' && define.amd ? define('@angular/cdk/testing/testbed', ['exports', '@angular/cdk/testing', '@angular/core/testing', 'rxjs/operators', 'rxjs', '@angular/cdk/keycodes'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.ng = global.ng || {}, global.ng.cdk = global.ng.cdk || {}, global.ng.cdk.testing = global.ng.cdk.testing || {}, global.ng.cdk.testing.testbed = {}), global.ng.cdk.testing, global.ng.core.testing, global.rxjs.operators, global.rxjs, global.ng.cdk.keycodes));
}(this, (function (exports, testing, testing$1, operators, rxjs, keyCodes) { 'use strict';

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

    var keyCodes__namespace = /*#__PURE__*/_interopNamespace(keyCodes);

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
    function __classPrivateFieldGet(receiver, privateMap) {
        if (!privateMap.has(receiver)) {
            throw new TypeError("attempted to get private field on non-instance");
        }
        return privateMap.get(receiver);
    }
    function __classPrivateFieldSet(receiver, privateMap, value) {
        if (!privateMap.has(receiver)) {
            throw new TypeError("attempted to set private field on non-instance");
        }
        privateMap.set(receiver, value);
        return value;
    }

    /** Unique symbol that is used to patch a property to a proxy zone. */
    var stateObservableSymbol = Symbol('ProxyZone_PATCHED#stateObservable');
    /**
     * Interceptor that can be set up in a `ProxyZone` instance. The interceptor
     * will keep track of the task state and emit whenever the state changes.
     *
     * This serves as a workaround for https://github.com/angular/angular/issues/32896.
     */
    var TaskStateZoneInterceptor = /** @class */ (function () {
        function TaskStateZoneInterceptor(_lastState) {
            this._lastState = _lastState;
            /** Subject that can be used to emit a new state change. */
            this._stateSubject = new rxjs.BehaviorSubject(this._lastState ? this._getTaskStateFromInternalZoneState(this._lastState) : { stable: true });
            /** Public observable that emits whenever the task state changes. */
            this.state = this._stateSubject;
        }
        /** This will be called whenever the task state changes in the intercepted zone. */
        TaskStateZoneInterceptor.prototype.onHasTask = function (delegate, current, target, hasTaskState) {
            if (current === target) {
                this._stateSubject.next(this._getTaskStateFromInternalZoneState(hasTaskState));
            }
        };
        /** Gets the task state from the internal ZoneJS task state. */
        TaskStateZoneInterceptor.prototype._getTaskStateFromInternalZoneState = function (state) {
            return { stable: !state.macroTask && !state.microTask };
        };
        /**
         * Sets up the custom task state Zone interceptor in the  `ProxyZone`. Throws if
         * no `ProxyZone` could be found.
         * @returns an observable that emits whenever the task state changes.
         */
        TaskStateZoneInterceptor.setup = function () {
            if (Zone === undefined) {
                throw Error('Could not find ZoneJS. For test harnesses running in TestBed, ' +
                    'ZoneJS needs to be installed.');
            }
            // tslint:disable-next-line:variable-name
            var ProxyZoneSpec = Zone['ProxyZoneSpec'];
            // If there is no "ProxyZoneSpec" installed, we throw an error and recommend
            // setting up the proxy zone by pulling in the testing bundle.
            if (!ProxyZoneSpec) {
                throw Error('ProxyZoneSpec is needed for the test harnesses but could not be found. ' +
                    'Please make sure that your environment includes zone.js/dist/zone-testing.js');
            }
            // Ensure that there is a proxy zone instance set up, and get
            // a reference to the instance if present.
            var zoneSpec = ProxyZoneSpec.assertPresent();
            // If there already is a delegate registered in the proxy zone, and it
            // is type of the custom task state interceptor, we just use that state
            // observable. This allows us to only intercept Zone once per test
            // (similar to how `fakeAsync` or `async` work).
            if (zoneSpec[stateObservableSymbol]) {
                return zoneSpec[stateObservableSymbol];
            }
            // Since we intercept on environment creation and the fixture has been
            // created before, we might have missed tasks scheduled before. Fortunately
            // the proxy zone keeps track of the previous task state, so we can just pass
            // this as initial state to the task zone interceptor.
            var interceptor = new TaskStateZoneInterceptor(zoneSpec.lastTaskState);
            var zoneSpecOnHasTask = zoneSpec.onHasTask.bind(zoneSpec);
            // We setup the task state interceptor in the `ProxyZone`. Note that we cannot register
            // the interceptor as a new proxy zone delegate because it would mean that other zone
            // delegates (e.g. `FakeAsyncTestZone` or `AsyncTestZone`) can accidentally overwrite/disable
            // our interceptor. Since we just intend to monitor the task state of the proxy zone, it is
            // sufficient to just patch the proxy zone. This also avoids that we interfere with the task
            // queue scheduling logic.
            zoneSpec.onHasTask = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                zoneSpecOnHasTask.apply(void 0, __spreadArray([], __read(args)));
                interceptor.onHasTask.apply(interceptor, __spreadArray([], __read(args)));
            };
            return zoneSpec[stateObservableSymbol] = interceptor.state;
        };
        return TaskStateZoneInterceptor;
    }());

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /**
     * Creates a browser MouseEvent with the specified options.
     * @docs-private
     */
    function createMouseEvent(type, clientX, clientY, button, modifiers) {
        if (clientX === void 0) { clientX = 0; }
        if (clientY === void 0) { clientY = 0; }
        if (button === void 0) { button = 0; }
        if (modifiers === void 0) { modifiers = {}; }
        var event = document.createEvent('MouseEvent');
        var originalPreventDefault = event.preventDefault.bind(event);
        // Note: We cannot determine the position of the mouse event based on the screen
        // because the dimensions and position of the browser window are not available
        // To provide reasonable `screenX` and `screenY` coordinates, we simply use the
        // client coordinates as if the browser is opened in fullscreen.
        var screenX = clientX;
        var screenY = clientY;
        event.initMouseEvent(type, 
        /* canBubble */ true, 
        /* cancelable */ true, 
        /* view */ window, 
        /* detail */ 0, 
        /* screenX */ screenX, 
        /* screenY */ screenY, 
        /* clientX */ clientX, 
        /* clientY */ clientY, 
        /* ctrlKey */ !!modifiers.control, 
        /* altKey */ !!modifiers.alt, 
        /* shiftKey */ !!modifiers.shift, 
        /* metaKey */ !!modifiers.meta, 
        /* button */ button, 
        /* relatedTarget */ null);
        // `initMouseEvent` doesn't allow us to pass the `buttons` and
        // defaults it to 0 which looks like a fake event.
        defineReadonlyEventProperty(event, 'buttons', 1);
        // IE won't set `defaultPrevented` on synthetic events so we need to do it manually.
        event.preventDefault = function () {
            defineReadonlyEventProperty(event, 'defaultPrevented', true);
            return originalPreventDefault();
        };
        return event;
    }
    /**
     * Creates a browser `PointerEvent` with the specified options. Pointer events
     * by default will appear as if they are the primary pointer of their type.
     * https://www.w3.org/TR/pointerevents2/#dom-pointerevent-isprimary.
     *
     * For example, if pointer events for a multi-touch interaction are created, the non-primary
     * pointer touches would need to be represented by non-primary pointer events.
     *
     * @docs-private
     */
    function createPointerEvent(type, clientX, clientY, options) {
        if (clientX === void 0) { clientX = 0; }
        if (clientY === void 0) { clientY = 0; }
        if (options === void 0) { options = { isPrimary: true }; }
        return new PointerEvent(type, Object.assign({ bubbles: true, cancelable: true, view: window, clientX: clientX,
            clientY: clientY }, options));
    }
    /**
     * Creates a browser TouchEvent with the specified pointer coordinates.
     * @docs-private
     */
    function createTouchEvent(type, pageX, pageY) {
        if (pageX === void 0) { pageX = 0; }
        if (pageY === void 0) { pageY = 0; }
        // In favor of creating events that work for most of the browsers, the event is created
        // as a basic UI Event. The necessary details for the event will be set manually.
        var event = document.createEvent('UIEvent');
        var touchDetails = { pageX: pageX, pageY: pageY };
        // TS3.6 removes the initUIEvent method and suggests porting to "new UIEvent()".
        event.initUIEvent(type, true, true, window, 0);
        // Most of the browsers don't have a "initTouchEvent" method that can be used to define
        // the touch details.
        defineReadonlyEventProperty(event, 'touches', [touchDetails]);
        defineReadonlyEventProperty(event, 'targetTouches', [touchDetails]);
        defineReadonlyEventProperty(event, 'changedTouches', [touchDetails]);
        return event;
    }
    /**
     * Creates a keyboard event with the specified key and modifiers.
     * @docs-private
     */
    function createKeyboardEvent(type, keyCode, key, modifiers) {
        if (keyCode === void 0) { keyCode = 0; }
        if (key === void 0) { key = ''; }
        if (modifiers === void 0) { modifiers = {}; }
        var event = document.createEvent('KeyboardEvent');
        var originalPreventDefault = event.preventDefault.bind(event);
        // Firefox does not support `initKeyboardEvent`, but supports `initKeyEvent`.
        // https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/initKeyEvent.
        if (event.initKeyEvent !== undefined) {
            event.initKeyEvent(type, true, true, window, modifiers.control, modifiers.alt, modifiers.shift, modifiers.meta, keyCode);
        }
        else {
            // `initKeyboardEvent` expects to receive modifiers as a whitespace-delimited string
            // See https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/initKeyboardEvent
            var modifiersList = '';
            if (modifiers.control) {
                modifiersList += 'Control ';
            }
            if (modifiers.alt) {
                modifiersList += 'Alt ';
            }
            if (modifiers.shift) {
                modifiersList += 'Shift ';
            }
            if (modifiers.meta) {
                modifiersList += 'Meta ';
            }
            // TS3.6 removed the `initKeyboardEvent` method and suggested porting to
            // `new KeyboardEvent()` constructor. We cannot use that as we support IE11.
            // https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/initKeyboardEvent.
            event.initKeyboardEvent(type, true, /* canBubble */ true, /* cancelable */ window, /* view */ 0, /* char */ key, /* key */ 0, /* location */ modifiersList.trim(), /* modifiersList */ false /* repeat */);
        }
        // Webkit Browsers don't set the keyCode when calling the init function.
        // See related bug https://bugs.webkit.org/show_bug.cgi?id=16735
        defineReadonlyEventProperty(event, 'keyCode', keyCode);
        defineReadonlyEventProperty(event, 'key', key);
        defineReadonlyEventProperty(event, 'ctrlKey', !!modifiers.control);
        defineReadonlyEventProperty(event, 'altKey', !!modifiers.alt);
        defineReadonlyEventProperty(event, 'shiftKey', !!modifiers.shift);
        defineReadonlyEventProperty(event, 'metaKey', !!modifiers.meta);
        // IE won't set `defaultPrevented` on synthetic events so we need to do it manually.
        event.preventDefault = function () {
            defineReadonlyEventProperty(event, 'defaultPrevented', true);
            return originalPreventDefault();
        };
        return event;
    }
    /**
     * Creates a fake event object with any desired event type.
     * @docs-private
     */
    function createFakeEvent(type, canBubble, cancelable) {
        if (canBubble === void 0) { canBubble = false; }
        if (cancelable === void 0) { cancelable = true; }
        var event = document.createEvent('Event');
        event.initEvent(type, canBubble, cancelable);
        return event;
    }
    /**
     * Defines a readonly property on the given event object. Readonly properties on an event object
     * are always set as configurable as that matches default readonly properties for DOM event objects.
     */
    function defineReadonlyEventProperty(event, propertyName, value) {
        Object.defineProperty(event, propertyName, { get: function () { return value; }, configurable: true });
    }

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /**
     * Utility to dispatch any event on a Node.
     * @docs-private
     */
    function dispatchEvent(node, event) {
        node.dispatchEvent(event);
        return event;
    }
    /**
     * Shorthand to dispatch a fake event on a specified node.
     * @docs-private
     */
    function dispatchFakeEvent(node, type, canBubble) {
        return dispatchEvent(node, createFakeEvent(type, canBubble));
    }
    /**
     * Shorthand to dispatch a keyboard event with a specified key code and
     * optional modifiers.
     * @docs-private
     */
    function dispatchKeyboardEvent(node, type, keyCode, key, modifiers) {
        return dispatchEvent(node, createKeyboardEvent(type, keyCode, key, modifiers));
    }
    /**
     * Shorthand to dispatch a mouse event on the specified coordinates.
     * @docs-private
     */
    function dispatchMouseEvent(node, type, clientX, clientY, button, modifiers) {
        if (clientX === void 0) { clientX = 0; }
        if (clientY === void 0) { clientY = 0; }
        return dispatchEvent(node, createMouseEvent(type, clientX, clientY, button, modifiers));
    }
    /**
     * Shorthand to dispatch a pointer event on the specified coordinates.
     * @docs-private
     */
    function dispatchPointerEvent(node, type, clientX, clientY, options) {
        if (clientX === void 0) { clientX = 0; }
        if (clientY === void 0) { clientY = 0; }
        return dispatchEvent(node, createPointerEvent(type, clientX, clientY, options));
    }
    /**
     * Shorthand to dispatch a touch event on the specified coordinates.
     * @docs-private
     */
    function dispatchTouchEvent(node, type, x, y) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        return dispatchEvent(node, createTouchEvent(type, x, y));
    }

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    function triggerFocusChange(element, event) {
        var eventFired = false;
        var handler = function () { return eventFired = true; };
        element.addEventListener(event, handler);
        element[event]();
        element.removeEventListener(event, handler);
        if (!eventFired) {
            dispatchFakeEvent(element, event);
        }
    }
    /**
     * Patches an elements focus and blur methods to emit events consistently and predictably.
     * This is necessary, because some browsers, like IE11, will call the focus handlers asynchronously,
     * while others won't fire them at all if the browser window is not focused.
     * @docs-private
     */
    function patchElementFocus(element) {
        element.focus = function () { return dispatchFakeEvent(element, 'focus'); };
        element.blur = function () { return dispatchFakeEvent(element, 'blur'); };
    }
    /** @docs-private */
    function triggerFocus(element) {
        triggerFocusChange(element, 'focus');
    }
    /** @docs-private */
    function triggerBlur(element) {
        triggerFocusChange(element, 'blur');
    }

    /** Input types for which the value can be entered incrementally. */
    var incrementalInputTypes = new Set(['text', 'email', 'hidden', 'password', 'search', 'tel', 'url']);
    /**
     * Checks whether the given Element is a text input element.
     * @docs-private
     */
    function isTextInput(element) {
        var nodeName = element.nodeName.toLowerCase();
        return nodeName === 'input' || nodeName === 'textarea';
    }
    function typeInElement(element) {
        var e_1, _a;
        var modifiersAndKeys = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            modifiersAndKeys[_i - 1] = arguments[_i];
        }
        var first = modifiersAndKeys[0];
        var modifiers;
        var rest;
        if (typeof first !== 'string' && first.keyCode === undefined && first.key === undefined) {
            modifiers = first;
            rest = modifiersAndKeys.slice(1);
        }
        else {
            modifiers = {};
            rest = modifiersAndKeys;
        }
        var isInput = isTextInput(element);
        var inputType = element.getAttribute('type') || 'text';
        var keys = rest
            .map(function (k) { return typeof k === 'string' ?
            k.split('').map(function (c) { return ({ keyCode: c.toUpperCase().charCodeAt(0), key: c }); }) : [k]; })
            .reduce(function (arr, k) { return arr.concat(k); }, []);
        // We simulate the user typing in a value by incrementally assigning the value below. The problem
        // is that for some input types, the browser won't allow for an invalid value to be set via the
        // `value` property which will always be the case when going character-by-character. If we detect
        // such an input, we have to set the value all at once or listeners to the `input` event (e.g.
        // the `ReactiveFormsModule` uses such an approach) won't receive the correct value.
        var enterValueIncrementally = inputType === 'number' && keys.length > 0 ?
            // The value can be set character by character in number inputs if it doesn't have any decimals.
            keys.every(function (key) { return key.key !== '.' && key.keyCode !== keyCodes.PERIOD; }) :
            incrementalInputTypes.has(inputType);
        triggerFocus(element);
        // When we aren't entering the value incrementally, assign it all at once ahead
        // of time so that any listeners to the key events below will have access to it.
        if (!enterValueIncrementally) {
            element.value = keys.reduce(function (value, key) { return value + (key.key || ''); }, '');
        }
        try {
            for (var keys_1 = __values(keys), keys_1_1 = keys_1.next(); !keys_1_1.done; keys_1_1 = keys_1.next()) {
                var key = keys_1_1.value;
                dispatchKeyboardEvent(element, 'keydown', key.keyCode, key.key, modifiers);
                dispatchKeyboardEvent(element, 'keypress', key.keyCode, key.key, modifiers);
                if (isInput && key.key && key.key.length === 1) {
                    if (enterValueIncrementally) {
                        element.value += key.key;
                        dispatchFakeEvent(element, 'input');
                    }
                }
                dispatchKeyboardEvent(element, 'keyup', key.keyCode, key.key, modifiers);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (keys_1_1 && !keys_1_1.done && (_a = keys_1.return)) _a.call(keys_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        // Since we weren't dispatching `input` events while sending the keys, we have to do it now.
        if (!enterValueIncrementally) {
            dispatchFakeEvent(element, 'input');
        }
    }
    /**
     * Clears the text in an input or textarea element.
     * @docs-private
     */
    function clearElement(element) {
        triggerFocus(element);
        element.value = '';
        dispatchFakeEvent(element, 'input');
    }

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */

    var _a;
    /** Maps `TestKey` constants to the `keyCode` and `key` values used by native browser events. */
    var keyMap = (_a = {},
        _a[testing.TestKey.BACKSPACE] = { keyCode: keyCodes__namespace.BACKSPACE, key: 'Backspace' },
        _a[testing.TestKey.TAB] = { keyCode: keyCodes__namespace.TAB, key: 'Tab' },
        _a[testing.TestKey.ENTER] = { keyCode: keyCodes__namespace.ENTER, key: 'Enter' },
        _a[testing.TestKey.SHIFT] = { keyCode: keyCodes__namespace.SHIFT, key: 'Shift' },
        _a[testing.TestKey.CONTROL] = { keyCode: keyCodes__namespace.CONTROL, key: 'Control' },
        _a[testing.TestKey.ALT] = { keyCode: keyCodes__namespace.ALT, key: 'Alt' },
        _a[testing.TestKey.ESCAPE] = { keyCode: keyCodes__namespace.ESCAPE, key: 'Escape' },
        _a[testing.TestKey.PAGE_UP] = { keyCode: keyCodes__namespace.PAGE_UP, key: 'PageUp' },
        _a[testing.TestKey.PAGE_DOWN] = { keyCode: keyCodes__namespace.PAGE_DOWN, key: 'PageDown' },
        _a[testing.TestKey.END] = { keyCode: keyCodes__namespace.END, key: 'End' },
        _a[testing.TestKey.HOME] = { keyCode: keyCodes__namespace.HOME, key: 'Home' },
        _a[testing.TestKey.LEFT_ARROW] = { keyCode: keyCodes__namespace.LEFT_ARROW, key: 'ArrowLeft' },
        _a[testing.TestKey.UP_ARROW] = { keyCode: keyCodes__namespace.UP_ARROW, key: 'ArrowUp' },
        _a[testing.TestKey.RIGHT_ARROW] = { keyCode: keyCodes__namespace.RIGHT_ARROW, key: 'ArrowRight' },
        _a[testing.TestKey.DOWN_ARROW] = { keyCode: keyCodes__namespace.DOWN_ARROW, key: 'ArrowDown' },
        _a[testing.TestKey.INSERT] = { keyCode: keyCodes__namespace.INSERT, key: 'Insert' },
        _a[testing.TestKey.DELETE] = { keyCode: keyCodes__namespace.DELETE, key: 'Delete' },
        _a[testing.TestKey.F1] = { keyCode: keyCodes__namespace.F1, key: 'F1' },
        _a[testing.TestKey.F2] = { keyCode: keyCodes__namespace.F2, key: 'F2' },
        _a[testing.TestKey.F3] = { keyCode: keyCodes__namespace.F3, key: 'F3' },
        _a[testing.TestKey.F4] = { keyCode: keyCodes__namespace.F4, key: 'F4' },
        _a[testing.TestKey.F5] = { keyCode: keyCodes__namespace.F5, key: 'F5' },
        _a[testing.TestKey.F6] = { keyCode: keyCodes__namespace.F6, key: 'F6' },
        _a[testing.TestKey.F7] = { keyCode: keyCodes__namespace.F7, key: 'F7' },
        _a[testing.TestKey.F8] = { keyCode: keyCodes__namespace.F8, key: 'F8' },
        _a[testing.TestKey.F9] = { keyCode: keyCodes__namespace.F9, key: 'F9' },
        _a[testing.TestKey.F10] = { keyCode: keyCodes__namespace.F10, key: 'F10' },
        _a[testing.TestKey.F11] = { keyCode: keyCodes__namespace.F11, key: 'F11' },
        _a[testing.TestKey.F12] = { keyCode: keyCodes__namespace.F12, key: 'F12' },
        _a[testing.TestKey.META] = { keyCode: keyCodes__namespace.META, key: 'Meta' },
        _a);
    /** A `TestElement` implementation for unit tests. */
    var UnitTestElement = /** @class */ (function () {
        function UnitTestElement(element, _stabilize) {
            this.element = element;
            this._stabilize = _stabilize;
        }
        /** Blur the element. */
        UnitTestElement.prototype.blur = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            triggerBlur(this.element);
                            return [4 /*yield*/, this._stabilize()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /** Clear the element's input (for input and textarea elements only). */
        UnitTestElement.prototype.clear = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!isTextInput(this.element)) {
                                throw Error('Attempting to clear an invalid element');
                            }
                            clearElement(this.element);
                            return [4 /*yield*/, this._stabilize()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        UnitTestElement.prototype.click = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this._dispatchMouseEventSequence('click', args, 0)];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, this._stabilize()];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        UnitTestElement.prototype.rightClick = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this._dispatchMouseEventSequence('contextmenu', args, 2)];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, this._stabilize()];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /** Focus the element. */
        UnitTestElement.prototype.focus = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            triggerFocus(this.element);
                            return [4 /*yield*/, this._stabilize()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /** Get the computed value of the given CSS property for the element. */
        UnitTestElement.prototype.getCssValue = function (property) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this._stabilize()];
                        case 1:
                            _a.sent();
                            // TODO(mmalerba): Consider adding value normalization if we run into common cases where its
                            //  needed.
                            return [2 /*return*/, getComputedStyle(this.element).getPropertyValue(property)];
                    }
                });
            });
        };
        /** Hovers the mouse over the element. */
        UnitTestElement.prototype.hover = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this._dispatchPointerEventIfSupported('pointerenter');
                            dispatchMouseEvent(this.element, 'mouseenter');
                            return [4 /*yield*/, this._stabilize()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /** Moves the mouse away from the element. */
        UnitTestElement.prototype.mouseAway = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this._dispatchPointerEventIfSupported('pointerleave');
                            dispatchMouseEvent(this.element, 'mouseleave');
                            return [4 /*yield*/, this._stabilize()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        UnitTestElement.prototype.sendKeys = function () {
            var modifiersAndKeys = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                modifiersAndKeys[_i] = arguments[_i];
            }
            return __awaiter(this, void 0, void 0, function () {
                var args;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            args = modifiersAndKeys.map(function (k) { return typeof k === 'number' ? keyMap[k] : k; });
                            typeInElement.apply(void 0, __spreadArray([this.element], __read(args)));
                            return [4 /*yield*/, this._stabilize()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Gets the text from the element.
         * @param options Options that affect what text is included.
         */
        UnitTestElement.prototype.text = function (options) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this._stabilize()];
                        case 1:
                            _a.sent();
                            if (options === null || options === void 0 ? void 0 : options.exclude) {
                                return [2 /*return*/, testing._getTextWithExcludedElements(this.element, options.exclude)];
                            }
                            return [2 /*return*/, (this.element.textContent || '').trim()];
                    }
                });
            });
        };
        /** Gets the value for the given attribute from the element. */
        UnitTestElement.prototype.getAttribute = function (name) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this._stabilize()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, this.element.getAttribute(name)];
                    }
                });
            });
        };
        /** Checks whether the element has the given class. */
        UnitTestElement.prototype.hasClass = function (name) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this._stabilize()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, this.element.classList.contains(name)];
                    }
                });
            });
        };
        /** Gets the dimensions of the element. */
        UnitTestElement.prototype.getDimensions = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this._stabilize()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, this.element.getBoundingClientRect()];
                    }
                });
            });
        };
        /** Gets the value of a property of an element. */
        UnitTestElement.prototype.getProperty = function (name) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this._stabilize()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, this.element[name]];
                    }
                });
            });
        };
        /** Sets the value of a property of an input. */
        UnitTestElement.prototype.setInputValue = function (value) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.element.value = value;
                            return [4 /*yield*/, this._stabilize()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /** Selects the options at the specified indexes inside of a native `select` element. */
        UnitTestElement.prototype.selectOptions = function () {
            var optionIndexes = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                optionIndexes[_i] = arguments[_i];
            }
            return __awaiter(this, void 0, void 0, function () {
                var hasChanged, options, indexes, i, option, wasSelected;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            hasChanged = false;
                            options = this.element.querySelectorAll('option');
                            indexes = new Set(optionIndexes);
                            for (i = 0; i < options.length; i++) {
                                option = options[i];
                                wasSelected = option.selected;
                                // We have to go through `option.selected`, because `HTMLSelectElement.value` doesn't
                                // allow for multiple options to be selected, even in `multiple` mode.
                                option.selected = indexes.has(i);
                                if (option.selected !== wasSelected) {
                                    hasChanged = true;
                                    dispatchFakeEvent(this.element, 'change');
                                }
                            }
                            if (!hasChanged) return [3 /*break*/, 2];
                            return [4 /*yield*/, this._stabilize()];
                        case 1:
                            _a.sent();
                            _a.label = 2;
                        case 2: return [2 /*return*/];
                    }
                });
            });
        };
        /** Checks whether this element matches the given selector. */
        UnitTestElement.prototype.matchesSelector = function (selector) {
            return __awaiter(this, void 0, void 0, function () {
                var elementPrototype;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this._stabilize()];
                        case 1:
                            _a.sent();
                            elementPrototype = Element.prototype;
                            return [2 /*return*/, (elementPrototype['matches'] || elementPrototype['msMatchesSelector'])
                                    .call(this.element, selector)];
                    }
                });
            });
        };
        /** Checks whether the element is focused. */
        UnitTestElement.prototype.isFocused = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this._stabilize()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, document.activeElement === this.element];
                    }
                });
            });
        };
        /**
         * Dispatches an event with a particular name.
         * @param name Name of the event to be dispatched.
         */
        UnitTestElement.prototype.dispatchEvent = function (name, data) {
            return __awaiter(this, void 0, void 0, function () {
                var event;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            event = createFakeEvent(name);
                            if (data) {
                                // tslint:disable-next-line:ban Have to use `Object.assign` to preserve the original object.
                                Object.assign(event, data);
                            }
                            dispatchEvent(this.element, event);
                            return [4 /*yield*/, this._stabilize()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Dispatches a pointer event on the current element if the browser supports it.
         * @param name Name of the pointer event to be dispatched.
         * @param clientX Coordinate of the user's pointer along the X axis.
         * @param clientY Coordinate of the user's pointer along the Y axis.
         * @param button Mouse button that should be pressed when dispatching the event.
         */
        UnitTestElement.prototype._dispatchPointerEventIfSupported = function (name, clientX, clientY, button) {
            // The latest versions of all browsers we support have the new `PointerEvent` API.
            // Though since we capture the two most recent versions of these browsers, we also
            // need to support Safari 12 at time of writing. Safari 12 does not have support for this,
            // so we need to conditionally create and dispatch these events based on feature detection.
            if (typeof PointerEvent !== 'undefined' && PointerEvent) {
                dispatchPointerEvent(this.element, name, clientX, clientY, { isPrimary: true, button: button });
            }
        };
        /** Dispatches all the events that are part of a mouse event sequence. */
        UnitTestElement.prototype._dispatchMouseEventSequence = function (name, args, button) {
            return __awaiter(this, void 0, void 0, function () {
                var clientX, clientY, modifiers, _a, left, top, width, height, relativeX, relativeY;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            clientX = undefined;
                            clientY = undefined;
                            modifiers = {};
                            if (args.length && typeof args[args.length - 1] === 'object') {
                                modifiers = args.pop();
                            }
                            if (!args.length) return [3 /*break*/, 2];
                            return [4 /*yield*/, this.getDimensions()];
                        case 1:
                            _a = _b.sent(), left = _a.left, top = _a.top, width = _a.width, height = _a.height;
                            relativeX = args[0] === 'center' ? width / 2 : args[0];
                            relativeY = args[0] === 'center' ? height / 2 : args[1];
                            // Round the computed click position as decimal pixels are not
                            // supported by mouse events and could lead to unexpected results.
                            clientX = Math.round(left + relativeX);
                            clientY = Math.round(top + relativeY);
                            _b.label = 2;
                        case 2:
                            this._dispatchPointerEventIfSupported('pointerdown', clientX, clientY, button);
                            dispatchMouseEvent(this.element, 'mousedown', clientX, clientY, button, modifiers);
                            this._dispatchPointerEventIfSupported('pointerup', clientX, clientY, button);
                            dispatchMouseEvent(this.element, 'mouseup', clientX, clientY, button, modifiers);
                            dispatchMouseEvent(this.element, name, clientX, clientY, button, modifiers);
                            // This call to _stabilize should not be needed since the callers will already do that them-
                            // selves. Nevertheless it breaks some tests in g3 without it. It needs to be investigated
                            // why removing breaks those tests.
                            return [4 /*yield*/, this._stabilize()];
                        case 3:
                            // This call to _stabilize should not be needed since the callers will already do that them-
                            // selves. Nevertheless it breaks some tests in g3 without it. It needs to be investigated
                            // why removing breaks those tests.
                            _b.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        return UnitTestElement;
    }());

    /** The default environment options. */
    var defaultEnvironmentOptions = {
        queryFn: function (selector, root) { return root.querySelectorAll(selector); }
    };
    /** Whether auto change detection is currently disabled. */
    var disableAutoChangeDetection = false;
    /**
     * The set of non-destroyed fixtures currently being used by `TestbedHarnessEnvironment` instances.
     */
    var activeFixtures = new Set();
    /**
     * Installs a handler for change detection batching status changes for a specific fixture.
     * @param fixture The fixture to handle change detection batching for.
     */
    function installAutoChangeDetectionStatusHandler(fixture) {
        if (!activeFixtures.size) {
            testing.handleAutoChangeDetectionStatus(function (_a) {
                var isDisabled = _a.isDisabled, onDetectChangesNow = _a.onDetectChangesNow;
                disableAutoChangeDetection = isDisabled;
                if (onDetectChangesNow) {
                    Promise.all(Array.from(activeFixtures).map(detectChanges)).then(onDetectChangesNow);
                }
            });
        }
        activeFixtures.add(fixture);
    }
    /**
     * Uninstalls a handler for change detection batching status changes for a specific fixture.
     * @param fixture The fixture to stop handling change detection batching for.
     */
    function uninstallAutoChangeDetectionStatusHandler(fixture) {
        activeFixtures.delete(fixture);
        if (!activeFixtures.size) {
            testing.stopHandlingAutoChangeDetectionStatus();
        }
    }
    /** Whether we are currently in the fake async zone. */
    function isInFakeAsyncZone() {
        return Zone.current.get('FakeAsyncTestZoneSpec') != null;
    }
    /**
     * Triggers change detection for a specific fixture.
     * @param fixture The fixture to trigger change detection for.
     */
    function detectChanges(fixture) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fixture.detectChanges();
                        if (!isInFakeAsyncZone()) return [3 /*break*/, 1];
                        testing$1.flush();
                        return [3 /*break*/, 3];
                    case 1: return [4 /*yield*/, fixture.whenStable()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    }
    /** A `HarnessEnvironment` implementation for Angular's Testbed. */
    var TestbedHarnessEnvironment = /** @class */ (function (_super) {
        __extends(TestbedHarnessEnvironment, _super);
        function TestbedHarnessEnvironment(rawRootElement, _fixture, options) {
            var _this = _super.call(this, rawRootElement) || this;
            _this._fixture = _fixture;
            /** Whether the environment has been destroyed. */
            _this._destroyed = false;
            _this._options = Object.assign(Object.assign({}, defaultEnvironmentOptions), options);
            _this._taskState = TaskStateZoneInterceptor.setup();
            installAutoChangeDetectionStatusHandler(_fixture);
            _fixture.componentRef.onDestroy(function () {
                uninstallAutoChangeDetectionStatusHandler(_fixture);
                _this._destroyed = true;
            });
            return _this;
        }
        /** Creates a `HarnessLoader` rooted at the given fixture's root element. */
        TestbedHarnessEnvironment.loader = function (fixture, options) {
            return new TestbedHarnessEnvironment(fixture.nativeElement, fixture, options);
        };
        /**
         * Creates a `HarnessLoader` at the document root. This can be used if harnesses are
         * located outside of a fixture (e.g. overlays appended to the document body).
         */
        TestbedHarnessEnvironment.documentRootLoader = function (fixture, options) {
            return new TestbedHarnessEnvironment(document.body, fixture, options);
        };
        /** Gets the native DOM element corresponding to the given TestElement. */
        TestbedHarnessEnvironment.getNativeElement = function (el) {
            if (el instanceof UnitTestElement) {
                return el.element;
            }
            throw Error('This TestElement was not created by the TestbedHarnessEnvironment');
        };
        /**
         * Creates an instance of the given harness type, using the fixture's root element as the
         * harness's host element. This method should be used when creating a harness for the root element
         * of a fixture, as components do not have the correct selector when they are created as the root
         * of the fixture.
         */
        TestbedHarnessEnvironment.harnessForFixture = function (fixture, harnessType, options) {
            return __awaiter(this, void 0, void 0, function () {
                var environment;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            environment = new TestbedHarnessEnvironment(fixture.nativeElement, fixture, options);
                            return [4 /*yield*/, environment.forceStabilize()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, environment.createComponentHarness(harnessType, fixture.nativeElement)];
                    }
                });
            });
        };
        /**
         * Flushes change detection and async tasks captured in the Angular zone.
         * In most cases it should not be necessary to call this manually. However, there may be some edge
         * cases where it is needed to fully flush animation events.
         */
        TestbedHarnessEnvironment.prototype.forceStabilize = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!!disableAutoChangeDetection) return [3 /*break*/, 2];
                            if (this._destroyed) {
                                throw Error('Harness is attempting to use a fixture that has already been destroyed.');
                            }
                            return [4 /*yield*/, detectChanges(this._fixture)];
                        case 1:
                            _a.sent();
                            _a.label = 2;
                        case 2: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Waits for all scheduled or running async tasks to complete. This allows harness
         * authors to wait for async tasks outside of the Angular zone.
         */
        TestbedHarnessEnvironment.prototype.waitForTasksOutsideAngular = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            // If we run in the fake async zone, we run "flush" to run any scheduled tasks. This
                            // ensures that the harnesses behave inside of the FakeAsyncTestZone similar to the
                            // "AsyncTestZone" and the root zone (i.e. neither fakeAsync or async). Note that we
                            // cannot just rely on the task state observable to become stable because the state will
                            // never change. This is because the task queue will be only drained if the fake async
                            // zone is being flushed.
                            if (isInFakeAsyncZone()) {
                                testing$1.flush();
                            }
                            // Wait until the task queue has been drained and the zone is stable. Note that
                            // we cannot rely on "fixture.whenStable" since it does not catch tasks scheduled
                            // outside of the Angular zone. For test harnesses, we want to ensure that the
                            // app is fully stabilized and therefore need to use our own zone interceptor.
                            return [4 /*yield*/, this._taskState.pipe(operators.takeWhile(function (state) { return !state.stable; })).toPromise()];
                        case 1:
                            // Wait until the task queue has been drained and the zone is stable. Note that
                            // we cannot rely on "fixture.whenStable" since it does not catch tasks scheduled
                            // outside of the Angular zone. For test harnesses, we want to ensure that the
                            // app is fully stabilized and therefore need to use our own zone interceptor.
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /** Gets the root element for the document. */
        TestbedHarnessEnvironment.prototype.getDocumentRoot = function () {
            return document.body;
        };
        /** Creates a `TestElement` from a raw element. */
        TestbedHarnessEnvironment.prototype.createTestElement = function (element) {
            var _this = this;
            return new UnitTestElement(element, function () { return _this.forceStabilize(); });
        };
        /** Creates a `HarnessLoader` rooted at the given raw element. */
        TestbedHarnessEnvironment.prototype.createEnvironment = function (element) {
            return new TestbedHarnessEnvironment(element, this._fixture, this._options);
        };
        /**
         * Gets a list of all elements matching the given selector under this environment's root element.
         */
        TestbedHarnessEnvironment.prototype.getAllRawElements = function (selector) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.forceStabilize()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, Array.from(this._options.queryFn(selector, this.rawRootElement))];
                    }
                });
            });
        };
        return TestbedHarnessEnvironment;
    }(testing.HarnessEnvironment));

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */

    exports.TestbedHarnessEnvironment = TestbedHarnessEnvironment;
    exports.UnitTestElement = UnitTestElement;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=cdk-testing-testbed.umd.js.map
