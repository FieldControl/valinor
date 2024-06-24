/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import ts from 'typescript';
import type { ImportManager } from './import_manager';
/**
 * Creates a TypeScript transform for the given import manager.
 *
 *  - The transform updates existing imports with new symbols to be added.
 *  - The transform adds new necessary imports.
 *  - The transform inserts additional optional statements after imports.
 */
export declare function createTsTransformForImportManager(manager: ImportManager, extraStatementsForFiles?: Map<string, ts.Statement[]>): ts.TransformerFactory<ts.SourceFile>;
