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
        define("@angular/compiler-cli/src/ngtsc/translator", ["require", "exports", "@angular/compiler-cli/src/ngtsc/translator/src/context", "@angular/compiler-cli/src/ngtsc/translator/src/import_manager", "@angular/compiler-cli/src/ngtsc/translator/src/translator", "@angular/compiler-cli/src/ngtsc/translator/src/type_translator", "@angular/compiler-cli/src/ngtsc/translator/src/typescript_ast_factory", "@angular/compiler-cli/src/ngtsc/translator/src/typescript_translator"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.translateStatement = exports.translateExpression = exports.TypeScriptAstFactory = exports.createTemplateTail = exports.createTemplateMiddle = exports.attachComments = exports.translateType = exports.ExpressionTranslatorVisitor = exports.ImportManager = exports.Context = void 0;
    var context_1 = require("@angular/compiler-cli/src/ngtsc/translator/src/context");
    Object.defineProperty(exports, "Context", { enumerable: true, get: function () { return context_1.Context; } });
    var import_manager_1 = require("@angular/compiler-cli/src/ngtsc/translator/src/import_manager");
    Object.defineProperty(exports, "ImportManager", { enumerable: true, get: function () { return import_manager_1.ImportManager; } });
    var translator_1 = require("@angular/compiler-cli/src/ngtsc/translator/src/translator");
    Object.defineProperty(exports, "ExpressionTranslatorVisitor", { enumerable: true, get: function () { return translator_1.ExpressionTranslatorVisitor; } });
    var type_translator_1 = require("@angular/compiler-cli/src/ngtsc/translator/src/type_translator");
    Object.defineProperty(exports, "translateType", { enumerable: true, get: function () { return type_translator_1.translateType; } });
    var typescript_ast_factory_1 = require("@angular/compiler-cli/src/ngtsc/translator/src/typescript_ast_factory");
    Object.defineProperty(exports, "attachComments", { enumerable: true, get: function () { return typescript_ast_factory_1.attachComments; } });
    Object.defineProperty(exports, "createTemplateMiddle", { enumerable: true, get: function () { return typescript_ast_factory_1.createTemplateMiddle; } });
    Object.defineProperty(exports, "createTemplateTail", { enumerable: true, get: function () { return typescript_ast_factory_1.createTemplateTail; } });
    Object.defineProperty(exports, "TypeScriptAstFactory", { enumerable: true, get: function () { return typescript_ast_factory_1.TypeScriptAstFactory; } });
    var typescript_translator_1 = require("@angular/compiler-cli/src/ngtsc/translator/src/typescript_translator");
    Object.defineProperty(exports, "translateExpression", { enumerable: true, get: function () { return typescript_translator_1.translateExpression; } });
    Object.defineProperty(exports, "translateStatement", { enumerable: true, get: function () { return typescript_translator_1.translateStatement; } });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL3RyYW5zbGF0b3IvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBSUgsa0ZBQXNDO0lBQTlCLGtHQUFBLE9BQU8sT0FBQTtJQUNmLGdHQUEyRDtJQUEzQywrR0FBQSxhQUFhLE9BQUE7SUFDN0Isd0ZBQXFHO0lBQTdGLHlIQUFBLDJCQUEyQixPQUFBO0lBQ25DLGtHQUFvRDtJQUE1QyxnSEFBQSxhQUFhLE9BQUE7SUFDckIsZ0hBQTRIO0lBQXBILHdIQUFBLGNBQWMsT0FBQTtJQUFFLDhIQUFBLG9CQUFvQixPQUFBO0lBQUUsNEhBQUEsa0JBQWtCLE9BQUE7SUFBRSw4SEFBQSxvQkFBb0IsT0FBQTtJQUN0Riw4R0FBb0Y7SUFBNUUsNEhBQUEsbUJBQW1CLE9BQUE7SUFBRSwySEFBQSxrQkFBa0IsT0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5leHBvcnQge0FzdEZhY3RvcnksIEJpbmFyeU9wZXJhdG9yLCBMZWFkaW5nQ29tbWVudCwgT2JqZWN0TGl0ZXJhbFByb3BlcnR5LCBTb3VyY2VNYXBMb2NhdGlvbiwgU291cmNlTWFwUmFuZ2UsIFRlbXBsYXRlRWxlbWVudCwgVGVtcGxhdGVMaXRlcmFsLCBVbmFyeU9wZXJhdG9yLCBWYXJpYWJsZURlY2xhcmF0aW9uVHlwZX0gZnJvbSAnLi9zcmMvYXBpL2FzdF9mYWN0b3J5JztcbmV4cG9ydCB7SW1wb3J0R2VuZXJhdG9yLCBOYW1lZEltcG9ydH0gZnJvbSAnLi9zcmMvYXBpL2ltcG9ydF9nZW5lcmF0b3InO1xuZXhwb3J0IHtDb250ZXh0fSBmcm9tICcuL3NyYy9jb250ZXh0JztcbmV4cG9ydCB7SW1wb3J0LCBJbXBvcnRNYW5hZ2VyfSBmcm9tICcuL3NyYy9pbXBvcnRfbWFuYWdlcic7XG5leHBvcnQge0V4cHJlc3Npb25UcmFuc2xhdG9yVmlzaXRvciwgUmVjb3JkV3JhcHBlZE5vZGVGbiwgVHJhbnNsYXRvck9wdGlvbnN9IGZyb20gJy4vc3JjL3RyYW5zbGF0b3InO1xuZXhwb3J0IHt0cmFuc2xhdGVUeXBlfSBmcm9tICcuL3NyYy90eXBlX3RyYW5zbGF0b3InO1xuZXhwb3J0IHthdHRhY2hDb21tZW50cywgY3JlYXRlVGVtcGxhdGVNaWRkbGUsIGNyZWF0ZVRlbXBsYXRlVGFpbCwgVHlwZVNjcmlwdEFzdEZhY3Rvcnl9IGZyb20gJy4vc3JjL3R5cGVzY3JpcHRfYXN0X2ZhY3RvcnknO1xuZXhwb3J0IHt0cmFuc2xhdGVFeHByZXNzaW9uLCB0cmFuc2xhdGVTdGF0ZW1lbnR9IGZyb20gJy4vc3JjL3R5cGVzY3JpcHRfdHJhbnNsYXRvcic7XG4iXX0=