(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/common'), require('@angular/core'), require('@angular/material/core'), require('@angular/cdk/a11y'), require('@angular/cdk/bidi'), require('@angular/cdk/coercion'), require('@angular/cdk/keycodes'), require('@angular/forms'), require('@angular/platform-browser/animations'), require('@angular/cdk/platform'), require('rxjs')) :
    typeof define === 'function' && define.amd ? define('@angular/material/slider', ['exports', '@angular/common', '@angular/core', '@angular/material/core', '@angular/cdk/a11y', '@angular/cdk/bidi', '@angular/cdk/coercion', '@angular/cdk/keycodes', '@angular/forms', '@angular/platform-browser/animations', '@angular/cdk/platform', 'rxjs'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.ng = global.ng || {}, global.ng.material = global.ng.material || {}, global.ng.material.slider = {}), global.ng.common, global.ng.core, global.ng.material.core, global.ng.cdk.a11y, global.ng.cdk.bidi, global.ng.cdk.coercion, global.ng.cdk.keycodes, global.ng.forms, global.ng.platformBrowser.animations, global.ng.cdk.platform, global.rxjs));
}(this, (function (exports, common, core, core$1, a11y, bidi, coercion, keycodes, forms, animations, platform, rxjs) { 'use strict';

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

    var activeEventOptions = platform.normalizePassiveListenerOptions({ passive: false });
    /**
     * Visually, a 30px separation between tick marks looks best. This is very subjective but it is
     * the default separation we chose.
     */
    var MIN_AUTO_TICK_SEPARATION = 30;
    /** The thumb gap size for a disabled slider. */
    var DISABLED_THUMB_GAP = 7;
    /** The thumb gap size for a non-active slider at its minimum value. */
    var MIN_VALUE_NONACTIVE_THUMB_GAP = 7;
    /** The thumb gap size for an active slider at its minimum value. */
    var MIN_VALUE_ACTIVE_THUMB_GAP = 10;
    /**
     * Provider Expression that allows mat-slider to register as a ControlValueAccessor.
     * This allows it to support [(ngModel)] and [formControl].
     * @docs-private
     */
    var MAT_SLIDER_VALUE_ACCESSOR = {
        provide: forms.NG_VALUE_ACCESSOR,
        useExisting: core.forwardRef(function () { return MatSlider; }),
        multi: true
    };
    /** A simple change event emitted by the MatSlider component. */
    var MatSliderChange = /** @class */ (function () {
        function MatSliderChange() {
        }
        return MatSliderChange;
    }());
    // Boilerplate for applying mixins to MatSlider.
    /** @docs-private */
    var MatSliderBase = /** @class */ (function () {
        function MatSliderBase(_elementRef) {
            this._elementRef = _elementRef;
        }
        return MatSliderBase;
    }());
    var _MatSliderMixinBase = core$1.mixinTabIndex(core$1.mixinColor(core$1.mixinDisabled(MatSliderBase), 'accent'));
    /**
     * Allows users to select from a range of values by moving the slider thumb. It is similar in
     * behavior to the native `<input type="range">` element.
     */
    var MatSlider = /** @class */ (function (_super) {
        __extends(MatSlider, _super);
        function MatSlider(elementRef, _focusMonitor, _changeDetectorRef, _dir, tabIndex, _ngZone, _document, _animationMode) {
            var _this = _super.call(this, elementRef) || this;
            _this._focusMonitor = _focusMonitor;
            _this._changeDetectorRef = _changeDetectorRef;
            _this._dir = _dir;
            _this._ngZone = _ngZone;
            _this._animationMode = _animationMode;
            _this._invert = false;
            _this._max = 100;
            _this._min = 0;
            _this._step = 1;
            _this._thumbLabel = false;
            _this._tickInterval = 0;
            _this._value = null;
            _this._vertical = false;
            /** Event emitted when the slider value has changed. */
            _this.change = new core.EventEmitter();
            /** Event emitted when the slider thumb moves. */
            _this.input = new core.EventEmitter();
            /**
             * Emits when the raw value of the slider changes. This is here primarily
             * to facilitate the two-way binding for the `value` input.
             * @docs-private
             */
            _this.valueChange = new core.EventEmitter();
            /** onTouch function registered via registerOnTouch (ControlValueAccessor). */
            _this.onTouched = function () { };
            _this._percent = 0;
            /**
             * Whether or not the thumb is sliding.
             * Used to determine if there should be a transition for the thumb and fill track.
             */
            _this._isSliding = false;
            /**
             * Whether or not the slider is active (clicked or sliding).
             * Used to shrink and grow the thumb as according to the Material Design spec.
             */
            _this._isActive = false;
            /** The size of a tick interval as a percentage of the size of the track. */
            _this._tickIntervalPercent = 0;
            /** The dimensions of the slider. */
            _this._sliderDimensions = null;
            _this._controlValueAccessorChangeFn = function () { };
            /** Subscription to the Directionality change EventEmitter. */
            _this._dirChangeSubscription = rxjs.Subscription.EMPTY;
            /** Called when the user has put their pointer down on the slider. */
            _this._pointerDown = function (event) {
                // Don't do anything if the slider is disabled or the
                // user is using anything other than the main mouse button.
                if (_this.disabled || _this._isSliding || (!isTouchEvent(event) && event.button !== 0)) {
                    return;
                }
                _this._ngZone.run(function () {
                    var oldValue = _this.value;
                    var pointerPosition = getPointerPositionOnPage(event);
                    _this._isSliding = true;
                    _this._lastPointerEvent = event;
                    event.preventDefault();
                    _this._focusHostElement();
                    _this._onMouseenter(); // Simulate mouseenter in case this is a mobile device.
                    _this._bindGlobalEvents(event);
                    _this._focusHostElement();
                    _this._updateValueFromPosition(pointerPosition);
                    _this._valueOnSlideStart = oldValue;
                    // Emit a change and input event if the value changed.
                    if (oldValue != _this.value) {
                        _this._emitInputEvent();
                    }
                });
            };
            /**
             * Called when the user has moved their pointer after
             * starting to drag. Bound on the document level.
             */
            _this._pointerMove = function (event) {
                if (_this._isSliding) {
                    // Prevent the slide from selecting anything else.
                    event.preventDefault();
                    var oldValue = _this.value;
                    _this._lastPointerEvent = event;
                    _this._updateValueFromPosition(getPointerPositionOnPage(event));
                    // Native range elements always emit `input` events when the value changed while sliding.
                    if (oldValue != _this.value) {
                        _this._emitInputEvent();
                    }
                }
            };
            /** Called when the user has lifted their pointer. Bound on the document level. */
            _this._pointerUp = function (event) {
                if (_this._isSliding) {
                    event.preventDefault();
                    _this._removeGlobalEvents();
                    _this._isSliding = false;
                    if (_this._valueOnSlideStart != _this.value && !_this.disabled) {
                        _this._emitChangeEvent();
                    }
                    _this._valueOnSlideStart = _this._lastPointerEvent = null;
                }
            };
            /** Called when the window has lost focus. */
            _this._windowBlur = function () {
                // If the window is blurred while dragging we need to stop dragging because the
                // browser won't dispatch the `mouseup` and `touchend` events anymore.
                if (_this._lastPointerEvent) {
                    _this._pointerUp(_this._lastPointerEvent);
                }
            };
            _this._document = _document;
            _this.tabIndex = parseInt(tabIndex) || 0;
            _ngZone.runOutsideAngular(function () {
                var element = elementRef.nativeElement;
                element.addEventListener('mousedown', _this._pointerDown, activeEventOptions);
                element.addEventListener('touchstart', _this._pointerDown, activeEventOptions);
            });
            return _this;
        }
        Object.defineProperty(MatSlider.prototype, "invert", {
            /** Whether the slider is inverted. */
            get: function () { return this._invert; },
            set: function (value) {
                this._invert = coercion.coerceBooleanProperty(value);
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatSlider.prototype, "max", {
            /** The maximum value that the slider can have. */
            get: function () { return this._max; },
            set: function (v) {
                this._max = coercion.coerceNumberProperty(v, this._max);
                this._percent = this._calculatePercentage(this._value);
                // Since this also modifies the percentage, we need to let the change detection know.
                this._changeDetectorRef.markForCheck();
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatSlider.prototype, "min", {
            /** The minimum value that the slider can have. */
            get: function () { return this._min; },
            set: function (v) {
                this._min = coercion.coerceNumberProperty(v, this._min);
                // If the value wasn't explicitly set by the user, set it to the min.
                if (this._value === null) {
                    this.value = this._min;
                }
                this._percent = this._calculatePercentage(this._value);
                // Since this also modifies the percentage, we need to let the change detection know.
                this._changeDetectorRef.markForCheck();
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatSlider.prototype, "step", {
            /** The values at which the thumb will snap. */
            get: function () { return this._step; },
            set: function (v) {
                this._step = coercion.coerceNumberProperty(v, this._step);
                if (this._step % 1 !== 0) {
                    this._roundToDecimal = this._step.toString().split('.').pop().length;
                }
                // Since this could modify the label, we need to notify the change detection.
                this._changeDetectorRef.markForCheck();
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatSlider.prototype, "thumbLabel", {
            /** Whether or not to show the thumb label. */
            get: function () { return this._thumbLabel; },
            set: function (value) { this._thumbLabel = coercion.coerceBooleanProperty(value); },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatSlider.prototype, "tickInterval", {
            /**
             * How often to show ticks. Relative to the step so that a tick always appears on a step.
             * Ex: Tick interval of 4 with a step of 3 will draw a tick every 4 steps (every 12 values).
             */
            get: function () { return this._tickInterval; },
            set: function (value) {
                if (value === 'auto') {
                    this._tickInterval = 'auto';
                }
                else if (typeof value === 'number' || typeof value === 'string') {
                    this._tickInterval = coercion.coerceNumberProperty(value, this._tickInterval);
                }
                else {
                    this._tickInterval = 0;
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatSlider.prototype, "value", {
            /** Value of the slider. */
            get: function () {
                // If the value needs to be read and it is still uninitialized, initialize it to the min.
                if (this._value === null) {
                    this.value = this._min;
                }
                return this._value;
            },
            set: function (v) {
                if (v !== this._value) {
                    var value = coercion.coerceNumberProperty(v);
                    // While incrementing by a decimal we can end up with values like 33.300000000000004.
                    // Truncate it to ensure that it matches the label and to make it easier to work with.
                    if (this._roundToDecimal && value !== this.min && value !== this.max) {
                        value = parseFloat(value.toFixed(this._roundToDecimal));
                    }
                    this._value = value;
                    this._percent = this._calculatePercentage(this._value);
                    // Since this also modifies the percentage, we need to let the change detection know.
                    this._changeDetectorRef.markForCheck();
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatSlider.prototype, "vertical", {
            /** Whether the slider is vertical. */
            get: function () { return this._vertical; },
            set: function (value) {
                this._vertical = coercion.coerceBooleanProperty(value);
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatSlider.prototype, "displayValue", {
            /** The value to be used for display purposes. */
            get: function () {
                if (this.displayWith) {
                    // Value is never null but since setters and getters cannot have
                    // different types, the value getter is also typed to return null.
                    return this.displayWith(this.value);
                }
                // Note that this could be improved further by rounding something like 0.999 to 1 or
                // 0.899 to 0.9, however it is very performance sensitive, because it gets called on
                // every change detection cycle.
                if (this._roundToDecimal && this.value && this.value % 1 !== 0) {
                    return this.value.toFixed(this._roundToDecimal);
                }
                return this.value || 0;
            },
            enumerable: false,
            configurable: true
        });
        /** set focus to the host element */
        MatSlider.prototype.focus = function (options) {
            this._focusHostElement(options);
        };
        /** blur the host element */
        MatSlider.prototype.blur = function () {
            this._blurHostElement();
        };
        Object.defineProperty(MatSlider.prototype, "percent", {
            /** The percentage of the slider that coincides with the value. */
            get: function () { return this._clamp(this._percent); },
            enumerable: false,
            configurable: true
        });
        /**
         * Whether the axis of the slider is inverted.
         * (i.e. whether moving the thumb in the positive x or y direction decreases the slider's value).
         */
        MatSlider.prototype._shouldInvertAxis = function () {
            // Standard non-inverted mode for a vertical slider should be dragging the thumb from bottom to
            // top. However from a y-axis standpoint this is inverted.
            return this.vertical ? !this.invert : this.invert;
        };
        /** Whether the slider is at its minimum value. */
        MatSlider.prototype._isMinValue = function () {
            return this.percent === 0;
        };
        /**
         * The amount of space to leave between the slider thumb and the track fill & track background
         * elements.
         */
        MatSlider.prototype._getThumbGap = function () {
            if (this.disabled) {
                return DISABLED_THUMB_GAP;
            }
            if (this._isMinValue() && !this.thumbLabel) {
                return this._isActive ? MIN_VALUE_ACTIVE_THUMB_GAP : MIN_VALUE_NONACTIVE_THUMB_GAP;
            }
            return 0;
        };
        /** CSS styles for the track background element. */
        MatSlider.prototype._getTrackBackgroundStyles = function () {
            var axis = this.vertical ? 'Y' : 'X';
            var scale = this.vertical ? "1, " + (1 - this.percent) + ", 1" : 1 - this.percent + ", 1, 1";
            var sign = this._shouldInvertMouseCoords() ? '-' : '';
            return {
                // scale3d avoids some rendering issues in Chrome. See #12071.
                transform: "translate" + axis + "(" + sign + this._getThumbGap() + "px) scale3d(" + scale + ")"
            };
        };
        /** CSS styles for the track fill element. */
        MatSlider.prototype._getTrackFillStyles = function () {
            var percent = this.percent;
            var axis = this.vertical ? 'Y' : 'X';
            var scale = this.vertical ? "1, " + percent + ", 1" : percent + ", 1, 1";
            var sign = this._shouldInvertMouseCoords() ? '' : '-';
            return {
                // scale3d avoids some rendering issues in Chrome. See #12071.
                transform: "translate" + axis + "(" + sign + this._getThumbGap() + "px) scale3d(" + scale + ")",
                // iOS Safari has a bug where it won't re-render elements which start of as `scale(0)` until
                // something forces a style recalculation on it. Since we'll end up with `scale(0)` when
                // the value of the slider is 0, we can easily get into this situation. We force a
                // recalculation by changing the element's `display` when it goes from 0 to any other value.
                display: percent === 0 ? 'none' : ''
            };
        };
        /** CSS styles for the ticks container element. */
        MatSlider.prototype._getTicksContainerStyles = function () {
            var axis = this.vertical ? 'Y' : 'X';
            // For a horizontal slider in RTL languages we push the ticks container off the left edge
            // instead of the right edge to avoid causing a horizontal scrollbar to appear.
            var sign = !this.vertical && this._getDirection() == 'rtl' ? '' : '-';
            var offset = this._tickIntervalPercent / 2 * 100;
            return {
                'transform': "translate" + axis + "(" + sign + offset + "%)"
            };
        };
        /** CSS styles for the ticks element. */
        MatSlider.prototype._getTicksStyles = function () {
            var tickSize = this._tickIntervalPercent * 100;
            var backgroundSize = this.vertical ? "2px " + tickSize + "%" : tickSize + "% 2px";
            var axis = this.vertical ? 'Y' : 'X';
            // Depending on the direction we pushed the ticks container, push the ticks the opposite
            // direction to re-center them but clip off the end edge. In RTL languages we need to flip the
            // ticks 180 degrees so we're really cutting off the end edge abd not the start.
            var sign = !this.vertical && this._getDirection() == 'rtl' ? '-' : '';
            var rotate = !this.vertical && this._getDirection() == 'rtl' ? ' rotate(180deg)' : '';
            var styles = {
                'backgroundSize': backgroundSize,
                // Without translateZ ticks sometimes jitter as the slider moves on Chrome & Firefox.
                'transform': "translateZ(0) translate" + axis + "(" + sign + tickSize / 2 + "%)" + rotate
            };
            if (this._isMinValue() && this._getThumbGap()) {
                var shouldInvertAxis = this._shouldInvertAxis();
                var side = void 0;
                if (this.vertical) {
                    side = shouldInvertAxis ? 'Bottom' : 'Top';
                }
                else {
                    side = shouldInvertAxis ? 'Right' : 'Left';
                }
                styles["padding" + side] = this._getThumbGap() + "px";
            }
            return styles;
        };
        MatSlider.prototype._getThumbContainerStyles = function () {
            var shouldInvertAxis = this._shouldInvertAxis();
            var axis = this.vertical ? 'Y' : 'X';
            // For a horizontal slider in RTL languages we push the thumb container off the left edge
            // instead of the right edge to avoid causing a horizontal scrollbar to appear.
            var invertOffset = (this._getDirection() == 'rtl' && !this.vertical) ? !shouldInvertAxis : shouldInvertAxis;
            var offset = (invertOffset ? this.percent : 1 - this.percent) * 100;
            return {
                'transform': "translate" + axis + "(-" + offset + "%)"
            };
        };
        /**
         * Whether mouse events should be converted to a slider position by calculating their distance
         * from the right or bottom edge of the slider as opposed to the top or left.
         */
        MatSlider.prototype._shouldInvertMouseCoords = function () {
            var shouldInvertAxis = this._shouldInvertAxis();
            return (this._getDirection() == 'rtl' && !this.vertical) ? !shouldInvertAxis : shouldInvertAxis;
        };
        /** The language direction for this slider element. */
        MatSlider.prototype._getDirection = function () {
            return (this._dir && this._dir.value == 'rtl') ? 'rtl' : 'ltr';
        };
        MatSlider.prototype.ngAfterViewInit = function () {
            var _this = this;
            this._focusMonitor
                .monitor(this._elementRef, true)
                .subscribe(function (origin) {
                _this._isActive = !!origin && origin !== 'keyboard';
                _this._changeDetectorRef.detectChanges();
            });
            if (this._dir) {
                this._dirChangeSubscription = this._dir.change.subscribe(function () {
                    _this._changeDetectorRef.markForCheck();
                });
            }
        };
        MatSlider.prototype.ngOnDestroy = function () {
            var element = this._elementRef.nativeElement;
            element.removeEventListener('mousedown', this._pointerDown, activeEventOptions);
            element.removeEventListener('touchstart', this._pointerDown, activeEventOptions);
            this._lastPointerEvent = null;
            this._removeGlobalEvents();
            this._focusMonitor.stopMonitoring(this._elementRef);
            this._dirChangeSubscription.unsubscribe();
        };
        MatSlider.prototype._onMouseenter = function () {
            if (this.disabled) {
                return;
            }
            // We save the dimensions of the slider here so we can use them to update the spacing of the
            // ticks and determine where on the slider click and slide events happen.
            this._sliderDimensions = this._getSliderDimensions();
            this._updateTickIntervalPercent();
        };
        MatSlider.prototype._onFocus = function () {
            // We save the dimensions of the slider here so we can use them to update the spacing of the
            // ticks and determine where on the slider click and slide events happen.
            this._sliderDimensions = this._getSliderDimensions();
            this._updateTickIntervalPercent();
        };
        MatSlider.prototype._onBlur = function () {
            this.onTouched();
        };
        MatSlider.prototype._onKeydown = function (event) {
            if (this.disabled || keycodes.hasModifierKey(event)) {
                return;
            }
            var oldValue = this.value;
            switch (event.keyCode) {
                case keycodes.PAGE_UP:
                    this._increment(10);
                    break;
                case keycodes.PAGE_DOWN:
                    this._increment(-10);
                    break;
                case keycodes.END:
                    this.value = this.max;
                    break;
                case keycodes.HOME:
                    this.value = this.min;
                    break;
                case keycodes.LEFT_ARROW:
                    // NOTE: For a sighted user it would make more sense that when they press an arrow key on an
                    // inverted slider the thumb moves in that direction. However for a blind user, nothing
                    // about the slider indicates that it is inverted. They will expect left to be decrement,
                    // regardless of how it appears on the screen. For speakers ofRTL languages, they probably
                    // expect left to mean increment. Therefore we flip the meaning of the side arrow keys for
                    // RTL. For inverted sliders we prefer a good a11y experience to having it "look right" for
                    // sighted users, therefore we do not swap the meaning.
                    this._increment(this._getDirection() == 'rtl' ? 1 : -1);
                    break;
                case keycodes.UP_ARROW:
                    this._increment(1);
                    break;
                case keycodes.RIGHT_ARROW:
                    // See comment on LEFT_ARROW about the conditions under which we flip the meaning.
                    this._increment(this._getDirection() == 'rtl' ? -1 : 1);
                    break;
                case keycodes.DOWN_ARROW:
                    this._increment(-1);
                    break;
                default:
                    // Return if the key is not one that we explicitly handle to avoid calling preventDefault on
                    // it.
                    return;
            }
            if (oldValue != this.value) {
                this._emitInputEvent();
                this._emitChangeEvent();
            }
            this._isSliding = true;
            event.preventDefault();
        };
        MatSlider.prototype._onKeyup = function () {
            this._isSliding = false;
        };
        /** Use defaultView of injected document if available or fallback to global window reference */
        MatSlider.prototype._getWindow = function () {
            return this._document.defaultView || window;
        };
        /**
         * Binds our global move and end events. They're bound at the document level and only while
         * dragging so that the user doesn't have to keep their pointer exactly over the slider
         * as they're swiping across the screen.
         */
        MatSlider.prototype._bindGlobalEvents = function (triggerEvent) {
            // Note that we bind the events to the `document`, because it allows us to capture
            // drag cancel events where the user's pointer is outside the browser window.
            var document = this._document;
            var isTouch = isTouchEvent(triggerEvent);
            var moveEventName = isTouch ? 'touchmove' : 'mousemove';
            var endEventName = isTouch ? 'touchend' : 'mouseup';
            document.addEventListener(moveEventName, this._pointerMove, activeEventOptions);
            document.addEventListener(endEventName, this._pointerUp, activeEventOptions);
            if (isTouch) {
                document.addEventListener('touchcancel', this._pointerUp, activeEventOptions);
            }
            var window = this._getWindow();
            if (typeof window !== 'undefined' && window) {
                window.addEventListener('blur', this._windowBlur);
            }
        };
        /** Removes any global event listeners that we may have added. */
        MatSlider.prototype._removeGlobalEvents = function () {
            var document = this._document;
            document.removeEventListener('mousemove', this._pointerMove, activeEventOptions);
            document.removeEventListener('mouseup', this._pointerUp, activeEventOptions);
            document.removeEventListener('touchmove', this._pointerMove, activeEventOptions);
            document.removeEventListener('touchend', this._pointerUp, activeEventOptions);
            document.removeEventListener('touchcancel', this._pointerUp, activeEventOptions);
            var window = this._getWindow();
            if (typeof window !== 'undefined' && window) {
                window.removeEventListener('blur', this._windowBlur);
            }
        };
        /** Increments the slider by the given number of steps (negative number decrements). */
        MatSlider.prototype._increment = function (numSteps) {
            this.value = this._clamp((this.value || 0) + this.step * numSteps, this.min, this.max);
        };
        /** Calculate the new value from the new physical location. The value will always be snapped. */
        MatSlider.prototype._updateValueFromPosition = function (pos) {
            if (!this._sliderDimensions) {
                return;
            }
            var offset = this.vertical ? this._sliderDimensions.top : this._sliderDimensions.left;
            var size = this.vertical ? this._sliderDimensions.height : this._sliderDimensions.width;
            var posComponent = this.vertical ? pos.y : pos.x;
            // The exact value is calculated from the event and used to find the closest snap value.
            var percent = this._clamp((posComponent - offset) / size);
            if (this._shouldInvertMouseCoords()) {
                percent = 1 - percent;
            }
            // Since the steps may not divide cleanly into the max value, if the user
            // slid to 0 or 100 percent, we jump to the min/max value. This approach
            // is slightly more intuitive than using `Math.ceil` below, because it
            // follows the user's pointer closer.
            if (percent === 0) {
                this.value = this.min;
            }
            else if (percent === 1) {
                this.value = this.max;
            }
            else {
                var exactValue = this._calculateValue(percent);
                // This calculation finds the closest step by finding the closest
                // whole number divisible by the step relative to the min.
                var closestValue = Math.round((exactValue - this.min) / this.step) * this.step + this.min;
                // The value needs to snap to the min and max.
                this.value = this._clamp(closestValue, this.min, this.max);
            }
        };
        /** Emits a change event if the current value is different from the last emitted value. */
        MatSlider.prototype._emitChangeEvent = function () {
            this._controlValueAccessorChangeFn(this.value);
            this.valueChange.emit(this.value);
            this.change.emit(this._createChangeEvent());
        };
        /** Emits an input event when the current value is different from the last emitted value. */
        MatSlider.prototype._emitInputEvent = function () {
            this.input.emit(this._createChangeEvent());
        };
        /** Updates the amount of space between ticks as a percentage of the width of the slider. */
        MatSlider.prototype._updateTickIntervalPercent = function () {
            if (!this.tickInterval || !this._sliderDimensions) {
                return;
            }
            if (this.tickInterval == 'auto') {
                var trackSize = this.vertical ? this._sliderDimensions.height : this._sliderDimensions.width;
                var pixelsPerStep = trackSize * this.step / (this.max - this.min);
                var stepsPerTick = Math.ceil(MIN_AUTO_TICK_SEPARATION / pixelsPerStep);
                var pixelsPerTick = stepsPerTick * this.step;
                this._tickIntervalPercent = pixelsPerTick / trackSize;
            }
            else {
                this._tickIntervalPercent = this.tickInterval * this.step / (this.max - this.min);
            }
        };
        /** Creates a slider change object from the specified value. */
        MatSlider.prototype._createChangeEvent = function (value) {
            if (value === void 0) { value = this.value; }
            var event = new MatSliderChange();
            event.source = this;
            event.value = value;
            return event;
        };
        /** Calculates the percentage of the slider that a value is. */
        MatSlider.prototype._calculatePercentage = function (value) {
            return ((value || 0) - this.min) / (this.max - this.min);
        };
        /** Calculates the value a percentage of the slider corresponds to. */
        MatSlider.prototype._calculateValue = function (percentage) {
            return this.min + percentage * (this.max - this.min);
        };
        /** Return a number between two numbers. */
        MatSlider.prototype._clamp = function (value, min, max) {
            if (min === void 0) { min = 0; }
            if (max === void 0) { max = 1; }
            return Math.max(min, Math.min(value, max));
        };
        /**
         * Get the bounding client rect of the slider track element.
         * The track is used rather than the native element to ignore the extra space that the thumb can
         * take up.
         */
        MatSlider.prototype._getSliderDimensions = function () {
            return this._sliderWrapper ? this._sliderWrapper.nativeElement.getBoundingClientRect() : null;
        };
        /**
         * Focuses the native element.
         * Currently only used to allow a blur event to fire but will be used with keyboard input later.
         */
        MatSlider.prototype._focusHostElement = function (options) {
            this._elementRef.nativeElement.focus(options);
        };
        /** Blurs the native element. */
        MatSlider.prototype._blurHostElement = function () {
            this._elementRef.nativeElement.blur();
        };
        /**
         * Sets the model value. Implemented as part of ControlValueAccessor.
         * @param value
         */
        MatSlider.prototype.writeValue = function (value) {
            this.value = value;
        };
        /**
         * Registers a callback to be triggered when the value has changed.
         * Implemented as part of ControlValueAccessor.
         * @param fn Callback to be registered.
         */
        MatSlider.prototype.registerOnChange = function (fn) {
            this._controlValueAccessorChangeFn = fn;
        };
        /**
         * Registers a callback to be triggered when the component is touched.
         * Implemented as part of ControlValueAccessor.
         * @param fn Callback to be registered.
         */
        MatSlider.prototype.registerOnTouched = function (fn) {
            this.onTouched = fn;
        };
        /**
         * Sets whether the component should be disabled.
         * Implemented as part of ControlValueAccessor.
         * @param isDisabled
         */
        MatSlider.prototype.setDisabledState = function (isDisabled) {
            this.disabled = isDisabled;
        };
        return MatSlider;
    }(_MatSliderMixinBase));
    MatSlider.decorators = [
        { type: core.Component, args: [{
                    selector: 'mat-slider',
                    exportAs: 'matSlider',
                    providers: [MAT_SLIDER_VALUE_ACCESSOR],
                    host: {
                        '(focus)': '_onFocus()',
                        '(blur)': '_onBlur()',
                        '(keydown)': '_onKeydown($event)',
                        '(keyup)': '_onKeyup()',
                        '(mouseenter)': '_onMouseenter()',
                        // On Safari starting to slide temporarily triggers text selection mode which
                        // show the wrong cursor. We prevent it by stopping the `selectstart` event.
                        '(selectstart)': '$event.preventDefault()',
                        'class': 'mat-slider mat-focus-indicator',
                        'role': 'slider',
                        '[tabIndex]': 'tabIndex',
                        '[attr.aria-disabled]': 'disabled',
                        '[attr.aria-valuemax]': 'max',
                        '[attr.aria-valuemin]': 'min',
                        '[attr.aria-valuenow]': 'value',
                        // NVDA and Jaws appear to announce the `aria-valuenow` by calculating its percentage based
                        // on its value between `aria-valuemin` and `aria-valuemax`. Due to how decimals are handled,
                        // it can cause the slider to read out a very long value like 0.20000068 if the current value
                        // is 0.2 with a min of 0 and max of 1. We work around the issue by setting `aria-valuetext`
                        // to the same value that we set on the slider's thumb which will be truncated.
                        '[attr.aria-valuetext]': 'valueText == null ? displayValue : valueText',
                        '[attr.aria-orientation]': 'vertical ? "vertical" : "horizontal"',
                        '[class.mat-slider-disabled]': 'disabled',
                        '[class.mat-slider-has-ticks]': 'tickInterval',
                        '[class.mat-slider-horizontal]': '!vertical',
                        '[class.mat-slider-axis-inverted]': '_shouldInvertAxis()',
                        // Class binding which is only used by the test harness as there is no other
                        // way for the harness to detect if mouse coordinates need to be inverted.
                        '[class.mat-slider-invert-mouse-coords]': '_shouldInvertMouseCoords()',
                        '[class.mat-slider-sliding]': '_isSliding',
                        '[class.mat-slider-thumb-label-showing]': 'thumbLabel',
                        '[class.mat-slider-vertical]': 'vertical',
                        '[class.mat-slider-min-value]': '_isMinValue()',
                        '[class.mat-slider-hide-last-tick]': 'disabled || _isMinValue() && _getThumbGap() && _shouldInvertAxis()',
                        '[class._mat-animation-noopable]': '_animationMode === "NoopAnimations"',
                    },
                    template: "<div class=\"mat-slider-wrapper\" #sliderWrapper>\n  <div class=\"mat-slider-track-wrapper\">\n    <div class=\"mat-slider-track-background\" [ngStyle]=\"_getTrackBackgroundStyles()\"></div>\n    <div class=\"mat-slider-track-fill\" [ngStyle]=\"_getTrackFillStyles()\"></div>\n  </div>\n  <div class=\"mat-slider-ticks-container\" [ngStyle]=\"_getTicksContainerStyles()\">\n    <div class=\"mat-slider-ticks\" [ngStyle]=\"_getTicksStyles()\"></div>\n  </div>\n  <div class=\"mat-slider-thumb-container\" [ngStyle]=\"_getThumbContainerStyles()\">\n    <div class=\"mat-slider-focus-ring\"></div>\n    <div class=\"mat-slider-thumb\"></div>\n    <div class=\"mat-slider-thumb-label\">\n      <span class=\"mat-slider-thumb-label-text\">{{displayValue}}</span>\n    </div>\n  </div>\n</div>\n",
                    inputs: ['disabled', 'color', 'tabIndex'],
                    encapsulation: core.ViewEncapsulation.None,
                    changeDetection: core.ChangeDetectionStrategy.OnPush,
                    styles: [".mat-slider{display:inline-block;position:relative;box-sizing:border-box;padding:8px;outline:none;vertical-align:middle}.mat-slider:not(.mat-slider-disabled):active,.mat-slider.mat-slider-sliding:not(.mat-slider-disabled){cursor:-webkit-grabbing;cursor:grabbing}.mat-slider-wrapper{position:absolute;-webkit-print-color-adjust:exact;color-adjust:exact}.mat-slider-track-wrapper{position:absolute;top:0;left:0;overflow:hidden}.mat-slider-track-fill{position:absolute;transform-origin:0 0;transition:transform 400ms cubic-bezier(0.25, 0.8, 0.25, 1),background-color 400ms cubic-bezier(0.25, 0.8, 0.25, 1)}.mat-slider-track-background{position:absolute;transform-origin:100% 100%;transition:transform 400ms cubic-bezier(0.25, 0.8, 0.25, 1),background-color 400ms cubic-bezier(0.25, 0.8, 0.25, 1)}.mat-slider-ticks-container{position:absolute;left:0;top:0;overflow:hidden}.mat-slider-ticks{background-repeat:repeat;background-clip:content-box;box-sizing:border-box;opacity:0;transition:opacity 400ms cubic-bezier(0.25, 0.8, 0.25, 1)}.mat-slider-thumb-container{position:absolute;z-index:1;transition:transform 400ms cubic-bezier(0.25, 0.8, 0.25, 1)}.mat-slider-focus-ring{position:absolute;width:30px;height:30px;border-radius:50%;transform:scale(0);opacity:0;transition:transform 400ms cubic-bezier(0.25, 0.8, 0.25, 1),background-color 400ms cubic-bezier(0.25, 0.8, 0.25, 1),opacity 400ms cubic-bezier(0.25, 0.8, 0.25, 1)}.mat-slider.cdk-keyboard-focused .mat-slider-focus-ring,.mat-slider.cdk-program-focused .mat-slider-focus-ring{transform:scale(1);opacity:1}.mat-slider:not(.mat-slider-disabled):not(.mat-slider-sliding) .mat-slider-thumb-label,.mat-slider:not(.mat-slider-disabled):not(.mat-slider-sliding) .mat-slider-thumb{cursor:-webkit-grab;cursor:grab}.mat-slider-thumb{position:absolute;right:-10px;bottom:-10px;box-sizing:border-box;width:20px;height:20px;border:3px solid transparent;border-radius:50%;transform:scale(0.7);transition:transform 400ms cubic-bezier(0.25, 0.8, 0.25, 1),background-color 400ms cubic-bezier(0.25, 0.8, 0.25, 1),border-color 400ms cubic-bezier(0.25, 0.8, 0.25, 1)}.mat-slider-thumb-label{display:none;align-items:center;justify-content:center;position:absolute;width:28px;height:28px;border-radius:50%;transition:transform 400ms cubic-bezier(0.25, 0.8, 0.25, 1),border-radius 400ms cubic-bezier(0.25, 0.8, 0.25, 1),background-color 400ms cubic-bezier(0.25, 0.8, 0.25, 1)}.cdk-high-contrast-active .mat-slider-thumb-label{outline:solid 1px}.mat-slider-thumb-label-text{z-index:1;opacity:0;transition:opacity 400ms cubic-bezier(0.25, 0.8, 0.25, 1)}.mat-slider-sliding .mat-slider-track-fill,.mat-slider-sliding .mat-slider-track-background,.mat-slider-sliding .mat-slider-thumb-container{transition-duration:0ms}.mat-slider-has-ticks .mat-slider-wrapper::after{content:\"\";position:absolute;border-width:0;border-style:solid;opacity:0;transition:opacity 400ms cubic-bezier(0.25, 0.8, 0.25, 1)}.mat-slider-has-ticks.cdk-focused:not(.mat-slider-hide-last-tick) .mat-slider-wrapper::after,.mat-slider-has-ticks:hover:not(.mat-slider-hide-last-tick) .mat-slider-wrapper::after{opacity:1}.mat-slider-has-ticks.cdk-focused:not(.mat-slider-disabled) .mat-slider-ticks,.mat-slider-has-ticks:hover:not(.mat-slider-disabled) .mat-slider-ticks{opacity:1}.mat-slider-thumb-label-showing .mat-slider-focus-ring{display:none}.mat-slider-thumb-label-showing .mat-slider-thumb-label{display:flex}.mat-slider-axis-inverted .mat-slider-track-fill{transform-origin:100% 100%}.mat-slider-axis-inverted .mat-slider-track-background{transform-origin:0 0}.mat-slider:not(.mat-slider-disabled).cdk-focused.mat-slider-thumb-label-showing .mat-slider-thumb{transform:scale(0)}.mat-slider:not(.mat-slider-disabled).cdk-focused .mat-slider-thumb-label{border-radius:50% 50% 0}.mat-slider:not(.mat-slider-disabled).cdk-focused .mat-slider-thumb-label-text{opacity:1}.mat-slider:not(.mat-slider-disabled).cdk-mouse-focused .mat-slider-thumb,.mat-slider:not(.mat-slider-disabled).cdk-touch-focused .mat-slider-thumb,.mat-slider:not(.mat-slider-disabled).cdk-program-focused .mat-slider-thumb{border-width:2px;transform:scale(1)}.mat-slider-disabled .mat-slider-focus-ring{transform:scale(0);opacity:0}.mat-slider-disabled .mat-slider-thumb{border-width:4px;transform:scale(0.5)}.mat-slider-disabled .mat-slider-thumb-label{display:none}.mat-slider-horizontal{height:48px;min-width:128px}.mat-slider-horizontal .mat-slider-wrapper{height:2px;top:23px;left:8px;right:8px}.mat-slider-horizontal .mat-slider-wrapper::after{height:2px;border-left-width:2px;right:0;top:0}.mat-slider-horizontal .mat-slider-track-wrapper{height:2px;width:100%}.mat-slider-horizontal .mat-slider-track-fill{height:2px;width:100%;transform:scaleX(0)}.mat-slider-horizontal .mat-slider-track-background{height:2px;width:100%;transform:scaleX(1)}.mat-slider-horizontal .mat-slider-ticks-container{height:2px;width:100%}.cdk-high-contrast-active .mat-slider-horizontal .mat-slider-ticks-container{height:0;outline:solid 2px;top:1px}.mat-slider-horizontal .mat-slider-ticks{height:2px;width:100%}.mat-slider-horizontal .mat-slider-thumb-container{width:100%;height:0;top:50%}.mat-slider-horizontal .mat-slider-focus-ring{top:-15px;right:-15px}.mat-slider-horizontal .mat-slider-thumb-label{right:-14px;top:-40px;transform:translateY(26px) scale(0.01) rotate(45deg)}.mat-slider-horizontal .mat-slider-thumb-label-text{transform:rotate(-45deg)}.mat-slider-horizontal.cdk-focused .mat-slider-thumb-label{transform:rotate(45deg)}.cdk-high-contrast-active .mat-slider-horizontal.cdk-focused .mat-slider-thumb-label,.cdk-high-contrast-active .mat-slider-horizontal.cdk-focused .mat-slider-thumb-label-text{transform:none}.mat-slider-vertical{width:48px;min-height:128px}.mat-slider-vertical .mat-slider-wrapper{width:2px;top:8px;bottom:8px;left:23px}.mat-slider-vertical .mat-slider-wrapper::after{width:2px;border-top-width:2px;bottom:0;left:0}.mat-slider-vertical .mat-slider-track-wrapper{height:100%;width:2px}.mat-slider-vertical .mat-slider-track-fill{height:100%;width:2px;transform:scaleY(0)}.mat-slider-vertical .mat-slider-track-background{height:100%;width:2px;transform:scaleY(1)}.mat-slider-vertical .mat-slider-ticks-container{width:2px;height:100%}.cdk-high-contrast-active .mat-slider-vertical .mat-slider-ticks-container{width:0;outline:solid 2px;left:1px}.mat-slider-vertical .mat-slider-focus-ring{bottom:-15px;left:-15px}.mat-slider-vertical .mat-slider-ticks{width:2px;height:100%}.mat-slider-vertical .mat-slider-thumb-container{height:100%;width:0;left:50%}.mat-slider-vertical .mat-slider-thumb{-webkit-backface-visibility:hidden;backface-visibility:hidden}.mat-slider-vertical .mat-slider-thumb-label{bottom:-14px;left:-40px;transform:translateX(26px) scale(0.01) rotate(-45deg)}.mat-slider-vertical .mat-slider-thumb-label-text{transform:rotate(45deg)}.mat-slider-vertical.cdk-focused .mat-slider-thumb-label{transform:rotate(-45deg)}[dir=rtl] .mat-slider-wrapper::after{left:0;right:auto}[dir=rtl] .mat-slider-horizontal .mat-slider-track-fill{transform-origin:100% 100%}[dir=rtl] .mat-slider-horizontal .mat-slider-track-background{transform-origin:0 0}[dir=rtl] .mat-slider-horizontal.mat-slider-axis-inverted .mat-slider-track-fill{transform-origin:0 0}[dir=rtl] .mat-slider-horizontal.mat-slider-axis-inverted .mat-slider-track-background{transform-origin:100% 100%}.mat-slider._mat-animation-noopable .mat-slider-track-fill,.mat-slider._mat-animation-noopable .mat-slider-track-background,.mat-slider._mat-animation-noopable .mat-slider-ticks,.mat-slider._mat-animation-noopable .mat-slider-thumb-container,.mat-slider._mat-animation-noopable .mat-slider-focus-ring,.mat-slider._mat-animation-noopable .mat-slider-thumb,.mat-slider._mat-animation-noopable .mat-slider-thumb-label,.mat-slider._mat-animation-noopable .mat-slider-thumb-label-text,.mat-slider._mat-animation-noopable .mat-slider-has-ticks .mat-slider-wrapper::after{transition:none}\n"]
                },] }
    ];
    MatSlider.ctorParameters = function () { return [
        { type: core.ElementRef },
        { type: a11y.FocusMonitor },
        { type: core.ChangeDetectorRef },
        { type: bidi.Directionality, decorators: [{ type: core.Optional }] },
        { type: String, decorators: [{ type: core.Attribute, args: ['tabindex',] }] },
        { type: core.NgZone },
        { type: undefined, decorators: [{ type: core.Inject, args: [common.DOCUMENT,] }] },
        { type: String, decorators: [{ type: core.Optional }, { type: core.Inject, args: [animations.ANIMATION_MODULE_TYPE,] }] }
    ]; };
    MatSlider.propDecorators = {
        invert: [{ type: core.Input }],
        max: [{ type: core.Input }],
        min: [{ type: core.Input }],
        step: [{ type: core.Input }],
        thumbLabel: [{ type: core.Input }],
        tickInterval: [{ type: core.Input }],
        value: [{ type: core.Input }],
        displayWith: [{ type: core.Input }],
        valueText: [{ type: core.Input }],
        vertical: [{ type: core.Input }],
        change: [{ type: core.Output }],
        input: [{ type: core.Output }],
        valueChange: [{ type: core.Output }],
        _sliderWrapper: [{ type: core.ViewChild, args: ['sliderWrapper',] }]
    };
    /** Returns whether an event is a touch event. */
    function isTouchEvent(event) {
        // This function is called for every pixel that the user has dragged so we need it to be
        // as fast as possible. Since we only bind mouse events and touch events, we can assume
        // that if the event's name starts with `t`, it's a touch event.
        return event.type[0] === 't';
    }
    /** Gets the coordinates of a touch or mouse event relative to the viewport. */
    function getPointerPositionOnPage(event) {
        // `touches` will be empty for start/end events so we have to fall back to `changedTouches`.
        var point = isTouchEvent(event) ? (event.touches[0] || event.changedTouches[0]) : event;
        return { x: point.clientX, y: point.clientY };
    }

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var MatSliderModule = /** @class */ (function () {
        function MatSliderModule() {
        }
        return MatSliderModule;
    }());
    MatSliderModule.decorators = [
        { type: core.NgModule, args: [{
                    imports: [common.CommonModule, core$1.MatCommonModule],
                    exports: [MatSlider, core$1.MatCommonModule],
                    declarations: [MatSlider],
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

    exports.MAT_SLIDER_VALUE_ACCESSOR = MAT_SLIDER_VALUE_ACCESSOR;
    exports.MatSlider = MatSlider;
    exports.MatSliderChange = MatSliderChange;
    exports.MatSliderModule = MatSliderModule;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=material-slider.umd.js.map
