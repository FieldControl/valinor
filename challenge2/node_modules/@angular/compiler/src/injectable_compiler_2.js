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
        define("@angular/compiler/src/injectable_compiler_2", ["require", "exports", "tslib", "@angular/compiler/src/output/output_ast", "@angular/compiler/src/render3/partial/util", "@angular/compiler/src/render3/r3_factory", "@angular/compiler/src/render3/r3_identifiers", "@angular/compiler/src/render3/util", "@angular/compiler/src/render3/view/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createInjectableType = exports.compileInjectable = exports.createR3ProviderExpression = void 0;
    var tslib_1 = require("tslib");
    var o = require("@angular/compiler/src/output/output_ast");
    var util_1 = require("@angular/compiler/src/render3/partial/util");
    var r3_factory_1 = require("@angular/compiler/src/render3/r3_factory");
    var r3_identifiers_1 = require("@angular/compiler/src/render3/r3_identifiers");
    var util_2 = require("@angular/compiler/src/render3/util");
    var util_3 = require("@angular/compiler/src/render3/view/util");
    function createR3ProviderExpression(expression, isForwardRef) {
        return { expression: expression, isForwardRef: isForwardRef };
    }
    exports.createR3ProviderExpression = createR3ProviderExpression;
    function compileInjectable(meta, resolveForwardRefs) {
        var result = null;
        var factoryMeta = {
            name: meta.name,
            type: meta.type,
            internalType: meta.internalType,
            typeArgumentCount: meta.typeArgumentCount,
            deps: [],
            target: r3_factory_1.FactoryTarget.Injectable,
        };
        if (meta.useClass !== undefined) {
            // meta.useClass has two modes of operation. Either deps are specified, in which case `new` is
            // used to instantiate the class with dependencies injected, or deps are not specified and
            // the factory of the class is used to instantiate it.
            //
            // A special case exists for useClass: Type where Type is the injectable type itself and no
            // deps are specified, in which case 'useClass' is effectively ignored.
            var useClassOnSelf = meta.useClass.expression.isEquivalent(meta.internalType);
            var deps = undefined;
            if (meta.deps !== undefined) {
                deps = meta.deps;
            }
            if (deps !== undefined) {
                // factory: () => new meta.useClass(...deps)
                result = r3_factory_1.compileFactoryFunction(tslib_1.__assign(tslib_1.__assign({}, factoryMeta), { delegate: meta.useClass.expression, delegateDeps: deps, delegateType: r3_factory_1.R3FactoryDelegateType.Class }));
            }
            else if (useClassOnSelf) {
                result = r3_factory_1.compileFactoryFunction(factoryMeta);
            }
            else {
                result = {
                    statements: [],
                    expression: delegateToFactory(meta.type.value, meta.useClass.expression, resolveForwardRefs)
                };
            }
        }
        else if (meta.useFactory !== undefined) {
            if (meta.deps !== undefined) {
                result = r3_factory_1.compileFactoryFunction(tslib_1.__assign(tslib_1.__assign({}, factoryMeta), { delegate: meta.useFactory, delegateDeps: meta.deps || [], delegateType: r3_factory_1.R3FactoryDelegateType.Function }));
            }
            else {
                result = {
                    statements: [],
                    expression: o.fn([], [new o.ReturnStatement(meta.useFactory.callFn([]))])
                };
            }
        }
        else if (meta.useValue !== undefined) {
            // Note: it's safe to use `meta.useValue` instead of the `USE_VALUE in meta` check used for
            // client code because meta.useValue is an Expression which will be defined even if the actual
            // value is undefined.
            result = r3_factory_1.compileFactoryFunction(tslib_1.__assign(tslib_1.__assign({}, factoryMeta), { expression: meta.useValue.expression }));
        }
        else if (meta.useExisting !== undefined) {
            // useExisting is an `inject` call on the existing token.
            result = r3_factory_1.compileFactoryFunction(tslib_1.__assign(tslib_1.__assign({}, factoryMeta), { expression: o.importExpr(r3_identifiers_1.Identifiers.inject).callFn([meta.useExisting.expression]) }));
        }
        else {
            result = {
                statements: [],
                expression: delegateToFactory(meta.type.value, meta.internalType, resolveForwardRefs)
            };
        }
        var token = meta.internalType;
        var injectableProps = new util_3.DefinitionMap();
        injectableProps.set('token', token);
        injectableProps.set('factory', result.expression);
        // Only generate providedIn property if it has a non-null value
        if (meta.providedIn.expression.value !== null) {
            injectableProps.set('providedIn', meta.providedIn.isForwardRef ? util_1.generateForwardRef(meta.providedIn.expression) :
                meta.providedIn.expression);
        }
        var expression = o.importExpr(r3_identifiers_1.Identifiers.ɵɵdefineInjectable)
            .callFn([injectableProps.toLiteralMap()], undefined, true);
        return {
            expression: expression,
            type: createInjectableType(meta),
            statements: result.statements,
        };
    }
    exports.compileInjectable = compileInjectable;
    function createInjectableType(meta) {
        return new o.ExpressionType(o.importExpr(r3_identifiers_1.Identifiers.InjectableDeclaration, [util_2.typeWithParameters(meta.type.type, meta.typeArgumentCount)]));
    }
    exports.createInjectableType = createInjectableType;
    function delegateToFactory(type, internalType, unwrapForwardRefs) {
        if (type.node === internalType.node) {
            // The types are the same, so we can simply delegate directly to the type's factory.
            // ```
            // factory: type.ɵfac
            // ```
            return internalType.prop('ɵfac');
        }
        if (!unwrapForwardRefs) {
            // The type is not wrapped in a `forwardRef()`, so we create a simple factory function that
            // accepts a sub-type as an argument.
            // ```
            // factory: function(t) { return internalType.ɵfac(t); }
            // ```
            return createFactoryFunction(internalType);
        }
        // The internalType is actually wrapped in a `forwardRef()` so we need to resolve that before
        // calling its factory.
        // ```
        // factory: function(t) { return core.resolveForwardRef(type).ɵfac(t); }
        // ```
        var unwrappedType = o.importExpr(r3_identifiers_1.Identifiers.resolveForwardRef).callFn([internalType]);
        return createFactoryFunction(unwrappedType);
    }
    function createFactoryFunction(type) {
        return o.fn([new o.FnParam('t', o.DYNAMIC_TYPE)], [new o.ReturnStatement(type.callMethod('ɵfac', [o.variable('t')]))]);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5qZWN0YWJsZV9jb21waWxlcl8yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL2luamVjdGFibGVfY29tcGlsZXJfMi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBRUgsMkRBQXlDO0lBQ3pDLG1FQUEwRDtJQUMxRCx1RUFBMkk7SUFDM0ksK0VBQXFEO0lBQ3JELDJEQUFxRjtJQUNyRixnRUFBa0Q7SUE0Q2xELFNBQWdCLDBCQUEwQixDQUN0QyxVQUFhLEVBQUUsWUFBcUI7UUFDdEMsT0FBTyxFQUFDLFVBQVUsWUFBQSxFQUFFLFlBQVksY0FBQSxFQUFDLENBQUM7SUFDcEMsQ0FBQztJQUhELGdFQUdDO0lBRUQsU0FBZ0IsaUJBQWlCLENBQzdCLElBQTBCLEVBQUUsa0JBQTJCO1FBQ3pELElBQUksTUFBTSxHQUErRCxJQUFJLENBQUM7UUFFOUUsSUFBTSxXQUFXLEdBQXNCO1lBQ3JDLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSTtZQUNmLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSTtZQUNmLFlBQVksRUFBRSxJQUFJLENBQUMsWUFBWTtZQUMvQixpQkFBaUIsRUFBRSxJQUFJLENBQUMsaUJBQWlCO1lBQ3pDLElBQUksRUFBRSxFQUFFO1lBQ1IsTUFBTSxFQUFFLDBCQUFhLENBQUMsVUFBVTtTQUNqQyxDQUFDO1FBRUYsSUFBSSxJQUFJLENBQUMsUUFBUSxLQUFLLFNBQVMsRUFBRTtZQUMvQiw4RkFBOEY7WUFDOUYsMEZBQTBGO1lBQzFGLHNEQUFzRDtZQUN0RCxFQUFFO1lBQ0YsMkZBQTJGO1lBQzNGLHVFQUF1RTtZQUV2RSxJQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQ2hGLElBQUksSUFBSSxHQUFxQyxTQUFTLENB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QUN4RCxNQUFNO1lBQ04sT0FBTyxxQkFBcUIsQ0FBQyxZQUFZLENBQUMsQ0FBQztTQUM1QztRQUVELDZGQUE2RjtRQUM3Rix1QkFBdUI7UUFDdkIsTUFBTTtRQUNOLHdFQUF3RTtRQUN4RSxNQUFNO1FBQ04sSUFBTSxhQUFhLEdBQUcsQ0FBQyxDQUFDLFVBQVUsQ0FBQyw0QkFBVyxDQUFDLGlCQUFpQixDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztRQUN6RixPQUFPLHFCQUFxQixDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQzlDLENBQUM7SUFFRCxTQUFTLHFCQUFxQixDQUFDLElBQWtCO1FBQy9DLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FDUCxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLEVBQ3BDLENBQUMsSUFBSSxDQUFDLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDM0UsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBvIGZyb20gJy4vb3V0cHV0L291dHB1dF9hc3QnO1xuaW1wb3J0IHtnZW5lcmF0ZUZvcndhcmRSZWZ9IGZyb20gJy4vcmVuZGVyMy9wYXJ0aWFsL3V0aWwnO1xuaW1wb3J0IHtjb21waWxlRmFjdG9yeUZ1bmN0aW9uLCBGYWN0b3J5VGFyZ2V0LCBSM0RlcGVuZGVuY3lNZXRhZGF0YSwgUjNGYWN0b3J5RGVsZWdhdGVUeXBlLCBSM0ZhY3RvcnlNZXRhZGF0YX0gZnJvbSAnLi9yZW5kZXIzL3IzX2ZhY3RvcnknO1xuaW1wb3J0IHtJZGVudGlmaWVyc30gZnJvbSAnLi9yZW5kZXIzL3IzX2lkZW50aWZpZXJzJztcbmltcG9ydCB7UjNDb21waWxlZEV4cHJlc3Npb24sIFIzUmVmZXJlbmNlLCB0eXBlV2l0aFBhcmFtZXRlcnN9IGZyb20gJy4vcmVuZGVyMy91dGlsJztcbmltcG9ydCB7RGVmaW5pdGlvbk1hcH0gZnJvbSAnLi9yZW5kZXIzL3ZpZXcvdXRpbCc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgUjNJbmplY3RhYmxlTWV0YWRhdGEge1xuICBuYW1lOiBzdHJpbmc7XG4gIHR5cGU6IFIzUmVmZXJlbmNlO1xuICBpbnRlcm5hbFR5cGU6IG8uRXhwcmVzc2lvbjtcbiAgdHlwZUFyZ3VtZW50Q291bnQ6IG51bWJlcjtcbiAgcHJvdmlkZWRJbjogUjNQcm92aWRlckV4cHJlc3Npb247XG4gIHVzZUNsYXNzPzogUjNQcm92aWRlckV4cHJlc3Npb247XG4gIHVzZUZhY3Rvcnk/OiBvLkV4cHJlc3Npb247XG4gIHVzZUV4aXN0aW5nPzogUjNQcm92aWRlckV4cHJlc3Npb247XG4gIHVzZVZhbHVlPzogUjNQcm92aWRlckV4cHJlc3Npb247XG4gIGRlcHM/OiBSM0RlcGVuZGVuY3lNZXRhZGF0YVtdO1xufVxuXG4vKipcbiAqIEFuIGV4cHJlc3Npb24gdXNlZCB3aGVuIGluc3RhbnRpYXRpbmcgYW4gaW5qZWN0YWJsZS5cbiAqXG4gKiBUaGlzIGlzIHRoZSB0eXBlIG9mIHRoZSBgdXNlQ2xhc3NgLCBgdXNlRXhpc3RpbmdgIGFuZCBgdXNlVmFsdWVgIHByb3BlcnRpZXMgb2ZcbiAqIGBSM0luamVjdGFibGVNZXRhZGF0YWAgc2luY2UgdGhvc2UgY2FuIHJlZmVyIHRvIHR5cGVzIHRoYXQgbWF5IGVhZ2VybHkgcmVmZXJlbmNlIHR5cGVzIHRoYXQgaGF2ZVxuICogbm90IHlldCBiZWVuIGRlZmluZWQuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUjNQcm92aWRlckV4cHJlc3Npb248VCBleHRlbmRzIG8uRXhwcmVzc2lvbiA9IG8uRXhwcmVzc2lvbj4ge1xuICAvKipcbiAgICogVGhlIGV4cHJlc3Npb24gdGhhdCBpcyB1c2VkIHRvIGluc3RhbnRpYXRlIHRoZSBJbmplY3RhYmxlLlxuICAgKi9cbiAgZXhwcmVzc2lvbjogVDtcbiAgLyoqXG4gICAqIElmIHRydWUsIHRoZW4gdGhlIGBleHByZXNzaW9uYCBjb250YWlucyBhIHJlZmVyZW5jZSB0byBzb21ldGhpbmcgdGhhdCBoYXMgbm90IHlldCBiZWVuXG4gICAqIGRlZmluZWQuXG4gICAqXG4gICAqIFRoaXMgbWVhbnMgdGhhdCB0aGUgZXhwcmVzc2lvbiBtdXN0IG5vdCBiZSBlYWdlcmx5IGV2YWx1YXRlZC4gSW5zdGVhZCBpdCBtdXN0IGJlIHdyYXBwZWQgaW4gYVxuICAgKiBmdW5jdGlvbiBjbG9zdXJlIHRoYXQgd2lsbCBiZSBldmFsdWF0ZWQgbGF6aWx5IHRvIGFsbG93IHRoZSBkZWZpbml0aW9uIG9mIHRoZSBleHByZXNzaW9uIHRvIGJlXG4gICAqIGV2YWx1YXRlZCBmaXJzdC5cbiAgICpcbiAgICogSW4gc29tZSBjYXNlcyB0aGUgZXhwcmVzc2lvbiB3aWxsIG5hdHVyYWxseSBiZSBwbGFjZWQgaW5zaWRlIHN1Y2ggYSBmdW5jdGlvbiBjbG9zdXJlLCBzdWNoIGFzXG4gICAqIGluIGEgZnVsbHkgY29tcGlsZWQgZmFjdG9yeSBmdW5jdGlvbi4gSW4gdGhvc2UgY2FzZSBub3RoaW5nIG1vcmUgbmVlZHMgdG8gYmUgZG9uZS5cbiAgICpcbiAgICogQnV0IGluIG90aGVyIGNhc2VzLCBzdWNoIGFzIHBhcnRpYWwtY29tcGlsYXRpb24gdGhlIGV4cHJlc3Npb24gd2lsbCBiZSBsb2NhdGVkIGluIHRvcCBsZXZlbFxuICAgKiBjb2RlIHNvIHdpbGwgbmVlZCB0byBiZSB3cmFwcGVkIGluIGEgZnVuY3Rpb24gdGhhdCBpcyBwYXNzZWQgdG8gYSBgZm9yd2FyZFJlZigpYCBjYWxsLlxuICAgKi9cbiAgaXNGb3J3YXJkUmVmOiBib29sZWFuO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlUjNQcm92aWRlckV4cHJlc3Npb248VCBleHRlbmRzIG8uRXhwcmVzc2lvbj4oXG4gICAgZXhwcmVzc2lvbjogVCwgaXNGb3J3YXJkUmVmOiBib29sZWFuKTogUjNQcm92aWRlckV4cHJlc3Npb248VD4ge1xuICByZXR1cm4ge2V4cHJlc3Npb24sIGlzRm9yd2FyZFJlZn07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb21waWxlSW5qZWN0YWJsZShcbiAgICBtZXRhOiBSM0luamVjdGFibGVNZXRhZGF0YSwgcmVzb2x2ZUZvcndhcmRSZWZzOiBib29sZWFuKTogUjNDb21waWxlZEV4cHJlc3Npb24ge1xuICBsZXQgcmVzdWx0OiB7ZXhwcmVzc2lvbjogby5FeHByZXNzaW9uLCBzdGF0ZW1lbnRzOiBvLlN0YXRlbWVudFtdfXxudWxsID0gbnVsbDtcblxuICBjb25zdCBmYWN0b3J5TWV0YTogUjNGYWN0b3J5TWV0YWRhdGEgPSB7XG4gICAgbmFtZTogbWV0YS5uYW1lLFxuICAgIHR5cGU6IG1ldGEudHlwZSxcbiAgICBpbnRlcm5hbFR5cGU6IG1ldGEuaW50ZXJuYWxUeXBlLFxuICAgIHR5cGVBcmd1bWVudENvdW50OiBtZXRhLnR5cGVBcmd1bWVudENvdW50LFxuICAgIGRlcHM6IFtdLFxuICAgIHRhcmdldDogRmFjdG9yeVRhcmdldC5JbmplY3RhYmxlLFxuICB9O1xuXG4gIGlmIChtZXRhLnVzZUNsYXNzICE9PSB1bmRlZmluZWQpIHtcbiAgICAvLyBtZXRhLnVzZUNsYXNzIGhhcyB0d28gbW9kZXMgb2Ygb3BlcmF0aW9uLiBFaXRoZXIgZGVwcyBhcmUgc3BlY2lmaWVkLCBpbiB3aGljaCBjYXNlIGBuZXdgIGlzXG4gICAgLy8gdXNlZCB0byBpbnN0YW50aWF0ZSB0aGUgY2xhc3Mgd2l0aCBkZXBlbmRlbmNpZXMgaW5qZWN0ZWQsIG9yIGRlcHMgYXJlIG5vdCBzcGVjaWZpZWQgYW5kXG4gICAgLy8gdGhlIGZhY3Rvcnkgb2YgdGhlIGNsYXNzIGlzIHVzZWQgdG8gaW5zdGFudGlhdGUgaXQuXG4gICAgLy9cbiAgICAvLyBBIHNwZWNpYWwgY2FzZSBleGlzdHMgZm9yIHVzZUNsYXNzOiBUeXBlIHdoZXJlIFR5cGUgaXMgdGhlIGluamVjdGFibGUgdHlwZSBpdHNlbGYgYW5kIG5vXG4gICAgLy8gZGVwcyBhcmUgc3BlY2lmaWVkLCBpbiB3aGljaCBjYXNlICd1c2VDbGFzcycgaXMgZWZmZWN0aXZlbHkgaWdub3JlZC5cblxuICAgIGNvbnN0IHVzZUNsYXNzT25TZWxmID0gbWV0YS51c2VDbGFzcy5leHByZXNzaW9uLmlzRXF1aXZhbGVudChtZXRhLmludGVybmFsVHlwZSk7XG4gICAgbGV0IGRlcHM6IFIzRGVwZW5kZW5jeU1ldGFkYXRhW118dW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIGlmIChtZXRhLmRlcHMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgZGVwcyA9IG1ldGEuZGVwcztcbiAgICB9XG5cbiAgICBpZiAoZGVwcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAvLyBmYWN0b3J5OiAoKSA9PiBuZXcgbWV0YS51c2VDbGFzcyguLi5kZXBzKVxuICAgICAgcmVzdWx0ID0gY29tcGlsZUZhY3RvcnlGdW5jdGlvbih7XG4gICAgICAgIC4uLmZhY3RvcnlNZXRhLFxuICAgICAgICBkZWxlZ2F0ZTogbWV0YS51c2VDbGFzcy5leHByZXNzaW9uLFxuICAgICAgICBkZWxlZ2F0ZURlcHM6IGRlcHMsXG4gICAgICAgIGRlbGVnYXRlVHlwZTogUjNGYWN0b3J5RGVsZWdhdGVUeXBlLkNsYXNzLFxuICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh1c2VDbGFzc09uU2VsZikge1xuICAgICAgcmVzdWx0ID0gY29tcGlsZUZhY3RvcnlGdW5jdGlvbihmYWN0b3J5TWV0YSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgc3RhdGVtZW50czogW10sXG4gICAgICAgIGV4cHJlc3Npb246IGRlbGVnYXRlVG9GYWN0b3J5KFxuICAgICAgICAgICAgbWV0YS50eXBlLnZhbHVlIGFzIG8uV3JhcHBlZE5vZGVFeHByPGFueT4sXG4gICAgICAgICAgICBtZXRhLnVzZUNsYXNzLmV4cHJlc3Npb24gYXMgby5XcmFwcGVkTm9kZUV4cHI8YW55PiwgcmVzb2x2ZUZvcndhcmRSZWZzKVxuICAgICAgfTtcbiAgICB9XG4gIH0gZWxzZSBpZiAobWV0YS51c2VGYWN0b3J5ICE9PSB1bmRlZmluZWQpIHtcbiAgICBpZiAobWV0YS5kZXBzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJlc3VsdCA9IGNvbXBpbGVGYWN0b3J5RnVuY3Rpb24oe1xuICAgICAgICAuLi5mYWN0b3J5TWV0YSxcbiAgICAgICAgZGVsZWdhdGU6IG1ldGEudXNlRmFjdG9yeSxcbiAgICAgICAgZGVsZWdhdGVEZXBzOiBtZXRhLmRlcHMgfHwgW10sXG4gICAgICAgIGRlbGVnYXRlVHlwZTogUjNGYWN0b3J5RGVsZWdhdGVUeXBlLkZ1bmN0aW9uLFxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgc3RhdGVtZW50czogW10sXG4gICAgICAgIGV4cHJlc3Npb246IG8uZm4oW10sIFtuZXcgby5SZXR1cm5TdGF0ZW1lbnQobWV0YS51c2VGYWN0b3J5LmNhbGxGbihbXSkpXSlcbiAgICAgIH07XG4gICAgfVxuICB9IGVsc2UgaWYgKG1ldGEudXNlVmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgIC8vIE5vdGU6IGl0J3Mgc2FmZSB0byB1c2UgYG1ldGEudXNlVmFsdWVgIGluc3RlYWQgb2YgdGhlIGBVU0VfVkFMVUUgaW4gbWV0YWAgY2hlY2sgdXNlZCBmb3JcbiAgICAvLyBjbGllbnQgY29kZSBiZWNhdXNlIG1ldGEudXNlVmFsdWUgaXMgYW4gRXhwcmVzc2lvbiB3aGljaCB3aWxsIGJlIGRlZmluZWQgZXZlbiBpZiB0aGUgYWN0dWFsXG4gICAgLy8gdmFsdWUgaXMgdW5kZWZpbmVkLlxuICAgIHJlc3VsdCA9IGNvbXBpbGVGYWN0b3J5RnVuY3Rpb24oe1xuICAgICAgLi4uZmFjdG9yeU1ldGEsXG4gICAgICBleHByZXNzaW9uOiBtZXRhLnVzZVZhbHVlLmV4cHJlc3Npb24sXG4gICAgfSk7XG4gIH0gZWxzZSBpZiAobWV0YS51c2VFeGlzdGluZyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgLy8gdXNlRXhpc3RpbmcgaXMgYW4gYGluamVjdGAgY2FsbCBvbiB0aGUgZXhpc3RpbmcgdG9rZW4uXG4gICAgcmVzdWx0ID0gY29tcGlsZUZhY3RvcnlGdW5jdGlvbih7XG4gICAgICAuLi5mYWN0b3J5TWV0YSxcbiAgICAgIGV4cHJlc3Npb246IG8uaW1wb3J0RXhwcihJZGVudGlmaWVycy5pbmplY3QpLmNhbGxGbihbbWV0YS51c2VFeGlzdGluZy5leHByZXNzaW9uXSksXG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgcmVzdWx0ID0ge1xuICAgICAgc3RhdGVtZW50czogW10sXG4gICAgICBleHByZXNzaW9uOiBkZWxlZ2F0ZVRvRmFjdG9yeShcbiAgICAgICAgICBtZXRhLnR5cGUudmFsdWUgYXMgby5XcmFwcGVkTm9kZUV4cHI8YW55PiwgbWV0YS5pbnRlcm5hbFR5cGUgYXMgby5XcmFwcGVkTm9kZUV4cHI8YW55PixcbiAgICAgICAgICByZXNvbHZlRm9yd2FyZFJlZnMpXG4gICAgfTtcbiAgfVxuXG4gIGNvbnN0IHRva2VuID0gbWV0YS5pbnRlcm5hbFR5cGU7XG5cbiAgY29uc3QgaW5qZWN0YWJsZVByb3BzID1cbiAgICAgIG5ldyBEZWZpbml0aW9uTWFwPHt0b2tlbjogby5FeHByZXNzaW9uLCBmYWN0b3J5OiBvLkV4cHJlc3Npb24sIHByb3ZpZGVkSW46IG8uRXhwcmVzc2lvbn0+KCk7XG4gIGluamVjdGFibGVQcm9wcy5zZXQoJ3Rva2VuJywgdG9rZW4pO1xuICBpbmplY3RhYmxlUHJvcHMuc2V0KCdmYWN0b3J5JywgcmVzdWx0LmV4cHJlc3Npb24pO1xuXG4gIC8vIE9ubHkgZ2VuZXJhdGUgcHJvdmlkZWRJbiBwcm9wZXJ0eSBpZiBpdCBoYXMgYSBub24tbnVsbCB2YWx1ZVxuICBpZiAoKG1ldGEucHJvdmlkZWRJbi5leHByZXNzaW9uIGFzIG8uTGl0ZXJhbEV4cHIpLnZhbHVlICE9PSBudWxsKSB7XG4gICAgaW5qZWN0YWJsZVByb3BzLnNldChcbiAgICAgICAgJ3Byb3ZpZGVkSW4nLFxuICAgICAgICBtZXRhLnByb3ZpZGVkSW4uaXNGb3J3YXJkUmVmID8gZ2VuZXJhdGVGb3J3YXJkUmVmKG1ldGEucHJvdmlkZWRJbi5leHByZXNzaW9uKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRhLnByb3ZpZGVkSW4uZXhwcmVzc2lvbik7XG4gIH1cblxuICBjb25zdCBleHByZXNzaW9uID0gby5pbXBvcnRFeHByKElkZW50aWZpZXJzLsm1ybVkZWZpbmVJbmplY3RhYmxlKVxuICAgICAgICAgICAgICAgICAgICAgICAgIC5jYWxsRm4oW2luamVjdGFibGVQcm9wcy50b0xpdGVyYWxNYXAoKV0sIHVuZGVmaW5lZCwgdHJ1ZSk7XG4gIHJldHVybiB7XG4gICAgZXhwcmVzc2lvbixcbiAgICB0eXBlOiBjcmVhdGVJbmplY3RhYmxlVHlwZShtZXRhKSxcbiAgICBzdGF0ZW1lbnRzOiByZXN1bHQuc3RhdGVtZW50cyxcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUluamVjdGFibGVUeXBlKG1ldGE6IFIzSW5qZWN0YWJsZU1ldGFkYXRhKSB7XG4gIHJldHVybiBuZXcgby5FeHByZXNzaW9uVHlwZShvLmltcG9ydEV4cHIoXG4gICAgICBJZGVudGlmaWVycy5JbmplY3RhYmxlRGVjbGFyYXRpb24sXG4gICAgICBbdHlwZVdpdGhQYXJhbWV0ZXJzKG1ldGEudHlwZS50eXBlLCBtZXRhLnR5cGVBcmd1bWVudENvdW50KV0pKTtcbn1cblxuZnVuY3Rpb24gZGVsZWdhdGVUb0ZhY3RvcnkoXG4gICAgdHlwZTogby5XcmFwcGVkTm9kZUV4cHI8YW55PiwgaW50ZXJuYWxUeXBlOiBvLldyYXBwZWROb2RlRXhwcjxhbnk+LFxuICAgIHVud3JhcEZvcndhcmRSZWZzOiBib29sZWFuKTogby5FeHByZXNzaW9uIHtcbiAgaWYgKHR5cGUubm9kZSA9PT0gaW50ZXJuYWxUeXBlLm5vZGUpIHtcbiAgICAvLyBUaGUgdHlwZXMgYXJlIHRoZSBzYW1lLCBzbyB3ZSBjYW4gc2ltcGx5IGRlbGVnYXRlIGRpcmVjdGx5IHRvIHRoZSB0eXBlJ3MgZmFjdG9yeS5cbiAgICAvLyBgYGBcbiAgICAvLyBmYWN0b3J5OiB0eXBlLsm1ZmFjXG4gICAgLy8gYGBgXG4gICAgcmV0dXJuIGludGVybmFsVHlwZS5wcm9wKCfJtWZhYycpO1xuICB9XG5cbiAgaWYgKCF1bndyYXBGb3J3YXJkUmVmcykge1xuICAgIC8vIFRoZSB0eXBlIGlzIG5vdCB3cmFwcGVkIGluIGEgYGZvcndhcmRSZWYoKWAsIHNvIHdlIGNyZWF0ZSBhIHNpbXBsZSBmYWN0b3J5IGZ1bmN0aW9uIHRoYXRcbiAgICAvLyBhY2NlcHRzIGEgc3ViLXR5cGUgYXMgYW4gYXJndW1lbnQuXG4gICAgLy8gYGBgXG4gICAgLy8gZmFjdG9yeTogZnVuY3Rpb24odCkgeyByZXR1cm4gaW50ZXJuYWxUeXBlLsm1ZmFjKHQpOyB9XG4gICAgLy8gYGBgXG4gICAgcmV0dXJuIGNyZWF0ZUZhY3RvcnlGdW5jdGlvbihpbnRlcm5hbFR5cGUpO1xuICB9XG5cbiAgLy8gVGhlIGludGVybmFsVHlwZSBpcyBhY3R1YWxseSB3cmFwcGVkIGluIGEgYGZvcndhcmRSZWYoKWAgc28gd2UgbmVlZCB0byByZXNvbHZlIHRoYXQgYmVmb3JlXG4gIC8vIGNhbGxpbmcgaXRzIGZhY3RvcnkuXG4gIC8vIGBgYFxuICAvLyBmYWN0b3J5OiBmdW5jdGlvbih0KSB7IHJldHVybiBjb3JlLnJlc29sdmVGb3J3YXJkUmVmKHR5cGUpLsm1ZmFjKHQpOyB9XG4gIC8vIGBgYFxuICBjb25zdCB1bndyYXBwZWRUeXBlID0gby5pbXBvcnRFeHByKElkZW50aWZpZXJzLnJlc29sdmVGb3J3YXJkUmVmKS5jYWxsRm4oW2ludGVybmFsVHlwZV0pO1xuICByZXR1cm4gY3JlYXRlRmFjdG9yeUZ1bmN0aW9uKHVud3JhcHBlZFR5cGUpO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVGYWN0b3J5RnVuY3Rpb24odHlwZTogby5FeHByZXNzaW9uKTogby5GdW5jdGlvbkV4cHIge1xuICByZXR1cm4gby5mbihcbiAgICAgIFtuZXcgby5GblBhcmFtKCd0Jywgby5EWU5BTUlDX1RZUEUpXSxcbiAgICAgIFtuZXcgby5SZXR1cm5TdGF0ZW1lbnQodHlwZS5jYWxsTWV0aG9kKCfJtWZhYycsIFtvLnZhcmlhYmxlKCd0JyldKSldKTtcbn1cbiJdfQ==