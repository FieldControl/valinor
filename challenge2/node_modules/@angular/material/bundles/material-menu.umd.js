(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/cdk/a11y'), require('@angular/cdk/coercion'), require('@angular/cdk/keycodes'), require('@angular/core'), require('rxjs'), require('rxjs/operators'), require('@angular/animations'), require('@angular/cdk/portal'), require('@angular/common'), require('@angular/material/core'), require('@angular/cdk/bidi'), require('@angular/cdk/overlay'), require('@angular/cdk/platform'), require('@angular/cdk/scrolling')) :
    typeof define === 'function' && define.amd ? define('@angular/material/menu', ['exports', '@angular/cdk/a11y', '@angular/cdk/coercion', '@angular/cdk/keycodes', '@angular/core', 'rxjs', 'rxjs/operators', '@angular/animations', '@angular/cdk/portal', '@angular/common', '@angular/material/core', '@angular/cdk/bidi', '@angular/cdk/overlay', '@angular/cdk/platform', '@angular/cdk/scrolling'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.ng = global.ng || {}, global.ng.material = global.ng.material || {}, global.ng.material.menu = {}), global.ng.cdk.a11y, global.ng.cdk.coercion, global.ng.cdk.keycodes, global.ng.core, global.rxjs, global.rxjs.operators, global.ng.animations, global.ng.cdk.portal, global.ng.common, global.ng.material.core, global.ng.cdk.bidi, global.ng.cdk.overlay, global.ng.cdk.platform, global.ng.cdk.scrolling));
}(this, (function (exports, a11y, coercion, keycodes, core, rxjs, operators, animations, portal, common, core$1, bidi, overlay, platform, scrolling) { 'use strict';

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
     * Animations used by the mat-menu component.
     * Animation duration and timing values are based on:
     * https://material.io/guidelines/components/menus.html#menus-usage
     * @docs-private
     */
    var matMenuAnimations = {
        /**
         * This animation controls the menu panel's entry and exit from the page.
         *
         * When the menu panel is added to the DOM, it scales in and fades in its border.
         *
         * When the menu panel is removed from the DOM, it simply fades out after a brief
         * delay to display the ripple.
         */
        transformMenu: animations.trigger('transformMenu', [
            animations.state('void', animations.style({
                opacity: 0,
                transform: 'scale(0.8)'
            })),
            animations.transition('void => enter', animations.animate('120ms cubic-bezier(0, 0, 0.2, 1)', animations.style({
                opacity: 1,
                transform: 'scale(1)'
            }))),
            animations.transition('* => void', animations.animate('100ms 25ms linear', animations.style({ opacity: 0 })))
        ]),
        /**
         * This animation fades in the background color and content of the menu panel
         * after its containing element is scaled in.
         */
        fadeInItems: animations.trigger('fadeInItems', [
            // TODO(crisbeto): this is inside the `transformMenu`
            // now. Remove next time we do breaking changes.
            animations.state('showing', animations.style({ opacity: 1 })),
            animations.transition('void => *', [
                animations.style({ opacity: 0 }),
                animations.animate('400ms 100ms cubic-bezier(0.55, 0, 0.55, 0.2)')
            ])
        ])
    };
    /**
     * @deprecated
     * @breaking-change 8.0.0
     * @docs-private
     */
    var fadeInItems = matMenuAnimations.fadeInItems;
    /**
     * @deprecated
     * @breaking-change 8.0.0
     * @docs-private
     */
    var transformMenu = matMenuAnimations.transformMenu;

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /**
     * Injection token that can be used to reference instances of `MatMenuContent`. It serves
     * as alternative token to the actual `MatMenuContent` class which could cause unnecessary
     * retention of the class and its directive metadata.
     */
    var MAT_MENU_CONTENT = new core.InjectionToken('MatMenuContent');
    /**
     * Menu content that will be rendered lazily once the menu is opened.
     */
    var MatMenuContent = /** @class */ (function () {
        function MatMenuContent(_template, _componentFactoryResolver, _appRef, _injector, _viewContainerRef, _document, _changeDetectorRef) {
            this._template = _template;
            this._componentFactoryResolver = _componentFactoryResolver;
            this._appRef = _appRef;
            this._injector = _injector;
            this._viewContainerRef = _viewContainerRef;
            this._document = _document;
            this._changeDetectorRef = _changeDetectorRef;
            /** Emits when the menu content has been attached. */
            this._attached = new rxjs.Subject();
        }
        /**
         * Attaches the content with a particular context.
         * @docs-private
         */
        MatMenuContent.prototype.attach = function (context) {
            if (context === void 0) { context = {}; }
            if (!this._portal) {
                this._portal = new portal.TemplatePortal(this._template, this._viewContainerRef);
            }
            this.detach();
            if (!this._outlet) {
                this._outlet = new portal.DomPortalOutlet(this._document.createElement('div'), this._componentFactoryResolver, this._appRef, this._injector);
            }
            var element = this._template.elementRef.nativeElement;
            // Because we support opening the same menu from different triggers (which in turn have their
            // own `OverlayRef` panel), we have to re-insert the host element every time, otherwise we
            // risk it staying attached to a pane that's no longer in the DOM.
            element.parentNode.insertBefore(this._outlet.outletElement, element);
            // When `MatMenuContent` is used in an `OnPush` component, the insertion of the menu
            // content via `createEmbeddedView` does not cause the content to be seen as "dirty"
            // by Angular. This causes the `@ContentChildren` for menu items within the menu to
            // not be updated by Angular. By explicitly marking for check here, we tell Angular that
            // it needs to check for new menu items and update the `@ContentChild` in `MatMenu`.
            // @breaking-change 9.0.0 Make change detector ref required
            if (this._changeDetectorRef) {
                this._changeDetectorRef.markForCheck();
            }
            this._portal.attach(this._outlet, context);
            this._attached.next();
        };
        /**
         * Detaches the content.
         * @docs-private
         */
        MatMenuContent.prototype.detach = function () {
            if (this._portal.isAttached) {
                this._portal.detach();
            }
        };
        MatMenuContent.prototype.ngOnDestroy = function () {
            if (this._outlet) {
                this._outlet.dispose();
            }
        };
        return MatMenuContent;
    }());
    MatMenuContent.decorators = [
        { type: core.Directive, args: [{
                    selector: 'ng-template[matMenuContent]',
                    providers: [{ provide: MAT_MENU_CONTENT, useExisting: MatMenuContent }],
                },] }
    ];
    MatMenuContent.ctorParameters = function () { return [
        { type: core.TemplateRef },
        { type: core.ComponentFactoryResolver },
        { type: core.ApplicationRef },
        { type: core.Injector },
        { type: core.ViewContainerRef },
        { type: undefined, decorators: [{ type: core.Inject, args: [common.DOCUMENT,] }] },
        { type: core.ChangeDetectorRef }
    ]; };

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /**
     * Throws an exception for the case when menu trigger doesn't have a valid mat-menu instance
     * @docs-private
     */
    function throwMatMenuMissingError() {
        throw Error("matMenuTriggerFor: must pass in an mat-menu instance.\n\n    Example:\n      <mat-menu #menu=\"matMenu\"></mat-menu>\n      <button [matMenuTriggerFor]=\"menu\"></button>");
    }
    /**
     * Throws an exception for the case when menu's x-position value isn't valid.
     * In other words, it doesn't match 'before' or 'after'.
     * @docs-private
     */
    function throwMatMenuInvalidPositionX() {
        throw Error("xPosition value must be either 'before' or after'.\n      Example: <mat-menu xPosition=\"before\" #menu=\"matMenu\"></mat-menu>");
    }
    /**
     * Throws an exception for the case when menu's y-position value isn't valid.
     * In other words, it doesn't match 'above' or 'below'.
     * @docs-private
     */
    function throwMatMenuInvalidPositionY() {
        throw Error("yPosition value must be either 'above' or below'.\n      Example: <mat-menu yPosition=\"above\" #menu=\"matMenu\"></mat-menu>");
    }
    /**
     * Throws an exception for the case when a menu is assigned
     * to a trigger that is placed inside the same menu.
     * @docs-private
     */
    function throwMatMenuRecursiveError() {
        throw Error("matMenuTriggerFor: menu cannot contain its own trigger. Assign a menu that is " +
            "not a parent of the trigger or move the trigger outside of the menu.");
    }

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /**
     * Injection token used to provide the parent menu to menu-specific components.
     * @docs-private
     */
    var MAT_MENU_PANEL = new core.InjectionToken('MAT_MENU_PANEL');

    // Boilerplate for applying mixins to MatMenuItem.
    /** @docs-private */
    var MatMenuItemBase = /** @class */ (function () {
        function MatMenuItemBase() {
        }
        return MatMenuItemBase;
    }());
    var _MatMenuItemMixinBase = core$1.mixinDisableRipple(core$1.mixinDisabled(MatMenuItemBase));
    /**
     * Single item inside of a `mat-menu`. Provides the menu item styling and accessibility treatment.
     */
    var MatMenuItem = /** @class */ (function (_super) {
        __extends(MatMenuItem, _super);
        function MatMenuItem(_elementRef, 
        /**
         * @deprecated `_document` parameter is no longer being used and will be removed.
         * @breaking-change 12.0.0
         */
        _document, _focusMonitor, _parentMenu) {
            var _this = 
            // @breaking-change 8.0.0 make `_focusMonitor` and `document` required params.
            _super.call(this) || this;
            _this._elementRef = _elementRef;
            _this._focusMonitor = _focusMonitor;
            _this._parentMenu = _parentMenu;
            /** ARIA role for the menu item. */
            _this.role = 'menuitem';
            /** Stream that emits when the menu item is hovered. */
            _this._hovered = new rxjs.Subject();
            /** Stream that emits when the menu item is focused. */
            _this._focused = new rxjs.Subject();
            /** Whether the menu item is highlighted. */
            _this._highlighted = false;
            /** Whether the menu item acts as a trigger for a sub-menu. */
            _this._triggersSubmenu = false;
            if (_parentMenu && _parentMenu.addItem) {
                _parentMenu.addItem(_this);
            }
            return _this;
        }
        /** Focuses the menu item. */
        MatMenuItem.prototype.focus = function (origin, options) {
            if (this._focusMonitor && origin) {
                this._focusMonitor.focusVia(this._getHostElement(), origin, options);
            }
            else {
                this._getHostElement().focus(options);
            }
            this._focused.next(this);
        };
        MatMenuItem.prototype.ngAfterViewInit = function () {
            if (this._focusMonitor) {
                // Start monitoring the element so it gets the appropriate focused classes. We want
                // to show the focus style for menu items only when the focus was not caused by a
                // mouse or touch interaction.
                this._focusMonitor.monitor(this._elementRef, false);
            }
        };
        MatMenuItem.prototype.ngOnDestroy = function () {
            if (this._focusMonitor) {
                this._focusMonitor.stopMonitoring(this._elementRef);
            }
            if (this._parentMenu && this._parentMenu.removeItem) {
                this._parentMenu.removeItem(this);
            }
            this._hovered.complete();
            this._focused.complete();
        };
        /** Used to set the `tabindex`. */
        MatMenuItem.prototype._getTabIndex = function () {
            return this.disabled ? '-1' : '0';
        };
        /** Returns the host DOM element. */
        MatMenuItem.prototype._getHostElement = function () {
            return this._elementRef.nativeElement;
        };
        /** Prevents the default element actions if it is disabled. */
        // We have to use a `HostListener` here in order to support both Ivy and ViewEngine.
        // In Ivy the `host` bindings will be merged when this class is extended, whereas in
        // ViewEngine they're overwritten.
        // TODO(crisbeto): we move this back into `host` once Ivy is turned on by default.
        // tslint:disable-next-line:no-host-decorator-in-concrete
        MatMenuItem.prototype._checkDisabled = function (event) {
            if (this.disabled) {
                event.preventDefault();
                event.stopPropagation();
            }
        };
        /** Emits to the hover stream. */
        // We have to use a `HostListener` here in order to support both Ivy and ViewEngine.
        // In Ivy the `host` bindings will be merged when this class is extended, whereas in
        // ViewEngine they're overwritten.
        // TODO(crisbeto): we move this back into `host` once Ivy is turned on by default.
        // tslint:disable-next-line:no-host-decorator-in-concrete
        MatMenuItem.prototype._handleMouseEnter = function () {
            this._hovered.next(this);
        };
        /** Gets the label to be used when determining whether the option should be focused. */
        MatMenuItem.prototype.getLabel = function () {
            var _a, _b;
            var clone = this._elementRef.nativeElement.cloneNode(true);
            var icons = clone.querySelectorAll('mat-icon, .material-icons');
            // Strip away icons so they don't show up in the text.
            for (var i = 0; i < icons.length; i++) {
                var icon = icons[i];
                (_a = icon.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(icon);
            }
            return ((_b = clone.textContent) === null || _b === void 0 ? void 0 : _b.trim()) || '';
        };
        return MatMenuItem;
    }(_MatMenuItemMixinBase));
    MatMenuItem.decorators = [
        { type: core.Component, args: [{
                    selector: '[mat-menu-item]',
                    exportAs: 'matMenuItem',
                    inputs: ['disabled', 'disableRipple'],
                    host: {
                        '[attr.role]': 'role',
                        '[class.mat-menu-item]': 'true',
                        '[class.mat-menu-item-highlighted]': '_highlighted',
                        '[class.mat-menu-item-submenu-trigger]': '_triggersSubmenu',
                        '[attr.tabindex]': '_getTabIndex()',
                        '[attr.aria-disabled]': 'disabled.toString()',
                        '[attr.disabled]': 'disabled || null',
                        'class': 'mat-focus-indicator',
                    },
                    changeDetection: core.ChangeDetectionStrategy.OnPush,
                    encapsulation: core.ViewEncapsulation.None,
                    template: "<ng-content></ng-content>\n<div class=\"mat-menu-ripple\" matRipple\n     [matRippleDisabled]=\"disableRipple || disabled\"\n     [matRippleTrigger]=\"_getHostElement()\">\n</div>\n"
                },] }
    ];
    MatMenuItem.ctorParameters = function () { return [
        { type: core.ElementRef },
        { type: undefined, decorators: [{ type: core.Inject, args: [common.DOCUMENT,] }] },
        { type: a11y.FocusMonitor },
        { type: undefined, decorators: [{ type: core.Inject, args: [MAT_MENU_PANEL,] }, { type: core.Optional }] }
    ]; };
    MatMenuItem.propDecorators = {
        role: [{ type: core.Input }],
        _checkDisabled: [{ type: core.HostListener, args: ['click', ['$event'],] }],
        _handleMouseEnter: [{ type: core.HostListener, args: ['mouseenter',] }]
    };

    /** Injection token to be used to override the default options for `mat-menu`. */
    var MAT_MENU_DEFAULT_OPTIONS = new core.InjectionToken('mat-menu-default-options', {
        providedIn: 'root',
        factory: MAT_MENU_DEFAULT_OPTIONS_FACTORY
    });
    /** @docs-private */
    function MAT_MENU_DEFAULT_OPTIONS_FACTORY() {
        return {
            overlapTrigger: false,
            xPosition: 'after',
            yPosition: 'below',
            backdropClass: 'cdk-overlay-transparent-backdrop',
        };
    }
    /**
     * Start elevation for the menu panel.
     * @docs-private
     */
    var MAT_MENU_BASE_ELEVATION = 4;
    var menuPanelUid = 0;
    /** Base class with all of the `MatMenu` functionality. */
    var _MatMenuBase = /** @class */ (function () {
        function _MatMenuBase(_elementRef, _ngZone, _defaultOptions) {
            this._elementRef = _elementRef;
            this._ngZone = _ngZone;
            this._defaultOptions = _defaultOptions;
            this._xPosition = this._defaultOptions.xPosition;
            this._yPosition = this._defaultOptions.yPosition;
            /** Only the direct descendant menu items. */
            this._directDescendantItems = new core.QueryList();
            /** Subscription to tab events on the menu panel */
            this._tabSubscription = rxjs.Subscription.EMPTY;
            /** Config object to be passed into the menu's ngClass */
            this._classList = {};
            /** Current state of the panel animation. */
            this._panelAnimationState = 'void';
            /** Emits whenever an animation on the menu completes. */
            this._animationDone = new rxjs.Subject();
            /** Class or list of classes to be added to the overlay panel. */
            this.overlayPanelClass = this._defaultOptions.overlayPanelClass || '';
            /** Class to be added to the backdrop element. */
            this.backdropClass = this._defaultOptions.backdropClass;
            this._overlapTrigger = this._defaultOptions.overlapTrigger;
            this._hasBackdrop = this._defaultOptions.hasBackdrop;
            /** Event emitted when the menu is closed. */
            this.closed = new core.EventEmitter();
            /**
             * Event emitted when the menu is closed.
             * @deprecated Switch to `closed` instead
             * @breaking-change 8.0.0
             */
            this.close = this.closed;
            this.panelId = "mat-menu-panel-" + menuPanelUid++;
        }
        Object.defineProperty(_MatMenuBase.prototype, "xPosition", {
            /** Position of the menu in the X axis. */
            get: function () { return this._xPosition; },
            set: function (value) {
                if (value !== 'before' && value !== 'after' &&
                    (typeof ngDevMode === 'undefined' || ngDevMode)) {
                    throwMatMenuInvalidPositionX();
                }
                this._xPosition = value;
                this.setPositionClasses();
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(_MatMenuBase.prototype, "yPosition", {
            /** Position of the menu in the Y axis. */
            get: function () { return this._yPosition; },
            set: function (value) {
                if (value !== 'above' && value !== 'below' && (typeof ngDevMode === 'undefined' || ngDevMode)) {
                    throwMatMenuInvalidPositionY();
                }
                this._yPosition = value;
                this.setPositionClasses();
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(_MatMenuBase.prototype, "overlapTrigger", {
            /** Whether the menu should overlap its trigger. */
            get: function () { return this._overlapTrigger; },
            set: function (value) {
                this._overlapTrigger = coercion.coerceBooleanProperty(value);
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(_MatMenuBase.prototype, "hasBackdrop", {
            /** Whether the menu has a backdrop. */
            get: function () { return this._hasBackdrop; },
            set: function (value) {
                this._hasBackdrop = coercion.coerceBooleanProperty(value);
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(_MatMenuBase.prototype, "panelClass", {
            /**
             * This method takes classes set on the host mat-menu element and applies them on the
             * menu template that displays in the overlay container.  Otherwise, it's difficult
             * to style the containing menu from outside the component.
             * @param classes list of class names
             */
            set: function (classes) {
                var _this = this;
                var previousPanelClass = this._previousPanelClass;
                if (previousPanelClass && previousPanelClass.length) {
                    previousPanelClass.split(' ').forEach(function (className) {
                        _this._classList[className] = false;
                    });
                }
                this._previousPanelClass = classes;
                if (classes && classes.length) {
                    classes.split(' ').forEach(function (className) {
                        _this._classList[className] = true;
                    });
                    this._elementRef.nativeElement.className = '';
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(_MatMenuBase.prototype, "classList", {
            /**
             * This method takes classes set on the host mat-menu element and applies them on the
             * menu template that displays in the overlay container.  Otherwise, it's difficult
             * to style the containing menu from outside the component.
             * @deprecated Use `panelClass` instead.
             * @breaking-change 8.0.0
             */
            get: function () { return this.panelClass; },
            set: function (classes) { this.panelClass = classes; },
            enumerable: false,
            configurable: true
        });
        _MatMenuBase.prototype.ngOnInit = function () {
            this.setPositionClasses();
        };
        _MatMenuBase.prototype.ngAfterContentInit = function () {
            var _this = this;
            this._updateDirectDescendants();
            this._keyManager = new a11y.FocusKeyManager(this._directDescendantItems)
                .withWrap()
                .withTypeAhead()
                .withHomeAndEnd();
            this._tabSubscription = this._keyManager.tabOut.subscribe(function () { return _this.closed.emit('tab'); });
            // If a user manually (programmatically) focuses a menu item, we need to reflect that focus
            // change back to the key manager. Note that we don't need to unsubscribe here because _focused
            // is internal and we know that it gets completed on destroy.
            this._directDescendantItems.changes.pipe(operators.startWith(this._directDescendantItems), operators.switchMap(function (items) { return rxjs.merge.apply(void 0, __spreadArray([], __read(items.map(function (item) { return item._focused; })))); })).subscribe(function (focusedItem) { return _this._keyManager.updateActiveItem(focusedItem); });
        };
        _MatMenuBase.prototype.ngOnDestroy = function () {
            this._directDescendantItems.destroy();
            this._tabSubscription.unsubscribe();
            this.closed.complete();
        };
        /** Stream that emits whenever the hovered menu item changes. */
        _MatMenuBase.prototype._hovered = function () {
            // Coerce the `changes` property because Angular types it as `Observable<any>`
            var itemChanges = this._directDescendantItems.changes;
            return itemChanges.pipe(operators.startWith(this._directDescendantItems), operators.switchMap(function (items) { return rxjs.merge.apply(void 0, __spreadArray([], __read(items.map(function (item) { return item._hovered; })))); }));
        };
        /*
         * Registers a menu item with the menu.
         * @docs-private
         * @deprecated No longer being used. To be removed.
         * @breaking-change 9.0.0
         */
        _MatMenuBase.prototype.addItem = function (_item) { };
        /**
         * Removes an item from the menu.
         * @docs-private
         * @deprecated No longer being used. To be removed.
         * @breaking-change 9.0.0
         */
        _MatMenuBase.prototype.removeItem = function (_item) { };
        /** Handle a keyboard event from the menu, delegating to the appropriate action. */
        _MatMenuBase.prototype._handleKeydown = function (event) {
            var keyCode = event.keyCode;
            var manager = this._keyManager;
            switch (keyCode) {
                case keycodes.ESCAPE:
                    if (!keycodes.hasModifierKey(event)) {
                        event.preventDefault();
                        this.closed.emit('keydown');
                    }
                    break;
                case keycodes.LEFT_ARROW:
                    if (this.parentMenu && this.direction === 'ltr') {
                        this.closed.emit('keydown');
                    }
                    break;
                case keycodes.RIGHT_ARROW:
                    if (this.parentMenu && this.direction === 'rtl') {
                        this.closed.emit('keydown');
                    }
                    break;
                default:
                    if (keyCode === keycodes.UP_ARROW || keyCode === keycodes.DOWN_ARROW) {
                        manager.setFocusOrigin('keyboard');
                    }
                    manager.onKeydown(event);
            }
        };
        /**
         * Focus the first item in the menu.
         * @param origin Action from which the focus originated. Used to set the correct styling.
         */
        _MatMenuBase.prototype.focusFirstItem = function (origin) {
            var _this = this;
            if (origin === void 0) { origin = 'program'; }
            // When the content is rendered lazily, it takes a bit before the items are inside the DOM.
            if (this.lazyContent) {
                this._ngZone.onStable
                    .pipe(operators.take(1))
                    .subscribe(function () { return _this._focusFirstItem(origin); });
            }
            else {
                this._focusFirstItem(origin);
            }
        };
        /**
         * Actual implementation that focuses the first item. Needs to be separated
         * out so we don't repeat the same logic in the public `focusFirstItem` method.
         */
        _MatMenuBase.prototype._focusFirstItem = function (origin) {
            var manager = this._keyManager;
            manager.setFocusOrigin(origin).setFirstItemActive();
            // If there's no active item at this point, it means that all the items are disabled.
            // Move focus to the menu panel so keyboard events like Escape still work. Also this will
            // give _some_ feedback to screen readers.
            if (!manager.activeItem && this._directDescendantItems.length) {
                var element = this._directDescendantItems.first._getHostElement().parentElement;
                // Because the `mat-menu` is at the DOM insertion point, not inside the overlay, we don't
                // have a nice way of getting a hold of the menu panel. We can't use a `ViewChild` either
                // because the panel is inside an `ng-template`. We work around it by starting from one of
                // the items and walking up the DOM.
                while (element) {
                    if (element.getAttribute('role') === 'menu') {
                        element.focus();
                        break;
                    }
                    else {
                        element = element.parentElement;
                    }
                }
            }
        };
        /**
         * Resets the active item in the menu. This is used when the menu is opened, allowing
         * the user to start from the first option when pressing the down arrow.
         */
        _MatMenuBase.prototype.resetActiveItem = function () {
            this._keyManager.setActiveItem(-1);
        };
        /**
         * Sets the menu panel elevation.
         * @param depth Number of parent menus that come before the menu.
         */
        _MatMenuBase.prototype.setElevation = function (depth) {
            // The elevation starts at the base and increases by one for each level.
            // Capped at 24 because that's the maximum elevation defined in the Material design spec.
            var elevation = Math.min(MAT_MENU_BASE_ELEVATION + depth, 24);
            var newElevation = "mat-elevation-z" + elevation;
            var customElevation = Object.keys(this._classList).find(function (c) { return c.startsWith('mat-elevation-z'); });
            if (!customElevation || customElevation === this._previousElevation) {
                if (this._previousElevation) {
                    this._classList[this._previousElevation] = false;
                }
                this._classList[newElevation] = true;
                this._previousElevation = newElevation;
            }
        };
        /**
         * Adds classes to the menu panel based on its position. Can be used by
         * consumers to add specific styling based on the position.
         * @param posX Position of the menu along the x axis.
         * @param posY Position of the menu along the y axis.
         * @docs-private
         */
        _MatMenuBase.prototype.setPositionClasses = function (posX, posY) {
            if (posX === void 0) { posX = this.xPosition; }
            if (posY === void 0) { posY = this.yPosition; }
            var classes = this._classList;
            classes['mat-menu-before'] = posX === 'before';
            classes['mat-menu-after'] = posX === 'after';
            classes['mat-menu-above'] = posY === 'above';
            classes['mat-menu-below'] = posY === 'below';
        };
        /** Starts the enter animation. */
        _MatMenuBase.prototype._startAnimation = function () {
            // @breaking-change 8.0.0 Combine with _resetAnimation.
            this._panelAnimationState = 'enter';
        };
        /** Resets the panel animation to its initial state. */
        _MatMenuBase.prototype._resetAnimation = function () {
            // @breaking-change 8.0.0 Combine with _startAnimation.
            this._panelAnimationState = 'void';
        };
        /** Callback that is invoked when the panel animation completes. */
        _MatMenuBase.prototype._onAnimationDone = function (event) {
            this._animationDone.next(event);
            this._isAnimating = false;
        };
        _MatMenuBase.prototype._onAnimationStart = function (event) {
            this._isAnimating = true;
            // Scroll the content element to the top as soon as the animation starts. This is necessary,
            // because we move focus to the first item while it's still being animated, which can throw
            // the browser off when it determines the scroll position. Alternatively we can move focus
            // when the animation is done, however moving focus asynchronously will interrupt screen
            // readers which are in the process of reading out the menu already. We take the `element`
            // from the `event` since we can't use a `ViewChild` to access the pane.
            if (event.toState === 'enter' && this._keyManager.activeItemIndex === 0) {
                event.element.scrollTop = 0;
            }
        };
        /**
         * Sets up a stream that will keep track of any newly-added menu items and will update the list
         * of direct descendants. We collect the descendants this way, because `_allItems` can include
         * items that are part of child menus, and using a custom way of registering items is unreliable
         * when it comes to maintaining the item order.
         */
        _MatMenuBase.prototype._updateDirectDescendants = function () {
            var _this = this;
            this._allItems.changes
                .pipe(operators.startWith(this._allItems))
                .subscribe(function (items) {
                _this._directDescendantItems.reset(items.filter(function (item) { return item._parentMenu === _this; }));
                _this._directDescendantItems.notifyOnChanges();
            });
        };
        return _MatMenuBase;
    }());
    _MatMenuBase.decorators = [
        { type: core.Directive }
    ];
    _MatMenuBase.ctorParameters = function () { return [
        { type: core.ElementRef },
        { type: core.NgZone },
        { type: undefined, decorators: [{ type: core.Inject, args: [MAT_MENU_DEFAULT_OPTIONS,] }] }
    ]; };
    _MatMenuBase.propDecorators = {
        _allItems: [{ type: core.ContentChildren, args: [MatMenuItem, { descendants: true },] }],
        backdropClass: [{ type: core.Input }],
        ariaLabel: [{ type: core.Input, args: ['aria-label',] }],
        ariaLabelledby: [{ type: core.Input, args: ['aria-labelledby',] }],
        ariaDescribedby: [{ type: core.Input, args: ['aria-describedby',] }],
        xPosition: [{ type: core.Input }],
        yPosition: [{ type: core.Input }],
        templateRef: [{ type: core.ViewChild, args: [core.TemplateRef,] }],
        items: [{ type: core.ContentChildren, args: [MatMenuItem, { descendants: false },] }],
        lazyContent: [{ type: core.ContentChild, args: [MAT_MENU_CONTENT,] }],
        overlapTrigger: [{ type: core.Input }],
        hasBackdrop: [{ type: core.Input }],
        panelClass: [{ type: core.Input, args: ['class',] }],
        classList: [{ type: core.Input }],
        closed: [{ type: core.Output }],
        close: [{ type: core.Output }]
    };
    /** @docs-public MatMenu */
    var MatMenu = /** @class */ (function (_super) {
        __extends(MatMenu, _super);
        function MatMenu(elementRef, ngZone, defaultOptions) {
            return _super.call(this, elementRef, ngZone, defaultOptions) || this;
        }
        return MatMenu;
    }(_MatMenuBase));
    MatMenu.decorators = [
        { type: core.Component, args: [{
                    selector: 'mat-menu',
                    template: "<ng-template>\n  <div\n    class=\"mat-menu-panel\"\n    [id]=\"panelId\"\n    [ngClass]=\"_classList\"\n    (keydown)=\"_handleKeydown($event)\"\n    (click)=\"closed.emit('click')\"\n    [@transformMenu]=\"_panelAnimationState\"\n    (@transformMenu.start)=\"_onAnimationStart($event)\"\n    (@transformMenu.done)=\"_onAnimationDone($event)\"\n    tabindex=\"-1\"\n    role=\"menu\"\n    [attr.aria-label]=\"ariaLabel || null\"\n    [attr.aria-labelledby]=\"ariaLabelledby || null\"\n    [attr.aria-describedby]=\"ariaDescribedby || null\">\n    <div class=\"mat-menu-content\">\n      <ng-content></ng-content>\n    </div>\n  </div>\n</ng-template>\n",
                    changeDetection: core.ChangeDetectionStrategy.OnPush,
                    encapsulation: core.ViewEncapsulation.None,
                    exportAs: 'matMenu',
                    host: {
                        '[attr.aria-label]': 'null',
                        '[attr.aria-labelledby]': 'null',
                        '[attr.aria-describedby]': 'null',
                    },
                    animations: [
                        matMenuAnimations.transformMenu,
                        matMenuAnimations.fadeInItems
                    ],
                    providers: [
                        { provide: MAT_MENU_PANEL, useExisting: MatMenu },
                    ],
                    styles: ["mat-menu{display:none}.mat-menu-panel{min-width:112px;max-width:280px;overflow:auto;-webkit-overflow-scrolling:touch;max-height:calc(100vh - 48px);border-radius:4px;outline:0;min-height:64px}.mat-menu-panel.ng-animating{pointer-events:none}.cdk-high-contrast-active .mat-menu-panel{outline:solid 1px}.mat-menu-content:not(:empty){padding-top:8px;padding-bottom:8px}.mat-menu-item{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;cursor:pointer;outline:none;border:none;-webkit-tap-highlight-color:transparent;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block;line-height:48px;height:48px;padding:0 16px;text-align:left;text-decoration:none;max-width:100%;position:relative}.mat-menu-item::-moz-focus-inner{border:0}.mat-menu-item[disabled]{cursor:default}[dir=rtl] .mat-menu-item{text-align:right}.mat-menu-item .mat-icon{margin-right:16px;vertical-align:middle}.mat-menu-item .mat-icon svg{vertical-align:top}[dir=rtl] .mat-menu-item .mat-icon{margin-left:16px;margin-right:0}.mat-menu-item[disabled]{pointer-events:none}.cdk-high-contrast-active .mat-menu-item{margin-top:1px}.cdk-high-contrast-active .mat-menu-item.cdk-program-focused,.cdk-high-contrast-active .mat-menu-item.cdk-keyboard-focused,.cdk-high-contrast-active .mat-menu-item-highlighted{outline:dotted 1px}.mat-menu-item-submenu-trigger{padding-right:32px}.mat-menu-item-submenu-trigger::after{width:0;height:0;border-style:solid;border-width:5px 0 5px 5px;border-color:transparent transparent transparent currentColor;content:\"\";display:inline-block;position:absolute;top:50%;right:16px;transform:translateY(-50%)}[dir=rtl] .mat-menu-item-submenu-trigger{padding-right:16px;padding-left:32px}[dir=rtl] .mat-menu-item-submenu-trigger::after{right:auto;left:16px;transform:rotateY(180deg) translateY(-50%)}button.mat-menu-item{width:100%}.mat-menu-item .mat-menu-ripple{top:0;left:0;right:0;bottom:0;position:absolute;pointer-events:none}\n"]
                },] }
    ];
    MatMenu.ctorParameters = function () { return [
        { type: core.ElementRef },
        { type: core.NgZone },
        { type: undefined, decorators: [{ type: core.Inject, args: [MAT_MENU_DEFAULT_OPTIONS,] }] }
    ]; };

    /** Injection token that determines the scroll handling while the menu is open. */
    var MAT_MENU_SCROLL_STRATEGY = new core.InjectionToken('mat-menu-scroll-strategy');
    /** @docs-private */
    function MAT_MENU_SCROLL_STRATEGY_FACTORY(overlay) {
        return function () { return overlay.scrollStrategies.reposition(); };
    }
    /** @docs-private */
    var MAT_MENU_SCROLL_STRATEGY_FACTORY_PROVIDER = {
        provide: MAT_MENU_SCROLL_STRATEGY,
        deps: [overlay.Overlay],
        useFactory: MAT_MENU_SCROLL_STRATEGY_FACTORY,
    };
    /** Default top padding of the menu panel. */
    var MENU_PANEL_TOP_PADDING = 8;
    /** Options for binding a passive event listener. */
    var passiveEventListenerOptions = platform.normalizePassiveListenerOptions({ passive: true });
    // TODO(andrewseguin): Remove the kebab versions in favor of camelCased attribute selectors
    /** Directive applied to an element that should trigger a `mat-menu`. */
    var MatMenuTrigger = /** @class */ (function () {
        function MatMenuTrigger(_overlay, _element, _viewContainerRef, scrollStrategy, parentMenu, 
        // `MatMenuTrigger` is commonly used in combination with a `MatMenuItem`.
        // tslint:disable-next-line: lightweight-tokens
        _menuItemInstance, _dir, 
        // TODO(crisbeto): make the _focusMonitor required when doing breaking changes.
        // @breaking-change 8.0.0
        _focusMonitor) {
            var _this = this;
            this._overlay = _overlay;
            this._element = _element;
            this._viewContainerRef = _viewContainerRef;
            this._menuItemInstance = _menuItemInstance;
            this._dir = _dir;
            this._focusMonitor = _focusMonitor;
            this._overlayRef = null;
            this._menuOpen = false;
            this._closingActionsSubscription = rxjs.Subscription.EMPTY;
            this._hoverSubscription = rxjs.Subscription.EMPTY;
            this._menuCloseSubscription = rxjs.Subscription.EMPTY;
            /**
             * Handles touch start events on the trigger.
             * Needs to be an arrow function so we can easily use addEventListener and removeEventListener.
             */
            this._handleTouchStart = function (event) {
                if (!a11y.isFakeTouchstartFromScreenReader(event)) {
                    _this._openedBy = 'touch';
                }
            };
            // Tracking input type is necessary so it's possible to only auto-focus
            // the first item of the list when the menu is opened via the keyboard
            this._openedBy = undefined;
            /**
             * Whether focus should be restored when the menu is closed.
             * Note that disabling this option can have accessibility implications
             * and it's up to you to manage focus, if you decide to turn it off.
             */
            this.restoreFocus = true;
            /** Event emitted when the associated menu is opened. */
            this.menuOpened = new core.EventEmitter();
            /**
             * Event emitted when the associated menu is opened.
             * @deprecated Switch to `menuOpened` instead
             * @breaking-change 8.0.0
             */
            // tslint:disable-next-line:no-output-on-prefix
            this.onMenuOpen = this.menuOpened;
            /** Event emitted when the associated menu is closed. */
            this.menuClosed = new core.EventEmitter();
            /**
             * Event emitted when the associated menu is closed.
             * @deprecated Switch to `menuClosed` instead
             * @breaking-change 8.0.0
             */
            // tslint:disable-next-line:no-output-on-prefix
            this.onMenuClose = this.menuClosed;
            this._scrollStrategy = scrollStrategy;
            this._parentMaterialMenu = parentMenu instanceof _MatMenuBase ? parentMenu : undefined;
            _element.nativeElement.addEventListener('touchstart', this._handleTouchStart, passiveEventListenerOptions);
            if (_menuItemInstance) {
                _menuItemInstance._triggersSubmenu = this.triggersSubmenu();
            }
        }
        Object.defineProperty(MatMenuTrigger.prototype, "_deprecatedMatMenuTriggerFor", {
            /**
             * @deprecated
             * @breaking-change 8.0.0
             */
            get: function () { return this.menu; },
            set: function (v) {
                this.menu = v;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatMenuTrigger.prototype, "menu", {
            /** References the menu instance that the trigger is associated with. */
            get: function () { return this._menu; },
            set: function (menu) {
                var _this = this;
                if (menu === this._menu) {
                    return;
                }
                this._menu = menu;
                this._menuCloseSubscription.unsubscribe();
                if (menu) {
                    if (menu === this._parentMaterialMenu && (typeof ngDevMode === 'undefined' || ngDevMode)) {
                        throwMatMenuRecursiveError();
                    }
                    this._menuCloseSubscription = menu.close.subscribe(function (reason) {
                        _this._destroyMenu(reason);
                        // If a click closed the menu, we should close the entire chain of nested menus.
                        if ((reason === 'click' || reason === 'tab') && _this._parentMaterialMenu) {
                            _this._parentMaterialMenu.closed.emit(reason);
                        }
                    });
                }
            },
            enumerable: false,
            configurable: true
        });
        MatMenuTrigger.prototype.ngAfterContentInit = function () {
            this._checkMenu();
            this._handleHover();
        };
        MatMenuTrigger.prototype.ngOnDestroy = function () {
            if (this._overlayRef) {
                this._overlayRef.dispose();
                this._overlayRef = null;
            }
            this._element.nativeElement.removeEventListener('touchstart', this._handleTouchStart, passiveEventListenerOptions);
            this._menuCloseSubscription.unsubscribe();
            this._closingActionsSubscription.unsubscribe();
            this._hoverSubscription.unsubscribe();
        };
        Object.defineProperty(MatMenuTrigger.prototype, "menuOpen", {
            /** Whether the menu is open. */
            get: function () {
                return this._menuOpen;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatMenuTrigger.prototype, "dir", {
            /** The text direction of the containing app. */
            get: function () {
                return this._dir && this._dir.value === 'rtl' ? 'rtl' : 'ltr';
            },
            enumerable: false,
            configurable: true
        });
        /** Whether the menu triggers a sub-menu or a top-level one. */
        MatMenuTrigger.prototype.triggersSubmenu = function () {
            return !!(this._menuItemInstance && this._parentMaterialMenu);
        };
        /** Toggles the menu between the open and closed states. */
        MatMenuTrigger.prototype.toggleMenu = function () {
            return this._menuOpen ? this.closeMenu() : this.openMenu();
        };
        /** Opens the menu. */
        MatMenuTrigger.prototype.openMenu = function () {
            var _this = this;
            if (this._menuOpen) {
                return;
            }
            this._checkMenu();
            var overlayRef = this._createOverlay();
            var overlayConfig = overlayRef.getConfig();
            this._setPosition(overlayConfig.positionStrategy);
            overlayConfig.hasBackdrop = this.menu.hasBackdrop == null ? !this.triggersSubmenu() :
                this.menu.hasBackdrop;
            overlayRef.attach(this._getPortal());
            if (this.menu.lazyContent) {
                this.menu.lazyContent.attach(this.menuData);
            }
            this._closingActionsSubscription = this._menuClosingActions().subscribe(function () { return _this.closeMenu(); });
            this._initMenu();
            if (this.menu instanceof _MatMenuBase) {
                this.menu._startAnimation();
            }
        };
        /** Closes the menu. */
        MatMenuTrigger.prototype.closeMenu = function () {
            this.menu.close.emit();
        };
        /**
         * Focuses the menu trigger.
         * @param origin Source of the menu trigger's focus.
         */
        MatMenuTrigger.prototype.focus = function (origin, options) {
            if (this._focusMonitor && origin) {
                this._focusMonitor.focusVia(this._element, origin, options);
            }
            else {
                this._element.nativeElement.focus(options);
            }
        };
        /**
         * Updates the position of the menu to ensure that it fits all options within the viewport.
         */
        MatMenuTrigger.prototype.updatePosition = function () {
            var _a;
            (_a = this._overlayRef) === null || _a === void 0 ? void 0 : _a.updatePosition();
        };
        /** Closes the menu and does the necessary cleanup. */
        MatMenuTrigger.prototype._destroyMenu = function (reason) {
            var _this = this;
            if (!this._overlayRef || !this.menuOpen) {
                return;
            }
            var menu = this.menu;
            this._closingActionsSubscription.unsubscribe();
            this._overlayRef.detach();
            // Always restore focus if the user is navigating using the keyboard or the menu was opened
            // programmatically. We don't restore for non-root triggers, because it can prevent focus
            // from making it back to the root trigger when closing a long chain of menus by clicking
            // on the backdrop.
            if (this.restoreFocus && (reason === 'keydown' || !this._openedBy || !this.triggersSubmenu())) {
                this.focus(this._openedBy);
            }
            this._openedBy = undefined;
            if (menu instanceof _MatMenuBase) {
                menu._resetAnimation();
                if (menu.lazyContent) {
                    // Wait for the exit animation to finish before detaching the content.
                    menu._animationDone
                        .pipe(operators.filter(function (event) { return event.toState === 'void'; }), operators.take(1), 
                    // Interrupt if the content got re-attached.
                    operators.takeUntil(menu.lazyContent._attached))
                        .subscribe({
                        next: function () { return menu.lazyContent.detach(); },
                        // No matter whether the content got re-attached, reset the menu.
                        complete: function () { return _this._setIsMenuOpen(false); }
                    });
                }
                else {
                    this._setIsMenuOpen(false);
                }
            }
            else {
                this._setIsMenuOpen(false);
                if (menu.lazyContent) {
                    menu.lazyContent.detach();
                }
            }
        };
        /**
         * This method sets the menu state to open and focuses the first item if
         * the menu was opened via the keyboard.
         */
        MatMenuTrigger.prototype._initMenu = function () {
            this.menu.parentMenu = this.triggersSubmenu() ? this._parentMaterialMenu : undefined;
            this.menu.direction = this.dir;
            this._setMenuElevation();
            this.menu.focusFirstItem(this._openedBy || 'program');
            this._setIsMenuOpen(true);
        };
        /** Updates the menu elevation based on the amount of parent menus that it has. */
        MatMenuTrigger.prototype._setMenuElevation = function () {
            if (this.menu.setElevation) {
                var depth = 0;
                var parentMenu = this.menu.parentMenu;
                while (parentMenu) {
                    depth++;
                    parentMenu = parentMenu.parentMenu;
                }
                this.menu.setElevation(depth);
            }
        };
        // set state rather than toggle to support triggers sharing a menu
        MatMenuTrigger.prototype._setIsMenuOpen = function (isOpen) {
            this._menuOpen = isOpen;
            this._menuOpen ? this.menuOpened.emit() : this.menuClosed.emit();
            if (this.triggersSubmenu()) {
                this._menuItemInstance._highlighted = isOpen;
            }
        };
        /**
         * This method checks that a valid instance of MatMenu has been passed into
         * matMenuTriggerFor. If not, an exception is thrown.
         */
        MatMenuTrigger.prototype._checkMenu = function () {
            if (!this.menu && (typeof ngDevMode === 'undefined' || ngDevMode)) {
                throwMatMenuMissingError();
            }
        };
        /**
         * This method creates the overlay from the provided menu's template and saves its
         * OverlayRef so that it can be attached to the DOM when openMenu is called.
         */
        MatMenuTrigger.prototype._createOverlay = function () {
            if (!this._overlayRef) {
                var config = this._getOverlayConfig();
                this._subscribeToPositions(config.positionStrategy);
                this._overlayRef = this._overlay.create(config);
                // Consume the `keydownEvents` in order to prevent them from going to another overlay.
                // Ideally we'd also have our keyboard event logic in here, however doing so will
                // break anybody that may have implemented the `MatMenuPanel` themselves.
                this._overlayRef.keydownEvents().subscribe();
            }
            return this._overlayRef;
        };
        /**
         * This method builds the configuration object needed to create the overlay, the OverlayState.
         * @returns OverlayConfig
         */
        MatMenuTrigger.prototype._getOverlayConfig = function () {
            return new overlay.OverlayConfig({
                positionStrategy: this._overlay.position()
                    .flexibleConnectedTo(this._element)
                    .withLockedPosition()
                    .withGrowAfterOpen()
                    .withTransformOriginOn('.mat-menu-panel, .mat-mdc-menu-panel'),
                backdropClass: this.menu.backdropClass || 'cdk-overlay-transparent-backdrop',
                panelClass: this.menu.overlayPanelClass,
                scrollStrategy: this._scrollStrategy(),
                direction: this._dir
            });
        };
        /**
         * Listens to changes in the position of the overlay and sets the correct classes
         * on the menu based on the new position. This ensures the animation origin is always
         * correct, even if a fallback position is used for the overlay.
         */
        MatMenuTrigger.prototype._subscribeToPositions = function (position) {
            var _this = this;
            if (this.menu.setPositionClasses) {
                position.positionChanges.subscribe(function (change) {
                    var posX = change.connectionPair.overlayX === 'start' ? 'after' : 'before';
                    var posY = change.connectionPair.overlayY === 'top' ? 'below' : 'above';
                    _this.menu.setPositionClasses(posX, posY);
                });
            }
        };
        /**
         * Sets the appropriate positions on a position strategy
         * so the overlay connects with the trigger correctly.
         * @param positionStrategy Strategy whose position to update.
         */
        MatMenuTrigger.prototype._setPosition = function (positionStrategy) {
            var _b = __read(this.menu.xPosition === 'before' ? ['end', 'start'] : ['start', 'end'], 2), originX = _b[0], originFallbackX = _b[1];
            var _c = __read(this.menu.yPosition === 'above' ? ['bottom', 'top'] : ['top', 'bottom'], 2), overlayY = _c[0], overlayFallbackY = _c[1];
            var _d = __read([overlayY, overlayFallbackY], 2), originY = _d[0], originFallbackY = _d[1];
            var _e = __read([originX, originFallbackX], 2), overlayX = _e[0], overlayFallbackX = _e[1];
            var offsetY = 0;
            if (this.triggersSubmenu()) {
                // When the menu is a sub-menu, it should always align itself
                // to the edges of the trigger, instead of overlapping it.
                overlayFallbackX = originX = this.menu.xPosition === 'before' ? 'start' : 'end';
                originFallbackX = overlayX = originX === 'end' ? 'start' : 'end';
                offsetY = overlayY === 'bottom' ? MENU_PANEL_TOP_PADDING : -MENU_PANEL_TOP_PADDING;
            }
            else if (!this.menu.overlapTrigger) {
                originY = overlayY === 'top' ? 'bottom' : 'top';
                originFallbackY = overlayFallbackY === 'top' ? 'bottom' : 'top';
            }
            positionStrategy.withPositions([
                { originX: originX, originY: originY, overlayX: overlayX, overlayY: overlayY, offsetY: offsetY },
                { originX: originFallbackX, originY: originY, overlayX: overlayFallbackX, overlayY: overlayY, offsetY: offsetY },
                {
                    originX: originX,
                    originY: originFallbackY,
                    overlayX: overlayX,
                    overlayY: overlayFallbackY,
                    offsetY: -offsetY
                },
                {
                    originX: originFallbackX,
                    originY: originFallbackY,
                    overlayX: overlayFallbackX,
                    overlayY: overlayFallbackY,
                    offsetY: -offsetY
                }
            ]);
        };
        /** Returns a stream that emits whenever an action that should close the menu occurs. */
        MatMenuTrigger.prototype._menuClosingActions = function () {
            var _this = this;
            var backdrop = this._overlayRef.backdropClick();
            var detachments = this._overlayRef.detachments();
            var parentClose = this._parentMaterialMenu ? this._parentMaterialMenu.closed : rxjs.of();
            var hover = this._parentMaterialMenu ? this._parentMaterialMenu._hovered().pipe(operators.filter(function (active) { return active !== _this._menuItemInstance; }), operators.filter(function () { return _this._menuOpen; })) : rxjs.of();
            return rxjs.merge(backdrop, parentClose, hover, detachments);
        };
        /** Handles mouse presses on the trigger. */
        MatMenuTrigger.prototype._handleMousedown = function (event) {
            if (!a11y.isFakeMousedownFromScreenReader(event)) {
                // Since right or middle button clicks won't trigger the `click` event,
                // we shouldn't consider the menu as opened by mouse in those cases.
                this._openedBy = event.button === 0 ? 'mouse' : undefined;
                // Since clicking on the trigger won't close the menu if it opens a sub-menu,
                // we should prevent focus from moving onto it via click to avoid the
                // highlight from lingering on the menu item.
                if (this.triggersSubmenu()) {
                    event.preventDefault();
                }
            }
        };
        /** Handles key presses on the trigger. */
        MatMenuTrigger.prototype._handleKeydown = function (event) {
            var keyCode = event.keyCode;
            // Pressing enter on the trigger will trigger the click handler later.
            if (keyCode === keycodes.ENTER || keyCode === keycodes.SPACE) {
                this._openedBy = 'keyboard';
            }
            if (this.triggersSubmenu() && ((keyCode === keycodes.RIGHT_ARROW && this.dir === 'ltr') ||
                (keyCode === keycodes.LEFT_ARROW && this.dir === 'rtl'))) {
                this._openedBy = 'keyboard';
                this.openMenu();
            }
        };
        /** Handles click events on the trigger. */
        MatMenuTrigger.prototype._handleClick = function (event) {
            if (this.triggersSubmenu()) {
                // Stop event propagation to avoid closing the parent menu.
                event.stopPropagation();
                this.openMenu();
            }
            else {
                this.toggleMenu();
            }
        };
        /** Handles the cases where the user hovers over the trigger. */
        MatMenuTrigger.prototype._handleHover = function () {
            var _this = this;
            // Subscribe to changes in the hovered item in order to toggle the panel.
            if (!this.triggersSubmenu() || !this._parentMaterialMenu) {
                return;
            }
            this._hoverSubscription = this._parentMaterialMenu._hovered()
                // Since we might have multiple competing triggers for the same menu (e.g. a sub-menu
                // with different data and triggers), we have to delay it by a tick to ensure that
                // it won't be closed immediately after it is opened.
                .pipe(operators.filter(function (active) { return active === _this._menuItemInstance && !active.disabled; }), operators.delay(0, rxjs.asapScheduler))
                .subscribe(function () {
                _this._openedBy = 'mouse';
                // If the same menu is used between multiple triggers, it might still be animating
                // while the new trigger tries to re-open it. Wait for the animation to finish
                // before doing so. Also interrupt if the user moves to another item.
                if (_this.menu instanceof _MatMenuBase && _this.menu._isAnimating) {
                    // We need the `delay(0)` here in order to avoid
                    // 'changed after checked' errors in some cases. See #12194.
                    _this.menu._animationDone
                        .pipe(operators.take(1), operators.delay(0, rxjs.asapScheduler), operators.takeUntil(_this._parentMaterialMenu._hovered()))
                        .subscribe(function () { return _this.openMenu(); });
                }
                else {
                    _this.openMenu();
                }
            });
        };
        /** Gets the portal that should be attached to the overlay. */
        MatMenuTrigger.prototype._getPortal = function () {
            // Note that we can avoid this check by keeping the portal on the menu panel.
            // While it would be cleaner, we'd have to introduce another required method on
            // `MatMenuPanel`, making it harder to consume.
            if (!this._portal || this._portal.templateRef !== this.menu.templateRef) {
                this._portal = new portal.TemplatePortal(this.menu.templateRef, this._viewContainerRef);
            }
            return this._portal;
        };
        return MatMenuTrigger;
    }());
    MatMenuTrigger.decorators = [
        { type: core.Directive, args: [{
                    selector: "[mat-menu-trigger-for], [matMenuTriggerFor]",
                    host: {
                        'class': 'mat-menu-trigger',
                        'aria-haspopup': 'true',
                        '[attr.aria-expanded]': 'menuOpen || null',
                        '[attr.aria-controls]': 'menuOpen ? menu.panelId : null',
                        '(mousedown)': '_handleMousedown($event)',
                        '(keydown)': '_handleKeydown($event)',
                        '(click)': '_handleClick($event)',
                    },
                    exportAs: 'matMenuTrigger'
                },] }
    ];
    MatMenuTrigger.ctorParameters = function () { return [
        { type: overlay.Overlay },
        { type: core.ElementRef },
        { type: core.ViewContainerRef },
        { type: undefined, decorators: [{ type: core.Inject, args: [MAT_MENU_SCROLL_STRATEGY,] }] },
        { type: undefined, decorators: [{ type: core.Inject, args: [MAT_MENU_PANEL,] }, { type: core.Optional }] },
        { type: MatMenuItem, decorators: [{ type: core.Optional }, { type: core.Self }] },
        { type: bidi.Directionality, decorators: [{ type: core.Optional }] },
        { type: a11y.FocusMonitor }
    ]; };
    MatMenuTrigger.propDecorators = {
        _deprecatedMatMenuTriggerFor: [{ type: core.Input, args: ['mat-menu-trigger-for',] }],
        menu: [{ type: core.Input, args: ['matMenuTriggerFor',] }],
        menuData: [{ type: core.Input, args: ['matMenuTriggerData',] }],
        restoreFocus: [{ type: core.Input, args: ['matMenuTriggerRestoreFocus',] }],
        menuOpened: [{ type: core.Output }],
        onMenuOpen: [{ type: core.Output }],
        menuClosed: [{ type: core.Output }],
        onMenuClose: [{ type: core.Output }]
    };

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /**
     * Used by both the current `MatMenuModule` and the MDC `MatMenuModule`
     * to declare the menu-related directives.
     */
    var _MatMenuDirectivesModule = /** @class */ (function () {
        function _MatMenuDirectivesModule() {
        }
        return _MatMenuDirectivesModule;
    }());
    _MatMenuDirectivesModule.decorators = [
        { type: core.NgModule, args: [{
                    exports: [MatMenuTrigger, MatMenuContent, core$1.MatCommonModule],
                    declarations: [
                        MatMenuTrigger,
                        MatMenuContent,
                    ],
                    providers: [MAT_MENU_SCROLL_STRATEGY_FACTORY_PROVIDER]
                },] }
    ];
    var MatMenuModule = /** @class */ (function () {
        function MatMenuModule() {
        }
        return MatMenuModule;
    }());
    MatMenuModule.decorators = [
        { type: core.NgModule, args: [{
                    imports: [
                        common.CommonModule,
                        core$1.MatCommonModule,
                        core$1.MatRippleModule,
                        overlay.OverlayModule,
                        _MatMenuDirectivesModule,
                    ],
                    exports: [scrolling.CdkScrollableModule, core$1.MatCommonModule, MatMenu, MatMenuItem, _MatMenuDirectivesModule],
                    declarations: [MatMenu, MatMenuItem],
                    providers: [MAT_MENU_SCROLL_STRATEGY_FACTORY_PROVIDER]
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

    exports.MAT_MENU_CONTENT = MAT_MENU_CONTENT;
    exports.MAT_MENU_DEFAULT_OPTIONS = MAT_MENU_DEFAULT_OPTIONS;
    exports.MAT_MENU_PANEL = MAT_MENU_PANEL;
    exports.MAT_MENU_SCROLL_STRATEGY = MAT_MENU_SCROLL_STRATEGY;
    exports.MatMenu = MatMenu;
    exports.MatMenuContent = MatMenuContent;
    exports.MatMenuItem = MatMenuItem;
    exports.MatMenuModule = MatMenuModule;
    exports.MatMenuTrigger = MatMenuTrigger;
    exports._MatMenuBase = _MatMenuBase;
    exports._MatMenuDirectivesModule = _MatMenuDirectivesModule;
    exports.fadeInItems = fadeInItems;
    exports.matMenuAnimations = matMenuAnimations;
    exports.transformMenu = transformMenu;
    exports.ɵangular_material_src_material_menu_menu_a = MAT_MENU_DEFAULT_OPTIONS_FACTORY;
    exports.ɵangular_material_src_material_menu_menu_b = MAT_MENU_SCROLL_STRATEGY_FACTORY;
    exports.ɵangular_material_src_material_menu_menu_c = MAT_MENU_SCROLL_STRATEGY_FACTORY_PROVIDER;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=material-menu.umd.js.map
