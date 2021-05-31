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
        define("@angular/compiler-cli/src/ngtsc/indexer", ["require", "exports", "tslib", "@angular/compiler-cli/src/ngtsc/indexer/src/api", "@angular/compiler-cli/src/ngtsc/indexer/src/context", "@angular/compiler-cli/src/ngtsc/indexer/src/transform"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.generateAnalysis = exports.IndexingContext = void 0;
    var tslib_1 = require("tslib");
    tslib_1.__exportStar(require("@angular/compiler-cli/src/ngtsc/indexer/src/api"), exports);
    var context_1 = require("@angular/compiler-cli/src/ngtsc/indexer/src/context");
    Object.defineProperty(exports, "IndexingContext", { enumerable: true, get: function () { return context_1.IndexingContext; } });
    var transform_1 = require("@angular/compiler-cli/src/ngtsc/indexer/src/transform");
    Object.defineProperty(exports, "generateAnalysis", { enumerable: true, get: function () { return transform_1.generateAnalysis; } });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL2luZGV4ZXIvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUVILDBGQUEwQjtJQUMxQiwrRUFBOEM7SUFBdEMsMEdBQUEsZUFBZSxPQUFBO0lBQ3ZCLG1GQUFpRDtJQUF6Qyw2R0FBQSxnQkFBZ0IsT0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5leHBvcnQgKiBmcm9tICcuL3NyYy9hcGknO1xuZXhwb3J0IHtJbmRleGluZ0NvbnRleHR9IGZyb20gJy4vc3JjL2NvbnRleHQnO1xuZXhwb3J0IHtnZW5lcmF0ZUFuYWx5c2lzfSBmcm9tICcuL3NyYy90cmFuc2Zvcm0nO1xuIl19