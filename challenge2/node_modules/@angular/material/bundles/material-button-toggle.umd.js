(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/cdk/a11y'), require('@angular/cdk/coercion'), require('@angular/cdk/collections'), require('@angular/core'), require('@angular/forms'), require('@angular/material/core')) :
    typeof define === 'function' && define.amd ? define('@angular/material/button-toggle', ['exports', '@angular/cdk/a11y', '@angular/cdk/coercion', '@angular/cdk/collections', '@angular/core', '@angular/forms', '@angular/material/core'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.ng = global.ng || {}, global.ng.material = global.ng.material || {}, global.ng.material.buttonToggle = {}), global.ng.cdk.a11y, global.ng.cdk.coercion, global.ng.cdk.collections, global.ng.core, global.ng.forms, global.ng.material.core));
}(this, (function (exports, a11y, coercion, collections, core, forms, core$1) { 'use strict';

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
     * Injection token that can be used to configure the
     * default options for all button toggles within an app.
     */
    var MAT_BUTTON_TOGGLE_DEFAULT_OPTIONS = new core.InjectionToken('MAT_BUTTON_TOGGLE_DEFAULT_OPTIONS');
    /**
     * Injection token that can be used to reference instances of `MatButtonToggleGroup`.
     * It serves as alternative token to the actual `MatButtonToggleGroup` class which
     * could cause unnecessary retention of the class and its component metadata.
     */
    var MAT_BUTTON_TOGGLE_GROUP = new core.InjectionToken('MatButtonToggleGroup');
    /**
     * Provider Expression that allows mat-button-toggle-group to register as a ControlValueAccessor.
     * This allows it to support [(ngModel)].
     * @docs-private
     */
    var MAT_BUTTON_TOGGLE_GROUP_VALUE_ACCESSOR = {
        provide: forms.NG_VALUE_ACCESSOR,
        useExisting: core.forwardRef(function () { return MatButtonToggleGroup; }),
        multi: true
    };
    // Counter used to generate unique IDs.
    var uniqueIdCounter = 0;
    /** Change event object emitted by MatButtonToggle. */
    var MatButtonToggleChange = /** @class */ (function () {
        function MatButtonToggleChange(
        /** The MatButtonToggle that emits the event. */
        source, 
        /** The value assigned to the MatButtonToggle. */
        value) {
            this.source = source;
            this.value = value;
        }
        return MatButtonToggleChange;
    }());
    /** Exclusive selection button toggle group that behaves like a radio-button group. */
    var MatButtonToggleGroup = /** @class */ (function () {
        function MatButtonToggleGroup(_changeDetector, defaultOptions) {
            this._changeDetector = _changeDetector;
            this._vertical = false;
            this._multiple = false;
            this._disabled = false;
            /**
             * The method to be called in order to update ngModel.
             * Now `ngModel` binding is not supported in multiple selection mode.
             */
            this._controlValueAccessorChangeFn = function () { };
            /** onTouch function registered via registerOnTouch (ControlValueAccessor). */
            this._onTouched = function () { };
            this._name = "mat-button-toggle-group-" + uniqueIdCounter++;
            /**
             * Event that emits whenever the value of the group changes.
             * Used to facilitate two-way data binding.
             * @docs-private
             */
            this.valueChange = new core.EventEmitter();
            /** Event emitted when the group's value changes. */
            this.change = new core.EventEmitter();
            this.appearance =
                defaultOptions && defaultOptions.appearance ? defaultOptions.appearance : 'standard';
        }
        Object.defineProperty(MatButtonToggleGroup.prototype, "name", {
            /** `name` attribute for the underlying `input` element. */
            get: function () { return this._name; },
            set: function (value) {
                var _this = this;
                this._name = value;
                if (this._buttonToggles) {
                    this._buttonToggles.forEach(function (toggle) {
                        toggle.name = _this._name;
                        toggle._markForCheck();
                    });
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatButtonToggleGroup.prototype, "vertical", {
            /** Whether the toggle group is vertical. */
            get: function () { return this._vertical; },
            set: function (value) {
                this._vertical = coercion.coerceBooleanProperty(value);
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatButtonToggleGroup.prototype, "value", {
            /** Value of the toggle group. */
            get: function () {
                var selected = this._selectionModel ? this._selectionModel.selected : [];
                if (this.multiple) {
                    return selected.map(function (toggle) { return toggle.value; });
                }
                return selected[0] ? selected[0].value : undefined;
            },
            set: function (newValue) {
                this._setSelectionByValue(newValue);
                this.valueChange.emit(this.value);
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatButtonToggleGroup.prototype, "selected", {
            /** Selected button toggles in the group. */
            get: function () {
                var selected = this._selectionModel ? this._selectionModel.selected : [];
                return this.multiple ? selected : (selected[0] || null);
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatButtonToggleGroup.prototype, "multiple", {
            /** Whether multiple button toggles can be selected. */
            get: function () { return this._multiple; },
            set: function (value) {
                this._multiple = coercion.coerceBooleanProperty(value);
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatButtonToggleGroup.prototype, "disabled", {
            /** Whether multiple button toggle group is disabled. */
            get: function () { return this._disabled; },
            set: function (value) {
                this._disabled = coercion.coerceBooleanProperty(value);
                if (this._buttonToggles) {
                    this._buttonToggles.forEach(function (toggle) { return toggle._markForCheck(); });
                }
            },
            enumerable: false,
            configurable: true
        });
        MatButtonToggleGroup.prototype.ngOnInit = function () {
            this._selectionModel = new collections.SelectionModel(this.multiple, undefined, false);
        };
        MatButtonToggleGroup.prototype.ngAfterContentInit = function () {
            var _a;
            (_a = this._selectionModel).select.apply(_a, __spreadArray([], __read(this._buttonToggles.filter(function (toggle) { return toggle.checked; }))));
        };
        /**
         * Sets the model value. Implemented as part of ControlValueAccessor.
         * @param value Value to be set to the model.
         */
        MatButtonToggleGroup.prototype.writeValue = function (value) {
            this.value = value;
            this._changeDetector.markForCheck();
        };
        // Implemented as part of ControlValueAccessor.
        MatButtonToggleGroup.prototype.registerOnChange = function (fn) {
            this._controlValueAccessorChangeFn = fn;
        };
        // Implemented as part of ControlValueAccessor.
        MatButtonToggleGroup.prototype.registerOnTouched = function (fn) {
            this._onTouched = fn;
        };
        // Implemented as part of ControlValueAccessor.
        MatButtonToggleGroup.prototype.setDisabledState = function (isDisabled) {
            this.disabled = isDisabled;
        };
        /** Dispatch change event with current selection and group value. */
        MatButtonToggleGroup.prototype._emitChangeEvent = function () {
            var selected = this.selected;
            var source = Array.isArray(selected) ? selected[selected.length - 1] : selected;
            var event = new MatButtonToggleChange(source, this.value);
            this._controlValueAccessorChangeFn(event.value);
            this.change.emit(event);
        };
        /**
         * Syncs a button toggle's selected state with the model value.
         * @param toggle Toggle to be synced.
         * @param select Whether the toggle should be selected.
         * @param isUserInput Whether the change was a result of a user interaction.
         * @param deferEvents Whether to defer emitting the change events.
         */
        MatButtonToggleGroup.prototype._syncButtonToggle = function (toggle, select, isUserInput, deferEvents) {
            var _this = this;
            if (isUserInput === void 0) { isUserInput = false; }
            if (deferEvents === void 0) { deferEvents = false; }
            // Deselect the currently-selected toggle, if we're in single-selection
            // mode and the button being toggled isn't selected at the moment.
            if (!this.multiple && this.selected && !toggle.checked) {
                this.selected.checked = false;
            }
            if (this._selectionModel) {
                if (select) {
                    this._selectionModel.select(toggle);
                }
                else {
                    this._selectionModel.deselect(toggle);
                }
            }
            else {
                deferEvents = true;
            }
            // We need to defer in some cases in order to avoid "changed after checked errors", however
            // the side-effect is that we may end up updating the model value out of sequence in others
            // The `deferEvents` flag allows us to decide whether to do it on a case-by-case basis.
            if (deferEvents) {
                Promise.resolve().then(function () { return _this._updateModelValue(isUserInput); });
            }
            else {
                this._updateModelValue(isUserInput);
            }
        };
        /** Checks whether a button toggle is selected. */
        MatButtonToggleGroup.prototype._isSelected = function (toggle) {
            return this._selectionModel && this._selectionModel.isSelected(toggle);
        };
        /** Determines whether a button toggle should be checked on init. */
        MatButtonToggleGroup.prototype._isPrechecked = function (toggle) {
            if (typeof this._rawValue === 'undefined') {
                return false;
            }
            if (this.multiple && Array.isArray(this._rawValue)) {
                return this._rawValue.some(function (value) { return toggle.value != null && value === toggle.value; });
            }
            return toggle.value === this._rawValue;
        };
        /** Updates the selection state of the toggles in the group based on a value. */
        MatButtonToggleGroup.prototype._setSelectionByValue = function (value) {
            var _this = this;
            this._rawValue = value;
            if (!this._buttonToggles) {
                return;
            }
            if (this.multiple && value) {
                if (!Array.isArray(value) && (typeof ngDevMode === 'undefined' || ngDevMode)) {
                    throw Error('Value must be an array in multiple-selection mode.');
                }
                this._clearSelection();
                value.forEach(function (currentValue) { return _this._selectValue(currentValue); });
            }
            else {
                this._clearSelection();
                this._selectValue(value);
            }
        };
        /** Clears the selected toggles. */
        MatButtonToggleGroup.prototype._clearSelection = function () {
            this._selectionModel.clear();
            this._buttonToggles.forEach(function (toggle) { return toggle.checked = false; });
        };
        /** Selects a value if there's a toggle that corresponds to it. */
        MatButtonToggleGroup.prototype._selectValue = function (value) {
            var correspondingOption = this._buttonToggles.find(function (toggle) {
                return toggle.value != null && toggle.value === value;
            });
            if (correspondingOption) {
                correspondingOption.checked = true;
                this._selectionModel.select(correspondingOption);
            }
        };
        /** Syncs up the group's value with the model and emits the change event. */
        MatButtonToggleGroup.prototype._updateModelValue = function (isUserInput) {
            // Only emit the change event for user input.
            if (isUserInput) {
                this._emitChangeEvent();
            }
            // Note: we emit this one no matter whether it was a user interaction, because
            // it is used by Angular to sync up the two-way data binding.
            this.valueChange.emit(this.value);
        };
        return MatButtonToggleGroup;
    }());
    MatButtonToggleGroup.decorators = [
        { type: core.Directive, args: [{
                    selector: 'mat-button-toggle-group',
                    providers: [
                        MAT_BUTTON_TOGGLE_GROUP_VALUE_ACCESSOR,
                        { provide: MAT_BUTTON_TOGGLE_GROUP, useExisting: MatButtonToggleGroup },
                    ],
                    host: {
                        'role': 'group',
                        'class': 'mat-button-toggle-group',
                        '[attr.aria-disabled]': 'disabled',
                        '[class.mat-button-toggle-vertical]': 'vertical',
                        '[class.mat-button-toggle-group-appearance-standard]': 'appearance === "standard"',
                    },
                    exportAs: 'matButtonToggleGroup',
                },] }
    ];
    MatButtonToggleGroup.ctorParameters = function () { return [
        { type: core.ChangeDetectorRef },
        { type: undefined, decorators: [{ type: core.Optional }, { type: core.Inject, args: [MAT_BUTTON_TOGGLE_DEFAULT_OPTIONS,] }] }
    ]; };
    MatButtonToggleGroup.propDecorators = {
        _buttonToggles: [{ type: core.ContentChildren, args: [core.forwardRef(function () { return MatButtonToggle; }), {
                        // Note that this would technically pick up toggles
                        // from nested groups, but that's not a case that we support.
                        descendants: true
                    },] }],
        appearance: [{ type: core.Input }],
        name: [{ type: core.Input }],
        vertical: [{ type: core.Input }],
        value: [{ type: core.Input }],
        valueChange: [{ type: core.Output }],
        multiple: [{ type: core.Input }],
        disabled: [{ type: core.Input }],
        change: [{ type: core.Output }]
    };
    // Boilerplate for applying mixins to the MatButtonToggle class.
    /** @docs-private */
    var MatButtonToggleBase = /** @class */ (function () {
        function MatButtonToggleBase() {
        }
        return MatButtonToggleBase;
    }());
    var _MatButtonToggleMixinBase = core$1.mixinDisableRipple(MatButtonToggleBase);
    /** Single button inside of a toggle group. */
    var MatButtonToggle = /** @class */ (function (_super) {
        __extends(MatButtonToggle, _super);
        function MatButtonToggle(toggleGroup, _changeDetectorRef, _elementRef, _focusMonitor, defaultTabIndex, defaultOptions) {
            var _this = _super.call(this) || this;
            _this._changeDetectorRef = _changeDetectorRef;
            _this._elementRef = _elementRef;
            _this._focusMonitor = _focusMonitor;
            _this._isSingleSelector = false;
            _this._checked = false;
            /**
             * Users can specify the `aria-labelledby` attribute which will be forwarded to the input element
             */
            _this.ariaLabelledby = null;
            _this._disabled = false;
            /** Event emitted when the group value changes. */
            _this.change = new core.EventEmitter();
            var parsedTabIndex = Number(defaultTabIndex);
            _this.tabIndex = (parsedTabIndex || parsedTabIndex === 0) ? parsedTabIndex : null;
            _this.buttonToggleGroup = toggleGroup;
            _this.appearance =
                defaultOptions && defaultOptions.appearance ? defaultOptions.appearance : 'standard';
            return _this;
        }
        Object.defineProperty(MatButtonToggle.prototype, "buttonId", {
            /** Unique ID for the underlying `button` element. */
            get: function () { return this.id + "-button"; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatButtonToggle.prototype, "appearance", {
            /** The appearance style of the button. */
            get: function () {
                return this.buttonToggleGroup ? this.buttonToggleGroup.appearance : this._appearance;
            },
            set: function (value) {
                this._appearance = value;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatButtonToggle.prototype, "checked", {
            /** Whether the button is checked. */
            get: function () {
                return this.buttonToggleGroup ? this.buttonToggleGroup._isSelected(this) : this._checked;
            },
            set: function (value) {
                var newValue = coercion.coerceBooleanProperty(value);
                if (newValue !== this._checked) {
                    this._checked = newValue;
                    if (this.buttonToggleGroup) {
                        this.buttonToggleGroup._syncButtonToggle(this, this._checked);
                    }
                    this._changeDetectorRef.markForCheck();
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatButtonToggle.prototype, "disabled", {
            /** Whether the button is disabled. */
            get: function () {
                return this._disabled || (this.buttonToggleGroup && this.buttonToggleGroup.disabled);
            },
            set: function (value) { this._disabled = coercion.coerceBooleanProperty(value); },
            enumerable: false,
            configurable: true
        });
        MatButtonToggle.prototype.ngOnInit = function () {
            var group = this.buttonToggleGroup;
            this._isSingleSelector = group && !group.multiple;
            this.id = this.id || "mat-button-toggle-" + uniqueIdCounter++;
            if (this._isSingleSelector) {
                this.name = group.name;
            }
            if (group) {
                if (group._isPrechecked(this)) {
                    this.checked = true;
                }
                else if (group._isSelected(this) !== this._checked) {
                    // As as side effect of the circular dependency between the toggle group and the button,
                    // we may end up in a state where the button is supposed to be checked on init, but it
                    // isn't, because the checked value was assigned too early. This can happen when Ivy
                    // assigns the static input value before the `ngOnInit` has run.
                    group._syncButtonToggle(this, this._checked);
                }
            }
        };
        MatButtonToggle.prototype.ngAfterViewInit = function () {
            this._focusMonitor.monitor(this._elementRef, true);
        };
        MatButtonToggle.prototype.ngOnDestroy = function () {
            var group = this.buttonToggleGroup;
            this._focusMonitor.stopMonitoring(this._elementRef);
            // Remove the toggle from the selection once it's destroyed. Needs to happen
            // on the next tick in order to avoid "changed after checked" errors.
            if (group && group._isSelected(this)) {
                group._syncButtonToggle(this, false, false, true);
            }
        };
        /** Focuses the button. */
        MatButtonToggle.prototype.focus = function (options) {
            this._buttonElement.nativeElement.focus(options);
        };
        /** Checks the button toggle due to an interaction with the underlying native button. */
        MatButtonToggle.prototype._onButtonClick = function () {
            var newChecked = this._isSingleSelector ? true : !this._checked;
            if (newChecked !== this._checked) {
                this._checked = newChecked;
                if (this.buttonToggleGroup) {
                    this.buttonToggleGroup._syncButtonToggle(this, this._checked, true);
                    this.buttonToggleGroup._onTouched();
                }
            }
            // Emit a change event when it's the single selector
            this.change.emit(new MatButtonToggleChange(this, this.value));
        };
        /**
         * Marks the button toggle as needing checking for change detection.
         * This method is exposed because the parent button toggle group will directly
         * update bound properties of the radio button.
         */
        MatButtonToggle.prototype._markForCheck = function () {
            // When the group value changes, the button will not be notified.
            // Use `markForCheck` to explicit update button toggle's status.
            this._changeDetectorRef.markForCheck();
        };
        return MatButtonToggle;
    }(_MatButtonToggleMixinBase));
    MatButtonToggle.decorators = [
        { type: core.Component, args: [{
                    selector: 'mat-button-toggle',
                    template: "<button #button class=\"mat-button-toggle-button mat-focus-indicator\"\n        type=\"button\"\n        [id]=\"buttonId\"\n        [attr.tabindex]=\"disabled ? -1 : tabIndex\"\n        [attr.aria-pressed]=\"checked\"\n        [disabled]=\"disabled || null\"\n        [attr.name]=\"name || null\"\n        [attr.aria-label]=\"ariaLabel\"\n        [attr.aria-labelledby]=\"ariaLabelledby\"\n        (click)=\"_onButtonClick()\">\n  <span class=\"mat-button-toggle-label-content\">\n    <ng-content></ng-content>\n  </span>\n</button>\n\n<span class=\"mat-button-toggle-focus-overlay\"></span>\n<span class=\"mat-button-toggle-ripple\" matRipple\n     [matRippleTrigger]=\"button\"\n     [matRippleDisabled]=\"this.disableRipple || this.disabled\">\n</span>\n",
                    encapsulation: core.ViewEncapsulation.None,
                    exportAs: 'matButtonToggle',
                    changeDetection: core.ChangeDetectionStrategy.OnPush,
                    inputs: ['disableRipple'],
                    host: {
                        '[class.mat-button-toggle-standalone]': '!buttonToggleGroup',
                        '[class.mat-button-toggle-checked]': 'checked',
                        '[class.mat-button-toggle-disabled]': 'disabled',
                        '[class.mat-button-toggle-appearance-standard]': 'appearance === "standard"',
                        'class': 'mat-button-toggle',
                        '[attr.aria-label]': 'null',
                        '[attr.aria-labelledby]': 'null',
                        '[attr.id]': 'id',
                        '[attr.name]': 'null',
                        '(focus)': 'focus()',
                        'role': 'presentation',
                    },
                    styles: [".mat-button-toggle-standalone,.mat-button-toggle-group{position:relative;display:inline-flex;flex-direction:row;white-space:nowrap;overflow:hidden;border-radius:2px;-webkit-tap-highlight-color:transparent}.cdk-high-contrast-active .mat-button-toggle-standalone,.cdk-high-contrast-active .mat-button-toggle-group{outline:solid 1px}.mat-button-toggle-standalone.mat-button-toggle-appearance-standard,.mat-button-toggle-group-appearance-standard{border-radius:4px}.cdk-high-contrast-active .mat-button-toggle-standalone.mat-button-toggle-appearance-standard,.cdk-high-contrast-active .mat-button-toggle-group-appearance-standard{outline:0}.mat-button-toggle-vertical{flex-direction:column}.mat-button-toggle-vertical .mat-button-toggle-label-content{display:block}.mat-button-toggle{white-space:nowrap;position:relative}.mat-button-toggle .mat-icon svg{vertical-align:top}.mat-button-toggle.cdk-keyboard-focused .mat-button-toggle-focus-overlay{opacity:1}.cdk-high-contrast-active .mat-button-toggle.cdk-keyboard-focused .mat-button-toggle-focus-overlay{opacity:.5}.mat-button-toggle-appearance-standard:not(.mat-button-toggle-disabled):hover .mat-button-toggle-focus-overlay{opacity:.04}.mat-button-toggle-appearance-standard.cdk-keyboard-focused:not(.mat-button-toggle-disabled) .mat-button-toggle-focus-overlay{opacity:.12}.cdk-high-contrast-active .mat-button-toggle-appearance-standard.cdk-keyboard-focused:not(.mat-button-toggle-disabled) .mat-button-toggle-focus-overlay{opacity:.5}@media(hover: none){.mat-button-toggle-appearance-standard:not(.mat-button-toggle-disabled):hover .mat-button-toggle-focus-overlay{display:none}}.mat-button-toggle-label-content{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;display:inline-block;line-height:36px;padding:0 16px;position:relative}.mat-button-toggle-appearance-standard .mat-button-toggle-label-content{padding:0 12px}.mat-button-toggle-label-content>*{vertical-align:middle}.mat-button-toggle-focus-overlay{border-radius:inherit;pointer-events:none;opacity:0;top:0;left:0;right:0;bottom:0;position:absolute}.mat-button-toggle-checked .mat-button-toggle-focus-overlay{border-bottom:solid 36px}.cdk-high-contrast-active .mat-button-toggle-checked .mat-button-toggle-focus-overlay{opacity:.5;height:0}.cdk-high-contrast-active .mat-button-toggle-checked.mat-button-toggle-appearance-standard .mat-button-toggle-focus-overlay{border-bottom:solid 500px}.mat-button-toggle .mat-button-toggle-ripple{top:0;left:0;right:0;bottom:0;position:absolute;pointer-events:none}.mat-button-toggle-button{border:0;background:none;color:inherit;padding:0;margin:0;font:inherit;outline:none;width:100%;cursor:pointer}.mat-button-toggle-disabled .mat-button-toggle-button{cursor:default}.mat-button-toggle-button::-moz-focus-inner{border:0}\n"]
                },] }
    ];
    MatButtonToggle.ctorParameters = function () { return [
        { type: MatButtonToggleGroup, decorators: [{ type: core.Optional }, { type: core.Inject, args: [MAT_BUTTON_TOGGLE_GROUP,] }] },
        { type: core.ChangeDetectorRef },
        { type: core.ElementRef },
        { type: a11y.FocusMonitor },
        { type: String, decorators: [{ type: core.Attribute, args: ['tabindex',] }] },
        { type: undefined, decorators: [{ type: core.Optional }, { type: core.Inject, args: [MAT_BUTTON_TOGGLE_DEFAULT_OPTIONS,] }] }
    ]; };
    MatButtonToggle.propDecorators = {
        ariaLabel: [{ type: core.Input, args: ['aria-label',] }],
        ariaLabelledby: [{ type: core.Input, args: ['aria-labelledby',] }],
        _buttonElement: [{ type: core.ViewChild, args: ['button',] }],
        id: [{ type: core.Input }],
        name: [{ type: core.Input }],
        value: [{ type: core.Input }],
        tabIndex: [{ type: core.Input }],
        appearance: [{ type: core.Input }],
        checked: [{ type: core.Input }],
        disabled: [{ type: core.Input }],
        change: [{ type: core.Output }]
    };

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var MatButtonToggleModule = /** @class */ (function () {
        function MatButtonToggleModule() {
        }
        return MatButtonToggleModule;
    }());
    MatButtonToggleModule.decorators = [
        { type: core.NgModule, args: [{
                    imports: [core$1.MatCommonModule, core$1.MatRippleModule],
                    exports: [core$1.MatCommonModule, MatButtonToggleGroup, MatButtonToggle],
                    declarations: [MatButtonToggleGroup, MatButtonToggle],
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

    exports.MAT_BUTTON_TOGGLE_DEFAULT_OPTIONS = MAT_BUTTON_TOGGLE_DEFAULT_OPTIONS;
    exports.MAT_BUTTON_TOGGLE_GROUP = MAT_BUTTON_TOGGLE_GROUP;
    exports.MAT_BUTTON_TOGGLE_GROUP_VALUE_ACCESSOR = MAT_BUTTON_TOGGLE_GROUP_VALUE_ACCESSOR;
    exports.MatButtonToggle = MatButtonToggle;
    exports.MatButtonToggleChange = MatButtonToggleChange;
    exports.MatButtonToggleGroup = MatButtonToggleGroup;
    exports.MatButtonToggleModule = MatButtonToggleModule;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=material-button-toggle.umd.js.map
