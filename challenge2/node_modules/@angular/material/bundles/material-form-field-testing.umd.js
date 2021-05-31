(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/material/form-field/testing/control'), require('@angular/cdk/testing'), require('@angular/material/datepicker/testing'), require('@angular/material/input/testing'), require('@angular/material/select/testing')) :
    typeof define === 'function' && define.amd ? define('@angular/material/form-field/testing', ['exports', '@angular/material/form-field/testing/control', '@angular/cdk/testing', '@angular/material/datepicker/testing', '@angular/material/input/testing', '@angular/material/select/testing'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.ng = global.ng || {}, global.ng.material = global.ng.material || {}, global.ng.material.formField = global.ng.material.formField || {}, global.ng.material.formField.testing = {}), global.ng.material.formField.testing.control, global.ng.cdk.testing, global.ng.material.datepicker.testing, global.ng.material.input.testing, global.ng.material.select.testing));
}(this, (function (exports, control, testing, testing$3, testing$1, testing$2) { 'use strict';

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

    var _MatFormFieldHarnessBase = /** @class */ (function (_super) {
        __extends(_MatFormFieldHarnessBase, _super);
        function _MatFormFieldHarnessBase() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /** Gets the label of the form-field. */
        _MatFormFieldHarnessBase.prototype.getLabel = function () {
            return __awaiter(this, void 0, void 0, function () {
                var labelEl;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this._label()];
                        case 1:
                            labelEl = _a.sent();
                            return [2 /*return*/, labelEl ? labelEl.text() : null];
                    }
                });
            });
        };
        /** Whether the form-field has errors. */
        _MatFormFieldHarnessBase.prototype.hasErrors = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.getTextErrors()];
                        case 1: return [2 /*return*/, (_a.sent()).length > 0];
                    }
                });
            });
        };
        /** Whether the form-field is disabled. */
        _MatFormFieldHarnessBase.prototype.isDisabled = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1: return [2 /*return*/, (_a.sent()).hasClass('mat-form-field-disabled')];
                    }
                });
            });
        };
        /** Whether the form-field is currently autofilled. */
        _MatFormFieldHarnessBase.prototype.isAutofilled = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1: return [2 /*return*/, (_a.sent()).hasClass('mat-form-field-autofilled')];
                    }
                });
            });
        };
        // Implementation of the "getControl" method overload signatures.
        _MatFormFieldHarnessBase.prototype.getControl = function (type) {
            return __awaiter(this, void 0, void 0, function () {
                var _a, select, input, datepickerInput, dateRangeInput;
                var _this = this;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (type) {
                                return [2 /*return*/, this.locatorForOptional(type)()];
                            }
                            return [4 /*yield*/, testing.parallel(function () { return [
                                    _this._selectControl(),
                                    _this._inputControl(),
                                    _this._datepickerInputControl(),
                                    _this._dateRangeInputControl()
                                ]; })];
                        case 1:
                            _a = __read.apply(void 0, [_b.sent(), 4]), select = _a[0], input = _a[1], datepickerInput = _a[2], dateRangeInput = _a[3];
                            // Match the datepicker inputs first since they can also have a `MatInput`.
                            return [2 /*return*/, datepickerInput || dateRangeInput || select || input];
                    }
                });
            });
        };
        /** Gets the theme color of the form-field. */
        _MatFormFieldHarnessBase.prototype.getThemeColor = function () {
            return __awaiter(this, void 0, void 0, function () {
                var hostEl, _a, isAccent, isWarn;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1:
                            hostEl = _b.sent();
                            return [4 /*yield*/, testing.parallel(function () {
                                    return [hostEl.hasClass('mat-accent'), hostEl.hasClass('mat-warn')];
                                })];
                        case 2:
                            _a = __read.apply(void 0, [_b.sent(), 2]), isAccent = _a[0], isWarn = _a[1];
                            if (isAccent) {
                                return [2 /*return*/, 'accent'];
                            }
                            else if (isWarn) {
                                return [2 /*return*/, 'warn'];
                            }
                            return [2 /*return*/, 'primary'];
                    }
                });
            });
        };
        /** Gets error messages which are currently displayed in the form-field. */
        _MatFormFieldHarnessBase.prototype.getTextErrors = function () {
            return __awaiter(this, void 0, void 0, function () {
                var errors;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this._errors()];
                        case 1:
                            errors = _a.sent();
                            return [2 /*return*/, testing.parallel(function () { return errors.map(function (e) { return e.text(); }); })];
                    }
                });
            });
        };
        /** Gets hint messages which are currently displayed in the form-field. */
        _MatFormFieldHarnessBase.prototype.getTextHints = function () {
            return __awaiter(this, void 0, void 0, function () {
                var hints;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this._hints()];
                        case 1:
                            hints = _a.sent();
                            return [2 /*return*/, testing.parallel(function () { return hints.map(function (e) { return e.text(); }); })];
                    }
                });
            });
        };
        /**
         * Gets a reference to the container element which contains all projected
         * prefixes of the form-field.
         * @deprecated Use `getPrefixText` instead.
         * @breaking-change 11.0.0
         */
        _MatFormFieldHarnessBase.prototype.getHarnessLoaderForPrefix = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this._prefixContainer()];
                });
            });
        };
        /** Gets the text inside the prefix element. */
        _MatFormFieldHarnessBase.prototype.getPrefixText = function () {
            return __awaiter(this, void 0, void 0, function () {
                var prefix;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this._prefixContainer()];
                        case 1:
                            prefix = _a.sent();
                            return [2 /*return*/, prefix ? prefix.text() : ''];
                    }
                });
            });
        };
        /**
         * Gets a reference to the container element which contains all projected
         * suffixes of the form-field.
         * @deprecated Use `getSuffixText` instead.
         * @breaking-change 11.0.0
         */
        _MatFormFieldHarnessBase.prototype.getHarnessLoaderForSuffix = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this._suffixContainer()];
                });
            });
        };
        /** Gets the text inside the suffix element. */
        _MatFormFieldHarnessBase.prototype.getSuffixText = function () {
            return __awaiter(this, void 0, void 0, function () {
                var suffix;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this._suffixContainer()];
                        case 1:
                            suffix = _a.sent();
                            return [2 /*return*/, suffix ? suffix.text() : ''];
                    }
                });
            });
        };
        /**
         * Whether the form control has been touched. Returns "null"
         * if no form control is set up.
         */
        _MatFormFieldHarnessBase.prototype.isControlTouched = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this._hasFormControl()];
                        case 1:
                            if (!(_a.sent())) {
                                return [2 /*return*/, null];
                            }
                            return [4 /*yield*/, this.host()];
                        case 2: return [2 /*return*/, (_a.sent()).hasClass('ng-touched')];
                    }
                });
            });
        };
        /**
         * Whether the form control is dirty. Returns "null"
         * if no form control is set up.
         */
        _MatFormFieldHarnessBase.prototype.isControlDirty = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this._hasFormControl()];
                        case 1:
                            if (!(_a.sent())) {
                                return [2 /*return*/, null];
                            }
                            return [4 /*yield*/, this.host()];
                        case 2: return [2 /*return*/, (_a.sent()).hasClass('ng-dirty')];
                    }
                });
            });
        };
        /**
         * Whether the form control is valid. Returns "null"
         * if no form control is set up.
         */
        _MatFormFieldHarnessBase.prototype.isControlValid = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this._hasFormControl()];
                        case 1:
                            if (!(_a.sent())) {
                                return [2 /*return*/, null];
                            }
                            return [4 /*yield*/, this.host()];
                        case 2: return [2 /*return*/, (_a.sent()).hasClass('ng-valid')];
                    }
                });
            });
        };
        /**
         * Whether the form control is pending validation. Returns "null"
         * if no form control is set up.
         */
        _MatFormFieldHarnessBase.prototype.isControlPending = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this._hasFormControl()];
                        case 1:
                            if (!(_a.sent())) {
                                return [2 /*return*/, null];
                            }
                            return [4 /*yield*/, this.host()];
                        case 2: return [2 /*return*/, (_a.sent()).hasClass('ng-pending')];
                    }
                });
            });
        };
        /** Checks whether the form-field control has set up a form control. */
        _MatFormFieldHarnessBase.prototype._hasFormControl = function () {
            return __awaiter(this, void 0, void 0, function () {
                var hostEl, _a, isTouched, isUntouched;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1:
                            hostEl = _b.sent();
                            return [4 /*yield*/, testing.parallel(function () { return [hostEl.hasClass('ng-touched'), hostEl.hasClass('ng-untouched')]; })];
                        case 2:
                            _a = __read.apply(void 0, [_b.sent(), 2]), isTouched = _a[0], isUntouched = _a[1];
                            return [2 /*return*/, isTouched || isUntouched];
                    }
                });
            });
        };
        return _MatFormFieldHarnessBase;
    }(testing.ComponentHarness));
    /** Harness for interacting with a standard Material form-field's in tests. */
    var MatFormFieldHarness = /** @class */ (function (_super) {
        __extends(MatFormFieldHarness, _super);
        function MatFormFieldHarness() {
            var _this = _super.apply(this, __spreadArray([], __read(arguments))) || this;
            _this._prefixContainer = _this.locatorForOptional('.mat-form-field-prefix');
            _this._suffixContainer = _this.locatorForOptional('.mat-form-field-suffix');
            _this._label = _this.locatorForOptional('.mat-form-field-label');
            _this._errors = _this.locatorForAll('.mat-error');
            _this._hints = _this.locatorForAll('mat-hint, .mat-hint');
            _this._inputControl = _this.locatorForOptional(testing$1.MatInputHarness);
            _this._selectControl = _this.locatorForOptional(testing$2.MatSelectHarness);
            _this._datepickerInputControl = _this.locatorForOptional(testing$3.MatDatepickerInputHarness);
            _this._dateRangeInputControl = _this.locatorForOptional(testing$3.MatDateRangeInputHarness);
            return _this;
        }
        /**
         * Gets a `HarnessPredicate` that can be used to search for a `MatFormFieldHarness` that meets
         * certain criteria.
         * @param options Options for filtering which form field instances are considered a match.
         * @return a `HarnessPredicate` configured with the given options.
         */
        MatFormFieldHarness.with = function (options) {
            var _this = this;
            if (options === void 0) { options = {}; }
            return new testing.HarnessPredicate(MatFormFieldHarness, options)
                .addOption('floatingLabelText', options.floatingLabelText, function (harness, text) { return __awaiter(_this, void 0, void 0, function () { var _a, _b; return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = (_a = testing.HarnessPredicate).stringMatches;
                        return [4 /*yield*/, harness.getLabel()];
                    case 1: return [2 /*return*/, _b.apply(_a, [_c.sent(), text])];
                }
            }); }); })
                .addOption('hasErrors', options.hasErrors, function (harness, hasErrors) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, harness.hasErrors()];
                    case 1: return [2 /*return*/, (_a.sent()) === hasErrors];
                }
            }); }); });
        };
        /** Gets the appearance of the form-field. */
        MatFormFieldHarness.prototype.getAppearance = function () {
            return __awaiter(this, void 0, void 0, function () {
                var hostClasses, appearanceMatch;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1: return [4 /*yield*/, (_a.sent()).getAttribute('class')];
                        case 2:
                            hostClasses = _a.sent();
                            if (hostClasses !== null) {
                                appearanceMatch = hostClasses.match(/mat-form-field-appearance-(legacy|standard|fill|outline)(?:$| )/);
                                if (appearanceMatch) {
                                    return [2 /*return*/, appearanceMatch[1]];
                                }
                            }
                            throw Error('Could not determine appearance of form-field.');
                    }
                });
            });
        };
        /** Whether the form-field has a label. */
        MatFormFieldHarness.prototype.hasLabel = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1: return [2 /*return*/, (_a.sent()).hasClass('mat-form-field-has-label')];
                    }
                });
            });
        };
        /** Whether the label is currently floating. */
        MatFormFieldHarness.prototype.isLabelFloating = function () {
            return __awaiter(this, void 0, void 0, function () {
                var host, _a, hasLabel, shouldFloat;
                var _this = this;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1:
                            host = _b.sent();
                            return [4 /*yield*/, testing.parallel(function () { return [
                                    _this.hasLabel(),
                                    host.hasClass('mat-form-field-should-float'),
                                ]; })];
                        case 2:
                            _a = __read.apply(void 0, [_b.sent(), 2]), hasLabel = _a[0], shouldFloat = _a[1];
                            // If there is no label, the label conceptually can never float. The `should-float` class
                            // is just always set regardless of whether the label is displayed or not.
                            return [2 /*return*/, hasLabel && shouldFloat];
                    }
                });
            });
        };
        return MatFormFieldHarness;
    }(_MatFormFieldHarnessBase));
    MatFormFieldHarness.hostSelector = '.mat-form-field';

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

    exports.MatFormFieldHarness = MatFormFieldHarness;
    exports._MatFormFieldHarnessBase = _MatFormFieldHarnessBase;
    Object.keys(control).forEach(function (k) {
        if (k !== 'default' && !exports.hasOwnProperty(k)) Object.defineProperty(exports, k, {
            enumerable: true,
            get: function () {
                return control[k];
            }
        });
    });

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=material-form-field-testing.umd.js.map
