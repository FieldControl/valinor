(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/common'), require('@angular/core'), require('@angular/material/core'), require('@angular/cdk/coercion'), require('rxjs'), require('rxjs/operators'), require('@angular/cdk/a11y'), require('@angular/cdk/collections'), require('@angular/cdk/keycodes'), require('@angular/forms'), require('@angular/material/divider')) :
    typeof define === 'function' && define.amd ? define('@angular/material/list', ['exports', '@angular/common', '@angular/core', '@angular/material/core', '@angular/cdk/coercion', 'rxjs', 'rxjs/operators', '@angular/cdk/a11y', '@angular/cdk/collections', '@angular/cdk/keycodes', '@angular/forms', '@angular/material/divider'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.ng = global.ng || {}, global.ng.material = global.ng.material || {}, global.ng.material.list = {}), global.ng.common, global.ng.core, global.ng.material.core, global.ng.cdk.coercion, global.rxjs, global.rxjs.operators, global.ng.cdk.a11y, global.ng.cdk.collections, global.ng.cdk.keycodes, global.ng.forms, global.ng.material.divider));
}(this, (function (exports, common, core$1, core, coercion, rxjs, operators, a11y, collections, keycodes, forms, divider) { 'use strict';

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

    // Boilerplate for applying mixins to MatList.
    /** @docs-private */
    var MatListBase = /** @class */ (function () {
        function MatListBase() {
        }
        return MatListBase;
    }());
    var _MatListMixinBase = core.mixinDisabled(core.mixinDisableRipple(MatListBase));
    // Boilerplate for applying mixins to MatListItem.
    /** @docs-private */
    var MatListItemBase = /** @class */ (function () {
        function MatListItemBase() {
        }
        return MatListItemBase;
    }());
    var _MatListItemMixinBase = core.mixinDisableRipple(MatListItemBase);
    /**
     * Injection token that can be used to inject instances of `MatList`. It serves as
     * alternative token to the actual `MatList` class which could cause unnecessary
     * retention of the class and its component metadata.
     */
    var MAT_LIST = new core$1.InjectionToken('MatList');
    /**
     * Injection token that can be used to inject instances of `MatNavList`. It serves as
     * alternative token to the actual `MatNavList` class which could cause unnecessary
     * retention of the class and its component metadata.
     */
    var MAT_NAV_LIST = new core$1.InjectionToken('MatNavList');
    var MatNavList = /** @class */ (function (_super) {
        __extends(MatNavList, _super);
        function MatNavList() {
            var _this = _super.apply(this, __spreadArray([], __read(arguments))) || this;
            /** Emits when the state of the list changes. */
            _this._stateChanges = new rxjs.Subject();
            return _this;
        }
        MatNavList.prototype.ngOnChanges = function () {
            this._stateChanges.next();
        };
        MatNavList.prototype.ngOnDestroy = function () {
            this._stateChanges.complete();
        };
        return MatNavList;
    }(_MatListMixinBase));
    MatNavList.decorators = [
        { type: core$1.Component, args: [{
                    selector: 'mat-nav-list',
                    exportAs: 'matNavList',
                    host: {
                        'role': 'navigation',
                        'class': 'mat-nav-list mat-list-base'
                    },
                    template: "<ng-content></ng-content>\n\n",
                    inputs: ['disableRipple', 'disabled'],
                    encapsulation: core$1.ViewEncapsulation.None,
                    changeDetection: core$1.ChangeDetectionStrategy.OnPush,
                    providers: [{ provide: MAT_NAV_LIST, useExisting: MatNavList }],
                    styles: [".mat-subheader{display:flex;box-sizing:border-box;padding:16px;align-items:center}.mat-list-base .mat-subheader{margin:0}.mat-list-base{padding-top:8px;display:block;-webkit-tap-highlight-color:transparent}.mat-list-base .mat-subheader{height:48px;line-height:16px}.mat-list-base .mat-subheader:first-child{margin-top:-8px}.mat-list-base .mat-list-item,.mat-list-base .mat-list-option{display:block;height:48px;-webkit-tap-highlight-color:transparent;width:100%;padding:0}.mat-list-base .mat-list-item .mat-list-item-content,.mat-list-base .mat-list-option .mat-list-item-content{display:flex;flex-direction:row;align-items:center;box-sizing:border-box;padding:0 16px;position:relative;height:inherit}.mat-list-base .mat-list-item .mat-list-item-content-reverse,.mat-list-base .mat-list-option .mat-list-item-content-reverse{display:flex;align-items:center;padding:0 16px;flex-direction:row-reverse;justify-content:space-around}.mat-list-base .mat-list-item .mat-list-item-ripple,.mat-list-base .mat-list-option .mat-list-item-ripple{top:0;left:0;right:0;bottom:0;position:absolute;pointer-events:none}.mat-list-base .mat-list-item.mat-list-item-with-avatar,.mat-list-base .mat-list-option.mat-list-item-with-avatar{height:56px}.mat-list-base .mat-list-item.mat-2-line,.mat-list-base .mat-list-option.mat-2-line{height:72px}.mat-list-base .mat-list-item.mat-3-line,.mat-list-base .mat-list-option.mat-3-line{height:88px}.mat-list-base .mat-list-item.mat-multi-line,.mat-list-base .mat-list-option.mat-multi-line{height:auto}.mat-list-base .mat-list-item.mat-multi-line .mat-list-item-content,.mat-list-base .mat-list-option.mat-multi-line .mat-list-item-content{padding-top:16px;padding-bottom:16px}.mat-list-base .mat-list-item .mat-list-text,.mat-list-base .mat-list-option .mat-list-text{display:flex;flex-direction:column;flex:auto;box-sizing:border-box;overflow:hidden;padding:0}.mat-list-base .mat-list-item .mat-list-text>*,.mat-list-base .mat-list-option .mat-list-text>*{margin:0;padding:0;font-weight:normal;font-size:inherit}.mat-list-base .mat-list-item .mat-list-text:empty,.mat-list-base .mat-list-option .mat-list-text:empty{display:none}.mat-list-base .mat-list-item.mat-list-item-with-avatar .mat-list-item-content .mat-list-text,.mat-list-base .mat-list-item.mat-list-option .mat-list-item-content .mat-list-text,.mat-list-base .mat-list-option.mat-list-item-with-avatar .mat-list-item-content .mat-list-text,.mat-list-base .mat-list-option.mat-list-option .mat-list-item-content .mat-list-text{padding-right:0;padding-left:16px}[dir=rtl] .mat-list-base .mat-list-item.mat-list-item-with-avatar .mat-list-item-content .mat-list-text,[dir=rtl] .mat-list-base .mat-list-item.mat-list-option .mat-list-item-content .mat-list-text,[dir=rtl] .mat-list-base .mat-list-option.mat-list-item-with-avatar .mat-list-item-content .mat-list-text,[dir=rtl] .mat-list-base .mat-list-option.mat-list-option .mat-list-item-content .mat-list-text{padding-right:16px;padding-left:0}.mat-list-base .mat-list-item.mat-list-item-with-avatar .mat-list-item-content-reverse .mat-list-text,.mat-list-base .mat-list-item.mat-list-option .mat-list-item-content-reverse .mat-list-text,.mat-list-base .mat-list-option.mat-list-item-with-avatar .mat-list-item-content-reverse .mat-list-text,.mat-list-base .mat-list-option.mat-list-option .mat-list-item-content-reverse .mat-list-text{padding-left:0;padding-right:16px}[dir=rtl] .mat-list-base .mat-list-item.mat-list-item-with-avatar .mat-list-item-content-reverse .mat-list-text,[dir=rtl] .mat-list-base .mat-list-item.mat-list-option .mat-list-item-content-reverse .mat-list-text,[dir=rtl] .mat-list-base .mat-list-option.mat-list-item-with-avatar .mat-list-item-content-reverse .mat-list-text,[dir=rtl] .mat-list-base .mat-list-option.mat-list-option .mat-list-item-content-reverse .mat-list-text{padding-right:0;padding-left:16px}.mat-list-base .mat-list-item.mat-list-item-with-avatar.mat-list-option .mat-list-item-content-reverse .mat-list-text,.mat-list-base .mat-list-item.mat-list-item-with-avatar.mat-list-option .mat-list-item-content .mat-list-text,.mat-list-base .mat-list-option.mat-list-item-with-avatar.mat-list-option .mat-list-item-content-reverse .mat-list-text,.mat-list-base .mat-list-option.mat-list-item-with-avatar.mat-list-option .mat-list-item-content .mat-list-text{padding-right:16px;padding-left:16px}.mat-list-base .mat-list-item .mat-list-avatar,.mat-list-base .mat-list-option .mat-list-avatar{flex-shrink:0;width:40px;height:40px;border-radius:50%;object-fit:cover}.mat-list-base .mat-list-item .mat-list-avatar~.mat-divider-inset,.mat-list-base .mat-list-option .mat-list-avatar~.mat-divider-inset{margin-left:72px;width:calc(100% - 72px)}[dir=rtl] .mat-list-base .mat-list-item .mat-list-avatar~.mat-divider-inset,[dir=rtl] .mat-list-base .mat-list-option .mat-list-avatar~.mat-divider-inset{margin-left:auto;margin-right:72px}.mat-list-base .mat-list-item .mat-list-icon,.mat-list-base .mat-list-option .mat-list-icon{flex-shrink:0;width:24px;height:24px;font-size:24px;box-sizing:content-box;border-radius:50%;padding:4px}.mat-list-base .mat-list-item .mat-list-icon~.mat-divider-inset,.mat-list-base .mat-list-option .mat-list-icon~.mat-divider-inset{margin-left:64px;width:calc(100% - 64px)}[dir=rtl] .mat-list-base .mat-list-item .mat-list-icon~.mat-divider-inset,[dir=rtl] .mat-list-base .mat-list-option .mat-list-icon~.mat-divider-inset{margin-left:auto;margin-right:64px}.mat-list-base .mat-list-item .mat-divider,.mat-list-base .mat-list-option .mat-divider{position:absolute;bottom:0;left:0;width:100%;margin:0}[dir=rtl] .mat-list-base .mat-list-item .mat-divider,[dir=rtl] .mat-list-base .mat-list-option .mat-divider{margin-left:auto;margin-right:0}.mat-list-base .mat-list-item .mat-divider.mat-divider-inset,.mat-list-base .mat-list-option .mat-divider.mat-divider-inset{position:absolute}.mat-list-base[dense]{padding-top:4px;display:block}.mat-list-base[dense] .mat-subheader{height:40px;line-height:8px}.mat-list-base[dense] .mat-subheader:first-child{margin-top:-4px}.mat-list-base[dense] .mat-list-item,.mat-list-base[dense] .mat-list-option{display:block;height:40px;-webkit-tap-highlight-color:transparent;width:100%;padding:0}.mat-list-base[dense] .mat-list-item .mat-list-item-content,.mat-list-base[dense] .mat-list-option .mat-list-item-content{display:flex;flex-direction:row;align-items:center;box-sizing:border-box;padding:0 16px;position:relative;height:inherit}.mat-list-base[dense] .mat-list-item .mat-list-item-content-reverse,.mat-list-base[dense] .mat-list-option .mat-list-item-content-reverse{display:flex;align-items:center;padding:0 16px;flex-direction:row-reverse;justify-content:space-around}.mat-list-base[dense] .mat-list-item .mat-list-item-ripple,.mat-list-base[dense] .mat-list-option .mat-list-item-ripple{top:0;left:0;right:0;bottom:0;position:absolute;pointer-events:none}.mat-list-base[dense] .mat-list-item.mat-list-item-with-avatar,.mat-list-base[dense] .mat-list-option.mat-list-item-with-avatar{height:48px}.mat-list-base[dense] .mat-list-item.mat-2-line,.mat-list-base[dense] .mat-list-option.mat-2-line{height:60px}.mat-list-base[dense] .mat-list-item.mat-3-line,.mat-list-base[dense] .mat-list-option.mat-3-line{height:76px}.mat-list-base[dense] .mat-list-item.mat-multi-line,.mat-list-base[dense] .mat-list-option.mat-multi-line{height:auto}.mat-list-base[dense] .mat-list-item.mat-multi-line .mat-list-item-content,.mat-list-base[dense] .mat-list-option.mat-multi-line .mat-list-item-content{padding-top:16px;padding-bottom:16px}.mat-list-base[dense] .mat-list-item .mat-list-text,.mat-list-base[dense] .mat-list-option .mat-list-text{display:flex;flex-direction:column;flex:auto;box-sizing:border-box;overflow:hidden;padding:0}.mat-list-base[dense] .mat-list-item .mat-list-text>*,.mat-list-base[dense] .mat-list-option .mat-list-text>*{margin:0;padding:0;font-weight:normal;font-size:inherit}.mat-list-base[dense] .mat-list-item .mat-list-text:empty,.mat-list-base[dense] .mat-list-option .mat-list-text:empty{display:none}.mat-list-base[dense] .mat-list-item.mat-list-item-with-avatar .mat-list-item-content .mat-list-text,.mat-list-base[dense] .mat-list-item.mat-list-option .mat-list-item-content .mat-list-text,.mat-list-base[dense] .mat-list-option.mat-list-item-with-avatar .mat-list-item-content .mat-list-text,.mat-list-base[dense] .mat-list-option.mat-list-option .mat-list-item-content .mat-list-text{padding-right:0;padding-left:16px}[dir=rtl] .mat-list-base[dense] .mat-list-item.mat-list-item-with-avatar .mat-list-item-content .mat-list-text,[dir=rtl] .mat-list-base[dense] .mat-list-item.mat-list-option .mat-list-item-content .mat-list-text,[dir=rtl] .mat-list-base[dense] .mat-list-option.mat-list-item-with-avatar .mat-list-item-content .mat-list-text,[dir=rtl] .mat-list-base[dense] .mat-list-option.mat-list-option .mat-list-item-content .mat-list-text{padding-right:16px;padding-left:0}.mat-list-base[dense] .mat-list-item.mat-list-item-with-avatar .mat-list-item-content-reverse .mat-list-text,.mat-list-base[dense] .mat-list-item.mat-list-option .mat-list-item-content-reverse .mat-list-text,.mat-list-base[dense] .mat-list-option.mat-list-item-with-avatar .mat-list-item-content-reverse .mat-list-text,.mat-list-base[dense] .mat-list-option.mat-list-option .mat-list-item-content-reverse .mat-list-text{padding-left:0;padding-right:16px}[dir=rtl] .mat-list-base[dense] .mat-list-item.mat-list-item-with-avatar .mat-list-item-content-reverse .mat-list-text,[dir=rtl] .mat-list-base[dense] .mat-list-item.mat-list-option .mat-list-item-content-reverse .mat-list-text,[dir=rtl] .mat-list-base[dense] .mat-list-option.mat-list-item-with-avatar .mat-list-item-content-reverse .mat-list-text,[dir=rtl] .mat-list-base[dense] .mat-list-option.mat-list-option .mat-list-item-content-reverse .mat-list-text{padding-right:0;padding-left:16px}.mat-list-base[dense] .mat-list-item.mat-list-item-with-avatar.mat-list-option .mat-list-item-content-reverse .mat-list-text,.mat-list-base[dense] .mat-list-item.mat-list-item-with-avatar.mat-list-option .mat-list-item-content .mat-list-text,.mat-list-base[dense] .mat-list-option.mat-list-item-with-avatar.mat-list-option .mat-list-item-content-reverse .mat-list-text,.mat-list-base[dense] .mat-list-option.mat-list-item-with-avatar.mat-list-option .mat-list-item-content .mat-list-text{padding-right:16px;padding-left:16px}.mat-list-base[dense] .mat-list-item .mat-list-avatar,.mat-list-base[dense] .mat-list-option .mat-list-avatar{flex-shrink:0;width:36px;height:36px;border-radius:50%;object-fit:cover}.mat-list-base[dense] .mat-list-item .mat-list-avatar~.mat-divider-inset,.mat-list-base[dense] .mat-list-option .mat-list-avatar~.mat-divider-inset{margin-left:68px;width:calc(100% - 68px)}[dir=rtl] .mat-list-base[dense] .mat-list-item .mat-list-avatar~.mat-divider-inset,[dir=rtl] .mat-list-base[dense] .mat-list-option .mat-list-avatar~.mat-divider-inset{margin-left:auto;margin-right:68px}.mat-list-base[dense] .mat-list-item .mat-list-icon,.mat-list-base[dense] .mat-list-option .mat-list-icon{flex-shrink:0;width:20px;height:20px;font-size:20px;box-sizing:content-box;border-radius:50%;padding:4px}.mat-list-base[dense] .mat-list-item .mat-list-icon~.mat-divider-inset,.mat-list-base[dense] .mat-list-option .mat-list-icon~.mat-divider-inset{margin-left:60px;width:calc(100% - 60px)}[dir=rtl] .mat-list-base[dense] .mat-list-item .mat-list-icon~.mat-divider-inset,[dir=rtl] .mat-list-base[dense] .mat-list-option .mat-list-icon~.mat-divider-inset{margin-left:auto;margin-right:60px}.mat-list-base[dense] .mat-list-item .mat-divider,.mat-list-base[dense] .mat-list-option .mat-divider{position:absolute;bottom:0;left:0;width:100%;margin:0}[dir=rtl] .mat-list-base[dense] .mat-list-item .mat-divider,[dir=rtl] .mat-list-base[dense] .mat-list-option .mat-divider{margin-left:auto;margin-right:0}.mat-list-base[dense] .mat-list-item .mat-divider.mat-divider-inset,.mat-list-base[dense] .mat-list-option .mat-divider.mat-divider-inset{position:absolute}.mat-nav-list a{text-decoration:none;color:inherit}.mat-nav-list .mat-list-item{cursor:pointer;outline:none}mat-action-list button{background:none;color:inherit;border:none;font:inherit;outline:inherit;-webkit-tap-highlight-color:transparent;text-align:left}[dir=rtl] mat-action-list button{text-align:right}mat-action-list button::-moz-focus-inner{border:0}mat-action-list .mat-list-item{cursor:pointer;outline:inherit}.mat-list-option:not(.mat-list-item-disabled){cursor:pointer;outline:none}.mat-list-item-disabled{pointer-events:none}.cdk-high-contrast-active .mat-list-item-disabled{opacity:.5}.cdk-high-contrast-active :host .mat-list-item-disabled{opacity:.5}.cdk-high-contrast-active .mat-selection-list:focus{outline-style:dotted}.cdk-high-contrast-active .mat-list-option:hover,.cdk-high-contrast-active .mat-list-option:focus,.cdk-high-contrast-active .mat-nav-list .mat-list-item:hover,.cdk-high-contrast-active .mat-nav-list .mat-list-item:focus,.cdk-high-contrast-active mat-action-list .mat-list-item:hover,.cdk-high-contrast-active mat-action-list .mat-list-item:focus{outline:dotted 1px}.cdk-high-contrast-active .mat-list-single-selected-option::after{content:\"\";position:absolute;top:50%;right:16px;transform:translateY(-50%);width:10px;height:0;border-bottom:solid 10px;border-radius:10px}.cdk-high-contrast-active [dir=rtl] .mat-list-single-selected-option::after{right:auto;left:16px}@media(hover: none){.mat-list-option:not(.mat-list-single-selected-option):not(.mat-list-item-disabled):hover,.mat-nav-list .mat-list-item:not(.mat-list-item-disabled):hover,.mat-action-list .mat-list-item:not(.mat-list-item-disabled):hover{background:none}}\n"]
                },] }
    ];
    var MatList = /** @class */ (function (_super) {
        __extends(MatList, _super);
        function MatList(_elementRef) {
            var _this = _super.call(this) || this;
            _this._elementRef = _elementRef;
            /** Emits when the state of the list changes. */
            _this._stateChanges = new rxjs.Subject();
            if (_this._getListType() === 'action-list') {
                _elementRef.nativeElement.classList.add('mat-action-list');
            }
            return _this;
        }
        MatList.prototype._getListType = function () {
            var nodeName = this._elementRef.nativeElement.nodeName.toLowerCase();
            if (nodeName === 'mat-list') {
                return 'list';
            }
            if (nodeName === 'mat-action-list') {
                return 'action-list';
            }
            return null;
        };
        MatList.prototype.ngOnChanges = function () {
            this._stateChanges.next();
        };
        MatList.prototype.ngOnDestroy = function () {
            this._stateChanges.complete();
        };
        return MatList;
    }(_MatListMixinBase));
    MatList.decorators = [
        { type: core$1.Component, args: [{
                    selector: 'mat-list, mat-action-list',
                    exportAs: 'matList',
                    template: "<ng-content></ng-content>\n\n",
                    host: {
                        'class': 'mat-list mat-list-base'
                    },
                    inputs: ['disableRipple', 'disabled'],
                    encapsulation: core$1.ViewEncapsulation.None,
                    changeDetection: core$1.ChangeDetectionStrategy.OnPush,
                    providers: [{ provide: MAT_LIST, useExisting: MatList }],
                    styles: [".mat-subheader{display:flex;box-sizing:border-box;padding:16px;align-items:center}.mat-list-base .mat-subheader{margin:0}.mat-list-base{padding-top:8px;display:block;-webkit-tap-highlight-color:transparent}.mat-list-base .mat-subheader{height:48px;line-height:16px}.mat-list-base .mat-subheader:first-child{margin-top:-8px}.mat-list-base .mat-list-item,.mat-list-base .mat-list-option{display:block;height:48px;-webkit-tap-highlight-color:transparent;width:100%;padding:0}.mat-list-base .mat-list-item .mat-list-item-content,.mat-list-base .mat-list-option .mat-list-item-content{display:flex;flex-direction:row;align-items:center;box-sizing:border-box;padding:0 16px;position:relative;height:inherit}.mat-list-base .mat-list-item .mat-list-item-content-reverse,.mat-list-base .mat-list-option .mat-list-item-content-reverse{display:flex;align-items:center;padding:0 16px;flex-direction:row-reverse;justify-content:space-around}.mat-list-base .mat-list-item .mat-list-item-ripple,.mat-list-base .mat-list-option .mat-list-item-ripple{top:0;left:0;right:0;bottom:0;position:absolute;pointer-events:none}.mat-list-base .mat-list-item.mat-list-item-with-avatar,.mat-list-base .mat-list-option.mat-list-item-with-avatar{height:56px}.mat-list-base .mat-list-item.mat-2-line,.mat-list-base .mat-list-option.mat-2-line{height:72px}.mat-list-base .mat-list-item.mat-3-line,.mat-list-base .mat-list-option.mat-3-line{height:88px}.mat-list-base .mat-list-item.mat-multi-line,.mat-list-base .mat-list-option.mat-multi-line{height:auto}.mat-list-base .mat-list-item.mat-multi-line .mat-list-item-content,.mat-list-base .mat-list-option.mat-multi-line .mat-list-item-content{padding-top:16px;padding-bottom:16px}.mat-list-base .mat-list-item .mat-list-text,.mat-list-base .mat-list-option .mat-list-text{display:flex;flex-direction:column;flex:auto;box-sizing:border-box;overflow:hidden;padding:0}.mat-list-base .mat-list-item .mat-list-text>*,.mat-list-base .mat-list-option .mat-list-text>*{margin:0;padding:0;font-weight:normal;font-size:inherit}.mat-list-base .mat-list-item .mat-list-text:empty,.mat-list-base .mat-list-option .mat-list-text:empty{display:none}.mat-list-base .mat-list-item.mat-list-item-with-avatar .mat-list-item-content .mat-list-text,.mat-list-base .mat-list-item.mat-list-option .mat-list-item-content .mat-list-text,.mat-list-base .mat-list-option.mat-list-item-with-avatar .mat-list-item-content .mat-list-text,.mat-list-base .mat-list-option.mat-list-option .mat-list-item-content .mat-list-text{padding-right:0;padding-left:16px}[dir=rtl] .mat-list-base .mat-list-item.mat-list-item-with-avatar .mat-list-item-content .mat-list-text,[dir=rtl] .mat-list-base .mat-list-item.mat-list-option .mat-list-item-content .mat-list-text,[dir=rtl] .mat-list-base .mat-list-option.mat-list-item-with-avatar .mat-list-item-content .mat-list-text,[dir=rtl] .mat-list-base .mat-list-option.mat-list-option .mat-list-item-content .mat-list-text{padding-right:16px;padding-left:0}.mat-list-base .mat-list-item.mat-list-item-with-avatar .mat-list-item-content-reverse .mat-list-text,.mat-list-base .mat-list-item.mat-list-option .mat-list-item-content-reverse .mat-list-text,.mat-list-base .mat-list-option.mat-list-item-with-avatar .mat-list-item-content-reverse .mat-list-text,.mat-list-base .mat-list-option.mat-list-option .mat-list-item-content-reverse .mat-list-text{padding-left:0;padding-right:16px}[dir=rtl] .mat-list-base .mat-list-item.mat-list-item-with-avatar .mat-list-item-content-reverse .mat-list-text,[dir=rtl] .mat-list-base .mat-list-item.mat-list-option .mat-list-item-content-reverse .mat-list-text,[dir=rtl] .mat-list-base .mat-list-option.mat-list-item-with-avatar .mat-list-item-content-reverse .mat-list-text,[dir=rtl] .mat-list-base .mat-list-option.mat-list-option .mat-list-item-content-reverse .mat-list-text{padding-right:0;padding-left:16px}.mat-list-base .mat-list-item.mat-list-item-with-avatar.mat-list-option .mat-list-item-content-reverse .mat-list-text,.mat-list-base .mat-list-item.mat-list-item-with-avatar.mat-list-option .mat-list-item-content .mat-list-text,.mat-list-base .mat-list-option.mat-list-item-with-avatar.mat-list-option .mat-list-item-content-reverse .mat-list-text,.mat-list-base .mat-list-option.mat-list-item-with-avatar.mat-list-option .mat-list-item-content .mat-list-text{padding-right:16px;padding-left:16px}.mat-list-base .mat-list-item .mat-list-avatar,.mat-list-base .mat-list-option .mat-list-avatar{flex-shrink:0;width:40px;height:40px;border-radius:50%;object-fit:cover}.mat-list-base .mat-list-item .mat-list-avatar~.mat-divider-inset,.mat-list-base .mat-list-option .mat-list-avatar~.mat-divider-inset{margin-left:72px;width:calc(100% - 72px)}[dir=rtl] .mat-list-base .mat-list-item .mat-list-avatar~.mat-divider-inset,[dir=rtl] .mat-list-base .mat-list-option .mat-list-avatar~.mat-divider-inset{margin-left:auto;margin-right:72px}.mat-list-base .mat-list-item .mat-list-icon,.mat-list-base .mat-list-option .mat-list-icon{flex-shrink:0;width:24px;height:24px;font-size:24px;box-sizing:content-box;border-radius:50%;padding:4px}.mat-list-base .mat-list-item .mat-list-icon~.mat-divider-inset,.mat-list-base .mat-list-option .mat-list-icon~.mat-divider-inset{margin-left:64px;width:calc(100% - 64px)}[dir=rtl] .mat-list-base .mat-list-item .mat-list-icon~.mat-divider-inset,[dir=rtl] .mat-list-base .mat-list-option .mat-list-icon~.mat-divider-inset{margin-left:auto;margin-right:64px}.mat-list-base .mat-list-item .mat-divider,.mat-list-base .mat-list-option .mat-divider{position:absolute;bottom:0;left:0;width:100%;margin:0}[dir=rtl] .mat-list-base .mat-list-item .mat-divider,[dir=rtl] .mat-list-base .mat-list-option .mat-divider{margin-left:auto;margin-right:0}.mat-list-base .mat-list-item .mat-divider.mat-divider-inset,.mat-list-base .mat-list-option .mat-divider.mat-divider-inset{position:absolute}.mat-list-base[dense]{padding-top:4px;display:block}.mat-list-base[dense] .mat-subheader{height:40px;line-height:8px}.mat-list-base[dense] .mat-subheader:first-child{margin-top:-4px}.mat-list-base[dense] .mat-list-item,.mat-list-base[dense] .mat-list-option{display:block;height:40px;-webkit-tap-highlight-color:transparent;width:100%;padding:0}.mat-list-base[dense] .mat-list-item .mat-list-item-content,.mat-list-base[dense] .mat-list-option .mat-list-item-content{display:flex;flex-direction:row;align-items:center;box-sizing:border-box;padding:0 16px;position:relative;height:inherit}.mat-list-base[dense] .mat-list-item .mat-list-item-content-reverse,.mat-list-base[dense] .mat-list-option .mat-list-item-content-reverse{display:flex;align-items:center;padding:0 16px;flex-direction:row-reverse;justify-content:space-around}.mat-list-base[dense] .mat-list-item .mat-list-item-ripple,.mat-list-base[dense] .mat-list-option .mat-list-item-ripple{top:0;left:0;right:0;bottom:0;position:absolute;pointer-events:none}.mat-list-base[dense] .mat-list-item.mat-list-item-with-avatar,.mat-list-base[dense] .mat-list-option.mat-list-item-with-avatar{height:48px}.mat-list-base[dense] .mat-list-item.mat-2-line,.mat-list-base[dense] .mat-list-option.mat-2-line{height:60px}.mat-list-base[dense] .mat-list-item.mat-3-line,.mat-list-base[dense] .mat-list-option.mat-3-line{height:76px}.mat-list-base[dense] .mat-list-item.mat-multi-line,.mat-list-base[dense] .mat-list-option.mat-multi-line{height:auto}.mat-list-base[dense] .mat-list-item.mat-multi-line .mat-list-item-content,.mat-list-base[dense] .mat-list-option.mat-multi-line .mat-list-item-content{padding-top:16px;padding-bottom:16px}.mat-list-base[dense] .mat-list-item .mat-list-text,.mat-list-base[dense] .mat-list-option .mat-list-text{display:flex;flex-direction:column;flex:auto;box-sizing:border-box;overflow:hidden;padding:0}.mat-list-base[dense] .mat-list-item .mat-list-text>*,.mat-list-base[dense] .mat-list-option .mat-list-text>*{margin:0;padding:0;font-weight:normal;font-size:inherit}.mat-list-base[dense] .mat-list-item .mat-list-text:empty,.mat-list-base[dense] .mat-list-option .mat-list-text:empty{display:none}.mat-list-base[dense] .mat-list-item.mat-list-item-with-avatar .mat-list-item-content .mat-list-text,.mat-list-base[dense] .mat-list-item.mat-list-option .mat-list-item-content .mat-list-text,.mat-list-base[dense] .mat-list-option.mat-list-item-with-avatar .mat-list-item-content .mat-list-text,.mat-list-base[dense] .mat-list-option.mat-list-option .mat-list-item-content .mat-list-text{padding-right:0;padding-left:16px}[dir=rtl] .mat-list-base[dense] .mat-list-item.mat-list-item-with-avatar .mat-list-item-content .mat-list-text,[dir=rtl] .mat-list-base[dense] .mat-list-item.mat-list-option .mat-list-item-content .mat-list-text,[dir=rtl] .mat-list-base[dense] .mat-list-option.mat-list-item-with-avatar .mat-list-item-content .mat-list-text,[dir=rtl] .mat-list-base[dense] .mat-list-option.mat-list-option .mat-list-item-content .mat-list-text{padding-right:16px;padding-left:0}.mat-list-base[dense] .mat-list-item.mat-list-item-with-avatar .mat-list-item-content-reverse .mat-list-text,.mat-list-base[dense] .mat-list-item.mat-list-option .mat-list-item-content-reverse .mat-list-text,.mat-list-base[dense] .mat-list-option.mat-list-item-with-avatar .mat-list-item-content-reverse .mat-list-text,.mat-list-base[dense] .mat-list-option.mat-list-option .mat-list-item-content-reverse .mat-list-text{padding-left:0;padding-right:16px}[dir=rtl] .mat-list-base[dense] .mat-list-item.mat-list-item-with-avatar .mat-list-item-content-reverse .mat-list-text,[dir=rtl] .mat-list-base[dense] .mat-list-item.mat-list-option .mat-list-item-content-reverse .mat-list-text,[dir=rtl] .mat-list-base[dense] .mat-list-option.mat-list-item-with-avatar .mat-list-item-content-reverse .mat-list-text,[dir=rtl] .mat-list-base[dense] .mat-list-option.mat-list-option .mat-list-item-content-reverse .mat-list-text{padding-right:0;padding-left:16px}.mat-list-base[dense] .mat-list-item.mat-list-item-with-avatar.mat-list-option .mat-list-item-content-reverse .mat-list-text,.mat-list-base[dense] .mat-list-item.mat-list-item-with-avatar.mat-list-option .mat-list-item-content .mat-list-text,.mat-list-base[dense] .mat-list-option.mat-list-item-with-avatar.mat-list-option .mat-list-item-content-reverse .mat-list-text,.mat-list-base[dense] .mat-list-option.mat-list-item-with-avatar.mat-list-option .mat-list-item-content .mat-list-text{padding-right:16px;padding-left:16px}.mat-list-base[dense] .mat-list-item .mat-list-avatar,.mat-list-base[dense] .mat-list-option .mat-list-avatar{flex-shrink:0;width:36px;height:36px;border-radius:50%;object-fit:cover}.mat-list-base[dense] .mat-list-item .mat-list-avatar~.mat-divider-inset,.mat-list-base[dense] .mat-list-option .mat-list-avatar~.mat-divider-inset{margin-left:68px;width:calc(100% - 68px)}[dir=rtl] .mat-list-base[dense] .mat-list-item .mat-list-avatar~.mat-divider-inset,[dir=rtl] .mat-list-base[dense] .mat-list-option .mat-list-avatar~.mat-divider-inset{margin-left:auto;margin-right:68px}.mat-list-base[dense] .mat-list-item .mat-list-icon,.mat-list-base[dense] .mat-list-option .mat-list-icon{flex-shrink:0;width:20px;height:20px;font-size:20px;box-sizing:content-box;border-radius:50%;padding:4px}.mat-list-base[dense] .mat-list-item .mat-list-icon~.mat-divider-inset,.mat-list-base[dense] .mat-list-option .mat-list-icon~.mat-divider-inset{margin-left:60px;width:calc(100% - 60px)}[dir=rtl] .mat-list-base[dense] .mat-list-item .mat-list-icon~.mat-divider-inset,[dir=rtl] .mat-list-base[dense] .mat-list-option .mat-list-icon~.mat-divider-inset{margin-left:auto;margin-right:60px}.mat-list-base[dense] .mat-list-item .mat-divider,.mat-list-base[dense] .mat-list-option .mat-divider{position:absolute;bottom:0;left:0;width:100%;margin:0}[dir=rtl] .mat-list-base[dense] .mat-list-item .mat-divider,[dir=rtl] .mat-list-base[dense] .mat-list-option .mat-divider{margin-left:auto;margin-right:0}.mat-list-base[dense] .mat-list-item .mat-divider.mat-divider-inset,.mat-list-base[dense] .mat-list-option .mat-divider.mat-divider-inset{position:absolute}.mat-nav-list a{text-decoration:none;color:inherit}.mat-nav-list .mat-list-item{cursor:pointer;outline:none}mat-action-list button{background:none;color:inherit;border:none;font:inherit;outline:inherit;-webkit-tap-highlight-color:transparent;text-align:left}[dir=rtl] mat-action-list button{text-align:right}mat-action-list button::-moz-focus-inner{border:0}mat-action-list .mat-list-item{cursor:pointer;outline:inherit}.mat-list-option:not(.mat-list-item-disabled){cursor:pointer;outline:none}.mat-list-item-disabled{pointer-events:none}.cdk-high-contrast-active .mat-list-item-disabled{opacity:.5}.cdk-high-contrast-active :host .mat-list-item-disabled{opacity:.5}.cdk-high-contrast-active .mat-selection-list:focus{outline-style:dotted}.cdk-high-contrast-active .mat-list-option:hover,.cdk-high-contrast-active .mat-list-option:focus,.cdk-high-contrast-active .mat-nav-list .mat-list-item:hover,.cdk-high-contrast-active .mat-nav-list .mat-list-item:focus,.cdk-high-contrast-active mat-action-list .mat-list-item:hover,.cdk-high-contrast-active mat-action-list .mat-list-item:focus{outline:dotted 1px}.cdk-high-contrast-active .mat-list-single-selected-option::after{content:\"\";position:absolute;top:50%;right:16px;transform:translateY(-50%);width:10px;height:0;border-bottom:solid 10px;border-radius:10px}.cdk-high-contrast-active [dir=rtl] .mat-list-single-selected-option::after{right:auto;left:16px}@media(hover: none){.mat-list-option:not(.mat-list-single-selected-option):not(.mat-list-item-disabled):hover,.mat-nav-list .mat-list-item:not(.mat-list-item-disabled):hover,.mat-action-list .mat-list-item:not(.mat-list-item-disabled):hover{background:none}}\n"]
                },] }
    ];
    MatList.ctorParameters = function () { return [
        { type: core$1.ElementRef }
    ]; };
    /**
     * Directive whose purpose is to add the mat- CSS styling to this selector.
     * @docs-private
     */
    var MatListAvatarCssMatStyler = /** @class */ (function () {
        function MatListAvatarCssMatStyler() {
        }
        return MatListAvatarCssMatStyler;
    }());
    MatListAvatarCssMatStyler.decorators = [
        { type: core$1.Directive, args: [{
                    selector: '[mat-list-avatar], [matListAvatar]',
                    host: { 'class': 'mat-list-avatar' }
                },] }
    ];
    /**
     * Directive whose purpose is to add the mat- CSS styling to this selector.
     * @docs-private
     */
    var MatListIconCssMatStyler = /** @class */ (function () {
        function MatListIconCssMatStyler() {
        }
        return MatListIconCssMatStyler;
    }());
    MatListIconCssMatStyler.decorators = [
        { type: core$1.Directive, args: [{
                    selector: '[mat-list-icon], [matListIcon]',
                    host: { 'class': 'mat-list-icon' }
                },] }
    ];
    /**
     * Directive whose purpose is to add the mat- CSS styling to this selector.
     * @docs-private
     */
    var MatListSubheaderCssMatStyler = /** @class */ (function () {
        function MatListSubheaderCssMatStyler() {
        }
        return MatListSubheaderCssMatStyler;
    }());
    MatListSubheaderCssMatStyler.decorators = [
        { type: core$1.Directive, args: [{
                    selector: '[mat-subheader], [matSubheader]',
                    host: { 'class': 'mat-subheader' }
                },] }
    ];
    /** An item within a Material Design list. */
    var MatListItem = /** @class */ (function (_super) {
        __extends(MatListItem, _super);
        function MatListItem(_element, _changeDetectorRef, navList, list) {
            var _this = _super.call(this) || this;
            _this._element = _element;
            _this._isInteractiveList = false;
            _this._destroyed = new rxjs.Subject();
            _this._disabled = false;
            _this._isInteractiveList = !!(navList || (list && list._getListType() === 'action-list'));
            _this._list = navList || list;
            // If no type attribute is specified for <button>, set it to "button".
            // If a type attribute is already specified, do nothing.
            var element = _this._getHostElement();
            if (element.nodeName.toLowerCase() === 'button' && !element.hasAttribute('type')) {
                element.setAttribute('type', 'button');
            }
            if (_this._list) {
                // React to changes in the state of the parent list since
                // some of the item's properties depend on it (e.g. `disableRipple`).
                _this._list._stateChanges.pipe(operators.takeUntil(_this._destroyed)).subscribe(function () {
                    _changeDetectorRef.markForCheck();
                });
            }
            return _this;
        }
        Object.defineProperty(MatListItem.prototype, "disabled", {
            /** Whether the option is disabled. */
            get: function () { return this._disabled || !!(this._list && this._list.disabled); },
            set: function (value) {
                this._disabled = coercion.coerceBooleanProperty(value);
            },
            enumerable: false,
            configurable: true
        });
        MatListItem.prototype.ngAfterContentInit = function () {
            core.setLines(this._lines, this._element);
        };
        MatListItem.prototype.ngOnDestroy = function () {
            this._destroyed.next();
            this._destroyed.complete();
        };
        /** Whether this list item should show a ripple effect when clicked. */
        MatListItem.prototype._isRippleDisabled = function () {
            return !this._isInteractiveList || this.disableRipple ||
                !!(this._list && this._list.disableRipple);
        };
        /** Retrieves the DOM element of the component host. */
        MatListItem.prototype._getHostElement = function () {
            return this._element.nativeElement;
        };
        return MatListItem;
    }(_MatListItemMixinBase));
    MatListItem.decorators = [
        { type: core$1.Component, args: [{
                    selector: 'mat-list-item, a[mat-list-item], button[mat-list-item]',
                    exportAs: 'matListItem',
                    host: {
                        'class': 'mat-list-item mat-focus-indicator',
                        '[class.mat-list-item-disabled]': 'disabled',
                        // @breaking-change 8.0.0 Remove `mat-list-item-avatar` in favor of `mat-list-item-with-avatar`.
                        '[class.mat-list-item-avatar]': '_avatar || _icon',
                        '[class.mat-list-item-with-avatar]': '_avatar || _icon',
                    },
                    inputs: ['disableRipple'],
                    template: "<div class=\"mat-list-item-content\">\n  <div class=\"mat-list-item-ripple\" mat-ripple\n       [matRippleTrigger]=\"_getHostElement()\"\n       [matRippleDisabled]=\"_isRippleDisabled()\">\n  </div>\n\n  <ng-content select=\"[mat-list-avatar], [mat-list-icon], [matListAvatar], [matListIcon]\">\n  </ng-content>\n\n  <div class=\"mat-list-text\"><ng-content select=\"[mat-line], [matLine]\"></ng-content></div>\n\n  <ng-content></ng-content>\n</div>\n",
                    encapsulation: core$1.ViewEncapsulation.None,
                    changeDetection: core$1.ChangeDetectionStrategy.OnPush
                },] }
    ];
    MatListItem.ctorParameters = function () { return [
        { type: core$1.ElementRef },
        { type: core$1.ChangeDetectorRef },
        { type: MatNavList, decorators: [{ type: core$1.Optional }, { type: core$1.Inject, args: [MAT_NAV_LIST,] }] },
        { type: MatList, decorators: [{ type: core$1.Optional }, { type: core$1.Inject, args: [MAT_LIST,] }] }
    ]; };
    MatListItem.propDecorators = {
        _lines: [{ type: core$1.ContentChildren, args: [core.MatLine, { descendants: true },] }],
        _avatar: [{ type: core$1.ContentChild, args: [MatListAvatarCssMatStyler,] }],
        _icon: [{ type: core$1.ContentChild, args: [MatListIconCssMatStyler,] }],
        disabled: [{ type: core$1.Input }]
    };

    var MatSelectionListBase = /** @class */ (function () {
        function MatSelectionListBase() {
        }
        return MatSelectionListBase;
    }());
    var _MatSelectionListMixinBase = core.mixinDisableRipple(MatSelectionListBase);
    var MatListOptionBase = /** @class */ (function () {
        function MatListOptionBase() {
        }
        return MatListOptionBase;
    }());
    var _MatListOptionMixinBase = core.mixinDisableRipple(MatListOptionBase);
    /** @docs-private */
    var MAT_SELECTION_LIST_VALUE_ACCESSOR = {
        provide: forms.NG_VALUE_ACCESSOR,
        useExisting: core$1.forwardRef(function () { return MatSelectionList; }),
        multi: true
    };
    /** Change event that is being fired whenever the selected state of an option changes. */
    var MatSelectionListChange = /** @class */ (function () {
        function MatSelectionListChange(
        /** Reference to the selection list that emitted the event. */
        source, 
        /**
         * Reference to the option that has been changed.
         * @deprecated Use `options` instead, because some events may change more than one option.
         * @breaking-change 12.0.0
         */
        option, 
        /** Reference to the options that have been changed. */
        options) {
            this.source = source;
            this.option = option;
            this.options = options;
        }
        return MatSelectionListChange;
    }());
    /**
     * Component for list-options of selection-list. Each list-option can automatically
     * generate a checkbox and can put current item into the selectionModel of selection-list
     * if the current item is selected.
     */
    var MatListOption = /** @class */ (function (_super) {
        __extends(MatListOption, _super);
        function MatListOption(_element, _changeDetector, 
        /** @docs-private */
        selectionList) {
            var _this = _super.call(this) || this;
            _this._element = _element;
            _this._changeDetector = _changeDetector;
            _this.selectionList = selectionList;
            _this._selected = false;
            _this._disabled = false;
            _this._hasFocus = false;
            /** Whether the label should appear before or after the checkbox. Defaults to 'after' */
            _this.checkboxPosition = 'after';
            /**
             * This is set to true after the first OnChanges cycle so we don't clear the value of `selected`
             * in the first cycle.
             */
            _this._inputsInitialized = false;
            return _this;
        }
        Object.defineProperty(MatListOption.prototype, "color", {
            /** Theme color of the list option. This sets the color of the checkbox. */
            get: function () { return this._color || this.selectionList.color; },
            set: function (newValue) { this._color = newValue; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatListOption.prototype, "value", {
            /** Value of the option */
            get: function () { return this._value; },
            set: function (newValue) {
                if (this.selected &&
                    !this.selectionList.compareWith(newValue, this.value) &&
                    this._inputsInitialized) {
                    this.selected = false;
                }
                this._value = newValue;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatListOption.prototype, "disabled", {
            /** Whether the option is disabled. */
            get: function () { return this._disabled || (this.selectionList && this.selectionList.disabled); },
            set: function (value) {
                var newValue = coercion.coerceBooleanProperty(value);
                if (newValue !== this._disabled) {
                    this._disabled = newValue;
                    this._changeDetector.markForCheck();
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatListOption.prototype, "selected", {
            /** Whether the option is selected. */
            get: function () { return this.selectionList.selectedOptions.isSelected(this); },
            set: function (value) {
                var isSelected = coercion.coerceBooleanProperty(value);
                if (isSelected !== this._selected) {
                    this._setSelected(isSelected);
                    if (isSelected || this.selectionList.multiple) {
                        this.selectionList._reportValueChange();
                    }
                }
            },
            enumerable: false,
            configurable: true
        });
        MatListOption.prototype.ngOnInit = function () {
            var _this = this;
            var list = this.selectionList;
            if (list._value && list._value.some(function (value) { return list.compareWith(value, _this._value); })) {
                this._setSelected(true);
            }
            var wasSelected = this._selected;
            // List options that are selected at initialization can't be reported properly to the form
            // control. This is because it takes some time until the selection-list knows about all
            // available options. Also it can happen that the ControlValueAccessor has an initial value
            // that should be used instead. Deferring the value change report to the next tick ensures
            // that the form control value is not being overwritten.
            Promise.resolve().then(function () {
                if (_this._selected || wasSelected) {
                    _this.selected = true;
                    _this._changeDetector.markForCheck();
                }
            });
            this._inputsInitialized = true;
        };
        MatListOption.prototype.ngAfterContentInit = function () {
            core.setLines(this._lines, this._element);
        };
        MatListOption.prototype.ngOnDestroy = function () {
            var _this = this;
            if (this.selected) {
                // We have to delay this until the next tick in order
                // to avoid changed after checked errors.
                Promise.resolve().then(function () {
                    _this.selected = false;
                });
            }
            var hadFocus = this._hasFocus;
            var newActiveItem = this.selectionList._removeOptionFromList(this);
            // Only move focus if this option was focused at the time it was destroyed.
            if (hadFocus && newActiveItem) {
                newActiveItem.focus();
            }
        };
        /** Toggles the selection state of the option. */
        MatListOption.prototype.toggle = function () {
            this.selected = !this.selected;
        };
        /** Allows for programmatic focusing of the option. */
        MatListOption.prototype.focus = function () {
            this._element.nativeElement.focus();
        };
        /**
         * Returns the list item's text label. Implemented as a part of the FocusKeyManager.
         * @docs-private
         */
        MatListOption.prototype.getLabel = function () {
            return this._text ? (this._text.nativeElement.textContent || '') : '';
        };
        /** Whether this list item should show a ripple effect when clicked. */
        MatListOption.prototype._isRippleDisabled = function () {
            return this.disabled || this.disableRipple || this.selectionList.disableRipple;
        };
        MatListOption.prototype._handleClick = function () {
            if (!this.disabled && (this.selectionList.multiple || !this.selected)) {
                this.toggle();
                // Emit a change event if the selected state of the option changed through user interaction.
                this.selectionList._emitChangeEvent([this]);
            }
        };
        MatListOption.prototype._handleFocus = function () {
            this.selectionList._setFocusedOption(this);
            this._hasFocus = true;
        };
        MatListOption.prototype._handleBlur = function () {
            this.selectionList._onTouched();
            this._hasFocus = false;
        };
        /** Retrieves the DOM element of the component host. */
        MatListOption.prototype._getHostElement = function () {
            return this._element.nativeElement;
        };
        /** Sets the selected state of the option. Returns whether the value has changed. */
        MatListOption.prototype._setSelected = function (selected) {
            if (selected === this._selected) {
                return false;
            }
            this._selected = selected;
            if (selected) {
                this.selectionList.selectedOptions.select(this);
            }
            else {
                this.selectionList.selectedOptions.deselect(this);
            }
            this._changeDetector.markForCheck();
            return true;
        };
        /**
         * Notifies Angular that the option needs to be checked in the next change detection run. Mainly
         * used to trigger an update of the list option if the disabled state of the selection list
         * changed.
         */
        MatListOption.prototype._markForCheck = function () {
            this._changeDetector.markForCheck();
        };
        return MatListOption;
    }(_MatListOptionMixinBase));
    MatListOption.decorators = [
        { type: core$1.Component, args: [{
                    selector: 'mat-list-option',
                    exportAs: 'matListOption',
                    inputs: ['disableRipple'],
                    host: {
                        'role': 'option',
                        'class': 'mat-list-item mat-list-option mat-focus-indicator',
                        '(focus)': '_handleFocus()',
                        '(blur)': '_handleBlur()',
                        '(click)': '_handleClick()',
                        '[class.mat-list-item-disabled]': 'disabled',
                        '[class.mat-list-item-with-avatar]': '_avatar || _icon',
                        // Manually set the "primary" or "warn" class if the color has been explicitly
                        // set to "primary" or "warn". The pseudo checkbox picks up these classes for
                        // its theme.
                        '[class.mat-primary]': 'color === "primary"',
                        // Even though accent is the default, we need to set this class anyway, because the  list might
                        // be placed inside a parent that has one of the other colors with a higher specificity.
                        '[class.mat-accent]': 'color !== "primary" && color !== "warn"',
                        '[class.mat-warn]': 'color === "warn"',
                        '[class.mat-list-single-selected-option]': 'selected && !selectionList.multiple',
                        '[attr.aria-selected]': 'selected',
                        '[attr.aria-disabled]': 'disabled',
                        '[attr.tabindex]': '-1',
                    },
                    template: "<div class=\"mat-list-item-content\"\n  [class.mat-list-item-content-reverse]=\"checkboxPosition == 'after'\">\n\n  <div mat-ripple\n    class=\"mat-list-item-ripple\"\n    [matRippleTrigger]=\"_getHostElement()\"\n    [matRippleDisabled]=\"_isRippleDisabled()\"></div>\n\n  <mat-pseudo-checkbox\n    *ngIf=\"selectionList.multiple\"\n    [state]=\"selected ? 'checked' : 'unchecked'\"\n    [disabled]=\"disabled\"></mat-pseudo-checkbox>\n\n  <div class=\"mat-list-text\" #text><ng-content></ng-content></div>\n\n  <ng-content select=\"[mat-list-avatar], [mat-list-icon], [matListAvatar], [matListIcon]\">\n  </ng-content>\n\n</div>\n",
                    encapsulation: core$1.ViewEncapsulation.None,
                    changeDetection: core$1.ChangeDetectionStrategy.OnPush
                },] }
    ];
    MatListOption.ctorParameters = function () { return [
        { type: core$1.ElementRef },
        { type: core$1.ChangeDetectorRef },
        { type: MatSelectionList, decorators: [{ type: core$1.Inject, args: [core$1.forwardRef(function () { return MatSelectionList; }),] }] }
    ]; };
    MatListOption.propDecorators = {
        _avatar: [{ type: core$1.ContentChild, args: [MatListAvatarCssMatStyler,] }],
        _icon: [{ type: core$1.ContentChild, args: [MatListIconCssMatStyler,] }],
        _lines: [{ type: core$1.ContentChildren, args: [core.MatLine, { descendants: true },] }],
        _text: [{ type: core$1.ViewChild, args: ['text',] }],
        checkboxPosition: [{ type: core$1.Input }],
        color: [{ type: core$1.Input }],
        value: [{ type: core$1.Input }],
        disabled: [{ type: core$1.Input }],
        selected: [{ type: core$1.Input }]
    };
    /**
     * Material Design list component where each item is a selectable option. Behaves as a listbox.
     */
    var MatSelectionList = /** @class */ (function (_super) {
        __extends(MatSelectionList, _super);
        function MatSelectionList(_element, 
        // @breaking-change 11.0.0 Remove `tabIndex` parameter.
        tabIndex, _changeDetector, 
        // @breaking-change 11.0.0 `_focusMonitor` parameter to become required.
        _focusMonitor) {
            var _this = _super.call(this) || this;
            _this._element = _element;
            _this._changeDetector = _changeDetector;
            _this._focusMonitor = _focusMonitor;
            _this._multiple = true;
            _this._contentInitialized = false;
            /** Emits a change event whenever the selected state of an option changes. */
            _this.selectionChange = new core$1.EventEmitter();
            /**
             * Tabindex of the selection list.
             * @breaking-change 11.0.0 Remove `tabIndex` input.
             */
            _this.tabIndex = 0;
            /** Theme color of the selection list. This sets the checkbox color for all list options. */
            _this.color = 'accent';
            /**
             * Function used for comparing an option against the selected value when determining which
             * options should appear as selected. The first argument is the value of an options. The second
             * one is a value from the selected value. A boolean must be returned.
             */
            _this.compareWith = function (a1, a2) { return a1 === a2; };
            _this._disabled = false;
            /** The currently selected options. */
            _this.selectedOptions = new collections.SelectionModel(_this._multiple);
            /** The tabindex of the selection list. */
            _this._tabIndex = -1;
            /** View to model callback that should be called whenever the selected options change. */
            _this._onChange = function (_) { };
            /** Emits when the list has been destroyed. */
            _this._destroyed = new rxjs.Subject();
            /** View to model callback that should be called if the list or its options lost focus. */
            _this._onTouched = function () { };
            return _this;
        }
        Object.defineProperty(MatSelectionList.prototype, "disabled", {
            /** Whether the selection list is disabled. */
            get: function () { return this._disabled; },
            set: function (value) {
                this._disabled = coercion.coerceBooleanProperty(value);
                // The `MatSelectionList` and `MatListOption` are using the `OnPush` change detection
                // strategy. Therefore the options will not check for any changes if the `MatSelectionList`
                // changed its state. Since we know that a change to `disabled` property of the list affects
                // the state of the options, we manually mark each option for check.
                this._markOptionsForCheck();
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatSelectionList.prototype, "multiple", {
            /** Whether selection is limited to one or multiple items (default multiple). */
            get: function () { return this._multiple; },
            set: function (value) {
                var newValue = coercion.coerceBooleanProperty(value);
                if (newValue !== this._multiple) {
                    if (this._contentInitialized && (typeof ngDevMode === 'undefined' || ngDevMode)) {
                        throw new Error('Cannot change `multiple` mode of mat-selection-list after initialization.');
                    }
                    this._multiple = newValue;
                    this.selectedOptions = new collections.SelectionModel(this._multiple, this.selectedOptions.selected);
                }
            },
            enumerable: false,
            configurable: true
        });
        MatSelectionList.prototype.ngAfterContentInit = function () {
            var _this = this;
            var _a;
            this._contentInitialized = true;
            this._keyManager = new a11y.FocusKeyManager(this.options)
                .withWrap()
                .withTypeAhead()
                .withHomeAndEnd()
                // Allow disabled items to be focusable. For accessibility reasons, there must be a way for
                // screenreader users, that allows reading the different options of the list.
                .skipPredicate(function () { return false; })
                .withAllowedModifierKeys(['shiftKey']);
            if (this._value) {
                this._setOptionsFromValues(this._value);
            }
            // If the user attempts to tab out of the selection list, allow focus to escape.
            this._keyManager.tabOut.pipe(operators.takeUntil(this._destroyed)).subscribe(function () {
                _this._allowFocusEscape();
            });
            // When the number of options change, update the tabindex of the selection list.
            this.options.changes.pipe(operators.startWith(null), operators.takeUntil(this._destroyed)).subscribe(function () {
                _this._updateTabIndex();
            });
            // Sync external changes to the model back to the options.
            this.selectedOptions.changed.pipe(operators.takeUntil(this._destroyed)).subscribe(function (event) {
                var e_1, _b, e_2, _c;
                if (event.added) {
                    try {
                        for (var _d = __values(event.added), _e = _d.next(); !_e.done; _e = _d.next()) {
                            var item = _e.value;
                            item.selected = true;
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (_e && !_e.done && (_b = _d.return)) _b.call(_d);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                }
                if (event.removed) {
                    try {
                        for (var _f = __values(event.removed), _g = _f.next(); !_g.done; _g = _f.next()) {
                            var item = _g.value;
                            item.selected = false;
                        }
                    }
                    catch (e_2_1) { e_2 = { error: e_2_1 }; }
                    finally {
                        try {
                            if (_g && !_g.done && (_c = _f.return)) _c.call(_f);
                        }
                        finally { if (e_2) throw e_2.error; }
                    }
                }
            });
            // @breaking-change 11.0.0 Remove null assertion once _focusMonitor is required.
            (_a = this._focusMonitor) === null || _a === void 0 ? void 0 : _a.monitor(this._element).pipe(operators.takeUntil(this._destroyed)).subscribe(function (origin) {
                if (origin === 'keyboard' || origin === 'program') {
                    var activeIndex = _this._keyManager.activeItemIndex;
                    if (!activeIndex || activeIndex === -1) {
                        // If there is no active index, set focus to the first option.
                        _this._keyManager.setFirstItemActive();
                    }
                    else {
                        // Otherwise, set focus to the active option.
                        _this._keyManager.setActiveItem(activeIndex);
                    }
                }
            });
        };
        MatSelectionList.prototype.ngOnChanges = function (changes) {
            var disableRippleChanges = changes['disableRipple'];
            var colorChanges = changes['color'];
            if ((disableRippleChanges && !disableRippleChanges.firstChange) ||
                (colorChanges && !colorChanges.firstChange)) {
                this._markOptionsForCheck();
            }
        };
        MatSelectionList.prototype.ngOnDestroy = function () {
            var _a;
            // @breaking-change 11.0.0 Remove null assertion once _focusMonitor is required.
            (_a = this._focusMonitor) === null || _a === void 0 ? void 0 : _a.stopMonitoring(this._element);
            this._destroyed.next();
            this._destroyed.complete();
            this._isDestroyed = true;
        };
        /** Focuses the selection list. */
        MatSelectionList.prototype.focus = function (options) {
            this._element.nativeElement.focus(options);
        };
        /** Selects all of the options. Returns the options that changed as a result. */
        MatSelectionList.prototype.selectAll = function () {
            return this._setAllOptionsSelected(true);
        };
        /** Deselects all of the options. Returns the options that changed as a result. */
        MatSelectionList.prototype.deselectAll = function () {
            return this._setAllOptionsSelected(false);
        };
        /** Sets the focused option of the selection-list. */
        MatSelectionList.prototype._setFocusedOption = function (option) {
            this._keyManager.updateActiveItem(option);
        };
        /**
         * Removes an option from the selection list and updates the active item.
         * @returns Currently-active item.
         */
        MatSelectionList.prototype._removeOptionFromList = function (option) {
            var optionIndex = this._getOptionIndex(option);
            if (optionIndex > -1 && this._keyManager.activeItemIndex === optionIndex) {
                // Check whether the option is the last item
                if (optionIndex > 0) {
                    this._keyManager.updateActiveItem(optionIndex - 1);
                }
                else if (optionIndex === 0 && this.options.length > 1) {
                    this._keyManager.updateActiveItem(Math.min(optionIndex + 1, this.options.length - 1));
                }
            }
            return this._keyManager.activeItem;
        };
        /** Passes relevant key presses to our key manager. */
        MatSelectionList.prototype._keydown = function (event) {
            var keyCode = event.keyCode;
            var manager = this._keyManager;
            var previousFocusIndex = manager.activeItemIndex;
            var hasModifier = keycodes.hasModifierKey(event);
            switch (keyCode) {
                case keycodes.SPACE:
                case keycodes.ENTER:
                    if (!hasModifier && !manager.isTyping()) {
                        this._toggleFocusedOption();
                        // Always prevent space from scrolling the page since the list has focus
                        event.preventDefault();
                    }
                    break;
                default:
                    // The "A" key gets special treatment, because it's used for the "select all" functionality.
                    if (keyCode === keycodes.A && this.multiple && keycodes.hasModifierKey(event, 'ctrlKey') &&
                        !manager.isTyping()) {
                        var shouldSelect = this.options.some(function (option) { return !option.disabled && !option.selected; });
                        this._setAllOptionsSelected(shouldSelect, true, true);
                        event.preventDefault();
                    }
                    else {
                        manager.onKeydown(event);
                    }
            }
            if (this.multiple && (keyCode === keycodes.UP_ARROW || keyCode === keycodes.DOWN_ARROW) && event.shiftKey &&
                manager.activeItemIndex !== previousFocusIndex) {
                this._toggleFocusedOption();
            }
        };
        /** Reports a value change to the ControlValueAccessor */
        MatSelectionList.prototype._reportValueChange = function () {
            // Stop reporting value changes after the list has been destroyed. This avoids
            // cases where the list might wrongly reset its value once it is removed, but
            // the form control is still live.
            if (this.options && !this._isDestroyed) {
                var value = this._getSelectedOptionValues();
                this._onChange(value);
                this._value = value;
            }
        };
        /** Emits a change event if the selected state of an option changed. */
        MatSelectionList.prototype._emitChangeEvent = function (options) {
            this.selectionChange.emit(new MatSelectionListChange(this, options[0], options));
        };
        /** Implemented as part of ControlValueAccessor. */
        MatSelectionList.prototype.writeValue = function (values) {
            this._value = values;
            if (this.options) {
                this._setOptionsFromValues(values || []);
            }
        };
        /** Implemented as a part of ControlValueAccessor. */
        MatSelectionList.prototype.setDisabledState = function (isDisabled) {
            this.disabled = isDisabled;
        };
        /** Implemented as part of ControlValueAccessor. */
        MatSelectionList.prototype.registerOnChange = function (fn) {
            this._onChange = fn;
        };
        /** Implemented as part of ControlValueAccessor. */
        MatSelectionList.prototype.registerOnTouched = function (fn) {
            this._onTouched = fn;
        };
        /** Sets the selected options based on the specified values. */
        MatSelectionList.prototype._setOptionsFromValues = function (values) {
            var _this = this;
            this.options.forEach(function (option) { return option._setSelected(false); });
            values.forEach(function (value) {
                var correspondingOption = _this.options.find(function (option) {
                    // Skip options that are already in the model. This allows us to handle cases
                    // where the same primitive value is selected multiple times.
                    return option.selected ? false : _this.compareWith(option.value, value);
                });
                if (correspondingOption) {
                    correspondingOption._setSelected(true);
                }
            });
        };
        /** Returns the values of the selected options. */
        MatSelectionList.prototype._getSelectedOptionValues = function () {
            return this.options.filter(function (option) { return option.selected; }).map(function (option) { return option.value; });
        };
        /** Toggles the state of the currently focused option if enabled. */
        MatSelectionList.prototype._toggleFocusedOption = function () {
            var focusedIndex = this._keyManager.activeItemIndex;
            if (focusedIndex != null && this._isValidIndex(focusedIndex)) {
                var focusedOption = this.options.toArray()[focusedIndex];
                if (focusedOption && !focusedOption.disabled && (this._multiple || !focusedOption.selected)) {
                    focusedOption.toggle();
                    // Emit a change event because the focused option changed its state through user
                    // interaction.
                    this._emitChangeEvent([focusedOption]);
                }
            }
        };
        /**
         * Sets the selected state on all of the options
         * and emits an event if anything changed.
         */
        MatSelectionList.prototype._setAllOptionsSelected = function (isSelected, skipDisabled, isUserInput) {
            // Keep track of whether anything changed, because we only want to
            // emit the changed event when something actually changed.
            var changedOptions = [];
            this.options.forEach(function (option) {
                if ((!skipDisabled || !option.disabled) && option._setSelected(isSelected)) {
                    changedOptions.push(option);
                }
            });
            if (changedOptions.length) {
                this._reportValueChange();
                if (isUserInput) {
                    this._emitChangeEvent(changedOptions);
                }
            }
            return changedOptions;
        };
        /**
         * Utility to ensure all indexes are valid.
         * @param index The index to be checked.
         * @returns True if the index is valid for our list of options.
         */
        MatSelectionList.prototype._isValidIndex = function (index) {
            return index >= 0 && index < this.options.length;
        };
        /** Returns the index of the specified list option. */
        MatSelectionList.prototype._getOptionIndex = function (option) {
            return this.options.toArray().indexOf(option);
        };
        /** Marks all the options to be checked in the next change detection run. */
        MatSelectionList.prototype._markOptionsForCheck = function () {
            if (this.options) {
                this.options.forEach(function (option) { return option._markForCheck(); });
            }
        };
        /**
         * Removes the tabindex from the selection list and resets it back afterwards, allowing the user
         * to tab out of it. This prevents the list from capturing focus and redirecting it back within
         * the list, creating a focus trap if it user tries to tab away.
         */
        MatSelectionList.prototype._allowFocusEscape = function () {
            var _this = this;
            this._tabIndex = -1;
            setTimeout(function () {
                _this._tabIndex = 0;
                _this._changeDetector.markForCheck();
            });
        };
        /** Updates the tabindex based upon if the selection list is empty. */
        MatSelectionList.prototype._updateTabIndex = function () {
            this._tabIndex = (this.options.length === 0) ? -1 : 0;
        };
        return MatSelectionList;
    }(_MatSelectionListMixinBase));
    MatSelectionList.decorators = [
        { type: core$1.Component, args: [{
                    selector: 'mat-selection-list',
                    exportAs: 'matSelectionList',
                    inputs: ['disableRipple'],
                    host: {
                        'role': 'listbox',
                        'class': 'mat-selection-list mat-list-base',
                        '(keydown)': '_keydown($event)',
                        '[attr.aria-multiselectable]': 'multiple',
                        '[attr.aria-disabled]': 'disabled.toString()',
                        '[attr.tabindex]': '_tabIndex',
                    },
                    template: '<ng-content></ng-content>',
                    encapsulation: core$1.ViewEncapsulation.None,
                    providers: [MAT_SELECTION_LIST_VALUE_ACCESSOR],
                    changeDetection: core$1.ChangeDetectionStrategy.OnPush,
                    styles: [".mat-subheader{display:flex;box-sizing:border-box;padding:16px;align-items:center}.mat-list-base .mat-subheader{margin:0}.mat-list-base{padding-top:8px;display:block;-webkit-tap-highlight-color:transparent}.mat-list-base .mat-subheader{height:48px;line-height:16px}.mat-list-base .mat-subheader:first-child{margin-top:-8px}.mat-list-base .mat-list-item,.mat-list-base .mat-list-option{display:block;height:48px;-webkit-tap-highlight-color:transparent;width:100%;padding:0}.mat-list-base .mat-list-item .mat-list-item-content,.mat-list-base .mat-list-option .mat-list-item-content{display:flex;flex-direction:row;align-items:center;box-sizing:border-box;padding:0 16px;position:relative;height:inherit}.mat-list-base .mat-list-item .mat-list-item-content-reverse,.mat-list-base .mat-list-option .mat-list-item-content-reverse{display:flex;align-items:center;padding:0 16px;flex-direction:row-reverse;justify-content:space-around}.mat-list-base .mat-list-item .mat-list-item-ripple,.mat-list-base .mat-list-option .mat-list-item-ripple{top:0;left:0;right:0;bottom:0;position:absolute;pointer-events:none}.mat-list-base .mat-list-item.mat-list-item-with-avatar,.mat-list-base .mat-list-option.mat-list-item-with-avatar{height:56px}.mat-list-base .mat-list-item.mat-2-line,.mat-list-base .mat-list-option.mat-2-line{height:72px}.mat-list-base .mat-list-item.mat-3-line,.mat-list-base .mat-list-option.mat-3-line{height:88px}.mat-list-base .mat-list-item.mat-multi-line,.mat-list-base .mat-list-option.mat-multi-line{height:auto}.mat-list-base .mat-list-item.mat-multi-line .mat-list-item-content,.mat-list-base .mat-list-option.mat-multi-line .mat-list-item-content{padding-top:16px;padding-bottom:16px}.mat-list-base .mat-list-item .mat-list-text,.mat-list-base .mat-list-option .mat-list-text{display:flex;flex-direction:column;flex:auto;box-sizing:border-box;overflow:hidden;padding:0}.mat-list-base .mat-list-item .mat-list-text>*,.mat-list-base .mat-list-option .mat-list-text>*{margin:0;padding:0;font-weight:normal;font-size:inherit}.mat-list-base .mat-list-item .mat-list-text:empty,.mat-list-base .mat-list-option .mat-list-text:empty{display:none}.mat-list-base .mat-list-item.mat-list-item-with-avatar .mat-list-item-content .mat-list-text,.mat-list-base .mat-list-item.mat-list-option .mat-list-item-content .mat-list-text,.mat-list-base .mat-list-option.mat-list-item-with-avatar .mat-list-item-content .mat-list-text,.mat-list-base .mat-list-option.mat-list-option .mat-list-item-content .mat-list-text{padding-right:0;padding-left:16px}[dir=rtl] .mat-list-base .mat-list-item.mat-list-item-with-avatar .mat-list-item-content .mat-list-text,[dir=rtl] .mat-list-base .mat-list-item.mat-list-option .mat-list-item-content .mat-list-text,[dir=rtl] .mat-list-base .mat-list-option.mat-list-item-with-avatar .mat-list-item-content .mat-list-text,[dir=rtl] .mat-list-base .mat-list-option.mat-list-option .mat-list-item-content .mat-list-text{padding-right:16px;padding-left:0}.mat-list-base .mat-list-item.mat-list-item-with-avatar .mat-list-item-content-reverse .mat-list-text,.mat-list-base .mat-list-item.mat-list-option .mat-list-item-content-reverse .mat-list-text,.mat-list-base .mat-list-option.mat-list-item-with-avatar .mat-list-item-content-reverse .mat-list-text,.mat-list-base .mat-list-option.mat-list-option .mat-list-item-content-reverse .mat-list-text{padding-left:0;padding-right:16px}[dir=rtl] .mat-list-base .mat-list-item.mat-list-item-with-avatar .mat-list-item-content-reverse .mat-list-text,[dir=rtl] .mat-list-base .mat-list-item.mat-list-option .mat-list-item-content-reverse .mat-list-text,[dir=rtl] .mat-list-base .mat-list-option.mat-list-item-with-avatar .mat-list-item-content-reverse .mat-list-text,[dir=rtl] .mat-list-base .mat-list-option.mat-list-option .mat-list-item-content-reverse .mat-list-text{padding-right:0;padding-left:16px}.mat-list-base .mat-list-item.mat-list-item-with-avatar.mat-list-option .mat-list-item-content-reverse .mat-list-text,.mat-list-base .mat-list-item.mat-list-item-with-avatar.mat-list-option .mat-list-item-content .mat-list-text,.mat-list-base .mat-list-option.mat-list-item-with-avatar.mat-list-option .mat-list-item-content-reverse .mat-list-text,.mat-list-base .mat-list-option.mat-list-item-with-avatar.mat-list-option .mat-list-item-content .mat-list-text{padding-right:16px;padding-left:16px}.mat-list-base .mat-list-item .mat-list-avatar,.mat-list-base .mat-list-option .mat-list-avatar{flex-shrink:0;width:40px;height:40px;border-radius:50%;object-fit:cover}.mat-list-base .mat-list-item .mat-list-avatar~.mat-divider-inset,.mat-list-base .mat-list-option .mat-list-avatar~.mat-divider-inset{margin-left:72px;width:calc(100% - 72px)}[dir=rtl] .mat-list-base .mat-list-item .mat-list-avatar~.mat-divider-inset,[dir=rtl] .mat-list-base .mat-list-option .mat-list-avatar~.mat-divider-inset{margin-left:auto;margin-right:72px}.mat-list-base .mat-list-item .mat-list-icon,.mat-list-base .mat-list-option .mat-list-icon{flex-shrink:0;width:24px;height:24px;font-size:24px;box-sizing:content-box;border-radius:50%;padding:4px}.mat-list-base .mat-list-item .mat-list-icon~.mat-divider-inset,.mat-list-base .mat-list-option .mat-list-icon~.mat-divider-inset{margin-left:64px;width:calc(100% - 64px)}[dir=rtl] .mat-list-base .mat-list-item .mat-list-icon~.mat-divider-inset,[dir=rtl] .mat-list-base .mat-list-option .mat-list-icon~.mat-divider-inset{margin-left:auto;margin-right:64px}.mat-list-base .mat-list-item .mat-divider,.mat-list-base .mat-list-option .mat-divider{position:absolute;bottom:0;left:0;width:100%;margin:0}[dir=rtl] .mat-list-base .mat-list-item .mat-divider,[dir=rtl] .mat-list-base .mat-list-option .mat-divider{margin-left:auto;margin-right:0}.mat-list-base .mat-list-item .mat-divider.mat-divider-inset,.mat-list-base .mat-list-option .mat-divider.mat-divider-inset{position:absolute}.mat-list-base[dense]{padding-top:4px;display:block}.mat-list-base[dense] .mat-subheader{height:40px;line-height:8px}.mat-list-base[dense] .mat-subheader:first-child{margin-top:-4px}.mat-list-base[dense] .mat-list-item,.mat-list-base[dense] .mat-list-option{display:block;height:40px;-webkit-tap-highlight-color:transparent;width:100%;padding:0}.mat-list-base[dense] .mat-list-item .mat-list-item-content,.mat-list-base[dense] .mat-list-option .mat-list-item-content{display:flex;flex-direction:row;align-items:center;box-sizing:border-box;padding:0 16px;position:relative;height:inherit}.mat-list-base[dense] .mat-list-item .mat-list-item-content-reverse,.mat-list-base[dense] .mat-list-option .mat-list-item-content-reverse{display:flex;align-items:center;padding:0 16px;flex-direction:row-reverse;justify-content:space-around}.mat-list-base[dense] .mat-list-item .mat-list-item-ripple,.mat-list-base[dense] .mat-list-option .mat-list-item-ripple{top:0;left:0;right:0;bottom:0;position:absolute;pointer-events:none}.mat-list-base[dense] .mat-list-item.mat-list-item-with-avatar,.mat-list-base[dense] .mat-list-option.mat-list-item-with-avatar{height:48px}.mat-list-base[dense] .mat-list-item.mat-2-line,.mat-list-base[dense] .mat-list-option.mat-2-line{height:60px}.mat-list-base[dense] .mat-list-item.mat-3-line,.mat-list-base[dense] .mat-list-option.mat-3-line{height:76px}.mat-list-base[dense] .mat-list-item.mat-multi-line,.mat-list-base[dense] .mat-list-option.mat-multi-line{height:auto}.mat-list-base[dense] .mat-list-item.mat-multi-line .mat-list-item-content,.mat-list-base[dense] .mat-list-option.mat-multi-line .mat-list-item-content{padding-top:16px;padding-bottom:16px}.mat-list-base[dense] .mat-list-item .mat-list-text,.mat-list-base[dense] .mat-list-option .mat-list-text{display:flex;flex-direction:column;flex:auto;box-sizing:border-box;overflow:hidden;padding:0}.mat-list-base[dense] .mat-list-item .mat-list-text>*,.mat-list-base[dense] .mat-list-option .mat-list-text>*{margin:0;padding:0;font-weight:normal;font-size:inherit}.mat-list-base[dense] .mat-list-item .mat-list-text:empty,.mat-list-base[dense] .mat-list-option .mat-list-text:empty{display:none}.mat-list-base[dense] .mat-list-item.mat-list-item-with-avatar .mat-list-item-content .mat-list-text,.mat-list-base[dense] .mat-list-item.mat-list-option .mat-list-item-content .mat-list-text,.mat-list-base[dense] .mat-list-option.mat-list-item-with-avatar .mat-list-item-content .mat-list-text,.mat-list-base[dense] .mat-list-option.mat-list-option .mat-list-item-content .mat-list-text{padding-right:0;padding-left:16px}[dir=rtl] .mat-list-base[dense] .mat-list-item.mat-list-item-with-avatar .mat-list-item-content .mat-list-text,[dir=rtl] .mat-list-base[dense] .mat-list-item.mat-list-option .mat-list-item-content .mat-list-text,[dir=rtl] .mat-list-base[dense] .mat-list-option.mat-list-item-with-avatar .mat-list-item-content .mat-list-text,[dir=rtl] .mat-list-base[dense] .mat-list-option.mat-list-option .mat-list-item-content .mat-list-text{padding-right:16px;padding-left:0}.mat-list-base[dense] .mat-list-item.mat-list-item-with-avatar .mat-list-item-content-reverse .mat-list-text,.mat-list-base[dense] .mat-list-item.mat-list-option .mat-list-item-content-reverse .mat-list-text,.mat-list-base[dense] .mat-list-option.mat-list-item-with-avatar .mat-list-item-content-reverse .mat-list-text,.mat-list-base[dense] .mat-list-option.mat-list-option .mat-list-item-content-reverse .mat-list-text{padding-left:0;padding-right:16px}[dir=rtl] .mat-list-base[dense] .mat-list-item.mat-list-item-with-avatar .mat-list-item-content-reverse .mat-list-text,[dir=rtl] .mat-list-base[dense] .mat-list-item.mat-list-option .mat-list-item-content-reverse .mat-list-text,[dir=rtl] .mat-list-base[dense] .mat-list-option.mat-list-item-with-avatar .mat-list-item-content-reverse .mat-list-text,[dir=rtl] .mat-list-base[dense] .mat-list-option.mat-list-option .mat-list-item-content-reverse .mat-list-text{padding-right:0;padding-left:16px}.mat-list-base[dense] .mat-list-item.mat-list-item-with-avatar.mat-list-option .mat-list-item-content-reverse .mat-list-text,.mat-list-base[dense] .mat-list-item.mat-list-item-with-avatar.mat-list-option .mat-list-item-content .mat-list-text,.mat-list-base[dense] .mat-list-option.mat-list-item-with-avatar.mat-list-option .mat-list-item-content-reverse .mat-list-text,.mat-list-base[dense] .mat-list-option.mat-list-item-with-avatar.mat-list-option .mat-list-item-content .mat-list-text{padding-right:16px;padding-left:16px}.mat-list-base[dense] .mat-list-item .mat-list-avatar,.mat-list-base[dense] .mat-list-option .mat-list-avatar{flex-shrink:0;width:36px;height:36px;border-radius:50%;object-fit:cover}.mat-list-base[dense] .mat-list-item .mat-list-avatar~.mat-divider-inset,.mat-list-base[dense] .mat-list-option .mat-list-avatar~.mat-divider-inset{margin-left:68px;width:calc(100% - 68px)}[dir=rtl] .mat-list-base[dense] .mat-list-item .mat-list-avatar~.mat-divider-inset,[dir=rtl] .mat-list-base[dense] .mat-list-option .mat-list-avatar~.mat-divider-inset{margin-left:auto;margin-right:68px}.mat-list-base[dense] .mat-list-item .mat-list-icon,.mat-list-base[dense] .mat-list-option .mat-list-icon{flex-shrink:0;width:20px;height:20px;font-size:20px;box-sizing:content-box;border-radius:50%;padding:4px}.mat-list-base[dense] .mat-list-item .mat-list-icon~.mat-divider-inset,.mat-list-base[dense] .mat-list-option .mat-list-icon~.mat-divider-inset{margin-left:60px;width:calc(100% - 60px)}[dir=rtl] .mat-list-base[dense] .mat-list-item .mat-list-icon~.mat-divider-inset,[dir=rtl] .mat-list-base[dense] .mat-list-option .mat-list-icon~.mat-divider-inset{margin-left:auto;margin-right:60px}.mat-list-base[dense] .mat-list-item .mat-divider,.mat-list-base[dense] .mat-list-option .mat-divider{position:absolute;bottom:0;left:0;width:100%;margin:0}[dir=rtl] .mat-list-base[dense] .mat-list-item .mat-divider,[dir=rtl] .mat-list-base[dense] .mat-list-option .mat-divider{margin-left:auto;margin-right:0}.mat-list-base[dense] .mat-list-item .mat-divider.mat-divider-inset,.mat-list-base[dense] .mat-list-option .mat-divider.mat-divider-inset{position:absolute}.mat-nav-list a{text-decoration:none;color:inherit}.mat-nav-list .mat-list-item{cursor:pointer;outline:none}mat-action-list button{background:none;color:inherit;border:none;font:inherit;outline:inherit;-webkit-tap-highlight-color:transparent;text-align:left}[dir=rtl] mat-action-list button{text-align:right}mat-action-list button::-moz-focus-inner{border:0}mat-action-list .mat-list-item{cursor:pointer;outline:inherit}.mat-list-option:not(.mat-list-item-disabled){cursor:pointer;outline:none}.mat-list-item-disabled{pointer-events:none}.cdk-high-contrast-active .mat-list-item-disabled{opacity:.5}.cdk-high-contrast-active :host .mat-list-item-disabled{opacity:.5}.cdk-high-contrast-active .mat-selection-list:focus{outline-style:dotted}.cdk-high-contrast-active .mat-list-option:hover,.cdk-high-contrast-active .mat-list-option:focus,.cdk-high-contrast-active .mat-nav-list .mat-list-item:hover,.cdk-high-contrast-active .mat-nav-list .mat-list-item:focus,.cdk-high-contrast-active mat-action-list .mat-list-item:hover,.cdk-high-contrast-active mat-action-list .mat-list-item:focus{outline:dotted 1px}.cdk-high-contrast-active .mat-list-single-selected-option::after{content:\"\";position:absolute;top:50%;right:16px;transform:translateY(-50%);width:10px;height:0;border-bottom:solid 10px;border-radius:10px}.cdk-high-contrast-active [dir=rtl] .mat-list-single-selected-option::after{right:auto;left:16px}@media(hover: none){.mat-list-option:not(.mat-list-single-selected-option):not(.mat-list-item-disabled):hover,.mat-nav-list .mat-list-item:not(.mat-list-item-disabled):hover,.mat-action-list .mat-list-item:not(.mat-list-item-disabled):hover{background:none}}\n"]
                },] }
    ];
    MatSelectionList.ctorParameters = function () { return [
        { type: core$1.ElementRef },
        { type: String, decorators: [{ type: core$1.Attribute, args: ['tabindex',] }] },
        { type: core$1.ChangeDetectorRef },
        { type: a11y.FocusMonitor }
    ]; };
    MatSelectionList.propDecorators = {
        options: [{ type: core$1.ContentChildren, args: [MatListOption, { descendants: true },] }],
        selectionChange: [{ type: core$1.Output }],
        tabIndex: [{ type: core$1.Input }],
        color: [{ type: core$1.Input }],
        compareWith: [{ type: core$1.Input }],
        disabled: [{ type: core$1.Input }],
        multiple: [{ type: core$1.Input }]
    };

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var MatListModule = /** @class */ (function () {
        function MatListModule() {
        }
        return MatListModule;
    }());
    MatListModule.decorators = [
        { type: core$1.NgModule, args: [{
                    imports: [core.MatLineModule, core.MatRippleModule, core.MatCommonModule, core.MatPseudoCheckboxModule, common.CommonModule],
                    exports: [
                        MatList,
                        MatNavList,
                        MatListItem,
                        MatListAvatarCssMatStyler,
                        core.MatLineModule,
                        core.MatCommonModule,
                        MatListIconCssMatStyler,
                        MatListSubheaderCssMatStyler,
                        core.MatPseudoCheckboxModule,
                        MatSelectionList,
                        MatListOption,
                        divider.MatDividerModule
                    ],
                    declarations: [
                        MatList,
                        MatNavList,
                        MatListItem,
                        MatListAvatarCssMatStyler,
                        MatListIconCssMatStyler,
                        MatListSubheaderCssMatStyler,
                        MatSelectionList,
                        MatListOption
                    ],
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

    exports.MAT_LIST = MAT_LIST;
    exports.MAT_NAV_LIST = MAT_NAV_LIST;
    exports.MAT_SELECTION_LIST_VALUE_ACCESSOR = MAT_SELECTION_LIST_VALUE_ACCESSOR;
    exports.MatList = MatList;
    exports.MatListAvatarCssMatStyler = MatListAvatarCssMatStyler;
    exports.MatListIconCssMatStyler = MatListIconCssMatStyler;
    exports.MatListItem = MatListItem;
    exports.MatListModule = MatListModule;
    exports.MatListOption = MatListOption;
    exports.MatListSubheaderCssMatStyler = MatListSubheaderCssMatStyler;
    exports.MatNavList = MatNavList;
    exports.MatSelectionList = MatSelectionList;
    exports.MatSelectionListChange = MatSelectionListChange;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=material-list.umd.js.map
