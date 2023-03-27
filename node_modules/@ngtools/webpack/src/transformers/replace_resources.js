"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getResourceUrl = exports.replaceResources = exports.NG_COMPONENT_RESOURCE_QUERY = void 0;
const ts = __importStar(require("typescript"));
const inline_resource_1 = require("../loaders/inline-resource");
exports.NG_COMPONENT_RESOURCE_QUERY = 'ngResource';
function replaceResources(shouldTransform, getTypeChecker, inlineStyleFileExtension) {
    return (context) => {
        const typeChecker = getTypeChecker();
        const resourceImportDeclarations = [];
        const moduleKind = context.getCompilerOptions().module;
        const nodeFactory = context.factory;
        const visitNode = (node) => {
            var _a;
            if (ts.isClassDeclaration(node)) {
                const decorators = ts.getDecorators(node);
                if (!decorators || decorators.length === 0) {
                    return node;
                }
                return nodeFactory.updateClassDeclaration(node, [
                    ...decorators.map((current) => visitDecorator(nodeFactory, current, typeChecker, resourceImportDeclarations, moduleKind, inlineStyleFileExtension)),
                    ...((_a = ts.getModifiers(node)) !== null && _a !== void 0 ? _a : []),
                ], node.name, node.typeParameters, node.heritageClauses, node.members);
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
function visitDecorator(nodeFactory, node, typeChecker, resourceImportDeclarations, moduleKind, inlineStyleFileExtension) {
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
        ? visitComponentMetadata(nodeFactory, node, styleReplacements, resourceImportDeclarations, moduleKind, inlineStyleFileExtension)
        : node);
    // replace properties with updated properties
    if (styleReplacements.length > 0) {
        const styleProperty = nodeFactory.createPropertyAssignment(nodeFactory.createIdentifier('styles'), nodeFactory.createArrayLiteralExpression(styleReplacements));
        properties = nodeFactory.createNodeArray([...properties, styleProperty]);
    }
    return nodeFactory.updateDecorator(node, nodeFactory.updateCallExpression(decoratorFactory, decoratorFactory.expression, decoratorFactory.typeArguments, [nodeFactory.updateObjectLiteralExpression(objectExpression, properties)]));
}
function visitComponentMetadata(nodeFactory, node, styleReplacements, resourceImportDeclarations, moduleKind = ts.ModuleKind.ES2015, inlineStyleFileExtension) {
    if (!ts.isPropertyAssignment(node) || ts.isComputedPropertyName(node.name)) {
        return node;
    }
    const name = node.name.text;
    switch (name) {
        case 'moduleId':
            return undefined;
        case 'templateUrl':
            const url = getResourceUrl(node.initializer);
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
                    if (inlineStyleFileExtension) {
                        const data = Buffer.from(node.text).toString('base64');
                        const containingFile = node.getSourceFile().fileName;
                        // app.component.ts.css?ngResource!=!@ngtools/webpack/src/loaders/inline-resource.js?data=...!app.component.ts
                        url =
                            `${containingFile}.${inlineStyleFileExtension}?${exports.NG_COMPONENT_RESOURCE_QUERY}` +
                                `!=!${inline_resource_1.InlineAngularResourceLoaderPath}?data=${encodeURIComponent(data)}!${containingFile}`;
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
function getResourceUrl(node) {
    // only analyze strings
    if (!ts.isStringLiteral(node) && !ts.isNoSubstitutionTemplateLiteral(node)) {
        return null;
    }
    return `${/^\.?\.\//.test(node.text) ? '' : './'}${node.text}?${exports.NG_COMPONENT_RESOURCE_QUERY}`;
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
function createResourceImport(nodeFactory, url, resourceImportDeclarations, moduleKind) {
    const urlLiteral = nodeFactory.createStringLiteral(url);
    if (moduleKind < ts.ModuleKind.ES2015) {
        return nodeFactory.createCallExpression(nodeFactory.createIdentifier('require'), [], [urlLiteral]);
    }
    else {
        const importName = nodeFactory.createIdentifier(`__NG_CLI_RESOURCE__${resourceImportDeclarations.length}`);
        resourceImportDeclarations.push(nodeFactory.createImportDeclaration(undefined, nodeFactory.createImportClause(false, importName, undefined), urlLiteral));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVwbGFjZV9yZXNvdXJjZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9uZ3Rvb2xzL3dlYnBhY2svc3JjL3RyYW5zZm9ybWVycy9yZXBsYWNlX3Jlc291cmNlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVILCtDQUFpQztBQUNqQyxnRUFBNkU7QUFFaEUsUUFBQSwyQkFBMkIsR0FBRyxZQUFZLENBQUM7QUFFeEQsU0FBZ0IsZ0JBQWdCLENBQzlCLGVBQThDLEVBQzlDLGNBQW9DLEVBQ3BDLHdCQUFpQztJQUVqQyxPQUFPLENBQUMsT0FBaUMsRUFBRSxFQUFFO1FBQzNDLE1BQU0sV0FBVyxHQUFHLGNBQWMsRUFBRSxDQUFDO1FBQ3JDLE1BQU0sMEJBQTBCLEdBQTJCLEVBQUUsQ0FBQztRQUM5RCxNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxNQUFNLENBQUM7UUFDdkQsTUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQztRQUVwQyxNQUFNLFNBQVMsR0FBZSxDQUFDLElBQWEsRUFBRSxFQUFFOztZQUM5QyxJQUFJLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDL0IsTUFBTSxVQUFVLEdBQUcsRUFBRSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFFMUMsSUFBSSxDQUFDLFVBQVUsSUFBSSxVQUFVLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtvQkFDMUMsT0FBTyxJQUFJLENBQUM7aUJBQ2I7Z0JBRUQsT0FBTyxXQUFXLENBQUMsc0JBQXNCLENBQ3ZDLElBQUksRUFDSjtvQkFDRSxHQUFHLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUM1QixjQUFjLENBQ1osV0FBVyxFQUNYLE9BQU8sRUFD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SSxFQUFFLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxFQUFFO1lBQ3pDLElBQUksR0FBSSxXQUFXLENBQUMsSUFBc0IsQ0FBQyxJQUFJLENBQUM7WUFDaEQsTUFBTSxHQUFJLFdBQVcsQ0FBQyxNQUFNLENBQUMsZUFBaUMsQ0FBQyxJQUFJLENBQUM7U0FDckU7YUFBTTtZQUNMLE9BQU8sSUFBSSxDQUFDO1NBQ2I7UUFFRCxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxDQUFDO0tBQ3pCO0lBRUQsT0FBTyxJQUFJLENBQUM7QUFDZCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuaW1wb3J0IHsgSW5saW5lQW5ndWxhclJlc291cmNlTG9hZGVyUGF0aCB9IGZyb20gJy4uL2xvYWRlcnMvaW5saW5lLXJlc291cmNlJztcblxuZXhwb3J0IGNvbnN0IE5HX0NPTVBPTkVOVF9SRVNPVVJDRV9RVUVSWSA9ICduZ1Jlc291cmNlJztcblxuZXhwb3J0IGZ1bmN0aW9uIHJlcGxhY2VSZXNvdXJjZXMoXG4gIHNob3VsZFRyYW5zZm9ybTogKGZpbGVOYW1lOiBzdHJpbmcpID0+IGJvb2xlYW4sXG4gIGdldFR5cGVDaGVja2VyOiAoKSA9PiB0cy5UeXBlQ2hlY2tlcixcbiAgaW5saW5lU3R5bGVGaWxlRXh0ZW5zaW9uPzogc3RyaW5nLFxuKTogdHMuVHJhbnNmb3JtZXJGYWN0b3J5PHRzLlNvdXJjZUZpbGU+IHtcbiAgcmV0dXJuIChjb250ZXh0OiB0cy5UcmFuc2Zvcm1hdGlvbkNvbnRleHQpID0+IHtcbiAgICBjb25zdCB0eXBlQ2hlY2tlciA9IGdldFR5cGVDaGVja2VyKCk7XG4gICAgY29uc3QgcmVzb3VyY2VJbXBvcnREZWNsYXJhdGlvbnM6IHRzLkltcG9ydERlY2xhcmF0aW9uW10gPSBbXTtcbiAgICBjb25zdCBtb2R1bGVLaW5kID0gY29udGV4dC5nZXRDb21waWxlck9wdGlvbnMoKS5tb2R1bGU7XG4gICAgY29uc3Qgbm9kZUZhY3RvcnkgPSBjb250ZXh0LmZhY3Rvcnk7XG5cbiAgICBjb25zdCB2aXNpdE5vZGU6IHRzLlZpc2l0b3IgPSAobm9kZTogdHMuTm9kZSkgPT4ge1xuICAgICAgaWYgKHRzLmlzQ2xhc3NEZWNsYXJhdGlvbihub2RlKSkge1xuICAgICAgICBjb25zdCBkZWNvcmF0b3JzID0gdHMuZ2V0RGVjb3JhdG9ycyhub2RlKTtcblxuICAgICAgICBpZiAoIWRlY29yYXRvcnMgfHwgZGVjb3JhdG9ycy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICByZXR1cm4gbm9kZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBub2RlRmFjdG9yeS51cGRhdGVDbGFzc0RlY2xhcmF0aW9uKFxuICAgICAgICAgIG5vZGUsXG4gICAgICAgICAgW1xuICAgICAgICAgICAgLi4uZGVjb3JhdG9ycy5tYXAoKGN1cnJlbnQpID0+XG4gICAgICAgICAgICAgIHZpc2l0RGVjb3JhdG9yKFxuICAgICAgICAgICAgICAgIG5vZGVGYWN0b3J5LFxuICAgICAgICAgICAgICAgIGN1cnJlbnQsXG4gICAgICAgICAgICAgICAgdHlwZUNoZWNrZXIsXG4gICAgICAgICAgICAgICAgcmVzb3VyY2VJbXBvcnREZWNsYXJhdGlvbnMsXG4gICAgICAgICAgICAgICAgbW9kdWxlS2luZCxcbiAgICAgICAgICAgICAgICBpbmxpbmVTdHlsZUZpbGVFeHRlbnNpb24sXG4gICAgICAgICAgICAgICksXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgLi4uKHRzLmdldE1vZGlmaWVycyhub2RlKSA/PyBbXSksXG4gICAgICAgICAgXSxcbiAgICAgICAgICBub2RlLm5hbWUsXG4gICAgICAgICAgbm9kZS50eXBlUGFyYW1ldGVycyxcbiAgICAgICAgICBub2RlLmhlcml0YWdlQ2xhdXNlcyxcbiAgICAgICAgICBub2RlLm1lbWJlcnMsXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0cy52aXNpdEVhY2hDaGlsZChub2RlLCB2aXNpdE5vZGUsIGNvbnRleHQpO1xuICAgIH07XG5cbiAgICByZXR1cm4gKHNvdXJjZUZpbGU6IHRzLlNvdXJjZUZpbGUpID0+IHtcbiAgICAgIGlmICghc2hvdWxkVHJhbnNmb3JtKHNvdXJjZUZpbGUuZmlsZU5hbWUpKSB7XG4gICAgICAgIHJldHVybiBzb3VyY2VGaWxlO1xuICAgICAgfVxuXG4gICAgICBjb25zdCB1cGRhdGVkU291cmNlRmlsZSA9IHRzLnZpc2l0Tm9kZShzb3VyY2VGaWxlLCB2aXNpdE5vZGUpO1xuICAgICAgaWYgKHJlc291cmNlSW1wb3J0RGVjbGFyYXRpb25zLmxlbmd0aCkge1xuICAgICAgICAvLyBBZGQgcmVzb3VyY2UgaW1wb3J0c1xuICAgICAgICByZXR1cm4gY29udGV4dC5mYWN0b3J5LnVwZGF0ZVNvdXJjZUZpbGUoXG4gICAgICAgICAgdXBkYXRlZFNvdXJjZUZpbGUsXG4gICAgICAgICAgdHMuc2V0VGV4dFJhbmdlKFxuICAgICAgICAgICAgY29udGV4dC5mYWN0b3J5LmNyZWF0ZU5vZGVBcnJheShbXG4gICAgICAgICAgICAgIC4uLnJlc291cmNlSW1wb3J0RGVjbGFyYXRpb25zLFxuICAgICAgICAgICAgICAuLi51cGRhdGVkU291cmNlRmlsZS5zdGF0ZW1lbnRzLFxuICAgICAgICAgICAgXSksXG4gICAgICAgICAgICB1cGRhdGVkU291cmNlRmlsZS5zdGF0ZW1lbnRzLFxuICAgICAgICAgICksXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB1cGRhdGVkU291cmNlRmlsZTtcbiAgICB9O1xuICB9O1xufVxuXG5mdW5jdGlvbiB2aXNpdERlY29yYXRvcihcbiAgbm9kZUZhY3Rvcnk6IHRzLk5vZGVGYWN0b3J5LFxuICBub2RlOiB0cy5EZWNvcmF0b3IsXG4gIHR5cGVDaGVja2VyOiB0cy5UeXBlQ2hlY2tlcixcbiAgcmVzb3VyY2VJbXBvcnREZWNsYXJhdGlvbnM6IHRzLkltcG9ydERlY2xhcmF0aW9uW10sXG4gIG1vZHVsZUtpbmQ/OiB0cy5Nb2R1bGVLaW5kLFxuICBpbmxpbmVTdHlsZUZpbGVFeHRlbnNpb24/OiBzdHJpbmcsXG4pOiB0cy5EZWNvcmF0b3Ige1xuICBpZiAoIWlzQ29tcG9uZW50RGVjb3JhdG9yKG5vZGUsIHR5cGVDaGVja2VyKSkge1xuICAgIHJldHVybiBub2RlO1xuICB9XG5cbiAgaWYgKCF0cy5pc0NhbGxFeHByZXNzaW9uKG5vZGUuZXhwcmVzc2lvbikpIHtcbiAgICByZXR1cm4gbm9kZTtcbiAgfVxuXG4gIGNvbnN0IGRlY29yYXRvckZhY3RvcnkgPSBub2RlLmV4cHJlc3Npb247XG4gIGNvbnN0IGFyZ3MgPSBkZWNvcmF0b3JGYWN0b3J5LmFyZ3VtZW50cztcbiAgaWYgKGFyZ3MubGVuZ3RoICE9PSAxIHx8ICF0cy5pc09iamVjdExpdGVyYWxFeHByZXNzaW9uKGFyZ3NbMF0pKSB7XG4gICAgLy8gVW5zdXBwb3J0ZWQgY29tcG9uZW50IG1ldGFkYXRhXG4gICAgcmV0dXJuIG5vZGU7XG4gIH1cblxuICBjb25zdCBvYmplY3RFeHByZXNzaW9uID0gYXJnc1swXSBhcyB0cy5PYmplY3RMaXRlcmFsRXhwcmVzc2lvbjtcbiAgY29uc3Qgc3R5bGVSZXBsYWNlbWVudHM6IHRzLkV4cHJlc3Npb25bXSA9IFtdO1xuXG4gIC8vIHZpc2l0IGFsbCBwcm9wZXJ0aWVzXG4gIGxldCBwcm9wZXJ0aWVzID0gdHMudmlzaXROb2RlcyhvYmplY3RFeHByZXNzaW9uLnByb3BlcnRpZXMsIChub2RlKSA9PlxuICAgIHRzLmlzT2JqZWN0TGl0ZXJhbEVsZW1lbnRMaWtlKG5vZGUpXG4gICAgICA/IHZpc2l0Q29tcG9uZW50TWV0YWRhdGEoXG4gICAgICAgICAgbm9kZUZhY3RvcnksXG4gICAgICAgICAgbm9kZSxcbiAgICAgICAgICBzdHlsZVJlcGxhY2VtZW50cyxcbiAgICAgICAgICByZXNvdXJjZUltcG9ydERlY2xhcmF0aW9ucyxcbiAgICAgICAgICBtb2R1bGVLaW5kLFxuICAgICAgICAgIGlubGluZVN0eWxlRmlsZUV4dGVuc2lvbixcbiAgICAgICAgKVxuICAgICAgOiBub2RlLFxuICApO1xuXG4gIC8vIHJlcGxhY2UgcHJvcGVydGllcyB3aXRoIHVwZGF0ZWQgcHJvcGVydGllc1xuICBpZiAoc3R5bGVSZXBsYWNlbWVudHMubGVuZ3RoID4gMCkge1xuICAgIGNvbnN0IHN0eWxlUHJvcGVydHkgPSBub2RlRmFjdG9yeS5jcmVhdGVQcm9wZXJ0eUFzc2lnbm1lbnQoXG4gICAgICBub2RlRmFjdG9yeS5jcmVhdGVJZGVudGlmaWVyKCdzdHlsZXMnKSxcbiAgICAgIG5vZGVGYWN0b3J5LmNyZWF0ZUFycmF5TGl0ZXJhbEV4cHJlc3Npb24oc3R5bGVSZXBsYWNlbWVudHMpLFxuICAgICk7XG5cbiAgICBwcm9wZXJ0aWVzID0gbm9kZUZhY3RvcnkuY3JlYXRlTm9kZUFycmF5KFsuLi5wcm9wZXJ0aWVzLCBzdHlsZVByb3BlcnR5XSk7XG4gIH1cblxuICByZXR1cm4gbm9kZUZhY3RvcnkudXBkYXRlRGVjb3JhdG9yKFxuICAgIG5vZGUsXG4gICAgbm9kZUZhY3RvcnkudXBkYXRlQ2FsbEV4cHJlc3Npb24oXG4gICAgICBkZWNvcmF0b3JGYWN0b3J5LFxuICAgICAgZGVjb3JhdG9yRmFjdG9yeS5leHByZXNzaW9uLFxuICAgICAgZGVjb3JhdG9yRmFjdG9yeS50eXBlQXJndW1lbnRzLFxuICAgICAgW25vZGVGYWN0b3J5LnVwZGF0ZU9iamVjdExpdGVyYWxFeHByZXNzaW9uKG9iamVjdEV4cHJlc3Npb24sIHByb3BlcnRpZXMpXSxcbiAgICApLFxuICApO1xufVxuXG5mdW5jdGlvbiB2aXNpdENvbXBvbmVudE1ldGFkYXRhKFxuICBub2RlRmFjdG9yeTogdHMuTm9kZUZhY3RvcnksXG4gIG5vZGU6IHRzLk9iamVjdExpdGVyYWxFbGVtZW50TGlrZSxcbiAgc3R5bGVSZXBsYWNlbWVudHM6IHRzLkV4cHJlc3Npb25bXSxcbiAgcmVzb3VyY2VJbXBvcnREZWNsYXJhdGlvbnM6IHRzLkltcG9ydERlY2xhcmF0aW9uW10sXG4gIG1vZHVsZUtpbmQ6IHRzLk1vZHVsZUtpbmQgPSB0cy5Nb2R1bGVLaW5kLkVTMjAxNSxcbiAgaW5saW5lU3R5bGVGaWxlRXh0ZW5zaW9uPzogc3RyaW5nLFxuKTogdHMuT2JqZWN0TGl0ZXJhbEVsZW1lbnRMaWtlIHwgdW5kZWZpbmVkIHtcbiAgaWYgKCF0cy5pc1Byb3BlcnR5QXNzaWdubWVudChub2RlKSB8fCB0cy5pc0NvbXB1dGVkUHJvcGVydHlOYW1lKG5vZGUubmFtZSkpIHtcbiAgICByZXR1cm4gbm9kZTtcbiAgfVxuXG4gIGNvbnN0IG5hbWUgPSBub2RlLm5hbWUudGV4dDtcbiAgc3dpdGNoIChuYW1lKSB7XG4gICAgY2FzZSAnbW9kdWxlSWQnOlxuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcblxuICAgIGNhc2UgJ3RlbXBsYXRlVXJsJzpcbiAgICAgIGNvbnN0IHVybCA9IGdldFJlc291cmNlVXJsKG5vZGUuaW5pdGlhbGl6ZXIpO1xuICAgICAgaWYgKCF1cmwpIHtcbiAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGltcG9ydE5hbWUgPSBjcmVhdGVSZXNvdXJjZUltcG9ydChcbiAgICAgICAgbm9kZUZhY3RvcnksXG4gICAgICAgIHVybCxcbiAgICAgICAgcmVzb3VyY2VJbXBvcnREZWNsYXJhdGlvbnMsXG4gICAgICAgIG1vZHVsZUtpbmQsXG4gICAgICApO1xuICAgICAgaWYgKCFpbXBvcnROYW1lKSB7XG4gICAgICAgIHJldHVybiBub2RlO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbm9kZUZhY3RvcnkudXBkYXRlUHJvcGVydHlBc3NpZ25tZW50KFxuICAgICAgICBub2RlLFxuICAgICAgICBub2RlRmFjdG9yeS5jcmVhdGVJZGVudGlmaWVyKCd0ZW1wbGF0ZScpLFxuICAgICAgICBpbXBvcnROYW1lLFxuICAgICAgKTtcbiAgICBjYXNlICdzdHlsZXMnOlxuICAgIGNhc2UgJ3N0eWxlVXJscyc6XG4gICAgICBpZiAoIXRzLmlzQXJyYXlMaXRlcmFsRXhwcmVzc2lvbihub2RlLmluaXRpYWxpemVyKSkge1xuICAgICAgICByZXR1cm4gbm9kZTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgaXNJbmxpbmVTdHlsZSA9IG5hbWUgPT09ICdzdHlsZXMnO1xuICAgICAgY29uc3Qgc3R5bGVzID0gdHMudmlzaXROb2Rlcyhub2RlLmluaXRpYWxpemVyLmVsZW1lbnRzLCAobm9kZSkgPT4ge1xuICAgICAgICBpZiAoIXRzLmlzU3RyaW5nTGl0ZXJhbChub2RlKSAmJiAhdHMuaXNOb1N1YnN0aXR1dGlvblRlbXBsYXRlTGl0ZXJhbChub2RlKSkge1xuICAgICAgICAgIHJldHVybiBub2RlO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHVybDtcbiAgICAgICAgaWYgKGlzSW5saW5lU3R5bGUpIHtcbiAgICAgICAgICBpZiAoaW5saW5lU3R5bGVGaWxlRXh0ZW5zaW9uKSB7XG4gICAgICAgICAgICBjb25zdCBkYXRhID0gQnVmZmVyLmZyb20obm9kZS50ZXh0KS50b1N0cmluZygnYmFzZTY0Jyk7XG4gICAgICAgICAgICBjb25zdCBjb250YWluaW5nRmlsZSA9IG5vZGUuZ2V0U291cmNlRmlsZSgpLmZpbGVOYW1lO1xuICAgICAgICAgICAgLy8gYXBwLmNvbXBvbmVudC50cy5jc3M/bmdSZXNvdXJjZSE9IUBuZ3Rvb2xzL3dlYnBhY2svc3JjL2xvYWRlcnMvaW5saW5lLXJlc291cmNlLmpzP2RhdGE9Li4uIWFwcC5jb21wb25lbnQudHNcbiAgICAgICAgICAgIHVybCA9XG4gICAgICAgICAgICAgIGAke2NvbnRhaW5pbmdGaWxlfS4ke2lubGluZVN0eWxlRmlsZUV4dGVuc2lvbn0/JHtOR19DT01QT05FTlRfUkVTT1VSQ0VfUVVFUll9YCArXG4gICAgICAgICAgICAgIGAhPSEke0lubGluZUFuZ3VsYXJSZXNvdXJjZUxvYWRlclBhdGh9P2RhdGE9JHtlbmNvZGVVUklDb21wb25lbnQoXG4gICAgICAgICAgICAgICAgZGF0YSxcbiAgICAgICAgICAgICAgKX0hJHtjb250YWluaW5nRmlsZX1gO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gbm9kZUZhY3RvcnkuY3JlYXRlU3RyaW5nTGl0ZXJhbChub2RlLnRleHQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB1cmwgPSBnZXRSZXNvdXJjZVVybChub2RlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdXJsKSB7XG4gICAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gY3JlYXRlUmVzb3VyY2VJbXBvcnQobm9kZUZhY3RvcnksIHVybCwgcmVzb3VyY2VJbXBvcnREZWNsYXJhdGlvbnMsIG1vZHVsZUtpbmQpO1xuICAgICAgfSk7XG5cbiAgICAgIC8vIFN0eWxlcyBzaG91bGQgYmUgcGxhY2VkIGZpcnN0XG4gICAgICBpZiAoaXNJbmxpbmVTdHlsZSkge1xuICAgICAgICBzdHlsZVJlcGxhY2VtZW50cy51bnNoaWZ0KC4uLnN0eWxlcyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzdHlsZVJlcGxhY2VtZW50cy5wdXNoKC4uLnN0eWxlcyk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBub2RlO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRSZXNvdXJjZVVybChub2RlOiB0cy5Ob2RlKTogc3RyaW5nIHwgbnVsbCB7XG4gIC8vIG9ubHkgYW5hbHl6ZSBzdHJpbmdzXG4gIGlmICghdHMuaXNTdHJpbmdMaXRlcmFsKG5vZGUpICYmICF0cy5pc05vU3Vic3RpdHV0aW9uVGVtcGxhdGVMaXRlcmFsKG5vZGUpKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICByZXR1cm4gYCR7L15cXC4/XFwuXFwvLy50ZXN0KG5vZGUudGV4dCkgPyAnJyA6ICcuLyd9JHtub2RlLnRleHR9PyR7TkdfQ09NUE9ORU5UX1JFU09VUkNFX1FVRVJZfWA7XG59XG5cbmZ1bmN0aW9uIGlzQ29tcG9uZW50RGVjb3JhdG9yKG5vZGU6IHRzLk5vZGUsIHR5cGVDaGVja2VyOiB0cy5UeXBlQ2hlY2tlcik6IG5vZGUgaXMgdHMuRGVjb3JhdG9yIHtcbiAgaWYgKCF0cy5pc0RlY29yYXRvcihub2RlKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGNvbnN0IG9yaWdpbiA9IGdldERlY29yYXRvck9yaWdpbihub2RlLCB0eXBlQ2hlY2tlcik7XG4gIGlmIChvcmlnaW4gJiYgb3JpZ2luLm1vZHVsZSA9PT0gJ0Bhbmd1bGFyL2NvcmUnICYmIG9yaWdpbi5uYW1lID09PSAnQ29tcG9uZW50Jykge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVSZXNvdXJjZUltcG9ydChcbiAgbm9kZUZhY3Rvcnk6IHRzLk5vZGVGYWN0b3J5LFxuICB1cmw6IHN0cmluZyxcbiAgcmVzb3VyY2VJbXBvcnREZWNsYXJhdGlvbnM6IHRzLkltcG9ydERlY2xhcmF0aW9uW10sXG4gIG1vZHVsZUtpbmQ6IHRzLk1vZHVsZUtpbmQsXG4pOiB0cy5JZGVudGlmaWVyIHwgdHMuRXhwcmVzc2lvbiB7XG4gIGNvbnN0IHVybExpdGVyYWwgPSBub2RlRmFjdG9yeS5jcmVhdGVTdHJpbmdMaXRlcmFsKHVybCk7XG5cbiAgaWYgKG1vZHVsZUtpbmQgPCB0cy5Nb2R1bGVLaW5kLkVTMjAxNSkge1xuICAgIHJldHVybiBub2RlRmFjdG9yeS5jcmVhdGVDYWxsRXhwcmVzc2lvbihcbiAgICAgIG5vZGVGYWN0b3J5LmNyZWF0ZUlkZW50aWZpZXIoJ3JlcXVpcmUnKSxcbiAgICAgIFtdLFxuICAgICAgW3VybExpdGVyYWxdLFxuICAgICk7XG4gIH0gZWxzZSB7XG4gICAgY29uc3QgaW1wb3J0TmFtZSA9IG5vZGVGYWN0b3J5LmNyZWF0ZUlkZW50aWZpZXIoXG4gICAgICBgX19OR19DTElfUkVTT1VSQ0VfXyR7cmVzb3VyY2VJbXBvcnREZWNsYXJhdGlvbnMubGVuZ3RofWAsXG4gICAgKTtcbiAgICByZXNvdXJjZUltcG9ydERlY2xhcmF0aW9ucy5wdXNoKFxuICAgICAgbm9kZUZhY3RvcnkuY3JlYXRlSW1wb3J0RGVjbGFyYXRpb24oXG4gICAgICAgIHVuZGVmaW5lZCxcbiAgICAgICAgbm9kZUZhY3RvcnkuY3JlYXRlSW1wb3J0Q2xhdXNlKGZhbHNlLCBpbXBvcnROYW1lLCB1bmRlZmluZWQpLFxuICAgICAgICB1cmxMaXRlcmFsLFxuICAgICAgKSxcbiAgICApO1xuXG4gICAgcmV0dXJuIGltcG9ydE5hbWU7XG4gIH1cbn1cblxuaW50ZXJmYWNlIERlY29yYXRvck9yaWdpbiB7XG4gIG5hbWU6IHN0cmluZztcbiAgbW9kdWxlOiBzdHJpbmc7XG59XG5cbmZ1bmN0aW9uIGdldERlY29yYXRvck9yaWdpbihcbiAgZGVjb3JhdG9yOiB0cy5EZWNvcmF0b3IsXG4gIHR5cGVDaGVja2VyOiB0cy5UeXBlQ2hlY2tlcixcbik6IERlY29yYXRvck9yaWdpbiB8IG51bGwge1xuICBpZiAoIXRzLmlzQ2FsbEV4cHJlc3Npb24oZGVjb3JhdG9yLmV4cHJlc3Npb24pKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBsZXQgaWRlbnRpZmllcjogdHMuTm9kZTtcbiAgbGV0IG5hbWUgPSAnJztcblxuICBpZiAodHMuaXNQcm9wZXJ0eUFjY2Vzc0V4cHJlc3Npb24oZGVjb3JhdG9yLmV4cHJlc3Npb24uZXhwcmVzc2lvbikpIHtcbiAgICBpZGVudGlmaWVyID0gZGVjb3JhdG9yLmV4cHJlc3Npb24uZXhwcmVzc2lvbi5leHByZXNzaW9uO1xuICAgIG5hbWUgPSBkZWNvcmF0b3IuZXhwcmVzc2lvbi5leHByZXNzaW9uLm5hbWUudGV4dDtcbiAgfSBlbHNlIGlmICh0cy5pc0lkZW50aWZpZXIoZGVjb3JhdG9yLmV4cHJlc3Npb24uZXhwcmVzc2lvbikpIHtcbiAgICBpZGVudGlmaWVyID0gZGVjb3JhdG9yLmV4cHJlc3Npb24uZXhwcmVzc2lvbjtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8vIE5PVEU6IHJlc29sdmVyLmdldFJlZmVyZW5jZWRJbXBvcnREZWNsYXJhdGlvbiB3b3VsZCB3b3JrIGFzIHdlbGwgYnV0IGlzIGludGVybmFsXG4gIGNvbnN0IHN5bWJvbCA9IHR5cGVDaGVja2VyLmdldFN5bWJvbEF0TG9jYXRpb24oaWRlbnRpZmllcik7XG4gIGlmIChzeW1ib2wgJiYgc3ltYm9sLmRlY2xhcmF0aW9ucyAmJiBzeW1ib2wuZGVjbGFyYXRpb25zLmxlbmd0aCA+IDApIHtcbiAgICBjb25zdCBkZWNsYXJhdGlvbiA9IHN5bWJvbC5kZWNsYXJhdGlvbnNbMF07XG4gICAgbGV0IG1vZHVsZTogc3RyaW5nO1xuXG4gICAgaWYgKHRzLmlzSW1wb3J0U3BlY2lmaWVyKGRlY2xhcmF0aW9uKSkge1xuICAgICAgbmFtZSA9IChkZWNsYXJhdGlvbi5wcm9wZXJ0eU5hbWUgfHwgZGVjbGFyYXRpb24ubmFtZSkudGV4dDtcbiAgICAgIG1vZHVsZSA9IChkZWNsYXJhdGlvbi5wYXJlbnQucGFyZW50LnBhcmVudC5tb2R1bGVTcGVjaWZpZXIgYXMgdHMuSWRlbnRpZmllcikudGV4dDtcbiAgICB9IGVsc2UgaWYgKHRzLmlzTmFtZXNwYWNlSW1wb3J0KGRlY2xhcmF0aW9uKSkge1xuICAgICAgLy8gVXNlIHRoZSBuYW1lIGZyb20gdGhlIGRlY29yYXRvciBuYW1lc3BhY2UgcHJvcGVydHkgYWNjZXNzXG4gICAgICBtb2R1bGUgPSAoZGVjbGFyYXRpb24ucGFyZW50LnBhcmVudC5tb2R1bGVTcGVjaWZpZXIgYXMgdHMuSWRlbnRpZmllcikudGV4dDtcbiAgICB9IGVsc2UgaWYgKHRzLmlzSW1wb3J0Q2xhdXNlKGRlY2xhcmF0aW9uKSkge1xuICAgICAgbmFtZSA9IChkZWNsYXJhdGlvbi5uYW1lIGFzIHRzLklkZW50aWZpZXIpLnRleHQ7XG4gICAgICBtb2R1bGUgPSAoZGVjbGFyYXRpb24ucGFyZW50Lm1vZHVsZVNwZWNpZmllciBhcyB0cy5JZGVudGlmaWVyKS50ZXh0O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICByZXR1cm4geyBuYW1lLCBtb2R1bGUgfTtcbiAgfVxuXG4gIHJldHVybiBudWxsO1xufVxuIl19