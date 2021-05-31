(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/cdk/portal'), require('@angular/cdk/stepper'), require('@angular/common'), require('@angular/core'), require('@angular/material/button'), require('@angular/material/core'), require('@angular/material/icon'), require('@angular/cdk/a11y'), require('rxjs'), require('@angular/cdk/bidi'), require('rxjs/operators'), require('@angular/animations')) :
    typeof define === 'function' && define.amd ? define('@angular/material/stepper', ['exports', '@angular/cdk/portal', '@angular/cdk/stepper', '@angular/common', '@angular/core', '@angular/material/button', '@angular/material/core', '@angular/material/icon', '@angular/cdk/a11y', 'rxjs', '@angular/cdk/bidi', 'rxjs/operators', '@angular/animations'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.ng = global.ng || {}, global.ng.material = global.ng.material || {}, global.ng.material.stepper = {}), global.ng.cdk.portal, global.ng.cdk.stepper, global.ng.common, global.ng.core, global.ng.material.button, global.ng.material.core, global.ng.material.icon, global.ng.cdk.a11y, global.rxjs, global.ng.cdk.bidi, global.rxjs.operators, global.ng.animations));
}(this, (function (exports, portal, stepper, common, i0, button, core, icon, a11y, rxjs, bidi, operators, animations) { 'use strict';

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

    var i0__namespace = /*#__PURE__*/_interopNamespace(i0);

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

    var MatStepLabel = /** @class */ (function (_super) {
        __extends(MatStepLabel, _super);
        function MatStepLabel() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return MatStepLabel;
    }(stepper.CdkStepLabel));
    MatStepLabel.decorators = [
        { type: i0.Directive, args: [{
                    selector: '[matStepLabel]',
                },] }
    ];

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /** Stepper data that is required for internationalization. */
    var MatStepperIntl = /** @class */ (function () {
        function MatStepperIntl() {
            /**
             * Stream that emits whenever the labels here are changed. Use this to notify
             * components if the labels have changed after initialization.
             */
            this.changes = new rxjs.Subject();
            /** Label that is rendered below optional steps. */
            this.optionalLabel = 'Optional';
        }
        return MatStepperIntl;
    }());
    MatStepperIntl.ɵprov = i0__namespace.ɵɵdefineInjectable({ factory: function MatStepperIntl_Factory() { return new MatStepperIntl(); }, token: MatStepperIntl, providedIn: "root" });
    MatStepperIntl.decorators = [
        { type: i0.Injectable, args: [{ providedIn: 'root' },] }
    ];
    /** @docs-private */
    function MAT_STEPPER_INTL_PROVIDER_FACTORY(parentIntl) {
        return parentIntl || new MatStepperIntl();
    }
    /** @docs-private */
    var MAT_STEPPER_INTL_PROVIDER = {
        provide: MatStepperIntl,
        deps: [[new i0.Optional(), new i0.SkipSelf(), MatStepperIntl]],
        useFactory: MAT_STEPPER_INTL_PROVIDER_FACTORY
    };

    // Boilerplate for applying mixins to MatStepHeader.
    /** @docs-private */
    var MatStepHeaderBase = /** @class */ (function (_super) {
        __extends(MatStepHeaderBase, _super);
        function MatStepHeaderBase(elementRef) {
            return _super.call(this, elementRef) || this;
        }
        return MatStepHeaderBase;
    }(stepper.CdkStepHeader));
    var _MatStepHeaderMixinBase = core.mixinColor(MatStepHeaderBase, 'primary');
    var MatStepHeader = /** @class */ (function (_super) {
        __extends(MatStepHeader, _super);
        function MatStepHeader(_intl, _focusMonitor, _elementRef, changeDetectorRef) {
            var _this = _super.call(this, _elementRef) || this;
            _this._intl = _intl;
            _this._focusMonitor = _focusMonitor;
            _this._intlSubscription = _intl.changes.subscribe(function () { return changeDetectorRef.markForCheck(); });
            return _this;
        }
        MatStepHeader.prototype.ngAfterViewInit = function () {
            this._focusMonitor.monitor(this._elementRef, true);
        };
        MatStepHeader.prototype.ngOnDestroy = function () {
            this._intlSubscription.unsubscribe();
            this._focusMonitor.stopMonitoring(this._elementRef);
        };
        /** Focuses the step header. */
        MatStepHeader.prototype.focus = function (origin, options) {
            if (origin) {
                this._focusMonitor.focusVia(this._elementRef, origin, options);
            }
            else {
                this._elementRef.nativeElement.focus(options);
            }
        };
        /** Returns string label of given step if it is a text label. */
        MatStepHeader.prototype._stringLabel = function () {
            return this.label instanceof MatStepLabel ? null : this.label;
        };
        /** Returns MatStepLabel if the label of given step is a template label. */
        MatStepHeader.prototype._templateLabel = function () {
            return this.label instanceof MatStepLabel ? this.label : null;
        };
        /** Returns the host HTML element. */
        MatStepHeader.prototype._getHostElement = function () {
            return this._elementRef.nativeElement;
        };
        /** Template context variables that are exposed to the `matStepperIcon` instances. */
        MatStepHeader.prototype._getIconContext = function () {
            return {
                index: this.index,
                active: this.active,
                optional: this.optional
            };
        };
        MatStepHeader.prototype._getDefaultTextForState = function (state) {
            if (state == 'number') {
                return "" + (this.index + 1);
            }
            if (state == 'edit') {
                return 'create';
            }
            if (state == 'error') {
                return 'warning';
            }
            return state;
        };
        return MatStepHeader;
    }(_MatStepHeaderMixinBase));
    MatStepHeader.decorators = [
        { type: i0.Component, args: [{
                    selector: 'mat-step-header',
                    template: "<div class=\"mat-step-header-ripple mat-focus-indicator\" matRipple\n     [matRippleTrigger]=\"_getHostElement()\"\n     [matRippleDisabled]=\"disableRipple\"></div>\n\n<div class=\"mat-step-icon-state-{{state}} mat-step-icon\" [class.mat-step-icon-selected]=\"selected\">\n  <div class=\"mat-step-icon-content\" [ngSwitch]=\"!!(iconOverrides && iconOverrides[state])\">\n    <ng-container\n      *ngSwitchCase=\"true\"\n      [ngTemplateOutlet]=\"iconOverrides[state]\"\n      [ngTemplateOutletContext]=\"_getIconContext()\"></ng-container>\n    <ng-container *ngSwitchDefault [ngSwitch]=\"state\">\n      <span *ngSwitchCase=\"'number'\">{{_getDefaultTextForState(state)}}</span>\n      <mat-icon *ngSwitchDefault>{{_getDefaultTextForState(state)}}</mat-icon>\n    </ng-container>\n  </div>\n</div>\n<div class=\"mat-step-label\"\n     [class.mat-step-label-active]=\"active\"\n     [class.mat-step-label-selected]=\"selected\"\n     [class.mat-step-label-error]=\"state == 'error'\">\n  <!-- If there is a label template, use it. -->\n  <div class=\"mat-step-text-label\" *ngIf=\"_templateLabel()\">\n    <ng-container [ngTemplateOutlet]=\"_templateLabel()!.template\"></ng-container>\n  </div>\n  <!-- If there is no label template, fall back to the text label. -->\n  <div class=\"mat-step-text-label\" *ngIf=\"_stringLabel()\">{{label}}</div>\n\n  <div class=\"mat-step-optional\" *ngIf=\"optional && state != 'error'\">{{_intl.optionalLabel}}</div>\n  <div class=\"mat-step-sub-label-error\" *ngIf=\"state == 'error'\">{{errorMessage}}</div>\n</div>\n\n",
                    inputs: ['color'],
                    host: {
                        'class': 'mat-step-header',
                        'role': 'tab',
                    },
                    encapsulation: i0.ViewEncapsulation.None,
                    changeDetection: i0.ChangeDetectionStrategy.OnPush,
                    styles: [".mat-step-header{overflow:hidden;outline:none;cursor:pointer;position:relative;box-sizing:content-box;-webkit-tap-highlight-color:transparent}.mat-step-optional,.mat-step-sub-label-error{font-size:12px}.mat-step-icon{border-radius:50%;height:24px;width:24px;flex-shrink:0;position:relative}.mat-step-icon-content,.mat-step-icon .mat-icon{position:absolute;top:50%;left:50%;transform:translate(-50%, -50%)}.mat-step-icon .mat-icon{font-size:16px;height:16px;width:16px}.mat-step-icon-state-error .mat-icon{font-size:24px;height:24px;width:24px}.mat-step-label{display:inline-block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:50px;vertical-align:middle}.mat-step-text-label{text-overflow:ellipsis;overflow:hidden}.mat-step-header .mat-step-header-ripple{top:0;left:0;right:0;bottom:0;position:absolute;pointer-events:none}\n"]
                },] }
    ];
    MatStepHeader.ctorParameters = function () { return [
        { type: MatStepperIntl },
        { type: a11y.FocusMonitor },
        { type: i0.ElementRef },
        { type: i0.ChangeDetectorRef }
    ]; };
    MatStepHeader.propDecorators = {
        state: [{ type: i0.Input }],
        label: [{ type: i0.Input }],
        errorMessage: [{ type: i0.Input }],
        iconOverrides: [{ type: i0.Input }],
        index: [{ type: i0.Input }],
        selected: [{ type: i0.Input }],
        active: [{ type: i0.Input }],
        optional: [{ type: i0.Input }],
        disableRipple: [{ type: i0.Input }]
    };

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /**
     * Animations used by the Material steppers.
     * @docs-private
     */
    var matStepperAnimations = {
        /** Animation that transitions the step along the X axis in a horizontal stepper. */
        horizontalStepTransition: animations.trigger('horizontalStepTransition', [
            animations.state('previous', animations.style({ transform: 'translate3d(-100%, 0, 0)', visibility: 'hidden' })),
            // Transition to `inherit`, rather than `visible`,
            // because visibility on a child element the one from the parent,
            // making this element focusable inside of a `hidden` element.
            animations.state('current', animations.style({ transform: 'none', visibility: 'inherit' })),
            animations.state('next', animations.style({ transform: 'translate3d(100%, 0, 0)', visibility: 'hidden' })),
            animations.transition('* => *', animations.animate('500ms cubic-bezier(0.35, 0, 0.25, 1)'))
        ]),
        /** Animation that transitions the step along the Y axis in a vertical stepper. */
        verticalStepTransition: animations.trigger('verticalStepTransition', [
            animations.state('previous', animations.style({ height: '0px', visibility: 'hidden' })),
            animations.state('next', animations.style({ height: '0px', visibility: 'hidden' })),
            // Transition to `inherit`, rather than `visible`,
            // because visibility on a child element the one from the parent,
            // making this element focusable inside of a `hidden` element.
            animations.state('current', animations.style({ height: '*', visibility: 'inherit' })),
            animations.transition('* <=> current', animations.animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
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
     * Template to be used to override the icons inside the step header.
     */
    var MatStepperIcon = /** @class */ (function () {
        function MatStepperIcon(templateRef) {
            this.templateRef = templateRef;
        }
        return MatStepperIcon;
    }());
    MatStepperIcon.decorators = [
        { type: i0.Directive, args: [{
                    selector: 'ng-template[matStepperIcon]',
                },] }
    ];
    MatStepperIcon.ctorParameters = function () { return [
        { type: i0.TemplateRef }
    ]; };
    MatStepperIcon.propDecorators = {
        name: [{ type: i0.Input, args: ['matStepperIcon',] }]
    };

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /**
     * Content for a `mat-step` that will be rendered lazily.
     */
    var MatStepContent = /** @class */ (function () {
        function MatStepContent(_template) {
            this._template = _template;
        }
        return MatStepContent;
    }());
    MatStepContent.decorators = [
        { type: i0.Directive, args: [{
                    selector: 'ng-template[matStepContent]'
                },] }
    ];
    MatStepContent.ctorParameters = function () { return [
        { type: i0.TemplateRef }
    ]; };

    var MatStep = /** @class */ (function (_super) {
        __extends(MatStep, _super);
        function MatStep(stepper, _errorStateMatcher, _viewContainerRef, stepperOptions) {
            var _this = _super.call(this, stepper, stepperOptions) || this;
            _this._errorStateMatcher = _errorStateMatcher;
            _this._viewContainerRef = _viewContainerRef;
            _this._isSelected = rxjs.Subscription.EMPTY;
            return _this;
        }
        MatStep.prototype.ngAfterContentInit = function () {
            var _this = this;
            this._isSelected = this._stepper.steps.changes.pipe(operators.switchMap(function () {
                return _this._stepper.selectionChange.pipe(operators.map(function (event) { return event.selectedStep === _this; }), operators.startWith(_this._stepper.selected === _this));
            })).subscribe(function (isSelected) {
                if (isSelected && _this._lazyContent && !_this._portal) {
                    _this._portal = new portal.TemplatePortal(_this._lazyContent._template, _this._viewContainerRef);
                }
            });
        };
        MatStep.prototype.ngOnDestroy = function () {
            this._isSelected.unsubscribe();
        };
        /** Custom error state matcher that additionally checks for validity of interacted form. */
        MatStep.prototype.isErrorState = function (control, form) {
            var originalErrorState = this._errorStateMatcher.isErrorState(control, form);
            // Custom error state checks for the validity of form that is not submitted or touched
            // since user can trigger a form change by calling for another step without directly
            // interacting with the current form.
            var customErrorState = !!(control && control.invalid && this.interacted);
            return originalErrorState || customErrorState;
        };
        return MatStep;
    }(stepper.CdkStep));
    MatStep.decorators = [
        { type: i0.Component, args: [{
                    selector: 'mat-step',
                    template: "<ng-template>\n  <ng-content></ng-content>\n  <ng-template [cdkPortalOutlet]=\"_portal\"></ng-template>\n</ng-template>\n",
                    providers: [
                        { provide: core.ErrorStateMatcher, useExisting: MatStep },
                        { provide: stepper.CdkStep, useExisting: MatStep },
                    ],
                    encapsulation: i0.ViewEncapsulation.None,
                    exportAs: 'matStep',
                    changeDetection: i0.ChangeDetectionStrategy.OnPush
                },] }
    ];
    MatStep.ctorParameters = function () { return [
        { type: MatStepper, decorators: [{ type: i0.Inject, args: [i0.forwardRef(function () { return MatStepper; }),] }] },
        { type: core.ErrorStateMatcher, decorators: [{ type: i0.SkipSelf }] },
        { type: i0.ViewContainerRef },
        { type: undefined, decorators: [{ type: i0.Optional }, { type: i0.Inject, args: [stepper.STEPPER_GLOBAL_OPTIONS,] }] }
    ]; };
    MatStep.propDecorators = {
        stepLabel: [{ type: i0.ContentChild, args: [MatStepLabel,] }],
        color: [{ type: i0.Input }],
        _lazyContent: [{ type: i0.ContentChild, args: [MatStepContent, { static: false },] }]
    };
    /**
     * Proxies the public APIs from `MatStepper` to the deprecated `MatHorizontalStepper` and
     * `MatVerticalStepper`.
     * @deprecated Use `MatStepper` instead.
     * @breaking-change 13.0.0
     * @docs-private
     */
    var _MatProxyStepperBase = /** @class */ (function (_super) {
        __extends(_MatProxyStepperBase, _super);
        function _MatProxyStepperBase() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return _MatProxyStepperBase;
    }(stepper.CdkStepper));
    _MatProxyStepperBase.decorators = [
        { type: i0.Directive }
    ];
    /**
     * @deprecated Use `MatStepper` instead.
     * @breaking-change 13.0.0
     */
    var MatHorizontalStepper = /** @class */ (function (_super) {
        __extends(MatHorizontalStepper, _super);
        function MatHorizontalStepper() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return MatHorizontalStepper;
    }(_MatProxyStepperBase));
    MatHorizontalStepper.decorators = [
        { type: i0.Directive, args: [{ selector: 'mat-horizontal-stepper' },] }
    ];
    /**
     * @deprecated Use `MatStepper` instead.
     * @breaking-change 13.0.0
     */
    var MatVerticalStepper = /** @class */ (function (_super) {
        __extends(MatVerticalStepper, _super);
        function MatVerticalStepper() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return MatVerticalStepper;
    }(_MatProxyStepperBase));
    MatVerticalStepper.decorators = [
        { type: i0.Directive, args: [{ selector: 'mat-vertical-stepper' },] }
    ];
    var MatStepper = /** @class */ (function (_super) {
        __extends(MatStepper, _super);
        function MatStepper(dir, changeDetectorRef, elementRef, _document) {
            var _this = _super.call(this, dir, changeDetectorRef, elementRef, _document) || this;
            /** Steps that belong to the current stepper, excluding ones from nested steppers. */
            _this.steps = new i0.QueryList();
            /** Event emitted when the current step is done transitioning in. */
            _this.animationDone = new i0.EventEmitter();
            /**
             * Whether the label should display in bottom or end position.
             * Only applies in the `horizontal` orientation.
             */
            _this.labelPosition = 'end';
            /** Consumer-specified template-refs to be used to override the header icons. */
            _this._iconOverrides = {};
            /** Stream of animation `done` events when the body expands/collapses. */
            _this._animationDone = new rxjs.Subject();
            var nodeName = elementRef.nativeElement.nodeName.toLowerCase();
            _this.orientation = nodeName === 'mat-vertical-stepper' ? 'vertical' : 'horizontal';
            return _this;
        }
        MatStepper.prototype.ngAfterContentInit = function () {
            var _this = this;
            _super.prototype.ngAfterContentInit.call(this);
            this._icons.forEach(function (_a) {
                var name = _a.name, templateRef = _a.templateRef;
                return _this._iconOverrides[name] = templateRef;
            });
            // Mark the component for change detection whenever the content children query changes
            this.steps.changes.pipe(operators.takeUntil(this._destroyed)).subscribe(function () {
                _this._stateChanged();
            });
            this._animationDone.pipe(
            // This needs a `distinctUntilChanged` in order to avoid emitting the same event twice due
            // to a bug in animations where the `.done` callback gets invoked twice on some browsers.
            // See https://github.com/angular/angular/issues/24084
            operators.distinctUntilChanged(function (x, y) { return x.fromState === y.fromState && x.toState === y.toState; }), operators.takeUntil(this._destroyed)).subscribe(function (event) {
                if (event.toState === 'current') {
                    _this.animationDone.emit();
                }
            });
        };
        return MatStepper;
    }(stepper.CdkStepper));
    MatStepper.decorators = [
        { type: i0.Component, args: [{
                    selector: 'mat-stepper, mat-vertical-stepper, mat-horizontal-stepper, [matStepper]',
                    exportAs: 'matStepper, matVerticalStepper, matHorizontalStepper',
                    template: "<ng-container [ngSwitch]=\"orientation\">\n  <!-- Horizontal stepper -->\n  <ng-container *ngSwitchCase=\"'horizontal'\">\n    <div class=\"mat-horizontal-stepper-header-container\">\n      <ng-container *ngFor=\"let step of steps; let i = index; let isLast = last\">\n        <ng-container\n          [ngTemplateOutlet]=\"stepTemplate\"\n          [ngTemplateOutletContext]=\"{step: step, i: i}\"></ng-container>\n        <div *ngIf=\"!isLast\" class=\"mat-stepper-horizontal-line\"></div>\n      </ng-container>\n    </div>\n\n    <div class=\"mat-horizontal-content-container\">\n      <div *ngFor=\"let step of steps; let i = index\"\n           class=\"mat-horizontal-stepper-content\" role=\"tabpanel\"\n           [@horizontalStepTransition]=\"_getAnimationDirection(i)\"\n           (@horizontalStepTransition.done)=\"_animationDone.next($event)\"\n           [id]=\"_getStepContentId(i)\"\n           [attr.aria-labelledby]=\"_getStepLabelId(i)\"\n           [attr.aria-expanded]=\"selectedIndex === i\">\n        <ng-container [ngTemplateOutlet]=\"step.content\"></ng-container>\n      </div>\n    </div>\n  </ng-container>\n\n  <!-- Vertical stepper -->\n  <ng-container *ngSwitchCase=\"'vertical'\">\n    <div class=\"mat-step\" *ngFor=\"let step of steps; let i = index; let isLast = last\">\n      <ng-container\n        [ngTemplateOutlet]=\"stepTemplate\"\n        [ngTemplateOutletContext]=\"{step: step, i: i}\"></ng-container>\n      <div class=\"mat-vertical-content-container\" [class.mat-stepper-vertical-line]=\"!isLast\">\n        <div class=\"mat-vertical-stepper-content\" role=\"tabpanel\"\n             [@verticalStepTransition]=\"_getAnimationDirection(i)\"\n             (@verticalStepTransition.done)=\"_animationDone.next($event)\"\n             [id]=\"_getStepContentId(i)\"\n             [attr.aria-labelledby]=\"_getStepLabelId(i)\"\n             [attr.aria-expanded]=\"selectedIndex === i\">\n          <div class=\"mat-vertical-content\">\n            <ng-container [ngTemplateOutlet]=\"step.content\"></ng-container>\n          </div>\n        </div>\n      </div>\n    </div>\n  </ng-container>\n\n</ng-container>\n\n<!-- Common step templating -->\n<ng-template let-step=\"step\" let-i=\"i\" #stepTemplate>\n  <mat-step-header\n    [class.mat-horizontal-stepper-header]=\"orientation === 'horizontal'\"\n    [class.mat-vertical-stepper-header]=\"orientation === 'vertical'\"\n    (click)=\"step.select()\"\n    (keydown)=\"_onKeydown($event)\"\n    [tabIndex]=\"_getFocusIndex() === i ? 0 : -1\"\n    [id]=\"_getStepLabelId(i)\"\n    [attr.aria-posinset]=\"i + 1\"\n    [attr.aria-setsize]=\"steps.length\"\n    [attr.aria-controls]=\"_getStepContentId(i)\"\n    [attr.aria-selected]=\"selectedIndex == i\"\n    [attr.aria-label]=\"step.ariaLabel || null\"\n    [attr.aria-labelledby]=\"(!step.ariaLabel && step.ariaLabelledby) ? step.ariaLabelledby : null\"\n    [index]=\"i\"\n    [state]=\"_getIndicatorType(i, step.state)\"\n    [label]=\"step.stepLabel || step.label\"\n    [selected]=\"selectedIndex === i\"\n    [active]=\"step.completed || selectedIndex === i || !linear\"\n    [optional]=\"step.optional\"\n    [errorMessage]=\"step.errorMessage\"\n    [iconOverrides]=\"_iconOverrides\"\n    [disableRipple]=\"disableRipple\"\n    [color]=\"step.color || color\"></mat-step-header>\n</ng-template>\n",
                    inputs: ['selectedIndex'],
                    host: {
                        '[class.mat-stepper-horizontal]': 'orientation === "horizontal"',
                        '[class.mat-stepper-vertical]': 'orientation === "vertical"',
                        '[class.mat-stepper-label-position-end]': 'orientation === "horizontal" && labelPosition == "end"',
                        '[class.mat-stepper-label-position-bottom]': 'orientation === "horizontal" && labelPosition == "bottom"',
                        '[attr.aria-orientation]': 'orientation',
                        'role': 'tablist',
                    },
                    animations: [
                        matStepperAnimations.horizontalStepTransition,
                        matStepperAnimations.verticalStepTransition,
                    ],
                    providers: [
                        { provide: stepper.CdkStepper, useExisting: MatStepper },
                        { provide: MatHorizontalStepper, useExisting: MatStepper },
                        { provide: MatVerticalStepper, useExisting: MatStepper },
                    ],
                    encapsulation: i0.ViewEncapsulation.None,
                    changeDetection: i0.ChangeDetectionStrategy.OnPush,
                    styles: [".mat-stepper-vertical,.mat-stepper-horizontal{display:block}.mat-horizontal-stepper-header-container{white-space:nowrap;display:flex;align-items:center}.mat-stepper-label-position-bottom .mat-horizontal-stepper-header-container{align-items:flex-start}.mat-stepper-horizontal-line{border-top-width:1px;border-top-style:solid;flex:auto;height:0;margin:0 -16px;min-width:32px}.mat-stepper-label-position-bottom .mat-stepper-horizontal-line{margin:0;min-width:0;position:relative}.mat-stepper-label-position-bottom .mat-horizontal-stepper-header:not(:first-child)::before,[dir=rtl] .mat-stepper-label-position-bottom .mat-horizontal-stepper-header:not(:last-child)::before,.mat-stepper-label-position-bottom .mat-horizontal-stepper-header:not(:last-child)::after,[dir=rtl] .mat-stepper-label-position-bottom .mat-horizontal-stepper-header:not(:first-child)::after{border-top-width:1px;border-top-style:solid;content:\"\";display:inline-block;height:0;position:absolute;width:calc(50% - 20px)}.mat-horizontal-stepper-header{display:flex;height:72px;overflow:hidden;align-items:center;padding:0 24px}.mat-horizontal-stepper-header .mat-step-icon{margin-right:8px;flex:none}[dir=rtl] .mat-horizontal-stepper-header .mat-step-icon{margin-right:0;margin-left:8px}.mat-stepper-label-position-bottom .mat-horizontal-stepper-header{box-sizing:border-box;flex-direction:column;height:auto}.mat-stepper-label-position-bottom .mat-horizontal-stepper-header:not(:last-child)::after,[dir=rtl] .mat-stepper-label-position-bottom .mat-horizontal-stepper-header:not(:first-child)::after{right:0}.mat-stepper-label-position-bottom .mat-horizontal-stepper-header:not(:first-child)::before,[dir=rtl] .mat-stepper-label-position-bottom .mat-horizontal-stepper-header:not(:last-child)::before{left:0}[dir=rtl] .mat-stepper-label-position-bottom .mat-horizontal-stepper-header:last-child::before,[dir=rtl] .mat-stepper-label-position-bottom .mat-horizontal-stepper-header:first-child::after{display:none}.mat-stepper-label-position-bottom .mat-horizontal-stepper-header .mat-step-icon{margin-right:0;margin-left:0}.mat-stepper-label-position-bottom .mat-horizontal-stepper-header .mat-step-label{padding:16px 0 0 0;text-align:center;width:100%}.mat-vertical-stepper-header{display:flex;align-items:center;height:24px}.mat-vertical-stepper-header .mat-step-icon{margin-right:12px}[dir=rtl] .mat-vertical-stepper-header .mat-step-icon{margin-right:0;margin-left:12px}.mat-horizontal-stepper-content{outline:0}.mat-horizontal-stepper-content[aria-expanded=false]{height:0;overflow:hidden}.mat-horizontal-content-container{overflow:hidden;padding:0 24px 24px 24px}.mat-vertical-content-container{margin-left:36px;border:0;position:relative}[dir=rtl] .mat-vertical-content-container{margin-left:0;margin-right:36px}.mat-stepper-vertical-line::before{content:\"\";position:absolute;left:0;border-left-width:1px;border-left-style:solid}[dir=rtl] .mat-stepper-vertical-line::before{left:auto;right:0}.mat-vertical-stepper-content{overflow:hidden;outline:0}.mat-vertical-content{padding:0 24px 24px 24px}.mat-step:last-child .mat-vertical-content-container{border:none}\n"]
                },] }
    ];
    MatStepper.ctorParameters = function () { return [
        { type: bidi.Directionality, decorators: [{ type: i0.Optional }] },
        { type: i0.ChangeDetectorRef },
        { type: i0.ElementRef },
        { type: undefined, decorators: [{ type: i0.Inject, args: [common.DOCUMENT,] }] }
    ]; };
    MatStepper.propDecorators = {
        _stepHeader: [{ type: i0.ViewChildren, args: [MatStepHeader,] }],
        _steps: [{ type: i0.ContentChildren, args: [MatStep, { descendants: true },] }],
        _icons: [{ type: i0.ContentChildren, args: [MatStepperIcon, { descendants: true },] }],
        animationDone: [{ type: i0.Output }],
        disableRipple: [{ type: i0.Input }],
        color: [{ type: i0.Input }],
        labelPosition: [{ type: i0.Input }]
    };

    /** Button that moves to the next step in a stepper workflow. */
    var MatStepperNext = /** @class */ (function (_super) {
        __extends(MatStepperNext, _super);
        function MatStepperNext() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return MatStepperNext;
    }(stepper.CdkStepperNext));
    MatStepperNext.decorators = [
        { type: i0.Directive, args: [{
                    selector: 'button[matStepperNext]',
                    host: {
                        'class': 'mat-stepper-next',
                        '[type]': 'type',
                    },
                    inputs: ['type']
                },] }
    ];
    /** Button that moves to the previous step in a stepper workflow. */
    var MatStepperPrevious = /** @class */ (function (_super) {
        __extends(MatStepperPrevious, _super);
        function MatStepperPrevious() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return MatStepperPrevious;
    }(stepper.CdkStepperPrevious));
    MatStepperPrevious.decorators = [
        { type: i0.Directive, args: [{
                    selector: 'button[matStepperPrevious]',
                    host: {
                        'class': 'mat-stepper-previous',
                        '[type]': 'type',
                    },
                    inputs: ['type']
                },] }
    ];

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var MatStepperModule = /** @class */ (function () {
        function MatStepperModule() {
        }
        return MatStepperModule;
    }());
    MatStepperModule.decorators = [
        { type: i0.NgModule, args: [{
                    imports: [
                        core.MatCommonModule,
                        common.CommonModule,
                        portal.PortalModule,
                        button.MatButtonModule,
                        stepper.CdkStepperModule,
                        icon.MatIconModule,
                        core.MatRippleModule,
                    ],
                    exports: [
                        core.MatCommonModule,
                        MatStep,
                        MatStepLabel,
                        MatStepper,
                        MatStepperNext,
                        MatStepperPrevious,
                        MatStepHeader,
                        MatStepperIcon,
                        MatStepContent,
                    ],
                    declarations: [
                        MatHorizontalStepper,
                        MatVerticalStepper,
                        MatStep,
                        MatStepLabel,
                        MatStepper,
                        MatStepperNext,
                        MatStepperPrevious,
                        MatStepHeader,
                        MatStepperIcon,
                        MatStepContent,
                    ],
                    providers: [MAT_STEPPER_INTL_PROVIDER, core.ErrorStateMatcher],
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

    exports.MAT_STEPPER_INTL_PROVIDER = MAT_STEPPER_INTL_PROVIDER;
    exports.MAT_STEPPER_INTL_PROVIDER_FACTORY = MAT_STEPPER_INTL_PROVIDER_FACTORY;
    exports.MatHorizontalStepper = MatHorizontalStepper;
    exports.MatStep = MatStep;
    exports.MatStepContent = MatStepContent;
    exports.MatStepHeader = MatStepHeader;
    exports.MatStepLabel = MatStepLabel;
    exports.MatStepper = MatStepper;
    exports.MatStepperIcon = MatStepperIcon;
    exports.MatStepperIntl = MatStepperIntl;
    exports.MatStepperModule = MatStepperModule;
    exports.MatStepperNext = MatStepperNext;
    exports.MatStepperPrevious = MatStepperPrevious;
    exports.MatVerticalStepper = MatVerticalStepper;
    exports.matStepperAnimations = matStepperAnimations;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=material-stepper.umd.js.map
