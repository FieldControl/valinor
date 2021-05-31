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
        define("@angular/compiler-cli/src/ngtsc/typecheck/src/expression", ["require", "exports", "@angular/compiler", "typescript", "@angular/compiler-cli/src/ngtsc/typecheck/src/diagnostics", "@angular/compiler-cli/src/ngtsc/typecheck/src/ts_util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.astToTypescript = exports.NULL_AS_ANY = void 0;
    var compiler_1 = require("@angular/compiler");
    var ts = require("typescript");
    var diagnostics_1 = require("@angular/compiler-cli/src/ngtsc/typecheck/src/diagnostics");
    var ts_util_1 = require("@angular/compiler-cli/src/ngtsc/typecheck/src/ts_util");
    exports.NULL_AS_ANY = ts.createAsExpression(ts.createNull(), ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword));
    var UNDEFINED = ts.createIdentifier('undefined');
    var UNARY_OPS = new Map([
        ['+', ts.SyntaxKind.PlusToken],
        ['-', ts.SyntaxKind.MinusToken],
    ]);
    var BINARY_OPS = new Map([
        ['+', ts.SyntaxKind.PlusToken],
        ['-', ts.SyntaxKind.MinusToken],
        ['<', ts.SyntaxKind.LessThanToken],
        ['>', ts.SyntaxKind.GreaterThanToken],
        ['<=', ts.SyntaxKind.LessThanEqualsToken],
        ['>=', ts.SyntaxKind.GreaterThanEqualsToken],
        ['==', ts.SyntaxKind.EqualsEqualsToken],
        ['===', ts.SyntaxKind.EqualsEqualsEqualsToken],
        ['*', ts.SyntaxKind.AsteriskToken],
        ['/', ts.SyntaxKind.SlashToken],
        ['%', ts.SyntaxKind.PercentToken],
        ['!=', ts.SyntaxKind.ExclamationEqualsToken],
        ['!==', ts.SyntaxKind.ExclamationEqualsEqualsToken],
        ['||', ts.SyntaxKind.BarBarToken],
        ['&&', ts.SyntaxKind.AmpersandAmpersandToken],
        ['&', ts.SyntaxKind.AmpersandToken],
        ['|', ts.SyntaxKind.BarToken],
        ['??', ts.SyntaxKind.QuestionQuestionToken],
    ]);
    /**
     * Convert an `AST` to TypeScript code directly, without going through an intermediate `Expression`
     * AST.
     */
    function astToTypescript(ast, maybeResolve, config) {
        var translator = new AstTranslator(maybeResolve, config);
        return translator.translate(ast);
    }
    exports.astToTypescript = astToTypescript;
    var AstTranslator = /** @class */ (function () {
        function AstTranslator(maybeResolve, config) {
            this.maybeResolve = maybeResolve;
            this.config = config;
        }
        AstTranslator.prototype.translate = function (ast) {
            // Skip over an `ASTWithSource` as its `visit` method calls directly into its ast's `visit`,
            // which would prevent any custom resolution through `maybeResolve` for that node.
            if (ast instanceof compiler_1.ASTWithSource) {
                ast = ast.ast;
            }
            // The `EmptyExpr` doesn't have a dedicated method on `AstVisitor`, so it's special cased here.
            if (ast instanceof compiler_1.EmptyExpr) {
                var res = ts.factory.createIdentifier('undefined');
                diagnostics_1.addParseSpanInfo(res, ast.sourceSpan);
                return res;
            }
            // First attempt to let any custom resolution logic provide a translation for the given node.
            var resolved = this.maybeResolve(ast);
            if (resolved !== null) {
                return resolved;
            }
            return ast.visit(this);
        };
        AstTranslator.prototype.visitUnary = function (ast) {
            var expr = this.translate(ast.expr);
            var op = UNARY_OPS.get(ast.operator);
            if (op === undefined) {
                throw new Error("Unsupported Unary.operator: " + ast.operator);
            }
            var node = diagnostics_1.wrapForDiagnostics(ts.createPrefix(op, expr));
            diagnostics_1.addParseSpanInfo(node, ast.sourceSpan);
            return node;
        };
        AstTranslator.prototype.visitBinary = function (ast) {
            var lhs = diagnostics_1.wrapForDiagnostics(this.translate(ast.left));
            var rhs = diagnostics_1.wrapForDiagnostics(this.translate(ast.right));
            var op = BINARY_OPS.get(ast.operation);
            if (op === undefined) {
                throw new Error("Unsupported Binary.operation: " + ast.operation);
            }
            var node = ts.createBinary(lhs, op, rhs);
            diagnostics_1.addParseSpanInfo(node, ast.sourceSpan);
            return node;
        };
        AstTranslator.prototype.visitChain = function (ast) {
            var _this = this;
            var elements = ast.expressions.map(function (expr) { return _this.translate(expr); });
            var node = diagnostics_1.wrapForDiagnostics(ts.createCommaList(elements));
            diagnostics_1.addParseSpanInfo(node, ast.sourceSpan);
            return node;
        };
        AstTranslator.prototype.visitConditional = function (ast) {
            var condExpr = this.translate(ast.condition);
            var trueExpr = this.translate(ast.trueExp);
            // Wrap `falseExpr` in parens so that the trailing parse span info is not attributed to the
            // whole conditional.
            // In the following example, the last source span comment (5,6) could be seen as the
            // trailing comment for _either_ the whole conditional expression _or_ just the `falseExpr` that
            // is immediately before it:
            // `conditional /*1,2*/ ? trueExpr /*3,4*/ : falseExpr /*5,6*/`
            // This should be instead be `conditional /*1,2*/ ? trueExpr /*3,4*/ : (falseExpr /*5,6*/)`
            var falseExpr = diagnostics_1.wrapForTypeChecker(this.translate(ast.falseExp));
            var node = ts.createParen(ts.createConditional(condExpr, trueExpr, falseExpr));
            diagnostics_1.addParseSpanInfo(node, ast.sourceSpan);
            return node;
        };
        AstTranslator.prototype.visitFunctionCall = function (ast) {
            var _this = this;
            var receiver = diagnostics_1.wrapForDiagnostics(this.translate(ast.target));
            var args = ast.args.map(function (expr) { return _this.translate(expr); });
            var node = ts.createCall(receiver, undefined, args);
            diagnostics_1.addParseSpanInfo(node, ast.sourceSpan);
            return node;
        };
        AstTranslator.prototype.visitImplicitReceiver = function (ast) {
            throw new Error('Method not implemented.');
        };
        AstTranslator.prototype.visitThisReceiver = function (ast) {
            throw new Error('Method not implemented.');
        };
        AstTranslator.prototype.visitInterpolation = function (ast) {
            var _this = this;
            // Build up a chain of binary + operations to simulate the string concatenation of the
            // interpolation's expressions. The chain is started using an actual string literal to ensure
            // the type is inferred as 'string'.
            return ast.expressions.reduce(function (lhs, ast) {
                return ts.createBinary(lhs, ts.SyntaxKind.PlusToken, diagnostics_1.wrapForTypeChecker(_this.translate(ast)));
            }, ts.createLiteral(''));
        };
        AstTranslator.prototype.visitKeyedRead = function (ast) {
            var receiver = diagnostics_1.wrapForDiagnostics(this.translate(ast.obj));
            var key = this.translate(ast.key);
            var node = ts.createElementAccess(receiver, key);
            diagnostics_1.addParseSpanInfo(node, ast.sourceSpan);
            return node;
        };
        AstTranslator.prototype.visitKeyedWrite = function (ast) {
            var receiver = diagnostics_1.wrapForDiagnostics(this.translate(ast.obj));
            var left = ts.createElementAccess(receiver, this.translate(ast.key));
            // TODO(joost): annotate `left` with the span of the element access, which is not currently
            //  available on `ast`.
            var right = diagnostics_1.wrapForTypeChecker(this.translate(ast.value));
            var node = diagnostics_1.wrapForDiagnostics(ts.createBinary(left, ts.SyntaxKind.EqualsToken, right));
            diagnostics_1.addParseSpanInfo(node, ast.sourceSpan);
            return node;
        };
        AstTranslator.prototype.visitLiteralArray = function (ast) {
            var _this = this;
            var elements = ast.expressions.map(function (expr) { return _this.translate(expr); });
            var literal = ts.createArrayLiteral(elements);
            // If strictLiteralTypes is disabled, array literals are cast to `any`.
            var node = this.config.strictLiteralTypes ? literal : ts_util_1.tsCastToAny(literal);
            diagnostics_1.addParseSpanInfo(node, ast.sourceSpan);
            return node;
        };
        AstTranslator.prototype.visitLiteralMap = function (ast) {
            var _this = this;
            var properties = ast.keys.map(function (_a, idx) {
                var key = _a.key;
                var value = _this.translate(ast.values[idx]);
                return ts.createPropertyAssignment(ts.createStringLiteral(key), value);
            });
            var literal = ts.createObjectLiteral(properties, true);
            // If strictLiteralTypes is disabled, object literals are cast to `any`.
            var node = this.config.strictLiteralTypes ? literal : ts_util_1.tsCastToAny(literal);
            diagnostics_1.addParseSpanInfo(node, ast.sourceSpan);
            return node;
        };
        AstTranslator.prototype.visitLiteralPrimitive = function (ast) {
            var node;
            if (ast.value === undefined) {
                node = ts.createIdentifier('undefined');
            }
            else if (ast.value === null) {
                node = ts.createNull();
            }
            else {
                node = ts.createLiteral(ast.value);
            }
            diagnostics_1.addParseSpanInfo(node, ast.sourceSpan);
            return node;
        };
        AstTranslator.prototype.visitMethodCall = function (ast) {
            var _this = this;
            var receiver = diagnostics_1.wrapForDiagnostics(this.translate(ast.receiver));
            var method = ts.createPropertyAccess(receiver, ast.name);
            diagnostics_1.addParseSpanInfo(method, ast.nameSpan);
            var args = ast.args.map(function (expr) { return _this.translate(expr); });
            var node = ts.createCall(method, undefined, args);
            diagnostics_1.addParseSpanInfo(node, ast.sourceSpan);
            return node;
        };
        AstTranslator.prototype.visitNonNullAssert = function (ast) {
            var expr = diagnostics_1.wrapForDiagnostics(this.translate(ast.expression));
            var node = ts.createNonNullExpression(expr);
            diagnostics_1.addParseSpanInfo(node, ast.sourceSpan);
            return node;
        };
        AstTranslator.prototype.visitPipe = function (ast) {
            throw new Error('Method not implemented.');
        };
        AstTranslator.prototype.visitPrefixNot = function (ast) {
            var expression = diagnostics_1.wrapForDiagnostics(this.translate(ast.expression));
            var node = ts.createLogicalNot(expression);
            diagnostics_1.addParseSpanInfo(node, ast.sourceSpan);
            return node;
        };
        AstTranslator.prototype.visitPropertyRead = function (ast) {
            // This is a normal property read - convert the receiver to an expression and emit the correct
            // TypeScript expression to read the property.
            var receiver = diagnostics_1.wrapForDiagnostics(this.translate(ast.receiver));
            var name = ts.createPropertyAccess(receiver, ast.name);
            diagnostics_1.addParseSpanInfo(name, ast.nameSpan);
            var node = diagnostics_1.wrapForDiagnostics(name);
            diagnostics_1.addParseSpanInfo(node, ast.sourceSpan);
            return node;
        };
        AstTranslator.prototype.visitPropertyWrite = function (ast) {
            var receiver = diagnostics_1.wrapForDiagnostics(this.translate(ast.receiver));
            var left = ts.createPropertyAccess(receiver, ast.name);
            diagnostics_1.addParseSpanInfo(left, ast.nameSpan);
            // TypeScript reports assignment errors on the entire lvalue expression. Annotate the lvalue of
            // the assignment with the sourceSpan, which includes receivers, rather than nameSpan for
            // consistency of the diagnostic location.
            // a.b.c = 1
            // ^^^^^^^^^ sourceSpan
            //     ^     nameSpan
            var leftWithPath = diagnostics_1.wrapForDiagnostics(left);
            diagnostics_1.addParseSpanInfo(leftWithPath, ast.sourceSpan);
            // The right needs to be wrapped in parens as well or we cannot accurately match its
            // span to just the RHS. For example, the span in `e = $event /*0,10*/` is ambiguous.
            // It could refer to either the whole binary expression or just the RHS.
            // We should instead generate `e = ($event /*0,10*/)` so we know the span 0,10 matches RHS.
            var right = diagnostics_1.wrapForTypeChecker(this.translate(ast.value));
            var node = diagnostics_1.wrapForDiagnostics(ts.createBinary(leftWithPath, ts.SyntaxKind.EqualsToken, right));
            diagnostics_1.addParseSpanInfo(node, ast.sourceSpan);
            return node;
        };
        AstTranslator.prototype.visitQuote = function (ast) {
            return exports.NULL_AS_ANY;
        };
        AstTranslator.prototype.visitSafeMethodCall = function (ast) {
            var _this = this;
            // See the comments in SafePropertyRead above for an explanation of the cases here.
            var node;
            var receiver = diagnostics_1.wrapForDiagnostics(this.translate(ast.receiver));
            var args = ast.args.map(function (expr) { return _this.translate(expr); });
            if (this.config.strictSafeNavigationTypes) {
                // "a?.method(...)" becomes (null as any ? a!.method(...) : undefined)
                var method = ts.createPropertyAccess(ts.createNonNullExpression(receiver), ast.name);
                diagnostics_1.addParseSpanInfo(method, ast.nameSpan);
                var call = ts.createCall(method, undefined, args);
                node = ts.createParen(ts.createConditional(exports.NULL_AS_ANY, call, UNDEFINED));
            }
            else if (VeSafeLhsInferenceBugDetector.veWillInferAnyFor(ast)) {
                // "a?.method(...)" becomes (a as any).method(...)
                var method = ts.createPropertyAccess(ts_util_1.tsCastToAny(receiver), ast.name);
                diagnostics_1.addParseSpanInfo(method, ast.nameSpan);
                node = ts.createCall(method, undefined, args);
            }
            else {
                // "a?.method(...)" becomes (a!.method(...) as any)
                var method = ts.createPropertyAccess(ts.createNonNullExpression(receiver), ast.name);
                diagnostics_1.addParseSpanInfo(method, ast.nameSpan);
                node = ts_util_1.tsCastToAny(ts.createCall(method, undefined, args));
            }
            diagnostics_1.addParseSpanInfo(node, ast.sourceSpan);
            return node;
        };
        AstTranslator.prototype.visitSafePropertyRead = function (ast) {
            var node;
            var receiver = diagnostics_1.wrapForDiagnostics(this.translate(ast.receiver));
            // The form of safe property reads depends on whether strictness is in use.
            if (this.config.strictSafeNavigationTypes) {
                // Basically, the return here is either the type of the complete expression with a null-safe
                // property read, or `undefined`. So a ternary is used to create an "or" type:
                // "a?.b" becomes (null as any ? a!.b : undefined)
                // The type of this expression is (typeof a!.b) | undefined, which is exactly as desired.
                var expr = ts.createPropertyAccess(ts.createNonNullExpression(receiver), ast.name);
                diagnostics_1.addParseSpanInfo(expr, ast.nameSpan);
                node = ts.createParen(ts.createConditional(exports.NULL_AS_ANY, expr, UNDEFINED));
            }
            else if (VeSafeLhsInferenceBugDetector.veWillInferAnyFor(ast)) {
                // Emulate a View Engine bug where 'any' is inferred for the left-hand side of the safe
                // navigation operation. With this bug, the type of the left-hand side is regarded as any.
                // Therefore, the left-hand side only needs repeating in the output (to validate it), and then
                // 'any' is used for the rest of the expression. This is done using a comma operator:
                // "a?.b" becomes (a as any).b, which will of course have type 'any'.
                node = ts.createPropertyAccess(ts_util_1.tsCastToAny(receiver), ast.name);
            }
            else {
                // The View Engine bug isn't active, so check the entire type of the expression, but the final
                // result is still inferred as `any`.
                // "a?.b" becomes (a!.b as any)
                var expr = ts.createPropertyAccess(ts.createNonNullExpression(receiver), ast.name);
                diagnostics_1.addParseSpanInfo(expr, ast.nameSpan);
                node = ts_util_1.tsCastToAny(expr);
            }
            diagnostics_1.addParseSpanInfo(node, ast.sourceSpan);
            return node;
        };
        return AstTranslator;
    }());
    /**
     * Checks whether View Engine will infer a type of 'any' for the left-hand side of a safe navigation
     * operation.
     *
     * In View Engine's template type-checker, certain receivers of safe navigation operations will
     * cause a temporary variable to be allocated as part of the checking expression, to save the value
     * of the receiver and use it more than once in the expression. This temporary variable has type
     * 'any'. In practice, this means certain receivers cause View Engine to not check the full
     * expression, and other receivers will receive more complete checking.
     *
     * For compatibility, this logic is adapted from View Engine's expression_converter.ts so that the
     * Ivy checker can emulate this bug when needed.
     */
    var VeSafeLhsInferenceBugDetector = /** @class */ (function () {
        function VeSafeLhsInferenceBugDetector() {
        }
        VeSafeLhsInferenceBugDetector.veWillInferAnyFor = function (ast) {
            return ast.receiver.visit(VeSafeLhsInferenceBugDetector.SINGLETON);
        };
        VeSafeLhsInferenceBugDetector.prototype.visitUnary = function (ast) {
            return ast.expr.visit(this);
        };
        VeSafeLhsInferenceBugDetector.prototype.visitBinary = function (ast) {
            return ast.left.visit(this) || ast.right.visit(this);
        };
        VeSafeLhsInferenceBugDetector.prototype.visitChain = function (ast) {
            return false;
        };
        VeSafeLhsInferenceBugDetector.prototype.visitConditional = function (ast) {
            return ast.condition.visit(this) || ast.trueExp.visit(this) || ast.falseExp.visit(this);
        };
        VeSafeLhsInferenceBugDetector.prototype.visitFunctionCall = function (ast) {
            return true;
        };
        VeSafeLhsInferenceBugDetector.prototype.visitImplicitReceiver = function (ast) {
            return false;
        };
        VeSafeLhsInferenceBugDetector.prototype.visitThisReceiver = function (ast) {
            return false;
        };
        VeSafeLhsInferenceBugDetector.prototype.visitInterpolation = function (ast) {
            var _this = this;
            return ast.expressions.some(function (exp) { return exp.visit(_this); });
        };
        VeSafeLhsInferenceBugDetector.prototype.visitKeyedRead = function (ast) {
            return false;
        };
        VeSafeLhsInferenceBugDetector.prototype.visitKeyedWrite = function (ast) {
            return false;
        };
        VeSafeLhsInferenceBugDetector.prototype.visitLiteralArray = function (ast) {
            return true;
        };
        VeSafeLhsInferenceBugDetector.prototype.visitLiteralMap = function (ast) {
            return true;
        };
        VeSafeLhsInferenceBugDetector.prototype.visitLiteralPrimitive = function (ast) {
            return false;
        };
        VeSafeLhsInferenceBugDetector.prototype.visitMethodCall = function (ast) {
            return true;
        };
        VeSafeLhsInferenceBugDetector.prototype.visitPipe = function (ast) {
            return true;
        };
        VeSafeLhsInferenceBugDetector.prototype.visitPrefixNot = function (ast) {
            return ast.expression.visit(this);
        };
        VeSafeLhsInferenceBugDetector.prototype.visitNonNullAssert = function (ast) {
            return ast.expression.visit(this);
        };
        VeSafeLhsInferenceBugDetector.prototype.visitPropertyRead = function (ast) {
            return false;
        };
        VeSafeLhsInferenceBugDetector.prototype.visitPropertyWrite = function (ast) {
            return false;
        };
        VeSafeLhsInferenceBugDetector.prototype.visitQuote = function (ast) {
            return false;
        };
        VeSafeLhsInferenceBugDetector.prototype.visitSafeMethodCall = function (ast) {
            return true;
        };
        VeSafeLhsInferenceBugDetector.prototype.visitSafePropertyRead = function (ast) {
            return false;
        };
        VeSafeLhsInferenceBugDetector.SINGLETON = new VeSafeLhsInferenceBugDetector();
        return VeSafeLhsInferenceBugDetector;
    }());
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwcmVzc2lvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvbmd0c2MvdHlwZWNoZWNrL3NyYy9leHByZXNzaW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQUVILDhDQUF3VztJQUN4VywrQkFBaUM7SUFJakMseUZBQXVGO0lBQ3ZGLGlGQUFzQztJQUV6QixRQUFBLFdBQVcsR0FDcEIsRUFBRSxDQUFDLGtCQUFrQixDQUFDLEVBQUUsQ0FBQyxVQUFVLEVBQUUsRUFBRSxFQUFFLENBQUMscUJBQXFCLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO0lBQy9GLElBQU0sU0FBUyxHQUFHLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUVuRCxJQUFNLFNBQVMsR0FBRyxJQUFJLEdBQUcsQ0FBaUM7UUFDeEQsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUM7UUFDOUIsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUM7S0FDaEMsQ0FBQyxDQUFDO0lBRUgsSUFBTSxVQUFVLEdBQUcsSUFBSSxHQUFHLENBQTRCO1FBQ3BELENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDO1FBQzlCLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDO1FBQy9CLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDO1FBQ2xDLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLENBQUM7UUFDckMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxtQkFBbUIsQ0FBQztRQUN6QyxD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QzNCLE9BQU8sR0FBRyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDcEMsQ0FBQztRQUNELDBEQUFrQixHQUFsQixVQUFtQixHQUFjO1lBQy9CLE9BQU8sR0FBRyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDcEMsQ0FBQztRQUNELHlEQUFpQixHQUFqQixVQUFrQixHQUFpQjtZQUNqQyxPQUFPLEtBQUssQ0FBQztRQUNmLENBQUM7UUFDRCwwREFBa0IsR0FBbEIsVUFBbUIsR0FBa0I7WUFDbkMsT0FBTyxLQUFLLENBQUM7UUFDZixDQUFDO1FBQ0Qsa0RBQVUsR0FBVixVQUFXLEdBQVU7WUFDbkIsT0FBTyxLQUFLLENBQUM7UUFDZixDQUFDO1FBQ0QsMkRBQW1CLEdBQW5CLFVBQW9CLEdBQW1CO1lBQ3JDLE9BQU8sSUFBSSxDQUFDO1FBQ2QsQ0FBQztRQUNELDZEQUFxQixHQUFyQixVQUFzQixHQUFxQjtZQUN6QyxPQUFPLEtBQUssQ0FBQztRQUNmLENBQUM7UUF2RWMsdUNBQVMsR0FBRyxJQUFJLDZCQUE2QixFQUFFLENBQUM7UUF3RWpFLG9DQUFDO0tBQUEsQUF6RUQsSUF5RUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtBU1QsIEFzdFZpc2l0b3IsIEFTVFdpdGhTb3VyY2UsIEJpbmFyeSwgQmluZGluZ1BpcGUsIENoYWluLCBDb25kaXRpb25hbCwgRW1wdHlFeHByLCBGdW5jdGlvbkNhbGwsIEltcGxpY2l0UmVjZWl2ZXIsIEludGVycG9sYXRpb24sIEtleWVkUmVhZCwgS2V5ZWRXcml0ZSwgTGl0ZXJhbEFycmF5LCBMaXRlcmFsTWFwLCBMaXRlcmFsUHJpbWl0aXZlLCBNZXRob2RDYWxsLCBOb25OdWxsQXNzZXJ0LCBQcmVmaXhOb3QsIFByb3BlcnR5UmVhZCwgUHJvcGVydHlXcml0ZSwgUXVvdGUsIFNhZmVNZXRob2RDYWxsLCBTYWZlUHJvcGVydHlSZWFkLCBUaGlzUmVjZWl2ZXIsIFVuYXJ5fSBmcm9tICdAYW5ndWxhci9jb21waWxlcic7XG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcblxuaW1wb3J0IHtUeXBlQ2hlY2tpbmdDb25maWd9IGZyb20gJy4uL2FwaSc7XG5cbmltcG9ydCB7YWRkUGFyc2VTcGFuSW5mbywgd3JhcEZvckRpYWdub3N0aWNzLCB3cmFwRm9yVHlwZUNoZWNrZXJ9IGZyb20gJy4vZGlhZ25vc3RpY3MnO1xuaW1wb3J0IHt0c0Nhc3RUb0FueX0gZnJvbSAnLi90c191dGlsJztcblxuZXhwb3J0IGNvbnN0IE5VTExfQVNfQU5ZID1cbiAgICB0cy5jcmVhdGVBc0V4cHJlc3Npb24odHMuY3JlYXRlTnVsbCgpLCB0cy5jcmVhdGVLZXl3b3JkVHlwZU5vZGUodHMuU3ludGF4S2luZC5BbnlLZXl3b3JkKSk7XG5jb25zdCBVTkRFRklORUQgPSB0cy5jcmVhdGVJZGVudGlmaWVyKCd1bmRlZmluZWQnKTtcblxuY29uc3QgVU5BUllfT1BTID0gbmV3IE1hcDxzdHJpbmcsIHRzLlByZWZpeFVuYXJ5T3BlcmF0b3I+KFtcbiAgWycrJywgdHMuU3ludGF4S2luZC5QbHVzVG9rZW5dLFxuICBbJy0nLCB0cy5TeW50YXhLaW5kLk1pbnVzVG9rZW5dLFxuXSk7XG5cbmNvbnN0IEJJTkFSWV9PUFMgPSBuZXcgTWFwPHN0cmluZywgdHMuQmluYXJ5T3BlcmF0b3I+KFtcbiAgWycrJywgdHMuU3ludGF4S2luZC5QbHVzVG9rZW5dLFxuICBbJy0nLCB0cy5TeW50YXhLaW5kLk1pbnVzVG9rZW5dLFxuICBbJzwnLCB0cy5TeW50YXhLaW5kLkxlc3NUaGFuVG9rZW5dLFxuICBbJz4nLCB0cy5TeW50YXhLaW5kLkdyZWF0ZXJUaGFuVG9rZW5dLFxuICBbJzw9JywgdHMuU3ludGF4S2luZC5MZXNzVGhhbkVxdWFsc1Rva2VuXSxcbiAgWyc+PScsIHRzLlN5bnRheEtpbmQuR3JlYXRlclRoYW5FcXVhbHNUb2tlbl0sXG4gIFsnPT0nLCB0cy5TeW50YXhLaW5kLkVxdWFsc0VxdWFsc1Rva2VuXSxcbiAgWyc9PT0nLCB0cy5TeW50YXhLaW5kLkVxdWFsc0VxdWFsc0VxdWFsc1Rva2VuXSxcbiAgWycqJywgdHMuU3ludGF4S2luZC5Bc3Rlcmlza1Rva2VuXSxcbiAgWycvJywgdHMuU3ludGF4S2luZC5TbGFzaFRva2VuXSxcbiAgWyclJywgdHMuU3ludGF4S2luZC5QZXJjZW50VG9rZW5dLFxuICBbJyE9JywgdHMuU3ludGF4S2luZC5FeGNsYW1hdGlvbkVxdWFsc1Rva2VuXSxcbiAgWychPT0nLCB0cy5TeW50YXhLaW5kLkV4Y2xhbWF0aW9uRXF1YWxzRXF1YWxzVG9rZW5dLFxuICBbJ3x8JywgdHMuU3ludGF4S2luZC5CYXJCYXJUb2tlbl0sXG4gIFsnJiYnLCB0cy5TeW50YXhLaW5kLkFtcGVyc2FuZEFtcGVyc2FuZFRva2VuXSxcbiAgWycmJywgdHMuU3ludGF4S2luZC5BbXBlcnNhbmRUb2tlbl0sXG4gIFsnfCcsIHRzLlN5bnRheEtpbmQuQmFyVG9rZW5dLFxuICBbJz8/JywgdHMuU3ludGF4S2luZC5RdWVzdGlvblF1ZXN0aW9uVG9rZW5dLFxuXSk7XG5cbi8qKlxuICogQ29udmVydCBhbiBgQVNUYCB0byBUeXBlU2NyaXB0IGNvZGUgZGlyZWN0bHksIHdpdGhvdXQgZ29pbmcgdGhyb3VnaCBhbiBpbnRlcm1lZGlhdGUgYEV4cHJlc3Npb25gXG4gKiBBU1QuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhc3RUb1R5cGVzY3JpcHQoXG4gICAgYXN0OiBBU1QsIG1heWJlUmVzb2x2ZTogKGFzdDogQVNUKSA9PiAodHMuRXhwcmVzc2lvbiB8IG51bGwpLFxuICAgIGNvbmZpZzogVHlwZUNoZWNraW5nQ29uZmlnKTogdHMuRXhwcmVzc2lvbiB7XG4gIGNvbnN0IHRyYW5zbGF0b3IgPSBuZXcgQXN0VHJhbnNsYXRvcihtYXliZVJlc29sdmUsIGNvbmZpZyk7XG4gIHJldHVybiB0cmFuc2xhdG9yLnRyYW5zbGF0ZShhc3QpO1xufVxuXG5jbGFzcyBBc3RUcmFuc2xhdG9yIGltcGxlbWVudHMgQXN0VmlzaXRvciB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSBtYXliZVJlc29sdmU6IChhc3Q6IEFTVCkgPT4gKHRzLkV4cHJlc3Npb24gfCBudWxsKSxcbiAgICAgIHByaXZhdGUgY29uZmlnOiBUeXBlQ2hlY2tpbmdDb25maWcpIHt9XG5cbiAgdHJhbnNsYXRlKGFzdDogQVNUKTogdHMuRXhwcmVzc2lvbiB7XG4gICAgLy8gU2tpcCBvdmVyIGFuIGBBU1RXaXRoU291cmNlYCBhcyBpdHMgYHZpc2l0YCBtZXRob2QgY2FsbHMgZGlyZWN0bHkgaW50byBpdHMgYXN0J3MgYHZpc2l0YCxcbiAgICAvLyB3aGljaCB3b3VsZCBwcmV2ZW50IGFueSBjdXN0b20gcmVzb2x1dGlvbiB0aHJvdWdoIGBtYXliZVJlc29sdmVgIGZvciB0aGF0IG5vZGUuXG4gICAgaWYgKGFzdCBpbnN0YW5jZW9mIEFTVFdpdGhTb3VyY2UpIHtcbiAgICAgIGFzdCA9IGFzdC5hc3Q7XG4gICAgfVxuXG4gICAgLy8gVGhlIGBFbXB0eUV4cHJgIGRvZXNuJ3QgaGF2ZSBhIGRlZGljYXRlZCBtZXRob2Qgb24gYEFzdFZpc2l0b3JgLCBzbyBpdCdzIHNwZWNpYWwgY2FzZWQgaGVyZS5cbiAgICBpZiAoYXN0IGluc3RhbmNlb2YgRW1wdHlFeHByKSB7XG4gICAgICBjb25zdCByZXMgPSB0cy5mYWN0b3J5LmNyZWF0ZUlkZW50aWZpZXIoJ3VuZGVmaW5lZCcpO1xuICAgICAgYWRkUGFyc2VTcGFuSW5mbyhyZXMsIGFzdC5zb3VyY2VTcGFuKTtcbiAgICAgIHJldHVybiByZXM7XG4gICAgfVxuXG4gICAgLy8gRmlyc3QgYXR0ZW1wdCB0byBsZXQgYW55IGN1c3RvbSByZXNvbHV0aW9uIGxvZ2ljIHByb3ZpZGUgYSB0cmFuc2xhdGlvbiBmb3IgdGhlIGdpdmVuIG5vZGUuXG4gICAgY29uc3QgcmVzb2x2ZWQgPSB0aGlzLm1heWJlUmVzb2x2ZShhc3QpO1xuICAgIGlmIChyZXNvbHZlZCAhPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHJlc29sdmVkO1xuICAgIH1cblxuICAgIHJldHVybiBhc3QudmlzaXQodGhpcyk7XG4gIH1cblxuICB2aXNpdFVuYXJ5KGFzdDogVW5hcnkpOiB0cy5FeHByZXNzaW9uIHtcbiAgICBjb25zdCBleHByID0gdGhpcy50cmFuc2xhdGUoYXN0LmV4cHIpO1xuICAgIGNvbnN0IG9wID0gVU5BUllfT1BTLmdldChhc3Qub3BlcmF0b3IpO1xuICAgIGlmIChvcCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuc3VwcG9ydGVkIFVuYXJ5Lm9wZXJhdG9yOiAke2FzdC5vcGVyYXRvcn1gKTtcbiAgICB9XG4gICAgY29uc3Qgbm9kZSA9IHdyYXBGb3JEaWFnbm9zdGljcyh0cy5jcmVhdGVQcmVmaXgob3AsIGV4cHIpKTtcbiAgICBhZGRQYXJzZVNwYW5JbmZvKG5vZGUsIGFzdC5zb3VyY2VTcGFuKTtcbiAgICByZXR1cm4gbm9kZTtcbiAgfVxuXG4gIHZpc2l0QmluYXJ5KGFzdDogQmluYXJ5KTogdHMuRXhwcmVzc2lvbiB7XG4gICAgY29uc3QgbGhzID0gd3JhcEZvckRpYWdub3N0aWNzKHRoaXMudHJhbnNsYXRlKGFzdC5sZWZ0KSk7XG4gICAgY29uc3QgcmhzID0gd3JhcEZvckRpYWdub3N0aWNzKHRoaXMudHJhbnNsYXRlKGFzdC5yaWdodCkpO1xuICAgIGNvbnN0IG9wID0gQklOQVJZX09QUy5nZXQoYXN0Lm9wZXJhdGlvbik7XG4gICAgaWYgKG9wID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVW5zdXBwb3J0ZWQgQmluYXJ5Lm9wZXJhdGlvbjogJHthc3Qub3BlcmF0aW9ufWApO1xuICAgIH1cbiAgICBjb25zdCBub2RlID0gdHMuY3JlYXRlQmluYXJ5KGxocywgb3AsIHJocyk7XG4gICAgYWRkUGFyc2VTcGFuSW5mbyhub2RlLCBhc3Quc291cmNlU3Bhbik7XG4gICAgcmV0dXJuIG5vZGU7XG4gIH1cblxuICB2aXNpdENoYWluKGFzdDogQ2hhaW4pOiB0cy5FeHByZXNzaW9uIHtcbiAgICBjb25zdCBlbGVtZW50cyA9IGFzdC5leHByZXNzaW9ucy5tYXAoZXhwciA9PiB0aGlzLnRyYW5zbGF0ZShleHByKSk7XG4gICAgY29uc3Qgbm9kZSA9IHdyYXBGb3JEaWFnbm9zdGljcyh0cy5jcmVhdGVDb21tYUxpc3QoZWxlbWVudHMpKTtcbiAgICBhZGRQYXJzZVNwYW5JbmZvKG5vZGUsIGFzdC5zb3VyY2VTcGFuKTtcbiAgICByZXR1cm4gbm9kZTtcbiAgfVxuXG4gIHZpc2l0Q29uZGl0aW9uYWwoYXN0OiBDb25kaXRpb25hbCk6IHRzLkV4cHJlc3Npb24ge1xuICAgIGNvbnN0IGNvbmRFeHByID0gdGhpcy50cmFuc2xhdGUoYXN0LmNvbmRpdGlvbik7XG4gICAgY29uc3QgdHJ1ZUV4cHIgPSB0aGlzLnRyYW5zbGF0ZShhc3QudHJ1ZUV4cCk7XG4gICAgLy8gV3JhcCBgZmFsc2VFeHByYCBpbiBwYXJlbnMgc28gdGhhdCB0aGUgdHJhaWxpbmcgcGFyc2Ugc3BhbiBpbmZvIGlzIG5vdCBhdHRyaWJ1dGVkIHRvIHRoZVxuICAgIC8vIHdob2xlIGNvbmRpdGlvbmFsLlxuICAgIC8vIEluIHRoZSBmb2xsb3dpbmcgZXhhbXBsZSwgdGhlIGxhc3Qgc291cmNlIHNwYW4gY29tbWVudCAoNSw2KSBjb3VsZCBiZSBzZWVuIGFzIHRoZVxuICAgIC8vIHRyYWlsaW5nIGNvbW1lbnQgZm9yIF9laXRoZXJfIHRoZSB3aG9sZSBjb25kaXRpb25hbCBleHByZXNzaW9uIF9vcl8ganVzdCB0aGUgYGZhbHNlRXhwcmAgdGhhdFxuICAgIC8vIGlzIGltbWVkaWF0ZWx5IGJlZm9yZSBpdDpcbiAgICAvLyBgY29uZGl0aW9uYWwgLyoxLDIqLyA/IHRydWVFeHByIC8qMyw0Ki8gOiBmYWxzZUV4cHIgLyo1LDYqL2BcbiAgICAvLyBUaGlzIHNob3VsZCBiZSBpbnN0ZWFkIGJlIGBjb25kaXRpb25hbCAvKjEsMiovID8gdHJ1ZUV4cHIgLyozLDQqLyA6IChmYWxzZUV4cHIgLyo1LDYqLylgXG4gICAgY29uc3QgZmFsc2VFeHByID0gd3JhcEZvclR5cGVDaGVja2VyKHRoaXMudHJhbnNsYXRlKGFzdC5mYWxzZUV4cCkpO1xuICAgIGNvbnN0IG5vZGUgPSB0cy5jcmVhdGVQYXJlbih0cy5jcmVhdGVDb25kaXRpb25hbChjb25kRXhwciwgdHJ1ZUV4cHIsIGZhbHNlRXhwcikpO1xuICAgIGFkZFBhcnNlU3BhbkluZm8obm9kZSwgYXN0LnNvdXJjZVNwYW4pO1xuICAgIHJldHVybiBub2RlO1xuICB9XG5cbiAgdmlzaXRGdW5jdGlvbkNhbGwoYXN0OiBGdW5jdGlvbkNhbGwpOiB0cy5FeHByZXNzaW9uIHtcbiAgICBjb25zdCByZWNlaXZlciA9IHdyYXBGb3JEaWFnbm9zdGljcyh0aGlzLnRyYW5zbGF0ZShhc3QudGFyZ2V0ISkpO1xuICAgIGNvbnN0IGFyZ3MgPSBhc3QuYXJncy5tYXAoZXhwciA9PiB0aGlzLnRyYW5zbGF0ZShleHByKSk7XG4gICAgY29uc3Qgbm9kZSA9IHRzLmNyZWF0ZUNhbGwocmVjZWl2ZXIsIHVuZGVmaW5lZCwgYXJncyk7XG4gICAgYWRkUGFyc2VTcGFuSW5mbyhub2RlLCBhc3Quc291cmNlU3Bhbik7XG4gICAgcmV0dXJuIG5vZGU7XG4gIH1cblxuICB2aXNpdEltcGxpY2l0UmVjZWl2ZXIoYXN0OiBJbXBsaWNpdFJlY2VpdmVyKTogbmV2ZXIge1xuICAgIHRocm93IG5ldyBFcnJvcignTWV0aG9kIG5vdCBpbXBsZW1lbnRlZC4nKTtcbiAgfVxuXG4gIHZpc2l0VGhpc1JlY2VpdmVyKGFzdDogVGhpc1JlY2VpdmVyKTogbmV2ZXIge1xuICAgIHRocm93IG5ldyBFcnJvcignTWV0aG9kIG5vdCBpbXBsZW1lbnRlZC4nKTtcbiAgfVxuXG4gIHZpc2l0SW50ZXJwb2xhdGlvbihhc3Q6IEludGVycG9sYXRpb24pOiB0cy5FeHByZXNzaW9uIHtcbiAgICAvLyBCdWlsZCB1cCBhIGNoYWluIG9mIGJpbmFyeSArIG9wZXJhdGlvbnMgdG8gc2ltdWxhdGUgdGhlIHN0cmluZyBjb25jYXRlbmF0aW9uIG9mIHRoZVxuICAgIC8vIGludGVycG9sYXRpb24ncyBleHByZXNzaW9ucy4gVGhlIGNoYWluIGlzIHN0YXJ0ZWQgdXNpbmcgYW4gYWN0dWFsIHN0cmluZyBsaXRlcmFsIHRvIGVuc3VyZVxuICAgIC8vIHRoZSB0eXBlIGlzIGluZmVycmVkIGFzICdzdHJpbmcnLlxuICAgIHJldHVybiBhc3QuZXhwcmVzc2lvbnMucmVkdWNlKFxuICAgICAgICAobGhzLCBhc3QpID0+XG4gICAgICAgICAgICB0cy5jcmVhdGVCaW5hcnkobGhzLCB0cy5TeW50YXhLaW5kLlBsdXNUb2tlbiwgd3JhcEZvclR5cGVDaGVja2VyKHRoaXMudHJhbnNsYXRlKGFzdCkpKSxcbiAgICAgICAgdHMuY3JlYXRlTGl0ZXJhbCgnJykpO1xuICB9XG5cbiAgdmlzaXRLZXllZFJlYWQoYXN0OiBLZXllZFJlYWQpOiB0cy5FeHByZXNzaW9uIHtcbiAgICBjb25zdCByZWNlaXZlciA9IHdyYXBGb3JEaWFnbm9zdGljcyh0aGlzLnRyYW5zbGF0ZShhc3Qub2JqKSk7XG4gICAgY29uc3Qga2V5ID0gdGhpcy50cmFuc2xhdGUoYXN0LmtleSk7XG4gICAgY29uc3Qgbm9kZSA9IHRzLmNyZWF0ZUVsZW1lbnRBY2Nlc3MocmVjZWl2ZXIsIGtleSk7XG4gICAgYWRkUGFyc2VTcGFuSW5mbyhub2RlLCBhc3Quc291cmNlU3Bhbik7XG4gICAgcmV0dXJuIG5vZGU7XG4gIH1cblxuICB2aXNpdEtleWVkV3JpdGUoYXN0OiBLZXllZFdyaXRlKTogdHMuRXhwcmVzc2lvbiB7XG4gICAgY29uc3QgcmVjZWl2ZXIgPSB3cmFwRm9yRGlhZ25vc3RpY3ModGhpcy50cmFuc2xhdGUoYXN0Lm9iaikpO1xuICAgIGNvbnN0IGxlZnQgPSB0cy5jcmVhdGVFbGVtZW50QWNjZXNzKHJlY2VpdmVyLCB0aGlzLnRyYW5zbGF0ZShhc3Qua2V5KSk7XG4gICAgLy8gVE9ETyhqb29zdCk6IGFubm90YXRlIGBsZWZ0YCB3aXRoIHRoZSBzcGFuIG9mIHRoZSBlbGVtZW50IGFjY2Vzcywgd2hpY2ggaXMgbm90IGN1cnJlbnRseVxuICAgIC8vICBhdmFpbGFibGUgb24gYGFzdGAuXG4gICAgY29uc3QgcmlnaHQgPSB3cmFwRm9yVHlwZUNoZWNrZXIodGhpcy50cmFuc2xhdGUoYXN0LnZhbHVlKSk7XG4gICAgY29uc3Qgbm9kZSA9IHdyYXBGb3JEaWFnbm9zdGljcyh0cy5jcmVhdGVCaW5hcnkobGVmdCwgdHMuU3ludGF4S2luZC5FcXVhbHNUb2tlbiwgcmlnaHQpKTtcbiAgICBhZGRQYXJzZVNwYW5JbmZvKG5vZGUsIGFzdC5zb3VyY2VTcGFuKTtcbiAgICByZXR1cm4gbm9kZTtcbiAgfVxuXG4gIHZpc2l0TGl0ZXJhbEFycmF5KGFzdDogTGl0ZXJhbEFycmF5KTogdHMuRXhwcmVzc2lvbiB7XG4gICAgY29uc3QgZWxlbWVudHMgPSBhc3QuZXhwcmVzc2lvbnMubWFwKGV4cHIgPT4gdGhpcy50cmFuc2xhdGUoZXhwcikpO1xuICAgIGNvbnN0IGxpdGVyYWwgPSB0cy5jcmVhdGVBcnJheUxpdGVyYWwoZWxlbWVudHMpO1xuICAgIC8vIElmIHN0cmljdExpdGVyYWxUeXBlcyBpcyBkaXNhYmxlZCwgYXJyYXkgbGl0ZXJhbHMgYXJlIGNhc3QgdG8gYGFueWAuXG4gICAgY29uc3Qgbm9kZSA9IHRoaXMuY29uZmlnLnN0cmljdExpdGVyYWxUeXBlcyA/IGxpdGVyYWwgOiB0c0Nhc3RUb0FueShsaXRlcmFsKTtcbiAgICBhZGRQYXJzZVNwYW5JbmZvKG5vZGUsIGFzdC5zb3VyY2VTcGFuKTtcbiAgICByZXR1cm4gbm9kZTtcbiAgfVxuXG4gIHZpc2l0TGl0ZXJhbE1hcChhc3Q6IExpdGVyYWxNYXApOiB0cy5FeHByZXNzaW9uIHtcbiAgICBjb25zdCBwcm9wZXJ0aWVzID0gYXN0LmtleXMubWFwKCh7a2V5fSwgaWR4KSA9PiB7XG4gICAgICBjb25zdCB2YWx1ZSA9IHRoaXMudHJhbnNsYXRlKGFzdC52YWx1ZXNbaWR4XSk7XG4gICAgICByZXR1cm4gdHMuY3JlYXRlUHJvcGVydHlBc3NpZ25tZW50KHRzLmNyZWF0ZVN0cmluZ0xpdGVyYWwoa2V5KSwgdmFsdWUpO1xuICAgIH0pO1xuICAgIGNvbnN0IGxpdGVyYWwgPSB0cy5jcmVhdGVPYmplY3RMaXRlcmFsKHByb3BlcnRpZXMsIHRydWUpO1xuICAgIC8vIElmIHN0cmljdExpdGVyYWxUeXBlcyBpcyBkaXNhYmxlZCwgb2JqZWN0IGxpdGVyYWxzIGFyZSBjYXN0IHRvIGBhbnlgLlxuICAgIGNvbnN0IG5vZGUgPSB0aGlzLmNvbmZpZy5zdHJpY3RMaXRlcmFsVHlwZXMgPyBsaXRlcmFsIDogdHNDYXN0VG9BbnkobGl0ZXJhbCk7XG4gICAgYWRkUGFyc2VTcGFuSW5mbyhub2RlLCBhc3Quc291cmNlU3Bhbik7XG4gICAgcmV0dXJuIG5vZGU7XG4gIH1cblxuICB2aXNpdExpdGVyYWxQcmltaXRpdmUoYXN0OiBMaXRlcmFsUHJpbWl0aXZlKTogdHMuRXhwcmVzc2lvbiB7XG4gICAgbGV0IG5vZGU6IHRzLkV4cHJlc3Npb247XG4gICAgaWYgKGFzdC52YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBub2RlID0gdHMuY3JlYXRlSWRlbnRpZmllcigndW5kZWZpbmVkJyk7XG4gICAgfSBlbHNlIGlmIChhc3QudmFsdWUgPT09IG51bGwpIHtcbiAgICAgIG5vZGUgPSB0cy5jcmVhdGVOdWxsKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5vZGUgPSB0cy5jcmVhdGVMaXRlcmFsKGFzdC52YWx1ZSk7XG4gICAgfVxuICAgIGFkZFBhcnNlU3BhbkluZm8obm9kZSwgYXN0LnNvdXJjZVNwYW4pO1xuICAgIHJldHVybiBub2RlO1xuICB9XG5cbiAgdmlzaXRNZXRob2RDYWxsKGFzdDogTWV0aG9kQ2FsbCk6IHRzLkV4cHJlc3Npb24ge1xuICAgIGNvbnN0IHJlY2VpdmVyID0gd3JhcEZvckRpYWdub3N0aWNzKHRoaXMudHJhbnNsYXRlKGFzdC5yZWNlaXZlcikpO1xuICAgIGNvbnN0IG1ldGhvZCA9IHRzLmNyZWF0ZVByb3BlcnR5QWNjZXNzKHJlY2VpdmVyLCBhc3QubmFtZSk7XG4gICAgYWRkUGFyc2VTcGFuSW5mbyhtZXRob2QsIGFzdC5uYW1lU3Bhbik7XG4gICAgY29uc3QgYXJncyA9IGFzdC5hcmdzLm1hcChleHByID0+IHRoaXMudHJhbnNsYXRlKGV4cHIpKTtcbiAgICBjb25zdCBub2RlID0gdHMuY3JlYXRlQ2FsbChtZXRob2QsIHVuZGVmaW5lZCwgYXJncyk7XG4gICAgYWRkUGFyc2VTcGFuSW5mbyhub2RlLCBhc3Quc291cmNlU3Bhbik7XG4gICAgcmV0dXJuIG5vZGU7XG4gIH1cblxuICB2aXNpdE5vbk51bGxBc3NlcnQoYXN0OiBOb25OdWxsQXNzZXJ0KTogdHMuRXhwcmVzc2lvbiB7XG4gICAgY29uc3QgZXhwciA9IHdyYXBGb3JEaWFnbm9zdGljcyh0aGlzLnRyYW5zbGF0ZShhc3QuZXhwcmVzc2lvbikpO1xuICAgIGNvbnN0IG5vZGUgPSB0cy5jcmVhdGVOb25OdWxsRXhwcmVzc2lvbihleHByKTtcbiAgICBhZGRQYXJzZVNwYW5JbmZvKG5vZGUsIGFzdC5zb3VyY2VTcGFuKTtcbiAgICByZXR1cm4gbm9kZTtcbiAgfVxuXG4gIHZpc2l0UGlwZShhc3Q6IEJpbmRpbmdQaXBlKTogbmV2ZXIge1xuICAgIHRocm93IG5ldyBFcnJvcignTWV0aG9kIG5vdCBpbXBsZW1lbnRlZC4nKTtcbiAgfVxuXG4gIHZpc2l0UHJlZml4Tm90KGFzdDogUHJlZml4Tm90KTogdHMuRXhwcmVzc2lvbiB7XG4gICAgY29uc3QgZXhwcmVzc2lvbiA9IHdyYXBGb3JEaWFnbm9zdGljcyh0aGlzLnRyYW5zbGF0ZShhc3QuZXhwcmVzc2lvbikpO1xuICAgIGNvbnN0IG5vZGUgPSB0cy5jcmVhdGVMb2dpY2FsTm90KGV4cHJlc3Npb24pO1xuICAgIGFkZFBhcnNlU3BhbkluZm8obm9kZSwgYXN0LnNvdXJjZVNwYW4pO1xuICAgIHJldHVybiBub2RlO1xuICB9XG5cbiAgdmlzaXRQcm9wZXJ0eVJlYWQoYXN0OiBQcm9wZXJ0eVJlYWQpOiB0cy5FeHByZXNzaW9uIHtcbiAgICAvLyBUaGlzIGlzIGEgbm9ybWFsIHByb3BlcnR5IHJlYWQgLSBjb252ZXJ0IHRoZSByZWNlaXZlciB0byBhbiBleHByZXNzaW9uIGFuZCBlbWl0IHRoZSBjb3JyZWN0XG4gICAgLy8gVHlwZVNjcmlwdCBleHByZXNzaW9uIHRvIHJlYWQgdGhlIHByb3BlcnR5LlxuICAgIGNvbnN0IHJlY2VpdmVyID0gd3JhcEZvckRpYWdub3N0aWNzKHRoaXMudHJhbnNsYXRlKGFzdC5yZWNlaXZlcikpO1xuICAgIGNvbnN0IG5hbWUgPSB0cy5jcmVhdGVQcm9wZXJ0eUFjY2VzcyhyZWNlaXZlciwgYXN0Lm5hbWUpO1xuICAgIGFkZFBhcnNlU3BhbkluZm8obmFtZSwgYXN0Lm5hbWVTcGFuKTtcbiAgICBjb25zdCBub2RlID0gd3JhcEZvckRpYWdub3N0aWNzKG5hbWUpO1xuICAgIGFkZFBhcnNlU3BhbkluZm8obm9kZSwgYXN0LnNvdXJjZVNwYW4pO1xuICAgIHJldHVybiBub2RlO1xuICB9XG5cbiAgdmlzaXRQcm9wZXJ0eVdyaXRlKGFzdDogUHJvcGVydHlXcml0ZSk6IHRzLkV4cHJlc3Npb24ge1xuICAgIGNvbnN0IHJlY2VpdmVyID0gd3JhcEZvckRpYWdub3N0aWNzKHRoaXMudHJhbnNsYXRlKGFzdC5yZWNlaXZlcikpO1xuICAgIGNvbnN0IGxlZnQgPSB0cy5jcmVhdGVQcm9wZXJ0eUFjY2VzcyhyZWNlaXZlciwgYXN0Lm5hbWUpO1xuICAgIGFkZFBhcnNlU3BhbkluZm8obGVmdCwgYXN0Lm5hbWVTcGFuKTtcbiAgICAvLyBUeXBlU2NyaXB0IHJlcG9ydHMgYXNzaWdubWVudCBlcnJvcnMgb24gdGhlIGVudGlyZSBsdmFsdWUgZXhwcmVzc2lvbi4gQW5ub3RhdGUgdGhlIGx2YWx1ZSBvZlxuICAgIC8vIHRoZSBhc3NpZ25tZW50IHdpdGggdGhlIHNvdXJjZVNwYW4sIHdoaWNoIGluY2x1ZGVzIHJlY2VpdmVycywgcmF0aGVyIHRoYW4gbmFtZVNwYW4gZm9yXG4gICAgLy8gY29uc2lzdGVuY3kgb2YgdGhlIGRpYWdub3N0aWMgbG9jYXRpb24uXG4gICAgLy8gYS5iLmMgPSAxXG4gICAgLy8gXl5eXl5eXl5eIHNvdXJjZVNwYW5cbiAgICAvLyAgICAgXiAgICAgbmFtZVNwYW5cbiAgICBjb25zdCBsZWZ0V2l0aFBhdGggPSB3cmFwRm9yRGlhZ25vc3RpY3MobGVmdCk7XG4gICAgYWRkUGFyc2VTcGFuSW5mbyhsZWZ0V2l0aFBhdGgsIGFzdC5zb3VyY2VTcGFuKTtcbiAgICAvLyBUaGUgcmlnaHQgbmVlZHMgdG8gYmUgd3JhcHBlZCBpbiBwYXJlbnMgYXMgd2VsbCBvciB3ZSBjYW5ub3QgYWNjdXJhdGVseSBtYXRjaCBpdHNcbiAgICAvLyBzcGFuIHRvIGp1c3QgdGhlIFJIUy4gRm9yIGV4YW1wbGUsIHRoZSBzcGFuIGluIGBlID0gJGV2ZW50IC8qMCwxMCovYCBpcyBhbWJpZ3VvdXMuXG4gICAgLy8gSXQgY291bGQgcmVmZXIgdG8gZWl0aGVyIHRoZSB3aG9sZSBiaW5hcnkgZXhwcmVzc2lvbiBvciBqdXN0IHRoZSBSSFMuXG4gICAgLy8gV2Ugc2hvdWxkIGluc3RlYWQgZ2VuZXJhdGUgYGUgPSAoJGV2ZW50IC8qMCwxMCovKWAgc28gd2Uga25vdyB0aGUgc3BhbiAwLDEwIG1hdGNoZXMgUkhTLlxuICAgIGNvbnN0IHJpZ2h0ID0gd3JhcEZvclR5cGVDaGVja2VyKHRoaXMudHJhbnNsYXRlKGFzdC52YWx1ZSkpO1xuICAgIGNvbnN0IG5vZGUgPVxuICAgICAgICB3cmFwRm9yRGlhZ25vc3RpY3ModHMuY3JlYXRlQmluYXJ5KGxlZnRXaXRoUGF0aCwgdHMuU3ludGF4S2luZC5FcXVhbHNUb2tlbiwgcmlnaHQpKTtcbiAgICBhZGRQYXJzZVNwYW5JbmZvKG5vZGUsIGFzdC5zb3VyY2VTcGFuKTtcbiAgICByZXR1cm4gbm9kZTtcbiAgfVxuXG4gIHZpc2l0UXVvdGUoYXN0OiBRdW90ZSk6IHRzLkV4cHJlc3Npb24ge1xuICAgIHJldHVybiBOVUxMX0FTX0FOWTtcbiAgfVxuXG4gIHZpc2l0U2FmZU1ldGhvZENhbGwoYXN0OiBTYWZlTWV0aG9kQ2FsbCk6IHRzLkV4cHJlc3Npb24ge1xuICAgIC8vIFNlZSB0aGUgY29tbWVudHMgaW4gU2FmZVByb3BlcnR5UmVhZCBhYm92ZSBmb3IgYW4gZXhwbGFuYXRpb24gb2YgdGhlIGNhc2VzIGhlcmUuXG4gICAgbGV0IG5vZGU6IHRzLkV4cHJlc3Npb247XG4gICAgY29uc3QgcmVjZWl2ZXIgPSB3cmFwRm9yRGlhZ25vc3RpY3ModGhpcy50cmFuc2xhdGUoYXN0LnJlY2VpdmVyKSk7XG4gICAgY29uc3QgYXJncyA9IGFzdC5hcmdzLm1hcChleHByID0+IHRoaXMudHJhbnNsYXRlKGV4cHIpKTtcbiAgICBpZiAodGhpcy5jb25maWcuc3RyaWN0U2FmZU5hdmlnYXRpb25UeXBlcykge1xuICAgICAgLy8gXCJhPy5tZXRob2QoLi4uKVwiIGJlY29tZXMgKG51bGwgYXMgYW55ID8gYSEubWV0aG9kKC4uLikgOiB1bmRlZmluZWQpXG4gICAgICBjb25zdCBtZXRob2QgPSB0cy5jcmVhdGVQcm9wZXJ0eUFjY2Vzcyh0cy5jcmVhdGVOb25OdWxsRXhwcmVzc2lvbihyZWNlaXZlciksIGFzdC5uYW1lKTtcbiAgICAgIGFkZFBhcnNlU3BhbkluZm8obWV0aG9kLCBhc3QubmFtZVNwYW4pO1xuICAgICAgY29uc3QgY2FsbCA9IHRzLmNyZWF0ZUNhbGwobWV0aG9kLCB1bmRlZmluZWQsIGFyZ3MpO1xuICAgICAgbm9kZSA9IHRzLmNyZWF0ZVBhcmVuKHRzLmNyZWF0ZUNvbmRpdGlvbmFsKE5VTExfQVNfQU5ZLCBjYWxsLCBVTkRFRklORUQpKTtcbiAgICB9IGVsc2UgaWYgKFZlU2FmZUxoc0luZmVyZW5jZUJ1Z0RldGVjdG9yLnZlV2lsbEluZmVyQW55Rm9yKGFzdCkpIHtcbiAgICAgIC8vIFwiYT8ubWV0aG9kKC4uLilcIiBiZWNvbWVzIChhIGFzIGFueSkubWV0aG9kKC4uLilcbiAgICAgIGNvbnN0IG1ldGhvZCA9IHRzLmNyZWF0ZVByb3BlcnR5QWNjZXNzKHRzQ2FzdFRvQW55KHJlY2VpdmVyKSwgYXN0Lm5hbWUpO1xuICAgICAgYWRkUGFyc2VTcGFuSW5mbyhtZXRob2QsIGFzdC5uYW1lU3Bhbik7XG4gICAgICBub2RlID0gdHMuY3JlYXRlQ2FsbChtZXRob2QsIHVuZGVmaW5lZCwgYXJncyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFwiYT8ubWV0aG9kKC4uLilcIiBiZWNvbWVzIChhIS5tZXRob2QoLi4uKSBhcyBhbnkpXG4gICAgICBjb25zdCBtZXRob2QgPSB0cy5jcmVhdGVQcm9wZXJ0eUFjY2Vzcyh0cy5jcmVhdGVOb25OdWxsRXhwcmVzc2lvbihyZWNlaXZlciksIGFzdC5uYW1lKTtcbiAgICAgIGFkZFBhcnNlU3BhbkluZm8obWV0aG9kLCBhc3QubmFtZVNwYW4pO1xuICAgICAgbm9kZSA9IHRzQ2FzdFRvQW55KHRzLmNyZWF0ZUNhbGwobWV0aG9kLCB1bmRlZmluZWQsIGFyZ3MpKTtcbiAgICB9XG4gICAgYWRkUGFyc2VTcGFuSW5mbyhub2RlLCBhc3Quc291cmNlU3Bhbik7XG4gICAgcmV0dXJuIG5vZGU7XG4gIH1cblxuICB2aXNpdFNhZmVQcm9wZXJ0eVJlYWQoYXN0OiBTYWZlUHJvcGVydHlSZWFkKTogdHMuRXhwcmVzc2lvbiB7XG4gICAgbGV0IG5vZGU6IHRzLkV4cHJlc3Npb247XG4gICAgY29uc3QgcmVjZWl2ZXIgPSB3cmFwRm9yRGlhZ25vc3RpY3ModGhpcy50cmFuc2xhdGUoYXN0LnJlY2VpdmVyKSk7XG4gICAgLy8gVGhlIGZvcm0gb2Ygc2FmZSBwcm9wZXJ0eSByZWFkcyBkZXBlbmRzIG9uIHdoZXRoZXIgc3RyaWN0bmVzcyBpcyBpbiB1c2UuXG4gICAgaWYgKHRoaXMuY29uZmlnLnN0cmljdFNhZmVOYXZpZ2F0aW9uVHlwZXMpIHtcbiAgICAgIC8vIEJhc2ljYWxseSwgdGhlIHJldHVybiBoZXJlIGlzIGVpdGhlciB0aGUgdHlwZSBvZiB0aGUgY29tcGxldGUgZXhwcmVzc2lvbiB3aXRoIGEgbnVsbC1zYWZlXG4gICAgICAvLyBwcm9wZXJ0eSByZWFkLCBvciBgdW5kZWZpbmVkYC4gU28gYSB0ZXJuYXJ5IGlzIHVzZWQgdG8gY3JlYXRlIGFuIFwib3JcIiB0eXBlOlxuICAgICAgLy8gXCJhPy5iXCIgYmVjb21lcyAobnVsbCBhcyBhbnkgPyBhIS5iIDogdW5kZWZpbmVkKVxuICAgICAgLy8gVGhlIHR5cGUgb2YgdGhpcyBleHByZXNzaW9uIGlzICh0eXBlb2YgYSEuYikgfCB1bmRlZmluZWQsIHdoaWNoIGlzIGV4YWN0bHkgYXMgZGVzaXJlZC5cbiAgICAgIGNvbnN0IGV4cHIgPSB0cy5jcmVhdGVQcm9wZXJ0eUFjY2Vzcyh0cy5jcmVhdGVOb25OdWxsRXhwcmVzc2lvbihyZWNlaXZlciksIGFzdC5uYW1lKTtcbiAgICAgIGFkZFBhcnNlU3BhbkluZm8oZXhwciwgYXN0Lm5hbWVTcGFuKTtcbiAgICAgIG5vZGUgPSB0cy5jcmVhdGVQYXJlbih0cy5jcmVhdGVDb25kaXRpb25hbChOVUxMX0FTX0FOWSwgZXhwciwgVU5ERUZJTkVEKSk7XG4gICAgfSBlbHNlIGlmIChWZVNhZmVMaHNJbmZlcmVuY2VCdWdEZXRlY3Rvci52ZVdpbGxJbmZlckFueUZvcihhc3QpKSB7XG4gICAgICAvLyBFbXVsYXRlIGEgVmlldyBFbmdpbmUgYnVnIHdoZXJlICdhbnknIGlzIGluZmVycmVkIGZvciB0aGUgbGVmdC1oYW5kIHNpZGUgb2YgdGhlIHNhZmVcbiAgICAgIC8vIG5hdmlnYXRpb24gb3BlcmF0aW9uLiBXaXRoIHRoaXMgYnVnLCB0aGUgdHlwZSBvZiB0aGUgbGVmdC1oYW5kIHNpZGUgaXMgcmVnYXJkZWQgYXMgYW55LlxuICAgICAgLy8gVGhlcmVmb3JlLCB0aGUgbGVmdC1oYW5kIHNpZGUgb25seSBuZWVkcyByZXBlYXRpbmcgaW4gdGhlIG91dHB1dCAodG8gdmFsaWRhdGUgaXQpLCBhbmQgdGhlblxuICAgICAgLy8gJ2FueScgaXMgdXNlZCBmb3IgdGhlIHJlc3Qgb2YgdGhlIGV4cHJlc3Npb24uIFRoaXMgaXMgZG9uZSB1c2luZyBhIGNvbW1hIG9wZXJhdG9yOlxuICAgICAgLy8gXCJhPy5iXCIgYmVjb21lcyAoYSBhcyBhbnkpLmIsIHdoaWNoIHdpbGwgb2YgY291cnNlIGhhdmUgdHlwZSAnYW55Jy5cbiAgICAgIG5vZGUgPSB0cy5jcmVhdGVQcm9wZXJ0eUFjY2Vzcyh0c0Nhc3RUb0FueShyZWNlaXZlciksIGFzdC5uYW1lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVGhlIFZpZXcgRW5naW5lIGJ1ZyBpc24ndCBhY3RpdmUsIHNvIGNoZWNrIHRoZSBlbnRpcmUgdHlwZSBvZiB0aGUgZXhwcmVzc2lvbiwgYnV0IHRoZSBmaW5hbFxuICAgICAgLy8gcmVzdWx0IGlzIHN0aWxsIGluZmVycmVkIGFzIGBhbnlgLlxuICAgICAgLy8gXCJhPy5iXCIgYmVjb21lcyAoYSEuYiBhcyBhbnkpXG4gICAgICBjb25zdCBleHByID0gdHMuY3JlYXRlUHJvcGVydHlBY2Nlc3ModHMuY3JlYXRlTm9uTnVsbEV4cHJlc3Npb24ocmVjZWl2ZXIpLCBhc3QubmFtZSk7XG4gICAgICBhZGRQYXJzZVNwYW5JbmZvKGV4cHIsIGFzdC5uYW1lU3Bhbik7XG4gICAgICBub2RlID0gdHNDYXN0VG9BbnkoZXhwcik7XG4gICAgfVxuICAgIGFkZFBhcnNlU3BhbkluZm8obm9kZSwgYXN0LnNvdXJjZVNwYW4pO1xuICAgIHJldHVybiBub2RlO1xuICB9XG59XG5cbi8qKlxuICogQ2hlY2tzIHdoZXRoZXIgVmlldyBFbmdpbmUgd2lsbCBpbmZlciBhIHR5cGUgb2YgJ2FueScgZm9yIHRoZSBsZWZ0LWhhbmQgc2lkZSBvZiBhIHNhZmUgbmF2aWdhdGlvblxuICogb3BlcmF0aW9uLlxuICpcbiAqIEluIFZpZXcgRW5naW5lJ3MgdGVtcGxhdGUgdHlwZS1jaGVja2VyLCBjZXJ0YWluIHJlY2VpdmVycyBvZiBzYWZlIG5hdmlnYXRpb24gb3BlcmF0aW9ucyB3aWxsXG4gKiBjYXVzZSBhIHRlbXBvcmFyeSB2YXJpYWJsZSB0byBiZSBhbGxvY2F0ZWQgYXMgcGFydCBvZiB0aGUgY2hlY2tpbmcgZXhwcmVzc2lvbiwgdG8gc2F2ZSB0aGUgdmFsdWVcbiAqIG9mIHRoZSByZWNlaXZlciBhbmQgdXNlIGl0IG1vcmUgdGhhbiBvbmNlIGluIHRoZSBleHByZXNzaW9uLiBUaGlzIHRlbXBvcmFyeSB2YXJpYWJsZSBoYXMgdHlwZVxuICogJ2FueScuIEluIHByYWN0aWNlLCB0aGlzIG1lYW5zIGNlcnRhaW4gcmVjZWl2ZXJzIGNhdXNlIFZpZXcgRW5naW5lIHRvIG5vdCBjaGVjayB0aGUgZnVsbFxuICogZXhwcmVzc2lvbiwgYW5kIG90aGVyIHJlY2VpdmVycyB3aWxsIHJlY2VpdmUgbW9yZSBjb21wbGV0ZSBjaGVja2luZy5cbiAqXG4gKiBGb3IgY29tcGF0aWJpbGl0eSwgdGhpcyBsb2dpYyBpcyBhZGFwdGVkIGZyb20gVmlldyBFbmdpbmUncyBleHByZXNzaW9uX2NvbnZlcnRlci50cyBzbyB0aGF0IHRoZVxuICogSXZ5IGNoZWNrZXIgY2FuIGVtdWxhdGUgdGhpcyBidWcgd2hlbiBuZWVkZWQuXG4gKi9cbmNsYXNzIFZlU2FmZUxoc0luZmVyZW5jZUJ1Z0RldGVjdG9yIGltcGxlbWVudHMgQXN0VmlzaXRvciB7XG4gIHByaXZhdGUgc3RhdGljIFNJTkdMRVRPTiA9IG5ldyBWZVNhZmVMaHNJbmZlcmVuY2VCdWdEZXRlY3RvcigpO1xuXG4gIHN0YXRpYyB2ZVdpbGxJbmZlckFueUZvcihhc3Q6IFNhZmVNZXRob2RDYWxsfFNhZmVQcm9wZXJ0eVJlYWQpIHtcbiAgICByZXR1cm4gYXN0LnJlY2VpdmVyLnZpc2l0KFZlU2FmZUxoc0luZmVyZW5jZUJ1Z0RldGVjdG9yLlNJTkdMRVRPTik7XG4gIH1cblxuICB2aXNpdFVuYXJ5KGFzdDogVW5hcnkpOiBib29sZWFuIHtcbiAgICByZXR1cm4gYXN0LmV4cHIudmlzaXQodGhpcyk7XG4gIH1cbiAgdmlzaXRCaW5hcnkoYXN0OiBCaW5hcnkpOiBib29sZWFuIHtcbiAgICByZXR1cm4gYXN0LmxlZnQudmlzaXQodGhpcykgfHwgYXN0LnJpZ2h0LnZpc2l0KHRoaXMpO1xuICB9XG4gIHZpc2l0Q2hhaW4oYXN0OiBDaGFpbik6IGJvb2xlYW4ge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICB2aXNpdENvbmRpdGlvbmFsKGFzdDogQ29uZGl0aW9uYWwpOiBib29sZWFuIHtcbiAgICByZXR1cm4gYXN0LmNvbmRpdGlvbi52aXNpdCh0aGlzKSB8fCBhc3QudHJ1ZUV4cC52aXNpdCh0aGlzKSB8fCBhc3QuZmFsc2VFeHAudmlzaXQodGhpcyk7XG4gIH1cbiAgdmlzaXRGdW5jdGlvbkNhbGwoYXN0OiBGdW5jdGlvbkNhbGwpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICB2aXNpdEltcGxpY2l0UmVjZWl2ZXIoYXN0OiBJbXBsaWNpdFJlY2VpdmVyKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHZpc2l0VGhpc1JlY2VpdmVyKGFzdDogVGhpc1JlY2VpdmVyKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHZpc2l0SW50ZXJwb2xhdGlvbihhc3Q6IEludGVycG9sYXRpb24pOiBib29sZWFuIHtcbiAgICByZXR1cm4gYXN0LmV4cHJlc3Npb25zLnNvbWUoZXhwID0+IGV4cC52aXNpdCh0aGlzKSk7XG4gIH1cbiAgdmlzaXRLZXllZFJlYWQoYXN0OiBLZXllZFJlYWQpOiBib29sZWFuIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgdmlzaXRLZXllZFdyaXRlKGFzdDogS2V5ZWRXcml0ZSk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICB2aXNpdExpdGVyYWxBcnJheShhc3Q6IExpdGVyYWxBcnJheSk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHZpc2l0TGl0ZXJhbE1hcChhc3Q6IExpdGVyYWxNYXApOiBib29sZWFuIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICB2aXNpdExpdGVyYWxQcmltaXRpdmUoYXN0OiBMaXRlcmFsUHJpbWl0aXZlKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHZpc2l0TWV0aG9kQ2FsbChhc3Q6IE1ldGhvZENhbGwpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICB2aXNpdFBpcGUoYXN0OiBCaW5kaW5nUGlwZSk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHZpc2l0UHJlZml4Tm90KGFzdDogUHJlZml4Tm90KTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGFzdC5leHByZXNzaW9uLnZpc2l0KHRoaXMpO1xuICB9XG4gIHZpc2l0Tm9uTnVsbEFzc2VydChhc3Q6IFByZWZpeE5vdCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBhc3QuZXhwcmVzc2lvbi52aXNpdCh0aGlzKTtcbiAgfVxuICB2aXNpdFByb3BlcnR5UmVhZChhc3Q6IFByb3BlcnR5UmVhZCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICB2aXNpdFByb3BlcnR5V3JpdGUoYXN0OiBQcm9wZXJ0eVdyaXRlKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHZpc2l0UXVvdGUoYXN0OiBRdW90ZSk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICB2aXNpdFNhZmVNZXRob2RDYWxsKGFzdDogU2FmZU1ldGhvZENhbGwpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICB2aXNpdFNhZmVQcm9wZXJ0eVJlYWQoYXN0OiBTYWZlUHJvcGVydHlSZWFkKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG4iXX0=