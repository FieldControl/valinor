(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/cdk/testing'), require('@angular/material/grid-list')) :
    typeof define === 'function' && define.amd ? define('@angular/material/grid-list/testing', ['exports', '@angular/cdk/testing', '@angular/material/grid-list'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.ng = global.ng || {}, global.ng.material = global.ng.material || {}, global.ng.material.gridList = global.ng.material.gridList || {}, global.ng.material.gridList.testing = {}), global.ng.cdk.testing, global.ng.material.gridList));
}(this, (function (exports, testing, gridList) { 'use strict';

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

    /** Harness for interacting with a standard `MatGridTitle` in tests. */
    var MatGridTileHarness = /** @class */ (function (_super) {
        __extends(MatGridTileHarness, _super);
        function MatGridTileHarness() {
            var _this = _super.apply(this, __spreadArray([], __read(arguments))) || this;
            _this._header = _this.locatorForOptional(".mat-grid-tile-header" /* HEADER */);
            _this._footer = _this.locatorForOptional(".mat-grid-tile-footer" /* FOOTER */);
            _this._avatar = _this.locatorForOptional('.mat-grid-avatar');
            return _this;
        }
        /**
         * Gets a `HarnessPredicate` that can be used to search for a `MatGridTileHarness`
         * that meets certain criteria.
         * @param options Options for filtering which dialog instances are considered a match.
         * @return a `HarnessPredicate` configured with the given options.
         */
        MatGridTileHarness.with = function (options) {
            if (options === void 0) { options = {}; }
            return new testing.HarnessPredicate(MatGridTileHarness, options)
                .addOption('headerText', options.headerText, function (harness, pattern) { return testing.HarnessPredicate.stringMatches(harness.getHeaderText(), pattern); })
                .addOption('footerText', options.footerText, function (harness, pattern) { return testing.HarnessPredicate.stringMatches(harness.getFooterText(), pattern); });
        };
        /** Gets the amount of rows that the grid-tile takes up. */
        MatGridTileHarness.prototype.getRowspan = function () {
            return __awaiter(this, void 0, void 0, function () {
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _a = Number;
                            return [4 /*yield*/, this.host()];
                        case 1: return [4 /*yield*/, (_b.sent()).getAttribute('rowspan')];
                        case 2: return [2 /*return*/, _a.apply(void 0, [_b.sent()])];
                    }
                });
            });
        };
        /** Gets the amount of columns that the grid-tile takes up. */
        MatGridTileHarness.prototype.getColspan = function () {
            return __awaiter(this, void 0, void 0, function () {
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _a = Number;
                            return [4 /*yield*/, this.host()];
                        case 1: return [4 /*yield*/, (_b.sent()).getAttribute('colspan')];
                        case 2: return [2 /*return*/, _a.apply(void 0, [_b.sent()])];
                    }
                });
            });
        };
        /** Whether the grid-tile has a header. */
        MatGridTileHarness.prototype.hasHeader = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this._header()];
                        case 1: return [2 /*return*/, (_a.sent()) !== null];
                    }
                });
            });
        };
        /** Whether the grid-tile has a footer. */
        MatGridTileHarness.prototype.hasFooter = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this._footer()];
                        case 1: return [2 /*return*/, (_a.sent()) !== null];
                    }
                });
            });
        };
        /** Whether the grid-tile has an avatar. */
        MatGridTileHarness.prototype.hasAvatar = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this._avatar()];
                        case 1: return [2 /*return*/, (_a.sent()) !== null];
                    }
                });
            });
        };
        /** Gets the text of the header if present. */
        MatGridTileHarness.prototype.getHeaderText = function () {
            return __awaiter(this, void 0, void 0, function () {
                var headerEl;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this._header()];
                        case 1:
                            headerEl = _a.sent();
                            return [2 /*return*/, headerEl ? headerEl.text() : null];
                    }
                });
            });
        };
        /** Gets the text of the footer if present. */
        MatGridTileHarness.prototype.getFooterText = function () {
            return __awaiter(this, void 0, void 0, function () {
                var headerEl;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this._footer()];
                        case 1:
                            headerEl = _a.sent();
                            return [2 /*return*/, headerEl ? headerEl.text() : null];
                    }
                });
            });
        };
        return MatGridTileHarness;
    }(testing.ContentContainerComponentHarness));
    /** The selector for the host element of a `MatGridTile` instance. */
    MatGridTileHarness.hostSelector = '.mat-grid-tile';

    /** Harness for interacting with a standard `MatGridList` in tests. */
    var MatGridListHarness = /** @class */ (function (_super) {
        __extends(MatGridListHarness, _super);
        function MatGridListHarness() {
            var _this = _super.apply(this, __spreadArray([], __read(arguments))) || this;
            /**
             * Tile coordinator that is used by the "MatGridList" for computing
             * positions of tiles. We leverage the coordinator to provide an API
             * for retrieving tiles based on visual tile positions.
             */
            _this._tileCoordinator = new gridList.ɵTileCoordinator();
            return _this;
        }
        /**
         * Gets a `HarnessPredicate` that can be used to search for a `MatGridListHarness`
         * that meets certain criteria.
         * @param options Options for filtering which dialog instances are considered a match.
         * @return a `HarnessPredicate` configured with the given options.
         */
        MatGridListHarness.with = function (options) {
            if (options === void 0) { options = {}; }
            return new testing.HarnessPredicate(MatGridListHarness, options);
        };
        /** Gets all tiles of the grid-list. */
        MatGridListHarness.prototype.getTiles = function (filters) {
            if (filters === void 0) { filters = {}; }
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.locatorForAll(MatGridTileHarness.with(filters))()];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        };
        /** Gets the amount of columns of the grid-list. */
        MatGridListHarness.prototype.getColumns = function () {
            return __awaiter(this, void 0, void 0, function () {
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _a = Number;
                            return [4 /*yield*/, this.host()];
                        case 1: return [4 /*yield*/, (_b.sent()).getAttribute('cols')];
                        case 2: return [2 /*return*/, _a.apply(void 0, [_b.sent()])];
                    }
                });
            });
        };
        /**
         * Gets a tile of the grid-list that is located at the given location.
         * @param row Zero-based row index.
         * @param column Zero-based column index.
         */
        MatGridListHarness.prototype.getTileAtPosition = function (_a) {
            var row = _a.row, column = _a.column;
            return __awaiter(this, void 0, void 0, function () {
                var _a, tileHarnesses, columns, tileSpans, tiles, i, position, _b, rowspan, colspan;
                var _this = this;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0: return [4 /*yield*/, testing.parallel(function () { return [_this.getTiles(), _this.getColumns()]; })];
                        case 1:
                            _a = __read.apply(void 0, [_c.sent(), 2]), tileHarnesses = _a[0], columns = _a[1];
                            tileSpans = tileHarnesses.map(function (t) { return testing.parallel(function () { return [t.getColspan(), t.getRowspan()]; }); });
                            return [4 /*yield*/, testing.parallel(function () { return tileSpans; })];
                        case 2:
                            tiles = (_c.sent())
                                .map(function (_a) {
                                var _b = __read(_a, 2), colspan = _b[0], rowspan = _b[1];
                                return ({ colspan: colspan, rowspan: rowspan });
                            });
                            // Update the tile coordinator to reflect the current column amount and
                            // rendered tiles. We update upon every call of this method since we do not
                            // know if tiles have been added, removed or updated (in terms of rowspan/colspan).
                            this._tileCoordinator.update(columns, tiles);
                            // The tile coordinator respects the colspan and rowspan for calculating the positions
                            // of tiles, but it does not create multiple position entries if a tile spans over multiple
                            // columns or rows. We want to provide an API where developers can retrieve a tile based on
                            // any position that lies within the visual tile boundaries. For example: If a tile spans
                            // over two columns, then the same tile should be returned for either column indices.
                            for (i = 0; i < this._tileCoordinator.positions.length; i++) {
                                position = this._tileCoordinator.positions[i];
                                _b = tiles[i], rowspan = _b.rowspan, colspan = _b.colspan;
                                // Return the tile harness if the given position visually resolves to the tile.
                                if (column >= position.col && column <= position.col + colspan - 1 && row >= position.row &&
                                    row <= position.row + rowspan - 1) {
                                    return [2 /*return*/, tileHarnesses[i]];
                                }
                            }
                            throw Error('Could not find tile at given position.');
                    }
                });
            });
        };
        return MatGridListHarness;
    }(testing.ComponentHarness));
    /** The selector for the host element of a `MatGridList` instance. */
    MatGridListHarness.hostSelector = '.mat-grid-list';

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

    exports.MatGridListHarness = MatGridListHarness;
    exports.MatGridTileHarness = MatGridTileHarness;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=material-grid-list-testing.umd.js.map
