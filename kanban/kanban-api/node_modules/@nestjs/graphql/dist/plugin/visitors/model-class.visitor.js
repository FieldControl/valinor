"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelClassVisitor = void 0;
const path_1 = require("path");
const ts = require("typescript");
const decorators_1 = require("../../decorators");
const plugin_constants_1 = require("../plugin-constants");
const plugin_debug_logger_1 = require("../plugin-debug-logger");
const ast_utils_1 = require("../utils/ast-utils");
const plugin_utils_1 = require("../utils/plugin-utils");
const type_reference_to_identifier_util_1 = require("../utils/type-reference-to-identifier.util");
const CLASS_DECORATORS = [
    decorators_1.ObjectType.name,
    decorators_1.InterfaceType.name,
    decorators_1.InputType.name,
    decorators_1.ArgsType.name,
];
class ModelClassVisitor {
    constructor() {
        this._typeImports = {};
        this._collectedMetadata = {};
    }
    get typeImports() {
        return this._typeImports;
    }
    get collectedMetadata() {
        const metadataWithImports = [];
        Object.keys(this._collectedMetadata).forEach((filePath) => {
            const metadata = this._collectedMetadata[filePath];
            const path = filePath.replace(/\.[jt]s$/, '');
            const importExpr = ts.factory.createCallExpression(ts.factory.createToken(ts.SyntaxKind.ImportKeyword), undefined, [ts.factory.createStringLiteral(path)]);
            metadataWithImports.push([importExpr, metadata]);
        });
        return metadataWithImports;
    }
    visit(sourceFile, ctx, program, pluginOptions) {
        this.importsToAdd = new Set();
        const typeChecker = program.getTypeChecker();
        const factory = ctx.factory;
        const visitNode = (node) => {
            const decorators = (0, ast_utils_1.getDecorators)(node);
            if (ts.isClassDeclaration(node) &&
                (0, ast_utils_1.hasDecorators)(decorators, CLASS_DECORATORS)) {
                const isExported = node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword);
                if (pluginOptions.readonly && !isExported) {
                    if (pluginOptions.debug) {
                        plugin_debug_logger_1.pluginDebugLogger.debug(`Skipping class "${node.name.getText()}" because it's not exported.`);
                    }
                    return;
                }
                const [members, amendedMetadata] = this.amendFieldsDecorators(factory, node.members, pluginOptions, sourceFile.fileName, typeChecker);
                const metadata = this.collectMetadataFromClassMembers(factory, members, pluginOptions, sourceFile.fileName, typeChecker);
                if (!pluginOptions.readonly) {
                    return this.updateClassDeclaration(factory, node, members, metadata, pluginOptions);
                }
                else {
                    const filePath = this.normalizeImportPath(pluginOptions.pathToSource, sourceFile.fileName);
                    if (!this._collectedMetadata[filePath]) {
                        this._collectedMetadata[filePath] = {};
                    }
                    const attributeKey = node.name.getText();
                    this._collectedMetadata[filePath][attributeKey] = (0, ast_utils_1.safelyMergeObjects)(factory, metadata, amendedMetadata);
                    return;
                }
            }
            else if (ts.isSourceFile(node) && !pluginOptions.readonly) {
                const visitedNode = ts.visitEachChild(node, visitNode, ctx);
                const importStatements = this.createEagerImports(factory);
                const existingStatements = Array.from(visitedNode.statements);
                return factory.updateSourceFile(visitedNode, [
                    ...importStatements,
                    ...existingStatements,
                ]);
            }
            if (pluginOptions.readonly) {
                ts.forEachChild(node, visitNode);
            }
            else {
                return ts.visitEachChild(node, visitNode, ctx);
            }
        };
        return ts.visitNode(sourceFile, visitNode);
    }
    addDescriptionToClassDecorators(f, node) {
        const description = (0, ast_utils_1.getJSDocDescription)(node);
        const decorators = (0, ast_utils_1.getDecorators)(node);
        if (!description) {
            return decorators;
        }
        // get one of allowed decorators from list
        return decorators.map((decorator) => {
            if (!CLASS_DECORATORS.includes((0, ast_utils_1.getDecoratorName)(decorator))) {
                return decorator;
            }
            const decoratorExpression = decorator.expression;
            const objectLiteralExpression = (0, ast_utils_1.serializePrimitiveObjectToAst)(f, {
                description,
            });
            let newArgumentsArray = [];
            if (decoratorExpression.arguments.length === 0) {
                newArgumentsArray = [objectLiteralExpression];
            }
            else {
                // Options always a last parameter:
                // @ObjectType('name', {description: ''});
                // @ObjectType({description: ''});
                newArgumentsArray = decoratorExpression.arguments.map((argument, index) => {
                    if (index + 1 != decoratorExpression.arguments.length) {
                        return argument;
                    }
                    // merge existing props with new props
                    return (0, ast_utils_1.safelyMergeObjects)(f, objectLiteralExpression, argument);
                });
            }
            return f.updateDecorator(decorator, f.updateCallExpression(decoratorExpression, decoratorExpression.expression, decoratorExpression.typeArguments, newArgumentsArray));
        });
    }
    amendFieldsDecorators(f, members, pluginOptions, hostFilename, // sourceFile.fileName,
    typeChecker) {
        const propertyAssignments = [];
        const updatedClassElements = members.map((member) => {
            const decorators = (0, ast_utils_1.getDecorators)(member);
            if ((ts.isPropertyDeclaration(member) || ts.isGetAccessor(member)) &&
                (0, ast_utils_1.hasDecorators)(decorators, [decorators_1.Field.name])) {
                try {
                    return (0, ast_utils_1.updateDecoratorArguments)(f, member, decorators_1.Field.name, (decoratorArguments) => {
                        const options = this.getOptionsFromFieldDecoratorOrUndefined(decoratorArguments);
                        const { type, ...metadata } = this.createFieldMetadata(f, member, typeChecker, hostFilename, pluginOptions, this.getTypeFromFieldDecoratorOrUndefined(decoratorArguments));
                        const serializedMetadata = (0, ast_utils_1.serializePrimitiveObjectToAst)(f, metadata);
                        propertyAssignments.push(f.createPropertyAssignment(f.createIdentifier(member.name.getText()), serializedMetadata));
                        return [
                            type,
                            options
                                ? (0, ast_utils_1.safelyMergeObjects)(f, serializedMetadata, options)
                                : serializedMetadata,
                        ];
                    });
                }
                catch (e) {
                    // omit error
                }
            }
            return member;
        });
        return [
            updatedClassElements,
            f.createObjectLiteralExpression(propertyAssignments),
        ];
    }
    collectMetadataFromClassMembers(f, members, pluginOptions, hostFilename, // sourceFile.fileName,
    typeChecker) {
        const properties = [];
        members.forEach((member) => {
            const decorators = (0, ast_utils_1.getDecorators)(member);
            const modifiers = (0, ast_utils_1.getModifiers)(member);
            if ((ts.isPropertyDeclaration(member) || ts.isGetAccessor(member)) &&
                !(0, ast_utils_1.hasModifiers)(modifiers, [
                    ts.SyntaxKind.StaticKeyword,
                    ts.SyntaxKind.PrivateKeyword,
                ]) &&
                !(0, ast_utils_1.hasDecorators)(decorators, [decorators_1.HideField.name, decorators_1.Field.name])) {
                try {
                    const metadata = this.createFieldMetadata(f, member, typeChecker, hostFilename, pluginOptions);
                    properties.push(f.createPropertyAssignment(f.createIdentifier(member.name.getText()), (0, ast_utils_1.serializePrimitiveObjectToAst)(f, metadata)));
                }
                catch (e) {
                    // omit error
                }
            }
        });
        return f.createObjectLiteralExpression(properties);
    }
    updateClassDeclaration(f, node, members, propsMetadata, pluginOptions) {
        const method = f.createMethodDeclaration([f.createModifier(ts.SyntaxKind.StaticKeyword)], undefined, f.createIdentifier(plugin_constants_1.METADATA_FACTORY_NAME), undefined, undefined, [], undefined, f.createBlock([f.createReturnStatement(propsMetadata)], true));
        const decorators = pluginOptions.introspectComments
            ? this.addDescriptionToClassDecorators(f, node)
            : (0, ast_utils_1.getDecorators)(node);
        return f.updateClassDeclaration(node, [...decorators, ...(0, ast_utils_1.getModifiers)(node)], node.name, node.typeParameters, node.heritageClauses, [...members, method]);
    }
    getOptionsFromFieldDecoratorOrUndefined(decoratorArguments) {
        if (decoratorArguments.length > 1) {
            return decoratorArguments[1];
        }
        if (decoratorArguments.length === 1 &&
            !ts.isArrowFunction(decoratorArguments[0])) {
            return decoratorArguments[0];
        }
    }
    getTypeFromFieldDecoratorOrUndefined(decoratorArguments) {
        if (decoratorArguments.length > 0 &&
            ts.isArrowFunction(decoratorArguments[0])) {
            return decoratorArguments[0];
        }
    }
    createFieldMetadata(f, node, typeChecker, hostFilename = '', pluginOptions = {}, typeArrowFunction) {
        const type = typeChecker.getTypeAtLocation(node);
        const isNullable = !!node.questionToken || (0, ast_utils_1.isNull)(type) || (0, ast_utils_1.isUndefined)(type);
        if (!typeArrowFunction) {
            typeArrowFunction =
                typeArrowFunction ||
                    f.createArrowFunction(undefined, undefined, [], undefined, undefined, this.getTypeUsingTypeChecker(f, node.type, typeChecker, hostFilename, pluginOptions));
        }
        const description = pluginOptions.introspectComments
            ? (0, ast_utils_1.getJSDocDescription)(node)
            : undefined;
        const deprecationReason = pluginOptions.introspectComments
            ? (0, ast_utils_1.getJsDocDeprecation)(node)
            : undefined;
        return {
            nullable: isNullable || undefined,
            type: typeArrowFunction,
            description,
            deprecationReason,
        };
    }
    getTypeUsingTypeChecker(f, node, typeChecker, hostFilename, options) {
        if (node && ts.isUnionTypeNode(node)) {
            const nullableType = (0, ast_utils_1.findNullableTypeFromUnion)(node, typeChecker);
            const remainingTypes = node.types.filter((item) => item !== nullableType);
            if (remainingTypes.length === 1) {
                return this.getTypeUsingTypeChecker(f, remainingTypes[0], typeChecker, hostFilename, options);
            }
        }
        const type = typeChecker.getTypeAtLocation(node);
        if (!type) {
            return undefined;
        }
        const typeReferenceDescriptor = (0, plugin_utils_1.getTypeReferenceAsString)(type, typeChecker);
        if (!typeReferenceDescriptor.typeName) {
            return undefined;
        }
        return (0, type_reference_to_identifier_util_1.typeReferenceToIdentifier)(typeReferenceDescriptor, hostFilename, options, f, type, this._typeImports, this.importsToAdd);
    }
    createEagerImports(f) {
        if (!this.importsToAdd.size) {
            return [];
        }
        return Array.from(this.importsToAdd).map((path, index) => {
            return (0, ast_utils_1.createImportEquals)(f, 'eager_import_' + index, path);
        });
    }
    normalizeImportPath(pathToSource, path) {
        let relativePath = path_1.posix.relative((0, plugin_utils_1.convertPath)(pathToSource), (0, plugin_utils_1.convertPath)(path));
        relativePath = relativePath[0] !== '.' ? './' + relativePath : relativePath;
        return relativePath;
    }
}
exports.ModelClassVisitor = ModelClassVisitor;
