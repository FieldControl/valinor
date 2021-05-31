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
        define("@angular/compiler/src/assertions", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.assertInterpolationSymbols = exports.assertArrayOfStrings = void 0;
    function assertArrayOfStrings(identifier, value) {
        if (value == null) {
            return;
        }
        if (!Array.isArray(value)) {
            throw new Error("Expected '" + identifier + "' to be an array of strings.");
        }
        for (var i = 0; i < value.length; i += 1) {
            if (typeof value[i] !== 'string') {
                throw new Error("Expected '" + identifier + "' to be an array of strings.");
            }
        }
    }
    exports.assertArrayOfStrings = assertArrayOfStrings;
    var UNUSABLE_INTERPOLATION_REGEXPS = [
        /^\s*$/,
        /[<>]/,
        /^[{}]$/,
        /&(#|[a-z])/i,
        /^\/\//, // comment
    ];
    function assertInterpolationSymbols(identifier, value) {
        if (value != null && !(Array.isArray(value) && value.length == 2)) {
            throw new Error("Expected '" + identifier + "' to be an array, [start, end].");
        }
        else if (value != null) {
            var start_1 = value[0];
            var end_1 = value[1];
            // Check for unusable interpolation symbols
            UNUSABLE_INTERPOLATION_REGEXPS.forEach(function (regexp) {
                if (regexp.test(start_1) || regexp.test(end_1)) {
                    throw new Error("['" + start_1 + "', '" + end_1 + "'] contains unusable interpolation symbol.");
                }
            });
        }
    }
    exports.assertInterpolationSymbols = assertInterpolationSymbols;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXNzZXJ0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy9hc3NlcnRpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQUVILFNBQWdCLG9CQUFvQixDQUFDLFVBQWtCLEVBQUUsS0FBVTtRQUNqRSxJQUFJLEtBQUssSUFBSSxJQUFJLEVBQUU7WUFDakIsT0FBTztTQUNSO1FBQ0QsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDekIsTUFBTSxJQUFJLEtBQUssQ0FBQyxlQUFhLFVBQVUsaUNBQThCLENBQUMsQ0FBQztTQUN4RTtRQUNELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDeEMsSUFBSSxPQUFPLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxRQUFRLEVBQUU7Z0JBQ2hDLE1BQU0sSUFBSSxLQUFLLENBQUMsZUFBYSxVQUFVLGlDQUE4QixDQUFDLENBQUM7YUFDeEU7U0FDRjtJQUNILENBQUM7SUFaRCxvREFZQztJQUVELElBQU0sOEJBQThCLEdBQUc7UUFDckMsT0FBTztRQUNQLE1BQU07UUFDTixRQUFRO1FBQ1IsYUFBYTtRQUNiLE9BQU8sRUFBUyxVQUFVO0tBQzNCLENBQUM7SUFFRixTQUFnQiwwQkFBMEIsQ0FBQyxVQUFrQixFQUFFLEtBQVU7UUFDdkUsSUFBSSxLQUFLLElBQUksSUFBSSxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLEtBQUssQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLEVBQUU7WUFDakUsTUFBTSxJQUFJLEtBQUssQ0FBQyxlQUFhLFVBQVUsb0NBQWlDLENBQUMsQ0FBQztTQUMzRTthQUFNLElBQUksS0FBSyxJQUFJLElBQUksRUFBRTtZQUN4QixJQUFNLE9BQUssR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFXLENBQUM7WUFDakMsSUFBTSxLQUFHLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBVyxDQUFDO1lBQy9CLDJDQUEyQztZQUMzQyw4QkFBOEIsQ0FBQyxPQUFPLENBQUMsVUFBQSxNQUFNO2dCQUMzQyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBSyxDQUFDLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFHLENBQUMsRUFBRTtvQkFDMUMsTUFBTSxJQUFJLEtBQUssQ0FBQyxPQUFLLE9BQUssWUFBTyxLQUFHLCtDQUE0QyxDQUFDLENBQUM7aUJBQ25GO1lBQ0gsQ0FBQyxDQUFDLENBQUM7U0FDSjtJQUNILENBQUM7SUFiRCxnRUFhQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gYXNzZXJ0QXJyYXlPZlN0cmluZ3MoaWRlbnRpZmllcjogc3RyaW5nLCB2YWx1ZTogYW55KSB7XG4gIGlmICh2YWx1ZSA9PSBudWxsKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGlmICghQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEV4cGVjdGVkICcke2lkZW50aWZpZXJ9JyB0byBiZSBhbiBhcnJheSBvZiBzdHJpbmdzLmApO1xuICB9XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgdmFsdWUubGVuZ3RoOyBpICs9IDEpIHtcbiAgICBpZiAodHlwZW9mIHZhbHVlW2ldICE9PSAnc3RyaW5nJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBFeHBlY3RlZCAnJHtpZGVudGlmaWVyfScgdG8gYmUgYW4gYXJyYXkgb2Ygc3RyaW5ncy5gKTtcbiAgICB9XG4gIH1cbn1cblxuY29uc3QgVU5VU0FCTEVfSU5URVJQT0xBVElPTl9SRUdFWFBTID0gW1xuICAvXlxccyokLywgICAgICAgIC8vIGVtcHR5XG4gIC9bPD5dLywgICAgICAgICAvLyBodG1sIHRhZ1xuICAvXlt7fV0kLywgICAgICAgLy8gaTE4biBleHBhbnNpb25cbiAgLyYoI3xbYS16XSkvaSwgIC8vIGNoYXJhY3RlciByZWZlcmVuY2UsXG4gIC9eXFwvXFwvLywgICAgICAgIC8vIGNvbW1lbnRcbl07XG5cbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnRJbnRlcnBvbGF0aW9uU3ltYm9scyhpZGVudGlmaWVyOiBzdHJpbmcsIHZhbHVlOiBhbnkpOiB2b2lkIHtcbiAgaWYgKHZhbHVlICE9IG51bGwgJiYgIShBcnJheS5pc0FycmF5KHZhbHVlKSAmJiB2YWx1ZS5sZW5ndGggPT0gMikpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEV4cGVjdGVkICcke2lkZW50aWZpZXJ9JyB0byBiZSBhbiBhcnJheSwgW3N0YXJ0LCBlbmRdLmApO1xuICB9IGVsc2UgaWYgKHZhbHVlICE9IG51bGwpIHtcbiAgICBjb25zdCBzdGFydCA9IHZhbHVlWzBdIGFzIHN0cmluZztcbiAgICBjb25zdCBlbmQgPSB2YWx1ZVsxXSBhcyBzdHJpbmc7XG4gICAgLy8gQ2hlY2sgZm9yIHVudXNhYmxlIGludGVycG9sYXRpb24gc3ltYm9sc1xuICAgIFVOVVNBQkxFX0lOVEVSUE9MQVRJT05fUkVHRVhQUy5mb3JFYWNoKHJlZ2V4cCA9PiB7XG4gICAgICBpZiAocmVnZXhwLnRlc3Qoc3RhcnQpIHx8IHJlZ2V4cC50ZXN0KGVuZCkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBbJyR7c3RhcnR9JywgJyR7ZW5kfSddIGNvbnRhaW5zIHVudXNhYmxlIGludGVycG9sYXRpb24gc3ltYm9sLmApO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59XG4iXX0=