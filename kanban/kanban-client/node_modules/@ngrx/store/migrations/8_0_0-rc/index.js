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
var ts = require("typescript");
var schematics_1 = require("@angular-devkit/schematics");
var schematics_core_1 = require("../../schematics-core");
function replaceWithRuntimeChecks() {
    return function (tree) {
        // only add runtime checks when ngrx-store-freeze is used
        var _ = (0, schematics_core_1.visitTSSourceFiles)(tree, removeUsages) &&
            (0, schematics_core_1.visitTSSourceFiles)(tree, insertRuntimeChecks);
    };
}
function removeNgRxStoreFreezePackage() {
    return function (tree) {
        var pkgPath = '/package.json';
        var buffer = tree.read(pkgPath);
        if (buffer === null) {
            throw new schematics_1.SchematicsException('Could not read package.json');
        }
        var content = buffer.toString();
        var pkg = JSON.parse(content);
        if (pkg === null || typeof pkg !== 'object' || Array.isArray(pkg)) {
            throw new schematics_1.SchematicsException('Error reading package.json');
        }
        var dependencyCategories = ['dependencies', 'devDependencies'];
        dependencyCategories.forEach(function (category) {
            if (pkg[category] && pkg[category]['ngrx-store-freeze']) {
                delete pkg[category]['ngrx-store-freeze'];
            }
        });
        tree.overwrite(pkgPath, JSON.stringify(pkg, null, 2));
        return tree;
    };
}
function default_1() {
    return (0, schematics_1.chain)([removeNgRxStoreFreezePackage(), replaceWithRuntimeChecks()]);
}
exports.default = default_1;
function removeUsages(sourceFile, tree, ngrxStoreFreezeIsUsed) {
    if (sourceFile.fileName.endsWith('.spec.ts') ||
        sourceFile.fileName.endsWith('.test.ts')) {
        return ngrxStoreFreezeIsUsed;
    }
    var importRemovements = findStoreFreezeImportsToRemove(sourceFile);
    if (importRemovements.length === 0) {
        return ngrxStoreFreezeIsUsed;
    }
    var usageReplacements = findStoreFreezeUsagesToRemove(sourceFile);
    var changes = __spreadArray(__spreadArray([], __read(importRemovements), false), __read(usageReplacements), false);
    return (0, schematics_core_1.commitChanges)(tree, sourceFile.fileName, changes);
}
function insertRuntimeChecks(sourceFile, tree) {
    if (sourceFile.fileName.endsWith('.spec.ts') ||
        sourceFile.fileName.endsWith('.test.ts')) {
        return;
    }
    var changes = findRuntimeCHecksToInsert(sourceFile);
    return (0, schematics_core_1.commitChanges)(tree, sourceFile.fileName, changes);
}
function findStoreFreezeImportsToRemove(sourceFile) {
    var imports = sourceFile.statements
        .filter(ts.isImportDeclaration)
        .filter(function (_a) {
        var moduleSpecifier = _a.moduleSpecifier;
        return (moduleSpecifier.getText(sourceFile) === "'ngrx-store-freeze'" ||
            moduleSpecifier.getText(sourceFile) === "\"ngrx-store-freeze\"");
    });
    var removements = imports.map(function (i) {
        return new schematics_core_1.RemoveChange(sourceFile.fileName, i.getStart(sourceFile), i.getEnd());
    });
    return removements;
}
function findStoreFreezeUsagesToRemove(sourceFile) {
    var changes = [];
    ts.forEachChild(sourceFile, crawl);
    return changes;
    function crawl(node) {
        ts.forEachChild(node, crawl);
        if (!ts.isArrayLiteralExpression(node))
            return;
        var elements = node.elements.map(function (elem) { return elem.getText(sourceFile); });
        var elementsWithoutStoreFreeze = elements.filter(function (elemText) { return elemText !== 'storeFreeze'; });
        if (elements.length !== elementsWithoutStoreFreeze.length) {
            changes.push(new schematics_core_1.RemoveChange(sourceFile.fileName, node.getStart(sourceFile), node.getEnd()));
            changes.push(new schematics_core_1.InsertChange(sourceFile.fileName, node.getStart(sourceFile), "[".concat(elementsWithoutStoreFreeze.join(', '), "]")));
        }
    }
}
function findRuntimeCHecksToInsert(sourceFile) {
    var changes = [];
    ts.forEachChild(sourceFile, crawl);
    return changes;
    function crawl(node) {
        ts.forEachChild(node, crawl);
        if (!ts.isCallExpression(node))
            return;
        var expression = node.expression;
        if (!(ts.isPropertyAccessExpression(expression) &&
            expression.expression.getText(sourceFile) === 'StoreModule' &&
            expression.name.getText(sourceFile) === 'forRoot')) {
            return;
        }
        var runtimeChecks = "runtimeChecks: { strictStateImmutability: true, strictActionImmutability: true }";
        // covers StoreModule.forRoot(ROOT_REDUCERS)
        if (node.arguments.length === 1) {
            changes.push(new schematics_core_1.InsertChange(sourceFile.fileName, node.arguments[0].getEnd(), ", { ".concat(runtimeChecks, "}")));
        }
        else if (node.arguments.length === 2) {
            var storeConfig = node.arguments[1];
            if (ts.isObjectLiteralExpression(storeConfig)) {
                // covers StoreModule.forRoot(ROOT_REDUCERS, {})
                if (storeConfig.properties.length === 0) {
                    changes.push(new schematics_core_1.InsertChange(sourceFile.fileName, storeConfig.getEnd() - 1, "".concat(runtimeChecks, " ")));
                }
                else {
                    // covers StoreModule.forRoot(ROOT_REDUCERS, { metaReducers })
                    var lastProperty = storeConfig.properties[storeConfig.properties.length - 1];
                    changes.push(new schematics_core_1.InsertChange(sourceFile.fileName, lastProperty.getEnd(), ", ".concat(runtimeChecks)));
                }
            }
        }
    }
}
//# sourceMappingURL=index.js.map