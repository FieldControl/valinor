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
        define("@angular/compiler-cli/src/ngtsc/typecheck/diagnostics/src/diagnostic", ["require", "exports", "typescript"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isTemplateDiagnostic = exports.makeTemplateDiagnostic = void 0;
    var ts = require("typescript");
    /**
     * Constructs a `ts.Diagnostic` for a given `ParseSourceSpan` within a template.
     */
    function makeTemplateDiagnostic(templateId, mapping, span, category, code, messageText, relatedMessage) {
        if (mapping.type === 'direct') {
            var relatedInformation = undefined;
            if (relatedMessage !== undefined) {
                relatedInformation = [{
                        category: ts.DiagnosticCategory.Message,
                        code: 0,
                        file: mapping.node.getSourceFile(),
                        start: relatedMessage.span.start.offset,
                        length: relatedMessage.span.end.offset - relatedMessage.span.start.offset,
                        messageText: relatedMessage.text,
                    }];
            }
            // For direct mappings, the error is shown inline as ngtsc was able to pinpoint a string
            // constant within the `@Component` decorator for the template. This allows us to map the error
            // directly into the bytes of the source file.
            return {
                source: 'ngtsc',
                code: code,
                category: category,
                messageText: messageText,
                file: mapping.node.getSourceFile(),
                componentFile: mapping.node.getSourceFile(),
                templateId: templateId,
                start: span.start.offset,
                length: span.end.offset - span.start.offset,
                relatedInformation: relatedInformation,
            };
        }
        else if (mapping.type === 'indirect' || mapping.type === 'external') {
            // For indirect mappings (template was declared inline, but ngtsc couldn't map it directly
            // to a string constant in the decorator), the component's file name is given with a suffix
            // indicating it's not the TS file being displayed, but a template.
            // For external temoplates, the HTML filename is used.
            var componentSf = mapping.componentClass.getSourceFile();
            var componentName = mapping.componentClass.name.text;
            // TODO(alxhub): remove cast when TS in g3 supports this narrowing.
            var fileName = mapping.type === 'indirect' ?
                componentSf.fileName + " (" + componentName + " template)" :
                mapping.templateUrl;
            // TODO(alxhub): investigate creating a fake `ts.SourceFile` here instead of invoking the TS
            // parser against the template (HTML is just really syntactically invalid TypeScript code ;).
            // Also investigate caching the file to avoid running the parser multiple times.
            var sf = ts.createSourceFile(fileName, mapping.template, ts.ScriptTarget.Latest, false, ts.ScriptKind.JSX);
            var relatedInformation = [];
            if (relatedMessage !== undefined) {
                relatedInformation.push({
                    category: ts.DiagnosticCategory.Message,
                    code: 0,
                    file: sf,
                    start: relatedMessage.span.start.offset,
                    length: relatedMessage.span.end.offset - relatedMessage.span.start.offset,
                    messageText: relatedMessage.text,
                });
            }
            relatedInformation.push({
                category: ts.DiagnosticCategory.Message,
                code: 0,
                file: componentSf,
                // mapping.node represents either the 'template' or 'templateUrl' expression. getStart()
                // and getEnd() are used because they don't include surrounding whitespace.
                start: mapping.node.getStart(),
                length: mapping.node.getEnd() - mapping.node.getStart(),
                messageText: "Error occurs in the template of component " + componentName + ".",
            });
            return {
                source: 'ngtsc',
                category: category,
                code: code,
                messageText: messageText,
                file: sf,
                componentFile: componentSf,
                templateId: templateId,
                start: span.start.offset,
                length: span.end.offset - span.start.offset,
                // Show a secondary message indicating the component whose template contains the error.
                relatedInformation: relatedInformation,
            };
        }
        else {
            throw new Error("Unexpected source mapping type: " + mapping.type);
        }
    }
    exports.makeTemplateDiagnostic = makeTemplateDiagnostic;
    function isTemplateDiagnostic(diagnostic) {
        return diagnostic.hasOwnProperty('componentFile') &&
            ts.isSourceFile(diagnostic.componentFile);
    }
    exports.isTemplateDiagnostic = isTemplateDiagnostic;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhZ25vc3RpYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvbmd0c2MvdHlwZWNoZWNrL2RpYWdub3N0aWNzL3NyYy9kaWFnbm9zdGljLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQUdILCtCQUFpQztJQW9CakM7O09BRUc7SUFDSCxTQUFnQixzQkFBc0IsQ0FDbEMsVUFBc0IsRUFBRSxPQUE4QixFQUFFLElBQXFCLEVBQzdFLFFBQStCLEVBQUUsSUFBWSxFQUFFLFdBQTZDLEVBQzVGLGNBR0M7UUFDSCxJQUFJLE9BQU8sQ0FBQyxJQUFJLEtBQUssUUFBUSxFQUFFO1lBQzdCLElBQUksa0JBQWtCLEdBQWdELFNBQVMsQ0FBQztZQUNoRixJQUFJLGNBQWMsS0FBSyxTQUFTLEVBQUU7Z0JBQ2hDLGtCQUFrQixHQUFHLENBQUM7d0JBQ3BCLFFBQVEsRUFBRSxFQUFFLENBQUMsa0JBQWtCLENBQUMsT0FBTzt3QkFDdkMsSUFBSSxFQUFFLENBQUM7d0JBQ1AsSUFBSSxFQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFO3dCQUNsQyxLQUFLLEVBQUUsY0FBYyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTTt3QkFDdkMsTUFBTSxFQUFFLGNBQWMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sR0FBRyxjQUFjLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNO3dCQUN6RSxXQUFXLEVBQUUsY0FBYyxDQUFDLElBQUk7cUJBQ2pDLENBQUMsQ0FBQzthQUNKO1lBQ0Qsd0ZBQXdGO1lBQ3hGLCtGQUErRjtZQUMvRiw4Q0FBOEM7WUFDOUMsT0FBTztnQkFDTCxNQUFNLEVBQUUsT0FBTztnQkFDZixJQUFJLE1BQUE7Z0JBQ0osUUFBUSxVQUFBO2dCQUNSLFdBQVcsYUFBQTtnQkFD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QWtCLG9CQUFBO2FBQ25CLENBQUM7U0FDSDthQUFNO1lBQ0wsTUFBTSxJQUFJLEtBQUssQ0FBQyxxQ0FBb0MsT0FBMEIsQ0FBQyxJQUFNLENBQUMsQ0FBQztTQUN4RjtJQUNILENBQUM7SUExRkQsd0RBMEZDO0lBRUQsU0FBZ0Isb0JBQW9CLENBQUMsVUFBeUI7UUFDNUQsT0FBTyxVQUFVLENBQUMsY0FBYyxDQUFDLGVBQWUsQ0FBQztZQUM3QyxFQUFFLENBQUMsWUFBWSxDQUFFLFVBQWtCLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDekQsQ0FBQztJQUhELG9EQUdDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7UGFyc2VTb3VyY2VTcGFufSBmcm9tICdAYW5ndWxhci9jb21waWxlcic7XG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcblxuaW1wb3J0IHtFeHRlcm5hbFRlbXBsYXRlU291cmNlTWFwcGluZywgVGVtcGxhdGVJZCwgVGVtcGxhdGVTb3VyY2VNYXBwaW5nfSBmcm9tICcuLi8uLi9hcGknO1xuXG4vKipcbiAqIEEgYHRzLkRpYWdub3N0aWNgIHdpdGggYWRkaXRpb25hbCBpbmZvcm1hdGlvbiBhYm91dCB0aGUgZGlhZ25vc3RpYyByZWxhdGVkIHRvIHRlbXBsYXRlXG4gKiB0eXBlLWNoZWNraW5nLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFRlbXBsYXRlRGlhZ25vc3RpYyBleHRlbmRzIHRzLkRpYWdub3N0aWMge1xuICAvKipcbiAgICogVGhlIGNvbXBvbmVudCB3aXRoIHRoZSB0ZW1wbGF0ZSB0aGF0IHJlc3VsdGVkIGluIHRoaXMgZGlhZ25vc3RpYy5cbiAgICovXG4gIGNvbXBvbmVudEZpbGU6IHRzLlNvdXJjZUZpbGU7XG5cbiAgLyoqXG4gICAqIFRoZSB0ZW1wbGF0ZSBpZCBvZiB0aGUgY29tcG9uZW50IHRoYXQgcmVzdWx0ZWQgaW4gdGhpcyBkaWFnbm9zdGljLlxuICAgKi9cbiAgdGVtcGxhdGVJZDogVGVtcGxhdGVJZDtcbn1cblxuLyoqXG4gKiBDb25zdHJ1Y3RzIGEgYHRzLkRpYWdub3N0aWNgIGZvciBhIGdpdmVuIGBQYXJzZVNvdXJjZVNwYW5gIHdpdGhpbiBhIHRlbXBsYXRlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gbWFrZVRlbXBsYXRlRGlhZ25vc3RpYyhcbiAgICB0ZW1wbGF0ZUlkOiBUZW1wbGF0ZUlkLCBtYXBwaW5nOiBUZW1wbGF0ZVNvdXJjZU1hcHBpbmcsIHNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICBjYXRlZ29yeTogdHMuRGlhZ25vc3RpY0NhdGVnb3J5LCBjb2RlOiBudW1iZXIsIG1lc3NhZ2VUZXh0OiBzdHJpbmd8dHMuRGlhZ25vc3RpY01lc3NhZ2VDaGFpbixcbiAgICByZWxhdGVkTWVzc2FnZT86IHtcbiAgICAgIHRleHQ6IHN0cmluZyxcbiAgICAgIHNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICB9KTogVGVtcGxhdGVEaWFnbm9zdGljIHtcbiAgaWYgKG1hcHBpbmcudHlwZSA9PT0gJ2RpcmVjdCcpIHtcbiAgICBsZXQgcmVsYXRlZEluZm9ybWF0aW9uOiB0cy5EaWFnbm9zdGljUmVsYXRlZEluZm9ybWF0aW9uW118dW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIGlmIChyZWxhdGVkTWVzc2FnZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZWxhdGVkSW5mb3JtYXRpb24gPSBbe1xuICAgICAgICBjYXRlZ29yeTogdHMuRGlhZ25vc3RpY0NhdGVnb3J5Lk1lc3NhZ2UsXG4gICAgICAgIGNvZGU6IDAsXG4gICAgICAgIGZpbGU6IG1hcHBpbmcubm9kZS5nZXRTb3VyY2VGaWxlKCksXG4gICAgICAgIHN0YXJ0OiByZWxhdGVkTWVzc2FnZS5zcGFuLnN0YXJ0Lm9mZnNldCxcbiAgICAgICAgbGVuZ3RoOiByZWxhdGVkTWVzc2FnZS5zcGFuLmVuZC5vZmZzZXQgLSByZWxhdGVkTWVzc2FnZS5zcGFuLnN0YXJ0Lm9mZnNldCxcbiAgICAgICAgbWVzc2FnZVRleHQ6IHJlbGF0ZWRNZXNzYWdlLnRleHQsXG4gICAgICB9XTtcbiAgICB9XG4gICAgLy8gRm9yIGRpcmVjdCBtYXBwaW5ncywgdGhlIGVycm9yIGlzIHNob3duIGlubGluZSBhcyBuZ3RzYyB3YXMgYWJsZSB0byBwaW5wb2ludCBhIHN0cmluZ1xuICAgIC8vIGNvbnN0YW50IHdpdGhpbiB0aGUgYEBDb21wb25lbnRgIGRlY29yYXRvciBmb3IgdGhlIHRlbXBsYXRlLiBUaGlzIGFsbG93cyB1cyB0byBtYXAgdGhlIGVycm9yXG4gICAgLy8gZGlyZWN0bHkgaW50byB0aGUgYnl0ZXMgb2YgdGhlIHNvdXJjZSBmaWxlLlxuICAgIHJldHVybiB7XG4gICAgICBzb3VyY2U6ICduZ3RzYycsXG4gICAgICBjb2RlLFxuICAgICAgY2F0ZWdvcnksXG4gICAgICBtZXNzYWdlVGV4dCxcbiAgICAgIGZpbGU6IG1hcHBpbmcubm9kZS5nZXRTb3VyY2VGaWxlKCksXG4gICAgICBjb21wb25lbnRGaWxlOiBtYXBwaW5nLm5vZGUuZ2V0U291cmNlRmlsZSgpLFxuICAgICAgdGVtcGxhdGVJZCxcbiAgICAgIHN0YXJ0OiBzcGFuLnN0YXJ0Lm9mZnNldCxcbiAgICAgIGxlbmd0aDogc3Bhbi5lbmQub2Zmc2V0IC0gc3Bhbi5zdGFydC5vZmZzZXQsXG4gICAgICByZWxhdGVkSW5mb3JtYXRpb24sXG4gICAgfTtcbiAgfSBlbHNlIGlmIChtYXBwaW5nLnR5cGUgPT09ICdpbmRpcmVjdCcgfHwgbWFwcGluZy50eXBlID09PSAnZXh0ZXJuYWwnKSB7XG4gICAgLy8gRm9yIGluZGlyZWN0IG1hcHBpbmdzICh0ZW1wbGF0ZSB3YXMgZGVjbGFyZWQgaW5saW5lLCBidXQgbmd0c2MgY291bGRuJ3QgbWFwIGl0IGRpcmVjdGx5XG4gICAgLy8gdG8gYSBzdHJpbmcgY29uc3RhbnQgaW4gdGhlIGRlY29yYXRvciksIHRoZSBjb21wb25lbnQncyBmaWxlIG5hbWUgaXMgZ2l2ZW4gd2l0aCBhIHN1ZmZpeFxuICAgIC8vIGluZGljYXRpbmcgaXQncyBub3QgdGhlIFRTIGZpbGUgYmVpbmcgZGlzcGxheWVkLCBidXQgYSB0ZW1wbGF0ZS5cbiAgICAvLyBGb3IgZXh0ZXJuYWwgdGVtb3BsYXRlcywgdGhlIEhUTUwgZmlsZW5hbWUgaXMgdXNlZC5cbiAgICBjb25zdCBjb21wb25lbnRTZiA9IG1hcHBpbmcuY29tcG9uZW50Q2xhc3MuZ2V0U291cmNlRmlsZSgpO1xuICAgIGNvbnN0IGNvbXBvbmVudE5hbWUgPSBtYXBwaW5nLmNvbXBvbmVudENsYXNzLm5hbWUudGV4dDtcbiAgICAvLyBUT0RPKGFseGh1Yik6IHJlbW92ZSBjYXN0IHdoZW4gVFMgaW4gZzMgc3VwcG9ydHMgdGhpcyBuYXJyb3dpbmcuXG4gICAgY29uc3QgZmlsZU5hbWUgPSBtYXBwaW5nLnR5cGUgPT09ICdpbmRpcmVjdCcgP1xuICAgICAgICBgJHtjb21wb25lbnRTZi5maWxlTmFtZX0gKCR7Y29tcG9uZW50TmFtZX0gdGVtcGxhdGUpYCA6XG4gICAgICAgIChtYXBwaW5nIGFzIEV4dGVybmFsVGVtcGxhdGVTb3VyY2VNYXBwaW5nKS50ZW1wbGF0ZVVybDtcbiAgICAvLyBUT0RPKGFseGh1Yik6IGludmVzdGlnYXRlIGNyZWF0aW5nIGEgZmFrZSBgdHMuU291cmNlRmlsZWAgaGVyZSBpbnN0ZWFkIG9mIGludm9raW5nIHRoZSBUU1xuICAgIC8vIHBhcnNlciBhZ2FpbnN0IHRoZSB0ZW1wbGF0ZSAoSFRNTCBpcyBqdXN0IHJlYWxseSBzeW50YWN0aWNhbGx5IGludmFsaWQgVHlwZVNjcmlwdCBjb2RlIDspLlxuICAgIC8vIEFsc28gaW52ZXN0aWdhdGUgY2FjaGluZyB0aGUgZmlsZSB0byBhdm9pZCBydW5uaW5nIHRoZSBwYXJzZXIgbXVsdGlwbGUgdGltZXMuXG4gICAgY29uc3Qgc2YgPSB0cy5jcmVhdGVTb3VyY2VGaWxlKFxuICAgICAgICBmaWxlTmFtZSwgbWFwcGluZy50ZW1wbGF0ZSwgdHMuU2NyaXB0VGFyZ2V0LkxhdGVzdCwgZmFsc2UsIHRzLlNjcmlwdEtpbmQuSlNYKTtcblxuICAgIGxldCByZWxhdGVkSW5mb3JtYXRpb246IHRzLkRpYWdub3N0aWNSZWxhdGVkSW5mb3JtYXRpb25bXSA9IFtdO1xuICAgIGlmIChyZWxhdGVkTWVzc2FnZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZWxhdGVkSW5mb3JtYXRpb24ucHVzaCh7XG4gICAgICAgIGNhdGVnb3J5OiB0cy5EaWFnbm9zdGljQ2F0ZWdvcnkuTWVzc2FnZSxcbiAgICAgICAgY29kZTogMCxcbiAgICAgICAgZmlsZTogc2YsXG4gICAgICAgIHN0YXJ0OiByZWxhdGVkTWVzc2FnZS5zcGFuLnN0YXJ0Lm9mZnNldCxcbiAgICAgICAgbGVuZ3RoOiByZWxhdGVkTWVzc2FnZS5zcGFuLmVuZC5vZmZzZXQgLSByZWxhdGVkTWVzc2FnZS5zcGFuLnN0YXJ0Lm9mZnNldCxcbiAgICAgICAgbWVzc2FnZVRleHQ6IHJlbGF0ZWRNZXNzYWdlLnRleHQsXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZWxhdGVkSW5mb3JtYXRpb24ucHVzaCh7XG4gICAgICBjYXRlZ29yeTogdHMuRGlhZ25vc3RpY0NhdGVnb3J5Lk1lc3NhZ2UsXG4gICAgICBjb2RlOiAwLFxuICAgICAgZmlsZTogY29tcG9uZW50U2YsXG4gICAgICAvLyBtYXBwaW5nLm5vZGUgcmVwcmVzZW50cyBlaXRoZXIgdGhlICd0ZW1wbGF0ZScgb3IgJ3RlbXBsYXRlVXJsJyBleHByZXNzaW9uLiBnZXRTdGFydCgpXG4gICAgICAvLyBhbmQgZ2V0RW5kKCkgYXJlIHVzZWQgYmVjYXVzZSB0aGV5IGRvbid0IGluY2x1ZGUgc3Vycm91bmRpbmcgd2hpdGVzcGFjZS5cbiAgICAgIHN0YXJ0OiBtYXBwaW5nLm5vZGUuZ2V0U3RhcnQoKSxcbiAgICAgIGxlbmd0aDogbWFwcGluZy5ub2RlLmdldEVuZCgpIC0gbWFwcGluZy5ub2RlLmdldFN0YXJ0KCksXG4gICAgICBtZXNzYWdlVGV4dDogYEVycm9yIG9jY3VycyBpbiB0aGUgdGVtcGxhdGUgb2YgY29tcG9uZW50ICR7Y29tcG9uZW50TmFtZX0uYCxcbiAgICB9KTtcblxuICAgIHJldHVybiB7XG4gICAgICBzb3VyY2U6ICduZ3RzYycsXG4gICAgICBjYXRlZ29yeSxcbiAgICAgIGNvZGUsXG4gICAgICBtZXNzYWdlVGV4dCxcbiAgICAgIGZpbGU6IHNmLFxuICAgICAgY29tcG9uZW50RmlsZTogY29tcG9uZW50U2YsXG4gICAgICB0ZW1wbGF0ZUlkLFxuICAgICAgc3RhcnQ6IHNwYW4uc3RhcnQub2Zmc2V0LFxuICAgICAgbGVuZ3RoOiBzcGFuLmVuZC5vZmZzZXQgLSBzcGFuLnN0YXJ0Lm9mZnNldCxcbiAgICAgIC8vIFNob3cgYSBzZWNvbmRhcnkgbWVzc2FnZSBpbmRpY2F0aW5nIHRoZSBjb21wb25lbnQgd2hvc2UgdGVtcGxhdGUgY29udGFpbnMgdGhlIGVycm9yLlxuICAgICAgcmVsYXRlZEluZm9ybWF0aW9uLFxuICAgIH07XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBVbmV4cGVjdGVkIHNvdXJjZSBtYXBwaW5nIHR5cGU6ICR7KG1hcHBpbmcgYXMge3R5cGU6IHN0cmluZ30pLnR5cGV9YCk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzVGVtcGxhdGVEaWFnbm9zdGljKGRpYWdub3N0aWM6IHRzLkRpYWdub3N0aWMpOiBkaWFnbm9zdGljIGlzIFRlbXBsYXRlRGlhZ25vc3RpYyB7XG4gIHJldHVybiBkaWFnbm9zdGljLmhhc093blByb3BlcnR5KCdjb21wb25lbnRGaWxlJykgJiZcbiAgICAgIHRzLmlzU291cmNlRmlsZSgoZGlhZ25vc3RpYyBhcyBhbnkpLmNvbXBvbmVudEZpbGUpO1xufVxuIl19