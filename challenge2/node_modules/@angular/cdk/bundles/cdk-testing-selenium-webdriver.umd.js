(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/cdk/testing'), require('selenium-webdriver')) :
    typeof define === 'function' && define.amd ? define('@angular/cdk/testing/selenium-webdriver', ['exports', '@angular/cdk/testing', 'selenium-webdriver'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.ng = global.ng || {}, global.ng.cdk = global.ng.cdk || {}, global.ng.cdk.testing = global.ng.cdk.testing || {}, global.ng.cdk.testing.seleniumWebdriver = {}), global.ng.cdk.testing, global['selenium-webdriver']));
}(this, (function (exports, testing, webdriver) { 'use strict';

    function _interopNamespace(e) {
        if (e && e.__esModule) return e;
        var n = Object.create(null);
        if (e) {
            Object.keys(e).forEach(function (k) {
                if (k !== 'default') {
                    var d = Object.getOwnPropertyDescriptor(e, k);
                    Object.defineProperty(n, k, d.get ? d : {
                        enumerable: true,
                        get: function () {
                            return e[k];
                        }
                    });
                }
            });
        }
        n['default'] = e;
        return Object.freeze(n);
    }

    var webdriver__namespace = /*#__PURE__*/_interopNamespace(webdriver);

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

    var _a;
    /**
     * Maps the `TestKey` constants to WebDriver's `webdriver.Key` constants.
     * See https://github.com/SeleniumHQ/selenium/blob/trunk/javascript/webdriver/key.js#L29
     */
    var seleniumWebDriverKeyMap = (_a = {},
        _a[testing.TestKey.BACKSPACE] = webdriver__namespace.Key.BACK_SPACE,
        _a[testing.TestKey.TAB] = webdriver__namespace.Key.TAB,
        _a[testing.TestKey.ENTER] = webdriver__namespace.Key.ENTER,
        _a[testing.TestKey.SHIFT] = webdriver__namespace.Key.SHIFT,
        _a[testing.TestKey.CONTROL] = webdriver__namespace.Key.CONTROL,
        _a[testing.TestKey.ALT] = webdriver__namespace.Key.ALT,
        _a[testing.TestKey.ESCAPE] = webdriver__namespace.Key.ESCAPE,
        _a[testing.TestKey.PAGE_UP] = webdriver__namespace.Key.PAGE_UP,
        _a[testing.TestKey.PAGE_DOWN] = webdriver__namespace.Key.PAGE_DOWN,
        _a[testing.TestKey.END] = webdriver__namespace.Key.END,
        _a[testing.TestKey.HOME] = webdriver__namespace.Key.HOME,
        _a[testing.TestKey.LEFT_ARROW] = webdriver__namespace.Key.ARROW_LEFT,
        _a[testing.TestKey.UP_ARROW] = webdriver__namespace.Key.ARROW_UP,
        _a[testing.TestKey.RIGHT_ARROW] = webdriver__namespace.Key.ARROW_RIGHT,
        _a[testing.TestKey.DOWN_ARROW] = webdriver__namespace.Key.ARROW_DOWN,
        _a[testing.TestKey.INSERT] = webdriver__namespace.Key.INSERT,
        _a[testing.TestKey.DELETE] = webdriver__namespace.Key.DELETE,
        _a[testing.TestKey.F1] = webdriver__namespace.Key.F1,
        _a[testing.TestKey.F2] = webdriver__namespace.Key.F2,
        _a[testing.TestKey.F3] = webdriver__namespace.Key.F3,
        _a[testing.TestKey.F4] = webdriver__namespace.Key.F4,
        _a[testing.TestKey.F5] = webdriver__namespace.Key.F5,
        _a[testing.TestKey.F6] = webdriver__namespace.Key.F6,
        _a[testing.TestKey.F7] = webdriver__namespace.Key.F7,
        _a[testing.TestKey.F8] = webdriver__namespace.Key.F8,
        _a[testing.TestKey.F9] = webdriver__namespace.Key.F9,
        _a[testing.TestKey.F10] = webdriver__namespace.Key.F10,
        _a[testing.TestKey.F11] = webdriver__namespace.Key.F11,
        _a[testing.TestKey.F12] = webdriver__namespace.Key.F12,
        _a[testing.TestKey.META] = webdriver__namespace.Key.META,
        _a);
    /** Gets a list of WebDriver `Key`s for the given `ModifierKeys`. */
    function getSeleniumWebDriverModifierKeys(modifiers) {
        var result = [];
        if (modifiers.control) {
            result.push(webdriver__namespace.Key.CONTROL);
        }
        if (modifiers.alt) {
            result.push(webdriver__namespace.Key.ALT);
        }
        if (modifiers.shift) {
            result.push(webdriver__namespace.Key.SHIFT);
        }
        if (modifiers.meta) {
            result.push(webdriver__namespace.Key.META);
        }
        return result;
    }

    /** A `TestElement` implementation for WebDriver. */
    var SeleniumWebDriverElement = /** @class */ (function () {
        function SeleniumWebDriverElement(element, _stabilize) {
            this.element = element;
            this._stabilize = _stabilize;
        }
        /** Blur the element. */
        SeleniumWebDriverElement.prototype.blur = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this._executeScript((function (element) { return element.blur(); }), this.element())];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, this._stabilize()];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /** Clear the element's input (for input and textarea elements only). */
        SeleniumWebDriverElement.prototype.clear = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.element().clear()];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, this._stabilize()];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        SeleniumWebDriverElement.prototype.click = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this._dispatchClickEventSequence(args, webdriver__namespace.Button.LEFT)];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, this._stabilize()];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        SeleniumWebDriverElement.prototype.rightClick = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this._dispatchClickEventSequence(args, webdriver__namespace.Button.RIGHT)];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, this._stabilize()];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /** Focus the element. */
        SeleniumWebDriverElement.prototype.focus = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this._executeScript(function (element) { return element.focus(); }, this.element())];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, this._stabilize()];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /** Get the computed value of the given CSS property for the element. */
        SeleniumWebDriverElement.prototype.getCssValue = function (property) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this._stabilize()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, this.element().getCssValue(property)];
                    }
                });
            });
        };
        /** Hovers the mouse over the element. */
        SeleniumWebDriverElement.prototype.hover = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this._actions().mouseMove(this.element()).perform()];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, this._stabilize()];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /** Moves the mouse away from the element. */
        SeleniumWebDriverElement.prototype.mouseAway = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this._actions().mouseMove(this.element(), { x: -1, y: -1 }).perform()];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, this._stabilize()];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        SeleniumWebDriverElement.prototype.sendKeys = function () {
            var modifiersAndKeys = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                modifiersAndKeys[_i] = arguments[_i];
            }
            return __awaiter(this, void 0, void 0, function () {
                var first, modifiers, rest, modifierKeys, keys;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            first = modifiersAndKeys[0];
                            if (typeof first !== 'string' && typeof first !== 'number') {
                                modifiers = first;
                                rest = modifiersAndKeys.slice(1);
                            }
                            else {
                                modifiers = {};
                                rest = modifiersAndKeys;
                            }
                            modifierKeys = getSeleniumWebDriverModifierKeys(modifiers);
                            keys = rest.map(function (k) { return typeof k === 'string' ? k.split('') : [seleniumWebDriverKeyMap[k]]; })
                                .reduce(function (arr, k) { return arr.concat(k); }, [])
                                // webdriver.Key.chord doesn't work well with geckodriver (mozilla/geckodriver#1502),
                                // so avoid it if no modifier keys are required.
                                .map(function (k) {
                                var _a;
                                return modifierKeys.length > 0 ? (_a = webdriver__namespace.Key).chord.apply(_a, __spreadArray(__spreadArray([], __read(modifierKeys)), [k])) : k;
                            });
                            return [4 /*yield*/, (_a = this.element()).sendKeys.apply(_a, __spreadArray([], __read(keys)))];
                        case 1:
                            _b.sent();
                            return [4 /*yield*/, this._stabilize()];
                        case 2:
                            _b.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Gets the text from the element.
         * @param options Options that affect what text is included.
         */
        SeleniumWebDriverElement.prototype.text = function (options) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this._stabilize()];
                        case 1:
                            _a.sent();
                            if (options === null || options === void 0 ? void 0 : options.exclude) {
                                return [2 /*return*/, this._executeScript(testing._getTextWithExcludedElements, this.element(), options.exclude)];
                            }
                            return [2 /*return*/, this.element().getText()];
                    }
                });
            });
        };
        /** Gets the value for the given attribute from the element. */
        SeleniumWebDriverElement.prototype.getAttribute = function (name) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this._stabilize()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, this._executeScript(function (element, attribute) { return element.getAttribute(attribute); }, this.element(), name)];
                    }
                });
            });
        };
        /** Checks whether the element has the given class. */
        SeleniumWebDriverElement.prototype.hasClass = function (name) {
            return __awaiter(this, void 0, void 0, function () {
                var classes;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this._stabilize()];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, this.getAttribute('class')];
                        case 2:
                            classes = (_a.sent()) || '';
                            return [2 /*return*/, new Set(classes.split(/\s+/).filter(function (c) { return c; })).has(name)];
                    }
                });
            });
        };
        /** Gets the dimensions of the element. */
        SeleniumWebDriverElement.prototype.getDimensions = function () {
            return __awaiter(this, void 0, void 0, function () {
                var _a, width, height, _b, left, top;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0: return [4 /*yield*/, this._stabilize()];
                        case 1:
                            _c.sent();
                            return [4 /*yield*/, this.element().getSize()];
                        case 2:
                            _a = _c.sent(), width = _a.width, height = _a.height;
                            return [4 /*yield*/, this.element().getLocation()];
                        case 3:
                            _b = _c.sent(), left = _b.x, top = _b.y;
                            return [2 /*return*/, { width: width, height: height, left: left, top: top }];
                    }
                });
            });
        };
        /** Gets the value of a property of an element. */
        SeleniumWebDriverElement.prototype.getProperty = function (name) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this._stabilize()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, this._executeScript(function (element, property) { return element[property]; }, this.element(), name)];
                    }
                });
            });
        };
        /** Sets the value of a property of an input. */
        SeleniumWebDriverElement.prototype.setInputValue = function (newValue) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this._executeScript(function (element, value) { return element.value = value; }, this.element(), newValue)];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, this._stabilize()];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /** Selects the options at the specified indexes inside of a native `select` element. */
        SeleniumWebDriverElement.prototype.selectOptions = function () {
            var optionIndexes = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                optionIndexes[_i] = arguments[_i];
            }
            return __awaiter(this, void 0, void 0, function () {
                var options, indexes, i;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this._stabilize()];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, this.element().findElements(webdriver__namespace.By.css('option'))];
                        case 2:
                            options = _a.sent();
                            indexes = new Set(optionIndexes);
                            if (!(options.length && indexes.size)) return [3 /*break*/, 11];
                            // Reset the value so all the selected states are cleared. We can
                            // reuse the input-specific method since the logic is the same.
                            return [4 /*yield*/, this.setInputValue('')];
                        case 3:
                            // Reset the value so all the selected states are cleared. We can
                            // reuse the input-specific method since the logic is the same.
                            _a.sent();
                            i = 0;
                            _a.label = 4;
                        case 4:
                            if (!(i < options.length)) return [3 /*break*/, 9];
                            if (!indexes.has(i)) return [3 /*break*/, 8];
                            // We have to hold the control key while clicking on options so that multiple can be
                            // selected in multi-selection mode. The key doesn't do anything for single selection.
                            return [4 /*yield*/, this._actions().keyDown(webdriver__namespace.Key.CONTROL).perform()];
                        case 5:
                            // We have to hold the control key while clicking on options so that multiple can be
                            // selected in multi-selection mode. The key doesn't do anything for single selection.
                            _a.sent();
                            return [4 /*yield*/, options[i].click()];
                        case 6:
                            _a.sent();
                            return [4 /*yield*/, this._actions().keyUp(webdriver__namespace.Key.CONTROL).perform()];
                        case 7:
                            _a.sent();
                            _a.label = 8;
                        case 8:
                            i++;
                            return [3 /*break*/, 4];
                        case 9: return [4 /*yield*/, this._stabilize()];
                        case 10:
                            _a.sent();
                            _a.label = 11;
                        case 11: return [2 /*return*/];
                    }
                });
            });
        };
        /** Checks whether this element matches the given selector. */
        SeleniumWebDriverElement.prototype.matchesSelector = function (selector) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this._stabilize()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, this._executeScript(function (element, s) { return (Element.prototype.matches || Element.prototype.msMatchesSelector)
                                    .call(element, s); }, this.element(), selector)];
                    }
                });
            });
        };
        /** Checks whether the element is focused. */
        SeleniumWebDriverElement.prototype.isFocused = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this._stabilize()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, webdriver__namespace.WebElement.equals(this.element(), this.element().getDriver().switchTo().activeElement())];
                    }
                });
            });
        };
        /**
         * Dispatches an event with a particular name.
         * @param name Name of the event to be dispatched.
         */
        SeleniumWebDriverElement.prototype.dispatchEvent = function (name, data) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this._executeScript(dispatchEvent, name, this.element(), data)];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, this._stabilize()];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /** Gets the webdriver action sequence. */
        SeleniumWebDriverElement.prototype._actions = function () {
            return this.element().getDriver().actions();
        };
        /** Executes a function in the browser. */
        SeleniumWebDriverElement.prototype._executeScript = function (script) {
            var var_args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                var_args[_i - 1] = arguments[_i];
            }
            return __awaiter(this, void 0, void 0, function () {
                var _a;
                return __generator(this, function (_b) {
                    return [2 /*return*/, (_a = this.element().getDriver()).executeScript.apply(_a, __spreadArray([script], __read(var_args)))];
                });
            });
        };
        /** Dispatches all the events that are part of a click event sequence. */
        SeleniumWebDriverElement.prototype._dispatchClickEventSequence = function (args, button) {
            return __awaiter(this, void 0, void 0, function () {
                var modifiers, modifierKeys, offsetArgs, actions, modifierKeys_1, modifierKeys_1_1, modifierKey, modifierKeys_2, modifierKeys_2_1, modifierKey;
                var _a, e_1, _b, e_2, _c;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            modifiers = {};
                            if (args.length && typeof args[args.length - 1] === 'object') {
                                modifiers = args.pop();
                            }
                            modifierKeys = getSeleniumWebDriverModifierKeys(modifiers);
                            offsetArgs = (args.length === 2 ?
                                [{ x: args[0], y: args[1] }] : []);
                            actions = (_a = this._actions()).mouseMove.apply(_a, __spreadArray([this.element()], __read(offsetArgs)));
                            try {
                                for (modifierKeys_1 = __values(modifierKeys), modifierKeys_1_1 = modifierKeys_1.next(); !modifierKeys_1_1.done; modifierKeys_1_1 = modifierKeys_1.next()) {
                                    modifierKey = modifierKeys_1_1.value;
                                    actions = actions.keyDown(modifierKey);
                                }
                            }
                            catch (e_1_1) { e_1 = { error: e_1_1 }; }
                            finally {
                                try {
                                    if (modifierKeys_1_1 && !modifierKeys_1_1.done && (_b = modifierKeys_1.return)) _b.call(modifierKeys_1);
                                }
                                finally { if (e_1) throw e_1.error; }
                            }
                            actions = actions.click(button);
                            try {
                                for (modifierKeys_2 = __values(modifierKeys), modifierKeys_2_1 = modifierKeys_2.next(); !modifierKeys_2_1.done; modifierKeys_2_1 = modifierKeys_2.next()) {
                                    modifierKey = modifierKeys_2_1.value;
                                    actions = actions.keyUp(modifierKey);
                                }
                            }
                            catch (e_2_1) { e_2 = { error: e_2_1 }; }
                            finally {
                                try {
                                    if (modifierKeys_2_1 && !modifierKeys_2_1.done && (_c = modifierKeys_2.return)) _c.call(modifierKeys_2);
                                }
                                finally { if (e_2) throw e_2.error; }
                            }
                            return [4 /*yield*/, actions.perform()];
                        case 1:
                            _d.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        return SeleniumWebDriverElement;
    }());
    /**
     * Dispatches an event with a particular name and data to an element. Note that this needs to be a
     * pure function, because it gets stringified by WebDriver and is executed inside the browser.
     */
    function dispatchEvent(name, element, data) {
        var event = document.createEvent('Event');
        event.initEvent(name);
        // tslint:disable-next-line:ban Have to use `Object.assign` to preserve the original object.
        Object.assign(event, data || {});
        element.dispatchEvent(event);
    }

    /** The default environment options. */
    var defaultEnvironmentOptions = {
        queryFn: function (selector, root) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, root().findElements(webdriver__namespace.By.css(selector))];
        }); }); }
    };
    /**
     * This function is meant to be executed in the browser. It taps into the hooks exposed by Angular
     * and invokes the specified `callback` when the application is stable (no more pending tasks).
     */
    function whenStable(callback) {
        Promise.all(window.frameworkStabilizers.map(function (stabilizer) { return new Promise(stabilizer); }))
            .then(callback);
    }
    /**
     * This function is meant to be executed in the browser. It checks whether the Angular framework has
     * bootstrapped yet.
     */
    function isBootstrapped() {
        return !!window.frameworkStabilizers;
    }
    /** Waits for angular to be ready after the page load. */
    function waitForAngularReady(wd) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, wd.wait(function () { return wd.executeScript(isBootstrapped); })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, wd.executeAsyncScript(whenStable)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    /** A `HarnessEnvironment` implementation for WebDriver. */
    var SeleniumWebDriverHarnessEnvironment = /** @class */ (function (_super) {
        __extends(SeleniumWebDriverHarnessEnvironment, _super);
        function SeleniumWebDriverHarnessEnvironment(rawRootElement, options) {
            var _this = _super.call(this, rawRootElement) || this;
            _this._options = Object.assign(Object.assign({}, defaultEnvironmentOptions), options);
            return _this;
        }
        /** Gets the ElementFinder corresponding to the given TestElement. */
        SeleniumWebDriverHarnessEnvironment.getNativeElement = function (el) {
            if (el instanceof SeleniumWebDriverElement) {
                return el.element();
            }
            throw Error('This TestElement was not created by the WebDriverHarnessEnvironment');
        };
        /** Creates a `HarnessLoader` rooted at the document root. */
        SeleniumWebDriverHarnessEnvironment.loader = function (driver, options) {
            return new SeleniumWebDriverHarnessEnvironment(function () { return driver.findElement(webdriver__namespace.By.css('body')); }, options);
        };
        /**
         * Flushes change detection and async tasks captured in the Angular zone.
         * In most cases it should not be necessary to call this manually. However, there may be some edge
         * cases where it is needed to fully flush animation events.
         */
        SeleniumWebDriverHarnessEnvironment.prototype.forceStabilize = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.rawRootElement().getDriver().executeAsyncScript(whenStable)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /** @docs-private */
        SeleniumWebDriverHarnessEnvironment.prototype.waitForTasksOutsideAngular = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/];
                });
            });
        };
        /** Gets the root element for the document. */
        SeleniumWebDriverHarnessEnvironment.prototype.getDocumentRoot = function () {
            var _this = this;
            return function () { return _this.rawRootElement().getDriver().findElement(webdriver__namespace.By.css('body')); };
        };
        /** Creates a `TestElement` from a raw element. */
        SeleniumWebDriverHarnessEnvironment.prototype.createTestElement = function (element) {
            var _this = this;
            return new SeleniumWebDriverElement(element, function () { return _this.forceStabilize(); });
        };
        /** Creates a `HarnessLoader` rooted at the given raw element. */
        SeleniumWebDriverHarnessEnvironment.prototype.createEnvironment = function (element) {
            return new SeleniumWebDriverHarnessEnvironment(element, this._options);
        };
        // Note: This seems to be working, though we may need to re-evaluate if we encounter issues with
        // stale element references. `() => Promise<webdriver.WebElement[]>` seems like a more correct
        // return type, though supporting it would require changes to the public harness API.
        /**
         * Gets a list of all elements matching the given selector under this environment's root element.
         */
        SeleniumWebDriverHarnessEnvironment.prototype.getAllRawElements = function (selector) {
            return __awaiter(this, void 0, void 0, function () {
                var els;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this._options.queryFn(selector, this.rawRootElement)];
                        case 1:
                            els = _a.sent();
                            return [2 /*return*/, els.map(function (x) { return function () { return x; }; })];
                    }
                });
            });
        };
        return SeleniumWebDriverHarnessEnvironment;
    }(testing.HarnessEnvironment));

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

    exports.SeleniumWebDriverElement = SeleniumWebDriverElement;
    exports.SeleniumWebDriverHarnessEnvironment = SeleniumWebDriverHarnessEnvironment;
    exports.waitForAngularReady = waitForAngularReady;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=cdk-testing-selenium-webdriver.umd.js.map
