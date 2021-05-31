"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndexHtmlGenerator = void 0;
const fs = require("fs");
const path_1 = require("path");
const strip_bom_1 = require("../strip-bom");
const augment_index_html_1 = require("./augment-index-html");
const inline_critical_css_1 = require("./inline-critical-css");
const inline_fonts_1 = require("./inline-fonts");
class IndexHtmlGenerator {
    constructor(options) {
        var _a, _b;
        this.options = options;
        const extraPlugins = [];
        if ((_a = this.options.optimization) === null || _a === void 0 ? void 0 : _a.fonts.inline) {
            extraPlugins.push(inlineFontsPlugin(this));
        }
        if ((_b = this.options.optimization) === null || _b === void 0 ? void 0 : _b.styles.inlineCritical) {
            extraPlugins.push(inlineCriticalCssPlugin(this));
        }
        this.plugins = [augmentIndexHtmlPlugin(this), ...extraPlugins, postTransformPlugin(this)];
    }
    async process(options) {
        let content = strip_bom_1.stripBom(await this.readIndex(this.options.indexPath));
        const warnings = [];
        const errors = [];
        for (const plugin of this.plugins) {
            const result = await plugin(content, options);
            if (typeof result === 'string') {
                content = result;
            }
            else {
                content = result.content;
                if (result.warnings.length) {
                    warnings.push(...result.warnings);
                }
                if (result.errors.length) {
                    errors.push(...result.errors);
                }
            }
        }
        return {
            content,
            warnings,
            errors,
        };
    }
    async readAsset(path) {
        return fs.promises.readFile(path, 'utf-8');
    }
    async readIndex(path) {
        return fs.promises.readFile(path, 'utf-8');
    }
}
exports.IndexHtmlGenerator = IndexHtmlGenerator;
function augmentIndexHtmlPlugin(generator) {
    const { deployUrl, crossOrigin, sri = false, entrypoints } = generator.options;
    return async (html, options) => {
        const { lang, baseHref, outputPath = '', noModuleFiles, files, moduleFiles } = options;
        return augment_index_html_1.augmentIndexHtml({
            html,
            baseHref,
            deployUrl,
            crossOrigin,
            sri,
            lang,
            entrypoints,
            loadOutputFile: (filePath) => generator.readAsset(path_1.join(outputPath, filePath)),
            noModuleFiles,
            moduleFiles,
            files,
        });
    };
}
function inlineFontsPlugin({ options }) {
    var _a;
    const inlineFontsProcessor = new inline_fonts_1.InlineFontsProcessor({
        minify: (_a = options.optimization) === null || _a === void 0 ? void 0 : _a.styles.minify,
        WOFFSupportNeeded: options.WOFFSupportNeeded,
    });
    return async (html) => inlineFontsProcessor.process(html);
}
function inlineCriticalCssPlugin(generator) {
    var _a;
    const inlineCriticalCssProcessor = new inline_critical_css_1.InlineCriticalCssProcessor({
        minify: (_a = generator.options.optimization) === null || _a === void 0 ? void 0 : _a.styles.minify,
        deployUrl: generator.options.deployUrl,
        readAsset: (filePath) => generator.readAsset(filePath),
    });
    return async (html, options) => inlineCriticalCssProcessor.process(html, { outputPath: options.outputPath });
}
function postTransformPlugin({ options }) {
    return async (html) => (options.postTransform ? options.postTransform(html) : html);
}
