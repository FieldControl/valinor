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
        define("@angular/compiler-cli/src/ngtsc/typecheck", ["require", "exports", "@angular/compiler-cli/src/ngtsc/typecheck/src/checker", "@angular/compiler-cli/src/ngtsc/typecheck/src/context", "@angular/compiler-cli/src/ngtsc/typecheck/src/shim", "@angular/compiler-cli/src/ngtsc/typecheck/src/type_check_file"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.typeCheckFilePath = exports.TypeCheckShimGenerator = exports.TypeCheckContextImpl = exports.TemplateTypeCheckerImpl = void 0;
    var checker_1 = require("@angular/compiler-cli/src/ngtsc/typecheck/src/checker");
    Object.defineProperty(exports, "TemplateTypeCheckerImpl", { enumerable: true, get: function () { return checker_1.TemplateTypeCheckerImpl; } });
    var context_1 = require("@angular/compiler-cli/src/ngtsc/typecheck/src/context");
    Object.defineProperty(exports, "TypeCheckContextImpl", { enumerable: true, get: function () { return context_1.TypeCheckContextImpl; } });
    var shim_1 = require("@angular/compiler-cli/src/ngtsc/typecheck/src/shim");
    Object.defineProperty(exports, "TypeCheckShimGenerator", { enumerable: true, get: function () { return shim_1.TypeCheckShimGenerator; } });
    var type_check_file_1 = require("@angular/compiler-cli/src/ngtsc/typecheck/src/type_check_file");
    Object.defineProperty(exports, "typeCheckFilePath", { enumerable: true, get: function () { return type_check_file_1.typeCheckFilePath; } });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL3R5cGVjaGVjay9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFFSCxpRkFBNEU7SUFBOUMsa0hBQUEsdUJBQXVCLE9BQUE7SUFDckQsaUZBQW1EO0lBQTNDLCtHQUFBLG9CQUFvQixPQUFBO0lBQzVCLDJFQUFrRDtJQUExQyw4R0FBQSxzQkFBc0IsT0FBQTtJQUM5QixpR0FBd0Q7SUFBaEQsb0hBQUEsaUJBQWlCLE9BQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuZXhwb3J0IHtGaWxlVHlwZUNoZWNraW5nRGF0YSwgVGVtcGxhdGVUeXBlQ2hlY2tlckltcGx9IGZyb20gJy4vc3JjL2NoZWNrZXInO1xuZXhwb3J0IHtUeXBlQ2hlY2tDb250ZXh0SW1wbH0gZnJvbSAnLi9zcmMvY29udGV4dCc7XG5leHBvcnQge1R5cGVDaGVja1NoaW1HZW5lcmF0b3J9IGZyb20gJy4vc3JjL3NoaW0nO1xuZXhwb3J0IHt0eXBlQ2hlY2tGaWxlUGF0aH0gZnJvbSAnLi9zcmMvdHlwZV9jaGVja19maWxlJztcbiJdfQ==