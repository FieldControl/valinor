(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/cdk/testing'), require('@angular/material/form-field/testing/control')) :
    typeof define === 'function' && define.amd ? define('@angular/material/input/testing', ['exports', '@angular/cdk/testing', '@angular/material/form-field/testing/control'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.ng = global.ng || {}, global.ng.material = global.ng.material || {}, global.ng.material.input = global.ng.material.input || {}, global.ng.material.input.testing = {}), global.ng.cdk.testing, global.ng.material.formField.testing.control));
}(this, (function (exports, testing, control) { 'use strict';

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

    /** Harness for interacting with a standard Material inputs in tests. */
    var MatInputHarness = /** @class */ (function (_super) {
        __extends(MatInputHarness, _super);
        function MatInputHarness() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
         * Gets a `HarnessPredicate` that can be used to search for a `MatInputHarness` that meets
         * certain criteria.
         * @param options Options for filtering which input instances are considered a match.
         * @return a `HarnessPredicate` configured with the given options.
         */
        MatInputHarness.with = function (options) {
            if (options === void 0) { options = {}; }
            return new testing.HarnessPredicate(MatInputHarness, options)
                .addOption('value', options.value, function (harness, value) {
                return testing.HarnessPredicate.stringMatches(harness.getValue(), value);
            })
                .addOption('placeholder', options.placeholder, function (harness, placeholder) {
                return testing.HarnessPredicate.stringMatches(harness.getPlaceholder(), placeholder);
            });
        };
        /** Whether the input is disabled. */
        MatInputHarness.prototype.isDisabled = function () {
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
        MatInputHarness.prototype.isRequired = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1: return [2 /*return*/, (_a.sent()).getProperty('required')];
                    }
                });
            });
        };
        /** Whether the input is readonly. */
        MatInputHarness.prototype.isReadonly = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1: return [2 /*return*/, (_a.sent()).getProperty('readOnly')];
                    }
                });
            });
        };
        /** Gets the value of the input. */
        MatInputHarness.prototype.getValue = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1: return [4 /*yield*/, (_a.sent()).getProperty('value')];
                        case 2: 
                        // The "value" property of the native input is never undefined.
                        return [2 /*return*/, (_a.sent())];
                    }
                });
            });
        };
        /** Gets the name of the input. */
        MatInputHarness.prototype.getName = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1: return [4 /*yield*/, (_a.sent()).getProperty('name')];
                        case 2: 
                        // The "name" property of the native input is never undefined.
                        return [2 /*return*/, (_a.sent())];
                    }
                });
            });
        };
        /**
         * Gets the type of the input. Returns "textarea" if the input is
         * a textarea.
         */
        MatInputHarness.prototype.getType = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1: return [4 /*yield*/, (_a.sent()).getProperty('type')];
                        case 2: 
                        // The "type" property of the native input is never undefined.
                        return [2 /*return*/, (_a.sent())];
                    }
                });
            });
        };
        /** Gets the placeholder of the input. */
        MatInputHarness.prototype.getPlaceholder = function () {
            return __awaiter(this, void 0, void 0, function () {
                var host, _a, nativePlaceholder, fallback;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1:
                            host = _b.sent();
                            return [4 /*yield*/, testing.parallel(function () { return [
                                    host.getProperty('placeholder'),
                                    host.getAttribute('data-placeholder')
                                ]; })];
                        case 2:
                            _a = __read.apply(void 0, [_b.sent(), 2]), nativePlaceholder = _a[0], fallback = _a[1];
                            return [2 /*return*/, nativePlaceholder || fallback || ''];
                    }
                });
            });
        };
        /** Gets the id of the input. */
        MatInputHarness.prototype.getId = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1: return [4 /*yield*/, (_a.sent()).getProperty('id')];
                        case 2: 
                        // The input directive always assigns a unique id to the input in
                        // case no id has been explicitly specified.
                        return [2 /*return*/, (_a.sent())];
                    }
                });
            });
        };
        /**
         * Focuses the input and returns a promise that indicates when the
         * action is complete.
         */
        MatInputHarness.prototype.focus = function () {
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
        MatInputHarness.prototype.blur = function () {
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
        MatInputHarness.prototype.isFocused = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1: return [2 /*return*/, (_a.sent()).isFocused()];
                    }
                });
            });
        };
        /**
         * Sets the value of the input. The value will be set by simulating
         * keypresses that correspond to the given value.
         */
        MatInputHarness.prototype.setValue = function (newValue) {
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
                        case 4: 
                        // Some input types won't respond to key presses (e.g. `color`) so to be sure that the
                        // value is set, we also set the property after the keyboard sequence. Note that we don't
                        // want to do it before, because it can cause the value to be entered twice.
                        return [4 /*yield*/, inputEl.setInputValue(newValue)];
                        case 5:
                            // Some input types won't respond to key presses (e.g. `color`) so to be sure that the
                            // value is set, we also set the property after the keyboard sequence. Note that we don't
                            // want to do it before, because it can cause the value to be entered twice.
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        return MatInputHarness;
    }(control.MatFormFieldControlHarness));
    // TODO: We do not want to handle `select` elements with `matNativeControl` because
    // not all methods of this harness work reasonably for native select elements.
    // For more details. See: https://github.com/angular/components/pull/18221.
    MatInputHarness.hostSelector = '[matInput], input[matNativeControl], textarea[matNativeControl]';

    /** Harness for interacting with a native `option` in tests. */
    var MatNativeOptionHarness = /** @class */ (function (_super) {
        __extends(MatNativeOptionHarness, _super);
        function MatNativeOptionHarness() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
         * Gets a `HarnessPredicate` that can be used to search for a `MatNativeOptionHarness` that meets
         * certain criteria.
         * @param options Options for filtering which option instances are considered a match.
         * @return a `HarnessPredicate` configured with the given options.
         */
        MatNativeOptionHarness.with = function (options) {
            var _this = this;
            if (options === void 0) { options = {}; }
            return new testing.HarnessPredicate(MatNativeOptionHarness, options)
                .addOption('text', options.text, function (harness, title) { return __awaiter(_this, void 0, void 0, function () { var _a, _b; return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = (_a = testing.HarnessPredicate).stringMatches;
                        return [4 /*yield*/, harness.getText()];
                    case 1: return [2 /*return*/, _b.apply(_a, [_c.sent(), title])];
                }
            }); }); })
                .addOption('index', options.index, function (harness, index) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, harness.getIndex()];
                    case 1: return [2 /*return*/, (_a.sent()) === index];
                }
            }); }); })
                .addOption('isSelected', options.isSelected, function (harness, isSelected) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, harness.isSelected()];
                    case 1: return [2 /*return*/, (_a.sent()) === isSelected];
                }
            }); }); });
        };
        /** Gets the option's label text. */
        MatNativeOptionHarness.prototype.getText = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1: return [2 /*return*/, (_a.sent()).getProperty('label')];
                    }
                });
            });
        };
        /** Index of the option within the native `select` element. */
        MatNativeOptionHarness.prototype.getIndex = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1: return [2 /*return*/, (_a.sent()).getProperty('index')];
                    }
                });
            });
        };
        /** Gets whether the option is disabled. */
        MatNativeOptionHarness.prototype.isDisabled = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1: return [2 /*return*/, (_a.sent()).getProperty('disabled')];
                    }
                });
            });
        };
        /** Gets whether the option is selected. */
        MatNativeOptionHarness.prototype.isSelected = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1: return [2 /*return*/, (_a.sent()).getProperty('selected')];
                    }
                });
            });
        };
        return MatNativeOptionHarness;
    }(testing.ComponentHarness));
    /** Selector used to locate option instances. */
    MatNativeOptionHarness.hostSelector = 'select[matNativeControl] option';

    /** Harness for interacting with a native `select` in tests. */
    var MatNativeSelectHarness = /** @class */ (function (_super) {
        __extends(MatNativeSelectHarness, _super);
        function MatNativeSelectHarness() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
         * Gets a `HarnessPredicate` that can be used to search for a `MatNativeSelectHarness` that meets
         * certain criteria.
         * @param options Options for filtering which select instances are considered a match.
         * @return a `HarnessPredicate` configured with the given options.
         */
        MatNativeSelectHarness.with = function (options) {
            if (options === void 0) { options = {}; }
            return new testing.HarnessPredicate(MatNativeSelectHarness, options);
        };
        /** Gets a boolean promise indicating if the select is disabled. */
        MatNativeSelectHarness.prototype.isDisabled = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1: return [2 /*return*/, (_a.sent()).getProperty('disabled')];
                    }
                });
            });
        };
        /** Gets a boolean promise indicating if the select is required. */
        MatNativeSelectHarness.prototype.isRequired = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1: return [2 /*return*/, (_a.sent()).getProperty('required')];
                    }
                });
            });
        };
        /** Gets a boolean promise indicating if the select is in multi-selection mode. */
        MatNativeSelectHarness.prototype.isMultiple = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1: return [2 /*return*/, (_a.sent()).getProperty('multiple')];
                    }
                });
            });
        };
        /** Gets the name of the select. */
        MatNativeSelectHarness.prototype.getName = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1: return [4 /*yield*/, (_a.sent()).getProperty('name')];
                        case 2: 
                        // The "name" property of the native select is never undefined.
                        return [2 /*return*/, (_a.sent())];
                    }
                });
            });
        };
        /** Gets the id of the select. */
        MatNativeSelectHarness.prototype.getId = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1: return [4 /*yield*/, (_a.sent()).getProperty('id')];
                        case 2: 
                        // We're guaranteed to have an id, because the `matNativeControl` always assigns one.
                        return [2 /*return*/, (_a.sent())];
                    }
                });
            });
        };
        /** Focuses the select and returns a void promise that indicates when the action is complete. */
        MatNativeSelectHarness.prototype.focus = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1: return [2 /*return*/, (_a.sent()).focus()];
                    }
                });
            });
        };
        /** Blurs the select and returns a void promise that indicates when the action is complete. */
        MatNativeSelectHarness.prototype.blur = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1: return [2 /*return*/, (_a.sent()).blur()];
                    }
                });
            });
        };
        /** Whether the select is focused. */
        MatNativeSelectHarness.prototype.isFocused = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1: return [2 /*return*/, (_a.sent()).isFocused()];
                    }
                });
            });
        };
        /** Gets the options inside the select panel. */
        MatNativeSelectHarness.prototype.getOptions = function (filter) {
            if (filter === void 0) { filter = {}; }
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.locatorForAll(MatNativeOptionHarness.with(filter))()];
                });
            });
        };
        /**
         * Selects the options that match the passed-in filter. If the select is in multi-selection
         * mode all options will be clicked, otherwise the harness will pick the first matching option.
         */
        MatNativeSelectHarness.prototype.selectOptions = function (filter) {
            if (filter === void 0) { filter = {}; }
            return __awaiter(this, void 0, void 0, function () {
                var _a, isMultiple, options, _b, host, optionIndexes;
                var _this = this;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0: return [4 /*yield*/, testing.parallel(function () {
                                return [_this.isMultiple(), _this.getOptions(filter)];
                            })];
                        case 1:
                            _a = __read.apply(void 0, [_c.sent(), 2]), isMultiple = _a[0], options = _a[1];
                            if (options.length === 0) {
                                throw Error('Select does not have options matching the specified filter');
                            }
                            return [4 /*yield*/, testing.parallel(function () { return [
                                    _this.host(),
                                    testing.parallel(function () { return options.slice(0, isMultiple ? undefined : 1).map(function (option) { return option.getIndex(); }); })
                                ]; })];
                        case 2:
                            _b = __read.apply(void 0, [_c.sent(), 2]), host = _b[0], optionIndexes = _b[1];
                            return [4 /*yield*/, host.selectOptions.apply(host, __spreadArray([], __read(optionIndexes)))];
                        case 3:
                            _c.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        return MatNativeSelectHarness;
    }(control.MatFormFieldControlHarness));
    MatNativeSelectHarness.hostSelector = 'select[matNativeControl]';

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

    exports.MatInputHarness = MatInputHarness;
    exports.MatNativeOptionHarness = MatNativeOptionHarness;
    exports.MatNativeSelectHarness = MatNativeSelectHarness;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=material-input-testing.umd.js.map
