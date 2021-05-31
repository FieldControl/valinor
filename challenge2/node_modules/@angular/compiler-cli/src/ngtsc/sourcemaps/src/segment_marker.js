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
        define("@angular/compiler-cli/src/ngtsc/sourcemaps/src/segment_marker", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.offsetSegment = exports.compareSegments = void 0;
    /**
     * Compare two segment-markers, for use in a search or sorting algorithm.
     *
     * @returns a positive number if `a` is after `b`, a negative number if `b` is after `a`
     * and zero if they are at the same position.
     */
    function compareSegments(a, b) {
        return a.position - b.position;
    }
    exports.compareSegments = compareSegments;
    /**
     * Return a new segment-marker that is offset by the given number of characters.
     *
     * @param startOfLinePositions the position of the start of each line of content of the source file
     * whose segment-marker we are offsetting.
     * @param marker the segment to offset.
     * @param offset the number of character to offset by.
     */
    function offsetSegment(startOfLinePositions, marker, offset) {
        if (offset === 0) {
            return marker;
        }
        var line = marker.line;
        var position = marker.position + offset;
        while (line < startOfLinePositions.length - 1 && startOfLinePositions[line + 1] <= position) {
            line++;
        }
        while (line > 0 && startOfLinePositions[line] > position) {
            line--;
        }
        var column = position - startOfLinePositions[line];
        return { line: line, column: column, position: position, next: undefined };
    }
    exports.offsetSegment = offsetSegment;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VnbWVudF9tYXJrZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL3NvdXJjZW1hcHMvc3JjL3NlZ21lbnRfbWFya2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQWdCSDs7Ozs7T0FLRztJQUNILFNBQWdCLGVBQWUsQ0FBQyxDQUFnQixFQUFFLENBQWdCO1FBQ2hFLE9BQU8sQ0FBQyxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDO0lBQ2pDLENBQUM7SUFGRCwwQ0FFQztJQUVEOzs7Ozs7O09BT0c7SUFDSCxTQUFnQixhQUFhLENBQ3pCLG9CQUE4QixFQUFFLE1BQXFCLEVBQUUsTUFBYztRQUN2RSxJQUFJLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDaEIsT0FBTyxNQUFNLENBQUM7U0FDZjtRQUVELElBQUksSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDdkIsSUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUM7UUFDMUMsT0FBTyxJQUFJLEdBQUcsb0JBQW9CLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxvQkFBb0IsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLElBQUksUUFBUSxFQUFFO1lBQzNGLElBQUksRUFBRSxDQUFDO1NBQ1I7UUFDRCxPQUFPLElBQUksR0FBRyxDQUFDLElBQUksb0JBQW9CLENBQUMsSUFBSSxDQUFDLEdBQUcsUUFBUSxFQUFFO1lBQ3hELElBQUksRUFBRSxDQUFDO1NBQ1I7UUFDRCxJQUFNLE1BQU0sR0FBRyxRQUFRLEdBQUcsb0JBQW9CLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDckQsT0FBTyxFQUFDLElBQUksTUFBQSxFQUFFLE1BQU0sUUFBQSxFQUFFLFFBQVEsVUFBQSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUMsQ0FBQztJQUNuRCxDQUFDO0lBaEJELHNDQWdCQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5cbi8qKlxuICogQSBtYXJrZXIgdGhhdCBpbmRpY2F0ZXMgdGhlIHN0YXJ0IG9mIGEgc2VnbWVudCBpbiBhIG1hcHBpbmcuXG4gKlxuICogVGhlIGVuZCBvZiBhIHNlZ21lbnQgaXMgaW5kaWNhdGVkIGJ5IHRoZSBmaXJzdCBzZWdtZW50LW1hcmtlciBvZiBhbm90aGVyIG1hcHBpbmcgd2hvc2Ugc3RhcnRcbiAqIGlzIGdyZWF0ZXIgb3IgZXF1YWwgdG8gdGhpcyBvbmUuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgU2VnbWVudE1hcmtlciB7XG4gIHJlYWRvbmx5IGxpbmU6IG51bWJlcjtcbiAgcmVhZG9ubHkgY29sdW1uOiBudW1iZXI7XG4gIHJlYWRvbmx5IHBvc2l0aW9uOiBudW1iZXI7XG4gIG5leHQ6IFNlZ21lbnRNYXJrZXJ8dW5kZWZpbmVkO1xufVxuXG4vKipcbiAqIENvbXBhcmUgdHdvIHNlZ21lbnQtbWFya2VycywgZm9yIHVzZSBpbiBhIHNlYXJjaCBvciBzb3J0aW5nIGFsZ29yaXRobS5cbiAqXG4gKiBAcmV0dXJucyBhIHBvc2l0aXZlIG51bWJlciBpZiBgYWAgaXMgYWZ0ZXIgYGJgLCBhIG5lZ2F0aXZlIG51bWJlciBpZiBgYmAgaXMgYWZ0ZXIgYGFgXG4gKiBhbmQgemVybyBpZiB0aGV5IGFyZSBhdCB0aGUgc2FtZSBwb3NpdGlvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbXBhcmVTZWdtZW50cyhhOiBTZWdtZW50TWFya2VyLCBiOiBTZWdtZW50TWFya2VyKTogbnVtYmVyIHtcbiAgcmV0dXJuIGEucG9zaXRpb24gLSBiLnBvc2l0aW9uO1xufVxuXG4vKipcbiAqIFJldHVybiBhIG5ldyBzZWdtZW50LW1hcmtlciB0aGF0IGlzIG9mZnNldCBieSB0aGUgZ2l2ZW4gbnVtYmVyIG9mIGNoYXJhY3RlcnMuXG4gKlxuICogQHBhcmFtIHN0YXJ0T2ZMaW5lUG9zaXRpb25zIHRoZSBwb3NpdGlvbiBvZiB0aGUgc3RhcnQgb2YgZWFjaCBsaW5lIG9mIGNvbnRlbnQgb2YgdGhlIHNvdXJjZSBmaWxlXG4gKiB3aG9zZSBzZWdtZW50LW1hcmtlciB3ZSBhcmUgb2Zmc2V0dGluZy5cbiAqIEBwYXJhbSBtYXJrZXIgdGhlIHNlZ21lbnQgdG8gb2Zmc2V0LlxuICogQHBhcmFtIG9mZnNldCB0aGUgbnVtYmVyIG9mIGNoYXJhY3RlciB0byBvZmZzZXQgYnkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBvZmZzZXRTZWdtZW50KFxuICAgIHN0YXJ0T2ZMaW5lUG9zaXRpb25zOiBudW1iZXJbXSwgbWFya2VyOiBTZWdtZW50TWFya2VyLCBvZmZzZXQ6IG51bWJlcik6IFNlZ21lbnRNYXJrZXIge1xuICBpZiAob2Zmc2V0ID09PSAwKSB7XG4gICAgcmV0dXJuIG1hcmtlcjtcbiAgfVxuXG4gIGxldCBsaW5lID0gbWFya2VyLmxpbmU7XG4gIGNvbnN0IHBvc2l0aW9uID0gbWFya2VyLnBvc2l0aW9uICsgb2Zmc2V0O1xuICB3aGlsZSAobGluZSA8IHN0YXJ0T2ZMaW5lUG9zaXRpb25zLmxlbmd0aCAtIDEgJiYgc3RhcnRPZkxpbmVQb3NpdGlvbnNbbGluZSArIDFdIDw9IHBvc2l0aW9uKSB7XG4gICAgbGluZSsrO1xuICB9XG4gIHdoaWxlIChsaW5lID4gMCAmJiBzdGFydE9mTGluZVBvc2l0aW9uc1tsaW5lXSA+IHBvc2l0aW9uKSB7XG4gICAgbGluZS0tO1xuICB9XG4gIGNvbnN0IGNvbHVtbiA9IHBvc2l0aW9uIC0gc3RhcnRPZkxpbmVQb3NpdGlvbnNbbGluZV07XG4gIHJldHVybiB7bGluZSwgY29sdW1uLCBwb3NpdGlvbiwgbmV4dDogdW5kZWZpbmVkfTtcbn1cbiJdfQ==