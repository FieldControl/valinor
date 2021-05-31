(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/src/ngtsc/file_system", ["require", "exports", "@angular/compiler-cli/src/ngtsc/file_system/src/compiler_host", "@angular/compiler-cli/src/ngtsc/file_system/src/helpers", "@angular/compiler-cli/src/ngtsc/file_system/src/logical", "@angular/compiler-cli/src/ngtsc/file_system/src/node_js_file_system", "@angular/compiler-cli/src/ngtsc/file_system/src/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getSourceFileOrError = exports.NodeJSFileSystem = exports.LogicalProjectPath = exports.LogicalFileSystem = exports.toRelativeImport = exports.setFileSystem = exports.resolve = exports.relativeFrom = exports.relative = exports.join = exports.isRooted = exports.isRoot = exports.isLocalRelativePath = exports.getFileSystem = exports.dirname = exports.basename = exports.absoluteFromSourceFile = exports.absoluteFrom = exports.NgtscCompilerHost = void 0;
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var compiler_host_1 = require("@angular/compiler-cli/src/ngtsc/file_system/src/compiler_host");
    Object.defineProperty(exports, "NgtscCompilerHost", { enumerable: true, get: function () { return compiler_host_1.NgtscCompilerHost; } });
    var helpers_1 = require("@angular/compiler-cli/src/ngtsc/file_system/src/helpers");
    Object.defineProperty(exports, "absoluteFrom", { enumerable: true, get: function () { return helpers_1.absoluteFrom; } });
    Object.defineProperty(exports, "absoluteFromSourceFile", { enumerable: true, get: function () { return helpers_1.absoluteFromSourceFile; } });
    Object.defineProperty(exports, "basename", { enumerable: true, get: function () { return helpers_1.basename; } });
    Object.defineProperty(exports, "dirname", { enumerable: true, get: function () { return helpers_1.dirname; } });
    Object.defineProperty(exports, "getFileSystem", { enumerable: true, get: function () { return helpers_1.getFileSystem; } });
    Object.defineProperty(exports, "isLocalRelativePath", { enumerable: true, get: function () { return helpers_1.isLocalRelativePath; } });
    Object.defineProperty(exports, "isRoot", { enumerable: true, get: function () { return helpers_1.isRoot; } });
    Object.defineProperty(exports, "isRooted", { enumerable: true, get: function () { return helpers_1.isRooted; } });
    Object.defineProperty(exports, "join", { enumerable: true, get: function () { return helpers_1.join; } });
    Object.defineProperty(exports, "relative", { enumerable: true, get: function () { return helpers_1.relative; } });
    Object.defineProperty(exports, "relativeFrom", { enumerable: true, get: function () { return helpers_1.relativeFrom; } });
    Object.defineProperty(exports, "resolve", { enumerable: true, get: function () { return helpers_1.resolve; } });
    Object.defineProperty(exports, "setFileSystem", { enumerable: true, get: function () { return helpers_1.setFileSystem; } });
    Object.defineProperty(exports, "toRelativeImport", { enumerable: true, get: function () { return helpers_1.toRelativeImport; } });
    var logical_1 = require("@angular/compiler-cli/src/ngtsc/file_system/src/logical");
    Object.defineProperty(exports, "LogicalFileSystem", { enumerable: true, get: function () { return logical_1.LogicalFileSystem; } });
    Object.defineProperty(exports, "LogicalProjectPath", { enumerable: true, get: function () { return logical_1.LogicalProjectPath; } });
    var node_js_file_system_1 = require("@angular/compiler-cli/src/ngtsc/file_system/src/node_js_file_system");
    Object.defineProperty(exports, "NodeJSFileSystem", { enumerable: true, get: function () { return node_js_file_system_1.NodeJSFileSystem; } });
    var util_1 = require("@angular/compiler-cli/src/ngtsc/file_system/src/util");
    Object.defineProperty(exports, "getSourceFileOrError", { enumerable: true, get: function () { return util_1.getSourceFileOrError; } });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL2ZpbGVfc3lzdGVtL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztJQUFBOzs7Ozs7T0FNRztJQUNILCtGQUFzRDtJQUE5QyxrSEFBQSxpQkFBaUIsT0FBQTtJQUN6QixtRkFBb047SUFBNU0sdUdBQUEsWUFBWSxPQUFBO0lBQUUsaUhBQUEsc0JBQXNCLE9BQUE7SUFBRSxtR0FBQSxRQUFRLE9BQUE7SUFBRSxrR0FBQSxPQUFPLE9BQUE7SUFBRSx3R0FBQSxhQUFhLE9BQUE7SUFBRSw4R0FBQSxtQkFBbUIsT0FBQTtJQUFFLGlHQUFBLE1BQU0sT0FBQTtJQUFFLG1HQUFBLFFBQVEsT0FBQTtJQUFFLCtGQUFBLElBQUksT0FBQTtJQUFFLG1HQUFBLFFBQVEsT0FBQTtJQUFFLHVHQUFBLFlBQVksT0FBQTtJQUFFLGtHQUFBLE9BQU8sT0FBQTtJQUFFLHdHQUFBLGFBQWEsT0FBQTtJQUFFLDJHQUFBLGdCQUFnQixPQUFBO0lBQzdMLG1GQUFvRTtJQUE1RCw0R0FBQSxpQkFBaUIsT0FBQTtJQUFFLDZHQUFBLGtCQUFrQixPQUFBO0lBQzdDLDJHQUEyRDtJQUFuRCx1SEFBQSxnQkFBZ0IsT0FBQTtJQUV4Qiw2RUFBZ0Q7SUFBeEMsNEdBQUEsb0JBQW9CLE9BQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmV4cG9ydCB7Tmd0c2NDb21waWxlckhvc3R9IGZyb20gJy4vc3JjL2NvbXBpbGVyX2hvc3QnO1xuZXhwb3J0IHthYnNvbHV0ZUZyb20sIGFic29sdXRlRnJvbVNvdXJjZUZpbGUsIGJhc2VuYW1lLCBkaXJuYW1lLCBnZXRGaWxlU3lzdGVtLCBpc0xvY2FsUmVsYXRpdmVQYXRoLCBpc1Jvb3QsIGlzUm9vdGVkLCBqb2luLCByZWxhdGl2ZSwgcmVsYXRpdmVGcm9tLCByZXNvbHZlLCBzZXRGaWxlU3lzdGVtLCB0b1JlbGF0aXZlSW1wb3J0fSBmcm9tICcuL3NyYy9oZWxwZXJzJztcbmV4cG9ydCB7TG9naWNhbEZpbGVTeXN0ZW0sIExvZ2ljYWxQcm9qZWN0UGF0aH0gZnJvbSAnLi9zcmMvbG9naWNhbCc7XG5leHBvcnQge05vZGVKU0ZpbGVTeXN0ZW19IGZyb20gJy4vc3JjL25vZGVfanNfZmlsZV9zeXN0ZW0nO1xuZXhwb3J0IHtBYnNvbHV0ZUZzUGF0aCwgRmlsZVN0YXRzLCBGaWxlU3lzdGVtLCBQYXRoTWFuaXB1bGF0aW9uLCBQYXRoU2VnbWVudCwgUGF0aFN0cmluZywgUmVhZG9ubHlGaWxlU3lzdGVtfSBmcm9tICcuL3NyYy90eXBlcyc7XG5leHBvcnQge2dldFNvdXJjZUZpbGVPckVycm9yfSBmcm9tICcuL3NyYy91dGlsJztcbiJdfQ==