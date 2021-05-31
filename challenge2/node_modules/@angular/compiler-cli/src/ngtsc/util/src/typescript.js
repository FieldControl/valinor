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
        define("@angular/compiler-cli/src/ngtsc/util/src/typescript", ["require", "exports", "tslib", "typescript", "@angular/compiler-cli/src/ngtsc/file_system"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.toUnredirectedSourceFile = exports.isAssignment = exports.resolveModuleName = exports.nodeDebugInfo = exports.getRootDirs = exports.isExported = exports.isNamedDeclaration = exports.isTypeDeclaration = exports.isValueDeclaration = exports.isDeclaration = exports.identifierOfNode = exports.getTokenAtPosition = exports.getSourceFileOrNull = exports.getSourceFile = exports.nodeNameForError = exports.isFromDtsFile = exports.isNonDeclarationTsPath = exports.isDtsPath = void 0;
    var tslib_1 = require("tslib");
    var TS = /\.tsx?$/i;
    var D_TS = /\.d\.ts$/i;
    var ts = require("typescript");
    var file_system_1 = require("@angular/compiler-cli/src/ngtsc/file_system");
    function isDtsPath(filePath) {
        return D_TS.test(filePath);
    }
    exports.isDtsPath = isDtsPath;
    function isNonDeclarationTsPath(filePath) {
        return TS.test(filePath) && !D_TS.test(filePath);
    }
    exports.isNonDeclarationTsPath = isNonDeclarationTsPath;
    function isFromDtsFile(node) {
        var sf = node.getSourceFile();
        if (sf === undefined) {
            sf = ts.getOriginalNode(node).getSourceFile();
        }
        return sf !== undefined && sf.isDeclarationFile;
    }
    exports.isFromDtsFile = isFromDtsFile;
    function nodeNameForError(node) {
        if (node.name !== undefined && ts.isIdentifier(node.name)) {
            return node.name.text;
        }
        else {
            var kind = ts.SyntaxKind[node.kind];
            var _a = ts.getLineAndCharacterOfPosition(node.getSourceFile(), node.getStart()), line = _a.line, character = _a.character;
            return kind + "@" + line + ":" + character;
        }
    }
    exports.nodeNameForError = nodeNameForError;
    function getSourceFile(node) {
        // In certain transformation contexts, `ts.Node.getSourceFile()` can actually return `undefined`,
        // despite the type signature not allowing it. In that event, get the `ts.SourceFile` via the
        // original node instead (which works).
        var directSf = node.getSourceFile();
        return directSf !== undefined ? directSf : ts.getOriginalNode(node).getSourceFile();
    }
    exports.getSourceFile = getSourceFile;
    function getSourceFileOrNull(program, fileName) {
        return program.getSourceFile(fileName) || null;
    }
    exports.getSourceFileOrNull = getSourceFileOrNull;
    function getTokenAtPosition(sf, pos) {
        // getTokenAtPosition is part of TypeScript's private API.
        return ts.getTokenAtPosition(sf, pos);
    }
    exports.getTokenAtPosition = getTokenAtPosition;
    function identifierOfNode(decl) {
        if (decl.name !== undefined && ts.isIdentifier(decl.name)) {
            return decl.name;
        }
        else {
            return null;
        }
    }
    exports.identifierOfNode = identifierOfNode;
    function isDeclaration(node) {
        return isValueDeclaration(node) || isTypeDeclaration(node);
    }
    exports.isDeclaration = isDeclaration;
    function isValueDeclaration(node) {
        return ts.isClassDeclaration(node) || ts.isFunctionDeclaration(node) ||
            ts.isVariableDeclaration(node);
    }
    exports.isValueDeclaration = isValueDeclaration;
    function isTypeDeclaration(node) {
        return ts.isEnumDeclaration(node) || ts.isTypeAliasDeclaration(node) ||
            ts.isInterfaceDeclaration(node);
    }
    exports.isTypeDeclaration = isTypeDeclaration;
    function isNamedDeclaration(node) {
        var namedNode = node;
        return namedNode.name !== undefined && ts.isIdentifier(namedNode.name);
    }
    exports.isNamedDeclaration = isNamedDeclaration;
    function isExported(node) {
        var topLevel = node;
        if (ts.isVariableDeclaration(node) && ts.isVariableDeclarationList(node.parent)) {
            topLevel = node.parent.parent;
        }
        return topLevel.modifiers !== undefined &&
            topLevel.modifiers.some(function (modifier) { return modifier.kind === ts.SyntaxKind.ExportKeyword; });
    }
    exports.isExported = isExported;
    function getRootDirs(host, options) {
        var rootDirs = [];
        var cwd = host.getCurrentDirectory();
        var fs = file_system_1.getFileSystem();
        if (options.rootDirs !== undefined) {
            rootDirs.push.apply(rootDirs, tslib_1.__spreadArray([], tslib_1.__read(options.rootDirs)));
        }
        else if (options.rootDir !== undefined) {
            rootDirs.push(options.rootDir);
        }
        else {
            rootDirs.push(cwd);
        }
        // In Windows the above might not always return posix separated paths
        // See:
        // https://github.com/Microsoft/TypeScript/blob/3f7357d37f66c842d70d835bc925ec2a873ecfec/src/compiler/sys.ts#L650
        // Also compiler options might be set via an API which doesn't normalize paths
        return rootDirs.map(function (rootDir) { return fs.resolve(cwd, host.getCanonicalFileName(rootDir)); });
    }
    exports.getRootDirs = getRootDirs;
    function nodeDebugInfo(node) {
        var sf = getSourceFile(node);
        var _a = ts.getLineAndCharacterOfPosition(sf, node.pos), line = _a.line, character = _a.character;
        return "[" + sf.fileName + ": " + ts.SyntaxKind[node.kind] + " @ " + line + ":" + character + "]";
    }
    exports.nodeDebugInfo = nodeDebugInfo;
    /**
     * Resolve the specified `moduleName` using the given `compilerOptions` and `compilerHost`.
     *
     * This helper will attempt to use the `CompilerHost.resolveModuleNames()` method if available.
     * Otherwise it will fallback on the `ts.ResolveModuleName()` function.
     */
    function resolveModuleName(moduleName, containingFile, compilerOptions, compilerHost, moduleResolutionCache) {
        if (compilerHost.resolveModuleNames) {
            return compilerHost.resolveModuleNames([moduleName], containingFile, undefined, // reusedNames
            undefined, // redirectedReference
            compilerOptions)[0];
        }
        else {
            return ts
                .resolveModuleName(moduleName, containingFile, compilerOptions, compilerHost, moduleResolutionCache !== null ? moduleResolutionCache : undefined)
                .resolvedModule;
        }
    }
    exports.resolveModuleName = resolveModuleName;
    /** Returns true if the node is an assignment expression. */
    function isAssignment(node) {
        return ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.EqualsToken;
    }
    exports.isAssignment = isAssignment;
    /**
     * Obtains the non-redirected source file for `sf`.
     */
    function toUnredirectedSourceFile(sf) {
        var redirectInfo = sf.redirectInfo;
        if (redirectInfo === undefined) {
            return sf;
        }
        return redirectInfo.unredirected;
    }
    exports.toUnredirectedSourceFile = toUnredirectedSourceFile;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZXNjcmlwdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvbmd0c2MvdXRpbC9zcmMvdHlwZXNjcmlwdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBRUgsSUFBTSxFQUFFLEdBQUcsVUFBVSxDQUFDO0lBQ3RCLElBQU0sSUFBSSxHQUFHLFdBQVcsQ0FBQztJQUV6QiwrQkFBaUM7SUFDakMsMkVBQWdFO0lBR2hFLFNBQWdCLFNBQVMsQ0FBQyxRQUFnQjtRQUN4QyxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDN0IsQ0FBQztJQUZELDhCQUVDO0lBRUQsU0FBZ0Isc0JBQXNCLENBQUMsUUFBZ0I7UUFDckQsT0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNuRCxDQUFDO0lBRkQsd0RBRUM7SUFFRCxTQUFnQixhQUFhLENBQUMsSUFBYTtRQUN6QyxJQUFJLEVBQUUsR0FBNEIsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQ3ZELElBQUksRUFBRSxLQUFLLFNBQVMsRUFBRTtZQUNwQixFQUFFLEdBQUcsRUFBRSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxhQUFhLEVBQUUsQ0FBQztTQUMvQztRQUNELE9BQU8sRUFBRSxLQUFLLFNBQVMsSUFBSSxFQUFFLENBQUMsaUJBQWlCLENBQUM7SUFDbEQsQ0FBQztJQU5ELHNDQU1DO0lBRUQsU0FBZ0IsZ0JBQWdCLENBQUMsSUFBOEI7UUFDN0QsSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLFNBQVMsSUFBSSxFQUFFLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUN6RCxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO1NBQ3ZCO2FBQU07WUFDTCxJQUFNLElBQUksR0FBRyxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNoQyxJQUFBLEtBQ0YsRUFBRSxDQUFDLDZCQUE2QixDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsRUFEcEUsSUFBSSxVQUFBLEVBQUUsU0FBUyxlQUNxRCxDQUFDO1lBQzVFLE9BQVUsSUFBSSxTQUFJLElBQUksU0FBSSxTQUFXLENBQUM7U0FDdkM7SUFDSCxDQUFDO0lBVEQsNENBU0M7SUFFRCxTQUFnQixhQUFhLENBQUMsSUFBYTtRQUN6QyxpR0FBaUc7UUFDakcsNkZBQTZGO1FBQzdGLHVDQUF1QztRQUN2QyxJQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsYUFBYSxFQUErQixDQUFDO1FBQ25FLE9BQU8sUUFBUSxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDLGFBQWEsRUFBRSxDQUFDO0lBQ3RGLENBQUM7SUFORCxzQ0FNQztJQUVELFNBQWdCLG1CQUFtQixDQUFDLE9BQW1CLEVBQUUsUUFBd0I7UUFFL0UsT0FBTyxPQUFPLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxJQUFJLElBQUksQ0FBQztJQUNqRCxDQUFDO0lBSEQsa0RBR0M7SUFHRCxTQUFnQixrQkFBa0IsQ0FBQyxFQUFpQixFQUFFLEdBQVc7UUFDL0QsMERBQTBEO1FBQzFELE9BQVEsRUFBVSxDQUFDLGtCQUFrQixDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUNqRCxDQUFDO0lBSEQsZ0RBR0M7SUFFRCxTQUFnQixnQkFBZ0IsQ0FBQyxJQUE4QjtRQUM3RCxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssU0FBUyxJQUFJLEVBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ3pELE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQztTQUNsQjthQUFNO1lBQ0wsT0FBTyxJQUFJLENBQUM7U0FDYjtJQUNILENBQUM7SUFORCw0Q0FNQztJQUVELFNBQWdCLGFBQWEsQ0FBQyxJQUFhO1FBQ3pDLE9BQU8sa0JBQWtCLENBQUMsSUFBSSxDQUFDLElBQUksaUJBQWlCLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDN0QsQ0FBQztJQUZELHNDQUVDO0lBRUQsU0FBZ0Isa0JBQWtCLENBQUMsSUFBYTtRQUU5QyxPQUFPLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDO1lBQ2hFLEVBQUUsQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNyQyxDQUFDO0lBSkQsZ0RBSUM7SUFFRCxTQUFnQixpQkFBaUIsQ0FBQyxJQUFhO1FBRTdDLE9BQU8sRUFBRSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUM7WUFDaEUsRUFBRSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3RDLENBQUM7SUFKRCw4Q0FJQztJQUVELFNBQWdCLGtCQUFrQixDQUFDLElBQWE7UUFDOUMsSUFBTSxTQUFTLEdBQUcsSUFBOEIsQ0FBQztRQUNqRCxPQUFPLFNBQVMsQ0FBQyxJQUFJLEtBQUssU0FBUyxJQUFJLEVBQUUsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3pFLENBQUM7SUFIRCxnREFHQztJQUVELFNBQWdCLFVBQVUsQ0FBQyxJQUFxQjtRQUM5QyxJQUFJLFFBQVEsR0FBWSxJQUFJLENBQUM7UUFDN0IsSUFBSSxFQUFFLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLHlCQUF5QixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUMvRSxRQUFRLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7U0FDL0I7UUFDRCxPQUFPLFFBQVEsQ0FBQyxTQUFTLEtBQUssU0FBUztZQUNuQyxRQUFRLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFBLFFBQVEsSUFBSSxPQUFBLFFBQVEsQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxhQUFhLEVBQTdDLENBQTZDLENBQUMsQ0FBQztJQUN6RixDQUFDO0lBUEQsZ0NBT0M7SUFFRCxTQUFnQixXQUFXLENBQ3ZCLElBQXlFLEVBQ3pFLE9BQTJCO1FBQzdCLElBQU0sUUFBUSxHQUFhLEVBQUUsQ0FBQztRQUM5QixJQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztRQUN2QyxJQUFNLEVBQUUsR0FBRywyQkFBYSxFQUFFLENBQUM7UUFDM0IsSUFBSSxPQUFPLENBQUMsUUFBUSxLQUFLLFNBQVMsRUFBRTtZQUNsQyxRQUFRLENBQUMsSUFBSSxPQUFiLFFBQVEsMkNBQVMsT0FBTyxDQUFDLFFBQVEsSUFBRTtTQUNwQzthQUFNLElBQUksT0FBTyxDQUFDLE9BQU8sS0FBSyxTQUFTLEVBQUU7WUFDeEMsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDaEM7YUFBTTtZQUNMLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDcEI7UUFFRCxxRUFBcUU7UUFDckUsT0FBTztRQUNQLGlIQUFpSDtRQUNqSCw4RUFBOEU7UUFDOUUsT0FBTyxRQUFRLENBQUMsR0FBRyxDQUFDLFVBQUEsT0FBTyxJQUFJLE9BQUEsRUFBRSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLG9CQUFvQixDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQW5ELENBQW1ELENBQUMsQ0FBQztJQUN0RixDQUFDO0lBbkJELGtDQW1CQztJQUVELFNBQWdCLGFBQWEsQ0FBQyxJQUFhO1FBQ3pDLElBQU0sRUFBRSxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN6QixJQUFBLEtBQW9CLEVBQUUsQ0FBQyw2QkFBNkIsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFqRSxJQUFJLFVBQUEsRUFBRSxTQUFTLGVBQWtELENBQUM7UUFDekUsT0FBTyxNQUFJLEVBQUUsQ0FBQyxRQUFRLFVBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQU0sSUFBSSxTQUFJLFNBQVMsTUFBRyxDQUFDO0lBQ2hGLENBQUM7SUFKRCxzQ0FJQztJQUVEOzs7OztPQUtHO0lBQ0gsU0FBZ0IsaUJBQWlCLENBQzdCLFVBQWtCLEVBQUUsY0FBc0IsRUFBRSxlQUFtQyxFQUMvRSxZQUFpRixFQUNqRixxQkFBb0Q7UUFDdEQsSUFBSSxZQUFZLENBQUMsa0JBQWtCLEVBQUU7WUFDbkMsT0FBTyxZQUFZLENBQUMsa0JBQWtCLENBQ2xDLENBQUMsVUFBVSxDQUFDLEVBQUUsY0FBYyxFQUM1QixTQUFTLEVBQUcsY0FBYztZQUMxQixTQUFTLEVBQUcsc0JBQXNCO1lBQ2xDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ3pCO2FBQU07WUFDTCxPQUFPLEVBQUU7aUJBQ0osaUJBQWlCLENBQ2QsVUFBVSxFQUFFLGNBQWMsRUFBRSxlQUFlLEVBQUUsWUFBWSxFQUN6RCxxQkFBcUIsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7aUJBQ3RFLGNBQWMsQ0FBQztTQUNyQjtJQUNILENBQUM7SUFqQkQsOENBaUJDO0lBRUQsNERBQTREO0lBQzVELFNBQWdCLFlBQVksQ0FBQyxJQUFhO1FBQ3hDLE9BQU8sRUFBRSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDO0lBQzlGLENBQUM7SUFGRCxvQ0FFQztJQXdCRDs7T0FFRztJQUNILFNBQWdCLHdCQUF3QixDQUFDLEVBQWlCO1FBQ3hELElBQU0sWUFBWSxHQUFJLEVBQTJCLENBQUMsWUFBWSxDQUFDO1FBQy9ELElBQUksWUFBWSxLQUFLLFNBQVMsRUFBRTtZQUM5QixPQUFPLEVBQUUsQ0FBQztTQUNYO1FBQ0QsT0FBTyxZQUFZLENBQUMsWUFBWSxDQUFDO0lBQ25DLENBQUM7SUFORCw0REFNQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5jb25zdCBUUyA9IC9cXC50c3g/JC9pO1xuY29uc3QgRF9UUyA9IC9cXC5kXFwudHMkL2k7XG5cbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuaW1wb3J0IHtBYnNvbHV0ZUZzUGF0aCwgZ2V0RmlsZVN5c3RlbX0gZnJvbSAnLi4vLi4vZmlsZV9zeXN0ZW0nO1xuaW1wb3J0IHtEZWNsYXJhdGlvbk5vZGV9IGZyb20gJy4uLy4uL3JlZmxlY3Rpb24nO1xuXG5leHBvcnQgZnVuY3Rpb24gaXNEdHNQYXRoKGZpbGVQYXRoOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgcmV0dXJuIERfVFMudGVzdChmaWxlUGF0aCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc05vbkRlY2xhcmF0aW9uVHNQYXRoKGZpbGVQYXRoOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgcmV0dXJuIFRTLnRlc3QoZmlsZVBhdGgpICYmICFEX1RTLnRlc3QoZmlsZVBhdGgpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNGcm9tRHRzRmlsZShub2RlOiB0cy5Ob2RlKTogYm9vbGVhbiB7XG4gIGxldCBzZjogdHMuU291cmNlRmlsZXx1bmRlZmluZWQgPSBub2RlLmdldFNvdXJjZUZpbGUoKTtcbiAgaWYgKHNmID09PSB1bmRlZmluZWQpIHtcbiAgICBzZiA9IHRzLmdldE9yaWdpbmFsTm9kZShub2RlKS5nZXRTb3VyY2VGaWxlKCk7XG4gIH1cbiAgcmV0dXJuIHNmICE9PSB1bmRlZmluZWQgJiYgc2YuaXNEZWNsYXJhdGlvbkZpbGU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBub2RlTmFtZUZvckVycm9yKG5vZGU6IHRzLk5vZGUme25hbWU/OiB0cy5Ob2RlfSk6IHN0cmluZyB7XG4gIGlmIChub2RlLm5hbWUgIT09IHVuZGVmaW5lZCAmJiB0cy5pc0lkZW50aWZpZXIobm9kZS5uYW1lKSkge1xuICAgIHJldHVybiBub2RlLm5hbWUudGV4dDtcbiAgfSBlbHNlIHtcbiAgICBjb25zdCBraW5kID0gdHMuU3ludGF4S2luZFtub2RlLmtpbmRdO1xuICAgIGNvbnN0IHtsaW5lLCBjaGFyYWN0ZXJ9ID1cbiAgICAgICAgdHMuZ2V0TGluZUFuZENoYXJhY3Rlck9mUG9zaXRpb24obm9kZS5nZXRTb3VyY2VGaWxlKCksIG5vZGUuZ2V0U3RhcnQoKSk7XG4gICAgcmV0dXJuIGAke2tpbmR9QCR7bGluZX06JHtjaGFyYWN0ZXJ9YDtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0U291cmNlRmlsZShub2RlOiB0cy5Ob2RlKTogdHMuU291cmNlRmlsZSB7XG4gIC8vIEluIGNlcnRhaW4gdHJhbnNmb3JtYXRpb24gY29udGV4dHMsIGB0cy5Ob2RlLmdldFNvdXJjZUZpbGUoKWAgY2FuIGFjdHVhbGx5IHJldHVybiBgdW5kZWZpbmVkYCxcbiAgLy8gZGVzcGl0ZSB0aGUgdHlwZSBzaWduYXR1cmUgbm90IGFsbG93aW5nIGl0LiBJbiB0aGF0IGV2ZW50LCBnZXQgdGhlIGB0cy5Tb3VyY2VGaWxlYCB2aWEgdGhlXG4gIC8vIG9yaWdpbmFsIG5vZGUgaW5zdGVhZCAod2hpY2ggd29ya3MpLlxuICBjb25zdCBkaXJlY3RTZiA9IG5vZGUuZ2V0U291cmNlRmlsZSgpIGFzIHRzLlNvdXJjZUZpbGUgfCB1bmRlZmluZWQ7XG4gIHJldHVybiBkaXJlY3RTZiAhPT0gdW5kZWZpbmVkID8gZGlyZWN0U2YgOiB0cy5nZXRPcmlnaW5hbE5vZGUobm9kZSkuZ2V0U291cmNlRmlsZSgpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0U291cmNlRmlsZU9yTnVsbChwcm9ncmFtOiB0cy5Qcm9ncmFtLCBmaWxlTmFtZTogQWJzb2x1dGVGc1BhdGgpOiB0cy5Tb3VyY2VGaWxlfFxuICAgIG51bGwge1xuICByZXR1cm4gcHJvZ3JhbS5nZXRTb3VyY2VGaWxlKGZpbGVOYW1lKSB8fCBudWxsO1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRUb2tlbkF0UG9zaXRpb24oc2Y6IHRzLlNvdXJjZUZpbGUsIHBvczogbnVtYmVyKTogdHMuTm9kZSB7XG4gIC8vIGdldFRva2VuQXRQb3NpdGlvbiBpcyBwYXJ0IG9mIFR5cGVTY3JpcHQncyBwcml2YXRlIEFQSS5cbiAgcmV0dXJuICh0cyBhcyBhbnkpLmdldFRva2VuQXRQb3NpdGlvbihzZiwgcG9zKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlkZW50aWZpZXJPZk5vZGUoZGVjbDogdHMuTm9kZSZ7bmFtZT86IHRzLk5vZGV9KTogdHMuSWRlbnRpZmllcnxudWxsIHtcbiAgaWYgKGRlY2wubmFtZSAhPT0gdW5kZWZpbmVkICYmIHRzLmlzSWRlbnRpZmllcihkZWNsLm5hbWUpKSB7XG4gICAgcmV0dXJuIGRlY2wubmFtZTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNEZWNsYXJhdGlvbihub2RlOiB0cy5Ob2RlKTogbm9kZSBpcyB0cy5EZWNsYXJhdGlvbiB7XG4gIHJldHVybiBpc1ZhbHVlRGVjbGFyYXRpb24obm9kZSkgfHwgaXNUeXBlRGVjbGFyYXRpb24obm9kZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1ZhbHVlRGVjbGFyYXRpb24obm9kZTogdHMuTm9kZSk6IG5vZGUgaXMgdHMuQ2xhc3NEZWNsYXJhdGlvbnxcbiAgICB0cy5GdW5jdGlvbkRlY2xhcmF0aW9ufHRzLlZhcmlhYmxlRGVjbGFyYXRpb24ge1xuICByZXR1cm4gdHMuaXNDbGFzc0RlY2xhcmF0aW9uKG5vZGUpIHx8IHRzLmlzRnVuY3Rpb25EZWNsYXJhdGlvbihub2RlKSB8fFxuICAgICAgdHMuaXNWYXJpYWJsZURlY2xhcmF0aW9uKG5vZGUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNUeXBlRGVjbGFyYXRpb24obm9kZTogdHMuTm9kZSk6IG5vZGUgaXMgdHMuRW51bURlY2xhcmF0aW9ufFxuICAgIHRzLlR5cGVBbGlhc0RlY2xhcmF0aW9ufHRzLkludGVyZmFjZURlY2xhcmF0aW9uIHtcbiAgcmV0dXJuIHRzLmlzRW51bURlY2xhcmF0aW9uKG5vZGUpIHx8IHRzLmlzVHlwZUFsaWFzRGVjbGFyYXRpb24obm9kZSkgfHxcbiAgICAgIHRzLmlzSW50ZXJmYWNlRGVjbGFyYXRpb24obm9kZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc05hbWVkRGVjbGFyYXRpb24obm9kZTogdHMuTm9kZSk6IG5vZGUgaXMgdHMuRGVjbGFyYXRpb24me25hbWU6IHRzLklkZW50aWZpZXJ9IHtcbiAgY29uc3QgbmFtZWROb2RlID0gbm9kZSBhcyB7bmFtZT86IHRzLklkZW50aWZpZXJ9O1xuICByZXR1cm4gbmFtZWROb2RlLm5hbWUgIT09IHVuZGVmaW5lZCAmJiB0cy5pc0lkZW50aWZpZXIobmFtZWROb2RlLm5hbWUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNFeHBvcnRlZChub2RlOiBEZWNsYXJhdGlvbk5vZGUpOiBib29sZWFuIHtcbiAgbGV0IHRvcExldmVsOiB0cy5Ob2RlID0gbm9kZTtcbiAgaWYgKHRzLmlzVmFyaWFibGVEZWNsYXJhdGlvbihub2RlKSAmJiB0cy5pc1ZhcmlhYmxlRGVjbGFyYXRpb25MaXN0KG5vZGUucGFyZW50KSkge1xuICAgIHRvcExldmVsID0gbm9kZS5wYXJlbnQucGFyZW50O1xuICB9XG4gIHJldHVybiB0b3BMZXZlbC5tb2RpZmllcnMgIT09IHVuZGVmaW5lZCAmJlxuICAgICAgdG9wTGV2ZWwubW9kaWZpZXJzLnNvbWUobW9kaWZpZXIgPT4gbW9kaWZpZXIua2luZCA9PT0gdHMuU3ludGF4S2luZC5FeHBvcnRLZXl3b3JkKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFJvb3REaXJzKFxuICAgIGhvc3Q6IFBpY2s8dHMuQ29tcGlsZXJIb3N0LCAnZ2V0Q3VycmVudERpcmVjdG9yeSd8J2dldENhbm9uaWNhbEZpbGVOYW1lJz4sXG4gICAgb3B0aW9uczogdHMuQ29tcGlsZXJPcHRpb25zKTogQWJzb2x1dGVGc1BhdGhbXSB7XG4gIGNvbnN0IHJvb3REaXJzOiBzdHJpbmdbXSA9IFtdO1xuICBjb25zdCBjd2QgPSBob3N0LmdldEN1cnJlbnREaXJlY3RvcnkoKTtcbiAgY29uc3QgZnMgPSBnZXRGaWxlU3lzdGVtKCk7XG4gIGlmIChvcHRpb25zLnJvb3REaXJzICE9PSB1bmRlZmluZWQpIHtcbiAgICByb290RGlycy5wdXNoKC4uLm9wdGlvbnMucm9vdERpcnMpO1xuICB9IGVsc2UgaWYgKG9wdGlvbnMucm9vdERpciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcm9vdERpcnMucHVzaChvcHRpb25zLnJvb3REaXIpO1xuICB9IGVsc2Uge1xuICAgIHJvb3REaXJzLnB1c2goY3dkKTtcbiAgfVxuXG4gIC8vIEluIFdpbmRvd3MgdGhlIGFib3ZlIG1pZ2h0IG5vdCBhbHdheXMgcmV0dXJuIHBvc2l4IHNlcGFyYXRlZCBwYXRoc1xuICAvLyBTZWU6XG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9NaWNyb3NvZnQvVHlwZVNjcmlwdC9ibG9iLzNmNzM1N2QzN2Y2NmM4NDJkNzBkODM1YmM5MjVlYzJhODczZWNmZWMvc3JjL2NvbXBpbGVyL3N5cy50cyNMNjUwXG4gIC8vIEFsc28gY29tcGlsZXIgb3B0aW9ucyBtaWdodCBiZSBzZXQgdmlhIGFuIEFQSSB3aGljaCBkb2Vzbid0IG5vcm1hbGl6ZSBwYXRoc1xuICByZXR1cm4gcm9vdERpcnMubWFwKHJvb3REaXIgPT4gZnMucmVzb2x2ZShjd2QsIGhvc3QuZ2V0Q2Fub25pY2FsRmlsZU5hbWUocm9vdERpcikpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5vZGVEZWJ1Z0luZm8obm9kZTogdHMuTm9kZSk6IHN0cmluZyB7XG4gIGNvbnN0IHNmID0gZ2V0U291cmNlRmlsZShub2RlKTtcbiAgY29uc3Qge2xpbmUsIGNoYXJhY3Rlcn0gPSB0cy5nZXRMaW5lQW5kQ2hhcmFjdGVyT2ZQb3NpdGlvbihzZiwgbm9kZS5wb3MpO1xuICByZXR1cm4gYFske3NmLmZpbGVOYW1lfTogJHt0cy5TeW50YXhLaW5kW25vZGUua2luZF19IEAgJHtsaW5lfToke2NoYXJhY3Rlcn1dYDtcbn1cblxuLyoqXG4gKiBSZXNvbHZlIHRoZSBzcGVjaWZpZWQgYG1vZHVsZU5hbWVgIHVzaW5nIHRoZSBnaXZlbiBgY29tcGlsZXJPcHRpb25zYCBhbmQgYGNvbXBpbGVySG9zdGAuXG4gKlxuICogVGhpcyBoZWxwZXIgd2lsbCBhdHRlbXB0IHRvIHVzZSB0aGUgYENvbXBpbGVySG9zdC5yZXNvbHZlTW9kdWxlTmFtZXMoKWAgbWV0aG9kIGlmIGF2YWlsYWJsZS5cbiAqIE90aGVyd2lzZSBpdCB3aWxsIGZhbGxiYWNrIG9uIHRoZSBgdHMuUmVzb2x2ZU1vZHVsZU5hbWUoKWAgZnVuY3Rpb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNvbHZlTW9kdWxlTmFtZShcbiAgICBtb2R1bGVOYW1lOiBzdHJpbmcsIGNvbnRhaW5pbmdGaWxlOiBzdHJpbmcsIGNvbXBpbGVyT3B0aW9uczogdHMuQ29tcGlsZXJPcHRpb25zLFxuICAgIGNvbXBpbGVySG9zdDogdHMuTW9kdWxlUmVzb2x1dGlvbkhvc3QmUGljazx0cy5Db21waWxlckhvc3QsICdyZXNvbHZlTW9kdWxlTmFtZXMnPixcbiAgICBtb2R1bGVSZXNvbHV0aW9uQ2FjaGU6IHRzLk1vZHVsZVJlc29sdXRpb25DYWNoZXxudWxsKTogdHMuUmVzb2x2ZWRNb2R1bGV8dW5kZWZpbmVkIHtcbiAgaWYgKGNvbXBpbGVySG9zdC5yZXNvbHZlTW9kdWxlTmFtZXMpIHtcbiAgICByZXR1cm4gY29tcGlsZXJIb3N0LnJlc29sdmVNb2R1bGVOYW1lcyhcbiAgICAgICAgW21vZHVsZU5hbWVdLCBjb250YWluaW5nRmlsZSxcbiAgICAgICAgdW5kZWZpbmVkLCAgLy8gcmV1c2VkTmFtZXNcbiAgICAgICAgdW5kZWZpbmVkLCAgLy8gcmVkaXJlY3RlZFJlZmVyZW5jZVxuICAgICAgICBjb21waWxlck9wdGlvbnMpWzBdO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiB0c1xuICAgICAgICAucmVzb2x2ZU1vZHVsZU5hbWUoXG4gICAgICAgICAgICBtb2R1bGVOYW1lLCBjb250YWluaW5nRmlsZSwgY29tcGlsZXJPcHRpb25zLCBjb21waWxlckhvc3QsXG4gICAgICAgICAgICBtb2R1bGVSZXNvbHV0aW9uQ2FjaGUgIT09IG51bGwgPyBtb2R1bGVSZXNvbHV0aW9uQ2FjaGUgOiB1bmRlZmluZWQpXG4gICAgICAgIC5yZXNvbHZlZE1vZHVsZTtcbiAgfVxufVxuXG4vKiogUmV0dXJucyB0cnVlIGlmIHRoZSBub2RlIGlzIGFuIGFzc2lnbm1lbnQgZXhwcmVzc2lvbi4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0Fzc2lnbm1lbnQobm9kZTogdHMuTm9kZSk6IG5vZGUgaXMgdHMuQmluYXJ5RXhwcmVzc2lvbiB7XG4gIHJldHVybiB0cy5pc0JpbmFyeUV4cHJlc3Npb24obm9kZSkgJiYgbm9kZS5vcGVyYXRvclRva2VuLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuRXF1YWxzVG9rZW47XG59XG5cbi8qKlxuICogQXNzZXJ0cyB0aGF0IHRoZSBrZXlzIGBLYCBmb3JtIGEgc3Vic2V0IG9mIHRoZSBrZXlzIG9mIGBUYC5cbiAqL1xuZXhwb3J0IHR5cGUgU3Vic2V0T2ZLZXlzPFQsIEsgZXh0ZW5kcyBrZXlvZiBUPiA9IEs7XG5cbi8qKlxuICogUmVwcmVzZW50cyB0aGUgdHlwZSBgVGAsIHdpdGggYSB0cmFuc2Zvcm1hdGlvbiBhcHBsaWVkIHRoYXQgdHVybnMgYWxsIG1ldGhvZHMgKGV2ZW4gb3B0aW9uYWxcbiAqIG9uZXMpIGludG8gcmVxdWlyZWQgZmllbGRzICh3aGljaCBtYXkgYmUgYHVuZGVmaW5lZGAsIGlmIHRoZSBtZXRob2Qgd2FzIG9wdGlvbmFsKS5cbiAqL1xuZXhwb3J0IHR5cGUgUmVxdWlyZWREZWxlZ2F0aW9uczxUPiA9IHtcbiAgW00gaW4ga2V5b2YgUmVxdWlyZWQ8VD5dOiBUW01dO1xufTtcblxuLyoqXG4gKiBTb3VyY2UgZmlsZXMgbWF5IGJlY29tZSByZWRpcmVjdHMgdG8gb3RoZXIgc291cmNlIGZpbGVzIHdoZW4gdGhlaXIgcGFja2FnZSBuYW1lIGFuZCB2ZXJzaW9uIGFyZVxuICogaWRlbnRpY2FsLiBUeXBlU2NyaXB0IGNyZWF0ZXMgYSBwcm94eSBzb3VyY2UgZmlsZSBmb3Igc3VjaCBzb3VyY2UgZmlsZXMgd2hpY2ggaGFzIGFuIGludGVybmFsXG4gKiBgcmVkaXJlY3RJbmZvYCBwcm9wZXJ0eSB0aGF0IHJlZmVycyB0byB0aGUgb3JpZ2luYWwgc291cmNlIGZpbGUuXG4gKi9cbmludGVyZmFjZSBSZWRpcmVjdGVkU291cmNlRmlsZSBleHRlbmRzIHRzLlNvdXJjZUZpbGUge1xuICByZWRpcmVjdEluZm8/OiB7dW5yZWRpcmVjdGVkOiB0cy5Tb3VyY2VGaWxlO307XG59XG5cbi8qKlxuICogT2J0YWlucyB0aGUgbm9uLXJlZGlyZWN0ZWQgc291cmNlIGZpbGUgZm9yIGBzZmAuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0b1VucmVkaXJlY3RlZFNvdXJjZUZpbGUoc2Y6IHRzLlNvdXJjZUZpbGUpOiB0cy5Tb3VyY2VGaWxlIHtcbiAgY29uc3QgcmVkaXJlY3RJbmZvID0gKHNmIGFzIFJlZGlyZWN0ZWRTb3VyY2VGaWxlKS5yZWRpcmVjdEluZm87XG4gIGlmIChyZWRpcmVjdEluZm8gPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiBzZjtcbiAgfVxuICByZXR1cm4gcmVkaXJlY3RJbmZvLnVucmVkaXJlY3RlZDtcbn1cbiJdfQ==