"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ts = require("typescript");
var schematics_1 = require("@angular-devkit/schematics");
var schematics_core_1 = require("../../schematics-core");
function updatecreateFeature() {
    return function (tree) {
        (0, schematics_core_1.visitTSSourceFiles)(tree, function (sourceFile) {
            var runMigration = sourceFile.statements
                .filter(ts.isImportDeclaration)
                .filter(function (importDeclaration) {
                return importDeclaration.moduleSpecifier.getText(sourceFile) ===
                    "'@ngrx/store'" ||
                    importDeclaration.moduleSpecifier.getText(sourceFile) ===
                        '"@ngrx/store"';
            })
                .some(function (importDeclaration) {
                var _a, _b;
                return (_b = (_a = importDeclaration.importClause) === null || _a === void 0 ? void 0 : _a.namedBindings) === null || _b === void 0 ? void 0 : _b.getText(sourceFile).includes('createFeature');
            });
            if (!runMigration)
                return;
            var changes = [];
            ts.forEachChild(sourceFile, crawl);
            return (0, schematics_core_1.commitChanges)(tree, sourceFile.fileName, changes);
            function crawl(node) {
                ts.forEachChild(node, crawl);
                if (!ts.isCallExpression(node))
                    return;
                var typeArguments = node.typeArguments;
                if (!(typeArguments === null || typeArguments === void 0 ? void 0 : typeArguments.length))
                    return;
                if (!ts.isIdentifier(node.expression))
                    return;
                if (node.expression.text !== 'createFeature')
                    return;
                changes.push(new schematics_core_1.RemoveChange(sourceFile.fileName, 
                // to include <
                typeArguments.pos - 1, 
                // to include >
                typeArguments.end + 1));
            }
        });
    };
}
function default_1() {
    return (0, schematics_1.chain)([updatecreateFeature]);
}
exports.default = default_1;
//# sourceMappingURL=index.js.map