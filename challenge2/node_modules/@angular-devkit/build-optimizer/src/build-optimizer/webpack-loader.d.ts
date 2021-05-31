/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { RawSourceMap } from 'source-map';
export declare const buildOptimizerLoaderPath: string;
export default function buildOptimizerLoader(this: {
    resourcePath: string;
    _module: {
        factoryMeta: {
            skipBuildOptimizer?: boolean;
            sideEffectFree?: boolean;
        };
    };
    cacheable(): void;
    callback(error?: Error | null, content?: string, sourceMap?: unknown): void;
    getOptions(): unknown;
}, content: string, previousSourceMap: RawSourceMap): void;
