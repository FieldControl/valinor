"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStatsConfig = exports.getWebpackStatsConfig = void 0;
const webpackOutputOptions = {
    all: false,
    colors: true,
    hash: true,
    timings: true,
    chunks: true,
    builtAt: true,
    chunkModules: false,
    children: false,
    modules: false,
    reasons: false,
    warnings: true,
    errors: true,
    assets: true,
    version: false,
    errorDetails: false,
    moduleTrace: false,
};
const verboseWebpackOutputOptions = {
    // The verbose output will most likely be piped to a file, so colors just mess it up.
    colors: false,
    usedExports: true,
    optimizationBailout: true,
    reasons: true,
    children: true,
    assets: true,
    version: true,
    chunkModules: true,
    errorDetails: true,
    moduleTrace: true,
    logging: 'verbose',
};
verboseWebpackOutputOptions['modulesSpace'] = Infinity;
function getWebpackStatsConfig(verbose = false) {
    return verbose
        ? { ...webpackOutputOptions, ...verboseWebpackOutputOptions }
        : webpackOutputOptions;
}
exports.getWebpackStatsConfig = getWebpackStatsConfig;
function getStatsConfig(wco) {
    const verbose = !!wco.buildOptions.verbose;
    return { stats: getWebpackStatsConfig(verbose) };
}
exports.getStatsConfig = getStatsConfig;
