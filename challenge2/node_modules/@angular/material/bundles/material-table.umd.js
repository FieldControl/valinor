(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('@angular/cdk/table'), require('@angular/cdk/collections'), require('@angular/material/core'), require('@angular/cdk/coercion'), require('rxjs'), require('rxjs/operators')) :
    typeof define === 'function' && define.amd ? define('@angular/material/table', ['exports', '@angular/core', '@angular/cdk/table', '@angular/cdk/collections', '@angular/material/core', '@angular/cdk/coercion', 'rxjs', 'rxjs/operators'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.ng = global.ng || {}, global.ng.material = global.ng.material || {}, global.ng.material.table = {}), global.ng.core, global.ng.cdk.table, global.ng.cdk.collections, global.ng.material.core, global.ng.cdk.coercion, global.rxjs, global.rxjs.operators));
}(this, (function (exports, core, table, collections, core$1, coercion, rxjs, operators) { 'use strict';

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

    /**
     * Enables the recycle view repeater strategy, which reduces rendering latency. Not compatible with
     * tables that animate rows.
     */
    var MatRecycleRows = /** @class */ (function () {
        function MatRecycleRows() {
        }
        return MatRecycleRows;
    }());
    MatRecycleRows.decorators = [
        { type: core.Directive, args: [{
                    selector: 'mat-table[recycleRows], table[mat-table][recycleRows]',
                    providers: [
                        { provide: collections._VIEW_REPEATER_STRATEGY, useClass: collections._RecycleViewRepeaterStrategy },
                    ],
                },] }
    ];
    /**
     * Wrapper for the CdkTable with Material design styles.
     */
    var MatTable = /** @class */ (function (_super) {
        __extends(MatTable, _super);
        function MatTable() {
            var _this = _super.apply(this, __spreadArray([], __read(arguments))) || this;
            /** Overrides the sticky CSS class set by the `CdkTable`. */
            _this.stickyCssClass = 'mat-table-sticky';
            /** Overrides the need to add position: sticky on every sticky cell element in `CdkTable`. */
            _this.needsPositionStickyOnElement = false;
            return _this;
        }
        return MatTable;
    }(table.CdkTable));
    MatTable.decorators = [
        { type: core.Component, args: [{
                    selector: 'mat-table, table[mat-table]',
                    exportAs: 'matTable',
                    template: table.CDK_TABLE_TEMPLATE,
                    host: {
                        'class': 'mat-table',
                        '[class.mat-table-fixed-layout]': 'fixedLayout',
                    },
                    providers: [
                        // TODO(michaeljamesparsons) Abstract the view repeater strategy to a directive API so this code
                        //  is only included in the build if used.
                        { provide: collections._VIEW_REPEATER_STRATEGY, useClass: collections._DisposeViewRepeaterStrategy },
                        { provide: table.CdkTable, useExisting: MatTable },
                        { provide: table.CDK_TABLE, useExisting: MatTable },
                        { provide: table._COALESCED_STYLE_SCHEDULER, useClass: table._CoalescedStyleScheduler },
                        // Prevent nested tables from seeing this table's StickyPositioningListener.
                        { provide: table.STICKY_POSITIONING_LISTENER, useValue: null },
                    ],
                    encapsulation: core.ViewEncapsulation.None,
                    // See note on CdkTable for explanation on why this uses the default change detection strategy.
                    // tslint:disable-next-line:validate-decorators
                    changeDetection: core.ChangeDetectionStrategy.Default,
                    styles: ["mat-table{display:block}mat-header-row{min-height:56px}mat-row,mat-footer-row{min-height:48px}mat-row,mat-header-row,mat-footer-row{display:flex;border-width:0;border-bottom-width:1px;border-style:solid;align-items:center;box-sizing:border-box}mat-row::after,mat-header-row::after,mat-footer-row::after{display:inline-block;min-height:inherit;content:\"\"}mat-cell:first-of-type,mat-header-cell:first-of-type,mat-footer-cell:first-of-type{padding-left:24px}[dir=rtl] mat-cell:first-of-type:not(:only-of-type),[dir=rtl] mat-header-cell:first-of-type:not(:only-of-type),[dir=rtl] mat-footer-cell:first-of-type:not(:only-of-type){padding-left:0;padding-right:24px}mat-cell:last-of-type,mat-header-cell:last-of-type,mat-footer-cell:last-of-type{padding-right:24px}[dir=rtl] mat-cell:last-of-type:not(:only-of-type),[dir=rtl] mat-header-cell:last-of-type:not(:only-of-type),[dir=rtl] mat-footer-cell:last-of-type:not(:only-of-type){padding-right:0;padding-left:24px}mat-cell,mat-header-cell,mat-footer-cell{flex:1;display:flex;align-items:center;overflow:hidden;word-wrap:break-word;min-height:inherit}table.mat-table{border-spacing:0}tr.mat-header-row{height:56px}tr.mat-row,tr.mat-footer-row{height:48px}th.mat-header-cell{text-align:left}[dir=rtl] th.mat-header-cell{text-align:right}th.mat-header-cell,td.mat-cell,td.mat-footer-cell{padding:0;border-bottom-width:1px;border-bottom-style:solid}th.mat-header-cell:first-of-type,td.mat-cell:first-of-type,td.mat-footer-cell:first-of-type{padding-left:24px}[dir=rtl] th.mat-header-cell:first-of-type:not(:only-of-type),[dir=rtl] td.mat-cell:first-of-type:not(:only-of-type),[dir=rtl] td.mat-footer-cell:first-of-type:not(:only-of-type){padding-left:0;padding-right:24px}th.mat-header-cell:last-of-type,td.mat-cell:last-of-type,td.mat-footer-cell:last-of-type{padding-right:24px}[dir=rtl] th.mat-header-cell:last-of-type:not(:only-of-type),[dir=rtl] td.mat-cell:last-of-type:not(:only-of-type),[dir=rtl] td.mat-footer-cell:last-of-type:not(:only-of-type){padding-right:0;padding-left:24px}.mat-table-sticky{position:-webkit-sticky !important;position:sticky !important}.mat-table-fixed-layout{table-layout:fixed}\n"]
                },] }
    ];

    /**
     * Cell definition for the mat-table.
     * Captures the template of a column's data row cell as well as cell-specific properties.
     */
    var MatCellDef = /** @class */ (function (_super) {
        __extends(MatCellDef, _super);
        function MatCellDef() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return MatCellDef;
    }(table.CdkCellDef));
    MatCellDef.decorators = [
        { type: core.Directive, args: [{
                    selector: '[matCellDef]',
                    providers: [{ provide: table.CdkCellDef, useExisting: MatCellDef }]
                },] }
    ];
    /**
     * Header cell definition for the mat-table.
     * Captures the template of a column's header cell and as well as cell-specific properties.
     */
    var MatHeaderCellDef = /** @class */ (function (_super) {
        __extends(MatHeaderCellDef, _super);
        function MatHeaderCellDef() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return MatHeaderCellDef;
    }(table.CdkHeaderCellDef));
    MatHeaderCellDef.decorators = [
        { type: core.Directive, args: [{
                    selector: '[matHeaderCellDef]',
                    providers: [{ provide: table.CdkHeaderCellDef, useExisting: MatHeaderCellDef }]
                },] }
    ];
    /**
     * Footer cell definition for the mat-table.
     * Captures the template of a column's footer cell and as well as cell-specific properties.
     */
    var MatFooterCellDef = /** @class */ (function (_super) {
        __extends(MatFooterCellDef, _super);
        function MatFooterCellDef() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return MatFooterCellDef;
    }(table.CdkFooterCellDef));
    MatFooterCellDef.decorators = [
        { type: core.Directive, args: [{
                    selector: '[matFooterCellDef]',
                    providers: [{ provide: table.CdkFooterCellDef, useExisting: MatFooterCellDef }]
                },] }
    ];
    /**
     * Column definition for the mat-table.
     * Defines a set of cells available for a table column.
     */
    var MatColumnDef = /** @class */ (function (_super) {
        __extends(MatColumnDef, _super);
        function MatColumnDef() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(MatColumnDef.prototype, "name", {
            /** Unique name for this column. */
            get: function () { return this._name; },
            set: function (name) { this._setNameInput(name); },
            enumerable: false,
            configurable: true
        });
        /**
         * Add "mat-column-" prefix in addition to "cdk-column-" prefix.
         * In the future, this will only add "mat-column-" and columnCssClassName
         * will change from type string[] to string.
         * @docs-private
         */
        MatColumnDef.prototype._updateColumnCssClassName = function () {
            _super.prototype._updateColumnCssClassName.call(this);
            this._columnCssClassName.push("mat-column-" + this.cssClassFriendlyName);
        };
        return MatColumnDef;
    }(table.CdkColumnDef));
    MatColumnDef.decorators = [
        { type: core.Directive, args: [{
                    selector: '[matColumnDef]',
                    inputs: ['sticky'],
                    providers: [
                        { provide: table.CdkColumnDef, useExisting: MatColumnDef },
                        { provide: 'MAT_SORT_HEADER_COLUMN_DEF', useExisting: MatColumnDef }
                    ],
                },] }
    ];
    MatColumnDef.propDecorators = {
        name: [{ type: core.Input, args: ['matColumnDef',] }]
    };
    /** Header cell template container that adds the right classes and role. */
    var MatHeaderCell = /** @class */ (function (_super) {
        __extends(MatHeaderCell, _super);
        function MatHeaderCell() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return MatHeaderCell;
    }(table.CdkHeaderCell));
    MatHeaderCell.decorators = [
        { type: core.Directive, args: [{
                    selector: 'mat-header-cell, th[mat-header-cell]',
                    host: {
                        'class': 'mat-header-cell',
                        'role': 'columnheader',
                    },
                },] }
    ];
    /** Footer cell template container that adds the right classes and role. */
    var MatFooterCell = /** @class */ (function (_super) {
        __extends(MatFooterCell, _super);
        function MatFooterCell() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return MatFooterCell;
    }(table.CdkFooterCell));
    MatFooterCell.decorators = [
        { type: core.Directive, args: [{
                    selector: 'mat-footer-cell, td[mat-footer-cell]',
                    host: {
                        'class': 'mat-footer-cell',
                        'role': 'gridcell',
                    },
                },] }
    ];
    /** Cell template container that adds the right classes and role. */
    var MatCell = /** @class */ (function (_super) {
        __extends(MatCell, _super);
        function MatCell() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return MatCell;
    }(table.CdkCell));
    MatCell.decorators = [
        { type: core.Directive, args: [{
                    selector: 'mat-cell, td[mat-cell]',
                    host: {
                        'class': 'mat-cell',
                        'role': 'gridcell',
                    },
                },] }
    ];

    /**
     * Header row definition for the mat-table.
     * Captures the header row's template and other header properties such as the columns to display.
     */
    var MatHeaderRowDef = /** @class */ (function (_super) {
        __extends(MatHeaderRowDef, _super);
        function MatHeaderRowDef() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return MatHeaderRowDef;
    }(table.CdkHeaderRowDef));
    MatHeaderRowDef.decorators = [
        { type: core.Directive, args: [{
                    selector: '[matHeaderRowDef]',
                    providers: [{ provide: table.CdkHeaderRowDef, useExisting: MatHeaderRowDef }],
                    inputs: ['columns: matHeaderRowDef', 'sticky: matHeaderRowDefSticky'],
                },] }
    ];
    /**
     * Footer row definition for the mat-table.
     * Captures the footer row's template and other footer properties such as the columns to display.
     */
    var MatFooterRowDef = /** @class */ (function (_super) {
        __extends(MatFooterRowDef, _super);
        function MatFooterRowDef() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return MatFooterRowDef;
    }(table.CdkFooterRowDef));
    MatFooterRowDef.decorators = [
        { type: core.Directive, args: [{
                    selector: '[matFooterRowDef]',
                    providers: [{ provide: table.CdkFooterRowDef, useExisting: MatFooterRowDef }],
                    inputs: ['columns: matFooterRowDef', 'sticky: matFooterRowDefSticky'],
                },] }
    ];
    /**
     * Data row definition for the mat-table.
     * Captures the data row's template and other properties such as the columns to display and
     * a when predicate that describes when this row should be used.
     */
    var MatRowDef = /** @class */ (function (_super) {
        __extends(MatRowDef, _super);
        function MatRowDef() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return MatRowDef;
    }(table.CdkRowDef));
    MatRowDef.decorators = [
        { type: core.Directive, args: [{
                    selector: '[matRowDef]',
                    providers: [{ provide: table.CdkRowDef, useExisting: MatRowDef }],
                    inputs: ['columns: matRowDefColumns', 'when: matRowDefWhen'],
                },] }
    ];
    /** Header template container that contains the cell outlet. Adds the right class and role. */
    var MatHeaderRow = /** @class */ (function (_super) {
        __extends(MatHeaderRow, _super);
        function MatHeaderRow() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return MatHeaderRow;
    }(table.CdkHeaderRow));
    MatHeaderRow.decorators = [
        { type: core.Component, args: [{
                    selector: 'mat-header-row, tr[mat-header-row]',
                    template: table.CDK_ROW_TEMPLATE,
                    host: {
                        'class': 'mat-header-row',
                        'role': 'row',
                    },
                    // See note on CdkTable for explanation on why this uses the default change detection strategy.
                    // tslint:disable-next-line:validate-decorators
                    changeDetection: core.ChangeDetectionStrategy.Default,
                    encapsulation: core.ViewEncapsulation.None,
                    exportAs: 'matHeaderRow',
                    providers: [{ provide: table.CdkHeaderRow, useExisting: MatHeaderRow }]
                },] }
    ];
    /** Footer template container that contains the cell outlet. Adds the right class and role. */
    var MatFooterRow = /** @class */ (function (_super) {
        __extends(MatFooterRow, _super);
        function MatFooterRow() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return MatFooterRow;
    }(table.CdkFooterRow));
    MatFooterRow.decorators = [
        { type: core.Component, args: [{
                    selector: 'mat-footer-row, tr[mat-footer-row]',
                    template: table.CDK_ROW_TEMPLATE,
                    host: {
                        'class': 'mat-footer-row',
                        'role': 'row',
                    },
                    // See note on CdkTable for explanation on why this uses the default change detection strategy.
                    // tslint:disable-next-line:validate-decorators
                    changeDetection: core.ChangeDetectionStrategy.Default,
                    encapsulation: core.ViewEncapsulation.None,
                    exportAs: 'matFooterRow',
                    providers: [{ provide: table.CdkFooterRow, useExisting: MatFooterRow }]
                },] }
    ];
    /** Data row template container that contains the cell outlet. Adds the right class and role. */
    var MatRow = /** @class */ (function (_super) {
        __extends(MatRow, _super);
        function MatRow() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return MatRow;
    }(table.CdkRow));
    MatRow.decorators = [
        { type: core.Component, args: [{
                    selector: 'mat-row, tr[mat-row]',
                    template: table.CDK_ROW_TEMPLATE,
                    host: {
                        'class': 'mat-row',
                        'role': 'row',
                    },
                    // See note on CdkTable for explanation on why this uses the default change detection strategy.
                    // tslint:disable-next-line:validate-decorators
                    changeDetection: core.ChangeDetectionStrategy.Default,
                    encapsulation: core.ViewEncapsulation.None,
                    exportAs: 'matRow',
                    providers: [{ provide: table.CdkRow, useExisting: MatRow }]
                },] }
    ];
    /** Row that can be used to display a message when no data is shown in the table. */
    var MatNoDataRow = /** @class */ (function (_super) {
        __extends(MatNoDataRow, _super);
        function MatNoDataRow() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return MatNoDataRow;
    }(table.CdkNoDataRow));
    MatNoDataRow.decorators = [
        { type: core.Directive, args: [{
                    selector: 'ng-template[matNoDataRow]',
                    providers: [{ provide: table.CdkNoDataRow, useExisting: MatNoDataRow }],
                },] }
    ];

    /**
     * Column that simply shows text content for the header and row cells. Assumes that the table
     * is using the native table implementation (`<table>`).
     *
     * By default, the name of this column will be the header text and data property accessor.
     * The header text can be overridden with the `headerText` input. Cell values can be overridden with
     * the `dataAccessor` input. Change the text justification to the start or end using the `justify`
     * input.
     */
    var MatTextColumn = /** @class */ (function (_super) {
        __extends(MatTextColumn, _super);
        function MatTextColumn() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return MatTextColumn;
    }(table.CdkTextColumn));
    MatTextColumn.decorators = [
        { type: core.Component, args: [{
                    selector: 'mat-text-column',
                    template: "\n    <ng-container matColumnDef>\n      <th mat-header-cell *matHeaderCellDef [style.text-align]=\"justify\">\n        {{headerText}}\n      </th>\n      <td mat-cell *matCellDef=\"let data\" [style.text-align]=\"justify\">\n        {{dataAccessor(data, name)}}\n      </td>\n    </ng-container>\n  ",
                    encapsulation: core.ViewEncapsulation.None,
                    // Change detection is intentionally not set to OnPush. This component's template will be provided
                    // to the table to be inserted into its view. This is problematic when change detection runs since
                    // the bindings in this template will be evaluated _after_ the table's view is evaluated, which
                    // mean's the template in the table's view will not have the updated value (and in fact will cause
                    // an ExpressionChangedAfterItHasBeenCheckedError).
                    // tslint:disable-next-line:validate-decorators
                    changeDetection: core.ChangeDetectionStrategy.Default
                },] }
    ];

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var EXPORTED_DECLARATIONS = [
        // Table
        MatTable,
        MatRecycleRows,
        // Template defs
        MatHeaderCellDef,
        MatHeaderRowDef,
        MatColumnDef,
        MatCellDef,
        MatRowDef,
        MatFooterCellDef,
        MatFooterRowDef,
        // Cell directives
        MatHeaderCell,
        MatCell,
        MatFooterCell,
        // Row directives
        MatHeaderRow,
        MatRow,
        MatFooterRow,
        MatNoDataRow,
        MatTextColumn,
    ];
    var MatTableModule = /** @class */ (function () {
        function MatTableModule() {
        }
        return MatTableModule;
    }());
    MatTableModule.decorators = [
        { type: core.NgModule, args: [{
                    imports: [
                        table.CdkTableModule,
                        core$1.MatCommonModule,
                    ],
                    exports: [core$1.MatCommonModule, EXPORTED_DECLARATIONS],
                    declarations: EXPORTED_DECLARATIONS,
                },] }
    ];

    /**
     * Corresponds to `Number.MAX_SAFE_INTEGER`. Moved out into a variable here due to
     * flaky browser support and the value not being defined in Closure's typings.
     */
    var MAX_SAFE_INTEGER = 9007199254740991;
    /** Shared base class with MDC-based implementation. */
    var _MatTableDataSource = /** @class */ (function (_super) {
        __extends(_MatTableDataSource, _super);
        function _MatTableDataSource(initialData) {
            if (initialData === void 0) { initialData = []; }
            var _this = _super.call(this) || this;
            /** Stream emitting render data to the table (depends on ordered data changes). */
            _this._renderData = new rxjs.BehaviorSubject([]);
            /** Stream that emits when a new filter string is set on the data source. */
            _this._filter = new rxjs.BehaviorSubject('');
            /** Used to react to internal changes of the paginator that are made by the data source itself. */
            _this._internalPageChanges = new rxjs.Subject();
            /**
             * Subscription to the changes that should trigger an update to the table's rendered rows, such
             * as filtering, sorting, pagination, or base data changes.
             */
            _this._renderChangesSubscription = null;
            /**
             * Data accessor function that is used for accessing data properties for sorting through
             * the default sortData function.
             * This default function assumes that the sort header IDs (which defaults to the column name)
             * matches the data's properties (e.g. column Xyz represents data['Xyz']).
             * May be set to a custom function for different behavior.
             * @param data Data object that is being accessed.
             * @param sortHeaderId The name of the column that represents the data.
             */
            _this.sortingDataAccessor = function (data, sortHeaderId) {
                var value = data[sortHeaderId];
                if (coercion._isNumberValue(value)) {
                    var numberValue = Number(value);
                    // Numbers beyond `MAX_SAFE_INTEGER` can't be compared reliably so we
                    // leave them as strings. For more info: https://goo.gl/y5vbSg
                    return numberValue < MAX_SAFE_INTEGER ? numberValue : value;
                }
                return value;
            };
            /**
             * Gets a sorted copy of the data array based on the state of the MatSort. Called
             * after changes are made to the filtered data or when sort changes are emitted from MatSort.
             * By default, the function retrieves the active sort and its direction and compares data
             * by retrieving data using the sortingDataAccessor. May be overridden for a custom implementation
             * of data ordering.
             * @param data The array of data that should be sorted.
             * @param sort The connected MatSort that holds the current sort state.
             */
            _this.sortData = function (data, sort) {
                var active = sort.active;
                var direction = sort.direction;
                if (!active || direction == '') {
                    return data;
                }
                return data.sort(function (a, b) {
                    var valueA = _this.sortingDataAccessor(a, active);
                    var valueB = _this.sortingDataAccessor(b, active);
                    // If there are data in the column that can be converted to a number,
                    // it must be ensured that the rest of the data
                    // is of the same type so as not to order incorrectly.
                    var valueAType = typeof valueA;
                    var valueBType = typeof valueB;
                    if (valueAType !== valueBType) {
                        if (valueAType === 'number') {
                            valueA += '';
                        }
                        if (valueBType === 'number') {
                            valueB += '';
                        }
                    }
                    // If both valueA and valueB exist (truthy), then compare the two. Otherwise, check if
                    // one value exists while the other doesn't. In this case, existing value should come last.
                    // This avoids inconsistent results when comparing values to undefined/null.
                    // If neither value exists, return 0 (equal).
                    var comparatorResult = 0;
                    if (valueA != null && valueB != null) {
                        // Check if one value is greater than the other; if equal, comparatorResult should remain 0.
                        if (valueA > valueB) {
                            comparatorResult = 1;
                        }
                        else if (valueA < valueB) {
                            comparatorResult = -1;
                        }
                    }
                    else if (valueA != null) {
                        comparatorResult = 1;
                    }
                    else if (valueB != null) {
                        comparatorResult = -1;
                    }
                    return comparatorResult * (direction == 'asc' ? 1 : -1);
                });
            };
            /**
             * Checks if a data object matches the data source's filter string. By default, each data object
             * is converted to a string of its properties and returns true if the filter has
             * at least one occurrence in that string. By default, the filter string has its whitespace
             * trimmed and the match is case-insensitive. May be overridden for a custom implementation of
             * filter matching.
             * @param data Data object used to check against the filter.
             * @param filter Filter string that has been set on the data source.
             * @returns Whether the filter matches against the data
             */
            _this.filterPredicate = function (data, filter) {
                // Transform the data into a lowercase string of all property values.
                var dataStr = Object.keys(data).reduce(function (currentTerm, key) {
                    // Use an obscure Unicode character to delimit the words in the concatenated string.
                    // This avoids matches where the values of two columns combined will match the user's query
                    // (e.g. `Flute` and `Stop` will match `Test`). The character is intended to be something
                    // that has a very low chance of being typed in by somebody in a text field. This one in
                    // particular is "White up-pointing triangle with dot" from
                    // https://en.wikipedia.org/wiki/List_of_Unicode_characters
                    return currentTerm + data[key] + '◬';
                }, '').toLowerCase();
                // Transform the filter by converting it to lowercase and removing whitespace.
                var transformedFilter = filter.trim().toLowerCase();
                return dataStr.indexOf(transformedFilter) != -1;
            };
            _this._data = new rxjs.BehaviorSubject(initialData);
            _this._updateChangeSubscription();
            return _this;
        }
        Object.defineProperty(_MatTableDataSource.prototype, "data", {
            /** Array of data that should be rendered by the table, where each object represents one row. */
            get: function () { return this._data.value; },
            set: function (data) {
                this._data.next(data);
                // Normally the `filteredData` is updated by the re-render
                // subscription, but that won't happen if it's inactive.
                if (!this._renderChangesSubscription) {
                    this._filterData(data);
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(_MatTableDataSource.prototype, "filter", {
            /**
             * Filter term that should be used to filter out objects from the data array. To override how
             * data objects match to this filter string, provide a custom function for filterPredicate.
             */
            get: function () { return this._filter.value; },
            set: function (filter) {
                this._filter.next(filter);
                // Normally the `filteredData` is updated by the re-render
                // subscription, but that won't happen if it's inactive.
                if (!this._renderChangesSubscription) {
                    this._filterData(this.data);
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(_MatTableDataSource.prototype, "sort", {
            /**
             * Instance of the MatSort directive used by the table to control its sorting. Sort changes
             * emitted by the MatSort will trigger an update to the table's rendered data.
             */
            get: function () { return this._sort; },
            set: function (sort) {
                this._sort = sort;
                this._updateChangeSubscription();
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(_MatTableDataSource.prototype, "paginator", {
            /**
             * Instance of the MatPaginator component used by the table to control what page of the data is
             * displayed. Page changes emitted by the MatPaginator will trigger an update to the
             * table's rendered data.
             *
             * Note that the data source uses the paginator's properties to calculate which page of data
             * should be displayed. If the paginator receives its properties as template inputs,
             * e.g. `[pageLength]=100` or `[pageIndex]=1`, then be sure that the paginator's view has been
             * initialized before assigning it to this data source.
             */
            get: function () { return this._paginator; },
            set: function (paginator) {
                this._paginator = paginator;
                this._updateChangeSubscription();
            },
            enumerable: false,
            configurable: true
        });
        /**
         * Subscribe to changes that should trigger an update to the table's rendered rows. When the
         * changes occur, process the current state of the filter, sort, and pagination along with
         * the provided base data and send it to the table for rendering.
         */
        _MatTableDataSource.prototype._updateChangeSubscription = function () {
            var _this = this;
            var _a;
            // Sorting and/or pagination should be watched if MatSort and/or MatPaginator are provided.
            // The events should emit whenever the component emits a change or initializes, or if no
            // component is provided, a stream with just a null event should be provided.
            // The `sortChange` and `pageChange` acts as a signal to the combineLatests below so that the
            // pipeline can progress to the next step. Note that the value from these streams are not used,
            // they purely act as a signal to progress in the pipeline.
            var sortChange = this._sort ?
                rxjs.merge(this._sort.sortChange, this._sort.initialized) :
                rxjs.of(null);
            var pageChange = this._paginator ?
                rxjs.merge(this._paginator.page, this._internalPageChanges, this._paginator.initialized) :
                rxjs.of(null);
            var dataStream = this._data;
            // Watch for base data or filter changes to provide a filtered set of data.
            var filteredData = rxjs.combineLatest([dataStream, this._filter])
                .pipe(operators.map(function (_b) {
                var _c = __read(_b, 1), data = _c[0];
                return _this._filterData(data);
            }));
            // Watch for filtered data or sort changes to provide an ordered set of data.
            var orderedData = rxjs.combineLatest([filteredData, sortChange])
                .pipe(operators.map(function (_b) {
                var _c = __read(_b, 1), data = _c[0];
                return _this._orderData(data);
            }));
            // Watch for ordered data or page changes to provide a paged set of data.
            var paginatedData = rxjs.combineLatest([orderedData, pageChange])
                .pipe(operators.map(function (_b) {
                var _c = __read(_b, 1), data = _c[0];
                return _this._pageData(data);
            }));
            // Watched for paged data changes and send the result to the table to render.
            (_a = this._renderChangesSubscription) === null || _a === void 0 ? void 0 : _a.unsubscribe();
            this._renderChangesSubscription = paginatedData.subscribe(function (data) { return _this._renderData.next(data); });
        };
        /**
         * Returns a filtered data array where each filter object contains the filter string within
         * the result of the filterTermAccessor function. If no filter is set, returns the data array
         * as provided.
         */
        _MatTableDataSource.prototype._filterData = function (data) {
            var _this = this;
            // If there is a filter string, filter out data that does not contain it.
            // Each data object is converted to a string using the function defined by filterTermAccessor.
            // May be overridden for customization.
            this.filteredData = (this.filter == null || this.filter === '') ? data :
                data.filter(function (obj) { return _this.filterPredicate(obj, _this.filter); });
            if (this.paginator) {
                this._updatePaginator(this.filteredData.length);
            }
            return this.filteredData;
        };
        /**
         * Returns a sorted copy of the data if MatSort has a sort applied, otherwise just returns the
         * data array as provided. Uses the default data accessor for data lookup, unless a
         * sortDataAccessor function is defined.
         */
        _MatTableDataSource.prototype._orderData = function (data) {
            // If there is no active sort or direction, return the data without trying to sort.
            if (!this.sort) {
                return data;
            }
            return this.sortData(data.slice(), this.sort);
        };
        /**
         * Returns a paged slice of the provided data array according to the provided MatPaginator's page
         * index and length. If there is no paginator provided, returns the data array as provided.
         */
        _MatTableDataSource.prototype._pageData = function (data) {
            if (!this.paginator) {
                return data;
            }
            var startIndex = this.paginator.pageIndex * this.paginator.pageSize;
            return data.slice(startIndex, startIndex + this.paginator.pageSize);
        };
        /**
         * Updates the paginator to reflect the length of the filtered data, and makes sure that the page
         * index does not exceed the paginator's last page. Values are changed in a resolved promise to
         * guard against making property changes within a round of change detection.
         */
        _MatTableDataSource.prototype._updatePaginator = function (filteredDataLength) {
            var _this = this;
            Promise.resolve().then(function () {
                var paginator = _this.paginator;
                if (!paginator) {
                    return;
                }
                paginator.length = filteredDataLength;
                // If the page index is set beyond the page, reduce it to the last page.
                if (paginator.pageIndex > 0) {
                    var lastPageIndex = Math.ceil(paginator.length / paginator.pageSize) - 1 || 0;
                    var newPageIndex = Math.min(paginator.pageIndex, lastPageIndex);
                    if (newPageIndex !== paginator.pageIndex) {
                        paginator.pageIndex = newPageIndex;
                        // Since the paginator only emits after user-generated changes,
                        // we need our own stream so we know to should re-render the data.
                        _this._internalPageChanges.next();
                    }
                }
            });
        };
        /**
         * Used by the MatTable. Called when it connects to the data source.
         * @docs-private
         */
        _MatTableDataSource.prototype.connect = function () {
            if (!this._renderChangesSubscription) {
                this._updateChangeSubscription();
            }
            return this._renderData;
        };
        /**
         * Used by the MatTable. Called when it disconnects from the data source.
         * @docs-private
         */
        _MatTableDataSource.prototype.disconnect = function () {
            var _a;
            (_a = this._renderChangesSubscription) === null || _a === void 0 ? void 0 : _a.unsubscribe();
            this._renderChangesSubscription = null;
        };
        return _MatTableDataSource;
    }(table.DataSource));
    /**
     * Data source that accepts a client-side data array and includes native support of filtering,
     * sorting (using MatSort), and pagination (using MatPaginator).
     *
     * Allows for sort customization by overriding sortingDataAccessor, which defines how data
     * properties are accessed. Also allows for filter customization by overriding filterTermAccessor,
     * which defines how row data is converted to a string for filter matching.
     *
     * **Note:** This class is meant to be a simple data source to help you get started. As such
     * it isn't equipped to handle some more advanced cases like robust i18n support or server-side
     * interactions. If your app needs to support more advanced use cases, consider implementing your
     * own `DataSource`.
     */
    var MatTableDataSource = /** @class */ (function (_super) {
        __extends(MatTableDataSource, _super);
        function MatTableDataSource() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return MatTableDataSource;
    }(_MatTableDataSource));

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */

    /**
     * Generated bundle index. Do not edit.
     */

    exports.MatCell = MatCell;
    exports.MatCellDef = MatCellDef;
    exports.MatColumnDef = MatColumnDef;
    exports.MatFooterCell = MatFooterCell;
    exports.MatFooterCellDef = MatFooterCellDef;
    exports.MatFooterRow = MatFooterRow;
    exports.MatFooterRowDef = MatFooterRowDef;
    exports.MatHeaderCell = MatHeaderCell;
    exports.MatHeaderCellDef = MatHeaderCellDef;
    exports.MatHeaderRow = MatHeaderRow;
    exports.MatHeaderRowDef = MatHeaderRowDef;
    exports.MatNoDataRow = MatNoDataRow;
    exports.MatRecycleRows = MatRecycleRows;
    exports.MatRow = MatRow;
    exports.MatRowDef = MatRowDef;
    exports.MatTable = MatTable;
    exports.MatTableDataSource = MatTableDataSource;
    exports.MatTableModule = MatTableModule;
    exports.MatTextColumn = MatTextColumn;
    exports._MatTableDataSource = _MatTableDataSource;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=material-table.umd.js.map
