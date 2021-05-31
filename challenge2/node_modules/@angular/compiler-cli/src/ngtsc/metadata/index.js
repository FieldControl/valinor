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
        define("@angular/compiler-cli/src/ngtsc/metadata", ["require", "exports", "tslib", "@angular/compiler-cli/src/ngtsc/metadata/src/api", "@angular/compiler-cli/src/ngtsc/metadata/src/dts", "@angular/compiler-cli/src/ngtsc/metadata/src/inheritance", "@angular/compiler-cli/src/ngtsc/metadata/src/registry", "@angular/compiler-cli/src/ngtsc/metadata/src/resource_registry", "@angular/compiler-cli/src/ngtsc/metadata/src/util", "@angular/compiler-cli/src/ngtsc/metadata/src/property_mapping"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ClassPropertyMapping = exports.CompoundMetadataReader = exports.extractDirectiveTypeCheckMeta = exports.isExternalResource = exports.ResourceRegistry = exports.InjectableClassRegistry = exports.LocalMetadataRegistry = exports.CompoundMetadataRegistry = exports.flattenInheritedDirectiveMetadata = exports.DtsMetadataReader = void 0;
    var tslib_1 = require("tslib");
    tslib_1.__exportStar(require("@angular/compiler-cli/src/ngtsc/metadata/src/api"), exports);
    var dts_1 = require("@angular/compiler-cli/src/ngtsc/metadata/src/dts");
    Object.defineProperty(exports, "DtsMetadataReader", { enumerable: true, get: function () { return dts_1.DtsMetadataReader; } });
    var inheritance_1 = require("@angular/compiler-cli/src/ngtsc/metadata/src/inheritance");
    Object.defineProperty(exports, "flattenInheritedDirectiveMetadata", { enumerable: true, get: function () { return inheritance_1.flattenInheritedDirectiveMetadata; } });
    var registry_1 = require("@angular/compiler-cli/src/ngtsc/metadata/src/registry");
    Object.defineProperty(exports, "CompoundMetadataRegistry", { enumerable: true, get: function () { return registry_1.CompoundMetadataRegistry; } });
    Object.defineProperty(exports, "LocalMetadataRegistry", { enumerable: true, get: function () { return registry_1.LocalMetadataRegistry; } });
    Object.defineProperty(exports, "InjectableClassRegistry", { enumerable: true, get: function () { return registry_1.InjectableClassRegistry; } });
    var resource_registry_1 = require("@angular/compiler-cli/src/ngtsc/metadata/src/resource_registry");
    Object.defineProperty(exports, "ResourceRegistry", { enumerable: true, get: function () { return resource_registry_1.ResourceRegistry; } });
    Object.defineProperty(exports, "isExternalResource", { enumerable: true, get: function () { return resource_registry_1.isExternalResource; } });
    var util_1 = require("@angular/compiler-cli/src/ngtsc/metadata/src/util");
    Object.defineProperty(exports, "extractDirectiveTypeCheckMeta", { enumerable: true, get: function () { return util_1.extractDirectiveTypeCheckMeta; } });
    Object.defineProperty(exports, "CompoundMetadataReader", { enumerable: true, get: function () { return util_1.CompoundMetadataReader; } });
    var property_mapping_1 = require("@angular/compiler-cli/src/ngtsc/metadata/src/property_mapping");
    Object.defineProperty(exports, "ClassPropertyMapping", { enumerable: true, get: function () { return property_mapping_1.ClassPropertyMapping; } });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL21ldGFkYXRhL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCwyRkFBMEI7SUFDMUIsd0VBQTRDO0lBQXBDLHdHQUFBLGlCQUFpQixPQUFBO0lBQ3pCLHdGQUFvRTtJQUE1RCxnSUFBQSxpQ0FBaUMsT0FBQTtJQUN6QyxrRkFBd0c7SUFBaEcsb0hBQUEsd0JBQXdCLE9BQUE7SUFBRSxpSEFBQSxxQkFBcUIsT0FBQTtJQUFFLG1IQUFBLHVCQUF1QixPQUFBO0lBQ2hGLG9HQUE2SDtJQUFySCxxSEFBQSxnQkFBZ0IsT0FBQTtJQUFnQyx1SEFBQSxrQkFBa0IsT0FBQTtJQUMxRSwwRUFBaUY7SUFBekUscUhBQUEsNkJBQTZCLE9BQUE7SUFBRSw4R0FBQSxzQkFBc0IsT0FBQTtJQUM3RCxrR0FBbUg7SUFBdEYsd0hBQUEsb0JBQW9CLE9BQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuZXhwb3J0ICogZnJvbSAnLi9zcmMvYXBpJztcbmV4cG9ydCB7RHRzTWV0YWRhdGFSZWFkZXJ9IGZyb20gJy4vc3JjL2R0cyc7XG5leHBvcnQge2ZsYXR0ZW5Jbmhlcml0ZWREaXJlY3RpdmVNZXRhZGF0YX0gZnJvbSAnLi9zcmMvaW5oZXJpdGFuY2UnO1xuZXhwb3J0IHtDb21wb3VuZE1ldGFkYXRhUmVnaXN0cnksIExvY2FsTWV0YWRhdGFSZWdpc3RyeSwgSW5qZWN0YWJsZUNsYXNzUmVnaXN0cnl9IGZyb20gJy4vc3JjL3JlZ2lzdHJ5JztcbmV4cG9ydCB7UmVzb3VyY2VSZWdpc3RyeSwgUmVzb3VyY2UsIENvbXBvbmVudFJlc291cmNlcywgaXNFeHRlcm5hbFJlc291cmNlLCBFeHRlcm5hbFJlc291cmNlfSBmcm9tICcuL3NyYy9yZXNvdXJjZV9yZWdpc3RyeSc7XG5leHBvcnQge2V4dHJhY3REaXJlY3RpdmVUeXBlQ2hlY2tNZXRhLCBDb21wb3VuZE1ldGFkYXRhUmVhZGVyfSBmcm9tICcuL3NyYy91dGlsJztcbmV4cG9ydCB7QmluZGluZ1Byb3BlcnR5TmFtZSwgQ2xhc3NQcm9wZXJ0eU1hcHBpbmcsIENsYXNzUHJvcGVydHlOYW1lLCBJbnB1dE9yT3V0cHV0fSBmcm9tICcuL3NyYy9wcm9wZXJ0eV9tYXBwaW5nJztcbiJdfQ==