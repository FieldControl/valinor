(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('@angular/material/core'), require('@angular/cdk/coercion'), require('@angular/common'), require('rxjs'), require('rxjs/operators'), require('@angular/common/http'), require('@angular/platform-browser')) :
    typeof define === 'function' && define.amd ? define('@angular/material/icon', ['exports', '@angular/core', '@angular/material/core', '@angular/cdk/coercion', '@angular/common', 'rxjs', 'rxjs/operators', '@angular/common/http', '@angular/platform-browser'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.ng = global.ng || {}, global.ng.material = global.ng.material || {}, global.ng.material.icon = {}), global.ng.core, global.ng.material.core, global.ng.cdk.coercion, global.ng.common, global.rxjs, global.rxjs.operators, global.ng.common.http, global.ng.platformBrowser));
}(this, (function (exports, i0, core, coercion, i3, rxjs, operators, i1, i2) { 'use strict';

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
    var i3__namespace = /*#__PURE__*/_interopNamespace(i3);
    var i1__namespace = /*#__PURE__*/_interopNamespace(i1);
    var i2__namespace = /*#__PURE__*/_interopNamespace(i2);

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
     * Returns an exception to be thrown in the case when attempting to
     * load an icon with a name that cannot be found.
     * @docs-private
     */
    function getMatIconNameNotFoundError(iconName) {
        return Error("Unable to find icon with the name \"" + iconName + "\"");
    }
    /**
     * Returns an exception to be thrown when the consumer attempts to use
     * `<mat-icon>` without including @angular/common/http.
     * @docs-private
     */
    function getMatIconNoHttpProviderError() {
        return Error('Could not find HttpClient provider for use with Angular Material icons. ' +
            'Please include the HttpClientModule from @angular/common/http in your ' +
            'app imports.');
    }
    /**
     * Returns an exception to be thrown when a URL couldn't be sanitized.
     * @param url URL that was attempted to be sanitized.
     * @docs-private
     */
    function getMatIconFailedToSanitizeUrlError(url) {
        return Error("The URL provided to MatIconRegistry was not trusted as a resource URL " +
            ("via Angular's DomSanitizer. Attempted URL was \"" + url + "\"."));
    }
    /**
     * Returns an exception to be thrown when a HTML string couldn't be sanitized.
     * @param literal HTML that was attempted to be sanitized.
     * @docs-private
     */
    function getMatIconFailedToSanitizeLiteralError(literal) {
        return Error("The literal provided to MatIconRegistry was not trusted as safe HTML by " +
            ("Angular's DomSanitizer. Attempted literal was \"" + literal + "\"."));
    }
    /**
     * Configuration for an icon, including the URL and possibly the cached SVG element.
     * @docs-private
     */
    var SvgIconConfig = /** @class */ (function () {
        function SvgIconConfig(url, svgText, options) {
            this.url = url;
            this.svgText = svgText;
            this.options = options;
        }
        return SvgIconConfig;
    }());
    /**
     * Service to register and display icons used by the `<mat-icon>` component.
     * - Registers icon URLs by namespace and name.
     * - Registers icon set URLs by namespace.
     * - Registers aliases for CSS classes, for use with icon fonts.
     * - Loads icons from URLs and extracts individual icons from icon sets.
     */
    var MatIconRegistry = /** @class */ (function () {
        function MatIconRegistry(_httpClient, _sanitizer, document, _errorHandler) {
            this._httpClient = _httpClient;
            this._sanitizer = _sanitizer;
            this._errorHandler = _errorHandler;
            /**
             * URLs and cached SVG elements for individual icons. Keys are of the format "[namespace]:[icon]".
             */
            this._svgIconConfigs = new Map();
            /**
             * SvgIconConfig objects and cached SVG elements for icon sets, keyed by namespace.
             * Multiple icon sets can be registered under the same namespace.
             */
            this._iconSetConfigs = new Map();
            /** Cache for icons loaded by direct URLs. */
            this._cachedIconsByUrl = new Map();
            /** In-progress icon fetches. Used to coalesce multiple requests to the same URL. */
            this._inProgressUrlFetches = new Map();
            /** Map from font identifiers to their CSS class names. Used for icon fonts. */
            this._fontCssClassesByAlias = new Map();
            /** Registered icon resolver functions. */
            this._resolvers = [];
            /**
             * The CSS class to apply when an `<mat-icon>` component has no icon name, url, or font specified.
             * The default 'material-icons' value assumes that the material icon font has been loaded as
             * described at http://google.github.io/material-design-icons/#icon-font-for-the-web
             */
            this._defaultFontSetClass = 'material-icons';
            this._document = document;
        }
        /**
         * Registers an icon by URL in the default namespace.
         * @param iconName Name under which the icon should be registered.
         * @param url
         */
        MatIconRegistry.prototype.addSvgIcon = function (iconName, url, options) {
            return this.addSvgIconInNamespace('', iconName, url, options);
        };
        /**
         * Registers an icon using an HTML string in the default namespace.
         * @param iconName Name under which the icon should be registered.
         * @param literal SVG source of the icon.
         */
        MatIconRegistry.prototype.addSvgIconLiteral = function (iconName, literal, options) {
            return this.addSvgIconLiteralInNamespace('', iconName, literal, options);
        };
        /**
         * Registers an icon by URL in the specified namespace.
         * @param namespace Namespace in which the icon should be registered.
         * @param iconName Name under which the icon should be registered.
         * @param url
         */
        MatIconRegistry.prototype.addSvgIconInNamespace = function (namespace, iconName, url, options) {
            return this._addSvgIconConfig(namespace, iconName, new SvgIconConfig(url, null, options));
        };
        /**
         * Registers an icon resolver function with the registry. The function will be invoked with the
         * name and namespace of an icon when the registry tries to resolve the URL from which to fetch
         * the icon. The resolver is expected to return a `SafeResourceUrl` that points to the icon,
         * an object with the icon URL and icon options, or `null` if the icon is not supported. Resolvers
         * will be invoked in the order in which they have been registered.
         * @param resolver Resolver function to be registered.
         */
        MatIconRegistry.prototype.addSvgIconResolver = function (resolver) {
            this._resolvers.push(resolver);
            return this;
        };
        /**
         * Registers an icon using an HTML string in the specified namespace.
         * @param namespace Namespace in which the icon should be registered.
         * @param iconName Name under which the icon should be registered.
         * @param literal SVG source of the icon.
         */
        MatIconRegistry.prototype.addSvgIconLiteralInNamespace = function (namespace, iconName, literal, options) {
            var cleanLiteral = this._sanitizer.sanitize(i0.SecurityContext.HTML, literal);
            // TODO: add an ngDevMode check
            if (!cleanLiteral) {
                throw getMatIconFailedToSanitizeLiteralError(literal);
            }
            return this._addSvgIconConfig(namespace, iconName, new SvgIconConfig('', cleanLiteral, options));
        };
        /**
         * Registers an icon set by URL in the default namespace.
         * @param url
         */
        MatIconRegistry.prototype.addSvgIconSet = function (url, options) {
            return this.addSvgIconSetInNamespace('', url, options);
        };
        /**
         * Registers an icon set using an HTML string in the default namespace.
         * @param literal SVG source of the icon set.
         */
        MatIconRegistry.prototype.addSvgIconSetLiteral = function (literal, options) {
            return this.addSvgIconSetLiteralInNamespace('', literal, options);
        };
        /**
         * Registers an icon set by URL in the specified namespace.
         * @param namespace Namespace in which to register the icon set.
         * @param url
         */
        MatIconRegistry.prototype.addSvgIconSetInNamespace = function (namespace, url, options) {
            return this._addSvgIconSetConfig(namespace, new SvgIconConfig(url, null, options));
        };
        /**
         * Registers an icon set using an HTML string in the specified namespace.
         * @param namespace Namespace in which to register the icon set.
         * @param literal SVG source of the icon set.
         */
        MatIconRegistry.prototype.addSvgIconSetLiteralInNamespace = function (namespace, literal, options) {
            var cleanLiteral = this._sanitizer.sanitize(i0.SecurityContext.HTML, literal);
            if (!cleanLiteral) {
                throw getMatIconFailedToSanitizeLiteralError(literal);
            }
            return this._addSvgIconSetConfig(namespace, new SvgIconConfig('', cleanLiteral, options));
        };
        /**
         * Defines an alias for a CSS class name to be used for icon fonts. Creating an matIcon
         * component with the alias as the fontSet input will cause the class name to be applied
         * to the `<mat-icon>` element.
         *
         * @param alias Alias for the font.
         * @param className Class name override to be used instead of the alias.
         */
        MatIconRegistry.prototype.registerFontClassAlias = function (alias, className) {
            if (className === void 0) { className = alias; }
            this._fontCssClassesByAlias.set(alias, className);
            return this;
        };
        /**
         * Returns the CSS class name associated with the alias by a previous call to
         * registerFontClassAlias. If no CSS class has been associated, returns the alias unmodified.
         */
        MatIconRegistry.prototype.classNameForFontAlias = function (alias) {
            return this._fontCssClassesByAlias.get(alias) || alias;
        };
        /**
         * Sets the CSS class name to be used for icon fonts when an `<mat-icon>` component does not
         * have a fontSet input value, and is not loading an icon by name or URL.
         *
         * @param className
         */
        MatIconRegistry.prototype.setDefaultFontSetClass = function (className) {
            this._defaultFontSetClass = className;
            return this;
        };
        /**
         * Returns the CSS class name to be used for icon fonts when an `<mat-icon>` component does not
         * have a fontSet input value, and is not loading an icon by name or URL.
         */
        MatIconRegistry.prototype.getDefaultFontSetClass = function () {
            return this._defaultFontSetClass;
        };
        /**
         * Returns an Observable that produces the icon (as an `<svg>` DOM element) from the given URL.
         * The response from the URL may be cached so this will not always cause an HTTP request, but
         * the produced element will always be a new copy of the originally fetched icon. (That is,
         * it will not contain any modifications made to elements previously returned).
         *
         * @param safeUrl URL from which to fetch the SVG icon.
         */
        MatIconRegistry.prototype.getSvgIconFromUrl = function (safeUrl) {
            var _this = this;
            var url = this._sanitizer.sanitize(i0.SecurityContext.RESOURCE_URL, safeUrl);
            if (!url) {
                throw getMatIconFailedToSanitizeUrlError(safeUrl);
            }
            var cachedIcon = this._cachedIconsByUrl.get(url);
            if (cachedIcon) {
                return rxjs.of(cloneSvg(cachedIcon));
            }
            return this._loadSvgIconFromConfig(new SvgIconConfig(safeUrl, null)).pipe(operators.tap(function (svg) { return _this._cachedIconsByUrl.set(url, svg); }), operators.map(function (svg) { return cloneSvg(svg); }));
        };
        /**
         * Returns an Observable that produces the icon (as an `<svg>` DOM element) with the given name
         * and namespace. The icon must have been previously registered with addIcon or addIconSet;
         * if not, the Observable will throw an error.
         *
         * @param name Name of the icon to be retrieved.
         * @param namespace Namespace in which to look for the icon.
         */
        MatIconRegistry.prototype.getNamedSvgIcon = function (name, namespace) {
            if (namespace === void 0) { namespace = ''; }
            var key = iconKey(namespace, name);
            var config = this._svgIconConfigs.get(key);
            // Return (copy of) cached icon if possible.
            if (config) {
                return this._getSvgFromConfig(config);
            }
            // Otherwise try to resolve the config from one of the resolver functions.
            config = this._getIconConfigFromResolvers(namespace, name);
            if (config) {
                this._svgIconConfigs.set(key, config);
                return this._getSvgFromConfig(config);
            }
            // See if we have any icon sets registered for the namespace.
            var iconSetConfigs = this._iconSetConfigs.get(namespace);
            if (iconSetConfigs) {
                return this._getSvgFromIconSetConfigs(name, iconSetConfigs);
            }
            return rxjs.throwError(getMatIconNameNotFoundError(key));
        };
        MatIconRegistry.prototype.ngOnDestroy = function () {
            this._resolvers = [];
            this._svgIconConfigs.clear();
            this._iconSetConfigs.clear();
            this._cachedIconsByUrl.clear();
        };
        /**
         * Returns the cached icon for a SvgIconConfig if available, or fetches it from its URL if not.
         */
        MatIconRegistry.prototype._getSvgFromConfig = function (config) {
            if (config.svgText) {
                // We already have the SVG element for this icon, return a copy.
                return rxjs.of(cloneSvg(this._svgElementFromConfig(config)));
            }
            else {
                // Fetch the icon from the config's URL, cache it, and return a copy.
                return this._loadSvgIconFromConfig(config).pipe(operators.map(function (svg) { return cloneSvg(svg); }));
            }
        };
        /**
         * Attempts to find an icon with the specified name in any of the SVG icon sets.
         * First searches the available cached icons for a nested element with a matching name, and
         * if found copies the element to a new `<svg>` element. If not found, fetches all icon sets
         * that have not been cached, and searches again after all fetches are completed.
         * The returned Observable produces the SVG element if possible, and throws
         * an error if no icon with the specified name can be found.
         */
        MatIconRegistry.prototype._getSvgFromIconSetConfigs = function (name, iconSetConfigs) {
            var _this = this;
            // For all the icon set SVG elements we've fetched, see if any contain an icon with the
            // requested name.
            var namedIcon = this._extractIconWithNameFromAnySet(name, iconSetConfigs);
            if (namedIcon) {
                // We could cache namedIcon in _svgIconConfigs, but since we have to make a copy every
                // time anyway, there's probably not much advantage compared to just always extracting
                // it from the icon set.
                return rxjs.of(namedIcon);
            }
            // Not found in any cached icon sets. If there are icon sets with URLs that we haven't
            // fetched, fetch them now and look for iconName in the results.
            var iconSetFetchRequests = iconSetConfigs
                .filter(function (iconSetConfig) { return !iconSetConfig.svgText; })
                .map(function (iconSetConfig) {
                return _this._loadSvgIconSetFromConfig(iconSetConfig).pipe(operators.catchError(function (err) {
                    var url = _this._sanitizer.sanitize(i0.SecurityContext.RESOURCE_URL, iconSetConfig.url);
                    // Swallow errors fetching individual URLs so the
                    // combined Observable won't necessarily fail.
                    var errorMessage = "Loading icon set URL: " + url + " failed: " + err.message;
                    _this._errorHandler.handleError(new Error(errorMessage));
                    return rxjs.of(null);
                }));
            });
            // Fetch all the icon set URLs. When the requests complete, every IconSet should have a
            // cached SVG element (unless the request failed), and we can check again for the icon.
            return rxjs.forkJoin(iconSetFetchRequests).pipe(operators.map(function () {
                var foundIcon = _this._extractIconWithNameFromAnySet(name, iconSetConfigs);
                // TODO: add an ngDevMode check
                if (!foundIcon) {
                    throw getMatIconNameNotFoundError(name);
                }
                return foundIcon;
            }));
        };
        /**
         * Searches the cached SVG elements for the given icon sets for a nested icon element whose "id"
         * tag matches the specified name. If found, copies the nested element to a new SVG element and
         * returns it. Returns null if no matching element is found.
         */
        MatIconRegistry.prototype._extractIconWithNameFromAnySet = function (iconName, iconSetConfigs) {
            // Iterate backwards, so icon sets added later have precedence.
            for (var i = iconSetConfigs.length - 1; i >= 0; i--) {
                var config = iconSetConfigs[i];
                // Parsing the icon set's text into an SVG element can be expensive. We can avoid some of
                // the parsing by doing a quick check using `indexOf` to see if there's any chance for the
                // icon to be in the set. This won't be 100% accurate, but it should help us avoid at least
                // some of the parsing.
                if (config.svgText && config.svgText.indexOf(iconName) > -1) {
                    var svg = this._svgElementFromConfig(config);
                    var foundIcon = this._extractSvgIconFromSet(svg, iconName, config.options);
                    if (foundIcon) {
                        return foundIcon;
                    }
                }
            }
            return null;
        };
        /**
         * Loads the content of the icon URL specified in the SvgIconConfig and creates an SVG element
         * from it.
         */
        MatIconRegistry.prototype._loadSvgIconFromConfig = function (config) {
            var _this = this;
            return this._fetchIcon(config).pipe(operators.tap(function (svgText) { return config.svgText = svgText; }), operators.map(function () { return _this._svgElementFromConfig(config); }));
        };
        /**
         * Loads the content of the icon set URL specified in the
         * SvgIconConfig and attaches it to the config.
         */
        MatIconRegistry.prototype._loadSvgIconSetFromConfig = function (config) {
            if (config.svgText) {
                return rxjs.of(null);
            }
            return this._fetchIcon(config).pipe(operators.tap(function (svgText) { return config.svgText = svgText; }));
        };
        /**
         * Searches the cached element of the given SvgIconConfig for a nested icon element whose "id"
         * tag matches the specified name. If found, copies the nested element to a new SVG element and
         * returns it. Returns null if no matching element is found.
         */
        MatIconRegistry.prototype._extractSvgIconFromSet = function (iconSet, iconName, options) {
            // Use the `id="iconName"` syntax in order to escape special
            // characters in the ID (versus using the #iconName syntax).
            var iconSource = iconSet.querySelector("[id=\"" + iconName + "\"]");
            if (!iconSource) {
                return null;
            }
            // Clone the element and remove the ID to prevent multiple elements from being added
            // to the page with the same ID.
            var iconElement = iconSource.cloneNode(true);
            iconElement.removeAttribute('id');
            // If the icon node is itself an <svg> node, clone and return it directly. If not, set it as
            // the content of a new <svg> node.
            if (iconElement.nodeName.toLowerCase() === 'svg') {
                return this._setSvgAttributes(iconElement, options);
            }
            // If the node is a <symbol>, it won't be rendered so we have to convert it into <svg>. Note
            // that the same could be achieved by referring to it via <use href="#id">, however the <use>
            // tag is problematic on Firefox, because it needs to include the current page path.
            if (iconElement.nodeName.toLowerCase() === 'symbol') {
                return this._setSvgAttributes(this._toSvgElement(iconElement), options);
            }
            // createElement('SVG') doesn't work as expected; the DOM ends up with
            // the correct nodes, but the SVG content doesn't render. Instead we
            // have to create an empty SVG node using innerHTML and append its content.
            // Elements created using DOMParser.parseFromString have the same problem.
            // http://stackoverflow.com/questions/23003278/svg-innerhtml-in-firefox-can-not-display
            var svg = this._svgElementFromString('<svg></svg>');
            // Clone the node so we don't remove it from the parent icon set element.
            svg.appendChild(iconElement);
            return this._setSvgAttributes(svg, options);
        };
        /**
         * Creates a DOM element from the given SVG string.
         */
        MatIconRegistry.prototype._svgElementFromString = function (str) {
            var div = this._document.createElement('DIV');
            div.innerHTML = str;
            var svg = div.querySelector('svg');
            // TODO: add an ngDevMode check
            if (!svg) {
                throw Error('<svg> tag not found');
            }
            return svg;
        };
        /**
         * Converts an element into an SVG node by cloning all of its children.
         */
        MatIconRegistry.prototype._toSvgElement = function (element) {
            var svg = this._svgElementFromString('<svg></svg>');
            var attributes = element.attributes;
            // Copy over all the attributes from the `symbol` to the new SVG, except the id.
            for (var i = 0; i < attributes.length; i++) {
                var _b = attributes[i], name = _b.name, value = _b.value;
                if (name !== 'id') {
                    svg.setAttribute(name, value);
                }
            }
            for (var i = 0; i < element.childNodes.length; i++) {
                if (element.childNodes[i].nodeType === this._document.ELEMENT_NODE) {
                    svg.appendChild(element.childNodes[i].cloneNode(true));
                }
            }
            return svg;
        };
        /**
         * Sets the default attributes for an SVG element to be used as an icon.
         */
        MatIconRegistry.prototype._setSvgAttributes = function (svg, options) {
            svg.setAttribute('fit', '');
            svg.setAttribute('height', '100%');
            svg.setAttribute('width', '100%');
            svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
            svg.setAttribute('focusable', 'false'); // Disable IE11 default behavior to make SVGs focusable.
            if (options && options.viewBox) {
                svg.setAttribute('viewBox', options.viewBox);
            }
            return svg;
        };
        /**
         * Returns an Observable which produces the string contents of the given icon. Results may be
         * cached, so future calls with the same URL may not cause another HTTP request.
         */
        MatIconRegistry.prototype._fetchIcon = function (iconConfig) {
            var _this = this;
            var _a;
            var safeUrl = iconConfig.url, options = iconConfig.options;
            var withCredentials = (_a = options === null || options === void 0 ? void 0 : options.withCredentials) !== null && _a !== void 0 ? _a : false;
            if (!this._httpClient) {
                throw getMatIconNoHttpProviderError();
            }
            // TODO: add an ngDevMode check
            if (safeUrl == null) {
                throw Error("Cannot fetch icon from URL \"" + safeUrl + "\".");
            }
            var url = this._sanitizer.sanitize(i0.SecurityContext.RESOURCE_URL, safeUrl);
            // TODO: add an ngDevMode check
            if (!url) {
                throw getMatIconFailedToSanitizeUrlError(safeUrl);
            }
            // Store in-progress fetches to avoid sending a duplicate request for a URL when there is
            // already a request in progress for that URL. It's necessary to call share() on the
            // Observable returned by http.get() so that multiple subscribers don't cause multiple XHRs.
            var inProgressFetch = this._inProgressUrlFetches.get(url);
            if (inProgressFetch) {
                return inProgressFetch;
            }
            var req = this._httpClient.get(url, { responseType: 'text', withCredentials: withCredentials }).pipe(operators.finalize(function () { return _this._inProgressUrlFetches.delete(url); }), operators.share());
            this._inProgressUrlFetches.set(url, req);
            return req;
        };
        /**
         * Registers an icon config by name in the specified namespace.
         * @param namespace Namespace in which to register the icon config.
         * @param iconName Name under which to register the config.
         * @param config Config to be registered.
         */
        MatIconRegistry.prototype._addSvgIconConfig = function (namespace, iconName, config) {
            this._svgIconConfigs.set(iconKey(namespace, iconName), config);
            return this;
        };
        /**
         * Registers an icon set config in the specified namespace.
         * @param namespace Namespace in which to register the icon config.
         * @param config Config to be registered.
         */
        MatIconRegistry.prototype._addSvgIconSetConfig = function (namespace, config) {
            var configNamespace = this._iconSetConfigs.get(namespace);
            if (configNamespace) {
                configNamespace.push(config);
            }
            else {
                this._iconSetConfigs.set(namespace, [config]);
            }
            return this;
        };
        /** Parses a config's text into an SVG element. */
        MatIconRegistry.prototype._svgElementFromConfig = function (config) {
            if (!config.svgElement) {
                var svg = this._svgElementFromString(config.svgText);
                this._setSvgAttributes(svg, config.options);
                config.svgElement = svg;
            }
            return config.svgElement;
        };
        /** Tries to create an icon config through the registered resolver functions. */
        MatIconRegistry.prototype._getIconConfigFromResolvers = function (namespace, name) {
            for (var i = 0; i < this._resolvers.length; i++) {
                var result = this._resolvers[i](name, namespace);
                if (result) {
                    return isSafeUrlWithOptions(result) ?
                        new SvgIconConfig(result.url, null, result.options) :
                        new SvgIconConfig(result, null);
                }
            }
            return undefined;
        };
        return MatIconRegistry;
    }());
    MatIconRegistry.ɵprov = i0__namespace.ɵɵdefineInjectable({ factory: function MatIconRegistry_Factory() { return new MatIconRegistry(i0__namespace.ɵɵinject(i1__namespace.HttpClient, 8), i0__namespace.ɵɵinject(i2__namespace.DomSanitizer), i0__namespace.ɵɵinject(i3__namespace.DOCUMENT, 8), i0__namespace.ɵɵinject(i0__namespace.ErrorHandler)); }, token: MatIconRegistry, providedIn: "root" });
    MatIconRegistry.decorators = [
        { type: i0.Injectable, args: [{ providedIn: 'root' },] }
    ];
    MatIconRegistry.ctorParameters = function () { return [
        { type: i1.HttpClient, decorators: [{ type: i0.Optional }] },
        { type: i2.DomSanitizer },
        { type: undefined, decorators: [{ type: i0.Optional }, { type: i0.Inject, args: [i3.DOCUMENT,] }] },
        { type: i0.ErrorHandler }
    ]; };
    /** @docs-private */
    function ICON_REGISTRY_PROVIDER_FACTORY(parentRegistry, httpClient, sanitizer, errorHandler, document) {
        return parentRegistry || new MatIconRegistry(httpClient, sanitizer, document, errorHandler);
    }
    /** @docs-private */
    var ICON_REGISTRY_PROVIDER = {
        // If there is already an MatIconRegistry available, use that. Otherwise, provide a new one.
        provide: MatIconRegistry,
        deps: [
            [new i0.Optional(), new i0.SkipSelf(), MatIconRegistry],
            [new i0.Optional(), i1.HttpClient],
            i2.DomSanitizer,
            i0.ErrorHandler,
            [new i0.Optional(), i3.DOCUMENT],
        ],
        useFactory: ICON_REGISTRY_PROVIDER_FACTORY,
    };
    /** Clones an SVGElement while preserving type information. */
    function cloneSvg(svg) {
        return svg.cloneNode(true);
    }
    /** Returns the cache key to use for an icon namespace and name. */
    function iconKey(namespace, name) {
        return namespace + ':' + name;
    }
    function isSafeUrlWithOptions(value) {
        return !!(value.url && value.options);
    }

    // Boilerplate for applying mixins to MatIcon.
    /** @docs-private */
    var MatIconBase = /** @class */ (function () {
        function MatIconBase(_elementRef) {
            this._elementRef = _elementRef;
        }
        return MatIconBase;
    }());
    var _MatIconMixinBase = core.mixinColor(MatIconBase);
    /**
     * Injection token used to provide the current location to `MatIcon`.
     * Used to handle server-side rendering and to stub out during unit tests.
     * @docs-private
     */
    var MAT_ICON_LOCATION = new i0.InjectionToken('mat-icon-location', {
        providedIn: 'root',
        factory: MAT_ICON_LOCATION_FACTORY
    });
    /** @docs-private */
    function MAT_ICON_LOCATION_FACTORY() {
        var _document = i0.inject(i3.DOCUMENT);
        var _location = _document ? _document.location : null;
        return {
            // Note that this needs to be a function, rather than a property, because Angular
            // will only resolve it once, but we want the current path on each call.
            getPathname: function () { return _location ? (_location.pathname + _location.search) : ''; }
        };
    }
    /** SVG attributes that accept a FuncIRI (e.g. `url(<something>)`). */
    var funcIriAttributes = [
        'clip-path',
        'color-profile',
        'src',
        'cursor',
        'fill',
        'filter',
        'marker',
        'marker-start',
        'marker-mid',
        'marker-end',
        'mask',
        'stroke'
    ];
    var ɵ0 = function (attr) { return "[" + attr + "]"; };
    /** Selector that can be used to find all elements that are using a `FuncIRI`. */
    var funcIriAttributeSelector = funcIriAttributes.map(ɵ0).join(', ');
    /** Regex that can be used to extract the id out of a FuncIRI. */
    var funcIriPattern = /^url\(['"]?#(.*?)['"]?\)$/;
    /**
     * Component to display an icon. It can be used in the following ways:
     *
     * - Specify the svgIcon input to load an SVG icon from a URL previously registered with the
     *   addSvgIcon, addSvgIconInNamespace, addSvgIconSet, or addSvgIconSetInNamespace methods of
     *   MatIconRegistry. If the svgIcon value contains a colon it is assumed to be in the format
     *   "[namespace]:[name]", if not the value will be the name of an icon in the default namespace.
     *   Examples:
     *     `<mat-icon svgIcon="left-arrow"></mat-icon>
     *     <mat-icon svgIcon="animals:cat"></mat-icon>`
     *
     * - Use a font ligature as an icon by putting the ligature text in the content of the `<mat-icon>`
     *   component. By default the Material icons font is used as described at
     *   http://google.github.io/material-design-icons/#icon-font-for-the-web. You can specify an
     *   alternate font by setting the fontSet input to either the CSS class to apply to use the
     *   desired font, or to an alias previously registered with MatIconRegistry.registerFontClassAlias.
     *   Examples:
     *     `<mat-icon>home</mat-icon>
     *     <mat-icon fontSet="myfont">sun</mat-icon>`
     *
     * - Specify a font glyph to be included via CSS rules by setting the fontSet input to specify the
     *   font, and the fontIcon input to specify the icon. Typically the fontIcon will specify a
     *   CSS class which causes the glyph to be displayed via a :before selector, as in
     *   https://fortawesome.github.io/Font-Awesome/examples/
     *   Example:
     *     `<mat-icon fontSet="fa" fontIcon="alarm"></mat-icon>`
     */
    var MatIcon = /** @class */ (function (_super) {
        __extends(MatIcon, _super);
        function MatIcon(elementRef, _iconRegistry, ariaHidden, _location, _errorHandler) {
            var _this = _super.call(this, elementRef) || this;
            _this._iconRegistry = _iconRegistry;
            _this._location = _location;
            _this._errorHandler = _errorHandler;
            _this._inline = false;
            /** Subscription to the current in-progress SVG icon request. */
            _this._currentIconFetch = rxjs.Subscription.EMPTY;
            // If the user has not explicitly set aria-hidden, mark the icon as hidden, as this is
            // the right thing to do for the majority of icon use-cases.
            if (!ariaHidden) {
                elementRef.nativeElement.setAttribute('aria-hidden', 'true');
            }
            return _this;
        }
        Object.defineProperty(MatIcon.prototype, "inline", {
            /**
             * Whether the icon should be inlined, automatically sizing the icon to match the font size of
             * the element the icon is contained in.
             */
            get: function () {
                return this._inline;
            },
            set: function (inline) {
                this._inline = coercion.coerceBooleanProperty(inline);
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatIcon.prototype, "svgIcon", {
            /** Name of the icon in the SVG icon set. */
            get: function () { return this._svgIcon; },
            set: function (value) {
                if (value !== this._svgIcon) {
                    if (value) {
                        this._updateSvgIcon(value);
                    }
                    else if (this._svgIcon) {
                        this._clearSvgElement();
                    }
                    this._svgIcon = value;
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatIcon.prototype, "fontSet", {
            /** Font set that the icon is a part of. */
            get: function () { return this._fontSet; },
            set: function (value) {
                var newValue = this._cleanupFontValue(value);
                if (newValue !== this._fontSet) {
                    this._fontSet = newValue;
                    this._updateFontIconClasses();
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatIcon.prototype, "fontIcon", {
            /** Name of an icon within a font set. */
            get: function () { return this._fontIcon; },
            set: function (value) {
                var newValue = this._cleanupFontValue(value);
                if (newValue !== this._fontIcon) {
                    this._fontIcon = newValue;
                    this._updateFontIconClasses();
                }
            },
            enumerable: false,
            configurable: true
        });
        /**
         * Splits an svgIcon binding value into its icon set and icon name components.
         * Returns a 2-element array of [(icon set), (icon name)].
         * The separator for the two fields is ':'. If there is no separator, an empty
         * string is returned for the icon set and the entire value is returned for
         * the icon name. If the argument is falsy, returns an array of two empty strings.
         * Throws an error if the name contains two or more ':' separators.
         * Examples:
         *   `'social:cake' -> ['social', 'cake']
         *   'penguin' -> ['', 'penguin']
         *   null -> ['', '']
         *   'a:b:c' -> (throws Error)`
         */
        MatIcon.prototype._splitIconName = function (iconName) {
            if (!iconName) {
                return ['', ''];
            }
            var parts = iconName.split(':');
            switch (parts.length) {
                case 1: return ['', parts[0]]; // Use default namespace.
                case 2: return parts;
                default: throw Error("Invalid icon name: \"" + iconName + "\""); // TODO: add an ngDevMode check
            }
        };
        MatIcon.prototype.ngOnInit = function () {
            // Update font classes because ngOnChanges won't be called if none of the inputs are present,
            // e.g. <mat-icon>arrow</mat-icon> In this case we need to add a CSS class for the default font.
            this._updateFontIconClasses();
        };
        MatIcon.prototype.ngAfterViewChecked = function () {
            var cachedElements = this._elementsWithExternalReferences;
            if (cachedElements && cachedElements.size) {
                var newPath = this._location.getPathname();
                // We need to check whether the URL has changed on each change detection since
                // the browser doesn't have an API that will let us react on link clicks and
                // we can't depend on the Angular router. The references need to be updated,
                // because while most browsers don't care whether the URL is correct after
                // the first render, Safari will break if the user navigates to a different
                // page and the SVG isn't re-rendered.
                if (newPath !== this._previousPath) {
                    this._previousPath = newPath;
                    this._prependPathToReferences(newPath);
                }
            }
        };
        MatIcon.prototype.ngOnDestroy = function () {
            this._currentIconFetch.unsubscribe();
            if (this._elementsWithExternalReferences) {
                this._elementsWithExternalReferences.clear();
            }
        };
        MatIcon.prototype._usingFontIcon = function () {
            return !this.svgIcon;
        };
        MatIcon.prototype._setSvgElement = function (svg) {
            this._clearSvgElement();
            // Workaround for IE11 and Edge ignoring `style` tags inside dynamically-created SVGs.
            // See: https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/10898469/
            // Do this before inserting the element into the DOM, in order to avoid a style recalculation.
            var styleTags = svg.querySelectorAll('style');
            for (var i = 0; i < styleTags.length; i++) {
                styleTags[i].textContent += ' ';
            }
            // Note: we do this fix here, rather than the icon registry, because the
            // references have to point to the URL at the time that the icon was created.
            var path = this._location.getPathname();
            this._previousPath = path;
            this._cacheChildrenWithExternalReferences(svg);
            this._prependPathToReferences(path);
            this._elementRef.nativeElement.appendChild(svg);
        };
        MatIcon.prototype._clearSvgElement = function () {
            var layoutElement = this._elementRef.nativeElement;
            var childCount = layoutElement.childNodes.length;
            if (this._elementsWithExternalReferences) {
                this._elementsWithExternalReferences.clear();
            }
            // Remove existing non-element child nodes and SVGs, and add the new SVG element. Note that
            // we can't use innerHTML, because IE will throw if the element has a data binding.
            while (childCount--) {
                var child = layoutElement.childNodes[childCount];
                // 1 corresponds to Node.ELEMENT_NODE. We remove all non-element nodes in order to get rid
                // of any loose text nodes, as well as any SVG elements in order to remove any old icons.
                if (child.nodeType !== 1 || child.nodeName.toLowerCase() === 'svg') {
                    layoutElement.removeChild(child);
                }
            }
        };
        MatIcon.prototype._updateFontIconClasses = function () {
            if (!this._usingFontIcon()) {
                return;
            }
            var elem = this._elementRef.nativeElement;
            var fontSetClass = this.fontSet ?
                this._iconRegistry.classNameForFontAlias(this.fontSet) :
                this._iconRegistry.getDefaultFontSetClass();
            if (fontSetClass != this._previousFontSetClass) {
                if (this._previousFontSetClass) {
                    elem.classList.remove(this._previousFontSetClass);
                }
                if (fontSetClass) {
                    elem.classList.add(fontSetClass);
                }
                this._previousFontSetClass = fontSetClass;
            }
            if (this.fontIcon != this._previousFontIconClass) {
                if (this._previousFontIconClass) {
                    elem.classList.remove(this._previousFontIconClass);
                }
                if (this.fontIcon) {
                    elem.classList.add(this.fontIcon);
                }
                this._previousFontIconClass = this.fontIcon;
            }
        };
        /**
         * Cleans up a value to be used as a fontIcon or fontSet.
         * Since the value ends up being assigned as a CSS class, we
         * have to trim the value and omit space-separated values.
         */
        MatIcon.prototype._cleanupFontValue = function (value) {
            return typeof value === 'string' ? value.trim().split(' ')[0] : value;
        };
        /**
         * Prepends the current path to all elements that have an attribute pointing to a `FuncIRI`
         * reference. This is required because WebKit browsers require references to be prefixed with
         * the current path, if the page has a `base` tag.
         */
        MatIcon.prototype._prependPathToReferences = function (path) {
            var elements = this._elementsWithExternalReferences;
            if (elements) {
                elements.forEach(function (attrs, element) {
                    attrs.forEach(function (attr) {
                        element.setAttribute(attr.name, "url('" + path + "#" + attr.value + "')");
                    });
                });
            }
        };
        /**
         * Caches the children of an SVG element that have `url()`
         * references that we need to prefix with the current path.
         */
        MatIcon.prototype._cacheChildrenWithExternalReferences = function (element) {
            var elementsWithFuncIri = element.querySelectorAll(funcIriAttributeSelector);
            var elements = this._elementsWithExternalReferences =
                this._elementsWithExternalReferences || new Map();
            var _loop_1 = function (i) {
                funcIriAttributes.forEach(function (attr) {
                    var elementWithReference = elementsWithFuncIri[i];
                    var value = elementWithReference.getAttribute(attr);
                    var match = value ? value.match(funcIriPattern) : null;
                    if (match) {
                        var attributes = elements.get(elementWithReference);
                        if (!attributes) {
                            attributes = [];
                            elements.set(elementWithReference, attributes);
                        }
                        attributes.push({ name: attr, value: match[1] });
                    }
                });
            };
            for (var i = 0; i < elementsWithFuncIri.length; i++) {
                _loop_1(i);
            }
        };
        /** Sets a new SVG icon with a particular name. */
        MatIcon.prototype._updateSvgIcon = function (rawName) {
            var _this = this;
            this._svgNamespace = null;
            this._svgName = null;
            this._currentIconFetch.unsubscribe();
            if (rawName) {
                var _a = __read(this._splitIconName(rawName), 2), namespace_1 = _a[0], iconName_1 = _a[1];
                if (namespace_1) {
                    this._svgNamespace = namespace_1;
                }
                if (iconName_1) {
                    this._svgName = iconName_1;
                }
                this._currentIconFetch = this._iconRegistry.getNamedSvgIcon(iconName_1, namespace_1)
                    .pipe(operators.take(1))
                    .subscribe(function (svg) { return _this._setSvgElement(svg); }, function (err) {
                    var errorMessage = "Error retrieving icon " + namespace_1 + ":" + iconName_1 + "! " + err.message;
                    _this._errorHandler.handleError(new Error(errorMessage));
                });
            }
        };
        return MatIcon;
    }(_MatIconMixinBase));
    MatIcon.decorators = [
        { type: i0.Component, args: [{
                    template: '<ng-content></ng-content>',
                    selector: 'mat-icon',
                    exportAs: 'matIcon',
                    inputs: ['color'],
                    host: {
                        'role': 'img',
                        'class': 'mat-icon notranslate',
                        '[attr.data-mat-icon-type]': '_usingFontIcon() ? "font" : "svg"',
                        '[attr.data-mat-icon-name]': '_svgName || fontIcon',
                        '[attr.data-mat-icon-namespace]': '_svgNamespace || fontSet',
                        '[class.mat-icon-inline]': 'inline',
                        '[class.mat-icon-no-color]': 'color !== "primary" && color !== "accent" && color !== "warn"',
                    },
                    encapsulation: i0.ViewEncapsulation.None,
                    changeDetection: i0.ChangeDetectionStrategy.OnPush,
                    styles: [".mat-icon{background-repeat:no-repeat;display:inline-block;fill:currentColor;height:24px;width:24px}.mat-icon.mat-icon-inline{font-size:inherit;height:inherit;line-height:inherit;width:inherit}[dir=rtl] .mat-icon-rtl-mirror{transform:scale(-1, 1)}.mat-form-field:not(.mat-form-field-appearance-legacy) .mat-form-field-prefix .mat-icon,.mat-form-field:not(.mat-form-field-appearance-legacy) .mat-form-field-suffix .mat-icon{display:block}.mat-form-field:not(.mat-form-field-appearance-legacy) .mat-form-field-prefix .mat-icon-button .mat-icon,.mat-form-field:not(.mat-form-field-appearance-legacy) .mat-form-field-suffix .mat-icon-button .mat-icon{margin:auto}\n"]
                },] }
    ];
    MatIcon.ctorParameters = function () { return [
        { type: i0.ElementRef },
        { type: MatIconRegistry },
        { type: String, decorators: [{ type: i0.Attribute, args: ['aria-hidden',] }] },
        { type: undefined, decorators: [{ type: i0.Inject, args: [MAT_ICON_LOCATION,] }] },
        { type: i0.ErrorHandler }
    ]; };
    MatIcon.propDecorators = {
        inline: [{ type: i0.Input }],
        svgIcon: [{ type: i0.Input }],
        fontSet: [{ type: i0.Input }],
        fontIcon: [{ type: i0.Input }]
    };

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var MatIconModule = /** @class */ (function () {
        function MatIconModule() {
        }
        return MatIconModule;
    }());
    MatIconModule.decorators = [
        { type: i0.NgModule, args: [{
                    imports: [core.MatCommonModule],
                    exports: [MatIcon, core.MatCommonModule],
                    declarations: [MatIcon],
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

    exports.ICON_REGISTRY_PROVIDER = ICON_REGISTRY_PROVIDER;
    exports.ICON_REGISTRY_PROVIDER_FACTORY = ICON_REGISTRY_PROVIDER_FACTORY;
    exports.MAT_ICON_LOCATION = MAT_ICON_LOCATION;
    exports.MAT_ICON_LOCATION_FACTORY = MAT_ICON_LOCATION_FACTORY;
    exports.MatIcon = MatIcon;
    exports.MatIconModule = MatIconModule;
    exports.MatIconRegistry = MatIconRegistry;
    exports.getMatIconFailedToSanitizeLiteralError = getMatIconFailedToSanitizeLiteralError;
    exports.getMatIconFailedToSanitizeUrlError = getMatIconFailedToSanitizeUrlError;
    exports.getMatIconNameNotFoundError = getMatIconNameNotFoundError;
    exports.getMatIconNoHttpProviderError = getMatIconNoHttpProviderError;
    exports.ɵ0 = ɵ0;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=material-icon.umd.js.map
