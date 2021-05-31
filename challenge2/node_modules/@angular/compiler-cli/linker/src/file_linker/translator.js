(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/linker/src/file_linker/translator", ["require", "exports", "@angular/compiler-cli/src/ngtsc/translator"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Translator = void 0;
    var translator_1 = require("@angular/compiler-cli/src/ngtsc/translator");
    /**
     * Generic translator helper class, which exposes methods for translating expressions and
     * statements.
     */
    var Translator = /** @class */ (function () {
        function Translator(factory) {
            this.factory = factory;
        }
        /**
         * Translate the given output AST in the context of an expression.
         */
        Translator.prototype.translateExpression = function (expression, imports, options) {
            if (options === void 0) { options = {}; }
            return expression.visitExpression(new translator_1.ExpressionTranslatorVisitor(this.factory, imports, options), new translator_1.Context(false));
        };
        /**
         * Translate the given output AST in the context of a statement.
         */
        Translator.prototype.translateStatement = function (statement, imports, options) {
            if (options === void 0) { options = {}; }
            return statement.visitStatement(new translator_1.ExpressionTranslatorVisitor(this.factory, imports, options), new translator_1.Context(true));
        };
        return Translator;
    }());
    exports.Translator = Translator;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNsYXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9saW5rZXIvc3JjL2ZpbGVfbGlua2VyL3RyYW5zbGF0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0lBUUEseUVBQWdKO0lBRWhKOzs7T0FHRztJQUNIO1FBQ0Usb0JBQW9CLE9BQTRDO1lBQTVDLFlBQU8sR0FBUCxPQUFPLENBQXFDO1FBQUcsQ0FBQztRQUVwRTs7V0FFRztRQUNILHdDQUFtQixHQUFuQixVQUNJLFVBQXdCLEVBQUUsT0FBcUMsRUFDL0QsT0FBNEM7WUFBNUMsd0JBQUEsRUFBQSxZQUE0QztZQUM5QyxPQUFPLFVBQVUsQ0FBQyxlQUFlLENBQzdCLElBQUksd0NBQTJCLENBQTBCLElBQUksQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBQyxFQUN4RixJQUFJLG9CQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUMxQixDQUFDO1FBRUQ7O1dBRUc7UUFDSCx1Q0FBa0IsR0FBbEIsVUFDSSxTQUFzQixFQUFFLE9BQXFDLEVBQzdELE9BQTRDO1lBQTVDLHdCQUFBLEVBQUEsWUFBNEM7WUFDOUMsT0FBTyxTQUFTLENBQUMsY0FBYyxDQUMzQixJQUFJLHdDQUEyQixDQUEwQixJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsRUFDeEYsSUFBSSxvQkFBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDekIsQ0FBQztRQUNILGlCQUFDO0lBQUQsQ0FBQyxBQXhCRCxJQXdCQztJQXhCWSxnQ0FBVSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0ICogYXMgbyBmcm9tICdAYW5ndWxhci9jb21waWxlcic7XG5pbXBvcnQge0FzdEZhY3RvcnksIENvbnRleHQsIEV4cHJlc3Npb25UcmFuc2xhdG9yVmlzaXRvciwgSW1wb3J0R2VuZXJhdG9yLCBUcmFuc2xhdG9yT3B0aW9uc30gZnJvbSAnQGFuZ3VsYXIvY29tcGlsZXItY2xpL3NyYy9uZ3RzYy90cmFuc2xhdG9yJztcblxuLyoqXG4gKiBHZW5lcmljIHRyYW5zbGF0b3IgaGVscGVyIGNsYXNzLCB3aGljaCBleHBvc2VzIG1ldGhvZHMgZm9yIHRyYW5zbGF0aW5nIGV4cHJlc3Npb25zIGFuZFxuICogc3RhdGVtZW50cy5cbiAqL1xuZXhwb3J0IGNsYXNzIFRyYW5zbGF0b3I8VFN0YXRlbWVudCwgVEV4cHJlc3Npb24+IHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBmYWN0b3J5OiBBc3RGYWN0b3J5PFRTdGF0ZW1lbnQsIFRFeHByZXNzaW9uPikge31cblxuICAvKipcbiAgICogVHJhbnNsYXRlIHRoZSBnaXZlbiBvdXRwdXQgQVNUIGluIHRoZSBjb250ZXh0IG9mIGFuIGV4cHJlc3Npb24uXG4gICAqL1xuICB0cmFuc2xhdGVFeHByZXNzaW9uKFxuICAgICAgZXhwcmVzc2lvbjogby5FeHByZXNzaW9uLCBpbXBvcnRzOiBJbXBvcnRHZW5lcmF0b3I8VEV4cHJlc3Npb24+LFxuICAgICAgb3B0aW9uczogVHJhbnNsYXRvck9wdGlvbnM8VEV4cHJlc3Npb24+ID0ge30pOiBURXhwcmVzc2lvbiB7XG4gICAgcmV0dXJuIGV4cHJlc3Npb24udmlzaXRFeHByZXNzaW9uKFxuICAgICAgICBuZXcgRXhwcmVzc2lvblRyYW5zbGF0b3JWaXNpdG9yPFRTdGF0ZW1lbnQsIFRFeHByZXNzaW9uPih0aGlzLmZhY3RvcnksIGltcG9ydHMsIG9wdGlvbnMpLFxuICAgICAgICBuZXcgQ29udGV4dChmYWxzZSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRyYW5zbGF0ZSB0aGUgZ2l2ZW4gb3V0cHV0IEFTVCBpbiB0aGUgY29udGV4dCBvZiBhIHN0YXRlbWVudC5cbiAgICovXG4gIHRyYW5zbGF0ZVN0YXRlbWVudChcbiAgICAgIHN0YXRlbWVudDogby5TdGF0ZW1lbnQsIGltcG9ydHM6IEltcG9ydEdlbmVyYXRvcjxURXhwcmVzc2lvbj4sXG4gICAgICBvcHRpb25zOiBUcmFuc2xhdG9yT3B0aW9uczxURXhwcmVzc2lvbj4gPSB7fSk6IFRTdGF0ZW1lbnQge1xuICAgIHJldHVybiBzdGF0ZW1lbnQudmlzaXRTdGF0ZW1lbnQoXG4gICAgICAgIG5ldyBFeHByZXNzaW9uVHJhbnNsYXRvclZpc2l0b3I8VFN0YXRlbWVudCwgVEV4cHJlc3Npb24+KHRoaXMuZmFjdG9yeSwgaW1wb3J0cywgb3B0aW9ucyksXG4gICAgICAgIG5ldyBDb250ZXh0KHRydWUpKTtcbiAgfVxufVxuIl19