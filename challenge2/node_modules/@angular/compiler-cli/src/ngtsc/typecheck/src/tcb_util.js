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
        define("@angular/compiler-cli/src/ngtsc/typecheck/src/tcb_util", ["require", "exports", "tslib", "typescript", "@angular/compiler-cli/src/ngtsc/util/src/typescript", "@angular/compiler-cli/src/ngtsc/typecheck/src/comments", "@angular/compiler-cli/src/ngtsc/typecheck/src/ts_util", "@angular/compiler-cli/src/ngtsc/typecheck/src/type_parameter_emitter"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.checkIfGenericTypeBoundsAreContextFree = exports.findSourceLocation = exports.findTypeCheckBlock = exports.getTemplateMapping = exports.requiresInlineTypeCheckBlock = exports.TcbInliningRequirement = void 0;
    var tslib_1 = require("tslib");
    var ts = require("typescript");
    var typescript_1 = require("@angular/compiler-cli/src/ngtsc/util/src/typescript");
    var comments_1 = require("@angular/compiler-cli/src/ngtsc/typecheck/src/comments");
    var ts_util_1 = require("@angular/compiler-cli/src/ngtsc/typecheck/src/ts_util");
    var type_parameter_emitter_1 = require("@angular/compiler-cli/src/ngtsc/typecheck/src/type_parameter_emitter");
    /**
     * Indicates whether a particular component requires an inline type check block.
     *
     * This is not a boolean state as inlining might only be required to get the best possible
     * type-checking, but the component could theoretically still be checked without it.
     */
    var TcbInliningRequirement;
    (function (TcbInliningRequirement) {
        /**
         * There is no way to type check this component without inlining.
         */
        TcbInliningRequirement[TcbInliningRequirement["MustInline"] = 0] = "MustInline";
        /**
         * Inlining should be used due to the component's generic bounds, but a non-inlining fallback
         * method can be used if that's not possible.
         */
        TcbInliningRequirement[TcbInliningRequirement["ShouldInlineForGenericBounds"] = 1] = "ShouldInlineForGenericBounds";
        /**
         * There is no requirement for this component's TCB to be inlined.
         */
        TcbInliningRequirement[TcbInliningRequirement["None"] = 2] = "None";
    })(TcbInliningRequirement = exports.TcbInliningRequirement || (exports.TcbInliningRequirement = {}));
    function requiresInlineTypeCheckBlock(node, usedPipes, reflector) {
        // In order to qualify for a declared TCB (not inline) two conditions must be met:
        // 1) the class must be exported
        // 2) it must not have contextual generic type bounds
        if (!ts_util_1.checkIfClassIsExported(node)) {
            // Condition 1 is false, the class is not exported.
            return TcbInliningRequirement.MustInline;
        }
        else if (!checkIfGenericTypeBoundsAreContextFree(node, reflector)) {
            // Condition 2 is false, the class has constrained generic types. It should be checked with an
            // inline TCB if possible, but can potentially use fallbacks to avoid inlining if not.
            return TcbInliningRequirement.ShouldInlineForGenericBounds;
        }
        else if (Array.from(usedPipes.values())
            .some(function (pipeRef) { return !ts_util_1.checkIfClassIsExported(pipeRef.node); })) {
            // If one of the pipes used by the component is not exported, a non-inline TCB will not be able
            // to import it, so this requires an inline TCB.
            return TcbInliningRequirement.MustInline;
        }
        else {
            return TcbInliningRequirement.None;
        }
    }
    exports.requiresInlineTypeCheckBlock = requiresInlineTypeCheckBlock;
    /** Maps a shim position back to a template location. */
    function getTemplateMapping(shimSf, position, resolver, isDiagnosticRequest) {
        var node = typescript_1.getTokenAtPosition(shimSf, position);
        var sourceLocation = findSourceLocation(node, shimSf, isDiagnosticRequest);
        if (sourceLocation === null) {
            return null;
        }
        var mapping = resolver.getSourceMapping(sourceLocation.id);
        var span = resolver.toParseSourceSpan(sourceLocation.id, sourceLocation.span);
        if (span === null) {
            return null;
        }
        // TODO(atscott): Consider adding a context span by walking up from `node` until we get a
        // different span.
        return { sourceLocation: sourceLocation, templateSourceMapping: mapping, span: span };
    }
    exports.getTemplateMapping = getTemplateMapping;
    function findTypeCheckBlock(file, id, isDiagnosticRequest) {
        var e_1, _a;
        try {
            for (var _b = tslib_1.__values(file.statements), _c = _b.next(); !_c.done; _c = _b.next()) {
                var stmt = _c.value;
                if (ts.isFunctionDeclaration(stmt) && getTemplateId(stmt, file, isDiagnosticRequest) === id) {
                    return stmt;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return null;
    }
    exports.findTypeCheckBlock = findTypeCheckBlock;
    /**
     * Traverses up the AST starting from the given node to extract the source location from comments
     * that have been emitted into the TCB. If the node does not exist within a TCB, or if an ignore
     * marker comment is found up the tree (and this is part of a diagnostic request), this function
     * returns null.
     */
    function findSourceLocation(node, sourceFile, isDiagnosticsRequest) {
        // Search for comments until the TCB's function declaration is encountered.
        while (node !== undefined && !ts.isFunctionDeclaration(node)) {
            if (comments_1.hasIgnoreForDiagnosticsMarker(node, sourceFile) && isDiagnosticsRequest) {
                // There's an ignore marker on this node, so the diagnostic should not be reported.
                return null;
            }
            var span = comments_1.readSpanComment(node, sourceFile);
            if (span !== null) {
                // Once the positional information has been extracted, search further up the TCB to extract
                // the unique id that is attached with the TCB's function declaration.
                var id = getTemplateId(node, sourceFile, isDiagnosticsRequest);
                if (id === null) {
                    return null;
                }
                return { id: id, span: span };
            }
            node = node.parent;
        }
        return null;
    }
    exports.findSourceLocation = findSourceLocation;
    function getTemplateId(node, sourceFile, isDiagnosticRequest) {
        // Walk up to the function declaration of the TCB, the file information is attached there.
        while (!ts.isFunctionDeclaration(node)) {
            if (comments_1.hasIgnoreForDiagnosticsMarker(node, sourceFile) && isDiagnosticRequest) {
                // There's an ignore marker on this node, so the diagnostic should not be reported.
                return null;
            }
            node = node.parent;
            // Bail once we have reached the root.
            if (node === undefined) {
                return null;
            }
        }
        var start = node.getFullStart();
        return ts.forEachLeadingCommentRange(sourceFile.text, start, function (pos, end, kind) {
            if (kind !== ts.SyntaxKind.MultiLineCommentTrivia) {
                return null;
            }
            var commentText = sourceFile.text.substring(pos + 2, end - 2);
            return commentText;
        }) || null;
    }
    function checkIfGenericTypeBoundsAreContextFree(node, reflector) {
        // Generic type parameters are considered context free if they can be emitted into any context.
        return new type_parameter_emitter_1.TypeParameterEmitter(node.typeParameters, reflector).canEmit();
    }
    exports.checkIfGenericTypeBoundsAreContextFree = checkIfGenericTypeBoundsAreContextFree;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGNiX3V0aWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL3R5cGVjaGVjay9zcmMvdGNiX3V0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUlILCtCQUFpQztJQUdqQyxrRkFBNkQ7SUFHN0QsbUZBQTBFO0lBQzFFLGlGQUFnRjtJQUNoRiwrR0FBOEQ7SUF1QjlEOzs7OztPQUtHO0lBQ0gsSUFBWSxzQkFnQlg7SUFoQkQsV0FBWSxzQkFBc0I7UUFDaEM7O1dBRUc7UUFDSCwrRUFBVSxDQUFBO1FBRVY7OztXQUdHO1FBQ0gsbUhBQTRCLENBQUE7UUFFNUI7O1dBRUc7UUFDSCxtRUFBSSxDQUFBO0lBQ04sQ0FBQyxFQWhCVyxzQkFBc0IsR0FBdEIsOEJBQXNCLEtBQXRCLDhCQUFzQixRQWdCakM7SUFFRCxTQUFnQiw0QkFBNEIsQ0FDeEMsSUFBMkMsRUFDM0MsU0FBd0UsRUFDeEUsU0FBeUI7UUFDM0Isa0ZBQWtGO1FBQ2xGLGdDQUFnQztRQUNoQyxxREFBcUQ7UUFDckQsSUFBSSxDQUFDLGdDQUFzQixDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ2pDLG1EQUFtRDtZQUNuRCxPQUFPLHNCQUFzQixDQUFDLFVBQVUsQ0FBQztTQUMxQzthQUFNLElBQUksQ0FBQyxzQ0FBc0MsQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLEVBQUU7WUFDbkUsOEZBQThGO1lBQzlGLHNGQUFzRjtZQUN0RixPQUFPLHNCQUFzQixDQUFDLDRCQUE0QixDQUFDO1NBQzVEO2FBQU0sSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQzthQUN6QixJQUFJLENBQUMsVUFBQSxPQUFPLElBQUksT0FBQSxDQUFDLGdDQUFzQixDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBckMsQ0FBcUMsQ0FBQyxFQUFFO1lBQ3RFLCtGQUErRjtZQUMvRixnREFBZ0Q7WUFDaEQsT0FBTyxzQkFBc0IsQ0FBQyxVQUFVLENBQUM7U0FDMUM7YUFBTTtZQUNMLE9BQU8sc0JBQXNCLENBQUMsSUFBSSxDQUFDO1NBQ3BDO0lBQ0gsQ0FBQztJQXRCRCxvRUFzQkM7SUFFRCx3REFBd0Q7SUFDeEQsU0FBZ0Isa0JBQWtCLENBQzlCLE1BQXFCLEVBQUUsUUFBZ0IsRUFBRSxRQUFnQyxFQUN6RSxtQkFBNEI7UUFDOUIsSUFBTSxJQUFJLEdBQUcsK0JBQWtCLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ2xELElBQU0sY0FBYyxHQUFHLGtCQUFrQixDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztRQUM3RSxJQUFJLGNBQWMsS0FBSyxJQUFJLEVBQUU7WUFDM0IsT0FBTyxJQUFJLENBQUM7U0FDYjtRQUVELElBQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxjQUFjLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDN0QsSUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLGlCQUFpQixDQUFDLGNBQWMsQ0FBQyxFQUFFLEVBQUUsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2hGLElBQUksSUFBSSxLQUFLLElBQUksRUFBRTtZQUNqQixPQUFPLElBQUksQ0FBQztTQUNiO1FBQ0QseUZBQXlGO1FBQ3pGLGtCQUFrQjtRQUNsQixPQUFPLEVBQUMsY0FBYyxnQkFBQSxFQUFFLHFCQUFxQixFQUFFLE9BQU8sRUFBRSxJQUFJLE1BQUEsRUFBQyxDQUFDO0lBQ2hFLENBQUM7SUFqQkQsZ0RBaUJDO0lBRUQsU0FBZ0Isa0JBQWtCLENBQzlCLElBQW1CLEVBQUUsRUFBYyxFQUFFLG1CQUE0Qjs7O1lBQ25FLEtBQW1CLElBQUEsS0FBQSxpQkFBQSxJQUFJLENBQUMsVUFBVSxDQUFBLGdCQUFBLDRCQUFFO2dCQUEvQixJQUFNLElBQUksV0FBQTtnQkFDYixJQUFJLEVBQUUsQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxhQUFhLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxtQkFBbUIsQ0FBQyxLQUFLLEVBQUUsRUFBRTtvQkFDM0YsT0FBTyxJQUFJLENBQUM7aUJBQ2I7YUFDRjs7Ozs7Ozs7O1FBQ0QsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBUkQsZ0RBUUM7SUFFRDs7Ozs7T0FLRztJQUNILFNBQWdCLGtCQUFrQixDQUM5QixJQUFhLEVBQUUsVUFBeUIsRUFBRSxvQkFBNkI7UUFDekUsMkVBQTJFO1FBQzNFLE9BQU8sSUFBSSxLQUFLLFNBQVMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUM1RCxJQUFJLHdDQUE2QixDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsSUFBSSxvQkFBb0IsRUFBRTtnQkFDM0UsbUZBQW1GO2dCQUNuRixPQUFPLElBQUksQ0FBQzthQUNiO1lBRUQsSUFBTSxJQUFJLEdBQUcsMEJBQWUsQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDL0MsSUFBSSxJQUFJLEtBQUssSUFBSSxFQUFFO2dCQUNqQiwyRkFBMkY7Z0JBQzNGLHNFQUFzRTtnQkFDdEUsSUFBTSxFQUFFLEdBQUcsYUFBYSxDQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztnQkFDakUsSUFBSSxFQUFFLEtBQUssSUFBSSxFQUFFO29CQUNmLE9BQU8sSUFBSSxDQUFDO2lCQUNiO2dCQUNELE9BQU8sRUFBQyxFQUFFLElBQUEsRUFBRSxJQUFJLE1BQUEsRUFBQyxDQUFDO2FBQ25CO1lBRUQsSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7U0FDcEI7UUFFRCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUF4QkQsZ0RBd0JDO0lBRUQsU0FBUyxhQUFhLENBQ2xCLElBQWEsRUFBRSxVQUF5QixFQUFFLG1CQUE0QjtRQUN4RSwwRkFBMEY7UUFDMUYsT0FBTyxDQUFDLEVBQUUsQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUN0QyxJQUFJLHdDQUE2QixDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsSUFBSSxtQkFBbUIsRUFBRTtnQkFDMUUsbUZBQW1GO2dCQUNuRixPQUFPLElBQUksQ0FBQzthQUNiO1lBQ0QsSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7WUFFbkIsc0NBQXNDO1lBQ3RDLElBQUksSUFBSSxLQUFLLFNBQVMsRUFBRTtnQkFDdEIsT0FBTyxJQUFJLENBQUM7YUFDYjtTQUNGO1FBRUQsSUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ2xDLE9BQU8sRUFBRSxDQUFDLDBCQUEwQixDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLFVBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJO1lBQzFFLElBQUksSUFBSSxLQUFLLEVBQUUsQ0FBQyxVQUFVLENBQUMsc0JBQXNCLEVBQUU7Z0JBQ2pELE9BQU8sSUFBSSxDQUFDO2FBQ2I7WUFDRCxJQUFNLFdBQVcsR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNoRSxPQUFPLFdBQVcsQ0FBQztRQUNyQixDQUFDLENBQWUsSUFBSSxJQUFJLENBQUM7SUFDM0IsQ0FBQztJQUVELFNBQWdCLHNDQUFzQyxDQUNsRCxJQUEyQyxFQUFFLFNBQXlCO1FBQ3hFLCtGQUErRjtRQUMvRixPQUFPLElBQUksNkNBQW9CLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxTQUFTLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUM1RSxDQUFDO0lBSkQsd0ZBSUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtBYnNvbHV0ZVNvdXJjZVNwYW4sIFBhcnNlU291cmNlU3Bhbn0gZnJvbSAnQGFuZ3VsYXIvY29tcGlsZXInO1xuaW1wb3J0IHtDbGFzc0RlY2xhcmF0aW9uLCBSZWZsZWN0aW9uSG9zdH0gZnJvbSAnQGFuZ3VsYXIvY29tcGlsZXItY2xpL3NyYy9uZ3RzYy9yZWZsZWN0aW9uJztcbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuXG5pbXBvcnQge1JlZmVyZW5jZX0gZnJvbSAnLi4vLi4vaW1wb3J0cyc7XG5pbXBvcnQge2dldFRva2VuQXRQb3NpdGlvbn0gZnJvbSAnLi4vLi4vdXRpbC9zcmMvdHlwZXNjcmlwdCc7XG5pbXBvcnQge0Z1bGxUZW1wbGF0ZU1hcHBpbmcsIFNvdXJjZUxvY2F0aW9uLCBUZW1wbGF0ZUlkLCBUZW1wbGF0ZVNvdXJjZU1hcHBpbmd9IGZyb20gJy4uL2FwaSc7XG5cbmltcG9ydCB7aGFzSWdub3JlRm9yRGlhZ25vc3RpY3NNYXJrZXIsIHJlYWRTcGFuQ29tbWVudH0gZnJvbSAnLi9jb21tZW50cyc7XG5pbXBvcnQge2NoZWNrSWZDbGFzc0lzRXhwb3J0ZWQsIGNoZWNrSWZHZW5lcmljVHlwZXNBcmVVbmJvdW5kfSBmcm9tICcuL3RzX3V0aWwnO1xuaW1wb3J0IHtUeXBlUGFyYW1ldGVyRW1pdHRlcn0gZnJvbSAnLi90eXBlX3BhcmFtZXRlcl9lbWl0dGVyJztcblxuLyoqXG4gKiBBZGFwdGVyIGludGVyZmFjZSB3aGljaCBhbGxvd3MgdGhlIHRlbXBsYXRlIHR5cGUtY2hlY2tpbmcgZGlhZ25vc3RpY3MgY29kZSB0byBpbnRlcnByZXQgb2Zmc2V0c1xuICogaW4gYSBUQ0IgYW5kIG1hcCB0aGVtIGJhY2sgdG8gb3JpZ2luYWwgbG9jYXRpb25zIGluIHRoZSB0ZW1wbGF0ZS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBUZW1wbGF0ZVNvdXJjZVJlc29sdmVyIHtcbiAgZ2V0VGVtcGxhdGVJZChub2RlOiB0cy5DbGFzc0RlY2xhcmF0aW9uKTogVGVtcGxhdGVJZDtcblxuICAvKipcbiAgICogRm9yIHRoZSBnaXZlbiB0ZW1wbGF0ZSBpZCwgcmV0cmlldmUgdGhlIG9yaWdpbmFsIHNvdXJjZSBtYXBwaW5nIHdoaWNoIGRlc2NyaWJlcyBob3cgdGhlIG9mZnNldHNcbiAgICogaW4gdGhlIHRlbXBsYXRlIHNob3VsZCBiZSBpbnRlcnByZXRlZC5cbiAgICovXG4gIGdldFNvdXJjZU1hcHBpbmcoaWQ6IFRlbXBsYXRlSWQpOiBUZW1wbGF0ZVNvdXJjZU1hcHBpbmc7XG5cbiAgLyoqXG4gICAqIENvbnZlcnQgYW4gYWJzb2x1dGUgc291cmNlIHNwYW4gYXNzb2NpYXRlZCB3aXRoIHRoZSBnaXZlbiB0ZW1wbGF0ZSBpZCBpbnRvIGEgZnVsbFxuICAgKiBgUGFyc2VTb3VyY2VTcGFuYC4gVGhlIHJldHVybmVkIHBhcnNlIHNwYW4gaGFzIGxpbmUgYW5kIGNvbHVtbiBudW1iZXJzIGluIGFkZGl0aW9uIHRvIG9ubHlcbiAgICogYWJzb2x1dGUgb2Zmc2V0cyBhbmQgZ2l2ZXMgYWNjZXNzIHRvIHRoZSBvcmlnaW5hbCB0ZW1wbGF0ZSBzb3VyY2UuXG4gICAqL1xuICB0b1BhcnNlU291cmNlU3BhbihpZDogVGVtcGxhdGVJZCwgc3BhbjogQWJzb2x1dGVTb3VyY2VTcGFuKTogUGFyc2VTb3VyY2VTcGFufG51bGw7XG59XG5cbi8qKlxuICogSW5kaWNhdGVzIHdoZXRoZXIgYSBwYXJ0aWN1bGFyIGNvbXBvbmVudCByZXF1aXJlcyBhbiBpbmxpbmUgdHlwZSBjaGVjayBibG9jay5cbiAqXG4gKiBUaGlzIGlzIG5vdCBhIGJvb2xlYW4gc3RhdGUgYXMgaW5saW5pbmcgbWlnaHQgb25seSBiZSByZXF1aXJlZCB0byBnZXQgdGhlIGJlc3QgcG9zc2libGVcbiAqIHR5cGUtY2hlY2tpbmcsIGJ1dCB0aGUgY29tcG9uZW50IGNvdWxkIHRoZW9yZXRpY2FsbHkgc3RpbGwgYmUgY2hlY2tlZCB3aXRob3V0IGl0LlxuICovXG5leHBvcnQgZW51bSBUY2JJbmxpbmluZ1JlcXVpcmVtZW50IHtcbiAgLyoqXG4gICAqIFRoZXJlIGlzIG5vIHdheSB0byB0eXBlIGNoZWNrIHRoaXMgY29tcG9uZW50IHdpdGhvdXQgaW5saW5pbmcuXG4gICAqL1xuICBNdXN0SW5saW5lLFxuXG4gIC8qKlxuICAgKiBJbmxpbmluZyBzaG91bGQgYmUgdXNlZCBkdWUgdG8gdGhlIGNvbXBvbmVudCdzIGdlbmVyaWMgYm91bmRzLCBidXQgYSBub24taW5saW5pbmcgZmFsbGJhY2tcbiAgICogbWV0aG9kIGNhbiBiZSB1c2VkIGlmIHRoYXQncyBub3QgcG9zc2libGUuXG4gICAqL1xuICBTaG91bGRJbmxpbmVGb3JHZW5lcmljQm91bmRzLFxuXG4gIC8qKlxuICAgKiBUaGVyZSBpcyBubyByZXF1aXJlbWVudCBmb3IgdGhpcyBjb21wb25lbnQncyBUQ0IgdG8gYmUgaW5saW5lZC5cbiAgICovXG4gIE5vbmUsXG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXF1aXJlc0lubGluZVR5cGVDaGVja0Jsb2NrKFxuICAgIG5vZGU6IENsYXNzRGVjbGFyYXRpb248dHMuQ2xhc3NEZWNsYXJhdGlvbj4sXG4gICAgdXNlZFBpcGVzOiBNYXA8c3RyaW5nLCBSZWZlcmVuY2U8Q2xhc3NEZWNsYXJhdGlvbjx0cy5DbGFzc0RlY2xhcmF0aW9uPj4+LFxuICAgIHJlZmxlY3RvcjogUmVmbGVjdGlvbkhvc3QpOiBUY2JJbmxpbmluZ1JlcXVpcmVtZW50IHtcbiAgLy8gSW4gb3JkZXIgdG8gcXVhbGlmeSBmb3IgYSBkZWNsYXJlZCBUQ0IgKG5vdCBpbmxpbmUpIHR3byBjb25kaXRpb25zIG11c3QgYmUgbWV0OlxuICAvLyAxKSB0aGUgY2xhc3MgbXVzdCBiZSBleHBvcnRlZFxuICAvLyAyKSBpdCBtdXN0IG5vdCBoYXZlIGNvbnRleHR1YWwgZ2VuZXJpYyB0eXBlIGJvdW5kc1xuICBpZiAoIWNoZWNrSWZDbGFzc0lzRXhwb3J0ZWQobm9kZSkpIHtcbiAgICAvLyBDb25kaXRpb24gMSBpcyBmYWxzZSwgdGhlIGNsYXNzIGlzIG5vdCBleHBvcnRlZC5cbiAgICByZXR1cm4gVGNiSW5saW5pbmdSZXF1aXJlbWVudC5NdXN0SW5saW5lO1xuICB9IGVsc2UgaWYgKCFjaGVja0lmR2VuZXJpY1R5cGVCb3VuZHNBcmVDb250ZXh0RnJlZShub2RlLCByZWZsZWN0b3IpKSB7XG4gICAgLy8gQ29uZGl0aW9uIDIgaXMgZmFsc2UsIHRoZSBjbGFzcyBoYXMgY29uc3RyYWluZWQgZ2VuZXJpYyB0eXBlcy4gSXQgc2hvdWxkIGJlIGNoZWNrZWQgd2l0aCBhblxuICAgIC8vIGlubGluZSBUQ0IgaWYgcG9zc2libGUsIGJ1dCBjYW4gcG90ZW50aWFsbHkgdXNlIGZhbGxiYWNrcyB0byBhdm9pZCBpbmxpbmluZyBpZiBub3QuXG4gICAgcmV0dXJuIFRjYklubGluaW5nUmVxdWlyZW1lbnQuU2hvdWxkSW5saW5lRm9yR2VuZXJpY0JvdW5kcztcbiAgfSBlbHNlIGlmIChBcnJheS5mcm9tKHVzZWRQaXBlcy52YWx1ZXMoKSlcbiAgICAgICAgICAgICAgICAgLnNvbWUocGlwZVJlZiA9PiAhY2hlY2tJZkNsYXNzSXNFeHBvcnRlZChwaXBlUmVmLm5vZGUpKSkge1xuICAgIC8vIElmIG9uZSBvZiB0aGUgcGlwZXMgdXNlZCBieSB0aGUgY29tcG9uZW50IGlzIG5vdCBleHBvcnRlZCwgYSBub24taW5saW5lIFRDQiB3aWxsIG5vdCBiZSBhYmxlXG4gICAgLy8gdG8gaW1wb3J0IGl0LCBzbyB0aGlzIHJlcXVpcmVzIGFuIGlubGluZSBUQ0IuXG4gICAgcmV0dXJuIFRjYklubGluaW5nUmVxdWlyZW1lbnQuTXVzdElubGluZTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gVGNiSW5saW5pbmdSZXF1aXJlbWVudC5Ob25lO1xuICB9XG59XG5cbi8qKiBNYXBzIGEgc2hpbSBwb3NpdGlvbiBiYWNrIHRvIGEgdGVtcGxhdGUgbG9jYXRpb24uICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0VGVtcGxhdGVNYXBwaW5nKFxuICAgIHNoaW1TZjogdHMuU291cmNlRmlsZSwgcG9zaXRpb246IG51bWJlciwgcmVzb2x2ZXI6IFRlbXBsYXRlU291cmNlUmVzb2x2ZXIsXG4gICAgaXNEaWFnbm9zdGljUmVxdWVzdDogYm9vbGVhbik6IEZ1bGxUZW1wbGF0ZU1hcHBpbmd8bnVsbCB7XG4gIGNvbnN0IG5vZGUgPSBnZXRUb2tlbkF0UG9zaXRpb24oc2hpbVNmLCBwb3NpdGlvbik7XG4gIGNvbnN0IHNvdXJjZUxvY2F0aW9uID0gZmluZFNvdXJjZUxvY2F0aW9uKG5vZGUsIHNoaW1TZiwgaXNEaWFnbm9zdGljUmVxdWVzdCk7XG4gIGlmIChzb3VyY2VMb2NhdGlvbiA9PT0gbnVsbCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgY29uc3QgbWFwcGluZyA9IHJlc29sdmVyLmdldFNvdXJjZU1hcHBpbmcoc291cmNlTG9jYXRpb24uaWQpO1xuICBjb25zdCBzcGFuID0gcmVzb2x2ZXIudG9QYXJzZVNvdXJjZVNwYW4oc291cmNlTG9jYXRpb24uaWQsIHNvdXJjZUxvY2F0aW9uLnNwYW4pO1xuICBpZiAoc3BhbiA9PT0gbnVsbCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIC8vIFRPRE8oYXRzY290dCk6IENvbnNpZGVyIGFkZGluZyBhIGNvbnRleHQgc3BhbiBieSB3YWxraW5nIHVwIGZyb20gYG5vZGVgIHVudGlsIHdlIGdldCBhXG4gIC8vIGRpZmZlcmVudCBzcGFuLlxuICByZXR1cm4ge3NvdXJjZUxvY2F0aW9uLCB0ZW1wbGF0ZVNvdXJjZU1hcHBpbmc6IG1hcHBpbmcsIHNwYW59O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZmluZFR5cGVDaGVja0Jsb2NrKFxuICAgIGZpbGU6IHRzLlNvdXJjZUZpbGUsIGlkOiBUZW1wbGF0ZUlkLCBpc0RpYWdub3N0aWNSZXF1ZXN0OiBib29sZWFuKTogdHMuTm9kZXxudWxsIHtcbiAgZm9yIChjb25zdCBzdG10IG9mIGZpbGUuc3RhdGVtZW50cykge1xuICAgIGlmICh0cy5pc0Z1bmN0aW9uRGVjbGFyYXRpb24oc3RtdCkgJiYgZ2V0VGVtcGxhdGVJZChzdG10LCBmaWxlLCBpc0RpYWdub3N0aWNSZXF1ZXN0KSA9PT0gaWQpIHtcbiAgICAgIHJldHVybiBzdG10O1xuICAgIH1cbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cblxuLyoqXG4gKiBUcmF2ZXJzZXMgdXAgdGhlIEFTVCBzdGFydGluZyBmcm9tIHRoZSBnaXZlbiBub2RlIHRvIGV4dHJhY3QgdGhlIHNvdXJjZSBsb2NhdGlvbiBmcm9tIGNvbW1lbnRzXG4gKiB0aGF0IGhhdmUgYmVlbiBlbWl0dGVkIGludG8gdGhlIFRDQi4gSWYgdGhlIG5vZGUgZG9lcyBub3QgZXhpc3Qgd2l0aGluIGEgVENCLCBvciBpZiBhbiBpZ25vcmVcbiAqIG1hcmtlciBjb21tZW50IGlzIGZvdW5kIHVwIHRoZSB0cmVlIChhbmQgdGhpcyBpcyBwYXJ0IG9mIGEgZGlhZ25vc3RpYyByZXF1ZXN0KSwgdGhpcyBmdW5jdGlvblxuICogcmV0dXJucyBudWxsLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZmluZFNvdXJjZUxvY2F0aW9uKFxuICAgIG5vZGU6IHRzLk5vZGUsIHNvdXJjZUZpbGU6IHRzLlNvdXJjZUZpbGUsIGlzRGlhZ25vc3RpY3NSZXF1ZXN0OiBib29sZWFuKTogU291cmNlTG9jYXRpb258bnVsbCB7XG4gIC8vIFNlYXJjaCBmb3IgY29tbWVudHMgdW50aWwgdGhlIFRDQidzIGZ1bmN0aW9uIGRlY2xhcmF0aW9uIGlzIGVuY291bnRlcmVkLlxuICB3aGlsZSAobm9kZSAhPT0gdW5kZWZpbmVkICYmICF0cy5pc0Z1bmN0aW9uRGVjbGFyYXRpb24obm9kZSkpIHtcbiAgICBpZiAoaGFzSWdub3JlRm9yRGlhZ25vc3RpY3NNYXJrZXIobm9kZSwgc291cmNlRmlsZSkgJiYgaXNEaWFnbm9zdGljc1JlcXVlc3QpIHtcbiAgICAgIC8vIFRoZXJlJ3MgYW4gaWdub3JlIG1hcmtlciBvbiB0aGlzIG5vZGUsIHNvIHRoZSBkaWFnbm9zdGljIHNob3VsZCBub3QgYmUgcmVwb3J0ZWQuXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCBzcGFuID0gcmVhZFNwYW5Db21tZW50KG5vZGUsIHNvdXJjZUZpbGUpO1xuICAgIGlmIChzcGFuICE9PSBudWxsKSB7XG4gICAgICAvLyBPbmNlIHRoZSBwb3NpdGlvbmFsIGluZm9ybWF0aW9uIGhhcyBiZWVuIGV4dHJhY3RlZCwgc2VhcmNoIGZ1cnRoZXIgdXAgdGhlIFRDQiB0byBleHRyYWN0XG4gICAgICAvLyB0aGUgdW5pcXVlIGlkIHRoYXQgaXMgYXR0YWNoZWQgd2l0aCB0aGUgVENCJ3MgZnVuY3Rpb24gZGVjbGFyYXRpb24uXG4gICAgICBjb25zdCBpZCA9IGdldFRlbXBsYXRlSWQobm9kZSwgc291cmNlRmlsZSwgaXNEaWFnbm9zdGljc1JlcXVlc3QpO1xuICAgICAgaWYgKGlkID09PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHtpZCwgc3Bhbn07XG4gICAgfVxuXG4gICAgbm9kZSA9IG5vZGUucGFyZW50O1xuICB9XG5cbiAgcmV0dXJuIG51bGw7XG59XG5cbmZ1bmN0aW9uIGdldFRlbXBsYXRlSWQoXG4gICAgbm9kZTogdHMuTm9kZSwgc291cmNlRmlsZTogdHMuU291cmNlRmlsZSwgaXNEaWFnbm9zdGljUmVxdWVzdDogYm9vbGVhbik6IFRlbXBsYXRlSWR8bnVsbCB7XG4gIC8vIFdhbGsgdXAgdG8gdGhlIGZ1bmN0aW9uIGRlY2xhcmF0aW9uIG9mIHRoZSBUQ0IsIHRoZSBmaWxlIGluZm9ybWF0aW9uIGlzIGF0dGFjaGVkIHRoZXJlLlxuICB3aGlsZSAoIXRzLmlzRnVuY3Rpb25EZWNsYXJhdGlvbihub2RlKSkge1xuICAgIGlmIChoYXNJZ25vcmVGb3JEaWFnbm9zdGljc01hcmtlcihub2RlLCBzb3VyY2VGaWxlKSAmJiBpc0RpYWdub3N0aWNSZXF1ZXN0KSB7XG4gICAgICAvLyBUaGVyZSdzIGFuIGlnbm9yZSBtYXJrZXIgb24gdGhpcyBub2RlLCBzbyB0aGUgZGlhZ25vc3RpYyBzaG91bGQgbm90IGJlIHJlcG9ydGVkLlxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIG5vZGUgPSBub2RlLnBhcmVudDtcblxuICAgIC8vIEJhaWwgb25jZSB3ZSBoYXZlIHJlYWNoZWQgdGhlIHJvb3QuXG4gICAgaWYgKG5vZGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cbiAgY29uc3Qgc3RhcnQgPSBub2RlLmdldEZ1bGxTdGFydCgpO1xuICByZXR1cm4gdHMuZm9yRWFjaExlYWRpbmdDb21tZW50UmFuZ2Uoc291cmNlRmlsZS50ZXh0LCBzdGFydCwgKHBvcywgZW5kLCBraW5kKSA9PiB7XG4gICAgaWYgKGtpbmQgIT09IHRzLlN5bnRheEtpbmQuTXVsdGlMaW5lQ29tbWVudFRyaXZpYSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IGNvbW1lbnRUZXh0ID0gc291cmNlRmlsZS50ZXh0LnN1YnN0cmluZyhwb3MgKyAyLCBlbmQgLSAyKTtcbiAgICByZXR1cm4gY29tbWVudFRleHQ7XG4gIH0pIGFzIFRlbXBsYXRlSWQgfHwgbnVsbDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrSWZHZW5lcmljVHlwZUJvdW5kc0FyZUNvbnRleHRGcmVlKFxuICAgIG5vZGU6IENsYXNzRGVjbGFyYXRpb248dHMuQ2xhc3NEZWNsYXJhdGlvbj4sIHJlZmxlY3RvcjogUmVmbGVjdGlvbkhvc3QpOiBib29sZWFuIHtcbiAgLy8gR2VuZXJpYyB0eXBlIHBhcmFtZXRlcnMgYXJlIGNvbnNpZGVyZWQgY29udGV4dCBmcmVlIGlmIHRoZXkgY2FuIGJlIGVtaXR0ZWQgaW50byBhbnkgY29udGV4dC5cbiAgcmV0dXJuIG5ldyBUeXBlUGFyYW1ldGVyRW1pdHRlcihub2RlLnR5cGVQYXJhbWV0ZXJzLCByZWZsZWN0b3IpLmNhbkVtaXQoKTtcbn1cbiJdfQ==