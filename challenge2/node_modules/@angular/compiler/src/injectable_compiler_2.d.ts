/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as o from './output/output_ast';
import { R3DependencyMetadata } from './render3/r3_factory';
import { R3CompiledExpression, R3Reference } from './render3/util';
export interface R3InjectableMetadata {
    name: string;
    type: R3Reference;
    internalType: o.Expression;
    typeArgumentCount: number;
    providedIn: R3ProviderExpression;
    useClass?: R3ProviderExpression;
    useFactory?: o.Expression;
    useExisting?: R3ProviderExpression;
    useValue?: R3ProviderExpression;
    deps?: R3DependencyMetadata[];
}
/**
 * An expression used when instantiating an injectable.
 *
 * This is the type of the `useClass`, `useExisting` and `useValue` properties of
 * `R3InjectableMetadata` since those can refer to types that may eagerly reference types that have
 * not yet been defined.
 */
export interface R3ProviderExpression<T extends o.Expression = o.Expression> {
    /**
     * The expression that is used to instantiate the Injectable.
     */
    expression: T;
    /**
     * If true, then the `expression` contains a reference to something that has not yet been
     * defined.
     *
     * This means that the expression must not be eagerly evaluated. Instead it must be wrapped in a
     * function closure that will be evaluated lazily to allow the definition of the expression to be
     * evaluated first.
     *
     * In some cases the expression will naturally be placed inside such a function closure, such as
     * in a fully compiled factory function. In those case nothing more needs to be done.
     *
     * But in other cases, such as partial-compilation the expression will be located in top level
     * code so will need to be wrapped in a function that is passed to a `forwardRef()` call.
     */
    isForwardRef: boolean;
}
export declare function createR3ProviderExpression<T extends o.Expression>(expression: T, isForwardRef: boolean): R3ProviderExpression<T>;
export declare function compileInjectable(meta: R3InjectableMetadata, resolveForwardRefs: boolean): R3CompiledExpression;
export declare function createInjectableType(meta: R3InjectableMetadata): o.ExpressionType;
