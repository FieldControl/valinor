(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/cdk/coercion'), require('@angular/cdk/testing')) :
    typeof define === 'function' && define.amd ? define('@angular/material/radio/testing', ['exports', '@angular/cdk/coercion', '@angular/cdk/testing'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.ng = global.ng || {}, global.ng.material = global.ng.material || {}, global.ng.material.radio = global.ng.material.radio || {}, global.ng.material.radio.testing = {}), global.ng.cdk.coercion, global.ng.cdk.testing));
}(this, (function (exports, coercion, testing) { 'use strict';

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

    var _MatRadioGroupHarnessBase = /** @class */ (function (_super) {
        __extends(_MatRadioGroupHarnessBase, _super);
        function _MatRadioGroupHarnessBase() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /** Gets the name of the radio-group. */
        _MatRadioGroupHarnessBase.prototype.getName = function () {
            return __awaiter(this, void 0, void 0, function () {
                var hostName, radioNames;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this._getGroupNameFromHost()];
                        case 1:
                            hostName = _a.sent();
                            // It's not possible to always determine the "name" of a radio-group by reading
                            // the attribute. This is because the radio-group does not set the "name" as an
                            // element attribute if the "name" value is set through a binding.
                            if (hostName !== null) {
                                return [2 /*return*/, hostName];
                            }
                            return [4 /*yield*/, this._getNamesFromRadioButtons()];
                        case 2:
                            radioNames = _a.sent();
                            if (!radioNames.length) {
                                return [2 /*return*/, null];
                            }
                            if (!this._checkRadioNamesInGroupEqual(radioNames)) {
                                throw Error('Radio buttons in radio-group have mismatching names.');
                            }
                            return [2 /*return*/, radioNames[0]];
                    }
                });
            });
        };
        /** Gets the id of the radio-group. */
        _MatRadioGroupHarnessBase.prototype.getId = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1: return [2 /*return*/, (_a.sent()).getProperty('id')];
                    }
                });
            });
        };
        /** Gets the checked radio-button in a radio-group. */
        _MatRadioGroupHarnessBase.prototype.getCheckedRadioButton = function () {
            return __awaiter(this, void 0, void 0, function () {
                var _a, _b, radioButton, e_1_1;
                var e_1, _c;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            _d.trys.push([0, 6, 7, 8]);
                            return [4 /*yield*/, this.getRadioButtons()];
                        case 1:
                            _a = __values.apply(void 0, [_d.sent()]), _b = _a.next();
                            _d.label = 2;
                        case 2:
                            if (!!_b.done) return [3 /*break*/, 5];
                            radioButton = _b.value;
                            return [4 /*yield*/, radioButton.isChecked()];
                        case 3:
                            if (_d.sent()) {
                                return [2 /*return*/, radioButton];
                            }
                            _d.label = 4;
                        case 4:
                            _b = _a.next();
                            return [3 /*break*/, 2];
                        case 5: return [3 /*break*/, 8];
                        case 6:
                            e_1_1 = _d.sent();
                            e_1 = { error: e_1_1 };
                            return [3 /*break*/, 8];
                        case 7:
                            try {
                                if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                            }
                            finally { if (e_1) throw e_1.error; }
                            return [7 /*endfinally*/];
                        case 8: return [2 /*return*/, null];
                    }
                });
            });
        };
        /** Gets the checked value of the radio-group. */
        _MatRadioGroupHarnessBase.prototype.getCheckedValue = function () {
            return __awaiter(this, void 0, void 0, function () {
                var checkedRadio;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.getCheckedRadioButton()];
                        case 1:
                            checkedRadio = _a.sent();
                            if (!checkedRadio) {
                                return [2 /*return*/, null];
                            }
                            return [2 /*return*/, checkedRadio.getValue()];
                    }
                });
            });
        };
        /**
         * Gets a list of radio buttons which are part of the radio-group.
         * @param filter Optionally filters which radio buttons are included.
         */
        _MatRadioGroupHarnessBase.prototype.getRadioButtons = function (filter) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.locatorForAll(this._buttonClass.with(filter))()];
                });
            });
        };
        /**
         * Checks a radio button in this group.
         * @param filter An optional filter to apply to the child radio buttons. The first tab matching
         *     the filter will be selected.
         */
        _MatRadioGroupHarnessBase.prototype.checkRadioButton = function (filter) {
            return __awaiter(this, void 0, void 0, function () {
                var radioButtons;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.getRadioButtons(filter)];
                        case 1:
                            radioButtons = _a.sent();
                            if (!radioButtons.length) {
                                throw Error("Could not find radio button matching " + JSON.stringify(filter));
                            }
                            return [2 /*return*/, radioButtons[0].check()];
                    }
                });
            });
        };
        /** Gets the name attribute of the host element. */
        _MatRadioGroupHarnessBase.prototype._getGroupNameFromHost = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1: return [2 /*return*/, (_a.sent()).getAttribute('name')];
                    }
                });
            });
        };
        /** Gets a list of the name attributes of all child radio buttons. */
        _MatRadioGroupHarnessBase.prototype._getNamesFromRadioButtons = function () {
            return __awaiter(this, void 0, void 0, function () {
                var groupNames, _a, _b, radio, radioName, e_2_1;
                var e_2, _c;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            groupNames = [];
                            _d.label = 1;
                        case 1:
                            _d.trys.push([1, 7, 8, 9]);
                            return [4 /*yield*/, this.getRadioButtons()];
                        case 2:
                            _a = __values.apply(void 0, [_d.sent()]), _b = _a.next();
                            _d.label = 3;
                        case 3:
                            if (!!_b.done) return [3 /*break*/, 6];
                            radio = _b.value;
                            return [4 /*yield*/, radio.getName()];
                        case 4:
                            radioName = _d.sent();
                            if (radioName !== null) {
                                groupNames.push(radioName);
                            }
                            _d.label = 5;
                        case 5:
                            _b = _a.next();
                            return [3 /*break*/, 3];
                        case 6: return [3 /*break*/, 9];
                        case 7:
                            e_2_1 = _d.sent();
                            e_2 = { error: e_2_1 };
                            return [3 /*break*/, 9];
                        case 8:
                            try {
                                if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                            }
                            finally { if (e_2) throw e_2.error; }
                            return [7 /*endfinally*/];
                        case 9: return [2 /*return*/, groupNames];
                    }
                });
            });
        };
        /** Checks if the specified radio names are all equal. */
        _MatRadioGroupHarnessBase.prototype._checkRadioNamesInGroupEqual = function (radioNames) {
            var e_3, _a;
            var groupName = null;
            try {
                for (var radioNames_1 = __values(radioNames), radioNames_1_1 = radioNames_1.next(); !radioNames_1_1.done; radioNames_1_1 = radioNames_1.next()) {
                    var radioName = radioNames_1_1.value;
                    if (groupName === null) {
                        groupName = radioName;
                    }
                    else if (groupName !== radioName) {
                        return false;
                    }
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (radioNames_1_1 && !radioNames_1_1.done && (_a = radioNames_1.return)) _a.call(radioNames_1);
                }
                finally { if (e_3) throw e_3.error; }
            }
            return true;
        };
        /**
         * Checks if a radio-group harness has the given name. Throws if a radio-group with
         * matching name could be found but has mismatching radio-button names.
         */
        _MatRadioGroupHarnessBase._checkRadioGroupName = function (harness, name) {
            return __awaiter(this, void 0, void 0, function () {
                var radioNames;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, harness._getGroupNameFromHost()];
                        case 1:
                            // Check if there is a radio-group which has the "name" attribute set
                            // to the expected group name. It's not possible to always determine
                            // the "name" of a radio-group by reading the attribute. This is because
                            // the radio-group does not set the "name" as an element attribute if the
                            // "name" value is set through a binding.
                            if ((_a.sent()) === name) {
                                return [2 /*return*/, true];
                            }
                            return [4 /*yield*/, harness._getNamesFromRadioButtons()];
                        case 2:
                            radioNames = _a.sent();
                            if (radioNames.indexOf(name) === -1) {
                                return [2 /*return*/, false];
                            }
                            if (!harness._checkRadioNamesInGroupEqual(radioNames)) {
                                throw Error("The locator found a radio-group with name \"" + name + "\", but some " +
                                    "radio-button's within the group have mismatching names, which is invalid.");
                            }
                            return [2 /*return*/, true];
                    }
                });
            });
        };
        return _MatRadioGroupHarnessBase;
    }(testing.ComponentHarness));
    /** Harness for interacting with a standard mat-radio-group in tests. */
    var MatRadioGroupHarness = /** @class */ (function (_super) {
        __extends(MatRadioGroupHarness, _super);
        function MatRadioGroupHarness() {
            var _this = _super.apply(this, __spreadArray([], __read(arguments))) || this;
            _this._buttonClass = MatRadioButtonHarness;
            return _this;
        }
        /**
         * Gets a `HarnessPredicate` that can be used to search for a `MatRadioGroupHarness` that meets
         * certain criteria.
         * @param options Options for filtering which radio group instances are considered a match.
         * @return a `HarnessPredicate` configured with the given options.
         */
        MatRadioGroupHarness.with = function (options) {
            if (options === void 0) { options = {}; }
            return new testing.HarnessPredicate(MatRadioGroupHarness, options)
                .addOption('name', options.name, this._checkRadioGroupName);
        };
        return MatRadioGroupHarness;
    }(_MatRadioGroupHarnessBase));
    /** The selector for the host element of a `MatRadioGroup` instance. */
    MatRadioGroupHarness.hostSelector = '.mat-radio-group';
    var _MatRadioButtonHarnessBase = /** @class */ (function (_super) {
        __extends(_MatRadioButtonHarnessBase, _super);
        function _MatRadioButtonHarnessBase() {
            var _this = _super.apply(this, __spreadArray([], __read(arguments))) || this;
            _this._input = _this.locatorFor('input');
            return _this;
        }
        /** Whether the radio-button is checked. */
        _MatRadioButtonHarnessBase.prototype.isChecked = function () {
            return __awaiter(this, void 0, void 0, function () {
                var checked, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this._input()];
                        case 1:
                            checked = (_b.sent()).getProperty('checked');
                            _a = coercion.coerceBooleanProperty;
                            return [4 /*yield*/, checked];
                        case 2: return [2 /*return*/, _a.apply(void 0, [_b.sent()])];
                    }
                });
            });
        };
        /** Whether the radio-button is disabled. */
        _MatRadioButtonHarnessBase.prototype.isDisabled = function () {
            return __awaiter(this, void 0, void 0, function () {
                var disabled, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this._input()];
                        case 1:
                            disabled = (_b.sent()).getAttribute('disabled');
                            _a = coercion.coerceBooleanProperty;
                            return [4 /*yield*/, disabled];
                        case 2: return [2 /*return*/, _a.apply(void 0, [_b.sent()])];
                    }
                });
            });
        };
        /** Whether the radio-button is required. */
        _MatRadioButtonHarnessBase.prototype.isRequired = function () {
            return __awaiter(this, void 0, void 0, function () {
                var required, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this._input()];
                        case 1:
                            required = (_b.sent()).getAttribute('required');
                            _a = coercion.coerceBooleanProperty;
                            return [4 /*yield*/, required];
                        case 2: return [2 /*return*/, _a.apply(void 0, [_b.sent()])];
                    }
                });
            });
        };
        /** Gets the radio-button's name. */
        _MatRadioButtonHarnessBase.prototype.getName = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this._input()];
                        case 1: return [2 /*return*/, (_a.sent()).getAttribute('name')];
                    }
                });
            });
        };
        /** Gets the radio-button's id. */
        _MatRadioButtonHarnessBase.prototype.getId = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1: return [2 /*return*/, (_a.sent()).getProperty('id')];
                    }
                });
            });
        };
        /**
         * Gets the value of the radio-button. The radio-button value will be converted to a string.
         *
         * Note: This means that for radio-button's with an object as a value `[object Object]` is
         * intentionally returned.
         */
        _MatRadioButtonHarnessBase.prototype.getValue = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this._input()];
                        case 1: return [2 /*return*/, (_a.sent()).getProperty('value')];
                    }
                });
            });
        };
        /** Gets the radio-button's label text. */
        _MatRadioButtonHarnessBase.prototype.getLabelText = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this._textLabel()];
                        case 1: return [2 /*return*/, (_a.sent()).text()];
                    }
                });
            });
        };
        /** Focuses the radio-button. */
        _MatRadioButtonHarnessBase.prototype.focus = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this._input()];
                        case 1: return [2 /*return*/, (_a.sent()).focus()];
                    }
                });
            });
        };
        /** Blurs the radio-button. */
        _MatRadioButtonHarnessBase.prototype.blur = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this._input()];
                        case 1: return [2 /*return*/, (_a.sent()).blur()];
                    }
                });
            });
        };
        /** Whether the radio-button is focused. */
        _MatRadioButtonHarnessBase.prototype.isFocused = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this._input()];
                        case 1: return [2 /*return*/, (_a.sent()).isFocused()];
                    }
                });
            });
        };
        /**
         * Puts the radio-button in a checked state by clicking it if it is currently unchecked,
         * or doing nothing if it is already checked.
         */
        _MatRadioButtonHarnessBase.prototype.check = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.isChecked()];
                        case 1:
                            if (!!(_a.sent())) return [3 /*break*/, 3];
                            return [4 /*yield*/, this._clickLabel()];
                        case 2: return [2 /*return*/, (_a.sent()).click()];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        return _MatRadioButtonHarnessBase;
    }(testing.ComponentHarness));
    /** Harness for interacting with a standard mat-radio-button in tests. */
    var MatRadioButtonHarness = /** @class */ (function (_super) {
        __extends(MatRadioButtonHarness, _super);
        function MatRadioButtonHarness() {
            var _this = _super.apply(this, __spreadArray([], __read(arguments))) || this;
            _this._textLabel = _this.locatorFor('.mat-radio-label-content');
            _this._clickLabel = _this.locatorFor('.mat-radio-label');
            return _this;
        }
        /**
         * Gets a `HarnessPredicate` that can be used to search for a `MatRadioButtonHarness` that meets
         * certain criteria.
         * @param options Options for filtering which radio button instances are considered a match.
         * @return a `HarnessPredicate` configured with the given options.
         */
        MatRadioButtonHarness.with = function (options) {
            var _this = this;
            if (options === void 0) { options = {}; }
            return new testing.HarnessPredicate(MatRadioButtonHarness, options)
                .addOption('label', options.label, function (harness, label) { return testing.HarnessPredicate.stringMatches(harness.getLabelText(), label); })
                .addOption('name', options.name, function (harness, name) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, harness.getName()];
                    case 1: return [2 /*return*/, (_a.sent()) === name];
                }
            }); }); });
        };
        return MatRadioButtonHarness;
    }(_MatRadioButtonHarnessBase));
    /** The selector for the host element of a `MatRadioButton` instance. */
    MatRadioButtonHarness.hostSelector = '.mat-radio-button';

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

    exports.MatRadioButtonHarness = MatRadioButtonHarness;
    exports.MatRadioGroupHarness = MatRadioGroupHarness;
    exports._MatRadioButtonHarnessBase = _MatRadioButtonHarnessBase;
    exports._MatRadioGroupHarnessBase = _MatRadioGroupHarnessBase;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=material-radio-testing.umd.js.map
