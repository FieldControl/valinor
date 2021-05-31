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
        define("@angular/compiler-cli/src/ngtsc/diagnostics", ["require", "exports", "@angular/compiler-cli/src/ngtsc/diagnostics/src/error", "@angular/compiler-cli/src/ngtsc/diagnostics/src/error_code", "@angular/compiler-cli/src/ngtsc/diagnostics/src/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.replaceTsWithNgInErrors = exports.ngErrorCode = exports.ErrorCode = exports.ERROR_DETAILS_PAGE_BASE_URL = exports.COMPILER_ERRORS_WITH_GUIDES = exports.makeRelatedInformation = exports.makeDiagnostic = exports.isFatalDiagnosticError = exports.FatalDiagnosticError = void 0;
    var error_1 = require("@angular/compiler-cli/src/ngtsc/diagnostics/src/error");
    Object.defineProperty(exports, "FatalDiagnosticError", { enumerable: true, get: function () { return error_1.FatalDiagnosticError; } });
    Object.defineProperty(exports, "isFatalDiagnosticError", { enumerable: true, get: function () { return error_1.isFatalDiagnosticError; } });
    Object.defineProperty(exports, "makeDiagnostic", { enumerable: true, get: function () { return error_1.makeDiagnostic; } });
    Object.defineProperty(exports, "makeRelatedInformation", { enumerable: true, get: function () { return error_1.makeRelatedInformation; } });
    var error_code_1 = require("@angular/compiler-cli/src/ngtsc/diagnostics/src/error_code");
    Object.defineProperty(exports, "COMPILER_ERRORS_WITH_GUIDES", { enumerable: true, get: function () { return error_code_1.COMPILER_ERRORS_WITH_GUIDES; } });
    Object.defineProperty(exports, "ERROR_DETAILS_PAGE_BASE_URL", { enumerable: true, get: function () { return error_code_1.ERROR_DETAILS_PAGE_BASE_URL; } });
    Object.defineProperty(exports, "ErrorCode", { enumerable: true, get: function () { return error_code_1.ErrorCode; } });
    Object.defineProperty(exports, "ngErrorCode", { enumerable: true, get: function () { return error_code_1.ngErrorCode; } });
    var util_1 = require("@angular/compiler-cli/src/ngtsc/diagnostics/src/util");
    Object.defineProperty(exports, "replaceTsWithNgInErrors", { enumerable: true, get: function () { return util_1.replaceTsWithNgInErrors; } });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL2RpYWdub3N0aWNzL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQUVILCtFQUFpSDtJQUF6Ryw2R0FBQSxvQkFBb0IsT0FBQTtJQUFFLCtHQUFBLHNCQUFzQixPQUFBO0lBQUUsdUdBQUEsY0FBYyxPQUFBO0lBQUUsK0dBQUEsc0JBQXNCLE9BQUE7SUFDNUYseUZBQWtIO0lBQTFHLHlIQUFBLDJCQUEyQixPQUFBO0lBQUUseUhBQUEsMkJBQTJCLE9BQUE7SUFBRSx1R0FBQSxTQUFTLE9BQUE7SUFBRSx5R0FBQSxXQUFXLE9BQUE7SUFDeEYsNkVBQW1EO0lBQTNDLCtHQUFBLHVCQUF1QixPQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmV4cG9ydCB7RmF0YWxEaWFnbm9zdGljRXJyb3IsIGlzRmF0YWxEaWFnbm9zdGljRXJyb3IsIG1ha2VEaWFnbm9zdGljLCBtYWtlUmVsYXRlZEluZm9ybWF0aW9ufSBmcm9tICcuL3NyYy9lcnJvcic7XG5leHBvcnQge0NPTVBJTEVSX0VSUk9SU19XSVRIX0dVSURFUywgRVJST1JfREVUQUlMU19QQUdFX0JBU0VfVVJMLCBFcnJvckNvZGUsIG5nRXJyb3JDb2RlfSBmcm9tICcuL3NyYy9lcnJvcl9jb2RlJztcbmV4cG9ydCB7cmVwbGFjZVRzV2l0aE5nSW5FcnJvcnN9IGZyb20gJy4vc3JjL3V0aWwnO1xuIl19