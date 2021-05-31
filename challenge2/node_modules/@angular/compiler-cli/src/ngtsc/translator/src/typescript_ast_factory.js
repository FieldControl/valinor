(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/src/ngtsc/translator/src/typescript_ast_factory", ["require", "exports", "tslib", "typescript"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.attachComments = exports.createTemplateTail = exports.createTemplateMiddle = exports.TypeScriptAstFactory = void 0;
    var tslib_1 = require("tslib");
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var ts = require("typescript");
    /**
     * Different optimizers use different annotations on a function or method call to indicate its pure
     * status.
     */
    var PureAnnotation;
    (function (PureAnnotation) {
        /**
         * Closure's annotation for purity is `@pureOrBreakMyCode`, but this needs to be in a semantic
         * (jsdoc) enabled comment. Thus, the actual comment text for Closure must include the `*` that
         * turns a `/*` comment into a `/**` comment, as well as surrounding whitespace.
         */
        PureAnnotation["CLOSURE"] = "* @pureOrBreakMyCode ";
        PureAnnotation["TERSER"] = "@__PURE__";
    })(PureAnnotation || (PureAnnotation = {}));
    var UNARY_OPERATORS = {
        '+': ts.SyntaxKind.PlusToken,
        '-': ts.SyntaxKind.MinusToken,
        '!': ts.SyntaxKind.ExclamationToken,
    };
    var BINARY_OPERATORS = {
        '&&': ts.SyntaxKind.AmpersandAmpersandToken,
        '>': ts.SyntaxKind.GreaterThanToken,
        '>=': ts.SyntaxKind.GreaterThanEqualsToken,
        '&': ts.SyntaxKind.AmpersandToken,
        '/': ts.SyntaxKind.SlashToken,
        '==': ts.SyntaxKind.EqualsEqualsToken,
        '===': ts.SyntaxKind.EqualsEqualsEqualsToken,
        '<': ts.SyntaxKind.LessThanToken,
        '<=': ts.SyntaxKind.LessThanEqualsToken,
        '-': ts.SyntaxKind.MinusToken,
        '%': ts.SyntaxKind.PercentToken,
        '*': ts.SyntaxKind.AsteriskToken,
        '!=': ts.SyntaxKind.ExclamationEqualsToken,
        '!==': ts.SyntaxKind.ExclamationEqualsEqualsToken,
        '||': ts.SyntaxKind.BarBarToken,
        '+': ts.SyntaxKind.PlusToken,
        '??': ts.SyntaxKind.QuestionQuestionToken,
    };
    var VAR_TYPES = {
        'const': ts.NodeFlags.Const,
        'let': ts.NodeFlags.Let,
        'var': ts.NodeFlags.None,
    };
    /**
     * A TypeScript flavoured implementation of the AstFactory.
     */
    var TypeScriptAstFactory = /** @class */ (function () {
        function TypeScriptAstFactory(annotateForClosureCompiler) {
            this.annotateForClosureCompiler = annotateForClosureCompiler;
            this.externalSourceFiles = new Map();
            this.attachComments = attachComments;
            this.createArrayLiteral = ts.createArrayLiteral;
            this.createConditional = ts.createConditional;
            this.createElementAccess = ts.createElementAccess;
            this.createExpressionStatement = ts.createExpressionStatement;
            this.createIdentifier = ts.createIdentifier;
            this.createParenthesizedExpression = ts.createParen;
            this.createPropertyAccess = ts.createPropertyAccess;
            this.createThrowStatement = ts.createThrow;
            this.createTypeOfExpression = ts.createTypeOf;
        }
        TypeScriptAstFactory.prototype.createAssignment = function (target, value) {
            return ts.createBinary(target, ts.SyntaxKind.EqualsToken, value);
        };
        TypeScriptAstFactory.prototype.createBinaryExpression = function (leftOperand, operator, rightOperand) {
            return ts.createBinary(leftOperand, BINARY_OPERATORS[operator], rightOperand);
        };
        TypeScriptAstFactory.prototype.createBlock = function (body) {
            return ts.createBlock(body);
        };
        TypeScriptAstFactory.prototype.createCallExpression = function (callee, args, pure) {
            var call = ts.createCall(callee, undefined, args);
            if (pure) {
                ts.addSyntheticLeadingComment(call, ts.SyntaxKind.MultiLineCommentTrivia, this.annotateForClosureCompiler ? PureAnnotation.CLOSURE : PureAnnotation.TERSER, 
                /* trailing newline */ false);
            }
            return call;
        };
        TypeScriptAstFactory.prototype.createFunctionDeclaration = function (functionName, parameters, body) {
            if (!ts.isBlock(body)) {
                throw new Error("Invalid syntax, expected a block, but got " + ts.SyntaxKind[body.kind] + ".");
            }
            return ts.createFunctionDeclaration(undefined, undefined, undefined, functionName, undefined, parameters.map(function (param) { return ts.createParameter(undefined, undefined, undefined, param); }), undefined, body);
        };
        TypeScriptAstFactory.prototype.createFunctionExpression = function (functionName, parameters, body) {
            if (!ts.isBlock(body)) {
                throw new Error("Invalid syntax, expected a block, but got " + ts.SyntaxKind[body.kind] + ".");
            }
            return ts.createFunctionExpression(undefined, undefined, functionName !== null && functionName !== void 0 ? functionName : undefined, undefined, parameters.map(function (param) { return ts.createParameter(undefined, undefined, undefined, param); }), undefined, body);
        };
        TypeScriptAstFactory.prototype.createIfStatement = function (condition, thenStatement, elseStatement) {
            return ts.createIf(condition, thenStatement, elseStatement !== null && elseStatement !== void 0 ? elseStatement : undefined);
        };
        TypeScriptAstFactory.prototype.createLiteral = function (value) {
            if (value === undefined) {
                return ts.createIdentifier('undefined');
            }
            else if (value === null) {
                return ts.createNull();
            }
            else {
                return ts.createLiteral(value);
            }
        };
        TypeScriptAstFactory.prototype.createNewExpression = function (expression, args) {
            return ts.createNew(expression, undefined, args);
        };
        TypeScriptAstFactory.prototype.createObjectLiteral = function (properties) {
            return ts.createObjectLiteral(properties.map(function (prop) { return ts.createPropertyAssignment(prop.quoted ? ts.createLiteral(prop.propertyName) :
                ts.createIdentifier(prop.propertyName), prop.value); }));
        };
        TypeScriptAstFactory.prototype.createReturnStatement = function (expression) {
            return ts.createReturn(expression !== null && expression !== void 0 ? expression : undefined);
        };
        TypeScriptAstFactory.prototype.createTaggedTemplate = function (tag, template) {
            var templateLiteral;
            var length = template.elements.length;
            var head = template.elements[0];
            if (length === 1) {
                templateLiteral = ts.createNoSubstitutionTemplateLiteral(head.cooked, head.raw);
            }
            else {
                var spans = [];
                // Create the middle parts
                for (var i = 1; i < length - 1; i++) {
                    var _a = template.elements[i], cooked = _a.cooked, raw = _a.raw, range = _a.range;
                    var middle = createTemplateMiddle(cooked, raw);
                    if (range !== null) {
                        this.setSourceMapRange(middle, range);
                    }
                    spans.push(ts.createTemplateSpan(template.expressions[i - 1], middle));
                }
                // Create the tail part
                var resolvedExpression = template.expressions[length - 2];
                var templatePart = template.elements[length - 1];
                var templateTail = createTemplateTail(templatePart.cooked, templatePart.raw);
                if (templatePart.range !== null) {
                    this.setSourceMapRange(templateTail, templatePart.range);
                }
                spans.push(ts.createTemplateSpan(resolvedExpression, templateTail));
                // Put it all together
                templateLiteral =
                    ts.createTemplateExpression(ts.createTemplateHead(head.cooked, head.raw), spans);
            }
            if (head.range !== null) {
                this.setSourceMapRange(templateLiteral, head.range);
            }
            return ts.createTaggedTemplate(tag, templateLiteral);
        };
        TypeScriptAstFactory.prototype.createUnaryExpression = function (operator, operand) {
            return ts.createPrefix(UNARY_OPERATORS[operator], operand);
        };
        TypeScriptAstFactory.prototype.createVariableDeclaration = function (variableName, initializer, type) {
            return ts.createVariableStatement(undefined, ts.createVariableDeclarationList([ts.createVariableDeclaration(variableName, undefined, initializer !== null && initializer !== void 0 ? initializer : undefined)], VAR_TYPES[type]));
        };
        TypeScriptAstFactory.prototype.setSourceMapRange = function (node, sourceMapRange) {
            if (sourceMapRange === null) {
                return node;
            }
            var url = sourceMapRange.url;
            if (!this.externalSourceFiles.has(url)) {
                this.externalSourceFiles.set(url, ts.createSourceMapSource(url, sourceMapRange.content, function (pos) { return pos; }));
            }
            var source = this.externalSourceFiles.get(url);
            ts.setSourceMapRange(node, { pos: sourceMapRange.start.offset, end: sourceMapRange.end.offset, source: source });
            return node;
        };
        return TypeScriptAstFactory;
    }());
    exports.TypeScriptAstFactory = TypeScriptAstFactory;
    // HACK: Use this in place of `ts.createTemplateMiddle()`.
    // Revert once https://github.com/microsoft/TypeScript/issues/35374 is fixed.
    function createTemplateMiddle(cooked, raw) {
        var node = ts.createTemplateHead(cooked, raw);
        node.kind = ts.SyntaxKind.TemplateMiddle;
        return node;
    }
    exports.createTemplateMiddle = createTemplateMiddle;
    // HACK: Use this in place of `ts.createTemplateTail()`.
    // Revert once https://github.com/microsoft/TypeScript/issues/35374 is fixed.
    function createTemplateTail(cooked, raw) {
        var node = ts.createTemplateHead(cooked, raw);
        node.kind = ts.SyntaxKind.TemplateTail;
        return node;
    }
    exports.createTemplateTail = createTemplateTail;
    /**
     * Attach the given `leadingComments` to the `statement` node.
     *
     * @param statement The statement that will have comments attached.
     * @param leadingComments The comments to attach to the statement.
     */
    function attachComments(statement, leadingComments) {
        var e_1, _a, e_2, _b;
        try {
            for (var leadingComments_1 = tslib_1.__values(leadingComments), leadingComments_1_1 = leadingComments_1.next(); !leadingComments_1_1.done; leadingComments_1_1 = leadingComments_1.next()) {
                var comment = leadingComments_1_1.value;
                var commentKind = comment.multiline ? ts.SyntaxKind.MultiLineCommentTrivia :
                    ts.SyntaxKind.SingleLineCommentTrivia;
                if (comment.multiline) {
                    ts.addSyntheticLeadingComment(statement, commentKind, comment.toString(), comment.trailingNewline);
                }
                else {
                    try {
                        for (var _c = (e_2 = void 0, tslib_1.__values(comment.toString().split('\n'))), _d = _c.next(); !_d.done; _d = _c.next()) {
                            var line = _d.value;
                            ts.addSyntheticLeadingComment(statement, commentKind, line, comment.trailingNewline);
                        }
                    }
                    catch (e_2_1) { e_2 = { error: e_2_1 }; }
                    finally {
                        try {
                            if (_d && !_d.done && (_b = _c.return)) _b.call(_c);
                        }
                        finally { if (e_2) throw e_2.error; }
                    }
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (leadingComments_1_1 && !leadingComments_1_1.done && (_a = leadingComments_1.return)) _a.call(leadingComments_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    }
    exports.attachComments = attachComments;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZXNjcmlwdF9hc3RfZmFjdG9yeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvbmd0c2MvdHJhbnNsYXRvci9zcmMvdHlwZXNjcmlwdF9hc3RfZmFjdG9yeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0lBQUE7Ozs7OztPQU1HO0lBQ0gsK0JBQWlDO0lBSWpDOzs7T0FHRztJQUNILElBQUssY0FTSjtJQVRELFdBQUssY0FBYztRQUNqQjs7OztXQUlHO1FBQ0gsbURBQWlDLENBQUE7UUFFakMsc0NBQW9CLENBQUE7SUFDdEIsQ0FBQyxFQVRJLGNBQWMsS0FBZCxjQUFjLFFBU2xCO0lBRUQsSUFBTSxlQUFlLEdBQWtEO1FBQ3JFLEdBQUcsRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLFNBQVM7UUFDNUIsR0FBRyxFQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUMsVUFBVTtRQUM3QixHQUFHLEVBQUUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0I7S0FDcEMsQ0FBQztJQUVGLElBQU0sZ0JBQWdCLEdBQThDO1FBQ2xFLElBQUksRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLHVCQUF1QjtRQUMzQyxHQUFHLEVBQUUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0I7UUFDbkMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUMsc0JBQXNCO1FBQzFDLEdBQUcsRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLGNBQWM7UUFDakMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUMsVUFBVTtRQUM3QixJQUFJLEVBQUUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxpQkFBaUI7UUFDckMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUMsdUJBQXVCO1FBQzVDLEdBQUcsRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLGFBQWE7UUFDaEMsSUFBSSxF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QUFBOzRCQUNiLEVBQUUsQ0FBQywwQkFBMEIsQ0FBQyxTQUFTLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7eUJBQ3RGOzs7Ozs7Ozs7aUJBQ0Y7YUFDRjs7Ozs7Ozs7O0lBQ0gsQ0FBQztJQWJELHdDQWFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcblxuaW1wb3J0IHtBc3RGYWN0b3J5LCBCaW5hcnlPcGVyYXRvciwgTGVhZGluZ0NvbW1lbnQsIE9iamVjdExpdGVyYWxQcm9wZXJ0eSwgU291cmNlTWFwUmFuZ2UsIFRlbXBsYXRlTGl0ZXJhbCwgVW5hcnlPcGVyYXRvciwgVmFyaWFibGVEZWNsYXJhdGlvblR5cGV9IGZyb20gJy4vYXBpL2FzdF9mYWN0b3J5JztcblxuLyoqXG4gKiBEaWZmZXJlbnQgb3B0aW1pemVycyB1c2UgZGlmZmVyZW50IGFubm90YXRpb25zIG9uIGEgZnVuY3Rpb24gb3IgbWV0aG9kIGNhbGwgdG8gaW5kaWNhdGUgaXRzIHB1cmVcbiAqIHN0YXR1cy5cbiAqL1xuZW51bSBQdXJlQW5ub3RhdGlvbiB7XG4gIC8qKlxuICAgKiBDbG9zdXJlJ3MgYW5ub3RhdGlvbiBmb3IgcHVyaXR5IGlzIGBAcHVyZU9yQnJlYWtNeUNvZGVgLCBidXQgdGhpcyBuZWVkcyB0byBiZSBpbiBhIHNlbWFudGljXG4gICAqIChqc2RvYykgZW5hYmxlZCBjb21tZW50LiBUaHVzLCB0aGUgYWN0dWFsIGNvbW1lbnQgdGV4dCBmb3IgQ2xvc3VyZSBtdXN0IGluY2x1ZGUgdGhlIGAqYCB0aGF0XG4gICAqIHR1cm5zIGEgYC8qYCBjb21tZW50IGludG8gYSBgLyoqYCBjb21tZW50LCBhcyB3ZWxsIGFzIHN1cnJvdW5kaW5nIHdoaXRlc3BhY2UuXG4gICAqL1xuICBDTE9TVVJFID0gJyogQHB1cmVPckJyZWFrTXlDb2RlICcsXG5cbiAgVEVSU0VSID0gJ0BfX1BVUkVfXycsXG59XG5cbmNvbnN0IFVOQVJZX09QRVJBVE9SUzogUmVjb3JkPFVuYXJ5T3BlcmF0b3IsIHRzLlByZWZpeFVuYXJ5T3BlcmF0b3I+ID0ge1xuICAnKyc6IHRzLlN5bnRheEtpbmQuUGx1c1Rva2VuLFxuICAnLSc6IHRzLlN5bnRheEtpbmQuTWludXNUb2tlbixcbiAgJyEnOiB0cy5TeW50YXhLaW5kLkV4Y2xhbWF0aW9uVG9rZW4sXG59O1xuXG5jb25zdCBCSU5BUllfT1BFUkFUT1JTOiBSZWNvcmQ8QmluYXJ5T3BlcmF0b3IsIHRzLkJpbmFyeU9wZXJhdG9yPiA9IHtcbiAgJyYmJzogdHMuU3ludGF4S2luZC5BbXBlcnNhbmRBbXBlcnNhbmRUb2tlbixcbiAgJz4nOiB0cy5TeW50YXhLaW5kLkdyZWF0ZXJUaGFuVG9rZW4sXG4gICc+PSc6IHRzLlN5bnRheEtpbmQuR3JlYXRlclRoYW5FcXVhbHNUb2tlbixcbiAgJyYnOiB0cy5TeW50YXhLaW5kLkFtcGVyc2FuZFRva2VuLFxuICAnLyc6IHRzLlN5bnRheEtpbmQuU2xhc2hUb2tlbixcbiAgJz09JzogdHMuU3ludGF4S2luZC5FcXVhbHNFcXVhbHNUb2tlbixcbiAgJz09PSc6IHRzLlN5bnRheEtpbmQuRXF1YWxzRXF1YWxzRXF1YWxzVG9rZW4sXG4gICc8JzogdHMuU3ludGF4S2luZC5MZXNzVGhhblRva2VuLFxuICAnPD0nOiB0cy5TeW50YXhLaW5kLkxlc3NUaGFuRXF1YWxzVG9rZW4sXG4gICctJzogdHMuU3ludGF4S2luZC5NaW51c1Rva2VuLFxuICAnJSc6IHRzLlN5bnRheEtpbmQuUGVyY2VudFRva2VuLFxuICAnKic6IHRzLlN5bnRheEtpbmQuQXN0ZXJpc2tUb2tlbixcbiAgJyE9JzogdHMuU3ludGF4S2luZC5FeGNsYW1hdGlvbkVxdWFsc1Rva2VuLFxuICAnIT09JzogdHMuU3ludGF4S2luZC5FeGNsYW1hdGlvbkVxdWFsc0VxdWFsc1Rva2VuLFxuICAnfHwnOiB0cy5TeW50YXhLaW5kLkJhckJhclRva2VuLFxuICAnKyc6IHRzLlN5bnRheEtpbmQuUGx1c1Rva2VuLFxuICAnPz8nOiB0cy5TeW50YXhLaW5kLlF1ZXN0aW9uUXVlc3Rpb25Ub2tlbixcbn07XG5cbmNvbnN0IFZBUl9UWVBFUzogUmVjb3JkPFZhcmlhYmxlRGVjbGFyYXRpb25UeXBlLCB0cy5Ob2RlRmxhZ3M+ID0ge1xuICAnY29uc3QnOiB0cy5Ob2RlRmxhZ3MuQ29uc3QsXG4gICdsZXQnOiB0cy5Ob2RlRmxhZ3MuTGV0LFxuICAndmFyJzogdHMuTm9kZUZsYWdzLk5vbmUsXG59O1xuXG4vKipcbiAqIEEgVHlwZVNjcmlwdCBmbGF2b3VyZWQgaW1wbGVtZW50YXRpb24gb2YgdGhlIEFzdEZhY3RvcnkuXG4gKi9cbmV4cG9ydCBjbGFzcyBUeXBlU2NyaXB0QXN0RmFjdG9yeSBpbXBsZW1lbnRzIEFzdEZhY3Rvcnk8dHMuU3RhdGVtZW50LCB0cy5FeHByZXNzaW9uPiB7XG4gIHByaXZhdGUgZXh0ZXJuYWxTb3VyY2VGaWxlcyA9IG5ldyBNYXA8c3RyaW5nLCB0cy5Tb3VyY2VNYXBTb3VyY2U+KCk7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBhbm5vdGF0ZUZvckNsb3N1cmVDb21waWxlcjogYm9vbGVhbikge31cblxuICBhdHRhY2hDb21tZW50cyA9IGF0dGFjaENvbW1lbnRzO1xuXG4gIGNyZWF0ZUFycmF5TGl0ZXJhbCA9IHRzLmNyZWF0ZUFycmF5TGl0ZXJhbDtcblxuICBjcmVhdGVBc3NpZ25tZW50KHRhcmdldDogdHMuRXhwcmVzc2lvbiwgdmFsdWU6IHRzLkV4cHJlc3Npb24pOiB0cy5FeHByZXNzaW9uIHtcbiAgICByZXR1cm4gdHMuY3JlYXRlQmluYXJ5KHRhcmdldCwgdHMuU3ludGF4S2luZC5FcXVhbHNUb2tlbiwgdmFsdWUpO1xuICB9XG5cbiAgY3JlYXRlQmluYXJ5RXhwcmVzc2lvbihcbiAgICAgIGxlZnRPcGVyYW5kOiB0cy5FeHByZXNzaW9uLCBvcGVyYXRvcjogQmluYXJ5T3BlcmF0b3IsXG4gICAgICByaWdodE9wZXJhbmQ6IHRzLkV4cHJlc3Npb24pOiB0cy5FeHByZXNzaW9uIHtcbiAgICByZXR1cm4gdHMuY3JlYXRlQmluYXJ5KGxlZnRPcGVyYW5kLCBCSU5BUllfT1BFUkFUT1JTW29wZXJhdG9yXSwgcmlnaHRPcGVyYW5kKTtcbiAgfVxuXG4gIGNyZWF0ZUJsb2NrKGJvZHk6IHRzLlN0YXRlbWVudFtdKTogdHMuU3RhdGVtZW50IHtcbiAgICByZXR1cm4gdHMuY3JlYXRlQmxvY2soYm9keSk7XG4gIH1cblxuICBjcmVhdGVDYWxsRXhwcmVzc2lvbihjYWxsZWU6IHRzLkV4cHJlc3Npb24sIGFyZ3M6IHRzLkV4cHJlc3Npb25bXSwgcHVyZTogYm9vbGVhbik6IHRzLkV4cHJlc3Npb24ge1xuICAgIGNvbnN0IGNhbGwgPSB0cy5jcmVhdGVDYWxsKGNhbGxlZSwgdW5kZWZpbmVkLCBhcmdzKTtcbiAgICBpZiAocHVyZSkge1xuICAgICAgdHMuYWRkU3ludGhldGljTGVhZGluZ0NvbW1lbnQoXG4gICAgICAgICAgY2FsbCwgdHMuU3ludGF4S2luZC5NdWx0aUxpbmVDb21tZW50VHJpdmlhLFxuICAgICAgICAgIHRoaXMuYW5ub3RhdGVGb3JDbG9zdXJlQ29tcGlsZXIgPyBQdXJlQW5ub3RhdGlvbi5DTE9TVVJFIDogUHVyZUFubm90YXRpb24uVEVSU0VSLFxuICAgICAgICAgIC8qIHRyYWlsaW5nIG5ld2xpbmUgKi8gZmFsc2UpO1xuICAgIH1cbiAgICByZXR1cm4gY2FsbDtcbiAgfVxuXG4gIGNyZWF0ZUNvbmRpdGlvbmFsID0gdHMuY3JlYXRlQ29uZGl0aW9uYWw7XG5cbiAgY3JlYXRlRWxlbWVudEFjY2VzcyA9IHRzLmNyZWF0ZUVsZW1lbnRBY2Nlc3M7XG5cbiAgY3JlYXRlRXhwcmVzc2lvblN0YXRlbWVudCA9IHRzLmNyZWF0ZUV4cHJlc3Npb25TdGF0ZW1lbnQ7XG5cbiAgY3JlYXRlRnVuY3Rpb25EZWNsYXJhdGlvbihmdW5jdGlvbk5hbWU6IHN0cmluZywgcGFyYW1ldGVyczogc3RyaW5nW10sIGJvZHk6IHRzLlN0YXRlbWVudCk6XG4gICAgICB0cy5TdGF0ZW1lbnQge1xuICAgIGlmICghdHMuaXNCbG9jayhib2R5KSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHN5bnRheCwgZXhwZWN0ZWQgYSBibG9jaywgYnV0IGdvdCAke3RzLlN5bnRheEtpbmRbYm9keS5raW5kXX0uYCk7XG4gICAgfVxuICAgIHJldHVybiB0cy5jcmVhdGVGdW5jdGlvbkRlY2xhcmF0aW9uKFxuICAgICAgICB1bmRlZmluZWQsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBmdW5jdGlvbk5hbWUsIHVuZGVmaW5lZCxcbiAgICAgICAgcGFyYW1ldGVycy5tYXAocGFyYW0gPT4gdHMuY3JlYXRlUGFyYW1ldGVyKHVuZGVmaW5lZCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIHBhcmFtKSksXG4gICAgICAgIHVuZGVmaW5lZCwgYm9keSk7XG4gIH1cblxuICBjcmVhdGVGdW5jdGlvbkV4cHJlc3Npb24oZnVuY3Rpb25OYW1lOiBzdHJpbmd8bnVsbCwgcGFyYW1ldGVyczogc3RyaW5nW10sIGJvZHk6IHRzLlN0YXRlbWVudCk6XG4gICAgICB0cy5FeHByZXNzaW9uIHtcbiAgICBpZiAoIXRzLmlzQmxvY2soYm9keSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBzeW50YXgsIGV4cGVjdGVkIGEgYmxvY2ssIGJ1dCBnb3QgJHt0cy5TeW50YXhLaW5kW2JvZHkua2luZF19LmApO1xuICAgIH1cbiAgICByZXR1cm4gdHMuY3JlYXRlRnVuY3Rpb25FeHByZXNzaW9uKFxuICAgICAgICB1bmRlZmluZWQsIHVuZGVmaW5lZCwgZnVuY3Rpb25OYW1lID8/IHVuZGVmaW5lZCwgdW5kZWZpbmVkLFxuICAgICAgICBwYXJhbWV0ZXJzLm1hcChwYXJhbSA9PiB0cy5jcmVhdGVQYXJhbWV0ZXIodW5kZWZpbmVkLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgcGFyYW0pKSxcbiAgICAgICAgdW5kZWZpbmVkLCBib2R5KTtcbiAgfVxuXG4gIGNyZWF0ZUlkZW50aWZpZXIgPSB0cy5jcmVhdGVJZGVudGlmaWVyO1xuXG4gIGNyZWF0ZUlmU3RhdGVtZW50KFxuICAgICAgY29uZGl0aW9uOiB0cy5FeHByZXNzaW9uLCB0aGVuU3RhdGVtZW50OiB0cy5TdGF0ZW1lbnQsXG4gICAgICBlbHNlU3RhdGVtZW50OiB0cy5TdGF0ZW1lbnR8bnVsbCk6IHRzLlN0YXRlbWVudCB7XG4gICAgcmV0dXJuIHRzLmNyZWF0ZUlmKGNvbmRpdGlvbiwgdGhlblN0YXRlbWVudCwgZWxzZVN0YXRlbWVudCA/PyB1bmRlZmluZWQpO1xuICB9XG5cbiAgY3JlYXRlTGl0ZXJhbCh2YWx1ZTogc3RyaW5nfG51bWJlcnxib29sZWFufG51bGx8dW5kZWZpbmVkKTogdHMuRXhwcmVzc2lvbiB7XG4gICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiB0cy5jcmVhdGVJZGVudGlmaWVyKCd1bmRlZmluZWQnKTtcbiAgICB9IGVsc2UgaWYgKHZhbHVlID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gdHMuY3JlYXRlTnVsbCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdHMuY3JlYXRlTGl0ZXJhbCh2YWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgY3JlYXRlTmV3RXhwcmVzc2lvbihleHByZXNzaW9uOiB0cy5FeHByZXNzaW9uLCBhcmdzOiB0cy5FeHByZXNzaW9uW10pOiB0cy5FeHByZXNzaW9uIHtcbiAgICByZXR1cm4gdHMuY3JlYXRlTmV3KGV4cHJlc3Npb24sIHVuZGVmaW5lZCwgYXJncyk7XG4gIH1cblxuICBjcmVhdGVPYmplY3RMaXRlcmFsKHByb3BlcnRpZXM6IE9iamVjdExpdGVyYWxQcm9wZXJ0eTx0cy5FeHByZXNzaW9uPltdKTogdHMuRXhwcmVzc2lvbiB7XG4gICAgcmV0dXJuIHRzLmNyZWF0ZU9iamVjdExpdGVyYWwocHJvcGVydGllcy5tYXAoXG4gICAgICAgIHByb3AgPT4gdHMuY3JlYXRlUHJvcGVydHlBc3NpZ25tZW50KFxuICAgICAgICAgICAgcHJvcC5xdW90ZWQgPyB0cy5jcmVhdGVMaXRlcmFsKHByb3AucHJvcGVydHlOYW1lKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHRzLmNyZWF0ZUlkZW50aWZpZXIocHJvcC5wcm9wZXJ0eU5hbWUpLFxuICAgICAgICAgICAgcHJvcC52YWx1ZSkpKTtcbiAgfVxuXG4gIGNyZWF0ZVBhcmVudGhlc2l6ZWRFeHByZXNzaW9uID0gdHMuY3JlYXRlUGFyZW47XG5cbiAgY3JlYXRlUHJvcGVydHlBY2Nlc3MgPSB0cy5jcmVhdGVQcm9wZXJ0eUFjY2VzcztcblxuICBjcmVhdGVSZXR1cm5TdGF0ZW1lbnQoZXhwcmVzc2lvbjogdHMuRXhwcmVzc2lvbnxudWxsKTogdHMuU3RhdGVtZW50IHtcbiAgICByZXR1cm4gdHMuY3JlYXRlUmV0dXJuKGV4cHJlc3Npb24gPz8gdW5kZWZpbmVkKTtcbiAgfVxuXG4gIGNyZWF0ZVRhZ2dlZFRlbXBsYXRlKHRhZzogdHMuRXhwcmVzc2lvbiwgdGVtcGxhdGU6IFRlbXBsYXRlTGl0ZXJhbDx0cy5FeHByZXNzaW9uPik6XG4gICAgICB0cy5FeHByZXNzaW9uIHtcbiAgICBsZXQgdGVtcGxhdGVMaXRlcmFsOiB0cy5UZW1wbGF0ZUxpdGVyYWw7XG4gICAgY29uc3QgbGVuZ3RoID0gdGVtcGxhdGUuZWxlbWVudHMubGVuZ3RoO1xuICAgIGNvbnN0IGhlYWQgPSB0ZW1wbGF0ZS5lbGVtZW50c1swXTtcbiAgICBpZiAobGVuZ3RoID09PSAxKSB7XG4gICAgICB0ZW1wbGF0ZUxpdGVyYWwgPSB0cy5jcmVhdGVOb1N1YnN0aXR1dGlvblRlbXBsYXRlTGl0ZXJhbChoZWFkLmNvb2tlZCwgaGVhZC5yYXcpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBzcGFuczogdHMuVGVtcGxhdGVTcGFuW10gPSBbXTtcbiAgICAgIC8vIENyZWF0ZSB0aGUgbWlkZGxlIHBhcnRzXG4gICAgICBmb3IgKGxldCBpID0gMTsgaSA8IGxlbmd0aCAtIDE7IGkrKykge1xuICAgICAgICBjb25zdCB7Y29va2VkLCByYXcsIHJhbmdlfSA9IHRlbXBsYXRlLmVsZW1lbnRzW2ldO1xuICAgICAgICBjb25zdCBtaWRkbGUgPSBjcmVhdGVUZW1wbGF0ZU1pZGRsZShjb29rZWQsIHJhdyk7XG4gICAgICAgIGlmIChyYW5nZSAhPT0gbnVsbCkge1xuICAgICAgICAgIHRoaXMuc2V0U291cmNlTWFwUmFuZ2UobWlkZGxlLCByYW5nZSk7XG4gICAgICAgIH1cbiAgICAgICAgc3BhbnMucHVzaCh0cy5jcmVhdGVUZW1wbGF0ZVNwYW4odGVtcGxhdGUuZXhwcmVzc2lvbnNbaSAtIDFdLCBtaWRkbGUpKTtcbiAgICAgIH1cbiAgICAgIC8vIENyZWF0ZSB0aGUgdGFpbCBwYXJ0XG4gICAgICBjb25zdCByZXNvbHZlZEV4cHJlc3Npb24gPSB0ZW1wbGF0ZS5leHByZXNzaW9uc1tsZW5ndGggLSAyXTtcbiAgICAgIGNvbnN0IHRlbXBsYXRlUGFydCA9IHRlbXBsYXRlLmVsZW1lbnRzW2xlbmd0aCAtIDFdO1xuICAgICAgY29uc3QgdGVtcGxhdGVUYWlsID0gY3JlYXRlVGVtcGxhdGVUYWlsKHRlbXBsYXRlUGFydC5jb29rZWQsIHRlbXBsYXRlUGFydC5yYXcpO1xuICAgICAgaWYgKHRlbXBsYXRlUGFydC5yYW5nZSAhPT0gbnVsbCkge1xuICAgICAgICB0aGlzLnNldFNvdXJjZU1hcFJhbmdlKHRlbXBsYXRlVGFpbCwgdGVtcGxhdGVQYXJ0LnJhbmdlKTtcbiAgICAgIH1cbiAgICAgIHNwYW5zLnB1c2godHMuY3JlYXRlVGVtcGxhdGVTcGFuKHJlc29sdmVkRXhwcmVzc2lvbiwgdGVtcGxhdGVUYWlsKSk7XG4gICAgICAvLyBQdXQgaXQgYWxsIHRvZ2V0aGVyXG4gICAgICB0ZW1wbGF0ZUxpdGVyYWwgPVxuICAgICAgICAgIHRzLmNyZWF0ZVRlbXBsYXRlRXhwcmVzc2lvbih0cy5jcmVhdGVUZW1wbGF0ZUhlYWQoaGVhZC5jb29rZWQsIGhlYWQucmF3KSwgc3BhbnMpO1xuICAgIH1cbiAgICBpZiAoaGVhZC5yYW5nZSAhPT0gbnVsbCkge1xuICAgICAgdGhpcy5zZXRTb3VyY2VNYXBSYW5nZSh0ZW1wbGF0ZUxpdGVyYWwsIGhlYWQucmFuZ2UpO1xuICAgIH1cbiAgICByZXR1cm4gdHMuY3JlYXRlVGFnZ2VkVGVtcGxhdGUodGFnLCB0ZW1wbGF0ZUxpdGVyYWwpO1xuICB9XG5cbiAgY3JlYXRlVGhyb3dTdGF0ZW1lbnQgPSB0cy5jcmVhdGVUaHJvdztcblxuICBjcmVhdGVUeXBlT2ZFeHByZXNzaW9uID0gdHMuY3JlYXRlVHlwZU9mO1xuXG5cbiAgY3JlYXRlVW5hcnlFeHByZXNzaW9uKG9wZXJhdG9yOiBVbmFyeU9wZXJhdG9yLCBvcGVyYW5kOiB0cy5FeHByZXNzaW9uKTogdHMuRXhwcmVzc2lvbiB7XG4gICAgcmV0dXJuIHRzLmNyZWF0ZVByZWZpeChVTkFSWV9PUEVSQVRPUlNbb3BlcmF0b3JdLCBvcGVyYW5kKTtcbiAgfVxuXG4gIGNyZWF0ZVZhcmlhYmxlRGVjbGFyYXRpb24oXG4gICAgICB2YXJpYWJsZU5hbWU6IHN0cmluZywgaW5pdGlhbGl6ZXI6IHRzLkV4cHJlc3Npb258bnVsbCxcbiAgICAgIHR5cGU6IFZhcmlhYmxlRGVjbGFyYXRpb25UeXBlKTogdHMuU3RhdGVtZW50IHtcbiAgICByZXR1cm4gdHMuY3JlYXRlVmFyaWFibGVTdGF0ZW1lbnQoXG4gICAgICAgIHVuZGVmaW5lZCxcbiAgICAgICAgdHMuY3JlYXRlVmFyaWFibGVEZWNsYXJhdGlvbkxpc3QoXG4gICAgICAgICAgICBbdHMuY3JlYXRlVmFyaWFibGVEZWNsYXJhdGlvbih2YXJpYWJsZU5hbWUsIHVuZGVmaW5lZCwgaW5pdGlhbGl6ZXIgPz8gdW5kZWZpbmVkKV0sXG4gICAgICAgICAgICBWQVJfVFlQRVNbdHlwZV0pLFxuICAgICk7XG4gIH1cblxuICBzZXRTb3VyY2VNYXBSYW5nZTxUIGV4dGVuZHMgdHMuTm9kZT4obm9kZTogVCwgc291cmNlTWFwUmFuZ2U6IFNvdXJjZU1hcFJhbmdlfG51bGwpOiBUIHtcbiAgICBpZiAoc291cmNlTWFwUmFuZ2UgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiBub2RlO1xuICAgIH1cblxuICAgIGNvbnN0IHVybCA9IHNvdXJjZU1hcFJhbmdlLnVybDtcbiAgICBpZiAoIXRoaXMuZXh0ZXJuYWxTb3VyY2VGaWxlcy5oYXModXJsKSkge1xuICAgICAgdGhpcy5leHRlcm5hbFNvdXJjZUZpbGVzLnNldChcbiAgICAgICAgICB1cmwsIHRzLmNyZWF0ZVNvdXJjZU1hcFNvdXJjZSh1cmwsIHNvdXJjZU1hcFJhbmdlLmNvbnRlbnQsIHBvcyA9PiBwb3MpKTtcbiAgICB9XG4gICAgY29uc3Qgc291cmNlID0gdGhpcy5leHRlcm5hbFNvdXJjZUZpbGVzLmdldCh1cmwpO1xuICAgIHRzLnNldFNvdXJjZU1hcFJhbmdlKFxuICAgICAgICBub2RlLCB7cG9zOiBzb3VyY2VNYXBSYW5nZS5zdGFydC5vZmZzZXQsIGVuZDogc291cmNlTWFwUmFuZ2UuZW5kLm9mZnNldCwgc291cmNlfSk7XG4gICAgcmV0dXJuIG5vZGU7XG4gIH1cbn1cblxuLy8gSEFDSzogVXNlIHRoaXMgaW4gcGxhY2Ugb2YgYHRzLmNyZWF0ZVRlbXBsYXRlTWlkZGxlKClgLlxuLy8gUmV2ZXJ0IG9uY2UgaHR0cHM6Ly9naXRodWIuY29tL21pY3Jvc29mdC9UeXBlU2NyaXB0L2lzc3Vlcy8zNTM3NCBpcyBmaXhlZC5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVUZW1wbGF0ZU1pZGRsZShjb29rZWQ6IHN0cmluZywgcmF3OiBzdHJpbmcpOiB0cy5UZW1wbGF0ZU1pZGRsZSB7XG4gIGNvbnN0IG5vZGU6IHRzLlRlbXBsYXRlTGl0ZXJhbExpa2VOb2RlID0gdHMuY3JlYXRlVGVtcGxhdGVIZWFkKGNvb2tlZCwgcmF3KTtcbiAgKG5vZGUua2luZCBhcyB0cy5TeW50YXhLaW5kKSA9IHRzLlN5bnRheEtpbmQuVGVtcGxhdGVNaWRkbGU7XG4gIHJldHVybiBub2RlIGFzIHRzLlRlbXBsYXRlTWlkZGxlO1xufVxuXG4vLyBIQUNLOiBVc2UgdGhpcyBpbiBwbGFjZSBvZiBgdHMuY3JlYXRlVGVtcGxhdGVUYWlsKClgLlxuLy8gUmV2ZXJ0IG9uY2UgaHR0cHM6Ly9naXRodWIuY29tL21pY3Jvc29mdC9UeXBlU2NyaXB0L2lzc3Vlcy8zNTM3NCBpcyBmaXhlZC5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVUZW1wbGF0ZVRhaWwoY29va2VkOiBzdHJpbmcsIHJhdzogc3RyaW5nKTogdHMuVGVtcGxhdGVUYWlsIHtcbiAgY29uc3Qgbm9kZTogdHMuVGVtcGxhdGVMaXRlcmFsTGlrZU5vZGUgPSB0cy5jcmVhdGVUZW1wbGF0ZUhlYWQoY29va2VkLCByYXcpO1xuICAobm9kZS5raW5kIGFzIHRzLlN5bnRheEtpbmQpID0gdHMuU3ludGF4S2luZC5UZW1wbGF0ZVRhaWw7XG4gIHJldHVybiBub2RlIGFzIHRzLlRlbXBsYXRlVGFpbDtcbn1cblxuLyoqXG4gKiBBdHRhY2ggdGhlIGdpdmVuIGBsZWFkaW5nQ29tbWVudHNgIHRvIHRoZSBgc3RhdGVtZW50YCBub2RlLlxuICpcbiAqIEBwYXJhbSBzdGF0ZW1lbnQgVGhlIHN0YXRlbWVudCB0aGF0IHdpbGwgaGF2ZSBjb21tZW50cyBhdHRhY2hlZC5cbiAqIEBwYXJhbSBsZWFkaW5nQ29tbWVudHMgVGhlIGNvbW1lbnRzIHRvIGF0dGFjaCB0byB0aGUgc3RhdGVtZW50LlxuICovXG5leHBvcnQgZnVuY3Rpb24gYXR0YWNoQ29tbWVudHMoc3RhdGVtZW50OiB0cy5TdGF0ZW1lbnQsIGxlYWRpbmdDb21tZW50czogTGVhZGluZ0NvbW1lbnRbXSk6IHZvaWQge1xuICBmb3IgKGNvbnN0IGNvbW1lbnQgb2YgbGVhZGluZ0NvbW1lbnRzKSB7XG4gICAgY29uc3QgY29tbWVudEtpbmQgPSBjb21tZW50Lm11bHRpbGluZSA/IHRzLlN5bnRheEtpbmQuTXVsdGlMaW5lQ29tbWVudFRyaXZpYSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRzLlN5bnRheEtpbmQuU2luZ2xlTGluZUNvbW1lbnRUcml2aWE7XG4gICAgaWYgKGNvbW1lbnQubXVsdGlsaW5lKSB7XG4gICAgICB0cy5hZGRTeW50aGV0aWNMZWFkaW5nQ29tbWVudChcbiAgICAgICAgICBzdGF0ZW1lbnQsIGNvbW1lbnRLaW5kLCBjb21tZW50LnRvU3RyaW5nKCksIGNvbW1lbnQudHJhaWxpbmdOZXdsaW5lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZm9yIChjb25zdCBsaW5lIG9mIGNvbW1lbnQudG9TdHJpbmcoKS5zcGxpdCgnXFxuJykpIHtcbiAgICAgICAgdHMuYWRkU3ludGhldGljTGVhZGluZ0NvbW1lbnQoc3RhdGVtZW50LCBjb21tZW50S2luZCwgbGluZSwgY29tbWVudC50cmFpbGluZ05ld2xpbmUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIl19