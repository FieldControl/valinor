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
exports.createJitResourceTransformer = void 0;
const typescript_1 = __importDefault(require("typescript"));
const uri_1 = require("./uri");
/**
 * Creates a TypeScript Transformer to transform Angular Component resource references into
 * static import statements. This transformer is used in Angular's JIT compilation mode to
 * support processing of component resources. When in AOT mode, the Angular AOT compiler handles
 * this processing and this transformer is not used.
 * @param getTypeChecker A function that returns a TypeScript TypeChecker instance for the program.
 * @returns A TypeScript transformer factory.
 */
function createJitResourceTransformer(getTypeChecker) {
    return (context) => {
        const typeChecker = getTypeChecker();
        const nodeFactory = context.factory;
        const resourceImportDeclarations = [];
        const visitNode = (node) => {
            var _a;
            if (typescript_1.default.isClassDeclaration(node)) {
                const decorators = typescript_1.default.getDecorators(node);
                if (!decorators || decorators.length === 0) {
                    return node;
                }
                return nodeFactory.updateClassDeclaration(node, [
                    ...decorators.map((current) => visitDecorator(nodeFactory, current, typeChecker, resourceImportDeclarations)),
                    ...((_a = typescript_1.default.getModifiers(node)) !== null && _a !== void 0 ? _a : []),
                ], node.name, node.typeParameters, node.heritageClauses, node.members);
            }
            return typescript_1.default.visitEachChild(node, visitNode, context);
        };
        return (sourceFile) => {
            const updatedSourceFile = typescript_1.default.visitEachChild(sourceFile, visitNode, context);
            if (resourceImportDeclarations.length > 0) {
                return nodeFactory.updateSourceFile(updatedSourceFile, typescript_1.default.setTextRange(nodeFactory.createNodeArray([...resourceImportDeclarations, ...updatedSourceFile.statements], updatedSourceFile.statements.hasTrailingComma), updatedSourceFile.statements), updatedSourceFile.isDeclarationFile, updatedSourceFile.referencedFiles, updatedSourceFile.typeReferenceDirectives, updatedSourceFile.hasNoDefaultLib, updatedSourceFile.libReferenceDirectives);
            }
            else {
                return updatedSourceFile;
            }
        };
    };
}
exports.createJitResourceTransformer = createJitResourceTransformer;
function visitDecorator(nodeFactory, node, typeChecker, resourceImportDeclarations) {
    const origin = getDecoratorOrigin(node, typeChecker);
    if (!origin || origin.module !== '@angular/core' || origin.name !== 'Component') {
        return node;
    }
    if (!typescript_1.default.isCallExpression(node.expression)) {
        return node;
    }
    const decoratorFactory = node.expression;
    const args = decoratorFactory.arguments;
    if (args.length !== 1 || !typescript_1.default.isObjectLiteralExpression(args[0])) {
        // Unsupported component metadata
        return node;
    }
    const objectExpression = args[0];
    const styleReplacements = [];
    // visit all properties
    let properties = typescript_1.default.visitNodes(objectExpression.properties, (node) => typescript_1.default.isObjectLiteralElementLike(node)
        ? visitComponentMetadata(nodeFactory, node, styleReplacements, resourceImportDeclarations)
        : node);
    // replace properties with updated properties
    if (styleReplacements.length > 0) {
        const styleProperty = nodeFactory.createPropertyAssignment(nodeFactory.createIdentifier('styles'), nodeFactory.createArrayLiteralExpression(styleReplacements));
        properties = nodeFactory.createNodeArray([...properties, styleProperty]);
    }
    return nodeFactory.updateDecorator(node, nodeFactory.updateCallExpression(decoratorFactory, decoratorFactory.expression, decoratorFactory.typeArguments, [nodeFactory.updateObjectLiteralExpression(objectExpression, properties)]));
}
function visitComponentMetadata(nodeFactory, node, styleReplacements, resourceImportDeclarations) {
    if (!typescript_1.default.isPropertyAssignment(node) || typescript_1.default.isComputedPropertyName(node.name)) {
        return node;
    }
    switch (node.name.text) {
        case 'templateUrl':
            // Only analyze string literals
            if (!typescript_1.default.isStringLiteral(node.initializer) &&
                !typescript_1.default.isNoSubstitutionTemplateLiteral(node.initializer)) {
                return node;
            }
            const url = node.initializer.text;
            if (!url) {
                return node;
            }
            return nodeFactory.updatePropertyAssignment(node, nodeFactory.createIdentifier('template'), createResourceImport(nodeFactory, (0, uri_1.generateJitFileUri)(url, 'template'), resourceImportDeclarations));
        case 'styles':
            if (!typescript_1.default.isArrayLiteralExpression(node.initializer)) {
                return node;
            }
            const inlineStyles = typescript_1.default.visitNodes(node.initializer.elements, (node) => {
                if (!typescript_1.default.isStringLiteral(node) && !typescript_1.default.isNoSubstitutionTemplateLiteral(node)) {
                    return node;
                }
                const contents = node.text;
                if (!contents) {
                    // An empty inline style is equivalent to not having a style element
                    return undefined;
                }
                return createResourceImport(nodeFactory, (0, uri_1.generateJitInlineUri)(contents, 'style'), resourceImportDeclarations);
            });
            // Inline styles should be placed first
            styleReplacements.unshift(...inlineStyles);
            // The inline styles will be added afterwards in combination with any external styles
            return undefined;
        case 'styleUrls':
            if (!typescript_1.default.isArrayLiteralExpression(node.initializer)) {
                return node;
            }
            const externalStyles = typescript_1.default.visitNodes(node.initializer.elements, (node) => {
                if (!typescript_1.default.isStringLiteral(node) && !typescript_1.default.isNoSubstitutionTemplateLiteral(node)) {
                    return node;
                }
                const url = node.text;
                if (!url) {
                    return node;
                }
                return createResourceImport(nodeFactory, (0, uri_1.generateJitFileUri)(url, 'style'), resourceImportDeclarations);
            });
            // External styles are applied after any inline styles
            styleReplacements.push(...externalStyles);
            // The external styles will be added afterwards in combination with any inline styles
            return undefined;
        default:
            // All other elements are passed through
            return node;
    }
}
function createResourceImport(nodeFactory, url, resourceImportDeclarations) {
    const urlLiteral = nodeFactory.createStringLiteral(url);
    const importName = nodeFactory.createIdentifier(`__NG_CLI_RESOURCE__${resourceImportDeclarations.length}`);
    resourceImportDeclarations.push(nodeFactory.createImportDeclaration(undefined, nodeFactory.createImportClause(false, importName, undefined), urlLiteral));
    return importName;
}
function getDecoratorOrigin(decorator, typeChecker) {
    if (!typescript_1.default.isCallExpression(decorator.expression)) {
        return null;
    }
    let identifier;
    let name = '';
    if (typescript_1.default.isPropertyAccessExpression(decorator.expression.expression)) {
        identifier = decorator.expression.expression.expression;
        name = decorator.expression.expression.name.text;
    }
    else if (typescript_1.default.isIdentifier(decorator.expression.expression)) {
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
        if (typescript_1.default.isImportSpecifier(declaration)) {
            name = (declaration.propertyName || declaration.name).text;
            module = declaration.parent.parent.parent.moduleSpecifier.text;
        }
        else if (typescript_1.default.isNamespaceImport(declaration)) {
            // Use the name from the decorator namespace property access
            module = declaration.parent.parent.moduleSpecifier.text;
        }
        else if (typescript_1.default.isImportClause(declaration)) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaml0LXJlc291cmNlLXRyYW5zZm9ybWVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvYW5ndWxhcl9kZXZraXQvYnVpbGRfYW5ndWxhci9zcmMvYnVpbGRlcnMvYnJvd3Nlci1lc2J1aWxkL2FuZ3VsYXIvaml0LXJlc291cmNlLXRyYW5zZm9ybWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7Ozs7OztBQUVILDREQUE0QjtBQUM1QiwrQkFBaUU7QUFFakU7Ozs7Ozs7R0FPRztBQUNILFNBQWdCLDRCQUE0QixDQUMxQyxjQUFvQztJQUVwQyxPQUFPLENBQUMsT0FBaUMsRUFBRSxFQUFFO1FBQzNDLE1BQU0sV0FBVyxHQUFHLGNBQWMsRUFBRSxDQUFDO1FBQ3JDLE1BQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUM7UUFDcEMsTUFBTSwwQkFBMEIsR0FBMkIsRUFBRSxDQUFDO1FBRTlELE1BQU0sU0FBUyxHQUFlLENBQUMsSUFBYSxFQUFFLEVBQUU7O1lBQzlDLElBQUksb0JBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDL0IsTUFBTSxVQUFVLEdBQUcsb0JBQUUsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBRTFDLElBQUksQ0FBQyxVQUFVLElBQUksVUFBVSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7b0JBQzFDLE9BQU8sSUFBSSxDQUFDO2lCQUNiO2dCQUVELE9BQU8sV0FBVyxDQUFDLHNCQUFzQixDQUN2QyxJQUFJLEVBQ0o7b0JBQ0UsR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FDNUIsY0FBYyxDQUFDLFdBQVcsRUFBRSxPQUFPLEVBQUUsV0FBVyxFQUFFLDBCQUEwQixDQUFDLENBQzlFO29CQUNELEdBQUcsQ0FBQyxNQUFBLG9CQUFFLENBQUMsWUFB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QUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLGVBQW9DLENBQUMsSUFBSSxDQUFDO1NBQ3RGO2FBQU0sSUFBSSxvQkFBRSxDQUFDLGlCQUFpQixDQUFDLFdBQVcsQ0FBQyxFQUFFO1lBQzVDLDREQUE0RDtZQUM1RCxNQUFNLEdBQUksV0FBVyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsZUFBb0MsQ0FBQyxJQUFJLENBQUM7U0FDL0U7YUFBTSxJQUFJLG9CQUFFLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxFQUFFO1lBQ3pDLElBQUksR0FBSSxXQUFXLENBQUMsSUFBc0IsQ0FBQyxJQUFJLENBQUM7WUFDaEQsTUFBTSxHQUFJLFdBQVcsQ0FBQyxNQUFNLENBQUMsZUFBb0MsQ0FBQyxJQUFJLENBQUM7U0FDeEU7YUFBTTtZQUNMLE9BQU8sSUFBSSxDQUFDO1NBQ2I7UUFFRCxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxDQUFDO0tBQ3pCO0lBRUQsT0FBTyxJQUFJLENBQUM7QUFDZCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB0cyBmcm9tICd0eXBlc2NyaXB0JztcbmltcG9ydCB7IGdlbmVyYXRlSml0RmlsZVVyaSwgZ2VuZXJhdGVKaXRJbmxpbmVVcmkgfSBmcm9tICcuL3VyaSc7XG5cbi8qKlxuICogQ3JlYXRlcyBhIFR5cGVTY3JpcHQgVHJhbnNmb3JtZXIgdG8gdHJhbnNmb3JtIEFuZ3VsYXIgQ29tcG9uZW50IHJlc291cmNlIHJlZmVyZW5jZXMgaW50b1xuICogc3RhdGljIGltcG9ydCBzdGF0ZW1lbnRzLiBUaGlzIHRyYW5zZm9ybWVyIGlzIHVzZWQgaW4gQW5ndWxhcidzIEpJVCBjb21waWxhdGlvbiBtb2RlIHRvXG4gKiBzdXBwb3J0IHByb2Nlc3Npbmcgb2YgY29tcG9uZW50IHJlc291cmNlcy4gV2hlbiBpbiBBT1QgbW9kZSwgdGhlIEFuZ3VsYXIgQU9UIGNvbXBpbGVyIGhhbmRsZXNcbiAqIHRoaXMgcHJvY2Vzc2luZyBhbmQgdGhpcyB0cmFuc2Zvcm1lciBpcyBub3QgdXNlZC5cbiAqIEBwYXJhbSBnZXRUeXBlQ2hlY2tlciBBIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhIFR5cGVTY3JpcHQgVHlwZUNoZWNrZXIgaW5zdGFuY2UgZm9yIHRoZSBwcm9ncmFtLlxuICogQHJldHVybnMgQSBUeXBlU2NyaXB0IHRyYW5zZm9ybWVyIGZhY3RvcnkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVKaXRSZXNvdXJjZVRyYW5zZm9ybWVyKFxuICBnZXRUeXBlQ2hlY2tlcjogKCkgPT4gdHMuVHlwZUNoZWNrZXIsXG4pOiB0cy5UcmFuc2Zvcm1lckZhY3Rvcnk8dHMuU291cmNlRmlsZT4ge1xuICByZXR1cm4gKGNvbnRleHQ6IHRzLlRyYW5zZm9ybWF0aW9uQ29udGV4dCkgPT4ge1xuICAgIGNvbnN0IHR5cGVDaGVja2VyID0gZ2V0VHlwZUNoZWNrZXIoKTtcbiAgICBjb25zdCBub2RlRmFjdG9yeSA9IGNvbnRleHQuZmFjdG9yeTtcbiAgICBjb25zdCByZXNvdXJjZUltcG9ydERlY2xhcmF0aW9uczogdHMuSW1wb3J0RGVjbGFyYXRpb25bXSA9IFtdO1xuXG4gICAgY29uc3QgdmlzaXROb2RlOiB0cy5WaXNpdG9yID0gKG5vZGU6IHRzLk5vZGUpID0+IHtcbiAgICAgIGlmICh0cy5pc0NsYXNzRGVjbGFyYXRpb24obm9kZSkpIHtcbiAgICAgICAgY29uc3QgZGVjb3JhdG9ycyA9IHRzLmdldERlY29yYXRvcnMobm9kZSk7XG5cbiAgICAgICAgaWYgKCFkZWNvcmF0b3JzIHx8IGRlY29yYXRvcnMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbm9kZUZhY3RvcnkudXBkYXRlQ2xhc3NEZWNsYXJhdGlvbihcbiAgICAgICAgICBub2RlLFxuICAgICAgICAgIFtcbiAgICAgICAgICAgIC4uLmRlY29yYXRvcnMubWFwKChjdXJyZW50KSA9PlxuICAgICAgICAgICAgICB2aXNpdERlY29yYXRvcihub2RlRmFjdG9yeSwgY3VycmVudCwgdHlwZUNoZWNrZXIsIHJlc291cmNlSW1wb3J0RGVjbGFyYXRpb25zKSxcbiAgICAgICAgICAgICksXG4gICAgICAgICAgICAuLi4odHMuZ2V0TW9kaWZpZXJzKG5vZGUpID8/IFtdKSxcbiAgICAgICAgICBdLFxuICAgICAgICAgIG5vZGUubmFtZSxcbiAgICAgICAgICBub2RlLnR5cGVQYXJhbWV0ZXJzLFxuICAgICAgICAgIG5vZGUuaGVyaXRhZ2VDbGF1c2VzLFxuICAgICAgICAgIG5vZGUubWVtYmVycyxcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRzLnZpc2l0RWFjaENoaWxkKG5vZGUsIHZpc2l0Tm9kZSwgY29udGV4dCk7XG4gICAgfTtcblxuICAgIHJldHVybiAoc291cmNlRmlsZSkgPT4ge1xuICAgICAgY29uc3QgdXBkYXRlZFNvdXJjZUZpbGUgPSB0cy52aXNpdEVhY2hDaGlsZChzb3VyY2VGaWxlLCB2aXNpdE5vZGUsIGNvbnRleHQpO1xuXG4gICAgICBpZiAocmVzb3VyY2VJbXBvcnREZWNsYXJhdGlvbnMubGVuZ3RoID4gMCkge1xuICAgICAgICByZXR1cm4gbm9kZUZhY3RvcnkudXBkYXRlU291cmNlRmlsZShcbiAgICAgICAgICB1cGRhdGVkU291cmNlRmlsZSxcbiAgICAgICAgICB0cy5zZXRUZXh0UmFuZ2UoXG4gICAgICAgICAgICBub2RlRmFjdG9yeS5jcmVhdGVOb2RlQXJyYXkoXG4gICAgICAgICAgICAgIFsuLi5yZXNvdXJjZUltcG9ydERlY2xhcmF0aW9ucywgLi4udXBkYXRlZFNvdXJjZUZpbGUuc3RhdGVtZW50c10sXG4gICAgICAgICAgICAgIHVwZGF0ZWRTb3VyY2VGaWxlLnN0YXRlbWVudHMuaGFzVHJhaWxpbmdDb21tYSxcbiAgICAgICAgICAgICksXG4gICAgICAgICAgICB1cGRhdGVkU291cmNlRmlsZS5zdGF0ZW1lbnRzLFxuICAgICAgICAgICksXG4gICAgICAgICAgdXBkYXRlZFNvdXJjZUZpbGUuaXNEZWNsYXJhdGlvbkZpbGUsXG4gICAgICAgICAgdXBkYXRlZFNvdXJjZUZpbGUucmVmZXJlbmNlZEZpbGVzLFxuICAgICAgICAgIHVwZGF0ZWRTb3VyY2VGaWxlLnR5cGVSZWZlcmVuY2VEaXJlY3RpdmVzLFxuICAgICAgICAgIHVwZGF0ZWRTb3VyY2VGaWxlLmhhc05vRGVmYXVsdExpYixcbiAgICAgICAgICB1cGRhdGVkU291cmNlRmlsZS5saWJSZWZlcmVuY2VEaXJlY3RpdmVzLFxuICAgICAgICApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHVwZGF0ZWRTb3VyY2VGaWxlO1xuICAgICAgfVxuICAgIH07XG4gIH07XG59XG5cbmZ1bmN0aW9uIHZpc2l0RGVjb3JhdG9yKFxuICBub2RlRmFjdG9yeTogdHMuTm9kZUZhY3RvcnksXG4gIG5vZGU6IHRzLkRlY29yYXRvcixcbiAgdHlwZUNoZWNrZXI6IHRzLlR5cGVDaGVja2VyLFxuICByZXNvdXJjZUltcG9ydERlY2xhcmF0aW9uczogdHMuSW1wb3J0RGVjbGFyYXRpb25bXSxcbik6IHRzLkRlY29yYXRvciB7XG4gIGNvbnN0IG9yaWdpbiA9IGdldERlY29yYXRvck9yaWdpbihub2RlLCB0eXBlQ2hlY2tlcik7XG4gIGlmICghb3JpZ2luIHx8IG9yaWdpbi5tb2R1bGUgIT09ICdAYW5ndWxhci9jb3JlJyB8fCBvcmlnaW4ubmFtZSAhPT0gJ0NvbXBvbmVudCcpIHtcbiAgICByZXR1cm4gbm9kZTtcbiAgfVxuXG4gIGlmICghdHMuaXNDYWxsRXhwcmVzc2lvbihub2RlLmV4cHJlc3Npb24pKSB7XG4gICAgcmV0dXJuIG5vZGU7XG4gIH1cblxuICBjb25zdCBkZWNvcmF0b3JGYWN0b3J5ID0gbm9kZS5leHByZXNzaW9uO1xuICBjb25zdCBhcmdzID0gZGVjb3JhdG9yRmFjdG9yeS5hcmd1bWVudHM7XG4gIGlmIChhcmdzLmxlbmd0aCAhPT0gMSB8fCAhdHMuaXNPYmplY3RMaXRlcmFsRXhwcmVzc2lvbihhcmdzWzBdKSkge1xuICAgIC8vIFVuc3VwcG9ydGVkIGNvbXBvbmVudCBtZXRhZGF0YVxuICAgIHJldHVybiBub2RlO1xuICB9XG5cbiAgY29uc3Qgb2JqZWN0RXhwcmVzc2lvbiA9IGFyZ3NbMF0gYXMgdHMuT2JqZWN0TGl0ZXJhbEV4cHJlc3Npb247XG4gIGNvbnN0IHN0eWxlUmVwbGFjZW1lbnRzOiB0cy5FeHByZXNzaW9uW10gPSBbXTtcblxuICAvLyB2aXNpdCBhbGwgcHJvcGVydGllc1xuICBsZXQgcHJvcGVydGllcyA9IHRzLnZpc2l0Tm9kZXMob2JqZWN0RXhwcmVzc2lvbi5wcm9wZXJ0aWVzLCAobm9kZSkgPT5cbiAgICB0cy5pc09iamVjdExpdGVyYWxFbGVtZW50TGlrZShub2RlKVxuICAgICAgPyB2aXNpdENvbXBvbmVudE1ldGFkYXRhKG5vZGVGYWN0b3J5LCBub2RlLCBzdHlsZVJlcGxhY2VtZW50cywgcmVzb3VyY2VJbXBvcnREZWNsYXJhdGlvbnMpXG4gICAgICA6IG5vZGUsXG4gICk7XG5cbiAgLy8gcmVwbGFjZSBwcm9wZXJ0aWVzIHdpdGggdXBkYXRlZCBwcm9wZXJ0aWVzXG4gIGlmIChzdHlsZVJlcGxhY2VtZW50cy5sZW5ndGggPiAwKSB7XG4gICAgY29uc3Qgc3R5bGVQcm9wZXJ0eSA9IG5vZGVGYWN0b3J5LmNyZWF0ZVByb3BlcnR5QXNzaWdubWVudChcbiAgICAgIG5vZGVGYWN0b3J5LmNyZWF0ZUlkZW50aWZpZXIoJ3N0eWxlcycpLFxuICAgICAgbm9kZUZhY3RvcnkuY3JlYXRlQXJyYXlMaXRlcmFsRXhwcmVzc2lvbihzdHlsZVJlcGxhY2VtZW50cyksXG4gICAgKTtcblxuICAgIHByb3BlcnRpZXMgPSBub2RlRmFjdG9yeS5jcmVhdGVOb2RlQXJyYXkoWy4uLnByb3BlcnRpZXMsIHN0eWxlUHJvcGVydHldKTtcbiAgfVxuXG4gIHJldHVybiBub2RlRmFjdG9yeS51cGRhdGVEZWNvcmF0b3IoXG4gICAgbm9kZSxcbiAgICBub2RlRmFjdG9yeS51cGRhdGVDYWxsRXhwcmVzc2lvbihcbiAgICAgIGRlY29yYXRvckZhY3RvcnksXG4gICAgICBkZWNvcmF0b3JGYWN0b3J5LmV4cHJlc3Npb24sXG4gICAgICBkZWNvcmF0b3JGYWN0b3J5LnR5cGVBcmd1bWVudHMsXG4gICAgICBbbm9kZUZhY3RvcnkudXBkYXRlT2JqZWN0TGl0ZXJhbEV4cHJlc3Npb24ob2JqZWN0RXhwcmVzc2lvbiwgcHJvcGVydGllcyldLFxuICAgICksXG4gICk7XG59XG5cbmZ1bmN0aW9uIHZpc2l0Q29tcG9uZW50TWV0YWRhdGEoXG4gIG5vZGVGYWN0b3J5OiB0cy5Ob2RlRmFjdG9yeSxcbiAgbm9kZTogdHMuT2JqZWN0TGl0ZXJhbEVsZW1lbnRMaWtlLFxuICBzdHlsZVJlcGxhY2VtZW50czogdHMuRXhwcmVzc2lvbltdLFxuICByZXNvdXJjZUltcG9ydERlY2xhcmF0aW9uczogdHMuSW1wb3J0RGVjbGFyYXRpb25bXSxcbik6IHRzLk9iamVjdExpdGVyYWxFbGVtZW50TGlrZSB8IHVuZGVmaW5lZCB7XG4gIGlmICghdHMuaXNQcm9wZXJ0eUFzc2lnbm1lbnQobm9kZSkgfHwgdHMuaXNDb21wdXRlZFByb3BlcnR5TmFtZShub2RlLm5hbWUpKSB7XG4gICAgcmV0dXJuIG5vZGU7XG4gIH1cblxuICBzd2l0Y2ggKG5vZGUubmFtZS50ZXh0KSB7XG4gICAgY2FzZSAndGVtcGxhdGVVcmwnOlxuICAgICAgLy8gT25seSBhbmFseXplIHN0cmluZyBsaXRlcmFsc1xuICAgICAgaWYgKFxuICAgICAgICAhdHMuaXNTdHJpbmdMaXRlcmFsKG5vZGUuaW5pdGlhbGl6ZXIpICYmXG4gICAgICAgICF0cy5pc05vU3Vic3RpdHV0aW9uVGVtcGxhdGVMaXRlcmFsKG5vZGUuaW5pdGlhbGl6ZXIpXG4gICAgICApIHtcbiAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHVybCA9IG5vZGUuaW5pdGlhbGl6ZXIudGV4dDtcbiAgICAgIGlmICghdXJsKSB7XG4gICAgICAgIHJldHVybiBub2RlO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbm9kZUZhY3RvcnkudXBkYXRlUHJvcGVydHlBc3NpZ25tZW50KFxuICAgICAgICBub2RlLFxuICAgICAgICBub2RlRmFjdG9yeS5jcmVhdGVJZGVudGlmaWVyKCd0ZW1wbGF0ZScpLFxuICAgICAgICBjcmVhdGVSZXNvdXJjZUltcG9ydChcbiAgICAgICAgICBub2RlRmFjdG9yeSxcbiAgICAgICAgICBnZW5lcmF0ZUppdEZpbGVVcmkodXJsLCAndGVtcGxhdGUnKSxcbiAgICAgICAgICByZXNvdXJjZUltcG9ydERlY2xhcmF0aW9ucyxcbiAgICAgICAgKSxcbiAgICAgICk7XG4gICAgY2FzZSAnc3R5bGVzJzpcbiAgICAgIGlmICghdHMuaXNBcnJheUxpdGVyYWxFeHByZXNzaW9uKG5vZGUuaW5pdGlhbGl6ZXIpKSB7XG4gICAgICAgIHJldHVybiBub2RlO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBpbmxpbmVTdHlsZXMgPSB0cy52aXNpdE5vZGVzKG5vZGUuaW5pdGlhbGl6ZXIuZWxlbWVudHMsIChub2RlKSA9PiB7XG4gICAgICAgIGlmICghdHMuaXNTdHJpbmdMaXRlcmFsKG5vZGUpICYmICF0cy5pc05vU3Vic3RpdHV0aW9uVGVtcGxhdGVMaXRlcmFsKG5vZGUpKSB7XG4gICAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBjb250ZW50cyA9IG5vZGUudGV4dDtcbiAgICAgICAgaWYgKCFjb250ZW50cykge1xuICAgICAgICAgIC8vIEFuIGVtcHR5IGlubGluZSBzdHlsZSBpcyBlcXVpdmFsZW50IHRvIG5vdCBoYXZpbmcgYSBzdHlsZSBlbGVtZW50XG4gICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBjcmVhdGVSZXNvdXJjZUltcG9ydChcbiAgICAgICAgICBub2RlRmFjdG9yeSxcbiAgICAgICAgICBnZW5lcmF0ZUppdElubGluZVVyaShjb250ZW50cywgJ3N0eWxlJyksXG4gICAgICAgICAgcmVzb3VyY2VJbXBvcnREZWNsYXJhdGlvbnMsXG4gICAgICAgICk7XG4gICAgICB9KTtcblxuICAgICAgLy8gSW5saW5lIHN0eWxlcyBzaG91bGQgYmUgcGxhY2VkIGZpcnN0XG4gICAgICBzdHlsZVJlcGxhY2VtZW50cy51bnNoaWZ0KC4uLmlubGluZVN0eWxlcyk7XG5cbiAgICAgIC8vIFRoZSBpbmxpbmUgc3R5bGVzIHdpbGwgYmUgYWRkZWQgYWZ0ZXJ3YXJkcyBpbiBjb21iaW5hdGlvbiB3aXRoIGFueSBleHRlcm5hbCBzdHlsZXNcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgY2FzZSAnc3R5bGVVcmxzJzpcbiAgICAgIGlmICghdHMuaXNBcnJheUxpdGVyYWxFeHByZXNzaW9uKG5vZGUuaW5pdGlhbGl6ZXIpKSB7XG4gICAgICAgIHJldHVybiBub2RlO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBleHRlcm5hbFN0eWxlcyA9IHRzLnZpc2l0Tm9kZXMobm9kZS5pbml0aWFsaXplci5lbGVtZW50cywgKG5vZGUpID0+IHtcbiAgICAgICAgaWYgKCF0cy5pc1N0cmluZ0xpdGVyYWwobm9kZSkgJiYgIXRzLmlzTm9TdWJzdGl0dXRpb25UZW1wbGF0ZUxpdGVyYWwobm9kZSkpIHtcbiAgICAgICAgICByZXR1cm4gbm9kZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHVybCA9IG5vZGUudGV4dDtcbiAgICAgICAgaWYgKCF1cmwpIHtcbiAgICAgICAgICByZXR1cm4gbm9kZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBjcmVhdGVSZXNvdXJjZUltcG9ydChcbiAgICAgICAgICBub2RlRmFjdG9yeSxcbiAgICAgICAgICBnZW5lcmF0ZUppdEZpbGVVcmkodXJsLCAnc3R5bGUnKSxcbiAgICAgICAgICByZXNvdXJjZUltcG9ydERlY2xhcmF0aW9ucyxcbiAgICAgICAgKTtcbiAgICAgIH0pO1xuXG4gICAgICAvLyBFeHRlcm5hbCBzdHlsZXMgYXJlIGFwcGxpZWQgYWZ0ZXIgYW55IGlubGluZSBzdHlsZXNcbiAgICAgIHN0eWxlUmVwbGFjZW1lbnRzLnB1c2goLi4uZXh0ZXJuYWxTdHlsZXMpO1xuXG4gICAgICAvLyBUaGUgZXh0ZXJuYWwgc3R5bGVzIHdpbGwgYmUgYWRkZWQgYWZ0ZXJ3YXJkcyBpbiBjb21iaW5hdGlvbiB3aXRoIGFueSBpbmxpbmUgc3R5bGVzXG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIGRlZmF1bHQ6XG4gICAgICAvLyBBbGwgb3RoZXIgZWxlbWVudHMgYXJlIHBhc3NlZCB0aHJvdWdoXG4gICAgICByZXR1cm4gbm9kZTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjcmVhdGVSZXNvdXJjZUltcG9ydChcbiAgbm9kZUZhY3Rvcnk6IHRzLk5vZGVGYWN0b3J5LFxuICB1cmw6IHN0cmluZyxcbiAgcmVzb3VyY2VJbXBvcnREZWNsYXJhdGlvbnM6IHRzLkltcG9ydERlY2xhcmF0aW9uW10sXG4pOiB0cy5JZGVudGlmaWVyIHtcbiAgY29uc3QgdXJsTGl0ZXJhbCA9IG5vZGVGYWN0b3J5LmNyZWF0ZVN0cmluZ0xpdGVyYWwodXJsKTtcblxuICBjb25zdCBpbXBvcnROYW1lID0gbm9kZUZhY3RvcnkuY3JlYXRlSWRlbnRpZmllcihcbiAgICBgX19OR19DTElfUkVTT1VSQ0VfXyR7cmVzb3VyY2VJbXBvcnREZWNsYXJhdGlvbnMubGVuZ3RofWAsXG4gICk7XG4gIHJlc291cmNlSW1wb3J0RGVjbGFyYXRpb25zLnB1c2goXG4gICAgbm9kZUZhY3RvcnkuY3JlYXRlSW1wb3J0RGVjbGFyYXRpb24oXG4gICAgICB1bmRlZmluZWQsXG4gICAgICBub2RlRmFjdG9yeS5jcmVhdGVJbXBvcnRDbGF1c2UoZmFsc2UsIGltcG9ydE5hbWUsIHVuZGVmaW5lZCksXG4gICAgICB1cmxMaXRlcmFsLFxuICAgICksXG4gICk7XG5cbiAgcmV0dXJuIGltcG9ydE5hbWU7XG59XG5cbmZ1bmN0aW9uIGdldERlY29yYXRvck9yaWdpbihcbiAgZGVjb3JhdG9yOiB0cy5EZWNvcmF0b3IsXG4gIHR5cGVDaGVja2VyOiB0cy5UeXBlQ2hlY2tlcixcbik6IHsgbmFtZTogc3RyaW5nOyBtb2R1bGU6IHN0cmluZyB9IHwgbnVsbCB7XG4gIGlmICghdHMuaXNDYWxsRXhwcmVzc2lvbihkZWNvcmF0b3IuZXhwcmVzc2lvbikpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGxldCBpZGVudGlmaWVyOiB0cy5Ob2RlO1xuICBsZXQgbmFtZSA9ICcnO1xuXG4gIGlmICh0cy5pc1Byb3BlcnR5QWNjZXNzRXhwcmVzc2lvbihkZWNvcmF0b3IuZXhwcmVzc2lvbi5leHByZXNzaW9uKSkge1xuICAgIGlkZW50aWZpZXIgPSBkZWNvcmF0b3IuZXhwcmVzc2lvbi5leHByZXNzaW9uLmV4cHJlc3Npb247XG4gICAgbmFtZSA9IGRlY29yYXRvci5leHByZXNzaW9uLmV4cHJlc3Npb24ubmFtZS50ZXh0O1xuICB9IGVsc2UgaWYgKHRzLmlzSWRlbnRpZmllcihkZWNvcmF0b3IuZXhwcmVzc2lvbi5leHByZXNzaW9uKSkge1xuICAgIGlkZW50aWZpZXIgPSBkZWNvcmF0b3IuZXhwcmVzc2lvbi5leHByZXNzaW9uO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLy8gTk9URTogcmVzb2x2ZXIuZ2V0UmVmZXJlbmNlZEltcG9ydERlY2xhcmF0aW9uIHdvdWxkIHdvcmsgYXMgd2VsbCBidXQgaXMgaW50ZXJuYWxcbiAgY29uc3Qgc3ltYm9sID0gdHlwZUNoZWNrZXIuZ2V0U3ltYm9sQXRMb2NhdGlvbihpZGVudGlmaWVyKTtcbiAgaWYgKHN5bWJvbCAmJiBzeW1ib2wuZGVjbGFyYXRpb25zICYmIHN5bWJvbC5kZWNsYXJhdGlvbnMubGVuZ3RoID4gMCkge1xuICAgIGNvbnN0IGRlY2xhcmF0aW9uID0gc3ltYm9sLmRlY2xhcmF0aW9uc1swXTtcbiAgICBsZXQgbW9kdWxlOiBzdHJpbmc7XG5cbiAgICBpZiAodHMuaXNJbXBvcnRTcGVjaWZpZXIoZGVjbGFyYXRpb24pKSB7XG4gICAgICBuYW1lID0gKGRlY2xhcmF0aW9uLnByb3BlcnR5TmFtZSB8fCBkZWNsYXJhdGlvbi5uYW1lKS50ZXh0O1xuICAgICAgbW9kdWxlID0gKGRlY2xhcmF0aW9uLnBhcmVudC5wYXJlbnQucGFyZW50Lm1vZHVsZVNwZWNpZmllciBhcyB0cy5TdHJpbmdMaXRlcmFsKS50ZXh0O1xuICAgIH0gZWxzZSBpZiAodHMuaXNOYW1lc3BhY2VJbXBvcnQoZGVjbGFyYXRpb24pKSB7XG4gICAgICAvLyBVc2UgdGhlIG5hbWUgZnJvbSB0aGUgZGVjb3JhdG9yIG5hbWVzcGFjZSBwcm9wZXJ0eSBhY2Nlc3NcbiAgICAgIG1vZHVsZSA9IChkZWNsYXJhdGlvbi5wYXJlbnQucGFyZW50Lm1vZHVsZVNwZWNpZmllciBhcyB0cy5TdHJpbmdMaXRlcmFsKS50ZXh0O1xuICAgIH0gZWxzZSBpZiAodHMuaXNJbXBvcnRDbGF1c2UoZGVjbGFyYXRpb24pKSB7XG4gICAgICBuYW1lID0gKGRlY2xhcmF0aW9uLm5hbWUgYXMgdHMuSWRlbnRpZmllcikudGV4dDtcbiAgICAgIG1vZHVsZSA9IChkZWNsYXJhdGlvbi5wYXJlbnQubW9kdWxlU3BlY2lmaWVyIGFzIHRzLlN0cmluZ0xpdGVyYWwpLnRleHQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHJldHVybiB7IG5hbWUsIG1vZHVsZSB9O1xuICB9XG5cbiAgcmV0dXJuIG51bGw7XG59XG4iXX0=