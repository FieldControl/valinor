(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/src/ngtsc/sourcemaps", ["require", "exports", "@angular/compiler-cli/src/ngtsc/sourcemaps/src/content_origin", "@angular/compiler-cli/src/ngtsc/sourcemaps/src/source_file", "@angular/compiler-cli/src/ngtsc/sourcemaps/src/source_file_loader"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SourceFileLoader = exports.SourceFile = exports.ContentOrigin = void 0;
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var content_origin_1 = require("@angular/compiler-cli/src/ngtsc/sourcemaps/src/content_origin");
    Object.defineProperty(exports, "ContentOrigin", { enumerable: true, get: function () { return content_origin_1.ContentOrigin; } });
    var source_file_1 = require("@angular/compiler-cli/src/ngtsc/sourcemaps/src/source_file");
    Object.defineProperty(exports, "SourceFile", { enumerable: true, get: function () { return source_file_1.SourceFile; } });
    var source_file_loader_1 = require("@angular/compiler-cli/src/ngtsc/sourcemaps/src/source_file_loader");
    Object.defineProperty(exports, "SourceFileLoader", { enumerable: true, get: function () { return source_file_loader_1.SourceFileLoader; } });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL3NvdXJjZW1hcHMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0lBQUE7Ozs7OztPQU1HO0lBQ0gsZ0dBQW1EO0lBQTNDLCtHQUFBLGFBQWEsT0FBQTtJQUVyQiwwRkFBc0Q7SUFBckMseUdBQUEsVUFBVSxPQUFBO0lBQzNCLHdHQUEwRDtJQUFsRCxzSEFBQSxnQkFBZ0IsT0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuZXhwb3J0IHtDb250ZW50T3JpZ2lufSBmcm9tICcuL3NyYy9jb250ZW50X29yaWdpbic7XG5leHBvcnQge01hcEFuZFBhdGgsIFJhd1NvdXJjZU1hcH0gZnJvbSAnLi9zcmMvcmF3X3NvdXJjZV9tYXAnO1xuZXhwb3J0IHtNYXBwaW5nLCBTb3VyY2VGaWxlfSBmcm9tICcuL3NyYy9zb3VyY2VfZmlsZSc7XG5leHBvcnQge1NvdXJjZUZpbGVMb2FkZXJ9IGZyb20gJy4vc3JjL3NvdXJjZV9maWxlX2xvYWRlcic7XG4iXX0=