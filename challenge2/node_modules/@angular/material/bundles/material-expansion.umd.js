(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/cdk/accordion'), require('@angular/cdk/portal'), require('@angular/common'), require('@angular/core'), require('@angular/material/core'), require('@angular/cdk/coercion'), require('@angular/cdk/a11y'), require('rxjs/operators'), require('@angular/cdk/keycodes'), require('@angular/platform-browser/animations'), require('rxjs'), require('@angular/animations'), require('@angular/cdk/collections')) :
    typeof define === 'function' && define.amd ? define('@angular/material/expansion', ['exports', '@angular/cdk/accordion', '@angular/cdk/portal', '@angular/common', '@angular/core', '@angular/material/core', '@angular/cdk/coercion', '@angular/cdk/a11y', 'rxjs/operators', '@angular/cdk/keycodes', '@angular/platform-browser/animations', 'rxjs', '@angular/animations', '@angular/cdk/collections'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.ng = global.ng || {}, global.ng.material = global.ng.material || {}, global.ng.material.expansion = {}), global.ng.cdk.accordion, global.ng.cdk.portal, global.ng.common, global.ng.core, global.ng.material.core, global.ng.cdk.coercion, global.ng.cdk.a11y, global.rxjs.operators, global.ng.cdk.keycodes, global.ng.platformBrowser.animations, global.rxjs, global.ng.animations, global.ng.cdk.collections));
}(this, (function (exports, accordion, portal, common, core, core$1, coercion, a11y, operators, keycodes, animations$1, rxjs, animations, collections) { 'use strict';

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
     * Token used to provide a `MatAccordion` to `MatExpansionPanel`.
     * Used primarily to avoid circular imports between `MatAccordion` and `MatExpansionPanel`.
     */
    var MAT_ACCORDION = new core.InjectionToken('MAT_ACCORDION');

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /** Time and timing curve for expansion panel animations. */
    // Note: Keep this in sync with the Sass variable for the panel header animation.
    var EXPANSION_PANEL_ANIMATION_TIMING = '225ms cubic-bezier(0.4,0.0,0.2,1)';
    /**
     * Animations used by the Material expansion panel.
     *
     * A bug in angular animation's `state` when ViewContainers are moved using ViewContainerRef.move()
     * causes the animation state of moved components to become `void` upon exit, and not update again
     * upon reentry into the DOM.  This can lead a to situation for the expansion panel where the state
     * of the panel is `expanded` or `collapsed` but the animation state is `void`.
     *
     * To correctly handle animating to the next state, we animate between `void` and `collapsed` which
     * are defined to have the same styles. Since angular animates from the current styles to the
     * destination state's style definition, in situations where we are moving from `void`'s styles to
     * `collapsed` this acts a noop since no style values change.
     *
     * In the case where angular's animation state is out of sync with the expansion panel's state, the
     * expansion panel being `expanded` and angular animations being `void`, the animation from the
     * `expanded`'s effective styles (though in a `void` animation state) to the collapsed state will
     * occur as expected.
     *
     * Angular Bug: https://github.com/angular/angular/issues/18847
     *
     * @docs-private
     */
    var matExpansionAnimations = {
        /** Animation that rotates the indicator arrow. */
        indicatorRotate: animations.trigger('indicatorRotate', [
            animations.state('collapsed, void', animations.style({ transform: 'rotate(0deg)' })),
            animations.state('expanded', animations.style({ transform: 'rotate(180deg)' })),
            animations.transition('expanded <=> collapsed, void => collapsed', animations.animate(EXPANSION_PANEL_ANIMATION_TIMING)),
        ]),
        /** Animation that expands and collapses the panel content. */
        bodyExpansion: animations.trigger('bodyExpansion', [
            animations.state('collapsed, void', animations.style({ height: '0px', visibility: 'hidden' })),
            animations.state('expanded', animations.style({ height: '*', visibility: 'visible' })),
            animations.transition('expanded <=> collapsed, void => collapsed', animations.animate(EXPANSION_PANEL_ANIMATION_TIMING)),
        ])
    };

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /**
     * Expansion panel content that will be rendered lazily
     * after the panel is opened for the first time.
     */
    var MatExpansionPanelContent = /** @class */ (function () {
        function MatExpansionPanelContent(_template) {
            this._template = _template;
        }
        return MatExpansionPanelContent;
    }());
    MatExpansionPanelContent.decorators = [
        { type: core.Directive, args: [{
                    selector: 'ng-template[matExpansionPanelContent]'
                },] }
    ];
    MatExpansionPanelContent.ctorParameters = function () { return [
        { type: core.TemplateRef }
    ]; };

    /** Counter for generating unique element ids. */
    var uniqueId = 0;
    /**
     * Injection token that can be used to configure the defalt
     * options for the expansion panel component.
     */
    var MAT_EXPANSION_PANEL_DEFAULT_OPTIONS = new core.InjectionToken('MAT_EXPANSION_PANEL_DEFAULT_OPTIONS');
    var ɵ0 = undefined;
    /**
     * This component can be used as a single element to show expandable content, or as one of
     * multiple children of an element with the MatAccordion directive attached.
     */
    var MatExpansionPanel = /** @class */ (function (_super) {
        __extends(MatExpansionPanel, _super);
        function MatExpansionPanel(accordion, _changeDetectorRef, _uniqueSelectionDispatcher, _viewContainerRef, _document, _animationMode, defaultOptions) {
            var _this = _super.call(this, accordion, _changeDetectorRef, _uniqueSelectionDispatcher) || this;
            _this._viewContainerRef = _viewContainerRef;
            _this._animationMode = _animationMode;
            _this._hideToggle = false;
            /** An event emitted after the body's expansion animation happens. */
            _this.afterExpand = new core.EventEmitter();
            /** An event emitted after the body's collapse animation happens. */
            _this.afterCollapse = new core.EventEmitter();
            /** Stream that emits for changes in `@Input` properties. */
            _this._inputChanges = new rxjs.Subject();
            /** ID for the associated header element. Used for a11y labelling. */
            _this._headerId = "mat-expansion-panel-header-" + uniqueId++;
            /** Stream of body animation done events. */
            _this._bodyAnimationDone = new rxjs.Subject();
            _this.accordion = accordion;
            _this._document = _document;
            // We need a Subject with distinctUntilChanged, because the `done` event
            // fires twice on some browsers. See https://github.com/angular/angular/issues/24084
            _this._bodyAnimationDone.pipe(operators.distinctUntilChanged(function (x, y) {
                return x.fromState === y.fromState && x.toState === y.toState;
            })).subscribe(function (event) {
                if (event.fromState !== 'void') {
                    if (event.toState === 'expanded') {
                        _this.afterExpand.emit();
                    }
                    else if (event.toState === 'collapsed') {
                        _this.afterCollapse.emit();
                    }
                }
            });
            if (defaultOptions) {
                _this.hideToggle = defaultOptions.hideToggle;
            }
            return _this;
        }
        Object.defineProperty(MatExpansionPanel.prototype, "hideToggle", {
            /** Whether the toggle indicator should be hidden. */
            get: function () {
                return this._hideToggle || (this.accordion && this.accordion.hideToggle);
            },
            set: function (value) {
                this._hideToggle = coercion.coerceBooleanProperty(value);
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatExpansionPanel.prototype, "togglePosition", {
            /** The position of the expansion indicator. */
            get: function () {
                return this._togglePosition || (this.accordion && this.accordion.togglePosition);
            },
            set: function (value) {
                this._togglePosition = value;
            },
            enumerable: false,
            configurable: true
        });
        /** Determines whether the expansion panel should have spacing between it and its siblings. */
        MatExpansionPanel.prototype._hasSpacing = function () {
            if (this.accordion) {
                return this.expanded && this.accordion.displayMode === 'default';
            }
            return false;
        };
        /** Gets the expanded state string. */
        MatExpansionPanel.prototype._getExpandedState = function () {
            return this.expanded ? 'expanded' : 'collapsed';
        };
        /** Toggles the expanded state of the expansion panel. */
        MatExpansionPanel.prototype.toggle = function () {
            this.expanded = !this.expanded;
        };
        /** Sets the expanded state of the expansion panel to false. */
        MatExpansionPanel.prototype.close = function () {
            this.expanded = false;
        };
        /** Sets the expanded state of the expansion panel to true. */
        MatExpansionPanel.prototype.open = function () {
            this.expanded = true;
        };
        MatExpansionPanel.prototype.ngAfterContentInit = function () {
            var _this = this;
            if (this._lazyContent) {
                // Render the content as soon as the panel becomes open.
                this.opened.pipe(operators.startWith(null), operators.filter(function () { return _this.expanded && !_this._portal; }), operators.take(1)).subscribe(function () {
                    _this._portal = new portal.TemplatePortal(_this._lazyContent._template, _this._viewContainerRef);
                });
            }
        };
        MatExpansionPanel.prototype.ngOnChanges = function (changes) {
            this._inputChanges.next(changes);
        };
        MatExpansionPanel.prototype.ngOnDestroy = function () {
            _super.prototype.ngOnDestroy.call(this);
            this._bodyAnimationDone.complete();
            this._inputChanges.complete();
        };
        /** Checks whether the expansion panel's content contains the currently-focused element. */
        MatExpansionPanel.prototype._containsFocus = function () {
            if (this._body) {
                var focusedElement = this._document.activeElement;
                var bodyElement = this._body.nativeElement;
                return focusedElement === bodyElement || bodyElement.contains(focusedElement);
            }
            return false;
        };
        return MatExpansionPanel;
    }(accordion.CdkAccordionItem));
    MatExpansionPanel.decorators = [
        { type: core.Component, args: [{
                    selector: 'mat-expansion-panel',
                    exportAs: 'matExpansionPanel',
                    template: "<ng-content select=\"mat-expansion-panel-header\"></ng-content>\n<div class=\"mat-expansion-panel-content\"\n     role=\"region\"\n     [@bodyExpansion]=\"_getExpandedState()\"\n     (@bodyExpansion.done)=\"_bodyAnimationDone.next($event)\"\n     [attr.aria-labelledby]=\"_headerId\"\n     [id]=\"id\"\n     #body>\n  <div class=\"mat-expansion-panel-body\">\n    <ng-content></ng-content>\n    <ng-template [cdkPortalOutlet]=\"_portal\"></ng-template>\n  </div>\n  <ng-content select=\"mat-action-row\"></ng-content>\n</div>\n",
                    encapsulation: core.ViewEncapsulation.None,
                    changeDetection: core.ChangeDetectionStrategy.OnPush,
                    inputs: ['disabled', 'expanded'],
                    outputs: ['opened', 'closed', 'expandedChange'],
                    animations: [matExpansionAnimations.bodyExpansion],
                    providers: [
                        // Provide MatAccordion as undefined to prevent nested expansion panels from registering
                        // to the same accordion.
                        { provide: MAT_ACCORDION, useValue: ɵ0 },
                    ],
                    host: {
                        'class': 'mat-expansion-panel',
                        '[class.mat-expanded]': 'expanded',
                        '[class._mat-animation-noopable]': '_animationMode === "NoopAnimations"',
                        '[class.mat-expansion-panel-spacing]': '_hasSpacing()',
                    },
                    styles: [".mat-expansion-panel{box-sizing:content-box;display:block;margin:0;border-radius:4px;overflow:hidden;transition:margin 225ms cubic-bezier(0.4, 0, 0.2, 1),box-shadow 280ms cubic-bezier(0.4, 0, 0.2, 1);position:relative}.mat-accordion .mat-expansion-panel:not(.mat-expanded),.mat-accordion .mat-expansion-panel:not(.mat-expansion-panel-spacing){border-radius:0}.mat-accordion .mat-expansion-panel:first-of-type{border-top-right-radius:4px;border-top-left-radius:4px}.mat-accordion .mat-expansion-panel:last-of-type{border-bottom-right-radius:4px;border-bottom-left-radius:4px}.cdk-high-contrast-active .mat-expansion-panel{outline:solid 1px}.mat-expansion-panel.ng-animate-disabled,.ng-animate-disabled .mat-expansion-panel,.mat-expansion-panel._mat-animation-noopable{transition:none}.mat-expansion-panel-content{display:flex;flex-direction:column;overflow:visible}.mat-expansion-panel-body{padding:0 24px 16px}.mat-expansion-panel-spacing{margin:16px 0}.mat-accordion>.mat-expansion-panel-spacing:first-child,.mat-accordion>*:first-child:not(.mat-expansion-panel) .mat-expansion-panel-spacing{margin-top:0}.mat-accordion>.mat-expansion-panel-spacing:last-child,.mat-accordion>*:last-child:not(.mat-expansion-panel) .mat-expansion-panel-spacing{margin-bottom:0}.mat-action-row{border-top-style:solid;border-top-width:1px;display:flex;flex-direction:row;justify-content:flex-end;padding:16px 8px 16px 24px}.mat-action-row button.mat-button-base,.mat-action-row button.mat-mdc-button-base{margin-left:8px}[dir=rtl] .mat-action-row button.mat-button-base,[dir=rtl] .mat-action-row button.mat-mdc-button-base{margin-left:0;margin-right:8px}\n"]
                },] }
    ];
    MatExpansionPanel.ctorParameters = function () { return [
        { type: undefined, decorators: [{ type: core.Optional }, { type: core.SkipSelf }, { type: core.Inject, args: [MAT_ACCORDION,] }] },
        { type: core.ChangeDetectorRef },
        { type: collections.UniqueSelectionDispatcher },
        { type: core.ViewContainerRef },
        { type: undefined, decorators: [{ type: core.Inject, args: [common.DOCUMENT,] }] },
        { type: String, decorators: [{ type: core.Optional }, { type: core.Inject, args: [animations$1.ANIMATION_MODULE_TYPE,] }] },
        { type: undefined, decorators: [{ type: core.Inject, args: [MAT_EXPANSION_PANEL_DEFAULT_OPTIONS,] }, { type: core.Optional }] }
    ]; };
    MatExpansionPanel.propDecorators = {
        hideToggle: [{ type: core.Input }],
        togglePosition: [{ type: core.Input }],
        afterExpand: [{ type: core.Output }],
        afterCollapse: [{ type: core.Output }],
        _lazyContent: [{ type: core.ContentChild, args: [MatExpansionPanelContent,] }],
        _body: [{ type: core.ViewChild, args: ['body',] }]
    };
    /**
     * Actions of a `<mat-expansion-panel>`.
     */
    var MatExpansionPanelActionRow = /** @class */ (function () {
        function MatExpansionPanelActionRow() {
        }
        return MatExpansionPanelActionRow;
    }());
    MatExpansionPanelActionRow.decorators = [
        { type: core.Directive, args: [{
                    selector: 'mat-action-row',
                    host: {
                        class: 'mat-action-row'
                    }
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
     * Header element of a `<mat-expansion-panel>`.
     */
    var MatExpansionPanelHeader = /** @class */ (function () {
        function MatExpansionPanelHeader(panel, _element, _focusMonitor, _changeDetectorRef, defaultOptions, _animationMode) {
            var _this = this;
            this.panel = panel;
            this._element = _element;
            this._focusMonitor = _focusMonitor;
            this._changeDetectorRef = _changeDetectorRef;
            this._animationMode = _animationMode;
            this._parentChangeSubscription = rxjs.Subscription.EMPTY;
            var accordionHideToggleChange = panel.accordion ?
                panel.accordion._stateChanges.pipe(operators.filter(function (changes) { return !!(changes['hideToggle'] || changes['togglePosition']); })) :
                rxjs.EMPTY;
            // Since the toggle state depends on an @Input on the panel, we
            // need to subscribe and trigger change detection manually.
            this._parentChangeSubscription =
                rxjs.merge(panel.opened, panel.closed, accordionHideToggleChange, panel._inputChanges.pipe(operators.filter(function (changes) {
                    return !!(changes['hideToggle'] ||
                        changes['disabled'] ||
                        changes['togglePosition']);
                })))
                    .subscribe(function () { return _this._changeDetectorRef.markForCheck(); });
            // Avoids focus being lost if the panel contained the focused element and was closed.
            panel.closed
                .pipe(operators.filter(function () { return panel._containsFocus(); }))
                .subscribe(function () { return _focusMonitor.focusVia(_element, 'program'); });
            if (defaultOptions) {
                this.expandedHeight = defaultOptions.expandedHeight;
                this.collapsedHeight = defaultOptions.collapsedHeight;
            }
        }
        Object.defineProperty(MatExpansionPanelHeader.prototype, "disabled", {
            /**
             * Whether the associated panel is disabled. Implemented as a part of `FocusableOption`.
             * @docs-private
             */
            get: function () {
                return this.panel.disabled;
            },
            enumerable: false,
            configurable: true
        });
        /** Toggles the expanded state of the panel. */
        MatExpansionPanelHeader.prototype._toggle = function () {
            if (!this.disabled) {
                this.panel.toggle();
            }
        };
        /** Gets whether the panel is expanded. */
        MatExpansionPanelHeader.prototype._isExpanded = function () {
            return this.panel.expanded;
        };
        /** Gets the expanded state string of the panel. */
        MatExpansionPanelHeader.prototype._getExpandedState = function () {
            return this.panel._getExpandedState();
        };
        /** Gets the panel id. */
        MatExpansionPanelHeader.prototype._getPanelId = function () {
            return this.panel.id;
        };
        /** Gets the toggle position for the header. */
        MatExpansionPanelHeader.prototype._getTogglePosition = function () {
            return this.panel.togglePosition;
        };
        /** Gets whether the expand indicator should be shown. */
        MatExpansionPanelHeader.prototype._showToggle = function () {
            return !this.panel.hideToggle && !this.panel.disabled;
        };
        /**
         * Gets the current height of the header. Null if no custom height has been
         * specified, and if the default height from the stylesheet should be used.
         */
        MatExpansionPanelHeader.prototype._getHeaderHeight = function () {
            var isExpanded = this._isExpanded();
            if (isExpanded && this.expandedHeight) {
                return this.expandedHeight;
            }
            else if (!isExpanded && this.collapsedHeight) {
                return this.collapsedHeight;
            }
            return null;
        };
        /** Handle keydown event calling to toggle() if appropriate. */
        MatExpansionPanelHeader.prototype._keydown = function (event) {
            switch (event.keyCode) {
                // Toggle for space and enter keys.
                case keycodes.SPACE:
                case keycodes.ENTER:
                    if (!keycodes.hasModifierKey(event)) {
                        event.preventDefault();
                        this._toggle();
                    }
                    break;
                default:
                    if (this.panel.accordion) {
                        this.panel.accordion._handleHeaderKeydown(event);
                    }
                    return;
            }
        };
        /**
         * Focuses the panel header. Implemented as a part of `FocusableOption`.
         * @param origin Origin of the action that triggered the focus.
         * @docs-private
         */
        MatExpansionPanelHeader.prototype.focus = function (origin, options) {
            if (origin) {
                this._focusMonitor.focusVia(this._element, origin, options);
            }
            else {
                this._element.nativeElement.focus(options);
            }
        };
        MatExpansionPanelHeader.prototype.ngAfterViewInit = function () {
            var _this = this;
            this._focusMonitor.monitor(this._element).subscribe(function (origin) {
                if (origin && _this.panel.accordion) {
                    _this.panel.accordion._handleHeaderFocus(_this);
                }
            });
        };
        MatExpansionPanelHeader.prototype.ngOnDestroy = function () {
            this._parentChangeSubscription.unsubscribe();
            this._focusMonitor.stopMonitoring(this._element);
        };
        return MatExpansionPanelHeader;
    }());
    MatExpansionPanelHeader.decorators = [
        { type: core.Component, args: [{
                    selector: 'mat-expansion-panel-header',
                    template: "<span class=\"mat-content\">\n  <ng-content select=\"mat-panel-title\"></ng-content>\n  <ng-content select=\"mat-panel-description\"></ng-content>\n  <ng-content></ng-content>\n</span>\n<span [@indicatorRotate]=\"_getExpandedState()\" *ngIf=\"_showToggle()\"\n      class=\"mat-expansion-indicator\"></span>\n",
                    encapsulation: core.ViewEncapsulation.None,
                    changeDetection: core.ChangeDetectionStrategy.OnPush,
                    animations: [
                        matExpansionAnimations.indicatorRotate,
                    ],
                    host: {
                        'class': 'mat-expansion-panel-header mat-focus-indicator',
                        'role': 'button',
                        '[attr.id]': 'panel._headerId',
                        '[attr.tabindex]': 'disabled ? -1 : 0',
                        '[attr.aria-controls]': '_getPanelId()',
                        '[attr.aria-expanded]': '_isExpanded()',
                        '[attr.aria-disabled]': 'panel.disabled',
                        '[class.mat-expanded]': '_isExpanded()',
                        '[class.mat-expansion-toggle-indicator-after]': "_getTogglePosition() === 'after'",
                        '[class.mat-expansion-toggle-indicator-before]': "_getTogglePosition() === 'before'",
                        '[class._mat-animation-noopable]': '_animationMode === "NoopAnimations"',
                        '[style.height]': '_getHeaderHeight()',
                        '(click)': '_toggle()',
                        '(keydown)': '_keydown($event)',
                    },
                    styles: [".mat-expansion-panel-header{display:flex;flex-direction:row;align-items:center;padding:0 24px;border-radius:inherit;transition:height 225ms cubic-bezier(0.4, 0, 0.2, 1)}.mat-expansion-panel-header._mat-animation-noopable{transition:none}.mat-expansion-panel-header:focus,.mat-expansion-panel-header:hover{outline:none}.mat-expansion-panel-header.mat-expanded:focus,.mat-expansion-panel-header.mat-expanded:hover{background:inherit}.mat-expansion-panel-header:not([aria-disabled=true]){cursor:pointer}.mat-expansion-panel-header.mat-expansion-toggle-indicator-before{flex-direction:row-reverse}.mat-expansion-panel-header.mat-expansion-toggle-indicator-before .mat-expansion-indicator{margin:0 16px 0 0}[dir=rtl] .mat-expansion-panel-header.mat-expansion-toggle-indicator-before .mat-expansion-indicator{margin:0 0 0 16px}.mat-content{display:flex;flex:1;flex-direction:row;overflow:hidden}.mat-expansion-panel-header-title,.mat-expansion-panel-header-description{display:flex;flex-grow:1;margin-right:16px}[dir=rtl] .mat-expansion-panel-header-title,[dir=rtl] .mat-expansion-panel-header-description{margin-right:0;margin-left:16px}.mat-expansion-panel-header-description{flex-grow:2}.mat-expansion-indicator::after{border-style:solid;border-width:0 2px 2px 0;content:\"\";display:inline-block;padding:3px;transform:rotate(45deg);vertical-align:middle}.cdk-high-contrast-active .mat-expansion-panel .mat-expansion-panel-header.cdk-keyboard-focused:not([aria-disabled=true])::before,.cdk-high-contrast-active .mat-expansion-panel .mat-expansion-panel-header.cdk-program-focused:not([aria-disabled=true])::before,.cdk-high-contrast-active .mat-expansion-panel:not(.mat-expanded) .mat-expansion-panel-header:hover:not([aria-disabled=true])::before{top:0;left:0;right:0;bottom:0;position:absolute;box-sizing:border-box;pointer-events:none;border:3px solid;border-radius:4px;content:\"\"}\n"]
                },] }
    ];
    MatExpansionPanelHeader.ctorParameters = function () { return [
        { type: MatExpansionPanel, decorators: [{ type: core.Host }] },
        { type: core.ElementRef },
        { type: a11y.FocusMonitor },
        { type: core.ChangeDetectorRef },
        { type: undefined, decorators: [{ type: core.Inject, args: [MAT_EXPANSION_PANEL_DEFAULT_OPTIONS,] }, { type: core.Optional }] },
        { type: String, decorators: [{ type: core.Optional }, { type: core.Inject, args: [animations$1.ANIMATION_MODULE_TYPE,] }] }
    ]; };
    MatExpansionPanelHeader.propDecorators = {
        expandedHeight: [{ type: core.Input }],
        collapsedHeight: [{ type: core.Input }]
    };
    /**
     * Description element of a `<mat-expansion-panel-header>`.
     */
    var MatExpansionPanelDescription = /** @class */ (function () {
        function MatExpansionPanelDescription() {
        }
        return MatExpansionPanelDescription;
    }());
    MatExpansionPanelDescription.decorators = [
        { type: core.Directive, args: [{
                    selector: 'mat-panel-description',
                    host: {
                        class: 'mat-expansion-panel-header-description'
                    }
                },] }
    ];
    /**
     * Title element of a `<mat-expansion-panel-header>`.
     */
    var MatExpansionPanelTitle = /** @class */ (function () {
        function MatExpansionPanelTitle() {
        }
        return MatExpansionPanelTitle;
    }());
    MatExpansionPanelTitle.decorators = [
        { type: core.Directive, args: [{
                    selector: 'mat-panel-title',
                    host: {
                        class: 'mat-expansion-panel-header-title'
                    }
                },] }
    ];

    /**
     * Directive for a Material Design Accordion.
     */
    var MatAccordion = /** @class */ (function (_super) {
        __extends(MatAccordion, _super);
        function MatAccordion() {
            var _this = _super.apply(this, __spreadArray([], __read(arguments))) || this;
            /** Headers belonging to this accordion. */
            _this._ownHeaders = new core.QueryList();
            _this._hideToggle = false;
            /**
             * Display mode used for all expansion panels in the accordion. Currently two display
             * modes exist:
             *  default - a gutter-like spacing is placed around any expanded panel, placing the expanded
             *     panel at a different elevation from the rest of the accordion.
             *  flat - no spacing is placed around expanded panels, showing all panels at the same
             *     elevation.
             */
            _this.displayMode = 'default';
            /** The position of the expansion indicator. */
            _this.togglePosition = 'after';
            return _this;
        }
        Object.defineProperty(MatAccordion.prototype, "hideToggle", {
            /** Whether the expansion indicator should be hidden. */
            get: function () { return this._hideToggle; },
            set: function (show) { this._hideToggle = coercion.coerceBooleanProperty(show); },
            enumerable: false,
            configurable: true
        });
        MatAccordion.prototype.ngAfterContentInit = function () {
            var _this = this;
            this._headers.changes
                .pipe(operators.startWith(this._headers))
                .subscribe(function (headers) {
                _this._ownHeaders.reset(headers.filter(function (header) { return header.panel.accordion === _this; }));
                _this._ownHeaders.notifyOnChanges();
            });
            this._keyManager = new a11y.FocusKeyManager(this._ownHeaders).withWrap().withHomeAndEnd();
        };
        /** Handles keyboard events coming in from the panel headers. */
        MatAccordion.prototype._handleHeaderKeydown = function (event) {
            this._keyManager.onKeydown(event);
        };
        MatAccordion.prototype._handleHeaderFocus = function (header) {
            this._keyManager.updateActiveItem(header);
        };
        MatAccordion.prototype.ngOnDestroy = function () {
            _super.prototype.ngOnDestroy.call(this);
            this._ownHeaders.destroy();
        };
        return MatAccordion;
    }(accordion.CdkAccordion));
    MatAccordion.decorators = [
        { type: core.Directive, args: [{
                    selector: 'mat-accordion',
                    exportAs: 'matAccordion',
                    inputs: ['multi'],
                    providers: [{
                            provide: MAT_ACCORDION,
                            useExisting: MatAccordion
                        }],
                    host: {
                        class: 'mat-accordion',
                        // Class binding which is only used by the test harness as there is no other
                        // way for the harness to detect if multiple panel support is enabled.
                        '[class.mat-accordion-multi]': 'this.multi',
                    }
                },] }
    ];
    MatAccordion.propDecorators = {
        _headers: [{ type: core.ContentChildren, args: [MatExpansionPanelHeader, { descendants: true },] }],
        hideToggle: [{ type: core.Input }],
        displayMode: [{ type: core.Input }],
        togglePosition: [{ type: core.Input }]
    };

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var MatExpansionModule = /** @class */ (function () {
        function MatExpansionModule() {
        }
        return MatExpansionModule;
    }());
    MatExpansionModule.decorators = [
        { type: core.NgModule, args: [{
                    imports: [common.CommonModule, core$1.MatCommonModule, accordion.CdkAccordionModule, portal.PortalModule],
                    exports: [
                        MatAccordion,
                        MatExpansionPanel,
                        MatExpansionPanelActionRow,
                        MatExpansionPanelHeader,
                        MatExpansionPanelTitle,
                        MatExpansionPanelDescription,
                        MatExpansionPanelContent,
                    ],
                    declarations: [
                        MatAccordion,
                        MatExpansionPanel,
                        MatExpansionPanelActionRow,
                        MatExpansionPanelHeader,
                        MatExpansionPanelTitle,
                        MatExpansionPanelDescription,
                        MatExpansionPanelContent,
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

    exports.EXPANSION_PANEL_ANIMATION_TIMING = EXPANSION_PANEL_ANIMATION_TIMING;
    exports.MAT_ACCORDION = MAT_ACCORDION;
    exports.MAT_EXPANSION_PANEL_DEFAULT_OPTIONS = MAT_EXPANSION_PANEL_DEFAULT_OPTIONS;
    exports.MatAccordion = MatAccordion;
    exports.MatExpansionModule = MatExpansionModule;
    exports.MatExpansionPanel = MatExpansionPanel;
    exports.MatExpansionPanelActionRow = MatExpansionPanelActionRow;
    exports.MatExpansionPanelContent = MatExpansionPanelContent;
    exports.MatExpansionPanelDescription = MatExpansionPanelDescription;
    exports.MatExpansionPanelHeader = MatExpansionPanelHeader;
    exports.MatExpansionPanelTitle = MatExpansionPanelTitle;
    exports.matExpansionAnimations = matExpansionAnimations;
    exports.ɵ0 = ɵ0;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=material-expansion.umd.js.map
