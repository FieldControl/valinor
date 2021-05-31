(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/cdk/a11y'), require('@angular/cdk/coercion'), require('@angular/core'), require('@angular/forms'), require('@angular/material/core'), require('@angular/platform-browser/animations'), require('@angular/cdk/observers')) :
    typeof define === 'function' && define.amd ? define('@angular/material/checkbox', ['exports', '@angular/cdk/a11y', '@angular/cdk/coercion', '@angular/core', '@angular/forms', '@angular/material/core', '@angular/platform-browser/animations', '@angular/cdk/observers'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.ng = global.ng || {}, global.ng.material = global.ng.material || {}, global.ng.material.checkbox = {}), global.ng.cdk.a11y, global.ng.cdk.coercion, global.ng.core, global.ng.forms, global.ng.material.core, global.ng.platformBrowser.animations, global.ng.cdk.observers));
}(this, (function (exports, a11y, coercion, core, forms, core$1, animations, observers) { 'use strict';

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
    /** Injection token to be used to override the default options for `mat-checkbox`. */
    var MAT_CHECKBOX_DEFAULT_OPTIONS = new core.InjectionToken('mat-checkbox-default-options', {
        providedIn: 'root',
        factory: MAT_CHECKBOX_DEFAULT_OPTIONS_FACTORY
    });
    /** @docs-private */
    function MAT_CHECKBOX_DEFAULT_OPTIONS_FACTORY() {
        return {
            color: 'accent',
            clickAction: 'check-indeterminate',
        };
    }

    // Increasing integer for generating unique ids for checkbox components.
    var nextUniqueId = 0;
    // Default checkbox configuration.
    var defaults = MAT_CHECKBOX_DEFAULT_OPTIONS_FACTORY();
    /**
     * Provider Expression that allows mat-checkbox to register as a ControlValueAccessor.
     * This allows it to support [(ngModel)].
     * @docs-private
     */
    var MAT_CHECKBOX_CONTROL_VALUE_ACCESSOR = {
        provide: forms.NG_VALUE_ACCESSOR,
        useExisting: core.forwardRef(function () { return MatCheckbox; }),
        multi: true
    };
    /** Change event object emitted by MatCheckbox. */
    var MatCheckboxChange = /** @class */ (function () {
        function MatCheckboxChange() {
        }
        return MatCheckboxChange;
    }());
    // Boilerplate for applying mixins to MatCheckbox.
    /** @docs-private */
    var MatCheckboxBase = /** @class */ (function () {
        function MatCheckboxBase(_elementRef) {
            this._elementRef = _elementRef;
        }
        return MatCheckboxBase;
    }());
    var _MatCheckboxMixinBase = core$1.mixinTabIndex(core$1.mixinColor(core$1.mixinDisableRipple(core$1.mixinDisabled(MatCheckboxBase))));
    /**
     * A material design checkbox component. Supports all of the functionality of an HTML5 checkbox,
     * and exposes a similar API. A MatCheckbox can be either checked, unchecked, indeterminate, or
     * disabled. Note that all additional accessibility attributes are taken care of by the component,
     * so there is no need to provide them yourself. However, if you want to omit a label and still
     * have the checkbox be accessible, you may supply an [aria-label] input.
     * See: https://material.io/design/components/selection-controls.html
     */
    var MatCheckbox = /** @class */ (function (_super) {
        __extends(MatCheckbox, _super);
        function MatCheckbox(elementRef, _changeDetectorRef, _focusMonitor, _ngZone, tabIndex, _animationMode, _options) {
            var _this = _super.call(this, elementRef) || this;
            _this._changeDetectorRef = _changeDetectorRef;
            _this._focusMonitor = _focusMonitor;
            _this._ngZone = _ngZone;
            _this._animationMode = _animationMode;
            _this._options = _options;
            /**
             * Attached to the aria-label attribute of the host element. In most cases, aria-labelledby will
             * take precedence so this may be omitted.
             */
            _this.ariaLabel = '';
            /**
             * Users can specify the `aria-labelledby` attribute which will be forwarded to the input element
             */
            _this.ariaLabelledby = null;
            _this._uniqueId = "mat-checkbox-" + ++nextUniqueId;
            /** A unique id for the checkbox input. If none is supplied, it will be auto-generated. */
            _this.id = _this._uniqueId;
            /** Whether the label should appear after or before the checkbox. Defaults to 'after' */
            _this.labelPosition = 'after';
            /** Name value will be applied to the input element if present */
            _this.name = null;
            /** Event emitted when the checkbox's `checked` value changes. */
            _this.change = new core.EventEmitter();
            /** Event emitted when the checkbox's `indeterminate` value changes. */
            _this.indeterminateChange = new core.EventEmitter();
            /**
             * Called when the checkbox is blurred. Needed to properly implement ControlValueAccessor.
             * @docs-private
             */
            _this._onTouched = function () { };
            _this._currentAnimationClass = '';
            _this._currentCheckState = 0 /* Init */;
            _this._controlValueAccessorChangeFn = function () { };
            _this._checked = false;
            _this._disabled = false;
            _this._indeterminate = false;
            _this._options = _this._options || defaults;
            _this.color = _this.defaultColor = _this._options.color || defaults.color;
            _this.tabIndex = parseInt(tabIndex) || 0;
            return _this;
        }
        Object.defineProperty(MatCheckbox.prototype, "inputId", {
            /** Returns the unique id for the visual hidden input. */
            get: function () { return (this.id || this._uniqueId) + "-input"; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatCheckbox.prototype, "required", {
            /** Whether the checkbox is required. */
            get: function () { return this._required; },
            set: function (value) { this._required = coercion.coerceBooleanProperty(value); },
            enumerable: false,
            configurable: true
        });
        MatCheckbox.prototype.ngAfterViewInit = function () {
            var _this = this;
            this._focusMonitor.monitor(this._elementRef, true).subscribe(function (focusOrigin) {
                if (!focusOrigin) {
                    // When a focused element becomes disabled, the browser *immediately* fires a blur event.
                    // Angular does not expect events to be raised during change detection, so any state change
                    // (such as a form control's 'ng-touched') will cause a changed-after-checked error.
                    // See https://github.com/angular/angular/issues/17793. To work around this, we defer
                    // telling the form control it has been touched until the next tick.
                    Promise.resolve().then(function () {
                        _this._onTouched();
                        _this._changeDetectorRef.markForCheck();
                    });
                }
            });
            this._syncIndeterminate(this._indeterminate);
        };
        // TODO: Delete next major revision.
        MatCheckbox.prototype.ngAfterViewChecked = function () { };
        MatCheckbox.prototype.ngOnDestroy = function () {
            this._focusMonitor.stopMonitoring(this._elementRef);
        };
        Object.defineProperty(MatCheckbox.prototype, "checked", {
            /**
             * Whether the checkbox is checked.
             */
            get: function () { return this._checked; },
            set: function (value) {
                if (value != this.checked) {
                    this._checked = value;
                    this._changeDetectorRef.markForCheck();
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatCheckbox.prototype, "disabled", {
            /**
             * Whether the checkbox is disabled. This fully overrides the implementation provided by
             * mixinDisabled, but the mixin is still required because mixinTabIndex requires it.
             */
            get: function () { return this._disabled; },
            set: function (value) {
                var newValue = coercion.coerceBooleanProperty(value);
                if (newValue !== this.disabled) {
                    this._disabled = newValue;
                    this._changeDetectorRef.markForCheck();
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatCheckbox.prototype, "indeterminate", {
            /**
             * Whether the checkbox is indeterminate. This is also known as "mixed" mode and can be used to
             * represent a checkbox with three states, e.g. a checkbox that represents a nested list of
             * checkable items. Note that whenever checkbox is manually clicked, indeterminate is immediately
             * set to false.
             */
            get: function () { return this._indeterminate; },
            set: function (value) {
                var changed = value != this._indeterminate;
                this._indeterminate = coercion.coerceBooleanProperty(value);
                if (changed) {
                    if (this._indeterminate) {
                        this._transitionCheckState(3 /* Indeterminate */);
                    }
                    else {
                        this._transitionCheckState(this.checked ? 1 /* Checked */ : 2 /* Unchecked */);
                    }
                    this.indeterminateChange.emit(this._indeterminate);
                }
                this._syncIndeterminate(this._indeterminate);
            },
            enumerable: false,
            configurable: true
        });
        MatCheckbox.prototype._isRippleDisabled = function () {
            return this.disableRipple || this.disabled;
        };
        /** Method being called whenever the label text changes. */
        MatCheckbox.prototype._onLabelTextChange = function () {
            // Since the event of the `cdkObserveContent` directive runs outside of the zone, the checkbox
            // component will be only marked for check, but no actual change detection runs automatically.
            // Instead of going back into the zone in order to trigger a change detection which causes
            // *all* components to be checked (if explicitly marked or not using OnPush), we only trigger
            // an explicit change detection for the checkbox view and its children.
            this._changeDetectorRef.detectChanges();
        };
        // Implemented as part of ControlValueAccessor.
        MatCheckbox.prototype.writeValue = function (value) {
            this.checked = !!value;
        };
        // Implemented as part of ControlValueAccessor.
        MatCheckbox.prototype.registerOnChange = function (fn) {
            this._controlValueAccessorChangeFn = fn;
        };
        // Implemented as part of ControlValueAccessor.
        MatCheckbox.prototype.registerOnTouched = function (fn) {
            this._onTouched = fn;
        };
        // Implemented as part of ControlValueAccessor.
        MatCheckbox.prototype.setDisabledState = function (isDisabled) {
            this.disabled = isDisabled;
        };
        MatCheckbox.prototype._getAriaChecked = function () {
            if (this.checked) {
                return 'true';
            }
            return this.indeterminate ? 'mixed' : 'false';
        };
        MatCheckbox.prototype._transitionCheckState = function (newState) {
            var oldState = this._currentCheckState;
            var element = this._elementRef.nativeElement;
            if (oldState === newState) {
                return;
            }
            if (this._currentAnimationClass.length > 0) {
                element.classList.remove(this._currentAnimationClass);
            }
            this._currentAnimationClass = this._getAnimationClassForCheckStateTransition(oldState, newState);
            this._currentCheckState = newState;
            if (this._currentAnimationClass.length > 0) {
                element.classList.add(this._currentAnimationClass);
                // Remove the animation class to avoid animation when the checkbox is moved between containers
                var animationClass_1 = this._currentAnimationClass;
                this._ngZone.runOutsideAngular(function () {
                    setTimeout(function () {
                        element.classList.remove(animationClass_1);
                    }, 1000);
                });
            }
        };
        MatCheckbox.prototype._emitChangeEvent = function () {
            var event = new MatCheckboxChange();
            event.source = this;
            event.checked = this.checked;
            this._controlValueAccessorChangeFn(this.checked);
            this.change.emit(event);
            // Assigning the value again here is redundant, but we have to do it in case it was
            // changed inside the `change` listener which will cause the input to be out of sync.
            if (this._inputElement) {
                this._inputElement.nativeElement.checked = this.checked;
            }
        };
        /** Toggles the `checked` state of the checkbox. */
        MatCheckbox.prototype.toggle = function () {
            this.checked = !this.checked;
        };
        /**
         * Event handler for checkbox input element.
         * Toggles checked state if element is not disabled.
         * Do not toggle on (change) event since IE doesn't fire change event when
         *   indeterminate checkbox is clicked.
         * @param event
         */
        MatCheckbox.prototype._onInputClick = function (event) {
            var _this = this;
            var _a;
            var clickAction = (_a = this._options) === null || _a === void 0 ? void 0 : _a.clickAction;
            // We have to stop propagation for click events on the visual hidden input element.
            // By default, when a user clicks on a label element, a generated click event will be
            // dispatched on the associated input element. Since we are using a label element as our
            // root container, the click event on the `checkbox` will be executed twice.
            // The real click event will bubble up, and the generated click event also tries to bubble up.
            // This will lead to multiple click events.
            // Preventing bubbling for the second event will solve that issue.
            event.stopPropagation();
            // If resetIndeterminate is false, and the current state is indeterminate, do nothing on click
            if (!this.disabled && clickAction !== 'noop') {
                // When user manually click on the checkbox, `indeterminate` is set to false.
                if (this.indeterminate && clickAction !== 'check') {
                    Promise.resolve().then(function () {
                        _this._indeterminate = false;
                        _this.indeterminateChange.emit(_this._indeterminate);
                    });
                }
                this.toggle();
                this._transitionCheckState(this._checked ? 1 /* Checked */ : 2 /* Unchecked */);
                // Emit our custom change event if the native input emitted one.
                // It is important to only emit it, if the native input triggered one, because
                // we don't want to trigger a change event, when the `checked` variable changes for example.
                this._emitChangeEvent();
            }
            else if (!this.disabled && clickAction === 'noop') {
                // Reset native input when clicked with noop. The native checkbox becomes checked after
                // click, reset it to be align with `checked` value of `mat-checkbox`.
                this._inputElement.nativeElement.checked = this.checked;
                this._inputElement.nativeElement.indeterminate = this.indeterminate;
            }
        };
        /** Focuses the checkbox. */
        MatCheckbox.prototype.focus = function (origin, options) {
            if (origin) {
                this._focusMonitor.focusVia(this._inputElement, origin, options);
            }
            else {
                this._inputElement.nativeElement.focus(options);
            }
        };
        MatCheckbox.prototype._onInteractionEvent = function (event) {
            // We always have to stop propagation on the change event.
            // Otherwise the change event, from the input element, will bubble up and
            // emit its event object to the `change` output.
            event.stopPropagation();
        };
        MatCheckbox.prototype._getAnimationClassForCheckStateTransition = function (oldState, newState) {
            // Don't transition if animations are disabled.
            if (this._animationMode === 'NoopAnimations') {
                return '';
            }
            var animSuffix = '';
            switch (oldState) {
                case 0 /* Init */:
                    // Handle edge case where user interacts with checkbox that does not have [(ngModel)] or
                    // [checked] bound to it.
                    if (newState === 1 /* Checked */) {
                        animSuffix = 'unchecked-checked';
                    }
                    else if (newState == 3 /* Indeterminate */) {
                        animSuffix = 'unchecked-indeterminate';
                    }
                    else {
                        return '';
                    }
                    break;
                case 2 /* Unchecked */:
                    animSuffix = newState === 1 /* Checked */ ?
                        'unchecked-checked' : 'unchecked-indeterminate';
                    break;
                case 1 /* Checked */:
                    animSuffix = newState === 2 /* Unchecked */ ?
                        'checked-unchecked' : 'checked-indeterminate';
                    break;
                case 3 /* Indeterminate */:
                    animSuffix = newState === 1 /* Checked */ ?
                        'indeterminate-checked' : 'indeterminate-unchecked';
                    break;
            }
            return "mat-checkbox-anim-" + animSuffix;
        };
        /**
         * Syncs the indeterminate value with the checkbox DOM node.
         *
         * We sync `indeterminate` directly on the DOM node, because in Ivy the check for whether a
         * property is supported on an element boils down to `if (propName in element)`. Domino's
         * HTMLInputElement doesn't have an `indeterminate` property so Ivy will warn during
         * server-side rendering.
         */
        MatCheckbox.prototype._syncIndeterminate = function (value) {
            var nativeCheckbox = this._inputElement;
            if (nativeCheckbox) {
                nativeCheckbox.nativeElement.indeterminate = value;
            }
        };
        return MatCheckbox;
    }(_MatCheckboxMixinBase));
    MatCheckbox.decorators = [
        { type: core.Component, args: [{
                    selector: 'mat-checkbox',
                    template: "<label [attr.for]=\"inputId\" class=\"mat-checkbox-layout\" #label>\n  <span class=\"mat-checkbox-inner-container\"\n       [class.mat-checkbox-inner-container-no-side-margin]=\"!checkboxLabel.textContent || !checkboxLabel.textContent.trim()\">\n    <input #input\n           class=\"mat-checkbox-input cdk-visually-hidden\" type=\"checkbox\"\n           [id]=\"inputId\"\n           [required]=\"required\"\n           [checked]=\"checked\"\n           [attr.value]=\"value\"\n           [disabled]=\"disabled\"\n           [attr.name]=\"name\"\n           [tabIndex]=\"tabIndex\"\n           [attr.aria-label]=\"ariaLabel || null\"\n           [attr.aria-labelledby]=\"ariaLabelledby\"\n           [attr.aria-checked]=\"_getAriaChecked()\"\n           [attr.aria-describedby]=\"ariaDescribedby\"\n           (change)=\"_onInteractionEvent($event)\"\n           (click)=\"_onInputClick($event)\">\n    <span matRipple class=\"mat-checkbox-ripple mat-focus-indicator\"\n         [matRippleTrigger]=\"label\"\n         [matRippleDisabled]=\"_isRippleDisabled()\"\n         [matRippleRadius]=\"20\"\n         [matRippleCentered]=\"true\"\n         [matRippleAnimation]=\"{enterDuration: _animationMode === 'NoopAnimations' ? 0 : 150}\">\n      <span class=\"mat-ripple-element mat-checkbox-persistent-ripple\"></span>\n    </span>\n    <span class=\"mat-checkbox-frame\"></span>\n    <span class=\"mat-checkbox-background\">\n      <svg version=\"1.1\"\n           focusable=\"false\"\n           class=\"mat-checkbox-checkmark\"\n           viewBox=\"0 0 24 24\"\n           xml:space=\"preserve\">\n        <path class=\"mat-checkbox-checkmark-path\"\n              fill=\"none\"\n              stroke=\"white\"\n              d=\"M4.1,12.7 9,17.6 20.3,6.3\"/>\n      </svg>\n      <!-- Element for rendering the indeterminate state checkbox. -->\n      <span class=\"mat-checkbox-mixedmark\"></span>\n    </span>\n  </span>\n  <span class=\"mat-checkbox-label\" #checkboxLabel (cdkObserveContent)=\"_onLabelTextChange()\">\n    <!-- Add an invisible span so JAWS can read the label -->\n    <span style=\"display:none\">&nbsp;</span>\n    <ng-content></ng-content>\n  </span>\n</label>\n",
                    exportAs: 'matCheckbox',
                    host: {
                        'class': 'mat-checkbox',
                        '[id]': 'id',
                        '[attr.tabindex]': 'null',
                        '[class.mat-checkbox-indeterminate]': 'indeterminate',
                        '[class.mat-checkbox-checked]': 'checked',
                        '[class.mat-checkbox-disabled]': 'disabled',
                        '[class.mat-checkbox-label-before]': 'labelPosition == "before"',
                        '[class._mat-animation-noopable]': "_animationMode === 'NoopAnimations'",
                    },
                    providers: [MAT_CHECKBOX_CONTROL_VALUE_ACCESSOR],
                    inputs: ['disableRipple', 'color', 'tabIndex'],
                    encapsulation: core.ViewEncapsulation.None,
                    changeDetection: core.ChangeDetectionStrategy.OnPush,
                    styles: ["@keyframes mat-checkbox-fade-in-background{0%{opacity:0}50%{opacity:1}}@keyframes mat-checkbox-fade-out-background{0%,50%{opacity:1}100%{opacity:0}}@keyframes mat-checkbox-unchecked-checked-checkmark-path{0%,50%{stroke-dashoffset:22.910259}50%{animation-timing-function:cubic-bezier(0, 0, 0.2, 0.1)}100%{stroke-dashoffset:0}}@keyframes mat-checkbox-unchecked-indeterminate-mixedmark{0%,68.2%{transform:scaleX(0)}68.2%{animation-timing-function:cubic-bezier(0, 0, 0, 1)}100%{transform:scaleX(1)}}@keyframes mat-checkbox-checked-unchecked-checkmark-path{from{animation-timing-function:cubic-bezier(0.4, 0, 1, 1);stroke-dashoffset:0}to{stroke-dashoffset:-22.910259}}@keyframes mat-checkbox-checked-indeterminate-checkmark{from{animation-timing-function:cubic-bezier(0, 0, 0.2, 0.1);opacity:1;transform:rotate(0deg)}to{opacity:0;transform:rotate(45deg)}}@keyframes mat-checkbox-indeterminate-checked-checkmark{from{animation-timing-function:cubic-bezier(0.14, 0, 0, 1);opacity:0;transform:rotate(45deg)}to{opacity:1;transform:rotate(360deg)}}@keyframes mat-checkbox-checked-indeterminate-mixedmark{from{animation-timing-function:cubic-bezier(0, 0, 0.2, 0.1);opacity:0;transform:rotate(-45deg)}to{opacity:1;transform:rotate(0deg)}}@keyframes mat-checkbox-indeterminate-checked-mixedmark{from{animation-timing-function:cubic-bezier(0.14, 0, 0, 1);opacity:1;transform:rotate(0deg)}to{opacity:0;transform:rotate(315deg)}}@keyframes mat-checkbox-indeterminate-unchecked-mixedmark{0%{animation-timing-function:linear;opacity:1;transform:scaleX(1)}32.8%,100%{opacity:0;transform:scaleX(0)}}.mat-checkbox-background,.mat-checkbox-frame{top:0;left:0;right:0;bottom:0;position:absolute;border-radius:2px;box-sizing:border-box;pointer-events:none}.mat-checkbox{display:inline-block;transition:background 400ms cubic-bezier(0.25, 0.8, 0.25, 1),box-shadow 280ms cubic-bezier(0.4, 0, 0.2, 1);cursor:pointer;-webkit-tap-highlight-color:transparent}._mat-animation-noopable.mat-checkbox{transition:none;animation:none}.mat-checkbox .mat-ripple-element:not(.mat-checkbox-persistent-ripple){opacity:.16}.mat-checkbox .mat-checkbox-ripple{position:absolute;left:calc(50% - 20px);top:calc(50% - 20px);height:40px;width:40px;z-index:1;pointer-events:none}.cdk-high-contrast-active .mat-checkbox.cdk-keyboard-focused .mat-checkbox-ripple{outline:solid 3px}.mat-checkbox-layout{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;cursor:inherit;align-items:baseline;vertical-align:middle;display:inline-flex;white-space:nowrap}.mat-checkbox-label{-webkit-user-select:auto;-moz-user-select:auto;-ms-user-select:auto;user-select:auto}.mat-checkbox-inner-container{display:inline-block;height:16px;line-height:0;margin:auto;margin-right:8px;order:0;position:relative;vertical-align:middle;white-space:nowrap;width:16px;flex-shrink:0}[dir=rtl] .mat-checkbox-inner-container{margin-left:8px;margin-right:auto}.mat-checkbox-inner-container-no-side-margin{margin-left:0;margin-right:0}.mat-checkbox-frame{background-color:transparent;transition:border-color 90ms cubic-bezier(0, 0, 0.2, 0.1);border-width:2px;border-style:solid}._mat-animation-noopable .mat-checkbox-frame{transition:none}.mat-checkbox-background{align-items:center;display:inline-flex;justify-content:center;transition:background-color 90ms cubic-bezier(0, 0, 0.2, 0.1),opacity 90ms cubic-bezier(0, 0, 0.2, 0.1);-webkit-print-color-adjust:exact;color-adjust:exact}._mat-animation-noopable .mat-checkbox-background{transition:none}.cdk-high-contrast-active .mat-checkbox .mat-checkbox-background{background:none}.mat-checkbox-persistent-ripple{display:block;width:100%;height:100%;transform:none}.mat-checkbox-inner-container:hover .mat-checkbox-persistent-ripple{opacity:.04}.mat-checkbox.cdk-keyboard-focused .mat-checkbox-persistent-ripple{opacity:.12}.mat-checkbox-persistent-ripple,.mat-checkbox.mat-checkbox-disabled .mat-checkbox-inner-container:hover .mat-checkbox-persistent-ripple{opacity:0}@media(hover: none){.mat-checkbox-inner-container:hover .mat-checkbox-persistent-ripple{display:none}}.mat-checkbox-checkmark{top:0;left:0;right:0;bottom:0;position:absolute;width:100%}.mat-checkbox-checkmark-path{stroke-dashoffset:22.910259;stroke-dasharray:22.910259;stroke-width:2.1333333333px}.cdk-high-contrast-black-on-white .mat-checkbox-checkmark-path{stroke:#000 !important}.mat-checkbox-mixedmark{width:calc(100% - 6px);height:2px;opacity:0;transform:scaleX(0) rotate(0deg);border-radius:2px}.cdk-high-contrast-active .mat-checkbox-mixedmark{height:0;border-top:solid 2px;margin-top:2px}.mat-checkbox-label-before .mat-checkbox-inner-container{order:1;margin-left:8px;margin-right:auto}[dir=rtl] .mat-checkbox-label-before .mat-checkbox-inner-container{margin-left:auto;margin-right:8px}.mat-checkbox-checked .mat-checkbox-checkmark{opacity:1}.mat-checkbox-checked .mat-checkbox-checkmark-path{stroke-dashoffset:0}.mat-checkbox-checked .mat-checkbox-mixedmark{transform:scaleX(1) rotate(-45deg)}.mat-checkbox-indeterminate .mat-checkbox-checkmark{opacity:0;transform:rotate(45deg)}.mat-checkbox-indeterminate .mat-checkbox-checkmark-path{stroke-dashoffset:0}.mat-checkbox-indeterminate .mat-checkbox-mixedmark{opacity:1;transform:scaleX(1) rotate(0deg)}.mat-checkbox-unchecked .mat-checkbox-background{background-color:transparent}.mat-checkbox-disabled{cursor:default}.cdk-high-contrast-active .mat-checkbox-disabled{opacity:.5}.mat-checkbox-anim-unchecked-checked .mat-checkbox-background{animation:180ms linear 0ms mat-checkbox-fade-in-background}.mat-checkbox-anim-unchecked-checked .mat-checkbox-checkmark-path{animation:180ms linear 0ms mat-checkbox-unchecked-checked-checkmark-path}.mat-checkbox-anim-unchecked-indeterminate .mat-checkbox-background{animation:180ms linear 0ms mat-checkbox-fade-in-background}.mat-checkbox-anim-unchecked-indeterminate .mat-checkbox-mixedmark{animation:90ms linear 0ms mat-checkbox-unchecked-indeterminate-mixedmark}.mat-checkbox-anim-checked-unchecked .mat-checkbox-background{animation:180ms linear 0ms mat-checkbox-fade-out-background}.mat-checkbox-anim-checked-unchecked .mat-checkbox-checkmark-path{animation:90ms linear 0ms mat-checkbox-checked-unchecked-checkmark-path}.mat-checkbox-anim-checked-indeterminate .mat-checkbox-checkmark{animation:90ms linear 0ms mat-checkbox-checked-indeterminate-checkmark}.mat-checkbox-anim-checked-indeterminate .mat-checkbox-mixedmark{animation:90ms linear 0ms mat-checkbox-checked-indeterminate-mixedmark}.mat-checkbox-anim-indeterminate-checked .mat-checkbox-checkmark{animation:500ms linear 0ms mat-checkbox-indeterminate-checked-checkmark}.mat-checkbox-anim-indeterminate-checked .mat-checkbox-mixedmark{animation:500ms linear 0ms mat-checkbox-indeterminate-checked-mixedmark}.mat-checkbox-anim-indeterminate-unchecked .mat-checkbox-background{animation:180ms linear 0ms mat-checkbox-fade-out-background}.mat-checkbox-anim-indeterminate-unchecked .mat-checkbox-mixedmark{animation:300ms linear 0ms mat-checkbox-indeterminate-unchecked-mixedmark}.mat-checkbox-input{bottom:0;left:50%}\n"]
                },] }
    ];
    MatCheckbox.ctorParameters = function () { return [
        { type: core.ElementRef },
        { type: core.ChangeDetectorRef },
        { type: a11y.FocusMonitor },
        { type: core.NgZone },
        { type: String, decorators: [{ type: core.Attribute, args: ['tabindex',] }] },
        { type: String, decorators: [{ type: core.Optional }, { type: core.Inject, args: [animations.ANIMATION_MODULE_TYPE,] }] },
        { type: undefined, decorators: [{ type: core.Optional }, { type: core.Inject, args: [MAT_CHECKBOX_DEFAULT_OPTIONS,] }] }
    ]; };
    MatCheckbox.propDecorators = {
        ariaLabel: [{ type: core.Input, args: ['aria-label',] }],
        ariaLabelledby: [{ type: core.Input, args: ['aria-labelledby',] }],
        ariaDescribedby: [{ type: core.Input, args: ['aria-describedby',] }],
        id: [{ type: core.Input }],
        required: [{ type: core.Input }],
        labelPosition: [{ type: core.Input }],
        name: [{ type: core.Input }],
        change: [{ type: core.Output }],
        indeterminateChange: [{ type: core.Output }],
        value: [{ type: core.Input }],
        _inputElement: [{ type: core.ViewChild, args: ['input',] }],
        ripple: [{ type: core.ViewChild, args: [core$1.MatRipple,] }],
        checked: [{ type: core.Input }],
        disabled: [{ type: core.Input }],
        indeterminate: [{ type: core.Input }]
    };

    var MAT_CHECKBOX_REQUIRED_VALIDATOR = {
        provide: forms.NG_VALIDATORS,
        useExisting: core.forwardRef(function () { return MatCheckboxRequiredValidator; }),
        multi: true
    };
    /**
     * Validator for Material checkbox's required attribute in template-driven checkbox.
     * Current CheckboxRequiredValidator only work with `input type=checkbox` and does not
     * work with `mat-checkbox`.
     */
    var MatCheckboxRequiredValidator = /** @class */ (function (_super) {
        __extends(MatCheckboxRequiredValidator, _super);
        function MatCheckboxRequiredValidator() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return MatCheckboxRequiredValidator;
    }(forms.CheckboxRequiredValidator));
    MatCheckboxRequiredValidator.decorators = [
        { type: core.Directive, args: [{
                    selector: "mat-checkbox[required][formControlName],\n             mat-checkbox[required][formControl], mat-checkbox[required][ngModel]",
                    providers: [MAT_CHECKBOX_REQUIRED_VALIDATOR],
                },] }
    ];

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /** This module is used by both original and MDC-based checkbox implementations. */
    var _MatCheckboxRequiredValidatorModule = /** @class */ (function () {
        function _MatCheckboxRequiredValidatorModule() {
        }
        return _MatCheckboxRequiredValidatorModule;
    }());
    _MatCheckboxRequiredValidatorModule.decorators = [
        { type: core.NgModule, args: [{
                    exports: [MatCheckboxRequiredValidator],
                    declarations: [MatCheckboxRequiredValidator],
                },] }
    ];
    var MatCheckboxModule = /** @class */ (function () {
        function MatCheckboxModule() {
        }
        return MatCheckboxModule;
    }());
    MatCheckboxModule.decorators = [
        { type: core.NgModule, args: [{
                    imports: [
                        core$1.MatRippleModule, core$1.MatCommonModule, observers.ObserversModule,
                        _MatCheckboxRequiredValidatorModule
                    ],
                    exports: [MatCheckbox, core$1.MatCommonModule, _MatCheckboxRequiredValidatorModule],
                    declarations: [MatCheckbox],
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

    exports.MAT_CHECKBOX_CONTROL_VALUE_ACCESSOR = MAT_CHECKBOX_CONTROL_VALUE_ACCESSOR;
    exports.MAT_CHECKBOX_DEFAULT_OPTIONS = MAT_CHECKBOX_DEFAULT_OPTIONS;
    exports.MAT_CHECKBOX_DEFAULT_OPTIONS_FACTORY = MAT_CHECKBOX_DEFAULT_OPTIONS_FACTORY;
    exports.MAT_CHECKBOX_REQUIRED_VALIDATOR = MAT_CHECKBOX_REQUIRED_VALIDATOR;
    exports.MatCheckbox = MatCheckbox;
    exports.MatCheckboxChange = MatCheckboxChange;
    exports.MatCheckboxModule = MatCheckboxModule;
    exports.MatCheckboxRequiredValidator = MatCheckboxRequiredValidator;
    exports._MatCheckboxRequiredValidatorModule = _MatCheckboxRequiredValidatorModule;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=material-checkbox.umd.js.map
