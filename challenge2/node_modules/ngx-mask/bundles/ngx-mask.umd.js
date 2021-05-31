(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('@angular/forms'), require('@angular/common')) :
    typeof define === 'function' && define.amd ? define('ngx-mask', ['exports', '@angular/core', '@angular/forms', '@angular/common'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global['ngx-mask'] = {}, global.ng.core, global.ng.forms, global.ng.common));
}(this, (function (exports, core, forms, common) { 'use strict';

    var config = new core.InjectionToken('config');
    var NEW_CONFIG = new core.InjectionToken('NEW_CONFIG');
    var INITIAL_CONFIG = new core.InjectionToken('INITIAL_CONFIG');
    var initialConfig = {
        suffix: '',
        prefix: '',
        thousandSeparator: ' ',
        decimalMarker: '.',
        clearIfNotMatch: false,
        showTemplate: false,
        showMaskTyped: false,
        placeHolderCharacter: '_',
        dropSpecialCharacters: true,
        hiddenInput: undefined,
        shownMaskExpression: '',
        separatorLimit: '',
        allowNegativeNumbers: false,
        validation: true,
        // tslint:disable-next-line: quotemark
        specialCharacters: ['-', '/', '(', ')', '.', ':', ' ', '+', ',', '@', '[', ']', '"', "'"],
        leadZeroDateTime: false,
        patterns: {
            '0': {
                pattern: new RegExp('\\d'),
            },
            '9': {
                pattern: new RegExp('\\d'),
                optional: true,
            },
            X: {
                pattern: new RegExp('\\d'),
                symbol: '*',
            },
            A: {
                pattern: new RegExp('[a-zA-Z0-9]'),
            },
            S: {
                pattern: new RegExp('[a-zA-Z]'),
            },
            d: {
                pattern: new RegExp('\\d'),
            },
            m: {
                pattern: new RegExp('\\d'),
            },
            M: {
                pattern: new RegExp('\\d'),
            },
            H: {
                pattern: new RegExp('\\d'),
            },
            h: {
                pattern: new RegExp('\\d'),
            },
            s: {
                pattern: new RegExp('\\d'),
            },
        },
    };
    var timeMasks = ['Hh:m0:s0', 'Hh:m0', 'm0:s0'];
    var withoutValidation = [
        'percent',
        'Hh',
        's0',
        'm0',
        'separator',
        'd0/M0/0000',
        'd0/M0',
        'd0',
        'M0',
    ];

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
    function __classPrivateFieldGet(receiver, state, kind, f) {
        if (kind === "a" && !f)
            throw new TypeError("Private accessor was defined without a getter");
        if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
            throw new TypeError("Cannot read private member from an object whose class did not declare it");
        return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
    }
    function __classPrivateFieldSet(receiver, state, value, kind, f) {
        if (kind === "m")
            throw new TypeError("Private method is not writable");
        if (kind === "a" && !f)
            throw new TypeError("Private accessor was defined without a setter");
        if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
            throw new TypeError("Cannot write private member to an object whose class did not declare it");
        return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
    }

    var MaskApplierService = /** @class */ (function () {
        function MaskApplierService(_config) {
            var _this = this;
            this._config = _config;
            this.maskExpression = '';
            this.actualValue = '';
            this.shownMaskExpression = '';
            this._formatWithSeparators = function (str, thousandSeparatorChar, decimalChar, precision) {
                var x = str.split(decimalChar);
                var decimals = x.length > 1 ? "" + decimalChar + x[1] : '';
                var res = x[0];
                var separatorLimit = _this.separatorLimit.replace(/\s/g, '');
                if (separatorLimit && +separatorLimit) {
                    if (res[0] === '-') {
                        res = "-" + res.slice(1, res.length).slice(0, separatorLimit.length);
                    }
                    else {
                        res = res.slice(0, separatorLimit.length);
                    }
                }
                var rgx = /(\d+)(\d{3})/;
                while (thousandSeparatorChar && rgx.test(res)) {
                    res = res.replace(rgx, '$1' + thousandSeparatorChar + '$2');
                }
                if (precision === undefined) {
                    return res + decimals;
                }
                else if (precision === 0) {
                    return res;
                }
                return res + decimals.substr(0, precision + 1);
            };
            this.percentage = function (str) {
                return Number(str) >= 0 && Number(str) <= 100;
            };
            this.getPrecision = function (maskExpression) {
                var x = maskExpression.split('.');
                if (x.length > 1) {
                    return Number(x[x.length - 1]);
                }
                return Infinity;
            };
            this.checkAndRemoveSuffix = function (inputValue) {
                var _a, _b, _c;
                for (var i = ((_a = _this.suffix) === null || _a === void 0 ? void 0 : _a.length) - 1; i >= 0; i--) {
                    var substr = _this.suffix.substr(i, (_b = _this.suffix) === null || _b === void 0 ? void 0 : _b.length);
                    if (inputValue.includes(substr) &&
                        (i - 1 < 0 || !inputValue.includes(_this.suffix.substr(i - 1, (_c = _this.suffix) === null || _c === void 0 ? void 0 : _c.length)))) {
                        return inputValue.replace(substr, '');
                    }
                }
                return inputValue;
            };
            this.checkInputPrecision = function (inputValue, precision, decimalMarker) {
                if (precision < Infinity) {
                    var precisionRegEx = new RegExp(_this._charToRegExpExpression(decimalMarker) + ("\\d{" + precision + "}.*$"));
                    var precisionMatch = inputValue.match(precisionRegEx);
                    if (precisionMatch && precisionMatch[0].length - 1 > precision) {
                        var diff = precisionMatch[0].length - 1 - precision;
                        inputValue = inputValue.substring(0, inputValue.length - diff);
                    }
                    if (precision === 0 && inputValue.endsWith(decimalMarker)) {
                        inputValue = inputValue.substring(0, inputValue.length - 1);
                    }
                }
                return inputValue;
            };
            this._shift = new Set();
            this.clearIfNotMatch = this._config.clearIfNotMatch;
            this.dropSpecialCharacters = this._config.dropSpecialCharacters;
            this.maskSpecialCharacters = this._config.specialCharacters;
            this.maskAvailablePatterns = this._config.patterns;
            this.prefix = this._config.prefix;
            this.suffix = this._config.suffix;
            this.thousandSeparator = this._config.thousandSeparator;
            this.decimalMarker = this._config.decimalMarker;
            this.hiddenInput = this._config.hiddenInput;
            this.showMaskTyped = this._config.showMaskTyped;
            this.placeHolderCharacter = this._config.placeHolderCharacter;
            this.validation = this._config.validation;
            this.separatorLimit = this._config.separatorLimit;
            this.allowNegativeNumbers = this._config.allowNegativeNumbers;
            this.leadZeroDateTime = this._config.leadZeroDateTime;
        }
        MaskApplierService.prototype.applyMaskWithPattern = function (inputValue, maskAndPattern) {
            var _d = __read(maskAndPattern, 2), mask = _d[0], customPattern = _d[1];
            this.customPattern = customPattern;
            return this.applyMask(inputValue, mask);
        };
        MaskApplierService.prototype.applyMask = function (inputValue, maskExpression, position, justPasted, backspaced, cb) {
            var _this = this;
            if (position === void 0) { position = 0; }
            if (justPasted === void 0) { justPasted = false; }
            if (backspaced === void 0) { backspaced = false; }
            if (cb === void 0) { cb = function () { }; }
            if (inputValue === undefined || inputValue === null || maskExpression === undefined) {
                return '';
            }
            var cursor = 0;
            var result = '';
            var multi = false;
            var backspaceShift = false;
            var shift = 1;
            var stepBack = false;
            if (inputValue.slice(0, this.prefix.length) === this.prefix) {
                inputValue = inputValue.slice(this.prefix.length, inputValue.length);
            }
            if (!!this.suffix && (inputValue === null || inputValue === void 0 ? void 0 : inputValue.length) > 0) {
                inputValue = this.checkAndRemoveSuffix(inputValue);
            }
            var inputArray = inputValue.toString().split('');
            if (maskExpression === 'IP') {
                this.ipError = !!(inputArray.filter(function (i) { return i === '.'; }).length < 3 && inputArray.length < 7);
                maskExpression = '099.099.099.099';
            }
            var arr = [];
            for (var i = 0; i < inputValue.length; i++) {
                if (inputValue[i].match('\\d')) {
                    arr.push(inputValue[i]);
                }
            }
            if (maskExpression === 'CPF_CNPJ') {
                this.cpfCnpjError = !!(arr.length !== 11 && arr.length !== 14);
                if (arr.length > 11) {
                    maskExpression = '00.000.000/0000-00';
                }
                else {
                    maskExpression = '000.000.000-00';
                }
            }
            if (maskExpression.startsWith('percent')) {
                if (inputValue.match('[a-z]|[A-Z]') || inputValue.match(/[-!$%^&*()_+|~=`{}\[\]:";'<>?,\/.]/)) {
                    inputValue = this._stripToDecimal(inputValue);
                    var precision = this.getPrecision(maskExpression);
                    inputValue = this.checkInputPrecision(inputValue, precision, this.decimalMarker);
                }
                if (inputValue.indexOf('.') > 0 && !this.percentage(inputValue.substring(0, inputValue.indexOf('.')))) {
                    var base = inputValue.substring(0, inputValue.indexOf('.') - 1);
                    inputValue = "" + base + inputValue.substring(inputValue.indexOf('.'), inputValue.length);
                }
                if (this.percentage(inputValue)) {
                    result = inputValue;
                }
                else {
                    result = inputValue.substring(0, inputValue.length - 1);
                }
            }
            else if (maskExpression.startsWith('separator')) {
                if (inputValue.match('[wа-яА-Я]') ||
                    inputValue.match('[ЁёА-я]') ||
                    inputValue.match('[a-z]|[A-Z]') ||
                    inputValue.match(/[-@#!$%\\^&*()_£¬'+|~=`{}\[\]:";<>.?\/]/) ||
                    inputValue.match('[^A-Za-z0-9,]')) {
                    inputValue = this._stripToDecimal(inputValue);
                }
                inputValue =
                    inputValue.length > 1 && inputValue[0] === '0' && inputValue[1] !== this.decimalMarker && !backspaced
                        ? inputValue.slice(1, inputValue.length)
                        : inputValue;
                // TODO: we had different rexexps here for the different cases... but tests dont seam to bother - check this
                //  separator: no COMMA, dot-sep: no SPACE, COMMA OK, comma-sep: no SPACE, COMMA OK
                var thousandSeperatorCharEscaped = this._charToRegExpExpression(this.thousandSeparator);
                var decimalMarkerEscaped = this._charToRegExpExpression(this.decimalMarker);
                var invalidChars = '@#!$%^&*()_+|~=`{}\\[\\]:\\s,\\.";<>?\\/'
                    .replace(thousandSeperatorCharEscaped, '')
                    .replace(decimalMarkerEscaped, '');
                var invalidCharRegexp = new RegExp('[' + invalidChars + ']');
                if (inputValue.match(invalidCharRegexp)) {
                    inputValue = inputValue.substring(0, inputValue.length - 1);
                }
                var precision = this.getPrecision(maskExpression);
                inputValue = this.checkInputPrecision(inputValue, precision, this.decimalMarker);
                var strForSep = inputValue.replace(new RegExp(thousandSeperatorCharEscaped, 'g'), '');
                result = this._formatWithSeparators(strForSep, this.thousandSeparator, this.decimalMarker, precision);
                var commaShift = result.indexOf(',') - inputValue.indexOf(',');
                var shiftStep = result.length - inputValue.length;
                if (shiftStep > 0 && result[position] !== ',') {
                    backspaceShift = true;
                    var _shift = 0;
                    do {
                        this._shift.add(position + _shift);
                        _shift++;
                    } while (_shift < shiftStep);
                }
                else if ((commaShift !== 0 && position > 0 && !(result.indexOf(',') >= position && position > 3)) ||
                    (!(result.indexOf('.') >= position && position > 3) && shiftStep <= 0)) {
                    this._shift.clear();
                    backspaceShift = true;
                    shift = shiftStep;
                    position += shiftStep;
                    this._shift.add(position);
                }
                else {
                    this._shift.clear();
                }
            }
            else {
                for (
                // tslint:disable-next-line
                var i = 0, inputSymbol = inputArray[0]; i < inputArray.length; i++, inputSymbol = inputArray[i]) {
                    if (cursor === maskExpression.length) {
                        break;
                    }
                    if (this._checkSymbolMask(inputSymbol, maskExpression[cursor]) && maskExpression[cursor + 1] === '?') {
                        result += inputSymbol;
                        cursor += 2;
                    }
                    else if (maskExpression[cursor + 1] === '*' &&
                        multi &&
                        this._checkSymbolMask(inputSymbol, maskExpression[cursor + 2])) {
                        result += inputSymbol;
                        cursor += 3;
                        multi = false;
                    }
                    else if (this._checkSymbolMask(inputSymbol, maskExpression[cursor]) && maskExpression[cursor + 1] === '*') {
                        result += inputSymbol;
                        multi = true;
                    }
                    else if (maskExpression[cursor + 1] === '?' &&
                        this._checkSymbolMask(inputSymbol, maskExpression[cursor + 2])) {
                        result += inputSymbol;
                        cursor += 3;
                    }
                    else if (this._checkSymbolMask(inputSymbol, maskExpression[cursor])) {
                        if (maskExpression[cursor] === 'H') {
                            if (Number(inputSymbol) > 2) {
                                cursor += 1;
                                this._shiftStep(maskExpression, cursor, inputArray.length);
                                i--;
                                if (this.leadZeroDateTime) {
                                    result += '0';
                                }
                                continue;
                            }
                        }
                        if (maskExpression[cursor] === 'h') {
                            if (result === '2' && Number(inputSymbol) > 3) {
                                cursor += 1;
                                i--;
                                continue;
                            }
                        }
                        if (maskExpression[cursor] === 'm') {
                            if (Number(inputSymbol) > 5) {
                                cursor += 1;
                                this._shiftStep(maskExpression, cursor, inputArray.length);
                                i--;
                                if (this.leadZeroDateTime) {
                                    result += '0';
                                }
                                continue;
                            }
                        }
                        if (maskExpression[cursor] === 's') {
                            if (Number(inputSymbol) > 5) {
                                cursor += 1;
                                this._shiftStep(maskExpression, cursor, inputArray.length);
                                i--;
                                if (this.leadZeroDateTime) {
                                    result += '0';
                                }
                                continue;
                            }
                        }
                        var daysCount = 31;
                        if (maskExpression[cursor] === 'd') {
                            if ((Number(inputSymbol) > 3 && this.leadZeroDateTime) ||
                                Number(inputValue.slice(cursor, cursor + 2)) > daysCount ||
                                inputValue[cursor + 1] === '/') {
                                cursor += 1;
                                this._shiftStep(maskExpression, cursor, inputArray.length);
                                i--;
                                if (this.leadZeroDateTime) {
                                    result += '0';
                                }
                                continue;
                            }
                        }
                        if (maskExpression[cursor] === 'M') {
                            var monthsCount = 12;
                            // mask without day
                            var withoutDays = cursor === 0 &&
                                (Number(inputSymbol) > 2 ||
                                    Number(inputValue.slice(cursor, cursor + 2)) > monthsCount ||
                                    inputValue[cursor + 1] === '/');
                            // day<10 && month<12 for input
                            var day1monthInput = inputValue.slice(cursor - 3, cursor - 1).includes('/') &&
                                ((inputValue[cursor - 2] === '/' &&
                                    Number(inputValue.slice(cursor - 1, cursor + 1)) > monthsCount &&
                                    inputValue[cursor] !== '/') ||
                                    inputValue[cursor] === '/' ||
                                    (inputValue[cursor - 3] === '/' &&
                                        Number(inputValue.slice(cursor - 2, cursor)) > monthsCount &&
                                        inputValue[cursor - 1] !== '/') ||
                                    inputValue[cursor - 1] === '/');
                            // 10<day<31 && month<12 for input
                            var day2monthInput = Number(inputValue.slice(cursor - 3, cursor - 1)) <= daysCount &&
                                !inputValue.slice(cursor - 3, cursor - 1).includes('/') &&
                                inputValue[cursor - 1] === '/' &&
                                (Number(inputValue.slice(cursor, cursor + 2)) > monthsCount || inputValue[cursor + 1] === '/');
                            // day<10 && month<12 for paste whole data
                            var day1monthPaste = Number(inputValue.slice(cursor - 3, cursor - 1)) > daysCount &&
                                !inputValue.slice(cursor - 3, cursor - 1).includes('/') &&
                                !inputValue.slice(cursor - 2, cursor).includes('/') &&
                                Number(inputValue.slice(cursor - 2, cursor)) > monthsCount;
                            // 10<day<31 && month<12 for paste whole data
                            var day2monthPaste = Number(inputValue.slice(cursor - 3, cursor - 1)) <= daysCount &&
                                !inputValue.slice(cursor - 3, cursor - 1).includes('/') &&
                                inputValue[cursor - 1] !== '/' &&
                                Number(inputValue.slice(cursor - 1, cursor + 1)) > monthsCount;
                            if ((Number(inputSymbol) > 1 && this.leadZeroDateTime) ||
                                withoutDays ||
                                day1monthInput ||
                                day2monthInput ||
                                day1monthPaste ||
                                day2monthPaste) {
                                cursor += 1;
                                this._shiftStep(maskExpression, cursor, inputArray.length);
                                i--;
                                if (this.leadZeroDateTime) {
                                    result += '0';
                                }
                                continue;
                            }
                        }
                        result += inputSymbol;
                        cursor++;
                    }
                    else if (this.maskSpecialCharacters.indexOf(maskExpression[cursor]) !== -1) {
                        result += maskExpression[cursor];
                        cursor++;
                        this._shiftStep(maskExpression, cursor, inputArray.length);
                        i--;
                    }
                    else if (this.maskSpecialCharacters.indexOf(inputSymbol) > -1 &&
                        this.maskAvailablePatterns[maskExpression[cursor]] &&
                        this.maskAvailablePatterns[maskExpression[cursor]].optional) {
                        if (!!inputArray[cursor] &&
                            maskExpression !== '099.099.099.099' &&
                            maskExpression !== '000.000.000-00' &&
                            maskExpression !== '00.000.000/0000-00') {
                            result += inputArray[cursor];
                        }
                        cursor++;
                        i--;
                    }
                    else if (this.maskExpression[cursor + 1] === '*' &&
                        this._findSpecialChar(this.maskExpression[cursor + 2]) &&
                        this._findSpecialChar(inputSymbol) === this.maskExpression[cursor + 2] &&
                        multi) {
                        cursor += 3;
                        result += inputSymbol;
                    }
                    else if (this.maskExpression[cursor + 1] === '?' &&
                        this._findSpecialChar(this.maskExpression[cursor + 2]) &&
                        this._findSpecialChar(inputSymbol) === this.maskExpression[cursor + 2] &&
                        multi) {
                        cursor += 3;
                        result += inputSymbol;
                    }
                    else if (this.showMaskTyped &&
                        this.maskSpecialCharacters.indexOf(inputSymbol) < 0 &&
                        inputSymbol !== this.placeHolderCharacter) {
                        stepBack = true;
                    }
                }
            }
            if (result.length + 1 === maskExpression.length &&
                this.maskSpecialCharacters.indexOf(maskExpression[maskExpression.length - 1]) !== -1) {
                result += maskExpression[maskExpression.length - 1];
            }
            var newPosition = position + 1;
            while (this._shift.has(newPosition)) {
                shift++;
                newPosition++;
            }
            var actualShift = justPasted ? cursor : this._shift.has(position) ? shift : 0;
            if (stepBack) {
                actualShift--;
            }
            cb(actualShift, backspaceShift);
            if (shift < 0) {
                this._shift.clear();
            }
            var onlySpecial = false;
            if (backspaced) {
                onlySpecial = inputArray.every(function (char) { return _this.maskSpecialCharacters.includes(char); });
            }
            var res = "" + this.prefix + (onlySpecial ? '' : result) + this.suffix;
            if (result.length === 0) {
                res = "" + this.prefix + result;
            }
            return res;
        };
        MaskApplierService.prototype._findSpecialChar = function (inputSymbol) {
            return this.maskSpecialCharacters.find(function (val) { return val === inputSymbol; });
        };
        MaskApplierService.prototype._checkSymbolMask = function (inputSymbol, maskSymbol) {
            this.maskAvailablePatterns = this.customPattern ? this.customPattern : this.maskAvailablePatterns;
            return (this.maskAvailablePatterns[maskSymbol] &&
                this.maskAvailablePatterns[maskSymbol].pattern &&
                this.maskAvailablePatterns[maskSymbol].pattern.test(inputSymbol));
        };
        MaskApplierService.prototype._stripToDecimal = function (str) {
            var _this = this;
            return str
                .split('')
                .filter(function (i, idx) {
                return (i.match('^-?\\d') ||
                    i.match('\\s') ||
                    i === '.' ||
                    i === ',' ||
                    (i === '-' && idx === 0 && _this.allowNegativeNumbers));
            })
                .join('');
        };
        MaskApplierService.prototype._charToRegExpExpression = function (char) {
            if (char) {
                var charsToEscape = '[\\^$.|?*+()';
                return char === ' ' ? '\\s' : charsToEscape.indexOf(char) >= 0 ? '\\' + char : char;
            }
            return char;
        };
        MaskApplierService.prototype._shiftStep = function (maskExpression, cursor, inputLength) {
            var shiftStep = /[*?]/g.test(maskExpression.slice(0, cursor)) ? inputLength : cursor;
            this._shift.add(shiftStep + this.prefix.length || 0);
        };
        return MaskApplierService;
    }());
    MaskApplierService.decorators = [
        { type: core.Injectable }
    ];
    MaskApplierService.ctorParameters = function () { return [
        { type: undefined, decorators: [{ type: core.Inject, args: [config,] }] }
    ]; };

    var MaskService = /** @class */ (function (_super) {
        __extends(MaskService, _super);
        function MaskService(document, _config, _elementRef, _renderer) {
            var _this = _super.call(this, _config) || this;
            _this.document = document;
            _this._config = _config;
            _this._elementRef = _elementRef;
            _this._renderer = _renderer;
            _this.maskExpression = '';
            _this.isNumberValue = false;
            _this.placeHolderCharacter = '_';
            _this.maskIsShown = '';
            _this.selStart = null;
            _this.selEnd = null;
            /**
             * Whether we are currently in writeValue function, in this case when applying the mask we don't want to trigger onChange function,
             * since writeValue should be a one way only process of writing the DOM value based on the Angular model value.
             */
            _this.writingValue = false;
            _this.maskChanged = false;
            _this.onChange = function (_) { };
            return _this;
        }
        // tslint:disable-next-line:cyclomatic-complexity
        MaskService.prototype.applyMask = function (inputValue, maskExpression, position, justPasted, backspaced, cb) {
            var _this = this;
            if (position === void 0) { position = 0; }
            if (justPasted === void 0) { justPasted = false; }
            if (backspaced === void 0) { backspaced = false; }
            if (cb === void 0) { cb = function () { }; }
            if (!maskExpression) {
                return inputValue;
            }
            this.maskIsShown = this.showMaskTyped ? this.showMaskInInput() : '';
            if (this.maskExpression === 'IP' && this.showMaskTyped) {
                this.maskIsShown = this.showMaskInInput(inputValue || '#');
            }
            if (this.maskExpression === 'CPF_CNPJ' && this.showMaskTyped) {
                this.maskIsShown = this.showMaskInInput(inputValue || '#');
            }
            if (!inputValue && this.showMaskTyped) {
                this.formControlResult(this.prefix);
                return this.prefix + this.maskIsShown;
            }
            var getSymbol = !!inputValue && typeof this.selStart === 'number' ? inputValue[this.selStart] : '';
            var newInputValue = '';
            if (this.hiddenInput && !this.writingValue) {
                var actualResult = this.actualValue.split('');
                // tslint:disable no-unused-expression
                inputValue !== '' && actualResult.length
                    ? typeof this.selStart === 'number' && typeof this.selEnd === 'number'
                        ? inputValue.length > actualResult.length
                            ? actualResult.splice(this.selStart, 0, getSymbol)
                            : inputValue.length < actualResult.length
                                ? actualResult.length - inputValue.length === 1
                                    ? actualResult.splice(this.selStart - 1, 1)
                                    : actualResult.splice(this.selStart, this.selEnd - this.selStart)
                                : null
                        : null
                    : (actualResult = []);
                // tslint:enable no-unused-expression
                newInputValue =
                    this.actualValue.length && actualResult.length <= inputValue.length
                        ? this.shiftTypedSymbols(actualResult.join(''))
                        : inputValue;
            }
            newInputValue = Boolean(newInputValue) && newInputValue.length ? newInputValue : inputValue;
            var result = _super.prototype.applyMask.call(this, newInputValue, maskExpression, position, justPasted, backspaced, cb);
            this.actualValue = this.getActualValue(result);
            // handle some separator implications:
            // a.) adjust decimalMarker default (. -> ,) if thousandSeparator is a dot
            if (this.thousandSeparator === '.' && this.decimalMarker === '.') {
                this.decimalMarker = ',';
            }
            // b) remove decimal marker from list of special characters to mask
            if (this.maskExpression.startsWith('separator') && this.dropSpecialCharacters === true) {
                this.maskSpecialCharacters = this.maskSpecialCharacters.filter(function (item) { return item !== _this.decimalMarker; });
            }
            this.formControlResult(result);
            if (!this.showMaskTyped) {
                if (this.hiddenInput) {
                    return result && result.length ? this.hideInput(result, this.maskExpression) : result;
                }
                return result;
            }
            var resLen = result.length;
            var prefNmask = this.prefix + this.maskIsShown;
            if (this.maskExpression.includes('H')) {
                var countSkipedSymbol = this._numberSkipedSymbols(result);
                return result + prefNmask.slice(resLen + countSkipedSymbol);
            }
            else if (this.maskExpression === 'IP' || this.maskExpression === 'CPF_CNPJ') {
                return result + prefNmask;
            }
            return result + prefNmask.slice(resLen);
        };
        // get the number of characters that were shifted
        MaskService.prototype._numberSkipedSymbols = function (value) {
            var regex = /(^|\D)(\d\D)/g;
            var match = regex.exec(value);
            var countSkipedSymbol = 0;
            while (match != null) {
                countSkipedSymbol += 1;
                match = regex.exec(value);
            }
            return countSkipedSymbol;
        };
        MaskService.prototype.applyValueChanges = function (position, justPasted, backspaced, cb) {
            if (position === void 0) { position = 0; }
            if (cb === void 0) { cb = function () { }; }
            var formElement = this._elementRef.nativeElement;
            formElement.value = this.applyMask(formElement.value, this.maskExpression, position, justPasted, backspaced, cb);
            if (formElement === this.document.activeElement) {
                return;
            }
            this.clearIfNotMatchFn();
        };
        MaskService.prototype.hideInput = function (inputValue, maskExpression) {
            var _this = this;
            return inputValue
                .split('')
                .map(function (curr, index) {
                if (_this.maskAvailablePatterns &&
                    _this.maskAvailablePatterns[maskExpression[index]] &&
                    _this.maskAvailablePatterns[maskExpression[index]].symbol) {
                    return _this.maskAvailablePatterns[maskExpression[index]].symbol;
                }
                return curr;
            })
                .join('');
        };
        // this function is not necessary, it checks result against maskExpression
        MaskService.prototype.getActualValue = function (res) {
            var _this = this;
            var compare = res
                .split('')
                .filter(function (symbol, i) { return _this._checkSymbolMask(symbol, _this.maskExpression[i]) ||
                (_this.maskSpecialCharacters.includes(_this.maskExpression[i]) && symbol === _this.maskExpression[i]); });
            if (compare.join('') === res) {
                return compare.join('');
            }
            return res;
        };
        MaskService.prototype.shiftTypedSymbols = function (inputValue) {
            var _this = this;
            var symbolToReplace = '';
            var newInputValue = (inputValue &&
                inputValue.split('').map(function (currSymbol, index) {
                    if (_this.maskSpecialCharacters.includes(inputValue[index + 1]) &&
                        inputValue[index + 1] !== _this.maskExpression[index + 1]) {
                        symbolToReplace = currSymbol;
                        return inputValue[index + 1];
                    }
                    if (symbolToReplace.length) {
                        var replaceSymbol = symbolToReplace;
                        symbolToReplace = '';
                        return replaceSymbol;
                    }
                    return currSymbol;
                })) ||
                [];
            return newInputValue.join('');
        };
        MaskService.prototype.showMaskInInput = function (inputVal) {
            if (this.showMaskTyped && !!this.shownMaskExpression) {
                if (this.maskExpression.length !== this.shownMaskExpression.length) {
                    throw new Error('Mask expression must match mask placeholder length');
                }
                else {
                    return this.shownMaskExpression;
                }
            }
            else if (this.showMaskTyped) {
                if (inputVal) {
                    if (this.maskExpression === 'IP') {
                        return this._checkForIp(inputVal);
                    }
                    if (this.maskExpression === 'CPF_CNPJ') {
                        return this._checkForCpfCnpj(inputVal);
                    }
                }
                return this.maskExpression.replace(/\w/g, this.placeHolderCharacter);
            }
            return '';
        };
        MaskService.prototype.clearIfNotMatchFn = function () {
            var formElement = this._elementRef.nativeElement;
            if (this.clearIfNotMatch &&
                this.prefix.length + this.maskExpression.length + this.suffix.length !==
                    formElement.value.replace(/_/g, '').length) {
                this.formElementProperty = ['value', ''];
                this.applyMask(formElement.value, this.maskExpression);
            }
        };
        Object.defineProperty(MaskService.prototype, "formElementProperty", {
            set: function (_a) {
                var _this = this;
                var _b = __read(_a, 2), name = _b[0], value = _b[1];
                Promise.resolve().then(function () { return _this._renderer.setProperty(_this._elementRef.nativeElement, name, value); });
            },
            enumerable: false,
            configurable: true
        });
        MaskService.prototype.checkSpecialCharAmount = function (mask) {
            var _this = this;
            var chars = mask.split('').filter(function (item) { return _this._findSpecialChar(item); });
            return chars.length;
        };
        MaskService.prototype.removeMask = function (inputValue) {
            return this._removeMask(this._removeSuffix(this._removePrefix(inputValue)), this.maskSpecialCharacters.concat('_').concat(this.placeHolderCharacter));
        };
        MaskService.prototype._checkForIp = function (inputVal) {
            if (inputVal === '#') {
                return this.placeHolderCharacter + "." + this.placeHolderCharacter + "." + this.placeHolderCharacter + "." + this.placeHolderCharacter;
            }
            var arr = [];
            for (var i = 0; i < inputVal.length; i++) {
                if (inputVal[i].match('\\d')) {
                    arr.push(inputVal[i]);
                }
            }
            if (arr.length <= 3) {
                return this.placeHolderCharacter + "." + this.placeHolderCharacter + "." + this.placeHolderCharacter;
            }
            if (arr.length > 3 && arr.length <= 6) {
                return this.placeHolderCharacter + "." + this.placeHolderCharacter;
            }
            if (arr.length > 6 && arr.length <= 9) {
                return this.placeHolderCharacter;
            }
            if (arr.length > 9 && arr.length <= 12) {
                return '';
            }
            return '';
        };
        MaskService.prototype._checkForCpfCnpj = function (inputVal) {
            var cpf = "" + this.placeHolderCharacter + this.placeHolderCharacter + this.placeHolderCharacter +
                ("." + this.placeHolderCharacter + this.placeHolderCharacter + this.placeHolderCharacter) +
                ("." + this.placeHolderCharacter + this.placeHolderCharacter + this.placeHolderCharacter) +
                ("-" + this.placeHolderCharacter + this.placeHolderCharacter);
            var cnpj = "" + this.placeHolderCharacter + this.placeHolderCharacter +
                ("." + this.placeHolderCharacter + this.placeHolderCharacter + this.placeHolderCharacter) +
                ("." + this.placeHolderCharacter + this.placeHolderCharacter + this.placeHolderCharacter) +
                ("/" + this.placeHolderCharacter + this.placeHolderCharacter + this.placeHolderCharacter + this.placeHolderCharacter) +
                ("-" + this.placeHolderCharacter + this.placeHolderCharacter);
            if (inputVal === '#') {
                return cpf;
            }
            var arr = [];
            for (var i = 0; i < inputVal.length; i++) {
                if (inputVal[i].match('\\d')) {
                    arr.push(inputVal[i]);
                }
            }
            if (arr.length <= 3) {
                return cpf.slice(arr.length, cpf.length);
            }
            if (arr.length > 3 && arr.length <= 6) {
                return cpf.slice(arr.length + 1, cpf.length);
            }
            if (arr.length > 6 && arr.length <= 9) {
                return cpf.slice(arr.length + 2, cpf.length);
            }
            if (arr.length > 9 && arr.length < 11) {
                return cpf.slice(arr.length + 3, cpf.length);
            }
            if (arr.length === 11) {
                return '';
            }
            if (arr.length === 12) {
                if (inputVal.length === 17) {
                    return cnpj.slice(16, cnpj.length);
                }
                return cnpj.slice(15, cnpj.length);
            }
            if (arr.length > 12 && arr.length <= 14) {
                return cnpj.slice(arr.length + 4, cnpj.length);
            }
            return '';
        };
        /**
         * Propogates the input value back to the Angular model by triggering the onChange function. It won't do this if writingValue
         * is true. If that is true it means we are currently in the writeValue function, which is supposed to only update the actual
         * DOM element based on the Angular model value. It should be a one way process, i.e. writeValue should not be modifying the Angular
         * model value too. Therefore, we don't trigger onChange in this scenario.
         * @param inputValue the current form input value
         */
        MaskService.prototype.formControlResult = function (inputValue) {
            if (this.writingValue || this.maskChanged) {
                this.maskChanged = false;
                return;
            }
            if (Array.isArray(this.dropSpecialCharacters)) {
                this.onChange(this._toNumber(this._removeMask(this._removeSuffix(this._removePrefix(inputValue)), this.dropSpecialCharacters)));
            }
            else if (this.dropSpecialCharacters) {
                this.onChange(this._toNumber(this._checkSymbols(inputValue)));
            }
            else {
                this.onChange(this._removeSuffix(inputValue));
            }
        };
        MaskService.prototype._toNumber = function (value) {
            if (!this.isNumberValue || value === '') {
                return value;
            }
            var num = Number(value);
            return Number.isNaN(num) ? value : num;
        };
        MaskService.prototype._removeMask = function (value, specialCharactersForRemove) {
            return value ? value.replace(this._regExpForRemove(specialCharactersForRemove), '') : value;
        };
        MaskService.prototype._removePrefix = function (value) {
            if (!this.prefix) {
                return value;
            }
            return value ? value.replace(this.prefix, '') : value;
        };
        MaskService.prototype._removeSuffix = function (value) {
            if (!this.suffix) {
                return value;
            }
            return value ? value.replace(this.suffix, '') : value;
        };
        MaskService.prototype._retrieveSeparatorValue = function (result) {
            return this._removeMask(this._removeSuffix(this._removePrefix(result)), this.maskSpecialCharacters);
        };
        MaskService.prototype._regExpForRemove = function (specialCharactersForRemove) {
            return new RegExp(specialCharactersForRemove.map(function (item) { return "\\" + item; }).join('|'), 'gi');
        };
        MaskService.prototype._checkSymbols = function (result) {
            if (result === '') {
                return result;
            }
            var separatorPrecision = this._retrieveSeparatorPrecision(this.maskExpression);
            var separatorValue = this._retrieveSeparatorValue(result);
            if (this.decimalMarker !== '.') {
                separatorValue = separatorValue.replace(this.decimalMarker, '.');
            }
            if (!this.isNumberValue) {
                return separatorValue;
            }
            if (separatorPrecision) {
                if (result === this.decimalMarker) {
                    return null;
                }
                return this._checkPrecision(this.maskExpression, separatorValue);
            }
            else {
                return Number(separatorValue);
            }
        };
        // TODO should think about helpers or separting decimal precision to own property
        MaskService.prototype._retrieveSeparatorPrecision = function (maskExpretion) {
            var matcher = maskExpretion.match(new RegExp("^separator\\.([^d]*)"));
            return matcher ? Number(matcher[1]) : null;
        };
        MaskService.prototype._checkPrecision = function (separatorExpression, separatorValue) {
            if (separatorExpression.indexOf('2') > 0) {
                return Number(separatorValue).toFixed(2);
            }
            return Number(separatorValue);
        };
        return MaskService;
    }(MaskApplierService));
    MaskService.decorators = [
        { type: core.Injectable }
    ];
    MaskService.ctorParameters = function () { return [
        { type: undefined, decorators: [{ type: core.Inject, args: [common.DOCUMENT,] }] },
        { type: undefined, decorators: [{ type: core.Inject, args: [config,] }] },
        { type: core.ElementRef },
        { type: core.Renderer2 }
    ]; };

    // tslint:disable deprecation
    // tslint:disable no-input-rename
    var MaskDirective = /** @class */ (function () {
        function MaskDirective(document, _maskService, _config) {
            this.document = document;
            this._maskService = _maskService;
            this._config = _config;
            this.maskExpression = '';
            this.specialCharacters = [];
            this.patterns = {};
            this.prefix = '';
            this.suffix = '';
            this.thousandSeparator = ' ';
            this.decimalMarker = '.';
            this.dropSpecialCharacters = null;
            this.hiddenInput = null;
            this.showMaskTyped = null;
            this.placeHolderCharacter = null;
            this.shownMaskExpression = null;
            this.showTemplate = null;
            this.clearIfNotMatch = null;
            this.validation = null;
            this.separatorLimit = null;
            this.allowNegativeNumbers = null;
            this.leadZeroDateTime = null;
            this._maskValue = '';
            this._position = null;
            this._maskExpressionArray = [];
            this._justPasted = false;
            this.onChange = function (_) { };
            this.onTouch = function () { };
        }
        MaskDirective.prototype.ngOnChanges = function (changes) {
            var maskExpression = changes.maskExpression, specialCharacters = changes.specialCharacters, patterns = changes.patterns, prefix = changes.prefix, suffix = changes.suffix, thousandSeparator = changes.thousandSeparator, decimalMarker = changes.decimalMarker, dropSpecialCharacters = changes.dropSpecialCharacters, hiddenInput = changes.hiddenInput, showMaskTyped = changes.showMaskTyped, placeHolderCharacter = changes.placeHolderCharacter, shownMaskExpression = changes.shownMaskExpression, showTemplate = changes.showTemplate, clearIfNotMatch = changes.clearIfNotMatch, validation = changes.validation, separatorLimit = changes.separatorLimit, allowNegativeNumbers = changes.allowNegativeNumbers, leadZeroDateTime = changes.leadZeroDateTime;
            if (maskExpression) {
                if (maskExpression.currentValue !== maskExpression.previousValue && !maskExpression.firstChange) {
                    this._maskService.maskChanged = true;
                }
                this._maskValue = maskExpression.currentValue || '';
                if (maskExpression.currentValue && maskExpression.currentValue.split('||').length > 1) {
                    this._maskExpressionArray = maskExpression.currentValue.split('||').sort(function (a, b) {
                        return a.length - b.length;
                    });
                    this._maskValue = this._maskExpressionArray[0];
                    this.maskExpression = this._maskExpressionArray[0];
                    this._maskService.maskExpression = this._maskExpressionArray[0];
                }
            }
            if (specialCharacters) {
                if (!specialCharacters.currentValue || !Array.isArray(specialCharacters.currentValue)) {
                    return;
                }
                else {
                    this._maskService.maskSpecialCharacters = specialCharacters.currentValue || [];
                }
            }
            // Only overwrite the mask available patterns if a pattern has actually been passed in
            if (patterns && patterns.currentValue) {
                this._maskService.maskAvailablePatterns = patterns.currentValue;
            }
            if (prefix) {
                this._maskService.prefix = prefix.currentValue;
            }
            if (suffix) {
                this._maskService.suffix = suffix.currentValue;
            }
            if (thousandSeparator) {
                this._maskService.thousandSeparator = thousandSeparator.currentValue;
            }
            if (decimalMarker) {
                this._maskService.decimalMarker = decimalMarker.currentValue;
            }
            if (dropSpecialCharacters) {
                this._maskService.dropSpecialCharacters = dropSpecialCharacters.currentValue;
            }
            if (hiddenInput) {
                this._maskService.hiddenInput = hiddenInput.currentValue;
            }
            if (showMaskTyped) {
                this._maskService.showMaskTyped = showMaskTyped.currentValue;
            }
            if (placeHolderCharacter) {
                this._maskService.placeHolderCharacter = placeHolderCharacter.currentValue;
            }
            if (shownMaskExpression) {
                this._maskService.shownMaskExpression = shownMaskExpression.currentValue;
            }
            if (showTemplate) {
                this._maskService.showTemplate = showTemplate.currentValue;
            }
            if (clearIfNotMatch) {
                this._maskService.clearIfNotMatch = clearIfNotMatch.currentValue;
            }
            if (validation) {
                this._maskService.validation = validation.currentValue;
            }
            if (separatorLimit) {
                this._maskService.separatorLimit = separatorLimit.currentValue;
            }
            if (allowNegativeNumbers) {
                this._maskService.allowNegativeNumbers = allowNegativeNumbers.currentValue;
                if (this._maskService.allowNegativeNumbers) {
                    this._maskService.maskSpecialCharacters = this._maskService.maskSpecialCharacters.filter(function (c) { return c !== '-'; });
                }
            }
            if (leadZeroDateTime) {
                this._maskService.leadZeroDateTime = leadZeroDateTime.currentValue;
            }
            this._applyMask();
        };
        // tslint:disable-next-line: cyclomatic-complexity
        MaskDirective.prototype.validate = function (_c) {
            var value = _c.value;
            if (!this._maskService.validation || !this._maskValue) {
                return null;
            }
            if (this._maskService.ipError) {
                return this._createValidationError(value);
            }
            if (this._maskService.cpfCnpjError) {
                return this._createValidationError(value);
            }
            if (this._maskValue.startsWith('separator')) {
                return null;
            }
            if (withoutValidation.includes(this._maskValue)) {
                return null;
            }
            if (this._maskService.clearIfNotMatch) {
                return null;
            }
            if (timeMasks.includes(this._maskValue)) {
                return this._validateTime(value);
            }
            if (value && value.toString().length >= 1) {
                var counterOfOpt = 0;
                var _loop_1 = function (key) {
                    if (this_1._maskService.maskAvailablePatterns[key].optional &&
                        this_1._maskService.maskAvailablePatterns[key].optional === true) {
                        if (this_1._maskValue.indexOf(key) !== this_1._maskValue.lastIndexOf(key)) {
                            var opt = this_1._maskValue
                                .split('')
                                .filter(function (i) { return i === key; })
                                .join('');
                            counterOfOpt += opt.length;
                        }
                        else if (this_1._maskValue.indexOf(key) !== -1) {
                            counterOfOpt++;
                        }
                        if (this_1._maskValue.indexOf(key) !== -1 && value.toString().length >= this_1._maskValue.indexOf(key)) {
                            return { value: null };
                        }
                        if (counterOfOpt === this_1._maskValue.length) {
                            return { value: null };
                        }
                    }
                };
                var this_1 = this;
                for (var key in this._maskService.maskAvailablePatterns) {
                    var state_1 = _loop_1(key);
                    if (typeof state_1 === "object")
                        return state_1.value;
                }
                if (this._maskValue.indexOf('{') === 1 &&
                    value.toString().length === this._maskValue.length + Number(this._maskValue.split('{')[1].split('}')[0]) - 4) {
                    return null;
                }
                if (this._maskValue.indexOf('*') === 1 || this._maskValue.indexOf('?') === 1) {
                    return null;
                }
                else if ((this._maskValue.indexOf('*') > 1 && value.toString().length < this._maskValue.indexOf('*')) ||
                    (this._maskValue.indexOf('?') > 1 && value.toString().length < this._maskValue.indexOf('?')) ||
                    this._maskValue.indexOf('{') === 1) {
                    return this._createValidationError(value);
                }
                if (this._maskValue.indexOf('*') === -1 || this._maskValue.indexOf('?') === -1) {
                    var length = this._maskService.dropSpecialCharacters
                        ? this._maskValue.length - this._maskService.checkSpecialCharAmount(this._maskValue) - counterOfOpt
                        : this._maskValue.length - counterOfOpt;
                    if (value.toString().length < length) {
                        return this._createValidationError(value);
                    }
                }
            }
            return null;
        };
        MaskDirective.prototype.onPaste = function () {
            this._justPasted = true;
        };
        MaskDirective.prototype.onInput = function (e) {
            var _this = this;
            var el = e.target;
            this._inputValue = el.value;
            this._setMask();
            if (!this._maskValue) {
                this.onChange(el.value);
                return;
            }
            var position = el.selectionStart === 1
                ? el.selectionStart + this._maskService.prefix.length
                : el.selectionStart;
            var caretShift = 0;
            var backspaceShift = false;
            this._maskService.applyValueChanges(position, this._justPasted, this._code === 'Backspace' || this._code === 'Delete', function (shift, _backspaceShift) {
                _this._justPasted = false;
                caretShift = shift;
                backspaceShift = _backspaceShift;
            });
            // only set the selection if the element is active
            if (this.document.activeElement !== el) {
                return;
            }
            this._position = this._position === 1 && this._inputValue.length === 1 ? null : this._position;
            var positionToApply = this._position
                ? this._inputValue.length + position + caretShift
                : position + (this._code === 'Backspace' && !backspaceShift ? 0 : caretShift);
            if (positionToApply > this._getActualInputLength()) {
                positionToApply = this._getActualInputLength();
            }
            if (positionToApply < 0) {
                positionToApply = 0;
            }
            el.setSelectionRange(positionToApply, positionToApply);
            this._position = null;
        };
        MaskDirective.prototype.onBlur = function () {
            if (this._maskValue) {
                this._maskService.clearIfNotMatchFn();
            }
            this.onTouch();
        };
        MaskDirective.prototype.onFocus = function (e) {
            if (!this._maskValue) {
                return;
            }
            var el = e.target;
            var posStart = 0;
            var posEnd = 0;
            if (el !== null &&
                el.selectionStart !== null &&
                el.selectionStart === el.selectionEnd &&
                el.selectionStart > this._maskService.prefix.length &&
                // tslint:disable-next-line
                e.keyCode !== 38) {
                if (this._maskService.showMaskTyped) {
                    // We are showing the mask in the input
                    this._maskService.maskIsShown = this._maskService.showMaskInInput();
                    if (el.setSelectionRange && this._maskService.prefix + this._maskService.maskIsShown === el.value) {
                        // the input ONLY contains the mask, so position the cursor at the start
                        el.focus();
                        el.setSelectionRange(posStart, posEnd);
                    }
                    else {
                        // the input contains some characters already
                        if (el.selectionStart > this._maskService.actualValue.length) {
                            // if the user clicked beyond our value's length, position the cursor at the end of our value
                            el.setSelectionRange(this._maskService.actualValue.length, this._maskService.actualValue.length);
                        }
                    }
                }
            }
            var nextValue = !el.value || el.value === this._maskService.prefix
                ? this._maskService.prefix + this._maskService.maskIsShown
                : el.value;
            /** Fix of cursor position jumping to end in most browsers no matter where cursor is inserted onFocus */
            if (el.value !== nextValue) {
                el.value = nextValue;
            }
            /** fix of cursor position with prefix when mouse click occur */
            if ((el.selectionStart || el.selectionEnd) <= this._maskService.prefix.length) {
                el.selectionStart = this._maskService.prefix.length;
                return;
            }
            /** select only inserted text */
            if (el.selectionEnd > this._getActualInputLength()) {
                el.selectionEnd = this._getActualInputLength();
            }
        };
        // tslint:disable-next-line: cyclomatic-complexity
        MaskDirective.prototype.onKeyDown = function (e) {
            var _a;
            if (!this._maskValue) {
                return;
            }
            this._code = e.code ? e.code : e.key;
            var el = e.target;
            this._inputValue = el.value;
            this._setMask();
            if (e.keyCode === 38) {
                e.preventDefault();
            }
            if (e.keyCode === 37 || e.keyCode === 8 || e.keyCode === 46) {
                if (e.keyCode === 8 && el.value.length === 0) {
                    el.selectionStart = el.selectionEnd;
                }
                if (e.keyCode === 8 && el.selectionStart !== 0) {
                    // If specialChars is false, (shouldn't ever happen) then set to the defaults
                    this.specialCharacters = ((_a = this.specialCharacters) === null || _a === void 0 ? void 0 : _a.length)
                        ? this.specialCharacters
                        : this._config.specialCharacters;
                    if (this.prefix.length > 1 && el.selectionStart <= this.prefix.length) {
                        el.setSelectionRange(this.prefix.length, this.prefix.length);
                    }
                    else {
                        if (this._inputValue.length !== el.selectionStart && el.selectionStart !== 1) {
                            while (this.specialCharacters.includes(this._inputValue[el.selectionStart - 1].toString()) &&
                                ((this.prefix.length >= 1 && el.selectionStart > this.prefix.length) ||
                                    this.prefix.length === 0)) {
                                el.setSelectionRange(el.selectionStart - 1, el.selectionStart - 1);
                            }
                        }
                        this.suffixCheckOnPressDelete(e.keyCode, el);
                    }
                }
                this.suffixCheckOnPressDelete(e.keyCode, el);
                if (this._maskService.prefix.length &&
                    el.selectionStart <= this._maskService.prefix.length &&
                    el.selectionEnd <= this._maskService.prefix.length) {
                    e.preventDefault();
                }
                var cursorStart = el.selectionStart;
                // this.onFocus(e);
                if (e.keyCode === 8 &&
                    !el.readOnly &&
                    cursorStart === 0 &&
                    el.selectionEnd === el.value.length &&
                    el.value.length !== 0) {
                    this._position = this._maskService.prefix ? this._maskService.prefix.length : 0;
                    this._maskService.applyMask(this._maskService.prefix, this._maskService.maskExpression, this._position);
                }
            }
            if (!!this.suffix &&
                this.suffix.length > 1 &&
                this._inputValue.length - this.suffix.length < el.selectionStart) {
                el.setSelectionRange(this._inputValue.length - this.suffix.length, this._inputValue.length);
            }
            else if ((e.keyCode === 65 && e.ctrlKey === true) || // Ctrl+ A
                (e.keyCode === 65 && e.metaKey === true) // Cmd + A (Mac)
            ) {
                el.setSelectionRange(0, this._getActualInputLength());
                e.preventDefault();
            }
            this._maskService.selStart = el.selectionStart;
            this._maskService.selEnd = el.selectionEnd;
        };
        /** It writes the value in the input */
        MaskDirective.prototype.writeValue = function (inputValue) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_c) {
                    if (typeof inputValue === 'object' && inputValue !== null && 'value' in inputValue) {
                        if ('disable' in inputValue) {
                            this.setDisabledState(Boolean(inputValue.disable));
                        }
                        inputValue = inputValue.value;
                    }
                    if (inputValue === undefined) {
                        inputValue = '';
                    }
                    if (typeof inputValue === 'number') {
                        inputValue = String(inputValue);
                        inputValue = this.decimalMarker !== '.' ? inputValue.replace('.', this.decimalMarker) : inputValue;
                        this._maskService.isNumberValue = true;
                    }
                    this._inputValue = inputValue;
                    this._setMask();
                    if ((inputValue && this._maskService.maskExpression) ||
                        (this._maskService.maskExpression && (this._maskService.prefix || this._maskService.showMaskTyped))) {
                        // Let the service we know we are writing value so that triggering onChange function wont happen during applyMask
                        this._maskService.writingValue = true;
                        this._maskService.formElementProperty = [
                            'value',
                            this._maskService.applyMask(inputValue, this._maskService.maskExpression),
                        ];
                        // Let the service know we've finished writing value
                        this._maskService.writingValue = false;
                    }
                    else {
                        this._maskService.formElementProperty = ['value', inputValue];
                    }
                    this._inputValue = inputValue;
                    return [2 /*return*/];
                });
            });
        };
        MaskDirective.prototype.registerOnChange = function (fn) {
            this.onChange = fn;
            this._maskService.onChange = this.onChange;
        };
        MaskDirective.prototype.registerOnTouched = function (fn) {
            this.onTouch = fn;
        };
        MaskDirective.prototype.suffixCheckOnPressDelete = function (keyCode, el) {
            if (keyCode === 46 && this.suffix.length > 0) {
                if (this._inputValue.length - this.suffix.length <= el.selectionStart) {
                    el.setSelectionRange(this._inputValue.length - this.suffix.length, this._inputValue.length);
                }
            }
            if (keyCode === 8) {
                if (this.suffix.length > 1 && this._inputValue.length - this.suffix.length < el.selectionStart) {
                    el.setSelectionRange(this._inputValue.length - this.suffix.length, this._inputValue.length);
                }
                if (this.suffix.length === 1 && this._inputValue.length === el.selectionStart) {
                    el.setSelectionRange(el.selectionStart - 1, el.selectionStart - 1);
                }
            }
        };
        /** It disables the input element */
        MaskDirective.prototype.setDisabledState = function (isDisabled) {
            this._maskService.formElementProperty = ['disabled', isDisabled];
        };
        MaskDirective.prototype._repeatPatternSymbols = function (maskExp) {
            var _this = this;
            return ((maskExp.match(/{[0-9]+}/) &&
                maskExp.split('').reduce(function (accum, currval, index) {
                    _this._start = currval === '{' ? index : _this._start;
                    if (currval !== '}') {
                        return _this._maskService._findSpecialChar(currval) ? accum + currval : accum;
                    }
                    _this._end = index;
                    var repeatNumber = Number(maskExp.slice(_this._start + 1, _this._end));
                    var replaceWith = new Array(repeatNumber + 1).join(maskExp[_this._start - 1]);
                    return accum + replaceWith;
                }, '')) ||
                maskExp);
        };
        // tslint:disable-next-line:no-any
        MaskDirective.prototype._applyMask = function () {
            this._maskService.maskExpression = this._repeatPatternSymbols(this._maskValue || '');
            this._maskService.formElementProperty = [
                'value',
                this._maskService.applyMask(this._inputValue, this._maskService.maskExpression),
            ];
        };
        MaskDirective.prototype._validateTime = function (value) {
            var rowMaskLen = this._maskValue.split('').filter(function (s) { return s !== ':'; }).length;
            if (!value) {
                return null; // Don't validate empty values to allow for optional form control
            }
            if ((+value[value.length - 1] === 0 && value.length < rowMaskLen) || value.length <= rowMaskLen - 2) {
                return this._createValidationError(value);
            }
            return null;
        };
        MaskDirective.prototype._getActualInputLength = function () {
            return (this._maskService.actualValue.length || this._maskService.actualValue.length + this._maskService.prefix.length);
        };
        MaskDirective.prototype._createValidationError = function (actualValue) {
            return {
                mask: {
                    requiredMask: this._maskValue,
                    actualValue: actualValue,
                },
            };
        };
        MaskDirective.prototype._setMask = function () {
            var _this = this;
            if (this._maskExpressionArray.length > 0) {
                this._maskExpressionArray.some(function (mask) {
                    var _a, _b;
                    var test = ((_a = _this._maskService.removeMask(_this._inputValue)) === null || _a === void 0 ? void 0 : _a.length) <= ((_b = _this._maskService.removeMask(mask)) === null || _b === void 0 ? void 0 : _b.length);
                    if (_this._inputValue && test) {
                        _this._maskValue = mask;
                        _this.maskExpression = mask;
                        _this._maskService.maskExpression = mask;
                        return test;
                    }
                    else {
                        _this._maskValue = _this._maskExpressionArray[_this._maskExpressionArray.length - 1];
                        _this.maskExpression = _this._maskExpressionArray[_this._maskExpressionArray.length - 1];
                        _this._maskService.maskExpression = _this._maskExpressionArray[_this._maskExpressionArray.length - 1];
                    }
                });
            }
        };
        return MaskDirective;
    }());
    MaskDirective.decorators = [
        { type: core.Directive, args: [{
                    selector: 'input[mask], textarea[mask]',
                    providers: [
                        {
                            provide: forms.NG_VALUE_ACCESSOR,
                            useExisting: core.forwardRef(function () { return MaskDirective; }),
                            multi: true,
                        },
                        {
                            provide: forms.NG_VALIDATORS,
                            useExisting: core.forwardRef(function () { return MaskDirective; }),
                            multi: true,
                        },
                        MaskService,
                    ],
                },] }
    ];
    MaskDirective.ctorParameters = function () { return [
        { type: undefined, decorators: [{ type: core.Inject, args: [common.DOCUMENT,] }] },
        { type: MaskService },
        { type: undefined, decorators: [{ type: core.Inject, args: [config,] }] }
    ]; };
    MaskDirective.propDecorators = {
        maskExpression: [{ type: core.Input, args: ['mask',] }],
        specialCharacters: [{ type: core.Input }],
        patterns: [{ type: core.Input }],
        prefix: [{ type: core.Input }],
        suffix: [{ type: core.Input }],
        thousandSeparator: [{ type: core.Input }],
        decimalMarker: [{ type: core.Input }],
        dropSpecialCharacters: [{ type: core.Input }],
        hiddenInput: [{ type: core.Input }],
        showMaskTyped: [{ type: core.Input }],
        placeHolderCharacter: [{ type: core.Input }],
        shownMaskExpression: [{ type: core.Input }],
        showTemplate: [{ type: core.Input }],
        clearIfNotMatch: [{ type: core.Input }],
        validation: [{ type: core.Input }],
        separatorLimit: [{ type: core.Input }],
        allowNegativeNumbers: [{ type: core.Input }],
        leadZeroDateTime: [{ type: core.Input }],
        onPaste: [{ type: core.HostListener, args: ['paste',] }],
        onInput: [{ type: core.HostListener, args: ['input', ['$event'],] }],
        onBlur: [{ type: core.HostListener, args: ['blur',] }],
        onFocus: [{ type: core.HostListener, args: ['click', ['$event'],] }],
        onKeyDown: [{ type: core.HostListener, args: ['keydown', ['$event'],] }]
    };

    var MaskPipe = /** @class */ (function () {
        function MaskPipe(_maskService) {
            this._maskService = _maskService;
        }
        MaskPipe.prototype.transform = function (value, mask, thousandSeparator) {
            if (thousandSeparator === void 0) { thousandSeparator = null; }
            if (!value && typeof value !== 'number') {
                return '';
            }
            if (thousandSeparator) {
                this._maskService.thousandSeparator = thousandSeparator;
            }
            if (typeof mask === 'string') {
                return this._maskService.applyMask("" + value, mask);
            }
            return this._maskService.applyMaskWithPattern("" + value, mask);
        };
        return MaskPipe;
    }());
    MaskPipe.decorators = [
        { type: core.Pipe, args: [{
                    name: 'mask',
                    pure: true,
                },] }
    ];
    MaskPipe.ctorParameters = function () { return [
        { type: MaskApplierService }
    ]; };

    var NgxMaskModule = /** @class */ (function () {
        function NgxMaskModule() {
        }
        NgxMaskModule.forRoot = function (configValue) {
            return {
                ngModule: NgxMaskModule,
                providers: [
                    {
                        provide: NEW_CONFIG,
                        useValue: configValue,
                    },
                    {
                        provide: INITIAL_CONFIG,
                        useValue: initialConfig,
                    },
                    {
                        provide: config,
                        useFactory: _configFactory,
                        deps: [INITIAL_CONFIG, NEW_CONFIG],
                    },
                    MaskApplierService,
                ],
            };
        };
        NgxMaskModule.forChild = function () {
            return {
                ngModule: NgxMaskModule,
            };
        };
        return NgxMaskModule;
    }());
    NgxMaskModule.decorators = [
        { type: core.NgModule, args: [{
                    exports: [MaskDirective, MaskPipe],
                    declarations: [MaskDirective, MaskPipe],
                },] }
    ];
    /**
     * @internal
     */
    function _configFactory(initConfig, configValue) {
        return configValue instanceof Function ? Object.assign(Object.assign({}, initConfig), configValue()) : Object.assign(Object.assign({}, initConfig), configValue);
    }

    var commonjsGlobal = typeof globalThis !== 'undefined'
        ? globalThis
        : typeof window !== 'undefined'
            ? window
            : typeof global !== 'undefined'
                ? global
                : typeof self !== 'undefined'
                    ? self
                    : {};
    (function () {
        if (!commonjsGlobal.KeyboardEvent) {
            commonjsGlobal.KeyboardEvent = function (_eventType, _init) { };
        }
    })();

    /**
     * Generated bundle index. Do not edit.
     */

    exports.INITIAL_CONFIG = INITIAL_CONFIG;
    exports.MaskApplierService = MaskApplierService;
    exports.MaskDirective = MaskDirective;
    exports.MaskPipe = MaskPipe;
    exports.MaskService = MaskService;
    exports.NEW_CONFIG = NEW_CONFIG;
    exports.NgxMaskModule = NgxMaskModule;
    exports._configFactory = _configFactory;
    exports.config = config;
    exports.initialConfig = initialConfig;
    exports.timeMasks = timeMasks;
    exports.withoutValidation = withoutValidation;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=ngx-mask.umd.js.map
