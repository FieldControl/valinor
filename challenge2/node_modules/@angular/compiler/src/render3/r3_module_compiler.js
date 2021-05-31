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
        define("@angular/compiler/src/render3/r3_module_compiler", ["require", "exports", "@angular/compiler/src/output/output_ast", "@angular/compiler/src/render3/r3_identifiers", "@angular/compiler/src/render3/util", "@angular/compiler/src/render3/view/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createNgModuleType = exports.compileNgModuleDeclarationExpression = exports.compileNgModule = void 0;
    var o = require("@angular/compiler/src/output/output_ast");
    var r3_identifiers_1 = require("@angular/compiler/src/render3/r3_identifiers");
    var util_1 = require("@angular/compiler/src/render3/util");
    var util_2 = require("@angular/compiler/src/render3/view/util");
    /**
     * Construct an `R3NgModuleDef` for the given `R3NgModuleMetadata`.
     */
    function compileNgModule(meta) {
        var internalType = meta.internalType, bootstrap = meta.bootstrap, declarations = meta.declarations, imports = meta.imports, exports = meta.exports, schemas = meta.schemas, containsForwardDecls = meta.containsForwardDecls, emitInline = meta.emitInline, id = meta.id;
        var statements = [];
        var definitionMap = new util_2.DefinitionMap();
        definitionMap.set('type', internalType);
        if (bootstrap.length > 0) {
            definitionMap.set('bootstrap', util_1.refsToArray(bootstrap, containsForwardDecls));
        }
        // If requested to emit scope information inline, pass the `declarations`, `imports` and `exports`
        // to the `ɵɵdefineNgModule()` call. The JIT compilation uses this.
        if (emitInline) {
            if (declarations.length > 0) {
                definitionMap.set('declarations', util_1.refsToArray(declarations, containsForwardDecls));
            }
            if (imports.length > 0) {
                definitionMap.set('imports', util_1.refsToArray(imports, containsForwardDecls));
            }
            if (exports.length > 0) {
                definitionMap.set('exports', util_1.refsToArray(exports, containsForwardDecls));
            }
        }
        // If not emitting inline, the scope information is not passed into `ɵɵdefineNgModule` as it would
        // prevent tree-shaking of the declarations, imports and exports references.
        else {
            var setNgModuleScopeCall = generateSetNgModuleScopeCall(meta);
            if (setNgModuleScopeCall !== null) {
                statements.push(setNgModuleScopeCall);
            }
        }
        if (schemas !== null && schemas.length > 0) {
            definitionMap.set('schemas', o.literalArr(schemas.map(function (ref) { return ref.value; })));
        }
        if (id !== null) {
            definitionMap.set('id', id);
        }
        var expression = o.importExpr(r3_identifiers_1.Identifiers.defineNgModule).callFn([definitionMap.toLiteralMap()], undefined, true);
        var type = createNgModuleType(meta);
        return { expression: expression, type: type, statements: statements };
    }
    exports.compileNgModule = compileNgModule;
    /**
     * This function is used in JIT mode to generate the call to `ɵɵdefineNgModule()` from a call to
     * `ɵɵngDeclareNgModule()`.
     */
    function compileNgModuleDeclarationExpression(meta) {
        var definitionMap = new util_2.DefinitionMap();
        definitionMap.set('type', new o.WrappedNodeExpr(meta.type));
        if (meta.bootstrap !== undefined) {
            definitionMap.set('bootstrap', new o.WrappedNodeExpr(meta.bootstrap));
        }
        if (meta.declarations !== undefined) {
            definitionMap.set('declarations', new o.WrappedNodeExpr(meta.declarations));
        }
        if (meta.imports !== undefined) {
            definitionMap.set('imports', new o.WrappedNodeExpr(meta.imports));
        }
        if (meta.exports !== undefined) {
            definitionMap.set('exports', new o.WrappedNodeExpr(meta.exports));
        }
        if (meta.schemas !== undefined) {
            definitionMap.set('schemas', new o.WrappedNodeExpr(meta.schemas));
        }
        if (meta.id !== undefined) {
            definitionMap.set('id', new o.WrappedNodeExpr(meta.id));
        }
        return o.importExpr(r3_identifiers_1.Identifiers.defineNgModule).callFn([definitionMap.toLiteralMap()]);
    }
    exports.compileNgModuleDeclarationExpression = compileNgModuleDeclarationExpression;
    function createNgModuleType(_a) {
        var moduleType = _a.type, declarations = _a.declarations, imports = _a.imports, exports = _a.exports;
        return new o.ExpressionType(o.importExpr(r3_identifiers_1.Identifiers.NgModuleDeclaration, [
            new o.ExpressionType(moduleType.type), tupleTypeOf(declarations), tupleTypeOf(imports),
            tupleTypeOf(exports)
        ]));
    }
    exports.createNgModuleType = createNgModuleType;
    /**
     * Generates a function call to `ɵɵsetNgModuleScope` with all necessary information so that the
     * transitive module scope can be computed during runtime in JIT mode. This call is marked pure
     * such that the references to declarations, imports and exports may be elided causing these
     * symbols to become tree-shakeable.
     */
    function generateSetNgModuleScopeCall(meta) {
        var moduleType = meta.adjacentType, declarations = meta.declarations, imports = meta.imports, exports = meta.exports, containsForwardDecls = meta.containsForwardDecls;
        var scopeMap = new util_2.DefinitionMap();
        if (declarations.length > 0) {
            scopeMap.set('declarations', util_1.refsToArray(declarations, containsForwardDecls));
        }
        if (imports.length > 0) {
            scopeMap.set('imports', util_1.refsToArray(imports, containsForwardDecls));
        }
        if (exports.length > 0) {
            scopeMap.set('exports', util_1.refsToArray(exports, containsForwardDecls));
        }
        if (Object.keys(scopeMap.values).length === 0) {
            return null;
        }
        // setNgModuleScope(...)
        var fnCall = new o.InvokeFunctionExpr(
        /* fn */ o.importExpr(r3_identifiers_1.Identifiers.setNgModuleScope), 
        /* args */ [moduleType, scopeMap.toLiteralMap()]);
        // (ngJitMode guard) && setNgModuleScope(...)
        var guardedCall = util_1.jitOnlyGuardedExpression(fnCall);
        // function() { (ngJitMode guard) && setNgModuleScope(...); }
        var iife = new o.FunctionExpr(
        /* params */ [], 
        /* statements */ [guardedCall.toStmt()]);
        // (function() { (ngJitMode guard) && setNgModuleScope(...); })()
        var iifeCall = new o.InvokeFunctionExpr(
        /* fn */ iife, 
        /* args */ []);
        return iifeCall.toStmt();
    }
    function tupleTypeOf(exp) {
        var types = exp.map(function (ref) { return o.typeofExpr(ref.type); });
        return exp.length > 0 ? o.expressionType(o.literalArr(types)) : o.NONE_TYPE;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicjNfbW9kdWxlX2NvbXBpbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL3JlbmRlcjMvcjNfbW9kdWxlX2NvbXBpbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQUdILDJEQUEwQztJQUUxQywrRUFBbUQ7SUFDbkQsMkRBQWdHO0lBQ2hHLGdFQUEwQztJQTJHMUM7O09BRUc7SUFDSCxTQUFnQixlQUFlLENBQUMsSUFBd0I7UUFFcEQsSUFBQSxZQUFZLEdBU1YsSUFBSSxhQVRNLEVBQ1osU0FBUyxHQVFQLElBQUksVUFSRyxFQUNULFlBQVksR0FPVixJQUFJLGFBUE0sRUFDWixPQUFPLEdBTUwsSUFBSSxRQU5DLEVBQ1AsT0FBTyxHQUtMLElBQUksUUFMQyxFQUNQLE9BQU8sR0FJTCxJQUFJLFFBSkMsRUFDUCxvQkFBb0IsR0FHbEIsSUFBSSxxQkFIYyxFQUNwQixVQUFVLEdBRVIsSUFBSSxXQUZJLEVBQ1YsRUFBRSxHQUNBLElBQUksR0FESixDQUNLO1FBRVQsSUFBTSxVQUFVLEdBQWtCLEVBQUUsQ0FBQztRQUNyQyxJQUFNLGFBQWEsR0FBRyxJQUFJLG9CQUFhLEVBQW9CLENBQUM7UUFDNUQsYUFBYSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFFeEMsSUFBSSxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUN4QixhQUFhLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxrQkFBVyxDQUFDLFNBQVMsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDLENBQUM7U0FDOUU7UUFFRCxrR0FBa0c7UUFDbEcsbUVBQW1FO1FBQ25FLElBQUksVUFBVSxFQUFFO1lBQ2QsSUFBSSxZQUFZLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDM0IsYUFBYSxDQUFDLEdBQUcsQ0FBQyxjQUFjLEVB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aUVBQWlFO1FBQ2pFLElBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxDQUFDLGtCQUFrQjtRQUNyQyxRQUFRLENBQUMsSUFBSTtRQUNiLFVBQVUsQ0FBQSxFQUFFLENBQUMsQ0FBQztRQUVsQixPQUFPLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUMzQixDQUFDO0lBRUQsU0FBUyxXQUFXLENBQUMsR0FBa0I7UUFDckMsSUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxVQUFBLEdBQUcsSUFBSSxPQUFBLENBQUMsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUF0QixDQUFzQixDQUFDLENBQUM7UUFDckQsT0FBTyxHQUFHLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7SUFDOUUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1IzRGVjbGFyZU5nTW9kdWxlRmFjYWRlfSBmcm9tICcuLi9jb21waWxlcl9mYWNhZGVfaW50ZXJmYWNlJztcbmltcG9ydCAqIGFzIG8gZnJvbSAnLi4vb3V0cHV0L291dHB1dF9hc3QnO1xuXG5pbXBvcnQge0lkZW50aWZpZXJzIGFzIFIzfSBmcm9tICcuL3IzX2lkZW50aWZpZXJzJztcbmltcG9ydCB7aml0T25seUd1YXJkZWRFeHByZXNzaW9uLCBSM0NvbXBpbGVkRXhwcmVzc2lvbiwgUjNSZWZlcmVuY2UsIHJlZnNUb0FycmF5fSBmcm9tICcuL3V0aWwnO1xuaW1wb3J0IHtEZWZpbml0aW9uTWFwfSBmcm9tICcuL3ZpZXcvdXRpbCc7XG5cbi8qKlxuICogTWV0YWRhdGEgcmVxdWlyZWQgYnkgdGhlIG1vZHVsZSBjb21waWxlciB0byBnZW5lcmF0ZSBhIG1vZHVsZSBkZWYgKGDJtW1vZGApIGZvciBhIHR5cGUuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUjNOZ01vZHVsZU1ldGFkYXRhIHtcbiAgLyoqXG4gICAqIEFuIGV4cHJlc3Npb24gcmVwcmVzZW50aW5nIHRoZSBtb2R1bGUgdHlwZSBiZWluZyBjb21waWxlZC5cbiAgICovXG4gIHR5cGU6IFIzUmVmZXJlbmNlO1xuXG4gIC8qKlxuICAgKiBBbiBleHByZXNzaW9uIHJlcHJlc2VudGluZyB0aGUgbW9kdWxlIHR5cGUgYmVpbmcgY29tcGlsZWQsIGludGVuZGVkIGZvciB1c2Ugd2l0aGluIGEgY2xhc3NcbiAgICogZGVmaW5pdGlvbiBpdHNlbGYuXG4gICAqXG4gICAqIFRoaXMgY2FuIGRpZmZlciBmcm9tIHRoZSBvdXRlciBgdHlwZWAgaWYgdGhlIGNsYXNzIGlzIGJlaW5nIGNvbXBpbGVkIGJ5IG5nY2MgYW5kIGlzIGluc2lkZVxuICAgKiBhbiBJSUZFIHN0cnVjdHVyZSB0aGF0IHVzZXMgYSBkaWZmZXJlbnQgbmFtZSBpbnRlcm5hbGx5LlxuICAgKi9cbiAgaW50ZXJuYWxUeXBlOiBvLkV4cHJlc3Npb247XG5cbiAgLyoqXG4gICAqIEFuIGV4cHJlc3Npb24gaW50ZW5kZWQgZm9yIHVzZSBieSBzdGF0ZW1lbnRzIHRoYXQgYXJlIGFkamFjZW50IChpLmUuIHRpZ2h0bHkgY291cGxlZCkgdG8gYnV0XG4gICAqIG5vdCBpbnRlcm5hbCB0byBhIGNsYXNzIGRlZmluaXRpb24uXG4gICAqXG4gICAqIFRoaXMgY2FuIGRpZmZlciBmcm9tIHRoZSBvdXRlciBgdHlwZWAgaWYgdGhlIGNsYXNzIGlzIGJlaW5nIGNvbXBpbGVkIGJ5IG5nY2MgYW5kIGlzIGluc2lkZVxuICAgKiBhbiBJSUZFIHN0cnVjdHVyZSB0aGF0IHVzZXMgYSBkaWZmZXJlbnQgbmFtZSBpbnRlcm5hbGx5LlxuICAgKi9cbiAgYWRqYWNlbnRUeXBlOiBvLkV4cHJlc3Npb247XG5cbiAgLyoqXG4gICAqIEFuIGFycmF5IG9mIGV4cHJlc3Npb25zIHJlcHJlc2VudGluZyB0aGUgYm9vdHN0cmFwIGNvbXBvbmVudHMgc3BlY2lmaWVkIGJ5IHRoZSBtb2R1bGUuXG4gICAqL1xuICBib290c3RyYXA6IFIzUmVmZXJlbmNlW107XG5cbiAgLyoqXG4gICAqIEFuIGFycmF5IG9mIGV4cHJlc3Npb25zIHJlcHJlc2VudGluZyB0aGUgZGlyZWN0aXZlcyBhbmQgcGlwZXMgZGVjbGFyZWQgYnkgdGhlIG1vZHVsZS5cbiAgICovXG4gIGRlY2xhcmF0aW9uczogUjNSZWZlcmVuY2VbXTtcblxuICAvKipcbiAgICogQW4gYXJyYXkgb2YgZXhwcmVzc2lvbnMgcmVwcmVzZW50aW5nIHRoZSBpbXBvcnRzIG9mIHRoZSBtb2R1bGUuXG4gICAqL1xuICBpbXBvcnRzOiBSM1JlZmVyZW5jZVtdO1xuXG4gIC8qKlxuICAgKiBBbiBhcnJheSBvZiBleHByZXNzaW9ucyByZXByZXNlbnRpbmcgdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZS5cbiAgICovXG4gIGV4cG9ydHM6IFIzUmVmZXJlbmNlW107XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdG8gZW1pdCB0aGUgc2VsZWN0b3Igc2NvcGUgdmFsdWVzIChkZWNsYXJhdGlvbnMsIGltcG9ydHMsIGV4cG9ydHMpIGlubGluZSBpbnRvIHRoZVxuICAgKiBtb2R1bGUgZGVmaW5pdGlvbiwgb3IgdG8gZ2VuZXJhdGUgYWRkaXRpb25hbCBzdGF0ZW1lbnRzIHdoaWNoIHBhdGNoIHRoZW0gb24uIElubGluZSBlbWlzc2lvblxuICAgKiBkb2VzIG5vdCBhbGxvdyBjb21wb25lbnRzIHRvIGJlIHRyZWUtc2hha2VuLCBidXQgaXMgdXNlZnVsIGZvciBKSVQgbW9kZS5cbiAgICovXG4gIGVtaXRJbmxpbmU6IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdG8gZ2VuZXJhdGUgY2xvc3VyZSB3cmFwcGVycyBmb3IgYm9vdHN0cmFwLCBkZWNsYXJhdGlvbnMsIGltcG9ydHMsIGFuZCBleHBvcnRzLlxuICAgKi9cbiAgY29udGFpbnNGb3J3YXJkRGVjbHM6IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIFRoZSBzZXQgb2Ygc2NoZW1hcyB0aGF0IGRlY2xhcmUgZWxlbWVudHMgdG8gYmUgYWxsb3dlZCBpbiB0aGUgTmdNb2R1bGUuXG4gICAqL1xuICBzY2hlbWFzOiBSM1JlZmVyZW5jZVtdfG51bGw7XG5cbiAgLyoqIFVuaXF1ZSBJRCBvciBleHByZXNzaW9uIHJlcHJlc2VudGluZyB0aGUgdW5pcXVlIElEIG9mIGFuIE5nTW9kdWxlLiAqL1xuICBpZDogby5FeHByZXNzaW9ufG51bGw7XG59XG5cbi8qKlxuICogVGhlIHNoYXBlIG9mIHRoZSBvYmplY3QgbGl0ZXJhbCB0aGF0IGlzIHBhc3NlZCB0byB0aGUgYMm1ybVkZWZpbmVOZ01vZHVsZSgpYCBjYWxsLlxuICovXG5pbnRlcmZhY2UgUjNOZ01vZHVsZURlZk1hcCB7XG4gIC8qKlxuICAgKiBBbiBleHByZXNzaW9uIHJlcHJlc2VudGluZyB0aGUgbW9kdWxlIHR5cGUgYmVpbmcgY29tcGlsZWQuXG4gICAqL1xuICB0eXBlOiBvLkV4cHJlc3Npb247XG4gIC8qKlxuICAgKiBBbiBleHByZXNzaW9uIGV2YWx1YXRpbmcgdG8gYW4gYXJyYXkgb2YgZXhwcmVzc2lvbnMgcmVwcmVzZW50aW5nIHRoZSBib290c3RyYXAgY29tcG9uZW50c1xuICAgKiBzcGVjaWZpZWQgYnkgdGhlIG1vZHVsZS5cbiAgICovXG4gIGJvb3RzdHJhcD86IG8uRXhwcmVzc2lvbjtcbiAgLyoqXG4gICAqIEFuIGV4cHJlc3Npb24gZXZhbHVhdGluZyB0byBhbiBhcnJheSBvZiBleHByZXNzaW9ucyByZXByZXNlbnRpbmcgdGhlIGRpcmVjdGl2ZXMgYW5kIHBpcGVzXG4gICAqIGRlY2xhcmVkIGJ5IHRoZSBtb2R1bGUuXG4gICAqL1xuICBkZWNsYXJhdGlvbnM/OiBvLkV4cHJlc3Npb247XG4gIC8qKlxuICAgKiBBbiBleHByZXNzaW9uIGV2YWx1YXRpbmcgdG8gYW4gYXJyYXkgb2YgZXhwcmVzc2lvbnMgcmVwcmVzZW50aW5nIHRoZSBpbXBvcnRzIG9mIHRoZSBtb2R1bGUuXG4gICAqL1xuICBpbXBvcnRzPzogby5FeHByZXNzaW9uO1xuICAvKipcbiAgICogQW4gZXhwcmVzc2lvbiBldmFsdWF0aW5nIHRvIGFuIGFycmF5IG9mIGV4cHJlc3Npb25zIHJlcHJlc2VudGluZyB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlLlxuICAgKi9cbiAgZXhwb3J0cz86IG8uRXhwcmVzc2lvbjtcbiAgLyoqXG4gICAqIEEgbGl0ZXJhbCBhcnJheSBleHByZXNzaW9uIGNvbnRhaW5pbmcgdGhlIHNjaGVtYXMgdGhhdCBkZWNsYXJlIGVsZW1lbnRzIHRvIGJlIGFsbG93ZWQgaW4gdGhlXG4gICAqIE5nTW9kdWxlLlxuICAgKi9cbiAgc2NoZW1hcz86IG8uTGl0ZXJhbEFycmF5RXhwcjtcbiAgLyoqXG4gICAqIEFuIGV4cHJlc3Npb24gZXZhbHVhdGluZyB0byB0aGUgdW5pcXVlIElEIG9mIGFuIE5nTW9kdWxlLlxuICAgKiAqL1xuICBpZD86IG8uRXhwcmVzc2lvbjtcbn1cblxuLyoqXG4gKiBDb25zdHJ1Y3QgYW4gYFIzTmdNb2R1bGVEZWZgIGZvciB0aGUgZ2l2ZW4gYFIzTmdNb2R1bGVNZXRhZGF0YWAuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb21waWxlTmdNb2R1bGUobWV0YTogUjNOZ01vZHVsZU1ldGFkYXRhKTogUjNDb21waWxlZEV4cHJlc3Npb24ge1xuICBjb25zdCB7XG4gICAgaW50ZXJuYWxUeXBlLFxuICAgIGJvb3RzdHJhcCxcbiAgICBkZWNsYXJhdGlvbnMsXG4gICAgaW1wb3J0cyxcbiAgICBleHBvcnRzLFxuICAgIHNjaGVtYXMsXG4gICAgY29udGFpbnNGb3J3YXJkRGVjbHMsXG4gICAgZW1pdElubGluZSxcbiAgICBpZFxuICB9ID0gbWV0YTtcblxuICBjb25zdCBzdGF0ZW1lbnRzOiBvLlN0YXRlbWVudFtdID0gW107XG4gIGNvbnN0IGRlZmluaXRpb25NYXAgPSBuZXcgRGVmaW5pdGlvbk1hcDxSM05nTW9kdWxlRGVmTWFwPigpO1xuICBkZWZpbml0aW9uTWFwLnNldCgndHlwZScsIGludGVybmFsVHlwZSk7XG5cbiAgaWYgKGJvb3RzdHJhcC5sZW5ndGggPiAwKSB7XG4gICAgZGVmaW5pdGlvbk1hcC5zZXQoJ2Jvb3RzdHJhcCcsIHJlZnNUb0FycmF5KGJvb3RzdHJhcCwgY29udGFpbnNGb3J3YXJkRGVjbHMpKTtcbiAgfVxuXG4gIC8vIElmIHJlcXVlc3RlZCB0byBlbWl0IHNjb3BlIGluZm9ybWF0aW9uIGlubGluZSwgcGFzcyB0aGUgYGRlY2xhcmF0aW9uc2AsIGBpbXBvcnRzYCBhbmQgYGV4cG9ydHNgXG4gIC8vIHRvIHRoZSBgybXJtWRlZmluZU5nTW9kdWxlKClgIGNhbGwuIFRoZSBKSVQgY29tcGlsYXRpb24gdXNlcyB0aGlzLlxuICBpZiAoZW1pdElubGluZSkge1xuICAgIGlmIChkZWNsYXJhdGlvbnMubGVuZ3RoID4gMCkge1xuICAgICAgZGVmaW5pdGlvbk1hcC5zZXQoJ2RlY2xhcmF0aW9ucycsIHJlZnNUb0FycmF5KGRlY2xhcmF0aW9ucywgY29udGFpbnNGb3J3YXJkRGVjbHMpKTtcbiAgICB9XG5cbiAgICBpZiAoaW1wb3J0cy5sZW5ndGggPiAwKSB7XG4gICAgICBkZWZpbml0aW9uTWFwLnNldCgnaW1wb3J0cycsIHJlZnNUb0FycmF5KGltcG9ydHMsIGNvbnRhaW5zRm9yd2FyZERlY2xzKSk7XG4gICAgfVxuXG4gICAgaWYgKGV4cG9ydHMubGVuZ3RoID4gMCkge1xuICAgICAgZGVmaW5pdGlvbk1hcC5zZXQoJ2V4cG9ydHMnLCByZWZzVG9BcnJheShleHBvcnRzLCBjb250YWluc0ZvcndhcmREZWNscykpO1xuICAgIH1cbiAgfVxuXG4gIC8vIElmIG5vdCBlbWl0dGluZyBpbmxpbmUsIHRoZSBzY29wZSBpbmZvcm1hdGlvbiBpcyBub3QgcGFzc2VkIGludG8gYMm1ybVkZWZpbmVOZ01vZHVsZWAgYXMgaXQgd291bGRcbiAgLy8gcHJldmVudCB0cmVlLXNoYWtpbmcgb2YgdGhlIGRlY2xhcmF0aW9ucywgaW1wb3J0cyBhbmQgZXhwb3J0cyByZWZlcmVuY2VzLlxuICBlbHNlIHtcbiAgICBjb25zdCBzZXROZ01vZHVsZVNjb3BlQ2FsbCA9IGdlbmVyYXRlU2V0TmdNb2R1bGVTY29wZUNhbGwobWV0YSk7XG4gICAgaWYgKHNldE5nTW9kdWxlU2NvcGVDYWxsICE9PSBudWxsKSB7XG4gICAgICBzdGF0ZW1lbnRzLnB1c2goc2V0TmdNb2R1bGVTY29wZUNhbGwpO1xuICAgIH1cbiAgfVxuXG4gIGlmIChzY2hlbWFzICE9PSBudWxsICYmIHNjaGVtYXMubGVuZ3RoID4gMCkge1xuICAgIGRlZmluaXRpb25NYXAuc2V0KCdzY2hlbWFzJywgby5saXRlcmFsQXJyKHNjaGVtYXMubWFwKHJlZiA9PiByZWYudmFsdWUpKSk7XG4gIH1cblxuICBpZiAoaWQgIT09IG51bGwpIHtcbiAgICBkZWZpbml0aW9uTWFwLnNldCgnaWQnLCBpZCk7XG4gIH1cblxuICBjb25zdCBleHByZXNzaW9uID1cbiAgICAgIG8uaW1wb3J0RXhwcihSMy5kZWZpbmVOZ01vZHVsZSkuY2FsbEZuKFtkZWZpbml0aW9uTWFwLnRvTGl0ZXJhbE1hcCgpXSwgdW5kZWZpbmVkLCB0cnVlKTtcbiAgY29uc3QgdHlwZSA9IGNyZWF0ZU5nTW9kdWxlVHlwZShtZXRhKTtcblxuICByZXR1cm4ge2V4cHJlc3Npb24sIHR5cGUsIHN0YXRlbWVudHN9O1xufVxuXG4vKipcbiAqIFRoaXMgZnVuY3Rpb24gaXMgdXNlZCBpbiBKSVQgbW9kZSB0byBnZW5lcmF0ZSB0aGUgY2FsbCB0byBgybXJtWRlZmluZU5nTW9kdWxlKClgIGZyb20gYSBjYWxsIHRvXG4gKiBgybXJtW5nRGVjbGFyZU5nTW9kdWxlKClgLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY29tcGlsZU5nTW9kdWxlRGVjbGFyYXRpb25FeHByZXNzaW9uKG1ldGE6IFIzRGVjbGFyZU5nTW9kdWxlRmFjYWRlKTogby5FeHByZXNzaW9uIHtcbiAgY29uc3QgZGVmaW5pdGlvbk1hcCA9IG5ldyBEZWZpbml0aW9uTWFwPFIzTmdNb2R1bGVEZWZNYXA+KCk7XG4gIGRlZmluaXRpb25NYXAuc2V0KCd0eXBlJywgbmV3IG8uV3JhcHBlZE5vZGVFeHByKG1ldGEudHlwZSkpO1xuICBpZiAobWV0YS5ib290c3RyYXAgIT09IHVuZGVmaW5lZCkge1xuICAgIGRlZmluaXRpb25NYXAuc2V0KCdib290c3RyYXAnLCBuZXcgby5XcmFwcGVkTm9kZUV4cHIobWV0YS5ib290c3RyYXApKTtcbiAgfVxuICBpZiAobWV0YS5kZWNsYXJhdGlvbnMgIT09IHVuZGVmaW5lZCkge1xuICAgIGRlZmluaXRpb25NYXAuc2V0KCdkZWNsYXJhdGlvbnMnLCBuZXcgby5XcmFwcGVkTm9kZUV4cHIobWV0YS5kZWNsYXJhdGlvbnMpKTtcbiAgfVxuICBpZiAobWV0YS5pbXBvcnRzICE9PSB1bmRlZmluZWQpIHtcbiAgICBkZWZpbml0aW9uTWFwLnNldCgnaW1wb3J0cycsIG5ldyBvLldyYXBwZWROb2RlRXhwcihtZXRhLmltcG9ydHMpKTtcbiAgfVxuICBpZiAobWV0YS5leHBvcnRzICE9PSB1bmRlZmluZWQpIHtcbiAgICBkZWZpbml0aW9uTWFwLnNldCgnZXhwb3J0cycsIG5ldyBvLldyYXBwZWROb2RlRXhwcihtZXRhLmV4cG9ydHMpKTtcbiAgfVxuICBpZiAobWV0YS5zY2hlbWFzICE9PSB1bmRlZmluZWQpIHtcbiAgICBkZWZpbml0aW9uTWFwLnNldCgnc2NoZW1hcycsIG5ldyBvLldyYXBwZWROb2RlRXhwcihtZXRhLnNjaGVtYXMpKTtcbiAgfVxuICBpZiAobWV0YS5pZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgZGVmaW5pdGlvbk1hcC5zZXQoJ2lkJywgbmV3IG8uV3JhcHBlZE5vZGVFeHByKG1ldGEuaWQpKTtcbiAgfVxuICByZXR1cm4gby5pbXBvcnRFeHByKFIzLmRlZmluZU5nTW9kdWxlKS5jYWxsRm4oW2RlZmluaXRpb25NYXAudG9MaXRlcmFsTWFwKCldKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZU5nTW9kdWxlVHlwZShcbiAgICB7dHlwZTogbW9kdWxlVHlwZSwgZGVjbGFyYXRpb25zLCBpbXBvcnRzLCBleHBvcnRzfTogUjNOZ01vZHVsZU1ldGFkYXRhKTogby5FeHByZXNzaW9uVHlwZSB7XG4gIHJldHVybiBuZXcgby5FeHByZXNzaW9uVHlwZShvLmltcG9ydEV4cHIoUjMuTmdNb2R1bGVEZWNsYXJhdGlvbiwgW1xuICAgIG5ldyBvLkV4cHJlc3Npb25UeXBlKG1vZHVsZVR5cGUudHlwZSksIHR1cGxlVHlwZU9mKGRlY2xhcmF0aW9ucyksIHR1cGxlVHlwZU9mKGltcG9ydHMpLFxuICAgIHR1cGxlVHlwZU9mKGV4cG9ydHMpXG4gIF0pKTtcbn1cblxuLyoqXG4gKiBHZW5lcmF0ZXMgYSBmdW5jdGlvbiBjYWxsIHRvIGDJtcm1c2V0TmdNb2R1bGVTY29wZWAgd2l0aCBhbGwgbmVjZXNzYXJ5IGluZm9ybWF0aW9uIHNvIHRoYXQgdGhlXG4gKiB0cmFuc2l0aXZlIG1vZHVsZSBzY29wZSBjYW4gYmUgY29tcHV0ZWQgZHVyaW5nIHJ1bnRpbWUgaW4gSklUIG1vZGUuIFRoaXMgY2FsbCBpcyBtYXJrZWQgcHVyZVxuICogc3VjaCB0aGF0IHRoZSByZWZlcmVuY2VzIHRvIGRlY2xhcmF0aW9ucywgaW1wb3J0cyBhbmQgZXhwb3J0cyBtYXkgYmUgZWxpZGVkIGNhdXNpbmcgdGhlc2VcbiAqIHN5bWJvbHMgdG8gYmVjb21lIHRyZWUtc2hha2VhYmxlLlxuICovXG5mdW5jdGlvbiBnZW5lcmF0ZVNldE5nTW9kdWxlU2NvcGVDYWxsKG1ldGE6IFIzTmdNb2R1bGVNZXRhZGF0YSk6IG8uU3RhdGVtZW50fG51bGwge1xuICBjb25zdCB7YWRqYWNlbnRUeXBlOiBtb2R1bGVUeXBlLCBkZWNsYXJhdGlvbnMsIGltcG9ydHMsIGV4cG9ydHMsIGNvbnRhaW5zRm9yd2FyZERlY2xzfSA9IG1ldGE7XG5cbiAgY29uc3Qgc2NvcGVNYXAgPSBuZXcgRGVmaW5pdGlvbk1hcDxcbiAgICAgIHtkZWNsYXJhdGlvbnM6IG8uRXhwcmVzc2lvbiwgaW1wb3J0czogby5FeHByZXNzaW9uLCBleHBvcnRzOiBvLkV4cHJlc3Npb259PigpO1xuXG4gIGlmIChkZWNsYXJhdGlvbnMubGVuZ3RoID4gMCkge1xuICAgIHNjb3BlTWFwLnNldCgnZGVjbGFyYXRpb25zJywgcmVmc1RvQXJyYXkoZGVjbGFyYXRpb25zLCBjb250YWluc0ZvcndhcmREZWNscykpO1xuICB9XG5cbiAgaWYgKGltcG9ydHMubGVuZ3RoID4gMCkge1xuICAgIHNjb3BlTWFwLnNldCgnaW1wb3J0cycsIHJlZnNUb0FycmF5KGltcG9ydHMsIGNvbnRhaW5zRm9yd2FyZERlY2xzKSk7XG4gIH1cblxuICBpZiAoZXhwb3J0cy5sZW5ndGggPiAwKSB7XG4gICAgc2NvcGVNYXAuc2V0KCdleHBvcnRzJywgcmVmc1RvQXJyYXkoZXhwb3J0cywgY29udGFpbnNGb3J3YXJkRGVjbHMpKTtcbiAgfVxuXG4gIGlmIChPYmplY3Qua2V5cyhzY29wZU1hcC52YWx1ZXMpLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLy8gc2V0TmdNb2R1bGVTY29wZSguLi4pXG4gIGNvbnN0IGZuQ2FsbCA9IG5ldyBvLkludm9rZUZ1bmN0aW9uRXhwcihcbiAgICAgIC8qIGZuICovIG8uaW1wb3J0RXhwcihSMy5zZXROZ01vZHVsZVNjb3BlKSxcbiAgICAgIC8qIGFyZ3MgKi9bbW9kdWxlVHlwZSwgc2NvcGVNYXAudG9MaXRlcmFsTWFwKCldKTtcblxuICAvLyAobmdKaXRNb2RlIGd1YXJkKSAmJiBzZXROZ01vZHVsZVNjb3BlKC4uLilcbiAgY29uc3QgZ3VhcmRlZENhbGwgPSBqaXRPbmx5R3VhcmRlZEV4cHJlc3Npb24oZm5DYWxsKTtcblxuICAvLyBmdW5jdGlvbigpIHsgKG5nSml0TW9kZSBndWFyZCkgJiYgc2V0TmdNb2R1bGVTY29wZSguLi4pOyB9XG4gIGNvbnN0IGlpZmUgPSBuZXcgby5GdW5jdGlvbkV4cHIoXG4gICAgICAvKiBwYXJhbXMgKi9bXSxcbiAgICAgIC8qIHN0YXRlbWVudHMgKi9bZ3VhcmRlZENhbGwudG9TdG10KCldKTtcblxuICAvLyAoZnVuY3Rpb24oKSB7IChuZ0ppdE1vZGUgZ3VhcmQpICYmIHNldE5nTW9kdWxlU2NvcGUoLi4uKTsgfSkoKVxuICBjb25zdCBpaWZlQ2FsbCA9IG5ldyBvLkludm9rZUZ1bmN0aW9uRXhwcihcbiAgICAgIC8qIGZuICovIGlpZmUsXG4gICAgICAvKiBhcmdzICovW10pO1xuXG4gIHJldHVybiBpaWZlQ2FsbC50b1N0bXQoKTtcbn1cblxuZnVuY3Rpb24gdHVwbGVUeXBlT2YoZXhwOiBSM1JlZmVyZW5jZVtdKTogby5UeXBlIHtcbiAgY29uc3QgdHlwZXMgPSBleHAubWFwKHJlZiA9PiBvLnR5cGVvZkV4cHIocmVmLnR5cGUpKTtcbiAgcmV0dXJuIGV4cC5sZW5ndGggPiAwID8gby5leHByZXNzaW9uVHlwZShvLmxpdGVyYWxBcnIodHlwZXMpKSA6IG8uTk9ORV9UWVBFO1xufVxuIl19