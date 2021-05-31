(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler/src/render3/partial/injectable", ["require", "exports", "@angular/compiler/src/injectable_compiler_2", "@angular/compiler/src/output/output_ast", "@angular/compiler/src/render3/r3_identifiers", "@angular/compiler/src/render3/view/util", "@angular/compiler/src/render3/partial/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createInjectableDefinitionMap = exports.compileDeclareInjectableFromMetadata = void 0;
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var injectable_compiler_2_1 = require("@angular/compiler/src/injectable_compiler_2");
    var o = require("@angular/compiler/src/output/output_ast");
    var r3_identifiers_1 = require("@angular/compiler/src/render3/r3_identifiers");
    var util_1 = require("@angular/compiler/src/render3/view/util");
    var util_2 = require("@angular/compiler/src/render3/partial/util");
    /**
     * Every time we make a breaking change to the declaration interface or partial-linker behavior, we
     * must update this constant to prevent old partial-linkers from incorrectly processing the
     * declaration.
     *
     * Do not include any prerelease in these versions as they are ignored.
     */
    var MINIMUM_PARTIAL_LINKER_VERSION = '12.0.0';
    /**
     * Compile a Injectable declaration defined by the `R3InjectableMetadata`.
     */
    function compileDeclareInjectableFromMetadata(meta) {
        var definitionMap = createInjectableDefinitionMap(meta);
        var expression = o.importExpr(r3_identifiers_1.Identifiers.declareInjectable).callFn([definitionMap.toLiteralMap()]);
        var type = injectable_compiler_2_1.createInjectableType(meta);
        return { expression: expression, type: type, statements: [] };
    }
    exports.compileDeclareInjectableFromMetadata = compileDeclareInjectableFromMetadata;
    /**
     * Gathers the declaration fields for a Injectable into a `DefinitionMap`.
     */
    function createInjectableDefinitionMap(meta) {
        var definitionMap = new util_1.DefinitionMap();
        definitionMap.set('minVersion', o.literal(MINIMUM_PARTIAL_LINKER_VERSION));
        definitionMap.set('version', o.literal('12.0.2'));
        definitionMap.set('ngImport', o.importExpr(r3_identifiers_1.Identifiers.core));
        definitionMap.set('type', meta.internalType);
        // Only generate providedIn property if it has a non-null value
        if (meta.providedIn !== undefined) {
            var providedIn = convertFromProviderExpression(meta.providedIn);
            if (providedIn.value !== null) {
                definitionMap.set('providedIn', providedIn);
            }
        }
        if (meta.useClass !== undefined) {
            definitionMap.set('useClass', convertFromProviderExpression(meta.useClass));
        }
        if (meta.useExisting !== undefined) {
            definitionMap.set('useExisting', convertFromProviderExpression(meta.useExisting));
        }
        if (meta.useValue !== undefined) {
            definitionMap.set('useValue', convertFromProviderExpression(meta.useValue));
        }
        // Factories do not contain `ForwardRef`s since any types are already wrapped in a function call
        // so the types will not be eagerly evaluated. Therefore we do not need to process this expression
        // with `convertFromProviderExpression()`.
        if (meta.useFactory !== undefined) {
            definitionMap.set('useFactory', meta.useFactory);
        }
        if (meta.deps !== undefined) {
            definitionMap.set('deps', o.literalArr(meta.deps.map(util_2.compileDependency)));
        }
        return definitionMap;
    }
    exports.createInjectableDefinitionMap = createInjectableDefinitionMap;
    /**
     * Convert an `R3ProviderExpression` to an `Expression`, possibly wrapping its expression in a
     * `forwardRef()` call.
     *
     * If `R3ProviderExpression.isForwardRef` is true then the expression was originally wrapped in a
     * `forwardRef()` call to prevent the value from being eagerly evaluated in the code.
     *
     * Normally, the linker will statically process the code, putting the `expression` inside a factory
     * function so the `forwardRef()` wrapper is not evaluated before it has been defined. But if the
     * partial declaration is evaluated by the JIT compiler the `forwardRef()` call is still needed to
     * prevent eager evaluation of the `expression`.
     *
     * So in partial declarations, expressions that could be forward-refs are wrapped in `forwardRef()`
     * calls, and this is then unwrapped in the linker as necessary.
     *
     * See `packages/compiler-cli/src/ngtsc/annotations/src/injectable.ts` and
     * `packages/compiler/src/jit_compiler_facade.ts` for more information.
     */
    function convertFromProviderExpression(_a) {
        var expression = _a.expression, isForwardRef = _a.isForwardRef;
        return isForwardRef ? util_2.generateForwardRef(expression) : expression;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5qZWN0YWJsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy9yZW5kZXIzL3BhcnRpYWwvaW5qZWN0YWJsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7SUFBQTs7Ozs7O09BTUc7SUFDSCxxRkFBNkc7SUFDN0csMkRBQTZDO0lBQzdDLCtFQUFvRDtJQUVwRCxnRUFBMkM7SUFHM0MsbUVBQTZEO0lBRTdEOzs7Ozs7T0FNRztJQUNILElBQU0sOEJBQThCLEdBQUcsUUFBUSxDQUFDO0lBRWhEOztPQUVHO0lBQ0gsU0FBZ0Isb0NBQW9DLENBQUMsSUFBMEI7UUFFN0UsSUFBTSxhQUFhLEdBQUcsNkJBQTZCLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFMUQsSUFBTSxVQUFVLEdBQUcsQ0FBQyxDQUFDLFVBQVUsQ0FBQyw0QkFBRSxDQUFDLGlCQUFpQixDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsYUFBYSxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUMsQ0FBQztRQUM3RixJQUFNLElBQUksR0FBRyw0Q0FBb0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUV4QyxPQUFPLEVBQUMsVUFBVSxZQUFBLEVBQUUsSUFBSSxNQUFBLEVBQUUsVUFBVSxFQUFFLEVBQUUsRUFBQyxDQUFDO0lBQzVDLENBQUM7SUFSRCxvRkFRQztJQUVEOztPQUVHO0lBQ0gsU0FBZ0IsNkJBQTZCLENBQUMsSUFBMEI7UUFFdEUsSUFBTSxhQUFhLEdBQUcsSUFBSSxvQkFBYSxFQUErQixDQUFDO1FBRXZFLGFBQWEsQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsOEJBQThCLENBQUMsQ0FBQyxDQUFDO1FBQzNFLGFBQWEsQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDO1FBQzdELGFBQWEsQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsNEJBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ3JELGFBQWEsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUU3QywrREFBK0Q7UUFDL0QsSUFBSSxJQUFJLENBQUMsVUFBVSxLQUFLLFNBQVMsRUFBRTtZQUNqQyxJQUFNLFVBQVUsR0FBRyw2QkFBNkIsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDbEUsSUFBSyxVQUE0QixDQUFDLEtBQUssS0FBSyxJQUFJLEVBQUU7Z0JBQ2hELGFBQWEsQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO2FBQzdDO1NBQ0Y7UUFFRCxJQUFJLElBQUksQ0FBQyxRQUFRLEtBQUssU0FBUyxFQUFFO1lBQy9CLGFBQWEsQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLDZCQUE2QixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1NBQzdFO1FBQ0QsSUFBSSxJQUFJLENBQUMsV0FBVyxLQUFLLFNBQVMsRUFBRTtZQUNsQyxhQUFhLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSw2QkFBNkIsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztTQUNuRjtRQUNELElBQUksSUFBSSxDQUFDLFFBQVEsS0FBSyxTQUFTLEVBQUU7WUFDL0IsYUFBYSxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsNkJBQTZCLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7U0FDN0U7UUFDRCxnR0FBZ0c7UUFDaEcsa0dBQWtHO1FBQ2xHLDBDQUEwQztRQUMxQyxJQUFJLElBQUksQ0FBQyxVQUFVLEtBQUssU0FBUyxFQUFFO1lBQ2pDLGFBQWEsQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztTQUNsRDtRQUVELElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxTQUFTLEVBQUU7WUFDM0IsYUFBYSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyx3QkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUMzRTtRQUVELE9BQU8sYUFBYSxDQUFDO0lBQ3ZCLENBQUM7SUF0Q0Qsc0VBc0NDO0lBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7O09BaUJHO0lBQ0gsU0FBUyw2QkFBNkIsQ0FBQyxFQUFnRDtZQUEvQyxVQUFVLGdCQUFBLEVBQUUsWUFBWSxrQkFBQTtRQUU5RCxPQUFPLFlBQVksQ0FBQyxDQUFDLENBQUMseUJBQWtCLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQztJQUNwRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge2NyZWF0ZUluamVjdGFibGVUeXBlLCBSM0luamVjdGFibGVNZXRhZGF0YSwgUjNQcm92aWRlckV4cHJlc3Npb259IGZyb20gJy4uLy4uL2luamVjdGFibGVfY29tcGlsZXJfMic7XG5pbXBvcnQgKiBhcyBvIGZyb20gJy4uLy4uL291dHB1dC9vdXRwdXRfYXN0JztcbmltcG9ydCB7SWRlbnRpZmllcnMgYXMgUjN9IGZyb20gJy4uL3IzX2lkZW50aWZpZXJzJztcbmltcG9ydCB7UjNDb21waWxlZEV4cHJlc3Npb259IGZyb20gJy4uL3V0aWwnO1xuaW1wb3J0IHtEZWZpbml0aW9uTWFwfSBmcm9tICcuLi92aWV3L3V0aWwnO1xuXG5pbXBvcnQge1IzRGVjbGFyZUluamVjdGFibGVNZXRhZGF0YX0gZnJvbSAnLi9hcGknO1xuaW1wb3J0IHtjb21waWxlRGVwZW5kZW5jeSwgZ2VuZXJhdGVGb3J3YXJkUmVmfSBmcm9tICcuL3V0aWwnO1xuXG4vKipcbiAqIEV2ZXJ5IHRpbWUgd2UgbWFrZSBhIGJyZWFraW5nIGNoYW5nZSB0byB0aGUgZGVjbGFyYXRpb24gaW50ZXJmYWNlIG9yIHBhcnRpYWwtbGlua2VyIGJlaGF2aW9yLCB3ZVxuICogbXVzdCB1cGRhdGUgdGhpcyBjb25zdGFudCB0byBwcmV2ZW50IG9sZCBwYXJ0aWFsLWxpbmtlcnMgZnJvbSBpbmNvcnJlY3RseSBwcm9jZXNzaW5nIHRoZVxuICogZGVjbGFyYXRpb24uXG4gKlxuICogRG8gbm90IGluY2x1ZGUgYW55IHByZXJlbGVhc2UgaW4gdGhlc2UgdmVyc2lvbnMgYXMgdGhleSBhcmUgaWdub3JlZC5cbiAqL1xuY29uc3QgTUlOSU1VTV9QQVJUSUFMX0xJTktFUl9WRVJTSU9OID0gJzEyLjAuMCc7XG5cbi8qKlxuICogQ29tcGlsZSBhIEluamVjdGFibGUgZGVjbGFyYXRpb24gZGVmaW5lZCBieSB0aGUgYFIzSW5qZWN0YWJsZU1ldGFkYXRhYC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbXBpbGVEZWNsYXJlSW5qZWN0YWJsZUZyb21NZXRhZGF0YShtZXRhOiBSM0luamVjdGFibGVNZXRhZGF0YSk6XG4gICAgUjNDb21waWxlZEV4cHJlc3Npb24ge1xuICBjb25zdCBkZWZpbml0aW9uTWFwID0gY3JlYXRlSW5qZWN0YWJsZURlZmluaXRpb25NYXAobWV0YSk7XG5cbiAgY29uc3QgZXhwcmVzc2lvbiA9IG8uaW1wb3J0RXhwcihSMy5kZWNsYXJlSW5qZWN0YWJsZSkuY2FsbEZuKFtkZWZpbml0aW9uTWFwLnRvTGl0ZXJhbE1hcCgpXSk7XG4gIGNvbnN0IHR5cGUgPSBjcmVhdGVJbmplY3RhYmxlVHlwZShtZXRhKTtcblxuICByZXR1cm4ge2V4cHJlc3Npb24sIHR5cGUsIHN0YXRlbWVudHM6IFtdfTtcbn1cblxuLyoqXG4gKiBHYXRoZXJzIHRoZSBkZWNsYXJhdGlvbiBmaWVsZHMgZm9yIGEgSW5qZWN0YWJsZSBpbnRvIGEgYERlZmluaXRpb25NYXBgLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlSW5qZWN0YWJsZURlZmluaXRpb25NYXAobWV0YTogUjNJbmplY3RhYmxlTWV0YWRhdGEpOlxuICAgIERlZmluaXRpb25NYXA8UjNEZWNsYXJlSW5qZWN0YWJsZU1ldGFkYXRhPiB7XG4gIGNvbnN0IGRlZmluaXRpb25NYXAgPSBuZXcgRGVmaW5pdGlvbk1hcDxSM0RlY2xhcmVJbmplY3RhYmxlTWV0YWRhdGE+KCk7XG5cbiAgZGVmaW5pdGlvbk1hcC5zZXQoJ21pblZlcnNpb24nLCBvLmxpdGVyYWwoTUlOSU1VTV9QQVJUSUFMX0xJTktFUl9WRVJTSU9OKSk7XG4gIGRlZmluaXRpb25NYXAuc2V0KCd2ZXJzaW9uJywgby5saXRlcmFsKCcwLjAuMC1QTEFDRUhPTERFUicpKTtcbiAgZGVmaW5pdGlvbk1hcC5zZXQoJ25nSW1wb3J0Jywgby5pbXBvcnRFeHByKFIzLmNvcmUpKTtcbiAgZGVmaW5pdGlvbk1hcC5zZXQoJ3R5cGUnLCBtZXRhLmludGVybmFsVHlwZSk7XG5cbiAgLy8gT25seSBnZW5lcmF0ZSBwcm92aWRlZEluIHByb3BlcnR5IGlmIGl0IGhhcyBhIG5vbi1udWxsIHZhbHVlXG4gIGlmIChtZXRhLnByb3ZpZGVkSW4gIT09IHVuZGVmaW5lZCkge1xuICAgIGNvbnN0IHByb3ZpZGVkSW4gPSBjb252ZXJ0RnJvbVByb3ZpZGVyRXhwcmVzc2lvbihtZXRhLnByb3ZpZGVkSW4pO1xuICAgIGlmICgocHJvdmlkZWRJbiBhcyBvLkxpdGVyYWxFeHByKS52YWx1ZSAhPT0gbnVsbCkge1xuICAgICAgZGVmaW5pdGlvbk1hcC5zZXQoJ3Byb3ZpZGVkSW4nLCBwcm92aWRlZEluKTtcbiAgICB9XG4gIH1cblxuICBpZiAobWV0YS51c2VDbGFzcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgZGVmaW5pdGlvbk1hcC5zZXQoJ3VzZUNsYXNzJywgY29udmVydEZyb21Qcm92aWRlckV4cHJlc3Npb24obWV0YS51c2VDbGFzcykpO1xuICB9XG4gIGlmIChtZXRhLnVzZUV4aXN0aW5nICE9PSB1bmRlZmluZWQpIHtcbiAgICBkZWZpbml0aW9uTWFwLnNldCgndXNlRXhpc3RpbmcnLCBjb252ZXJ0RnJvbVByb3ZpZGVyRXhwcmVzc2lvbihtZXRhLnVzZUV4aXN0aW5nKSk7XG4gIH1cbiAgaWYgKG1ldGEudXNlVmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgIGRlZmluaXRpb25NYXAuc2V0KCd1c2VWYWx1ZScsIGNvbnZlcnRGcm9tUHJvdmlkZXJFeHByZXNzaW9uKG1ldGEudXNlVmFsdWUpKTtcbiAgfVxuICAvLyBGYWN0b3JpZXMgZG8gbm90IGNvbnRhaW4gYEZvcndhcmRSZWZgcyBzaW5jZSBhbnkgdHlwZXMgYXJlIGFscmVhZHkgd3JhcHBlZCBpbiBhIGZ1bmN0aW9uIGNhbGxcbiAgLy8gc28gdGhlIHR5cGVzIHdpbGwgbm90IGJlIGVhZ2VybHkgZXZhbHVhdGVkLiBUaGVyZWZvcmUgd2UgZG8gbm90IG5lZWQgdG8gcHJvY2VzcyB0aGlzIGV4cHJlc3Npb25cbiAgLy8gd2l0aCBgY29udmVydEZyb21Qcm92aWRlckV4cHJlc3Npb24oKWAuXG4gIGlmIChtZXRhLnVzZUZhY3RvcnkgIT09IHVuZGVmaW5lZCkge1xuICAgIGRlZmluaXRpb25NYXAuc2V0KCd1c2VGYWN0b3J5JywgbWV0YS51c2VGYWN0b3J5KTtcbiAgfVxuXG4gIGlmIChtZXRhLmRlcHMgIT09IHVuZGVmaW5lZCkge1xuICAgIGRlZmluaXRpb25NYXAuc2V0KCdkZXBzJywgby5saXRlcmFsQXJyKG1ldGEuZGVwcy5tYXAoY29tcGlsZURlcGVuZGVuY3kpKSk7XG4gIH1cblxuICByZXR1cm4gZGVmaW5pdGlvbk1hcDtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGFuIGBSM1Byb3ZpZGVyRXhwcmVzc2lvbmAgdG8gYW4gYEV4cHJlc3Npb25gLCBwb3NzaWJseSB3cmFwcGluZyBpdHMgZXhwcmVzc2lvbiBpbiBhXG4gKiBgZm9yd2FyZFJlZigpYCBjYWxsLlxuICpcbiAqIElmIGBSM1Byb3ZpZGVyRXhwcmVzc2lvbi5pc0ZvcndhcmRSZWZgIGlzIHRydWUgdGhlbiB0aGUgZXhwcmVzc2lvbiB3YXMgb3JpZ2luYWxseSB3cmFwcGVkIGluIGFcbiAqIGBmb3J3YXJkUmVmKClgIGNhbGwgdG8gcHJldmVudCB0aGUgdmFsdWUgZnJvbSBiZWluZyBlYWdlcmx5IGV2YWx1YXRlZCBpbiB0aGUgY29kZS5cbiAqXG4gKiBOb3JtYWxseSwgdGhlIGxpbmtlciB3aWxsIHN0YXRpY2FsbHkgcHJvY2VzcyB0aGUgY29kZSwgcHV0dGluZyB0aGUgYGV4cHJlc3Npb25gIGluc2lkZSBhIGZhY3RvcnlcbiAqIGZ1bmN0aW9uIHNvIHRoZSBgZm9yd2FyZFJlZigpYCB3cmFwcGVyIGlzIG5vdCBldmFsdWF0ZWQgYmVmb3JlIGl0IGhhcyBiZWVuIGRlZmluZWQuIEJ1dCBpZiB0aGVcbiAqIHBhcnRpYWwgZGVjbGFyYXRpb24gaXMgZXZhbHVhdGVkIGJ5IHRoZSBKSVQgY29tcGlsZXIgdGhlIGBmb3J3YXJkUmVmKClgIGNhbGwgaXMgc3RpbGwgbmVlZGVkIHRvXG4gKiBwcmV2ZW50IGVhZ2VyIGV2YWx1YXRpb24gb2YgdGhlIGBleHByZXNzaW9uYC5cbiAqXG4gKiBTbyBpbiBwYXJ0aWFsIGRlY2xhcmF0aW9ucywgZXhwcmVzc2lvbnMgdGhhdCBjb3VsZCBiZSBmb3J3YXJkLXJlZnMgYXJlIHdyYXBwZWQgaW4gYGZvcndhcmRSZWYoKWBcbiAqIGNhbGxzLCBhbmQgdGhpcyBpcyB0aGVuIHVud3JhcHBlZCBpbiB0aGUgbGlua2VyIGFzIG5lY2Vzc2FyeS5cbiAqXG4gKiBTZWUgYHBhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvbmd0c2MvYW5ub3RhdGlvbnMvc3JjL2luamVjdGFibGUudHNgIGFuZFxuICogYHBhY2thZ2VzL2NvbXBpbGVyL3NyYy9qaXRfY29tcGlsZXJfZmFjYWRlLnRzYCBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cbiAqL1xuZnVuY3Rpb24gY29udmVydEZyb21Qcm92aWRlckV4cHJlc3Npb24oe2V4cHJlc3Npb24sIGlzRm9yd2FyZFJlZn06IFIzUHJvdmlkZXJFeHByZXNzaW9uKTpcbiAgICBvLkV4cHJlc3Npb24ge1xuICByZXR1cm4gaXNGb3J3YXJkUmVmID8gZ2VuZXJhdGVGb3J3YXJkUmVmKGV4cHJlc3Npb24pIDogZXhwcmVzc2lvbjtcbn1cbiJdfQ==