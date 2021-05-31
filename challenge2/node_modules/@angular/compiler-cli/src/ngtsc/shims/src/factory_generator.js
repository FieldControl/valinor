(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/src/ngtsc/shims/src/factory_generator", ["require", "exports", "tslib", "typescript", "@angular/compiler-cli/src/ngtsc/file_system", "@angular/compiler-cli/src/ngtsc/shims/src/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.generatedFactoryTransform = exports.FactoryGenerator = void 0;
    var tslib_1 = require("tslib");
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var ts = require("typescript");
    var file_system_1 = require("@angular/compiler-cli/src/ngtsc/file_system");
    var util_1 = require("@angular/compiler-cli/src/ngtsc/shims/src/util");
    var TS_DTS_SUFFIX = /(\.d)?\.ts$/;
    var STRIP_NG_FACTORY = /(.*)NgFactory$/;
    /**
     * Generates ts.SourceFiles which contain variable declarations for NgFactories for every exported
     * class of an input ts.SourceFile.
     */
    var FactoryGenerator = /** @class */ (function () {
        function FactoryGenerator() {
            this.sourceInfo = new Map();
            this.sourceToFactorySymbols = new Map();
            this.shouldEmit = true;
            this.extensionPrefix = 'ngfactory';
        }
        FactoryGenerator.prototype.generateShimForFile = function (sf, genFilePath) {
            var absoluteSfPath = file_system_1.absoluteFromSourceFile(sf);
            var relativePathToSource = './' + file_system_1.basename(sf.fileName).replace(TS_DTS_SUFFIX, '');
            // Collect a list of classes that need to have factory types emitted for them. This list is
            // overly broad as at this point the ts.TypeChecker hasn't been created, and can't be used to
            // semantically understand which decorated types are actually decorated with Angular decorators.
            //
            // The exports generated here are pruned in the factory transform during emit.
            var symbolNames = sf.statements
                // Pick out top level class declarations...
                .filter(ts.isClassDeclaration)
                // which are named, exported, and have decorators.
                .filter(function (decl) { return isExported(decl) && decl.decorators !== undefined &&
                decl.name !== undefined; })
                // Grab the symbol name.
                .map(function (decl) { return decl.name.text; });
            var sourceText = '';
            // If there is a top-level comment in the original file, copy it over at the top of the
            // generated factory file. This is important for preserving any load-bearing jsdoc comments.
            var leadingComment = getFileoverviewComment(sf);
            if (leadingComment !== null) {
                // Leading comments must be separated from the rest of the contents by a blank line.
                sourceText = leadingComment + '\n\n';
            }
            if (symbolNames.length > 0) {
                // For each symbol name, generate a constant export of the corresponding NgFactory.
                // This will encompass a lot of symbols which don't need factories, but that's okay
                // because it won't miss any that do.
                var varLines = symbolNames.map(function (name) { return "export const " + name + "NgFactory: i0.\u0275NgModuleFactory<any> = new i0.\u0275NgModuleFactory(" + name + ");"; });
                sourceText += tslib_1.__spreadArray([
                    // This might be incorrect if the current package being compiled is Angular core, but it's
                    // okay to leave in at type checking time. TypeScript can handle this reference via its path
                    // mapping, but downstream bundlers can't. If the current package is core itself, this will
                    // be replaced in the factory transformer before emit.
                    "import * as i0 from '@angular/core';",
                    "import {" + symbolNames.join(', ') + "} from '" + relativePathToSource + "';"
                ], tslib_1.__read(varLines)).join('\n');
            }
            // Add an extra export to ensure this module has at least one. It'll be removed later in the
            // factory transformer if it ends up not being needed.
            sourceText += '\nexport const ɵNonEmptyModule = true;';
            var genFile = ts.createSourceFile(genFilePath, sourceText, sf.languageVersion, true, ts.ScriptKind.TS);
            if (sf.moduleName !== undefined) {
                genFile.moduleName = util_1.generatedModuleName(sf.moduleName, sf.fileName, '.ngfactory');
            }
            var moduleSymbols = new Map();
            this.sourceToFactorySymbols.set(absoluteSfPath, moduleSymbols);
            this.sourceInfo.set(genFilePath, {
                sourceFilePath: absoluteSfPath,
                moduleSymbols: moduleSymbols,
            });
            return genFile;
        };
        FactoryGenerator.prototype.track = function (sf, moduleInfo) {
            if (this.sourceToFactorySymbols.has(sf.fileName)) {
                this.sourceToFactorySymbols.get(sf.fileName).set(moduleInfo.name, moduleInfo);
            }
        };
        return FactoryGenerator;
    }());
    exports.FactoryGenerator = FactoryGenerator;
    function isExported(decl) {
        return decl.modifiers !== undefined &&
            decl.modifiers.some(function (mod) { return mod.kind == ts.SyntaxKind.ExportKeyword; });
    }
    function generatedFactoryTransform(factoryMap, importRewriter) {
        return function (context) {
            return function (file) {
                return transformFactorySourceFile(factoryMap, context, importRewriter, file);
            };
        };
    }
    exports.generatedFactoryTransform = generatedFactoryTransform;
    function transformFactorySourceFile(factoryMap, context, importRewriter, file) {
        var e_1, _a;
        // If this is not a generated file, it won't have factory info associated with it.
        if (!factoryMap.has(file.fileName)) {
            // Don't transform non-generated code.
            return file;
        }
        var _b = factoryMap.get(file.fileName), moduleSymbols = _b.moduleSymbols, sourceFilePath = _b.sourceFilePath;
        // Not every exported factory statement is valid. They were generated before the program was
        // analyzed, and before ngtsc knew which symbols were actually NgModules. factoryMap contains
        // that knowledge now, so this transform filters the statement list and removes exported factories
        // that aren't actually factories.
        //
        // This could leave the generated factory file empty. To prevent this (it causes issues with
        // closure compiler) a 'ɵNonEmptyModule' export was added when the factory shim was created.
        // Preserve that export if needed, and remove it otherwise.
        //
        // Additionally, an import to @angular/core is generated, but the current compilation unit could
        // actually be @angular/core, in which case such an import is invalid and should be replaced with
        // the proper path to access Ivy symbols in core.
        // The filtered set of statements.
        var transformedStatements = [];
        // The statement identified as the ɵNonEmptyModule export.
        var nonEmptyExport = null;
        // Extracted identifiers which refer to import statements from @angular/core.
        var coreImportIdentifiers = new Set();
        try {
            // Consider all the statements.
            for (var _c = tslib_1.__values(file.statements), _d = _c.next(); !_d.done; _d = _c.next()) {
                var stmt = _d.value;
                // Look for imports to @angular/core.
                if (ts.isImportDeclaration(stmt) && ts.isStringLiteral(stmt.moduleSpecifier) &&
                    stmt.moduleSpecifier.text === '@angular/core') {
                    // Update the import path to point to the correct file using the ImportRewriter.
                    var rewrittenModuleSpecifier = importRewriter.rewriteSpecifier('@angular/core', sourceFilePath);
                    if (rewrittenModuleSpecifier !== stmt.moduleSpecifier.text) {
                        transformedStatements.push(ts.updateImportDeclaration(stmt, stmt.decorators, stmt.modifiers, stmt.importClause, ts.createStringLiteral(rewrittenModuleSpecifier)));
                        // Record the identifier by which this imported module goes, so references to its symbols
                        // can be discovered later.
                        if (stmt.importClause !== undefined && stmt.importClause.namedBindings !== undefined &&
                            ts.isNamespaceImport(stmt.importClause.namedBindings)) {
                            coreImportIdentifiers.add(stmt.importClause.namedBindings.name.text);
                        }
                    }
                    else {
                        transformedStatements.push(stmt);
                    }
                }
                else if (ts.isVariableStatement(stmt) && stmt.declarationList.declarations.length === 1) {
                    var decl = stmt.declarationList.declarations[0];
                    // If this is the ɵNonEmptyModule export, then save it for later.
                    if (ts.isIdentifier(decl.name)) {
                        if (decl.name.text === 'ɵNonEmptyModule') {
                            nonEmptyExport = stmt;
                            continue;
                        }
                        // Otherwise, check if this export is a factory for a known NgModule, and retain it if so.
                        var match = STRIP_NG_FACTORY.exec(decl.name.text);
                        var module_1 = match ? moduleSymbols.get(match[1]) : null;
                        if (module_1) {
                            // If the module can be tree shaken, then the factory should be wrapped in a
                            // `noSideEffects()` call which tells Closure to treat the expression as pure, allowing
                            // it to be removed if the result is not used.
                            //
                            // `NgModule`s with an `id` property will be lazy loaded. Google-internal lazy loading
                            // infra relies on a side effect from the `new NgModuleFactory()` call, which registers
                            // the module globally. Because of this, we **cannot** tree shake any module which has
                            // an `id` property. Doing so would cause lazy loaded modules to never be registered.
                            var moduleIsTreeShakable = !module_1.hasId;
                            var newStmt = !moduleIsTreeShakable ?
                                stmt :
                                updateInitializers(stmt, function (init) { return init ? wrapInNoSideEffects(init) : undefined; });
                            transformedStatements.push(newStmt);
                        }
                    }
                    else {
                        // Leave the statement alone, as it can't be understood.
                        transformedStatements.push(stmt);
                    }
                }
                else {
                    // Include non-variable statements (imports, etc).
                    transformedStatements.push(stmt);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_1) throw e_1.error; }
        }
        // Check whether the empty module export is still needed.
        if (!transformedStatements.some(ts.isVariableStatement) && nonEmptyExport !== null) {
            // If the resulting file has no factories, include an empty export to
            // satisfy closure compiler.
            transformedStatements.push(nonEmptyExport);
        }
        file = ts.updateSourceFileNode(file, transformedStatements);
        // If any imports to @angular/core were detected and rewritten (which happens when compiling
        // @angular/core), go through the SourceFile and rewrite references to symbols imported from core.
        if (coreImportIdentifiers.size > 0) {
            var visit_1 = function (node) {
                node = ts.visitEachChild(node, function (child) { return visit_1(child); }, context);
                // Look for expressions of the form "i.s" where 'i' is a detected name for an @angular/core
                // import that was changed above. Rewrite 's' using the ImportResolver.
                if (ts.isPropertyAccessExpression(node) && ts.isIdentifier(node.expression) &&
                    coreImportIdentifiers.has(node.expression.text)) {
                    // This is an import of a symbol from @angular/core. Transform it with the importRewriter.
                    var rewrittenSymbol = importRewriter.rewriteSymbol(node.name.text, '@angular/core');
                    if (rewrittenSymbol !== node.name.text) {
                        var updated = ts.updatePropertyAccess(node, node.expression, ts.createIdentifier(rewrittenSymbol));
                        node = updated;
                    }
                }
                return node;
            };
            file = visit_1(file);
        }
        return file;
    }
    /**
     * Parses and returns the comment text of a \@fileoverview comment in the given source file.
     */
    function getFileoverviewComment(sourceFile) {
        var text = sourceFile.getFullText();
        var trivia = text.substring(0, sourceFile.getStart());
        var leadingComments = ts.getLeadingCommentRanges(trivia, 0);
        if (!leadingComments || leadingComments.length === 0) {
            return null;
        }
        var comment = leadingComments[0];
        if (comment.kind !== ts.SyntaxKind.MultiLineCommentTrivia) {
            return null;
        }
        // Only comments separated with a \n\n from the file contents are considered file-level comments
        // in TypeScript.
        if (text.substring(comment.end, comment.end + 2) !== '\n\n') {
            return null;
        }
        var commentText = text.substring(comment.pos, comment.end);
        // Closure Compiler ignores @suppress and similar if the comment contains @license.
        if (commentText.indexOf('@license') !== -1) {
            return null;
        }
        return commentText;
    }
    /**
     * Wraps the given expression in a call to `ɵnoSideEffects()`, which tells
     * Closure we don't care about the side effects of this expression and it should
     * be treated as "pure". Closure is free to tree shake this expression if its
     * result is not used.
     *
     * Example: Takes `1 + 2` and returns `i0.ɵnoSideEffects(() => 1 + 2)`.
     */
    function wrapInNoSideEffects(expr) {
        var noSideEffects = ts.createPropertyAccess(ts.createIdentifier('i0'), 'ɵnoSideEffects');
        return ts.createCall(noSideEffects, 
        /* typeArguments */ [], 
        /* arguments */
        [
            ts.createFunctionExpression(
            /* modifiers */ [], 
            /* asteriskToken */ undefined, 
            /* name */ undefined, 
            /* typeParameters */ [], 
            /* parameters */ [], 
            /* type */ undefined, 
            /* body */ ts.createBlock([
                ts.createReturn(expr),
            ])),
        ]);
    }
    /**
     * Clones and updates the initializers for a given statement to use the new
     * expression provided. Does not mutate the input statement.
     */
    function updateInitializers(stmt, update) {
        return ts.updateVariableStatement(stmt, stmt.modifiers, ts.updateVariableDeclarationList(stmt.declarationList, stmt.declarationList.declarations.map(function (decl) { return ts.updateVariableDeclaration(decl, decl.name, decl.type, update(decl.initializer)); })));
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmFjdG9yeV9nZW5lcmF0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL3NoaW1zL3NyYy9mYWN0b3J5X2dlbmVyYXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0lBQUE7Ozs7OztPQU1HO0lBQ0gsK0JBQWlDO0lBRWpDLDJFQUFtRjtJQUluRix1RUFBMkM7SUFFM0MsSUFBTSxhQUFhLEdBQUcsYUFBYSxDQUFDO0lBQ3BDLElBQU0sZ0JBQWdCLEdBQUcsZ0JBQWdCLENBQUM7SUFFMUM7OztPQUdHO0lBQ0g7UUFBQTtZQUNXLGVBQVUsR0FBRyxJQUFJLEdBQUcsRUFBdUIsQ0FBQztZQUM3QywyQkFBc0IsR0FBRyxJQUFJLEdBQUcsRUFBbUMsQ0FBQztZQUVuRSxlQUFVLEdBQUcsSUFBSSxDQUFDO1lBQ2xCLG9CQUFlLEdBQUcsV0FBVyxDQUFDO1FBMkV6QyxDQUFDO1FBekVDLDhDQUFtQixHQUFuQixVQUFvQixFQUFpQixFQUFFLFdBQTJCO1lBQ2hFLElBQU0sY0FBYyxHQUFHLG9DQUFzQixDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBRWxELElBQU0sb0JBQW9CLEdBQUcsSUFBSSxHQUFHLHNCQUFRLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxhQUFhLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDckYsMkZBQTJGO1lBQzNGLDZGQUE2RjtZQUM3RixnR0FBZ0c7WUFDaEcsRUFBRTtZQUNGLDhFQUE4RTtZQUM5RSxJQUFNLFdBQVcsR0FBRyxFQUFFLENBQUMsVUFBVTtnQkFDVCwyQ0FBMkM7aUJBQzFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsa0JBQWtCLENBQUM7Z0JBQzlCLGtEQUFrRDtpQkFDakQsTUFBTSxDQUNILFVBQUEsSUFBSSxJQUFJLE9BQUEsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJ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QUFJLEVBQ1QsSUFBSSxDQUFDLElBQUksRUFDVCxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUN2QixFQUxLLENBS0wsQ0FDSixDQUNKLENBQ1IsQ0FBQztJQUNKLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuXG5pbXBvcnQge2Fic29sdXRlRnJvbVNvdXJjZUZpbGUsIEFic29sdXRlRnNQYXRoLCBiYXNlbmFtZX0gZnJvbSAnLi4vLi4vZmlsZV9zeXN0ZW0nO1xuaW1wb3J0IHtJbXBvcnRSZXdyaXRlcn0gZnJvbSAnLi4vLi4vaW1wb3J0cyc7XG5pbXBvcnQge0ZhY3RvcnlJbmZvLCBGYWN0b3J5VHJhY2tlciwgTW9kdWxlSW5mbywgUGVyRmlsZVNoaW1HZW5lcmF0b3J9IGZyb20gJy4uL2FwaSc7XG5cbmltcG9ydCB7Z2VuZXJhdGVkTW9kdWxlTmFtZX0gZnJvbSAnLi91dGlsJztcblxuY29uc3QgVFNfRFRTX1NVRkZJWCA9IC8oXFwuZCk/XFwudHMkLztcbmNvbnN0IFNUUklQX05HX0ZBQ1RPUlkgPSAvKC4qKU5nRmFjdG9yeSQvO1xuXG4vKipcbiAqIEdlbmVyYXRlcyB0cy5Tb3VyY2VGaWxlcyB3aGljaCBjb250YWluIHZhcmlhYmxlIGRlY2xhcmF0aW9ucyBmb3IgTmdGYWN0b3JpZXMgZm9yIGV2ZXJ5IGV4cG9ydGVkXG4gKiBjbGFzcyBvZiBhbiBpbnB1dCB0cy5Tb3VyY2VGaWxlLlxuICovXG5leHBvcnQgY2xhc3MgRmFjdG9yeUdlbmVyYXRvciBpbXBsZW1lbnRzIFBlckZpbGVTaGltR2VuZXJhdG9yLCBGYWN0b3J5VHJhY2tlciB7XG4gIHJlYWRvbmx5IHNvdXJjZUluZm8gPSBuZXcgTWFwPHN0cmluZywgRmFjdG9yeUluZm8+KCk7XG4gIHByaXZhdGUgc291cmNlVG9GYWN0b3J5U3ltYm9scyA9IG5ldyBNYXA8c3RyaW5nLCBNYXA8c3RyaW5nLCBNb2R1bGVJbmZvPj4oKTtcblxuICByZWFkb25seSBzaG91bGRFbWl0ID0gdHJ1ZTtcbiAgcmVhZG9ubHkgZXh0ZW5zaW9uUHJlZml4ID0gJ25nZmFjdG9yeSc7XG5cbiAgZ2VuZXJhdGVTaGltRm9yRmlsZShzZjogdHMuU291cmNlRmlsZSwgZ2VuRmlsZVBhdGg6IEFic29sdXRlRnNQYXRoKTogdHMuU291cmNlRmlsZSB7XG4gICAgY29uc3QgYWJzb2x1dGVTZlBhdGggPSBhYnNvbHV0ZUZyb21Tb3VyY2VGaWxlKHNmKTtcblxuICAgIGNvbnN0IHJlbGF0aXZlUGF0aFRvU291cmNlID0gJy4vJyArIGJhc2VuYW1lKHNmLmZpbGVOYW1lKS5yZXBsYWNlKFRTX0RUU19TVUZGSVgsICcnKTtcbiAgICAvLyBDb2xsZWN0IGEgbGlzdCBvZiBjbGFzc2VzIHRoYXQgbmVlZCB0byBoYXZlIGZhY3RvcnkgdHlwZXMgZW1pdHRlZCBmb3IgdGhlbS4gVGhpcyBsaXN0IGlzXG4gICAgLy8gb3Zlcmx5IGJyb2FkIGFzIGF0IHRoaXMgcG9pbnQgdGhlIHRzLlR5cGVDaGVja2VyIGhhc24ndCBiZWVuIGNyZWF0ZWQsIGFuZCBjYW4ndCBiZSB1c2VkIHRvXG4gICAgLy8gc2VtYW50aWNhbGx5IHVuZGVyc3RhbmQgd2hpY2ggZGVjb3JhdGVkIHR5cGVzIGFyZSBhY3R1YWxseSBkZWNvcmF0ZWQgd2l0aCBBbmd1bGFyIGRlY29yYXRvcnMuXG4gICAgLy9cbiAgICAvLyBUaGUgZXhwb3J0cyBnZW5lcmF0ZWQgaGVyZSBhcmUgcHJ1bmVkIGluIHRoZSBmYWN0b3J5IHRyYW5zZm9ybSBkdXJpbmcgZW1pdC5cbiAgICBjb25zdCBzeW1ib2xOYW1lcyA9IHNmLnN0YXRlbWVudHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBQaWNrIG91dCB0b3AgbGV2ZWwgY2xhc3MgZGVjbGFyYXRpb25zLi4uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmZpbHRlcih0cy5pc0NsYXNzRGVjbGFyYXRpb24pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gd2hpY2ggYXJlIG5hbWVkLCBleHBvcnRlZCwgYW5kIGhhdmUgZGVjb3JhdG9ycy5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuZmlsdGVyKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWNsID0+IGlzRXhwb3J0ZWQoZGVjbCkgJiYgZGVjbC5kZWNvcmF0b3JzICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlY2wubmFtZSAhPT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEdyYWIgdGhlIHN5bWJvbCBuYW1lLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5tYXAoZGVjbCA9PiBkZWNsLm5hbWUhLnRleHQpO1xuXG5cbiAgICBsZXQgc291cmNlVGV4dCA9ICcnO1xuXG4gICAgLy8gSWYgdGhlcmUgaXMgYSB0b3AtbGV2ZWwgY29tbWVudCBpbiB0aGUgb3JpZ2luYWwgZmlsZSwgY29weSBpdCBvdmVyIGF0IHRoZSB0b3Agb2YgdGhlXG4gICAgLy8gZ2VuZXJhdGVkIGZhY3RvcnkgZmlsZS4gVGhpcyBpcyBpbXBvcnRhbnQgZm9yIHByZXNlcnZpbmcgYW55IGxvYWQtYmVhcmluZyBqc2RvYyBjb21tZW50cy5cbiAgICBjb25zdCBsZWFkaW5nQ29tbWVudCA9IGdldEZpbGVvdmVydmlld0NvbW1lbnQoc2YpO1xuICAgIGlmIChsZWFkaW5nQ29tbWVudCAhPT0gbnVsbCkge1xuICAgICAgLy8gTGVhZGluZyBjb21tZW50cyBtdXN0IGJlIHNlcGFyYXRlZCBmcm9tIHRoZSByZXN0IG9mIHRoZSBjb250ZW50cyBieSBhIGJsYW5rIGxpbmUuXG4gICAgICBzb3VyY2VUZXh0ID0gbGVhZGluZ0NvbW1lbnQgKyAnXFxuXFxuJztcbiAgICB9XG5cbiAgICBpZiAoc3ltYm9sTmFtZXMubGVuZ3RoID4gMCkge1xuICAgICAgLy8gRm9yIGVhY2ggc3ltYm9sIG5hbWUsIGdlbmVyYXRlIGEgY29uc3RhbnQgZXhwb3J0IG9mIHRoZSBjb3JyZXNwb25kaW5nIE5nRmFjdG9yeS5cbiAgICAgIC8vIFRoaXMgd2lsbCBlbmNvbXBhc3MgYSBsb3Qgb2Ygc3ltYm9scyB3aGljaCBkb24ndCBuZWVkIGZhY3RvcmllcywgYnV0IHRoYXQncyBva2F5XG4gICAgICAvLyBiZWNhdXNlIGl0IHdvbid0IG1pc3MgYW55IHRoYXQgZG8uXG4gICAgICBjb25zdCB2YXJMaW5lcyA9IHN5bWJvbE5hbWVzLm1hcChcbiAgICAgICAgICBuYW1lID0+IGBleHBvcnQgY29uc3QgJHtcbiAgICAgICAgICAgICAgbmFtZX1OZ0ZhY3Rvcnk6IGkwLsm1TmdNb2R1bGVGYWN0b3J5PGFueT4gPSBuZXcgaTAuybVOZ01vZHVsZUZhY3RvcnkoJHtuYW1lfSk7YCk7XG4gICAgICBzb3VyY2VUZXh0ICs9IFtcbiAgICAgICAgLy8gVGhpcyBtaWdodCBiZSBpbmNvcnJlY3QgaWYgdGhlIGN1cnJlbnQgcGFja2FnZSBiZWluZyBjb21waWxlZCBpcyBBbmd1bGFyIGNvcmUsIGJ1dCBpdCdzXG4gICAgICAgIC8vIG9rYXkgdG8gbGVhdmUgaW4gYXQgdHlwZSBjaGVja2luZyB0aW1lLiBUeXBlU2NyaXB0IGNhbiBoYW5kbGUgdGhpcyByZWZlcmVuY2UgdmlhIGl0cyBwYXRoXG4gICAgICAgIC8vIG1hcHBpbmcsIGJ1dCBkb3duc3RyZWFtIGJ1bmRsZXJzIGNhbid0LiBJZiB0aGUgY3VycmVudCBwYWNrYWdlIGlzIGNvcmUgaXRzZWxmLCB0aGlzIHdpbGxcbiAgICAgICAgLy8gYmUgcmVwbGFjZWQgaW4gdGhlIGZhY3RvcnkgdHJhbnNmb3JtZXIgYmVmb3JlIGVtaXQuXG4gICAgICAgIGBpbXBvcnQgKiBhcyBpMCBmcm9tICdAYW5ndWxhci9jb3JlJztgLFxuICAgICAgICBgaW1wb3J0IHske3N5bWJvbE5hbWVzLmpvaW4oJywgJyl9fSBmcm9tICcke3JlbGF0aXZlUGF0aFRvU291cmNlfSc7YCxcbiAgICAgICAgLi4udmFyTGluZXMsXG4gICAgICBdLmpvaW4oJ1xcbicpO1xuICAgIH1cblxuICAgIC8vIEFkZCBhbiBleHRyYSBleHBvcnQgdG8gZW5zdXJlIHRoaXMgbW9kdWxlIGhhcyBhdCBsZWFzdCBvbmUuIEl0J2xsIGJlIHJlbW92ZWQgbGF0ZXIgaW4gdGhlXG4gICAgLy8gZmFjdG9yeSB0cmFuc2Zvcm1lciBpZiBpdCBlbmRzIHVwIG5vdCBiZWluZyBuZWVkZWQuXG4gICAgc291cmNlVGV4dCArPSAnXFxuZXhwb3J0IGNvbnN0IMm1Tm9uRW1wdHlNb2R1bGUgPSB0cnVlOyc7XG5cbiAgICBjb25zdCBnZW5GaWxlID1cbiAgICAgICAgdHMuY3JlYXRlU291cmNlRmlsZShnZW5GaWxlUGF0aCwgc291cmNlVGV4dCwgc2YubGFuZ3VhZ2VWZXJzaW9uLCB0cnVlLCB0cy5TY3JpcHRLaW5kLlRTKTtcbiAgICBpZiAoc2YubW9kdWxlTmFtZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBnZW5GaWxlLm1vZHVsZU5hbWUgPSBnZW5lcmF0ZWRNb2R1bGVOYW1lKHNmLm1vZHVsZU5hbWUsIHNmLmZpbGVOYW1lLCAnLm5nZmFjdG9yeScpO1xuICAgIH1cblxuICAgIGNvbnN0IG1vZHVsZVN5bWJvbHMgPSBuZXcgTWFwPHN0cmluZywgTW9kdWxlSW5mbz4oKTtcbiAgICB0aGlzLnNvdXJjZVRvRmFjdG9yeVN5bWJvbHMuc2V0KGFic29sdXRlU2ZQYXRoLCBtb2R1bGVTeW1ib2xzKTtcbiAgICB0aGlzLnNvdXJjZUluZm8uc2V0KGdlbkZpbGVQYXRoLCB7XG4gICAgICBzb3VyY2VGaWxlUGF0aDogYWJzb2x1dGVTZlBhdGgsXG4gICAgICBtb2R1bGVTeW1ib2xzLFxuICAgIH0pO1xuXG4gICAgcmV0dXJuIGdlbkZpbGU7XG4gIH1cblxuICB0cmFjayhzZjogdHMuU291cmNlRmlsZSwgbW9kdWxlSW5mbzogTW9kdWxlSW5mbyk6IHZvaWQge1xuICAgIGlmICh0aGlzLnNvdXJjZVRvRmFjdG9yeVN5bWJvbHMuaGFzKHNmLmZpbGVOYW1lKSkge1xuICAgICAgdGhpcy5zb3VyY2VUb0ZhY3RvcnlTeW1ib2xzLmdldChzZi5maWxlTmFtZSkhLnNldChtb2R1bGVJbmZvLm5hbWUsIG1vZHVsZUluZm8pO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBpc0V4cG9ydGVkKGRlY2w6IHRzLkRlY2xhcmF0aW9uKTogYm9vbGVhbiB7XG4gIHJldHVybiBkZWNsLm1vZGlmaWVycyAhPT0gdW5kZWZpbmVkICYmXG4gICAgICBkZWNsLm1vZGlmaWVycy5zb21lKG1vZCA9PiBtb2Qua2luZCA9PSB0cy5TeW50YXhLaW5kLkV4cG9ydEtleXdvcmQpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGVkRmFjdG9yeVRyYW5zZm9ybShcbiAgICBmYWN0b3J5TWFwOiBNYXA8c3RyaW5nLCBGYWN0b3J5SW5mbz4sXG4gICAgaW1wb3J0UmV3cml0ZXI6IEltcG9ydFJld3JpdGVyKTogdHMuVHJhbnNmb3JtZXJGYWN0b3J5PHRzLlNvdXJjZUZpbGU+IHtcbiAgcmV0dXJuIChjb250ZXh0OiB0cy5UcmFuc2Zvcm1hdGlvbkNvbnRleHQpOiB0cy5UcmFuc2Zvcm1lcjx0cy5Tb3VyY2VGaWxlPiA9PiB7XG4gICAgcmV0dXJuIChmaWxlOiB0cy5Tb3VyY2VGaWxlKTogdHMuU291cmNlRmlsZSA9PiB7XG4gICAgICByZXR1cm4gdHJhbnNmb3JtRmFjdG9yeVNvdXJjZUZpbGUoZmFjdG9yeU1hcCwgY29udGV4dCwgaW1wb3J0UmV3cml0ZXIsIGZpbGUpO1xuICAgIH07XG4gIH07XG59XG5cbmZ1bmN0aW9uIHRyYW5zZm9ybUZhY3RvcnlTb3VyY2VGaWxlKFxuICAgIGZhY3RvcnlNYXA6IE1hcDxzdHJpbmcsIEZhY3RvcnlJbmZvPiwgY29udGV4dDogdHMuVHJhbnNmb3JtYXRpb25Db250ZXh0LFxuICAgIGltcG9ydFJld3JpdGVyOiBJbXBvcnRSZXdyaXRlciwgZmlsZTogdHMuU291cmNlRmlsZSk6IHRzLlNvdXJjZUZpbGUge1xuICAvLyBJZiB0aGlzIGlzIG5vdCBhIGdlbmVyYXRlZCBmaWxlLCBpdCB3b24ndCBoYXZlIGZhY3RvcnkgaW5mbyBhc3NvY2lhdGVkIHdpdGggaXQuXG4gIGlmICghZmFjdG9yeU1hcC5oYXMoZmlsZS5maWxlTmFtZSkpIHtcbiAgICAvLyBEb24ndCB0cmFuc2Zvcm0gbm9uLWdlbmVyYXRlZCBjb2RlLlxuICAgIHJldHVybiBmaWxlO1xuICB9XG5cbiAgY29uc3Qge21vZHVsZVN5bWJvbHMsIHNvdXJjZUZpbGVQYXRofSA9IGZhY3RvcnlNYXAuZ2V0KGZpbGUuZmlsZU5hbWUpITtcblxuICAvLyBOb3QgZXZlcnkgZXhwb3J0ZWQgZmFjdG9yeSBzdGF0ZW1lbnQgaXMgdmFsaWQuIFRoZXkgd2VyZSBnZW5lcmF0ZWQgYmVmb3JlIHRoZSBwcm9ncmFtIHdhc1xuICAvLyBhbmFseXplZCwgYW5kIGJlZm9yZSBuZ3RzYyBrbmV3IHdoaWNoIHN5bWJvbHMgd2VyZSBhY3R1YWxseSBOZ01vZHVsZXMuIGZhY3RvcnlNYXAgY29udGFpbnNcbiAgLy8gdGhhdCBrbm93bGVkZ2Ugbm93LCBzbyB0aGlzIHRyYW5zZm9ybSBmaWx0ZXJzIHRoZSBzdGF0ZW1lbnQgbGlzdCBhbmQgcmVtb3ZlcyBleHBvcnRlZCBmYWN0b3JpZXNcbiAgLy8gdGhhdCBhcmVuJ3QgYWN0dWFsbHkgZmFjdG9yaWVzLlxuICAvL1xuICAvLyBUaGlzIGNvdWxkIGxlYXZlIHRoZSBnZW5lcmF0ZWQgZmFjdG9yeSBmaWxlIGVtcHR5LiBUbyBwcmV2ZW50IHRoaXMgKGl0IGNhdXNlcyBpc3N1ZXMgd2l0aFxuICAvLyBjbG9zdXJlIGNvbXBpbGVyKSBhICfJtU5vbkVtcHR5TW9kdWxlJyBleHBvcnQgd2FzIGFkZGVkIHdoZW4gdGhlIGZhY3Rvcnkgc2hpbSB3YXMgY3JlYXRlZC5cbiAgLy8gUHJlc2VydmUgdGhhdCBleHBvcnQgaWYgbmVlZGVkLCBhbmQgcmVtb3ZlIGl0IG90aGVyd2lzZS5cbiAgLy9cbiAgLy8gQWRkaXRpb25hbGx5LCBhbiBpbXBvcnQgdG8gQGFuZ3VsYXIvY29yZSBpcyBnZW5lcmF0ZWQsIGJ1dCB0aGUgY3VycmVudCBjb21waWxhdGlvbiB1bml0IGNvdWxkXG4gIC8vIGFjdHVhbGx5IGJlIEBhbmd1bGFyL2NvcmUsIGluIHdoaWNoIGNhc2Ugc3VjaCBhbiBpbXBvcnQgaXMgaW52YWxpZCBhbmQgc2hvdWxkIGJlIHJlcGxhY2VkIHdpdGhcbiAgLy8gdGhlIHByb3BlciBwYXRoIHRvIGFjY2VzcyBJdnkgc3ltYm9scyBpbiBjb3JlLlxuXG4gIC8vIFRoZSBmaWx0ZXJlZCBzZXQgb2Ygc3RhdGVtZW50cy5cbiAgY29uc3QgdHJhbnNmb3JtZWRTdGF0ZW1lbnRzOiB0cy5TdGF0ZW1lbnRbXSA9IFtdO1xuXG4gIC8vIFRoZSBzdGF0ZW1lbnQgaWRlbnRpZmllZCBhcyB0aGUgybVOb25FbXB0eU1vZHVsZSBleHBvcnQuXG4gIGxldCBub25FbXB0eUV4cG9ydDogdHMuU3RhdGVtZW50fG51bGwgPSBudWxsO1xuXG4gIC8vIEV4dHJhY3RlZCBpZGVudGlmaWVycyB3aGljaCByZWZlciB0byBpbXBvcnQgc3RhdGVtZW50cyBmcm9tIEBhbmd1bGFyL2NvcmUuXG4gIGNvbnN0IGNvcmVJbXBvcnRJZGVudGlmaWVycyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuXG4gIC8vIENvbnNpZGVyIGFsbCB0aGUgc3RhdGVtZW50cy5cbiAgZm9yIChjb25zdCBzdG10IG9mIGZpbGUuc3RhdGVtZW50cykge1xuICAgIC8vIExvb2sgZm9yIGltcG9ydHMgdG8gQGFuZ3VsYXIvY29yZS5cbiAgICBpZiAodHMuaXNJbXBvcnREZWNsYXJhdGlvbihzdG10KSAmJiB0cy5pc1N0cmluZ0xpdGVyYWwoc3RtdC5tb2R1bGVTcGVjaWZpZXIpICYmXG4gICAgICAgIHN0bXQubW9kdWxlU3BlY2lmaWVyLnRleHQgPT09ICdAYW5ndWxhci9jb3JlJykge1xuICAgICAgLy8gVXBkYXRlIHRoZSBpbXBvcnQgcGF0aCB0byBwb2ludCB0byB0aGUgY29ycmVjdCBmaWxlIHVzaW5nIHRoZSBJbXBvcnRSZXdyaXRlci5cbiAgICAgIGNvbnN0IHJld3JpdHRlbk1vZHVsZVNwZWNpZmllciA9XG4gICAgICAgICAgaW1wb3J0UmV3cml0ZXIucmV3cml0ZVNwZWNpZmllcignQGFuZ3VsYXIvY29yZScsIHNvdXJjZUZpbGVQYXRoKTtcbiAgICAgIGlmIChyZXdyaXR0ZW5Nb2R1bGVTcGVjaWZpZXIgIT09IHN0bXQubW9kdWxlU3BlY2lmaWVyLnRleHQpIHtcbiAgICAgICAgdHJhbnNmb3JtZWRTdGF0ZW1lbnRzLnB1c2godHMudXBkYXRlSW1wb3J0RGVjbGFyYXRpb24oXG4gICAgICAgICAgICBzdG10LCBzdG10LmRlY29yYXRvcnMsIHN0bXQubW9kaWZpZXJzLCBzdG10LmltcG9ydENsYXVzZSxcbiAgICAgICAgICAgIHRzLmNyZWF0ZVN0cmluZ0xpdGVyYWwocmV3cml0dGVuTW9kdWxlU3BlY2lmaWVyKSkpO1xuXG4gICAgICAgIC8vIFJlY29yZCB0aGUgaWRlbnRpZmllciBieSB3aGljaCB0aGlzIGltcG9ydGVkIG1vZHVsZSBnb2VzLCBzbyByZWZlcmVuY2VzIHRvIGl0cyBzeW1ib2xzXG4gICAgICAgIC8vIGNhbiBiZSBkaXNjb3ZlcmVkIGxhdGVyLlxuICAgICAgICBpZiAoc3RtdC5pbXBvcnRDbGF1c2UgIT09IHVuZGVmaW5lZCAmJiBzdG10LmltcG9ydENsYXVzZS5uYW1lZEJpbmRpbmdzICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgICAgIHRzLmlzTmFtZXNwYWNlSW1wb3J0KHN0bXQuaW1wb3J0Q2xhdXNlLm5hbWVkQmluZGluZ3MpKSB7XG4gICAgICAgICAgY29yZUltcG9ydElkZW50aWZpZXJzLmFkZChzdG10LmltcG9ydENsYXVzZS5uYW1lZEJpbmRpbmdzLm5hbWUudGV4dCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRyYW5zZm9ybWVkU3RhdGVtZW50cy5wdXNoKHN0bXQpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodHMuaXNWYXJpYWJsZVN0YXRlbWVudChzdG10KSAmJiBzdG10LmRlY2xhcmF0aW9uTGlzdC5kZWNsYXJhdGlvbnMubGVuZ3RoID09PSAxKSB7XG4gICAgICBjb25zdCBkZWNsID0gc3RtdC5kZWNsYXJhdGlvbkxpc3QuZGVjbGFyYXRpb25zWzBdO1xuXG4gICAgICAvLyBJZiB0aGlzIGlzIHRoZSDJtU5vbkVtcHR5TW9kdWxlIGV4cG9ydCwgdGhlbiBzYXZlIGl0IGZvciBsYXRlci5cbiAgICAgIGlmICh0cy5pc0lkZW50aWZpZXIoZGVjbC5uYW1lKSkge1xuICAgICAgICBpZiAoZGVjbC5uYW1lLnRleHQgPT09ICfJtU5vbkVtcHR5TW9kdWxlJykge1xuICAgICAgICAgIG5vbkVtcHR5RXhwb3J0ID0gc3RtdDtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE90aGVyd2lzZSwgY2hlY2sgaWYgdGhpcyBleHBvcnQgaXMgYSBmYWN0b3J5IGZvciBhIGtub3duIE5nTW9kdWxlLCBhbmQgcmV0YWluIGl0IGlmIHNvLlxuICAgICAgICBjb25zdCBtYXRjaCA9IFNUUklQX05HX0ZBQ1RPUlkuZXhlYyhkZWNsLm5hbWUudGV4dCk7XG4gICAgICAgIGNvbnN0IG1vZHVsZSA9IG1hdGNoID8gbW9kdWxlU3ltYm9scy5nZXQobWF0Y2hbMV0pIDogbnVsbDtcbiAgICAgICAgaWYgKG1vZHVsZSkge1xuICAgICAgICAgIC8vIElmIHRoZSBtb2R1bGUgY2FuIGJlIHRyZWUgc2hha2VuLCB0aGVuIHRoZSBmYWN0b3J5IHNob3VsZCBiZSB3cmFwcGVkIGluIGFcbiAgICAgICAgICAvLyBgbm9TaWRlRWZmZWN0cygpYCBjYWxsIHdoaWNoIHRlbGxzIENsb3N1cmUgdG8gdHJlYXQgdGhlIGV4cHJlc3Npb24gYXMgcHVyZSwgYWxsb3dpbmdcbiAgICAgICAgICAvLyBpdCB0byBiZSByZW1vdmVkIGlmIHRoZSByZXN1bHQgaXMgbm90IHVzZWQuXG4gICAgICAgICAgLy9cbiAgICAgICAgICAvLyBgTmdNb2R1bGVgcyB3aXRoIGFuIGBpZGAgcHJvcGVydHkgd2lsbCBiZSBsYXp5IGxvYWRlZC4gR29vZ2xlLWludGVybmFsIGxhenkgbG9hZGluZ1xuICAgICAgICAgIC8vIGluZnJhIHJlbGllcyBvbiBhIHNpZGUgZWZmZWN0IGZyb20gdGhlIGBuZXcgTmdNb2R1bGVGYWN0b3J5KClgIGNhbGwsIHdoaWNoIHJlZ2lzdGVyc1xuICAgICAgICAgIC8vIHRoZSBtb2R1bGUgZ2xvYmFsbHkuIEJlY2F1c2Ugb2YgdGhpcywgd2UgKipjYW5ub3QqKiB0cmVlIHNoYWtlIGFueSBtb2R1bGUgd2hpY2ggaGFzXG4gICAgICAgICAgLy8gYW4gYGlkYCBwcm9wZXJ0eS4gRG9pbmcgc28gd291bGQgY2F1c2UgbGF6eSBsb2FkZWQgbW9kdWxlcyB0byBuZXZlciBiZSByZWdpc3RlcmVkLlxuICAgICAgICAgIGNvbnN0IG1vZHVsZUlzVHJlZVNoYWthYmxlID0gIW1vZHVsZS5oYXNJZDtcbiAgICAgICAgICBjb25zdCBuZXdTdG10ID0gIW1vZHVsZUlzVHJlZVNoYWthYmxlID9cbiAgICAgICAgICAgICAgc3RtdCA6XG4gICAgICAgICAgICAgIHVwZGF0ZUluaXRpYWxpemVycyhcbiAgICAgICAgICAgICAgICAgIHN0bXQsXG4gICAgICAgICAgICAgICAgICAoaW5pdCkgPT4gaW5pdCA/IHdyYXBJbk5vU2lkZUVmZmVjdHMoaW5pdCkgOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgdHJhbnNmb3JtZWRTdGF0ZW1lbnRzLnB1c2gobmV3U3RtdCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIExlYXZlIHRoZSBzdGF0ZW1lbnQgYWxvbmUsIGFzIGl0IGNhbid0IGJlIHVuZGVyc3Rvb2QuXG4gICAgICAgIHRyYW5zZm9ybWVkU3RhdGVtZW50cy5wdXNoKHN0bXQpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBJbmNsdWRlIG5vbi12YXJpYWJsZSBzdGF0ZW1lbnRzIChpbXBvcnRzLCBldGMpLlxuICAgICAgdHJhbnNmb3JtZWRTdGF0ZW1lbnRzLnB1c2goc3RtdCk7XG4gICAgfVxuICB9XG5cbiAgLy8gQ2hlY2sgd2hldGhlciB0aGUgZW1wdHkgbW9kdWxlIGV4cG9ydCBpcyBzdGlsbCBuZWVkZWQuXG4gIGlmICghdHJhbnNmb3JtZWRTdGF0ZW1lbnRzLnNvbWUodHMuaXNWYXJpYWJsZVN0YXRlbWVudCkgJiYgbm9uRW1wdHlFeHBvcnQgIT09IG51bGwpIHtcbiAgICAvLyBJZiB0aGUgcmVzdWx0aW5nIGZpbGUgaGFzIG5vIGZhY3RvcmllcywgaW5jbHVkZSBhbiBlbXB0eSBleHBvcnQgdG9cbiAgICAvLyBzYXRpc2Z5IGNsb3N1cmUgY29tcGlsZXIuXG4gICAgdHJhbnNmb3JtZWRTdGF0ZW1lbnRzLnB1c2gobm9uRW1wdHlFeHBvcnQpO1xuICB9XG5cbiAgZmlsZSA9IHRzLnVwZGF0ZVNvdXJjZUZpbGVOb2RlKGZpbGUsIHRyYW5zZm9ybWVkU3RhdGVtZW50cyk7XG5cbiAgLy8gSWYgYW55IGltcG9ydHMgdG8gQGFuZ3VsYXIvY29yZSB3ZXJlIGRldGVjdGVkIGFuZCByZXdyaXR0ZW4gKHdoaWNoIGhhcHBlbnMgd2hlbiBjb21waWxpbmdcbiAgLy8gQGFuZ3VsYXIvY29yZSksIGdvIHRocm91Z2ggdGhlIFNvdXJjZUZpbGUgYW5kIHJld3JpdGUgcmVmZXJlbmNlcyB0byBzeW1ib2xzIGltcG9ydGVkIGZyb20gY29yZS5cbiAgaWYgKGNvcmVJbXBvcnRJZGVudGlmaWVycy5zaXplID4gMCkge1xuICAgIGNvbnN0IHZpc2l0ID0gPFQgZXh0ZW5kcyB0cy5Ob2RlPihub2RlOiBUKTogVCA9PiB7XG4gICAgICBub2RlID0gdHMudmlzaXRFYWNoQ2hpbGQobm9kZSwgY2hpbGQgPT4gdmlzaXQoY2hpbGQpLCBjb250ZXh0KTtcblxuICAgICAgLy8gTG9vayBmb3IgZXhwcmVzc2lvbnMgb2YgdGhlIGZvcm0gXCJpLnNcIiB3aGVyZSAnaScgaXMgYSBkZXRlY3RlZCBuYW1lIGZvciBhbiBAYW5ndWxhci9jb3JlXG4gICAgICAvLyBpbXBvcnQgdGhhdCB3YXMgY2hhbmdlZCBhYm92ZS4gUmV3cml0ZSAncycgdXNpbmcgdGhlIEltcG9ydFJlc29sdmVyLlxuICAgICAgaWYgKHRzLmlzUHJvcGVydHlBY2Nlc3NFeHByZXNzaW9uKG5vZGUpICYmIHRzLmlzSWRlbnRpZmllcihub2RlLmV4cHJlc3Npb24pICYmXG4gICAgICAgICAgY29yZUltcG9ydElkZW50aWZpZXJzLmhhcyhub2RlLmV4cHJlc3Npb24udGV4dCkpIHtcbiAgICAgICAgLy8gVGhpcyBpcyBhbiBpbXBvcnQgb2YgYSBzeW1ib2wgZnJvbSBAYW5ndWxhci9jb3JlLiBUcmFuc2Zvcm0gaXQgd2l0aCB0aGUgaW1wb3J0UmV3cml0ZXIuXG4gICAgICAgIGNvbnN0IHJld3JpdHRlblN5bWJvbCA9IGltcG9ydFJld3JpdGVyLnJld3JpdGVTeW1ib2wobm9kZS5uYW1lLnRleHQsICdAYW5ndWxhci9jb3JlJyk7XG4gICAgICAgIGlmIChyZXdyaXR0ZW5TeW1ib2wgIT09IG5vZGUubmFtZS50ZXh0KSB7XG4gICAgICAgICAgY29uc3QgdXBkYXRlZCA9XG4gICAgICAgICAgICAgIHRzLnVwZGF0ZVByb3BlcnR5QWNjZXNzKG5vZGUsIG5vZGUuZXhwcmVzc2lvbiwgdHMuY3JlYXRlSWRlbnRpZmllcihyZXdyaXR0ZW5TeW1ib2wpKTtcbiAgICAgICAgICBub2RlID0gdXBkYXRlZCBhcyBUICYgdHMuUHJvcGVydHlBY2Nlc3NFeHByZXNzaW9uO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gbm9kZTtcbiAgICB9O1xuXG4gICAgZmlsZSA9IHZpc2l0KGZpbGUpO1xuICB9XG5cbiAgcmV0dXJuIGZpbGU7XG59XG5cblxuLyoqXG4gKiBQYXJzZXMgYW5kIHJldHVybnMgdGhlIGNvbW1lbnQgdGV4dCBvZiBhIFxcQGZpbGVvdmVydmlldyBjb21tZW50IGluIHRoZSBnaXZlbiBzb3VyY2UgZmlsZS5cbiAqL1xuZnVuY3Rpb24gZ2V0RmlsZW92ZXJ2aWV3Q29tbWVudChzb3VyY2VGaWxlOiB0cy5Tb3VyY2VGaWxlKTogc3RyaW5nfG51bGwge1xuICBjb25zdCB0ZXh0ID0gc291cmNlRmlsZS5nZXRGdWxsVGV4dCgpO1xuICBjb25zdCB0cml2aWEgPSB0ZXh0LnN1YnN0cmluZygwLCBzb3VyY2VGaWxlLmdldFN0YXJ0KCkpO1xuXG4gIGNvbnN0IGxlYWRpbmdDb21tZW50cyA9IHRzLmdldExlYWRpbmdDb21tZW50UmFuZ2VzKHRyaXZpYSwgMCk7XG4gIGlmICghbGVhZGluZ0NvbW1lbnRzIHx8IGxlYWRpbmdDb21tZW50cy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGNvbnN0IGNvbW1lbnQgPSBsZWFkaW5nQ29tbWVudHNbMF07XG4gIGlmIChjb21tZW50LmtpbmQgIT09IHRzLlN5bnRheEtpbmQuTXVsdGlMaW5lQ29tbWVudFRyaXZpYSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLy8gT25seSBjb21tZW50cyBzZXBhcmF0ZWQgd2l0aCBhIFxcblxcbiBmcm9tIHRoZSBmaWxlIGNvbnRlbnRzIGFyZSBjb25zaWRlcmVkIGZpbGUtbGV2ZWwgY29tbWVudHNcbiAgLy8gaW4gVHlwZVNjcmlwdC5cbiAgaWYgKHRleHQuc3Vic3RyaW5nKGNvbW1lbnQuZW5kLCBjb21tZW50LmVuZCArIDIpICE9PSAnXFxuXFxuJykge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgY29uc3QgY29tbWVudFRleHQgPSB0ZXh0LnN1YnN0cmluZyhjb21tZW50LnBvcywgY29tbWVudC5lbmQpO1xuICAvLyBDbG9zdXJlIENvbXBpbGVyIGlnbm9yZXMgQHN1cHByZXNzIGFuZCBzaW1pbGFyIGlmIHRoZSBjb21tZW50IGNvbnRhaW5zIEBsaWNlbnNlLlxuICBpZiAoY29tbWVudFRleHQuaW5kZXhPZignQGxpY2Vuc2UnKSAhPT0gLTEpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHJldHVybiBjb21tZW50VGV4dDtcbn1cblxuLyoqXG4gKiBXcmFwcyB0aGUgZ2l2ZW4gZXhwcmVzc2lvbiBpbiBhIGNhbGwgdG8gYMm1bm9TaWRlRWZmZWN0cygpYCwgd2hpY2ggdGVsbHNcbiAqIENsb3N1cmUgd2UgZG9uJ3QgY2FyZSBhYm91dCB0aGUgc2lkZSBlZmZlY3RzIG9mIHRoaXMgZXhwcmVzc2lvbiBhbmQgaXQgc2hvdWxkXG4gKiBiZSB0cmVhdGVkIGFzIFwicHVyZVwiLiBDbG9zdXJlIGlzIGZyZWUgdG8gdHJlZSBzaGFrZSB0aGlzIGV4cHJlc3Npb24gaWYgaXRzXG4gKiByZXN1bHQgaXMgbm90IHVzZWQuXG4gKlxuICogRXhhbXBsZTogVGFrZXMgYDEgKyAyYCBhbmQgcmV0dXJucyBgaTAuybVub1NpZGVFZmZlY3RzKCgpID0+IDEgKyAyKWAuXG4gKi9cbmZ1bmN0aW9uIHdyYXBJbk5vU2lkZUVmZmVjdHMoZXhwcjogdHMuRXhwcmVzc2lvbik6IHRzLkV4cHJlc3Npb24ge1xuICBjb25zdCBub1NpZGVFZmZlY3RzID0gdHMuY3JlYXRlUHJvcGVydHlBY2Nlc3MoXG4gICAgICB0cy5jcmVhdGVJZGVudGlmaWVyKCdpMCcpLFxuICAgICAgJ8m1bm9TaWRlRWZmZWN0cycsXG4gICk7XG5cbiAgcmV0dXJuIHRzLmNyZWF0ZUNhbGwoXG4gICAgICBub1NpZGVFZmZlY3RzLFxuICAgICAgLyogdHlwZUFyZ3VtZW50cyAqL1tdLFxuICAgICAgLyogYXJndW1lbnRzICovXG4gICAgICBbXG4gICAgICAgIHRzLmNyZWF0ZUZ1bmN0aW9uRXhwcmVzc2lvbihcbiAgICAgICAgICAgIC8qIG1vZGlmaWVycyAqL1tdLFxuICAgICAgICAgICAgLyogYXN0ZXJpc2tUb2tlbiAqLyB1bmRlZmluZWQsXG4gICAgICAgICAgICAvKiBuYW1lICovIHVuZGVmaW5lZCxcbiAgICAgICAgICAgIC8qIHR5cGVQYXJhbWV0ZXJzICovW10sXG4gICAgICAgICAgICAvKiBwYXJhbWV0ZXJzICovW10sXG4gICAgICAgICAgICAvKiB0eXBlICovIHVuZGVmaW5lZCxcbiAgICAgICAgICAgIC8qIGJvZHkgKi8gdHMuY3JlYXRlQmxvY2soW1xuICAgICAgICAgICAgICB0cy5jcmVhdGVSZXR1cm4oZXhwciksXG4gICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICksXG4gICAgICBdLFxuICApO1xufVxuXG4vKipcbiAqIENsb25lcyBhbmQgdXBkYXRlcyB0aGUgaW5pdGlhbGl6ZXJzIGZvciBhIGdpdmVuIHN0YXRlbWVudCB0byB1c2UgdGhlIG5ld1xuICogZXhwcmVzc2lvbiBwcm92aWRlZC4gRG9lcyBub3QgbXV0YXRlIHRoZSBpbnB1dCBzdGF0ZW1lbnQuXG4gKi9cbmZ1bmN0aW9uIHVwZGF0ZUluaXRpYWxpemVycyhcbiAgICBzdG10OiB0cy5WYXJpYWJsZVN0YXRlbWVudCxcbiAgICB1cGRhdGU6IChpbml0aWFsaXplcj86IHRzLkV4cHJlc3Npb24pID0+IHRzLkV4cHJlc3Npb24gfCB1bmRlZmluZWQsXG4gICAgKTogdHMuVmFyaWFibGVTdGF0ZW1lbnQge1xuICByZXR1cm4gdHMudXBkYXRlVmFyaWFibGVTdGF0ZW1lbnQoXG4gICAgICBzdG10LFxuICAgICAgc3RtdC5tb2RpZmllcnMsXG4gICAgICB0cy51cGRhdGVWYXJpYWJsZURlY2xhcmF0aW9uTGlzdChcbiAgICAgICAgICBzdG10LmRlY2xhcmF0aW9uTGlzdCxcbiAgICAgICAgICBzdG10LmRlY2xhcmF0aW9uTGlzdC5kZWNsYXJhdGlvbnMubWFwKFxuICAgICAgICAgICAgICAoZGVjbCkgPT4gdHMudXBkYXRlVmFyaWFibGVEZWNsYXJhdGlvbihcbiAgICAgICAgICAgICAgICAgIGRlY2wsXG4gICAgICAgICAgICAgICAgICBkZWNsLm5hbWUsXG4gICAgICAgICAgICAgICAgICBkZWNsLnR5cGUsXG4gICAgICAgICAgICAgICAgICB1cGRhdGUoZGVjbC5pbml0aWFsaXplciksXG4gICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICApLFxuICAgICAgICAgICksXG4gICk7XG59XG4iXX0=