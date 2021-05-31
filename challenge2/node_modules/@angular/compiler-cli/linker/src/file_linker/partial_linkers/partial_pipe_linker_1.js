(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/linker/src/file_linker/partial_linkers/partial_pipe_linker_1", ["require", "exports", "@angular/compiler", "@angular/compiler-cli/linker/src/fatal_linker_error", "@angular/compiler-cli/linker/src/file_linker/partial_linkers/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.toR3PipeMeta = exports.PartialPipeLinkerVersion1 = void 0;
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
     * A `PartialLinker` that is designed to process `ɵɵngDeclarePipe()` call expressions.
     */
    var PartialPipeLinkerVersion1 = /** @class */ (function () {
        function PartialPipeLinkerVersion1() {
        }
        PartialPipeLinkerVersion1.prototype.linkPartialDeclaration = function (constantPool, metaObj) {
            var meta = toR3PipeMeta(metaObj);
            var def = compiler_1.compilePipeFromMetadata(meta);
            return def.expression;
        };
        return PartialPipeLinkerVersion1;
    }());
    exports.PartialPipeLinkerVersion1 = PartialPipeLinkerVersion1;
    /**
     * Derives the `R3PipeMetadata` structure from the AST object.
     */
    function toR3PipeMeta(metaObj) {
        var typeExpr = metaObj.getValue('type');
        var typeName = typeExpr.getSymbolName();
        if (typeName === null) {
            throw new fatal_linker_error_1.FatalLinkerError(typeExpr.expression, 'Unsupported type, its name could not be determined');
        }
        var pure = metaObj.has('pure') ? metaObj.getBoolean('pure') : true;
        return {
            name: typeName,
            type: util_1.wrapReference(typeExpr.getOpaque()),
            internalType: metaObj.getOpaque('type'),
            typeArgumentCount: 0,
            deps: null,
            pipeName: metaObj.getString('name'),
            pure: pure,
        };
    }
    exports.toR3PipeMeta = toR3PipeMeta;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFydGlhbF9waXBlX2xpbmtlcl8xLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL2xpbmtlci9zcmMvZmlsZV9saW5rZXIvcGFydGlhbF9saW5rZXJzL3BhcnRpYWxfcGlwZV9saW5rZXJfMS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7SUFBQTs7Ozs7O09BTUc7SUFDSCw4Q0FBcUk7SUFJckksMEZBQTBEO0lBRzFELDBGQUFxQztJQUVyQzs7T0FFRztJQUNIO1FBQ0U7UUFBZSxDQUFDO1FBRWhCLDBEQUFzQixHQUF0QixVQUNJLFlBQTBCLEVBQzFCLE9BQXFEO1lBQ3ZELElBQU0sSUFBSSxHQUFHLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNuQyxJQUFNLEdBQUcsR0FBRyxrQ0FBdUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMxQyxPQUFPLEdBQUcsQ0FBQyxVQUFVLENBQUM7UUFDeEIsQ0FBQztRQUNILGdDQUFDO0lBQUQsQ0FBQyxBQVZELElBVUM7SUFWWSw4REFBeUI7SUFZdEM7O09BRUc7SUFDSCxTQUFnQixZQUFZLENBQWMsT0FBc0Q7UUFFOUYsSUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMxQyxJQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsYUFBYSxFQUFFLENBQUM7UUFDMUMsSUFBSSxRQUFRLEtBQUssSUFBSSxFQUFFO1lBQ3JCLE1BQU0sSUFBSSxxQ0FBZ0IsQ0FDdEIsUUFBUSxDQUFDLFVBQVUsRUFBRSxvREFBb0QsQ0FBQyxDQUFDO1NBQ2hGO1FBRUQsSUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBRXJFLE9BQU87WUFDTCxJQUFJLEVBQUUsUUFBUTtZQUNkLElBQUksRUFBRSxvQkFBYSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUN6QyxZQUFZLEVBQUUsT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUM7WUFDdkMsaUJBQWlCLEVBQUUsQ0FBQztZQUNwQixJQUFJLEVBQUUsSUFBSTtZQUNWLFFBQVEsRUFBRSxPQUFPLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQztZQUNuQyxJQUFJLE1BQUE7U0FDTCxDQUFDO0lBQ0osQ0FBQztJQXBCRCxvQ0FvQkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7Y29tcGlsZVBpcGVGcm9tTWV0YWRhdGEsIENvbnN0YW50UG9vbCwgUjNEZWNsYXJlUGlwZU1ldGFkYXRhLCBSM1BhcnRpYWxEZWNsYXJhdGlvbiwgUjNQaXBlTWV0YWRhdGF9IGZyb20gJ0Bhbmd1bGFyL2NvbXBpbGVyJztcbmltcG9ydCAqIGFzIG8gZnJvbSAnQGFuZ3VsYXIvY29tcGlsZXIvc3JjL291dHB1dC9vdXRwdXRfYXN0JztcblxuaW1wb3J0IHtBc3RPYmplY3R9IGZyb20gJy4uLy4uL2FzdC9hc3RfdmFsdWUnO1xuaW1wb3J0IHtGYXRhbExpbmtlckVycm9yfSBmcm9tICcuLi8uLi9mYXRhbF9saW5rZXJfZXJyb3InO1xuXG5pbXBvcnQge1BhcnRpYWxMaW5rZXJ9IGZyb20gJy4vcGFydGlhbF9saW5rZXInO1xuaW1wb3J0IHt3cmFwUmVmZXJlbmNlfSBmcm9tICcuL3V0aWwnO1xuXG4vKipcbiAqIEEgYFBhcnRpYWxMaW5rZXJgIHRoYXQgaXMgZGVzaWduZWQgdG8gcHJvY2VzcyBgybXJtW5nRGVjbGFyZVBpcGUoKWAgY2FsbCBleHByZXNzaW9ucy5cbiAqL1xuZXhwb3J0IGNsYXNzIFBhcnRpYWxQaXBlTGlua2VyVmVyc2lvbjE8VEV4cHJlc3Npb24+IGltcGxlbWVudHMgUGFydGlhbExpbmtlcjxURXhwcmVzc2lvbj4ge1xuICBjb25zdHJ1Y3RvcigpIHt9XG5cbiAgbGlua1BhcnRpYWxEZWNsYXJhdGlvbihcbiAgICAgIGNvbnN0YW50UG9vbDogQ29uc3RhbnRQb29sLFxuICAgICAgbWV0YU9iajogQXN0T2JqZWN0PFIzUGFydGlhbERlY2xhcmF0aW9uLCBURXhwcmVzc2lvbj4pOiBvLkV4cHJlc3Npb24ge1xuICAgIGNvbnN0IG1ldGEgPSB0b1IzUGlwZU1ldGEobWV0YU9iaik7XG4gICAgY29uc3QgZGVmID0gY29tcGlsZVBpcGVGcm9tTWV0YWRhdGEobWV0YSk7XG4gICAgcmV0dXJuIGRlZi5leHByZXNzaW9uO1xuICB9XG59XG5cbi8qKlxuICogRGVyaXZlcyB0aGUgYFIzUGlwZU1ldGFkYXRhYCBzdHJ1Y3R1cmUgZnJvbSB0aGUgQVNUIG9iamVjdC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRvUjNQaXBlTWV0YTxURXhwcmVzc2lvbj4obWV0YU9iajogQXN0T2JqZWN0PFIzRGVjbGFyZVBpcGVNZXRhZGF0YSwgVEV4cHJlc3Npb24+KTpcbiAgICBSM1BpcGVNZXRhZGF0YSB7XG4gIGNvbnN0IHR5cGVFeHByID0gbWV0YU9iai5nZXRWYWx1ZSgndHlwZScpO1xuICBjb25zdCB0eXBlTmFtZSA9IHR5cGVFeHByLmdldFN5bWJvbE5hbWUoKTtcbiAgaWYgKHR5cGVOYW1lID09PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IEZhdGFsTGlua2VyRXJyb3IoXG4gICAgICAgIHR5cGVFeHByLmV4cHJlc3Npb24sICdVbnN1cHBvcnRlZCB0eXBlLCBpdHMgbmFtZSBjb3VsZCBub3QgYmUgZGV0ZXJtaW5lZCcpO1xuICB9XG5cbiAgY29uc3QgcHVyZSA9IG1ldGFPYmouaGFzKCdwdXJlJykgPyBtZXRhT2JqLmdldEJvb2xlYW4oJ3B1cmUnKSA6IHRydWU7XG5cbiAgcmV0dXJuIHtcbiAgICBuYW1lOiB0eXBlTmFtZSxcbiAgICB0eXBlOiB3cmFwUmVmZXJlbmNlKHR5cGVFeHByLmdldE9wYXF1ZSgpKSxcbiAgICBpbnRlcm5hbFR5cGU6IG1ldGFPYmouZ2V0T3BhcXVlKCd0eXBlJyksXG4gICAgdHlwZUFyZ3VtZW50Q291bnQ6IDAsXG4gICAgZGVwczogbnVsbCxcbiAgICBwaXBlTmFtZTogbWV0YU9iai5nZXRTdHJpbmcoJ25hbWUnKSxcbiAgICBwdXJlLFxuICB9O1xufVxuIl19