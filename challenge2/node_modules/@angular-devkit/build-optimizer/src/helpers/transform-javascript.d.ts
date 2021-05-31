/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { RawSourceMap } from 'source-map';
import * as ts from 'typescript';
export declare type TransformerFactoryCreator = (program?: ts.Program) => ts.TransformerFactory<ts.SourceFile>;
export interface TransformJavascriptOptions {
    content: string;
    inputFilePath?: string;
    outputFilePath?: string;
    emitSourceMap?: boolean;
    strict?: boolean;
    typeCheck?: boolean;
    getTransforms: TransformerFactoryCreator[];
}
export interface TransformJavascriptOutput {
    content: string | null;
    sourceMap: RawSourceMap | null;
    emitSkipped: boolean;
}
export declare function transformJavascript(options: TransformJavascriptOptions): TransformJavascriptOutput;
