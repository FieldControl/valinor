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
        define("@angular/compiler-cli/linker/src/file_linker/get_source_file", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createGetSourceFile = void 0;
    /**
     * Create a `GetSourceFileFn` that will return the `SourceFile` being linked or `null`, if not
     * available.
     */
    function createGetSourceFile(sourceUrl, code, loader) {
        if (loader === null) {
            // No source-mapping so just return a function that always returns `null`.
            return function () { return null; };
        }
        else {
            // Source-mapping is available so return a function that will load (and cache) the `SourceFile`.
            var sourceFile_1 = undefined;
            return function () {
                if (sourceFile_1 === undefined) {
                    sourceFile_1 = loader.loadSourceFile(sourceUrl, code);
                }
                return sourceFile_1;
            };
        }
    }
    exports.createGetSourceFile = createGetSourceFile;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0X3NvdXJjZV9maWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL2xpbmtlci9zcmMvZmlsZV9saW5rZXIvZ2V0X3NvdXJjZV9maWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQVVIOzs7T0FHRztJQUNILFNBQWdCLG1CQUFtQixDQUMvQixTQUF5QixFQUFFLElBQVksRUFBRSxNQUE2QjtRQUN4RSxJQUFJLE1BQU0sS0FBSyxJQUFJLEVBQUU7WUFDbkIsMEVBQTBFO1lBQzFFLE9BQU8sY0FBTSxPQUFBLElBQUksRUFBSixDQUFJLENBQUM7U0FDbkI7YUFBTTtZQUNMLGdHQUFnRztZQUNoRyxJQUFJLFlBQVUsR0FBOEIsU0FBUyxDQUFDO1lBQ3RELE9BQU87Z0JBQ0wsSUFBSSxZQUFVLEtBQUssU0FBUyxFQUFFO29CQUM1QixZQUFVLEdBQUcsTUFBTSxDQUFDLGNBQWMsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7aUJBQ3JEO2dCQUNELE9BQU8sWUFBVSxDQUFDO1lBQ3BCLENBQUMsQ0FBQztTQUNIO0lBQ0gsQ0FBQztJQWZELGtEQWVDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7QWJzb2x1dGVGc1BhdGh9IGZyb20gJy4uLy4uLy4uL3NyYy9uZ3RzYy9maWxlX3N5c3RlbSc7XG5pbXBvcnQge1NvdXJjZUZpbGUsIFNvdXJjZUZpbGVMb2FkZXJ9IGZyb20gJy4uLy4uLy4uL3NyYy9uZ3RzYy9zb3VyY2VtYXBzJztcblxuLyoqXG4gKiBBIGZ1bmN0aW9uIHRoYXQgd2lsbCByZXR1cm4gYSBgU291cmNlRmlsZWAgb2JqZWN0IChvciBudWxsKSBmb3IgdGhlIGN1cnJlbnQgZmlsZSBiZWluZyBsaW5rZWQuXG4gKi9cbmV4cG9ydCB0eXBlIEdldFNvdXJjZUZpbGVGbiA9ICgpID0+IFNvdXJjZUZpbGV8bnVsbDtcblxuLyoqXG4gKiBDcmVhdGUgYSBgR2V0U291cmNlRmlsZUZuYCB0aGF0IHdpbGwgcmV0dXJuIHRoZSBgU291cmNlRmlsZWAgYmVpbmcgbGlua2VkIG9yIGBudWxsYCwgaWYgbm90XG4gKiBhdmFpbGFibGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVHZXRTb3VyY2VGaWxlKFxuICAgIHNvdXJjZVVybDogQWJzb2x1dGVGc1BhdGgsIGNvZGU6IHN0cmluZywgbG9hZGVyOiBTb3VyY2VGaWxlTG9hZGVyfG51bGwpOiBHZXRTb3VyY2VGaWxlRm4ge1xuICBpZiAobG9hZGVyID09PSBudWxsKSB7XG4gICAgLy8gTm8gc291cmNlLW1hcHBpbmcgc28ganVzdCByZXR1cm4gYSBmdW5jdGlvbiB0aGF0IGFsd2F5cyByZXR1cm5zIGBudWxsYC5cbiAgICByZXR1cm4gKCkgPT4gbnVsbDtcbiAgfSBlbHNlIHtcbiAgICAvLyBTb3VyY2UtbWFwcGluZyBpcyBhdmFpbGFibGUgc28gcmV0dXJuIGEgZnVuY3Rpb24gdGhhdCB3aWxsIGxvYWQgKGFuZCBjYWNoZSkgdGhlIGBTb3VyY2VGaWxlYC5cbiAgICBsZXQgc291cmNlRmlsZTogU291cmNlRmlsZXxudWxsfHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgaWYgKHNvdXJjZUZpbGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBzb3VyY2VGaWxlID0gbG9hZGVyLmxvYWRTb3VyY2VGaWxlKHNvdXJjZVVybCwgY29kZSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gc291cmNlRmlsZTtcbiAgICB9O1xuICB9XG59XG4iXX0=