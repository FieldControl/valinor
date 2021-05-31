(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/cdk/keycodes'), require('@angular/core'), require('@angular/material/core'), require('@angular/cdk/coercion'), require('@angular/cdk/platform'), require('@angular/common'), require('@angular/platform-browser/animations'), require('rxjs'), require('rxjs/operators'), require('@angular/cdk/a11y'), require('@angular/cdk/bidi'), require('@angular/cdk/collections'), require('@angular/forms'), require('@angular/material/form-field')) :
    typeof define === 'function' && define.amd ? define('@angular/material/chips', ['exports', '@angular/cdk/keycodes', '@angular/core', '@angular/material/core', '@angular/cdk/coercion', '@angular/cdk/platform', '@angular/common', '@angular/platform-browser/animations', 'rxjs', 'rxjs/operators', '@angular/cdk/a11y', '@angular/cdk/bidi', '@angular/cdk/collections', '@angular/forms', '@angular/material/form-field'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.ng = global.ng || {}, global.ng.material = global.ng.material || {}, global.ng.material.chips = {}), global.ng.cdk.keycodes, global.ng.core, global.ng.material.core, global.ng.cdk.coercion, global.ng.cdk.platform, global.ng.common, global.ng.platformBrowser.animations, global.rxjs, global.rxjs.operators, global.ng.cdk.a11y, global.ng.cdk.bidi, global.ng.cdk.collections, global.ng.forms, global.ng.material.formField));
}(this, (function (exports, keycodes, core, core$1, coercion, platform, common, animations, rxjs, operators, a11y, bidi, collections, forms, formField) { 'use strict';

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

    /** Event object emitted by MatChip when selected or deselected. */
    var MatChipSelectionChange = /** @class */ (function () {
        function MatChipSelectionChange(
        /** Reference to the chip that emitted the event. */
        source, 
        /** Whether the chip that emitted the event is selected. */
        selected, 
        /** Whether the selection change was a result of a user interaction. */
        isUserInput) {
            if (isUserInput === void 0) { isUserInput = false; }
            this.source = source;
            this.selected = selected;
            this.isUserInput = isUserInput;
        }
        return MatChipSelectionChange;
    }());
    /**
     * Injection token that can be used to reference instances of `MatChipRemove`. It serves as
     * alternative token to the actual `MatChipRemove` class which could cause unnecessary
     * retention of the class and its directive metadata.
     */
    var MAT_CHIP_REMOVE = new core.InjectionToken('MatChipRemove');
    /**
     * Injection token that can be used to reference instances of `MatChipAvatar`. It serves as
     * alternative token to the actual `MatChipAvatar` class which could cause unnecessary
     * retention of the class and its directive metadata.
     */
    var MAT_CHIP_AVATAR = new core.InjectionToken('MatChipAvatar');
    /**
     * Injection token that can be used to reference instances of `MatChipTrailingIcon`. It serves as
     * alternative token to the actual `MatChipTrailingIcon` class which could cause unnecessary
     * retention of the class and its directive metadata.
     */
    var MAT_CHIP_TRAILING_ICON = new core.InjectionToken('MatChipTrailingIcon');
    // Boilerplate for applying mixins to MatChip.
    /** @docs-private */
    var MatChipBase = /** @class */ (function () {
        function MatChipBase(_elementRef) {
            this._elementRef = _elementRef;
        }
        return MatChipBase;
    }());
    var _MatChipMixinBase = core$1.mixinTabIndex(core$1.mixinColor(core$1.mixinDisableRipple(MatChipBase), 'primary'), -1);
    /**
     * Dummy directive to add CSS class to chip avatar.
     * @docs-private
     */
    var MatChipAvatar = /** @class */ (function () {
        function MatChipAvatar() {
        }
        return MatChipAvatar;
    }());
    MatChipAvatar.decorators = [
        { type: core.Directive, args: [{
                    selector: 'mat-chip-avatar, [matChipAvatar]',
                    host: { 'class': 'mat-chip-avatar' },
                    providers: [{ provide: MAT_CHIP_AVATAR, useExisting: MatChipAvatar }]
                },] }
    ];
    /**
     * Dummy directive to add CSS class to chip trailing icon.
     * @docs-private
     */
    var MatChipTrailingIcon = /** @class */ (function () {
        function MatChipTrailingIcon() {
        }
        return MatChipTrailingIcon;
    }());
    MatChipTrailingIcon.decorators = [
        { type: core.Directive, args: [{
                    selector: 'mat-chip-trailing-icon, [matChipTrailingIcon]',
                    host: { 'class': 'mat-chip-trailing-icon' },
                    providers: [{ provide: MAT_CHIP_TRAILING_ICON, useExisting: MatChipTrailingIcon }],
                },] }
    ];
    /**
     * Material design styled Chip component. Used inside the MatChipList component.
     */
    var MatChip = /** @class */ (function (_super) {
        __extends(MatChip, _super);
        function MatChip(_elementRef, _ngZone, platform, globalRippleOptions, _changeDetectorRef, _document, animationMode, tabIndex) {
            var _this = _super.call(this, _elementRef) || this;
            _this._elementRef = _elementRef;
            _this._ngZone = _ngZone;
            _this._changeDetectorRef = _changeDetectorRef;
            /** Whether the chip has focus. */
            _this._hasFocus = false;
            /** Whether the chip list is selectable */
            _this.chipListSelectable = true;
            /** Whether the chip list is in multi-selection mode. */
            _this._chipListMultiple = false;
            /** Whether the chip list as a whole is disabled. */
            _this._chipListDisabled = false;
            _this._selected = false;
            _this._selectable = true;
            _this._disabled = false;
            _this._removable = true;
            /** Emits when the chip is focused. */
            _this._onFocus = new rxjs.Subject();
            /** Emits when the chip is blured. */
            _this._onBlur = new rxjs.Subject();
            /** Emitted when the chip is selected or deselected. */
            _this.selectionChange = new core.EventEmitter();
            /** Emitted when the chip is destroyed. */
            _this.destroyed = new core.EventEmitter();
            /** Emitted when a chip is to be removed. */
            _this.removed = new core.EventEmitter();
            _this._addHostClassName();
            // Dynamically create the ripple target, append it within the chip, and use it as the
            // chip's ripple target. Adding the class '.mat-chip-ripple' ensures that it will have
            // the proper styles.
            _this._chipRippleTarget = _document.createElement('div');
            _this._chipRippleTarget.classList.add('mat-chip-ripple');
            _this._elementRef.nativeElement.appendChild(_this._chipRippleTarget);
            _this._chipRipple = new core$1.RippleRenderer(_this, _ngZone, _this._chipRippleTarget, platform);
            _this._chipRipple.setupTriggerEvents(_elementRef);
            _this.rippleConfig = globalRippleOptions || {};
            _this._animationsDisabled = animationMode === 'NoopAnimations';
            _this.tabIndex = tabIndex != null ? (parseInt(tabIndex) || -1) : -1;
            return _this;
        }
        Object.defineProperty(MatChip.prototype, "rippleDisabled", {
            /**
             * Whether ripples are disabled on interaction
             * @docs-private
             */
            get: function () {
                return this.disabled || this.disableRipple || this._animationsDisabled ||
                    !!this.rippleConfig.disabled;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatChip.prototype, "selected", {
            /** Whether the chip is selected. */
            get: function () { return this._selected; },
            set: function (value) {
                var coercedValue = coercion.coerceBooleanProperty(value);
                if (coercedValue !== this._selected) {
                    this._selected = coercedValue;
                    this._dispatchSelectionChange();
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatChip.prototype, "value", {
            /** The value of the chip. Defaults to the content inside `<mat-chip>` tags. */
            get: function () {
                return this._value !== undefined
                    ? this._value
                    : this._elementRef.nativeElement.textContent;
            },
            set: function (value) { this._value = value; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatChip.prototype, "selectable", {
            /**
             * Whether or not the chip is selectable. When a chip is not selectable,
             * changes to its selected state are always ignored. By default a chip is
             * selectable, and it becomes non-selectable if its parent chip list is
             * not selectable.
             */
            get: function () { return this._selectable && this.chipListSelectable; },
            set: function (value) {
                this._selectable = coercion.coerceBooleanProperty(value);
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatChip.prototype, "disabled", {
            /** Whether the chip is disabled. */
            get: function () { return this._chipListDisabled || this._disabled; },
            set: function (value) {
                this._disabled = coercion.coerceBooleanProperty(value);
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatChip.prototype, "removable", {
            /**
             * Determines whether or not the chip displays the remove styling and emits (removed) events.
             */
            get: function () { return this._removable; },
            set: function (value) {
                this._removable = coercion.coerceBooleanProperty(value);
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatChip.prototype, "ariaSelected", {
            /** The ARIA selected applied to the chip. */
            get: function () {
                // Remove the `aria-selected` when the chip is deselected in single-selection mode, because
                // it adds noise to NVDA users where "not selected" will be read out for each chip.
                return this.selectable && (this._chipListMultiple || this.selected) ?
                    this.selected.toString() : null;
            },
            enumerable: false,
            configurable: true
        });
        MatChip.prototype._addHostClassName = function () {
            var basicChipAttrName = 'mat-basic-chip';
            var element = this._elementRef.nativeElement;
            if (element.hasAttribute(basicChipAttrName) ||
                element.tagName.toLowerCase() === basicChipAttrName) {
                element.classList.add(basicChipAttrName);
                return;
            }
            else {
                element.classList.add('mat-standard-chip');
            }
        };
        MatChip.prototype.ngOnDestroy = function () {
            this.destroyed.emit({ chip: this });
            this._chipRipple._removeTriggerEvents();
        };
        /** Selects the chip. */
        MatChip.prototype.select = function () {
            if (!this._selected) {
                this._selected = true;
                this._dispatchSelectionChange();
                this._changeDetectorRef.markForCheck();
            }
        };
        /** Deselects the chip. */
        MatChip.prototype.deselect = function () {
            if (this._selected) {
                this._selected = false;
                this._dispatchSelectionChange();
                this._changeDetectorRef.markForCheck();
            }
        };
        /** Select this chip and emit selected event */
        MatChip.prototype.selectViaInteraction = function () {
            if (!this._selected) {
                this._selected = true;
                this._dispatchSelectionChange(true);
                this._changeDetectorRef.markForCheck();
            }
        };
        /** Toggles the current selected state of this chip. */
        MatChip.prototype.toggleSelected = function (isUserInput) {
            if (isUserInput === void 0) { isUserInput = false; }
            this._selected = !this.selected;
            this._dispatchSelectionChange(isUserInput);
            this._changeDetectorRef.markForCheck();
            return this.selected;
        };
        /** Allows for programmatic focusing of the chip. */
        MatChip.prototype.focus = function () {
            if (!this._hasFocus) {
                this._elementRef.nativeElement.focus();
                this._onFocus.next({ chip: this });
            }
            this._hasFocus = true;
        };
        /**
         * Allows for programmatic removal of the chip. Called by the MatChipList when the DELETE or
         * BACKSPACE keys are pressed.
         *
         * Informs any listeners of the removal request. Does not remove the chip from the DOM.
         */
        MatChip.prototype.remove = function () {
            if (this.removable) {
                this.removed.emit({ chip: this });
            }
        };
        /** Handles click events on the chip. */
        MatChip.prototype._handleClick = function (event) {
            if (this.disabled) {
                event.preventDefault();
            }
            else {
                event.stopPropagation();
            }
        };
        /** Handle custom key presses. */
        MatChip.prototype._handleKeydown = function (event) {
            if (this.disabled) {
                return;
            }
            switch (event.keyCode) {
                case keycodes.DELETE:
                case keycodes.BACKSPACE:
                    // If we are removable, remove the focused chip
                    this.remove();
                    // Always prevent so page navigation does not occur
                    event.preventDefault();
                    break;
                case keycodes.SPACE:
                    // If we are selectable, toggle the focused chip
                    if (this.selectable) {
                        this.toggleSelected(true);
                    }
                    // Always prevent space from scrolling the page since the list has focus
                    event.preventDefault();
                    break;
            }
        };
        MatChip.prototype._blur = function () {
            var _this = this;
            // When animations are enabled, Angular may end up removing the chip from the DOM a little
            // earlier than usual, causing it to be blurred and throwing off the logic in the chip list
            // that moves focus not the next item. To work around the issue, we defer marking the chip
            // as not focused until the next time the zone stabilizes.
            this._ngZone.onStable
                .pipe(operators.take(1))
                .subscribe(function () {
                _this._ngZone.run(function () {
                    _this._hasFocus = false;
                    _this._onBlur.next({ chip: _this });
                });
            });
        };
        MatChip.prototype._dispatchSelectionChange = function (isUserInput) {
            if (isUserInput === void 0) { isUserInput = false; }
            this.selectionChange.emit({
                source: this,
                isUserInput: isUserInput,
                selected: this._selected
            });
        };
        return MatChip;
    }(_MatChipMixinBase));
    MatChip.decorators = [
        { type: core.Directive, args: [{
                    selector: "mat-basic-chip, [mat-basic-chip], mat-chip, [mat-chip]",
                    inputs: ['color', 'disableRipple', 'tabIndex'],
                    exportAs: 'matChip',
                    host: {
                        'class': 'mat-chip mat-focus-indicator',
                        '[attr.tabindex]': 'disabled ? null : tabIndex',
                        'role': 'option',
                        '[class.mat-chip-selected]': 'selected',
                        '[class.mat-chip-with-avatar]': 'avatar',
                        '[class.mat-chip-with-trailing-icon]': 'trailingIcon || removeIcon',
                        '[class.mat-chip-disabled]': 'disabled',
                        '[class._mat-animation-noopable]': '_animationsDisabled',
                        '[attr.disabled]': 'disabled || null',
                        '[attr.aria-disabled]': 'disabled.toString()',
                        '[attr.aria-selected]': 'ariaSelected',
                        '(click)': '_handleClick($event)',
                        '(keydown)': '_handleKeydown($event)',
                        '(focus)': 'focus()',
                        '(blur)': '_blur()',
                    },
                },] }
    ];
    MatChip.ctorParameters = function () { return [
        { type: core.ElementRef },
        { type: core.NgZone },
        { type: platform.Platform },
        { type: undefined, decorators: [{ type: core.Optional }, { type: core.Inject, args: [core$1.MAT_RIPPLE_GLOBAL_OPTIONS,] }] },
        { type: core.ChangeDetectorRef },
        { type: undefined, decorators: [{ type: core.Inject, args: [common.DOCUMENT,] }] },
        { type: String, decorators: [{ type: core.Optional }, { type: core.Inject, args: [animations.ANIMATION_MODULE_TYPE,] }] },
        { type: String, decorators: [{ type: core.Attribute, args: ['tabindex',] }] }
    ]; };
    MatChip.propDecorators = {
        avatar: [{ type: core.ContentChild, args: [MAT_CHIP_AVATAR,] }],
        trailingIcon: [{ type: core.ContentChild, args: [MAT_CHIP_TRAILING_ICON,] }],
        removeIcon: [{ type: core.ContentChild, args: [MAT_CHIP_REMOVE,] }],
        selected: [{ type: core.Input }],
        value: [{ type: core.Input }],
        selectable: [{ type: core.Input }],
        disabled: [{ type: core.Input }],
        removable: [{ type: core.Input }],
        selectionChange: [{ type: core.Output }],
        destroyed: [{ type: core.Output }],
        removed: [{ type: core.Output }]
    };
    /**
     * Applies proper (click) support and adds styling for use with the Material Design "cancel" icon
     * available at https://material.io/icons/#ic_cancel.
     *
     * Example:
     *
     *     `<mat-chip>
     *       <mat-icon matChipRemove>cancel</mat-icon>
     *     </mat-chip>`
     *
     * You *may* use a custom icon, but you may need to override the `mat-chip-remove` positioning
     * styles to properly center the icon within the chip.
     */
    var MatChipRemove = /** @class */ (function () {
        function MatChipRemove(_parentChip, elementRef) {
            this._parentChip = _parentChip;
            if (elementRef.nativeElement.nodeName === 'BUTTON') {
                elementRef.nativeElement.setAttribute('type', 'button');
            }
        }
        /** Calls the parent chip's public `remove()` method if applicable. */
        MatChipRemove.prototype._handleClick = function (event) {
            var parentChip = this._parentChip;
            if (parentChip.removable && !parentChip.disabled) {
                parentChip.remove();
            }
            // We need to stop event propagation because otherwise the event will bubble up to the
            // form field and cause the `onContainerClick` method to be invoked. This method would then
            // reset the focused chip that has been focused after chip removal. Usually the parent
            // the parent click listener of the `MatChip` would prevent propagation, but it can happen
            // that the chip is being removed before the event bubbles up.
            event.stopPropagation();
        };
        return MatChipRemove;
    }());
    MatChipRemove.decorators = [
        { type: core.Directive, args: [{
                    selector: '[matChipRemove]',
                    host: {
                        'class': 'mat-chip-remove mat-chip-trailing-icon',
                        '(click)': '_handleClick($event)',
                    },
                    providers: [{ provide: MAT_CHIP_REMOVE, useExisting: MatChipRemove }],
                },] }
    ];
    MatChipRemove.ctorParameters = function () { return [
        { type: MatChip },
        { type: core.ElementRef }
    ]; };

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /** Injection token to be used to override the default options for the chips module. */
    var MAT_CHIPS_DEFAULT_OPTIONS = new core.InjectionToken('mat-chips-default-options');

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    // Increasing integer for generating unique ids.
    var nextUniqueId$1 = 0;
    /**
     * Directive that adds chip-specific behaviors to an input element inside `<mat-form-field>`.
     * May be placed inside or outside of an `<mat-chip-list>`.
     */
    var MatChipInput = /** @class */ (function () {
        function MatChipInput(_elementRef, _defaultOptions) {
            this._elementRef = _elementRef;
            this._defaultOptions = _defaultOptions;
            /** Whether the control is focused. */
            this.focused = false;
            this._addOnBlur = false;
            /**
             * The list of key codes that will trigger a chipEnd event.
             *
             * Defaults to `[ENTER]`.
             */
            this.separatorKeyCodes = this._defaultOptions.separatorKeyCodes;
            /** Emitted when a chip is to be added. */
            this.chipEnd = new core.EventEmitter();
            /** The input's placeholder text. */
            this.placeholder = '';
            /** Unique id for the input. */
            this.id = "mat-chip-list-input-" + nextUniqueId$1++;
            this._disabled = false;
            this.inputElement = this._elementRef.nativeElement;
        }
        Object.defineProperty(MatChipInput.prototype, "chipList", {
            /** Register input for chip list */
            set: function (value) {
                if (value) {
                    this._chipList = value;
                    this._chipList.registerInput(this);
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatChipInput.prototype, "addOnBlur", {
            /**
             * Whether or not the chipEnd event will be emitted when the input is blurred.
             */
            get: function () { return this._addOnBlur; },
            set: function (value) { this._addOnBlur = coercion.coerceBooleanProperty(value); },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatChipInput.prototype, "disabled", {
            /** Whether the input is disabled. */
            get: function () { return this._disabled || (this._chipList && this._chipList.disabled); },
            set: function (value) { this._disabled = coercion.coerceBooleanProperty(value); },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatChipInput.prototype, "empty", {
            /** Whether the input is empty. */
            get: function () { return !this.inputElement.value; },
            enumerable: false,
            configurable: true
        });
        MatChipInput.prototype.ngOnChanges = function () {
            this._chipList.stateChanges.next();
        };
        MatChipInput.prototype.ngOnDestroy = function () {
            this.chipEnd.complete();
        };
        MatChipInput.prototype.ngAfterContentInit = function () {
            this._focusLastChipOnBackspace = this.empty;
        };
        /** Utility method to make host definition/tests more clear. */
        MatChipInput.prototype._keydown = function (event) {
            if (event) {
                // Allow the user's focus to escape when they're tabbing forward. Note that we don't
                // want to do this when going backwards, because focus should go back to the first chip.
                if (event.keyCode === keycodes.TAB && !keycodes.hasModifierKey(event, 'shiftKey')) {
                    this._chipList._allowFocusEscape();
                }
                // To prevent the user from accidentally deleting chips when pressing BACKSPACE continuously,
                // We focus the last chip on backspace only after the user has released the backspace button,
                // and the input is empty (see behaviour in _keyup)
                if (event.keyCode === keycodes.BACKSPACE && this._focusLastChipOnBackspace) {
                    this._chipList._keyManager.setLastItemActive();
                    event.preventDefault();
                    return;
                }
                else {
                    this._focusLastChipOnBackspace = false;
                }
            }
            this._emitChipEnd(event);
        };
        /**
         * Pass events to the keyboard manager. Available here for tests.
         */
        MatChipInput.prototype._keyup = function (event) {
            // Allow user to move focus to chips next time he presses backspace
            if (!this._focusLastChipOnBackspace && event.keyCode === keycodes.BACKSPACE && this.empty) {
                this._focusLastChipOnBackspace = true;
                event.preventDefault();
            }
        };
        /** Checks to see if the blur should emit the (chipEnd) event. */
        MatChipInput.prototype._blur = function () {
            if (this.addOnBlur) {
                this._emitChipEnd();
            }
            this.focused = false;
            // Blur the chip list if it is not focused
            if (!this._chipList.focused) {
                this._chipList._blur();
            }
            this._chipList.stateChanges.next();
        };
        MatChipInput.prototype._focus = function () {
            this.focused = true;
            this._chipList.stateChanges.next();
        };
        /** Checks to see if the (chipEnd) event needs to be emitted. */
        MatChipInput.prototype._emitChipEnd = function (event) {
            if (!this.inputElement.value && !!event) {
                this._chipList._keydown(event);
            }
            if (!event || this._isSeparatorKey(event)) {
                this.chipEnd.emit({
                    input: this.inputElement,
                    value: this.inputElement.value,
                    chipInput: this,
                });
                event === null || event === void 0 ? void 0 : event.preventDefault();
            }
        };
        MatChipInput.prototype._onInput = function () {
            // Let chip list know whenever the value changes.
            this._chipList.stateChanges.next();
        };
        /** Focuses the input. */
        MatChipInput.prototype.focus = function (options) {
            this.inputElement.focus(options);
        };
        /** Clears the input */
        MatChipInput.prototype.clear = function () {
            this.inputElement.value = '';
            this._focusLastChipOnBackspace = true;
        };
        /** Checks whether a keycode is one of the configured separators. */
        MatChipInput.prototype._isSeparatorKey = function (event) {
            return !keycodes.hasModifierKey(event) && new Set(this.separatorKeyCodes).has(event.keyCode);
        };
        return MatChipInput;
    }());
    MatChipInput.decorators = [
        { type: core.Directive, args: [{
                    selector: 'input[matChipInputFor]',
                    exportAs: 'matChipInput, matChipInputFor',
                    host: {
                        'class': 'mat-chip-input mat-input-element',
                        '(keydown)': '_keydown($event)',
                        '(keyup)': '_keyup($event)',
                        '(blur)': '_blur()',
                        '(focus)': '_focus()',
                        '(input)': '_onInput()',
                        '[id]': 'id',
                        '[attr.disabled]': 'disabled || null',
                        '[attr.placeholder]': 'placeholder || null',
                        '[attr.aria-invalid]': '_chipList && _chipList.ngControl ? _chipList.ngControl.invalid : null',
                        '[attr.aria-required]': '_chipList && _chipList.required || null',
                    }
                },] }
    ];
    MatChipInput.ctorParameters = function () { return [
        { type: core.ElementRef },
        { type: undefined, decorators: [{ type: core.Inject, args: [MAT_CHIPS_DEFAULT_OPTIONS,] }] }
    ]; };
    MatChipInput.propDecorators = {
        chipList: [{ type: core.Input, args: ['matChipInputFor',] }],
        addOnBlur: [{ type: core.Input, args: ['matChipInputAddOnBlur',] }],
        separatorKeyCodes: [{ type: core.Input, args: ['matChipInputSeparatorKeyCodes',] }],
        chipEnd: [{ type: core.Output, args: ['matChipInputTokenEnd',] }],
        placeholder: [{ type: core.Input }],
        id: [{ type: core.Input }],
        disabled: [{ type: core.Input }]
    };

    // Boilerplate for applying mixins to MatChipList.
    /** @docs-private */
    var MatChipListBase = /** @class */ (function () {
        function MatChipListBase(_defaultErrorStateMatcher, _parentForm, _parentFormGroup, 
        /** @docs-private */
        ngControl) {
            this._defaultErrorStateMatcher = _defaultErrorStateMatcher;
            this._parentForm = _parentForm;
            this._parentFormGroup = _parentFormGroup;
            this.ngControl = ngControl;
        }
        return MatChipListBase;
    }());
    var _MatChipListMixinBase = core$1.mixinErrorState(MatChipListBase);
    // Increasing integer for generating unique ids for chip-list components.
    var nextUniqueId = 0;
    /** Change event object that is emitted when the chip list value has changed. */
    var MatChipListChange = /** @class */ (function () {
        function MatChipListChange(
        /** Chip list that emitted the event. */
        source, 
        /** Value of the chip list when the event was emitted. */
        value) {
            this.source = source;
            this.value = value;
        }
        return MatChipListChange;
    }());
    /**
     * A material design chips component (named ChipList for its similarity to the List component).
     */
    var MatChipList = /** @class */ (function (_super) {
        __extends(MatChipList, _super);
        function MatChipList(_elementRef, _changeDetectorRef, _dir, _parentForm, _parentFormGroup, _defaultErrorStateMatcher, 
        /** @docs-private */
        ngControl) {
            var _this = _super.call(this, _defaultErrorStateMatcher, _parentForm, _parentFormGroup, ngControl) || this;
            _this._elementRef = _elementRef;
            _this._changeDetectorRef = _changeDetectorRef;
            _this._dir = _dir;
            _this.ngControl = ngControl;
            /**
             * Implemented as part of MatFormFieldControl.
             * @docs-private
             */
            _this.controlType = 'mat-chip-list';
            /**
             * When a chip is destroyed, we store the index of the destroyed chip until the chips
             * query list notifies about the update. This is necessary because we cannot determine an
             * appropriate chip that should receive focus until the array of chips updated completely.
             */
            _this._lastDestroyedChipIndex = null;
            /** Subject that emits when the component has been destroyed. */
            _this._destroyed = new rxjs.Subject();
            /** Uid of the chip list */
            _this._uid = "mat-chip-list-" + nextUniqueId++;
            /** Tab index for the chip list. */
            _this._tabIndex = 0;
            /**
             * User defined tab index.
             * When it is not null, use user defined tab index. Otherwise use _tabIndex
             */
            _this._userTabIndex = null;
            /** Function when touched */
            _this._onTouched = function () { };
            /** Function when changed */
            _this._onChange = function () { };
            _this._multiple = false;
            _this._compareWith = function (o1, o2) { return o1 === o2; };
            _this._required = false;
            _this._disabled = false;
            /** Orientation of the chip list. */
            _this.ariaOrientation = 'horizontal';
            _this._selectable = true;
            /** Event emitted when the selected chip list value has been changed by the user. */
            _this.change = new core.EventEmitter();
            /**
             * Event that emits whenever the raw value of the chip-list changes. This is here primarily
             * to facilitate the two-way binding for the `value` input.
             * @docs-private
             */
            _this.valueChange = new core.EventEmitter();
            if (_this.ngControl) {
                _this.ngControl.valueAccessor = _this;
            }
            return _this;
        }
        Object.defineProperty(MatChipList.prototype, "selected", {
            /** The array of selected chips inside chip list. */
            get: function () {
                return this.multiple ? this._selectionModel.selected : this._selectionModel.selected[0];
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatChipList.prototype, "role", {
            /** The ARIA role applied to the chip list. */
            get: function () { return this.empty ? null : 'listbox'; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatChipList.prototype, "multiple", {
            /** Whether the user should be allowed to select multiple chips. */
            get: function () { return this._multiple; },
            set: function (value) {
                this._multiple = coercion.coerceBooleanProperty(value);
                this._syncChipsState();
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatChipList.prototype, "compareWith", {
            /**
             * A function to compare the option values with the selected values. The first argument
             * is a value from an option. The second is a value from the selection. A boolean
             * should be returned.
             */
            get: function () { return this._compareWith; },
            set: function (fn) {
                this._compareWith = fn;
                if (this._selectionModel) {
                    // A different comparator means the selection could change.
                    this._initializeSelection();
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatChipList.prototype, "value", {
            /**
             * Implemented as part of MatFormFieldControl.
             * @docs-private
             */
            get: function () { return this._value; },
            set: function (value) {
                this.writeValue(value);
                this._value = value;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatChipList.prototype, "id", {
            /**
             * Implemented as part of MatFormFieldControl.
             * @docs-private
             */
            get: function () {
                return this._chipInput ? this._chipInput.id : this._uid;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatChipList.prototype, "required", {
            /**
             * Implemented as part of MatFormFieldControl.
             * @docs-private
             */
            get: function () { return this._required; },
            set: function (value) {
                this._required = coercion.coerceBooleanProperty(value);
                this.stateChanges.next();
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatChipList.prototype, "placeholder", {
            /**
             * Implemented as part of MatFormFieldControl.
             * @docs-private
             */
            get: function () {
                return this._chipInput ? this._chipInput.placeholder : this._placeholder;
            },
            set: function (value) {
                this._placeholder = value;
                this.stateChanges.next();
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatChipList.prototype, "focused", {
            /** Whether any chips or the matChipInput inside of this chip-list has focus. */
            get: function () {
                return (this._chipInput && this._chipInput.focused) || this._hasFocusedChip();
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatChipList.prototype, "empty", {
            /**
             * Implemented as part of MatFormFieldControl.
             * @docs-private
             */
            get: function () {
                return (!this._chipInput || this._chipInput.empty) && (!this.chips || this.chips.length === 0);
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatChipList.prototype, "shouldLabelFloat", {
            /**
             * Implemented as part of MatFormFieldControl.
             * @docs-private
             */
            get: function () { return !this.empty || this.focused; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatChipList.prototype, "disabled", {
            /**
             * Implemented as part of MatFormFieldControl.
             * @docs-private
             */
            get: function () { return this.ngControl ? !!this.ngControl.disabled : this._disabled; },
            set: function (value) {
                this._disabled = coercion.coerceBooleanProperty(value);
                this._syncChipsState();
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatChipList.prototype, "selectable", {
            /**
             * Whether or not this chip list is selectable. When a chip list is not selectable,
             * the selected states for all the chips inside the chip list are always ignored.
             */
            get: function () { return this._selectable; },
            set: function (value) {
                var _this = this;
                this._selectable = coercion.coerceBooleanProperty(value);
                if (this.chips) {
                    this.chips.forEach(function (chip) { return chip.chipListSelectable = _this._selectable; });
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatChipList.prototype, "tabIndex", {
            set: function (value) {
                this._userTabIndex = value;
                this._tabIndex = value;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatChipList.prototype, "chipSelectionChanges", {
            /** Combined stream of all of the child chips' selection change events. */
            get: function () {
                return rxjs.merge.apply(void 0, __spreadArray([], __read(this.chips.map(function (chip) { return chip.selectionChange; }))));
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatChipList.prototype, "chipFocusChanges", {
            /** Combined stream of all of the child chips' focus change events. */
            get: function () {
                return rxjs.merge.apply(void 0, __spreadArray([], __read(this.chips.map(function (chip) { return chip._onFocus; }))));
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatChipList.prototype, "chipBlurChanges", {
            /** Combined stream of all of the child chips' blur change events. */
            get: function () {
                return rxjs.merge.apply(void 0, __spreadArray([], __read(this.chips.map(function (chip) { return chip._onBlur; }))));
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatChipList.prototype, "chipRemoveChanges", {
            /** Combined stream of all of the child chips' remove change events. */
            get: function () {
                return rxjs.merge.apply(void 0, __spreadArray([], __read(this.chips.map(function (chip) { return chip.destroyed; }))));
            },
            enumerable: false,
            configurable: true
        });
        MatChipList.prototype.ngAfterContentInit = function () {
            var _this = this;
            this._keyManager = new a11y.FocusKeyManager(this.chips)
                .withWrap()
                .withVerticalOrientation()
                .withHomeAndEnd()
                .withHorizontalOrientation(this._dir ? this._dir.value : 'ltr');
            if (this._dir) {
                this._dir.change
                    .pipe(operators.takeUntil(this._destroyed))
                    .subscribe(function (dir) { return _this._keyManager.withHorizontalOrientation(dir); });
            }
            this._keyManager.tabOut.pipe(operators.takeUntil(this._destroyed)).subscribe(function () {
                _this._allowFocusEscape();
            });
            // When the list changes, re-subscribe
            this.chips.changes.pipe(operators.startWith(null), operators.takeUntil(this._destroyed)).subscribe(function () {
                if (_this.disabled) {
                    // Since this happens after the content has been
                    // checked, we need to defer it to the next tick.
                    Promise.resolve().then(function () {
                        _this._syncChipsState();
                    });
                }
                _this._resetChips();
                // Reset chips selected/deselected status
                _this._initializeSelection();
                // Check to see if we need to update our tab index
                _this._updateTabIndex();
                // Check to see if we have a destroyed chip and need to refocus
                _this._updateFocusForDestroyedChips();
                _this.stateChanges.next();
            });
        };
        MatChipList.prototype.ngOnInit = function () {
            this._selectionModel = new collections.SelectionModel(this.multiple, undefined, false);
            this.stateChanges.next();
        };
        MatChipList.prototype.ngDoCheck = function () {
            if (this.ngControl) {
                // We need to re-evaluate this on every change detection cycle, because there are some
                // error triggers that we can't subscribe to (e.g. parent form submissions). This means
                // that whatever logic is in here has to be super lean or we risk destroying the performance.
                this.updateErrorState();
                if (this.ngControl.disabled !== this._disabled) {
                    this.disabled = !!this.ngControl.disabled;
                }
            }
        };
        MatChipList.prototype.ngOnDestroy = function () {
            this._destroyed.next();
            this._destroyed.complete();
            this.stateChanges.complete();
            this._dropSubscriptions();
        };
        /** Associates an HTML input element with this chip list. */
        MatChipList.prototype.registerInput = function (inputElement) {
            this._chipInput = inputElement;
            // We use this attribute to match the chip list to its input in test harnesses.
            // Set the attribute directly here to avoid "changed after checked" errors.
            this._elementRef.nativeElement.setAttribute('data-mat-chip-input', inputElement.id);
        };
        /**
         * Implemented as part of MatFormFieldControl.
         * @docs-private
         */
        MatChipList.prototype.setDescribedByIds = function (ids) { this._ariaDescribedby = ids.join(' '); };
        // Implemented as part of ControlValueAccessor.
        MatChipList.prototype.writeValue = function (value) {
            if (this.chips) {
                this._setSelectionByValue(value, false);
            }
        };
        // Implemented as part of ControlValueAccessor.
        MatChipList.prototype.registerOnChange = function (fn) {
            this._onChange = fn;
        };
        // Implemented as part of ControlValueAccessor.
        MatChipList.prototype.registerOnTouched = function (fn) {
            this._onTouched = fn;
        };
        // Implemented as part of ControlValueAccessor.
        MatChipList.prototype.setDisabledState = function (isDisabled) {
            this.disabled = isDisabled;
            this.stateChanges.next();
        };
        /**
         * Implemented as part of MatFormFieldControl.
         * @docs-private
         */
        MatChipList.prototype.onContainerClick = function (event) {
            if (!this._originatesFromChip(event)) {
                this.focus();
            }
        };
        /**
         * Focuses the first non-disabled chip in this chip list, or the associated input when there
         * are no eligible chips.
         */
        MatChipList.prototype.focus = function (options) {
            if (this.disabled) {
                return;
            }
            // TODO: ARIA says this should focus the first `selected` chip if any are selected.
            // Focus on first element if there's no chipInput inside chip-list
            if (this._chipInput && this._chipInput.focused) {
                // do nothing
            }
            else if (this.chips.length > 0) {
                this._keyManager.setFirstItemActive();
                this.stateChanges.next();
            }
            else {
                this._focusInput(options);
                this.stateChanges.next();
            }
        };
        /** Attempt to focus an input if we have one. */
        MatChipList.prototype._focusInput = function (options) {
            if (this._chipInput) {
                this._chipInput.focus(options);
            }
        };
        /**
         * Pass events to the keyboard manager. Available here for tests.
         */
        MatChipList.prototype._keydown = function (event) {
            var target = event.target;
            if (target && target.classList.contains('mat-chip')) {
                this._keyManager.onKeydown(event);
                this.stateChanges.next();
            }
        };
        /**
         * Check the tab index as you should not be allowed to focus an empty list.
         */
        MatChipList.prototype._updateTabIndex = function () {
            // If we have 0 chips, we should not allow keyboard focus
            this._tabIndex = this._userTabIndex || (this.chips.length === 0 ? -1 : 0);
        };
        /**
         * If the amount of chips changed, we need to update the
         * key manager state and focus the next closest chip.
         */
        MatChipList.prototype._updateFocusForDestroyedChips = function () {
            // Move focus to the closest chip. If no other chips remain, focus the chip-list itself.
            if (this._lastDestroyedChipIndex != null) {
                if (this.chips.length) {
                    var newChipIndex = Math.min(this._lastDestroyedChipIndex, this.chips.length - 1);
                    this._keyManager.setActiveItem(newChipIndex);
                }
                else {
                    this.focus();
                }
            }
            this._lastDestroyedChipIndex = null;
        };
        /**
         * Utility to ensure all indexes are valid.
         *
         * @param index The index to be checked.
         * @returns True if the index is valid for our list of chips.
         */
        MatChipList.prototype._isValidIndex = function (index) {
            return index >= 0 && index < this.chips.length;
        };
        MatChipList.prototype._setSelectionByValue = function (value, isUserInput) {
            var _this = this;
            if (isUserInput === void 0) { isUserInput = true; }
            this._clearSelection();
            this.chips.forEach(function (chip) { return chip.deselect(); });
            if (Array.isArray(value)) {
                value.forEach(function (currentValue) { return _this._selectValue(currentValue, isUserInput); });
                this._sortValues();
            }
            else {
                var correspondingChip = this._selectValue(value, isUserInput);
                // Shift focus to the active item. Note that we shouldn't do this in multiple
                // mode, because we don't know what chip the user interacted with last.
                if (correspondingChip) {
                    if (isUserInput) {
                        this._keyManager.setActiveItem(correspondingChip);
                    }
                }
            }
        };
        /**
         * Finds and selects the chip based on its value.
         * @returns Chip that has the corresponding value.
         */
        MatChipList.prototype._selectValue = function (value, isUserInput) {
            var _this = this;
            if (isUserInput === void 0) { isUserInput = true; }
            var correspondingChip = this.chips.find(function (chip) {
                return chip.value != null && _this._compareWith(chip.value, value);
            });
            if (correspondingChip) {
                isUserInput ? correspondingChip.selectViaInteraction() : correspondingChip.select();
                this._selectionModel.select(correspondingChip);
            }
            return correspondingChip;
        };
        MatChipList.prototype._initializeSelection = function () {
            var _this = this;
            // Defer setting the value in order to avoid the "Expression
            // has changed after it was checked" errors from Angular.
            Promise.resolve().then(function () {
                if (_this.ngControl || _this._value) {
                    _this._setSelectionByValue(_this.ngControl ? _this.ngControl.value : _this._value, false);
                    _this.stateChanges.next();
                }
            });
        };
        /**
         * Deselects every chip in the list.
         * @param skip Chip that should not be deselected.
         */
        MatChipList.prototype._clearSelection = function (skip) {
            this._selectionModel.clear();
            this.chips.forEach(function (chip) {
                if (chip !== skip) {
                    chip.deselect();
                }
            });
            this.stateChanges.next();
        };
        /**
         * Sorts the model values, ensuring that they keep the same
         * order that they have in the panel.
         */
        MatChipList.prototype._sortValues = function () {
            var _this = this;
            if (this._multiple) {
                this._selectionModel.clear();
                this.chips.forEach(function (chip) {
                    if (chip.selected) {
                        _this._selectionModel.select(chip);
                    }
                });
                this.stateChanges.next();
            }
        };
        /** Emits change event to set the model value. */
        MatChipList.prototype._propagateChanges = function (fallbackValue) {
            var valueToEmit = null;
            if (Array.isArray(this.selected)) {
                valueToEmit = this.selected.map(function (chip) { return chip.value; });
            }
            else {
                valueToEmit = this.selected ? this.selected.value : fallbackValue;
            }
            this._value = valueToEmit;
            this.change.emit(new MatChipListChange(this, valueToEmit));
            this.valueChange.emit(valueToEmit);
            this._onChange(valueToEmit);
            this._changeDetectorRef.markForCheck();
        };
        /** When blurred, mark the field as touched when focus moved outside the chip list. */
        MatChipList.prototype._blur = function () {
            var _this = this;
            if (!this._hasFocusedChip()) {
                this._keyManager.setActiveItem(-1);
            }
            if (!this.disabled) {
                if (this._chipInput) {
                    // If there's a chip input, we should check whether the focus moved to chip input.
                    // If the focus is not moved to chip input, mark the field as touched. If the focus moved
                    // to chip input, do nothing.
                    // Timeout is needed to wait for the focus() event trigger on chip input.
                    setTimeout(function () {
                        if (!_this.focused) {
                            _this._markAsTouched();
                        }
                    });
                }
                else {
                    // If there's no chip input, then mark the field as touched.
                    this._markAsTouched();
                }
            }
        };
        /** Mark the field as touched */
        MatChipList.prototype._markAsTouched = function () {
            this._onTouched();
            this._changeDetectorRef.markForCheck();
            this.stateChanges.next();
        };
        /**
         * Removes the `tabindex` from the chip list and resets it back afterwards, allowing the
         * user to tab out of it. This prevents the list from capturing focus and redirecting
         * it back to the first chip, creating a focus trap, if it user tries to tab away.
         */
        MatChipList.prototype._allowFocusEscape = function () {
            var _this = this;
            if (this._tabIndex !== -1) {
                this._tabIndex = -1;
                setTimeout(function () {
                    _this._tabIndex = _this._userTabIndex || 0;
                    _this._changeDetectorRef.markForCheck();
                });
            }
        };
        MatChipList.prototype._resetChips = function () {
            this._dropSubscriptions();
            this._listenToChipsFocus();
            this._listenToChipsSelection();
            this._listenToChipsRemoved();
        };
        MatChipList.prototype._dropSubscriptions = function () {
            if (this._chipFocusSubscription) {
                this._chipFocusSubscription.unsubscribe();
                this._chipFocusSubscription = null;
            }
            if (this._chipBlurSubscription) {
                this._chipBlurSubscription.unsubscribe();
                this._chipBlurSubscription = null;
            }
            if (this._chipSelectionSubscription) {
                this._chipSelectionSubscription.unsubscribe();
                this._chipSelectionSubscription = null;
            }
            if (this._chipRemoveSubscription) {
                this._chipRemoveSubscription.unsubscribe();
                this._chipRemoveSubscription = null;
            }
        };
        /** Listens to user-generated selection events on each chip. */
        MatChipList.prototype._listenToChipsSelection = function () {
            var _this = this;
            this._chipSelectionSubscription = this.chipSelectionChanges.subscribe(function (event) {
                event.source.selected
                    ? _this._selectionModel.select(event.source)
                    : _this._selectionModel.deselect(event.source);
                // For single selection chip list, make sure the deselected value is unselected.
                if (!_this.multiple) {
                    _this.chips.forEach(function (chip) {
                        if (!_this._selectionModel.isSelected(chip) && chip.selected) {
                            chip.deselect();
                        }
                    });
                }
                if (event.isUserInput) {
                    _this._propagateChanges();
                }
            });
        };
        /** Listens to user-generated selection events on each chip. */
        MatChipList.prototype._listenToChipsFocus = function () {
            var _this = this;
            this._chipFocusSubscription = this.chipFocusChanges.subscribe(function (event) {
                var chipIndex = _this.chips.toArray().indexOf(event.chip);
                if (_this._isValidIndex(chipIndex)) {
                    _this._keyManager.updateActiveItem(chipIndex);
                }
                _this.stateChanges.next();
            });
            this._chipBlurSubscription = this.chipBlurChanges.subscribe(function () {
                _this._blur();
                _this.stateChanges.next();
            });
        };
        MatChipList.prototype._listenToChipsRemoved = function () {
            var _this = this;
            this._chipRemoveSubscription = this.chipRemoveChanges.subscribe(function (event) {
                var chip = event.chip;
                var chipIndex = _this.chips.toArray().indexOf(event.chip);
                // In case the chip that will be removed is currently focused, we temporarily store
                // the index in order to be able to determine an appropriate sibling chip that will
                // receive focus.
                if (_this._isValidIndex(chipIndex) && chip._hasFocus) {
                    _this._lastDestroyedChipIndex = chipIndex;
                }
            });
        };
        /** Checks whether an event comes from inside a chip element. */
        MatChipList.prototype._originatesFromChip = function (event) {
            var currentElement = event.target;
            while (currentElement && currentElement !== this._elementRef.nativeElement) {
                if (currentElement.classList.contains('mat-chip')) {
                    return true;
                }
                currentElement = currentElement.parentElement;
            }
            return false;
        };
        /** Checks whether any of the chips is focused. */
        MatChipList.prototype._hasFocusedChip = function () {
            return this.chips && this.chips.some(function (chip) { return chip._hasFocus; });
        };
        /** Syncs the list's state with the individual chips. */
        MatChipList.prototype._syncChipsState = function () {
            var _this = this;
            if (this.chips) {
                this.chips.forEach(function (chip) {
                    chip._chipListDisabled = _this._disabled;
                    chip._chipListMultiple = _this.multiple;
                });
            }
        };
        return MatChipList;
    }(_MatChipListMixinBase));
    MatChipList.decorators = [
        { type: core.Component, args: [{
                    selector: 'mat-chip-list',
                    template: "<div class=\"mat-chip-list-wrapper\"><ng-content></ng-content></div>",
                    exportAs: 'matChipList',
                    host: {
                        '[attr.tabindex]': 'disabled ? null : _tabIndex',
                        '[attr.aria-describedby]': '_ariaDescribedby || null',
                        '[attr.aria-required]': 'role ? required : null',
                        '[attr.aria-disabled]': 'disabled.toString()',
                        '[attr.aria-invalid]': 'errorState',
                        '[attr.aria-multiselectable]': 'multiple',
                        '[attr.role]': 'role',
                        '[class.mat-chip-list-disabled]': 'disabled',
                        '[class.mat-chip-list-invalid]': 'errorState',
                        '[class.mat-chip-list-required]': 'required',
                        '[attr.aria-orientation]': 'ariaOrientation',
                        'class': 'mat-chip-list',
                        '(focus)': 'focus()',
                        '(blur)': '_blur()',
                        '(keydown)': '_keydown($event)',
                        '[id]': '_uid',
                    },
                    providers: [{ provide: formField.MatFormFieldControl, useExisting: MatChipList }],
                    encapsulation: core.ViewEncapsulation.None,
                    changeDetection: core.ChangeDetectionStrategy.OnPush,
                    styles: [".mat-chip{position:relative;box-sizing:border-box;-webkit-tap-highlight-color:transparent;transform:translateZ(0);border:none;-webkit-appearance:none;-moz-appearance:none}.mat-standard-chip{transition:box-shadow 280ms cubic-bezier(0.4, 0, 0.2, 1);display:inline-flex;padding:7px 12px;border-radius:16px;align-items:center;cursor:default;min-height:32px;height:1px}._mat-animation-noopable.mat-standard-chip{transition:none;animation:none}.mat-standard-chip .mat-chip-remove.mat-icon{width:18px;height:18px}.mat-standard-chip::after{top:0;left:0;right:0;bottom:0;position:absolute;border-radius:inherit;opacity:0;content:\"\";pointer-events:none;transition:opacity 200ms cubic-bezier(0.35, 0, 0.25, 1)}.mat-standard-chip:hover::after{opacity:.12}.mat-standard-chip:focus{outline:none}.mat-standard-chip:focus::after{opacity:.16}.cdk-high-contrast-active .mat-standard-chip{outline:solid 1px}.cdk-high-contrast-active .mat-standard-chip:focus{outline:dotted 2px}.mat-standard-chip.mat-chip-disabled::after{opacity:0}.mat-standard-chip.mat-chip-disabled .mat-chip-remove,.mat-standard-chip.mat-chip-disabled .mat-chip-trailing-icon{cursor:default}.mat-standard-chip.mat-chip-with-trailing-icon.mat-chip-with-avatar,.mat-standard-chip.mat-chip-with-avatar{padding-top:0;padding-bottom:0}.mat-standard-chip.mat-chip-with-trailing-icon.mat-chip-with-avatar{padding-right:8px;padding-left:0}[dir=rtl] .mat-standard-chip.mat-chip-with-trailing-icon.mat-chip-with-avatar{padding-left:8px;padding-right:0}.mat-standard-chip.mat-chip-with-trailing-icon{padding-top:7px;padding-bottom:7px;padding-right:8px;padding-left:12px}[dir=rtl] .mat-standard-chip.mat-chip-with-trailing-icon{padding-left:8px;padding-right:12px}.mat-standard-chip.mat-chip-with-avatar{padding-left:0;padding-right:12px}[dir=rtl] .mat-standard-chip.mat-chip-with-avatar{padding-right:0;padding-left:12px}.mat-standard-chip .mat-chip-avatar{width:24px;height:24px;margin-right:8px;margin-left:4px}[dir=rtl] .mat-standard-chip .mat-chip-avatar{margin-left:8px;margin-right:4px}.mat-standard-chip .mat-chip-remove,.mat-standard-chip .mat-chip-trailing-icon{width:18px;height:18px;cursor:pointer}.mat-standard-chip .mat-chip-remove,.mat-standard-chip .mat-chip-trailing-icon{margin-left:8px;margin-right:0}[dir=rtl] .mat-standard-chip .mat-chip-remove,[dir=rtl] .mat-standard-chip .mat-chip-trailing-icon{margin-right:8px;margin-left:0}.mat-chip-ripple{top:0;left:0;right:0;bottom:0;position:absolute;pointer-events:none;border-radius:inherit;overflow:hidden}.mat-chip-list-wrapper{display:flex;flex-direction:row;flex-wrap:wrap;align-items:center;margin:-4px}.mat-chip-list-wrapper input.mat-input-element,.mat-chip-list-wrapper .mat-standard-chip{margin:4px}.mat-chip-list-stacked .mat-chip-list-wrapper{flex-direction:column;align-items:flex-start}.mat-chip-list-stacked .mat-chip-list-wrapper .mat-standard-chip{width:100%}.mat-chip-avatar{border-radius:50%;justify-content:center;align-items:center;display:flex;overflow:hidden;object-fit:cover}input.mat-chip-input{width:150px;margin:4px;flex:1 0 150px}\n"]
                },] }
    ];
    MatChipList.ctorParameters = function () { return [
        { type: core.ElementRef },
        { type: core.ChangeDetectorRef },
        { type: bidi.Directionality, decorators: [{ type: core.Optional }] },
        { type: forms.NgForm, decorators: [{ type: core.Optional }] },
        { type: forms.FormGroupDirective, decorators: [{ type: core.Optional }] },
        { type: core$1.ErrorStateMatcher },
        { type: forms.NgControl, decorators: [{ type: core.Optional }, { type: core.Self }] }
    ]; };
    MatChipList.propDecorators = {
        errorStateMatcher: [{ type: core.Input }],
        multiple: [{ type: core.Input }],
        compareWith: [{ type: core.Input }],
        value: [{ type: core.Input }],
        required: [{ type: core.Input }],
        placeholder: [{ type: core.Input }],
        disabled: [{ type: core.Input }],
        ariaOrientation: [{ type: core.Input, args: ['aria-orientation',] }],
        selectable: [{ type: core.Input }],
        tabIndex: [{ type: core.Input }],
        change: [{ type: core.Output }],
        valueChange: [{ type: core.Output }],
        chips: [{ type: core.ContentChildren, args: [MatChip, {
                        // We need to use `descendants: true`, because Ivy will no longer match
                        // indirect descendants if it's left as false.
                        descendants: true
                    },] }]
    };

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var CHIP_DECLARATIONS = [
        MatChipList,
        MatChip,
        MatChipInput,
        MatChipRemove,
        MatChipAvatar,
        MatChipTrailingIcon,
    ];
    var ɵ0 = {
        separatorKeyCodes: [keycodes.ENTER]
    };
    var MatChipsModule = /** @class */ (function () {
        function MatChipsModule() {
        }
        return MatChipsModule;
    }());
    MatChipsModule.decorators = [
        { type: core.NgModule, args: [{
                    imports: [core$1.MatCommonModule],
                    exports: CHIP_DECLARATIONS,
                    declarations: CHIP_DECLARATIONS,
                    providers: [
                        core$1.ErrorStateMatcher,
                        {
                            provide: MAT_CHIPS_DEFAULT_OPTIONS,
                            useValue: ɵ0
                        }
                    ]
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

    exports.MAT_CHIPS_DEFAULT_OPTIONS = MAT_CHIPS_DEFAULT_OPTIONS;
    exports.MAT_CHIP_AVATAR = MAT_CHIP_AVATAR;
    exports.MAT_CHIP_REMOVE = MAT_CHIP_REMOVE;
    exports.MAT_CHIP_TRAILING_ICON = MAT_CHIP_TRAILING_ICON;
    exports.MatChip = MatChip;
    exports.MatChipAvatar = MatChipAvatar;
    exports.MatChipInput = MatChipInput;
    exports.MatChipList = MatChipList;
    exports.MatChipListChange = MatChipListChange;
    exports.MatChipRemove = MatChipRemove;
    exports.MatChipSelectionChange = MatChipSelectionChange;
    exports.MatChipTrailingIcon = MatChipTrailingIcon;
    exports.MatChipsModule = MatChipsModule;
    exports.ɵ0 = ɵ0;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=material-chips.umd.js.map
