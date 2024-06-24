"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrateStoreTypedActionReferences = exports.migrateStoreTypedAction = void 0;
var ts = require("typescript");
var schematics_1 = require("@angular-devkit/schematics");
var schematics_core_1 = require("../../schematics-core");
var change_1 = require("../../schematics-core/utility/change");
var storeModelsPath = '@ngrx/store/src/models';
var filesWithChanges = [];
function migrateStoreTypedAction() {
    return function (tree, ctx) {
        (0, schematics_core_1.visitTSSourceFiles)(tree, function (sourceFile) {
            var _a;
            var changes = [];
            var importDeclarations = new Array();
            getImportDeclarations(sourceFile, importDeclarations);
            var storeModelsImportsAndDeclaration = importDeclarations
                .map(function (storeModelsImportDeclaration) {
                var storeModelsImports = getStoreModelsNamedBindings(storeModelsImportDeclaration);
                if (storeModelsImports) {
                    return { storeModelsImports: storeModelsImports, storeModelsImportDeclaration: storeModelsImportDeclaration };
                }
                else {
                    return undefined;
                }
            })
                .find(Boolean);
            if (!storeModelsImportsAndDeclaration) {
                return;
            }
            var storeModelsImports = storeModelsImportsAndDeclaration.storeModelsImports, storeModelsImportDeclaration = storeModelsImportsAndDeclaration.storeModelsImportDeclaration;
            var storeImportDeclaration = importDeclarations.find(function (node) {
                return node.moduleSpecifier.getText().includes('@ngrx/store') &&
                    !node.moduleSpecifier.getText().includes('@ngrx/store/');
            });
            var otherStoreModelImports = storeModelsImports.elements
                .filter(function (element) { return element.name.getText() !== 'TypedAction'; })
                .map(function (element) { return element.name.getText(); })
                .join(', ');
            // Remove `TypedAction` from @ngrx/store/src/models and leave the other imports
            if (otherStoreModelImports) {
                changes.push((0, schematics_core_1.createReplaceChange)(sourceFile, storeModelsImportDeclaration, storeModelsImportDeclaration.getText(), "import { ".concat(otherStoreModelImports, " } from '").concat(storeModelsPath, "';")));
            }
            // Remove complete import because it's empty
            else {
                changes.push((0, change_1.createRemoveChange)(sourceFile, storeModelsImportDeclaration, storeModelsImportDeclaration.getStart(), storeModelsImportDeclaration.getEnd() + 1));
            }
            var importAppendedInExistingDeclaration = false;
            if ((_a = storeImportDeclaration === null || storeImportDeclaration === void 0 ? void 0 : storeImportDeclaration.importClause) === null || _a === void 0 ? void 0 : _a.namedBindings) {
                var bindings = storeImportDeclaration.importClause.namedBindings;
                if (ts.isNamedImports(bindings)) {
                    // Add import to existing @ngrx/operators
                    var updatedImports = new Set(__spreadArray(__spreadArray([], __read(bindings.elements.map(function (element) { return element.name.getText(); })), false), [
                        'Action',
                    ], false));
                    var importStatement = "import { ".concat(__spreadArray([], __read(updatedImports), false).join(', '), " } from '@ngrx/store';");
                    changes.push((0, schematics_core_1.createReplaceChange)(sourceFile, storeImportDeclaration, storeImportDeclaration.getText(), importStatement));
                    importAppendedInExistingDeclaration = true;
                }
            }
            if (!importAppendedInExistingDeclaration) {
                // Add new @ngrx/operators import line
                var importStatement = "import { Action } from '@ngrx/store';";
                changes.push(new schematics_core_1.InsertChange(sourceFile.fileName, storeModelsImportDeclaration.getEnd() + 1, "".concat(importStatement, "\n")));
            }
            (0, schematics_core_1.commitChanges)(tree, sourceFile.fileName, changes);
            if (changes.length) {
                filesWithChanges.push(sourceFile.fileName);
                ctx.logger.info("[@ngrx/store] ".concat(sourceFile.fileName, ": Replaced TypedAction to Action"));
            }
        });
    };
}
exports.migrateStoreTypedAction = migrateStoreTypedAction;
function migrateStoreTypedActionReferences() {
    return function (tree, _ctx) {
        (0, schematics_core_1.visitTSSourceFiles)(tree, function (sourceFile) {
            if (!filesWithChanges.includes(sourceFile.fileName)) {
                return;
            }
            var changes = [];
            var typedActionIdentifiers = new Array();
            getTypedActionUsages(sourceFile, typedActionIdentifiers);
            typedActionIdentifiers.forEach(function (identifier) {
                changes.push((0, schematics_core_1.createReplaceChange)(sourceFile, identifier, identifier.getText(), 'Action'));
            });
            (0, schematics_core_1.commitChanges)(tree, sourceFile.fileName, changes);
        });
    };
}
exports.migrateStoreTypedActionReferences = migrateStoreTypedActionReferences;
function getImportDeclarations(node, imports) {
    if (ts.isImportDeclaration(node)) {
        imports.push(node);
    }
    ts.forEachChild(node, function (childNode) {
        return getImportDeclarations(childNode, imports);
    });
}
function getTypedActionUsages(node, nodeIdentifiers) {
    if (ts.isIdentifier(node) && node.getText() === 'TypedAction') {
        nodeIdentifiers.push(node);
    }
    ts.forEachChild(node, function (childNode) {
        return getTypedActionUsages(childNode, nodeIdentifiers);
    });
}
function getStoreModelsNamedBindings(node) {
    var _a;
    var namedBindings = (_a = node === null || node === void 0 ? void 0 : node.importClause) === null || _a === void 0 ? void 0 : _a.namedBindings;
    if (node.moduleSpecifier.getText().includes(storeModelsPath) &&
        namedBindings &&
        ts.isNamedImports(namedBindings)) {
        return namedBindings;
    }
    return null;
}
function default_1() {
    return (0, schematics_1.chain)([
        migrateStoreTypedAction(),
        migrateStoreTypedActionReferences(),
    ]);
}
exports.default = default_1;
//# sourceMappingURL=index.js.map