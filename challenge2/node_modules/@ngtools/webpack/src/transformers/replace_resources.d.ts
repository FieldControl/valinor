/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';
export declare function replaceResources(shouldTransform: (fileName: string) => boolean, getTypeChecker: () => ts.TypeChecker, directTemplateLoading?: boolean, inlineStyleMimeType?: string): ts.TransformerFactory<ts.SourceFile>;
export declare function getResourceUrl(node: ts.Node, loader?: string): string | null;
export declare function workaroundStylePreprocessing(sourceFile: ts.SourceFile): void;
