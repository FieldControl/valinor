"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.InlineCriticalCssProcessor = void 0;
const fs = require("fs");
const Critters = require('critters');
class CrittersExtended extends Critters {
    constructor(optionsExtended) {
        super({
            logger: {
                warn: (s) => this.warnings.push(s),
                error: (s) => this.errors.push(s),
                info: () => { },
            },
            logLevel: 'warn',
            path: optionsExtended.outputPath,
            publicPath: optionsExtended.deployUrl,
            compress: !!optionsExtended.minify,
            pruneSource: false,
            reduceInlineStyles: false,
            mergeStylesheets: false,
            preload: 'media',
            noscriptFallback: true,
            inlineFonts: true,
        });
        this.optionsExtended = optionsExtended;
        this.warnings = [];
        this.errors = [];
    }
    readFile(path) {
        const readAsset = this.optionsExtended.readAsset;
        return readAsset ? readAsset(path) : fs.promises.readFile(path, 'utf-8');
    }
}
class InlineCriticalCssProcessor {
    constructor(options) {
        this.options = options;
    }
    async process(html, options) {
        const critters = new CrittersExtended({ ...this.options, ...options });
        const content = await critters.process(html);
        return {
            // Clean up value from value less attributes.
            // This is caused because parse5 always requires attributes to have a string value.
            // nomodule="" defer="" -> nomodule defer.
            content: content.replace(/(\s(?:defer|nomodule))=""/g, '$1'),
            errors: critters.errors,
            warnings: critters.warnings,
        };
    }
}
exports.InlineCriticalCssProcessor = InlineCriticalCssProcessor;
