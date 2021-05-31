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
        define("@angular/compiler/src/render3/util", ["require", "exports", "@angular/compiler/src/output/abstract_emitter", "@angular/compiler/src/output/output_ast"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.refsToArray = exports.wrapReference = exports.guardedExpression = exports.devOnlyGuardedExpression = exports.jitOnlyGuardedExpression = exports.prepareSyntheticListenerFunctionName = exports.getSafePropertyAccessString = exports.prepareSyntheticListenerName = exports.prepareSyntheticPropertyName = exports.typeWithParameters = void 0;
    var abstract_emitter_1 = require("@angular/compiler/src/output/abstract_emitter");
    var o = require("@angular/compiler/src/output/output_ast");
    function typeWithParameters(type, numParams) {
        if (numParams === 0) {
            return o.expressionType(type);
        }
        var params = [];
        for (var i = 0; i < numParams; i++) {
            params.push(o.DYNAMIC_TYPE);
        }
        return o.expressionType(type, undefined, params);
    }
    exports.typeWithParameters = typeWithParameters;
    var ANIMATE_SYMBOL_PREFIX = '@';
    function prepareSyntheticPropertyName(name) {
        return "" + ANIMATE_SYMBOL_PREFIX + name;
    }
    exports.prepareSyntheticPropertyName = prepareSyntheticPropertyName;
    function prepareSyntheticListenerName(name, phase) {
        return "" + ANIMATE_SYMBOL_PREFIX + name + "." + phase;
    }
    exports.prepareSyntheticListenerName = prepareSyntheticListenerName;
    function getSafePropertyAccessString(accessor, name) {
        var escapedName = abstract_emitter_1.escapeIdentifier(name, false, false);
        return escapedName !== name ? accessor + "[" + escapedName + "]" : accessor + "." + name;
    }
    exports.getSafePropertyAccessString = getSafePropertyAccessString;
    function prepareSyntheticListenerFunctionName(name, phase) {
        return "animation_" + name + "_" + phase;
    }
    exports.prepareSyntheticListenerFunctionName = prepareSyntheticListenerFunctionName;
    function jitOnlyGuardedExpression(expr) {
        return guardedExpression('ngJitMode', expr);
    }
    exports.jitOnlyGuardedExpression = jitOnlyGuardedExpression;
    function devOnlyGuardedExpression(expr) {
        return guardedExpression('ngDevMode', expr);
    }
    exports.devOnlyGuardedExpression = devOnlyGuardedExpression;
    function guardedExpression(guard, expr) {
        var guardExpr = new o.ExternalExpr({ name: guard, moduleName: null });
        var guardNotDefined = new o.BinaryOperatorExpr(o.BinaryOperator.Identical, new o.TypeofExpr(guardExpr), o.literal('undefined'));
        var guardUndefinedOrTrue = new o.BinaryOperatorExpr(o.BinaryOperator.Or, guardNotDefined, guardExpr, /* type */ undefined, 
        /* sourceSpan */ undefined, true);
        return new o.BinaryOperatorExpr(o.BinaryOperator.And, guardUndefinedOrTrue, expr);
    }
    exports.guardedExpression = guardedExpression;
    function wrapReference(value) {
        var wrapped = new o.WrappedNodeExpr(value);
        return { value: wrapped, type: wrapped };
    }
    exports.wrapReference = wrapReference;
    function refsToArray(refs, shouldForwardDeclare) {
        var values = o.literalArr(refs.map(function (ref) { return ref.value; }));
        return shouldForwardDeclare ? o.fn([], [new o.ReturnStatement(values)]) : values;
    }
    exports.refsToArray = refsToArray;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy9yZW5kZXIzL3V0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBRUgsa0ZBQTREO0lBQzVELDJEQUEwQztJQUUxQyxTQUFnQixrQkFBa0IsQ0FBQyxJQUFrQixFQUFFLFNBQWlCO1FBQ3RFLElBQUksU0FBUyxLQUFLLENBQUMsRUFBRTtZQUNuQixPQUFPLENBQUMsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDL0I7UUFDRCxJQUFNLE1BQU0sR0FBYSxFQUFFLENBQUM7UUFDNUIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUNsQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQztTQUM3QjtRQUNELE9BQU8sQ0FBQyxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ25ELENBQUM7SUFURCxnREFTQztJQWdCRCxJQUFNLHFCQUFxQixHQUFHLEdBQUcsQ0FBQztJQUNsQyxTQUFnQiw0QkFBNEIsQ0FBQyxJQUFZO1FBQ3ZELE9BQU8sS0FBRyxxQkFBcUIsR0FBRyxJQUFNLENBQUM7SUFDM0MsQ0FBQztJQUZELG9FQUVDO0lBRUQsU0FBZ0IsNEJBQTRCLENBQUMsSUFBWSxFQUFFLEtBQWE7UUFDdEUsT0FBTyxLQUFHLHFCQUFxQixHQUFHLElBQUksU0FBSSxLQUFPLENBQUM7SUFDcEQsQ0FBQztJQUZELG9FQUVDO0lBRUQsU0FBZ0IsMkJBQTJCLENBQUMsUUFBZ0IsRUFBRSxJQUFZO1FBQ3hFLElBQU0sV0FBVyxHQUFHLG1DQUFnQixDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDekQsT0FBTyxXQUFXLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBSSxRQUFRLFNBQUksV0FBVyxNQUFHLENBQUMsQ0FBQyxDQUFJLFFBQVEsU0FBSSxJQUFNLENBQUM7SUFDdEYsQ0FBQztJQUhELGtFQUdDO0lBRUQsU0FBZ0Isb0NBQW9DLENBQUMsSUFBWSxFQUFFLEtBQWE7UUFDOUUsT0FBTyxlQUFhLElBQUksU0FBSSxLQUFPLENBQUM7SUFDdEMsQ0FBQztJQUZELG9GQUVDO0lBRUQsU0FBZ0Isd0JBQXdCLENBQUMsSUFBa0I7UUFDekQsT0FBTyxpQkFBaUIsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDOUMsQ0FBQztJQUZELDREQUVDO0lBRUQsU0FBZ0Isd0JBQXdCLENBQUMsSUFBa0I7UUFDekQsT0FBTyxpQkFBaUIsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDOUMsQ0FBQztJQUZELDREQUVDO0lBRUQsU0FBZ0IsaUJBQWlCLENBQUMsS0FBYSxFQUFFLElBQWtCO1FBQ2pFLElBQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxDQUFDLFlBQVksQ0FBQyxFQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7UUFDdEUsSUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLENBQUMsa0JBQWtCLENBQzVDLENBQUMsQ0FBQyxjQUFjLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7UUFDckYsSUFBTSxvQkFBb0IsR0FBRyxJQUFJLENBQUMsQ0FBQyxrQkFBa0IsQ0FDakQsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxFQUFFLEVBQUUsZUFBZSxFQUFFLFNBQVMsRUFBRSxVQUFVLENBQUMsU0FBUztRQUNyRSxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDdEMsT0FBTyxJQUFJLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLEdBQUcsRUFBRSxvQkFBb0IsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNwRixDQUFDO0lBUkQsOENBUUM7SUFFRCxTQUFnQixhQUFhLENBQUMsS0FBVTtRQUN0QyxJQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDN0MsT0FBTyxFQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBQyxDQUFDO0lBQ3pDLENBQUM7SUFIRCxzQ0FHQztJQUVELFNBQWdCLFdBQVcsQ0FBQyxJQUFtQixFQUFFLG9CQUE2QjtRQUM1RSxJQUFNLE1BQU0sR0FBRyxDQUFDLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBQSxHQUFHLElBQUksT0FBQSxHQUFHLENBQUMsS0FBSyxFQUFULENBQVMsQ0FBQyxDQUFDLENBQUM7UUFDeEQsT0FBTyxvQkFBb0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7SUFDbkYsQ0FBQztJQUhELGtDQUdDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7ZXNjYXBlSWRlbnRpZmllcn0gZnJvbSAnLi4vb3V0cHV0L2Fic3RyYWN0X2VtaXR0ZXInO1xuaW1wb3J0ICogYXMgbyBmcm9tICcuLi9vdXRwdXQvb3V0cHV0X2FzdCc7XG5cbmV4cG9ydCBmdW5jdGlvbiB0eXBlV2l0aFBhcmFtZXRlcnModHlwZTogby5FeHByZXNzaW9uLCBudW1QYXJhbXM6IG51bWJlcik6IG8uRXhwcmVzc2lvblR5cGUge1xuICBpZiAobnVtUGFyYW1zID09PSAwKSB7XG4gICAgcmV0dXJuIG8uZXhwcmVzc2lvblR5cGUodHlwZSk7XG4gIH1cbiAgY29uc3QgcGFyYW1zOiBvLlR5cGVbXSA9IFtdO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IG51bVBhcmFtczsgaSsrKSB7XG4gICAgcGFyYW1zLnB1c2goby5EWU5BTUlDX1RZUEUpO1xuICB9XG4gIHJldHVybiBvLmV4cHJlc3Npb25UeXBlKHR5cGUsIHVuZGVmaW5lZCwgcGFyYW1zKTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBSM1JlZmVyZW5jZSB7XG4gIHZhbHVlOiBvLkV4cHJlc3Npb247XG4gIHR5cGU6IG8uRXhwcmVzc2lvbjtcbn1cblxuLyoqXG4gKiBSZXN1bHQgb2YgY29tcGlsYXRpb24gb2YgYSByZW5kZXIzIGNvZGUgdW5pdCwgZS5nLiBjb21wb25lbnQsIGRpcmVjdGl2ZSwgcGlwZSwgZXRjLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFIzQ29tcGlsZWRFeHByZXNzaW9uIHtcbiAgZXhwcmVzc2lvbjogby5FeHByZXNzaW9uO1xuICB0eXBlOiBvLlR5cGU7XG4gIHN0YXRlbWVudHM6IG8uU3RhdGVtZW50W107XG59XG5cbmNvbnN0IEFOSU1BVEVfU1lNQk9MX1BSRUZJWCA9ICdAJztcbmV4cG9ydCBmdW5jdGlvbiBwcmVwYXJlU3ludGhldGljUHJvcGVydHlOYW1lKG5hbWU6IHN0cmluZykge1xuICByZXR1cm4gYCR7QU5JTUFURV9TWU1CT0xfUFJFRklYfSR7bmFtZX1gO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcHJlcGFyZVN5bnRoZXRpY0xpc3RlbmVyTmFtZShuYW1lOiBzdHJpbmcsIHBoYXNlOiBzdHJpbmcpIHtcbiAgcmV0dXJuIGAke0FOSU1BVEVfU1lNQk9MX1BSRUZJWH0ke25hbWV9LiR7cGhhc2V9YDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFNhZmVQcm9wZXJ0eUFjY2Vzc1N0cmluZyhhY2Nlc3Nvcjogc3RyaW5nLCBuYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCBlc2NhcGVkTmFtZSA9IGVzY2FwZUlkZW50aWZpZXIobmFtZSwgZmFsc2UsIGZhbHNlKTtcbiAgcmV0dXJuIGVzY2FwZWROYW1lICE9PSBuYW1lID8gYCR7YWNjZXNzb3J9WyR7ZXNjYXBlZE5hbWV9XWAgOiBgJHthY2Nlc3Nvcn0uJHtuYW1lfWA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwcmVwYXJlU3ludGhldGljTGlzdGVuZXJGdW5jdGlvbk5hbWUobmFtZTogc3RyaW5nLCBwaGFzZTogc3RyaW5nKSB7XG4gIHJldHVybiBgYW5pbWF0aW9uXyR7bmFtZX1fJHtwaGFzZX1gO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaml0T25seUd1YXJkZWRFeHByZXNzaW9uKGV4cHI6IG8uRXhwcmVzc2lvbik6IG8uRXhwcmVzc2lvbiB7XG4gIHJldHVybiBndWFyZGVkRXhwcmVzc2lvbignbmdKaXRNb2RlJywgZXhwcik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZXZPbmx5R3VhcmRlZEV4cHJlc3Npb24oZXhwcjogby5FeHByZXNzaW9uKTogby5FeHByZXNzaW9uIHtcbiAgcmV0dXJuIGd1YXJkZWRFeHByZXNzaW9uKCduZ0Rldk1vZGUnLCBleHByKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGd1YXJkZWRFeHByZXNzaW9uKGd1YXJkOiBzdHJpbmcsIGV4cHI6IG8uRXhwcmVzc2lvbik6IG8uRXhwcmVzc2lvbiB7XG4gIGNvbnN0IGd1YXJkRXhwciA9IG5ldyBvLkV4dGVybmFsRXhwcih7bmFtZTogZ3VhcmQsIG1vZHVsZU5hbWU6IG51bGx9KTtcbiAgY29uc3QgZ3VhcmROb3REZWZpbmVkID0gbmV3IG8uQmluYXJ5T3BlcmF0b3JFeHByKFxuICAgICAgby5CaW5hcnlPcGVyYXRvci5JZGVudGljYWwsIG5ldyBvLlR5cGVvZkV4cHIoZ3VhcmRFeHByKSwgby5saXRlcmFsKCd1bmRlZmluZWQnKSk7XG4gIGNvbnN0IGd1YXJkVW5kZWZpbmVkT3JUcnVlID0gbmV3IG8uQmluYXJ5T3BlcmF0b3JFeHByKFxuICAgICAgby5CaW5hcnlPcGVyYXRvci5PciwgZ3VhcmROb3REZWZpbmVkLCBndWFyZEV4cHIsIC8qIHR5cGUgKi8gdW5kZWZpbmVkLFxuICAgICAgLyogc291cmNlU3BhbiAqLyB1bmRlZmluZWQsIHRydWUpO1xuICByZXR1cm4gbmV3IG8uQmluYXJ5T3BlcmF0b3JFeHByKG8uQmluYXJ5T3BlcmF0b3IuQW5kLCBndWFyZFVuZGVmaW5lZE9yVHJ1ZSwgZXhwcik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3cmFwUmVmZXJlbmNlKHZhbHVlOiBhbnkpOiBSM1JlZmVyZW5jZSB7XG4gIGNvbnN0IHdyYXBwZWQgPSBuZXcgby5XcmFwcGVkTm9kZUV4cHIodmFsdWUpO1xuICByZXR1cm4ge3ZhbHVlOiB3cmFwcGVkLCB0eXBlOiB3cmFwcGVkfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlZnNUb0FycmF5KHJlZnM6IFIzUmVmZXJlbmNlW10sIHNob3VsZEZvcndhcmREZWNsYXJlOiBib29sZWFuKTogby5FeHByZXNzaW9uIHtcbiAgY29uc3QgdmFsdWVzID0gby5saXRlcmFsQXJyKHJlZnMubWFwKHJlZiA9PiByZWYudmFsdWUpKTtcbiAgcmV0dXJuIHNob3VsZEZvcndhcmREZWNsYXJlID8gby5mbihbXSwgW25ldyBvLlJldHVyblN0YXRlbWVudCh2YWx1ZXMpXSkgOiB2YWx1ZXM7XG59XG4iXX0=