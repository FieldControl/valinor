(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/cdk/platform'), require('@angular/cdk/scrolling'), require('@angular/common'), require('@angular/core'), require('@angular/material/core'), require('@angular/cdk/a11y'), require('@angular/cdk/bidi'), require('@angular/cdk/coercion'), require('@angular/cdk/keycodes'), require('rxjs'), require('rxjs/operators'), require('@angular/animations'), require('@angular/platform-browser/animations')) :
    typeof define === 'function' && define.amd ? define('@angular/material/sidenav', ['exports', '@angular/cdk/platform', '@angular/cdk/scrolling', '@angular/common', '@angular/core', '@angular/material/core', '@angular/cdk/a11y', '@angular/cdk/bidi', '@angular/cdk/coercion', '@angular/cdk/keycodes', 'rxjs', 'rxjs/operators', '@angular/animations', '@angular/platform-browser/animations'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.ng = global.ng || {}, global.ng.material = global.ng.material || {}, global.ng.material.sidenav = {}), global.ng.cdk.platform, global.ng.cdk.scrolling, global.ng.common, global.ng.core, global.ng.material.core, global.ng.cdk.a11y, global.ng.cdk.bidi, global.ng.cdk.coercion, global.ng.cdk.keycodes, global.rxjs, global.rxjs.operators, global.ng.animations, global.ng.platformBrowser.animations));
}(this, (function (exports, platform, scrolling, common, core, core$1, a11y, bidi, coercion, keycodes, rxjs, operators, animations, animations$1) { 'use strict';

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
     * Animations used by the Material drawers.
     * @docs-private
     */
    var matDrawerAnimations = {
        /** Animation that slides a drawer in and out. */
        transformDrawer: animations.trigger('transform', [
            // We remove the `transform` here completely, rather than setting it to zero, because:
            // 1. Having a transform can cause elements with ripples or an animated
            //    transform to shift around in Chrome with an RTL layout (see #10023).
            // 2. 3d transforms causes text to appear blurry on IE and Edge.
            animations.state('open, open-instant', animations.style({
                'transform': 'none',
                'visibility': 'visible',
            })),
            animations.state('void', animations.style({
                // Avoids the shadow showing up when closed in SSR.
                'box-shadow': 'none',
                'visibility': 'hidden',
            })),
            animations.transition('void => open-instant', animations.animate('0ms')),
            animations.transition('void <=> open, open-instant => void', animations.animate('400ms cubic-bezier(0.25, 0.8, 0.25, 1)'))
        ])
    };

    /**
     * Throws an exception when two MatDrawer are matching the same position.
     * @docs-private
     */
    function throwMatDuplicatedDrawerError(position) {
        throw Error("A drawer was already declared for 'position=\"" + position + "\"'");
    }
    /** Configures whether drawers should use auto sizing by default. */
    var MAT_DRAWER_DEFAULT_AUTOSIZE = new core.InjectionToken('MAT_DRAWER_DEFAULT_AUTOSIZE', {
        providedIn: 'root',
        factory: MAT_DRAWER_DEFAULT_AUTOSIZE_FACTORY,
    });
    /**
     * Used to provide a drawer container to a drawer while avoiding circular references.
     * @docs-private
     */
    var MAT_DRAWER_CONTAINER = new core.InjectionToken('MAT_DRAWER_CONTAINER');
    /** @docs-private */
    function MAT_DRAWER_DEFAULT_AUTOSIZE_FACTORY() {
        return false;
    }
    var MatDrawerContent = /** @class */ (function (_super) {
        __extends(MatDrawerContent, _super);
        function MatDrawerContent(_changeDetectorRef, _container, elementRef, scrollDispatcher, ngZone) {
            var _this = _super.call(this, elementRef, scrollDispatcher, ngZone) || this;
            _this._changeDetectorRef = _changeDetectorRef;
            _this._container = _container;
            return _this;
        }
        MatDrawerContent.prototype.ngAfterContentInit = function () {
            var _this = this;
            this._container._contentMarginChanges.subscribe(function () {
                _this._changeDetectorRef.markForCheck();
            });
        };
        return MatDrawerContent;
    }(scrolling.CdkScrollable));
    MatDrawerContent.decorators = [
        { type: core.Component, args: [{
                    selector: 'mat-drawer-content',
                    template: '<ng-content></ng-content>',
                    host: {
                        'class': 'mat-drawer-content',
                        '[style.margin-left.px]': '_container._contentMargins.left',
                        '[style.margin-right.px]': '_container._contentMargins.right',
                    },
                    changeDetection: core.ChangeDetectionStrategy.OnPush,
                    encapsulation: core.ViewEncapsulation.None
                },] }
    ];
    MatDrawerContent.ctorParameters = function () { return [
        { type: core.ChangeDetectorRef },
        { type: MatDrawerContainer, decorators: [{ type: core.Inject, args: [core.forwardRef(function () { return MatDrawerContainer; }),] }] },
        { type: core.ElementRef },
        { type: scrolling.ScrollDispatcher },
        { type: core.NgZone }
    ]; };
    /**
     * This component corresponds to a drawer that can be opened on the drawer container.
     */
    var MatDrawer = /** @class */ (function () {
        function MatDrawer(_elementRef, _focusTrapFactory, _focusMonitor, _platform, _ngZone, _doc, _container) {
            var _this = this;
            this._elementRef = _elementRef;
            this._focusTrapFactory = _focusTrapFactory;
            this._focusMonitor = _focusMonitor;
            this._platform = _platform;
            this._ngZone = _ngZone;
            this._doc = _doc;
            this._container = _container;
            this._elementFocusedBeforeDrawerWasOpened = null;
            /** Whether the drawer is initialized. Used for disabling the initial animation. */
            this._enableAnimations = false;
            this._position = 'start';
            this._mode = 'over';
            this._disableClose = false;
            this._opened = false;
            /** Emits whenever the drawer has started animating. */
            this._animationStarted = new rxjs.Subject();
            /** Emits whenever the drawer is done animating. */
            this._animationEnd = new rxjs.Subject();
            /** Current state of the sidenav animation. */
            // @HostBinding is used in the class as it is expected to be extended.  Since @Component decorator
            // metadata is not inherited by child classes, instead the host binding data is defined in a way
            // that can be inherited.
            // tslint:disable-next-line:no-host-decorator-in-concrete
            this._animationState = 'void';
            /** Event emitted when the drawer open state is changed. */
            this.openedChange =
                // Note this has to be async in order to avoid some issues with two-bindings (see #8872).
                new core.EventEmitter(/* isAsync */ true);
            /** Event emitted when the drawer has been opened. */
            this._openedStream = this.openedChange.pipe(operators.filter(function (o) { return o; }), operators.map(function () { }));
            /** Event emitted when the drawer has started opening. */
            this.openedStart = this._animationStarted.pipe(operators.filter(function (e) { return e.fromState !== e.toState && e.toState.indexOf('open') === 0; }), operators.mapTo(undefined));
            /** Event emitted when the drawer has been closed. */
            this._closedStream = this.openedChange.pipe(operators.filter(function (o) { return !o; }), operators.map(function () { }));
            /** Event emitted when the drawer has started closing. */
            this.closedStart = this._animationStarted.pipe(operators.filter(function (e) { return e.fromState !== e.toState && e.toState === 'void'; }), operators.mapTo(undefined));
            /** Emits when the component is destroyed. */
            this._destroyed = new rxjs.Subject();
            /** Event emitted when the drawer's position changes. */
            // tslint:disable-next-line:no-output-on-prefix
            this.onPositionChanged = new core.EventEmitter();
            /**
             * An observable that emits when the drawer mode changes. This is used by the drawer container to
             * to know when to when the mode changes so it can adapt the margins on the content.
             */
            this._modeChanged = new rxjs.Subject();
            this.openedChange.subscribe(function (opened) {
                if (opened) {
                    if (_this._doc) {
                        _this._elementFocusedBeforeDrawerWasOpened = _this._doc.activeElement;
                    }
                    _this._takeFocus();
                }
                else if (_this._isFocusWithinDrawer()) {
                    _this._restoreFocus();
                }
            });
            /**
             * Listen to `keydown` events outside the zone so that change detection is not run every
             * time a key is pressed. Instead we re-enter the zone only if the `ESC` key is pressed
             * and we don't have close disabled.
             */
            this._ngZone.runOutsideAngular(function () {
                rxjs.fromEvent(_this._elementRef.nativeElement, 'keydown').pipe(operators.filter(function (event) {
                    return event.keyCode === keycodes.ESCAPE && !_this.disableClose && !keycodes.hasModifierKey(event);
                }), operators.takeUntil(_this._destroyed)).subscribe(function (event) { return _this._ngZone.run(function () {
                    _this.close();
                    event.stopPropagation();
                    event.preventDefault();
                }); });
            });
            // We need a Subject with distinctUntilChanged, because the `done` event
            // fires twice on some browsers. See https://github.com/angular/angular/issues/24084
            this._animationEnd.pipe(operators.distinctUntilChanged(function (x, y) {
                return x.fromState === y.fromState && x.toState === y.toState;
            })).subscribe(function (event) {
                var fromState = event.fromState, toState = event.toState;
                if ((toState.indexOf('open') === 0 && fromState === 'void') ||
                    (toState === 'void' && fromState.indexOf('open') === 0)) {
                    _this.openedChange.emit(_this._opened);
                }
            });
        }
        Object.defineProperty(MatDrawer.prototype, "position", {
            /** The side that the drawer is attached to. */
            get: function () { return this._position; },
            set: function (value) {
                // Make sure we have a valid value.
                value = value === 'end' ? 'end' : 'start';
                if (value != this._position) {
                    this._position = value;
                    this.onPositionChanged.emit();
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatDrawer.prototype, "mode", {
            /** Mode of the drawer; one of 'over', 'push' or 'side'. */
            get: function () { return this._mode; },
            set: function (value) {
                this._mode = value;
                this._updateFocusTrapState();
                this._modeChanged.next();
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatDrawer.prototype, "disableClose", {
            /** Whether the drawer can be closed with the escape key or by clicking on the backdrop. */
            get: function () { return this._disableClose; },
            set: function (value) { this._disableClose = coercion.coerceBooleanProperty(value); },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatDrawer.prototype, "autoFocus", {
            /**
             * Whether the drawer should focus the first focusable element automatically when opened.
             * Defaults to false in when `mode` is set to `side`, otherwise defaults to `true`. If explicitly
             * enabled, focus will be moved into the sidenav in `side` mode as well.
             */
            get: function () {
                var value = this._autoFocus;
                // Note that usually we disable auto focusing in `side` mode, because we don't know how the
                // sidenav is being used, but in some cases it still makes sense to do it. If the consumer
                // explicitly enabled `autoFocus`, we take it as them always wanting to enable it.
                return value == null ? this.mode !== 'side' : value;
            },
            set: function (value) { this._autoFocus = coercion.coerceBooleanProperty(value); },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatDrawer.prototype, "opened", {
            /**
             * Whether the drawer is opened. We overload this because we trigger an event when it
             * starts or end.
             */
            get: function () { return this._opened; },
            set: function (value) { this.toggle(coercion.coerceBooleanProperty(value)); },
            enumerable: false,
            configurable: true
        });
        /**
         * Moves focus into the drawer. Note that this works even if
         * the focus trap is disabled in `side` mode.
         */
        MatDrawer.prototype._takeFocus = function () {
            var _this = this;
            if (!this.autoFocus || !this._focusTrap) {
                return;
            }
            this._focusTrap.focusInitialElementWhenReady().then(function (hasMovedFocus) {
                // If there were no focusable elements, focus the sidenav itself so the keyboard navigation
                // still works. We need to check that `focus` is a function due to Universal.
                if (!hasMovedFocus && typeof _this._elementRef.nativeElement.focus === 'function') {
                    _this._elementRef.nativeElement.focus();
                }
            });
        };
        /**
         * Restores focus to the element that was originally focused when the drawer opened.
         * If no element was focused at that time, the focus will be restored to the drawer.
         */
        MatDrawer.prototype._restoreFocus = function () {
            if (!this.autoFocus) {
                return;
            }
            // Note that we don't check via `instanceof HTMLElement` so that we can cover SVGs as well.
            if (this._elementFocusedBeforeDrawerWasOpened) {
                this._focusMonitor.focusVia(this._elementFocusedBeforeDrawerWasOpened, this._openedVia);
            }
            else {
                this._elementRef.nativeElement.blur();
            }
            this._elementFocusedBeforeDrawerWasOpened = null;
            this._openedVia = null;
        };
        /** Whether focus is currently within the drawer. */
        MatDrawer.prototype._isFocusWithinDrawer = function () {
            var _a;
            var activeEl = (_a = this._doc) === null || _a === void 0 ? void 0 : _a.activeElement;
            return !!activeEl && this._elementRef.nativeElement.contains(activeEl);
        };
        MatDrawer.prototype.ngAfterContentInit = function () {
            this._focusTrap = this._focusTrapFactory.create(this._elementRef.nativeElement);
            this._updateFocusTrapState();
        };
        MatDrawer.prototype.ngAfterContentChecked = function () {
            // Enable the animations after the lifecycle hooks have run, in order to avoid animating
            // drawers that are open by default. When we're on the server, we shouldn't enable the
            // animations, because we don't want the drawer to animate the first time the user sees
            // the page.
            if (this._platform.isBrowser) {
                this._enableAnimations = true;
            }
        };
        MatDrawer.prototype.ngOnDestroy = function () {
            if (this._focusTrap) {
                this._focusTrap.destroy();
            }
            this._animationStarted.complete();
            this._animationEnd.complete();
            this._modeChanged.complete();
            this._destroyed.next();
            this._destroyed.complete();
        };
        /**
         * Open the drawer.
         * @param openedVia Whether the drawer was opened by a key press, mouse click or programmatically.
         * Used for focus management after the sidenav is closed.
         */
        MatDrawer.prototype.open = function (openedVia) {
            return this.toggle(true, openedVia);
        };
        /** Close the drawer. */
        MatDrawer.prototype.close = function () {
            return this.toggle(false);
        };
        /** Closes the drawer with context that the backdrop was clicked. */
        MatDrawer.prototype._closeViaBackdropClick = function () {
            // If the drawer is closed upon a backdrop click, we always want to restore focus. We
            // don't need to check whether focus is currently in the drawer, as clicking on the
            // backdrop causes blurring of the active element.
            return this._setOpen(/* isOpen */ false, /* restoreFocus */ true);
        };
        /**
         * Toggle this drawer.
         * @param isOpen Whether the drawer should be open.
         * @param openedVia Whether the drawer was opened by a key press, mouse click or programmatically.
         * Used for focus management after the sidenav is closed.
         */
        MatDrawer.prototype.toggle = function (isOpen, openedVia) {
            if (isOpen === void 0) { isOpen = !this.opened; }
            // If the focus is currently inside the drawer content and we are closing the drawer,
            // restore the focus to the initially focused element (when the drawer opened).
            return this._setOpen(isOpen, /* restoreFocus */ !isOpen && this._isFocusWithinDrawer(), openedVia);
        };
        /**
         * Toggles the opened state of the drawer.
         * @param isOpen Whether the drawer should open or close.
         * @param restoreFocus Whether focus should be restored on close.
         * @param openedVia Focus origin that can be optionally set when opening a drawer. The
         *   origin will be used later when focus is restored on drawer close.
         */
        MatDrawer.prototype._setOpen = function (isOpen, restoreFocus, openedVia) {
            var _this = this;
            if (openedVia === void 0) { openedVia = 'program'; }
            this._opened = isOpen;
            if (isOpen) {
                this._animationState = this._enableAnimations ? 'open' : 'open-instant';
                this._openedVia = openedVia;
            }
            else {
                this._animationState = 'void';
                if (restoreFocus) {
                    this._restoreFocus();
                }
            }
            this._updateFocusTrapState();
            return new Promise(function (resolve) {
                _this.openedChange.pipe(operators.take(1)).subscribe(function (open) { return resolve(open ? 'open' : 'close'); });
            });
        };
        MatDrawer.prototype._getWidth = function () {
            return this._elementRef.nativeElement ? (this._elementRef.nativeElement.offsetWidth || 0) : 0;
        };
        /** Updates the enabled state of the focus trap. */
        MatDrawer.prototype._updateFocusTrapState = function () {
            if (this._focusTrap) {
                // The focus trap is only enabled when the drawer is open in any mode other than side.
                this._focusTrap.enabled = this.opened && this.mode !== 'side';
            }
        };
        // We have to use a `HostListener` here in order to support both Ivy and ViewEngine.
        // In Ivy the `host` bindings will be merged when this class is extended, whereas in
        // ViewEngine they're overwritten.
        // TODO(crisbeto): we move this back into `host` once Ivy is turned on by default.
        // tslint:disable-next-line:no-host-decorator-in-concrete
        MatDrawer.prototype._animationStartListener = function (event) {
            this._animationStarted.next(event);
        };
        // We have to use a `HostListener` here in order to support both Ivy and ViewEngine.
        // In Ivy the `host` bindings will be merged when this class is extended, whereas in
        // ViewEngine they're overwritten.
        // TODO(crisbeto): we move this back into `host` once Ivy is turned on by default.
        // tslint:disable-next-line:no-host-decorator-in-concrete
        MatDrawer.prototype._animationDoneListener = function (event) {
            this._animationEnd.next(event);
        };
        return MatDrawer;
    }());
    MatDrawer.decorators = [
        { type: core.Component, args: [{
                    selector: 'mat-drawer',
                    exportAs: 'matDrawer',
                    template: "<div class=\"mat-drawer-inner-container\" cdkScrollable>\r\n  <ng-content></ng-content>\r\n</div>\r\n",
                    animations: [matDrawerAnimations.transformDrawer],
                    host: {
                        'class': 'mat-drawer',
                        // must prevent the browser from aligning text based on value
                        '[attr.align]': 'null',
                        '[class.mat-drawer-end]': 'position === "end"',
                        '[class.mat-drawer-over]': 'mode === "over"',
                        '[class.mat-drawer-push]': 'mode === "push"',
                        '[class.mat-drawer-side]': 'mode === "side"',
                        '[class.mat-drawer-opened]': 'opened',
                        'tabIndex': '-1',
                    },
                    changeDetection: core.ChangeDetectionStrategy.OnPush,
                    encapsulation: core.ViewEncapsulation.None
                },] }
    ];
    MatDrawer.ctorParameters = function () { return [
        { type: core.ElementRef },
        { type: a11y.FocusTrapFactory },
        { type: a11y.FocusMonitor },
        { type: platform.Platform },
        { type: core.NgZone },
        { type: undefined, decorators: [{ type: core.Optional }, { type: core.Inject, args: [common.DOCUMENT,] }] },
        { type: MatDrawerContainer, decorators: [{ type: core.Optional }, { type: core.Inject, args: [MAT_DRAWER_CONTAINER,] }] }
    ]; };
    MatDrawer.propDecorators = {
        position: [{ type: core.Input }],
        mode: [{ type: core.Input }],
        disableClose: [{ type: core.Input }],
        autoFocus: [{ type: core.Input }],
        opened: [{ type: core.Input }],
        _animationState: [{ type: core.HostBinding, args: ['@transform',] }],
        openedChange: [{ type: core.Output }],
        _openedStream: [{ type: core.Output, args: ['opened',] }],
        openedStart: [{ type: core.Output }],
        _closedStream: [{ type: core.Output, args: ['closed',] }],
        closedStart: [{ type: core.Output }],
        onPositionChanged: [{ type: core.Output, args: ['positionChanged',] }],
        _animationStartListener: [{ type: core.HostListener, args: ['@transform.start', ['$event'],] }],
        _animationDoneListener: [{ type: core.HostListener, args: ['@transform.done', ['$event'],] }]
    };
    /**
     * `<mat-drawer-container>` component.
     *
     * This is the parent component to one or two `<mat-drawer>`s that validates the state internally
     * and coordinates the backdrop and content styling.
     */
    var MatDrawerContainer = /** @class */ (function () {
        function MatDrawerContainer(_dir, _element, _ngZone, _changeDetectorRef, viewportRuler, defaultAutosize, _animationMode) {
            var _this = this;
            if (defaultAutosize === void 0) { defaultAutosize = false; }
            this._dir = _dir;
            this._element = _element;
            this._ngZone = _ngZone;
            this._changeDetectorRef = _changeDetectorRef;
            this._animationMode = _animationMode;
            /** Drawers that belong to this container. */
            this._drawers = new core.QueryList();
            /** Event emitted when the drawer backdrop is clicked. */
            this.backdropClick = new core.EventEmitter();
            /** Emits when the component is destroyed. */
            this._destroyed = new rxjs.Subject();
            /** Emits on every ngDoCheck. Used for debouncing reflows. */
            this._doCheckSubject = new rxjs.Subject();
            /**
             * Margins to be applied to the content. These are used to push / shrink the drawer content when a
             * drawer is open. We use margin rather than transform even for push mode because transform breaks
             * fixed position elements inside of the transformed element.
             */
            this._contentMargins = { left: null, right: null };
            this._contentMarginChanges = new rxjs.Subject();
            // If a `Dir` directive exists up the tree, listen direction changes
            // and update the left/right properties to point to the proper start/end.
            if (_dir) {
                _dir.change.pipe(operators.takeUntil(this._destroyed)).subscribe(function () {
                    _this._validateDrawers();
                    _this.updateContentMargins();
                });
            }
            // Since the minimum width of the sidenav depends on the viewport width,
            // we need to recompute the margins if the viewport changes.
            viewportRuler.change()
                .pipe(operators.takeUntil(this._destroyed))
                .subscribe(function () { return _this.updateContentMargins(); });
            this._autosize = defaultAutosize;
        }
        Object.defineProperty(MatDrawerContainer.prototype, "start", {
            /** The drawer child with the `start` position. */
            get: function () { return this._start; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatDrawerContainer.prototype, "end", {
            /** The drawer child with the `end` position. */
            get: function () { return this._end; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatDrawerContainer.prototype, "autosize", {
            /**
             * Whether to automatically resize the container whenever
             * the size of any of its drawers changes.
             *
             * **Use at your own risk!** Enabling this option can cause layout thrashing by measuring
             * the drawers on every change detection cycle. Can be configured globally via the
             * `MAT_DRAWER_DEFAULT_AUTOSIZE` token.
             */
            get: function () { return this._autosize; },
            set: function (value) { this._autosize = coercion.coerceBooleanProperty(value); },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatDrawerContainer.prototype, "hasBackdrop", {
            /**
             * Whether the drawer container should have a backdrop while one of the sidenavs is open.
             * If explicitly set to `true`, the backdrop will be enabled for drawers in the `side`
             * mode as well.
             */
            get: function () {
                if (this._backdropOverride == null) {
                    return !this._start || this._start.mode !== 'side' || !this._end || this._end.mode !== 'side';
                }
                return this._backdropOverride;
            },
            set: function (value) {
                this._backdropOverride = value == null ? null : coercion.coerceBooleanProperty(value);
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatDrawerContainer.prototype, "scrollable", {
            /** Reference to the CdkScrollable instance that wraps the scrollable content. */
            get: function () {
                return this._userContent || this._content;
            },
            enumerable: false,
            configurable: true
        });
        MatDrawerContainer.prototype.ngAfterContentInit = function () {
            var _this = this;
            this._allDrawers.changes
                .pipe(operators.startWith(this._allDrawers), operators.takeUntil(this._destroyed))
                .subscribe(function (drawer) {
                _this._drawers.reset(drawer.filter(function (item) { return !item._container || item._container === _this; }));
                _this._drawers.notifyOnChanges();
            });
            this._drawers.changes.pipe(operators.startWith(null)).subscribe(function () {
                _this._validateDrawers();
                _this._drawers.forEach(function (drawer) {
                    _this._watchDrawerToggle(drawer);
                    _this._watchDrawerPosition(drawer);
                    _this._watchDrawerMode(drawer);
                });
                if (!_this._drawers.length ||
                    _this._isDrawerOpen(_this._start) ||
                    _this._isDrawerOpen(_this._end)) {
                    _this.updateContentMargins();
                }
                _this._changeDetectorRef.markForCheck();
            });
            // Avoid hitting the NgZone through the debounce timeout.
            this._ngZone.runOutsideAngular(function () {
                _this._doCheckSubject.pipe(operators.debounceTime(10), // Arbitrary debounce time, less than a frame at 60fps
                operators.takeUntil(_this._destroyed)).subscribe(function () { return _this.updateContentMargins(); });
            });
        };
        MatDrawerContainer.prototype.ngOnDestroy = function () {
            this._contentMarginChanges.complete();
            this._doCheckSubject.complete();
            this._drawers.destroy();
            this._destroyed.next();
            this._destroyed.complete();
        };
        /** Calls `open` of both start and end drawers */
        MatDrawerContainer.prototype.open = function () {
            this._drawers.forEach(function (drawer) { return drawer.open(); });
        };
        /** Calls `close` of both start and end drawers */
        MatDrawerContainer.prototype.close = function () {
            this._drawers.forEach(function (drawer) { return drawer.close(); });
        };
        /**
         * Recalculates and updates the inline styles for the content. Note that this should be used
         * sparingly, because it causes a reflow.
         */
        MatDrawerContainer.prototype.updateContentMargins = function () {
            var _this = this;
            // 1. For drawers in `over` mode, they don't affect the content.
            // 2. For drawers in `side` mode they should shrink the content. We do this by adding to the
            //    left margin (for left drawer) or right margin (for right the drawer).
            // 3. For drawers in `push` mode the should shift the content without resizing it. We do this by
            //    adding to the left or right margin and simultaneously subtracting the same amount of
            //    margin from the other side.
            var left = 0;
            var right = 0;
            if (this._left && this._left.opened) {
                if (this._left.mode == 'side') {
                    left += this._left._getWidth();
                }
                else if (this._left.mode == 'push') {
                    var width = this._left._getWidth();
                    left += width;
                    right -= width;
                }
            }
            if (this._right && this._right.opened) {
                if (this._right.mode == 'side') {
                    right += this._right._getWidth();
                }
                else if (this._right.mode == 'push') {
                    var width = this._right._getWidth();
                    right += width;
                    left -= width;
                }
            }
            // If either `right` or `left` is zero, don't set a style to the element. This
            // allows users to specify a custom size via CSS class in SSR scenarios where the
            // measured widths will always be zero. Note that we reset to `null` here, rather
            // than below, in order to ensure that the types in the `if` below are consistent.
            left = left || null;
            right = right || null;
            if (left !== this._contentMargins.left || right !== this._contentMargins.right) {
                this._contentMargins = { left: left, right: right };
                // Pull back into the NgZone since in some cases we could be outside. We need to be careful
                // to do it only when something changed, otherwise we can end up hitting the zone too often.
                this._ngZone.run(function () { return _this._contentMarginChanges.next(_this._contentMargins); });
            }
        };
        MatDrawerContainer.prototype.ngDoCheck = function () {
            var _this = this;
            // If users opted into autosizing, do a check every change detection cycle.
            if (this._autosize && this._isPushed()) {
                // Run outside the NgZone, otherwise the debouncer will throw us into an infinite loop.
                this._ngZone.runOutsideAngular(function () { return _this._doCheckSubject.next(); });
            }
        };
        /**
         * Subscribes to drawer events in order to set a class on the main container element when the
         * drawer is open and the backdrop is visible. This ensures any overflow on the container element
         * is properly hidden.
         */
        MatDrawerContainer.prototype._watchDrawerToggle = function (drawer) {
            var _this = this;
            drawer._animationStarted.pipe(operators.filter(function (event) { return event.fromState !== event.toState; }), operators.takeUntil(this._drawers.changes))
                .subscribe(function (event) {
                // Set the transition class on the container so that the animations occur. This should not
                // be set initially because animations should only be triggered via a change in state.
                if (event.toState !== 'open-instant' && _this._animationMode !== 'NoopAnimations') {
                    _this._element.nativeElement.classList.add('mat-drawer-transition');
                }
                _this.updateContentMargins();
                _this._changeDetectorRef.markForCheck();
            });
            if (drawer.mode !== 'side') {
                drawer.openedChange.pipe(operators.takeUntil(this._drawers.changes)).subscribe(function () { return _this._setContainerClass(drawer.opened); });
            }
        };
        /**
         * Subscribes to drawer onPositionChanged event in order to
         * re-validate drawers when the position changes.
         */
        MatDrawerContainer.prototype._watchDrawerPosition = function (drawer) {
            var _this = this;
            if (!drawer) {
                return;
            }
            // NOTE: We need to wait for the microtask queue to be empty before validating,
            // since both drawers may be swapping positions at the same time.
            drawer.onPositionChanged.pipe(operators.takeUntil(this._drawers.changes)).subscribe(function () {
                _this._ngZone.onMicrotaskEmpty.pipe(operators.take(1)).subscribe(function () {
                    _this._validateDrawers();
                });
            });
        };
        /** Subscribes to changes in drawer mode so we can run change detection. */
        MatDrawerContainer.prototype._watchDrawerMode = function (drawer) {
            var _this = this;
            if (drawer) {
                drawer._modeChanged.pipe(operators.takeUntil(rxjs.merge(this._drawers.changes, this._destroyed)))
                    .subscribe(function () {
                    _this.updateContentMargins();
                    _this._changeDetectorRef.markForCheck();
                });
            }
        };
        /** Toggles the 'mat-drawer-opened' class on the main 'mat-drawer-container' element. */
        MatDrawerContainer.prototype._setContainerClass = function (isAdd) {
            var classList = this._element.nativeElement.classList;
            var className = 'mat-drawer-container-has-open';
            if (isAdd) {
                classList.add(className);
            }
            else {
                classList.remove(className);
            }
        };
        /** Validate the state of the drawer children components. */
        MatDrawerContainer.prototype._validateDrawers = function () {
            var _this = this;
            this._start = this._end = null;
            // Ensure that we have at most one start and one end drawer.
            this._drawers.forEach(function (drawer) {
                if (drawer.position == 'end') {
                    if (_this._end != null && (typeof ngDevMode === 'undefined' || ngDevMode)) {
                        throwMatDuplicatedDrawerError('end');
                    }
                    _this._end = drawer;
                }
                else {
                    if (_this._start != null && (typeof ngDevMode === 'undefined' || ngDevMode)) {
                        throwMatDuplicatedDrawerError('start');
                    }
                    _this._start = drawer;
                }
            });
            this._right = this._left = null;
            // Detect if we're LTR or RTL.
            if (this._dir && this._dir.value === 'rtl') {
                this._left = this._end;
                this._right = this._start;
            }
            else {
                this._left = this._start;
                this._right = this._end;
            }
        };
        /** Whether the container is being pushed to the side by one of the drawers. */
        MatDrawerContainer.prototype._isPushed = function () {
            return (this._isDrawerOpen(this._start) && this._start.mode != 'over') ||
                (this._isDrawerOpen(this._end) && this._end.mode != 'over');
        };
        MatDrawerContainer.prototype._onBackdropClicked = function () {
            this.backdropClick.emit();
            this._closeModalDrawersViaBackdrop();
        };
        MatDrawerContainer.prototype._closeModalDrawersViaBackdrop = function () {
            var _this = this;
            // Close all open drawers where closing is not disabled and the mode is not `side`.
            [this._start, this._end]
                .filter(function (drawer) { return drawer && !drawer.disableClose && _this._canHaveBackdrop(drawer); })
                .forEach(function (drawer) { return drawer._closeViaBackdropClick(); });
        };
        MatDrawerContainer.prototype._isShowingBackdrop = function () {
            return (this._isDrawerOpen(this._start) && this._canHaveBackdrop(this._start)) ||
                (this._isDrawerOpen(this._end) && this._canHaveBackdrop(this._end));
        };
        MatDrawerContainer.prototype._canHaveBackdrop = function (drawer) {
            return drawer.mode !== 'side' || !!this._backdropOverride;
        };
        MatDrawerContainer.prototype._isDrawerOpen = function (drawer) {
            return drawer != null && drawer.opened;
        };
        return MatDrawerContainer;
    }());
    MatDrawerContainer.decorators = [
        { type: core.Component, args: [{
                    selector: 'mat-drawer-container',
                    exportAs: 'matDrawerContainer',
                    template: "<div class=\"mat-drawer-backdrop\" (click)=\"_onBackdropClicked()\" *ngIf=\"hasBackdrop\"\n     [class.mat-drawer-shown]=\"_isShowingBackdrop()\"></div>\n\n<ng-content select=\"mat-drawer\"></ng-content>\n\n<ng-content select=\"mat-drawer-content\">\n</ng-content>\n<mat-drawer-content *ngIf=\"!_content\">\n  <ng-content></ng-content>\n</mat-drawer-content>\n",
                    host: {
                        'class': 'mat-drawer-container',
                        '[class.mat-drawer-container-explicit-backdrop]': '_backdropOverride',
                    },
                    changeDetection: core.ChangeDetectionStrategy.OnPush,
                    encapsulation: core.ViewEncapsulation.None,
                    providers: [{
                            provide: MAT_DRAWER_CONTAINER,
                            useExisting: MatDrawerContainer
                        }],
                    styles: [".mat-drawer-container{position:relative;z-index:1;box-sizing:border-box;-webkit-overflow-scrolling:touch;display:block;overflow:hidden}.mat-drawer-container[fullscreen]{top:0;left:0;right:0;bottom:0;position:absolute}.mat-drawer-container[fullscreen].mat-drawer-container-has-open{overflow:hidden}.mat-drawer-container.mat-drawer-container-explicit-backdrop .mat-drawer-side{z-index:3}.mat-drawer-container.ng-animate-disabled .mat-drawer-backdrop,.mat-drawer-container.ng-animate-disabled .mat-drawer-content,.ng-animate-disabled .mat-drawer-container .mat-drawer-backdrop,.ng-animate-disabled .mat-drawer-container .mat-drawer-content{transition:none}.mat-drawer-backdrop{top:0;left:0;right:0;bottom:0;position:absolute;display:block;z-index:3;visibility:hidden}.mat-drawer-backdrop.mat-drawer-shown{visibility:visible}.mat-drawer-transition .mat-drawer-backdrop{transition-duration:400ms;transition-timing-function:cubic-bezier(0.25, 0.8, 0.25, 1);transition-property:background-color,visibility}.cdk-high-contrast-active .mat-drawer-backdrop{opacity:.5}.mat-drawer-content{position:relative;z-index:1;display:block;height:100%;overflow:auto}.mat-drawer-transition .mat-drawer-content{transition-duration:400ms;transition-timing-function:cubic-bezier(0.25, 0.8, 0.25, 1);transition-property:transform,margin-left,margin-right}.mat-drawer{position:relative;z-index:4;display:block;position:absolute;top:0;bottom:0;z-index:3;outline:0;box-sizing:border-box;overflow-y:auto;transform:translate3d(-100%, 0, 0)}.cdk-high-contrast-active .mat-drawer,.cdk-high-contrast-active [dir=rtl] .mat-drawer.mat-drawer-end{border-right:solid 1px currentColor}.cdk-high-contrast-active [dir=rtl] .mat-drawer,.cdk-high-contrast-active .mat-drawer.mat-drawer-end{border-left:solid 1px currentColor;border-right:none}.mat-drawer.mat-drawer-side{z-index:2}.mat-drawer.mat-drawer-end{right:0;transform:translate3d(100%, 0, 0)}[dir=rtl] .mat-drawer{transform:translate3d(100%, 0, 0)}[dir=rtl] .mat-drawer.mat-drawer-end{left:0;right:auto;transform:translate3d(-100%, 0, 0)}.mat-drawer-inner-container{width:100%;height:100%;overflow:auto;-webkit-overflow-scrolling:touch}.mat-sidenav-fixed{position:fixed}\n"]
                },] }
    ];
    MatDrawerContainer.ctorParameters = function () { return [
        { type: bidi.Directionality, decorators: [{ type: core.Optional }] },
        { type: core.ElementRef },
        { type: core.NgZone },
        { type: core.ChangeDetectorRef },
        { type: scrolling.ViewportRuler },
        { type: undefined, decorators: [{ type: core.Inject, args: [MAT_DRAWER_DEFAULT_AUTOSIZE,] }] },
        { type: String, decorators: [{ type: core.Optional }, { type: core.Inject, args: [animations$1.ANIMATION_MODULE_TYPE,] }] }
    ]; };
    MatDrawerContainer.propDecorators = {
        _allDrawers: [{ type: core.ContentChildren, args: [MatDrawer, {
                        // We need to use `descendants: true`, because Ivy will no longer match
                        // indirect descendants if it's left as false.
                        descendants: true
                    },] }],
        _content: [{ type: core.ContentChild, args: [MatDrawerContent,] }],
        _userContent: [{ type: core.ViewChild, args: [MatDrawerContent,] }],
        autosize: [{ type: core.Input }],
        hasBackdrop: [{ type: core.Input }],
        backdropClick: [{ type: core.Output }]
    };

    var MatSidenavContent = /** @class */ (function (_super) {
        __extends(MatSidenavContent, _super);
        function MatSidenavContent(changeDetectorRef, container, elementRef, scrollDispatcher, ngZone) {
            return _super.call(this, changeDetectorRef, container, elementRef, scrollDispatcher, ngZone) || this;
        }
        return MatSidenavContent;
    }(MatDrawerContent));
    MatSidenavContent.decorators = [
        { type: core.Component, args: [{
                    selector: 'mat-sidenav-content',
                    template: '<ng-content></ng-content>',
                    host: {
                        'class': 'mat-drawer-content mat-sidenav-content',
                        '[style.margin-left.px]': '_container._contentMargins.left',
                        '[style.margin-right.px]': '_container._contentMargins.right',
                    },
                    changeDetection: core.ChangeDetectionStrategy.OnPush,
                    encapsulation: core.ViewEncapsulation.None
                },] }
    ];
    MatSidenavContent.ctorParameters = function () { return [
        { type: core.ChangeDetectorRef },
        { type: MatSidenavContainer, decorators: [{ type: core.Inject, args: [core.forwardRef(function () { return MatSidenavContainer; }),] }] },
        { type: core.ElementRef },
        { type: scrolling.ScrollDispatcher },
        { type: core.NgZone }
    ]; };
    var MatSidenav = /** @class */ (function (_super) {
        __extends(MatSidenav, _super);
        function MatSidenav() {
            var _this = _super.apply(this, __spreadArray([], __read(arguments))) || this;
            _this._fixedInViewport = false;
            _this._fixedTopGap = 0;
            _this._fixedBottomGap = 0;
            return _this;
        }
        Object.defineProperty(MatSidenav.prototype, "fixedInViewport", {
            /** Whether the sidenav is fixed in the viewport. */
            get: function () { return this._fixedInViewport; },
            set: function (value) { this._fixedInViewport = coercion.coerceBooleanProperty(value); },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatSidenav.prototype, "fixedTopGap", {
            /**
             * The gap between the top of the sidenav and the top of the viewport when the sidenav is in fixed
             * mode.
             */
            get: function () { return this._fixedTopGap; },
            set: function (value) { this._fixedTopGap = coercion.coerceNumberProperty(value); },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatSidenav.prototype, "fixedBottomGap", {
            /**
             * The gap between the bottom of the sidenav and the bottom of the viewport when the sidenav is in
             * fixed mode.
             */
            get: function () { return this._fixedBottomGap; },
            set: function (value) { this._fixedBottomGap = coercion.coerceNumberProperty(value); },
            enumerable: false,
            configurable: true
        });
        return MatSidenav;
    }(MatDrawer));
    MatSidenav.decorators = [
        { type: core.Component, args: [{
                    selector: 'mat-sidenav',
                    exportAs: 'matSidenav',
                    template: "<div class=\"mat-drawer-inner-container\" cdkScrollable>\r\n  <ng-content></ng-content>\r\n</div>\r\n",
                    animations: [matDrawerAnimations.transformDrawer],
                    host: {
                        'class': 'mat-drawer mat-sidenav',
                        'tabIndex': '-1',
                        // must prevent the browser from aligning text based on value
                        '[attr.align]': 'null',
                        '[class.mat-drawer-end]': 'position === "end"',
                        '[class.mat-drawer-over]': 'mode === "over"',
                        '[class.mat-drawer-push]': 'mode === "push"',
                        '[class.mat-drawer-side]': 'mode === "side"',
                        '[class.mat-drawer-opened]': 'opened',
                        '[class.mat-sidenav-fixed]': 'fixedInViewport',
                        '[style.top.px]': 'fixedInViewport ? fixedTopGap : null',
                        '[style.bottom.px]': 'fixedInViewport ? fixedBottomGap : null',
                    },
                    changeDetection: core.ChangeDetectionStrategy.OnPush,
                    encapsulation: core.ViewEncapsulation.None
                },] }
    ];
    MatSidenav.propDecorators = {
        fixedInViewport: [{ type: core.Input }],
        fixedTopGap: [{ type: core.Input }],
        fixedBottomGap: [{ type: core.Input }]
    };
    var MatSidenavContainer = /** @class */ (function (_super) {
        __extends(MatSidenavContainer, _super);
        function MatSidenavContainer() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return MatSidenavContainer;
    }(MatDrawerContainer));
    MatSidenavContainer.decorators = [
        { type: core.Component, args: [{
                    selector: 'mat-sidenav-container',
                    exportAs: 'matSidenavContainer',
                    template: "<div class=\"mat-drawer-backdrop\" (click)=\"_onBackdropClicked()\" *ngIf=\"hasBackdrop\"\n     [class.mat-drawer-shown]=\"_isShowingBackdrop()\"></div>\n\n<ng-content select=\"mat-sidenav\"></ng-content>\n\n<ng-content select=\"mat-sidenav-content\">\n</ng-content>\n<mat-sidenav-content *ngIf=\"!_content\" cdkScrollable>\n  <ng-content></ng-content>\n</mat-sidenav-content>\n",
                    host: {
                        'class': 'mat-drawer-container mat-sidenav-container',
                        '[class.mat-drawer-container-explicit-backdrop]': '_backdropOverride',
                    },
                    changeDetection: core.ChangeDetectionStrategy.OnPush,
                    encapsulation: core.ViewEncapsulation.None,
                    providers: [{
                            provide: MAT_DRAWER_CONTAINER,
                            useExisting: MatSidenavContainer
                        }],
                    styles: [".mat-drawer-container{position:relative;z-index:1;box-sizing:border-box;-webkit-overflow-scrolling:touch;display:block;overflow:hidden}.mat-drawer-container[fullscreen]{top:0;left:0;right:0;bottom:0;position:absolute}.mat-drawer-container[fullscreen].mat-drawer-container-has-open{overflow:hidden}.mat-drawer-container.mat-drawer-container-explicit-backdrop .mat-drawer-side{z-index:3}.mat-drawer-container.ng-animate-disabled .mat-drawer-backdrop,.mat-drawer-container.ng-animate-disabled .mat-drawer-content,.ng-animate-disabled .mat-drawer-container .mat-drawer-backdrop,.ng-animate-disabled .mat-drawer-container .mat-drawer-content{transition:none}.mat-drawer-backdrop{top:0;left:0;right:0;bottom:0;position:absolute;display:block;z-index:3;visibility:hidden}.mat-drawer-backdrop.mat-drawer-shown{visibility:visible}.mat-drawer-transition .mat-drawer-backdrop{transition-duration:400ms;transition-timing-function:cubic-bezier(0.25, 0.8, 0.25, 1);transition-property:background-color,visibility}.cdk-high-contrast-active .mat-drawer-backdrop{opacity:.5}.mat-drawer-content{position:relative;z-index:1;display:block;height:100%;overflow:auto}.mat-drawer-transition .mat-drawer-content{transition-duration:400ms;transition-timing-function:cubic-bezier(0.25, 0.8, 0.25, 1);transition-property:transform,margin-left,margin-right}.mat-drawer{position:relative;z-index:4;display:block;position:absolute;top:0;bottom:0;z-index:3;outline:0;box-sizing:border-box;overflow-y:auto;transform:translate3d(-100%, 0, 0)}.cdk-high-contrast-active .mat-drawer,.cdk-high-contrast-active [dir=rtl] .mat-drawer.mat-drawer-end{border-right:solid 1px currentColor}.cdk-high-contrast-active [dir=rtl] .mat-drawer,.cdk-high-contrast-active .mat-drawer.mat-drawer-end{border-left:solid 1px currentColor;border-right:none}.mat-drawer.mat-drawer-side{z-index:2}.mat-drawer.mat-drawer-end{right:0;transform:translate3d(100%, 0, 0)}[dir=rtl] .mat-drawer{transform:translate3d(100%, 0, 0)}[dir=rtl] .mat-drawer.mat-drawer-end{left:0;right:auto;transform:translate3d(-100%, 0, 0)}.mat-drawer-inner-container{width:100%;height:100%;overflow:auto;-webkit-overflow-scrolling:touch}.mat-sidenav-fixed{position:fixed}\n"]
                },] }
    ];
    MatSidenavContainer.propDecorators = {
        _allDrawers: [{ type: core.ContentChildren, args: [MatSidenav, {
                        // We need to use `descendants: true`, because Ivy will no longer match
                        // indirect descendants if it's left as false.
                        descendants: true
                    },] }],
        _content: [{ type: core.ContentChild, args: [MatSidenavContent,] }]
    };

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var MatSidenavModule = /** @class */ (function () {
        function MatSidenavModule() {
        }
        return MatSidenavModule;
    }());
    MatSidenavModule.decorators = [
        { type: core.NgModule, args: [{
                    imports: [
                        common.CommonModule,
                        core$1.MatCommonModule,
                        platform.PlatformModule,
                        scrolling.CdkScrollableModule,
                    ],
                    exports: [
                        scrolling.CdkScrollableModule,
                        core$1.MatCommonModule,
                        MatDrawer,
                        MatDrawerContainer,
                        MatDrawerContent,
                        MatSidenav,
                        MatSidenavContainer,
                        MatSidenavContent,
                    ],
                    declarations: [
                        MatDrawer,
                        MatDrawerContainer,
                        MatDrawerContent,
                        MatSidenav,
                        MatSidenavContainer,
                        MatSidenavContent,
                    ],
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

    exports.MAT_DRAWER_DEFAULT_AUTOSIZE = MAT_DRAWER_DEFAULT_AUTOSIZE;
    exports.MAT_DRAWER_DEFAULT_AUTOSIZE_FACTORY = MAT_DRAWER_DEFAULT_AUTOSIZE_FACTORY;
    exports.MatDrawer = MatDrawer;
    exports.MatDrawerContainer = MatDrawerContainer;
    exports.MatDrawerContent = MatDrawerContent;
    exports.MatSidenav = MatSidenav;
    exports.MatSidenavContainer = MatSidenavContainer;
    exports.MatSidenavContent = MatSidenavContent;
    exports.MatSidenavModule = MatSidenavModule;
    exports.matDrawerAnimations = matDrawerAnimations;
    exports.throwMatDuplicatedDrawerError = throwMatDuplicatedDrawerError;
    exports.ɵangular_material_src_material_sidenav_sidenav_a = MAT_DRAWER_CONTAINER;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=material-sidenav.umd.js.map
