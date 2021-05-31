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
        define("@angular/compiler/src/output/abstract_emitter", ["require", "exports", "tslib", "@angular/compiler/src/output/output_ast", "@angular/compiler/src/output/source_map"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.escapeIdentifier = exports.AbstractEmitterVisitor = exports.EmitterVisitorContext = exports.CATCH_STACK_VAR = exports.CATCH_ERROR_VAR = void 0;
    var tslib_1 = require("tslib");
    var o = require("@angular/compiler/src/output/output_ast");
    var source_map_1 = require("@angular/compiler/src/output/source_map");
    var _SINGLE_QUOTE_ESCAPE_STRING_RE = /'|\\|\n|\r|\$/g;
    var _LEGAL_IDENTIFIER_RE = /^[$A-Z_][0-9A-Z_$]*$/i;
    var _INDENT_WITH = '  ';
    exports.CATCH_ERROR_VAR = o.variable('error', null, null);
    exports.CATCH_STACK_VAR = o.variable('stack', null, null);
    var _EmittedLine = /** @class */ (function () {
        function _EmittedLine(indent) {
            this.indent = indent;
            this.partsLength = 0;
            this.parts = [];
            this.srcSpans = [];
        }
        return _EmittedLine;
    }());
    var EmitterVisitorContext = /** @class */ (function () {
        function EmitterVisitorContext(_indent) {
            this._indent = _indent;
            this._classes = [];
            this._preambleLineCount = 0;
            this._lines = [new _EmittedLine(_indent)];
        }
        EmitterVisitorContext.createRoot = function () {
            return new EmitterVisitorContext(0);
        };
        Object.defineProperty(EmitterVisitorContext.prototype, "_currentLine", {
            /**
             * @internal strip this from published d.ts files due to
             * https://github.com/microsoft/TypeScript/issues/36216
             */
            get: function () {
                return this._lines[this._lines.length - 1];
            },
            enumerable: false,
            configurable: true
        });
        EmitterVisitorContext.prototype.println = function (from, lastPart) {
            if (lastPart === void 0) { lastPart = ''; }
            this.print(from || null, lastPart, true);
        };
        EmitterVisitorContext.prototype.lineIsEmpty = function () {
            return this._currentLine.parts.length === 0;
        };
        EmitterVisitorContext.prototype.lineLength = function () {
            return this._currentLine.indent * _INDENT_WITH.length + this._currentLine.partsLength;
        };
        EmitterVisitorContext.prototype.print = function (from, part, newLine) {
            if (newLine === void 0) { newLine = false; }
            if (part.length > 0) {
                this._currentLine.parts.push(part);
                this._currentLine.partsLength += part.length;
                this._currentLine.srcSpans.push(from && from.sourceSpan || null);
            }
            if (newLine) {
                this._lines.push(new _EmittedLine(this._indent));
            }
        };
        EmitterVisitorContext.prototype.removeEmptyLastLine = function () {
            if (this.lineIsEmpty()) {
                this._lines.pop();
            }
        };
        EmitterVisitorContext.prototype.incIndent = function () {
            this._indent++;
            if (this.lineIsEmpty()) {
                this._currentLine.indent = this._indent;
            }
        };
        EmitterVisitorContext.prototype.decIndent = function () {
            this._indent--;
            if (this.lineIsEmpty()) {
                this._currentLine.indent = this._indent;
            }
        };
        EmitterVisitorContext.prototype.pushClass = function (clazz) {
            this._classes.push(clazz);
        };
        EmitterVisitorContext.prototype.popClass = function () {
            return this._classes.pop();
        };
        Object.defineProperty(EmitterVisitorContext.prototype, "currentClass", {
            get: function () {
                return this._classes.length > 0 ? this._classes[this._classes.length - 1] : null;
            },
            enumerable: false,
            configurable: true
        });
        EmitterVisitorContext.prototype.toSource = function () {
            return this.sourceLines
                .map(function (l) { return l.parts.length > 0 ? _createIndent(l.indent) + l.parts.join('') : ''; })
                .join('\n');
        };
        EmitterVisitorContext.prototype.toSourceMapGenerator = function (genFilePath, startsAtLine) {
            if (startsAtLine === void 0) { startsAtLine = 0; }
            var map = new source_map_1.SourceMapGenerator(genFilePath);
            var firstOffsetMapped = false;
            var mapFirstOffsetIfNeeded = function () {
                if (!firstOffsetMapped) {
                    // Add a single space so that tools won't try to load the file from disk.
                    // Note: We are using virtual urls like `ng:///`, so we have to
                    // provide a content here.
                    map.addSource(genFilePath, ' ').addMapping(0, genFilePath, 0, 0);
                    firstOffsetMapped = true;
                }
            };
            for (var i = 0; i < startsAtLine; i++) {
                map.addLine();
                mapFirstOffsetIfNeeded();
            }
            this.sourceLines.forEach(function (line, lineIdx) {
                map.addLine();
                var spans = line.srcSpans;
                var parts = line.parts;
                var col0 = line.indent * _INDENT_WITH.length;
                var spanIdx = 0;
                // skip leading parts without source spans
                while (spanIdx < spans.length && !spans[spanIdx]) {
                    col0 += parts[spanIdx].length;
                    spanIdx++;
                }
                if (spanIdx < spans.length && lineIdx === 0 && col0 === 0) {
                    firstOffsetMapped = true;
                }
                else {
                    mapFirstOffsetIfNeeded();
                }
                while (spanIdx < spans.length) {
                    var span = spans[spanIdx];
                    var source = span.start.file;
                    var sourceLine = span.start.line;
                    var sourceCol = span.start.col;
                    map.addSource(source.url, source.content)
                        .addMapping(col0, source.url, sourceLine, sourceCol);
                    col0 += parts[spanIdx].length;
                    spanIdx++;
                    // assign parts without span or the same span to the previous segment
                    while (spanIdx < spans.length && (span === spans[spanIdx] || !spans[spanIdx])) {
                        col0 += parts[spanIdx].length;
                        spanIdx++;
                    }
                }
            });
            return map;
        };
        EmitterVisitorContext.prototype.setPreambleLineCount = function (count) {
            return this._preambleLineCount = count;
        };
        EmitterVisitorContext.prototype.spanOf = function (line, column) {
            var emittedLine = this._lines[line - this._preambleLineCount];
            if (emittedLine) {
                var columnsLeft = column - _createIndent(emittedLine.indent).length;
                for (var partIndex = 0; partIndex < emittedLine.parts.length; partIndex++) {
                    var part = emittedLine.parts[partIndex];
                    if (part.length > columnsLeft) {
                        return emittedLine.srcSpans[partIndex];
                    }
                    columnsLeft -= part.length;
                }
            }
            return null;
        };
        Object.defineProperty(EmitterVisitorContext.prototype, "sourceLines", {
            /**
             * @internal strip this from published d.ts files due to
             * https://github.com/microsoft/TypeScript/issues/36216
             */
            get: function () {
                if (this._lines.length && this._lines[this._lines.length - 1].parts.length === 0) {
                    return this._lines.slice(0, -1);
                }
                return this._lines;
            },
            enumerable: false,
            configurable: true
        });
        return EmitterVisitorContext;
    }());
    exports.EmitterVisitorContext = EmitterVisitorContext;
    var AbstractEmitterVisitor = /** @class */ (function () {
        function AbstractEmitterVisitor(_escapeDollarInStrings) {
            this._escapeDollarInStrings = _escapeDollarInStrings;
        }
        AbstractEmitterVisitor.prototype.printLeadingComments = function (stmt, ctx) {
            var e_1, _a;
            if (stmt.leadingComments === undefined) {
                return;
            }
            try {
                for (var _b = tslib_1.__values(stmt.leadingComments), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var comment = _c.value;
                    if (comment instanceof o.JSDocComment) {
                        ctx.print(stmt, "/*" + comment.toString() + "*/", comment.trailingNewline);
                    }
                    else {
                        if (comment.multiline) {
                            ctx.print(stmt, "/* " + comment.text + " */", comment.trailingNewline);
                        }
                        else {
                            comment.text.split('\n').forEach(function (line) {
                                ctx.println(stmt, "// " + line);
                            });
                        }
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
        };
        AbstractEmitterVisitor.prototype.visitExpressionStmt = function (stmt, ctx) {
            this.printLeadingComments(stmt, ctx);
            stmt.expr.visitExpression(this, ctx);
            ctx.println(stmt, ';');
            return null;
        };
        AbstractEmitterVisitor.prototype.visitReturnStmt = function (stmt, ctx) {
            this.printLeadingComments(stmt, ctx);
            ctx.print(stmt, "return ");
            stmt.value.visitExpression(this, ctx);
            ctx.println(stmt, ';');
            return null;
        };
        AbstractEmitterVisitor.prototype.visitIfStmt = function (stmt, ctx) {
            this.printLeadingComments(stmt, ctx);
            ctx.print(stmt, "if (");
            stmt.condition.visitExpression(this, ctx);
            ctx.print(stmt, ") {");
            var hasElseCase = stmt.falseCase != null && stmt.falseCase.length > 0;
            if (stmt.trueCase.length <= 1 && !hasElseCase) {
                ctx.print(stmt, " ");
                this.visitAllStatements(stmt.trueCase, ctx);
                ctx.removeEmptyLastLine();
                ctx.print(stmt, " ");
            }
            else {
                ctx.println();
                ctx.incIndent();
                this.visitAllStatements(stmt.trueCase, ctx);
                ctx.decIndent();
                if (hasElseCase) {
                    ctx.println(stmt, "} else {");
                    ctx.incIndent();
                    this.visitAllStatements(stmt.falseCase, ctx);
                    ctx.decIndent();
                }
            }
            ctx.println(stmt, "}");
            return null;
        };
        AbstractEmitterVisitor.prototype.visitThrowStmt = function (stmt, ctx) {
            this.printLeadingComments(stmt, ctx);
            ctx.print(stmt, "throw ");
            stmt.error.visitExpression(this, ctx);
            ctx.println(stmt, ";");
            return null;
        };
        AbstractEmitterVisitor.prototype.visitWriteVarExpr = function (expr, ctx) {
            var lineWasEmpty = ctx.lineIsEmpty();
            if (!lineWasEmpty) {
                ctx.print(expr, '(');
            }
            ctx.print(expr, expr.name + " = ");
            expr.value.visitExpression(this, ctx);
            if (!lineWasEmpty) {
                ctx.print(expr, ')');
            }
            return null;
        };
        AbstractEmitterVisitor.prototype.visitWriteKeyExpr = function (expr, ctx) {
            var lineWasEmpty = ctx.lineIsEmpty();
            if (!lineWasEmpty) {
                ctx.print(expr, '(');
            }
            expr.receiver.visitExpression(this, ctx);
            ctx.print(expr, "[");
            expr.index.visitExpression(this, ctx);
            ctx.print(expr, "] = ");
            expr.value.visitExpression(this, ctx);
            if (!lineWasEmpty) {
                ctx.print(expr, ')');
            }
            return null;
        };
        AbstractEmitterVisitor.prototype.visitWritePropExpr = function (expr, ctx) {
            var lineWasEmpty = ctx.lineIsEmpty();
            if (!lineWasEmpty) {
                ctx.print(expr, '(');
            }
            expr.receiver.visitExpression(this, ctx);
            ctx.print(expr, "." + expr.name + " = ");
            expr.value.visitExpression(this, ctx);
            if (!lineWasEmpty) {
                ctx.print(expr, ')');
            }
            return null;
        };
        AbstractEmitterVisitor.prototype.visitInvokeMethodExpr = function (expr, ctx) {
            expr.receiver.visitExpression(this, ctx);
            var name = expr.name;
            if (expr.builtin != null) {
                name = this.getBuiltinMethodName(expr.builtin);
                if (name == null) {
                    // some builtins just mean to skip the call.
                    return null;
                }
            }
            ctx.print(expr, "." + name + "(");
            this.visitAllExpressions(expr.args, ctx, ",");
            ctx.print(expr, ")");
            return null;
        };
        AbstractEmitterVisitor.prototype.visitInvokeFunctionExpr = function (expr, ctx) {
            expr.fn.visitExpression(this, ctx);
            ctx.print(expr, "(");
            this.visitAllExpressions(expr.args, ctx, ',');
            ctx.print(expr, ")");
            return null;
        };
        AbstractEmitterVisitor.prototype.visitTaggedTemplateExpr = function (expr, ctx) {
            expr.tag.visitExpression(this, ctx);
            ctx.print(expr, '`' + expr.template.elements[0].rawText);
            for (var i = 1; i < expr.template.elements.length; i++) {
                ctx.print(expr, '${');
                expr.template.expressions[i - 1].visitExpression(this, ctx);
                ctx.print(expr, "}" + expr.template.elements[i].rawText);
            }
            ctx.print(expr, '`');
            return null;
        };
        AbstractEmitterVisitor.prototype.visitWrappedNodeExpr = function (ast, ctx) {
            throw new Error('Abstract emitter cannot visit WrappedNodeExpr.');
        };
        AbstractEmitterVisitor.prototype.visitTypeofExpr = function (expr, ctx) {
            ctx.print(expr, 'typeof ');
            expr.expr.visitExpression(this, ctx);
        };
        AbstractEmitterVisitor.prototype.visitReadVarExpr = function (ast, ctx) {
            var varName = ast.name;
            if (ast.builtin != null) {
                switch (ast.builtin) {
                    case o.BuiltinVar.Super:
                        varName = 'super';
                        break;
                    case o.BuiltinVar.This:
                        varName = 'this';
                        break;
                    case o.BuiltinVar.CatchError:
                        varName = exports.CATCH_ERROR_VAR.name;
                        break;
                    case o.BuiltinVar.CatchStack:
                        varName = exports.CATCH_STACK_VAR.name;
                        break;
                    default:
                        throw new Error("Unknown builtin variable " + ast.builtin);
                }
            }
            ctx.print(ast, varName);
            return null;
        };
        AbstractEmitterVisitor.prototype.visitInstantiateExpr = function (ast, ctx) {
            ctx.print(ast, "new ");
            ast.classExpr.visitExpression(this, ctx);
            ctx.print(ast, "(");
            this.visitAllExpressions(ast.args, ctx, ',');
            ctx.print(ast, ")");
            return null;
        };
        AbstractEmitterVisitor.prototype.visitLiteralExpr = function (ast, ctx) {
            var value = ast.value;
            if (typeof value === 'string') {
                ctx.print(ast, escapeIdentifier(value, this._escapeDollarInStrings));
            }
            else {
                ctx.print(ast, "" + value);
            }
            return null;
        };
        AbstractEmitterVisitor.prototype.visitLocalizedString = function (ast, ctx) {
            var head = ast.serializeI18nHead();
            ctx.print(ast, '$localize `' + head.raw);
            for (var i = 1; i < ast.messageParts.length; i++) {
                ctx.print(ast, '${');
                ast.expressions[i - 1].visitExpression(this, ctx);
                ctx.print(ast, "}" + ast.serializeI18nTemplatePart(i).raw);
            }
            ctx.print(ast, '`');
            return null;
        };
        AbstractEmitterVisitor.prototype.visitConditionalExpr = function (ast, ctx) {
            ctx.print(ast, "(");
            ast.condition.visitExpression(this, ctx);
            ctx.print(ast, '? ');
            ast.trueCase.visitExpression(this, ctx);
            ctx.print(ast, ': ');
            ast.falseCase.visitExpression(this, ctx);
            ctx.print(ast, ")");
            return null;
        };
        AbstractEmitterVisitor.prototype.visitNotExpr = function (ast, ctx) {
            ctx.print(ast, '!');
            ast.condition.visitExpression(this, ctx);
            return null;
        };
        AbstractEmitterVisitor.prototype.visitAssertNotNullExpr = function (ast, ctx) {
            ast.condition.visitExpression(this, ctx);
            return null;
        };
        AbstractEmitterVisitor.prototype.visitUnaryOperatorExpr = function (ast, ctx) {
            var opStr;
            switch (ast.operator) {
                case o.UnaryOperator.Plus:
                    opStr = '+';
                    break;
                case o.UnaryOperator.Minus:
                    opStr = '-';
                    break;
                default:
                    throw new Error("Unknown operator " + ast.operator);
            }
            if (ast.parens)
                ctx.print(ast, "(");
            ctx.print(ast, opStr);
            ast.expr.visitExpression(this, ctx);
            if (ast.parens)
                ctx.print(ast, ")");
            return null;
        };
        AbstractEmitterVisitor.prototype.visitBinaryOperatorExpr = function (ast, ctx) {
            var opStr;
            switch (ast.operator) {
                case o.BinaryOperator.Equals:
                    opStr = '==';
                    break;
                case o.BinaryOperator.Identical:
                    opStr = '===';
                    break;
                case o.BinaryOperator.NotEquals:
                    opStr = '!=';
                    break;
                case o.BinaryOperator.NotIdentical:
                    opStr = '!==';
                    break;
                case o.BinaryOperator.And:
                    opStr = '&&';
                    break;
                case o.BinaryOperator.BitwiseAnd:
                    opStr = '&';
                    break;
                case o.BinaryOperator.Or:
                    opStr = '||';
                    break;
                case o.BinaryOperator.Plus:
                    opStr = '+';
                    break;
                case o.BinaryOperator.Minus:
                    opStr = '-';
                    break;
                case o.BinaryOperator.Divide:
                    opStr = '/';
                    break;
                case o.BinaryOperator.Multiply:
                    opStr = '*';
                    break;
                case o.BinaryOperator.Modulo:
                    opStr = '%';
                    break;
                case o.BinaryOperator.Lower:
                    opStr = '<';
                    break;
                case o.BinaryOperator.LowerEquals:
                    opStr = '<=';
                    break;
                case o.BinaryOperator.Bigger:
                    opStr = '>';
                    break;
                case o.BinaryOperator.BiggerEquals:
                    opStr = '>=';
                    break;
                case o.BinaryOperator.NullishCoalesce:
                    opStr = '??';
                    break;
                default:
                    throw new Error("Unknown operator " + ast.operator);
            }
            if (ast.parens)
                ctx.print(ast, "(");
            ast.lhs.visitExpression(this, ctx);
            ctx.print(ast, " " + opStr + " ");
            ast.rhs.visitExpression(this, ctx);
            if (ast.parens)
                ctx.print(ast, ")");
            return null;
        };
        AbstractEmitterVisitor.prototype.visitReadPropExpr = function (ast, ctx) {
            ast.receiver.visitExpression(this, ctx);
            ctx.print(ast, ".");
            ctx.print(ast, ast.name);
            return null;
        };
        AbstractEmitterVisitor.prototype.visitReadKeyExpr = function (ast, ctx) {
            ast.receiver.visitExpression(this, ctx);
            ctx.print(ast, "[");
            ast.index.visitExpression(this, ctx);
            ctx.print(ast, "]");
            return null;
        };
        AbstractEmitterVisitor.prototype.visitLiteralArrayExpr = function (ast, ctx) {
            ctx.print(ast, "[");
            this.visitAllExpressions(ast.entries, ctx, ',');
            ctx.print(ast, "]");
            return null;
        };
        AbstractEmitterVisitor.prototype.visitLiteralMapExpr = function (ast, ctx) {
            var _this = this;
            ctx.print(ast, "{");
            this.visitAllObjects(function (entry) {
                ctx.print(ast, escapeIdentifier(entry.key, _this._escapeDollarInStrings, entry.quoted) + ":");
                entry.value.visitExpression(_this, ctx);
            }, ast.entries, ctx, ',');
            ctx.print(ast, "}");
            return null;
        };
        AbstractEmitterVisitor.prototype.visitCommaExpr = function (ast, ctx) {
            ctx.print(ast, '(');
            this.visitAllExpressions(ast.parts, ctx, ',');
            ctx.print(ast, ')');
            return null;
        };
        AbstractEmitterVisitor.prototype.visitAllExpressions = function (expressions, ctx, separator) {
            var _this = this;
            this.visitAllObjects(function (expr) { return expr.visitExpression(_this, ctx); }, expressions, ctx, separator);
        };
        AbstractEmitterVisitor.prototype.visitAllObjects = function (handler, expressions, ctx, separator) {
            var incrementedIndent = false;
            for (var i = 0; i < expressions.length; i++) {
                if (i > 0) {
                    if (ctx.lineLength() > 80) {
                        ctx.print(null, separator, true);
                        if (!incrementedIndent) {
                            // continuation are marked with double indent.
                            ctx.incIndent();
                            ctx.incIndent();
                            incrementedIndent = true;
                        }
                    }
                    else {
                        ctx.print(null, separator, false);
                    }
                }
                handler(expressions[i]);
            }
            if (incrementedIndent) {
                // continuation are marked with double indent.
                ctx.decIndent();
                ctx.decIndent();
            }
        };
        AbstractEmitterVisitor.prototype.visitAllStatements = function (statements, ctx) {
            var _this = this;
            statements.forEach(function (stmt) { return stmt.visitStatement(_this, ctx); });
        };
        return AbstractEmitterVisitor;
    }());
    exports.AbstractEmitterVisitor = AbstractEmitterVisitor;
    function escapeIdentifier(input, escapeDollar, alwaysQuote) {
        if (alwaysQuote === void 0) { alwaysQuote = true; }
        if (input == null) {
            return null;
        }
        var body = input.replace(_SINGLE_QUOTE_ESCAPE_STRING_RE, function () {
            var match = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                match[_i] = arguments[_i];
            }
            if (match[0] == '$') {
                return escapeDollar ? '\\$' : '$';
            }
            else if (match[0] == '\n') {
                return '\\n';
            }
            else if (match[0] == '\r') {
                return '\\r';
            }
            else {
                return "\\" + match[0];
            }
        });
        var requiresQuotes = alwaysQuote || !_LEGAL_IDENTIFIER_RE.test(body);
        return requiresQuotes ? "'" + body + "'" : body;
    }
    exports.escapeIdentifier = escapeIdentifier;
    function _createIndent(count) {
        var res = '';
        for (var i = 0; i < count; i++) {
            res += _INDENT_WITH;
        }
        return res;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWJzdHJhY3RfZW1pdHRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy9vdXRwdXQvYWJzdHJhY3RfZW1pdHRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBR0gsMkRBQWtDO0lBQ2xDLHNFQUFnRDtJQUVoRCxJQUFNLDhCQUE4QixHQUFHLGdCQUFnQixDQUFDO0lBQ3hELElBQU0sb0JBQW9CLEdBQUcsdUJBQXVCLENBQUM7SUFDckQsSUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDO0lBQ2IsUUFBQSxlQUFlLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ2xELFFBQUEsZUFBZSxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztJQU0vRDtRQUlFLHNCQUFtQixNQUFjO1lBQWQsV0FBTSxHQUFOLE1BQU0sQ0FBUTtZQUhqQyxnQkFBVyxHQUFHLENBQUMsQ0FBQztZQUNoQixVQUFLLEdBQWEsRUFBRSxDQUFDO1lBQ3JCLGFBQVEsR0FBNkIsRUFBRSxDQUFDO1FBQ0osQ0FBQztRQUN2QyxtQkFBQztJQUFELENBQUMsQUFMRCxJQUtDO0lBRUQ7UUFTRSwrQkFBb0IsT0FBZTtZQUFmLFlBQU8sR0FBUCxPQUFPLENBQVE7WUFIM0IsYUFBUSxHQUFrQixFQUFFLENBQUM7WUFDN0IsdUJBQWtCLEdBQUcsQ0FBQyxDQUFDO1lBRzdCLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBQzVDLENBQUM7UUFWTSxnQ0FBVSxHQUFqQjtZQUNFLE9BQU8sSUFBSSxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN0QyxDQUFDO1FBY0Qsc0JBQVks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QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN2RSxPQUFPLGNBQWMsQ0FBQyxDQUFDLENBQUMsTUFBSSxJQUFJLE1BQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0lBQzdDLENBQUM7SUFsQkQsNENBa0JDO0lBRUQsU0FBUyxhQUFhLENBQUMsS0FBYTtRQUNsQyxJQUFJLEdBQUcsR0FBRyxFQUFFLENBQUM7UUFDYixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQzlCLEdBQUcsSUFBSSxZQUFZLENBQUM7U0FDckI7UUFDRCxPQUFPLEdBQUcsQ0FBQztJQUNiLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtQYXJzZVNvdXJjZVNwYW59IGZyb20gJy4uL3BhcnNlX3V0aWwnO1xuaW1wb3J0ICogYXMgbyBmcm9tICcuL291dHB1dF9hc3QnO1xuaW1wb3J0IHtTb3VyY2VNYXBHZW5lcmF0b3J9IGZyb20gJy4vc291cmNlX21hcCc7XG5cbmNvbnN0IF9TSU5HTEVfUVVPVEVfRVNDQVBFX1NUUklOR19SRSA9IC8nfFxcXFx8XFxufFxccnxcXCQvZztcbmNvbnN0IF9MRUdBTF9JREVOVElGSUVSX1JFID0gL15bJEEtWl9dWzAtOUEtWl8kXSokL2k7XG5jb25zdCBfSU5ERU5UX1dJVEggPSAnICAnO1xuZXhwb3J0IGNvbnN0IENBVENIX0VSUk9SX1ZBUiA9IG8udmFyaWFibGUoJ2Vycm9yJywgbnVsbCwgbnVsbCk7XG5leHBvcnQgY29uc3QgQ0FUQ0hfU1RBQ0tfVkFSID0gby52YXJpYWJsZSgnc3RhY2snLCBudWxsLCBudWxsKTtcblxuZXhwb3J0IGludGVyZmFjZSBPdXRwdXRFbWl0dGVyIHtcbiAgZW1pdFN0YXRlbWVudHMoZ2VuRmlsZVBhdGg6IHN0cmluZywgc3RtdHM6IG8uU3RhdGVtZW50W10sIHByZWFtYmxlPzogc3RyaW5nfG51bGwpOiBzdHJpbmc7XG59XG5cbmNsYXNzIF9FbWl0dGVkTGluZSB7XG4gIHBhcnRzTGVuZ3RoID0gMDtcbiAgcGFydHM6IHN0cmluZ1tdID0gW107XG4gIHNyY1NwYW5zOiAoUGFyc2VTb3VyY2VTcGFufG51bGwpW10gPSBbXTtcbiAgY29uc3RydWN0b3IocHVibGljIGluZGVudDogbnVtYmVyKSB7fVxufVxuXG5leHBvcnQgY2xhc3MgRW1pdHRlclZpc2l0b3JDb250ZXh0IHtcbiAgc3RhdGljIGNyZWF0ZVJvb3QoKTogRW1pdHRlclZpc2l0b3JDb250ZXh0IHtcbiAgICByZXR1cm4gbmV3IEVtaXR0ZXJWaXNpdG9yQ29udGV4dCgwKTtcbiAgfVxuXG4gIHByaXZhdGUgX2xpbmVzOiBfRW1pdHRlZExpbmVbXTtcbiAgcHJpdmF0ZSBfY2xhc3Nlczogby5DbGFzc1N0bXRbXSA9IFtdO1xuICBwcml2YXRlIF9wcmVhbWJsZUxpbmVDb3VudCA9IDA7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfaW5kZW50OiBudW1iZXIpIHtcbiAgICB0aGlzLl9saW5lcyA9IFtuZXcgX0VtaXR0ZWRMaW5lKF9pbmRlbnQpXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAaW50ZXJuYWwgc3RyaXAgdGhpcyBmcm9tIHB1Ymxpc2hlZCBkLnRzIGZpbGVzIGR1ZSB0b1xuICAgKiBodHRwczovL2dpdGh1Yi5jb20vbWljcm9zb2Z0L1R5cGVTY3JpcHQvaXNzdWVzLzM2MjE2XG4gICAqL1xuICBwcml2YXRlIGdldCBfY3VycmVudExpbmUoKTogX0VtaXR0ZWRMaW5lIHtcbiAgICByZXR1cm4gdGhpcy5fbGluZXNbdGhpcy5fbGluZXMubGVuZ3RoIC0gMV07XG4gIH1cblxuICBwcmludGxuKGZyb20/OiB7c291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFufG51bGx9fG51bGwsIGxhc3RQYXJ0OiBzdHJpbmcgPSAnJyk6IHZvaWQge1xuICAgIHRoaXMucHJpbnQoZnJvbSB8fCBudWxsLCBsYXN0UGFydCwgdHJ1ZSk7XG4gIH1cblxuICBsaW5lSXNFbXB0eSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fY3VycmVudExpbmUucGFydHMubGVuZ3RoID09PSAwO1xuICB9XG5cbiAgbGluZUxlbmd0aCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9jdXJyZW50TGluZS5pbmRlbnQgKiBfSU5ERU5UX1dJVEgubGVuZ3RoICsgdGhpcy5fY3VycmVudExpbmUucGFydHNMZW5ndGg7XG4gIH1cblxuICBwcmludChmcm9tOiB7c291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFufG51bGx9fG51bGwsIHBhcnQ6IHN0cmluZywgbmV3TGluZTogYm9vbGVhbiA9IGZhbHNlKSB7XG4gICAgaWYgKHBhcnQubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5fY3VycmVudExpbmUucGFydHMucHVzaChwYXJ0KTtcbiAgICAgIHRoaXMuX2N1cnJlbnRMaW5lLnBhcnRzTGVuZ3RoICs9IHBhcnQubGVuZ3RoO1xuICAgICAgdGhpcy5fY3VycmVudExpbmUuc3JjU3BhbnMucHVzaChmcm9tICYmIGZyb20uc291cmNlU3BhbiB8fCBudWxsKTtcbiAgICB9XG4gICAgaWYgKG5ld0xpbmUpIHtcbiAgICAgIHRoaXMuX2xpbmVzLnB1c2gobmV3IF9FbWl0dGVkTGluZSh0aGlzLl9pbmRlbnQpKTtcbiAgICB9XG4gIH1cblxuICByZW1vdmVFbXB0eUxhc3RMaW5lKCkge1xuICAgIGlmICh0aGlzLmxpbmVJc0VtcHR5KCkpIHtcbiAgICAgIHRoaXMuX2xpbmVzLnBvcCgpO1xuICAgIH1cbiAgfVxuXG4gIGluY0luZGVudCgpIHtcbiAgICB0aGlzLl9pbmRlbnQrKztcbiAgICBpZiAodGhpcy5saW5lSXNFbXB0eSgpKSB7XG4gICAgICB0aGlzLl9jdXJyZW50TGluZS5pbmRlbnQgPSB0aGlzLl9pbmRlbnQ7XG4gICAgfVxuICB9XG5cbiAgZGVjSW5kZW50KCkge1xuICAgIHRoaXMuX2luZGVudC0tO1xuICAgIGlmICh0aGlzLmxpbmVJc0VtcHR5KCkpIHtcbiAgICAgIHRoaXMuX2N1cnJlbnRMaW5lLmluZGVudCA9IHRoaXMuX2luZGVudDtcbiAgICB9XG4gIH1cblxuICBwdXNoQ2xhc3MoY2xheno6IG8uQ2xhc3NTdG10KSB7XG4gICAgdGhpcy5fY2xhc3Nlcy5wdXNoKGNsYXp6KTtcbiAgfVxuXG4gIHBvcENsYXNzKCk6IG8uQ2xhc3NTdG10IHtcbiAgICByZXR1cm4gdGhpcy5fY2xhc3Nlcy5wb3AoKSE7XG4gIH1cblxuICBnZXQgY3VycmVudENsYXNzKCk6IG8uQ2xhc3NTdG10fG51bGwge1xuICAgIHJldHVybiB0aGlzLl9jbGFzc2VzLmxlbmd0aCA+IDAgPyB0aGlzLl9jbGFzc2VzW3RoaXMuX2NsYXNzZXMubGVuZ3RoIC0gMV0gOiBudWxsO1xuICB9XG5cbiAgdG9Tb3VyY2UoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5zb3VyY2VMaW5lc1xuICAgICAgICAubWFwKGwgPT4gbC5wYXJ0cy5sZW5ndGggPiAwID8gX2NyZWF0ZUluZGVudChsLmluZGVudCkgKyBsLnBhcnRzLmpvaW4oJycpIDogJycpXG4gICAgICAgIC5qb2luKCdcXG4nKTtcbiAgfVxuXG4gIHRvU291cmNlTWFwR2VuZXJhdG9yKGdlbkZpbGVQYXRoOiBzdHJpbmcsIHN0YXJ0c0F0TGluZTogbnVtYmVyID0gMCk6IFNvdXJjZU1hcEdlbmVyYXRvciB7XG4gICAgY29uc3QgbWFwID0gbmV3IFNvdXJjZU1hcEdlbmVyYXRvcihnZW5GaWxlUGF0aCk7XG5cbiAgICBsZXQgZmlyc3RPZmZzZXRNYXBwZWQgPSBmYWxzZTtcbiAgICBjb25zdCBtYXBGaXJzdE9mZnNldElmTmVlZGVkID0gKCkgPT4ge1xuICAgICAgaWYgKCFmaXJzdE9mZnNldE1hcHBlZCkge1xuICAgICAgICAvLyBBZGQgYSBzaW5nbGUgc3BhY2Ugc28gdGhhdCB0b29scyB3b24ndCB0cnkgdG8gbG9hZCB0aGUgZmlsZSBmcm9tIGRpc2suXG4gICAgICAgIC8vIE5vdGU6IFdlIGFyZSB1c2luZyB2aXJ0dWFsIHVybHMgbGlrZSBgbmc6Ly8vYCwgc28gd2UgaGF2ZSB0b1xuICAgICAgICAvLyBwcm92aWRlIGEgY29udGVudCBoZXJlLlxuICAgICAgICBtYXAuYWRkU291cmNlKGdlbkZpbGVQYXRoLCAnICcpLmFkZE1hcHBpbmcoMCwgZ2VuRmlsZVBhdGgsIDAsIDApO1xuICAgICAgICBmaXJzdE9mZnNldE1hcHBlZCA9IHRydWU7XG4gICAgICB9XG4gICAgfTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3RhcnRzQXRMaW5lOyBpKyspIHtcbiAgICAgIG1hcC5hZGRMaW5lKCk7XG4gICAgICBtYXBGaXJzdE9mZnNldElmTmVlZGVkKCk7XG4gICAgfVxuXG4gICAgdGhpcy5zb3VyY2VMaW5lcy5mb3JFYWNoKChsaW5lLCBsaW5lSWR4KSA9PiB7XG4gICAgICBtYXAuYWRkTGluZSgpO1xuXG4gICAgICBjb25zdCBzcGFucyA9IGxpbmUuc3JjU3BhbnM7XG4gICAgICBjb25zdCBwYXJ0cyA9IGxpbmUucGFydHM7XG4gICAgICBsZXQgY29sMCA9IGxpbmUuaW5kZW50ICogX0lOREVOVF9XSVRILmxlbmd0aDtcbiAgICAgIGxldCBzcGFuSWR4ID0gMDtcbiAgICAgIC8vIHNraXAgbGVhZGluZyBwYXJ0cyB3aXRob3V0IHNvdXJjZSBzcGFuc1xuICAgICAgd2hpbGUgKHNwYW5JZHggPCBzcGFucy5sZW5ndGggJiYgIXNwYW5zW3NwYW5JZHhdKSB7XG4gICAgICAgIGNvbDAgKz0gcGFydHNbc3BhbklkeF0ubGVuZ3RoO1xuICAgICAgICBzcGFuSWR4Kys7XG4gICAgICB9XG4gICAgICBpZiAoc3BhbklkeCA8IHNwYW5zLmxlbmd0aCAmJiBsaW5lSWR4ID09PSAwICYmIGNvbDAgPT09IDApIHtcbiAgICAgICAgZmlyc3RPZmZzZXRNYXBwZWQgPSB0cnVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbWFwRmlyc3RPZmZzZXRJZk5lZWRlZCgpO1xuICAgICAgfVxuXG4gICAgICB3aGlsZSAoc3BhbklkeCA8IHNwYW5zLmxlbmd0aCkge1xuICAgICAgICBjb25zdCBzcGFuID0gc3BhbnNbc3BhbklkeF0hO1xuICAgICAgICBjb25zdCBzb3VyY2UgPSBzcGFuLnN0YXJ0LmZpbGU7XG4gICAgICAgIGNvbnN0IHNvdXJjZUxpbmUgPSBzcGFuLnN0YXJ0LmxpbmU7XG4gICAgICAgIGNvbnN0IHNvdXJjZUNvbCA9IHNwYW4uc3RhcnQuY29sO1xuICAgICAgICBtYXAuYWRkU291cmNlKHNvdXJjZS51cmwsIHNvdXJjZS5jb250ZW50KVxuICAgICAgICAgICAgLmFkZE1hcHBpbmcoY29sMCwgc291cmNlLnVybCwgc291cmNlTGluZSwgc291cmNlQ29sKTtcblxuICAgICAgICBjb2wwICs9IHBhcnRzW3NwYW5JZHhdLmxlbmd0aDtcbiAgICAgICAgc3BhbklkeCsrO1xuXG4gICAgICAgIC8vIGFzc2lnbiBwYXJ0cyB3aXRob3V0IHNwYW4gb3IgdGhlIHNhbWUgc3BhbiB0byB0aGUgcHJldmlvdXMgc2VnbWVudFxuICAgICAgICB3aGlsZSAoc3BhbklkeCA8IHNwYW5zLmxlbmd0aCAmJiAoc3BhbiA9PT0gc3BhbnNbc3BhbklkeF0gfHwgIXNwYW5zW3NwYW5JZHhdKSkge1xuICAgICAgICAgIGNvbDAgKz0gcGFydHNbc3BhbklkeF0ubGVuZ3RoO1xuICAgICAgICAgIHNwYW5JZHgrKztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIG1hcDtcbiAgfVxuXG4gIHNldFByZWFtYmxlTGluZUNvdW50KGNvdW50OiBudW1iZXIpIHtcbiAgICByZXR1cm4gdGhpcy5fcHJlYW1ibGVMaW5lQ291bnQgPSBjb3VudDtcbiAgfVxuXG4gIHNwYW5PZihsaW5lOiBudW1iZXIsIGNvbHVtbjogbnVtYmVyKTogUGFyc2VTb3VyY2VTcGFufG51bGwge1xuICAgIGNvbnN0IGVtaXR0ZWRMaW5lID0gdGhpcy5fbGluZXNbbGluZSAtIHRoaXMuX3ByZWFtYmxlTGluZUNvdW50XTtcbiAgICBpZiAoZW1pdHRlZExpbmUpIHtcbiAgICAgIGxldCBjb2x1bW5zTGVmdCA9IGNvbHVtbiAtIF9jcmVhdGVJbmRlbnQoZW1pdHRlZExpbmUuaW5kZW50KS5sZW5ndGg7XG4gICAgICBmb3IgKGxldCBwYXJ0SW5kZXggPSAwOyBwYXJ0SW5kZXggPCBlbWl0dGVkTGluZS5wYXJ0cy5sZW5ndGg7IHBhcnRJbmRleCsrKSB7XG4gICAgICAgIGNvbnN0IHBhcnQgPSBlbWl0dGVkTGluZS5wYXJ0c1twYXJ0SW5kZXhdO1xuICAgICAgICBpZiAocGFydC5sZW5ndGggPiBjb2x1bW5zTGVmdCkge1xuICAgICAgICAgIHJldHVybiBlbWl0dGVkTGluZS5zcmNTcGFuc1twYXJ0SW5kZXhdO1xuICAgICAgICB9XG4gICAgICAgIGNvbHVtbnNMZWZ0IC09IHBhcnQubGVuZ3RoO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBAaW50ZXJuYWwgc3RyaXAgdGhpcyBmcm9tIHB1Ymxpc2hlZCBkLnRzIGZpbGVzIGR1ZSB0b1xuICAgKiBodHRwczovL2dpdGh1Yi5jb20vbWljcm9zb2Z0L1R5cGVTY3JpcHQvaXNzdWVzLzM2MjE2XG4gICAqL1xuICBwcml2YXRlIGdldCBzb3VyY2VMaW5lcygpOiBfRW1pdHRlZExpbmVbXSB7XG4gICAgaWYgKHRoaXMuX2xpbmVzLmxlbmd0aCAmJiB0aGlzLl9saW5lc1t0aGlzLl9saW5lcy5sZW5ndGggLSAxXS5wYXJ0cy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiB0aGlzLl9saW5lcy5zbGljZSgwLCAtMSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9saW5lcztcbiAgfVxufVxuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQWJzdHJhY3RFbWl0dGVyVmlzaXRvciBpbXBsZW1lbnRzIG8uU3RhdGVtZW50VmlzaXRvciwgby5FeHByZXNzaW9uVmlzaXRvciB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX2VzY2FwZURvbGxhckluU3RyaW5nczogYm9vbGVhbikge31cblxuICBwcm90ZWN0ZWQgcHJpbnRMZWFkaW5nQ29tbWVudHMoc3RtdDogby5TdGF0ZW1lbnQsIGN0eDogRW1pdHRlclZpc2l0b3JDb250ZXh0KTogdm9pZCB7XG4gICAgaWYgKHN0bXQubGVhZGluZ0NvbW1lbnRzID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZm9yIChjb25zdCBjb21tZW50IG9mIHN0bXQubGVhZGluZ0NvbW1lbnRzKSB7XG4gICAgICBpZiAoY29tbWVudCBpbnN0YW5jZW9mIG8uSlNEb2NDb21tZW50KSB7XG4gICAgICAgIGN0eC5wcmludChzdG10LCBgLyoke2NvbW1lbnQudG9TdHJpbmcoKX0qL2AsIGNvbW1lbnQudHJhaWxpbmdOZXdsaW5lKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChjb21tZW50Lm11bHRpbGluZSkge1xuICAgICAgICAgIGN0eC5wcmludChzdG10LCBgLyogJHtjb21tZW50LnRleHR9ICovYCwgY29tbWVudC50cmFpbGluZ05ld2xpbmUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbW1lbnQudGV4dC5zcGxpdCgnXFxuJykuZm9yRWFjaCgobGluZSkgPT4ge1xuICAgICAgICAgICAgY3R4LnByaW50bG4oc3RtdCwgYC8vICR7bGluZX1gKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHZpc2l0RXhwcmVzc2lvblN0bXQoc3RtdDogby5FeHByZXNzaW9uU3RhdGVtZW50LCBjdHg6IEVtaXR0ZXJWaXNpdG9yQ29udGV4dCk6IGFueSB7XG4gICAgdGhpcy5wcmludExlYWRpbmdDb21tZW50cyhzdG10LCBjdHgpO1xuICAgIHN0bXQuZXhwci52aXNpdEV4cHJlc3Npb24odGhpcywgY3R4KTtcbiAgICBjdHgucHJpbnRsbihzdG10LCAnOycpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgdmlzaXRSZXR1cm5TdG10KHN0bXQ6IG8uUmV0dXJuU3RhdGVtZW50LCBjdHg6IEVtaXR0ZXJWaXNpdG9yQ29udGV4dCk6IGFueSB7XG4gICAgdGhpcy5wcmludExlYWRpbmdDb21tZW50cyhzdG10LCBjdHgpO1xuICAgIGN0eC5wcmludChzdG10LCBgcmV0dXJuIGApO1xuICAgIHN0bXQudmFsdWUudmlzaXRFeHByZXNzaW9uKHRoaXMsIGN0eCk7XG4gICAgY3R4LnByaW50bG4oc3RtdCwgJzsnKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGFic3RyYWN0IHZpc2l0Q2FzdEV4cHIoYXN0OiBvLkNhc3RFeHByLCBjb250ZXh0OiBhbnkpOiBhbnk7XG5cbiAgYWJzdHJhY3QgdmlzaXREZWNsYXJlQ2xhc3NTdG10KHN0bXQ6IG8uQ2xhc3NTdG10LCBjdHg6IEVtaXR0ZXJWaXNpdG9yQ29udGV4dCk6IGFueTtcblxuICB2aXNpdElmU3RtdChzdG10OiBvLklmU3RtdCwgY3R4OiBFbWl0dGVyVmlzaXRvckNvbnRleHQpOiBhbnkge1xuICAgIHRoaXMucHJpbnRMZWFkaW5nQ29tbWVudHMoc3RtdCwgY3R4KTtcbiAgICBjdHgucHJpbnQoc3RtdCwgYGlmIChgKTtcbiAgICBzdG10LmNvbmRpdGlvbi52aXNpdEV4cHJlc3Npb24odGhpcywgY3R4KTtcbiAgICBjdHgucHJpbnQoc3RtdCwgYCkge2ApO1xuICAgIGNvbnN0IGhhc0Vsc2VDYXNlID0gc3RtdC5mYWxzZUNhc2UgIT0gbnVsbCAmJiBzdG10LmZhbHNlQ2FzZS5sZW5ndGggPiAwO1xuICAgIGlmIChzdG10LnRydWVDYXNlLmxlbmd0aCA8PSAxICYmICFoYXNFbHNlQ2FzZSkge1xuICAgICAgY3R4LnByaW50KHN0bXQsIGAgYCk7XG4gICAgICB0aGlzLnZpc2l0QWxsU3RhdGVtZW50cyhzdG10LnRydWVDYXNlLCBjdHgpO1xuICAgICAgY3R4LnJlbW92ZUVtcHR5TGFzdExpbmUoKTtcbiAgICAgIGN0eC5wcmludChzdG10LCBgIGApO1xuICAgIH0gZWxzZSB7XG4gICAgICBjdHgucHJpbnRsbigpO1xuICAgICAgY3R4LmluY0luZGVudCgpO1xuICAgICAgdGhpcy52aXNpdEFsbFN0YXRlbWVudHMoc3RtdC50cnVlQ2FzZSwgY3R4KTtcbiAgICAgIGN0eC5kZWNJbmRlbnQoKTtcbiAgICAgIGlmIChoYXNFbHNlQ2FzZSkge1xuICAgICAgICBjdHgucHJpbnRsbihzdG10LCBgfSBlbHNlIHtgKTtcbiAgICAgICAgY3R4LmluY0luZGVudCgpO1xuICAgICAgICB0aGlzLnZpc2l0QWxsU3RhdGVtZW50cyhzdG10LmZhbHNlQ2FzZSwgY3R4KTtcbiAgICAgICAgY3R4LmRlY0luZGVudCgpO1xuICAgICAgfVxuICAgIH1cbiAgICBjdHgucHJpbnRsbihzdG10LCBgfWApO1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgYWJzdHJhY3QgdmlzaXRUcnlDYXRjaFN0bXQoc3RtdDogby5UcnlDYXRjaFN0bXQsIGN0eDogRW1pdHRlclZpc2l0b3JDb250ZXh0KTogYW55O1xuXG4gIHZpc2l0VGhyb3dTdG10KHN0bXQ6IG8uVGhyb3dTdG10LCBjdHg6IEVtaXR0ZXJWaXNpdG9yQ29udGV4dCk6IGFueSB7XG4gICAgdGhpcy5wcmludExlYWRpbmdDb21tZW50cyhzdG10LCBjdHgpO1xuICAgIGN0eC5wcmludChzdG10LCBgdGhyb3cgYCk7XG4gICAgc3RtdC5lcnJvci52aXNpdEV4cHJlc3Npb24odGhpcywgY3R4KTtcbiAgICBjdHgucHJpbnRsbihzdG10LCBgO2ApO1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgYWJzdHJhY3QgdmlzaXREZWNsYXJlVmFyU3RtdChzdG10OiBvLkRlY2xhcmVWYXJTdG10LCBjdHg6IEVtaXR0ZXJWaXNpdG9yQ29udGV4dCk6IGFueTtcblxuICB2aXNpdFdyaXRlVmFyRXhwcihleHByOiBvLldyaXRlVmFyRXhwciwgY3R4OiBFbWl0dGVyVmlzaXRvckNvbnRleHQpOiBhbnkge1xuICAgIGNvbnN0IGxpbmVXYXNFbXB0eSA9IGN0eC5saW5lSXNFbXB0eSgpO1xuICAgIGlmICghbGluZVdhc0VtcHR5KSB7XG4gICAgICBjdHgucHJpbnQoZXhwciwgJygnKTtcbiAgICB9XG4gICAgY3R4LnByaW50KGV4cHIsIGAke2V4cHIubmFtZX0gPSBgKTtcbiAgICBleHByLnZhbHVlLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjdHgpO1xuICAgIGlmICghbGluZVdhc0VtcHR5KSB7XG4gICAgICBjdHgucHJpbnQoZXhwciwgJyknKTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgdmlzaXRXcml0ZUtleUV4cHIoZXhwcjogby5Xcml0ZUtleUV4cHIsIGN0eDogRW1pdHRlclZpc2l0b3JDb250ZXh0KTogYW55IHtcbiAgICBjb25zdCBsaW5lV2FzRW1wdHkgPSBjdHgubGluZUlzRW1wdHkoKTtcbiAgICBpZiAoIWxpbmVXYXNFbXB0eSkge1xuICAgICAgY3R4LnByaW50KGV4cHIsICcoJyk7XG4gICAgfVxuICAgIGV4cHIucmVjZWl2ZXIudmlzaXRFeHByZXNzaW9uKHRoaXMsIGN0eCk7XG4gICAgY3R4LnByaW50KGV4cHIsIGBbYCk7XG4gICAgZXhwci5pbmRleC52aXNpdEV4cHJlc3Npb24odGhpcywgY3R4KTtcbiAgICBjdHgucHJpbnQoZXhwciwgYF0gPSBgKTtcbiAgICBleHByLnZhbHVlLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjdHgpO1xuICAgIGlmICghbGluZVdhc0VtcHR5KSB7XG4gICAgICBjdHgucHJpbnQoZXhwciwgJyknKTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgdmlzaXRXcml0ZVByb3BFeHByKGV4cHI6IG8uV3JpdGVQcm9wRXhwciwgY3R4OiBFbWl0dGVyVmlzaXRvckNvbnRleHQpOiBhbnkge1xuICAgIGNvbnN0IGxpbmVXYXNFbXB0eSA9IGN0eC5saW5lSXNFbXB0eSgpO1xuICAgIGlmICghbGluZVdhc0VtcHR5KSB7XG4gICAgICBjdHgucHJpbnQoZXhwciwgJygnKTtcbiAgICB9XG4gICAgZXhwci5yZWNlaXZlci52aXNpdEV4cHJlc3Npb24odGhpcywgY3R4KTtcbiAgICBjdHgucHJpbnQoZXhwciwgYC4ke2V4cHIubmFtZX0gPSBgKTtcbiAgICBleHByLnZhbHVlLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjdHgpO1xuICAgIGlmICghbGluZVdhc0VtcHR5KSB7XG4gICAgICBjdHgucHJpbnQoZXhwciwgJyknKTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgdmlzaXRJbnZva2VNZXRob2RFeHByKGV4cHI6IG8uSW52b2tlTWV0aG9kRXhwciwgY3R4OiBFbWl0dGVyVmlzaXRvckNvbnRleHQpOiBhbnkge1xuICAgIGV4cHIucmVjZWl2ZXIudmlzaXRFeHByZXNzaW9uKHRoaXMsIGN0eCk7XG4gICAgbGV0IG5hbWUgPSBleHByLm5hbWU7XG4gICAgaWYgKGV4cHIuYnVpbHRpbiAhPSBudWxsKSB7XG4gICAgICBuYW1lID0gdGhpcy5nZXRCdWlsdGluTWV0aG9kTmFtZShleHByLmJ1aWx0aW4pO1xuICAgICAgaWYgKG5hbWUgPT0gbnVsbCkge1xuICAgICAgICAvLyBzb21lIGJ1aWx0aW5zIGp1c3QgbWVhbiB0byBza2lwIHRoZSBjYWxsLlxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICB9XG4gICAgY3R4LnByaW50KGV4cHIsIGAuJHtuYW1lfShgKTtcbiAgICB0aGlzLnZpc2l0QWxsRXhwcmVzc2lvbnMoZXhwci5hcmdzLCBjdHgsIGAsYCk7XG4gICAgY3R4LnByaW50KGV4cHIsIGApYCk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBhYnN0cmFjdCBnZXRCdWlsdGluTWV0aG9kTmFtZShtZXRob2Q6IG8uQnVpbHRpbk1ldGhvZCk6IHN0cmluZztcblxuICB2aXNpdEludm9rZUZ1bmN0aW9uRXhwcihleHByOiBvLkludm9rZUZ1bmN0aW9uRXhwciwgY3R4OiBFbWl0dGVyVmlzaXRvckNvbnRleHQpOiBhbnkge1xuICAgIGV4cHIuZm4udmlzaXRFeHByZXNzaW9uKHRoaXMsIGN0eCk7XG4gICAgY3R4LnByaW50KGV4cHIsIGAoYCk7XG4gICAgdGhpcy52aXNpdEFsbEV4cHJlc3Npb25zKGV4cHIuYXJncywgY3R4LCAnLCcpO1xuICAgIGN0eC5wcmludChleHByLCBgKWApO1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHZpc2l0VGFnZ2VkVGVtcGxhdGVFeHByKGV4cHI6IG8uVGFnZ2VkVGVtcGxhdGVFeHByLCBjdHg6IEVtaXR0ZXJWaXNpdG9yQ29udGV4dCk6IGFueSB7XG4gICAgZXhwci50YWcudmlzaXRFeHByZXNzaW9uKHRoaXMsIGN0eCk7XG4gICAgY3R4LnByaW50KGV4cHIsICdgJyArIGV4cHIudGVtcGxhdGUuZWxlbWVudHNbMF0ucmF3VGV4dCk7XG4gICAgZm9yIChsZXQgaSA9IDE7IGkgPCBleHByLnRlbXBsYXRlLmVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjdHgucHJpbnQoZXhwciwgJyR7Jyk7XG4gICAgICBleHByLnRlbXBsYXRlLmV4cHJlc3Npb25zW2kgLSAxXS52aXNpdEV4cHJlc3Npb24odGhpcywgY3R4KTtcbiAgICAgIGN0eC5wcmludChleHByLCBgfSR7ZXhwci50ZW1wbGF0ZS5lbGVtZW50c1tpXS5yYXdUZXh0fWApO1xuICAgIH1cbiAgICBjdHgucHJpbnQoZXhwciwgJ2AnKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICB2aXNpdFdyYXBwZWROb2RlRXhwcihhc3Q6IG8uV3JhcHBlZE5vZGVFeHByPGFueT4sIGN0eDogRW1pdHRlclZpc2l0b3JDb250ZXh0KTogYW55IHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0Fic3RyYWN0IGVtaXR0ZXIgY2Fubm90IHZpc2l0IFdyYXBwZWROb2RlRXhwci4nKTtcbiAgfVxuICB2aXNpdFR5cGVvZkV4cHIoZXhwcjogby5UeXBlb2ZFeHByLCBjdHg6IEVtaXR0ZXJWaXNpdG9yQ29udGV4dCk6IGFueSB7XG4gICAgY3R4LnByaW50KGV4cHIsICd0eXBlb2YgJyk7XG4gICAgZXhwci5leHByLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjdHgpO1xuICB9XG4gIHZpc2l0UmVhZFZhckV4cHIoYXN0OiBvLlJlYWRWYXJFeHByLCBjdHg6IEVtaXR0ZXJWaXNpdG9yQ29udGV4dCk6IGFueSB7XG4gICAgbGV0IHZhck5hbWUgPSBhc3QubmFtZSE7XG4gICAgaWYgKGFzdC5idWlsdGluICE9IG51bGwpIHtcbiAgICAgIHN3aXRjaCAoYXN0LmJ1aWx0aW4pIHtcbiAgICAgICAgY2FzZSBvLkJ1aWx0aW5WYXIuU3VwZXI6XG4gICAgICAgICAgdmFyTmFtZSA9ICdzdXBlcic7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2Ugby5CdWlsdGluVmFyLlRoaXM6XG4gICAgICAgICAgdmFyTmFtZSA9ICd0aGlzJztcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBvLkJ1aWx0aW5WYXIuQ2F0Y2hFcnJvcjpcbiAgICAgICAgICB2YXJOYW1lID0gQ0FUQ0hfRVJST1JfVkFSLm5hbWUhO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIG8uQnVpbHRpblZhci5DYXRjaFN0YWNrOlxuICAgICAgICAgIHZhck5hbWUgPSBDQVRDSF9TVEFDS19WQVIubmFtZSE7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIGJ1aWx0aW4gdmFyaWFibGUgJHthc3QuYnVpbHRpbn1gKTtcbiAgICAgIH1cbiAgICB9XG4gICAgY3R4LnByaW50KGFzdCwgdmFyTmFtZSk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgdmlzaXRJbnN0YW50aWF0ZUV4cHIoYXN0OiBvLkluc3RhbnRpYXRlRXhwciwgY3R4OiBFbWl0dGVyVmlzaXRvckNvbnRleHQpOiBhbnkge1xuICAgIGN0eC5wcmludChhc3QsIGBuZXcgYCk7XG4gICAgYXN0LmNsYXNzRXhwci52aXNpdEV4cHJlc3Npb24odGhpcywgY3R4KTtcbiAgICBjdHgucHJpbnQoYXN0LCBgKGApO1xuICAgIHRoaXMudmlzaXRBbGxFeHByZXNzaW9ucyhhc3QuYXJncywgY3R4LCAnLCcpO1xuICAgIGN0eC5wcmludChhc3QsIGApYCk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICB2aXNpdExpdGVyYWxFeHByKGFzdDogby5MaXRlcmFsRXhwciwgY3R4OiBFbWl0dGVyVmlzaXRvckNvbnRleHQpOiBhbnkge1xuICAgIGNvbnN0IHZhbHVlID0gYXN0LnZhbHVlO1xuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgICBjdHgucHJpbnQoYXN0LCBlc2NhcGVJZGVudGlmaWVyKHZhbHVlLCB0aGlzLl9lc2NhcGVEb2xsYXJJblN0cmluZ3MpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY3R4LnByaW50KGFzdCwgYCR7dmFsdWV9YCk7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgdmlzaXRMb2NhbGl6ZWRTdHJpbmcoYXN0OiBvLkxvY2FsaXplZFN0cmluZywgY3R4OiBFbWl0dGVyVmlzaXRvckNvbnRleHQpOiBhbnkge1xuICAgIGNvbnN0IGhlYWQgPSBhc3Quc2VyaWFsaXplSTE4bkhlYWQoKTtcbiAgICBjdHgucHJpbnQoYXN0LCAnJGxvY2FsaXplIGAnICsgaGVhZC5yYXcpO1xuICAgIGZvciAobGV0IGkgPSAxOyBpIDwgYXN0Lm1lc3NhZ2VQYXJ0cy5sZW5ndGg7IGkrKykge1xuICAgICAgY3R4LnByaW50KGFzdCwgJyR7Jyk7XG4gICAgICBhc3QuZXhwcmVzc2lvbnNbaSAtIDFdLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjdHgpO1xuICAgICAgY3R4LnByaW50KGFzdCwgYH0ke2FzdC5zZXJpYWxpemVJMThuVGVtcGxhdGVQYXJ0KGkpLnJhd31gKTtcbiAgICB9XG4gICAgY3R4LnByaW50KGFzdCwgJ2AnKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGFic3RyYWN0IHZpc2l0RXh0ZXJuYWxFeHByKGFzdDogby5FeHRlcm5hbEV4cHIsIGN0eDogRW1pdHRlclZpc2l0b3JDb250ZXh0KTogYW55O1xuXG4gIHZpc2l0Q29uZGl0aW9uYWxFeHByKGFzdDogby5Db25kaXRpb25hbEV4cHIsIGN0eDogRW1pdHRlclZpc2l0b3JDb250ZXh0KTogYW55IHtcbiAgICBjdHgucHJpbnQoYXN0LCBgKGApO1xuICAgIGFzdC5jb25kaXRpb24udmlzaXRFeHByZXNzaW9uKHRoaXMsIGN0eCk7XG4gICAgY3R4LnByaW50KGFzdCwgJz8gJyk7XG4gICAgYXN0LnRydWVDYXNlLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjdHgpO1xuICAgIGN0eC5wcmludChhc3QsICc6ICcpO1xuICAgIGFzdC5mYWxzZUNhc2UhLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjdHgpO1xuICAgIGN0eC5wcmludChhc3QsIGApYCk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgdmlzaXROb3RFeHByKGFzdDogby5Ob3RFeHByLCBjdHg6IEVtaXR0ZXJWaXNpdG9yQ29udGV4dCk6IGFueSB7XG4gICAgY3R4LnByaW50KGFzdCwgJyEnKTtcbiAgICBhc3QuY29uZGl0aW9uLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjdHgpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHZpc2l0QXNzZXJ0Tm90TnVsbEV4cHIoYXN0OiBvLkFzc2VydE5vdE51bGwsIGN0eDogRW1pdHRlclZpc2l0b3JDb250ZXh0KTogYW55IHtcbiAgICBhc3QuY29uZGl0aW9uLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjdHgpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGFic3RyYWN0IHZpc2l0RnVuY3Rpb25FeHByKGFzdDogby5GdW5jdGlvbkV4cHIsIGN0eDogRW1pdHRlclZpc2l0b3JDb250ZXh0KTogYW55O1xuICBhYnN0cmFjdCB2aXNpdERlY2xhcmVGdW5jdGlvblN0bXQoc3RtdDogby5EZWNsYXJlRnVuY3Rpb25TdG10LCBjb250ZXh0OiBhbnkpOiBhbnk7XG5cbiAgdmlzaXRVbmFyeU9wZXJhdG9yRXhwcihhc3Q6IG8uVW5hcnlPcGVyYXRvckV4cHIsIGN0eDogRW1pdHRlclZpc2l0b3JDb250ZXh0KTogYW55IHtcbiAgICBsZXQgb3BTdHI6IHN0cmluZztcbiAgICBzd2l0Y2ggKGFzdC5vcGVyYXRvcikge1xuICAgICAgY2FzZSBvLlVuYXJ5T3BlcmF0b3IuUGx1czpcbiAgICAgICAgb3BTdHIgPSAnKyc7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBvLlVuYXJ5T3BlcmF0b3IuTWludXM6XG4gICAgICAgIG9wU3RyID0gJy0nO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5rbm93biBvcGVyYXRvciAke2FzdC5vcGVyYXRvcn1gKTtcbiAgICB9XG4gICAgaWYgKGFzdC5wYXJlbnMpIGN0eC5wcmludChhc3QsIGAoYCk7XG4gICAgY3R4LnByaW50KGFzdCwgb3BTdHIpO1xuICAgIGFzdC5leHByLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjdHgpO1xuICAgIGlmIChhc3QucGFyZW5zKSBjdHgucHJpbnQoYXN0LCBgKWApO1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgdmlzaXRCaW5hcnlPcGVyYXRvckV4cHIoYXN0OiBvLkJpbmFyeU9wZXJhdG9yRXhwciwgY3R4OiBFbWl0dGVyVmlzaXRvckNvbnRleHQpOiBhbnkge1xuICAgIGxldCBvcFN0cjogc3RyaW5nO1xuICAgIHN3aXRjaCAoYXN0Lm9wZXJhdG9yKSB7XG4gICAgICBjYXNlIG8uQmluYXJ5T3BlcmF0b3IuRXF1YWxzOlxuICAgICAgICBvcFN0ciA9ICc9PSc7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBvLkJpbmFyeU9wZXJhdG9yLklkZW50aWNhbDpcbiAgICAgICAgb3BTdHIgPSAnPT09JztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIG8uQmluYXJ5T3BlcmF0b3IuTm90RXF1YWxzOlxuICAgICAgICBvcFN0ciA9ICchPSc7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBvLkJpbmFyeU9wZXJhdG9yLk5vdElkZW50aWNhbDpcbiAgICAgICAgb3BTdHIgPSAnIT09JztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIG8uQmluYXJ5T3BlcmF0b3IuQW5kOlxuICAgICAgICBvcFN0ciA9ICcmJic7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBvLkJpbmFyeU9wZXJhdG9yLkJpdHdpc2VBbmQ6XG4gICAgICAgIG9wU3RyID0gJyYnO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2Ugby5CaW5hcnlPcGVyYXRvci5PcjpcbiAgICAgICAgb3BTdHIgPSAnfHwnO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2Ugby5CaW5hcnlPcGVyYXRvci5QbHVzOlxuICAgICAgICBvcFN0ciA9ICcrJztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIG8uQmluYXJ5T3BlcmF0b3IuTWludXM6XG4gICAgICAgIG9wU3RyID0gJy0nO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2Ugby5CaW5hcnlPcGVyYXRvci5EaXZpZGU6XG4gICAgICAgIG9wU3RyID0gJy8nO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2Ugby5CaW5hcnlPcGVyYXRvci5NdWx0aXBseTpcbiAgICAgICAgb3BTdHIgPSAnKic7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBvLkJpbmFyeU9wZXJhdG9yLk1vZHVsbzpcbiAgICAgICAgb3BTdHIgPSAnJSc7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBvLkJpbmFyeU9wZXJhdG9yLkxvd2VyOlxuICAgICAgICBvcFN0ciA9ICc8JztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIG8uQmluYXJ5T3BlcmF0b3IuTG93ZXJFcXVhbHM6XG4gICAgICAgIG9wU3RyID0gJzw9JztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIG8uQmluYXJ5T3BlcmF0b3IuQmlnZ2VyOlxuICAgICAgICBvcFN0ciA9ICc+JztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIG8uQmluYXJ5T3BlcmF0b3IuQmlnZ2VyRXF1YWxzOlxuICAgICAgICBvcFN0ciA9ICc+PSc7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBvLkJpbmFyeU9wZXJhdG9yLk51bGxpc2hDb2FsZXNjZTpcbiAgICAgICAgb3BTdHIgPSAnPz8nO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5rbm93biBvcGVyYXRvciAke2FzdC5vcGVyYXRvcn1gKTtcbiAgICB9XG4gICAgaWYgKGFzdC5wYXJlbnMpIGN0eC5wcmludChhc3QsIGAoYCk7XG4gICAgYXN0Lmxocy52aXNpdEV4cHJlc3Npb24odGhpcywgY3R4KTtcbiAgICBjdHgucHJpbnQoYXN0LCBgICR7b3BTdHJ9IGApO1xuICAgIGFzdC5yaHMudmlzaXRFeHByZXNzaW9uKHRoaXMsIGN0eCk7XG4gICAgaWYgKGFzdC5wYXJlbnMpIGN0eC5wcmludChhc3QsIGApYCk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICB2aXNpdFJlYWRQcm9wRXhwcihhc3Q6IG8uUmVhZFByb3BFeHByLCBjdHg6IEVtaXR0ZXJWaXNpdG9yQ29udGV4dCk6IGFueSB7XG4gICAgYXN0LnJlY2VpdmVyLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjdHgpO1xuICAgIGN0eC5wcmludChhc3QsIGAuYCk7XG4gICAgY3R4LnByaW50KGFzdCwgYXN0Lm5hbWUpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHZpc2l0UmVhZEtleUV4cHIoYXN0OiBvLlJlYWRLZXlFeHByLCBjdHg6IEVtaXR0ZXJWaXNpdG9yQ29udGV4dCk6IGFueSB7XG4gICAgYXN0LnJlY2VpdmVyLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjdHgpO1xuICAgIGN0eC5wcmludChhc3QsIGBbYCk7XG4gICAgYXN0LmluZGV4LnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjdHgpO1xuICAgIGN0eC5wcmludChhc3QsIGBdYCk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgdmlzaXRMaXRlcmFsQXJyYXlFeHByKGFzdDogby5MaXRlcmFsQXJyYXlFeHByLCBjdHg6IEVtaXR0ZXJWaXNpdG9yQ29udGV4dCk6IGFueSB7XG4gICAgY3R4LnByaW50KGFzdCwgYFtgKTtcbiAgICB0aGlzLnZpc2l0QWxsRXhwcmVzc2lvbnMoYXN0LmVudHJpZXMsIGN0eCwgJywnKTtcbiAgICBjdHgucHJpbnQoYXN0LCBgXWApO1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHZpc2l0TGl0ZXJhbE1hcEV4cHIoYXN0OiBvLkxpdGVyYWxNYXBFeHByLCBjdHg6IEVtaXR0ZXJWaXNpdG9yQ29udGV4dCk6IGFueSB7XG4gICAgY3R4LnByaW50KGFzdCwgYHtgKTtcbiAgICB0aGlzLnZpc2l0QWxsT2JqZWN0cyhlbnRyeSA9PiB7XG4gICAgICBjdHgucHJpbnQoYXN0LCBgJHtlc2NhcGVJZGVudGlmaWVyKGVudHJ5LmtleSwgdGhpcy5fZXNjYXBlRG9sbGFySW5TdHJpbmdzLCBlbnRyeS5xdW90ZWQpfTpgKTtcbiAgICAgIGVudHJ5LnZhbHVlLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjdHgpO1xuICAgIH0sIGFzdC5lbnRyaWVzLCBjdHgsICcsJyk7XG4gICAgY3R4LnByaW50KGFzdCwgYH1gKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICB2aXNpdENvbW1hRXhwcihhc3Q6IG8uQ29tbWFFeHByLCBjdHg6IEVtaXR0ZXJWaXNpdG9yQ29udGV4dCk6IGFueSB7XG4gICAgY3R4LnByaW50KGFzdCwgJygnKTtcbiAgICB0aGlzLnZpc2l0QWxsRXhwcmVzc2lvbnMoYXN0LnBhcnRzLCBjdHgsICcsJyk7XG4gICAgY3R4LnByaW50KGFzdCwgJyknKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICB2aXNpdEFsbEV4cHJlc3Npb25zKGV4cHJlc3Npb25zOiBvLkV4cHJlc3Npb25bXSwgY3R4OiBFbWl0dGVyVmlzaXRvckNvbnRleHQsIHNlcGFyYXRvcjogc3RyaW5nKTpcbiAgICAgIHZvaWQge1xuICAgIHRoaXMudmlzaXRBbGxPYmplY3RzKGV4cHIgPT4gZXhwci52aXNpdEV4cHJlc3Npb24odGhpcywgY3R4KSwgZXhwcmVzc2lvbnMsIGN0eCwgc2VwYXJhdG9yKTtcbiAgfVxuXG4gIHZpc2l0QWxsT2JqZWN0czxUPihcbiAgICAgIGhhbmRsZXI6ICh0OiBUKSA9PiB2b2lkLCBleHByZXNzaW9uczogVFtdLCBjdHg6IEVtaXR0ZXJWaXNpdG9yQ29udGV4dCxcbiAgICAgIHNlcGFyYXRvcjogc3RyaW5nKTogdm9pZCB7XG4gICAgbGV0IGluY3JlbWVudGVkSW5kZW50ID0gZmFsc2U7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBleHByZXNzaW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKGkgPiAwKSB7XG4gICAgICAgIGlmIChjdHgubGluZUxlbmd0aCgpID4gODApIHtcbiAgICAgICAgICBjdHgucHJpbnQobnVsbCwgc2VwYXJhdG9yLCB0cnVlKTtcbiAgICAgICAgICBpZiAoIWluY3JlbWVudGVkSW5kZW50KSB7XG4gICAgICAgICAgICAvLyBjb250aW51YXRpb24gYXJlIG1hcmtlZCB3aXRoIGRvdWJsZSBpbmRlbnQuXG4gICAgICAgICAgICBjdHguaW5jSW5kZW50KCk7XG4gICAgICAgICAgICBjdHguaW5jSW5kZW50KCk7XG4gICAgICAgICAgICBpbmNyZW1lbnRlZEluZGVudCA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGN0eC5wcmludChudWxsLCBzZXBhcmF0b3IsIGZhbHNlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaGFuZGxlcihleHByZXNzaW9uc1tpXSk7XG4gICAgfVxuICAgIGlmIChpbmNyZW1lbnRlZEluZGVudCkge1xuICAgICAgLy8gY29udGludWF0aW9uIGFyZSBtYXJrZWQgd2l0aCBkb3VibGUgaW5kZW50LlxuICAgICAgY3R4LmRlY0luZGVudCgpO1xuICAgICAgY3R4LmRlY0luZGVudCgpO1xuICAgIH1cbiAgfVxuXG4gIHZpc2l0QWxsU3RhdGVtZW50cyhzdGF0ZW1lbnRzOiBvLlN0YXRlbWVudFtdLCBjdHg6IEVtaXR0ZXJWaXNpdG9yQ29udGV4dCk6IHZvaWQge1xuICAgIHN0YXRlbWVudHMuZm9yRWFjaCgoc3RtdCkgPT4gc3RtdC52aXNpdFN0YXRlbWVudCh0aGlzLCBjdHgpKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZXNjYXBlSWRlbnRpZmllcihcbiAgICBpbnB1dDogc3RyaW5nLCBlc2NhcGVEb2xsYXI6IGJvb2xlYW4sIGFsd2F5c1F1b3RlOiBib29sZWFuID0gdHJ1ZSk6IGFueSB7XG4gIGlmIChpbnB1dCA9PSBudWxsKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgY29uc3QgYm9keSA9IGlucHV0LnJlcGxhY2UoX1NJTkdMRV9RVU9URV9FU0NBUEVfU1RSSU5HX1JFLCAoLi4ubWF0Y2g6IHN0cmluZ1tdKSA9PiB7XG4gICAgaWYgKG1hdGNoWzBdID09ICckJykge1xuICAgICAgcmV0dXJuIGVzY2FwZURvbGxhciA/ICdcXFxcJCcgOiAnJCc7XG4gICAgfSBlbHNlIGlmIChtYXRjaFswXSA9PSAnXFxuJykge1xuICAgICAgcmV0dXJuICdcXFxcbic7XG4gICAgfSBlbHNlIGlmIChtYXRjaFswXSA9PSAnXFxyJykge1xuICAgICAgcmV0dXJuICdcXFxccic7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBgXFxcXCR7bWF0Y2hbMF19YDtcbiAgICB9XG4gIH0pO1xuICBjb25zdCByZXF1aXJlc1F1b3RlcyA9IGFsd2F5c1F1b3RlIHx8ICFfTEVHQUxfSURFTlRJRklFUl9SRS50ZXN0KGJvZHkpO1xuICByZXR1cm4gcmVxdWlyZXNRdW90ZXMgPyBgJyR7Ym9keX0nYCA6IGJvZHk7XG59XG5cbmZ1bmN0aW9uIF9jcmVhdGVJbmRlbnQoY291bnQ6IG51bWJlcik6IHN0cmluZyB7XG4gIGxldCByZXMgPSAnJztcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb3VudDsgaSsrKSB7XG4gICAgcmVzICs9IF9JTkRFTlRfV0lUSDtcbiAgfVxuICByZXR1cm4gcmVzO1xufVxuIl19