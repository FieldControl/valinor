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
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrateProvideEffects = void 0;
var ts = require("typescript");
var schematics_1 = require("@angular-devkit/schematics");
var schematics_core_1 = require("../../schematics-core");
function migrateProvideEffects() {
    return function (tree, ctx) {
        (0, schematics_core_1.visitTSSourceFiles)(tree, function (sourceFile) {
            var changes = [];
            var isProvideEffectsImported = false;
            visitImportSpecifiers(sourceFile, function (node) {
                if (node.name.getText() === 'provideEffects' &&
                    node.parent.parent.parent.moduleSpecifier
                        .getText()
                        .includes('@ngrx/effects')) {
                    isProvideEffectsImported = true;
                    return;
                }
            });
            if (!isProvideEffectsImported) {
                return;
            }
            visitProvideEffects(sourceFile, function (node) {
                var _a = __read(node.arguments, 1), effectClasses = _a[0];
                if (effectClasses && ts.isArrayLiteralExpression(effectClasses)) {
                    var spreaded = effectClasses.elements
                        .map(function (e) { return e.getText(); })
                        .join(', ');
                    changes.push((0, schematics_core_1.createReplaceChange)(sourceFile, effectClasses, effectClasses.getText(), spreaded));
                }
            });
            (0, schematics_core_1.commitChanges)(tree, sourceFile.fileName, changes);
            if (changes.length) {
                ctx.logger.info("[@ngrx/effects] Updated provideEffects usage");
            }
        });
    };
}
exports.migrateProvideEffects = migrateProvideEffects;
function visitProvideEffects(node, visitor) {
    if (ts.isCallExpression(node) &&
        ts.isIdentifier(node.expression) &&
        node.expression.text === 'provideEffects') {
        visitor(node);
    }
    ts.forEachChild(node, function (childNode) { return visitProvideEffects(childNode, visitor); });
}
function visitImportSpecifiers(node, visitor) {
    if (ts.isImportSpecifier(node)) {
        visitor(node);
    }
    ts.forEachChild(node, function (childNode) {
        return visitImportSpecifiers(childNode, visitor);
    });
}
function default_1() {
    return (0, schematics_1.chain)([migrateProvideEffects()]);
}
exports.default = default_1;
//# sourceMappingURL=index.js.map