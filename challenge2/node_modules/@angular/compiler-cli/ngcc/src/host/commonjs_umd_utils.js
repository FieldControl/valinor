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
        define("@angular/compiler-cli/ngcc/src/host/commonjs_umd_utils", ["require", "exports", "typescript", "@angular/compiler-cli/src/ngtsc/util/src/typescript"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.skipAliases = exports.isExportsStatement = exports.isExportsAssignment = exports.isExportsDeclaration = exports.isExternalImport = exports.isRequireCall = exports.extractGetterFnExpression = exports.isDefinePropertyReexportStatement = exports.isWildcardReexportStatement = exports.findRequireCallReference = exports.findNamespaceOfIdentifier = void 0;
    var ts = require("typescript");
    var typescript_1 = require("@angular/compiler-cli/src/ngtsc/util/src/typescript");
    /**
     * Return the "namespace" of the specified `ts.Identifier` if the identifier is the RHS of a
     * property access expression, i.e. an expression of the form `<namespace>.<id>` (in which case a
     * `ts.Identifier` corresponding to `<namespace>` will be returned). Otherwise return `null`.
     */
    function findNamespaceOfIdentifier(id) {
        return id.parent && ts.isPropertyAccessExpression(id.parent) && id.parent.name === id &&
            ts.isIdentifier(id.parent.expression) ?
            id.parent.expression :
            null;
    }
    exports.findNamespaceOfIdentifier = findNamespaceOfIdentifier;
    /**
     * Return the `RequireCall` that is used to initialize the specified `ts.Identifier`, if the
     * specified indentifier was indeed initialized with a require call in a declaration of the form:
     * `var <id> = require('...')`
     */
    function findRequireCallReference(id, checker) {
        var _a, _b;
        var symbol = checker.getSymbolAtLocation(id) || null;
        var declaration = (_a = symbol === null || symbol === void 0 ? void 0 : symbol.valueDeclaration) !== null && _a !== void 0 ? _a : (_b = symbol === null || symbol === void 0 ? void 0 : symbol.declarations) === null || _b === void 0 ? void 0 : _b[0];
        var initializer = declaration && ts.isVariableDeclaration(declaration) && declaration.initializer || null;
        return initializer && isRequireCall(initializer) ? initializer : null;
    }
    exports.findRequireCallReference = findRequireCallReference;
    /**
     * Check whether the specified `ts.Statement` is a wildcard re-export statement.
     * I.E. an expression statement of one of the following forms:
     * - `__export(<foo>)`
     * - `__exportStar(<foo>)`
     * - `tslib.__export(<foo>, exports)`
     * - `tslib.__exportStar(<foo>, exports)`
     */
    function isWildcardReexportStatement(stmt) {
        // Ensure it is a call expression statement.
        if (!ts.isExpressionStatement(stmt) || !ts.isCallExpression(stmt.expression)) {
            return false;
        }
        // Get the called function identifier.
        // NOTE: Currently, it seems that `__export()` is used when emitting helpers inline and
        //       `__exportStar()` when importing them
        //       ([source](https://github.com/microsoft/TypeScript/blob/d7c83f023/src/compiler/transformers/module/module.ts#L1796-L1797)).
        //       So, theoretically, we only care about the formats `__export(<foo>)` and
        //       `tslib.__exportStar(<foo>, exports)`.
        //       The current implementation accepts the other two formats (`__exportStar(...)` and
        //       `tslib.__export(...)`) as well to be more future-proof (given that it is unlikely that
        //       they will introduce false positives).
        var fnName = null;
        if (ts.isIdentifier(stmt.expression.expression)) {
            // Statement of the form `someFn(...)`.
            fnName = stmt.expression.expression.text;
        }
        else if (ts.isPropertyAccessExpression(stmt.expression.expression) &&
            ts.isIdentifier(stmt.expression.expression.name)) {
            // Statement of the form `tslib.someFn(...)`.
            fnName = stmt.expression.expression.name.text;
        }
        // Ensure the called function is either `__export()` or `__exportStar()`.
        if ((fnName !== '__export') && (fnName !== '__exportStar')) {
            return false;
        }
        // Ensure there is at least one argument.
        // (The first argument is the exported thing and there will be a second `exports` argument in the
        // case of imported helpers).
        return stmt.expression.arguments.length > 0;
    }
    exports.isWildcardReexportStatement = isWildcardReexportStatement;
    /**
     * Check whether the statement is a re-export of the form:
     *
     * ```
     * Object.defineProperty(exports, "<export-name>",
     *     { enumerable: true, get: function () { return <import-name>; } });
     * ```
     */
    function isDefinePropertyReexportStatement(stmt) {
        if (!ts.isExpressionStatement(stmt) || !ts.isCallExpression(stmt.expression)) {
            return false;
        }
        // Check for Object.defineProperty
        if (!ts.isPropertyAccessExpression(stmt.expression.expression) ||
            !ts.isIdentifier(stmt.expression.expression.expression) ||
            stmt.expression.expression.expression.text !== 'Object' ||
            !ts.isIdentifier(stmt.expression.expression.name) ||
            stmt.expression.expression.name.text !== 'defineProperty') {
            return false;
        }
        var args = stmt.expression.arguments;
        if (args.length !== 3) {
            return false;
        }
        var exportsObject = args[0];
        if (!ts.isIdentifier(exportsObject) || exportsObject.text !== 'exports') {
            return false;
        }
        var propertyKey = args[1];
        if (!ts.isStringLiteral(propertyKey)) {
            return false;
        }
        var propertyDescriptor = args[2];
        if (!ts.isObjectLiteralExpression(propertyDescriptor)) {
            return false;
        }
        return (propertyDescriptor.properties.some(function (prop) { return prop.name !== undefined && ts.isIdentifier(prop.name) && prop.name.text === 'get'; }));
    }
    exports.isDefinePropertyReexportStatement = isDefinePropertyReexportStatement;
    /**
     * Extract the "value" of the getter in a `defineProperty` statement.
     *
     * This will return the `ts.Expression` value of a single `return` statement in the `get` method
     * of the property definition object, or `null` if that is not possible.
     */
    function extractGetterFnExpression(statement) {
        var args = statement.expression.arguments;
        var getterFn = args[2].properties.find(function (prop) { return prop.name !== undefined && ts.isIdentifier(prop.name) && prop.name.text === 'get'; });
        if (getterFn === undefined || !ts.isPropertyAssignment(getterFn) ||
            !ts.isFunctionExpression(getterFn.initializer)) {
            return null;
        }
        var returnStatement = getterFn.initializer.body.statements[0];
        if (!ts.isReturnStatement(returnStatement) || returnStatement.expression === undefined) {
            return null;
        }
        return returnStatement.expression;
    }
    exports.extractGetterFnExpression = extractGetterFnExpression;
    /**
     * Check whether the specified `ts.Node` represents a `require()` call, i.e. an call expression of
     * the form: `require('<foo>')`
     */
    function isRequireCall(node) {
        return ts.isCallExpression(node) && ts.isIdentifier(node.expression) &&
            node.expression.text === 'require' && node.arguments.length === 1 &&
            ts.isStringLiteral(node.arguments[0]);
    }
    exports.isRequireCall = isRequireCall;
    /**
     * Check whether the specified `path` is an "external" import.
     * In other words, that it comes from a entry-point outside the current one.
     */
    function isExternalImport(path) {
        return !/^\.\.?(\/|$)/.test(path);
    }
    exports.isExternalImport = isExternalImport;
    /**
     * Check whether the specified `node` is a property access expression of the form
     * `exports.<foo>`.
     */
    function isExportsDeclaration(expr) {
        return expr.parent && isExportsAssignment(expr.parent);
    }
    exports.isExportsDeclaration = isExportsDeclaration;
    /**
     * Check whether the specified `node` is an assignment expression of the form
     * `exports.<foo> = <bar>`.
     */
    function isExportsAssignment(expr) {
        return typescript_1.isAssignment(expr) && ts.isPropertyAccessExpression(expr.left) &&
            ts.isIdentifier(expr.left.expression) && expr.left.expression.text === 'exports' &&
            ts.isIdentifier(expr.left.name);
    }
    exports.isExportsAssignment = isExportsAssignment;
    /**
     * Check whether the specified `stmt` is an expression statement of the form
     * `exports.<foo> = <bar>;`.
     */
    function isExportsStatement(stmt) {
        return ts.isExpressionStatement(stmt) && isExportsAssignment(stmt.expression);
    }
    exports.isExportsStatement = isExportsStatement;
    /**
     * Find the far right hand side of a sequence of aliased assignements of the form
     *
     * ```
     * exports.MyClass = alias1 = alias2 = <<declaration>>
     * ```
     *
     * @param node the expression to parse
     * @returns the original `node` or the far right expression of a series of assignments.
     */
    function skipAliases(node) {
        while (typescript_1.isAssignment(node)) {
            node = node.right;
        }
        return node;
    }
    exports.skipAliases = skipAliases;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbW9uanNfdW1kX3V0aWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL25nY2Mvc3JjL2hvc3QvY29tbW9uanNfdW1kX3V0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQUVILCtCQUFpQztJQUVqQyxrRkFBb0U7SUFrRHBFOzs7O09BSUc7SUFDSCxTQUFnQix5QkFBeUIsQ0FBQyxFQUFpQjtRQUN6RCxPQUFPLEVBQUUsQ0FBQyxNQUFNLElBQUksRUFBRSxDQUFDLDBCQUEwQixDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksS0FBSyxFQUFFO1lBQzdFLEVBQUUsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1lBQzNDLEVBQUUsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDdEIsSUFBSSxDQUFDO0lBQ1gsQ0FBQztJQUxELDhEQUtDO0lBRUQ7Ozs7T0FJRztJQUNILFNBQWdCLHdCQUF3QixDQUFDLEVBQWlCLEVBQUUsT0FBdUI7O1FBRWpGLElBQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxFQUFFLENBQUMsSUFBSSxJQUFJLENBQUM7UUFDdkQsSUFBTSxXQUFXLEdBQUcsTUFBQSxNQUFNLGFBQU4sTUFBTSx1QkFBTixNQUFNLENBQUUsZ0JBQWdCLG1DQUFJLE1BQUEsTUFBTSxhQUFOLE1BQU0sdUJBQU4sTUFBTSxDQUFFLFlBQVksMENBQUcsQ0FBQyxDQUFDLENBQUM7UUFDMUUsSUFBTSxXQUFXLEdBQ2IsV0FBVyxJQUFJLEVBQUUsQ0FBQyxxQkFBcUIsQ0FBQyxXQUFXLENBQUMsSUFBSSxXQUFXLENBQUMsV0FBVyxJQUFJLElBQUksQ0FBQztRQUM1RixPQUFPLFdBQVcs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UUFDL0MsT0FBTyx5QkFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQywwQkFBMEIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO1lBQ2pFLEVBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEtBQUssU0FBUztZQUNoRixFQUFFLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDdEMsQ0FBQztJQUpELGtEQUlDO0lBU0Q7OztPQUdHO0lBQ0gsU0FBZ0Isa0JBQWtCLENBQUMsSUFBYTtRQUM5QyxPQUFPLEVBQUUsQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDaEYsQ0FBQztJQUZELGdEQUVDO0lBRUQ7Ozs7Ozs7OztPQVNHO0lBQ0gsU0FBZ0IsV0FBVyxDQUFDLElBQW1CO1FBQzdDLE9BQU8seUJBQVksQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUN6QixJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztTQUNuQjtRQUNELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUxELGtDQUtDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuaW1wb3J0IHtEZWNsYXJhdGlvbn0gZnJvbSAnLi4vLi4vLi4vc3JjL25ndHNjL3JlZmxlY3Rpb24nO1xuaW1wb3J0IHtpc0Fzc2lnbm1lbnR9IGZyb20gJy4uLy4uLy4uL3NyYy9uZ3RzYy91dGlsL3NyYy90eXBlc2NyaXB0JztcblxuZXhwb3J0IGludGVyZmFjZSBFeHBvcnREZWNsYXJhdGlvbiB7XG4gIG5hbWU6IHN0cmluZztcbiAgZGVjbGFyYXRpb246IERlY2xhcmF0aW9uO1xufVxuXG4vKipcbiAqIEEgQ29tbW9uSlMgb3IgVU1EIHdpbGRjYXJkIHJlLWV4cG9ydCBzdGF0ZW1lbnQuXG4gKlxuICogVGhlIENvbW1vbkpTIG9yIFVNRCB2ZXJzaW9uIG9mIGBleHBvcnQgKiBmcm9tICdibGFoJztgLlxuICpcbiAqIFRoZXNlIHN0YXRlbWVudHMgY2FuIGhhdmUgc2V2ZXJhbCBmb3JtcyAoZGVwZW5kaW5nLCBmb3IgZXhhbXBsZSwgb24gd2hldGhlclxuICogdGhlIFR5cGVTY3JpcHQgaGVscGVycyBhcmUgaW1wb3J0ZWQgb3IgZW1pdHRlZCBpbmxpbmUpLiBUaGUgZXhwcmVzc2lvbiBjYW4gaGF2ZSBvbmUgb2YgdGhlXG4gKiBmb2xsb3dpbmcgZm9ybXM6XG4gKiAtIGBfX2V4cG9ydChmaXJzdEFyZylgXG4gKiAtIGBfX2V4cG9ydFN0YXIoZmlyc3RBcmcpYFxuICogLSBgdHNsaWIuX19leHBvcnQoZmlyc3RBcmcsIGV4cG9ydHMpYFxuICogLSBgdHNsaWIuX19leHBvcnRTdGFyKGZpcnN0QXJnLCBleHBvcnRzKWBcbiAqXG4gKiBJbiBhbGwgY2FzZXMsIHdlIG9ubHkgY2FyZSBhYm91dCBgZmlyc3RBcmdgLCB3aGljaCBpcyB0aGUgZmlyc3QgYXJndW1lbnQgb2YgdGhlIHJlLWV4cG9ydCBjYWxsXG4gKiBleHByZXNzaW9uIGFuZCBjYW4gYmUgZWl0aGVyIGEgYHJlcXVpcmUoJy4uLicpYCBjYWxsIG9yIGFuIGlkZW50aWZpZXIgKGluaXRpYWxpemVkIHZpYSBhXG4gKiBgcmVxdWlyZSgnLi4uJylgIGNhbGwpLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFdpbGRjYXJkUmVleHBvcnRTdGF0ZW1lbnQgZXh0ZW5kcyB0cy5FeHByZXNzaW9uU3RhdGVtZW50IHtcbiAgZXhwcmVzc2lvbjogdHMuQ2FsbEV4cHJlc3Npb247XG59XG5cbi8qKlxuICogQSBDb21tb25KUyBvciBVTUQgcmUtZXhwb3J0IHN0YXRlbWVudCB1c2luZyBhbiBgT2JqZWN0LmRlZmluZVByb3BlcnR5KClgIGNhbGwuXG4gKiBGb3IgZXhhbXBsZTpcbiAqXG4gKiBgYGBcbiAqIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIjxleHBvcnRlZC1pZD5cIixcbiAqICAgICB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gPGltcG9ydGVkLWlkPjsgfSB9KTtcbiAqIGBgYFxuICovXG5leHBvcnQgaW50ZXJmYWNlIERlZmluZVByb3BlcnR5UmVleHBvcnRTdGF0ZW1lbnQgZXh0ZW5kcyB0cy5FeHByZXNzaW9uU3RhdGVtZW50IHtcbiAgZXhwcmVzc2lvbjogdHMuQ2FsbEV4cHJlc3Npb24mXG4gICAgICB7YXJndW1lbnRzOiBbdHMuSWRlbnRpZmllciwgdHMuU3RyaW5nTGl0ZXJhbCwgdHMuT2JqZWN0TGl0ZXJhbEV4cHJlc3Npb25dfTtcbn1cblxuLyoqXG4gKiBBIGNhbGwgZXhwcmVzc2lvbiB0aGF0IGhhcyBhIHN0cmluZyBsaXRlcmFsIGZvciBpdHMgZmlyc3QgYXJndW1lbnQuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUmVxdWlyZUNhbGwgZXh0ZW5kcyB0cy5DYWxsRXhwcmVzc2lvbiB7XG4gIGFyZ3VtZW50czogdHMuQ2FsbEV4cHJlc3Npb25bJ2FyZ3VtZW50cyddJlt0cy5TdHJpbmdMaXRlcmFsXTtcbn1cblxuXG4vKipcbiAqIFJldHVybiB0aGUgXCJuYW1lc3BhY2VcIiBvZiB0aGUgc3BlY2lmaWVkIGB0cy5JZGVudGlmaWVyYCBpZiB0aGUgaWRlbnRpZmllciBpcyB0aGUgUkhTIG9mIGFcbiAqIHByb3BlcnR5IGFjY2VzcyBleHByZXNzaW9uLCBpLmUuIGFuIGV4cHJlc3Npb24gb2YgdGhlIGZvcm0gYDxuYW1lc3BhY2U+LjxpZD5gIChpbiB3aGljaCBjYXNlIGFcbiAqIGB0cy5JZGVudGlmaWVyYCBjb3JyZXNwb25kaW5nIHRvIGA8bmFtZXNwYWNlPmAgd2lsbCBiZSByZXR1cm5lZCkuIE90aGVyd2lzZSByZXR1cm4gYG51bGxgLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZmluZE5hbWVzcGFjZU9mSWRlbnRpZmllcihpZDogdHMuSWRlbnRpZmllcik6IHRzLklkZW50aWZpZXJ8bnVsbCB7XG4gIHJldHVybiBpZC5wYXJlbnQgJiYgdHMuaXNQcm9wZXJ0eUFjY2Vzc0V4cHJlc3Npb24oaWQucGFyZW50KSAmJiBpZC5wYXJlbnQubmFtZSA9PT0gaWQgJiZcbiAgICAgICAgICB0cy5pc0lkZW50aWZpZXIoaWQucGFyZW50LmV4cHJlc3Npb24pID9cbiAgICAgIGlkLnBhcmVudC5leHByZXNzaW9uIDpcbiAgICAgIG51bGw7XG59XG5cbi8qKlxuICogUmV0dXJuIHRoZSBgUmVxdWlyZUNhbGxgIHRoYXQgaXMgdXNlZCB0byBpbml0aWFsaXplIHRoZSBzcGVjaWZpZWQgYHRzLklkZW50aWZpZXJgLCBpZiB0aGVcbiAqIHNwZWNpZmllZCBpbmRlbnRpZmllciB3YXMgaW5kZWVkIGluaXRpYWxpemVkIHdpdGggYSByZXF1aXJlIGNhbGwgaW4gYSBkZWNsYXJhdGlvbiBvZiB0aGUgZm9ybTpcbiAqIGB2YXIgPGlkPiA9IHJlcXVpcmUoJy4uLicpYFxuICovXG5leHBvcnQgZnVuY3Rpb24gZmluZFJlcXVpcmVDYWxsUmVmZXJlbmNlKGlkOiB0cy5JZGVudGlmaWVyLCBjaGVja2VyOiB0cy5UeXBlQ2hlY2tlcik6IFJlcXVpcmVDYWxsfFxuICAgIG51bGwge1xuICBjb25zdCBzeW1ib2wgPSBjaGVja2VyLmdldFN5bWJvbEF0TG9jYXRpb24oaWQpIHx8IG51bGw7XG4gIGNvbnN0IGRlY2xhcmF0aW9uID0gc3ltYm9sPy52YWx1ZURlY2xhcmF0aW9uID8/IHN5bWJvbD8uZGVjbGFyYXRpb25zPy5bMF07XG4gIGNvbnN0IGluaXRpYWxpemVyID1cbiAgICAgIGRlY2xhcmF0aW9uICYmIHRzLmlzVmFyaWFibGVEZWNsYXJhdGlvbihkZWNsYXJhdGlvbikgJiYgZGVjbGFyYXRpb24uaW5pdGlhbGl6ZXIgfHwgbnVsbDtcbiAgcmV0dXJuIGluaXRpYWxpemVyICYmIGlzUmVxdWlyZUNhbGwoaW5pdGlhbGl6ZXIpID8gaW5pdGlhbGl6ZXIgOiBudWxsO1xufVxuXG4vKipcbiAqIENoZWNrIHdoZXRoZXIgdGhlIHNwZWNpZmllZCBgdHMuU3RhdGVtZW50YCBpcyBhIHdpbGRjYXJkIHJlLWV4cG9ydCBzdGF0ZW1lbnQuXG4gKiBJLkUuIGFuIGV4cHJlc3Npb24gc3RhdGVtZW50IG9mIG9uZSBvZiB0aGUgZm9sbG93aW5nIGZvcm1zOlxuICogLSBgX19leHBvcnQoPGZvbz4pYFxuICogLSBgX19leHBvcnRTdGFyKDxmb28+KWBcbiAqIC0gYHRzbGliLl9fZXhwb3J0KDxmb28+LCBleHBvcnRzKWBcbiAqIC0gYHRzbGliLl9fZXhwb3J0U3Rhcig8Zm9vPiwgZXhwb3J0cylgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1dpbGRjYXJkUmVleHBvcnRTdGF0ZW1lbnQoc3RtdDogdHMuU3RhdGVtZW50KTogc3RtdCBpcyBXaWxkY2FyZFJlZXhwb3J0U3RhdGVtZW50IHtcbiAgLy8gRW5zdXJlIGl0IGlzIGEgY2FsbCBleHByZXNzaW9uIHN0YXRlbWVudC5cbiAgaWYgKCF0cy5pc0V4cHJlc3Npb25TdGF0ZW1lbnQoc3RtdCkgfHwgIXRzLmlzQ2FsbEV4cHJlc3Npb24oc3RtdC5leHByZXNzaW9uKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIEdldCB0aGUgY2FsbGVkIGZ1bmN0aW9uIGlkZW50aWZpZXIuXG4gIC8vIE5PVEU6IEN1cnJlbnRseSwgaXQgc2VlbXMgdGhhdCBgX19leHBvcnQoKWAgaXMgdXNlZCB3aGVuIGVtaXR0aW5nIGhlbHBlcnMgaW5saW5lIGFuZFxuICAvLyAgICAgICBgX19leHBvcnRTdGFyKClgIHdoZW4gaW1wb3J0aW5nIHRoZW1cbiAgLy8gICAgICAgKFtzb3VyY2VdKGh0dHBzOi8vZ2l0aHViLmNvbS9taWNyb3NvZnQvVHlwZVNjcmlwdC9ibG9iL2Q3YzgzZjAyMy9zcmMvY29tcGlsZXIvdHJhbnNmb3JtZXJzL21vZHVsZS9tb2R1bGUudHMjTDE3OTYtTDE3OTcpKS5cbiAgLy8gICAgICAgU28sIHRoZW9yZXRpY2FsbHksIHdlIG9ubHkgY2FyZSBhYm91dCB0aGUgZm9ybWF0cyBgX19leHBvcnQoPGZvbz4pYCBhbmRcbiAgLy8gICAgICAgYHRzbGliLl9fZXhwb3J0U3Rhcig8Zm9vPiwgZXhwb3J0cylgLlxuICAvLyAgICAgICBUaGUgY3VycmVudCBpbXBsZW1lbnRhdGlvbiBhY2NlcHRzIHRoZSBvdGhlciB0d28gZm9ybWF0cyAoYF9fZXhwb3J0U3RhciguLi4pYCBhbmRcbiAgLy8gICAgICAgYHRzbGliLl9fZXhwb3J0KC4uLilgKSBhcyB3ZWxsIHRvIGJlIG1vcmUgZnV0dXJlLXByb29mIChnaXZlbiB0aGF0IGl0IGlzIHVubGlrZWx5IHRoYXRcbiAgLy8gICAgICAgdGhleSB3aWxsIGludHJvZHVjZSBmYWxzZSBwb3NpdGl2ZXMpLlxuICBsZXQgZm5OYW1lOiBzdHJpbmd8bnVsbCA9IG51bGw7XG4gIGlmICh0cy5pc0lkZW50aWZpZXIoc3RtdC5leHByZXNzaW9uLmV4cHJlc3Npb24pKSB7XG4gICAgLy8gU3RhdGVtZW50IG9mIHRoZSBmb3JtIGBzb21lRm4oLi4uKWAuXG4gICAgZm5OYW1lID0gc3RtdC5leHByZXNzaW9uLmV4cHJlc3Npb24udGV4dDtcbiAgfSBlbHNlIGlmIChcbiAgICAgIHRzLmlzUHJvcGVydHlBY2Nlc3NFeHByZXNzaW9uKHN0bXQuZXhwcmVzc2lvbi5leHByZXNzaW9uKSAmJlxuICAgICAgdHMuaXNJZGVudGlmaWVyKHN0bXQuZXhwcmVzc2lvbi5leHByZXNzaW9uLm5hbWUpKSB7XG4gICAgLy8gU3RhdGVtZW50IG9mIHRoZSBmb3JtIGB0c2xpYi5zb21lRm4oLi4uKWAuXG4gICAgZm5OYW1lID0gc3RtdC5leHByZXNzaW9uLmV4cHJlc3Npb24ubmFtZS50ZXh0O1xuICB9XG5cbiAgLy8gRW5zdXJlIHRoZSBjYWxsZWQgZnVuY3Rpb24gaXMgZWl0aGVyIGBfX2V4cG9ydCgpYCBvciBgX19leHBvcnRTdGFyKClgLlxuICBpZiAoKGZuTmFtZSAhPT0gJ19fZXhwb3J0JykgJiYgKGZuTmFtZSAhPT0gJ19fZXhwb3J0U3RhcicpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gRW5zdXJlIHRoZXJlIGlzIGF0IGxlYXN0IG9uZSBhcmd1bWVudC5cbiAgLy8gKFRoZSBmaXJzdCBhcmd1bWVudCBpcyB0aGUgZXhwb3J0ZWQgdGhpbmcgYW5kIHRoZXJlIHdpbGwgYmUgYSBzZWNvbmQgYGV4cG9ydHNgIGFyZ3VtZW50IGluIHRoZVxuICAvLyBjYXNlIG9mIGltcG9ydGVkIGhlbHBlcnMpLlxuICByZXR1cm4gc3RtdC5leHByZXNzaW9uLmFyZ3VtZW50cy5sZW5ndGggPiAwO1xufVxuXG5cbi8qKlxuICogQ2hlY2sgd2hldGhlciB0aGUgc3RhdGVtZW50IGlzIGEgcmUtZXhwb3J0IG9mIHRoZSBmb3JtOlxuICpcbiAqIGBgYFxuICogT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiPGV4cG9ydC1uYW1lPlwiLFxuICogICAgIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiA8aW1wb3J0LW5hbWU+OyB9IH0pO1xuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0RlZmluZVByb3BlcnR5UmVleHBvcnRTdGF0ZW1lbnQoc3RtdDogdHMuU3RhdGVtZW50KTpcbiAgICBzdG10IGlzIERlZmluZVByb3BlcnR5UmVleHBvcnRTdGF0ZW1lbnQge1xuICBpZiAoIXRzLmlzRXhwcmVzc2lvblN0YXRlbWVudChzdG10KSB8fCAhdHMuaXNDYWxsRXhwcmVzc2lvbihzdG10LmV4cHJlc3Npb24pKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gQ2hlY2sgZm9yIE9iamVjdC5kZWZpbmVQcm9wZXJ0eVxuICBpZiAoIXRzLmlzUHJvcGVydHlBY2Nlc3NFeHByZXNzaW9uKHN0bXQuZXhwcmVzc2lvbi5leHByZXNzaW9uKSB8fFxuICAgICAgIXRzLmlzSWRlbnRpZmllcihzdG10LmV4cHJlc3Npb24uZXhwcmVzc2lvbi5leHByZXNzaW9uKSB8fFxuICAgICAgc3RtdC5leHByZXNzaW9uLmV4cHJlc3Npb24uZXhwcmVzc2lvbi50ZXh0ICE9PSAnT2JqZWN0JyB8fFxuICAgICAgIXRzLmlzSWRlbnRpZmllcihzdG10LmV4cHJlc3Npb24uZXhwcmVzc2lvbi5uYW1lKSB8fFxuICAgICAgc3RtdC5leHByZXNzaW9uLmV4cHJlc3Npb24ubmFtZS50ZXh0ICE9PSAnZGVmaW5lUHJvcGVydHknKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgY29uc3QgYXJncyA9IHN0bXQuZXhwcmVzc2lvbi5hcmd1bWVudHM7XG4gIGlmIChhcmdzLmxlbmd0aCAhPT0gMykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBjb25zdCBleHBvcnRzT2JqZWN0ID0gYXJnc1swXTtcbiAgaWYgKCF0cy5pc0lkZW50aWZpZXIoZXhwb3J0c09iamVjdCkgfHwgZXhwb3J0c09iamVjdC50ZXh0ICE9PSAnZXhwb3J0cycpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBjb25zdCBwcm9wZXJ0eUtleSA9IGFyZ3NbMV07XG4gIGlmICghdHMuaXNTdHJpbmdMaXRlcmFsKHByb3BlcnR5S2V5KSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGNvbnN0IHByb3BlcnR5RGVzY3JpcHRvciA9IGFyZ3NbMl07XG4gIGlmICghdHMuaXNPYmplY3RMaXRlcmFsRXhwcmVzc2lvbihwcm9wZXJ0eURlc2NyaXB0b3IpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIChwcm9wZXJ0eURlc2NyaXB0b3IucHJvcGVydGllcy5zb21lKFxuICAgICAgcHJvcCA9PiBwcm9wLm5hbWUgIT09IHVuZGVmaW5lZCAmJiB0cy5pc0lkZW50aWZpZXIocHJvcC5uYW1lKSAmJiBwcm9wLm5hbWUudGV4dCA9PT0gJ2dldCcpKTtcbn1cblxuLyoqXG4gKiBFeHRyYWN0IHRoZSBcInZhbHVlXCIgb2YgdGhlIGdldHRlciBpbiBhIGBkZWZpbmVQcm9wZXJ0eWAgc3RhdGVtZW50LlxuICpcbiAqIFRoaXMgd2lsbCByZXR1cm4gdGhlIGB0cy5FeHByZXNzaW9uYCB2YWx1ZSBvZiBhIHNpbmdsZSBgcmV0dXJuYCBzdGF0ZW1lbnQgaW4gdGhlIGBnZXRgIG1ldGhvZFxuICogb2YgdGhlIHByb3BlcnR5IGRlZmluaXRpb24gb2JqZWN0LCBvciBgbnVsbGAgaWYgdGhhdCBpcyBub3QgcG9zc2libGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBleHRyYWN0R2V0dGVyRm5FeHByZXNzaW9uKHN0YXRlbWVudDogRGVmaW5lUHJvcGVydHlSZWV4cG9ydFN0YXRlbWVudCk6XG4gICAgdHMuRXhwcmVzc2lvbnxudWxsIHtcbiAgY29uc3QgYXJncyA9IHN0YXRlbWVudC5leHByZXNzaW9uLmFyZ3VtZW50cztcbiAgY29uc3QgZ2V0dGVyRm4gPSBhcmdzWzJdLnByb3BlcnRpZXMuZmluZChcbiAgICAgIHByb3AgPT4gcHJvcC5uYW1lICE9PSB1bmRlZmluZWQgJiYgdHMuaXNJZGVudGlmaWVyKHByb3AubmFtZSkgJiYgcHJvcC5uYW1lLnRleHQgPT09ICdnZXQnKTtcbiAgaWYgKGdldHRlckZuID09PSB1bmRlZmluZWQgfHwgIXRzLmlzUHJvcGVydHlBc3NpZ25tZW50KGdldHRlckZuKSB8fFxuICAgICAgIXRzLmlzRnVuY3Rpb25FeHByZXNzaW9uKGdldHRlckZuLmluaXRpYWxpemVyKSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGNvbnN0IHJldHVyblN0YXRlbWVudCA9IGdldHRlckZuLmluaXRpYWxpemVyLmJvZHkuc3RhdGVtZW50c1swXTtcbiAgaWYgKCF0cy5pc1JldHVyblN0YXRlbWVudChyZXR1cm5TdGF0ZW1lbnQpIHx8IHJldHVyblN0YXRlbWVudC5leHByZXNzaW9uID09PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICByZXR1cm4gcmV0dXJuU3RhdGVtZW50LmV4cHJlc3Npb247XG59XG5cbi8qKlxuICogQ2hlY2sgd2hldGhlciB0aGUgc3BlY2lmaWVkIGB0cy5Ob2RlYCByZXByZXNlbnRzIGEgYHJlcXVpcmUoKWAgY2FsbCwgaS5lLiBhbiBjYWxsIGV4cHJlc3Npb24gb2ZcbiAqIHRoZSBmb3JtOiBgcmVxdWlyZSgnPGZvbz4nKWBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzUmVxdWlyZUNhbGwobm9kZTogdHMuTm9kZSk6IG5vZGUgaXMgUmVxdWlyZUNhbGwge1xuICByZXR1cm4gdHMuaXNDYWxsRXhwcmVzc2lvbihub2RlKSAmJiB0cy5pc0lkZW50aWZpZXIobm9kZS5leHByZXNzaW9uKSAmJlxuICAgICAgbm9kZS5leHByZXNzaW9uLnRleHQgPT09ICdyZXF1aXJlJyAmJiBub2RlLmFyZ3VtZW50cy5sZW5ndGggPT09IDEgJiZcbiAgICAgIHRzLmlzU3RyaW5nTGl0ZXJhbChub2RlLmFyZ3VtZW50c1swXSk7XG59XG5cbi8qKlxuICogQ2hlY2sgd2hldGhlciB0aGUgc3BlY2lmaWVkIGBwYXRoYCBpcyBhbiBcImV4dGVybmFsXCIgaW1wb3J0LlxuICogSW4gb3RoZXIgd29yZHMsIHRoYXQgaXQgY29tZXMgZnJvbSBhIGVudHJ5LXBvaW50IG91dHNpZGUgdGhlIGN1cnJlbnQgb25lLlxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNFeHRlcm5hbEltcG9ydChwYXRoOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgcmV0dXJuICEvXlxcLlxcLj8oXFwvfCQpLy50ZXN0KHBhdGgpO1xufVxuXG4vKipcbiAqIEEgVU1EL0NvbW1vbkpTIHN0eWxlIGV4cG9ydCBkZWNsYXJhdGlvbiBvZiB0aGUgZm9ybSBgZXhwb3J0cy48bmFtZT5gLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEV4cG9ydHNEZWNsYXJhdGlvbiBleHRlbmRzIHRzLlByb3BlcnR5QWNjZXNzRXhwcmVzc2lvbiB7XG4gIG5hbWU6IHRzLklkZW50aWZpZXI7XG4gIGV4cHJlc3Npb246IHRzLklkZW50aWZpZXI7XG4gIHBhcmVudDogRXhwb3J0c0Fzc2lnbm1lbnQ7XG59XG5cbi8qKlxuICogQ2hlY2sgd2hldGhlciB0aGUgc3BlY2lmaWVkIGBub2RlYCBpcyBhIHByb3BlcnR5IGFjY2VzcyBleHByZXNzaW9uIG9mIHRoZSBmb3JtXG4gKiBgZXhwb3J0cy48Zm9vPmAuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0V4cG9ydHNEZWNsYXJhdGlvbihleHByOiB0cy5Ob2RlKTogZXhwciBpcyBFeHBvcnRzRGVjbGFyYXRpb24ge1xuICByZXR1cm4gZXhwci5wYXJlbnQgJiYgaXNFeHBvcnRzQXNzaWdubWVudChleHByLnBhcmVudCk7XG59XG5cbi8qKlxuICogQSBVTUQvQ29tbW9uSlMgc3R5bGUgZXhwb3J0IGFzc2lnbm1lbnQgb2YgdGhlIGZvcm0gYGV4cG9ydHMuPGZvbz4gPSA8YmFyPmAuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRXhwb3J0c0Fzc2lnbm1lbnQgZXh0ZW5kcyB0cy5CaW5hcnlFeHByZXNzaW9uIHtcbiAgbGVmdDogRXhwb3J0c0RlY2xhcmF0aW9uO1xufVxuXG4vKipcbiAqIENoZWNrIHdoZXRoZXIgdGhlIHNwZWNpZmllZCBgbm9kZWAgaXMgYW4gYXNzaWdubWVudCBleHByZXNzaW9uIG9mIHRoZSBmb3JtXG4gKiBgZXhwb3J0cy48Zm9vPiA9IDxiYXI+YC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzRXhwb3J0c0Fzc2lnbm1lbnQoZXhwcjogdHMuTm9kZSk6IGV4cHIgaXMgRXhwb3J0c0Fzc2lnbm1lbnQge1xuICByZXR1cm4gaXNBc3NpZ25tZW50KGV4cHIpICYmIHRzLmlzUHJvcGVydHlBY2Nlc3NFeHByZXNzaW9uKGV4cHIubGVmdCkgJiZcbiAgICAgIHRzLmlzSWRlbnRpZmllcihleHByLmxlZnQuZXhwcmVzc2lvbikgJiYgZXhwci5sZWZ0LmV4cHJlc3Npb24udGV4dCA9PT0gJ2V4cG9ydHMnICYmXG4gICAgICB0cy5pc0lkZW50aWZpZXIoZXhwci5sZWZ0Lm5hbWUpO1xufVxuXG4vKipcbiAqIEFuIGV4cHJlc3Npb24gc3RhdGVtZW50IG9mIHRoZSBmb3JtIGBleHBvcnRzLjxmb28+ID0gPGJhcj47YC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBFeHBvcnRzU3RhdGVtZW50IGV4dGVuZHMgdHMuRXhwcmVzc2lvblN0YXRlbWVudCB7XG4gIGV4cHJlc3Npb246IEV4cG9ydHNBc3NpZ25tZW50O1xufVxuXG4vKipcbiAqIENoZWNrIHdoZXRoZXIgdGhlIHNwZWNpZmllZCBgc3RtdGAgaXMgYW4gZXhwcmVzc2lvbiBzdGF0ZW1lbnQgb2YgdGhlIGZvcm1cbiAqIGBleHBvcnRzLjxmb28+ID0gPGJhcj47YC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzRXhwb3J0c1N0YXRlbWVudChzdG10OiB0cy5Ob2RlKTogc3RtdCBpcyBFeHBvcnRzU3RhdGVtZW50IHtcbiAgcmV0dXJuIHRzLmlzRXhwcmVzc2lvblN0YXRlbWVudChzdG10KSAmJiBpc0V4cG9ydHNBc3NpZ25tZW50KHN0bXQuZXhwcmVzc2lvbik7XG59XG5cbi8qKlxuICogRmluZCB0aGUgZmFyIHJpZ2h0IGhhbmQgc2lkZSBvZiBhIHNlcXVlbmNlIG9mIGFsaWFzZWQgYXNzaWduZW1lbnRzIG9mIHRoZSBmb3JtXG4gKlxuICogYGBgXG4gKiBleHBvcnRzLk15Q2xhc3MgPSBhbGlhczEgPSBhbGlhczIgPSA8PGRlY2xhcmF0aW9uPj5cbiAqIGBgYFxuICpcbiAqIEBwYXJhbSBub2RlIHRoZSBleHByZXNzaW9uIHRvIHBhcnNlXG4gKiBAcmV0dXJucyB0aGUgb3JpZ2luYWwgYG5vZGVgIG9yIHRoZSBmYXIgcmlnaHQgZXhwcmVzc2lvbiBvZiBhIHNlcmllcyBvZiBhc3NpZ25tZW50cy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNraXBBbGlhc2VzKG5vZGU6IHRzLkV4cHJlc3Npb24pOiB0cy5FeHByZXNzaW9uIHtcbiAgd2hpbGUgKGlzQXNzaWdubWVudChub2RlKSkge1xuICAgIG5vZGUgPSBub2RlLnJpZ2h0O1xuICB9XG4gIHJldHVybiBub2RlO1xufVxuIl19