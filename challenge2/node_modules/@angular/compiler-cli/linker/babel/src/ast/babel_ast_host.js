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
        define("@angular/compiler-cli/linker/babel/src/ast/babel_ast_host", ["require", "exports", "tslib", "@babel/types", "@angular/compiler-cli/linker"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BabelAstHost = void 0;
    var tslib_1 = require("tslib");
    var t = require("@babel/types");
    var linker_1 = require("@angular/compiler-cli/linker");
    /**
     * This implementation of `AstHost` is able to get information from Babel AST nodes.
     */
    var BabelAstHost = /** @class */ (function () {
        function BabelAstHost() {
            this.isStringLiteral = t.isStringLiteral;
            this.isNumericLiteral = t.isNumericLiteral;
            this.isArrayLiteral = t.isArrayExpression;
            this.isObjectLiteral = t.isObjectExpression;
            this.isCallExpression = t.isCallExpression;
        }
        BabelAstHost.prototype.getSymbolName = function (node) {
            if (t.isIdentifier(node)) {
                return node.name;
            }
            else if (t.isMemberExpression(node) && t.isIdentifier(node.property)) {
                return node.property.name;
            }
            else {
                return null;
            }
        };
        BabelAstHost.prototype.parseStringLiteral = function (str) {
            linker_1.assert(str, t.isStringLiteral, 'a string literal');
            return str.value;
        };
        BabelAstHost.prototype.parseNumericLiteral = function (num) {
            linker_1.assert(num, t.isNumericLiteral, 'a numeric literal');
            return num.value;
        };
        BabelAstHost.prototype.isBooleanLiteral = function (bool) {
            return t.isBooleanLiteral(bool) || isMinifiedBooleanLiteral(bool);
        };
        BabelAstHost.prototype.parseBooleanLiteral = function (bool) {
            if (t.isBooleanLiteral(bool)) {
                return bool.value;
            }
            else if (isMinifiedBooleanLiteral(bool)) {
                return !bool.argument.value;
            }
            else {
                throw new linker_1.FatalLinkerError(bool, 'Unsupported syntax, expected a boolean literal.');
            }
        };
        BabelAstHost.prototype.parseArrayLiteral = function (array) {
            linker_1.assert(array, t.isArrayExpression, 'an array literal');
            return array.elements.map(function (element) {
                linker_1.assert(element, isNotEmptyElement, 'element in array not to be empty');
                linker_1.assert(element, isNotSpreadElement, 'element in array not to use spread syntax');
                return element;
            });
        };
        BabelAstHost.prototype.parseObjectLiteral = function (obj) {
            var e_1, _a;
            linker_1.assert(obj, t.isObjectExpression, 'an object literal');
            var result = new Map();
            try {
                for (var _b = tslib_1.__values(obj.properties), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var property = _c.value;
                    linker_1.assert(property, t.isObjectProperty, 'a property assignment');
                    linker_1.assert(property.value, t.isExpression, 'an expression');
                    linker_1.assert(property.key, isPropertyName, 'a property name');
                    var key = t.isIdentifier(property.key) ? property.key.name : property.key.value;
                    result.set(key, property.value);
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
        BabelAstHost.prototype.isFunctionExpression = function (node) {
            return t.isFunction(node);
        };
        BabelAstHost.prototype.parseReturnValue = function (fn) {
            linker_1.assert(fn, this.isFunctionExpression, 'a function');
            if (!t.isBlockStatement(fn.body)) {
                // it is a simple array function expression: `(...) => expr`
                return fn.body;
            }
            // it is a function (arrow or normal) with a body. E.g.:
            // * `(...) => { stmt; ... }`
            // * `function(...) { stmt; ... }`
            if (fn.body.body.length !== 1) {
                throw new linker_1.FatalLinkerError(fn.body, 'Unsupported syntax, expected a function body with a single return statement.');
            }
            var stmt = fn.body.body[0];
            linker_1.assert(stmt, t.isReturnStatement, 'a function body with a single return statement');
            if (stmt.argument === null) {
                throw new linker_1.FatalLinkerError(stmt, 'Unsupported syntax, expected function to return a value.');
            }
            return stmt.argument;
        };
        BabelAstHost.prototype.parseCallee = function (call) {
            linker_1.assert(call, t.isCallExpression, 'a call expression');
            linker_1.assert(call.callee, t.isExpression, 'an expression');
            return call.callee;
        };
        BabelAstHost.prototype.parseArguments = function (call) {
            linker_1.assert(call, t.isCallExpression, 'a call expression');
            return call.arguments.map(function (arg) {
                linker_1.assert(arg, isNotSpreadArgument, 'argument not to use spread syntax');
                linker_1.assert(arg, t.isExpression, 'argument to be an expression');
                return arg;
            });
        };
        BabelAstHost.prototype.getRange = function (node) {
            if (node.loc == null || node.start === null || node.end === null) {
                throw new linker_1.FatalLinkerError(node, 'Unable to read range for node - it is missing location information.');
            }
            return {
                startLine: node.loc.start.line - 1,
                startCol: node.loc.start.column,
                startPos: node.start,
                endPos: node.end,
            };
        };
        return BabelAstHost;
    }());
    exports.BabelAstHost = BabelAstHost;
    /**
     * Return true if the expression does not represent an empty element in an array literal.
     * For example in `[,foo]` the first element is "empty".
     */
    function isNotEmptyElement(e) {
        return e !== null;
    }
    /**
     * Return true if the expression is not a spread element of an array literal.
     * For example in `[x, ...rest]` the `...rest` expression is a spread element.
     */
    function isNotSpreadElement(e) {
        return !t.isSpreadElement(e);
    }
    /**
     * Return true if the expression can be considered a text based property name.
     */
    function isPropertyName(e) {
        return t.isIdentifier(e) || t.isStringLiteral(e) || t.isNumericLiteral(e);
    }
    /**
     * Return true if the argument is not a spread element.
     */
    function isNotSpreadArgument(arg) {
        return !t.isSpreadElement(arg);
    }
    /**
     * Return true if the node is either `!0` or `!1`.
     */
    function isMinifiedBooleanLiteral(node) {
        return t.isUnaryExpression(node) && node.prefix && node.operator === '!' &&
            t.isNumericLiteral(node.argument) && (node.argument.value === 0 || node.argument.value === 1);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFiZWxfYXN0X2hvc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvbGlua2VyL2JhYmVsL3NyYy9hc3QvYmFiZWxfYXN0X2hvc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUVILGdDQUFrQztJQUVsQyx1REFBNEU7SUFFNUU7O09BRUc7SUFDSDtRQUFBO1lBV0Usb0JBQWUsR0FBRyxDQUFDLENBQUMsZUFBZSxDQUFDO1lBT3BDLHFCQUFnQixHQUFHLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQztZQXFCdEMsbUJBQWMsR0FBRyxDQUFDLENBQUMsaUJBQWlCLENBQUM7WUFXckMsb0JBQWUsR0FBRyxDQUFDLENBQUMsa0JBQWtCLENBQUM7WUE0Q3ZDLHFCQUFnQixHQUFHLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQztRQTJCeEMsQ0FBQztRQXhIQyxvQ0FBYSxHQUFiLFVBQWMsSUFBa0I7WUFDOUIsSUFBSSxDQUFDLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUN4QixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUM7YUFDbEI7aUJBQU0sSUFBSSxDQUFDLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUU7Z0JBQ3RFLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUM7YUFDM0I7aUJBQU07Z0JBQ0wsT0FBTyxJQUFJLENBQUM7YUFDYjtRQUNILENBQUM7UUFJRCx5Q0FBa0IsR0FBbEIsVUFBbUIsR0FBaUI7WUFDbEMsZUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsZUFBZSxFQUFFLGtCQUFrQixDQUFDLENBQUM7WUFDbkQsT0FBTyxHQUFHLENBQUMsS0FBSyxDQUFDO1FBQ25CLENBQUM7UUFJRCww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QUFtQixDQUFDLEdBQWlCO1FBQzVDLE9BQU8sQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ2pDLENBQUM7SUFJRDs7T0FFRztJQUNILFNBQVMsd0JBQXdCLENBQUMsSUFBa0I7UUFDbEQsT0FBTyxDQUFDLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsUUFBUSxLQUFLLEdBQUc7WUFDcEUsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQztJQUNwRyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIHQgZnJvbSAnQGJhYmVsL3R5cGVzJztcblxuaW1wb3J0IHthc3NlcnQsIEFzdEhvc3QsIEZhdGFsTGlua2VyRXJyb3IsIFJhbmdlfSBmcm9tICcuLi8uLi8uLi8uLi9saW5rZXInO1xuXG4vKipcbiAqIFRoaXMgaW1wbGVtZW50YXRpb24gb2YgYEFzdEhvc3RgIGlzIGFibGUgdG8gZ2V0IGluZm9ybWF0aW9uIGZyb20gQmFiZWwgQVNUIG5vZGVzLlxuICovXG5leHBvcnQgY2xhc3MgQmFiZWxBc3RIb3N0IGltcGxlbWVudHMgQXN0SG9zdDx0LkV4cHJlc3Npb24+IHtcbiAgZ2V0U3ltYm9sTmFtZShub2RlOiB0LkV4cHJlc3Npb24pOiBzdHJpbmd8bnVsbCB7XG4gICAgaWYgKHQuaXNJZGVudGlmaWVyKG5vZGUpKSB7XG4gICAgICByZXR1cm4gbm9kZS5uYW1lO1xuICAgIH0gZWxzZSBpZiAodC5pc01lbWJlckV4cHJlc3Npb24obm9kZSkgJiYgdC5pc0lkZW50aWZpZXIobm9kZS5wcm9wZXJ0eSkpIHtcbiAgICAgIHJldHVybiBub2RlLnByb3BlcnR5Lm5hbWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuXG4gIGlzU3RyaW5nTGl0ZXJhbCA9IHQuaXNTdHJpbmdMaXRlcmFsO1xuXG4gIHBhcnNlU3RyaW5nTGl0ZXJhbChzdHI6IHQuRXhwcmVzc2lvbik6IHN0cmluZyB7XG4gICAgYXNzZXJ0KHN0ciwgdC5pc1N0cmluZ0xpdGVyYWwsICdhIHN0cmluZyBsaXRlcmFsJyk7XG4gICAgcmV0dXJuIHN0ci52YWx1ZTtcbiAgfVxuXG4gIGlzTnVtZXJpY0xpdGVyYWwgPSB0LmlzTnVtZXJpY0xpdGVyYWw7XG5cbiAgcGFyc2VOdW1lcmljTGl0ZXJhbChudW06IHQuRXhwcmVzc2lvbik6IG51bWJlciB7XG4gICAgYXNzZXJ0KG51bSwgdC5pc051bWVyaWNMaXRlcmFsLCAnYSBudW1lcmljIGxpdGVyYWwnKTtcbiAgICByZXR1cm4gbnVtLnZhbHVlO1xuICB9XG5cbiAgaXNCb29sZWFuTGl0ZXJhbChib29sOiB0LkV4cHJlc3Npb24pOiBib29sZWFuIHtcbiAgICByZXR1cm4gdC5pc0Jvb2xlYW5MaXRlcmFsKGJvb2wpIHx8IGlzTWluaWZpZWRCb29sZWFuTGl0ZXJhbChib29sKTtcbiAgfVxuXG4gIHBhcnNlQm9vbGVhbkxpdGVyYWwoYm9vbDogdC5FeHByZXNzaW9uKTogYm9vbGVhbiB7XG4gICAgaWYgKHQuaXNCb29sZWFuTGl0ZXJhbChib29sKSkge1xuICAgICAgcmV0dXJuIGJvb2wudmFsdWU7XG4gICAgfSBlbHNlIGlmIChpc01pbmlmaWVkQm9vbGVhbkxpdGVyYWwoYm9vbCkpIHtcbiAgICAgIHJldHVybiAhYm9vbC5hcmd1bWVudC52YWx1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEZhdGFsTGlua2VyRXJyb3IoYm9vbCwgJ1Vuc3VwcG9ydGVkIHN5bnRheCwgZXhwZWN0ZWQgYSBib29sZWFuIGxpdGVyYWwuJyk7XG4gICAgfVxuICB9XG5cbiAgaXNBcnJheUxpdGVyYWwgPSB0LmlzQXJyYXlFeHByZXNzaW9uO1xuXG4gIHBhcnNlQXJyYXlMaXRlcmFsKGFycmF5OiB0LkV4cHJlc3Npb24pOiB0LkV4cHJlc3Npb25bXSB7XG4gICAgYXNzZXJ0KGFycmF5LCB0LmlzQXJyYXlFeHByZXNzaW9uLCAnYW4gYXJyYXkgbGl0ZXJhbCcpO1xuICAgIHJldHVybiBhcnJheS5lbGVtZW50cy5tYXAoZWxlbWVudCA9PiB7XG4gICAgICBhc3NlcnQoZWxlbWVudCwgaXNOb3RFbXB0eUVsZW1lbnQsICdlbGVtZW50IGluIGFycmF5IG5vdCB0byBiZSBlbXB0eScpO1xuICAgICAgYXNzZXJ0KGVsZW1lbnQsIGlzTm90U3ByZWFkRWxlbWVudCwgJ2VsZW1lbnQgaW4gYXJyYXkgbm90IHRvIHVzZSBzcHJlYWQgc3ludGF4Jyk7XG4gICAgICByZXR1cm4gZWxlbWVudDtcbiAgICB9KTtcbiAgfVxuXG4gIGlzT2JqZWN0TGl0ZXJhbCA9IHQuaXNPYmplY3RFeHByZXNzaW9uO1xuXG4gIHBhcnNlT2JqZWN0TGl0ZXJhbChvYmo6IHQuRXhwcmVzc2lvbik6IE1hcDxzdHJpbmcsIHQuRXhwcmVzc2lvbj4ge1xuICAgIGFzc2VydChvYmosIHQuaXNPYmplY3RFeHByZXNzaW9uLCAnYW4gb2JqZWN0IGxpdGVyYWwnKTtcblxuICAgIGNvbnN0IHJlc3VsdCA9IG5ldyBNYXA8c3RyaW5nLCB0LkV4cHJlc3Npb24+KCk7XG4gICAgZm9yIChjb25zdCBwcm9wZXJ0eSBvZiBvYmoucHJvcGVydGllcykge1xuICAgICAgYXNzZXJ0KHByb3BlcnR5LCB0LmlzT2JqZWN0UHJvcGVydHksICdhIHByb3BlcnR5IGFzc2lnbm1lbnQnKTtcbiAgICAgIGFzc2VydChwcm9wZXJ0eS52YWx1ZSwgdC5pc0V4cHJlc3Npb24sICdhbiBleHByZXNzaW9uJyk7XG4gICAgICBhc3NlcnQocHJvcGVydHkua2V5LCBpc1Byb3BlcnR5TmFtZSwgJ2EgcHJvcGVydHkgbmFtZScpO1xuICAgICAgY29uc3Qga2V5ID0gdC5pc0lkZW50aWZpZXIocHJvcGVydHkua2V5KSA/IHByb3BlcnR5LmtleS5uYW1lIDogcHJvcGVydHkua2V5LnZhbHVlO1xuICAgICAgcmVzdWx0LnNldChrZXksIHByb3BlcnR5LnZhbHVlKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIGlzRnVuY3Rpb25FeHByZXNzaW9uKG5vZGU6IHQuRXhwcmVzc2lvbik6IG5vZGUgaXMgRXh0cmFjdDx0LkZ1bmN0aW9uLCB0LkV4cHJlc3Npb24+IHtcbiAgICByZXR1cm4gdC5pc0Z1bmN0aW9uKG5vZGUpO1xuICB9XG5cbiAgcGFyc2VSZXR1cm5WYWx1ZShmbjogdC5FeHByZXNzaW9uKTogdC5FeHByZXNzaW9uIHtcbiAgICBhc3NlcnQoZm4sIHRoaXMuaXNGdW5jdGlvbkV4cHJlc3Npb24sICdhIGZ1bmN0aW9uJyk7XG4gICAgaWYgKCF0LmlzQmxvY2tTdGF0ZW1lbnQoZm4uYm9keSkpIHtcbiAgICAgIC8vIGl0IGlzIGEgc2ltcGxlIGFycmF5IGZ1bmN0aW9uIGV4cHJlc3Npb246IGAoLi4uKSA9PiBleHByYFxuICAgICAgcmV0dXJuIGZuLmJvZHk7XG4gICAgfVxuXG4gICAgLy8gaXQgaXMgYSBmdW5jdGlvbiAoYXJyb3cgb3Igbm9ybWFsKSB3aXRoIGEgYm9keS4gRS5nLjpcbiAgICAvLyAqIGAoLi4uKSA9PiB7IHN0bXQ7IC4uLiB9YFxuICAgIC8vICogYGZ1bmN0aW9uKC4uLikgeyBzdG10OyAuLi4gfWBcblxuICAgIGlmIChmbi5ib2R5LmJvZHkubGVuZ3RoICE9PSAxKSB7XG4gICAgICB0aHJvdyBuZXcgRmF0YWxMaW5rZXJFcnJvcihcbiAgICAgICAgICBmbi5ib2R5LCAnVW5zdXBwb3J0ZWQgc3ludGF4LCBleHBlY3RlZCBhIGZ1bmN0aW9uIGJvZHkgd2l0aCBhIHNpbmdsZSByZXR1cm4gc3RhdGVtZW50LicpO1xuICAgIH1cbiAgICBjb25zdCBzdG10ID0gZm4uYm9keS5ib2R5WzBdO1xuICAgIGFzc2VydChzdG10LCB0LmlzUmV0dXJuU3RhdGVtZW50LCAnYSBmdW5jdGlvbiBib2R5IHdpdGggYSBzaW5nbGUgcmV0dXJuIHN0YXRlbWVudCcpO1xuICAgIGlmIChzdG10LmFyZ3VtZW50ID09PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgRmF0YWxMaW5rZXJFcnJvcihzdG10LCAnVW5zdXBwb3J0ZWQgc3ludGF4LCBleHBlY3RlZCBmdW5jdGlvbiB0byByZXR1cm4gYSB2YWx1ZS4nKTtcbiAgICB9XG5cbiAgICByZXR1cm4gc3RtdC5hcmd1bWVudDtcbiAgfVxuXG4gIGlzQ2FsbEV4cHJlc3Npb24gPSB0LmlzQ2FsbEV4cHJlc3Npb247XG4gIHBhcnNlQ2FsbGVlKGNhbGw6IHQuRXhwcmVzc2lvbik6IHQuRXhwcmVzc2lvbiB7XG4gICAgYXNzZXJ0KGNhbGwsIHQuaXNDYWxsRXhwcmVzc2lvbiwgJ2EgY2FsbCBleHByZXNzaW9uJyk7XG4gICAgYXNzZXJ0KGNhbGwuY2FsbGVlLCB0LmlzRXhwcmVzc2lvbiwgJ2FuIGV4cHJlc3Npb24nKTtcbiAgICByZXR1cm4gY2FsbC5jYWxsZWU7XG4gIH1cbiAgcGFyc2VBcmd1bWVudHMoY2FsbDogdC5FeHByZXNzaW9uKTogdC5FeHByZXNzaW9uW10ge1xuICAgIGFzc2VydChjYWxsLCB0LmlzQ2FsbEV4cHJlc3Npb24sICdhIGNhbGwgZXhwcmVzc2lvbicpO1xuICAgIHJldHVybiBjYWxsLmFyZ3VtZW50cy5tYXAoYXJnID0+IHtcbiAgICAgIGFzc2VydChhcmcsIGlzTm90U3ByZWFkQXJndW1lbnQsICdhcmd1bWVudCBub3QgdG8gdXNlIHNwcmVhZCBzeW50YXgnKTtcbiAgICAgIGFzc2VydChhcmcsIHQuaXNFeHByZXNzaW9uLCAnYXJndW1lbnQgdG8gYmUgYW4gZXhwcmVzc2lvbicpO1xuICAgICAgcmV0dXJuIGFyZztcbiAgICB9KTtcbiAgfVxuXG4gIGdldFJhbmdlKG5vZGU6IHQuRXhwcmVzc2lvbik6IFJhbmdlIHtcbiAgICBpZiAobm9kZS5sb2MgPT0gbnVsbCB8fCBub2RlLnN0YXJ0ID09PSBudWxsIHx8IG5vZGUuZW5kID09PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgRmF0YWxMaW5rZXJFcnJvcihcbiAgICAgICAgICBub2RlLCAnVW5hYmxlIHRvIHJlYWQgcmFuZ2UgZm9yIG5vZGUgLSBpdCBpcyBtaXNzaW5nIGxvY2F0aW9uIGluZm9ybWF0aW9uLicpO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgc3RhcnRMaW5lOiBub2RlLmxvYy5zdGFydC5saW5lIC0gMSwgIC8vIEJhYmVsIGxpbmVzIGFyZSAxLWJhc2VkXG4gICAgICBzdGFydENvbDogbm9kZS5sb2Muc3RhcnQuY29sdW1uLFxuICAgICAgc3RhcnRQb3M6IG5vZGUuc3RhcnQsXG4gICAgICBlbmRQb3M6IG5vZGUuZW5kLFxuICAgIH07XG4gIH1cbn1cblxuLyoqXG4gKiBSZXR1cm4gdHJ1ZSBpZiB0aGUgZXhwcmVzc2lvbiBkb2VzIG5vdCByZXByZXNlbnQgYW4gZW1wdHkgZWxlbWVudCBpbiBhbiBhcnJheSBsaXRlcmFsLlxuICogRm9yIGV4YW1wbGUgaW4gYFssZm9vXWAgdGhlIGZpcnN0IGVsZW1lbnQgaXMgXCJlbXB0eVwiLlxuICovXG5mdW5jdGlvbiBpc05vdEVtcHR5RWxlbWVudChlOiB0LkV4cHJlc3Npb258dC5TcHJlYWRFbGVtZW50fG51bGwpOiBlIGlzIHQuRXhwcmVzc2lvbnxcbiAgICB0LlNwcmVhZEVsZW1lbnQge1xuICByZXR1cm4gZSAhPT0gbnVsbDtcbn1cblxuLyoqXG4gKiBSZXR1cm4gdHJ1ZSBpZiB0aGUgZXhwcmVzc2lvbiBpcyBub3QgYSBzcHJlYWQgZWxlbWVudCBvZiBhbiBhcnJheSBsaXRlcmFsLlxuICogRm9yIGV4YW1wbGUgaW4gYFt4LCAuLi5yZXN0XWAgdGhlIGAuLi5yZXN0YCBleHByZXNzaW9uIGlzIGEgc3ByZWFkIGVsZW1lbnQuXG4gKi9cbmZ1bmN0aW9uIGlzTm90U3ByZWFkRWxlbWVudChlOiB0LkV4cHJlc3Npb258dC5TcHJlYWRFbGVtZW50KTogZSBpcyB0LkV4cHJlc3Npb24ge1xuICByZXR1cm4gIXQuaXNTcHJlYWRFbGVtZW50KGUpO1xufVxuXG5cbi8qKlxuICogUmV0dXJuIHRydWUgaWYgdGhlIGV4cHJlc3Npb24gY2FuIGJlIGNvbnNpZGVyZWQgYSB0ZXh0IGJhc2VkIHByb3BlcnR5IG5hbWUuXG4gKi9cbmZ1bmN0aW9uIGlzUHJvcGVydHlOYW1lKGU6IHQuRXhwcmVzc2lvbik6IGUgaXMgdC5JZGVudGlmaWVyfHQuU3RyaW5nTGl0ZXJhbHx0Lk51bWVyaWNMaXRlcmFsIHtcbiAgcmV0dXJuIHQuaXNJZGVudGlmaWVyKGUpIHx8IHQuaXNTdHJpbmdMaXRlcmFsKGUpIHx8IHQuaXNOdW1lcmljTGl0ZXJhbChlKTtcbn1cblxuLyoqXG4gKiBUaGUgZGVjbGFyZWQgdHlwZSBvZiBhbiBhcmd1bWVudCB0byBhIGNhbGwgZXhwcmVzc2lvbi5cbiAqL1xudHlwZSBBcmd1bWVudFR5cGUgPSB0LkNhbGxFeHByZXNzaW9uWydhcmd1bWVudHMnXVtudW1iZXJdO1xuXG4vKipcbiAqIFJldHVybiB0cnVlIGlmIHRoZSBhcmd1bWVudCBpcyBub3QgYSBzcHJlYWQgZWxlbWVudC5cbiAqL1xuZnVuY3Rpb24gaXNOb3RTcHJlYWRBcmd1bWVudChhcmc6IEFyZ3VtZW50VHlwZSk6IGFyZyBpcyBFeGNsdWRlPEFyZ3VtZW50VHlwZSwgdC5TcHJlYWRFbGVtZW50PiB7XG4gIHJldHVybiAhdC5pc1NwcmVhZEVsZW1lbnQoYXJnKTtcbn1cblxudHlwZSBNaW5pZmllZEJvb2xlYW5MaXRlcmFsID0gdC5FeHByZXNzaW9uJnQuVW5hcnlFeHByZXNzaW9uJnthcmd1bWVudDogdC5OdW1lcmljTGl0ZXJhbH07XG5cbi8qKlxuICogUmV0dXJuIHRydWUgaWYgdGhlIG5vZGUgaXMgZWl0aGVyIGAhMGAgb3IgYCExYC5cbiAqL1xuZnVuY3Rpb24gaXNNaW5pZmllZEJvb2xlYW5MaXRlcmFsKG5vZGU6IHQuRXhwcmVzc2lvbik6IG5vZGUgaXMgTWluaWZpZWRCb29sZWFuTGl0ZXJhbCB7XG4gIHJldHVybiB0LmlzVW5hcnlFeHByZXNzaW9uKG5vZGUpICYmIG5vZGUucHJlZml4ICYmIG5vZGUub3BlcmF0b3IgPT09ICchJyAmJlxuICAgICAgdC5pc051bWVyaWNMaXRlcmFsKG5vZGUuYXJndW1lbnQpICYmIChub2RlLmFyZ3VtZW50LnZhbHVlID09PSAwIHx8IG5vZGUuYXJndW1lbnQudmFsdWUgPT09IDEpO1xufVxuIl19