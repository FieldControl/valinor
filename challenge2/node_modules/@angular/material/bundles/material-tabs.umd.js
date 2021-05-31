(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/cdk/a11y'), require('@angular/cdk/observers'), require('@angular/cdk/portal'), require('@angular/common'), require('@angular/core'), require('@angular/material/core'), require('@angular/platform-browser/animations'), require('rxjs'), require('@angular/cdk/bidi'), require('@angular/animations'), require('rxjs/operators'), require('@angular/cdk/coercion'), require('@angular/cdk/scrolling'), require('@angular/cdk/platform'), require('@angular/cdk/keycodes')) :
    typeof define === 'function' && define.amd ? define('@angular/material/tabs', ['exports', '@angular/cdk/a11y', '@angular/cdk/observers', '@angular/cdk/portal', '@angular/common', '@angular/core', '@angular/material/core', '@angular/platform-browser/animations', 'rxjs', '@angular/cdk/bidi', '@angular/animations', 'rxjs/operators', '@angular/cdk/coercion', '@angular/cdk/scrolling', '@angular/cdk/platform', '@angular/cdk/keycodes'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.ng = global.ng || {}, global.ng.material = global.ng.material || {}, global.ng.material.tabs = {}), global.ng.cdk.a11y, global.ng.cdk.observers, global.ng.cdk.portal, global.ng.common, global.ng.core, global.ng.material.core, global.ng.platformBrowser.animations, global.rxjs, global.ng.cdk.bidi, global.ng.animations, global.rxjs.operators, global.ng.cdk.coercion, global.ng.cdk.scrolling, global.ng.cdk.platform, global.ng.cdk.keycodes));
}(this, (function (exports, a11y, observers, portal, common, core, core$1, animations, rxjs, bidi, animations$1, operators, coercion, scrolling, platform, keycodes) { 'use strict';

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /** Injection token for the MatInkBar's Positioner. */
    var _MAT_INK_BAR_POSITIONER = new core.InjectionToken('MatInkBarPositioner', {
        providedIn: 'root',
        factory: _MAT_INK_BAR_POSITIONER_FACTORY
    });
    /**
     * The default positioner function for the MatInkBar.
     * @docs-private
     */
    function _MAT_INK_BAR_POSITIONER_FACTORY() {
        var method = function (element) { return ({
            left: element ? (element.offsetLeft || 0) + 'px' : '0',
            width: element ? (element.offsetWidth || 0) + 'px' : '0',
        }); };
        return method;
    }
    /**
     * The ink-bar is used to display and animate the line underneath the current active tab label.
     * @docs-private
     */
    var MatInkBar = /** @class */ (function () {
        function MatInkBar(_elementRef, _ngZone, _inkBarPositioner, _animationMode) {
            this._elementRef = _elementRef;
            this._ngZone = _ngZone;
            this._inkBarPositioner = _inkBarPositioner;
            this._animationMode = _animationMode;
        }
        /**
         * Calculates the styles from the provided element in order to align the ink-bar to that element.
         * Shows the ink bar if previously set as hidden.
         * @param element
         */
        MatInkBar.prototype.alignToElement = function (element) {
            var _this = this;
            this.show();
            if (typeof requestAnimationFrame !== 'undefined') {
                this._ngZone.runOutsideAngular(function () {
                    requestAnimationFrame(function () { return _this._setStyles(element); });
                });
            }
            else {
                this._setStyles(element);
            }
        };
        /** Shows the ink bar. */
        MatInkBar.prototype.show = function () {
            this._elementRef.nativeElement.style.visibility = 'visible';
        };
        /** Hides the ink bar. */
        MatInkBar.prototype.hide = function () {
            this._elementRef.nativeElement.style.visibility = 'hidden';
        };
        /**
         * Sets the proper styles to the ink bar element.
         * @param element
         */
        MatInkBar.prototype._setStyles = function (element) {
            var positions = this._inkBarPositioner(element);
            var inkBar = this._elementRef.nativeElement;
            inkBar.style.left = positions.left;
            inkBar.style.width = positions.width;
        };
        return MatInkBar;
    }());
    MatInkBar.decorators = [
        { type: core.Directive, args: [{
                    selector: 'mat-ink-bar',
                    host: {
                        'class': 'mat-ink-bar',
                        '[class._mat-animation-noopable]': "_animationMode === 'NoopAnimations'",
                    },
                },] }
    ];
    MatInkBar.ctorParameters = function () { return [
        { type: core.ElementRef },
        { type: core.NgZone },
        { type: undefined, decorators: [{ type: core.Inject, args: [_MAT_INK_BAR_POSITIONER,] }] },
        { type: String, decorators: [{ type: core.Optional }, { type: core.Inject, args: [animations.ANIMATION_MODULE_TYPE,] }] }
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
     * Injection token that can be used to reference instances of `MatTabContent`. It serves as
     * alternative token to the actual `MatTabContent` class which could cause unnecessary
     * retention of the class and its directive metadata.
     */
    var MAT_TAB_CONTENT = new core.InjectionToken('MatTabContent');
    /** Decorates the `ng-template` tags and reads out the template from it. */
    var MatTabContent = /** @class */ (function () {
        function MatTabContent(
        /** Content for the tab. */ template) {
            this.template = template;
        }
        return MatTabContent;
    }());
    MatTabContent.decorators = [
        { type: core.Directive, args: [{
                    selector: '[matTabContent]',
                    providers: [{ provide: MAT_TAB_CONTENT, useExisting: MatTabContent }],
                },] }
    ];
    MatTabContent.ctorParameters = function () { return [
        { type: core.TemplateRef }
    ]; };

    /**
     * Injection token that can be used to reference instances of `MatTabLabel`. It serves as
     * alternative token to the actual `MatTabLabel` class which could cause unnecessary
     * retention of the class and its directive metadata.
     */
    var MAT_TAB_LABEL = new core.InjectionToken('MatTabLabel');
    /** Used to flag tab labels for use with the portal directive */
    var MatTabLabel = /** @class */ (function (_super) {
        __extends(MatTabLabel, _super);
        function MatTabLabel() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return MatTabLabel;
    }(portal.CdkPortal));
    MatTabLabel.decorators = [
        { type: core.Directive, args: [{
                    selector: '[mat-tab-label], [matTabLabel]',
                    providers: [{ provide: MAT_TAB_LABEL, useExisting: MatTabLabel }],
                },] }
    ];

    // Boilerplate for applying mixins to MatTab.
    /** @docs-private */
    var MatTabBase = /** @class */ (function () {
        function MatTabBase() {
        }
        return MatTabBase;
    }());
    var _MatTabMixinBase = core$1.mixinDisabled(MatTabBase);
    /**
     * Used to provide a tab group to a tab without causing a circular dependency.
     * @docs-private
     */
    var MAT_TAB_GROUP = new core.InjectionToken('MAT_TAB_GROUP');
    var MatTab = /** @class */ (function (_super) {
        __extends(MatTab, _super);
        function MatTab(_viewContainerRef, _closestTabGroup) {
            var _this = _super.call(this) || this;
            _this._viewContainerRef = _viewContainerRef;
            _this._closestTabGroup = _closestTabGroup;
            /** Plain text label for the tab, used when there is no template label. */
            _this.textLabel = '';
            /** Portal that will be the hosted content of the tab */
            _this._contentPortal = null;
            /** Emits whenever the internal state of the tab changes. */
            _this._stateChanges = new rxjs.Subject();
            /**
             * The relatively indexed position where 0 represents the center, negative is left, and positive
             * represents the right.
             */
            _this.position = null;
            /**
             * The initial relatively index origin of the tab if it was created and selected after there
             * was already a selected tab. Provides context of what position the tab should originate from.
             */
            _this.origin = null;
            /**
             * Whether the tab is currently active.
             */
            _this.isActive = false;
            return _this;
        }
        Object.defineProperty(MatTab.prototype, "templateLabel", {
            /** Content for the tab label given by `<ng-template mat-tab-label>`. */
            get: function () { return this._templateLabel; },
            set: function (value) { this._setTemplateLabelInput(value); },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatTab.prototype, "content", {
            /** @docs-private */
            get: function () {
                return this._contentPortal;
            },
            enumerable: false,
            configurable: true
        });
        MatTab.prototype.ngOnChanges = function (changes) {
            if (changes.hasOwnProperty('textLabel') || changes.hasOwnProperty('disabled')) {
                this._stateChanges.next();
            }
        };
        MatTab.prototype.ngOnDestroy = function () {
            this._stateChanges.complete();
        };
        MatTab.prototype.ngOnInit = function () {
            this._contentPortal = new portal.TemplatePortal(this._explicitContent || this._implicitContent, this._viewContainerRef);
        };
        /**
         * This has been extracted to a util because of TS 4 and VE.
         * View Engine doesn't support property rename inheritance.
         * TS 4.0 doesn't allow properties to override accessors or vice-versa.
         * @docs-private
         */
        MatTab.prototype._setTemplateLabelInput = function (value) {
            // Only update the templateLabel via query if there is actually
            // a MatTabLabel found. This works around an issue where a user may have
            // manually set `templateLabel` during creation mode, which would then get clobbered
            // by `undefined` when this query resolves.
            if (value) {
                this._templateLabel = value;
            }
        };
        return MatTab;
    }(_MatTabMixinBase));
    MatTab.decorators = [
        { type: core.Component, args: [{
                    selector: 'mat-tab',
                    template: "<!-- Create a template for the content of the <mat-tab> so that we can grab a reference to this\n    TemplateRef and use it in a Portal to render the tab content in the appropriate place in the\n    tab-group. -->\n<ng-template><ng-content></ng-content></ng-template>\n",
                    inputs: ['disabled'],
                    // tslint:disable-next-line:validate-decorators
                    changeDetection: core.ChangeDetectionStrategy.Default,
                    encapsulation: core.ViewEncapsulation.None,
                    exportAs: 'matTab'
                },] }
    ];
    MatTab.ctorParameters = function () { return [
        { type: core.ViewContainerRef },
        { type: undefined, decorators: [{ type: core.Inject, args: [MAT_TAB_GROUP,] }, { type: core.Optional }] }
    ]; };
    MatTab.propDecorators = {
        templateLabel: [{ type: core.ContentChild, args: [MAT_TAB_LABEL,] }],
        _explicitContent: [{ type: core.ContentChild, args: [MAT_TAB_CONTENT, { read: core.TemplateRef, static: true },] }],
        _implicitContent: [{ type: core.ViewChild, args: [core.TemplateRef, { static: true },] }],
        textLabel: [{ type: core.Input, args: ['label',] }],
        ariaLabel: [{ type: core.Input, args: ['aria-label',] }],
        ariaLabelledby: [{ type: core.Input, args: ['aria-labelledby',] }]
    };

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /**
     * Animations used by the Material tabs.
     * @docs-private
     */
    var matTabsAnimations = {
        /** Animation translates a tab along the X axis. */
        translateTab: animations$1.trigger('translateTab', [
            // Note: transitions to `none` instead of 0, because some browsers might blur the content.
            animations$1.state('center, void, left-origin-center, right-origin-center', animations$1.style({ transform: 'none' })),
            // If the tab is either on the left or right, we additionally add a `min-height` of 1px
            // in order to ensure that the element has a height before its state changes. This is
            // necessary because Chrome does seem to skip the transition in RTL mode if the element does
            // not have a static height and is not rendered. See related issue: #9465
            animations$1.state('left', animations$1.style({ transform: 'translate3d(-100%, 0, 0)', minHeight: '1px' })),
            animations$1.state('right', animations$1.style({ transform: 'translate3d(100%, 0, 0)', minHeight: '1px' })),
            animations$1.transition('* => left, * => right, left => center, right => center', animations$1.animate('{{animationDuration}} cubic-bezier(0.35, 0, 0.25, 1)')),
            animations$1.transition('void => left-origin-center', [
                animations$1.style({ transform: 'translate3d(-100%, 0, 0)' }),
                animations$1.animate('{{animationDuration}} cubic-bezier(0.35, 0, 0.25, 1)')
            ]),
            animations$1.transition('void => right-origin-center', [
                animations$1.style({ transform: 'translate3d(100%, 0, 0)' }),
                animations$1.animate('{{animationDuration}} cubic-bezier(0.35, 0, 0.25, 1)')
            ])
        ])
    };

    /**
     * The portal host directive for the contents of the tab.
     * @docs-private
     */
    var MatTabBodyPortal = /** @class */ (function (_super) {
        __extends(MatTabBodyPortal, _super);
        function MatTabBodyPortal(componentFactoryResolver, viewContainerRef, _host, _document) {
            var _this = _super.call(this, componentFactoryResolver, viewContainerRef, _document) || this;
            _this._host = _host;
            /** Subscription to events for when the tab body begins centering. */
            _this._centeringSub = rxjs.Subscription.EMPTY;
            /** Subscription to events for when the tab body finishes leaving from center position. */
            _this._leavingSub = rxjs.Subscription.EMPTY;
            return _this;
        }
        /** Set initial visibility or set up subscription for changing visibility. */
        MatTabBodyPortal.prototype.ngOnInit = function () {
            var _this = this;
            _super.prototype.ngOnInit.call(this);
            this._centeringSub = this._host._beforeCentering
                .pipe(operators.startWith(this._host._isCenterPosition(this._host._position)))
                .subscribe(function (isCentering) {
                if (isCentering && !_this.hasAttached()) {
                    _this.attach(_this._host._content);
                }
            });
            this._leavingSub = this._host._afterLeavingCenter.subscribe(function () {
                _this.detach();
            });
        };
        /** Clean up centering subscription. */
        MatTabBodyPortal.prototype.ngOnDestroy = function () {
            _super.prototype.ngOnDestroy.call(this);
            this._centeringSub.unsubscribe();
            this._leavingSub.unsubscribe();
        };
        return MatTabBodyPortal;
    }(portal.CdkPortalOutlet));
    MatTabBodyPortal.decorators = [
        { type: core.Directive, args: [{
                    selector: '[matTabBodyHost]'
                },] }
    ];
    MatTabBodyPortal.ctorParameters = function () { return [
        { type: core.ComponentFactoryResolver },
        { type: core.ViewContainerRef },
        { type: MatTabBody, decorators: [{ type: core.Inject, args: [core.forwardRef(function () { return MatTabBody; }),] }] },
        { type: undefined, decorators: [{ type: core.Inject, args: [common.DOCUMENT,] }] }
    ]; };
    /**
     * Base class with all of the `MatTabBody` functionality.
     * @docs-private
     */
    var _MatTabBodyBase = /** @class */ (function () {
        function _MatTabBodyBase(_elementRef, _dir, changeDetectorRef) {
            var _this = this;
            this._elementRef = _elementRef;
            this._dir = _dir;
            /** Subscription to the directionality change observable. */
            this._dirChangeSubscription = rxjs.Subscription.EMPTY;
            /** Emits when an animation on the tab is complete. */
            this._translateTabComplete = new rxjs.Subject();
            /** Event emitted when the tab begins to animate towards the center as the active tab. */
            this._onCentering = new core.EventEmitter();
            /** Event emitted before the centering of the tab begins. */
            this._beforeCentering = new core.EventEmitter();
            /** Event emitted before the centering of the tab begins. */
            this._afterLeavingCenter = new core.EventEmitter();
            /** Event emitted when the tab completes its animation towards the center. */
            this._onCentered = new core.EventEmitter(true);
            // Note that the default value will always be overwritten by `MatTabBody`, but we need one
            // anyway to prevent the animations module from throwing an error if the body is used on its own.
            /** Duration for the tab's animation. */
            this.animationDuration = '500ms';
            if (_dir) {
                this._dirChangeSubscription = _dir.change.subscribe(function (dir) {
                    _this._computePositionAnimationState(dir);
                    changeDetectorRef.markForCheck();
                });
            }
            // Ensure that we get unique animation events, because the `.done` callback can get
            // invoked twice in some browsers. See https://github.com/angular/angular/issues/24084.
            this._translateTabComplete.pipe(operators.distinctUntilChanged(function (x, y) {
                return x.fromState === y.fromState && x.toState === y.toState;
            })).subscribe(function (event) {
                // If the transition to the center is complete, emit an event.
                if (_this._isCenterPosition(event.toState) && _this._isCenterPosition(_this._position)) {
                    _this._onCentered.emit();
                }
                if (_this._isCenterPosition(event.fromState) && !_this._isCenterPosition(_this._position)) {
                    _this._afterLeavingCenter.emit();
                }
            });
        }
        Object.defineProperty(_MatTabBodyBase.prototype, "position", {
            /** The shifted index position of the tab body, where zero represents the active center tab. */
            set: function (position) {
                this._positionIndex = position;
                this._computePositionAnimationState();
            },
            enumerable: false,
            configurable: true
        });
        /**
         * After initialized, check if the content is centered and has an origin. If so, set the
         * special position states that transition the tab from the left or right before centering.
         */
        _MatTabBodyBase.prototype.ngOnInit = function () {
            if (this._position == 'center' && this.origin != null) {
                this._position = this._computePositionFromOrigin(this.origin);
            }
        };
        _MatTabBodyBase.prototype.ngOnDestroy = function () {
            this._dirChangeSubscription.unsubscribe();
            this._translateTabComplete.complete();
        };
        _MatTabBodyBase.prototype._onTranslateTabStarted = function (event) {
            var isCentering = this._isCenterPosition(event.toState);
            this._beforeCentering.emit(isCentering);
            if (isCentering) {
                this._onCentering.emit(this._elementRef.nativeElement.clientHeight);
            }
        };
        /** The text direction of the containing app. */
        _MatTabBodyBase.prototype._getLayoutDirection = function () {
            return this._dir && this._dir.value === 'rtl' ? 'rtl' : 'ltr';
        };
        /** Whether the provided position state is considered center, regardless of origin. */
        _MatTabBodyBase.prototype._isCenterPosition = function (position) {
            return position == 'center' ||
                position == 'left-origin-center' ||
                position == 'right-origin-center';
        };
        /** Computes the position state that will be used for the tab-body animation trigger. */
        _MatTabBodyBase.prototype._computePositionAnimationState = function (dir) {
            if (dir === void 0) { dir = this._getLayoutDirection(); }
            if (this._positionIndex < 0) {
                this._position = dir == 'ltr' ? 'left' : 'right';
            }
            else if (this._positionIndex > 0) {
                this._position = dir == 'ltr' ? 'right' : 'left';
            }
            else {
                this._position = 'center';
            }
        };
        /**
         * Computes the position state based on the specified origin position. This is used if the
         * tab is becoming visible immediately after creation.
         */
        _MatTabBodyBase.prototype._computePositionFromOrigin = function (origin) {
            var dir = this._getLayoutDirection();
            if ((dir == 'ltr' && origin <= 0) || (dir == 'rtl' && origin > 0)) {
                return 'left-origin-center';
            }
            return 'right-origin-center';
        };
        return _MatTabBodyBase;
    }());
    _MatTabBodyBase.decorators = [
        { type: core.Directive }
    ];
    _MatTabBodyBase.ctorParameters = function () { return [
        { type: core.ElementRef },
        { type: bidi.Directionality, decorators: [{ type: core.Optional }] },
        { type: core.ChangeDetectorRef }
    ]; };
    _MatTabBodyBase.propDecorators = {
        _onCentering: [{ type: core.Output }],
        _beforeCentering: [{ type: core.Output }],
        _afterLeavingCenter: [{ type: core.Output }],
        _onCentered: [{ type: core.Output }],
        _content: [{ type: core.Input, args: ['content',] }],
        origin: [{ type: core.Input }],
        animationDuration: [{ type: core.Input }],
        position: [{ type: core.Input }]
    };
    /**
     * Wrapper for the contents of a tab.
     * @docs-private
     */
    var MatTabBody = /** @class */ (function (_super) {
        __extends(MatTabBody, _super);
        function MatTabBody(elementRef, dir, changeDetectorRef) {
            return _super.call(this, elementRef, dir, changeDetectorRef) || this;
        }
        return MatTabBody;
    }(_MatTabBodyBase));
    MatTabBody.decorators = [
        { type: core.Component, args: [{
                    selector: 'mat-tab-body',
                    template: "<div class=\"mat-tab-body-content\" #content\n     [@translateTab]=\"{\n        value: _position,\n        params: {animationDuration: animationDuration}\n     }\"\n     (@translateTab.start)=\"_onTranslateTabStarted($event)\"\n     (@translateTab.done)=\"_translateTabComplete.next($event)\"\n     cdkScrollable>\n  <ng-template matTabBodyHost></ng-template>\n</div>\n",
                    encapsulation: core.ViewEncapsulation.None,
                    // tslint:disable-next-line:validate-decorators
                    changeDetection: core.ChangeDetectionStrategy.Default,
                    animations: [matTabsAnimations.translateTab],
                    host: {
                        'class': 'mat-tab-body',
                    },
                    styles: [".mat-tab-body-content{height:100%;overflow:auto}.mat-tab-group-dynamic-height .mat-tab-body-content{overflow:hidden}\n"]
                },] }
    ];
    MatTabBody.ctorParameters = function () { return [
        { type: core.ElementRef },
        { type: bidi.Directionality, decorators: [{ type: core.Optional }] },
        { type: core.ChangeDetectorRef }
    ]; };
    MatTabBody.propDecorators = {
        _portalHost: [{ type: core.ViewChild, args: [portal.CdkPortalOutlet,] }]
    };

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /** Injection token that can be used to provide the default options the tabs module. */
    var MAT_TABS_CONFIG = new core.InjectionToken('MAT_TABS_CONFIG');

    /** Used to generate unique ID's for each tab component */
    var nextId = 0;
    /** A simple change event emitted on focus or selection changes. */
    var MatTabChangeEvent = /** @class */ (function () {
        function MatTabChangeEvent() {
        }
        return MatTabChangeEvent;
    }());
    // Boilerplate for applying mixins to MatTabGroup.
    /** @docs-private */
    var MatTabGroupMixinBase = /** @class */ (function () {
        function MatTabGroupMixinBase(_elementRef) {
            this._elementRef = _elementRef;
        }
        return MatTabGroupMixinBase;
    }());
    var _MatTabGroupMixinBase = core$1.mixinColor(core$1.mixinDisableRipple(MatTabGroupMixinBase), 'primary');
    /**
     * Base class with all of the `MatTabGroupBase` functionality.
     * @docs-private
     */
    var _MatTabGroupBase = /** @class */ (function (_super) {
        __extends(_MatTabGroupBase, _super);
        function _MatTabGroupBase(elementRef, _changeDetectorRef, defaultConfig, _animationMode) {
            var _this = _super.call(this, elementRef) || this;
            _this._changeDetectorRef = _changeDetectorRef;
            _this._animationMode = _animationMode;
            /** All of the tabs that belong to the group. */
            _this._tabs = new core.QueryList();
            /** The tab index that should be selected after the content has been checked. */
            _this._indexToSelect = 0;
            /** Snapshot of the height of the tab body wrapper before another tab is activated. */
            _this._tabBodyWrapperHeight = 0;
            /** Subscription to tabs being added/removed. */
            _this._tabsSubscription = rxjs.Subscription.EMPTY;
            /** Subscription to changes in the tab labels. */
            _this._tabLabelSubscription = rxjs.Subscription.EMPTY;
            _this._selectedIndex = null;
            /** Position of the tab header. */
            _this.headerPosition = 'above';
            /** Output to enable support for two-way binding on `[(selectedIndex)]` */
            _this.selectedIndexChange = new core.EventEmitter();
            /** Event emitted when focus has changed within a tab group. */
            _this.focusChange = new core.EventEmitter();
            /** Event emitted when the body animation has completed */
            _this.animationDone = new core.EventEmitter();
            /** Event emitted when the tab selection has changed. */
            _this.selectedTabChange = new core.EventEmitter(true);
            _this._groupId = nextId++;
            _this.animationDuration = defaultConfig && defaultConfig.animationDuration ?
                defaultConfig.animationDuration : '500ms';
            _this.disablePagination = defaultConfig && defaultConfig.disablePagination != null ?
                defaultConfig.disablePagination : false;
            _this.dynamicHeight = defaultConfig && defaultConfig.dynamicHeight != null ?
                defaultConfig.dynamicHeight : false;
            return _this;
        }
        Object.defineProperty(_MatTabGroupBase.prototype, "dynamicHeight", {
            /** Whether the tab group should grow to the size of the active tab. */
            get: function () { return this._dynamicHeight; },
            set: function (value) { this._dynamicHeight = coercion.coerceBooleanProperty(value); },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(_MatTabGroupBase.prototype, "selectedIndex", {
            /** The index of the active tab. */
            get: function () { return this._selectedIndex; },
            set: function (value) {
                this._indexToSelect = coercion.coerceNumberProperty(value, null);
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(_MatTabGroupBase.prototype, "animationDuration", {
            /** Duration for the tab animation. Will be normalized to milliseconds if no units are set. */
            get: function () { return this._animationDuration; },
            set: function (value) {
                this._animationDuration = /^\d+$/.test(value) ? value + 'ms' : value;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(_MatTabGroupBase.prototype, "backgroundColor", {
            /** Background color of the tab group. */
            get: function () { return this._backgroundColor; },
            set: function (value) {
                var nativeElement = this._elementRef.nativeElement;
                nativeElement.classList.remove("mat-background-" + this.backgroundColor);
                if (value) {
                    nativeElement.classList.add("mat-background-" + value);
                }
                this._backgroundColor = value;
            },
            enumerable: false,
            configurable: true
        });
        /**
         * After the content is checked, this component knows what tabs have been defined
         * and what the selected index should be. This is where we can know exactly what position
         * each tab should be in according to the new selected index, and additionally we know how
         * a new selected tab should transition in (from the left or right).
         */
        _MatTabGroupBase.prototype.ngAfterContentChecked = function () {
            var _this = this;
            // Don't clamp the `indexToSelect` immediately in the setter because it can happen that
            // the amount of tabs changes before the actual change detection runs.
            var indexToSelect = this._indexToSelect = this._clampTabIndex(this._indexToSelect);
            // If there is a change in selected index, emit a change event. Should not trigger if
            // the selected index has not yet been initialized.
            if (this._selectedIndex != indexToSelect) {
                var isFirstRun_1 = this._selectedIndex == null;
                if (!isFirstRun_1) {
                    this.selectedTabChange.emit(this._createChangeEvent(indexToSelect));
                    // Preserve the height so page doesn't scroll up during tab change.
                    // Fixes https://stackblitz.com/edit/mat-tabs-scroll-page-top-on-tab-change
                    var wrapper = this._tabBodyWrapper.nativeElement;
                    wrapper.style.minHeight = wrapper.clientHeight + 'px';
                }
                // Changing these values after change detection has run
                // since the checked content may contain references to them.
                Promise.resolve().then(function () {
                    _this._tabs.forEach(function (tab, index) { return tab.isActive = index === indexToSelect; });
                    if (!isFirstRun_1) {
                        _this.selectedIndexChange.emit(indexToSelect);
                        // Clear the min-height, this was needed during tab change to avoid
                        // unnecessary scrolling.
                        _this._tabBodyWrapper.nativeElement.style.minHeight = '';
                    }
                });
            }
            // Setup the position for each tab and optionally setup an origin on the next selected tab.
            this._tabs.forEach(function (tab, index) {
                tab.position = index - indexToSelect;
                // If there is already a selected tab, then set up an origin for the next selected tab
                // if it doesn't have one already.
                if (_this._selectedIndex != null && tab.position == 0 && !tab.origin) {
                    tab.origin = indexToSelect - _this._selectedIndex;
                }
            });
            if (this._selectedIndex !== indexToSelect) {
                this._selectedIndex = indexToSelect;
                this._changeDetectorRef.markForCheck();
            }
        };
        _MatTabGroupBase.prototype.ngAfterContentInit = function () {
            var _this = this;
            this._subscribeToAllTabChanges();
            this._subscribeToTabLabels();
            // Subscribe to changes in the amount of tabs, in order to be
            // able to re-render the content as new tabs are added or removed.
            this._tabsSubscription = this._tabs.changes.subscribe(function () {
                var indexToSelect = _this._clampTabIndex(_this._indexToSelect);
                // Maintain the previously-selected tab if a new tab is added or removed and there is no
                // explicit change that selects a different tab.
                if (indexToSelect === _this._selectedIndex) {
                    var tabs = _this._tabs.toArray();
                    for (var i = 0; i < tabs.length; i++) {
                        if (tabs[i].isActive) {
                            // Assign both to the `_indexToSelect` and `_selectedIndex` so we don't fire a changed
                            // event, otherwise the consumer may end up in an infinite loop in some edge cases like
                            // adding a tab within the `selectedIndexChange` event.
                            _this._indexToSelect = _this._selectedIndex = i;
                            break;
                        }
                    }
                }
                _this._changeDetectorRef.markForCheck();
            });
        };
        /** Listens to changes in all of the tabs. */
        _MatTabGroupBase.prototype._subscribeToAllTabChanges = function () {
            var _this = this;
            // Since we use a query with `descendants: true` to pick up the tabs, we may end up catching
            // some that are inside of nested tab groups. We filter them out manually by checking that
            // the closest group to the tab is the current one.
            this._allTabs.changes
                .pipe(operators.startWith(this._allTabs))
                .subscribe(function (tabs) {
                _this._tabs.reset(tabs.filter(function (tab) {
                    return tab._closestTabGroup === _this || !tab._closestTabGroup;
                }));
                _this._tabs.notifyOnChanges();
            });
        };
        _MatTabGroupBase.prototype.ngOnDestroy = function () {
            this._tabs.destroy();
            this._tabsSubscription.unsubscribe();
            this._tabLabelSubscription.unsubscribe();
        };
        /** Re-aligns the ink bar to the selected tab element. */
        _MatTabGroupBase.prototype.realignInkBar = function () {
            if (this._tabHeader) {
                this._tabHeader._alignInkBarToSelectedTab();
            }
        };
        /**
         * Sets focus to a particular tab.
         * @param index Index of the tab to be focused.
         */
        _MatTabGroupBase.prototype.focusTab = function (index) {
            var header = this._tabHeader;
            if (header) {
                header.focusIndex = index;
            }
        };
        _MatTabGroupBase.prototype._focusChanged = function (index) {
            this.focusChange.emit(this._createChangeEvent(index));
        };
        _MatTabGroupBase.prototype._createChangeEvent = function (index) {
            var event = new MatTabChangeEvent;
            event.index = index;
            if (this._tabs && this._tabs.length) {
                event.tab = this._tabs.toArray()[index];
            }
            return event;
        };
        /**
         * Subscribes to changes in the tab labels. This is needed, because the @Input for the label is
         * on the MatTab component, whereas the data binding is inside the MatTabGroup. In order for the
         * binding to be updated, we need to subscribe to changes in it and trigger change detection
         * manually.
         */
        _MatTabGroupBase.prototype._subscribeToTabLabels = function () {
            var _this = this;
            if (this._tabLabelSubscription) {
                this._tabLabelSubscription.unsubscribe();
            }
            this._tabLabelSubscription = rxjs.merge.apply(void 0, __spreadArray([], __read(this._tabs.map(function (tab) { return tab._stateChanges; })))).subscribe(function () { return _this._changeDetectorRef.markForCheck(); });
        };
        /** Clamps the given index to the bounds of 0 and the tabs length. */
        _MatTabGroupBase.prototype._clampTabIndex = function (index) {
            // Note the `|| 0`, which ensures that values like NaN can't get through
            // and which would otherwise throw the component into an infinite loop
            // (since Math.max(NaN, 0) === NaN).
            return Math.min(this._tabs.length - 1, Math.max(index || 0, 0));
        };
        /** Returns a unique id for each tab label element */
        _MatTabGroupBase.prototype._getTabLabelId = function (i) {
            return "mat-tab-label-" + this._groupId + "-" + i;
        };
        /** Returns a unique id for each tab content element */
        _MatTabGroupBase.prototype._getTabContentId = function (i) {
            return "mat-tab-content-" + this._groupId + "-" + i;
        };
        /**
         * Sets the height of the body wrapper to the height of the activating tab if dynamic
         * height property is true.
         */
        _MatTabGroupBase.prototype._setTabBodyWrapperHeight = function (tabHeight) {
            if (!this._dynamicHeight || !this._tabBodyWrapperHeight) {
                return;
            }
            var wrapper = this._tabBodyWrapper.nativeElement;
            wrapper.style.height = this._tabBodyWrapperHeight + 'px';
            // This conditional forces the browser to paint the height so that
            // the animation to the new height can have an origin.
            if (this._tabBodyWrapper.nativeElement.offsetHeight) {
                wrapper.style.height = tabHeight + 'px';
            }
        };
        /** Removes the height of the tab body wrapper. */
        _MatTabGroupBase.prototype._removeTabBodyWrapperHeight = function () {
            var wrapper = this._tabBodyWrapper.nativeElement;
            this._tabBodyWrapperHeight = wrapper.clientHeight;
            wrapper.style.height = '';
            this.animationDone.emit();
        };
        /** Handle click events, setting new selected index if appropriate. */
        _MatTabGroupBase.prototype._handleClick = function (tab, tabHeader, index) {
            if (!tab.disabled) {
                this.selectedIndex = tabHeader.focusIndex = index;
            }
        };
        /** Retrieves the tabindex for the tab. */
        _MatTabGroupBase.prototype._getTabIndex = function (tab, idx) {
            if (tab.disabled) {
                return null;
            }
            return this.selectedIndex === idx ? 0 : -1;
        };
        /** Callback for when the focused state of a tab has changed. */
        _MatTabGroupBase.prototype._tabFocusChanged = function (focusOrigin, index) {
            if (focusOrigin) {
                this._tabHeader.focusIndex = index;
            }
        };
        return _MatTabGroupBase;
    }(_MatTabGroupMixinBase));
    _MatTabGroupBase.decorators = [
        { type: core.Directive }
    ];
    _MatTabGroupBase.ctorParameters = function () { return [
        { type: core.ElementRef },
        { type: core.ChangeDetectorRef },
        { type: undefined, decorators: [{ type: core.Inject, args: [MAT_TABS_CONFIG,] }, { type: core.Optional }] },
        { type: String, decorators: [{ type: core.Optional }, { type: core.Inject, args: [animations.ANIMATION_MODULE_TYPE,] }] }
    ]; };
    _MatTabGroupBase.propDecorators = {
        dynamicHeight: [{ type: core.Input }],
        selectedIndex: [{ type: core.Input }],
        headerPosition: [{ type: core.Input }],
        animationDuration: [{ type: core.Input }],
        disablePagination: [{ type: core.Input }],
        backgroundColor: [{ type: core.Input }],
        selectedIndexChange: [{ type: core.Output }],
        focusChange: [{ type: core.Output }],
        animationDone: [{ type: core.Output }],
        selectedTabChange: [{ type: core.Output }]
    };
    /**
     * Material design tab-group component. Supports basic tab pairs (label + content) and includes
     * animated ink-bar, keyboard navigation, and screen reader.
     * See: https://material.io/design/components/tabs.html
     */
    var MatTabGroup = /** @class */ (function (_super) {
        __extends(MatTabGroup, _super);
        function MatTabGroup(elementRef, changeDetectorRef, defaultConfig, animationMode) {
            return _super.call(this, elementRef, changeDetectorRef, defaultConfig, animationMode) || this;
        }
        return MatTabGroup;
    }(_MatTabGroupBase));
    MatTabGroup.decorators = [
        { type: core.Component, args: [{
                    selector: 'mat-tab-group',
                    exportAs: 'matTabGroup',
                    template: "<mat-tab-header #tabHeader\n               [selectedIndex]=\"selectedIndex || 0\"\n               [disableRipple]=\"disableRipple\"\n               [disablePagination]=\"disablePagination\"\n               (indexFocused)=\"_focusChanged($event)\"\n               (selectFocusedIndex)=\"selectedIndex = $event\">\n  <div class=\"mat-tab-label mat-focus-indicator\" role=\"tab\" matTabLabelWrapper mat-ripple cdkMonitorElementFocus\n       *ngFor=\"let tab of _tabs; let i = index\"\n       [id]=\"_getTabLabelId(i)\"\n       [attr.tabIndex]=\"_getTabIndex(tab, i)\"\n       [attr.aria-posinset]=\"i + 1\"\n       [attr.aria-setsize]=\"_tabs.length\"\n       [attr.aria-controls]=\"_getTabContentId(i)\"\n       [attr.aria-selected]=\"selectedIndex == i\"\n       [attr.aria-label]=\"tab.ariaLabel || null\"\n       [attr.aria-labelledby]=\"(!tab.ariaLabel && tab.ariaLabelledby) ? tab.ariaLabelledby : null\"\n       [class.mat-tab-label-active]=\"selectedIndex == i\"\n       [disabled]=\"tab.disabled\"\n       [matRippleDisabled]=\"tab.disabled || disableRipple\"\n       (click)=\"_handleClick(tab, tabHeader, i)\"\n       (cdkFocusChange)=\"_tabFocusChanged($event, i)\">\n\n\n    <div class=\"mat-tab-label-content\">\n      <!-- If there is a label template, use it. -->\n      <ng-template [ngIf]=\"tab.templateLabel\">\n        <ng-template [cdkPortalOutlet]=\"tab.templateLabel\"></ng-template>\n      </ng-template>\n\n      <!-- If there is not a label template, fall back to the text label. -->\n      <ng-template [ngIf]=\"!tab.templateLabel\">{{tab.textLabel}}</ng-template>\n    </div>\n  </div>\n</mat-tab-header>\n\n<div\n  class=\"mat-tab-body-wrapper\"\n  [class._mat-animation-noopable]=\"_animationMode === 'NoopAnimations'\"\n  #tabBodyWrapper>\n  <mat-tab-body role=\"tabpanel\"\n               *ngFor=\"let tab of _tabs; let i = index\"\n               [id]=\"_getTabContentId(i)\"\n               [attr.aria-labelledby]=\"_getTabLabelId(i)\"\n               [class.mat-tab-body-active]=\"selectedIndex == i\"\n               [content]=\"tab.content!\"\n               [position]=\"tab.position!\"\n               [origin]=\"tab.origin\"\n               [animationDuration]=\"animationDuration\"\n               (_onCentered)=\"_removeTabBodyWrapperHeight()\"\n               (_onCentering)=\"_setTabBodyWrapperHeight($event)\">\n  </mat-tab-body>\n</div>\n",
                    encapsulation: core.ViewEncapsulation.None,
                    // tslint:disable-next-line:validate-decorators
                    changeDetection: core.ChangeDetectionStrategy.Default,
                    inputs: ['color', 'disableRipple'],
                    providers: [{
                            provide: MAT_TAB_GROUP,
                            useExisting: MatTabGroup
                        }],
                    host: {
                        'class': 'mat-tab-group',
                        '[class.mat-tab-group-dynamic-height]': 'dynamicHeight',
                        '[class.mat-tab-group-inverted-header]': 'headerPosition === "below"',
                    },
                    styles: [".mat-tab-group{display:flex;flex-direction:column}.mat-tab-group.mat-tab-group-inverted-header{flex-direction:column-reverse}.mat-tab-label{height:48px;padding:0 24px;cursor:pointer;box-sizing:border-box;opacity:.6;min-width:160px;text-align:center;display:inline-flex;justify-content:center;align-items:center;white-space:nowrap;position:relative}.mat-tab-label:focus{outline:none}.mat-tab-label:focus:not(.mat-tab-disabled){opacity:1}.cdk-high-contrast-active .mat-tab-label:focus{outline:dotted 2px;outline-offset:-2px}.mat-tab-label.mat-tab-disabled{cursor:default}.cdk-high-contrast-active .mat-tab-label.mat-tab-disabled{opacity:.5}.mat-tab-label .mat-tab-label-content{display:inline-flex;justify-content:center;align-items:center;white-space:nowrap}.cdk-high-contrast-active .mat-tab-label{opacity:1}@media(max-width: 599px){.mat-tab-label{padding:0 12px}}@media(max-width: 959px){.mat-tab-label{padding:0 12px}}.mat-tab-group[mat-stretch-tabs]>.mat-tab-header .mat-tab-label{flex-basis:0;flex-grow:1}.mat-tab-body-wrapper{position:relative;overflow:hidden;display:flex;transition:height 500ms cubic-bezier(0.35, 0, 0.25, 1)}._mat-animation-noopable.mat-tab-body-wrapper{transition:none;animation:none}.mat-tab-body{top:0;left:0;right:0;bottom:0;position:absolute;display:block;overflow:hidden;flex-basis:100%}.mat-tab-body.mat-tab-body-active{position:relative;overflow-x:hidden;overflow-y:auto;z-index:1;flex-grow:1}.mat-tab-group.mat-tab-group-dynamic-height .mat-tab-body.mat-tab-body-active{overflow-y:hidden}\n"]
                },] }
    ];
    MatTabGroup.ctorParameters = function () { return [
        { type: core.ElementRef },
        { type: core.ChangeDetectorRef },
        { type: undefined, decorators: [{ type: core.Inject, args: [MAT_TABS_CONFIG,] }, { type: core.Optional }] },
        { type: String, decorators: [{ type: core.Optional }, { type: core.Inject, args: [animations.ANIMATION_MODULE_TYPE,] }] }
    ]; };
    MatTabGroup.propDecorators = {
        _allTabs: [{ type: core.ContentChildren, args: [MatTab, { descendants: true },] }],
        _tabBodyWrapper: [{ type: core.ViewChild, args: ['tabBodyWrapper',] }],
        _tabHeader: [{ type: core.ViewChild, args: ['tabHeader',] }]
    };

    // Boilerplate for applying mixins to MatTabLabelWrapper.
    /** @docs-private */
    var MatTabLabelWrapperBase = /** @class */ (function () {
        function MatTabLabelWrapperBase() {
        }
        return MatTabLabelWrapperBase;
    }());
    var _MatTabLabelWrapperMixinBase = core$1.mixinDisabled(MatTabLabelWrapperBase);
    /**
     * Used in the `mat-tab-group` view to display tab labels.
     * @docs-private
     */
    var MatTabLabelWrapper = /** @class */ (function (_super) {
        __extends(MatTabLabelWrapper, _super);
        function MatTabLabelWrapper(elementRef) {
            var _this = _super.call(this) || this;
            _this.elementRef = elementRef;
            return _this;
        }
        /** Sets focus on the wrapper element */
        MatTabLabelWrapper.prototype.focus = function () {
            this.elementRef.nativeElement.focus();
        };
        MatTabLabelWrapper.prototype.getOffsetLeft = function () {
            return this.elementRef.nativeElement.offsetLeft;
        };
        MatTabLabelWrapper.prototype.getOffsetWidth = function () {
            return this.elementRef.nativeElement.offsetWidth;
        };
        return MatTabLabelWrapper;
    }(_MatTabLabelWrapperMixinBase));
    MatTabLabelWrapper.decorators = [
        { type: core.Directive, args: [{
                    selector: '[matTabLabelWrapper]',
                    inputs: ['disabled'],
                    host: {
                        '[class.mat-tab-disabled]': 'disabled',
                        '[attr.aria-disabled]': '!!disabled',
                    }
                },] }
    ];
    MatTabLabelWrapper.ctorParameters = function () { return [
        { type: core.ElementRef }
    ]; };

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /** Config used to bind passive event listeners */
    var passiveEventListenerOptions = platform.normalizePassiveListenerOptions({ passive: true });
    /**
     * The distance in pixels that will be overshot when scrolling a tab label into view. This helps
     * provide a small affordance to the label next to it.
     */
    var EXAGGERATED_OVERSCROLL = 60;
    /**
     * Amount of milliseconds to wait before starting to scroll the header automatically.
     * Set a little conservatively in order to handle fake events dispatched on touch devices.
     */
    var HEADER_SCROLL_DELAY = 650;
    /**
     * Interval in milliseconds at which to scroll the header
     * while the user is holding their pointer.
     */
    var HEADER_SCROLL_INTERVAL = 100;
    /**
     * Base class for a tab header that supported pagination.
     * @docs-private
     */
    var MatPaginatedTabHeader = /** @class */ (function () {
        function MatPaginatedTabHeader(_elementRef, _changeDetectorRef, _viewportRuler, _dir, _ngZone, _platform, _animationMode) {
            var _this = this;
            this._elementRef = _elementRef;
            this._changeDetectorRef = _changeDetectorRef;
            this._viewportRuler = _viewportRuler;
            this._dir = _dir;
            this._ngZone = _ngZone;
            this._platform = _platform;
            this._animationMode = _animationMode;
            /** The distance in pixels that the tab labels should be translated to the left. */
            this._scrollDistance = 0;
            /** Whether the header should scroll to the selected index after the view has been checked. */
            this._selectedIndexChanged = false;
            /** Emits when the component is destroyed. */
            this._destroyed = new rxjs.Subject();
            /** Whether the controls for pagination should be displayed */
            this._showPaginationControls = false;
            /** Whether the tab list can be scrolled more towards the end of the tab label list. */
            this._disableScrollAfter = true;
            /** Whether the tab list can be scrolled more towards the beginning of the tab label list. */
            this._disableScrollBefore = true;
            /** Stream that will stop the automated scrolling. */
            this._stopScrolling = new rxjs.Subject();
            /**
             * Whether pagination should be disabled. This can be used to avoid unnecessary
             * layout recalculations if it's known that pagination won't be required.
             */
            this.disablePagination = false;
            this._selectedIndex = 0;
            /** Event emitted when the option is selected. */
            this.selectFocusedIndex = new core.EventEmitter();
            /** Event emitted when a label is focused. */
            this.indexFocused = new core.EventEmitter();
            // Bind the `mouseleave` event on the outside since it doesn't change anything in the view.
            _ngZone.runOutsideAngular(function () {
                rxjs.fromEvent(_elementRef.nativeElement, 'mouseleave')
                    .pipe(operators.takeUntil(_this._destroyed))
                    .subscribe(function () {
                    _this._stopInterval();
                });
            });
        }
        Object.defineProperty(MatPaginatedTabHeader.prototype, "selectedIndex", {
            /** The index of the active tab. */
            get: function () { return this._selectedIndex; },
            set: function (value) {
                value = coercion.coerceNumberProperty(value);
                if (this._selectedIndex != value) {
                    this._selectedIndexChanged = true;
                    this._selectedIndex = value;
                    if (this._keyManager) {
                        this._keyManager.updateActiveItem(value);
                    }
                }
            },
            enumerable: false,
            configurable: true
        });
        MatPaginatedTabHeader.prototype.ngAfterViewInit = function () {
            var _this = this;
            // We need to handle these events manually, because we want to bind passive event listeners.
            rxjs.fromEvent(this._previousPaginator.nativeElement, 'touchstart', passiveEventListenerOptions)
                .pipe(operators.takeUntil(this._destroyed))
                .subscribe(function () {
                _this._handlePaginatorPress('before');
            });
            rxjs.fromEvent(this._nextPaginator.nativeElement, 'touchstart', passiveEventListenerOptions)
                .pipe(operators.takeUntil(this._destroyed))
                .subscribe(function () {
                _this._handlePaginatorPress('after');
            });
        };
        MatPaginatedTabHeader.prototype.ngAfterContentInit = function () {
            var _this = this;
            var dirChange = this._dir ? this._dir.change : rxjs.of('ltr');
            var resize = this._viewportRuler.change(150);
            var realign = function () {
                _this.updatePagination();
                _this._alignInkBarToSelectedTab();
            };
            this._keyManager = new a11y.FocusKeyManager(this._items)
                .withHorizontalOrientation(this._getLayoutDirection())
                .withHomeAndEnd()
                .withWrap();
            this._keyManager.updateActiveItem(this._selectedIndex);
            // Defer the first call in order to allow for slower browsers to lay out the elements.
            // This helps in cases where the user lands directly on a page with paginated tabs.
            typeof requestAnimationFrame !== 'undefined' ? requestAnimationFrame(realign) : realign();
            // On dir change or window resize, realign the ink bar and update the orientation of
            // the key manager if the direction has changed.
            rxjs.merge(dirChange, resize, this._items.changes).pipe(operators.takeUntil(this._destroyed)).subscribe(function () {
                // We need to defer this to give the browser some time to recalculate
                // the element dimensions. The call has to be wrapped in `NgZone.run`,
                // because the viewport change handler runs outside of Angular.
                _this._ngZone.run(function () { return Promise.resolve().then(realign); });
                _this._keyManager.withHorizontalOrientation(_this._getLayoutDirection());
            });
            // If there is a change in the focus key manager we need to emit the `indexFocused`
            // event in order to provide a public event that notifies about focus changes. Also we realign
            // the tabs container by scrolling the new focused tab into the visible section.
            this._keyManager.change.pipe(operators.takeUntil(this._destroyed)).subscribe(function (newFocusIndex) {
                _this.indexFocused.emit(newFocusIndex);
                _this._setTabFocus(newFocusIndex);
            });
        };
        MatPaginatedTabHeader.prototype.ngAfterContentChecked = function () {
            // If the number of tab labels have changed, check if scrolling should be enabled
            if (this._tabLabelCount != this._items.length) {
                this.updatePagination();
                this._tabLabelCount = this._items.length;
                this._changeDetectorRef.markForCheck();
            }
            // If the selected index has changed, scroll to the label and check if the scrolling controls
            // should be disabled.
            if (this._selectedIndexChanged) {
                this._scrollToLabel(this._selectedIndex);
                this._checkScrollingControls();
                this._alignInkBarToSelectedTab();
                this._selectedIndexChanged = false;
                this._changeDetectorRef.markForCheck();
            }
            // If the scroll distance has been changed (tab selected, focused, scroll controls activated),
            // then translate the header to reflect this.
            if (this._scrollDistanceChanged) {
                this._updateTabScrollPosition();
                this._scrollDistanceChanged = false;
                this._changeDetectorRef.markForCheck();
            }
        };
        MatPaginatedTabHeader.prototype.ngOnDestroy = function () {
            this._destroyed.next();
            this._destroyed.complete();
            this._stopScrolling.complete();
        };
        /** Handles keyboard events on the header. */
        MatPaginatedTabHeader.prototype._handleKeydown = function (event) {
            // We don't handle any key bindings with a modifier key.
            if (keycodes.hasModifierKey(event)) {
                return;
            }
            switch (event.keyCode) {
                case keycodes.ENTER:
                case keycodes.SPACE:
                    if (this.focusIndex !== this.selectedIndex) {
                        this.selectFocusedIndex.emit(this.focusIndex);
                        this._itemSelected(event);
                    }
                    break;
                default:
                    this._keyManager.onKeydown(event);
            }
        };
        /**
         * Callback for when the MutationObserver detects that the content has changed.
         */
        MatPaginatedTabHeader.prototype._onContentChanges = function () {
            var _this = this;
            var textContent = this._elementRef.nativeElement.textContent;
            // We need to diff the text content of the header, because the MutationObserver callback
            // will fire even if the text content didn't change which is inefficient and is prone
            // to infinite loops if a poorly constructed expression is passed in (see #14249).
            if (textContent !== this._currentTextContent) {
                this._currentTextContent = textContent || '';
                // The content observer runs outside the `NgZone` by default, which
                // means that we need to bring the callback back in ourselves.
                this._ngZone.run(function () {
                    _this.updatePagination();
                    _this._alignInkBarToSelectedTab();
                    _this._changeDetectorRef.markForCheck();
                });
            }
        };
        /**
         * Updates the view whether pagination should be enabled or not.
         *
         * WARNING: Calling this method can be very costly in terms of performance. It should be called
         * as infrequently as possible from outside of the Tabs component as it causes a reflow of the
         * page.
         */
        MatPaginatedTabHeader.prototype.updatePagination = function () {
            this._checkPaginationEnabled();
            this._checkScrollingControls();
            this._updateTabScrollPosition();
        };
        Object.defineProperty(MatPaginatedTabHeader.prototype, "focusIndex", {
            /** Tracks which element has focus; used for keyboard navigation */
            get: function () {
                return this._keyManager ? this._keyManager.activeItemIndex : 0;
            },
            /** When the focus index is set, we must manually send focus to the correct label */
            set: function (value) {
                if (!this._isValidIndex(value) || this.focusIndex === value || !this._keyManager) {
                    return;
                }
                this._keyManager.setActiveItem(value);
            },
            enumerable: false,
            configurable: true
        });
        /**
         * Determines if an index is valid.  If the tabs are not ready yet, we assume that the user is
         * providing a valid index and return true.
         */
        MatPaginatedTabHeader.prototype._isValidIndex = function (index) {
            if (!this._items) {
                return true;
            }
            var tab = this._items ? this._items.toArray()[index] : null;
            return !!tab && !tab.disabled;
        };
        /**
         * Sets focus on the HTML element for the label wrapper and scrolls it into the view if
         * scrolling is enabled.
         */
        MatPaginatedTabHeader.prototype._setTabFocus = function (tabIndex) {
            if (this._showPaginationControls) {
                this._scrollToLabel(tabIndex);
            }
            if (this._items && this._items.length) {
                this._items.toArray()[tabIndex].focus();
                // Do not let the browser manage scrolling to focus the element, this will be handled
                // by using translation. In LTR, the scroll left should be 0. In RTL, the scroll width
                // should be the full width minus the offset width.
                var containerEl = this._tabListContainer.nativeElement;
                var dir = this._getLayoutDirection();
                if (dir == 'ltr') {
                    containerEl.scrollLeft = 0;
                }
                else {
                    containerEl.scrollLeft = containerEl.scrollWidth - containerEl.offsetWidth;
                }
            }
        };
        /** The layout direction of the containing app. */
        MatPaginatedTabHeader.prototype._getLayoutDirection = function () {
            return this._dir && this._dir.value === 'rtl' ? 'rtl' : 'ltr';
        };
        /** Performs the CSS transformation on the tab list that will cause the list to scroll. */
        MatPaginatedTabHeader.prototype._updateTabScrollPosition = function () {
            if (this.disablePagination) {
                return;
            }
            var scrollDistance = this.scrollDistance;
            var translateX = this._getLayoutDirection() === 'ltr' ? -scrollDistance : scrollDistance;
            // Don't use `translate3d` here because we don't want to create a new layer. A new layer
            // seems to cause flickering and overflow in Internet Explorer. For example, the ink bar
            // and ripples will exceed the boundaries of the visible tab bar.
            // See: https://github.com/angular/components/issues/10276
            // We round the `transform` here, because transforms with sub-pixel precision cause some
            // browsers to blur the content of the element.
            this._tabList.nativeElement.style.transform = "translateX(" + Math.round(translateX) + "px)";
            // Setting the `transform` on IE will change the scroll offset of the parent, causing the
            // position to be thrown off in some cases. We have to reset it ourselves to ensure that
            // it doesn't get thrown off. Note that we scope it only to IE and Edge, because messing
            // with the scroll position throws off Chrome 71+ in RTL mode (see #14689).
            if (this._platform.TRIDENT || this._platform.EDGE) {
                this._tabListContainer.nativeElement.scrollLeft = 0;
            }
        };
        Object.defineProperty(MatPaginatedTabHeader.prototype, "scrollDistance", {
            /** Sets the distance in pixels that the tab header should be transformed in the X-axis. */
            get: function () { return this._scrollDistance; },
            set: function (value) {
                this._scrollTo(value);
            },
            enumerable: false,
            configurable: true
        });
        /**
         * Moves the tab list in the 'before' or 'after' direction (towards the beginning of the list or
         * the end of the list, respectively). The distance to scroll is computed to be a third of the
         * length of the tab list view window.
         *
         * This is an expensive call that forces a layout reflow to compute box and scroll metrics and
         * should be called sparingly.
         */
        MatPaginatedTabHeader.prototype._scrollHeader = function (direction) {
            var viewLength = this._tabListContainer.nativeElement.offsetWidth;
            // Move the scroll distance one-third the length of the tab list's viewport.
            var scrollAmount = (direction == 'before' ? -1 : 1) * viewLength / 3;
            return this._scrollTo(this._scrollDistance + scrollAmount);
        };
        /** Handles click events on the pagination arrows. */
        MatPaginatedTabHeader.prototype._handlePaginatorClick = function (direction) {
            this._stopInterval();
            this._scrollHeader(direction);
        };
        /**
         * Moves the tab list such that the desired tab label (marked by index) is moved into view.
         *
         * This is an expensive call that forces a layout reflow to compute box and scroll metrics and
         * should be called sparingly.
         */
        MatPaginatedTabHeader.prototype._scrollToLabel = function (labelIndex) {
            if (this.disablePagination) {
                return;
            }
            var selectedLabel = this._items ? this._items.toArray()[labelIndex] : null;
            if (!selectedLabel) {
                return;
            }
            // The view length is the visible width of the tab labels.
            var viewLength = this._tabListContainer.nativeElement.offsetWidth;
            var _a = selectedLabel.elementRef.nativeElement, offsetLeft = _a.offsetLeft, offsetWidth = _a.offsetWidth;
            var labelBeforePos, labelAfterPos;
            if (this._getLayoutDirection() == 'ltr') {
                labelBeforePos = offsetLeft;
                labelAfterPos = labelBeforePos + offsetWidth;
            }
            else {
                labelAfterPos = this._tabList.nativeElement.offsetWidth - offsetLeft;
                labelBeforePos = labelAfterPos - offsetWidth;
            }
            var beforeVisiblePos = this.scrollDistance;
            var afterVisiblePos = this.scrollDistance + viewLength;
            if (labelBeforePos < beforeVisiblePos) {
                // Scroll header to move label to the before direction
                this.scrollDistance -= beforeVisiblePos - labelBeforePos + EXAGGERATED_OVERSCROLL;
            }
            else if (labelAfterPos > afterVisiblePos) {
                // Scroll header to move label to the after direction
                this.scrollDistance += labelAfterPos - afterVisiblePos + EXAGGERATED_OVERSCROLL;
            }
        };
        /**
         * Evaluate whether the pagination controls should be displayed. If the scroll width of the
         * tab list is wider than the size of the header container, then the pagination controls should
         * be shown.
         *
         * This is an expensive call that forces a layout reflow to compute box and scroll metrics and
         * should be called sparingly.
         */
        MatPaginatedTabHeader.prototype._checkPaginationEnabled = function () {
            if (this.disablePagination) {
                this._showPaginationControls = false;
            }
            else {
                var isEnabled = this._tabList.nativeElement.scrollWidth > this._elementRef.nativeElement.offsetWidth;
                if (!isEnabled) {
                    this.scrollDistance = 0;
                }
                if (isEnabled !== this._showPaginationControls) {
                    this._changeDetectorRef.markForCheck();
                }
                this._showPaginationControls = isEnabled;
            }
        };
        /**
         * Evaluate whether the before and after controls should be enabled or disabled.
         * If the header is at the beginning of the list (scroll distance is equal to 0) then disable the
         * before button. If the header is at the end of the list (scroll distance is equal to the
         * maximum distance we can scroll), then disable the after button.
         *
         * This is an expensive call that forces a layout reflow to compute box and scroll metrics and
         * should be called sparingly.
         */
        MatPaginatedTabHeader.prototype._checkScrollingControls = function () {
            if (this.disablePagination) {
                this._disableScrollAfter = this._disableScrollBefore = true;
            }
            else {
                // Check if the pagination arrows should be activated.
                this._disableScrollBefore = this.scrollDistance == 0;
                this._disableScrollAfter = this.scrollDistance == this._getMaxScrollDistance();
                this._changeDetectorRef.markForCheck();
            }
        };
        /**
         * Determines what is the maximum length in pixels that can be set for the scroll distance. This
         * is equal to the difference in width between the tab list container and tab header container.
         *
         * This is an expensive call that forces a layout reflow to compute box and scroll metrics and
         * should be called sparingly.
         */
        MatPaginatedTabHeader.prototype._getMaxScrollDistance = function () {
            var lengthOfTabList = this._tabList.nativeElement.scrollWidth;
            var viewLength = this._tabListContainer.nativeElement.offsetWidth;
            return (lengthOfTabList - viewLength) || 0;
        };
        /** Tells the ink-bar to align itself to the current label wrapper */
        MatPaginatedTabHeader.prototype._alignInkBarToSelectedTab = function () {
            var selectedItem = this._items && this._items.length ?
                this._items.toArray()[this.selectedIndex] : null;
            var selectedLabelWrapper = selectedItem ? selectedItem.elementRef.nativeElement : null;
            if (selectedLabelWrapper) {
                this._inkBar.alignToElement(selectedLabelWrapper);
            }
            else {
                this._inkBar.hide();
            }
        };
        /** Stops the currently-running paginator interval.  */
        MatPaginatedTabHeader.prototype._stopInterval = function () {
            this._stopScrolling.next();
        };
        /**
         * Handles the user pressing down on one of the paginators.
         * Starts scrolling the header after a certain amount of time.
         * @param direction In which direction the paginator should be scrolled.
         */
        MatPaginatedTabHeader.prototype._handlePaginatorPress = function (direction, mouseEvent) {
            var _this = this;
            // Don't start auto scrolling for right mouse button clicks. Note that we shouldn't have to
            // null check the `button`, but we do it so we don't break tests that use fake events.
            if (mouseEvent && mouseEvent.button != null && mouseEvent.button !== 0) {
                return;
            }
            // Avoid overlapping timers.
            this._stopInterval();
            // Start a timer after the delay and keep firing based on the interval.
            rxjs.timer(HEADER_SCROLL_DELAY, HEADER_SCROLL_INTERVAL)
                // Keep the timer going until something tells it to stop or the component is destroyed.
                .pipe(operators.takeUntil(rxjs.merge(this._stopScrolling, this._destroyed)))
                .subscribe(function () {
                var _a = _this._scrollHeader(direction), maxScrollDistance = _a.maxScrollDistance, distance = _a.distance;
                // Stop the timer if we've reached the start or the end.
                if (distance === 0 || distance >= maxScrollDistance) {
                    _this._stopInterval();
                }
            });
        };
        /**
         * Scrolls the header to a given position.
         * @param position Position to which to scroll.
         * @returns Information on the current scroll distance and the maximum.
         */
        MatPaginatedTabHeader.prototype._scrollTo = function (position) {
            if (this.disablePagination) {
                return { maxScrollDistance: 0, distance: 0 };
            }
            var maxScrollDistance = this._getMaxScrollDistance();
            this._scrollDistance = Math.max(0, Math.min(maxScrollDistance, position));
            // Mark that the scroll distance has changed so that after the view is checked, the CSS
            // transformation can move the header.
            this._scrollDistanceChanged = true;
            this._checkScrollingControls();
            return { maxScrollDistance: maxScrollDistance, distance: this._scrollDistance };
        };
        return MatPaginatedTabHeader;
    }());
    MatPaginatedTabHeader.decorators = [
        { type: core.Directive }
    ];
    MatPaginatedTabHeader.ctorParameters = function () { return [
        { type: core.ElementRef },
        { type: core.ChangeDetectorRef },
        { type: scrolling.ViewportRuler },
        { type: bidi.Directionality, decorators: [{ type: core.Optional }] },
        { type: core.NgZone },
        { type: platform.Platform },
        { type: String, decorators: [{ type: core.Optional }, { type: core.Inject, args: [animations.ANIMATION_MODULE_TYPE,] }] }
    ]; };
    MatPaginatedTabHeader.propDecorators = {
        disablePagination: [{ type: core.Input }]
    };

    /**
     * Base class with all of the `MatTabHeader` functionality.
     * @docs-private
     */
    var _MatTabHeaderBase = /** @class */ (function (_super) {
        __extends(_MatTabHeaderBase, _super);
        function _MatTabHeaderBase(elementRef, changeDetectorRef, viewportRuler, dir, ngZone, platform, animationMode) {
            var _this = _super.call(this, elementRef, changeDetectorRef, viewportRuler, dir, ngZone, platform, animationMode) || this;
            _this._disableRipple = false;
            return _this;
        }
        Object.defineProperty(_MatTabHeaderBase.prototype, "disableRipple", {
            /** Whether the ripple effect is disabled or not. */
            get: function () { return this._disableRipple; },
            set: function (value) { this._disableRipple = coercion.coerceBooleanProperty(value); },
            enumerable: false,
            configurable: true
        });
        _MatTabHeaderBase.prototype._itemSelected = function (event) {
            event.preventDefault();
        };
        return _MatTabHeaderBase;
    }(MatPaginatedTabHeader));
    _MatTabHeaderBase.decorators = [
        { type: core.Directive }
    ];
    _MatTabHeaderBase.ctorParameters = function () { return [
        { type: core.ElementRef },
        { type: core.ChangeDetectorRef },
        { type: scrolling.ViewportRuler },
        { type: bidi.Directionality, decorators: [{ type: core.Optional }] },
        { type: core.NgZone },
        { type: platform.Platform },
        { type: String, decorators: [{ type: core.Optional }, { type: core.Inject, args: [animations.ANIMATION_MODULE_TYPE,] }] }
    ]; };
    _MatTabHeaderBase.propDecorators = {
        disableRipple: [{ type: core.Input }]
    };
    /**
     * The header of the tab group which displays a list of all the tabs in the tab group. Includes
     * an ink bar that follows the currently selected tab. When the tabs list's width exceeds the
     * width of the header container, then arrows will be displayed to allow the user to scroll
     * left and right across the header.
     * @docs-private
     */
    var MatTabHeader = /** @class */ (function (_super) {
        __extends(MatTabHeader, _super);
        function MatTabHeader(elementRef, changeDetectorRef, viewportRuler, dir, ngZone, platform, animationMode) {
            return _super.call(this, elementRef, changeDetectorRef, viewportRuler, dir, ngZone, platform, animationMode) || this;
        }
        return MatTabHeader;
    }(_MatTabHeaderBase));
    MatTabHeader.decorators = [
        { type: core.Component, args: [{
                    selector: 'mat-tab-header',
                    template: "<div class=\"mat-tab-header-pagination mat-tab-header-pagination-before mat-elevation-z4\"\n     #previousPaginator\n     aria-hidden=\"true\"\n     mat-ripple [matRippleDisabled]=\"_disableScrollBefore || disableRipple\"\n     [class.mat-tab-header-pagination-disabled]=\"_disableScrollBefore\"\n     (click)=\"_handlePaginatorClick('before')\"\n     (mousedown)=\"_handlePaginatorPress('before', $event)\"\n     (touchend)=\"_stopInterval()\">\n  <div class=\"mat-tab-header-pagination-chevron\"></div>\n</div>\n\n<div class=\"mat-tab-label-container\" #tabListContainer (keydown)=\"_handleKeydown($event)\">\n  <div\n    #tabList\n    class=\"mat-tab-list\"\n    [class._mat-animation-noopable]=\"_animationMode === 'NoopAnimations'\"\n    role=\"tablist\"\n    (cdkObserveContent)=\"_onContentChanges()\">\n    <div class=\"mat-tab-labels\">\n      <ng-content></ng-content>\n    </div>\n    <mat-ink-bar></mat-ink-bar>\n  </div>\n</div>\n\n<div class=\"mat-tab-header-pagination mat-tab-header-pagination-after mat-elevation-z4\"\n     #nextPaginator\n     aria-hidden=\"true\"\n     mat-ripple [matRippleDisabled]=\"_disableScrollAfter || disableRipple\"\n     [class.mat-tab-header-pagination-disabled]=\"_disableScrollAfter\"\n     (mousedown)=\"_handlePaginatorPress('after', $event)\"\n     (click)=\"_handlePaginatorClick('after')\"\n     (touchend)=\"_stopInterval()\">\n  <div class=\"mat-tab-header-pagination-chevron\"></div>\n</div>\n",
                    inputs: ['selectedIndex'],
                    outputs: ['selectFocusedIndex', 'indexFocused'],
                    encapsulation: core.ViewEncapsulation.None,
                    // tslint:disable-next-line:validate-decorators
                    changeDetection: core.ChangeDetectionStrategy.Default,
                    host: {
                        'class': 'mat-tab-header',
                        '[class.mat-tab-header-pagination-controls-enabled]': '_showPaginationControls',
                        '[class.mat-tab-header-rtl]': "_getLayoutDirection() == 'rtl'",
                    },
                    styles: [".mat-tab-header{display:flex;overflow:hidden;position:relative;flex-shrink:0}.mat-tab-header-pagination{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;position:relative;display:none;justify-content:center;align-items:center;min-width:32px;cursor:pointer;z-index:2;-webkit-tap-highlight-color:transparent;touch-action:none}.mat-tab-header-pagination-controls-enabled .mat-tab-header-pagination{display:flex}.mat-tab-header-pagination-before,.mat-tab-header-rtl .mat-tab-header-pagination-after{padding-left:4px}.mat-tab-header-pagination-before .mat-tab-header-pagination-chevron,.mat-tab-header-rtl .mat-tab-header-pagination-after .mat-tab-header-pagination-chevron{transform:rotate(-135deg)}.mat-tab-header-rtl .mat-tab-header-pagination-before,.mat-tab-header-pagination-after{padding-right:4px}.mat-tab-header-rtl .mat-tab-header-pagination-before .mat-tab-header-pagination-chevron,.mat-tab-header-pagination-after .mat-tab-header-pagination-chevron{transform:rotate(45deg)}.mat-tab-header-pagination-chevron{border-style:solid;border-width:2px 2px 0 0;content:\"\";height:8px;width:8px}.mat-tab-header-pagination-disabled{box-shadow:none;cursor:default}.mat-tab-list{flex-grow:1;position:relative;transition:transform 500ms cubic-bezier(0.35, 0, 0.25, 1)}.mat-ink-bar{position:absolute;bottom:0;height:2px;transition:500ms cubic-bezier(0.35, 0, 0.25, 1)}._mat-animation-noopable.mat-ink-bar{transition:none;animation:none}.mat-tab-group-inverted-header .mat-ink-bar{bottom:auto;top:0}.cdk-high-contrast-active .mat-ink-bar{outline:solid 2px;height:0}.mat-tab-labels{display:flex}[mat-align-tabs=center]>.mat-tab-header .mat-tab-labels{justify-content:center}[mat-align-tabs=end]>.mat-tab-header .mat-tab-labels{justify-content:flex-end}.mat-tab-label-container{display:flex;flex-grow:1;overflow:hidden;z-index:1}._mat-animation-noopable.mat-tab-list{transition:none;animation:none}.mat-tab-label{height:48px;padding:0 24px;cursor:pointer;box-sizing:border-box;opacity:.6;min-width:160px;text-align:center;display:inline-flex;justify-content:center;align-items:center;white-space:nowrap;position:relative}.mat-tab-label:focus{outline:none}.mat-tab-label:focus:not(.mat-tab-disabled){opacity:1}.cdk-high-contrast-active .mat-tab-label:focus{outline:dotted 2px;outline-offset:-2px}.mat-tab-label.mat-tab-disabled{cursor:default}.cdk-high-contrast-active .mat-tab-label.mat-tab-disabled{opacity:.5}.mat-tab-label .mat-tab-label-content{display:inline-flex;justify-content:center;align-items:center;white-space:nowrap}.cdk-high-contrast-active .mat-tab-label{opacity:1}@media(max-width: 599px){.mat-tab-label{min-width:72px}}\n"]
                },] }
    ];
    MatTabHeader.ctorParameters = function () { return [
        { type: core.ElementRef },
        { type: core.ChangeDetectorRef },
        { type: scrolling.ViewportRuler },
        { type: bidi.Directionality, decorators: [{ type: core.Optional }] },
        { type: core.NgZone },
        { type: platform.Platform },
        { type: String, decorators: [{ type: core.Optional }, { type: core.Inject, args: [animations.ANIMATION_MODULE_TYPE,] }] }
    ]; };
    MatTabHeader.propDecorators = {
        _items: [{ type: core.ContentChildren, args: [MatTabLabelWrapper, { descendants: false },] }],
        _inkBar: [{ type: core.ViewChild, args: [MatInkBar, { static: true },] }],
        _tabListContainer: [{ type: core.ViewChild, args: ['tabListContainer', { static: true },] }],
        _tabList: [{ type: core.ViewChild, args: ['tabList', { static: true },] }],
        _nextPaginator: [{ type: core.ViewChild, args: ['nextPaginator',] }],
        _previousPaginator: [{ type: core.ViewChild, args: ['previousPaginator',] }]
    };

    /**
     * Base class with all of the `MatTabNav` functionality.
     * @docs-private
     */
    var _MatTabNavBase = /** @class */ (function (_super) {
        __extends(_MatTabNavBase, _super);
        function _MatTabNavBase(elementRef, dir, ngZone, changeDetectorRef, viewportRuler, platform, animationMode) {
            var _this = _super.call(this, elementRef, changeDetectorRef, viewportRuler, dir, ngZone, platform, animationMode) || this;
            _this._disableRipple = false;
            /** Theme color of the nav bar. */
            _this.color = 'primary';
            return _this;
        }
        Object.defineProperty(_MatTabNavBase.prototype, "backgroundColor", {
            /** Background color of the tab nav. */
            get: function () { return this._backgroundColor; },
            set: function (value) {
                var classList = this._elementRef.nativeElement.classList;
                classList.remove("mat-background-" + this.backgroundColor);
                if (value) {
                    classList.add("mat-background-" + value);
                }
                this._backgroundColor = value;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(_MatTabNavBase.prototype, "disableRipple", {
            /** Whether the ripple effect is disabled or not. */
            get: function () { return this._disableRipple; },
            set: function (value) { this._disableRipple = coercion.coerceBooleanProperty(value); },
            enumerable: false,
            configurable: true
        });
        _MatTabNavBase.prototype._itemSelected = function () {
            // noop
        };
        _MatTabNavBase.prototype.ngAfterContentInit = function () {
            var _this = this;
            // We need this to run before the `changes` subscription in parent to ensure that the
            // selectedIndex is up-to-date by the time the super class starts looking for it.
            this._items.changes.pipe(operators.startWith(null), operators.takeUntil(this._destroyed)).subscribe(function () {
                _this.updateActiveLink();
            });
            _super.prototype.ngAfterContentInit.call(this);
        };
        /** Notifies the component that the active link has been changed. */
        _MatTabNavBase.prototype.updateActiveLink = function () {
            if (!this._items) {
                return;
            }
            var items = this._items.toArray();
            for (var i = 0; i < items.length; i++) {
                if (items[i].active) {
                    this.selectedIndex = i;
                    this._changeDetectorRef.markForCheck();
                    return;
                }
            }
            // The ink bar should hide itself if no items are active.
            this.selectedIndex = -1;
            this._inkBar.hide();
        };
        return _MatTabNavBase;
    }(MatPaginatedTabHeader));
    _MatTabNavBase.decorators = [
        { type: core.Directive }
    ];
    _MatTabNavBase.ctorParameters = function () { return [
        { type: core.ElementRef },
        { type: bidi.Directionality, decorators: [{ type: core.Optional }] },
        { type: core.NgZone },
        { type: core.ChangeDetectorRef },
        { type: scrolling.ViewportRuler },
        { type: platform.Platform },
        { type: String, decorators: [{ type: core.Optional }, { type: core.Inject, args: [animations.ANIMATION_MODULE_TYPE,] }] }
    ]; };
    _MatTabNavBase.propDecorators = {
        backgroundColor: [{ type: core.Input }],
        disableRipple: [{ type: core.Input }],
        color: [{ type: core.Input }]
    };
    /**
     * Navigation component matching the styles of the tab group header.
     * Provides anchored navigation with animated ink bar.
     */
    var MatTabNav = /** @class */ (function (_super) {
        __extends(MatTabNav, _super);
        function MatTabNav(elementRef, dir, ngZone, changeDetectorRef, viewportRuler, platform, animationMode) {
            return _super.call(this, elementRef, dir, ngZone, changeDetectorRef, viewportRuler, platform, animationMode) || this;
        }
        return MatTabNav;
    }(_MatTabNavBase));
    MatTabNav.decorators = [
        { type: core.Component, args: [{
                    selector: '[mat-tab-nav-bar]',
                    exportAs: 'matTabNavBar, matTabNav',
                    inputs: ['color'],
                    template: "<div class=\"mat-tab-header-pagination mat-tab-header-pagination-before mat-elevation-z4\"\n     #previousPaginator\n     aria-hidden=\"true\"\n     mat-ripple [matRippleDisabled]=\"_disableScrollBefore || disableRipple\"\n     [class.mat-tab-header-pagination-disabled]=\"_disableScrollBefore\"\n     (click)=\"_handlePaginatorClick('before')\"\n     (mousedown)=\"_handlePaginatorPress('before', $event)\"\n     (touchend)=\"_stopInterval()\">\n  <div class=\"mat-tab-header-pagination-chevron\"></div>\n</div>\n\n<div class=\"mat-tab-link-container\" #tabListContainer (keydown)=\"_handleKeydown($event)\">\n  <div\n    class=\"mat-tab-list\"\n    [class._mat-animation-noopable]=\"_animationMode === 'NoopAnimations'\"\n    #tabList\n    (cdkObserveContent)=\"_onContentChanges()\">\n    <div class=\"mat-tab-links\">\n      <ng-content></ng-content>\n    </div>\n    <mat-ink-bar></mat-ink-bar>\n  </div>\n</div>\n\n<div class=\"mat-tab-header-pagination mat-tab-header-pagination-after mat-elevation-z4\"\n     #nextPaginator\n     aria-hidden=\"true\"\n     mat-ripple [matRippleDisabled]=\"_disableScrollAfter || disableRipple\"\n     [class.mat-tab-header-pagination-disabled]=\"_disableScrollAfter\"\n     (mousedown)=\"_handlePaginatorPress('after', $event)\"\n     (click)=\"_handlePaginatorClick('after')\"\n     (touchend)=\"_stopInterval()\">\n  <div class=\"mat-tab-header-pagination-chevron\"></div>\n</div>\n",
                    host: {
                        'class': 'mat-tab-nav-bar mat-tab-header',
                        '[class.mat-tab-header-pagination-controls-enabled]': '_showPaginationControls',
                        '[class.mat-tab-header-rtl]': "_getLayoutDirection() == 'rtl'",
                        '[class.mat-primary]': 'color !== "warn" && color !== "accent"',
                        '[class.mat-accent]': 'color === "accent"',
                        '[class.mat-warn]': 'color === "warn"',
                    },
                    encapsulation: core.ViewEncapsulation.None,
                    // tslint:disable-next-line:validate-decorators
                    changeDetection: core.ChangeDetectionStrategy.Default,
                    styles: [".mat-tab-header{display:flex;overflow:hidden;position:relative;flex-shrink:0}.mat-tab-header-pagination{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;position:relative;display:none;justify-content:center;align-items:center;min-width:32px;cursor:pointer;z-index:2;-webkit-tap-highlight-color:transparent;touch-action:none}.mat-tab-header-pagination-controls-enabled .mat-tab-header-pagination{display:flex}.mat-tab-header-pagination-before,.mat-tab-header-rtl .mat-tab-header-pagination-after{padding-left:4px}.mat-tab-header-pagination-before .mat-tab-header-pagination-chevron,.mat-tab-header-rtl .mat-tab-header-pagination-after .mat-tab-header-pagination-chevron{transform:rotate(-135deg)}.mat-tab-header-rtl .mat-tab-header-pagination-before,.mat-tab-header-pagination-after{padding-right:4px}.mat-tab-header-rtl .mat-tab-header-pagination-before .mat-tab-header-pagination-chevron,.mat-tab-header-pagination-after .mat-tab-header-pagination-chevron{transform:rotate(45deg)}.mat-tab-header-pagination-chevron{border-style:solid;border-width:2px 2px 0 0;content:\"\";height:8px;width:8px}.mat-tab-header-pagination-disabled{box-shadow:none;cursor:default}.mat-tab-list{flex-grow:1;position:relative;transition:transform 500ms cubic-bezier(0.35, 0, 0.25, 1)}.mat-tab-links{display:flex}[mat-align-tabs=center]>.mat-tab-link-container .mat-tab-links{justify-content:center}[mat-align-tabs=end]>.mat-tab-link-container .mat-tab-links{justify-content:flex-end}.mat-ink-bar{position:absolute;bottom:0;height:2px;transition:500ms cubic-bezier(0.35, 0, 0.25, 1)}._mat-animation-noopable.mat-ink-bar{transition:none;animation:none}.mat-tab-group-inverted-header .mat-ink-bar{bottom:auto;top:0}.cdk-high-contrast-active .mat-ink-bar{outline:solid 2px;height:0}.mat-tab-link-container{display:flex;flex-grow:1;overflow:hidden;z-index:1}.mat-tab-link{height:48px;padding:0 24px;cursor:pointer;box-sizing:border-box;opacity:.6;min-width:160px;text-align:center;display:inline-flex;justify-content:center;align-items:center;white-space:nowrap;vertical-align:top;text-decoration:none;position:relative;overflow:hidden;-webkit-tap-highlight-color:transparent}.mat-tab-link:focus{outline:none}.mat-tab-link:focus:not(.mat-tab-disabled){opacity:1}.cdk-high-contrast-active .mat-tab-link:focus{outline:dotted 2px;outline-offset:-2px}.mat-tab-link.mat-tab-disabled{cursor:default}.cdk-high-contrast-active .mat-tab-link.mat-tab-disabled{opacity:.5}.mat-tab-link .mat-tab-label-content{display:inline-flex;justify-content:center;align-items:center;white-space:nowrap}.cdk-high-contrast-active .mat-tab-link{opacity:1}[mat-stretch-tabs] .mat-tab-link{flex-basis:0;flex-grow:1}.mat-tab-link.mat-tab-disabled{pointer-events:none}@media(max-width: 599px){.mat-tab-link{min-width:72px}}\n"]
                },] }
    ];
    MatTabNav.ctorParameters = function () { return [
        { type: core.ElementRef },
        { type: bidi.Directionality, decorators: [{ type: core.Optional }] },
        { type: core.NgZone },
        { type: core.ChangeDetectorRef },
        { type: scrolling.ViewportRuler },
        { type: platform.Platform },
        { type: String, decorators: [{ type: core.Optional }, { type: core.Inject, args: [animations.ANIMATION_MODULE_TYPE,] }] }
    ]; };
    MatTabNav.propDecorators = {
        _items: [{ type: core.ContentChildren, args: [core.forwardRef(function () { return MatTabLink; }), { descendants: true },] }],
        _inkBar: [{ type: core.ViewChild, args: [MatInkBar, { static: true },] }],
        _tabListContainer: [{ type: core.ViewChild, args: ['tabListContainer', { static: true },] }],
        _tabList: [{ type: core.ViewChild, args: ['tabList', { static: true },] }],
        _nextPaginator: [{ type: core.ViewChild, args: ['nextPaginator',] }],
        _previousPaginator: [{ type: core.ViewChild, args: ['previousPaginator',] }]
    };
    // Boilerplate for applying mixins to MatTabLink.
    var MatTabLinkMixinBase = /** @class */ (function () {
        function MatTabLinkMixinBase() {
        }
        return MatTabLinkMixinBase;
    }());
    var _MatTabLinkMixinBase = core$1.mixinTabIndex(core$1.mixinDisableRipple(core$1.mixinDisabled(MatTabLinkMixinBase)));
    /** Base class with all of the `MatTabLink` functionality. */
    var _MatTabLinkBase = /** @class */ (function (_super) {
        __extends(_MatTabLinkBase, _super);
        function _MatTabLinkBase(_tabNavBar, 
        /** @docs-private */ elementRef, globalRippleOptions, tabIndex, _focusMonitor, animationMode) {
            var _this = _super.call(this) || this;
            _this._tabNavBar = _tabNavBar;
            _this.elementRef = elementRef;
            _this._focusMonitor = _focusMonitor;
            /** Whether the tab link is active or not. */
            _this._isActive = false;
            _this.rippleConfig = globalRippleOptions || {};
            _this.tabIndex = parseInt(tabIndex) || 0;
            if (animationMode === 'NoopAnimations') {
                _this.rippleConfig.animation = { enterDuration: 0, exitDuration: 0 };
            }
            return _this;
        }
        Object.defineProperty(_MatTabLinkBase.prototype, "active", {
            /** Whether the link is active. */
            get: function () { return this._isActive; },
            set: function (value) {
                var newValue = coercion.coerceBooleanProperty(value);
                if (newValue !== this._isActive) {
                    this._isActive = value;
                    this._tabNavBar.updateActiveLink();
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(_MatTabLinkBase.prototype, "rippleDisabled", {
            /**
             * Whether ripples are disabled on interaction.
             * @docs-private
             */
            get: function () {
                return this.disabled || this.disableRipple || this._tabNavBar.disableRipple ||
                    !!this.rippleConfig.disabled;
            },
            enumerable: false,
            configurable: true
        });
        /** Focuses the tab link. */
        _MatTabLinkBase.prototype.focus = function () {
            this.elementRef.nativeElement.focus();
        };
        _MatTabLinkBase.prototype.ngAfterViewInit = function () {
            this._focusMonitor.monitor(this.elementRef);
        };
        _MatTabLinkBase.prototype.ngOnDestroy = function () {
            this._focusMonitor.stopMonitoring(this.elementRef);
        };
        return _MatTabLinkBase;
    }(_MatTabLinkMixinBase));
    _MatTabLinkBase.decorators = [
        { type: core.Directive }
    ];
    _MatTabLinkBase.ctorParameters = function () { return [
        { type: _MatTabNavBase },
        { type: core.ElementRef },
        { type: undefined, decorators: [{ type: core.Optional }, { type: core.Inject, args: [core$1.MAT_RIPPLE_GLOBAL_OPTIONS,] }] },
        { type: String, decorators: [{ type: core.Attribute, args: ['tabindex',] }] },
        { type: a11y.FocusMonitor },
        { type: String, decorators: [{ type: core.Optional }, { type: core.Inject, args: [animations.ANIMATION_MODULE_TYPE,] }] }
    ]; };
    _MatTabLinkBase.propDecorators = {
        active: [{ type: core.Input }]
    };
    /**
     * Link inside of a `mat-tab-nav-bar`.
     */
    var MatTabLink = /** @class */ (function (_super) {
        __extends(MatTabLink, _super);
        function MatTabLink(tabNavBar, elementRef, ngZone, platform, globalRippleOptions, tabIndex, focusMonitor, animationMode) {
            var _this = _super.call(this, tabNavBar, elementRef, globalRippleOptions, tabIndex, focusMonitor, animationMode) || this;
            _this._tabLinkRipple = new core$1.RippleRenderer(_this, ngZone, elementRef, platform);
            _this._tabLinkRipple.setupTriggerEvents(elementRef.nativeElement);
            return _this;
        }
        MatTabLink.prototype.ngOnDestroy = function () {
            _super.prototype.ngOnDestroy.call(this);
            this._tabLinkRipple._removeTriggerEvents();
        };
        return MatTabLink;
    }(_MatTabLinkBase));
    MatTabLink.decorators = [
        { type: core.Directive, args: [{
                    selector: '[mat-tab-link], [matTabLink]',
                    exportAs: 'matTabLink',
                    inputs: ['disabled', 'disableRipple', 'tabIndex'],
                    host: {
                        'class': 'mat-tab-link mat-focus-indicator',
                        '[attr.aria-current]': 'active ? "page" : null',
                        '[attr.aria-disabled]': 'disabled',
                        '[attr.tabIndex]': 'tabIndex',
                        '[class.mat-tab-disabled]': 'disabled',
                        '[class.mat-tab-label-active]': 'active',
                    }
                },] }
    ];
    MatTabLink.ctorParameters = function () { return [
        { type: MatTabNav },
        { type: core.ElementRef },
        { type: core.NgZone },
        { type: platform.Platform },
        { type: undefined, decorators: [{ type: core.Optional }, { type: core.Inject, args: [core$1.MAT_RIPPLE_GLOBAL_OPTIONS,] }] },
        { type: String, decorators: [{ type: core.Attribute, args: ['tabindex',] }] },
        { type: a11y.FocusMonitor },
        { type: String, decorators: [{ type: core.Optional }, { type: core.Inject, args: [animations.ANIMATION_MODULE_TYPE,] }] }
    ]; };

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var MatTabsModule = /** @class */ (function () {
        function MatTabsModule() {
        }
        return MatTabsModule;
    }());
    MatTabsModule.decorators = [
        { type: core.NgModule, args: [{
                    imports: [
                        common.CommonModule,
                        core$1.MatCommonModule,
                        portal.PortalModule,
                        core$1.MatRippleModule,
                        observers.ObserversModule,
                        a11y.A11yModule,
                    ],
                    // Don't export all components because some are only to be used internally.
                    exports: [
                        core$1.MatCommonModule,
                        MatTabGroup,
                        MatTabLabel,
                        MatTab,
                        MatTabNav,
                        MatTabLink,
                        MatTabContent,
                    ],
                    declarations: [
                        MatTabGroup,
                        MatTabLabel,
                        MatTab,
                        MatInkBar,
                        MatTabLabelWrapper,
                        MatTabNav,
                        MatTabLink,
                        MatTabBody,
                        MatTabBodyPortal,
                        MatTabHeader,
                        MatTabContent,
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
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */

    /**
     * Generated bundle index. Do not edit.
     */

    exports.MAT_TABS_CONFIG = MAT_TABS_CONFIG;
    exports.MAT_TAB_GROUP = MAT_TAB_GROUP;
    exports.MatInkBar = MatInkBar;
    exports.MatTab = MatTab;
    exports.MatTabBody = MatTabBody;
    exports.MatTabBodyPortal = MatTabBodyPortal;
    exports.MatTabChangeEvent = MatTabChangeEvent;
    exports.MatTabContent = MatTabContent;
    exports.MatTabGroup = MatTabGroup;
    exports.MatTabHeader = MatTabHeader;
    exports.MatTabLabel = MatTabLabel;
    exports.MatTabLabelWrapper = MatTabLabelWrapper;
    exports.MatTabLink = MatTabLink;
    exports.MatTabNav = MatTabNav;
    exports.MatTabsModule = MatTabsModule;
    exports._MAT_INK_BAR_POSITIONER = _MAT_INK_BAR_POSITIONER;
    exports._MatTabBodyBase = _MatTabBodyBase;
    exports._MatTabGroupBase = _MatTabGroupBase;
    exports._MatTabHeaderBase = _MatTabHeaderBase;
    exports._MatTabLinkBase = _MatTabLinkBase;
    exports._MatTabNavBase = _MatTabNavBase;
    exports.matTabsAnimations = matTabsAnimations;
    exports.ɵangular_material_src_material_tabs_tabs_a = _MAT_INK_BAR_POSITIONER_FACTORY;
    exports.ɵangular_material_src_material_tabs_tabs_b = MAT_TAB_LABEL;
    exports.ɵangular_material_src_material_tabs_tabs_c = MAT_TAB_CONTENT;
    exports.ɵangular_material_src_material_tabs_tabs_d = MatPaginatedTabHeader;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=material-tabs.umd.js.map
