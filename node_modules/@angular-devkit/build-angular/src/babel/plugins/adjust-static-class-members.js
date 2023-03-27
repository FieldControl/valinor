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
exports.getKeywords = void 0;
const core_1 = require("@babel/core");
const helper_annotate_as_pure_1 = __importDefault(require("@babel/helper-annotate-as-pure"));
const helper_split_export_declaration_1 = __importDefault(require("@babel/helper-split-export-declaration"));
/**
 * The name of the Typescript decorator helper function created by the TypeScript compiler.
 */
const TSLIB_DECORATE_HELPER_NAME = '__decorate';
/**
 * The set of Angular static fields that should always be wrapped.
 * These fields may appear to have side effects but are safe to remove if the associated class
 * is otherwise unused within the output.
 */
const angularStaticsToWrap = new Set([
    'ɵcmp',
    'ɵdir',
    'ɵfac',
    'ɵinj',
    'ɵmod',
    'ɵpipe',
    'ɵprov',
    'INJECTOR_KEY',
]);
/**
 * An object map of static fields and related value checks for discovery of Angular generated
 * JIT related static fields.
 */
const angularStaticsToElide = {
    'ctorParameters'(path) {
        return path.isFunctionExpression() || path.isArrowFunctionExpression();
    },
    'decorators'(path) {
        return path.isArrayExpression();
    },
    'propDecorators'(path) {
        return path.isObjectExpression();
    },
};
/**
 * Provides one or more keywords that if found within the content of a source file indicate
 * that this plugin should be used with a source file.
 *
 * @returns An a string iterable containing one or more keywords.
 */
function getKeywords() {
    return ['class'];
}
exports.getKeywords = getKeywords;
/**
 * Determines whether a property and its initializer value can be safely wrapped in a pure
 * annotated IIFE. Values that may cause side effects are not considered safe to wrap.
 * Wrapping such values may cause runtime errors and/or incorrect runtime behavior.
 *
 * @param propertyName The name of the property to analyze.
 * @param assignmentValue The initializer value that will be assigned to the property.
 * @returns If the property can be safely wrapped, then true; otherwise, false.
 */
function canWrapProperty(propertyName, assignmentValue) {
    if (angularStaticsToWrap.has(propertyName)) {
        return true;
    }
    const { leadingComments } = assignmentValue.node;
    if (leadingComments === null || leadingComments === void 0 ? void 0 : leadingComments.some(
    // `@pureOrBreakMyCode` is used by closure and is present in Angular code
    ({ value }) => value.includes('@__PURE__') ||
        value.includes('#__PURE__') ||
        value.includes('@pureOrBreakMyCode'))) {
        return true;
    }
    return assignmentValue.isPure();
}
/**
 * Analyze the sibling nodes of a class to determine if any downlevel elements should be
 * wrapped in a pure annotated IIFE. Also determines if any elements have potential side
 * effects.
 *
 * @param origin The starting NodePath location for analyzing siblings.
 * @param classIdentifier The identifier node that represents the name of the class.
 * @param allowWrappingDecorators Whether to allow decorators to be wrapped.
 * @returns An object containing the results of the analysis.
 */
function analyzeClassSiblings(origin, classIdentifier, allowWrappingDecorators) {
    var _a;
    const wrapStatementPaths = [];
    let hasPotentialSideEffects = false;
    for (let i = 1;; ++i) {
        const nextStatement = origin.getSibling(+origin.key + i);
        if (!nextStatement.isExpressionStatement()) {
            break;
        }
        // Valid sibling statements for class declarations are only assignment expressions
        // and TypeScript decorator helper call expressions
        const nextExpression = nextStatement.get('expression');
        if (nextExpression.isCallExpression()) {
            if (!core_1.types.isIdentifier(nextExpression.node.callee) ||
                nextExpression.node.callee.name !== TSLIB_DECORATE_HELPER_NAME) {
                break;
            }
            if (allowWrappingDecorators) {
                wrapStatementPaths.push(nextStatement);
            }
            else {
                // Statement cannot be safely wrapped which makes wrapping the class unneeded.
                // The statement will prevent even a wrapped class from being optimized away.
                hasPotentialSideEffects = true;
            }
            continue;
        }
        else if (!nextExpression.isAssignmentExpression()) {
            break;
        }
        // Valid assignment expressions should be member access expressions using the class
        // name as the object and an identifier as the property for static fields or only
        // the class name for decorators.
        const left = nextExpression.get('left');
        if (left.isIdentifier()) {
            if (!left.scope.bindingIdentifierEquals(left.node.name, classIdentifier) ||
                !core_1.types.isCallExpression(nextExpression.node.right) ||
                !core_1.types.isIdentifier(nextExpression.node.right.callee) ||
                nextExpression.node.right.callee.name !== TSLIB_DECORATE_HELPER_NAME) {
                break;
            }
            if (allowWrappingDecorators) {
                wrapStatementPaths.push(nextStatement);
            }
            else {
                // Statement cannot be safely wrapped which makes wrapping the class unneeded.
                // The statement will prevent even a wrapped class from being optimized away.
                hasPotentialSideEffects = true;
            }
            continue;
        }
        else if (!left.isMemberExpression() ||
            !core_1.types.isIdentifier(left.node.object) ||
            !left.scope.bindingIdentifierEquals(left.node.object.name, classIdentifier) ||
            !core_1.types.isIdentifier(left.node.property)) {
            break;
        }
        const propertyName = left.node.property.name;
        const assignmentValue = nextExpression.get('right');
        if ((_a = angularStaticsToElide[propertyName]) === null || _a === void 0 ? void 0 : _a.call(angularStaticsToElide, assignmentValue)) {
            nextStatement.remove();
            --i;
        }
        else if (canWrapProperty(propertyName, assignmentValue)) {
            wrapStatementPaths.push(nextStatement);
        }
        else {
            // Statement cannot be safely wrapped which makes wrapping the class unneeded.
            // The statement will prevent even a wrapped class from being optimized away.
            hasPotentialSideEffects = true;
        }
    }
    return { hasPotentialSideEffects, wrapStatementPaths };
}
/**
 * The set of classes already visited and analyzed during the plugin's execution.
 * This is used to prevent adjusted classes from being repeatedly analyzed which can lead
 * to an infinite loop.
 */
const visitedClasses = new WeakSet();
/**
 * A map of classes that have already been analyzed during the default export splitting step.
 * This is used to avoid analyzing a class declaration twice if it is a direct default export.
 */
const exportDefaultAnalysis = new WeakMap();
/**
 * A babel plugin factory function for adjusting classes; primarily with Angular metadata.
 * The adjustments include wrapping classes with known safe or no side effects with pure
 * annotations to support dead code removal of unused classes. Angular compiler generated
 * metadata static fields not required in AOT mode are also elided to better support bundler-
 * level treeshaking.
 *
 * @returns A babel plugin object instance.
 */
function default_1() {
    return {
        visitor: {
            // When a class is converted to a variable declaration, the default export must be moved
            // to a subsequent statement to prevent a JavaScript syntax error.
            ExportDefaultDeclaration(path, state) {
                const declaration = path.get('declaration');
                if (!declaration.isClassDeclaration()) {
                    return;
                }
                const { wrapDecorators } = state.opts;
                const analysis = analyzeClassSiblings(path, declaration.node.id, wrapDecorators);
                exportDefaultAnalysis.set(declaration.node, analysis);
                // Splitting the export declaration is not needed if the class will not be wrapped
                if (analysis.hasPotentialSideEffects) {
                    return;
                }
                (0, helper_split_export_declaration_1.default)(path);
            },
            ClassDeclaration(path, state) {
                var _a;
                const { node: classNode, parentPath } = path;
                const { wrapDecorators } = state.opts;
                if (visitedClasses.has(classNode)) {
                    return;
                }
                // Analyze sibling statements for elements of the class that were downleveled
                const origin = parentPath.isExportNamedDeclaration() ? parentPath : path;
                const { wrapStatementPaths, hasPotentialSideEffects } = (_a = exportDefaultAnalysis.get(classNode)) !== null && _a !== void 0 ? _a : analyzeClassSiblings(origin, classNode.id, wrapDecorators);
                visitedClasses.add(classNode);
                if (hasPotentialSideEffects) {
                    return;
                }
                // If no statements to wrap, check for static class properties.
                // Static class properties may be downleveled at later stages in the build pipeline
                // which results in additional function calls outside the class body. These calls
                // then cause the class to be referenced and not eligible for removal. Since it is
                // not known at this stage whether the class needs to be downleveled, the transform
                // wraps classes preemptively to allow for potential removal within the optimization
                // stages.
                if (wrapStatementPaths.length === 0) {
                    let shouldWrap = false;
                    for (const element of path.get('body').get('body')) {
                        if (element.isClassProperty()) {
                            // Only need to analyze static properties
                            if (!element.node.static) {
                                continue;
                            }
                            // Check for potential side effects.
                            // These checks are conservative and could potentially be expanded in the future.
                            const elementKey = element.get('key');
                            const elementValue = element.get('value');
                            if (elementKey.isIdentifier() &&
                                (!elementValue.isExpression() ||
                                    canWrapProperty(elementKey.get('name'), elementValue))) {
                                shouldWrap = true;
                            }
                            else {
                                // Not safe to wrap
                                shouldWrap = false;
                                break;
                            }
                        }
                    }
                    if (!shouldWrap) {
                        return;
                    }
                }
                const wrapStatementNodes = [];
                for (const statementPath of wrapStatementPaths) {
                    wrapStatementNodes.push(statementPath.node);
                    statementPath.remove();
                }
                // Wrap class and safe static assignments in a pure annotated IIFE
                const container = core_1.types.arrowFunctionExpression([], core_1.types.blockStatement([
                    classNode,
                    ...wrapStatementNodes,
                    core_1.types.returnStatement(core_1.types.cloneNode(classNode.id)),
                ]));
                const replacementInitializer = core_1.types.callExpression(core_1.types.parenthesizedExpression(container), []);
                (0, helper_annotate_as_pure_1.default)(replacementInitializer);
                // Replace class with IIFE wrapped class
                const declaration = core_1.types.variableDeclaration('let', [
                    core_1.types.variableDeclarator(core_1.types.cloneNode(classNode.id), replacementInitializer),
                ]);
                path.replaceWith(declaration);
            },
            ClassExpression(path, state) {
                const { node: classNode, parentPath } = path;
                const { wrapDecorators } = state.opts;
                // Class expressions are used by TypeScript to represent downlevel class/constructor decorators.
                // If not wrapping decorators, they do not need to be processed.
                if (!wrapDecorators || visitedClasses.has(classNode)) {
                    return;
                }
                if (!classNode.id ||
                    !parentPath.isVariableDeclarator() ||
                    !core_1.types.isIdentifier(parentPath.node.id) ||
                    parentPath.node.id.name !== classNode.id.name) {
                    return;
                }
                const origin = parentPath.parentPath;
                if (!origin.isVariableDeclaration() || origin.node.declarations.length !== 1) {
                    return;
                }
                const { wrapStatementPaths, hasPotentialSideEffects } = analyzeClassSiblings(origin, parentPath.node.id, wrapDecorators);
                visitedClasses.add(classNode);
                if (hasPotentialSideEffects || wrapStatementPaths.length === 0) {
                    return;
                }
                const wrapStatementNodes = [];
                for (const statementPath of wrapStatementPaths) {
                    wrapStatementNodes.push(statementPath.node);
                    statementPath.remove();
                }
                // Wrap class and safe static assignments in a pure annotated IIFE
                const container = core_1.types.arrowFunctionExpression([], core_1.types.blockStatement([
                    core_1.types.variableDeclaration('let', [
                        core_1.types.variableDeclarator(core_1.types.cloneNode(classNode.id), classNode),
                    ]),
                    ...wrapStatementNodes,
                    core_1.types.returnStatement(core_1.types.cloneNode(classNode.id)),
                ]));
                const replacementInitializer = core_1.types.callExpression(core_1.types.parenthesizedExpression(container), []);
                (0, helper_annotate_as_pure_1.default)(replacementInitializer);
                // Add the wrapped class directly to the variable declaration
                parentPath.get('init').replaceWith(replacementInitializer);
            },
        },
    };
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRqdXN0LXN0YXRpYy1jbGFzcy1tZW1iZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvYW5ndWxhcl9kZXZraXQvYnVpbGRfYW5ndWxhci9zcmMvYmFiZWwvcGx1Z2lucy9hZGp1c3Qtc3RhdGljLWNsYXNzLW1lbWJlcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7Ozs7O0FBRUgsc0NBQXFFO0FBQ3JFLDZGQUE0RDtBQUM1RCw2R0FBNEU7QUFFNUU7O0dBRUc7QUFDSCxNQUFNLDBCQUEwQixHQUFHLFlBQVksQ0FBQztBQUVoRDs7OztHQUlHO0FBQ0gsTUFBTSxvQkFBb0IsR0FBRyxJQUFJLEdBQUcsQ0FBQztJQUNuQyxNQUFNO0lBQ04sTUFBTTtJQUNOLE1BQU07SUFDTixNQUFNO0lBQ04sTUFBTTtJQUNOLE9BQU87SUFDUCxPQUFPO0lBQ1AsY0FBYztDQUNmLENBQUMsQ0FBQztBQUVIOzs7R0FHRztBQUNILE1BQU0scUJBQXFCLEdBQWtFO0lBQzNGLGdCQUFnQixDQUFDLElBQUk7UUFDbkIsT0FBTyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsSUFBSSxJQUFJLENBQUMseUJBQXlCLEVBQUUsQ0FBQztJQUN6RSxDQUFDO0lBQ0QsWUFBWSxDQUFDLElBQUk7UUFDZixPQUFPLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO0lBQ2xDLENBQUM7SUFDRCxnQkFBZ0IsQ0FBQyxJQUFJO1FBQ25CLE9BQU8sSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7SUFDbkMsQ0FBQztDQUNGLENBQUM7QUFFRjs7Ozs7R0FLRztBQUNILFNBQWdCLFdBQVc7SUFDekIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ25CLENBQUM7QUFGRCxrQ0FFQztBQUVEOzs7Ozs7OztHQVFHO0FBQ0gsU0FBUyxlQUFlLENBQUMsWUFBb0IsRUFBRSxlQUF5QjtJQUN0RSxJQUFJ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QUN4QjtnQkFFRCxrRUFBa0U7Z0JBQ2xFLE1BQU0sU0FBUyxHQUFHLFlBQUssQ0FBQyx1QkFBdUIsQ0FDN0MsRUFBRSxFQUNGLFlBQUssQ0FBQyxjQUFjLENBQUM7b0JBQ25CLFlBQUssQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLEVBQUU7d0JBQy9CLFlBQUssQ0FBQyxrQkFBa0IsQ0FBQyxZQUFLLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsRUFBRSxTQUFTLENBQUM7cUJBQ25FLENBQUM7b0JBQ0YsR0FBRyxrQkFBa0I7b0JBQ3JCLFlBQUssQ0FBQyxlQUFlLENBQUMsWUFBSyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUM7aUJBQ3JELENBQUMsQ0FDSCxDQUFDO2dCQUNGLE1BQU0sc0JBQXNCLEdBQUcsWUFBSyxDQUFDLGNBQWMsQ0FDakQsWUFBSyxDQUFDLHVCQUF1QixDQUFDLFNBQVMsQ0FBQyxFQUN4QyxFQUFFLENBQ0gsQ0FBQztnQkFDRixJQUFBLGlDQUFjLEVBQUMsc0JBQXNCLENBQUMsQ0FBQztnQkFFdkMsNkRBQTZEO2dCQUM3RCxVQUFVLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLFdBQVcsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1lBQzdELENBQUM7U0FDRjtLQUNGLENBQUM7QUFDSixDQUFDO0FBM0tELDRCQTJLQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgeyBOb2RlUGF0aCwgUGx1Z2luT2JqLCBQbHVnaW5QYXNzLCB0eXBlcyB9IGZyb20gJ0BiYWJlbC9jb3JlJztcbmltcG9ydCBhbm5vdGF0ZUFzUHVyZSBmcm9tICdAYmFiZWwvaGVscGVyLWFubm90YXRlLWFzLXB1cmUnO1xuaW1wb3J0IHNwbGl0RXhwb3J0RGVjbGFyYXRpb24gZnJvbSAnQGJhYmVsL2hlbHBlci1zcGxpdC1leHBvcnQtZGVjbGFyYXRpb24nO1xuXG4vKipcbiAqIFRoZSBuYW1lIG9mIHRoZSBUeXBlc2NyaXB0IGRlY29yYXRvciBoZWxwZXIgZnVuY3Rpb24gY3JlYXRlZCBieSB0aGUgVHlwZVNjcmlwdCBjb21waWxlci5cbiAqL1xuY29uc3QgVFNMSUJfREVDT1JBVEVfSEVMUEVSX05BTUUgPSAnX19kZWNvcmF0ZSc7XG5cbi8qKlxuICogVGhlIHNldCBvZiBBbmd1bGFyIHN0YXRpYyBmaWVsZHMgdGhhdCBzaG91bGQgYWx3YXlzIGJlIHdyYXBwZWQuXG4gKiBUaGVzZSBmaWVsZHMgbWF5IGFwcGVhciB0byBoYXZlIHNpZGUgZWZmZWN0cyBidXQgYXJlIHNhZmUgdG8gcmVtb3ZlIGlmIHRoZSBhc3NvY2lhdGVkIGNsYXNzXG4gKiBpcyBvdGhlcndpc2UgdW51c2VkIHdpdGhpbiB0aGUgb3V0cHV0LlxuICovXG5jb25zdCBhbmd1bGFyU3RhdGljc1RvV3JhcCA9IG5ldyBTZXQoW1xuICAnybVjbXAnLFxuICAnybVkaXInLFxuICAnybVmYWMnLFxuICAnybVpbmonLFxuICAnybVtb2QnLFxuICAnybVwaXBlJyxcbiAgJ8m1cHJvdicsXG4gICdJTkpFQ1RPUl9LRVknLFxuXSk7XG5cbi8qKlxuICogQW4gb2JqZWN0IG1hcCBvZiBzdGF0aWMgZmllbGRzIGFuZCByZWxhdGVkIHZhbHVlIGNoZWNrcyBmb3IgZGlzY292ZXJ5IG9mIEFuZ3VsYXIgZ2VuZXJhdGVkXG4gKiBKSVQgcmVsYXRlZCBzdGF0aWMgZmllbGRzLlxuICovXG5jb25zdCBhbmd1bGFyU3RhdGljc1RvRWxpZGU6IFJlY29yZDxzdHJpbmcsIChwYXRoOiBOb2RlUGF0aDx0eXBlcy5FeHByZXNzaW9uPikgPT4gYm9vbGVhbj4gPSB7XG4gICdjdG9yUGFyYW1ldGVycycocGF0aCkge1xuICAgIHJldHVybiBwYXRoLmlzRnVuY3Rpb25FeHByZXNzaW9uKCkgfHwgcGF0aC5pc0Fycm93RnVuY3Rpb25FeHByZXNzaW9uKCk7XG4gIH0sXG4gICdkZWNvcmF0b3JzJyhwYXRoKSB7XG4gICAgcmV0dXJuIHBhdGguaXNBcnJheUV4cHJlc3Npb24oKTtcbiAgfSxcbiAgJ3Byb3BEZWNvcmF0b3JzJyhwYXRoKSB7XG4gICAgcmV0dXJuIHBhdGguaXNPYmplY3RFeHByZXNzaW9uKCk7XG4gIH0sXG59O1xuXG4vKipcbiAqIFByb3ZpZGVzIG9uZSBvciBtb3JlIGtleXdvcmRzIHRoYXQgaWYgZm91bmQgd2l0aGluIHRoZSBjb250ZW50IG9mIGEgc291cmNlIGZpbGUgaW5kaWNhdGVcbiAqIHRoYXQgdGhpcyBwbHVnaW4gc2hvdWxkIGJlIHVzZWQgd2l0aCBhIHNvdXJjZSBmaWxlLlxuICpcbiAqIEByZXR1cm5zIEFuIGEgc3RyaW5nIGl0ZXJhYmxlIGNvbnRhaW5pbmcgb25lIG9yIG1vcmUga2V5d29yZHMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRLZXl3b3JkcygpOiBJdGVyYWJsZTxzdHJpbmc+IHtcbiAgcmV0dXJuIFsnY2xhc3MnXTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmVzIHdoZXRoZXIgYSBwcm9wZXJ0eSBhbmQgaXRzIGluaXRpYWxpemVyIHZhbHVlIGNhbiBiZSBzYWZlbHkgd3JhcHBlZCBpbiBhIHB1cmVcbiAqIGFubm90YXRlZCBJSUZFLiBWYWx1ZXMgdGhhdCBtYXkgY2F1c2Ugc2lkZSBlZmZlY3RzIGFyZSBub3QgY29uc2lkZXJlZCBzYWZlIHRvIHdyYXAuXG4gKiBXcmFwcGluZyBzdWNoIHZhbHVlcyBtYXkgY2F1c2UgcnVudGltZSBlcnJvcnMgYW5kL29yIGluY29ycmVjdCBydW50aW1lIGJlaGF2aW9yLlxuICpcbiAqIEBwYXJhbSBwcm9wZXJ0eU5hbWUgVGhlIG5hbWUgb2YgdGhlIHByb3BlcnR5IHRvIGFuYWx5emUuXG4gKiBAcGFyYW0gYXNzaWdubWVudFZhbHVlIFRoZSBpbml0aWFsaXplciB2YWx1ZSB0aGF0IHdpbGwgYmUgYXNzaWduZWQgdG8gdGhlIHByb3BlcnR5LlxuICogQHJldHVybnMgSWYgdGhlIHByb3BlcnR5IGNhbiBiZSBzYWZlbHkgd3JhcHBlZCwgdGhlbiB0cnVlOyBvdGhlcndpc2UsIGZhbHNlLlxuICovXG5mdW5jdGlvbiBjYW5XcmFwUHJvcGVydHkocHJvcGVydHlOYW1lOiBzdHJpbmcsIGFzc2lnbm1lbnRWYWx1ZTogTm9kZVBhdGgpOiBib29sZWFuIHtcbiAgaWYgKGFuZ3VsYXJTdGF0aWNzVG9XcmFwLmhhcyhwcm9wZXJ0eU5hbWUpKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBjb25zdCB7IGxlYWRpbmdDb21tZW50cyB9ID0gYXNzaWdubWVudFZhbHVlLm5vZGUgYXMgeyBsZWFkaW5nQ29tbWVudHM/OiB7IHZhbHVlOiBzdHJpbmcgfVtdIH07XG4gIGlmIChcbiAgICBsZWFkaW5nQ29tbWVudHM/LnNvbWUoXG4gICAgICAvLyBgQHB1cmVPckJyZWFrTXlDb2RlYCBpcyB1c2VkIGJ5IGNsb3N1cmUgYW5kIGlzIHByZXNlbnQgaW4gQW5ndWxhciBjb2RlXG4gICAgICAoeyB2YWx1ZSB9KSA9PlxuICAgICAgICB2YWx1ZS5pbmNsdWRlcygnQF9fUFVSRV9fJykgfHxcbiAgICAgICAgdmFsdWUuaW5jbHVkZXMoJyNfX1BVUkVfXycpIHx8XG4gICAgICAgIHZhbHVlLmluY2x1ZGVzKCdAcHVyZU9yQnJlYWtNeUNvZGUnKSxcbiAgICApXG4gICkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIGFzc2lnbm1lbnRWYWx1ZS5pc1B1cmUoKTtcbn1cblxuLyoqXG4gKiBBbmFseXplIHRoZSBzaWJsaW5nIG5vZGVzIG9mIGEgY2xhc3MgdG8gZGV0ZXJtaW5lIGlmIGFueSBkb3dubGV2ZWwgZWxlbWVudHMgc2hvdWxkIGJlXG4gKiB3cmFwcGVkIGluIGEgcHVyZSBhbm5vdGF0ZWQgSUlGRS4gQWxzbyBkZXRlcm1pbmVzIGlmIGFueSBlbGVtZW50cyBoYXZlIHBvdGVudGlhbCBzaWRlXG4gKiBlZmZlY3RzLlxuICpcbiAqIEBwYXJhbSBvcmlnaW4gVGhlIHN0YXJ0aW5nIE5vZGVQYXRoIGxvY2F0aW9uIGZvciBhbmFseXppbmcgc2libGluZ3MuXG4gKiBAcGFyYW0gY2xhc3NJZGVudGlmaWVyIFRoZSBpZGVudGlmaWVyIG5vZGUgdGhhdCByZXByZXNlbnRzIHRoZSBuYW1lIG9mIHRoZSBjbGFzcy5cbiAqIEBwYXJhbSBhbGxvd1dyYXBwaW5nRGVjb3JhdG9ycyBXaGV0aGVyIHRvIGFsbG93IGRlY29yYXRvcnMgdG8gYmUgd3JhcHBlZC5cbiAqIEByZXR1cm5zIEFuIG9iamVjdCBjb250YWluaW5nIHRoZSByZXN1bHRzIG9mIHRoZSBhbmFseXNpcy5cbiAqL1xuZnVuY3Rpb24gYW5hbHl6ZUNsYXNzU2libGluZ3MoXG4gIG9yaWdpbjogTm9kZVBhdGgsXG4gIGNsYXNzSWRlbnRpZmllcjogdHlwZXMuSWRlbnRpZmllcixcbiAgYWxsb3dXcmFwcGluZ0RlY29yYXRvcnM6IGJvb2xlYW4sXG4pOiB7IGhhc1BvdGVudGlhbFNpZGVFZmZlY3RzOiBib29sZWFuOyB3cmFwU3RhdGVtZW50UGF0aHM6IE5vZGVQYXRoPHR5cGVzLlN0YXRlbWVudD5bXSB9IHtcbiAgY29uc3Qgd3JhcFN0YXRlbWVudFBhdGhzOiBOb2RlUGF0aDx0eXBlcy5TdGF0ZW1lbnQ+W10gPSBbXTtcbiAgbGV0IGhhc1BvdGVudGlhbFNpZGVFZmZlY3RzID0gZmFsc2U7XG4gIGZvciAobGV0IGkgPSAxOyA7ICsraSkge1xuICAgIGNvbnN0IG5leHRTdGF0ZW1lbnQgPSBvcmlnaW4uZ2V0U2libGluZygrb3JpZ2luLmtleSArIGkpO1xuICAgIGlmICghbmV4dFN0YXRlbWVudC5pc0V4cHJlc3Npb25TdGF0ZW1lbnQoKSkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgLy8gVmFsaWQgc2libGluZyBzdGF0ZW1lbnRzIGZvciBjbGFzcyBkZWNsYXJhdGlvbnMgYXJlIG9ubHkgYXNzaWdubWVudCBleHByZXNzaW9uc1xuICAgIC8vIGFuZCBUeXBlU2NyaXB0IGRlY29yYXRvciBoZWxwZXIgY2FsbCBleHByZXNzaW9uc1xuICAgIGNvbnN0IG5leHRFeHByZXNzaW9uID0gbmV4dFN0YXRlbWVudC5nZXQoJ2V4cHJlc3Npb24nKTtcbiAgICBpZiAobmV4dEV4cHJlc3Npb24uaXNDYWxsRXhwcmVzc2lvbigpKSB7XG4gICAgICBpZiAoXG4gICAgICAgICF0eXBlcy5pc0lkZW50aWZpZXIobmV4dEV4cHJlc3Npb24ubm9kZS5jYWxsZWUpIHx8XG4gICAgICAgIG5leHRFeHByZXNzaW9uLm5vZGUuY2FsbGVlLm5hbWUgIT09IFRTTElCX0RFQ09SQVRFX0hFTFBFUl9OQU1FXG4gICAgICApIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIGlmIChhbGxvd1dyYXBwaW5nRGVjb3JhdG9ycykge1xuICAgICAgICB3cmFwU3RhdGVtZW50UGF0aHMucHVzaChuZXh0U3RhdGVtZW50KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFN0YXRlbWVudCBjYW5ub3QgYmUgc2FmZWx5IHdyYXBwZWQgd2hpY2ggbWFrZXMgd3JhcHBpbmcgdGhlIGNsYXNzIHVubmVlZGVkLlxuICAgICAgICAvLyBUaGUgc3RhdGVtZW50IHdpbGwgcHJldmVudCBldmVuIGEgd3JhcHBlZCBjbGFzcyBmcm9tIGJlaW5nIG9wdGltaXplZCBhd2F5LlxuICAgICAgICBoYXNQb3RlbnRpYWxTaWRlRWZmZWN0cyA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIGNvbnRpbnVlO1xuICAgIH0gZWxzZSBpZiAoIW5leHRFeHByZXNzaW9uLmlzQXNzaWdubWVudEV4cHJlc3Npb24oKSkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgLy8gVmFsaWQgYXNzaWdubWVudCBleHByZXNzaW9ucyBzaG91bGQgYmUgbWVtYmVyIGFjY2VzcyBleHByZXNzaW9ucyB1c2luZyB0aGUgY2xhc3NcbiAgICAvLyBuYW1lIGFzIHRoZSBvYmplY3QgYW5kIGFuIGlkZW50aWZpZXIgYXMgdGhlIHByb3BlcnR5IGZvciBzdGF0aWMgZmllbGRzIG9yIG9ubHlcbiAgICAvLyB0aGUgY2xhc3MgbmFtZSBmb3IgZGVjb3JhdG9ycy5cbiAgICBjb25zdCBsZWZ0ID0gbmV4dEV4cHJlc3Npb24uZ2V0KCdsZWZ0Jyk7XG4gICAgaWYgKGxlZnQuaXNJZGVudGlmaWVyKCkpIHtcbiAgICAgIGlmIChcbiAgICAgICAgIWxlZnQuc2NvcGUuYmluZGluZ0lkZW50aWZpZXJFcXVhbHMobGVmdC5ub2RlLm5hbWUsIGNsYXNzSWRlbnRpZmllcikgfHxcbiAgICAgICAgIXR5cGVzLmlzQ2FsbEV4cHJlc3Npb24obmV4dEV4cHJlc3Npb24ubm9kZS5yaWdodCkgfHxcbiAgICAgICAgIXR5cGVzLmlzSWRlbnRpZmllcihuZXh0RXhwcmVzc2lvbi5ub2RlLnJpZ2h0LmNhbGxlZSkgfHxcbiAgICAgICAgbmV4dEV4cHJlc3Npb24ubm9kZS5yaWdodC5jYWxsZWUubmFtZSAhPT0gVFNMSUJfREVDT1JBVEVfSEVMUEVSX05BTUVcbiAgICAgICkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgaWYgKGFsbG93V3JhcHBpbmdEZWNvcmF0b3JzKSB7XG4gICAgICAgIHdyYXBTdGF0ZW1lbnRQYXRocy5wdXNoKG5leHRTdGF0ZW1lbnQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gU3RhdGVtZW50IGNhbm5vdCBiZSBzYWZlbHkgd3JhcHBlZCB3aGljaCBtYWtlcyB3cmFwcGluZyB0aGUgY2xhc3MgdW5uZWVkZWQuXG4gICAgICAgIC8vIFRoZSBzdGF0ZW1lbnQgd2lsbCBwcmV2ZW50IGV2ZW4gYSB3cmFwcGVkIGNsYXNzIGZyb20gYmVpbmcgb3B0aW1pemVkIGF3YXkuXG4gICAgICAgIGhhc1BvdGVudGlhbFNpZGVFZmZlY3RzID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgY29udGludWU7XG4gICAgfSBlbHNlIGlmIChcbiAgICAgICFsZWZ0LmlzTWVtYmVyRXhwcmVzc2lvbigpIHx8XG4gICAgICAhdHlwZXMuaXNJZGVudGlmaWVyKGxlZnQubm9kZS5vYmplY3QpIHx8XG4gICAgICAhbGVmdC5zY29wZS5iaW5kaW5nSWRlbnRpZmllckVxdWFscyhsZWZ0Lm5vZGUub2JqZWN0Lm5hbWUsIGNsYXNzSWRlbnRpZmllcikgfHxcbiAgICAgICF0eXBlcy5pc0lkZW50aWZpZXIobGVmdC5ub2RlLnByb3BlcnR5KVxuICAgICkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgY29uc3QgcHJvcGVydHlOYW1lID0gbGVmdC5ub2RlLnByb3BlcnR5Lm5hbWU7XG4gICAgY29uc3QgYXNzaWdubWVudFZhbHVlID0gbmV4dEV4cHJlc3Npb24uZ2V0KCdyaWdodCcpO1xuICAgIGlmIChhbmd1bGFyU3RhdGljc1RvRWxpZGVbcHJvcGVydHlOYW1lXT8uKGFzc2lnbm1lbnRWYWx1ZSkpIHtcbiAgICAgIG5leHRTdGF0ZW1lbnQucmVtb3ZlKCk7XG4gICAgICAtLWk7XG4gICAgfSBlbHNlIGlmIChjYW5XcmFwUHJvcGVydHkocHJvcGVydHlOYW1lLCBhc3NpZ25tZW50VmFsdWUpKSB7XG4gICAgICB3cmFwU3RhdGVtZW50UGF0aHMucHVzaChuZXh0U3RhdGVtZW50KTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gU3RhdGVtZW50IGNhbm5vdCBiZSBzYWZlbHkgd3JhcHBlZCB3aGljaCBtYWtlcyB3cmFwcGluZyB0aGUgY2xhc3MgdW5uZWVkZWQuXG4gICAgICAvLyBUaGUgc3RhdGVtZW50IHdpbGwgcHJldmVudCBldmVuIGEgd3JhcHBlZCBjbGFzcyBmcm9tIGJlaW5nIG9wdGltaXplZCBhd2F5LlxuICAgICAgaGFzUG90ZW50aWFsU2lkZUVmZmVjdHMgPSB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7IGhhc1BvdGVudGlhbFNpZGVFZmZlY3RzLCB3cmFwU3RhdGVtZW50UGF0aHMgfTtcbn1cblxuLyoqXG4gKiBUaGUgc2V0IG9mIGNsYXNzZXMgYWxyZWFkeSB2aXNpdGVkIGFuZCBhbmFseXplZCBkdXJpbmcgdGhlIHBsdWdpbidzIGV4ZWN1dGlvbi5cbiAqIFRoaXMgaXMgdXNlZCB0byBwcmV2ZW50IGFkanVzdGVkIGNsYXNzZXMgZnJvbSBiZWluZyByZXBlYXRlZGx5IGFuYWx5emVkIHdoaWNoIGNhbiBsZWFkXG4gKiB0byBhbiBpbmZpbml0ZSBsb29wLlxuICovXG5jb25zdCB2aXNpdGVkQ2xhc3NlcyA9IG5ldyBXZWFrU2V0PHR5cGVzLkNsYXNzPigpO1xuXG4vKipcbiAqIEEgbWFwIG9mIGNsYXNzZXMgdGhhdCBoYXZlIGFscmVhZHkgYmVlbiBhbmFseXplZCBkdXJpbmcgdGhlIGRlZmF1bHQgZXhwb3J0IHNwbGl0dGluZyBzdGVwLlxuICogVGhpcyBpcyB1c2VkIHRvIGF2b2lkIGFuYWx5emluZyBhIGNsYXNzIGRlY2xhcmF0aW9uIHR3aWNlIGlmIGl0IGlzIGEgZGlyZWN0IGRlZmF1bHQgZXhwb3J0LlxuICovXG5jb25zdCBleHBvcnREZWZhdWx0QW5hbHlzaXMgPSBuZXcgV2Vha01hcDx0eXBlcy5DbGFzcywgUmV0dXJuVHlwZTx0eXBlb2YgYW5hbHl6ZUNsYXNzU2libGluZ3M+PigpO1xuXG4vKipcbiAqIEEgYmFiZWwgcGx1Z2luIGZhY3RvcnkgZnVuY3Rpb24gZm9yIGFkanVzdGluZyBjbGFzc2VzOyBwcmltYXJpbHkgd2l0aCBBbmd1bGFyIG1ldGFkYXRhLlxuICogVGhlIGFkanVzdG1lbnRzIGluY2x1ZGUgd3JhcHBpbmcgY2xhc3NlcyB3aXRoIGtub3duIHNhZmUgb3Igbm8gc2lkZSBlZmZlY3RzIHdpdGggcHVyZVxuICogYW5ub3RhdGlvbnMgdG8gc3VwcG9ydCBkZWFkIGNvZGUgcmVtb3ZhbCBvZiB1bnVzZWQgY2xhc3Nlcy4gQW5ndWxhciBjb21waWxlciBnZW5lcmF0ZWRcbiAqIG1ldGFkYXRhIHN0YXRpYyBmaWVsZHMgbm90IHJlcXVpcmVkIGluIEFPVCBtb2RlIGFyZSBhbHNvIGVsaWRlZCB0byBiZXR0ZXIgc3VwcG9ydCBidW5kbGVyLVxuICogbGV2ZWwgdHJlZXNoYWtpbmcuXG4gKlxuICogQHJldHVybnMgQSBiYWJlbCBwbHVnaW4gb2JqZWN0IGluc3RhbmNlLlxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiAoKTogUGx1Z2luT2JqIHtcbiAgcmV0dXJuIHtcbiAgICB2aXNpdG9yOiB7XG4gICAgICAvLyBXaGVuIGEgY2xhc3MgaXMgY29udmVydGVkIHRvIGEgdmFyaWFibGUgZGVjbGFyYXRpb24sIHRoZSBkZWZhdWx0IGV4cG9ydCBtdXN0IGJlIG1vdmVkXG4gICAgICAvLyB0byBhIHN1YnNlcXVlbnQgc3RhdGVtZW50IHRvIHByZXZlbnQgYSBKYXZhU2NyaXB0IHN5bnRheCBlcnJvci5cbiAgICAgIEV4cG9ydERlZmF1bHREZWNsYXJhdGlvbihwYXRoOiBOb2RlUGF0aDx0eXBlcy5FeHBvcnREZWZhdWx0RGVjbGFyYXRpb24+LCBzdGF0ZTogUGx1Z2luUGFzcykge1xuICAgICAgICBjb25zdCBkZWNsYXJhdGlvbiA9IHBhdGguZ2V0KCdkZWNsYXJhdGlvbicpO1xuICAgICAgICBpZiAoIWRlY2xhcmF0aW9uLmlzQ2xhc3NEZWNsYXJhdGlvbigpKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgeyB3cmFwRGVjb3JhdG9ycyB9ID0gc3RhdGUub3B0cyBhcyB7IHdyYXBEZWNvcmF0b3JzOiBib29sZWFuIH07XG4gICAgICAgIGNvbnN0IGFuYWx5c2lzID0gYW5hbHl6ZUNsYXNzU2libGluZ3MocGF0aCwgZGVjbGFyYXRpb24ubm9kZS5pZCwgd3JhcERlY29yYXRvcnMpO1xuICAgICAgICBleHBvcnREZWZhdWx0QW5hbHlzaXMuc2V0KGRlY2xhcmF0aW9uLm5vZGUsIGFuYWx5c2lzKTtcblxuICAgICAgICAvLyBTcGxpdHRpbmcgdGhlIGV4cG9ydCBkZWNsYXJhdGlvbiBpcyBub3QgbmVlZGVkIGlmIHRoZSBjbGFzcyB3aWxsIG5vdCBiZSB3cmFwcGVkXG4gICAgICAgIGlmIChhbmFseXNpcy5oYXNQb3RlbnRpYWxTaWRlRWZmZWN0cykge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHNwbGl0RXhwb3J0RGVjbGFyYXRpb24ocGF0aCk7XG4gICAgICB9LFxuICAgICAgQ2xhc3NEZWNsYXJhdGlvbihwYXRoOiBOb2RlUGF0aDx0eXBlcy5DbGFzc0RlY2xhcmF0aW9uPiwgc3RhdGU6IFBsdWdpblBhc3MpIHtcbiAgICAgICAgY29uc3QgeyBub2RlOiBjbGFzc05vZGUsIHBhcmVudFBhdGggfSA9IHBhdGg7XG4gICAgICAgIGNvbnN0IHsgd3JhcERlY29yYXRvcnMgfSA9IHN0YXRlLm9wdHMgYXMgeyB3cmFwRGVjb3JhdG9yczogYm9vbGVhbiB9O1xuXG4gICAgICAgIGlmICh2aXNpdGVkQ2xhc3Nlcy5oYXMoY2xhc3NOb2RlKSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEFuYWx5emUgc2libGluZyBzdGF0ZW1lbnRzIGZvciBlbGVtZW50cyBvZiB0aGUgY2xhc3MgdGhhdCB3ZXJlIGRvd25sZXZlbGVkXG4gICAgICAgIGNvbnN0IG9yaWdpbiA9IHBhcmVudFBhdGguaXNFeHBvcnROYW1lZERlY2xhcmF0aW9uKCkgPyBwYXJlbnRQYXRoIDogcGF0aDtcbiAgICAgICAgY29uc3QgeyB3cmFwU3RhdGVtZW50UGF0aHMsIGhhc1BvdGVudGlhbFNpZGVFZmZlY3RzIH0gPVxuICAgICAgICAgIGV4cG9ydERlZmF1bHRBbmFseXNpcy5nZXQoY2xhc3NOb2RlKSA/P1xuICAgICAgICAgIGFuYWx5emVDbGFzc1NpYmxpbmdzKG9yaWdpbiwgY2xhc3NOb2RlLmlkLCB3cmFwRGVjb3JhdG9ycyk7XG5cbiAgICAgICAgdmlzaXRlZENsYXNzZXMuYWRkKGNsYXNzTm9kZSk7XG5cbiAgICAgICAgaWYgKGhhc1BvdGVudGlhbFNpZGVFZmZlY3RzKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSWYgbm8gc3RhdGVtZW50cyB0byB3cmFwLCBjaGVjayBmb3Igc3RhdGljIGNsYXNzIHByb3BlcnRpZXMuXG4gICAgICAgIC8vIFN0YXRpYyBjbGFzcyBwcm9wZXJ0aWVzIG1heSBiZSBkb3dubGV2ZWxlZCBhdCBsYXRlciBzdGFnZXMgaW4gdGhlIGJ1aWxkIHBpcGVsaW5lXG4gICAgICAgIC8vIHdoaWNoIHJlc3VsdHMgaW4gYWRkaXRpb25hbCBmdW5jdGlvbiBjYWxscyBvdXRzaWRlIHRoZSBjbGFzcyBib2R5LiBUaGVzZSBjYWxsc1xuICAgICAgICAvLyB0aGVuIGNhdXNlIHRoZSBjbGFzcyB0byBiZSByZWZlcmVuY2VkIGFuZCBub3QgZWxpZ2libGUgZm9yIHJlbW92YWwuIFNpbmNlIGl0IGlzXG4gICAgICAgIC8vIG5vdCBrbm93biBhdCB0aGlzIHN0YWdlIHdoZXRoZXIgdGhlIGNsYXNzIG5lZWRzIHRvIGJlIGRvd25sZXZlbGVkLCB0aGUgdHJhbnNmb3JtXG4gICAgICAgIC8vIHdyYXBzIGNsYXNzZXMgcHJlZW1wdGl2ZWx5IHRvIGFsbG93IGZvciBwb3RlbnRpYWwgcmVtb3ZhbCB3aXRoaW4gdGhlIG9wdGltaXphdGlvblxuICAgICAgICAvLyBzdGFnZXMuXG4gICAgICAgIGlmICh3cmFwU3RhdGVtZW50UGF0aHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgbGV0IHNob3VsZFdyYXAgPSBmYWxzZTtcbiAgICAgICAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2YgcGF0aC5nZXQoJ2JvZHknKS5nZXQoJ2JvZHknKSkge1xuICAgICAgICAgICAgaWYgKGVsZW1lbnQuaXNDbGFzc1Byb3BlcnR5KCkpIHtcbiAgICAgICAgICAgICAgLy8gT25seSBuZWVkIHRvIGFuYWx5emUgc3RhdGljIHByb3BlcnRpZXNcbiAgICAgICAgICAgICAgaWYgKCFlbGVtZW50Lm5vZGUuc3RhdGljKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAvLyBDaGVjayBmb3IgcG90ZW50aWFsIHNpZGUgZWZmZWN0cy5cbiAgICAgICAgICAgICAgLy8gVGhlc2UgY2hlY2tzIGFyZSBjb25zZXJ2YXRpdmUgYW5kIGNvdWxkIHBvdGVudGlhbGx5IGJlIGV4cGFuZGVkIGluIHRoZSBmdXR1cmUuXG4gICAgICAgICAgICAgIGNvbnN0IGVsZW1lbnRLZXkgPSBlbGVtZW50LmdldCgna2V5Jyk7XG4gICAgICAgICAgICAgIGNvbnN0IGVsZW1lbnRWYWx1ZSA9IGVsZW1lbnQuZ2V0KCd2YWx1ZScpO1xuICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgZWxlbWVudEtleS5pc0lkZW50aWZpZXIoKSAmJlxuICAgICAgICAgICAgICAgICghZWxlbWVudFZhbHVlLmlzRXhwcmVzc2lvbigpIHx8XG4gICAgICAgICAgICAgICAgICBjYW5XcmFwUHJvcGVydHkoZWxlbWVudEtleS5nZXQoJ25hbWUnKSwgZWxlbWVudFZhbHVlKSlcbiAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgc2hvdWxkV3JhcCA9IHRydWU7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gTm90IHNhZmUgdG8gd3JhcFxuICAgICAgICAgICAgICAgIHNob3VsZFdyYXAgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoIXNob3VsZFdyYXApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB3cmFwU3RhdGVtZW50Tm9kZXM6IHR5cGVzLlN0YXRlbWVudFtdID0gW107XG4gICAgICAgIGZvciAoY29uc3Qgc3RhdGVtZW50UGF0aCBvZiB3cmFwU3RhdGVtZW50UGF0aHMpIHtcbiAgICAgICAgICB3cmFwU3RhdGVtZW50Tm9kZXMucHVzaChzdGF0ZW1lbnRQYXRoLm5vZGUpO1xuICAgICAgICAgIHN0YXRlbWVudFBhdGgucmVtb3ZlKCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBXcmFwIGNsYXNzIGFuZCBzYWZlIHN0YXRpYyBhc3NpZ25tZW50cyBpbiBhIHB1cmUgYW5ub3RhdGVkIElJRkVcbiAgICAgICAgY29uc3QgY29udGFpbmVyID0gdHlwZXMuYXJyb3dGdW5jdGlvbkV4cHJlc3Npb24oXG4gICAgICAgICAgW10sXG4gICAgICAgICAgdHlwZXMuYmxvY2tTdGF0ZW1lbnQoW1xuICAgICAgICAgICAgY2xhc3NOb2RlLFxuICAgICAgICAgICAgLi4ud3JhcFN0YXRlbWVudE5vZGVzLFxuICAgICAgICAgICAgdHlwZXMucmV0dXJuU3RhdGVtZW50KHR5cGVzLmNsb25lTm9kZShjbGFzc05vZGUuaWQpKSxcbiAgICAgICAgICBdKSxcbiAgICAgICAgKTtcbiAgICAgICAgY29uc3QgcmVwbGFjZW1lbnRJbml0aWFsaXplciA9IHR5cGVzLmNhbGxFeHByZXNzaW9uKFxuICAgICAgICAgIHR5cGVzLnBhcmVudGhlc2l6ZWRFeHByZXNzaW9uKGNvbnRhaW5lciksXG4gICAgICAgICAgW10sXG4gICAgICAgICk7XG4gICAgICAgIGFubm90YXRlQXNQdXJlKHJlcGxhY2VtZW50SW5pdGlhbGl6ZXIpO1xuXG4gICAgICAgIC8vIFJlcGxhY2UgY2xhc3Mgd2l0aCBJSUZFIHdyYXBwZWQgY2xhc3NcbiAgICAgICAgY29uc3QgZGVjbGFyYXRpb24gPSB0eXBlcy52YXJpYWJsZURlY2xhcmF0aW9uKCdsZXQnLCBbXG4gICAgICAgICAgdHlwZXMudmFyaWFibGVEZWNsYXJhdG9yKHR5cGVzLmNsb25lTm9kZShjbGFzc05vZGUuaWQpLCByZXBsYWNlbWVudEluaXRpYWxpemVyKSxcbiAgICAgICAgXSk7XG4gICAgICAgIHBhdGgucmVwbGFjZVdpdGgoZGVjbGFyYXRpb24pO1xuICAgICAgfSxcbiAgICAgIENsYXNzRXhwcmVzc2lvbihwYXRoOiBOb2RlUGF0aDx0eXBlcy5DbGFzc0V4cHJlc3Npb24+LCBzdGF0ZTogUGx1Z2luUGFzcykge1xuICAgICAgICBjb25zdCB7IG5vZGU6IGNsYXNzTm9kZSwgcGFyZW50UGF0aCB9ID0gcGF0aDtcbiAgICAgICAgY29uc3QgeyB3cmFwRGVjb3JhdG9ycyB9ID0gc3RhdGUub3B0cyBhcyB7IHdyYXBEZWNvcmF0b3JzOiBib29sZWFuIH07XG5cbiAgICAgICAgLy8gQ2xhc3MgZXhwcmVzc2lvbnMgYXJlIHVzZWQgYnkgVHlwZVNjcmlwdCB0byByZXByZXNlbnQgZG93bmxldmVsIGNsYXNzL2NvbnN0cnVjdG9yIGRlY29yYXRvcnMuXG4gICAgICAgIC8vIElmIG5vdCB3cmFwcGluZyBkZWNvcmF0b3JzLCB0aGV5IGRvIG5vdCBuZWVkIHRvIGJlIHByb2Nlc3NlZC5cbiAgICAgICAgaWYgKCF3cmFwRGVjb3JhdG9ycyB8fCB2aXNpdGVkQ2xhc3Nlcy5oYXMoY2xhc3NOb2RlKSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChcbiAgICAgICAgICAhY2xhc3NOb2RlLmlkIHx8XG4gICAgICAgICAgIXBhcmVudFBhdGguaXNWYXJpYWJsZURlY2xhcmF0b3IoKSB8fFxuICAgICAgICAgICF0eXBlcy5pc0lkZW50aWZpZXIocGFyZW50UGF0aC5ub2RlLmlkKSB8fFxuICAgICAgICAgIHBhcmVudFBhdGgubm9kZS5pZC5uYW1lICE9PSBjbGFzc05vZGUuaWQubmFtZVxuICAgICAgICApIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBvcmlnaW4gPSBwYXJlbnRQYXRoLnBhcmVudFBhdGg7XG4gICAgICAgIGlmICghb3JpZ2luLmlzVmFyaWFibGVEZWNsYXJhdGlvbigpIHx8IG9yaWdpbi5ub2RlLmRlY2xhcmF0aW9ucy5sZW5ndGggIT09IDEpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB7IHdyYXBTdGF0ZW1lbnRQYXRocywgaGFzUG90ZW50aWFsU2lkZUVmZmVjdHMgfSA9IGFuYWx5emVDbGFzc1NpYmxpbmdzKFxuICAgICAgICAgIG9yaWdpbixcbiAgICAgICAgICBwYXJlbnRQYXRoLm5vZGUuaWQsXG4gICAgICAgICAgd3JhcERlY29yYXRvcnMsXG4gICAgICAgICk7XG5cbiAgICAgICAgdmlzaXRlZENsYXNzZXMuYWRkKGNsYXNzTm9kZSk7XG5cbiAgICAgICAgaWYgKGhhc1BvdGVudGlhbFNpZGVFZmZlY3RzIHx8IHdyYXBTdGF0ZW1lbnRQYXRocy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB3cmFwU3RhdGVtZW50Tm9kZXM6IHR5cGVzLlN0YXRlbWVudFtdID0gW107XG4gICAgICAgIGZvciAoY29uc3Qgc3RhdGVtZW50UGF0aCBvZiB3cmFwU3RhdGVtZW50UGF0aHMpIHtcbiAgICAgICAgICB3cmFwU3RhdGVtZW50Tm9kZXMucHVzaChzdGF0ZW1lbnRQYXRoLm5vZGUpO1xuICAgICAgICAgIHN0YXRlbWVudFBhdGgucmVtb3ZlKCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBXcmFwIGNsYXNzIGFuZCBzYWZlIHN0YXRpYyBhc3NpZ25tZW50cyBpbiBhIHB1cmUgYW5ub3RhdGVkIElJRkVcbiAgICAgICAgY29uc3QgY29udGFpbmVyID0gdHlwZXMuYXJyb3dGdW5jdGlvbkV4cHJlc3Npb24oXG4gICAgICAgICAgW10sXG4gICAgICAgICAgdHlwZXMuYmxvY2tTdGF0ZW1lbnQoW1xuICAgICAgICAgICAgdHlwZXMudmFyaWFibGVEZWNsYXJhdGlvbignbGV0JywgW1xuICAgICAgICAgICAgICB0eXBlcy52YXJpYWJsZURlY2xhcmF0b3IodHlwZXMuY2xvbmVOb2RlKGNsYXNzTm9kZS5pZCksIGNsYXNzTm9kZSksXG4gICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIC4uLndyYXBTdGF0ZW1lbnROb2RlcyxcbiAgICAgICAgICAgIHR5cGVzLnJldHVyblN0YXRlbWVudCh0eXBlcy5jbG9uZU5vZGUoY2xhc3NOb2RlLmlkKSksXG4gICAgICAgICAgXSksXG4gICAgICAgICk7XG4gICAgICAgIGNvbnN0IHJlcGxhY2VtZW50SW5pdGlhbGl6ZXIgPSB0eXBlcy5jYWxsRXhwcmVzc2lvbihcbiAgICAgICAgICB0eXBlcy5wYXJlbnRoZXNpemVkRXhwcmVzc2lvbihjb250YWluZXIpLFxuICAgICAgICAgIFtdLFxuICAgICAgICApO1xuICAgICAgICBhbm5vdGF0ZUFzUHVyZShyZXBsYWNlbWVudEluaXRpYWxpemVyKTtcblxuICAgICAgICAvLyBBZGQgdGhlIHdyYXBwZWQgY2xhc3MgZGlyZWN0bHkgdG8gdGhlIHZhcmlhYmxlIGRlY2xhcmF0aW9uXG4gICAgICAgIHBhcmVudFBhdGguZ2V0KCdpbml0JykucmVwbGFjZVdpdGgocmVwbGFjZW1lbnRJbml0aWFsaXplcik7XG4gICAgICB9LFxuICAgIH0sXG4gIH07XG59XG4iXX0=