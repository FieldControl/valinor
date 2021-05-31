"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceBootstrap = exports.mergeTransformers = exports.createJitTransformers = exports.createAotTransformers = void 0;
const compiler_cli_1 = require("@angular/compiler-cli");
const ts = require("typescript");
const elide_imports_1 = require("../transformers/elide_imports");
const remove_ivy_jit_support_calls_1 = require("../transformers/remove-ivy-jit-support-calls");
const replace_resources_1 = require("../transformers/replace_resources");
function createAotTransformers(builder, options) {
    const getTypeChecker = () => builder.getProgram().getTypeChecker();
    const transformers = {
        before: [replaceBootstrap(getTypeChecker)],
        after: [],
    };
    const removeClassMetadata = !options.emitClassMetadata;
    const removeNgModuleScope = !options.emitNgModuleScope;
    if (removeClassMetadata || removeNgModuleScope) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        transformers.before.push(remove_ivy_jit_support_calls_1.removeIvyJitSupportCalls(removeClassMetadata, removeNgModuleScope, getTypeChecker));
    }
    return transformers;
}
exports.createAotTransformers = createAotTransformers;
function createJitTransformers(builder, options) {
    const getTypeChecker = () => builder.getProgram().getTypeChecker();
    return {
        before: [
            replace_resources_1.replaceResources(() => true, getTypeChecker, options.directTemplateLoading, options.inlineStyleMimeType),
            compiler_cli_1.constructorParametersDownlevelTransform(builder.getProgram()),
        ],
    };
}
exports.createJitTransformers = createJitTransformers;
function mergeTransformers(first, second) {
    const result = {};
    if (first.before || second.before) {
        result.before = [...(first.before || []), ...(second.before || [])];
    }
    if (first.after || second.after) {
        result.after = [...(first.after || []), ...(second.after || [])];
    }
    if (first.afterDeclarations || second.afterDeclarations) {
        result.afterDeclarations = [
            ...(first.afterDeclarations || []),
            ...(second.afterDeclarations || []),
        ];
    }
    return result;
}
exports.mergeTransformers = mergeTransformers;
function replaceBootstrap(getTypeChecker) {
    return (context) => {
        let bootstrapImport;
        let bootstrapNamespace;
        const replacedNodes = [];
        const nodeFactory = context.factory;
        const visitNode = (node) => {
            if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
                const target = node.expression;
                if (target.text === 'platformBrowserDynamic') {
                    if (!bootstrapNamespace) {
                        bootstrapNamespace = nodeFactory.createUniqueName('__NgCli_bootstrap_');
                        bootstrapImport = nodeFactory.createImportDeclaration(undefined, undefined, nodeFactory.createImportClause(false, undefined, nodeFactory.createNamespaceImport(bootstrapNamespace)), nodeFactory.createStringLiteral('@angular/platform-browser'));
                    }
                    replacedNodes.push(target);
                    return nodeFactory.updateCallExpression(node, nodeFactory.createPropertyAccessExpression(bootstrapNamespace, 'platformBrowser'), node.typeArguments, node.arguments);
                }
            }
            return ts.visitEachChild(node, visitNode, context);
        };
        return (sourceFile) => {
            let updatedSourceFile = ts.visitEachChild(sourceFile, visitNode, context);
            if (bootstrapImport) {
                // Remove any unused platform browser dynamic imports
                const removals = elide_imports_1.elideImports(updatedSourceFile, replacedNodes, getTypeChecker, context.getCompilerOptions()).map((op) => op.target);
                if (removals.length > 0) {
                    updatedSourceFile = ts.visitEachChild(updatedSourceFile, (node) => (removals.includes(node) ? undefined : node), context);
                }
                // Add new platform browser import
                return nodeFactory.updateSourceFile(updatedSourceFile, ts.setTextRange(nodeFactory.createNodeArray([bootstrapImport, ...updatedSourceFile.statements]), sourceFile.statements));
            }
            else {
                return updatedSourceFile;
            }
        };
    };
}
exports.replaceBootstrap = replaceBootstrap;
