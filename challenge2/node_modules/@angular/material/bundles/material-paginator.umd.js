(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/common'), require('@angular/core'), require('@angular/material/core'), require('@angular/material/button'), require('@angular/material/select'), require('@angular/material/tooltip'), require('@angular/cdk/coercion'), require('rxjs')) :
    typeof define === 'function' && define.amd ? define('@angular/material/paginator', ['exports', '@angular/common', '@angular/core', '@angular/material/core', '@angular/material/button', '@angular/material/select', '@angular/material/tooltip', '@angular/cdk/coercion', 'rxjs'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.ng = global.ng || {}, global.ng.material = global.ng.material || {}, global.ng.material.paginator = {}), global.ng.common, global.ng.core, global.ng.material.core, global.ng.material.button, global.ng.material.select, global.ng.material.tooltip, global.ng.cdk.coercion, global.rxjs));
}(this, (function (exports, common, i0, core, button, select, tooltip, coercion, rxjs) { 'use strict';

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

    var i0__namespace = /*#__PURE__*/_interopNamespace(i0);

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
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /**
     * To modify the labels and text displayed, create a new instance of MatPaginatorIntl and
     * include it in a custom provider
     */
    var MatPaginatorIntl = /** @class */ (function () {
        function MatPaginatorIntl() {
            /**
             * Stream to emit from when labels are changed. Use this to notify components when the labels have
             * changed after initialization.
             */
            this.changes = new rxjs.Subject();
            /** A label for the page size selector. */
            this.itemsPerPageLabel = 'Items per page:';
            /** A label for the button that increments the current page. */
            this.nextPageLabel = 'Next page';
            /** A label for the button that decrements the current page. */
            this.previousPageLabel = 'Previous page';
            /** A label for the button that moves to the first page. */
            this.firstPageLabel = 'First page';
            /** A label for the button that moves to the last page. */
            this.lastPageLabel = 'Last page';
            /** A label for the range of items within the current page and the length of the whole list. */
            this.getRangeLabel = function (page, pageSize, length) {
                if (length == 0 || pageSize == 0) {
                    return "0 of " + length;
                }
                length = Math.max(length, 0);
                var startIndex = page * pageSize;
                // If the start index exceeds the list length, do not try and fix the end index to the end.
                var endIndex = startIndex < length ?
                    Math.min(startIndex + pageSize, length) :
                    startIndex + pageSize;
                return startIndex + 1 + " \u2013 " + endIndex + " of " + length;
            };
        }
        return MatPaginatorIntl;
    }());
    MatPaginatorIntl.ɵprov = i0__namespace.ɵɵdefineInjectable({ factory: function MatPaginatorIntl_Factory() { return new MatPaginatorIntl(); }, token: MatPaginatorIntl, providedIn: "root" });
    MatPaginatorIntl.decorators = [
        { type: i0.Injectable, args: [{ providedIn: 'root' },] }
    ];
    /** @docs-private */
    function MAT_PAGINATOR_INTL_PROVIDER_FACTORY(parentIntl) {
        return parentIntl || new MatPaginatorIntl();
    }
    /** @docs-private */
    var MAT_PAGINATOR_INTL_PROVIDER = {
        // If there is already an MatPaginatorIntl available, use that. Otherwise, provide a new one.
        provide: MatPaginatorIntl,
        deps: [[new i0.Optional(), new i0.SkipSelf(), MatPaginatorIntl]],
        useFactory: MAT_PAGINATOR_INTL_PROVIDER_FACTORY
    };

    /** The default page size if there is no page size and there are no provided page size options. */
    var DEFAULT_PAGE_SIZE = 50;
    /**
     * Change event object that is emitted when the user selects a
     * different page size or navigates to another page.
     */
    var PageEvent = /** @class */ (function () {
        function PageEvent() {
        }
        return PageEvent;
    }());
    /** Injection token that can be used to provide the default options for the paginator module. */
    var MAT_PAGINATOR_DEFAULT_OPTIONS = new i0.InjectionToken('MAT_PAGINATOR_DEFAULT_OPTIONS');
    // Boilerplate for applying mixins to _MatPaginatorBase.
    /** @docs-private */
    var MatPaginatorMixinBase = /** @class */ (function () {
        function MatPaginatorMixinBase() {
        }
        return MatPaginatorMixinBase;
    }());
    var _MatPaginatorMixinBase = core.mixinDisabled(core.mixinInitialized(MatPaginatorMixinBase));
    /**
     * Base class with all of the `MatPaginator` functionality.
     * @docs-private
     */
    var _MatPaginatorBase = /** @class */ (function (_super) {
        __extends(_MatPaginatorBase, _super);
        function _MatPaginatorBase(_intl, _changeDetectorRef, defaults) {
            var _this = _super.call(this) || this;
            _this._intl = _intl;
            _this._changeDetectorRef = _changeDetectorRef;
            _this._pageIndex = 0;
            _this._length = 0;
            _this._pageSizeOptions = [];
            _this._hidePageSize = false;
            _this._showFirstLastButtons = false;
            /** Event emitted when the paginator changes the page size or page index. */
            _this.page = new i0.EventEmitter();
            _this._intlChanges = _intl.changes.subscribe(function () { return _this._changeDetectorRef.markForCheck(); });
            if (defaults) {
                var pageSize = defaults.pageSize, pageSizeOptions = defaults.pageSizeOptions, hidePageSize = defaults.hidePageSize, showFirstLastButtons = defaults.showFirstLastButtons;
                if (pageSize != null) {
                    _this._pageSize = pageSize;
                }
                if (pageSizeOptions != null) {
                    _this._pageSizeOptions = pageSizeOptions;
                }
                if (hidePageSize != null) {
                    _this._hidePageSize = hidePageSize;
                }
                if (showFirstLastButtons != null) {
                    _this._showFirstLastButtons = showFirstLastButtons;
                }
            }
            return _this;
        }
        Object.defineProperty(_MatPaginatorBase.prototype, "pageIndex", {
            /** The zero-based page index of the displayed list of items. Defaulted to 0. */
            get: function () { return this._pageIndex; },
            set: function (value) {
                this._pageIndex = Math.max(coercion.coerceNumberProperty(value), 0);
                this._changeDetectorRef.markForCheck();
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(_MatPaginatorBase.prototype, "length", {
            /** The length of the total number of items that are being paginated. Defaulted to 0. */
            get: function () { return this._length; },
            set: function (value) {
                this._length = coercion.coerceNumberProperty(value);
                this._changeDetectorRef.markForCheck();
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(_MatPaginatorBase.prototype, "pageSize", {
            /** Number of items to display on a page. By default set to 50. */
            get: function () { return this._pageSize; },
            set: function (value) {
                this._pageSize = Math.max(coercion.coerceNumberProperty(value), 0);
                this._updateDisplayedPageSizeOptions();
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(_MatPaginatorBase.prototype, "pageSizeOptions", {
            /** The set of provided page size options to display to the user. */
            get: function () { return this._pageSizeOptions; },
            set: function (value) {
                this._pageSizeOptions = (value || []).map(function (p) { return coercion.coerceNumberProperty(p); });
                this._updateDisplayedPageSizeOptions();
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(_MatPaginatorBase.prototype, "hidePageSize", {
            /** Whether to hide the page size selection UI from the user. */
            get: function () { return this._hidePageSize; },
            set: function (value) {
                this._hidePageSize = coercion.coerceBooleanProperty(value);
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(_MatPaginatorBase.prototype, "showFirstLastButtons", {
            /** Whether to show the first/last buttons UI to the user. */
            get: function () { return this._showFirstLastButtons; },
            set: function (value) {
                this._showFirstLastButtons = coercion.coerceBooleanProperty(value);
            },
            enumerable: false,
            configurable: true
        });
        _MatPaginatorBase.prototype.ngOnInit = function () {
            this._initialized = true;
            this._updateDisplayedPageSizeOptions();
            this._markInitialized();
        };
        _MatPaginatorBase.prototype.ngOnDestroy = function () {
            this._intlChanges.unsubscribe();
        };
        /** Advances to the next page if it exists. */
        _MatPaginatorBase.prototype.nextPage = function () {
            if (!this.hasNextPage()) {
                return;
            }
            var previousPageIndex = this.pageIndex;
            this.pageIndex++;
            this._emitPageEvent(previousPageIndex);
        };
        /** Move back to the previous page if it exists. */
        _MatPaginatorBase.prototype.previousPage = function () {
            if (!this.hasPreviousPage()) {
                return;
            }
            var previousPageIndex = this.pageIndex;
            this.pageIndex--;
            this._emitPageEvent(previousPageIndex);
        };
        /** Move to the first page if not already there. */
        _MatPaginatorBase.prototype.firstPage = function () {
            // hasPreviousPage being false implies at the start
            if (!this.hasPreviousPage()) {
                return;
            }
            var previousPageIndex = this.pageIndex;
            this.pageIndex = 0;
            this._emitPageEvent(previousPageIndex);
        };
        /** Move to the last page if not already there. */
        _MatPaginatorBase.prototype.lastPage = function () {
            // hasNextPage being false implies at the end
            if (!this.hasNextPage()) {
                return;
            }
            var previousPageIndex = this.pageIndex;
            this.pageIndex = this.getNumberOfPages() - 1;
            this._emitPageEvent(previousPageIndex);
        };
        /** Whether there is a previous page. */
        _MatPaginatorBase.prototype.hasPreviousPage = function () {
            return this.pageIndex >= 1 && this.pageSize != 0;
        };
        /** Whether there is a next page. */
        _MatPaginatorBase.prototype.hasNextPage = function () {
            var maxPageIndex = this.getNumberOfPages() - 1;
            return this.pageIndex < maxPageIndex && this.pageSize != 0;
        };
        /** Calculate the number of pages */
        _MatPaginatorBase.prototype.getNumberOfPages = function () {
            if (!this.pageSize) {
                return 0;
            }
            return Math.ceil(this.length / this.pageSize);
        };
        /**
         * Changes the page size so that the first item displayed on the page will still be
         * displayed using the new page size.
         *
         * For example, if the page size is 10 and on the second page (items indexed 10-19) then
         * switching so that the page size is 5 will set the third page as the current page so
         * that the 10th item will still be displayed.
         */
        _MatPaginatorBase.prototype._changePageSize = function (pageSize) {
            // Current page needs to be updated to reflect the new page size. Navigate to the page
            // containing the previous page's first item.
            var startIndex = this.pageIndex * this.pageSize;
            var previousPageIndex = this.pageIndex;
            this.pageIndex = Math.floor(startIndex / pageSize) || 0;
            this.pageSize = pageSize;
            this._emitPageEvent(previousPageIndex);
        };
        /** Checks whether the buttons for going forwards should be disabled. */
        _MatPaginatorBase.prototype._nextButtonsDisabled = function () {
            return this.disabled || !this.hasNextPage();
        };
        /** Checks whether the buttons for going backwards should be disabled. */
        _MatPaginatorBase.prototype._previousButtonsDisabled = function () {
            return this.disabled || !this.hasPreviousPage();
        };
        /**
         * Updates the list of page size options to display to the user. Includes making sure that
         * the page size is an option and that the list is sorted.
         */
        _MatPaginatorBase.prototype._updateDisplayedPageSizeOptions = function () {
            if (!this._initialized) {
                return;
            }
            // If no page size is provided, use the first page size option or the default page size.
            if (!this.pageSize) {
                this._pageSize = this.pageSizeOptions.length != 0 ?
                    this.pageSizeOptions[0] :
                    DEFAULT_PAGE_SIZE;
            }
            this._displayedPageSizeOptions = this.pageSizeOptions.slice();
            if (this._displayedPageSizeOptions.indexOf(this.pageSize) === -1) {
                this._displayedPageSizeOptions.push(this.pageSize);
            }
            // Sort the numbers using a number-specific sort function.
            this._displayedPageSizeOptions.sort(function (a, b) { return a - b; });
            this._changeDetectorRef.markForCheck();
        };
        /** Emits an event notifying that a change of the paginator's properties has been triggered. */
        _MatPaginatorBase.prototype._emitPageEvent = function (previousPageIndex) {
            this.page.emit({
                previousPageIndex: previousPageIndex,
                pageIndex: this.pageIndex,
                pageSize: this.pageSize,
                length: this.length
            });
        };
        return _MatPaginatorBase;
    }(_MatPaginatorMixinBase));
    _MatPaginatorBase.decorators = [
        { type: i0.Directive }
    ];
    _MatPaginatorBase.ctorParameters = function () { return [
        { type: MatPaginatorIntl },
        { type: i0.ChangeDetectorRef },
        { type: undefined }
    ]; };
    _MatPaginatorBase.propDecorators = {
        color: [{ type: i0.Input }],
        pageIndex: [{ type: i0.Input }],
        length: [{ type: i0.Input }],
        pageSize: [{ type: i0.Input }],
        pageSizeOptions: [{ type: i0.Input }],
        hidePageSize: [{ type: i0.Input }],
        showFirstLastButtons: [{ type: i0.Input }],
        page: [{ type: i0.Output }]
    };
    /**
     * Component to provide navigation between paged information. Displays the size of the current
     * page, user-selectable options to change that size, what items are being shown, and
     * navigational button to go to the previous or next page.
     */
    var MatPaginator = /** @class */ (function (_super) {
        __extends(MatPaginator, _super);
        function MatPaginator(intl, changeDetectorRef, defaults) {
            var _this = _super.call(this, intl, changeDetectorRef, defaults) || this;
            if (defaults && defaults.formFieldAppearance != null) {
                _this._formFieldAppearance = defaults.formFieldAppearance;
            }
            return _this;
        }
        return MatPaginator;
    }(_MatPaginatorBase));
    MatPaginator.decorators = [
        { type: i0.Component, args: [{
                    selector: 'mat-paginator',
                    exportAs: 'matPaginator',
                    template: "<div class=\"mat-paginator-outer-container\">\n  <div class=\"mat-paginator-container\">\n    <div class=\"mat-paginator-page-size\" *ngIf=\"!hidePageSize\">\n      <div class=\"mat-paginator-page-size-label\">\n        {{_intl.itemsPerPageLabel}}\n      </div>\n\n      <mat-form-field\n        *ngIf=\"_displayedPageSizeOptions.length > 1\"\n        [appearance]=\"_formFieldAppearance!\"\n        [color]=\"color\"\n        class=\"mat-paginator-page-size-select\">\n        <mat-select\n          [value]=\"pageSize\"\n          [disabled]=\"disabled\"\n          [aria-label]=\"_intl.itemsPerPageLabel\"\n          (selectionChange)=\"_changePageSize($event.value)\">\n          <mat-option *ngFor=\"let pageSizeOption of _displayedPageSizeOptions\" [value]=\"pageSizeOption\">\n            {{pageSizeOption}}\n          </mat-option>\n        </mat-select>\n      </mat-form-field>\n\n      <div\n        class=\"mat-paginator-page-size-value\"\n        *ngIf=\"_displayedPageSizeOptions.length <= 1\">{{pageSize}}</div>\n    </div>\n\n    <div class=\"mat-paginator-range-actions\">\n      <div class=\"mat-paginator-range-label\">\n        {{_intl.getRangeLabel(pageIndex, pageSize, length)}}\n      </div>\n\n      <button mat-icon-button type=\"button\"\n              class=\"mat-paginator-navigation-first\"\n              (click)=\"firstPage()\"\n              [attr.aria-label]=\"_intl.firstPageLabel\"\n              [matTooltip]=\"_intl.firstPageLabel\"\n              [matTooltipDisabled]=\"_previousButtonsDisabled()\"\n              [matTooltipPosition]=\"'above'\"\n              [disabled]=\"_previousButtonsDisabled()\"\n              *ngIf=\"showFirstLastButtons\">\n        <svg class=\"mat-paginator-icon\" viewBox=\"0 0 24 24\" focusable=\"false\">\n          <path d=\"M18.41 16.59L13.82 12l4.59-4.59L17 6l-6 6 6 6zM6 6h2v12H6z\"/>\n        </svg>\n      </button>\n      <button mat-icon-button type=\"button\"\n              class=\"mat-paginator-navigation-previous\"\n              (click)=\"previousPage()\"\n              [attr.aria-label]=\"_intl.previousPageLabel\"\n              [matTooltip]=\"_intl.previousPageLabel\"\n              [matTooltipDisabled]=\"_previousButtonsDisabled()\"\n              [matTooltipPosition]=\"'above'\"\n              [disabled]=\"_previousButtonsDisabled()\">\n        <svg class=\"mat-paginator-icon\" viewBox=\"0 0 24 24\" focusable=\"false\">\n          <path d=\"M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z\"/>\n        </svg>\n      </button>\n      <button mat-icon-button type=\"button\"\n              class=\"mat-paginator-navigation-next\"\n              (click)=\"nextPage()\"\n              [attr.aria-label]=\"_intl.nextPageLabel\"\n              [matTooltip]=\"_intl.nextPageLabel\"\n              [matTooltipDisabled]=\"_nextButtonsDisabled()\"\n              [matTooltipPosition]=\"'above'\"\n              [disabled]=\"_nextButtonsDisabled()\">\n        <svg class=\"mat-paginator-icon\" viewBox=\"0 0 24 24\" focusable=\"false\">\n          <path d=\"M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z\"/>\n        </svg>\n      </button>\n      <button mat-icon-button type=\"button\"\n              class=\"mat-paginator-navigation-last\"\n              (click)=\"lastPage()\"\n              [attr.aria-label]=\"_intl.lastPageLabel\"\n              [matTooltip]=\"_intl.lastPageLabel\"\n              [matTooltipDisabled]=\"_nextButtonsDisabled()\"\n              [matTooltipPosition]=\"'above'\"\n              [disabled]=\"_nextButtonsDisabled()\"\n              *ngIf=\"showFirstLastButtons\">\n        <svg class=\"mat-paginator-icon\" viewBox=\"0 0 24 24\" focusable=\"false\">\n          <path d=\"M5.59 7.41L10.18 12l-4.59 4.59L7 18l6-6-6-6zM16 6h2v12h-2z\"/>\n        </svg>\n      </button>\n    </div>\n  </div>\n</div>\n",
                    inputs: ['disabled'],
                    host: {
                        'class': 'mat-paginator',
                        'role': 'group',
                    },
                    changeDetection: i0.ChangeDetectionStrategy.OnPush,
                    encapsulation: i0.ViewEncapsulation.None,
                    styles: [".mat-paginator{display:block}.mat-paginator-outer-container{display:flex}.mat-paginator-container{display:flex;align-items:center;justify-content:flex-end;padding:0 8px;flex-wrap:wrap-reverse;width:100%}.mat-paginator-page-size{display:flex;align-items:baseline;margin-right:8px}[dir=rtl] .mat-paginator-page-size{margin-right:0;margin-left:8px}.mat-paginator-page-size-label{margin:0 4px}.mat-paginator-page-size-select{margin:6px 4px 0 4px;width:56px}.mat-paginator-page-size-select.mat-form-field-appearance-outline{width:64px}.mat-paginator-page-size-select.mat-form-field-appearance-fill{width:64px}.mat-paginator-range-label{margin:0 32px 0 24px}.mat-paginator-range-actions{display:flex;align-items:center}.mat-paginator-icon{width:28px;fill:currentColor}[dir=rtl] .mat-paginator-icon{transform:rotate(180deg)}\n"]
                },] }
    ];
    MatPaginator.ctorParameters = function () { return [
        { type: MatPaginatorIntl },
        { type: i0.ChangeDetectorRef },
        { type: undefined, decorators: [{ type: i0.Optional }, { type: i0.Inject, args: [MAT_PAGINATOR_DEFAULT_OPTIONS,] }] }
    ]; };

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var MatPaginatorModule = /** @class */ (function () {
        function MatPaginatorModule() {
        }
        return MatPaginatorModule;
    }());
    MatPaginatorModule.decorators = [
        { type: i0.NgModule, args: [{
                    imports: [
                        common.CommonModule,
                        button.MatButtonModule,
                        select.MatSelectModule,
                        tooltip.MatTooltipModule,
                        core.MatCommonModule,
                    ],
                    exports: [MatPaginator],
                    declarations: [MatPaginator],
                    providers: [MAT_PAGINATOR_INTL_PROVIDER],
                },] }
    ];

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

    exports.MAT_PAGINATOR_DEFAULT_OPTIONS = MAT_PAGINATOR_DEFAULT_OPTIONS;
    exports.MAT_PAGINATOR_INTL_PROVIDER = MAT_PAGINATOR_INTL_PROVIDER;
    exports.MAT_PAGINATOR_INTL_PROVIDER_FACTORY = MAT_PAGINATOR_INTL_PROVIDER_FACTORY;
    exports.MatPaginator = MatPaginator;
    exports.MatPaginatorIntl = MatPaginatorIntl;
    exports.MatPaginatorModule = MatPaginatorModule;
    exports.PageEvent = PageEvent;
    exports._MatPaginatorBase = _MatPaginatorBase;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=material-paginator.umd.js.map
