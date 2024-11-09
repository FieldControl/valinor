/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as o from './output/output_ast';
import { compileFactoryFunction, FactoryTarget, R3FactoryDelegateType } from './render3/r3_factory';
import { Identifiers } from './render3/r3_identifiers';
import { convertFromMaybeForwardRefExpression, typeWithParameters } from './render3/util';
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
                expression: delegateToFactory(meta.type.value, meta.useClass.expression, resolveForwardRefs)
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
            expression: delegateToFactory(meta.type.value, meta.type.value, resolveForwardRefs)
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
    const expression = o.importExpr(Identifiers.ɵɵdefineInjectable)
        .callFn([injectableProps.toLiteralMap()], undefined, true);
    return {
        expression,
        type: createInjectableType(meta),
        statements: result.statements,
    };
}
export function createInjectableType(meta) {
    return new o.ExpressionType(o.importExpr(Identifiers.InjectableDeclaration, [typeWithParameters(meta.type.type, meta.typeArgumentCount)]));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5qZWN0YWJsZV9jb21waWxlcl8yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL2luamVjdGFibGVfY29tcGlsZXJfMi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEtBQUssQ0FBQyxNQUFNLHFCQUFxQixDQUFDO0FBQ3pDLE9BQU8sRUFBQyxzQkFBc0IsRUFBRSxhQUFhLEVBQXdCLHFCQUFxQixFQUFvQixNQUFNLHNCQUFzQixDQUFDO0FBQzNJLE9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSwwQkFBMEIsQ0FBQztBQUNyRCxPQUFPLEVBQUMsb0NBQW9DLEVBQXdHLGtCQUFrQixFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDOUwsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBY2xELE1BQU0sVUFBVSxpQkFBaUIsQ0FDN0IsSUFBMEIsRUFBRSxrQkFBMkI7SUFDekQsSUFBSSxNQUFNLEdBQStELElBQUksQ0FBQztJQUU5RSxNQUFNLFdBQVcsR0FBc0I7UUFDckMsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJO1FBQ2YsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJO1FBQ2YsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLGlCQUFpQjtRQUN6QyxJQUFJLEVBQUUsRUFBRTtRQUNSLE1BQU0sRUFBRSxhQUFhLENBQUMsVUFBVTtLQUNqQyxDQUFDO0lBRUYsSUFBSSxJQUFJLENBQUMsUUFBUSxLQUFLLFNBQVMsRUFBRSxDQUFDO1FBQ2hDLDhGQUE4RjtRQUM5RiwwRkFBMEY7UUFDMUYsc0RBQXNEO1FBQ3RELEVBQUU7UUFDRiwyRkFBMkY7UUFDM0YsdUVBQXVFO1FBRXZFLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxD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QUMsaUJBQWlCLEVBQUUsQ0FBQztRQUN2QiwyRkFBMkY7UUFDM0YscUNBQXFDO1FBQ3JDLE1BQU07UUFDTixtREFBbUQ7UUFDbkQsTUFBTTtRQUNOLE9BQU8scUJBQXFCLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDeEMsQ0FBQztJQUVELHdGQUF3RjtJQUN4Rix1QkFBdUI7SUFDdkIsTUFBTTtJQUNOLHdFQUF3RTtJQUN4RSxNQUFNO0lBQ04sTUFBTSxhQUFhLEdBQUcsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBQ3BGLE9BQU8scUJBQXFCLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDOUMsQ0FBQztBQUVELFNBQVMscUJBQXFCLENBQUMsSUFBa0I7SUFDL0MsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUNaLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDekYsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBvIGZyb20gJy4vb3V0cHV0L291dHB1dF9hc3QnO1xuaW1wb3J0IHtjb21waWxlRmFjdG9yeUZ1bmN0aW9uLCBGYWN0b3J5VGFyZ2V0LCBSM0RlcGVuZGVuY3lNZXRhZGF0YSwgUjNGYWN0b3J5RGVsZWdhdGVUeXBlLCBSM0ZhY3RvcnlNZXRhZGF0YX0gZnJvbSAnLi9yZW5kZXIzL3IzX2ZhY3RvcnknO1xuaW1wb3J0IHtJZGVudGlmaWVyc30gZnJvbSAnLi9yZW5kZXIzL3IzX2lkZW50aWZpZXJzJztcbmltcG9ydCB7Y29udmVydEZyb21NYXliZUZvcndhcmRSZWZFeHByZXNzaW9uLCBGb3J3YXJkUmVmSGFuZGxpbmcsIGdlbmVyYXRlRm9yd2FyZFJlZiwgTWF5YmVGb3J3YXJkUmVmRXhwcmVzc2lvbiwgUjNDb21waWxlZEV4cHJlc3Npb24sIFIzUmVmZXJlbmNlLCB0eXBlV2l0aFBhcmFtZXRlcnN9IGZyb20gJy4vcmVuZGVyMy91dGlsJztcbmltcG9ydCB7RGVmaW5pdGlvbk1hcH0gZnJvbSAnLi9yZW5kZXIzL3ZpZXcvdXRpbCc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgUjNJbmplY3RhYmxlTWV0YWRhdGEge1xuICBuYW1lOiBzdHJpbmc7XG4gIHR5cGU6IFIzUmVmZXJlbmNlO1xuICB0eXBlQXJndW1lbnRDb3VudDogbnVtYmVyO1xuICBwcm92aWRlZEluOiBNYXliZUZvcndhcmRSZWZFeHByZXNzaW9uO1xuICB1c2VDbGFzcz86IE1heWJlRm9yd2FyZFJlZkV4cHJlc3Npb247XG4gIHVzZUZhY3Rvcnk/OiBvLkV4cHJlc3Npb247XG4gIHVzZUV4aXN0aW5nPzogTWF5YmVGb3J3YXJkUmVmRXhwcmVzc2lvbjtcbiAgdXNlVmFsdWU/OiBNYXliZUZvcndhcmRSZWZFeHByZXNzaW9uO1xuICBkZXBzPzogUjNEZXBlbmRlbmN5TWV0YWRhdGFbXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbXBpbGVJbmplY3RhYmxlKFxuICAgIG1ldGE6IFIzSW5qZWN0YWJsZU1ldGFkYXRhLCByZXNvbHZlRm9yd2FyZFJlZnM6IGJvb2xlYW4pOiBSM0NvbXBpbGVkRXhwcmVzc2lvbiB7XG4gIGxldCByZXN1bHQ6IHtleHByZXNzaW9uOiBvLkV4cHJlc3Npb24sIHN0YXRlbWVudHM6IG8uU3RhdGVtZW50W119fG51bGwgPSBudWxsO1xuXG4gIGNvbnN0IGZhY3RvcnlNZXRhOiBSM0ZhY3RvcnlNZXRhZGF0YSA9IHtcbiAgICBuYW1lOiBtZXRhLm5hbWUsXG4gICAgdHlwZTogbWV0YS50eXBlLFxuICAgIHR5cGVBcmd1bWVudENvdW50OiBtZXRhLnR5cGVBcmd1bWVudENvdW50LFxuICAgIGRlcHM6IFtdLFxuICAgIHRhcmdldDogRmFjdG9yeVRhcmdldC5JbmplY3RhYmxlLFxuICB9O1xuXG4gIGlmIChtZXRhLnVzZUNsYXNzICE9PSB1bmRlZmluZWQpIHtcbiAgICAvLyBtZXRhLnVzZUNsYXNzIGhhcyB0d28gbW9kZXMgb2Ygb3BlcmF0aW9uLiBFaXRoZXIgZGVwcyBhcmUgc3BlY2lmaWVkLCBpbiB3aGljaCBjYXNlIGBuZXdgIGlzXG4gICAgLy8gdXNlZCB0byBpbnN0YW50aWF0ZSB0aGUgY2xhc3Mgd2l0aCBkZXBlbmRlbmNpZXMgaW5qZWN0ZWQsIG9yIGRlcHMgYXJlIG5vdCBzcGVjaWZpZWQgYW5kXG4gICAgLy8gdGhlIGZhY3Rvcnkgb2YgdGhlIGNsYXNzIGlzIHVzZWQgdG8gaW5zdGFudGlhdGUgaXQuXG4gICAgLy9cbiAgICAvLyBBIHNwZWNpYWwgY2FzZSBleGlzdHMgZm9yIHVzZUNsYXNzOiBUeXBlIHdoZXJlIFR5cGUgaXMgdGhlIGluamVjdGFibGUgdHlwZSBpdHNlbGYgYW5kIG5vXG4gICAgLy8gZGVwcyBhcmUgc3BlY2lmaWVkLCBpbiB3aGljaCBjYXNlICd1c2VDbGFzcycgaXMgZWZmZWN0aXZlbHkgaWdub3JlZC5cblxuICAgIGNvbnN0IHVzZUNsYXNzT25TZWxmID0gbWV0YS51c2VDbGFzcy5leHByZXNzaW9uLmlzRXF1aXZhbGVudChtZXRhLnR5cGUudmFsdWUpO1xuICAgIGxldCBkZXBzOiBSM0RlcGVuZGVuY3lNZXRhZGF0YVtdfHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBpZiAobWV0YS5kZXBzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGRlcHMgPSBtZXRhLmRlcHM7XG4gICAgfVxuXG4gICAgaWYgKGRlcHMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgLy8gZmFjdG9yeTogKCkgPT4gbmV3IG1ldGEudXNlQ2xhc3MoLi4uZGVwcylcbiAgICAgIHJlc3VsdCA9IGNvbXBpbGVGYWN0b3J5RnVuY3Rpb24oe1xuICAgICAgICAuLi5mYWN0b3J5TWV0YSxcbiAgICAgICAgZGVsZWdhdGU6IG1ldGEudXNlQ2xhc3MuZXhwcmVzc2lvbixcbiAgICAgICAgZGVsZWdhdGVEZXBzOiBkZXBzLFxuICAgICAgICBkZWxlZ2F0ZVR5cGU6IFIzRmFjdG9yeURlbGVnYXRlVHlwZS5DbGFzcyxcbiAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAodXNlQ2xhc3NPblNlbGYpIHtcbiAgICAgIHJlc3VsdCA9IGNvbXBpbGVGYWN0b3J5RnVuY3Rpb24oZmFjdG9yeU1ldGEpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIHN0YXRlbWVudHM6IFtdLFxuICAgICAgICBleHByZXNzaW9uOiBkZWxlZ2F0ZVRvRmFjdG9yeShcbiAgICAgICAgICAgIG1ldGEudHlwZS52YWx1ZSBhcyBvLldyYXBwZWROb2RlRXhwcjxhbnk+LFxuICAgICAgICAgICAgbWV0YS51c2VDbGFzcy5leHByZXNzaW9uIGFzIG8uV3JhcHBlZE5vZGVFeHByPGFueT4sIHJlc29sdmVGb3J3YXJkUmVmcylcbiAgICAgIH07XG4gICAgfVxuICB9IGVsc2UgaWYgKG1ldGEudXNlRmFjdG9yeSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgaWYgKG1ldGEuZGVwcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXN1bHQgPSBjb21waWxlRmFjdG9yeUZ1bmN0aW9uKHtcbiAgICAgICAgLi4uZmFjdG9yeU1ldGEsXG4gICAgICAgIGRlbGVnYXRlOiBtZXRhLnVzZUZhY3RvcnksXG4gICAgICAgIGRlbGVnYXRlRGVwczogbWV0YS5kZXBzIHx8IFtdLFxuICAgICAgICBkZWxlZ2F0ZVR5cGU6IFIzRmFjdG9yeURlbGVnYXRlVHlwZS5GdW5jdGlvbixcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHQgPSB7c3RhdGVtZW50czogW10sIGV4cHJlc3Npb246IG8uYXJyb3dGbihbXSwgbWV0YS51c2VGYWN0b3J5LmNhbGxGbihbXSkpfTtcbiAgICB9XG4gIH0gZWxzZSBpZiAobWV0YS51c2VWYWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgLy8gTm90ZTogaXQncyBzYWZlIHRvIHVzZSBgbWV0YS51c2VWYWx1ZWAgaW5zdGVhZCBvZiB0aGUgYFVTRV9WQUxVRSBpbiBtZXRhYCBjaGVjayB1c2VkIGZvclxuICAgIC8vIGNsaWVudCBjb2RlIGJlY2F1c2UgbWV0YS51c2VWYWx1ZSBpcyBhbiBFeHByZXNzaW9uIHdoaWNoIHdpbGwgYmUgZGVmaW5lZCBldmVuIGlmIHRoZSBhY3R1YWxcbiAgICAvLyB2YWx1ZSBpcyB1bmRlZmluZWQuXG4gICAgcmVzdWx0ID0gY29tcGlsZUZhY3RvcnlGdW5jdGlvbih7XG4gICAgICAuLi5mYWN0b3J5TWV0YSxcbiAgICAgIGV4cHJlc3Npb246IG1ldGEudXNlVmFsdWUuZXhwcmVzc2lvbixcbiAgICB9KTtcbiAgfSBlbHNlIGlmIChtZXRhLnVzZUV4aXN0aW5nICE9PSB1bmRlZmluZWQpIHtcbiAgICAvLyB1c2VFeGlzdGluZyBpcyBhbiBgaW5qZWN0YCBjYWxsIG9uIHRoZSBleGlzdGluZyB0b2tlbi5cbiAgICByZXN1bHQgPSBjb21waWxlRmFjdG9yeUZ1bmN0aW9uKHtcbiAgICAgIC4uLmZhY3RvcnlNZXRhLFxuICAgICAgZXhwcmVzc2lvbjogby5pbXBvcnRFeHByKElkZW50aWZpZXJzLmluamVjdCkuY2FsbEZuKFttZXRhLnVzZUV4aXN0aW5nLmV4cHJlc3Npb25dKSxcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICByZXN1bHQgPSB7XG4gICAgICBzdGF0ZW1lbnRzOiBbXSxcbiAgICAgIGV4cHJlc3Npb246IGRlbGVnYXRlVG9GYWN0b3J5KFxuICAgICAgICAgIG1ldGEudHlwZS52YWx1ZSBhcyBvLldyYXBwZWROb2RlRXhwcjxhbnk+LCBtZXRhLnR5cGUudmFsdWUgYXMgby5XcmFwcGVkTm9kZUV4cHI8YW55PixcbiAgICAgICAgICByZXNvbHZlRm9yd2FyZFJlZnMpXG4gICAgfTtcbiAgfVxuXG4gIGNvbnN0IHRva2VuID0gbWV0YS50eXBlLnZhbHVlO1xuXG4gIGNvbnN0IGluamVjdGFibGVQcm9wcyA9XG4gICAgICBuZXcgRGVmaW5pdGlvbk1hcDx7dG9rZW46IG8uRXhwcmVzc2lvbiwgZmFjdG9yeTogby5FeHByZXNzaW9uLCBwcm92aWRlZEluOiBvLkV4cHJlc3Npb259PigpO1xuICBpbmplY3RhYmxlUHJvcHMuc2V0KCd0b2tlbicsIHRva2VuKTtcbiAgaW5qZWN0YWJsZVByb3BzLnNldCgnZmFjdG9yeScsIHJlc3VsdC5leHByZXNzaW9uKTtcblxuICAvLyBPbmx5IGdlbmVyYXRlIHByb3ZpZGVkSW4gcHJvcGVydHkgaWYgaXQgaGFzIGEgbm9uLW51bGwgdmFsdWVcbiAgaWYgKChtZXRhLnByb3ZpZGVkSW4uZXhwcmVzc2lvbiBhcyBvLkxpdGVyYWxFeHByKS52YWx1ZSAhPT0gbnVsbCkge1xuICAgIGluamVjdGFibGVQcm9wcy5zZXQoJ3Byb3ZpZGVkSW4nLCBjb252ZXJ0RnJvbU1heWJlRm9yd2FyZFJlZkV4cHJlc3Npb24obWV0YS5wcm92aWRlZEluKSk7XG4gIH1cblxuICBjb25zdCBleHByZXNzaW9uID0gby5pbXBvcnRFeHByKElkZW50aWZpZXJzLsm1ybVkZWZpbmVJbmplY3RhYmxlKVxuICAgICAgICAgICAgICAgICAgICAgICAgIC5jYWxsRm4oW2luamVjdGFibGVQcm9wcy50b0xpdGVyYWxNYXAoKV0sIHVuZGVmaW5lZCwgdHJ1ZSk7XG4gIHJldHVybiB7XG4gICAgZXhwcmVzc2lvbixcbiAgICB0eXBlOiBjcmVhdGVJbmplY3RhYmxlVHlwZShtZXRhKSxcbiAgICBzdGF0ZW1lbnRzOiByZXN1bHQuc3RhdGVtZW50cyxcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUluamVjdGFibGVUeXBlKG1ldGE6IFIzSW5qZWN0YWJsZU1ldGFkYXRhKSB7XG4gIHJldHVybiBuZXcgby5FeHByZXNzaW9uVHlwZShvLmltcG9ydEV4cHIoXG4gICAgICBJZGVudGlmaWVycy5JbmplY3RhYmxlRGVjbGFyYXRpb24sXG4gICAgICBbdHlwZVdpdGhQYXJhbWV0ZXJzKG1ldGEudHlwZS50eXBlLCBtZXRhLnR5cGVBcmd1bWVudENvdW50KV0pKTtcbn1cblxuZnVuY3Rpb24gZGVsZWdhdGVUb0ZhY3RvcnkoXG4gICAgdHlwZTogby5XcmFwcGVkTm9kZUV4cHI8YW55PiwgdXNlVHlwZTogby5XcmFwcGVkTm9kZUV4cHI8YW55PixcbiAgICB1bndyYXBGb3J3YXJkUmVmczogYm9vbGVhbik6IG8uRXhwcmVzc2lvbiB7XG4gIGlmICh0eXBlLm5vZGUgPT09IHVzZVR5cGUubm9kZSkge1xuICAgIC8vIFRoZSB0eXBlcyBhcmUgdGhlIHNhbWUsIHNvIHdlIGNhbiBzaW1wbHkgZGVsZWdhdGUgZGlyZWN0bHkgdG8gdGhlIHR5cGUncyBmYWN0b3J5LlxuICAgIC8vIGBgYFxuICAgIC8vIGZhY3Rvcnk6IHR5cGUuybVmYWNcbiAgICAvLyBgYGBcbiAgICByZXR1cm4gdXNlVHlwZS5wcm9wKCfJtWZhYycpO1xuICB9XG5cbiAgaWYgKCF1bndyYXBGb3J3YXJkUmVmcykge1xuICAgIC8vIFRoZSB0eXBlIGlzIG5vdCB3cmFwcGVkIGluIGEgYGZvcndhcmRSZWYoKWAsIHNvIHdlIGNyZWF0ZSBhIHNpbXBsZSBmYWN0b3J5IGZ1bmN0aW9uIHRoYXRcbiAgICAvLyBhY2NlcHRzIGEgc3ViLXR5cGUgYXMgYW4gYXJndW1lbnQuXG4gICAgLy8gYGBgXG4gICAgLy8gZmFjdG9yeTogZnVuY3Rpb24odCkgeyByZXR1cm4gdXNlVHlwZS7JtWZhYyh0KTsgfVxuICAgIC8vIGBgYFxuICAgIHJldHVybiBjcmVhdGVGYWN0b3J5RnVuY3Rpb24odXNlVHlwZSk7XG4gIH1cblxuICAvLyBUaGUgdXNlVHlwZSBpcyBhY3R1YWxseSB3cmFwcGVkIGluIGEgYGZvcndhcmRSZWYoKWAgc28gd2UgbmVlZCB0byByZXNvbHZlIHRoYXQgYmVmb3JlXG4gIC8vIGNhbGxpbmcgaXRzIGZhY3RvcnkuXG4gIC8vIGBgYFxuICAvLyBmYWN0b3J5OiBmdW5jdGlvbih0KSB7IHJldHVybiBjb3JlLnJlc29sdmVGb3J3YXJkUmVmKHR5cGUpLsm1ZmFjKHQpOyB9XG4gIC8vIGBgYFxuICBjb25zdCB1bndyYXBwZWRUeXBlID0gby5pbXBvcnRFeHByKElkZW50aWZpZXJzLnJlc29sdmVGb3J3YXJkUmVmKS5jYWxsRm4oW3VzZVR5cGVdKTtcbiAgcmV0dXJuIGNyZWF0ZUZhY3RvcnlGdW5jdGlvbih1bndyYXBwZWRUeXBlKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlRmFjdG9yeUZ1bmN0aW9uKHR5cGU6IG8uRXhwcmVzc2lvbik6IG8uQXJyb3dGdW5jdGlvbkV4cHIge1xuICByZXR1cm4gby5hcnJvd0ZuKFxuICAgICAgW25ldyBvLkZuUGFyYW0oJ3QnLCBvLkRZTkFNSUNfVFlQRSldLCB0eXBlLnByb3AoJ8m1ZmFjJykuY2FsbEZuKFtvLnZhcmlhYmxlKCd0JyldKSk7XG59XG4iXX0=