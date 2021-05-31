(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/cdk/testing')) :
    typeof define === 'function' && define.amd ? define('@angular/material/stepper/testing', ['exports', '@angular/cdk/testing'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.ng = global.ng || {}, global.ng.material = global.ng.material || {}, global.ng.material.stepper = global.ng.material.stepper || {}, global.ng.material.stepper.testing = {}), global.ng.cdk.testing));
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

    /** Harness for interacting with a standard Angular Material step in tests. */
    var MatStepHarness = /** @class */ (function (_super) {
        __extends(MatStepHarness, _super);
        function MatStepHarness() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
         * Gets a `HarnessPredicate` that can be used to search for a `MatStepHarness` that meets
         * certain criteria.
         * @param options Options for filtering which steps are considered a match.
         * @return a `HarnessPredicate` configured with the given options.
         */
        MatStepHarness.with = function (options) {
            var _this = this;
            if (options === void 0) { options = {}; }
            return new testing.HarnessPredicate(MatStepHarness, options)
                .addOption('label', options.label, function (harness, label) { return testing.HarnessPredicate.stringMatches(harness.getLabel(), label); })
                .addOption('selected', options.selected, function (harness, selected) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, harness.isSelected()];
                    case 1: return [2 /*return*/, (_a.sent()) === selected];
                }
            }); }); })
                .addOption('completed', options.completed, function (harness, completed) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, harness.isCompleted()];
                    case 1: return [2 /*return*/, (_a.sent()) === completed];
                }
            }); }); })
                .addOption('invalid', options.invalid, function (harness, invalid) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, harness.hasErrors()];
                    case 1: return [2 /*return*/, (_a.sent()) === invalid];
                }
            }); }); });
        };
        /** Gets the label of the step. */
        MatStepHarness.prototype.getLabel = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.locatorFor('.mat-step-text-label')()];
                        case 1: return [2 /*return*/, (_a.sent()).text()];
                    }
                });
            });
        };
        /** Gets the `aria-label` of the step. */
        MatStepHarness.prototype.getAriaLabel = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1: return [2 /*return*/, (_a.sent()).getAttribute('aria-label')];
                    }
                });
            });
        };
        /** Gets the value of the `aria-labelledby` attribute. */
        MatStepHarness.prototype.getAriaLabelledby = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1: return [2 /*return*/, (_a.sent()).getAttribute('aria-labelledby')];
                    }
                });
            });
        };
        /** Whether the step is selected. */
        MatStepHarness.prototype.isSelected = function () {
            return __awaiter(this, void 0, void 0, function () {
                var host;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1:
                            host = _a.sent();
                            return [4 /*yield*/, host.getAttribute('aria-selected')];
                        case 2: return [2 /*return*/, (_a.sent()) === 'true'];
                    }
                });
            });
        };
        /** Whether the step has been filled out. */
        MatStepHarness.prototype.isCompleted = function () {
            return __awaiter(this, void 0, void 0, function () {
                var state, _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0: return [4 /*yield*/, this._getIconState()];
                        case 1:
                            state = _c.sent();
                            _a = state === 'done';
                            if (_a) return [3 /*break*/, 4];
                            _b = state === 'edit';
                            if (!_b) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.isSelected()];
                        case 2:
                            _b = !(_c.sent());
                            _c.label = 3;
                        case 3:
                            _a = (_b);
                            _c.label = 4;
                        case 4: return [2 /*return*/, _a];
                    }
                });
            });
        };
        /**
         * Whether the step is currently showing its error state. Note that this doesn't mean that there
         * are or aren't any invalid form controls inside the step, but that the step is showing its
         * error-specific styling which depends on there being invalid controls, as well as the
         * `ErrorStateMatcher` determining that an error should be shown and that the `showErrors`
         * option was enabled through the `STEPPER_GLOBAL_OPTIONS` injection token.
         */
        MatStepHarness.prototype.hasErrors = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this._getIconState()];
                        case 1: return [2 /*return*/, (_a.sent()) === 'error'];
                    }
                });
            });
        };
        /** Whether the step is optional. */
        MatStepHarness.prototype.isOptional = function () {
            return __awaiter(this, void 0, void 0, function () {
                var optionalNode;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.locatorForOptional('.mat-step-optional')()];
                        case 1:
                            optionalNode = _a.sent();
                            return [2 /*return*/, !!optionalNode];
                    }
                });
            });
        };
        /**
         * Selects the given step by clicking on the label. The step may not be selected
         * if the stepper doesn't allow it (e.g. if there are validation errors).
         */
        MatStepHarness.prototype.select = function () {
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
        MatStepHarness.prototype.getRootHarnessLoader = function () {
            return __awaiter(this, void 0, void 0, function () {
                var contentId;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1: return [4 /*yield*/, (_a.sent()).getAttribute('aria-controls')];
                        case 2:
                            contentId = _a.sent();
                            return [2 /*return*/, this.documentRootLocatorFactory().harnessLoaderFor("#" + contentId)];
                    }
                });
            });
        };
        /**
         * Gets the state of the step. Note that we have a `StepState` which we could use to type the
         * return value, but it's basically the same as `string`, because the type has `| string`.
         */
        MatStepHarness.prototype._getIconState = function () {
            return __awaiter(this, void 0, void 0, function () {
                var icon, classes, match;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.locatorFor('.mat-step-icon')()];
                        case 1:
                            icon = _a.sent();
                            return [4 /*yield*/, icon.getAttribute('class')];
                        case 2:
                            classes = (_a.sent());
                            match = classes.match(/mat-step-icon-state-([a-z]+)/);
                            if (!match) {
                                throw Error("Could not determine step state from \"" + classes + "\".");
                            }
                            return [2 /*return*/, match[1]];
                    }
                });
            });
        };
        return MatStepHarness;
    }(testing.ContentContainerComponentHarness));
    /** The selector for the host element of a `MatStep` instance. */
    MatStepHarness.hostSelector = '.mat-step-header';

    /** Harness for interacting with a standard Material stepper in tests. */
    var MatStepperHarness = /** @class */ (function (_super) {
        __extends(MatStepperHarness, _super);
        function MatStepperHarness() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
         * Gets a `HarnessPredicate` that can be used to search for a `MatStepperHarness` that meets
         * certain criteria.
         * @param options Options for filtering which stepper instances are considered a match.
         * @return a `HarnessPredicate` configured with the given options.
         */
        MatStepperHarness.with = function (options) {
            var _this = this;
            if (options === void 0) { options = {}; }
            return new testing.HarnessPredicate(MatStepperHarness, options)
                .addOption('orientation', options.orientation, function (harness, orientation) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, harness.getOrientation()];
                    case 1: return [2 /*return*/, (_a.sent()) === orientation];
                }
            }); }); });
        };
        /**
         * Gets the list of steps in the stepper.
         * @param filter Optionally filters which steps are included.
         */
        MatStepperHarness.prototype.getSteps = function (filter) {
            if (filter === void 0) { filter = {}; }
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.locatorForAll(MatStepHarness.with(filter))()];
                });
            });
        };
        /** Gets the orientation of the stepper. */
        MatStepperHarness.prototype.getOrientation = function () {
            return __awaiter(this, void 0, void 0, function () {
                var host;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1:
                            host = _a.sent();
                            return [4 /*yield*/, host.hasClass('mat-stepper-horizontal')];
                        case 2: return [2 /*return*/, (_a.sent()) ?
                                0 /* HORIZONTAL */ : 1 /* VERTICAL */];
                    }
                });
            });
        };
        /**
         * Selects a step in this stepper.
         * @param filter An optional filter to apply to the child steps. The first step matching the
         *    filter will be selected.
         */
        MatStepperHarness.prototype.selectStep = function (filter) {
            if (filter === void 0) { filter = {}; }
            return __awaiter(this, void 0, void 0, function () {
                var steps;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.getSteps(filter)];
                        case 1:
                            steps = _a.sent();
                            if (!steps.length) {
                                throw Error("Cannot find mat-step matching filter " + JSON.stringify(filter));
                            }
                            return [4 /*yield*/, steps[0].select()];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        return MatStepperHarness;
    }(testing.ComponentHarness));
    /** The selector for the host element of a `MatStepper` instance. */
    MatStepperHarness.hostSelector = '.mat-stepper-horizontal, .mat-stepper-vertical';

    /** Base class for stepper button harnesses. */
    var StepperButtonHarness = /** @class */ (function (_super) {
        __extends(StepperButtonHarness, _super);
        function StepperButtonHarness() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /** Gets the text of the button. */
        StepperButtonHarness.prototype.getText = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1: return [2 /*return*/, (_a.sent()).text()];
                    }
                });
            });
        };
        /** Clicks the button. */
        StepperButtonHarness.prototype.click = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.host()];
                        case 1: return [2 /*return*/, (_a.sent()).click()];
                    }
                });
            });
        };
        return StepperButtonHarness;
    }(testing.ComponentHarness));
    /** Harness for interacting with a standard Angular Material stepper next button in tests. */
    var MatStepperNextHarness = /** @class */ (function (_super) {
        __extends(MatStepperNextHarness, _super);
        function MatStepperNextHarness() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
         * Gets a `HarnessPredicate` that can be used to search for a `MatStepperNextHarness` that meets
         * certain criteria.
         * @param options Options for filtering which steps are considered a match.
         * @return a `HarnessPredicate` configured with the given options.
         */
        MatStepperNextHarness.with = function (options) {
            if (options === void 0) { options = {}; }
            return new testing.HarnessPredicate(MatStepperNextHarness, options)
                .addOption('text', options.text, function (harness, text) { return testing.HarnessPredicate.stringMatches(harness.getText(), text); });
        };
        return MatStepperNextHarness;
    }(StepperButtonHarness));
    /** The selector for the host element of a `MatStep` instance. */
    MatStepperNextHarness.hostSelector = '.mat-stepper-next';
    /** Harness for interacting with a standard Angular Material stepper previous button in tests. */
    var MatStepperPreviousHarness = /** @class */ (function (_super) {
        __extends(MatStepperPreviousHarness, _super);
        function MatStepperPreviousHarness() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
         * Gets a `HarnessPredicate` that can be used to search for a `MatStepperPreviousHarness`
         * that meets certain criteria.
         * @param options Options for filtering which steps are considered a match.
         * @return a `HarnessPredicate` configured with the given options.
         */
        MatStepperPreviousHarness.with = function (options) {
            if (options === void 0) { options = {}; }
            return new testing.HarnessPredicate(MatStepperPreviousHarness, options)
                .addOption('text', options.text, function (harness, text) { return testing.HarnessPredicate.stringMatches(harness.getText(), text); });
        };
        return MatStepperPreviousHarness;
    }(StepperButtonHarness));
    /** The selector for the host element of a `MatStep` instance. */
    MatStepperPreviousHarness.hostSelector = '.mat-stepper-previous';

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

    exports.MatStepHarness = MatStepHarness;
    exports.MatStepperHarness = MatStepperHarness;
    exports.MatStepperNextHarness = MatStepperNextHarness;
    exports.MatStepperPreviousHarness = MatStepperPreviousHarness;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=material-stepper-testing.umd.js.map
