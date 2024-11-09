"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findBootstrapApplicationCall = exports.addFunctionalProvidersToStandaloneBootstrap = exports.addModuleImportToStandaloneBootstrap = exports.callsProvidersFunction = exports.importsProvidersFrom = void 0;
const schematics_1 = require("@angular-devkit/schematics");
const path_1 = require("path");
const typescript_1 = __importDefault(require("../third_party/github.com/Microsoft/TypeScript/lib/typescript"));
const ast_utils_1 = require("../utility/ast-utils");
const change_1 = require("../utility/change");
/**
 * Checks whether the providers from a module are being imported in a `bootstrapApplication` call.
 * @param tree File tree of the project.
 * @param filePath Path of the file in which to check.
 * @param className Class name of the module to search for.
 * @deprecated Private utility that will be removed. Use `addRootImport` or `addRootProvider` from
 * `@schematics/angular/utility` instead.
 */
function importsProvidersFrom(tree, filePath, className) {
    const sourceFile = createSourceFile(tree, filePath);
    const bootstrapCall = findBootstrapApplicationCall(sourceFile);
    const appConfig = bootstrapCall ? findAppConfig(bootstrapCall, tree, filePath) : null;
    const importProvidersFromCall = appConfig ? findImportProvidersFromCall(appConfig.node) : null;
    return !!importProvidersFromCall?.arguments.some((arg) => typescript_1.default.isIdentifier(arg) && arg.text === className);
}
exports.importsProvidersFrom = importsProvidersFrom;
/**
 * Checks whether a providers function is being called in a `bootstrapApplication` call.
 * @param tree File tree of the project.
 * @param filePath Path of the file in which to check.
 * @param functionName Name of the function to search for.
 * @deprecated Private utility that will be removed. Use `addRootImport` or `addRootProvider` from
 * `@schematics/angular/utility` instead.
 */
function callsProvidersFunction(tree, filePath, functionName) {
    const sourceFile = createSourceFile(tree, filePath);
    const bootstrapCall = findBootstrapApplicationCall(sourceFile);
    const appConfig = bootstrapCall ? findAppConfig(bootstrapCall, tree, filePath) : null;
    const providersLiteral = appConfig ? findProvidersLiteral(appConfig.node) : null;
    return !!providersLiteral?.elements.some((el) => typescript_1.default.isCallExpression(el) &&
        typescript_1.default.isIdentifier(el.expression) &&
        el.expression.text === functionName);
}
exports.callsProvidersFunction = callsProvidersFunction;
/**
 * Adds an `importProvidersFrom` call to the `bootstrapApplication` call.
 * @param tree File tree of the project.
 * @param filePath Path to the file that should be updated.
 * @param moduleName Name of the module that should be imported.
 * @param modulePath Path from which to import the module.
 * @deprecated Private utility that will be removed. Use `addRootImport` or `addRootProvider` from
 * `@schematics/angular/utility` instead.
 */
function addModuleImportToStandaloneBootstrap(tree, filePath, moduleName, modulePath) {
    const sourceFile = createSourceFile(tree, filePath);
    const bootstrapCall = findBootstrapApplicationCall(sourceFile);
    const addImports = (file, recorder) => {
        const sourceText = file.getText();
        [
            (0, ast_utils_1.insertImport)(file, sourceText, moduleName, modulePath),
            (0, ast_utils_1.insertImport)(file, sourceText, 'importProvidersFrom', '@angular/core'),
        ].forEach((change) => {
            if (change instanceof change_1.InsertChange) {
                recorder.insertLeft(change.pos, change.toAdd);
            }
        });
    };
    if (!bootstrapCall) {
        throw new schematics_1.SchematicsException(`Could not find bootstrapApplication call in ${filePath}`);
    }
    const importProvidersCall = typescript_1.default.factory.createCallExpression(typescript_1.default.factory.createIdentifier('importProvidersFrom'), [], [typescript_1.default.factory.createIdentifier(moduleName)]);
    // If there's only one argument, we have to create a new object literal.
    if (bootstrapCall.arguments.length === 1) {
        const recorder = tree.beginUpdate(filePath);
        addNewAppConfigToCall(bootstrapCall, importProvidersCall, recorder);
        addImports(sourceFile, recorder);
        tree.commitUpdate(recorder);
        return;
    }
    // If the config is a `mergeApplicationProviders` call, add another config to it.
    if (isMergeAppConfigCall(bootstrapCall.arguments[1])) {
        const recorder = tree.beginUpdate(filePath);
        addNewAppConfigToCall(bootstrapCall.arguments[1], importProvidersCall, recorder);
        addImports(sourceFile, recorder);
        tree.commitUpdate(recorder);
        return;
    }
    // Otherwise attempt to merge into the current config.
    const appConfig = findAppConfig(bootstrapCall, tree, filePath);
    if (!appConfig) {
        throw new schematics_1.SchematicsException(`Could not statically analyze config in bootstrapApplication call in ${filePath}`);
    }
    const { filePath: configFilePath, node: config } = appConfig;
    const recorder = tree.beginUpdate(configFilePath);
    const importCall = findImportProvidersFromCall(config);
    addImports(config.getSourceFile(), recorder);
    if (importCall) {
        // If there's an `importProvidersFrom` call already, add the module to it.
        recorder.insertRight(importCall.arguments[importCall.arguments.length - 1].getEnd(), `, ${moduleName}`);
    }
    else {
        const providersLiteral = findProvidersLiteral(config);
        if (providersLiteral) {
            // If there's a `providers` array, add the import to it.
            addElementToArray(providersLiteral, importProvidersCall, recorder);
        }
        else {
            // Otherwise add a `providers` array to the existing object literal.
            addProvidersToObjectLiteral(config, importProvidersCall, recorder);
        }
    }
    tree.commitUpdate(recorder);
}
exports.addModuleImportToStandaloneBootstrap = addModuleImportToStandaloneBootstrap;
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
function addFunctionalProvidersToStandaloneBootstrap(tree, filePath, functionName, importPath, args = []) {
    const sourceFile = createSourceFile(tree, filePath);
    const bootstrapCall = findBootstrapApplicationCall(sourceFile);
    const addImports = (file, recorder) => {
        const change = (0, ast_utils_1.insertImport)(file, file.getText(), functionName, importPath);
        if (change instanceof change_1.InsertChange) {
            recorder.insertLeft(change.pos, change.toAdd);
        }
    };
    if (!bootstrapCall) {
        throw new schematics_1.SchematicsException(`Could not find bootstrapApplication call in ${filePath}`);
    }
    const providersCall = typescript_1.default.factory.createCallExpression(typescript_1.default.factory.createIdentifier(functionName), undefined, args);
    // If there's only one argument, we have to create a new object literal.
    if (bootstrapCall.arguments.length === 1) {
        const recorder = tree.beginUpdate(filePath);
        addNewAppConfigToCall(bootstrapCall, providersCall, recorder);
        addImports(sourceFile, recorder);
        tree.commitUpdate(recorder);
        return filePath;
    }
    // If the config is a `mergeApplicationProviders` call, add another config to it.
    if (isMergeAppConfigCall(bootstrapCall.arguments[1])) {
        const recorder = tree.beginUpdate(filePath);
        addNewAppConfigToCall(bootstrapCall.arguments[1], providersCall, recorder);
        addImports(sourceFile, recorder);
        tree.commitUpdate(recorder);
        return filePath;
    }
    // Otherwise attempt to merge into the current config.
    const appConfig = findAppConfig(bootstrapCall, tree, filePath);
    if (!appConfig) {
        throw new schematics_1.SchematicsException(`Could not statically analyze config in bootstrapApplication call in ${filePath}`);
    }
    const { filePath: configFilePath, node: config } = appConfig;
    const recorder = tree.beginUpdate(configFilePath);
    const providersLiteral = findProvidersLiteral(config);
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
    const localName = findImportLocalName(sourceFile, 'bootstrapApplication', '@angular/platform-browser');
    if (!localName) {
        return null;
    }
    let result = null;
    sourceFile.forEachChild(function walk(node) {
        if (typescript_1.default.isCallExpression(node) &&
            typescript_1.default.isIdentifier(node.expression) &&
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
/** Find a call to `importProvidersFrom` within an application config. */
function findImportProvidersFromCall(config) {
    const importProvidersName = findImportLocalName(config.getSourceFile(), 'importProvidersFrom', '@angular/core');
    const providersLiteral = findProvidersLiteral(config);
    if (providersLiteral && importProvidersName) {
        for (const element of providersLiteral.elements) {
            // Look for an array element that calls the `importProvidersFrom` function.
            if (typescript_1.default.isCallExpression(element) &&
                typescript_1.default.isIdentifier(element.expression) &&
                element.expression.text === importProvidersName) {
                return element;
            }
        }
    }
    return null;
}
/** Finds the `providers` array literal within an application config. */
function findProvidersLiteral(config) {
    for (const prop of config.properties) {
        if (typescript_1.default.isPropertyAssignment(prop) &&
            typescript_1.default.isIdentifier(prop.name) &&
            prop.name.text === 'providers' &&
            typescript_1.default.isArrayLiteralExpression(prop.initializer)) {
            return prop.initializer;
        }
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
        const config = bootstrapCall.arguments[1];
        if (typescript_1.default.isObjectLiteralExpression(config)) {
            return { filePath, node: config };
        }
        if (typescript_1.default.isIdentifier(config)) {
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
    const sourceFile = identifier.getSourceFile();
    for (const node of sourceFile.statements) {
        // Only look at relative imports. This will break if the app uses a path
        // mapping to refer to the import, but in order to resolve those, we would
        // need knowledge about the entire program.
        if (!typescript_1.default.isImportDeclaration(node) ||
            !node.importClause?.namedBindings ||
            !typescript_1.default.isNamedImports(node.importClause.namedBindings) ||
            !typescript_1.default.isStringLiteralLike(node.moduleSpecifier) ||
            !node.moduleSpecifier.text.startsWith('.')) {
            continue;
        }
        for (const specifier of node.importClause.namedBindings.elements) {
            if (specifier.name.text !== identifier.text) {
                continue;
            }
            // Look for a variable with the imported name in the file. Note that ideally we would use
            // the type checker to resolve this, but we can't because these utilities are set up to
            // operate on individual files, not the entire program.
            const filePath = (0, path_1.join)((0, path_1.dirname)(bootstapFilePath), node.moduleSpecifier.text + '.ts');
            const importedSourceFile = createSourceFile(tree, filePath);
            const resolvedVariable = findAppConfigFromVariableName(importedSourceFile, (specifier.propertyName || specifier.name).text);
            if (resolvedVariable) {
                return { filePath, node: resolvedVariable };
            }
        }
    }
    const variableInSameFile = findAppConfigFromVariableName(sourceFile, identifier.text);
    return variableInSameFile ? { filePath: bootstapFilePath, node: variableInSameFile } : null;
}
/**
 * Finds an app config within the top-level variables of a file.
 * @param sourceFile File in which to search for the config.
 * @param variableName Name of the variable containing the config.
 */
function findAppConfigFromVariableName(sourceFile, variableName) {
    for (const node of sourceFile.statements) {
        if (typescript_1.default.isVariableStatement(node)) {
            for (const decl of node.declarationList.declarations) {
                if (typescript_1.default.isIdentifier(decl.name) &&
                    decl.name.text === variableName &&
                    decl.initializer &&
                    typescript_1.default.isObjectLiteralExpression(decl.initializer)) {
                    return decl.initializer;
                }
            }
        }
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
    for (const node of sourceFile.statements) {
        // Only look for top-level imports.
        if (!typescript_1.default.isImportDeclaration(node) ||
            !typescript_1.default.isStringLiteral(node.moduleSpecifier) ||
            node.moduleSpecifier.text !== moduleName) {
            continue;
        }
        // Filter out imports that don't have the right shape.
        if (!node.importClause ||
            !node.importClause.namedBindings ||
            !typescript_1.default.isNamedImports(node.importClause.namedBindings)) {
            continue;
        }
        // Look through the elements of the declaration for the specific import.
        for (const element of node.importClause.namedBindings.elements) {
            if ((element.propertyName || element.name).text === name) {
                // The local name is always in `name`.
                return element.name.text;
            }
        }
    }
    return null;
}
/** Creates a source file from a file path within a project. */
function createSourceFile(tree, filePath) {
    return typescript_1.default.createSourceFile(filePath, tree.readText(filePath), typescript_1.default.ScriptTarget.Latest, true);
}
/**
 * Creates a new app config object literal and adds it to a call expression as an argument.
 * @param call Call to which to add the config.
 * @param expression Expression that should inserted into the new config.
 * @param recorder Recorder to which to log the change.
 */
function addNewAppConfigToCall(call, expression, recorder) {
    const newCall = typescript_1.default.factory.updateCallExpression(call, call.expression, call.typeArguments, [
        ...call.arguments,
        typescript_1.default.factory.createObjectLiteralExpression([
            typescript_1.default.factory.createPropertyAssignment('providers', typescript_1.default.factory.createArrayLiteralExpression([expression])),
        ], true),
    ]);
    recorder.remove(call.getStart(), call.getWidth());
    recorder.insertRight(call.getStart(), typescript_1.default.createPrinter().printNode(typescript_1.default.EmitHint.Unspecified, newCall, call.getSourceFile()));
}
/**
 * Adds an element to an array literal expression.
 * @param node Array to which to add the element.
 * @param element Element to be added.
 * @param recorder Recorder to which to log the change.
 */
function addElementToArray(node, element, recorder) {
    const newLiteral = typescript_1.default.factory.updateArrayLiteralExpression(node, [...node.elements, element]);
    recorder.remove(node.getStart(), node.getWidth());
    recorder.insertRight(node.getStart(), typescript_1.default.createPrinter().printNode(typescript_1.default.EmitHint.Unspecified, newLiteral, node.getSourceFile()));
}
/**
 * Adds a `providers` property to an object literal.
 * @param node Literal to which to add the `providers`.
 * @param expression Provider that should be part of the generated `providers` array.
 * @param recorder Recorder to which to log the change.
 */
function addProvidersToObjectLiteral(node, expression, recorder) {
    const newOptionsLiteral = typescript_1.default.factory.updateObjectLiteralExpression(node, [
        ...node.properties,
        typescript_1.default.factory.createPropertyAssignment('providers', typescript_1.default.factory.createArrayLiteralExpression([expression])),
    ]);
    recorder.remove(node.getStart(), node.getWidth());
    recorder.insertRight(node.getStart(), typescript_1.default.createPrinter().printNode(typescript_1.default.EmitHint.Unspecified, newOptionsLiteral, node.getSourceFile()));
}
/** Checks whether a node is a call to `mergeApplicationConfig`. */
function isMergeAppConfigCall(node) {
    if (!typescript_1.default.isCallExpression(node)) {
        return false;
    }
    const localName = findImportLocalName(node.getSourceFile(), 'mergeApplicationConfig', '@angular/core');
    return !!localName && typescript_1.default.isIdentifier(node.expression) && node.expression.text === localName;
}
