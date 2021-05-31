"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportManager = void 0;
const path_1 = require("path");
const ts = require("typescript");
/** Checks whether an analyzed import has the given import flag set. */
const hasFlag = (data, flag) => (data.state & flag) !== 0;
/**
 * Import manager that can be used to add or remove TypeScript imports within source
 * files. The manager ensures that multiple transformations are applied properly
 * without shifted offsets and that existing imports are re-used.
 */
class ImportManager {
    constructor(_fileSystem, _printer) {
        this._fileSystem = _fileSystem;
        this._printer = _printer;
        /** Map of source-files and their previously used identifier names. */
        this._usedIdentifierNames = new Map();
        /** Map of source files and their analyzed imports. */
        this._importCache = new Map();
    }
    /**
     * Analyzes the import of the specified source file if needed. In order to perform
     * modifications to imports of a source file, we store all imports in memory and
     * update the source file once all changes have been made. This is essential to
     * ensure that we can re-use newly added imports and not break file offsets.
     */
    _analyzeImportsIfNeeded(sourceFile) {
        if (this._importCache.has(sourceFile)) {
            return this._importCache.get(sourceFile);
        }
        const result = [];
        for (let node of sourceFile.statements) {
            if (!ts.isImportDeclaration(node) || !ts.isStringLiteral(node.moduleSpecifier)) {
                continue;
            }
            const moduleName = node.moduleSpecifier.text;
            // Handles side-effect imports which do neither have a name or
            // specifiers. e.g. `import "my-package";`
            if (!node.importClause) {
                result.push({ moduleName, node, state: 0 /* UNMODIFIED */ });
                continue;
            }
            // Handles imports resolving to default exports of a module.
            // e.g. `import moment from "moment";`
            if (!node.importClause.namedBindings) {
                result.push({ moduleName, node, name: node.importClause.name, state: 0 /* UNMODIFIED */ });
                continue;
            }
            // Handles imports with individual symbol specifiers.
            // e.g. `import {A, B, C} from "my-module";`
            if (ts.isNamedImports(node.importClause.namedBindings)) {
                result.push({
                    moduleName,
                    node,
                    specifiers: node.importClause.namedBindings.elements.map(el => ({ name: el.name, propertyName: el.propertyName })),
                    state: 0 /* UNMODIFIED */,
                });
            }
            else {
                // Handles namespaced imports. e.g. `import * as core from "my-pkg";`
                result.push({
                    moduleName,
                    node,
                    name: node.importClause.namedBindings.name,
                    namespace: true,
                    state: 0 /* UNMODIFIED */,
                });
            }
        }
        this._importCache.set(sourceFile, result);
        return result;
    }
    /**
     * Checks whether the given specifier, which can be relative to the base path,
     * matches the passed module name.
     */
    _isModuleSpecifierMatching(basePath, specifier, moduleName) {
        return specifier.startsWith('.') ?
            path_1.resolve(basePath, specifier) === path_1.resolve(basePath, moduleName) :
            specifier === moduleName;
    }
    /** Deletes a given named binding import from the specified source file. */
    deleteNamedBindingImport(sourceFile, symbolName, moduleName) {
        const sourceDir = path_1.dirname(sourceFile.fileName);
        const fileImports = this._analyzeImportsIfNeeded(sourceFile);
        for (let importData of fileImports) {
            if (!this._isModuleSpecifierMatching(sourceDir, importData.moduleName, moduleName) ||
                !importData.specifiers) {
                continue;
            }
            const specifierIndex = importData.specifiers.findIndex(d => (d.propertyName || d.name).text === symbolName);
            if (specifierIndex !== -1) {
                importData.specifiers.splice(specifierIndex, 1);
                // if the import does no longer contain any specifiers after the removal of the
                // given symbol, we can just mark the whole import for deletion. Otherwise, we mark
                // it as modified so that it will be re-printed.
                if (importData.specifiers.length === 0) {
                    importData.state |= 8 /* DELETED */;
                }
                else {
                    importData.state |= 2 /* MODIFIED */;
                }
            }
        }
    }
    /** Deletes the import that matches the given import declaration if found. */
    deleteImportByDeclaration(declaration) {
        const fileImports = this._analyzeImportsIfNeeded(declaration.getSourceFile());
        for (let importData of fileImports) {
            if (importData.node === declaration) {
                importData.state |= 8 /* DELETED */;
            }
        }
    }
    /**
     * Adds an import to the given source file and returns the TypeScript expression that
     * can be used to access the newly imported symbol.
     *
     * Whenever an import is added to a source file, it's recommended that the returned
     * expression is used to reference th symbol. This is necessary because the symbol
     * could be aliased if it would collide with existing imports in source file.
     *
     * @param sourceFile Source file to which the import should be added.
     * @param symbolName Name of the symbol that should be imported. Can be null if
     *    the default export is requested.
     * @param moduleName Name of the module of which the symbol should be imported.
     * @param typeImport Whether the symbol is a type.
     * @param ignoreIdentifierCollisions List of identifiers which can be ignored when
     *    the import manager checks for import collisions.
     */
    addImportToSourceFile(sourceFile, symbolName, moduleName, typeImport = false, ignoreIdentifierCollisions = []) {
        const sourceDir = path_1.dirname(sourceFile.fileName);
        const fileImports = this._analyzeImportsIfNeeded(sourceFile);
        let existingImport = null;
        for (let importData of fileImports) {
            if (!this._isModuleSpecifierMatching(sourceDir, importData.moduleName, moduleName)) {
                continue;
            }
            // If no symbol name has been specified, the default import is requested. In that
            // case we search for non-namespace and non-specifier imports.
            if (!symbolName && !importData.namespace && !importData.specifiers) {
                return ts.createIdentifier(importData.name.text);
            }
            // In case a "Type" symbol is imported, we can't use namespace imports
            // because these only export symbols available at runtime (no types)
            if (importData.namespace && !typeImport) {
                return ts.createPropertyAccess(ts.createIdentifier(importData.name.text), ts.createIdentifier(symbolName || 'default'));
            }
            else if (importData.specifiers && symbolName) {
                const existingSpecifier = importData.specifiers.find(s => s.propertyName ? s.propertyName.text === symbolName : s.name.text === symbolName);
                if (existingSpecifier) {
                    return ts.createIdentifier(existingSpecifier.name.text);
                }
                // In case the symbol could not be found in an existing import, we
                // keep track of the import declaration as it can be updated to include
                // the specified symbol name without having to create a new import.
                existingImport = importData;
            }
        }
        // If there is an existing import that matches the specified module, we
        // just update the import specifiers to also import the requested symbol.
        if (existingImport) {
            const propertyIdentifier = ts.createIdentifier(symbolName);
            const generatedUniqueIdentifier = this._getUniqueIdentifier(sourceFile, symbolName, ignoreIdentifierCollisions);
            const needsGeneratedUniqueName = generatedUniqueIdentifier.text !== symbolName;
            const importName = needsGeneratedUniqueName ? generatedUniqueIdentifier : propertyIdentifier;
            existingImport.specifiers.push({
                name: importName,
                propertyName: needsGeneratedUniqueName ? propertyIdentifier : undefined,
            });
            existingImport.state |= 2 /* MODIFIED */;
            if (hasFlag(existingImport, 8 /* DELETED */)) {
                // unset the deleted flag if the import is pending deletion, but
                // can now be used for the new imported symbol.
                existingImport.state &= ~8 /* DELETED */;
            }
            return importName;
        }
        let identifier = null;
        let newImport = null;
        if (symbolName) {
            const propertyIdentifier = ts.createIdentifier(symbolName);
            const generatedUniqueIdentifier = this._getUniqueIdentifier(sourceFile, symbolName, ignoreIdentifierCollisions);
            const needsGeneratedUniqueName = generatedUniqueIdentifier.text !== symbolName;
            identifier = needsGeneratedUniqueName ? generatedUniqueIdentifier : propertyIdentifier;
            const newImportDecl = ts.createImportDeclaration(undefined, undefined, ts.createImportClause(undefined, ts.createNamedImports([])), ts.createStringLiteral(moduleName));
            newImport = {
                moduleName,
                node: newImportDecl,
                specifiers: [{
                        propertyName: needsGeneratedUniqueName ? propertyIdentifier : undefined,
                        name: identifier
                    }],
                state: 4 /* ADDED */,
            };
        }
        else {
            identifier =
                this._getUniqueIdentifier(sourceFile, 'defaultExport', ignoreIdentifierCollisions);
            const newImportDecl = ts.createImportDeclaration(undefined, undefined, ts.createImportClause(identifier, undefined), ts.createStringLiteral(moduleName));
            newImport = {
                moduleName,
                node: newImportDecl,
                name: identifier,
                state: 4 /* ADDED */,
            };
        }
        fileImports.push(newImport);
        return identifier;
    }
    /**
     * Applies the recorded changes in the update recorders of the corresponding source files.
     * The changes are applied separately after all changes have been recorded because otherwise
     * file offsets will change and the source files would need to be re-parsed after each change.
     */
    recordChanges() {
        this._importCache.forEach((fileImports, sourceFile) => {
            const recorder = this._fileSystem.edit(this._fileSystem.resolve(sourceFile.fileName));
            const lastUnmodifiedImport = fileImports.reverse().find(i => i.state === 0 /* UNMODIFIED */);
            const importStartIndex = lastUnmodifiedImport ? this._getEndPositionOfNode(lastUnmodifiedImport.node) : 0;
            fileImports.forEach(importData => {
                if (importData.state === 0 /* UNMODIFIED */) {
                    return;
                }
                if (hasFlag(importData, 8 /* DELETED */)) {
                    // Imports which do not exist in source file, can be just skipped as
                    // we do not need any replacement to delete the import.
                    if (!hasFlag(importData, 4 /* ADDED */)) {
                        recorder.remove(importData.node.getFullStart(), importData.node.getFullWidth());
                    }
                    return;
                }
                if (importData.specifiers) {
                    const namedBindings = importData.node.importClause.namedBindings;
                    const importSpecifiers = importData.specifiers.map(s => ts.createImportSpecifier(s.propertyName, s.name));
                    const updatedBindings = ts.updateNamedImports(namedBindings, importSpecifiers);
                    // In case an import has been added newly, we need to print the whole import
                    // declaration and insert it at the import start index. Otherwise, we just
                    // update the named bindings to not re-print the whole import (which could
                    // cause unnecessary formatting changes)
                    if (hasFlag(importData, 4 /* ADDED */)) {
                        const updatedImport = ts.updateImportDeclaration(importData.node, undefined, undefined, ts.createImportClause(undefined, updatedBindings), ts.createStringLiteral(importData.moduleName));
                        const newImportText = this._printer.printNode(ts.EmitHint.Unspecified, updatedImport, sourceFile);
                        recorder.insertLeft(importStartIndex, importStartIndex === 0 ? `${newImportText}\n` : `\n${newImportText}`);
                        return;
                    }
                    else if (hasFlag(importData, 2 /* MODIFIED */)) {
                        const newNamedBindingsText = this._printer.printNode(ts.EmitHint.Unspecified, updatedBindings, sourceFile);
                        recorder.remove(namedBindings.getStart(), namedBindings.getWidth());
                        recorder.insertRight(namedBindings.getStart(), newNamedBindingsText);
                        return;
                    }
                }
                else if (hasFlag(importData, 4 /* ADDED */)) {
                    const newImportText = this._printer.printNode(ts.EmitHint.Unspecified, importData.node, sourceFile);
                    recorder.insertLeft(importStartIndex, importStartIndex === 0 ? `${newImportText}\n` : `\n${newImportText}`);
                    return;
                }
                // we should never hit this, but we rather want to print a custom exception
                // instead of just skipping imports silently.
                throw Error('Unexpected import modification.');
            });
        });
    }
    /**
     * Corrects the line and character position of a given node. Since nodes of
     * source files are immutable and we sometimes make changes to the containing
     * source file, the node position might shift (e.g. if we add a new import before).
     *
     * This method can be used to retrieve a corrected position of the given node. This
     * is helpful when printing out error messages which should reflect the new state of
     * source files.
     */
    correctNodePosition(node, offset, position) {
        const sourceFile = node.getSourceFile();
        if (!this._importCache.has(sourceFile)) {
            return position;
        }
        const newPosition = Object.assign({}, position);
        const fileImports = this._importCache.get(sourceFile);
        for (let importData of fileImports) {
            const fullEnd = importData.node.getFullStart() + importData.node.getFullWidth();
            // Subtract or add lines based on whether an import has been deleted or removed
            // before the actual node offset.
            if (offset > fullEnd && hasFlag(importData, 8 /* DELETED */)) {
                newPosition.line--;
            }
            else if (offset > fullEnd && hasFlag(importData, 4 /* ADDED */)) {
                newPosition.line++;
            }
        }
        return newPosition;
    }
    /**
     * Returns an unique identifier name for the specified symbol name.
     * @param sourceFile Source file to check for identifier collisions.
     * @param symbolName Name of the symbol for which we want to generate an unique name.
     * @param ignoreIdentifierCollisions List of identifiers which should be ignored when
     *    checking for identifier collisions in the given source file.
     */
    _getUniqueIdentifier(sourceFile, symbolName, ignoreIdentifierCollisions) {
        if (this._isUniqueIdentifierName(sourceFile, symbolName, ignoreIdentifierCollisions)) {
            this._recordUsedIdentifier(sourceFile, symbolName);
            return ts.createIdentifier(symbolName);
        }
        let name = null;
        let counter = 1;
        do {
            name = `${symbolName}_${counter++}`;
        } while (!this._isUniqueIdentifierName(sourceFile, name, ignoreIdentifierCollisions));
        this._recordUsedIdentifier(sourceFile, name);
        return ts.createIdentifier(name);
    }
    /**
     * Checks whether the specified identifier name is used within the given source file.
     * @param sourceFile Source file to check for identifier collisions.
     * @param name Name of the identifier which is checked for its uniqueness.
     * @param ignoreIdentifierCollisions List of identifiers which should be ignored when
     *    checking for identifier collisions in the given source file.
     */
    _isUniqueIdentifierName(sourceFile, name, ignoreIdentifierCollisions) {
        if (this._usedIdentifierNames.has(sourceFile) &&
            this._usedIdentifierNames.get(sourceFile).indexOf(name) !== -1) {
            return false;
        }
        // Walk through the source file and search for an identifier matching
        // the given name. In that case, it's not guaranteed that this name
        // is unique in the given declaration scope and we just return false.
        const nodeQueue = [sourceFile];
        while (nodeQueue.length) {
            const node = nodeQueue.shift();
            if (ts.isIdentifier(node) && node.text === name &&
                !ignoreIdentifierCollisions.includes(node)) {
                return false;
            }
            nodeQueue.push(...node.getChildren());
        }
        return true;
    }
    /**
     * Records that the given identifier is used within the specified source file. This
     * is necessary since we do not apply changes to source files per change, but still
     * want to avoid conflicts with newly imported symbols.
     */
    _recordUsedIdentifier(sourceFile, identifierName) {
        this._usedIdentifierNames.set(sourceFile, (this._usedIdentifierNames.get(sourceFile) || []).concat(identifierName));
    }
    /**
     * Determines the full end of a given node. By default the end position of a node is
     * before all trailing comments. This could mean that generated imports shift comments.
     */
    _getEndPositionOfNode(node) {
        const nodeEndPos = node.getEnd();
        const commentRanges = ts.getTrailingCommentRanges(node.getSourceFile().text, nodeEndPos);
        if (!commentRanges || !commentRanges.length) {
            return nodeEndPos;
        }
        return commentRanges[commentRanges.length - 1].end;
    }
}
exports.ImportManager = ImportManager;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1wb3J0LW1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvc2NoZW1hdGljcy9uZy11cGRhdGUvbWlncmF0aW9ucy9oYW1tZXItZ2VzdHVyZXMtdjkvaW1wb3J0LW1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBR0gsK0JBQXNDO0FBQ3RDLGlDQUFpQztBQTRCakMsdUVBQXVFO0FBQ3ZFLE1BQU0sT0FBTyxHQUFHLENBQUMsSUFBb0IsRUFBRSxJQUFpQixFQUFFLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBRXZGOzs7O0dBSUc7QUFDSCxNQUFhLGFBQWE7SUFPeEIsWUFDWSxXQUF1QixFQUN2QixRQUFvQjtRQURwQixnQkFBVyxHQUFYLFdBQVcsQ0FBWTtRQUN2QixhQUFRLEdBQVIsUUFBUSxDQUFZO1FBUmhDLHNFQUFzRTtRQUM5RCx5QkFBb0IsR0FBRyxJQUFJLEdBQUcsRUFBMkIsQ0FBQztRQUVsRSxzREFBc0Q7UUFDOUMsaUJBQVksR0FBRyxJQUFJLEdBQUcsRUFBbUMsQ0FBQztJQUkvQixDQUFDO0lBRXBDOzs7OztPQUtHO0lBQ0ssdUJBQXVCLENBQUMsVUFBeUI7UUFDdkQsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsRUFBRTtZQUNyQyxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBRSxDQUFDO1NBQzNDO1FBRUQsTUFBTSxNQUFNLEdBQXFCLEVBQUUsQ0FBQztRQUNwQyxLQUFLLElBQUksSUFBSSxJQUFJLFVBQVUsQ0FBQyxVQUFVLEVBQUU7WUFDdEMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxlQUFlLENB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UUFDekYsSUFBSSxDQUFDLGFBQWEsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUU7WUFDM0MsT0FBTyxVQUFVLENBQUM7U0FDbkI7UUFDRCxPQUFPLGFBQWEsQ0FBQyxhQUFhLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBRSxDQUFDLEdBQUcsQ0FBQztJQUN0RCxDQUFDO0NBQ0Y7QUFoYUQsc0NBZ2FDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RmlsZVN5c3RlbX0gZnJvbSAnQGFuZ3VsYXIvY2RrL3NjaGVtYXRpY3MnO1xuaW1wb3J0IHtkaXJuYW1lLCByZXNvbHZlfSBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuXG4vLyB0c2xpbnQ6ZGlzYWJsZTpuby1iaXR3aXNlXG5cbi8qKiBFbnVtIGRlc2NyaWJpbmcgdGhlIHBvc3NpYmxlIHN0YXRlcyBvZiBhbiBhbmFseXplZCBpbXBvcnQuICovXG5jb25zdCBlbnVtIEltcG9ydFN0YXRlIHtcbiAgVU5NT0RJRklFRCA9IDBiMCxcbiAgTU9ESUZJRUQgPSAwYjEwLFxuICBBRERFRCA9IDBiMTAwLFxuICBERUxFVEVEID0gMGIxMDAwLFxufVxuXG4vKiogSW50ZXJmYWNlIGRlc2NyaWJpbmcgYW4gaW1wb3J0IHNwZWNpZmllci4gKi9cbmludGVyZmFjZSBJbXBvcnRTcGVjaWZpZXIge1xuICBuYW1lOiB0cy5JZGVudGlmaWVyO1xuICBwcm9wZXJ0eU5hbWU/OiB0cy5JZGVudGlmaWVyO1xufVxuXG4vKiogSW50ZXJmYWNlIGRlc2NyaWJpbmcgYW4gYW5hbHl6ZWQgaW1wb3J0LiAqL1xuaW50ZXJmYWNlIEFuYWx5emVkSW1wb3J0IHtcbiAgbm9kZTogdHMuSW1wb3J0RGVjbGFyYXRpb247XG4gIG1vZHVsZU5hbWU6IHN0cmluZztcbiAgbmFtZT86IHRzLklkZW50aWZpZXI7XG4gIHNwZWNpZmllcnM/OiBJbXBvcnRTcGVjaWZpZXJbXTtcbiAgbmFtZXNwYWNlPzogYm9vbGVhbjtcbiAgc3RhdGU6IEltcG9ydFN0YXRlO1xufVxuXG4vKiogQ2hlY2tzIHdoZXRoZXIgYW4gYW5hbHl6ZWQgaW1wb3J0IGhhcyB0aGUgZ2l2ZW4gaW1wb3J0IGZsYWcgc2V0LiAqL1xuY29uc3QgaGFzRmxhZyA9IChkYXRhOiBBbmFseXplZEltcG9ydCwgZmxhZzogSW1wb3J0U3RhdGUpID0+IChkYXRhLnN0YXRlICYgZmxhZykgIT09IDA7XG5cbi8qKlxuICogSW1wb3J0IG1hbmFnZXIgdGhhdCBjYW4gYmUgdXNlZCB0byBhZGQgb3IgcmVtb3ZlIFR5cGVTY3JpcHQgaW1wb3J0cyB3aXRoaW4gc291cmNlXG4gKiBmaWxlcy4gVGhlIG1hbmFnZXIgZW5zdXJlcyB0aGF0IG11bHRpcGxlIHRyYW5zZm9ybWF0aW9ucyBhcmUgYXBwbGllZCBwcm9wZXJseVxuICogd2l0aG91dCBzaGlmdGVkIG9mZnNldHMgYW5kIHRoYXQgZXhpc3RpbmcgaW1wb3J0cyBhcmUgcmUtdXNlZC5cbiAqL1xuZXhwb3J0IGNsYXNzIEltcG9ydE1hbmFnZXIge1xuICAvKiogTWFwIG9mIHNvdXJjZS1maWxlcyBhbmQgdGhlaXIgcHJldmlvdXNseSB1c2VkIGlkZW50aWZpZXIgbmFtZXMuICovXG4gIHByaXZhdGUgX3VzZWRJZGVudGlmaWVyTmFtZXMgPSBuZXcgTWFwPHRzLlNvdXJjZUZpbGUsIHN0cmluZ1tdPigpO1xuXG4gIC8qKiBNYXAgb2Ygc291cmNlIGZpbGVzIGFuZCB0aGVpciBhbmFseXplZCBpbXBvcnRzLiAqL1xuICBwcml2YXRlIF9pbXBvcnRDYWNoZSA9IG5ldyBNYXA8dHMuU291cmNlRmlsZSwgQW5hbHl6ZWRJbXBvcnRbXT4oKTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgX2ZpbGVTeXN0ZW06IEZpbGVTeXN0ZW0sXG4gICAgICBwcml2YXRlIF9wcmludGVyOiB0cy5QcmludGVyKSB7fVxuXG4gIC8qKlxuICAgKiBBbmFseXplcyB0aGUgaW1wb3J0IG9mIHRoZSBzcGVjaWZpZWQgc291cmNlIGZpbGUgaWYgbmVlZGVkLiBJbiBvcmRlciB0byBwZXJmb3JtXG4gICAqIG1vZGlmaWNhdGlvbnMgdG8gaW1wb3J0cyBvZiBhIHNvdXJjZSBmaWxlLCB3ZSBzdG9yZSBhbGwgaW1wb3J0cyBpbiBtZW1vcnkgYW5kXG4gICAqIHVwZGF0ZSB0aGUgc291cmNlIGZpbGUgb25jZSBhbGwgY2hhbmdlcyBoYXZlIGJlZW4gbWFkZS4gVGhpcyBpcyBlc3NlbnRpYWwgdG9cbiAgICogZW5zdXJlIHRoYXQgd2UgY2FuIHJlLXVzZSBuZXdseSBhZGRlZCBpbXBvcnRzIGFuZCBub3QgYnJlYWsgZmlsZSBvZmZzZXRzLlxuICAgKi9cbiAgcHJpdmF0ZSBfYW5hbHl6ZUltcG9ydHNJZk5lZWRlZChzb3VyY2VGaWxlOiB0cy5Tb3VyY2VGaWxlKTogQW5hbHl6ZWRJbXBvcnRbXSB7XG4gICAgaWYgKHRoaXMuX2ltcG9ydENhY2hlLmhhcyhzb3VyY2VGaWxlKSkge1xuICAgICAgcmV0dXJuIHRoaXMuX2ltcG9ydENhY2hlLmdldChzb3VyY2VGaWxlKSE7XG4gICAgfVxuXG4gICAgY29uc3QgcmVzdWx0OiBBbmFseXplZEltcG9ydFtdID0gW107XG4gICAgZm9yIChsZXQgbm9kZSBvZiBzb3VyY2VGaWxlLnN0YXRlbWVudHMpIHtcbiAgICAgIGlmICghdHMuaXNJbXBvcnREZWNsYXJhdGlvbihub2RlKSB8fCAhdHMuaXNTdHJpbmdMaXRlcmFsKG5vZGUubW9kdWxlU3BlY2lmaWVyKSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgbW9kdWxlTmFtZSA9IG5vZGUubW9kdWxlU3BlY2lmaWVyLnRleHQ7XG5cbiAgICAgIC8vIEhhbmRsZXMgc2lkZS1lZmZlY3QgaW1wb3J0cyB3aGljaCBkbyBuZWl0aGVyIGhhdmUgYSBuYW1lIG9yXG4gICAgICAvLyBzcGVjaWZpZXJzLiBlLmcuIGBpbXBvcnQgXCJteS1wYWNrYWdlXCI7YFxuICAgICAgaWYgKCFub2RlLmltcG9ydENsYXVzZSkge1xuICAgICAgICByZXN1bHQucHVzaCh7bW9kdWxlTmFtZSwgbm9kZSwgc3RhdGU6IEltcG9ydFN0YXRlLlVOTU9ESUZJRUR9KTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIEhhbmRsZXMgaW1wb3J0cyByZXNvbHZpbmcgdG8gZGVmYXVsdCBleHBvcnRzIG9mIGEgbW9kdWxlLlxuICAgICAgLy8gZS5nLiBgaW1wb3J0IG1vbWVudCBmcm9tIFwibW9tZW50XCI7YFxuICAgICAgaWYgKCFub2RlLmltcG9ydENsYXVzZS5uYW1lZEJpbmRpbmdzKSB7XG4gICAgICAgIHJlc3VsdC5wdXNoKFxuICAgICAgICAgICAge21vZHVsZU5hbWUsIG5vZGUsIG5hbWU6IG5vZGUuaW1wb3J0Q2xhdXNlLm5hbWUsIHN0YXRlOiBJbXBvcnRTdGF0ZS5VTk1PRElGSUVEfSk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBIYW5kbGVzIGltcG9ydHMgd2l0aCBpbmRpdmlkdWFsIHN5bWJvbCBzcGVjaWZpZXJzLlxuICAgICAgLy8gZS5nLiBgaW1wb3J0IHtBLCBCLCBDfSBmcm9tIFwibXktbW9kdWxlXCI7YFxuICAgICAgaWYgKHRzLmlzTmFtZWRJbXBvcnRzKG5vZGUuaW1wb3J0Q2xhdXNlLm5hbWVkQmluZGluZ3MpKSB7XG4gICAgICAgIHJlc3VsdC5wdXNoKHtcbiAgICAgICAgICBtb2R1bGVOYW1lLFxuICAgICAgICAgIG5vZGUsXG4gICAgICAgICAgc3BlY2lmaWVyczogbm9kZS5pbXBvcnRDbGF1c2UubmFtZWRCaW5kaW5ncy5lbGVtZW50cy5tYXAoXG4gICAgICAgICAgICAgIGVsID0+ICh7bmFtZTogZWwubmFtZSwgcHJvcGVydHlOYW1lOiBlbC5wcm9wZXJ0eU5hbWV9KSksXG4gICAgICAgICAgc3RhdGU6IEltcG9ydFN0YXRlLlVOTU9ESUZJRUQsXG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gSGFuZGxlcyBuYW1lc3BhY2VkIGltcG9ydHMuIGUuZy4gYGltcG9ydCAqIGFzIGNvcmUgZnJvbSBcIm15LXBrZ1wiO2BcbiAgICAgICAgcmVzdWx0LnB1c2goe1xuICAgICAgICAgIG1vZHVsZU5hbWUsXG4gICAgICAgICAgbm9kZSxcbiAgICAgICAgICBuYW1lOiBub2RlLmltcG9ydENsYXVzZS5uYW1lZEJpbmRpbmdzLm5hbWUsXG4gICAgICAgICAgbmFtZXNwYWNlOiB0cnVlLFxuICAgICAgICAgIHN0YXRlOiBJbXBvcnRTdGF0ZS5VTk1PRElGSUVELFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5faW1wb3J0Q2FjaGUuc2V0KHNvdXJjZUZpbGUsIHJlc3VsdCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3Mgd2hldGhlciB0aGUgZ2l2ZW4gc3BlY2lmaWVyLCB3aGljaCBjYW4gYmUgcmVsYXRpdmUgdG8gdGhlIGJhc2UgcGF0aCxcbiAgICogbWF0Y2hlcyB0aGUgcGFzc2VkIG1vZHVsZSBuYW1lLlxuICAgKi9cbiAgcHJpdmF0ZSBfaXNNb2R1bGVTcGVjaWZpZXJNYXRjaGluZyhiYXNlUGF0aDogc3RyaW5nLCBzcGVjaWZpZXI6IHN0cmluZywgbW9kdWxlTmFtZTogc3RyaW5nKTpcbiAgICAgIGJvb2xlYW4ge1xuICAgIHJldHVybiBzcGVjaWZpZXIuc3RhcnRzV2l0aCgnLicpID9cbiAgICAgICAgcmVzb2x2ZShiYXNlUGF0aCwgc3BlY2lmaWVyKSA9PT0gcmVzb2x2ZShiYXNlUGF0aCwgbW9kdWxlTmFtZSkgOlxuICAgICAgICBzcGVjaWZpZXIgPT09IG1vZHVsZU5hbWU7XG4gIH1cblxuICAvKiogRGVsZXRlcyBhIGdpdmVuIG5hbWVkIGJpbmRpbmcgaW1wb3J0IGZyb20gdGhlIHNwZWNpZmllZCBzb3VyY2UgZmlsZS4gKi9cbiAgZGVsZXRlTmFtZWRCaW5kaW5nSW1wb3J0KHNvdXJjZUZpbGU6IHRzLlNvdXJjZUZpbGUsIHN5bWJvbE5hbWU6IHN0cmluZywgbW9kdWxlTmFtZTogc3RyaW5nKSB7XG4gICAgY29uc3Qgc291cmNlRGlyID0gZGlybmFtZShzb3VyY2VGaWxlLmZpbGVOYW1lKTtcbiAgICBjb25zdCBmaWxlSW1wb3J0cyA9IHRoaXMuX2FuYWx5emVJbXBvcnRzSWZOZWVkZWQoc291cmNlRmlsZSk7XG5cbiAgICBmb3IgKGxldCBpbXBvcnREYXRhIG9mIGZpbGVJbXBvcnRzKSB7XG4gICAgICBpZiAoIXRoaXMuX2lzTW9kdWxlU3BlY2lmaWVyTWF0Y2hpbmcoc291cmNlRGlyLCBpbXBvcnREYXRhLm1vZHVsZU5hbWUsIG1vZHVsZU5hbWUpIHx8XG4gICAgICAgICAgIWltcG9ydERhdGEuc3BlY2lmaWVycykge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgY29uc3Qgc3BlY2lmaWVySW5kZXggPVxuICAgICAgICAgIGltcG9ydERhdGEuc3BlY2lmaWVycy5maW5kSW5kZXgoZCA9PiAoZC5wcm9wZXJ0eU5hbWUgfHwgZC5uYW1lKS50ZXh0ID09PSBzeW1ib2xOYW1lKTtcbiAgICAgIGlmIChzcGVjaWZpZXJJbmRleCAhPT0gLTEpIHtcbiAgICAgICAgaW1wb3J0RGF0YS5zcGVjaWZpZXJzLnNwbGljZShzcGVjaWZpZXJJbmRleCwgMSk7XG4gICAgICAgIC8vIGlmIHRoZSBpbXBvcnQgZG9lcyBubyBsb25nZXIgY29udGFpbiBhbnkgc3BlY2lmaWVycyBhZnRlciB0aGUgcmVtb3ZhbCBvZiB0aGVcbiAgICAgICAgLy8gZ2l2ZW4gc3ltYm9sLCB3ZSBjYW4ganVzdCBtYXJrIHRoZSB3aG9sZSBpbXBvcnQgZm9yIGRlbGV0aW9uLiBPdGhlcndpc2UsIHdlIG1hcmtcbiAgICAgICAgLy8gaXQgYXMgbW9kaWZpZWQgc28gdGhhdCBpdCB3aWxsIGJlIHJlLXByaW50ZWQuXG4gICAgICAgIGlmIChpbXBvcnREYXRhLnNwZWNpZmllcnMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgaW1wb3J0RGF0YS5zdGF0ZSB8PSBJbXBvcnRTdGF0ZS5ERUxFVEVEO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGltcG9ydERhdGEuc3RhdGUgfD0gSW1wb3J0U3RhdGUuTU9ESUZJRUQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKiogRGVsZXRlcyB0aGUgaW1wb3J0IHRoYXQgbWF0Y2hlcyB0aGUgZ2l2ZW4gaW1wb3J0IGRlY2xhcmF0aW9uIGlmIGZvdW5kLiAqL1xuICBkZWxldGVJbXBvcnRCeURlY2xhcmF0aW9uKGRlY2xhcmF0aW9uOiB0cy5JbXBvcnREZWNsYXJhdGlvbikge1xuICAgIGNvbnN0IGZpbGVJbXBvcnRzID0gdGhpcy5fYW5hbHl6ZUltcG9ydHNJZk5lZWRlZChkZWNsYXJhdGlvbi5nZXRTb3VyY2VGaWxlKCkpO1xuICAgIGZvciAobGV0IGltcG9ydERhdGEgb2YgZmlsZUltcG9ydHMpIHtcbiAgICAgIGlmIChpbXBvcnREYXRhLm5vZGUgPT09IGRlY2xhcmF0aW9uKSB7XG4gICAgICAgIGltcG9ydERhdGEuc3RhdGUgfD0gSW1wb3J0U3RhdGUuREVMRVRFRDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBhbiBpbXBvcnQgdG8gdGhlIGdpdmVuIHNvdXJjZSBmaWxlIGFuZCByZXR1cm5zIHRoZSBUeXBlU2NyaXB0IGV4cHJlc3Npb24gdGhhdFxuICAgKiBjYW4gYmUgdXNlZCB0byBhY2Nlc3MgdGhlIG5ld2x5IGltcG9ydGVkIHN5bWJvbC5cbiAgICpcbiAgICogV2hlbmV2ZXIgYW4gaW1wb3J0IGlzIGFkZGVkIHRvIGEgc291cmNlIGZpbGUsIGl0J3MgcmVjb21tZW5kZWQgdGhhdCB0aGUgcmV0dXJuZWRcbiAgICogZXhwcmVzc2lvbiBpcyB1c2VkIHRvIHJlZmVyZW5jZSB0aCBzeW1ib2wuIFRoaXMgaXMgbmVjZXNzYXJ5IGJlY2F1c2UgdGhlIHN5bWJvbFxuICAgKiBjb3VsZCBiZSBhbGlhc2VkIGlmIGl0IHdvdWxkIGNvbGxpZGUgd2l0aCBleGlzdGluZyBpbXBvcnRzIGluIHNvdXJjZSBmaWxlLlxuICAgKlxuICAgKiBAcGFyYW0gc291cmNlRmlsZSBTb3VyY2UgZmlsZSB0byB3aGljaCB0aGUgaW1wb3J0IHNob3VsZCBiZSBhZGRlZC5cbiAgICogQHBhcmFtIHN5bWJvbE5hbWUgTmFtZSBvZiB0aGUgc3ltYm9sIHRoYXQgc2hvdWxkIGJlIGltcG9ydGVkLiBDYW4gYmUgbnVsbCBpZlxuICAgKiAgICB0aGUgZGVmYXVsdCBleHBvcnQgaXMgcmVxdWVzdGVkLlxuICAgKiBAcGFyYW0gbW9kdWxlTmFtZSBOYW1lIG9mIHRoZSBtb2R1bGUgb2Ygd2hpY2ggdGhlIHN5bWJvbCBzaG91bGQgYmUgaW1wb3J0ZWQuXG4gICAqIEBwYXJhbSB0eXBlSW1wb3J0IFdoZXRoZXIgdGhlIHN5bWJvbCBpcyBhIHR5cGUuXG4gICAqIEBwYXJhbSBpZ25vcmVJZGVudGlmaWVyQ29sbGlzaW9ucyBMaXN0IG9mIGlkZW50aWZpZXJzIHdoaWNoIGNhbiBiZSBpZ25vcmVkIHdoZW5cbiAgICogICAgdGhlIGltcG9ydCBtYW5hZ2VyIGNoZWNrcyBmb3IgaW1wb3J0IGNvbGxpc2lvbnMuXG4gICAqL1xuICBhZGRJbXBvcnRUb1NvdXJjZUZpbGUoXG4gICAgICBzb3VyY2VGaWxlOiB0cy5Tb3VyY2VGaWxlLCBzeW1ib2xOYW1lOiBzdHJpbmd8bnVsbCwgbW9kdWxlTmFtZTogc3RyaW5nLCB0eXBlSW1wb3J0ID0gZmFsc2UsXG4gICAgICBpZ25vcmVJZGVudGlmaWVyQ29sbGlzaW9uczogdHMuSWRlbnRpZmllcltdID0gW10pOiB0cy5FeHByZXNzaW9uIHtcbiAgICBjb25zdCBzb3VyY2VEaXIgPSBkaXJuYW1lKHNvdXJjZUZpbGUuZmlsZU5hbWUpO1xuICAgIGNvbnN0IGZpbGVJbXBvcnRzID0gdGhpcy5fYW5hbHl6ZUltcG9ydHNJZk5lZWRlZChzb3VyY2VGaWxlKTtcblxuICAgIGxldCBleGlzdGluZ0ltcG9ydDogQW5hbHl6ZWRJbXBvcnR8bnVsbCA9IG51bGw7XG4gICAgZm9yIChsZXQgaW1wb3J0RGF0YSBvZiBmaWxlSW1wb3J0cykge1xuICAgICAgaWYgKCF0aGlzLl9pc01vZHVsZVNwZWNpZmllck1hdGNoaW5nKHNvdXJjZURpciwgaW1wb3J0RGF0YS5tb2R1bGVOYW1lLCBtb2R1bGVOYW1lKSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gSWYgbm8gc3ltYm9sIG5hbWUgaGFzIGJlZW4gc3BlY2lmaWVkLCB0aGUgZGVmYXVsdCBpbXBvcnQgaXMgcmVxdWVzdGVkLiBJbiB0aGF0XG4gICAgICAvLyBjYXNlIHdlIHNlYXJjaCBmb3Igbm9uLW5hbWVzcGFjZSBhbmQgbm9uLXNwZWNpZmllciBpbXBvcnRzLlxuICAgICAgaWYgKCFzeW1ib2xOYW1lICYmICFpbXBvcnREYXRhLm5hbWVzcGFjZSAmJiAhaW1wb3J0RGF0YS5zcGVjaWZpZXJzKSB7XG4gICAgICAgIHJldHVybiB0cy5jcmVhdGVJZGVudGlmaWVyKGltcG9ydERhdGEubmFtZSEudGV4dCk7XG4gICAgICB9XG5cbiAgICAgIC8vIEluIGNhc2UgYSBcIlR5cGVcIiBzeW1ib2wgaXMgaW1wb3J0ZWQsIHdlIGNhbid0IHVzZSBuYW1lc3BhY2UgaW1wb3J0c1xuICAgICAgLy8gYmVjYXVzZSB0aGVzZSBvbmx5IGV4cG9ydCBzeW1ib2xzIGF2YWlsYWJsZSBhdCBydW50aW1lIChubyB0eXBlcylcbiAgICAgIGlmIChpbXBvcnREYXRhLm5hbWVzcGFjZSAmJiAhdHlwZUltcG9ydCkge1xuICAgICAgICByZXR1cm4gdHMuY3JlYXRlUHJvcGVydHlBY2Nlc3MoXG4gICAgICAgICAgICB0cy5jcmVhdGVJZGVudGlmaWVyKGltcG9ydERhdGEubmFtZSEudGV4dCksXG4gICAgICAgICAgICB0cy5jcmVhdGVJZGVudGlmaWVyKHN5bWJvbE5hbWUgfHwgJ2RlZmF1bHQnKSk7XG4gICAgICB9IGVsc2UgaWYgKGltcG9ydERhdGEuc3BlY2lmaWVycyAmJiBzeW1ib2xOYW1lKSB7XG4gICAgICAgIGNvbnN0IGV4aXN0aW5nU3BlY2lmaWVyID0gaW1wb3J0RGF0YS5zcGVjaWZpZXJzLmZpbmQoXG4gICAgICAgICAgICBzID0+IHMucHJvcGVydHlOYW1lID8gcy5wcm9wZXJ0eU5hbWUudGV4dCA9PT0gc3ltYm9sTmFtZSA6IHMubmFtZS50ZXh0ID09PSBzeW1ib2xOYW1lKTtcblxuICAgICAgICBpZiAoZXhpc3RpbmdTcGVjaWZpZXIpIHtcbiAgICAgICAgICByZXR1cm4gdHMuY3JlYXRlSWRlbnRpZmllcihleGlzdGluZ1NwZWNpZmllci5uYW1lLnRleHQpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSW4gY2FzZSB0aGUgc3ltYm9sIGNvdWxkIG5vdCBiZSBmb3VuZCBpbiBhbiBleGlzdGluZyBpbXBvcnQsIHdlXG4gICAgICAgIC8vIGtlZXAgdHJhY2sgb2YgdGhlIGltcG9ydCBkZWNsYXJhdGlvbiBhcyBpdCBjYW4gYmUgdXBkYXRlZCB0byBpbmNsdWRlXG4gICAgICAgIC8vIHRoZSBzcGVjaWZpZWQgc3ltYm9sIG5hbWUgd2l0aG91dCBoYXZpbmcgdG8gY3JlYXRlIGEgbmV3IGltcG9ydC5cbiAgICAgICAgZXhpc3RpbmdJbXBvcnQgPSBpbXBvcnREYXRhO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIElmIHRoZXJlIGlzIGFuIGV4aXN0aW5nIGltcG9ydCB0aGF0IG1hdGNoZXMgdGhlIHNwZWNpZmllZCBtb2R1bGUsIHdlXG4gICAgLy8ganVzdCB1cGRhdGUgdGhlIGltcG9ydCBzcGVjaWZpZXJzIHRvIGFsc28gaW1wb3J0IHRoZSByZXF1ZXN0ZWQgc3ltYm9sLlxuICAgIGlmIChleGlzdGluZ0ltcG9ydCkge1xuICAgICAgY29uc3QgcHJvcGVydHlJZGVudGlmaWVyID0gdHMuY3JlYXRlSWRlbnRpZmllcihzeW1ib2xOYW1lISk7XG4gICAgICBjb25zdCBnZW5lcmF0ZWRVbmlxdWVJZGVudGlmaWVyID1cbiAgICAgICAgICB0aGlzLl9nZXRVbmlxdWVJZGVudGlmaWVyKHNvdXJjZUZpbGUsIHN5bWJvbE5hbWUhLCBpZ25vcmVJZGVudGlmaWVyQ29sbGlzaW9ucyk7XG4gICAgICBjb25zdCBuZWVkc0dlbmVyYXRlZFVuaXF1ZU5hbWUgPSBnZW5lcmF0ZWRVbmlxdWVJZGVudGlmaWVyLnRleHQgIT09IHN5bWJvbE5hbWU7XG4gICAgICBjb25zdCBpbXBvcnROYW1lID0gbmVlZHNHZW5lcmF0ZWRVbmlxdWVOYW1lID8gZ2VuZXJhdGVkVW5pcXVlSWRlbnRpZmllciA6IHByb3BlcnR5SWRlbnRpZmllcjtcblxuICAgICAgZXhpc3RpbmdJbXBvcnQuc3BlY2lmaWVycyEucHVzaCh7XG4gICAgICAgIG5hbWU6IGltcG9ydE5hbWUsXG4gICAgICAgIHByb3BlcnR5TmFtZTogbmVlZHNHZW5lcmF0ZWRVbmlxdWVOYW1lID8gcHJvcGVydHlJZGVudGlmaWVyIDogdW5kZWZpbmVkLFxuICAgICAgfSk7XG4gICAgICBleGlzdGluZ0ltcG9ydC5zdGF0ZSB8PSBJbXBvcnRTdGF0ZS5NT0RJRklFRDtcblxuICAgICAgaWYgKGhhc0ZsYWcoZXhpc3RpbmdJbXBvcnQsIEltcG9ydFN0YXRlLkRFTEVURUQpKSB7XG4gICAgICAgIC8vIHVuc2V0IHRoZSBkZWxldGVkIGZsYWcgaWYgdGhlIGltcG9ydCBpcyBwZW5kaW5nIGRlbGV0aW9uLCBidXRcbiAgICAgICAgLy8gY2FuIG5vdyBiZSB1c2VkIGZvciB0aGUgbmV3IGltcG9ydGVkIHN5bWJvbC5cbiAgICAgICAgZXhpc3RpbmdJbXBvcnQuc3RhdGUgJj0gfkltcG9ydFN0YXRlLkRFTEVURUQ7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBpbXBvcnROYW1lO1xuICAgIH1cblxuICAgIGxldCBpZGVudGlmaWVyOiB0cy5JZGVudGlmaWVyfG51bGwgPSBudWxsO1xuICAgIGxldCBuZXdJbXBvcnQ6IEFuYWx5emVkSW1wb3J0fG51bGwgPSBudWxsO1xuXG4gICAgaWYgKHN5bWJvbE5hbWUpIHtcbiAgICAgIGNvbnN0IHByb3BlcnR5SWRlbnRpZmllciA9IHRzLmNyZWF0ZUlkZW50aWZpZXIoc3ltYm9sTmFtZSk7XG4gICAgICBjb25zdCBnZW5lcmF0ZWRVbmlxdWVJZGVudGlmaWVyID1cbiAgICAgICAgICB0aGlzLl9nZXRVbmlxdWVJZGVudGlmaWVyKHNvdXJjZUZpbGUsIHN5bWJvbE5hbWUsIGlnbm9yZUlkZW50aWZpZXJDb2xsaXNpb25zKTtcbiAgICAgIGNvbnN0IG5lZWRzR2VuZXJhdGVkVW5pcXVlTmFtZSA9IGdlbmVyYXRlZFVuaXF1ZUlkZW50aWZpZXIudGV4dCAhPT0gc3ltYm9sTmFtZTtcbiAgICAgIGlkZW50aWZpZXIgPSBuZWVkc0dlbmVyYXRlZFVuaXF1ZU5hbWUgPyBnZW5lcmF0ZWRVbmlxdWVJZGVudGlmaWVyIDogcHJvcGVydHlJZGVudGlmaWVyO1xuXG4gICAgICBjb25zdCBuZXdJbXBvcnREZWNsID0gdHMuY3JlYXRlSW1wb3J0RGVjbGFyYXRpb24oXG4gICAgICAgICAgdW5kZWZpbmVkLCB1bmRlZmluZWQsIHRzLmNyZWF0ZUltcG9ydENsYXVzZSh1bmRlZmluZWQsIHRzLmNyZWF0ZU5hbWVkSW1wb3J0cyhbXSkpLFxuICAgICAgICAgIHRzLmNyZWF0ZVN0cmluZ0xpdGVyYWwobW9kdWxlTmFtZSkpO1xuXG4gICAgICBuZXdJbXBvcnQgPSB7XG4gICAgICAgIG1vZHVsZU5hbWUsXG4gICAgICAgIG5vZGU6IG5ld0ltcG9ydERlY2wsXG4gICAgICAgIHNwZWNpZmllcnM6IFt7XG4gICAgICAgICAgcHJvcGVydHlOYW1lOiBuZWVkc0dlbmVyYXRlZFVuaXF1ZU5hbWUgPyBwcm9wZXJ0eUlkZW50aWZpZXIgOiB1bmRlZmluZWQsXG4gICAgICAgICAgbmFtZTogaWRlbnRpZmllclxuICAgICAgICB9XSxcbiAgICAgICAgc3RhdGU6IEltcG9ydFN0YXRlLkFEREVELFxuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWRlbnRpZmllciA9XG4gICAgICAgICAgdGhpcy5fZ2V0VW5pcXVlSWRlbnRpZmllcihzb3VyY2VGaWxlLCAnZGVmYXVsdEV4cG9ydCcsIGlnbm9yZUlkZW50aWZpZXJDb2xsaXNpb25zKTtcbiAgICAgIGNvbnN0IG5ld0ltcG9ydERlY2wgPSB0cy5jcmVhdGVJbXBvcnREZWNsYXJhdGlvbihcbiAgICAgICAgICB1bmRlZmluZWQsIHVuZGVmaW5lZCwgdHMuY3JlYXRlSW1wb3J0Q2xhdXNlKGlkZW50aWZpZXIsIHVuZGVmaW5lZCksXG4gICAgICAgICAgdHMuY3JlYXRlU3RyaW5nTGl0ZXJhbChtb2R1bGVOYW1lKSk7XG4gICAgICBuZXdJbXBvcnQgPSB7XG4gICAgICAgIG1vZHVsZU5hbWUsXG4gICAgICAgIG5vZGU6IG5ld0ltcG9ydERlY2wsXG4gICAgICAgIG5hbWU6IGlkZW50aWZpZXIsXG4gICAgICAgIHN0YXRlOiBJbXBvcnRTdGF0ZS5BRERFRCxcbiAgICAgIH07XG4gICAgfVxuICAgIGZpbGVJbXBvcnRzLnB1c2gobmV3SW1wb3J0KTtcbiAgICByZXR1cm4gaWRlbnRpZmllcjtcbiAgfVxuXG4gIC8qKlxuICAgKiBBcHBsaWVzIHRoZSByZWNvcmRlZCBjaGFuZ2VzIGluIHRoZSB1cGRhdGUgcmVjb3JkZXJzIG9mIHRoZSBjb3JyZXNwb25kaW5nIHNvdXJjZSBmaWxlcy5cbiAgICogVGhlIGNoYW5nZXMgYXJlIGFwcGxpZWQgc2VwYXJhdGVseSBhZnRlciBhbGwgY2hhbmdlcyBoYXZlIGJlZW4gcmVjb3JkZWQgYmVjYXVzZSBvdGhlcndpc2VcbiAgICogZmlsZSBvZmZzZXRzIHdpbGwgY2hhbmdlIGFuZCB0aGUgc291cmNlIGZpbGVzIHdvdWxkIG5lZWQgdG8gYmUgcmUtcGFyc2VkIGFmdGVyIGVhY2ggY2hhbmdlLlxuICAgKi9cbiAgcmVjb3JkQ2hhbmdlcygpIHtcbiAgICB0aGlzLl9pbXBvcnRDYWNoZS5mb3JFYWNoKChmaWxlSW1wb3J0cywgc291cmNlRmlsZSkgPT4ge1xuICAgICAgY29uc3QgcmVjb3JkZXIgPSB0aGlzLl9maWxlU3lzdGVtLmVkaXQodGhpcy5fZmlsZVN5c3RlbS5yZXNvbHZlKHNvdXJjZUZpbGUuZmlsZU5hbWUpKTtcbiAgICAgIGNvbnN0IGxhc3RVbm1vZGlmaWVkSW1wb3J0ID1cbiAgICAgICAgICBmaWxlSW1wb3J0cy5yZXZlcnNlKCkuZmluZChpID0+IGkuc3RhdGUgPT09IEltcG9ydFN0YXRlLlVOTU9ESUZJRUQpO1xuICAgICAgY29uc3QgaW1wb3J0U3RhcnRJbmRleCA9XG4gICAgICAgICAgbGFzdFVubW9kaWZpZWRJbXBvcnQgPyB0aGlzLl9nZXRFbmRQb3NpdGlvbk9mTm9kZShsYXN0VW5tb2RpZmllZEltcG9ydC5ub2RlKSA6IDA7XG5cbiAgICAgIGZpbGVJbXBvcnRzLmZvckVhY2goaW1wb3J0RGF0YSA9PiB7XG4gICAgICAgIGlmIChpbXBvcnREYXRhLnN0YXRlID09PSBJbXBvcnRTdGF0ZS5VTk1PRElGSUVEKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGhhc0ZsYWcoaW1wb3J0RGF0YSwgSW1wb3J0U3RhdGUuREVMRVRFRCkpIHtcbiAgICAgICAgICAvLyBJbXBvcnRzIHdoaWNoIGRvIG5vdCBleGlzdCBpbiBzb3VyY2UgZmlsZSwgY2FuIGJlIGp1c3Qgc2tpcHBlZCBhc1xuICAgICAgICAgIC8vIHdlIGRvIG5vdCBuZWVkIGFueSByZXBsYWNlbWVudCB0byBkZWxldGUgdGhlIGltcG9ydC5cbiAgICAgICAgICBpZiAoIWhhc0ZsYWcoaW1wb3J0RGF0YSwgSW1wb3J0U3RhdGUuQURERUQpKSB7XG4gICAgICAgICAgICByZWNvcmRlci5yZW1vdmUoaW1wb3J0RGF0YS5ub2RlLmdldEZ1bGxTdGFydCgpLCBpbXBvcnREYXRhLm5vZGUuZ2V0RnVsbFdpZHRoKCkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaW1wb3J0RGF0YS5zcGVjaWZpZXJzKSB7XG4gICAgICAgICAgY29uc3QgbmFtZWRCaW5kaW5ncyA9IGltcG9ydERhdGEubm9kZS5pbXBvcnRDbGF1c2UhLm5hbWVkQmluZGluZ3MgYXMgdHMuTmFtZWRJbXBvcnRzO1xuICAgICAgICAgIGNvbnN0IGltcG9ydFNwZWNpZmllcnMgPVxuICAgICAgICAgICAgICBpbXBvcnREYXRhLnNwZWNpZmllcnMubWFwKHMgPT4gdHMuY3JlYXRlSW1wb3J0U3BlY2lmaWVyKHMucHJvcGVydHlOYW1lLCBzLm5hbWUpKTtcbiAgICAgICAgICBjb25zdCB1cGRhdGVkQmluZGluZ3MgPSB0cy51cGRhdGVOYW1lZEltcG9ydHMobmFtZWRCaW5kaW5ncywgaW1wb3J0U3BlY2lmaWVycyk7XG5cbiAgICAgICAgICAvLyBJbiBjYXNlIGFuIGltcG9ydCBoYXMgYmVlbiBhZGRlZCBuZXdseSwgd2UgbmVlZCB0byBwcmludCB0aGUgd2hvbGUgaW1wb3J0XG4gICAgICAgICAgLy8gZGVjbGFyYXRpb24gYW5kIGluc2VydCBpdCBhdCB0aGUgaW1wb3J0IHN0YXJ0IGluZGV4LiBPdGhlcndpc2UsIHdlIGp1c3RcbiAgICAgICAgICAvLyB1cGRhdGUgdGhlIG5hbWVkIGJpbmRpbmdzIHRvIG5vdCByZS1wcmludCB0aGUgd2hvbGUgaW1wb3J0ICh3aGljaCBjb3VsZFxuICAgICAgICAgIC8vIGNhdXNlIHVubmVjZXNzYXJ5IGZvcm1hdHRpbmcgY2hhbmdlcylcbiAgICAgICAgICBpZiAoaGFzRmxhZyhpbXBvcnREYXRhLCBJbXBvcnRTdGF0ZS5BRERFRCkpIHtcbiAgICAgICAgICAgIGNvbnN0IHVwZGF0ZWRJbXBvcnQgPSB0cy51cGRhdGVJbXBvcnREZWNsYXJhdGlvbihcbiAgICAgICAgICAgICAgICBpbXBvcnREYXRhLm5vZGUsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgIHRzLmNyZWF0ZUltcG9ydENsYXVzZSh1bmRlZmluZWQsIHVwZGF0ZWRCaW5kaW5ncyksXG4gICAgICAgICAgICAgICAgdHMuY3JlYXRlU3RyaW5nTGl0ZXJhbChpbXBvcnREYXRhLm1vZHVsZU5hbWUpKTtcbiAgICAgICAgICAgIGNvbnN0IG5ld0ltcG9ydFRleHQgPVxuICAgICAgICAgICAgICAgIHRoaXMuX3ByaW50ZXIucHJpbnROb2RlKHRzLkVtaXRIaW50LlVuc3BlY2lmaWVkLCB1cGRhdGVkSW1wb3J0LCBzb3VyY2VGaWxlKTtcbiAgICAgICAgICAgIHJlY29yZGVyLmluc2VydExlZnQoXG4gICAgICAgICAgICAgICAgaW1wb3J0U3RhcnRJbmRleCxcbiAgICAgICAgICAgICAgICBpbXBvcnRTdGFydEluZGV4ID09PSAwID8gYCR7bmV3SW1wb3J0VGV4dH1cXG5gIDogYFxcbiR7bmV3SW1wb3J0VGV4dH1gKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9IGVsc2UgaWYgKGhhc0ZsYWcoaW1wb3J0RGF0YSwgSW1wb3J0U3RhdGUuTU9ESUZJRUQpKSB7XG4gICAgICAgICAgICBjb25zdCBuZXdOYW1lZEJpbmRpbmdzVGV4dCA9XG4gICAgICAgICAgICAgICAgdGhpcy5fcHJpbnRlci5wcmludE5vZGUodHMuRW1pdEhpbnQuVW5zcGVjaWZpZWQsIHVwZGF0ZWRCaW5kaW5ncywgc291cmNlRmlsZSk7XG4gICAgICAgICAgICByZWNvcmRlci5yZW1vdmUobmFtZWRCaW5kaW5ncy5nZXRTdGFydCgpLCBuYW1lZEJpbmRpbmdzLmdldFdpZHRoKCkpO1xuICAgICAgICAgICAgcmVjb3JkZXIuaW5zZXJ0UmlnaHQobmFtZWRCaW5kaW5ncy5nZXRTdGFydCgpLCBuZXdOYW1lZEJpbmRpbmdzVGV4dCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGhhc0ZsYWcoaW1wb3J0RGF0YSwgSW1wb3J0U3RhdGUuQURERUQpKSB7XG4gICAgICAgICAgY29uc3QgbmV3SW1wb3J0VGV4dCA9XG4gICAgICAgICAgICAgIHRoaXMuX3ByaW50ZXIucHJpbnROb2RlKHRzLkVtaXRIaW50LlVuc3BlY2lmaWVkLCBpbXBvcnREYXRhLm5vZGUsIHNvdXJjZUZpbGUpO1xuICAgICAgICAgIHJlY29yZGVyLmluc2VydExlZnQoXG4gICAgICAgICAgICAgIGltcG9ydFN0YXJ0SW5kZXgsXG4gICAgICAgICAgICAgIGltcG9ydFN0YXJ0SW5kZXggPT09IDAgPyBgJHtuZXdJbXBvcnRUZXh0fVxcbmAgOiBgXFxuJHtuZXdJbXBvcnRUZXh0fWApO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHdlIHNob3VsZCBuZXZlciBoaXQgdGhpcywgYnV0IHdlIHJhdGhlciB3YW50IHRvIHByaW50IGEgY3VzdG9tIGV4Y2VwdGlvblxuICAgICAgICAvLyBpbnN0ZWFkIG9mIGp1c3Qgc2tpcHBpbmcgaW1wb3J0cyBzaWxlbnRseS5cbiAgICAgICAgdGhyb3cgRXJyb3IoJ1VuZXhwZWN0ZWQgaW1wb3J0IG1vZGlmaWNhdGlvbi4nKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIENvcnJlY3RzIHRoZSBsaW5lIGFuZCBjaGFyYWN0ZXIgcG9zaXRpb24gb2YgYSBnaXZlbiBub2RlLiBTaW5jZSBub2RlcyBvZlxuICAgKiBzb3VyY2UgZmlsZXMgYXJlIGltbXV0YWJsZSBhbmQgd2Ugc29tZXRpbWVzIG1ha2UgY2hhbmdlcyB0byB0aGUgY29udGFpbmluZ1xuICAgKiBzb3VyY2UgZmlsZSwgdGhlIG5vZGUgcG9zaXRpb24gbWlnaHQgc2hpZnQgKGUuZy4gaWYgd2UgYWRkIGEgbmV3IGltcG9ydCBiZWZvcmUpLlxuICAgKlxuICAgKiBUaGlzIG1ldGhvZCBjYW4gYmUgdXNlZCB0byByZXRyaWV2ZSBhIGNvcnJlY3RlZCBwb3NpdGlvbiBvZiB0aGUgZ2l2ZW4gbm9kZS4gVGhpc1xuICAgKiBpcyBoZWxwZnVsIHdoZW4gcHJpbnRpbmcgb3V0IGVycm9yIG1lc3NhZ2VzIHdoaWNoIHNob3VsZCByZWZsZWN0IHRoZSBuZXcgc3RhdGUgb2ZcbiAgICogc291cmNlIGZpbGVzLlxuICAgKi9cbiAgY29ycmVjdE5vZGVQb3NpdGlvbihub2RlOiB0cy5Ob2RlLCBvZmZzZXQ6IG51bWJlciwgcG9zaXRpb246IHRzLkxpbmVBbmRDaGFyYWN0ZXIpIHtcbiAgICBjb25zdCBzb3VyY2VGaWxlID0gbm9kZS5nZXRTb3VyY2VGaWxlKCk7XG5cbiAgICBpZiAoIXRoaXMuX2ltcG9ydENhY2hlLmhhcyhzb3VyY2VGaWxlKSkge1xuICAgICAgcmV0dXJuIHBvc2l0aW9uO1xuICAgIH1cblxuICAgIGNvbnN0IG5ld1Bvc2l0aW9uOiB0cy5MaW5lQW5kQ2hhcmFjdGVyID0gey4uLnBvc2l0aW9ufTtcbiAgICBjb25zdCBmaWxlSW1wb3J0cyA9IHRoaXMuX2ltcG9ydENhY2hlLmdldChzb3VyY2VGaWxlKSE7XG5cbiAgICBmb3IgKGxldCBpbXBvcnREYXRhIG9mIGZpbGVJbXBvcnRzKSB7XG4gICAgICBjb25zdCBmdWxsRW5kID0gaW1wb3J0RGF0YS5ub2RlLmdldEZ1bGxTdGFydCgpICsgaW1wb3J0RGF0YS5ub2RlLmdldEZ1bGxXaWR0aCgpO1xuICAgICAgLy8gU3VidHJhY3Qgb3IgYWRkIGxpbmVzIGJhc2VkIG9uIHdoZXRoZXIgYW4gaW1wb3J0IGhhcyBiZWVuIGRlbGV0ZWQgb3IgcmVtb3ZlZFxuICAgICAgLy8gYmVmb3JlIHRoZSBhY3R1YWwgbm9kZSBvZmZzZXQuXG4gICAgICBpZiAob2Zmc2V0ID4gZnVsbEVuZCAmJiBoYXNGbGFnKGltcG9ydERhdGEsIEltcG9ydFN0YXRlLkRFTEVURUQpKSB7XG4gICAgICAgIG5ld1Bvc2l0aW9uLmxpbmUtLTtcbiAgICAgIH0gZWxzZSBpZiAob2Zmc2V0ID4gZnVsbEVuZCAmJiBoYXNGbGFnKGltcG9ydERhdGEsIEltcG9ydFN0YXRlLkFEREVEKSkge1xuICAgICAgICBuZXdQb3NpdGlvbi5saW5lKys7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBuZXdQb3NpdGlvbjtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIHVuaXF1ZSBpZGVudGlmaWVyIG5hbWUgZm9yIHRoZSBzcGVjaWZpZWQgc3ltYm9sIG5hbWUuXG4gICAqIEBwYXJhbSBzb3VyY2VGaWxlIFNvdXJjZSBmaWxlIHRvIGNoZWNrIGZvciBpZGVudGlmaWVyIGNvbGxpc2lvbnMuXG4gICAqIEBwYXJhbSBzeW1ib2xOYW1lIE5hbWUgb2YgdGhlIHN5bWJvbCBmb3Igd2hpY2ggd2Ugd2FudCB0byBnZW5lcmF0ZSBhbiB1bmlxdWUgbmFtZS5cbiAgICogQHBhcmFtIGlnbm9yZUlkZW50aWZpZXJDb2xsaXNpb25zIExpc3Qgb2YgaWRlbnRpZmllcnMgd2hpY2ggc2hvdWxkIGJlIGlnbm9yZWQgd2hlblxuICAgKiAgICBjaGVja2luZyBmb3IgaWRlbnRpZmllciBjb2xsaXNpb25zIGluIHRoZSBnaXZlbiBzb3VyY2UgZmlsZS5cbiAgICovXG4gIHByaXZhdGUgX2dldFVuaXF1ZUlkZW50aWZpZXIoXG4gICAgICBzb3VyY2VGaWxlOiB0cy5Tb3VyY2VGaWxlLCBzeW1ib2xOYW1lOiBzdHJpbmcsXG4gICAgICBpZ25vcmVJZGVudGlmaWVyQ29sbGlzaW9uczogdHMuSWRlbnRpZmllcltdKTogdHMuSWRlbnRpZmllciB7XG4gICAgaWYgKHRoaXMuX2lzVW5pcXVlSWRlbnRpZmllck5hbWUoc291cmNlRmlsZSwgc3ltYm9sTmFtZSwgaWdub3JlSWRlbnRpZmllckNvbGxpc2lvbnMpKSB7XG4gICAgICB0aGlzLl9yZWNvcmRVc2VkSWRlbnRpZmllcihzb3VyY2VGaWxlLCBzeW1ib2xOYW1lKTtcbiAgICAgIHJldHVybiB0cy5jcmVhdGVJZGVudGlmaWVyKHN5bWJvbE5hbWUpO1xuICAgIH1cblxuICAgIGxldCBuYW1lOiBzdHJpbmd8bnVsbCA9IG51bGw7XG4gICAgbGV0IGNvdW50ZXIgPSAxO1xuICAgIGRvIHtcbiAgICAgIG5hbWUgPSBgJHtzeW1ib2xOYW1lfV8ke2NvdW50ZXIrK31gO1xuICAgIH0gd2hpbGUgKCF0aGlzLl9pc1VuaXF1ZUlkZW50aWZpZXJOYW1lKHNvdXJjZUZpbGUsIG5hbWUsIGlnbm9yZUlkZW50aWZpZXJDb2xsaXNpb25zKSk7XG5cbiAgICB0aGlzLl9yZWNvcmRVc2VkSWRlbnRpZmllcihzb3VyY2VGaWxlLCBuYW1lISk7XG4gICAgcmV0dXJuIHRzLmNyZWF0ZUlkZW50aWZpZXIobmFtZSEpO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyB3aGV0aGVyIHRoZSBzcGVjaWZpZWQgaWRlbnRpZmllciBuYW1lIGlzIHVzZWQgd2l0aGluIHRoZSBnaXZlbiBzb3VyY2UgZmlsZS5cbiAgICogQHBhcmFtIHNvdXJjZUZpbGUgU291cmNlIGZpbGUgdG8gY2hlY2sgZm9yIGlkZW50aWZpZXIgY29sbGlzaW9ucy5cbiAgICogQHBhcmFtIG5hbWUgTmFtZSBvZiB0aGUgaWRlbnRpZmllciB3aGljaCBpcyBjaGVja2VkIGZvciBpdHMgdW5pcXVlbmVzcy5cbiAgICogQHBhcmFtIGlnbm9yZUlkZW50aWZpZXJDb2xsaXNpb25zIExpc3Qgb2YgaWRlbnRpZmllcnMgd2hpY2ggc2hvdWxkIGJlIGlnbm9yZWQgd2hlblxuICAgKiAgICBjaGVja2luZyBmb3IgaWRlbnRpZmllciBjb2xsaXNpb25zIGluIHRoZSBnaXZlbiBzb3VyY2UgZmlsZS5cbiAgICovXG4gIHByaXZhdGUgX2lzVW5pcXVlSWRlbnRpZmllck5hbWUoXG4gICAgICBzb3VyY2VGaWxlOiB0cy5Tb3VyY2VGaWxlLCBuYW1lOiBzdHJpbmcsIGlnbm9yZUlkZW50aWZpZXJDb2xsaXNpb25zOiB0cy5JZGVudGlmaWVyW10pIHtcbiAgICBpZiAodGhpcy5fdXNlZElkZW50aWZpZXJOYW1lcy5oYXMoc291cmNlRmlsZSkgJiZcbiAgICAgICAgdGhpcy5fdXNlZElkZW50aWZpZXJOYW1lcy5nZXQoc291cmNlRmlsZSkhLmluZGV4T2YobmFtZSkgIT09IC0xKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gV2FsayB0aHJvdWdoIHRoZSBzb3VyY2UgZmlsZSBhbmQgc2VhcmNoIGZvciBhbiBpZGVudGlmaWVyIG1hdGNoaW5nXG4gICAgLy8gdGhlIGdpdmVuIG5hbWUuIEluIHRoYXQgY2FzZSwgaXQncyBub3QgZ3VhcmFudGVlZCB0aGF0IHRoaXMgbmFtZVxuICAgIC8vIGlzIHVuaXF1ZSBpbiB0aGUgZ2l2ZW4gZGVjbGFyYXRpb24gc2NvcGUgYW5kIHdlIGp1c3QgcmV0dXJuIGZhbHNlLlxuICAgIGNvbnN0IG5vZGVRdWV1ZTogdHMuTm9kZVtdID0gW3NvdXJjZUZpbGVdO1xuICAgIHdoaWxlIChub2RlUXVldWUubGVuZ3RoKSB7XG4gICAgICBjb25zdCBub2RlID0gbm9kZVF1ZXVlLnNoaWZ0KCkhO1xuICAgICAgaWYgKHRzLmlzSWRlbnRpZmllcihub2RlKSAmJiBub2RlLnRleHQgPT09IG5hbWUgJiZcbiAgICAgICAgICAhaWdub3JlSWRlbnRpZmllckNvbGxpc2lvbnMuaW5jbHVkZXMobm9kZSkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgbm9kZVF1ZXVlLnB1c2goLi4ubm9kZS5nZXRDaGlsZHJlbigpKTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvKipcbiAgICogUmVjb3JkcyB0aGF0IHRoZSBnaXZlbiBpZGVudGlmaWVyIGlzIHVzZWQgd2l0aGluIHRoZSBzcGVjaWZpZWQgc291cmNlIGZpbGUuIFRoaXNcbiAgICogaXMgbmVjZXNzYXJ5IHNpbmNlIHdlIGRvIG5vdCBhcHBseSBjaGFuZ2VzIHRvIHNvdXJjZSBmaWxlcyBwZXIgY2hhbmdlLCBidXQgc3RpbGxcbiAgICogd2FudCB0byBhdm9pZCBjb25mbGljdHMgd2l0aCBuZXdseSBpbXBvcnRlZCBzeW1ib2xzLlxuICAgKi9cbiAgcHJpdmF0ZSBfcmVjb3JkVXNlZElkZW50aWZpZXIoc291cmNlRmlsZTogdHMuU291cmNlRmlsZSwgaWRlbnRpZmllck5hbWU6IHN0cmluZykge1xuICAgIHRoaXMuX3VzZWRJZGVudGlmaWVyTmFtZXMuc2V0KFxuICAgICAgICBzb3VyY2VGaWxlLCAodGhpcy5fdXNlZElkZW50aWZpZXJOYW1lcy5nZXQoc291cmNlRmlsZSkgfHwgW10pLmNvbmNhdChpZGVudGlmaWVyTmFtZSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIERldGVybWluZXMgdGhlIGZ1bGwgZW5kIG9mIGEgZ2l2ZW4gbm9kZS4gQnkgZGVmYXVsdCB0aGUgZW5kIHBvc2l0aW9uIG9mIGEgbm9kZSBpc1xuICAgKiBiZWZvcmUgYWxsIHRyYWlsaW5nIGNvbW1lbnRzLiBUaGlzIGNvdWxkIG1lYW4gdGhhdCBnZW5lcmF0ZWQgaW1wb3J0cyBzaGlmdCBjb21tZW50cy5cbiAgICovXG4gIHByaXZhdGUgX2dldEVuZFBvc2l0aW9uT2ZOb2RlKG5vZGU6IHRzLk5vZGUpIHtcbiAgICBjb25zdCBub2RlRW5kUG9zID0gbm9kZS5nZXRFbmQoKTtcbiAgICBjb25zdCBjb21tZW50UmFuZ2VzID0gdHMuZ2V0VHJhaWxpbmdDb21tZW50UmFuZ2VzKG5vZGUuZ2V0U291cmNlRmlsZSgpLnRleHQsIG5vZGVFbmRQb3MpO1xuICAgIGlmICghY29tbWVudFJhbmdlcyB8fCAhY29tbWVudFJhbmdlcy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBub2RlRW5kUG9zO1xuICAgIH1cbiAgICByZXR1cm4gY29tbWVudFJhbmdlc1tjb21tZW50UmFuZ2VzLmxlbmd0aCAtIDFdIS5lbmQ7XG4gIH1cbn1cbiJdfQ==