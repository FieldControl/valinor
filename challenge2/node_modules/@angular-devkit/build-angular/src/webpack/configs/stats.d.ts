/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { WebpackConfigOptions } from '../../utils/build-options';
export declare function getWebpackStatsConfig(verbose?: boolean): {
    all: boolean;
    colors: boolean;
    hash: boolean;
    timings: boolean;
    chunks: boolean;
    builtAt: boolean;
    chunkModules: boolean;
    children: boolean;
    modules: boolean;
    reasons: boolean;
    warnings: boolean;
    errors: boolean;
    assets: boolean;
    version: boolean;
    errorDetails: boolean;
    moduleTrace: boolean;
};
export declare function getStatsConfig(wco: WebpackConfigOptions): {
    stats: {
        all: boolean;
        colors: boolean;
        hash: boolean;
        timings: boolean;
        chunks: boolean;
        builtAt: boolean;
        chunkModules: boolean;
        children: boolean;
        modules: boolean;
        reasons: boolean;
        warnings: boolean;
        errors: boolean;
        assets: boolean;
        version: boolean;
        errorDetails: boolean;
        moduleTrace: boolean;
    };
};
