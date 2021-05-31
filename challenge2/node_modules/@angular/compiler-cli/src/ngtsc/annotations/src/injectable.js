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
        define("@angular/compiler-cli/src/ngtsc/annotations/src/injectable", ["require", "exports", "tslib", "@angular/compiler", "typescript", "@angular/compiler-cli/src/ngtsc/diagnostics", "@angular/compiler-cli/src/ngtsc/perf", "@angular/compiler-cli/src/ngtsc/reflection", "@angular/compiler-cli/src/ngtsc/transform", "@angular/compiler-cli/src/ngtsc/annotations/src/factory", "@angular/compiler-cli/src/ngtsc/annotations/src/metadata", "@angular/compiler-cli/src/ngtsc/annotations/src/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InjectableDecoratorHandler = void 0;
    var tslib_1 = require("tslib");
    var compiler_1 = require("@angular/compiler");
    var ts = require("typescript");
    var diagnostics_1 = require("@angular/compiler-cli/src/ngtsc/diagnostics");
    var perf_1 = require("@angular/compiler-cli/src/ngtsc/perf");
    var reflection_1 = require("@angular/compiler-cli/src/ngtsc/reflection");
    var transform_1 = require("@angular/compiler-cli/src/ngtsc/transform");
    var factory_1 = require("@angular/compiler-cli/src/ngtsc/annotations/src/factory");
    var metadata_1 = require("@angular/compiler-cli/src/ngtsc/annotations/src/metadata");
    var util_1 = require("@angular/compiler-cli/src/ngtsc/annotations/src/util");
    /**
     * Adapts the `compileInjectable` compiler for `@Injectable` decorators to the Ivy compiler.
     */
    var InjectableDecoratorHandler = /** @class */ (function () {
        function InjectableDecoratorHandler(reflector, isCore, strictCtorDeps, injectableRegistry, perf, 
        /**
         * What to do if the injectable already contains a ɵprov property.
         *
         * If true then an error diagnostic is reported.
         * If false then there is no error and a new ɵprov property is not added.
         */
        errorOnDuplicateProv) {
            if (errorOnDuplicateProv === void 0) { errorOnDuplicateProv = true; }
            this.reflector = reflector;
            this.isCore = isCore;
            this.strictCtorDeps = strictCtorDeps;
            this.injectableRegistry = injectableRegistry;
            this.perf = perf;
            this.errorOnDuplicateProv = errorOnDuplicateProv;
            this.precedence = transform_1.HandlerPrecedence.SHARED;
            this.name = InjectableDecoratorHandler.name;
        }
        InjectableDecoratorHandler.prototype.detect = function (node, decorators) {
            if (!decorators) {
                return undefined;
            }
            var decorator = util_1.findAngularDecorator(decorators, 'Injectable', this.isCore);
            if (decorator !== undefined) {
                return {
                    trigger: decorator.node,
                    decorator: decorator,
                    metadata: decorator,
                };
            }
            else {
                return undefined;
            }
        };
        InjectableDecoratorHandler.prototype.analyze = function (node, decorator) {
            this.perf.eventCount(perf_1.PerfEvent.AnalyzeInjectable);
            var meta = extractInjectableMetadata(node, decorator, this.reflector);
            var decorators = this.reflector.getDecoratorsOfDeclaration(node);
            return {
                analysis: {
                    meta: meta,
                    ctorDeps: extractInjectableCtorDeps(node, meta, decorator, this.reflector, this.isCore, this.strictCtorDeps),
                    classMetadata: metadata_1.extractClassMetadata(node, this.reflector, this.isCore),
                    // Avoid generating multiple factories if a class has
                    // more Angular decorators, apart from Injectable.
                    needsFactory: !decorators ||
                        decorators.every(function (current) { return !util_1.isAngularCore(current) || current.name === 'Injectable'; })
                },
            };
        };
        InjectableDecoratorHandler.prototype.symbol = function () {
            return null;
        };
        InjectableDecoratorHandler.prototype.register = function (node) {
            this.injectableRegistry.registerInjectable(node);
        };
        InjectableDecoratorHandler.prototype.compileFull = function (node, analysis) {
            return this.compile(factory_1.compileNgFactoryDefField, function (meta) { return compiler_1.compileInjectable(meta, false); }, compiler_1.compileClassMetadata, node, analysis);
        };
        InjectableDecoratorHandler.prototype.compilePartial = function (node, analysis) {
            return this.compile(factory_1.compileDeclareFactory, compiler_1.compileDeclareInjectableFromMetadata, compiler_1.compileDeclareClassMetadata, node, analysis);
        };
        InjectableDecoratorHandler.prototype.compile = function (compileFactoryFn, compileInjectableFn, compileClassMetadataFn, node, analysis) {
            var results = [];
            if (analysis.needsFactory) {
                var meta = analysis.meta;
                var factoryRes = compileFactoryFn(util_1.toFactoryMetadata(tslib_1.__assign(tslib_1.__assign({}, meta), { deps: analysis.ctorDeps }), compiler_1.FactoryTarget.Injectable));
                if (analysis.classMetadata !== null) {
                    factoryRes.statements.push(compileClassMetadataFn(analysis.classMetadata).toStmt());
                }
                results.push(factoryRes);
            }
            var ɵprov = this.reflector.getMembersOfClass(node).find(function (member) { return member.name === 'ɵprov'; });
            if (ɵprov !== undefined && this.errorOnDuplicateProv) {
                throw new diagnostics_1.FatalDiagnosticError(diagnostics_1.ErrorCode.INJECTABLE_DUPLICATE_PROV, ɵprov.nameNode || ɵprov.node || node, 'Injectables cannot contain a static ɵprov property, because the compiler is going to generate one.');
            }
            if (ɵprov === undefined) {
                // Only add a new ɵprov if there is not one already
                var res = compileInjectableFn(analysis.meta);
                results.push({ name: 'ɵprov', initializer: res.expression, statements: res.statements, type: res.type });
            }
            return results;
        };
        return InjectableDecoratorHandler;
    }());
    exports.InjectableDecoratorHandler = InjectableDecoratorHandler;
    /**
     * Read metadata from the `@Injectable` decorator and produce the `IvyInjectableMetadata`, the
     * input metadata needed to run `compileInjectable`.
     *
     * A `null` return value indicates this is @Injectable has invalid data.
     */
    function extractInjectableMetadata(clazz, decorator, reflector) {
        var name = clazz.name.text;
        var type = util_1.wrapTypeReference(reflector, clazz);
        var internalType = new compiler_1.WrappedNodeExpr(reflector.getInternalNameOfClass(clazz));
        var typeArgumentCount = reflector.getGenericArityOfClass(clazz) || 0;
        if (decorator.args === null) {
            throw new diagnostics_1.FatalDiagnosticError(diagnostics_1.ErrorCode.DECORATOR_NOT_CALLED, reflection_1.Decorator.nodeForError(decorator), '@Injectable must be called');
        }
        if (decorator.args.length === 0) {
            return {
                name: name,
                type: type,
                typeArgumentCount: typeArgumentCount,
                internalType: internalType,
                providedIn: compiler_1.createR3ProviderExpression(new compiler_1.LiteralExpr(null), false),
            };
        }
        else if (decorator.args.length === 1) {
            var metaNode = decorator.args[0];
            // Firstly make sure the decorator argument is an inline literal - if not, it's illegal to
            // transport references from one location to another. This is the problem that lowering
            // used to solve - if this restriction proves too undesirable we can re-implement lowering.
            if (!ts.isObjectLiteralExpression(metaNode)) {
                throw new diagnostics_1.FatalDiagnosticError(diagnostics_1.ErrorCode.DECORATOR_ARG_NOT_LITERAL, metaNode, "@Injectable argument must be an object literal");
            }
            // Resolve the fields of the literal into a map of field name to expression.
            var meta = reflection_1.reflectObjectLiteral(metaNode);
            var providedIn = meta.has('providedIn') ?
                getProviderExpression(meta.get('providedIn'), reflector) :
                compiler_1.createR3ProviderExpression(new compiler_1.LiteralExpr(null), false);
            var deps = undefined;
            if ((meta.has('useClass') || meta.has('useFactory')) && meta.has('deps')) {
                var depsExpr = meta.get('deps');
                if (!ts.isArrayLiteralExpression(depsExpr)) {
                    throw new diagnostics_1.FatalDiagnosticError(diagnostics_1.ErrorCode.VALUE_NOT_LITERAL, depsExpr, "@Injectable deps metadata must be an inline array");
                }
                deps = depsExpr.elements.map(function (dep) { return getDep(dep, reflector); });
            }
            var result = { name: name, type: type, typeArgumentCount: typeArgumentCount, internalType: internalType, providedIn: providedIn };
            if (meta.has('useValue')) {
                result.useValue = getProviderExpression(meta.get('useValue'), reflector);
            }
            else if (meta.has('useExisting')) {
                result.useExisting = getProviderExpression(meta.get('useExisting'), reflector);
            }
            else if (meta.has('useClass')) {
                result.useClass = getProviderExpression(meta.get('useClass'), reflector);
                result.deps = deps;
            }
            else if (meta.has('useFactory')) {
                result.useFactory = new compiler_1.WrappedNodeExpr(meta.get('useFactory'));
                result.deps = deps;
            }
            return result;
        }
        else {
            throw new diagnostics_1.FatalDiagnosticError(diagnostics_1.ErrorCode.DECORATOR_ARITY_WRONG, decorator.args[2], 'Too many arguments to @Injectable');
        }
    }
    /**
     * Get the `R3ProviderExpression` for this `expression`.
     *
     * The `useValue`, `useExisting` and `useClass` properties might be wrapped in a `ForwardRef`, which
     * needs to be unwrapped. This function will do that unwrapping and set a flag on the returned
     * object to indicate whether the value needed unwrapping.
     */
    function getProviderExpression(expression, reflector) {
        var forwardRefValue = util_1.tryUnwrapForwardRef(expression, reflector);
        return compiler_1.createR3ProviderExpression(new compiler_1.WrappedNodeExpr(forwardRefValue !== null && forwardRefValue !== void 0 ? forwardRefValue : expression), forwardRefValue !== null);
    }
    function extractInjectableCtorDeps(clazz, meta, decorator, reflector, isCore, strictCtorDeps) {
        if (decorator.args === null) {
            throw new diagnostics_1.FatalDiagnosticError(diagnostics_1.ErrorCode.DECORATOR_NOT_CALLED, reflection_1.Decorator.nodeForError(decorator), '@Injectable must be called');
        }
        var ctorDeps = null;
        if (decorator.args.length === 0) {
            // Ideally, using @Injectable() would have the same effect as using @Injectable({...}), and be
            // subject to the same validation. However, existing Angular code abuses @Injectable, applying
            // it to things like abstract classes with constructors that were never meant for use with
            // Angular's DI.
            //
            // To deal with this, @Injectable() without an argument is more lenient, and if the
            // constructor signature does not work for DI then a factory definition (ɵfac) that throws is
            // generated.
            if (strictCtorDeps) {
                ctorDeps = util_1.getValidConstructorDependencies(clazz, reflector, isCore);
            }
            else {
                ctorDeps =
                    util_1.unwrapConstructorDependencies(util_1.getConstructorDependencies(clazz, reflector, isCore));
            }
            return ctorDeps;
        }
        else if (decorator.args.length === 1) {
            var rawCtorDeps = util_1.getConstructorDependencies(clazz, reflector, isCore);
            if (strictCtorDeps && meta.useValue === undefined && meta.useExisting === undefined &&
                meta.useClass === undefined && meta.useFactory === undefined) {
                // Since use* was not provided, validate the deps according to strictCtorDeps.
                ctorDeps = util_1.validateConstructorDependencies(clazz, rawCtorDeps);
            }
            else {
                ctorDeps = util_1.unwrapConstructorDependencies(rawCtorDeps);
            }
        }
        return ctorDeps;
    }
    function getDep(dep, reflector) {
        var meta = {
            token: new compiler_1.WrappedNodeExpr(dep),
            attributeNameType: null,
            host: false,
            optional: false,
            self: false,
            skipSelf: false,
        };
        function maybeUpdateDecorator(dec, reflector, token) {
            var source = reflector.getImportOfIdentifier(dec);
            if (source === null || source.from !== '@angular/core') {
                return;
            }
            switch (source.name) {
                case 'Inject':
                    if (token !== undefined) {
                        meta.token = new compiler_1.WrappedNodeExpr(token);
                    }
                    break;
                case 'Optional':
                    meta.optional = true;
                    break;
                case 'SkipSelf':
                    meta.skipSelf = true;
                    break;
                case 'Self':
                    meta.self = true;
                    break;
            }
        }
        if (ts.isArrayLiteralExpression(dep)) {
            dep.elements.forEach(function (el) {
                if (ts.isIdentifier(el)) {
                    maybeUpdateDecorator(el, reflector);
                }
                else if (ts.isNewExpression(el) && ts.isIdentifier(el.expression)) {
                    var token = el.arguments && el.arguments.length > 0 && el.arguments[0] || undefined;
                    maybeUpdateDecorator(el.expression, reflector, token);
                }
            });
        }
        return meta;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5qZWN0YWJsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvbmd0c2MvYW5ub3RhdGlvbnMvc3JjL2luamVjdGFibGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUVILDhDQUE4VztJQUM5VywrQkFBaUM7SUFFakMsMkVBQWtFO0lBRWxFLDZEQUFtRDtJQUNuRCx5RUFBbUc7SUFDbkcsdUVBQWlIO0lBRWpILG1GQUE0RjtJQUM1RixxRkFBZ0Q7SUFDaEQsNkVBQW1QO0lBU25QOztPQUVHO0lBQ0g7UUFFRSxvQ0FDWSxTQUF5QixFQUFVLE1BQWUsRUFBVSxjQUF1QixFQUNuRixrQkFBMkMsRUFBVSxJQUFrQjtRQUMvRTs7Ozs7V0FLRztRQUNLLG9CQUEyQjtZQUEzQixxQ0FBQSxFQUFBLDJCQUEyQjtZQVIzQixjQUFTLEdBQVQsU0FBUyxDQUFnQjtZQUFVLFdBQU0sR0FBTixNQUFNLENBQVM7WUFBVSxtQkFBYyxHQUFkLGNBQWMsQ0FBUztZQUNuRix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQXlCO1lBQVUsU0FBSSxHQUFKLElBQUksQ0FBYztZQU92RSx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQU87WUFFOUIsZUFBVSxHQUFHLDZCQUFpQixDQUFDLE1BQU0sQ0FBQztZQUN0QyxTQUFJLEdBQUcsMEJBQTBCLENBQUMsSUFBSSxDQUFDO1FBSE4sQ0FBQztRQUszQywyQ0FBTSxHQUFOLFVBQU8sSUFBc0IsRUFBRSxVQUE0QjtZQUN6RCxJQUFJLENBQUMsVUFBVSxFQUFFO2dCQUNmLE9BQU8sU0FBUyxDQUFDO2FBQ2xCO1lBQ0QsSUFBTSxTQUFTLEdBQUcsMkJBQW9CLENBQUMsVUFBVSxFQUFFLFlBQVksRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDOUUsSUFBSSxTQUFTLEtBQUssU0FBUyxF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QVEsQ0FBQyxPQUFPLENBQUMsVUFBQSxFQUFFO2dCQUNyQixJQUFJLEVBQUUsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLEVBQUU7b0JBQ3ZCLG9CQUFvQixDQUFDLEVBQUUsRUFBRSxTQUFTLENBQUMsQ0FBQztpQkFDckM7cUJBQU0sSUFBSSxFQUFFLENBQUMsZUFBZSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxFQUFFO29CQUNuRSxJQUFNLEtBQUssR0FBRyxFQUFFLENBQUMsU0FBUyxJQUFJLEVBQUUsQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLFNBQVMsQ0FBQztvQkFDdEYsb0JBQW9CLENBQUMsRUFBRSxDQUFDLFVBQVUsRUFBRSxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUM7aUJBQ3ZEO1lBQ0gsQ0FBQyxDQUFDLENBQUM7U0FDSjtRQUNELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2NvbXBpbGVDbGFzc01ldGFkYXRhLCBDb21waWxlQ2xhc3NNZXRhZGF0YUZuLCBjb21waWxlRGVjbGFyZUNsYXNzTWV0YWRhdGEsIGNvbXBpbGVEZWNsYXJlSW5qZWN0YWJsZUZyb21NZXRhZGF0YSwgY29tcGlsZUluamVjdGFibGUsIGNyZWF0ZVIzUHJvdmlkZXJFeHByZXNzaW9uLCBFeHByZXNzaW9uLCBGYWN0b3J5VGFyZ2V0LCBMaXRlcmFsRXhwciwgUjNDbGFzc01ldGFkYXRhLCBSM0NvbXBpbGVkRXhwcmVzc2lvbiwgUjNEZXBlbmRlbmN5TWV0YWRhdGEsIFIzSW5qZWN0YWJsZU1ldGFkYXRhLCBSM1Byb3ZpZGVyRXhwcmVzc2lvbiwgU3RhdGVtZW50LCBXcmFwcGVkTm9kZUV4cHJ9IGZyb20gJ0Bhbmd1bGFyL2NvbXBpbGVyJztcbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuXG5pbXBvcnQge0Vycm9yQ29kZSwgRmF0YWxEaWFnbm9zdGljRXJyb3J9IGZyb20gJy4uLy4uL2RpYWdub3N0aWNzJztcbmltcG9ydCB7SW5qZWN0YWJsZUNsYXNzUmVnaXN0cnl9IGZyb20gJy4uLy4uL21ldGFkYXRhJztcbmltcG9ydCB7UGVyZkV2ZW50LCBQZXJmUmVjb3JkZXJ9IGZyb20gJy4uLy4uL3BlcmYnO1xuaW1wb3J0IHtDbGFzc0RlY2xhcmF0aW9uLCBEZWNvcmF0b3IsIFJlZmxlY3Rpb25Ib3N0LCByZWZsZWN0T2JqZWN0TGl0ZXJhbH0gZnJvbSAnLi4vLi4vcmVmbGVjdGlvbic7XG5pbXBvcnQge0FuYWx5c2lzT3V0cHV0LCBDb21waWxlUmVzdWx0LCBEZWNvcmF0b3JIYW5kbGVyLCBEZXRlY3RSZXN1bHQsIEhhbmRsZXJQcmVjZWRlbmNlfSBmcm9tICcuLi8uLi90cmFuc2Zvcm0nO1xuXG5pbXBvcnQge2NvbXBpbGVEZWNsYXJlRmFjdG9yeSwgQ29tcGlsZUZhY3RvcnlGbiwgY29tcGlsZU5nRmFjdG9yeURlZkZpZWxkfSBmcm9tICcuL2ZhY3RvcnknO1xuaW1wb3J0IHtleHRyYWN0Q2xhc3NNZXRhZGF0YX0gZnJvbSAnLi9tZXRhZGF0YSc7XG5pbXBvcnQge2ZpbmRBbmd1bGFyRGVjb3JhdG9yLCBnZXRDb25zdHJ1Y3RvckRlcGVuZGVuY2llcywgZ2V0VmFsaWRDb25zdHJ1Y3RvckRlcGVuZGVuY2llcywgaXNBbmd1bGFyQ29yZSwgdG9GYWN0b3J5TWV0YWRhdGEsIHRyeVVud3JhcEZvcndhcmRSZWYsIHVud3JhcENvbnN0cnVjdG9yRGVwZW5kZW5jaWVzLCB2YWxpZGF0ZUNvbnN0cnVjdG9yRGVwZW5kZW5jaWVzLCB3cmFwVHlwZVJlZmVyZW5jZX0gZnJvbSAnLi91dGlsJztcblxuZXhwb3J0IGludGVyZmFjZSBJbmplY3RhYmxlSGFuZGxlckRhdGEge1xuICBtZXRhOiBSM0luamVjdGFibGVNZXRhZGF0YTtcbiAgY2xhc3NNZXRhZGF0YTogUjNDbGFzc01ldGFkYXRhfG51bGw7XG4gIGN0b3JEZXBzOiBSM0RlcGVuZGVuY3lNZXRhZGF0YVtdfCdpbnZhbGlkJ3xudWxsO1xuICBuZWVkc0ZhY3Rvcnk6IGJvb2xlYW47XG59XG5cbi8qKlxuICogQWRhcHRzIHRoZSBgY29tcGlsZUluamVjdGFibGVgIGNvbXBpbGVyIGZvciBgQEluamVjdGFibGVgIGRlY29yYXRvcnMgdG8gdGhlIEl2eSBjb21waWxlci5cbiAqL1xuZXhwb3J0IGNsYXNzIEluamVjdGFibGVEZWNvcmF0b3JIYW5kbGVyIGltcGxlbWVudHNcbiAgICBEZWNvcmF0b3JIYW5kbGVyPERlY29yYXRvciwgSW5qZWN0YWJsZUhhbmRsZXJEYXRhLCBudWxsLCB1bmtub3duPiB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSByZWZsZWN0b3I6IFJlZmxlY3Rpb25Ib3N0LCBwcml2YXRlIGlzQ29yZTogYm9vbGVhbiwgcHJpdmF0ZSBzdHJpY3RDdG9yRGVwczogYm9vbGVhbixcbiAgICAgIHByaXZhdGUgaW5qZWN0YWJsZVJlZ2lzdHJ5OiBJbmplY3RhYmxlQ2xhc3NSZWdpc3RyeSwgcHJpdmF0ZSBwZXJmOiBQZXJmUmVjb3JkZXIsXG4gICAgICAvKipcbiAgICAgICAqIFdoYXQgdG8gZG8gaWYgdGhlIGluamVjdGFibGUgYWxyZWFkeSBjb250YWlucyBhIMm1cHJvdiBwcm9wZXJ0eS5cbiAgICAgICAqXG4gICAgICAgKiBJZiB0cnVlIHRoZW4gYW4gZXJyb3IgZGlhZ25vc3RpYyBpcyByZXBvcnRlZC5cbiAgICAgICAqIElmIGZhbHNlIHRoZW4gdGhlcmUgaXMgbm8gZXJyb3IgYW5kIGEgbmV3IMm1cHJvdiBwcm9wZXJ0eSBpcyBub3QgYWRkZWQuXG4gICAgICAgKi9cbiAgICAgIHByaXZhdGUgZXJyb3JPbkR1cGxpY2F0ZVByb3YgPSB0cnVlKSB7fVxuXG4gIHJlYWRvbmx5IHByZWNlZGVuY2UgPSBIYW5kbGVyUHJlY2VkZW5jZS5TSEFSRUQ7XG4gIHJlYWRvbmx5IG5hbWUgPSBJbmplY3RhYmxlRGVjb3JhdG9ySGFuZGxlci5uYW1lO1xuXG4gIGRldGVjdChub2RlOiBDbGFzc0RlY2xhcmF0aW9uLCBkZWNvcmF0b3JzOiBEZWNvcmF0b3JbXXxudWxsKTogRGV0ZWN0UmVzdWx0PERlY29yYXRvcj58dW5kZWZpbmVkIHtcbiAgICBpZiAoIWRlY29yYXRvcnMpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGNvbnN0IGRlY29yYXRvciA9IGZpbmRBbmd1bGFyRGVjb3JhdG9yKGRlY29yYXRvcnMsICdJbmplY3RhYmxlJywgdGhpcy5pc0NvcmUpO1xuICAgIGlmIChkZWNvcmF0b3IgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdHJpZ2dlcjogZGVjb3JhdG9yLm5vZGUsXG4gICAgICAgIGRlY29yYXRvcjogZGVjb3JhdG9yLFxuICAgICAgICBtZXRhZGF0YTogZGVjb3JhdG9yLFxuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gIH1cblxuICBhbmFseXplKG5vZGU6IENsYXNzRGVjbGFyYXRpb24sIGRlY29yYXRvcjogUmVhZG9ubHk8RGVjb3JhdG9yPik6XG4gICAgICBBbmFseXNpc091dHB1dDxJbmplY3RhYmxlSGFuZGxlckRhdGE+IHtcbiAgICB0aGlzLnBlcmYuZXZlbnRDb3VudChQZXJmRXZlbnQuQW5hbHl6ZUluamVjdGFibGUpO1xuXG4gICAgY29uc3QgbWV0YSA9IGV4dHJhY3RJbmplY3RhYmxlTWV0YWRhdGEobm9kZSwgZGVjb3JhdG9yLCB0aGlzLnJlZmxlY3Rvcik7XG4gICAgY29uc3QgZGVjb3JhdG9ycyA9IHRoaXMucmVmbGVjdG9yLmdldERlY29yYXRvcnNPZkRlY2xhcmF0aW9uKG5vZGUpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGFuYWx5c2lzOiB7XG4gICAgICAgIG1ldGEsXG4gICAgICAgIGN0b3JEZXBzOiBleHRyYWN0SW5qZWN0YWJsZUN0b3JEZXBzKFxuICAgICAgICAgICAgbm9kZSwgbWV0YSwgZGVjb3JhdG9yLCB0aGlzLnJlZmxlY3RvciwgdGhpcy5pc0NvcmUsIHRoaXMuc3RyaWN0Q3RvckRlcHMpLFxuICAgICAgICBjbGFzc01ldGFkYXRhOiBleHRyYWN0Q2xhc3NNZXRhZGF0YShub2RlLCB0aGlzLnJlZmxlY3RvciwgdGhpcy5pc0NvcmUpLFxuICAgICAgICAvLyBBdm9pZCBnZW5lcmF0aW5nIG11bHRpcGxlIGZhY3RvcmllcyBpZiBhIGNsYXNzIGhhc1xuICAgICAgICAvLyBtb3JlIEFuZ3VsYXIgZGVjb3JhdG9ycywgYXBhcnQgZnJvbSBJbmplY3RhYmxlLlxuICAgICAgICBuZWVkc0ZhY3Rvcnk6ICFkZWNvcmF0b3JzIHx8XG4gICAgICAgICAgICBkZWNvcmF0b3JzLmV2ZXJ5KGN1cnJlbnQgPT4gIWlzQW5ndWxhckNvcmUoY3VycmVudCkgfHwgY3VycmVudC5uYW1lID09PSAnSW5qZWN0YWJsZScpXG4gICAgICB9LFxuICAgIH07XG4gIH1cblxuICBzeW1ib2woKTogbnVsbCB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICByZWdpc3Rlcihub2RlOiBDbGFzc0RlY2xhcmF0aW9uKTogdm9pZCB7XG4gICAgdGhpcy5pbmplY3RhYmxlUmVnaXN0cnkucmVnaXN0ZXJJbmplY3RhYmxlKG5vZGUpO1xuICB9XG5cbiAgY29tcGlsZUZ1bGwobm9kZTogQ2xhc3NEZWNsYXJhdGlvbiwgYW5hbHlzaXM6IFJlYWRvbmx5PEluamVjdGFibGVIYW5kbGVyRGF0YT4pOiBDb21waWxlUmVzdWx0W10ge1xuICAgIHJldHVybiB0aGlzLmNvbXBpbGUoXG4gICAgICAgIGNvbXBpbGVOZ0ZhY3RvcnlEZWZGaWVsZCwgbWV0YSA9PiBjb21waWxlSW5qZWN0YWJsZShtZXRhLCBmYWxzZSksIGNvbXBpbGVDbGFzc01ldGFkYXRhLFxuICAgICAgICBub2RlLCBhbmFseXNpcyk7XG4gIH1cblxuICBjb21waWxlUGFydGlhbChub2RlOiBDbGFzc0RlY2xhcmF0aW9uLCBhbmFseXNpczogUmVhZG9ubHk8SW5qZWN0YWJsZUhhbmRsZXJEYXRhPik6XG4gICAgICBDb21waWxlUmVzdWx0W10ge1xuICAgIHJldHVybiB0aGlzLmNvbXBpbGUoXG4gICAgICAgIGNvbXBpbGVEZWNsYXJlRmFjdG9yeSwgY29tcGlsZURlY2xhcmVJbmplY3RhYmxlRnJvbU1ldGFkYXRhLCBjb21waWxlRGVjbGFyZUNsYXNzTWV0YWRhdGEsXG4gICAgICAgIG5vZGUsIGFuYWx5c2lzKTtcbiAgfVxuXG4gIHByaXZhdGUgY29tcGlsZShcbiAgICAgIGNvbXBpbGVGYWN0b3J5Rm46IENvbXBpbGVGYWN0b3J5Rm4sXG4gICAgICBjb21waWxlSW5qZWN0YWJsZUZuOiAobWV0YTogUjNJbmplY3RhYmxlTWV0YWRhdGEpID0+IFIzQ29tcGlsZWRFeHByZXNzaW9uLFxuICAgICAgY29tcGlsZUNsYXNzTWV0YWRhdGFGbjogQ29tcGlsZUNsYXNzTWV0YWRhdGFGbiwgbm9kZTogQ2xhc3NEZWNsYXJhdGlvbixcbiAgICAgIGFuYWx5c2lzOiBSZWFkb25seTxJbmplY3RhYmxlSGFuZGxlckRhdGE+KTogQ29tcGlsZVJlc3VsdFtdIHtcbiAgICBjb25zdCByZXN1bHRzOiBDb21waWxlUmVzdWx0W10gPSBbXTtcblxuICAgIGlmIChhbmFseXNpcy5uZWVkc0ZhY3RvcnkpIHtcbiAgICAgIGNvbnN0IG1ldGEgPSBhbmFseXNpcy5tZXRhO1xuICAgICAgY29uc3QgZmFjdG9yeVJlcyA9IGNvbXBpbGVGYWN0b3J5Rm4oXG4gICAgICAgICAgdG9GYWN0b3J5TWV0YWRhdGEoey4uLm1ldGEsIGRlcHM6IGFuYWx5c2lzLmN0b3JEZXBzfSwgRmFjdG9yeVRhcmdldC5JbmplY3RhYmxlKSk7XG4gICAgICBpZiAoYW5hbHlzaXMuY2xhc3NNZXRhZGF0YSAhPT0gbnVsbCkge1xuICAgICAgICBmYWN0b3J5UmVzLnN0YXRlbWVudHMucHVzaChjb21waWxlQ2xhc3NNZXRhZGF0YUZuKGFuYWx5c2lzLmNsYXNzTWV0YWRhdGEpLnRvU3RtdCgpKTtcbiAgICAgIH1cbiAgICAgIHJlc3VsdHMucHVzaChmYWN0b3J5UmVzKTtcbiAgICB9XG5cbiAgICBjb25zdCDJtXByb3YgPSB0aGlzLnJlZmxlY3Rvci5nZXRNZW1iZXJzT2ZDbGFzcyhub2RlKS5maW5kKG1lbWJlciA9PiBtZW1iZXIubmFtZSA9PT0gJ8m1cHJvdicpO1xuICAgIGlmICjJtXByb3YgIT09IHVuZGVmaW5lZCAmJiB0aGlzLmVycm9yT25EdXBsaWNhdGVQcm92KSB7XG4gICAgICB0aHJvdyBuZXcgRmF0YWxEaWFnbm9zdGljRXJyb3IoXG4gICAgICAgICAgRXJyb3JDb2RlLklOSkVDVEFCTEVfRFVQTElDQVRFX1BST1YsIMm1cHJvdi5uYW1lTm9kZSB8fCDJtXByb3Yubm9kZSB8fCBub2RlLFxuICAgICAgICAgICdJbmplY3RhYmxlcyBjYW5ub3QgY29udGFpbiBhIHN0YXRpYyDJtXByb3YgcHJvcGVydHksIGJlY2F1c2UgdGhlIGNvbXBpbGVyIGlzIGdvaW5nIHRvIGdlbmVyYXRlIG9uZS4nKTtcbiAgICB9XG5cbiAgICBpZiAoybVwcm92ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIC8vIE9ubHkgYWRkIGEgbmV3IMm1cHJvdiBpZiB0aGVyZSBpcyBub3Qgb25lIGFscmVhZHlcbiAgICAgIGNvbnN0IHJlcyA9IGNvbXBpbGVJbmplY3RhYmxlRm4oYW5hbHlzaXMubWV0YSk7XG4gICAgICByZXN1bHRzLnB1c2goXG4gICAgICAgICAge25hbWU6ICfJtXByb3YnLCBpbml0aWFsaXplcjogcmVzLmV4cHJlc3Npb24sIHN0YXRlbWVudHM6IHJlcy5zdGF0ZW1lbnRzLCB0eXBlOiByZXMudHlwZX0pO1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHRzO1xuICB9XG59XG5cbi8qKlxuICogUmVhZCBtZXRhZGF0YSBmcm9tIHRoZSBgQEluamVjdGFibGVgIGRlY29yYXRvciBhbmQgcHJvZHVjZSB0aGUgYEl2eUluamVjdGFibGVNZXRhZGF0YWAsIHRoZVxuICogaW5wdXQgbWV0YWRhdGEgbmVlZGVkIHRvIHJ1biBgY29tcGlsZUluamVjdGFibGVgLlxuICpcbiAqIEEgYG51bGxgIHJldHVybiB2YWx1ZSBpbmRpY2F0ZXMgdGhpcyBpcyBASW5qZWN0YWJsZSBoYXMgaW52YWxpZCBkYXRhLlxuICovXG5mdW5jdGlvbiBleHRyYWN0SW5qZWN0YWJsZU1ldGFkYXRhKFxuICAgIGNsYXp6OiBDbGFzc0RlY2xhcmF0aW9uLCBkZWNvcmF0b3I6IERlY29yYXRvcixcbiAgICByZWZsZWN0b3I6IFJlZmxlY3Rpb25Ib3N0KTogUjNJbmplY3RhYmxlTWV0YWRhdGEge1xuICBjb25zdCBuYW1lID0gY2xhenoubmFtZS50ZXh0O1xuICBjb25zdCB0eXBlID0gd3JhcFR5cGVSZWZlcmVuY2UocmVmbGVjdG9yLCBjbGF6eik7XG4gIGNvbnN0IGludGVybmFsVHlwZSA9IG5ldyBXcmFwcGVkTm9kZUV4cHIocmVmbGVjdG9yLmdldEludGVybmFsTmFtZU9mQ2xhc3MoY2xhenopKTtcbiAgY29uc3QgdHlwZUFyZ3VtZW50Q291bnQgPSByZWZsZWN0b3IuZ2V0R2VuZXJpY0FyaXR5T2ZDbGFzcyhjbGF6eikgfHwgMDtcbiAgaWYgKGRlY29yYXRvci5hcmdzID09PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IEZhdGFsRGlhZ25vc3RpY0Vycm9yKFxuICAgICAgICBFcnJvckNvZGUuREVDT1JBVE9SX05PVF9DQUxMRUQsIERlY29yYXRvci5ub2RlRm9yRXJyb3IoZGVjb3JhdG9yKSxcbiAgICAgICAgJ0BJbmplY3RhYmxlIG11c3QgYmUgY2FsbGVkJyk7XG4gIH1cbiAgaWYgKGRlY29yYXRvci5hcmdzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiB7XG4gICAgICBuYW1lLFxuICAgICAgdHlwZSxcbiAgICAgIHR5cGVBcmd1bWVudENvdW50LFxuICAgICAgaW50ZXJuYWxUeXBlLFxuICAgICAgcHJvdmlkZWRJbjogY3JlYXRlUjNQcm92aWRlckV4cHJlc3Npb24obmV3IExpdGVyYWxFeHByKG51bGwpLCBmYWxzZSksXG4gICAgfTtcbiAgfSBlbHNlIGlmIChkZWNvcmF0b3IuYXJncy5sZW5ndGggPT09IDEpIHtcbiAgICBjb25zdCBtZXRhTm9kZSA9IGRlY29yYXRvci5hcmdzWzBdO1xuICAgIC8vIEZpcnN0bHkgbWFrZSBzdXJlIHRoZSBkZWNvcmF0b3IgYXJndW1lbnQgaXMgYW4gaW5saW5lIGxpdGVyYWwgLSBpZiBub3QsIGl0J3MgaWxsZWdhbCB0b1xuICAgIC8vIHRyYW5zcG9ydCByZWZlcmVuY2VzIGZyb20gb25lIGxvY2F0aW9uIHRvIGFub3RoZXIuIFRoaXMgaXMgdGhlIHByb2JsZW0gdGhhdCBsb3dlcmluZ1xuICAgIC8vIHVzZWQgdG8gc29sdmUgLSBpZiB0aGlzIHJlc3RyaWN0aW9uIHByb3ZlcyB0b28gdW5kZXNpcmFibGUgd2UgY2FuIHJlLWltcGxlbWVudCBsb3dlcmluZy5cbiAgICBpZiAoIXRzLmlzT2JqZWN0TGl0ZXJhbEV4cHJlc3Npb24obWV0YU5vZGUpKSB7XG4gICAgICB0aHJvdyBuZXcgRmF0YWxEaWFnbm9zdGljRXJyb3IoXG4gICAgICAgICAgRXJyb3JDb2RlLkRFQ09SQVRPUl9BUkdfTk9UX0xJVEVSQUwsIG1ldGFOb2RlLFxuICAgICAgICAgIGBASW5qZWN0YWJsZSBhcmd1bWVudCBtdXN0IGJlIGFuIG9iamVjdCBsaXRlcmFsYCk7XG4gICAgfVxuXG4gICAgLy8gUmVzb2x2ZSB0aGUgZmllbGRzIG9mIHRoZSBsaXRlcmFsIGludG8gYSBtYXAgb2YgZmllbGQgbmFtZSB0byBleHByZXNzaW9uLlxuICAgIGNvbnN0IG1ldGEgPSByZWZsZWN0T2JqZWN0TGl0ZXJhbChtZXRhTm9kZSk7XG5cbiAgICBjb25zdCBwcm92aWRlZEluID0gbWV0YS5oYXMoJ3Byb3ZpZGVkSW4nKSA/XG4gICAgICAgIGdldFByb3ZpZGVyRXhwcmVzc2lvbihtZXRhLmdldCgncHJvdmlkZWRJbicpISwgcmVmbGVjdG9yKSA6XG4gICAgICAgIGNyZWF0ZVIzUHJvdmlkZXJFeHByZXNzaW9uKG5ldyBMaXRlcmFsRXhwcihudWxsKSwgZmFsc2UpO1xuXG4gICAgbGV0IGRlcHM6IFIzRGVwZW5kZW5jeU1ldGFkYXRhW118dW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIGlmICgobWV0YS5oYXMoJ3VzZUNsYXNzJykgfHwgbWV0YS5oYXMoJ3VzZUZhY3RvcnknKSkgJiYgbWV0YS5oYXMoJ2RlcHMnKSkge1xuICAgICAgY29uc3QgZGVwc0V4cHIgPSBtZXRhLmdldCgnZGVwcycpITtcbiAgICAgIGlmICghdHMuaXNBcnJheUxpdGVyYWxFeHByZXNzaW9uKGRlcHNFeHByKSkge1xuICAgICAgICB0aHJvdyBuZXcgRmF0YWxEaWFnbm9zdGljRXJyb3IoXG4gICAgICAgICAgICBFcnJvckNvZGUuVkFMVUVfTk9UX0xJVEVSQUwsIGRlcHNFeHByLFxuICAgICAgICAgICAgYEBJbmplY3RhYmxlIGRlcHMgbWV0YWRhdGEgbXVzdCBiZSBhbiBpbmxpbmUgYXJyYXlgKTtcbiAgICAgIH1cbiAgICAgIGRlcHMgPSBkZXBzRXhwci5lbGVtZW50cy5tYXAoZGVwID0+IGdldERlcChkZXAsIHJlZmxlY3RvcikpO1xuICAgIH1cblxuICAgIGNvbnN0IHJlc3VsdDogUjNJbmplY3RhYmxlTWV0YWRhdGEgPSB7bmFtZSwgdHlwZSwgdHlwZUFyZ3VtZW50Q291bnQsIGludGVybmFsVHlwZSwgcHJvdmlkZWRJbn07XG4gICAgaWYgKG1ldGEuaGFzKCd1c2VWYWx1ZScpKSB7XG4gICAgICByZXN1bHQudXNlVmFsdWUgPSBnZXRQcm92aWRlckV4cHJlc3Npb24obWV0YS5nZXQoJ3VzZVZhbHVlJykhLCByZWZsZWN0b3IpO1xuICAgIH0gZWxzZSBpZiAobWV0YS5oYXMoJ3VzZUV4aXN0aW5nJykpIHtcbiAgICAgIHJlc3VsdC51c2VFeGlzdGluZyA9IGdldFByb3ZpZGVyRXhwcmVzc2lvbihtZXRhLmdldCgndXNlRXhpc3RpbmcnKSEsIHJlZmxlY3Rvcik7XG4gICAgfSBlbHNlIGlmIChtZXRhLmhhcygndXNlQ2xhc3MnKSkge1xuICAgICAgcmVzdWx0LnVzZUNsYXNzID0gZ2V0UHJvdmlkZXJFeHByZXNzaW9uKG1ldGEuZ2V0KCd1c2VDbGFzcycpISwgcmVmbGVjdG9yKTtcbiAgICAgIHJlc3VsdC5kZXBzID0gZGVwcztcbiAgICB9IGVsc2UgaWYgKG1ldGEuaGFzKCd1c2VGYWN0b3J5JykpIHtcbiAgICAgIHJlc3VsdC51c2VGYWN0b3J5ID0gbmV3IFdyYXBwZWROb2RlRXhwcihtZXRhLmdldCgndXNlRmFjdG9yeScpISk7XG4gICAgICByZXN1bHQuZGVwcyA9IGRlcHM7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEZhdGFsRGlhZ25vc3RpY0Vycm9yKFxuICAgICAgICBFcnJvckNvZGUuREVDT1JBVE9SX0FSSVRZX1dST05HLCBkZWNvcmF0b3IuYXJnc1syXSwgJ1RvbyBtYW55IGFyZ3VtZW50cyB0byBASW5qZWN0YWJsZScpO1xuICB9XG59XG5cbi8qKlxuICogR2V0IHRoZSBgUjNQcm92aWRlckV4cHJlc3Npb25gIGZvciB0aGlzIGBleHByZXNzaW9uYC5cbiAqXG4gKiBUaGUgYHVzZVZhbHVlYCwgYHVzZUV4aXN0aW5nYCBhbmQgYHVzZUNsYXNzYCBwcm9wZXJ0aWVzIG1pZ2h0IGJlIHdyYXBwZWQgaW4gYSBgRm9yd2FyZFJlZmAsIHdoaWNoXG4gKiBuZWVkcyB0byBiZSB1bndyYXBwZWQuIFRoaXMgZnVuY3Rpb24gd2lsbCBkbyB0aGF0IHVud3JhcHBpbmcgYW5kIHNldCBhIGZsYWcgb24gdGhlIHJldHVybmVkXG4gKiBvYmplY3QgdG8gaW5kaWNhdGUgd2hldGhlciB0aGUgdmFsdWUgbmVlZGVkIHVud3JhcHBpbmcuXG4gKi9cbmZ1bmN0aW9uIGdldFByb3ZpZGVyRXhwcmVzc2lvbihcbiAgICBleHByZXNzaW9uOiB0cy5FeHByZXNzaW9uLCByZWZsZWN0b3I6IFJlZmxlY3Rpb25Ib3N0KTogUjNQcm92aWRlckV4cHJlc3Npb24ge1xuICBjb25zdCBmb3J3YXJkUmVmVmFsdWUgPSB0cnlVbndyYXBGb3J3YXJkUmVmKGV4cHJlc3Npb24sIHJlZmxlY3Rvcik7XG4gIHJldHVybiBjcmVhdGVSM1Byb3ZpZGVyRXhwcmVzc2lvbihcbiAgICAgIG5ldyBXcmFwcGVkTm9kZUV4cHIoZm9yd2FyZFJlZlZhbHVlID8/IGV4cHJlc3Npb24pLCBmb3J3YXJkUmVmVmFsdWUgIT09IG51bGwpO1xufVxuXG5mdW5jdGlvbiBleHRyYWN0SW5qZWN0YWJsZUN0b3JEZXBzKFxuICAgIGNsYXp6OiBDbGFzc0RlY2xhcmF0aW9uLCBtZXRhOiBSM0luamVjdGFibGVNZXRhZGF0YSwgZGVjb3JhdG9yOiBEZWNvcmF0b3IsXG4gICAgcmVmbGVjdG9yOiBSZWZsZWN0aW9uSG9zdCwgaXNDb3JlOiBib29sZWFuLCBzdHJpY3RDdG9yRGVwczogYm9vbGVhbikge1xuICBpZiAoZGVjb3JhdG9yLmFyZ3MgPT09IG51bGwpIHtcbiAgICB0aHJvdyBuZXcgRmF0YWxEaWFnbm9zdGljRXJyb3IoXG4gICAgICAgIEVycm9yQ29kZS5ERUNPUkFUT1JfTk9UX0NBTExFRCwgRGVjb3JhdG9yLm5vZGVGb3JFcnJvcihkZWNvcmF0b3IpLFxuICAgICAgICAnQEluamVjdGFibGUgbXVzdCBiZSBjYWxsZWQnKTtcbiAgfVxuXG4gIGxldCBjdG9yRGVwczogUjNEZXBlbmRlbmN5TWV0YWRhdGFbXXwnaW52YWxpZCd8bnVsbCA9IG51bGw7XG5cbiAgaWYgKGRlY29yYXRvci5hcmdzLmxlbmd0aCA9PT0gMCkge1xuICAgIC8vIElkZWFsbHksIHVzaW5nIEBJbmplY3RhYmxlKCkgd291bGQgaGF2ZSB0aGUgc2FtZSBlZmZlY3QgYXMgdXNpbmcgQEluamVjdGFibGUoey4uLn0pLCBhbmQgYmVcbiAgICAvLyBzdWJqZWN0IHRvIHRoZSBzYW1lIHZhbGlkYXRpb24uIEhvd2V2ZXIsIGV4aXN0aW5nIEFuZ3VsYXIgY29kZSBhYnVzZXMgQEluamVjdGFibGUsIGFwcGx5aW5nXG4gICAgLy8gaXQgdG8gdGhpbmdzIGxpa2UgYWJzdHJhY3QgY2xhc3NlcyB3aXRoIGNvbnN0cnVjdG9ycyB0aGF0IHdlcmUgbmV2ZXIgbWVhbnQgZm9yIHVzZSB3aXRoXG4gICAgLy8gQW5ndWxhcidzIERJLlxuICAgIC8vXG4gICAgLy8gVG8gZGVhbCB3aXRoIHRoaXMsIEBJbmplY3RhYmxlKCkgd2l0aG91dCBhbiBhcmd1bWVudCBpcyBtb3JlIGxlbmllbnQsIGFuZCBpZiB0aGVcbiAgICAvLyBjb25zdHJ1Y3RvciBzaWduYXR1cmUgZG9lcyBub3Qgd29yayBmb3IgREkgdGhlbiBhIGZhY3RvcnkgZGVmaW5pdGlvbiAoybVmYWMpIHRoYXQgdGhyb3dzIGlzXG4gICAgLy8gZ2VuZXJhdGVkLlxuICAgIGlmIChzdHJpY3RDdG9yRGVwcykge1xuICAgICAgY3RvckRlcHMgPSBnZXRWYWxpZENvbnN0cnVjdG9yRGVwZW5kZW5jaWVzKGNsYXp6LCByZWZsZWN0b3IsIGlzQ29yZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGN0b3JEZXBzID1cbiAgICAgICAgICB1bndyYXBDb25zdHJ1Y3RvckRlcGVuZGVuY2llcyhnZXRDb25zdHJ1Y3RvckRlcGVuZGVuY2llcyhjbGF6eiwgcmVmbGVjdG9yLCBpc0NvcmUpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gY3RvckRlcHM7XG4gIH0gZWxzZSBpZiAoZGVjb3JhdG9yLmFyZ3MubGVuZ3RoID09PSAxKSB7XG4gICAgY29uc3QgcmF3Q3RvckRlcHMgPSBnZXRDb25zdHJ1Y3RvckRlcGVuZGVuY2llcyhjbGF6eiwgcmVmbGVjdG9yLCBpc0NvcmUpO1xuXG4gICAgaWYgKHN0cmljdEN0b3JEZXBzICYmIG1ldGEudXNlVmFsdWUgPT09IHVuZGVmaW5lZCAmJiBtZXRhLnVzZUV4aXN0aW5nID09PSB1bmRlZmluZWQgJiZcbiAgICAgICAgbWV0YS51c2VDbGFzcyA9PT0gdW5kZWZpbmVkICYmIG1ldGEudXNlRmFjdG9yeSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAvLyBTaW5jZSB1c2UqIHdhcyBub3QgcHJvdmlkZWQsIHZhbGlkYXRlIHRoZSBkZXBzIGFjY29yZGluZyB0byBzdHJpY3RDdG9yRGVwcy5cbiAgICAgIGN0b3JEZXBzID0gdmFsaWRhdGVDb25zdHJ1Y3RvckRlcGVuZGVuY2llcyhjbGF6eiwgcmF3Q3RvckRlcHMpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjdG9yRGVwcyA9IHVud3JhcENvbnN0cnVjdG9yRGVwZW5kZW5jaWVzKHJhd0N0b3JEZXBzKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gY3RvckRlcHM7XG59XG5cbmZ1bmN0aW9uIGdldERlcChkZXA6IHRzLkV4cHJlc3Npb24sIHJlZmxlY3RvcjogUmVmbGVjdGlvbkhvc3QpOiBSM0RlcGVuZGVuY3lNZXRhZGF0YSB7XG4gIGNvbnN0IG1ldGE6IFIzRGVwZW5kZW5jeU1ldGFkYXRhID0ge1xuICAgIHRva2VuOiBuZXcgV3JhcHBlZE5vZGVFeHByKGRlcCksXG4gICAgYXR0cmlidXRlTmFtZVR5cGU6IG51bGwsXG4gICAgaG9zdDogZmFsc2UsXG4gICAgb3B0aW9uYWw6IGZhbHNlLFxuICAgIHNlbGY6IGZhbHNlLFxuICAgIHNraXBTZWxmOiBmYWxzZSxcbiAgfTtcblxuICBmdW5jdGlvbiBtYXliZVVwZGF0ZURlY29yYXRvcihcbiAgICAgIGRlYzogdHMuSWRlbnRpZmllciwgcmVmbGVjdG9yOiBSZWZsZWN0aW9uSG9zdCwgdG9rZW4/OiB0cy5FeHByZXNzaW9uKTogdm9pZCB7XG4gICAgY29uc3Qgc291cmNlID0gcmVmbGVjdG9yLmdldEltcG9ydE9mSWRlbnRpZmllcihkZWMpO1xuICAgIGlmIChzb3VyY2UgPT09IG51bGwgfHwgc291cmNlLmZyb20gIT09ICdAYW5ndWxhci9jb3JlJykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBzd2l0Y2ggKHNvdXJjZS5uYW1lKSB7XG4gICAgICBjYXNlICdJbmplY3QnOlxuICAgICAgICBpZiAodG9rZW4gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIG1ldGEudG9rZW4gPSBuZXcgV3JhcHBlZE5vZGVFeHByKHRva2VuKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ09wdGlvbmFsJzpcbiAgICAgICAgbWV0YS5vcHRpb25hbCA9IHRydWU7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnU2tpcFNlbGYnOlxuICAgICAgICBtZXRhLnNraXBTZWxmID0gdHJ1ZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdTZWxmJzpcbiAgICAgICAgbWV0YS5zZWxmID0gdHJ1ZTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgaWYgKHRzLmlzQXJyYXlMaXRlcmFsRXhwcmVzc2lvbihkZXApKSB7XG4gICAgZGVwLmVsZW1lbnRzLmZvckVhY2goZWwgPT4ge1xuICAgICAgaWYgKHRzLmlzSWRlbnRpZmllcihlbCkpIHtcbiAgICAgICAgbWF5YmVVcGRhdGVEZWNvcmF0b3IoZWwsIHJlZmxlY3Rvcik7XG4gICAgICB9IGVsc2UgaWYgKHRzLmlzTmV3RXhwcmVzc2lvbihlbCkgJiYgdHMuaXNJZGVudGlmaWVyKGVsLmV4cHJlc3Npb24pKSB7XG4gICAgICAgIGNvbnN0IHRva2VuID0gZWwuYXJndW1lbnRzICYmIGVsLmFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGVsLmFyZ3VtZW50c1swXSB8fCB1bmRlZmluZWQ7XG4gICAgICAgIG1heWJlVXBkYXRlRGVjb3JhdG9yKGVsLmV4cHJlc3Npb24sIHJlZmxlY3RvciwgdG9rZW4pO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG4gIHJldHVybiBtZXRhO1xufVxuIl19