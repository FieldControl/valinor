/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import ts from 'typescript';
/** Type of `ts.factory.CreateParameterDeclaration` in TS 4.9+. */
type Ts49CreateParameterDeclarationFn = (modifiers: readonly ts.ModifierLike[] | undefined, dotDotDotToken: ts.DotDotDotToken | undefined, name: string | ts.BindingName, questionToken?: ts.QuestionToken | undefined, type?: ts.TypeNode | undefined, initializer?: ts.Expression) => ts.ParameterDeclaration;
/**
 * Creates a `ts.ParameterDeclaration` declaration.
 *
 * TODO(crisbeto): this is a backwards-compatibility layer for versions of TypeScript less than 4.9.
 * We should remove it once we have dropped support for the older versions.
 */
export declare const createParameterDeclaration: Ts49CreateParameterDeclarationFn;
/** Type of `ts.factory.createImportDeclaration` in TS 4.9+. */
type Ts49CreateImportDeclarationFn = (modifiers: readonly ts.Modifier[] | undefined, importClause: ts.ImportClause | undefined, moduleSpecifier: ts.Expression, assertClause?: ts.AssertClause) => ts.ImportDeclaration;
/**
 * Creates a `ts.ImportDeclaration` declaration.
 *
 * TODO(crisbeto): this is a backwards-compatibility layer for versions of TypeScript less than 4.9.
 * We should remove it once we have dropped support for the older versions.
 */
export declare const createImportDeclaration: Ts49CreateImportDeclarationFn;
/** Type of `ts.factory.createFunctionDeclaration` in TS 4.9+. */
type Ts49CreateFunctionDeclarationFn = (modifiers: readonly ts.ModifierLike[] | undefined, asteriskToken: ts.AsteriskToken | undefined, name: string | ts.Identifier | undefined, typeParameters: readonly ts.TypeParameterDeclaration[] | undefined, parameters: readonly ts.ParameterDeclaration[], type: ts.TypeNode | undefined, body: ts.Block | undefined) => ts.FunctionDeclaration;
/**
 * Creates a `ts.FunctionDeclaration` declaration.
 *
 * TODO(crisbeto): this is a backwards-compatibility layer for versions of TypeScript less than 4.9.
 * We should remove it once we have dropped support for the older versions.
 */
export declare const createFunctionDeclaration: Ts49CreateFunctionDeclarationFn;
/** Type of `ts.factory.createIndexSignature` in TS 4.9+. */
type Ts49CreateIndexSignatureFn = (modifiers: readonly ts.Modifier[] | undefined, parameters: readonly ts.ParameterDeclaration[], type: ts.TypeNode) => ts.IndexSignatureDeclaration;
/**
 * Creates a `ts.IndexSignatureDeclaration` declaration.
 *
 * TODO(crisbeto): this is a backwards-compatibility layer for versions of TypeScript less than 4.9.
 * We should remove it once we have dropped support for the older versions.
 */
export declare const createIndexSignature: Ts49CreateIndexSignatureFn;
export {};
