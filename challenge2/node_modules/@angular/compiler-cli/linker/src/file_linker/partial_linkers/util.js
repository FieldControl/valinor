(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/linker/src/file_linker/partial_linkers/util", ["require", "exports", "@angular/compiler", "@angular/compiler/src/output/output_ast", "@angular/compiler-cli/linker/src/fatal_linker_error"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.extractForwardRef = exports.getDependency = exports.parseEnum = exports.wrapReference = void 0;
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var compiler_1 = require("@angular/compiler");
    var o = require("@angular/compiler/src/output/output_ast");
    var fatal_linker_error_1 = require("@angular/compiler-cli/linker/src/fatal_linker_error");
    function wrapReference(wrapped) {
        return { value: wrapped, type: wrapped };
    }
    exports.wrapReference = wrapReference;
    /**
     * Parses the value of an enum from the AST value's symbol name.
     */
    function parseEnum(value, Enum) {
        var symbolName = value.getSymbolName();
        if (symbolName === null) {
            throw new fatal_linker_error_1.FatalLinkerError(value.expression, 'Expected value to have a symbol name');
        }
        var enumValue = Enum[symbolName];
        if (enumValue === undefined) {
            throw new fatal_linker_error_1.FatalLinkerError(value.expression, "Unsupported enum value for " + Enum);
        }
        return enumValue;
    }
    exports.parseEnum = parseEnum;
    /**
     * Parse a dependency structure from an AST object.
     */
    function getDependency(depObj) {
        var isAttribute = depObj.has('attribute') && depObj.getBoolean('attribute');
        var token = depObj.getOpaque('token');
        // Normally `attribute` is a string literal and so its `attributeNameType` is the same string
        // literal. If the `attribute` is some other expression, the `attributeNameType` would be the
        // `unknown` type. It is not possible to generate this when linking, since it only deals with JS
        // and not typings. When linking the existence of the `attributeNameType` only acts as a marker to
        // change the injection instruction that is generated, so we just pass the literal string
        // `"unknown"`.
        var attributeNameType = isAttribute ? o.literal('unknown') : null;
        return {
            token: token,
            attributeNameType: attributeNameType,
            host: depObj.has('host') && depObj.getBoolean('host'),
            optional: depObj.has('optional') && depObj.getBoolean('optional'),
            self: depObj.has('self') && depObj.getBoolean('self'),
            skipSelf: depObj.has('skipSelf') && depObj.getBoolean('skipSelf'),
        };
    }
    exports.getDependency = getDependency;
    /**
     * Return an `R3ProviderExpression` that represents either the extracted type reference expression
     * from a `forwardRef` function call, or the type itself.
     *
     * For example, the expression `forwardRef(function() { return FooDir; })` returns `FooDir`. Note
     * that this expression is required to be wrapped in a closure, as otherwise the forward reference
     * would be resolved before initialization.
     *
     * If there is no forwardRef call expression then we just return the opaque type.
     */
    function extractForwardRef(expr) {
        if (!expr.isCallExpression()) {
            return compiler_1.createR3ProviderExpression(expr.getOpaque(), /* isForwardRef */ false);
        }
        var callee = expr.getCallee();
        if (callee.getSymbolName() !== 'forwardRef') {
            throw new fatal_linker_error_1.FatalLinkerError(callee.expression, 'Unsupported expression, expected a `forwardRef()` call or a type reference');
        }
        var args = expr.getArguments();
        if (args.length !== 1) {
            throw new fatal_linker_error_1.FatalLinkerError(expr, 'Unsupported `forwardRef(fn)` call, expected a single argument');
        }
        var wrapperFn = args[0];
        if (!wrapperFn.isFunction()) {
            throw new fatal_linker_error_1.FatalLinkerError(wrapperFn, 'Unsupported `forwardRef(fn)` call, expected its argument to be a function');
        }
        return compiler_1.createR3ProviderExpression(wrapperFn.getFunctionReturnValue().getOpaque(), true);
    }
    exports.extractForwardRef = extractForwardRef;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9saW5rZXIvc3JjL2ZpbGVfbGlua2VyL3BhcnRpYWxfbGlua2Vycy91dGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztJQUFBOzs7Ozs7T0FNRztJQUNILDhDQUFtSjtJQUNuSiwyREFBNkQ7SUFHN0QsMEZBQTBEO0lBRTFELFNBQWdCLGFBQWEsQ0FBYyxPQUF1QztRQUNoRixPQUFPLEVBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFDLENBQUM7SUFDekMsQ0FBQztJQUZELHNDQUVDO0lBRUQ7O09BRUc7SUFDSCxTQUFnQixTQUFTLENBQ3JCLEtBQXFDLEVBQUUsSUFBVztRQUNwRCxJQUFNLFVBQVUsR0FBRyxLQUFLLENBQUMsYUFBYSxFQUFFLENBQUM7UUFDekMsSUFBSSxVQUFVLEtBQUssSUFBSSxFQUFFO1lBQ3ZCLE1BQU0sSUFBSSxxQ0FBZ0IsQ0FBQyxLQUFLLENBQUMsVUFBVSxFQUFFLHNDQUFzQyxDQUFDLENBQUM7U0FDdEY7UUFDRCxJQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsVUFBK0IsQ0FBQyxDQUFDO1FBQ3hELElBQUksU0FBUyxLQUFLLFNBQVMsRUFBRTtZQUMzQixNQUFNLElBQUkscUNBQWdCLENBQUMsS0FBSyxDQUFDLFVBQVUsRUFBRSxnQ0FBOEIsSUFBTSxDQUFDLENBQUM7U0FDcEY7UUFDRCxPQUFPLFNBQVMsQ0FBQztJQUNuQixDQUFDO0lBWEQsOEJBV0M7SUFFRDs7T0FFRztJQUNILFNBQWdCLGFBQWEsQ0FDekIsTUFBMkQ7UUFDN0QsSUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsSUFBSSxNQUFNLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQzlFLElBQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDeEMsNkZBQTZGO1FBQzdGLDZGQUE2RjtRQUM3RixnR0FBZ0c7UUFDaEcsa0dBQWtHO1FBQ2xHLHlGQUF5RjtRQUN6RixlQUFlO1FBQ2YsSUFBTSxpQkFBaUIsR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUNwRSxPQUFPO1lBQ0wsS0FBSyxPQUFBO1lBQ0wsaUJBQWlCLG1CQUFBO1lBQ2pCLElBQUksRUFBRSxNQUFNLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLE1BQU0sQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDO1lBQ3JELFFBQVEsRUFBRSxNQUFNLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDO1lBQ2pFLElBQUksRUFBRSxNQUFNLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLE1BQU0sQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDO1lBQ3JELFFBQVEsRUFBRSxNQUFNLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDO1NBQ2xFLENBQUM7SUFDSixDQUFDO0lBbkJELHNDQW1CQztJQUdEOzs7Ozs7Ozs7T0FTRztJQUNILFNBQWdCLGlCQUFpQixDQUFjLElBQW9DO1FBRWpGLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsRUFBRTtZQUM1QixPQUFPLHFDQUEwQixDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsRUFBRSxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUMvRTtRQUVELElBQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUNoQyxJQUFJLE1BQU0sQ0FBQyxhQUFhLEVBQUUsS0FBSyxZQUFZLEVBQUU7WUFDM0MsTUFBTSxJQUFJLHFDQUFnQixDQUN0QixNQUFNLENBQUMsVUFBVSxFQUNqQiw0RUFBNEUsQ0FBQyxDQUFDO1NBQ25GO1FBRUQsSUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ2pDLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDckIsTUFBTSxJQUFJLHFDQUFnQixDQUN0QixJQUFJLEVBQUUsK0RBQStELENBQUMsQ0FBQztTQUM1RTtRQUVELElBQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQW9DLENBQUM7UUFDN0QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEVBQUUsRUFBRTtZQUMzQixNQUFNLElBQUkscUNBQWdCLENBQ3RCLFNBQVMsRUFBRSwyRUFBMkUsQ0FBQyxDQUFDO1NBQzdGO1FBRUQsT0FBTyxxQ0FBMEIsQ0FBQyxTQUFTLENBQUMsc0JBQXNCLEVBQUUsQ0FBQyxTQUFTLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUMxRixDQUFDO0lBMUJELDhDQTBCQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtjcmVhdGVSM1Byb3ZpZGVyRXhwcmVzc2lvbiwgUjNEZWNsYXJlRGVwZW5kZW5jeU1ldGFkYXRhLCBSM0RlcGVuZGVuY3lNZXRhZGF0YSwgUjNQcm92aWRlckV4cHJlc3Npb24sIFIzUmVmZXJlbmNlfSBmcm9tICdAYW5ndWxhci9jb21waWxlcic7XG5pbXBvcnQgKiBhcyBvIGZyb20gJ0Bhbmd1bGFyL2NvbXBpbGVyL3NyYy9vdXRwdXQvb3V0cHV0X2FzdCc7XG5cbmltcG9ydCB7QXN0T2JqZWN0LCBBc3RWYWx1ZX0gZnJvbSAnLi4vLi4vYXN0L2FzdF92YWx1ZSc7XG5pbXBvcnQge0ZhdGFsTGlua2VyRXJyb3J9IGZyb20gJy4uLy4uL2ZhdGFsX2xpbmtlcl9lcnJvcic7XG5cbmV4cG9ydCBmdW5jdGlvbiB3cmFwUmVmZXJlbmNlPFRFeHByZXNzaW9uPih3cmFwcGVkOiBvLldyYXBwZWROb2RlRXhwcjxURXhwcmVzc2lvbj4pOiBSM1JlZmVyZW5jZSB7XG4gIHJldHVybiB7dmFsdWU6IHdyYXBwZWQsIHR5cGU6IHdyYXBwZWR9O1xufVxuXG4vKipcbiAqIFBhcnNlcyB0aGUgdmFsdWUgb2YgYW4gZW51bSBmcm9tIHRoZSBBU1QgdmFsdWUncyBzeW1ib2wgbmFtZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlRW51bTxURXhwcmVzc2lvbiwgVEVudW0+KFxuICAgIHZhbHVlOiBBc3RWYWx1ZTx1bmtub3duLCBURXhwcmVzc2lvbj4sIEVudW06IFRFbnVtKTogVEVudW1ba2V5b2YgVEVudW1dIHtcbiAgY29uc3Qgc3ltYm9sTmFtZSA9IHZhbHVlLmdldFN5bWJvbE5hbWUoKTtcbiAgaWYgKHN5bWJvbE5hbWUgPT09IG51bGwpIHtcbiAgICB0aHJvdyBuZXcgRmF0YWxMaW5rZXJFcnJvcih2YWx1ZS5leHByZXNzaW9uLCAnRXhwZWN0ZWQgdmFsdWUgdG8gaGF2ZSBhIHN5bWJvbCBuYW1lJyk7XG4gIH1cbiAgY29uc3QgZW51bVZhbHVlID0gRW51bVtzeW1ib2xOYW1lIGFzIGtleW9mIHR5cGVvZiBFbnVtXTtcbiAgaWYgKGVudW1WYWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhyb3cgbmV3IEZhdGFsTGlua2VyRXJyb3IodmFsdWUuZXhwcmVzc2lvbiwgYFVuc3VwcG9ydGVkIGVudW0gdmFsdWUgZm9yICR7RW51bX1gKTtcbiAgfVxuICByZXR1cm4gZW51bVZhbHVlO1xufVxuXG4vKipcbiAqIFBhcnNlIGEgZGVwZW5kZW5jeSBzdHJ1Y3R1cmUgZnJvbSBhbiBBU1Qgb2JqZWN0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0RGVwZW5kZW5jeTxURXhwcmVzc2lvbj4oXG4gICAgZGVwT2JqOiBBc3RPYmplY3Q8UjNEZWNsYXJlRGVwZW5kZW5jeU1ldGFkYXRhLCBURXhwcmVzc2lvbj4pOiBSM0RlcGVuZGVuY3lNZXRhZGF0YSB7XG4gIGNvbnN0IGlzQXR0cmlidXRlID0gZGVwT2JqLmhhcygnYXR0cmlidXRlJykgJiYgZGVwT2JqLmdldEJvb2xlYW4oJ2F0dHJpYnV0ZScpO1xuICBjb25zdCB0b2tlbiA9IGRlcE9iai5nZXRPcGFxdWUoJ3Rva2VuJyk7XG4gIC8vIE5vcm1hbGx5IGBhdHRyaWJ1dGVgIGlzIGEgc3RyaW5nIGxpdGVyYWwgYW5kIHNvIGl0cyBgYXR0cmlidXRlTmFtZVR5cGVgIGlzIHRoZSBzYW1lIHN0cmluZ1xuICAvLyBsaXRlcmFsLiBJZiB0aGUgYGF0dHJpYnV0ZWAgaXMgc29tZSBvdGhlciBleHByZXNzaW9uLCB0aGUgYGF0dHJpYnV0ZU5hbWVUeXBlYCB3b3VsZCBiZSB0aGVcbiAgLy8gYHVua25vd25gIHR5cGUuIEl0IGlzIG5vdCBwb3NzaWJsZSB0byBnZW5lcmF0ZSB0aGlzIHdoZW4gbGlua2luZywgc2luY2UgaXQgb25seSBkZWFscyB3aXRoIEpTXG4gIC8vIGFuZCBub3QgdHlwaW5ncy4gV2hlbiBsaW5raW5nIHRoZSBleGlzdGVuY2Ugb2YgdGhlIGBhdHRyaWJ1dGVOYW1lVHlwZWAgb25seSBhY3RzIGFzIGEgbWFya2VyIHRvXG4gIC8vIGNoYW5nZSB0aGUgaW5qZWN0aW9uIGluc3RydWN0aW9uIHRoYXQgaXMgZ2VuZXJhdGVkLCBzbyB3ZSBqdXN0IHBhc3MgdGhlIGxpdGVyYWwgc3RyaW5nXG4gIC8vIGBcInVua25vd25cImAuXG4gIGNvbnN0IGF0dHJpYnV0ZU5hbWVUeXBlID0gaXNBdHRyaWJ1dGUgPyBvLmxpdGVyYWwoJ3Vua25vd24nKSA6IG51bGw7XG4gIHJldHVybiB7XG4gICAgdG9rZW4sXG4gICAgYXR0cmlidXRlTmFtZVR5cGUsXG4gICAgaG9zdDogZGVwT2JqLmhhcygnaG9zdCcpICYmIGRlcE9iai5nZXRCb29sZWFuKCdob3N0JyksXG4gICAgb3B0aW9uYWw6IGRlcE9iai5oYXMoJ29wdGlvbmFsJykgJiYgZGVwT2JqLmdldEJvb2xlYW4oJ29wdGlvbmFsJyksXG4gICAgc2VsZjogZGVwT2JqLmhhcygnc2VsZicpICYmIGRlcE9iai5nZXRCb29sZWFuKCdzZWxmJyksXG4gICAgc2tpcFNlbGY6IGRlcE9iai5oYXMoJ3NraXBTZWxmJykgJiYgZGVwT2JqLmdldEJvb2xlYW4oJ3NraXBTZWxmJyksXG4gIH07XG59XG5cblxuLyoqXG4gKiBSZXR1cm4gYW4gYFIzUHJvdmlkZXJFeHByZXNzaW9uYCB0aGF0IHJlcHJlc2VudHMgZWl0aGVyIHRoZSBleHRyYWN0ZWQgdHlwZSByZWZlcmVuY2UgZXhwcmVzc2lvblxuICogZnJvbSBhIGBmb3J3YXJkUmVmYCBmdW5jdGlvbiBjYWxsLCBvciB0aGUgdHlwZSBpdHNlbGYuXG4gKlxuICogRm9yIGV4YW1wbGUsIHRoZSBleHByZXNzaW9uIGBmb3J3YXJkUmVmKGZ1bmN0aW9uKCkgeyByZXR1cm4gRm9vRGlyOyB9KWAgcmV0dXJucyBgRm9vRGlyYC4gTm90ZVxuICogdGhhdCB0aGlzIGV4cHJlc3Npb24gaXMgcmVxdWlyZWQgdG8gYmUgd3JhcHBlZCBpbiBhIGNsb3N1cmUsIGFzIG90aGVyd2lzZSB0aGUgZm9yd2FyZCByZWZlcmVuY2VcbiAqIHdvdWxkIGJlIHJlc29sdmVkIGJlZm9yZSBpbml0aWFsaXphdGlvbi5cbiAqXG4gKiBJZiB0aGVyZSBpcyBubyBmb3J3YXJkUmVmIGNhbGwgZXhwcmVzc2lvbiB0aGVuIHdlIGp1c3QgcmV0dXJuIHRoZSBvcGFxdWUgdHlwZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGV4dHJhY3RGb3J3YXJkUmVmPFRFeHByZXNzaW9uPihleHByOiBBc3RWYWx1ZTx1bmtub3duLCBURXhwcmVzc2lvbj4pOlxuICAgIFIzUHJvdmlkZXJFeHByZXNzaW9uPG8uV3JhcHBlZE5vZGVFeHByPFRFeHByZXNzaW9uPj4ge1xuICBpZiAoIWV4cHIuaXNDYWxsRXhwcmVzc2lvbigpKSB7XG4gICAgcmV0dXJuIGNyZWF0ZVIzUHJvdmlkZXJFeHByZXNzaW9uKGV4cHIuZ2V0T3BhcXVlKCksIC8qIGlzRm9yd2FyZFJlZiAqLyBmYWxzZSk7XG4gIH1cblxuICBjb25zdCBjYWxsZWUgPSBleHByLmdldENhbGxlZSgpO1xuICBpZiAoY2FsbGVlLmdldFN5bWJvbE5hbWUoKSAhPT0gJ2ZvcndhcmRSZWYnKSB7XG4gICAgdGhyb3cgbmV3IEZhdGFsTGlua2VyRXJyb3IoXG4gICAgICAgIGNhbGxlZS5leHByZXNzaW9uLFxuICAgICAgICAnVW5zdXBwb3J0ZWQgZXhwcmVzc2lvbiwgZXhwZWN0ZWQgYSBgZm9yd2FyZFJlZigpYCBjYWxsIG9yIGEgdHlwZSByZWZlcmVuY2UnKTtcbiAgfVxuXG4gIGNvbnN0IGFyZ3MgPSBleHByLmdldEFyZ3VtZW50cygpO1xuICBpZiAoYXJncy5sZW5ndGggIT09IDEpIHtcbiAgICB0aHJvdyBuZXcgRmF0YWxMaW5rZXJFcnJvcihcbiAgICAgICAgZXhwciwgJ1Vuc3VwcG9ydGVkIGBmb3J3YXJkUmVmKGZuKWAgY2FsbCwgZXhwZWN0ZWQgYSBzaW5nbGUgYXJndW1lbnQnKTtcbiAgfVxuXG4gIGNvbnN0IHdyYXBwZXJGbiA9IGFyZ3NbMF0gYXMgQXN0VmFsdWU8RnVuY3Rpb24sIFRFeHByZXNzaW9uPjtcbiAgaWYgKCF3cmFwcGVyRm4uaXNGdW5jdGlvbigpKSB7XG4gICAgdGhyb3cgbmV3IEZhdGFsTGlua2VyRXJyb3IoXG4gICAgICAgIHdyYXBwZXJGbiwgJ1Vuc3VwcG9ydGVkIGBmb3J3YXJkUmVmKGZuKWAgY2FsbCwgZXhwZWN0ZWQgaXRzIGFyZ3VtZW50IHRvIGJlIGEgZnVuY3Rpb24nKTtcbiAgfVxuXG4gIHJldHVybiBjcmVhdGVSM1Byb3ZpZGVyRXhwcmVzc2lvbih3cmFwcGVyRm4uZ2V0RnVuY3Rpb25SZXR1cm5WYWx1ZSgpLmdldE9wYXF1ZSgpLCB0cnVlKTtcbn1cbiJdfQ==