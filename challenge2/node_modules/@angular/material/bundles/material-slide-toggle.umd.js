(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/cdk/observers'), require('@angular/core'), require('@angular/material/core'), require('@angular/cdk/a11y'), require('@angular/cdk/coercion'), require('@angular/forms'), require('@angular/platform-browser/animations')) :
    typeof define === 'function' && define.amd ? define('@angular/material/slide-toggle', ['exports', '@angular/cdk/observers', '@angular/core', '@angular/material/core', '@angular/cdk/a11y', '@angular/cdk/coercion', '@angular/forms', '@angular/platform-browser/animations'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.ng = global.ng || {}, global.ng.material = global.ng.material || {}, global.ng.material.slideToggle = {}), global.ng.cdk.observers, global.ng.core, global.ng.material.core, global.ng.cdk.a11y, global.ng.cdk.coercion, global.ng.forms, global.ng.platformBrowser.animations));
}(this, (function (exports, observers, core, core$1, a11y, coercion, forms, animations) { 'use strict';

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
    /** Injection token to be used to override the default options for `mat-slide-toggle`. */
    var MAT_SLIDE_TOGGLE_DEFAULT_OPTIONS = new core.InjectionToken('mat-slide-toggle-default-options', {
        providedIn: 'root',
        factory: function () { return ({ disableToggleValue: false }); }
    });

    // Increasing integer for generating unique ids for slide-toggle components.
    var nextUniqueId = 0;
    /** @docs-private */
    var MAT_SLIDE_TOGGLE_VALUE_ACCESSOR = {
        provide: forms.NG_VALUE_ACCESSOR,
        useExisting: core.forwardRef(function () { return MatSlideToggle; }),
        multi: true
    };
    /** Change event object emitted by a MatSlideToggle. */
    var MatSlideToggleChange = /** @class */ (function () {
        function MatSlideToggleChange(
        /** The source MatSlideToggle of the event. */
        source, 
        /** The new `checked` value of the MatSlideToggle. */
        checked) {
            this.source = source;
            this.checked = checked;
        }
        return MatSlideToggleChange;
    }());
    // Boilerplate for applying mixins to MatSlideToggle.
    /** @docs-private */
    var MatSlideToggleBase = /** @class */ (function () {
        function MatSlideToggleBase(_elementRef) {
            this._elementRef = _elementRef;
        }
        return MatSlideToggleBase;
    }());
    var _MatSlideToggleMixinBase = core$1.mixinTabIndex(core$1.mixinColor(core$1.mixinDisableRipple(core$1.mixinDisabled(MatSlideToggleBase))));
    /** Represents a slidable "switch" toggle that can be moved between on and off. */
    var MatSlideToggle = /** @class */ (function (_super) {
        __extends(MatSlideToggle, _super);
        function MatSlideToggle(elementRef, _focusMonitor, _changeDetectorRef, tabIndex, defaults, animationMode) {
            var _this = _super.call(this, elementRef) || this;
            _this._focusMonitor = _focusMonitor;
            _this._changeDetectorRef = _changeDetectorRef;
            _this.defaults = defaults;
            _this._onChange = function (_) { };
            _this._onTouched = function () { };
            _this._uniqueId = "mat-slide-toggle-" + ++nextUniqueId;
            _this._required = false;
            _this._checked = false;
            /** Name value will be applied to the input element if present. */
            _this.name = null;
            /** A unique id for the slide-toggle input. If none is supplied, it will be auto-generated. */
            _this.id = _this._uniqueId;
            /** Whether the label should appear after or before the slide-toggle. Defaults to 'after'. */
            _this.labelPosition = 'after';
            /** Used to set the aria-label attribute on the underlying input element. */
            _this.ariaLabel = null;
            /** Used to set the aria-labelledby attribute on the underlying input element. */
            _this.ariaLabelledby = null;
            /** An event will be dispatched each time the slide-toggle changes its value. */
            _this.change = new core.EventEmitter();
            /**
             * An event will be dispatched each time the slide-toggle input is toggled.
             * This event is always emitted when the user toggles the slide toggle, but this does not mean
             * the slide toggle's value has changed.
             */
            _this.toggleChange = new core.EventEmitter();
            _this.tabIndex = parseInt(tabIndex) || 0;
            _this.color = _this.defaultColor = defaults.color || 'accent';
            _this._noopAnimations = animationMode === 'NoopAnimations';
            return _this;
        }
        Object.defineProperty(MatSlideToggle.prototype, "required", {
            /** Whether the slide-toggle is required. */
            get: function () { return this._required; },
            set: function (value) { this._required = coercion.coerceBooleanProperty(value); },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatSlideToggle.prototype, "checked", {
            /** Whether the slide-toggle element is checked or not. */
            get: function () { return this._checked; },
            set: function (value) {
                this._checked = coercion.coerceBooleanProperty(value);
                this._changeDetectorRef.markForCheck();
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatSlideToggle.prototype, "inputId", {
            /** Returns the unique id for the visual hidden input. */
            get: function () { return (this.id || this._uniqueId) + "-input"; },
            enumerable: false,
            configurable: true
        });
        MatSlideToggle.prototype.ngAfterContentInit = function () {
            var _this = this;
            this._focusMonitor
                .monitor(this._elementRef, true)
                .subscribe(function (focusOrigin) {
                // Only forward focus manually when it was received programmatically or through the
                // keyboard. We should not do this for mouse/touch focus for two reasons:
                // 1. It can prevent clicks from landing in Chrome (see #18269).
                // 2. They're already handled by the wrapping `label` element.
                if (focusOrigin === 'keyboard' || focusOrigin === 'program') {
                    _this._inputElement.nativeElement.focus();
                }
                else if (!focusOrigin) {
                    // When a focused element becomes disabled, the browser *immediately* fires a blur event.
                    // Angular does not expect events to be raised during change detection, so any state
                    // change (such as a form control's 'ng-touched') will cause a changed-after-checked
                    // error. See https://github.com/angular/angular/issues/17793. To work around this,
                    // we defer telling the form control it has been touched until the next tick.
                    Promise.resolve().then(function () { return _this._onTouched(); });
                }
            });
        };
        MatSlideToggle.prototype.ngOnDestroy = function () {
            this._focusMonitor.stopMonitoring(this._elementRef);
        };
        /** Method being called whenever the underlying input emits a change event. */
        MatSlideToggle.prototype._onChangeEvent = function (event) {
            // We always have to stop propagation on the change event.
            // Otherwise the change event, from the input element, will bubble up and
            // emit its event object to the component's `change` output.
            event.stopPropagation();
            this.toggleChange.emit();
            // When the slide toggle's config disables toggle change event by setting
            // `disableToggleValue: true`, the slide toggle's value does not change, and the
            // checked state of the underlying input needs to be changed back.
            if (this.defaults.disableToggleValue) {
                this._inputElement.nativeElement.checked = this.checked;
                return;
            }
            // Sync the value from the underlying input element with the component instance.
            this.checked = this._inputElement.nativeElement.checked;
            // Emit our custom change event only if the underlying input emitted one. This ensures that
            // there is no change event, when the checked state changes programmatically.
            this._emitChangeEvent();
        };
        /** Method being called whenever the slide-toggle has been clicked. */
        MatSlideToggle.prototype._onInputClick = function (event) {
            // We have to stop propagation for click events on the visual hidden input element.
            // By default, when a user clicks on a label element, a generated click event will be
            // dispatched on the associated input element. Since we are using a label element as our
            // root container, the click event on the `slide-toggle` will be executed twice.
            // The real click event will bubble up, and the generated click event also tries to bubble up.
            // This will lead to multiple click events.
            // Preventing bubbling for the second event will solve that issue.
            event.stopPropagation();
        };
        /** Implemented as part of ControlValueAccessor. */
        MatSlideToggle.prototype.writeValue = function (value) {
            this.checked = !!value;
        };
        /** Implemented as part of ControlValueAccessor. */
        MatSlideToggle.prototype.registerOnChange = function (fn) {
            this._onChange = fn;
        };
        /** Implemented as part of ControlValueAccessor. */
        MatSlideToggle.prototype.registerOnTouched = function (fn) {
            this._onTouched = fn;
        };
        /** Implemented as a part of ControlValueAccessor. */
        MatSlideToggle.prototype.setDisabledState = function (isDisabled) {
            this.disabled = isDisabled;
            this._changeDetectorRef.markForCheck();
        };
        /** Focuses the slide-toggle. */
        MatSlideToggle.prototype.focus = function (options, origin) {
            if (origin) {
                this._focusMonitor.focusVia(this._inputElement, origin, options);
            }
            else {
                this._inputElement.nativeElement.focus(options);
            }
        };
        /** Toggles the checked state of the slide-toggle. */
        MatSlideToggle.prototype.toggle = function () {
            this.checked = !this.checked;
            this._onChange(this.checked);
        };
        /**
         * Emits a change event on the `change` output. Also notifies the FormControl about the change.
         */
        MatSlideToggle.prototype._emitChangeEvent = function () {
            this._onChange(this.checked);
            this.change.emit(new MatSlideToggleChange(this, this.checked));
        };
        /** Method being called whenever the label text changes. */
        MatSlideToggle.prototype._onLabelTextChange = function () {
            // Since the event of the `cdkObserveContent` directive runs outside of the zone, the
            // slide-toggle component will be only marked for check, but no actual change detection runs
            // automatically. Instead of going back into the zone in order to trigger a change detection
            // which causes *all* components to be checked (if explicitly marked or not using OnPush),
            // we only trigger an explicit change detection for the slide-toggle view and its children.
            this._changeDetectorRef.detectChanges();
        };
        return MatSlideToggle;
    }(_MatSlideToggleMixinBase));
    MatSlideToggle.decorators = [
        { type: core.Component, args: [{
                    selector: 'mat-slide-toggle',
                    exportAs: 'matSlideToggle',
                    host: {
                        'class': 'mat-slide-toggle',
                        '[id]': 'id',
                        // Needs to be `-1` so it can still receive programmatic focus.
                        '[attr.tabindex]': 'disabled ? null : -1',
                        '[attr.aria-label]': 'null',
                        '[attr.aria-labelledby]': 'null',
                        '[class.mat-checked]': 'checked',
                        '[class.mat-disabled]': 'disabled',
                        '[class.mat-slide-toggle-label-before]': 'labelPosition == "before"',
                        '[class._mat-animation-noopable]': '_noopAnimations',
                    },
                    template: "<label [attr.for]=\"inputId\" class=\"mat-slide-toggle-label\" #label>\n  <div #toggleBar class=\"mat-slide-toggle-bar\"\n       [class.mat-slide-toggle-bar-no-side-margin]=\"!labelContent.textContent || !labelContent.textContent.trim()\">\n\n    <input #input class=\"mat-slide-toggle-input cdk-visually-hidden\" type=\"checkbox\"\n           role=\"switch\"\n           [id]=\"inputId\"\n           [required]=\"required\"\n           [tabIndex]=\"tabIndex\"\n           [checked]=\"checked\"\n           [disabled]=\"disabled\"\n           [attr.name]=\"name\"\n           [attr.aria-checked]=\"checked.toString()\"\n           [attr.aria-label]=\"ariaLabel\"\n           [attr.aria-labelledby]=\"ariaLabelledby\"\n           (change)=\"_onChangeEvent($event)\"\n           (click)=\"_onInputClick($event)\">\n\n    <div class=\"mat-slide-toggle-thumb-container\" #thumbContainer>\n      <div class=\"mat-slide-toggle-thumb\"></div>\n      <div class=\"mat-slide-toggle-ripple mat-focus-indicator\" mat-ripple\n           [matRippleTrigger]=\"label\"\n           [matRippleDisabled]=\"disableRipple || disabled\"\n           [matRippleCentered]=\"true\"\n           [matRippleRadius]=\"20\"\n           [matRippleAnimation]=\"{enterDuration: _noopAnimations ? 0 : 150}\">\n\n        <div class=\"mat-ripple-element mat-slide-toggle-persistent-ripple\"></div>\n      </div>\n    </div>\n\n  </div>\n\n  <span class=\"mat-slide-toggle-content\" #labelContent (cdkObserveContent)=\"_onLabelTextChange()\">\n    <!-- Add an invisible span so JAWS can read the label -->\n    <span style=\"display:none\">&nbsp;</span>\n    <ng-content></ng-content>\n  </span>\n</label>\n",
                    providers: [MAT_SLIDE_TOGGLE_VALUE_ACCESSOR],
                    inputs: ['disabled', 'disableRipple', 'color', 'tabIndex'],
                    encapsulation: core.ViewEncapsulation.None,
                    changeDetection: core.ChangeDetectionStrategy.OnPush,
                    styles: [".mat-slide-toggle{display:inline-block;height:24px;max-width:100%;line-height:24px;white-space:nowrap;outline:none;-webkit-tap-highlight-color:transparent}.mat-slide-toggle.mat-checked .mat-slide-toggle-thumb-container{transform:translate3d(16px, 0, 0)}[dir=rtl] .mat-slide-toggle.mat-checked .mat-slide-toggle-thumb-container{transform:translate3d(-16px, 0, 0)}.mat-slide-toggle.mat-disabled{opacity:.38}.mat-slide-toggle.mat-disabled .mat-slide-toggle-label,.mat-slide-toggle.mat-disabled .mat-slide-toggle-thumb-container{cursor:default}.mat-slide-toggle-label{display:flex;flex:1;flex-direction:row;align-items:center;height:inherit;cursor:pointer}.mat-slide-toggle-content{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.mat-slide-toggle-label-before .mat-slide-toggle-label{order:1}.mat-slide-toggle-label-before .mat-slide-toggle-bar{order:2}[dir=rtl] .mat-slide-toggle-label-before .mat-slide-toggle-bar,.mat-slide-toggle-bar{margin-right:8px;margin-left:0}[dir=rtl] .mat-slide-toggle-bar,.mat-slide-toggle-label-before .mat-slide-toggle-bar{margin-left:8px;margin-right:0}.mat-slide-toggle-bar-no-side-margin{margin-left:0;margin-right:0}.mat-slide-toggle-thumb-container{position:absolute;z-index:1;width:20px;height:20px;top:-3px;left:0;transform:translate3d(0, 0, 0);transition:all 80ms linear;transition-property:transform}._mat-animation-noopable .mat-slide-toggle-thumb-container{transition:none}[dir=rtl] .mat-slide-toggle-thumb-container{left:auto;right:0}.mat-slide-toggle-thumb{height:20px;width:20px;border-radius:50%}.mat-slide-toggle-bar{position:relative;width:36px;height:14px;flex-shrink:0;border-radius:8px}.mat-slide-toggle-input{bottom:0;left:10px}[dir=rtl] .mat-slide-toggle-input{left:auto;right:10px}.mat-slide-toggle-bar,.mat-slide-toggle-thumb{transition:all 80ms linear;transition-property:background-color;transition-delay:50ms}._mat-animation-noopable .mat-slide-toggle-bar,._mat-animation-noopable .mat-slide-toggle-thumb{transition:none}.mat-slide-toggle .mat-slide-toggle-ripple{position:absolute;top:calc(50% - 20px);left:calc(50% - 20px);height:40px;width:40px;z-index:1;pointer-events:none}.mat-slide-toggle .mat-slide-toggle-ripple .mat-ripple-element:not(.mat-slide-toggle-persistent-ripple){opacity:.12}.mat-slide-toggle-persistent-ripple{width:100%;height:100%;transform:none}.mat-slide-toggle-bar:hover .mat-slide-toggle-persistent-ripple{opacity:.04}.mat-slide-toggle:not(.mat-disabled).cdk-keyboard-focused .mat-slide-toggle-persistent-ripple{opacity:.12}.mat-slide-toggle-persistent-ripple,.mat-slide-toggle.mat-disabled .mat-slide-toggle-bar:hover .mat-slide-toggle-persistent-ripple{opacity:0}@media(hover: none){.mat-slide-toggle-bar:hover .mat-slide-toggle-persistent-ripple{display:none}}.cdk-high-contrast-active .mat-slide-toggle-thumb,.cdk-high-contrast-active .mat-slide-toggle-bar{border:1px solid}.cdk-high-contrast-active .mat-slide-toggle.cdk-keyboard-focused .mat-slide-toggle-bar{outline:2px dotted;outline-offset:5px}\n"]
                },] }
    ];
    MatSlideToggle.ctorParameters = function () { return [
        { type: core.ElementRef },
        { type: a11y.FocusMonitor },
        { type: core.ChangeDetectorRef },
        { type: String, decorators: [{ type: core.Attribute, args: ['tabindex',] }] },
        { type: undefined, decorators: [{ type: core.Inject, args: [MAT_SLIDE_TOGGLE_DEFAULT_OPTIONS,] }] },
        { type: String, decorators: [{ type: core.Optional }, { type: core.Inject, args: [animations.ANIMATION_MODULE_TYPE,] }] }
    ]; };
    MatSlideToggle.propDecorators = {
        _thumbEl: [{ type: core.ViewChild, args: ['thumbContainer',] }],
        _thumbBarEl: [{ type: core.ViewChild, args: ['toggleBar',] }],
        name: [{ type: core.Input }],
        id: [{ type: core.Input }],
        labelPosition: [{ type: core.Input }],
        ariaLabel: [{ type: core.Input, args: ['aria-label',] }],
        ariaLabelledby: [{ type: core.Input, args: ['aria-labelledby',] }],
        required: [{ type: core.Input }],
        checked: [{ type: core.Input }],
        change: [{ type: core.Output }],
        toggleChange: [{ type: core.Output }],
        _inputElement: [{ type: core.ViewChild, args: ['input',] }]
    };

    var MAT_SLIDE_TOGGLE_REQUIRED_VALIDATOR = {
        provide: forms.NG_VALIDATORS,
        useExisting: core.forwardRef(function () { return MatSlideToggleRequiredValidator; }),
        multi: true
    };
    /**
     * Validator for Material slide-toggle components with the required attribute in a
     * template-driven form. The default validator for required form controls asserts
     * that the control value is not undefined but that is not appropriate for a slide-toggle
     * where the value is always defined.
     *
     * Required slide-toggle form controls are valid when checked.
     */
    var MatSlideToggleRequiredValidator = /** @class */ (function (_super) {
        __extends(MatSlideToggleRequiredValidator, _super);
        function MatSlideToggleRequiredValidator() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return MatSlideToggleRequiredValidator;
    }(forms.CheckboxRequiredValidator));
    MatSlideToggleRequiredValidator.decorators = [
        { type: core.Directive, args: [{
                    selector: "mat-slide-toggle[required][formControlName],\n             mat-slide-toggle[required][formControl], mat-slide-toggle[required][ngModel]",
                    providers: [MAT_SLIDE_TOGGLE_REQUIRED_VALIDATOR],
                },] }
    ];

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /** This module is used by both original and MDC-based slide-toggle implementations. */
    var _MatSlideToggleRequiredValidatorModule = /** @class */ (function () {
        function _MatSlideToggleRequiredValidatorModule() {
        }
        return _MatSlideToggleRequiredValidatorModule;
    }());
    _MatSlideToggleRequiredValidatorModule.decorators = [
        { type: core.NgModule, args: [{
                    exports: [MatSlideToggleRequiredValidator],
                    declarations: [MatSlideToggleRequiredValidator],
                },] }
    ];
    var MatSlideToggleModule = /** @class */ (function () {
        function MatSlideToggleModule() {
        }
        return MatSlideToggleModule;
    }());
    MatSlideToggleModule.decorators = [
        { type: core.NgModule, args: [{
                    imports: [
                        _MatSlideToggleRequiredValidatorModule,
                        core$1.MatRippleModule,
                        core$1.MatCommonModule,
                        observers.ObserversModule,
                    ],
                    exports: [
                        _MatSlideToggleRequiredValidatorModule,
                        MatSlideToggle,
                        core$1.MatCommonModule
                    ],
                    declarations: [MatSlideToggle],
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

    exports.MAT_SLIDE_TOGGLE_DEFAULT_OPTIONS = MAT_SLIDE_TOGGLE_DEFAULT_OPTIONS;
    exports.MAT_SLIDE_TOGGLE_REQUIRED_VALIDATOR = MAT_SLIDE_TOGGLE_REQUIRED_VALIDATOR;
    exports.MAT_SLIDE_TOGGLE_VALUE_ACCESSOR = MAT_SLIDE_TOGGLE_VALUE_ACCESSOR;
    exports.MatSlideToggle = MatSlideToggle;
    exports.MatSlideToggleChange = MatSlideToggleChange;
    exports.MatSlideToggleModule = MatSlideToggleModule;
    exports.MatSlideToggleRequiredValidator = MatSlideToggleRequiredValidator;
    exports._MatSlideToggleRequiredValidatorModule = _MatSlideToggleRequiredValidatorModule;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=material-slide-toggle.umd.js.map
