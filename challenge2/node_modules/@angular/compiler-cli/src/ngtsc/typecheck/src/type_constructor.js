/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/src/ngtsc/typecheck/src/type_constructor", ["require", "exports", "tslib", "typescript", "@angular/compiler-cli/src/ngtsc/typecheck/src/tcb_util", "@angular/compiler-cli/src/ngtsc/typecheck/src/ts_util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.requiresInlineTypeCtor = exports.generateInlineTypeCtor = exports.generateTypeCtorDeclarationFn = void 0;
    var tslib_1 = require("tslib");
    var ts = require("typescript");
    var tcb_util_1 = require("@angular/compiler-cli/src/ngtsc/typecheck/src/tcb_util");
    var ts_util_1 = require("@angular/compiler-cli/src/ngtsc/typecheck/src/ts_util");
    function generateTypeCtorDeclarationFn(node, meta, nodeTypeRef, typeParams, reflector) {
        if (requiresInlineTypeCtor(node, reflector)) {
            throw new Error(node.name.text + " requires an inline type constructor");
        }
        var rawTypeArgs = typeParams !== undefined ? generateGenericArgs(typeParams) : undefined;
        var rawType = ts.createTypeReferenceNode(nodeTypeRef, rawTypeArgs);
        var initParam = constructTypeCtorParameter(node, meta, rawType);
        var typeParameters = typeParametersWithDefaultTypes(typeParams);
        if (meta.body) {
            var fnType = ts.createFunctionTypeNode(
            /* typeParameters */ typeParameters, 
            /* parameters */ [initParam], 
            /* type */ rawType);
            var decl = ts.createVariableDeclaration(
            /* name */ meta.fnName, 
            /* type */ fnType, 
            /* body */ ts.createNonNullExpression(ts.createNull()));
            var declList = ts.createVariableDeclarationList([decl], ts.NodeFlags.Const);
            return ts.createVariableStatement(
            /* modifiers */ undefined, 
            /* declarationList */ declList);
        }
        else {
            return ts.createFunctionDeclaration(
            /* decorators */ undefined, 
            /* modifiers */ [ts.createModifier(ts.SyntaxKind.DeclareKeyword)], 
            /* asteriskToken */ undefined, 
            /* name */ meta.fnName, 
            /* typeParameters */ typeParameters, 
            /* parameters */ [initParam], 
            /* type */ rawType, 
            /* body */ undefined);
        }
    }
    exports.generateTypeCtorDeclarationFn = generateTypeCtorDeclarationFn;
    /**
     * Generate an inline type constructor for the given class and metadata.
     *
     * An inline type constructor is a specially shaped TypeScript static method, intended to be placed
     * within a directive class itself, that permits type inference of any generic type parameters of
     * the class from the types of expressions bound to inputs or outputs, and the types of elements
     * that match queries performed by the directive. It also catches any errors in the types of these
     * expressions. This method is never called at runtime, but is used in type-check blocks to
     * construct directive types.
     *
     * An inline type constructor for NgFor looks like:
     *
     * static ngTypeCtor<T>(init: Pick<NgForOf<T>, 'ngForOf'|'ngForTrackBy'|'ngForTemplate'>):
     *   NgForOf<T>;
     *
     * A typical constructor would be:
     *
     * NgForOf.ngTypeCtor(init: {
     *   ngForOf: ['foo', 'bar'],
     *   ngForTrackBy: null as any,
     *   ngForTemplate: null as any,
     * }); // Infers a type of NgForOf<string>.
     *
     * Any inputs declared on the type for which no property binding is present are assigned a value of
     * type `any`, to avoid producing any type errors for unset inputs.
     *
     * Inline type constructors are used when the type being created has bounded generic types which
     * make writing a declared type constructor (via `generateTypeCtorDeclarationFn`) difficult or
     * impossible.
     *
     * @param node the `ClassDeclaration<ts.ClassDeclaration>` for which a type constructor will be
     * generated.
     * @param meta additional metadata required to generate the type constructor.
     * @returns a `ts.MethodDeclaration` for the type constructor.
     */
    function generateInlineTypeCtor(node, meta) {
        // Build rawType, a `ts.TypeNode` of the class with its generic parameters passed through from
        // the definition without any type bounds. For example, if the class is
        // `FooDirective<T extends Bar>`, its rawType would be `FooDirective<T>`.
        var rawTypeArgs = node.typeParameters !== undefined ? generateGenericArgs(node.typeParameters) : undefined;
        var rawType = ts.createTypeReferenceNode(node.name, rawTypeArgs);
        var initParam = constructTypeCtorParameter(node, meta, rawType);
        // If this constructor is being generated into a .ts file, then it needs a fake body. The body
        // is set to a return of `null!`. If the type constructor is being generated into a .d.ts file,
        // it needs no body.
        var body = undefined;
        if (meta.body) {
            body = ts.createBlock([
                ts.createReturn(ts.createNonNullExpression(ts.createNull())),
            ]);
        }
        // Create the type constructor method declaration.
        return ts.createMethod(
        /* decorators */ undefined, 
        /* modifiers */ [ts.createModifier(ts.SyntaxKind.StaticKeyword)], 
        /* asteriskToken */ undefined, 
        /* name */ meta.fnName, 
        /* questionToken */ undefined, 
        /* typeParameters */ typeParametersWithDefaultTypes(node.typeParameters), 
        /* parameters */ [initParam], 
        /* type */ rawType, 
        /* body */ body);
    }
    exports.generateInlineTypeCtor = generateInlineTypeCtor;
    function constructTypeCtorParameter(node, meta, rawType) {
        var e_1, _a;
        // initType is the type of 'init', the single argument to the type constructor method.
        // If the Directive has any inputs, its initType will be:
        //
        // Pick<rawType, 'inputA'|'inputB'>
        //
        // Pick here is used to select only those fields from which the generic type parameters of the
        // directive will be inferred.
        //
        // In the special case there are no inputs, initType is set to {}.
        var initType = null;
        var keys = meta.fields.inputs;
        var plainKeys = [];
        var coercedKeys = [];
        try {
            for (var keys_1 = tslib_1.__values(keys), keys_1_1 = keys_1.next(); !keys_1_1.done; keys_1_1 = keys_1.next()) {
                var key = keys_1_1.value;
                if (!meta.coercedInputFields.has(key)) {
                    plainKeys.push(ts.createLiteralTypeNode(ts.createStringLiteral(key)));
                }
                else {
                    coercedKeys.push(ts.createPropertySignature(
                    /* modifiers */ undefined, 
                    /* name */ key, 
                    /* questionToken */ undefined, 
                    /* type */ ts_util_1.tsCreateTypeQueryForCoercedInput(rawType.typeName, key), 
                    /* initializer */ undefined));
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (keys_1_1 && !keys_1_1.done && (_a = keys_1.return)) _a.call(keys_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        if (plainKeys.length > 0) {
            // Construct a union of all the field names.
            var keyTypeUnion = ts.createUnionTypeNode(plainKeys);
            // Construct the Pick<rawType, keyTypeUnion>.
            initType = ts.createTypeReferenceNode('Pick', [rawType, keyTypeUnion]);
        }
        if (coercedKeys.length > 0) {
            var coercedLiteral = ts.createTypeLiteralNode(coercedKeys);
            initType = initType !== null ? ts.createIntersectionTypeNode([initType, coercedLiteral]) :
                coercedLiteral;
        }
        if (initType === null) {
            // Special case - no inputs, outputs, or other fields which could influence the result type.
            initType = ts.createTypeLiteralNode([]);
        }
        // Create the 'init' parameter itself.
        return ts.createParameter(
        /* decorators */ undefined, 
        /* modifiers */ undefined, 
        /* dotDotDotToken */ undefined, 
        /* name */ 'init', 
        /* questionToken */ undefined, 
        /* type */ initType, 
        /* initializer */ undefined);
    }
    function generateGenericArgs(params) {
        return params.map(function (param) { return ts.createTypeReferenceNode(param.name, undefined); });
    }
    function requiresInlineTypeCtor(node, host) {
        // The class requires an inline type constructor if it has generic type bounds that can not be
        // emitted into a different context.
        return !tcb_util_1.checkIfGenericTypeBoundsAreContextFree(node, host);
    }
    exports.requiresInlineTypeCtor = requiresInlineTypeCtor;
    /**
     * Add a default `= any` to type parameters that don't have a default value already.
     *
     * TypeScript uses the default type of a type parameter whenever inference of that parameter fails.
     * This can happen when inferring a complex type from 'any'. For example, if `NgFor`'s inference is
     * done with the TCB code:
     *
     * ```
     * class NgFor<T> {
     *   ngForOf: T[];
     * }
     *
     * declare function ctor<T>(o: Pick<NgFor<T>, 'ngForOf'|'ngForTrackBy'|'ngForTemplate'>): NgFor<T>;
     * ```
     *
     * An invocation looks like:
     *
     * ```
     * var _t1 = ctor({ngForOf: [1, 2], ngForTrackBy: null as any, ngForTemplate: null as any});
     * ```
     *
     * This correctly infers the type `NgFor<number>` for `_t1`, since `T` is inferred from the
     * assignment of type `number[]` to `ngForOf`'s type `T[]`. However, if `any` is passed instead:
     *
     * ```
     * var _t2 = ctor({ngForOf: [1, 2] as any, ngForTrackBy: null as any, ngForTemplate: null as any});
     * ```
     *
     * then inference for `T` fails (it cannot be inferred from `T[] = any`). In this case, `T` takes
     * the type `{}`, and so `_t2` is inferred as `NgFor<{}>`. This is obviously wrong.
     *
     * Adding a default type to the generic declaration in the constructor solves this problem, as the
     * default type will be used in the event that inference fails.
     *
     * ```
     * declare function ctor<T = any>(o: Pick<NgFor<T>, 'ngForOf'>): NgFor<T>;
     *
     * var _t3 = ctor({ngForOf: [1, 2] as any});
     * ```
     *
     * This correctly infers `T` as `any`, and therefore `_t3` as `NgFor<any>`.
     */
    function typeParametersWithDefaultTypes(params) {
        if (params === undefined) {
            return undefined;
        }
        return params.map(function (param) {
            if (param.default === undefined) {
                return ts.updateTypeParameterDeclaration(
                /* node */ param, 
                /* name */ param.name, 
                /* constraint */ param.constraint, 
                /* defaultType */ ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword));
            }
            else {
                return param;
            }
        });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZV9jb25zdHJ1Y3Rvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvbmd0c2MvdHlwZWNoZWNrL3NyYy90eXBlX2NvbnN0cnVjdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCwrQkFBaUM7SUFJakMsbUZBQWtFO0lBRWxFLGlGQUEyRDtJQUUzRCxTQUFnQiw2QkFBNkIsQ0FDekMsSUFBMkMsRUFBRSxJQUFzQixFQUFFLFdBQTBCLEVBQy9GLFVBQW1ELEVBQUUsU0FBeUI7UUFDaEYsSUFBSSxzQkFBc0IsQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLEVBQUU7WUFDM0MsTUFBTSxJQUFJLEtBQUssQ0FBSSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUkseUNBQXNDLENBQUMsQ0FBQztTQUMxRTtRQUVELElBQU0sV0FBVyxHQUFHLFVBQVUsS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLG1CQUFtQixDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7UUFDM0YsSUFBTSxPQUFPLEdBQUcsRUFBRSxDQUFDLHVCQUF1QixDQUFDLFdBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQztRQUVyRSxJQUFNLFNBQVMsR0FBRywwQkFBMEIsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBRWxFLElBQU0sY0FBYyxHQUFHLDhCQUE4QixDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBRWxFLElBQUksSUFBSSxDQUFDLElBQUksRUFBRTtZQUNiLElBQU0sTUFBTSxHQUFHLEVBQUUsQ0FBQyxzQkFBc0I7WUFDcEMsb0JBQW9CLENBQUMsY0FBYztZQUNuQyxnQkFBZ0IsQ0FBQSxDQUFDLFNBQVMsQ0FBQztZQUMzQixVQUFVLENBQUMsT0FBTyxDQUNyQixDQUFDO1lBRUYsSUFBTSxJ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SyxTQUFTLEVBQUU7WUFDeEIsT0FBTyxTQUFTLENBQUM7U0FDbEI7UUFFRCxPQUFPLE1BQU0sQ0FBQyxHQUFHLENBQUMsVUFBQSxLQUFLO1lBQ3JCLElBQUksS0FBSyxDQUFDLE9BQU8sS0FBSyxTQUFTLEVBQUU7Z0JBQy9CLE9BQU8sRUFBRSxDQUFDLDhCQUE4QjtnQkFDcEMsVUFBVSxDQUFDLEtBQUs7Z0JBQ2hCLFVBQVUsQ0FBQyxLQUFLLENBQUMsSUFBSTtnQkFDckIsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLFVBQVU7Z0JBQ2pDLGlCQUFpQixDQUFDLEVBQUUsQ0FBQyxxQkFBcUIsQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7YUFDM0U7aUJBQU07Z0JBQ0wsT0FBTyxLQUFLLENBQUM7YUFDZDtRQUNILENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcblxuaW1wb3J0IHtDbGFzc0RlY2xhcmF0aW9uLCBSZWZsZWN0aW9uSG9zdH0gZnJvbSAnLi4vLi4vcmVmbGVjdGlvbic7XG5pbXBvcnQge1R5cGVDdG9yTWV0YWRhdGF9IGZyb20gJy4uL2FwaSc7XG5pbXBvcnQge2NoZWNrSWZHZW5lcmljVHlwZUJvdW5kc0FyZUNvbnRleHRGcmVlfSBmcm9tICcuL3RjYl91dGlsJztcblxuaW1wb3J0IHt0c0NyZWF0ZVR5cGVRdWVyeUZvckNvZXJjZWRJbnB1dH0gZnJvbSAnLi90c191dGlsJztcblxuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlVHlwZUN0b3JEZWNsYXJhdGlvbkZuKFxuICAgIG5vZGU6IENsYXNzRGVjbGFyYXRpb248dHMuQ2xhc3NEZWNsYXJhdGlvbj4sIG1ldGE6IFR5cGVDdG9yTWV0YWRhdGEsIG5vZGVUeXBlUmVmOiB0cy5FbnRpdHlOYW1lLFxuICAgIHR5cGVQYXJhbXM6IHRzLlR5cGVQYXJhbWV0ZXJEZWNsYXJhdGlvbltdfHVuZGVmaW5lZCwgcmVmbGVjdG9yOiBSZWZsZWN0aW9uSG9zdCk6IHRzLlN0YXRlbWVudCB7XG4gIGlmIChyZXF1aXJlc0lubGluZVR5cGVDdG9yKG5vZGUsIHJlZmxlY3RvcikpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYCR7bm9kZS5uYW1lLnRleHR9IHJlcXVpcmVzIGFuIGlubGluZSB0eXBlIGNvbnN0cnVjdG9yYCk7XG4gIH1cblxuICBjb25zdCByYXdUeXBlQXJncyA9IHR5cGVQYXJhbXMgIT09IHVuZGVmaW5lZCA/IGdlbmVyYXRlR2VuZXJpY0FyZ3ModHlwZVBhcmFtcykgOiB1bmRlZmluZWQ7XG4gIGNvbnN0IHJhd1R5cGUgPSB0cy5jcmVhdGVUeXBlUmVmZXJlbmNlTm9kZShub2RlVHlwZVJlZiwgcmF3VHlwZUFyZ3MpO1xuXG4gIGNvbnN0IGluaXRQYXJhbSA9IGNvbnN0cnVjdFR5cGVDdG9yUGFyYW1ldGVyKG5vZGUsIG1ldGEsIHJhd1R5cGUpO1xuXG4gIGNvbnN0IHR5cGVQYXJhbWV0ZXJzID0gdHlwZVBhcmFtZXRlcnNXaXRoRGVmYXVsdFR5cGVzKHR5cGVQYXJhbXMpO1xuXG4gIGlmIChtZXRhLmJvZHkpIHtcbiAgICBjb25zdCBmblR5cGUgPSB0cy5jcmVhdGVGdW5jdGlvblR5cGVOb2RlKFxuICAgICAgICAvKiB0eXBlUGFyYW1ldGVycyAqLyB0eXBlUGFyYW1ldGVycyxcbiAgICAgICAgLyogcGFyYW1ldGVycyAqL1tpbml0UGFyYW1dLFxuICAgICAgICAvKiB0eXBlICovIHJhd1R5cGUsXG4gICAgKTtcblxuICAgIGNvbnN0IGRlY2wgPSB0cy5jcmVhdGVWYXJpYWJsZURlY2xhcmF0aW9uKFxuICAgICAgICAvKiBuYW1lICovIG1ldGEuZm5OYW1lLFxuICAgICAgICAvKiB0eXBlICovIGZuVHlwZSxcbiAgICAgICAgLyogYm9keSAqLyB0cy5jcmVhdGVOb25OdWxsRXhwcmVzc2lvbih0cy5jcmVhdGVOdWxsKCkpKTtcbiAgICBjb25zdCBkZWNsTGlzdCA9IHRzLmNyZWF0ZVZhcmlhYmxlRGVjbGFyYXRpb25MaXN0KFtkZWNsXSwgdHMuTm9kZUZsYWdzLkNvbnN0KTtcbiAgICByZXR1cm4gdHMuY3JlYXRlVmFyaWFibGVTdGF0ZW1lbnQoXG4gICAgICAgIC8qIG1vZGlmaWVycyAqLyB1bmRlZmluZWQsXG4gICAgICAgIC8qIGRlY2xhcmF0aW9uTGlzdCAqLyBkZWNsTGlzdCk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHRzLmNyZWF0ZUZ1bmN0aW9uRGVjbGFyYXRpb24oXG4gICAgICAgIC8qIGRlY29yYXRvcnMgKi8gdW5kZWZpbmVkLFxuICAgICAgICAvKiBtb2RpZmllcnMgKi9bdHMuY3JlYXRlTW9kaWZpZXIodHMuU3ludGF4S2luZC5EZWNsYXJlS2V5d29yZCldLFxuICAgICAgICAvKiBhc3Rlcmlza1Rva2VuICovIHVuZGVmaW5lZCxcbiAgICAgICAgLyogbmFtZSAqLyBtZXRhLmZuTmFtZSxcbiAgICAgICAgLyogdHlwZVBhcmFtZXRlcnMgKi8gdHlwZVBhcmFtZXRlcnMsXG4gICAgICAgIC8qIHBhcmFtZXRlcnMgKi9baW5pdFBhcmFtXSxcbiAgICAgICAgLyogdHlwZSAqLyByYXdUeXBlLFxuICAgICAgICAvKiBib2R5ICovIHVuZGVmaW5lZCk7XG4gIH1cbn1cblxuLyoqXG4gKiBHZW5lcmF0ZSBhbiBpbmxpbmUgdHlwZSBjb25zdHJ1Y3RvciBmb3IgdGhlIGdpdmVuIGNsYXNzIGFuZCBtZXRhZGF0YS5cbiAqXG4gKiBBbiBpbmxpbmUgdHlwZSBjb25zdHJ1Y3RvciBpcyBhIHNwZWNpYWxseSBzaGFwZWQgVHlwZVNjcmlwdCBzdGF0aWMgbWV0aG9kLCBpbnRlbmRlZCB0byBiZSBwbGFjZWRcbiAqIHdpdGhpbiBhIGRpcmVjdGl2ZSBjbGFzcyBpdHNlbGYsIHRoYXQgcGVybWl0cyB0eXBlIGluZmVyZW5jZSBvZiBhbnkgZ2VuZXJpYyB0eXBlIHBhcmFtZXRlcnMgb2ZcbiAqIHRoZSBjbGFzcyBmcm9tIHRoZSB0eXBlcyBvZiBleHByZXNzaW9ucyBib3VuZCB0byBpbnB1dHMgb3Igb3V0cHV0cywgYW5kIHRoZSB0eXBlcyBvZiBlbGVtZW50c1xuICogdGhhdCBtYXRjaCBxdWVyaWVzIHBlcmZvcm1lZCBieSB0aGUgZGlyZWN0aXZlLiBJdCBhbHNvIGNhdGNoZXMgYW55IGVycm9ycyBpbiB0aGUgdHlwZXMgb2YgdGhlc2VcbiAqIGV4cHJlc3Npb25zLiBUaGlzIG1ldGhvZCBpcyBuZXZlciBjYWxsZWQgYXQgcnVudGltZSwgYnV0IGlzIHVzZWQgaW4gdHlwZS1jaGVjayBibG9ja3MgdG9cbiAqIGNvbnN0cnVjdCBkaXJlY3RpdmUgdHlwZXMuXG4gKlxuICogQW4gaW5saW5lIHR5cGUgY29uc3RydWN0b3IgZm9yIE5nRm9yIGxvb2tzIGxpa2U6XG4gKlxuICogc3RhdGljIG5nVHlwZUN0b3I8VD4oaW5pdDogUGljazxOZ0Zvck9mPFQ+LCAnbmdGb3JPZid8J25nRm9yVHJhY2tCeSd8J25nRm9yVGVtcGxhdGUnPik6XG4gKiAgIE5nRm9yT2Y8VD47XG4gKlxuICogQSB0eXBpY2FsIGNvbnN0cnVjdG9yIHdvdWxkIGJlOlxuICpcbiAqIE5nRm9yT2YubmdUeXBlQ3Rvcihpbml0OiB7XG4gKiAgIG5nRm9yT2Y6IFsnZm9vJywgJ2JhciddLFxuICogICBuZ0ZvclRyYWNrQnk6IG51bGwgYXMgYW55LFxuICogICBuZ0ZvclRlbXBsYXRlOiBudWxsIGFzIGFueSxcbiAqIH0pOyAvLyBJbmZlcnMgYSB0eXBlIG9mIE5nRm9yT2Y8c3RyaW5nPi5cbiAqXG4gKiBBbnkgaW5wdXRzIGRlY2xhcmVkIG9uIHRoZSB0eXBlIGZvciB3aGljaCBubyBwcm9wZXJ0eSBiaW5kaW5nIGlzIHByZXNlbnQgYXJlIGFzc2lnbmVkIGEgdmFsdWUgb2ZcbiAqIHR5cGUgYGFueWAsIHRvIGF2b2lkIHByb2R1Y2luZyBhbnkgdHlwZSBlcnJvcnMgZm9yIHVuc2V0IGlucHV0cy5cbiAqXG4gKiBJbmxpbmUgdHlwZSBjb25zdHJ1Y3RvcnMgYXJlIHVzZWQgd2hlbiB0aGUgdHlwZSBiZWluZyBjcmVhdGVkIGhhcyBib3VuZGVkIGdlbmVyaWMgdHlwZXMgd2hpY2hcbiAqIG1ha2Ugd3JpdGluZyBhIGRlY2xhcmVkIHR5cGUgY29uc3RydWN0b3IgKHZpYSBgZ2VuZXJhdGVUeXBlQ3RvckRlY2xhcmF0aW9uRm5gKSBkaWZmaWN1bHQgb3JcbiAqIGltcG9zc2libGUuXG4gKlxuICogQHBhcmFtIG5vZGUgdGhlIGBDbGFzc0RlY2xhcmF0aW9uPHRzLkNsYXNzRGVjbGFyYXRpb24+YCBmb3Igd2hpY2ggYSB0eXBlIGNvbnN0cnVjdG9yIHdpbGwgYmVcbiAqIGdlbmVyYXRlZC5cbiAqIEBwYXJhbSBtZXRhIGFkZGl0aW9uYWwgbWV0YWRhdGEgcmVxdWlyZWQgdG8gZ2VuZXJhdGUgdGhlIHR5cGUgY29uc3RydWN0b3IuXG4gKiBAcmV0dXJucyBhIGB0cy5NZXRob2REZWNsYXJhdGlvbmAgZm9yIHRoZSB0eXBlIGNvbnN0cnVjdG9yLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGVJbmxpbmVUeXBlQ3RvcihcbiAgICBub2RlOiBDbGFzc0RlY2xhcmF0aW9uPHRzLkNsYXNzRGVjbGFyYXRpb24+LCBtZXRhOiBUeXBlQ3Rvck1ldGFkYXRhKTogdHMuTWV0aG9kRGVjbGFyYXRpb24ge1xuICAvLyBCdWlsZCByYXdUeXBlLCBhIGB0cy5UeXBlTm9kZWAgb2YgdGhlIGNsYXNzIHdpdGggaXRzIGdlbmVyaWMgcGFyYW1ldGVycyBwYXNzZWQgdGhyb3VnaCBmcm9tXG4gIC8vIHRoZSBkZWZpbml0aW9uIHdpdGhvdXQgYW55IHR5cGUgYm91bmRzLiBGb3IgZXhhbXBsZSwgaWYgdGhlIGNsYXNzIGlzXG4gIC8vIGBGb29EaXJlY3RpdmU8VCBleHRlbmRzIEJhcj5gLCBpdHMgcmF3VHlwZSB3b3VsZCBiZSBgRm9vRGlyZWN0aXZlPFQ+YC5cbiAgY29uc3QgcmF3VHlwZUFyZ3MgPVxuICAgICAgbm9kZS50eXBlUGFyYW1ldGVycyAhPT0gdW5kZWZpbmVkID8gZ2VuZXJhdGVHZW5lcmljQXJncyhub2RlLnR5cGVQYXJhbWV0ZXJzKSA6IHVuZGVmaW5lZDtcbiAgY29uc3QgcmF3VHlwZSA9IHRzLmNyZWF0ZVR5cGVSZWZlcmVuY2VOb2RlKG5vZGUubmFtZSwgcmF3VHlwZUFyZ3MpO1xuXG4gIGNvbnN0IGluaXRQYXJhbSA9IGNvbnN0cnVjdFR5cGVDdG9yUGFyYW1ldGVyKG5vZGUsIG1ldGEsIHJhd1R5cGUpO1xuXG4gIC8vIElmIHRoaXMgY29uc3RydWN0b3IgaXMgYmVpbmcgZ2VuZXJhdGVkIGludG8gYSAudHMgZmlsZSwgdGhlbiBpdCBuZWVkcyBhIGZha2UgYm9keS4gVGhlIGJvZHlcbiAgLy8gaXMgc2V0IHRvIGEgcmV0dXJuIG9mIGBudWxsIWAuIElmIHRoZSB0eXBlIGNvbnN0cnVjdG9yIGlzIGJlaW5nIGdlbmVyYXRlZCBpbnRvIGEgLmQudHMgZmlsZSxcbiAgLy8gaXQgbmVlZHMgbm8gYm9keS5cbiAgbGV0IGJvZHk6IHRzLkJsb2NrfHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgaWYgKG1ldGEuYm9keSkge1xuICAgIGJvZHkgPSB0cy5jcmVhdGVCbG9jayhbXG4gICAgICB0cy5jcmVhdGVSZXR1cm4odHMuY3JlYXRlTm9uTnVsbEV4cHJlc3Npb24odHMuY3JlYXRlTnVsbCgpKSksXG4gICAgXSk7XG4gIH1cblxuICAvLyBDcmVhdGUgdGhlIHR5cGUgY29uc3RydWN0b3IgbWV0aG9kIGRlY2xhcmF0aW9uLlxuICByZXR1cm4gdHMuY3JlYXRlTWV0aG9kKFxuICAgICAgLyogZGVjb3JhdG9ycyAqLyB1bmRlZmluZWQsXG4gICAgICAvKiBtb2RpZmllcnMgKi9bdHMuY3JlYXRlTW9kaWZpZXIodHMuU3ludGF4S2luZC5TdGF0aWNLZXl3b3JkKV0sXG4gICAgICAvKiBhc3Rlcmlza1Rva2VuICovIHVuZGVmaW5lZCxcbiAgICAgIC8qIG5hbWUgKi8gbWV0YS5mbk5hbWUsXG4gICAgICAvKiBxdWVzdGlvblRva2VuICovIHVuZGVmaW5lZCxcbiAgICAgIC8qIHR5cGVQYXJhbWV0ZXJzICovIHR5cGVQYXJhbWV0ZXJzV2l0aERlZmF1bHRUeXBlcyhub2RlLnR5cGVQYXJhbWV0ZXJzKSxcbiAgICAgIC8qIHBhcmFtZXRlcnMgKi9baW5pdFBhcmFtXSxcbiAgICAgIC8qIHR5cGUgKi8gcmF3VHlwZSxcbiAgICAgIC8qIGJvZHkgKi8gYm9keSxcbiAgKTtcbn1cblxuZnVuY3Rpb24gY29uc3RydWN0VHlwZUN0b3JQYXJhbWV0ZXIoXG4gICAgbm9kZTogQ2xhc3NEZWNsYXJhdGlvbjx0cy5DbGFzc0RlY2xhcmF0aW9uPiwgbWV0YTogVHlwZUN0b3JNZXRhZGF0YSxcbiAgICByYXdUeXBlOiB0cy5UeXBlUmVmZXJlbmNlTm9kZSk6IHRzLlBhcmFtZXRlckRlY2xhcmF0aW9uIHtcbiAgLy8gaW5pdFR5cGUgaXMgdGhlIHR5cGUgb2YgJ2luaXQnLCB0aGUgc2luZ2xlIGFyZ3VtZW50IHRvIHRoZSB0eXBlIGNvbnN0cnVjdG9yIG1ldGhvZC5cbiAgLy8gSWYgdGhlIERpcmVjdGl2ZSBoYXMgYW55IGlucHV0cywgaXRzIGluaXRUeXBlIHdpbGwgYmU6XG4gIC8vXG4gIC8vIFBpY2s8cmF3VHlwZSwgJ2lucHV0QSd8J2lucHV0Qic+XG4gIC8vXG4gIC8vIFBpY2sgaGVyZSBpcyB1c2VkIHRvIHNlbGVjdCBvbmx5IHRob3NlIGZpZWxkcyBmcm9tIHdoaWNoIHRoZSBnZW5lcmljIHR5cGUgcGFyYW1ldGVycyBvZiB0aGVcbiAgLy8gZGlyZWN0aXZlIHdpbGwgYmUgaW5mZXJyZWQuXG4gIC8vXG4gIC8vIEluIHRoZSBzcGVjaWFsIGNhc2UgdGhlcmUgYXJlIG5vIGlucHV0cywgaW5pdFR5cGUgaXMgc2V0IHRvIHt9LlxuICBsZXQgaW5pdFR5cGU6IHRzLlR5cGVOb2RlfG51bGwgPSBudWxsO1xuXG4gIGNvbnN0IGtleXM6IHN0cmluZ1tdID0gbWV0YS5maWVsZHMuaW5wdXRzO1xuICBjb25zdCBwbGFpbktleXM6IHRzLkxpdGVyYWxUeXBlTm9kZVtdID0gW107XG4gIGNvbnN0IGNvZXJjZWRLZXlzOiB0cy5Qcm9wZXJ0eVNpZ25hdHVyZVtdID0gW107XG4gIGZvciAoY29uc3Qga2V5IG9mIGtleXMpIHtcbiAgICBpZiAoIW1ldGEuY29lcmNlZElucHV0RmllbGRzLmhhcyhrZXkpKSB7XG4gICAgICBwbGFpbktleXMucHVzaCh0cy5jcmVhdGVMaXRlcmFsVHlwZU5vZGUodHMuY3JlYXRlU3RyaW5nTGl0ZXJhbChrZXkpKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvZXJjZWRLZXlzLnB1c2godHMuY3JlYXRlUHJvcGVydHlTaWduYXR1cmUoXG4gICAgICAgICAgLyogbW9kaWZpZXJzICovIHVuZGVmaW5lZCxcbiAgICAgICAgICAvKiBuYW1lICovIGtleSxcbiAgICAgICAgICAvKiBxdWVzdGlvblRva2VuICovIHVuZGVmaW5lZCxcbiAgICAgICAgICAvKiB0eXBlICovIHRzQ3JlYXRlVHlwZVF1ZXJ5Rm9yQ29lcmNlZElucHV0KHJhd1R5cGUudHlwZU5hbWUsIGtleSksXG4gICAgICAgICAgLyogaW5pdGlhbGl6ZXIgKi8gdW5kZWZpbmVkKSk7XG4gICAgfVxuICB9XG4gIGlmIChwbGFpbktleXMubGVuZ3RoID4gMCkge1xuICAgIC8vIENvbnN0cnVjdCBhIHVuaW9uIG9mIGFsbCB0aGUgZmllbGQgbmFtZXMuXG4gICAgY29uc3Qga2V5VHlwZVVuaW9uID0gdHMuY3JlYXRlVW5pb25UeXBlTm9kZShwbGFpbktleXMpO1xuXG4gICAgLy8gQ29uc3RydWN0IHRoZSBQaWNrPHJhd1R5cGUsIGtleVR5cGVVbmlvbj4uXG4gICAgaW5pdFR5cGUgPSB0cy5jcmVhdGVUeXBlUmVmZXJlbmNlTm9kZSgnUGljaycsIFtyYXdUeXBlLCBrZXlUeXBlVW5pb25dKTtcbiAgfVxuICBpZiAoY29lcmNlZEtleXMubGVuZ3RoID4gMCkge1xuICAgIGNvbnN0IGNvZXJjZWRMaXRlcmFsID0gdHMuY3JlYXRlVHlwZUxpdGVyYWxOb2RlKGNvZXJjZWRLZXlzKTtcblxuICAgIGluaXRUeXBlID0gaW5pdFR5cGUgIT09IG51bGwgPyB0cy5jcmVhdGVJbnRlcnNlY3Rpb25UeXBlTm9kZShbaW5pdFR5cGUsIGNvZXJjZWRMaXRlcmFsXSkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2VyY2VkTGl0ZXJhbDtcbiAgfVxuXG4gIGlmIChpbml0VHlwZSA9PT0gbnVsbCkge1xuICAgIC8vIFNwZWNpYWwgY2FzZSAtIG5vIGlucHV0cywgb3V0cHV0cywgb3Igb3RoZXIgZmllbGRzIHdoaWNoIGNvdWxkIGluZmx1ZW5jZSB0aGUgcmVzdWx0IHR5cGUuXG4gICAgaW5pdFR5cGUgPSB0cy5jcmVhdGVUeXBlTGl0ZXJhbE5vZGUoW10pO1xuICB9XG5cbiAgLy8gQ3JlYXRlIHRoZSAnaW5pdCcgcGFyYW1ldGVyIGl0c2VsZi5cbiAgcmV0dXJuIHRzLmNyZWF0ZVBhcmFtZXRlcihcbiAgICAgIC8qIGRlY29yYXRvcnMgKi8gdW5kZWZpbmVkLFxuICAgICAgLyogbW9kaWZpZXJzICovIHVuZGVmaW5lZCxcbiAgICAgIC8qIGRvdERvdERvdFRva2VuICovIHVuZGVmaW5lZCxcbiAgICAgIC8qIG5hbWUgKi8gJ2luaXQnLFxuICAgICAgLyogcXVlc3Rpb25Ub2tlbiAqLyB1bmRlZmluZWQsXG4gICAgICAvKiB0eXBlICovIGluaXRUeXBlLFxuICAgICAgLyogaW5pdGlhbGl6ZXIgKi8gdW5kZWZpbmVkKTtcbn1cblxuZnVuY3Rpb24gZ2VuZXJhdGVHZW5lcmljQXJncyhwYXJhbXM6IFJlYWRvbmx5QXJyYXk8dHMuVHlwZVBhcmFtZXRlckRlY2xhcmF0aW9uPik6IHRzLlR5cGVOb2RlW10ge1xuICByZXR1cm4gcGFyYW1zLm1hcChwYXJhbSA9PiB0cy5jcmVhdGVUeXBlUmVmZXJlbmNlTm9kZShwYXJhbS5uYW1lLCB1bmRlZmluZWQpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlcXVpcmVzSW5saW5lVHlwZUN0b3IoXG4gICAgbm9kZTogQ2xhc3NEZWNsYXJhdGlvbjx0cy5DbGFzc0RlY2xhcmF0aW9uPiwgaG9zdDogUmVmbGVjdGlvbkhvc3QpOiBib29sZWFuIHtcbiAgLy8gVGhlIGNsYXNzIHJlcXVpcmVzIGFuIGlubGluZSB0eXBlIGNvbnN0cnVjdG9yIGlmIGl0IGhhcyBnZW5lcmljIHR5cGUgYm91bmRzIHRoYXQgY2FuIG5vdCBiZVxuICAvLyBlbWl0dGVkIGludG8gYSBkaWZmZXJlbnQgY29udGV4dC5cbiAgcmV0dXJuICFjaGVja0lmR2VuZXJpY1R5cGVCb3VuZHNBcmVDb250ZXh0RnJlZShub2RlLCBob3N0KTtcbn1cblxuLyoqXG4gKiBBZGQgYSBkZWZhdWx0IGA9IGFueWAgdG8gdHlwZSBwYXJhbWV0ZXJzIHRoYXQgZG9uJ3QgaGF2ZSBhIGRlZmF1bHQgdmFsdWUgYWxyZWFkeS5cbiAqXG4gKiBUeXBlU2NyaXB0IHVzZXMgdGhlIGRlZmF1bHQgdHlwZSBvZiBhIHR5cGUgcGFyYW1ldGVyIHdoZW5ldmVyIGluZmVyZW5jZSBvZiB0aGF0IHBhcmFtZXRlciBmYWlscy5cbiAqIFRoaXMgY2FuIGhhcHBlbiB3aGVuIGluZmVycmluZyBhIGNvbXBsZXggdHlwZSBmcm9tICdhbnknLiBGb3IgZXhhbXBsZSwgaWYgYE5nRm9yYCdzIGluZmVyZW5jZSBpc1xuICogZG9uZSB3aXRoIHRoZSBUQ0IgY29kZTpcbiAqXG4gKiBgYGBcbiAqIGNsYXNzIE5nRm9yPFQ+IHtcbiAqICAgbmdGb3JPZjogVFtdO1xuICogfVxuICpcbiAqIGRlY2xhcmUgZnVuY3Rpb24gY3RvcjxUPihvOiBQaWNrPE5nRm9yPFQ+LCAnbmdGb3JPZid8J25nRm9yVHJhY2tCeSd8J25nRm9yVGVtcGxhdGUnPik6IE5nRm9yPFQ+O1xuICogYGBgXG4gKlxuICogQW4gaW52b2NhdGlvbiBsb29rcyBsaWtlOlxuICpcbiAqIGBgYFxuICogdmFyIF90MSA9IGN0b3Ioe25nRm9yT2Y6IFsxLCAyXSwgbmdGb3JUcmFja0J5OiBudWxsIGFzIGFueSwgbmdGb3JUZW1wbGF0ZTogbnVsbCBhcyBhbnl9KTtcbiAqIGBgYFxuICpcbiAqIFRoaXMgY29ycmVjdGx5IGluZmVycyB0aGUgdHlwZSBgTmdGb3I8bnVtYmVyPmAgZm9yIGBfdDFgLCBzaW5jZSBgVGAgaXMgaW5mZXJyZWQgZnJvbSB0aGVcbiAqIGFzc2lnbm1lbnQgb2YgdHlwZSBgbnVtYmVyW11gIHRvIGBuZ0Zvck9mYCdzIHR5cGUgYFRbXWAuIEhvd2V2ZXIsIGlmIGBhbnlgIGlzIHBhc3NlZCBpbnN0ZWFkOlxuICpcbiAqIGBgYFxuICogdmFyIF90MiA9IGN0b3Ioe25nRm9yT2Y6IFsxLCAyXSBhcyBhbnksIG5nRm9yVHJhY2tCeTogbnVsbCBhcyBhbnksIG5nRm9yVGVtcGxhdGU6IG51bGwgYXMgYW55fSk7XG4gKiBgYGBcbiAqXG4gKiB0aGVuIGluZmVyZW5jZSBmb3IgYFRgIGZhaWxzIChpdCBjYW5ub3QgYmUgaW5mZXJyZWQgZnJvbSBgVFtdID0gYW55YCkuIEluIHRoaXMgY2FzZSwgYFRgIHRha2VzXG4gKiB0aGUgdHlwZSBge31gLCBhbmQgc28gYF90MmAgaXMgaW5mZXJyZWQgYXMgYE5nRm9yPHt9PmAuIFRoaXMgaXMgb2J2aW91c2x5IHdyb25nLlxuICpcbiAqIEFkZGluZyBhIGRlZmF1bHQgdHlwZSB0byB0aGUgZ2VuZXJpYyBkZWNsYXJhdGlvbiBpbiB0aGUgY29uc3RydWN0b3Igc29sdmVzIHRoaXMgcHJvYmxlbSwgYXMgdGhlXG4gKiBkZWZhdWx0IHR5cGUgd2lsbCBiZSB1c2VkIGluIHRoZSBldmVudCB0aGF0IGluZmVyZW5jZSBmYWlscy5cbiAqXG4gKiBgYGBcbiAqIGRlY2xhcmUgZnVuY3Rpb24gY3RvcjxUID0gYW55PihvOiBQaWNrPE5nRm9yPFQ+LCAnbmdGb3JPZic+KTogTmdGb3I8VD47XG4gKlxuICogdmFyIF90MyA9IGN0b3Ioe25nRm9yT2Y6IFsxLCAyXSBhcyBhbnl9KTtcbiAqIGBgYFxuICpcbiAqIFRoaXMgY29ycmVjdGx5IGluZmVycyBgVGAgYXMgYGFueWAsIGFuZCB0aGVyZWZvcmUgYF90M2AgYXMgYE5nRm9yPGFueT5gLlxuICovXG5mdW5jdGlvbiB0eXBlUGFyYW1ldGVyc1dpdGhEZWZhdWx0VHlwZXMocGFyYW1zOiBSZWFkb25seUFycmF5PHRzLlR5cGVQYXJhbWV0ZXJEZWNsYXJhdGlvbj58XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdW5kZWZpbmVkKTogdHMuVHlwZVBhcmFtZXRlckRlY2xhcmF0aW9uW118dW5kZWZpbmVkIHtcbiAgaWYgKHBhcmFtcyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuXG4gIHJldHVybiBwYXJhbXMubWFwKHBhcmFtID0+IHtcbiAgICBpZiAocGFyYW0uZGVmYXVsdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gdHMudXBkYXRlVHlwZVBhcmFtZXRlckRlY2xhcmF0aW9uKFxuICAgICAgICAgIC8qIG5vZGUgKi8gcGFyYW0sXG4gICAgICAgICAgLyogbmFtZSAqLyBwYXJhbS5uYW1lLFxuICAgICAgICAgIC8qIGNvbnN0cmFpbnQgKi8gcGFyYW0uY29uc3RyYWludCxcbiAgICAgICAgICAvKiBkZWZhdWx0VHlwZSAqLyB0cy5jcmVhdGVLZXl3b3JkVHlwZU5vZGUodHMuU3ludGF4S2luZC5BbnlLZXl3b3JkKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBwYXJhbTtcbiAgICB9XG4gIH0pO1xufVxuIl19