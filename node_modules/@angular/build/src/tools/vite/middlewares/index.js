"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAngularSSRMiddleware = exports.createAngularIndexHtmlMiddleware = exports.angularHtmlFallbackMiddleware = exports.createAngularAssetsMiddleware = void 0;
var assets_middleware_1 = require("./assets-middleware");
Object.defineProperty(exports, "createAngularAssetsMiddleware", { enumerable: true, get: function () { return assets_middleware_1.createAngularAssetsMiddleware; } });
var html_fallback_middleware_1 = require("./html-fallback-middleware");
Object.defineProperty(exports, "angularHtmlFallbackMiddleware", { enumerable: true, get: function () { return html_fallback_middleware_1.angularHtmlFallbackMiddleware; } });
var index_html_middleware_1 = require("./index-html-middleware");
Object.defineProperty(exports, "createAngularIndexHtmlMiddleware", { enumerable: true, get: function () { return index_html_middleware_1.createAngularIndexHtmlMiddleware; } });
var ssr_middleware_1 = require("./ssr-middleware");
Object.defineProperty(exports, "createAngularSSRMiddleware", { enumerable: true, get: function () { return ssr_middleware_1.createAngularSSRMiddleware; } });
