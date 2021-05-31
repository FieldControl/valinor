(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/cdk/overlay'), require('@angular/cdk/a11y'), require('@angular/common'), require('@angular/core'), require('@angular/material/core'), require('@angular/cdk/scrolling'), require('@angular/cdk/bidi'), require('@angular/cdk/coercion'), require('@angular/cdk/keycodes'), require('@angular/cdk/layout'), require('@angular/cdk/platform'), require('@angular/cdk/portal'), require('rxjs'), require('rxjs/operators'), require('@angular/animations')) :
    typeof define === 'function' && define.amd ? define('@angular/material/tooltip', ['exports', '@angular/cdk/overlay', '@angular/cdk/a11y', '@angular/common', '@angular/core', '@angular/material/core', '@angular/cdk/scrolling', '@angular/cdk/bidi', '@angular/cdk/coercion', '@angular/cdk/keycodes', '@angular/cdk/layout', '@angular/cdk/platform', '@angular/cdk/portal', 'rxjs', 'rxjs/operators', '@angular/animations'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.ng = global.ng || {}, global.ng.material = global.ng.material || {}, global.ng.material.tooltip = {}), global.ng.cdk.overlay, global.ng.cdk.a11y, global.ng.common, global.ng.core, global.ng.material.core, global.ng.cdk.scrolling, global.ng.cdk.bidi, global.ng.cdk.coercion, global.ng.cdk.keycodes, global.ng.cdk.layout, global.ng.cdk.platform, global.ng.cdk.portal, global.rxjs, global.rxjs.operators, global.ng.animations));
}(this, (function (exports, overlay, a11y, common, core, core$1, scrolling, bidi, coercion, keycodes, layout, platform, portal, rxjs, operators, animations) { 'use strict';

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
     * Animations used by MatTooltip.
     * @docs-private
     */
    var matTooltipAnimations = {
        /** Animation that transitions a tooltip in and out. */
        tooltipState: animations.trigger('state', [
            animations.state('initial, void, hidden', animations.style({ opacity: 0, transform: 'scale(0)' })),
            animations.state('visible', animations.style({ transform: 'scale(1)' })),
            animations.transition('* => visible', animations.animate('200ms cubic-bezier(0, 0, 0.2, 1)', animations.keyframes([
                animations.style({ opacity: 0, transform: 'scale(0)', offset: 0 }),
                animations.style({ opacity: 0.5, transform: 'scale(0.99)', offset: 0.5 }),
                animations.style({ opacity: 1, transform: 'scale(1)', offset: 1 })
            ]))),
            animations.transition('* => hidden', animations.animate('100ms cubic-bezier(0, 0, 0.2, 1)', animations.style({ opacity: 0 }))),
        ])
    };

    /** Time in ms to throttle repositioning after scroll events. */
    var SCROLL_THROTTLE_MS = 20;
    /**
     * CSS class that will be attached to the overlay panel.
     * @deprecated
     * @breaking-change 13.0.0 remove this variable
     */
    var TOOLTIP_PANEL_CLASS = 'mat-tooltip-panel';
    var PANEL_CLASS = 'tooltip-panel';
    /** Options used to bind passive event listeners. */
    var passiveListenerOptions = platform.normalizePassiveListenerOptions({ passive: true });
    /**
     * Time between the user putting the pointer on a tooltip
     * trigger and the long press event being fired.
     */
    var LONGPRESS_DELAY = 500;
    /**
     * Creates an error to be thrown if the user supplied an invalid tooltip position.
     * @docs-private
     */
    function getMatTooltipInvalidPositionError(position) {
        return Error("Tooltip position \"" + position + "\" is invalid.");
    }
    /** Injection token that determines the scroll handling while a tooltip is visible. */
    var MAT_TOOLTIP_SCROLL_STRATEGY = new core.InjectionToken('mat-tooltip-scroll-strategy');
    /** @docs-private */
    function MAT_TOOLTIP_SCROLL_STRATEGY_FACTORY(overlay) {
        return function () { return overlay.scrollStrategies.reposition({ scrollThrottle: SCROLL_THROTTLE_MS }); };
    }
    /** @docs-private */
    var MAT_TOOLTIP_SCROLL_STRATEGY_FACTORY_PROVIDER = {
        provide: MAT_TOOLTIP_SCROLL_STRATEGY,
        deps: [overlay.Overlay],
        useFactory: MAT_TOOLTIP_SCROLL_STRATEGY_FACTORY,
    };
    /** Injection token to be used to override the default options for `matTooltip`. */
    var MAT_TOOLTIP_DEFAULT_OPTIONS = new core.InjectionToken('mat-tooltip-default-options', {
        providedIn: 'root',
        factory: MAT_TOOLTIP_DEFAULT_OPTIONS_FACTORY
    });
    /** @docs-private */
    function MAT_TOOLTIP_DEFAULT_OPTIONS_FACTORY() {
        return {
            showDelay: 0,
            hideDelay: 0,
            touchendHideDelay: 1500,
        };
    }
    var _MatTooltipBase = /** @class */ (function () {
        function _MatTooltipBase(_overlay, _elementRef, _scrollDispatcher, _viewContainerRef, _ngZone, _platform, _ariaDescriber, _focusMonitor, scrollStrategy, _dir, _defaultOptions, _document) {
            var _this = this;
            this._overlay = _overlay;
            this._elementRef = _elementRef;
            this._scrollDispatcher = _scrollDispatcher;
            this._viewContainerRef = _viewContainerRef;
            this._ngZone = _ngZone;
            this._platform = _platform;
            this._ariaDescriber = _ariaDescriber;
            this._focusMonitor = _focusMonitor;
            this._dir = _dir;
            this._defaultOptions = _defaultOptions;
            this._position = 'below';
            this._disabled = false;
            this._viewInitialized = false;
            this._pointerExitEventsInitialized = false;
            this._viewportMargin = 8;
            this._cssClassPrefix = 'mat';
            /** The default delay in ms before showing the tooltip after show is called */
            this.showDelay = this._defaultOptions.showDelay;
            /** The default delay in ms before hiding the tooltip after hide is called */
            this.hideDelay = this._defaultOptions.hideDelay;
            /**
             * How touch gestures should be handled by the tooltip. On touch devices the tooltip directive
             * uses a long press gesture to show and hide, however it can conflict with the native browser
             * gestures. To work around the conflict, Angular Material disables native gestures on the
             * trigger, but that might not be desirable on particular elements (e.g. inputs and draggable
             * elements). The different values for this option configure the touch event handling as follows:
             * - `auto` - Enables touch gestures for all elements, but tries to avoid conflicts with native
             *   browser gestures on particular elements. In particular, it allows text selection on inputs
             *   and textareas, and preserves the native browser dragging on elements marked as `draggable`.
             * - `on` - Enables touch gestures for all elements and disables native
             *   browser gestures with no exceptions.
             * - `off` - Disables touch gestures. Note that this will prevent the tooltip from
             *   showing on touch devices.
             */
            this.touchGestures = 'auto';
            this._message = '';
            /** Manually-bound passive event listeners. */
            this._passiveListeners = [];
            /** Emits when the component is destroyed. */
            this._destroyed = new rxjs.Subject();
            /**
             * Handles the keydown events on the host element.
             * Needs to be an arrow function so that we can use it in addEventListener.
             */
            this._handleKeydown = function (event) {
                if (_this._isTooltipVisible() && event.keyCode === keycodes.ESCAPE && !keycodes.hasModifierKey(event)) {
                    event.preventDefault();
                    event.stopPropagation();
                    _this._ngZone.run(function () { return _this.hide(0); });
                }
            };
            this._scrollStrategy = scrollStrategy;
            this._document = _document;
            if (_defaultOptions) {
                if (_defaultOptions.position) {
                    this.position = _defaultOptions.position;
                }
                if (_defaultOptions.touchGestures) {
                    this.touchGestures = _defaultOptions.touchGestures;
                }
            }
            _dir.change.pipe(operators.takeUntil(this._destroyed)).subscribe(function () {
                if (_this._overlayRef) {
                    _this._updatePosition(_this._overlayRef);
                }
            });
            _ngZone.runOutsideAngular(function () {
                _elementRef.nativeElement.addEventListener('keydown', _this._handleKeydown);
            });
        }
        Object.defineProperty(_MatTooltipBase.prototype, "position", {
            /** Allows the user to define the position of the tooltip relative to the parent element */
            get: function () { return this._position; },
            set: function (value) {
                var _a;
                if (value !== this._position) {
                    this._position = value;
                    if (this._overlayRef) {
                        this._updatePosition(this._overlayRef);
                        (_a = this._tooltipInstance) === null || _a === void 0 ? void 0 : _a.show(0);
                        this._overlayRef.updatePosition();
                    }
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(_MatTooltipBase.prototype, "disabled", {
            /** Disables the display of the tooltip. */
            get: function () { return this._disabled; },
            set: function (value) {
                this._disabled = coercion.coerceBooleanProperty(value);
                // If tooltip is disabled, hide immediately.
                if (this._disabled) {
                    this.hide(0);
                }
                else {
                    this._setupPointerEnterEventsIfNeeded();
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(_MatTooltipBase.prototype, "message", {
            /** The message to be displayed in the tooltip */
            get: function () { return this._message; },
            set: function (value) {
                var _this = this;
                this._ariaDescriber.removeDescription(this._elementRef.nativeElement, this._message, 'tooltip');
                // If the message is not a string (e.g. number), convert it to a string and trim it.
                // Must convert with `String(value)`, not `${value}`, otherwise Closure Compiler optimises
                // away the string-conversion: https://github.com/angular/components/issues/20684
                this._message = value != null ? String(value).trim() : '';
                if (!this._message && this._isTooltipVisible()) {
                    this.hide(0);
                }
                else {
                    this._setupPointerEnterEventsIfNeeded();
                    this._updateTooltipMessage();
                    this._ngZone.runOutsideAngular(function () {
                        // The `AriaDescriber` has some functionality that avoids adding a description if it's the
                        // same as the `aria-label` of an element, however we can't know whether the tooltip trigger
                        // has a data-bound `aria-label` or when it'll be set for the first time. We can avoid the
                        // issue by deferring the description by a tick so Angular has time to set the `aria-label`.
                        Promise.resolve().then(function () {
                            _this._ariaDescriber.describe(_this._elementRef.nativeElement, _this.message, 'tooltip');
                        });
                    });
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(_MatTooltipBase.prototype, "tooltipClass", {
            /** Classes to be passed to the tooltip. Supports the same syntax as `ngClass`. */
            get: function () { return this._tooltipClass; },
            set: function (value) {
                this._tooltipClass = value;
                if (this._tooltipInstance) {
                    this._setTooltipClass(this._tooltipClass);
                }
            },
            enumerable: false,
            configurable: true
        });
        _MatTooltipBase.prototype.ngAfterViewInit = function () {
            var _this = this;
            // This needs to happen after view init so the initial values for all inputs have been set.
            this._viewInitialized = true;
            this._setupPointerEnterEventsIfNeeded();
            this._focusMonitor.monitor(this._elementRef)
                .pipe(operators.takeUntil(this._destroyed))
                .subscribe(function (origin) {
                // Note that the focus monitor runs outside the Angular zone.
                if (!origin) {
                    _this._ngZone.run(function () { return _this.hide(0); });
                }
                else if (origin === 'keyboard') {
                    _this._ngZone.run(function () { return _this.show(); });
                }
            });
        };
        /**
         * Dispose the tooltip when destroyed.
         */
        _MatTooltipBase.prototype.ngOnDestroy = function () {
            var nativeElement = this._elementRef.nativeElement;
            clearTimeout(this._touchstartTimeout);
            if (this._overlayRef) {
                this._overlayRef.dispose();
                this._tooltipInstance = null;
            }
            // Clean up the event listeners set in the constructor
            nativeElement.removeEventListener('keydown', this._handleKeydown);
            this._passiveListeners.forEach(function (_b) {
                var _c = __read(_b, 2), event = _c[0], listener = _c[1];
                nativeElement.removeEventListener(event, listener, passiveListenerOptions);
            });
            this._passiveListeners.length = 0;
            this._destroyed.next();
            this._destroyed.complete();
            this._ariaDescriber.removeDescription(nativeElement, this.message, 'tooltip');
            this._focusMonitor.stopMonitoring(nativeElement);
        };
        /** Shows the tooltip after the delay in ms, defaults to tooltip-delay-show or 0ms if no input */
        _MatTooltipBase.prototype.show = function (delay) {
            var _this = this;
            if (delay === void 0) { delay = this.showDelay; }
            if (this.disabled || !this.message || (this._isTooltipVisible() &&
                !this._tooltipInstance._showTimeoutId && !this._tooltipInstance._hideTimeoutId)) {
                return;
            }
            var overlayRef = this._createOverlay();
            this._detach();
            this._portal = this._portal ||
                new portal.ComponentPortal(this._tooltipComponent, this._viewContainerRef);
            this._tooltipInstance = overlayRef.attach(this._portal).instance;
            this._tooltipInstance.afterHidden()
                .pipe(operators.takeUntil(this._destroyed))
                .subscribe(function () { return _this._detach(); });
            this._setTooltipClass(this._tooltipClass);
            this._updateTooltipMessage();
            this._tooltipInstance.show(delay);
        };
        /** Hides the tooltip after the delay in ms, defaults to tooltip-delay-hide or 0ms if no input */
        _MatTooltipBase.prototype.hide = function (delay) {
            if (delay === void 0) { delay = this.hideDelay; }
            if (this._tooltipInstance) {
                this._tooltipInstance.hide(delay);
            }
        };
        /** Shows/hides the tooltip */
        _MatTooltipBase.prototype.toggle = function () {
            this._isTooltipVisible() ? this.hide() : this.show();
        };
        /** Returns true if the tooltip is currently visible to the user */
        _MatTooltipBase.prototype._isTooltipVisible = function () {
            return !!this._tooltipInstance && this._tooltipInstance.isVisible();
        };
        /** Create the overlay config and position strategy */
        _MatTooltipBase.prototype._createOverlay = function () {
            var _this = this;
            if (this._overlayRef) {
                return this._overlayRef;
            }
            var scrollableAncestors = this._scrollDispatcher.getAncestorScrollContainers(this._elementRef);
            // Create connected position strategy that listens for scroll events to reposition.
            var strategy = this._overlay.position()
                .flexibleConnectedTo(this._elementRef)
                .withTransformOriginOn("." + this._cssClassPrefix + "-tooltip")
                .withFlexibleDimensions(false)
                .withViewportMargin(this._viewportMargin)
                .withScrollableContainers(scrollableAncestors);
            strategy.positionChanges.pipe(operators.takeUntil(this._destroyed)).subscribe(function (change) {
                _this._updateCurrentPositionClass(change.connectionPair);
                if (_this._tooltipInstance) {
                    if (change.scrollableViewProperties.isOverlayClipped && _this._tooltipInstance.isVisible()) {
                        // After position changes occur and the overlay is clipped by
                        // a parent scrollable then close the tooltip.
                        _this._ngZone.run(function () { return _this.hide(0); });
                    }
                }
            });
            this._overlayRef = this._overlay.create({
                direction: this._dir,
                positionStrategy: strategy,
                panelClass: this._cssClassPrefix + "-" + PANEL_CLASS,
                scrollStrategy: this._scrollStrategy()
            });
            this._updatePosition(this._overlayRef);
            this._overlayRef.detachments()
                .pipe(operators.takeUntil(this._destroyed))
                .subscribe(function () { return _this._detach(); });
            return this._overlayRef;
        };
        /** Detaches the currently-attached tooltip. */
        _MatTooltipBase.prototype._detach = function () {
            if (this._overlayRef && this._overlayRef.hasAttached()) {
                this._overlayRef.detach();
            }
            this._tooltipInstance = null;
        };
        /** Updates the position of the current tooltip. */
        _MatTooltipBase.prototype._updatePosition = function (overlayRef) {
            var position = overlayRef.getConfig().positionStrategy;
            var origin = this._getOrigin();
            var overlay = this._getOverlayPosition();
            position.withPositions([
                this._addOffset(Object.assign(Object.assign({}, origin.main), overlay.main)),
                this._addOffset(Object.assign(Object.assign({}, origin.fallback), overlay.fallback))
            ]);
        };
        /** Adds the configured offset to a position. Used as a hook for child classes. */
        _MatTooltipBase.prototype._addOffset = function (position) {
            return position;
        };
        /**
         * Returns the origin position and a fallback position based on the user's position preference.
         * The fallback position is the inverse of the origin (e.g. `'below' -> 'above'`).
         */
        _MatTooltipBase.prototype._getOrigin = function () {
            var isLtr = !this._dir || this._dir.value == 'ltr';
            var position = this.position;
            var originPosition;
            if (position == 'above' || position == 'below') {
                originPosition = { originX: 'center', originY: position == 'above' ? 'top' : 'bottom' };
            }
            else if (position == 'before' ||
                (position == 'left' && isLtr) ||
                (position == 'right' && !isLtr)) {
                originPosition = { originX: 'start', originY: 'center' };
            }
            else if (position == 'after' ||
                (position == 'right' && isLtr) ||
                (position == 'left' && !isLtr)) {
                originPosition = { originX: 'end', originY: 'center' };
            }
            else if (typeof ngDevMode === 'undefined' || ngDevMode) {
                throw getMatTooltipInvalidPositionError(position);
            }
            var _b = this._invertPosition(originPosition.originX, originPosition.originY), x = _b.x, y = _b.y;
            return {
                main: originPosition,
                fallback: { originX: x, originY: y }
            };
        };
        /** Returns the overlay position and a fallback position based on the user's preference */
        _MatTooltipBase.prototype._getOverlayPosition = function () {
            var isLtr = !this._dir || this._dir.value == 'ltr';
            var position = this.position;
            var overlayPosition;
            if (position == 'above') {
                overlayPosition = { overlayX: 'center', overlayY: 'bottom' };
            }
            else if (position == 'below') {
                overlayPosition = { overlayX: 'center', overlayY: 'top' };
            }
            else if (position == 'before' ||
                (position == 'left' && isLtr) ||
                (position == 'right' && !isLtr)) {
                overlayPosition = { overlayX: 'end', overlayY: 'center' };
            }
            else if (position == 'after' ||
                (position == 'right' && isLtr) ||
                (position == 'left' && !isLtr)) {
                overlayPosition = { overlayX: 'start', overlayY: 'center' };
            }
            else if (typeof ngDevMode === 'undefined' || ngDevMode) {
                throw getMatTooltipInvalidPositionError(position);
            }
            var _b = this._invertPosition(overlayPosition.overlayX, overlayPosition.overlayY), x = _b.x, y = _b.y;
            return {
                main: overlayPosition,
                fallback: { overlayX: x, overlayY: y }
            };
        };
        /** Updates the tooltip message and repositions the overlay according to the new message length */
        _MatTooltipBase.prototype._updateTooltipMessage = function () {
            var _this = this;
            // Must wait for the message to be painted to the tooltip so that the overlay can properly
            // calculate the correct positioning based on the size of the text.
            if (this._tooltipInstance) {
                this._tooltipInstance.message = this.message;
                this._tooltipInstance._markForCheck();
                this._ngZone.onMicrotaskEmpty.pipe(operators.take(1), operators.takeUntil(this._destroyed)).subscribe(function () {
                    if (_this._tooltipInstance) {
                        _this._overlayRef.updatePosition();
                    }
                });
            }
        };
        /** Updates the tooltip class */
        _MatTooltipBase.prototype._setTooltipClass = function (tooltipClass) {
            if (this._tooltipInstance) {
                this._tooltipInstance.tooltipClass = tooltipClass;
                this._tooltipInstance._markForCheck();
            }
        };
        /** Inverts an overlay position. */
        _MatTooltipBase.prototype._invertPosition = function (x, y) {
            if (this.position === 'above' || this.position === 'below') {
                if (y === 'top') {
                    y = 'bottom';
                }
                else if (y === 'bottom') {
                    y = 'top';
                }
            }
            else {
                if (x === 'end') {
                    x = 'start';
                }
                else if (x === 'start') {
                    x = 'end';
                }
            }
            return { x: x, y: y };
        };
        /** Updates the class on the overlay panel based on the current position of the tooltip. */
        _MatTooltipBase.prototype._updateCurrentPositionClass = function (connectionPair) {
            var overlayY = connectionPair.overlayY, originX = connectionPair.originX, originY = connectionPair.originY;
            var newPosition;
            // If the overlay is in the middle along the Y axis,
            // it means that it's either before or after.
            if (overlayY === 'center') {
                // Note that since this information is used for styling, we want to
                // resolve `start` and `end` to their real values, otherwise consumers
                // would have to remember to do it themselves on each consumption.
                if (this._dir && this._dir.value === 'rtl') {
                    newPosition = originX === 'end' ? 'left' : 'right';
                }
                else {
                    newPosition = originX === 'start' ? 'left' : 'right';
                }
            }
            else {
                newPosition = overlayY === 'bottom' && originY === 'top' ? 'above' : 'below';
            }
            if (newPosition !== this._currentPosition) {
                var overlayRef = this._overlayRef;
                if (overlayRef) {
                    var classPrefix = this._cssClassPrefix + "-" + PANEL_CLASS + "-";
                    overlayRef.removePanelClass(classPrefix + this._currentPosition);
                    overlayRef.addPanelClass(classPrefix + newPosition);
                }
                this._currentPosition = newPosition;
            }
        };
        /** Binds the pointer events to the tooltip trigger. */
        _MatTooltipBase.prototype._setupPointerEnterEventsIfNeeded = function () {
            var _this = this;
            // Optimization: Defer hooking up events if there's no message or the tooltip is disabled.
            if (this._disabled || !this.message || !this._viewInitialized ||
                this._passiveListeners.length) {
                return;
            }
            // The mouse events shouldn't be bound on mobile devices, because they can prevent the
            // first tap from firing its click event or can cause the tooltip to open for clicks.
            if (this._platformSupportsMouseEvents()) {
                this._passiveListeners
                    .push(['mouseenter', function () {
                        _this._setupPointerExitEventsIfNeeded();
                        _this.show();
                    }]);
            }
            else if (this.touchGestures !== 'off') {
                this._disableNativeGesturesIfNecessary();
                this._passiveListeners
                    .push(['touchstart', function () {
                        // Note that it's important that we don't `preventDefault` here,
                        // because it can prevent click events from firing on the element.
                        _this._setupPointerExitEventsIfNeeded();
                        clearTimeout(_this._touchstartTimeout);
                        _this._touchstartTimeout = setTimeout(function () { return _this.show(); }, LONGPRESS_DELAY);
                    }]);
            }
            this._addListeners(this._passiveListeners);
        };
        _MatTooltipBase.prototype._setupPointerExitEventsIfNeeded = function () {
            var _b;
            var _this = this;
            if (this._pointerExitEventsInitialized) {
                return;
            }
            this._pointerExitEventsInitialized = true;
            var exitListeners = [];
            if (this._platformSupportsMouseEvents()) {
                exitListeners.push(['mouseleave', function () { return _this.hide(); }], ['wheel', function (event) { return _this._wheelListener(event); }]);
            }
            else if (this.touchGestures !== 'off') {
                this._disableNativeGesturesIfNecessary();
                var touchendListener = function () {
                    clearTimeout(_this._touchstartTimeout);
                    _this.hide(_this._defaultOptions.touchendHideDelay);
                };
                exitListeners.push(['touchend', touchendListener], ['touchcancel', touchendListener]);
            }
            this._addListeners(exitListeners);
            (_b = this._passiveListeners).push.apply(_b, __spreadArray([], __read(exitListeners)));
        };
        _MatTooltipBase.prototype._addListeners = function (listeners) {
            var _this = this;
            listeners.forEach(function (_b) {
                var _c = __read(_b, 2), event = _c[0], listener = _c[1];
                _this._elementRef.nativeElement.addEventListener(event, listener, passiveListenerOptions);
            });
        };
        _MatTooltipBase.prototype._platformSupportsMouseEvents = function () {
            return !this._platform.IOS && !this._platform.ANDROID;
        };
        /** Listener for the `wheel` event on the element. */
        _MatTooltipBase.prototype._wheelListener = function (event) {
            if (this._isTooltipVisible()) {
                var elementUnderPointer = this._document.elementFromPoint(event.clientX, event.clientY);
                var element = this._elementRef.nativeElement;
                // On non-touch devices we depend on the `mouseleave` event to close the tooltip, but it
                // won't fire if the user scrolls away using the wheel without moving their cursor. We
                // work around it by finding the element under the user's cursor and closing the tooltip
                // if it's not the trigger.
                if (elementUnderPointer !== element && !element.contains(elementUnderPointer)) {
                    this.hide();
                }
            }
        };
        /** Disables the native browser gestures, based on how the tooltip has been configured. */
        _MatTooltipBase.prototype._disableNativeGesturesIfNecessary = function () {
            var gestures = this.touchGestures;
            if (gestures !== 'off') {
                var element = this._elementRef.nativeElement;
                var style = element.style;
                // If gestures are set to `auto`, we don't disable text selection on inputs and
                // textareas, because it prevents the user from typing into them on iOS Safari.
                if (gestures === 'on' || (element.nodeName !== 'INPUT' && element.nodeName !== 'TEXTAREA')) {
                    style.userSelect = style.msUserSelect = style.webkitUserSelect =
                        style.MozUserSelect = 'none';
                }
                // If we have `auto` gestures and the element uses native HTML dragging,
                // we don't set `-webkit-user-drag` because it prevents the native behavior.
                if (gestures === 'on' || !element.draggable) {
                    style.webkitUserDrag = 'none';
                }
                style.touchAction = 'none';
                style.webkitTapHighlightColor = 'transparent';
            }
        };
        return _MatTooltipBase;
    }());
    _MatTooltipBase.decorators = [
        { type: core.Directive }
    ];
    _MatTooltipBase.ctorParameters = function () { return [
        { type: overlay.Overlay },
        { type: core.ElementRef },
        { type: scrolling.ScrollDispatcher },
        { type: core.ViewContainerRef },
        { type: core.NgZone },
        { type: platform.Platform },
        { type: a11y.AriaDescriber },
        { type: a11y.FocusMonitor },
        { type: undefined },
        { type: bidi.Directionality },
        { type: undefined },
        { type: undefined, decorators: [{ type: core.Inject, args: [common.DOCUMENT,] }] }
    ]; };
    _MatTooltipBase.propDecorators = {
        position: [{ type: core.Input, args: ['matTooltipPosition',] }],
        disabled: [{ type: core.Input, args: ['matTooltipDisabled',] }],
        showDelay: [{ type: core.Input, args: ['matTooltipShowDelay',] }],
        hideDelay: [{ type: core.Input, args: ['matTooltipHideDelay',] }],
        touchGestures: [{ type: core.Input, args: ['matTooltipTouchGestures',] }],
        message: [{ type: core.Input, args: ['matTooltip',] }],
        tooltipClass: [{ type: core.Input, args: ['matTooltipClass',] }]
    };
    /**
     * Directive that attaches a material design tooltip to the host element. Animates the showing and
     * hiding of a tooltip provided position (defaults to below the element).
     *
     * https://material.io/design/components/tooltips.html
     */
    var MatTooltip = /** @class */ (function (_super) {
        __extends(MatTooltip, _super);
        function MatTooltip(overlay, elementRef, scrollDispatcher, viewContainerRef, ngZone, platform, ariaDescriber, focusMonitor, scrollStrategy, dir, defaultOptions, _document) {
            var _this = _super.call(this, overlay, elementRef, scrollDispatcher, viewContainerRef, ngZone, platform, ariaDescriber, focusMonitor, scrollStrategy, dir, defaultOptions, _document) || this;
            _this._tooltipComponent = TooltipComponent;
            return _this;
        }
        return MatTooltip;
    }(_MatTooltipBase));
    MatTooltip.decorators = [
        { type: core.Directive, args: [{
                    selector: '[matTooltip]',
                    exportAs: 'matTooltip',
                    host: {
                        'class': 'mat-tooltip-trigger'
                    }
                },] }
    ];
    MatTooltip.ctorParameters = function () { return [
        { type: overlay.Overlay },
        { type: core.ElementRef },
        { type: scrolling.ScrollDispatcher },
        { type: core.ViewContainerRef },
        { type: core.NgZone },
        { type: platform.Platform },
        { type: a11y.AriaDescriber },
        { type: a11y.FocusMonitor },
        { type: undefined, decorators: [{ type: core.Inject, args: [MAT_TOOLTIP_SCROLL_STRATEGY,] }] },
        { type: bidi.Directionality, decorators: [{ type: core.Optional }] },
        { type: undefined, decorators: [{ type: core.Optional }, { type: core.Inject, args: [MAT_TOOLTIP_DEFAULT_OPTIONS,] }] },
        { type: undefined, decorators: [{ type: core.Inject, args: [common.DOCUMENT,] }] }
    ]; };
    var _TooltipComponentBase = /** @class */ (function () {
        function _TooltipComponentBase(_changeDetectorRef) {
            this._changeDetectorRef = _changeDetectorRef;
            /** Property watched by the animation framework to show or hide the tooltip */
            this._visibility = 'initial';
            /** Whether interactions on the page should close the tooltip */
            this._closeOnInteraction = false;
            /** Subject for notifying that the tooltip has been hidden from the view */
            this._onHide = new rxjs.Subject();
        }
        /**
         * Shows the tooltip with an animation originating from the provided origin
         * @param delay Amount of milliseconds to the delay showing the tooltip.
         */
        _TooltipComponentBase.prototype.show = function (delay) {
            var _this = this;
            // Cancel the delayed hide if it is scheduled
            clearTimeout(this._hideTimeoutId);
            // Body interactions should cancel the tooltip if there is a delay in showing.
            this._closeOnInteraction = true;
            this._showTimeoutId = setTimeout(function () {
                _this._visibility = 'visible';
                _this._showTimeoutId = undefined;
                // Mark for check so if any parent component has set the
                // ChangeDetectionStrategy to OnPush it will be checked anyways
                _this._markForCheck();
            }, delay);
        };
        /**
         * Begins the animation to hide the tooltip after the provided delay in ms.
         * @param delay Amount of milliseconds to delay showing the tooltip.
         */
        _TooltipComponentBase.prototype.hide = function (delay) {
            var _this = this;
            // Cancel the delayed show if it is scheduled
            clearTimeout(this._showTimeoutId);
            this._hideTimeoutId = setTimeout(function () {
                _this._visibility = 'hidden';
                _this._hideTimeoutId = undefined;
                // Mark for check so if any parent component has set the
                // ChangeDetectionStrategy to OnPush it will be checked anyways
                _this._markForCheck();
            }, delay);
        };
        /** Returns an observable that notifies when the tooltip has been hidden from view. */
        _TooltipComponentBase.prototype.afterHidden = function () {
            return this._onHide;
        };
        /** Whether the tooltip is being displayed. */
        _TooltipComponentBase.prototype.isVisible = function () {
            return this._visibility === 'visible';
        };
        _TooltipComponentBase.prototype.ngOnDestroy = function () {
            clearTimeout(this._showTimeoutId);
            clearTimeout(this._hideTimeoutId);
            this._onHide.complete();
        };
        _TooltipComponentBase.prototype._animationStart = function () {
            this._closeOnInteraction = false;
        };
        _TooltipComponentBase.prototype._animationDone = function (event) {
            var toState = event.toState;
            if (toState === 'hidden' && !this.isVisible()) {
                this._onHide.next();
            }
            if (toState === 'visible' || toState === 'hidden') {
                this._closeOnInteraction = true;
            }
        };
        /**
         * Interactions on the HTML body should close the tooltip immediately as defined in the
         * material design spec.
         * https://material.io/design/components/tooltips.html#behavior
         */
        _TooltipComponentBase.prototype._handleBodyInteraction = function () {
            if (this._closeOnInteraction) {
                this.hide(0);
            }
        };
        /**
         * Marks that the tooltip needs to be checked in the next change detection run.
         * Mainly used for rendering the initial text before positioning a tooltip, which
         * can be problematic in components with OnPush change detection.
         */
        _TooltipComponentBase.prototype._markForCheck = function () {
            this._changeDetectorRef.markForCheck();
        };
        return _TooltipComponentBase;
    }());
    _TooltipComponentBase.decorators = [
        { type: core.Directive }
    ];
    _TooltipComponentBase.ctorParameters = function () { return [
        { type: core.ChangeDetectorRef }
    ]; };
    /**
     * Internal component that wraps the tooltip's content.
     * @docs-private
     */
    var TooltipComponent = /** @class */ (function (_super) {
        __extends(TooltipComponent, _super);
        function TooltipComponent(changeDetectorRef, _breakpointObserver) {
            var _this = _super.call(this, changeDetectorRef) || this;
            _this._breakpointObserver = _breakpointObserver;
            /** Stream that emits whether the user has a handset-sized display.  */
            _this._isHandset = _this._breakpointObserver.observe(layout.Breakpoints.Handset);
            return _this;
        }
        return TooltipComponent;
    }(_TooltipComponentBase));
    TooltipComponent.decorators = [
        { type: core.Component, args: [{
                    selector: 'mat-tooltip-component',
                    template: "<div class=\"mat-tooltip\"\n     [ngClass]=\"tooltipClass\"\n     [class.mat-tooltip-handset]=\"(_isHandset | async)?.matches\"\n     [@state]=\"_visibility\"\n     (@state.start)=\"_animationStart()\"\n     (@state.done)=\"_animationDone($event)\">{{message}}</div>\n",
                    encapsulation: core.ViewEncapsulation.None,
                    changeDetection: core.ChangeDetectionStrategy.OnPush,
                    animations: [matTooltipAnimations.tooltipState],
                    host: {
                        // Forces the element to have a layout in IE and Edge. This fixes issues where the element
                        // won't be rendered if the animations are disabled or there is no web animations polyfill.
                        '[style.zoom]': '_visibility === "visible" ? 1 : null',
                        '(body:click)': 'this._handleBodyInteraction()',
                        '(body:auxclick)': 'this._handleBodyInteraction()',
                        'aria-hidden': 'true',
                    },
                    styles: [".mat-tooltip-panel{pointer-events:none !important}.mat-tooltip{color:#fff;border-radius:4px;margin:14px;max-width:250px;padding-left:8px;padding-right:8px;overflow:hidden;text-overflow:ellipsis}.cdk-high-contrast-active .mat-tooltip{outline:solid 1px}.mat-tooltip-handset{margin:24px;padding-left:16px;padding-right:16px}\n"]
                },] }
    ];
    TooltipComponent.ctorParameters = function () { return [
        { type: core.ChangeDetectorRef },
        { type: layout.BreakpointObserver }
    ]; };

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var MatTooltipModule = /** @class */ (function () {
        function MatTooltipModule() {
        }
        return MatTooltipModule;
    }());
    MatTooltipModule.decorators = [
        { type: core.NgModule, args: [{
                    imports: [
                        a11y.A11yModule,
                        common.CommonModule,
                        overlay.OverlayModule,
                        core$1.MatCommonModule,
                    ],
                    exports: [MatTooltip, TooltipComponent, core$1.MatCommonModule, scrolling.CdkScrollableModule],
                    declarations: [MatTooltip, TooltipComponent],
                    entryComponents: [TooltipComponent],
                    providers: [MAT_TOOLTIP_SCROLL_STRATEGY_FACTORY_PROVIDER]
                },] }
    ];

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

    exports.MAT_TOOLTIP_DEFAULT_OPTIONS = MAT_TOOLTIP_DEFAULT_OPTIONS;
    exports.MAT_TOOLTIP_DEFAULT_OPTIONS_FACTORY = MAT_TOOLTIP_DEFAULT_OPTIONS_FACTORY;
    exports.MAT_TOOLTIP_SCROLL_STRATEGY = MAT_TOOLTIP_SCROLL_STRATEGY;
    exports.MAT_TOOLTIP_SCROLL_STRATEGY_FACTORY = MAT_TOOLTIP_SCROLL_STRATEGY_FACTORY;
    exports.MAT_TOOLTIP_SCROLL_STRATEGY_FACTORY_PROVIDER = MAT_TOOLTIP_SCROLL_STRATEGY_FACTORY_PROVIDER;
    exports.MatTooltip = MatTooltip;
    exports.MatTooltipModule = MatTooltipModule;
    exports.SCROLL_THROTTLE_MS = SCROLL_THROTTLE_MS;
    exports.TOOLTIP_PANEL_CLASS = TOOLTIP_PANEL_CLASS;
    exports.TooltipComponent = TooltipComponent;
    exports._MatTooltipBase = _MatTooltipBase;
    exports._TooltipComponentBase = _TooltipComponentBase;
    exports.getMatTooltipInvalidPositionError = getMatTooltipInvalidPositionError;
    exports.matTooltipAnimations = matTooltipAnimations;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=material-tooltip.umd.js.map
