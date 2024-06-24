/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import type { BuildOptions } from 'esbuild';
import type { NormalizedApplicationBuildOptions } from '../../builders/application/options';
import { SourceFileCache } from './angular/source-file-cache';
import { BundlerOptionsFactory } from './bundler-context';
export declare function createBrowserCodeBundleOptions(options: NormalizedApplicationBuildOptions, target: string[], sourceFileCache?: SourceFileCache): BuildOptions;
export declare function createBrowserPolyfillBundleOptions(options: NormalizedApplicationBuildOptions, target: string[], sourceFileCache?: SourceFileCache): BuildOptions | BundlerOptionsFactory | undefined;
/**
 * Create an esbuild 'build' options object for the server bundle.
 * @param options The builder's user-provider normalized options.
 * @returns An esbuild BuildOptions object.
 */
export declare function createServerCodeBundleOptions(options: NormalizedApplicationBuildOptions, target: string[], sourceFileCache: SourceFileCache): BuildOptions;
export declare function createServerPolyfillBundleOptions(options: NormalizedApplicationBuildOptions, target: string[], sourceFileCache?: SourceFileCache): BundlerOptionsFactory | undefined;
