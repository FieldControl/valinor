"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
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
exports.findBootstrapApplicationCall = exports.addFunctionalProvidersToStandaloneBootstrap = exports.callsProvidersFunction = void 0;
// copied from https://github.com/angular/angular-cli/blob/17.3.x/packages/schematics/angular/private/standalone.ts
var schematics_1 = require("@angular-devkit/schematics");
var path_1 = require("path");
var ast_utils_1 = require("./ast-utils");
var change_1 = require("./change");
var ts = require("typescript");
/**
 * Checks whether a providers function is being called in a `bootstrapApplication` call.
 * @param tree File tree of the project.
 * @param filePath Path of the file in which to check.
 * @param functionName Name of the function to search for.
 * @deprecated Private utility that will be removed. Use `addRootImport` or `addRootProvider` from
 * `@schematics/angular/utility` instead.
 */
function callsProvidersFunction(tree, filePath, functionName) {
    var sourceFile = createSourceFile(tree, filePath);
    var bootstrapCall = findBootstrapApplicationCall(sourceFile);
    var appConfig = bootstrapCall
        ? findAppConfig(bootstrapCall, tree, filePath)
        : null;
    var providersLiteral = appConfig
        ? findProvidersLiteral(appConfig.node)
        : null;
    return !!(providersLiteral === null || providersLiteral === void 0 ? void 0 : providersLiteral.elements.some(function (el) {
        return ts.isCallExpression(el) &&
            ts.isIdentifier(el.expression) &&
            el.expression.text === functionName;
    }));
}
exports.callsProvidersFunction = callsProvidersFunction;
/**
 * Adds a providers function call to the `bootstrapApplication` call.
 * @param tree File tree of the project.
 * @param filePath Path to the file that should be updated.
 * @param functionName Name of the function that should be called.
 * @param importPath Path from which to import the function.
 * @param args Arguments to use when calling the function.
 * @return The file path that the provider was added to.
 * @deprecated Private utility that will be removed. Use `addRootImport` or `addRootProvider` from
 * `@schematics/angular/utility` instead.
 */
function addFunctionalProvidersToStandaloneBootstrap(tree, filePath, functionName, importPath, args) {
    if (args === void 0) { args = []; }
    var sourceFile = createSourceFile(tree, filePath);
    var bootstrapCall = findBootstrapApplicationCall(sourceFile);
    var addImports = function (file, recorder) {
        var change = (0, ast_utils_1.insertImport)(file, file.getText(), functionName, importPath);
        if (change instanceof change_1.InsertChange) {
            recorder.insertLeft(change.pos, change.toAdd);
        }
    };
    if (!bootstrapCall) {
        throw new schematics_1.SchematicsException("Could not find bootstrapApplication call in ".concat(filePath));
    }
    var providersCall = ts.factory.createCallExpression(ts.factory.createIdentifier(functionName), undefined, args);
    // If there's only one argument, we have to create a new object literal.
    if (bootstrapCall.arguments.length === 1) {
        var recorder_1 = tree.beginUpdate(filePath);
        addNewAppConfigToCall(bootstrapCall, providersCall, recorder_1);
        addImports(sourceFile, recorder_1);
        tree.commitUpdate(recorder_1);
        return filePath;
    }
    // If the config is a `mergeApplicationProviders` call, add another config to it.
    if (isMergeAppConfigCall(bootstrapCall.arguments[1])) {
        var recorder_2 = tree.beginUpdate(filePath);
        addNewAppConfigToCall(bootstrapCall.arguments[1], providersCall, recorder_2);
        addImports(sourceFile, recorder_2);
        tree.commitUpdate(recorder_2);
        return filePath;
    }
    // Otherwise attempt to merge into the current config.
    var appConfig = findAppConfig(bootstrapCall, tree, filePath);
    if (!appConfig) {
        throw new schematics_1.SchematicsException("Could not statically analyze config in bootstrapApplication call in ".concat(filePath));
    }
    var configFilePath = appConfig.filePath, config = appConfig.node;
    var recorder = tree.beginUpdate(configFilePath);
    var providersLiteral = findProvidersLiteral(config);
    addImports(config.getSourceFile(), recorder);
    if (providersLiteral) {
        // If there's a `providers` array, add the import to it.
        addElementToArray(providersLiteral, providersCall, recorder);
    }
    else {
        // Otherwise add a `providers` array to the existing object literal.
        addProvidersToObjectLiteral(config, providersCall, recorder);
    }
    tree.commitUpdate(recorder);
    return configFilePath;
}
exports.addFunctionalProvidersToStandaloneBootstrap = addFunctionalProvidersToStandaloneBootstrap;
/**
 * Finds the call to `bootstrapApplication` within a file.
 * @deprecated Private utility that will be removed. Use `addRootImport` or `addRootProvider` from
 * `@schematics/angular/utility` instead.
 */
function findBootstrapApplicationCall(sourceFile) {
    var localName = findImportLocalName(sourceFile, 'bootstrapApplication', '@angular/platform-browser');
    if (!localName) {
        return null;
    }
    var result = null;
    sourceFile.forEachChild(function walk(node) {
        if (ts.isCallExpression(node) &&
            ts.isIdentifier(node.expression) &&
            node.expression.text === localName) {
            result = node;
        }
        if (!result) {
            node.forEachChild(walk);
        }
    });
    return result;
}
exports.findBootstrapApplicationCall = findBootstrapApplicationCall;
/** Finds the `providers` array literal within an application config. */
function findProvidersLiteral(config) {
    var e_1, _a;
    try {
        for (var _b = __values(config.properties), _c = _b.next(); !_c.done; _c = _b.next()) {
            var prop = _c.value;
            if (ts.isPropertyAssignment(prop) &&
                ts.isIdentifier(prop.name) &&
                prop.name.text === 'providers' &&
                ts.isArrayLiteralExpression(prop.initializer)) {
                return prop.initializer;
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return null;
}
/**
 * Resolves the node that defines the app config from a bootstrap call.
 * @param bootstrapCall Call for which to resolve the config.
 * @param tree File tree of the project.
 * @param filePath File path of the bootstrap call.
 */
function findAppConfig(bootstrapCall, tree, filePath) {
    if (bootstrapCall.arguments.length > 1) {
        var config = bootstrapCall.arguments[1];
        if (ts.isObjectLiteralExpression(config)) {
            return { filePath: filePath, node: config };
        }
        if (ts.isIdentifier(config)) {
            return resolveAppConfigFromIdentifier(config, tree, filePath);
        }
    }
    return null;
}
/**
 * Resolves the app config from an identifier referring to it.
 * @param identifier Identifier referring to the app config.
 * @param tree File tree of the project.
 * @param bootstapFilePath Path of the bootstrap call.
 */
function resolveAppConfigFromIdentifier(identifier, tree, bootstapFilePath) {
    var e_2, _a, e_3, _b;
    var _c;
    var sourceFile = identifier.getSourceFile();
    try {
        for (var _d = __values(sourceFile.statements), _e = _d.next(); !_e.done; _e = _d.next()) {
            var node = _e.value;
            // Only look at relative imports. This will break if the app uses a path
            // mapping to refer to the import, but in order to resolve those, we would
            // need knowledge about the entire program.
            if (!ts.isImportDeclaration(node) ||
                !((_c = node.importClause) === null || _c === void 0 ? void 0 : _c.namedBindings) ||
                !ts.isNamedImports(node.importClause.namedBindings) ||
                !ts.isStringLiteralLike(node.moduleSpecifier) ||
                !node.moduleSpecifier.text.startsWith('.')) {
                continue;
            }
            try {
                for (var _f = (e_3 = void 0, __values(node.importClause.namedBindings.elements)), _g = _f.next(); !_g.done; _g = _f.next()) {
                    var specifier = _g.value;
                    if (specifier.name.text !== identifier.text) {
                        continue;
                    }
                    // Look for a variable with the imported name in the file. Note that ideally we would use
                    // the type checker to resolve this, but we can't because these utilities are set up to
                    // operate on individual files, not the entire program.
                    var filePath = (0, path_1.join)((0, path_1.dirname)(bootstapFilePath), node.moduleSpecifier.text + '.ts');
                    var importedSourceFile = createSourceFile(tree, filePath);
                    var resolvedVariable = findAppConfigFromVariableName(importedSourceFile, (specifier.propertyName || specifier.name).text);
                    if (resolvedVariable) {
                        return { filePath: filePath, node: resolvedVariable };
                    }
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (_g && !_g.done && (_b = _f.return)) _b.call(_f);
                }
                finally { if (e_3) throw e_3.error; }
            }
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (_e && !_e.done && (_a = _d.return)) _a.call(_d);
        }
        finally { if (e_2) throw e_2.error; }
    }
    var variableInSameFile = findAppConfigFromVariableName(sourceFile, identifier.text);
    return variableInSameFile
        ? { filePath: bootstapFilePath, node: variableInSameFile }
        : null;
}
/**
 * Finds an app config within the top-level variables of a file.
 * @param sourceFile File in which to search for the config.
 * @param variableName Name of the variable containing the config.
 */
function findAppConfigFromVariableName(sourceFile, variableName) {
    var e_4, _a, e_5, _b;
    try {
        for (var _c = __values(sourceFile.statements), _d = _c.next(); !_d.done; _d = _c.next()) {
            var node = _d.value;
            if (ts.isVariableStatement(node)) {
                try {
                    for (var _e = (e_5 = void 0, __values(node.declarationList.declarations)), _f = _e.next(); !_f.done; _f = _e.next()) {
                        var decl = _f.value;
                        if (ts.isIdentifier(decl.name) &&
                            decl.name.text === variableName &&
                            decl.initializer &&
                            ts.isObjectLiteralExpression(decl.initializer)) {
                            return decl.initializer;
                        }
                    }
                }
                catch (e_5_1) { e_5 = { error: e_5_1 }; }
                finally {
                    try {
                        if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                    }
                    finally { if (e_5) throw e_5.error; }
                }
            }
        }
    }
    catch (e_4_1) { e_4 = { error: e_4_1 }; }
    finally {
        try {
            if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
        }
        finally { if (e_4) throw e_4.error; }
    }
    return null;
}
/**
 * Finds the local name of an imported symbol. Could be the symbol name itself or its alias.
 * @param sourceFile File within which to search for the import.
 * @param name Actual name of the import, not its local alias.
 * @param moduleName Name of the module from which the symbol is imported.
 */
function findImportLocalName(sourceFile, name, moduleName) {
    var e_6, _a, e_7, _b;
    try {
        for (var _c = __values(sourceFile.statements), _d = _c.next(); !_d.done; _d = _c.next()) {
            var node = _d.value;
            // Only look for top-level imports.
            if (!ts.isImportDeclaration(node) ||
                !ts.isStringLiteral(node.moduleSpecifier) ||
                node.moduleSpecifier.text !== moduleName) {
                continue;
            }
            // Filter out imports that don't have the right shape.
            if (!node.importClause ||
                !node.importClause.namedBindings ||
                !ts.isNamedImports(node.importClause.namedBindings)) {
                continue;
            }
            try {
                // Look through the elements of the declaration for the specific import.
                for (var _e = (e_7 = void 0, __values(node.importClause.namedBindings.elements)), _f = _e.next(); !_f.done; _f = _e.next()) {
                    var element = _f.value;
                    if ((element.propertyName || element.name).text === name) {
                        // The local name is always in `name`.
                        return element.name.text;
                    }
                }
            }
            catch (e_7_1) { e_7 = { error: e_7_1 }; }
            finally {
                try {
                    if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                }
                finally { if (e_7) throw e_7.error; }
            }
        }
    }
    catch (e_6_1) { e_6 = { error: e_6_1 }; }
    finally {
        try {
            if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
        }
        finally { if (e_6) throw e_6.error; }
    }
    return null;
}
/** Creates a source file from a file path within a project. */
function createSourceFile(tree, filePath) {
    return ts.createSourceFile(filePath, tree.readText(filePath), ts.ScriptTarget.Latest, true);
}
/**
 * Creates a new app config object literal and adds it to a call expression as an argument.
 * @param call Call to which to add the config.
 * @param expression Expression that should inserted into the new config.
 * @param recorder Recorder to which to log the change.
 */
function addNewAppConfigToCall(call, expression, recorder) {
    var newCall = ts.factory.updateCallExpression(call, call.expression, call.typeArguments, __spreadArray(__spreadArray([], __read(call.arguments), false), [
        ts.factory.createObjectLiteralExpression([
            ts.factory.createPropertyAssignment('providers', ts.factory.createArrayLiteralExpression([expression])),
        ], true),
    ], false));
    recorder.remove(call.getStart(), call.getWidth());
    recorder.insertRight(call.getStart(), ts
        .createPrinter()
        .printNode(ts.EmitHint.Unspecified, newCall, call.getSourceFile()));
}
/**
 * Adds an element to an array literal expression.
 * @param node Array to which to add the element.
 * @param element Element to be added.
 * @param recorder Recorder to which to log the change.
 */
function addElementToArray(node, element, recorder) {
    var newLiteral = ts.factory.updateArrayLiteralExpression(node, __spreadArray(__spreadArray([], __read(node.elements), false), [
        element,
    ], false));
    recorder.remove(node.getStart(), node.getWidth());
    recorder.insertRight(node.getStart(), ts
        .createPrinter()
        .printNode(ts.EmitHint.Unspecified, newLiteral, node.getSourceFile()));
}
/**
 * Adds a `providers` property to an object literal.
 * @param node Literal to which to add the `providers`.
 * @param expression Provider that should be part of the generated `providers` array.
 * @param recorder Recorder to which to log the change.
 */
function addProvidersToObjectLiteral(node, expression, recorder) {
    var newOptionsLiteral = ts.factory.updateObjectLiteralExpression(node, __spreadArray(__spreadArray([], __read(node.properties), false), [
        ts.factory.createPropertyAssignment('providers', ts.factory.createArrayLiteralExpression([expression])),
    ], false));
    recorder.remove(node.getStart(), node.getWidth());
    recorder.insertRight(node.getStart(), ts
        .createPrinter()
        .printNode(ts.EmitHint.Unspecified, newOptionsLiteral, node.getSourceFile()));
}
/** Checks whether a node is a call to `mergeApplicationConfig`. */
function isMergeAppConfigCall(node) {
    if (!ts.isCallExpression(node)) {
        return false;
    }
    var localName = findImportLocalName(node.getSourceFile(), 'mergeApplicationConfig', '@angular/core');
    return (!!localName &&
        ts.isIdentifier(node.expression) &&
        node.expression.text === localName);
}
//# sourceMappingURL=standalone.js.map