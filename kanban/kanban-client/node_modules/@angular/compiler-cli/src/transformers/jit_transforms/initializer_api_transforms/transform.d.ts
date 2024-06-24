/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import ts from 'typescript';
import { ImportedSymbolsTracker } from '../../../ngtsc/imports';
import { ReflectionHost } from '../../../ngtsc/reflection';
/**
 * Creates an AST transform that looks for Angular classes and transforms
 * initializer-based declared members to work with JIT compilation.
 *
 * For example, an `input()` member may be transformed to add an `@Input`
 * decorator for JIT.
 */
export declare function getInitializerApiJitTransform(host: ReflectionHost, importTracker: ImportedSymbolsTracker, isCore: boolean): ts.TransformerFactory<ts.SourceFile>;
