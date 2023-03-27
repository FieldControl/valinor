"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertImport = exports.addModuleImportToRootModule = void 0;
const schematics_1 = require("@angular-devkit/schematics");
const change_1 = require("@schematics/angular/utility/change");
const ng_ast_utils_1 = require("@schematics/angular/utility/ng-ast-utils");
const ts = require("typescript");
const _1 = require(".");
/**
 * Import and add module to the root module.
 * @param host {Tree} The source tree.
 * @param importedModuleName {String} The name of the imported module.
 * @param importedModulePath {String} The location of the imported module.
 * @param projectName {String} The name of the project.
 */
function addModuleImportToRootModule(host, importedModuleName, importedModulePath, projectName) {
    const mainPath = (0, _1.getMainPath)(host, projectName);
    const appModulePath = (0, ng_ast_utils_1.getAppModulePath)(host, mainPath);
    addModuleImportToModule(host, appModulePath, importedModuleName, importedModulePath);
}
exports.addModuleImportToRootModule = addModuleImportToRootModule;
/**
 * Import and add module to specific module path.
 * @param host {Tree} The source tree.
 * @param moduleToImportIn {String} The location of the module to import in.
 * @param importedModuleName {String} The name of the imported module.
 * @param importedModulePath {String} The location of the imported module.
 */
function addModuleImportToModule(host, moduleToImportIn, importedModuleName, importedModulePath) {
    const moduleSource = (0, _1.getTypeScriptSourceFile)(host, moduleToImportIn);
    if (!moduleSource) {
        throw new schematics_1.SchematicsException(`Module not found: ${moduleToImportIn}`);
    }
    const changes = addImportToModule(moduleSource, importedModulePath, importedModuleName);
    const recorder = host.beginUpdate(moduleToImportIn);
    const inserted = insertImport(moduleSource, moduleToImportIn, importedModuleName, importedModulePath);
    if (inserted && inserted instanceof change_1.InsertChange) {
        recorder.insertLeft(inserted.pos, inserted.toAdd);
    }
    changes
        .filter((change) => change instanceof change_1.InsertChange)
        .forEach((change) => recorder.insertLeft(change.pos, change.toAdd));
    host.commitUpdate(recorder);
}
function addImportToModule(source, modulePath, symbolName) {
    return _addSymbolToNgModuleMetadata(source, modulePath, 'imports', symbolName);
}
function _addSymbolToNgModuleMetadata(source, ngModulePath, metadataField, expression) {
    const nodes = getDecoratorMetadata(source, 'NgModule', '@angular/core');
    let node = nodes[0];
    // Find the decorator declaration.
    if (!node) {
        return [];
    }
    // Get all the children property assignment of object literals.
    const matchingProperties = node.properties
        .filter((prop) => prop.kind == ts.SyntaxKind.PropertyAssignment)
        // Filter out every fields that's not "metadataField". Also handles string literals
        // (but not expressions).
        .filter((prop) => {
        const name = prop.name;
        switch (name.kind) {
            case ts.SyntaxKind.Identifier:
                return name.getText(source) == metadataField;
            case ts.SyntaxKind.StringLiteral:
                return name.text == metadataField;
        }
        return false;
    });
    // Get the last node of the array literal.
    if (!matchingProperties) {
        return [];
    }
    if (matchingProperties.length == 0) {
        // We haven't found the field in the metadata declaration. Insert a new field.
        const expr = node;
        let position;
        let toInsert;
        if (expr.properties.length == 0) {
            position = expr.getEnd() - 1;
            toInsert = `  ${metadataField}: [${expression}]\n`;
        }
        else {
            node = expr.properties[expr.properties.length - 1];
            position = node.getEnd();
            // Get the indentation of the last element, if any.
            const text = node.getFullText(source);
            if (text.match('^\r?\r?\n')) {
                toInsert = `,${text.match(/^\r?\n\s+/)[0]}${metadataField}: [${expression}]`;
            }
            else {
                toInsert = `, ${metadataField}: [${expression}]`;
            }
        }
        const newMetadataProperty = new change_1.InsertChange(ngModulePath, position, toInsert);
        return [newMetadataProperty];
    }
    const assignment = matchingProperties[0];
    // If it's not an array, nothing we can do really.
    if (assignment.initializer.kind !== ts.SyntaxKind.ArrayLiteralExpression) {
        return [];
    }
    const arrLiteral = assignment.initializer;
    if (arrLiteral.elements.length == 0) {
        // Forward the property.
        node = arrLiteral;
    }
    else {
        node = arrLiteral.elements;
    }
    if (!node) {
        console.log('No app module found. Please add your new class to your component.');
        return [];
    }
    const isArray = Array.isArray(node);
    if (isArray) {
        const nodeArray = node;
        const symbolsArray = nodeArray.map((node) => node.getText());
        if (symbolsArray.includes(expression)) {
            return [];
        }
        node = node[node.length - 1];
    }
    let toInsert;
    let position = node.getEnd();
    if (!isArray && node.kind == ts.SyntaxKind.ObjectLiteralExpression) {
        // We haven't found the field in the metadata declaration. Insert a new
        // field.
        const expr = node;
        if (expr.properties.length == 0) {
            position = expr.getEnd() - 1;
            toInsert = `  ${metadataField}: [${expression}]\n`;
        }
        else {
            node = expr.properties[expr.properties.length - 1];
            position = node.getEnd();
            // Get the indentation of the last element, if any.
            const text = node.getFullText(source);
            if (text.match('^\r?\r?\n')) {
                toInsert = `,${text.match(/^\r?\n\s+/)[0]}${metadataField}: [${expression}]`;
            }
            else {
                toInsert = `, ${metadataField}: [${expression}]`;
            }
        }
    }
    else if (!isArray && node.kind == ts.SyntaxKind.ArrayLiteralExpression) {
        // We found the field but it's empty. Insert it just before the `]`.
        position--;
        toInsert = `${expression}`;
    }
    else {
        // Get the indentation of the last element, if any.
        const text = node.getFullText(source);
        if (text.match(/^\r?\n/)) {
            toInsert = `,${text.match(/^\r?\n(\r?)\s+/)[0]}${expression}`;
        }
        else {
            toInsert = `, ${expression}`;
        }
    }
    const insert = new change_1.InsertChange(ngModulePath, position, toInsert);
    return [insert];
}
function getDecoratorMetadata(source, identifier, module) {
    const angularImports = findNodes(source, ts.SyntaxKind.ImportDeclaration)
        .map((node) => _angularImportsFromNode(node, source))
        .reduce((acc, current) => {
        for (const key of Object.keys(current)) {
            acc[key] = current[key];
        }
        return acc;
    }, {});
    return getSourceNodes(source)
        .filter((node) => {
        return (node.kind == ts.SyntaxKind.Decorator &&
            node.expression.kind == ts.SyntaxKind.CallExpression);
    })
        .map((node) => node.expression)
        .filter((expr) => {
        if (expr.expression.kind == ts.SyntaxKind.Identifier) {
            const id = expr.expression;
            return (id.getFullText(source) == identifier &&
                angularImports[id.getFullText(source)] === module);
        }
        else if (expr.expression.kind == ts.SyntaxKind.PropertyAccessExpression) {
            // This covers foo.NgModule when importing * as foo.
            const paExpr = expr.expression;
            // If the left expression is not an identifier, just give up at that point.
            if (paExpr.expression.kind !== ts.SyntaxKind.Identifier) {
                return false;
            }
            const id = paExpr.name.text;
            const moduleId = paExpr.expression.getText(source);
            return id === identifier && angularImports[moduleId + '.'] === module;
        }
        return false;
    })
        .filter((expr) => expr.arguments[0] &&
        expr.arguments[0].kind == ts.SyntaxKind.ObjectLiteralExpression)
        .map((expr) => expr.arguments[0]);
}
function getSourceNodes(sourceFile) {
    const nodes = [sourceFile];
    const result = [];
    while (nodes.length > 0) {
        const node = nodes.shift();
        if (node) {
            result.push(node);
            if (node.getChildCount(sourceFile) >= 0) {
                nodes.unshift(...node.getChildren());
            }
        }
    }
    return result;
}
function findNodes(node, kind, max = Infinity) {
    if (!node || max == 0) {
        return [];
    }
    const arr = [];
    const hasMatch = Array.isArray(kind)
        ? kind.includes(node.kind)
        : node.kind === kind;
    if (hasMatch) {
        arr.push(node);
        max--;
    }
    if (max > 0) {
        for (const child of node.getChildren()) {
            findNodes(child, kind, max).forEach((node) => {
                if (max > 0) {
                    arr.push(node);
                }
                max--;
            });
            if (max <= 0) {
                break;
            }
        }
    }
    return arr;
}
function _angularImportsFromNode(node, _sourceFile) {
    const ms = node.moduleSpecifier;
    let modulePath;
    switch (ms.kind) {
        case ts.SyntaxKind.StringLiteral:
            modulePath = ms.text;
            break;
        default:
            return {};
    }
    if (!modulePath.startsWith('@angular/')) {
        return {};
    }
    if (node.importClause) {
        if (node.importClause.name) {
            // This is of the form `import Name from 'path'`. Ignore.
            return {};
        }
        else if (node.importClause.namedBindings) {
            const nb = node.importClause.namedBindings;
            if (nb.kind == ts.SyntaxKind.NamespaceImport) {
                // This is of the form `import * as name from 'path'`. Return `name.`.
                return {
                    [nb.name.text + '.']: modulePath,
                };
            }
            else {
                // This is of the form `import {a,b,c} from 'path'`
                const namedImports = nb;
                return namedImports.elements
                    .map((is) => is.propertyName ? is.propertyName.text : is.name.text)
                    .reduce((acc, curr) => {
                    acc[curr] = modulePath;
                    return acc;
                }, {});
            }
        }
        return {};
    }
    else {
        // This is of the form `import 'path';`. Nothing to do.
        return {};
    }
}
function insertImport(source, fileToEdit, symbolName, fileName, isDefault = false) {
    const rootNode = source;
    const allImports = findNodes(rootNode, ts.SyntaxKind.ImportDeclaration);
    // get nodes that map to import statements from the file fileName
    const relevantImports = allImports.filter((node) => {
        // StringLiteral of the ImportDeclaration is the import file (fileName in this case).
        const importFiles = node
            .getChildren()
            .filter((child) => child.kind === ts.SyntaxKind.StringLiteral)
            .map((n) => n.text);
        return importFiles.filter((file) => file === fileName).length === 1;
    });
    if (relevantImports.length > 0) {
        let importsAsterisk = false;
        // imports from import file
        const imports = [];
        relevantImports.forEach((n) => {
            Array.prototype.push.apply(imports, findNodes(n, ts.SyntaxKind.Identifier));
            if (findNodes(n, ts.SyntaxKind.AsteriskToken).length > 0) {
                importsAsterisk = true;
            }
        });
        // if imports * from fileName, don't add symbolName
        if (importsAsterisk) {
            return null;
        }
        const importTextNodes = imports.filter((n) => n.text === symbolName);
        // insert import if it's not there
        if (importTextNodes.length === 0) {
            const fallbackPos = findNodes(relevantImports[0], ts.SyntaxKind.CloseBraceToken)[0].getStart() ||
                findNodes(relevantImports[0], ts.SyntaxKind.FromKeyword)[0].getStart();
            return insertAfterLastOccurrence(imports, `, ${symbolName}`, fileToEdit, fallbackPos);
        }
        return null;
    }
    // no such import declaration exists
    const useStrict = findNodes(rootNode, ts.SyntaxKind.StringLiteral).filter((n) => n.text === 'use strict');
    let fallbackPos = 0;
    if (useStrict.length > 0) {
        fallbackPos = useStrict[0].end;
    }
    const open = isDefault ? '' : '{ ';
    const close = isDefault ? '' : ' }';
    // if there are no imports or 'use strict' statement, insert import at beginning of file
    const insertAtBeginning = allImports.length === 0 && useStrict.length === 0;
    const separator = insertAtBeginning ? '' : ';\n';
    const toInsert = `${separator}import ${open}${symbolName}${close}` +
        ` from '${fileName}'${insertAtBeginning ? ';\n' : ''}`;
    return insertAfterLastOccurrence(allImports, toInsert, fileToEdit, fallbackPos, ts.SyntaxKind.StringLiteral);
}
exports.insertImport = insertImport;
function insertAfterLastOccurrence(nodes, toInsert, file, fallbackPos, syntaxKind) {
    // sort() has a side effect, so make a copy so that we won't overwrite the parent's object.
    let lastItem = [...nodes].sort(nodesByPosition).pop();
    if (!lastItem) {
        throw new Error();
    }
    if (syntaxKind) {
        lastItem = findNodes(lastItem, syntaxKind).sort(nodesByPosition).pop();
    }
    if (!lastItem && fallbackPos == undefined) {
        throw new Error(`tried to insert ${toInsert} as first occurrence with no fallback position`);
    }
    const lastItemPosition = lastItem ? lastItem.getEnd() : fallbackPos;
    return new change_1.InsertChange(file, lastItemPosition, toInsert);
}
function nodesByPosition(first, second) {
    return first.getStart() - second.getStart();
}
//# sourceMappingURL=ast.js.map