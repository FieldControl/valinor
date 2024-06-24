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
exports.containsProperty = exports.replaceImport = exports.insertImport = exports.addBootstrapToModule = exports.addExportToModule = exports.addProviderToComponent = exports.addProviderToModule = exports.addImportToModule = exports.addDeclarationToModule = exports.getDecoratorMetadata = exports.getContentOfKeyLiteral = exports.insertAfterLastOccurrence = exports.getSourceNodes = exports.findNodes = void 0;
/* istanbul ignore file */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var ts = require("typescript");
var change_1 = require("./change");
/**
 * Find all nodes from the AST in the subtree of node of SyntaxKind kind.
 * @param node
 * @param kind
 * @param max The maximum number of items to return.
 * @return all nodes of kind, or [] if none is found
 */
function findNodes(node, kind, max) {
    var e_1, _a;
    if (max === void 0) { max = Infinity; }
    if (!node || max == 0) {
        return [];
    }
    var arr = [];
    if (node.kind === kind) {
        arr.push(node);
        max--;
    }
    if (max > 0) {
        try {
            for (var _b = __values(node.getChildren()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var child = _c.value;
                findNodes(child, kind, max).forEach(function (node) {
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
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
    }
    return arr;
}
exports.findNodes = findNodes;
/**
 * Get all the nodes from a source.
 * @param sourceFile The source file object.
 * @returns {Observable<ts.Node>} An observable of all the nodes in the source.
 */
function getSourceNodes(sourceFile) {
    var nodes = [sourceFile];
    var result = [];
    while (nodes.length > 0) {
        var node = nodes.shift();
        if (node) {
            result.push(node);
            if (node.getChildCount(sourceFile) >= 0) {
                nodes.unshift.apply(nodes, __spreadArray([], __read(node.getChildren()), false));
            }
        }
    }
    return result;
}
exports.getSourceNodes = getSourceNodes;
/**
 * Helper for sorting nodes.
 * @return function to sort nodes in increasing order of position in sourceFile
 */
function nodesByPosition(first, second) {
    return first.pos - second.pos;
}
/**
 * Insert `toInsert` after the last occurence of `ts.SyntaxKind[nodes[i].kind]`
 * or after the last of occurence of `syntaxKind` if the last occurence is a sub child
 * of ts.SyntaxKind[nodes[i].kind] and save the changes in file.
 *
 * @param nodes insert after the last occurence of nodes
 * @param toInsert string to insert
 * @param file file to insert changes into
 * @param fallbackPos position to insert if toInsert happens to be the first occurence
 * @param syntaxKind the ts.SyntaxKind of the subchildren to insert after
 * @return Change instance
 * @throw Error if toInsert is first occurence but fall back is not set
 */
function insertAfterLastOccurrence(nodes, toInsert, file, fallbackPos, syntaxKind) {
    var lastItem = nodes.sort(nodesByPosition).pop();
    if (!lastItem) {
        throw new Error();
    }
    if (syntaxKind) {
        lastItem = findNodes(lastItem, syntaxKind).sort(nodesByPosition).pop();
    }
    if (!lastItem && fallbackPos == undefined) {
        throw new Error("tried to insert ".concat(toInsert, " as first occurence with no fallback position"));
    }
    var lastItemPosition = lastItem ? lastItem.end : fallbackPos;
    return new change_1.InsertChange(file, lastItemPosition, toInsert);
}
exports.insertAfterLastOccurrence = insertAfterLastOccurrence;
function getContentOfKeyLiteral(_source, node) {
    if (node.kind == ts.SyntaxKind.Identifier) {
        return node.text;
    }
    else if (node.kind == ts.SyntaxKind.StringLiteral) {
        return node.text;
    }
    else {
        return null;
    }
}
exports.getContentOfKeyLiteral = getContentOfKeyLiteral;
function _angularImportsFromNode(node, _sourceFile) {
    var _a;
    var ms = node.moduleSpecifier;
    var modulePath;
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
            var nb = node.importClause.namedBindings;
            if (nb.kind == ts.SyntaxKind.NamespaceImport) {
                // This is of the form `import * as name from 'path'`. Return `name.`.
                return _a = {},
                    _a[nb.name.text + '.'] = modulePath,
                    _a;
            }
            else {
                // This is of the form `import {a,b,c} from 'path'`
                var namedImports = nb;
                return namedImports.elements
                    .map(function (is) {
                    return is.propertyName ? is.propertyName.text : is.name.text;
                })
                    .reduce(function (acc, curr) {
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
function getDecoratorMetadata(source, identifier, module) {
    var angularImports = findNodes(source, ts.SyntaxKind.ImportDeclaration)
        .map(function (node) {
        return _angularImportsFromNode(node, source);
    })
        .reduce(function (acc, current) {
        var e_2, _a;
        try {
            for (var _b = __values(Object.keys(current)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var key = _c.value;
                acc[key] = current[key];
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return acc;
    }, {});
    return getSourceNodes(source)
        .filter(function (node) {
        return (node.kind == ts.SyntaxKind.Decorator &&
            node.expression.kind == ts.SyntaxKind.CallExpression);
    })
        .map(function (node) { return node.expression; })
        .filter(function (expr) {
        if (expr.expression.kind == ts.SyntaxKind.Identifier) {
            var id = expr.expression;
            return (id.getFullText(source) == identifier &&
                angularImports[id.getFullText(source)] === module);
        }
        else if (expr.expression.kind == ts.SyntaxKind.PropertyAccessExpression) {
            // This covers foo.NgModule when importing * as foo.
            var paExpr = expr.expression;
            // If the left expression is not an identifier, just give up at that point.
            if (paExpr.expression.kind !== ts.SyntaxKind.Identifier) {
                return false;
            }
            var id = paExpr.name.text;
            var moduleId = paExpr.expression.getText(source);
            return id === identifier && angularImports[moduleId + '.'] === module;
        }
        return false;
    })
        .filter(function (expr) {
        return expr.arguments[0] &&
            expr.arguments[0].kind == ts.SyntaxKind.ObjectLiteralExpression;
    })
        .map(function (expr) { return expr.arguments[0]; });
}
exports.getDecoratorMetadata = getDecoratorMetadata;
function _addSymbolToNgModuleMetadata(source, ngModulePath, metadataField, symbolName, importPath) {
    var nodes = getDecoratorMetadata(source, 'NgModule', '@angular/core');
    var node = nodes[0]; // eslint-disable-line @typescript-eslint/no-explicit-any
    // Find the decorator declaration.
    if (!node) {
        return [];
    }
    // Get all the children property assignment of object literals.
    var matchingProperties = node.properties
        .filter(function (prop) { return prop.kind == ts.SyntaxKind.PropertyAssignment; })
        // Filter out every fields that's not "metadataField". Also handles string literals
        // (but not expressions).
        .filter(function (prop) {
        var name = prop.name;
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
        var expr = node;
        var position_1;
        var toInsert_1;
        if (expr.properties.length == 0) {
            position_1 = expr.getEnd() - 1;
            toInsert_1 = "  ".concat(metadataField, ": [").concat(symbolName, "]\n");
        }
        else {
            node = expr.properties[expr.properties.length - 1];
            position_1 = node.getEnd();
            // Get the indentation of the last element, if any.
            var text = node.getFullText(source);
            var matches = text.match(/^\r?\n\s*/);
            if (matches.length > 0) {
                toInsert_1 = ",".concat(matches[0]).concat(metadataField, ": [").concat(symbolName, "]");
            }
            else {
                toInsert_1 = ", ".concat(metadataField, ": [").concat(symbolName, "]");
            }
        }
        var newMetadataProperty = new change_1.InsertChange(ngModulePath, position_1, toInsert_1);
        var newMetadataImport = insertImport(source, ngModulePath, symbolName.replace(/\..*$/, ''), importPath);
        return [newMetadataProperty, newMetadataImport];
    }
    var assignment = matchingProperties[0];
    // If it's not an array, nothing we can do really.
    if (assignment.initializer.kind !== ts.SyntaxKind.ArrayLiteralExpression) {
        return [];
    }
    var arrLiteral = assignment.initializer;
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
    if (Array.isArray(node)) {
        var nodeArray = node;
        var symbolsArray = nodeArray.map(function (node) { return node.getText(); });
        if (symbolsArray.includes(symbolName)) {
            return [];
        }
        node = node[node.length - 1];
        var effectsModule = nodeArray.find(function (node) {
            return (node.getText().includes('EffectsModule.forRoot') &&
                symbolName.includes('EffectsModule.forRoot')) ||
                (node.getText().includes('EffectsModule.forFeature') &&
                    symbolName.includes('EffectsModule.forFeature'));
        });
        if (effectsModule && symbolName.includes('EffectsModule')) {
            var effectsArgs = effectsModule.arguments.shift();
            if (effectsArgs &&
                effectsArgs.kind === ts.SyntaxKind.ArrayLiteralExpression) {
                var effectsElements = effectsArgs
                    .elements;
                var _a = __read(symbolName.match(/\[(.*)\]/), 2), effectsSymbol = _a[1];
                var epos = void 0;
                if (effectsElements.length === 0) {
                    epos = effectsArgs.getStart() + 1;
                    return [new change_1.InsertChange(ngModulePath, epos, effectsSymbol)];
                }
                else {
                    var lastEffect = effectsElements[effectsElements.length - 1];
                    epos = lastEffect.getEnd();
                    // Get the indentation of the last element, if any.
                    var text = lastEffect.getFullText(source);
                    var effectInsert = void 0;
                    if (text.match('^\r?\r?\n')) {
                        effectInsert = ",".concat(text.match(/^\r?\n\s+/)[0]).concat(effectsSymbol);
                    }
                    else {
                        effectInsert = ", ".concat(effectsSymbol);
                    }
                    return [new change_1.InsertChange(ngModulePath, epos, effectInsert)];
                }
            }
            else {
                return [];
            }
        }
    }
    var toInsert;
    var position = node.getEnd();
    if (node.kind == ts.SyntaxKind.ObjectLiteralExpression) {
        // We haven't found the field in the metadata declaration. Insert a new
        // field.
        var expr = node;
        if (expr.properties.length == 0) {
            position = expr.getEnd() - 1;
            toInsert = "  ".concat(metadataField, ": [").concat(symbolName, "]\n");
        }
        else {
            node = expr.properties[expr.properties.length - 1];
            position = node.getEnd();
            // Get the indentation of the last element, if any.
            var text = node.getFullText(source);
            if (text.match('^\r?\r?\n')) {
                toInsert = ",".concat(text.match(/^\r?\n\s+/)[0]).concat(metadataField, ": [").concat(symbolName, "]");
            }
            else {
                toInsert = ", ".concat(metadataField, ": [").concat(symbolName, "]");
            }
        }
    }
    else if (node.kind == ts.SyntaxKind.ArrayLiteralExpression) {
        // We found the field but it's empty. Insert it just before the `]`.
        position--;
        toInsert = "".concat(symbolName);
    }
    else {
        // Get the indentation of the last element, if any.
        var text = node.getFullText(source);
        if (text.match(/^\r?\n/)) {
            toInsert = ",".concat(text.match(/^\r?\n(\r?)\s+/)[0]).concat(symbolName);
        }
        else {
            toInsert = ", ".concat(symbolName);
        }
    }
    var insert = new change_1.InsertChange(ngModulePath, position, toInsert);
    var importInsert = insertImport(source, ngModulePath, symbolName.replace(/\..*$/, ''), importPath);
    return [insert, importInsert];
}
function _addSymbolToComponentMetadata(source, componentPath, metadataField, symbolName, importPath) {
    var nodes = getDecoratorMetadata(source, 'Component', '@angular/core');
    var node = nodes[0]; // eslint-disable-line @typescript-eslint/no-explicit-any
    // Find the decorator declaration.
    if (!node) {
        return [];
    }
    // Get all the children property assignment of object literals.
    var matchingProperties = node.properties
        .filter(function (prop) { return prop.kind == ts.SyntaxKind.PropertyAssignment; })
        // Filter out every fields that's not "metadataField". Also handles string literals
        // (but not expressions).
        .filter(function (prop) {
        var name = prop.name;
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
        var expr = node;
        var position_2;
        var toInsert_2;
        if (expr.properties.length == 0) {
            position_2 = expr.getEnd() - 1;
            toInsert_2 = "  ".concat(metadataField, ": [").concat(symbolName, "]\n");
        }
        else {
            node = expr.properties[expr.properties.length - 1];
            position_2 = node.getEnd();
            // Get the indentation of the last element, if any.
            var text = node.getFullText(source);
            var matches = text.match(/^\r?\n\s*/);
            if (matches.length > 0) {
                toInsert_2 = ",".concat(matches[0]).concat(metadataField, ": [").concat(symbolName, "]");
            }
            else {
                toInsert_2 = ", ".concat(metadataField, ": [").concat(symbolName, "]");
            }
        }
        var newMetadataProperty = new change_1.InsertChange(componentPath, position_2, toInsert_2);
        var newMetadataImport = insertImport(source, componentPath, symbolName.replace(/\..*$/, ''), importPath);
        return [newMetadataProperty, newMetadataImport];
    }
    var assignment = matchingProperties[0];
    // If it's not an array, nothing we can do really.
    if (assignment.initializer.kind !== ts.SyntaxKind.ArrayLiteralExpression) {
        return [];
    }
    var arrLiteral = assignment.initializer;
    if (arrLiteral.elements.length == 0) {
        // Forward the property.
        node = arrLiteral;
    }
    else {
        node = arrLiteral.elements;
    }
    if (!node) {
        console.log('No component found. Please add your new class to your component.');
        return [];
    }
    if (Array.isArray(node)) {
        var nodeArray = node;
        var symbolsArray = nodeArray.map(function (node) { return node.getText(); });
        if (symbolsArray.includes(symbolName)) {
            return [];
        }
        node = node[node.length - 1];
    }
    var toInsert;
    var position = node.getEnd();
    if (node.kind == ts.SyntaxKind.ObjectLiteralExpression) {
        // We haven't found the field in the metadata declaration. Insert a new
        // field.
        var expr = node;
        if (expr.properties.length == 0) {
            position = expr.getEnd() - 1;
            toInsert = "  ".concat(metadataField, ": [").concat(symbolName, "]\n");
        }
        else {
            node = expr.properties[expr.properties.length - 1];
            position = node.getEnd();
            // Get the indentation of the last element, if any.
            var text = node.getFullText(source);
            if (text.match('^\r?\r?\n')) {
                toInsert = ",".concat(text.match(/^\r?\n\s+/)[0]).concat(metadataField, ": [").concat(symbolName, "]");
            }
            else {
                toInsert = ", ".concat(metadataField, ": [").concat(symbolName, "]");
            }
        }
    }
    else if (node.kind == ts.SyntaxKind.ArrayLiteralExpression) {
        // We found the field but it's empty. Insert it just before the `]`.
        position--;
        toInsert = "".concat(symbolName);
    }
    else {
        // Get the indentation of the last element, if any.
        var text = node.getFullText(source);
        if (text.match(/^\r?\n/)) {
            toInsert = ",".concat(text.match(/^\r?\n(\r?)\s+/)[0]).concat(symbolName);
        }
        else {
            toInsert = ", ".concat(symbolName);
        }
    }
    var insert = new change_1.InsertChange(componentPath, position, toInsert);
    var importInsert = insertImport(source, componentPath, symbolName.replace(/\..*$/, ''), importPath);
    return [insert, importInsert];
}
/**
 * Custom function to insert a declaration (component, pipe, directive)
 * into NgModule declarations. It also imports the component.
 */
function addDeclarationToModule(source, modulePath, classifiedName, importPath) {
    return _addSymbolToNgModuleMetadata(source, modulePath, 'declarations', classifiedName, importPath);
}
exports.addDeclarationToModule = addDeclarationToModule;
/**
 * Custom function to insert a declaration (component, pipe, directive)
 * into NgModule declarations. It also imports the component.
 */
function addImportToModule(source, modulePath, classifiedName, importPath) {
    return _addSymbolToNgModuleMetadata(source, modulePath, 'imports', classifiedName, importPath);
}
exports.addImportToModule = addImportToModule;
/**
 * Custom function to insert a provider into NgModule. It also imports it.
 */
function addProviderToModule(source, modulePath, classifiedName, importPath) {
    return _addSymbolToNgModuleMetadata(source, modulePath, 'providers', classifiedName, importPath);
}
exports.addProviderToModule = addProviderToModule;
/**
 * Custom function to insert a provider into Component. It also imports it.
 */
function addProviderToComponent(source, componentPath, classifiedName, importPath) {
    return _addSymbolToComponentMetadata(source, componentPath, 'providers', classifiedName, importPath);
}
exports.addProviderToComponent = addProviderToComponent;
/**
 * Custom function to insert an export into NgModule. It also imports it.
 */
function addExportToModule(source, modulePath, classifiedName, importPath) {
    return _addSymbolToNgModuleMetadata(source, modulePath, 'exports', classifiedName, importPath);
}
exports.addExportToModule = addExportToModule;
/**
 * Custom function to insert an export into NgModule. It also imports it.
 */
function addBootstrapToModule(source, modulePath, classifiedName, importPath) {
    return _addSymbolToNgModuleMetadata(source, modulePath, 'bootstrap', classifiedName, importPath);
}
exports.addBootstrapToModule = addBootstrapToModule;
/**
 * Add Import `import { symbolName } from fileName` if the import doesn't exit
 * already. Assumes fileToEdit can be resolved and accessed.
 * @param fileToEdit (file we want to add import to)
 * @param symbolName (item to import)
 * @param fileName (path to the file)
 * @param isDefault (if true, import follows style for importing default exports)
 * @return Change
 */
function insertImport(source, fileToEdit, symbolName, fileName, isDefault) {
    if (isDefault === void 0) { isDefault = false; }
    var rootNode = source;
    var allImports = findNodes(rootNode, ts.SyntaxKind.ImportDeclaration);
    // get nodes that map to import statements from the file fileName
    var relevantImports = allImports.filter(function (node) {
        // StringLiteral of the ImportDeclaration is the import file (fileName in this case).
        var importFiles = node
            .getChildren()
            .filter(function (child) { return child.kind === ts.SyntaxKind.StringLiteral; })
            .map(function (n) { return n.text; });
        return importFiles.filter(function (file) { return file === fileName; }).length === 1;
    });
    if (relevantImports.length > 0) {
        var importsAsterisk_1 = false;
        // imports from import file
        var imports_1 = [];
        relevantImports.forEach(function (n) {
            Array.prototype.push.apply(imports_1, findNodes(n, ts.SyntaxKind.Identifier));
            if (findNodes(n, ts.SyntaxKind.AsteriskToken).length > 0) {
                importsAsterisk_1 = true;
            }
        });
        // if imports * from fileName, don't add symbolName
        if (importsAsterisk_1) {
            return new change_1.NoopChange();
        }
        var importTextNodes = imports_1.filter(function (n) { return n.text === symbolName; });
        // insert import if it's not there
        if (importTextNodes.length === 0) {
            var fallbackPos_1 = findNodes(relevantImports[0], ts.SyntaxKind.CloseBraceToken)[0].getStart() ||
                findNodes(relevantImports[0], ts.SyntaxKind.FromKeyword)[0].getStart();
            return insertAfterLastOccurrence(imports_1, ", ".concat(symbolName), fileToEdit, fallbackPos_1);
        }
        return new change_1.NoopChange();
    }
    // no such import declaration exists
    var useStrict = findNodes(rootNode, ts.SyntaxKind.StringLiteral).filter(function (n) { return n.getText() === 'use strict'; });
    var fallbackPos = 0;
    if (useStrict.length > 0) {
        fallbackPos = useStrict[0].end;
    }
    var open = isDefault ? '' : '{ ';
    var close = isDefault ? '' : ' }';
    // if there are no imports or 'use strict' statement, insert import at beginning of file
    var insertAtBeginning = allImports.length === 0 && useStrict.length === 0;
    var separator = insertAtBeginning ? '' : ';\n';
    var toInsert = "".concat(separator, "import ").concat(open).concat(symbolName).concat(close) +
        " from '".concat(fileName, "'").concat(insertAtBeginning ? ';\n' : '');
    return insertAfterLastOccurrence(allImports, toInsert, fileToEdit, fallbackPos, ts.SyntaxKind.StringLiteral);
}
exports.insertImport = insertImport;
function replaceImport(sourceFile, path, importFrom, importAsIs, importToBe) {
    var imports = sourceFile.statements
        .filter(ts.isImportDeclaration)
        .filter(function (_a) {
        var moduleSpecifier = _a.moduleSpecifier;
        return moduleSpecifier.getText(sourceFile) === "'".concat(importFrom, "'") ||
            moduleSpecifier.getText(sourceFile) === "\"".concat(importFrom, "\"");
    });
    if (imports.length === 0) {
        return [];
    }
    var importText = function (specifier) {
        if (specifier.name.text) {
            return specifier.name.text;
        }
        // if import is renamed
        if (specifier.propertyName && specifier.propertyName.text) {
            return specifier.propertyName.text;
        }
        return '';
    };
    var changes = imports.map(function (p) {
        var _a;
        var namedImports = (_a = p === null || p === void 0 ? void 0 : p.importClause) === null || _a === void 0 ? void 0 : _a.namedBindings;
        if (!namedImports) {
            return [];
        }
        var importSpecifiers = namedImports.elements;
        var isAlreadyImported = importSpecifiers
            .map(importText)
            .includes(importToBe);
        var importChanges = importSpecifiers.map(function (specifier, index) {
            var text = importText(specifier);
            // import is not the one we're looking for, can be skipped
            if (text !== importAsIs) {
                return undefined;
            }
            // identifier has not been imported, simply replace the old text with the new text
            if (!isAlreadyImported) {
                return (0, change_1.createReplaceChange)(sourceFile, specifier, importAsIs, importToBe);
            }
            var nextIdentifier = importSpecifiers[index + 1];
            // identifer is not the last, also clean up the comma
            if (nextIdentifier) {
                return (0, change_1.createRemoveChange)(sourceFile, specifier, specifier.getStart(sourceFile), nextIdentifier.getStart(sourceFile));
            }
            // there are no imports following, just remove it
            return (0, change_1.createRemoveChange)(sourceFile, specifier, specifier.getStart(sourceFile), specifier.getEnd());
        });
        return importChanges.filter(Boolean);
    });
    return changes.reduce(function (imports, curr) { return imports.concat(curr); }, []);
}
exports.replaceImport = replaceImport;
function containsProperty(objectLiteral, propertyName) {
    return (objectLiteral &&
        objectLiteral.properties.some(function (prop) {
            return ts.isPropertyAssignment(prop) &&
                ts.isIdentifier(prop.name) &&
                prop.name.text === propertyName;
        }));
}
exports.containsProperty = containsProperty;
//# sourceMappingURL=ast-utils.js.map