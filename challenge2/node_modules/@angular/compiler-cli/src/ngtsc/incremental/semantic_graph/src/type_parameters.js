(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/src/ngtsc/incremental/semantic_graph/src/type_parameters", ["require", "exports", "typescript", "@angular/compiler-cli/src/ngtsc/incremental/semantic_graph/src/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.areTypeParametersEqual = exports.extractSemanticTypeParameters = void 0;
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var ts = require("typescript");
    var util_1 = require("@angular/compiler-cli/src/ngtsc/incremental/semantic_graph/src/util");
    /**
     * Converts the type parameters of the given class into their semantic representation. If the class
     * does not have any type parameters, then `null` is returned.
     */
    function extractSemanticTypeParameters(node) {
        if (!ts.isClassDeclaration(node) || node.typeParameters === undefined) {
            return null;
        }
        return node.typeParameters.map(function (typeParam) { return ({ hasGenericTypeBound: typeParam.constraint !== undefined }); });
    }
    exports.extractSemanticTypeParameters = extractSemanticTypeParameters;
    /**
     * Compares the list of type parameters to determine if they can be considered equal.
     */
    function areTypeParametersEqual(current, previous) {
        // First compare all type parameters one-to-one; any differences mean that the list of type
        // parameters has changed.
        if (!util_1.isArrayEqual(current, previous, isTypeParameterEqual)) {
            return false;
        }
        // If there is a current list of type parameters and if any of them has a generic type constraint,
        // then the meaning of that type parameter may have changed without us being aware; as such we
        // have to assume that the type parameters have in fact changed.
        if (current !== null && current.some(function (typeParam) { return typeParam.hasGenericTypeBound; })) {
            return false;
        }
        return true;
    }
    exports.areTypeParametersEqual = areTypeParametersEqual;
    function isTypeParameterEqual(a, b) {
        return a.hasGenericTypeBound === b.hasGenericTypeBound;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZV9wYXJhbWV0ZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL3NyYy9uZ3RzYy9pbmNyZW1lbnRhbC9zZW1hbnRpY19ncmFwaC9zcmMvdHlwZV9wYXJhbWV0ZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztJQUFBOzs7Ozs7T0FNRztJQUNILCtCQUFpQztJQUdqQyw0RkFBb0M7SUFzQnBDOzs7T0FHRztJQUNILFNBQWdCLDZCQUE2QixDQUFDLElBQXNCO1FBRWxFLElBQUksQ0FBQyxFQUFFLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLGNBQWMsS0FBSyxTQUFTLEVBQUU7WUFDckUsT0FBTyxJQUFJLENBQUM7U0FDYjtRQUVELE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQzFCLFVBQUEsU0FBUyxJQUFJLE9BQUEsQ0FBQyxFQUFDLG1CQUFtQixFQUFFLFNBQVMsQ0FBQyxVQUFVLEtBQUssU0FBUyxFQUFDLENBQUMsRUFBM0QsQ0FBMkQsQ0FBQyxDQUFDO0lBQ2hGLENBQUM7SUFSRCxzRUFRQztJQUVEOztPQUVHO0lBQ0gsU0FBZ0Isc0JBQXNCLENBQ2xDLE9BQXFDLEVBQUUsUUFBc0M7UUFDL0UsMkZBQTJGO1FBQzNGLDBCQUEwQjtRQUMxQixJQUFJLENBQUMsbUJBQVksQ0FBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLG9CQUFvQixDQUFDLEVBQUU7WUFDMUQsT0FBTyxLQUFLLENBQUM7U0FDZDtRQUVELGtHQUFrRztRQUNsRyw4RkFBOEY7UUFDOUYsZ0VBQWdFO1FBQ2hFLElBQUksT0FBTyxLQUFLLElBQUksSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQUEsU0FBUyxJQUFJLE9BQUEsU0FBUyxDQUFDLG1CQUFtQixFQUE3QixDQUE2QixDQUFDLEVBQUU7WUFDaEYsT0FBTyxLQUFLLENBQUM7U0FDZDtRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQWhCRCx3REFnQkM7SUFFRCxTQUFTLG9CQUFvQixDQUFDLENBQXdCLEVBQUUsQ0FBd0I7UUFDOUUsT0FBTyxDQUFDLENBQUMsbUJBQW1CLEtBQUssQ0FBQyxDQUFDLG1CQUFtQixDQUFDO0lBQ3pELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuXG5pbXBvcnQge0NsYXNzRGVjbGFyYXRpb259IGZyb20gJy4uLy4uLy4uL3JlZmxlY3Rpb24nO1xuaW1wb3J0IHtpc0FycmF5RXF1YWx9IGZyb20gJy4vdXRpbCc7XG5cbi8qKlxuICogRGVzY3JpYmVzIGEgZ2VuZXJpYyB0eXBlIHBhcmFtZXRlciBvZiBhIHNlbWFudGljIHN5bWJvbC4gQSBjbGFzcyBkZWNsYXJhdGlvbiB3aXRoIHR5cGUgcGFyYW1ldGVyc1xuICogbmVlZHMgc3BlY2lhbCBjb25zaWRlcmF0aW9uIGluIGNlcnRhaW4gY29udGV4dHMuIEZvciBleGFtcGxlLCB0ZW1wbGF0ZSB0eXBlLWNoZWNrIGJsb2NrcyBtYXlcbiAqIGNvbnRhaW4gdHlwZSBjb25zdHJ1Y3RvcnMgb2YgdXNlZCBkaXJlY3RpdmVzIHdoaWNoIGluY2x1ZGUgdGhlIHR5cGUgcGFyYW1ldGVycyBvZiB0aGUgZGlyZWN0aXZlLlxuICogQXMgYSBjb25zZXF1ZW5jZSwgaWYgYSBjaGFuZ2UgaXMgbWFkZSB0aGF0IGFmZmVjdHMgdGhlIHR5cGUgcGFyYW1ldGVycyBvZiBzYWlkIGRpcmVjdGl2ZSwgYW55XG4gKiB0ZW1wbGF0ZSB0eXBlLWNoZWNrIGJsb2NrcyB0aGF0IHVzZSB0aGUgZGlyZWN0aXZlIG5lZWQgdG8gYmUgcmVnZW5lcmF0ZWQuXG4gKlxuICogVGhpcyB0eXBlIHJlcHJlc2VudHMgYSBzaW5nbGUgZ2VuZXJpYyB0eXBlIHBhcmFtZXRlci4gSXQgY3VycmVudGx5IG9ubHkgdHJhY2tzIHdoZXRoZXIgdGhlXG4gKiB0eXBlIHBhcmFtZXRlciBoYXMgYSBjb25zdHJhaW50LCBpLmUuIGhhcyBhbiBgZXh0ZW5kc2AgY2xhdXNlLiBXaGVuIGEgY29uc3RyYWludCBpcyBwcmVzZW50LCB3ZVxuICogY3VycmVudGx5IGFzc3VtZSB0aGF0IHRoZSB0eXBlIHBhcmFtZXRlciBpcyBhZmZlY3RlZCBpbiBlYWNoIGluY3JlbWVudGFsIHJlYnVpbGQ7IHByb3ZpbmcgdGhhdFxuICogYSB0eXBlIHBhcmFtZXRlciB3aXRoIGNvbnN0cmFpbnQgaXMgbm90IGFmZmVjdGVkIGlzIG5vbi10cml2aWFsIGFzIGl0IHJlcXVpcmVzIGZ1bGwgc2VtYW50aWNcbiAqIHVuZGVyc3RhbmRpbmcgb2YgdGhlIHR5cGUgY29uc3RyYWludC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBTZW1hbnRpY1R5cGVQYXJhbWV0ZXIge1xuICAvKipcbiAgICogV2hldGhlciBhIHR5cGUgY29uc3RyYWludCwgaS5lLiBhbiBgZXh0ZW5kc2AgY2xhdXNlIGlzIHByZXNlbnQgb24gdGhlIHR5cGUgcGFyYW1ldGVyLlxuICAgKi9cbiAgaGFzR2VuZXJpY1R5cGVCb3VuZDogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyB0aGUgdHlwZSBwYXJhbWV0ZXJzIG9mIHRoZSBnaXZlbiBjbGFzcyBpbnRvIHRoZWlyIHNlbWFudGljIHJlcHJlc2VudGF0aW9uLiBJZiB0aGUgY2xhc3NcbiAqIGRvZXMgbm90IGhhdmUgYW55IHR5cGUgcGFyYW1ldGVycywgdGhlbiBgbnVsbGAgaXMgcmV0dXJuZWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBleHRyYWN0U2VtYW50aWNUeXBlUGFyYW1ldGVycyhub2RlOiBDbGFzc0RlY2xhcmF0aW9uKTogU2VtYW50aWNUeXBlUGFyYW1ldGVyW118XG4gICAgbnVsbCB7XG4gIGlmICghdHMuaXNDbGFzc0RlY2xhcmF0aW9uKG5vZGUpIHx8IG5vZGUudHlwZVBhcmFtZXRlcnMgPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcmV0dXJuIG5vZGUudHlwZVBhcmFtZXRlcnMubWFwKFxuICAgICAgdHlwZVBhcmFtID0+ICh7aGFzR2VuZXJpY1R5cGVCb3VuZDogdHlwZVBhcmFtLmNvbnN0cmFpbnQgIT09IHVuZGVmaW5lZH0pKTtcbn1cblxuLyoqXG4gKiBDb21wYXJlcyB0aGUgbGlzdCBvZiB0eXBlIHBhcmFtZXRlcnMgdG8gZGV0ZXJtaW5lIGlmIHRoZXkgY2FuIGJlIGNvbnNpZGVyZWQgZXF1YWwuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhcmVUeXBlUGFyYW1ldGVyc0VxdWFsKFxuICAgIGN1cnJlbnQ6IFNlbWFudGljVHlwZVBhcmFtZXRlcltdfG51bGwsIHByZXZpb3VzOiBTZW1hbnRpY1R5cGVQYXJhbWV0ZXJbXXxudWxsKTogYm9vbGVhbiB7XG4gIC8vIEZpcnN0IGNvbXBhcmUgYWxsIHR5cGUgcGFyYW1ldGVycyBvbmUtdG8tb25lOyBhbnkgZGlmZmVyZW5jZXMgbWVhbiB0aGF0IHRoZSBsaXN0IG9mIHR5cGVcbiAgLy8gcGFyYW1ldGVycyBoYXMgY2hhbmdlZC5cbiAgaWYgKCFpc0FycmF5RXF1YWwoY3VycmVudCwgcHJldmlvdXMsIGlzVHlwZVBhcmFtZXRlckVxdWFsKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIElmIHRoZXJlIGlzIGEgY3VycmVudCBsaXN0IG9mIHR5cGUgcGFyYW1ldGVycyBhbmQgaWYgYW55IG9mIHRoZW0gaGFzIGEgZ2VuZXJpYyB0eXBlIGNvbnN0cmFpbnQsXG4gIC8vIHRoZW4gdGhlIG1lYW5pbmcgb2YgdGhhdCB0eXBlIHBhcmFtZXRlciBtYXkgaGF2ZSBjaGFuZ2VkIHdpdGhvdXQgdXMgYmVpbmcgYXdhcmU7IGFzIHN1Y2ggd2VcbiAgLy8gaGF2ZSB0byBhc3N1bWUgdGhhdCB0aGUgdHlwZSBwYXJhbWV0ZXJzIGhhdmUgaW4gZmFjdCBjaGFuZ2VkLlxuICBpZiAoY3VycmVudCAhPT0gbnVsbCAmJiBjdXJyZW50LnNvbWUodHlwZVBhcmFtID0+IHR5cGVQYXJhbS5oYXNHZW5lcmljVHlwZUJvdW5kKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufVxuXG5mdW5jdGlvbiBpc1R5cGVQYXJhbWV0ZXJFcXVhbChhOiBTZW1hbnRpY1R5cGVQYXJhbWV0ZXIsIGI6IFNlbWFudGljVHlwZVBhcmFtZXRlcik6IGJvb2xlYW4ge1xuICByZXR1cm4gYS5oYXNHZW5lcmljVHlwZUJvdW5kID09PSBiLmhhc0dlbmVyaWNUeXBlQm91bmQ7XG59XG4iXX0=