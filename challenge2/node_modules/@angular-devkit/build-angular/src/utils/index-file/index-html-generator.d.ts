/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { NormalizedOptimizationOptions } from '../normalize-optimization';
import { CrossOriginValue, FileInfo } from './augment-index-html';
export interface IndexHtmlGeneratorProcessOptions {
    lang: string | undefined;
    baseHref: string | undefined;
    outputPath: string;
    files: FileInfo[];
    noModuleFiles: FileInfo[];
    moduleFiles: FileInfo[];
}
export interface IndexHtmlGeneratorOptions {
    indexPath: string;
    deployUrl?: string;
    sri?: boolean;
    entrypoints: string[];
    postTransform?: IndexHtmlTransform;
    crossOrigin?: CrossOriginValue;
    optimization?: NormalizedOptimizationOptions;
    WOFFSupportNeeded: boolean;
}
export declare type IndexHtmlTransform = (content: string) => Promise<string>;
export interface IndexHtmlTransformResult {
    content: string;
    warnings: string[];
    errors: string[];
}
export declare class IndexHtmlGenerator {
    readonly options: IndexHtmlGeneratorOptions;
    private readonly plugins;
    constructor(options: IndexHtmlGeneratorOptions);
    process(options: IndexHtmlGeneratorProcessOptions): Promise<IndexHtmlTransformResult>;
    readAsset(path: string): Promise<string>;
    protected readIndex(path: string): Promise<string>;
}
