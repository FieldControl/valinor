(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/linker/src/file_linker/emit_scopes/emit_scope", ["require", "exports", "@angular/compiler", "@angular/compiler-cli/linker/src/linker_import_generator"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EmitScope = void 0;
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var compiler_1 = require("@angular/compiler");
    var linker_import_generator_1 = require("@angular/compiler-cli/linker/src/linker_import_generator");
    /**
     * This class represents (from the point of view of the `FileLinker`) the scope in which
     * statements and expressions related to a linked partial declaration will be emitted.
     *
     * It holds a copy of a `ConstantPool` that is used to capture any constant statements that need to
     * be emitted in this context.
     *
     * This implementation will emit the definition and the constant statements separately.
     */
    var EmitScope = /** @class */ (function () {
        function EmitScope(ngImport, translator) {
            this.ngImport = ngImport;
            this.translator = translator;
            this.constantPool = new compiler_1.ConstantPool();
        }
        /**
         * Translate the given Output AST definition expression into a generic `TExpression`.
         *
         * Use a `LinkerImportGenerator` to handle any imports in the definition.
         */
        EmitScope.prototype.translateDefinition = function (definition) {
            return this.translator.translateExpression(definition, new linker_import_generator_1.LinkerImportGenerator(this.ngImport));
        };
        /**
         * Return any constant statements that are shared between all uses of this `EmitScope`.
         */
        EmitScope.prototype.getConstantStatements = function () {
            var _this = this;
            var importGenerator = new linker_import_generator_1.LinkerImportGenerator(this.ngImport);
            return this.constantPool.statements.map(function (statement) { return _this.translator.translateStatement(statement, importGenerator); });
        };
        return EmitScope;
    }());
    exports.EmitScope = EmitScope;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW1pdF9zY29wZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9saW5rZXIvc3JjL2ZpbGVfbGlua2VyL2VtaXRfc2NvcGVzL2VtaXRfc2NvcGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0lBQUE7Ozs7OztPQU1HO0lBQ0gsOENBQStDO0lBRS9DLG9HQUFvRTtJQUdwRTs7Ozs7Ozs7T0FRRztJQUNIO1FBR0UsbUJBQ3VCLFFBQXFCLEVBQ3JCLFVBQStDO1lBRC9DLGFBQVEsR0FBUixRQUFRLENBQWE7WUFDckIsZUFBVSxHQUFWLFVBQVUsQ0FBcUM7WUFKN0QsaUJBQVksR0FBRyxJQUFJLHVCQUFZLEVBQUUsQ0FBQztRQUk4QixDQUFDO1FBRTFFOzs7O1dBSUc7UUFDSCx1Q0FBbUIsR0FBbkIsVUFBb0IsVUFBd0I7WUFDMUMsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLG1CQUFtQixDQUN0QyxVQUFVLEVBQUUsSUFBSSwrQ0FBcUIsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUM1RCxDQUFDO1FBRUQ7O1dBRUc7UUFDSCx5Q0FBcUIsR0FBckI7WUFBQSxpQkFJQztZQUhDLElBQU0sZUFBZSxHQUFHLElBQUksK0NBQXFCLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ2pFLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUNuQyxVQUFBLFNBQVMsSUFBSSxPQUFBLEtBQUksQ0FBQyxVQUFVLENBQUMsa0JBQWtCLENBQUMsU0FBUyxFQUFFLGVBQWUsQ0FBQyxFQUE5RCxDQUE4RCxDQUFDLENBQUM7UUFDbkYsQ0FBQztRQUNILGdCQUFDO0lBQUQsQ0FBQyxBQXpCRCxJQXlCQztJQXpCWSw4QkFBUyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtDb25zdGFudFBvb2x9IGZyb20gJ0Bhbmd1bGFyL2NvbXBpbGVyJztcbmltcG9ydCAqIGFzIG8gZnJvbSAnQGFuZ3VsYXIvY29tcGlsZXIvc3JjL291dHB1dC9vdXRwdXRfYXN0JztcbmltcG9ydCB7TGlua2VySW1wb3J0R2VuZXJhdG9yfSBmcm9tICcuLi8uLi9saW5rZXJfaW1wb3J0X2dlbmVyYXRvcic7XG5pbXBvcnQge1RyYW5zbGF0b3J9IGZyb20gJy4uL3RyYW5zbGF0b3InO1xuXG4vKipcbiAqIFRoaXMgY2xhc3MgcmVwcmVzZW50cyAoZnJvbSB0aGUgcG9pbnQgb2YgdmlldyBvZiB0aGUgYEZpbGVMaW5rZXJgKSB0aGUgc2NvcGUgaW4gd2hpY2hcbiAqIHN0YXRlbWVudHMgYW5kIGV4cHJlc3Npb25zIHJlbGF0ZWQgdG8gYSBsaW5rZWQgcGFydGlhbCBkZWNsYXJhdGlvbiB3aWxsIGJlIGVtaXR0ZWQuXG4gKlxuICogSXQgaG9sZHMgYSBjb3B5IG9mIGEgYENvbnN0YW50UG9vbGAgdGhhdCBpcyB1c2VkIHRvIGNhcHR1cmUgYW55IGNvbnN0YW50IHN0YXRlbWVudHMgdGhhdCBuZWVkIHRvXG4gKiBiZSBlbWl0dGVkIGluIHRoaXMgY29udGV4dC5cbiAqXG4gKiBUaGlzIGltcGxlbWVudGF0aW9uIHdpbGwgZW1pdCB0aGUgZGVmaW5pdGlvbiBhbmQgdGhlIGNvbnN0YW50IHN0YXRlbWVudHMgc2VwYXJhdGVseS5cbiAqL1xuZXhwb3J0IGNsYXNzIEVtaXRTY29wZTxUU3RhdGVtZW50LCBURXhwcmVzc2lvbj4ge1xuICByZWFkb25seSBjb25zdGFudFBvb2wgPSBuZXcgQ29uc3RhbnRQb29sKCk7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgbmdJbXBvcnQ6IFRFeHByZXNzaW9uLFxuICAgICAgcHJvdGVjdGVkIHJlYWRvbmx5IHRyYW5zbGF0b3I6IFRyYW5zbGF0b3I8VFN0YXRlbWVudCwgVEV4cHJlc3Npb24+KSB7fVxuXG4gIC8qKlxuICAgKiBUcmFuc2xhdGUgdGhlIGdpdmVuIE91dHB1dCBBU1QgZGVmaW5pdGlvbiBleHByZXNzaW9uIGludG8gYSBnZW5lcmljIGBURXhwcmVzc2lvbmAuXG4gICAqXG4gICAqIFVzZSBhIGBMaW5rZXJJbXBvcnRHZW5lcmF0b3JgIHRvIGhhbmRsZSBhbnkgaW1wb3J0cyBpbiB0aGUgZGVmaW5pdGlvbi5cbiAgICovXG4gIHRyYW5zbGF0ZURlZmluaXRpb24oZGVmaW5pdGlvbjogby5FeHByZXNzaW9uKTogVEV4cHJlc3Npb24ge1xuICAgIHJldHVybiB0aGlzLnRyYW5zbGF0b3IudHJhbnNsYXRlRXhwcmVzc2lvbihcbiAgICAgICAgZGVmaW5pdGlvbiwgbmV3IExpbmtlckltcG9ydEdlbmVyYXRvcih0aGlzLm5nSW1wb3J0KSk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIGFueSBjb25zdGFudCBzdGF0ZW1lbnRzIHRoYXQgYXJlIHNoYXJlZCBiZXR3ZWVuIGFsbCB1c2VzIG9mIHRoaXMgYEVtaXRTY29wZWAuXG4gICAqL1xuICBnZXRDb25zdGFudFN0YXRlbWVudHMoKTogVFN0YXRlbWVudFtdIHtcbiAgICBjb25zdCBpbXBvcnRHZW5lcmF0b3IgPSBuZXcgTGlua2VySW1wb3J0R2VuZXJhdG9yKHRoaXMubmdJbXBvcnQpO1xuICAgIHJldHVybiB0aGlzLmNvbnN0YW50UG9vbC5zdGF0ZW1lbnRzLm1hcChcbiAgICAgICAgc3RhdGVtZW50ID0+IHRoaXMudHJhbnNsYXRvci50cmFuc2xhdGVTdGF0ZW1lbnQoc3RhdGVtZW50LCBpbXBvcnRHZW5lcmF0b3IpKTtcbiAgfVxufVxuIl19