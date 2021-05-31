/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Path } from '@angular-devkit/core';
import { AssetPatternClass, Schema as BrowserBuilderSchema, SourceMapClass } from '../browser/schema';
import { BuildOptions } from './build-options';
import { NormalizedFileReplacement } from './normalize-file-replacements';
import { NormalizedOptimizationOptions } from './normalize-optimization';
/**
 * A normalized browser builder schema.
 */
export declare type NormalizedBrowserBuilderSchema = BrowserBuilderSchema & BuildOptions & {
    sourceMap: SourceMapClass;
    assets: AssetPatternClass[];
    fileReplacements: NormalizedFileReplacement[];
    optimization: NormalizedOptimizationOptions;
};
export declare function normalizeBrowserSchema(root: Path, projectRoot: Path, sourceRoot: Path | undefined, options: BrowserBuilderSchema): NormalizedBrowserBuilderSchema;
