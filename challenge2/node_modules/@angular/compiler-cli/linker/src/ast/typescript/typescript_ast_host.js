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
        define("@angular/compiler-cli/linker/src/ast/typescript/typescript_ast_host", ["require", "exports", "tslib", "typescript", "@angular/compiler-cli/linker/src/fatal_linker_error", "@angular/compiler-cli/linker/src/ast/utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TypeScriptAstHost = void 0;
    var tslib_1 = require("tslib");
    var ts = require("typescript");
    var fatal_linker_error_1 = require("@angular/compiler-cli/linker/src/fatal_linker_error");
    var utils_1 = require("@angular/compiler-cli/linker/src/ast/utils");
    /**
     * This implementation of `AstHost` is able to get information from TypeScript AST nodes.
     *
     * This host is not actually used at runtime in the current code.
     *
     * It is implemented here to ensure that the `AstHost` abstraction is not unfairly skewed towards
     * the Babel implementation. It could also provide a basis for a 3rd TypeScript compiler plugin to
     * do linking in the future.
     */
    var TypeScriptAstHost = /** @class */ (function () {
        function TypeScriptAstHost() {
            this.isStringLiteral = ts.isStringLiteral;
            this.isNumericLiteral = ts.isNumericLiteral;
            this.isArrayLiteral = ts.isArrayLiteralExpression;
            this.isObjectLiteral = ts.isObjectLiteralExpression;
            this.isCallExpression = ts.isCallExpression;
        }
        TypeScriptAstHost.prototype.getSymbolName = function (node) {
            if (ts.isIdentifier(node)) {
                return node.text;
            }
            else if (ts.isPropertyAccessExpression(node) && ts.isIdentifier(node.name)) {
                return node.name.text;
            }
            else {
                return null;
            }
        };
        TypeScriptAstHost.prototype.parseStringLiteral = function (str) {
            utils_1.assert(str, this.isStringLiteral, 'a string literal');
            return str.text;
        };
        TypeScriptAstHost.prototype.parseNumericLiteral = function (num) {
            utils_1.assert(num, this.isNumericLiteral, 'a numeric literal');
            return parseInt(num.text);
        };
        TypeScriptAstHost.prototype.isBooleanLiteral = function (node) {
            return isBooleanLiteral(node) || isMinifiedBooleanLiteral(node);
        };
        TypeScriptAstHost.prototype.parseBooleanLiteral = function (bool) {
            if (isBooleanLiteral(bool)) {
                return bool.kind === ts.SyntaxKind.TrueKeyword;
            }
            else if (isMinifiedBooleanLiteral(bool)) {
                return !(+bool.operand.text);
            }
            else {
                throw new fatal_linker_error_1.FatalLinkerError(bool, 'Unsupported syntax, expected a boolean literal.');
            }
        };
        TypeScriptAstHost.prototype.parseArrayLiteral = function (array) {
            utils_1.assert(array, this.isArrayLiteral, 'an array literal');
            return array.elements.map(function (element) {
                utils_1.assert(element, isNotEmptyElement, 'element in array not to be empty');
                utils_1.assert(element, isNotSpreadElement, 'element in array not to use spread syntax');
                return element;
            });
        };
        TypeScriptAstHost.prototype.parseObjectLiteral = function (obj) {
            var e_1, _a;
            utils_1.assert(obj, this.isObjectLiteral, 'an object literal');
            var result = new Map();
            try {
                for (var _b = tslib_1.__values(obj.properties), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var property = _c.value;
                    utils_1.assert(property, ts.isPropertyAssignment, 'a property assignment');
                    utils_1.assert(property.name, isPropertyName, 'a property name');
                    result.set(property.name.text, property.initializer);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return result;
        };
        TypeScriptAstHost.prototype.isFunctionExpression = function (node) {
            return ts.isFunctionExpression(node) || ts.isArrowFunction(node);
        };
        TypeScriptAstHost.prototype.parseReturnValue = function (fn) {
            utils_1.assert(fn, this.isFunctionExpression, 'a function');
            if (!ts.isBlock(fn.body)) {
                // it is a simple array function expression: `(...) => expr`
                return fn.body;
            }
            // it is a function (arrow or normal) with a body. E.g.:
            // * `(...) => { stmt; ... }`
            // * `function(...) { stmt; ... }`
            if (fn.body.statements.length !== 1) {
                throw new fatal_linker_error_1.FatalLinkerError(fn.body, 'Unsupported syntax, expected a function body with a single return statement.');
            }
            var stmt = fn.body.statements[0];
            utils_1.assert(stmt, ts.isReturnStatement, 'a function body with a single return statement');
            if (stmt.expression === undefined) {
                throw new fatal_linker_error_1.FatalLinkerError(stmt, 'Unsupported syntax, expected function to return a value.');
            }
            return stmt.expression;
        };
        TypeScriptAstHost.prototype.parseCallee = function (call) {
            utils_1.assert(call, ts.isCallExpression, 'a call expression');
            return call.expression;
        };
        TypeScriptAstHost.prototype.parseArguments = function (call) {
            utils_1.assert(call, ts.isCallExpression, 'a call expression');
            return call.arguments.map(function (arg) {
                utils_1.assert(arg, isNotSpreadElement, 'argument not to use spread syntax');
                return arg;
            });
        };
        TypeScriptAstHost.prototype.getRange = function (node) {
            var file = node.getSourceFile();
            if (file === undefined) {
                throw new fatal_linker_error_1.FatalLinkerError(node, 'Unable to read range for node - it is missing parent information.');
            }
            var startPos = node.getStart();
            var endPos = node.getEnd();
            var _a = ts.getLineAndCharacterOfPosition(file, startPos), startLine = _a.line, startCol = _a.character;
            return { startLine: startLine, startCol: startCol, startPos: startPos, endPos: endPos };
        };
        return TypeScriptAstHost;
    }());
    exports.TypeScriptAstHost = TypeScriptAstHost;
    /**
     * Return true if the expression does not represent an empty element in an array literal.
     * For example in `[,foo]` the first element is "empty".
     */
    function isNotEmptyElement(e) {
        return !ts.isOmittedExpression(e);
    }
    /**
     * Return true if the expression is not a spread element of an array literal.
     * For example in `[x, ...rest]` the `...rest` expression is a spread element.
     */
    function isNotSpreadElement(e) {
        return !ts.isSpreadElement(e);
    }
    /**
     * Return true if the expression can be considered a text based property name.
     */
    function isPropertyName(e) {
        return ts.isIdentifier(e) || ts.isStringLiteral(e) || ts.isNumericLiteral(e);
    }
    /**
     * Return true if the node is either `true` or `false` literals.
     */
    function isBooleanLiteral(node) {
        return node.kind === ts.SyntaxKind.TrueKeyword || node.kind === ts.SyntaxKind.FalseKeyword;
    }
    /**
     * Return true if the node is either `!0` or `!1`.
     */
    function isMinifiedBooleanLiteral(node) {
        return ts.isPrefixUnaryExpression(node) && node.operator === ts.SyntaxKind.ExclamationToken &&
            ts.isNumericLiteral(node.operand) && (node.operand.text === '0' || node.operand.text === '1');
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZXNjcmlwdF9hc3RfaG9zdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9saW5rZXIvc3JjL2FzdC90eXBlc2NyaXB0L3R5cGVzY3JpcHRfYXN0X2hvc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUVILCtCQUFpQztJQUVqQywwRkFBMEQ7SUFFMUQsb0VBQWdDO0lBR2hDOzs7Ozs7OztPQVFHO0lBQ0g7UUFBQTtZQVdFLG9CQUFlLEdBQUcsRUFBRSxDQUFDLGVBQWUsQ0FBQztZQU9yQyxxQkFBZ0IsR0FBRyxFQUFFLENBQUMsZ0JBQWdCLENBQUM7WUFxQnZDLG1CQUFjLEdBQUcsRUFBRSxDQUFDLHdCQUF3QixDQUFDO1lBVzdDLG9CQUFlLEdBQUcsRUFBRSxDQUFDLHlCQUF5QixDQUFDO1lBMEMvQyxxQkFBZ0IsR0FBRyxFQUFFLENBQUMsZ0JBQWdCLENBQUM7UUEwQnpDLENBQUM7UUFySEMseUNBQWEsR0FBYixVQUFjLElBQW1CO1lBQy9CLElBQUksRUFBRSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDekIsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDO2FBQ2xCO2lCQUFNLElBQUksRUFBRSxDQUFDLDBCQUEwQixDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUM1RSxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO2FBQ3ZCO2lCQUFNO2dCQUNMLE9BQU8sSUFBSSxDQUFDO2FBQ2I7UUFDSCxDQUFDO1FBSUQsOENBQWtCLEdBQWxCLFVBQW1CLEdBQWtCO1lBQ25DLGNBQU0sQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLGVBQWUsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO1lBQ3RELE9BQU8sR0FB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LHdCQUF3QixDQUFDLElBQW1CO1FBQ25ELE9BQU8sRUFBRSxDQUFDLHVCQUF1QixDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxRQUFRLEtBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0I7WUFDdkYsRUFBRSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxLQUFLLEdBQUcsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQztJQUNwRyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuXG5pbXBvcnQge0ZhdGFsTGlua2VyRXJyb3J9IGZyb20gJy4uLy4uL2ZhdGFsX2xpbmtlcl9lcnJvcic7XG5pbXBvcnQge0FzdEhvc3QsIFJhbmdlfSBmcm9tICcuLi9hc3RfaG9zdCc7XG5pbXBvcnQge2Fzc2VydH0gZnJvbSAnLi4vdXRpbHMnO1xuXG5cbi8qKlxuICogVGhpcyBpbXBsZW1lbnRhdGlvbiBvZiBgQXN0SG9zdGAgaXMgYWJsZSB0byBnZXQgaW5mb3JtYXRpb24gZnJvbSBUeXBlU2NyaXB0IEFTVCBub2Rlcy5cbiAqXG4gKiBUaGlzIGhvc3QgaXMgbm90IGFjdHVhbGx5IHVzZWQgYXQgcnVudGltZSBpbiB0aGUgY3VycmVudCBjb2RlLlxuICpcbiAqIEl0IGlzIGltcGxlbWVudGVkIGhlcmUgdG8gZW5zdXJlIHRoYXQgdGhlIGBBc3RIb3N0YCBhYnN0cmFjdGlvbiBpcyBub3QgdW5mYWlybHkgc2tld2VkIHRvd2FyZHNcbiAqIHRoZSBCYWJlbCBpbXBsZW1lbnRhdGlvbi4gSXQgY291bGQgYWxzbyBwcm92aWRlIGEgYmFzaXMgZm9yIGEgM3JkIFR5cGVTY3JpcHQgY29tcGlsZXIgcGx1Z2luIHRvXG4gKiBkbyBsaW5raW5nIGluIHRoZSBmdXR1cmUuXG4gKi9cbmV4cG9ydCBjbGFzcyBUeXBlU2NyaXB0QXN0SG9zdCBpbXBsZW1lbnRzIEFzdEhvc3Q8dHMuRXhwcmVzc2lvbj4ge1xuICBnZXRTeW1ib2xOYW1lKG5vZGU6IHRzLkV4cHJlc3Npb24pOiBzdHJpbmd8bnVsbCB7XG4gICAgaWYgKHRzLmlzSWRlbnRpZmllcihub2RlKSkge1xuICAgICAgcmV0dXJuIG5vZGUudGV4dDtcbiAgICB9IGVsc2UgaWYgKHRzLmlzUHJvcGVydHlBY2Nlc3NFeHByZXNzaW9uKG5vZGUpICYmIHRzLmlzSWRlbnRpZmllcihub2RlLm5hbWUpKSB7XG4gICAgICByZXR1cm4gbm9kZS5uYW1lLnRleHQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuXG4gIGlzU3RyaW5nTGl0ZXJhbCA9IHRzLmlzU3RyaW5nTGl0ZXJhbDtcblxuICBwYXJzZVN0cmluZ0xpdGVyYWwoc3RyOiB0cy5FeHByZXNzaW9uKTogc3RyaW5nIHtcbiAgICBhc3NlcnQoc3RyLCB0aGlzLmlzU3RyaW5nTGl0ZXJhbCwgJ2Egc3RyaW5nIGxpdGVyYWwnKTtcbiAgICByZXR1cm4gc3RyLnRleHQ7XG4gIH1cblxuICBpc051bWVyaWNMaXRlcmFsID0gdHMuaXNOdW1lcmljTGl0ZXJhbDtcblxuICBwYXJzZU51bWVyaWNMaXRlcmFsKG51bTogdHMuRXhwcmVzc2lvbik6IG51bWJlciB7XG4gICAgYXNzZXJ0KG51bSwgdGhpcy5pc051bWVyaWNMaXRlcmFsLCAnYSBudW1lcmljIGxpdGVyYWwnKTtcbiAgICByZXR1cm4gcGFyc2VJbnQobnVtLnRleHQpO1xuICB9XG5cbiAgaXNCb29sZWFuTGl0ZXJhbChub2RlOiB0cy5FeHByZXNzaW9uKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGlzQm9vbGVhbkxpdGVyYWwobm9kZSkgfHwgaXNNaW5pZmllZEJvb2xlYW5MaXRlcmFsKG5vZGUpO1xuICB9XG5cbiAgcGFyc2VCb29sZWFuTGl0ZXJhbChib29sOiB0cy5FeHByZXNzaW9uKTogYm9vbGVhbiB7XG4gICAgaWYgKGlzQm9vbGVhbkxpdGVyYWwoYm9vbCkpIHtcbiAgICAgIHJldHVybiBib29sLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuVHJ1ZUtleXdvcmQ7XG4gICAgfSBlbHNlIGlmIChpc01pbmlmaWVkQm9vbGVhbkxpdGVyYWwoYm9vbCkpIHtcbiAgICAgIHJldHVybiAhKCtib29sLm9wZXJhbmQudGV4dCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBGYXRhbExpbmtlckVycm9yKGJvb2wsICdVbnN1cHBvcnRlZCBzeW50YXgsIGV4cGVjdGVkIGEgYm9vbGVhbiBsaXRlcmFsLicpO1xuICAgIH1cbiAgfVxuXG4gIGlzQXJyYXlMaXRlcmFsID0gdHMuaXNBcnJheUxpdGVyYWxFeHByZXNzaW9uO1xuXG4gIHBhcnNlQXJyYXlMaXRlcmFsKGFycmF5OiB0cy5FeHByZXNzaW9uKTogdHMuRXhwcmVzc2lvbltdIHtcbiAgICBhc3NlcnQoYXJyYXksIHRoaXMuaXNBcnJheUxpdGVyYWwsICdhbiBhcnJheSBsaXRlcmFsJyk7XG4gICAgcmV0dXJuIGFycmF5LmVsZW1lbnRzLm1hcChlbGVtZW50ID0+IHtcbiAgICAgIGFzc2VydChlbGVtZW50LCBpc05vdEVtcHR5RWxlbWVudCwgJ2VsZW1lbnQgaW4gYXJyYXkgbm90IHRvIGJlIGVtcHR5Jyk7XG4gICAgICBhc3NlcnQoZWxlbWVudCwgaXNOb3RTcHJlYWRFbGVtZW50LCAnZWxlbWVudCBpbiBhcnJheSBub3QgdG8gdXNlIHNwcmVhZCBzeW50YXgnKTtcbiAgICAgIHJldHVybiBlbGVtZW50O1xuICAgIH0pO1xuICB9XG5cbiAgaXNPYmplY3RMaXRlcmFsID0gdHMuaXNPYmplY3RMaXRlcmFsRXhwcmVzc2lvbjtcblxuICBwYXJzZU9iamVjdExpdGVyYWwob2JqOiB0cy5FeHByZXNzaW9uKTogTWFwPHN0cmluZywgdHMuRXhwcmVzc2lvbj4ge1xuICAgIGFzc2VydChvYmosIHRoaXMuaXNPYmplY3RMaXRlcmFsLCAnYW4gb2JqZWN0IGxpdGVyYWwnKTtcblxuICAgIGNvbnN0IHJlc3VsdCA9IG5ldyBNYXA8c3RyaW5nLCB0cy5FeHByZXNzaW9uPigpO1xuICAgIGZvciAoY29uc3QgcHJvcGVydHkgb2Ygb2JqLnByb3BlcnRpZXMpIHtcbiAgICAgIGFzc2VydChwcm9wZXJ0eSwgdHMuaXNQcm9wZXJ0eUFzc2lnbm1lbnQsICdhIHByb3BlcnR5IGFzc2lnbm1lbnQnKTtcbiAgICAgIGFzc2VydChwcm9wZXJ0eS5uYW1lLCBpc1Byb3BlcnR5TmFtZSwgJ2EgcHJvcGVydHkgbmFtZScpO1xuICAgICAgcmVzdWx0LnNldChwcm9wZXJ0eS5uYW1lLnRleHQsIHByb3BlcnR5LmluaXRpYWxpemVyKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIGlzRnVuY3Rpb25FeHByZXNzaW9uKG5vZGU6IHRzLkV4cHJlc3Npb24pOiBub2RlIGlzIHRzLkZ1bmN0aW9uRXhwcmVzc2lvbnx0cy5BcnJvd0Z1bmN0aW9uIHtcbiAgICByZXR1cm4gdHMuaXNGdW5jdGlvbkV4cHJlc3Npb24obm9kZSkgfHwgdHMuaXNBcnJvd0Z1bmN0aW9uKG5vZGUpO1xuICB9XG5cbiAgcGFyc2VSZXR1cm5WYWx1ZShmbjogdHMuRXhwcmVzc2lvbik6IHRzLkV4cHJlc3Npb24ge1xuICAgIGFzc2VydChmbiwgdGhpcy5pc0Z1bmN0aW9uRXhwcmVzc2lvbiwgJ2EgZnVuY3Rpb24nKTtcbiAgICBpZiAoIXRzLmlzQmxvY2soZm4uYm9keSkpIHtcbiAgICAgIC8vIGl0IGlzIGEgc2ltcGxlIGFycmF5IGZ1bmN0aW9uIGV4cHJlc3Npb246IGAoLi4uKSA9PiBleHByYFxuICAgICAgcmV0dXJuIGZuLmJvZHk7XG4gICAgfVxuXG4gICAgLy8gaXQgaXMgYSBmdW5jdGlvbiAoYXJyb3cgb3Igbm9ybWFsKSB3aXRoIGEgYm9keS4gRS5nLjpcbiAgICAvLyAqIGAoLi4uKSA9PiB7IHN0bXQ7IC4uLiB9YFxuICAgIC8vICogYGZ1bmN0aW9uKC4uLikgeyBzdG10OyAuLi4gfWBcblxuICAgIGlmIChmbi5ib2R5LnN0YXRlbWVudHMubGVuZ3RoICE9PSAxKSB7XG4gICAgICB0aHJvdyBuZXcgRmF0YWxMaW5rZXJFcnJvcihcbiAgICAgICAgICBmbi5ib2R5LCAnVW5zdXBwb3J0ZWQgc3ludGF4LCBleHBlY3RlZCBhIGZ1bmN0aW9uIGJvZHkgd2l0aCBhIHNpbmdsZSByZXR1cm4gc3RhdGVtZW50LicpO1xuICAgIH1cbiAgICBjb25zdCBzdG10ID0gZm4uYm9keS5zdGF0ZW1lbnRzWzBdO1xuICAgIGFzc2VydChzdG10LCB0cy5pc1JldHVyblN0YXRlbWVudCwgJ2EgZnVuY3Rpb24gYm9keSB3aXRoIGEgc2luZ2xlIHJldHVybiBzdGF0ZW1lbnQnKTtcbiAgICBpZiAoc3RtdC5leHByZXNzaW9uID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBGYXRhbExpbmtlckVycm9yKHN0bXQsICdVbnN1cHBvcnRlZCBzeW50YXgsIGV4cGVjdGVkIGZ1bmN0aW9uIHRvIHJldHVybiBhIHZhbHVlLicpO1xuICAgIH1cblxuICAgIHJldHVybiBzdG10LmV4cHJlc3Npb247XG4gIH1cblxuICBpc0NhbGxFeHByZXNzaW9uID0gdHMuaXNDYWxsRXhwcmVzc2lvbjtcblxuICBwYXJzZUNhbGxlZShjYWxsOiB0cy5FeHByZXNzaW9uKTogdHMuRXhwcmVzc2lvbiB7XG4gICAgYXNzZXJ0KGNhbGwsIHRzLmlzQ2FsbEV4cHJlc3Npb24sICdhIGNhbGwgZXhwcmVzc2lvbicpO1xuICAgIHJldHVybiBjYWxsLmV4cHJlc3Npb247XG4gIH1cblxuICBwYXJzZUFyZ3VtZW50cyhjYWxsOiB0cy5FeHByZXNzaW9uKTogdHMuRXhwcmVzc2lvbltdIHtcbiAgICBhc3NlcnQoY2FsbCwgdHMuaXNDYWxsRXhwcmVzc2lvbiwgJ2EgY2FsbCBleHByZXNzaW9uJyk7XG4gICAgcmV0dXJuIGNhbGwuYXJndW1lbnRzLm1hcChhcmcgPT4ge1xuICAgICAgYXNzZXJ0KGFyZywgaXNOb3RTcHJlYWRFbGVtZW50LCAnYXJndW1lbnQgbm90IHRvIHVzZSBzcHJlYWQgc3ludGF4Jyk7XG4gICAgICByZXR1cm4gYXJnO1xuICAgIH0pO1xuICB9XG5cbiAgZ2V0UmFuZ2Uobm9kZTogdHMuRXhwcmVzc2lvbik6IFJhbmdlIHtcbiAgICBjb25zdCBmaWxlID0gbm9kZS5nZXRTb3VyY2VGaWxlKCk7XG4gICAgaWYgKGZpbGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEZhdGFsTGlua2VyRXJyb3IoXG4gICAgICAgICAgbm9kZSwgJ1VuYWJsZSB0byByZWFkIHJhbmdlIGZvciBub2RlIC0gaXQgaXMgbWlzc2luZyBwYXJlbnQgaW5mb3JtYXRpb24uJyk7XG4gICAgfVxuICAgIGNvbnN0IHN0YXJ0UG9zID0gbm9kZS5nZXRTdGFydCgpO1xuICAgIGNvbnN0IGVuZFBvcyA9IG5vZGUuZ2V0RW5kKCk7XG4gICAgY29uc3Qge2xpbmU6IHN0YXJ0TGluZSwgY2hhcmFjdGVyOiBzdGFydENvbH0gPSB0cy5nZXRMaW5lQW5kQ2hhcmFjdGVyT2ZQb3NpdGlvbihmaWxlLCBzdGFydFBvcyk7XG4gICAgcmV0dXJuIHtzdGFydExpbmUsIHN0YXJ0Q29sLCBzdGFydFBvcywgZW5kUG9zfTtcbiAgfVxufVxuXG4vKipcbiAqIFJldHVybiB0cnVlIGlmIHRoZSBleHByZXNzaW9uIGRvZXMgbm90IHJlcHJlc2VudCBhbiBlbXB0eSBlbGVtZW50IGluIGFuIGFycmF5IGxpdGVyYWwuXG4gKiBGb3IgZXhhbXBsZSBpbiBgWyxmb29dYCB0aGUgZmlyc3QgZWxlbWVudCBpcyBcImVtcHR5XCIuXG4gKi9cbmZ1bmN0aW9uIGlzTm90RW1wdHlFbGVtZW50KGU6IHRzLkV4cHJlc3Npb258dHMuU3ByZWFkRWxlbWVudHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHRzLk9taXR0ZWRFeHByZXNzaW9uKTogZSBpcyB0cy5FeHByZXNzaW9ufHRzLlNwcmVhZEVsZW1lbnQge1xuICByZXR1cm4gIXRzLmlzT21pdHRlZEV4cHJlc3Npb24oZSk7XG59XG5cbi8qKlxuICogUmV0dXJuIHRydWUgaWYgdGhlIGV4cHJlc3Npb24gaXMgbm90IGEgc3ByZWFkIGVsZW1lbnQgb2YgYW4gYXJyYXkgbGl0ZXJhbC5cbiAqIEZvciBleGFtcGxlIGluIGBbeCwgLi4ucmVzdF1gIHRoZSBgLi4ucmVzdGAgZXhwcmVzc2lvbiBpcyBhIHNwcmVhZCBlbGVtZW50LlxuICovXG5mdW5jdGlvbiBpc05vdFNwcmVhZEVsZW1lbnQoZTogdHMuRXhwcmVzc2lvbnx0cy5TcHJlYWRFbGVtZW50KTogZSBpcyB0cy5FeHByZXNzaW9uIHtcbiAgcmV0dXJuICF0cy5pc1NwcmVhZEVsZW1lbnQoZSk7XG59XG5cbi8qKlxuICogUmV0dXJuIHRydWUgaWYgdGhlIGV4cHJlc3Npb24gY2FuIGJlIGNvbnNpZGVyZWQgYSB0ZXh0IGJhc2VkIHByb3BlcnR5IG5hbWUuXG4gKi9cbmZ1bmN0aW9uIGlzUHJvcGVydHlOYW1lKGU6IHRzLlByb3BlcnR5TmFtZSk6IGUgaXMgdHMuSWRlbnRpZmllcnx0cy5TdHJpbmdMaXRlcmFsfHRzLk51bWVyaWNMaXRlcmFsIHtcbiAgcmV0dXJuIHRzLmlzSWRlbnRpZmllcihlKSB8fCB0cy5pc1N0cmluZ0xpdGVyYWwoZSkgfHwgdHMuaXNOdW1lcmljTGl0ZXJhbChlKTtcbn1cblxuLyoqXG4gKiBSZXR1cm4gdHJ1ZSBpZiB0aGUgbm9kZSBpcyBlaXRoZXIgYHRydWVgIG9yIGBmYWxzZWAgbGl0ZXJhbHMuXG4gKi9cbmZ1bmN0aW9uIGlzQm9vbGVhbkxpdGVyYWwobm9kZTogdHMuRXhwcmVzc2lvbik6IG5vZGUgaXMgdHMuVHJ1ZUxpdGVyYWx8dHMuRmFsc2VMaXRlcmFsIHtcbiAgcmV0dXJuIG5vZGUua2luZCA9PT0gdHMuU3ludGF4S2luZC5UcnVlS2V5d29yZCB8fCBub2RlLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuRmFsc2VLZXl3b3JkO1xufVxuXG50eXBlIE1pbmlmaWVkQm9vbGVhbkxpdGVyYWwgPSB0cy5QcmVmaXhVbmFyeUV4cHJlc3Npb24me29wZXJhbmQ6IHRzLk51bWVyaWNMaXRlcmFsfTtcblxuLyoqXG4gKiBSZXR1cm4gdHJ1ZSBpZiB0aGUgbm9kZSBpcyBlaXRoZXIgYCEwYCBvciBgITFgLlxuICovXG5mdW5jdGlvbiBpc01pbmlmaWVkQm9vbGVhbkxpdGVyYWwobm9kZTogdHMuRXhwcmVzc2lvbik6IG5vZGUgaXMgTWluaWZpZWRCb29sZWFuTGl0ZXJhbCB7XG4gIHJldHVybiB0cy5pc1ByZWZpeFVuYXJ5RXhwcmVzc2lvbihub2RlKSAmJiBub2RlLm9wZXJhdG9yID09PSB0cy5TeW50YXhLaW5kLkV4Y2xhbWF0aW9uVG9rZW4gJiZcbiAgICAgIHRzLmlzTnVtZXJpY0xpdGVyYWwobm9kZS5vcGVyYW5kKSAmJiAobm9kZS5vcGVyYW5kLnRleHQgPT09ICcwJyB8fCBub2RlLm9wZXJhbmQudGV4dCA9PT0gJzEnKTtcbn1cbiJdfQ==