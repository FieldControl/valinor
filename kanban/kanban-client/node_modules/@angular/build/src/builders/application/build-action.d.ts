/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { BuilderContext, BuilderOutput } from '@angular-devkit/architect';
import { BuildOutputFile } from '../../tools/esbuild/bundler-context';
import { ExecutionResult, RebuildState } from '../../tools/esbuild/bundler-execution-result';
import { NormalizedCachedOptions } from '../../utils/normalize-cache';
import { NormalizedOutputOptions } from './options';
type BuildActionOutput = (ExecutionResult['outputWithFiles'] | ExecutionResult['output']) & BuilderOutput;
export declare function runEsBuildBuildAction(action: (rebuildState?: RebuildState) => Promise<ExecutionResult>, options: {
    workspaceRoot: string;
    projectRoot: string;
    outputOptions: NormalizedOutputOptions;
    logger: BuilderContext['logger'];
    cacheOptions: NormalizedCachedOptions;
    writeToFileSystem: boolean;
    writeToFileSystemFilter: ((file: BuildOutputFile) => boolean) | undefined;
    watch?: boolean;
    verbose?: boolean;
    progress?: boolean;
    deleteOutputPath?: boolean;
    poll?: number;
    signal?: AbortSignal;
    preserveSymlinks?: boolean;
    clearScreen?: boolean;
    colors?: boolean;
    jsonLogs?: boolean;
}): AsyncIterable<BuildActionOutput>;
export {};
