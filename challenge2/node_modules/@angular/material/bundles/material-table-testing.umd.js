(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/cdk/testing')) :
    typeof define === 'function' && define.amd ? define('@angular/material/table/testing', ['exports', '@angular/cdk/testing'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.ng = global.ng || {}, global.ng.material = global.ng.material || {}, global.ng.material.table = global.ng.material.table || {}, global.ng.material.table.testing = {}), global.ng.cdk.testing));
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

    /** Harness for interacting with a standard Angular Material table cell. */
    var MatCellHarness = /** @class */ (function (_super) {
        __extends(MatCellHarness, _super);
        function MatCellHarness() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
         * Gets a `HarnessPredicate` that can be used to search for a table cell with specific attributes.
         * @param options Options for narrowing the search
         * @return a `HarnessPredicate` configured with the given options.
         */
        MatCellHarness.with = function (options) {
            if (options === void 0) { options = {}; }
            return MatCellHarness._getCellPredicate(MatCellHarness, options);
        };
        /** Gets the cell's text. */
        MatCellHarness.prototype.getText = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1: return [2 /*return*/, (_a.sent()).text()];
                    }
                });
            });
        };
        /** Gets the name of the column that the cell belongs to. */
        MatCellHarness.prototype.getColumnName = function () {
            return __awaiter(this, void 0, void 0, function () {
                var host, classAttribute, prefix_1, name;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1:
                            host = _a.sent();
                            return [4 /*yield*/, host.getAttribute('class')];
                        case 2:
                            classAttribute = _a.sent();
                            if (classAttribute) {
                                prefix_1 = 'mat-column-';
                                name = classAttribute.split(' ').map(function (c) { return c.trim(); }).find(function (c) { return c.startsWith(prefix_1); });
                                if (name) {
                                    return [2 /*return*/, name.split(prefix_1)[1]];
                                }
                            }
                            throw Error('Could not determine column name of cell.');
                    }
                });
            });
        };
        MatCellHarness._getCellPredicate = function (type, options) {
            return new testing.HarnessPredicate(type, options)
                .addOption('text', options.text, function (harness, text) { return testing.HarnessPredicate.stringMatches(harness.getText(), text); })
                .addOption('columnName', options.columnName, function (harness, name) { return testing.HarnessPredicate.stringMatches(harness.getColumnName(), name); });
        };
        return MatCellHarness;
    }(testing.ContentContainerComponentHarness));
    /** The selector for the host element of a `MatCellHarness` instance. */
    MatCellHarness.hostSelector = '.mat-cell';
    /** Harness for interacting with a standard Angular Material table header cell. */
    var MatHeaderCellHarness = /** @class */ (function (_super) {
        __extends(MatHeaderCellHarness, _super);
        function MatHeaderCellHarness() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
         * Gets a `HarnessPredicate` that can be used to search for
         * a table header cell with specific attributes.
         * @param options Options for narrowing the search
         * @return a `HarnessPredicate` configured with the given options.
         */
        MatHeaderCellHarness.with = function (options) {
            if (options === void 0) { options = {}; }
            return MatHeaderCellHarness._getCellPredicate(MatHeaderCellHarness, options);
        };
        return MatHeaderCellHarness;
    }(MatCellHarness));
    /** The selector for the host element of a `MatHeaderCellHarness` instance. */
    MatHeaderCellHarness.hostSelector = '.mat-header-cell';
    /** Harness for interacting with a standard Angular Material table footer cell. */
    var MatFooterCellHarness = /** @class */ (function (_super) {
        __extends(MatFooterCellHarness, _super);
        function MatFooterCellHarness() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
         * Gets a `HarnessPredicate` that can be used to search for
         * a table footer cell with specific attributes.
         * @param options Options for narrowing the search
         * @return a `HarnessPredicate` configured with the given options.
         */
        MatFooterCellHarness.with = function (options) {
            if (options === void 0) { options = {}; }
            return MatFooterCellHarness._getCellPredicate(MatFooterCellHarness, options);
        };
        return MatFooterCellHarness;
    }(MatCellHarness));
    /** The selector for the host element of a `MatFooterCellHarness` instance. */
    MatFooterCellHarness.hostSelector = '.mat-footer-cell';

    var _MatRowHarnessBase = /** @class */ (function (_super) {
        __extends(_MatRowHarnessBase, _super);
        function _MatRowHarnessBase() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /** Gets a list of `MatCellHarness` for all cells in the row. */
        _MatRowHarnessBase.prototype.getCells = function (filter) {
            if (filter === void 0) { filter = {}; }
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.locatorForAll(this._cellHarness.with(filter))()];
                });
            });
        };
        /** Gets the text of the cells in the row. */
        _MatRowHarnessBase.prototype.getCellTextByIndex = function (filter) {
            if (filter === void 0) { filter = {}; }
            return __awaiter(this, void 0, void 0, function () {
                var cells;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.getCells(filter)];
                        case 1:
                            cells = _a.sent();
                            return [2 /*return*/, testing.parallel(function () { return cells.map(function (cell) { return cell.getText(); }); })];
                    }
                });
            });
        };
        /** Gets the text inside the row organized by columns. */
        _MatRowHarnessBase.prototype.getCellTextByColumnName = function () {
            return __awaiter(this, void 0, void 0, function () {
                var output, cells, cellsData;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            output = {};
                            return [4 /*yield*/, this.getCells()];
                        case 1:
                            cells = _a.sent();
                            return [4 /*yield*/, testing.parallel(function () { return cells.map(function (cell) {
                                    return testing.parallel(function () { return [cell.getColumnName(), cell.getText()]; });
                                }); })];
                        case 2:
                            cellsData = _a.sent();
                            cellsData.forEach(function (_a) {
                                var _b = __read(_a, 2), columnName = _b[0], text = _b[1];
                                return output[columnName] = text;
                            });
                            return [2 /*return*/, output];
                    }
                });
            });
        };
        return _MatRowHarnessBase;
    }(testing.ComponentHarness));
    /** Harness for interacting with a standard Angular Material table row. */
    var MatRowHarness = /** @class */ (function (_super) {
        __extends(MatRowHarness, _super);
        function MatRowHarness() {
            var _this = _super.apply(this, __spreadArray([], __read(arguments))) || this;
            _this._cellHarness = MatCellHarness;
            return _this;
        }
        /**
         * Gets a `HarnessPredicate` that can be used to search for a table row with specific attributes.
         * @param options Options for narrowing the search
         * @return a `HarnessPredicate` configured with the given options.
         */
        MatRowHarness.with = function (options) {
            if (options === void 0) { options = {}; }
            return new testing.HarnessPredicate(MatRowHarness, options);
        };
        return MatRowHarness;
    }(_MatRowHarnessBase));
    /** The selector for the host element of a `MatRowHarness` instance. */
    MatRowHarness.hostSelector = '.mat-row';
    /** Harness for interacting with a standard Angular Material table header row. */
    var MatHeaderRowHarness = /** @class */ (function (_super) {
        __extends(MatHeaderRowHarness, _super);
        function MatHeaderRowHarness() {
            var _this = _super.apply(this, __spreadArray([], __read(arguments))) || this;
            _this._cellHarness = MatHeaderCellHarness;
            return _this;
        }
        /**
         * Gets a `HarnessPredicate` that can be used to search for
         * a table header row with specific attributes.
         * @param options Options for narrowing the search
         * @return a `HarnessPredicate` configured with the given options.
         */
        MatHeaderRowHarness.with = function (options) {
            if (options === void 0) { options = {}; }
            return new testing.HarnessPredicate(MatHeaderRowHarness, options);
        };
        return MatHeaderRowHarness;
    }(_MatRowHarnessBase));
    /** The selector for the host element of a `MatHeaderRowHarness` instance. */
    MatHeaderRowHarness.hostSelector = '.mat-header-row';
    /** Harness for interacting with a standard Angular Material table footer row. */
    var MatFooterRowHarness = /** @class */ (function (_super) {
        __extends(MatFooterRowHarness, _super);
        function MatFooterRowHarness() {
            var _this = _super.apply(this, __spreadArray([], __read(arguments))) || this;
            _this._cellHarness = MatFooterCellHarness;
            return _this;
        }
        /**
         * Gets a `HarnessPredicate` that can be used to search for
         * a table footer row cell with specific attributes.
         * @param options Options for narrowing the search
         * @return a `HarnessPredicate` configured with the given options.
         */
        MatFooterRowHarness.with = function (options) {
            if (options === void 0) { options = {}; }
            return new testing.HarnessPredicate(MatFooterRowHarness, options);
        };
        return MatFooterRowHarness;
    }(_MatRowHarnessBase));
    /** The selector for the host element of a `MatFooterRowHarness` instance. */
    MatFooterRowHarness.hostSelector = '.mat-footer-row';

    var _MatTableHarnessBase = /** @class */ (function (_super) {
        __extends(_MatTableHarnessBase, _super);
        function _MatTableHarnessBase() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /** Gets all of the header rows in a table. */
        _MatTableHarnessBase.prototype.getHeaderRows = function (filter) {
            if (filter === void 0) { filter = {}; }
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.locatorForAll(this._headerRowHarness.with(filter))()];
                });
            });
        };
        /** Gets all of the regular data rows in a table. */
        _MatTableHarnessBase.prototype.getRows = function (filter) {
            if (filter === void 0) { filter = {}; }
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.locatorForAll(this._rowHarness.with(filter))()];
                });
            });
        };
        /** Gets all of the footer rows in a table. */
        _MatTableHarnessBase.prototype.getFooterRows = function (filter) {
            if (filter === void 0) { filter = {}; }
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.locatorForAll(this._footerRowHarness.with(filter))()];
                });
            });
        };
        /** Gets the text inside the entire table organized by rows. */
        _MatTableHarnessBase.prototype.getCellTextByIndex = function () {
            return __awaiter(this, void 0, void 0, function () {
                var rows;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.getRows()];
                        case 1:
                            rows = _a.sent();
                            return [2 /*return*/, testing.parallel(function () { return rows.map(function (row) { return row.getCellTextByIndex(); }); })];
                    }
                });
            });
        };
        /** Gets the text inside the entire table organized by columns. */
        _MatTableHarnessBase.prototype.getCellTextByColumnName = function () {
            return __awaiter(this, void 0, void 0, function () {
                var _a, headerRows, footerRows, dataRows, text, _b, headerData, footerData, rowsData;
                var _this = this;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0: return [4 /*yield*/, testing.parallel(function () { return [
                                _this.getHeaderRows(),
                                _this.getFooterRows(),
                                _this.getRows()
                            ]; })];
                        case 1:
                            _a = __read.apply(void 0, [_c.sent(), 3]), headerRows = _a[0], footerRows = _a[1], dataRows = _a[2];
                            text = {};
                            return [4 /*yield*/, testing.parallel(function () { return [
                                    testing.parallel(function () { return headerRows.map(function (row) { return row.getCellTextByColumnName(); }); }),
                                    testing.parallel(function () { return footerRows.map(function (row) { return row.getCellTextByColumnName(); }); }),
                                    testing.parallel(function () { return dataRows.map(function (row) { return row.getCellTextByColumnName(); }); }),
                                ]; })];
                        case 2:
                            _b = __read.apply(void 0, [_c.sent(), 3]), headerData = _b[0], footerData = _b[1], rowsData = _b[2];
                            rowsData.forEach(function (data) {
                                Object.keys(data).forEach(function (columnName) {
                                    var cellText = data[columnName];
                                    if (!text[columnName]) {
                                        text[columnName] = {
                                            headerText: getCellTextsByColumn(headerData, columnName),
                                            footerText: getCellTextsByColumn(footerData, columnName),
                                            text: []
                                        };
                                    }
                                    text[columnName].text.push(cellText);
                                });
                            });
                            return [2 /*return*/, text];
                    }
                });
            });
        };
        return _MatTableHarnessBase;
    }(testing.ContentContainerComponentHarness));
    /** Harness for interacting with a standard mat-table in tests. */
    var MatTableHarness = /** @class */ (function (_super) {
        __extends(MatTableHarness, _super);
        function MatTableHarness() {
            var _this = _super.apply(this, __spreadArray([], __read(arguments))) || this;
            _this._headerRowHarness = MatHeaderRowHarness;
            _this._rowHarness = MatRowHarness;
            _this._footerRowHarness = MatFooterRowHarness;
            return _this;
        }
        /**
         * Gets a `HarnessPredicate` that can be used to search for a table with specific attributes.
         * @param options Options for narrowing the search
         * @return a `HarnessPredicate` configured with the given options.
         */
        MatTableHarness.with = function (options) {
            if (options === void 0) { options = {}; }
            return new testing.HarnessPredicate(MatTableHarness, options);
        };
        return MatTableHarness;
    }(_MatTableHarnessBase));
    /** The selector for the host element of a `MatTableHarness` instance. */
    MatTableHarness.hostSelector = '.mat-table';
    /** Extracts the text of cells only under a particular column. */
    function getCellTextsByColumn(rowsData, column) {
        var columnTexts = [];
        rowsData.forEach(function (data) {
            Object.keys(data).forEach(function (columnName) {
                if (columnName === column) {
                    columnTexts.push(data[columnName]);
                }
            });
        });
        return columnTexts;
    }

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

    exports.MatCellHarness = MatCellHarness;
    exports.MatFooterCellHarness = MatFooterCellHarness;
    exports.MatFooterRowHarness = MatFooterRowHarness;
    exports.MatHeaderCellHarness = MatHeaderCellHarness;
    exports.MatHeaderRowHarness = MatHeaderRowHarness;
    exports.MatRowHarness = MatRowHarness;
    exports.MatTableHarness = MatTableHarness;
    exports._MatRowHarnessBase = _MatRowHarnessBase;
    exports._MatTableHarnessBase = _MatTableHarnessBase;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=material-table-testing.umd.js.map
