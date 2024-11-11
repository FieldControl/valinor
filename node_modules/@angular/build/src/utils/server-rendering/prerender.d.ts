/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { BuildOutputFile } from '../../tools/esbuild/bundler-context';
import { BuildOutputAsset } from '../../tools/esbuild/bundler-execution-result';
interface PrerenderOptions {
    routesFile?: string;
    discoverRoutes?: boolean;
}
interface AppShellOptions {
    route?: string;
}
export declare function prerenderPages(workspaceRoot: string, appShellOptions: AppShellOptions | undefined, prerenderOptions: PrerenderOptions | undefined, outputFiles: Readonly<BuildOutputFile[]>, assets: Readonly<BuildOutputAsset[]>, document: string, sourcemap?: boolean, inlineCriticalCss?: boolean, maxThreads?: number, verbose?: boolean): Promise<{
    output: Record<string, string>;
    warnings: string[];
    errors: string[];
    prerenderedRoutes: Set<string>;
}>;
export {};
