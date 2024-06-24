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
var schematics_core_1 = require("../..//schematics-core");
function migrate() {
    return function (tree) {
        (0, schematics_core_1.visitTSSourceFiles)(tree, function (sourceFile) {
            var devtoolsImports = sourceFile.statements
                .filter(ts.isImportDeclaration)
                .filter(function (_a) {
                var moduleSpecifier = _a.moduleSpecifier;
                return moduleSpecifier.getText(sourceFile).includes('@ngrx/store-devtools');
            });
            if (devtoolsImports.length === 0) {
                return;
            }
            var changes = __spreadArray([], __read(findAndUpdateConfigs(sourceFile)), false);
            (0, schematics_core_1.commitChanges)(tree, sourceFile.fileName, changes);
        });
    };
}
function findAndUpdateConfigs(sourceFile) {
    var changes = [];
    ts.forEachChild(sourceFile, function (node) { return find(node, changes); });
    return changes;
    function find(node, changes) {
        if (ts.isPropertyAccessExpression(node) &&
            node.name.text === 'instrument' &&
            ts.isIdentifier(node.expression) &&
            node.expression.text === 'StoreDevtoolsModule' &&
            ts.isCallExpression(node.parent)) {
            if (node.parent.arguments.length) {
                var _a = __read(node.parent.arguments, 1), devtoolsConfig = _a[0];
                if (ts.isObjectLiteralExpression(devtoolsConfig)) {
                    updateConfig(sourceFile, devtoolsConfig, function (change) {
                        return changes.push(change);
                    });
                }
            }
            else {
                createDevtoolsConfig(sourceFile, node.parent, function (change) {
                    return changes.push(change);
                });
            }
        }
        if (ts.isCallExpression(node) &&
            ts.isIdentifier(node.expression) &&
            node.expression.text === 'provideStoreDevtools') {
            if (node.arguments.length) {
                var _b = __read(node.arguments, 1), devtoolsConfig = _b[0];
                if (ts.isObjectLiteralExpression(devtoolsConfig)) {
                    updateConfig(sourceFile, devtoolsConfig, function (change) {
                        return changes.push(change);
                    });
                }
            }
            else {
                createDevtoolsConfig(sourceFile, node, function (change) {
                    return changes.push(change);
                });
            }
        }
        ts.forEachChild(node, function (childNode) { return find(childNode, changes); });
    }
}
function updateConfig(sourceFile, devtoolsConfig, addChange) {
    var connectOutsideZoneProperty = devtoolsConfig.properties.find(function (p) {
        return ts.isPropertyAssignment(p) &&
            ts.isIdentifier(p.name) &&
            p.name.text === 'connectOutsideZone';
    });
    if (!connectOutsideZoneProperty) {
        addConnectInZoneProperty();
    }
    else if (ts.isPropertyAssignment(connectOutsideZoneProperty)) {
        replaceConnectOutsideZoneConfig(connectOutsideZoneProperty);
    }
    function addConnectInZoneProperty() {
        var configText = devtoolsConfig.getText(sourceFile);
        var comma = !devtoolsConfig.properties.length ||
            configText
                .substring(0, configText.length - 1)
                .trim()
                .endsWith(',')
            ? ''
            : ',';
        addChange(new schematics_core_1.InsertChange(sourceFile.fileName, devtoolsConfig.getEnd() - 1, "".concat(comma, " connectInZone: true").trim()));
    }
    function replaceConnectOutsideZoneConfig(connectOutsideZone) {
        var currentValue = connectOutsideZone.initializer
            .getText(sourceFile)
            .trim();
        addChange((0, schematics_core_1.createReplaceChange)(sourceFile, connectOutsideZone.name, 'connectOutsideZone', 'connectInZone'));
        addChange((0, schematics_core_1.createReplaceChange)(sourceFile, connectOutsideZone.initializer, currentValue, currentValue === 'true'
            ? 'false'
            : currentValue === 'false'
                ? 'true'
                : "!".concat(currentValue)));
    }
}
function createDevtoolsConfig(sourceFile, callExpression, addChange) {
    addChange(new schematics_core_1.InsertChange(sourceFile.fileName, callExpression.getEnd() - 1, "{connectInZone: true}"));
}
function default_1() {
    return (0, schematics_1.chain)([migrate()]);
}
exports.default = default_1;
//# sourceMappingURL=index.js.map