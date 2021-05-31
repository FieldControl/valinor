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
        define("@angular/compiler-cli/src/ngtsc/scope", ["require", "exports", "@angular/compiler-cli/src/ngtsc/scope/src/component_scope", "@angular/compiler-cli/src/ngtsc/scope/src/dependency", "@angular/compiler-cli/src/ngtsc/scope/src/local", "@angular/compiler-cli/src/ngtsc/scope/src/typecheck"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TypeCheckScopeRegistry = exports.LocalModuleScopeRegistry = exports.MetadataDtsModuleScopeResolver = exports.CompoundComponentScopeReader = void 0;
    var component_scope_1 = require("@angular/compiler-cli/src/ngtsc/scope/src/component_scope");
    Object.defineProperty(exports, "CompoundComponentScopeReader", { enumerable: true, get: function () { return component_scope_1.CompoundComponentScopeReader; } });
    var dependency_1 = require("@angular/compiler-cli/src/ngtsc/scope/src/dependency");
    Object.defineProperty(exports, "MetadataDtsModuleScopeResolver", { enumerable: true, get: function () { return dependency_1.MetadataDtsModuleScopeResolver; } });
    var local_1 = require("@angular/compiler-cli/src/ngtsc/scope/src/local");
    Object.defineProperty(exports, "LocalModuleScopeRegistry", { enumerable: true, get: function () { return local_1.LocalModuleScopeRegistry; } });
    var typecheck_1 = require("@angular/compiler-cli/src/ngtsc/scope/src/typecheck");
    Object.defineProperty(exports, "TypeCheckScopeRegistry", { enumerable: true, get: function () { return typecheck_1.TypeCheckScopeRegistry; } });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL3Njb3BlL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQUdILDZGQUF5RjtJQUEzRCwrSEFBQSw0QkFBNEIsT0FBQTtJQUMxRCxtRkFBd0Y7SUFBeEQsNEhBQUEsOEJBQThCLE9BQUE7SUFDOUQseUVBQTJHO0lBQWhFLGlIQUFBLHdCQUF3QixPQUFBO0lBQ25FLGlGQUF1RTtJQUEvQyxtSEFBQSxzQkFBc0IsT0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5leHBvcnQge0V4cG9ydFNjb3BlLCBTY29wZURhdGF9IGZyb20gJy4vc3JjL2FwaSc7XG5leHBvcnQge0NvbXBvbmVudFNjb3BlUmVhZGVyLCBDb21wb3VuZENvbXBvbmVudFNjb3BlUmVhZGVyfSBmcm9tICcuL3NyYy9jb21wb25lbnRfc2NvcGUnO1xuZXhwb3J0IHtEdHNNb2R1bGVTY29wZVJlc29sdmVyLCBNZXRhZGF0YUR0c01vZHVsZVNjb3BlUmVzb2x2ZXJ9IGZyb20gJy4vc3JjL2RlcGVuZGVuY3knO1xuZXhwb3J0IHtEZWNsYXJhdGlvbkRhdGEsIExvY2FsTW9kdWxlU2NvcGUsIExvY2FsTW9kdWxlU2NvcGVSZWdpc3RyeSwgTG9jYWxOZ01vZHVsZURhdGF9IGZyb20gJy4vc3JjL2xvY2FsJztcbmV4cG9ydCB7VHlwZUNoZWNrU2NvcGUsIFR5cGVDaGVja1Njb3BlUmVnaXN0cnl9IGZyb20gJy4vc3JjL3R5cGVjaGVjayc7Il19