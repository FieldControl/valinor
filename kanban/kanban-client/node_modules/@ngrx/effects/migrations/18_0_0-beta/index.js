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
exports.migrateConcatLatestFromImport = void 0;
var ts = require("typescript");
var schematics_1 = require("@angular-devkit/schematics");
var schematics_core_1 = require("../../schematics-core");
var change_1 = require("../../schematics-core/utility/change");
function migrateConcatLatestFromImport() {
    return function (tree, ctx) {
        var changes = [];
        (0, schematics_core_1.addPackageToPackageJson)(tree, 'dependencies', '@ngrx/operators', '^18.0.0');
        (0, schematics_core_1.visitTSSourceFiles)(tree, function (sourceFile) {
            var _a;
            var importDeclarations = new Array();
            getImportDeclarations(sourceFile, importDeclarations);
            var effectsImportsAndDeclaration = importDeclarations
                .map(function (effectsImportDeclaration) {
                var effectsImports = getEffectsNamedBinding(effectsImportDeclaration);
                if (effectsImports) {
                    return { effectsImports: effectsImports, effectsImportDeclaration: effectsImportDeclaration };
                }
                else {
                    return undefined;
                }
            })
                .find(Boolean);
            if (!effectsImportsAndDeclaration) {
                return;
            }
            var effectsImports = effectsImportsAndDeclaration.effectsImports, effectsImportDeclaration = effectsImportsAndDeclaration.effectsImportDeclaration;
            var operatorsImportDeclaration = importDeclarations.find(function (node) {
                return node.moduleSpecifier.getText().includes('@ngrx/operators');
            });
            var otherEffectsImports = effectsImports.elements
                .filter(function (element) { return element.name.getText() !== 'concatLatestFrom'; })
                .map(function (element) { return element.name.getText(); })
                .join(', ');
            // Remove `concatLatestFrom` from @ngrx/effects and leave the other imports
            if (otherEffectsImports) {
                changes.push((0, schematics_core_1.createReplaceChange)(sourceFile, effectsImportDeclaration, effectsImportDeclaration.getText(), "import { ".concat(otherEffectsImports, " } from '@ngrx/effects';")));
            }
            // Remove complete @ngrx/effects import because it contains only `concatLatestFrom`
            else {
                changes.push((0, change_1.createRemoveChange)(sourceFile, effectsImportDeclaration, effectsImportDeclaration.getStart(), effectsImportDeclaration.getEnd() + 1));
            }
            var importAppendedInExistingDeclaration = false;
            if ((_a = operatorsImportDeclaration === null || operatorsImportDeclaration === void 0 ? void 0 : operatorsImportDeclaration.importClause) === null || _a === void 0 ? void 0 : _a.namedBindings) {
                var bindings = operatorsImportDeclaration.importClause.namedBindings;
                if (ts.isNamedImports(bindings)) {
                    // Add import to existing @ngrx/operators
                    var updatedImports = __spreadArray(__spreadArray([], __read(bindings.elements.map(function (element) { return element.name.getText(); })), false), [
                        'concatLatestFrom',
                    ], false);
                    var newOperatorsImport = "import { ".concat(updatedImports.join(', '), " } from '@ngrx/operators';");
                    changes.push((0, schematics_core_1.createReplaceChange)(sourceFile, operatorsImportDeclaration, operatorsImportDeclaration.getText(), newOperatorsImport));
                    importAppendedInExistingDeclaration = true;
                }
            }
            if (!importAppendedInExistingDeclaration) {
                // Add new @ngrx/operators import line
                var newOperatorsImport = "import { concatLatestFrom } from '@ngrx/operators';";
                changes.push(new schematics_core_1.InsertChange(sourceFile.fileName, effectsImportDeclaration.getEnd() + 1, "".concat(newOperatorsImport, "\n")));
            }
            (0, schematics_core_1.commitChanges)(tree, sourceFile.fileName, changes);
            if (changes.length) {
                ctx.logger.info("[@ngrx/effects] Updated concatLatestFrom to import from '@ngrx/operators'");
            }
        });
    };
}
exports.migrateConcatLatestFromImport = migrateConcatLatestFromImport;
function getImportDeclarations(node, imports) {
    if (ts.isImportDeclaration(node)) {
        imports.push(node);
    }
    ts.forEachChild(node, function (childNode) {
        return getImportDeclarations(childNode, imports);
    });
}
function getEffectsNamedBinding(node) {
    var _a;
    var namedBindings = (_a = node === null || node === void 0 ? void 0 : node.importClause) === null || _a === void 0 ? void 0 : _a.namedBindings;
    if (node.moduleSpecifier.getText().includes('@ngrx/effects') &&
        namedBindings &&
        ts.isNamedImports(namedBindings)) {
        return namedBindings;
    }
    return null;
}
function default_1() {
    return (0, schematics_1.chain)([migrateConcatLatestFromImport()]);
}
exports.default = default_1;
//# sourceMappingURL=index.js.map