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
const promises_1 = require("node:fs/promises");
const node_path_1 = require("node:path");
const augment_index_html_1 = require("./augment-index-html");
const inline_critical_css_1 = require("./inline-critical-css");
const inline_fonts_1 = require("./inline-fonts");
const style_nonce_1 = require("./style-nonce");
class IndexHtmlGenerator {
    options;
    plugins;
    constructor(options) {
        this.options = options;
        const extraPlugins = [];
        if (this.options.optimization?.fonts.inline) {
            extraPlugins.push(inlineFontsPlugin(this));
        }
        if (this.options.optimization?.styles.inlineCritical) {
            extraPlugins.push(inlineCriticalCssPlugin(this));
        }
        this.plugins = [
            augmentIndexHtmlPlugin(this),
            ...extraPlugins,
            // Runs after the `extraPlugins` to capture any nonce or
            // `style` tags that might've been added by them.
            addStyleNoncePlugin(),
            postTransformPlugin(this),
        ];
    }
    async process(options) {
        let content = await this.readIndex(this.options.indexPath);
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
        try {
            return await (0, promises_1.readFile)(path, 'utf-8');
        }
        catch {
            throw new Error(`Failed to read asset "${path}".`);
        }
    }
    async readIndex(path) {
        try {
            return new TextDecoder('utf-8').decode(await (0, promises_1.readFile)(path));
        }
        catch (cause) {
            throw new Error(`Failed to read index HTML file "${path}".`, { cause });
        }
    }
}
exports.IndexHtmlGenerator = IndexHtmlGenerator;
function augmentIndexHtmlPlugin(generator) {
    const { deployUrl, crossOrigin, sri = false, entrypoints, imageDomains } = generator.options;
    return async (html, options) => {
        const { lang, baseHref, outputPath = '', files, hints } = options;
        return (0, augment_index_html_1.augmentIndexHtml)({
            html,
            baseHref,
            deployUrl,
            crossOrigin,
            sri,
            lang,
            entrypoints,
            loadOutputFile: (filePath) => generator.readAsset((0, node_path_1.join)(outputPath, filePath)),
            imageDomains,
            files,
            hints,
        });
    };
}
function inlineFontsPlugin({ options }) {
    const inlineFontsProcessor = new inline_fonts_1.InlineFontsProcessor({
        minify: options.optimization?.styles.minify,
    });
    return async (html) => inlineFontsProcessor.process(html);
}
function inlineCriticalCssPlugin(generator) {
    const inlineCriticalCssProcessor = new inline_critical_css_1.InlineCriticalCssProcessor({
        minify: generator.options.optimization?.styles.minify,
        deployUrl: generator.options.deployUrl,
        readAsset: (filePath) => generator.readAsset(filePath),
    });
    return async (html, options) => inlineCriticalCssProcessor.process(html, { outputPath: options.outputPath });
}
function addStyleNoncePlugin() {
    return (html) => (0, style_nonce_1.addStyleNonce)(html);
}
function postTransformPlugin({ options }) {
    return async (html) => (options.postTransform ? options.postTransform(html) : html);
}
