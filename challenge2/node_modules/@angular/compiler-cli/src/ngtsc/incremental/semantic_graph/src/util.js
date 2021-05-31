(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/src/ngtsc/incremental/semantic_graph/src/util", ["require", "exports", "tslib"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isSetEqual = exports.isArrayEqual = exports.referenceEquality = exports.isReferenceEqual = exports.isSymbolEqual = void 0;
    var tslib_1 = require("tslib");
    /**
     * Determines whether the provided symbols represent the same declaration.
     */
    function isSymbolEqual(a, b) {
        if (a.decl === b.decl) {
            // If the declaration is identical then it must represent the same symbol.
            return true;
        }
        if (a.identifier === null || b.identifier === null) {
            // Unidentifiable symbols are assumed to be different.
            return false;
        }
        return a.path === b.path && a.identifier === b.identifier;
    }
    exports.isSymbolEqual = isSymbolEqual;
    /**
     * Determines whether the provided references to a semantic symbol are still equal, i.e. represent
     * the same symbol and are imported by the same path.
     */
    function isReferenceEqual(a, b) {
        if (!isSymbolEqual(a.symbol, b.symbol)) {
            // If the reference's target symbols are different, the reference itself is different.
            return false;
        }
        // The reference still corresponds with the same symbol, now check that the path by which it is
        // imported has not changed.
        return a.importPath === b.importPath;
    }
    exports.isReferenceEqual = isReferenceEqual;
    function referenceEquality(a, b) {
        return a === b;
    }
    exports.referenceEquality = referenceEquality;
    /**
     * Determines if the provided arrays are equal to each other, using the provided equality tester
     * that is called for all entries in the array.
     */
    function isArrayEqual(a, b, equalityTester) {
        if (equalityTester === void 0) { equalityTester = referenceEquality; }
        if (a === null || b === null) {
            return a === b;
        }
        if (a.length !== b.length) {
            return false;
        }
        return !a.some(function (item, index) { return !equalityTester(item, b[index]); });
    }
    exports.isArrayEqual = isArrayEqual;
    /**
     * Determines if the provided sets are equal to each other, using the provided equality tester.
     * Sets that only differ in ordering are considered equal.
     */
    function isSetEqual(a, b, equalityTester) {
        var e_1, _a, e_2, _b;
        if (equalityTester === void 0) { equalityTester = referenceEquality; }
        if (a === null || b === null) {
            return a === b;
        }
        if (a.size !== b.size) {
            return false;
        }
        try {
            for (var a_1 = tslib_1.__values(a), a_1_1 = a_1.next(); !a_1_1.done; a_1_1 = a_1.next()) {
                var itemA = a_1_1.value;
                var found = false;
                try {
                    for (var b_1 = (e_2 = void 0, tslib_1.__values(b)), b_1_1 = b_1.next(); !b_1_1.done; b_1_1 = b_1.next()) {
                        var itemB = b_1_1.value;
                        if (equalityTester(itemA, itemB)) {
                            found = true;
                            break;
                        }
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (b_1_1 && !b_1_1.done && (_b = b_1.return)) _b.call(b_1);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
                if (!found) {
                    return false;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (a_1_1 && !a_1_1.done && (_a = a_1.return)) _a.call(a_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return true;
    }
    exports.isSetEqual = isSetEqual;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvbmd0c2MvaW5jcmVtZW50YWwvc2VtYW50aWNfZ3JhcGgvc3JjL3V0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztJQVNBOztPQUVHO0lBQ0gsU0FBZ0IsYUFBYSxDQUFDLENBQWlCLEVBQUUsQ0FBaUI7UUFDaEUsSUFBSSxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxJQUFJLEVBQUU7WUFDckIsMEVBQTBFO1lBQzFFLE9BQU8sSUFBSSxDQUFDO1NBQ2I7UUFFRCxJQUFJLENBQUMsQ0FBQyxVQUFVLEtBQUssSUFBSSxJQUFJLENBQUMsQ0FBQyxVQUFVLEtBQUssSUFBSSxFQUFFO1lBQ2xELHNEQUFzRDtZQUN0RCxPQUFPLEtBQUssQ0FBQztTQUNkO1FBRUQsT0FBTyxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLFVBQVUsS0FBSyxDQUFDLENBQUMsVUFBVSxDQUFDO0lBQzVELENBQUM7SUFaRCxzQ0FZQztJQUVEOzs7T0FHRztJQUNILFNBQWdCLGdCQUFnQixDQUFDLENBQW9CLEVBQUUsQ0FBb0I7UUFDekUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUN0QyxzRkFBc0Y7WUFDdEYsT0FBTyxLQUFLLENBQUM7U0FDZDtRQUVELCtGQUErRjtRQUMvRiw0QkFBNEI7UUFDNUIsT0FBTyxDQUFDLENBQUMsVUFBVSxLQUFLLENBQUMsQ0FBQyxVQUFVLENBQUM7SUFDdkMsQ0FBQztJQVRELDRDQVNDO0lBRUQsU0FBZ0IsaUJBQWlCLENBQUksQ0FBSSxFQUFFLENBQUk7UUFDN0MsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2pCLENBQUM7SUFGRCw4Q0FFQztJQUVEOzs7T0FHRztJQUNILFNBQWdCLFlBQVksQ0FDeEIsQ0FBb0IsRUFBRSxDQUFvQixFQUMxQyxjQUEyRDtRQUEzRCwrQkFBQSxFQUFBLGtDQUEyRDtRQUM3RCxJQUFJLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxLQUFLLElBQUksRUFBRTtZQUM1QixPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDaEI7UUFFRCxJQUFJLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLE1BQU0sRUFBRTtZQUN6QixPQUFPLEtBQUssQ0FBQztTQUNkO1FBRUQsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQyxJQUFJLEVBQUUsS0FBSyxJQUFLLE9BQUEsQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUEvQixDQUErQixDQUFDLENBQUM7SUFDbkUsQ0FBQztJQVpELG9DQVlDO0lBRUQ7OztPQUdHO0lBQ0gsU0FBZ0IsVUFBVSxDQUN0QixDQUFzQixFQUFFLENBQXNCLEVBQzlDLGNBQTJEOztRQUEzRCwrQkFBQSxFQUFBLGtDQUEyRDtRQUM3RCxJQUFJLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxLQUFLLElBQUksRUFBRTtZQUM1QixPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDaEI7UUFFRCxJQUFJLENBQUMsQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDLElBQUksRUFBRTtZQUNyQixPQUFPLEtBQUssQ0FBQztTQUNkOztZQUVELEtBQW9CLElBQUEsTUFBQSxpQkFBQSxDQUFDLENBQUEsb0JBQUEsbUNBQUU7Z0JBQWxCLElBQU0sS0FBSyxjQUFBO2dCQUNkLElBQUksS0FBSyxHQUFHLEtBQUssQ0FBQzs7b0JBQ2xCLEtBQW9CLElBQUEscUJBQUEsaUJBQUEsQ0FBQyxDQUFBLENBQUEsb0JBQUEsbUNBQUU7d0JBQWxCLElBQU0sS0FBSyxjQUFBO3dCQUNkLElBQUksY0FBYyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRTs0QkFDaEMsS0FBSyxHQUFHLElBQUksQ0FBQzs0QkFDYixNQUFNO3lCQUNQO3FCQUNGOzs7Ozs7Ozs7Z0JBQ0QsSUFBSSxDQUFDLEtBQUssRUFBRTtvQkFDVixPQUFPLEtBQUssQ0FBQztpQkFDZDthQUNGOzs7Ozs7Ozs7UUFFRCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUF6QkQsZ0NBeUJDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge1NlbWFudGljUmVmZXJlbmNlLCBTZW1hbnRpY1N5bWJvbH0gZnJvbSAnLi9hcGknO1xuXG4vKipcbiAqIERldGVybWluZXMgd2hldGhlciB0aGUgcHJvdmlkZWQgc3ltYm9scyByZXByZXNlbnQgdGhlIHNhbWUgZGVjbGFyYXRpb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1N5bWJvbEVxdWFsKGE6IFNlbWFudGljU3ltYm9sLCBiOiBTZW1hbnRpY1N5bWJvbCk6IGJvb2xlYW4ge1xuICBpZiAoYS5kZWNsID09PSBiLmRlY2wpIHtcbiAgICAvLyBJZiB0aGUgZGVjbGFyYXRpb24gaXMgaWRlbnRpY2FsIHRoZW4gaXQgbXVzdCByZXByZXNlbnQgdGhlIHNhbWUgc3ltYm9sLlxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgaWYgKGEuaWRlbnRpZmllciA9PT0gbnVsbCB8fCBiLmlkZW50aWZpZXIgPT09IG51bGwpIHtcbiAgICAvLyBVbmlkZW50aWZpYWJsZSBzeW1ib2xzIGFyZSBhc3N1bWVkIHRvIGJlIGRpZmZlcmVudC5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICByZXR1cm4gYS5wYXRoID09PSBiLnBhdGggJiYgYS5pZGVudGlmaWVyID09PSBiLmlkZW50aWZpZXI7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSBwcm92aWRlZCByZWZlcmVuY2VzIHRvIGEgc2VtYW50aWMgc3ltYm9sIGFyZSBzdGlsbCBlcXVhbCwgaS5lLiByZXByZXNlbnRcbiAqIHRoZSBzYW1lIHN5bWJvbCBhbmQgYXJlIGltcG9ydGVkIGJ5IHRoZSBzYW1lIHBhdGguXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1JlZmVyZW5jZUVxdWFsKGE6IFNlbWFudGljUmVmZXJlbmNlLCBiOiBTZW1hbnRpY1JlZmVyZW5jZSk6IGJvb2xlYW4ge1xuICBpZiAoIWlzU3ltYm9sRXF1YWwoYS5zeW1ib2wsIGIuc3ltYm9sKSkge1xuICAgIC8vIElmIHRoZSByZWZlcmVuY2UncyB0YXJnZXQgc3ltYm9scyBhcmUgZGlmZmVyZW50LCB0aGUgcmVmZXJlbmNlIGl0c2VsZiBpcyBkaWZmZXJlbnQuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gVGhlIHJlZmVyZW5jZSBzdGlsbCBjb3JyZXNwb25kcyB3aXRoIHRoZSBzYW1lIHN5bWJvbCwgbm93IGNoZWNrIHRoYXQgdGhlIHBhdGggYnkgd2hpY2ggaXQgaXNcbiAgLy8gaW1wb3J0ZWQgaGFzIG5vdCBjaGFuZ2VkLlxuICByZXR1cm4gYS5pbXBvcnRQYXRoID09PSBiLmltcG9ydFBhdGg7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWZlcmVuY2VFcXVhbGl0eTxUPihhOiBULCBiOiBUKTogYm9vbGVhbiB7XG4gIHJldHVybiBhID09PSBiO1xufVxuXG4vKipcbiAqIERldGVybWluZXMgaWYgdGhlIHByb3ZpZGVkIGFycmF5cyBhcmUgZXF1YWwgdG8gZWFjaCBvdGhlciwgdXNpbmcgdGhlIHByb3ZpZGVkIGVxdWFsaXR5IHRlc3RlclxuICogdGhhdCBpcyBjYWxsZWQgZm9yIGFsbCBlbnRyaWVzIGluIHRoZSBhcnJheS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzQXJyYXlFcXVhbDxUPihcbiAgICBhOiByZWFkb25seSBUW118bnVsbCwgYjogcmVhZG9ubHkgVFtdfG51bGwsXG4gICAgZXF1YWxpdHlUZXN0ZXI6IChhOiBULCBiOiBUKSA9PiBib29sZWFuID0gcmVmZXJlbmNlRXF1YWxpdHkpOiBib29sZWFuIHtcbiAgaWYgKGEgPT09IG51bGwgfHwgYiA9PT0gbnVsbCkge1xuICAgIHJldHVybiBhID09PSBiO1xuICB9XG5cbiAgaWYgKGEubGVuZ3RoICE9PSBiLmxlbmd0aCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiAhYS5zb21lKChpdGVtLCBpbmRleCkgPT4gIWVxdWFsaXR5VGVzdGVyKGl0ZW0sIGJbaW5kZXhdKSk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lcyBpZiB0aGUgcHJvdmlkZWQgc2V0cyBhcmUgZXF1YWwgdG8gZWFjaCBvdGhlciwgdXNpbmcgdGhlIHByb3ZpZGVkIGVxdWFsaXR5IHRlc3Rlci5cbiAqIFNldHMgdGhhdCBvbmx5IGRpZmZlciBpbiBvcmRlcmluZyBhcmUgY29uc2lkZXJlZCBlcXVhbC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzU2V0RXF1YWw8VD4oXG4gICAgYTogUmVhZG9ubHlTZXQ8VD58bnVsbCwgYjogUmVhZG9ubHlTZXQ8VD58bnVsbCxcbiAgICBlcXVhbGl0eVRlc3RlcjogKGE6IFQsIGI6IFQpID0+IGJvb2xlYW4gPSByZWZlcmVuY2VFcXVhbGl0eSk6IGJvb2xlYW4ge1xuICBpZiAoYSA9PT0gbnVsbCB8fCBiID09PSBudWxsKSB7XG4gICAgcmV0dXJuIGEgPT09IGI7XG4gIH1cblxuICBpZiAoYS5zaXplICE9PSBiLnNpemUpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBmb3IgKGNvbnN0IGl0ZW1BIG9mIGEpIHtcbiAgICBsZXQgZm91bmQgPSBmYWxzZTtcbiAgICBmb3IgKGNvbnN0IGl0ZW1CIG9mIGIpIHtcbiAgICAgIGlmIChlcXVhbGl0eVRlc3RlcihpdGVtQSwgaXRlbUIpKSB7XG4gICAgICAgIGZvdW5kID0gdHJ1ZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICghZm91bmQpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn1cbiJdfQ==