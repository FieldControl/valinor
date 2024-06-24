/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import ts from 'typescript';
import { FunctionEntry, ParameterEntry } from './entities';
export type FunctionLike = ts.FunctionDeclaration | ts.MethodDeclaration | ts.MethodSignature | ts.CallSignatureDeclaration | ts.ConstructSignatureDeclaration;
export declare class FunctionExtractor {
    private name;
    private declaration;
    private typeChecker;
    constructor(name: string, declaration: FunctionLike, typeChecker: ts.TypeChecker);
    extract(): FunctionEntry;
    /** Gets all overloads for the function (excluding this extractor's FunctionDeclaration). */
    getOverloads(): ts.FunctionDeclaration[];
    private getSymbol;
}
/** Extracts parameters of the given parameter declaration AST nodes. */
export declare function extractAllParams(params: ts.NodeArray<ts.ParameterDeclaration>, typeChecker: ts.TypeChecker): ParameterEntry[];
