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
        define("@angular/compiler-cli/src/ngtsc/transform", ["require", "exports", "tslib", "@angular/compiler-cli/src/ngtsc/transform/src/api", "@angular/compiler-cli/src/ngtsc/transform/src/alias", "@angular/compiler-cli/src/ngtsc/transform/src/compilation", "@angular/compiler-cli/src/ngtsc/transform/src/declaration", "@angular/compiler-cli/src/ngtsc/transform/src/trait", "@angular/compiler-cli/src/ngtsc/transform/src/transform"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ivyTransformFactory = exports.TraitState = exports.Trait = exports.ReturnTypeTransform = exports.IvyDeclarationDtsTransform = exports.DtsTransformRegistry = exports.declarationTransformFactory = exports.TraitCompiler = exports.aliasTransformFactory = void 0;
    var tslib_1 = require("tslib");
    tslib_1.__exportStar(require("@angular/compiler-cli/src/ngtsc/transform/src/api"), exports);
    var alias_1 = require("@angular/compiler-cli/src/ngtsc/transform/src/alias");
    Object.defineProperty(exports, "aliasTransformFactory", { enumerable: true, get: function () { return alias_1.aliasTransformFactory; } });
    var compilation_1 = require("@angular/compiler-cli/src/ngtsc/transform/src/compilation");
    Object.defineProperty(exports, "TraitCompiler", { enumerable: true, get: function () { return compilation_1.TraitCompiler; } });
    var declaration_1 = require("@angular/compiler-cli/src/ngtsc/transform/src/declaration");
    Object.defineProperty(exports, "declarationTransformFactory", { enumerable: true, get: function () { return declaration_1.declarationTransformFactory; } });
    Object.defineProperty(exports, "DtsTransformRegistry", { enumerable: true, get: function () { return declaration_1.DtsTransformRegistry; } });
    Object.defineProperty(exports, "IvyDeclarationDtsTransform", { enumerable: true, get: function () { return declaration_1.IvyDeclarationDtsTransform; } });
    Object.defineProperty(exports, "ReturnTypeTransform", { enumerable: true, get: function () { return declaration_1.ReturnTypeTransform; } });
    var trait_1 = require("@angular/compiler-cli/src/ngtsc/transform/src/trait");
    Object.defineProperty(exports, "Trait", { enumerable: true, get: function () { return trait_1.Trait; } });
    Object.defineProperty(exports, "TraitState", { enumerable: true, get: function () { return trait_1.TraitState; } });
    var transform_1 = require("@angular/compiler-cli/src/ngtsc/transform/src/transform");
    Object.defineProperty(exports, "ivyTransformFactory", { enumerable: true, get: function () { return transform_1.ivyTransformFactory; } });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL3RyYW5zZm9ybS9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBRUgsNEZBQTBCO0lBQzFCLDZFQUFrRDtJQUExQyw4R0FBQSxxQkFBcUIsT0FBQTtJQUM3Qix5RkFBNkQ7SUFBeEMsNEdBQUEsYUFBYSxPQUFBO0lBQ2xDLHlGQUFxSTtJQUE3SCwwSEFBQSwyQkFBMkIsT0FBQTtJQUFFLG1IQUFBLG9CQUFvQixPQUFBO0lBQUUseUhBQUEsMEJBQTBCLE9BQUE7SUFBRSxrSEFBQSxtQkFBbUIsT0FBQTtJQUMxRyw2RUFBd0c7SUFBdEMsOEZBQUEsS0FBSyxPQUFBO0lBQUUsbUdBQUEsVUFBVSxPQUFBO0lBQ25GLHFGQUFvRDtJQUE1QyxnSEFBQSxtQkFBbUIsT0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5leHBvcnQgKiBmcm9tICcuL3NyYy9hcGknO1xuZXhwb3J0IHthbGlhc1RyYW5zZm9ybUZhY3Rvcnl9IGZyb20gJy4vc3JjL2FsaWFzJztcbmV4cG9ydCB7Q2xhc3NSZWNvcmQsIFRyYWl0Q29tcGlsZXJ9IGZyb20gJy4vc3JjL2NvbXBpbGF0aW9uJztcbmV4cG9ydCB7ZGVjbGFyYXRpb25UcmFuc2Zvcm1GYWN0b3J5LCBEdHNUcmFuc2Zvcm1SZWdpc3RyeSwgSXZ5RGVjbGFyYXRpb25EdHNUcmFuc2Zvcm0sIFJldHVyblR5cGVUcmFuc2Zvcm19IGZyb20gJy4vc3JjL2RlY2xhcmF0aW9uJztcbmV4cG9ydCB7QW5hbHl6ZWRUcmFpdCwgUGVuZGluZ1RyYWl0LCBSZXNvbHZlZFRyYWl0LCBTa2lwcGVkVHJhaXQsIFRyYWl0LCBUcmFpdFN0YXRlfSBmcm9tICcuL3NyYy90cmFpdCc7XG5leHBvcnQge2l2eVRyYW5zZm9ybUZhY3Rvcnl9IGZyb20gJy4vc3JjL3RyYW5zZm9ybSc7XG4iXX0=