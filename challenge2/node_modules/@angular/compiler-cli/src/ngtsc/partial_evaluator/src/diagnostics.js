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
        define("@angular/compiler-cli/src/ngtsc/partial_evaluator/src/diagnostics", ["require", "exports", "tslib", "typescript", "@angular/compiler-cli/src/ngtsc/diagnostics", "@angular/compiler-cli/src/ngtsc/imports", "@angular/compiler-cli/src/ngtsc/partial_evaluator/src/dynamic", "@angular/compiler-cli/src/ngtsc/partial_evaluator/src/result"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.traceDynamicValue = exports.describeResolvedType = void 0;
    var tslib_1 = require("tslib");
    var ts = require("typescript");
    var diagnostics_1 = require("@angular/compiler-cli/src/ngtsc/diagnostics");
    var imports_1 = require("@angular/compiler-cli/src/ngtsc/imports");
    var dynamic_1 = require("@angular/compiler-cli/src/ngtsc/partial_evaluator/src/dynamic");
    var result_1 = require("@angular/compiler-cli/src/ngtsc/partial_evaluator/src/result");
    /**
     * Derives a type representation from a resolved value to be reported in a diagnostic.
     *
     * @param value The resolved value for which a type representation should be derived.
     * @param maxDepth The maximum nesting depth of objects and arrays, defaults to 1 level.
     */
    function describeResolvedType(value, maxDepth) {
        var _a, _b;
        if (maxDepth === void 0) { maxDepth = 1; }
        if (value === null) {
            return 'null';
        }
        else if (value === undefined) {
            return 'undefined';
        }
        else if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'string') {
            return typeof value;
        }
        else if (value instanceof Map) {
            if (maxDepth === 0) {
                return 'object';
            }
            var entries = Array.from(value.entries()).map(function (_a) {
                var _b = tslib_1.__read(_a, 2), key = _b[0], v = _b[1];
                return quoteKey(key) + ": " + describeResolvedType(v, maxDepth - 1);
            });
            return entries.length > 0 ? "{ " + entries.join('; ') + " }" : '{}';
        }
        else if (value instanceof result_1.ResolvedModule) {
            return '(module)';
        }
        else if (value instanceof result_1.EnumValue) {
            return (_a = value.enumRef.debugName) !== null && _a !== void 0 ? _a : '(anonymous)';
        }
        else if (value instanceof imports_1.Reference) {
            return (_b = value.debugName) !== null && _b !== void 0 ? _b : '(anonymous)';
        }
        else if (Array.isArray(value)) {
            if (maxDepth === 0) {
                return 'Array';
            }
            return "[" + value.map(function (v) { return describeResolvedType(v, maxDepth - 1); }).join(', ') + "]";
        }
        else if (value instanceof dynamic_1.DynamicValue) {
            return '(not statically analyzable)';
        }
        else if (value instanceof result_1.KnownFn) {
            return 'Function';
        }
        else {
            return 'unknown';
        }
    }
    exports.describeResolvedType = describeResolvedType;
    function quoteKey(key) {
        if (/^[a-z0-9_]+$/i.test(key)) {
            return key;
        }
        else {
            return "'" + key.replace(/'/g, '\\\'') + "'";
        }
    }
    /**
     * Creates an array of related information diagnostics for a `DynamicValue` that describe the trace
     * of why an expression was evaluated as dynamic.
     *
     * @param node The node for which a `ts.Diagnostic` is to be created with the trace.
     * @param value The dynamic value for which a trace should be created.
     */
    function traceDynamicValue(node, value) {
        return value.accept(new TraceDynamicValueVisitor(node));
    }
    exports.traceDynamicValue = traceDynamicValue;
    var TraceDynamicValueVisitor = /** @class */ (function () {
        function TraceDynamicValueVisitor(node) {
            this.node = node;
            this.currentContainerNode = null;
        }
        TraceDynamicValueVisitor.prototype.visitDynamicInput = function (value) {
            var trace = value.reason.accept(this);
            if (this.shouldTrace(value.node)) {
                var info = diagnostics_1.makeRelatedInformation(value.node, 'Unable to evaluate this expression statically.');
                trace.unshift(info);
            }
            return trace;
        };
        TraceDynamicValueVisitor.prototype.visitDynamicString = function (value) {
            return [diagnostics_1.makeRelatedInformation(value.node, 'A string value could not be determined statically.')];
        };
        TraceDynamicValueVisitor.prototype.visitExternalReference = function (value) {
            var name = value.reason.debugName;
            var description = name !== null ? "'" + name + "'" : 'an anonymous declaration';
            return [diagnostics_1.makeRelatedInformation(value.node, "A value for " + description + " cannot be determined statically, as it is an external declaration.")];
        };
        TraceDynamicValueVisitor.prototype.visitComplexFunctionCall = function (value) {
            return [
                diagnostics_1.makeRelatedInformation(value.node, 'Unable to evaluate function call of complex function. A function must have exactly one return statement.'),
                diagnostics_1.makeRelatedInformation(value.reason.node, 'Function is declared here.')
            ];
        };
        TraceDynamicValueVisitor.prototype.visitInvalidExpressionType = function (value) {
            return [diagnostics_1.makeRelatedInformation(value.node, 'Unable to evaluate an invalid expression.')];
        };
        TraceDynamicValueVisitor.prototype.visitUnknown = function (value) {
            return [diagnostics_1.makeRelatedInformation(value.node, 'Unable to evaluate statically.')];
        };
        TraceDynamicValueVisitor.prototype.visitUnknownIdentifier = function (value) {
            return [diagnostics_1.makeRelatedInformation(value.node, 'Unknown reference.')];
        };
        TraceDynamicValueVisitor.prototype.visitUnsupportedSyntax = function (value) {
            return [diagnostics_1.makeRelatedInformation(value.node, 'This syntax is not supported.')];
        };
        /**
         * Determines whether the dynamic value reported for the node should be traced, i.e. if it is not
         * part of the container for which the most recent trace was created.
         */
        TraceDynamicValueVisitor.prototype.shouldTrace = function (node) {
            if (node === this.node) {
                // Do not include a dynamic value for the origin node, as the main diagnostic is already
                // reported on that node.
                return false;
            }
            var container = getContainerNode(node);
            if (container === this.currentContainerNode) {
                // The node is part of the same container as the previous trace entry, so this dynamic value
                // should not become part of the trace.
                return false;
            }
            this.currentContainerNode = container;
            return true;
        };
        return TraceDynamicValueVisitor;
    }());
    /**
     * Determines the closest parent node that is to be considered as container, which is used to reduce
     * the granularity of tracing the dynamic values to a single entry per container. Currently, full
     * statements and destructuring patterns are considered as container.
     */
    function getContainerNode(node) {
        var currentNode = node;
        while (currentNode !== undefined) {
            switch (currentNode.kind) {
                case ts.SyntaxKind.ExpressionStatement:
                case ts.SyntaxKind.VariableStatement:
                case ts.SyntaxKind.ReturnStatement:
                case ts.SyntaxKind.IfStatement:
                case ts.SyntaxKind.SwitchStatement:
                case ts.SyntaxKind.DoStatement:
                case ts.SyntaxKind.WhileStatement:
                case ts.SyntaxKind.ForStatement:
                case ts.SyntaxKind.ForInStatement:
                case ts.SyntaxKind.ForOfStatement:
                case ts.SyntaxKind.ContinueStatement:
                case ts.SyntaxKind.BreakStatement:
                case ts.SyntaxKind.ThrowStatement:
                case ts.SyntaxKind.ObjectBindingPattern:
                case ts.SyntaxKind.ArrayBindingPattern:
                    return currentNode;
            }
            currentNode = currentNode.parent;
        }
        return node.getSourceFile();
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhZ25vc3RpY3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL3BhcnRpYWxfZXZhbHVhdG9yL3NyYy9kaWFnbm9zdGljcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBRUgsK0JBQWlDO0lBRWpDLDJFQUF5RDtJQUN6RCxtRUFBd0M7SUFFeEMseUZBQTREO0lBQzVELHVGQUEyRTtJQUUzRTs7Ozs7T0FLRztJQUNILFNBQWdCLG9CQUFvQixDQUFDLEtBQW9CLEVBQUUsUUFBb0I7O1FBQXBCLHlCQUFBLEVBQUEsWUFBb0I7UUFDN0UsSUFBSSxLQUFLLEtBQUssSUFBSSxFQUFFO1lBQ2xCLE9BQU8sTUFBTSxDQUFDO1NBQ2Y7YUFBTSxJQUFJLEtBQUssS0FBSyxTQUFTLEVBQUU7WUFDOUIsT0FBTyxXQUFXLENBQUM7U0FDcEI7YUFBTSxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsSUFBSSxPQUFPLEtBQUssS0FBSyxTQUFTLElBQUksT0FBTyxLQUFLLEtBQUssUUFBUSxFQUFFO1lBQy9GLE9BQU8sT0FBTyxLQUFLLENBQUM7U0FDckI7YUFBTSxJQUFJLEtBQUssWUFBWSxHQUFHLEVBQUU7WUFDL0IsSUFBSSxRQUFRLEtBQUssQ0FBQyxFQUFFO2dCQUNsQixPQUFPLFFBQVEsQ0FBQzthQUNqQjtZQUNELElBQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQUMsRUFBUTtvQkFBUixLQUFBLHFCQUFRLEVBQVAsR0FBRyxRQUFBLEVBQUUsQ0FBQyxRQUFBO2dCQUN0RCxPQUFVLFFBQVEsQ0FBQyxHQUFHLENBQUMsVUFBSyxvQkFBb0IsQ0FBQyxDQUFDLEVBQUUsUUFBUSxHQUFHLENBQUMsQ0FBRyxDQUFDO1lB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RSxDQUFDLFVBQVUsQ0FBQyxvQkFBb0IsQ0FBQztnQkFDeEMsS0FBSyxFQUFFLENBQUMsVUFBVSxDQUFDLG1CQUFtQjtvQkFDcEMsT0FBTyxXQUFXLENBQUM7YUFDdEI7WUFFRCxXQUFXLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQztTQUNsQztRQUNELE9BQU8sSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO0lBQzlCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbmltcG9ydCB7bWFrZVJlbGF0ZWRJbmZvcm1hdGlvbn0gZnJvbSAnLi4vLi4vZGlhZ25vc3RpY3MnO1xuaW1wb3J0IHtSZWZlcmVuY2V9IGZyb20gJy4uLy4uL2ltcG9ydHMnO1xuaW1wb3J0IHtGdW5jdGlvbkRlZmluaXRpb259IGZyb20gJy4uLy4uL3JlZmxlY3Rpb24nO1xuaW1wb3J0IHtEeW5hbWljVmFsdWUsIER5bmFtaWNWYWx1ZVZpc2l0b3J9IGZyb20gJy4vZHluYW1pYyc7XG5pbXBvcnQge0VudW1WYWx1ZSwgS25vd25GbiwgUmVzb2x2ZWRNb2R1bGUsIFJlc29sdmVkVmFsdWV9IGZyb20gJy4vcmVzdWx0JztcblxuLyoqXG4gKiBEZXJpdmVzIGEgdHlwZSByZXByZXNlbnRhdGlvbiBmcm9tIGEgcmVzb2x2ZWQgdmFsdWUgdG8gYmUgcmVwb3J0ZWQgaW4gYSBkaWFnbm9zdGljLlxuICpcbiAqIEBwYXJhbSB2YWx1ZSBUaGUgcmVzb2x2ZWQgdmFsdWUgZm9yIHdoaWNoIGEgdHlwZSByZXByZXNlbnRhdGlvbiBzaG91bGQgYmUgZGVyaXZlZC5cbiAqIEBwYXJhbSBtYXhEZXB0aCBUaGUgbWF4aW11bSBuZXN0aW5nIGRlcHRoIG9mIG9iamVjdHMgYW5kIGFycmF5cywgZGVmYXVsdHMgdG8gMSBsZXZlbC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlc2NyaWJlUmVzb2x2ZWRUeXBlKHZhbHVlOiBSZXNvbHZlZFZhbHVlLCBtYXhEZXB0aDogbnVtYmVyID0gMSk6IHN0cmluZyB7XG4gIGlmICh2YWx1ZSA9PT0gbnVsbCkge1xuICAgIHJldHVybiAnbnVsbCc7XG4gIH0gZWxzZSBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiAndW5kZWZpbmVkJztcbiAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInIHx8IHR5cGVvZiB2YWx1ZSA9PT0gJ2Jvb2xlYW4nIHx8IHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gdHlwZW9mIHZhbHVlO1xuICB9IGVsc2UgaWYgKHZhbHVlIGluc3RhbmNlb2YgTWFwKSB7XG4gICAgaWYgKG1heERlcHRoID09PSAwKSB7XG4gICAgICByZXR1cm4gJ29iamVjdCc7XG4gICAgfVxuICAgIGNvbnN0IGVudHJpZXMgPSBBcnJheS5mcm9tKHZhbHVlLmVudHJpZXMoKSkubWFwKChba2V5LCB2XSkgPT4ge1xuICAgICAgcmV0dXJuIGAke3F1b3RlS2V5KGtleSl9OiAke2Rlc2NyaWJlUmVzb2x2ZWRUeXBlKHYsIG1heERlcHRoIC0gMSl9YDtcbiAgICB9KTtcbiAgICByZXR1cm4gZW50cmllcy5sZW5ndGggPiAwID8gYHsgJHtlbnRyaWVzLmpvaW4oJzsgJyl9IH1gIDogJ3t9JztcbiAgfSBlbHNlIGlmICh2YWx1ZSBpbnN0YW5jZW9mIFJlc29sdmVkTW9kdWxlKSB7XG4gICAgcmV0dXJuICcobW9kdWxlKSc7XG4gIH0gZWxzZSBpZiAodmFsdWUgaW5zdGFuY2VvZiBFbnVtVmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWUuZW51bVJlZi5kZWJ1Z05hbWUgPz8gJyhhbm9ueW1vdXMpJztcbiAgfSBlbHNlIGlmICh2YWx1ZSBpbnN0YW5jZW9mIFJlZmVyZW5jZSkge1xuICAgIHJldHVybiB2YWx1ZS5kZWJ1Z05hbWUgPz8gJyhhbm9ueW1vdXMpJztcbiAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgIGlmIChtYXhEZXB0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuICdBcnJheSc7XG4gICAgfVxuICAgIHJldHVybiBgWyR7dmFsdWUubWFwKHYgPT4gZGVzY3JpYmVSZXNvbHZlZFR5cGUodiwgbWF4RGVwdGggLSAxKSkuam9pbignLCAnKX1dYDtcbiAgfSBlbHNlIGlmICh2YWx1ZSBpbnN0YW5jZW9mIER5bmFtaWNWYWx1ZSkge1xuICAgIHJldHVybiAnKG5vdCBzdGF0aWNhbGx5IGFuYWx5emFibGUpJztcbiAgfSBlbHNlIGlmICh2YWx1ZSBpbnN0YW5jZW9mIEtub3duRm4pIHtcbiAgICByZXR1cm4gJ0Z1bmN0aW9uJztcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gJ3Vua25vd24nO1xuICB9XG59XG5cbmZ1bmN0aW9uIHF1b3RlS2V5KGtleTogc3RyaW5nKTogc3RyaW5nIHtcbiAgaWYgKC9eW2EtejAtOV9dKyQvaS50ZXN0KGtleSkpIHtcbiAgICByZXR1cm4ga2V5O1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBgJyR7a2V5LnJlcGxhY2UoLycvZywgJ1xcXFxcXCcnKX0nYDtcbiAgfVxufVxuXG4vKipcbiAqIENyZWF0ZXMgYW4gYXJyYXkgb2YgcmVsYXRlZCBpbmZvcm1hdGlvbiBkaWFnbm9zdGljcyBmb3IgYSBgRHluYW1pY1ZhbHVlYCB0aGF0IGRlc2NyaWJlIHRoZSB0cmFjZVxuICogb2Ygd2h5IGFuIGV4cHJlc3Npb24gd2FzIGV2YWx1YXRlZCBhcyBkeW5hbWljLlxuICpcbiAqIEBwYXJhbSBub2RlIFRoZSBub2RlIGZvciB3aGljaCBhIGB0cy5EaWFnbm9zdGljYCBpcyB0byBiZSBjcmVhdGVkIHdpdGggdGhlIHRyYWNlLlxuICogQHBhcmFtIHZhbHVlIFRoZSBkeW5hbWljIHZhbHVlIGZvciB3aGljaCBhIHRyYWNlIHNob3VsZCBiZSBjcmVhdGVkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdHJhY2VEeW5hbWljVmFsdWUoXG4gICAgbm9kZTogdHMuTm9kZSwgdmFsdWU6IER5bmFtaWNWYWx1ZSk6IHRzLkRpYWdub3N0aWNSZWxhdGVkSW5mb3JtYXRpb25bXSB7XG4gIHJldHVybiB2YWx1ZS5hY2NlcHQobmV3IFRyYWNlRHluYW1pY1ZhbHVlVmlzaXRvcihub2RlKSk7XG59XG5cbmNsYXNzIFRyYWNlRHluYW1pY1ZhbHVlVmlzaXRvciBpbXBsZW1lbnRzIER5bmFtaWNWYWx1ZVZpc2l0b3I8dHMuRGlhZ25vc3RpY1JlbGF0ZWRJbmZvcm1hdGlvbltdPiB7XG4gIHByaXZhdGUgY3VycmVudENvbnRhaW5lck5vZGU6IHRzLk5vZGV8bnVsbCA9IG51bGw7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBub2RlOiB0cy5Ob2RlKSB7fVxuXG4gIHZpc2l0RHluYW1pY0lucHV0KHZhbHVlOiBEeW5hbWljVmFsdWU8RHluYW1pY1ZhbHVlPik6IHRzLkRpYWdub3N0aWNSZWxhdGVkSW5mb3JtYXRpb25bXSB7XG4gICAgY29uc3QgdHJhY2UgPSB2YWx1ZS5yZWFzb24uYWNjZXB0KHRoaXMpO1xuICAgIGlmICh0aGlzLnNob3VsZFRyYWNlKHZhbHVlLm5vZGUpKSB7XG4gICAgICBjb25zdCBpbmZvID1cbiAgICAgICAgICBtYWtlUmVsYXRlZEluZm9ybWF0aW9uKHZhbHVlLm5vZGUsICdVbmFibGUgdG8gZXZhbHVhdGUgdGhpcyBleHByZXNzaW9uIHN0YXRpY2FsbHkuJyk7XG4gICAgICB0cmFjZS51bnNoaWZ0KGluZm8pO1xuICAgIH1cbiAgICByZXR1cm4gdHJhY2U7XG4gIH1cblxuICB2aXNpdER5bmFtaWNTdHJpbmcodmFsdWU6IER5bmFtaWNWYWx1ZSk6IHRzLkRpYWdub3N0aWNSZWxhdGVkSW5mb3JtYXRpb25bXSB7XG4gICAgcmV0dXJuIFttYWtlUmVsYXRlZEluZm9ybWF0aW9uKFxuICAgICAgICB2YWx1ZS5ub2RlLCAnQSBzdHJpbmcgdmFsdWUgY291bGQgbm90IGJlIGRldGVybWluZWQgc3RhdGljYWxseS4nKV07XG4gIH1cblxuICB2aXNpdEV4dGVybmFsUmVmZXJlbmNlKHZhbHVlOiBEeW5hbWljVmFsdWU8UmVmZXJlbmNlPHRzLkRlY2xhcmF0aW9uPj4pOlxuICAgICAgdHMuRGlhZ25vc3RpY1JlbGF0ZWRJbmZvcm1hdGlvbltdIHtcbiAgICBjb25zdCBuYW1lID0gdmFsdWUucmVhc29uLmRlYnVnTmFtZTtcbiAgICBjb25zdCBkZXNjcmlwdGlvbiA9IG5hbWUgIT09IG51bGwgPyBgJyR7bmFtZX0nYCA6ICdhbiBhbm9ueW1vdXMgZGVjbGFyYXRpb24nO1xuICAgIHJldHVybiBbbWFrZVJlbGF0ZWRJbmZvcm1hdGlvbihcbiAgICAgICAgdmFsdWUubm9kZSxcbiAgICAgICAgYEEgdmFsdWUgZm9yICR7XG4gICAgICAgICAgICBkZXNjcmlwdGlvbn0gY2Fubm90IGJlIGRldGVybWluZWQgc3RhdGljYWxseSwgYXMgaXQgaXMgYW4gZXh0ZXJuYWwgZGVjbGFyYXRpb24uYCldO1xuICB9XG5cbiAgdmlzaXRDb21wbGV4RnVuY3Rpb25DYWxsKHZhbHVlOiBEeW5hbWljVmFsdWU8RnVuY3Rpb25EZWZpbml0aW9uPik6XG4gICAgICB0cy5EaWFnbm9zdGljUmVsYXRlZEluZm9ybWF0aW9uW10ge1xuICAgIHJldHVybiBbXG4gICAgICBtYWtlUmVsYXRlZEluZm9ybWF0aW9uKFxuICAgICAgICAgIHZhbHVlLm5vZGUsXG4gICAgICAgICAgJ1VuYWJsZSB0byBldmFsdWF0ZSBmdW5jdGlvbiBjYWxsIG9mIGNvbXBsZXggZnVuY3Rpb24uIEEgZnVuY3Rpb24gbXVzdCBoYXZlIGV4YWN0bHkgb25lIHJldHVybiBzdGF0ZW1lbnQuJyksXG4gICAgICBtYWtlUmVsYXRlZEluZm9ybWF0aW9uKHZhbHVlLnJlYXNvbi5ub2RlLCAnRnVuY3Rpb24gaXMgZGVjbGFyZWQgaGVyZS4nKVxuICAgIF07XG4gIH1cblxuICB2aXNpdEludmFsaWRFeHByZXNzaW9uVHlwZSh2YWx1ZTogRHluYW1pY1ZhbHVlKTogdHMuRGlhZ25vc3RpY1JlbGF0ZWRJbmZvcm1hdGlvbltdIHtcbiAgICByZXR1cm4gW21ha2VSZWxhdGVkSW5mb3JtYXRpb24odmFsdWUubm9kZSwgJ1VuYWJsZSB0byBldmFsdWF0ZSBhbiBpbnZhbGlkIGV4cHJlc3Npb24uJyldO1xuICB9XG5cbiAgdmlzaXRVbmtub3duKHZhbHVlOiBEeW5hbWljVmFsdWUpOiB0cy5EaWFnbm9zdGljUmVsYXRlZEluZm9ybWF0aW9uW10ge1xuICAgIHJldHVybiBbbWFrZVJlbGF0ZWRJbmZvcm1hdGlvbih2YWx1ZS5ub2RlLCAnVW5hYmxlIHRvIGV2YWx1YXRlIHN0YXRpY2FsbHkuJyldO1xuICB9XG5cbiAgdmlzaXRVbmtub3duSWRlbnRpZmllcih2YWx1ZTogRHluYW1pY1ZhbHVlKTogdHMuRGlhZ25vc3RpY1JlbGF0ZWRJbmZvcm1hdGlvbltdIHtcbiAgICByZXR1cm4gW21ha2VSZWxhdGVkSW5mb3JtYXRpb24odmFsdWUubm9kZSwgJ1Vua25vd24gcmVmZXJlbmNlLicpXTtcbiAgfVxuXG4gIHZpc2l0VW5zdXBwb3J0ZWRTeW50YXgodmFsdWU6IER5bmFtaWNWYWx1ZSk6IHRzLkRpYWdub3N0aWNSZWxhdGVkSW5mb3JtYXRpb25bXSB7XG4gICAgcmV0dXJuIFttYWtlUmVsYXRlZEluZm9ybWF0aW9uKHZhbHVlLm5vZGUsICdUaGlzIHN5bnRheCBpcyBub3Qgc3VwcG9ydGVkLicpXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmVzIHdoZXRoZXIgdGhlIGR5bmFtaWMgdmFsdWUgcmVwb3J0ZWQgZm9yIHRoZSBub2RlIHNob3VsZCBiZSB0cmFjZWQsIGkuZS4gaWYgaXQgaXMgbm90XG4gICAqIHBhcnQgb2YgdGhlIGNvbnRhaW5lciBmb3Igd2hpY2ggdGhlIG1vc3QgcmVjZW50IHRyYWNlIHdhcyBjcmVhdGVkLlxuICAgKi9cbiAgcHJpdmF0ZSBzaG91bGRUcmFjZShub2RlOiB0cy5Ob2RlKTogYm9vbGVhbiB7XG4gICAgaWYgKG5vZGUgPT09IHRoaXMubm9kZSkge1xuICAgICAgLy8gRG8gbm90IGluY2x1ZGUgYSBkeW5hbWljIHZhbHVlIGZvciB0aGUgb3JpZ2luIG5vZGUsIGFzIHRoZSBtYWluIGRpYWdub3N0aWMgaXMgYWxyZWFkeVxuICAgICAgLy8gcmVwb3J0ZWQgb24gdGhhdCBub2RlLlxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGNvbnN0IGNvbnRhaW5lciA9IGdldENvbnRhaW5lck5vZGUobm9kZSk7XG4gICAgaWYgKGNvbnRhaW5lciA9PT0gdGhpcy5jdXJyZW50Q29udGFpbmVyTm9kZSkge1xuICAgICAgLy8gVGhlIG5vZGUgaXMgcGFydCBvZiB0aGUgc2FtZSBjb250YWluZXIgYXMgdGhlIHByZXZpb3VzIHRyYWNlIGVudHJ5LCBzbyB0aGlzIGR5bmFtaWMgdmFsdWVcbiAgICAgIC8vIHNob3VsZCBub3QgYmVjb21lIHBhcnQgb2YgdGhlIHRyYWNlLlxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHRoaXMuY3VycmVudENvbnRhaW5lck5vZGUgPSBjb250YWluZXI7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbn1cblxuLyoqXG4gKiBEZXRlcm1pbmVzIHRoZSBjbG9zZXN0IHBhcmVudCBub2RlIHRoYXQgaXMgdG8gYmUgY29uc2lkZXJlZCBhcyBjb250YWluZXIsIHdoaWNoIGlzIHVzZWQgdG8gcmVkdWNlXG4gKiB0aGUgZ3JhbnVsYXJpdHkgb2YgdHJhY2luZyB0aGUgZHluYW1pYyB2YWx1ZXMgdG8gYSBzaW5nbGUgZW50cnkgcGVyIGNvbnRhaW5lci4gQ3VycmVudGx5LCBmdWxsXG4gKiBzdGF0ZW1lbnRzIGFuZCBkZXN0cnVjdHVyaW5nIHBhdHRlcm5zIGFyZSBjb25zaWRlcmVkIGFzIGNvbnRhaW5lci5cbiAqL1xuZnVuY3Rpb24gZ2V0Q29udGFpbmVyTm9kZShub2RlOiB0cy5Ob2RlKTogdHMuTm9kZSB7XG4gIGxldCBjdXJyZW50Tm9kZTogdHMuTm9kZXx1bmRlZmluZWQgPSBub2RlO1xuICB3aGlsZSAoY3VycmVudE5vZGUgIT09IHVuZGVmaW5lZCkge1xuICAgIHN3aXRjaCAoY3VycmVudE5vZGUua2luZCkge1xuICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkV4cHJlc3Npb25TdGF0ZW1lbnQ6XG4gICAgICBjYXNlIHRzLlN5bnRheEtpbmQuVmFyaWFibGVTdGF0ZW1lbnQ6XG4gICAgICBjYXNlIHRzLlN5bnRheEtpbmQuUmV0dXJuU3RhdGVtZW50OlxuICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLklmU3RhdGVtZW50OlxuICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlN3aXRjaFN0YXRlbWVudDpcbiAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5Eb1N0YXRlbWVudDpcbiAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5XaGlsZVN0YXRlbWVudDpcbiAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5Gb3JTdGF0ZW1lbnQ6XG4gICAgICBjYXNlIHRzLlN5bnRheEtpbmQuRm9ySW5TdGF0ZW1lbnQ6XG4gICAgICBjYXNlIHRzLlN5bnRheEtpbmQuRm9yT2ZTdGF0ZW1lbnQ6XG4gICAgICBjYXNlIHRzLlN5bnRheEtpbmQuQ29udGludWVTdGF0ZW1lbnQ6XG4gICAgICBjYXNlIHRzLlN5bnRheEtpbmQuQnJlYWtTdGF0ZW1lbnQ6XG4gICAgICBjYXNlIHRzLlN5bnRheEtpbmQuVGhyb3dTdGF0ZW1lbnQ6XG4gICAgICBjYXNlIHRzLlN5bnRheEtpbmQuT2JqZWN0QmluZGluZ1BhdHRlcm46XG4gICAgICBjYXNlIHRzLlN5bnRheEtpbmQuQXJyYXlCaW5kaW5nUGF0dGVybjpcbiAgICAgICAgcmV0dXJuIGN1cnJlbnROb2RlO1xuICAgIH1cblxuICAgIGN1cnJlbnROb2RlID0gY3VycmVudE5vZGUucGFyZW50O1xuICB9XG4gIHJldHVybiBub2RlLmdldFNvdXJjZUZpbGUoKTtcbn1cbiJdfQ==