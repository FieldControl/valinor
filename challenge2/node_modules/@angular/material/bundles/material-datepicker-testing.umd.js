(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/cdk/testing'), require('@angular/material/form-field/testing/control'), require('@angular/cdk/coercion')) :
    typeof define === 'function' && define.amd ? define('@angular/material/datepicker/testing', ['exports', '@angular/cdk/testing', '@angular/material/form-field/testing/control', '@angular/cdk/coercion'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.ng = global.ng || {}, global.ng.material = global.ng.material || {}, global.ng.material.datepicker = global.ng.material.datepicker || {}, global.ng.material.datepicker.testing = {}), global.ng.cdk.testing, global.ng.material.formField.testing.control, global.ng.cdk.coercion));
}(this, (function (exports, testing, control, coercion) { 'use strict';

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

    /** Sets up the filter predicates for a datepicker input harness. */
    function getInputPredicate(type, options) {
        return new testing.HarnessPredicate(type, options)
            .addOption('value', options.value, function (harness, value) {
            return testing.HarnessPredicate.stringMatches(harness.getValue(), value);
        })
            .addOption('placeholder', options.placeholder, function (harness, placeholder) {
            return testing.HarnessPredicate.stringMatches(harness.getPlaceholder(), placeholder);
        });
    }
    /** Base class for datepicker input harnesses. */
    var MatDatepickerInputHarnessBase = /** @class */ (function (_super) {
        __extends(MatDatepickerInputHarnessBase, _super);
        function MatDatepickerInputHarnessBase() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /** Whether the input is disabled. */
        MatDatepickerInputHarnessBase.prototype.isDisabled = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1: return [2 /*return*/, (_a.sent()).getProperty('disabled')];
                    }
                });
            });
        };
        /** Whether the input is required. */
        MatDatepickerInputHarnessBase.prototype.isRequired = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1: return [2 /*return*/, (_a.sent()).getProperty('required')];
                    }
                });
            });
        };
        /** Gets the value of the input. */
        MatDatepickerInputHarnessBase.prototype.getValue = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1: return [4 /*yield*/, (_a.sent()).getProperty('value')];
                        case 2: 
                        // The "value" property of the native input is always defined.
                        return [2 /*return*/, (_a.sent())];
                    }
                });
            });
        };
        /**
         * Sets the value of the input. The value will be set by simulating
         * keypresses that correspond to the given value.
         */
        MatDatepickerInputHarnessBase.prototype.setValue = function (newValue) {
            return __awaiter(this, void 0, void 0, function () {
                var inputEl;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1:
                            inputEl = _a.sent();
                            return [4 /*yield*/, inputEl.clear()];
                        case 2:
                            _a.sent();
                            if (!newValue) return [3 /*break*/, 4];
                            return [4 /*yield*/, inputEl.sendKeys(newValue)];
                        case 3:
                            _a.sent();
                            _a.label = 4;
                        case 4: return [4 /*yield*/, inputEl.dispatchEvent('change')];
                        case 5:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /** Gets the placeholder of the input. */
        MatDatepickerInputHarnessBase.prototype.getPlaceholder = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1: return [4 /*yield*/, (_a.sent()).getProperty('placeholder')];
                        case 2: return [2 /*return*/, (_a.sent())];
                    }
                });
            });
        };
        /**
         * Focuses the input and returns a promise that indicates when the
         * action is complete.
         */
        MatDatepickerInputHarnessBase.prototype.focus = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1: return [2 /*return*/, (_a.sent()).focus()];
                    }
                });
            });
        };
        /**
         * Blurs the input and returns a promise that indicates when the
         * action is complete.
         */
        MatDatepickerInputHarnessBase.prototype.blur = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1: return [2 /*return*/, (_a.sent()).blur()];
                    }
                });
            });
        };
        /** Whether the input is focused. */
        MatDatepickerInputHarnessBase.prototype.isFocused = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1: return [2 /*return*/, (_a.sent()).isFocused()];
                    }
                });
            });
        };
        /** Gets the formatted minimum date for the input's value. */
        MatDatepickerInputHarnessBase.prototype.getMin = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1: return [2 /*return*/, (_a.sent()).getAttribute('min')];
                    }
                });
            });
        };
        /** Gets the formatted maximum date for the input's value. */
        MatDatepickerInputHarnessBase.prototype.getMax = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1: return [2 /*return*/, (_a.sent()).getAttribute('max')];
                    }
                });
            });
        };
        return MatDatepickerInputHarnessBase;
    }(control.MatFormFieldControlHarness));

    /** Harness for interacting with a standard Material calendar cell in tests. */
    var MatCalendarCellHarness = /** @class */ (function (_super) {
        __extends(MatCalendarCellHarness, _super);
        function MatCalendarCellHarness() {
            var _this = _super.apply(this, __spreadArray([], __read(arguments))) || this;
            /** Reference to the inner content element inside the cell. */
            _this._content = _this.locatorFor('.mat-calendar-body-cell-content');
            return _this;
        }
        /**
         * Gets a `HarnessPredicate` that can be used to search for a `MatCalendarCellHarness`
         * that meets certain criteria.
         * @param options Options for filtering which cell instances are considered a match.
         * @return a `HarnessPredicate` configured with the given options.
         */
        MatCalendarCellHarness.with = function (options) {
            var _this = this;
            if (options === void 0) { options = {}; }
            return new testing.HarnessPredicate(MatCalendarCellHarness, options)
                .addOption('text', options.text, function (harness, text) {
                return testing.HarnessPredicate.stringMatches(harness.getText(), text);
            })
                .addOption('selected', options.selected, function (harness, selected) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, harness.isSelected()];
                        case 1: return [2 /*return*/, (_a.sent()) === selected];
                    }
                });
            }); })
                .addOption('active', options.active, function (harness, active) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, harness.isActive()];
                        case 1: return [2 /*return*/, (_a.sent()) === active];
                    }
                });
            }); })
                .addOption('disabled', options.disabled, function (harness, disabled) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, harness.isDisabled()];
                        case 1: return [2 /*return*/, (_a.sent()) === disabled];
                    }
                });
            }); })
                .addOption('today', options.today, function (harness, today) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, harness.isToday()];
                        case 1: return [2 /*return*/, (_a.sent()) === today];
                    }
                });
            }); })
                .addOption('inRange', options.inRange, function (harness, inRange) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, harness.isInRange()];
                        case 1: return [2 /*return*/, (_a.sent()) === inRange];
                    }
                });
            }); })
                .addOption('inComparisonRange', options.inComparisonRange, function (harness, inComparisonRange) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, harness.isInComparisonRange()];
                        case 1: return [2 /*return*/, (_a.sent()) === inComparisonRange];
                    }
                });
            }); })
                .addOption('inPreviewRange', options.inPreviewRange, function (harness, inPreviewRange) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, harness.isInPreviewRange()];
                        case 1: return [2 /*return*/, (_a.sent()) === inPreviewRange];
                    }
                });
            }); });
        };
        /** Gets the text of the calendar cell. */
        MatCalendarCellHarness.prototype.getText = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this._content()];
                        case 1: return [2 /*return*/, (_a.sent()).text()];
                    }
                });
            });
        };
        /** Gets the aria-label of the calendar cell. */
        MatCalendarCellHarness.prototype.getAriaLabel = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1: 
                        // We're guaranteed for the `aria-label` to be defined
                        // since this is a private element that we control.
                        return [2 /*return*/, (_a.sent()).getAttribute('aria-label')];
                    }
                });
            });
        };
        /** Whether the cell is selected. */
        MatCalendarCellHarness.prototype.isSelected = function () {
            return __awaiter(this, void 0, void 0, function () {
                var host;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1:
                            host = _a.sent();
                            return [4 /*yield*/, host.getAttribute('aria-selected')];
                        case 2: return [2 /*return*/, (_a.sent()) === 'true'];
                    }
                });
            });
        };
        /** Whether the cell is disabled. */
        MatCalendarCellHarness.prototype.isDisabled = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this._hasState('disabled')];
                });
            });
        };
        /** Whether the cell is currently activated using keyboard navigation. */
        MatCalendarCellHarness.prototype.isActive = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this._hasState('active')];
                });
            });
        };
        /** Whether the cell represents today's date. */
        MatCalendarCellHarness.prototype.isToday = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this._content()];
                        case 1: return [2 /*return*/, (_a.sent()).hasClass('mat-calendar-body-today')];
                    }
                });
            });
        };
        /** Selects the calendar cell. Won't do anything if the cell is disabled. */
        MatCalendarCellHarness.prototype.select = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1: return [2 /*return*/, (_a.sent()).click()];
                    }
                });
            });
        };
        /** Hovers over the calendar cell. */
        MatCalendarCellHarness.prototype.hover = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1: return [2 /*return*/, (_a.sent()).hover()];
                    }
                });
            });
        };
        /** Moves the mouse away from the calendar cell. */
        MatCalendarCellHarness.prototype.mouseAway = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1: return [2 /*return*/, (_a.sent()).mouseAway()];
                    }
                });
            });
        };
        /** Focuses the calendar cell. */
        MatCalendarCellHarness.prototype.focus = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1: return [2 /*return*/, (_a.sent()).focus()];
                    }
                });
            });
        };
        /** Removes focus from the calendar cell. */
        MatCalendarCellHarness.prototype.blur = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1: return [2 /*return*/, (_a.sent()).blur()];
                    }
                });
            });
        };
        /** Whether the cell is the start of the main range. */
        MatCalendarCellHarness.prototype.isRangeStart = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this._hasState('range-start')];
                });
            });
        };
        /** Whether the cell is the end of the main range. */
        MatCalendarCellHarness.prototype.isRangeEnd = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this._hasState('range-end')];
                });
            });
        };
        /** Whether the cell is part of the main range. */
        MatCalendarCellHarness.prototype.isInRange = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this._hasState('in-range')];
                });
            });
        };
        /** Whether the cell is the start of the comparison range. */
        MatCalendarCellHarness.prototype.isComparisonRangeStart = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this._hasState('comparison-start')];
                });
            });
        };
        /** Whether the cell is the end of the comparison range. */
        MatCalendarCellHarness.prototype.isComparisonRangeEnd = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this._hasState('comparison-end')];
                });
            });
        };
        /** Whether the cell is inside of the comparison range. */
        MatCalendarCellHarness.prototype.isInComparisonRange = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this._hasState('in-comparison-range')];
                });
            });
        };
        /** Whether the cell is the start of the preview range. */
        MatCalendarCellHarness.prototype.isPreviewRangeStart = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this._hasState('preview-start')];
                });
            });
        };
        /** Whether the cell is the end of the preview range. */
        MatCalendarCellHarness.prototype.isPreviewRangeEnd = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this._hasState('preview-end')];
                });
            });
        };
        /** Whether the cell is inside of the preview range. */
        MatCalendarCellHarness.prototype.isInPreviewRange = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this._hasState('in-preview')];
                });
            });
        };
        /** Returns whether the cell has a particular CSS class-based state. */
        MatCalendarCellHarness.prototype._hasState = function (name) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1: return [2 /*return*/, (_a.sent()).hasClass("mat-calendar-body-" + name)];
                    }
                });
            });
        };
        return MatCalendarCellHarness;
    }(testing.ComponentHarness));
    MatCalendarCellHarness.hostSelector = '.mat-calendar-body-cell';

    /** Harness for interacting with a standard Material calendar in tests. */
    var MatCalendarHarness = /** @class */ (function (_super) {
        __extends(MatCalendarHarness, _super);
        function MatCalendarHarness() {
            var _this = _super.apply(this, __spreadArray([], __read(arguments))) || this;
            /** Queries for the calendar's period toggle button. */
            _this._periodButton = _this.locatorFor('.mat-calendar-period-button');
            return _this;
        }
        /**
         * Gets a `HarnessPredicate` that can be used to search for a `MatCalendarHarness`
         * that meets certain criteria.
         * @param options Options for filtering which calendar instances are considered a match.
         * @return a `HarnessPredicate` configured with the given options.
         */
        MatCalendarHarness.with = function (options) {
            if (options === void 0) { options = {}; }
            return new testing.HarnessPredicate(MatCalendarHarness, options);
        };
        /**
         * Gets a list of cells inside the calendar.
         * @param filter Optionally filters which cells are included.
         */
        MatCalendarHarness.prototype.getCells = function (filter) {
            if (filter === void 0) { filter = {}; }
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.locatorForAll(MatCalendarCellHarness.with(filter))()];
                });
            });
        };
        /** Gets the current view that is being shown inside the calendar. */
        MatCalendarHarness.prototype.getCurrentView = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.locatorForOptional('mat-multi-year-view')()];
                        case 1:
                            if (_a.sent()) {
                                return [2 /*return*/, 2 /* MULTI_YEAR */];
                            }
                            return [4 /*yield*/, this.locatorForOptional('mat-year-view')()];
                        case 2:
                            if (_a.sent()) {
                                return [2 /*return*/, 1 /* YEAR */];
                            }
                            return [2 /*return*/, 0 /* MONTH */];
                    }
                });
            });
        };
        /** Gets the label of the current calendar view. */
        MatCalendarHarness.prototype.getCurrentViewLabel = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this._periodButton()];
                        case 1: return [2 /*return*/, (_a.sent()).text()];
                    }
                });
            });
        };
        /** Changes the calendar view by clicking on the view toggle button. */
        MatCalendarHarness.prototype.changeView = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this._periodButton()];
                        case 1: return [2 /*return*/, (_a.sent()).click()];
                    }
                });
            });
        };
        /** Goes to the next page of the current view (e.g. next month when inside the month view). */
        MatCalendarHarness.prototype.next = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.locatorFor('.mat-calendar-next-button')()];
                        case 1: return [2 /*return*/, (_a.sent()).click()];
                    }
                });
            });
        };
        /**
         * Goes to the previous page of the current view
         * (e.g. previous month when inside the month view).
         */
        MatCalendarHarness.prototype.previous = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.locatorFor('.mat-calendar-previous-button')()];
                        case 1: return [2 /*return*/, (_a.sent()).click()];
                    }
                });
            });
        };
        /**
         * Selects a cell in the current calendar view.
         * @param filter An optional filter to apply to the cells. The first cell matching the filter
         *     will be selected.
         */
        MatCalendarHarness.prototype.selectCell = function (filter) {
            if (filter === void 0) { filter = {}; }
            return __awaiter(this, void 0, void 0, function () {
                var cells;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.getCells(filter)];
                        case 1:
                            cells = _a.sent();
                            if (!cells.length) {
                                throw Error("Cannot find calendar cell matching filter " + JSON.stringify(filter));
                            }
                            return [4 /*yield*/, cells[0].select()];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        return MatCalendarHarness;
    }(testing.ComponentHarness));
    MatCalendarHarness.hostSelector = '.mat-calendar';

    /** Base class for harnesses that can trigger a calendar. */
    var DatepickerTriggerHarnessBase = /** @class */ (function (_super) {
        __extends(DatepickerTriggerHarnessBase, _super);
        function DatepickerTriggerHarnessBase() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /** Opens the calendar if the trigger is enabled and it has a calendar. */
        DatepickerTriggerHarnessBase.prototype.openCalendar = function () {
            return __awaiter(this, void 0, void 0, function () {
                var _a, isDisabled, hasCalendar;
                var _this = this;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, testing.parallel(function () { return [_this.isDisabled(), _this.hasCalendar()]; })];
                        case 1:
                            _a = __read.apply(void 0, [_b.sent(), 2]), isDisabled = _a[0], hasCalendar = _a[1];
                            if (!isDisabled && hasCalendar) {
                                return [2 /*return*/, this._openCalendar()];
                            }
                            return [2 /*return*/];
                    }
                });
            });
        };
        /** Closes the calendar if it is open. */
        DatepickerTriggerHarnessBase.prototype.closeCalendar = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.isCalendarOpen()];
                        case 1:
                            if (!_a.sent()) return [3 /*break*/, 4];
                            return [4 /*yield*/, closeCalendar(getCalendarId(this.host()), this.documentRootLocatorFactory())];
                        case 2:
                            _a.sent();
                            // This is necessary so that we wait for the closing animation to finish in touch UI mode.
                            return [4 /*yield*/, this.forceStabilize()];
                        case 3:
                            // This is necessary so that we wait for the closing animation to finish in touch UI mode.
                            _a.sent();
                            _a.label = 4;
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        /** Gets whether there is a calendar associated with the trigger. */
        DatepickerTriggerHarnessBase.prototype.hasCalendar = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, getCalendarId(this.host())];
                        case 1: return [2 /*return*/, (_a.sent()) != null];
                    }
                });
            });
        };
        /**
         * Gets the `MatCalendarHarness` that is associated with the trigger.
         * @param filter Optionally filters which calendar is included.
         */
        DatepickerTriggerHarnessBase.prototype.getCalendar = function (filter) {
            if (filter === void 0) { filter = {}; }
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, getCalendar(filter, this.host(), this.documentRootLocatorFactory())];
                });
            });
        };
        return DatepickerTriggerHarnessBase;
    }(testing.ComponentHarness));
    /** Gets the ID of the calendar that a particular test element can trigger. */
    function getCalendarId(host) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, host];
                    case 1: return [2 /*return*/, (_a.sent()).getAttribute('data-mat-calendar')];
                }
            });
        });
    }
    /** Closes the calendar with a specific ID. */
    function closeCalendar(calendarId, documentLocator) {
        return __awaiter(this, void 0, void 0, function () {
            var backdropSelector, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = ".";
                        return [4 /*yield*/, calendarId];
                    case 1:
                        backdropSelector = _a + (_b.sent()) + "-backdrop";
                        return [4 /*yield*/, documentLocator.locatorFor(backdropSelector)()];
                    case 2: return [2 /*return*/, (_b.sent()).click()];
                }
            });
        });
    }
    /** Gets the test harness for a calendar associated with a particular host. */
    function getCalendar(filter, host, documentLocator) {
        return __awaiter(this, void 0, void 0, function () {
            var calendarId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, getCalendarId(host)];
                    case 1:
                        calendarId = _a.sent();
                        if (!calendarId) {
                            throw Error("Element is not associated with a calendar");
                        }
                        return [2 /*return*/, documentLocator.locatorFor(MatCalendarHarness.with(Object.assign(Object.assign({}, filter), { selector: "#" + calendarId })))()];
                }
            });
        });
    }

    /** Harness for interacting with a standard Material datepicker inputs in tests. */
    var MatDatepickerInputHarness = /** @class */ (function (_super) {
        __extends(MatDatepickerInputHarness, _super);
        function MatDatepickerInputHarness() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
         * Gets a `HarnessPredicate` that can be used to search for a `MatDatepickerInputHarness`
         * that meets certain criteria.
         * @param options Options for filtering which input instances are considered a match.
         * @return a `HarnessPredicate` configured with the given options.
         */
        MatDatepickerInputHarness.with = function (options) {
            if (options === void 0) { options = {}; }
            return getInputPredicate(MatDatepickerInputHarness, options);
        };
        /** Gets whether the calendar associated with the input is open. */
        MatDatepickerInputHarness.prototype.isCalendarOpen = function () {
            return __awaiter(this, void 0, void 0, function () {
                var host;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1:
                            host = _a.sent();
                            return [4 /*yield*/, host.getAttribute('aria-owns')];
                        case 2: return [2 /*return*/, (_a.sent()) != null];
                    }
                });
            });
        };
        /** Opens the calendar associated with the input. */
        MatDatepickerInputHarness.prototype.openCalendar = function () {
            return __awaiter(this, void 0, void 0, function () {
                var _a, isDisabled, hasCalendar, host;
                var _this = this;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, testing.parallel(function () { return [_this.isDisabled(), _this.hasCalendar()]; })];
                        case 1:
                            _a = __read.apply(void 0, [_b.sent(), 2]), isDisabled = _a[0], hasCalendar = _a[1];
                            if (!(!isDisabled && hasCalendar)) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.host()];
                        case 2:
                            host = _b.sent();
                            return [2 /*return*/, host.sendKeys({ alt: true }, testing.TestKey.DOWN_ARROW)];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        /** Closes the calendar associated with the input. */
        MatDatepickerInputHarness.prototype.closeCalendar = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.isCalendarOpen()];
                        case 1:
                            if (!_a.sent()) return [3 /*break*/, 4];
                            return [4 /*yield*/, closeCalendar(getCalendarId(this.host()), this.documentRootLocatorFactory())];
                        case 2:
                            _a.sent();
                            // This is necessary so that we wait for the closing animation to finish in touch UI mode.
                            return [4 /*yield*/, this.forceStabilize()];
                        case 3:
                            // This is necessary so that we wait for the closing animation to finish in touch UI mode.
                            _a.sent();
                            _a.label = 4;
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        /** Whether a calendar is associated with the input. */
        MatDatepickerInputHarness.prototype.hasCalendar = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, getCalendarId(this.host())];
                        case 1: return [2 /*return*/, (_a.sent()) != null];
                    }
                });
            });
        };
        /**
         * Gets the `MatCalendarHarness` that is associated with the trigger.
         * @param filter Optionally filters which calendar is included.
         */
        MatDatepickerInputHarness.prototype.getCalendar = function (filter) {
            if (filter === void 0) { filter = {}; }
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, getCalendar(filter, this.host(), this.documentRootLocatorFactory())];
                });
            });
        };
        return MatDatepickerInputHarness;
    }(MatDatepickerInputHarnessBase));
    MatDatepickerInputHarness.hostSelector = '.mat-datepicker-input';

    /** Harness for interacting with a standard Material datepicker toggle in tests. */
    var MatDatepickerToggleHarness = /** @class */ (function (_super) {
        __extends(MatDatepickerToggleHarness, _super);
        function MatDatepickerToggleHarness() {
            var _this = _super.apply(this, __spreadArray([], __read(arguments))) || this;
            /** The clickable button inside the toggle. */
            _this._button = _this.locatorFor('button');
            return _this;
        }
        /**
         * Gets a `HarnessPredicate` that can be used to search for a `MatDatepickerToggleHarness` that
         * meets certain criteria.
         * @param options Options for filtering which datepicker toggle instances are considered a match.
         * @return a `HarnessPredicate` configured with the given options.
         */
        MatDatepickerToggleHarness.with = function (options) {
            if (options === void 0) { options = {}; }
            return new testing.HarnessPredicate(MatDatepickerToggleHarness, options);
        };
        /** Gets whether the calendar associated with the toggle is open. */
        MatDatepickerToggleHarness.prototype.isCalendarOpen = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1: return [2 /*return*/, (_a.sent()).hasClass('mat-datepicker-toggle-active')];
                    }
                });
            });
        };
        /** Whether the toggle is disabled. */
        MatDatepickerToggleHarness.prototype.isDisabled = function () {
            return __awaiter(this, void 0, void 0, function () {
                var button, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this._button()];
                        case 1:
                            button = _b.sent();
                            _a = coercion.coerceBooleanProperty;
                            return [4 /*yield*/, button.getAttribute('disabled')];
                        case 2: return [2 /*return*/, _a.apply(void 0, [_b.sent()])];
                    }
                });
            });
        };
        MatDatepickerToggleHarness.prototype._openCalendar = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this._button()];
                        case 1: return [2 /*return*/, (_a.sent()).click()];
                    }
                });
            });
        };
        return MatDatepickerToggleHarness;
    }(DatepickerTriggerHarnessBase));
    MatDatepickerToggleHarness.hostSelector = '.mat-datepicker-toggle';

    /** Harness for interacting with a standard Material date range start input in tests. */
    var MatStartDateHarness = /** @class */ (function (_super) {
        __extends(MatStartDateHarness, _super);
        function MatStartDateHarness() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
         * Gets a `HarnessPredicate` that can be used to search for a `MatStartDateHarness`
         * that meets certain criteria.
         * @param options Options for filtering which input instances are considered a match.
         * @return a `HarnessPredicate` configured with the given options.
         */
        MatStartDateHarness.with = function (options) {
            if (options === void 0) { options = {}; }
            return getInputPredicate(MatStartDateHarness, options);
        };
        return MatStartDateHarness;
    }(MatDatepickerInputHarnessBase));
    MatStartDateHarness.hostSelector = '.mat-start-date';
    /** Harness for interacting with a standard Material date range end input in tests. */
    var MatEndDateHarness = /** @class */ (function (_super) {
        __extends(MatEndDateHarness, _super);
        function MatEndDateHarness() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
         * Gets a `HarnessPredicate` that can be used to search for a `MatEndDateHarness`
         * that meets certain criteria.
         * @param options Options for filtering which input instances are considered a match.
         * @return a `HarnessPredicate` configured with the given options.
         */
        MatEndDateHarness.with = function (options) {
            if (options === void 0) { options = {}; }
            return getInputPredicate(MatEndDateHarness, options);
        };
        return MatEndDateHarness;
    }(MatDatepickerInputHarnessBase));
    MatEndDateHarness.hostSelector = '.mat-end-date';
    /** Harness for interacting with a standard Material date range input in tests. */
    var MatDateRangeInputHarness = /** @class */ (function (_super) {
        __extends(MatDateRangeInputHarness, _super);
        function MatDateRangeInputHarness() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
         * Gets a `HarnessPredicate` that can be used to search for a `MatDateRangeInputHarness`
         * that meets certain criteria.
         * @param options Options for filtering which input instances are considered a match.
         * @return a `HarnessPredicate` configured with the given options.
         */
        MatDateRangeInputHarness.with = function (options) {
            if (options === void 0) { options = {}; }
            return new testing.HarnessPredicate(MatDateRangeInputHarness, options)
                .addOption('value', options.value, function (harness, value) { return testing.HarnessPredicate.stringMatches(harness.getValue(), value); });
        };
        /** Gets the combined value of the start and end inputs, including the separator. */
        MatDateRangeInputHarness.prototype.getValue = function () {
            return __awaiter(this, void 0, void 0, function () {
                var _a, start, end, separator;
                var _this = this;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, testing.parallel(function () { return [
                                _this.getStartInput().then(function (input) { return input.getValue(); }),
                                _this.getEndInput().then(function (input) { return input.getValue(); }),
                                _this.getSeparator()
                            ]; })];
                        case 1:
                            _a = __read.apply(void 0, [_b.sent(), 3]), start = _a[0], end = _a[1], separator = _a[2];
                            return [2 /*return*/, start + ("" + (end ? " " + separator + " " + end : ''))];
                    }
                });
            });
        };
        /** Gets the inner start date input inside the range input. */
        MatDateRangeInputHarness.prototype.getStartInput = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    // Don't pass in filters here since the start input is required and there can only be one.
                    return [2 /*return*/, this.locatorFor(MatStartDateHarness)()];
                });
            });
        };
        /** Gets the inner start date input inside the range input. */
        MatDateRangeInputHarness.prototype.getEndInput = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    // Don't pass in filters here since the end input is required and there can only be one.
                    return [2 /*return*/, this.locatorFor(MatEndDateHarness)()];
                });
            });
        };
        /** Gets the separator text between the values of the two inputs. */
        MatDateRangeInputHarness.prototype.getSeparator = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.locatorFor('.mat-date-range-input-separator')()];
                        case 1: return [2 /*return*/, (_a.sent()).text()];
                    }
                });
            });
        };
        /** Gets whether the range input is disabled. */
        MatDateRangeInputHarness.prototype.isDisabled = function () {
            return __awaiter(this, void 0, void 0, function () {
                var _a, startDisabled, endDisabled;
                var _this = this;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, testing.parallel(function () { return [
                                _this.getStartInput().then(function (input) { return input.isDisabled(); }),
                                _this.getEndInput().then(function (input) { return input.isDisabled(); })
                            ]; })];
                        case 1:
                            _a = __read.apply(void 0, [_b.sent(), 2]), startDisabled = _a[0], endDisabled = _a[1];
                            return [2 /*return*/, startDisabled && endDisabled];
                    }
                });
            });
        };
        /** Gets whether the range input is required. */
        MatDateRangeInputHarness.prototype.isRequired = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1: return [2 /*return*/, (_a.sent()).hasClass('mat-date-range-input-required')];
                    }
                });
            });
        };
        /** Opens the calendar associated with the input. */
        MatDateRangeInputHarness.prototype.isCalendarOpen = function () {
            return __awaiter(this, void 0, void 0, function () {
                var startHost;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.getStartInput()];
                        case 1: return [4 /*yield*/, (_a.sent()).host()];
                        case 2:
                            startHost = _a.sent();
                            return [4 /*yield*/, startHost.getAttribute('aria-owns')];
                        case 3: return [2 /*return*/, (_a.sent()) != null];
                    }
                });
            });
        };
        MatDateRangeInputHarness.prototype._openCalendar = function () {
            return __awaiter(this, void 0, void 0, function () {
                var startHost;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.getStartInput()];
                        case 1: return [4 /*yield*/, (_a.sent()).host()];
                        case 2:
                            startHost = _a.sent();
                            return [2 /*return*/, startHost.sendKeys({ alt: true }, testing.TestKey.DOWN_ARROW)];
                    }
                });
            });
        };
        return MatDateRangeInputHarness;
    }(DatepickerTriggerHarnessBase));
    MatDateRangeInputHarness.hostSelector = '.mat-date-range-input';

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */

    exports.MatCalendarCellHarness = MatCalendarCellHarness;
    exports.MatCalendarHarness = MatCalendarHarness;
    exports.MatDateRangeInputHarness = MatDateRangeInputHarness;
    exports.MatDatepickerInputHarness = MatDatepickerInputHarness;
    exports.MatDatepickerToggleHarness = MatDatepickerToggleHarness;
    exports.MatEndDateHarness = MatEndDateHarness;
    exports.MatStartDateHarness = MatStartDateHarness;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=material-datepicker-testing.umd.js.map
