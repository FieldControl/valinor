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
        define("@angular/compiler-cli/linker/src/file_linker/needs_linking", ["require", "exports", "@angular/compiler-cli/linker/src/file_linker/partial_linkers/partial_linker_selector"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.needsLinking = void 0;
    var partial_linker_selector_1 = require("@angular/compiler-cli/linker/src/file_linker/partial_linkers/partial_linker_selector");
    /**
     * Determines if the provided source file may need to be processed by the linker, i.e. whether it
     * potentially contains any declarations. If true is returned, then the source file should be
     * processed by the linker as it may contain declarations that need to be fully compiled. If false
     * is returned, parsing and processing of the source file can safely be skipped to improve
     * performance.
     *
     * This function may return true even for source files that don't actually contain any declarations
     * that need to be compiled.
     *
     * @param path the absolute path of the source file for which to determine whether linking may be
     * needed.
     * @param source the source file content as a string.
     * @returns whether the source file may contain declarations that need to be linked.
     */
    function needsLinking(path, source) {
        return partial_linker_selector_1.declarationFunctions.some(function (fn) { return source.includes(fn); });
    }
    exports.needsLinking = needsLinking;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmVlZHNfbGlua2luZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9saW5rZXIvc3JjL2ZpbGVfbGlua2VyL25lZWRzX2xpbmtpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBRUgsZ0lBQStFO0lBRS9FOzs7Ozs7Ozs7Ozs7OztPQWNHO0lBQ0gsU0FBZ0IsWUFBWSxDQUFDLElBQVksRUFBRSxNQUFjO1FBQ3ZELE9BQU8sOENBQW9CLENBQUMsSUFBSSxDQUFDLFVBQUEsRUFBRSxJQUFJLE9BQUEsTUFBTSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsRUFBbkIsQ0FBbUIsQ0FBQyxDQUFDO0lBQzlELENBQUM7SUFGRCxvQ0FFQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2RlY2xhcmF0aW9uRnVuY3Rpb25zfSBmcm9tICcuL3BhcnRpYWxfbGlua2Vycy9wYXJ0aWFsX2xpbmtlcl9zZWxlY3Rvcic7XG5cbi8qKlxuICogRGV0ZXJtaW5lcyBpZiB0aGUgcHJvdmlkZWQgc291cmNlIGZpbGUgbWF5IG5lZWQgdG8gYmUgcHJvY2Vzc2VkIGJ5IHRoZSBsaW5rZXIsIGkuZS4gd2hldGhlciBpdFxuICogcG90ZW50aWFsbHkgY29udGFpbnMgYW55IGRlY2xhcmF0aW9ucy4gSWYgdHJ1ZSBpcyByZXR1cm5lZCwgdGhlbiB0aGUgc291cmNlIGZpbGUgc2hvdWxkIGJlXG4gKiBwcm9jZXNzZWQgYnkgdGhlIGxpbmtlciBhcyBpdCBtYXkgY29udGFpbiBkZWNsYXJhdGlvbnMgdGhhdCBuZWVkIHRvIGJlIGZ1bGx5IGNvbXBpbGVkLiBJZiBmYWxzZVxuICogaXMgcmV0dXJuZWQsIHBhcnNpbmcgYW5kIHByb2Nlc3Npbmcgb2YgdGhlIHNvdXJjZSBmaWxlIGNhbiBzYWZlbHkgYmUgc2tpcHBlZCB0byBpbXByb3ZlXG4gKiBwZXJmb3JtYW5jZS5cbiAqXG4gKiBUaGlzIGZ1bmN0aW9uIG1heSByZXR1cm4gdHJ1ZSBldmVuIGZvciBzb3VyY2UgZmlsZXMgdGhhdCBkb24ndCBhY3R1YWxseSBjb250YWluIGFueSBkZWNsYXJhdGlvbnNcbiAqIHRoYXQgbmVlZCB0byBiZSBjb21waWxlZC5cbiAqXG4gKiBAcGFyYW0gcGF0aCB0aGUgYWJzb2x1dGUgcGF0aCBvZiB0aGUgc291cmNlIGZpbGUgZm9yIHdoaWNoIHRvIGRldGVybWluZSB3aGV0aGVyIGxpbmtpbmcgbWF5IGJlXG4gKiBuZWVkZWQuXG4gKiBAcGFyYW0gc291cmNlIHRoZSBzb3VyY2UgZmlsZSBjb250ZW50IGFzIGEgc3RyaW5nLlxuICogQHJldHVybnMgd2hldGhlciB0aGUgc291cmNlIGZpbGUgbWF5IGNvbnRhaW4gZGVjbGFyYXRpb25zIHRoYXQgbmVlZCB0byBiZSBsaW5rZWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBuZWVkc0xpbmtpbmcocGF0aDogc3RyaW5nLCBzb3VyY2U6IHN0cmluZyk6IGJvb2xlYW4ge1xuICByZXR1cm4gZGVjbGFyYXRpb25GdW5jdGlvbnMuc29tZShmbiA9PiBzb3VyY2UuaW5jbHVkZXMoZm4pKTtcbn1cbiJdfQ==