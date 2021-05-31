(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler/src/render3/partial/util", ["require", "exports", "@angular/compiler/src/output/output_ast", "@angular/compiler/src/render3/r3_identifiers", "@angular/compiler/src/render3/view/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.generateForwardRef = exports.compileDependency = exports.compileDependencies = exports.toOptionalLiteralMap = exports.toOptionalLiteralArray = void 0;
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var o = require("@angular/compiler/src/output/output_ast");
    var r3_identifiers_1 = require("@angular/compiler/src/render3/r3_identifiers");
    var util_1 = require("@angular/compiler/src/render3/view/util");
    /**
     * Creates an array literal expression from the given array, mapping all values to an expression
     * using the provided mapping function. If the array is empty or null, then null is returned.
     *
     * @param values The array to transfer into literal array expression.
     * @param mapper The logic to use for creating an expression for the array's values.
     * @returns An array literal expression representing `values`, or null if `values` is empty or
     * is itself null.
     */
    function toOptionalLiteralArray(values, mapper) {
        if (values === null || values.length === 0) {
            return null;
        }
        return o.literalArr(values.map(function (value) { return mapper(value); }));
    }
    exports.toOptionalLiteralArray = toOptionalLiteralArray;
    /**
     * Creates an object literal expression from the given object, mapping all values to an expression
     * using the provided mapping function. If the object has no keys, then null is returned.
     *
     * @param object The object to transfer into an object literal expression.
     * @param mapper The logic to use for creating an expression for the object's values.
     * @returns An object literal expression representing `object`, or null if `object` does not have
     * any keys.
     */
    function toOptionalLiteralMap(object, mapper) {
        var entries = Object.keys(object).map(function (key) {
            var value = object[key];
            return { key: key, value: mapper(value), quoted: true };
        });
        if (entries.length > 0) {
            return o.literalMap(entries);
        }
        else {
            return null;
        }
    }
    exports.toOptionalLiteralMap = toOptionalLiteralMap;
    function compileDependencies(deps) {
        if (deps === 'invalid') {
            // The `deps` can be set to the string "invalid"  by the `unwrapConstructorDependencies()`
            // function, which tries to convert `ConstructorDeps` into `R3DependencyMetadata[]`.
            return o.literal('invalid');
        }
        else if (deps === null) {
            return o.literal(null);
        }
        else {
            return o.literalArr(deps.map(compileDependency));
        }
    }
    exports.compileDependencies = compileDependencies;
    function compileDependency(dep) {
        var depMeta = new util_1.DefinitionMap();
        depMeta.set('token', dep.token);
        if (dep.attributeNameType !== null) {
            depMeta.set('attribute', o.literal(true));
        }
        if (dep.host) {
            depMeta.set('host', o.literal(true));
        }
        if (dep.optional) {
            depMeta.set('optional', o.literal(true));
        }
        if (dep.self) {
            depMeta.set('self', o.literal(true));
        }
        if (dep.skipSelf) {
            depMeta.set('skipSelf', o.literal(true));
        }
        return depMeta.toLiteralMap();
    }
    exports.compileDependency = compileDependency;
    /**
     * Generate an expression that has the given `expr` wrapped in the following form:
     *
     * ```
     * forwardRef(() => expr)
     * ```
     */
    function generateForwardRef(expr) {
        return o.importExpr(r3_identifiers_1.Identifiers.forwardRef).callFn([o.fn([], [new o.ReturnStatement(expr)])]);
    }
    exports.generateForwardRef = generateForwardRef;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy9yZW5kZXIzL3BhcnRpYWwvdXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7SUFBQTs7Ozs7O09BTUc7SUFDSCwyREFBNkM7SUFFN0MsK0VBQThDO0lBQzlDLGdFQUEyQztJQUczQzs7Ozs7Ozs7T0FRRztJQUNILFNBQWdCLHNCQUFzQixDQUNsQyxNQUFnQixFQUFFLE1BQWtDO1FBQ3RELElBQUksTUFBTSxLQUFLLElBQUksSUFBSSxNQUFNLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUMxQyxPQUFPLElBQUksQ0FBQztTQUNiO1FBQ0QsT0FBTyxDQUFDLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsVUFBQSxLQUFLLElBQUksT0FBQSxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQWIsQ0FBYSxDQUFDLENBQUMsQ0FBQztJQUMxRCxDQUFDO0lBTkQsd0RBTUM7SUFFRDs7Ozs7Ozs7T0FRRztJQUNILFNBQWdCLG9CQUFvQixDQUNoQyxNQUEwQixFQUFFLE1BQWtDO1FBQ2hFLElBQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQUEsR0FBRztZQUN6QyxJQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDMUIsT0FBTyxFQUFDLEdBQUcsS0FBQSxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBQyxDQUFDO1FBQ25ELENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUN0QixPQUFPLENBQUMsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDOUI7YUFBTTtZQUNMLE9BQU8sSUFBSSxDQUFDO1NBQ2I7SUFDSCxDQUFDO0lBWkQsb0RBWUM7SUFFRCxTQUFnQixtQkFBbUIsQ0FBQyxJQUEyQztRQUU3RSxJQUFJLElBQUksS0FBSyxTQUFTLEVBQUU7WUFDdEIsMEZBQTBGO1lBQzFGLG9GQUFvRjtZQUNwRixPQUFPLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDN0I7YUFBTSxJQUFJLElBQUksS0FBSyxJQUFJLEVBQUU7WUFDeEIsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3hCO2FBQU07WUFDTCxPQUFPLENBQUMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUM7U0FDbEQ7SUFDSCxDQUFDO0lBWEQsa0RBV0M7SUFFRCxTQUFnQixpQkFBaUIsQ0FBQyxHQUF5QjtRQUN6RCxJQUFNLE9BQU8sR0FBRyxJQUFJLG9CQUFhLEVBQStCLENBQUM7UUFDakUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2hDLElBQUksR0FBRyxDQUFDLGlCQUFpQixLQUFLLElBQUksRUFBRTtZQUNsQyxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7U0FDM0M7UUFDRCxJQUFJLEdBQUcsQ0FBQyxJQUFJLEVBQUU7WUFDWixPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7U0FDdEM7UUFDRCxJQUFJLEdBQUcsQ0FBQyxRQUFRLEVBQUU7WUFDaEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1NBQzFDO1FBQ0QsSUFBSSxHQUFHLENBQUMsSUFBSSxFQUFFO1lBQ1osT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1NBQ3RDO1FBQ0QsSUFBSSxHQUFHLENBQUMsUUFBUSxFQUFFO1lBQ2hCLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztTQUMxQztRQUNELE9BQU8sT0FBTyxDQUFDLFlBQVksRUFBRSxDQUFDO0lBQ2hDLENBQUM7SUFuQkQsOENBbUJDO0lBRUQ7Ozs7OztPQU1HO0lBQ0gsU0FBZ0Isa0JBQWtCLENBQUMsSUFBa0I7UUFDbkQsT0FBTyxDQUFDLENBQUMsVUFBVSxDQUFDLDRCQUFXLENBQUMsVUFBVSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNoRyxDQUFDO0lBRkQsZ0RBRUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCAqIGFzIG8gZnJvbSAnLi4vLi4vb3V0cHV0L291dHB1dF9hc3QnO1xuaW1wb3J0IHtSM0RlcGVuZGVuY3lNZXRhZGF0YX0gZnJvbSAnLi4vcjNfZmFjdG9yeSc7XG5pbXBvcnQge0lkZW50aWZpZXJzfSBmcm9tICcuLi9yM19pZGVudGlmaWVycyc7XG5pbXBvcnQge0RlZmluaXRpb25NYXB9IGZyb20gJy4uL3ZpZXcvdXRpbCc7XG5pbXBvcnQge1IzRGVjbGFyZURlcGVuZGVuY3lNZXRhZGF0YX0gZnJvbSAnLi9hcGknO1xuXG4vKipcbiAqIENyZWF0ZXMgYW4gYXJyYXkgbGl0ZXJhbCBleHByZXNzaW9uIGZyb20gdGhlIGdpdmVuIGFycmF5LCBtYXBwaW5nIGFsbCB2YWx1ZXMgdG8gYW4gZXhwcmVzc2lvblxuICogdXNpbmcgdGhlIHByb3ZpZGVkIG1hcHBpbmcgZnVuY3Rpb24uIElmIHRoZSBhcnJheSBpcyBlbXB0eSBvciBudWxsLCB0aGVuIG51bGwgaXMgcmV0dXJuZWQuXG4gKlxuICogQHBhcmFtIHZhbHVlcyBUaGUgYXJyYXkgdG8gdHJhbnNmZXIgaW50byBsaXRlcmFsIGFycmF5IGV4cHJlc3Npb24uXG4gKiBAcGFyYW0gbWFwcGVyIFRoZSBsb2dpYyB0byB1c2UgZm9yIGNyZWF0aW5nIGFuIGV4cHJlc3Npb24gZm9yIHRoZSBhcnJheSdzIHZhbHVlcy5cbiAqIEByZXR1cm5zIEFuIGFycmF5IGxpdGVyYWwgZXhwcmVzc2lvbiByZXByZXNlbnRpbmcgYHZhbHVlc2AsIG9yIG51bGwgaWYgYHZhbHVlc2AgaXMgZW1wdHkgb3JcbiAqIGlzIGl0c2VsZiBudWxsLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdG9PcHRpb25hbExpdGVyYWxBcnJheTxUPihcbiAgICB2YWx1ZXM6IFRbXXxudWxsLCBtYXBwZXI6ICh2YWx1ZTogVCkgPT4gby5FeHByZXNzaW9uKTogby5MaXRlcmFsQXJyYXlFeHByfG51bGwge1xuICBpZiAodmFsdWVzID09PSBudWxsIHx8IHZhbHVlcy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICByZXR1cm4gby5saXRlcmFsQXJyKHZhbHVlcy5tYXAodmFsdWUgPT4gbWFwcGVyKHZhbHVlKSkpO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYW4gb2JqZWN0IGxpdGVyYWwgZXhwcmVzc2lvbiBmcm9tIHRoZSBnaXZlbiBvYmplY3QsIG1hcHBpbmcgYWxsIHZhbHVlcyB0byBhbiBleHByZXNzaW9uXG4gKiB1c2luZyB0aGUgcHJvdmlkZWQgbWFwcGluZyBmdW5jdGlvbi4gSWYgdGhlIG9iamVjdCBoYXMgbm8ga2V5cywgdGhlbiBudWxsIGlzIHJldHVybmVkLlxuICpcbiAqIEBwYXJhbSBvYmplY3QgVGhlIG9iamVjdCB0byB0cmFuc2ZlciBpbnRvIGFuIG9iamVjdCBsaXRlcmFsIGV4cHJlc3Npb24uXG4gKiBAcGFyYW0gbWFwcGVyIFRoZSBsb2dpYyB0byB1c2UgZm9yIGNyZWF0aW5nIGFuIGV4cHJlc3Npb24gZm9yIHRoZSBvYmplY3QncyB2YWx1ZXMuXG4gKiBAcmV0dXJucyBBbiBvYmplY3QgbGl0ZXJhbCBleHByZXNzaW9uIHJlcHJlc2VudGluZyBgb2JqZWN0YCwgb3IgbnVsbCBpZiBgb2JqZWN0YCBkb2VzIG5vdCBoYXZlXG4gKiBhbnkga2V5cy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRvT3B0aW9uYWxMaXRlcmFsTWFwPFQ+KFxuICAgIG9iamVjdDoge1trZXk6IHN0cmluZ106IFR9LCBtYXBwZXI6ICh2YWx1ZTogVCkgPT4gby5FeHByZXNzaW9uKTogby5MaXRlcmFsTWFwRXhwcnxudWxsIHtcbiAgY29uc3QgZW50cmllcyA9IE9iamVjdC5rZXlzKG9iamVjdCkubWFwKGtleSA9PiB7XG4gICAgY29uc3QgdmFsdWUgPSBvYmplY3Rba2V5XTtcbiAgICByZXR1cm4ge2tleSwgdmFsdWU6IG1hcHBlcih2YWx1ZSksIHF1b3RlZDogdHJ1ZX07XG4gIH0pO1xuXG4gIGlmIChlbnRyaWVzLmxlbmd0aCA+IDApIHtcbiAgICByZXR1cm4gby5saXRlcmFsTWFwKGVudHJpZXMpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb21waWxlRGVwZW5kZW5jaWVzKGRlcHM6IFIzRGVwZW5kZW5jeU1ldGFkYXRhW118J2ludmFsaWQnfG51bGwpOiBvLkxpdGVyYWxFeHByfFxuICAgIG8uTGl0ZXJhbEFycmF5RXhwciB7XG4gIGlmIChkZXBzID09PSAnaW52YWxpZCcpIHtcbiAgICAvLyBUaGUgYGRlcHNgIGNhbiBiZSBzZXQgdG8gdGhlIHN0cmluZyBcImludmFsaWRcIiAgYnkgdGhlIGB1bndyYXBDb25zdHJ1Y3RvckRlcGVuZGVuY2llcygpYFxuICAgIC8vIGZ1bmN0aW9uLCB3aGljaCB0cmllcyB0byBjb252ZXJ0IGBDb25zdHJ1Y3RvckRlcHNgIGludG8gYFIzRGVwZW5kZW5jeU1ldGFkYXRhW11gLlxuICAgIHJldHVybiBvLmxpdGVyYWwoJ2ludmFsaWQnKTtcbiAgfSBlbHNlIGlmIChkZXBzID09PSBudWxsKSB7XG4gICAgcmV0dXJuIG8ubGl0ZXJhbChudWxsKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gby5saXRlcmFsQXJyKGRlcHMubWFwKGNvbXBpbGVEZXBlbmRlbmN5KSk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbXBpbGVEZXBlbmRlbmN5KGRlcDogUjNEZXBlbmRlbmN5TWV0YWRhdGEpOiBvLkxpdGVyYWxNYXBFeHByIHtcbiAgY29uc3QgZGVwTWV0YSA9IG5ldyBEZWZpbml0aW9uTWFwPFIzRGVjbGFyZURlcGVuZGVuY3lNZXRhZGF0YT4oKTtcbiAgZGVwTWV0YS5zZXQoJ3Rva2VuJywgZGVwLnRva2VuKTtcbiAgaWYgKGRlcC5hdHRyaWJ1dGVOYW1lVHlwZSAhPT0gbnVsbCkge1xuICAgIGRlcE1ldGEuc2V0KCdhdHRyaWJ1dGUnLCBvLmxpdGVyYWwodHJ1ZSkpO1xuICB9XG4gIGlmIChkZXAuaG9zdCkge1xuICAgIGRlcE1ldGEuc2V0KCdob3N0Jywgby5saXRlcmFsKHRydWUpKTtcbiAgfVxuICBpZiAoZGVwLm9wdGlvbmFsKSB7XG4gICAgZGVwTWV0YS5zZXQoJ29wdGlvbmFsJywgby5saXRlcmFsKHRydWUpKTtcbiAgfVxuICBpZiAoZGVwLnNlbGYpIHtcbiAgICBkZXBNZXRhLnNldCgnc2VsZicsIG8ubGl0ZXJhbCh0cnVlKSk7XG4gIH1cbiAgaWYgKGRlcC5za2lwU2VsZikge1xuICAgIGRlcE1ldGEuc2V0KCdza2lwU2VsZicsIG8ubGl0ZXJhbCh0cnVlKSk7XG4gIH1cbiAgcmV0dXJuIGRlcE1ldGEudG9MaXRlcmFsTWFwKCk7XG59XG5cbi8qKlxuICogR2VuZXJhdGUgYW4gZXhwcmVzc2lvbiB0aGF0IGhhcyB0aGUgZ2l2ZW4gYGV4cHJgIHdyYXBwZWQgaW4gdGhlIGZvbGxvd2luZyBmb3JtOlxuICpcbiAqIGBgYFxuICogZm9yd2FyZFJlZigoKSA9PiBleHByKVxuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZW5lcmF0ZUZvcndhcmRSZWYoZXhwcjogby5FeHByZXNzaW9uKTogby5FeHByZXNzaW9uIHtcbiAgcmV0dXJuIG8uaW1wb3J0RXhwcihJZGVudGlmaWVycy5mb3J3YXJkUmVmKS5jYWxsRm4oW28uZm4oW10sIFtuZXcgby5SZXR1cm5TdGF0ZW1lbnQoZXhwcildKV0pO1xufVxuIl19