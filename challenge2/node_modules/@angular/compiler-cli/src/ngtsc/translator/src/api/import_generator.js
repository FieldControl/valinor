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
        define("@angular/compiler-cli/src/ngtsc/translator/src/api/import_generator", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1wb3J0X2dlbmVyYXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvbmd0c2MvdHJhbnNsYXRvci9zcmMvYXBpL2ltcG9ydF9nZW5lcmF0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbi8qKlxuICogVGhlIHN5bWJvbCBuYW1lIGFuZCBpbXBvcnQgbmFtZXNwYWNlIG9mIGFuIGltcG9ydGVkIHN5bWJvbCxcbiAqIHdoaWNoIGhhcyBiZWVuIHJlZ2lzdGVyZWQgdGhyb3VnaCB0aGUgSW1wb3J0R2VuZXJhdG9yLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIE5hbWVkSW1wb3J0PFRFeHByZXNzaW9uPiB7XG4gIC8qKiBUaGUgaW1wb3J0IG5hbWVzcGFjZSBjb250YWluaW5nIHRoaXMgaW1wb3J0ZWQgc3ltYm9sLiAqL1xuICBtb2R1bGVJbXBvcnQ6IFRFeHByZXNzaW9ufG51bGw7XG4gIC8qKiBUaGUgKHBvc3NpYmx5IHJld3JpdHRlbikgbmFtZSBvZiB0aGUgaW1wb3J0ZWQgc3ltYm9sLiAqL1xuICBzeW1ib2w6IHN0cmluZztcbn1cblxuLyoqXG4gKiBHZW5lcmF0ZSBpbXBvcnQgaW5mb3JtYXRpb24gYmFzZWQgb24gdGhlIGNvbnRleHQgb2YgdGhlIGNvZGUgYmVpbmcgZ2VuZXJhdGVkLlxuICpcbiAqIEltcGxlbWVudGF0aW9ucyBvZiB0aGVzZSBtZXRob2RzIHJldHVybiBhIHNwZWNpZmljIGlkZW50aWZpZXIgdGhhdCBjb3JyZXNwb25kcyB0byB0aGUgaW1wb3J0ZWRcbiAqIG1vZHVsZS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBJbXBvcnRHZW5lcmF0b3I8VEV4cHJlc3Npb24+IHtcbiAgZ2VuZXJhdGVOYW1lc3BhY2VJbXBvcnQobW9kdWxlTmFtZTogc3RyaW5nKTogVEV4cHJlc3Npb247XG4gIGdlbmVyYXRlTmFtZWRJbXBvcnQobW9kdWxlTmFtZTogc3RyaW5nLCBvcmlnaW5hbFN5bWJvbDogc3RyaW5nKTogTmFtZWRJbXBvcnQ8VEV4cHJlc3Npb24+O1xufVxuIl19