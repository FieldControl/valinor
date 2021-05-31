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
        define("@angular/compiler-cli/src/transformers/entry_points", ["require", "exports", "@angular/compiler-cli/src/transformers/compiler_host", "@angular/compiler-cli/src/transformers/program"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createProgram = exports.createCompilerHost = void 0;
    var compiler_host_1 = require("@angular/compiler-cli/src/transformers/compiler_host");
    Object.defineProperty(exports, "createCompilerHost", { enumerable: true, get: function () { return compiler_host_1.createCompilerHost; } });
    var program_1 = require("@angular/compiler-cli/src/transformers/program");
    Object.defineProperty(exports, "createProgram", { enumerable: true, get: function () { return program_1.createProgram; } });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW50cnlfcG9pbnRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL3NyYy90cmFuc2Zvcm1lcnMvZW50cnlfcG9pbnRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQU1ILHNGQUFtRDtJQUEzQyxtSEFBQSxrQkFBa0IsT0FBQTtJQUMxQiwwRUFBd0M7SUFBaEMsd0dBQUEsYUFBYSxPQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuXG5pbXBvcnQge0NvbXBpbGVySG9zdCwgQ29tcGlsZXJPcHRpb25zLCBQcm9ncmFtfSBmcm9tICcuL2FwaSc7XG5cbmV4cG9ydCB7Y3JlYXRlQ29tcGlsZXJIb3N0fSBmcm9tICcuL2NvbXBpbGVyX2hvc3QnO1xuZXhwb3J0IHtjcmVhdGVQcm9ncmFtfSBmcm9tICcuL3Byb2dyYW0nO1xuIl19