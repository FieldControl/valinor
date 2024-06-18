"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
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
var core_1 = require("@angular-devkit/core");
var schematics_1 = require("@angular-devkit/schematics");
var schematics_core_1 = require("../../schematics-core");
var META_REDUCERS = 'META_REDUCERS';
function updateMetaReducersToken() {
    return function (tree, context) {
        (0, schematics_core_1.visitTSSourceFiles)(tree, function (sourceFile) {
            var createChange = function (node) {
                return (0, schematics_core_1.createReplaceChange)(sourceFile, node, META_REDUCERS, 'USER_PROVIDED_META_REDUCERS');
            };
            var changes = [];
            changes.push.apply(changes, __spreadArray([], __read(findMetaReducersImportStatements(sourceFile, createChange, context.logger)), false));
            changes.push.apply(changes, __spreadArray([], __read(findMetaReducersAssignment(sourceFile, createChange)), false));
            return (0, schematics_core_1.commitChanges)(tree, sourceFile.fileName, changes);
        });
    };
}
function default_1() {
    return (0, schematics_1.chain)([updateMetaReducersToken()]);
}
exports.default = default_1;
function findMetaReducersImportStatements(sourceFile, createChange, logger) {
    var canRunSchematics = false;
    var metaReducerImports = sourceFile.statements
        .filter(ts.isImportDeclaration)
        .filter(isNgRxStoreImport)
        .filter(function (p) {
        canRunSchematics = Boolean(p.importClause &&
            p.importClause.namedBindings &&
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            p.importClause.namedBindings.elements);
        return canRunSchematics;
    })
        .map(function (p) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return p.importClause.namedBindings.elements.filter(isMetaReducersImportSpecifier);
    })
        .reduce(function (imports, curr) { return imports.concat(curr); }, []);
    var changes = metaReducerImports.map(createChange);
    if (!canRunSchematics && changes.length === 0) {
        logger.info(core_1.tags.stripIndent(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n      NgRx 8 Migration: Unable to run the schematics to rename `META_REDUCERS` to `USER_PROVIDED_META_REDUCERS`\n      in file '", "'.\n\n      For more info see https://ngrx.io/guide/migration/v8#meta_reducers-token.\n    "], ["\n      NgRx 8 Migration: Unable to run the schematics to rename \\`META_REDUCERS\\` to \\`USER_PROVIDED_META_REDUCERS\\`\n      in file '", "'.\n\n      For more info see https://ngrx.io/guide/migration/v8#meta_reducers-token.\n    "])), sourceFile.fileName));
    }
    return changes;
    function isNgRxStoreImport(importDeclaration) {
        return (importDeclaration.moduleSpecifier.getText(sourceFile) === "'@ngrx/store'");
    }
    function isMetaReducersImportSpecifier(importSpecifier) {
        var isImport = function () { return importSpecifier.name.text === META_REDUCERS; };
        var isRenamedImport = function () {
            return importSpecifier.propertyName &&
                importSpecifier.propertyName.text === META_REDUCERS;
        };
        return (ts.isImportSpecifier(importSpecifier) && (isImport() || isRenamedImport()));
    }
}
function findMetaReducersAssignment(sourceFile, createChange) {
    var changes = [];
    ts.forEachChild(sourceFile, function (node) { return findMetaReducers(node, changes); });
    return changes;
    function findMetaReducers(node, changes) {
        if (ts.isPropertyAssignment(node) &&
            node.initializer.getText(sourceFile) === META_REDUCERS) {
            changes.push(createChange(node.initializer));
        }
        ts.forEachChild(node, function (childNode) { return findMetaReducers(childNode, changes); });
    }
}
var templateObject_1;
//# sourceMappingURL=index.js.map