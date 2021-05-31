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
        define("@angular/compiler-cli/src/ngtsc/cycles", ["require", "exports", "@angular/compiler-cli/src/ngtsc/cycles/src/analyzer", "@angular/compiler-cli/src/ngtsc/cycles/src/imports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ImportGraph = exports.CycleAnalyzer = exports.Cycle = void 0;
    var analyzer_1 = require("@angular/compiler-cli/src/ngtsc/cycles/src/analyzer");
    Object.defineProperty(exports, "Cycle", { enumerable: true, get: function () { return analyzer_1.Cycle; } });
    Object.defineProperty(exports, "CycleAnalyzer", { enumerable: true, get: function () { return analyzer_1.CycleAnalyzer; } });
    var imports_1 = require("@angular/compiler-cli/src/ngtsc/cycles/src/imports");
    Object.defineProperty(exports, "ImportGraph", { enumerable: true, get: function () { return imports_1.ImportGraph; } });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL2N5Y2xlcy9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFFSCxnRkFBMkU7SUFBbkUsaUdBQUEsS0FBSyxPQUFBO0lBQUUseUdBQUEsYUFBYSxPQUFBO0lBQzVCLDhFQUEwQztJQUFsQyxzR0FBQSxXQUFXLE9BQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuZXhwb3J0IHtDeWNsZSwgQ3ljbGVBbmFseXplciwgQ3ljbGVIYW5kbGluZ1N0cmF0ZWd5fSBmcm9tICcuL3NyYy9hbmFseXplcic7XG5leHBvcnQge0ltcG9ydEdyYXBofSBmcm9tICcuL3NyYy9pbXBvcnRzJztcbiJdfQ==