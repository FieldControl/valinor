(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('@angular/material/core'), require('@angular/cdk/a11y'), require('@angular/cdk/coercion'), require('@angular/platform-browser/animations')) :
    typeof define === 'function' && define.amd ? define('@angular/material/badge', ['exports', '@angular/core', '@angular/material/core', '@angular/cdk/a11y', '@angular/cdk/coercion', '@angular/platform-browser/animations'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.ng = global.ng || {}, global.ng.material = global.ng.material || {}, global.ng.material.badge = {}), global.ng.core, global.ng.material.core, global.ng.cdk.a11y, global.ng.cdk.coercion, global.ng.platformBrowser.animations));
}(this, (function (exports, core$1, core, a11y, coercion, animations) { 'use strict';

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

    var nextId = 0;
    // Boilerplate for applying mixins to MatBadge.
    /** @docs-private */
    var MatBadgeBase = /** @class */ (function () {
        function MatBadgeBase() {
        }
        return MatBadgeBase;
    }());
    var _MatBadgeMixinBase = core.mixinDisabled(MatBadgeBase);
    /** Directive to display a text badge. */
    var MatBadge = /** @class */ (function (_super) {
        __extends(MatBadge, _super);
        function MatBadge(_ngZone, _elementRef, _ariaDescriber, _renderer, _animationMode) {
            var _this = _super.call(this) || this;
            _this._ngZone = _ngZone;
            _this._elementRef = _elementRef;
            _this._ariaDescriber = _ariaDescriber;
            _this._renderer = _renderer;
            _this._animationMode = _animationMode;
            /** Whether the badge has any content. */
            _this._hasContent = false;
            _this._color = 'primary';
            _this._overlap = true;
            /**
             * Position the badge should reside.
             * Accepts any combination of 'above'|'below' and 'before'|'after'
             */
            _this.position = 'above after';
            /** Size of the badge. Can be 'small', 'medium', or 'large'. */
            _this.size = 'medium';
            /** Unique id for the badge */
            _this._id = nextId++;
            if (typeof ngDevMode === 'undefined' || ngDevMode) {
                var nativeElement = _elementRef.nativeElement;
                if (nativeElement.nodeType !== nativeElement.ELEMENT_NODE) {
                    throw Error('matBadge must be attached to an element node.');
                }
            }
            return _this;
        }
        Object.defineProperty(MatBadge.prototype, "color", {
            /** The color of the badge. Can be `primary`, `accent`, or `warn`. */
            get: function () { return this._color; },
            set: function (value) {
                this._setColor(value);
                this._color = value;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatBadge.prototype, "overlap", {
            /** Whether the badge should overlap its contents or not */
            get: function () { return this._overlap; },
            set: function (val) {
                this._overlap = coercion.coerceBooleanProperty(val);
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatBadge.prototype, "description", {
            /** Message used to describe the decorated element via aria-describedby */
            get: function () { return this._description; },
            set: function (newDescription) {
                if (newDescription !== this._description) {
                    var badgeElement = this._badgeElement;
                    this._updateHostAriaDescription(newDescription, this._description);
                    this._description = newDescription;
                    if (badgeElement) {
                        newDescription ? badgeElement.setAttribute('aria-label', newDescription) :
                            badgeElement.removeAttribute('aria-label');
                    }
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatBadge.prototype, "hidden", {
            /** Whether the badge is hidden. */
            get: function () { return this._hidden; },
            set: function (val) {
                this._hidden = coercion.coerceBooleanProperty(val);
            },
            enumerable: false,
            configurable: true
        });
        /** Whether the badge is above the host or not */
        MatBadge.prototype.isAbove = function () {
            return this.position.indexOf('below') === -1;
        };
        /** Whether the badge is after the host or not */
        MatBadge.prototype.isAfter = function () {
            return this.position.indexOf('before') === -1;
        };
        MatBadge.prototype.ngOnChanges = function (changes) {
            var contentChange = changes['content'];
            if (contentChange) {
                var value = contentChange.currentValue;
                this._hasContent = value != null && ("" + value).trim().length > 0;
                this._updateTextContent();
            }
        };
        MatBadge.prototype.ngOnDestroy = function () {
            var badgeElement = this._badgeElement;
            if (badgeElement) {
                if (this.description) {
                    this._ariaDescriber.removeDescription(badgeElement, this.description);
                }
                // When creating a badge through the Renderer, Angular will keep it in an index.
                // We have to destroy it ourselves, otherwise it'll be retained in memory.
                if (this._renderer.destroyNode) {
                    this._renderer.destroyNode(badgeElement);
                }
            }
        };
        /**
         * Gets the element into which the badge's content is being rendered.
         * Undefined if the element hasn't been created (e.g. if the badge doesn't have content).
         */
        MatBadge.prototype.getBadgeElement = function () {
            return this._badgeElement;
        };
        /** Injects a span element into the DOM with the content. */
        MatBadge.prototype._updateTextContent = function () {
            if (!this._badgeElement) {
                this._badgeElement = this._createBadgeElement();
            }
            else {
                this._badgeElement.textContent = this._stringifyContent();
            }
            return this._badgeElement;
        };
        /** Creates the badge element */
        MatBadge.prototype._createBadgeElement = function () {
            var badgeElement = this._renderer.createElement('span');
            var activeClass = 'mat-badge-active';
            var contentClass = 'mat-badge-content';
            // Clear any existing badges which may have persisted from a server-side render.
            this._clearExistingBadges(contentClass);
            badgeElement.setAttribute('id', "mat-badge-content-" + this._id);
            badgeElement.classList.add(contentClass);
            badgeElement.textContent = this._stringifyContent();
            if (this._animationMode === 'NoopAnimations') {
                badgeElement.classList.add('_mat-animation-noopable');
            }
            if (this.description) {
                badgeElement.setAttribute('aria-label', this.description);
            }
            this._elementRef.nativeElement.appendChild(badgeElement);
            // animate in after insertion
            if (typeof requestAnimationFrame === 'function' && this._animationMode !== 'NoopAnimations') {
                this._ngZone.runOutsideAngular(function () {
                    requestAnimationFrame(function () {
                        badgeElement.classList.add(activeClass);
                    });
                });
            }
            else {
                badgeElement.classList.add(activeClass);
            }
            return badgeElement;
        };
        /** Sets the aria-label property on the element */
        MatBadge.prototype._updateHostAriaDescription = function (newDescription, oldDescription) {
            // ensure content available before setting label
            var content = this._updateTextContent();
            if (oldDescription) {
                this._ariaDescriber.removeDescription(content, oldDescription);
            }
            if (newDescription) {
                this._ariaDescriber.describe(content, newDescription);
            }
        };
        /** Adds css theme class given the color to the component host */
        MatBadge.prototype._setColor = function (colorPalette) {
            if (colorPalette !== this._color) {
                var classList = this._elementRef.nativeElement.classList;
                if (this._color) {
                    classList.remove("mat-badge-" + this._color);
                }
                if (colorPalette) {
                    classList.add("mat-badge-" + colorPalette);
                }
            }
        };
        /** Clears any existing badges that might be left over from server-side rendering. */
        MatBadge.prototype._clearExistingBadges = function (cssClass) {
            var element = this._elementRef.nativeElement;
            var childCount = element.children.length;
            // Use a reverse while, because we'll be removing elements from the list as we're iterating.
            while (childCount--) {
                var currentChild = element.children[childCount];
                if (currentChild.classList.contains(cssClass)) {
                    element.removeChild(currentChild);
                }
            }
        };
        /** Gets the string representation of the badge content. */
        MatBadge.prototype._stringifyContent = function () {
            // Convert null and undefined to an empty string which is consistent
            // with how Angular handles them in inside template interpolations.
            var content = this.content;
            return content == null ? '' : "" + content;
        };
        return MatBadge;
    }(_MatBadgeMixinBase));
    MatBadge.decorators = [
        { type: core$1.Directive, args: [{
                    selector: '[matBadge]',
                    inputs: ['disabled: matBadgeDisabled'],
                    host: {
                        'class': 'mat-badge',
                        '[class.mat-badge-overlap]': 'overlap',
                        '[class.mat-badge-above]': 'isAbove()',
                        '[class.mat-badge-below]': '!isAbove()',
                        '[class.mat-badge-before]': '!isAfter()',
                        '[class.mat-badge-after]': 'isAfter()',
                        '[class.mat-badge-small]': 'size === "small"',
                        '[class.mat-badge-medium]': 'size === "medium"',
                        '[class.mat-badge-large]': 'size === "large"',
                        '[class.mat-badge-hidden]': 'hidden || !_hasContent',
                        '[class.mat-badge-disabled]': 'disabled',
                    },
                },] }
    ];
    MatBadge.ctorParameters = function () { return [
        { type: core$1.NgZone },
        { type: core$1.ElementRef },
        { type: a11y.AriaDescriber },
        { type: core$1.Renderer2 },
        { type: String, decorators: [{ type: core$1.Optional }, { type: core$1.Inject, args: [animations.ANIMATION_MODULE_TYPE,] }] }
    ]; };
    MatBadge.propDecorators = {
        color: [{ type: core$1.Input, args: ['matBadgeColor',] }],
        overlap: [{ type: core$1.Input, args: ['matBadgeOverlap',] }],
        position: [{ type: core$1.Input, args: ['matBadgePosition',] }],
        content: [{ type: core$1.Input, args: ['matBadge',] }],
        description: [{ type: core$1.Input, args: ['matBadgeDescription',] }],
        size: [{ type: core$1.Input, args: ['matBadgeSize',] }],
        hidden: [{ type: core$1.Input, args: ['matBadgeHidden',] }]
    };

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var MatBadgeModule = /** @class */ (function () {
        function MatBadgeModule() {
        }
        return MatBadgeModule;
    }());
    MatBadgeModule.decorators = [
        { type: core$1.NgModule, args: [{
                    imports: [
                        a11y.A11yModule,
                        core.MatCommonModule
                    ],
                    exports: [MatBadge, core.MatCommonModule],
                    declarations: [MatBadge],
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

    exports.MatBadge = MatBadge;
    exports.MatBadgeModule = MatBadgeModule;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=material-badge.umd.js.map
