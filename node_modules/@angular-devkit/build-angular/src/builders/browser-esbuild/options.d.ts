/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { BuilderContext } from '@angular-devkit/architect';
import { Schema as BrowserBuilderOptions } from './schema';
export type NormalizedBrowserOptions = Awaited<ReturnType<typeof normalizeOptions>>;
/**
 * Normalize the user provided options by creating full paths for all path based options
 * and converting multi-form options into a single form that can be directly used
 * by the build process.
 *
 * @param context The context for current builder execution.
 * @param projectName The name of the project for the current execution.
 * @param options An object containing the options to use for the build.
 * @returns An object containing normalized options required to perform the build.
 */
export declare function normalizeOptions(context: BuilderContext, projectName: string, options: BrowserBuilderOptions): Promise<{
    advancedOptimizations: boolean | undefined;
    allowedCommonJsDependencies: string[] | undefined;
    baseHref: string | undefined;
    cacheOptions: import("../../utils/normalize-cache").NormalizedCachedOptions;
    crossOrigin: import("./schema").CrossOrigin | undefined;
    externalDependencies: string[] | undefined;
    extractLicenses: boolean | undefined;
    inlineStyleLanguage: string;
    jit: boolean;
    stats: boolean;
    poll: number | undefined;
    preserveSymlinks: boolean;
    stylePreprocessorOptions: import("./schema").StylePreprocessorOptions | undefined;
    subresourceIntegrity: boolean | undefined;
    verbose: boolean | undefined;
    watch: boolean | undefined;
    workspaceRoot: string;
    entryPoints: Record<string, string>;
    optimizationOptions: import("../../utils").NormalizedOptimizationOptions;
    outputPath: string;
    sourcemapOptions: import("../..").SourceMapObject;
    tsconfig: string;
    projectRoot: string;
    assets: import("../..").AssetPatternObject[] | undefined;
    outputNames: {
        bundles: string;
        media: string;
    };
    fileReplacements: Record<string, string> | undefined;
    globalStyles: {
        name: string;
        files: string[];
        initial: boolean;
    }[];
    serviceWorkerOptions: string | undefined;
    indexHtmlOptions: {
        input: string;
        output: string;
        insertionOrder: import("../../utils/package-chunk-sort").EntryPointsType[];
    } | undefined;
}>;
