"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ts = require("typescript");
var schematics_1 = require("@angular-devkit/schematics");
var schematics_core_1 = require("../../schematics-core");
function updateGetMockStore() {
    return function (tree) {
        (0, schematics_core_1.visitTSSourceFiles)(tree, function (sourceFile) {
            var imports = sourceFile.statements
                .filter(ts.isImportDeclaration)
                .filter(function (importDeclaration) {
                return importDeclaration.moduleSpecifier.getText(sourceFile) ===
                    "'@ngrx/store'" ||
                    importDeclaration.moduleSpecifier.getText(sourceFile) ===
                        '"@ngrx/store"';
            })
                .flatMap(function (importDeclaration) {
                var _a, _b;
                return (_b = (_a = importDeclaration.importClause) === null || _a === void 0 ? void 0 : _a.namedBindings) !== null && _b !== void 0 ? _b : [];
            })
                .flatMap(function (binding) {
                return ts.isNamedImports(binding) ? binding.elements : [];
            })
                .filter(function (element) { return element.name.getText(sourceFile) === 'getMockStore'; });
            if (!imports.length)
                return;
            var changes = [];
            imports.forEach(function (binding) {
                changes.push(new schematics_core_1.RemoveChange(sourceFile.fileName, binding.pos, binding.end));
                changes.push(new schematics_core_1.InsertChange(sourceFile.fileName, binding.pos, 'createMockStore'));
            });
            ts.forEachChild(sourceFile, crawl);
            return (0, schematics_core_1.commitChanges)(tree, sourceFile.fileName, changes);
            function crawl(node) {
                ts.forEachChild(node, crawl);
                if (!ts.isCallExpression(node))
                    return;
                if (!ts.isIdentifier(node.expression))
                    return;
                if (node.expression.text !== 'getMockStore')
                    return;
                changes.push(new schematics_core_1.RemoveChange(sourceFile.fileName, node.expression.pos, node.expression.end));
                changes.push(new schematics_core_1.InsertChange(sourceFile.fileName, node.expression.pos, 'createMockStore'));
            }
        });
    };
}
function default_1() {
    return (0, schematics_1.chain)([updateGetMockStore]);
}
exports.default = default_1;
//# sourceMappingURL=index.js.map