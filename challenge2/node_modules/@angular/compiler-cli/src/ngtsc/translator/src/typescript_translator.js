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
        define("@angular/compiler-cli/src/ngtsc/translator/src/typescript_translator", ["require", "exports", "@angular/compiler-cli/src/ngtsc/translator/src/context", "@angular/compiler-cli/src/ngtsc/translator/src/translator", "@angular/compiler-cli/src/ngtsc/translator/src/typescript_ast_factory"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.translateStatement = exports.translateExpression = void 0;
    var context_1 = require("@angular/compiler-cli/src/ngtsc/translator/src/context");
    var translator_1 = require("@angular/compiler-cli/src/ngtsc/translator/src/translator");
    var typescript_ast_factory_1 = require("@angular/compiler-cli/src/ngtsc/translator/src/typescript_ast_factory");
    function translateExpression(expression, imports, options) {
        if (options === void 0) { options = {}; }
        return expression.visitExpression(new translator_1.ExpressionTranslatorVisitor(new typescript_ast_factory_1.TypeScriptAstFactory(options.annotateForClosureCompiler === true), imports, options), new context_1.Context(false));
    }
    exports.translateExpression = translateExpression;
    function translateStatement(statement, imports, options) {
        if (options === void 0) { options = {}; }
        return statement.visitStatement(new translator_1.ExpressionTranslatorVisitor(new typescript_ast_factory_1.TypeScriptAstFactory(options.annotateForClosureCompiler === true), imports, options), new context_1.Context(true));
    }
    exports.translateStatement = translateStatement;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZXNjcmlwdF90cmFuc2xhdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL3NyYy9uZ3RzYy90cmFuc2xhdG9yL3NyYy90eXBlc2NyaXB0X3RyYW5zbGF0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBTUgsa0ZBQWtDO0lBQ2xDLHdGQUE0RTtJQUM1RSxnSEFBOEQ7SUFFOUQsU0FBZ0IsbUJBQW1CLENBQy9CLFVBQXdCLEVBQUUsT0FBdUMsRUFDakUsT0FBOEM7UUFBOUMsd0JBQUEsRUFBQSxZQUE4QztRQUNoRCxPQUFPLFVBQVUsQ0FBQyxlQUFlLENBQzdCLElBQUksd0NBQTJCLENBQzNCLElBQUksNkNBQW9CLENBQUMsT0FBTyxDQUFDLDBCQUEwQixLQUFLLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsRUFDNUYsSUFBSSxpQkFBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDMUIsQ0FBQztJQVBELGtEQU9DO0lBRUQsU0FBZ0Isa0JBQWtCLENBQzlCLFNBQXNCLEVBQUUsT0FBdUMsRUFDL0QsT0FBOEM7UUFBOUMsd0JBQUEsRUFBQSxZQUE4QztRQUNoRCxPQUFPLFNBQVMsQ0FBQyxjQUFjLENBQzNCLElBQUksd0NBQTJCLENBQzNCLElBQUksNkNBQW9CLENBQUMsT0FBTyxDQUFDLDBCQUEwQixLQUFLLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsRUFDNUYsSUFBSSxpQkFBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDekIsQ0FBQztJQVBELGdEQU9DIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIG8gZnJvbSAnQGFuZ3VsYXIvY29tcGlsZXInO1xuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbmltcG9ydCB7SW1wb3J0R2VuZXJhdG9yfSBmcm9tICcuL2FwaS9pbXBvcnRfZ2VuZXJhdG9yJztcbmltcG9ydCB7Q29udGV4dH0gZnJvbSAnLi9jb250ZXh0JztcbmltcG9ydCB7RXhwcmVzc2lvblRyYW5zbGF0b3JWaXNpdG9yLCBUcmFuc2xhdG9yT3B0aW9uc30gZnJvbSAnLi90cmFuc2xhdG9yJztcbmltcG9ydCB7VHlwZVNjcmlwdEFzdEZhY3Rvcnl9IGZyb20gJy4vdHlwZXNjcmlwdF9hc3RfZmFjdG9yeSc7XG5cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2xhdGVFeHByZXNzaW9uKFxuICAgIGV4cHJlc3Npb246IG8uRXhwcmVzc2lvbiwgaW1wb3J0czogSW1wb3J0R2VuZXJhdG9yPHRzLkV4cHJlc3Npb24+LFxuICAgIG9wdGlvbnM6IFRyYW5zbGF0b3JPcHRpb25zPHRzLkV4cHJlc3Npb24+ID0ge30pOiB0cy5FeHByZXNzaW9uIHtcbiAgcmV0dXJuIGV4cHJlc3Npb24udmlzaXRFeHByZXNzaW9uKFxuICAgICAgbmV3IEV4cHJlc3Npb25UcmFuc2xhdG9yVmlzaXRvcjx0cy5TdGF0ZW1lbnQsIHRzLkV4cHJlc3Npb24+KFxuICAgICAgICAgIG5ldyBUeXBlU2NyaXB0QXN0RmFjdG9yeShvcHRpb25zLmFubm90YXRlRm9yQ2xvc3VyZUNvbXBpbGVyID09PSB0cnVlKSwgaW1wb3J0cywgb3B0aW9ucyksXG4gICAgICBuZXcgQ29udGV4dChmYWxzZSkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNsYXRlU3RhdGVtZW50KFxuICAgIHN0YXRlbWVudDogby5TdGF0ZW1lbnQsIGltcG9ydHM6IEltcG9ydEdlbmVyYXRvcjx0cy5FeHByZXNzaW9uPixcbiAgICBvcHRpb25zOiBUcmFuc2xhdG9yT3B0aW9uczx0cy5FeHByZXNzaW9uPiA9IHt9KTogdHMuU3RhdGVtZW50IHtcbiAgcmV0dXJuIHN0YXRlbWVudC52aXNpdFN0YXRlbWVudChcbiAgICAgIG5ldyBFeHByZXNzaW9uVHJhbnNsYXRvclZpc2l0b3I8dHMuU3RhdGVtZW50LCB0cy5FeHByZXNzaW9uPihcbiAgICAgICAgICBuZXcgVHlwZVNjcmlwdEFzdEZhY3Rvcnkob3B0aW9ucy5hbm5vdGF0ZUZvckNsb3N1cmVDb21waWxlciA9PT0gdHJ1ZSksIGltcG9ydHMsIG9wdGlvbnMpLFxuICAgICAgbmV3IENvbnRleHQodHJ1ZSkpO1xufVxuIl19