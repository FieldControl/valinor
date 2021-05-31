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
        define("@angular/compiler-cli/src/ngtsc/reflection/src/type_to_value", ["require", "exports", "tslib", "typescript"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.typeNodeToValueExpr = exports.typeToValue = void 0;
    var tslib_1 = require("tslib");
    var ts = require("typescript");
    /**
     * Potentially convert a `ts.TypeNode` to a `TypeValueReference`, which indicates how to use the
     * type given in the `ts.TypeNode` in a value position.
     *
     * This can return `null` if the `typeNode` is `null`, if it does not refer to a symbol with a value
     * declaration, or if it is not possible to statically understand.
     */
    function typeToValue(typeNode, checker) {
        // It's not possible to get a value expression if the parameter doesn't even have a type.
        if (typeNode === null) {
            return missingType();
        }
        if (!ts.isTypeReferenceNode(typeNode)) {
            return unsupportedType(typeNode);
        }
        var symbols = resolveTypeSymbols(typeNode, checker);
        if (symbols === null) {
            return unknownReference(typeNode);
        }
        var local = symbols.local, decl = symbols.decl;
        // It's only valid to convert a type reference to a value reference if the type actually
        // has a value declaration associated with it. Note that const enums are an exception,
        // because while they do have a value declaration, they don't exist at runtime.
        if (decl.valueDeclaration === undefined || decl.flags & ts.SymbolFlags.ConstEnum) {
            var typeOnlyDecl = null;
            if (decl.declarations !== undefined && decl.declarations.length > 0) {
                typeOnlyDecl = decl.declarations[0];
            }
            return noValueDeclaration(typeNode, typeOnlyDecl);
        }
        // The type points to a valid value declaration. Rewrite the TypeReference into an
        // Expression which references the value pointed to by the TypeReference, if possible.
        // Look at the local `ts.Symbol`'s declarations and see if it comes from an import
        // statement. If so, extract the module specifier and the name of the imported type.
        var firstDecl = local.declarations && local.declarations[0];
        if (firstDecl !== undefined) {
            if (ts.isImportClause(firstDecl) && firstDecl.name !== undefined) {
                // This is a default import.
                //   import Foo from 'foo';
                if (firstDecl.isTypeOnly) {
                    // Type-only imports cannot be represented as value.
                    return typeOnlyImport(typeNode, firstDecl);
                }
                return {
                    kind: 0 /* LOCAL */,
                    expression: firstDecl.name,
                    defaultImportStatement: firstDecl.parent,
                };
            }
            else if (ts.isImportSpecifier(firstDecl)) {
                // The symbol was imported by name
                //   import {Foo} from 'foo';
                // or
                //   import {Foo as Bar} from 'foo';
                if (firstDecl.parent.parent.isTypeOnly) {
                    // Type-only imports cannot be represented as value.
                    return typeOnlyImport(typeNode, firstDecl.parent.parent);
                }
                // Determine the name to import (`Foo`) from the import specifier, as the symbol names of
                // the imported type could refer to a local alias (like `Bar` in the example above).
                var importedName = (firstDecl.propertyName || firstDecl.name).text;
                // The first symbol name refers to the local name, which is replaced by `importedName` above.
                // Any remaining symbol names make up the complete path to the value.
                var _a = tslib_1.__read(symbols.symbolNames), _localName = _a[0], nestedPath = _a.slice(1);
                var moduleName = extractModuleName(firstDecl.parent.parent.parent);
                return {
                    kind: 1 /* IMPORTED */,
                    valueDeclaration: decl.valueDeclaration,
                    moduleName: moduleName,
                    importedName: importedName,
                    nestedPath: nestedPath
                };
            }
            else if (ts.isNamespaceImport(firstDecl)) {
                // The import is a namespace import
                //   import * as Foo from 'foo';
                if (firstDecl.parent.isTypeOnly) {
                    // Type-only imports cannot be represented as value.
                    return typeOnlyImport(typeNode, firstDecl.parent);
                }
                if (symbols.symbolNames.length === 1) {
                    // The type refers to the namespace itself, which cannot be represented as a value.
                    return namespaceImport(typeNode, firstDecl.parent);
                }
                // The first symbol name refers to the local name of the namespace, which is is discarded
                // as a new namespace import will be generated. This is followed by the symbol name that needs
                // to be imported and any remaining names that constitute the complete path to the value.
                var _b = tslib_1.__read(symbols.symbolNames), _ns = _b[0], importedName = _b[1], nestedPath = _b.slice(2);
                var moduleName = extractModuleName(firstDecl.parent.parent);
                return {
                    kind: 1 /* IMPORTED */,
                    valueDeclaration: decl.valueDeclaration,
                    moduleName: moduleName,
                    importedName: importedName,
                    nestedPath: nestedPath
                };
            }
        }
        // If the type is not imported, the type reference can be converted into an expression as is.
        var expression = typeNodeToValueExpr(typeNode);
        if (expression !== null) {
            return {
                kind: 0 /* LOCAL */,
                expression: expression,
                defaultImportStatement: null,
            };
        }
        else {
            return unsupportedType(typeNode);
        }
    }
    exports.typeToValue = typeToValue;
    function unsupportedType(typeNode) {
        return {
            kind: 2 /* UNAVAILABLE */,
            reason: { kind: 5 /* UNSUPPORTED */, typeNode: typeNode },
        };
    }
    function noValueDeclaration(typeNode, decl) {
        return {
            kind: 2 /* UNAVAILABLE */,
            reason: { kind: 1 /* NO_VALUE_DECLARATION */, typeNode: typeNode, decl: decl },
        };
    }
    function typeOnlyImport(typeNode, importClause) {
        return {
            kind: 2 /* UNAVAILABLE */,
            reason: { kind: 2 /* TYPE_ONLY_IMPORT */, typeNode: typeNode, importClause: importClause },
        };
    }
    function unknownReference(typeNode) {
        return {
            kind: 2 /* UNAVAILABLE */,
            reason: { kind: 3 /* UNKNOWN_REFERENCE */, typeNode: typeNode },
        };
    }
    function namespaceImport(typeNode, importClause) {
        return {
            kind: 2 /* UNAVAILABLE */,
            reason: { kind: 4 /* NAMESPACE */, typeNode: typeNode, importClause: importClause },
        };
    }
    function missingType() {
        return {
            kind: 2 /* UNAVAILABLE */,
            reason: { kind: 0 /* MISSING_TYPE */ },
        };
    }
    /**
     * Attempt to extract a `ts.Expression` that's equivalent to a `ts.TypeNode`, as the two have
     * different AST shapes but can reference the same symbols.
     *
     * This will return `null` if an equivalent expression cannot be constructed.
     */
    function typeNodeToValueExpr(node) {
        if (ts.isTypeReferenceNode(node)) {
            return entityNameToValue(node.typeName);
        }
        else {
            return null;
        }
    }
    exports.typeNodeToValueExpr = typeNodeToValueExpr;
    /**
     * Resolve a `TypeReference` node to the `ts.Symbol`s for both its declaration and its local source.
     *
     * In the event that the `TypeReference` refers to a locally declared symbol, these will be the
     * same. If the `TypeReference` refers to an imported symbol, then `decl` will be the fully resolved
     * `ts.Symbol` of the referenced symbol. `local` will be the `ts.Symbol` of the `ts.Identifier`
     * which points to the import statement by which the symbol was imported.
     *
     * All symbol names that make up the type reference are returned left-to-right into the
     * `symbolNames` array, which is guaranteed to include at least one entry.
     */
    function resolveTypeSymbols(typeRef, checker) {
        var typeName = typeRef.typeName;
        // typeRefSymbol is the ts.Symbol of the entire type reference.
        var typeRefSymbol = checker.getSymbolAtLocation(typeName);
        if (typeRefSymbol === undefined) {
            return null;
        }
        // `local` is the `ts.Symbol` for the local `ts.Identifier` for the type.
        // If the type is actually locally declared or is imported by name, for example:
        //   import {Foo} from './foo';
        // then it'll be the same as `typeRefSymbol`.
        //
        // If the type is imported via a namespace import, for example:
        //   import * as foo from './foo';
        // and then referenced as:
        //   constructor(f: foo.Foo)
        // then `local` will be the `ts.Symbol` of `foo`, whereas `typeRefSymbol` will be the `ts.Symbol`
        // of `foo.Foo`. This allows tracking of the import behind whatever type reference exists.
        var local = typeRefSymbol;
        // Destructure a name like `foo.X.Y.Z` as follows:
        // - in `leftMost`, the `ts.Identifier` of the left-most name (`foo`) in the qualified name.
        //   This identifier is used to resolve the `ts.Symbol` for `local`.
        // - in `symbolNames`, all names involved in the qualified path, or a single symbol name if the
        //   type is not qualified.
        var leftMost = typeName;
        var symbolNames = [];
        while (ts.isQualifiedName(leftMost)) {
            symbolNames.unshift(leftMost.right.text);
            leftMost = leftMost.left;
        }
        symbolNames.unshift(leftMost.text);
        if (leftMost !== typeName) {
            var localTmp = checker.getSymbolAtLocation(leftMost);
            if (localTmp !== undefined) {
                local = localTmp;
            }
        }
        // De-alias the top-level type reference symbol to get the symbol of the actual declaration.
        var decl = typeRefSymbol;
        if (typeRefSymbol.flags & ts.SymbolFlags.Alias) {
            decl = checker.getAliasedSymbol(typeRefSymbol);
        }
        return { local: local, decl: decl, symbolNames: symbolNames };
    }
    function entityNameToValue(node) {
        if (ts.isQualifiedName(node)) {
            var left = entityNameToValue(node.left);
            return left !== null ? ts.createPropertyAccess(left, node.right) : null;
        }
        else if (ts.isIdentifier(node)) {
            return ts.getMutableClone(node);
        }
        else {
            return null;
        }
    }
    function extractModuleName(node) {
        if (!ts.isStringLiteral(node.moduleSpecifier)) {
            throw new Error('not a module specifier');
        }
        return node.moduleSpecifier.text;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZV90b192YWx1ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvbmd0c2MvcmVmbGVjdGlvbi9zcmMvdHlwZV90b192YWx1ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBRUgsK0JBQWlDO0lBSWpDOzs7Ozs7T0FNRztJQUNILFNBQWdCLFdBQVcsQ0FDdkIsUUFBMEIsRUFBRSxPQUF1QjtRQUNyRCx5RkFBeUY7UUFDekYsSUFBSSxRQUFRLEtBQUssSUFBSSxFQUFFO1lBQ3JCLE9BQU8sV0FBVyxFQUFFLENBQUM7U0FDdEI7UUFFRCxJQUFJLENBQUMsRUFBRSxDQUFDLG1CQUFtQixDQUFDLFFBQVEsQ0FBQyxFQUFFO1lBQ3JDLE9BQU8sZUFBZSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQ2xDO1FBRUQsSUFBTSxPQUFPLEdBQUcsa0JBQWtCLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3RELElBQUksT0FBTyxLQUFLLElBQUksRUFBRTtZQUNwQixPQUFPLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQ25DO1FBRU0sSUFBQSxLQUFLLEdBQVUsT0FBTyxNQUFqQixFQUFFLElBQUksR0FBSSxPQUFPLEtBQVgsQ0FBWTtRQUM5Qix3RkFBd0Y7UUFDeEYsc0ZBQXNGO1FBQ3RGLCtFQUErRTtRQUMvRSxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsS0FBSyxTQUFTLElBQUksSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRTtZQUNoRixJQUFJLFlBQVksR0FBd0IsSUFBSSxDQUFDO1lBQzdDLElBQUksSUFBSSxDQUFDLFlBQVksS0FBSyxTQUFTLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUNuRSxZQUFZLEdB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SSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7U0FDekU7YUFBTSxJQUFJLEVBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDaEMsT0FBTyxFQUFFLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ2pDO2FBQU07WUFDTCxPQUFPLElBQUksQ0FBQztTQUNiO0lBQ0gsQ0FBQztJQUVELFNBQVMsaUJBQWlCLENBQUMsSUFBMEI7UUFDbkQsSUFBSSxDQUFDLEVBQUUsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxFQUFFO1lBQzdDLE1BQU0sSUFBSSxLQUFLLENBQUMsd0JBQXdCLENBQUMsQ0FBQztTQUMzQztRQUNELE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUM7SUFDbkMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcblxuaW1wb3J0IHtUeXBlVmFsdWVSZWZlcmVuY2UsIFR5cGVWYWx1ZVJlZmVyZW5jZUtpbmQsIFVuYXZhaWxhYmxlVHlwZVZhbHVlUmVmZXJlbmNlLCBWYWx1ZVVuYXZhaWxhYmxlS2luZH0gZnJvbSAnLi9ob3N0JztcblxuLyoqXG4gKiBQb3RlbnRpYWxseSBjb252ZXJ0IGEgYHRzLlR5cGVOb2RlYCB0byBhIGBUeXBlVmFsdWVSZWZlcmVuY2VgLCB3aGljaCBpbmRpY2F0ZXMgaG93IHRvIHVzZSB0aGVcbiAqIHR5cGUgZ2l2ZW4gaW4gdGhlIGB0cy5UeXBlTm9kZWAgaW4gYSB2YWx1ZSBwb3NpdGlvbi5cbiAqXG4gKiBUaGlzIGNhbiByZXR1cm4gYG51bGxgIGlmIHRoZSBgdHlwZU5vZGVgIGlzIGBudWxsYCwgaWYgaXQgZG9lcyBub3QgcmVmZXIgdG8gYSBzeW1ib2wgd2l0aCBhIHZhbHVlXG4gKiBkZWNsYXJhdGlvbiwgb3IgaWYgaXQgaXMgbm90IHBvc3NpYmxlIHRvIHN0YXRpY2FsbHkgdW5kZXJzdGFuZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHR5cGVUb1ZhbHVlKFxuICAgIHR5cGVOb2RlOiB0cy5UeXBlTm9kZXxudWxsLCBjaGVja2VyOiB0cy5UeXBlQ2hlY2tlcik6IFR5cGVWYWx1ZVJlZmVyZW5jZSB7XG4gIC8vIEl0J3Mgbm90IHBvc3NpYmxlIHRvIGdldCBhIHZhbHVlIGV4cHJlc3Npb24gaWYgdGhlIHBhcmFtZXRlciBkb2Vzbid0IGV2ZW4gaGF2ZSBhIHR5cGUuXG4gIGlmICh0eXBlTm9kZSA9PT0gbnVsbCkge1xuICAgIHJldHVybiBtaXNzaW5nVHlwZSgpO1xuICB9XG5cbiAgaWYgKCF0cy5pc1R5cGVSZWZlcmVuY2VOb2RlKHR5cGVOb2RlKSkge1xuICAgIHJldHVybiB1bnN1cHBvcnRlZFR5cGUodHlwZU5vZGUpO1xuICB9XG5cbiAgY29uc3Qgc3ltYm9scyA9IHJlc29sdmVUeXBlU3ltYm9scyh0eXBlTm9kZSwgY2hlY2tlcik7XG4gIGlmIChzeW1ib2xzID09PSBudWxsKSB7XG4gICAgcmV0dXJuIHVua25vd25SZWZlcmVuY2UodHlwZU5vZGUpO1xuICB9XG5cbiAgY29uc3Qge2xvY2FsLCBkZWNsfSA9IHN5bWJvbHM7XG4gIC8vIEl0J3Mgb25seSB2YWxpZCB0byBjb252ZXJ0IGEgdHlwZSByZWZlcmVuY2UgdG8gYSB2YWx1ZSByZWZlcmVuY2UgaWYgdGhlIHR5cGUgYWN0dWFsbHlcbiAgLy8gaGFzIGEgdmFsdWUgZGVjbGFyYXRpb24gYXNzb2NpYXRlZCB3aXRoIGl0LiBOb3RlIHRoYXQgY29uc3QgZW51bXMgYXJlIGFuIGV4Y2VwdGlvbixcbiAgLy8gYmVjYXVzZSB3aGlsZSB0aGV5IGRvIGhhdmUgYSB2YWx1ZSBkZWNsYXJhdGlvbiwgdGhleSBkb24ndCBleGlzdCBhdCBydW50aW1lLlxuICBpZiAoZGVjbC52YWx1ZURlY2xhcmF0aW9uID09PSB1bmRlZmluZWQgfHwgZGVjbC5mbGFncyAmIHRzLlN5bWJvbEZsYWdzLkNvbnN0RW51bSkge1xuICAgIGxldCB0eXBlT25seURlY2w6IHRzLkRlY2xhcmF0aW9ufG51bGwgPSBudWxsO1xuICAgIGlmIChkZWNsLmRlY2xhcmF0aW9ucyAhPT0gdW5kZWZpbmVkICYmIGRlY2wuZGVjbGFyYXRpb25zLmxlbmd0aCA+IDApIHtcbiAgICAgIHR5cGVPbmx5RGVjbCA9IGRlY2wuZGVjbGFyYXRpb25zWzBdO1xuICAgIH1cbiAgICByZXR1cm4gbm9WYWx1ZURlY2xhcmF0aW9uKHR5cGVOb2RlLCB0eXBlT25seURlY2wpO1xuICB9XG5cbiAgLy8gVGhlIHR5cGUgcG9pbnRzIHRvIGEgdmFsaWQgdmFsdWUgZGVjbGFyYXRpb24uIFJld3JpdGUgdGhlIFR5cGVSZWZlcmVuY2UgaW50byBhblxuICAvLyBFeHByZXNzaW9uIHdoaWNoIHJlZmVyZW5jZXMgdGhlIHZhbHVlIHBvaW50ZWQgdG8gYnkgdGhlIFR5cGVSZWZlcmVuY2UsIGlmIHBvc3NpYmxlLlxuXG4gIC8vIExvb2sgYXQgdGhlIGxvY2FsIGB0cy5TeW1ib2xgJ3MgZGVjbGFyYXRpb25zIGFuZCBzZWUgaWYgaXQgY29tZXMgZnJvbSBhbiBpbXBvcnRcbiAgLy8gc3RhdGVtZW50LiBJZiBzbywgZXh0cmFjdCB0aGUgbW9kdWxlIHNwZWNpZmllciBhbmQgdGhlIG5hbWUgb2YgdGhlIGltcG9ydGVkIHR5cGUuXG4gIGNvbnN0IGZpcnN0RGVjbCA9IGxvY2FsLmRlY2xhcmF0aW9ucyAmJiBsb2NhbC5kZWNsYXJhdGlvbnNbMF07XG4gIGlmIChmaXJzdERlY2wgIT09IHVuZGVmaW5lZCkge1xuICAgIGlmICh0cy5pc0ltcG9ydENsYXVzZShmaXJzdERlY2wpICYmIGZpcnN0RGVjbC5uYW1lICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIC8vIFRoaXMgaXMgYSBkZWZhdWx0IGltcG9ydC5cbiAgICAgIC8vICAgaW1wb3J0IEZvbyBmcm9tICdmb28nO1xuXG4gICAgICBpZiAoZmlyc3REZWNsLmlzVHlwZU9ubHkpIHtcbiAgICAgICAgLy8gVHlwZS1vbmx5IGltcG9ydHMgY2Fubm90IGJlIHJlcHJlc2VudGVkIGFzIHZhbHVlLlxuICAgICAgICByZXR1cm4gdHlwZU9ubHlJbXBvcnQodHlwZU5vZGUsIGZpcnN0RGVjbCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIGtpbmQ6IFR5cGVWYWx1ZVJlZmVyZW5jZUtpbmQuTE9DQUwsXG4gICAgICAgIGV4cHJlc3Npb246IGZpcnN0RGVjbC5uYW1lLFxuICAgICAgICBkZWZhdWx0SW1wb3J0U3RhdGVtZW50OiBmaXJzdERlY2wucGFyZW50LFxuICAgICAgfTtcbiAgICB9IGVsc2UgaWYgKHRzLmlzSW1wb3J0U3BlY2lmaWVyKGZpcnN0RGVjbCkpIHtcbiAgICAgIC8vIFRoZSBzeW1ib2wgd2FzIGltcG9ydGVkIGJ5IG5hbWVcbiAgICAgIC8vICAgaW1wb3J0IHtGb299IGZyb20gJ2Zvbyc7XG4gICAgICAvLyBvclxuICAgICAgLy8gICBpbXBvcnQge0ZvbyBhcyBCYXJ9IGZyb20gJ2Zvbyc7XG5cbiAgICAgIGlmIChmaXJzdERlY2wucGFyZW50LnBhcmVudC5pc1R5cGVPbmx5KSB7XG4gICAgICAgIC8vIFR5cGUtb25seSBpbXBvcnRzIGNhbm5vdCBiZSByZXByZXNlbnRlZCBhcyB2YWx1ZS5cbiAgICAgICAgcmV0dXJuIHR5cGVPbmx5SW1wb3J0KHR5cGVOb2RlLCBmaXJzdERlY2wucGFyZW50LnBhcmVudCk7XG4gICAgICB9XG5cbiAgICAgIC8vIERldGVybWluZSB0aGUgbmFtZSB0byBpbXBvcnQgKGBGb29gKSBmcm9tIHRoZSBpbXBvcnQgc3BlY2lmaWVyLCBhcyB0aGUgc3ltYm9sIG5hbWVzIG9mXG4gICAgICAvLyB0aGUgaW1wb3J0ZWQgdHlwZSBjb3VsZCByZWZlciB0byBhIGxvY2FsIGFsaWFzIChsaWtlIGBCYXJgIGluIHRoZSBleGFtcGxlIGFib3ZlKS5cbiAgICAgIGNvbnN0IGltcG9ydGVkTmFtZSA9IChmaXJzdERlY2wucHJvcGVydHlOYW1lIHx8IGZpcnN0RGVjbC5uYW1lKS50ZXh0O1xuXG4gICAgICAvLyBUaGUgZmlyc3Qgc3ltYm9sIG5hbWUgcmVmZXJzIHRvIHRoZSBsb2NhbCBuYW1lLCB3aGljaCBpcyByZXBsYWNlZCBieSBgaW1wb3J0ZWROYW1lYCBhYm92ZS5cbiAgICAgIC8vIEFueSByZW1haW5pbmcgc3ltYm9sIG5hbWVzIG1ha2UgdXAgdGhlIGNvbXBsZXRlIHBhdGggdG8gdGhlIHZhbHVlLlxuICAgICAgY29uc3QgW19sb2NhbE5hbWUsIC4uLm5lc3RlZFBhdGhdID0gc3ltYm9scy5zeW1ib2xOYW1lcztcblxuICAgICAgY29uc3QgbW9kdWxlTmFtZSA9IGV4dHJhY3RNb2R1bGVOYW1lKGZpcnN0RGVjbC5wYXJlbnQucGFyZW50LnBhcmVudCk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBraW5kOiBUeXBlVmFsdWVSZWZlcmVuY2VLaW5kLklNUE9SVEVELFxuICAgICAgICB2YWx1ZURlY2xhcmF0aW9uOiBkZWNsLnZhbHVlRGVjbGFyYXRpb24sXG4gICAgICAgIG1vZHVsZU5hbWUsXG4gICAgICAgIGltcG9ydGVkTmFtZSxcbiAgICAgICAgbmVzdGVkUGF0aFxuICAgICAgfTtcbiAgICB9IGVsc2UgaWYgKHRzLmlzTmFtZXNwYWNlSW1wb3J0KGZpcnN0RGVjbCkpIHtcbiAgICAgIC8vIFRoZSBpbXBvcnQgaXMgYSBuYW1lc3BhY2UgaW1wb3J0XG4gICAgICAvLyAgIGltcG9ydCAqIGFzIEZvbyBmcm9tICdmb28nO1xuXG4gICAgICBpZiAoZmlyc3REZWNsLnBhcmVudC5pc1R5cGVPbmx5KSB7XG4gICAgICAgIC8vIFR5cGUtb25seSBpbXBvcnRzIGNhbm5vdCBiZSByZXByZXNlbnRlZCBhcyB2YWx1ZS5cbiAgICAgICAgcmV0dXJuIHR5cGVPbmx5SW1wb3J0KHR5cGVOb2RlLCBmaXJzdERlY2wucGFyZW50KTtcbiAgICAgIH1cblxuICAgICAgaWYgKHN5bWJvbHMuc3ltYm9sTmFtZXMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgIC8vIFRoZSB0eXBlIHJlZmVycyB0byB0aGUgbmFtZXNwYWNlIGl0c2VsZiwgd2hpY2ggY2Fubm90IGJlIHJlcHJlc2VudGVkIGFzIGEgdmFsdWUuXG4gICAgICAgIHJldHVybiBuYW1lc3BhY2VJbXBvcnQodHlwZU5vZGUsIGZpcnN0RGVjbC5wYXJlbnQpO1xuICAgICAgfVxuXG4gICAgICAvLyBUaGUgZmlyc3Qgc3ltYm9sIG5hbWUgcmVmZXJzIHRvIHRoZSBsb2NhbCBuYW1lIG9mIHRoZSBuYW1lc3BhY2UsIHdoaWNoIGlzIGlzIGRpc2NhcmRlZFxuICAgICAgLy8gYXMgYSBuZXcgbmFtZXNwYWNlIGltcG9ydCB3aWxsIGJlIGdlbmVyYXRlZC4gVGhpcyBpcyBmb2xsb3dlZCBieSB0aGUgc3ltYm9sIG5hbWUgdGhhdCBuZWVkc1xuICAgICAgLy8gdG8gYmUgaW1wb3J0ZWQgYW5kIGFueSByZW1haW5pbmcgbmFtZXMgdGhhdCBjb25zdGl0dXRlIHRoZSBjb21wbGV0ZSBwYXRoIHRvIHRoZSB2YWx1ZS5cbiAgICAgIGNvbnN0IFtfbnMsIGltcG9ydGVkTmFtZSwgLi4ubmVzdGVkUGF0aF0gPSBzeW1ib2xzLnN5bWJvbE5hbWVzO1xuXG4gICAgICBjb25zdCBtb2R1bGVOYW1lID0gZXh0cmFjdE1vZHVsZU5hbWUoZmlyc3REZWNsLnBhcmVudC5wYXJlbnQpO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAga2luZDogVHlwZVZhbHVlUmVmZXJlbmNlS2luZC5JTVBPUlRFRCxcbiAgICAgICAgdmFsdWVEZWNsYXJhdGlvbjogZGVjbC52YWx1ZURlY2xhcmF0aW9uLFxuICAgICAgICBtb2R1bGVOYW1lLFxuICAgICAgICBpbXBvcnRlZE5hbWUsXG4gICAgICAgIG5lc3RlZFBhdGhcbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgLy8gSWYgdGhlIHR5cGUgaXMgbm90IGltcG9ydGVkLCB0aGUgdHlwZSByZWZlcmVuY2UgY2FuIGJlIGNvbnZlcnRlZCBpbnRvIGFuIGV4cHJlc3Npb24gYXMgaXMuXG4gIGNvbnN0IGV4cHJlc3Npb24gPSB0eXBlTm9kZVRvVmFsdWVFeHByKHR5cGVOb2RlKTtcbiAgaWYgKGV4cHJlc3Npb24gIT09IG51bGwpIHtcbiAgICByZXR1cm4ge1xuICAgICAga2luZDogVHlwZVZhbHVlUmVmZXJlbmNlS2luZC5MT0NBTCxcbiAgICAgIGV4cHJlc3Npb24sXG4gICAgICBkZWZhdWx0SW1wb3J0U3RhdGVtZW50OiBudWxsLFxuICAgIH07XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHVuc3VwcG9ydGVkVHlwZSh0eXBlTm9kZSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gdW5zdXBwb3J0ZWRUeXBlKHR5cGVOb2RlOiB0cy5UeXBlTm9kZSk6IFVuYXZhaWxhYmxlVHlwZVZhbHVlUmVmZXJlbmNlIHtcbiAgcmV0dXJuIHtcbiAgICBraW5kOiBUeXBlVmFsdWVSZWZlcmVuY2VLaW5kLlVOQVZBSUxBQkxFLFxuICAgIHJlYXNvbjoge2tpbmQ6IFZhbHVlVW5hdmFpbGFibGVLaW5kLlVOU1VQUE9SVEVELCB0eXBlTm9kZX0sXG4gIH07XG59XG5cbmZ1bmN0aW9uIG5vVmFsdWVEZWNsYXJhdGlvbihcbiAgICB0eXBlTm9kZTogdHMuVHlwZU5vZGUsIGRlY2w6IHRzLkRlY2xhcmF0aW9ufG51bGwpOiBVbmF2YWlsYWJsZVR5cGVWYWx1ZVJlZmVyZW5jZSB7XG4gIHJldHVybiB7XG4gICAga2luZDogVHlwZVZhbHVlUmVmZXJlbmNlS2luZC5VTkFWQUlMQUJMRSxcbiAgICByZWFzb246IHtraW5kOiBWYWx1ZVVuYXZhaWxhYmxlS2luZC5OT19WQUxVRV9ERUNMQVJBVElPTiwgdHlwZU5vZGUsIGRlY2x9LFxuICB9O1xufVxuXG5mdW5jdGlvbiB0eXBlT25seUltcG9ydChcbiAgICB0eXBlTm9kZTogdHMuVHlwZU5vZGUsIGltcG9ydENsYXVzZTogdHMuSW1wb3J0Q2xhdXNlKTogVW5hdmFpbGFibGVUeXBlVmFsdWVSZWZlcmVuY2Uge1xuICByZXR1cm4ge1xuICAgIGtpbmQ6IFR5cGVWYWx1ZVJlZmVyZW5jZUtpbmQuVU5BVkFJTEFCTEUsXG4gICAgcmVhc29uOiB7a2luZDogVmFsdWVVbmF2YWlsYWJsZUtpbmQuVFlQRV9PTkxZX0lNUE9SVCwgdHlwZU5vZGUsIGltcG9ydENsYXVzZX0sXG4gIH07XG59XG5cbmZ1bmN0aW9uIHVua25vd25SZWZlcmVuY2UodHlwZU5vZGU6IHRzLlR5cGVOb2RlKTogVW5hdmFpbGFibGVUeXBlVmFsdWVSZWZlcmVuY2Uge1xuICByZXR1cm4ge1xuICAgIGtpbmQ6IFR5cGVWYWx1ZVJlZmVyZW5jZUtpbmQuVU5BVkFJTEFCTEUsXG4gICAgcmVhc29uOiB7a2luZDogVmFsdWVVbmF2YWlsYWJsZUtpbmQuVU5LTk9XTl9SRUZFUkVOQ0UsIHR5cGVOb2RlfSxcbiAgfTtcbn1cblxuZnVuY3Rpb24gbmFtZXNwYWNlSW1wb3J0KFxuICAgIHR5cGVOb2RlOiB0cy5UeXBlTm9kZSwgaW1wb3J0Q2xhdXNlOiB0cy5JbXBvcnRDbGF1c2UpOiBVbmF2YWlsYWJsZVR5cGVWYWx1ZVJlZmVyZW5jZSB7XG4gIHJldHVybiB7XG4gICAga2luZDogVHlwZVZhbHVlUmVmZXJlbmNlS2luZC5VTkFWQUlMQUJMRSxcbiAgICByZWFzb246IHtraW5kOiBWYWx1ZVVuYXZhaWxhYmxlS2luZC5OQU1FU1BBQ0UsIHR5cGVOb2RlLCBpbXBvcnRDbGF1c2V9LFxuICB9O1xufVxuXG5mdW5jdGlvbiBtaXNzaW5nVHlwZSgpOiBVbmF2YWlsYWJsZVR5cGVWYWx1ZVJlZmVyZW5jZSB7XG4gIHJldHVybiB7XG4gICAga2luZDogVHlwZVZhbHVlUmVmZXJlbmNlS2luZC5VTkFWQUlMQUJMRSxcbiAgICByZWFzb246IHtraW5kOiBWYWx1ZVVuYXZhaWxhYmxlS2luZC5NSVNTSU5HX1RZUEV9LFxuICB9O1xufVxuXG4vKipcbiAqIEF0dGVtcHQgdG8gZXh0cmFjdCBhIGB0cy5FeHByZXNzaW9uYCB0aGF0J3MgZXF1aXZhbGVudCB0byBhIGB0cy5UeXBlTm9kZWAsIGFzIHRoZSB0d28gaGF2ZVxuICogZGlmZmVyZW50IEFTVCBzaGFwZXMgYnV0IGNhbiByZWZlcmVuY2UgdGhlIHNhbWUgc3ltYm9scy5cbiAqXG4gKiBUaGlzIHdpbGwgcmV0dXJuIGBudWxsYCBpZiBhbiBlcXVpdmFsZW50IGV4cHJlc3Npb24gY2Fubm90IGJlIGNvbnN0cnVjdGVkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdHlwZU5vZGVUb1ZhbHVlRXhwcihub2RlOiB0cy5UeXBlTm9kZSk6IHRzLkV4cHJlc3Npb258bnVsbCB7XG4gIGlmICh0cy5pc1R5cGVSZWZlcmVuY2VOb2RlKG5vZGUpKSB7XG4gICAgcmV0dXJuIGVudGl0eU5hbWVUb1ZhbHVlKG5vZGUudHlwZU5hbWUpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cbi8qKlxuICogUmVzb2x2ZSBhIGBUeXBlUmVmZXJlbmNlYCBub2RlIHRvIHRoZSBgdHMuU3ltYm9sYHMgZm9yIGJvdGggaXRzIGRlY2xhcmF0aW9uIGFuZCBpdHMgbG9jYWwgc291cmNlLlxuICpcbiAqIEluIHRoZSBldmVudCB0aGF0IHRoZSBgVHlwZVJlZmVyZW5jZWAgcmVmZXJzIHRvIGEgbG9jYWxseSBkZWNsYXJlZCBzeW1ib2wsIHRoZXNlIHdpbGwgYmUgdGhlXG4gKiBzYW1lLiBJZiB0aGUgYFR5cGVSZWZlcmVuY2VgIHJlZmVycyB0byBhbiBpbXBvcnRlZCBzeW1ib2wsIHRoZW4gYGRlY2xgIHdpbGwgYmUgdGhlIGZ1bGx5IHJlc29sdmVkXG4gKiBgdHMuU3ltYm9sYCBvZiB0aGUgcmVmZXJlbmNlZCBzeW1ib2wuIGBsb2NhbGAgd2lsbCBiZSB0aGUgYHRzLlN5bWJvbGAgb2YgdGhlIGB0cy5JZGVudGlmaWVyYFxuICogd2hpY2ggcG9pbnRzIHRvIHRoZSBpbXBvcnQgc3RhdGVtZW50IGJ5IHdoaWNoIHRoZSBzeW1ib2wgd2FzIGltcG9ydGVkLlxuICpcbiAqIEFsbCBzeW1ib2wgbmFtZXMgdGhhdCBtYWtlIHVwIHRoZSB0eXBlIHJlZmVyZW5jZSBhcmUgcmV0dXJuZWQgbGVmdC10by1yaWdodCBpbnRvIHRoZVxuICogYHN5bWJvbE5hbWVzYCBhcnJheSwgd2hpY2ggaXMgZ3VhcmFudGVlZCB0byBpbmNsdWRlIGF0IGxlYXN0IG9uZSBlbnRyeS5cbiAqL1xuZnVuY3Rpb24gcmVzb2x2ZVR5cGVTeW1ib2xzKHR5cGVSZWY6IHRzLlR5cGVSZWZlcmVuY2VOb2RlLCBjaGVja2VyOiB0cy5UeXBlQ2hlY2tlcik6XG4gICAge2xvY2FsOiB0cy5TeW1ib2wsIGRlY2w6IHRzLlN5bWJvbCwgc3ltYm9sTmFtZXM6IHN0cmluZ1tdfXxudWxsIHtcbiAgY29uc3QgdHlwZU5hbWUgPSB0eXBlUmVmLnR5cGVOYW1lO1xuICAvLyB0eXBlUmVmU3ltYm9sIGlzIHRoZSB0cy5TeW1ib2wgb2YgdGhlIGVudGlyZSB0eXBlIHJlZmVyZW5jZS5cbiAgY29uc3QgdHlwZVJlZlN5bWJvbDogdHMuU3ltYm9sfHVuZGVmaW5lZCA9IGNoZWNrZXIuZ2V0U3ltYm9sQXRMb2NhdGlvbih0eXBlTmFtZSk7XG4gIGlmICh0eXBlUmVmU3ltYm9sID09PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8vIGBsb2NhbGAgaXMgdGhlIGB0cy5TeW1ib2xgIGZvciB0aGUgbG9jYWwgYHRzLklkZW50aWZpZXJgIGZvciB0aGUgdHlwZS5cbiAgLy8gSWYgdGhlIHR5cGUgaXMgYWN0dWFsbHkgbG9jYWxseSBkZWNsYXJlZCBvciBpcyBpbXBvcnRlZCBieSBuYW1lLCBmb3IgZXhhbXBsZTpcbiAgLy8gICBpbXBvcnQge0Zvb30gZnJvbSAnLi9mb28nO1xuICAvLyB0aGVuIGl0J2xsIGJlIHRoZSBzYW1lIGFzIGB0eXBlUmVmU3ltYm9sYC5cbiAgLy9cbiAgLy8gSWYgdGhlIHR5cGUgaXMgaW1wb3J0ZWQgdmlhIGEgbmFtZXNwYWNlIGltcG9ydCwgZm9yIGV4YW1wbGU6XG4gIC8vICAgaW1wb3J0ICogYXMgZm9vIGZyb20gJy4vZm9vJztcbiAgLy8gYW5kIHRoZW4gcmVmZXJlbmNlZCBhczpcbiAgLy8gICBjb25zdHJ1Y3RvcihmOiBmb28uRm9vKVxuICAvLyB0aGVuIGBsb2NhbGAgd2lsbCBiZSB0aGUgYHRzLlN5bWJvbGAgb2YgYGZvb2AsIHdoZXJlYXMgYHR5cGVSZWZTeW1ib2xgIHdpbGwgYmUgdGhlIGB0cy5TeW1ib2xgXG4gIC8vIG9mIGBmb28uRm9vYC4gVGhpcyBhbGxvd3MgdHJhY2tpbmcgb2YgdGhlIGltcG9ydCBiZWhpbmQgd2hhdGV2ZXIgdHlwZSByZWZlcmVuY2UgZXhpc3RzLlxuICBsZXQgbG9jYWwgPSB0eXBlUmVmU3ltYm9sO1xuXG4gIC8vIERlc3RydWN0dXJlIGEgbmFtZSBsaWtlIGBmb28uWC5ZLlpgIGFzIGZvbGxvd3M6XG4gIC8vIC0gaW4gYGxlZnRNb3N0YCwgdGhlIGB0cy5JZGVudGlmaWVyYCBvZiB0aGUgbGVmdC1tb3N0IG5hbWUgKGBmb29gKSBpbiB0aGUgcXVhbGlmaWVkIG5hbWUuXG4gIC8vICAgVGhpcyBpZGVudGlmaWVyIGlzIHVzZWQgdG8gcmVzb2x2ZSB0aGUgYHRzLlN5bWJvbGAgZm9yIGBsb2NhbGAuXG4gIC8vIC0gaW4gYHN5bWJvbE5hbWVzYCwgYWxsIG5hbWVzIGludm9sdmVkIGluIHRoZSBxdWFsaWZpZWQgcGF0aCwgb3IgYSBzaW5nbGUgc3ltYm9sIG5hbWUgaWYgdGhlXG4gIC8vICAgdHlwZSBpcyBub3QgcXVhbGlmaWVkLlxuICBsZXQgbGVmdE1vc3QgPSB0eXBlTmFtZTtcbiAgY29uc3Qgc3ltYm9sTmFtZXM6IHN0cmluZ1tdID0gW107XG4gIHdoaWxlICh0cy5pc1F1YWxpZmllZE5hbWUobGVmdE1vc3QpKSB7XG4gICAgc3ltYm9sTmFtZXMudW5zaGlmdChsZWZ0TW9zdC5yaWdodC50ZXh0KTtcbiAgICBsZWZ0TW9zdCA9IGxlZnRNb3N0LmxlZnQ7XG4gIH1cbiAgc3ltYm9sTmFtZXMudW5zaGlmdChsZWZ0TW9zdC50ZXh0KTtcblxuICBpZiAobGVmdE1vc3QgIT09IHR5cGVOYW1lKSB7XG4gICAgY29uc3QgbG9jYWxUbXAgPSBjaGVja2VyLmdldFN5bWJvbEF0TG9jYXRpb24obGVmdE1vc3QpO1xuICAgIGlmIChsb2NhbFRtcCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBsb2NhbCA9IGxvY2FsVG1wO1xuICAgIH1cbiAgfVxuXG4gIC8vIERlLWFsaWFzIHRoZSB0b3AtbGV2ZWwgdHlwZSByZWZlcmVuY2Ugc3ltYm9sIHRvIGdldCB0aGUgc3ltYm9sIG9mIHRoZSBhY3R1YWwgZGVjbGFyYXRpb24uXG4gIGxldCBkZWNsID0gdHlwZVJlZlN5bWJvbDtcbiAgaWYgKHR5cGVSZWZTeW1ib2wuZmxhZ3MgJiB0cy5TeW1ib2xGbGFncy5BbGlhcykge1xuICAgIGRlY2wgPSBjaGVja2VyLmdldEFsaWFzZWRTeW1ib2wodHlwZVJlZlN5bWJvbCk7XG4gIH1cbiAgcmV0dXJuIHtsb2NhbCwgZGVjbCwgc3ltYm9sTmFtZXN9O1xufVxuXG5mdW5jdGlvbiBlbnRpdHlOYW1lVG9WYWx1ZShub2RlOiB0cy5FbnRpdHlOYW1lKTogdHMuRXhwcmVzc2lvbnxudWxsIHtcbiAgaWYgKHRzLmlzUXVhbGlmaWVkTmFtZShub2RlKSkge1xuICAgIGNvbnN0IGxlZnQgPSBlbnRpdHlOYW1lVG9WYWx1ZShub2RlLmxlZnQpO1xuICAgIHJldHVybiBsZWZ0ICE9PSBudWxsID8gdHMuY3JlYXRlUHJvcGVydHlBY2Nlc3MobGVmdCwgbm9kZS5yaWdodCkgOiBudWxsO1xuICB9IGVsc2UgaWYgKHRzLmlzSWRlbnRpZmllcihub2RlKSkge1xuICAgIHJldHVybiB0cy5nZXRNdXRhYmxlQ2xvbmUobm9kZSk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cblxuZnVuY3Rpb24gZXh0cmFjdE1vZHVsZU5hbWUobm9kZTogdHMuSW1wb3J0RGVjbGFyYXRpb24pOiBzdHJpbmcge1xuICBpZiAoIXRzLmlzU3RyaW5nTGl0ZXJhbChub2RlLm1vZHVsZVNwZWNpZmllcikpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ25vdCBhIG1vZHVsZSBzcGVjaWZpZXInKTtcbiAgfVxuICByZXR1cm4gbm9kZS5tb2R1bGVTcGVjaWZpZXIudGV4dDtcbn1cbiJdfQ==