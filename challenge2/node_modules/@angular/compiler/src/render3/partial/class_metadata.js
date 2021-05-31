(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler/src/render3/partial/class_metadata", ["require", "exports", "@angular/compiler/src/output/output_ast", "@angular/compiler/src/render3/r3_identifiers", "@angular/compiler/src/render3/view/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.compileDeclareClassMetadata = void 0;
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var o = require("@angular/compiler/src/output/output_ast");
    var r3_identifiers_1 = require("@angular/compiler/src/render3/r3_identifiers");
    var util_1 = require("@angular/compiler/src/render3/view/util");
    /**
     * Every time we make a breaking change to the declaration interface or partial-linker behavior, we
     * must update this constant to prevent old partial-linkers from incorrectly processing the
     * declaration.
     *
     * Do not include any prerelease in these versions as they are ignored.
     */
    var MINIMUM_PARTIAL_LINKER_VERSION = '12.0.0';
    function compileDeclareClassMetadata(metadata) {
        var definitionMap = new util_1.DefinitionMap();
        definitionMap.set('minVersion', o.literal(MINIMUM_PARTIAL_LINKER_VERSION));
        definitionMap.set('version', o.literal('12.0.2'));
        definitionMap.set('ngImport', o.importExpr(r3_identifiers_1.Identifiers.core));
        definitionMap.set('type', metadata.type);
        definitionMap.set('decorators', metadata.decorators);
        definitionMap.set('ctorParameters', metadata.ctorParameters);
        definitionMap.set('propDecorators', metadata.propDecorators);
        return o.importExpr(r3_identifiers_1.Identifiers.declareClassMetadata).callFn([definitionMap.toLiteralMap()]);
    }
    exports.compileDeclareClassMetadata = compileDeclareClassMetadata;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xhc3NfbWV0YWRhdGEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci9zcmMvcmVuZGVyMy9wYXJ0aWFsL2NsYXNzX21ldGFkYXRhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztJQUFBOzs7Ozs7T0FNRztJQUNILDJEQUE2QztJQUU3QywrRUFBb0Q7SUFDcEQsZ0VBQTJDO0lBSTNDOzs7Ozs7T0FNRztJQUNILElBQU0sOEJBQThCLEdBQUcsUUFBUSxDQUFDO0lBRWhELFNBQWdCLDJCQUEyQixDQUFDLFFBQXlCO1FBQ25FLElBQU0sYUFBYSxHQUFHLElBQUksb0JBQWEsRUFBMEIsQ0FBQztRQUNsRSxhQUFhLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLDhCQUE4QixDQUFDLENBQUMsQ0FBQztRQUMzRSxhQUFhLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQztRQUM3RCxhQUFhLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLDRCQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNyRCxhQUFhLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDekMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3JELGFBQWEsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUUsUUFBUSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQzdELGFBQWEsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUUsUUFBUSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBRTdELE9BQU8sQ0FBQyxDQUFDLFVBQVUsQ0FBQyw0QkFBRSxDQUFDLG9CQUFvQixDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsYUFBYSxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUMsQ0FBQztJQUN0RixDQUFDO0lBWEQsa0VBV0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCAqIGFzIG8gZnJvbSAnLi4vLi4vb3V0cHV0L291dHB1dF9hc3QnO1xuaW1wb3J0IHtSM0NsYXNzTWV0YWRhdGF9IGZyb20gJy4uL3IzX2NsYXNzX21ldGFkYXRhX2NvbXBpbGVyJztcbmltcG9ydCB7SWRlbnRpZmllcnMgYXMgUjN9IGZyb20gJy4uL3IzX2lkZW50aWZpZXJzJztcbmltcG9ydCB7RGVmaW5pdGlvbk1hcH0gZnJvbSAnLi4vdmlldy91dGlsJztcblxuaW1wb3J0IHtSM0RlY2xhcmVDbGFzc01ldGFkYXRhfSBmcm9tICcuL2FwaSc7XG5cbi8qKlxuICogRXZlcnkgdGltZSB3ZSBtYWtlIGEgYnJlYWtpbmcgY2hhbmdlIHRvIHRoZSBkZWNsYXJhdGlvbiBpbnRlcmZhY2Ugb3IgcGFydGlhbC1saW5rZXIgYmVoYXZpb3IsIHdlXG4gKiBtdXN0IHVwZGF0ZSB0aGlzIGNvbnN0YW50IHRvIHByZXZlbnQgb2xkIHBhcnRpYWwtbGlua2VycyBmcm9tIGluY29ycmVjdGx5IHByb2Nlc3NpbmcgdGhlXG4gKiBkZWNsYXJhdGlvbi5cbiAqXG4gKiBEbyBub3QgaW5jbHVkZSBhbnkgcHJlcmVsZWFzZSBpbiB0aGVzZSB2ZXJzaW9ucyBhcyB0aGV5IGFyZSBpZ25vcmVkLlxuICovXG5jb25zdCBNSU5JTVVNX1BBUlRJQUxfTElOS0VSX1ZFUlNJT04gPSAnMTIuMC4wJztcblxuZXhwb3J0IGZ1bmN0aW9uIGNvbXBpbGVEZWNsYXJlQ2xhc3NNZXRhZGF0YShtZXRhZGF0YTogUjNDbGFzc01ldGFkYXRhKTogby5FeHByZXNzaW9uIHtcbiAgY29uc3QgZGVmaW5pdGlvbk1hcCA9IG5ldyBEZWZpbml0aW9uTWFwPFIzRGVjbGFyZUNsYXNzTWV0YWRhdGE+KCk7XG4gIGRlZmluaXRpb25NYXAuc2V0KCdtaW5WZXJzaW9uJywgby5saXRlcmFsKE1JTklNVU1fUEFSVElBTF9MSU5LRVJfVkVSU0lPTikpO1xuICBkZWZpbml0aW9uTWFwLnNldCgndmVyc2lvbicsIG8ubGl0ZXJhbCgnMC4wLjAtUExBQ0VIT0xERVInKSk7XG4gIGRlZmluaXRpb25NYXAuc2V0KCduZ0ltcG9ydCcsIG8uaW1wb3J0RXhwcihSMy5jb3JlKSk7XG4gIGRlZmluaXRpb25NYXAuc2V0KCd0eXBlJywgbWV0YWRhdGEudHlwZSk7XG4gIGRlZmluaXRpb25NYXAuc2V0KCdkZWNvcmF0b3JzJywgbWV0YWRhdGEuZGVjb3JhdG9ycyk7XG4gIGRlZmluaXRpb25NYXAuc2V0KCdjdG9yUGFyYW1ldGVycycsIG1ldGFkYXRhLmN0b3JQYXJhbWV0ZXJzKTtcbiAgZGVmaW5pdGlvbk1hcC5zZXQoJ3Byb3BEZWNvcmF0b3JzJywgbWV0YWRhdGEucHJvcERlY29yYXRvcnMpO1xuXG4gIHJldHVybiBvLmltcG9ydEV4cHIoUjMuZGVjbGFyZUNsYXNzTWV0YWRhdGEpLmNhbGxGbihbZGVmaW5pdGlvbk1hcC50b0xpdGVyYWxNYXAoKV0pO1xufVxuIl19