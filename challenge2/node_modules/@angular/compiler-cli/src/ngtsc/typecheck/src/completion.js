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
        define("@angular/compiler-cli/src/ngtsc/typecheck/src/completion", ["require", "exports", "tslib", "@angular/compiler", "@angular/compiler/src/compiler", "typescript", "@angular/compiler-cli/src/ngtsc/typecheck/api", "@angular/compiler-cli/src/ngtsc/typecheck/src/comments"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CompletionEngine = void 0;
    var tslib_1 = require("tslib");
    var compiler_1 = require("@angular/compiler");
    var compiler_2 = require("@angular/compiler/src/compiler");
    var ts = require("typescript");
    var api_1 = require("@angular/compiler-cli/src/ngtsc/typecheck/api");
    var comments_1 = require("@angular/compiler-cli/src/ngtsc/typecheck/src/comments");
    /**
     * Powers autocompletion for a specific component.
     *
     * Internally caches autocompletion results, and must be discarded if the component template or
     * surrounding TS program have changed.
     */
    var CompletionEngine = /** @class */ (function () {
        function CompletionEngine(tcb, data, shimPath) {
            this.tcb = tcb;
            this.data = data;
            this.shimPath = shimPath;
            /**
             * Cache of completions for various levels of the template, including the root template (`null`).
             * Memoizes `getTemplateContextCompletions`.
             */
            this.templateContextCache = new Map();
            this.expressionCompletionCache = new Map();
            // Find the component completion expression within the TCB. This looks like: `ctx. /* ... */;`
            var globalRead = comments_1.findFirstMatchingNode(this.tcb, {
                filter: ts.isPropertyAccessExpression,
                withExpressionIdentifier: comments_1.ExpressionIdentifier.COMPONENT_COMPLETION
            });
            if (globalRead !== null) {
                this.componentContext = {
                    shimPath: this.shimPath,
                    // `globalRead.name` is an empty `ts.Identifier`, so its start position immediately follows
                    // the `.` in `ctx.`. TS autocompletion APIs can then be used to access completion results
                    // for the component context.
                    positionInShimFile: globalRead.name.getStart(),
                };
            }
            else {
                this.componentContext = null;
            }
        }
        /**
         * Get global completions within the given template context and AST node.
         *
         * @param context the given template context - either a `TmplAstTemplate` embedded view, or `null`
         *     for the root
         * template context.
         * @param node the given AST node
         */
        CompletionEngine.prototype.getGlobalCompletions = function (context, node) {
            if (this.componentContext === null) {
                return null;
            }
            var templateContext = this.getTemplateContextCompletions(context);
            if (templateContext === null) {
                return null;
            }
            var nodeContext = null;
            if (node instanceof compiler_2.EmptyExpr) {
                var nodeLocation = comments_1.findFirstMatchingNode(this.tcb, {
                    filter: ts.isIdentifier,
                    withSpan: node.sourceSpan,
                });
                if (nodeLocation !== null) {
                    nodeContext = {
                        shimPath: this.shimPath,
                        positionInShimFile: nodeLocation.getStart(),
                    };
                }
            }
            return {
                componentContext: this.componentContext,
                templateContext: templateContext,
                nodeContext: nodeContext,
            };
        };
        CompletionEngine.prototype.getExpressionCompletionLocation = function (expr) {
            if (this.expressionCompletionCache.has(expr)) {
                return this.expressionCompletionCache.get(expr);
            }
            // Completion works inside property reads and method calls.
            var tsExpr = null;
            if (expr instanceof compiler_2.PropertyRead || expr instanceof compiler_2.MethodCall ||
                expr instanceof compiler_2.PropertyWrite) {
                // Non-safe navigation operations are trivial: `foo.bar` or `foo.bar()`
                tsExpr = comments_1.findFirstMatchingNode(this.tcb, {
                    filter: ts.isPropertyAccessExpression,
                    withSpan: expr.nameSpan,
                });
            }
            else if (expr instanceof compiler_2.SafePropertyRead || expr instanceof compiler_2.SafeMethodCall) {
                // Safe navigation operations are a little more complex, and involve a ternary. Completion
                // happens in the "true" case of the ternary.
                var ternaryExpr = comments_1.findFirstMatchingNode(this.tcb, {
                    filter: ts.isParenthesizedExpression,
                    withSpan: expr.sourceSpan,
                });
                if (ternaryExpr === null || !ts.isConditionalExpression(ternaryExpr.expression)) {
                    return null;
                }
                var whenTrue = ternaryExpr.expression.whenTrue;
                if (expr instanceof compiler_2.SafePropertyRead && ts.isPropertyAccessExpression(whenTrue)) {
                    tsExpr = whenTrue;
                }
                else if (expr instanceof compiler_2.SafeMethodCall && ts.isCallExpression(whenTrue) &&
                    ts.isPropertyAccessExpression(whenTrue.expression)) {
                    tsExpr = whenTrue.expression;
                }
            }
            if (tsExpr === null) {
                return null;
            }
            var res = {
                shimPath: this.shimPath,
                positionInShimFile: tsExpr.name.getEnd(),
            };
            this.expressionCompletionCache.set(expr, res);
            return res;
        };
        /**
         * Get global completions within the given template context - either a `TmplAstTemplate` embedded
         * view, or `null` for the root context.
         */
        CompletionEngine.prototype.getTemplateContextCompletions = function (context) {
            var e_1, _a;
            if (this.templateContextCache.has(context)) {
                return this.templateContextCache.get(context);
            }
            var templateContext = new Map();
            try {
                // The bound template already has details about the references and variables in scope in the
                // `context` template - they just need to be converted to `Completion`s.
                for (var _b = tslib_1.__values(this.data.boundTarget.getEntitiesInTemplateScope(context)), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var node = _c.value;
                    if (node instanceof compiler_1.TmplAstReference) {
                        templateContext.set(node.name, {
                            kind: api_1.CompletionKind.Reference,
                            node: node,
                        });
                    }
                    else {
                        templateContext.set(node.name, {
                            kind: api_1.CompletionKind.Variable,
                            node: node,
                        });
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
            this.templateContextCache.set(context, templateContext);
            return templateContext;
        };
        return CompletionEngine;
    }());
    exports.CompletionEngine = CompletionEngine;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGxldGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvbmd0c2MvdHlwZWNoZWNrL3NyYy9jb21wbGV0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCw4Q0FBb0U7SUFDcEUsMkRBQXNKO0lBQ3RKLCtCQUFpQztJQUdqQyxxRUFBK0c7SUFFL0csbUZBQXVFO0lBR3ZFOzs7OztPQUtHO0lBQ0g7UUFjRSwwQkFBb0IsR0FBWSxFQUFVLElBQWtCLEVBQVUsUUFBd0I7WUFBMUUsUUFBRyxHQUFILEdBQUcsQ0FBUztZQUFVLFNBQUksR0FBSixJQUFJLENBQWM7WUFBVSxhQUFRLEdBQVIsUUFBUSxDQUFnQjtZQVg5Rjs7O2VBR0c7WUFDSyx5QkFBb0IsR0FDeEIsSUFBSSxHQUFHLEVBQTZFLENBQUM7WUFFakYsOEJBQXlCLEdBQzdCLElBQUksR0FBRyxFQUF5RSxDQUFDO1lBSW5GLDhGQUE4RjtZQUM5RixJQUFNLFVBQVUsR0FBRyxnQ0FBcUIsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFO2dCQUNqRCxNQUFNLEVBQUUsRUFBRSxDQUFDLDBCQUEwQjtnQkFDckMsd0JBQXdCLEVBQUUsK0JBQW9CLENBQUMsb0JBQW9CO2FBQ3BFLENBQUMsQ0FBQztZQUVILElBQUksVUFBVSxLQUFLLElBQUksRUFBRTtnQkFDdkIsSUFBSSxDQUFDLGdCQUFnQixHQUFHO29CQUN0QixRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVE7b0JBQ3ZCLDJGQUEyRjtvQkFDM0YsMEZBQTBGO29CQUMxRiw2QkFBNkI7b0JBQzdCLGtCQUFrQixFQUFFLFVBQVUsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFO2lCQUMvQyxDQUFDO2FBQ0g7aUJBQU07Z0JBQ0wsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQzthQUM5QjtR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LEdBQUcsQ0FBQyxPQUFPLEVBQUUsZUFBZSxDQUFDLENBQUM7WUFDeEQsT0FBTyxlQUFlLENBQUM7UUFDekIsQ0FBQztRQUNILHVCQUFDO0lBQUQsQ0FBQyxBQXpKRCxJQXlKQztJQXpKWSw0Q0FBZ0IiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtUbXBsQXN0UmVmZXJlbmNlLCBUbXBsQXN0VGVtcGxhdGV9IGZyb20gJ0Bhbmd1bGFyL2NvbXBpbGVyJztcbmltcG9ydCB7QVNULCBFbXB0eUV4cHIsIE1ldGhvZENhbGwsIFByb3BlcnR5UmVhZCwgUHJvcGVydHlXcml0ZSwgU2FmZU1ldGhvZENhbGwsIFNhZmVQcm9wZXJ0eVJlYWQsIFRtcGxBc3ROb2RlfSBmcm9tICdAYW5ndWxhci9jb21waWxlci9zcmMvY29tcGlsZXInO1xuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbmltcG9ydCB7QWJzb2x1dGVGc1BhdGh9IGZyb20gJy4uLy4uL2ZpbGVfc3lzdGVtJztcbmltcG9ydCB7Q29tcGxldGlvbktpbmQsIEdsb2JhbENvbXBsZXRpb24sIFJlZmVyZW5jZUNvbXBsZXRpb24sIFNoaW1Mb2NhdGlvbiwgVmFyaWFibGVDb21wbGV0aW9ufSBmcm9tICcuLi9hcGknO1xuXG5pbXBvcnQge0V4cHJlc3Npb25JZGVudGlmaWVyLCBmaW5kRmlyc3RNYXRjaGluZ05vZGV9IGZyb20gJy4vY29tbWVudHMnO1xuaW1wb3J0IHtUZW1wbGF0ZURhdGF9IGZyb20gJy4vY29udGV4dCc7XG5cbi8qKlxuICogUG93ZXJzIGF1dG9jb21wbGV0aW9uIGZvciBhIHNwZWNpZmljIGNvbXBvbmVudC5cbiAqXG4gKiBJbnRlcm5hbGx5IGNhY2hlcyBhdXRvY29tcGxldGlvbiByZXN1bHRzLCBhbmQgbXVzdCBiZSBkaXNjYXJkZWQgaWYgdGhlIGNvbXBvbmVudCB0ZW1wbGF0ZSBvclxuICogc3Vycm91bmRpbmcgVFMgcHJvZ3JhbSBoYXZlIGNoYW5nZWQuXG4gKi9cbmV4cG9ydCBjbGFzcyBDb21wbGV0aW9uRW5naW5lIHtcbiAgcHJpdmF0ZSBjb21wb25lbnRDb250ZXh0OiBTaGltTG9jYXRpb258bnVsbDtcblxuICAvKipcbiAgICogQ2FjaGUgb2YgY29tcGxldGlvbnMgZm9yIHZhcmlvdXMgbGV2ZWxzIG9mIHRoZSB0ZW1wbGF0ZSwgaW5jbHVkaW5nIHRoZSByb290IHRlbXBsYXRlIChgbnVsbGApLlxuICAgKiBNZW1vaXplcyBgZ2V0VGVtcGxhdGVDb250ZXh0Q29tcGxldGlvbnNgLlxuICAgKi9cbiAgcHJpdmF0ZSB0ZW1wbGF0ZUNvbnRleHRDYWNoZSA9XG4gICAgICBuZXcgTWFwPFRtcGxBc3RUZW1wbGF0ZXxudWxsLCBNYXA8c3RyaW5nLCBSZWZlcmVuY2VDb21wbGV0aW9ufFZhcmlhYmxlQ29tcGxldGlvbj4+KCk7XG5cbiAgcHJpdmF0ZSBleHByZXNzaW9uQ29tcGxldGlvbkNhY2hlID1cbiAgICAgIG5ldyBNYXA8UHJvcGVydHlSZWFkfFNhZmVQcm9wZXJ0eVJlYWR8TWV0aG9kQ2FsbHxTYWZlTWV0aG9kQ2FsbCwgU2hpbUxvY2F0aW9uPigpO1xuXG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSB0Y2I6IHRzLk5vZGUsIHByaXZhdGUgZGF0YTogVGVtcGxhdGVEYXRhLCBwcml2YXRlIHNoaW1QYXRoOiBBYnNvbHV0ZUZzUGF0aCkge1xuICAgIC8vIEZpbmQgdGhlIGNvbXBvbmVudCBjb21wbGV0aW9uIGV4cHJlc3Npb24gd2l0aGluIHRoZSBUQ0IuIFRoaXMgbG9va3MgbGlrZTogYGN0eC4gLyogLi4uICovO2BcbiAgICBjb25zdCBnbG9iYWxSZWFkID0gZmluZEZpcnN0TWF0Y2hpbmdOb2RlKHRoaXMudGNiLCB7XG4gICAgICBmaWx0ZXI6IHRzLmlzUHJvcGVydHlBY2Nlc3NFeHByZXNzaW9uLFxuICAgICAgd2l0aEV4cHJlc3Npb25JZGVudGlmaWVyOiBFeHByZXNzaW9uSWRlbnRpZmllci5DT01QT05FTlRfQ09NUExFVElPTlxuICAgIH0pO1xuXG4gICAgaWYgKGdsb2JhbFJlYWQgIT09IG51bGwpIHtcbiAgICAgIHRoaXMuY29tcG9uZW50Q29udGV4dCA9IHtcbiAgICAgICAgc2hpbVBhdGg6IHRoaXMuc2hpbVBhdGgsXG4gICAgICAgIC8vIGBnbG9iYWxSZWFkLm5hbWVgIGlzIGFuIGVtcHR5IGB0cy5JZGVudGlmaWVyYCwgc28gaXRzIHN0YXJ0IHBvc2l0aW9uIGltbWVkaWF0ZWx5IGZvbGxvd3NcbiAgICAgICAgLy8gdGhlIGAuYCBpbiBgY3R4LmAuIFRTIGF1dG9jb21wbGV0aW9uIEFQSXMgY2FuIHRoZW4gYmUgdXNlZCB0byBhY2Nlc3MgY29tcGxldGlvbiByZXN1bHRzXG4gICAgICAgIC8vIGZvciB0aGUgY29tcG9uZW50IGNvbnRleHQuXG4gICAgICAgIHBvc2l0aW9uSW5TaGltRmlsZTogZ2xvYmFsUmVhZC5uYW1lLmdldFN0YXJ0KCksXG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmNvbXBvbmVudENvbnRleHQgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgZ2xvYmFsIGNvbXBsZXRpb25zIHdpdGhpbiB0aGUgZ2l2ZW4gdGVtcGxhdGUgY29udGV4dCBhbmQgQVNUIG5vZGUuXG4gICAqXG4gICAqIEBwYXJhbSBjb250ZXh0IHRoZSBnaXZlbiB0ZW1wbGF0ZSBjb250ZXh0IC0gZWl0aGVyIGEgYFRtcGxBc3RUZW1wbGF0ZWAgZW1iZWRkZWQgdmlldywgb3IgYG51bGxgXG4gICAqICAgICBmb3IgdGhlIHJvb3RcbiAgICogdGVtcGxhdGUgY29udGV4dC5cbiAgICogQHBhcmFtIG5vZGUgdGhlIGdpdmVuIEFTVCBub2RlXG4gICAqL1xuICBnZXRHbG9iYWxDb21wbGV0aW9ucyhjb250ZXh0OiBUbXBsQXN0VGVtcGxhdGV8bnVsbCwgbm9kZTogQVNUfFRtcGxBc3ROb2RlKTogR2xvYmFsQ29tcGxldGlvblxuICAgICAgfG51bGwge1xuICAgIGlmICh0aGlzLmNvbXBvbmVudENvbnRleHQgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IHRlbXBsYXRlQ29udGV4dCA9IHRoaXMuZ2V0VGVtcGxhdGVDb250ZXh0Q29tcGxldGlvbnMoY29udGV4dCk7XG4gICAgaWYgKHRlbXBsYXRlQ29udGV4dCA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgbGV0IG5vZGVDb250ZXh0OiBTaGltTG9jYXRpb258bnVsbCA9IG51bGw7XG4gICAgaWYgKG5vZGUgaW5zdGFuY2VvZiBFbXB0eUV4cHIpIHtcbiAgICAgIGNvbnN0IG5vZGVMb2NhdGlvbiA9IGZpbmRGaXJzdE1hdGNoaW5nTm9kZSh0aGlzLnRjYiwge1xuICAgICAgICBmaWx0ZXI6IHRzLmlzSWRlbnRpZmllcixcbiAgICAgICAgd2l0aFNwYW46IG5vZGUuc291cmNlU3BhbixcbiAgICAgIH0pO1xuICAgICAgaWYgKG5vZGVMb2NhdGlvbiAhPT0gbnVsbCkge1xuICAgICAgICBub2RlQ29udGV4dCA9IHtcbiAgICAgICAgICBzaGltUGF0aDogdGhpcy5zaGltUGF0aCxcbiAgICAgICAgICBwb3NpdGlvbkluU2hpbUZpbGU6IG5vZGVMb2NhdGlvbi5nZXRTdGFydCgpLFxuICAgICAgICB9O1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBjb21wb25lbnRDb250ZXh0OiB0aGlzLmNvbXBvbmVudENvbnRleHQsXG4gICAgICB0ZW1wbGF0ZUNvbnRleHQsXG4gICAgICBub2RlQ29udGV4dCxcbiAgICB9O1xuICB9XG5cbiAgZ2V0RXhwcmVzc2lvbkNvbXBsZXRpb25Mb2NhdGlvbihleHByOiBQcm9wZXJ0eVJlYWR8UHJvcGVydHlXcml0ZXxNZXRob2RDYWxsfFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFNhZmVNZXRob2RDYWxsKTogU2hpbUxvY2F0aW9ufG51bGwge1xuICAgIGlmICh0aGlzLmV4cHJlc3Npb25Db21wbGV0aW9uQ2FjaGUuaGFzKGV4cHIpKSB7XG4gICAgICByZXR1cm4gdGhpcy5leHByZXNzaW9uQ29tcGxldGlvbkNhY2hlLmdldChleHByKSE7XG4gICAgfVxuXG4gICAgLy8gQ29tcGxldGlvbiB3b3JrcyBpbnNpZGUgcHJvcGVydHkgcmVhZHMgYW5kIG1ldGhvZCBjYWxscy5cbiAgICBsZXQgdHNFeHByOiB0cy5Qcm9wZXJ0eUFjY2Vzc0V4cHJlc3Npb258bnVsbCA9IG51bGw7XG4gICAgaWYgKGV4cHIgaW5zdGFuY2VvZiBQcm9wZXJ0eVJlYWQgfHwgZXhwciBpbnN0YW5jZW9mIE1ldGhvZENhbGwgfHxcbiAgICAgICAgZXhwciBpbnN0YW5jZW9mIFByb3BlcnR5V3JpdGUpIHtcbiAgICAgIC8vIE5vbi1zYWZlIG5hdmlnYXRpb24gb3BlcmF0aW9ucyBhcmUgdHJpdmlhbDogYGZvby5iYXJgIG9yIGBmb28uYmFyKClgXG4gICAgICB0c0V4cHIgPSBmaW5kRmlyc3RNYXRjaGluZ05vZGUodGhpcy50Y2IsIHtcbiAgICAgICAgZmlsdGVyOiB0cy5pc1Byb3BlcnR5QWNjZXNzRXhwcmVzc2lvbixcbiAgICAgICAgd2l0aFNwYW46IGV4cHIubmFtZVNwYW4sXG4gICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKGV4cHIgaW5zdGFuY2VvZiBTYWZlUHJvcGVydHlSZWFkIHx8IGV4cHIgaW5zdGFuY2VvZiBTYWZlTWV0aG9kQ2FsbCkge1xuICAgICAgLy8gU2FmZSBuYXZpZ2F0aW9uIG9wZXJhdGlvbnMgYXJlIGEgbGl0dGxlIG1vcmUgY29tcGxleCwgYW5kIGludm9sdmUgYSB0ZXJuYXJ5LiBDb21wbGV0aW9uXG4gICAgICAvLyBoYXBwZW5zIGluIHRoZSBcInRydWVcIiBjYXNlIG9mIHRoZSB0ZXJuYXJ5LlxuICAgICAgY29uc3QgdGVybmFyeUV4cHIgPSBmaW5kRmlyc3RNYXRjaGluZ05vZGUodGhpcy50Y2IsIHtcbiAgICAgICAgZmlsdGVyOiB0cy5pc1BhcmVudGhlc2l6ZWRFeHByZXNzaW9uLFxuICAgICAgICB3aXRoU3BhbjogZXhwci5zb3VyY2VTcGFuLFxuICAgICAgfSk7XG4gICAgICBpZiAodGVybmFyeUV4cHIgPT09IG51bGwgfHwgIXRzLmlzQ29uZGl0aW9uYWxFeHByZXNzaW9uKHRlcm5hcnlFeHByLmV4cHJlc3Npb24pKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgY29uc3Qgd2hlblRydWUgPSB0ZXJuYXJ5RXhwci5leHByZXNzaW9uLndoZW5UcnVlO1xuXG4gICAgICBpZiAoZXhwciBpbnN0YW5jZW9mIFNhZmVQcm9wZXJ0eVJlYWQgJiYgdHMuaXNQcm9wZXJ0eUFjY2Vzc0V4cHJlc3Npb24od2hlblRydWUpKSB7XG4gICAgICAgIHRzRXhwciA9IHdoZW5UcnVlO1xuICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgICBleHByIGluc3RhbmNlb2YgU2FmZU1ldGhvZENhbGwgJiYgdHMuaXNDYWxsRXhwcmVzc2lvbih3aGVuVHJ1ZSkgJiZcbiAgICAgICAgICB0cy5pc1Byb3BlcnR5QWNjZXNzRXhwcmVzc2lvbih3aGVuVHJ1ZS5leHByZXNzaW9uKSkge1xuICAgICAgICB0c0V4cHIgPSB3aGVuVHJ1ZS5leHByZXNzaW9uO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0c0V4cHIgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IHJlczogU2hpbUxvY2F0aW9uID0ge1xuICAgICAgc2hpbVBhdGg6IHRoaXMuc2hpbVBhdGgsXG4gICAgICBwb3NpdGlvbkluU2hpbUZpbGU6IHRzRXhwci5uYW1lLmdldEVuZCgpLFxuICAgIH07XG4gICAgdGhpcy5leHByZXNzaW9uQ29tcGxldGlvbkNhY2hlLnNldChleHByLCByZXMpO1xuICAgIHJldHVybiByZXM7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGdsb2JhbCBjb21wbGV0aW9ucyB3aXRoaW4gdGhlIGdpdmVuIHRlbXBsYXRlIGNvbnRleHQgLSBlaXRoZXIgYSBgVG1wbEFzdFRlbXBsYXRlYCBlbWJlZGRlZFxuICAgKiB2aWV3LCBvciBgbnVsbGAgZm9yIHRoZSByb290IGNvbnRleHQuXG4gICAqL1xuICBwcml2YXRlIGdldFRlbXBsYXRlQ29udGV4dENvbXBsZXRpb25zKGNvbnRleHQ6IFRtcGxBc3RUZW1wbGF0ZXxudWxsKTpcbiAgICAgIE1hcDxzdHJpbmcsIFJlZmVyZW5jZUNvbXBsZXRpb258VmFyaWFibGVDb21wbGV0aW9uPnxudWxsIHtcbiAgICBpZiAodGhpcy50ZW1wbGF0ZUNvbnRleHRDYWNoZS5oYXMoY29udGV4dCkpIHtcbiAgICAgIHJldHVybiB0aGlzLnRlbXBsYXRlQ29udGV4dENhY2hlLmdldChjb250ZXh0KSE7XG4gICAgfVxuXG4gICAgY29uc3QgdGVtcGxhdGVDb250ZXh0ID0gbmV3IE1hcDxzdHJpbmcsIFJlZmVyZW5jZUNvbXBsZXRpb258VmFyaWFibGVDb21wbGV0aW9uPigpO1xuXG4gICAgLy8gVGhlIGJvdW5kIHRlbXBsYXRlIGFscmVhZHkgaGFzIGRldGFpbHMgYWJvdXQgdGhlIHJlZmVyZW5jZXMgYW5kIHZhcmlhYmxlcyBpbiBzY29wZSBpbiB0aGVcbiAgICAvLyBgY29udGV4dGAgdGVtcGxhdGUgLSB0aGV5IGp1c3QgbmVlZCB0byBiZSBjb252ZXJ0ZWQgdG8gYENvbXBsZXRpb25gcy5cbiAgICBmb3IgKGNvbnN0IG5vZGUgb2YgdGhpcy5kYXRhLmJvdW5kVGFyZ2V0LmdldEVudGl0aWVzSW5UZW1wbGF0ZVNjb3BlKGNvbnRleHQpKSB7XG4gICAgICBpZiAobm9kZSBpbnN0YW5jZW9mIFRtcGxBc3RSZWZlcmVuY2UpIHtcbiAgICAgICAgdGVtcGxhdGVDb250ZXh0LnNldChub2RlLm5hbWUsIHtcbiAgICAgICAgICBraW5kOiBDb21wbGV0aW9uS2luZC5SZWZlcmVuY2UsXG4gICAgICAgICAgbm9kZSxcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0ZW1wbGF0ZUNvbnRleHQuc2V0KG5vZGUubmFtZSwge1xuICAgICAgICAgIGtpbmQ6IENvbXBsZXRpb25LaW5kLlZhcmlhYmxlLFxuICAgICAgICAgIG5vZGUsXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMudGVtcGxhdGVDb250ZXh0Q2FjaGUuc2V0KGNvbnRleHQsIHRlbXBsYXRlQ29udGV4dCk7XG4gICAgcmV0dXJuIHRlbXBsYXRlQ29udGV4dDtcbiAgfVxufVxuIl19