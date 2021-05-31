(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/linker/src/file_linker/partial_linkers/partial_factory_linker_1", ["require", "exports", "@angular/compiler", "@angular/compiler-cli/linker/src/fatal_linker_error", "@angular/compiler-cli/linker/src/file_linker/partial_linkers/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.toR3FactoryMeta = exports.PartialFactoryLinkerVersion1 = void 0;
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
     * A `PartialLinker` that is designed to process `ɵɵngDeclareFactory()` call expressions.
     */
    var PartialFactoryLinkerVersion1 = /** @class */ (function () {
        function PartialFactoryLinkerVersion1() {
        }
        PartialFactoryLinkerVersion1.prototype.linkPartialDeclaration = function (constantPool, metaObj) {
            var meta = toR3FactoryMeta(metaObj);
            var def = compiler_1.compileFactoryFunction(meta);
            return def.expression;
        };
        return PartialFactoryLinkerVersion1;
    }());
    exports.PartialFactoryLinkerVersion1 = PartialFactoryLinkerVersion1;
    /**
     * Derives the `R3FactoryMetadata` structure from the AST object.
     */
    function toR3FactoryMeta(metaObj) {
        var typeExpr = metaObj.getValue('type');
        var typeName = typeExpr.getSymbolName();
        if (typeName === null) {
            throw new fatal_linker_error_1.FatalLinkerError(typeExpr.expression, 'Unsupported type, its name could not be determined');
        }
        return {
            name: typeName,
            type: util_1.wrapReference(typeExpr.getOpaque()),
            internalType: metaObj.getOpaque('type'),
            typeArgumentCount: 0,
            target: util_1.parseEnum(metaObj.getValue('target'), compiler_1.FactoryTarget),
            deps: getDependencies(metaObj, 'deps'),
        };
    }
    exports.toR3FactoryMeta = toR3FactoryMeta;
    function getDependencies(metaObj, propName) {
        if (!metaObj.has(propName)) {
            return null;
        }
        var deps = metaObj.getValue(propName);
        if (deps.isArray()) {
            return deps.getArray().map(function (dep) { return util_1.getDependency(dep.getObject()); });
        }
        if (deps.isString()) {
            return 'invalid';
        }
        return null;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFydGlhbF9mYWN0b3J5X2xpbmtlcl8xLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL2xpbmtlci9zcmMvZmlsZV9saW5rZXIvcGFydGlhbF9saW5rZXJzL3BhcnRpYWxfZmFjdG9yeV9saW5rZXJfMS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7SUFBQTs7Ozs7O09BTUc7SUFDSCw4Q0FBK0s7SUFJL0ssMEZBQTBEO0lBRzFELDBGQUErRDtJQUUvRDs7T0FFRztJQUNIO1FBQUE7UUFRQSxDQUFDO1FBUEMsNkRBQXNCLEdBQXRCLFVBQ0ksWUFBMEIsRUFDMUIsT0FBcUQ7WUFDdkQsSUFBTSxJQUFJLEdBQUcsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3RDLElBQU0sR0FBRyxHQUFHLGlDQUFzQixDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3pDLE9BQU8sR0FBRyxDQUFDLFVBQVUsQ0FBQztRQUN4QixDQUFDO1FBQ0gsbUNBQUM7SUFBRCxDQUFDLEFBUkQsSUFRQztJQVJZLG9FQUE0QjtJQVV6Qzs7T0FFRztJQUNILFNBQWdCLGVBQWUsQ0FDM0IsT0FBeUQ7UUFDM0QsSUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMxQyxJQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsYUFBYSxFQUFFLENBQUM7UUFDMUMsSUFBSSxRQUFRLEtBQUssSUFBSSxFQUFFO1lBQ3JCLE1BQU0sSUFBSSxxQ0FBZ0IsQ0FDdEIsUUFBUSxDQUFDLFVBQVUsRUFBRSxvREFBb0QsQ0FBQyxDQUFDO1NBQ2hGO1FBRUQsT0FBTztZQUNMLElBQUksRUFBRSxRQUFRO1lBQ2QsSUFBSSxFQUFFLG9CQUFhLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ3pDLFlBQVksRUFBRSxPQUFPLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQztZQUN2QyxpQkFBaUIsRUFBRSxDQUFDO1lBQ3BCLE1BQU0sRUFBRSxnQkFBUyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEVBQUUsd0JBQWEsQ0FBQztZQUM1RCxJQUFJLEVBQUUsZUFBZSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUM7U0FDdkMsQ0FBQztJQUNKLENBQUM7SUFqQkQsMENBaUJDO0lBRUQsU0FBUyxlQUFlLENBQ3BCLE9BQXlELEVBQ3pELFFBQXdDO1FBQzFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFO1lBQzFCLE9BQU8sSUFBSSxDQUFDO1NBQ2I7UUFDRCxJQUFNLElBQUksR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3hDLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFO1lBQ2xCLE9BQU8sSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLEdBQUcsQ0FBQyxVQUFBLEdBQUcsSUFBSSxPQUFBLG9CQUFhLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxDQUFDLEVBQTlCLENBQThCLENBQUMsQ0FBQztTQUNuRTtRQUNELElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRSxFQUFFO1lBQ25CLE9BQU8sU0FBUyxDQUFDO1NBQ2xCO1FBQ0QsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge2NvbXBpbGVGYWN0b3J5RnVuY3Rpb24sIENvbnN0YW50UG9vbCwgRmFjdG9yeVRhcmdldCwgUjNEZWNsYXJlRmFjdG9yeU1ldGFkYXRhLCBSM0RlcGVuZGVuY3lNZXRhZGF0YSwgUjNGYWN0b3J5TWV0YWRhdGEsIFIzUGFydGlhbERlY2xhcmF0aW9ufSBmcm9tICdAYW5ndWxhci9jb21waWxlcic7XG5pbXBvcnQgKiBhcyBvIGZyb20gJ0Bhbmd1bGFyL2NvbXBpbGVyL3NyYy9vdXRwdXQvb3V0cHV0X2FzdCc7XG5cbmltcG9ydCB7QXN0T2JqZWN0fSBmcm9tICcuLi8uLi9hc3QvYXN0X3ZhbHVlJztcbmltcG9ydCB7RmF0YWxMaW5rZXJFcnJvcn0gZnJvbSAnLi4vLi4vZmF0YWxfbGlua2VyX2Vycm9yJztcblxuaW1wb3J0IHtQYXJ0aWFsTGlua2VyfSBmcm9tICcuL3BhcnRpYWxfbGlua2VyJztcbmltcG9ydCB7Z2V0RGVwZW5kZW5jeSwgcGFyc2VFbnVtLCB3cmFwUmVmZXJlbmNlfSBmcm9tICcuL3V0aWwnO1xuXG4vKipcbiAqIEEgYFBhcnRpYWxMaW5rZXJgIHRoYXQgaXMgZGVzaWduZWQgdG8gcHJvY2VzcyBgybXJtW5nRGVjbGFyZUZhY3RvcnkoKWAgY2FsbCBleHByZXNzaW9ucy5cbiAqL1xuZXhwb3J0IGNsYXNzIFBhcnRpYWxGYWN0b3J5TGlua2VyVmVyc2lvbjE8VEV4cHJlc3Npb24+IGltcGxlbWVudHMgUGFydGlhbExpbmtlcjxURXhwcmVzc2lvbj4ge1xuICBsaW5rUGFydGlhbERlY2xhcmF0aW9uKFxuICAgICAgY29uc3RhbnRQb29sOiBDb25zdGFudFBvb2wsXG4gICAgICBtZXRhT2JqOiBBc3RPYmplY3Q8UjNQYXJ0aWFsRGVjbGFyYXRpb24sIFRFeHByZXNzaW9uPik6IG8uRXhwcmVzc2lvbiB7XG4gICAgY29uc3QgbWV0YSA9IHRvUjNGYWN0b3J5TWV0YShtZXRhT2JqKTtcbiAgICBjb25zdCBkZWYgPSBjb21waWxlRmFjdG9yeUZ1bmN0aW9uKG1ldGEpO1xuICAgIHJldHVybiBkZWYuZXhwcmVzc2lvbjtcbiAgfVxufVxuXG4vKipcbiAqIERlcml2ZXMgdGhlIGBSM0ZhY3RvcnlNZXRhZGF0YWAgc3RydWN0dXJlIGZyb20gdGhlIEFTVCBvYmplY3QuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0b1IzRmFjdG9yeU1ldGE8VEV4cHJlc3Npb24+KFxuICAgIG1ldGFPYmo6IEFzdE9iamVjdDxSM0RlY2xhcmVGYWN0b3J5TWV0YWRhdGEsIFRFeHByZXNzaW9uPik6IFIzRmFjdG9yeU1ldGFkYXRhIHtcbiAgY29uc3QgdHlwZUV4cHIgPSBtZXRhT2JqLmdldFZhbHVlKCd0eXBlJyk7XG4gIGNvbnN0IHR5cGVOYW1lID0gdHlwZUV4cHIuZ2V0U3ltYm9sTmFtZSgpO1xuICBpZiAodHlwZU5hbWUgPT09IG51bGwpIHtcbiAgICB0aHJvdyBuZXcgRmF0YWxMaW5rZXJFcnJvcihcbiAgICAgICAgdHlwZUV4cHIuZXhwcmVzc2lvbiwgJ1Vuc3VwcG9ydGVkIHR5cGUsIGl0cyBuYW1lIGNvdWxkIG5vdCBiZSBkZXRlcm1pbmVkJyk7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIG5hbWU6IHR5cGVOYW1lLFxuICAgIHR5cGU6IHdyYXBSZWZlcmVuY2UodHlwZUV4cHIuZ2V0T3BhcXVlKCkpLFxuICAgIGludGVybmFsVHlwZTogbWV0YU9iai5nZXRPcGFxdWUoJ3R5cGUnKSxcbiAgICB0eXBlQXJndW1lbnRDb3VudDogMCxcbiAgICB0YXJnZXQ6IHBhcnNlRW51bShtZXRhT2JqLmdldFZhbHVlKCd0YXJnZXQnKSwgRmFjdG9yeVRhcmdldCksXG4gICAgZGVwczogZ2V0RGVwZW5kZW5jaWVzKG1ldGFPYmosICdkZXBzJyksXG4gIH07XG59XG5cbmZ1bmN0aW9uIGdldERlcGVuZGVuY2llczxURXhwcmVzc2lvbj4oXG4gICAgbWV0YU9iajogQXN0T2JqZWN0PFIzRGVjbGFyZUZhY3RvcnlNZXRhZGF0YSwgVEV4cHJlc3Npb24+LFxuICAgIHByb3BOYW1lOiBrZXlvZiBSM0RlY2xhcmVGYWN0b3J5TWV0YWRhdGEpOiBSM0RlcGVuZGVuY3lNZXRhZGF0YVtdfG51bGx8J2ludmFsaWQnIHtcbiAgaWYgKCFtZXRhT2JqLmhhcyhwcm9wTmFtZSkpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBjb25zdCBkZXBzID0gbWV0YU9iai5nZXRWYWx1ZShwcm9wTmFtZSk7XG4gIGlmIChkZXBzLmlzQXJyYXkoKSkge1xuICAgIHJldHVybiBkZXBzLmdldEFycmF5KCkubWFwKGRlcCA9PiBnZXREZXBlbmRlbmN5KGRlcC5nZXRPYmplY3QoKSkpO1xuICB9XG4gIGlmIChkZXBzLmlzU3RyaW5nKCkpIHtcbiAgICByZXR1cm4gJ2ludmFsaWQnO1xuICB9XG4gIHJldHVybiBudWxsO1xufVxuIl19