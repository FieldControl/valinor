/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Compilation } from 'webpack';
export declare class WebpackResourceLoader {
    private _parentCompilation?;
    private _fileDependencies;
    private _reverseDependencies;
    private fileCache?;
    private inlineCache?;
    private assetCache?;
    private modifiedResources;
    private outputPathCounter;
    constructor(shouldCache: boolean);
    update(parentCompilation: Compilation, changedFiles?: Iterable<string>): void;
    clearParentCompilation(): void;
    getModifiedResourceFiles(): Set<string>;
    getResourceDependencies(filePath: string): Set<string> | never[];
    getAffectedResources(file: string): Set<string> | never[];
    setAffectedResources(file: string, resources: Iterable<string>): void;
    private _compile;
    private _evaluate;
    get(filePath: string): Promise<string>;
    process(data: string, mimeType: string, resourceType: 'template' | 'style', containingFile?: string): Promise<string>;
}
