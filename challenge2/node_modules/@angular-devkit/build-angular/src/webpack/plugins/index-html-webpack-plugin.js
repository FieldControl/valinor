"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndexHtmlWebpackPlugin = void 0;
const path_1 = require("path");
const webpack_1 = require("webpack");
const index_html_generator_1 = require("../../utils/index-file/index-html-generator");
const webpack_diagnostics_1 = require("../../utils/webpack-diagnostics");
const PLUGIN_NAME = 'index-html-webpack-plugin';
class IndexHtmlWebpackPlugin extends index_html_generator_1.IndexHtmlGenerator {
    constructor(options) {
        super(options);
        this.options = options;
    }
    get compilation() {
        if (this._compilation) {
            return this._compilation;
        }
        throw new Error('compilation is undefined.');
    }
    apply(compiler) {
        compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
            this._compilation = compilation;
            compilation.hooks.processAssets.tapPromise({
                name: PLUGIN_NAME,
                stage: webpack_1.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE + 1,
            }, callback);
        });
        const callback = async (assets) => {
            var _a;
            // Get all files for selected entrypoints
            const files = [];
            const noModuleFiles = [];
            const moduleFiles = [];
            try {
                for (const [entryName, entrypoint] of this.compilation.entrypoints) {
                    const entryFiles = (_a = entrypoint === null || entrypoint === void 0 ? void 0 : entrypoint.getFiles()) === null || _a === void 0 ? void 0 : _a.filter((f) => !f.endsWith('.hot-update.js')).map((f) => ({
                        name: entryName,
                        file: f,
                        extension: path_1.extname(f),
                    }));
                    if (!entryFiles) {
                        continue;
                    }
                    if (this.options.noModuleEntrypoints.includes(entryName)) {
                        noModuleFiles.push(...entryFiles);
                    }
                    else if (this.options.moduleEntrypoints.includes(entryName)) {
                        moduleFiles.push(...entryFiles);
                    }
                    else {
                        files.push(...entryFiles);
                    }
                }
                const { content, warnings, errors } = await this.process({
                    files,
                    noModuleFiles,
                    moduleFiles,
                    outputPath: path_1.dirname(this.options.outputPath),
                    baseHref: this.options.baseHref,
                    lang: this.options.lang,
                });
                assets[this.options.outputPath] = new webpack_1.sources.RawSource(content);
                warnings.forEach((msg) => webpack_diagnostics_1.addWarning(this.compilation, msg));
                errors.forEach((msg) => webpack_diagnostics_1.addError(this.compilation, msg));
            }
            catch (error) {
                webpack_diagnostics_1.addError(this.compilation, error.message);
            }
        };
    }
    async readAsset(path) {
        const data = this.compilation.assets[path_1.basename(path)].source();
        return typeof data === 'string' ? data : data.toString();
    }
    async readIndex(path) {
        return new Promise((resolve, reject) => {
            this.compilation.inputFileSystem.readFile(path, (err, data) => {
                var _a;
                if (err) {
                    reject(err);
                    return;
                }
                this.compilation.fileDependencies.add(path);
                resolve((_a = data === null || data === void 0 ? void 0 : data.toString()) !== null && _a !== void 0 ? _a : '');
            });
        });
    }
}
exports.IndexHtmlWebpackPlugin = IndexHtmlWebpackPlugin;
