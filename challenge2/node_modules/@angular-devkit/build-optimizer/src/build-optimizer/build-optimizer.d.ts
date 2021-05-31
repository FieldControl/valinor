/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { TransformJavascriptOutput } from '../helpers/transform-javascript';
export interface BuildOptimizerOptions {
    content?: string;
    originalFilePath?: string;
    inputFilePath?: string;
    outputFilePath?: string;
    emitSourceMap?: boolean;
    strict?: boolean;
    isSideEffectFree?: boolean;
    isAngularCoreFile?: boolean;
}
export declare function buildOptimizer(options: BuildOptimizerOptions): TransformJavascriptOutput;
