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
        define("@angular/compiler-cli/src/ngtsc/typecheck/src/ts_util", ["require", "exports", "tslib", "typescript"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isAccessExpression = exports.checkIfGenericTypesAreUnbound = exports.checkIfClassIsExported = exports.tsCallMethod = exports.tsCreateVariable = exports.tsCreateTypeQueryForCoercedInput = exports.tsDeclareVariable = exports.tsCreateElement = exports.tsCastToAny = void 0;
    var tslib_1 = require("tslib");
    var ts = require("typescript");
    /**
     * A `Set` of `ts.SyntaxKind`s of `ts.Expression` which are safe to wrap in a `ts.AsExpression`
     * without needing to be wrapped in parentheses.
     *
     * For example, `foo.bar()` is a `ts.CallExpression`, and can be safely cast to `any` with
     * `foo.bar() as any`. however, `foo !== bar` is a `ts.BinaryExpression`, and attempting to cast
     * without the parentheses yields the expression `foo !== bar as any`. This is semantically
     * equivalent to `foo !== (bar as any)`, which is not what was intended. Thus,
     * `ts.BinaryExpression`s need to be wrapped in parentheses before casting.
     */
    //
    var SAFE_TO_CAST_WITHOUT_PARENS = new Set([
        // Expressions which are already parenthesized can be cast without further wrapping.
        ts.SyntaxKind.ParenthesizedExpression,
        // Expressions which form a single lexical unit leave no room for precedence issues with the cast.
        ts.SyntaxKind.Identifier,
        ts.SyntaxKind.CallExpression,
        ts.SyntaxKind.NonNullExpression,
        ts.SyntaxKind.ElementAccessExpression,
        ts.SyntaxKind.PropertyAccessExpression,
        ts.SyntaxKind.ArrayLiteralExpression,
        ts.SyntaxKind.ObjectLiteralExpression,
        // The same goes for various literals.
        ts.SyntaxKind.StringLiteral,
        ts.SyntaxKind.NumericLiteral,
        ts.SyntaxKind.TrueKeyword,
        ts.SyntaxKind.FalseKeyword,
        ts.SyntaxKind.NullKeyword,
        ts.SyntaxKind.UndefinedKeyword,
    ]);
    function tsCastToAny(expr) {
        // Wrap `expr` in parentheses if needed (see `SAFE_TO_CAST_WITHOUT_PARENS` above).
        if (!SAFE_TO_CAST_WITHOUT_PARENS.has(expr.kind)) {
            expr = ts.createParen(expr);
        }
        // The outer expression is always wrapped in parentheses.
        return ts.createParen(ts.createAsExpression(expr, ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)));
    }
    exports.tsCastToAny = tsCastToAny;
    /**
     * Create an expression which instantiates an element by its HTML tagName.
     *
     * Thanks to narrowing of `document.createElement()`, this expression will have its type inferred
     * based on the tag name, including for custom elements that have appropriate .d.ts definitions.
     */
    function tsCreateElement(tagName) {
        var createElement = ts.createPropertyAccess(
        /* expression */ ts.createIdentifier('document'), 'createElement');
        return ts.createCall(
        /* expression */ createElement, 
        /* typeArguments */ undefined, 
        /* argumentsArray */ [ts.createLiteral(tagName)]);
    }
    exports.tsCreateElement = tsCreateElement;
    /**
     * Create a `ts.VariableStatement` which declares a variable without explicit initialization.
     *
     * The initializer `null!` is used to bypass strict variable initialization checks.
     *
     * Unlike with `tsCreateVariable`, the type of the variable is explicitly specified.
     */
    function tsDeclareVariable(id, type) {
        var decl = ts.createVariableDeclaration(
        /* name */ id, 
        /* type */ type, 
        /* initializer */ ts.createNonNullExpression(ts.createNull()));
        return ts.createVariableStatement(
        /* modifiers */ undefined, 
        /* declarationList */ [decl]);
    }
    exports.tsDeclareVariable = tsDeclareVariable;
    /**
     * Creates a `ts.TypeQueryNode` for a coerced input.
     *
     * For example: `typeof MatInput.ngAcceptInputType_value`, where MatInput is `typeName` and `value`
     * is the `coercedInputName`.
     *
     * @param typeName The `EntityName` of the Directive where the static coerced input is defined.
     * @param coercedInputName The field name of the coerced input.
     */
    function tsCreateTypeQueryForCoercedInput(typeName, coercedInputName) {
        return ts.createTypeQueryNode(ts.createQualifiedName(typeName, "ngAcceptInputType_" + coercedInputName));
    }
    exports.tsCreateTypeQueryForCoercedInput = tsCreateTypeQueryForCoercedInput;
    /**
     * Create a `ts.VariableStatement` that initializes a variable with a given expression.
     *
     * Unlike with `tsDeclareVariable`, the type of the variable is inferred from the initializer
     * expression.
     */
    function tsCreateVariable(id, initializer) {
        var decl = ts.createVariableDeclaration(
        /* name */ id, 
        /* type */ undefined, 
        /* initializer */ initializer);
        return ts.createVariableStatement(
        /* modifiers */ undefined, 
        /* declarationList */ [decl]);
    }
    exports.tsCreateVariable = tsCreateVariable;
    /**
     * Construct a `ts.CallExpression` that calls a method on a receiver.
     */
    function tsCallMethod(receiver, methodName, args) {
        if (args === void 0) { args = []; }
        var methodAccess = ts.createPropertyAccess(receiver, methodName);
        return ts.createCall(
        /* expression */ methodAccess, 
        /* typeArguments */ undefined, 
        /* argumentsArray */ args);
    }
    exports.tsCallMethod = tsCallMethod;
    function checkIfClassIsExported(node) {
        // A class is exported if one of two conditions is met:
        // 1) it has the 'export' modifier.
        // 2) it's declared at the top level, and there is an export statement for the class.
        if (node.modifiers !== undefined &&
            node.modifiers.some(function (mod) { return mod.kind === ts.SyntaxKind.ExportKeyword; })) {
            // Condition 1 is true, the class has an 'export' keyword attached.
            return true;
        }
        else if (node.parent !== undefined && ts.isSourceFile(node.parent) &&
            checkIfFileHasExport(node.parent, node.name.text)) {
            // Condition 2 is true, the class is exported via an 'export {}' statement.
            return true;
        }
        return false;
    }
    exports.checkIfClassIsExported = checkIfClassIsExported;
    function checkIfFileHasExport(sf, name) {
        var e_1, _a, e_2, _b;
        try {
            for (var _c = tslib_1.__values(sf.statements), _d = _c.next(); !_d.done; _d = _c.next()) {
                var stmt = _d.value;
                if (ts.isExportDeclaration(stmt) && stmt.exportClause !== undefined &&
                    ts.isNamedExports(stmt.exportClause)) {
                    try {
                        for (var _e = (e_2 = void 0, tslib_1.__values(stmt.exportClause.elements)), _f = _e.next(); !_f.done; _f = _e.next()) {
                            var element = _f.value;
                            if (element.propertyName === undefined && element.name.text === name) {
                                // The named declaration is directly exported.
                                return true;
                            }
                            else if (element.propertyName !== undefined && element.propertyName.text == name) {
                                // The named declaration is exported via an alias.
                                return true;
                            }
                        }
                    }
                    catch (e_2_1) { e_2 = { error: e_2_1 }; }
                    finally {
                        try {
                            if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                        }
                        finally { if (e_2) throw e_2.error; }
                    }
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return false;
    }
    function checkIfGenericTypesAreUnbound(node) {
        if (node.typeParameters === undefined) {
            return true;
        }
        return node.typeParameters.every(function (param) { return param.constraint === undefined; });
    }
    exports.checkIfGenericTypesAreUnbound = checkIfGenericTypesAreUnbound;
    function isAccessExpression(node) {
        return ts.isPropertyAccessExpression(node) || ts.isElementAccessExpression(node);
    }
    exports.isAccessExpression = isAccessExpression;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHNfdXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvbmd0c2MvdHlwZWNoZWNrL3NyYy90c191dGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCwrQkFBaUM7SUFHakM7Ozs7Ozs7OztPQVNHO0lBQ0gsRUFBRTtJQUNGLElBQU0sMkJBQTJCLEdBQXVCLElBQUksR0FBRyxDQUFDO1FBQzlELG9GQUFvRjtRQUNwRixFQUFFLENBQUMsVUFBVSxDQUFDLHVCQUF1QjtRQUVyQyxrR0FBa0c7UUFDbEcsRUFBRSxDQUFDLFVBQVUsQ0FBQyxVQUFVO1FBQ3hCLEVBQUUsQ0FBQyxVQUFVLENBQUMsY0FBYztRQUM1QixFQUFFLENBQUMsVUFBVSxDQUFDLGlCQUFpQjtRQUMvQixFQUFFLENBQUMsVUFBVSxDQUFDLHVCQUF1QjtRQUNyQyxFQUFFLENBQUMsVUFBVSxDQUFDLHdCQUF3QjtRQUN0QyxFQUFFLENBQUMsVUFBVSxDQUFDLHNCQUFzQjtRQUNwQyxFQUFFLENBQUMsVUFBVSxDQUFDLHVCQUF1QjtRQUVyQyxzQ0FBc0M7UUFDdEMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxhQUFhO1FBQzNCLEVBQUUsQ0FBQyxVQUFVLENBQUMsY0FBYztRQUM1QixFQUFFLENBQUMsVUFBVSxDQUFDLFdBQVc7UUFDekIsRUFBRSxDQUFDLFVBQVUsQ0FBQyxZQUFZO1FBQzFCLEVBQUUsQ0FBQyxVQUFVLENBQUMsV0FBVztRQUN6QixFQUFFLENBQUMsVUFBVSxDQUFDLGdCQUFnQjtLQUMvQixDQUFDLENBQUM7SUFFSCxTQUFnQixXQUFXLENBQUMsSUFBbUI7UUFDN0Msa0ZBQWtGO1FBQ2xGLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQy9DLElBQUksR0FBRyxF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QUNELE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQztJQUVELFNBQWdCLDZCQUE2QixDQUFDLElBQTJDO1FBRXZGLElBQUksSUFBSSxDQUFDLGNBQWMsS0FBSyxTQUFTLEVBQUU7WUFDckMsT0FBTyxJQUFJLENBQUM7U0FDYjtRQUNELE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsVUFBQSxLQUFLLElBQUksT0FBQSxLQUFLLENBQUMsVUFBVSxLQUFLLFNBQVMsRUFBOUIsQ0FBOEIsQ0FBQyxDQUFDO0lBQzVFLENBQUM7SUFORCxzRUFNQztJQUVELFNBQWdCLGtCQUFrQixDQUFDLElBQWE7UUFFOUMsT0FBTyxFQUFFLENBQUMsMEJBQTBCLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLHlCQUF5QixDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ25GLENBQUM7SUFIRCxnREFHQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcbmltcG9ydCB7Q2xhc3NEZWNsYXJhdGlvbn0gZnJvbSAnLi4vLi4vcmVmbGVjdGlvbic7XG5cbi8qKlxuICogQSBgU2V0YCBvZiBgdHMuU3ludGF4S2luZGBzIG9mIGB0cy5FeHByZXNzaW9uYCB3aGljaCBhcmUgc2FmZSB0byB3cmFwIGluIGEgYHRzLkFzRXhwcmVzc2lvbmBcbiAqIHdpdGhvdXQgbmVlZGluZyB0byBiZSB3cmFwcGVkIGluIHBhcmVudGhlc2VzLlxuICpcbiAqIEZvciBleGFtcGxlLCBgZm9vLmJhcigpYCBpcyBhIGB0cy5DYWxsRXhwcmVzc2lvbmAsIGFuZCBjYW4gYmUgc2FmZWx5IGNhc3QgdG8gYGFueWAgd2l0aFxuICogYGZvby5iYXIoKSBhcyBhbnlgLiBob3dldmVyLCBgZm9vICE9PSBiYXJgIGlzIGEgYHRzLkJpbmFyeUV4cHJlc3Npb25gLCBhbmQgYXR0ZW1wdGluZyB0byBjYXN0XG4gKiB3aXRob3V0IHRoZSBwYXJlbnRoZXNlcyB5aWVsZHMgdGhlIGV4cHJlc3Npb24gYGZvbyAhPT0gYmFyIGFzIGFueWAuIFRoaXMgaXMgc2VtYW50aWNhbGx5XG4gKiBlcXVpdmFsZW50IHRvIGBmb28gIT09IChiYXIgYXMgYW55KWAsIHdoaWNoIGlzIG5vdCB3aGF0IHdhcyBpbnRlbmRlZC4gVGh1cyxcbiAqIGB0cy5CaW5hcnlFeHByZXNzaW9uYHMgbmVlZCB0byBiZSB3cmFwcGVkIGluIHBhcmVudGhlc2VzIGJlZm9yZSBjYXN0aW5nLlxuICovXG4vL1xuY29uc3QgU0FGRV9UT19DQVNUX1dJVEhPVVRfUEFSRU5TOiBTZXQ8dHMuU3ludGF4S2luZD4gPSBuZXcgU2V0KFtcbiAgLy8gRXhwcmVzc2lvbnMgd2hpY2ggYXJlIGFscmVhZHkgcGFyZW50aGVzaXplZCBjYW4gYmUgY2FzdCB3aXRob3V0IGZ1cnRoZXIgd3JhcHBpbmcuXG4gIHRzLlN5bnRheEtpbmQuUGFyZW50aGVzaXplZEV4cHJlc3Npb24sXG5cbiAgLy8gRXhwcmVzc2lvbnMgd2hpY2ggZm9ybSBhIHNpbmdsZSBsZXhpY2FsIHVuaXQgbGVhdmUgbm8gcm9vbSBmb3IgcHJlY2VkZW5jZSBpc3N1ZXMgd2l0aCB0aGUgY2FzdC5cbiAgdHMuU3ludGF4S2luZC5JZGVudGlmaWVyLFxuICB0cy5TeW50YXhLaW5kLkNhbGxFeHByZXNzaW9uLFxuICB0cy5TeW50YXhLaW5kLk5vbk51bGxFeHByZXNzaW9uLFxuICB0cy5TeW50YXhLaW5kLkVsZW1lbnRBY2Nlc3NFeHByZXNzaW9uLFxuICB0cy5TeW50YXhLaW5kLlByb3BlcnR5QWNjZXNzRXhwcmVzc2lvbixcbiAgdHMuU3ludGF4S2luZC5BcnJheUxpdGVyYWxFeHByZXNzaW9uLFxuICB0cy5TeW50YXhLaW5kLk9iamVjdExpdGVyYWxFeHByZXNzaW9uLFxuXG4gIC8vIFRoZSBzYW1lIGdvZXMgZm9yIHZhcmlvdXMgbGl0ZXJhbHMuXG4gIHRzLlN5bnRheEtpbmQuU3RyaW5nTGl0ZXJhbCxcbiAgdHMuU3ludGF4S2luZC5OdW1lcmljTGl0ZXJhbCxcbiAgdHMuU3ludGF4S2luZC5UcnVlS2V5d29yZCxcbiAgdHMuU3ludGF4S2luZC5GYWxzZUtleXdvcmQsXG4gIHRzLlN5bnRheEtpbmQuTnVsbEtleXdvcmQsXG4gIHRzLlN5bnRheEtpbmQuVW5kZWZpbmVkS2V5d29yZCxcbl0pO1xuXG5leHBvcnQgZnVuY3Rpb24gdHNDYXN0VG9BbnkoZXhwcjogdHMuRXhwcmVzc2lvbik6IHRzLkV4cHJlc3Npb24ge1xuICAvLyBXcmFwIGBleHByYCBpbiBwYXJlbnRoZXNlcyBpZiBuZWVkZWQgKHNlZSBgU0FGRV9UT19DQVNUX1dJVEhPVVRfUEFSRU5TYCBhYm92ZSkuXG4gIGlmICghU0FGRV9UT19DQVNUX1dJVEhPVVRfUEFSRU5TLmhhcyhleHByLmtpbmQpKSB7XG4gICAgZXhwciA9IHRzLmNyZWF0ZVBhcmVuKGV4cHIpO1xuICB9XG5cbiAgLy8gVGhlIG91dGVyIGV4cHJlc3Npb24gaXMgYWx3YXlzIHdyYXBwZWQgaW4gcGFyZW50aGVzZXMuXG4gIHJldHVybiB0cy5jcmVhdGVQYXJlbihcbiAgICAgIHRzLmNyZWF0ZUFzRXhwcmVzc2lvbihleHByLCB0cy5jcmVhdGVLZXl3b3JkVHlwZU5vZGUodHMuU3ludGF4S2luZC5BbnlLZXl3b3JkKSkpO1xufVxuXG5cbi8qKlxuICogQ3JlYXRlIGFuIGV4cHJlc3Npb24gd2hpY2ggaW5zdGFudGlhdGVzIGFuIGVsZW1lbnQgYnkgaXRzIEhUTUwgdGFnTmFtZS5cbiAqXG4gKiBUaGFua3MgdG8gbmFycm93aW5nIG9mIGBkb2N1bWVudC5jcmVhdGVFbGVtZW50KClgLCB0aGlzIGV4cHJlc3Npb24gd2lsbCBoYXZlIGl0cyB0eXBlIGluZmVycmVkXG4gKiBiYXNlZCBvbiB0aGUgdGFnIG5hbWUsIGluY2x1ZGluZyBmb3IgY3VzdG9tIGVsZW1lbnRzIHRoYXQgaGF2ZSBhcHByb3ByaWF0ZSAuZC50cyBkZWZpbml0aW9ucy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRzQ3JlYXRlRWxlbWVudCh0YWdOYW1lOiBzdHJpbmcpOiB0cy5FeHByZXNzaW9uIHtcbiAgY29uc3QgY3JlYXRlRWxlbWVudCA9IHRzLmNyZWF0ZVByb3BlcnR5QWNjZXNzKFxuICAgICAgLyogZXhwcmVzc2lvbiAqLyB0cy5jcmVhdGVJZGVudGlmaWVyKCdkb2N1bWVudCcpLCAnY3JlYXRlRWxlbWVudCcpO1xuICByZXR1cm4gdHMuY3JlYXRlQ2FsbChcbiAgICAgIC8qIGV4cHJlc3Npb24gKi8gY3JlYXRlRWxlbWVudCxcbiAgICAgIC8qIHR5cGVBcmd1bWVudHMgKi8gdW5kZWZpbmVkLFxuICAgICAgLyogYXJndW1lbnRzQXJyYXkgKi9bdHMuY3JlYXRlTGl0ZXJhbCh0YWdOYW1lKV0pO1xufVxuXG4vKipcbiAqIENyZWF0ZSBhIGB0cy5WYXJpYWJsZVN0YXRlbWVudGAgd2hpY2ggZGVjbGFyZXMgYSB2YXJpYWJsZSB3aXRob3V0IGV4cGxpY2l0IGluaXRpYWxpemF0aW9uLlxuICpcbiAqIFRoZSBpbml0aWFsaXplciBgbnVsbCFgIGlzIHVzZWQgdG8gYnlwYXNzIHN0cmljdCB2YXJpYWJsZSBpbml0aWFsaXphdGlvbiBjaGVja3MuXG4gKlxuICogVW5saWtlIHdpdGggYHRzQ3JlYXRlVmFyaWFibGVgLCB0aGUgdHlwZSBvZiB0aGUgdmFyaWFibGUgaXMgZXhwbGljaXRseSBzcGVjaWZpZWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0c0RlY2xhcmVWYXJpYWJsZShpZDogdHMuSWRlbnRpZmllciwgdHlwZTogdHMuVHlwZU5vZGUpOiB0cy5WYXJpYWJsZVN0YXRlbWVudCB7XG4gIGNvbnN0IGRlY2wgPSB0cy5jcmVhdGVWYXJpYWJsZURlY2xhcmF0aW9uKFxuICAgICAgLyogbmFtZSAqLyBpZCxcbiAgICAgIC8qIHR5cGUgKi8gdHlwZSxcbiAgICAgIC8qIGluaXRpYWxpemVyICovIHRzLmNyZWF0ZU5vbk51bGxFeHByZXNzaW9uKHRzLmNyZWF0ZU51bGwoKSkpO1xuICByZXR1cm4gdHMuY3JlYXRlVmFyaWFibGVTdGF0ZW1lbnQoXG4gICAgICAvKiBtb2RpZmllcnMgKi8gdW5kZWZpbmVkLFxuICAgICAgLyogZGVjbGFyYXRpb25MaXN0ICovW2RlY2xdKTtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgYHRzLlR5cGVRdWVyeU5vZGVgIGZvciBhIGNvZXJjZWQgaW5wdXQuXG4gKlxuICogRm9yIGV4YW1wbGU6IGB0eXBlb2YgTWF0SW5wdXQubmdBY2NlcHRJbnB1dFR5cGVfdmFsdWVgLCB3aGVyZSBNYXRJbnB1dCBpcyBgdHlwZU5hbWVgIGFuZCBgdmFsdWVgXG4gKiBpcyB0aGUgYGNvZXJjZWRJbnB1dE5hbWVgLlxuICpcbiAqIEBwYXJhbSB0eXBlTmFtZSBUaGUgYEVudGl0eU5hbWVgIG9mIHRoZSBEaXJlY3RpdmUgd2hlcmUgdGhlIHN0YXRpYyBjb2VyY2VkIGlucHV0IGlzIGRlZmluZWQuXG4gKiBAcGFyYW0gY29lcmNlZElucHV0TmFtZSBUaGUgZmllbGQgbmFtZSBvZiB0aGUgY29lcmNlZCBpbnB1dC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRzQ3JlYXRlVHlwZVF1ZXJ5Rm9yQ29lcmNlZElucHV0KFxuICAgIHR5cGVOYW1lOiB0cy5FbnRpdHlOYW1lLCBjb2VyY2VkSW5wdXROYW1lOiBzdHJpbmcpOiB0cy5UeXBlUXVlcnlOb2RlIHtcbiAgcmV0dXJuIHRzLmNyZWF0ZVR5cGVRdWVyeU5vZGUoXG4gICAgICB0cy5jcmVhdGVRdWFsaWZpZWROYW1lKHR5cGVOYW1lLCBgbmdBY2NlcHRJbnB1dFR5cGVfJHtjb2VyY2VkSW5wdXROYW1lfWApKTtcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSBgdHMuVmFyaWFibGVTdGF0ZW1lbnRgIHRoYXQgaW5pdGlhbGl6ZXMgYSB2YXJpYWJsZSB3aXRoIGEgZ2l2ZW4gZXhwcmVzc2lvbi5cbiAqXG4gKiBVbmxpa2Ugd2l0aCBgdHNEZWNsYXJlVmFyaWFibGVgLCB0aGUgdHlwZSBvZiB0aGUgdmFyaWFibGUgaXMgaW5mZXJyZWQgZnJvbSB0aGUgaW5pdGlhbGl6ZXJcbiAqIGV4cHJlc3Npb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0c0NyZWF0ZVZhcmlhYmxlKFxuICAgIGlkOiB0cy5JZGVudGlmaWVyLCBpbml0aWFsaXplcjogdHMuRXhwcmVzc2lvbik6IHRzLlZhcmlhYmxlU3RhdGVtZW50IHtcbiAgY29uc3QgZGVjbCA9IHRzLmNyZWF0ZVZhcmlhYmxlRGVjbGFyYXRpb24oXG4gICAgICAvKiBuYW1lICovIGlkLFxuICAgICAgLyogdHlwZSAqLyB1bmRlZmluZWQsXG4gICAgICAvKiBpbml0aWFsaXplciAqLyBpbml0aWFsaXplcik7XG4gIHJldHVybiB0cy5jcmVhdGVWYXJpYWJsZVN0YXRlbWVudChcbiAgICAgIC8qIG1vZGlmaWVycyAqLyB1bmRlZmluZWQsXG4gICAgICAvKiBkZWNsYXJhdGlvbkxpc3QgKi9bZGVjbF0pO1xufVxuXG4vKipcbiAqIENvbnN0cnVjdCBhIGB0cy5DYWxsRXhwcmVzc2lvbmAgdGhhdCBjYWxscyBhIG1ldGhvZCBvbiBhIHJlY2VpdmVyLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdHNDYWxsTWV0aG9kKFxuICAgIHJlY2VpdmVyOiB0cy5FeHByZXNzaW9uLCBtZXRob2ROYW1lOiBzdHJpbmcsIGFyZ3M6IHRzLkV4cHJlc3Npb25bXSA9IFtdKTogdHMuQ2FsbEV4cHJlc3Npb24ge1xuICBjb25zdCBtZXRob2RBY2Nlc3MgPSB0cy5jcmVhdGVQcm9wZXJ0eUFjY2VzcyhyZWNlaXZlciwgbWV0aG9kTmFtZSk7XG4gIHJldHVybiB0cy5jcmVhdGVDYWxsKFxuICAgICAgLyogZXhwcmVzc2lvbiAqLyBtZXRob2RBY2Nlc3MsXG4gICAgICAvKiB0eXBlQXJndW1lbnRzICovIHVuZGVmaW5lZCxcbiAgICAgIC8qIGFyZ3VtZW50c0FycmF5ICovIGFyZ3MpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tJZkNsYXNzSXNFeHBvcnRlZChub2RlOiBDbGFzc0RlY2xhcmF0aW9uKTogYm9vbGVhbiB7XG4gIC8vIEEgY2xhc3MgaXMgZXhwb3J0ZWQgaWYgb25lIG9mIHR3byBjb25kaXRpb25zIGlzIG1ldDpcbiAgLy8gMSkgaXQgaGFzIHRoZSAnZXhwb3J0JyBtb2RpZmllci5cbiAgLy8gMikgaXQncyBkZWNsYXJlZCBhdCB0aGUgdG9wIGxldmVsLCBhbmQgdGhlcmUgaXMgYW4gZXhwb3J0IHN0YXRlbWVudCBmb3IgdGhlIGNsYXNzLlxuICBpZiAobm9kZS5tb2RpZmllcnMgIT09IHVuZGVmaW5lZCAmJlxuICAgICAgbm9kZS5tb2RpZmllcnMuc29tZShtb2QgPT4gbW9kLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuRXhwb3J0S2V5d29yZCkpIHtcbiAgICAvLyBDb25kaXRpb24gMSBpcyB0cnVlLCB0aGUgY2xhc3MgaGFzIGFuICdleHBvcnQnIGtleXdvcmQgYXR0YWNoZWQuXG4gICAgcmV0dXJuIHRydWU7XG4gIH0gZWxzZSBpZiAoXG4gICAgICBub2RlLnBhcmVudCAhPT0gdW5kZWZpbmVkICYmIHRzLmlzU291cmNlRmlsZShub2RlLnBhcmVudCkgJiZcbiAgICAgIGNoZWNrSWZGaWxlSGFzRXhwb3J0KG5vZGUucGFyZW50LCBub2RlLm5hbWUudGV4dCkpIHtcbiAgICAvLyBDb25kaXRpb24gMiBpcyB0cnVlLCB0aGUgY2xhc3MgaXMgZXhwb3J0ZWQgdmlhIGFuICdleHBvcnQge30nIHN0YXRlbWVudC5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIGNoZWNrSWZGaWxlSGFzRXhwb3J0KHNmOiB0cy5Tb3VyY2VGaWxlLCBuYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgZm9yIChjb25zdCBzdG10IG9mIHNmLnN0YXRlbWVudHMpIHtcbiAgICBpZiAodHMuaXNFeHBvcnREZWNsYXJhdGlvbihzdG10KSAmJiBzdG10LmV4cG9ydENsYXVzZSAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAgIHRzLmlzTmFtZWRFeHBvcnRzKHN0bXQuZXhwb3J0Q2xhdXNlKSkge1xuICAgICAgZm9yIChjb25zdCBlbGVtZW50IG9mIHN0bXQuZXhwb3J0Q2xhdXNlLmVsZW1lbnRzKSB7XG4gICAgICAgIGlmIChlbGVtZW50LnByb3BlcnR5TmFtZSA9PT0gdW5kZWZpbmVkICYmIGVsZW1lbnQubmFtZS50ZXh0ID09PSBuYW1lKSB7XG4gICAgICAgICAgLy8gVGhlIG5hbWVkIGRlY2xhcmF0aW9uIGlzIGRpcmVjdGx5IGV4cG9ydGVkLlxuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IGVsc2UgaWYgKGVsZW1lbnQucHJvcGVydHlOYW1lICE9PSB1bmRlZmluZWQgJiYgZWxlbWVudC5wcm9wZXJ0eU5hbWUudGV4dCA9PSBuYW1lKSB7XG4gICAgICAgICAgLy8gVGhlIG5hbWVkIGRlY2xhcmF0aW9uIGlzIGV4cG9ydGVkIHZpYSBhbiBhbGlhcy5cbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjaGVja0lmR2VuZXJpY1R5cGVzQXJlVW5ib3VuZChub2RlOiBDbGFzc0RlY2xhcmF0aW9uPHRzLkNsYXNzRGVjbGFyYXRpb24+KTpcbiAgICBib29sZWFuIHtcbiAgaWYgKG5vZGUudHlwZVBhcmFtZXRlcnMgPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHJldHVybiBub2RlLnR5cGVQYXJhbWV0ZXJzLmV2ZXJ5KHBhcmFtID0+IHBhcmFtLmNvbnN0cmFpbnQgPT09IHVuZGVmaW5lZCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0FjY2Vzc0V4cHJlc3Npb24obm9kZTogdHMuTm9kZSk6IG5vZGUgaXMgdHMuRWxlbWVudEFjY2Vzc0V4cHJlc3Npb258XG4gICAgdHMuUHJvcGVydHlBY2Nlc3NFeHByZXNzaW9uIHtcbiAgcmV0dXJuIHRzLmlzUHJvcGVydHlBY2Nlc3NFeHByZXNzaW9uKG5vZGUpIHx8IHRzLmlzRWxlbWVudEFjY2Vzc0V4cHJlc3Npb24obm9kZSk7XG59XG4iXX0=