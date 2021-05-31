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
        define("@angular/compiler-cli/src/ngtsc/diagnostics/src/error", ["require", "exports", "typescript", "@angular/compiler-cli/src/ngtsc/diagnostics/src/error_code"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isFatalDiagnosticError = exports.makeRelatedInformation = exports.makeDiagnostic = exports.FatalDiagnosticError = void 0;
    var ts = require("typescript");
    var error_code_1 = require("@angular/compiler-cli/src/ngtsc/diagnostics/src/error_code");
    var FatalDiagnosticError = /** @class */ (function () {
        function FatalDiagnosticError(code, node, message, relatedInformation) {
            this.code = code;
            this.node = node;
            this.message = message;
            this.relatedInformation = relatedInformation;
            /**
             * @internal
             */
            this._isFatalDiagnosticError = true;
        }
        FatalDiagnosticError.prototype.toDiagnostic = function () {
            return makeDiagnostic(this.code, this.node, this.message, this.relatedInformation);
        };
        return FatalDiagnosticError;
    }());
    exports.FatalDiagnosticError = FatalDiagnosticError;
    function makeDiagnostic(code, node, messageText, relatedInformation) {
        node = ts.getOriginalNode(node);
        return {
            category: ts.DiagnosticCategory.Error,
            code: error_code_1.ngErrorCode(code),
            file: ts.getOriginalNode(node).getSourceFile(),
            start: node.getStart(undefined, false),
            length: node.getWidth(),
            messageText: messageText,
            relatedInformation: relatedInformation,
        };
    }
    exports.makeDiagnostic = makeDiagnostic;
    function makeRelatedInformation(node, messageText) {
        node = ts.getOriginalNode(node);
        return {
            category: ts.DiagnosticCategory.Message,
            code: 0,
            file: node.getSourceFile(),
            start: node.getStart(),
            length: node.getWidth(),
            messageText: messageText,
        };
    }
    exports.makeRelatedInformation = makeRelatedInformation;
    function isFatalDiagnosticError(err) {
        return err._isFatalDiagnosticError === true;
    }
    exports.isFatalDiagnosticError = isFatalDiagnosticError;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL2RpYWdub3N0aWNzL3NyYy9lcnJvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFFSCwrQkFBaUM7SUFFakMseUZBQW9EO0lBRXBEO1FBQ0UsOEJBQ2EsSUFBZSxFQUFXLElBQWEsRUFDdkMsT0FBeUMsRUFDekMsa0JBQXNEO1lBRnRELFNBQUksR0FBSixJQUFJLENBQVc7WUFBVyxTQUFJLEdBQUosSUFBSSxDQUFTO1lBQ3ZDLFlBQU8sR0FBUCxPQUFPLENBQWtDO1lBQ3pDLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBb0M7WUFFbkU7O2VBRUc7WUFDSCw0QkFBdUIsR0FBRyxJQUFJLENBQUM7UUFMdUMsQ0FBQztRQU92RSwyQ0FBWSxHQUFaO1lBQ0UsT0FBTyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFDckYsQ0FBQztRQUNILDJCQUFDO0lBQUQsQ0FBQyxBQWRELElBY0M7SUFkWSxvREFBb0I7SUFnQmpDLFNBQWdCLGNBQWMsQ0FDMUIsSUFBZSxFQUFFLElBQWEsRUFBRSxXQUE2QyxFQUM3RSxrQkFBc0Q7UUFDeEQsSUFBSSxHQUFHLEVBQUUsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDaEMsT0FBTztZQUNMLFFBQVEsRUFBRSxFQUFFLENBQUMsa0JBQWtCLENBQUMsS0FBSztZQUNyQyxJQUFJLEVBQUUsd0JBQVcsQ0FBQyxJQUFJLENBQUM7WUFDdkIsSUFBSSxFQUFFLEVBQUUsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUMsYUFBYSxFQUFFO1lBQzlDLEtBQUssRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUM7WUFDdEMsTUFBTSxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDdkIsV0FBVyxhQUFBO1lBQ1gsa0JBQWtCLG9CQUFBO1NBQ25CLENBQUM7SUFDSixDQUFDO0lBYkQsd0NBYUM7SUFFRCxTQUFnQixzQkFBc0IsQ0FDbEMsSUFBYSxFQUFFLFdBQW1CO1FBQ3BDLElBQUksR0FBRyxFQUFFLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2hDLE9BQU87WUFDTCxRQUFRLEVBQUUsRUFBRSxDQUFDLGtCQUFrQixDQUFDLE9BQU87WUFDdkMsSUFBSSxFQUFFLENBQUM7WUFDUCxJQUFJLEVBQUUsSUFBSSxDQUFDLGFBQWEsRUFBRTtZQUMxQixLQUFLLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUN0QixNQUFNLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUN2QixXQUFXLGFBQUE7U0FDWixDQUFDO0lBQ0osQ0FBQztJQVhELHdEQVdDO0lBRUQsU0FBZ0Isc0JBQXNCLENBQUMsR0FBUTtRQUM3QyxPQUFPLEdBQUcsQ0FBQyx1QkFBdUIsS0FBSyxJQUFJLENBQUM7SUFDOUMsQ0FBQztJQUZELHdEQUVDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuXG5pbXBvcnQge0Vycm9yQ29kZSwgbmdFcnJvckNvZGV9IGZyb20gJy4vZXJyb3JfY29kZSc7XG5cbmV4cG9ydCBjbGFzcyBGYXRhbERpYWdub3N0aWNFcnJvciB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcmVhZG9ubHkgY29kZTogRXJyb3JDb2RlLCByZWFkb25seSBub2RlOiB0cy5Ob2RlLFxuICAgICAgcmVhZG9ubHkgbWVzc2FnZTogc3RyaW5nfHRzLkRpYWdub3N0aWNNZXNzYWdlQ2hhaW4sXG4gICAgICByZWFkb25seSByZWxhdGVkSW5mb3JtYXRpb24/OiB0cy5EaWFnbm9zdGljUmVsYXRlZEluZm9ybWF0aW9uW10pIHt9XG5cbiAgLyoqXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgX2lzRmF0YWxEaWFnbm9zdGljRXJyb3IgPSB0cnVlO1xuXG4gIHRvRGlhZ25vc3RpYygpOiB0cy5EaWFnbm9zdGljV2l0aExvY2F0aW9uIHtcbiAgICByZXR1cm4gbWFrZURpYWdub3N0aWModGhpcy5jb2RlLCB0aGlzLm5vZGUsIHRoaXMubWVzc2FnZSwgdGhpcy5yZWxhdGVkSW5mb3JtYXRpb24pO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYWtlRGlhZ25vc3RpYyhcbiAgICBjb2RlOiBFcnJvckNvZGUsIG5vZGU6IHRzLk5vZGUsIG1lc3NhZ2VUZXh0OiBzdHJpbmd8dHMuRGlhZ25vc3RpY01lc3NhZ2VDaGFpbixcbiAgICByZWxhdGVkSW5mb3JtYXRpb24/OiB0cy5EaWFnbm9zdGljUmVsYXRlZEluZm9ybWF0aW9uW10pOiB0cy5EaWFnbm9zdGljV2l0aExvY2F0aW9uIHtcbiAgbm9kZSA9IHRzLmdldE9yaWdpbmFsTm9kZShub2RlKTtcbiAgcmV0dXJuIHtcbiAgICBjYXRlZ29yeTogdHMuRGlhZ25vc3RpY0NhdGVnb3J5LkVycm9yLFxuICAgIGNvZGU6IG5nRXJyb3JDb2RlKGNvZGUpLFxuICAgIGZpbGU6IHRzLmdldE9yaWdpbmFsTm9kZShub2RlKS5nZXRTb3VyY2VGaWxlKCksXG4gICAgc3RhcnQ6IG5vZGUuZ2V0U3RhcnQodW5kZWZpbmVkLCBmYWxzZSksXG4gICAgbGVuZ3RoOiBub2RlLmdldFdpZHRoKCksXG4gICAgbWVzc2FnZVRleHQsXG4gICAgcmVsYXRlZEluZm9ybWF0aW9uLFxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFrZVJlbGF0ZWRJbmZvcm1hdGlvbihcbiAgICBub2RlOiB0cy5Ob2RlLCBtZXNzYWdlVGV4dDogc3RyaW5nKTogdHMuRGlhZ25vc3RpY1JlbGF0ZWRJbmZvcm1hdGlvbiB7XG4gIG5vZGUgPSB0cy5nZXRPcmlnaW5hbE5vZGUobm9kZSk7XG4gIHJldHVybiB7XG4gICAgY2F0ZWdvcnk6IHRzLkRpYWdub3N0aWNDYXRlZ29yeS5NZXNzYWdlLFxuICAgIGNvZGU6IDAsXG4gICAgZmlsZTogbm9kZS5nZXRTb3VyY2VGaWxlKCksXG4gICAgc3RhcnQ6IG5vZGUuZ2V0U3RhcnQoKSxcbiAgICBsZW5ndGg6IG5vZGUuZ2V0V2lkdGgoKSxcbiAgICBtZXNzYWdlVGV4dCxcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRmF0YWxEaWFnbm9zdGljRXJyb3IoZXJyOiBhbnkpOiBlcnIgaXMgRmF0YWxEaWFnbm9zdGljRXJyb3Ige1xuICByZXR1cm4gZXJyLl9pc0ZhdGFsRGlhZ25vc3RpY0Vycm9yID09PSB0cnVlO1xufVxuIl19