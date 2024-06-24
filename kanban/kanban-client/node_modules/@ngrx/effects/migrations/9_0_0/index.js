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
var ts = require("typescript");
var schematics_1 = require("@angular-devkit/schematics");
var schematics_core_1 = require("../../schematics-core");
function renameErrorHandlerConfig() {
    return function (tree, ctx) {
        (0, schematics_core_1.visitTSSourceFiles)(tree, function (sourceFile) {
            var changes = replaceEffectConfigKeys(sourceFile, 'resubscribeOnError', 'useEffectsErrorHandler');
            (0, schematics_core_1.commitChanges)(tree, sourceFile.fileName, changes);
            if (changes.length) {
                ctx.logger.info("[@ngrx/effects] Updated Effects configuration, see the migration guide (https://ngrx.io/guide/migration/v9#effects) for more info");
            }
        });
    };
}
function replaceEffectConfigKeys(sourceFile, oldText, newText) {
    var changes = [];
    ts.forEachChild(sourceFile, function (node) {
        visitCreateEffectFunctionCreator(node, function (createEffectNode) {
            var _a = __read(createEffectNode.arguments, 2), effectDeclaration = _a[0], configNode = _a[1];
            if (configNode) {
                findAndReplaceText(configNode);
            }
        });
        visitEffectDecorator(node, function (effectDecoratorNode) {
            findAndReplaceText(effectDecoratorNode);
        });
    });
    return changes;
    function findAndReplaceText(node) {
        visitIdentifierWithText(node, oldText, function (match) {
            changes.push((0, schematics_core_1.createReplaceChange)(sourceFile, match, oldText, newText));
        });
    }
}
function visitIdentifierWithText(node, text, visitor) {
    if (ts.isIdentifier(node) && node.text === text) {
        visitor(node);
    }
    ts.forEachChild(node, function (childNode) {
        return visitIdentifierWithText(childNode, text, visitor);
    });
}
function visitEffectDecorator(node, visitor) {
    if (ts.isDecorator(node) &&
        ts.isCallExpression(node.expression) &&
        ts.isIdentifier(node.expression.expression) &&
        node.expression.expression.text === 'Effect') {
        visitor(node);
    }
    ts.forEachChild(node, function (childNode) {
        return visitEffectDecorator(childNode, visitor);
    });
}
function visitCreateEffectFunctionCreator(node, visitor) {
    if (ts.isCallExpression(node) &&
        ts.isIdentifier(node.expression) &&
        node.expression.text === 'createEffect') {
        visitor(node);
    }
    ts.forEachChild(node, function (childNode) {
        return visitCreateEffectFunctionCreator(childNode, visitor);
    });
}
function default_1() {
    return (0, schematics_1.chain)([renameErrorHandlerConfig()]);
}
exports.default = default_1;
//# sourceMappingURL=index.js.map