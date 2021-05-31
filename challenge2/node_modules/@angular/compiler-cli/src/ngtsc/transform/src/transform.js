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
        define("@angular/compiler-cli/src/ngtsc/transform/src/transform", ["require", "exports", "tslib", "@angular/compiler", "typescript", "@angular/compiler-cli/src/ngtsc/imports/src/default", "@angular/compiler-cli/src/ngtsc/perf", "@angular/compiler-cli/src/ngtsc/translator", "@angular/compiler-cli/src/ngtsc/util/src/visitor", "@angular/compiler-cli/src/ngtsc/transform/src/utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ivyTransformFactory = void 0;
    var tslib_1 = require("tslib");
    var compiler_1 = require("@angular/compiler");
    var ts = require("typescript");
    var default_1 = require("@angular/compiler-cli/src/ngtsc/imports/src/default");
    var perf_1 = require("@angular/compiler-cli/src/ngtsc/perf");
    var translator_1 = require("@angular/compiler-cli/src/ngtsc/translator");
    var visitor_1 = require("@angular/compiler-cli/src/ngtsc/util/src/visitor");
    var utils_1 = require("@angular/compiler-cli/src/ngtsc/transform/src/utils");
    var NO_DECORATORS = new Set();
    var CLOSURE_FILE_OVERVIEW_REGEXP = /\s+@fileoverview\s+/i;
    function ivyTransformFactory(compilation, reflector, importRewriter, defaultImportTracker, perf, isCore, isClosureCompilerEnabled) {
        var recordWrappedNode = createRecorderFn(defaultImportTracker);
        return function (context) {
            return function (file) {
                return perf.inPhase(perf_1.PerfPhase.Compile, function () { return transformIvySourceFile(compilation, context, reflector, importRewriter, file, isCore, isClosureCompilerEnabled, recordWrappedNode); });
            };
        };
    }
    exports.ivyTransformFactory = ivyTransformFactory;
    /**
     * Visits all classes, performs Ivy compilation where Angular decorators are present and collects
     * result in a Map that associates a ts.ClassDeclaration with Ivy compilation results. This visitor
     * does NOT perform any TS transformations.
     */
    var IvyCompilationVisitor = /** @class */ (function (_super) {
        tslib_1.__extends(IvyCompilationVisitor, _super);
        function IvyCompilationVisitor(compilation, constantPool) {
            var _this = _super.call(this) || this;
            _this.compilation = compilation;
            _this.constantPool = constantPool;
            _this.classCompilationMap = new Map();
            return _this;
        }
        IvyCompilationVisitor.prototype.visitClassDeclaration = function (node) {
            // Determine if this class has an Ivy field that needs to be added, and compile the field
            // to an expression if so.
            var result = this.compilation.compile(node, this.constantPool);
            if (result !== null) {
                this.classCompilationMap.set(node, result);
            }
            return { node: node };
        };
        return IvyCompilationVisitor;
    }(visitor_1.Visitor));
    /**
     * Visits all classes and performs transformation of corresponding TS nodes based on the Ivy
     * compilation results (provided as an argument).
     */
    var IvyTransformationVisitor = /** @class */ (function (_super) {
        tslib_1.__extends(IvyTransformationVisitor, _super);
        function IvyTransformationVisitor(compilation, classCompilationMap, reflector, importManager, recordWrappedNodeExpr, isClosureCompilerEnabled, isCore) {
            var _this = _super.call(this) || this;
            _this.compilation = compilation;
            _this.classCompilationMap = classCompilationMap;
            _this.reflector = reflector;
            _this.importManager = importManager;
            _this.recordWrappedNodeExpr = recordWrappedNodeExpr;
            _this.isClosureCompilerEnabled = isClosureCompilerEnabled;
            _this.isCore = isCore;
            return _this;
        }
        IvyTransformationVisitor.prototype.visitClassDeclaration = function (node) {
            var e_1, _a;
            var _this = this;
            // If this class is not registered in the map, it means that it doesn't have Angular decorators,
            // thus no further processing is required.
            if (!this.classCompilationMap.has(node)) {
                return { node: node };
            }
            var translateOptions = {
                recordWrappedNode: this.recordWrappedNodeExpr,
                annotateForClosureCompiler: this.isClosureCompilerEnabled,
            };
            // There is at least one field to add.
            var statements = [];
            var members = tslib_1.__spreadArray([], tslib_1.__read(node.members));
            try {
                for (var _b = tslib_1.__values(this.classCompilationMap.get(node)), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var field = _c.value;
                    // Translate the initializer for the field into TS nodes.
                    var exprNode = translator_1.translateExpression(field.initializer, this.importManager, translateOptions);
                    // Create a static property declaration for the new field.
                    var property = ts.createProperty(undefined, [ts.createToken(ts.SyntaxKind.StaticKeyword)], field.name, undefined, undefined, exprNode);
                    if (this.isClosureCompilerEnabled) {
                        // Closure compiler transforms the form `Service.ɵprov = X` into `Service$ɵprov = X`. To
                        // prevent this transformation, such assignments need to be annotated with @nocollapse.
                        // Note that tsickle is typically responsible for adding such annotations, however it
                        // doesn't yet handle synthetic fields added during other transformations.
                        ts.addSyntheticLeadingComment(property, ts.SyntaxKind.MultiLineCommentTrivia, '* @nocollapse ', 
                        /* hasTrailingNewLine */ false);
                    }
                    field.statements.map(function (stmt) { return translator_1.translateStatement(stmt, _this.importManager, translateOptions); })
                        .forEach(function (stmt) { return statements.push(stmt); });
                    members.push(property);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            // Replace the class declaration with an updated version.
            node = ts.updateClassDeclaration(node, 
            // Remove the decorator which triggered this compilation, leaving the others alone.
            maybeFilterDecorator(node.decorators, this.compilation.decoratorsFor(node)), node.modifiers, node.name, node.typeParameters, node.heritageClauses || [], 
            // Map over the class members and remove any Angular decorators from them.
            members.map(function (member) { return _this._stripAngularDecorators(member); }));
            return { node: node, after: statements };
        };
        /**
         * Return all decorators on a `Declaration` which are from @angular/core, or an empty set if none
         * are.
         */
        IvyTransformationVisitor.prototype._angularCoreDecorators = function (decl) {
            var _this = this;
            var decorators = this.reflector.getDecoratorsOfDeclaration(decl);
            if (decorators === null) {
                return NO_DECORATORS;
            }
            var coreDecorators = decorators.filter(function (dec) { return _this.isCore || isFromAngularCore(dec); })
                .map(function (dec) { return dec.node; });
            if (coreDecorators.length > 0) {
                return new Set(coreDecorators);
            }
            else {
                return NO_DECORATORS;
            }
        };
        /**
         * Given a `ts.Node`, filter the decorators array and return a version containing only non-Angular
         * decorators.
         *
         * If all decorators are removed (or none existed in the first place), this method returns
         * `undefined`.
         */
        IvyTransformationVisitor.prototype._nonCoreDecoratorsOnly = function (node) {
            // Shortcut if the node has no decorators.
            if (node.decorators === undefined) {
                return undefined;
            }
            // Build a Set of the decorators on this node from @angular/core.
            var coreDecorators = this._angularCoreDecorators(node);
            if (coreDecorators.size === node.decorators.length) {
                // If all decorators are to be removed, return `undefined`.
                return undefined;
            }
            else if (coreDecorators.size === 0) {
                // If no decorators need to be removed, return the original decorators array.
                return node.decorators;
            }
            // Filter out the core decorators.
            var filtered = node.decorators.filter(function (dec) { return !coreDecorators.has(dec); });
            // If no decorators survive, return `undefined`. This can only happen if a core decorator is
            // repeated on the node.
            if (filtered.length === 0) {
                return undefined;
            }
            // Create a new `NodeArray` with the filtered decorators that sourcemaps back to the original.
            var array = ts.createNodeArray(filtered);
            array.pos = node.decorators.pos;
            array.end = node.decorators.end;
            return array;
        };
        /**
         * Remove Angular decorators from a `ts.Node` in a shallow manner.
         *
         * This will remove decorators from class elements (getters, setters, properties, methods) as well
         * as parameters of constructors.
         */
        IvyTransformationVisitor.prototype._stripAngularDecorators = function (node) {
            var _this = this;
            if (ts.isParameter(node)) {
                // Strip decorators from parameters (probably of the constructor).
                node = ts.updateParameter(node, this._nonCoreDecoratorsOnly(node), node.modifiers, node.dotDotDotToken, node.name, node.questionToken, node.type, node.initializer);
            }
            else if (ts.isMethodDeclaration(node) && node.decorators !== undefined) {
                // Strip decorators of methods.
                node = ts.updateMethod(node, this._nonCoreDecoratorsOnly(node), node.modifiers, node.asteriskToken, node.name, node.questionToken, node.typeParameters, node.parameters, node.type, node.body);
            }
            else if (ts.isPropertyDeclaration(node) && node.decorators !== undefined) {
                // Strip decorators of properties.
                node = ts.updateProperty(node, this._nonCoreDecoratorsOnly(node), node.modifiers, node.name, node.questionToken, node.type, node.initializer);
            }
            else if (ts.isGetAccessor(node)) {
                // Strip decorators of getters.
                node = ts.updateGetAccessor(node, this._nonCoreDecoratorsOnly(node), node.modifiers, node.name, node.parameters, node.type, node.body);
            }
            else if (ts.isSetAccessor(node)) {
                // Strip decorators of setters.
                node = ts.updateSetAccessor(node, this._nonCoreDecoratorsOnly(node), node.modifiers, node.name, node.parameters, node.body);
            }
            else if (ts.isConstructorDeclaration(node)) {
                // For constructors, strip decorators of the parameters.
                var parameters = node.parameters.map(function (param) { return _this._stripAngularDecorators(param); });
                node =
                    ts.updateConstructor(node, node.decorators, node.modifiers, parameters, node.body);
            }
            return node;
        };
        return IvyTransformationVisitor;
    }(visitor_1.Visitor));
    /**
     * A transformer which operates on ts.SourceFiles and applies changes from an `IvyCompilation`.
     */
    function transformIvySourceFile(compilation, context, reflector, importRewriter, file, isCore, isClosureCompilerEnabled, recordWrappedNode) {
        var constantPool = new compiler_1.ConstantPool(isClosureCompilerEnabled);
        var importManager = new translator_1.ImportManager(importRewriter);
        // The transformation process consists of 2 steps:
        //
        //  1. Visit all classes, perform compilation and collect the results.
        //  2. Perform actual transformation of required TS nodes using compilation results from the first
        //     step.
        //
        // This is needed to have all `o.Expression`s generated before any TS transforms happen. This
        // allows `ConstantPool` to properly identify expressions that can be shared across multiple
        // components declared in the same file.
        // Step 1. Go though all classes in AST, perform compilation and collect the results.
        var compilationVisitor = new IvyCompilationVisitor(compilation, constantPool);
        visitor_1.visit(file, compilationVisitor, context);
        // Step 2. Scan through the AST again and perform transformations based on Ivy compilation
        // results obtained at Step 1.
        var transformationVisitor = new IvyTransformationVisitor(compilation, compilationVisitor.classCompilationMap, reflector, importManager, recordWrappedNode, isClosureCompilerEnabled, isCore);
        var sf = visitor_1.visit(file, transformationVisitor, context);
        // Generate the constant statements first, as they may involve adding additional imports
        // to the ImportManager.
        var downlevelTranslatedCode = getLocalizeCompileTarget(context) < ts.ScriptTarget.ES2015;
        var constants = constantPool.statements.map(function (stmt) { return translator_1.translateStatement(stmt, importManager, {
            recordWrappedNode: recordWrappedNode,
            downlevelTaggedTemplates: downlevelTranslatedCode,
            downlevelVariableDeclarations: downlevelTranslatedCode,
            annotateForClosureCompiler: isClosureCompilerEnabled,
        }); });
        // Preserve @fileoverview comments required by Closure, since the location might change as a
        // result of adding extra imports and constant pool statements.
        var fileOverviewMeta = isClosureCompilerEnabled ? getFileOverviewComment(sf.statements) : null;
        // Add new imports for this file.
        sf = utils_1.addImports(importManager, sf, constants);
        if (fileOverviewMeta !== null) {
            setFileOverviewComment(sf, fileOverviewMeta);
        }
        return sf;
    }
    /**
     * Compute the correct target output for `$localize` messages generated by Angular
     *
     * In some versions of TypeScript, the transformation of synthetic `$localize` tagged template
     * literals is broken. See https://github.com/microsoft/TypeScript/issues/38485
     *
     * Here we compute what the expected final output target of the compilation will
     * be so that we can generate ES5 compliant `$localize` calls instead of relying upon TS to do the
     * downleveling for us.
     */
    function getLocalizeCompileTarget(context) {
        var target = context.getCompilerOptions().target || ts.ScriptTarget.ES2015;
        return target !== ts.ScriptTarget.JSON ? target : ts.ScriptTarget.ES2015;
    }
    function getFileOverviewComment(statements) {
        if (statements.length > 0) {
            var host = statements[0];
            var trailing = false;
            var comments = ts.getSyntheticLeadingComments(host);
            // If @fileoverview tag is not found in source file, tsickle produces fake node with trailing
            // comment and inject it at the very beginning of the generated file. So we need to check for
            // leading as well as trailing comments.
            if (!comments || comments.length === 0) {
                trailing = true;
                comments = ts.getSyntheticTrailingComments(host);
            }
            if (comments && comments.length > 0 && CLOSURE_FILE_OVERVIEW_REGEXP.test(comments[0].text)) {
                return { comments: comments, host: host, trailing: trailing };
            }
        }
        return null;
    }
    function setFileOverviewComment(sf, fileoverview) {
        var comments = fileoverview.comments, host = fileoverview.host, trailing = fileoverview.trailing;
        // If host statement is no longer the first one, it means that extra statements were added at the
        // very beginning, so we need to relocate @fileoverview comment and cleanup the original statement
        // that hosted it.
        if (sf.statements.length > 0 && host !== sf.statements[0]) {
            if (trailing) {
                ts.setSyntheticTrailingComments(host, undefined);
            }
            else {
                ts.setSyntheticLeadingComments(host, undefined);
            }
            ts.setSyntheticLeadingComments(sf.statements[0], comments);
        }
    }
    function maybeFilterDecorator(decorators, toRemove) {
        if (decorators === undefined) {
            return undefined;
        }
        var filtered = decorators.filter(function (dec) { return toRemove.find(function (decToRemove) { return ts.getOriginalNode(dec) === decToRemove; }) === undefined; });
        if (filtered.length === 0) {
            return undefined;
        }
        return ts.createNodeArray(filtered);
    }
    function isFromAngularCore(decorator) {
        return decorator.import !== null && decorator.import.from === '@angular/core';
    }
    function createRecorderFn(defaultImportTracker) {
        return function (node) {
            var importDecl = default_1.getDefaultImportDeclaration(node);
            if (importDecl !== null) {
                defaultImportTracker.recordUsedImport(importDecl);
            }
        };
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNmb3JtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL3NyYy9uZ3RzYy90cmFuc2Zvcm0vc3JjL3RyYW5zZm9ybS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBRUgsOENBQStDO0lBQy9DLCtCQUFpQztJQUdqQywrRUFBc0U7SUFDdEUsNkRBQW1EO0lBRW5ELHlFQUFnSTtJQUNoSSw0RUFBNEU7SUFJNUUsNkVBQW1DO0lBRW5DLElBQU0sYUFBYSxHQUFHLElBQUksR0FBRyxFQUFnQixDQUFDO0lBRTlDLElBQU0sNEJBQTRCLEdBQUcsc0JBQXNCLENBQUM7SUFXNUQsU0FBZ0IsbUJBQW1CLENBQy9CLFdBQTBCLEVBQUUsU0FBeUIsRUFBRSxjQUE4QixFQUNyRixvQkFBMEMsRUFBRSxJQUFrQixFQUFFLE1BQWUsRUFDL0Usd0JBQWlDO1FBQ25DLElBQU0saUJBQWlCLEdBQUcsZ0JBQWdCLENBQUMsb0JBQW9CLENBQUMsQ0FBQztRQUNqRSxPQUFPLFVBQUMsT0FBaUM7WUFDdkMsT0FBTyxVQUFDLElBQW1CO2dCQUN6QixPQUFPLElBQUksQ0FBQyxPQUFPLENBQ2YsZ0JBQVMsQ0FBQyxPQUFPLEVBQ2pCLGNBQU0sT0FBQSxzQkFBc0IsQ0FDeEIsV0FBVyxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsY0FBYyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQzdELHdCQUF3QixFQUFFLGlCQUFpQixDQUFDLEVBRjFDLENBRTBDLENBQUMsQ0FBQztZQUN4RCxDQUFDLENBQUM7UUFDSixDQUFDLENBQUM7SUFDSixDQUFDO0lBZEQsa0RBY0M7SUFFRDs7OztPQUlHO0lBQ0g7UUFBb0MsaURBQU87UUFHekMsK0JBQW9CLFdBQTBCLEVBQVUsWUFBMEI7WUFBbEYsWUFDRSxpQkFBTyxTQUNSO1lBRm1CLGlCQUFXLEdBQVgs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LENBQUMsQ0FBQztZQUNyRCxJQUFJLFVBQVUsS0FBSyxJQUFJLEVBQUU7Z0JBQ3ZCLG9CQUFvQixDQUFDLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxDQUFDO2FBQ25EO1FBQ0gsQ0FBQyxDQUFDO0lBQ0osQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NvbnN0YW50UG9vbH0gZnJvbSAnQGFuZ3VsYXIvY29tcGlsZXInO1xuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbmltcG9ydCB7RGVmYXVsdEltcG9ydFRyYWNrZXIsIEltcG9ydFJld3JpdGVyfSBmcm9tICcuLi8uLi9pbXBvcnRzJztcbmltcG9ydCB7Z2V0RGVmYXVsdEltcG9ydERlY2xhcmF0aW9ufSBmcm9tICcuLi8uLi9pbXBvcnRzL3NyYy9kZWZhdWx0JztcbmltcG9ydCB7UGVyZlBoYXNlLCBQZXJmUmVjb3JkZXJ9IGZyb20gJy4uLy4uL3BlcmYnO1xuaW1wb3J0IHtEZWNvcmF0b3IsIFJlZmxlY3Rpb25Ib3N0fSBmcm9tICcuLi8uLi9yZWZsZWN0aW9uJztcbmltcG9ydCB7SW1wb3J0TWFuYWdlciwgUmVjb3JkV3JhcHBlZE5vZGVGbiwgdHJhbnNsYXRlRXhwcmVzc2lvbiwgdHJhbnNsYXRlU3RhdGVtZW50LCBUcmFuc2xhdG9yT3B0aW9uc30gZnJvbSAnLi4vLi4vdHJhbnNsYXRvcic7XG5pbXBvcnQge3Zpc2l0LCBWaXNpdExpc3RFbnRyeVJlc3VsdCwgVmlzaXRvcn0gZnJvbSAnLi4vLi4vdXRpbC9zcmMvdmlzaXRvcic7XG5cbmltcG9ydCB7Q29tcGlsZVJlc3VsdH0gZnJvbSAnLi9hcGknO1xuaW1wb3J0IHtUcmFpdENvbXBpbGVyfSBmcm9tICcuL2NvbXBpbGF0aW9uJztcbmltcG9ydCB7YWRkSW1wb3J0c30gZnJvbSAnLi91dGlscyc7XG5cbmNvbnN0IE5PX0RFQ09SQVRPUlMgPSBuZXcgU2V0PHRzLkRlY29yYXRvcj4oKTtcblxuY29uc3QgQ0xPU1VSRV9GSUxFX09WRVJWSUVXX1JFR0VYUCA9IC9cXHMrQGZpbGVvdmVydmlld1xccysvaTtcblxuLyoqXG4gKiBNZXRhZGF0YSB0byBzdXBwb3J0IEBmaWxlb3ZlcnZpZXcgYmxvY2tzIChDbG9zdXJlIGFubm90YXRpb25zKSBleHRyYWN0aW5nL3Jlc3RvcmluZy5cbiAqL1xuaW50ZXJmYWNlIEZpbGVPdmVydmlld01ldGEge1xuICBjb21tZW50czogdHMuU3ludGhlc2l6ZWRDb21tZW50W107XG4gIGhvc3Q6IHRzLlN0YXRlbWVudDtcbiAgdHJhaWxpbmc6IGJvb2xlYW47XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpdnlUcmFuc2Zvcm1GYWN0b3J5KFxuICAgIGNvbXBpbGF0aW9uOiBUcmFpdENvbXBpbGVyLCByZWZsZWN0b3I6IFJlZmxlY3Rpb25Ib3N0LCBpbXBvcnRSZXdyaXRlcjogSW1wb3J0UmV3cml0ZXIsXG4gICAgZGVmYXVsdEltcG9ydFRyYWNrZXI6IERlZmF1bHRJbXBvcnRUcmFja2VyLCBwZXJmOiBQZXJmUmVjb3JkZXIsIGlzQ29yZTogYm9vbGVhbixcbiAgICBpc0Nsb3N1cmVDb21waWxlckVuYWJsZWQ6IGJvb2xlYW4pOiB0cy5UcmFuc2Zvcm1lckZhY3Rvcnk8dHMuU291cmNlRmlsZT4ge1xuICBjb25zdCByZWNvcmRXcmFwcGVkTm9kZSA9IGNyZWF0ZVJlY29yZGVyRm4oZGVmYXVsdEltcG9ydFRyYWNrZXIpO1xuICByZXR1cm4gKGNvbnRleHQ6IHRzLlRyYW5zZm9ybWF0aW9uQ29udGV4dCk6IHRzLlRyYW5zZm9ybWVyPHRzLlNvdXJjZUZpbGU+ID0+IHtcbiAgICByZXR1cm4gKGZpbGU6IHRzLlNvdXJjZUZpbGUpOiB0cy5Tb3VyY2VGaWxlID0+IHtcbiAgICAgIHJldHVybiBwZXJmLmluUGhhc2UoXG4gICAgICAgICAgUGVyZlBoYXNlLkNvbXBpbGUsXG4gICAgICAgICAgKCkgPT4gdHJhbnNmb3JtSXZ5U291cmNlRmlsZShcbiAgICAgICAgICAgICAgY29tcGlsYXRpb24sIGNvbnRleHQsIHJlZmxlY3RvciwgaW1wb3J0UmV3cml0ZXIsIGZpbGUsIGlzQ29yZSxcbiAgICAgICAgICAgICAgaXNDbG9zdXJlQ29tcGlsZXJFbmFibGVkLCByZWNvcmRXcmFwcGVkTm9kZSkpO1xuICAgIH07XG4gIH07XG59XG5cbi8qKlxuICogVmlzaXRzIGFsbCBjbGFzc2VzLCBwZXJmb3JtcyBJdnkgY29tcGlsYXRpb24gd2hlcmUgQW5ndWxhciBkZWNvcmF0b3JzIGFyZSBwcmVzZW50IGFuZCBjb2xsZWN0c1xuICogcmVzdWx0IGluIGEgTWFwIHRoYXQgYXNzb2NpYXRlcyBhIHRzLkNsYXNzRGVjbGFyYXRpb24gd2l0aCBJdnkgY29tcGlsYXRpb24gcmVzdWx0cy4gVGhpcyB2aXNpdG9yXG4gKiBkb2VzIE5PVCBwZXJmb3JtIGFueSBUUyB0cmFuc2Zvcm1hdGlvbnMuXG4gKi9cbmNsYXNzIEl2eUNvbXBpbGF0aW9uVmlzaXRvciBleHRlbmRzIFZpc2l0b3Ige1xuICBwdWJsaWMgY2xhc3NDb21waWxhdGlvbk1hcCA9IG5ldyBNYXA8dHMuQ2xhc3NEZWNsYXJhdGlvbiwgQ29tcGlsZVJlc3VsdFtdPigpO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgY29tcGlsYXRpb246IFRyYWl0Q29tcGlsZXIsIHByaXZhdGUgY29uc3RhbnRQb29sOiBDb25zdGFudFBvb2wpIHtcbiAgICBzdXBlcigpO1xuICB9XG5cbiAgdmlzaXRDbGFzc0RlY2xhcmF0aW9uKG5vZGU6IHRzLkNsYXNzRGVjbGFyYXRpb24pOlxuICAgICAgVmlzaXRMaXN0RW50cnlSZXN1bHQ8dHMuU3RhdGVtZW50LCB0cy5DbGFzc0RlY2xhcmF0aW9uPiB7XG4gICAgLy8gRGV0ZXJtaW5lIGlmIHRoaXMgY2xhc3MgaGFzIGFuIEl2eSBmaWVsZCB0aGF0IG5lZWRzIHRvIGJlIGFkZGVkLCBhbmQgY29tcGlsZSB0aGUgZmllbGRcbiAgICAvLyB0byBhbiBleHByZXNzaW9uIGlmIHNvLlxuICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMuY29tcGlsYXRpb24uY29tcGlsZShub2RlLCB0aGlzLmNvbnN0YW50UG9vbCk7XG4gICAgaWYgKHJlc3VsdCAhPT0gbnVsbCkge1xuICAgICAgdGhpcy5jbGFzc0NvbXBpbGF0aW9uTWFwLnNldChub2RlLCByZXN1bHQpO1xuICAgIH1cbiAgICByZXR1cm4ge25vZGV9O1xuICB9XG59XG5cbi8qKlxuICogVmlzaXRzIGFsbCBjbGFzc2VzIGFuZCBwZXJmb3JtcyB0cmFuc2Zvcm1hdGlvbiBvZiBjb3JyZXNwb25kaW5nIFRTIG5vZGVzIGJhc2VkIG9uIHRoZSBJdnlcbiAqIGNvbXBpbGF0aW9uIHJlc3VsdHMgKHByb3ZpZGVkIGFzIGFuIGFyZ3VtZW50KS5cbiAqL1xuY2xhc3MgSXZ5VHJhbnNmb3JtYXRpb25WaXNpdG9yIGV4dGVuZHMgVmlzaXRvciB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSBjb21waWxhdGlvbjogVHJhaXRDb21waWxlcixcbiAgICAgIHByaXZhdGUgY2xhc3NDb21waWxhdGlvbk1hcDogTWFwPHRzLkNsYXNzRGVjbGFyYXRpb24sIENvbXBpbGVSZXN1bHRbXT4sXG4gICAgICBwcml2YXRlIHJlZmxlY3RvcjogUmVmbGVjdGlvbkhvc3QsIHByaXZhdGUgaW1wb3J0TWFuYWdlcjogSW1wb3J0TWFuYWdlcixcbiAgICAgIHByaXZhdGUgcmVjb3JkV3JhcHBlZE5vZGVFeHByOiBSZWNvcmRXcmFwcGVkTm9kZUZuPHRzLkV4cHJlc3Npb24+LFxuICAgICAgcHJpdmF0ZSBpc0Nsb3N1cmVDb21waWxlckVuYWJsZWQ6IGJvb2xlYW4sIHByaXZhdGUgaXNDb3JlOiBib29sZWFuKSB7XG4gICAgc3VwZXIoKTtcbiAgfVxuXG4gIHZpc2l0Q2xhc3NEZWNsYXJhdGlvbihub2RlOiB0cy5DbGFzc0RlY2xhcmF0aW9uKTpcbiAgICAgIFZpc2l0TGlzdEVudHJ5UmVzdWx0PHRzLlN0YXRlbWVudCwgdHMuQ2xhc3NEZWNsYXJhdGlvbj4ge1xuICAgIC8vIElmIHRoaXMgY2xhc3MgaXMgbm90IHJlZ2lzdGVyZWQgaW4gdGhlIG1hcCwgaXQgbWVhbnMgdGhhdCBpdCBkb2Vzbid0IGhhdmUgQW5ndWxhciBkZWNvcmF0b3JzLFxuICAgIC8vIHRodXMgbm8gZnVydGhlciBwcm9jZXNzaW5nIGlzIHJlcXVpcmVkLlxuICAgIGlmICghdGhpcy5jbGFzc0NvbXBpbGF0aW9uTWFwLmhhcyhub2RlKSkge1xuICAgICAgcmV0dXJuIHtub2RlfTtcbiAgICB9XG5cbiAgICBjb25zdCB0cmFuc2xhdGVPcHRpb25zOiBUcmFuc2xhdG9yT3B0aW9uczx0cy5FeHByZXNzaW9uPiA9IHtcbiAgICAgIHJlY29yZFdyYXBwZWROb2RlOiB0aGlzLnJlY29yZFdyYXBwZWROb2RlRXhwcixcbiAgICAgIGFubm90YXRlRm9yQ2xvc3VyZUNvbXBpbGVyOiB0aGlzLmlzQ2xvc3VyZUNvbXBpbGVyRW5hYmxlZCxcbiAgICB9O1xuXG4gICAgLy8gVGhlcmUgaXMgYXQgbGVhc3Qgb25lIGZpZWxkIHRvIGFkZC5cbiAgICBjb25zdCBzdGF0ZW1lbnRzOiB0cy5TdGF0ZW1lbnRbXSA9IFtdO1xuICAgIGNvbnN0IG1lbWJlcnMgPSBbLi4ubm9kZS5tZW1iZXJzXTtcblxuICAgIGZvciAoY29uc3QgZmllbGQgb2YgdGhpcy5jbGFzc0NvbXBpbGF0aW9uTWFwLmdldChub2RlKSEpIHtcbiAgICAgIC8vIFRyYW5zbGF0ZSB0aGUgaW5pdGlhbGl6ZXIgZm9yIHRoZSBmaWVsZCBpbnRvIFRTIG5vZGVzLlxuICAgICAgY29uc3QgZXhwck5vZGUgPSB0cmFuc2xhdGVFeHByZXNzaW9uKGZpZWxkLmluaXRpYWxpemVyLCB0aGlzLmltcG9ydE1hbmFnZXIsIHRyYW5zbGF0ZU9wdGlvbnMpO1xuXG4gICAgICAvLyBDcmVhdGUgYSBzdGF0aWMgcHJvcGVydHkgZGVjbGFyYXRpb24gZm9yIHRoZSBuZXcgZmllbGQuXG4gICAgICBjb25zdCBwcm9wZXJ0eSA9IHRzLmNyZWF0ZVByb3BlcnR5KFxuICAgICAgICAgIHVuZGVmaW5lZCwgW3RzLmNyZWF0ZVRva2VuKHRzLlN5bnRheEtpbmQuU3RhdGljS2V5d29yZCldLCBmaWVsZC5uYW1lLCB1bmRlZmluZWQsXG4gICAgICAgICAgdW5kZWZpbmVkLCBleHByTm9kZSk7XG5cbiAgICAgIGlmICh0aGlzLmlzQ2xvc3VyZUNvbXBpbGVyRW5hYmxlZCkge1xuICAgICAgICAvLyBDbG9zdXJlIGNvbXBpbGVyIHRyYW5zZm9ybXMgdGhlIGZvcm0gYFNlcnZpY2UuybVwcm92ID0gWGAgaW50byBgU2VydmljZSTJtXByb3YgPSBYYC4gVG9cbiAgICAgICAgLy8gcHJldmVudCB0aGlzIHRyYW5zZm9ybWF0aW9uLCBzdWNoIGFzc2lnbm1lbnRzIG5lZWQgdG8gYmUgYW5ub3RhdGVkIHdpdGggQG5vY29sbGFwc2UuXG4gICAgICAgIC8vIE5vdGUgdGhhdCB0c2lja2xlIGlzIHR5cGljYWxseSByZXNwb25zaWJsZSBmb3IgYWRkaW5nIHN1Y2ggYW5ub3RhdGlvbnMsIGhvd2V2ZXIgaXRcbiAgICAgICAgLy8gZG9lc24ndCB5ZXQgaGFuZGxlIHN5bnRoZXRpYyBmaWVsZHMgYWRkZWQgZHVyaW5nIG90aGVyIHRyYW5zZm9ybWF0aW9ucy5cbiAgICAgICAgdHMuYWRkU3ludGhldGljTGVhZGluZ0NvbW1lbnQoXG4gICAgICAgICAgICBwcm9wZXJ0eSwgdHMuU3ludGF4S2luZC5NdWx0aUxpbmVDb21tZW50VHJpdmlhLCAnKiBAbm9jb2xsYXBzZSAnLFxuICAgICAgICAgICAgLyogaGFzVHJhaWxpbmdOZXdMaW5lICovIGZhbHNlKTtcbiAgICAgIH1cblxuICAgICAgZmllbGQuc3RhdGVtZW50cy5tYXAoc3RtdCA9PiB0cmFuc2xhdGVTdGF0ZW1lbnQoc3RtdCwgdGhpcy5pbXBvcnRNYW5hZ2VyLCB0cmFuc2xhdGVPcHRpb25zKSlcbiAgICAgICAgICAuZm9yRWFjaChzdG10ID0+IHN0YXRlbWVudHMucHVzaChzdG10KSk7XG5cbiAgICAgIG1lbWJlcnMucHVzaChwcm9wZXJ0eSk7XG4gICAgfVxuXG4gICAgLy8gUmVwbGFjZSB0aGUgY2xhc3MgZGVjbGFyYXRpb24gd2l0aCBhbiB1cGRhdGVkIHZlcnNpb24uXG4gICAgbm9kZSA9IHRzLnVwZGF0ZUNsYXNzRGVjbGFyYXRpb24oXG4gICAgICAgIG5vZGUsXG4gICAgICAgIC8vIFJlbW92ZSB0aGUgZGVjb3JhdG9yIHdoaWNoIHRyaWdnZXJlZCB0aGlzIGNvbXBpbGF0aW9uLCBsZWF2aW5nIHRoZSBvdGhlcnMgYWxvbmUuXG4gICAgICAgIG1heWJlRmlsdGVyRGVjb3JhdG9yKG5vZGUuZGVjb3JhdG9ycywgdGhpcy5jb21waWxhdGlvbi5kZWNvcmF0b3JzRm9yKG5vZGUpKSwgbm9kZS5tb2RpZmllcnMsXG4gICAgICAgIG5vZGUubmFtZSwgbm9kZS50eXBlUGFyYW1ldGVycywgbm9kZS5oZXJpdGFnZUNsYXVzZXMgfHwgW10sXG4gICAgICAgIC8vIE1hcCBvdmVyIHRoZSBjbGFzcyBtZW1iZXJzIGFuZCByZW1vdmUgYW55IEFuZ3VsYXIgZGVjb3JhdG9ycyBmcm9tIHRoZW0uXG4gICAgICAgIG1lbWJlcnMubWFwKG1lbWJlciA9PiB0aGlzLl9zdHJpcEFuZ3VsYXJEZWNvcmF0b3JzKG1lbWJlcikpKTtcbiAgICByZXR1cm4ge25vZGUsIGFmdGVyOiBzdGF0ZW1lbnRzfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm4gYWxsIGRlY29yYXRvcnMgb24gYSBgRGVjbGFyYXRpb25gIHdoaWNoIGFyZSBmcm9tIEBhbmd1bGFyL2NvcmUsIG9yIGFuIGVtcHR5IHNldCBpZiBub25lXG4gICAqIGFyZS5cbiAgICovXG4gIHByaXZhdGUgX2FuZ3VsYXJDb3JlRGVjb3JhdG9ycyhkZWNsOiB0cy5EZWNsYXJhdGlvbik6IFNldDx0cy5EZWNvcmF0b3I+IHtcbiAgICBjb25zdCBkZWNvcmF0b3JzID0gdGhpcy5yZWZsZWN0b3IuZ2V0RGVjb3JhdG9yc09mRGVjbGFyYXRpb24oZGVjbCk7XG4gICAgaWYgKGRlY29yYXRvcnMgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiBOT19ERUNPUkFUT1JTO1xuICAgIH1cbiAgICBjb25zdCBjb3JlRGVjb3JhdG9ycyA9IGRlY29yYXRvcnMuZmlsdGVyKGRlYyA9PiB0aGlzLmlzQ29yZSB8fCBpc0Zyb21Bbmd1bGFyQ29yZShkZWMpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5tYXAoZGVjID0+IGRlYy5ub2RlIGFzIHRzLkRlY29yYXRvcik7XG4gICAgaWYgKGNvcmVEZWNvcmF0b3JzLmxlbmd0aCA+IDApIHtcbiAgICAgIHJldHVybiBuZXcgU2V0PHRzLkRlY29yYXRvcj4oY29yZURlY29yYXRvcnMpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gTk9fREVDT1JBVE9SUztcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2l2ZW4gYSBgdHMuTm9kZWAsIGZpbHRlciB0aGUgZGVjb3JhdG9ycyBhcnJheSBhbmQgcmV0dXJuIGEgdmVyc2lvbiBjb250YWluaW5nIG9ubHkgbm9uLUFuZ3VsYXJcbiAgICogZGVjb3JhdG9ycy5cbiAgICpcbiAgICogSWYgYWxsIGRlY29yYXRvcnMgYXJlIHJlbW92ZWQgKG9yIG5vbmUgZXhpc3RlZCBpbiB0aGUgZmlyc3QgcGxhY2UpLCB0aGlzIG1ldGhvZCByZXR1cm5zXG4gICAqIGB1bmRlZmluZWRgLlxuICAgKi9cbiAgcHJpdmF0ZSBfbm9uQ29yZURlY29yYXRvcnNPbmx5KG5vZGU6IHRzLkRlY2xhcmF0aW9uKTogdHMuTm9kZUFycmF5PHRzLkRlY29yYXRvcj58dW5kZWZpbmVkIHtcbiAgICAvLyBTaG9ydGN1dCBpZiB0aGUgbm9kZSBoYXMgbm8gZGVjb3JhdG9ycy5cbiAgICBpZiAobm9kZS5kZWNvcmF0b3JzID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIC8vIEJ1aWxkIGEgU2V0IG9mIHRoZSBkZWNvcmF0b3JzIG9uIHRoaXMgbm9kZSBmcm9tIEBhbmd1bGFyL2NvcmUuXG4gICAgY29uc3QgY29yZURlY29yYXRvcnMgPSB0aGlzLl9hbmd1bGFyQ29yZURlY29yYXRvcnMobm9kZSk7XG5cbiAgICBpZiAoY29yZURlY29yYXRvcnMuc2l6ZSA9PT0gbm9kZS5kZWNvcmF0b3JzLmxlbmd0aCkge1xuICAgICAgLy8gSWYgYWxsIGRlY29yYXRvcnMgYXJlIHRvIGJlIHJlbW92ZWQsIHJldHVybiBgdW5kZWZpbmVkYC5cbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfSBlbHNlIGlmIChjb3JlRGVjb3JhdG9ycy5zaXplID09PSAwKSB7XG4gICAgICAvLyBJZiBubyBkZWNvcmF0b3JzIG5lZWQgdG8gYmUgcmVtb3ZlZCwgcmV0dXJuIHRoZSBvcmlnaW5hbCBkZWNvcmF0b3JzIGFycmF5LlxuICAgICAgcmV0dXJuIG5vZGUuZGVjb3JhdG9ycztcbiAgICB9XG5cbiAgICAvLyBGaWx0ZXIgb3V0IHRoZSBjb3JlIGRlY29yYXRvcnMuXG4gICAgY29uc3QgZmlsdGVyZWQgPSBub2RlLmRlY29yYXRvcnMuZmlsdGVyKGRlYyA9PiAhY29yZURlY29yYXRvcnMuaGFzKGRlYykpO1xuXG4gICAgLy8gSWYgbm8gZGVjb3JhdG9ycyBzdXJ2aXZlLCByZXR1cm4gYHVuZGVmaW5lZGAuIFRoaXMgY2FuIG9ubHkgaGFwcGVuIGlmIGEgY29yZSBkZWNvcmF0b3IgaXNcbiAgICAvLyByZXBlYXRlZCBvbiB0aGUgbm9kZS5cbiAgICBpZiAoZmlsdGVyZWQubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIC8vIENyZWF0ZSBhIG5ldyBgTm9kZUFycmF5YCB3aXRoIHRoZSBmaWx0ZXJlZCBkZWNvcmF0b3JzIHRoYXQgc291cmNlbWFwcyBiYWNrIHRvIHRoZSBvcmlnaW5hbC5cbiAgICBjb25zdCBhcnJheSA9IHRzLmNyZWF0ZU5vZGVBcnJheShmaWx0ZXJlZCk7XG4gICAgKGFycmF5LnBvcyBhcyBudW1iZXIpID0gbm9kZS5kZWNvcmF0b3JzLnBvcztcbiAgICAoYXJyYXkuZW5kIGFzIG51bWJlcikgPSBub2RlLmRlY29yYXRvcnMuZW5kO1xuICAgIHJldHVybiBhcnJheTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgQW5ndWxhciBkZWNvcmF0b3JzIGZyb20gYSBgdHMuTm9kZWAgaW4gYSBzaGFsbG93IG1hbm5lci5cbiAgICpcbiAgICogVGhpcyB3aWxsIHJlbW92ZSBkZWNvcmF0b3JzIGZyb20gY2xhc3MgZWxlbWVudHMgKGdldHRlcnMsIHNldHRlcnMsIHByb3BlcnRpZXMsIG1ldGhvZHMpIGFzIHdlbGxcbiAgICogYXMgcGFyYW1ldGVycyBvZiBjb25zdHJ1Y3RvcnMuXG4gICAqL1xuICBwcml2YXRlIF9zdHJpcEFuZ3VsYXJEZWNvcmF0b3JzPFQgZXh0ZW5kcyB0cy5Ob2RlPihub2RlOiBUKTogVCB7XG4gICAgaWYgKHRzLmlzUGFyYW1ldGVyKG5vZGUpKSB7XG4gICAgICAvLyBTdHJpcCBkZWNvcmF0b3JzIGZyb20gcGFyYW1ldGVycyAocHJvYmFibHkgb2YgdGhlIGNvbnN0cnVjdG9yKS5cbiAgICAgIG5vZGUgPSB0cy51cGRhdGVQYXJhbWV0ZXIoXG4gICAgICAgICAgICAgICAgIG5vZGUsIHRoaXMuX25vbkNvcmVEZWNvcmF0b3JzT25seShub2RlKSwgbm9kZS5tb2RpZmllcnMsIG5vZGUuZG90RG90RG90VG9rZW4sXG4gICAgICAgICAgICAgICAgIG5vZGUubmFtZSwgbm9kZS5xdWVzdGlvblRva2VuLCBub2RlLnR5cGUsIG5vZGUuaW5pdGlhbGl6ZXIpIGFzIFQgJlxuICAgICAgICAgIHRzLlBhcmFtZXRlckRlY2xhcmF0aW9uO1xuICAgIH0gZWxzZSBpZiAodHMuaXNNZXRob2REZWNsYXJhdGlvbihub2RlKSAmJiBub2RlLmRlY29yYXRvcnMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgLy8gU3RyaXAgZGVjb3JhdG9ycyBvZiBtZXRob2RzLlxuICAgICAgbm9kZSA9IHRzLnVwZGF0ZU1ldGhvZChcbiAgICAgICAgICAgICAgICAgbm9kZSwgdGhpcy5fbm9uQ29yZURlY29yYXRvcnNPbmx5KG5vZGUpLCBub2RlLm1vZGlmaWVycywgbm9kZS5hc3Rlcmlza1Rva2VuLFxuICAgICAgICAgICAgICAgICBub2RlLm5hbWUsIG5vZGUucXVlc3Rpb25Ub2tlbiwgbm9kZS50eXBlUGFyYW1ldGVycywgbm9kZS5wYXJhbWV0ZXJzLCBub2RlLnR5cGUsXG4gICAgICAgICAgICAgICAgIG5vZGUuYm9keSkgYXMgVCAmXG4gICAgICAgICAgdHMuTWV0aG9kRGVjbGFyYXRpb247XG4gICAgfSBlbHNlIGlmICh0cy5pc1Byb3BlcnR5RGVjbGFyYXRpb24obm9kZSkgJiYgbm9kZS5kZWNvcmF0b3JzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIC8vIFN0cmlwIGRlY29yYXRvcnMgb2YgcHJvcGVydGllcy5cbiAgICAgIG5vZGUgPSB0cy51cGRhdGVQcm9wZXJ0eShcbiAgICAgICAgICAgICAgICAgbm9kZSwgdGhpcy5fbm9uQ29yZURlY29yYXRvcnNPbmx5KG5vZGUpLCBub2RlLm1vZGlmaWVycywgbm9kZS5uYW1lLFxuICAgICAgICAgICAgICAgICBub2RlLnF1ZXN0aW9uVG9rZW4sIG5vZGUudHlwZSwgbm9kZS5pbml0aWFsaXplcikgYXMgVCAmXG4gICAgICAgICAgdHMuUHJvcGVydHlEZWNsYXJhdGlvbjtcbiAgICB9IGVsc2UgaWYgKHRzLmlzR2V0QWNjZXNzb3Iobm9kZSkpIHtcbiAgICAgIC8vIFN0cmlwIGRlY29yYXRvcnMgb2YgZ2V0dGVycy5cbiAgICAgIG5vZGUgPSB0cy51cGRhdGVHZXRBY2Nlc3NvcihcbiAgICAgICAgICAgICAgICAgbm9kZSwgdGhpcy5fbm9uQ29yZURlY29yYXRvcnNPbmx5KG5vZGUpLCBub2RlLm1vZGlmaWVycywgbm9kZS5uYW1lLFxuICAgICAgICAgICAgICAgICBub2RlLnBhcmFtZXRlcnMsIG5vZGUudHlwZSwgbm9kZS5ib2R5KSBhcyBUICZcbiAgICAgICAgICB0cy5HZXRBY2Nlc3NvckRlY2xhcmF0aW9uO1xuICAgIH0gZWxzZSBpZiAodHMuaXNTZXRBY2Nlc3Nvcihub2RlKSkge1xuICAgICAgLy8gU3RyaXAgZGVjb3JhdG9ycyBvZiBzZXR0ZXJzLlxuICAgICAgbm9kZSA9IHRzLnVwZGF0ZVNldEFjY2Vzc29yKFxuICAgICAgICAgICAgICAgICBub2RlLCB0aGlzLl9ub25Db3JlRGVjb3JhdG9yc09ubHkobm9kZSksIG5vZGUubW9kaWZpZXJzLCBub2RlLm5hbWUsXG4gICAgICAgICAgICAgICAgIG5vZGUucGFyYW1ldGVycywgbm9kZS5ib2R5KSBhcyBUICZcbiAgICAgICAgICB0cy5TZXRBY2Nlc3NvckRlY2xhcmF0aW9uO1xuICAgIH0gZWxzZSBpZiAodHMuaXNDb25zdHJ1Y3RvckRlY2xhcmF0aW9uKG5vZGUpKSB7XG4gICAgICAvLyBGb3IgY29uc3RydWN0b3JzLCBzdHJpcCBkZWNvcmF0b3JzIG9mIHRoZSBwYXJhbWV0ZXJzLlxuICAgICAgY29uc3QgcGFyYW1ldGVycyA9IG5vZGUucGFyYW1ldGVycy5tYXAocGFyYW0gPT4gdGhpcy5fc3RyaXBBbmd1bGFyRGVjb3JhdG9ycyhwYXJhbSkpO1xuICAgICAgbm9kZSA9XG4gICAgICAgICAgdHMudXBkYXRlQ29uc3RydWN0b3Iobm9kZSwgbm9kZS5kZWNvcmF0b3JzLCBub2RlLm1vZGlmaWVycywgcGFyYW1ldGVycywgbm9kZS5ib2R5KSBhcyBUICZcbiAgICAgICAgICB0cy5Db25zdHJ1Y3RvckRlY2xhcmF0aW9uO1xuICAgIH1cbiAgICByZXR1cm4gbm9kZTtcbiAgfVxufVxuXG4vKipcbiAqIEEgdHJhbnNmb3JtZXIgd2hpY2ggb3BlcmF0ZXMgb24gdHMuU291cmNlRmlsZXMgYW5kIGFwcGxpZXMgY2hhbmdlcyBmcm9tIGFuIGBJdnlDb21waWxhdGlvbmAuXG4gKi9cbmZ1bmN0aW9uIHRyYW5zZm9ybUl2eVNvdXJjZUZpbGUoXG4gICAgY29tcGlsYXRpb246IFRyYWl0Q29tcGlsZXIsIGNvbnRleHQ6IHRzLlRyYW5zZm9ybWF0aW9uQ29udGV4dCwgcmVmbGVjdG9yOiBSZWZsZWN0aW9uSG9zdCxcbiAgICBpbXBvcnRSZXdyaXRlcjogSW1wb3J0UmV3cml0ZXIsIGZpbGU6IHRzLlNvdXJjZUZpbGUsIGlzQ29yZTogYm9vbGVhbixcbiAgICBpc0Nsb3N1cmVDb21waWxlckVuYWJsZWQ6IGJvb2xlYW4sXG4gICAgcmVjb3JkV3JhcHBlZE5vZGU6IFJlY29yZFdyYXBwZWROb2RlRm48dHMuRXhwcmVzc2lvbj4pOiB0cy5Tb3VyY2VGaWxlIHtcbiAgY29uc3QgY29uc3RhbnRQb29sID0gbmV3IENvbnN0YW50UG9vbChpc0Nsb3N1cmVDb21waWxlckVuYWJsZWQpO1xuICBjb25zdCBpbXBvcnRNYW5hZ2VyID0gbmV3IEltcG9ydE1hbmFnZXIoaW1wb3J0UmV3cml0ZXIpO1xuXG4gIC8vIFRoZSB0cmFuc2Zvcm1hdGlvbiBwcm9jZXNzIGNvbnNpc3RzIG9mIDIgc3RlcHM6XG4gIC8vXG4gIC8vICAxLiBWaXNpdCBhbGwgY2xhc3NlcywgcGVyZm9ybSBjb21waWxhdGlvbiBhbmQgY29sbGVjdCB0aGUgcmVzdWx0cy5cbiAgLy8gIDIuIFBlcmZvcm0gYWN0dWFsIHRyYW5zZm9ybWF0aW9uIG9mIHJlcXVpcmVkIFRTIG5vZGVzIHVzaW5nIGNvbXBpbGF0aW9uIHJlc3VsdHMgZnJvbSB0aGUgZmlyc3RcbiAgLy8gICAgIHN0ZXAuXG4gIC8vXG4gIC8vIFRoaXMgaXMgbmVlZGVkIHRvIGhhdmUgYWxsIGBvLkV4cHJlc3Npb25gcyBnZW5lcmF0ZWQgYmVmb3JlIGFueSBUUyB0cmFuc2Zvcm1zIGhhcHBlbi4gVGhpc1xuICAvLyBhbGxvd3MgYENvbnN0YW50UG9vbGAgdG8gcHJvcGVybHkgaWRlbnRpZnkgZXhwcmVzc2lvbnMgdGhhdCBjYW4gYmUgc2hhcmVkIGFjcm9zcyBtdWx0aXBsZVxuICAvLyBjb21wb25lbnRzIGRlY2xhcmVkIGluIHRoZSBzYW1lIGZpbGUuXG5cbiAgLy8gU3RlcCAxLiBHbyB0aG91Z2ggYWxsIGNsYXNzZXMgaW4gQVNULCBwZXJmb3JtIGNvbXBpbGF0aW9uIGFuZCBjb2xsZWN0IHRoZSByZXN1bHRzLlxuICBjb25zdCBjb21waWxhdGlvblZpc2l0b3IgPSBuZXcgSXZ5Q29tcGlsYXRpb25WaXNpdG9yKGNvbXBpbGF0aW9uLCBjb25zdGFudFBvb2wpO1xuICB2aXNpdChmaWxlLCBjb21waWxhdGlvblZpc2l0b3IsIGNvbnRleHQpO1xuXG4gIC8vIFN0ZXAgMi4gU2NhbiB0aHJvdWdoIHRoZSBBU1QgYWdhaW4gYW5kIHBlcmZvcm0gdHJhbnNmb3JtYXRpb25zIGJhc2VkIG9uIEl2eSBjb21waWxhdGlvblxuICAvLyByZXN1bHRzIG9idGFpbmVkIGF0IFN0ZXAgMS5cbiAgY29uc3QgdHJhbnNmb3JtYXRpb25WaXNpdG9yID0gbmV3IEl2eVRyYW5zZm9ybWF0aW9uVmlzaXRvcihcbiAgICAgIGNvbXBpbGF0aW9uLCBjb21waWxhdGlvblZpc2l0b3IuY2xhc3NDb21waWxhdGlvbk1hcCwgcmVmbGVjdG9yLCBpbXBvcnRNYW5hZ2VyLFxuICAgICAgcmVjb3JkV3JhcHBlZE5vZGUsIGlzQ2xvc3VyZUNvbXBpbGVyRW5hYmxlZCwgaXNDb3JlKTtcbiAgbGV0IHNmID0gdmlzaXQoZmlsZSwgdHJhbnNmb3JtYXRpb25WaXNpdG9yLCBjb250ZXh0KTtcblxuICAvLyBHZW5lcmF0ZSB0aGUgY29uc3RhbnQgc3RhdGVtZW50cyBmaXJzdCwgYXMgdGhleSBtYXkgaW52b2x2ZSBhZGRpbmcgYWRkaXRpb25hbCBpbXBvcnRzXG4gIC8vIHRvIHRoZSBJbXBvcnRNYW5hZ2VyLlxuICBjb25zdCBkb3dubGV2ZWxUcmFuc2xhdGVkQ29kZSA9IGdldExvY2FsaXplQ29tcGlsZVRhcmdldChjb250ZXh0KSA8IHRzLlNjcmlwdFRhcmdldC5FUzIwMTU7XG4gIGNvbnN0IGNvbnN0YW50cyA9XG4gICAgICBjb25zdGFudFBvb2wuc3RhdGVtZW50cy5tYXAoc3RtdCA9PiB0cmFuc2xhdGVTdGF0ZW1lbnQoc3RtdCwgaW1wb3J0TWFuYWdlciwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVjb3JkV3JhcHBlZE5vZGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb3dubGV2ZWxUYWdnZWRUZW1wbGF0ZXM6IGRvd25sZXZlbFRyYW5zbGF0ZWRDb2RlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG93bmxldmVsVmFyaWFibGVEZWNsYXJhdGlvbnM6IGRvd25sZXZlbFRyYW5zbGF0ZWRDb2RlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5ub3RhdGVGb3JDbG9zdXJlQ29tcGlsZXI6IGlzQ2xvc3VyZUNvbXBpbGVyRW5hYmxlZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSk7XG5cbiAgLy8gUHJlc2VydmUgQGZpbGVvdmVydmlldyBjb21tZW50cyByZXF1aXJlZCBieSBDbG9zdXJlLCBzaW5jZSB0aGUgbG9jYXRpb24gbWlnaHQgY2hhbmdlIGFzIGFcbiAgLy8gcmVzdWx0IG9mIGFkZGluZyBleHRyYSBpbXBvcnRzIGFuZCBjb25zdGFudCBwb29sIHN0YXRlbWVudHMuXG4gIGNvbnN0IGZpbGVPdmVydmlld01ldGEgPSBpc0Nsb3N1cmVDb21waWxlckVuYWJsZWQgPyBnZXRGaWxlT3ZlcnZpZXdDb21tZW50KHNmLnN0YXRlbWVudHMpIDogbnVsbDtcblxuICAvLyBBZGQgbmV3IGltcG9ydHMgZm9yIHRoaXMgZmlsZS5cbiAgc2YgPSBhZGRJbXBvcnRzKGltcG9ydE1hbmFnZXIsIHNmLCBjb25zdGFudHMpO1xuXG4gIGlmIChmaWxlT3ZlcnZpZXdNZXRhICE9PSBudWxsKSB7XG4gICAgc2V0RmlsZU92ZXJ2aWV3Q29tbWVudChzZiwgZmlsZU92ZXJ2aWV3TWV0YSk7XG4gIH1cblxuICByZXR1cm4gc2Y7XG59XG5cbi8qKlxuICogQ29tcHV0ZSB0aGUgY29ycmVjdCB0YXJnZXQgb3V0cHV0IGZvciBgJGxvY2FsaXplYCBtZXNzYWdlcyBnZW5lcmF0ZWQgYnkgQW5ndWxhclxuICpcbiAqIEluIHNvbWUgdmVyc2lvbnMgb2YgVHlwZVNjcmlwdCwgdGhlIHRyYW5zZm9ybWF0aW9uIG9mIHN5bnRoZXRpYyBgJGxvY2FsaXplYCB0YWdnZWQgdGVtcGxhdGVcbiAqIGxpdGVyYWxzIGlzIGJyb2tlbi4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9taWNyb3NvZnQvVHlwZVNjcmlwdC9pc3N1ZXMvMzg0ODVcbiAqXG4gKiBIZXJlIHdlIGNvbXB1dGUgd2hhdCB0aGUgZXhwZWN0ZWQgZmluYWwgb3V0cHV0IHRhcmdldCBvZiB0aGUgY29tcGlsYXRpb24gd2lsbFxuICogYmUgc28gdGhhdCB3ZSBjYW4gZ2VuZXJhdGUgRVM1IGNvbXBsaWFudCBgJGxvY2FsaXplYCBjYWxscyBpbnN0ZWFkIG9mIHJlbHlpbmcgdXBvbiBUUyB0byBkbyB0aGVcbiAqIGRvd25sZXZlbGluZyBmb3IgdXMuXG4gKi9cbmZ1bmN0aW9uIGdldExvY2FsaXplQ29tcGlsZVRhcmdldChjb250ZXh0OiB0cy5UcmFuc2Zvcm1hdGlvbkNvbnRleHQpOlxuICAgIEV4Y2x1ZGU8dHMuU2NyaXB0VGFyZ2V0LCB0cy5TY3JpcHRUYXJnZXQuSlNPTj4ge1xuICBjb25zdCB0YXJnZXQgPSBjb250ZXh0LmdldENvbXBpbGVyT3B0aW9ucygpLnRhcmdldCB8fCB0cy5TY3JpcHRUYXJnZXQuRVMyMDE1O1xuICByZXR1cm4gdGFyZ2V0ICE9PSB0cy5TY3JpcHRUYXJnZXQuSlNPTiA/IHRhcmdldCA6IHRzLlNjcmlwdFRhcmdldC5FUzIwMTU7XG59XG5cbmZ1bmN0aW9uIGdldEZpbGVPdmVydmlld0NvbW1lbnQoc3RhdGVtZW50czogdHMuTm9kZUFycmF5PHRzLlN0YXRlbWVudD4pOiBGaWxlT3ZlcnZpZXdNZXRhfG51bGwge1xuICBpZiAoc3RhdGVtZW50cy5sZW5ndGggPiAwKSB7XG4gICAgY29uc3QgaG9zdCA9IHN0YXRlbWVudHNbMF07XG4gICAgbGV0IHRyYWlsaW5nID0gZmFsc2U7XG4gICAgbGV0IGNvbW1lbnRzID0gdHMuZ2V0U3ludGhldGljTGVhZGluZ0NvbW1lbnRzKGhvc3QpO1xuICAgIC8vIElmIEBmaWxlb3ZlcnZpZXcgdGFnIGlzIG5vdCBmb3VuZCBpbiBzb3VyY2UgZmlsZSwgdHNpY2tsZSBwcm9kdWNlcyBmYWtlIG5vZGUgd2l0aCB0cmFpbGluZ1xuICAgIC8vIGNvbW1lbnQgYW5kIGluamVjdCBpdCBhdCB0aGUgdmVyeSBiZWdpbm5pbmcgb2YgdGhlIGdlbmVyYXRlZCBmaWxlLiBTbyB3ZSBuZWVkIHRvIGNoZWNrIGZvclxuICAgIC8vIGxlYWRpbmcgYXMgd2VsbCBhcyB0cmFpbGluZyBjb21tZW50cy5cbiAgICBpZiAoIWNvbW1lbnRzIHx8IGNvbW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgdHJhaWxpbmcgPSB0cnVlO1xuICAgICAgY29tbWVudHMgPSB0cy5nZXRTeW50aGV0aWNUcmFpbGluZ0NvbW1lbnRzKGhvc3QpO1xuICAgIH1cbiAgICBpZiAoY29tbWVudHMgJiYgY29tbWVudHMubGVuZ3RoID4gMCAmJiBDTE9TVVJFX0ZJTEVfT1ZFUlZJRVdfUkVHRVhQLnRlc3QoY29tbWVudHNbMF0udGV4dCkpIHtcbiAgICAgIHJldHVybiB7Y29tbWVudHMsIGhvc3QsIHRyYWlsaW5nfTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59XG5cbmZ1bmN0aW9uIHNldEZpbGVPdmVydmlld0NvbW1lbnQoc2Y6IHRzLlNvdXJjZUZpbGUsIGZpbGVvdmVydmlldzogRmlsZU92ZXJ2aWV3TWV0YSk6IHZvaWQge1xuICBjb25zdCB7Y29tbWVudHMsIGhvc3QsIHRyYWlsaW5nfSA9IGZpbGVvdmVydmlldztcbiAgLy8gSWYgaG9zdCBzdGF0ZW1lbnQgaXMgbm8gbG9uZ2VyIHRoZSBmaXJzdCBvbmUsIGl0IG1lYW5zIHRoYXQgZXh0cmEgc3RhdGVtZW50cyB3ZXJlIGFkZGVkIGF0IHRoZVxuICAvLyB2ZXJ5IGJlZ2lubmluZywgc28gd2UgbmVlZCB0byByZWxvY2F0ZSBAZmlsZW92ZXJ2aWV3IGNvbW1lbnQgYW5kIGNsZWFudXAgdGhlIG9yaWdpbmFsIHN0YXRlbWVudFxuICAvLyB0aGF0IGhvc3RlZCBpdC5cbiAgaWYgKHNmLnN0YXRlbWVudHMubGVuZ3RoID4gMCAmJiBob3N0ICE9PSBzZi5zdGF0ZW1lbnRzWzBdKSB7XG4gICAgaWYgKHRyYWlsaW5nKSB7XG4gICAgICB0cy5zZXRTeW50aGV0aWNUcmFpbGluZ0NvbW1lbnRzKGhvc3QsIHVuZGVmaW5lZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRzLnNldFN5bnRoZXRpY0xlYWRpbmdDb21tZW50cyhob3N0LCB1bmRlZmluZWQpO1xuICAgIH1cbiAgICB0cy5zZXRTeW50aGV0aWNMZWFkaW5nQ29tbWVudHMoc2Yuc3RhdGVtZW50c1swXSwgY29tbWVudHMpO1xuICB9XG59XG5cbmZ1bmN0aW9uIG1heWJlRmlsdGVyRGVjb3JhdG9yKFxuICAgIGRlY29yYXRvcnM6IHRzLk5vZGVBcnJheTx0cy5EZWNvcmF0b3I+fHVuZGVmaW5lZCxcbiAgICB0b1JlbW92ZTogdHMuRGVjb3JhdG9yW10pOiB0cy5Ob2RlQXJyYXk8dHMuRGVjb3JhdG9yPnx1bmRlZmluZWQge1xuICBpZiAoZGVjb3JhdG9ycyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuICBjb25zdCBmaWx0ZXJlZCA9IGRlY29yYXRvcnMuZmlsdGVyKFxuICAgICAgZGVjID0+IHRvUmVtb3ZlLmZpbmQoZGVjVG9SZW1vdmUgPT4gdHMuZ2V0T3JpZ2luYWxOb2RlKGRlYykgPT09IGRlY1RvUmVtb3ZlKSA9PT0gdW5kZWZpbmVkKTtcbiAgaWYgKGZpbHRlcmVkLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cbiAgcmV0dXJuIHRzLmNyZWF0ZU5vZGVBcnJheShmaWx0ZXJlZCk7XG59XG5cbmZ1bmN0aW9uIGlzRnJvbUFuZ3VsYXJDb3JlKGRlY29yYXRvcjogRGVjb3JhdG9yKTogYm9vbGVhbiB7XG4gIHJldHVybiBkZWNvcmF0b3IuaW1wb3J0ICE9PSBudWxsICYmIGRlY29yYXRvci5pbXBvcnQuZnJvbSA9PT0gJ0Bhbmd1bGFyL2NvcmUnO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVSZWNvcmRlckZuKGRlZmF1bHRJbXBvcnRUcmFja2VyOiBEZWZhdWx0SW1wb3J0VHJhY2tlcik6XG4gICAgUmVjb3JkV3JhcHBlZE5vZGVGbjx0cy5FeHByZXNzaW9uPiB7XG4gIHJldHVybiBub2RlID0+IHtcbiAgICBjb25zdCBpbXBvcnREZWNsID0gZ2V0RGVmYXVsdEltcG9ydERlY2xhcmF0aW9uKG5vZGUpO1xuICAgIGlmIChpbXBvcnREZWNsICE9PSBudWxsKSB7XG4gICAgICBkZWZhdWx0SW1wb3J0VHJhY2tlci5yZWNvcmRVc2VkSW1wb3J0KGltcG9ydERlY2wpO1xuICAgIH1cbiAgfTtcbn1cbiJdfQ==