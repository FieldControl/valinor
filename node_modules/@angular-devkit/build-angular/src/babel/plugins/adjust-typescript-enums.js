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
/**
 * Provides one or more keywords that if found within the content of a source file indicate
 * that this plugin should be used with a source file.
 *
 * @returns An a string iterable containing one or more keywords.
 */
function getKeywords() {
    return ['var'];
}
exports.getKeywords = getKeywords;
/**
 * A babel plugin factory function for adjusting TypeScript emitted enums.
 *
 * @returns A babel plugin object instance.
 */
function default_1() {
    return {
        visitor: {
            VariableDeclaration(path, state) {
                const { parentPath, node } = path;
                const { loose } = state.opts;
                if (node.kind !== 'var' || node.declarations.length !== 1) {
                    return;
                }
                const declaration = path.get('declarations')[0];
                if (declaration.node.init) {
                    return;
                }
                const declarationId = declaration.node.id;
                if (!core_1.types.isIdentifier(declarationId)) {
                    return;
                }
                const hasExport = parentPath.isExportNamedDeclaration() || parentPath.isExportDefaultDeclaration();
                const origin = hasExport ? parentPath : path;
                const nextStatement = origin.getSibling(+origin.key + 1);
                if (!nextStatement.isExpressionStatement()) {
                    return;
                }
                const nextExpression = nextStatement.get('expression');
                if (!nextExpression.isCallExpression() || nextExpression.node.arguments.length !== 1) {
                    return;
                }
                const enumCallArgument = nextExpression.node.arguments[0];
                if (!core_1.types.isLogicalExpression(enumCallArgument, { operator: '||' })) {
                    return;
                }
                // Check if identifiers match var declaration
                if (!core_1.types.isIdentifier(enumCallArgument.left) ||
                    !nextExpression.scope.bindingIdentifierEquals(enumCallArgument.left.name, declarationId)) {
                    return;
                }
                const enumCallee = nextExpression.get('callee');
                if (!enumCallee.isFunctionExpression() || enumCallee.node.params.length !== 1) {
                    return;
                }
                const enumCalleeParam = enumCallee.node.params[0];
                const isEnumCalleeMatching = core_1.types.isIdentifier(enumCalleeParam) && enumCalleeParam.name === declarationId.name;
                // Loose mode rewrites the enum to a shorter but less TypeScript-like form
                // Note: We only can apply the `loose` mode transformation if the callee parameter matches
                // with the declaration identifier name. This is necessary in case the the declaration id has
                // been renamed to avoid collisions, as the loose transform would then break the enum assignments
                // which rely on the differently-named callee identifier name.
                let enumAssignments;
                if (loose && isEnumCalleeMatching) {
                    enumAssignments = [];
                }
                // Check if all enum member values are pure.
                // If not, leave as-is due to potential side efects
                let hasElements = false;
                for (const enumStatement of enumCallee.get('body').get('body')) {
                    if (!enumStatement.isExpressionStatement()) {
                        return;
                    }
                    const enumValueAssignment = enumStatement.get('expression');
                    if (!enumValueAssignment.isAssignmentExpression() ||
                        !enumValueAssignment.get('right').isPure()) {
                        return;
                    }
                    hasElements = true;
                    enumAssignments === null || enumAssignments === void 0 ? void 0 : enumAssignments.push(enumStatement.node);
                }
                // If there are no enum elements then there is nothing to wrap
                if (!hasElements) {
                    return;
                }
                // Remove existing enum initializer
                const enumInitializer = nextExpression.node;
                nextExpression.remove();
                // Create IIFE block contents
                let blockContents;
                if (enumAssignments) {
                    // Loose mode
                    blockContents = [
                        core_1.types.expressionStatement(core_1.types.assignmentExpression('=', core_1.types.cloneNode(declarationId), core_1.types.logicalExpression('||', core_1.types.cloneNode(declarationId), core_1.types.objectExpression([])))),
                        ...enumAssignments,
                    ];
                }
                else {
                    blockContents = [core_1.types.expressionStatement(enumInitializer)];
                }
                // Wrap existing enum initializer in a pure annotated IIFE
                const container = core_1.types.arrowFunctionExpression([], core_1.types.blockStatement([
                    ...blockContents,
                    core_1.types.returnStatement(core_1.types.cloneNode(declarationId)),
                ]));
                const replacementInitializer = core_1.types.callExpression(core_1.types.parenthesizedExpression(container), []);
                (0, helper_annotate_as_pure_1.default)(replacementInitializer);
                // Add the wrapped enum initializer directly to the variable declaration
                declaration.get('init').replaceWith(replacementInitializer);
            },
        },
    };
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRqdXN0LXR5cGVzY3JpcHQtZW51bXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9hbmd1bGFyX2RldmtpdC9idWlsZF9hbmd1bGFyL3NyYy9iYWJlbC9wbHVnaW5zL2FkanVzdC10eXBlc2NyaXB0LWVudW1zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7Ozs7OztBQUVILHNDQUFxRTtBQUNyRSw2RkFBNEQ7QUFFNUQ7Ozs7O0dBS0c7QUFDSCxTQUFnQixXQUFXO0lBQ3pCLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNqQixDQUFDO0FBRkQsa0NBRUM7QUFFRDs7OztHQUlHO0FBQ0g7SUFDRSxPQUFPO1FBQ0wsT0FBTyxFQUFFO1lBQ1AsbUJBQW1CLENBQUMsSUFBeUMsRUFBRSxLQUFpQjtnQkFDOUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUM7Z0JBQ2xDLE1BQU0sRUFBRSxLQUFLLEVBQUUsR0FBRyxLQUFLLENBQUMsSUFBMEIsQ0FBQztnQkFFbkQsSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLEtBQUssSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7b0JBQ3pELE9BQU87aUJBQ1I7Z0JBRUQsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDaEQsSUFBSSxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRTtvQkFDekIsT0FBTztpQkFDUjtnQkFFRCxNQUFNLGFBQWEsR0FBRyxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztnQkFDMUMsSUFBSSxDQUFDLFlBQUssQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFDLEVBQUU7b0JBQ3RDLE9BQU87aUJBQ1I7Z0JBRUQsTUFBTSxTQUFTLEdBQ2IsVUFB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TUFBTSxDQUFDLENBQUMsV0FBVyxDQUFDLHNCQUFzQixDQUFDLENBQUM7WUFDOUQsQ0FBQztTQUNGO0tBQ0YsQ0FBQztBQUNKLENBQUM7QUF4SUQsNEJBd0lDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7IE5vZGVQYXRoLCBQbHVnaW5PYmosIFBsdWdpblBhc3MsIHR5cGVzIH0gZnJvbSAnQGJhYmVsL2NvcmUnO1xuaW1wb3J0IGFubm90YXRlQXNQdXJlIGZyb20gJ0BiYWJlbC9oZWxwZXItYW5ub3RhdGUtYXMtcHVyZSc7XG5cbi8qKlxuICogUHJvdmlkZXMgb25lIG9yIG1vcmUga2V5d29yZHMgdGhhdCBpZiBmb3VuZCB3aXRoaW4gdGhlIGNvbnRlbnQgb2YgYSBzb3VyY2UgZmlsZSBpbmRpY2F0ZVxuICogdGhhdCB0aGlzIHBsdWdpbiBzaG91bGQgYmUgdXNlZCB3aXRoIGEgc291cmNlIGZpbGUuXG4gKlxuICogQHJldHVybnMgQW4gYSBzdHJpbmcgaXRlcmFibGUgY29udGFpbmluZyBvbmUgb3IgbW9yZSBrZXl3b3Jkcy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEtleXdvcmRzKCk6IEl0ZXJhYmxlPHN0cmluZz4ge1xuICByZXR1cm4gWyd2YXInXTtcbn1cblxuLyoqXG4gKiBBIGJhYmVsIHBsdWdpbiBmYWN0b3J5IGZ1bmN0aW9uIGZvciBhZGp1c3RpbmcgVHlwZVNjcmlwdCBlbWl0dGVkIGVudW1zLlxuICpcbiAqIEByZXR1cm5zIEEgYmFiZWwgcGx1Z2luIG9iamVjdCBpbnN0YW5jZS5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKCk6IFBsdWdpbk9iaiB7XG4gIHJldHVybiB7XG4gICAgdmlzaXRvcjoge1xuICAgICAgVmFyaWFibGVEZWNsYXJhdGlvbihwYXRoOiBOb2RlUGF0aDx0eXBlcy5WYXJpYWJsZURlY2xhcmF0aW9uPiwgc3RhdGU6IFBsdWdpblBhc3MpIHtcbiAgICAgICAgY29uc3QgeyBwYXJlbnRQYXRoLCBub2RlIH0gPSBwYXRoO1xuICAgICAgICBjb25zdCB7IGxvb3NlIH0gPSBzdGF0ZS5vcHRzIGFzIHsgbG9vc2U6IGJvb2xlYW4gfTtcblxuICAgICAgICBpZiAobm9kZS5raW5kICE9PSAndmFyJyB8fCBub2RlLmRlY2xhcmF0aW9ucy5sZW5ndGggIT09IDEpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBkZWNsYXJhdGlvbiA9IHBhdGguZ2V0KCdkZWNsYXJhdGlvbnMnKVswXTtcbiAgICAgICAgaWYgKGRlY2xhcmF0aW9uLm5vZGUuaW5pdCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGRlY2xhcmF0aW9uSWQgPSBkZWNsYXJhdGlvbi5ub2RlLmlkO1xuICAgICAgICBpZiAoIXR5cGVzLmlzSWRlbnRpZmllcihkZWNsYXJhdGlvbklkKSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGhhc0V4cG9ydCA9XG4gICAgICAgICAgcGFyZW50UGF0aC5pc0V4cG9ydE5hbWVkRGVjbGFyYXRpb24oKSB8fCBwYXJlbnRQYXRoLmlzRXhwb3J0RGVmYXVsdERlY2xhcmF0aW9uKCk7XG4gICAgICAgIGNvbnN0IG9yaWdpbiA9IGhhc0V4cG9ydCA/IHBhcmVudFBhdGggOiBwYXRoO1xuICAgICAgICBjb25zdCBuZXh0U3RhdGVtZW50ID0gb3JpZ2luLmdldFNpYmxpbmcoK29yaWdpbi5rZXkgKyAxKTtcbiAgICAgICAgaWYgKCFuZXh0U3RhdGVtZW50LmlzRXhwcmVzc2lvblN0YXRlbWVudCgpKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbmV4dEV4cHJlc3Npb24gPSBuZXh0U3RhdGVtZW50LmdldCgnZXhwcmVzc2lvbicpO1xuICAgICAgICBpZiAoIW5leHRFeHByZXNzaW9uLmlzQ2FsbEV4cHJlc3Npb24oKSB8fCBuZXh0RXhwcmVzc2lvbi5ub2RlLmFyZ3VtZW50cy5sZW5ndGggIT09IDEpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBlbnVtQ2FsbEFyZ3VtZW50ID0gbmV4dEV4cHJlc3Npb24ubm9kZS5hcmd1bWVudHNbMF07XG4gICAgICAgIGlmICghdHlwZXMuaXNMb2dpY2FsRXhwcmVzc2lvbihlbnVtQ2FsbEFyZ3VtZW50LCB7IG9wZXJhdG9yOiAnfHwnIH0pKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2hlY2sgaWYgaWRlbnRpZmllcnMgbWF0Y2ggdmFyIGRlY2xhcmF0aW9uXG4gICAgICAgIGlmIChcbiAgICAgICAgICAhdHlwZXMuaXNJZGVudGlmaWVyKGVudW1DYWxsQXJndW1lbnQubGVmdCkgfHxcbiAgICAgICAgICAhbmV4dEV4cHJlc3Npb24uc2NvcGUuYmluZGluZ0lkZW50aWZpZXJFcXVhbHMoZW51bUNhbGxBcmd1bWVudC5sZWZ0Lm5hbWUsIGRlY2xhcmF0aW9uSWQpXG4gICAgICAgICkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGVudW1DYWxsZWUgPSBuZXh0RXhwcmVzc2lvbi5nZXQoJ2NhbGxlZScpO1xuICAgICAgICBpZiAoIWVudW1DYWxsZWUuaXNGdW5jdGlvbkV4cHJlc3Npb24oKSB8fCBlbnVtQ2FsbGVlLm5vZGUucGFyYW1zLmxlbmd0aCAhPT0gMSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGVudW1DYWxsZWVQYXJhbSA9IGVudW1DYWxsZWUubm9kZS5wYXJhbXNbMF07XG4gICAgICAgIGNvbnN0IGlzRW51bUNhbGxlZU1hdGNoaW5nID1cbiAgICAgICAgICB0eXBlcy5pc0lkZW50aWZpZXIoZW51bUNhbGxlZVBhcmFtKSAmJiBlbnVtQ2FsbGVlUGFyYW0ubmFtZSA9PT0gZGVjbGFyYXRpb25JZC5uYW1lO1xuXG4gICAgICAgIC8vIExvb3NlIG1vZGUgcmV3cml0ZXMgdGhlIGVudW0gdG8gYSBzaG9ydGVyIGJ1dCBsZXNzIFR5cGVTY3JpcHQtbGlrZSBmb3JtXG4gICAgICAgIC8vIE5vdGU6IFdlIG9ubHkgY2FuIGFwcGx5IHRoZSBgbG9vc2VgIG1vZGUgdHJhbnNmb3JtYXRpb24gaWYgdGhlIGNhbGxlZSBwYXJhbWV0ZXIgbWF0Y2hlc1xuICAgICAgICAvLyB3aXRoIHRoZSBkZWNsYXJhdGlvbiBpZGVudGlmaWVyIG5hbWUuIFRoaXMgaXMgbmVjZXNzYXJ5IGluIGNhc2UgdGhlIHRoZSBkZWNsYXJhdGlvbiBpZCBoYXNcbiAgICAgICAgLy8gYmVlbiByZW5hbWVkIHRvIGF2b2lkIGNvbGxpc2lvbnMsIGFzIHRoZSBsb29zZSB0cmFuc2Zvcm0gd291bGQgdGhlbiBicmVhayB0aGUgZW51bSBhc3NpZ25tZW50c1xuICAgICAgICAvLyB3aGljaCByZWx5IG9uIHRoZSBkaWZmZXJlbnRseS1uYW1lZCBjYWxsZWUgaWRlbnRpZmllciBuYW1lLlxuICAgICAgICBsZXQgZW51bUFzc2lnbm1lbnRzOiB0eXBlcy5FeHByZXNzaW9uU3RhdGVtZW50W10gfCB1bmRlZmluZWQ7XG4gICAgICAgIGlmIChsb29zZSAmJiBpc0VudW1DYWxsZWVNYXRjaGluZykge1xuICAgICAgICAgIGVudW1Bc3NpZ25tZW50cyA9IFtdO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2hlY2sgaWYgYWxsIGVudW0gbWVtYmVyIHZhbHVlcyBhcmUgcHVyZS5cbiAgICAgICAgLy8gSWYgbm90LCBsZWF2ZSBhcy1pcyBkdWUgdG8gcG90ZW50aWFsIHNpZGUgZWZlY3RzXG4gICAgICAgIGxldCBoYXNFbGVtZW50cyA9IGZhbHNlO1xuICAgICAgICBmb3IgKGNvbnN0IGVudW1TdGF0ZW1lbnQgb2YgZW51bUNhbGxlZS5nZXQoJ2JvZHknKS5nZXQoJ2JvZHknKSkge1xuICAgICAgICAgIGlmICghZW51bVN0YXRlbWVudC5pc0V4cHJlc3Npb25TdGF0ZW1lbnQoKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IGVudW1WYWx1ZUFzc2lnbm1lbnQgPSBlbnVtU3RhdGVtZW50LmdldCgnZXhwcmVzc2lvbicpO1xuICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICFlbnVtVmFsdWVBc3NpZ25tZW50LmlzQXNzaWdubWVudEV4cHJlc3Npb24oKSB8fFxuICAgICAgICAgICAgIWVudW1WYWx1ZUFzc2lnbm1lbnQuZ2V0KCdyaWdodCcpLmlzUHVyZSgpXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaGFzRWxlbWVudHMgPSB0cnVlO1xuICAgICAgICAgIGVudW1Bc3NpZ25tZW50cz8ucHVzaChlbnVtU3RhdGVtZW50Lm5vZGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSWYgdGhlcmUgYXJlIG5vIGVudW0gZWxlbWVudHMgdGhlbiB0aGVyZSBpcyBub3RoaW5nIHRvIHdyYXBcbiAgICAgICAgaWYgKCFoYXNFbGVtZW50cykge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJlbW92ZSBleGlzdGluZyBlbnVtIGluaXRpYWxpemVyXG4gICAgICAgIGNvbnN0IGVudW1Jbml0aWFsaXplciA9IG5leHRFeHByZXNzaW9uLm5vZGU7XG4gICAgICAgIG5leHRFeHByZXNzaW9uLnJlbW92ZSgpO1xuXG4gICAgICAgIC8vIENyZWF0ZSBJSUZFIGJsb2NrIGNvbnRlbnRzXG4gICAgICAgIGxldCBibG9ja0NvbnRlbnRzO1xuICAgICAgICBpZiAoZW51bUFzc2lnbm1lbnRzKSB7XG4gICAgICAgICAgLy8gTG9vc2UgbW9kZVxuICAgICAgICAgIGJsb2NrQ29udGVudHMgPSBbXG4gICAgICAgICAgICB0eXBlcy5leHByZXNzaW9uU3RhdGVtZW50KFxuICAgICAgICAgICAgICB0eXBlcy5hc3NpZ25tZW50RXhwcmVzc2lvbihcbiAgICAgICAgICAgICAgICAnPScsXG4gICAgICAgICAgICAgICAgdHlwZXMuY2xvbmVOb2RlKGRlY2xhcmF0aW9uSWQpLFxuICAgICAgICAgICAgICAgIHR5cGVzLmxvZ2ljYWxFeHByZXNzaW9uKFxuICAgICAgICAgICAgICAgICAgJ3x8JyxcbiAgICAgICAgICAgICAgICAgIHR5cGVzLmNsb25lTm9kZShkZWNsYXJhdGlvbklkKSxcbiAgICAgICAgICAgICAgICAgIHR5cGVzLm9iamVjdEV4cHJlc3Npb24oW10pLFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICksXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgLi4uZW51bUFzc2lnbm1lbnRzLFxuICAgICAgICAgIF07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYmxvY2tDb250ZW50cyA9IFt0eXBlcy5leHByZXNzaW9uU3RhdGVtZW50KGVudW1Jbml0aWFsaXplcildO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gV3JhcCBleGlzdGluZyBlbnVtIGluaXRpYWxpemVyIGluIGEgcHVyZSBhbm5vdGF0ZWQgSUlGRVxuICAgICAgICBjb25zdCBjb250YWluZXIgPSB0eXBlcy5hcnJvd0Z1bmN0aW9uRXhwcmVzc2lvbihcbiAgICAgICAgICBbXSxcbiAgICAgICAgICB0eXBlcy5ibG9ja1N0YXRlbWVudChbXG4gICAgICAgICAgICAuLi5ibG9ja0NvbnRlbnRzLFxuICAgICAgICAgICAgdHlwZXMucmV0dXJuU3RhdGVtZW50KHR5cGVzLmNsb25lTm9kZShkZWNsYXJhdGlvbklkKSksXG4gICAgICAgICAgXSksXG4gICAgICAgICk7XG4gICAgICAgIGNvbnN0IHJlcGxhY2VtZW50SW5pdGlhbGl6ZXIgPSB0eXBlcy5jYWxsRXhwcmVzc2lvbihcbiAgICAgICAgICB0eXBlcy5wYXJlbnRoZXNpemVkRXhwcmVzc2lvbihjb250YWluZXIpLFxuICAgICAgICAgIFtdLFxuICAgICAgICApO1xuICAgICAgICBhbm5vdGF0ZUFzUHVyZShyZXBsYWNlbWVudEluaXRpYWxpemVyKTtcblxuICAgICAgICAvLyBBZGQgdGhlIHdyYXBwZWQgZW51bSBpbml0aWFsaXplciBkaXJlY3RseSB0byB0aGUgdmFyaWFibGUgZGVjbGFyYXRpb25cbiAgICAgICAgZGVjbGFyYXRpb24uZ2V0KCdpbml0JykucmVwbGFjZVdpdGgocmVwbGFjZW1lbnRJbml0aWFsaXplcik7XG4gICAgICB9LFxuICAgIH0sXG4gIH07XG59XG4iXX0=