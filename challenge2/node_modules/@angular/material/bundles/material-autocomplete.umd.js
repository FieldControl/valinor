(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/cdk/a11y'), require('@angular/cdk/coercion'), require('@angular/cdk/platform'), require('@angular/core'), require('@angular/material/core'), require('rxjs'), require('@angular/common'), require('@angular/cdk/overlay'), require('@angular/cdk/scrolling'), require('@angular/cdk/bidi'), require('@angular/cdk/keycodes'), require('@angular/cdk/portal'), require('@angular/forms'), require('@angular/material/form-field'), require('rxjs/operators')) :
    typeof define === 'function' && define.amd ? define('@angular/material/autocomplete', ['exports', '@angular/cdk/a11y', '@angular/cdk/coercion', '@angular/cdk/platform', '@angular/core', '@angular/material/core', 'rxjs', '@angular/common', '@angular/cdk/overlay', '@angular/cdk/scrolling', '@angular/cdk/bidi', '@angular/cdk/keycodes', '@angular/cdk/portal', '@angular/forms', '@angular/material/form-field', 'rxjs/operators'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.ng = global.ng || {}, global.ng.material = global.ng.material || {}, global.ng.material.autocomplete = {}), global.ng.cdk.a11y, global.ng.cdk.coercion, global.ng.cdk.platform, global.ng.core, global.ng.material.core, global.rxjs, global.ng.common, global.ng.cdk.overlay, global.ng.cdk.scrolling, global.ng.cdk.bidi, global.ng.cdk.keycodes, global.ng.cdk.portal, global.ng.forms, global.ng.material.formField, global.rxjs.operators));
}(this, (function (exports, a11y, coercion, platform, core$1, core, rxjs, common, overlay, scrolling, bidi, keycodes, portal, forms, formField, operators) { 'use strict';

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
     * Autocomplete IDs need to be unique across components, so this counter exists outside of
     * the component definition.
     */
    var _uniqueAutocompleteIdCounter = 0;
    /** Event object that is emitted when an autocomplete option is selected. */
    var MatAutocompleteSelectedEvent = /** @class */ (function () {
        function MatAutocompleteSelectedEvent(
        /** Reference to the autocomplete panel that emitted the event. */
        source, 
        /** Option that was selected. */
        option) {
            this.source = source;
            this.option = option;
        }
        return MatAutocompleteSelectedEvent;
    }());
    // Boilerplate for applying mixins to MatAutocomplete.
    /** @docs-private */
    var MatAutocompleteBase = /** @class */ (function () {
        function MatAutocompleteBase() {
        }
        return MatAutocompleteBase;
    }());
    var _MatAutocompleteMixinBase = core.mixinDisableRipple(MatAutocompleteBase);
    /** Injection token to be used to override the default options for `mat-autocomplete`. */
    var MAT_AUTOCOMPLETE_DEFAULT_OPTIONS = new core$1.InjectionToken('mat-autocomplete-default-options', {
        providedIn: 'root',
        factory: MAT_AUTOCOMPLETE_DEFAULT_OPTIONS_FACTORY,
    });
    /** @docs-private */
    function MAT_AUTOCOMPLETE_DEFAULT_OPTIONS_FACTORY() {
        return { autoActiveFirstOption: false };
    }
    /** Base class with all of the `MatAutocomplete` functionality. */
    var _MatAutocompleteBase = /** @class */ (function (_super) {
        __extends(_MatAutocompleteBase, _super);
        function _MatAutocompleteBase(_changeDetectorRef, _elementRef, defaults, platform) {
            var _this = _super.call(this) || this;
            _this._changeDetectorRef = _changeDetectorRef;
            _this._elementRef = _elementRef;
            _this._activeOptionChanges = rxjs.Subscription.EMPTY;
            /** Whether the autocomplete panel should be visible, depending on option length. */
            _this.showPanel = false;
            _this._isOpen = false;
            /** Function that maps an option's control value to its display value in the trigger. */
            _this.displayWith = null;
            /** Event that is emitted whenever an option from the list is selected. */
            _this.optionSelected = new core$1.EventEmitter();
            /** Event that is emitted when the autocomplete panel is opened. */
            _this.opened = new core$1.EventEmitter();
            /** Event that is emitted when the autocomplete panel is closed. */
            _this.closed = new core$1.EventEmitter();
            /** Emits whenever an option is activated using the keyboard. */
            _this.optionActivated = new core$1.EventEmitter();
            _this._classList = {};
            /** Unique ID to be used by autocomplete trigger's "aria-owns" property. */
            _this.id = "mat-autocomplete-" + _uniqueAutocompleteIdCounter++;
            // TODO(crisbeto): the problem that the `inertGroups` option resolves is only present on
            // Safari using VoiceOver. We should occasionally check back to see whether the bug
            // wasn't resolved in VoiceOver, and if it has, we can remove this and the `inertGroups`
            // option altogether.
            _this.inertGroups = (platform === null || platform === void 0 ? void 0 : platform.SAFARI) || false;
            _this._autoActiveFirstOption = !!defaults.autoActiveFirstOption;
            return _this;
        }
        Object.defineProperty(_MatAutocompleteBase.prototype, "isOpen", {
            /** Whether the autocomplete panel is open. */
            get: function () { return this._isOpen && this.showPanel; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(_MatAutocompleteBase.prototype, "autoActiveFirstOption", {
            /**
             * Whether the first option should be highlighted when the autocomplete panel is opened.
             * Can be configured globally through the `MAT_AUTOCOMPLETE_DEFAULT_OPTIONS` token.
             */
            get: function () { return this._autoActiveFirstOption; },
            set: function (value) {
                this._autoActiveFirstOption = coercion.coerceBooleanProperty(value);
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(_MatAutocompleteBase.prototype, "classList", {
            /**
             * Takes classes set on the host mat-autocomplete element and applies them to the panel
             * inside the overlay container to allow for easy styling.
             */
            set: function (value) {
                if (value && value.length) {
                    this._classList = coercion.coerceStringArray(value).reduce(function (classList, className) {
                        classList[className] = true;
                        return classList;
                    }, {});
                }
                else {
                    this._classList = {};
                }
                this._setVisibilityClasses(this._classList);
                this._elementRef.nativeElement.className = '';
            },
            enumerable: false,
            configurable: true
        });
        _MatAutocompleteBase.prototype.ngAfterContentInit = function () {
            var _this = this;
            this._keyManager = new a11y.ActiveDescendantKeyManager(this.options).withWrap();
            this._activeOptionChanges = this._keyManager.change.subscribe(function (index) {
                _this.optionActivated.emit({ source: _this, option: _this.options.toArray()[index] || null });
            });
            // Set the initial visibility state.
            this._setVisibility();
        };
        _MatAutocompleteBase.prototype.ngOnDestroy = function () {
            this._activeOptionChanges.unsubscribe();
        };
        /**
         * Sets the panel scrollTop. This allows us to manually scroll to display options
         * above or below the fold, as they are not actually being focused when active.
         */
        _MatAutocompleteBase.prototype._setScrollTop = function (scrollTop) {
            if (this.panel) {
                this.panel.nativeElement.scrollTop = scrollTop;
            }
        };
        /** Returns the panel's scrollTop. */
        _MatAutocompleteBase.prototype._getScrollTop = function () {
            return this.panel ? this.panel.nativeElement.scrollTop : 0;
        };
        /** Panel should hide itself when the option list is empty. */
        _MatAutocompleteBase.prototype._setVisibility = function () {
            this.showPanel = !!this.options.length;
            this._setVisibilityClasses(this._classList);
            this._changeDetectorRef.markForCheck();
        };
        /** Emits the `select` event. */
        _MatAutocompleteBase.prototype._emitSelectEvent = function (option) {
            var event = new MatAutocompleteSelectedEvent(this, option);
            this.optionSelected.emit(event);
        };
        /** Gets the aria-labelledby for the autocomplete panel. */
        _MatAutocompleteBase.prototype._getPanelAriaLabelledby = function (labelId) {
            if (this.ariaLabel) {
                return null;
            }
            var labelExpression = labelId ? labelId + ' ' : '';
            return this.ariaLabelledby ? labelExpression + this.ariaLabelledby : labelId;
        };
        /** Sets the autocomplete visibility classes on a classlist based on the panel is visible. */
        _MatAutocompleteBase.prototype._setVisibilityClasses = function (classList) {
            classList[this._visibleClass] = this.showPanel;
            classList[this._hiddenClass] = !this.showPanel;
        };
        return _MatAutocompleteBase;
    }(_MatAutocompleteMixinBase));
    _MatAutocompleteBase.decorators = [
        { type: core$1.Directive }
    ];
    _MatAutocompleteBase.ctorParameters = function () { return [
        { type: core$1.ChangeDetectorRef },
        { type: core$1.ElementRef },
        { type: undefined, decorators: [{ type: core$1.Inject, args: [MAT_AUTOCOMPLETE_DEFAULT_OPTIONS,] }] },
        { type: platform.Platform }
    ]; };
    _MatAutocompleteBase.propDecorators = {
        template: [{ type: core$1.ViewChild, args: [core$1.TemplateRef, { static: true },] }],
        panel: [{ type: core$1.ViewChild, args: ['panel',] }],
        ariaLabel: [{ type: core$1.Input, args: ['aria-label',] }],
        ariaLabelledby: [{ type: core$1.Input, args: ['aria-labelledby',] }],
        displayWith: [{ type: core$1.Input }],
        autoActiveFirstOption: [{ type: core$1.Input }],
        panelWidth: [{ type: core$1.Input }],
        optionSelected: [{ type: core$1.Output }],
        opened: [{ type: core$1.Output }],
        closed: [{ type: core$1.Output }],
        optionActivated: [{ type: core$1.Output }],
        classList: [{ type: core$1.Input, args: ['class',] }]
    };
    var MatAutocomplete = /** @class */ (function (_super) {
        __extends(MatAutocomplete, _super);
        function MatAutocomplete() {
            var _this = _super.apply(this, __spreadArray([], __read(arguments))) || this;
            _this._visibleClass = 'mat-autocomplete-visible';
            _this._hiddenClass = 'mat-autocomplete-hidden';
            return _this;
        }
        return MatAutocomplete;
    }(_MatAutocompleteBase));
    MatAutocomplete.decorators = [
        { type: core$1.Component, args: [{
                    selector: 'mat-autocomplete',
                    template: "<ng-template let-formFieldId=\"id\">\n  <div class=\"mat-autocomplete-panel\"\n       role=\"listbox\"\n       [id]=\"id\"\n       [attr.aria-label]=\"ariaLabel || null\"\n       [attr.aria-labelledby]=\"_getPanelAriaLabelledby(formFieldId)\"\n       [ngClass]=\"_classList\"\n       #panel>\n    <ng-content></ng-content>\n  </div>\n</ng-template>\n",
                    encapsulation: core$1.ViewEncapsulation.None,
                    changeDetection: core$1.ChangeDetectionStrategy.OnPush,
                    exportAs: 'matAutocomplete',
                    inputs: ['disableRipple'],
                    host: {
                        'class': 'mat-autocomplete'
                    },
                    providers: [
                        { provide: core.MAT_OPTION_PARENT_COMPONENT, useExisting: MatAutocomplete }
                    ],
                    styles: [".mat-autocomplete-panel{min-width:112px;max-width:280px;overflow:auto;-webkit-overflow-scrolling:touch;visibility:hidden;max-width:none;max-height:256px;position:relative;width:100%;border-bottom-left-radius:4px;border-bottom-right-radius:4px}.mat-autocomplete-panel.mat-autocomplete-visible{visibility:visible}.mat-autocomplete-panel.mat-autocomplete-hidden{visibility:hidden}.mat-autocomplete-panel-above .mat-autocomplete-panel{border-radius:0;border-top-left-radius:4px;border-top-right-radius:4px}.mat-autocomplete-panel .mat-divider-horizontal{margin-top:-1px}.cdk-high-contrast-active .mat-autocomplete-panel{outline:solid 1px}mat-autocomplete{display:none}\n"]
                },] }
    ];
    MatAutocomplete.propDecorators = {
        optionGroups: [{ type: core$1.ContentChildren, args: [core.MAT_OPTGROUP, { descendants: true },] }],
        options: [{ type: core$1.ContentChildren, args: [core.MatOption, { descendants: true },] }]
    };

    /** Injection token that determines the scroll handling while the autocomplete panel is open. */
    var MAT_AUTOCOMPLETE_SCROLL_STRATEGY = new core$1.InjectionToken('mat-autocomplete-scroll-strategy');
    /** @docs-private */
    function MAT_AUTOCOMPLETE_SCROLL_STRATEGY_FACTORY(overlay) {
        return function () { return overlay.scrollStrategies.reposition(); };
    }
    /** @docs-private */
    var MAT_AUTOCOMPLETE_SCROLL_STRATEGY_FACTORY_PROVIDER = {
        provide: MAT_AUTOCOMPLETE_SCROLL_STRATEGY,
        deps: [overlay.Overlay],
        useFactory: MAT_AUTOCOMPLETE_SCROLL_STRATEGY_FACTORY,
    };
    /**
     * Provider that allows the autocomplete to register as a ControlValueAccessor.
     * @docs-private
     */
    var MAT_AUTOCOMPLETE_VALUE_ACCESSOR = {
        provide: forms.NG_VALUE_ACCESSOR,
        useExisting: core$1.forwardRef(function () { return MatAutocompleteTrigger; }),
        multi: true
    };
    /**
     * Creates an error to be thrown when attempting to use an autocomplete trigger without a panel.
     * @docs-private
     */
    function getMatAutocompleteMissingPanelError() {
        return Error('Attempting to open an undefined instance of `mat-autocomplete`. ' +
            'Make sure that the id passed to the `matAutocomplete` is correct and that ' +
            'you\'re attempting to open it after the ngAfterContentInit hook.');
    }
    /** Base class with all of the `MatAutocompleteTrigger` functionality. */
    var _MatAutocompleteTriggerBase = /** @class */ (function () {
        function _MatAutocompleteTriggerBase(_element, _overlay, _viewContainerRef, _zone, _changeDetectorRef, scrollStrategy, _dir, _formField, _document, _viewportRuler, _defaults) {
            var _this = this;
            this._element = _element;
            this._overlay = _overlay;
            this._viewContainerRef = _viewContainerRef;
            this._zone = _zone;
            this._changeDetectorRef = _changeDetectorRef;
            this._dir = _dir;
            this._formField = _formField;
            this._document = _document;
            this._viewportRuler = _viewportRuler;
            this._defaults = _defaults;
            this._componentDestroyed = false;
            this._autocompleteDisabled = false;
            /** Whether or not the label state is being overridden. */
            this._manuallyFloatingLabel = false;
            /** Subscription to viewport size changes. */
            this._viewportSubscription = rxjs.Subscription.EMPTY;
            /**
             * Whether the autocomplete can open the next time it is focused. Used to prevent a focused,
             * closed autocomplete from being reopened if the user switches to another browser tab and then
             * comes back.
             */
            this._canOpenOnNextFocus = true;
            /** Stream of keyboard events that can close the panel. */
            this._closeKeyEventStream = new rxjs.Subject();
            /**
             * Event handler for when the window is blurred. Needs to be an
             * arrow function in order to preserve the context.
             */
            this._windowBlurHandler = function () {
                // If the user blurred the window while the autocomplete is focused, it means that it'll be
                // refocused when they come back. In this case we want to skip the first focus event, if the
                // pane was closed, in order to avoid reopening it unintentionally.
                _this._canOpenOnNextFocus =
                    _this._document.activeElement !== _this._element.nativeElement || _this.panelOpen;
            };
            /** `View -> model callback called when value changes` */
            this._onChange = function () { };
            /** `View -> model callback called when autocomplete has been touched` */
            this._onTouched = function () { };
            /**
             * Position of the autocomplete panel relative to the trigger element. A position of `auto`
             * will render the panel underneath the trigger if there is enough space for it to fit in
             * the viewport, otherwise the panel will be shown above it. If the position is set to
             * `above` or `below`, the panel will always be shown above or below the trigger. no matter
             * whether it fits completely in the viewport.
             */
            this.position = 'auto';
            /**
             * `autocomplete` attribute to be set on the input element.
             * @docs-private
             */
            this.autocompleteAttribute = 'off';
            this._overlayAttached = false;
            /** Stream of autocomplete option selections. */
            this.optionSelections = rxjs.defer(function () {
                if (_this.autocomplete && _this.autocomplete.options) {
                    return rxjs.merge.apply(void 0, __spreadArray([], __read(_this.autocomplete.options.map(function (option) { return option.onSelectionChange; }))));
                }
                // If there are any subscribers before `ngAfterViewInit`, the `autocomplete` will be undefined.
                // Return a stream that we'll replace with the real one once everything is in place.
                return _this._zone.onStable
                    .pipe(operators.take(1), operators.switchMap(function () { return _this.optionSelections; }));
            });
            this._scrollStrategy = scrollStrategy;
        }
        Object.defineProperty(_MatAutocompleteTriggerBase.prototype, "autocompleteDisabled", {
            /**
             * Whether the autocomplete is disabled. When disabled, the element will
             * act as a regular input and the user won't be able to open the panel.
             */
            get: function () { return this._autocompleteDisabled; },
            set: function (value) {
                this._autocompleteDisabled = coercion.coerceBooleanProperty(value);
            },
            enumerable: false,
            configurable: true
        });
        _MatAutocompleteTriggerBase.prototype.ngAfterViewInit = function () {
            var _this = this;
            var window = this._getWindow();
            if (typeof window !== 'undefined') {
                this._zone.runOutsideAngular(function () { return window.addEventListener('blur', _this._windowBlurHandler); });
            }
        };
        _MatAutocompleteTriggerBase.prototype.ngOnChanges = function (changes) {
            if (changes['position'] && this._positionStrategy) {
                this._setStrategyPositions(this._positionStrategy);
                if (this.panelOpen) {
                    this._overlayRef.updatePosition();
                }
            }
        };
        _MatAutocompleteTriggerBase.prototype.ngOnDestroy = function () {
            var window = this._getWindow();
            if (typeof window !== 'undefined') {
                window.removeEventListener('blur', this._windowBlurHandler);
            }
            this._viewportSubscription.unsubscribe();
            this._componentDestroyed = true;
            this._destroyPanel();
            this._closeKeyEventStream.complete();
        };
        Object.defineProperty(_MatAutocompleteTriggerBase.prototype, "panelOpen", {
            /** Whether or not the autocomplete panel is open. */
            get: function () {
                return this._overlayAttached && this.autocomplete.showPanel;
            },
            enumerable: false,
            configurable: true
        });
        /** Opens the autocomplete suggestion panel. */
        _MatAutocompleteTriggerBase.prototype.openPanel = function () {
            this._attachOverlay();
            this._floatLabel();
        };
        /** Closes the autocomplete suggestion panel. */
        _MatAutocompleteTriggerBase.prototype.closePanel = function () {
            this._resetLabel();
            if (!this._overlayAttached) {
                return;
            }
            if (this.panelOpen) {
                // Only emit if the panel was visible.
                this.autocomplete.closed.emit();
            }
            this.autocomplete._isOpen = this._overlayAttached = false;
            if (this._overlayRef && this._overlayRef.hasAttached()) {
                this._overlayRef.detach();
                this._closingActionsSubscription.unsubscribe();
            }
            // Note that in some cases this can end up being called after the component is destroyed.
            // Add a check to ensure that we don't try to run change detection on a destroyed view.
            if (!this._componentDestroyed) {
                // We need to trigger change detection manually, because
                // `fromEvent` doesn't seem to do it at the proper time.
                // This ensures that the label is reset when the
                // user clicks outside.
                this._changeDetectorRef.detectChanges();
            }
        };
        /**
         * Updates the position of the autocomplete suggestion panel to ensure that it fits all options
         * within the viewport.
         */
        _MatAutocompleteTriggerBase.prototype.updatePosition = function () {
            if (this._overlayAttached) {
                this._overlayRef.updatePosition();
            }
        };
        Object.defineProperty(_MatAutocompleteTriggerBase.prototype, "panelClosingActions", {
            /**
             * A stream of actions that should close the autocomplete panel, including
             * when an option is selected, on blur, and when TAB is pressed.
             */
            get: function () {
                var _this = this;
                return rxjs.merge(this.optionSelections, this.autocomplete._keyManager.tabOut.pipe(operators.filter(function () { return _this._overlayAttached; })), this._closeKeyEventStream, this._getOutsideClickStream(), this._overlayRef ?
                    this._overlayRef.detachments().pipe(operators.filter(function () { return _this._overlayAttached; })) :
                    rxjs.of()).pipe(
                // Normalize the output so we return a consistent type.
                operators.map(function (event) { return event instanceof core.MatOptionSelectionChange ? event : null; }));
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(_MatAutocompleteTriggerBase.prototype, "activeOption", {
            /** The currently active option, coerced to MatOption type. */
            get: function () {
                if (this.autocomplete && this.autocomplete._keyManager) {
                    return this.autocomplete._keyManager.activeItem;
                }
                return null;
            },
            enumerable: false,
            configurable: true
        });
        /** Stream of clicks outside of the autocomplete panel. */
        _MatAutocompleteTriggerBase.prototype._getOutsideClickStream = function () {
            var _this = this;
            return rxjs.merge(rxjs.fromEvent(this._document, 'click'), rxjs.fromEvent(this._document, 'auxclick'), rxjs.fromEvent(this._document, 'touchend'))
                .pipe(operators.filter(function (event) {
                // If we're in the Shadow DOM, the event target will be the shadow root, so we have to
                // fall back to check the first element in the path of the click event.
                var clickTarget = (_this._isInsideShadowRoot && event.composedPath ? event.composedPath()[0] :
                    event.target);
                var formField = _this._formField ? _this._formField._elementRef.nativeElement : null;
                var customOrigin = _this.connectedTo ? _this.connectedTo.elementRef.nativeElement : null;
                return _this._overlayAttached && clickTarget !== _this._element.nativeElement &&
                    (!formField || !formField.contains(clickTarget)) &&
                    (!customOrigin || !customOrigin.contains(clickTarget)) &&
                    (!!_this._overlayRef && !_this._overlayRef.overlayElement.contains(clickTarget));
            }));
        };
        // Implemented as part of ControlValueAccessor.
        _MatAutocompleteTriggerBase.prototype.writeValue = function (value) {
            var _this = this;
            Promise.resolve(null).then(function () { return _this._setTriggerValue(value); });
        };
        // Implemented as part of ControlValueAccessor.
        _MatAutocompleteTriggerBase.prototype.registerOnChange = function (fn) {
            this._onChange = fn;
        };
        // Implemented as part of ControlValueAccessor.
        _MatAutocompleteTriggerBase.prototype.registerOnTouched = function (fn) {
            this._onTouched = fn;
        };
        // Implemented as part of ControlValueAccessor.
        _MatAutocompleteTriggerBase.prototype.setDisabledState = function (isDisabled) {
            this._element.nativeElement.disabled = isDisabled;
        };
        _MatAutocompleteTriggerBase.prototype._handleKeydown = function (event) {
            var keyCode = event.keyCode;
            // Prevent the default action on all escape key presses. This is here primarily to bring IE
            // in line with other browsers. By default, pressing escape on IE will cause it to revert
            // the input value to the one that it had on focus, however it won't dispatch any events
            // which means that the model value will be out of sync with the view.
            if (keyCode === keycodes.ESCAPE && !keycodes.hasModifierKey(event)) {
                event.preventDefault();
            }
            if (this.activeOption && keyCode === keycodes.ENTER && this.panelOpen) {
                this.activeOption._selectViaInteraction();
                this._resetActiveItem();
                event.preventDefault();
            }
            else if (this.autocomplete) {
                var prevActiveItem = this.autocomplete._keyManager.activeItem;
                var isArrowKey = keyCode === keycodes.UP_ARROW || keyCode === keycodes.DOWN_ARROW;
                if (this.panelOpen || keyCode === keycodes.TAB) {
                    this.autocomplete._keyManager.onKeydown(event);
                }
                else if (isArrowKey && this._canOpen()) {
                    this.openPanel();
                }
                if (isArrowKey || this.autocomplete._keyManager.activeItem !== prevActiveItem) {
                    this._scrollToOption(this.autocomplete._keyManager.activeItemIndex || 0);
                }
            }
        };
        _MatAutocompleteTriggerBase.prototype._handleInput = function (event) {
            var target = event.target;
            var value = target.value;
            // Based on `NumberValueAccessor` from forms.
            if (target.type === 'number') {
                value = value == '' ? null : parseFloat(value);
            }
            // If the input has a placeholder, IE will fire the `input` event on page load,
            // focus and blur, in addition to when the user actually changed the value. To
            // filter out all of the extra events, we save the value on focus and between
            // `input` events, and we check whether it changed.
            // See: https://connect.microsoft.com/IE/feedback/details/885747/
            if (this._previousValue !== value) {
                this._previousValue = value;
                this._onChange(value);
                if (this._canOpen() && this._document.activeElement === event.target) {
                    this.openPanel();
                }
            }
        };
        _MatAutocompleteTriggerBase.prototype._handleFocus = function () {
            if (!this._canOpenOnNextFocus) {
                this._canOpenOnNextFocus = true;
            }
            else if (this._canOpen()) {
                this._previousValue = this._element.nativeElement.value;
                this._attachOverlay();
                this._floatLabel(true);
            }
        };
        /**
         * In "auto" mode, the label will animate down as soon as focus is lost.
         * This causes the value to jump when selecting an option with the mouse.
         * This method manually floats the label until the panel can be closed.
         * @param shouldAnimate Whether the label should be animated when it is floated.
         */
        _MatAutocompleteTriggerBase.prototype._floatLabel = function (shouldAnimate) {
            if (shouldAnimate === void 0) { shouldAnimate = false; }
            if (this._formField && this._formField.floatLabel === 'auto') {
                if (shouldAnimate) {
                    this._formField._animateAndLockLabel();
                }
                else {
                    this._formField.floatLabel = 'always';
                }
                this._manuallyFloatingLabel = true;
            }
        };
        /** If the label has been manually elevated, return it to its normal state. */
        _MatAutocompleteTriggerBase.prototype._resetLabel = function () {
            if (this._manuallyFloatingLabel) {
                this._formField.floatLabel = 'auto';
                this._manuallyFloatingLabel = false;
            }
        };
        /**
         * This method listens to a stream of panel closing actions and resets the
         * stream every time the option list changes.
         */
        _MatAutocompleteTriggerBase.prototype._subscribeToClosingActions = function () {
            var _this = this;
            var firstStable = this._zone.onStable.pipe(operators.take(1));
            var optionChanges = this.autocomplete.options.changes.pipe(operators.tap(function () { return _this._positionStrategy.reapplyLastPosition(); }), 
            // Defer emitting to the stream until the next tick, because changing
            // bindings in here will cause "changed after checked" errors.
            operators.delay(0));
            // When the zone is stable initially, and when the option list changes...
            return rxjs.merge(firstStable, optionChanges)
                .pipe(
            // create a new stream of panelClosingActions, replacing any previous streams
            // that were created, and flatten it so our stream only emits closing events...
            operators.switchMap(function () {
                var wasOpen = _this.panelOpen;
                _this._resetActiveItem();
                _this.autocomplete._setVisibility();
                if (_this.panelOpen) {
                    _this._overlayRef.updatePosition();
                    // If the `panelOpen` state changed, we need to make sure to emit the `opened`
                    // event, because we may not have emitted it when the panel was attached. This
                    // can happen if the users opens the panel and there are no options, but the
                    // options come in slightly later or as a result of the value changing.
                    if (wasOpen !== _this.panelOpen) {
                        _this.autocomplete.opened.emit();
                    }
                }
                return _this.panelClosingActions;
            }), 
            // when the first closing event occurs...
            operators.take(1))
                // set the value, close the panel, and complete.
                .subscribe(function (event) { return _this._setValueAndClose(event); });
        };
        /** Destroys the autocomplete suggestion panel. */
        _MatAutocompleteTriggerBase.prototype._destroyPanel = function () {
            if (this._overlayRef) {
                this.closePanel();
                this._overlayRef.dispose();
                this._overlayRef = null;
            }
        };
        _MatAutocompleteTriggerBase.prototype._setTriggerValue = function (value) {
            var toDisplay = this.autocomplete && this.autocomplete.displayWith ?
                this.autocomplete.displayWith(value) :
                value;
            // Simply falling back to an empty string if the display value is falsy does not work properly.
            // The display value can also be the number zero and shouldn't fall back to an empty string.
            var inputValue = toDisplay != null ? toDisplay : '';
            // If it's used within a `MatFormField`, we should set it through the property so it can go
            // through change detection.
            if (this._formField) {
                this._formField._control.value = inputValue;
            }
            else {
                this._element.nativeElement.value = inputValue;
            }
            this._previousValue = inputValue;
        };
        /**
         * This method closes the panel, and if a value is specified, also sets the associated
         * control to that value. It will also mark the control as dirty if this interaction
         * stemmed from the user.
         */
        _MatAutocompleteTriggerBase.prototype._setValueAndClose = function (event) {
            if (event && event.source) {
                this._clearPreviousSelectedOption(event.source);
                this._setTriggerValue(event.source.value);
                this._onChange(event.source.value);
                this._element.nativeElement.focus();
                this.autocomplete._emitSelectEvent(event.source);
            }
            this.closePanel();
        };
        /**
         * Clear any previous selected option and emit a selection change event for this option
         */
        _MatAutocompleteTriggerBase.prototype._clearPreviousSelectedOption = function (skip) {
            this.autocomplete.options.forEach(function (option) {
                if (option !== skip && option.selected) {
                    option.deselect();
                }
            });
        };
        _MatAutocompleteTriggerBase.prototype._attachOverlay = function () {
            var _this = this;
            var _a;
            if (!this.autocomplete && (typeof ngDevMode === 'undefined' || ngDevMode)) {
                throw getMatAutocompleteMissingPanelError();
            }
            // We want to resolve this once, as late as possible so that we can be
            // sure that the element has been moved into its final place in the DOM.
            if (this._isInsideShadowRoot == null) {
                this._isInsideShadowRoot = !!platform._getShadowRoot(this._element.nativeElement);
            }
            var overlayRef = this._overlayRef;
            if (!overlayRef) {
                this._portal = new portal.TemplatePortal(this.autocomplete.template, this._viewContainerRef, { id: (_a = this._formField) === null || _a === void 0 ? void 0 : _a.getLabelId() });
                overlayRef = this._overlay.create(this._getOverlayConfig());
                this._overlayRef = overlayRef;
                // Use the `keydownEvents` in order to take advantage of
                // the overlay event targeting provided by the CDK overlay.
                overlayRef.keydownEvents().subscribe(function (event) {
                    // Close when pressing ESCAPE or ALT + UP_ARROW, based on the a11y guidelines.
                    // See: https://www.w3.org/TR/wai-aria-practices-1.1/#textbox-keyboard-interaction
                    if ((event.keyCode === keycodes.ESCAPE && !keycodes.hasModifierKey(event)) ||
                        (event.keyCode === keycodes.UP_ARROW && keycodes.hasModifierKey(event, 'altKey'))) {
                        _this._resetActiveItem();
                        _this._closeKeyEventStream.next();
                        // We need to stop propagation, otherwise the event will eventually
                        // reach the input itself and cause the overlay to be reopened.
                        event.stopPropagation();
                        event.preventDefault();
                    }
                });
                this._viewportSubscription = this._viewportRuler.change().subscribe(function () {
                    if (_this.panelOpen && overlayRef) {
                        overlayRef.updateSize({ width: _this._getPanelWidth() });
                    }
                });
            }
            else {
                // Update the trigger, panel width and direction, in case anything has changed.
                this._positionStrategy.setOrigin(this._getConnectedElement());
                overlayRef.updateSize({ width: this._getPanelWidth() });
            }
            if (overlayRef && !overlayRef.hasAttached()) {
                overlayRef.attach(this._portal);
                this._closingActionsSubscription = this._subscribeToClosingActions();
            }
            var wasOpen = this.panelOpen;
            this.autocomplete._setVisibility();
            this.autocomplete._isOpen = this._overlayAttached = true;
            // We need to do an extra `panelOpen` check in here, because the
            // autocomplete won't be shown if there are no options.
            if (this.panelOpen && wasOpen !== this.panelOpen) {
                this.autocomplete.opened.emit();
            }
        };
        _MatAutocompleteTriggerBase.prototype._getOverlayConfig = function () {
            var _a;
            return new overlay.OverlayConfig({
                positionStrategy: this._getOverlayPosition(),
                scrollStrategy: this._scrollStrategy(),
                width: this._getPanelWidth(),
                direction: this._dir,
                panelClass: (_a = this._defaults) === null || _a === void 0 ? void 0 : _a.overlayPanelClass,
            });
        };
        _MatAutocompleteTriggerBase.prototype._getOverlayPosition = function () {
            var strategy = this._overlay.position()
                .flexibleConnectedTo(this._getConnectedElement())
                .withFlexibleDimensions(false)
                .withPush(false);
            this._setStrategyPositions(strategy);
            this._positionStrategy = strategy;
            return strategy;
        };
        /** Sets the positions on a position strategy based on the directive's input state. */
        _MatAutocompleteTriggerBase.prototype._setStrategyPositions = function (positionStrategy) {
            // Note that we provide horizontal fallback positions, even though by default the dropdown
            // width matches the input, because consumers can override the width. See #18854.
            var belowPositions = [
                { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' },
                { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top' }
            ];
            // The overlay edge connected to the trigger should have squared corners, while
            // the opposite end has rounded corners. We apply a CSS class to swap the
            // border-radius based on the overlay position.
            var panelClass = this._aboveClass;
            var abovePositions = [
                { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', panelClass: panelClass },
                { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', panelClass: panelClass }
            ];
            var positions;
            if (this.position === 'above') {
                positions = abovePositions;
            }
            else if (this.position === 'below') {
                positions = belowPositions;
            }
            else {
                positions = __spreadArray(__spreadArray([], __read(belowPositions)), __read(abovePositions));
            }
            positionStrategy.withPositions(positions);
        };
        _MatAutocompleteTriggerBase.prototype._getConnectedElement = function () {
            if (this.connectedTo) {
                return this.connectedTo.elementRef;
            }
            return this._formField ? this._formField.getConnectedOverlayOrigin() : this._element;
        };
        _MatAutocompleteTriggerBase.prototype._getPanelWidth = function () {
            return this.autocomplete.panelWidth || this._getHostWidth();
        };
        /** Returns the width of the input element, so the panel width can match it. */
        _MatAutocompleteTriggerBase.prototype._getHostWidth = function () {
            return this._getConnectedElement().nativeElement.getBoundingClientRect().width;
        };
        /**
         * Resets the active item to -1 so arrow events will activate the
         * correct options, or to 0 if the consumer opted into it.
         */
        _MatAutocompleteTriggerBase.prototype._resetActiveItem = function () {
            var autocomplete = this.autocomplete;
            if (autocomplete.autoActiveFirstOption) {
                // Note that we go through `setFirstItemActive`, rather than `setActiveItem(0)`, because
                // the former will find the next enabled option, if the first one is disabled.
                autocomplete._keyManager.setFirstItemActive();
            }
            else {
                autocomplete._keyManager.setActiveItem(-1);
            }
        };
        /** Determines whether the panel can be opened. */
        _MatAutocompleteTriggerBase.prototype._canOpen = function () {
            var element = this._element.nativeElement;
            return !element.readOnly && !element.disabled && !this._autocompleteDisabled;
        };
        /** Use defaultView of injected document if available or fallback to global window reference */
        _MatAutocompleteTriggerBase.prototype._getWindow = function () {
            var _a;
            return ((_a = this._document) === null || _a === void 0 ? void 0 : _a.defaultView) || window;
        };
        /** Scrolls to a particular option in the list. */
        _MatAutocompleteTriggerBase.prototype._scrollToOption = function (index) {
            // Given that we are not actually focusing active options, we must manually adjust scroll
            // to reveal options below the fold. First, we find the offset of the option from the top
            // of the panel. If that offset is below the fold, the new scrollTop will be the offset -
            // the panel height + the option height, so the active option will be just visible at the
            // bottom of the panel. If that offset is above the top of the visible panel, the new scrollTop
            // will become the offset. If that offset is visible within the panel already, the scrollTop is
            // not adjusted.
            var autocomplete = this.autocomplete;
            var labelCount = core._countGroupLabelsBeforeOption(index, autocomplete.options, autocomplete.optionGroups);
            if (index === 0 && labelCount === 1) {
                // If we've got one group label before the option and we're at the top option,
                // scroll the list to the top. This is better UX than scrolling the list to the
                // top of the option, because it allows the user to read the top group's label.
                autocomplete._setScrollTop(0);
            }
            else if (autocomplete.panel) {
                var option = autocomplete.options.toArray()[index];
                if (option) {
                    var element = option._getHostElement();
                    var newScrollPosition = core._getOptionScrollPosition(element.offsetTop, element.offsetHeight, autocomplete._getScrollTop(), autocomplete.panel.nativeElement.offsetHeight);
                    autocomplete._setScrollTop(newScrollPosition);
                }
            }
        };
        return _MatAutocompleteTriggerBase;
    }());
    _MatAutocompleteTriggerBase.decorators = [
        { type: core$1.Directive }
    ];
    _MatAutocompleteTriggerBase.ctorParameters = function () { return [
        { type: core$1.ElementRef },
        { type: overlay.Overlay },
        { type: core$1.ViewContainerRef },
        { type: core$1.NgZone },
        { type: core$1.ChangeDetectorRef },
        { type: undefined, decorators: [{ type: core$1.Inject, args: [MAT_AUTOCOMPLETE_SCROLL_STRATEGY,] }] },
        { type: bidi.Directionality, decorators: [{ type: core$1.Optional }] },
        { type: formField.MatFormField, decorators: [{ type: core$1.Optional }, { type: core$1.Inject, args: [formField.MAT_FORM_FIELD,] }, { type: core$1.Host }] },
        { type: undefined, decorators: [{ type: core$1.Optional }, { type: core$1.Inject, args: [common.DOCUMENT,] }] },
        { type: scrolling.ViewportRuler },
        { type: undefined, decorators: [{ type: core$1.Optional }, { type: core$1.Inject, args: [MAT_AUTOCOMPLETE_DEFAULT_OPTIONS,] }] }
    ]; };
    _MatAutocompleteTriggerBase.propDecorators = {
        autocomplete: [{ type: core$1.Input, args: ['matAutocomplete',] }],
        position: [{ type: core$1.Input, args: ['matAutocompletePosition',] }],
        connectedTo: [{ type: core$1.Input, args: ['matAutocompleteConnectedTo',] }],
        autocompleteAttribute: [{ type: core$1.Input, args: ['autocomplete',] }],
        autocompleteDisabled: [{ type: core$1.Input, args: ['matAutocompleteDisabled',] }]
    };
    var MatAutocompleteTrigger = /** @class */ (function (_super) {
        __extends(MatAutocompleteTrigger, _super);
        function MatAutocompleteTrigger() {
            var _this = _super.apply(this, __spreadArray([], __read(arguments))) || this;
            _this._aboveClass = 'mat-autocomplete-panel-above';
            return _this;
        }
        return MatAutocompleteTrigger;
    }(_MatAutocompleteTriggerBase));
    MatAutocompleteTrigger.decorators = [
        { type: core$1.Directive, args: [{
                    selector: "input[matAutocomplete], textarea[matAutocomplete]",
                    host: {
                        'class': 'mat-autocomplete-trigger',
                        '[attr.autocomplete]': 'autocompleteAttribute',
                        '[attr.role]': 'autocompleteDisabled ? null : "combobox"',
                        '[attr.aria-autocomplete]': 'autocompleteDisabled ? null : "list"',
                        '[attr.aria-activedescendant]': '(panelOpen && activeOption) ? activeOption.id : null',
                        '[attr.aria-expanded]': 'autocompleteDisabled ? null : panelOpen.toString()',
                        '[attr.aria-owns]': '(autocompleteDisabled || !panelOpen) ? null : autocomplete?.id',
                        '[attr.aria-haspopup]': '!autocompleteDisabled',
                        // Note: we use `focusin`, as opposed to `focus`, in order to open the panel
                        // a little earlier. This avoids issues where IE delays the focusing of the input.
                        '(focusin)': '_handleFocus()',
                        '(blur)': '_onTouched()',
                        '(input)': '_handleInput($event)',
                        '(keydown)': '_handleKeydown($event)',
                    },
                    exportAs: 'matAutocompleteTrigger',
                    providers: [MAT_AUTOCOMPLETE_VALUE_ACCESSOR]
                },] }
    ];

    /** Base class containing all of the functionality for `MatAutocompleteOrigin`. */
    var _MatAutocompleteOriginBase = /** @class */ (function () {
        function _MatAutocompleteOriginBase(
        /** Reference to the element on which the directive is applied. */
        elementRef) {
            this.elementRef = elementRef;
        }
        return _MatAutocompleteOriginBase;
    }());
    _MatAutocompleteOriginBase.decorators = [
        { type: core$1.Directive }
    ];
    _MatAutocompleteOriginBase.ctorParameters = function () { return [
        { type: core$1.ElementRef }
    ]; };
    /**
     * Directive applied to an element to make it usable
     * as a connection point for an autocomplete panel.
     */
    var MatAutocompleteOrigin = /** @class */ (function (_super) {
        __extends(MatAutocompleteOrigin, _super);
        function MatAutocompleteOrigin() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return MatAutocompleteOrigin;
    }(_MatAutocompleteOriginBase));
    MatAutocompleteOrigin.decorators = [
        { type: core$1.Directive, args: [{
                    selector: '[matAutocompleteOrigin]',
                    exportAs: 'matAutocompleteOrigin',
                },] }
    ];

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var MatAutocompleteModule = /** @class */ (function () {
        function MatAutocompleteModule() {
        }
        return MatAutocompleteModule;
    }());
    MatAutocompleteModule.decorators = [
        { type: core$1.NgModule, args: [{
                    imports: [
                        overlay.OverlayModule,
                        core.MatOptionModule,
                        core.MatCommonModule,
                        common.CommonModule
                    ],
                    exports: [
                        MatAutocomplete,
                        MatAutocompleteTrigger,
                        MatAutocompleteOrigin,
                        scrolling.CdkScrollableModule,
                        core.MatOptionModule,
                        core.MatCommonModule,
                    ],
                    declarations: [MatAutocomplete, MatAutocompleteTrigger, MatAutocompleteOrigin],
                    providers: [MAT_AUTOCOMPLETE_SCROLL_STRATEGY_FACTORY_PROVIDER],
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

    exports.MAT_AUTOCOMPLETE_DEFAULT_OPTIONS = MAT_AUTOCOMPLETE_DEFAULT_OPTIONS;
    exports.MAT_AUTOCOMPLETE_DEFAULT_OPTIONS_FACTORY = MAT_AUTOCOMPLETE_DEFAULT_OPTIONS_FACTORY;
    exports.MAT_AUTOCOMPLETE_SCROLL_STRATEGY = MAT_AUTOCOMPLETE_SCROLL_STRATEGY;
    exports.MAT_AUTOCOMPLETE_SCROLL_STRATEGY_FACTORY = MAT_AUTOCOMPLETE_SCROLL_STRATEGY_FACTORY;
    exports.MAT_AUTOCOMPLETE_SCROLL_STRATEGY_FACTORY_PROVIDER = MAT_AUTOCOMPLETE_SCROLL_STRATEGY_FACTORY_PROVIDER;
    exports.MAT_AUTOCOMPLETE_VALUE_ACCESSOR = MAT_AUTOCOMPLETE_VALUE_ACCESSOR;
    exports.MatAutocomplete = MatAutocomplete;
    exports.MatAutocompleteModule = MatAutocompleteModule;
    exports.MatAutocompleteOrigin = MatAutocompleteOrigin;
    exports.MatAutocompleteSelectedEvent = MatAutocompleteSelectedEvent;
    exports.MatAutocompleteTrigger = MatAutocompleteTrigger;
    exports._MatAutocompleteBase = _MatAutocompleteBase;
    exports._MatAutocompleteOriginBase = _MatAutocompleteOriginBase;
    exports._MatAutocompleteTriggerBase = _MatAutocompleteTriggerBase;
    exports.getMatAutocompleteMissingPanelError = getMatAutocompleteMissingPanelError;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=material-autocomplete.umd.js.map
