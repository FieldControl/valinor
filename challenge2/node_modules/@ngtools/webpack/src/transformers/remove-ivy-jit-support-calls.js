"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeIvyJitSupportCalls = void 0;
const ts = require("typescript");
const elide_imports_1 = require("./elide_imports");
function removeIvyJitSupportCalls(classMetadata, ngModuleScope, getTypeChecker) {
    return (context) => {
        const removedNodes = [];
        const visitNode = (node) => {
            const innerStatement = ts.isExpressionStatement(node) && getIifeStatement(node);
            if (innerStatement) {
                if (ngModuleScope &&
                    ts.isBinaryExpression(innerStatement.expression) &&
                    isIvyPrivateCallExpression(innerStatement.expression.right, 'ɵɵsetNgModuleScope')) {
                    removedNodes.push(innerStatement);
                    return undefined;
                }
                if (classMetadata) {
                    const expression = ts.isBinaryExpression(innerStatement.expression)
                        ? innerStatement.expression.right
                        : innerStatement.expression;
                    if (isIvyPrivateCallExpression(expression, 'ɵsetClassMetadata')) {
                        removedNodes.push(innerStatement);
                        return undefined;
                    }
                }
            }
            return ts.visitEachChild(node, visitNode, context);
        };
        return (sourceFile) => {
            let updatedSourceFile = ts.visitEachChild(sourceFile, visitNode, context);
            if (removedNodes.length > 0) {
                // Remove any unused imports
                const importRemovals = elide_imports_1.elideImports(updatedSourceFile, removedNodes, getTypeChecker, context.getCompilerOptions()).map((op) => op.target);
                if (importRemovals.length > 0) {
                    updatedSourceFile = ts.visitEachChild(updatedSourceFile, function visitForRemoval(node) {
                        return importRemovals.includes(node)
                            ? undefined
                            : ts.visitEachChild(node, visitForRemoval, context);
                    }, context);
                }
            }
            return updatedSourceFile;
        };
    };
}
exports.removeIvyJitSupportCalls = removeIvyJitSupportCalls;
// Each Ivy private call expression is inside an IIFE
function getIifeStatement(exprStmt) {
    const expression = exprStmt.expression;
    if (!expression || !ts.isCallExpression(expression) || expression.arguments.length !== 0) {
        return null;
    }
    const parenExpr = expression;
    if (!ts.isParenthesizedExpression(parenExpr.expression)) {
        return null;
    }
    const funExpr = parenExpr.expression.expression;
    if (!ts.isFunctionExpression(funExpr)) {
        return null;
    }
    const innerStmts = funExpr.body.statements;
    if (innerStmts.length !== 1) {
        return null;
    }
    const innerExprStmt = innerStmts[0];
    if (!ts.isExpressionStatement(innerExprStmt)) {
        return null;
    }
    return innerExprStmt;
}
function isIvyPrivateCallExpression(expression, name) {
    // Now we're in the IIFE and have the inner expression statement. We can check if it matches
    // a private Ivy call.
    if (!ts.isCallExpression(expression)) {
        return false;
    }
    const propAccExpr = expression.expression;
    if (!ts.isPropertyAccessExpression(propAccExpr)) {
        return false;
    }
    if (propAccExpr.name.text != name) {
        return false;
    }
    return true;
}
