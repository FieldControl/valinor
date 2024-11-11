/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { SourceFileCache } from '../../tools/esbuild/angular/source-file-cache';
import { BundlerContext } from '../../tools/esbuild/bundler-context';
import { NormalizedApplicationBuildOptions } from './options';
/**
 * Generates one or more BundlerContext instances based on the builder provided
 * configuration.
 * @param options The normalized application builder options to use.
 * @param browsers An string array of browserslist browsers to support.
 * @param codeBundleCache An instance of the TypeScript source file cache.
 * @returns An array of BundlerContext objects.
 */
export declare function setupBundlerContexts(options: NormalizedApplicationBuildOptions, browsers: string[], codeBundleCache: SourceFileCache): BundlerContext[];
