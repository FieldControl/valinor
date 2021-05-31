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
        define("@angular/compiler-cli/src/ngtsc/shims", ["require", "exports", "@angular/compiler-cli/src/ngtsc/shims/src/adapter", "@angular/compiler-cli/src/ngtsc/shims/src/expando", "@angular/compiler-cli/src/ngtsc/shims/src/factory_generator", "@angular/compiler-cli/src/ngtsc/shims/src/reference_tagger", "@angular/compiler-cli/src/ngtsc/shims/src/summary_generator"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SummaryGenerator = exports.ShimReferenceTagger = exports.generatedFactoryTransform = exports.FactoryGenerator = exports.untagTsFile = exports.untagAllTsFiles = exports.sfExtensionData = exports.retagTsFile = exports.retagAllTsFiles = exports.isShim = exports.copyFileShimData = exports.ShimAdapter = void 0;
    /// <reference types="node" />
    var adapter_1 = require("@angular/compiler-cli/src/ngtsc/shims/src/adapter");
    Object.defineProperty(exports, "ShimAdapter", { enumerable: true, get: function () { return adapter_1.ShimAdapter; } });
    var expando_1 = require("@angular/compiler-cli/src/ngtsc/shims/src/expando");
    Object.defineProperty(exports, "copyFileShimData", { enumerable: true, get: function () { return expando_1.copyFileShimData; } });
    Object.defineProperty(exports, "isShim", { enumerable: true, get: function () { return expando_1.isShim; } });
    Object.defineProperty(exports, "retagAllTsFiles", { enumerable: true, get: function () { return expando_1.retagAllTsFiles; } });
    Object.defineProperty(exports, "retagTsFile", { enumerable: true, get: function () { return expando_1.retagTsFile; } });
    Object.defineProperty(exports, "sfExtensionData", { enumerable: true, get: function () { return expando_1.sfExtensionData; } });
    Object.defineProperty(exports, "untagAllTsFiles", { enumerable: true, get: function () { return expando_1.untagAllTsFiles; } });
    Object.defineProperty(exports, "untagTsFile", { enumerable: true, get: function () { return expando_1.untagTsFile; } });
    var factory_generator_1 = require("@angular/compiler-cli/src/ngtsc/shims/src/factory_generator");
    Object.defineProperty(exports, "FactoryGenerator", { enumerable: true, get: function () { return factory_generator_1.FactoryGenerator; } });
    Object.defineProperty(exports, "generatedFactoryTransform", { enumerable: true, get: function () { return factory_generator_1.generatedFactoryTransform; } });
    var reference_tagger_1 = require("@angular/compiler-cli/src/ngtsc/shims/src/reference_tagger");
    Object.defineProperty(exports, "ShimReferenceTagger", { enumerable: true, get: function () { return reference_tagger_1.ShimReferenceTagger; } });
    var summary_generator_1 = require("@angular/compiler-cli/src/ngtsc/shims/src/summary_generator");
    Object.defineProperty(exports, "SummaryGenerator", { enumerable: true, get: function () { return summary_generator_1.SummaryGenerator; } });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL3NoaW1zL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQUVILDhCQUE4QjtJQUU5Qiw2RUFBMEM7SUFBbEMsc0dBQUEsV0FBVyxPQUFBO0lBQ25CLDZFQUFvSTtJQUE1SCwyR0FBQSxnQkFBZ0IsT0FBQTtJQUFFLGlHQUFBLE1BQU0sT0FBQTtJQUFFLDBHQUFBLGVBQWUsT0FBQTtJQUFFLHNHQUFBLFdBQVcsT0FBQTtJQUFFLDBHQUFBLGVBQWUsT0FBQTtJQUFFLDBHQUFBLGVBQWUsT0FBQTtJQUFFLHNHQUFBLFdBQVcsT0FBQTtJQUM3RyxpR0FBb0Y7SUFBNUUscUhBQUEsZ0JBQWdCLE9BQUE7SUFBRSw4SEFBQSx5QkFBeUIsT0FBQTtJQUNuRCwrRkFBMkQ7SUFBbkQsdUhBQUEsbUJBQW1CLE9BQUE7SUFDM0IsaUdBQXlEO0lBQWpELHFIQUFBLGdCQUFnQixPQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbi8vLyA8cmVmZXJlbmNlIHR5cGVzPVwibm9kZVwiIC8+XG5cbmV4cG9ydCB7U2hpbUFkYXB0ZXJ9IGZyb20gJy4vc3JjL2FkYXB0ZXInO1xuZXhwb3J0IHtjb3B5RmlsZVNoaW1EYXRhLCBpc1NoaW0sIHJldGFnQWxsVHNGaWxlcywgcmV0YWdUc0ZpbGUsIHNmRXh0ZW5zaW9uRGF0YSwgdW50YWdBbGxUc0ZpbGVzLCB1bnRhZ1RzRmlsZX0gZnJvbSAnLi9zcmMvZXhwYW5kbyc7XG5leHBvcnQge0ZhY3RvcnlHZW5lcmF0b3IsIGdlbmVyYXRlZEZhY3RvcnlUcmFuc2Zvcm19IGZyb20gJy4vc3JjL2ZhY3RvcnlfZ2VuZXJhdG9yJztcbmV4cG9ydCB7U2hpbVJlZmVyZW5jZVRhZ2dlcn0gZnJvbSAnLi9zcmMvcmVmZXJlbmNlX3RhZ2dlcic7XG5leHBvcnQge1N1bW1hcnlHZW5lcmF0b3J9IGZyb20gJy4vc3JjL3N1bW1hcnlfZ2VuZXJhdG9yJztcbiJdfQ==