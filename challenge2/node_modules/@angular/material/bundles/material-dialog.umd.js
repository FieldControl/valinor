(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/cdk/overlay'), require('@angular/cdk/portal'), require('@angular/core'), require('@angular/material/core'), require('@angular/cdk/bidi'), require('@angular/common'), require('rxjs'), require('rxjs/operators'), require('@angular/cdk/a11y'), require('@angular/cdk/platform'), require('@angular/animations'), require('@angular/cdk/keycodes')) :
    typeof define === 'function' && define.amd ? define('@angular/material/dialog', ['exports', '@angular/cdk/overlay', '@angular/cdk/portal', '@angular/core', '@angular/material/core', '@angular/cdk/bidi', '@angular/common', 'rxjs', 'rxjs/operators', '@angular/cdk/a11y', '@angular/cdk/platform', '@angular/animations', '@angular/cdk/keycodes'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.ng = global.ng || {}, global.ng.material = global.ng.material || {}, global.ng.material.dialog = {}), global.ng.cdk.overlay, global.ng.cdk.portal, global.ng.core, global.ng.material.core, global.ng.cdk.bidi, global.ng.common, global.rxjs, global.rxjs.operators, global.ng.cdk.a11y, global.ng.cdk.platform, global.ng.animations, global.ng.cdk.keycodes));
}(this, (function (exports, overlay, portal, core, core$1, bidi, common, rxjs, operators, a11y, platform, animations, keycodes) { 'use strict';

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
     * Configuration for opening a modal dialog with the MatDialog service.
     */
    var MatDialogConfig = /** @class */ (function () {
        function MatDialogConfig() {
            /** The ARIA role of the dialog element. */
            this.role = 'dialog';
            /** Custom class for the overlay pane. */
            this.panelClass = '';
            /** Whether the dialog has a backdrop. */
            this.hasBackdrop = true;
            /** Custom class for the backdrop. */
            this.backdropClass = '';
            /** Whether the user can use escape or clicking on the backdrop to close the modal. */
            this.disableClose = false;
            /** Width of the dialog. */
            this.width = '';
            /** Height of the dialog. */
            this.height = '';
            /** Max-width of the dialog. If a number is provided, assumes pixel units. Defaults to 80vw. */
            this.maxWidth = '80vw';
            /** Data being injected into the child component. */
            this.data = null;
            /** ID of the element that describes the dialog. */
            this.ariaDescribedBy = null;
            /** ID of the element that labels the dialog. */
            this.ariaLabelledBy = null;
            /** Aria label to assign to the dialog element. */
            this.ariaLabel = null;
            /** Whether the dialog should focus the first focusable element on open. */
            this.autoFocus = true;
            /**
             * Whether the dialog should restore focus to the
             * previously-focused element, after it's closed.
             */
            this.restoreFocus = true;
            /**
             * Whether the dialog should close when the user goes backwards/forwards in history.
             * Note that this usually doesn't include clicking on links (unless the user is using
             * the `HashLocationStrategy`).
             */
            this.closeOnNavigation = true;
            // TODO(jelbourn): add configuration for lifecycle hooks, ARIA labelling.
        }
        return MatDialogConfig;
    }());

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /**
     * Animations used by MatDialog.
     * @docs-private
     */
    var matDialogAnimations = {
        /** Animation that is applied on the dialog container by default. */
        dialogContainer: animations.trigger('dialogContainer', [
            // Note: The `enter` animation transitions to `transform: none`, because for some reason
            // specifying the transform explicitly, causes IE both to blur the dialog content and
            // decimate the animation performance. Leaving it as `none` solves both issues.
            animations.state('void, exit', animations.style({ opacity: 0, transform: 'scale(0.7)' })),
            animations.state('enter', animations.style({ transform: 'none' })),
            animations.transition('* => enter', animations.animate('150ms cubic-bezier(0, 0, 0.2, 1)', animations.style({ transform: 'none', opacity: 1 }))),
            animations.transition('* => void, * => exit', animations.animate('75ms cubic-bezier(0.4, 0.0, 0.2, 1)', animations.style({ opacity: 0 }))),
        ])
    };

    /**
     * Throws an exception for the case when a ComponentPortal is
     * attached to a DomPortalOutlet without an origin.
     * @docs-private
     */
    function throwMatDialogContentAlreadyAttachedError() {
        throw Error('Attempting to attach dialog content after content is already attached');
    }
    /**
     * Base class for the `MatDialogContainer`. The base class does not implement
     * animations as these are left to implementers of the dialog container.
     */
    var _MatDialogContainerBase = /** @class */ (function (_super) {
        __extends(_MatDialogContainerBase, _super);
        function _MatDialogContainerBase(_elementRef, _focusTrapFactory, _changeDetectorRef, _document, 
        /** The dialog configuration. */
        _config, _focusMonitor) {
            var _this = _super.call(this) || this;
            _this._elementRef = _elementRef;
            _this._focusTrapFactory = _focusTrapFactory;
            _this._changeDetectorRef = _changeDetectorRef;
            _this._config = _config;
            _this._focusMonitor = _focusMonitor;
            /** Emits when an animation state changes. */
            _this._animationStateChanged = new core.EventEmitter();
            /** Element that was focused before the dialog was opened. Save this to restore upon close. */
            _this._elementFocusedBeforeDialogWasOpened = null;
            /**
             * Type of interaction that led to the dialog being closed. This is used to determine
             * whether the focus style will be applied when returning focus to its original location
             * after the dialog is closed.
             */
            _this._closeInteractionType = null;
            /**
             * Attaches a DOM portal to the dialog container.
             * @param portal Portal to be attached.
             * @deprecated To be turned into a method.
             * @breaking-change 10.0.0
             */
            _this.attachDomPortal = function (portal) {
                if (_this._portalOutlet.hasAttached() && (typeof ngDevMode === 'undefined' || ngDevMode)) {
                    throwMatDialogContentAlreadyAttachedError();
                }
                return _this._portalOutlet.attachDomPortal(portal);
            };
            _this._ariaLabelledBy = _config.ariaLabelledBy || null;
            _this._document = _document;
            return _this;
        }
        /** Initializes the dialog container with the attached content. */
        _MatDialogContainerBase.prototype._initializeWithAttachedContent = function () {
            this._setupFocusTrap();
            // Save the previously focused element. This element will be re-focused
            // when the dialog closes.
            this._capturePreviouslyFocusedElement();
            // Move focus onto the dialog immediately in order to prevent the user
            // from accidentally opening multiple dialogs at the same time.
            this._focusDialogContainer();
        };
        /**
         * Attach a ComponentPortal as content to this dialog container.
         * @param portal Portal to be attached as the dialog content.
         */
        _MatDialogContainerBase.prototype.attachComponentPortal = function (portal) {
            if (this._portalOutlet.hasAttached() && (typeof ngDevMode === 'undefined' || ngDevMode)) {
                throwMatDialogContentAlreadyAttachedError();
            }
            return this._portalOutlet.attachComponentPortal(portal);
        };
        /**
         * Attach a TemplatePortal as content to this dialog container.
         * @param portal Portal to be attached as the dialog content.
         */
        _MatDialogContainerBase.prototype.attachTemplatePortal = function (portal) {
            if (this._portalOutlet.hasAttached() && (typeof ngDevMode === 'undefined' || ngDevMode)) {
                throwMatDialogContentAlreadyAttachedError();
            }
            return this._portalOutlet.attachTemplatePortal(portal);
        };
        /** Moves focus back into the dialog if it was moved out. */
        _MatDialogContainerBase.prototype._recaptureFocus = function () {
            if (!this._containsFocus()) {
                var focusContainer = !this._config.autoFocus || !this._focusTrap.focusInitialElement();
                if (focusContainer) {
                    this._elementRef.nativeElement.focus();
                }
            }
        };
        /** Moves the focus inside the focus trap. */
        _MatDialogContainerBase.prototype._trapFocus = function () {
            // If we were to attempt to focus immediately, then the content of the dialog would not yet be
            // ready in instances where change detection has to run first. To deal with this, we simply
            // wait for the microtask queue to be empty.
            if (this._config.autoFocus) {
                this._focusTrap.focusInitialElementWhenReady();
            }
            else if (!this._containsFocus()) {
                // Otherwise ensure that focus is on the dialog container. It's possible that a different
                // component tried to move focus while the open animation was running. See:
                // https://github.com/angular/components/issues/16215. Note that we only want to do this
                // if the focus isn't inside the dialog already, because it's possible that the consumer
                // turned off `autoFocus` in order to move focus themselves.
                this._elementRef.nativeElement.focus();
            }
        };
        /** Restores focus to the element that was focused before the dialog opened. */
        _MatDialogContainerBase.prototype._restoreFocus = function () {
            var previousElement = this._elementFocusedBeforeDialogWasOpened;
            // We need the extra check, because IE can set the `activeElement` to null in some cases.
            if (this._config.restoreFocus && previousElement &&
                typeof previousElement.focus === 'function') {
                var activeElement = platform._getFocusedElementPierceShadowDom();
                var element = this._elementRef.nativeElement;
                // Make sure that focus is still inside the dialog or is on the body (usually because a
                // non-focusable element like the backdrop was clicked) before moving it. It's possible that
                // the consumer moved it themselves before the animation was done, in which case we shouldn't
                // do anything.
                if (!activeElement || activeElement === this._document.body || activeElement === element ||
                    element.contains(activeElement)) {
                    if (this._focusMonitor) {
                        this._focusMonitor.focusVia(previousElement, this._closeInteractionType);
                        this._closeInteractionType = null;
                    }
                    else {
                        previousElement.focus();
                    }
                }
            }
            if (this._focusTrap) {
                this._focusTrap.destroy();
            }
        };
        /** Sets up the focus trap. */
        _MatDialogContainerBase.prototype._setupFocusTrap = function () {
            this._focusTrap = this._focusTrapFactory.create(this._elementRef.nativeElement);
        };
        /** Captures the element that was focused before the dialog was opened. */
        _MatDialogContainerBase.prototype._capturePreviouslyFocusedElement = function () {
            if (this._document) {
                this._elementFocusedBeforeDialogWasOpened = platform._getFocusedElementPierceShadowDom();
            }
        };
        /** Focuses the dialog container. */
        _MatDialogContainerBase.prototype._focusDialogContainer = function () {
            // Note that there is no focus method when rendering on the server.
            if (this._elementRef.nativeElement.focus) {
                this._elementRef.nativeElement.focus();
            }
        };
        /** Returns whether focus is inside the dialog. */
        _MatDialogContainerBase.prototype._containsFocus = function () {
            var element = this._elementRef.nativeElement;
            var activeElement = platform._getFocusedElementPierceShadowDom();
            return element === activeElement || element.contains(activeElement);
        };
        return _MatDialogContainerBase;
    }(portal.BasePortalOutlet));
    _MatDialogContainerBase.decorators = [
        { type: core.Directive }
    ];
    _MatDialogContainerBase.ctorParameters = function () { return [
        { type: core.ElementRef },
        { type: a11y.FocusTrapFactory },
        { type: core.ChangeDetectorRef },
        { type: undefined, decorators: [{ type: core.Optional }, { type: core.Inject, args: [common.DOCUMENT,] }] },
        { type: MatDialogConfig },
        { type: a11y.FocusMonitor }
    ]; };
    _MatDialogContainerBase.propDecorators = {
        _portalOutlet: [{ type: core.ViewChild, args: [portal.CdkPortalOutlet, { static: true },] }]
    };
    /**
     * Internal component that wraps user-provided dialog content.
     * Animation is based on https://material.io/guidelines/motion/choreography.html.
     * @docs-private
     */
    var MatDialogContainer = /** @class */ (function (_super) {
        __extends(MatDialogContainer, _super);
        function MatDialogContainer() {
            var _this = _super.apply(this, __spreadArray([], __read(arguments))) || this;
            /** State of the dialog animation. */
            _this._state = 'enter';
            return _this;
        }
        /** Callback, invoked whenever an animation on the host completes. */
        MatDialogContainer.prototype._onAnimationDone = function (_a) {
            var toState = _a.toState, totalTime = _a.totalTime;
            if (toState === 'enter') {
                this._trapFocus();
                this._animationStateChanged.next({ state: 'opened', totalTime: totalTime });
            }
            else if (toState === 'exit') {
                this._restoreFocus();
                this._animationStateChanged.next({ state: 'closed', totalTime: totalTime });
            }
        };
        /** Callback, invoked when an animation on the host starts. */
        MatDialogContainer.prototype._onAnimationStart = function (_a) {
            var toState = _a.toState, totalTime = _a.totalTime;
            if (toState === 'enter') {
                this._animationStateChanged.next({ state: 'opening', totalTime: totalTime });
            }
            else if (toState === 'exit' || toState === 'void') {
                this._animationStateChanged.next({ state: 'closing', totalTime: totalTime });
            }
        };
        /** Starts the dialog exit animation. */
        MatDialogContainer.prototype._startExitAnimation = function () {
            this._state = 'exit';
            // Mark the container for check so it can react if the
            // view container is using OnPush change detection.
            this._changeDetectorRef.markForCheck();
        };
        return MatDialogContainer;
    }(_MatDialogContainerBase));
    MatDialogContainer.decorators = [
        { type: core.Component, args: [{
                    selector: 'mat-dialog-container',
                    template: "<ng-template cdkPortalOutlet></ng-template>\n",
                    encapsulation: core.ViewEncapsulation.None,
                    // Using OnPush for dialogs caused some G3 sync issues. Disabled until we can track them down.
                    // tslint:disable-next-line:validate-decorators
                    changeDetection: core.ChangeDetectionStrategy.Default,
                    animations: [matDialogAnimations.dialogContainer],
                    host: {
                        'class': 'mat-dialog-container',
                        'tabindex': '-1',
                        'aria-modal': 'true',
                        '[id]': '_id',
                        '[attr.role]': '_config.role',
                        '[attr.aria-labelledby]': '_config.ariaLabel ? null : _ariaLabelledBy',
                        '[attr.aria-label]': '_config.ariaLabel',
                        '[attr.aria-describedby]': '_config.ariaDescribedBy || null',
                        '[@dialogContainer]': '_state',
                        '(@dialogContainer.start)': '_onAnimationStart($event)',
                        '(@dialogContainer.done)': '_onAnimationDone($event)',
                    },
                    styles: [".mat-dialog-container{display:block;padding:24px;border-radius:4px;box-sizing:border-box;overflow:auto;outline:0;width:100%;height:100%;min-height:inherit;max-height:inherit}.cdk-high-contrast-active .mat-dialog-container{outline:solid 1px}.mat-dialog-content{display:block;margin:0 -24px;padding:0 24px;max-height:65vh;overflow:auto;-webkit-overflow-scrolling:touch}.mat-dialog-title{margin:0 0 20px;display:block}.mat-dialog-actions{padding:8px 0;display:flex;flex-wrap:wrap;min-height:52px;align-items:center;box-sizing:content-box;margin-bottom:-24px}.mat-dialog-actions[align=end]{justify-content:flex-end}.mat-dialog-actions[align=center]{justify-content:center}.mat-dialog-actions .mat-button-base+.mat-button-base,.mat-dialog-actions .mat-mdc-button-base+.mat-mdc-button-base{margin-left:8px}[dir=rtl] .mat-dialog-actions .mat-button-base+.mat-button-base,[dir=rtl] .mat-dialog-actions .mat-mdc-button-base+.mat-mdc-button-base{margin-left:0;margin-right:8px}\n"]
                },] }
    ];

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    // TODO(jelbourn): resizing
    // Counter for unique dialog ids.
    var uniqueId = 0;
    /**
     * Reference to a dialog opened via the MatDialog service.
     */
    var MatDialogRef = /** @class */ (function () {
        function MatDialogRef(_overlayRef, _containerInstance, id) {
            var _this = this;
            if (id === void 0) { id = "mat-dialog-" + uniqueId++; }
            this._overlayRef = _overlayRef;
            this._containerInstance = _containerInstance;
            this.id = id;
            /** Whether the user is allowed to close the dialog. */
            this.disableClose = this._containerInstance._config.disableClose;
            /** Subject for notifying the user that the dialog has finished opening. */
            this._afterOpened = new rxjs.Subject();
            /** Subject for notifying the user that the dialog has finished closing. */
            this._afterClosed = new rxjs.Subject();
            /** Subject for notifying the user that the dialog has started closing. */
            this._beforeClosed = new rxjs.Subject();
            /** Current state of the dialog. */
            this._state = 0 /* OPEN */;
            // Pass the id along to the container.
            _containerInstance._id = id;
            // Emit when opening animation completes
            _containerInstance._animationStateChanged.pipe(operators.filter(function (event) { return event.state === 'opened'; }), operators.take(1))
                .subscribe(function () {
                _this._afterOpened.next();
                _this._afterOpened.complete();
            });
            // Dispose overlay when closing animation is complete
            _containerInstance._animationStateChanged.pipe(operators.filter(function (event) { return event.state === 'closed'; }), operators.take(1)).subscribe(function () {
                clearTimeout(_this._closeFallbackTimeout);
                _this._finishDialogClose();
            });
            _overlayRef.detachments().subscribe(function () {
                _this._beforeClosed.next(_this._result);
                _this._beforeClosed.complete();
                _this._afterClosed.next(_this._result);
                _this._afterClosed.complete();
                _this.componentInstance = null;
                _this._overlayRef.dispose();
            });
            _overlayRef.keydownEvents()
                .pipe(operators.filter(function (event) {
                return event.keyCode === keycodes.ESCAPE && !_this.disableClose && !keycodes.hasModifierKey(event);
            }))
                .subscribe(function (event) {
                event.preventDefault();
                _closeDialogVia(_this, 'keyboard');
            });
            _overlayRef.backdropClick().subscribe(function () {
                if (_this.disableClose) {
                    _this._containerInstance._recaptureFocus();
                }
                else {
                    _closeDialogVia(_this, 'mouse');
                }
            });
        }
        /**
         * Close the dialog.
         * @param dialogResult Optional result to return to the dialog opener.
         */
        MatDialogRef.prototype.close = function (dialogResult) {
            var _this = this;
            this._result = dialogResult;
            // Transition the backdrop in parallel to the dialog.
            this._containerInstance._animationStateChanged.pipe(operators.filter(function (event) { return event.state === 'closing'; }), operators.take(1))
                .subscribe(function (event) {
                _this._beforeClosed.next(dialogResult);
                _this._beforeClosed.complete();
                _this._overlayRef.detachBackdrop();
                // The logic that disposes of the overlay depends on the exit animation completing, however
                // it isn't guaranteed if the parent view is destroyed while it's running. Add a fallback
                // timeout which will clean everything up if the animation hasn't fired within the specified
                // amount of time plus 100ms. We don't need to run this outside the NgZone, because for the
                // vast majority of cases the timeout will have been cleared before it has the chance to fire.
                _this._closeFallbackTimeout = setTimeout(function () { return _this._finishDialogClose(); }, event.totalTime + 100);
            });
            this._state = 1 /* CLOSING */;
            this._containerInstance._startExitAnimation();
        };
        /**
         * Gets an observable that is notified when the dialog is finished opening.
         */
        MatDialogRef.prototype.afterOpened = function () {
            return this._afterOpened;
        };
        /**
         * Gets an observable that is notified when the dialog is finished closing.
         */
        MatDialogRef.prototype.afterClosed = function () {
            return this._afterClosed;
        };
        /**
         * Gets an observable that is notified when the dialog has started closing.
         */
        MatDialogRef.prototype.beforeClosed = function () {
            return this._beforeClosed;
        };
        /**
         * Gets an observable that emits when the overlay's backdrop has been clicked.
         */
        MatDialogRef.prototype.backdropClick = function () {
            return this._overlayRef.backdropClick();
        };
        /**
         * Gets an observable that emits when keydown events are targeted on the overlay.
         */
        MatDialogRef.prototype.keydownEvents = function () {
            return this._overlayRef.keydownEvents();
        };
        /**
         * Updates the dialog's position.
         * @param position New dialog position.
         */
        MatDialogRef.prototype.updatePosition = function (position) {
            var strategy = this._getPositionStrategy();
            if (position && (position.left || position.right)) {
                position.left ? strategy.left(position.left) : strategy.right(position.right);
            }
            else {
                strategy.centerHorizontally();
            }
            if (position && (position.top || position.bottom)) {
                position.top ? strategy.top(position.top) : strategy.bottom(position.bottom);
            }
            else {
                strategy.centerVertically();
            }
            this._overlayRef.updatePosition();
            return this;
        };
        /**
         * Updates the dialog's width and height.
         * @param width New width of the dialog.
         * @param height New height of the dialog.
         */
        MatDialogRef.prototype.updateSize = function (width, height) {
            if (width === void 0) { width = ''; }
            if (height === void 0) { height = ''; }
            this._overlayRef.updateSize({ width: width, height: height });
            this._overlayRef.updatePosition();
            return this;
        };
        /** Add a CSS class or an array of classes to the overlay pane. */
        MatDialogRef.prototype.addPanelClass = function (classes) {
            this._overlayRef.addPanelClass(classes);
            return this;
        };
        /** Remove a CSS class or an array of classes from the overlay pane. */
        MatDialogRef.prototype.removePanelClass = function (classes) {
            this._overlayRef.removePanelClass(classes);
            return this;
        };
        /** Gets the current state of the dialog's lifecycle. */
        MatDialogRef.prototype.getState = function () {
            return this._state;
        };
        /**
         * Finishes the dialog close by updating the state of the dialog
         * and disposing the overlay.
         */
        MatDialogRef.prototype._finishDialogClose = function () {
            this._state = 2 /* CLOSED */;
            this._overlayRef.dispose();
        };
        /** Fetches the position strategy object from the overlay ref. */
        MatDialogRef.prototype._getPositionStrategy = function () {
            return this._overlayRef.getConfig().positionStrategy;
        };
        return MatDialogRef;
    }());
    /**
     * Closes the dialog with the specified interaction type. This is currently not part of
     * `MatDialogRef` as that would conflict with custom dialog ref mocks provided in tests.
     * More details. See: https://github.com/angular/components/pull/9257#issuecomment-651342226.
     */
    // TODO: TODO: Move this back into `MatDialogRef` when we provide an official mock dialog ref.
    function _closeDialogVia(ref, interactionType, result) {
        // Some mock dialog ref instances in tests do not have the `_containerInstance` property.
        // For those, we keep the behavior as is and do not deal with the interaction type.
        if (ref._containerInstance !== undefined) {
            ref._containerInstance._closeInteractionType = interactionType;
        }
        return ref.close(result);
    }

    /** Injection token that can be used to access the data that was passed in to a dialog. */
    var MAT_DIALOG_DATA = new core.InjectionToken('MatDialogData');
    /** Injection token that can be used to specify default dialog options. */
    var MAT_DIALOG_DEFAULT_OPTIONS = new core.InjectionToken('mat-dialog-default-options');
    /** Injection token that determines the scroll handling while the dialog is open. */
    var MAT_DIALOG_SCROLL_STRATEGY = new core.InjectionToken('mat-dialog-scroll-strategy');
    /** @docs-private */
    function MAT_DIALOG_SCROLL_STRATEGY_FACTORY(overlay) {
        return function () { return overlay.scrollStrategies.block(); };
    }
    /** @docs-private */
    function MAT_DIALOG_SCROLL_STRATEGY_PROVIDER_FACTORY(overlay) {
        return function () { return overlay.scrollStrategies.block(); };
    }
    /** @docs-private */
    var MAT_DIALOG_SCROLL_STRATEGY_PROVIDER = {
        provide: MAT_DIALOG_SCROLL_STRATEGY,
        deps: [overlay.Overlay],
        useFactory: MAT_DIALOG_SCROLL_STRATEGY_PROVIDER_FACTORY,
    };
    /**
     * Base class for dialog services. The base dialog service allows
     * for arbitrary dialog refs and dialog container components.
     */
    var _MatDialogBase = /** @class */ (function () {
        function _MatDialogBase(_overlay, _injector, _defaultOptions, _parentDialog, _overlayContainer, scrollStrategy, _dialogRefConstructor, _dialogContainerType, _dialogDataToken) {
            var _this = this;
            this._overlay = _overlay;
            this._injector = _injector;
            this._defaultOptions = _defaultOptions;
            this._parentDialog = _parentDialog;
            this._overlayContainer = _overlayContainer;
            this._dialogRefConstructor = _dialogRefConstructor;
            this._dialogContainerType = _dialogContainerType;
            this._dialogDataToken = _dialogDataToken;
            this._openDialogsAtThisLevel = [];
            this._afterAllClosedAtThisLevel = new rxjs.Subject();
            this._afterOpenedAtThisLevel = new rxjs.Subject();
            this._ariaHiddenElements = new Map();
            // TODO (jelbourn): tighten the typing right-hand side of this expression.
            /**
             * Stream that emits when all open dialog have finished closing.
             * Will emit on subscribe if there are no open dialogs to begin with.
             */
            this.afterAllClosed = rxjs.defer(function () { return _this.openDialogs.length ?
                _this._getAfterAllClosed() :
                _this._getAfterAllClosed().pipe(operators.startWith(undefined)); });
            this._scrollStrategy = scrollStrategy;
        }
        Object.defineProperty(_MatDialogBase.prototype, "openDialogs", {
            /** Keeps track of the currently-open dialogs. */
            get: function () {
                return this._parentDialog ? this._parentDialog.openDialogs : this._openDialogsAtThisLevel;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(_MatDialogBase.prototype, "afterOpened", {
            /** Stream that emits when a dialog has been opened. */
            get: function () {
                return this._parentDialog ? this._parentDialog.afterOpened : this._afterOpenedAtThisLevel;
            },
            enumerable: false,
            configurable: true
        });
        _MatDialogBase.prototype._getAfterAllClosed = function () {
            var parent = this._parentDialog;
            return parent ? parent._getAfterAllClosed() : this._afterAllClosedAtThisLevel;
        };
        _MatDialogBase.prototype.open = function (componentOrTemplateRef, config) {
            var _this = this;
            config = _applyConfigDefaults(config, this._defaultOptions || new MatDialogConfig());
            if (config.id && this.getDialogById(config.id) &&
                (typeof ngDevMode === 'undefined' || ngDevMode)) {
                throw Error("Dialog with id \"" + config.id + "\" exists already. The dialog id must be unique.");
            }
            var overlayRef = this._createOverlay(config);
            var dialogContainer = this._attachDialogContainer(overlayRef, config);
            var dialogRef = this._attachDialogContent(componentOrTemplateRef, dialogContainer, overlayRef, config);
            // If this is the first dialog that we're opening, hide all the non-overlay content.
            if (!this.openDialogs.length) {
                this._hideNonDialogContentFromAssistiveTechnology();
            }
            this.openDialogs.push(dialogRef);
            dialogRef.afterClosed().subscribe(function () { return _this._removeOpenDialog(dialogRef); });
            this.afterOpened.next(dialogRef);
            // Notify the dialog container that the content has been attached.
            dialogContainer._initializeWithAttachedContent();
            return dialogRef;
        };
        /**
         * Closes all of the currently-open dialogs.
         */
        _MatDialogBase.prototype.closeAll = function () {
            this._closeDialogs(this.openDialogs);
        };
        /**
         * Finds an open dialog by its id.
         * @param id ID to use when looking up the dialog.
         */
        _MatDialogBase.prototype.getDialogById = function (id) {
            return this.openDialogs.find(function (dialog) { return dialog.id === id; });
        };
        _MatDialogBase.prototype.ngOnDestroy = function () {
            // Only close the dialogs at this level on destroy
            // since the parent service may still be active.
            this._closeDialogs(this._openDialogsAtThisLevel);
            this._afterAllClosedAtThisLevel.complete();
            this._afterOpenedAtThisLevel.complete();
        };
        /**
         * Creates the overlay into which the dialog will be loaded.
         * @param config The dialog configuration.
         * @returns A promise resolving to the OverlayRef for the created overlay.
         */
        _MatDialogBase.prototype._createOverlay = function (config) {
            var overlayConfig = this._getOverlayConfig(config);
            return this._overlay.create(overlayConfig);
        };
        /**
         * Creates an overlay config from a dialog config.
         * @param dialogConfig The dialog configuration.
         * @returns The overlay configuration.
         */
        _MatDialogBase.prototype._getOverlayConfig = function (dialogConfig) {
            var state = new overlay.OverlayConfig({
                positionStrategy: this._overlay.position().global(),
                scrollStrategy: dialogConfig.scrollStrategy || this._scrollStrategy(),
                panelClass: dialogConfig.panelClass,
                hasBackdrop: dialogConfig.hasBackdrop,
                direction: dialogConfig.direction,
                minWidth: dialogConfig.minWidth,
                minHeight: dialogConfig.minHeight,
                maxWidth: dialogConfig.maxWidth,
                maxHeight: dialogConfig.maxHeight,
                disposeOnNavigation: dialogConfig.closeOnNavigation
            });
            if (dialogConfig.backdropClass) {
                state.backdropClass = dialogConfig.backdropClass;
            }
            return state;
        };
        /**
         * Attaches a dialog container to a dialog's already-created overlay.
         * @param overlay Reference to the dialog's underlying overlay.
         * @param config The dialog configuration.
         * @returns A promise resolving to a ComponentRef for the attached container.
         */
        _MatDialogBase.prototype._attachDialogContainer = function (overlay, config) {
            var userInjector = config && config.viewContainerRef && config.viewContainerRef.injector;
            var injector = core.Injector.create({
                parent: userInjector || this._injector,
                providers: [{ provide: MatDialogConfig, useValue: config }]
            });
            var containerPortal = new portal.ComponentPortal(this._dialogContainerType, config.viewContainerRef, injector, config.componentFactoryResolver);
            var containerRef = overlay.attach(containerPortal);
            return containerRef.instance;
        };
        /**
         * Attaches the user-provided component to the already-created dialog container.
         * @param componentOrTemplateRef The type of component being loaded into the dialog,
         *     or a TemplateRef to instantiate as the content.
         * @param dialogContainer Reference to the wrapping dialog container.
         * @param overlayRef Reference to the overlay in which the dialog resides.
         * @param config The dialog configuration.
         * @returns A promise resolving to the MatDialogRef that should be returned to the user.
         */
        _MatDialogBase.prototype._attachDialogContent = function (componentOrTemplateRef, dialogContainer, overlayRef, config) {
            // Create a reference to the dialog we're creating in order to give the user a handle
            // to modify and close it.
            var dialogRef = new this._dialogRefConstructor(overlayRef, dialogContainer, config.id);
            if (componentOrTemplateRef instanceof core.TemplateRef) {
                dialogContainer.attachTemplatePortal(new portal.TemplatePortal(componentOrTemplateRef, null, { $implicit: config.data, dialogRef: dialogRef }));
            }
            else {
                var injector = this._createInjector(config, dialogRef, dialogContainer);
                var contentRef = dialogContainer.attachComponentPortal(new portal.ComponentPortal(componentOrTemplateRef, config.viewContainerRef, injector));
                dialogRef.componentInstance = contentRef.instance;
            }
            dialogRef
                .updateSize(config.width, config.height)
                .updatePosition(config.position);
            return dialogRef;
        };
        /**
         * Creates a custom injector to be used inside the dialog. This allows a component loaded inside
         * of a dialog to close itself and, optionally, to return a value.
         * @param config Config object that is used to construct the dialog.
         * @param dialogRef Reference to the dialog.
         * @param dialogContainer Dialog container element that wraps all of the contents.
         * @returns The custom injector that can be used inside the dialog.
         */
        _MatDialogBase.prototype._createInjector = function (config, dialogRef, dialogContainer) {
            var userInjector = config && config.viewContainerRef && config.viewContainerRef.injector;
            // The dialog container should be provided as the dialog container and the dialog's
            // content are created out of the same `ViewContainerRef` and as such, are siblings
            // for injector purposes. To allow the hierarchy that is expected, the dialog
            // container is explicitly provided in the injector.
            var providers = [
                { provide: this._dialogContainerType, useValue: dialogContainer },
                { provide: this._dialogDataToken, useValue: config.data },
                { provide: this._dialogRefConstructor, useValue: dialogRef }
            ];
            if (config.direction &&
                (!userInjector || !userInjector.get(bidi.Directionality, null))) {
                providers.push({
                    provide: bidi.Directionality,
                    useValue: { value: config.direction, change: rxjs.of() }
                });
            }
            return core.Injector.create({ parent: userInjector || this._injector, providers: providers });
        };
        /**
         * Removes a dialog from the array of open dialogs.
         * @param dialogRef Dialog to be removed.
         */
        _MatDialogBase.prototype._removeOpenDialog = function (dialogRef) {
            var index = this.openDialogs.indexOf(dialogRef);
            if (index > -1) {
                this.openDialogs.splice(index, 1);
                // If all the dialogs were closed, remove/restore the `aria-hidden`
                // to a the siblings and emit to the `afterAllClosed` stream.
                if (!this.openDialogs.length) {
                    this._ariaHiddenElements.forEach(function (previousValue, element) {
                        if (previousValue) {
                            element.setAttribute('aria-hidden', previousValue);
                        }
                        else {
                            element.removeAttribute('aria-hidden');
                        }
                    });
                    this._ariaHiddenElements.clear();
                    this._getAfterAllClosed().next();
                }
            }
        };
        /**
         * Hides all of the content that isn't an overlay from assistive technology.
         */
        _MatDialogBase.prototype._hideNonDialogContentFromAssistiveTechnology = function () {
            var overlayContainer = this._overlayContainer.getContainerElement();
            // Ensure that the overlay container is attached to the DOM.
            if (overlayContainer.parentElement) {
                var siblings = overlayContainer.parentElement.children;
                for (var i = siblings.length - 1; i > -1; i--) {
                    var sibling = siblings[i];
                    if (sibling !== overlayContainer &&
                        sibling.nodeName !== 'SCRIPT' &&
                        sibling.nodeName !== 'STYLE' &&
                        !sibling.hasAttribute('aria-live')) {
                        this._ariaHiddenElements.set(sibling, sibling.getAttribute('aria-hidden'));
                        sibling.setAttribute('aria-hidden', 'true');
                    }
                }
            }
        };
        /** Closes all of the dialogs in an array. */
        _MatDialogBase.prototype._closeDialogs = function (dialogs) {
            var i = dialogs.length;
            while (i--) {
                // The `_openDialogs` property isn't updated after close until the rxjs subscription
                // runs on the next microtask, in addition to modifying the array as we're going
                // through it. We loop through all of them and call close without assuming that
                // they'll be removed from the list instantaneously.
                dialogs[i].close();
            }
        };
        return _MatDialogBase;
    }());
    _MatDialogBase.decorators = [
        { type: core.Directive }
    ];
    _MatDialogBase.ctorParameters = function () { return [
        { type: overlay.Overlay },
        { type: core.Injector },
        { type: undefined },
        { type: undefined },
        { type: overlay.OverlayContainer },
        { type: undefined },
        { type: core.Type },
        { type: core.Type },
        { type: core.InjectionToken }
    ]; };
    /**
     * Service to open Material Design modal dialogs.
     */
    var MatDialog = /** @class */ (function (_super) {
        __extends(MatDialog, _super);
        function MatDialog(overlay, injector, 
        /**
         * @deprecated `_location` parameter to be removed.
         * @breaking-change 10.0.0
         */
        location, defaultOptions, scrollStrategy, parentDialog, overlayContainer) {
            return _super.call(this, overlay, injector, defaultOptions, parentDialog, overlayContainer, scrollStrategy, MatDialogRef, MatDialogContainer, MAT_DIALOG_DATA) || this;
        }
        return MatDialog;
    }(_MatDialogBase));
    MatDialog.decorators = [
        { type: core.Injectable }
    ];
    MatDialog.ctorParameters = function () { return [
        { type: overlay.Overlay },
        { type: core.Injector },
        { type: common.Location, decorators: [{ type: core.Optional }] },
        { type: MatDialogConfig, decorators: [{ type: core.Optional }, { type: core.Inject, args: [MAT_DIALOG_DEFAULT_OPTIONS,] }] },
        { type: undefined, decorators: [{ type: core.Inject, args: [MAT_DIALOG_SCROLL_STRATEGY,] }] },
        { type: MatDialog, decorators: [{ type: core.Optional }, { type: core.SkipSelf }] },
        { type: overlay.OverlayContainer }
    ]; };
    /**
     * Applies default options to the dialog config.
     * @param config Config to be modified.
     * @param defaultOptions Default options provided.
     * @returns The new configuration object.
     */
    function _applyConfigDefaults(config, defaultOptions) {
        return Object.assign(Object.assign({}, defaultOptions), config);
    }

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /** Counter used to generate unique IDs for dialog elements. */
    var dialogElementUid = 0;
    /**
     * Button that will close the current dialog.
     */
    var MatDialogClose = /** @class */ (function () {
        function MatDialogClose(
        // The dialog title directive is always used in combination with a `MatDialogRef`.
        // tslint:disable-next-line: lightweight-tokens
        dialogRef, _elementRef, _dialog) {
            this.dialogRef = dialogRef;
            this._elementRef = _elementRef;
            this._dialog = _dialog;
            /** Default to "button" to prevents accidental form submits. */
            this.type = 'button';
        }
        MatDialogClose.prototype.ngOnInit = function () {
            if (!this.dialogRef) {
                // When this directive is included in a dialog via TemplateRef (rather than being
                // in a Component), the DialogRef isn't available via injection because embedded
                // views cannot be given a custom injector. Instead, we look up the DialogRef by
                // ID. This must occur in `onInit`, as the ID binding for the dialog container won't
                // be resolved at constructor time.
                this.dialogRef = getClosestDialog(this._elementRef, this._dialog.openDialogs);
            }
        };
        MatDialogClose.prototype.ngOnChanges = function (changes) {
            var proxiedChange = changes['_matDialogClose'] || changes['_matDialogCloseResult'];
            if (proxiedChange) {
                this.dialogResult = proxiedChange.currentValue;
            }
        };
        MatDialogClose.prototype._onButtonClick = function (event) {
            // Determinate the focus origin using the click event, because using the FocusMonitor will
            // result in incorrect origins. Most of the time, close buttons will be auto focused in the
            // dialog, and therefore clicking the button won't result in a focus change. This means that
            // the FocusMonitor won't detect any origin change, and will always output `program`.
            _closeDialogVia(this.dialogRef, event.screenX === 0 && event.screenY === 0 ? 'keyboard' : 'mouse', this.dialogResult);
        };
        return MatDialogClose;
    }());
    MatDialogClose.decorators = [
        { type: core.Directive, args: [{
                    selector: '[mat-dialog-close], [matDialogClose]',
                    exportAs: 'matDialogClose',
                    host: {
                        '(click)': '_onButtonClick($event)',
                        '[attr.aria-label]': 'ariaLabel || null',
                        '[attr.type]': 'type',
                    }
                },] }
    ];
    MatDialogClose.ctorParameters = function () { return [
        { type: MatDialogRef, decorators: [{ type: core.Optional }] },
        { type: core.ElementRef },
        { type: MatDialog }
    ]; };
    MatDialogClose.propDecorators = {
        ariaLabel: [{ type: core.Input, args: ['aria-label',] }],
        type: [{ type: core.Input }],
        dialogResult: [{ type: core.Input, args: ['mat-dialog-close',] }],
        _matDialogClose: [{ type: core.Input, args: ['matDialogClose',] }]
    };
    /**
     * Title of a dialog element. Stays fixed to the top of the dialog when scrolling.
     */
    var MatDialogTitle = /** @class */ (function () {
        function MatDialogTitle(
        // The dialog title directive is always used in combination with a `MatDialogRef`.
        // tslint:disable-next-line: lightweight-tokens
        _dialogRef, _elementRef, _dialog) {
            this._dialogRef = _dialogRef;
            this._elementRef = _elementRef;
            this._dialog = _dialog;
            this.id = "mat-dialog-title-" + dialogElementUid++;
        }
        MatDialogTitle.prototype.ngOnInit = function () {
            var _this = this;
            if (!this._dialogRef) {
                this._dialogRef = getClosestDialog(this._elementRef, this._dialog.openDialogs);
            }
            if (this._dialogRef) {
                Promise.resolve().then(function () {
                    var container = _this._dialogRef._containerInstance;
                    if (container && !container._ariaLabelledBy) {
                        container._ariaLabelledBy = _this.id;
                    }
                });
            }
        };
        return MatDialogTitle;
    }());
    MatDialogTitle.decorators = [
        { type: core.Directive, args: [{
                    selector: '[mat-dialog-title], [matDialogTitle]',
                    exportAs: 'matDialogTitle',
                    host: {
                        'class': 'mat-dialog-title',
                        '[id]': 'id',
                    },
                },] }
    ];
    MatDialogTitle.ctorParameters = function () { return [
        { type: MatDialogRef, decorators: [{ type: core.Optional }] },
        { type: core.ElementRef },
        { type: MatDialog }
    ]; };
    MatDialogTitle.propDecorators = {
        id: [{ type: core.Input }]
    };
    /**
     * Scrollable content container of a dialog.
     */
    var MatDialogContent = /** @class */ (function () {
        function MatDialogContent() {
        }
        return MatDialogContent;
    }());
    MatDialogContent.decorators = [
        { type: core.Directive, args: [{
                    selector: "[mat-dialog-content], mat-dialog-content, [matDialogContent]",
                    host: { 'class': 'mat-dialog-content' }
                },] }
    ];
    /**
     * Container for the bottom action buttons in a dialog.
     * Stays fixed to the bottom when scrolling.
     */
    var MatDialogActions = /** @class */ (function () {
        function MatDialogActions() {
        }
        return MatDialogActions;
    }());
    MatDialogActions.decorators = [
        { type: core.Directive, args: [{
                    selector: "[mat-dialog-actions], mat-dialog-actions, [matDialogActions]",
                    host: { 'class': 'mat-dialog-actions' }
                },] }
    ];
    /**
     * Finds the closest MatDialogRef to an element by looking at the DOM.
     * @param element Element relative to which to look for a dialog.
     * @param openDialogs References to the currently-open dialogs.
     */
    function getClosestDialog(element, openDialogs) {
        var parent = element.nativeElement.parentElement;
        while (parent && !parent.classList.contains('mat-dialog-container')) {
            parent = parent.parentElement;
        }
        return parent ? openDialogs.find(function (dialog) { return dialog.id === parent.id; }) : null;
    }

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var MatDialogModule = /** @class */ (function () {
        function MatDialogModule() {
        }
        return MatDialogModule;
    }());
    MatDialogModule.decorators = [
        { type: core.NgModule, args: [{
                    imports: [
                        overlay.OverlayModule,
                        portal.PortalModule,
                        core$1.MatCommonModule,
                    ],
                    exports: [
                        MatDialogContainer,
                        MatDialogClose,
                        MatDialogTitle,
                        MatDialogContent,
                        MatDialogActions,
                        core$1.MatCommonModule,
                    ],
                    declarations: [
                        MatDialogContainer,
                        MatDialogClose,
                        MatDialogTitle,
                        MatDialogActions,
                        MatDialogContent,
                    ],
                    providers: [
                        MatDialog,
                        MAT_DIALOG_SCROLL_STRATEGY_PROVIDER,
                    ],
                    entryComponents: [MatDialogContainer],
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

    exports.MAT_DIALOG_DATA = MAT_DIALOG_DATA;
    exports.MAT_DIALOG_DEFAULT_OPTIONS = MAT_DIALOG_DEFAULT_OPTIONS;
    exports.MAT_DIALOG_SCROLL_STRATEGY = MAT_DIALOG_SCROLL_STRATEGY;
    exports.MAT_DIALOG_SCROLL_STRATEGY_FACTORY = MAT_DIALOG_SCROLL_STRATEGY_FACTORY;
    exports.MAT_DIALOG_SCROLL_STRATEGY_PROVIDER = MAT_DIALOG_SCROLL_STRATEGY_PROVIDER;
    exports.MAT_DIALOG_SCROLL_STRATEGY_PROVIDER_FACTORY = MAT_DIALOG_SCROLL_STRATEGY_PROVIDER_FACTORY;
    exports.MatDialog = MatDialog;
    exports.MatDialogActions = MatDialogActions;
    exports.MatDialogClose = MatDialogClose;
    exports.MatDialogConfig = MatDialogConfig;
    exports.MatDialogContainer = MatDialogContainer;
    exports.MatDialogContent = MatDialogContent;
    exports.MatDialogModule = MatDialogModule;
    exports.MatDialogRef = MatDialogRef;
    exports.MatDialogTitle = MatDialogTitle;
    exports._MatDialogBase = _MatDialogBase;
    exports._MatDialogContainerBase = _MatDialogContainerBase;
    exports._closeDialogVia = _closeDialogVia;
    exports.matDialogAnimations = matDialogAnimations;
    exports.throwMatDialogContentAlreadyAttachedError = throwMatDialogContentAlreadyAttachedError;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=material-dialog.umd.js.map
