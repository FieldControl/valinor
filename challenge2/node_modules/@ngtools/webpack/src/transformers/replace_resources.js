"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.workaroundStylePreprocessing = exports.getResourceUrl = exports.replaceResources = void 0;
const ts = require("typescript");
function replaceResources(shouldTransform, getTypeChecker, directTemplateLoading = false, inlineStyleMimeType) {
    if (inlineStyleMimeType && !/^text\/[-.\w]+$/.test(inlineStyleMimeType)) {
        throw new Error('Invalid inline style MIME type.');
    }
    return (context) => {
        const typeChecker = getTypeChecker();
        const resourceImportDeclarations = [];
        const moduleKind = context.getCompilerOptions().module;
        const nodeFactory = context.factory;
        const visitNode = (node) => {
            if (ts.isClassDeclaration(node)) {
                const decorators = ts.visitNodes(node.decorators, (node) => ts.isDecorator(node)
                    ? visitDecorator(nodeFactory, node, typeChecker, directTemplateLoading, resourceImportDeclarations, moduleKind, inlineStyleMimeType)
                    : node);
                return nodeFactory.updateClassDeclaration(node, decorators, node.modifiers, node.name, node.typeParameters, node.heritageClauses, node.members);
            }
            return ts.visitEachChild(node, visitNode, context);
        };
        return (sourceFile) => {
            if (!shouldTransform(sourceFile.fileName)) {
                return sourceFile;
            }
            const updatedSourceFile = ts.visitNode(sourceFile, visitNode);
            if (resourceImportDeclarations.length) {
                // Add resource imports
                return context.factory.updateSourceFile(updatedSourceFile, ts.setTextRange(context.factory.createNodeArray([
                    ...resourceImportDeclarations,
                    ...updatedSourceFile.statements,
                ]), updatedSourceFile.statements));
            }
            return updatedSourceFile;
        };
    };
}
exports.replaceResources = replaceResources;
function visitDecorator(nodeFactory, node, typeChecker, directTemplateLoading, resourceImportDeclarations, moduleKind, inlineStyleMimeType) {
    if (!isComponentDecorator(node, typeChecker)) {
        return node;
    }
    if (!ts.isCallExpression(node.expression)) {
        return node;
    }
    const decoratorFactory = node.expression;
    const args = decoratorFactory.arguments;
    if (args.length !== 1 || !ts.isObjectLiteralExpression(args[0])) {
        // Unsupported component metadata
        return node;
    }
    const objectExpression = args[0];
    const styleReplacements = [];
    // visit all properties
    let properties = ts.visitNodes(objectExpression.properties, (node) => ts.isObjectLiteralElementLike(node)
        ? visitComponentMetadata(nodeFactory, node, styleReplacements, directTemplateLoading, resourceImportDeclarations, moduleKind, inlineStyleMimeType)
        : node);
    // replace properties with updated properties
    if (styleReplacements.length > 0) {
        const styleProperty = nodeFactory.createPropertyAssignment(nodeFactory.createIdentifier('styles'), nodeFactory.createArrayLiteralExpression(styleReplacements));
        properties = nodeFactory.createNodeArray([...properties, styleProperty]);
    }
    return nodeFactory.updateDecorator(node, nodeFactory.updateCallExpression(decoratorFactory, decoratorFactory.expression, decoratorFactory.typeArguments, [nodeFactory.updateObjectLiteralExpression(objectExpression, properties)]));
}
function visitComponentMetadata(nodeFactory, node, styleReplacements, directTemplateLoading, resourceImportDeclarations, moduleKind, inlineStyleMimeType) {
    if (!ts.isPropertyAssignment(node) || ts.isComputedPropertyName(node.name)) {
        return node;
    }
    const name = node.name.text;
    switch (name) {
        case 'moduleId':
            return undefined;
        case 'templateUrl':
            const url = getResourceUrl(node.initializer, directTemplateLoading ? '!raw-loader!' : '');
            if (!url) {
                return node;
            }
            const importName = createResourceImport(nodeFactory, url, resourceImportDeclarations, moduleKind);
            if (!importName) {
                return node;
            }
            return nodeFactory.updatePropertyAssignment(node, nodeFactory.createIdentifier('template'), importName);
        case 'styles':
        case 'styleUrls':
            if (!ts.isArrayLiteralExpression(node.initializer)) {
                return node;
            }
            const isInlineStyle = name === 'styles';
            const styles = ts.visitNodes(node.initializer.elements, (node) => {
                if (!ts.isStringLiteral(node) && !ts.isNoSubstitutionTemplateLiteral(node)) {
                    return node;
                }
                let url;
                if (isInlineStyle) {
                    if (inlineStyleMimeType) {
                        const data = Buffer.from(node.text).toString('base64');
                        url = `data:${inlineStyleMimeType};charset=utf-8;base64,${data}`;
                    }
                    else {
                        return nodeFactory.createStringLiteral(node.text);
                    }
                }
                else {
                    url = getResourceUrl(node);
                }
                if (!url) {
                    return node;
                }
                return createResourceImport(nodeFactory, url, resourceImportDeclarations, moduleKind);
            });
            // Styles should be placed first
            if (isInlineStyle) {
                styleReplacements.unshift(...styles);
            }
            else {
                styleReplacements.push(...styles);
            }
            return undefined;
        default:
            return node;
    }
}
function getResourceUrl(node, loader = '') {
    // only analyze strings
    if (!ts.isStringLiteral(node) && !ts.isNoSubstitutionTemplateLiteral(node)) {
        return null;
    }
    return `${loader}${/^\.?\.\//.test(node.text) ? '' : './'}${node.text}`;
}
exports.getResourceUrl = getResourceUrl;
function isComponentDecorator(node, typeChecker) {
    if (!ts.isDecorator(node)) {
        return false;
    }
    const origin = getDecoratorOrigin(node, typeChecker);
    if (origin && origin.module === '@angular/core' && origin.name === 'Component') {
        return true;
    }
    return false;
}
function createResourceImport(nodeFactory, url, resourceImportDeclarations, moduleKind = ts.ModuleKind.ES2015) {
    const urlLiteral = nodeFactory.createStringLiteral(url);
    if (moduleKind < ts.ModuleKind.ES2015) {
        return nodeFactory.createPropertyAccessExpression(nodeFactory.createCallExpression(nodeFactory.createIdentifier('require'), [], [urlLiteral]), 'default');
    }
    else {
        const importName = nodeFactory.createIdentifier(`__NG_CLI_RESOURCE__${resourceImportDeclarations.length}`);
        resourceImportDeclarations.push(nodeFactory.createImportDeclaration(undefined, undefined, nodeFactory.createImportClause(false, importName, undefined), urlLiteral));
        return importName;
    }
}
function getDecoratorOrigin(decorator, typeChecker) {
    if (!ts.isCallExpression(decorator.expression)) {
        return null;
    }
    let identifier;
    let name = '';
    if (ts.isPropertyAccessExpression(decorator.expression.expression)) {
        identifier = decorator.expression.expression.expression;
        name = decorator.expression.expression.name.text;
    }
    else if (ts.isIdentifier(decorator.expression.expression)) {
        identifier = decorator.expression.expression;
    }
    else {
        return null;
    }
    // NOTE: resolver.getReferencedImportDeclaration would work as well but is internal
    const symbol = typeChecker.getSymbolAtLocation(identifier);
    if (symbol && symbol.declarations && symbol.declarations.length > 0) {
        const declaration = symbol.declarations[0];
        let module;
        if (ts.isImportSpecifier(declaration)) {
            name = (declaration.propertyName || declaration.name).text;
            module = declaration.parent.parent.parent.moduleSpecifier.text;
        }
        else if (ts.isNamespaceImport(declaration)) {
            // Use the name from the decorator namespace property access
            module = declaration.parent.parent.moduleSpecifier.text;
        }
        else if (ts.isImportClause(declaration)) {
            name = declaration.name.text;
            module = declaration.parent.moduleSpecifier.text;
        }
        else {
            return null;
        }
        return { name, module };
    }
    return null;
}
function workaroundStylePreprocessing(sourceFile) {
    const visitNode = (node) => {
        var _a;
        if (ts.isClassDeclaration(node) && ((_a = node.decorators) === null || _a === void 0 ? void 0 : _a.length)) {
            for (const decorator of node.decorators) {
                visitDecoratorWorkaround(decorator);
            }
        }
        return ts.forEachChild(node, visitNode);
    };
    ts.forEachChild(sourceFile, visitNode);
}
exports.workaroundStylePreprocessing = workaroundStylePreprocessing;
function visitDecoratorWorkaround(node) {
    if (!ts.isCallExpression(node.expression)) {
        return;
    }
    const decoratorFactory = node.expression;
    if (!ts.isIdentifier(decoratorFactory.expression) ||
        decoratorFactory.expression.text !== 'Component') {
        return;
    }
    const args = decoratorFactory.arguments;
    if (args.length !== 1 || !ts.isObjectLiteralExpression(args[0])) {
        // Unsupported component metadata
        return;
    }
    const objectExpression = args[0];
    // check if a `styles` property is present
    let hasStyles = false;
    for (const element of objectExpression.properties) {
        if (!ts.isPropertyAssignment(element) || ts.isComputedPropertyName(element.name)) {
            continue;
        }
        if (element.name.text === 'styles') {
            hasStyles = true;
            break;
        }
    }
    if (hasStyles) {
        return;
    }
    const nodeFactory = ts.factory;
    // add a `styles` property to workaround upstream compiler defect
    const emptyArray = nodeFactory.createArrayLiteralExpression();
    const stylePropertyName = nodeFactory.createIdentifier('styles');
    const styleProperty = nodeFactory.createPropertyAssignment(stylePropertyName, emptyArray);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    stylePropertyName.parent = styleProperty;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    emptyArray.parent = styleProperty;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    styleProperty.parent = objectExpression;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    objectExpression.properties = nodeFactory.createNodeArray([
        ...objectExpression.properties,
        styleProperty,
    ]);
}
