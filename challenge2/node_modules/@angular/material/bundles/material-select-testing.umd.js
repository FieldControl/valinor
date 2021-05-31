(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/cdk/testing'), require('@angular/material/form-field/testing/control'), require('@angular/material/core/testing')) :
    typeof define === 'function' && define.amd ? define('@angular/material/select/testing', ['exports', '@angular/cdk/testing', '@angular/material/form-field/testing/control', '@angular/material/core/testing'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.ng = global.ng || {}, global.ng.material = global.ng.material || {}, global.ng.material.select = global.ng.material.select || {}, global.ng.material.select.testing = {}), global.ng.cdk.testing, global.ng.material.formField.testing.control, global.ng.material.core.testing));
}(this, (function (exports, testing, control, testing$1) { 'use strict';

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

    var _MatSelectHarnessBase = /** @class */ (function (_super) {
        __extends(_MatSelectHarnessBase, _super);
        function _MatSelectHarnessBase() {
            var _this = _super.apply(this, __spreadArray([], __read(arguments))) || this;
            _this._documentRootLocator = _this.documentRootLocatorFactory();
            _this._backdrop = _this._documentRootLocator.locatorFor('.cdk-overlay-backdrop');
            return _this;
        }
        /** Gets a boolean promise indicating if the select is disabled. */
        _MatSelectHarnessBase.prototype.isDisabled = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1: return [2 /*return*/, (_a.sent()).hasClass(this._prefix + "-select-disabled")];
                    }
                });
            });
        };
        /** Gets a boolean promise indicating if the select is valid. */
        _MatSelectHarnessBase.prototype.isValid = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1: return [4 /*yield*/, (_a.sent()).hasClass('ng-invalid')];
                        case 2: return [2 /*return*/, !(_a.sent())];
                    }
                });
            });
        };
        /** Gets a boolean promise indicating if the select is required. */
        _MatSelectHarnessBase.prototype.isRequired = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1: return [2 /*return*/, (_a.sent()).hasClass(this._prefix + "-select-required")];
                    }
                });
            });
        };
        /** Gets a boolean promise indicating if the select is empty (no value is selected). */
        _MatSelectHarnessBase.prototype.isEmpty = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1: return [2 /*return*/, (_a.sent()).hasClass(this._prefix + "-select-empty")];
                    }
                });
            });
        };
        /** Gets a boolean promise indicating if the select is in multi-selection mode. */
        _MatSelectHarnessBase.prototype.isMultiple = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1: return [2 /*return*/, (_a.sent()).hasClass(this._prefix + "-select-multiple")];
                    }
                });
            });
        };
        /** Gets a promise for the select's value text. */
        _MatSelectHarnessBase.prototype.getValueText = function () {
            return __awaiter(this, void 0, void 0, function () {
                var value;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.locatorFor("." + this._prefix + "-select-value")()];
                        case 1:
                            value = _a.sent();
                            return [2 /*return*/, value.text()];
                    }
                });
            });
        };
        /** Focuses the select and returns a void promise that indicates when the action is complete. */
        _MatSelectHarnessBase.prototype.focus = function () {
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
        _MatSelectHarnessBase.prototype.blur = function () {
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
        _MatSelectHarnessBase.prototype.isFocused = function () {
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
        _MatSelectHarnessBase.prototype.getOptions = function (filter) {
            return __awaiter(this, void 0, void 0, function () {
                var _a, _b, _c, _d, _e, _f, _g, _h;
                return __generator(this, function (_j) {
                    switch (_j.label) {
                        case 0:
                            _b = (_a = this._documentRootLocator).locatorForAll;
                            _d = (_c = this._optionClass).with;
                            _f = (_e = Object).assign;
                            _g = [Object.assign({}, (filter || {}))];
                            _h = {};
                            return [4 /*yield*/, this._getPanelSelector()];
                        case 1: return [2 /*return*/, _b.apply(_a, [_d.apply(_c, [_f.apply(_e, _g.concat([(_h.ancestor = _j.sent(), _h)]))])])()];
                    }
                });
            });
        };
        /** Gets the groups of options inside the panel. */
        _MatSelectHarnessBase.prototype.getOptionGroups = function (filter) {
            return __awaiter(this, void 0, void 0, function () {
                var _a, _b, _c, _d, _e, _f, _g, _h;
                return __generator(this, function (_j) {
                    switch (_j.label) {
                        case 0:
                            _b = (_a = this._documentRootLocator).locatorForAll;
                            _d = (_c = this._optionGroupClass).with;
                            _f = (_e = Object).assign;
                            _g = [Object.assign({}, (filter || {}))];
                            _h = {};
                            return [4 /*yield*/, this._getPanelSelector()];
                        case 1: return [2 /*return*/, _b.apply(_a, [_d.apply(_c, [_f.apply(_e, _g.concat([(_h.ancestor = _j.sent(), _h)]))])])()];
                    }
                });
            });
        };
        /** Gets whether the select is open. */
        _MatSelectHarnessBase.prototype.isOpen = function () {
            return __awaiter(this, void 0, void 0, function () {
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            _b = (_a = this._documentRootLocator).locatorForOptional;
                            return [4 /*yield*/, this._getPanelSelector()];
                        case 1: return [4 /*yield*/, _b.apply(_a, [_c.sent()])()];
                        case 2: return [2 /*return*/, !!(_c.sent())];
                    }
                });
            });
        };
        /** Opens the select's panel. */
        _MatSelectHarnessBase.prototype.open = function () {
            return __awaiter(this, void 0, void 0, function () {
                var trigger;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.isOpen()];
                        case 1:
                            if (!!(_a.sent())) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.locatorFor("." + this._prefix + "-select-trigger")()];
                        case 2:
                            trigger = _a.sent();
                            return [2 /*return*/, trigger.click()];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Clicks the options that match the passed-in filter. If the select is in multi-selection
         * mode all options will be clicked, otherwise the harness will pick the first matching option.
         */
        _MatSelectHarnessBase.prototype.clickOptions = function (filter) {
            return __awaiter(this, void 0, void 0, function () {
                var _a, isMultiple, options;
                var _this = this;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.open()];
                        case 1:
                            _b.sent();
                            return [4 /*yield*/, testing.parallel(function () { return [_this.isMultiple(), _this.getOptions(filter)]; })];
                        case 2:
                            _a = __read.apply(void 0, [_b.sent(), 2]), isMultiple = _a[0], options = _a[1];
                            if (options.length === 0) {
                                throw Error('Select does not have options matching the specified filter');
                            }
                            if (!isMultiple) return [3 /*break*/, 4];
                            return [4 /*yield*/, testing.parallel(function () { return options.map(function (option) { return option.click(); }); })];
                        case 3:
                            _b.sent();
                            return [3 /*break*/, 6];
                        case 4: return [4 /*yield*/, options[0].click()];
                        case 5:
                            _b.sent();
                            _b.label = 6;
                        case 6: return [2 /*return*/];
                    }
                });
            });
        };
        /** Closes the select's panel. */
        _MatSelectHarnessBase.prototype.close = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.isOpen()];
                        case 1:
                            if (!_a.sent()) return [3 /*break*/, 3];
                            return [4 /*yield*/, this._backdrop()];
                        case 2: 
                        // This is the most consistent way that works both in both single and multi-select modes,
                        // but it assumes that only one overlay is open at a time. We should be able to make it
                        // a bit more precise after #16645 where we can dispatch an ESCAPE press to the host instead.
                        return [2 /*return*/, (_a.sent()).click()];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        /** Gets the selector that should be used to find this select's panel. */
        _MatSelectHarnessBase.prototype._getPanelSelector = function () {
            return __awaiter(this, void 0, void 0, function () {
                var id;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1: return [4 /*yield*/, (_a.sent()).getAttribute('id')];
                        case 2:
                            id = _a.sent();
                            return [2 /*return*/, "#" + id + "-panel"];
                    }
                });
            });
        };
        return _MatSelectHarnessBase;
    }(control.MatFormFieldControlHarness));
    /** Harness for interacting with a standard mat-select in tests. */
    var MatSelectHarness = /** @class */ (function (_super) {
        __extends(MatSelectHarness, _super);
        function MatSelectHarness() {
            var _this = _super.apply(this, __spreadArray([], __read(arguments))) || this;
            _this._prefix = 'mat';
            _this._optionClass = testing$1.MatOptionHarness;
            _this._optionGroupClass = testing$1.MatOptgroupHarness;
            return _this;
        }
        /**
         * Gets a `HarnessPredicate` that can be used to search for a `MatSelectHarness` that meets
         * certain criteria.
         * @param options Options for filtering which select instances are considered a match.
         * @return a `HarnessPredicate` configured with the given options.
         */
        MatSelectHarness.with = function (options) {
            if (options === void 0) { options = {}; }
            return new testing.HarnessPredicate(MatSelectHarness, options);
        };
        return MatSelectHarness;
    }(_MatSelectHarnessBase));
    MatSelectHarness.hostSelector = '.mat-select';

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

    exports.MatSelectHarness = MatSelectHarness;
    exports._MatSelectHarnessBase = _MatSelectHarnessBase;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=material-select-testing.umd.js.map
