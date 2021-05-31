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
        define("@angular/compiler-cli/src/ngtsc/typecheck/src/oob", ["require", "exports", "tslib", "typescript", "@angular/compiler-cli/src/ngtsc/diagnostics", "@angular/compiler-cli/src/ngtsc/typecheck/diagnostics"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OutOfBandDiagnosticRecorderImpl = void 0;
    var tslib_1 = require("tslib");
    var ts = require("typescript");
    var diagnostics_1 = require("@angular/compiler-cli/src/ngtsc/diagnostics");
    var diagnostics_2 = require("@angular/compiler-cli/src/ngtsc/typecheck/diagnostics");
    var OutOfBandDiagnosticRecorderImpl = /** @class */ (function () {
        function OutOfBandDiagnosticRecorderImpl(resolver) {
            this.resolver = resolver;
            this._diagnostics = [];
            /**
             * Tracks which `BindingPipe` nodes have already been recorded as invalid, so only one diagnostic
             * is ever produced per node.
             */
            this.recordedPipes = new Set();
        }
        Object.defineProperty(OutOfBandDiagnosticRecorderImpl.prototype, "diagnostics", {
            get: function () {
                return this._diagnostics;
            },
            enumerable: false,
            configurable: true
        });
        OutOfBandDiagnosticRecorderImpl.prototype.missingReferenceTarget = function (templateId, ref) {
            var mapping = this.resolver.getSourceMapping(templateId);
            var value = ref.value.trim();
            var errorMsg = "No directive found with exportAs '" + value + "'.";
            this._diagnostics.push(diagnostics_2.makeTemplateDiagnostic(templateId, mapping, ref.valueSpan || ref.sourceSpan, ts.DiagnosticCategory.Error, diagnostics_1.ngErrorCode(diagnostics_1.ErrorCode.MISSING_REFERENCE_TARGET), errorMsg));
        };
        OutOfBandDiagnosticRecorderImpl.prototype.missingPipe = function (templateId, ast) {
            if (this.recordedPipes.has(ast)) {
                return;
            }
            var mapping = this.resolver.getSourceMapping(templateId);
            var errorMsg = "No pipe found with name '" + ast.name + "'.";
            var sourceSpan = this.resolver.toParseSourceSpan(templateId, ast.nameSpan);
            if (sourceSpan === null) {
                throw new Error("Assertion failure: no SourceLocation found for usage of pipe '" + ast.name + "'.");
            }
            this._diagnostics.push(diagnostics_2.makeTemplateDiagnostic(templateId, mapping, sourceSpan, ts.DiagnosticCategory.Error, diagnostics_1.ngErrorCode(diagnostics_1.ErrorCode.MISSING_PIPE), errorMsg));
            this.recordedPipes.add(ast);
        };
        OutOfBandDiagnosticRecorderImpl.prototype.illegalAssignmentToTemplateVar = function (templateId, assignment, target) {
            var mapping = this.resolver.getSourceMapping(templateId);
            var errorMsg = "Cannot use variable '" + assignment
                .name + "' as the left-hand side of an assignment expression. Template variables are read-only.";
            var sourceSpan = this.resolver.toParseSourceSpan(templateId, assignment.sourceSpan);
            if (sourceSpan === null) {
                throw new Error("Assertion failure: no SourceLocation found for property binding.");
            }
            this._diagnostics.push(diagnostics_2.makeTemplateDiagnostic(templateId, mapping, sourceSpan, ts.DiagnosticCategory.Error, diagnostics_1.ngErrorCode(diagnostics_1.ErrorCode.WRITE_TO_READ_ONLY_VARIABLE), errorMsg, {
                text: "The variable " + assignment.name + " is declared here.",
                span: target.valueSpan || target.sourceSpan,
            }));
        };
        OutOfBandDiagnosticRecorderImpl.prototype.duplicateTemplateVar = function (templateId, variable, firstDecl) {
            var mapping = this.resolver.getSourceMapping(templateId);
            var errorMsg = "Cannot redeclare variable '" + variable.name + "' as it was previously declared elsewhere for the same template.";
            // The allocation of the error here is pretty useless for variables declared in microsyntax,
            // since the sourceSpan refers to the entire microsyntax property, not a span for the specific
            // variable in question.
            //
            // TODO(alxhub): allocate to a tighter span once one is available.
            this._diagnostics.push(diagnostics_2.makeTemplateDiagnostic(templateId, mapping, variable.sourceSpan, ts.DiagnosticCategory.Error, diagnostics_1.ngErrorCode(diagnostics_1.ErrorCode.DUPLICATE_VARIABLE_DECLARATION), errorMsg, {
                text: "The variable '" + firstDecl.name + "' was first declared here.",
                span: firstDecl.sourceSpan,
            }));
        };
        OutOfBandDiagnosticRecorderImpl.prototype.requiresInlineTcb = function (templateId, node) {
            this._diagnostics.push(makeInlineDiagnostic(templateId, diagnostics_1.ErrorCode.INLINE_TCB_REQUIRED, node.name, "This component requires inline template type-checking, which is not supported by the current environment."));
        };
        OutOfBandDiagnosticRecorderImpl.prototype.requiresInlineTypeConstructors = function (templateId, node, directives) {
            var message;
            if (directives.length > 1) {
                message =
                    "This component uses directives which require inline type constructors, which are not supported by the current environment.";
            }
            else {
                message =
                    "This component uses a directive which requires an inline type constructor, which is not supported by the current environment.";
            }
            this._diagnostics.push(makeInlineDiagnostic(templateId, diagnostics_1.ErrorCode.INLINE_TYPE_CTOR_REQUIRED, node.name, message, directives.map(function (dir) { return diagnostics_1.makeRelatedInformation(dir.name, "Requires an inline type constructor."); })));
        };
        OutOfBandDiagnosticRecorderImpl.prototype.suboptimalTypeInference = function (templateId, variables) {
            var e_1, _a;
            var mapping = this.resolver.getSourceMapping(templateId);
            // Select one of the template variables that's most suitable for reporting the diagnostic. Any
            // variable will do, but prefer one bound to the context's $implicit if present.
            var diagnosticVar = null;
            try {
                for (var variables_1 = tslib_1.__values(variables), variables_1_1 = variables_1.next(); !variables_1_1.done; variables_1_1 = variables_1.next()) {
                    var variable = variables_1_1.value;
                    if (diagnosticVar === null || (variable.value === '' || variable.value === '$implicit')) {
                        diagnosticVar = variable;
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (variables_1_1 && !variables_1_1.done && (_a = variables_1.return)) _a.call(variables_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            if (diagnosticVar === null) {
                // There is no variable on which to report the diagnostic.
                return;
            }
            var varIdentification = "'" + diagnosticVar.name + "'";
            if (variables.length === 2) {
                varIdentification += " (and 1 other)";
            }
            else if (variables.length > 2) {
                varIdentification += " (and " + (variables.length - 1) + " others)";
            }
            var message = "This structural directive supports advanced type inference, but the current compiler configuration prevents its usage. The variable " + varIdentification + " will have type 'any' as a result.\n\nConsider enabling the 'strictTemplates' option in your tsconfig.json for better type inference within this template.";
            this._diagnostics.push(diagnostics_2.makeTemplateDiagnostic(templateId, mapping, diagnosticVar.keySpan, ts.DiagnosticCategory.Suggestion, diagnostics_1.ngErrorCode(diagnostics_1.ErrorCode.SUGGEST_SUBOPTIMAL_TYPE_INFERENCE), message));
        };
        return OutOfBandDiagnosticRecorderImpl;
    }());
    exports.OutOfBandDiagnosticRecorderImpl = OutOfBandDiagnosticRecorderImpl;
    function makeInlineDiagnostic(templateId, code, node, messageText, relatedInformation) {
        return tslib_1.__assign(tslib_1.__assign({}, diagnostics_1.makeDiagnostic(code, node, messageText, relatedInformation)), { componentFile: node.getSourceFile(), templateId: templateId });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib29iLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL3NyYy9uZ3RzYy90eXBlY2hlY2svc3JjL29vYi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBR0gsK0JBQWlDO0lBRWpDLDJFQUFpRztJQUdqRyxxRkFBMEU7SUFnRTFFO1FBU0UseUNBQW9CLFFBQWdDO1lBQWhDLGFBQVEsR0FBUixRQUFRLENBQXdCO1lBUjVDLGlCQUFZLEdBQXlCLEVBQUUsQ0FBQztZQUVoRDs7O2VBR0c7WUFDSyxrQkFBYSxHQUFHLElBQUksR0FBRyxFQUFlLENBQUM7UUFFUSxDQUFDO1FBRXhELHNCQUFJLHdEQUFXO2lCQUFmO2dCQUNFLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQztZQUMzQixDQUFDOzs7V0FBQTtRQUVELGdFQUFzQixHQUF0QixVQUF1QixVQUFzQixFQUFFLEdBQXFCO1lBQ2xFLElBQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDM0QsSUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUUvQixJQUFNLFFBQVEsR0FBRyx1Q0FBcUMsS0FBSyxPQUFJLENBQUM7WUFDaEUsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsb0NBQXNCLENBQ3pDLFVBQVUsRUFBRSxPQUFPLEVBQUUsR0FBRyxDQUFDLFNBQVMsSUFBSSxHQUFHLENBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLEVBQ2pGLHlCQUFXLENBQUMsdUJBQVMsQ0FBQyx3QkFBd0IsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDbEUsQ0FBQztRQUVELHFEQUFXLEdBQVgsVUFBWSxVQUFzQixFQUFFLEdBQWdCO1lB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bGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0JpbmRpbmdQaXBlLCBQcm9wZXJ0eVdyaXRlLCBUbXBsQXN0UmVmZXJlbmNlLCBUbXBsQXN0VmFyaWFibGV9IGZyb20gJ0Bhbmd1bGFyL2NvbXBpbGVyJztcbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuXG5pbXBvcnQge0Vycm9yQ29kZSwgbWFrZURpYWdub3N0aWMsIG1ha2VSZWxhdGVkSW5mb3JtYXRpb24sIG5nRXJyb3JDb2RlfSBmcm9tICcuLi8uLi9kaWFnbm9zdGljcyc7XG5pbXBvcnQge0NsYXNzRGVjbGFyYXRpb259IGZyb20gJy4uLy4uL3JlZmxlY3Rpb24nO1xuaW1wb3J0IHtUZW1wbGF0ZUlkfSBmcm9tICcuLi9hcGknO1xuaW1wb3J0IHttYWtlVGVtcGxhdGVEaWFnbm9zdGljLCBUZW1wbGF0ZURpYWdub3N0aWN9IGZyb20gJy4uL2RpYWdub3N0aWNzJztcblxuaW1wb3J0IHtUZW1wbGF0ZVNvdXJjZVJlc29sdmVyfSBmcm9tICcuL3RjYl91dGlsJztcblxuXG5cbi8qKlxuICogQ29sbGVjdHMgYHRzLkRpYWdub3N0aWNgcyBvbiBwcm9ibGVtcyB3aGljaCBvY2N1ciBpbiB0aGUgdGVtcGxhdGUgd2hpY2ggYXJlbid0IGRpcmVjdGx5IHNvdXJjZWRcbiAqIGZyb20gVHlwZSBDaGVjayBCbG9ja3MuXG4gKlxuICogRHVyaW5nIHRoZSBjcmVhdGlvbiBvZiBhIFR5cGUgQ2hlY2sgQmxvY2ssIHRoZSB0ZW1wbGF0ZSBpcyB0cmF2ZXJzZWQgYW5kIHRoZVxuICogYE91dE9mQmFuZERpYWdub3N0aWNSZWNvcmRlcmAgaXMgY2FsbGVkIHRvIHJlY29yZCBjYXNlcyB3aGVuIGEgY29ycmVjdCBpbnRlcnByZXRhdGlvbiBmb3IgdGhlXG4gKiB0ZW1wbGF0ZSBjYW5ub3QgYmUgZm91bmQuIFRoZXNlIG9wZXJhdGlvbnMgY3JlYXRlIGB0cy5EaWFnbm9zdGljYHMgd2hpY2ggYXJlIHN0b3JlZCBieSB0aGVcbiAqIHJlY29yZGVyIGZvciBsYXRlciBkaXNwbGF5LlxuICovXG5leHBvcnQgaW50ZXJmYWNlIE91dE9mQmFuZERpYWdub3N0aWNSZWNvcmRlciB7XG4gIHJlYWRvbmx5IGRpYWdub3N0aWNzOiBSZWFkb25seUFycmF5PFRlbXBsYXRlRGlhZ25vc3RpYz47XG5cbiAgLyoqXG4gICAqIFJlcG9ydHMgYSBgI3JlZj1cInRhcmdldFwiYCBleHByZXNzaW9uIGluIHRoZSB0ZW1wbGF0ZSBmb3Igd2hpY2ggYSB0YXJnZXQgZGlyZWN0aXZlIGNvdWxkIG5vdCBiZVxuICAgKiBmb3VuZC5cbiAgICpcbiAgICogQHBhcmFtIHRlbXBsYXRlSWQgdGhlIHRlbXBsYXRlIHR5cGUtY2hlY2tpbmcgSUQgb2YgdGhlIHRlbXBsYXRlIHdoaWNoIGNvbnRhaW5zIHRoZSBicm9rZW5cbiAgICogcmVmZXJlbmNlLlxuICAgKiBAcGFyYW0gcmVmIHRoZSBgVG1wbEFzdFJlZmVyZW5jZWAgd2hpY2ggY291bGQgbm90IGJlIG1hdGNoZWQgdG8gYSBkaXJlY3RpdmUuXG4gICAqL1xuICBtaXNzaW5nUmVmZXJlbmNlVGFyZ2V0KHRlbXBsYXRlSWQ6IFRlbXBsYXRlSWQsIHJlZjogVG1wbEFzdFJlZmVyZW5jZSk6IHZvaWQ7XG5cbiAgLyoqXG4gICAqIFJlcG9ydHMgdXNhZ2Ugb2YgYSBgfCBwaXBlYCBleHByZXNzaW9uIGluIHRoZSB0ZW1wbGF0ZSBmb3Igd2hpY2ggdGhlIG5hbWVkIHBpcGUgY291bGQgbm90IGJlXG4gICAqIGZvdW5kLlxuICAgKlxuICAgKiBAcGFyYW0gdGVtcGxhdGVJZCB0aGUgdGVtcGxhdGUgdHlwZS1jaGVja2luZyBJRCBvZiB0aGUgdGVtcGxhdGUgd2hpY2ggY29udGFpbnMgdGhlIHVua25vd25cbiAgICogcGlwZS5cbiAgICogQHBhcmFtIGFzdCB0aGUgYEJpbmRpbmdQaXBlYCBpbnZvY2F0aW9uIG9mIHRoZSBwaXBlIHdoaWNoIGNvdWxkIG5vdCBiZSBmb3VuZC5cbiAgICovXG4gIG1pc3NpbmdQaXBlKHRlbXBsYXRlSWQ6IFRlbXBsYXRlSWQsIGFzdDogQmluZGluZ1BpcGUpOiB2b2lkO1xuXG4gIGlsbGVnYWxBc3NpZ25tZW50VG9UZW1wbGF0ZVZhcihcbiAgICAgIHRlbXBsYXRlSWQ6IFRlbXBsYXRlSWQsIGFzc2lnbm1lbnQ6IFByb3BlcnR5V3JpdGUsIHRhcmdldDogVG1wbEFzdFZhcmlhYmxlKTogdm9pZDtcblxuICAvKipcbiAgICogUmVwb3J0cyBhIGR1cGxpY2F0ZSBkZWNsYXJhdGlvbiBvZiBhIHRlbXBsYXRlIHZhcmlhYmxlLlxuICAgKlxuICAgKiBAcGFyYW0gdGVtcGxhdGVJZCB0aGUgdGVtcGxhdGUgdHlwZS1jaGVja2luZyBJRCBvZiB0aGUgdGVtcGxhdGUgd2hpY2ggY29udGFpbnMgdGhlIGR1cGxpY2F0ZVxuICAgKiBkZWNsYXJhdGlvbi5cbiAgICogQHBhcmFtIHZhcmlhYmxlIHRoZSBgVG1wbEFzdFZhcmlhYmxlYCB3aGljaCBkdXBsaWNhdGVzIGEgcHJldmlvdXNseSBkZWNsYXJlZCB2YXJpYWJsZS5cbiAgICogQHBhcmFtIGZpcnN0RGVjbCB0aGUgZmlyc3QgdmFyaWFibGUgZGVjbGFyYXRpb24gd2hpY2ggdXNlcyB0aGUgc2FtZSBuYW1lIGFzIGB2YXJpYWJsZWAuXG4gICAqL1xuICBkdXBsaWNhdGVUZW1wbGF0ZVZhcihcbiAgICAgIHRlbXBsYXRlSWQ6IFRlbXBsYXRlSWQsIHZhcmlhYmxlOiBUbXBsQXN0VmFyaWFibGUsIGZpcnN0RGVjbDogVG1wbEFzdFZhcmlhYmxlKTogdm9pZDtcblxuICByZXF1aXJlc0lubGluZVRjYih0ZW1wbGF0ZUlkOiBUZW1wbGF0ZUlkLCBub2RlOiBDbGFzc0RlY2xhcmF0aW9uKTogdm9pZDtcblxuICByZXF1aXJlc0lubGluZVR5cGVDb25zdHJ1Y3RvcnMoXG4gICAgICB0ZW1wbGF0ZUlkOiBUZW1wbGF0ZUlkLCBub2RlOiBDbGFzc0RlY2xhcmF0aW9uLCBkaXJlY3RpdmVzOiBDbGFzc0RlY2xhcmF0aW9uW10pOiB2b2lkO1xuXG4gIC8qKlxuICAgKiBSZXBvcnQgYSB3YXJuaW5nIHdoZW4gc3RydWN0dXJhbCBkaXJlY3RpdmVzIHN1cHBvcnQgY29udGV4dCBndWFyZHMsIGJ1dCB0aGUgY3VycmVudFxuICAgKiB0eXBlLWNoZWNraW5nIGNvbmZpZ3VyYXRpb24gcHJvaGliaXRzIHRoZWlyIHVzYWdlLlxuICAgKi9cbiAgc3Vib3B0aW1hbFR5cGVJbmZlcmVuY2UodGVtcGxhdGVJZDogVGVtcGxhdGVJZCwgdmFyaWFibGVzOiBUbXBsQXN0VmFyaWFibGVbXSk6IHZvaWQ7XG59XG5cbmV4cG9ydCBjbGFzcyBPdXRPZkJhbmREaWFnbm9zdGljUmVjb3JkZXJJbXBsIGltcGxlbWVudHMgT3V0T2ZCYW5kRGlhZ25vc3RpY1JlY29yZGVyIHtcbiAgcHJpdmF0ZSBfZGlhZ25vc3RpY3M6IFRlbXBsYXRlRGlhZ25vc3RpY1tdID0gW107XG5cbiAgLyoqXG4gICAqIFRyYWNrcyB3aGljaCBgQmluZGluZ1BpcGVgIG5vZGVzIGhhdmUgYWxyZWFkeSBiZWVuIHJlY29yZGVkIGFzIGludmFsaWQsIHNvIG9ubHkgb25lIGRpYWdub3N0aWNcbiAgICogaXMgZXZlciBwcm9kdWNlZCBwZXIgbm9kZS5cbiAgICovXG4gIHByaXZhdGUgcmVjb3JkZWRQaXBlcyA9IG5ldyBTZXQ8QmluZGluZ1BpcGU+KCk7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSByZXNvbHZlcjogVGVtcGxhdGVTb3VyY2VSZXNvbHZlcikge31cblxuICBnZXQgZGlhZ25vc3RpY3MoKTogUmVhZG9ubHlBcnJheTxUZW1wbGF0ZURpYWdub3N0aWM+IHtcbiAgICByZXR1cm4gdGhpcy5fZGlhZ25vc3RpY3M7XG4gIH1cblxuICBtaXNzaW5nUmVmZXJlbmNlVGFyZ2V0KHRlbXBsYXRlSWQ6IFRlbXBsYXRlSWQsIHJlZjogVG1wbEFzdFJlZmVyZW5jZSk6IHZvaWQge1xuICAgIGNvbnN0IG1hcHBpbmcgPSB0aGlzLnJlc29sdmVyLmdldFNvdXJjZU1hcHBpbmcodGVtcGxhdGVJZCk7XG4gICAgY29uc3QgdmFsdWUgPSByZWYudmFsdWUudHJpbSgpO1xuXG4gICAgY29uc3QgZXJyb3JNc2cgPSBgTm8gZGlyZWN0aXZlIGZvdW5kIHdpdGggZXhwb3J0QXMgJyR7dmFsdWV9Jy5gO1xuICAgIHRoaXMuX2RpYWdub3N0aWNzLnB1c2gobWFrZVRlbXBsYXRlRGlhZ25vc3RpYyhcbiAgICAgICAgdGVtcGxhdGVJZCwgbWFwcGluZywgcmVmLnZhbHVlU3BhbiB8fCByZWYuc291cmNlU3BhbiwgdHMuRGlhZ25vc3RpY0NhdGVnb3J5LkVycm9yLFxuICAgICAgICBuZ0Vycm9yQ29kZShFcnJvckNvZGUuTUlTU0lOR19SRUZFUkVOQ0VfVEFSR0VUKSwgZXJyb3JNc2cpKTtcbiAgfVxuXG4gIG1pc3NpbmdQaXBlKHRlbXBsYXRlSWQ6IFRlbXBsYXRlSWQsIGFzdDogQmluZGluZ1BpcGUpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5yZWNvcmRlZFBpcGVzLmhhcyhhc3QpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgbWFwcGluZyA9IHRoaXMucmVzb2x2ZXIuZ2V0U291cmNlTWFwcGluZyh0ZW1wbGF0ZUlkKTtcbiAgICBjb25zdCBlcnJvck1zZyA9IGBObyBwaXBlIGZvdW5kIHdpdGggbmFtZSAnJHthc3QubmFtZX0nLmA7XG5cbiAgICBjb25zdCBzb3VyY2VTcGFuID0gdGhpcy5yZXNvbHZlci50b1BhcnNlU291cmNlU3Bhbih0ZW1wbGF0ZUlkLCBhc3QubmFtZVNwYW4pO1xuICAgIGlmIChzb3VyY2VTcGFuID09PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYEFzc2VydGlvbiBmYWlsdXJlOiBubyBTb3VyY2VMb2NhdGlvbiBmb3VuZCBmb3IgdXNhZ2Ugb2YgcGlwZSAnJHthc3QubmFtZX0nLmApO1xuICAgIH1cbiAgICB0aGlzLl9kaWFnbm9zdGljcy5wdXNoKG1ha2VUZW1wbGF0ZURpYWdub3N0aWMoXG4gICAgICAgIHRlbXBsYXRlSWQsIG1hcHBpbmcsIHNvdXJjZVNwYW4sIHRzLkRpYWdub3N0aWNDYXRlZ29yeS5FcnJvcixcbiAgICAgICAgbmdFcnJvckNvZGUoRXJyb3JDb2RlLk1JU1NJTkdfUElQRSksIGVycm9yTXNnKSk7XG4gICAgdGhpcy5yZWNvcmRlZFBpcGVzLmFkZChhc3QpO1xuICB9XG5cbiAgaWxsZWdhbEFzc2lnbm1lbnRUb1RlbXBsYXRlVmFyKFxuICAgICAgdGVtcGxhdGVJZDogVGVtcGxhdGVJZCwgYXNzaWdubWVudDogUHJvcGVydHlXcml0ZSwgdGFyZ2V0OiBUbXBsQXN0VmFyaWFibGUpOiB2b2lkIHtcbiAgICBjb25zdCBtYXBwaW5nID0gdGhpcy5yZXNvbHZlci5nZXRTb3VyY2VNYXBwaW5nKHRlbXBsYXRlSWQpO1xuICAgIGNvbnN0IGVycm9yTXNnID0gYENhbm5vdCB1c2UgdmFyaWFibGUgJyR7XG4gICAgICAgIGFzc2lnbm1lbnRcbiAgICAgICAgICAgIC5uYW1lfScgYXMgdGhlIGxlZnQtaGFuZCBzaWRlIG9mIGFuIGFzc2lnbm1lbnQgZXhwcmVzc2lvbi4gVGVtcGxhdGUgdmFyaWFibGVzIGFyZSByZWFkLW9ubHkuYDtcblxuICAgIGNvbnN0IHNvdXJjZVNwYW4gPSB0aGlzLnJlc29sdmVyLnRvUGFyc2VTb3VyY2VTcGFuKHRlbXBsYXRlSWQsIGFzc2lnbm1lbnQuc291cmNlU3Bhbik7XG4gICAgaWYgKHNvdXJjZVNwYW4gPT09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQXNzZXJ0aW9uIGZhaWx1cmU6IG5vIFNvdXJjZUxvY2F0aW9uIGZvdW5kIGZvciBwcm9wZXJ0eSBiaW5kaW5nLmApO1xuICAgIH1cbiAgICB0aGlzLl9kaWFnbm9zdGljcy5wdXNoKG1ha2VUZW1wbGF0ZURpYWdub3N0aWMoXG4gICAgICAgIHRlbXBsYXRlSWQsIG1hcHBpbmcsIHNvdXJjZVNwYW4sIHRzLkRpYWdub3N0aWNDYXRlZ29yeS5FcnJvcixcbiAgICAgICAgbmdFcnJvckNvZGUoRXJyb3JDb2RlLldSSVRFX1RPX1JFQURfT05MWV9WQVJJQUJMRSksIGVycm9yTXNnLCB7XG4gICAgICAgICAgdGV4dDogYFRoZSB2YXJpYWJsZSAke2Fzc2lnbm1lbnQubmFtZX0gaXMgZGVjbGFyZWQgaGVyZS5gLFxuICAgICAgICAgIHNwYW46IHRhcmdldC52YWx1ZVNwYW4gfHwgdGFyZ2V0LnNvdXJjZVNwYW4sXG4gICAgICAgIH0pKTtcbiAgfVxuXG4gIGR1cGxpY2F0ZVRlbXBsYXRlVmFyKFxuICAgICAgdGVtcGxhdGVJZDogVGVtcGxhdGVJZCwgdmFyaWFibGU6IFRtcGxBc3RWYXJpYWJsZSwgZmlyc3REZWNsOiBUbXBsQXN0VmFyaWFibGUpOiB2b2lkIHtcbiAgICBjb25zdCBtYXBwaW5nID0gdGhpcy5yZXNvbHZlci5nZXRTb3VyY2VNYXBwaW5nKHRlbXBsYXRlSWQpO1xuICAgIGNvbnN0IGVycm9yTXNnID0gYENhbm5vdCByZWRlY2xhcmUgdmFyaWFibGUgJyR7XG4gICAgICAgIHZhcmlhYmxlLm5hbWV9JyBhcyBpdCB3YXMgcHJldmlvdXNseSBkZWNsYXJlZCBlbHNld2hlcmUgZm9yIHRoZSBzYW1lIHRlbXBsYXRlLmA7XG5cbiAgICAvLyBUaGUgYWxsb2NhdGlvbiBvZiB0aGUgZXJyb3IgaGVyZSBpcyBwcmV0dHkgdXNlbGVzcyBmb3IgdmFyaWFibGVzIGRlY2xhcmVkIGluIG1pY3Jvc3ludGF4LFxuICAgIC8vIHNpbmNlIHRoZSBzb3VyY2VTcGFuIHJlZmVycyB0byB0aGUgZW50aXJlIG1pY3Jvc3ludGF4IHByb3BlcnR5LCBub3QgYSBzcGFuIGZvciB0aGUgc3BlY2lmaWNcbiAgICAvLyB2YXJpYWJsZSBpbiBxdWVzdGlvbi5cbiAgICAvL1xuICAgIC8vIFRPRE8oYWx4aHViKTogYWxsb2NhdGUgdG8gYSB0aWdodGVyIHNwYW4gb25jZSBvbmUgaXMgYXZhaWxhYmxlLlxuICAgIHRoaXMuX2RpYWdub3N0aWNzLnB1c2gobWFrZVRlbXBsYXRlRGlhZ25vc3RpYyhcbiAgICAgICAgdGVtcGxhdGVJZCwgbWFwcGluZywgdmFyaWFibGUuc291cmNlU3BhbiwgdHMuRGlhZ25vc3RpY0NhdGVnb3J5LkVycm9yLFxuICAgICAgICBuZ0Vycm9yQ29kZShFcnJvckNvZGUuRFVQTElDQVRFX1ZBUklBQkxFX0RFQ0xBUkFUSU9OKSwgZXJyb3JNc2csIHtcbiAgICAgICAgICB0ZXh0OiBgVGhlIHZhcmlhYmxlICcke2ZpcnN0RGVjbC5uYW1lfScgd2FzIGZpcnN0IGRlY2xhcmVkIGhlcmUuYCxcbiAgICAgICAgICBzcGFuOiBmaXJzdERlY2wuc291cmNlU3BhbixcbiAgICAgICAgfSkpO1xuICB9XG5cbiAgcmVxdWlyZXNJbmxpbmVUY2IodGVtcGxhdGVJZDogVGVtcGxhdGVJZCwgbm9kZTogQ2xhc3NEZWNsYXJhdGlvbik6IHZvaWQge1xuICAgIHRoaXMuX2RpYWdub3N0aWNzLnB1c2gobWFrZUlubGluZURpYWdub3N0aWMoXG4gICAgICAgIHRlbXBsYXRlSWQsIEVycm9yQ29kZS5JTkxJTkVfVENCX1JFUVVJUkVELCBub2RlLm5hbWUsXG4gICAgICAgIGBUaGlzIGNvbXBvbmVudCByZXF1aXJlcyBpbmxpbmUgdGVtcGxhdGUgdHlwZS1jaGVja2luZywgd2hpY2ggaXMgbm90IHN1cHBvcnRlZCBieSB0aGUgY3VycmVudCBlbnZpcm9ubWVudC5gKSk7XG4gIH1cblxuICByZXF1aXJlc0lubGluZVR5cGVDb25zdHJ1Y3RvcnMoXG4gICAgICB0ZW1wbGF0ZUlkOiBUZW1wbGF0ZUlkLCBub2RlOiBDbGFzc0RlY2xhcmF0aW9uLCBkaXJlY3RpdmVzOiBDbGFzc0RlY2xhcmF0aW9uW10pOiB2b2lkIHtcbiAgICBsZXQgbWVzc2FnZTogc3RyaW5nO1xuICAgIGlmIChkaXJlY3RpdmVzLmxlbmd0aCA+IDEpIHtcbiAgICAgIG1lc3NhZ2UgPVxuICAgICAgICAgIGBUaGlzIGNvbXBvbmVudCB1c2VzIGRpcmVjdGl2ZXMgd2hpY2ggcmVxdWlyZSBpbmxpbmUgdHlwZSBjb25zdHJ1Y3RvcnMsIHdoaWNoIGFyZSBub3Qgc3VwcG9ydGVkIGJ5IHRoZSBjdXJyZW50IGVudmlyb25tZW50LmA7XG4gICAgfSBlbHNlIHtcbiAgICAgIG1lc3NhZ2UgPVxuICAgICAgICAgIGBUaGlzIGNvbXBvbmVudCB1c2VzIGEgZGlyZWN0aXZlIHdoaWNoIHJlcXVpcmVzIGFuIGlubGluZSB0eXBlIGNvbnN0cnVjdG9yLCB3aGljaCBpcyBub3Qgc3VwcG9ydGVkIGJ5IHRoZSBjdXJyZW50IGVudmlyb25tZW50LmA7XG4gICAgfVxuXG4gICAgdGhpcy5fZGlhZ25vc3RpY3MucHVzaChtYWtlSW5saW5lRGlhZ25vc3RpYyhcbiAgICAgICAgdGVtcGxhdGVJZCwgRXJyb3JDb2RlLklOTElORV9UWVBFX0NUT1JfUkVRVUlSRUQsIG5vZGUubmFtZSwgbWVzc2FnZSxcbiAgICAgICAgZGlyZWN0aXZlcy5tYXAoXG4gICAgICAgICAgICBkaXIgPT4gbWFrZVJlbGF0ZWRJbmZvcm1hdGlvbihkaXIubmFtZSwgYFJlcXVpcmVzIGFuIGlubGluZSB0eXBlIGNvbnN0cnVjdG9yLmApKSkpO1xuICB9XG5cbiAgc3Vib3B0aW1hbFR5cGVJbmZlcmVuY2UodGVtcGxhdGVJZDogVGVtcGxhdGVJZCwgdmFyaWFibGVzOiBUbXBsQXN0VmFyaWFibGVbXSk6IHZvaWQge1xuICAgIGNvbnN0IG1hcHBpbmcgPSB0aGlzLnJlc29sdmVyLmdldFNvdXJjZU1hcHBpbmcodGVtcGxhdGVJZCk7XG5cbiAgICAvLyBTZWxlY3Qgb25lIG9mIHRoZSB0ZW1wbGF0ZSB2YXJpYWJsZXMgdGhhdCdzIG1vc3Qgc3VpdGFibGUgZm9yIHJlcG9ydGluZyB0aGUgZGlhZ25vc3RpYy4gQW55XG4gICAgLy8gdmFyaWFibGUgd2lsbCBkbywgYnV0IHByZWZlciBvbmUgYm91bmQgdG8gdGhlIGNvbnRleHQncyAkaW1wbGljaXQgaWYgcHJlc2VudC5cbiAgICBsZXQgZGlhZ25vc3RpY1ZhcjogVG1wbEFzdFZhcmlhYmxlfG51bGwgPSBudWxsO1xuICAgIGZvciAoY29uc3QgdmFyaWFibGUgb2YgdmFyaWFibGVzKSB7XG4gICAgICBpZiAoZGlhZ25vc3RpY1ZhciA9PT0gbnVsbCB8fCAodmFyaWFibGUudmFsdWUgPT09ICcnIHx8IHZhcmlhYmxlLnZhbHVlID09PSAnJGltcGxpY2l0JykpIHtcbiAgICAgICAgZGlhZ25vc3RpY1ZhciA9IHZhcmlhYmxlO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoZGlhZ25vc3RpY1ZhciA9PT0gbnVsbCkge1xuICAgICAgLy8gVGhlcmUgaXMgbm8gdmFyaWFibGUgb24gd2hpY2ggdG8gcmVwb3J0IHRoZSBkaWFnbm9zdGljLlxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCB2YXJJZGVudGlmaWNhdGlvbiA9IGAnJHtkaWFnbm9zdGljVmFyLm5hbWV9J2A7XG4gICAgaWYgKHZhcmlhYmxlcy5sZW5ndGggPT09IDIpIHtcbiAgICAgIHZhcklkZW50aWZpY2F0aW9uICs9IGAgKGFuZCAxIG90aGVyKWA7XG4gICAgfSBlbHNlIGlmICh2YXJpYWJsZXMubGVuZ3RoID4gMikge1xuICAgICAgdmFySWRlbnRpZmljYXRpb24gKz0gYCAoYW5kICR7dmFyaWFibGVzLmxlbmd0aCAtIDF9IG90aGVycylgO1xuICAgIH1cbiAgICBjb25zdCBtZXNzYWdlID1cbiAgICAgICAgYFRoaXMgc3RydWN0dXJhbCBkaXJlY3RpdmUgc3VwcG9ydHMgYWR2YW5jZWQgdHlwZSBpbmZlcmVuY2UsIGJ1dCB0aGUgY3VycmVudCBjb21waWxlciBjb25maWd1cmF0aW9uIHByZXZlbnRzIGl0cyB1c2FnZS4gVGhlIHZhcmlhYmxlICR7XG4gICAgICAgICAgICB2YXJJZGVudGlmaWNhdGlvbn0gd2lsbCBoYXZlIHR5cGUgJ2FueScgYXMgYSByZXN1bHQuXFxuXFxuQ29uc2lkZXIgZW5hYmxpbmcgdGhlICdzdHJpY3RUZW1wbGF0ZXMnIG9wdGlvbiBpbiB5b3VyIHRzY29uZmlnLmpzb24gZm9yIGJldHRlciB0eXBlIGluZmVyZW5jZSB3aXRoaW4gdGhpcyB0ZW1wbGF0ZS5gO1xuXG4gICAgdGhpcy5fZGlhZ25vc3RpY3MucHVzaChtYWtlVGVtcGxhdGVEaWFnbm9zdGljKFxuICAgICAgICB0ZW1wbGF0ZUlkLCBtYXBwaW5nLCBkaWFnbm9zdGljVmFyLmtleVNwYW4sIHRzLkRpYWdub3N0aWNDYXRlZ29yeS5TdWdnZXN0aW9uLFxuICAgICAgICBuZ0Vycm9yQ29kZShFcnJvckNvZGUuU1VHR0VTVF9TVUJPUFRJTUFMX1RZUEVfSU5GRVJFTkNFKSwgbWVzc2FnZSkpO1xuICB9XG59XG5cbmZ1bmN0aW9uIG1ha2VJbmxpbmVEaWFnbm9zdGljKFxuICAgIHRlbXBsYXRlSWQ6IFRlbXBsYXRlSWQsIGNvZGU6IEVycm9yQ29kZS5JTkxJTkVfVENCX1JFUVVJUkVEfEVycm9yQ29kZS5JTkxJTkVfVFlQRV9DVE9SX1JFUVVJUkVELFxuICAgIG5vZGU6IHRzLk5vZGUsIG1lc3NhZ2VUZXh0OiBzdHJpbmd8dHMuRGlhZ25vc3RpY01lc3NhZ2VDaGFpbixcbiAgICByZWxhdGVkSW5mb3JtYXRpb24/OiB0cy5EaWFnbm9zdGljUmVsYXRlZEluZm9ybWF0aW9uW10pOiBUZW1wbGF0ZURpYWdub3N0aWMge1xuICByZXR1cm4ge1xuICAgIC4uLm1ha2VEaWFnbm9zdGljKGNvZGUsIG5vZGUsIG1lc3NhZ2VUZXh0LCByZWxhdGVkSW5mb3JtYXRpb24pLFxuICAgIGNvbXBvbmVudEZpbGU6IG5vZGUuZ2V0U291cmNlRmlsZSgpLFxuICAgIHRlbXBsYXRlSWQsXG4gIH07XG59XG4iXX0=