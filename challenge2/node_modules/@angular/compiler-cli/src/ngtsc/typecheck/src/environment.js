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
        define("@angular/compiler-cli/src/ngtsc/typecheck/src/environment", ["require", "exports", "tslib", "@angular/compiler", "typescript", "@angular/compiler-cli/src/ngtsc/imports", "@angular/compiler-cli/src/ngtsc/translator", "@angular/compiler-cli/src/ngtsc/typecheck/src/ts_util", "@angular/compiler-cli/src/ngtsc/typecheck/src/type_constructor", "@angular/compiler-cli/src/ngtsc/typecheck/src/type_parameter_emitter"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Environment = void 0;
    var tslib_1 = require("tslib");
    var compiler_1 = require("@angular/compiler");
    var ts = require("typescript");
    var imports_1 = require("@angular/compiler-cli/src/ngtsc/imports");
    var translator_1 = require("@angular/compiler-cli/src/ngtsc/translator");
    var ts_util_1 = require("@angular/compiler-cli/src/ngtsc/typecheck/src/ts_util");
    var type_constructor_1 = require("@angular/compiler-cli/src/ngtsc/typecheck/src/type_constructor");
    var type_parameter_emitter_1 = require("@angular/compiler-cli/src/ngtsc/typecheck/src/type_parameter_emitter");
    /**
     * A context which hosts one or more Type Check Blocks (TCBs).
     *
     * An `Environment` supports the generation of TCBs by tracking necessary imports, declarations of
     * type constructors, and other statements beyond the type-checking code within the TCB itself.
     * Through method calls on `Environment`, the TCB generator can request `ts.Expression`s which
     * reference declarations in the `Environment` for these artifacts`.
     *
     * `Environment` can be used in a standalone fashion, or can be extended to support more specialized
     * usage.
     */
    var Environment = /** @class */ (function () {
        function Environment(config, importManager, refEmitter, reflector, contextFile) {
            this.config = config;
            this.importManager = importManager;
            this.refEmitter = refEmitter;
            this.reflector = reflector;
            this.contextFile = contextFile;
            this.nextIds = {
                pipeInst: 1,
                typeCtor: 1,
            };
            this.typeCtors = new Map();
            this.typeCtorStatements = [];
            this.pipeInsts = new Map();
            this.pipeInstStatements = [];
        }
        /**
         * Get an expression referring to a type constructor for the given directive.
         *
         * Depending on the shape of the directive itself, this could be either a reference to a declared
         * type constructor, or to an inline type constructor.
         */
        Environment.prototype.typeCtorFor = function (dir) {
            var dirRef = dir.ref;
            var node = dirRef.node;
            if (this.typeCtors.has(node)) {
                return this.typeCtors.get(node);
            }
            if (type_constructor_1.requiresInlineTypeCtor(node, this.reflector)) {
                // The constructor has already been created inline, we just need to construct a reference to
                // it.
                var ref = this.reference(dirRef);
                var typeCtorExpr = ts.createPropertyAccess(ref, 'ngTypeCtor');
                this.typeCtors.set(node, typeCtorExpr);
                return typeCtorExpr;
            }
            else {
                var fnName = "_ctor" + this.nextIds.typeCtor++;
                var nodeTypeRef = this.referenceType(dirRef);
                if (!ts.isTypeReferenceNode(nodeTypeRef)) {
                    throw new Error("Expected TypeReferenceNode from reference to " + dirRef.debugName);
                }
                var meta = {
                    fnName: fnName,
                    body: true,
                    fields: {
                        inputs: dir.inputs.classPropertyNames,
                        outputs: dir.outputs.classPropertyNames,
                        // TODO: support queries
                        queries: dir.queries,
                    },
                    coercedInputFields: dir.coercedInputFields,
                };
                var typeParams = this.emitTypeParameters(node);
                var typeCtor = type_constructor_1.generateTypeCtorDeclarationFn(node, meta, nodeTypeRef.typeName, typeParams, this.reflector);
                this.typeCtorStatements.push(typeCtor);
                var fnId = ts.createIdentifier(fnName);
                this.typeCtors.set(node, fnId);
                return fnId;
            }
        };
        /*
         * Get an expression referring to an instance of the given pipe.
         */
        Environment.prototype.pipeInst = function (ref) {
            if (this.pipeInsts.has(ref.node)) {
                return this.pipeInsts.get(ref.node);
            }
            var pipeType = this.referenceType(ref);
            var pipeInstId = ts.createIdentifier("_pipe" + this.nextIds.pipeInst++);
            this.pipeInstStatements.push(ts_util_1.tsDeclareVariable(pipeInstId, pipeType));
            this.pipeInsts.set(ref.node, pipeInstId);
            return pipeInstId;
        };
        /**
         * Generate a `ts.Expression` that references the given node.
         *
         * This may involve importing the node into the file if it's not declared there already.
         */
        Environment.prototype.reference = function (ref) {
            // Disable aliasing for imports generated in a template type-checking context, as there is no
            // guarantee that any alias re-exports exist in the .d.ts files. It's safe to use direct imports
            // in these cases as there is no strict dependency checking during the template type-checking
            // pass.
            var ngExpr = this.refEmitter.emit(ref, this.contextFile, imports_1.ImportFlags.NoAliasing);
            // Use `translateExpression` to convert the `Expression` into a `ts.Expression`.
            return translator_1.translateExpression(ngExpr.expression, this.importManager);
        };
        /**
         * Generate a `ts.TypeNode` that references the given node as a type.
         *
         * This may involve importing the node into the file if it's not declared there already.
         */
        Environment.prototype.referenceType = function (ref) {
            var ngExpr = this.refEmitter.emit(ref, this.contextFile, imports_1.ImportFlags.NoAliasing | imports_1.ImportFlags.AllowTypeImports);
            // Create an `ExpressionType` from the `Expression` and translate it via `translateType`.
            // TODO(alxhub): support references to types with generic arguments in a clean way.
            return translator_1.translateType(new compiler_1.ExpressionType(ngExpr.expression), this.importManager);
        };
        Environment.prototype.emitTypeParameters = function (declaration) {
            var _this = this;
            var emitter = new type_parameter_emitter_1.TypeParameterEmitter(declaration.typeParameters, this.reflector);
            return emitter.emit(function (ref) { return _this.referenceType(ref); });
        };
        /**
         * Generate a `ts.TypeNode` that references a given type from the provided module.
         *
         * This will involve importing the type into the file, and will also add type parameters if
         * provided.
         */
        Environment.prototype.referenceExternalType = function (moduleName, name, typeParams) {
            var external = new compiler_1.ExternalExpr({ moduleName: moduleName, name: name });
            return translator_1.translateType(new compiler_1.ExpressionType(external, [ /* modifiers */], typeParams), this.importManager);
        };
        Environment.prototype.getPreludeStatements = function () {
            return tslib_1.__spreadArray(tslib_1.__spreadArray([], tslib_1.__read(this.pipeInstStatements)), tslib_1.__read(this.typeCtorStatements));
        };
        return Environment;
    }());
    exports.Environment = Environment;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW52aXJvbm1lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL3R5cGVjaGVjay9zcmMvZW52aXJvbm1lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUVILDhDQUFzRjtJQUN0RiwrQkFBaUM7SUFFakMsbUVBQXVFO0lBRXZFLHlFQUFtRjtJQUduRixpRkFBNEM7SUFDNUMsbUdBQXlGO0lBQ3pGLCtHQUE4RDtJQUU5RDs7Ozs7Ozs7OztPQVVHO0lBQ0g7UUFZRSxxQkFDYSxNQUEwQixFQUFZLGFBQTRCLEVBQ25FLFVBQTRCLEVBQVcsU0FBeUIsRUFDOUQsV0FBMEI7WUFGM0IsV0FBTSxHQUFOLE1BQU0sQ0FBb0I7WUFBWSxrQkFBYSxHQUFiLGFBQWEsQ0FBZTtZQUNuRSxlQUFVLEdBQVYsVUFBVSxDQUFrQjtZQUFXLGNBQVMsR0FBVCxTQUFTLENBQWdCO1lBQzlELGdCQUFXLEdBQVgsV0FBVyxDQUFlO1lBZGhDLFlBQU8sR0FBRztnQkFDaEIsUUFBUSxFQUFFLENBQUM7Z0JBQ1gsUUFBUSxFQUFFLENBQUM7YUFDWixDQUFDO1lBRU0sY0FBUyxHQUFHLElBQUksR0FBRyxFQUFtQyxDQUFDO1lBQ3JELHVCQUFrQixHQUFtQixFQUFFLENBQUM7WUFFMUMsY0FBUyxHQUFHLElBQUksR0FBRyxFQUFtQyxDQUFDO1lBQ3JELHVCQUFrQixHQUFtQixFQUFFLENBQUM7UUFLUCxDQUFDO1FBRTVDOzs7OztXQUtHO1FBQ0gsaUNBQVcsR0FBWCxVQUFZLEdBQStCO1lBQ3pDLElBQU0sTUFBTSxHQUFHLEdBQUcsQ0FBQyxHQUF1RCxDQUFDO1lBQzNFLElBQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUM7WUFDekIsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENB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RSxJQUFJLE1BQUEsRUFBQyxDQUFDLENBQUM7WUFDdEQsT0FBTywwQkFBYSxDQUNoQixJQUFJLHlCQUFjLENBQUMsUUFBUSxFQUFFLEVBQUMsZUFBZSxDQUFDLEVBQUUsVUFBVSxDQUFDLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ3ZGLENBQUM7UUFFRCwwQ0FBb0IsR0FBcEI7WUFDRSxzRUFDSyxJQUFJLENBQUMsa0JBQWtCLG1CQUN2QixJQUFJLENBQUMsa0JBQWtCLEdBQzFCO1FBQ0osQ0FBQztRQUNILGtCQUFDO0lBQUQsQ0FBQyxBQXZJRCxJQXVJQztJQXZJWSxrQ0FBVyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0V4cHJlc3Npb25UeXBlLCBFeHRlcm5hbEV4cHIsIFR5cGUsIFdyYXBwZWROb2RlRXhwcn0gZnJvbSAnQGFuZ3VsYXIvY29tcGlsZXInO1xuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbmltcG9ydCB7SW1wb3J0RmxhZ3MsIFJlZmVyZW5jZSwgUmVmZXJlbmNlRW1pdHRlcn0gZnJvbSAnLi4vLi4vaW1wb3J0cyc7XG5pbXBvcnQge0NsYXNzRGVjbGFyYXRpb24sIFJlZmxlY3Rpb25Ib3N0fSBmcm9tICcuLi8uLi9yZWZsZWN0aW9uJztcbmltcG9ydCB7SW1wb3J0TWFuYWdlciwgdHJhbnNsYXRlRXhwcmVzc2lvbiwgdHJhbnNsYXRlVHlwZX0gZnJvbSAnLi4vLi4vdHJhbnNsYXRvcic7XG5pbXBvcnQge1R5cGVDaGVja2FibGVEaXJlY3RpdmVNZXRhLCBUeXBlQ2hlY2tpbmdDb25maWcsIFR5cGVDdG9yTWV0YWRhdGF9IGZyb20gJy4uL2FwaSc7XG5cbmltcG9ydCB7dHNEZWNsYXJlVmFyaWFibGV9IGZyb20gJy4vdHNfdXRpbCc7XG5pbXBvcnQge2dlbmVyYXRlVHlwZUN0b3JEZWNsYXJhdGlvbkZuLCByZXF1aXJlc0lubGluZVR5cGVDdG9yfSBmcm9tICcuL3R5cGVfY29uc3RydWN0b3InO1xuaW1wb3J0IHtUeXBlUGFyYW1ldGVyRW1pdHRlcn0gZnJvbSAnLi90eXBlX3BhcmFtZXRlcl9lbWl0dGVyJztcblxuLyoqXG4gKiBBIGNvbnRleHQgd2hpY2ggaG9zdHMgb25lIG9yIG1vcmUgVHlwZSBDaGVjayBCbG9ja3MgKFRDQnMpLlxuICpcbiAqIEFuIGBFbnZpcm9ubWVudGAgc3VwcG9ydHMgdGhlIGdlbmVyYXRpb24gb2YgVENCcyBieSB0cmFja2luZyBuZWNlc3NhcnkgaW1wb3J0cywgZGVjbGFyYXRpb25zIG9mXG4gKiB0eXBlIGNvbnN0cnVjdG9ycywgYW5kIG90aGVyIHN0YXRlbWVudHMgYmV5b25kIHRoZSB0eXBlLWNoZWNraW5nIGNvZGUgd2l0aGluIHRoZSBUQ0IgaXRzZWxmLlxuICogVGhyb3VnaCBtZXRob2QgY2FsbHMgb24gYEVudmlyb25tZW50YCwgdGhlIFRDQiBnZW5lcmF0b3IgY2FuIHJlcXVlc3QgYHRzLkV4cHJlc3Npb25gcyB3aGljaFxuICogcmVmZXJlbmNlIGRlY2xhcmF0aW9ucyBpbiB0aGUgYEVudmlyb25tZW50YCBmb3IgdGhlc2UgYXJ0aWZhY3RzYC5cbiAqXG4gKiBgRW52aXJvbm1lbnRgIGNhbiBiZSB1c2VkIGluIGEgc3RhbmRhbG9uZSBmYXNoaW9uLCBvciBjYW4gYmUgZXh0ZW5kZWQgdG8gc3VwcG9ydCBtb3JlIHNwZWNpYWxpemVkXG4gKiB1c2FnZS5cbiAqL1xuZXhwb3J0IGNsYXNzIEVudmlyb25tZW50IHtcbiAgcHJpdmF0ZSBuZXh0SWRzID0ge1xuICAgIHBpcGVJbnN0OiAxLFxuICAgIHR5cGVDdG9yOiAxLFxuICB9O1xuXG4gIHByaXZhdGUgdHlwZUN0b3JzID0gbmV3IE1hcDxDbGFzc0RlY2xhcmF0aW9uLCB0cy5FeHByZXNzaW9uPigpO1xuICBwcm90ZWN0ZWQgdHlwZUN0b3JTdGF0ZW1lbnRzOiB0cy5TdGF0ZW1lbnRbXSA9IFtdO1xuXG4gIHByaXZhdGUgcGlwZUluc3RzID0gbmV3IE1hcDxDbGFzc0RlY2xhcmF0aW9uLCB0cy5FeHByZXNzaW9uPigpO1xuICBwcm90ZWN0ZWQgcGlwZUluc3RTdGF0ZW1lbnRzOiB0cy5TdGF0ZW1lbnRbXSA9IFtdO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcmVhZG9ubHkgY29uZmlnOiBUeXBlQ2hlY2tpbmdDb25maWcsIHByb3RlY3RlZCBpbXBvcnRNYW5hZ2VyOiBJbXBvcnRNYW5hZ2VyLFxuICAgICAgcHJpdmF0ZSByZWZFbWl0dGVyOiBSZWZlcmVuY2VFbWl0dGVyLCByZWFkb25seSByZWZsZWN0b3I6IFJlZmxlY3Rpb25Ib3N0LFxuICAgICAgcHJvdGVjdGVkIGNvbnRleHRGaWxlOiB0cy5Tb3VyY2VGaWxlKSB7fVxuXG4gIC8qKlxuICAgKiBHZXQgYW4gZXhwcmVzc2lvbiByZWZlcnJpbmcgdG8gYSB0eXBlIGNvbnN0cnVjdG9yIGZvciB0aGUgZ2l2ZW4gZGlyZWN0aXZlLlxuICAgKlxuICAgKiBEZXBlbmRpbmcgb24gdGhlIHNoYXBlIG9mIHRoZSBkaXJlY3RpdmUgaXRzZWxmLCB0aGlzIGNvdWxkIGJlIGVpdGhlciBhIHJlZmVyZW5jZSB0byBhIGRlY2xhcmVkXG4gICAqIHR5cGUgY29uc3RydWN0b3IsIG9yIHRvIGFuIGlubGluZSB0eXBlIGNvbnN0cnVjdG9yLlxuICAgKi9cbiAgdHlwZUN0b3JGb3IoZGlyOiBUeXBlQ2hlY2thYmxlRGlyZWN0aXZlTWV0YSk6IHRzLkV4cHJlc3Npb24ge1xuICAgIGNvbnN0IGRpclJlZiA9IGRpci5yZWYgYXMgUmVmZXJlbmNlPENsYXNzRGVjbGFyYXRpb248dHMuQ2xhc3NEZWNsYXJhdGlvbj4+O1xuICAgIGNvbnN0IG5vZGUgPSBkaXJSZWYubm9kZTtcbiAgICBpZiAodGhpcy50eXBlQ3RvcnMuaGFzKG5vZGUpKSB7XG4gICAgICByZXR1cm4gdGhpcy50eXBlQ3RvcnMuZ2V0KG5vZGUpITtcbiAgICB9XG5cbiAgICBpZiAocmVxdWlyZXNJbmxpbmVUeXBlQ3Rvcihub2RlLCB0aGlzLnJlZmxlY3RvcikpIHtcbiAgICAgIC8vIFRoZSBjb25zdHJ1Y3RvciBoYXMgYWxyZWFkeSBiZWVuIGNyZWF0ZWQgaW5saW5lLCB3ZSBqdXN0IG5lZWQgdG8gY29uc3RydWN0IGEgcmVmZXJlbmNlIHRvXG4gICAgICAvLyBpdC5cbiAgICAgIGNvbnN0IHJlZiA9IHRoaXMucmVmZXJlbmNlKGRpclJlZik7XG4gICAgICBjb25zdCB0eXBlQ3RvckV4cHIgPSB0cy5jcmVhdGVQcm9wZXJ0eUFjY2VzcyhyZWYsICduZ1R5cGVDdG9yJyk7XG4gICAgICB0aGlzLnR5cGVDdG9ycy5zZXQobm9kZSwgdHlwZUN0b3JFeHByKTtcbiAgICAgIHJldHVybiB0eXBlQ3RvckV4cHI7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGZuTmFtZSA9IGBfY3RvciR7dGhpcy5uZXh0SWRzLnR5cGVDdG9yKyt9YDtcbiAgICAgIGNvbnN0IG5vZGVUeXBlUmVmID0gdGhpcy5yZWZlcmVuY2VUeXBlKGRpclJlZik7XG4gICAgICBpZiAoIXRzLmlzVHlwZVJlZmVyZW5jZU5vZGUobm9kZVR5cGVSZWYpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgRXhwZWN0ZWQgVHlwZVJlZmVyZW5jZU5vZGUgZnJvbSByZWZlcmVuY2UgdG8gJHtkaXJSZWYuZGVidWdOYW1lfWApO1xuICAgICAgfVxuICAgICAgY29uc3QgbWV0YTogVHlwZUN0b3JNZXRhZGF0YSA9IHtcbiAgICAgICAgZm5OYW1lLFxuICAgICAgICBib2R5OiB0cnVlLFxuICAgICAgICBmaWVsZHM6IHtcbiAgICAgICAgICBpbnB1dHM6IGRpci5pbnB1dHMuY2xhc3NQcm9wZXJ0eU5hbWVzLFxuICAgICAgICAgIG91dHB1dHM6IGRpci5vdXRwdXRzLmNsYXNzUHJvcGVydHlOYW1lcyxcbiAgICAgICAgICAvLyBUT0RPOiBzdXBwb3J0IHF1ZXJpZXNcbiAgICAgICAgICBxdWVyaWVzOiBkaXIucXVlcmllcyxcbiAgICAgICAgfSxcbiAgICAgICAgY29lcmNlZElucHV0RmllbGRzOiBkaXIuY29lcmNlZElucHV0RmllbGRzLFxuICAgICAgfTtcbiAgICAgIGNvbnN0IHR5cGVQYXJhbXMgPSB0aGlzLmVtaXRUeXBlUGFyYW1ldGVycyhub2RlKTtcbiAgICAgIGNvbnN0IHR5cGVDdG9yID0gZ2VuZXJhdGVUeXBlQ3RvckRlY2xhcmF0aW9uRm4oXG4gICAgICAgICAgbm9kZSwgbWV0YSwgbm9kZVR5cGVSZWYudHlwZU5hbWUsIHR5cGVQYXJhbXMsIHRoaXMucmVmbGVjdG9yKTtcbiAgICAgIHRoaXMudHlwZUN0b3JTdGF0ZW1lbnRzLnB1c2godHlwZUN0b3IpO1xuICAgICAgY29uc3QgZm5JZCA9IHRzLmNyZWF0ZUlkZW50aWZpZXIoZm5OYW1lKTtcbiAgICAgIHRoaXMudHlwZUN0b3JzLnNldChub2RlLCBmbklkKTtcbiAgICAgIHJldHVybiBmbklkO1xuICAgIH1cbiAgfVxuXG4gIC8qXG4gICAqIEdldCBhbiBleHByZXNzaW9uIHJlZmVycmluZyB0byBhbiBpbnN0YW5jZSBvZiB0aGUgZ2l2ZW4gcGlwZS5cbiAgICovXG4gIHBpcGVJbnN0KHJlZjogUmVmZXJlbmNlPENsYXNzRGVjbGFyYXRpb248dHMuQ2xhc3NEZWNsYXJhdGlvbj4+KTogdHMuRXhwcmVzc2lvbiB7XG4gICAgaWYgKHRoaXMucGlwZUluc3RzLmhhcyhyZWYubm9kZSkpIHtcbiAgICAgIHJldHVybiB0aGlzLnBpcGVJbnN0cy5nZXQocmVmLm5vZGUpITtcbiAgICB9XG5cbiAgICBjb25zdCBwaXBlVHlwZSA9IHRoaXMucmVmZXJlbmNlVHlwZShyZWYpO1xuICAgIGNvbnN0IHBpcGVJbnN0SWQgPSB0cy5jcmVhdGVJZGVudGlmaWVyKGBfcGlwZSR7dGhpcy5uZXh0SWRzLnBpcGVJbnN0Kyt9YCk7XG5cbiAgICB0aGlzLnBpcGVJbnN0U3RhdGVtZW50cy5wdXNoKHRzRGVjbGFyZVZhcmlhYmxlKHBpcGVJbnN0SWQsIHBpcGVUeXBlKSk7XG4gICAgdGhpcy5waXBlSW5zdHMuc2V0KHJlZi5ub2RlLCBwaXBlSW5zdElkKTtcblxuICAgIHJldHVybiBwaXBlSW5zdElkO1xuICB9XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlIGEgYHRzLkV4cHJlc3Npb25gIHRoYXQgcmVmZXJlbmNlcyB0aGUgZ2l2ZW4gbm9kZS5cbiAgICpcbiAgICogVGhpcyBtYXkgaW52b2x2ZSBpbXBvcnRpbmcgdGhlIG5vZGUgaW50byB0aGUgZmlsZSBpZiBpdCdzIG5vdCBkZWNsYXJlZCB0aGVyZSBhbHJlYWR5LlxuICAgKi9cbiAgcmVmZXJlbmNlKHJlZjogUmVmZXJlbmNlPENsYXNzRGVjbGFyYXRpb248dHMuQ2xhc3NEZWNsYXJhdGlvbj4+KTogdHMuRXhwcmVzc2lvbiB7XG4gICAgLy8gRGlzYWJsZSBhbGlhc2luZyBmb3IgaW1wb3J0cyBnZW5lcmF0ZWQgaW4gYSB0ZW1wbGF0ZSB0eXBlLWNoZWNraW5nIGNvbnRleHQsIGFzIHRoZXJlIGlzIG5vXG4gICAgLy8gZ3VhcmFudGVlIHRoYXQgYW55IGFsaWFzIHJlLWV4cG9ydHMgZXhpc3QgaW4gdGhlIC5kLnRzIGZpbGVzLiBJdCdzIHNhZmUgdG8gdXNlIGRpcmVjdCBpbXBvcnRzXG4gICAgLy8gaW4gdGhlc2UgY2FzZXMgYXMgdGhlcmUgaXMgbm8gc3RyaWN0IGRlcGVuZGVuY3kgY2hlY2tpbmcgZHVyaW5nIHRoZSB0ZW1wbGF0ZSB0eXBlLWNoZWNraW5nXG4gICAgLy8gcGFzcy5cbiAgICBjb25zdCBuZ0V4cHIgPSB0aGlzLnJlZkVtaXR0ZXIuZW1pdChyZWYsIHRoaXMuY29udGV4dEZpbGUsIEltcG9ydEZsYWdzLk5vQWxpYXNpbmcpO1xuXG4gICAgLy8gVXNlIGB0cmFuc2xhdGVFeHByZXNzaW9uYCB0byBjb252ZXJ0IHRoZSBgRXhwcmVzc2lvbmAgaW50byBhIGB0cy5FeHByZXNzaW9uYC5cbiAgICByZXR1cm4gdHJhbnNsYXRlRXhwcmVzc2lvbihuZ0V4cHIuZXhwcmVzc2lvbiwgdGhpcy5pbXBvcnRNYW5hZ2VyKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZW5lcmF0ZSBhIGB0cy5UeXBlTm9kZWAgdGhhdCByZWZlcmVuY2VzIHRoZSBnaXZlbiBub2RlIGFzIGEgdHlwZS5cbiAgICpcbiAgICogVGhpcyBtYXkgaW52b2x2ZSBpbXBvcnRpbmcgdGhlIG5vZGUgaW50byB0aGUgZmlsZSBpZiBpdCdzIG5vdCBkZWNsYXJlZCB0aGVyZSBhbHJlYWR5LlxuICAgKi9cbiAgcmVmZXJlbmNlVHlwZShyZWY6IFJlZmVyZW5jZSk6IHRzLlR5cGVOb2RlIHtcbiAgICBjb25zdCBuZ0V4cHIgPSB0aGlzLnJlZkVtaXR0ZXIuZW1pdChcbiAgICAgICAgcmVmLCB0aGlzLmNvbnRleHRGaWxlLCBJbXBvcnRGbGFncy5Ob0FsaWFzaW5nIHwgSW1wb3J0RmxhZ3MuQWxsb3dUeXBlSW1wb3J0cyk7XG5cbiAgICAvLyBDcmVhdGUgYW4gYEV4cHJlc3Npb25UeXBlYCBmcm9tIHRoZSBgRXhwcmVzc2lvbmAgYW5kIHRyYW5zbGF0ZSBpdCB2aWEgYHRyYW5zbGF0ZVR5cGVgLlxuICAgIC8vIFRPRE8oYWx4aHViKTogc3VwcG9ydCByZWZlcmVuY2VzIHRvIHR5cGVzIHdpdGggZ2VuZXJpYyBhcmd1bWVudHMgaW4gYSBjbGVhbiB3YXkuXG4gICAgcmV0dXJuIHRyYW5zbGF0ZVR5cGUobmV3IEV4cHJlc3Npb25UeXBlKG5nRXhwci5leHByZXNzaW9uKSwgdGhpcy5pbXBvcnRNYW5hZ2VyKTtcbiAgfVxuXG4gIHByaXZhdGUgZW1pdFR5cGVQYXJhbWV0ZXJzKGRlY2xhcmF0aW9uOiBDbGFzc0RlY2xhcmF0aW9uPHRzLkNsYXNzRGVjbGFyYXRpb24+KTpcbiAgICAgIHRzLlR5cGVQYXJhbWV0ZXJEZWNsYXJhdGlvbltdfHVuZGVmaW5lZCB7XG4gICAgY29uc3QgZW1pdHRlciA9IG5ldyBUeXBlUGFyYW1ldGVyRW1pdHRlcihkZWNsYXJhdGlvbi50eXBlUGFyYW1ldGVycywgdGhpcy5yZWZsZWN0b3IpO1xuICAgIHJldHVybiBlbWl0dGVyLmVtaXQocmVmID0+IHRoaXMucmVmZXJlbmNlVHlwZShyZWYpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZW5lcmF0ZSBhIGB0cy5UeXBlTm9kZWAgdGhhdCByZWZlcmVuY2VzIGEgZ2l2ZW4gdHlwZSBmcm9tIHRoZSBwcm92aWRlZCBtb2R1bGUuXG4gICAqXG4gICAqIFRoaXMgd2lsbCBpbnZvbHZlIGltcG9ydGluZyB0aGUgdHlwZSBpbnRvIHRoZSBmaWxlLCBhbmQgd2lsbCBhbHNvIGFkZCB0eXBlIHBhcmFtZXRlcnMgaWZcbiAgICogcHJvdmlkZWQuXG4gICAqL1xuICByZWZlcmVuY2VFeHRlcm5hbFR5cGUobW9kdWxlTmFtZTogc3RyaW5nLCBuYW1lOiBzdHJpbmcsIHR5cGVQYXJhbXM/OiBUeXBlW10pOiB0cy5UeXBlTm9kZSB7XG4gICAgY29uc3QgZXh0ZXJuYWwgPSBuZXcgRXh0ZXJuYWxFeHByKHttb2R1bGVOYW1lLCBuYW1lfSk7XG4gICAgcmV0dXJuIHRyYW5zbGF0ZVR5cGUoXG4gICAgICAgIG5ldyBFeHByZXNzaW9uVHlwZShleHRlcm5hbCwgWy8qIG1vZGlmaWVycyAqL10sIHR5cGVQYXJhbXMpLCB0aGlzLmltcG9ydE1hbmFnZXIpO1xuICB9XG5cbiAgZ2V0UHJlbHVkZVN0YXRlbWVudHMoKTogdHMuU3RhdGVtZW50W10ge1xuICAgIHJldHVybiBbXG4gICAgICAuLi50aGlzLnBpcGVJbnN0U3RhdGVtZW50cyxcbiAgICAgIC4uLnRoaXMudHlwZUN0b3JTdGF0ZW1lbnRzLFxuICAgIF07XG4gIH1cbn1cbiJdfQ==