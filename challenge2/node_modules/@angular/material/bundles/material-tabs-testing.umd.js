(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/cdk/testing')) :
    typeof define === 'function' && define.amd ? define('@angular/material/tabs/testing', ['exports', '@angular/cdk/testing'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.ng = global.ng || {}, global.ng.material = global.ng.material || {}, global.ng.material.tabs = global.ng.material.tabs || {}, global.ng.material.tabs.testing = {}), global.ng.cdk.testing));
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

    /** Harness for interacting with a standard Angular Material tab-label in tests. */
    var MatTabHarness = /** @class */ (function (_super) {
        __extends(MatTabHarness, _super);
        function MatTabHarness() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
         * Gets a `HarnessPredicate` that can be used to search for a `MatTabHarness` that meets
         * certain criteria.
         * @param options Options for filtering which tab instances are considered a match.
         * @return a `HarnessPredicate` configured with the given options.
         */
        MatTabHarness.with = function (options) {
            if (options === void 0) { options = {}; }
            return new testing.HarnessPredicate(MatTabHarness, options)
                .addOption('label', options.label, function (harness, label) { return testing.HarnessPredicate.stringMatches(harness.getLabel(), label); });
        };
        /** Gets the label of the tab. */
        MatTabHarness.prototype.getLabel = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1: return [2 /*return*/, (_a.sent()).text()];
                    }
                });
            });
        };
        /** Gets the aria-label of the tab. */
        MatTabHarness.prototype.getAriaLabel = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1: return [2 /*return*/, (_a.sent()).getAttribute('aria-label')];
                    }
                });
            });
        };
        /** Gets the value of the "aria-labelledby" attribute. */
        MatTabHarness.prototype.getAriaLabelledby = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1: return [2 /*return*/, (_a.sent()).getAttribute('aria-labelledby')];
                    }
                });
            });
        };
        /** Whether the tab is selected. */
        MatTabHarness.prototype.isSelected = function () {
            return __awaiter(this, void 0, void 0, function () {
                var hostEl;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1:
                            hostEl = _a.sent();
                            return [4 /*yield*/, hostEl.getAttribute('aria-selected')];
                        case 2: return [2 /*return*/, (_a.sent()) === 'true'];
                    }
                });
            });
        };
        /** Whether the tab is disabled. */
        MatTabHarness.prototype.isDisabled = function () {
            return __awaiter(this, void 0, void 0, function () {
                var hostEl;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1:
                            hostEl = _a.sent();
                            return [4 /*yield*/, hostEl.getAttribute('aria-disabled')];
                        case 2: return [2 /*return*/, (_a.sent()) === 'true'];
                    }
                });
            });
        };
        /** Selects the given tab by clicking on the label. Tab cannot be selected if disabled. */
        MatTabHarness.prototype.select = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1: return [4 /*yield*/, (_a.sent()).click()];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /** Gets the text content of the tab. */
        MatTabHarness.prototype.getTextContent = function () {
            return __awaiter(this, void 0, void 0, function () {
                var contentId, contentEl;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this._getContentId()];
                        case 1:
                            contentId = _a.sent();
                            return [4 /*yield*/, this.documentRootLocatorFactory().locatorFor("#" + contentId)()];
                        case 2:
                            contentEl = _a.sent();
                            return [2 /*return*/, contentEl.text()];
                    }
                });
            });
        };
        /**
         * Gets a `HarnessLoader` that can be used to load harnesses for components within the tab's
         * content area.
         * @deprecated Use `getHarness` or `getChildLoader` instead.
         * @breaking-change 12.0.0
         */
        MatTabHarness.prototype.getHarnessLoaderForContent = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.getRootHarnessLoader()];
                });
            });
        };
        MatTabHarness.prototype.getRootHarnessLoader = function () {
            return __awaiter(this, void 0, void 0, function () {
                var contentId;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this._getContentId()];
                        case 1:
                            contentId = _a.sent();
                            return [2 /*return*/, this.documentRootLocatorFactory().harnessLoaderFor("#" + contentId)];
                    }
                });
            });
        };
        /** Gets the element id for the content of the current tab. */
        MatTabHarness.prototype._getContentId = function () {
            return __awaiter(this, void 0, void 0, function () {
                var hostEl;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1:
                            hostEl = _a.sent();
                            return [4 /*yield*/, hostEl.getAttribute('aria-controls')];
                        case 2: 
                        // Tabs never have an empty "aria-controls" attribute.
                        return [2 /*return*/, (_a.sent())];
                    }
                });
            });
        };
        return MatTabHarness;
    }(testing.ContentContainerComponentHarness));
    /** The selector for the host element of a `MatTab` instance. */
    MatTabHarness.hostSelector = '.mat-tab-label';

    /** Harness for interacting with a standard mat-tab-group in tests. */
    var MatTabGroupHarness = /** @class */ (function (_super) {
        __extends(MatTabGroupHarness, _super);
        function MatTabGroupHarness() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
         * Gets a `HarnessPredicate` that can be used to search for a `MatTabGroupHarness` that meets
         * certain criteria.
         * @param options Options for filtering which tab group instances are considered a match.
         * @return a `HarnessPredicate` configured with the given options.
         */
        MatTabGroupHarness.with = function (options) {
            var _this = this;
            if (options === void 0) { options = {}; }
            return new testing.HarnessPredicate(MatTabGroupHarness, options)
                .addOption('selectedTabLabel', options.selectedTabLabel, function (harness, label) { return __awaiter(_this, void 0, void 0, function () {
                var selectedTab, _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0: return [4 /*yield*/, harness.getSelectedTab()];
                        case 1:
                            selectedTab = _c.sent();
                            _b = (_a = testing.HarnessPredicate).stringMatches;
                            return [4 /*yield*/, selectedTab.getLabel()];
                        case 2: return [2 /*return*/, _b.apply(_a, [_c.sent(), label])];
                    }
                });
            }); });
        };
        /**
         * Gets the list of tabs in the tab group.
         * @param filter Optionally filters which tabs are included.
         */
        MatTabGroupHarness.prototype.getTabs = function (filter) {
            if (filter === void 0) { filter = {}; }
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.locatorForAll(MatTabHarness.with(filter))()];
                });
            });
        };
        /** Gets the selected tab of the tab group. */
        MatTabGroupHarness.prototype.getSelectedTab = function () {
            return __awaiter(this, void 0, void 0, function () {
                var tabs, isSelected, i;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.getTabs()];
                        case 1:
                            tabs = _a.sent();
                            return [4 /*yield*/, testing.parallel(function () { return tabs.map(function (t) { return t.isSelected(); }); })];
                        case 2:
                            isSelected = _a.sent();
                            for (i = 0; i < tabs.length; i++) {
                                if (isSelected[i]) {
                                    return [2 /*return*/, tabs[i]];
                                }
                            }
                            throw new Error('No selected tab could be found.');
                    }
                });
            });
        };
        /**
         * Selects a tab in this tab group.
         * @param filter An optional filter to apply to the child tabs. The first tab matching the filter
         *     will be selected.
         */
        MatTabGroupHarness.prototype.selectTab = function (filter) {
            if (filter === void 0) { filter = {}; }
            return __awaiter(this, void 0, void 0, function () {
                var tabs;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.getTabs(filter)];
                        case 1:
                            tabs = _a.sent();
                            if (!tabs.length) {
                                throw Error("Cannot find mat-tab matching filter " + JSON.stringify(filter));
                            }
                            return [4 /*yield*/, tabs[0].select()];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        return MatTabGroupHarness;
    }(testing.ComponentHarness));
    /** The selector for the host element of a `MatTabGroup` instance. */
    MatTabGroupHarness.hostSelector = '.mat-tab-group';

    /** Harness for interacting with a standard Angular Material tab link in tests. */
    var MatTabLinkHarness = /** @class */ (function (_super) {
        __extends(MatTabLinkHarness, _super);
        function MatTabLinkHarness() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
         * Gets a `HarnessPredicate` that can be used to search for a `MatTabLinkHarness` that meets
         * certain criteria.
         * @param options Options for filtering which tab link instances are considered a match.
         * @return a `HarnessPredicate` configured with the given options.
         */
        MatTabLinkHarness.with = function (options) {
            if (options === void 0) { options = {}; }
            return new testing.HarnessPredicate(MatTabLinkHarness, options)
                .addOption('label', options.label, function (harness, label) { return testing.HarnessPredicate.stringMatches(harness.getLabel(), label); });
        };
        /** Gets the label of the link. */
        MatTabLinkHarness.prototype.getLabel = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1: return [2 /*return*/, (_a.sent()).text()];
                    }
                });
            });
        };
        /** Whether the link is active. */
        MatTabLinkHarness.prototype.isActive = function () {
            return __awaiter(this, void 0, void 0, function () {
                var host;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1:
                            host = _a.sent();
                            return [2 /*return*/, host.hasClass('mat-tab-label-active')];
                    }
                });
            });
        };
        /** Whether the link is disabled. */
        MatTabLinkHarness.prototype.isDisabled = function () {
            return __awaiter(this, void 0, void 0, function () {
                var host;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1:
                            host = _a.sent();
                            return [2 /*return*/, host.hasClass('mat-tab-disabled')];
                    }
                });
            });
        };
        /** Clicks on the link. */
        MatTabLinkHarness.prototype.click = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1: return [4 /*yield*/, (_a.sent()).click()];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        return MatTabLinkHarness;
    }(testing.ComponentHarness));
    /** The selector for the host element of a `MatTabLink` instance. */
    MatTabLinkHarness.hostSelector = '.mat-tab-link';

    /** Harness for interacting with a standard mat-tab-nav-bar in tests. */
    var MatTabNavBarHarness = /** @class */ (function (_super) {
        __extends(MatTabNavBarHarness, _super);
        function MatTabNavBarHarness() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
         * Gets a `HarnessPredicate` that can be used to search for a `MatTabNavBar` that meets
         * certain criteria.
         * @param options Options for filtering which tab nav bar instances are considered a match.
         * @return a `HarnessPredicate` configured with the given options.
         */
        MatTabNavBarHarness.with = function (options) {
            if (options === void 0) { options = {}; }
            return new testing.HarnessPredicate(MatTabNavBarHarness, options);
        };
        /**
         * Gets the list of links in the nav bar.
         * @param filter Optionally filters which links are included.
         */
        MatTabNavBarHarness.prototype.getLinks = function (filter) {
            if (filter === void 0) { filter = {}; }
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.locatorForAll(MatTabLinkHarness.with(filter))()];
                });
            });
        };
        /** Gets the active link in the nav bar. */
        MatTabNavBarHarness.prototype.getActiveLink = function () {
            return __awaiter(this, void 0, void 0, function () {
                var links, isActive, i;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.getLinks()];
                        case 1:
                            links = _a.sent();
                            return [4 /*yield*/, testing.parallel(function () { return links.map(function (t) { return t.isActive(); }); })];
                        case 2:
                            isActive = _a.sent();
                            for (i = 0; i < links.length; i++) {
                                if (isActive[i]) {
                                    return [2 /*return*/, links[i]];
                                }
                            }
                            throw new Error('No active link could be found.');
                    }
                });
            });
        };
        /**
         * Clicks a link inside the nav bar.
         * @param filter An optional filter to apply to the child link. The first link matching the filter
         *     will be clicked.
         */
        MatTabNavBarHarness.prototype.clickLink = function (filter) {
            if (filter === void 0) { filter = {}; }
            return __awaiter(this, void 0, void 0, function () {
                var tabs;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.getLinks(filter)];
                        case 1:
                            tabs = _a.sent();
                            if (!tabs.length) {
                                throw Error("Cannot find mat-tab-link matching filter " + JSON.stringify(filter));
                            }
                            return [4 /*yield*/, tabs[0].click()];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        return MatTabNavBarHarness;
    }(testing.ComponentHarness));
    /** The selector for the host element of a `MatTabNavBar` instance. */
    MatTabNavBarHarness.hostSelector = '.mat-tab-nav-bar';

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

    exports.MatTabGroupHarness = MatTabGroupHarness;
    exports.MatTabHarness = MatTabHarness;
    exports.MatTabLinkHarness = MatTabLinkHarness;
    exports.MatTabNavBarHarness = MatTabNavBarHarness;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=material-tabs-testing.umd.js.map
