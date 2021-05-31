(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/cdk/testing')) :
    typeof define === 'function' && define.amd ? define('@angular/material/chips/testing', ['exports', '@angular/cdk/testing'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.ng = global.ng || {}, global.ng.material = global.ng.material || {}, global.ng.material.chips = global.ng.material.chips || {}, global.ng.material.chips.testing = {}), global.ng.cdk.testing));
}(this, (function (exports, testing) { 'use strict';

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

    /** Harness for interacting with a standard Material chip remove button in tests. */
    var MatChipRemoveHarness = /** @class */ (function (_super) {
        __extends(MatChipRemoveHarness, _super);
        function MatChipRemoveHarness() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
         * Gets a `HarnessPredicate` that can be used to search for a `MatChipRemoveHarness` that meets
         * certain criteria.
         * @param options Options for filtering which input instances are considered a match.
         * @return a `HarnessPredicate` configured with the given options.
         */
        MatChipRemoveHarness.with = function (options) {
            if (options === void 0) { options = {}; }
            return new testing.HarnessPredicate(MatChipRemoveHarness, options);
        };
        /** Clicks the remove button. */
        MatChipRemoveHarness.prototype.click = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1: return [2 /*return*/, (_a.sent()).click()];
                    }
                });
            });
        };
        return MatChipRemoveHarness;
    }(testing.ComponentHarness));
    MatChipRemoveHarness.hostSelector = '.mat-chip-remove';

    /** Harness for interacting with a standard selectable Angular Material chip in tests. */
    var MatChipHarness = /** @class */ (function (_super) {
        __extends(MatChipHarness, _super);
        function MatChipHarness() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
         * Gets a `HarnessPredicate` that can be used to search for a `MatChipHarness` that meets
         * certain criteria.
         * @param options Options for filtering which chip instances are considered a match.
         * @return a `HarnessPredicate` configured with the given options.
         */
        MatChipHarness.with = function (options) {
            var _this = this;
            if (options === void 0) { options = {}; }
            return new testing.HarnessPredicate(MatChipHarness, options)
                .addOption('text', options.text, function (harness, label) { return testing.HarnessPredicate.stringMatches(harness.getText(), label); })
                .addOption('selected', options.selected, function (harness, selected) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, harness.isSelected()];
                    case 1: return [2 /*return*/, (_a.sent()) === selected];
                }
            }); }); });
        };
        /** Gets the text of the chip. */
        MatChipHarness.prototype.getText = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1: return [2 /*return*/, (_a.sent()).text({
                                exclude: '.mat-chip-avatar, .mat-chip-trailing-icon, .mat-icon'
                            })];
                    }
                });
            });
        };
        /**
         * Whether the chip is selected.
         * @deprecated Use `MatChipOptionHarness.isSelected` instead.
         * @breaking-change 12.0.0
         */
        MatChipHarness.prototype.isSelected = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1: return [2 /*return*/, (_a.sent()).hasClass('mat-chip-selected')];
                    }
                });
            });
        };
        /** Whether the chip is disabled. */
        MatChipHarness.prototype.isDisabled = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1: return [2 /*return*/, (_a.sent()).hasClass('mat-chip-disabled')];
                    }
                });
            });
        };
        /**
         * Selects the given chip. Only applies if it's selectable.
         * @deprecated Use `MatChipOptionHarness.select` instead.
         * @breaking-change 12.0.0
         */
        MatChipHarness.prototype.select = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.isSelected()];
                        case 1:
                            if (!!(_a.sent())) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.toggle()];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Deselects the given chip. Only applies if it's selectable.
         * @deprecated Use `MatChipOptionHarness.deselect` instead.
         * @breaking-change 12.0.0
         */
        MatChipHarness.prototype.deselect = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.isSelected()];
                        case 1:
                            if (!_a.sent()) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.toggle()];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Toggles the selected state of the given chip. Only applies if it's selectable.
         * @deprecated Use `MatChipOptionHarness.toggle` instead.
         * @breaking-change 12.0.0
         */
        MatChipHarness.prototype.toggle = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1: return [2 /*return*/, (_a.sent()).sendKeys(' ')];
                    }
                });
            });
        };
        /** Removes the given chip. Only applies if it's removable. */
        MatChipHarness.prototype.remove = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1: return [4 /*yield*/, (_a.sent()).sendKeys(testing.TestKey.DELETE)];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Gets the remove button inside of a chip.
         * @param filter Optionally filters which chips are included.
         */
        MatChipHarness.prototype.getRemoveButton = function (filter) {
            if (filter === void 0) { filter = {}; }
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.locatorFor(MatChipRemoveHarness.with(filter))()];
                });
            });
        };
        return MatChipHarness;
    }(testing.ComponentHarness));
    /** The selector for the host element of a `MatChip` instance. */
    MatChipHarness.hostSelector = '.mat-chip';

    /** Harness for interacting with a standard Material chip inputs in tests. */
    var MatChipInputHarness = /** @class */ (function (_super) {
        __extends(MatChipInputHarness, _super);
        function MatChipInputHarness() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
         * Gets a `HarnessPredicate` that can be used to search for a `MatChipInputHarness` that meets
         * certain criteria.
         * @param options Options for filtering which input instances are considered a match.
         * @return a `HarnessPredicate` configured with the given options.
         */
        MatChipInputHarness.with = function (options) {
            var _this = this;
            if (options === void 0) { options = {}; }
            return new testing.HarnessPredicate(MatChipInputHarness, options)
                .addOption('value', options.value, function (harness, value) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, harness.getValue()];
                        case 1: return [2 /*return*/, (_a.sent()) === value];
                    }
                });
            }); })
                .addOption('placeholder', options.placeholder, function (harness, placeholder) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, harness.getPlaceholder()];
                        case 1: return [2 /*return*/, (_a.sent()) === placeholder];
                    }
                });
            }); });
        };
        /** Whether the input is disabled. */
        MatChipInputHarness.prototype.isDisabled = function () {
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
        MatChipInputHarness.prototype.isRequired = function () {
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
        MatChipInputHarness.prototype.getValue = function () {
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
        /** Gets the placeholder of the input. */
        MatChipInputHarness.prototype.getPlaceholder = function () {
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
        MatChipInputHarness.prototype.focus = function () {
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
        MatChipInputHarness.prototype.blur = function () {
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
        MatChipInputHarness.prototype.isFocused = function () {
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
        MatChipInputHarness.prototype.setValue = function (newValue) {
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
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        /** Sends a chip separator key to the input element. */
        MatChipInputHarness.prototype.sendSeparatorKey = function (key) {
            return __awaiter(this, void 0, void 0, function () {
                var inputEl;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1:
                            inputEl = _a.sent();
                            return [2 /*return*/, inputEl.sendKeys(key)];
                    }
                });
            });
        };
        return MatChipInputHarness;
    }(testing.ComponentHarness));
    MatChipInputHarness.hostSelector = '.mat-chip-input';

    /** Base class for chip list harnesses. */
    var _MatChipListHarnessBase = /** @class */ (function (_super) {
        __extends(_MatChipListHarnessBase, _super);
        function _MatChipListHarnessBase() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /** Gets whether the chip list is disabled. */
        _MatChipListHarnessBase.prototype.isDisabled = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1: return [4 /*yield*/, (_a.sent()).getAttribute('aria-disabled')];
                        case 2: return [2 /*return*/, (_a.sent()) === 'true'];
                    }
                });
            });
        };
        /** Gets whether the chip list is required. */
        _MatChipListHarnessBase.prototype.isRequired = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1: return [4 /*yield*/, (_a.sent()).getAttribute('aria-required')];
                        case 2: return [2 /*return*/, (_a.sent()) === 'true'];
                    }
                });
            });
        };
        /** Gets whether the chip list is invalid. */
        _MatChipListHarnessBase.prototype.isInvalid = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1: return [4 /*yield*/, (_a.sent()).getAttribute('aria-invalid')];
                        case 2: return [2 /*return*/, (_a.sent()) === 'true'];
                    }
                });
            });
        };
        /** Gets whether the chip list is in multi selection mode. */
        _MatChipListHarnessBase.prototype.isMultiple = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1: return [4 /*yield*/, (_a.sent()).getAttribute('aria-multiselectable')];
                        case 2: return [2 /*return*/, (_a.sent()) === 'true'];
                    }
                });
            });
        };
        /** Gets whether the orientation of the chip list. */
        _MatChipListHarnessBase.prototype.getOrientation = function () {
            return __awaiter(this, void 0, void 0, function () {
                var orientation;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1: return [4 /*yield*/, (_a.sent()).getAttribute('aria-orientation')];
                        case 2:
                            orientation = _a.sent();
                            return [2 /*return*/, orientation === 'vertical' ? 'vertical' : 'horizontal'];
                    }
                });
            });
        };
        return _MatChipListHarnessBase;
    }(testing.ComponentHarness));
    /** Harness for interacting with a standard chip list in tests. */
    var MatChipListHarness = /** @class */ (function (_super) {
        __extends(MatChipListHarness, _super);
        function MatChipListHarness() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
         * Gets a `HarnessPredicate` that can be used to search for a `MatChipListHarness` that meets
         * certain criteria.
         * @param options Options for filtering which chip list instances are considered a match.
         * @return a `HarnessPredicate` configured with the given options.
         */
        MatChipListHarness.with = function (options) {
            if (options === void 0) { options = {}; }
            return new testing.HarnessPredicate(MatChipListHarness, options);
        };
        /**
         * Gets the list of chips inside the chip list.
         * @param filter Optionally filters which chips are included.
         */
        MatChipListHarness.prototype.getChips = function (filter) {
            if (filter === void 0) { filter = {}; }
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.locatorForAll(MatChipHarness.with(filter))()];
                });
            });
        };
        /**
         * Selects a chip inside the chip list.
         * @param filter An optional filter to apply to the child chips.
         *    All the chips matching the filter will be selected.
         * @deprecated Use `MatChipListboxHarness.selectChips` instead.
         * @breaking-change 12.0.0
         */
        MatChipListHarness.prototype.selectChips = function (filter) {
            if (filter === void 0) { filter = {}; }
            return __awaiter(this, void 0, void 0, function () {
                var chips;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.getChips(filter)];
                        case 1:
                            chips = _a.sent();
                            if (!chips.length) {
                                throw Error("Cannot find chip matching filter " + JSON.stringify(filter));
                            }
                            return [4 /*yield*/, testing.parallel(function () { return chips.map(function (chip) { return chip.select(); }); })];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Gets the `MatChipInput` inside the chip list.
         * @param filter Optionally filters which chip input is included.
         */
        MatChipListHarness.prototype.getInput = function (filter) {
            if (filter === void 0) { filter = {}; }
            return __awaiter(this, void 0, void 0, function () {
                var inputId;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1: return [4 /*yield*/, (_a.sent()).getAttribute('data-mat-chip-input')];
                        case 2:
                            inputId = _a.sent();
                            if (!inputId) {
                                throw Error("Chip list is not associated with an input");
                            }
                            return [2 /*return*/, this.documentRootLocatorFactory().locatorFor(MatChipInputHarness.with(Object.assign(Object.assign({}, filter), { selector: "#" + inputId })))()];
                    }
                });
            });
        };
        return MatChipListHarness;
    }(_MatChipListHarnessBase));
    /** The selector for the host element of a `MatChipList` instance. */
    MatChipListHarness.hostSelector = '.mat-chip-list';

    var MatChipOptionHarness = /** @class */ (function (_super) {
        __extends(MatChipOptionHarness, _super);
        function MatChipOptionHarness() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
         * Gets a `HarnessPredicate` that can be used to search for a `MatChipOptionHarness`
         * that meets certain criteria.
         * @param options Options for filtering which chip instances are considered a match.
         * @return a `HarnessPredicate` configured with the given options.
         */
        MatChipOptionHarness.with = function (options) {
            var _this = this;
            if (options === void 0) { options = {}; }
            return new testing.HarnessPredicate(MatChipOptionHarness, options)
                .addOption('text', options.text, function (harness, label) { return testing.HarnessPredicate.stringMatches(harness.getText(), label); })
                .addOption('selected', options.selected, function (harness, selected) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, harness.isSelected()];
                    case 1: return [2 /*return*/, (_a.sent()) === selected];
                }
            }); }); });
        };
        /** Whether the chip is selected. */
        MatChipOptionHarness.prototype.isSelected = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1: return [2 /*return*/, (_a.sent()).hasClass('mat-chip-selected')];
                    }
                });
            });
        };
        /** Selects the given chip. Only applies if it's selectable. */
        MatChipOptionHarness.prototype.select = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.isSelected()];
                        case 1:
                            if (!!(_a.sent())) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.toggle()];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        /** Deselects the given chip. Only applies if it's selectable. */
        MatChipOptionHarness.prototype.deselect = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.isSelected()];
                        case 1:
                            if (!_a.sent()) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.toggle()];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        /** Toggles the selected state of the given chip. */
        MatChipOptionHarness.prototype.toggle = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1: return [2 /*return*/, (_a.sent()).sendKeys(' ')];
                    }
                });
            });
        };
        return MatChipOptionHarness;
    }(MatChipHarness));
    /** The selector for the host element of a selectable chip instance. */
    MatChipOptionHarness.hostSelector = '.mat-chip';

    /** Harness for interacting with a standard selectable chip list in tests. */
    var MatChipListboxHarness = /** @class */ (function (_super) {
        __extends(MatChipListboxHarness, _super);
        function MatChipListboxHarness() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
         * Gets a `HarnessPredicate` that can be used to search for a `MatChipListHarness` that meets
         * certain criteria.
         * @param options Options for filtering which chip list instances are considered a match.
         * @return a `HarnessPredicate` configured with the given options.
         */
        MatChipListboxHarness.with = function (options) {
            if (options === void 0) { options = {}; }
            return new testing.HarnessPredicate(MatChipListboxHarness, options);
        };
        /**
         * Gets the list of chips inside the chip list.
         * @param filter Optionally filters which chips are included.
         */
        MatChipListboxHarness.prototype.getChips = function (filter) {
            if (filter === void 0) { filter = {}; }
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.locatorForAll(MatChipOptionHarness.with(filter))()];
                });
            });
        };
        /**
         * Selects a chip inside the chip list.
         * @param filter An optional filter to apply to the child chips.
         *    All the chips matching the filter will be selected.
         */
        MatChipListboxHarness.prototype.selectChips = function (filter) {
            if (filter === void 0) { filter = {}; }
            return __awaiter(this, void 0, void 0, function () {
                var chips;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.getChips(filter)];
                        case 1:
                            chips = _a.sent();
                            if (!chips.length) {
                                throw Error("Cannot find chip matching filter " + JSON.stringify(filter));
                            }
                            return [4 /*yield*/, testing.parallel(function () { return chips.map(function (chip) { return chip.select(); }); })];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        return MatChipListboxHarness;
    }(_MatChipListHarnessBase));
    /** The selector for the host element of a `MatChipList` instance. */
    MatChipListboxHarness.hostSelector = '.mat-chip-list';

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

    exports.MatChipHarness = MatChipHarness;
    exports.MatChipInputHarness = MatChipInputHarness;
    exports.MatChipListHarness = MatChipListHarness;
    exports.MatChipListboxHarness = MatChipListboxHarness;
    exports.MatChipOptionHarness = MatChipOptionHarness;
    exports.MatChipRemoveHarness = MatChipRemoveHarness;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=material-chips-testing.umd.js.map
