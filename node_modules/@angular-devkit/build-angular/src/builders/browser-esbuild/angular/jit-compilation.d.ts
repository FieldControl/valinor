/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import ts from 'typescript';
import { AngularHostOptions } from '../angular-host';
export interface EmitFileResult {
    content?: string;
    map?: string;
    dependencies: readonly string[];
}
export type FileEmitter = (file: string) => Promise<EmitFileResult | undefined>;
export declare class JitCompilation {
    #private;
    initialize(rootNames: string[], compilerOptions: ts.CompilerOptions, hostOptions: AngularHostOptions, configurationDiagnostics?: ts.Diagnostic[]): Promise<{
        affectedFiles: ReadonlySet<ts.SourceFile>;
    }>;
    collectDiagnostics(): Iterable<ts.Diagnostic>;
    createFileEmitter(onAfterEmit?: (sourceFile: ts.SourceFile) => void): FileEmitter;
}
