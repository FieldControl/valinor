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
        define("@angular/core/schematics/migrations/router-preserve-query-params/util", ["require", "exports", "typescript", "@angular/core/schematics/utils/typescript/imports", "@angular/core/schematics/utils/typescript/symbol"], factory);
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
    const methodConfig = new Set(['navigate', 'createUrlTree']);
    const preserveQueryParamsKey = 'preserveQueryParams';
    function migrateLiteral(methodName, node) {
        var _a;
        const isMigratableMethod = methodConfig.has(methodName);
        if (!isMigratableMethod) {
            throw Error(`Attempting to migrate unconfigured method called ${methodName}.`);
        }
        const propertiesToKeep = [];
        let propertyToMigrate = undefined;
        for (const property of node.properties) {
            // Only look for regular and shorthand property assignments since resolving things
            // like spread operators becomes too complicated for this migration.
            if ((ts.isPropertyAssignment(property) || ts.isShorthandPropertyAssignment(property)) &&
                (ts.isStringLiteralLike(property.name) || ts.isNumericLiteral(property.name) ||
                    ts.isIdentifier(property.name)) &&
                (property.name.text === preserveQueryParamsKey)) {
                propertyToMigrate = property;
                continue;
            }
            propertiesToKeep.push(property);
        }
        // Don't modify the node if there's nothing to migrate.
        if (propertyToMigrate === undefined) {
            return node;
        }
        if ((ts.isShorthandPropertyAssignment(propertyToMigrate) &&
            ((_a = propertyToMigrate.objectAssignmentInitializer) === null || _a === void 0 ? void 0 : _a.kind) === ts.SyntaxKind.TrueKeyword) ||
            (ts.isPropertyAssignment(propertyToMigrate) &&
                propertyToMigrate.initializer.kind === ts.SyntaxKind.TrueKeyword)) {
            return ts.updateObjectLiteral(node, propertiesToKeep.concat(ts.createPropertyAssignment('queryParamsHandling', ts.createIdentifier(`'preserve'`))));
        }
        return ts.updateObjectLiteral(node, propertiesToKeep);
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
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc2NoZW1hdGljcy9taWdyYXRpb25zL3JvdXRlci1wcmVzZXJ2ZS1xdWVyeS1wYXJhbXMvdXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFFSCxpQ0FBaUM7SUFFakMsK0VBQWtFO0lBQ2xFLDZFQUFrRTtJQUVsRTs7O09BR0c7SUFDSCxNQUFNLFlBQVksR0FBRyxJQUFJLEdBQUcsQ0FBUyxDQUFDLFVBQVUsRUFBRSxlQUFlLENBQUMsQ0FBQyxDQUFDO0lBRXBFLE1BQU0sc0JBQXNCLEdBQUcscUJBQXFCLENBQUM7SUFFckQsU0FBZ0IsY0FBYyxDQUMxQixVQUFrQixFQUFFLElBQWdDOztRQUN0RCxNQUFNLGtCQUFrQixHQUFHLFlBQVksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7UUFFeEQsSUFBSSxDQUFDLGtCQUFrQixFQUFFO1lBQ3ZCLE1BQU0sS0FBSyxDQUFDLG9EQUFvRCxVQUFVLEdBQUcsQ0FBQyxDQUFDO1NBQ2hGO1FBR0QsTUFBTSxnQkFBZ0IsR0FBa0MsRUFBRSxDQUFDO1FBQzNELElBQUksaUJBQWlCLEdBQW1FLFNBQVMsQ0FBQztRQUVsRyxLQUFLLE1BQU0sUUFBUSxJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUU7WUFDdEMsa0ZBQWtGO1lBQ2xGLG9FQUFvRTtZQUNwRSxJQUFJLENBQUMsRUFBRSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyw2QkFBNkIsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDakYsQ0FBQyxFQUFFLENBQUMsbUJBQW1CLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDO29CQUMzRSxFQUFFLENBQUMsWUFBWSxDQUFD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QyxFQUFFO2dDQUMzQyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBRSxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO2dDQUNuRCxZQUFZLENBQUMsR0FBRyxDQUFDLG9CQUFvQixFQUFFLFVBQVUsQ0FBQyxDQUFDO2dDQUNuRCxnRkFBZ0Y7Z0NBQ2hGLGtGQUFrRjtnQ0FDbEYscUZBQXFGO2dDQUNyRix1REFBdUQ7NkJBQ3hEO2lDQUFNLElBQUksWUFBWSxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLFVBQVUsRUFBRTtnQ0FDaEUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDOzZCQUNwRTt5QkFDRjtxQkFDRjtpQkFDRjtxQkFBTTtvQkFDTCxJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDO2lCQUM5QjtZQUNILENBQUMsQ0FBQyxDQUFDO1NBQ0o7UUFFRCxPQUFPLE9BQU8sQ0FBQztJQUNqQixDQUFDO0lBeENELHNEQXdDQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcblxuaW1wb3J0IHtnZXRJbXBvcnRTcGVjaWZpZXJ9IGZyb20gJy4uLy4uL3V0aWxzL3R5cGVzY3JpcHQvaW1wb3J0cyc7XG5pbXBvcnQge2lzUmVmZXJlbmNlVG9JbXBvcnR9IGZyb20gJy4uLy4uL3V0aWxzL3R5cGVzY3JpcHQvc3ltYm9sJztcblxuLyoqXG4gKiBDb25maWd1cmVzIHRoZSBtZXRob2RzIHRoYXQgdGhlIG1pZ3JhdGlvbiBzaG91bGQgYmUgbG9va2luZyBmb3JcbiAqIGFuZCB0aGUgcHJvcGVydGllcyBmcm9tIGBOYXZpZ2F0aW9uRXh0cmFzYCB0aGF0IHNob3VsZCBiZSBwcmVzZXJ2ZWQuXG4gKi9cbmNvbnN0IG1ldGhvZENvbmZpZyA9IG5ldyBTZXQ8c3RyaW5nPihbJ25hdmlnYXRlJywgJ2NyZWF0ZVVybFRyZWUnXSk7XG5cbmNvbnN0IHByZXNlcnZlUXVlcnlQYXJhbXNLZXkgPSAncHJlc2VydmVRdWVyeVBhcmFtcyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBtaWdyYXRlTGl0ZXJhbChcbiAgICBtZXRob2ROYW1lOiBzdHJpbmcsIG5vZGU6IHRzLk9iamVjdExpdGVyYWxFeHByZXNzaW9uKTogdHMuT2JqZWN0TGl0ZXJhbEV4cHJlc3Npb24ge1xuICBjb25zdCBpc01pZ3JhdGFibGVNZXRob2QgPSBtZXRob2RDb25maWcuaGFzKG1ldGhvZE5hbWUpO1xuXG4gIGlmICghaXNNaWdyYXRhYmxlTWV0aG9kKSB7XG4gICAgdGhyb3cgRXJyb3IoYEF0dGVtcHRpbmcgdG8gbWlncmF0ZSB1bmNvbmZpZ3VyZWQgbWV0aG9kIGNhbGxlZCAke21ldGhvZE5hbWV9LmApO1xuICB9XG5cblxuICBjb25zdCBwcm9wZXJ0aWVzVG9LZWVwOiB0cy5PYmplY3RMaXRlcmFsRWxlbWVudExpa2VbXSA9IFtdO1xuICBsZXQgcHJvcGVydHlUb01pZ3JhdGU6IHRzLlByb3BlcnR5QXNzaWdubWVudHx0cy5TaG9ydGhhbmRQcm9wZXJ0eUFzc2lnbm1lbnR8dW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuXG4gIGZvciAoY29uc3QgcHJvcGVydHkgb2Ygbm9kZS5wcm9wZXJ0aWVzKSB7XG4gICAgLy8gT25seSBsb29rIGZvciByZWd1bGFyIGFuZCBzaG9ydGhhbmQgcHJvcGVydHkgYXNzaWdubWVudHMgc2luY2UgcmVzb2x2aW5nIHRoaW5nc1xuICAgIC8vIGxpa2Ugc3ByZWFkIG9wZXJhdG9ycyBiZWNvbWVzIHRvbyBjb21wbGljYXRlZCBmb3IgdGhpcyBtaWdyYXRpb24uXG4gICAgaWYgKCh0cy5pc1Byb3BlcnR5QXNzaWdubWVudChwcm9wZXJ0eSkgfHwgdHMuaXNTaG9ydGhhbmRQcm9wZXJ0eUFzc2lnbm1lbnQocHJvcGVydHkpKSAmJlxuICAgICAgICAodHMuaXNTdHJpbmdMaXRlcmFsTGlrZShwcm9wZXJ0eS5uYW1lKSB8fCB0cy5pc051bWVyaWNMaXRlcmFsKHByb3BlcnR5Lm5hbWUpIHx8XG4gICAgICAgICB0cy5pc0lkZW50aWZpZXIocHJvcGVydHkubmFtZSkpICYmXG4gICAgICAgIChwcm9wZXJ0eS5uYW1lLnRleHQgPT09IHByZXNlcnZlUXVlcnlQYXJhbXNLZXkpKSB7XG4gICAgICBwcm9wZXJ0eVRvTWlncmF0ZSA9IHByb3BlcnR5O1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIHByb3BlcnRpZXNUb0tlZXAucHVzaChwcm9wZXJ0eSk7XG4gIH1cblxuICAvLyBEb24ndCBtb2RpZnkgdGhlIG5vZGUgaWYgdGhlcmUncyBub3RoaW5nIHRvIG1pZ3JhdGUuXG4gIGlmIChwcm9wZXJ0eVRvTWlncmF0ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIG5vZGU7XG4gIH1cblxuICBpZiAoKHRzLmlzU2hvcnRoYW5kUHJvcGVydHlBc3NpZ25tZW50KHByb3BlcnR5VG9NaWdyYXRlKSAmJlxuICAgICAgIHByb3BlcnR5VG9NaWdyYXRlLm9iamVjdEFzc2lnbm1lbnRJbml0aWFsaXplcj8ua2luZCA9PT0gdHMuU3ludGF4S2luZC5UcnVlS2V5d29yZCkgfHxcbiAgICAgICh0cy5pc1Byb3BlcnR5QXNzaWdubWVudChwcm9wZXJ0eVRvTWlncmF0ZSkgJiZcbiAgICAgICBwcm9wZXJ0eVRvTWlncmF0ZS5pbml0aWFsaXplci5raW5kID09PSB0cy5TeW50YXhLaW5kLlRydWVLZXl3b3JkKSkge1xuICAgIHJldHVybiB0cy51cGRhdGVPYmplY3RMaXRlcmFsKFxuICAgICAgICBub2RlLFxuICAgICAgICBwcm9wZXJ0aWVzVG9LZWVwLmNvbmNhdChcbiAgICAgICAgICAgIHRzLmNyZWF0ZVByb3BlcnR5QXNzaWdubWVudCgncXVlcnlQYXJhbXNIYW5kbGluZycsIHRzLmNyZWF0ZUlkZW50aWZpZXIoYCdwcmVzZXJ2ZSdgKSkpKTtcbiAgfVxuXG4gIHJldHVybiB0cy51cGRhdGVPYmplY3RMaXRlcmFsKG5vZGUsIHByb3BlcnRpZXNUb0tlZXApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZmluZExpdGVyYWxzVG9NaWdyYXRlKHNvdXJjZUZpbGU6IHRzLlNvdXJjZUZpbGUsIHR5cGVDaGVja2VyOiB0cy5UeXBlQ2hlY2tlcikge1xuICBjb25zdCByZXN1bHRzID0gbmV3IE1hcDxzdHJpbmcsIFNldDx0cy5PYmplY3RMaXRlcmFsRXhwcmVzc2lvbj4+KFxuICAgICAgQXJyYXkuZnJvbShtZXRob2RDb25maWcua2V5cygpLCBrZXkgPT4gW2tleSwgbmV3IFNldCgpXSkpO1xuICBjb25zdCByb3V0ZXJJbXBvcnQgPSBnZXRJbXBvcnRTcGVjaWZpZXIoc291cmNlRmlsZSwgJ0Bhbmd1bGFyL3JvdXRlcicsICdSb3V0ZXInKTtcbiAgY29uc3Qgc2VlbkxpdGVyYWxzID0gbmV3IE1hcDx0cy5PYmplY3RMaXRlcmFsRXhwcmVzc2lvbiwgc3RyaW5nPigpO1xuXG4gIGlmIChyb3V0ZXJJbXBvcnQpIHtcbiAgICBzb3VyY2VGaWxlLmZvckVhY2hDaGlsZChmdW5jdGlvbiB2aXNpdE5vZGUobm9kZTogdHMuTm9kZSkge1xuICAgICAgLy8gTG9vayBmb3IgY2FsbHMgdGhhdCBsb29rIGxpa2UgYGZvby48bWV0aG9kIHRvIG1pZ3JhdGU+YCB3aXRoIG1vcmUgdGhhbiBvbmUgcGFyYW1ldGVyLlxuICAgICAgaWYgKHRzLmlzQ2FsbEV4cHJlc3Npb24obm9kZSkgJiYgbm9kZS5hcmd1bWVudHMubGVuZ3RoID4gMSAmJlxuICAgICAgICAgIHRzLmlzUHJvcGVydHlBY2Nlc3NFeHByZXNzaW9uKG5vZGUuZXhwcmVzc2lvbikgJiYgdHMuaXNJZGVudGlmaWVyKG5vZGUuZXhwcmVzc2lvbi5uYW1lKSAmJlxuICAgICAgICAgIG1ldGhvZENvbmZpZy5oYXMobm9kZS5leHByZXNzaW9uLm5hbWUudGV4dCkpIHtcbiAgICAgICAgLy8gQ2hlY2sgd2hldGhlciB0aGUgdHlwZSBvZiB0aGUgb2JqZWN0IG9uIHdoaWNoIHRoZVxuICAgICAgICAvLyBmdW5jdGlvbiBpcyBjYWxsZWQgcmVmZXJzIHRvIHRoZSBSb3V0ZXIgaW1wb3J0LlxuICAgICAgICBpZiAoaXNSZWZlcmVuY2VUb0ltcG9ydCh0eXBlQ2hlY2tlciwgbm9kZS5leHByZXNzaW9uLmV4cHJlc3Npb24sIHJvdXRlckltcG9ydCkpIHtcbiAgICAgICAgICBjb25zdCBtZXRob2ROYW1lID0gbm9kZS5leHByZXNzaW9uLm5hbWUudGV4dDtcbiAgICAgICAgICBjb25zdCBwYXJhbWV0ZXJEZWNsYXJhdGlvbiA9XG4gICAgICAgICAgICAgIHR5cGVDaGVja2VyLmdldFR5cGVBdExvY2F0aW9uKG5vZGUuYXJndW1lbnRzWzFdKS5nZXRTeW1ib2woKT8udmFsdWVEZWNsYXJhdGlvbjtcblxuICAgICAgICAgIC8vIEZpbmQgdGhlIHNvdXJjZSBvZiB0aGUgb2JqZWN0IGxpdGVyYWwuXG4gICAgICAgICAgaWYgKHBhcmFtZXRlckRlY2xhcmF0aW9uICYmIHRzLmlzT2JqZWN0TGl0ZXJhbEV4cHJlc3Npb24ocGFyYW1ldGVyRGVjbGFyYXRpb24pKSB7XG4gICAgICAgICAgICBpZiAoIXNlZW5MaXRlcmFscy5oYXMocGFyYW1ldGVyRGVjbGFyYXRpb24pKSB7XG4gICAgICAgICAgICAgIHJlc3VsdHMuZ2V0KG1ldGhvZE5hbWUpIS5hZGQocGFyYW1ldGVyRGVjbGFyYXRpb24pO1xuICAgICAgICAgICAgICBzZWVuTGl0ZXJhbHMuc2V0KHBhcmFtZXRlckRlY2xhcmF0aW9uLCBtZXRob2ROYW1lKTtcbiAgICAgICAgICAgICAgLy8gSWYgdGhlIHNhbWUgbGl0ZXJhbCBoYXMgYmVlbiBwYXNzZWQgaW50byBtdWx0aXBsZSBkaWZmZXJlbnQgbWV0aG9kcywgd2UgY2FuJ3RcbiAgICAgICAgICAgICAgLy8gbWlncmF0ZSBpdCwgYmVjYXVzZSB0aGUgc3VwcG9ydGVkIHByb3BlcnRpZXMgYXJlIGRpZmZlcmVudC4gV2hlbiB3ZSBkZXRlY3Qgc3VjaFxuICAgICAgICAgICAgICAvLyBhIGNhc2UsIHdlIGRyb3AgaXQgZnJvbSB0aGUgcmVzdWx0cyBzbyB0aGF0IGl0IGdldHMgaWdub3JlZC4gSWYgaXQncyB1c2VkIG11bHRpcGxlXG4gICAgICAgICAgICAgIC8vIHRpbWVzIGZvciB0aGUgc2FtZSBtZXRob2QsIGl0IGNhbiBzdGlsbCBiZSBtaWdyYXRlZC5cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoc2VlbkxpdGVyYWxzLmdldChwYXJhbWV0ZXJEZWNsYXJhdGlvbikgIT09IG1ldGhvZE5hbWUpIHtcbiAgICAgICAgICAgICAgcmVzdWx0cy5mb3JFYWNoKGxpdGVyYWxzID0+IGxpdGVyYWxzLmRlbGV0ZShwYXJhbWV0ZXJEZWNsYXJhdGlvbikpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbm9kZS5mb3JFYWNoQ2hpbGQodmlzaXROb2RlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiByZXN1bHRzO1xufVxuIl19