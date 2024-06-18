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
exports.migrateToCreators = void 0;
var ts = require("typescript");
var schematics_1 = require("@angular-devkit/schematics");
var schematics_core_1 = require("../../schematics-core");
function migrateToCreators() {
    return function (tree) {
        (0, schematics_core_1.visitTSSourceFiles)(tree, function (sourceFile) {
            var effectsPerClass = sourceFile.statements
                .filter(ts.isClassDeclaration)
                .map(function (clas) {
                return clas.members.filter(ts.isPropertyDeclaration).filter(function (property) {
                    var decorators = ts.getDecorators(property);
                    return decorators && decorators.some(isEffectDecorator);
                });
            });
            var effects = effectsPerClass.reduce(function (acc, effects) { return acc.concat(effects); }, []);
            var createEffectsChanges = replaceEffectDecorators(tree, sourceFile, effects);
            var importChanges = (0, schematics_core_1.replaceImport)(sourceFile, sourceFile.fileName, '@ngrx/effects', 'Effect', 'createEffect');
            (0, schematics_core_1.commitChanges)(tree, sourceFile.fileName, __spreadArray(__spreadArray([], __read(importChanges), false), __read(createEffectsChanges), false));
        });
    };
}
exports.migrateToCreators = migrateToCreators;
function replaceEffectDecorators(host, sourceFile, effects) {
    var inserts = effects
        .map(function (effect) {
        if (!effect.initializer) {
            return [];
        }
        var decorator = (ts.getDecorators(effect) || []).find(isEffectDecorator);
        if (!decorator) {
            return [];
        }
        if (effect.initializer.getText().includes('createEffect')) {
            return [];
        }
        var effectArguments = getDispatchProperties(host, sourceFile.text, decorator);
        var end = effectArguments ? ", ".concat(effectArguments, ")") : ')';
        return [
            new schematics_core_1.InsertChange(sourceFile.fileName, effect.initializer.pos, ' createEffect(() =>'),
            new schematics_core_1.InsertChange(sourceFile.fileName, effect.initializer.end, end),
        ];
    })
        .reduce(function (acc, inserts) { return acc.concat(inserts); }, []);
    var removes = effects
        .map(function (effect) { return ts.getDecorators(effect); })
        .map(function (decorators) {
        if (!decorators) {
            return [];
        }
        var effectDecorators = decorators.filter(isEffectDecorator);
        return effectDecorators.map(function (decorator) {
            return new schematics_core_1.RemoveChange(sourceFile.fileName, decorator.expression.pos - 1, // also get the @ sign
            decorator.expression.end);
        });
    })
        .reduce(function (acc, removes) { return acc.concat(removes); }, []);
    return __spreadArray(__spreadArray([], __read(inserts), false), __read(removes), false);
}
function isEffectDecorator(decorator) {
    return (ts.isCallExpression(decorator.expression) &&
        ts.isIdentifier(decorator.expression.expression) &&
        decorator.expression.expression.text === 'Effect');
}
function getDispatchProperties(host, fileContent, decorator) {
    if (!decorator.expression || !ts.isCallExpression(decorator.expression)) {
        return '';
    }
    // just copy the effect properties
    var args = fileContent
        .substring(decorator.expression.arguments.pos, decorator.expression.arguments.end)
        .trim();
    return args;
}
function default_1() {
    return (0, schematics_1.chain)([migrateToCreators()]);
}
exports.default = default_1;
//# sourceMappingURL=index.js.map