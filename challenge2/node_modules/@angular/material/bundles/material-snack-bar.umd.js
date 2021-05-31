(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/cdk/overlay'), require('@angular/cdk/portal'), require('@angular/common'), require('@angular/core'), require('@angular/material/core'), require('@angular/material/button'), require('rxjs'), require('@angular/cdk/platform'), require('rxjs/operators'), require('@angular/animations'), require('@angular/cdk/a11y'), require('@angular/cdk/layout')) :
    typeof define === 'function' && define.amd ? define('@angular/material/snack-bar', ['exports', '@angular/cdk/overlay', '@angular/cdk/portal', '@angular/common', '@angular/core', '@angular/material/core', '@angular/material/button', 'rxjs', '@angular/cdk/platform', 'rxjs/operators', '@angular/animations', '@angular/cdk/a11y', '@angular/cdk/layout'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.ng = global.ng || {}, global.ng.material = global.ng.material || {}, global.ng.material.snackBar = {}), global.ng.cdk.overlay, global.ng.cdk.portal, global.ng.common, global.ng.core, global.ng.material.core, global.ng.material.button, global.rxjs, global.ng.cdk.platform, global.rxjs.operators, global.ng.animations, global.ng.cdk.a11y, global.ng.cdk.layout));
}(this, (function (exports, i1, portal, common, i0, core, button, rxjs, platform, operators, animations, i2, i3) { 'use strict';

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
    var i3__namespace = /*#__PURE__*/_interopNamespace(i3);

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /** Injection token that can be used to access the data that was passed in to a snack bar. */
    var MAT_SNACK_BAR_DATA = new i0.InjectionToken('MatSnackBarData');
    /**
     * Configuration used when opening a snack-bar.
     */
    var MatSnackBarConfig = /** @class */ (function () {
        function MatSnackBarConfig() {
            /** The politeness level for the MatAriaLiveAnnouncer announcement. */
            this.politeness = 'assertive';
            /**
             * Message to be announced by the LiveAnnouncer. When opening a snackbar without a custom
             * component or template, the announcement message will default to the specified message.
             */
            this.announcementMessage = '';
            /** The length of time in milliseconds to wait before automatically dismissing the snack bar. */
            this.duration = 0;
            /** Data being injected into the child component. */
            this.data = null;
            /** The horizontal position to place the snack bar. */
            this.horizontalPosition = 'center';
            /** The vertical position to place the snack bar. */
            this.verticalPosition = 'bottom';
        }
        return MatSnackBarConfig;
    }());

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /** Maximum amount of milliseconds that can be passed into setTimeout. */
    var MAX_TIMEOUT = Math.pow(2, 31) - 1;
    /**
     * Reference to a snack bar dispatched from the snack bar service.
     */
    var MatSnackBarRef = /** @class */ (function () {
        function MatSnackBarRef(containerInstance, _overlayRef) {
            var _this = this;
            this._overlayRef = _overlayRef;
            /** Subject for notifying the user that the snack bar has been dismissed. */
            this._afterDismissed = new rxjs.Subject();
            /** Subject for notifying the user that the snack bar has opened and appeared. */
            this._afterOpened = new rxjs.Subject();
            /** Subject for notifying the user that the snack bar action was called. */
            this._onAction = new rxjs.Subject();
            /** Whether the snack bar was dismissed using the action button. */
            this._dismissedByAction = false;
            this.containerInstance = containerInstance;
            // Dismiss snackbar on action.
            this.onAction().subscribe(function () { return _this.dismiss(); });
            containerInstance._onExit.subscribe(function () { return _this._finishDismiss(); });
        }
        /** Dismisses the snack bar. */
        MatSnackBarRef.prototype.dismiss = function () {
            if (!this._afterDismissed.closed) {
                this.containerInstance.exit();
            }
            clearTimeout(this._durationTimeoutId);
        };
        /** Marks the snackbar action clicked. */
        MatSnackBarRef.prototype.dismissWithAction = function () {
            if (!this._onAction.closed) {
                this._dismissedByAction = true;
                this._onAction.next();
                this._onAction.complete();
            }
            clearTimeout(this._durationTimeoutId);
        };
        /**
         * Marks the snackbar action clicked.
         * @deprecated Use `dismissWithAction` instead.
         * @breaking-change 8.0.0
         */
        MatSnackBarRef.prototype.closeWithAction = function () {
            this.dismissWithAction();
        };
        /** Dismisses the snack bar after some duration */
        MatSnackBarRef.prototype._dismissAfter = function (duration) {
            var _this = this;
            // Note that we need to cap the duration to the maximum value for setTimeout, because
            // it'll revert to 1 if somebody passes in something greater (e.g. `Infinity`). See #17234.
            this._durationTimeoutId = setTimeout(function () { return _this.dismiss(); }, Math.min(duration, MAX_TIMEOUT));
        };
        /** Marks the snackbar as opened */
        MatSnackBarRef.prototype._open = function () {
            if (!this._afterOpened.closed) {
                this._afterOpened.next();
                this._afterOpened.complete();
            }
        };
        /** Cleans up the DOM after closing. */
        MatSnackBarRef.prototype._finishDismiss = function () {
            this._overlayRef.dispose();
            if (!this._onAction.closed) {
                this._onAction.complete();
            }
            this._afterDismissed.next({ dismissedByAction: this._dismissedByAction });
            this._afterDismissed.complete();
            this._dismissedByAction = false;
        };
        /** Gets an observable that is notified when the snack bar is finished closing. */
        MatSnackBarRef.prototype.afterDismissed = function () {
            return this._afterDismissed;
        };
        /** Gets an observable that is notified when the snack bar has opened and appeared. */
        MatSnackBarRef.prototype.afterOpened = function () {
            return this.containerInstance._onEnter;
        };
        /** Gets an observable that is notified when the snack bar action is called. */
        MatSnackBarRef.prototype.onAction = function () {
            return this._onAction;
        };
        return MatSnackBarRef;
    }());

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /**
     * A component used to open as the default snack bar, matching material spec.
     * This should only be used internally by the snack bar service.
     */
    var SimpleSnackBar = /** @class */ (function () {
        function SimpleSnackBar(snackBarRef, data) {
            this.snackBarRef = snackBarRef;
            this.data = data;
        }
        /** Performs the action on the snack bar. */
        SimpleSnackBar.prototype.action = function () {
            this.snackBarRef.dismissWithAction();
        };
        Object.defineProperty(SimpleSnackBar.prototype, "hasAction", {
            /** If the action button should be shown. */
            get: function () {
                return !!this.data.action;
            },
            enumerable: false,
            configurable: true
        });
        return SimpleSnackBar;
    }());
    SimpleSnackBar.decorators = [
        { type: i0.Component, args: [{
                    selector: 'simple-snack-bar',
                    template: "<span>{{data.message}}</span>\n<div class=\"mat-simple-snackbar-action\"  *ngIf=\"hasAction\">\n  <button mat-button (click)=\"action()\">{{data.action}}</button>\n</div>\n",
                    encapsulation: i0.ViewEncapsulation.None,
                    changeDetection: i0.ChangeDetectionStrategy.OnPush,
                    host: {
                        'class': 'mat-simple-snackbar',
                    },
                    styles: [".mat-simple-snackbar{display:flex;justify-content:space-between;align-items:center;line-height:20px;opacity:1}.mat-simple-snackbar-action{flex-shrink:0;margin:-8px -8px -8px 8px}.mat-simple-snackbar-action button{max-height:36px;min-width:0}[dir=rtl] .mat-simple-snackbar-action{margin-left:-8px;margin-right:8px}\n"]
                },] }
    ];
    SimpleSnackBar.ctorParameters = function () { return [
        { type: MatSnackBarRef },
        { type: undefined, decorators: [{ type: i0.Inject, args: [MAT_SNACK_BAR_DATA,] }] }
    ]; };

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

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /**
     * Animations used by the Material snack bar.
     * @docs-private
     */
    var matSnackBarAnimations = {
        /** Animation that shows and hides a snack bar. */
        snackBarState: animations.trigger('state', [
            animations.state('void, hidden', animations.style({
                transform: 'scale(0.8)',
                opacity: 0,
            })),
            animations.state('visible', animations.style({
                transform: 'scale(1)',
                opacity: 1,
            })),
            animations.transition('* => visible', animations.animate('150ms cubic-bezier(0, 0, 0.2, 1)')),
            animations.transition('* => void, * => hidden', animations.animate('75ms cubic-bezier(0.4, 0.0, 1, 1)', animations.style({
                opacity: 0
            }))),
        ])
    };

    /**
     * Internal component that wraps user-provided snack bar content.
     * @docs-private
     */
    var MatSnackBarContainer = /** @class */ (function (_super) {
        __extends(MatSnackBarContainer, _super);
        function MatSnackBarContainer(_ngZone, _elementRef, _changeDetectorRef, _platform, 
        /** The snack bar configuration. */
        snackBarConfig) {
            var _this = _super.call(this) || this;
            _this._ngZone = _ngZone;
            _this._elementRef = _elementRef;
            _this._changeDetectorRef = _changeDetectorRef;
            _this._platform = _platform;
            _this.snackBarConfig = snackBarConfig;
            /** The number of milliseconds to wait before announcing the snack bar's content. */
            _this._announceDelay = 150;
            /** Whether the component has been destroyed. */
            _this._destroyed = false;
            /** Subject for notifying that the snack bar has announced to screen readers. */
            _this._onAnnounce = new rxjs.Subject();
            /** Subject for notifying that the snack bar has exited from view. */
            _this._onExit = new rxjs.Subject();
            /** Subject for notifying that the snack bar has finished entering the view. */
            _this._onEnter = new rxjs.Subject();
            /** The state of the snack bar animations. */
            _this._animationState = 'void';
            /**
             * Attaches a DOM portal to the snack bar container.
             * @deprecated To be turned into a method.
             * @breaking-change 10.0.0
             */
            _this.attachDomPortal = function (portal) {
                _this._assertNotAttached();
                _this._applySnackBarClasses();
                return _this._portalOutlet.attachDomPortal(portal);
            };
            // Use aria-live rather than a live role like 'alert' or 'status'
            // because NVDA and JAWS have show inconsistent behavior with live roles.
            if (snackBarConfig.politeness === 'assertive' && !snackBarConfig.announcementMessage) {
                _this._live = 'assertive';
            }
            else if (snackBarConfig.politeness === 'off') {
                _this._live = 'off';
            }
            else {
                _this._live = 'polite';
            }
            // Only set role for Firefox. Set role based on aria-live because setting role="alert" implies
            // aria-live="assertive" which may cause issues if aria-live is set to "polite" above.
            if (_this._platform.FIREFOX) {
                if (_this._live === 'polite') {
                    _this._role = 'status';
                }
                if (_this._live === 'assertive') {
                    _this._role = 'alert';
                }
            }
            return _this;
        }
        /** Attach a component portal as content to this snack bar container. */
        MatSnackBarContainer.prototype.attachComponentPortal = function (portal) {
            this._assertNotAttached();
            this._applySnackBarClasses();
            return this._portalOutlet.attachComponentPortal(portal);
        };
        /** Attach a template portal as content to this snack bar container. */
        MatSnackBarContainer.prototype.attachTemplatePortal = function (portal) {
            this._assertNotAttached();
            this._applySnackBarClasses();
            return this._portalOutlet.attachTemplatePortal(portal);
        };
        /** Handle end of animations, updating the state of the snackbar. */
        MatSnackBarContainer.prototype.onAnimationEnd = function (event) {
            var fromState = event.fromState, toState = event.toState;
            if ((toState === 'void' && fromState !== 'void') || toState === 'hidden') {
                this._completeExit();
            }
            if (toState === 'visible') {
                // Note: we shouldn't use `this` inside the zone callback,
                // because it can cause a memory leak.
                var onEnter_1 = this._onEnter;
                this._ngZone.run(function () {
                    onEnter_1.next();
                    onEnter_1.complete();
                });
            }
        };
        /** Begin animation of snack bar entrance into view. */
        MatSnackBarContainer.prototype.enter = function () {
            if (!this._destroyed) {
                this._animationState = 'visible';
                this._changeDetectorRef.detectChanges();
                this._screenReaderAnnounce();
            }
        };
        /** Begin animation of the snack bar exiting from view. */
        MatSnackBarContainer.prototype.exit = function () {
            // Note: this one transitions to `hidden`, rather than `void`, in order to handle the case
            // where multiple snack bars are opened in quick succession (e.g. two consecutive calls to
            // `MatSnackBar.open`).
            this._animationState = 'hidden';
            // Mark this element with an 'exit' attribute to indicate that the snackbar has
            // been dismissed and will soon be removed from the DOM. This is used by the snackbar
            // test harness.
            this._elementRef.nativeElement.setAttribute('mat-exit', '');
            // If the snack bar hasn't been announced by the time it exits it wouldn't have been open
            // long enough to visually read it either, so clear the timeout for announcing.
            clearTimeout(this._announceTimeoutId);
            return this._onExit;
        };
        /** Makes sure the exit callbacks have been invoked when the element is destroyed. */
        MatSnackBarContainer.prototype.ngOnDestroy = function () {
            this._destroyed = true;
            this._completeExit();
        };
        /**
         * Waits for the zone to settle before removing the element. Helps prevent
         * errors where we end up removing an element which is in the middle of an animation.
         */
        MatSnackBarContainer.prototype._completeExit = function () {
            var _this = this;
            this._ngZone.onMicrotaskEmpty.pipe(operators.take(1)).subscribe(function () {
                _this._onExit.next();
                _this._onExit.complete();
            });
        };
        /** Applies the various positioning and user-configured CSS classes to the snack bar. */
        MatSnackBarContainer.prototype._applySnackBarClasses = function () {
            var element = this._elementRef.nativeElement;
            var panelClasses = this.snackBarConfig.panelClass;
            if (panelClasses) {
                if (Array.isArray(panelClasses)) {
                    // Note that we can't use a spread here, because IE doesn't support multiple arguments.
                    panelClasses.forEach(function (cssClass) { return element.classList.add(cssClass); });
                }
                else {
                    element.classList.add(panelClasses);
                }
            }
            if (this.snackBarConfig.horizontalPosition === 'center') {
                element.classList.add('mat-snack-bar-center');
            }
            if (this.snackBarConfig.verticalPosition === 'top') {
                element.classList.add('mat-snack-bar-top');
            }
        };
        /** Asserts that no content is already attached to the container. */
        MatSnackBarContainer.prototype._assertNotAttached = function () {
            if (this._portalOutlet.hasAttached() && (typeof ngDevMode === 'undefined' || ngDevMode)) {
                throw Error('Attempting to attach snack bar content after content is already attached');
            }
        };
        /**
         * Starts a timeout to move the snack bar content to the live region so screen readers will
         * announce it.
         */
        MatSnackBarContainer.prototype._screenReaderAnnounce = function () {
            var _this = this;
            if (!this._announceTimeoutId) {
                this._ngZone.runOutsideAngular(function () {
                    _this._announceTimeoutId = setTimeout(function () {
                        var inertElement = _this._elementRef.nativeElement.querySelector('[aria-hidden]');
                        var liveElement = _this._elementRef.nativeElement.querySelector('[aria-live]');
                        if (inertElement && liveElement) {
                            // If an element in the snack bar content is focused before being moved
                            // track it and restore focus after moving to the live region.
                            var focusedElement = null;
                            if (_this._platform.isBrowser &&
                                document.activeElement instanceof HTMLElement &&
                                inertElement.contains(document.activeElement)) {
                                focusedElement = document.activeElement;
                            }
                            inertElement.removeAttribute('aria-hidden');
                            liveElement.appendChild(inertElement);
                            focusedElement === null || focusedElement === void 0 ? void 0 : focusedElement.focus();
                            _this._onAnnounce.next();
                            _this._onAnnounce.complete();
                        }
                    }, _this._announceDelay);
                });
            }
        };
        return MatSnackBarContainer;
    }(portal.BasePortalOutlet));
    MatSnackBarContainer.decorators = [
        { type: i0.Component, args: [{
                    selector: 'snack-bar-container',
                    template: "<!-- Initially holds the snack bar content, will be empty after announcing to screen readers. -->\n<div aria-hidden=\"true\">\n  <ng-template cdkPortalOutlet></ng-template>\n</div>\n\n<!-- Will receive the snack bar content from the non-live div, move will happen a short delay after opening -->\n<div [attr.aria-live]=\"_live\" [attr.role]=\"_role\"></div>\n",
                    // In Ivy embedded views will be change detected from their declaration place, rather than
                    // where they were stamped out. This means that we can't have the snack bar container be OnPush,
                    // because it might cause snack bars that were opened from a template not to be out of date.
                    // tslint:disable-next-line:validate-decorators
                    changeDetection: i0.ChangeDetectionStrategy.Default,
                    encapsulation: i0.ViewEncapsulation.None,
                    animations: [matSnackBarAnimations.snackBarState],
                    host: {
                        'class': 'mat-snack-bar-container',
                        '[@state]': '_animationState',
                        '(@state.done)': 'onAnimationEnd($event)'
                    },
                    styles: [".mat-snack-bar-container{border-radius:4px;box-sizing:border-box;display:block;margin:24px;max-width:33vw;min-width:344px;padding:14px 16px;min-height:48px;transform-origin:center}.cdk-high-contrast-active .mat-snack-bar-container{border:solid 1px}.mat-snack-bar-handset{width:100%}.mat-snack-bar-handset .mat-snack-bar-container{margin:8px;max-width:100%;min-width:0;width:100%}\n"]
                },] }
    ];
    MatSnackBarContainer.ctorParameters = function () { return [
        { type: i0.NgZone },
        { type: i0.ElementRef },
        { type: i0.ChangeDetectorRef },
        { type: platform.Platform },
        { type: MatSnackBarConfig }
    ]; };
    MatSnackBarContainer.propDecorators = {
        _portalOutlet: [{ type: i0.ViewChild, args: [portal.CdkPortalOutlet, { static: true },] }]
    };

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var MatSnackBarModule = /** @class */ (function () {
        function MatSnackBarModule() {
        }
        return MatSnackBarModule;
    }());
    MatSnackBarModule.decorators = [
        { type: i0.NgModule, args: [{
                    imports: [
                        i1.OverlayModule,
                        portal.PortalModule,
                        common.CommonModule,
                        button.MatButtonModule,
                        core.MatCommonModule,
                    ],
                    exports: [MatSnackBarContainer, core.MatCommonModule],
                    declarations: [MatSnackBarContainer, SimpleSnackBar],
                    entryComponents: [MatSnackBarContainer, SimpleSnackBar],
                },] }
    ];

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /** Injection token that can be used to specify default snack bar. */
    var MAT_SNACK_BAR_DEFAULT_OPTIONS = new i0.InjectionToken('mat-snack-bar-default-options', {
        providedIn: 'root',
        factory: MAT_SNACK_BAR_DEFAULT_OPTIONS_FACTORY,
    });
    /** @docs-private */
    function MAT_SNACK_BAR_DEFAULT_OPTIONS_FACTORY() {
        return new MatSnackBarConfig();
    }
    /**
     * Service to dispatch Material Design snack bar messages.
     */
    var MatSnackBar = /** @class */ (function () {
        function MatSnackBar(_overlay, _live, _injector, _breakpointObserver, _parentSnackBar, _defaultConfig) {
            this._overlay = _overlay;
            this._live = _live;
            this._injector = _injector;
            this._breakpointObserver = _breakpointObserver;
            this._parentSnackBar = _parentSnackBar;
            this._defaultConfig = _defaultConfig;
            /**
             * Reference to the current snack bar in the view *at this level* (in the Angular injector tree).
             * If there is a parent snack-bar service, all operations should delegate to that parent
             * via `_openedSnackBarRef`.
             */
            this._snackBarRefAtThisLevel = null;
            /** The component that should be rendered as the snack bar's simple component. */
            this.simpleSnackBarComponent = SimpleSnackBar;
            /** The container component that attaches the provided template or component. */
            this.snackBarContainerComponent = MatSnackBarContainer;
            /** The CSS class to apply for handset mode. */
            this.handsetCssClass = 'mat-snack-bar-handset';
        }
        Object.defineProperty(MatSnackBar.prototype, "_openedSnackBarRef", {
            /** Reference to the currently opened snackbar at *any* level. */
            get: function () {
                var parent = this._parentSnackBar;
                return parent ? parent._openedSnackBarRef : this._snackBarRefAtThisLevel;
            },
            set: function (value) {
                if (this._parentSnackBar) {
                    this._parentSnackBar._openedSnackBarRef = value;
                }
                else {
                    this._snackBarRefAtThisLevel = value;
                }
            },
            enumerable: false,
            configurable: true
        });
        /**
         * Creates and dispatches a snack bar with a custom component for the content, removing any
         * currently opened snack bars.
         *
         * @param component Component to be instantiated.
         * @param config Extra configuration for the snack bar.
         */
        MatSnackBar.prototype.openFromComponent = function (component, config) {
            return this._attach(component, config);
        };
        /**
         * Creates and dispatches a snack bar with a custom template for the content, removing any
         * currently opened snack bars.
         *
         * @param template Template to be instantiated.
         * @param config Extra configuration for the snack bar.
         */
        MatSnackBar.prototype.openFromTemplate = function (template, config) {
            return this._attach(template, config);
        };
        /**
         * Opens a snackbar with a message and an optional action.
         * @param message The message to show in the snackbar.
         * @param action The label for the snackbar action.
         * @param config Additional configuration options for the snackbar.
         */
        MatSnackBar.prototype.open = function (message, action, config) {
            if (action === void 0) { action = ''; }
            var _config = Object.assign(Object.assign({}, this._defaultConfig), config);
            // Since the user doesn't have access to the component, we can
            // override the data to pass in our own message and action.
            _config.data = { message: message, action: action };
            // Since the snack bar has `role="alert"`, we don't
            // want to announce the same message twice.
            if (_config.announcementMessage === message) {
                _config.announcementMessage = undefined;
            }
            return this.openFromComponent(this.simpleSnackBarComponent, _config);
        };
        /**
         * Dismisses the currently-visible snack bar.
         */
        MatSnackBar.prototype.dismiss = function () {
            if (this._openedSnackBarRef) {
                this._openedSnackBarRef.dismiss();
            }
        };
        MatSnackBar.prototype.ngOnDestroy = function () {
            // Only dismiss the snack bar at the current level on destroy.
            if (this._snackBarRefAtThisLevel) {
                this._snackBarRefAtThisLevel.dismiss();
            }
        };
        /**
         * Attaches the snack bar container component to the overlay.
         */
        MatSnackBar.prototype._attachSnackBarContainer = function (overlayRef, config) {
            var userInjector = config && config.viewContainerRef && config.viewContainerRef.injector;
            var injector = i0.Injector.create({
                parent: userInjector || this._injector,
                providers: [{ provide: MatSnackBarConfig, useValue: config }]
            });
            var containerPortal = new portal.ComponentPortal(this.snackBarContainerComponent, config.viewContainerRef, injector);
            var containerRef = overlayRef.attach(containerPortal);
            containerRef.instance.snackBarConfig = config;
            return containerRef.instance;
        };
        /**
         * Places a new component or a template as the content of the snack bar container.
         */
        MatSnackBar.prototype._attach = function (content, userConfig) {
            var _this = this;
            var config = Object.assign(Object.assign(Object.assign({}, new MatSnackBarConfig()), this._defaultConfig), userConfig);
            var overlayRef = this._createOverlay(config);
            var container = this._attachSnackBarContainer(overlayRef, config);
            var snackBarRef = new MatSnackBarRef(container, overlayRef);
            if (content instanceof i0.TemplateRef) {
                var portal$1 = new portal.TemplatePortal(content, null, {
                    $implicit: config.data,
                    snackBarRef: snackBarRef
                });
                snackBarRef.instance = container.attachTemplatePortal(portal$1);
            }
            else {
                var injector = this._createInjector(config, snackBarRef);
                var portal$1 = new portal.ComponentPortal(content, undefined, injector);
                var contentRef = container.attachComponentPortal(portal$1);
                // We can't pass this via the injector, because the injector is created earlier.
                snackBarRef.instance = contentRef.instance;
            }
            // Subscribe to the breakpoint observer and attach the mat-snack-bar-handset class as
            // appropriate. This class is applied to the overlay element because the overlay must expand to
            // fill the width of the screen for full width snackbars.
            this._breakpointObserver.observe(i3.Breakpoints.HandsetPortrait).pipe(operators.takeUntil(overlayRef.detachments())).subscribe(function (state) {
                var classList = overlayRef.overlayElement.classList;
                state.matches ? classList.add(_this.handsetCssClass) : classList.remove(_this.handsetCssClass);
            });
            if (config.announcementMessage) {
                // Wait until the snack bar contents have been announced then deliver this message.
                container._onAnnounce.subscribe(function () {
                    _this._live.announce(config.announcementMessage, config.politeness);
                });
            }
            this._animateSnackBar(snackBarRef, config);
            this._openedSnackBarRef = snackBarRef;
            return this._openedSnackBarRef;
        };
        /** Animates the old snack bar out and the new one in. */
        MatSnackBar.prototype._animateSnackBar = function (snackBarRef, config) {
            var _this = this;
            // When the snackbar is dismissed, clear the reference to it.
            snackBarRef.afterDismissed().subscribe(function () {
                // Clear the snackbar ref if it hasn't already been replaced by a newer snackbar.
                if (_this._openedSnackBarRef == snackBarRef) {
                    _this._openedSnackBarRef = null;
                }
                if (config.announcementMessage) {
                    _this._live.clear();
                }
            });
            if (this._openedSnackBarRef) {
                // If a snack bar is already in view, dismiss it and enter the
                // new snack bar after exit animation is complete.
                this._openedSnackBarRef.afterDismissed().subscribe(function () {
                    snackBarRef.containerInstance.enter();
                });
                this._openedSnackBarRef.dismiss();
            }
            else {
                // If no snack bar is in view, enter the new snack bar.
                snackBarRef.containerInstance.enter();
            }
            // If a dismiss timeout is provided, set up dismiss based on after the snackbar is opened.
            if (config.duration && config.duration > 0) {
                snackBarRef.afterOpened().subscribe(function () { return snackBarRef._dismissAfter(config.duration); });
            }
        };
        /**
         * Creates a new overlay and places it in the correct location.
         * @param config The user-specified snack bar config.
         */
        MatSnackBar.prototype._createOverlay = function (config) {
            var overlayConfig = new i1.OverlayConfig();
            overlayConfig.direction = config.direction;
            var positionStrategy = this._overlay.position().global();
            // Set horizontal position.
            var isRtl = config.direction === 'rtl';
            var isLeft = (config.horizontalPosition === 'left' ||
                (config.horizontalPosition === 'start' && !isRtl) ||
                (config.horizontalPosition === 'end' && isRtl));
            var isRight = !isLeft && config.horizontalPosition !== 'center';
            if (isLeft) {
                positionStrategy.left('0');
            }
            else if (isRight) {
                positionStrategy.right('0');
            }
            else {
                positionStrategy.centerHorizontally();
            }
            // Set horizontal position.
            if (config.verticalPosition === 'top') {
                positionStrategy.top('0');
            }
            else {
                positionStrategy.bottom('0');
            }
            overlayConfig.positionStrategy = positionStrategy;
            return this._overlay.create(overlayConfig);
        };
        /**
         * Creates an injector to be used inside of a snack bar component.
         * @param config Config that was used to create the snack bar.
         * @param snackBarRef Reference to the snack bar.
         */
        MatSnackBar.prototype._createInjector = function (config, snackBarRef) {
            var userInjector = config && config.viewContainerRef && config.viewContainerRef.injector;
            return i0.Injector.create({
                parent: userInjector || this._injector,
                providers: [
                    { provide: MatSnackBarRef, useValue: snackBarRef },
                    { provide: MAT_SNACK_BAR_DATA, useValue: config.data }
                ]
            });
        };
        return MatSnackBar;
    }());
    MatSnackBar.ɵprov = i0__namespace.ɵɵdefineInjectable({ factory: function MatSnackBar_Factory() { return new MatSnackBar(i0__namespace.ɵɵinject(i1__namespace.Overlay), i0__namespace.ɵɵinject(i2__namespace.LiveAnnouncer), i0__namespace.ɵɵinject(i0__namespace.INJECTOR), i0__namespace.ɵɵinject(i3__namespace.BreakpointObserver), i0__namespace.ɵɵinject(MatSnackBar, 12), i0__namespace.ɵɵinject(MAT_SNACK_BAR_DEFAULT_OPTIONS)); }, token: MatSnackBar, providedIn: MatSnackBarModule });
    MatSnackBar.decorators = [
        { type: i0.Injectable, args: [{ providedIn: MatSnackBarModule },] }
    ];
    MatSnackBar.ctorParameters = function () { return [
        { type: i1.Overlay },
        { type: i2.LiveAnnouncer },
        { type: i0.Injector },
        { type: i3.BreakpointObserver },
        { type: MatSnackBar, decorators: [{ type: i0.Optional }, { type: i0.SkipSelf }] },
        { type: MatSnackBarConfig, decorators: [{ type: i0.Inject, args: [MAT_SNACK_BAR_DEFAULT_OPTIONS,] }] }
    ]; };

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */

    /**
     * Generated bundle index. Do not edit.
     */

    exports.MAT_SNACK_BAR_DATA = MAT_SNACK_BAR_DATA;
    exports.MAT_SNACK_BAR_DEFAULT_OPTIONS = MAT_SNACK_BAR_DEFAULT_OPTIONS;
    exports.MAT_SNACK_BAR_DEFAULT_OPTIONS_FACTORY = MAT_SNACK_BAR_DEFAULT_OPTIONS_FACTORY;
    exports.MatSnackBar = MatSnackBar;
    exports.MatSnackBarConfig = MatSnackBarConfig;
    exports.MatSnackBarContainer = MatSnackBarContainer;
    exports.MatSnackBarModule = MatSnackBarModule;
    exports.MatSnackBarRef = MatSnackBarRef;
    exports.SimpleSnackBar = SimpleSnackBar;
    exports.matSnackBarAnimations = matSnackBarAnimations;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=material-snack-bar.umd.js.map
