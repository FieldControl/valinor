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
        define("@angular/compiler-cli/src/ngtsc/reflection/src/util", ["require", "exports", "typescript"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isNamedVariableDeclaration = exports.isNamedFunctionDeclaration = exports.isNamedClassDeclaration = void 0;
    var ts = require("typescript");
    function isNamedClassDeclaration(node) {
        return ts.isClassDeclaration(node) && isIdentifier(node.name);
    }
    exports.isNamedClassDeclaration = isNamedClassDeclaration;
    function isNamedFunctionDeclaration(node) {
        return ts.isFunctionDeclaration(node) && isIdentifier(node.name);
    }
    exports.isNamedFunctionDeclaration = isNamedFunctionDeclaration;
    function isNamedVariableDeclaration(node) {
        return ts.isVariableDeclaration(node) && isIdentifier(node.name);
    }
    exports.isNamedVariableDeclaration = isNamedVariableDeclaration;
    function isIdentifier(node) {
        return node !== undefined && ts.isIdentifier(node);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvbmd0c2MvcmVmbGVjdGlvbi9zcmMvdXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFFSCwrQkFBaUM7SUFHakMsU0FBZ0IsdUJBQXVCLENBQUMsSUFBYTtRQUVuRCxPQUFPLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2hFLENBQUM7SUFIRCwwREFHQztJQUVELFNBQWdCLDBCQUEwQixDQUFDLElBQWE7UUFFdEQsT0FBTyxFQUFFLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLElBQUksWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNuRSxDQUFDO0lBSEQsZ0VBR0M7SUFFRCxTQUFnQiwwQkFBMEIsQ0FBQyxJQUFhO1FBRXRELE9BQU8sRUFBRSxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxJQUFJLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDbkUsQ0FBQztJQUhELGdFQUdDO0lBRUQsU0FBUyxZQUFZLENBQUMsSUFBdUI7UUFDM0MsT0FBTyxJQUFJLEtBQUssU0FBUyxJQUFJLEVBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDckQsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcbmltcG9ydCB7Q2xhc3NEZWNsYXJhdGlvbn0gZnJvbSAnLi9ob3N0JztcblxuZXhwb3J0IGZ1bmN0aW9uIGlzTmFtZWRDbGFzc0RlY2xhcmF0aW9uKG5vZGU6IHRzLk5vZGUpOlxuICAgIG5vZGUgaXMgQ2xhc3NEZWNsYXJhdGlvbjx0cy5DbGFzc0RlY2xhcmF0aW9uPiB7XG4gIHJldHVybiB0cy5pc0NsYXNzRGVjbGFyYXRpb24obm9kZSkgJiYgaXNJZGVudGlmaWVyKG5vZGUubmFtZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc05hbWVkRnVuY3Rpb25EZWNsYXJhdGlvbihub2RlOiB0cy5Ob2RlKTpcbiAgICBub2RlIGlzIENsYXNzRGVjbGFyYXRpb248dHMuRnVuY3Rpb25EZWNsYXJhdGlvbj4ge1xuICByZXR1cm4gdHMuaXNGdW5jdGlvbkRlY2xhcmF0aW9uKG5vZGUpICYmIGlzSWRlbnRpZmllcihub2RlLm5hbWUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNOYW1lZFZhcmlhYmxlRGVjbGFyYXRpb24obm9kZTogdHMuTm9kZSk6XG4gICAgbm9kZSBpcyBDbGFzc0RlY2xhcmF0aW9uPHRzLlZhcmlhYmxlRGVjbGFyYXRpb24+IHtcbiAgcmV0dXJuIHRzLmlzVmFyaWFibGVEZWNsYXJhdGlvbihub2RlKSAmJiBpc0lkZW50aWZpZXIobm9kZS5uYW1lKTtcbn1cblxuZnVuY3Rpb24gaXNJZGVudGlmaWVyKG5vZGU6IHRzLk5vZGV8dW5kZWZpbmVkKTogbm9kZSBpcyB0cy5JZGVudGlmaWVyIHtcbiAgcmV0dXJuIG5vZGUgIT09IHVuZGVmaW5lZCAmJiB0cy5pc0lkZW50aWZpZXIobm9kZSk7XG59XG4iXX0=