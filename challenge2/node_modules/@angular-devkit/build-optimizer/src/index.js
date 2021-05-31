"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getScrubFileTransformerForCore = exports.getScrubFileTransformer = exports.getWrapEnumsTransformer = exports.getPrefixFunctionsTransformer = exports.getPrefixClassesTransformer = exports.transformJavascript = exports.buildOptimizer = exports.BuildOptimizerWebpackPlugin = exports.buildOptimizerLoaderPath = exports.buildOptimizerLoader = void 0;
const scrub_file_1 = require("./transforms/scrub-file");
var webpack_loader_1 = require("./build-optimizer/webpack-loader");
Object.defineProperty(exports, "buildOptimizerLoader", { enumerable: true, get: function () { return webpack_loader_1.default; } });
Object.defineProperty(exports, "buildOptimizerLoaderPath", { enumerable: true, get: function () { return webpack_loader_1.buildOptimizerLoaderPath; } });
var webpack_plugin_1 = require("./build-optimizer/webpack-plugin");
Object.defineProperty(exports, "BuildOptimizerWebpackPlugin", { enumerable: true, get: function () { return webpack_plugin_1.BuildOptimizerWebpackPlugin; } });
var build_optimizer_1 = require("./build-optimizer/build-optimizer");
Object.defineProperty(exports, "buildOptimizer", { enumerable: true, get: function () { return build_optimizer_1.buildOptimizer; } });
var transform_javascript_1 = require("./helpers/transform-javascript");
Object.defineProperty(exports, "transformJavascript", { enumerable: true, get: function () { return transform_javascript_1.transformJavascript; } });
var prefix_classes_1 = require("./transforms/prefix-classes");
Object.defineProperty(exports, "getPrefixClassesTransformer", { enumerable: true, get: function () { return prefix_classes_1.getPrefixClassesTransformer; } });
var prefix_functions_1 = require("./transforms/prefix-functions");
Object.defineProperty(exports, "getPrefixFunctionsTransformer", { enumerable: true, get: function () { return prefix_functions_1.getPrefixFunctionsTransformer; } });
var wrap_enums_1 = require("./transforms/wrap-enums");
Object.defineProperty(exports, "getWrapEnumsTransformer", { enumerable: true, get: function () { return wrap_enums_1.getWrapEnumsTransformer; } });
function getScrubFileTransformer(program) {
    return scrub_file_1.createScrubFileTransformerFactory(false)(program);
}
exports.getScrubFileTransformer = getScrubFileTransformer;
function getScrubFileTransformerForCore(program) {
    return scrub_file_1.createScrubFileTransformerFactory(true)(program);
}
exports.getScrubFileTransformerForCore = getScrubFileTransformerForCore;
