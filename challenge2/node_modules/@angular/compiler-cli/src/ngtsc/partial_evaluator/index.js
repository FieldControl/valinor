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
        define("@angular/compiler-cli/src/ngtsc/partial_evaluator", ["require", "exports", "@angular/compiler-cli/src/ngtsc/partial_evaluator/src/diagnostics", "@angular/compiler-cli/src/ngtsc/partial_evaluator/src/dynamic", "@angular/compiler-cli/src/ngtsc/partial_evaluator/src/interface", "@angular/compiler-cli/src/ngtsc/partial_evaluator/src/result"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.KnownFn = exports.EnumValue = exports.PartialEvaluator = exports.DynamicValue = exports.traceDynamicValue = exports.describeResolvedType = void 0;
    var diagnostics_1 = require("@angular/compiler-cli/src/ngtsc/partial_evaluator/src/diagnostics");
    Object.defineProperty(exports, "describeResolvedType", { enumerable: true, get: function () { return diagnostics_1.describeResolvedType; } });
    Object.defineProperty(exports, "traceDynamicValue", { enumerable: true, get: function () { return diagnostics_1.traceDynamicValue; } });
    var dynamic_1 = require("@angular/compiler-cli/src/ngtsc/partial_evaluator/src/dynamic");
    Object.defineProperty(exports, "DynamicValue", { enumerable: true, get: function () { return dynamic_1.DynamicValue; } });
    var interface_1 = require("@angular/compiler-cli/src/ngtsc/partial_evaluator/src/interface");
    Object.defineProperty(exports, "PartialEvaluator", { enumerable: true, get: function () { return interface_1.PartialEvaluator; } });
    var result_1 = require("@angular/compiler-cli/src/ngtsc/partial_evaluator/src/result");
    Object.defineProperty(exports, "EnumValue", { enumerable: true, get: function () { return result_1.EnumValue; } });
    Object.defineProperty(exports, "KnownFn", { enumerable: true, get: function () { return result_1.KnownFn; } });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL3BhcnRpYWxfZXZhbHVhdG9yL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQUVILGlHQUEwRTtJQUFsRSxtSEFBQSxvQkFBb0IsT0FBQTtJQUFFLGdIQUFBLGlCQUFpQixPQUFBO0lBQy9DLHlGQUEyQztJQUFuQyx1R0FBQSxZQUFZLE9BQUE7SUFDcEIsNkZBQTBFO0lBQXpDLDZHQUFBLGdCQUFnQixPQUFBO0lBQ2pELHVGQUFxRztJQUE3RixtR0FBQSxTQUFTLE9BQUE7SUFBRSxpR0FBQSxPQUFPLE9BQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuZXhwb3J0IHtkZXNjcmliZVJlc29sdmVkVHlwZSwgdHJhY2VEeW5hbWljVmFsdWV9IGZyb20gJy4vc3JjL2RpYWdub3N0aWNzJztcbmV4cG9ydCB7RHluYW1pY1ZhbHVlfSBmcm9tICcuL3NyYy9keW5hbWljJztcbmV4cG9ydCB7Rm9yZWlnbkZ1bmN0aW9uUmVzb2x2ZXIsIFBhcnRpYWxFdmFsdWF0b3J9IGZyb20gJy4vc3JjL2ludGVyZmFjZSc7XG5leHBvcnQge0VudW1WYWx1ZSwgS25vd25GbiwgUmVzb2x2ZWRWYWx1ZSwgUmVzb2x2ZWRWYWx1ZUFycmF5LCBSZXNvbHZlZFZhbHVlTWFwfSBmcm9tICcuL3NyYy9yZXN1bHQnO1xuIl19