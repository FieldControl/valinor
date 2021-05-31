/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/core/schematics/migrations/navigation-extras-omissions/util", ["require", "exports", "typescript", "@angular/core/schematics/utils/typescript/imports", "@angular/core/schematics/utils/typescript/symbol"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.findLiteralsToMigrate = exports.migrateLiteral = void 0;
    const ts = require("typescript");
    const imports_1 = require("@angular/core/schematics/utils/typescript/imports");
    const symbol_1 = require("@angular/core/schematics/utils/typescript/symbol");
    /**
     * Configures the methods that the migration should be looking for
     * and the properties from `NavigationExtras` that should be preserved.
     */
    const methodConfig = new Map([
        ['navigateByUrl', new Set(['skipLocationChange', 'replaceUrl', 'state'])],
        [
            'createUrlTree',
            new Set([
                'relativeTo', 'queryParams', 'fragment', 'preserveQueryParams', 'queryParamsHandling',
                'preserveFragment'
            ])
        ]
    ]);
    function migrateLiteral(methodName, node) {
        const allowedProperties = methodConfig.get(methodName);
        if (!allowedProperties) {
            throw Error(`Attempting to migrate unconfigured method called ${methodName}.`);
        }
        const propertiesToKeep = [];
        const removedPropertyNames = [];
        node.properties.forEach(property => {
            // Only look for regular and shorthand property assignments since resolving things
            // like spread operators becomes too complicated for this migration.
            if ((ts.isPropertyAssignment(property) || ts.isShorthandPropertyAssignment(property)) &&
                (ts.isStringLiteralLike(property.name) || ts.isNumericLiteral(property.name) ||
                    ts.isIdentifier(property.name))) {
                if (allowedProperties.has(property.name.text)) {
                    propertiesToKeep.push(property);
                }
                else {
                    removedPropertyNames.push(property.name.text);
                }
            }
            else {
                propertiesToKeep.push(property);
            }
        });
        // Don't modify the node if there's nothing to remove.
        if (removedPropertyNames.length === 0) {
            return node;
        }
        // Note that the trailing/leading spaces are necessary so the comment looks good.
        const removalComment = ` Removed unsupported properties by Angular migration: ${removedPropertyNames.join(', ')}. `;
        if (propertiesToKeep.length > 0) {
            propertiesToKeep[0] = addUniqueLeadingComment(propertiesToKeep[0], removalComment);
            return ts.createObjectLiteral(propertiesToKeep);
        }
        else {
            return addUniqueLeadingComment(ts.createObjectLiteral(propertiesToKeep), removalComment);
        }
    }
    exports.migrateLiteral = migrateLiteral;
    function findLiteralsToMigrate(sourceFile, typeChecker) {
        const results = new Map(Array.from(methodConfig.keys(), key => [key, new Set()]));
        const routerImport = imports_1.getImportSpecifier(sourceFile, '@angular/router', 'Router');
        const seenLiterals = new Map();
        if (routerImport) {
            sourceFile.forEachChild(function visitNode(node) {
                var _a;
                // Look for calls that look like `foo.<method to migrate>` with more than one parameter.
                if (ts.isCallExpression(node) && node.arguments.length > 1 &&
                    ts.isPropertyAccessExpression(node.expression) && ts.isIdentifier(node.expression.name) &&
                    methodConfig.has(node.expression.name.text)) {
                    // Check whether the type of the object on which the
                    // function is called refers to the Router import.
                    if (symbol_1.isReferenceToImport(typeChecker, node.expression.expression, routerImport)) {
                        const methodName = node.expression.name.text;
                        const parameterDeclaration = (_a = typeChecker.getTypeAtLocation(node.arguments[1]).getSymbol()) === null || _a === void 0 ? void 0 : _a.valueDeclaration;
                        // Find the source of the object literal.
                        if (parameterDeclaration && ts.isObjectLiteralExpression(parameterDeclaration)) {
                            if (!seenLiterals.has(parameterDeclaration)) {
                                results.get(methodName).add(parameterDeclaration);
                                seenLiterals.set(parameterDeclaration, methodName);
                                // If the same literal has been passed into multiple different methods, we can't
                                // migrate it, because the supported properties are different. When we detect such
                                // a case, we drop it from the results so that it gets ignored. If it's used multiple
                                // times for the same method, it can still be migrated.
                            }
                            else if (seenLiterals.get(parameterDeclaration) !== methodName) {
                                results.forEach(literals => literals.delete(parameterDeclaration));
                            }
                        }
                    }
                }
                else {
                    node.forEachChild(visitNode);
                }
            });
        }
        return results;
    }
    exports.findLiteralsToMigrate = findLiteralsToMigrate;
    /** Adds a leading comment to a node, if the node doesn't have such a comment already. */
    function addUniqueLeadingComment(node, comment) {
        const existingComments = ts.getSyntheticLeadingComments(node);
        // This logic is primarily to ensure that we don't add the same comment multiple
        // times when tslint runs over the same file again with outdated information.
        if (!existingComments || existingComments.every(c => c.text !== comment)) {
            return ts.addSyntheticLeadingComment(node, ts.SyntaxKind.MultiLineCommentTrivia, comment);
        }
        return node;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc2NoZW1hdGljcy9taWdyYXRpb25zL25hdmlnYXRpb24tZXh0cmFzLW9taXNzaW9ucy91dGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQUVILGlDQUFpQztJQUVqQywrRUFBa0U7SUFDbEUsNkVBQWtFO0lBRWxFOzs7T0FHRztJQUNILE1BQU0sWUFBWSxHQUFHLElBQUksR0FBRyxDQUFzQjtRQUNoRCxDQUFDLGVBQWUsRUFBRSxJQUFJLEdBQUcsQ0FBUyxDQUFDLG9CQUFvQixFQUFFLFlBQVksRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBQ2pGO1lBQ0UsZUFBZTtZQUFFLElBQUksR0FBRyxDQUFTO2dCQUMvQixZQUFZLEVBQUUsYUFBYSxFQUFFLFVBQVUsRUFBRSxxQkFBcUIsRUFBRSxxQkFBcUI7Z0JBQ3JGLGtCQUFrQjthQUNuQixDQUFDO1NBQ0g7S0FDRixDQUFDLENBQUM7SUFFSCxTQUFnQixjQUFjLENBQzFCLFVBQWtCLEVBQUUsSUFBZ0M7UUFDdEQsTUFBTSxpQkFBaUIsR0FBRyxZQUFZLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBRXZELElBQUksQ0FBQyxpQkFBaUIsRUFBRTtZQUN0QixNQUFNLEtBQUssQ0FBQyxvREFBb0QsVUFBVSxHQUFHLENBQUMsQ0FBQztTQUNoRjtRQUVELE1BQU0sZ0JBQWdCLEdBQWtDLEVBQUUsQ0FBQztRQUMzRCxNQUFNLG9CQUFvQixHQUFhLEVBQUUsQ0FBQztRQUUxQyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRTtZQUNqQyxrRkFBa0Y7WUFDbEYsb0VBQW9FO1lBQ3BFLElBQUksQ0FBQyxFQUFFLENBQUMsb0JBQW9CLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLDZC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QUMsRUFBRTtZQUN4RSxPQUFPLEVBQUUsQ0FBQywwQkFBMEIsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxzQkFBc0IsRUFBRSxPQUFPLENBQUMsQ0FBQztTQUMzRjtRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcblxuaW1wb3J0IHtnZXRJbXBvcnRTcGVjaWZpZXJ9IGZyb20gJy4uLy4uL3V0aWxzL3R5cGVzY3JpcHQvaW1wb3J0cyc7XG5pbXBvcnQge2lzUmVmZXJlbmNlVG9JbXBvcnR9IGZyb20gJy4uLy4uL3V0aWxzL3R5cGVzY3JpcHQvc3ltYm9sJztcblxuLyoqXG4gKiBDb25maWd1cmVzIHRoZSBtZXRob2RzIHRoYXQgdGhlIG1pZ3JhdGlvbiBzaG91bGQgYmUgbG9va2luZyBmb3JcbiAqIGFuZCB0aGUgcHJvcGVydGllcyBmcm9tIGBOYXZpZ2F0aW9uRXh0cmFzYCB0aGF0IHNob3VsZCBiZSBwcmVzZXJ2ZWQuXG4gKi9cbmNvbnN0IG1ldGhvZENvbmZpZyA9IG5ldyBNYXA8c3RyaW5nLCBTZXQ8c3RyaW5nPj4oW1xuICBbJ25hdmlnYXRlQnlVcmwnLCBuZXcgU2V0PHN0cmluZz4oWydza2lwTG9jYXRpb25DaGFuZ2UnLCAncmVwbGFjZVVybCcsICdzdGF0ZSddKV0sXG4gIFtcbiAgICAnY3JlYXRlVXJsVHJlZScsIG5ldyBTZXQ8c3RyaW5nPihbXG4gICAgICAncmVsYXRpdmVUbycsICdxdWVyeVBhcmFtcycsICdmcmFnbWVudCcsICdwcmVzZXJ2ZVF1ZXJ5UGFyYW1zJywgJ3F1ZXJ5UGFyYW1zSGFuZGxpbmcnLFxuICAgICAgJ3ByZXNlcnZlRnJhZ21lbnQnXG4gICAgXSlcbiAgXVxuXSk7XG5cbmV4cG9ydCBmdW5jdGlvbiBtaWdyYXRlTGl0ZXJhbChcbiAgICBtZXRob2ROYW1lOiBzdHJpbmcsIG5vZGU6IHRzLk9iamVjdExpdGVyYWxFeHByZXNzaW9uKTogdHMuT2JqZWN0TGl0ZXJhbEV4cHJlc3Npb24ge1xuICBjb25zdCBhbGxvd2VkUHJvcGVydGllcyA9IG1ldGhvZENvbmZpZy5nZXQobWV0aG9kTmFtZSk7XG5cbiAgaWYgKCFhbGxvd2VkUHJvcGVydGllcykge1xuICAgIHRocm93IEVycm9yKGBBdHRlbXB0aW5nIHRvIG1pZ3JhdGUgdW5jb25maWd1cmVkIG1ldGhvZCBjYWxsZWQgJHttZXRob2ROYW1lfS5gKTtcbiAgfVxuXG4gIGNvbnN0IHByb3BlcnRpZXNUb0tlZXA6IHRzLk9iamVjdExpdGVyYWxFbGVtZW50TGlrZVtdID0gW107XG4gIGNvbnN0IHJlbW92ZWRQcm9wZXJ0eU5hbWVzOiBzdHJpbmdbXSA9IFtdO1xuXG4gIG5vZGUucHJvcGVydGllcy5mb3JFYWNoKHByb3BlcnR5ID0+IHtcbiAgICAvLyBPbmx5IGxvb2sgZm9yIHJlZ3VsYXIgYW5kIHNob3J0aGFuZCBwcm9wZXJ0eSBhc3NpZ25tZW50cyBzaW5jZSByZXNvbHZpbmcgdGhpbmdzXG4gICAgLy8gbGlrZSBzcHJlYWQgb3BlcmF0b3JzIGJlY29tZXMgdG9vIGNvbXBsaWNhdGVkIGZvciB0aGlzIG1pZ3JhdGlvbi5cbiAgICBpZiAoKHRzLmlzUHJvcGVydHlBc3NpZ25tZW50KHByb3BlcnR5KSB8fCB0cy5pc1Nob3J0aGFuZFByb3BlcnR5QXNzaWdubWVudChwcm9wZXJ0eSkpICYmXG4gICAgICAgICh0cy5pc1N0cmluZ0xpdGVyYWxMaWtlKHByb3BlcnR5Lm5hbWUpIHx8IHRzLmlzTnVtZXJpY0xpdGVyYWwocHJvcGVydHkubmFtZSkgfHxcbiAgICAgICAgIHRzLmlzSWRlbnRpZmllcihwcm9wZXJ0eS5uYW1lKSkpIHtcbiAgICAgIGlmIChhbGxvd2VkUHJvcGVydGllcy5oYXMocHJvcGVydHkubmFtZS50ZXh0KSkge1xuICAgICAgICBwcm9wZXJ0aWVzVG9LZWVwLnB1c2gocHJvcGVydHkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVtb3ZlZFByb3BlcnR5TmFtZXMucHVzaChwcm9wZXJ0eS5uYW1lLnRleHQpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBwcm9wZXJ0aWVzVG9LZWVwLnB1c2gocHJvcGVydHkpO1xuICAgIH1cbiAgfSk7XG5cbiAgLy8gRG9uJ3QgbW9kaWZ5IHRoZSBub2RlIGlmIHRoZXJlJ3Mgbm90aGluZyB0byByZW1vdmUuXG4gIGlmIChyZW1vdmVkUHJvcGVydHlOYW1lcy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gbm9kZTtcbiAgfVxuXG4gIC8vIE5vdGUgdGhhdCB0aGUgdHJhaWxpbmcvbGVhZGluZyBzcGFjZXMgYXJlIG5lY2Vzc2FyeSBzbyB0aGUgY29tbWVudCBsb29rcyBnb29kLlxuICBjb25zdCByZW1vdmFsQ29tbWVudCA9XG4gICAgICBgIFJlbW92ZWQgdW5zdXBwb3J0ZWQgcHJvcGVydGllcyBieSBBbmd1bGFyIG1pZ3JhdGlvbjogJHtyZW1vdmVkUHJvcGVydHlOYW1lcy5qb2luKCcsICcpfS4gYDtcblxuICBpZiAocHJvcGVydGllc1RvS2VlcC5sZW5ndGggPiAwKSB7XG4gICAgcHJvcGVydGllc1RvS2VlcFswXSA9IGFkZFVuaXF1ZUxlYWRpbmdDb21tZW50KHByb3BlcnRpZXNUb0tlZXBbMF0sIHJlbW92YWxDb21tZW50KTtcbiAgICByZXR1cm4gdHMuY3JlYXRlT2JqZWN0TGl0ZXJhbChwcm9wZXJ0aWVzVG9LZWVwKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gYWRkVW5pcXVlTGVhZGluZ0NvbW1lbnQodHMuY3JlYXRlT2JqZWN0TGl0ZXJhbChwcm9wZXJ0aWVzVG9LZWVwKSwgcmVtb3ZhbENvbW1lbnQpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmaW5kTGl0ZXJhbHNUb01pZ3JhdGUoc291cmNlRmlsZTogdHMuU291cmNlRmlsZSwgdHlwZUNoZWNrZXI6IHRzLlR5cGVDaGVja2VyKSB7XG4gIGNvbnN0IHJlc3VsdHMgPSBuZXcgTWFwPHN0cmluZywgU2V0PHRzLk9iamVjdExpdGVyYWxFeHByZXNzaW9uPj4oXG4gICAgICBBcnJheS5mcm9tKG1ldGhvZENvbmZpZy5rZXlzKCksIGtleSA9PiBba2V5LCBuZXcgU2V0KCldKSk7XG4gIGNvbnN0IHJvdXRlckltcG9ydCA9IGdldEltcG9ydFNwZWNpZmllcihzb3VyY2VGaWxlLCAnQGFuZ3VsYXIvcm91dGVyJywgJ1JvdXRlcicpO1xuICBjb25zdCBzZWVuTGl0ZXJhbHMgPSBuZXcgTWFwPHRzLk9iamVjdExpdGVyYWxFeHByZXNzaW9uLCBzdHJpbmc+KCk7XG5cbiAgaWYgKHJvdXRlckltcG9ydCkge1xuICAgIHNvdXJjZUZpbGUuZm9yRWFjaENoaWxkKGZ1bmN0aW9uIHZpc2l0Tm9kZShub2RlOiB0cy5Ob2RlKSB7XG4gICAgICAvLyBMb29rIGZvciBjYWxscyB0aGF0IGxvb2sgbGlrZSBgZm9vLjxtZXRob2QgdG8gbWlncmF0ZT5gIHdpdGggbW9yZSB0aGFuIG9uZSBwYXJhbWV0ZXIuXG4gICAgICBpZiAodHMuaXNDYWxsRXhwcmVzc2lvbihub2RlKSAmJiBub2RlLmFyZ3VtZW50cy5sZW5ndGggPiAxICYmXG4gICAgICAgICAgdHMuaXNQcm9wZXJ0eUFjY2Vzc0V4cHJlc3Npb24obm9kZS5leHByZXNzaW9uKSAmJiB0cy5pc0lkZW50aWZpZXIobm9kZS5leHByZXNzaW9uLm5hbWUpICYmXG4gICAgICAgICAgbWV0aG9kQ29uZmlnLmhhcyhub2RlLmV4cHJlc3Npb24ubmFtZS50ZXh0KSkge1xuICAgICAgICAvLyBDaGVjayB3aGV0aGVyIHRoZSB0eXBlIG9mIHRoZSBvYmplY3Qgb24gd2hpY2ggdGhlXG4gICAgICAgIC8vIGZ1bmN0aW9uIGlzIGNhbGxlZCByZWZlcnMgdG8gdGhlIFJvdXRlciBpbXBvcnQuXG4gICAgICAgIGlmIChpc1JlZmVyZW5jZVRvSW1wb3J0KHR5cGVDaGVja2VyLCBub2RlLmV4cHJlc3Npb24uZXhwcmVzc2lvbiwgcm91dGVySW1wb3J0KSkge1xuICAgICAgICAgIGNvbnN0IG1ldGhvZE5hbWUgPSBub2RlLmV4cHJlc3Npb24ubmFtZS50ZXh0O1xuICAgICAgICAgIGNvbnN0IHBhcmFtZXRlckRlY2xhcmF0aW9uID1cbiAgICAgICAgICAgICAgdHlwZUNoZWNrZXIuZ2V0VHlwZUF0TG9jYXRpb24obm9kZS5hcmd1bWVudHNbMV0pLmdldFN5bWJvbCgpPy52YWx1ZURlY2xhcmF0aW9uO1xuXG4gICAgICAgICAgLy8gRmluZCB0aGUgc291cmNlIG9mIHRoZSBvYmplY3QgbGl0ZXJhbC5cbiAgICAgICAgICBpZiAocGFyYW1ldGVyRGVjbGFyYXRpb24gJiYgdHMuaXNPYmplY3RMaXRlcmFsRXhwcmVzc2lvbihwYXJhbWV0ZXJEZWNsYXJhdGlvbikpIHtcbiAgICAgICAgICAgIGlmICghc2VlbkxpdGVyYWxzLmhhcyhwYXJhbWV0ZXJEZWNsYXJhdGlvbikpIHtcbiAgICAgICAgICAgICAgcmVzdWx0cy5nZXQobWV0aG9kTmFtZSkhLmFkZChwYXJhbWV0ZXJEZWNsYXJhdGlvbik7XG4gICAgICAgICAgICAgIHNlZW5MaXRlcmFscy5zZXQocGFyYW1ldGVyRGVjbGFyYXRpb24sIG1ldGhvZE5hbWUpO1xuICAgICAgICAgICAgICAvLyBJZiB0aGUgc2FtZSBsaXRlcmFsIGhhcyBiZWVuIHBhc3NlZCBpbnRvIG11bHRpcGxlIGRpZmZlcmVudCBtZXRob2RzLCB3ZSBjYW4ndFxuICAgICAgICAgICAgICAvLyBtaWdyYXRlIGl0LCBiZWNhdXNlIHRoZSBzdXBwb3J0ZWQgcHJvcGVydGllcyBhcmUgZGlmZmVyZW50LiBXaGVuIHdlIGRldGVjdCBzdWNoXG4gICAgICAgICAgICAgIC8vIGEgY2FzZSwgd2UgZHJvcCBpdCBmcm9tIHRoZSByZXN1bHRzIHNvIHRoYXQgaXQgZ2V0cyBpZ25vcmVkLiBJZiBpdCdzIHVzZWQgbXVsdGlwbGVcbiAgICAgICAgICAgICAgLy8gdGltZXMgZm9yIHRoZSBzYW1lIG1ldGhvZCwgaXQgY2FuIHN0aWxsIGJlIG1pZ3JhdGVkLlxuICAgICAgICAgICAgfSBlbHNlIGlmIChzZWVuTGl0ZXJhbHMuZ2V0KHBhcmFtZXRlckRlY2xhcmF0aW9uKSAhPT0gbWV0aG9kTmFtZSkge1xuICAgICAgICAgICAgICByZXN1bHRzLmZvckVhY2gobGl0ZXJhbHMgPT4gbGl0ZXJhbHMuZGVsZXRlKHBhcmFtZXRlckRlY2xhcmF0aW9uKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBub2RlLmZvckVhY2hDaGlsZCh2aXNpdE5vZGUpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIHJlc3VsdHM7XG59XG5cbi8qKiBBZGRzIGEgbGVhZGluZyBjb21tZW50IHRvIGEgbm9kZSwgaWYgdGhlIG5vZGUgZG9lc24ndCBoYXZlIHN1Y2ggYSBjb21tZW50IGFscmVhZHkuICovXG5mdW5jdGlvbiBhZGRVbmlxdWVMZWFkaW5nQ29tbWVudDxUIGV4dGVuZHMgdHMuTm9kZT4obm9kZTogVCwgY29tbWVudDogc3RyaW5nKTogVCB7XG4gIGNvbnN0IGV4aXN0aW5nQ29tbWVudHMgPSB0cy5nZXRTeW50aGV0aWNMZWFkaW5nQ29tbWVudHMobm9kZSk7XG5cbiAgLy8gVGhpcyBsb2dpYyBpcyBwcmltYXJpbHkgdG8gZW5zdXJlIHRoYXQgd2UgZG9uJ3QgYWRkIHRoZSBzYW1lIGNvbW1lbnQgbXVsdGlwbGVcbiAgLy8gdGltZXMgd2hlbiB0c2xpbnQgcnVucyBvdmVyIHRoZSBzYW1lIGZpbGUgYWdhaW4gd2l0aCBvdXRkYXRlZCBpbmZvcm1hdGlvbi5cbiAgaWYgKCFleGlzdGluZ0NvbW1lbnRzIHx8IGV4aXN0aW5nQ29tbWVudHMuZXZlcnkoYyA9PiBjLnRleHQgIT09IGNvbW1lbnQpKSB7XG4gICAgcmV0dXJuIHRzLmFkZFN5bnRoZXRpY0xlYWRpbmdDb21tZW50KG5vZGUsIHRzLlN5bnRheEtpbmQuTXVsdGlMaW5lQ29tbWVudFRyaXZpYSwgY29tbWVudCk7XG4gIH1cblxuICByZXR1cm4gbm9kZTtcbn1cbiJdfQ==