(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/ngcc/src/rendering/renderer", ["require", "exports", "tslib", "@angular/compiler", "magic-string", "@angular/compiler-cli/src/ngtsc/translator", "@angular/compiler-cli/ngcc/src/constants", "@angular/compiler-cli/ngcc/src/rendering/rendering_formatter", "@angular/compiler-cli/ngcc/src/rendering/source_maps", "@angular/compiler-cli/ngcc/src/rendering/utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.renderConstantPool = exports.Renderer = void 0;
    var tslib_1 = require("tslib");
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var compiler_1 = require("@angular/compiler");
    var magic_string_1 = require("magic-string");
    var translator_1 = require("@angular/compiler-cli/src/ngtsc/translator");
    var constants_1 = require("@angular/compiler-cli/ngcc/src/constants");
    var rendering_formatter_1 = require("@angular/compiler-cli/ngcc/src/rendering/rendering_formatter");
    var source_maps_1 = require("@angular/compiler-cli/ngcc/src/rendering/source_maps");
    var utils_1 = require("@angular/compiler-cli/ngcc/src/rendering/utils");
    /**
     * A base-class for rendering an `AnalyzedFile`.
     *
     * Package formats have output files that must be rendered differently. Concrete sub-classes must
     * implement the `addImports`, `addDefinitions` and `removeDecorators` abstract methods.
     */
    var Renderer = /** @class */ (function () {
        function Renderer(host, srcFormatter, fs, logger, bundle, tsConfig) {
            if (tsConfig === void 0) { tsConfig = null; }
            this.host = host;
            this.srcFormatter = srcFormatter;
            this.fs = fs;
            this.logger = logger;
            this.bundle = bundle;
            this.tsConfig = tsConfig;
        }
        Renderer.prototype.renderProgram = function (decorationAnalyses, switchMarkerAnalyses, privateDeclarationsAnalyses) {
            var _this = this;
            var renderedFiles = [];
            // Transform the source files.
            this.bundle.src.program.getSourceFiles().forEach(function (sourceFile) {
                if (decorationAnalyses.has(sourceFile) || switchMarkerAnalyses.has(sourceFile) ||
                    sourceFile === _this.bundle.src.file) {
                    var compiledFile = decorationAnalyses.get(sourceFile);
                    var switchMarkerAnalysis = switchMarkerAnalyses.get(sourceFile);
                    renderedFiles.push.apply(renderedFiles, tslib_1.__spreadArray([], tslib_1.__read(_this.renderFile(sourceFile, compiledFile, switchMarkerAnalysis, privateDeclarationsAnalyses))));
                }
            });
            return renderedFiles;
        };
        /**
         * Render the source code and source-map for an Analyzed file.
         * @param compiledFile The analyzed file to render.
         * @param targetPath The absolute path where the rendered file will be written.
         */
        Renderer.prototype.renderFile = function (sourceFile, compiledFile, switchMarkerAnalysis, privateDeclarationsAnalyses) {
            var _this = this;
            var isEntryPoint = sourceFile === this.bundle.src.file;
            var outputText = new magic_string_1.default(sourceFile.text);
            if (switchMarkerAnalysis) {
                this.srcFormatter.rewriteSwitchableDeclarations(outputText, switchMarkerAnalysis.sourceFile, switchMarkerAnalysis.declarations);
            }
            var importManager = new translator_1.ImportManager(utils_1.getImportRewriter(this.bundle.src.r3SymbolsFile, this.bundle.isCore, this.bundle.isFlatCore), constants_1.IMPORT_PREFIX);
            if (compiledFile) {
                // TODO: remove constructor param metadata and property decorators (we need info from the
                // handlers to do this)
                var decoratorsToRemove = this.computeDecoratorsToRemove(compiledFile.compiledClasses);
                this.srcFormatter.removeDecorators(outputText, decoratorsToRemove);
                compiledFile.compiledClasses.forEach(function (clazz) {
                    var _a;
                    var renderedDefinition = _this.renderDefinitions(compiledFile.sourceFile, clazz, importManager, !!((_a = _this.tsConfig) === null || _a === void 0 ? void 0 : _a.options.annotateForClosureCompiler));
                    _this.srcFormatter.addDefinitions(outputText, clazz, renderedDefinition);
                    var renderedStatements = _this.renderAdjacentStatements(compiledFile.sourceFile, clazz, importManager);
                    _this.srcFormatter.addAdjacentStatements(outputText, clazz, renderedStatements);
                });
                if (!isEntryPoint && compiledFile.reexports.length > 0) {
                    this.srcFormatter.addDirectExports(outputText, compiledFile.reexports, importManager, compiledFile.sourceFile);
                }
                this.srcFormatter.addConstants(outputText, renderConstantPool(this.srcFormatter, compiledFile.sourceFile, compiledFile.constantPool, importManager), compiledFile.sourceFile);
            }
            // Add exports to the entry-point file
            if (isEntryPoint) {
                var entryPointBasePath = utils_1.stripExtension(this.bundle.src.path);
                this.srcFormatter.addExports(outputText, entryPointBasePath, privateDeclarationsAnalyses, importManager, sourceFile);
            }
            if (isEntryPoint || compiledFile) {
                this.srcFormatter.addImports(outputText, importManager.getAllImports(sourceFile.fileName), sourceFile);
            }
            if (compiledFile || switchMarkerAnalysis || isEntryPoint) {
                return source_maps_1.renderSourceAndMap(this.logger, this.fs, sourceFile, outputText);
            }
            else {
                return [];
            }
        };
        /**
         * From the given list of classes, computes a map of decorators that should be removed.
         * The decorators to remove are keyed by their container node, such that we can tell if
         * we should remove the entire decorator property.
         * @param classes The list of classes that may have decorators to remove.
         * @returns A map of decorators to remove, keyed by their container node.
         */
        Renderer.prototype.computeDecoratorsToRemove = function (classes) {
            var decoratorsToRemove = new rendering_formatter_1.RedundantDecoratorMap();
            classes.forEach(function (clazz) {
                if (clazz.decorators === null) {
                    return;
                }
                clazz.decorators.forEach(function (dec) {
                    if (dec.node === null) {
                        return;
                    }
                    var decoratorArray = dec.node.parent;
                    if (!decoratorsToRemove.has(decoratorArray)) {
                        decoratorsToRemove.set(decoratorArray, [dec.node]);
                    }
                    else {
                        decoratorsToRemove.get(decoratorArray).push(dec.node);
                    }
                });
            });
            return decoratorsToRemove;
        };
        /**
         * Render the definitions as source code for the given class.
         * @param sourceFile The file containing the class to process.
         * @param clazz The class whose definitions are to be rendered.
         * @param compilation The results of analyzing the class - this is used to generate the rendered
         * definitions.
         * @param imports An object that tracks the imports that are needed by the rendered definitions.
         */
        Renderer.prototype.renderDefinitions = function (sourceFile, compiledClass, imports, annotateForClosureCompiler) {
            var name = this.host.getInternalNameOfClass(compiledClass.declaration);
            var leadingComment = annotateForClosureCompiler ? compiler_1.jsDocComment([{ tagName: 'nocollapse' }]) : undefined;
            var statements = compiledClass.compilation.map(function (c) { return createAssignmentStatement(name, c.name, c.initializer, leadingComment); });
            return this.renderStatements(sourceFile, statements, imports);
        };
        /**
         * Render the adjacent statements as source code for the given class.
         * @param sourceFile The file containing the class to process.
         * @param clazz The class whose statements are to be rendered.
         * @param compilation The results of analyzing the class - this is used to generate the rendered
         * definitions.
         * @param imports An object that tracks the imports that are needed by the rendered definitions.
         */
        Renderer.prototype.renderAdjacentStatements = function (sourceFile, compiledClass, imports) {
            var e_1, _a;
            var statements = [];
            try {
                for (var _b = tslib_1.__values(compiledClass.compilation), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var c = _c.value;
                    statements.push.apply(statements, tslib_1.__spreadArray([], tslib_1.__read(c.statements)));
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return this.renderStatements(sourceFile, statements, imports);
        };
        Renderer.prototype.renderStatements = function (sourceFile, statements, imports) {
            var _this = this;
            var printStatement = function (stmt) {
                return _this.srcFormatter.printStatement(stmt, sourceFile, imports);
            };
            return statements.map(printStatement).join('\n');
        };
        return Renderer;
    }());
    exports.Renderer = Renderer;
    /**
     * Render the constant pool as source code for the given class.
     */
    function renderConstantPool(formatter, sourceFile, constantPool, imports) {
        var printStatement = function (stmt) { return formatter.printStatement(stmt, sourceFile, imports); };
        return constantPool.statements.map(printStatement).join('\n');
    }
    exports.renderConstantPool = renderConstantPool;
    /**
     * Create an Angular AST statement node that contains the assignment of the
     * compiled decorator to be applied to the class.
     * @param analyzedClass The info about the class whose statement we want to create.
     */
    function createAssignmentStatement(receiverName, propName, initializer, leadingComment) {
        var receiver = new compiler_1.WrappedNodeExpr(receiverName);
        var statement = new compiler_1.WritePropExpr(receiver, propName, initializer, /* type */ undefined, /* sourceSpan */ undefined)
            .toStmt();
        if (leadingComment !== undefined) {
            statement.addLeadingComment(leadingComment);
        }
        return statement;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvbmdjYy9zcmMvcmVuZGVyaW5nL3JlbmRlcmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7SUFBQTs7Ozs7O09BTUc7SUFDSCw4Q0FBb0k7SUFDcEksNkNBQXVDO0lBS3ZDLHlFQUE0RDtJQUs1RCxzRUFBMkM7SUFJM0Msb0dBQWdGO0lBQ2hGLG9GQUFpRDtJQUNqRCx3RUFBdUU7SUFFdkU7Ozs7O09BS0c7SUFDSDtRQUNFLGtCQUNZLElBQXdCLEVBQVUsWUFBZ0MsRUFDbEUsRUFBc0IsRUFBVSxNQUFjLEVBQVUsTUFBd0IsRUFDaEYsUUFBeUM7WUFBekMseUJBQUEsRUFBQSxlQUF5QztZQUZ6QyxTQUFJLEdBQUosSUFBSSxDQUFvQjtZQUFVLGlCQUFZLEdBQVosWUFBWSxDQUFvQjtZQUNsRSxPQUFFLEdBQUYsRUFBRSxDQUFvQjtZQUFVLFdBQU0sR0FBTixNQUFNLENBQVE7WUFBVSxXQUFNLEdBQU4sTUFBTSxDQUFrQjtZQUNoRixhQUFRLEdBQVIsUUFBUSxDQUFpQztRQUFHLENBQUM7UUFFekQsZ0NBQWEsR0FBYixVQUNJLGtCQUFzQyxFQUFFLG9CQUEwQyxFQUNsRiwyQkFBd0Q7WUFGNUQsaUJBaUJDO1lBZEMsSUFBTSxhQUFhLEdBQWtCLEVBQUUsQ0FBQztZQUV4Qyw4QkFBOEI7WUFDOUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLGNBQWMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFBLFVBQVU7Z0JBQ3pELElBQUksa0JBQWtCLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxJQUFJLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUM7b0JBQzFFLFVBQVUsS0FBSyxLQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUU7b0JB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QUUsV0FBdUIsRUFDM0UsY0FBK0I7UUFDakMsSUFBTSxRQUFRLEdBQUcsSUFBSSwwQkFBZSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ25ELElBQU0sU0FBUyxHQUNYLElBQUksd0JBQWEsQ0FDYixRQUFRLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxVQUFVLENBQUMsU0FBUyxFQUFFLGdCQUFnQixDQUFDLFNBQVMsQ0FBQzthQUNqRixNQUFNLEVBQUUsQ0FBQztRQUNsQixJQUFJLGNBQWMsS0FBSyxTQUFTLEVBQUU7WUFDaEMsU0FBUyxDQUFDLGlCQUFpQixDQUFDLGNBQWMsQ0FBQyxDQUFDO1NBQzdDO1FBQ0QsT0FBTyxTQUFTLENBQUM7SUFDbkIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtDb25zdGFudFBvb2wsIEV4cHJlc3Npb24sIGpzRG9jQ29tbWVudCwgTGVhZGluZ0NvbW1lbnQsIFN0YXRlbWVudCwgV3JhcHBlZE5vZGVFeHByLCBXcml0ZVByb3BFeHByfSBmcm9tICdAYW5ndWxhci9jb21waWxlcic7XG5pbXBvcnQgTWFnaWNTdHJpbmcgZnJvbSAnbWFnaWMtc3RyaW5nJztcbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuXG5pbXBvcnQge1JlYWRvbmx5RmlsZVN5c3RlbX0gZnJvbSAnLi4vLi4vLi4vc3JjL25ndHNjL2ZpbGVfc3lzdGVtJztcbmltcG9ydCB7TG9nZ2VyfSBmcm9tICcuLi8uLi8uLi9zcmMvbmd0c2MvbG9nZ2luZyc7XG5pbXBvcnQge0ltcG9ydE1hbmFnZXJ9IGZyb20gJy4uLy4uLy4uL3NyYy9uZ3RzYy90cmFuc2xhdG9yJztcbmltcG9ydCB7UGFyc2VkQ29uZmlndXJhdGlvbn0gZnJvbSAnLi4vLi4vLi4vc3JjL3BlcmZvcm1fY29tcGlsZSc7XG5pbXBvcnQge1ByaXZhdGVEZWNsYXJhdGlvbnNBbmFseXNlc30gZnJvbSAnLi4vYW5hbHlzaXMvcHJpdmF0ZV9kZWNsYXJhdGlvbnNfYW5hbHl6ZXInO1xuaW1wb3J0IHtTd2l0Y2hNYXJrZXJBbmFseXNlcywgU3dpdGNoTWFya2VyQW5hbHlzaXN9IGZyb20gJy4uL2FuYWx5c2lzL3N3aXRjaF9tYXJrZXJfYW5hbHl6ZXInO1xuaW1wb3J0IHtDb21waWxlZENsYXNzLCBDb21waWxlZEZpbGUsIERlY29yYXRpb25BbmFseXNlc30gZnJvbSAnLi4vYW5hbHlzaXMvdHlwZXMnO1xuaW1wb3J0IHtJTVBPUlRfUFJFRklYfSBmcm9tICcuLi9jb25zdGFudHMnO1xuaW1wb3J0IHtOZ2NjUmVmbGVjdGlvbkhvc3R9IGZyb20gJy4uL2hvc3QvbmdjY19ob3N0JztcbmltcG9ydCB7RW50cnlQb2ludEJ1bmRsZX0gZnJvbSAnLi4vcGFja2FnZXMvZW50cnlfcG9pbnRfYnVuZGxlJztcblxuaW1wb3J0IHtSZWR1bmRhbnREZWNvcmF0b3JNYXAsIFJlbmRlcmluZ0Zvcm1hdHRlcn0gZnJvbSAnLi9yZW5kZXJpbmdfZm9ybWF0dGVyJztcbmltcG9ydCB7cmVuZGVyU291cmNlQW5kTWFwfSBmcm9tICcuL3NvdXJjZV9tYXBzJztcbmltcG9ydCB7RmlsZVRvV3JpdGUsIGdldEltcG9ydFJld3JpdGVyLCBzdHJpcEV4dGVuc2lvbn0gZnJvbSAnLi91dGlscyc7XG5cbi8qKlxuICogQSBiYXNlLWNsYXNzIGZvciByZW5kZXJpbmcgYW4gYEFuYWx5emVkRmlsZWAuXG4gKlxuICogUGFja2FnZSBmb3JtYXRzIGhhdmUgb3V0cHV0IGZpbGVzIHRoYXQgbXVzdCBiZSByZW5kZXJlZCBkaWZmZXJlbnRseS4gQ29uY3JldGUgc3ViLWNsYXNzZXMgbXVzdFxuICogaW1wbGVtZW50IHRoZSBgYWRkSW1wb3J0c2AsIGBhZGREZWZpbml0aW9uc2AgYW5kIGByZW1vdmVEZWNvcmF0b3JzYCBhYnN0cmFjdCBtZXRob2RzLlxuICovXG5leHBvcnQgY2xhc3MgUmVuZGVyZXIge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgaG9zdDogTmdjY1JlZmxlY3Rpb25Ib3N0LCBwcml2YXRlIHNyY0Zvcm1hdHRlcjogUmVuZGVyaW5nRm9ybWF0dGVyLFxuICAgICAgcHJpdmF0ZSBmczogUmVhZG9ubHlGaWxlU3lzdGVtLCBwcml2YXRlIGxvZ2dlcjogTG9nZ2VyLCBwcml2YXRlIGJ1bmRsZTogRW50cnlQb2ludEJ1bmRsZSxcbiAgICAgIHByaXZhdGUgdHNDb25maWc6IFBhcnNlZENvbmZpZ3VyYXRpb258bnVsbCA9IG51bGwpIHt9XG5cbiAgcmVuZGVyUHJvZ3JhbShcbiAgICAgIGRlY29yYXRpb25BbmFseXNlczogRGVjb3JhdGlvbkFuYWx5c2VzLCBzd2l0Y2hNYXJrZXJBbmFseXNlczogU3dpdGNoTWFya2VyQW5hbHlzZXMsXG4gICAgICBwcml2YXRlRGVjbGFyYXRpb25zQW5hbHlzZXM6IFByaXZhdGVEZWNsYXJhdGlvbnNBbmFseXNlcyk6IEZpbGVUb1dyaXRlW10ge1xuICAgIGNvbnN0IHJlbmRlcmVkRmlsZXM6IEZpbGVUb1dyaXRlW10gPSBbXTtcblxuICAgIC8vIFRyYW5zZm9ybSB0aGUgc291cmNlIGZpbGVzLlxuICAgIHRoaXMuYnVuZGxlLnNyYy5wcm9ncmFtLmdldFNvdXJjZUZpbGVzKCkuZm9yRWFjaChzb3VyY2VGaWxlID0+IHtcbiAgICAgIGlmIChkZWNvcmF0aW9uQW5hbHlzZXMuaGFzKHNvdXJjZUZpbGUpIHx8IHN3aXRjaE1hcmtlckFuYWx5c2VzLmhhcyhzb3VyY2VGaWxlKSB8fFxuICAgICAgICAgIHNvdXJjZUZpbGUgPT09IHRoaXMuYnVuZGxlLnNyYy5maWxlKSB7XG4gICAgICAgIGNvbnN0IGNvbXBpbGVkRmlsZSA9IGRlY29yYXRpb25BbmFseXNlcy5nZXQoc291cmNlRmlsZSk7XG4gICAgICAgIGNvbnN0IHN3aXRjaE1hcmtlckFuYWx5c2lzID0gc3dpdGNoTWFya2VyQW5hbHlzZXMuZ2V0KHNvdXJjZUZpbGUpO1xuICAgICAgICByZW5kZXJlZEZpbGVzLnB1c2goLi4udGhpcy5yZW5kZXJGaWxlKFxuICAgICAgICAgICAgc291cmNlRmlsZSwgY29tcGlsZWRGaWxlLCBzd2l0Y2hNYXJrZXJBbmFseXNpcywgcHJpdmF0ZURlY2xhcmF0aW9uc0FuYWx5c2VzKSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gcmVuZGVyZWRGaWxlcztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW5kZXIgdGhlIHNvdXJjZSBjb2RlIGFuZCBzb3VyY2UtbWFwIGZvciBhbiBBbmFseXplZCBmaWxlLlxuICAgKiBAcGFyYW0gY29tcGlsZWRGaWxlIFRoZSBhbmFseXplZCBmaWxlIHRvIHJlbmRlci5cbiAgICogQHBhcmFtIHRhcmdldFBhdGggVGhlIGFic29sdXRlIHBhdGggd2hlcmUgdGhlIHJlbmRlcmVkIGZpbGUgd2lsbCBiZSB3cml0dGVuLlxuICAgKi9cbiAgcmVuZGVyRmlsZShcbiAgICAgIHNvdXJjZUZpbGU6IHRzLlNvdXJjZUZpbGUsIGNvbXBpbGVkRmlsZTogQ29tcGlsZWRGaWxlfHVuZGVmaW5lZCxcbiAgICAgIHN3aXRjaE1hcmtlckFuYWx5c2lzOiBTd2l0Y2hNYXJrZXJBbmFseXNpc3x1bmRlZmluZWQsXG4gICAgICBwcml2YXRlRGVjbGFyYXRpb25zQW5hbHlzZXM6IFByaXZhdGVEZWNsYXJhdGlvbnNBbmFseXNlcyk6IEZpbGVUb1dyaXRlW10ge1xuICAgIGNvbnN0IGlzRW50cnlQb2ludCA9IHNvdXJjZUZpbGUgPT09IHRoaXMuYnVuZGxlLnNyYy5maWxlO1xuICAgIGNvbnN0IG91dHB1dFRleHQgPSBuZXcgTWFnaWNTdHJpbmcoc291cmNlRmlsZS50ZXh0KTtcblxuICAgIGlmIChzd2l0Y2hNYXJrZXJBbmFseXNpcykge1xuICAgICAgdGhpcy5zcmNGb3JtYXR0ZXIucmV3cml0ZVN3aXRjaGFibGVEZWNsYXJhdGlvbnMoXG4gICAgICAgICAgb3V0cHV0VGV4dCwgc3dpdGNoTWFya2VyQW5hbHlzaXMuc291cmNlRmlsZSwgc3dpdGNoTWFya2VyQW5hbHlzaXMuZGVjbGFyYXRpb25zKTtcbiAgICB9XG5cbiAgICBjb25zdCBpbXBvcnRNYW5hZ2VyID0gbmV3IEltcG9ydE1hbmFnZXIoXG4gICAgICAgIGdldEltcG9ydFJld3JpdGVyKFxuICAgICAgICAgICAgdGhpcy5idW5kbGUuc3JjLnIzU3ltYm9sc0ZpbGUsIHRoaXMuYnVuZGxlLmlzQ29yZSwgdGhpcy5idW5kbGUuaXNGbGF0Q29yZSksXG4gICAgICAgIElNUE9SVF9QUkVGSVgpO1xuXG4gICAgaWYgKGNvbXBpbGVkRmlsZSkge1xuICAgICAgLy8gVE9ETzogcmVtb3ZlIGNvbnN0cnVjdG9yIHBhcmFtIG1ldGFkYXRhIGFuZCBwcm9wZXJ0eSBkZWNvcmF0b3JzICh3ZSBuZWVkIGluZm8gZnJvbSB0aGVcbiAgICAgIC8vIGhhbmRsZXJzIHRvIGRvIHRoaXMpXG4gICAgICBjb25zdCBkZWNvcmF0b3JzVG9SZW1vdmUgPSB0aGlzLmNvbXB1dGVEZWNvcmF0b3JzVG9SZW1vdmUoY29tcGlsZWRGaWxlLmNvbXBpbGVkQ2xhc3Nlcyk7XG4gICAgICB0aGlzLnNyY0Zvcm1hdHRlci5yZW1vdmVEZWNvcmF0b3JzKG91dHB1dFRleHQsIGRlY29yYXRvcnNUb1JlbW92ZSk7XG5cbiAgICAgIGNvbXBpbGVkRmlsZS5jb21waWxlZENsYXNzZXMuZm9yRWFjaChjbGF6eiA9PiB7XG4gICAgICAgIGNvbnN0IHJlbmRlcmVkRGVmaW5pdGlvbiA9IHRoaXMucmVuZGVyRGVmaW5pdGlvbnMoXG4gICAgICAgICAgICBjb21waWxlZEZpbGUuc291cmNlRmlsZSwgY2xhenosIGltcG9ydE1hbmFnZXIsXG4gICAgICAgICAgICAhIXRoaXMudHNDb25maWc/Lm9wdGlvbnMuYW5ub3RhdGVGb3JDbG9zdXJlQ29tcGlsZXIpO1xuICAgICAgICB0aGlzLnNyY0Zvcm1hdHRlci5hZGREZWZpbml0aW9ucyhvdXRwdXRUZXh0LCBjbGF6eiwgcmVuZGVyZWREZWZpbml0aW9uKTtcblxuICAgICAgICBjb25zdCByZW5kZXJlZFN0YXRlbWVudHMgPVxuICAgICAgICAgICAgdGhpcy5yZW5kZXJBZGphY2VudFN0YXRlbWVudHMoY29tcGlsZWRGaWxlLnNvdXJjZUZpbGUsIGNsYXp6LCBpbXBvcnRNYW5hZ2VyKTtcbiAgICAgICAgdGhpcy5zcmNGb3JtYXR0ZXIuYWRkQWRqYWNlbnRTdGF0ZW1lbnRzKG91dHB1dFRleHQsIGNsYXp6LCByZW5kZXJlZFN0YXRlbWVudHMpO1xuICAgICAgfSk7XG5cbiAgICAgIGlmICghaXNFbnRyeVBvaW50ICYmIGNvbXBpbGVkRmlsZS5yZWV4cG9ydHMubGVuZ3RoID4gMCkge1xuICAgICAgICB0aGlzLnNyY0Zvcm1hdHRlci5hZGREaXJlY3RFeHBvcnRzKFxuICAgICAgICAgICAgb3V0cHV0VGV4dCwgY29tcGlsZWRGaWxlLnJlZXhwb3J0cywgaW1wb3J0TWFuYWdlciwgY29tcGlsZWRGaWxlLnNvdXJjZUZpbGUpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnNyY0Zvcm1hdHRlci5hZGRDb25zdGFudHMoXG4gICAgICAgICAgb3V0cHV0VGV4dCxcbiAgICAgICAgICByZW5kZXJDb25zdGFudFBvb2woXG4gICAgICAgICAgICAgIHRoaXMuc3JjRm9ybWF0dGVyLCBjb21waWxlZEZpbGUuc291cmNlRmlsZSwgY29tcGlsZWRGaWxlLmNvbnN0YW50UG9vbCwgaW1wb3J0TWFuYWdlciksXG4gICAgICAgICAgY29tcGlsZWRGaWxlLnNvdXJjZUZpbGUpO1xuICAgIH1cblxuICAgIC8vIEFkZCBleHBvcnRzIHRvIHRoZSBlbnRyeS1wb2ludCBmaWxlXG4gICAgaWYgKGlzRW50cnlQb2ludCkge1xuICAgICAgY29uc3QgZW50cnlQb2ludEJhc2VQYXRoID0gc3RyaXBFeHRlbnNpb24odGhpcy5idW5kbGUuc3JjLnBhdGgpO1xuICAgICAgdGhpcy5zcmNGb3JtYXR0ZXIuYWRkRXhwb3J0cyhcbiAgICAgICAgICBvdXRwdXRUZXh0LCBlbnRyeVBvaW50QmFzZVBhdGgsIHByaXZhdGVEZWNsYXJhdGlvbnNBbmFseXNlcywgaW1wb3J0TWFuYWdlciwgc291cmNlRmlsZSk7XG4gICAgfVxuXG4gICAgaWYgKGlzRW50cnlQb2ludCB8fCBjb21waWxlZEZpbGUpIHtcbiAgICAgIHRoaXMuc3JjRm9ybWF0dGVyLmFkZEltcG9ydHMoXG4gICAgICAgICAgb3V0cHV0VGV4dCwgaW1wb3J0TWFuYWdlci5nZXRBbGxJbXBvcnRzKHNvdXJjZUZpbGUuZmlsZU5hbWUpLCBzb3VyY2VGaWxlKTtcbiAgICB9XG5cbiAgICBpZiAoY29tcGlsZWRGaWxlIHx8IHN3aXRjaE1hcmtlckFuYWx5c2lzIHx8IGlzRW50cnlQb2ludCkge1xuICAgICAgcmV0dXJuIHJlbmRlclNvdXJjZUFuZE1hcCh0aGlzLmxvZ2dlciwgdGhpcy5mcywgc291cmNlRmlsZSwgb3V0cHV0VGV4dCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRnJvbSB0aGUgZ2l2ZW4gbGlzdCBvZiBjbGFzc2VzLCBjb21wdXRlcyBhIG1hcCBvZiBkZWNvcmF0b3JzIHRoYXQgc2hvdWxkIGJlIHJlbW92ZWQuXG4gICAqIFRoZSBkZWNvcmF0b3JzIHRvIHJlbW92ZSBhcmUga2V5ZWQgYnkgdGhlaXIgY29udGFpbmVyIG5vZGUsIHN1Y2ggdGhhdCB3ZSBjYW4gdGVsbCBpZlxuICAgKiB3ZSBzaG91bGQgcmVtb3ZlIHRoZSBlbnRpcmUgZGVjb3JhdG9yIHByb3BlcnR5LlxuICAgKiBAcGFyYW0gY2xhc3NlcyBUaGUgbGlzdCBvZiBjbGFzc2VzIHRoYXQgbWF5IGhhdmUgZGVjb3JhdG9ycyB0byByZW1vdmUuXG4gICAqIEByZXR1cm5zIEEgbWFwIG9mIGRlY29yYXRvcnMgdG8gcmVtb3ZlLCBrZXllZCBieSB0aGVpciBjb250YWluZXIgbm9kZS5cbiAgICovXG4gIHByaXZhdGUgY29tcHV0ZURlY29yYXRvcnNUb1JlbW92ZShjbGFzc2VzOiBDb21waWxlZENsYXNzW10pOiBSZWR1bmRhbnREZWNvcmF0b3JNYXAge1xuICAgIGNvbnN0IGRlY29yYXRvcnNUb1JlbW92ZSA9IG5ldyBSZWR1bmRhbnREZWNvcmF0b3JNYXAoKTtcbiAgICBjbGFzc2VzLmZvckVhY2goY2xhenogPT4ge1xuICAgICAgaWYgKGNsYXp6LmRlY29yYXRvcnMgPT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjbGF6ei5kZWNvcmF0b3JzLmZvckVhY2goZGVjID0+IHtcbiAgICAgICAgaWYgKGRlYy5ub2RlID09PSBudWxsKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGRlY29yYXRvckFycmF5ID0gZGVjLm5vZGUucGFyZW50ITtcbiAgICAgICAgaWYgKCFkZWNvcmF0b3JzVG9SZW1vdmUuaGFzKGRlY29yYXRvckFycmF5KSkge1xuICAgICAgICAgIGRlY29yYXRvcnNUb1JlbW92ZS5zZXQoZGVjb3JhdG9yQXJyYXksIFtkZWMubm9kZV0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRlY29yYXRvcnNUb1JlbW92ZS5nZXQoZGVjb3JhdG9yQXJyYXkpIS5wdXNoKGRlYy5ub2RlKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGRlY29yYXRvcnNUb1JlbW92ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW5kZXIgdGhlIGRlZmluaXRpb25zIGFzIHNvdXJjZSBjb2RlIGZvciB0aGUgZ2l2ZW4gY2xhc3MuXG4gICAqIEBwYXJhbSBzb3VyY2VGaWxlIFRoZSBmaWxlIGNvbnRhaW5pbmcgdGhlIGNsYXNzIHRvIHByb2Nlc3MuXG4gICAqIEBwYXJhbSBjbGF6eiBUaGUgY2xhc3Mgd2hvc2UgZGVmaW5pdGlvbnMgYXJlIHRvIGJlIHJlbmRlcmVkLlxuICAgKiBAcGFyYW0gY29tcGlsYXRpb24gVGhlIHJlc3VsdHMgb2YgYW5hbHl6aW5nIHRoZSBjbGFzcyAtIHRoaXMgaXMgdXNlZCB0byBnZW5lcmF0ZSB0aGUgcmVuZGVyZWRcbiAgICogZGVmaW5pdGlvbnMuXG4gICAqIEBwYXJhbSBpbXBvcnRzIEFuIG9iamVjdCB0aGF0IHRyYWNrcyB0aGUgaW1wb3J0cyB0aGF0IGFyZSBuZWVkZWQgYnkgdGhlIHJlbmRlcmVkIGRlZmluaXRpb25zLlxuICAgKi9cbiAgcHJpdmF0ZSByZW5kZXJEZWZpbml0aW9ucyhcbiAgICAgIHNvdXJjZUZpbGU6IHRzLlNvdXJjZUZpbGUsIGNvbXBpbGVkQ2xhc3M6IENvbXBpbGVkQ2xhc3MsIGltcG9ydHM6IEltcG9ydE1hbmFnZXIsXG4gICAgICBhbm5vdGF0ZUZvckNsb3N1cmVDb21waWxlcjogYm9vbGVhbik6IHN0cmluZyB7XG4gICAgY29uc3QgbmFtZSA9IHRoaXMuaG9zdC5nZXRJbnRlcm5hbE5hbWVPZkNsYXNzKGNvbXBpbGVkQ2xhc3MuZGVjbGFyYXRpb24pO1xuICAgIGNvbnN0IGxlYWRpbmdDb21tZW50ID1cbiAgICAgICAgYW5ub3RhdGVGb3JDbG9zdXJlQ29tcGlsZXIgPyBqc0RvY0NvbW1lbnQoW3t0YWdOYW1lOiAnbm9jb2xsYXBzZSd9XSkgOiB1bmRlZmluZWQ7XG4gICAgY29uc3Qgc3RhdGVtZW50czogU3RhdGVtZW50W10gPSBjb21waWxlZENsYXNzLmNvbXBpbGF0aW9uLm1hcChcbiAgICAgICAgYyA9PiBjcmVhdGVBc3NpZ25tZW50U3RhdGVtZW50KG5hbWUsIGMubmFtZSwgYy5pbml0aWFsaXplciwgbGVhZGluZ0NvbW1lbnQpKTtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJTdGF0ZW1lbnRzKHNvdXJjZUZpbGUsIHN0YXRlbWVudHMsIGltcG9ydHMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbmRlciB0aGUgYWRqYWNlbnQgc3RhdGVtZW50cyBhcyBzb3VyY2UgY29kZSBmb3IgdGhlIGdpdmVuIGNsYXNzLlxuICAgKiBAcGFyYW0gc291cmNlRmlsZSBUaGUgZmlsZSBjb250YWluaW5nIHRoZSBjbGFzcyB0byBwcm9jZXNzLlxuICAgKiBAcGFyYW0gY2xhenogVGhlIGNsYXNzIHdob3NlIHN0YXRlbWVudHMgYXJlIHRvIGJlIHJlbmRlcmVkLlxuICAgKiBAcGFyYW0gY29tcGlsYXRpb24gVGhlIHJlc3VsdHMgb2YgYW5hbHl6aW5nIHRoZSBjbGFzcyAtIHRoaXMgaXMgdXNlZCB0byBnZW5lcmF0ZSB0aGUgcmVuZGVyZWRcbiAgICogZGVmaW5pdGlvbnMuXG4gICAqIEBwYXJhbSBpbXBvcnRzIEFuIG9iamVjdCB0aGF0IHRyYWNrcyB0aGUgaW1wb3J0cyB0aGF0IGFyZSBuZWVkZWQgYnkgdGhlIHJlbmRlcmVkIGRlZmluaXRpb25zLlxuICAgKi9cbiAgcHJpdmF0ZSByZW5kZXJBZGphY2VudFN0YXRlbWVudHMoXG4gICAgICBzb3VyY2VGaWxlOiB0cy5Tb3VyY2VGaWxlLCBjb21waWxlZENsYXNzOiBDb21waWxlZENsYXNzLCBpbXBvcnRzOiBJbXBvcnRNYW5hZ2VyKTogc3RyaW5nIHtcbiAgICBjb25zdCBzdGF0ZW1lbnRzOiBTdGF0ZW1lbnRbXSA9IFtdO1xuICAgIGZvciAoY29uc3QgYyBvZiBjb21waWxlZENsYXNzLmNvbXBpbGF0aW9uKSB7XG4gICAgICBzdGF0ZW1lbnRzLnB1c2goLi4uYy5zdGF0ZW1lbnRzKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyU3RhdGVtZW50cyhzb3VyY2VGaWxlLCBzdGF0ZW1lbnRzLCBpbXBvcnRzKTtcbiAgfVxuXG4gIHByaXZhdGUgcmVuZGVyU3RhdGVtZW50cyhcbiAgICAgIHNvdXJjZUZpbGU6IHRzLlNvdXJjZUZpbGUsIHN0YXRlbWVudHM6IFN0YXRlbWVudFtdLCBpbXBvcnRzOiBJbXBvcnRNYW5hZ2VyKTogc3RyaW5nIHtcbiAgICBjb25zdCBwcmludFN0YXRlbWVudCA9IChzdG10OiBTdGF0ZW1lbnQpID0+XG4gICAgICAgIHRoaXMuc3JjRm9ybWF0dGVyLnByaW50U3RhdGVtZW50KHN0bXQsIHNvdXJjZUZpbGUsIGltcG9ydHMpO1xuICAgIHJldHVybiBzdGF0ZW1lbnRzLm1hcChwcmludFN0YXRlbWVudCkuam9pbignXFxuJyk7XG4gIH1cbn1cblxuLyoqXG4gKiBSZW5kZXIgdGhlIGNvbnN0YW50IHBvb2wgYXMgc291cmNlIGNvZGUgZm9yIHRoZSBnaXZlbiBjbGFzcy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlckNvbnN0YW50UG9vbChcbiAgICBmb3JtYXR0ZXI6IFJlbmRlcmluZ0Zvcm1hdHRlciwgc291cmNlRmlsZTogdHMuU291cmNlRmlsZSwgY29uc3RhbnRQb29sOiBDb25zdGFudFBvb2wsXG4gICAgaW1wb3J0czogSW1wb3J0TWFuYWdlcik6IHN0cmluZyB7XG4gIGNvbnN0IHByaW50U3RhdGVtZW50ID0gKHN0bXQ6IFN0YXRlbWVudCkgPT4gZm9ybWF0dGVyLnByaW50U3RhdGVtZW50KHN0bXQsIHNvdXJjZUZpbGUsIGltcG9ydHMpO1xuICByZXR1cm4gY29uc3RhbnRQb29sLnN0YXRlbWVudHMubWFwKHByaW50U3RhdGVtZW50KS5qb2luKCdcXG4nKTtcbn1cblxuLyoqXG4gKiBDcmVhdGUgYW4gQW5ndWxhciBBU1Qgc3RhdGVtZW50IG5vZGUgdGhhdCBjb250YWlucyB0aGUgYXNzaWdubWVudCBvZiB0aGVcbiAqIGNvbXBpbGVkIGRlY29yYXRvciB0byBiZSBhcHBsaWVkIHRvIHRoZSBjbGFzcy5cbiAqIEBwYXJhbSBhbmFseXplZENsYXNzIFRoZSBpbmZvIGFib3V0IHRoZSBjbGFzcyB3aG9zZSBzdGF0ZW1lbnQgd2Ugd2FudCB0byBjcmVhdGUuXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUFzc2lnbm1lbnRTdGF0ZW1lbnQoXG4gICAgcmVjZWl2ZXJOYW1lOiB0cy5EZWNsYXJhdGlvbk5hbWUsIHByb3BOYW1lOiBzdHJpbmcsIGluaXRpYWxpemVyOiBFeHByZXNzaW9uLFxuICAgIGxlYWRpbmdDb21tZW50PzogTGVhZGluZ0NvbW1lbnQpOiBTdGF0ZW1lbnQge1xuICBjb25zdCByZWNlaXZlciA9IG5ldyBXcmFwcGVkTm9kZUV4cHIocmVjZWl2ZXJOYW1lKTtcbiAgY29uc3Qgc3RhdGVtZW50ID1cbiAgICAgIG5ldyBXcml0ZVByb3BFeHByKFxuICAgICAgICAgIHJlY2VpdmVyLCBwcm9wTmFtZSwgaW5pdGlhbGl6ZXIsIC8qIHR5cGUgKi8gdW5kZWZpbmVkLCAvKiBzb3VyY2VTcGFuICovIHVuZGVmaW5lZClcbiAgICAgICAgICAudG9TdG10KCk7XG4gIGlmIChsZWFkaW5nQ29tbWVudCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgc3RhdGVtZW50LmFkZExlYWRpbmdDb21tZW50KGxlYWRpbmdDb21tZW50KTtcbiAgfVxuICByZXR1cm4gc3RhdGVtZW50O1xufVxuIl19