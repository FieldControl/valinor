"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
const linker_1 = require("@angular/compiler-cli/linker");
const babel_loader_1 = require("babel-loader");
const typescript_1 = require("typescript");
function requiresLinking(path, source) {
    // @angular/core and @angular/compiler will cause false positives
    // Also, TypeScript files do not require linking
    if (/[\\\/]@angular[\\\/](?:compiler|core)|\.tsx?$/.test(path)) {
        return false;
    }
    return linker_1.needsLinking(path, source);
}
exports.default = babel_loader_1.custom(() => {
    const baseOptions = Object.freeze({
        babelrc: false,
        configFile: false,
        compact: false,
        cacheCompression: false,
        sourceType: 'unambiguous',
        inputSourceMap: false,
    });
    return {
        async customOptions({ i18n, scriptTarget, aot, ...rawOptions }, { source }) {
            // Must process file if plugins are added
            let shouldProcess = Array.isArray(rawOptions.plugins) && rawOptions.plugins.length > 0;
            const customOptions = {
                forceAsyncTransformation: false,
                forceES5: false,
                angularLinker: undefined,
                i18n: undefined,
            };
            // Analyze file for linking
            if (await requiresLinking(this.resourcePath, source)) {
                customOptions.angularLinker = {
                    shouldLink: true,
                    jitMode: aot !== true,
                };
                shouldProcess = true;
            }
            // Analyze for ES target processing
            const esTarget = scriptTarget;
            if (esTarget !== undefined) {
                if (esTarget < typescript_1.ScriptTarget.ES2015) {
                    // TypeScript files will have already been downlevelled
                    customOptions.forceES5 = !/\.tsx?$/.test(this.resourcePath);
                }
                else if (esTarget >= typescript_1.ScriptTarget.ES2017) {
                    customOptions.forceAsyncTransformation =
                        !/[\\\/][_f]?esm2015[\\\/]/.test(this.resourcePath) && source.includes('async');
                }
                shouldProcess || (shouldProcess = customOptions.forceAsyncTransformation || customOptions.forceES5);
            }
            // Analyze for i18n inlining
            if (i18n &&
                !/[\\\/]@angular[\\\/](?:compiler|localize)/.test(this.resourcePath) &&
                source.includes('$localize')) {
                customOptions.i18n = i18n;
                shouldProcess = true;
            }
            // Add provided loader options to default base options
            const loaderOptions = {
                ...baseOptions,
                ...rawOptions,
                cacheIdentifier: JSON.stringify({
                    buildAngular: require('../../package.json').version,
                    customOptions,
                    baseOptions,
                    rawOptions,
                }),
            };
            // Skip babel processing if no actions are needed
            if (!shouldProcess) {
                // Force the current file to be ignored
                loaderOptions.ignore = [() => true];
            }
            return { custom: customOptions, loader: loaderOptions };
        },
        config(configuration, { customOptions }) {
            return {
                ...configuration.options,
                // Workaround for https://github.com/babel/babel-loader/pull/896 is available
                // Delete once the above PR is released
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                inputSourceMap: configuration.options.inputSourceMap || false,
                presets: [
                    ...(configuration.options.presets || []),
                    [
                        require('./presets/application').default,
                        {
                            ...customOptions,
                            diagnosticReporter: (type, message) => {
                                switch (type) {
                                    case 'error':
                                        this.emitError(message);
                                        break;
                                    case 'info':
                                    // Webpack does not currently have an informational diagnostic
                                    case 'warning':
                                        this.emitWarning(message);
                                        break;
                                }
                            },
                        },
                    ],
                ],
            };
        },
    };
});
