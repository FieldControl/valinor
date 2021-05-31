"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTestConfig = void 0;
const glob = require("glob");
const path = require("path");
const helpers_1 = require("../utils/helpers");
function getTestConfig(wco) {
    const { buildOptions: { codeCoverage, codeCoverageExclude, main, sourceMap }, root, sourceRoot, } = wco;
    const extraRules = [];
    const extraPlugins = [];
    if (codeCoverage) {
        const exclude = [/\.(e2e|spec)\.tsx?$/, /node_modules/];
        if (codeCoverageExclude) {
            for (const excludeGlob of codeCoverageExclude) {
                glob
                    .sync(path.join(root, excludeGlob), { nodir: true })
                    .forEach((file) => exclude.push(path.normalize(file)));
            }
        }
        extraRules.push({
            test: /\.(jsx?|tsx?)$/,
            loader: require.resolve('@jsdevtools/coverage-istanbul-loader'),
            options: { esModules: true },
            enforce: 'post',
            exclude,
            include: sourceRoot,
        });
    }
    if (sourceMap.scripts || sourceMap.styles) {
        extraPlugins.push(helpers_1.getSourceMapDevTool(sourceMap.scripts, sourceMap.styles, false, true));
    }
    return {
        mode: 'development',
        resolve: {
            mainFields: ['es2015', 'browser', 'module', 'main'],
        },
        devtool: false,
        entry: {
            main: path.resolve(root, main),
        },
        module: {
            rules: extraRules,
        },
        plugins: extraPlugins,
        optimization: {
            splitChunks: {
                chunks: (chunk) => !helpers_1.isPolyfillsEntry(chunk.name),
                cacheGroups: {
                    vendors: false,
                    defaultVendors: {
                        name: 'vendor',
                        chunks: (chunk) => chunk.name === 'main',
                        enforce: true,
                        test: /[\\/]node_modules[\\/]/,
                    },
                },
            },
        },
    };
}
exports.getTestConfig = getTestConfig;
