/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as o from './output/output_ast';
import { compileFactoryFunction, FactoryTarget, R3FactoryDelegateType, } from './render3/r3_factory';
import { Identifiers } from './render3/r3_identifiers';
import { convertFromMaybeForwardRefExpression, typeWithParameters, } from './render3/util';
import { DefinitionMap } from './render3/view/util';
export function compileInjectable(meta, resolveForwardRefs) {
    let result = null;
    const factoryMeta = {
        name: meta.name,
        type: meta.type,
        typeArgumentCount: meta.typeArgumentCount,
        deps: [],
        target: FactoryTarget.Injectable,
    };
    if (meta.useClass !== undefined) {
        // meta.useClass has two modes of operation. Either deps are specified, in which case `new` is
        // used to instantiate the class with dependencies injected, or deps are not specified and
        // the factory of the class is used to instantiate it.
        //
        // A special case exists for useClass: Type where Type is the injectable type itself and no
        // deps are specified, in which case 'useClass' is effectively ignored.
        const useClassOnSelf = meta.useClass.expression.isEquivalent(meta.type.value);
        let deps = undefined;
        if (meta.deps !== undefined) {
            deps = meta.deps;
        }
        if (deps !== undefined) {
            // factory: () => new meta.useClass(...deps)
            result = compileFactoryFunction({
                ...factoryMeta,
                delegate: meta.useClass.expression,
                delegateDeps: deps,
                delegateType: R3FactoryDelegateType.Class,
            });
        }
        else if (useClassOnSelf) {
            result = compileFactoryFunction(factoryMeta);
        }
        else {
            result = {
                statements: [],
                expression: delegateToFactory(meta.type.value, meta.useClass.expression, resolveForwardRefs),
            };
        }
    }
    else if (meta.useFactory !== undefined) {
        if (meta.deps !== undefined) {
            result = compileFactoryFunction({
                ...factoryMeta,
                delegate: meta.useFactory,
                delegateDeps: meta.deps || [],
                delegateType: R3FactoryDelegateType.Function,
            });
        }
        else {
            result = { statements: [], expression: o.arrowFn([], meta.useFactory.callFn([])) };
        }
    }
    else if (meta.useValue !== undefined) {
        // Note: it's safe to use `meta.useValue` instead of the `USE_VALUE in meta` check used for
        // client code because meta.useValue is an Expression which will be defined even if the actual
        // value is undefined.
        result = compileFactoryFunction({
            ...factoryMeta,
            expression: meta.useValue.expression,
        });
    }
    else if (meta.useExisting !== undefined) {
        // useExisting is an `inject` call on the existing token.
        result = compileFactoryFunction({
            ...factoryMeta,
            expression: o.importExpr(Identifiers.inject).callFn([meta.useExisting.expression]),
        });
    }
    else {
        result = {
            statements: [],
            expression: delegateToFactory(meta.type.value, meta.type.value, resolveForwardRefs),
        };
    }
    const token = meta.type.value;
    const injectableProps = new DefinitionMap();
    injectableProps.set('token', token);
    injectableProps.set('factory', result.expression);
    // Only generate providedIn property if it has a non-null value
    if (meta.providedIn.expression.value !== null) {
        injectableProps.set('providedIn', convertFromMaybeForwardRefExpression(meta.providedIn));
    }
    const expression = o
        .importExpr(Identifiers.ɵɵdefineInjectable)
        .callFn([injectableProps.toLiteralMap()], undefined, true);
    return {
        expression,
        type: createInjectableType(meta),
        statements: result.statements,
    };
}
export function createInjectableType(meta) {
    return new o.ExpressionType(o.importExpr(Identifiers.InjectableDeclaration, [
        typeWithParameters(meta.type.type, meta.typeArgumentCount),
    ]));
}
function delegateToFactory(type, useType, unwrapForwardRefs) {
    if (type.node === useType.node) {
        // The types are the same, so we can simply delegate directly to the type's factory.
        // ```
        // factory: type.ɵfac
        // ```
        return useType.prop('ɵfac');
    }
    if (!unwrapForwardRefs) {
        // The type is not wrapped in a `forwardRef()`, so we create a simple factory function that
        // accepts a sub-type as an argument.
        // ```
        // factory: function(t) { return useType.ɵfac(t); }
        // ```
        return createFactoryFunction(useType);
    }
    // The useType is actually wrapped in a `forwardRef()` so we need to resolve that before
    // calling its factory.
    // ```
    // factory: function(t) { return core.resolveForwardRef(type).ɵfac(t); }
    // ```
    const unwrappedType = o.importExpr(Identifiers.resolveForwardRef).callFn([useType]);
    return createFactoryFunction(unwrappedType);
}
function createFactoryFunction(type) {
    return o.arrowFn([new o.FnParam('t', o.DYNAMIC_TYPE)], type.prop('ɵfac').callFn([o.variable('t')]));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5qZWN0YWJsZV9jb21waWxlcl8yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL2luamVjdGFibGVfY29tcGlsZXJfMi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEtBQUssQ0FBQyxNQUFNLHFCQUFxQixDQUFDO0FBQ3pDLE9BQU8sRUFDTCxzQkFBc0IsRUFDdEIsYUFBYSxFQUViLHFCQUFxQixHQUV0QixNQUFNLHNCQUFzQixDQUFDO0FBQzlCLE9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSwwQkFBMEIsQ0FBQztBQUNyRCxPQUFPLEVBQ0wsb0NBQW9DLEVBTXBDLGtCQUFrQixHQUNuQixNQUFNLGdCQUFnQixDQUFDO0FBQ3hCLE9BQU8sRUFBQyxhQUFhLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQWNsRCxNQUFNLFVBQVUsaUJBQWlCLENBQy9CLElBQTBCLEVBQzFCLGtCQUEyQjtJQUUzQixJQUFJLE1BQU0sR0FBaUUsSUFBSSxDQUFDO0lBRWhGLE1BQU0sV0FBVyxHQUFzQjtRQUNyQyxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUk7UUFDZixJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUk7UUFDZixpQkFBaUIsRUFBRSxJQUFJLENBQUMsaUJBQWlCO1FBQ3pDLElBQUksRUFBRSxFQUFFO1FBQ1IsTUFBTSxFQUFFLGFBQWEsQ0FBQyxVQUFVO0tBQ2pDLENBQUM7SUFFRixJQUFJLElBQUksQ0FBQyxRQUFRLEtBQUssU0FBUyxFQUFFLENBQUM7UUFDaEMsOEZBQThGO1FBQzlGLDBGQUEwRjtRQUMxRixzREFBc0Q7UUFDdEQsRUFBRTtRQUNGLDJGQUEyRjtRQUMzRix1RUFBdUU7UUFFdkUsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFD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SSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDdkIsMkZBQTJGO1FBQzNGLHFDQUFxQztRQUNyQyxNQUFNO1FBQ04sbURBQW1EO1FBQ25ELE1BQU07UUFDTixPQUFPLHFCQUFxQixDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3hDLENBQUM7SUFFRCx3RkFBd0Y7SUFDeEYsdUJBQXVCO0lBQ3ZCLE1BQU07SUFDTix3RUFBd0U7SUFDeEUsTUFBTTtJQUNOLE1BQU0sYUFBYSxHQUFHLENBQUMsQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLGlCQUFpQixDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztJQUNwRixPQUFPLHFCQUFxQixDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQzlDLENBQUM7QUFFRCxTQUFTLHFCQUFxQixDQUFDLElBQWtCO0lBQy9DLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FDZCxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLEVBQ3BDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQzVDLENBQUM7QUFDSixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIG8gZnJvbSAnLi9vdXRwdXQvb3V0cHV0X2FzdCc7XG5pbXBvcnQge1xuICBjb21waWxlRmFjdG9yeUZ1bmN0aW9uLFxuICBGYWN0b3J5VGFyZ2V0LFxuICBSM0RlcGVuZGVuY3lNZXRhZGF0YSxcbiAgUjNGYWN0b3J5RGVsZWdhdGVUeXBlLFxuICBSM0ZhY3RvcnlNZXRhZGF0YSxcbn0gZnJvbSAnLi9yZW5kZXIzL3IzX2ZhY3RvcnknO1xuaW1wb3J0IHtJZGVudGlmaWVyc30gZnJvbSAnLi9yZW5kZXIzL3IzX2lkZW50aWZpZXJzJztcbmltcG9ydCB7XG4gIGNvbnZlcnRGcm9tTWF5YmVGb3J3YXJkUmVmRXhwcmVzc2lvbixcbiAgRm9yd2FyZFJlZkhhbmRsaW5nLFxuICBnZW5lcmF0ZUZvcndhcmRSZWYsXG4gIE1heWJlRm9yd2FyZFJlZkV4cHJlc3Npb24sXG4gIFIzQ29tcGlsZWRFeHByZXNzaW9uLFxuICBSM1JlZmVyZW5jZSxcbiAgdHlwZVdpdGhQYXJhbWV0ZXJzLFxufSBmcm9tICcuL3JlbmRlcjMvdXRpbCc7XG5pbXBvcnQge0RlZmluaXRpb25NYXB9IGZyb20gJy4vcmVuZGVyMy92aWV3L3V0aWwnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFIzSW5qZWN0YWJsZU1ldGFkYXRhIHtcbiAgbmFtZTogc3RyaW5nO1xuICB0eXBlOiBSM1JlZmVyZW5jZTtcbiAgdHlwZUFyZ3VtZW50Q291bnQ6IG51bWJlcjtcbiAgcHJvdmlkZWRJbjogTWF5YmVGb3J3YXJkUmVmRXhwcmVzc2lvbjtcbiAgdXNlQ2xhc3M/OiBNYXliZUZvcndhcmRSZWZFeHByZXNzaW9uO1xuICB1c2VGYWN0b3J5Pzogby5FeHByZXNzaW9uO1xuICB1c2VFeGlzdGluZz86IE1heWJlRm9yd2FyZFJlZkV4cHJlc3Npb247XG4gIHVzZVZhbHVlPzogTWF5YmVGb3J3YXJkUmVmRXhwcmVzc2lvbjtcbiAgZGVwcz86IFIzRGVwZW5kZW5jeU1ldGFkYXRhW107XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb21waWxlSW5qZWN0YWJsZShcbiAgbWV0YTogUjNJbmplY3RhYmxlTWV0YWRhdGEsXG4gIHJlc29sdmVGb3J3YXJkUmVmczogYm9vbGVhbixcbik6IFIzQ29tcGlsZWRFeHByZXNzaW9uIHtcbiAgbGV0IHJlc3VsdDoge2V4cHJlc3Npb246IG8uRXhwcmVzc2lvbjsgc3RhdGVtZW50czogby5TdGF0ZW1lbnRbXX0gfCBudWxsID0gbnVsbDtcblxuICBjb25zdCBmYWN0b3J5TWV0YTogUjNGYWN0b3J5TWV0YWRhdGEgPSB7XG4gICAgbmFtZTogbWV0YS5uYW1lLFxuICAgIHR5cGU6IG1ldGEudHlwZSxcbiAgICB0eXBlQXJndW1lbnRDb3VudDogbWV0YS50eXBlQXJndW1lbnRDb3VudCxcbiAgICBkZXBzOiBbXSxcbiAgICB0YXJnZXQ6IEZhY3RvcnlUYXJnZXQuSW5qZWN0YWJsZSxcbiAgfTtcblxuICBpZiAobWV0YS51c2VDbGFzcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgLy8gbWV0YS51c2VDbGFzcyBoYXMgdHdvIG1vZGVzIG9mIG9wZXJhdGlvbi4gRWl0aGVyIGRlcHMgYXJlIHNwZWNpZmllZCwgaW4gd2hpY2ggY2FzZSBgbmV3YCBpc1xuICAgIC8vIHVzZWQgdG8gaW5zdGFudGlhdGUgdGhlIGNsYXNzIHdpdGggZGVwZW5kZW5jaWVzIGluamVjdGVkLCBvciBkZXBzIGFyZSBub3Qgc3BlY2lmaWVkIGFuZFxuICAgIC8vIHRoZSBmYWN0b3J5IG9mIHRoZSBjbGFzcyBpcyB1c2VkIHRvIGluc3RhbnRpYXRlIGl0LlxuICAgIC8vXG4gICAgLy8gQSBzcGVjaWFsIGNhc2UgZXhpc3RzIGZvciB1c2VDbGFzczogVHlwZSB3aGVyZSBUeXBlIGlzIHRoZSBpbmplY3RhYmxlIHR5cGUgaXRzZWxmIGFuZCBub1xuICAgIC8vIGRlcHMgYXJlIHNwZWNpZmllZCwgaW4gd2hpY2ggY2FzZSAndXNlQ2xhc3MnIGlzIGVmZmVjdGl2ZWx5IGlnbm9yZWQuXG5cbiAgICBjb25zdCB1c2VDbGFzc09uU2VsZiA9IG1ldGEudXNlQ2xhc3MuZXhwcmVzc2lvbi5pc0VxdWl2YWxlbnQobWV0YS50eXBlLnZhbHVlKTtcbiAgICBsZXQgZGVwczogUjNEZXBlbmRlbmN5TWV0YWRhdGFbXSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBpZiAobWV0YS5kZXBzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGRlcHMgPSBtZXRhLmRlcHM7XG4gICAgfVxuXG4gICAgaWYgKGRlcHMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgLy8gZmFjdG9yeTogKCkgPT4gbmV3IG1ldGEudXNlQ2xhc3MoLi4uZGVwcylcbiAgICAgIHJlc3VsdCA9IGNvbXBpbGVGYWN0b3J5RnVuY3Rpb24oe1xuICAgICAgICAuLi5mYWN0b3J5TWV0YSxcbiAgICAgICAgZGVsZWdhdGU6IG1ldGEudXNlQ2xhc3MuZXhwcmVzc2lvbixcbiAgICAgICAgZGVsZWdhdGVEZXBzOiBkZXBzLFxuICAgICAgICBkZWxlZ2F0ZVR5cGU6IFIzRmFjdG9yeURlbGVnYXRlVHlwZS5DbGFzcyxcbiAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAodXNlQ2xhc3NPblNlbGYpIHtcbiAgICAgIHJlc3VsdCA9IGNvbXBpbGVGYWN0b3J5RnVuY3Rpb24oZmFjdG9yeU1ldGEpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIHN0YXRlbWVudHM6IFtdLFxuICAgICAgICBleHByZXNzaW9uOiBkZWxlZ2F0ZVRvRmFjdG9yeShcbiAgICAgICAgICBtZXRhLnR5cGUudmFsdWUgYXMgby5XcmFwcGVkTm9kZUV4cHI8YW55PixcbiAgICAgICAgICBtZXRhLnVzZUNsYXNzLmV4cHJlc3Npb24gYXMgby5XcmFwcGVkTm9kZUV4cHI8YW55PixcbiAgICAgICAgICByZXNvbHZlRm9yd2FyZFJlZnMsXG4gICAgICAgICksXG4gICAgICB9O1xuICAgIH1cbiAgfSBlbHNlIGlmIChtZXRhLnVzZUZhY3RvcnkgIT09IHVuZGVmaW5lZCkge1xuICAgIGlmIChtZXRhLmRlcHMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmVzdWx0ID0gY29tcGlsZUZhY3RvcnlGdW5jdGlvbih7XG4gICAgICAgIC4uLmZhY3RvcnlNZXRhLFxuICAgICAgICBkZWxlZ2F0ZTogbWV0YS51c2VGYWN0b3J5LFxuICAgICAgICBkZWxlZ2F0ZURlcHM6IG1ldGEuZGVwcyB8fCBbXSxcbiAgICAgICAgZGVsZWdhdGVUeXBlOiBSM0ZhY3RvcnlEZWxlZ2F0ZVR5cGUuRnVuY3Rpb24sXG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0ID0ge3N0YXRlbWVudHM6IFtdLCBleHByZXNzaW9uOiBvLmFycm93Rm4oW10sIG1ldGEudXNlRmFjdG9yeS5jYWxsRm4oW10pKX07XG4gICAgfVxuICB9IGVsc2UgaWYgKG1ldGEudXNlVmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgIC8vIE5vdGU6IGl0J3Mgc2FmZSB0byB1c2UgYG1ldGEudXNlVmFsdWVgIGluc3RlYWQgb2YgdGhlIGBVU0VfVkFMVUUgaW4gbWV0YWAgY2hlY2sgdXNlZCBmb3JcbiAgICAvLyBjbGllbnQgY29kZSBiZWNhdXNlIG1ldGEudXNlVmFsdWUgaXMgYW4gRXhwcmVzc2lvbiB3aGljaCB3aWxsIGJlIGRlZmluZWQgZXZlbiBpZiB0aGUgYWN0dWFsXG4gICAgLy8gdmFsdWUgaXMgdW5kZWZpbmVkLlxuICAgIHJlc3VsdCA9IGNvbXBpbGVGYWN0b3J5RnVuY3Rpb24oe1xuICAgICAgLi4uZmFjdG9yeU1ldGEsXG4gICAgICBleHByZXNzaW9uOiBtZXRhLnVzZVZhbHVlLmV4cHJlc3Npb24sXG4gICAgfSk7XG4gIH0gZWxzZSBpZiAobWV0YS51c2VFeGlzdGluZyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgLy8gdXNlRXhpc3RpbmcgaXMgYW4gYGluamVjdGAgY2FsbCBvbiB0aGUgZXhpc3RpbmcgdG9rZW4uXG4gICAgcmVzdWx0ID0gY29tcGlsZUZhY3RvcnlGdW5jdGlvbih7XG4gICAgICAuLi5mYWN0b3J5TWV0YSxcbiAgICAgIGV4cHJlc3Npb246IG8uaW1wb3J0RXhwcihJZGVudGlmaWVycy5pbmplY3QpLmNhbGxGbihbbWV0YS51c2VFeGlzdGluZy5leHByZXNzaW9uXSksXG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgcmVzdWx0ID0ge1xuICAgICAgc3RhdGVtZW50czogW10sXG4gICAgICBleHByZXNzaW9uOiBkZWxlZ2F0ZVRvRmFjdG9yeShcbiAgICAgICAgbWV0YS50eXBlLnZhbHVlIGFzIG8uV3JhcHBlZE5vZGVFeHByPGFueT4sXG4gICAgICAgIG1ldGEudHlwZS52YWx1ZSBhcyBvLldyYXBwZWROb2RlRXhwcjxhbnk+LFxuICAgICAgICByZXNvbHZlRm9yd2FyZFJlZnMsXG4gICAgICApLFxuICAgIH07XG4gIH1cblxuICBjb25zdCB0b2tlbiA9IG1ldGEudHlwZS52YWx1ZTtcblxuICBjb25zdCBpbmplY3RhYmxlUHJvcHMgPSBuZXcgRGVmaW5pdGlvbk1hcDx7XG4gICAgdG9rZW46IG8uRXhwcmVzc2lvbjtcbiAgICBmYWN0b3J5OiBvLkV4cHJlc3Npb247XG4gICAgcHJvdmlkZWRJbjogby5FeHByZXNzaW9uO1xuICB9PigpO1xuICBpbmplY3RhYmxlUHJvcHMuc2V0KCd0b2tlbicsIHRva2VuKTtcbiAgaW5qZWN0YWJsZVByb3BzLnNldCgnZmFjdG9yeScsIHJlc3VsdC5leHByZXNzaW9uKTtcblxuICAvLyBPbmx5IGdlbmVyYXRlIHByb3ZpZGVkSW4gcHJvcGVydHkgaWYgaXQgaGFzIGEgbm9uLW51bGwgdmFsdWVcbiAgaWYgKChtZXRhLnByb3ZpZGVkSW4uZXhwcmVzc2lvbiBhcyBvLkxpdGVyYWxFeHByKS52YWx1ZSAhPT0gbnVsbCkge1xuICAgIGluamVjdGFibGVQcm9wcy5zZXQoJ3Byb3ZpZGVkSW4nLCBjb252ZXJ0RnJvbU1heWJlRm9yd2FyZFJlZkV4cHJlc3Npb24obWV0YS5wcm92aWRlZEluKSk7XG4gIH1cblxuICBjb25zdCBleHByZXNzaW9uID0gb1xuICAgIC5pbXBvcnRFeHByKElkZW50aWZpZXJzLsm1ybVkZWZpbmVJbmplY3RhYmxlKVxuICAgIC5jYWxsRm4oW2luamVjdGFibGVQcm9wcy50b0xpdGVyYWxNYXAoKV0sIHVuZGVmaW5lZCwgdHJ1ZSk7XG4gIHJldHVybiB7XG4gICAgZXhwcmVzc2lvbixcbiAgICB0eXBlOiBjcmVhdGVJbmplY3RhYmxlVHlwZShtZXRhKSxcbiAgICBzdGF0ZW1lbnRzOiByZXN1bHQuc3RhdGVtZW50cyxcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUluamVjdGFibGVUeXBlKG1ldGE6IFIzSW5qZWN0YWJsZU1ldGFkYXRhKSB7XG4gIHJldHVybiBuZXcgby5FeHByZXNzaW9uVHlwZShcbiAgICBvLmltcG9ydEV4cHIoSWRlbnRpZmllcnMuSW5qZWN0YWJsZURlY2xhcmF0aW9uLCBbXG4gICAgICB0eXBlV2l0aFBhcmFtZXRlcnMobWV0YS50eXBlLnR5cGUsIG1ldGEudHlwZUFyZ3VtZW50Q291bnQpLFxuICAgIF0pLFxuICApO1xufVxuXG5mdW5jdGlvbiBkZWxlZ2F0ZVRvRmFjdG9yeShcbiAgdHlwZTogby5XcmFwcGVkTm9kZUV4cHI8YW55PixcbiAgdXNlVHlwZTogby5XcmFwcGVkTm9kZUV4cHI8YW55PixcbiAgdW53cmFwRm9yd2FyZFJlZnM6IGJvb2xlYW4sXG4pOiBvLkV4cHJlc3Npb24ge1xuICBpZiAodHlwZS5ub2RlID09PSB1c2VUeXBlLm5vZGUpIHtcbiAgICAvLyBUaGUgdHlwZXMgYXJlIHRoZSBzYW1lLCBzbyB3ZSBjYW4gc2ltcGx5IGRlbGVnYXRlIGRpcmVjdGx5IHRvIHRoZSB0eXBlJ3MgZmFjdG9yeS5cbiAgICAvLyBgYGBcbiAgICAvLyBmYWN0b3J5OiB0eXBlLsm1ZmFjXG4gICAgLy8gYGBgXG4gICAgcmV0dXJuIHVzZVR5cGUucHJvcCgnybVmYWMnKTtcbiAgfVxuXG4gIGlmICghdW53cmFwRm9yd2FyZFJlZnMpIHtcbiAgICAvLyBUaGUgdHlwZSBpcyBub3Qgd3JhcHBlZCBpbiBhIGBmb3J3YXJkUmVmKClgLCBzbyB3ZSBjcmVhdGUgYSBzaW1wbGUgZmFjdG9yeSBmdW5jdGlvbiB0aGF0XG4gICAgLy8gYWNjZXB0cyBhIHN1Yi10eXBlIGFzIGFuIGFyZ3VtZW50LlxuICAgIC8vIGBgYFxuICAgIC8vIGZhY3Rvcnk6IGZ1bmN0aW9uKHQpIHsgcmV0dXJuIHVzZVR5cGUuybVmYWModCk7IH1cbiAgICAvLyBgYGBcbiAgICByZXR1cm4gY3JlYXRlRmFjdG9yeUZ1bmN0aW9uKHVzZVR5cGUpO1xuICB9XG5cbiAgLy8gVGhlIHVzZVR5cGUgaXMgYWN0dWFsbHkgd3JhcHBlZCBpbiBhIGBmb3J3YXJkUmVmKClgIHNvIHdlIG5lZWQgdG8gcmVzb2x2ZSB0aGF0IGJlZm9yZVxuICAvLyBjYWxsaW5nIGl0cyBmYWN0b3J5LlxuICAvLyBgYGBcbiAgLy8gZmFjdG9yeTogZnVuY3Rpb24odCkgeyByZXR1cm4gY29yZS5yZXNvbHZlRm9yd2FyZFJlZih0eXBlKS7JtWZhYyh0KTsgfVxuICAvLyBgYGBcbiAgY29uc3QgdW53cmFwcGVkVHlwZSA9IG8uaW1wb3J0RXhwcihJZGVudGlmaWVycy5yZXNvbHZlRm9yd2FyZFJlZikuY2FsbEZuKFt1c2VUeXBlXSk7XG4gIHJldHVybiBjcmVhdGVGYWN0b3J5RnVuY3Rpb24odW53cmFwcGVkVHlwZSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUZhY3RvcnlGdW5jdGlvbih0eXBlOiBvLkV4cHJlc3Npb24pOiBvLkFycm93RnVuY3Rpb25FeHByIHtcbiAgcmV0dXJuIG8uYXJyb3dGbihcbiAgICBbbmV3IG8uRm5QYXJhbSgndCcsIG8uRFlOQU1JQ19UWVBFKV0sXG4gICAgdHlwZS5wcm9wKCfJtWZhYycpLmNhbGxGbihbby52YXJpYWJsZSgndCcpXSksXG4gICk7XG59XG4iXX0=