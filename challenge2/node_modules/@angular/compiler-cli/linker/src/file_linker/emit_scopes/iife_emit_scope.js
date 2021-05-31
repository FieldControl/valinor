(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/linker/src/file_linker/emit_scopes/iife_emit_scope", ["require", "exports", "tslib", "@angular/compiler-cli/linker/src/file_linker/emit_scopes/emit_scope"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IifeEmitScope = void 0;
    var tslib_1 = require("tslib");
    var emit_scope_1 = require("@angular/compiler-cli/linker/src/file_linker/emit_scopes/emit_scope");
    /**
     * This class is a specialization of the `EmitScope` class that is designed for the situation where
     * there is no clear shared scope for constant statements. In this case they are bundled with the
     * translated definition inside an IIFE.
     */
    var IifeEmitScope = /** @class */ (function (_super) {
        tslib_1.__extends(IifeEmitScope, _super);
        function IifeEmitScope(ngImport, translator, factory) {
            var _this = _super.call(this, ngImport, translator) || this;
            _this.factory = factory;
            return _this;
        }
        /**
         * Translate the given Output AST definition expression into a generic `TExpression`.
         *
         * Wraps the output from `EmitScope.translateDefinition()` and `EmitScope.getConstantStatements()`
         * in an IIFE.
         */
        IifeEmitScope.prototype.translateDefinition = function (definition) {
            var constantStatements = _super.prototype.getConstantStatements.call(this);
            var returnStatement = this.factory.createReturnStatement(_super.prototype.translateDefinition.call(this, definition));
            var body = this.factory.createBlock(tslib_1.__spreadArray(tslib_1.__spreadArray([], tslib_1.__read(constantStatements)), [returnStatement]));
            var fn = this.factory.createFunctionExpression(/* name */ null, /* args */ [], body);
            return this.factory.createCallExpression(fn, /* args */ [], /* pure */ false);
        };
        /**
         * It is not valid to call this method, since there will be no shared constant statements - they
         * are already emitted in the IIFE alongside the translated definition.
         */
        IifeEmitScope.prototype.getConstantStatements = function () {
            throw new Error('BUG - IifeEmitScope should not expose any constant statements');
        };
        return IifeEmitScope;
    }(emit_scope_1.EmitScope));
    exports.IifeEmitScope = IifeEmitScope;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWlmZV9lbWl0X3Njb3BlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL2xpbmtlci9zcmMvZmlsZV9saW5rZXIvZW1pdF9zY29wZXMvaWlmZV9lbWl0X3Njb3BlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7SUFZQSxrR0FBdUM7SUFFdkM7Ozs7T0FJRztJQUNIO1FBQTRELHlDQUFrQztRQUM1Rix1QkFDSSxRQUFxQixFQUFFLFVBQStDLEVBQ3JELE9BQTRDO1lBRmpFLFlBR0Usa0JBQU0sUUFBUSxFQUFFLFVBQVUsQ0FBQyxTQUM1QjtZQUZvQixhQUFPLEdBQVAsT0FBTyxDQUFxQzs7UUFFakUsQ0FBQztRQUVEOzs7OztXQUtHO1FBQ0gsMkNBQW1CLEdBQW5CLFVBQW9CLFVBQXdCO1lBQzFDLElBQU0sa0JBQWtCLEdBQUcsaUJBQU0scUJBQXFCLFdBQUUsQ0FBQztZQUV6RCxJQUFNLGVBQWUsR0FDakIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxpQkFBTSxtQkFBbUIsWUFBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1lBQzlFLElBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxnRUFBSyxrQkFBa0IsS0FBRSxlQUFlLEdBQUUsQ0FBQztZQUNoRixJQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLHdCQUF3QixDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFBLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUN0RixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsb0JBQW9CLENBQUMsRUFBRSxFQUFFLFVBQVUsQ0FBQSxFQUFFLEVBQUUsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQy9FLENBQUM7UUFFRDs7O1dBR0c7UUFDSCw2Q0FBcUIsR0FBckI7WUFDRSxNQUFNLElBQUksS0FBSyxDQUFDLCtEQUErRCxDQUFDLENBQUM7UUFDbkYsQ0FBQztRQUNILG9CQUFDO0lBQUQsQ0FBQyxBQTlCRCxDQUE0RCxzQkFBUyxHQThCcEU7SUE5Qlksc0NBQWEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCAqIGFzIG8gZnJvbSAnQGFuZ3VsYXIvY29tcGlsZXIvc3JjL291dHB1dC9vdXRwdXRfYXN0JztcblxuaW1wb3J0IHtBc3RGYWN0b3J5fSBmcm9tICcuLi8uLi8uLi8uLi9zcmMvbmd0c2MvdHJhbnNsYXRvcic7XG5pbXBvcnQge1RyYW5zbGF0b3J9IGZyb20gJy4uL3RyYW5zbGF0b3InO1xuXG5pbXBvcnQge0VtaXRTY29wZX0gZnJvbSAnLi9lbWl0X3Njb3BlJztcblxuLyoqXG4gKiBUaGlzIGNsYXNzIGlzIGEgc3BlY2lhbGl6YXRpb24gb2YgdGhlIGBFbWl0U2NvcGVgIGNsYXNzIHRoYXQgaXMgZGVzaWduZWQgZm9yIHRoZSBzaXR1YXRpb24gd2hlcmVcbiAqIHRoZXJlIGlzIG5vIGNsZWFyIHNoYXJlZCBzY29wZSBmb3IgY29uc3RhbnQgc3RhdGVtZW50cy4gSW4gdGhpcyBjYXNlIHRoZXkgYXJlIGJ1bmRsZWQgd2l0aCB0aGVcbiAqIHRyYW5zbGF0ZWQgZGVmaW5pdGlvbiBpbnNpZGUgYW4gSUlGRS5cbiAqL1xuZXhwb3J0IGNsYXNzIElpZmVFbWl0U2NvcGU8VFN0YXRlbWVudCwgVEV4cHJlc3Npb24+IGV4dGVuZHMgRW1pdFNjb3BlPFRTdGF0ZW1lbnQsIFRFeHByZXNzaW9uPiB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgbmdJbXBvcnQ6IFRFeHByZXNzaW9uLCB0cmFuc2xhdG9yOiBUcmFuc2xhdG9yPFRTdGF0ZW1lbnQsIFRFeHByZXNzaW9uPixcbiAgICAgIHByaXZhdGUgcmVhZG9ubHkgZmFjdG9yeTogQXN0RmFjdG9yeTxUU3RhdGVtZW50LCBURXhwcmVzc2lvbj4pIHtcbiAgICBzdXBlcihuZ0ltcG9ydCwgdHJhbnNsYXRvcik7XG4gIH1cblxuICAvKipcbiAgICogVHJhbnNsYXRlIHRoZSBnaXZlbiBPdXRwdXQgQVNUIGRlZmluaXRpb24gZXhwcmVzc2lvbiBpbnRvIGEgZ2VuZXJpYyBgVEV4cHJlc3Npb25gLlxuICAgKlxuICAgKiBXcmFwcyB0aGUgb3V0cHV0IGZyb20gYEVtaXRTY29wZS50cmFuc2xhdGVEZWZpbml0aW9uKClgIGFuZCBgRW1pdFNjb3BlLmdldENvbnN0YW50U3RhdGVtZW50cygpYFxuICAgKiBpbiBhbiBJSUZFLlxuICAgKi9cbiAgdHJhbnNsYXRlRGVmaW5pdGlvbihkZWZpbml0aW9uOiBvLkV4cHJlc3Npb24pOiBURXhwcmVzc2lvbiB7XG4gICAgY29uc3QgY29uc3RhbnRTdGF0ZW1lbnRzID0gc3VwZXIuZ2V0Q29uc3RhbnRTdGF0ZW1lbnRzKCk7XG5cbiAgICBjb25zdCByZXR1cm5TdGF0ZW1lbnQgPVxuICAgICAgICB0aGlzLmZhY3RvcnkuY3JlYXRlUmV0dXJuU3RhdGVtZW50KHN1cGVyLnRyYW5zbGF0ZURlZmluaXRpb24oZGVmaW5pdGlvbikpO1xuICAgIGNvbnN0IGJvZHkgPSB0aGlzLmZhY3RvcnkuY3JlYXRlQmxvY2soWy4uLmNvbnN0YW50U3RhdGVtZW50cywgcmV0dXJuU3RhdGVtZW50XSk7XG4gICAgY29uc3QgZm4gPSB0aGlzLmZhY3RvcnkuY3JlYXRlRnVuY3Rpb25FeHByZXNzaW9uKC8qIG5hbWUgKi8gbnVsbCwgLyogYXJncyAqL1tdLCBib2R5KTtcbiAgICByZXR1cm4gdGhpcy5mYWN0b3J5LmNyZWF0ZUNhbGxFeHByZXNzaW9uKGZuLCAvKiBhcmdzICovW10sIC8qIHB1cmUgKi8gZmFsc2UpO1xuICB9XG5cbiAgLyoqXG4gICAqIEl0IGlzIG5vdCB2YWxpZCB0byBjYWxsIHRoaXMgbWV0aG9kLCBzaW5jZSB0aGVyZSB3aWxsIGJlIG5vIHNoYXJlZCBjb25zdGFudCBzdGF0ZW1lbnRzIC0gdGhleVxuICAgKiBhcmUgYWxyZWFkeSBlbWl0dGVkIGluIHRoZSBJSUZFIGFsb25nc2lkZSB0aGUgdHJhbnNsYXRlZCBkZWZpbml0aW9uLlxuICAgKi9cbiAgZ2V0Q29uc3RhbnRTdGF0ZW1lbnRzKCk6IFRTdGF0ZW1lbnRbXSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdCVUcgLSBJaWZlRW1pdFNjb3BlIHNob3VsZCBub3QgZXhwb3NlIGFueSBjb25zdGFudCBzdGF0ZW1lbnRzJyk7XG4gIH1cbn1cbiJdfQ==