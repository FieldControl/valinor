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
        define("@angular/core/schematics/utils/typescript/symbol", ["require", "exports", "typescript"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.hasOneOfTypes = exports.isNullableType = exports.isReferenceToImport = exports.getValueSymbolOfDeclaration = void 0;
    const ts = require("typescript");
    function getValueSymbolOfDeclaration(node, typeChecker) {
        let symbol = typeChecker.getSymbolAtLocation(node);
        while (symbol && symbol.flags & ts.SymbolFlags.Alias) {
            symbol = typeChecker.getAliasedSymbol(symbol);
        }
        return symbol;
    }
    exports.getValueSymbolOfDeclaration = getValueSymbolOfDeclaration;
    /** Checks whether a node is referring to a specific import specifier. */
    function isReferenceToImport(typeChecker, node, importSpecifier) {
        const nodeSymbol = typeChecker.getTypeAtLocation(node).getSymbol();
        const importSymbol = typeChecker.getTypeAtLocation(importSpecifier).getSymbol();
        return !!(nodeSymbol && importSymbol) &&
            nodeSymbol.valueDeclaration === importSymbol.valueDeclaration;
    }
    exports.isReferenceToImport = isReferenceToImport;
    /** Checks whether a node's type is nullable (`null`, `undefined` or `void`). */
    function isNullableType(typeChecker, node) {
        // Skip expressions in the form of `foo.bar!.baz` since the `TypeChecker` seems
        // to identify them as null, even though the user indicated that it won't be.
        if (node.parent && ts.isNonNullExpression(node.parent)) {
            return false;
        }
        const type = typeChecker.getTypeAtLocation(node);
        const typeNode = typeChecker.typeToTypeNode(type, undefined, ts.NodeBuilderFlags.None);
        let hasSeenNullableType = false;
        // Trace the type of the node back to a type node, walk
        // through all of its sub-nodes and look for nullable tyes.
        if (typeNode) {
            (function walk(current) {
                if (current.kind === ts.SyntaxKind.NullKeyword ||
                    current.kind === ts.SyntaxKind.UndefinedKeyword ||
                    current.kind === ts.SyntaxKind.VoidKeyword) {
                    hasSeenNullableType = true;
                    // Note that we don't descend into type literals, because it may cause
                    // us to mis-identify the root type as nullable, because it has a nullable
                    // property (e.g. `{ foo: string | null }`).
                }
                else if (!hasSeenNullableType && !ts.isTypeLiteralNode(current)) {
                    current.forEachChild(walk);
                }
            })(typeNode);
        }
        return hasSeenNullableType;
    }
    exports.isNullableType = isNullableType;
    /**
     * Walks through the types and sub-types of a node, looking for a
     * type that has the same name as one of the passed-in ones.
     */
    function hasOneOfTypes(typeChecker, node, types) {
        const type = typeChecker.getTypeAtLocation(node);
        const typeNode = type ? typeChecker.typeToTypeNode(type, undefined, ts.NodeBuilderFlags.None) : undefined;
        let hasMatch = false;
        if (typeNode) {
            (function walk(current) {
                if (ts.isIdentifier(current) && types.includes(current.text)) {
                    hasMatch = true;
                }
                else if (!hasMatch && !ts.isTypeLiteralNode(current)) {
                    current.forEachChild(walk);
                }
            })(typeNode);
        }
        return hasMatch;
    }
    exports.hasOneOfTypes = hasOneOfTypes;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3ltYm9sLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS9zY2hlbWF0aWNzL3V0aWxzL3R5cGVzY3JpcHQvc3ltYm9sLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQUVILGlDQUFpQztJQUVqQyxTQUFnQiwyQkFBMkIsQ0FBQyxJQUFhLEVBQUUsV0FBMkI7UUFFcEYsSUFBSSxNQUFNLEdBQUcsV0FBVyxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBRW5ELE9BQU8sTUFBTSxJQUFJLE1BQU0sQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUU7WUFDcEQsTUFBTSxHQUFHLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUMvQztRQUVELE9BQU8sTUFBTSxDQUFDO0lBQ2hCLENBQUM7SUFURCxrRUFTQztJQUVELHlFQUF5RTtJQUN6RSxTQUFnQixtQkFBbUIsQ0FDL0IsV0FBMkIsRUFBRSxJQUFhLEVBQUUsZUFBbUM7UUFDakYsTUFBTSxVQUFVLEdBQUcsV0FBVyxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ25FLE1BQU0sWUFBWSxHQUFHLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQyxlQUFlLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUNoRixPQUFPLENBQUMsQ0FBQyxDQUFDLFVBQVUsSUFBSSxZQUFZLENBQUM7WUFDakMsVUFBVSxDQUFDLGdCQUFnQixLQUFLLFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQztJQUNwRSxDQUFDO0lBTkQsa0RBTUM7SUFFRCxnRkFBZ0Y7SUFDaEYsU0FBZ0IsY0FBYyxDQUFDLFdBQTJCLEVBQUUsSUFBYTtRQUN2RSwrRUFBK0U7UUFDL0UsNkVBQTZFO1FBQzdFLElBQUksSUFBSSxDQUFDLE1BQU0sSUFBSSxFQUFFLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQ3RELE9BQU8sS0FBSyxDQUFDO1NBQ2Q7UUFFRCxNQUFNLElBQUksR0FBRyxXQUFXLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDakQsTUFBTSxRQUFRLEdBQUcsV0FBVyxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN2RixJQUFJLG1CQUFtQixHQUFHLEtBQUssQ0FBQztRQUVoQyx1REFBdUQ7UUFDdkQsMkRBQTJEO1FBQzNELElBQUksUUFBUSxFQUFFO1lBQ1osQ0FBQyxTQUFTLElBQUksQ0FBQyxPQUFnQjtnQkFDN0IsSUFBSSxPQUFPLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQyxVQUFVLENBQUMsV0FBVztvQkFDMUMsT0FBTyxDQUFDLElBQUksS0FBSyxFQUFFLENBQUMsVUFBVSxDQUFDLGdCQUFnQjtvQkFDL0MsT0FBTyxDQUFDLElBQUksS0FBSyxFQUFFLENBQUMsVUFBVSxDQUFDLFdBQVcsRUFBRTtvQkFDOUMsbUJBQW1CLEdBQUcsSUFBSSxDQUFDO29CQUMzQixzRUFBc0U7b0JBQ3RFLDBFQUEwRTtvQkFDMUUsNENBQTRDO2lCQUM3QztxQkFBTSxJQUFJLENBQUMsbUJBQW1CLElBQUksQ0FBQyxFQUFFLENBQUMsaUJBQWlCLENBQUMsT0FBTyxDQUFDLEVBQUU7b0JBQ2pFLE9BQU8sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7aUJBQzVCO1lBQ0gsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDZDtRQUVELE9BQU8sbUJBQW1CLENBQUM7SUFDN0IsQ0FBQztJQTdCRCx3Q0E2QkM7SUFFRDs7O09BR0c7SUFDSCxTQUFnQixhQUFhLENBQ3pCLFdBQTJCLEVBQUUsSUFBYSxFQUFFLEtBQWU7UUFDN0QsTUFBTSxJQUFJLEdBQUcsV0FBVyxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2pELE1BQU0sUUFBUSxHQUNWLElBQUksQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBQzdGLElBQUksUUFBUSxHQUFHLEtBQUssQ0FBQztRQUNyQixJQUFJLFFBQVEsRUFBRTtZQUNaLENBQUMsU0FBUyxJQUFJLENBQUMsT0FBZ0I7Z0JBQzdCLElBQUksRUFBRSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsSUFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtvQkFDNUQsUUFBUSxHQUFHLElBQUksQ0FBQztpQkFDakI7cUJBQU0sSUFBSSxDQUFDLFFBQVEsSUFBSSxDQUFDLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsRUFBRTtvQkFDdEQsT0FBTyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztpQkFDNUI7WUFDSCxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQztTQUNkO1FBQ0QsT0FBTyxRQUFRLENBQUM7SUFDbEIsQ0FBQztJQWhCRCxzQ0FnQkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRWYWx1ZVN5bWJvbE9mRGVjbGFyYXRpb24obm9kZTogdHMuTm9kZSwgdHlwZUNoZWNrZXI6IHRzLlR5cGVDaGVja2VyKTogdHMuU3ltYm9sfFxuICAgIHVuZGVmaW5lZCB7XG4gIGxldCBzeW1ib2wgPSB0eXBlQ2hlY2tlci5nZXRTeW1ib2xBdExvY2F0aW9uKG5vZGUpO1xuXG4gIHdoaWxlIChzeW1ib2wgJiYgc3ltYm9sLmZsYWdzICYgdHMuU3ltYm9sRmxhZ3MuQWxpYXMpIHtcbiAgICBzeW1ib2wgPSB0eXBlQ2hlY2tlci5nZXRBbGlhc2VkU3ltYm9sKHN5bWJvbCk7XG4gIH1cblxuICByZXR1cm4gc3ltYm9sO1xufVxuXG4vKiogQ2hlY2tzIHdoZXRoZXIgYSBub2RlIGlzIHJlZmVycmluZyB0byBhIHNwZWNpZmljIGltcG9ydCBzcGVjaWZpZXIuICovXG5leHBvcnQgZnVuY3Rpb24gaXNSZWZlcmVuY2VUb0ltcG9ydChcbiAgICB0eXBlQ2hlY2tlcjogdHMuVHlwZUNoZWNrZXIsIG5vZGU6IHRzLk5vZGUsIGltcG9ydFNwZWNpZmllcjogdHMuSW1wb3J0U3BlY2lmaWVyKTogYm9vbGVhbiB7XG4gIGNvbnN0IG5vZGVTeW1ib2wgPSB0eXBlQ2hlY2tlci5nZXRUeXBlQXRMb2NhdGlvbihub2RlKS5nZXRTeW1ib2woKTtcbiAgY29uc3QgaW1wb3J0U3ltYm9sID0gdHlwZUNoZWNrZXIuZ2V0VHlwZUF0TG9jYXRpb24oaW1wb3J0U3BlY2lmaWVyKS5nZXRTeW1ib2woKTtcbiAgcmV0dXJuICEhKG5vZGVTeW1ib2wgJiYgaW1wb3J0U3ltYm9sKSAmJlxuICAgICAgbm9kZVN5bWJvbC52YWx1ZURlY2xhcmF0aW9uID09PSBpbXBvcnRTeW1ib2wudmFsdWVEZWNsYXJhdGlvbjtcbn1cblxuLyoqIENoZWNrcyB3aGV0aGVyIGEgbm9kZSdzIHR5cGUgaXMgbnVsbGFibGUgKGBudWxsYCwgYHVuZGVmaW5lZGAgb3IgYHZvaWRgKS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc051bGxhYmxlVHlwZSh0eXBlQ2hlY2tlcjogdHMuVHlwZUNoZWNrZXIsIG5vZGU6IHRzLk5vZGUpIHtcbiAgLy8gU2tpcCBleHByZXNzaW9ucyBpbiB0aGUgZm9ybSBvZiBgZm9vLmJhciEuYmF6YCBzaW5jZSB0aGUgYFR5cGVDaGVja2VyYCBzZWVtc1xuICAvLyB0byBpZGVudGlmeSB0aGVtIGFzIG51bGwsIGV2ZW4gdGhvdWdoIHRoZSB1c2VyIGluZGljYXRlZCB0aGF0IGl0IHdvbid0IGJlLlxuICBpZiAobm9kZS5wYXJlbnQgJiYgdHMuaXNOb25OdWxsRXhwcmVzc2lvbihub2RlLnBhcmVudCkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBjb25zdCB0eXBlID0gdHlwZUNoZWNrZXIuZ2V0VHlwZUF0TG9jYXRpb24obm9kZSk7XG4gIGNvbnN0IHR5cGVOb2RlID0gdHlwZUNoZWNrZXIudHlwZVRvVHlwZU5vZGUodHlwZSwgdW5kZWZpbmVkLCB0cy5Ob2RlQnVpbGRlckZsYWdzLk5vbmUpO1xuICBsZXQgaGFzU2Vlbk51bGxhYmxlVHlwZSA9IGZhbHNlO1xuXG4gIC8vIFRyYWNlIHRoZSB0eXBlIG9mIHRoZSBub2RlIGJhY2sgdG8gYSB0eXBlIG5vZGUsIHdhbGtcbiAgLy8gdGhyb3VnaCBhbGwgb2YgaXRzIHN1Yi1ub2RlcyBhbmQgbG9vayBmb3IgbnVsbGFibGUgdHllcy5cbiAgaWYgKHR5cGVOb2RlKSB7XG4gICAgKGZ1bmN0aW9uIHdhbGsoY3VycmVudDogdHMuTm9kZSkge1xuICAgICAgaWYgKGN1cnJlbnQua2luZCA9PT0gdHMuU3ludGF4S2luZC5OdWxsS2V5d29yZCB8fFxuICAgICAgICAgIGN1cnJlbnQua2luZCA9PT0gdHMuU3ludGF4S2luZC5VbmRlZmluZWRLZXl3b3JkIHx8XG4gICAgICAgICAgY3VycmVudC5raW5kID09PSB0cy5TeW50YXhLaW5kLlZvaWRLZXl3b3JkKSB7XG4gICAgICAgIGhhc1NlZW5OdWxsYWJsZVR5cGUgPSB0cnVlO1xuICAgICAgICAvLyBOb3RlIHRoYXQgd2UgZG9uJ3QgZGVzY2VuZCBpbnRvIHR5cGUgbGl0ZXJhbHMsIGJlY2F1c2UgaXQgbWF5IGNhdXNlXG4gICAgICAgIC8vIHVzIHRvIG1pcy1pZGVudGlmeSB0aGUgcm9vdCB0eXBlIGFzIG51bGxhYmxlLCBiZWNhdXNlIGl0IGhhcyBhIG51bGxhYmxlXG4gICAgICAgIC8vIHByb3BlcnR5IChlLmcuIGB7IGZvbzogc3RyaW5nIHwgbnVsbCB9YCkuXG4gICAgICB9IGVsc2UgaWYgKCFoYXNTZWVuTnVsbGFibGVUeXBlICYmICF0cy5pc1R5cGVMaXRlcmFsTm9kZShjdXJyZW50KSkge1xuICAgICAgICBjdXJyZW50LmZvckVhY2hDaGlsZCh3YWxrKTtcbiAgICAgIH1cbiAgICB9KSh0eXBlTm9kZSk7XG4gIH1cblxuICByZXR1cm4gaGFzU2Vlbk51bGxhYmxlVHlwZTtcbn1cblxuLyoqXG4gKiBXYWxrcyB0aHJvdWdoIHRoZSB0eXBlcyBhbmQgc3ViLXR5cGVzIG9mIGEgbm9kZSwgbG9va2luZyBmb3IgYVxuICogdHlwZSB0aGF0IGhhcyB0aGUgc2FtZSBuYW1lIGFzIG9uZSBvZiB0aGUgcGFzc2VkLWluIG9uZXMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBoYXNPbmVPZlR5cGVzKFxuICAgIHR5cGVDaGVja2VyOiB0cy5UeXBlQ2hlY2tlciwgbm9kZTogdHMuTm9kZSwgdHlwZXM6IHN0cmluZ1tdKTogYm9vbGVhbiB7XG4gIGNvbnN0IHR5cGUgPSB0eXBlQ2hlY2tlci5nZXRUeXBlQXRMb2NhdGlvbihub2RlKTtcbiAgY29uc3QgdHlwZU5vZGUgPVxuICAgICAgdHlwZSA/IHR5cGVDaGVja2VyLnR5cGVUb1R5cGVOb2RlKHR5cGUsIHVuZGVmaW5lZCwgdHMuTm9kZUJ1aWxkZXJGbGFncy5Ob25lKSA6IHVuZGVmaW5lZDtcbiAgbGV0IGhhc01hdGNoID0gZmFsc2U7XG4gIGlmICh0eXBlTm9kZSkge1xuICAgIChmdW5jdGlvbiB3YWxrKGN1cnJlbnQ6IHRzLk5vZGUpIHtcbiAgICAgIGlmICh0cy5pc0lkZW50aWZpZXIoY3VycmVudCkgJiYgdHlwZXMuaW5jbHVkZXMoY3VycmVudC50ZXh0KSkge1xuICAgICAgICBoYXNNYXRjaCA9IHRydWU7XG4gICAgICB9IGVsc2UgaWYgKCFoYXNNYXRjaCAmJiAhdHMuaXNUeXBlTGl0ZXJhbE5vZGUoY3VycmVudCkpIHtcbiAgICAgICAgY3VycmVudC5mb3JFYWNoQ2hpbGQod2Fsayk7XG4gICAgICB9XG4gICAgfSkodHlwZU5vZGUpO1xuICB9XG4gIHJldHVybiBoYXNNYXRjaDtcbn1cbiJdfQ==