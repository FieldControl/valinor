/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as o from '../output/output_ast';
export declare function typeWithParameters(type: o.Expression, numParams: number): o.ExpressionType;
export interface R3Reference {
    value: o.Expression;
    type: o.Expression;
}
/**
 * Result of compilation of a render3 code unit, e.g. component, directive, pipe, etc.
 */
export interface R3CompiledExpression {
    expression: o.Expression;
    type: o.Type;
    statements: o.Statement[];
}
export declare function prepareSyntheticPropertyName(name: string): string;
export declare function prepareSyntheticListenerName(name: string, phase: string): string;
export declare function getSafePropertyAccessString(accessor: string, name: string): string;
export declare function prepareSyntheticListenerFunctionName(name: string, phase: string): string;
export declare function jitOnlyGuardedExpression(expr: o.Expression): o.Expression;
export declare function devOnlyGuardedExpression(expr: o.Expression): o.Expression;
export declare function guardedExpression(guard: string, expr: o.Expression): o.Expression;
export declare function wrapReference(value: any): R3Reference;
export declare function refsToArray(refs: R3Reference[], shouldForwardDeclare: boolean): o.Expression;
