"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildOptimizerLoaderPath = void 0;
const webpack_1 = require("webpack");
const build_optimizer_1 = require("./build-optimizer");
exports.buildOptimizerLoaderPath = __filename;
const alwaysProcess = (path) => path.endsWith('.ts') || path.endsWith('.tsx');
function buildOptimizerLoader(content, previousSourceMap) {
    this.cacheable();
    const skipBuildOptimizer = this._module && this._module.factoryMeta && this._module.factoryMeta.skipBuildOptimizer;
    if (!alwaysProcess(this.resourcePath) && skipBuildOptimizer) {
        // Skip loading processing this file with Build Optimizer if we determined in
        // BuildOptimizerWebpackPlugin that we shouldn't.
        this.callback(null, content, previousSourceMap);
        return;
    }
    const options = (this.getOptions() || {});
    const boOutput = build_optimizer_1.buildOptimizer({
        content,
        originalFilePath: this.resourcePath,
        inputFilePath: this.resourcePath,
        outputFilePath: this.resourcePath,
        emitSourceMap: options.sourceMap,
        isSideEffectFree: this._module && this._module.factoryMeta && this._module.factoryMeta.sideEffectFree,
    });
    if (boOutput.emitSkipped || boOutput.content === null) {
        this.callback(null, content, previousSourceMap);
        return;
    }
    const intermediateSourceMap = boOutput.sourceMap;
    let newContent = boOutput.content;
    let newSourceMap;
    if (options.sourceMap && intermediateSourceMap) {
        // Webpack doesn't need sourceMappingURL since we pass them on explicitely.
        newContent = newContent.replace(/^\/\/# sourceMappingURL=[^\r\n]*/gm, '');
        if (previousSourceMap) {
            // Use http://sokra.github.io/source-map-visualization/ to validate sourcemaps make sense.
            newSourceMap = new webpack_1.sources.SourceMapSource(newContent, this.resourcePath, intermediateSourceMap, content, previousSourceMap, true).map();
        }
        else {
            // Otherwise just return our generated sourcemap.
            newSourceMap = intermediateSourceMap;
        }
    }
    this.callback(null, newContent, newSourceMap);
}
exports.default = buildOptimizerLoader;
