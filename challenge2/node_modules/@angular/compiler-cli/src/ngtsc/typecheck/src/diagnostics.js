(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/src/ngtsc/typecheck/src/diagnostics", ["require", "exports", "@angular/compiler", "typescript", "@angular/compiler-cli/src/ngtsc/typecheck/diagnostics", "@angular/compiler-cli/src/ngtsc/typecheck/src/tcb_util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.translateDiagnostic = exports.shouldReportDiagnostic = exports.addTemplateId = exports.addParseSpanInfo = exports.wrapForTypeChecker = exports.wrapForDiagnostics = void 0;
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var compiler_1 = require("@angular/compiler");
    var ts = require("typescript");
    var diagnostics_1 = require("@angular/compiler-cli/src/ngtsc/typecheck/diagnostics");
    var tcb_util_1 = require("@angular/compiler-cli/src/ngtsc/typecheck/src/tcb_util");
    /**
     * Wraps the node in parenthesis such that inserted span comments become attached to the proper
     * node. This is an alias for `ts.createParen` with the benefit that it signifies that the
     * inserted parenthesis are for diagnostic purposes, not for correctness of the rendered TCB code.
     *
     * Note that it is important that nodes and its attached comment are not wrapped into parenthesis
     * by default, as it prevents correct translation of e.g. diagnostics produced for incorrect method
     * arguments. Such diagnostics would then be produced for the parenthesised node whereas the
     * positional comment would be located within that node, resulting in a mismatch.
     */
    function wrapForDiagnostics(expr) {
        return ts.createParen(expr);
    }
    exports.wrapForDiagnostics = wrapForDiagnostics;
    /**
     * Wraps the node in parenthesis such that inserted span comments become attached to the proper
     * node. This is an alias for `ts.createParen` with the benefit that it signifies that the
     * inserted parenthesis are for use by the type checker, not for correctness of the rendered TCB
     * code.
     */
    function wrapForTypeChecker(expr) {
        return ts.createParen(expr);
    }
    exports.wrapForTypeChecker = wrapForTypeChecker;
    /**
     * Adds a synthetic comment to the expression that represents the parse span of the provided node.
     * This comment can later be retrieved as trivia of a node to recover original source locations.
     */
    function addParseSpanInfo(node, span) {
        var commentText;
        if (span instanceof compiler_1.AbsoluteSourceSpan) {
            commentText = span.start + "," + span.end;
        }
        else {
            commentText = span.start.offset + "," + span.end.offset;
        }
        ts.addSyntheticTrailingComment(node, ts.SyntaxKind.MultiLineCommentTrivia, commentText, /* hasTrailingNewLine */ false);
    }
    exports.addParseSpanInfo = addParseSpanInfo;
    /**
     * Adds a synthetic comment to the function declaration that contains the template id
     * of the class declaration.
     */
    function addTemplateId(tcb, id) {
        ts.addSyntheticLeadingComment(tcb, ts.SyntaxKind.MultiLineCommentTrivia, id, true);
    }
    exports.addTemplateId = addTemplateId;
    /**
     * Determines if the diagnostic should be reported. Some diagnostics are produced because of the
     * way TCBs are generated; those diagnostics should not be reported as type check errors of the
     * template.
     */
    function shouldReportDiagnostic(diagnostic) {
        var code = diagnostic.code;
        if (code === 6133 /* $var is declared but its value is never read. */) {
            return false;
        }
        else if (code === 6199 /* All variables are unused. */) {
            return false;
        }
        else if (code === 2695 /* Left side of comma operator is unused and has no side effects. */) {
            return false;
        }
        else if (code === 7006 /* Parameter '$event' implicitly has an 'any' type. */) {
            return false;
        }
        return true;
    }
    exports.shouldReportDiagnostic = shouldReportDiagnostic;
    /**
     * Attempts to translate a TypeScript diagnostic produced during template type-checking to their
     * location of origin, based on the comments that are emitted in the TCB code.
     *
     * If the diagnostic could not be translated, `null` is returned to indicate that the diagnostic
     * should not be reported at all. This prevents diagnostics from non-TCB code in a user's source
     * file from being reported as type-check errors.
     */
    function translateDiagnostic(diagnostic, resolver) {
        if (diagnostic.file === undefined || diagnostic.start === undefined) {
            return null;
        }
        var fullMapping = tcb_util_1.getTemplateMapping(diagnostic.file, diagnostic.start, resolver, /*isDiagnosticsRequest*/ true);
        if (fullMapping === null) {
            return null;
        }
        var sourceLocation = fullMapping.sourceLocation, templateSourceMapping = fullMapping.templateSourceMapping, span = fullMapping.span;
        return diagnostics_1.makeTemplateDiagnostic(sourceLocation.id, templateSourceMapping, span, diagnostic.category, diagnostic.code, diagnostic.messageText);
    }
    exports.translateDiagnostic = translateDiagnostic;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhZ25vc3RpY3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL3R5cGVjaGVjay9zcmMvZGlhZ25vc3RpY3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0lBQUE7Ozs7OztPQU1HO0lBQ0gsOENBQXNFO0lBQ3RFLCtCQUFpQztJQUVqQyxxRkFBMEU7SUFDMUUsbUZBQXNFO0lBR3RFOzs7Ozs7Ozs7T0FTRztJQUNILFNBQWdCLGtCQUFrQixDQUFDLElBQW1CO1FBQ3BELE9BQU8sRUFBRSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM5QixDQUFDO0lBRkQsZ0RBRUM7SUFFRDs7Ozs7T0FLRztJQUNILFNBQWdCLGtCQUFrQixDQUFDLElBQW1CO1FBQ3BELE9BQU8sRUFBRSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM5QixDQUFDO0lBRkQsZ0RBRUM7SUFFRDs7O09BR0c7SUFDSCxTQUFnQixnQkFBZ0IsQ0FBQyxJQUFhLEVBQUUsSUFBd0M7UUFDdEYsSUFBSSxXQUFtQixDQUFDO1FBQ3hCLElBQUksSUFBSSxZQUFZLDZCQUFrQixFQUFFO1lBQ3RDLFdBQVcsR0FBTSxJQUFJLENBQUMsS0FBSyxTQUFJLElBQUksQ0FBQyxHQUFLLENBQUM7U0FDM0M7YUFBTTtZQUNMLFdBQVcsR0FBTSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sU0FBSSxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQVEsQ0FBQztTQUN6RDtRQUNELEVBQUUsQ0FBQywyQkFBMkIsQ0FDMUIsSUFBSSxFQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUMsc0JBQXNCLEVBQUUsV0FBVyxFQUFFLHdCQUF3QixDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQy9GLENBQUM7SUFURCw0Q0FTQztJQUVEOzs7T0FHRztJQUNILFNBQWdCLGFBQWEsQ0FBQyxHQUEyQixFQUFFLEVBQWM7UUFDdkUsRUFBRSxDQUFDLDBCQUEwQixDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLHNCQUFzQixFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNyRixDQUFDO0lBRkQsc0NBRUM7SUFFRDs7OztPQUlHO0lBQ0gsU0FBZ0Isc0JBQXNCLENBQUMsVUFBeUI7UUFDdkQsSUFBQSxJQUFJLEdBQUksVUFBVSxLQUFkLENBQWU7UUFDMUIsSUFBSSxJQUFJLEtBQUssSUFBSSxDQUFDLG1EQUFtRCxFQUFFO1lBQ3JFLE9BQU8sS0FBSyxDQUFDO1NBQ2Q7YUFBTSxJQUFJLElBQUksS0FBSyxJQUFJLENBQUMsK0JBQStCLEVBQUU7WUFDeEQsT0FBTyxLQUFLLENBQUM7U0FDZDthQUFNLElBQUksSUFBSSxLQUFLLElBQUksQ0FBQyxvRUFBb0UsRUFBRTtZQUM3RixPQUFPLEtBQUssQ0FBQztTQUNkO2FBQU0sSUFBSSxJQUFJLEtBQUssSUFBSSxDQUFDLHNEQUFzRCxFQUFFO1lBQy9FLE9BQU8sS0FBSyxDQUFDO1NBQ2Q7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFaRCx3REFZQztJQUVEOzs7Ozs7O09BT0c7SUFDSCxTQUFnQixtQkFBbUIsQ0FDL0IsVUFBeUIsRUFBRSxRQUFnQztRQUM3RCxJQUFJLFVBQVUsQ0FBQyxJQUFJLEtBQUssU0FBUyxJQUFJLFVBQVUsQ0FBQyxLQUFLLEtBQUssU0FBUyxFQUFFO1lBQ25FLE9BQU8sSUFBSSxDQUFDO1NBQ2I7UUFDRCxJQUFNLFdBQVcsR0FBRyw2QkFBa0IsQ0FDbEMsVUFBVSxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNoRixJQUFJLFdBQVcsS0FBSyxJQUFJLEVBQUU7WUFDeEIsT0FBTyxJQUFJLENBQUM7U0FDYjtRQUVNLElBQUEsY0FBYyxHQUFpQyxXQUFXLGVBQTVDLEVBQUUscUJBQXFCLEdBQVUsV0FBVyxzQkFBckIsRUFBRSxJQUFJLEdBQUksV0FBVyxLQUFmLENBQWdCO1FBQ2xFLE9BQU8sb0NBQXNCLENBQ3pCLGNBQWMsQ0FBQyxFQUFFLEVBQUUscUJBQXFCLEVBQUUsSUFBSSxFQUFFLFVBQVUsQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLElBQUksRUFDcEYsVUFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQzlCLENBQUM7SUFmRCxrREFlQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtBYnNvbHV0ZVNvdXJjZVNwYW4sIFBhcnNlU291cmNlU3Bhbn0gZnJvbSAnQGFuZ3VsYXIvY29tcGlsZXInO1xuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5pbXBvcnQge1RlbXBsYXRlSWR9IGZyb20gJy4uL2FwaSc7XG5pbXBvcnQge21ha2VUZW1wbGF0ZURpYWdub3N0aWMsIFRlbXBsYXRlRGlhZ25vc3RpY30gZnJvbSAnLi4vZGlhZ25vc3RpY3MnO1xuaW1wb3J0IHtnZXRUZW1wbGF0ZU1hcHBpbmcsIFRlbXBsYXRlU291cmNlUmVzb2x2ZXJ9IGZyb20gJy4vdGNiX3V0aWwnO1xuXG5cbi8qKlxuICogV3JhcHMgdGhlIG5vZGUgaW4gcGFyZW50aGVzaXMgc3VjaCB0aGF0IGluc2VydGVkIHNwYW4gY29tbWVudHMgYmVjb21lIGF0dGFjaGVkIHRvIHRoZSBwcm9wZXJcbiAqIG5vZGUuIFRoaXMgaXMgYW4gYWxpYXMgZm9yIGB0cy5jcmVhdGVQYXJlbmAgd2l0aCB0aGUgYmVuZWZpdCB0aGF0IGl0IHNpZ25pZmllcyB0aGF0IHRoZVxuICogaW5zZXJ0ZWQgcGFyZW50aGVzaXMgYXJlIGZvciBkaWFnbm9zdGljIHB1cnBvc2VzLCBub3QgZm9yIGNvcnJlY3RuZXNzIG9mIHRoZSByZW5kZXJlZCBUQ0IgY29kZS5cbiAqXG4gKiBOb3RlIHRoYXQgaXQgaXMgaW1wb3J0YW50IHRoYXQgbm9kZXMgYW5kIGl0cyBhdHRhY2hlZCBjb21tZW50IGFyZSBub3Qgd3JhcHBlZCBpbnRvIHBhcmVudGhlc2lzXG4gKiBieSBkZWZhdWx0LCBhcyBpdCBwcmV2ZW50cyBjb3JyZWN0IHRyYW5zbGF0aW9uIG9mIGUuZy4gZGlhZ25vc3RpY3MgcHJvZHVjZWQgZm9yIGluY29ycmVjdCBtZXRob2RcbiAqIGFyZ3VtZW50cy4gU3VjaCBkaWFnbm9zdGljcyB3b3VsZCB0aGVuIGJlIHByb2R1Y2VkIGZvciB0aGUgcGFyZW50aGVzaXNlZCBub2RlIHdoZXJlYXMgdGhlXG4gKiBwb3NpdGlvbmFsIGNvbW1lbnQgd291bGQgYmUgbG9jYXRlZCB3aXRoaW4gdGhhdCBub2RlLCByZXN1bHRpbmcgaW4gYSBtaXNtYXRjaC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHdyYXBGb3JEaWFnbm9zdGljcyhleHByOiB0cy5FeHByZXNzaW9uKTogdHMuRXhwcmVzc2lvbiB7XG4gIHJldHVybiB0cy5jcmVhdGVQYXJlbihleHByKTtcbn1cblxuLyoqXG4gKiBXcmFwcyB0aGUgbm9kZSBpbiBwYXJlbnRoZXNpcyBzdWNoIHRoYXQgaW5zZXJ0ZWQgc3BhbiBjb21tZW50cyBiZWNvbWUgYXR0YWNoZWQgdG8gdGhlIHByb3BlclxuICogbm9kZS4gVGhpcyBpcyBhbiBhbGlhcyBmb3IgYHRzLmNyZWF0ZVBhcmVuYCB3aXRoIHRoZSBiZW5lZml0IHRoYXQgaXQgc2lnbmlmaWVzIHRoYXQgdGhlXG4gKiBpbnNlcnRlZCBwYXJlbnRoZXNpcyBhcmUgZm9yIHVzZSBieSB0aGUgdHlwZSBjaGVja2VyLCBub3QgZm9yIGNvcnJlY3RuZXNzIG9mIHRoZSByZW5kZXJlZCBUQ0JcbiAqIGNvZGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB3cmFwRm9yVHlwZUNoZWNrZXIoZXhwcjogdHMuRXhwcmVzc2lvbik6IHRzLkV4cHJlc3Npb24ge1xuICByZXR1cm4gdHMuY3JlYXRlUGFyZW4oZXhwcik7XG59XG5cbi8qKlxuICogQWRkcyBhIHN5bnRoZXRpYyBjb21tZW50IHRvIHRoZSBleHByZXNzaW9uIHRoYXQgcmVwcmVzZW50cyB0aGUgcGFyc2Ugc3BhbiBvZiB0aGUgcHJvdmlkZWQgbm9kZS5cbiAqIFRoaXMgY29tbWVudCBjYW4gbGF0ZXIgYmUgcmV0cmlldmVkIGFzIHRyaXZpYSBvZiBhIG5vZGUgdG8gcmVjb3ZlciBvcmlnaW5hbCBzb3VyY2UgbG9jYXRpb25zLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYWRkUGFyc2VTcGFuSW5mbyhub2RlOiB0cy5Ob2RlLCBzcGFuOiBBYnNvbHV0ZVNvdXJjZVNwYW58UGFyc2VTb3VyY2VTcGFuKTogdm9pZCB7XG4gIGxldCBjb21tZW50VGV4dDogc3RyaW5nO1xuICBpZiAoc3BhbiBpbnN0YW5jZW9mIEFic29sdXRlU291cmNlU3Bhbikge1xuICAgIGNvbW1lbnRUZXh0ID0gYCR7c3Bhbi5zdGFydH0sJHtzcGFuLmVuZH1gO1xuICB9IGVsc2Uge1xuICAgIGNvbW1lbnRUZXh0ID0gYCR7c3Bhbi5zdGFydC5vZmZzZXR9LCR7c3Bhbi5lbmQub2Zmc2V0fWA7XG4gIH1cbiAgdHMuYWRkU3ludGhldGljVHJhaWxpbmdDb21tZW50KFxuICAgICAgbm9kZSwgdHMuU3ludGF4S2luZC5NdWx0aUxpbmVDb21tZW50VHJpdmlhLCBjb21tZW50VGV4dCwgLyogaGFzVHJhaWxpbmdOZXdMaW5lICovIGZhbHNlKTtcbn1cblxuLyoqXG4gKiBBZGRzIGEgc3ludGhldGljIGNvbW1lbnQgdG8gdGhlIGZ1bmN0aW9uIGRlY2xhcmF0aW9uIHRoYXQgY29udGFpbnMgdGhlIHRlbXBsYXRlIGlkXG4gKiBvZiB0aGUgY2xhc3MgZGVjbGFyYXRpb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhZGRUZW1wbGF0ZUlkKHRjYjogdHMuRnVuY3Rpb25EZWNsYXJhdGlvbiwgaWQ6IFRlbXBsYXRlSWQpOiB2b2lkIHtcbiAgdHMuYWRkU3ludGhldGljTGVhZGluZ0NvbW1lbnQodGNiLCB0cy5TeW50YXhLaW5kLk11bHRpTGluZUNvbW1lbnRUcml2aWEsIGlkLCB0cnVlKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmVzIGlmIHRoZSBkaWFnbm9zdGljIHNob3VsZCBiZSByZXBvcnRlZC4gU29tZSBkaWFnbm9zdGljcyBhcmUgcHJvZHVjZWQgYmVjYXVzZSBvZiB0aGVcbiAqIHdheSBUQ0JzIGFyZSBnZW5lcmF0ZWQ7IHRob3NlIGRpYWdub3N0aWNzIHNob3VsZCBub3QgYmUgcmVwb3J0ZWQgYXMgdHlwZSBjaGVjayBlcnJvcnMgb2YgdGhlXG4gKiB0ZW1wbGF0ZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNob3VsZFJlcG9ydERpYWdub3N0aWMoZGlhZ25vc3RpYzogdHMuRGlhZ25vc3RpYyk6IGJvb2xlYW4ge1xuICBjb25zdCB7Y29kZX0gPSBkaWFnbm9zdGljO1xuICBpZiAoY29kZSA9PT0gNjEzMyAvKiAkdmFyIGlzIGRlY2xhcmVkIGJ1dCBpdHMgdmFsdWUgaXMgbmV2ZXIgcmVhZC4gKi8pIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH0gZWxzZSBpZiAoY29kZSA9PT0gNjE5OSAvKiBBbGwgdmFyaWFibGVzIGFyZSB1bnVzZWQuICovKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9IGVsc2UgaWYgKGNvZGUgPT09IDI2OTUgLyogTGVmdCBzaWRlIG9mIGNvbW1hIG9wZXJhdG9yIGlzIHVudXNlZCBhbmQgaGFzIG5vIHNpZGUgZWZmZWN0cy4gKi8pIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH0gZWxzZSBpZiAoY29kZSA9PT0gNzAwNiAvKiBQYXJhbWV0ZXIgJyRldmVudCcgaW1wbGljaXRseSBoYXMgYW4gJ2FueScgdHlwZS4gKi8pIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59XG5cbi8qKlxuICogQXR0ZW1wdHMgdG8gdHJhbnNsYXRlIGEgVHlwZVNjcmlwdCBkaWFnbm9zdGljIHByb2R1Y2VkIGR1cmluZyB0ZW1wbGF0ZSB0eXBlLWNoZWNraW5nIHRvIHRoZWlyXG4gKiBsb2NhdGlvbiBvZiBvcmlnaW4sIGJhc2VkIG9uIHRoZSBjb21tZW50cyB0aGF0IGFyZSBlbWl0dGVkIGluIHRoZSBUQ0IgY29kZS5cbiAqXG4gKiBJZiB0aGUgZGlhZ25vc3RpYyBjb3VsZCBub3QgYmUgdHJhbnNsYXRlZCwgYG51bGxgIGlzIHJldHVybmVkIHRvIGluZGljYXRlIHRoYXQgdGhlIGRpYWdub3N0aWNcbiAqIHNob3VsZCBub3QgYmUgcmVwb3J0ZWQgYXQgYWxsLiBUaGlzIHByZXZlbnRzIGRpYWdub3N0aWNzIGZyb20gbm9uLVRDQiBjb2RlIGluIGEgdXNlcidzIHNvdXJjZVxuICogZmlsZSBmcm9tIGJlaW5nIHJlcG9ydGVkIGFzIHR5cGUtY2hlY2sgZXJyb3JzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNsYXRlRGlhZ25vc3RpYyhcbiAgICBkaWFnbm9zdGljOiB0cy5EaWFnbm9zdGljLCByZXNvbHZlcjogVGVtcGxhdGVTb3VyY2VSZXNvbHZlcik6IFRlbXBsYXRlRGlhZ25vc3RpY3xudWxsIHtcbiAgaWYgKGRpYWdub3N0aWMuZmlsZSA9PT0gdW5kZWZpbmVkIHx8IGRpYWdub3N0aWMuc3RhcnQgPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGNvbnN0IGZ1bGxNYXBwaW5nID0gZ2V0VGVtcGxhdGVNYXBwaW5nKFxuICAgICAgZGlhZ25vc3RpYy5maWxlLCBkaWFnbm9zdGljLnN0YXJ0LCByZXNvbHZlciwgLyppc0RpYWdub3N0aWNzUmVxdWVzdCovIHRydWUpO1xuICBpZiAoZnVsbE1hcHBpbmcgPT09IG51bGwpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGNvbnN0IHtzb3VyY2VMb2NhdGlvbiwgdGVtcGxhdGVTb3VyY2VNYXBwaW5nLCBzcGFufSA9IGZ1bGxNYXBwaW5nO1xuICByZXR1cm4gbWFrZVRlbXBsYXRlRGlhZ25vc3RpYyhcbiAgICAgIHNvdXJjZUxvY2F0aW9uLmlkLCB0ZW1wbGF0ZVNvdXJjZU1hcHBpbmcsIHNwYW4sIGRpYWdub3N0aWMuY2F0ZWdvcnksIGRpYWdub3N0aWMuY29kZSxcbiAgICAgIGRpYWdub3N0aWMubWVzc2FnZVRleHQpO1xufVxuIl19