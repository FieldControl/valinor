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
        define("@angular/compiler-cli/src/ngtsc/program_driver/src/api", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UpdateMode = void 0;
    var UpdateMode;
    (function (UpdateMode) {
        /**
         * A complete update creates a completely new overlay of type-checking code on top of the user's
         * original program, which doesn't include type-checking code from previous calls to
         * `updateFiles`.
         */
        UpdateMode[UpdateMode["Complete"] = 0] = "Complete";
        /**
         * An incremental update changes the contents of some files in the type-checking program without
         * reverting any prior changes.
         */
        UpdateMode[UpdateMode["Incremental"] = 1] = "Incremental";
    })(UpdateMode = exports.UpdateMode || (exports.UpdateMode = {}));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL3NyYy9uZ3RzYy9wcm9ncmFtX2RyaXZlci9zcmMvYXBpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQW1DSCxJQUFZLFVBYVg7SUFiRCxXQUFZLFVBQVU7UUFDcEI7Ozs7V0FJRztRQUNILG1EQUFRLENBQUE7UUFFUjs7O1dBR0c7UUFDSCx5REFBVyxDQUFBO0lBQ2IsQ0FBQyxFQWJXLFVBQVUsR0FBVixrQkFBVSxLQUFWLGtCQUFVLFFBYXJCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuaW1wb3J0IHtBYnNvbHV0ZUZzUGF0aH0gZnJvbSAnLi4vLi4vZmlsZV9zeXN0ZW0nO1xuXG5leHBvcnQgaW50ZXJmYWNlIFByb2dyYW1Ecml2ZXIge1xuICAvKipcbiAgICogV2hldGhlciB0aGlzIHN0cmF0ZWd5IHN1cHBvcnRzIG1vZGlmeWluZyB1c2VyIGZpbGVzIChpbmxpbmUgbW9kaWZpY2F0aW9ucykgaW4gYWRkaXRpb24gdG9cbiAgICogbW9kaWZ5aW5nIHR5cGUtY2hlY2tpbmcgc2hpbXMuXG4gICAqL1xuICByZWFkb25seSBzdXBwb3J0c0lubGluZU9wZXJhdGlvbnM6IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIFJldHJpZXZlIHRoZSBsYXRlc3QgdmVyc2lvbiBvZiB0aGUgcHJvZ3JhbSwgY29udGFpbmluZyBhbGwgdGhlIHVwZGF0ZXMgbWFkZSB0aHVzIGZhci5cbiAgICovXG4gIGdldFByb2dyYW0oKTogdHMuUHJvZ3JhbTtcblxuICAvKipcbiAgICogSW5jb3Jwb3JhdGUgYSBzZXQgb2YgY2hhbmdlcyB0byBlaXRoZXIgYXVnbWVudCBvciBjb21wbGV0ZWx5IHJlcGxhY2UgdGhlIHR5cGUtY2hlY2tpbmcgY29kZVxuICAgKiBpbmNsdWRlZCBpbiB0aGUgdHlwZS1jaGVja2luZyBwcm9ncmFtLlxuICAgKi9cbiAgdXBkYXRlRmlsZXMoY29udGVudHM6IE1hcDxBYnNvbHV0ZUZzUGF0aCwgc3RyaW5nPiwgdXBkYXRlTW9kZTogVXBkYXRlTW9kZSk6IHZvaWQ7XG5cbiAgLyoqXG4gICAqIFJldHJpZXZlIGEgc3RyaW5nIHZlcnNpb24gZm9yIGEgZ2l2ZW4gYHRzLlNvdXJjZUZpbGVgLCB3aGljaCBtdWNoIGNoYW5nZSB3aGVuIHRoZSBjb250ZW50cyBvZlxuICAgKiB0aGUgZmlsZSBoYXZlIGNoYW5nZWQuXG4gICAqXG4gICAqIElmIHRoaXMgbWV0aG9kIGlzIHByZXNlbnQsIHRoZSBjb21waWxlciB3aWxsIHVzZSB0aGVzZSB2ZXJzaW9ucyBpbiBhZGRpdGlvbiB0byBvYmplY3QgaWRlbnRpdHlcbiAgICogZm9yIGB0cy5Tb3VyY2VGaWxlYHMgdG8gZGV0ZXJtaW5lIHdoYXQncyBjaGFuZ2VkIGJldHdlZW4gdHdvIGluY3JlbWVudGFsIHByb2dyYW1zLiBUaGlzIGlzXG4gICAqIHZhbHVhYmxlIGZvciBzb21lIGNsaWVudHMgKHN1Y2ggYXMgdGhlIExhbmd1YWdlIFNlcnZpY2UpIHRoYXQgdHJlYXQgYHRzLlNvdXJjZUZpbGVgcyBhcyBtdXRhYmxlXG4gICAqIG9iamVjdHMuXG4gICAqL1xuICBnZXRTb3VyY2VGaWxlVmVyc2lvbj8oc2Y6IHRzLlNvdXJjZUZpbGUpOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBlbnVtIFVwZGF0ZU1vZGUge1xuICAvKipcbiAgICogQSBjb21wbGV0ZSB1cGRhdGUgY3JlYXRlcyBhIGNvbXBsZXRlbHkgbmV3IG92ZXJsYXkgb2YgdHlwZS1jaGVja2luZyBjb2RlIG9uIHRvcCBvZiB0aGUgdXNlcidzXG4gICAqIG9yaWdpbmFsIHByb2dyYW0sIHdoaWNoIGRvZXNuJ3QgaW5jbHVkZSB0eXBlLWNoZWNraW5nIGNvZGUgZnJvbSBwcmV2aW91cyBjYWxscyB0b1xuICAgKiBgdXBkYXRlRmlsZXNgLlxuICAgKi9cbiAgQ29tcGxldGUsXG5cbiAgLyoqXG4gICAqIEFuIGluY3JlbWVudGFsIHVwZGF0ZSBjaGFuZ2VzIHRoZSBjb250ZW50cyBvZiBzb21lIGZpbGVzIGluIHRoZSB0eXBlLWNoZWNraW5nIHByb2dyYW0gd2l0aG91dFxuICAgKiByZXZlcnRpbmcgYW55IHByaW9yIGNoYW5nZXMuXG4gICAqL1xuICBJbmNyZW1lbnRhbCxcbn1cbiJdfQ==