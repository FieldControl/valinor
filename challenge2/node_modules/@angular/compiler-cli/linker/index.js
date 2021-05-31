(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/linker", ["require", "exports", "@angular/compiler-cli/linker/src/ast/utils", "@angular/compiler-cli/linker/src/fatal_linker_error", "@angular/compiler-cli/linker/src/file_linker/file_linker", "@angular/compiler-cli/linker/src/file_linker/linker_environment", "@angular/compiler-cli/linker/src/file_linker/linker_options", "@angular/compiler-cli/linker/src/file_linker/needs_linking"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.needsLinking = exports.DEFAULT_LINKER_OPTIONS = exports.LinkerEnvironment = exports.FileLinker = exports.isFatalLinkerError = exports.FatalLinkerError = exports.assert = void 0;
    var utils_1 = require("@angular/compiler-cli/linker/src/ast/utils");
    Object.defineProperty(exports, "assert", { enumerable: true, get: function () { return utils_1.assert; } });
    var fatal_linker_error_1 = require("@angular/compiler-cli/linker/src/fatal_linker_error");
    Object.defineProperty(exports, "FatalLinkerError", { enumerable: true, get: function () { return fatal_linker_error_1.FatalLinkerError; } });
    Object.defineProperty(exports, "isFatalLinkerError", { enumerable: true, get: function () { return fatal_linker_error_1.isFatalLinkerError; } });
    var file_linker_1 = require("@angular/compiler-cli/linker/src/file_linker/file_linker");
    Object.defineProperty(exports, "FileLinker", { enumerable: true, get: function () { return file_linker_1.FileLinker; } });
    var linker_environment_1 = require("@angular/compiler-cli/linker/src/file_linker/linker_environment");
    Object.defineProperty(exports, "LinkerEnvironment", { enumerable: true, get: function () { return linker_environment_1.LinkerEnvironment; } });
    var linker_options_1 = require("@angular/compiler-cli/linker/src/file_linker/linker_options");
    Object.defineProperty(exports, "DEFAULT_LINKER_OPTIONS", { enumerable: true, get: function () { return linker_options_1.DEFAULT_LINKER_OPTIONS; } });
    var needs_linking_1 = require("@angular/compiler-cli/linker/src/file_linker/needs_linking");
    Object.defineProperty(exports, "needsLinking", { enumerable: true, get: function () { return needs_linking_1.needsLinking; } });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvbGlua2VyL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztJQVFBLG9FQUF1QztJQUEvQiwrRkFBQSxNQUFNLE9BQUE7SUFDZCwwRkFBOEU7SUFBdEUsc0hBQUEsZ0JBQWdCLE9BQUE7SUFBRSx3SEFBQSxrQkFBa0IsT0FBQTtJQUU1Qyx3RkFBeUQ7SUFBakQseUdBQUEsVUFBVSxPQUFBO0lBQ2xCLHNHQUF1RTtJQUEvRCx1SEFBQSxpQkFBaUIsT0FBQTtJQUN6Qiw4RkFBdUY7SUFBL0Usd0hBQUEsc0JBQXNCLE9BQUE7SUFDOUIsNEZBQTZEO0lBQXJELDZHQUFBLFlBQVksT0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuZXhwb3J0IHtBc3RIb3N0LCBSYW5nZX0gZnJvbSAnLi9zcmMvYXN0L2FzdF9ob3N0JztcbmV4cG9ydCB7YXNzZXJ0fSBmcm9tICcuL3NyYy9hc3QvdXRpbHMnO1xuZXhwb3J0IHtGYXRhbExpbmtlckVycm9yLCBpc0ZhdGFsTGlua2VyRXJyb3J9IGZyb20gJy4vc3JjL2ZhdGFsX2xpbmtlcl9lcnJvcic7XG5leHBvcnQge0RlY2xhcmF0aW9uU2NvcGV9IGZyb20gJy4vc3JjL2ZpbGVfbGlua2VyL2RlY2xhcmF0aW9uX3Njb3BlJztcbmV4cG9ydCB7RmlsZUxpbmtlcn0gZnJvbSAnLi9zcmMvZmlsZV9saW5rZXIvZmlsZV9saW5rZXInO1xuZXhwb3J0IHtMaW5rZXJFbnZpcm9ubWVudH0gZnJvbSAnLi9zcmMvZmlsZV9saW5rZXIvbGlua2VyX2Vudmlyb25tZW50JztcbmV4cG9ydCB7REVGQVVMVF9MSU5LRVJfT1BUSU9OUywgTGlua2VyT3B0aW9uc30gZnJvbSAnLi9zcmMvZmlsZV9saW5rZXIvbGlua2VyX29wdGlvbnMnO1xuZXhwb3J0IHtuZWVkc0xpbmtpbmd9IGZyb20gJy4vc3JjL2ZpbGVfbGlua2VyL25lZWRzX2xpbmtpbmcnO1xuIl19