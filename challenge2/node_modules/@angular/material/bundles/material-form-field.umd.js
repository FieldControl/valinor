(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/cdk/observers'), require('@angular/common'), require('@angular/core'), require('@angular/material/core'), require('@angular/cdk/bidi'), require('@angular/cdk/coercion'), require('rxjs'), require('rxjs/operators'), require('@angular/animations'), require('@angular/cdk/platform'), require('@angular/platform-browser/animations')) :
    typeof define === 'function' && define.amd ? define('@angular/material/form-field', ['exports', '@angular/cdk/observers', '@angular/common', '@angular/core', '@angular/material/core', '@angular/cdk/bidi', '@angular/cdk/coercion', 'rxjs', 'rxjs/operators', '@angular/animations', '@angular/cdk/platform', '@angular/platform-browser/animations'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.ng = global.ng || {}, global.ng.material = global.ng.material || {}, global.ng.material.formField = {}), global.ng.cdk.observers, global.ng.common, global.ng.core, global.ng.material.core, global.ng.cdk.bidi, global.ng.cdk.coercion, global.rxjs, global.rxjs.operators, global.ng.animations, global.ng.cdk.platform, global.ng.platformBrowser.animations));
}(this, (function (exports, observers, common, core, core$1, bidi, coercion, rxjs, operators, animations, platform, animations$1) { 'use strict';

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var nextUniqueId$2 = 0;
    /**
     * Injection token that can be used to reference instances of `MatError`. It serves as
     * alternative token to the actual `MatError` class which could cause unnecessary
     * retention of the class and its directive metadata.
     */
    var MAT_ERROR = new core.InjectionToken('MatError');
    /** Single error message to be shown underneath the form field. */
    var MatError = /** @class */ (function () {
        function MatError(ariaLive, elementRef) {
            this.id = "mat-error-" + nextUniqueId$2++;
            // If no aria-live value is set add 'polite' as a default. This is preferred over setting
            // role='alert' so that screen readers do not interrupt the current task to read this aloud.
            if (!ariaLive) {
                elementRef.nativeElement.setAttribute('aria-live', 'polite');
            }
        }
        return MatError;
    }());
    MatError.decorators = [
        { type: core.Directive, args: [{
                    selector: 'mat-error',
                    host: {
                        'class': 'mat-error',
                        '[attr.id]': 'id',
                        'aria-atomic': 'true',
                    },
                    providers: [{ provide: MAT_ERROR, useExisting: MatError }],
                },] }
    ];
    MatError.ctorParameters = function () { return [
        { type: String, decorators: [{ type: core.Attribute, args: ['aria-live',] }] },
        { type: core.ElementRef }
    ]; };
    MatError.propDecorators = {
        id: [{ type: core.Input }]
    };

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
     * Animations used by the MatFormField.
     * @docs-private
     */
    var matFormFieldAnimations = {
        /** Animation that transitions the form field's error and hint messages. */
        transitionMessages: animations.trigger('transitionMessages', [
            // TODO(mmalerba): Use angular animations for label animation as well.
            animations.state('enter', animations.style({ opacity: 1, transform: 'translateY(0%)' })),
            animations.transition('void => enter', [
                animations.style({ opacity: 0, transform: 'translateY(-5px)' }),
                animations.animate('300ms cubic-bezier(0.55, 0, 0.55, 0.2)'),
            ]),
        ])
    };

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /** An interface which allows a control to work inside of a `MatFormField`. */
    var MatFormFieldControl = /** @class */ (function () {
        function MatFormFieldControl() {
        }
        return MatFormFieldControl;
    }());
    MatFormFieldControl.decorators = [
        { type: core.Directive }
    ];

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /** @docs-private */
    function getMatFormFieldPlaceholderConflictError() {
        return Error('Placeholder attribute and child element were both specified.');
    }
    /** @docs-private */
    function getMatFormFieldDuplicatedHintError(align) {
        return Error("A hint was already declared for 'align=\"" + align + "\"'.");
    }
    /** @docs-private */
    function getMatFormFieldMissingControlError() {
        return Error('mat-form-field must contain a MatFormFieldControl.');
    }

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var nextUniqueId$1 = 0;
    /**
     * Injection token that can be used to reference instances of `MatHint`. It serves as
     * alternative token to the actual `MatHint` class which could cause unnecessary
     * retention of the class and its directive metadata.
     *
     * *Note*: This is not part of the public API as the MDC-based form-field will not
     * need a lightweight token for `MatHint` and we want to reduce breaking changes.
     */
    var _MAT_HINT = new core.InjectionToken('MatHint');
    /** Hint text to be shown underneath the form field control. */
    var MatHint = /** @class */ (function () {
        function MatHint() {
            /** Whether to align the hint label at the start or end of the line. */
            this.align = 'start';
            /** Unique ID for the hint. Used for the aria-describedby on the form field control. */
            this.id = "mat-hint-" + nextUniqueId$1++;
        }
        return MatHint;
    }());
    MatHint.decorators = [
        { type: core.Directive, args: [{
                    selector: 'mat-hint',
                    host: {
                        'class': 'mat-hint',
                        '[class.mat-form-field-hint-end]': 'align === "end"',
                        '[attr.id]': 'id',
                        // Remove align attribute to prevent it from interfering with layout.
                        '[attr.align]': 'null',
                    },
                    providers: [{ provide: _MAT_HINT, useExisting: MatHint }],
                },] }
    ];
    MatHint.propDecorators = {
        align: [{ type: core.Input }],
        id: [{ type: core.Input }]
    };

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /** The floating label for a `mat-form-field`. */
    var MatLabel = /** @class */ (function () {
        function MatLabel() {
        }
        return MatLabel;
    }());
    MatLabel.decorators = [
        { type: core.Directive, args: [{
                    selector: 'mat-label'
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
     * The placeholder text for an `MatFormField`.
     * @deprecated Use `<mat-label>` to specify the label and the `placeholder` attribute to specify the
     *     placeholder.
     * @breaking-change 8.0.0
     */
    var MatPlaceholder = /** @class */ (function () {
        function MatPlaceholder() {
        }
        return MatPlaceholder;
    }());
    MatPlaceholder.decorators = [
        { type: core.Directive, args: [{
                    selector: 'mat-placeholder'
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
     * Injection token that can be used to reference instances of `MatPrefix`. It serves as
     * alternative token to the actual `MatPrefix` class which could cause unnecessary
     * retention of the class and its directive metadata.
     */
    var MAT_PREFIX = new core.InjectionToken('MatPrefix');
    /** Prefix to be placed in front of the form field. */
    var MatPrefix = /** @class */ (function () {
        function MatPrefix() {
        }
        return MatPrefix;
    }());
    MatPrefix.decorators = [
        { type: core.Directive, args: [{
                    selector: '[matPrefix]',
                    providers: [{ provide: MAT_PREFIX, useExisting: MatPrefix }],
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
     * Injection token that can be used to reference instances of `MatSuffix`. It serves as
     * alternative token to the actual `MatSuffix` class which could cause unnecessary
     * retention of the class and its directive metadata.
     */
    var MAT_SUFFIX = new core.InjectionToken('MatSuffix');
    /** Suffix to be placed at the end of the form field. */
    var MatSuffix = /** @class */ (function () {
        function MatSuffix() {
        }
        return MatSuffix;
    }());
    MatSuffix.decorators = [
        { type: core.Directive, args: [{
                    selector: '[matSuffix]',
                    providers: [{ provide: MAT_SUFFIX, useExisting: MatSuffix }],
                },] }
    ];

    var nextUniqueId = 0;
    var floatingLabelScale = 0.75;
    var outlineGapPadding = 5;
    /**
     * Boilerplate for applying mixins to MatFormField.
     * @docs-private
     */
    var MatFormFieldBase = /** @class */ (function () {
        function MatFormFieldBase(_elementRef) {
            this._elementRef = _elementRef;
        }
        return MatFormFieldBase;
    }());
    /**
     * Base class to which we're applying the form field mixins.
     * @docs-private
     */
    var _MatFormFieldMixinBase = core$1.mixinColor(MatFormFieldBase, 'primary');
    /**
     * Injection token that can be used to configure the
     * default options for all form field within an app.
     */
    var MAT_FORM_FIELD_DEFAULT_OPTIONS = new core.InjectionToken('MAT_FORM_FIELD_DEFAULT_OPTIONS');
    /**
     * Injection token that can be used to inject an instances of `MatFormField`. It serves
     * as alternative token to the actual `MatFormField` class which would cause unnecessary
     * retention of the `MatFormField` class and its component metadata.
     */
    var MAT_FORM_FIELD = new core.InjectionToken('MatFormField');
    /** Container for form controls that applies Material Design styling and behavior. */
    var MatFormField = /** @class */ (function (_super) {
        __extends(MatFormField, _super);
        function MatFormField(_elementRef, _changeDetectorRef, 
        /**
         * @deprecated `_labelOptions` parameter no longer being used. To be removed.
         * @breaking-change 12.0.0
         */
        // Use `ElementRef` here so Angular has something to inject.
        _labelOptions, _dir, _defaults, _platform, _ngZone, _animationMode) {
            var _this = _super.call(this, _elementRef) || this;
            _this._elementRef = _elementRef;
            _this._changeDetectorRef = _changeDetectorRef;
            _this._dir = _dir;
            _this._defaults = _defaults;
            _this._platform = _platform;
            _this._ngZone = _ngZone;
            /**
             * Whether the outline gap needs to be calculated
             * immediately on the next change detection run.
             */
            _this._outlineGapCalculationNeededImmediately = false;
            /** Whether the outline gap needs to be calculated next time the zone has stabilized. */
            _this._outlineGapCalculationNeededOnStable = false;
            _this._destroyed = new rxjs.Subject();
            /** Override for the logic that disables the label animation in certain cases. */
            _this._showAlwaysAnimate = false;
            /** State of the mat-hint and mat-error animations. */
            _this._subscriptAnimationState = '';
            _this._hintLabel = '';
            // Unique id for the hint label.
            _this._hintLabelId = "mat-hint-" + nextUniqueId++;
            // Unique id for the label element.
            _this._labelId = "mat-form-field-label-" + nextUniqueId++;
            _this.floatLabel = _this._getDefaultFloatLabelState();
            _this._animationsEnabled = _animationMode !== 'NoopAnimations';
            // Set the default through here so we invoke the setter on the first run.
            _this.appearance = (_defaults && _defaults.appearance) ? _defaults.appearance : 'legacy';
            _this._hideRequiredMarker = (_defaults && _defaults.hideRequiredMarker != null) ?
                _defaults.hideRequiredMarker : false;
            return _this;
        }
        Object.defineProperty(MatFormField.prototype, "appearance", {
            /** The form-field appearance style. */
            get: function () { return this._appearance; },
            set: function (value) {
                var oldValue = this._appearance;
                this._appearance = value || (this._defaults && this._defaults.appearance) || 'legacy';
                if (this._appearance === 'outline' && oldValue !== value) {
                    this._outlineGapCalculationNeededOnStable = true;
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatFormField.prototype, "hideRequiredMarker", {
            /** Whether the required marker should be hidden. */
            get: function () { return this._hideRequiredMarker; },
            set: function (value) {
                this._hideRequiredMarker = coercion.coerceBooleanProperty(value);
            },
            enumerable: false,
            configurable: true
        });
        /** Whether the floating label should always float or not. */
        MatFormField.prototype._shouldAlwaysFloat = function () {
            return this.floatLabel === 'always' && !this._showAlwaysAnimate;
        };
        /** Whether the label can float or not. */
        MatFormField.prototype._canLabelFloat = function () { return this.floatLabel !== 'never'; };
        Object.defineProperty(MatFormField.prototype, "hintLabel", {
            /** Text for the form field hint. */
            get: function () { return this._hintLabel; },
            set: function (value) {
                this._hintLabel = value;
                this._processHints();
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatFormField.prototype, "floatLabel", {
            /**
             * Whether the label should always float, never float or float as the user types.
             *
             * Note: only the legacy appearance supports the `never` option. `never` was originally added as a
             * way to make the floating label emulate the behavior of a standard input placeholder. However
             * the form field now supports both floating labels and placeholders. Therefore in the non-legacy
             * appearances the `never` option has been disabled in favor of just using the placeholder.
             */
            get: function () {
                return this.appearance !== 'legacy' && this._floatLabel === 'never' ? 'auto' : this._floatLabel;
            },
            set: function (value) {
                if (value !== this._floatLabel) {
                    this._floatLabel = value || this._getDefaultFloatLabelState();
                    this._changeDetectorRef.markForCheck();
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatFormField.prototype, "_control", {
            get: function () {
                // TODO(crisbeto): we need this workaround in order to support both Ivy and ViewEngine.
                //  We should clean this up once Ivy is the default renderer.
                return this._explicitFormFieldControl || this._controlNonStatic || this._controlStatic;
            },
            set: function (value) {
                this._explicitFormFieldControl = value;
            },
            enumerable: false,
            configurable: true
        });
        /**
         * Gets the id of the label element. If no label is present, returns `null`.
         */
        MatFormField.prototype.getLabelId = function () {
            return this._hasFloatingLabel() ? this._labelId : null;
        };
        /**
         * Gets an ElementRef for the element that a overlay attached to the form-field should be
         * positioned relative to.
         */
        MatFormField.prototype.getConnectedOverlayOrigin = function () {
            return this._connectionContainerRef || this._elementRef;
        };
        MatFormField.prototype.ngAfterContentInit = function () {
            var _this = this;
            this._validateControlChild();
            var control = this._control;
            if (control.controlType) {
                this._elementRef.nativeElement.classList.add("mat-form-field-type-" + control.controlType);
            }
            // Subscribe to changes in the child control state in order to update the form field UI.
            control.stateChanges.pipe(operators.startWith(null)).subscribe(function () {
                _this._validatePlaceholders();
                _this._syncDescribedByIds();
                _this._changeDetectorRef.markForCheck();
            });
            // Run change detection if the value changes.
            if (control.ngControl && control.ngControl.valueChanges) {
                control.ngControl.valueChanges
                    .pipe(operators.takeUntil(this._destroyed))
                    .subscribe(function () { return _this._changeDetectorRef.markForCheck(); });
            }
            // Note that we have to run outside of the `NgZone` explicitly,
            // in order to avoid throwing users into an infinite loop
            // if `zone-patch-rxjs` is included.
            this._ngZone.runOutsideAngular(function () {
                _this._ngZone.onStable.pipe(operators.takeUntil(_this._destroyed)).subscribe(function () {
                    if (_this._outlineGapCalculationNeededOnStable) {
                        _this.updateOutlineGap();
                    }
                });
            });
            // Run change detection and update the outline if the suffix or prefix changes.
            rxjs.merge(this._prefixChildren.changes, this._suffixChildren.changes).subscribe(function () {
                _this._outlineGapCalculationNeededOnStable = true;
                _this._changeDetectorRef.markForCheck();
            });
            // Re-validate when the number of hints changes.
            this._hintChildren.changes.pipe(operators.startWith(null)).subscribe(function () {
                _this._processHints();
                _this._changeDetectorRef.markForCheck();
            });
            // Update the aria-described by when the number of errors changes.
            this._errorChildren.changes.pipe(operators.startWith(null)).subscribe(function () {
                _this._syncDescribedByIds();
                _this._changeDetectorRef.markForCheck();
            });
            if (this._dir) {
                this._dir.change.pipe(operators.takeUntil(this._destroyed)).subscribe(function () {
                    if (typeof requestAnimationFrame === 'function') {
                        _this._ngZone.runOutsideAngular(function () {
                            requestAnimationFrame(function () { return _this.updateOutlineGap(); });
                        });
                    }
                    else {
                        _this.updateOutlineGap();
                    }
                });
            }
        };
        MatFormField.prototype.ngAfterContentChecked = function () {
            this._validateControlChild();
            if (this._outlineGapCalculationNeededImmediately) {
                this.updateOutlineGap();
            }
        };
        MatFormField.prototype.ngAfterViewInit = function () {
            // Avoid animations on load.
            this._subscriptAnimationState = 'enter';
            this._changeDetectorRef.detectChanges();
        };
        MatFormField.prototype.ngOnDestroy = function () {
            this._destroyed.next();
            this._destroyed.complete();
        };
        /** Determines whether a class from the NgControl should be forwarded to the host element. */
        MatFormField.prototype._shouldForward = function (prop) {
            var ngControl = this._control ? this._control.ngControl : null;
            return ngControl && ngControl[prop];
        };
        MatFormField.prototype._hasPlaceholder = function () {
            return !!(this._control && this._control.placeholder || this._placeholderChild);
        };
        MatFormField.prototype._hasLabel = function () {
            return !!(this._labelChildNonStatic || this._labelChildStatic);
        };
        MatFormField.prototype._shouldLabelFloat = function () {
            return this._canLabelFloat() &&
                ((this._control && this._control.shouldLabelFloat) || this._shouldAlwaysFloat());
        };
        MatFormField.prototype._hideControlPlaceholder = function () {
            // In the legacy appearance the placeholder is promoted to a label if no label is given.
            return this.appearance === 'legacy' && !this._hasLabel() ||
                this._hasLabel() && !this._shouldLabelFloat();
        };
        MatFormField.prototype._hasFloatingLabel = function () {
            // In the legacy appearance the placeholder is promoted to a label if no label is given.
            return this._hasLabel() || this.appearance === 'legacy' && this._hasPlaceholder();
        };
        /** Determines whether to display hints or errors. */
        MatFormField.prototype._getDisplayedMessages = function () {
            return (this._errorChildren && this._errorChildren.length > 0 &&
                this._control.errorState) ? 'error' : 'hint';
        };
        /** Animates the placeholder up and locks it in position. */
        MatFormField.prototype._animateAndLockLabel = function () {
            var _this = this;
            if (this._hasFloatingLabel() && this._canLabelFloat()) {
                // If animations are disabled, we shouldn't go in here,
                // because the `transitionend` will never fire.
                if (this._animationsEnabled && this._label) {
                    this._showAlwaysAnimate = true;
                    rxjs.fromEvent(this._label.nativeElement, 'transitionend').pipe(operators.take(1)).subscribe(function () {
                        _this._showAlwaysAnimate = false;
                    });
                }
                this.floatLabel = 'always';
                this._changeDetectorRef.markForCheck();
            }
        };
        /**
         * Ensure that there is only one placeholder (either `placeholder` attribute on the child control
         * or child element with the `mat-placeholder` directive).
         */
        MatFormField.prototype._validatePlaceholders = function () {
            if (this._control.placeholder && this._placeholderChild &&
                (typeof ngDevMode === 'undefined' || ngDevMode)) {
                throw getMatFormFieldPlaceholderConflictError();
            }
        };
        /** Does any extra processing that is required when handling the hints. */
        MatFormField.prototype._processHints = function () {
            this._validateHints();
            this._syncDescribedByIds();
        };
        /**
         * Ensure that there is a maximum of one of each `<mat-hint>` alignment specified, with the
         * attribute being considered as `align="start"`.
         */
        MatFormField.prototype._validateHints = function () {
            var _this = this;
            if (this._hintChildren && (typeof ngDevMode === 'undefined' || ngDevMode)) {
                var startHint_1;
                var endHint_1;
                this._hintChildren.forEach(function (hint) {
                    if (hint.align === 'start') {
                        if (startHint_1 || _this.hintLabel) {
                            throw getMatFormFieldDuplicatedHintError('start');
                        }
                        startHint_1 = hint;
                    }
                    else if (hint.align === 'end') {
                        if (endHint_1) {
                            throw getMatFormFieldDuplicatedHintError('end');
                        }
                        endHint_1 = hint;
                    }
                });
            }
        };
        /** Gets the default float label state. */
        MatFormField.prototype._getDefaultFloatLabelState = function () {
            return (this._defaults && this._defaults.floatLabel) || 'auto';
        };
        /**
         * Sets the list of element IDs that describe the child control. This allows the control to update
         * its `aria-describedby` attribute accordingly.
         */
        MatFormField.prototype._syncDescribedByIds = function () {
            if (this._control) {
                var ids = [];
                // TODO(wagnermaciel): Remove the type check when we find the root cause of this bug.
                if (this._control.userAriaDescribedBy &&
                    typeof this._control.userAriaDescribedBy === 'string') {
                    ids.push.apply(ids, __spreadArray([], __read(this._control.userAriaDescribedBy.split(' '))));
                }
                if (this._getDisplayedMessages() === 'hint') {
                    var startHint = this._hintChildren ?
                        this._hintChildren.find(function (hint) { return hint.align === 'start'; }) : null;
                    var endHint = this._hintChildren ?
                        this._hintChildren.find(function (hint) { return hint.align === 'end'; }) : null;
                    if (startHint) {
                        ids.push(startHint.id);
                    }
                    else if (this._hintLabel) {
                        ids.push(this._hintLabelId);
                    }
                    if (endHint) {
                        ids.push(endHint.id);
                    }
                }
                else if (this._errorChildren) {
                    ids.push.apply(ids, __spreadArray([], __read(this._errorChildren.map(function (error) { return error.id; }))));
                }
                this._control.setDescribedByIds(ids);
            }
        };
        /** Throws an error if the form field's control is missing. */
        MatFormField.prototype._validateControlChild = function () {
            if (!this._control && (typeof ngDevMode === 'undefined' || ngDevMode)) {
                throw getMatFormFieldMissingControlError();
            }
        };
        /**
         * Updates the width and position of the gap in the outline. Only relevant for the outline
         * appearance.
         */
        MatFormField.prototype.updateOutlineGap = function () {
            var labelEl = this._label ? this._label.nativeElement : null;
            if (this.appearance !== 'outline' || !labelEl || !labelEl.children.length ||
                !labelEl.textContent.trim()) {
                return;
            }
            if (!this._platform.isBrowser) {
                // getBoundingClientRect isn't available on the server.
                return;
            }
            // If the element is not present in the DOM, the outline gap will need to be calculated
            // the next time it is checked and in the DOM.
            if (!this._isAttachedToDOM()) {
                this._outlineGapCalculationNeededImmediately = true;
                return;
            }
            var startWidth = 0;
            var gapWidth = 0;
            var container = this._connectionContainerRef.nativeElement;
            var startEls = container.querySelectorAll('.mat-form-field-outline-start');
            var gapEls = container.querySelectorAll('.mat-form-field-outline-gap');
            if (this._label && this._label.nativeElement.children.length) {
                var containerRect = container.getBoundingClientRect();
                // If the container's width and height are zero, it means that the element is
                // invisible and we can't calculate the outline gap. Mark the element as needing
                // to be checked the next time the zone stabilizes. We can't do this immediately
                // on the next change detection, because even if the element becomes visible,
                // the `ClientRect` won't be reclaculated immediately. We reset the
                // `_outlineGapCalculationNeededImmediately` flag some we don't run the checks twice.
                if (containerRect.width === 0 && containerRect.height === 0) {
                    this._outlineGapCalculationNeededOnStable = true;
                    this._outlineGapCalculationNeededImmediately = false;
                    return;
                }
                var containerStart = this._getStartEnd(containerRect);
                var labelChildren = labelEl.children;
                var labelStart = this._getStartEnd(labelChildren[0].getBoundingClientRect());
                var labelWidth = 0;
                for (var i = 0; i < labelChildren.length; i++) {
                    labelWidth += labelChildren[i].offsetWidth;
                }
                startWidth = Math.abs(labelStart - containerStart) - outlineGapPadding;
                gapWidth = labelWidth > 0 ? labelWidth * floatingLabelScale + outlineGapPadding * 2 : 0;
            }
            for (var i = 0; i < startEls.length; i++) {
                startEls[i].style.width = startWidth + "px";
            }
            for (var i = 0; i < gapEls.length; i++) {
                gapEls[i].style.width = gapWidth + "px";
            }
            this._outlineGapCalculationNeededOnStable =
                this._outlineGapCalculationNeededImmediately = false;
        };
        /** Gets the start end of the rect considering the current directionality. */
        MatFormField.prototype._getStartEnd = function (rect) {
            return (this._dir && this._dir.value === 'rtl') ? rect.right : rect.left;
        };
        /** Checks whether the form field is attached to the DOM. */
        MatFormField.prototype._isAttachedToDOM = function () {
            var element = this._elementRef.nativeElement;
            if (element.getRootNode) {
                var rootNode = element.getRootNode();
                // If the element is inside the DOM the root node will be either the document
                // or the closest shadow root, otherwise it'll be the element itself.
                return rootNode && rootNode !== element;
            }
            // Otherwise fall back to checking if it's in the document. This doesn't account for
            // shadow DOM, however browser that support shadow DOM should support `getRootNode` as well.
            return document.documentElement.contains(element);
        };
        return MatFormField;
    }(_MatFormFieldMixinBase));
    MatFormField.decorators = [
        { type: core.Component, args: [{
                    selector: 'mat-form-field',
                    exportAs: 'matFormField',
                    template: "<div class=\"mat-form-field-wrapper\">\n  <div class=\"mat-form-field-flex\" #connectionContainer\n       (click)=\"_control.onContainerClick && _control.onContainerClick($event)\">\n\n    <!-- Outline used for outline appearance. -->\n    <ng-container *ngIf=\"appearance == 'outline'\">\n      <div class=\"mat-form-field-outline\">\n        <div class=\"mat-form-field-outline-start\"></div>\n        <div class=\"mat-form-field-outline-gap\"></div>\n        <div class=\"mat-form-field-outline-end\"></div>\n      </div>\n      <div class=\"mat-form-field-outline mat-form-field-outline-thick\">\n        <div class=\"mat-form-field-outline-start\"></div>\n        <div class=\"mat-form-field-outline-gap\"></div>\n        <div class=\"mat-form-field-outline-end\"></div>\n      </div>\n    </ng-container>\n\n    <div class=\"mat-form-field-prefix\" *ngIf=\"_prefixChildren.length\">\n      <ng-content select=\"[matPrefix]\"></ng-content>\n    </div>\n\n    <div class=\"mat-form-field-infix\" #inputContainer>\n      <ng-content></ng-content>\n\n      <span class=\"mat-form-field-label-wrapper\">\n        <!-- We add aria-owns as a workaround for an issue in JAWS & NVDA where the label isn't\n             read if it comes before the control in the DOM. -->\n        <label class=\"mat-form-field-label\"\n               (cdkObserveContent)=\"updateOutlineGap()\"\n               [cdkObserveContentDisabled]=\"appearance != 'outline'\"\n               [id]=\"_labelId\"\n               [attr.for]=\"_control.id\"\n               [attr.aria-owns]=\"_control.id\"\n               [class.mat-empty]=\"_control.empty && !_shouldAlwaysFloat()\"\n               [class.mat-form-field-empty]=\"_control.empty && !_shouldAlwaysFloat()\"\n               [class.mat-accent]=\"color == 'accent'\"\n               [class.mat-warn]=\"color == 'warn'\"\n               #label\n               *ngIf=\"_hasFloatingLabel()\"\n               [ngSwitch]=\"_hasLabel()\">\n\n          <!-- @breaking-change 8.0.0 remove in favor of mat-label element an placeholder attr. -->\n          <ng-container *ngSwitchCase=\"false\">\n            <ng-content select=\"mat-placeholder\"></ng-content>\n            <span>{{_control.placeholder}}</span>\n          </ng-container>\n\n          <ng-content select=\"mat-label\" *ngSwitchCase=\"true\"></ng-content>\n\n          <!-- @breaking-change 8.0.0 remove `mat-placeholder-required` class -->\n          <span\n            class=\"mat-placeholder-required mat-form-field-required-marker\"\n            aria-hidden=\"true\"\n            *ngIf=\"!hideRequiredMarker && _control.required && !_control.disabled\">&#32;*</span>\n        </label>\n      </span>\n    </div>\n\n    <div class=\"mat-form-field-suffix\" *ngIf=\"_suffixChildren.length\">\n      <ng-content select=\"[matSuffix]\"></ng-content>\n    </div>\n  </div>\n\n  <!-- Underline used for legacy, standard, and box appearances. -->\n  <div class=\"mat-form-field-underline\" #underline\n       *ngIf=\"appearance != 'outline'\">\n    <span class=\"mat-form-field-ripple\"\n          [class.mat-accent]=\"color == 'accent'\"\n          [class.mat-warn]=\"color == 'warn'\"></span>\n  </div>\n\n  <div class=\"mat-form-field-subscript-wrapper\"\n       [ngSwitch]=\"_getDisplayedMessages()\">\n    <div *ngSwitchCase=\"'error'\" [@transitionMessages]=\"_subscriptAnimationState\">\n      <ng-content select=\"mat-error\"></ng-content>\n    </div>\n\n    <div class=\"mat-form-field-hint-wrapper\" *ngSwitchCase=\"'hint'\"\n      [@transitionMessages]=\"_subscriptAnimationState\">\n      <!-- TODO(mmalerba): use an actual <mat-hint> once all selectors are switched to mat-* -->\n      <div *ngIf=\"hintLabel\" [id]=\"_hintLabelId\" class=\"mat-hint\">{{hintLabel}}</div>\n      <ng-content select=\"mat-hint:not([align='end'])\"></ng-content>\n      <div class=\"mat-form-field-hint-spacer\"></div>\n      <ng-content select=\"mat-hint[align='end']\"></ng-content>\n    </div>\n  </div>\n</div>\n",
                    animations: [matFormFieldAnimations.transitionMessages],
                    host: {
                        'class': 'mat-form-field',
                        '[class.mat-form-field-appearance-standard]': 'appearance == "standard"',
                        '[class.mat-form-field-appearance-fill]': 'appearance == "fill"',
                        '[class.mat-form-field-appearance-outline]': 'appearance == "outline"',
                        '[class.mat-form-field-appearance-legacy]': 'appearance == "legacy"',
                        '[class.mat-form-field-invalid]': '_control.errorState',
                        '[class.mat-form-field-can-float]': '_canLabelFloat()',
                        '[class.mat-form-field-should-float]': '_shouldLabelFloat()',
                        '[class.mat-form-field-has-label]': '_hasFloatingLabel()',
                        '[class.mat-form-field-hide-placeholder]': '_hideControlPlaceholder()',
                        '[class.mat-form-field-disabled]': '_control.disabled',
                        '[class.mat-form-field-autofilled]': '_control.autofilled',
                        '[class.mat-focused]': '_control.focused',
                        '[class.ng-untouched]': '_shouldForward("untouched")',
                        '[class.ng-touched]': '_shouldForward("touched")',
                        '[class.ng-pristine]': '_shouldForward("pristine")',
                        '[class.ng-dirty]': '_shouldForward("dirty")',
                        '[class.ng-valid]': '_shouldForward("valid")',
                        '[class.ng-invalid]': '_shouldForward("invalid")',
                        '[class.ng-pending]': '_shouldForward("pending")',
                        '[class._mat-animation-noopable]': '!_animationsEnabled',
                    },
                    inputs: ['color'],
                    encapsulation: core.ViewEncapsulation.None,
                    changeDetection: core.ChangeDetectionStrategy.OnPush,
                    providers: [
                        { provide: MAT_FORM_FIELD, useExisting: MatFormField },
                    ],
                    styles: [".mat-form-field{display:inline-block;position:relative;text-align:left}[dir=rtl] .mat-form-field{text-align:right}.mat-form-field-wrapper{position:relative}.mat-form-field-flex{display:inline-flex;align-items:baseline;box-sizing:border-box;width:100%}.mat-form-field-prefix,.mat-form-field-suffix{white-space:nowrap;flex:none;position:relative}.mat-form-field-infix{display:block;position:relative;flex:auto;min-width:0;width:180px}.cdk-high-contrast-active .mat-form-field-infix{border-image:linear-gradient(transparent, transparent)}.mat-form-field-label-wrapper{position:absolute;left:0;box-sizing:content-box;width:100%;height:100%;overflow:hidden;pointer-events:none}[dir=rtl] .mat-form-field-label-wrapper{left:auto;right:0}.mat-form-field-label{position:absolute;left:0;font:inherit;pointer-events:none;width:100%;white-space:nowrap;text-overflow:ellipsis;overflow:hidden;transform-origin:0 0;transition:transform 400ms cubic-bezier(0.25, 0.8, 0.25, 1),color 400ms cubic-bezier(0.25, 0.8, 0.25, 1),width 400ms cubic-bezier(0.25, 0.8, 0.25, 1);display:none}[dir=rtl] .mat-form-field-label{transform-origin:100% 0;left:auto;right:0}.mat-form-field-empty.mat-form-field-label,.mat-form-field-can-float.mat-form-field-should-float .mat-form-field-label{display:block}.mat-form-field-autofill-control:-webkit-autofill+.mat-form-field-label-wrapper .mat-form-field-label{display:none}.mat-form-field-can-float .mat-form-field-autofill-control:-webkit-autofill+.mat-form-field-label-wrapper .mat-form-field-label{display:block;transition:none}.mat-input-server:focus+.mat-form-field-label-wrapper .mat-form-field-label,.mat-input-server[placeholder]:not(:placeholder-shown)+.mat-form-field-label-wrapper .mat-form-field-label{display:none}.mat-form-field-can-float .mat-input-server:focus+.mat-form-field-label-wrapper .mat-form-field-label,.mat-form-field-can-float .mat-input-server[placeholder]:not(:placeholder-shown)+.mat-form-field-label-wrapper .mat-form-field-label{display:block}.mat-form-field-label:not(.mat-form-field-empty){transition:none}.mat-form-field-underline{position:absolute;width:100%;pointer-events:none;transform:scale3d(1, 1.0001, 1)}.mat-form-field-ripple{position:absolute;left:0;width:100%;transform-origin:50%;transform:scaleX(0.5);opacity:0;transition:background-color 300ms cubic-bezier(0.55, 0, 0.55, 0.2)}.mat-form-field.mat-focused .mat-form-field-ripple,.mat-form-field.mat-form-field-invalid .mat-form-field-ripple{opacity:1;transform:none;transition:transform 300ms cubic-bezier(0.25, 0.8, 0.25, 1),opacity 100ms cubic-bezier(0.25, 0.8, 0.25, 1),background-color 300ms cubic-bezier(0.25, 0.8, 0.25, 1)}.mat-form-field-subscript-wrapper{position:absolute;box-sizing:border-box;width:100%;overflow:hidden}.mat-form-field-subscript-wrapper .mat-icon,.mat-form-field-label-wrapper .mat-icon{width:1em;height:1em;font-size:inherit;vertical-align:baseline}.mat-form-field-hint-wrapper{display:flex}.mat-form-field-hint-spacer{flex:1 0 1em}.mat-error{display:block}.mat-form-field-control-wrapper{position:relative}.mat-form-field-hint-end{order:1}.mat-form-field._mat-animation-noopable .mat-form-field-label,.mat-form-field._mat-animation-noopable .mat-form-field-ripple{transition:none}\n", ".mat-form-field-appearance-fill .mat-form-field-flex{border-radius:4px 4px 0 0;padding:.75em .75em 0 .75em}.cdk-high-contrast-active .mat-form-field-appearance-fill .mat-form-field-flex{outline:solid 1px}.mat-form-field-appearance-fill .mat-form-field-underline::before{content:\"\";display:block;position:absolute;bottom:0;height:1px;width:100%}.mat-form-field-appearance-fill .mat-form-field-ripple{bottom:0;height:2px}.cdk-high-contrast-active .mat-form-field-appearance-fill .mat-form-field-ripple{height:0;border-top:solid 2px}.mat-form-field-appearance-fill:not(.mat-form-field-disabled) .mat-form-field-flex:hover~.mat-form-field-underline .mat-form-field-ripple{opacity:1;transform:none;transition:opacity 600ms cubic-bezier(0.25, 0.8, 0.25, 1)}.mat-form-field-appearance-fill._mat-animation-noopable:not(.mat-form-field-disabled) .mat-form-field-flex:hover~.mat-form-field-underline .mat-form-field-ripple{transition:none}.mat-form-field-appearance-fill .mat-form-field-subscript-wrapper{padding:0 1em}\n", ".mat-input-element{font:inherit;background:transparent;color:currentColor;border:none;outline:none;padding:0;margin:0;width:100%;max-width:100%;vertical-align:bottom;text-align:inherit;box-sizing:content-box}.mat-input-element:-moz-ui-invalid{box-shadow:none}.mat-input-element::-ms-clear,.mat-input-element::-ms-reveal{display:none}.mat-input-element,.mat-input-element::-webkit-search-cancel-button,.mat-input-element::-webkit-search-decoration,.mat-input-element::-webkit-search-results-button,.mat-input-element::-webkit-search-results-decoration{-webkit-appearance:none}.mat-input-element::-webkit-contacts-auto-fill-button,.mat-input-element::-webkit-caps-lock-indicator,.mat-input-element::-webkit-credentials-auto-fill-button{visibility:hidden}.mat-input-element[type=date],.mat-input-element[type=datetime],.mat-input-element[type=datetime-local],.mat-input-element[type=month],.mat-input-element[type=week],.mat-input-element[type=time]{line-height:1}.mat-input-element[type=date]::after,.mat-input-element[type=datetime]::after,.mat-input-element[type=datetime-local]::after,.mat-input-element[type=month]::after,.mat-input-element[type=week]::after,.mat-input-element[type=time]::after{content:\" \";white-space:pre;width:1px}.mat-input-element::-webkit-inner-spin-button,.mat-input-element::-webkit-calendar-picker-indicator,.mat-input-element::-webkit-clear-button{font-size:.75em}.mat-input-element::placeholder{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;transition:color 400ms 133.3333333333ms cubic-bezier(0.25, 0.8, 0.25, 1)}.mat-input-element::placeholder:-ms-input-placeholder{-ms-user-select:text}.mat-input-element::-moz-placeholder{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;transition:color 400ms 133.3333333333ms cubic-bezier(0.25, 0.8, 0.25, 1)}.mat-input-element::-moz-placeholder:-ms-input-placeholder{-ms-user-select:text}.mat-input-element::-webkit-input-placeholder{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;transition:color 400ms 133.3333333333ms cubic-bezier(0.25, 0.8, 0.25, 1)}.mat-input-element::-webkit-input-placeholder:-ms-input-placeholder{-ms-user-select:text}.mat-input-element:-ms-input-placeholder{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;transition:color 400ms 133.3333333333ms cubic-bezier(0.25, 0.8, 0.25, 1)}.mat-input-element:-ms-input-placeholder:-ms-input-placeholder{-ms-user-select:text}.mat-form-field-hide-placeholder .mat-input-element::placeholder{color:transparent !important;-webkit-text-fill-color:transparent;transition:none}.mat-form-field-hide-placeholder .mat-input-element::-moz-placeholder{color:transparent !important;-webkit-text-fill-color:transparent;transition:none}.mat-form-field-hide-placeholder .mat-input-element::-webkit-input-placeholder{color:transparent !important;-webkit-text-fill-color:transparent;transition:none}.mat-form-field-hide-placeholder .mat-input-element:-ms-input-placeholder{color:transparent !important;-webkit-text-fill-color:transparent;transition:none}textarea.mat-input-element{resize:vertical;overflow:auto}textarea.mat-input-element.cdk-textarea-autosize{resize:none}textarea.mat-input-element{padding:2px 0;margin:-2px 0}select.mat-input-element{-moz-appearance:none;-webkit-appearance:none;position:relative;background-color:transparent;display:inline-flex;box-sizing:border-box;padding-top:1em;top:-1em;margin-bottom:-1em}select.mat-input-element::-ms-expand{display:none}select.mat-input-element::-moz-focus-inner{border:0}select.mat-input-element:not(:disabled){cursor:pointer}select.mat-input-element::-ms-value{color:inherit;background:none}.mat-focused .cdk-high-contrast-active select.mat-input-element::-ms-value{color:inherit}.mat-form-field-type-mat-native-select .mat-form-field-infix::after{content:\"\";width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:5px solid;position:absolute;top:50%;right:0;margin-top:-2.5px;pointer-events:none}[dir=rtl] .mat-form-field-type-mat-native-select .mat-form-field-infix::after{right:auto;left:0}.mat-form-field-type-mat-native-select .mat-input-element{padding-right:15px}[dir=rtl] .mat-form-field-type-mat-native-select .mat-input-element{padding-right:0;padding-left:15px}.mat-form-field-type-mat-native-select .mat-form-field-label-wrapper{max-width:calc(100% - 10px)}.mat-form-field-type-mat-native-select.mat-form-field-appearance-outline .mat-form-field-infix::after{margin-top:-5px}.mat-form-field-type-mat-native-select.mat-form-field-appearance-fill .mat-form-field-infix::after{margin-top:-10px}\n", ".mat-form-field-appearance-legacy .mat-form-field-label{transform:perspective(100px);-ms-transform:none}.mat-form-field-appearance-legacy .mat-form-field-prefix .mat-icon,.mat-form-field-appearance-legacy .mat-form-field-suffix .mat-icon{width:1em}.mat-form-field-appearance-legacy .mat-form-field-prefix .mat-icon-button,.mat-form-field-appearance-legacy .mat-form-field-suffix .mat-icon-button{font:inherit;vertical-align:baseline}.mat-form-field-appearance-legacy .mat-form-field-prefix .mat-icon-button .mat-icon,.mat-form-field-appearance-legacy .mat-form-field-suffix .mat-icon-button .mat-icon{font-size:inherit}.mat-form-field-appearance-legacy .mat-form-field-underline{height:1px}.cdk-high-contrast-active .mat-form-field-appearance-legacy .mat-form-field-underline{height:0;border-top:solid 1px}.mat-form-field-appearance-legacy .mat-form-field-ripple{top:0;height:2px;overflow:hidden}.cdk-high-contrast-active .mat-form-field-appearance-legacy .mat-form-field-ripple{height:0;border-top:solid 2px}.mat-form-field-appearance-legacy.mat-form-field-disabled .mat-form-field-underline{background-position:0;background-color:transparent}.cdk-high-contrast-active .mat-form-field-appearance-legacy.mat-form-field-disabled .mat-form-field-underline{border-top-style:dotted;border-top-width:2px}.mat-form-field-appearance-legacy.mat-form-field-invalid:not(.mat-focused) .mat-form-field-ripple{height:1px}\n", ".mat-form-field-appearance-outline .mat-form-field-wrapper{margin:.25em 0}.mat-form-field-appearance-outline .mat-form-field-flex{padding:0 .75em 0 .75em;margin-top:-0.25em;position:relative}.mat-form-field-appearance-outline .mat-form-field-prefix,.mat-form-field-appearance-outline .mat-form-field-suffix{top:.25em}.mat-form-field-appearance-outline .mat-form-field-outline{display:flex;position:absolute;top:.25em;left:0;right:0;bottom:0;pointer-events:none}.mat-form-field-appearance-outline .mat-form-field-outline-start,.mat-form-field-appearance-outline .mat-form-field-outline-end{border:1px solid currentColor;min-width:5px}.mat-form-field-appearance-outline .mat-form-field-outline-start{border-radius:5px 0 0 5px;border-right-style:none}[dir=rtl] .mat-form-field-appearance-outline .mat-form-field-outline-start{border-right-style:solid;border-left-style:none;border-radius:0 5px 5px 0}.mat-form-field-appearance-outline .mat-form-field-outline-end{border-radius:0 5px 5px 0;border-left-style:none;flex-grow:1}[dir=rtl] .mat-form-field-appearance-outline .mat-form-field-outline-end{border-left-style:solid;border-right-style:none;border-radius:5px 0 0 5px}.mat-form-field-appearance-outline .mat-form-field-outline-gap{border-radius:.000001px;border:1px solid currentColor;border-left-style:none;border-right-style:none}.mat-form-field-appearance-outline.mat-form-field-can-float.mat-form-field-should-float .mat-form-field-outline-gap{border-top-color:transparent}.mat-form-field-appearance-outline .mat-form-field-outline-thick{opacity:0}.mat-form-field-appearance-outline .mat-form-field-outline-thick .mat-form-field-outline-start,.mat-form-field-appearance-outline .mat-form-field-outline-thick .mat-form-field-outline-end,.mat-form-field-appearance-outline .mat-form-field-outline-thick .mat-form-field-outline-gap{border-width:2px}.mat-form-field-appearance-outline.mat-focused .mat-form-field-outline,.mat-form-field-appearance-outline.mat-form-field-invalid .mat-form-field-outline{opacity:0;transition:opacity 100ms cubic-bezier(0.25, 0.8, 0.25, 1)}.mat-form-field-appearance-outline.mat-focused .mat-form-field-outline-thick,.mat-form-field-appearance-outline.mat-form-field-invalid .mat-form-field-outline-thick{opacity:1}.mat-form-field-appearance-outline:not(.mat-form-field-disabled) .mat-form-field-flex:hover .mat-form-field-outline{opacity:0;transition:opacity 600ms cubic-bezier(0.25, 0.8, 0.25, 1)}.mat-form-field-appearance-outline:not(.mat-form-field-disabled) .mat-form-field-flex:hover .mat-form-field-outline-thick{opacity:1}.mat-form-field-appearance-outline .mat-form-field-subscript-wrapper{padding:0 1em}.mat-form-field-appearance-outline._mat-animation-noopable:not(.mat-form-field-disabled) .mat-form-field-flex:hover~.mat-form-field-outline,.mat-form-field-appearance-outline._mat-animation-noopable .mat-form-field-outline,.mat-form-field-appearance-outline._mat-animation-noopable .mat-form-field-outline-start,.mat-form-field-appearance-outline._mat-animation-noopable .mat-form-field-outline-end,.mat-form-field-appearance-outline._mat-animation-noopable .mat-form-field-outline-gap{transition:none}\n", ".mat-form-field-appearance-standard .mat-form-field-flex{padding-top:.75em}.mat-form-field-appearance-standard .mat-form-field-underline{height:1px}.cdk-high-contrast-active .mat-form-field-appearance-standard .mat-form-field-underline{height:0;border-top:solid 1px}.mat-form-field-appearance-standard .mat-form-field-ripple{bottom:0;height:2px}.cdk-high-contrast-active .mat-form-field-appearance-standard .mat-form-field-ripple{height:0;border-top:solid 2px}.mat-form-field-appearance-standard.mat-form-field-disabled .mat-form-field-underline{background-position:0;background-color:transparent}.cdk-high-contrast-active .mat-form-field-appearance-standard.mat-form-field-disabled .mat-form-field-underline{border-top-style:dotted;border-top-width:2px}.mat-form-field-appearance-standard:not(.mat-form-field-disabled) .mat-form-field-flex:hover~.mat-form-field-underline .mat-form-field-ripple{opacity:1;transform:none;transition:opacity 600ms cubic-bezier(0.25, 0.8, 0.25, 1)}.mat-form-field-appearance-standard._mat-animation-noopable:not(.mat-form-field-disabled) .mat-form-field-flex:hover~.mat-form-field-underline .mat-form-field-ripple{transition:none}\n"]
                },] }
    ];
    MatFormField.ctorParameters = function () { return [
        { type: core.ElementRef },
        { type: core.ChangeDetectorRef },
        { type: undefined, decorators: [{ type: core.Inject, args: [core.ElementRef,] }] },
        { type: bidi.Directionality, decorators: [{ type: core.Optional }] },
        { type: undefined, decorators: [{ type: core.Optional }, { type: core.Inject, args: [MAT_FORM_FIELD_DEFAULT_OPTIONS,] }] },
        { type: platform.Platform },
        { type: core.NgZone },
        { type: String, decorators: [{ type: core.Optional }, { type: core.Inject, args: [animations$1.ANIMATION_MODULE_TYPE,] }] }
    ]; };
    MatFormField.propDecorators = {
        appearance: [{ type: core.Input }],
        hideRequiredMarker: [{ type: core.Input }],
        hintLabel: [{ type: core.Input }],
        floatLabel: [{ type: core.Input }],
        underlineRef: [{ type: core.ViewChild, args: ['underline',] }],
        _connectionContainerRef: [{ type: core.ViewChild, args: ['connectionContainer', { static: true },] }],
        _inputContainerRef: [{ type: core.ViewChild, args: ['inputContainer',] }],
        _label: [{ type: core.ViewChild, args: ['label',] }],
        _controlNonStatic: [{ type: core.ContentChild, args: [MatFormFieldControl,] }],
        _controlStatic: [{ type: core.ContentChild, args: [MatFormFieldControl, { static: true },] }],
        _labelChildNonStatic: [{ type: core.ContentChild, args: [MatLabel,] }],
        _labelChildStatic: [{ type: core.ContentChild, args: [MatLabel, { static: true },] }],
        _placeholderChild: [{ type: core.ContentChild, args: [MatPlaceholder,] }],
        _errorChildren: [{ type: core.ContentChildren, args: [MAT_ERROR, { descendants: true },] }],
        _hintChildren: [{ type: core.ContentChildren, args: [_MAT_HINT, { descendants: true },] }],
        _prefixChildren: [{ type: core.ContentChildren, args: [MAT_PREFIX, { descendants: true },] }],
        _suffixChildren: [{ type: core.ContentChildren, args: [MAT_SUFFIX, { descendants: true },] }]
    };

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var MatFormFieldModule = /** @class */ (function () {
        function MatFormFieldModule() {
        }
        return MatFormFieldModule;
    }());
    MatFormFieldModule.decorators = [
        { type: core.NgModule, args: [{
                    declarations: [
                        MatError,
                        MatFormField,
                        MatHint,
                        MatLabel,
                        MatPlaceholder,
                        MatPrefix,
                        MatSuffix,
                    ],
                    imports: [
                        common.CommonModule,
                        core$1.MatCommonModule,
                        observers.ObserversModule,
                    ],
                    exports: [
                        core$1.MatCommonModule,
                        MatError,
                        MatFormField,
                        MatHint,
                        MatLabel,
                        MatPlaceholder,
                        MatPrefix,
                        MatSuffix,
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

    exports.MAT_ERROR = MAT_ERROR;
    exports.MAT_FORM_FIELD = MAT_FORM_FIELD;
    exports.MAT_FORM_FIELD_DEFAULT_OPTIONS = MAT_FORM_FIELD_DEFAULT_OPTIONS;
    exports.MAT_PREFIX = MAT_PREFIX;
    exports.MAT_SUFFIX = MAT_SUFFIX;
    exports.MatError = MatError;
    exports.MatFormField = MatFormField;
    exports.MatFormFieldControl = MatFormFieldControl;
    exports.MatFormFieldModule = MatFormFieldModule;
    exports.MatHint = MatHint;
    exports.MatLabel = MatLabel;
    exports.MatPlaceholder = MatPlaceholder;
    exports.MatPrefix = MatPrefix;
    exports.MatSuffix = MatSuffix;
    exports._MAT_HINT = _MAT_HINT;
    exports.getMatFormFieldDuplicatedHintError = getMatFormFieldDuplicatedHintError;
    exports.getMatFormFieldMissingControlError = getMatFormFieldMissingControlError;
    exports.getMatFormFieldPlaceholderConflictError = getMatFormFieldPlaceholderConflictError;
    exports.matFormFieldAnimations = matFormFieldAnimations;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=material-form-field.umd.js.map
