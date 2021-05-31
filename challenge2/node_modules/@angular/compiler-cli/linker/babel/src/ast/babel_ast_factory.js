(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/linker/babel/src/ast/babel_ast_factory", ["require", "exports", "@babel/types", "@angular/compiler-cli/linker"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BabelAstFactory = void 0;
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var t = require("@babel/types");
    var linker_1 = require("@angular/compiler-cli/linker");
    /**
     * A Babel flavored implementation of the AstFactory.
     */
    var BabelAstFactory = /** @class */ (function () {
        function BabelAstFactory(
        /** The absolute path to the source file being compiled. */
        sourceUrl) {
            this.sourceUrl = sourceUrl;
            this.createArrayLiteral = t.arrayExpression;
            this.createBlock = t.blockStatement;
            this.createConditional = t.conditionalExpression;
            this.createExpressionStatement = t.expressionStatement;
            this.createIdentifier = t.identifier;
            this.createIfStatement = t.ifStatement;
            this.createNewExpression = t.newExpression;
            this.createParenthesizedExpression = t.parenthesizedExpression;
            this.createReturnStatement = t.returnStatement;
            this.createThrowStatement = t.throwStatement;
            this.createUnaryExpression = t.unaryExpression;
        }
        BabelAstFactory.prototype.attachComments = function (statement, leadingComments) {
            // We must process the comments in reverse because `t.addComment()` will add new ones in front.
            for (var i = leadingComments.length - 1; i >= 0; i--) {
                var comment = leadingComments[i];
                t.addComment(statement, 'leading', comment.toString(), !comment.multiline);
            }
        };
        BabelAstFactory.prototype.createAssignment = function (target, value) {
            linker_1.assert(target, isLExpression, 'must be a left hand side expression');
            return t.assignmentExpression('=', target, value);
        };
        BabelAstFactory.prototype.createBinaryExpression = function (leftOperand, operator, rightOperand) {
            switch (operator) {
                case '&&':
                case '||':
                case '??':
                    return t.logicalExpression(operator, leftOperand, rightOperand);
                default:
                    return t.binaryExpression(operator, leftOperand, rightOperand);
            }
        };
        BabelAstFactory.prototype.createCallExpression = function (callee, args, pure) {
            var call = t.callExpression(callee, args);
            if (pure) {
                t.addComment(call, 'leading', ' @__PURE__ ', /* line */ false);
            }
            return call;
        };
        BabelAstFactory.prototype.createElementAccess = function (expression, element) {
            return t.memberExpression(expression, element, /* computed */ true);
        };
        BabelAstFactory.prototype.createFunctionDeclaration = function (functionName, parameters, body) {
            linker_1.assert(body, t.isBlockStatement, 'a block');
            return t.functionDeclaration(t.identifier(functionName), parameters.map(function (param) { return t.identifier(param); }), body);
        };
        BabelAstFactory.prototype.createFunctionExpression = function (functionName, parameters, body) {
            linker_1.assert(body, t.isBlockStatement, 'a block');
            var name = functionName !== null ? t.identifier(functionName) : null;
            return t.functionExpression(name, parameters.map(function (param) { return t.identifier(param); }), body);
        };
        BabelAstFactory.prototype.createLiteral = function (value) {
            if (typeof value === 'string') {
                return t.stringLiteral(value);
            }
            else if (typeof value === 'number') {
                return t.numericLiteral(value);
            }
            else if (typeof value === 'boolean') {
                return t.booleanLiteral(value);
            }
            else if (value === undefined) {
                return t.identifier('undefined');
            }
            else if (value === null) {
                return t.nullLiteral();
            }
            else {
                throw new Error("Invalid literal: " + value + " (" + typeof value + ")");
            }
        };
        BabelAstFactory.prototype.createObjectLiteral = function (properties) {
            return t.objectExpression(properties.map(function (prop) {
                var key = prop.quoted ? t.stringLiteral(prop.propertyName) : t.identifier(prop.propertyName);
                return t.objectProperty(key, prop.value);
            }));
        };
        BabelAstFactory.prototype.createPropertyAccess = function (expression, propertyName) {
            return t.memberExpression(expression, t.identifier(propertyName), /* computed */ false);
        };
        BabelAstFactory.prototype.createTaggedTemplate = function (tag, template) {
            var _this = this;
            var elements = template.elements.map(function (element, i) { return _this.setSourceMapRange(t.templateElement(element, i === template.elements.length - 1), element.range); });
            return t.taggedTemplateExpression(tag, t.templateLiteral(elements, template.expressions));
        };
        BabelAstFactory.prototype.createTypeOfExpression = function (expression) {
            return t.unaryExpression('typeof', expression);
        };
        BabelAstFactory.prototype.createVariableDeclaration = function (variableName, initializer, type) {
            return t.variableDeclaration(type, [t.variableDeclarator(t.identifier(variableName), initializer)]);
        };
        BabelAstFactory.prototype.setSourceMapRange = function (node, sourceMapRange) {
            if (sourceMapRange === null) {
                return node;
            }
            node.loc = {
                // Add in the filename so that we can map to external template files.
                // Note that Babel gets confused if you specify a filename when it is the original source
                // file. This happens when the template is inline, in which case just use `undefined`.
                filename: sourceMapRange.url !== this.sourceUrl ? sourceMapRange.url : undefined,
                start: {
                    line: sourceMapRange.start.line + 1,
                    column: sourceMapRange.start.column,
                },
                end: {
                    line: sourceMapRange.end.line + 1,
                    column: sourceMapRange.end.column,
                },
            }; // Needed because the Babel typings for `loc` don't include `filename`.
            node.start = sourceMapRange.start.offset;
            node.end = sourceMapRange.end.offset;
            return node;
        };
        return BabelAstFactory;
    }());
    exports.BabelAstFactory = BabelAstFactory;
    function isLExpression(expr) {
        // Some LVal types are not expressions, which prevents us from using `t.isLVal()`
        // directly with `assert()`.
        return t.isLVal(expr);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFiZWxfYXN0X2ZhY3RvcnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvbGlua2VyL2JhYmVsL3NyYy9hc3QvYmFiZWxfYXN0X2ZhY3RvcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0lBQUE7Ozs7OztPQU1HO0lBQ0gsZ0NBQWtDO0lBRWxDLHVEQUEwQztJQUcxQzs7T0FFRztJQUNIO1FBQ0U7UUFDSSwyREFBMkQ7UUFDbkQsU0FBaUI7WUFBakIsY0FBUyxHQUFULFNBQVMsQ0FBUTtZQVU3Qix1QkFBa0IsR0FBRyxDQUFDLENBQUMsZUFBZSxDQUFDO1lBb0J2QyxnQkFBVyxHQUFHLENBQUMsQ0FBQyxjQUFjLENBQUM7WUFVL0Isc0JBQWlCLEdBQUcsQ0FBQyxDQUFDLHFCQUFxQixDQUFDO1lBTTVDLDhCQUF5QixHQUFHLENBQUMsQ0FBQyxtQkFBbUIsQ0FBQztZQWdCbEQscUJBQWdCLEdBQUcsQ0FBQyxDQUFDLFVBQVUsQ0FBQztZQUVoQyxzQkFBaUIsR0FBRyxDQUFDLENBQUMsV0FBVyxDQUFDO1lBa0JsQyx3QkFBbUIsR0FBRyxDQUFDLENBQUMsYUFBYSxDQUFDO1lBVXRDLGtDQUE2QixHQUFHLENBQUMsQ0FBQyx1QkFBdUIsQ0FBQztZQU0xRCwwQkFBcUIsR0FBRyxDQUFDLENBQUMsZUFBZSxDQUFDO1lBUzFDLHlCQUFvQixHQUFHLENBQUMsQ0FBQyxjQUFjLENBQUM7WUFNeEMsMEJBQXFCLEdBQUcsQ0FBQyxDQUFDLGVBQWUsQ0FBQztRQWpIVixDQUFDO1FBRWpDLHdDQUFjLEdBQWQsVUFBZSxTQUFzQixFQUFFLGVBQWlDO1lBQ3RFLCtGQUErRjtZQUMvRixLQUFLLElBQUksQ0FBQyxHQUFHLGVBQWUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQ3BELElB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QUUsY0FBYyxDQUFDLEdBQUcsS0FBSyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxTQUFTO2dCQUNoRixLQUFLLEVBQUU7b0JBQ0wsSUFBSSxFQUFFLGNBQWMsQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLENBQUM7b0JBQ25DLE1BQU0sRUFBRSxjQUFjLENBQUMsS0FBSyxDQUFDLE1BQU07aUJBQ3BDO2dCQUNELEdBQUcsRUFBRTtvQkFDSCxJQUFJLEVBQUUsY0FBYyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsQ0FBQztvQkFDakMsTUFBTSxFQUFFLGNBQWMsQ0FBQyxHQUFHLENBQUMsTUFBTTtpQkFDbEM7YUFDSyxDQUFDLENBQUUsdUVBQXVFO1lBQ2xGLElBQUksQ0FBQyxLQUFLLEdBQUcsY0FBYyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7WUFDekMsSUFBSSxDQUFDLEdBQUcsR0FBRyxjQUFjLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQztZQUVyQyxPQUFPLElBQUksQ0FBQztRQUNkLENBQUM7UUFDSCxzQkFBQztJQUFELENBQUMsQUFySkQsSUFxSkM7SUFySlksMENBQWU7SUF1SjVCLFNBQVMsYUFBYSxDQUFDLElBQWtCO1FBQ3ZDLGlGQUFpRjtRQUNqRiw0QkFBNEI7UUFDNUIsT0FBTyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3hCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCAqIGFzIHQgZnJvbSAnQGJhYmVsL3R5cGVzJztcblxuaW1wb3J0IHthc3NlcnR9IGZyb20gJy4uLy4uLy4uLy4uL2xpbmtlcic7XG5pbXBvcnQge0FzdEZhY3RvcnksIEJpbmFyeU9wZXJhdG9yLCBMZWFkaW5nQ29tbWVudCwgT2JqZWN0TGl0ZXJhbFByb3BlcnR5LCBTb3VyY2VNYXBSYW5nZSwgVGVtcGxhdGVMaXRlcmFsLCBWYXJpYWJsZURlY2xhcmF0aW9uVHlwZX0gZnJvbSAnLi4vLi4vLi4vLi4vc3JjL25ndHNjL3RyYW5zbGF0b3InO1xuXG4vKipcbiAqIEEgQmFiZWwgZmxhdm9yZWQgaW1wbGVtZW50YXRpb24gb2YgdGhlIEFzdEZhY3RvcnkuXG4gKi9cbmV4cG9ydCBjbGFzcyBCYWJlbEFzdEZhY3RvcnkgaW1wbGVtZW50cyBBc3RGYWN0b3J5PHQuU3RhdGVtZW50LCB0LkV4cHJlc3Npb24+IHtcbiAgY29uc3RydWN0b3IoXG4gICAgICAvKiogVGhlIGFic29sdXRlIHBhdGggdG8gdGhlIHNvdXJjZSBmaWxlIGJlaW5nIGNvbXBpbGVkLiAqL1xuICAgICAgcHJpdmF0ZSBzb3VyY2VVcmw6IHN0cmluZykge31cblxuICBhdHRhY2hDb21tZW50cyhzdGF0ZW1lbnQ6IHQuU3RhdGVtZW50LCBsZWFkaW5nQ29tbWVudHM6IExlYWRpbmdDb21tZW50W10pOiB2b2lkIHtcbiAgICAvLyBXZSBtdXN0IHByb2Nlc3MgdGhlIGNvbW1lbnRzIGluIHJldmVyc2UgYmVjYXVzZSBgdC5hZGRDb21tZW50KClgIHdpbGwgYWRkIG5ldyBvbmVzIGluIGZyb250LlxuICAgIGZvciAobGV0IGkgPSBsZWFkaW5nQ29tbWVudHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgIGNvbnN0IGNvbW1lbnQgPSBsZWFkaW5nQ29tbWVudHNbaV07XG4gICAgICB0LmFkZENvbW1lbnQoc3RhdGVtZW50LCAnbGVhZGluZycsIGNvbW1lbnQudG9TdHJpbmcoKSwgIWNvbW1lbnQubXVsdGlsaW5lKTtcbiAgICB9XG4gIH1cblxuICBjcmVhdGVBcnJheUxpdGVyYWwgPSB0LmFycmF5RXhwcmVzc2lvbjtcblxuICBjcmVhdGVBc3NpZ25tZW50KHRhcmdldDogdC5FeHByZXNzaW9uLCB2YWx1ZTogdC5FeHByZXNzaW9uKTogdC5FeHByZXNzaW9uIHtcbiAgICBhc3NlcnQodGFyZ2V0LCBpc0xFeHByZXNzaW9uLCAnbXVzdCBiZSBhIGxlZnQgaGFuZCBzaWRlIGV4cHJlc3Npb24nKTtcbiAgICByZXR1cm4gdC5hc3NpZ25tZW50RXhwcmVzc2lvbignPScsIHRhcmdldCwgdmFsdWUpO1xuICB9XG5cbiAgY3JlYXRlQmluYXJ5RXhwcmVzc2lvbihcbiAgICAgIGxlZnRPcGVyYW5kOiB0LkV4cHJlc3Npb24sIG9wZXJhdG9yOiBCaW5hcnlPcGVyYXRvcixcbiAgICAgIHJpZ2h0T3BlcmFuZDogdC5FeHByZXNzaW9uKTogdC5FeHByZXNzaW9uIHtcbiAgICBzd2l0Y2ggKG9wZXJhdG9yKSB7XG4gICAgICBjYXNlICcmJic6XG4gICAgICBjYXNlICd8fCc6XG4gICAgICBjYXNlICc/Pyc6XG4gICAgICAgIHJldHVybiB0LmxvZ2ljYWxFeHByZXNzaW9uKG9wZXJhdG9yLCBsZWZ0T3BlcmFuZCwgcmlnaHRPcGVyYW5kKTtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiB0LmJpbmFyeUV4cHJlc3Npb24ob3BlcmF0b3IsIGxlZnRPcGVyYW5kLCByaWdodE9wZXJhbmQpO1xuICAgIH1cbiAgfVxuXG4gIGNyZWF0ZUJsb2NrID0gdC5ibG9ja1N0YXRlbWVudDtcblxuICBjcmVhdGVDYWxsRXhwcmVzc2lvbihjYWxsZWU6IHQuRXhwcmVzc2lvbiwgYXJnczogdC5FeHByZXNzaW9uW10sIHB1cmU6IGJvb2xlYW4pOiB0LkV4cHJlc3Npb24ge1xuICAgIGNvbnN0IGNhbGwgPSB0LmNhbGxFeHByZXNzaW9uKGNhbGxlZSwgYXJncyk7XG4gICAgaWYgKHB1cmUpIHtcbiAgICAgIHQuYWRkQ29tbWVudChjYWxsLCAnbGVhZGluZycsICcgQF9fUFVSRV9fICcsIC8qIGxpbmUgKi8gZmFsc2UpO1xuICAgIH1cbiAgICByZXR1cm4gY2FsbDtcbiAgfVxuXG4gIGNyZWF0ZUNvbmRpdGlvbmFsID0gdC5jb25kaXRpb25hbEV4cHJlc3Npb247XG5cbiAgY3JlYXRlRWxlbWVudEFjY2VzcyhleHByZXNzaW9uOiB0LkV4cHJlc3Npb24sIGVsZW1lbnQ6IHQuRXhwcmVzc2lvbik6IHQuRXhwcmVzc2lvbiB7XG4gICAgcmV0dXJuIHQubWVtYmVyRXhwcmVzc2lvbihleHByZXNzaW9uLCBlbGVtZW50LCAvKiBjb21wdXRlZCAqLyB0cnVlKTtcbiAgfVxuXG4gIGNyZWF0ZUV4cHJlc3Npb25TdGF0ZW1lbnQgPSB0LmV4cHJlc3Npb25TdGF0ZW1lbnQ7XG5cbiAgY3JlYXRlRnVuY3Rpb25EZWNsYXJhdGlvbihmdW5jdGlvbk5hbWU6IHN0cmluZywgcGFyYW1ldGVyczogc3RyaW5nW10sIGJvZHk6IHQuU3RhdGVtZW50KTpcbiAgICAgIHQuU3RhdGVtZW50IHtcbiAgICBhc3NlcnQoYm9keSwgdC5pc0Jsb2NrU3RhdGVtZW50LCAnYSBibG9jaycpO1xuICAgIHJldHVybiB0LmZ1bmN0aW9uRGVjbGFyYXRpb24oXG4gICAgICAgIHQuaWRlbnRpZmllcihmdW5jdGlvbk5hbWUpLCBwYXJhbWV0ZXJzLm1hcChwYXJhbSA9PiB0LmlkZW50aWZpZXIocGFyYW0pKSwgYm9keSk7XG4gIH1cblxuICBjcmVhdGVGdW5jdGlvbkV4cHJlc3Npb24oZnVuY3Rpb25OYW1lOiBzdHJpbmd8bnVsbCwgcGFyYW1ldGVyczogc3RyaW5nW10sIGJvZHk6IHQuU3RhdGVtZW50KTpcbiAgICAgIHQuRXhwcmVzc2lvbiB7XG4gICAgYXNzZXJ0KGJvZHksIHQuaXNCbG9ja1N0YXRlbWVudCwgJ2EgYmxvY2snKTtcbiAgICBjb25zdCBuYW1lID0gZnVuY3Rpb25OYW1lICE9PSBudWxsID8gdC5pZGVudGlmaWVyKGZ1bmN0aW9uTmFtZSkgOiBudWxsO1xuICAgIHJldHVybiB0LmZ1bmN0aW9uRXhwcmVzc2lvbihuYW1lLCBwYXJhbWV0ZXJzLm1hcChwYXJhbSA9PiB0LmlkZW50aWZpZXIocGFyYW0pKSwgYm9keSk7XG4gIH1cblxuICBjcmVhdGVJZGVudGlmaWVyID0gdC5pZGVudGlmaWVyO1xuXG4gIGNyZWF0ZUlmU3RhdGVtZW50ID0gdC5pZlN0YXRlbWVudDtcblxuICBjcmVhdGVMaXRlcmFsKHZhbHVlOiBzdHJpbmd8bnVtYmVyfGJvb2xlYW58bnVsbHx1bmRlZmluZWQpOiB0LkV4cHJlc3Npb24ge1xuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4gdC5zdHJpbmdMaXRlcmFsKHZhbHVlKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicpIHtcbiAgICAgIHJldHVybiB0Lm51bWVyaWNMaXRlcmFsKHZhbHVlKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICByZXR1cm4gdC5ib29sZWFuTGl0ZXJhbCh2YWx1ZSk7XG4gICAgfSBlbHNlIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gdC5pZGVudGlmaWVyKCd1bmRlZmluZWQnKTtcbiAgICB9IGVsc2UgaWYgKHZhbHVlID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gdC5udWxsTGl0ZXJhbCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgbGl0ZXJhbDogJHt2YWx1ZX0gKCR7dHlwZW9mIHZhbHVlfSlgKTtcbiAgICB9XG4gIH1cblxuICBjcmVhdGVOZXdFeHByZXNzaW9uID0gdC5uZXdFeHByZXNzaW9uO1xuXG4gIGNyZWF0ZU9iamVjdExpdGVyYWwocHJvcGVydGllczogT2JqZWN0TGl0ZXJhbFByb3BlcnR5PHQuRXhwcmVzc2lvbj5bXSk6IHQuRXhwcmVzc2lvbiB7XG4gICAgcmV0dXJuIHQub2JqZWN0RXhwcmVzc2lvbihwcm9wZXJ0aWVzLm1hcChwcm9wID0+IHtcbiAgICAgIGNvbnN0IGtleSA9XG4gICAgICAgICAgcHJvcC5xdW90ZWQgPyB0LnN0cmluZ0xpdGVyYWwocHJvcC5wcm9wZXJ0eU5hbWUpIDogdC5pZGVudGlmaWVyKHByb3AucHJvcGVydHlOYW1lKTtcbiAgICAgIHJldHVybiB0Lm9iamVjdFByb3BlcnR5KGtleSwgcHJvcC52YWx1ZSk7XG4gICAgfSkpO1xuICB9XG5cbiAgY3JlYXRlUGFyZW50aGVzaXplZEV4cHJlc3Npb24gPSB0LnBhcmVudGhlc2l6ZWRFeHByZXNzaW9uO1xuXG4gIGNyZWF0ZVByb3BlcnR5QWNjZXNzKGV4cHJlc3Npb246IHQuRXhwcmVzc2lvbiwgcHJvcGVydHlOYW1lOiBzdHJpbmcpOiB0LkV4cHJlc3Npb24ge1xuICAgIHJldHVybiB0Lm1lbWJlckV4cHJlc3Npb24oZXhwcmVzc2lvbiwgdC5pZGVudGlmaWVyKHByb3BlcnR5TmFtZSksIC8qIGNvbXB1dGVkICovIGZhbHNlKTtcbiAgfVxuXG4gIGNyZWF0ZVJldHVyblN0YXRlbWVudCA9IHQucmV0dXJuU3RhdGVtZW50O1xuXG4gIGNyZWF0ZVRhZ2dlZFRlbXBsYXRlKHRhZzogdC5FeHByZXNzaW9uLCB0ZW1wbGF0ZTogVGVtcGxhdGVMaXRlcmFsPHQuRXhwcmVzc2lvbj4pOiB0LkV4cHJlc3Npb24ge1xuICAgIGNvbnN0IGVsZW1lbnRzID0gdGVtcGxhdGUuZWxlbWVudHMubWFwKFxuICAgICAgICAoZWxlbWVudCwgaSkgPT4gdGhpcy5zZXRTb3VyY2VNYXBSYW5nZShcbiAgICAgICAgICAgIHQudGVtcGxhdGVFbGVtZW50KGVsZW1lbnQsIGkgPT09IHRlbXBsYXRlLmVsZW1lbnRzLmxlbmd0aCAtIDEpLCBlbGVtZW50LnJhbmdlKSk7XG4gICAgcmV0dXJuIHQudGFnZ2VkVGVtcGxhdGVFeHByZXNzaW9uKHRhZywgdC50ZW1wbGF0ZUxpdGVyYWwoZWxlbWVudHMsIHRlbXBsYXRlLmV4cHJlc3Npb25zKSk7XG4gIH1cblxuICBjcmVhdGVUaHJvd1N0YXRlbWVudCA9IHQudGhyb3dTdGF0ZW1lbnQ7XG5cbiAgY3JlYXRlVHlwZU9mRXhwcmVzc2lvbihleHByZXNzaW9uOiB0LkV4cHJlc3Npb24pOiB0LkV4cHJlc3Npb24ge1xuICAgIHJldHVybiB0LnVuYXJ5RXhwcmVzc2lvbigndHlwZW9mJywgZXhwcmVzc2lvbik7XG4gIH1cblxuICBjcmVhdGVVbmFyeUV4cHJlc3Npb24gPSB0LnVuYXJ5RXhwcmVzc2lvbjtcblxuICBjcmVhdGVWYXJpYWJsZURlY2xhcmF0aW9uKFxuICAgICAgdmFyaWFibGVOYW1lOiBzdHJpbmcsIGluaXRpYWxpemVyOiB0LkV4cHJlc3Npb258bnVsbCxcbiAgICAgIHR5cGU6IFZhcmlhYmxlRGVjbGFyYXRpb25UeXBlKTogdC5TdGF0ZW1lbnQge1xuICAgIHJldHVybiB0LnZhcmlhYmxlRGVjbGFyYXRpb24oXG4gICAgICAgIHR5cGUsIFt0LnZhcmlhYmxlRGVjbGFyYXRvcih0LmlkZW50aWZpZXIodmFyaWFibGVOYW1lKSwgaW5pdGlhbGl6ZXIpXSk7XG4gIH1cblxuICBzZXRTb3VyY2VNYXBSYW5nZTxUIGV4dGVuZHMgdC5TdGF0ZW1lbnR8dC5FeHByZXNzaW9ufHQuVGVtcGxhdGVFbGVtZW50PihcbiAgICAgIG5vZGU6IFQsIHNvdXJjZU1hcFJhbmdlOiBTb3VyY2VNYXBSYW5nZXxudWxsKTogVCB7XG4gICAgaWYgKHNvdXJjZU1hcFJhbmdlID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gbm9kZTtcbiAgICB9XG4gICAgbm9kZS5sb2MgPSB7XG4gICAgICAvLyBBZGQgaW4gdGhlIGZpbGVuYW1lIHNvIHRoYXQgd2UgY2FuIG1hcCB0byBleHRlcm5hbCB0ZW1wbGF0ZSBmaWxlcy5cbiAgICAgIC8vIE5vdGUgdGhhdCBCYWJlbCBnZXRzIGNvbmZ1c2VkIGlmIHlvdSBzcGVjaWZ5IGEgZmlsZW5hbWUgd2hlbiBpdCBpcyB0aGUgb3JpZ2luYWwgc291cmNlXG4gICAgICAvLyBmaWxlLiBUaGlzIGhhcHBlbnMgd2hlbiB0aGUgdGVtcGxhdGUgaXMgaW5saW5lLCBpbiB3aGljaCBjYXNlIGp1c3QgdXNlIGB1bmRlZmluZWRgLlxuICAgICAgZmlsZW5hbWU6IHNvdXJjZU1hcFJhbmdlLnVybCAhPT0gdGhpcy5zb3VyY2VVcmwgPyBzb3VyY2VNYXBSYW5nZS51cmwgOiB1bmRlZmluZWQsXG4gICAgICBzdGFydDoge1xuICAgICAgICBsaW5lOiBzb3VyY2VNYXBSYW5nZS5zdGFydC5saW5lICsgMSwgIC8vIGxpbmVzIGFyZSAxLWJhc2VkIGluIEJhYmVsLlxuICAgICAgICBjb2x1bW46IHNvdXJjZU1hcFJhbmdlLnN0YXJ0LmNvbHVtbixcbiAgICAgIH0sXG4gICAgICBlbmQ6IHtcbiAgICAgICAgbGluZTogc291cmNlTWFwUmFuZ2UuZW5kLmxpbmUgKyAxLCAgLy8gbGluZXMgYXJlIDEtYmFzZWQgaW4gQmFiZWwuXG4gICAgICAgIGNvbHVtbjogc291cmNlTWFwUmFuZ2UuZW5kLmNvbHVtbixcbiAgICAgIH0sXG4gICAgfSBhcyBhbnk7ICAvLyBOZWVkZWQgYmVjYXVzZSB0aGUgQmFiZWwgdHlwaW5ncyBmb3IgYGxvY2AgZG9uJ3QgaW5jbHVkZSBgZmlsZW5hbWVgLlxuICAgIG5vZGUuc3RhcnQgPSBzb3VyY2VNYXBSYW5nZS5zdGFydC5vZmZzZXQ7XG4gICAgbm9kZS5lbmQgPSBzb3VyY2VNYXBSYW5nZS5lbmQub2Zmc2V0O1xuXG4gICAgcmV0dXJuIG5vZGU7XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNMRXhwcmVzc2lvbihleHByOiB0LkV4cHJlc3Npb24pOiBleHByIGlzIEV4dHJhY3Q8dC5MVmFsLCB0LkV4cHJlc3Npb24+IHtcbiAgLy8gU29tZSBMVmFsIHR5cGVzIGFyZSBub3QgZXhwcmVzc2lvbnMsIHdoaWNoIHByZXZlbnRzIHVzIGZyb20gdXNpbmcgYHQuaXNMVmFsKClgXG4gIC8vIGRpcmVjdGx5IHdpdGggYGFzc2VydCgpYC5cbiAgcmV0dXJuIHQuaXNMVmFsKGV4cHIpO1xufVxuIl19