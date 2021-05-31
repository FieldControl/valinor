(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/linker/src/file_linker/partial_linkers/partial_injector_linker_1", ["require", "exports", "@angular/compiler", "@angular/compiler-cli/linker/src/fatal_linker_error", "@angular/compiler-cli/linker/src/file_linker/partial_linkers/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.toR3InjectorMeta = exports.PartialInjectorLinkerVersion1 = void 0;
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var compiler_1 = require("@angular/compiler");
    var fatal_linker_error_1 = require("@angular/compiler-cli/linker/src/fatal_linker_error");
    var util_1 = require("@angular/compiler-cli/linker/src/file_linker/partial_linkers/util");
    /**
     * A `PartialLinker` that is designed to process `ɵɵngDeclareInjector()` call expressions.
     */
    var PartialInjectorLinkerVersion1 = /** @class */ (function () {
        function PartialInjectorLinkerVersion1() {
        }
        PartialInjectorLinkerVersion1.prototype.linkPartialDeclaration = function (constantPool, metaObj) {
            var meta = toR3InjectorMeta(metaObj);
            var def = compiler_1.compileInjector(meta);
            return def.expression;
        };
        return PartialInjectorLinkerVersion1;
    }());
    exports.PartialInjectorLinkerVersion1 = PartialInjectorLinkerVersion1;
    /**
     * Derives the `R3InjectorMetadata` structure from the AST object.
     */
    function toR3InjectorMeta(metaObj) {
        var typeExpr = metaObj.getValue('type');
        var typeName = typeExpr.getSymbolName();
        if (typeName === null) {
            throw new fatal_linker_error_1.FatalLinkerError(typeExpr.expression, 'Unsupported type, its name could not be determined');
        }
        return {
            name: typeName,
            type: util_1.wrapReference(typeExpr.getOpaque()),
            internalType: metaObj.getOpaque('type'),
            providers: metaObj.has('providers') ? metaObj.getOpaque('providers') : null,
            imports: metaObj.has('imports') ? metaObj.getArray('imports').map(function (i) { return i.getOpaque(); }) : [],
        };
    }
    exports.toR3InjectorMeta = toR3InjectorMeta;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFydGlhbF9pbmplY3Rvcl9saW5rZXJfMS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9saW5rZXIvc3JjL2ZpbGVfbGlua2VyL3BhcnRpYWxfbGlua2Vycy9wYXJ0aWFsX2luamVjdG9yX2xpbmtlcl8xLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztJQUFBOzs7Ozs7T0FNRztJQUNILDhDQUFxSTtJQUlySSwwRkFBMEQ7SUFHMUQsMEZBQXFDO0lBRXJDOztPQUVHO0lBQ0g7UUFBQTtRQVFBLENBQUM7UUFQQyw4REFBc0IsR0FBdEIsVUFDSSxZQUEwQixFQUMxQixPQUFxRDtZQUN2RCxJQUFNLElBQUksR0FBRyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN2QyxJQUFNLEdBQUcsR0FBRywwQkFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2xDLE9BQU8sR0FBRyxDQUFDLFVBQVUsQ0FBQztRQUN4QixDQUFDO1FBQ0gsb0NBQUM7SUFBRCxDQUFDLEFBUkQsSUFRQztJQVJZLHNFQUE2QjtJQVUxQzs7T0FFRztJQUNILFNBQWdCLGdCQUFnQixDQUM1QixPQUEwRDtRQUM1RCxJQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzFDLElBQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUMxQyxJQUFJLFFBQVEsS0FBSyxJQUFJLEVBQUU7WUFDckIsTUFBTSxJQUFJLHFDQUFnQixDQUN0QixRQUFRLENBQUMsVUFBVSxFQUFFLG9EQUFvRCxDQUFDLENBQUM7U0FDaEY7UUFFRCxPQUFPO1lBQ0wsSUFBSSxFQUFFLFFBQVE7WUFDZCxJQUFJLEVBQUUsb0JBQWEsQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDekMsWUFBWSxFQUFFLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDO1lBQ3ZDLFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJO1lBQzNFLE9BQU8sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLENBQUMsQ0FBQyxTQUFTLEVBQUUsRUFBYixDQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtTQUMzRixDQUFDO0lBQ0osQ0FBQztJQWhCRCw0Q0FnQkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7Y29tcGlsZUluamVjdG9yLCBDb25zdGFudFBvb2wsIFIzRGVjbGFyZUluamVjdG9yTWV0YWRhdGEsIFIzSW5qZWN0b3JNZXRhZGF0YSwgUjNQYXJ0aWFsRGVjbGFyYXRpb259IGZyb20gJ0Bhbmd1bGFyL2NvbXBpbGVyJztcbmltcG9ydCAqIGFzIG8gZnJvbSAnQGFuZ3VsYXIvY29tcGlsZXIvc3JjL291dHB1dC9vdXRwdXRfYXN0JztcblxuaW1wb3J0IHtBc3RPYmplY3R9IGZyb20gJy4uLy4uL2FzdC9hc3RfdmFsdWUnO1xuaW1wb3J0IHtGYXRhbExpbmtlckVycm9yfSBmcm9tICcuLi8uLi9mYXRhbF9saW5rZXJfZXJyb3InO1xuXG5pbXBvcnQge1BhcnRpYWxMaW5rZXJ9IGZyb20gJy4vcGFydGlhbF9saW5rZXInO1xuaW1wb3J0IHt3cmFwUmVmZXJlbmNlfSBmcm9tICcuL3V0aWwnO1xuXG4vKipcbiAqIEEgYFBhcnRpYWxMaW5rZXJgIHRoYXQgaXMgZGVzaWduZWQgdG8gcHJvY2VzcyBgybXJtW5nRGVjbGFyZUluamVjdG9yKClgIGNhbGwgZXhwcmVzc2lvbnMuXG4gKi9cbmV4cG9ydCBjbGFzcyBQYXJ0aWFsSW5qZWN0b3JMaW5rZXJWZXJzaW9uMTxURXhwcmVzc2lvbj4gaW1wbGVtZW50cyBQYXJ0aWFsTGlua2VyPFRFeHByZXNzaW9uPiB7XG4gIGxpbmtQYXJ0aWFsRGVjbGFyYXRpb24oXG4gICAgICBjb25zdGFudFBvb2w6IENvbnN0YW50UG9vbCxcbiAgICAgIG1ldGFPYmo6IEFzdE9iamVjdDxSM1BhcnRpYWxEZWNsYXJhdGlvbiwgVEV4cHJlc3Npb24+KTogby5FeHByZXNzaW9uIHtcbiAgICBjb25zdCBtZXRhID0gdG9SM0luamVjdG9yTWV0YShtZXRhT2JqKTtcbiAgICBjb25zdCBkZWYgPSBjb21waWxlSW5qZWN0b3IobWV0YSk7XG4gICAgcmV0dXJuIGRlZi5leHByZXNzaW9uO1xuICB9XG59XG5cbi8qKlxuICogRGVyaXZlcyB0aGUgYFIzSW5qZWN0b3JNZXRhZGF0YWAgc3RydWN0dXJlIGZyb20gdGhlIEFTVCBvYmplY3QuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0b1IzSW5qZWN0b3JNZXRhPFRFeHByZXNzaW9uPihcbiAgICBtZXRhT2JqOiBBc3RPYmplY3Q8UjNEZWNsYXJlSW5qZWN0b3JNZXRhZGF0YSwgVEV4cHJlc3Npb24+KTogUjNJbmplY3Rvck1ldGFkYXRhIHtcbiAgY29uc3QgdHlwZUV4cHIgPSBtZXRhT2JqLmdldFZhbHVlKCd0eXBlJyk7XG4gIGNvbnN0IHR5cGVOYW1lID0gdHlwZUV4cHIuZ2V0U3ltYm9sTmFtZSgpO1xuICBpZiAodHlwZU5hbWUgPT09IG51bGwpIHtcbiAgICB0aHJvdyBuZXcgRmF0YWxMaW5rZXJFcnJvcihcbiAgICAgICAgdHlwZUV4cHIuZXhwcmVzc2lvbiwgJ1Vuc3VwcG9ydGVkIHR5cGUsIGl0cyBuYW1lIGNvdWxkIG5vdCBiZSBkZXRlcm1pbmVkJyk7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIG5hbWU6IHR5cGVOYW1lLFxuICAgIHR5cGU6IHdyYXBSZWZlcmVuY2UodHlwZUV4cHIuZ2V0T3BhcXVlKCkpLFxuICAgIGludGVybmFsVHlwZTogbWV0YU9iai5nZXRPcGFxdWUoJ3R5cGUnKSxcbiAgICBwcm92aWRlcnM6IG1ldGFPYmouaGFzKCdwcm92aWRlcnMnKSA/IG1ldGFPYmouZ2V0T3BhcXVlKCdwcm92aWRlcnMnKSA6IG51bGwsXG4gICAgaW1wb3J0czogbWV0YU9iai5oYXMoJ2ltcG9ydHMnKSA/IG1ldGFPYmouZ2V0QXJyYXkoJ2ltcG9ydHMnKS5tYXAoaSA9PiBpLmdldE9wYXF1ZSgpKSA6IFtdLFxuICB9O1xufVxuIl19