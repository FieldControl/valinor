(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/linker/src/file_linker/partial_linkers/partial_injectable_linker_1", ["require", "exports", "@angular/compiler", "@angular/compiler/src/output/output_ast", "@angular/compiler-cli/linker/src/fatal_linker_error", "@angular/compiler-cli/linker/src/file_linker/partial_linkers/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.toR3InjectableMeta = exports.PartialInjectableLinkerVersion1 = void 0;
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var compiler_1 = require("@angular/compiler");
    var o = require("@angular/compiler/src/output/output_ast");
    var fatal_linker_error_1 = require("@angular/compiler-cli/linker/src/fatal_linker_error");
    var util_1 = require("@angular/compiler-cli/linker/src/file_linker/partial_linkers/util");
    /**
     * A `PartialLinker` that is designed to process `ɵɵngDeclareInjectable()` call expressions.
     */
    var PartialInjectableLinkerVersion1 = /** @class */ (function () {
        function PartialInjectableLinkerVersion1() {
        }
        PartialInjectableLinkerVersion1.prototype.linkPartialDeclaration = function (constantPool, metaObj) {
            var meta = toR3InjectableMeta(metaObj);
            var def = compiler_1.compileInjectable(meta, /* resolveForwardRefs */ false);
            return def.expression;
        };
        return PartialInjectableLinkerVersion1;
    }());
    exports.PartialInjectableLinkerVersion1 = PartialInjectableLinkerVersion1;
    /**
     * Derives the `R3InjectableMetadata` structure from the AST object.
     */
    function toR3InjectableMeta(metaObj) {
        var typeExpr = metaObj.getValue('type');
        var typeName = typeExpr.getSymbolName();
        if (typeName === null) {
            throw new fatal_linker_error_1.FatalLinkerError(typeExpr.expression, 'Unsupported type, its name could not be determined');
        }
        var meta = {
            name: typeName,
            type: util_1.wrapReference(typeExpr.getOpaque()),
            internalType: typeExpr.getOpaque(),
            typeArgumentCount: 0,
            providedIn: metaObj.has('providedIn') ? util_1.extractForwardRef(metaObj.getValue('providedIn')) :
                compiler_1.createR3ProviderExpression(o.literal(null), false),
        };
        if (metaObj.has('useClass')) {
            meta.useClass = util_1.extractForwardRef(metaObj.getValue('useClass'));
        }
        if (metaObj.has('useFactory')) {
            meta.useFactory = metaObj.getOpaque('useFactory');
        }
        if (metaObj.has('useExisting')) {
            meta.useExisting = util_1.extractForwardRef(metaObj.getValue('useExisting'));
        }
        if (metaObj.has('useValue')) {
            meta.useValue = util_1.extractForwardRef(metaObj.getValue('useValue'));
        }
        if (metaObj.has('deps')) {
            meta.deps = metaObj.getArray('deps').map(function (dep) { return util_1.getDependency(dep.getObject()); });
        }
        return meta;
    }
    exports.toR3InjectableMeta = toR3InjectableMeta;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFydGlhbF9pbmplY3RhYmxlX2xpbmtlcl8xLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL2xpbmtlci9zcmMvZmlsZV9saW5rZXIvcGFydGlhbF9saW5rZXJzL3BhcnRpYWxfaW5qZWN0YWJsZV9saW5rZXJfMS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7SUFBQTs7Ozs7O09BTUc7SUFDSCw4Q0FBdUs7SUFDdkssMkRBQTZEO0lBRzdELDBGQUEwRDtJQUcxRCwwRkFBdUU7SUFFdkU7O09BRUc7SUFDSDtRQUFBO1FBUUEsQ0FBQztRQVBDLGdFQUFzQixHQUF0QixVQUNJLFlBQTBCLEVBQzFCLE9BQXFEO1lBQ3ZELElBQU0sSUFBSSxHQUFHLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3pDLElBQU0sR0FBRyxHQUFHLDRCQUFpQixDQUFDLElBQUksRUFBRSx3QkFBd0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNwRSxPQUFPLEdBQUcsQ0FBQyxVQUFVLENBQUM7UUFDeEIsQ0FBQztRQUNILHNDQUFDO0lBQUQsQ0FBQyxBQVJELElBUUM7SUFSWSwwRUFBK0I7SUFVNUM7O09BRUc7SUFDSCxTQUFnQixrQkFBa0IsQ0FDOUIsT0FBNEQ7UUFDOUQsSUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMxQyxJQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsYUFBYSxFQUFFLENBQUM7UUFDMUMsSUFBSSxRQUFRLEtBQUssSUFBSSxFQUFFO1lBQ3JCLE1BQU0sSUFBSSxxQ0FBZ0IsQ0FDdEIsUUFBUSxDQUFDLFVBQVUsRUFBRSxvREFBb0QsQ0FBQyxDQUFDO1NBQ2hGO1FBRUQsSUFBTSxJQUFJLEdBQXlCO1lBQ2pDLElBQUksRUFBRSxRQUFRO1lBQ2QsSUFBSSxFQUFFLG9CQUFhLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ3pDLFlBQVksRUFBRSxRQUFRLENBQUMsU0FBUyxFQUFFO1lBQ2xDLGlCQUFpQixFQUFFLENBQUM7WUFDcEIsVUFBVSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLHdCQUFpQixDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNuRCxxQ0FBMEIsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssQ0FBQztTQUMzRixDQUFDO1FBRUYsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxFQUFFO1lBQzNCLElBQUksQ0FBQyxRQUFRLEdBQUcsd0JBQWlCLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1NBQ2pFO1FBQ0QsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxFQUFFO1lBQzdCLElBQUksQ0FBQyxVQUFVLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQztTQUNuRDtRQUNELElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsRUFBRTtZQUM5QixJQUFJLENBQUMsV0FBVyxHQUFHLHdCQUFpQixDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztTQUN2RTtRQUNELElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsRUFBRTtZQUMzQixJQUFJLENBQUMsUUFBUSxHQUFHLHdCQUFpQixDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztTQUNqRTtRQUVELElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUN2QixJQUFJLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQUEsR0FBRyxJQUFJLE9BQUEsb0JBQWEsQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLENBQUMsRUFBOUIsQ0FBOEIsQ0FBQyxDQUFDO1NBQ2pGO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBcENELGdEQW9DQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtjb21waWxlSW5qZWN0YWJsZSwgQ29uc3RhbnRQb29sLCBjcmVhdGVSM1Byb3ZpZGVyRXhwcmVzc2lvbiwgUjNEZWNsYXJlSW5qZWN0YWJsZU1ldGFkYXRhLCBSM0luamVjdGFibGVNZXRhZGF0YSwgUjNQYXJ0aWFsRGVjbGFyYXRpb259IGZyb20gJ0Bhbmd1bGFyL2NvbXBpbGVyJztcbmltcG9ydCAqIGFzIG8gZnJvbSAnQGFuZ3VsYXIvY29tcGlsZXIvc3JjL291dHB1dC9vdXRwdXRfYXN0JztcblxuaW1wb3J0IHtBc3RPYmplY3R9IGZyb20gJy4uLy4uL2FzdC9hc3RfdmFsdWUnO1xuaW1wb3J0IHtGYXRhbExpbmtlckVycm9yfSBmcm9tICcuLi8uLi9mYXRhbF9saW5rZXJfZXJyb3InO1xuXG5pbXBvcnQge1BhcnRpYWxMaW5rZXJ9IGZyb20gJy4vcGFydGlhbF9saW5rZXInO1xuaW1wb3J0IHtleHRyYWN0Rm9yd2FyZFJlZiwgZ2V0RGVwZW5kZW5jeSwgd3JhcFJlZmVyZW5jZX0gZnJvbSAnLi91dGlsJztcblxuLyoqXG4gKiBBIGBQYXJ0aWFsTGlua2VyYCB0aGF0IGlzIGRlc2lnbmVkIHRvIHByb2Nlc3MgYMm1ybVuZ0RlY2xhcmVJbmplY3RhYmxlKClgIGNhbGwgZXhwcmVzc2lvbnMuXG4gKi9cbmV4cG9ydCBjbGFzcyBQYXJ0aWFsSW5qZWN0YWJsZUxpbmtlclZlcnNpb24xPFRFeHByZXNzaW9uPiBpbXBsZW1lbnRzIFBhcnRpYWxMaW5rZXI8VEV4cHJlc3Npb24+IHtcbiAgbGlua1BhcnRpYWxEZWNsYXJhdGlvbihcbiAgICAgIGNvbnN0YW50UG9vbDogQ29uc3RhbnRQb29sLFxuICAgICAgbWV0YU9iajogQXN0T2JqZWN0PFIzUGFydGlhbERlY2xhcmF0aW9uLCBURXhwcmVzc2lvbj4pOiBvLkV4cHJlc3Npb24ge1xuICAgIGNvbnN0IG1ldGEgPSB0b1IzSW5qZWN0YWJsZU1ldGEobWV0YU9iaik7XG4gICAgY29uc3QgZGVmID0gY29tcGlsZUluamVjdGFibGUobWV0YSwgLyogcmVzb2x2ZUZvcndhcmRSZWZzICovIGZhbHNlKTtcbiAgICByZXR1cm4gZGVmLmV4cHJlc3Npb247XG4gIH1cbn1cblxuLyoqXG4gKiBEZXJpdmVzIHRoZSBgUjNJbmplY3RhYmxlTWV0YWRhdGFgIHN0cnVjdHVyZSBmcm9tIHRoZSBBU1Qgb2JqZWN0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gdG9SM0luamVjdGFibGVNZXRhPFRFeHByZXNzaW9uPihcbiAgICBtZXRhT2JqOiBBc3RPYmplY3Q8UjNEZWNsYXJlSW5qZWN0YWJsZU1ldGFkYXRhLCBURXhwcmVzc2lvbj4pOiBSM0luamVjdGFibGVNZXRhZGF0YSB7XG4gIGNvbnN0IHR5cGVFeHByID0gbWV0YU9iai5nZXRWYWx1ZSgndHlwZScpO1xuICBjb25zdCB0eXBlTmFtZSA9IHR5cGVFeHByLmdldFN5bWJvbE5hbWUoKTtcbiAgaWYgKHR5cGVOYW1lID09PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IEZhdGFsTGlua2VyRXJyb3IoXG4gICAgICAgIHR5cGVFeHByLmV4cHJlc3Npb24sICdVbnN1cHBvcnRlZCB0eXBlLCBpdHMgbmFtZSBjb3VsZCBub3QgYmUgZGV0ZXJtaW5lZCcpO1xuICB9XG5cbiAgY29uc3QgbWV0YTogUjNJbmplY3RhYmxlTWV0YWRhdGEgPSB7XG4gICAgbmFtZTogdHlwZU5hbWUsXG4gICAgdHlwZTogd3JhcFJlZmVyZW5jZSh0eXBlRXhwci5nZXRPcGFxdWUoKSksXG4gICAgaW50ZXJuYWxUeXBlOiB0eXBlRXhwci5nZXRPcGFxdWUoKSxcbiAgICB0eXBlQXJndW1lbnRDb3VudDogMCxcbiAgICBwcm92aWRlZEluOiBtZXRhT2JqLmhhcygncHJvdmlkZWRJbicpID8gZXh0cmFjdEZvcndhcmRSZWYobWV0YU9iai5nZXRWYWx1ZSgncHJvdmlkZWRJbicpKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZVIzUHJvdmlkZXJFeHByZXNzaW9uKG8ubGl0ZXJhbChudWxsKSwgZmFsc2UpLFxuICB9O1xuXG4gIGlmIChtZXRhT2JqLmhhcygndXNlQ2xhc3MnKSkge1xuICAgIG1ldGEudXNlQ2xhc3MgPSBleHRyYWN0Rm9yd2FyZFJlZihtZXRhT2JqLmdldFZhbHVlKCd1c2VDbGFzcycpKTtcbiAgfVxuICBpZiAobWV0YU9iai5oYXMoJ3VzZUZhY3RvcnknKSkge1xuICAgIG1ldGEudXNlRmFjdG9yeSA9IG1ldGFPYmouZ2V0T3BhcXVlKCd1c2VGYWN0b3J5Jyk7XG4gIH1cbiAgaWYgKG1ldGFPYmouaGFzKCd1c2VFeGlzdGluZycpKSB7XG4gICAgbWV0YS51c2VFeGlzdGluZyA9IGV4dHJhY3RGb3J3YXJkUmVmKG1ldGFPYmouZ2V0VmFsdWUoJ3VzZUV4aXN0aW5nJykpO1xuICB9XG4gIGlmIChtZXRhT2JqLmhhcygndXNlVmFsdWUnKSkge1xuICAgIG1ldGEudXNlVmFsdWUgPSBleHRyYWN0Rm9yd2FyZFJlZihtZXRhT2JqLmdldFZhbHVlKCd1c2VWYWx1ZScpKTtcbiAgfVxuXG4gIGlmIChtZXRhT2JqLmhhcygnZGVwcycpKSB7XG4gICAgbWV0YS5kZXBzID0gbWV0YU9iai5nZXRBcnJheSgnZGVwcycpLm1hcChkZXAgPT4gZ2V0RGVwZW5kZW5jeShkZXAuZ2V0T2JqZWN0KCkpKTtcbiAgfVxuXG4gIHJldHVybiBtZXRhO1xufVxuIl19