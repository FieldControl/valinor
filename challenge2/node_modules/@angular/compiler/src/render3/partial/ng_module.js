(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler/src/render3/partial/ng_module", ["require", "exports", "@angular/compiler/src/output/output_ast", "@angular/compiler/src/render3/r3_identifiers", "@angular/compiler/src/render3/r3_module_compiler", "@angular/compiler/src/render3/util", "@angular/compiler/src/render3/view/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.compileDeclareNgModuleFromMetadata = void 0;
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var o = require("@angular/compiler/src/output/output_ast");
    var r3_identifiers_1 = require("@angular/compiler/src/render3/r3_identifiers");
    var r3_module_compiler_1 = require("@angular/compiler/src/render3/r3_module_compiler");
    var util_1 = require("@angular/compiler/src/render3/util");
    var util_2 = require("@angular/compiler/src/render3/view/util");
    /**
     * Every time we make a breaking change to the declaration interface or partial-linker behavior, we
     * must update this constant to prevent old partial-linkers from incorrectly processing the
     * declaration.
     *
     * Do not include any prerelease in these versions as they are ignored.
     */
    var MINIMUM_PARTIAL_LINKER_VERSION = '12.0.0';
    function compileDeclareNgModuleFromMetadata(meta) {
        var definitionMap = createNgModuleDefinitionMap(meta);
        var expression = o.importExpr(r3_identifiers_1.Identifiers.declareNgModule).callFn([definitionMap.toLiteralMap()]);
        var type = r3_module_compiler_1.createNgModuleType(meta);
        return { expression: expression, type: type, statements: [] };
    }
    exports.compileDeclareNgModuleFromMetadata = compileDeclareNgModuleFromMetadata;
    /**
     * Gathers the declaration fields for an NgModule into a `DefinitionMap`.
     */
    function createNgModuleDefinitionMap(meta) {
        var definitionMap = new util_2.DefinitionMap();
        definitionMap.set('minVersion', o.literal(MINIMUM_PARTIAL_LINKER_VERSION));
        definitionMap.set('version', o.literal('12.0.2'));
        definitionMap.set('ngImport', o.importExpr(r3_identifiers_1.Identifiers.core));
        definitionMap.set('type', meta.internalType);
        // We only generate the keys in the metadata if the arrays contain values.
        // We must wrap the arrays inside a function if any of the values are a forward reference to a
        // not-yet-declared class. This is to support JIT execution of the `ɵɵngDeclareNgModule()` call.
        // In the linker these wrappers are stripped and then reapplied for the `ɵɵdefineNgModule()` call.
        if (meta.bootstrap.length > 0) {
            definitionMap.set('bootstrap', util_1.refsToArray(meta.bootstrap, meta.containsForwardDecls));
        }
        if (meta.declarations.length > 0) {
            definitionMap.set('declarations', util_1.refsToArray(meta.declarations, meta.containsForwardDecls));
        }
        if (meta.imports.length > 0) {
            definitionMap.set('imports', util_1.refsToArray(meta.imports, meta.containsForwardDecls));
        }
        if (meta.exports.length > 0) {
            definitionMap.set('exports', util_1.refsToArray(meta.exports, meta.containsForwardDecls));
        }
        if (meta.schemas !== null && meta.schemas.length > 0) {
            definitionMap.set('schemas', o.literalArr(meta.schemas.map(function (ref) { return ref.value; })));
        }
        if (meta.id !== null) {
            definitionMap.set('id', meta.id);
        }
        return definitionMap;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfbW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL3JlbmRlcjMvcGFydGlhbC9uZ19tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0lBQUE7Ozs7OztPQU1HO0lBQ0gsMkRBQTZDO0lBQzdDLCtFQUFvRDtJQUNwRCx1RkFBNkU7SUFDN0UsMkRBQTBEO0lBQzFELGdFQUEyQztJQUkzQzs7Ozs7O09BTUc7SUFDSCxJQUFNLDhCQUE4QixHQUFHLFFBQVEsQ0FBQztJQUVoRCxTQUFnQixrQ0FBa0MsQ0FBQyxJQUF3QjtRQUN6RSxJQUFNLGFBQWEsR0FBRywyQkFBMkIsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUV4RCxJQUFNLFVBQVUsR0FBRyxDQUFDLENBQUMsVUFBVSxDQUFDLDRCQUFFLENBQUMsZUFBZSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsYUFBYSxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUMsQ0FBQztRQUMzRixJQUFNLElBQUksR0FBRyx1Q0FBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUV0QyxPQUFPLEVBQUMsVUFBVSxZQUFBLEVBQUUsSUFBSSxNQUFBLEVBQUUsVUFBVSxFQUFFLEVBQUUsRUFBQyxDQUFDO0lBQzVDLENBQUM7SUFQRCxnRkFPQztJQUVEOztPQUVHO0lBQ0gsU0FBUywyQkFBMkIsQ0FBQyxJQUF3QjtRQUUzRCxJQUFNLGFBQWEsR0FBRyxJQUFJLG9CQUFhLEVBQTZCLENBQUM7UUFFckUsYUFBYSxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDLENBQUM7UUFDM0UsYUFBYSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUM7UUFDN0QsYUFBYSxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyw0QkFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDckQsYUFBYSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBRTdDLDBFQUEwRTtRQUUxRSw4RkFBOEY7UUFDOUYsZ0dBQWdHO1FBQ2hHLGtHQUFrRztRQUVsRyxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUM3QixhQUFhLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxrQkFBVyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQztTQUN4RjtRQUVELElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQ2hDLGFBQWEsQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLGtCQUFXLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDO1NBQzlGO1FBRUQsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDM0IsYUFBYSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsa0JBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUM7U0FDcEY7UUFFRCxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUMzQixhQUFhLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxrQkFBVyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQztTQUNwRjtRQUVELElBQUksSUFBSSxDQUFDLE9BQU8sS0FBSyxJQUFJLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQ3BELGFBQWEsQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBQSxHQUFHLElBQUksT0FBQSxHQUFHLENBQUMsS0FBSyxFQUFULENBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNoRjtRQUVELElBQUksSUFBSSxDQUFDLEVBQUUsS0FBSyxJQUFJLEVBQUU7WUFDcEIsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQ2xDO1FBRUQsT0FBTyxhQUFhLENBQUM7SUFDdkIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0ICogYXMgbyBmcm9tICcuLi8uLi9vdXRwdXQvb3V0cHV0X2FzdCc7XG5pbXBvcnQge0lkZW50aWZpZXJzIGFzIFIzfSBmcm9tICcuLi9yM19pZGVudGlmaWVycyc7XG5pbXBvcnQge2NyZWF0ZU5nTW9kdWxlVHlwZSwgUjNOZ01vZHVsZU1ldGFkYXRhfSBmcm9tICcuLi9yM19tb2R1bGVfY29tcGlsZXInO1xuaW1wb3J0IHtSM0NvbXBpbGVkRXhwcmVzc2lvbiwgcmVmc1RvQXJyYXl9IGZyb20gJy4uL3V0aWwnO1xuaW1wb3J0IHtEZWZpbml0aW9uTWFwfSBmcm9tICcuLi92aWV3L3V0aWwnO1xuXG5pbXBvcnQge1IzRGVjbGFyZU5nTW9kdWxlTWV0YWRhdGF9IGZyb20gJy4vYXBpJztcblxuLyoqXG4gKiBFdmVyeSB0aW1lIHdlIG1ha2UgYSBicmVha2luZyBjaGFuZ2UgdG8gdGhlIGRlY2xhcmF0aW9uIGludGVyZmFjZSBvciBwYXJ0aWFsLWxpbmtlciBiZWhhdmlvciwgd2VcbiAqIG11c3QgdXBkYXRlIHRoaXMgY29uc3RhbnQgdG8gcHJldmVudCBvbGQgcGFydGlhbC1saW5rZXJzIGZyb20gaW5jb3JyZWN0bHkgcHJvY2Vzc2luZyB0aGVcbiAqIGRlY2xhcmF0aW9uLlxuICpcbiAqIERvIG5vdCBpbmNsdWRlIGFueSBwcmVyZWxlYXNlIGluIHRoZXNlIHZlcnNpb25zIGFzIHRoZXkgYXJlIGlnbm9yZWQuXG4gKi9cbmNvbnN0IE1JTklNVU1fUEFSVElBTF9MSU5LRVJfVkVSU0lPTiA9ICcxMi4wLjAnO1xuXG5leHBvcnQgZnVuY3Rpb24gY29tcGlsZURlY2xhcmVOZ01vZHVsZUZyb21NZXRhZGF0YShtZXRhOiBSM05nTW9kdWxlTWV0YWRhdGEpOiBSM0NvbXBpbGVkRXhwcmVzc2lvbiB7XG4gIGNvbnN0IGRlZmluaXRpb25NYXAgPSBjcmVhdGVOZ01vZHVsZURlZmluaXRpb25NYXAobWV0YSk7XG5cbiAgY29uc3QgZXhwcmVzc2lvbiA9IG8uaW1wb3J0RXhwcihSMy5kZWNsYXJlTmdNb2R1bGUpLmNhbGxGbihbZGVmaW5pdGlvbk1hcC50b0xpdGVyYWxNYXAoKV0pO1xuICBjb25zdCB0eXBlID0gY3JlYXRlTmdNb2R1bGVUeXBlKG1ldGEpO1xuXG4gIHJldHVybiB7ZXhwcmVzc2lvbiwgdHlwZSwgc3RhdGVtZW50czogW119O1xufVxuXG4vKipcbiAqIEdhdGhlcnMgdGhlIGRlY2xhcmF0aW9uIGZpZWxkcyBmb3IgYW4gTmdNb2R1bGUgaW50byBhIGBEZWZpbml0aW9uTWFwYC5cbiAqL1xuZnVuY3Rpb24gY3JlYXRlTmdNb2R1bGVEZWZpbml0aW9uTWFwKG1ldGE6IFIzTmdNb2R1bGVNZXRhZGF0YSk6XG4gICAgRGVmaW5pdGlvbk1hcDxSM0RlY2xhcmVOZ01vZHVsZU1ldGFkYXRhPiB7XG4gIGNvbnN0IGRlZmluaXRpb25NYXAgPSBuZXcgRGVmaW5pdGlvbk1hcDxSM0RlY2xhcmVOZ01vZHVsZU1ldGFkYXRhPigpO1xuXG4gIGRlZmluaXRpb25NYXAuc2V0KCdtaW5WZXJzaW9uJywgby5saXRlcmFsKE1JTklNVU1fUEFSVElBTF9MSU5LRVJfVkVSU0lPTikpO1xuICBkZWZpbml0aW9uTWFwLnNldCgndmVyc2lvbicsIG8ubGl0ZXJhbCgnMC4wLjAtUExBQ0VIT0xERVInKSk7XG4gIGRlZmluaXRpb25NYXAuc2V0KCduZ0ltcG9ydCcsIG8uaW1wb3J0RXhwcihSMy5jb3JlKSk7XG4gIGRlZmluaXRpb25NYXAuc2V0KCd0eXBlJywgbWV0YS5pbnRlcm5hbFR5cGUpO1xuXG4gIC8vIFdlIG9ubHkgZ2VuZXJhdGUgdGhlIGtleXMgaW4gdGhlIG1ldGFkYXRhIGlmIHRoZSBhcnJheXMgY29udGFpbiB2YWx1ZXMuXG5cbiAgLy8gV2UgbXVzdCB3cmFwIHRoZSBhcnJheXMgaW5zaWRlIGEgZnVuY3Rpb24gaWYgYW55IG9mIHRoZSB2YWx1ZXMgYXJlIGEgZm9yd2FyZCByZWZlcmVuY2UgdG8gYVxuICAvLyBub3QteWV0LWRlY2xhcmVkIGNsYXNzLiBUaGlzIGlzIHRvIHN1cHBvcnQgSklUIGV4ZWN1dGlvbiBvZiB0aGUgYMm1ybVuZ0RlY2xhcmVOZ01vZHVsZSgpYCBjYWxsLlxuICAvLyBJbiB0aGUgbGlua2VyIHRoZXNlIHdyYXBwZXJzIGFyZSBzdHJpcHBlZCBhbmQgdGhlbiByZWFwcGxpZWQgZm9yIHRoZSBgybXJtWRlZmluZU5nTW9kdWxlKClgIGNhbGwuXG5cbiAgaWYgKG1ldGEuYm9vdHN0cmFwLmxlbmd0aCA+IDApIHtcbiAgICBkZWZpbml0aW9uTWFwLnNldCgnYm9vdHN0cmFwJywgcmVmc1RvQXJyYXkobWV0YS5ib290c3RyYXAsIG1ldGEuY29udGFpbnNGb3J3YXJkRGVjbHMpKTtcbiAgfVxuXG4gIGlmIChtZXRhLmRlY2xhcmF0aW9ucy5sZW5ndGggPiAwKSB7XG4gICAgZGVmaW5pdGlvbk1hcC5zZXQoJ2RlY2xhcmF0aW9ucycsIHJlZnNUb0FycmF5KG1ldGEuZGVjbGFyYXRpb25zLCBtZXRhLmNvbnRhaW5zRm9yd2FyZERlY2xzKSk7XG4gIH1cblxuICBpZiAobWV0YS5pbXBvcnRzLmxlbmd0aCA+IDApIHtcbiAgICBkZWZpbml0aW9uTWFwLnNldCgnaW1wb3J0cycsIHJlZnNUb0FycmF5KG1ldGEuaW1wb3J0cywgbWV0YS5jb250YWluc0ZvcndhcmREZWNscykpO1xuICB9XG5cbiAgaWYgKG1ldGEuZXhwb3J0cy5sZW5ndGggPiAwKSB7XG4gICAgZGVmaW5pdGlvbk1hcC5zZXQoJ2V4cG9ydHMnLCByZWZzVG9BcnJheShtZXRhLmV4cG9ydHMsIG1ldGEuY29udGFpbnNGb3J3YXJkRGVjbHMpKTtcbiAgfVxuXG4gIGlmIChtZXRhLnNjaGVtYXMgIT09IG51bGwgJiYgbWV0YS5zY2hlbWFzLmxlbmd0aCA+IDApIHtcbiAgICBkZWZpbml0aW9uTWFwLnNldCgnc2NoZW1hcycsIG8ubGl0ZXJhbEFycihtZXRhLnNjaGVtYXMubWFwKHJlZiA9PiByZWYudmFsdWUpKSk7XG4gIH1cblxuICBpZiAobWV0YS5pZCAhPT0gbnVsbCkge1xuICAgIGRlZmluaXRpb25NYXAuc2V0KCdpZCcsIG1ldGEuaWQpO1xuICB9XG5cbiAgcmV0dXJuIGRlZmluaXRpb25NYXA7XG59XG4iXX0=