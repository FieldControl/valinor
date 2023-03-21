"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.elideImports = void 0;
const ts = __importStar(require("typescript"));
// Remove imports for which all identifiers have been removed.
// Needs type checker, and works even if it's not the first transformer.
// Works by removing imports for symbols whose identifiers have all been removed.
// Doesn't use the `symbol.declarations` because that previous transforms might have removed nodes
// but the type checker doesn't know.
// See https://github.com/Microsoft/TypeScript/issues/17552 for more information.
function elideImports(sourceFile, removedNodes, getTypeChecker, compilerOptions) {
    const importNodeRemovals = new Set();
    if (removedNodes.length === 0) {
        return importNodeRemovals;
    }
    const typeChecker = getTypeChecker();
    // Collect all imports and used identifiers
    const usedSymbols = new Set();
    const imports = [];
    ts.forEachChild(sourceFile, function visit(node) {
        var _a;
        // Skip removed nodes.
        if (removedNodes.includes(node)) {
            return;
        }
        // Consider types for 'implements' as unused.
        // A HeritageClause token can also be an 'AbstractKeyword'
        // which in that case we should not elide the import.
        if (ts.isHeritageClause(node) && node.token === ts.SyntaxKind.ImplementsKeyword) {
            return;
        }
        // Record import and skip
        if (ts.isImportDeclaration(node)) {
            if (!((_a = node.importClause) === null || _a === void 0 ? void 0 : _a.isTypeOnly)) {
                imports.push(node);
            }
            return;
        }
        // Type reference imports do not need to be emitted when emitDecoratorMetadata is disabled.
        if (ts.isTypeReferenceNode(node) && !compilerOptions.emitDecoratorMetadata) {
            return;
        }
        let symbol;
        switch (node.kind) {
            case ts.SyntaxKind.Identifier:
                const parent = node.parent;
                if (parent && ts.isShorthandPropertyAssignment(parent)) {
                    const shorthandSymbol = typeChecker.getShorthandAssignmentValueSymbol(parent);
                    if (shorthandSymbol) {
                        symbol = shorthandSymbol;
                    }
                }
                else {
                    symbol = typeChecker.getSymbolAtLocation(node);
                }
                break;
            case ts.SyntaxKind.ExportSpecifier:
                symbol = typeChecker.getExportSpecifierLocalTargetSymbol(node);
                break;
            case ts.SyntaxKind.ShorthandPropertyAssignment:
                symbol = typeChecker.getShorthandAssignmentValueSymbol(node);
                break;
        }
        if (symbol) {
            usedSymbols.add(symbol);
        }
        ts.forEachChild(node, visit);
    });
    if (imports.length === 0) {
        return importNodeRemovals;
    }
    const isUnused = (node) => {
        // Do not remove JSX factory imports
        if (node.text === compilerOptions.jsxFactory) {
            return false;
        }
        const symbol = typeChecker.getSymbolAtLocation(node);
        return symbol && !usedSymbols.has(symbol);
    };
    for (const node of imports) {
        if (!node.importClause) {
            // "import 'abc';"
            continue;
        }
        const namedBindings = node.importClause.namedBindings;
        if (namedBindings && ts.isNamespaceImport(namedBindings)) {
            // "import * as XYZ from 'abc';"
            if (isUnused(namedBindings.name)) {
                importNodeRemovals.add(node);
            }
        }
        else {
            const specifierNodeRemovals = [];
            let clausesCount = 0;
            // "import { XYZ, ... } from 'abc';"
            if (namedBindings && ts.isNamedImports(namedBindings)) {
                let removedClausesCount = 0;
                clausesCount += namedBindings.elements.length;
                for (const specifier of namedBindings.elements) {
                    if (specifier.isTypeOnly || isUnused(specifier.name)) {
                        removedClausesCount++;
                        // in case we don't have any more namedImports we should remove the parent ie the {}
                        const nodeToRemove = clausesCount === removedClausesCount ? specifier.parent : specifier;
                        specifierNodeRemovals.push(nodeToRemove);
                    }
                }
            }
            // "import XYZ from 'abc';"
            if (node.importClause.name) {
                clausesCount++;
                if (node.importClause.isTypeOnly || isUnused(node.importClause.name)) {
                    specifierNodeRemovals.push(node.importClause.name);
                }
            }
            if (specifierNodeRemovals.length === clausesCount) {
                importNodeRemovals.add(node);
            }
            else {
                for (const specifierNodeRemoval of specifierNodeRemovals) {
                    importNodeRemovals.add(specifierNodeRemoval);
                }
            }
        }
    }
    return importNodeRemovals;
}
exports.elideImports = elideImports;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWxpZGVfaW1wb3J0cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL25ndG9vbHMvd2VicGFjay9zcmMvdHJhbnNmb3JtZXJzL2VsaWRlX2ltcG9ydHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFSCwrQ0FBaUM7QUFFakMsOERBQThEO0FBQzlELHdFQUF3RTtBQUN4RSxpRkFBaUY7QUFDakYsa0dBQWtHO0FBQ2xHLHFDQUFxQztBQUNyQyxpRkFBaUY7QUFDakYsU0FBZ0IsWUFBWSxDQUMxQixVQUF5QixFQUN6QixZQUF1QixFQUN2QixjQUFvQyxFQUNwQyxlQUFtQztJQUVuQyxNQUFNLGtCQUFrQixHQUFHLElBQUksR0FBRyxFQUFXLENBQUM7SUFFOUMsSUFBSSxZQUFZLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtRQUM3QixPQUFPLGtCQUFrQixDQUFDO0tBQzNCO0lBRUQsTUFBTSxXQUFXLEdBQUcsY0FBYyxFQUFFLENBQUM7SUFFckMsMkNBQTJDO0lBQzNDLE1BQU0sV0FBVyxHQUFHLElBQUksR0FBRyxFQUFhLENBQUM7SUFDekMsTUFBTSxPQUFPLEdBQTJCLEVBQUUsQ0FBQztJQUUzQyxFQUFFLENBQUMsWUFBWSxDQUFDLFVBQVUsRUFBRSxTQUFTLEtBQUssQ0FBQyxJQUFJOztRQUM3QyxzQkFBc0I7UUFDdEIsSUFBSSxZQUFZLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQy9CLE9BQU87U0FDUjtRQUVELDZDQUE2QztRQUM3QywwREFBMEQ7UUFDMUQscURBQXFEO1FBQ3JELElBQUksRUFBRSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxLQUFLLEtBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxpQkFBaUIsRUFBRTtZQUMvRSxPQUFPO1NBQ1I7UUFFRCx5QkFB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dCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbi8vIFJlbW92ZSBpbXBvcnRzIGZvciB3aGljaCBhbGwgaWRlbnRpZmllcnMgaGF2ZSBiZWVuIHJlbW92ZWQuXG4vLyBOZWVkcyB0eXBlIGNoZWNrZXIsIGFuZCB3b3JrcyBldmVuIGlmIGl0J3Mgbm90IHRoZSBmaXJzdCB0cmFuc2Zvcm1lci5cbi8vIFdvcmtzIGJ5IHJlbW92aW5nIGltcG9ydHMgZm9yIHN5bWJvbHMgd2hvc2UgaWRlbnRpZmllcnMgaGF2ZSBhbGwgYmVlbiByZW1vdmVkLlxuLy8gRG9lc24ndCB1c2UgdGhlIGBzeW1ib2wuZGVjbGFyYXRpb25zYCBiZWNhdXNlIHRoYXQgcHJldmlvdXMgdHJhbnNmb3JtcyBtaWdodCBoYXZlIHJlbW92ZWQgbm9kZXNcbi8vIGJ1dCB0aGUgdHlwZSBjaGVja2VyIGRvZXNuJ3Qga25vdy5cbi8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vTWljcm9zb2Z0L1R5cGVTY3JpcHQvaXNzdWVzLzE3NTUyIGZvciBtb3JlIGluZm9ybWF0aW9uLlxuZXhwb3J0IGZ1bmN0aW9uIGVsaWRlSW1wb3J0cyhcbiAgc291cmNlRmlsZTogdHMuU291cmNlRmlsZSxcbiAgcmVtb3ZlZE5vZGVzOiB0cy5Ob2RlW10sXG4gIGdldFR5cGVDaGVja2VyOiAoKSA9PiB0cy5UeXBlQ2hlY2tlcixcbiAgY29tcGlsZXJPcHRpb25zOiB0cy5Db21waWxlck9wdGlvbnMsXG4pOiBTZXQ8dHMuTm9kZT4ge1xuICBjb25zdCBpbXBvcnROb2RlUmVtb3ZhbHMgPSBuZXcgU2V0PHRzLk5vZGU+KCk7XG5cbiAgaWYgKHJlbW92ZWROb2Rlcy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gaW1wb3J0Tm9kZVJlbW92YWxzO1xuICB9XG5cbiAgY29uc3QgdHlwZUNoZWNrZXIgPSBnZXRUeXBlQ2hlY2tlcigpO1xuXG4gIC8vIENvbGxlY3QgYWxsIGltcG9ydHMgYW5kIHVzZWQgaWRlbnRpZmllcnNcbiAgY29uc3QgdXNlZFN5bWJvbHMgPSBuZXcgU2V0PHRzLlN5bWJvbD4oKTtcbiAgY29uc3QgaW1wb3J0czogdHMuSW1wb3J0RGVjbGFyYXRpb25bXSA9IFtdO1xuXG4gIHRzLmZvckVhY2hDaGlsZChzb3VyY2VGaWxlLCBmdW5jdGlvbiB2aXNpdChub2RlKSB7XG4gICAgLy8gU2tpcCByZW1vdmVkIG5vZGVzLlxuICAgIGlmIChyZW1vdmVkTm9kZXMuaW5jbHVkZXMobm9kZSkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBDb25zaWRlciB0eXBlcyBmb3IgJ2ltcGxlbWVudHMnIGFzIHVudXNlZC5cbiAgICAvLyBBIEhlcml0YWdlQ2xhdXNlIHRva2VuIGNhbiBhbHNvIGJlIGFuICdBYnN0cmFjdEtleXdvcmQnXG4gICAgLy8gd2hpY2ggaW4gdGhhdCBjYXNlIHdlIHNob3VsZCBub3QgZWxpZGUgdGhlIGltcG9ydC5cbiAgICBpZiAodHMuaXNIZXJpdGFnZUNsYXVzZShub2RlKSAmJiBub2RlLnRva2VuID09PSB0cy5TeW50YXhLaW5kLkltcGxlbWVudHNLZXl3b3JkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gUmVjb3JkIGltcG9ydCBhbmQgc2tpcFxuICAgIGlmICh0cy5pc0ltcG9ydERlY2xhcmF0aW9uKG5vZGUpKSB7XG4gICAgICBpZiAoIW5vZGUuaW1wb3J0Q2xhdXNlPy5pc1R5cGVPbmx5KSB7XG4gICAgICAgIGltcG9ydHMucHVzaChub2RlKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFR5cGUgcmVmZXJlbmNlIGltcG9ydHMgZG8gbm90IG5lZWQgdG8gYmUgZW1pdHRlZCB3aGVuIGVtaXREZWNvcmF0b3JNZXRhZGF0YSBpcyBkaXNhYmxlZC5cbiAgICBpZiAodHMuaXNUeXBlUmVmZXJlbmNlTm9kZShub2RlKSAmJiAhY29tcGlsZXJPcHRpb25zLmVtaXREZWNvcmF0b3JNZXRhZGF0YSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCBzeW1ib2w6IHRzLlN5bWJvbCB8IHVuZGVmaW5lZDtcbiAgICBzd2l0Y2ggKG5vZGUua2luZCkge1xuICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLklkZW50aWZpZXI6XG4gICAgICAgIGNvbnN0IHBhcmVudCA9IG5vZGUucGFyZW50O1xuICAgICAgICBpZiAocGFyZW50ICYmIHRzLmlzU2hvcnRoYW5kUHJvcGVydHlBc3NpZ25tZW50KHBhcmVudCkpIHtcbiAgICAgICAgICBjb25zdCBzaG9ydGhhbmRTeW1ib2wgPSB0eXBlQ2hlY2tlci5nZXRTaG9ydGhhbmRBc3NpZ25tZW50VmFsdWVTeW1ib2wocGFyZW50KTtcbiAgICAgICAgICBpZiAoc2hvcnRoYW5kU3ltYm9sKSB7XG4gICAgICAgICAgICBzeW1ib2wgPSBzaG9ydGhhbmRTeW1ib2w7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN5bWJvbCA9IHR5cGVDaGVja2VyLmdldFN5bWJvbEF0TG9jYXRpb24obm9kZSk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIHRzLlN5bnRheEtpbmQuRXhwb3J0U3BlY2lmaWVyOlxuICAgICAgICBzeW1ib2wgPSB0eXBlQ2hlY2tlci5nZXRFeHBvcnRTcGVjaWZpZXJMb2NhbFRhcmdldFN5bWJvbChub2RlIGFzIHRzLkV4cG9ydFNwZWNpZmllcik7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlNob3J0aGFuZFByb3BlcnR5QXNzaWdubWVudDpcbiAgICAgICAgc3ltYm9sID0gdHlwZUNoZWNrZXIuZ2V0U2hvcnRoYW5kQXNzaWdubWVudFZhbHVlU3ltYm9sKG5vZGUpO1xuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICBpZiAoc3ltYm9sKSB7XG4gICAgICB1c2VkU3ltYm9scy5hZGQoc3ltYm9sKTtcbiAgICB9XG5cbiAgICB0cy5mb3JFYWNoQ2hpbGQobm9kZSwgdmlzaXQpO1xuICB9KTtcblxuICBpZiAoaW1wb3J0cy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gaW1wb3J0Tm9kZVJlbW92YWxzO1xuICB9XG5cbiAgY29uc3QgaXNVbnVzZWQgPSAobm9kZTogdHMuSWRlbnRpZmllcikgPT4ge1xuICAgIC8vIERvIG5vdCByZW1vdmUgSlNYIGZhY3RvcnkgaW1wb3J0c1xuICAgIGlmIChub2RlLnRleHQgPT09IGNvbXBpbGVyT3B0aW9ucy5qc3hGYWN0b3J5KSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgY29uc3Qgc3ltYm9sID0gdHlwZUNoZWNrZXIuZ2V0U3ltYm9sQXRMb2NhdGlvbihub2RlKTtcblxuICAgIHJldHVybiBzeW1ib2wgJiYgIXVzZWRTeW1ib2xzLmhhcyhzeW1ib2wpO1xuICB9O1xuXG4gIGZvciAoY29uc3Qgbm9kZSBvZiBpbXBvcnRzKSB7XG4gICAgaWYgKCFub2RlLmltcG9ydENsYXVzZSkge1xuICAgICAgLy8gXCJpbXBvcnQgJ2FiYyc7XCJcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIGNvbnN0IG5hbWVkQmluZGluZ3MgPSBub2RlLmltcG9ydENsYXVzZS5uYW1lZEJpbmRpbmdzO1xuXG4gICAgaWYgKG5hbWVkQmluZGluZ3MgJiYgdHMuaXNOYW1lc3BhY2VJbXBvcnQobmFtZWRCaW5kaW5ncykpIHtcbiAgICAgIC8vIFwiaW1wb3J0ICogYXMgWFlaIGZyb20gJ2FiYyc7XCJcbiAgICAgIGlmIChpc1VudXNlZChuYW1lZEJpbmRpbmdzLm5hbWUpKSB7XG4gICAgICAgIGltcG9ydE5vZGVSZW1vdmFscy5hZGQobm9kZSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHNwZWNpZmllck5vZGVSZW1vdmFscyA9IFtdO1xuICAgICAgbGV0IGNsYXVzZXNDb3VudCA9IDA7XG5cbiAgICAgIC8vIFwiaW1wb3J0IHsgWFlaLCAuLi4gfSBmcm9tICdhYmMnO1wiXG4gICAgICBpZiAobmFtZWRCaW5kaW5ncyAmJiB0cy5pc05hbWVkSW1wb3J0cyhuYW1lZEJpbmRpbmdzKSkge1xuICAgICAgICBsZXQgcmVtb3ZlZENsYXVzZXNDb3VudCA9IDA7XG4gICAgICAgIGNsYXVzZXNDb3VudCArPSBuYW1lZEJpbmRpbmdzLmVsZW1lbnRzLmxlbmd0aDtcblxuICAgICAgICBmb3IgKGNvbnN0IHNwZWNpZmllciBvZiBuYW1lZEJpbmRpbmdzLmVsZW1lbnRzKSB7XG4gICAgICAgICAgaWYgKHNwZWNpZmllci5pc1R5cGVPbmx5IHx8IGlzVW51c2VkKHNwZWNpZmllci5uYW1lKSkge1xuICAgICAgICAgICAgcmVtb3ZlZENsYXVzZXNDb3VudCsrO1xuICAgICAgICAgICAgLy8gaW4gY2FzZSB3ZSBkb24ndCBoYXZlIGFueSBtb3JlIG5hbWVkSW1wb3J0cyB3ZSBzaG91bGQgcmVtb3ZlIHRoZSBwYXJlbnQgaWUgdGhlIHt9XG4gICAgICAgICAgICBjb25zdCBub2RlVG9SZW1vdmUgPVxuICAgICAgICAgICAgICBjbGF1c2VzQ291bnQgPT09IHJlbW92ZWRDbGF1c2VzQ291bnQgPyBzcGVjaWZpZXIucGFyZW50IDogc3BlY2lmaWVyO1xuXG4gICAgICAgICAgICBzcGVjaWZpZXJOb2RlUmVtb3ZhbHMucHVzaChub2RlVG9SZW1vdmUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBcImltcG9ydCBYWVogZnJvbSAnYWJjJztcIlxuICAgICAgaWYgKG5vZGUuaW1wb3J0Q2xhdXNlLm5hbWUpIHtcbiAgICAgICAgY2xhdXNlc0NvdW50Kys7XG5cbiAgICAgICAgaWYgKG5vZGUuaW1wb3J0Q2xhdXNlLmlzVHlwZU9ubHkgfHwgaXNVbnVzZWQobm9kZS5pbXBvcnRDbGF1c2UubmFtZSkpIHtcbiAgICAgICAgICBzcGVjaWZpZXJOb2RlUmVtb3ZhbHMucHVzaChub2RlLmltcG9ydENsYXVzZS5uYW1lKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoc3BlY2lmaWVyTm9kZVJlbW92YWxzLmxlbmd0aCA9PT0gY2xhdXNlc0NvdW50KSB7XG4gICAgICAgIGltcG9ydE5vZGVSZW1vdmFscy5hZGQobm9kZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmb3IgKGNvbnN0IHNwZWNpZmllck5vZGVSZW1vdmFsIG9mIHNwZWNpZmllck5vZGVSZW1vdmFscykge1xuICAgICAgICAgIGltcG9ydE5vZGVSZW1vdmFscy5hZGQoc3BlY2lmaWVyTm9kZVJlbW92YWwpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGltcG9ydE5vZGVSZW1vdmFscztcbn1cbiJdfQ==