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
        define("@angular/compiler-cli/src/ngtsc/reflection", ["require", "exports", "tslib", "@angular/compiler-cli/src/ngtsc/reflection/src/host", "@angular/compiler-cli/src/ngtsc/reflection/src/type_to_value", "@angular/compiler-cli/src/ngtsc/reflection/src/typescript", "@angular/compiler-cli/src/ngtsc/reflection/src/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isNamedVariableDeclaration = exports.isNamedFunctionDeclaration = exports.isNamedClassDeclaration = exports.reflectTypeEntityToDeclaration = exports.reflectObjectLiteral = exports.reflectNameOfDeclaration = exports.reflectIdentifierOfDeclaration = exports.filterToMembersWithDecorator = exports.TypeScriptReflectionHost = exports.typeNodeToValueExpr = void 0;
    var tslib_1 = require("tslib");
    tslib_1.__exportStar(require("@angular/compiler-cli/src/ngtsc/reflection/src/host"), exports);
    var type_to_value_1 = require("@angular/compiler-cli/src/ngtsc/reflection/src/type_to_value");
    Object.defineProperty(exports, "typeNodeToValueExpr", { enumerable: true, get: function () { return type_to_value_1.typeNodeToValueExpr; } });
    var typescript_1 = require("@angular/compiler-cli/src/ngtsc/reflection/src/typescript");
    Object.defineProperty(exports, "TypeScriptReflectionHost", { enumerable: true, get: function () { return typescript_1.TypeScriptReflectionHost; } });
    Object.defineProperty(exports, "filterToMembersWithDecorator", { enumerable: true, get: function () { return typescript_1.filterToMembersWithDecorator; } });
    Object.defineProperty(exports, "reflectIdentifierOfDeclaration", { enumerable: true, get: function () { return typescript_1.reflectIdentifierOfDeclaration; } });
    Object.defineProperty(exports, "reflectNameOfDeclaration", { enumerable: true, get: function () { return typescript_1.reflectNameOfDeclaration; } });
    Object.defineProperty(exports, "reflectObjectLiteral", { enumerable: true, get: function () { return typescript_1.reflectObjectLiteral; } });
    Object.defineProperty(exports, "reflectTypeEntityToDeclaration", { enumerable: true, get: function () { return typescript_1.reflectTypeEntityToDeclaration; } });
    var util_1 = require("@angular/compiler-cli/src/ngtsc/reflection/src/util");
    Object.defineProperty(exports, "isNamedClassDeclaration", { enumerable: true, get: function () { return util_1.isNamedClassDeclaration; } });
    Object.defineProperty(exports, "isNamedFunctionDeclaration", { enumerable: true, get: function () { return util_1.isNamedFunctionDeclaration; } });
    Object.defineProperty(exports, "isNamedVariableDeclaration", { enumerable: true, get: function () { return util_1.isNamedVariableDeclaration; } });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL3JlZmxlY3Rpb24vaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUVILDhGQUEyQjtJQUMzQiw4RkFBd0Q7SUFBaEQsb0hBQUEsbUJBQW1CLE9BQUE7SUFDM0Isd0ZBQXdNO0lBQWhNLHNIQUFBLHdCQUF3QixPQUFBO0lBQUUsMEhBQUEsNEJBQTRCLE9BQUE7SUFBRSw0SEFBQSw4QkFBOEIsT0FBQTtJQUFFLHNIQUFBLHdCQUF3QixPQUFBO0lBQUUsa0hBQUEsb0JBQW9CLE9BQUE7SUFBRSw0SEFBQSw4QkFBOEIsT0FBQTtJQUM5Syw0RUFBMkc7SUFBbkcsK0dBQUEsdUJBQXVCLE9BQUE7SUFBRSxrSEFBQSwwQkFBMEIsT0FBQTtJQUFFLGtIQUFBLDBCQUEwQixPQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmV4cG9ydCAqIGZyb20gJy4vc3JjL2hvc3QnO1xuZXhwb3J0IHt0eXBlTm9kZVRvVmFsdWVFeHByfSBmcm9tICcuL3NyYy90eXBlX3RvX3ZhbHVlJztcbmV4cG9ydCB7VHlwZVNjcmlwdFJlZmxlY3Rpb25Ib3N0LCBmaWx0ZXJUb01lbWJlcnNXaXRoRGVjb3JhdG9yLCByZWZsZWN0SWRlbnRpZmllck9mRGVjbGFyYXRpb24sIHJlZmxlY3ROYW1lT2ZEZWNsYXJhdGlvbiwgcmVmbGVjdE9iamVjdExpdGVyYWwsIHJlZmxlY3RUeXBlRW50aXR5VG9EZWNsYXJhdGlvbn0gZnJvbSAnLi9zcmMvdHlwZXNjcmlwdCc7XG5leHBvcnQge2lzTmFtZWRDbGFzc0RlY2xhcmF0aW9uLCBpc05hbWVkRnVuY3Rpb25EZWNsYXJhdGlvbiwgaXNOYW1lZFZhcmlhYmxlRGVjbGFyYXRpb259IGZyb20gJy4vc3JjL3V0aWwnO1xuIl19