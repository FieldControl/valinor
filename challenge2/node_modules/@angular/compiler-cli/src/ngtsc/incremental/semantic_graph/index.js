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
        define("@angular/compiler-cli/src/ngtsc/incremental/semantic_graph", ["require", "exports", "@angular/compiler-cli/src/ngtsc/incremental/semantic_graph/src/api", "@angular/compiler-cli/src/ngtsc/incremental/semantic_graph/src/graph", "@angular/compiler-cli/src/ngtsc/incremental/semantic_graph/src/type_parameters", "@angular/compiler-cli/src/ngtsc/incremental/semantic_graph/src/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isSymbolEqual = exports.isSetEqual = exports.isReferenceEqual = exports.isArrayEqual = exports.extractSemanticTypeParameters = exports.areTypeParametersEqual = exports.SemanticDepGraphUpdater = exports.SemanticDepGraph = exports.SemanticSymbol = void 0;
    var api_1 = require("@angular/compiler-cli/src/ngtsc/incremental/semantic_graph/src/api");
    Object.defineProperty(exports, "SemanticSymbol", { enumerable: true, get: function () { return api_1.SemanticSymbol; } });
    var graph_1 = require("@angular/compiler-cli/src/ngtsc/incremental/semantic_graph/src/graph");
    Object.defineProperty(exports, "SemanticDepGraph", { enumerable: true, get: function () { return graph_1.SemanticDepGraph; } });
    Object.defineProperty(exports, "SemanticDepGraphUpdater", { enumerable: true, get: function () { return graph_1.SemanticDepGraphUpdater; } });
    var type_parameters_1 = require("@angular/compiler-cli/src/ngtsc/incremental/semantic_graph/src/type_parameters");
    Object.defineProperty(exports, "areTypeParametersEqual", { enumerable: true, get: function () { return type_parameters_1.areTypeParametersEqual; } });
    Object.defineProperty(exports, "extractSemanticTypeParameters", { enumerable: true, get: function () { return type_parameters_1.extractSemanticTypeParameters; } });
    var util_1 = require("@angular/compiler-cli/src/ngtsc/incremental/semantic_graph/src/util");
    Object.defineProperty(exports, "isArrayEqual", { enumerable: true, get: function () { return util_1.isArrayEqual; } });
    Object.defineProperty(exports, "isReferenceEqual", { enumerable: true, get: function () { return util_1.isReferenceEqual; } });
    Object.defineProperty(exports, "isSetEqual", { enumerable: true, get: function () { return util_1.isSetEqual; } });
    Object.defineProperty(exports, "isSymbolEqual", { enumerable: true, get: function () { return util_1.isSymbolEqual; } });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL2luY3JlbWVudGFsL3NlbWFudGljX2dyYXBoL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQUVILDBGQUE0RDtJQUFqQyxxR0FBQSxjQUFjLE9BQUE7SUFDekMsOEZBQXNFO0lBQTlELHlHQUFBLGdCQUFnQixPQUFBO0lBQUUsZ0hBQUEsdUJBQXVCLE9BQUE7SUFDakQsa0hBQW1IO0lBQTNHLHlIQUFBLHNCQUFzQixPQUFBO0lBQUUsZ0lBQUEsNkJBQTZCLE9BQUE7SUFDN0QsNEZBQXFGO0lBQTdFLG9HQUFBLFlBQVksT0FBQTtJQUFFLHdHQUFBLGdCQUFnQixPQUFBO0lBQUUsa0dBQUEsVUFBVSxPQUFBO0lBQUUscUdBQUEsYUFBYSxPQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmV4cG9ydCB7U2VtYW50aWNSZWZlcmVuY2UsIFNlbWFudGljU3ltYm9sfSBmcm9tICcuL3NyYy9hcGknO1xuZXhwb3J0IHtTZW1hbnRpY0RlcEdyYXBoLCBTZW1hbnRpY0RlcEdyYXBoVXBkYXRlcn0gZnJvbSAnLi9zcmMvZ3JhcGgnO1xuZXhwb3J0IHthcmVUeXBlUGFyYW1ldGVyc0VxdWFsLCBleHRyYWN0U2VtYW50aWNUeXBlUGFyYW1ldGVycywgU2VtYW50aWNUeXBlUGFyYW1ldGVyfSBmcm9tICcuL3NyYy90eXBlX3BhcmFtZXRlcnMnO1xuZXhwb3J0IHtpc0FycmF5RXF1YWwsIGlzUmVmZXJlbmNlRXF1YWwsIGlzU2V0RXF1YWwsIGlzU3ltYm9sRXF1YWx9IGZyb20gJy4vc3JjL3V0aWwnO1xuIl19