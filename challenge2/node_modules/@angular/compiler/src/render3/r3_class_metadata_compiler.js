(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler/src/render3/r3_class_metadata_compiler", ["require", "exports", "@angular/compiler/src/output/output_ast", "@angular/compiler/src/render3/r3_identifiers", "@angular/compiler/src/render3/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.compileClassMetadata = void 0;
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var o = require("@angular/compiler/src/output/output_ast");
    var r3_identifiers_1 = require("@angular/compiler/src/render3/r3_identifiers");
    var util_1 = require("@angular/compiler/src/render3/util");
    function compileClassMetadata(metadata) {
        var _a, _b;
        // Generate an ngDevMode guarded call to setClassMetadata with the class identifier and its
        // metadata.
        var fnCall = o.importExpr(r3_identifiers_1.Identifiers.setClassMetadata).callFn([
            metadata.type,
            metadata.decorators,
            (_a = metadata.ctorParameters) !== null && _a !== void 0 ? _a : o.literal(null),
            (_b = metadata.propDecorators) !== null && _b !== void 0 ? _b : o.literal(null),
        ]);
        var iife = o.fn([], [util_1.devOnlyGuardedExpression(fnCall).toStmt()]);
        return iife.callFn([]);
    }
    exports.compileClassMetadata = compileClassMetadata;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicjNfY2xhc3NfbWV0YWRhdGFfY29tcGlsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci9zcmMvcmVuZGVyMy9yM19jbGFzc19tZXRhZGF0YV9jb21waWxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7SUFBQTs7Ozs7O09BTUc7SUFDSCwyREFBMEM7SUFFMUMsK0VBQW1EO0lBQ25ELDJEQUFnRDtJQWlDaEQsU0FBZ0Isb0JBQW9CLENBQUMsUUFBeUI7O1FBQzVELDJGQUEyRjtRQUMzRixZQUFZO1FBQ1osSUFBTSxNQUFNLEdBQUcsQ0FBQyxDQUFDLFVBQVUsQ0FBQyw0QkFBRSxDQUFDLGdCQUFnQixDQUFDLENBQUMsTUFBTSxDQUFDO1lBQ3RELFFBQVEsQ0FBQyxJQUFJO1lBQ2IsUUFBUSxDQUFDLFVBQVU7WUFDbkIsTUFBQSxRQUFRLENBQUMsY0FBYyxtQ0FBSSxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQztZQUMxQyxNQUFBLFFBQVEsQ0FBQyxjQUFjLG1DQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDO1NBQzNDLENBQUMsQ0FBQztRQUNILElBQU0sSUFBSSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsK0JBQXdCLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ25FLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUN6QixDQUFDO0lBWEQsb0RBV0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCAqIGFzIG8gZnJvbSAnLi4vb3V0cHV0L291dHB1dF9hc3QnO1xuXG5pbXBvcnQge0lkZW50aWZpZXJzIGFzIFIzfSBmcm9tICcuL3IzX2lkZW50aWZpZXJzJztcbmltcG9ydCB7ZGV2T25seUd1YXJkZWRFeHByZXNzaW9ufSBmcm9tICcuL3V0aWwnO1xuXG5leHBvcnQgdHlwZSBDb21waWxlQ2xhc3NNZXRhZGF0YUZuID0gKG1ldGFkYXRhOiBSM0NsYXNzTWV0YWRhdGEpID0+IG8uRXhwcmVzc2lvbjtcblxuLyoqXG4gKiBNZXRhZGF0YSBvZiBhIGNsYXNzIHdoaWNoIGNhcHR1cmVzIHRoZSBvcmlnaW5hbCBBbmd1bGFyIGRlY29yYXRvcnMgb2YgYSBjbGFzcy4gVGhlIG9yaWdpbmFsXG4gKiBkZWNvcmF0b3JzIGFyZSBwcmVzZXJ2ZWQgaW4gdGhlIGdlbmVyYXRlZCBjb2RlIHRvIGFsbG93IFRlc3RCZWQgQVBJcyB0byByZWNvbXBpbGUgdGhlIGNsYXNzXG4gKiB1c2luZyB0aGUgb3JpZ2luYWwgZGVjb3JhdG9yIHdpdGggYSBzZXQgb2Ygb3ZlcnJpZGVzIGFwcGxpZWQuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUjNDbGFzc01ldGFkYXRhIHtcbiAgLyoqXG4gICAqIFRoZSBjbGFzcyB0eXBlIGZvciB3aGljaCB0aGUgbWV0YWRhdGEgaXMgY2FwdHVyZWQuXG4gICAqL1xuICB0eXBlOiBvLkV4cHJlc3Npb247XG5cbiAgLyoqXG4gICAqIEFuIGV4cHJlc3Npb24gcmVwcmVzZW50aW5nIHRoZSBBbmd1bGFyIGRlY29yYXRvcnMgdGhhdCB3ZXJlIGFwcGxpZWQgb24gdGhlIGNsYXNzLlxuICAgKi9cbiAgZGVjb3JhdG9yczogby5FeHByZXNzaW9uO1xuXG4gIC8qKlxuICAgKiBBbiBleHByZXNzaW9uIHJlcHJlc2VudGluZyB0aGUgQW5ndWxhciBkZWNvcmF0b3JzIGFwcGxpZWQgdG8gY29uc3RydWN0b3IgcGFyYW1ldGVycywgb3IgYG51bGxgXG4gICAqIGlmIHRoZXJlIGlzIG5vIGNvbnN0cnVjdG9yLlxuICAgKi9cbiAgY3RvclBhcmFtZXRlcnM6IG8uRXhwcmVzc2lvbnxudWxsO1xuXG4gIC8qKlxuICAgKiBBbiBleHByZXNzaW9uIHJlcHJlc2VudGluZyB0aGUgQW5ndWxhciBkZWNvcmF0b3JzIHRoYXQgd2VyZSBhcHBsaWVkIG9uIHRoZSBwcm9wZXJ0aWVzIG9mIHRoZVxuICAgKiBjbGFzcywgb3IgYG51bGxgIGlmIG5vIHByb3BlcnRpZXMgaGF2ZSBkZWNvcmF0b3JzLlxuICAgKi9cbiAgcHJvcERlY29yYXRvcnM6IG8uRXhwcmVzc2lvbnxudWxsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29tcGlsZUNsYXNzTWV0YWRhdGEobWV0YWRhdGE6IFIzQ2xhc3NNZXRhZGF0YSk6IG8uRXhwcmVzc2lvbiB7XG4gIC8vIEdlbmVyYXRlIGFuIG5nRGV2TW9kZSBndWFyZGVkIGNhbGwgdG8gc2V0Q2xhc3NNZXRhZGF0YSB3aXRoIHRoZSBjbGFzcyBpZGVudGlmaWVyIGFuZCBpdHNcbiAgLy8gbWV0YWRhdGEuXG4gIGNvbnN0IGZuQ2FsbCA9IG8uaW1wb3J0RXhwcihSMy5zZXRDbGFzc01ldGFkYXRhKS5jYWxsRm4oW1xuICAgIG1ldGFkYXRhLnR5cGUsXG4gICAgbWV0YWRhdGEuZGVjb3JhdG9ycyxcbiAgICBtZXRhZGF0YS5jdG9yUGFyYW1ldGVycyA/PyBvLmxpdGVyYWwobnVsbCksXG4gICAgbWV0YWRhdGEucHJvcERlY29yYXRvcnMgPz8gby5saXRlcmFsKG51bGwpLFxuICBdKTtcbiAgY29uc3QgaWlmZSA9IG8uZm4oW10sIFtkZXZPbmx5R3VhcmRlZEV4cHJlc3Npb24oZm5DYWxsKS50b1N0bXQoKV0pO1xuICByZXR1cm4gaWlmZS5jYWxsRm4oW10pO1xufVxuIl19