(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/src/ngtsc/translator/src/translator", ["require", "exports", "tslib", "@angular/compiler"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExpressionTranslatorVisitor = void 0;
    var tslib_1 = require("tslib");
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var o = require("@angular/compiler");
    var UNARY_OPERATORS = new Map([
        [o.UnaryOperator.Minus, '-'],
        [o.UnaryOperator.Plus, '+'],
    ]);
    var BINARY_OPERATORS = new Map([
        [o.BinaryOperator.And, '&&'],
        [o.BinaryOperator.Bigger, '>'],
        [o.BinaryOperator.BiggerEquals, '>='],
        [o.BinaryOperator.BitwiseAnd, '&'],
        [o.BinaryOperator.Divide, '/'],
        [o.BinaryOperator.Equals, '=='],
        [o.BinaryOperator.Identical, '==='],
        [o.BinaryOperator.Lower, '<'],
        [o.BinaryOperator.LowerEquals, '<='],
        [o.BinaryOperator.Minus, '-'],
        [o.BinaryOperator.Modulo, '%'],
        [o.BinaryOperator.Multiply, '*'],
        [o.BinaryOperator.NotEquals, '!='],
        [o.BinaryOperator.NotIdentical, '!=='],
        [o.BinaryOperator.Or, '||'],
        [o.BinaryOperator.Plus, '+'],
        [o.BinaryOperator.NullishCoalesce, '??'],
    ]);
    var ExpressionTranslatorVisitor = /** @class */ (function () {
        function ExpressionTranslatorVisitor(factory, imports, options) {
            this.factory = factory;
            this.imports = imports;
            this.downlevelTaggedTemplates = options.downlevelTaggedTemplates === true;
            this.downlevelVariableDeclarations = options.downlevelVariableDeclarations === true;
            this.recordWrappedNode = options.recordWrappedNode || (function () { });
        }
        ExpressionTranslatorVisitor.prototype.visitDeclareVarStmt = function (stmt, context) {
            var _a;
            var varType = this.downlevelVariableDeclarations ?
                'var' :
                stmt.hasModifier(o.StmtModifier.Final) ? 'const' : 'let';
            return this.attachComments(this.factory.createVariableDeclaration(stmt.name, (_a = stmt.value) === null || _a === void 0 ? void 0 : _a.visitExpression(this, context.withExpressionMode), varType), stmt.leadingComments);
        };
        ExpressionTranslatorVisitor.prototype.visitDeclareFunctionStmt = function (stmt, context) {
            return this.attachComments(this.factory.createFunctionDeclaration(stmt.name, stmt.params.map(function (param) { return param.name; }), this.factory.createBlock(this.visitStatements(stmt.statements, context.withStatementMode))), stmt.leadingComments);
        };
        ExpressionTranslatorVisitor.prototype.visitExpressionStmt = function (stmt, context) {
            return this.attachComments(this.factory.createExpressionStatement(stmt.expr.visitExpression(this, context.withStatementMode)), stmt.leadingComments);
        };
        ExpressionTranslatorVisitor.prototype.visitReturnStmt = function (stmt, context) {
            return this.attachComments(this.factory.createReturnStatement(stmt.value.visitExpression(this, context.withExpressionMode)), stmt.leadingComments);
        };
        ExpressionTranslatorVisitor.prototype.visitDeclareClassStmt = function (_stmt, _context) {
            throw new Error('Method not implemented.');
        };
        ExpressionTranslatorVisitor.prototype.visitIfStmt = function (stmt, context) {
            return this.attachComments(this.factory.createIfStatement(stmt.condition.visitExpression(this, context), this.factory.createBlock(this.visitStatements(stmt.trueCase, context.withStatementMode)), stmt.falseCase.length > 0 ? this.factory.createBlock(this.visitStatements(stmt.falseCase, context.withStatementMode)) :
                null), stmt.leadingComments);
        };
        ExpressionTranslatorVisitor.prototype.visitTryCatchStmt = function (_stmt, _context) {
            throw new Error('Method not implemented.');
        };
        ExpressionTranslatorVisitor.prototype.visitThrowStmt = function (stmt, context) {
            return this.attachComments(this.factory.createThrowStatement(stmt.error.visitExpression(this, context.withExpressionMode)), stmt.leadingComments);
        };
        ExpressionTranslatorVisitor.prototype.visitReadVarExpr = function (ast, _context) {
            var identifier = this.factory.createIdentifier(ast.name);
            this.setSourceMapRange(identifier, ast.sourceSpan);
            return identifier;
        };
        ExpressionTranslatorVisitor.prototype.visitWriteVarExpr = function (expr, context) {
            var assignment = this.factory.createAssignment(this.setSourceMapRange(this.factory.createIdentifier(expr.name), expr.sourceSpan), expr.value.visitExpression(this, context));
            return context.isStatement ? assignment :
                this.factory.createParenthesizedExpression(assignment);
        };
        ExpressionTranslatorVisitor.prototype.visitWriteKeyExpr = function (expr, context) {
            var exprContext = context.withExpressionMode;
            var target = this.factory.createElementAccess(expr.receiver.visitExpression(this, exprContext), expr.index.visitExpression(this, exprContext));
            var assignment = this.factory.createAssignment(target, expr.value.visitExpression(this, exprContext));
            return context.isStatement ? assignment :
                this.factory.createParenthesizedExpression(assignment);
        };
        ExpressionTranslatorVisitor.prototype.visitWritePropExpr = function (expr, context) {
            var target = this.factory.createPropertyAccess(expr.receiver.visitExpression(this, context), expr.name);
            return this.factory.createAssignment(target, expr.value.visitExpression(this, context));
        };
        ExpressionTranslatorVisitor.prototype.visitInvokeMethodExpr = function (ast, context) {
            var _this = this;
            var target = ast.receiver.visitExpression(this, context);
            return this.setSourceMapRange(this.factory.createCallExpression(ast.name !== null ? this.factory.createPropertyAccess(target, ast.name) : target, ast.args.map(function (arg) { return arg.visitExpression(_this, context); }), 
            /* pure */ false), ast.sourceSpan);
        };
        ExpressionTranslatorVisitor.prototype.visitInvokeFunctionExpr = function (ast, context) {
            var _this = this;
            return this.setSourceMapRange(this.factory.createCallExpression(ast.fn.visitExpression(this, context), ast.args.map(function (arg) { return arg.visitExpression(_this, context); }), ast.pure), ast.sourceSpan);
        };
        ExpressionTranslatorVisitor.prototype.visitTaggedTemplateExpr = function (ast, context) {
            var _this = this;
            return this.setSourceMapRange(this.createTaggedTemplateExpression(ast.tag.visitExpression(this, context), {
                elements: ast.template.elements.map(function (e) {
                    var _a;
                    return createTemplateElement({
                        cooked: e.text,
                        raw: e.rawText,
                        range: (_a = e.sourceSpan) !== null && _a !== void 0 ? _a : ast.sourceSpan,
                    });
                }),
                expressions: ast.template.expressions.map(function (e) { return e.visitExpression(_this, context); })
            }), ast.sourceSpan);
        };
        ExpressionTranslatorVisitor.prototype.visitInstantiateExpr = function (ast, context) {
            var _this = this;
            return this.factory.createNewExpression(ast.classExpr.visitExpression(this, context), ast.args.map(function (arg) { return arg.visitExpression(_this, context); }));
        };
        ExpressionTranslatorVisitor.prototype.visitLiteralExpr = function (ast, _context) {
            return this.setSourceMapRange(this.factory.createLiteral(ast.value), ast.sourceSpan);
        };
        ExpressionTranslatorVisitor.prototype.visitLocalizedString = function (ast, context) {
            // A `$localize` message consists of `messageParts` and `expressions`, which get interleaved
            // together. The interleaved pieces look like:
            // `[messagePart0, expression0, messagePart1, expression1, messagePart2]`
            //
            // Note that there is always a message part at the start and end, and so therefore
            // `messageParts.length === expressions.length + 1`.
            //
            // Each message part may be prefixed with "metadata", which is wrapped in colons (:) delimiters.
            // The metadata is attached to the first and subsequent message parts by calls to
            // `serializeI18nHead()` and `serializeI18nTemplatePart()` respectively.
            //
            // The first message part (i.e. `ast.messageParts[0]`) is used to initialize `messageParts`
            // array.
            var elements = [createTemplateElement(ast.serializeI18nHead())];
            var expressions = [];
            for (var i = 0; i < ast.expressions.length; i++) {
                var placeholder = this.setSourceMapRange(ast.expressions[i].visitExpression(this, context), ast.getPlaceholderSourceSpan(i));
                expressions.push(placeholder);
                elements.push(createTemplateElement(ast.serializeI18nTemplatePart(i + 1)));
            }
            var localizeTag = this.factory.createIdentifier('$localize');
            return this.setSourceMapRange(this.createTaggedTemplateExpression(localizeTag, { elements: elements, expressions: expressions }), ast.sourceSpan);
        };
        ExpressionTranslatorVisitor.prototype.createTaggedTemplateExpression = function (tag, template) {
            return this.downlevelTaggedTemplates ? this.createES5TaggedTemplateFunctionCall(tag, template) :
                this.factory.createTaggedTemplate(tag, template);
        };
        /**
         * Translate the tagged template literal into a call that is compatible with ES5, using the
         * imported `__makeTemplateObject` helper for ES5 formatted output.
         */
        ExpressionTranslatorVisitor.prototype.createES5TaggedTemplateFunctionCall = function (tagHandler, _a) {
            var e_1, _b;
            var elements = _a.elements, expressions = _a.expressions;
            // Ensure that the `__makeTemplateObject()` helper has been imported.
            var _c = this.imports.generateNamedImport('tslib', '__makeTemplateObject'), moduleImport = _c.moduleImport, symbol = _c.symbol;
            var __makeTemplateObjectHelper = (moduleImport === null) ?
                this.factory.createIdentifier(symbol) :
                this.factory.createPropertyAccess(moduleImport, symbol);
            // Collect up the cooked and raw strings into two separate arrays.
            var cooked = [];
            var raw = [];
            try {
                for (var elements_1 = tslib_1.__values(elements), elements_1_1 = elements_1.next(); !elements_1_1.done; elements_1_1 = elements_1.next()) {
                    var element = elements_1_1.value;
                    cooked.push(this.factory.setSourceMapRange(this.factory.createLiteral(element.cooked), element.range));
                    raw.push(this.factory.setSourceMapRange(this.factory.createLiteral(element.raw), element.range));
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (elements_1_1 && !elements_1_1.done && (_b = elements_1.return)) _b.call(elements_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            // Generate the helper call in the form: `__makeTemplateObject([cooked], [raw]);`
            var templateHelperCall = this.factory.createCallExpression(__makeTemplateObjectHelper, [this.factory.createArrayLiteral(cooked), this.factory.createArrayLiteral(raw)], 
            /* pure */ false);
            // Finally create the tagged handler call in the form:
            // `tag(__makeTemplateObject([cooked], [raw]), ...expressions);`
            return this.factory.createCallExpression(tagHandler, tslib_1.__spreadArray([templateHelperCall], tslib_1.__read(expressions)), 
            /* pure */ false);
        };
        ExpressionTranslatorVisitor.prototype.visitExternalExpr = function (ast, _context) {
            if (ast.value.name === null) {
                if (ast.value.moduleName === null) {
                    throw new Error('Invalid import without name nor moduleName');
                }
                return this.imports.generateNamespaceImport(ast.value.moduleName);
            }
            // If a moduleName is specified, this is a normal import. If there's no module name, it's a
            // reference to a global/ambient symbol.
            if (ast.value.moduleName !== null) {
                // This is a normal import. Find the imported module.
                var _a = this.imports.generateNamedImport(ast.value.moduleName, ast.value.name), moduleImport = _a.moduleImport, symbol = _a.symbol;
                if (moduleImport === null) {
                    // The symbol was ambient after all.
                    return this.factory.createIdentifier(symbol);
                }
                else {
                    return this.factory.createPropertyAccess(moduleImport, symbol);
                }
            }
            else {
                // The symbol is ambient, so just reference it.
                return this.factory.createIdentifier(ast.value.name);
            }
        };
        ExpressionTranslatorVisitor.prototype.visitConditionalExpr = function (ast, context) {
            var cond = ast.condition.visitExpression(this, context);
            // Ordinarily the ternary operator is right-associative. The following are equivalent:
            //   `a ? b : c ? d : e` => `a ? b : (c ? d : e)`
            //
            // However, occasionally Angular needs to produce a left-associative conditional, such as in
            // the case of a null-safe navigation production: `{{a?.b ? c : d}}`. This template produces
            // a ternary of the form:
            //   `a == null ? null : rest of expression`
            // If the rest of the expression is also a ternary though, this would produce the form:
            //   `a == null ? null : a.b ? c : d`
            // which, if left as right-associative, would be incorrectly associated as:
            //   `a == null ? null : (a.b ? c : d)`
            //
            // In such cases, the left-associativity needs to be enforced with parentheses:
            //   `(a == null ? null : a.b) ? c : d`
            //
            // Such parentheses could always be included in the condition (guaranteeing correct behavior) in
            // all cases, but this has a code size cost. Instead, parentheses are added only when a
            // conditional expression is directly used as the condition of another.
            //
            // TODO(alxhub): investigate better logic for precendence of conditional operators
            if (ast.condition instanceof o.ConditionalExpr) {
                // The condition of this ternary needs to be wrapped in parentheses to maintain
                // left-associativity.
                cond = this.factory.createParenthesizedExpression(cond);
            }
            return this.factory.createConditional(cond, ast.trueCase.visitExpression(this, context), ast.falseCase.visitExpression(this, context));
        };
        ExpressionTranslatorVisitor.prototype.visitNotExpr = function (ast, context) {
            return this.factory.createUnaryExpression('!', ast.condition.visitExpression(this, context));
        };
        ExpressionTranslatorVisitor.prototype.visitAssertNotNullExpr = function (ast, context) {
            return ast.condition.visitExpression(this, context);
        };
        ExpressionTranslatorVisitor.prototype.visitCastExpr = function (ast, context) {
            return ast.value.visitExpression(this, context);
        };
        ExpressionTranslatorVisitor.prototype.visitFunctionExpr = function (ast, context) {
            var _a;
            return this.factory.createFunctionExpression((_a = ast.name) !== null && _a !== void 0 ? _a : null, ast.params.map(function (param) { return param.name; }), this.factory.createBlock(this.visitStatements(ast.statements, context)));
        };
        ExpressionTranslatorVisitor.prototype.visitBinaryOperatorExpr = function (ast, context) {
            if (!BINARY_OPERATORS.has(ast.operator)) {
                throw new Error("Unknown binary operator: " + o.BinaryOperator[ast.operator]);
            }
            return this.factory.createBinaryExpression(ast.lhs.visitExpression(this, context), BINARY_OPERATORS.get(ast.operator), ast.rhs.visitExpression(this, context));
        };
        ExpressionTranslatorVisitor.prototype.visitReadPropExpr = function (ast, context) {
            return this.factory.createPropertyAccess(ast.receiver.visitExpression(this, context), ast.name);
        };
        ExpressionTranslatorVisitor.prototype.visitReadKeyExpr = function (ast, context) {
            return this.factory.createElementAccess(ast.receiver.visitExpression(this, context), ast.index.visitExpression(this, context));
        };
        ExpressionTranslatorVisitor.prototype.visitLiteralArrayExpr = function (ast, context) {
            var _this = this;
            return this.factory.createArrayLiteral(ast.entries.map(function (expr) { return _this.setSourceMapRange(expr.visitExpression(_this, context), ast.sourceSpan); }));
        };
        ExpressionTranslatorVisitor.prototype.visitLiteralMapExpr = function (ast, context) {
            var _this = this;
            var properties = ast.entries.map(function (entry) {
                return {
                    propertyName: entry.key,
                    quoted: entry.quoted,
                    value: entry.value.visitExpression(_this, context)
                };
            });
            return this.setSourceMapRange(this.factory.createObjectLiteral(properties), ast.sourceSpan);
        };
        ExpressionTranslatorVisitor.prototype.visitCommaExpr = function (ast, context) {
            throw new Error('Method not implemented.');
        };
        ExpressionTranslatorVisitor.prototype.visitWrappedNodeExpr = function (ast, _context) {
            this.recordWrappedNode(ast);
            return ast.node;
        };
        ExpressionTranslatorVisitor.prototype.visitTypeofExpr = function (ast, context) {
            return this.factory.createTypeOfExpression(ast.expr.visitExpression(this, context));
        };
        ExpressionTranslatorVisitor.prototype.visitUnaryOperatorExpr = function (ast, context) {
            if (!UNARY_OPERATORS.has(ast.operator)) {
                throw new Error("Unknown unary operator: " + o.UnaryOperator[ast.operator]);
            }
            return this.factory.createUnaryExpression(UNARY_OPERATORS.get(ast.operator), ast.expr.visitExpression(this, context));
        };
        ExpressionTranslatorVisitor.prototype.visitStatements = function (statements, context) {
            var _this = this;
            return statements.map(function (stmt) { return stmt.visitStatement(_this, context); })
                .filter(function (stmt) { return stmt !== undefined; });
        };
        ExpressionTranslatorVisitor.prototype.setSourceMapRange = function (ast, span) {
            return this.factory.setSourceMapRange(ast, createRange(span));
        };
        ExpressionTranslatorVisitor.prototype.attachComments = function (statement, leadingComments) {
            if (leadingComments !== undefined) {
                this.factory.attachComments(statement, leadingComments);
            }
            return statement;
        };
        return ExpressionTranslatorVisitor;
    }());
    exports.ExpressionTranslatorVisitor = ExpressionTranslatorVisitor;
    /**
     * Convert a cooked-raw string object into one that can be used by the AST factories.
     */
    function createTemplateElement(_a) {
        var cooked = _a.cooked, raw = _a.raw, range = _a.range;
        return { cooked: cooked, raw: raw, range: createRange(range) };
    }
    /**
     * Convert an OutputAST source-span into a range that can be used by the AST factories.
     */
    function createRange(span) {
        if (span === null) {
            return null;
        }
        var start = span.start, end = span.end;
        var _a = start.file, url = _a.url, content = _a.content;
        if (!url) {
            return null;
        }
        return {
            url: url,
            content: content,
            start: { offset: start.offset, line: start.line, column: start.col },
            end: { offset: end.offset, line: end.line, column: end.col },
        };
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNsYXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvbmd0c2MvdHJhbnNsYXRvci9zcmMvdHJhbnNsYXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0lBQUE7Ozs7OztPQU1HO0lBQ0gscUNBQXVDO0lBT3ZDLElBQU0sZUFBZSxHQUFHLElBQUksR0FBRyxDQUFpQztRQUM5RCxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQztRQUM1QixDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQztLQUM1QixDQUFDLENBQUM7SUFFSCxJQUFNLGdCQUFnQixHQUFHLElBQUksR0FBRyxDQUFtQztRQUNqRSxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQztRQUM1QixDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQztRQUM5QixDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQztRQUNyQyxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsVUFBVSxFQUFFLEdBQUcsQ0FBQztRQUNsQyxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQztRQUM5QixDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQztRQUMvQixDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQztRQUNuQyxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQztRQUM3QixDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQztRQUNwQyxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMs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TSxRQUFBLEVBQUUsR0FBRyxLQUFBLEVBQUUsS0FBSyxFQUFFLFdBQVcsQ0FBQyxLQUFLLENBQUMsRUFBQyxDQUFDO0lBQ2xELENBQUM7SUFFRDs7T0FFRztJQUNILFNBQVMsV0FBVyxDQUFDLElBQTRCO1FBQy9DLElBQUksSUFBSSxLQUFLLElBQUksRUFBRTtZQUNqQixPQUFPLElBQUksQ0FBQztTQUNiO1FBQ00sSUFBQSxLQUFLLEdBQVMsSUFBSSxNQUFiLEVBQUUsR0FBRyxHQUFJLElBQUksSUFBUixDQUFTO1FBQ3BCLElBQUEsS0FBaUIsS0FBSyxDQUFDLElBQUksRUFBMUIsR0FBRyxTQUFBLEVBQUUsT0FBTyxhQUFjLENBQUM7UUFDbEMsSUFBSSxDQUFDLEdBQUcsRUFBRTtZQUNSLE9BQU8sSUFBSSxDQUFDO1NBQ2I7UUFDRCxPQUFPO1lBQ0wsR0FBRyxLQUFBO1lBQ0gsT0FBTyxTQUFBO1lBQ1AsS0FBSyxFQUFFLEVBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUM7WUFDbEUsR0FBRyxFQUFFLEVBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUM7U0FDM0QsQ0FBQztJQUNKLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCAqIGFzIG8gZnJvbSAnQGFuZ3VsYXIvY29tcGlsZXInO1xuaW1wb3J0IHtjcmVhdGVUYWdnZWRUZW1wbGF0ZX0gZnJvbSAndHlwZXNjcmlwdCc7XG5cbmltcG9ydCB7QXN0RmFjdG9yeSwgQmluYXJ5T3BlcmF0b3IsIE9iamVjdExpdGVyYWxQcm9wZXJ0eSwgU291cmNlTWFwUmFuZ2UsIFRlbXBsYXRlRWxlbWVudCwgVGVtcGxhdGVMaXRlcmFsLCBVbmFyeU9wZXJhdG9yfSBmcm9tICcuL2FwaS9hc3RfZmFjdG9yeSc7XG5pbXBvcnQge0ltcG9ydEdlbmVyYXRvcn0gZnJvbSAnLi9hcGkvaW1wb3J0X2dlbmVyYXRvcic7XG5pbXBvcnQge0NvbnRleHR9IGZyb20gJy4vY29udGV4dCc7XG5cbmNvbnN0IFVOQVJZX09QRVJBVE9SUyA9IG5ldyBNYXA8by5VbmFyeU9wZXJhdG9yLCBVbmFyeU9wZXJhdG9yPihbXG4gIFtvLlVuYXJ5T3BlcmF0b3IuTWludXMsICctJ10sXG4gIFtvLlVuYXJ5T3BlcmF0b3IuUGx1cywgJysnXSxcbl0pO1xuXG5jb25zdCBCSU5BUllfT1BFUkFUT1JTID0gbmV3IE1hcDxvLkJpbmFyeU9wZXJhdG9yLCBCaW5hcnlPcGVyYXRvcj4oW1xuICBbby5CaW5hcnlPcGVyYXRvci5BbmQsICcmJiddLFxuICBbby5CaW5hcnlPcGVyYXRvci5CaWdnZXIsICc+J10sXG4gIFtvLkJpbmFyeU9wZXJhdG9yLkJpZ2dlckVxdWFscywgJz49J10sXG4gIFtvLkJpbmFyeU9wZXJhdG9yLkJpdHdpc2VBbmQsICcmJ10sXG4gIFtvLkJpbmFyeU9wZXJhdG9yLkRpdmlkZSwgJy8nXSxcbiAgW28uQmluYXJ5T3BlcmF0b3IuRXF1YWxzLCAnPT0nXSxcbiAgW28uQmluYXJ5T3BlcmF0b3IuSWRlbnRpY2FsLCAnPT09J10sXG4gIFtvLkJpbmFyeU9wZXJhdG9yLkxvd2VyLCAnPCddLFxuICBbby5CaW5hcnlPcGVyYXRvci5Mb3dlckVxdWFscywgJzw9J10sXG4gIFtvLkJpbmFyeU9wZXJhdG9yLk1pbnVzLCAnLSddLFxuICBbby5CaW5hcnlPcGVyYXRvci5Nb2R1bG8sICclJ10sXG4gIFtvLkJpbmFyeU9wZXJhdG9yLk11bHRpcGx5LCAnKiddLFxuICBbby5CaW5hcnlPcGVyYXRvci5Ob3RFcXVhbHMsICchPSddLFxuICBbby5CaW5hcnlPcGVyYXRvci5Ob3RJZGVudGljYWwsICchPT0nXSxcbiAgW28uQmluYXJ5T3BlcmF0b3IuT3IsICd8fCddLFxuICBbby5CaW5hcnlPcGVyYXRvci5QbHVzLCAnKyddLFxuICBbby5CaW5hcnlPcGVyYXRvci5OdWxsaXNoQ29hbGVzY2UsICc/PyddLFxuXSk7XG5cbmV4cG9ydCB0eXBlIFJlY29yZFdyYXBwZWROb2RlRm48VEV4cHJlc3Npb24+ID0gKG5vZGU6IG8uV3JhcHBlZE5vZGVFeHByPFRFeHByZXNzaW9uPikgPT4gdm9pZDtcblxuZXhwb3J0IGludGVyZmFjZSBUcmFuc2xhdG9yT3B0aW9uczxURXhwcmVzc2lvbj4ge1xuICBkb3dubGV2ZWxUYWdnZWRUZW1wbGF0ZXM/OiBib29sZWFuO1xuICBkb3dubGV2ZWxWYXJpYWJsZURlY2xhcmF0aW9ucz86IGJvb2xlYW47XG4gIHJlY29yZFdyYXBwZWROb2RlPzogUmVjb3JkV3JhcHBlZE5vZGVGbjxURXhwcmVzc2lvbj47XG4gIGFubm90YXRlRm9yQ2xvc3VyZUNvbXBpbGVyPzogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGNsYXNzIEV4cHJlc3Npb25UcmFuc2xhdG9yVmlzaXRvcjxUU3RhdGVtZW50LCBURXhwcmVzc2lvbj4gaW1wbGVtZW50cyBvLkV4cHJlc3Npb25WaXNpdG9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvLlN0YXRlbWVudFZpc2l0b3Ige1xuICBwcml2YXRlIGRvd25sZXZlbFRhZ2dlZFRlbXBsYXRlczogYm9vbGVhbjtcbiAgcHJpdmF0ZSBkb3dubGV2ZWxWYXJpYWJsZURlY2xhcmF0aW9uczogYm9vbGVhbjtcbiAgcHJpdmF0ZSByZWNvcmRXcmFwcGVkTm9kZTogUmVjb3JkV3JhcHBlZE5vZGVGbjxURXhwcmVzc2lvbj47XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIGZhY3Rvcnk6IEFzdEZhY3Rvcnk8VFN0YXRlbWVudCwgVEV4cHJlc3Npb24+LFxuICAgICAgcHJpdmF0ZSBpbXBvcnRzOiBJbXBvcnRHZW5lcmF0b3I8VEV4cHJlc3Npb24+LCBvcHRpb25zOiBUcmFuc2xhdG9yT3B0aW9uczxURXhwcmVzc2lvbj4pIHtcbiAgICB0aGlzLmRvd25sZXZlbFRhZ2dlZFRlbXBsYXRlcyA9IG9wdGlvbnMuZG93bmxldmVsVGFnZ2VkVGVtcGxhdGVzID09PSB0cnVlO1xuICAgIHRoaXMuZG93bmxldmVsVmFyaWFibGVEZWNsYXJhdGlvbnMgPSBvcHRpb25zLmRvd25sZXZlbFZhcmlhYmxlRGVjbGFyYXRpb25zID09PSB0cnVlO1xuICAgIHRoaXMucmVjb3JkV3JhcHBlZE5vZGUgPSBvcHRpb25zLnJlY29yZFdyYXBwZWROb2RlIHx8ICgoKSA9PiB7fSk7XG4gIH1cblxuICB2aXNpdERlY2xhcmVWYXJTdG10KHN0bXQ6IG8uRGVjbGFyZVZhclN0bXQsIGNvbnRleHQ6IENvbnRleHQpOiBUU3RhdGVtZW50IHtcbiAgICBjb25zdCB2YXJUeXBlID0gdGhpcy5kb3dubGV2ZWxWYXJpYWJsZURlY2xhcmF0aW9ucyA/XG4gICAgICAgICd2YXInIDpcbiAgICAgICAgc3RtdC5oYXNNb2RpZmllcihvLlN0bXRNb2RpZmllci5GaW5hbCkgPyAnY29uc3QnIDogJ2xldCc7XG4gICAgcmV0dXJuIHRoaXMuYXR0YWNoQ29tbWVudHMoXG4gICAgICAgIHRoaXMuZmFjdG9yeS5jcmVhdGVWYXJpYWJsZURlY2xhcmF0aW9uKFxuICAgICAgICAgICAgc3RtdC5uYW1lLCBzdG10LnZhbHVlPy52aXNpdEV4cHJlc3Npb24odGhpcywgY29udGV4dC53aXRoRXhwcmVzc2lvbk1vZGUpLCB2YXJUeXBlKSxcbiAgICAgICAgc3RtdC5sZWFkaW5nQ29tbWVudHMpO1xuICB9XG5cbiAgdmlzaXREZWNsYXJlRnVuY3Rpb25TdG10KHN0bXQ6IG8uRGVjbGFyZUZ1bmN0aW9uU3RtdCwgY29udGV4dDogQ29udGV4dCk6IFRTdGF0ZW1lbnQge1xuICAgIHJldHVybiB0aGlzLmF0dGFjaENvbW1lbnRzKFxuICAgICAgICB0aGlzLmZhY3RvcnkuY3JlYXRlRnVuY3Rpb25EZWNsYXJhdGlvbihcbiAgICAgICAgICAgIHN0bXQubmFtZSwgc3RtdC5wYXJhbXMubWFwKHBhcmFtID0+IHBhcmFtLm5hbWUpLFxuICAgICAgICAgICAgdGhpcy5mYWN0b3J5LmNyZWF0ZUJsb2NrKFxuICAgICAgICAgICAgICAgIHRoaXMudmlzaXRTdGF0ZW1lbnRzKHN0bXQuc3RhdGVtZW50cywgY29udGV4dC53aXRoU3RhdGVtZW50TW9kZSkpKSxcbiAgICAgICAgc3RtdC5sZWFkaW5nQ29tbWVudHMpO1xuICB9XG5cbiAgdmlzaXRFeHByZXNzaW9uU3RtdChzdG10OiBvLkV4cHJlc3Npb25TdGF0ZW1lbnQsIGNvbnRleHQ6IENvbnRleHQpOiBUU3RhdGVtZW50IHtcbiAgICByZXR1cm4gdGhpcy5hdHRhY2hDb21tZW50cyhcbiAgICAgICAgdGhpcy5mYWN0b3J5LmNyZWF0ZUV4cHJlc3Npb25TdGF0ZW1lbnQoXG4gICAgICAgICAgICBzdG10LmV4cHIudmlzaXRFeHByZXNzaW9uKHRoaXMsIGNvbnRleHQud2l0aFN0YXRlbWVudE1vZGUpKSxcbiAgICAgICAgc3RtdC5sZWFkaW5nQ29tbWVudHMpO1xuICB9XG5cbiAgdmlzaXRSZXR1cm5TdG10KHN0bXQ6IG8uUmV0dXJuU3RhdGVtZW50LCBjb250ZXh0OiBDb250ZXh0KTogVFN0YXRlbWVudCB7XG4gICAgcmV0dXJuIHRoaXMuYXR0YWNoQ29tbWVudHMoXG4gICAgICAgIHRoaXMuZmFjdG9yeS5jcmVhdGVSZXR1cm5TdGF0ZW1lbnQoXG4gICAgICAgICAgICBzdG10LnZhbHVlLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjb250ZXh0LndpdGhFeHByZXNzaW9uTW9kZSkpLFxuICAgICAgICBzdG10LmxlYWRpbmdDb21tZW50cyk7XG4gIH1cblxuICB2aXNpdERlY2xhcmVDbGFzc1N0bXQoX3N0bXQ6IG8uQ2xhc3NTdG10LCBfY29udGV4dDogQ29udGV4dCk6IG5ldmVyIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ01ldGhvZCBub3QgaW1wbGVtZW50ZWQuJyk7XG4gIH1cblxuICB2aXNpdElmU3RtdChzdG10OiBvLklmU3RtdCwgY29udGV4dDogQ29udGV4dCk6IFRTdGF0ZW1lbnQge1xuICAgIHJldHVybiB0aGlzLmF0dGFjaENvbW1lbnRzKFxuICAgICAgICB0aGlzLmZhY3RvcnkuY3JlYXRlSWZTdGF0ZW1lbnQoXG4gICAgICAgICAgICBzdG10LmNvbmRpdGlvbi52aXNpdEV4cHJlc3Npb24odGhpcywgY29udGV4dCksXG4gICAgICAgICAgICB0aGlzLmZhY3RvcnkuY3JlYXRlQmxvY2soXG4gICAgICAgICAgICAgICAgdGhpcy52aXNpdFN0YXRlbWVudHMoc3RtdC50cnVlQ2FzZSwgY29udGV4dC53aXRoU3RhdGVtZW50TW9kZSkpLFxuICAgICAgICAgICAgc3RtdC5mYWxzZUNhc2UubGVuZ3RoID4gMCA/IHRoaXMuZmFjdG9yeS5jcmVhdGVCbG9jayh0aGlzLnZpc2l0U3RhdGVtZW50cyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RtdC5mYWxzZUNhc2UsIGNvbnRleHQud2l0aFN0YXRlbWVudE1vZGUpKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVsbCksXG4gICAgICAgIHN0bXQubGVhZGluZ0NvbW1lbnRzKTtcbiAgfVxuXG4gIHZpc2l0VHJ5Q2F0Y2hTdG10KF9zdG10OiBvLlRyeUNhdGNoU3RtdCwgX2NvbnRleHQ6IENvbnRleHQpOiBuZXZlciB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdNZXRob2Qgbm90IGltcGxlbWVudGVkLicpO1xuICB9XG5cbiAgdmlzaXRUaHJvd1N0bXQoc3RtdDogby5UaHJvd1N0bXQsIGNvbnRleHQ6IENvbnRleHQpOiBUU3RhdGVtZW50IHtcbiAgICByZXR1cm4gdGhpcy5hdHRhY2hDb21tZW50cyhcbiAgICAgICAgdGhpcy5mYWN0b3J5LmNyZWF0ZVRocm93U3RhdGVtZW50KFxuICAgICAgICAgICAgc3RtdC5lcnJvci52aXNpdEV4cHJlc3Npb24odGhpcywgY29udGV4dC53aXRoRXhwcmVzc2lvbk1vZGUpKSxcbiAgICAgICAgc3RtdC5sZWFkaW5nQ29tbWVudHMpO1xuICB9XG5cbiAgdmlzaXRSZWFkVmFyRXhwcihhc3Q6IG8uUmVhZFZhckV4cHIsIF9jb250ZXh0OiBDb250ZXh0KTogVEV4cHJlc3Npb24ge1xuICAgIGNvbnN0IGlkZW50aWZpZXIgPSB0aGlzLmZhY3RvcnkuY3JlYXRlSWRlbnRpZmllcihhc3QubmFtZSEpO1xuICAgIHRoaXMuc2V0U291cmNlTWFwUmFuZ2UoaWRlbnRpZmllciwgYXN0LnNvdXJjZVNwYW4pO1xuICAgIHJldHVybiBpZGVudGlmaWVyO1xuICB9XG5cbiAgdmlzaXRXcml0ZVZhckV4cHIoZXhwcjogby5Xcml0ZVZhckV4cHIsIGNvbnRleHQ6IENvbnRleHQpOiBURXhwcmVzc2lvbiB7XG4gICAgY29uc3QgYXNzaWdubWVudCA9IHRoaXMuZmFjdG9yeS5jcmVhdGVBc3NpZ25tZW50KFxuICAgICAgICB0aGlzLnNldFNvdXJjZU1hcFJhbmdlKHRoaXMuZmFjdG9yeS5jcmVhdGVJZGVudGlmaWVyKGV4cHIubmFtZSksIGV4cHIuc291cmNlU3BhbiksXG4gICAgICAgIGV4cHIudmFsdWUudmlzaXRFeHByZXNzaW9uKHRoaXMsIGNvbnRleHQpLFxuICAgICk7XG4gICAgcmV0dXJuIGNvbnRleHQuaXNTdGF0ZW1lbnQgPyBhc3NpZ25tZW50IDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZmFjdG9yeS5jcmVhdGVQYXJlbnRoZXNpemVkRXhwcmVzc2lvbihhc3NpZ25tZW50KTtcbiAgfVxuXG4gIHZpc2l0V3JpdGVLZXlFeHByKGV4cHI6IG8uV3JpdGVLZXlFeHByLCBjb250ZXh0OiBDb250ZXh0KTogVEV4cHJlc3Npb24ge1xuICAgIGNvbnN0IGV4cHJDb250ZXh0ID0gY29udGV4dC53aXRoRXhwcmVzc2lvbk1vZGU7XG4gICAgY29uc3QgdGFyZ2V0ID0gdGhpcy5mYWN0b3J5LmNyZWF0ZUVsZW1lbnRBY2Nlc3MoXG4gICAgICAgIGV4cHIucmVjZWl2ZXIudmlzaXRFeHByZXNzaW9uKHRoaXMsIGV4cHJDb250ZXh0KSxcbiAgICAgICAgZXhwci5pbmRleC52aXNpdEV4cHJlc3Npb24odGhpcywgZXhwckNvbnRleHQpLFxuICAgICk7XG4gICAgY29uc3QgYXNzaWdubWVudCA9XG4gICAgICAgIHRoaXMuZmFjdG9yeS5jcmVhdGVBc3NpZ25tZW50KHRhcmdldCwgZXhwci52YWx1ZS52aXNpdEV4cHJlc3Npb24odGhpcywgZXhwckNvbnRleHQpKTtcbiAgICByZXR1cm4gY29udGV4dC5pc1N0YXRlbWVudCA/IGFzc2lnbm1lbnQgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5mYWN0b3J5LmNyZWF0ZVBhcmVudGhlc2l6ZWRFeHByZXNzaW9uKGFzc2lnbm1lbnQpO1xuICB9XG5cbiAgdmlzaXRXcml0ZVByb3BFeHByKGV4cHI6IG8uV3JpdGVQcm9wRXhwciwgY29udGV4dDogQ29udGV4dCk6IFRFeHByZXNzaW9uIHtcbiAgICBjb25zdCB0YXJnZXQgPVxuICAgICAgICB0aGlzLmZhY3RvcnkuY3JlYXRlUHJvcGVydHlBY2Nlc3MoZXhwci5yZWNlaXZlci52aXNpdEV4cHJlc3Npb24odGhpcywgY29udGV4dCksIGV4cHIubmFtZSk7XG4gICAgcmV0dXJuIHRoaXMuZmFjdG9yeS5jcmVhdGVBc3NpZ25tZW50KHRhcmdldCwgZXhwci52YWx1ZS52aXNpdEV4cHJlc3Npb24odGhpcywgY29udGV4dCkpO1xuICB9XG5cbiAgdmlzaXRJbnZva2VNZXRob2RFeHByKGFzdDogby5JbnZva2VNZXRob2RFeHByLCBjb250ZXh0OiBDb250ZXh0KTogVEV4cHJlc3Npb24ge1xuICAgIGNvbnN0IHRhcmdldCA9IGFzdC5yZWNlaXZlci52aXNpdEV4cHJlc3Npb24odGhpcywgY29udGV4dCk7XG4gICAgcmV0dXJuIHRoaXMuc2V0U291cmNlTWFwUmFuZ2UoXG4gICAgICAgIHRoaXMuZmFjdG9yeS5jcmVhdGVDYWxsRXhwcmVzc2lvbihcbiAgICAgICAgICAgIGFzdC5uYW1lICE9PSBudWxsID8gdGhpcy5mYWN0b3J5LmNyZWF0ZVByb3BlcnR5QWNjZXNzKHRhcmdldCwgYXN0Lm5hbWUpIDogdGFyZ2V0LFxuICAgICAgICAgICAgYXN0LmFyZ3MubWFwKGFyZyA9PiBhcmcudmlzaXRFeHByZXNzaW9uKHRoaXMsIGNvbnRleHQpKSxcbiAgICAgICAgICAgIC8qIHB1cmUgKi8gZmFsc2UpLFxuICAgICAgICBhc3Quc291cmNlU3Bhbik7XG4gIH1cblxuICB2aXNpdEludm9rZUZ1bmN0aW9uRXhwcihhc3Q6IG8uSW52b2tlRnVuY3Rpb25FeHByLCBjb250ZXh0OiBDb250ZXh0KTogVEV4cHJlc3Npb24ge1xuICAgIHJldHVybiB0aGlzLnNldFNvdXJjZU1hcFJhbmdlKFxuICAgICAgICB0aGlzLmZhY3RvcnkuY3JlYXRlQ2FsbEV4cHJlc3Npb24oXG4gICAgICAgICAgICBhc3QuZm4udmlzaXRFeHByZXNzaW9uKHRoaXMsIGNvbnRleHQpLFxuICAgICAgICAgICAgYXN0LmFyZ3MubWFwKGFyZyA9PiBhcmcudmlzaXRFeHByZXNzaW9uKHRoaXMsIGNvbnRleHQpKSwgYXN0LnB1cmUpLFxuICAgICAgICBhc3Quc291cmNlU3Bhbik7XG4gIH1cblxuICB2aXNpdFRhZ2dlZFRlbXBsYXRlRXhwcihhc3Q6IG8uVGFnZ2VkVGVtcGxhdGVFeHByLCBjb250ZXh0OiBDb250ZXh0KTogVEV4cHJlc3Npb24ge1xuICAgIHJldHVybiB0aGlzLnNldFNvdXJjZU1hcFJhbmdlKFxuICAgICAgICB0aGlzLmNyZWF0ZVRhZ2dlZFRlbXBsYXRlRXhwcmVzc2lvbihhc3QudGFnLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjb250ZXh0KSwge1xuICAgICAgICAgIGVsZW1lbnRzOiBhc3QudGVtcGxhdGUuZWxlbWVudHMubWFwKGUgPT4gY3JlYXRlVGVtcGxhdGVFbGVtZW50KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvb2tlZDogZS50ZXh0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmF3OiBlLnJhd1RleHQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByYW5nZTogZS5zb3VyY2VTcGFuID8/IGFzdC5zb3VyY2VTcGFuLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pKSxcbiAgICAgICAgICBleHByZXNzaW9uczogYXN0LnRlbXBsYXRlLmV4cHJlc3Npb25zLm1hcChlID0+IGUudmlzaXRFeHByZXNzaW9uKHRoaXMsIGNvbnRleHQpKVxuICAgICAgICB9KSxcbiAgICAgICAgYXN0LnNvdXJjZVNwYW4pO1xuICB9XG5cbiAgdmlzaXRJbnN0YW50aWF0ZUV4cHIoYXN0OiBvLkluc3RhbnRpYXRlRXhwciwgY29udGV4dDogQ29udGV4dCk6IFRFeHByZXNzaW9uIHtcbiAgICByZXR1cm4gdGhpcy5mYWN0b3J5LmNyZWF0ZU5ld0V4cHJlc3Npb24oXG4gICAgICAgIGFzdC5jbGFzc0V4cHIudmlzaXRFeHByZXNzaW9uKHRoaXMsIGNvbnRleHQpLFxuICAgICAgICBhc3QuYXJncy5tYXAoYXJnID0+IGFyZy52aXNpdEV4cHJlc3Npb24odGhpcywgY29udGV4dCkpKTtcbiAgfVxuXG4gIHZpc2l0TGl0ZXJhbEV4cHIoYXN0OiBvLkxpdGVyYWxFeHByLCBfY29udGV4dDogQ29udGV4dCk6IFRFeHByZXNzaW9uIHtcbiAgICByZXR1cm4gdGhpcy5zZXRTb3VyY2VNYXBSYW5nZSh0aGlzLmZhY3RvcnkuY3JlYXRlTGl0ZXJhbChhc3QudmFsdWUpLCBhc3Quc291cmNlU3Bhbik7XG4gIH1cblxuICB2aXNpdExvY2FsaXplZFN0cmluZyhhc3Q6IG8uTG9jYWxpemVkU3RyaW5nLCBjb250ZXh0OiBDb250ZXh0KTogVEV4cHJlc3Npb24ge1xuICAgIC8vIEEgYCRsb2NhbGl6ZWAgbWVzc2FnZSBjb25zaXN0cyBvZiBgbWVzc2FnZVBhcnRzYCBhbmQgYGV4cHJlc3Npb25zYCwgd2hpY2ggZ2V0IGludGVybGVhdmVkXG4gICAgLy8gdG9nZXRoZXIuIFRoZSBpbnRlcmxlYXZlZCBwaWVjZXMgbG9vayBsaWtlOlxuICAgIC8vIGBbbWVzc2FnZVBhcnQwLCBleHByZXNzaW9uMCwgbWVzc2FnZVBhcnQxLCBleHByZXNzaW9uMSwgbWVzc2FnZVBhcnQyXWBcbiAgICAvL1xuICAgIC8vIE5vdGUgdGhhdCB0aGVyZSBpcyBhbHdheXMgYSBtZXNzYWdlIHBhcnQgYXQgdGhlIHN0YXJ0IGFuZCBlbmQsIGFuZCBzbyB0aGVyZWZvcmVcbiAgICAvLyBgbWVzc2FnZVBhcnRzLmxlbmd0aCA9PT0gZXhwcmVzc2lvbnMubGVuZ3RoICsgMWAuXG4gICAgLy9cbiAgICAvLyBFYWNoIG1lc3NhZ2UgcGFydCBtYXkgYmUgcHJlZml4ZWQgd2l0aCBcIm1ldGFkYXRhXCIsIHdoaWNoIGlzIHdyYXBwZWQgaW4gY29sb25zICg6KSBkZWxpbWl0ZXJzLlxuICAgIC8vIFRoZSBtZXRhZGF0YSBpcyBhdHRhY2hlZCB0byB0aGUgZmlyc3QgYW5kIHN1YnNlcXVlbnQgbWVzc2FnZSBwYXJ0cyBieSBjYWxscyB0b1xuICAgIC8vIGBzZXJpYWxpemVJMThuSGVhZCgpYCBhbmQgYHNlcmlhbGl6ZUkxOG5UZW1wbGF0ZVBhcnQoKWAgcmVzcGVjdGl2ZWx5LlxuICAgIC8vXG4gICAgLy8gVGhlIGZpcnN0IG1lc3NhZ2UgcGFydCAoaS5lLiBgYXN0Lm1lc3NhZ2VQYXJ0c1swXWApIGlzIHVzZWQgdG8gaW5pdGlhbGl6ZSBgbWVzc2FnZVBhcnRzYFxuICAgIC8vIGFycmF5LlxuICAgIGNvbnN0IGVsZW1lbnRzOiBUZW1wbGF0ZUVsZW1lbnRbXSA9IFtjcmVhdGVUZW1wbGF0ZUVsZW1lbnQoYXN0LnNlcmlhbGl6ZUkxOG5IZWFkKCkpXTtcbiAgICBjb25zdCBleHByZXNzaW9uczogVEV4cHJlc3Npb25bXSA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXN0LmV4cHJlc3Npb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBwbGFjZWhvbGRlciA9IHRoaXMuc2V0U291cmNlTWFwUmFuZ2UoXG4gICAgICAgICAgYXN0LmV4cHJlc3Npb25zW2ldLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjb250ZXh0KSwgYXN0LmdldFBsYWNlaG9sZGVyU291cmNlU3BhbihpKSk7XG4gICAgICBleHByZXNzaW9ucy5wdXNoKHBsYWNlaG9sZGVyKTtcbiAgICAgIGVsZW1lbnRzLnB1c2goY3JlYXRlVGVtcGxhdGVFbGVtZW50KGFzdC5zZXJpYWxpemVJMThuVGVtcGxhdGVQYXJ0KGkgKyAxKSkpO1xuICAgIH1cblxuICAgIGNvbnN0IGxvY2FsaXplVGFnID0gdGhpcy5mYWN0b3J5LmNyZWF0ZUlkZW50aWZpZXIoJyRsb2NhbGl6ZScpO1xuICAgIHJldHVybiB0aGlzLnNldFNvdXJjZU1hcFJhbmdlKFxuICAgICAgICB0aGlzLmNyZWF0ZVRhZ2dlZFRlbXBsYXRlRXhwcmVzc2lvbihsb2NhbGl6ZVRhZywge2VsZW1lbnRzLCBleHByZXNzaW9uc30pLCBhc3Quc291cmNlU3Bhbik7XG4gIH1cblxuICBwcml2YXRlIGNyZWF0ZVRhZ2dlZFRlbXBsYXRlRXhwcmVzc2lvbih0YWc6IFRFeHByZXNzaW9uLCB0ZW1wbGF0ZTogVGVtcGxhdGVMaXRlcmFsPFRFeHByZXNzaW9uPik6XG4gICAgICBURXhwcmVzc2lvbiB7XG4gICAgcmV0dXJuIHRoaXMuZG93bmxldmVsVGFnZ2VkVGVtcGxhdGVzID8gdGhpcy5jcmVhdGVFUzVUYWdnZWRUZW1wbGF0ZUZ1bmN0aW9uQ2FsbCh0YWcsIHRlbXBsYXRlKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5mYWN0b3J5LmNyZWF0ZVRhZ2dlZFRlbXBsYXRlKHRhZywgdGVtcGxhdGUpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRyYW5zbGF0ZSB0aGUgdGFnZ2VkIHRlbXBsYXRlIGxpdGVyYWwgaW50byBhIGNhbGwgdGhhdCBpcyBjb21wYXRpYmxlIHdpdGggRVM1LCB1c2luZyB0aGVcbiAgICogaW1wb3J0ZWQgYF9fbWFrZVRlbXBsYXRlT2JqZWN0YCBoZWxwZXIgZm9yIEVTNSBmb3JtYXR0ZWQgb3V0cHV0LlxuICAgKi9cbiAgcHJpdmF0ZSBjcmVhdGVFUzVUYWdnZWRUZW1wbGF0ZUZ1bmN0aW9uQ2FsbChcbiAgICAgIHRhZ0hhbmRsZXI6IFRFeHByZXNzaW9uLCB7ZWxlbWVudHMsIGV4cHJlc3Npb25zfTogVGVtcGxhdGVMaXRlcmFsPFRFeHByZXNzaW9uPik6IFRFeHByZXNzaW9uIHtcbiAgICAvLyBFbnN1cmUgdGhhdCB0aGUgYF9fbWFrZVRlbXBsYXRlT2JqZWN0KClgIGhlbHBlciBoYXMgYmVlbiBpbXBvcnRlZC5cbiAgICBjb25zdCB7bW9kdWxlSW1wb3J0LCBzeW1ib2x9ID1cbiAgICAgICAgdGhpcy5pbXBvcnRzLmdlbmVyYXRlTmFtZWRJbXBvcnQoJ3RzbGliJywgJ19fbWFrZVRlbXBsYXRlT2JqZWN0Jyk7XG4gICAgY29uc3QgX19tYWtlVGVtcGxhdGVPYmplY3RIZWxwZXIgPSAobW9kdWxlSW1wb3J0ID09PSBudWxsKSA/XG4gICAgICAgIHRoaXMuZmFjdG9yeS5jcmVhdGVJZGVudGlmaWVyKHN5bWJvbCkgOlxuICAgICAgICB0aGlzLmZhY3RvcnkuY3JlYXRlUHJvcGVydHlBY2Nlc3MobW9kdWxlSW1wb3J0LCBzeW1ib2wpO1xuXG4gICAgLy8gQ29sbGVjdCB1cCB0aGUgY29va2VkIGFuZCByYXcgc3RyaW5ncyBpbnRvIHR3byBzZXBhcmF0ZSBhcnJheXMuXG4gICAgY29uc3QgY29va2VkOiBURXhwcmVzc2lvbltdID0gW107XG4gICAgY29uc3QgcmF3OiBURXhwcmVzc2lvbltdID0gW107XG4gICAgZm9yIChjb25zdCBlbGVtZW50IG9mIGVsZW1lbnRzKSB7XG4gICAgICBjb29rZWQucHVzaCh0aGlzLmZhY3Rvcnkuc2V0U291cmNlTWFwUmFuZ2UoXG4gICAgICAgICAgdGhpcy5mYWN0b3J5LmNyZWF0ZUxpdGVyYWwoZWxlbWVudC5jb29rZWQpLCBlbGVtZW50LnJhbmdlKSk7XG4gICAgICByYXcucHVzaChcbiAgICAgICAgICB0aGlzLmZhY3Rvcnkuc2V0U291cmNlTWFwUmFuZ2UodGhpcy5mYWN0b3J5LmNyZWF0ZUxpdGVyYWwoZWxlbWVudC5yYXcpLCBlbGVtZW50LnJhbmdlKSk7XG4gICAgfVxuXG4gICAgLy8gR2VuZXJhdGUgdGhlIGhlbHBlciBjYWxsIGluIHRoZSBmb3JtOiBgX19tYWtlVGVtcGxhdGVPYmplY3QoW2Nvb2tlZF0sIFtyYXddKTtgXG4gICAgY29uc3QgdGVtcGxhdGVIZWxwZXJDYWxsID0gdGhpcy5mYWN0b3J5LmNyZWF0ZUNhbGxFeHByZXNzaW9uKFxuICAgICAgICBfX21ha2VUZW1wbGF0ZU9iamVjdEhlbHBlcixcbiAgICAgICAgW3RoaXMuZmFjdG9yeS5jcmVhdGVBcnJheUxpdGVyYWwoY29va2VkKSwgdGhpcy5mYWN0b3J5LmNyZWF0ZUFycmF5TGl0ZXJhbChyYXcpXSxcbiAgICAgICAgLyogcHVyZSAqLyBmYWxzZSk7XG5cbiAgICAvLyBGaW5hbGx5IGNyZWF0ZSB0aGUgdGFnZ2VkIGhhbmRsZXIgY2FsbCBpbiB0aGUgZm9ybTpcbiAgICAvLyBgdGFnKF9fbWFrZVRlbXBsYXRlT2JqZWN0KFtjb29rZWRdLCBbcmF3XSksIC4uLmV4cHJlc3Npb25zKTtgXG4gICAgcmV0dXJuIHRoaXMuZmFjdG9yeS5jcmVhdGVDYWxsRXhwcmVzc2lvbihcbiAgICAgICAgdGFnSGFuZGxlciwgW3RlbXBsYXRlSGVscGVyQ2FsbCwgLi4uZXhwcmVzc2lvbnNdLFxuICAgICAgICAvKiBwdXJlICovIGZhbHNlKTtcbiAgfVxuXG4gIHZpc2l0RXh0ZXJuYWxFeHByKGFzdDogby5FeHRlcm5hbEV4cHIsIF9jb250ZXh0OiBDb250ZXh0KTogVEV4cHJlc3Npb24ge1xuICAgIGlmIChhc3QudmFsdWUubmFtZSA9PT0gbnVsbCkge1xuICAgICAgaWYgKGFzdC52YWx1ZS5tb2R1bGVOYW1lID09PSBudWxsKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBpbXBvcnQgd2l0aG91dCBuYW1lIG5vciBtb2R1bGVOYW1lJyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5pbXBvcnRzLmdlbmVyYXRlTmFtZXNwYWNlSW1wb3J0KGFzdC52YWx1ZS5tb2R1bGVOYW1lKTtcbiAgICB9XG4gICAgLy8gSWYgYSBtb2R1bGVOYW1lIGlzIHNwZWNpZmllZCwgdGhpcyBpcyBhIG5vcm1hbCBpbXBvcnQuIElmIHRoZXJlJ3Mgbm8gbW9kdWxlIG5hbWUsIGl0J3MgYVxuICAgIC8vIHJlZmVyZW5jZSB0byBhIGdsb2JhbC9hbWJpZW50IHN5bWJvbC5cbiAgICBpZiAoYXN0LnZhbHVlLm1vZHVsZU5hbWUgIT09IG51bGwpIHtcbiAgICAgIC8vIFRoaXMgaXMgYSBub3JtYWwgaW1wb3J0LiBGaW5kIHRoZSBpbXBvcnRlZCBtb2R1bGUuXG4gICAgICBjb25zdCB7bW9kdWxlSW1wb3J0LCBzeW1ib2x9ID1cbiAgICAgICAgICB0aGlzLmltcG9ydHMuZ2VuZXJhdGVOYW1lZEltcG9ydChhc3QudmFsdWUubW9kdWxlTmFtZSwgYXN0LnZhbHVlLm5hbWUpO1xuICAgICAgaWYgKG1vZHVsZUltcG9ydCA9PT0gbnVsbCkge1xuICAgICAgICAvLyBUaGUgc3ltYm9sIHdhcyBhbWJpZW50IGFmdGVyIGFsbC5cbiAgICAgICAgcmV0dXJuIHRoaXMuZmFjdG9yeS5jcmVhdGVJZGVudGlmaWVyKHN5bWJvbCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5mYWN0b3J5LmNyZWF0ZVByb3BlcnR5QWNjZXNzKG1vZHVsZUltcG9ydCwgc3ltYm9sKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVGhlIHN5bWJvbCBpcyBhbWJpZW50LCBzbyBqdXN0IHJlZmVyZW5jZSBpdC5cbiAgICAgIHJldHVybiB0aGlzLmZhY3RvcnkuY3JlYXRlSWRlbnRpZmllcihhc3QudmFsdWUubmFtZSk7XG4gICAgfVxuICB9XG5cbiAgdmlzaXRDb25kaXRpb25hbEV4cHIoYXN0OiBvLkNvbmRpdGlvbmFsRXhwciwgY29udGV4dDogQ29udGV4dCk6IFRFeHByZXNzaW9uIHtcbiAgICBsZXQgY29uZDogVEV4cHJlc3Npb24gPSBhc3QuY29uZGl0aW9uLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjb250ZXh0KTtcblxuICAgIC8vIE9yZGluYXJpbHkgdGhlIHRlcm5hcnkgb3BlcmF0b3IgaXMgcmlnaHQtYXNzb2NpYXRpdmUuIFRoZSBmb2xsb3dpbmcgYXJlIGVxdWl2YWxlbnQ6XG4gICAgLy8gICBgYSA/IGIgOiBjID8gZCA6IGVgID0+IGBhID8gYiA6IChjID8gZCA6IGUpYFxuICAgIC8vXG4gICAgLy8gSG93ZXZlciwgb2NjYXNpb25hbGx5IEFuZ3VsYXIgbmVlZHMgdG8gcHJvZHVjZSBhIGxlZnQtYXNzb2NpYXRpdmUgY29uZGl0aW9uYWwsIHN1Y2ggYXMgaW5cbiAgICAvLyB0aGUgY2FzZSBvZiBhIG51bGwtc2FmZSBuYXZpZ2F0aW9uIHByb2R1Y3Rpb246IGB7e2E/LmIgPyBjIDogZH19YC4gVGhpcyB0ZW1wbGF0ZSBwcm9kdWNlc1xuICAgIC8vIGEgdGVybmFyeSBvZiB0aGUgZm9ybTpcbiAgICAvLyAgIGBhID09IG51bGwgPyBudWxsIDogcmVzdCBvZiBleHByZXNzaW9uYFxuICAgIC8vIElmIHRoZSByZXN0IG9mIHRoZSBleHByZXNzaW9uIGlzIGFsc28gYSB0ZXJuYXJ5IHRob3VnaCwgdGhpcyB3b3VsZCBwcm9kdWNlIHRoZSBmb3JtOlxuICAgIC8vICAgYGEgPT0gbnVsbCA/IG51bGwgOiBhLmIgPyBjIDogZGBcbiAgICAvLyB3aGljaCwgaWYgbGVmdCBhcyByaWdodC1hc3NvY2lhdGl2ZSwgd291bGQgYmUgaW5jb3JyZWN0bHkgYXNzb2NpYXRlZCBhczpcbiAgICAvLyAgIGBhID09IG51bGwgPyBudWxsIDogKGEuYiA/IGMgOiBkKWBcbiAgICAvL1xuICAgIC8vIEluIHN1Y2ggY2FzZXMsIHRoZSBsZWZ0LWFzc29jaWF0aXZpdHkgbmVlZHMgdG8gYmUgZW5mb3JjZWQgd2l0aCBwYXJlbnRoZXNlczpcbiAgICAvLyAgIGAoYSA9PSBudWxsID8gbnVsbCA6IGEuYikgPyBjIDogZGBcbiAgICAvL1xuICAgIC8vIFN1Y2ggcGFyZW50aGVzZXMgY291bGQgYWx3YXlzIGJlIGluY2x1ZGVkIGluIHRoZSBjb25kaXRpb24gKGd1YXJhbnRlZWluZyBjb3JyZWN0IGJlaGF2aW9yKSBpblxuICAgIC8vIGFsbCBjYXNlcywgYnV0IHRoaXMgaGFzIGEgY29kZSBzaXplIGNvc3QuIEluc3RlYWQsIHBhcmVudGhlc2VzIGFyZSBhZGRlZCBvbmx5IHdoZW4gYVxuICAgIC8vIGNvbmRpdGlvbmFsIGV4cHJlc3Npb24gaXMgZGlyZWN0bHkgdXNlZCBhcyB0aGUgY29uZGl0aW9uIG9mIGFub3RoZXIuXG4gICAgLy9cbiAgICAvLyBUT0RPKGFseGh1Yik6IGludmVzdGlnYXRlIGJldHRlciBsb2dpYyBmb3IgcHJlY2VuZGVuY2Ugb2YgY29uZGl0aW9uYWwgb3BlcmF0b3JzXG4gICAgaWYgKGFzdC5jb25kaXRpb24gaW5zdGFuY2VvZiBvLkNvbmRpdGlvbmFsRXhwcikge1xuICAgICAgLy8gVGhlIGNvbmRpdGlvbiBvZiB0aGlzIHRlcm5hcnkgbmVlZHMgdG8gYmUgd3JhcHBlZCBpbiBwYXJlbnRoZXNlcyB0byBtYWludGFpblxuICAgICAgLy8gbGVmdC1hc3NvY2lhdGl2aXR5LlxuICAgICAgY29uZCA9IHRoaXMuZmFjdG9yeS5jcmVhdGVQYXJlbnRoZXNpemVkRXhwcmVzc2lvbihjb25kKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5mYWN0b3J5LmNyZWF0ZUNvbmRpdGlvbmFsKFxuICAgICAgICBjb25kLCBhc3QudHJ1ZUNhc2UudmlzaXRFeHByZXNzaW9uKHRoaXMsIGNvbnRleHQpLFxuICAgICAgICBhc3QuZmFsc2VDYXNlIS52aXNpdEV4cHJlc3Npb24odGhpcywgY29udGV4dCkpO1xuICB9XG5cbiAgdmlzaXROb3RFeHByKGFzdDogby5Ob3RFeHByLCBjb250ZXh0OiBDb250ZXh0KTogVEV4cHJlc3Npb24ge1xuICAgIHJldHVybiB0aGlzLmZhY3RvcnkuY3JlYXRlVW5hcnlFeHByZXNzaW9uKCchJywgYXN0LmNvbmRpdGlvbi52aXNpdEV4cHJlc3Npb24odGhpcywgY29udGV4dCkpO1xuICB9XG5cbiAgdmlzaXRBc3NlcnROb3ROdWxsRXhwcihhc3Q6IG8uQXNzZXJ0Tm90TnVsbCwgY29udGV4dDogQ29udGV4dCk6IFRFeHByZXNzaW9uIHtcbiAgICByZXR1cm4gYXN0LmNvbmRpdGlvbi52aXNpdEV4cHJlc3Npb24odGhpcywgY29udGV4dCk7XG4gIH1cblxuICB2aXNpdENhc3RFeHByKGFzdDogby5DYXN0RXhwciwgY29udGV4dDogQ29udGV4dCk6IFRFeHByZXNzaW9uIHtcbiAgICByZXR1cm4gYXN0LnZhbHVlLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjb250ZXh0KTtcbiAgfVxuXG4gIHZpc2l0RnVuY3Rpb25FeHByKGFzdDogby5GdW5jdGlvbkV4cHIsIGNvbnRleHQ6IENvbnRleHQpOiBURXhwcmVzc2lvbiB7XG4gICAgcmV0dXJuIHRoaXMuZmFjdG9yeS5jcmVhdGVGdW5jdGlvbkV4cHJlc3Npb24oXG4gICAgICAgIGFzdC5uYW1lID8/IG51bGwsIGFzdC5wYXJhbXMubWFwKHBhcmFtID0+IHBhcmFtLm5hbWUpLFxuICAgICAgICB0aGlzLmZhY3RvcnkuY3JlYXRlQmxvY2sodGhpcy52aXNpdFN0YXRlbWVudHMoYXN0LnN0YXRlbWVudHMsIGNvbnRleHQpKSk7XG4gIH1cblxuICB2aXNpdEJpbmFyeU9wZXJhdG9yRXhwcihhc3Q6IG8uQmluYXJ5T3BlcmF0b3JFeHByLCBjb250ZXh0OiBDb250ZXh0KTogVEV4cHJlc3Npb24ge1xuICAgIGlmICghQklOQVJZX09QRVJBVE9SUy5oYXMoYXN0Lm9wZXJhdG9yKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIGJpbmFyeSBvcGVyYXRvcjogJHtvLkJpbmFyeU9wZXJhdG9yW2FzdC5vcGVyYXRvcl19YCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmZhY3RvcnkuY3JlYXRlQmluYXJ5RXhwcmVzc2lvbihcbiAgICAgICAgYXN0Lmxocy52aXNpdEV4cHJlc3Npb24odGhpcywgY29udGV4dCksXG4gICAgICAgIEJJTkFSWV9PUEVSQVRPUlMuZ2V0KGFzdC5vcGVyYXRvcikhLFxuICAgICAgICBhc3QucmhzLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjb250ZXh0KSxcbiAgICApO1xuICB9XG5cbiAgdmlzaXRSZWFkUHJvcEV4cHIoYXN0OiBvLlJlYWRQcm9wRXhwciwgY29udGV4dDogQ29udGV4dCk6IFRFeHByZXNzaW9uIHtcbiAgICByZXR1cm4gdGhpcy5mYWN0b3J5LmNyZWF0ZVByb3BlcnR5QWNjZXNzKGFzdC5yZWNlaXZlci52aXNpdEV4cHJlc3Npb24odGhpcywgY29udGV4dCksIGFzdC5uYW1lKTtcbiAgfVxuXG4gIHZpc2l0UmVhZEtleUV4cHIoYXN0OiBvLlJlYWRLZXlFeHByLCBjb250ZXh0OiBDb250ZXh0KTogVEV4cHJlc3Npb24ge1xuICAgIHJldHVybiB0aGlzLmZhY3RvcnkuY3JlYXRlRWxlbWVudEFjY2VzcyhcbiAgICAgICAgYXN0LnJlY2VpdmVyLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjb250ZXh0KSwgYXN0LmluZGV4LnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjb250ZXh0KSk7XG4gIH1cblxuICB2aXNpdExpdGVyYWxBcnJheUV4cHIoYXN0OiBvLkxpdGVyYWxBcnJheUV4cHIsIGNvbnRleHQ6IENvbnRleHQpOiBURXhwcmVzc2lvbiB7XG4gICAgcmV0dXJuIHRoaXMuZmFjdG9yeS5jcmVhdGVBcnJheUxpdGVyYWwoYXN0LmVudHJpZXMubWFwKFxuICAgICAgICBleHByID0+IHRoaXMuc2V0U291cmNlTWFwUmFuZ2UoZXhwci52aXNpdEV4cHJlc3Npb24odGhpcywgY29udGV4dCksIGFzdC5zb3VyY2VTcGFuKSkpO1xuICB9XG5cbiAgdmlzaXRMaXRlcmFsTWFwRXhwcihhc3Q6IG8uTGl0ZXJhbE1hcEV4cHIsIGNvbnRleHQ6IENvbnRleHQpOiBURXhwcmVzc2lvbiB7XG4gICAgY29uc3QgcHJvcGVydGllczogT2JqZWN0TGl0ZXJhbFByb3BlcnR5PFRFeHByZXNzaW9uPltdID0gYXN0LmVudHJpZXMubWFwKGVudHJ5ID0+IHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHByb3BlcnR5TmFtZTogZW50cnkua2V5LFxuICAgICAgICBxdW90ZWQ6IGVudHJ5LnF1b3RlZCxcbiAgICAgICAgdmFsdWU6IGVudHJ5LnZhbHVlLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjb250ZXh0KVxuICAgICAgfTtcbiAgICB9KTtcbiAgICByZXR1cm4gdGhpcy5zZXRTb3VyY2VNYXBSYW5nZSh0aGlzLmZhY3RvcnkuY3JlYXRlT2JqZWN0TGl0ZXJhbChwcm9wZXJ0aWVzKSwgYXN0LnNvdXJjZVNwYW4pO1xuICB9XG5cbiAgdmlzaXRDb21tYUV4cHIoYXN0OiBvLkNvbW1hRXhwciwgY29udGV4dDogQ29udGV4dCk6IG5ldmVyIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ01ldGhvZCBub3QgaW1wbGVtZW50ZWQuJyk7XG4gIH1cblxuICB2aXNpdFdyYXBwZWROb2RlRXhwcihhc3Q6IG8uV3JhcHBlZE5vZGVFeHByPGFueT4sIF9jb250ZXh0OiBDb250ZXh0KTogYW55IHtcbiAgICB0aGlzLnJlY29yZFdyYXBwZWROb2RlKGFzdCk7XG4gICAgcmV0dXJuIGFzdC5ub2RlO1xuICB9XG5cbiAgdmlzaXRUeXBlb2ZFeHByKGFzdDogby5UeXBlb2ZFeHByLCBjb250ZXh0OiBDb250ZXh0KTogVEV4cHJlc3Npb24ge1xuICAgIHJldHVybiB0aGlzLmZhY3RvcnkuY3JlYXRlVHlwZU9mRXhwcmVzc2lvbihhc3QuZXhwci52aXNpdEV4cHJlc3Npb24odGhpcywgY29udGV4dCkpO1xuICB9XG5cbiAgdmlzaXRVbmFyeU9wZXJhdG9yRXhwcihhc3Q6IG8uVW5hcnlPcGVyYXRvckV4cHIsIGNvbnRleHQ6IENvbnRleHQpOiBURXhwcmVzc2lvbiB7XG4gICAgaWYgKCFVTkFSWV9PUEVSQVRPUlMuaGFzKGFzdC5vcGVyYXRvcikpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVW5rbm93biB1bmFyeSBvcGVyYXRvcjogJHtvLlVuYXJ5T3BlcmF0b3JbYXN0Lm9wZXJhdG9yXX1gKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZmFjdG9yeS5jcmVhdGVVbmFyeUV4cHJlc3Npb24oXG4gICAgICAgIFVOQVJZX09QRVJBVE9SUy5nZXQoYXN0Lm9wZXJhdG9yKSEsIGFzdC5leHByLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjb250ZXh0KSk7XG4gIH1cblxuICBwcml2YXRlIHZpc2l0U3RhdGVtZW50cyhzdGF0ZW1lbnRzOiBvLlN0YXRlbWVudFtdLCBjb250ZXh0OiBDb250ZXh0KTogVFN0YXRlbWVudFtdIHtcbiAgICByZXR1cm4gc3RhdGVtZW50cy5tYXAoc3RtdCA9PiBzdG10LnZpc2l0U3RhdGVtZW50KHRoaXMsIGNvbnRleHQpKVxuICAgICAgICAuZmlsdGVyKHN0bXQgPT4gc3RtdCAhPT0gdW5kZWZpbmVkKTtcbiAgfVxuXG4gIHByaXZhdGUgc2V0U291cmNlTWFwUmFuZ2U8VCBleHRlbmRzIFRFeHByZXNzaW9ufFRTdGF0ZW1lbnQ+KGFzdDogVCwgc3Bhbjogby5QYXJzZVNvdXJjZVNwYW58bnVsbCk6XG4gICAgICBUIHtcbiAgICByZXR1cm4gdGhpcy5mYWN0b3J5LnNldFNvdXJjZU1hcFJhbmdlKGFzdCwgY3JlYXRlUmFuZ2Uoc3BhbikpO1xuICB9XG5cbiAgcHJpdmF0ZSBhdHRhY2hDb21tZW50cyhzdGF0ZW1lbnQ6IFRTdGF0ZW1lbnQsIGxlYWRpbmdDb21tZW50czogby5MZWFkaW5nQ29tbWVudFtdfHVuZGVmaW5lZCk6XG4gICAgICBUU3RhdGVtZW50IHtcbiAgICBpZiAobGVhZGluZ0NvbW1lbnRzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMuZmFjdG9yeS5hdHRhY2hDb21tZW50cyhzdGF0ZW1lbnQsIGxlYWRpbmdDb21tZW50cyk7XG4gICAgfVxuICAgIHJldHVybiBzdGF0ZW1lbnQ7XG4gIH1cbn1cblxuLyoqXG4gKiBDb252ZXJ0IGEgY29va2VkLXJhdyBzdHJpbmcgb2JqZWN0IGludG8gb25lIHRoYXQgY2FuIGJlIHVzZWQgYnkgdGhlIEFTVCBmYWN0b3JpZXMuXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZVRlbXBsYXRlRWxlbWVudChcbiAgICB7Y29va2VkLCByYXcsIHJhbmdlfToge2Nvb2tlZDogc3RyaW5nLCByYXc6IHN0cmluZywgcmFuZ2U6IG8uUGFyc2VTb3VyY2VTcGFufG51bGx9KTpcbiAgICBUZW1wbGF0ZUVsZW1lbnQge1xuICByZXR1cm4ge2Nvb2tlZCwgcmF3LCByYW5nZTogY3JlYXRlUmFuZ2UocmFuZ2UpfTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGFuIE91dHB1dEFTVCBzb3VyY2Utc3BhbiBpbnRvIGEgcmFuZ2UgdGhhdCBjYW4gYmUgdXNlZCBieSB0aGUgQVNUIGZhY3Rvcmllcy5cbiAqL1xuZnVuY3Rpb24gY3JlYXRlUmFuZ2Uoc3Bhbjogby5QYXJzZVNvdXJjZVNwYW58bnVsbCk6IFNvdXJjZU1hcFJhbmdlfG51bGwge1xuICBpZiAoc3BhbiA9PT0gbnVsbCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGNvbnN0IHtzdGFydCwgZW5kfSA9IHNwYW47XG4gIGNvbnN0IHt1cmwsIGNvbnRlbnR9ID0gc3RhcnQuZmlsZTtcbiAgaWYgKCF1cmwpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICByZXR1cm4ge1xuICAgIHVybCxcbiAgICBjb250ZW50LFxuICAgIHN0YXJ0OiB7b2Zmc2V0OiBzdGFydC5vZmZzZXQsIGxpbmU6IHN0YXJ0LmxpbmUsIGNvbHVtbjogc3RhcnQuY29sfSxcbiAgICBlbmQ6IHtvZmZzZXQ6IGVuZC5vZmZzZXQsIGxpbmU6IGVuZC5saW5lLCBjb2x1bW46IGVuZC5jb2x9LFxuICB9O1xufVxuIl19