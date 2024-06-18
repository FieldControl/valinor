/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import type { Message, PartialMessage } from 'esbuild';
import type { ChangedFiles } from '../../tools/esbuild/watcher';
import type { SourceFileCache } from './angular/source-file-cache';
import type { BuildOutputFile, BuildOutputFileType, BundlerContext } from './bundler-context';
export interface BuildOutputAsset {
    source: string;
    destination: string;
}
export interface RebuildState {
    rebuildContexts: BundlerContext[];
    codeBundleCache?: SourceFileCache;
    fileChanges: ChangedFiles;
    previousOutputHashes: Map<string, string>;
}
export interface ExternalResultMetadata {
    implicitBrowser: string[];
    implicitServer: string[];
    explicit: string[];
}
/**
 * Represents the result of a single builder execute call.
 */
export declare class ExecutionResult {
    private rebuildContexts;
    private codeBundleCache?;
    outputFiles: BuildOutputFile[];
    assetFiles: BuildOutputAsset[];
    errors: (Message | PartialMessage)[];
    prerenderedRoutes: string[];
    warnings: (Message | PartialMessage)[];
    logs: string[];
    externalMetadata?: ExternalResultMetadata;
    extraWatchFiles: string[];
    constructor(rebuildContexts: BundlerContext[], codeBundleCache?: SourceFileCache | undefined);
    addOutputFile(path: string, content: string, type: BuildOutputFileType): void;
    addAssets(assets: BuildOutputAsset[]): void;
    addLog(value: string): void;
    addError(error: PartialMessage | string): void;
    addErrors(errors: (PartialMessage | string)[]): void;
    addPrerenderedRoutes(routes: string[]): void;
    addWarning(error: PartialMessage | string): void;
    addWarnings(errors: (PartialMessage | string)[]): void;
    /**
     * Add external JavaScript import metadata to the result. This is currently used
     * by the development server to optimize the prebundling process.
     * @param implicitBrowser External dependencies for the browser bundles due to the external packages option.
     * @param implicitServer External dependencies for the server bundles due to the external packages option.
     * @param explicit External dependencies due to explicit project configuration.
     */
    setExternalMetadata(implicitBrowser: string[], implicitServer: string[], explicit: string[] | undefined): void;
    get output(): {
        success: boolean;
    };
    get outputWithFiles(): {
        success: boolean;
        outputFiles: BuildOutputFile[];
        assetFiles: BuildOutputAsset[];
        errors: (Message | PartialMessage)[];
        externalMetadata: ExternalResultMetadata | undefined;
    };
    get watchFiles(): string[];
    createRebuildState(fileChanges: ChangedFiles): RebuildState;
    findChangedFiles(previousOutputHashes: Map<string, string>): Set<string>;
    dispose(): Promise<void>;
}
