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
        define("@angular/compiler/src/jit_compiler_facade", ["require", "exports", "tslib", "@angular/compiler/src/constant_pool", "@angular/compiler/src/core", "@angular/compiler/src/injectable_compiler_2", "@angular/compiler/src/ml_parser/interpolation_config", "@angular/compiler/src/output/output_ast", "@angular/compiler/src/output/output_jit", "@angular/compiler/src/parse_util", "@angular/compiler/src/render3/r3_factory", "@angular/compiler/src/render3/r3_injector_compiler", "@angular/compiler/src/render3/r3_jit", "@angular/compiler/src/render3/r3_module_compiler", "@angular/compiler/src/render3/r3_pipe_compiler", "@angular/compiler/src/render3/util", "@angular/compiler/src/render3/view/compiler", "@angular/compiler/src/render3/view/template", "@angular/compiler/src/resource_loader", "@angular/compiler/src/schema/dom_element_schema_registry"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.publishFacade = exports.CompilerFacadeImpl = void 0;
    var tslib_1 = require("tslib");
    var constant_pool_1 = require("@angular/compiler/src/constant_pool");
    var core_1 = require("@angular/compiler/src/core");
    var injectable_compiler_2_1 = require("@angular/compiler/src/injectable_compiler_2");
    var interpolation_config_1 = require("@angular/compiler/src/ml_parser/interpolation_config");
    var output_ast_1 = require("@angular/compiler/src/output/output_ast");
    var output_jit_1 = require("@angular/compiler/src/output/output_jit");
    var parse_util_1 = require("@angular/compiler/src/parse_util");
    var r3_factory_1 = require("@angular/compiler/src/render3/r3_factory");
    var r3_injector_compiler_1 = require("@angular/compiler/src/render3/r3_injector_compiler");
    var r3_jit_1 = require("@angular/compiler/src/render3/r3_jit");
    var r3_module_compiler_1 = require("@angular/compiler/src/render3/r3_module_compiler");
    var r3_pipe_compiler_1 = require("@angular/compiler/src/render3/r3_pipe_compiler");
    var util_1 = require("@angular/compiler/src/render3/util");
    var compiler_1 = require("@angular/compiler/src/render3/view/compiler");
    var template_1 = require("@angular/compiler/src/render3/view/template");
    var resource_loader_1 = require("@angular/compiler/src/resource_loader");
    var dom_element_schema_registry_1 = require("@angular/compiler/src/schema/dom_element_schema_registry");
    var CompilerFacadeImpl = /** @class */ (function () {
        function CompilerFacadeImpl(jitEvaluator) {
            if (jitEvaluator === void 0) { jitEvaluator = new output_jit_1.JitEvaluator(); }
            this.jitEvaluator = jitEvaluator;
            this.FactoryTarget = r3_factory_1.FactoryTarget;
            this.ResourceLoader = resource_loader_1.ResourceLoader;
            this.elementSchemaRegistry = new dom_element_schema_registry_1.DomElementSchemaRegistry();
        }
        CompilerFacadeImpl.prototype.compilePipe = function (angularCoreEnv, sourceMapUrl, facade) {
            var metadata = {
                name: facade.name,
                type: util_1.wrapReference(facade.type),
                internalType: new output_ast_1.WrappedNodeExpr(facade.type),
                typeArgumentCount: 0,
                deps: null,
                pipeName: facade.pipeName,
                pure: facade.pure,
            };
            var res = r3_pipe_compiler_1.compilePipeFromMetadata(metadata);
            return this.jitExpression(res.expression, angularCoreEnv, sourceMapUrl, []);
        };
        CompilerFacadeImpl.prototype.compilePipeDeclaration = function (angularCoreEnv, sourceMapUrl, declaration) {
            var meta = convertDeclarePipeFacadeToMetadata(declaration);
            var res = r3_pipe_compiler_1.compilePipeFromMetadata(meta);
            return this.jitExpression(res.expression, angularCoreEnv, sourceMapUrl, []);
        };
        CompilerFacadeImpl.prototype.compileInjectable = function (angularCoreEnv, sourceMapUrl, facade) {
            var _a;
            var _b = injectable_compiler_2_1.compileInjectable({
                name: facade.name,
                type: util_1.wrapReference(facade.type),
                internalType: new output_ast_1.WrappedNodeExpr(facade.type),
                typeArgumentCount: facade.typeArgumentCount,
                providedIn: computeProvidedIn(facade.providedIn),
                useClass: convertToProviderExpression(facade, USE_CLASS),
                useFactory: wrapExpression(facade, USE_FACTORY),
                useValue: convertToProviderExpression(facade, USE_VALUE),
                useExisting: convertToProviderExpression(facade, USE_EXISTING),
                deps: (_a = facade.deps) === null || _a === void 0 ? void 0 : _a.map(convertR3DependencyMetadata),
            }, 
            /* resolveForwardRefs */ true), expression = _b.expression, statements = _b.statements;
            return this.jitExpression(expression, angularCoreEnv, sourceMapUrl, statements);
        };
        CompilerFacadeImpl.prototype.compileInjectableDeclaration = function (angularCoreEnv, sourceMapUrl, facade) {
            var _a;
            var _b = injectable_compiler_2_1.compileInjectable({
                name: facade.type.name,
                type: util_1.wrapReference(facade.type),
                internalType: new output_ast_1.WrappedNodeExpr(facade.type),
                typeArgumentCount: 0,
                providedIn: computeProvidedIn(facade.providedIn),
                useClass: convertToProviderExpression(facade, USE_CLASS),
                useFactory: wrapExpression(facade, USE_FACTORY),
                useValue: convertToProviderExpression(facade, USE_VALUE),
                useExisting: convertToProviderExpression(facade, USE_EXISTING),
                deps: (_a = facade.deps) === null || _a === void 0 ? void 0 : _a.map(convertR3DeclareDependencyMetadata),
            }, 
            /* resolveForwardRefs */ true), expression = _b.expression, statements = _b.statements;
            return this.jitExpression(expression, angularCoreEnv, sourceMapUrl, statements);
        };
        CompilerFacadeImpl.prototype.compileInjector = function (angularCoreEnv, sourceMapUrl, facade) {
            var meta = {
                name: facade.name,
                type: util_1.wrapReference(facade.type),
                internalType: new output_ast_1.WrappedNodeExpr(facade.type),
                providers: new output_ast_1.WrappedNodeExpr(facade.providers),
                imports: facade.imports.map(function (i) { return new output_ast_1.WrappedNodeExpr(i); }),
            };
            var res = r3_injector_compiler_1.compileInjector(meta);
            return this.jitExpression(res.expression, angularCoreEnv, sourceMapUrl, []);
        };
        CompilerFacadeImpl.prototype.compileInjectorDeclaration = function (angularCoreEnv, sourceMapUrl, declaration) {
            var meta = convertDeclareInjectorFacadeToMetadata(declaration);
            var res = r3_injector_compiler_1.compileInjector(meta);
            return this.jitExpression(res.expression, angularCoreEnv, sourceMapUrl, []);
        };
        CompilerFacadeImpl.prototype.compileNgModule = function (angularCoreEnv, sourceMapUrl, facade) {
            var meta = {
                type: util_1.wrapReference(facade.type),
                internalType: new output_ast_1.WrappedNodeExpr(facade.type),
                adjacentType: new output_ast_1.WrappedNodeExpr(facade.type),
                bootstrap: facade.bootstrap.map(util_1.wrapReference),
                declarations: facade.declarations.map(util_1.wrapReference),
                imports: facade.imports.map(util_1.wrapReference),
                exports: facade.exports.map(util_1.wrapReference),
                emitInline: true,
                containsForwardDecls: false,
                schemas: facade.schemas ? facade.schemas.map(util_1.wrapReference) : null,
                id: facade.id ? new output_ast_1.WrappedNodeExpr(facade.id) : null,
            };
            var res = r3_module_compiler_1.compileNgModule(meta);
            return this.jitExpression(res.expression, angularCoreEnv, sourceMapUrl, []);
        };
        CompilerFacadeImpl.prototype.compileNgModuleDeclaration = function (angularCoreEnv, sourceMapUrl, declaration) {
            var expression = r3_module_compiler_1.compileNgModuleDeclarationExpression(declaration);
            return this.jitExpression(expression, angularCoreEnv, sourceMapUrl, []);
        };
        CompilerFacadeImpl.prototype.compileDirective = function (angularCoreEnv, sourceMapUrl, facade) {
            var meta = convertDirectiveFacadeToMetadata(facade);
            return this.compileDirectiveFromMeta(angularCoreEnv, sourceMapUrl, meta);
        };
        CompilerFacadeImpl.prototype.compileDirectiveDeclaration = function (angularCoreEnv, sourceMapUrl, declaration) {
            var typeSourceSpan = this.createParseSourceSpan('Directive', declaration.type.name, sourceMapUrl);
            var meta = convertDeclareDirectiveFacadeToMetadata(declaration, typeSourceSpan);
            return this.compileDirectiveFromMeta(angularCoreEnv, sourceMapUrl, meta);
        };
        CompilerFacadeImpl.prototype.compileDirectiveFromMeta = function (angularCoreEnv, sourceMapUrl, meta) {
            var constantPool = new constant_pool_1.ConstantPool();
            var bindingParser = template_1.makeBindingParser();
            var res = compiler_1.compileDirectiveFromMetadata(meta, constantPool, bindingParser);
            return this.jitExpression(res.expression, angularCoreEnv, sourceMapUrl, constantPool.statements);
        };
        CompilerFacadeImpl.prototype.compileComponent = function (angularCoreEnv, sourceMapUrl, facade) {
            // Parse the template and check for errors.
            var _a = parseJitTemplate(facade.template, facade.name, sourceMapUrl, facade.preserveWhitespaces, facade.interpolation), template = _a.template, interpolation = _a.interpolation;
            // Compile the component metadata, including template, into an expression.
            var meta = tslib_1.__assign(tslib_1.__assign(tslib_1.__assign({}, facade), convertDirectiveFacadeToMetadata(facade)), { selector: facade.selector || this.elementSchemaRegistry.getDefaultComponentElementName(), template: template, declarationListEmitMode: 0 /* Direct */, styles: tslib_1.__spreadArray(tslib_1.__spreadArray([], tslib_1.__read(facade.styles)), tslib_1.__read(template.styles)), encapsulation: facade.encapsulation, interpolation: interpolation, changeDetection: facade.changeDetection, animations: facade.animations != null ? new output_ast_1.WrappedNodeExpr(facade.animations) : null, viewProviders: facade.viewProviders != null ? new output_ast_1.WrappedNodeExpr(facade.viewProviders) :
                    null, relativeContextFilePath: '', i18nUseExternalIds: true });
            var jitExpressionSourceMap = "ng:///" + facade.name + ".js";
            return this.compileComponentFromMeta(angularCoreEnv, jitExpressionSourceMap, meta);
        };
        CompilerFacadeImpl.prototype.compileComponentDeclaration = function (angularCoreEnv, sourceMapUrl, declaration) {
            var typeSourceSpan = this.createParseSourceSpan('Component', declaration.type.name, sourceMapUrl);
            var meta = convertDeclareComponentFacadeToMetadata(declaration, typeSourceSpan, sourceMapUrl);
            return this.compileComponentFromMeta(angularCoreEnv, sourceMapUrl, meta);
        };
        CompilerFacadeImpl.prototype.compileComponentFromMeta = function (angularCoreEnv, sourceMapUrl, meta) {
            var constantPool = new constant_pool_1.ConstantPool();
            var bindingParser = template_1.makeBindingParser(meta.interpolation);
            var res = compiler_1.compileComponentFromMetadata(meta, constantPool, bindingParser);
            return this.jitExpression(res.expression, angularCoreEnv, sourceMapUrl, constantPool.statements);
        };
        CompilerFacadeImpl.prototype.compileFactory = function (angularCoreEnv, sourceMapUrl, meta) {
            var factoryRes = r3_factory_1.compileFactoryFunction({
                name: meta.name,
                type: util_1.wrapReference(meta.type),
                internalType: new output_ast_1.WrappedNodeExpr(meta.type),
                typeArgumentCount: meta.typeArgumentCount,
                deps: convertR3DependencyMetadataArray(meta.deps),
                target: meta.target,
            });
            return this.jitExpression(factoryRes.expression, angularCoreEnv, sourceMapUrl, factoryRes.statements);
        };
        CompilerFacadeImpl.prototype.compileFactoryDeclaration = function (angularCoreEnv, sourceMapUrl, meta) {
            var factoryRes = r3_factory_1.compileFactoryFunction({
                name: meta.type.name,
                type: util_1.wrapReference(meta.type),
                internalType: new output_ast_1.WrappedNodeExpr(meta.type),
                typeArgumentCount: 0,
                deps: meta.deps && meta.deps.map(convertR3DeclareDependencyMetadata),
                target: meta.target,
            });
            return this.jitExpression(factoryRes.expression, angularCoreEnv, sourceMapUrl, factoryRes.statements);
        };
        CompilerFacadeImpl.prototype.createParseSourceSpan = function (kind, typeName, sourceUrl) {
            return parse_util_1.r3JitTypeSourceSpan(kind, typeName, sourceUrl);
        };
        /**
         * JIT compiles an expression and returns the result of executing that expression.
         *
         * @param def the definition which will be compiled and executed to get the value to patch
         * @param context an object map of @angular/core symbol names to symbols which will be available
         * in the context of the compiled expression
         * @param sourceUrl a URL to use for the source map of the compiled expression
         * @param preStatements a collection of statements that should be evaluated before the expression.
         */
        CompilerFacadeImpl.prototype.jitExpression = function (def, context, sourceUrl, preStatements) {
            // The ConstantPool may contain Statements which declare variables used in the final expression.
            // Therefore, its statements need to precede the actual JIT operation. The final statement is a
            // declaration of $def which is set to the expression being compiled.
            var statements = tslib_1.__spreadArray(tslib_1.__spreadArray([], tslib_1.__read(preStatements)), [
                new output_ast_1.DeclareVarStmt('$def', def, undefined, [output_ast_1.StmtModifier.Exported]),
            ]);
            var res = this.jitEvaluator.evaluateStatements(sourceUrl, statements, new r3_jit_1.R3JitReflector(context), /* enableSourceMaps */ true);
            return res['$def'];
        };
        return CompilerFacadeImpl;
    }());
    exports.CompilerFacadeImpl = CompilerFacadeImpl;
    var USE_CLASS = Object.keys({ useClass: null })[0];
    var USE_FACTORY = Object.keys({ useFactory: null })[0];
    var USE_VALUE = Object.keys({ useValue: null })[0];
    var USE_EXISTING = Object.keys({ useExisting: null })[0];
    function convertToR3QueryMetadata(facade) {
        return tslib_1.__assign(tslib_1.__assign({}, facade), { predicate: Array.isArray(facade.predicate) ? facade.predicate :
                new output_ast_1.WrappedNodeExpr(facade.predicate), read: facade.read ? new output_ast_1.WrappedNodeExpr(facade.read) : null, static: facade.static, emitDistinctChangesOnly: facade.emitDistinctChangesOnly });
    }
    function convertQueryDeclarationToMetadata(declaration) {
        var _a, _b, _c, _d;
        return {
            propertyName: declaration.propertyName,
            first: (_a = declaration.first) !== null && _a !== void 0 ? _a : false,
            predicate: Array.isArray(declaration.predicate) ? declaration.predicate :
                new output_ast_1.WrappedNodeExpr(declaration.predicate),
            descendants: (_b = declaration.descendants) !== null && _b !== void 0 ? _b : false,
            read: declaration.read ? new output_ast_1.WrappedNodeExpr(declaration.read) : null,
            static: (_c = declaration.static) !== null && _c !== void 0 ? _c : false,
            emitDistinctChangesOnly: (_d = declaration.emitDistinctChangesOnly) !== null && _d !== void 0 ? _d : true,
        };
    }
    function convertDirectiveFacadeToMetadata(facade) {
        var inputsFromMetadata = parseInputOutputs(facade.inputs || []);
        var outputsFromMetadata = parseInputOutputs(facade.outputs || []);
        var propMetadata = facade.propMetadata;
        var inputsFromType = {};
        var outputsFromType = {};
        var _loop_1 = function (field) {
            if (propMetadata.hasOwnProperty(field)) {
                propMetadata[field].forEach(function (ann) {
                    if (isInput(ann)) {
                        inputsFromType[field] =
                            ann.bindingPropertyName ? [ann.bindingPropertyName, field] : field;
                    }
                    else if (isOutput(ann)) {
                        outputsFromType[field] = ann.bindingPropertyName || field;
                    }
                });
            }
        };
        for (var field in propMetadata) {
            _loop_1(field);
        }
        return tslib_1.__assign(tslib_1.__assign({}, facade), { typeArgumentCount: 0, typeSourceSpan: facade.typeSourceSpan, type: util_1.wrapReference(facade.type), internalType: new output_ast_1.WrappedNodeExpr(facade.type), deps: null, host: extractHostBindings(facade.propMetadata, facade.typeSourceSpan, facade.host), inputs: tslib_1.__assign(tslib_1.__assign({}, inputsFromMetadata), inputsFromType), outputs: tslib_1.__assign(tslib_1.__assign({}, outputsFromMetadata), outputsFromType), queries: facade.queries.map(convertToR3QueryMetadata), providers: facade.providers != null ? new output_ast_1.WrappedNodeExpr(facade.providers) : null, viewQueries: facade.viewQueries.map(convertToR3QueryMetadata), fullInheritance: false });
    }
    function convertDeclareDirectiveFacadeToMetadata(declaration, typeSourceSpan) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        return {
            name: declaration.type.name,
            type: util_1.wrapReference(declaration.type),
            typeSourceSpan: typeSourceSpan,
            internalType: new output_ast_1.WrappedNodeExpr(declaration.type),
            selector: (_a = declaration.selector) !== null && _a !== void 0 ? _a : null,
            inputs: (_b = declaration.inputs) !== null && _b !== void 0 ? _b : {},
            outputs: (_c = declaration.outputs) !== null && _c !== void 0 ? _c : {},
            host: convertHostDeclarationToMetadata(declaration.host),
            queries: ((_d = declaration.queries) !== null && _d !== void 0 ? _d : []).map(convertQueryDeclarationToMetadata),
            viewQueries: ((_e = declaration.viewQueries) !== null && _e !== void 0 ? _e : []).map(convertQueryDeclarationToMetadata),
            providers: declaration.providers !== undefined ? new output_ast_1.WrappedNodeExpr(declaration.providers) :
                null,
            exportAs: (_f = declaration.exportAs) !== null && _f !== void 0 ? _f : null,
            usesInheritance: (_g = declaration.usesInheritance) !== null && _g !== void 0 ? _g : false,
            lifecycle: { usesOnChanges: (_h = declaration.usesOnChanges) !== null && _h !== void 0 ? _h : false },
            deps: null,
            typeArgumentCount: 0,
            fullInheritance: false,
        };
    }
    function convertHostDeclarationToMetadata(host) {
        var _a, _b, _c;
        if (host === void 0) { host = {}; }
        return {
            attributes: convertOpaqueValuesToExpressions((_a = host.attributes) !== null && _a !== void 0 ? _a : {}),
            listeners: (_b = host.listeners) !== null && _b !== void 0 ? _b : {},
            properties: (_c = host.properties) !== null && _c !== void 0 ? _c : {},
            specialAttributes: {
                classAttr: host.classAttribute,
                styleAttr: host.styleAttribute,
            },
        };
    }
    function convertOpaqueValuesToExpressions(obj) {
        var e_1, _a;
        var result = {};
        try {
            for (var _b = tslib_1.__values(Object.keys(obj)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var key = _c.value;
                result[key] = new output_ast_1.WrappedNodeExpr(obj[key]);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return result;
    }
    function convertDeclareComponentFacadeToMetadata(declaration, typeSourceSpan, sourceMapUrl) {
        var _a, _b, _c, _d, _e, _f;
        var _g = parseJitTemplate(declaration.template, declaration.type.name, sourceMapUrl, (_a = declaration.preserveWhitespaces) !== null && _a !== void 0 ? _a : false, declaration.interpolation), template = _g.template, interpolation = _g.interpolation;
        return tslib_1.__assign(tslib_1.__assign({}, convertDeclareDirectiveFacadeToMetadata(declaration, typeSourceSpan)), { template: template, styles: (_b = declaration.styles) !== null && _b !== void 0 ? _b : [], directives: ((_c = declaration.components) !== null && _c !== void 0 ? _c : [])
                .concat((_d = declaration.directives) !== null && _d !== void 0 ? _d : [])
                .map(convertUsedDirectiveDeclarationToMetadata), pipes: convertUsedPipesToMetadata(declaration.pipes), viewProviders: declaration.viewProviders !== undefined ?
                new output_ast_1.WrappedNodeExpr(declaration.viewProviders) :
                null, animations: declaration.animations !== undefined ? new output_ast_1.WrappedNodeExpr(declaration.animations) :
                null, changeDetection: (_e = declaration.changeDetection) !== null && _e !== void 0 ? _e : core_1.ChangeDetectionStrategy.Default, encapsulation: (_f = declaration.encapsulation) !== null && _f !== void 0 ? _f : core_1.ViewEncapsulation.Emulated, interpolation: interpolation, declarationListEmitMode: 2 /* ClosureResolved */, relativeContextFilePath: '', i18nUseExternalIds: true });
    }
    function convertUsedDirectiveDeclarationToMetadata(declaration) {
        var _a, _b, _c;
        return {
            selector: declaration.selector,
            type: new output_ast_1.WrappedNodeExpr(declaration.type),
            inputs: (_a = declaration.inputs) !== null && _a !== void 0 ? _a : [],
            outputs: (_b = declaration.outputs) !== null && _b !== void 0 ? _b : [],
            exportAs: (_c = declaration.exportAs) !== null && _c !== void 0 ? _c : null,
        };
    }
    function convertUsedPipesToMetadata(declaredPipes) {
        var e_2, _a;
        var pipes = new Map();
        if (declaredPipes === undefined) {
            return pipes;
        }
        try {
            for (var _b = tslib_1.__values(Object.keys(declaredPipes)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var pipeName = _c.value;
                var pipeType = declaredPipes[pipeName];
                pipes.set(pipeName, new output_ast_1.WrappedNodeExpr(pipeType));
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return pipes;
    }
    function parseJitTemplate(template, typeName, sourceMapUrl, preserveWhitespaces, interpolation) {
        var interpolationConfig = interpolation ? interpolation_config_1.InterpolationConfig.fromArray(interpolation) : interpolation_config_1.DEFAULT_INTERPOLATION_CONFIG;
        // Parse the template and check for errors.
        var parsed = template_1.parseTemplate(template, sourceMapUrl, { preserveWhitespaces: preserveWhitespaces, interpolationConfig: interpolationConfig });
        if (parsed.errors !== null) {
            var errors = parsed.errors.map(function (err) { return err.toString(); }).join(', ');
            throw new Error("Errors during JIT compilation of template for " + typeName + ": " + errors);
        }
        return { template: parsed, interpolation: interpolationConfig };
    }
    /**
     * Convert the expression, if present to an `R3ProviderExpression`.
     *
     * In JIT mode we do not want the compiler to wrap the expression in a `forwardRef()` call because,
     * if it is referencing a type that has not yet been defined, it will have already been wrapped in
     * a `forwardRef()` - either by the application developer or during partial-compilation. Thus we can
     * set `isForwardRef` to `false`.
     */
    function convertToProviderExpression(obj, property) {
        if (obj.hasOwnProperty(property)) {
            return injectable_compiler_2_1.createR3ProviderExpression(new output_ast_1.WrappedNodeExpr(obj[property]), /* isForwardRef */ false);
        }
        else {
            return undefined;
        }
    }
    function wrapExpression(obj, property) {
        if (obj.hasOwnProperty(property)) {
            return new output_ast_1.WrappedNodeExpr(obj[property]);
        }
        else {
            return undefined;
        }
    }
    function computeProvidedIn(providedIn) {
        var expression = (providedIn == null || typeof providedIn === 'string') ?
            new output_ast_1.LiteralExpr(providedIn !== null && providedIn !== void 0 ? providedIn : null) :
            new output_ast_1.WrappedNodeExpr(providedIn);
        // See `convertToProviderExpression()` for why `isForwardRef` is false.
        return injectable_compiler_2_1.createR3ProviderExpression(expression, /* isForwardRef */ false);
    }
    function convertR3DependencyMetadataArray(facades) {
        return facades == null ? null : facades.map(convertR3DependencyMetadata);
    }
    function convertR3DependencyMetadata(facade) {
        var isAttributeDep = facade.attribute != null; // both `null` and `undefined`
        var rawToken = facade.token === null ? null : new output_ast_1.WrappedNodeExpr(facade.token);
        // In JIT mode, if the dep is an `@Attribute()` then we use the attribute name given in
        // `attribute` rather than the `token`.
        var token = isAttributeDep ? new output_ast_1.WrappedNodeExpr(facade.attribute) : rawToken;
        return createR3DependencyMetadata(token, isAttributeDep, facade.host, facade.optional, facade.self, facade.skipSelf);
    }
    function convertR3DeclareDependencyMetadata(facade) {
        var _a, _b, _c, _d, _e;
        var isAttributeDep = (_a = facade.attribute) !== null && _a !== void 0 ? _a : false;
        var token = facade.token === null ? null : new output_ast_1.WrappedNodeExpr(facade.token);
        return createR3DependencyMetadata(token, isAttributeDep, (_b = facade.host) !== null && _b !== void 0 ? _b : false, (_c = facade.optional) !== null && _c !== void 0 ? _c : false, (_d = facade.self) !== null && _d !== void 0 ? _d : false, (_e = facade.skipSelf) !== null && _e !== void 0 ? _e : false);
    }
    function createR3DependencyMetadata(token, isAttributeDep, host, optional, self, skipSelf) {
        // If the dep is an `@Attribute()` the `attributeNameType` ought to be the `unknown` type.
        // But types are not available at runtime so we just use a literal `"<unknown>"` string as a dummy
        // marker.
        var attributeNameType = isAttributeDep ? output_ast_1.literal('unknown') : null;
        return { token: token, attributeNameType: attributeNameType, host: host, optional: optional, self: self, skipSelf: skipSelf };
    }
    function extractHostBindings(propMetadata, sourceSpan, host) {
        // First parse the declarations from the metadata.
        var bindings = compiler_1.parseHostBindings(host || {});
        // After that check host bindings for errors
        var errors = compiler_1.verifyHostBindings(bindings, sourceSpan);
        if (errors.length) {
            throw new Error(errors.map(function (error) { return error.msg; }).join('\n'));
        }
        var _loop_2 = function (field) {
            if (propMetadata.hasOwnProperty(field)) {
                propMetadata[field].forEach(function (ann) {
                    if (isHostBinding(ann)) {
                        // Since this is a decorator, we know that the value is a class member. Always access it
                        // through `this` so that further down the line it can't be confused for a literal value
                        // (e.g. if there's a property called `true`).
                        bindings.properties[ann.hostPropertyName || field] =
                            util_1.getSafePropertyAccessString('this', field);
                    }
                    else if (isHostListener(ann)) {
                        bindings.listeners[ann.eventName || field] = field + "(" + (ann.args || []).join(',') + ")";
                    }
                });
            }
        };
        // Next, loop over the properties of the object, looking for @HostBinding and @HostListener.
        for (var field in propMetadata) {
            _loop_2(field);
        }
        return bindings;
    }
    function isHostBinding(value) {
        return value.ngMetadataName === 'HostBinding';
    }
    function isHostListener(value) {
        return value.ngMetadataName === 'HostListener';
    }
    function isInput(value) {
        return value.ngMetadataName === 'Input';
    }
    function isOutput(value) {
        return value.ngMetadataName === 'Output';
    }
    function parseInputOutputs(values) {
        return values.reduce(function (map, value) {
            var _a = tslib_1.__read(value.split(',').map(function (piece) { return piece.trim(); }), 2), field = _a[0], property = _a[1];
            map[field] = property || field;
            return map;
        }, {});
    }
    function convertDeclarePipeFacadeToMetadata(declaration) {
        var _a;
        return {
            name: declaration.type.name,
            type: util_1.wrapReference(declaration.type),
            internalType: new output_ast_1.WrappedNodeExpr(declaration.type),
            typeArgumentCount: 0,
            pipeName: declaration.name,
            deps: null,
            pure: (_a = declaration.pure) !== null && _a !== void 0 ? _a : true,
        };
    }
    function convertDeclareInjectorFacadeToMetadata(declaration) {
        return {
            name: declaration.type.name,
            type: util_1.wrapReference(declaration.type),
            internalType: new output_ast_1.WrappedNodeExpr(declaration.type),
            providers: declaration.providers !== undefined ? new output_ast_1.WrappedNodeExpr(declaration.providers) :
                null,
            imports: declaration.imports !== undefined ?
                declaration.imports.map(function (i) { return new output_ast_1.WrappedNodeExpr(i); }) :
                [],
        };
    }
    function publishFacade(global) {
        var ng = global.ng || (global.ng = {});
        ng.ɵcompilerFacade = new CompilerFacadeImpl();
    }
    exports.publishFacade = publishFacade;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaml0X2NvbXBpbGVyX2ZhY2FkZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy9qaXRfY29tcGlsZXJfZmFjYWRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFJSCxxRUFBNkM7SUFDN0MsbURBQTRHO0lBQzVHLHFGQUE0RztJQUM1Ryw2RkFBbUc7SUFDbkcsc0VBQStIO0lBQy9ILHNFQUFpRDtJQUNqRCwrREFBOEU7SUFDOUUsdUVBQWlHO0lBQ2pHLDJGQUFtRjtJQUNuRiwrREFBZ0Q7SUFDaEQsdUZBQXVIO0lBQ3ZILG1GQUFtRjtJQUNuRiwyREFBMEU7SUFFMUUsd0VBQThKO0lBQzlKLHdFQUF5RTtJQUN6RSx5RUFBaUQ7SUFDakQsd0dBQThFO0lBRTlFO1FBS0UsNEJBQW9CLFlBQWlDO1lBQWpDLDZCQUFBLEVBQUEsbUJBQW1CLHlCQUFZLEVBQUU7WUFBakMsaUJBQVksR0FBWixZQUFZLENBQXFCO1lBSnJELGtCQUFhLEdBQUcsMEJBQW9CLENBQUM7WUFDckMsbUJBQWMsR0FBRyxnQ0FBYyxDQUFDO1lBQ3hCLDBCQUFxQixHQUFHLElBQUksc0RBQXdCLEVBQUUsQ0FBQztRQUVQLENBQUM7UUFFekQsd0NBQVcsR0FBWCxVQUFZLGNBQStCLEVBQUUsWUFBb0IsRUFBRSxNQUE0QjtZQUU3RixJQUFNLFFBQVEsR0FBbUI7Z0JBQy9CLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSTtnQkFDakIsSUFBSSxFQUFFLG9CQUFhLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztnQkFDaEMsWUFBWSxFQUFFLElBQUksNEJBQWUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO2dCQUM5QyxpQkFBaUIsRUFBRSxDQUFDO2dCQUNwQixJQUFJLEVBQUUsSUFBSTtnQkFDVixRQUFRLEVBQUUsTUFBTSxDQUFDLFFBQVE7Z0JBQ3pCLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSTthQUNsQixDQUFDO1lBQ0YsSUFBTSxHQUFHLEdBQUcsMENBQXVCLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDOUMsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsY0FBYyxFQUFFLFlBQVksRUFBRSxFQUFFLENBQUMsQ0FBQztRQUM5RSxDQUFDO1FBRUQsbURBQXNCLEdBQXRCLFVBQ0ksY0FBK0IsRUFBRSxZQUFvQixFQUNyRCxXQUFnQztZQUNsQyxJQUFNLElBQUksR0FBRyxrQ0FBa0MsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUM3RCxJQUFNLEdBQUcsR0FBRywwQ0FBdUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMxQyxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxjQUFjLEVBQUUsWUFBWSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzlFLENBQUM7UUFFRCw4Q0FBaUIsR0FBakIsVUFDSSxjQUErQixFQUFFLFlBQW9CLEVBQ3JELE1BQWtDOztZQUM5QixJQUFBLEtBQTJCLHlDQUFpQixDQUM5QztnQkFDRSxJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUk7Z0JBQ2pCLElBQUksRUFBRSxvQkFBYSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7Z0JBQ2hDLFlBQVksRUFBRSxJQUFJLDRCQUFlLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztnQkFDOUMsaUJBQWlCLEVBQUUsTUFBTSxDQUFDLGlCQUFpQjtnQkFDM0MsVUFBVSxFQUFFLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUM7Z0JBQ2hELFFBQVEsRUFBRSwyQkFBMkIsQ0FBQyxNQUFNLEVBQUUsU0FBUyxDQUFDO2dCQUN4RCxVQUFVLEVBQUUsY0FBYyxDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUM7Z0JBQy9DLFFBQVEsRUFBRSwyQkFBMkIsQ0FBQyxNQUFNLEVBQUUsU0FBUyxDQUFDO2dCQUN4RCxXQUFXLEVBQUUsMkJBQTJCLENBQUMsTUFBTSxFQUFFLFlBQVksQ0FBQztnQkFDOUQsSUFBSSxFQUFFLE1BQUEsTUFBTSxDQUFDLElBQUksMENBQUUsR0FBRyxDQUFDLDJCQUEyQixDQUFDO2FBQ3BEO1lBQ0Qsd0JBQXdCLENBQUMsSUFBSSxDQUFDLEVBYjNCLFVBQVUsZ0JBQUEsRUFBRSxVQUFVLGdCQWFLLENBQUM7WUFFbkMsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsRUFBRSxjQUFjLEVBQUUsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ2xGLENBQUM7UUFFRCx5REFBNEIsR0FBNUIsVUFDSSxjQUErQixFQUFFLFlBQW9CLEVBQ3JELE1BQWlDOztZQUM3QixJQUFBLEtBQTJCLHlDQUFpQixDQUM5QztnQkFDRSxJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJO2dCQUN0QixJQUFJLEVBQUUsb0JBQWEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO2dCQUNoQyxZQUFZLEVBQUUsSUFBSSw0QkFBZSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7Z0JBQzlDLGlCQUFpQixFQUFFLENBQUM7Z0JBQ3BCLFVBQVUsRUFBRSxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDO2dCQUNoRCxRQUFRLEVBQUUsMkJBQTJCLENBQUMsTUFBTSxFQUFFLFNBQVMsQ0FBQztnQkFDeEQsVUFBVSxFQUFFLGNBQWMsQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDO2dCQUMvQyxRQUFRLEVBQUUsMkJBQTJCLENBQUMsTUFBTSxFQUFFLFNBQVMsQ0FBQztnQkFDeEQsV0FBVyxFQUFFLDJCQUEyQixDQUFDLE1BQU0sRUFBRSxZQUFZLENBQUM7Z0JBQzlELElBQUksRUFBRSxNQUFBLE1BQU0sQ0FBQyxJQUFJLDBDQUFFLEdBQUcsQ0FBQyxrQ0FBa0MsQ0FBQzthQUMzRDtZQUNELHdCQUF3QixDQUFDLElBQUksQ0FBQyxFQWIzQixVQUFVLGdCQUFBLEVBQUUsVUFBVSxnQkFhSyxDQUFDO1lBRW5DLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLEVBQUUsY0FBYyxFQUFFLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztRQUNsRixDQUFDO1FBRUQsNENBQWUsR0FBZixVQUNJLGNBQStCLEVBQUUsWUFBb0IsRUFDckQsTUFBZ0M7WUFDbEMsSUFBTSxJQUFJLEdBQXVCO2dCQUMvQixJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUk7Z0JBQ2pCLElBQUksRUFBRSxvQkFBYSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7Z0JBQ2hDLFlBQVksRUFBRSxJQUFJLDRCQUFlLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztnQkFDOUMsU0FBUyxFQUFFLElBQUksNEJBQWUsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDO2dCQUNoRCxPQUFPLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxJQUFJLDRCQUFlLENBQUMsQ0FBQyxDQUFDLEVBQXRCLENBQXNCLENBQUM7YUFDekQsQ0FBQztZQUNGLElBQU0sR0FBRyxHQUFHLHNDQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDbEMsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsY0FBYyxFQUFFLFlBQVksRUFBRSxFQUFFLENBQUMsQ0FBQztRQUM5RSxDQUFDO1FBRUQsdURBQTBCLEdBQTFCLFVBQ0ksY0FBK0IsRUFBRSxZQUFvQixFQUNyRCxXQUFvQztZQUN0QyxJQUFNLElBQUksR0FBRyxzQ0FBc0MsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUNqRSxJQUFNLEdBQUcsR0FBRyxzQ0FBZSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2xDLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLGNBQWMsRUFBRSxZQUFZLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDOUUsQ0FBQztRQUVELDRDQUFlLEdBQWYsVUFDSSxjQUErQixFQUFFLFlBQW9CLEVBQ3JELE1BQWdDO1lBQ2xDLElBQU0sSUFBSSxHQUF1QjtnQkFDL0IsSUFBSSxFQUFFLG9CQUFhLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztnQkFDaEMsWUFBWSxFQUFFLElBQUksNEJBQWUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO2dCQUM5QyxZQUFZLEVBQUUsSUFBSSw0QkFBZSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7Z0JBQzlDLFNBQVMsRUFBRSxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxvQkFBYSxDQUFDO2dCQUM5QyxZQUFZLEVBQUUsTUFBTSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsb0JBQWEsQ0FBQztnQkFDcEQsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLG9CQUFhLENBQUM7Z0JBQzFDLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQkFBYSxDQUFDO2dCQUMxQyxVQUFVLEVBQUUsSUFBSTtnQkFDaEIsb0JBQW9CLEVBQUUsS0FBSztnQkFDM0IsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLG9CQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSTtnQkFDbEUsRUFBRSxFQUFFLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksNEJBQWUsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUk7YUFDdEQsQ0FBQztZQUNGLElBQU0sR0FBRyxHQUFHLG9DQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDbEMsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsY0FBYyxFQUFFLFlBQVksRUFBRSxFQUFFLENBQUMsQ0FBQztRQUM5RSxDQUFDO1FBRUQsdURBQTBCLEdBQTFCLFVBQ0ksY0FBK0IsRUFBRSxZQUFvQixFQUNyRCxXQUFvQztZQUN0QyxJQUFNLFVBQVUsR0FBRyx5REFBb0MsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUNyRSxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxFQUFFLGNBQWMsRUFBRSxZQUFZLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDMUUsQ0FBQztRQUVELDZDQUFnQixHQUFoQixVQUNJLGNBQStCLEVBQUUsWUFBb0IsRUFDckQsTUFBaUM7WUFDbkMsSUFBTSxJQUFJLEdBQXdCLGdDQUFnQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzNFLE9BQU8sSUFBSSxDQUFDLHdCQUF3QixDQUFDLGNBQWMsRUFBRSxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDM0UsQ0FBQztRQUVELHdEQUEyQixHQUEzQixVQUNJLGNBQStCLEVBQUUsWUFBb0IsRUFDckQsV0FBcUM7WUFDdkMsSUFBTSxjQUFjLEdBQ2hCLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxXQUFXLEVBQUUsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsWUFBWSxDQUFDLENBQUM7WUFDakYsSUFBTSxJQUFJLEdBQUcsdUNBQXVDLENBQUMsV0FBVyxFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBQ2xGLE9BQU8sSUFBSSxDQUFDLHdCQUF3QixDQUFDLGNBQWMsRUFBRSxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDM0UsQ0FBQztRQUVPLHFEQUF3QixHQUFoQyxVQUNJLGNBQStCLEVBQUUsWUFBb0IsRUFBRSxJQUF5QjtZQUNsRixJQUFNLFlBQVksR0FBRyxJQUFJLDRCQUFZLEVBQUUsQ0FBQztZQUN4QyxJQUFNLGFBQWEsR0FBRyw0QkFBaUIsRUFBRSxDQUFDO1lBQzFDLElBQU0sR0FBRyxHQUFHLHVDQUE0QixDQUFDLElBQUksRUFBRSxZQUFZLEVBQUUsYUFBYSxDQUFDLENBQUM7WUFDNUUsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUNyQixHQUFHLENBQUMsVUFBVSxFQUFFLGNBQWMsRUFBRSxZQUFZLEVBQUUsWUFBWSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQzdFLENBQUM7UUFFRCw2Q0FBZ0IsR0FBaEIsVUFDSSxjQUErQixFQUFFLFlBQW9CLEVBQ3JELE1BQWlDO1lBQ25DLDJDQUEyQztZQUNyQyxJQUFBLEtBQTRCLGdCQUFnQixDQUM5QyxNQUFNLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFLE1BQU0sQ0FBQyxtQkFBbUIsRUFDdEUsTUFBTSxDQUFDLGFBQWEsQ0FBQyxFQUZsQixRQUFRLGNBQUEsRUFBRSxhQUFhLG1CQUVMLENBQUM7WUFFMUIsMEVBQTBFO1lBQzFFLElBQU0sSUFBSSwwREFDTCxNQUFzRCxHQUN0RCxnQ0FBZ0MsQ0FBQyxNQUFNLENBQUMsS0FDM0MsUUFBUSxFQUFFLE1BQU0sQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLHFCQUFxQixDQUFDLDhCQUE4QixFQUFFLEVBQ3hGLFFBQVEsVUFBQSxFQUNSLHVCQUF1QixrQkFDdkIsTUFBTSxpRUFBTSxNQUFNLENBQUMsTUFBTSxtQkFBSyxRQUFRLENBQUMsTUFBTSxJQUM3QyxhQUFhLEVBQUUsTUFBTSxDQUFDLGFBQW9CLEVBQzFDLGFBQWEsZUFBQSxFQUNiLGVBQWUsRUFBRSxNQUFNLENBQUMsZUFBZSxFQUN2QyxVQUFVLEVBQUUsTUFBTSxDQUFDLFVBQVUsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksNEJBQWUsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFDckYsYUFBYSxFQUFFLE1BQU0sQ0FBQyxhQUFhLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLDRCQUFlLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7b0JBQzNDLElBQUksRUFDbEQsdUJBQXVCLEVBQUUsRUFBRSxFQUMzQixrQkFBa0IsRUFBRSxJQUFJLEdBQ3pCLENBQUM7WUFDRixJQUFNLHNCQUFzQixHQUFHLFdBQVMsTUFBTSxDQUFDLElBQUksUUFBSyxDQUFDO1lBQ3pELE9BQU8sSUFBSSxDQUFDLHdCQUF3QixDQUFDLGNBQWMsRUFBRSxzQkFBc0IsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNyRixDQUFDO1FBRUQsd0RBQTJCLEdBQTNCLFVBQ0ksY0FBK0IsRUFBRSxZQUFvQixFQUNyRCxXQUFxQztZQUN2QyxJQUFNLGNBQWMsR0FDaEIsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFdBQVcsRUFBRSxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxZQUFZLENBQUMsQ0FBQztZQUNqRixJQUFNLElBQUksR0FBRyx1Q0FBdUMsQ0FBQyxXQUFXLEVBQUUsY0FBYyxFQUFFLFlBQVksQ0FBQyxDQUFDO1lBQ2hHLE9BQU8sSUFBSSxDQUFDLHdCQUF3QixDQUFDLGNBQWMsRUFBRSxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDM0UsQ0FBQztRQUVPLHFEQUF3QixHQUFoQyxVQUNJLGNBQStCLEVBQUUsWUFBb0IsRUFBRSxJQUF5QjtZQUNsRixJQUFNLFlBQVksR0FBRyxJQUFJLDRCQUFZLEVBQUUsQ0FBQztZQUN4QyxJQUFNLGFBQWEsR0FBRyw0QkFBaUIsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDNUQsSUFBTSxHQUFHLEdBQUcsdUNBQTRCLENBQUMsSUFBSSxFQUFFLFlBQVksRUFBRSxhQUFhLENBQUMsQ0FBQztZQUM1RSxPQUFPLElBQUksQ0FBQyxhQUFhLENBQ3JCLEdBQUcsQ0FBQyxVQUFVLEVBQUUsY0FBYyxFQUFFLFlBQVksRUFBRSxZQUFZLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDN0UsQ0FBQztRQUVELDJDQUFjLEdBQWQsVUFDSSxjQUErQixFQUFFLFlBQW9CLEVBQUUsSUFBZ0M7WUFDekYsSUFBTSxVQUFVLEdBQUcsbUNBQXNCLENBQUM7Z0JBQ3hDLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSTtnQkFDZixJQUFJLEVBQUUsb0JBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO2dCQUM5QixZQUFZLEVBQUUsSUFBSSw0QkFBZSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7Z0JBQzVDLGlCQUFpQixFQUFFLElBQUksQ0FBQyxpQkFBaUI7Z0JBQ3pDLElBQUksRUFBRSxnQ0FBZ0MsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO2dCQUNqRCxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU07YUFDcEIsQ0FBQyxDQUFDO1lBQ0gsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUNyQixVQUFVLENBQUMsVUFBVSxFQUFFLGNBQWMsRUFBRSxZQUFZLEVBQUUsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ2xGLENBQUM7UUFFRCxzREFBeUIsR0FBekIsVUFDSSxjQUErQixFQUFFLFlBQW9CLEVBQUUsSUFBNEI7WUFDckYsSUFBTSxVQUFVLEdBQUcsbUNBQXNCLENBQUM7Z0JBQ3hDLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUk7Z0JBQ3BCLElBQUksRUFBRSxvQkFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7Z0JBQzlCLFlBQVksRUFBRSxJQUFJLDRCQUFlLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztnQkFDNUMsaUJBQWlCLEVBQUUsQ0FBQztnQkFDcEIsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsa0NBQWtDLENBQUM7Z0JBQ3BFLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTTthQUNwQixDQUFDLENBQUM7WUFDSCxPQUFPLElBQUksQ0FBQyxhQUFhLENBQ3JCLFVBQVUsQ0FBQyxVQUFVLEVBQUUsY0FBYyxFQUFFLFlBQVksRUFBRSxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDbEYsQ0FBQztRQUdELGtEQUFxQixHQUFyQixVQUFzQixJQUFZLEVBQUUsUUFBZ0IsRUFBRSxTQUFpQjtZQUNyRSxPQUFPLGdDQUFtQixDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDeEQsQ0FBQztRQUVEOzs7Ozs7OztXQVFHO1FBQ0ssMENBQWEsR0FBckIsVUFDSSxHQUFlLEVBQUUsT0FBNkIsRUFBRSxTQUFpQixFQUNqRSxhQUEwQjtZQUM1QixnR0FBZ0c7WUFDaEcsK0ZBQStGO1lBQy9GLHFFQUFxRTtZQUNyRSxJQUFNLFVBQVUsa0VBQ1gsYUFBYTtnQkFDaEIsSUFBSSwyQkFBYyxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFFLENBQUMseUJBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQztjQUNwRSxDQUFDO1lBRUYsSUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxrQkFBa0IsQ0FDNUMsU0FBUyxFQUFFLFVBQVUsRUFBRSxJQUFJLHVCQUFjLENBQUMsT0FBTyxDQUFDLEVBQUUsc0JBQXNCLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDckYsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDckIsQ0FBQztRQUNILHlCQUFDO0lBQUQsQ0FBQyxBQTFQRCxJQTBQQztJQTFQWSxnREFBa0I7SUFpUS9CLElBQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBQyxRQUFRLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNuRCxJQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUMsVUFBVSxFQUFFLElBQUksRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDdkQsSUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ25ELElBQU0sWUFBWSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBQyxXQUFXLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUV6RCxTQUFTLHdCQUF3QixDQUFDLE1BQTZCO1FBQzdELDZDQUNLLE1BQU0sS0FDVCxTQUFTLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDbEIsSUFBSSw0QkFBZSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsRUFDbEYsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksNEJBQWUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFDM0QsTUFBTSxFQUFFLE1BQU0sQ0FBQyxNQUFNLEVBQ3JCLHVCQUF1QixFQUFFLE1BQU0sQ0FBQyx1QkFBdUIsSUFDdkQ7SUFDSixDQUFDO0lBRUQsU0FBUyxpQ0FBaUMsQ0FBQyxXQUF5Qzs7UUFFbEYsT0FBTztZQUNMLFlBQVksRUFBRSxXQUFXLENBQUMsWUFBWTtZQUN0QyxLQUFLLEVBQUUsTUFBQSxXQUFXLENBQUMsS0FBSyxtQ0FBSSxLQUFLO1lBQ2pDLFNBQVMsRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUN2QixJQUFJLDRCQUFlLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQztZQUM1RixXQUFXLEVBQUUsTUFBQSxXQUFXLENBQUMsV0FBVyxtQ0FBSSxLQUFLO1lBQzdDLElBQUksRUFBRSxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLDRCQUFlLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJO1lBQ3JFLE1BQU0sRUFBRSxNQUFBLFdBQVcsQ0FBQyxNQUFNLG1DQUFJLEtBQUs7WUFDbkMsdUJBQXVCLEVBQUUsTUFBQSxXQUFXLENBQUMsdUJBQXVCLG1DQUFJLElBQUk7U0FDckUsQ0FBQztJQUNKLENBQUM7SUFFRCxTQUFTLGdDQUFnQyxDQUFDLE1BQWlDO1FBQ3pFLElBQU0sa0JBQWtCLEdBQUcsaUJBQWlCLENBQUMsTUFBTSxDQUFDLE1BQU0sSUFBSSxFQUFFLENBQUMsQ0FBQztRQUNsRSxJQUFNLG1CQUFtQixHQUFHLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxPQUFPLElBQUksRUFBRSxDQUFDLENBQUM7UUFDcEUsSUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQztRQUN6QyxJQUFNLGNBQWMsR0FBd0IsRUFBRSxDQUFDO1FBQy9DLElBQU0sZUFBZSxHQUFjLEVBQUUsQ0FBQztnQ0FDM0IsS0FBSztZQUNkLElBQUksWUFBWSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFDdEMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFBLEdBQUc7b0JBQzdCLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFO3dCQUNoQixjQUFjLENBQUMsS0FBSyxDQUFDOzRCQUNqQixHQUFHLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLG1CQUFtQixFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7cUJBQ3hFO3lCQUFNLElBQUksUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFO3dCQUN4QixlQUFlLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxDQUFDLG1CQUFtQixJQUFJLEtBQUssQ0FBQztxQkFDM0Q7Z0JBQ0gsQ0FBQyxDQUFDLENBQUM7YUFDSjs7UUFWSCxLQUFLLElBQU0sS0FBSyxJQUFJLFlBQVk7b0JBQXJCLEtBQUs7U0FXZjtRQUVELDZDQUNLLE1BQXNELEtBQ3pELGlCQUFpQixFQUFFLENBQUMsRUFDcEIsY0FBYyxFQUFFLE1BQU0sQ0FBQyxjQUFjLEVBQ3JDLElBQUksRUFBRSxvQkFBYSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFDaEMsWUFBWSxFQUFFLElBQUksNEJBQWUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQzlDLElBQUksRUFBRSxJQUFJLEVBQ1YsSUFBSSxFQUFFLG1CQUFtQixDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsTUFBTSxDQUFDLGNBQWMsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQ2xGLE1BQU0sd0NBQU0sa0JBQWtCLEdBQUssY0FBYyxHQUNqRCxPQUFPLHdDQUFNLG1CQUFtQixHQUFLLGVBQWUsR0FDcEQsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLHdCQUF3QixDQUFDLEVBQ3JELFNBQVMsRUFBRSxNQUFNLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSw0QkFBZSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUNsRixXQUFXLEVBQUUsTUFBTSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsd0JBQXdCLENBQUMsRUFDN0QsZUFBZSxFQUFFLEtBQUssSUFDdEI7SUFDSixDQUFDO0lBRUQsU0FBUyx1Q0FBdUMsQ0FDNUMsV0FBcUMsRUFBRSxjQUErQjs7UUFDeEUsT0FBTztZQUNMLElBQUksRUFBRSxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUk7WUFDM0IsSUFBSSxFQUFFLG9CQUFhLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQztZQUNyQyxjQUFjLGdCQUFBO1lBQ2QsWUFBWSxFQUFFLElBQUksNEJBQWUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDO1lBQ25ELFFBQVEsRUFBRSxNQUFBLFdBQVcsQ0FBQyxRQUFRLG1DQUFJLElBQUk7WUFDdEMsTUFBTSxFQUFFLE1BQUEsV0FBVyxDQUFDLE1BQU0sbUNBQUksRUFBRTtZQUNoQyxPQUFPLEVBQUUsTUFBQSxXQUFXLENBQUMsT0FBTyxtQ0FBSSxFQUFFO1lBQ2xDLElBQUksRUFBRSxnQ0FBZ0MsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDO1lBQ3hELE9BQU8sRUFBRSxDQUFDLE1BQUEsV0FBVyxDQUFDLE9BQU8sbUNBQUksRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLGlDQUFpQyxDQUFDO1lBQzNFLFdBQVcsRUFBRSxDQUFDLE1BQUEsV0FBVyxDQUFDLFdBQVcsbUNBQUksRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLGlDQUFpQyxDQUFDO1lBQ25GLFNBQVMsRUFBRSxXQUFXLENBQUMsU0FBUyxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSw0QkFBZSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO2dCQUM1QyxJQUFJO1lBQ3JELFFBQVEsRUFBRSxNQUFBLFdBQVcsQ0FBQyxRQUFRLG1DQUFJLElBQUk7WUFDdEMsZUFBZSxFQUFFLE1BQUEsV0FBVyxDQUFDLGVBQWUsbUNBQUksS0FBSztZQUNyRCxTQUFTLEVBQUUsRUFBQyxhQUFhLEVBQUUsTUFBQSxXQUFXLENBQUMsYUFBYSxtQ0FBSSxLQUFLLEVBQUM7WUFDOUQsSUFBSSxFQUFFLElBQUk7WUFDVixpQkFBaUIsRUFBRSxDQUFDO1lBQ3BCLGVBQWUsRUFBRSxLQUFLO1NBQ3ZCLENBQUM7SUFDSixDQUFDO0lBRUQsU0FBUyxnQ0FBZ0MsQ0FBQyxJQUEyQzs7UUFBM0MscUJBQUEsRUFBQSxTQUEyQztRQUVuRixPQUFPO1lBQ0wsVUFBVSxFQUFFLGdDQUFnQyxDQUFDLE1BQUEsSUFBSSxDQUFDLFVBQVUsbUNBQUksRUFBRSxDQUFDO1lBQ25FLFNBQVMsRUFBRSxNQUFBLElBQUksQ0FBQyxTQUFTLG1DQUFJLEVBQUU7WUFDL0IsVUFBVSxFQUFFLE1BQUEsSUFBSSxDQUFDLFVBQVUsbUNBQUksRUFBRTtZQUNqQyxpQkFBaUIsRUFBRTtnQkFDakIsU0FBUyxFQUFFLElBQUksQ0FBQyxjQUFjO2dCQUM5QixTQUFTLEVBQUUsSUFBSSxDQUFDLGNBQWM7YUFDL0I7U0FDRixDQUFDO0lBQ0osQ0FBQztJQUVELFNBQVMsZ0NBQWdDLENBQUMsR0FBaUM7O1FBRXpFLElBQU0sTUFBTSxHQUE4QyxFQUFFLENBQUM7O1lBQzdELEtBQWtCLElBQUEsS0FBQSxpQkFBQSxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFBLGdCQUFBLDRCQUFFO2dCQUEvQixJQUFNLEdBQUcsV0FBQTtnQkFDWixNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSw0QkFBZSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2FBQzdDOzs7Ozs7Ozs7UUFDRCxPQUFPLE1BQU0sQ0FBQztJQUNoQixDQUFDO0lBRUQsU0FBUyx1Q0FBdUMsQ0FDNUMsV0FBcUMsRUFBRSxjQUErQixFQUN0RSxZQUFvQjs7UUFDaEIsSUFBQSxLQUE0QixnQkFBZ0IsQ0FDOUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxZQUFZLEVBQ3pELE1BQUEsV0FBVyxDQUFDLG1CQUFtQixtQ0FBSSxLQUFLLEVBQUUsV0FBVyxDQUFDLGFBQWEsQ0FBQyxFQUZqRSxRQUFRLGNBQUEsRUFBRSxhQUFhLG1CQUUwQyxDQUFDO1FBRXpFLDZDQUNLLHVDQUF1QyxDQUFDLFdBQVcsRUFBRSxjQUFjLENBQUMsS0FDdkUsUUFBUSxVQUFBLEVBQ1IsTUFBTSxFQUFFLE1BQUEsV0FBVyxDQUFDLE1BQU0sbUNBQUksRUFBRSxFQUNoQyxVQUFVLEVBQUUsQ0FBQyxNQUFBLFdBQVcsQ0FBQyxVQUFVLG1DQUFJLEVBQUUsQ0FBQztpQkFDekIsTUFBTSxDQUFDLE1BQUEsV0FBVyxDQUFDLFVBQVUsbUNBQUksRUFBRSxDQUFDO2lCQUNwQyxHQUFHLENBQUMseUNBQXlDLENBQUMsRUFDL0QsS0FBSyxFQUFFLDBCQUEwQixDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsRUFDcEQsYUFBYSxFQUFFLFdBQVcsQ0FBQyxhQUFhLEtBQUssU0FBUyxDQUFDLENBQUM7Z0JBQ3BELElBQUksNEJBQWUsQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztnQkFDaEQsSUFBSSxFQUNSLFVBQVUsRUFBRSxXQUFXLENBQUMsVUFBVSxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSw0QkFBZSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO2dCQUM3QyxJQUFJLEVBQ3ZELGVBQWUsRUFBRSxNQUFBLFdBQVcsQ0FBQyxlQUFlLG1DQUFJLDhCQUF1QixDQUFDLE9BQU8sRUFDL0UsYUFBYSxFQUFFLE1BQUEsV0FBVyxDQUFDLGFBQWEsbUNBQUksd0JBQWlCLENBQUMsUUFBUSxFQUN0RSxhQUFhLGVBQUEsRUFDYix1QkFBdUIsMkJBQ3ZCLHVCQUF1QixFQUFFLEVBQUUsRUFDM0Isa0JBQWtCLEVBQUUsSUFBSSxJQUN4QjtJQUNKLENBQUM7SUFFRCxTQUFTLHlDQUF5QyxDQUFDLFdBQXlDOztRQUUxRixPQUFPO1lBQ0wsUUFBUSxFQUFFLFdBQVcsQ0FBQyxRQUFRO1lBQzlCLElBQUksRUFBRSxJQUFJLDRCQUFlLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQztZQUMzQyxNQUFNLEVBQUUsTUFBQSxXQUFXLENBQUMsTUFBTSxtQ0FBSSxFQUFFO1lBQ2hDLE9BQU8sRUFBRSxNQUFBLFdBQVcsQ0FBQyxPQUFPLG1DQUFJLEVBQUU7WUFDbEMsUUFBUSxFQUFFLE1BQUEsV0FBVyxDQUFDLFFBQVEsbUNBQUksSUFBSTtTQUN2QyxDQUFDO0lBQ0osQ0FBQztJQUVELFNBQVMsMEJBQTBCLENBQUMsYUFBZ0Q7O1FBRWxGLElBQU0sS0FBSyxHQUFHLElBQUksR0FBRyxFQUFzQixDQUFDO1FBQzVDLElBQUksYUFBYSxLQUFLLFNBQVMsRUFBRTtZQUMvQixPQUFPLEtBQUssQ0FBQztTQUNkOztZQUVELEtBQXVCLElBQUEsS0FBQSxpQkFBQSxNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFBLGdCQUFBLDRCQUFFO2dCQUE5QyxJQUFNLFFBQVEsV0FBQTtnQkFDakIsSUFBTSxRQUFRLEdBQUcsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUN6QyxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxJQUFJLDRCQUFlLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQzthQUNwRDs7Ozs7Ozs7O1FBQ0QsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDO0lBRUQsU0FBUyxnQkFBZ0IsQ0FDckIsUUFBZ0IsRUFBRSxRQUFnQixFQUFFLFlBQW9CLEVBQUUsbUJBQTRCLEVBQ3RGLGFBQXlDO1FBQzNDLElBQU0sbUJBQW1CLEdBQ3JCLGFBQWEsQ0FBQyxDQUFDLENBQUMsMENBQW1CLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxtREFBNEIsQ0FBQztRQUNoRywyQ0FBMkM7UUFDM0MsSUFBTSxNQUFNLEdBQUcsd0JBQWEsQ0FDeEIsUUFBUSxFQUFFLFlBQVksRUFBRSxFQUFDLG1CQUFtQixFQUFFLG1CQUFtQixFQUFFLG1CQUFtQixxQkFBQSxFQUFDLENBQUMsQ0FBQztRQUM3RixJQUFJLE1BQU0sQ0FBQyxNQUFNLEtBQUssSUFBSSxFQUFFO1lBQzFCLElBQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFVBQUEsR0FBRyxJQUFJLE9BQUEsR0FBRyxDQUFDLFFBQVEsRUFBRSxFQUFkLENBQWMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNuRSxNQUFNLElBQUksS0FBSyxDQUFDLG1EQUFpRCxRQUFRLFVBQUssTUFBUSxDQUFDLENBQUM7U0FDekY7UUFDRCxPQUFPLEVBQUMsUUFBUSxFQUFFLE1BQU0sRUFBRSxhQUFhLEVBQUUsbUJBQW1CLEVBQUMsQ0FBQztJQUNoRSxDQUFDO0lBTUQ7Ozs7Ozs7T0FPRztJQUNILFNBQVMsMkJBQTJCLENBQUMsR0FBUSxFQUFFLFFBQWdCO1FBQzdELElBQUksR0FBRyxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsRUFBRTtZQUNoQyxPQUFPLGtEQUEwQixDQUFDLElBQUksNEJBQWUsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUNqRzthQUFNO1lBQ0wsT0FBTyxTQUFTLENBQUM7U0FDbEI7SUFDSCxDQUFDO0lBRUQsU0FBUyxjQUFjLENBQUMsR0FBUSxFQUFFLFFBQWdCO1FBQ2hELElBQUksR0FBRyxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsRUFBRTtZQUNoQyxPQUFPLElBQUksNEJBQWUsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztTQUMzQzthQUFNO1lBQ0wsT0FBTyxTQUFTLENBQUM7U0FDbEI7SUFDSCxDQUFDO0lBRUQsU0FBUyxpQkFBaUIsQ0FBQyxVQUEwQztRQUNuRSxJQUFNLFVBQVUsR0FBRyxDQUFDLFVBQVUsSUFBSSxJQUFJLElBQUksT0FBTyxVQUFVLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQztZQUN2RSxJQUFJLHdCQUFXLENBQUMsVUFBVSxhQUFWLFVBQVUsY0FBVixVQUFVLEdBQUksSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNyQyxJQUFJLDRCQUFlLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDcEMsdUVBQXVFO1FBQ3ZFLE9BQU8sa0RBQTBCLENBQUMsVUFBVSxFQUFFLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzFFLENBQUM7SUFFRCxTQUFTLGdDQUFnQyxDQUFDLE9BQ1M7UUFDakQsT0FBTyxPQUFPLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsMkJBQTJCLENBQUMsQ0FBQztJQUMzRSxDQUFDO0lBRUQsU0FBUywyQkFBMkIsQ0FBQyxNQUFrQztRQUNyRSxJQUFNLGNBQWMsR0FBRyxNQUFNLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxDQUFFLDhCQUE4QjtRQUNoRixJQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsS0FBSyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLDRCQUFlLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2xGLHVGQUF1RjtRQUN2Rix1Q0FBdUM7UUFDdkMsSUFBTSxLQUFLLEdBQUcsY0FBYyxDQUFDLENBQUMsQ0FBQyxJQUFJLDRCQUFlLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUM7UUFDaEYsT0FBTywwQkFBMEIsQ0FDN0IsS0FBSyxFQUFFLGNBQWMsRUFBRSxNQUFNLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDekYsQ0FBQztJQUVELFNBQVMsa0NBQWtDLENBQUMsTUFBeUM7O1FBRW5GLElBQU0sY0FBYyxHQUFHLE1BQUEsTUFBTSxDQUFDLFNBQVMsbUNBQUksS0FBSyxDQUFDO1FBQ2pELElBQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxLQUFLLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksNEJBQWUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDL0UsT0FBTywwQkFBMEIsQ0FDN0IsS0FBSyxFQUFFLGNBQWMsRUFBRSxNQUFBLE1BQU0sQ0FBQyxJQUFJLG1DQUFJLEtBQUssRUFBRSxNQUFBLE1BQU0sQ0FBQyxRQUFRLG1DQUFJLEtBQUssRUFBRSxNQUFBLE1BQU0sQ0FBQyxJQUFJLG1DQUFJLEtBQUssRUFDM0YsTUFBQSxNQUFNLENBQUMsUUFBUSxtQ0FBSSxLQUFLLENBQUMsQ0FBQztJQUNoQyxDQUFDO0lBRUQsU0FBUywwQkFBMEIsQ0FDL0IsS0FBb0MsRUFBRSxjQUF1QixFQUFFLElBQWEsRUFBRSxRQUFpQixFQUMvRixJQUFhLEVBQUUsUUFBaUI7UUFDbEMsMEZBQTBGO1FBQzFGLGtHQUFrRztRQUNsRyxVQUFVO1FBQ1YsSUFBTSxpQkFBaUIsR0FBRyxjQUFjLENBQUMsQ0FBQyxDQUFDLG9CQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUNyRSxPQUFPLEVBQUMsS0FBSyxPQUFBLEVBQUUsaUJBQWlCLG1CQUFBLEVBQUUsSUFBSSxNQUFBLEVBQUUsUUFBUSxVQUFBLEVBQUUsSUFBSSxNQUFBLEVBQUUsUUFBUSxVQUFBLEVBQUMsQ0FBQztJQUNwRSxDQUFDO0lBRUQsU0FBUyxtQkFBbUIsQ0FDeEIsWUFBb0MsRUFBRSxVQUEyQixFQUNqRSxJQUE4QjtRQUNoQyxrREFBa0Q7UUFDbEQsSUFBTSxRQUFRLEdBQUcsNEJBQWlCLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBRS9DLDRDQUE0QztRQUM1QyxJQUFNLE1BQU0sR0FBRyw2QkFBa0IsQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDeEQsSUFBSSxNQUFNLENBQUMsTUFBTSxFQUFFO1lBQ2pCLE1BQU0sSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxVQUFDLEtBQWlCLElBQUssT0FBQSxLQUFLLENBQUMsR0FBRyxFQUFULENBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1NBQzFFO2dDQUdVLEtBQUs7WUFDZCxJQUFJLFlBQVksQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQ3RDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBQSxHQUFHO29CQUM3QixJQUFJLGFBQWEsQ0FBQyxHQUFHLENBQUMsRUFBRTt3QkFDdEIsd0ZBQXdGO3dCQUN4Rix3RkFBd0Y7d0JBQ3hGLDhDQUE4Qzt3QkFDOUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLElBQUksS0FBSyxDQUFDOzRCQUM5QyxrQ0FBMkIsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7cUJBQ2hEO3lCQUFNLElBQUksY0FBYyxDQUFDLEdBQUcsQ0FBQyxFQUFFO3dCQUM5QixRQUFRLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxTQUFTLElBQUksS0FBSyxDQUFDLEdBQU0sS0FBSyxTQUFJLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQUcsQ0FBQztxQkFDeEY7Z0JBQ0gsQ0FBQyxDQUFDLENBQUM7YUFDSjs7UUFkSCw0RkFBNEY7UUFDNUYsS0FBSyxJQUFNLEtBQUssSUFBSSxZQUFZO29CQUFyQixLQUFLO1NBY2Y7UUFFRCxPQUFPLFFBQVEsQ0FBQztJQUNsQixDQUFDO0lBRUQsU0FBUyxhQUFhLENBQUMsS0FBVTtRQUMvQixPQUFPLEtBQUssQ0FBQyxjQUFjLEtBQUssYUFBYSxDQUFDO0lBQ2hELENBQUM7SUFFRCxTQUFTLGNBQWMsQ0FBQyxLQUFVO1FBQ2hDLE9BQU8sS0FBSyxDQUFDLGNBQWMsS0FBSyxjQUFjLENBQUM7SUFDakQsQ0FBQztJQUdELFNBQVMsT0FBTyxDQUFDLEtBQVU7UUFDekIsT0FBTyxLQUFLLENBQUMsY0FBYyxLQUFLLE9BQU8sQ0FBQztJQUMxQyxDQUFDO0lBRUQsU0FBUyxRQUFRLENBQUMsS0FBVTtRQUMxQixPQUFPLEtBQUssQ0FBQyxjQUFjLEtBQUssUUFBUSxDQUFDO0lBQzNDLENBQUM7SUFFRCxTQUFTLGlCQUFpQixDQUFDLE1BQWdCO1FBQ3pDLE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFDLEdBQUcsRUFBRSxLQUFLO1lBQ3hCLElBQUEsS0FBQSxlQUFvQixLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFBLEtBQUssSUFBSSxPQUFBLEtBQUssQ0FBQyxJQUFJLEVBQUUsRUFBWixDQUFZLENBQUMsSUFBQSxFQUE5RCxLQUFLLFFBQUEsRUFBRSxRQUFRLFFBQStDLENBQUM7WUFDdEUsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLFFBQVEsSUFBSSxLQUFLLENBQUM7WUFDL0IsT0FBTyxHQUFHLENBQUM7UUFDYixDQUFDLEVBQUUsRUFBZSxDQUFDLENBQUM7SUFDdEIsQ0FBQztJQUVELFNBQVMsa0NBQWtDLENBQUMsV0FBZ0M7O1FBQzFFLE9BQU87WUFDTCxJQUFJLEVBQUUsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJO1lBQzNCLElBQUksRUFBRSxvQkFBYSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUM7WUFDckMsWUFBWSxFQUFFLElBQUksNEJBQWUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDO1lBQ25ELGlCQUFpQixFQUFFLENBQUM7WUFDcEIsUUFBUSxFQUFFLFdBQVcsQ0FBQyxJQUFJO1lBQzFCLElBQUksRUFBRSxJQUFJO1lBQ1YsSUFBSSxFQUFFLE1BQUEsV0FBVyxDQUFDLElBQUksbUNBQUksSUFBSTtTQUMvQixDQUFDO0lBQ0osQ0FBQztJQUVELFNBQVMsc0NBQXNDLENBQUMsV0FBb0M7UUFFbEYsT0FBTztZQUNMLElBQUksRUFBRSxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUk7WUFDM0IsSUFBSSxFQUFFLG9CQUFhLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQztZQUNyQyxZQUFZLEVBQUUsSUFBSSw0QkFBZSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUM7WUFDbkQsU0FBUyxFQUFFLFdBQVcsQ0FBQyxTQUFTLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLDRCQUFlLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7Z0JBQzVDLElBQUk7WUFDckQsT0FBTyxFQUFFLFdBQVcsQ0FBQyxPQUFPLEtBQUssU0FBUyxDQUFDLENBQUM7Z0JBQ3hDLFdBQVcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsSUFBSSw0QkFBZSxDQUFDLENBQUMsQ0FBQyxFQUF0QixDQUFzQixDQUFDLENBQUMsQ0FBQztnQkFDdEQsRUFBRTtTQUNQLENBQUM7SUFDSixDQUFDO0lBRUQsU0FBZ0IsYUFBYSxDQUFDLE1BQVc7UUFDdkMsSUFBTSxFQUFFLEdBQTJCLE1BQU0sQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQ2pFLEVBQUUsQ0FBQyxlQUFlLEdBQUcsSUFBSSxrQkFBa0IsRUFBRSxDQUFDO0lBQ2hELENBQUM7SUFIRCxzQ0FHQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5cbmltcG9ydCB7Q29tcGlsZXJGYWNhZGUsIENvcmVFbnZpcm9ubWVudCwgRXhwb3J0ZWRDb21waWxlckZhY2FkZSwgT3BhcXVlVmFsdWUsIFIzQ29tcG9uZW50TWV0YWRhdGFGYWNhZGUsIFIzRGVjbGFyZUNvbXBvbmVudEZhY2FkZSwgUjNEZWNsYXJlRGVwZW5kZW5jeU1ldGFkYXRhRmFjYWRlLCBSM0RlY2xhcmVEaXJlY3RpdmVGYWNhZGUsIFIzRGVjbGFyZUZhY3RvcnlGYWNhZGUsIFIzRGVjbGFyZUluamVjdGFibGVGYWNhZGUsIFIzRGVjbGFyZUluamVjdG9yRmFjYWRlLCBSM0RlY2xhcmVOZ01vZHVsZUZhY2FkZSwgUjNEZWNsYXJlUGlwZUZhY2FkZSwgUjNEZWNsYXJlUXVlcnlNZXRhZGF0YUZhY2FkZSwgUjNEZWNsYXJlVXNlZERpcmVjdGl2ZUZhY2FkZSwgUjNEZXBlbmRlbmN5TWV0YWRhdGFGYWNhZGUsIFIzRGlyZWN0aXZlTWV0YWRhdGFGYWNhZGUsIFIzRmFjdG9yeURlZk1ldGFkYXRhRmFjYWRlLCBSM0luamVjdGFibGVNZXRhZGF0YUZhY2FkZSwgUjNJbmplY3Rvck1ldGFkYXRhRmFjYWRlLCBSM05nTW9kdWxlTWV0YWRhdGFGYWNhZGUsIFIzUGlwZU1ldGFkYXRhRmFjYWRlLCBSM1F1ZXJ5TWV0YWRhdGFGYWNhZGUsIFN0cmluZ01hcCwgU3RyaW5nTWFwV2l0aFJlbmFtZX0gZnJvbSAnLi9jb21waWxlcl9mYWNhZGVfaW50ZXJmYWNlJztcbmltcG9ydCB7Q29uc3RhbnRQb29sfSBmcm9tICcuL2NvbnN0YW50X3Bvb2wnO1xuaW1wb3J0IHtDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSwgSG9zdEJpbmRpbmcsIEhvc3RMaXN0ZW5lciwgSW5wdXQsIE91dHB1dCwgVmlld0VuY2Fwc3VsYXRpb259IGZyb20gJy4vY29yZSc7XG5pbXBvcnQge2NvbXBpbGVJbmplY3RhYmxlLCBjcmVhdGVSM1Byb3ZpZGVyRXhwcmVzc2lvbiwgUjNQcm92aWRlckV4cHJlc3Npb259IGZyb20gJy4vaW5qZWN0YWJsZV9jb21waWxlcl8yJztcbmltcG9ydCB7REVGQVVMVF9JTlRFUlBPTEFUSU9OX0NPTkZJRywgSW50ZXJwb2xhdGlvbkNvbmZpZ30gZnJvbSAnLi9tbF9wYXJzZXIvaW50ZXJwb2xhdGlvbl9jb25maWcnO1xuaW1wb3J0IHtEZWNsYXJlVmFyU3RtdCwgRXhwcmVzc2lvbiwgbGl0ZXJhbCwgTGl0ZXJhbEV4cHIsIFN0YXRlbWVudCwgU3RtdE1vZGlmaWVyLCBXcmFwcGVkTm9kZUV4cHJ9IGZyb20gJy4vb3V0cHV0L291dHB1dF9hc3QnO1xuaW1wb3J0IHtKaXRFdmFsdWF0b3J9IGZyb20gJy4vb3V0cHV0L291dHB1dF9qaXQnO1xuaW1wb3J0IHtQYXJzZUVycm9yLCBQYXJzZVNvdXJjZVNwYW4sIHIzSml0VHlwZVNvdXJjZVNwYW59IGZyb20gJy4vcGFyc2VfdXRpbCc7XG5pbXBvcnQge2NvbXBpbGVGYWN0b3J5RnVuY3Rpb24sIEZhY3RvcnlUYXJnZXQsIFIzRGVwZW5kZW5jeU1ldGFkYXRhfSBmcm9tICcuL3JlbmRlcjMvcjNfZmFjdG9yeSc7XG5pbXBvcnQge2NvbXBpbGVJbmplY3RvciwgUjNJbmplY3Rvck1ldGFkYXRhfSBmcm9tICcuL3JlbmRlcjMvcjNfaW5qZWN0b3JfY29tcGlsZXInO1xuaW1wb3J0IHtSM0ppdFJlZmxlY3Rvcn0gZnJvbSAnLi9yZW5kZXIzL3IzX2ppdCc7XG5pbXBvcnQge2NvbXBpbGVOZ01vZHVsZSwgY29tcGlsZU5nTW9kdWxlRGVjbGFyYXRpb25FeHByZXNzaW9uLCBSM05nTW9kdWxlTWV0YWRhdGF9IGZyb20gJy4vcmVuZGVyMy9yM19tb2R1bGVfY29tcGlsZXInO1xuaW1wb3J0IHtjb21waWxlUGlwZUZyb21NZXRhZGF0YSwgUjNQaXBlTWV0YWRhdGF9IGZyb20gJy4vcmVuZGVyMy9yM19waXBlX2NvbXBpbGVyJztcbmltcG9ydCB7Z2V0U2FmZVByb3BlcnR5QWNjZXNzU3RyaW5nLCB3cmFwUmVmZXJlbmNlfSBmcm9tICcuL3JlbmRlcjMvdXRpbCc7XG5pbXBvcnQge0RlY2xhcmF0aW9uTGlzdEVtaXRNb2RlLCBSM0NvbXBvbmVudE1ldGFkYXRhLCBSM0RpcmVjdGl2ZU1ldGFkYXRhLCBSM0hvc3RNZXRhZGF0YSwgUjNRdWVyeU1ldGFkYXRhLCBSM1VzZWREaXJlY3RpdmVNZXRhZGF0YX0gZnJvbSAnLi9yZW5kZXIzL3ZpZXcvYXBpJztcbmltcG9ydCB7Y29tcGlsZUNvbXBvbmVudEZyb21NZXRhZGF0YSwgY29tcGlsZURpcmVjdGl2ZUZyb21NZXRhZGF0YSwgUGFyc2VkSG9zdEJpbmRpbmdzLCBwYXJzZUhvc3RCaW5kaW5ncywgdmVyaWZ5SG9zdEJpbmRpbmdzfSBmcm9tICcuL3JlbmRlcjMvdmlldy9jb21waWxlcic7XG5pbXBvcnQge21ha2VCaW5kaW5nUGFyc2VyLCBwYXJzZVRlbXBsYXRlfSBmcm9tICcuL3JlbmRlcjMvdmlldy90ZW1wbGF0ZSc7XG5pbXBvcnQge1Jlc291cmNlTG9hZGVyfSBmcm9tICcuL3Jlc291cmNlX2xvYWRlcic7XG5pbXBvcnQge0RvbUVsZW1lbnRTY2hlbWFSZWdpc3RyeX0gZnJvbSAnLi9zY2hlbWEvZG9tX2VsZW1lbnRfc2NoZW1hX3JlZ2lzdHJ5JztcblxuZXhwb3J0IGNsYXNzIENvbXBpbGVyRmFjYWRlSW1wbCBpbXBsZW1lbnRzIENvbXBpbGVyRmFjYWRlIHtcbiAgRmFjdG9yeVRhcmdldCA9IEZhY3RvcnlUYXJnZXQgYXMgYW55O1xuICBSZXNvdXJjZUxvYWRlciA9IFJlc291cmNlTG9hZGVyO1xuICBwcml2YXRlIGVsZW1lbnRTY2hlbWFSZWdpc3RyeSA9IG5ldyBEb21FbGVtZW50U2NoZW1hUmVnaXN0cnkoKTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGppdEV2YWx1YXRvciA9IG5ldyBKaXRFdmFsdWF0b3IoKSkge31cblxuICBjb21waWxlUGlwZShhbmd1bGFyQ29yZUVudjogQ29yZUVudmlyb25tZW50LCBzb3VyY2VNYXBVcmw6IHN0cmluZywgZmFjYWRlOiBSM1BpcGVNZXRhZGF0YUZhY2FkZSk6XG4gICAgICBhbnkge1xuICAgIGNvbnN0IG1ldGFkYXRhOiBSM1BpcGVNZXRhZGF0YSA9IHtcbiAgICAgIG5hbWU6IGZhY2FkZS5uYW1lLFxuICAgICAgdHlwZTogd3JhcFJlZmVyZW5jZShmYWNhZGUudHlwZSksXG4gICAgICBpbnRlcm5hbFR5cGU6IG5ldyBXcmFwcGVkTm9kZUV4cHIoZmFjYWRlLnR5cGUpLFxuICAgICAgdHlwZUFyZ3VtZW50Q291bnQ6IDAsXG4gICAgICBkZXBzOiBudWxsLFxuICAgICAgcGlwZU5hbWU6IGZhY2FkZS5waXBlTmFtZSxcbiAgICAgIHB1cmU6IGZhY2FkZS5wdXJlLFxuICAgIH07XG4gICAgY29uc3QgcmVzID0gY29tcGlsZVBpcGVGcm9tTWV0YWRhdGEobWV0YWRhdGEpO1xuICAgIHJldHVybiB0aGlzLmppdEV4cHJlc3Npb24ocmVzLmV4cHJlc3Npb24sIGFuZ3VsYXJDb3JlRW52LCBzb3VyY2VNYXBVcmwsIFtdKTtcbiAgfVxuXG4gIGNvbXBpbGVQaXBlRGVjbGFyYXRpb24oXG4gICAgICBhbmd1bGFyQ29yZUVudjogQ29yZUVudmlyb25tZW50LCBzb3VyY2VNYXBVcmw6IHN0cmluZyxcbiAgICAgIGRlY2xhcmF0aW9uOiBSM0RlY2xhcmVQaXBlRmFjYWRlKTogYW55IHtcbiAgICBjb25zdCBtZXRhID0gY29udmVydERlY2xhcmVQaXBlRmFjYWRlVG9NZXRhZGF0YShkZWNsYXJhdGlvbik7XG4gICAgY29uc3QgcmVzID0gY29tcGlsZVBpcGVGcm9tTWV0YWRhdGEobWV0YSk7XG4gICAgcmV0dXJuIHRoaXMuaml0RXhwcmVzc2lvbihyZXMuZXhwcmVzc2lvbiwgYW5ndWxhckNvcmVFbnYsIHNvdXJjZU1hcFVybCwgW10pO1xuICB9XG5cbiAgY29tcGlsZUluamVjdGFibGUoXG4gICAgICBhbmd1bGFyQ29yZUVudjogQ29yZUVudmlyb25tZW50LCBzb3VyY2VNYXBVcmw6IHN0cmluZyxcbiAgICAgIGZhY2FkZTogUjNJbmplY3RhYmxlTWV0YWRhdGFGYWNhZGUpOiBhbnkge1xuICAgIGNvbnN0IHtleHByZXNzaW9uLCBzdGF0ZW1lbnRzfSA9IGNvbXBpbGVJbmplY3RhYmxlKFxuICAgICAgICB7XG4gICAgICAgICAgbmFtZTogZmFjYWRlLm5hbWUsXG4gICAgICAgICAgdHlwZTogd3JhcFJlZmVyZW5jZShmYWNhZGUudHlwZSksXG4gICAgICAgICAgaW50ZXJuYWxUeXBlOiBuZXcgV3JhcHBlZE5vZGVFeHByKGZhY2FkZS50eXBlKSxcbiAgICAgICAgICB0eXBlQXJndW1lbnRDb3VudDogZmFjYWRlLnR5cGVBcmd1bWVudENvdW50LFxuICAgICAgICAgIHByb3ZpZGVkSW46IGNvbXB1dGVQcm92aWRlZEluKGZhY2FkZS5wcm92aWRlZEluKSxcbiAgICAgICAgICB1c2VDbGFzczogY29udmVydFRvUHJvdmlkZXJFeHByZXNzaW9uKGZhY2FkZSwgVVNFX0NMQVNTKSxcbiAgICAgICAgICB1c2VGYWN0b3J5OiB3cmFwRXhwcmVzc2lvbihmYWNhZGUsIFVTRV9GQUNUT1JZKSxcbiAgICAgICAgICB1c2VWYWx1ZTogY29udmVydFRvUHJvdmlkZXJFeHByZXNzaW9uKGZhY2FkZSwgVVNFX1ZBTFVFKSxcbiAgICAgICAgICB1c2VFeGlzdGluZzogY29udmVydFRvUHJvdmlkZXJFeHByZXNzaW9uKGZhY2FkZSwgVVNFX0VYSVNUSU5HKSxcbiAgICAgICAgICBkZXBzOiBmYWNhZGUuZGVwcz8ubWFwKGNvbnZlcnRSM0RlcGVuZGVuY3lNZXRhZGF0YSksXG4gICAgICAgIH0sXG4gICAgICAgIC8qIHJlc29sdmVGb3J3YXJkUmVmcyAqLyB0cnVlKTtcblxuICAgIHJldHVybiB0aGlzLmppdEV4cHJlc3Npb24oZXhwcmVzc2lvbiwgYW5ndWxhckNvcmVFbnYsIHNvdXJjZU1hcFVybCwgc3RhdGVtZW50cyk7XG4gIH1cblxuICBjb21waWxlSW5qZWN0YWJsZURlY2xhcmF0aW9uKFxuICAgICAgYW5ndWxhckNvcmVFbnY6IENvcmVFbnZpcm9ubWVudCwgc291cmNlTWFwVXJsOiBzdHJpbmcsXG4gICAgICBmYWNhZGU6IFIzRGVjbGFyZUluamVjdGFibGVGYWNhZGUpOiBhbnkge1xuICAgIGNvbnN0IHtleHByZXNzaW9uLCBzdGF0ZW1lbnRzfSA9IGNvbXBpbGVJbmplY3RhYmxlKFxuICAgICAgICB7XG4gICAgICAgICAgbmFtZTogZmFjYWRlLnR5cGUubmFtZSxcbiAgICAgICAgICB0eXBlOiB3cmFwUmVmZXJlbmNlKGZhY2FkZS50eXBlKSxcbiAgICAgICAgICBpbnRlcm5hbFR5cGU6IG5ldyBXcmFwcGVkTm9kZUV4cHIoZmFjYWRlLnR5cGUpLFxuICAgICAgICAgIHR5cGVBcmd1bWVudENvdW50OiAwLFxuICAgICAgICAgIHByb3ZpZGVkSW46IGNvbXB1dGVQcm92aWRlZEluKGZhY2FkZS5wcm92aWRlZEluKSxcbiAgICAgICAgICB1c2VDbGFzczogY29udmVydFRvUHJvdmlkZXJFeHByZXNzaW9uKGZhY2FkZSwgVVNFX0NMQVNTKSxcbiAgICAgICAgICB1c2VGYWN0b3J5OiB3cmFwRXhwcmVzc2lvbihmYWNhZGUsIFVTRV9GQUNUT1JZKSxcbiAgICAgICAgICB1c2VWYWx1ZTogY29udmVydFRvUHJvdmlkZXJFeHByZXNzaW9uKGZhY2FkZSwgVVNFX1ZBTFVFKSxcbiAgICAgICAgICB1c2VFeGlzdGluZzogY29udmVydFRvUHJvdmlkZXJFeHByZXNzaW9uKGZhY2FkZSwgVVNFX0VYSVNUSU5HKSxcbiAgICAgICAgICBkZXBzOiBmYWNhZGUuZGVwcz8ubWFwKGNvbnZlcnRSM0RlY2xhcmVEZXBlbmRlbmN5TWV0YWRhdGEpLFxuICAgICAgICB9LFxuICAgICAgICAvKiByZXNvbHZlRm9yd2FyZFJlZnMgKi8gdHJ1ZSk7XG5cbiAgICByZXR1cm4gdGhpcy5qaXRFeHByZXNzaW9uKGV4cHJlc3Npb24sIGFuZ3VsYXJDb3JlRW52LCBzb3VyY2VNYXBVcmwsIHN0YXRlbWVudHMpO1xuICB9XG5cbiAgY29tcGlsZUluamVjdG9yKFxuICAgICAgYW5ndWxhckNvcmVFbnY6IENvcmVFbnZpcm9ubWVudCwgc291cmNlTWFwVXJsOiBzdHJpbmcsXG4gICAgICBmYWNhZGU6IFIzSW5qZWN0b3JNZXRhZGF0YUZhY2FkZSk6IGFueSB7XG4gICAgY29uc3QgbWV0YTogUjNJbmplY3Rvck1ldGFkYXRhID0ge1xuICAgICAgbmFtZTogZmFjYWRlLm5hbWUsXG4gICAgICB0eXBlOiB3cmFwUmVmZXJlbmNlKGZhY2FkZS50eXBlKSxcbiAgICAgIGludGVybmFsVHlwZTogbmV3IFdyYXBwZWROb2RlRXhwcihmYWNhZGUudHlwZSksXG4gICAgICBwcm92aWRlcnM6IG5ldyBXcmFwcGVkTm9kZUV4cHIoZmFjYWRlLnByb3ZpZGVycyksXG4gICAgICBpbXBvcnRzOiBmYWNhZGUuaW1wb3J0cy5tYXAoaSA9PiBuZXcgV3JhcHBlZE5vZGVFeHByKGkpKSxcbiAgICB9O1xuICAgIGNvbnN0IHJlcyA9IGNvbXBpbGVJbmplY3RvcihtZXRhKTtcbiAgICByZXR1cm4gdGhpcy5qaXRFeHByZXNzaW9uKHJlcy5leHByZXNzaW9uLCBhbmd1bGFyQ29yZUVudiwgc291cmNlTWFwVXJsLCBbXSk7XG4gIH1cblxuICBjb21waWxlSW5qZWN0b3JEZWNsYXJhdGlvbihcbiAgICAgIGFuZ3VsYXJDb3JlRW52OiBDb3JlRW52aXJvbm1lbnQsIHNvdXJjZU1hcFVybDogc3RyaW5nLFxuICAgICAgZGVjbGFyYXRpb246IFIzRGVjbGFyZUluamVjdG9yRmFjYWRlKTogYW55IHtcbiAgICBjb25zdCBtZXRhID0gY29udmVydERlY2xhcmVJbmplY3RvckZhY2FkZVRvTWV0YWRhdGEoZGVjbGFyYXRpb24pO1xuICAgIGNvbnN0IHJlcyA9IGNvbXBpbGVJbmplY3RvcihtZXRhKTtcbiAgICByZXR1cm4gdGhpcy5qaXRFeHByZXNzaW9uKHJlcy5leHByZXNzaW9uLCBhbmd1bGFyQ29yZUVudiwgc291cmNlTWFwVXJsLCBbXSk7XG4gIH1cblxuICBjb21waWxlTmdNb2R1bGUoXG4gICAgICBhbmd1bGFyQ29yZUVudjogQ29yZUVudmlyb25tZW50LCBzb3VyY2VNYXBVcmw6IHN0cmluZyxcbiAgICAgIGZhY2FkZTogUjNOZ01vZHVsZU1ldGFkYXRhRmFjYWRlKTogYW55IHtcbiAgICBjb25zdCBtZXRhOiBSM05nTW9kdWxlTWV0YWRhdGEgPSB7XG4gICAgICB0eXBlOiB3cmFwUmVmZXJlbmNlKGZhY2FkZS50eXBlKSxcbiAgICAgIGludGVybmFsVHlwZTogbmV3IFdyYXBwZWROb2RlRXhwcihmYWNhZGUudHlwZSksXG4gICAgICBhZGphY2VudFR5cGU6IG5ldyBXcmFwcGVkTm9kZUV4cHIoZmFjYWRlLnR5cGUpLFxuICAgICAgYm9vdHN0cmFwOiBmYWNhZGUuYm9vdHN0cmFwLm1hcCh3cmFwUmVmZXJlbmNlKSxcbiAgICAgIGRlY2xhcmF0aW9uczogZmFjYWRlLmRlY2xhcmF0aW9ucy5tYXAod3JhcFJlZmVyZW5jZSksXG4gICAgICBpbXBvcnRzOiBmYWNhZGUuaW1wb3J0cy5tYXAod3JhcFJlZmVyZW5jZSksXG4gICAgICBleHBvcnRzOiBmYWNhZGUuZXhwb3J0cy5tYXAod3JhcFJlZmVyZW5jZSksXG4gICAgICBlbWl0SW5saW5lOiB0cnVlLFxuICAgICAgY29udGFpbnNGb3J3YXJkRGVjbHM6IGZhbHNlLFxuICAgICAgc2NoZW1hczogZmFjYWRlLnNjaGVtYXMgPyBmYWNhZGUuc2NoZW1hcy5tYXAod3JhcFJlZmVyZW5jZSkgOiBudWxsLFxuICAgICAgaWQ6IGZhY2FkZS5pZCA/IG5ldyBXcmFwcGVkTm9kZUV4cHIoZmFjYWRlLmlkKSA6IG51bGwsXG4gICAgfTtcbiAgICBjb25zdCByZXMgPSBjb21waWxlTmdNb2R1bGUobWV0YSk7XG4gICAgcmV0dXJuIHRoaXMuaml0RXhwcmVzc2lvbihyZXMuZXhwcmVzc2lvbiwgYW5ndWxhckNvcmVFbnYsIHNvdXJjZU1hcFVybCwgW10pO1xuICB9XG5cbiAgY29tcGlsZU5nTW9kdWxlRGVjbGFyYXRpb24oXG4gICAgICBhbmd1bGFyQ29yZUVudjogQ29yZUVudmlyb25tZW50LCBzb3VyY2VNYXBVcmw6IHN0cmluZyxcbiAgICAgIGRlY2xhcmF0aW9uOiBSM0RlY2xhcmVOZ01vZHVsZUZhY2FkZSk6IGFueSB7XG4gICAgY29uc3QgZXhwcmVzc2lvbiA9IGNvbXBpbGVOZ01vZHVsZURlY2xhcmF0aW9uRXhwcmVzc2lvbihkZWNsYXJhdGlvbik7XG4gICAgcmV0dXJuIHRoaXMuaml0RXhwcmVzc2lvbihleHByZXNzaW9uLCBhbmd1bGFyQ29yZUVudiwgc291cmNlTWFwVXJsLCBbXSk7XG4gIH1cblxuICBjb21waWxlRGlyZWN0aXZlKFxuICAgICAgYW5ndWxhckNvcmVFbnY6IENvcmVFbnZpcm9ubWVudCwgc291cmNlTWFwVXJsOiBzdHJpbmcsXG4gICAgICBmYWNhZGU6IFIzRGlyZWN0aXZlTWV0YWRhdGFGYWNhZGUpOiBhbnkge1xuICAgIGNvbnN0IG1ldGE6IFIzRGlyZWN0aXZlTWV0YWRhdGEgPSBjb252ZXJ0RGlyZWN0aXZlRmFjYWRlVG9NZXRhZGF0YShmYWNhZGUpO1xuICAgIHJldHVybiB0aGlzLmNvbXBpbGVEaXJlY3RpdmVGcm9tTWV0YShhbmd1bGFyQ29yZUVudiwgc291cmNlTWFwVXJsLCBtZXRhKTtcbiAgfVxuXG4gIGNvbXBpbGVEaXJlY3RpdmVEZWNsYXJhdGlvbihcbiAgICAgIGFuZ3VsYXJDb3JlRW52OiBDb3JlRW52aXJvbm1lbnQsIHNvdXJjZU1hcFVybDogc3RyaW5nLFxuICAgICAgZGVjbGFyYXRpb246IFIzRGVjbGFyZURpcmVjdGl2ZUZhY2FkZSk6IGFueSB7XG4gICAgY29uc3QgdHlwZVNvdXJjZVNwYW4gPVxuICAgICAgICB0aGlzLmNyZWF0ZVBhcnNlU291cmNlU3BhbignRGlyZWN0aXZlJywgZGVjbGFyYXRpb24udHlwZS5uYW1lLCBzb3VyY2VNYXBVcmwpO1xuICAgIGNvbnN0IG1ldGEgPSBjb252ZXJ0RGVjbGFyZURpcmVjdGl2ZUZhY2FkZVRvTWV0YWRhdGEoZGVjbGFyYXRpb24sIHR5cGVTb3VyY2VTcGFuKTtcbiAgICByZXR1cm4gdGhpcy5jb21waWxlRGlyZWN0aXZlRnJvbU1ldGEoYW5ndWxhckNvcmVFbnYsIHNvdXJjZU1hcFVybCwgbWV0YSk7XG4gIH1cblxuICBwcml2YXRlIGNvbXBpbGVEaXJlY3RpdmVGcm9tTWV0YShcbiAgICAgIGFuZ3VsYXJDb3JlRW52OiBDb3JlRW52aXJvbm1lbnQsIHNvdXJjZU1hcFVybDogc3RyaW5nLCBtZXRhOiBSM0RpcmVjdGl2ZU1ldGFkYXRhKTogYW55IHtcbiAgICBjb25zdCBjb25zdGFudFBvb2wgPSBuZXcgQ29uc3RhbnRQb29sKCk7XG4gICAgY29uc3QgYmluZGluZ1BhcnNlciA9IG1ha2VCaW5kaW5nUGFyc2VyKCk7XG4gICAgY29uc3QgcmVzID0gY29tcGlsZURpcmVjdGl2ZUZyb21NZXRhZGF0YShtZXRhLCBjb25zdGFudFBvb2wsIGJpbmRpbmdQYXJzZXIpO1xuICAgIHJldHVybiB0aGlzLmppdEV4cHJlc3Npb24oXG4gICAgICAgIHJlcy5leHByZXNzaW9uLCBhbmd1bGFyQ29yZUVudiwgc291cmNlTWFwVXJsLCBjb25zdGFudFBvb2wuc3RhdGVtZW50cyk7XG4gIH1cblxuICBjb21waWxlQ29tcG9uZW50KFxuICAgICAgYW5ndWxhckNvcmVFbnY6IENvcmVFbnZpcm9ubWVudCwgc291cmNlTWFwVXJsOiBzdHJpbmcsXG4gICAgICBmYWNhZGU6IFIzQ29tcG9uZW50TWV0YWRhdGFGYWNhZGUpOiBhbnkge1xuICAgIC8vIFBhcnNlIHRoZSB0ZW1wbGF0ZSBhbmQgY2hlY2sgZm9yIGVycm9ycy5cbiAgICBjb25zdCB7dGVtcGxhdGUsIGludGVycG9sYXRpb259ID0gcGFyc2VKaXRUZW1wbGF0ZShcbiAgICAgICAgZmFjYWRlLnRlbXBsYXRlLCBmYWNhZGUubmFtZSwgc291cmNlTWFwVXJsLCBmYWNhZGUucHJlc2VydmVXaGl0ZXNwYWNlcyxcbiAgICAgICAgZmFjYWRlLmludGVycG9sYXRpb24pO1xuXG4gICAgLy8gQ29tcGlsZSB0aGUgY29tcG9uZW50IG1ldGFkYXRhLCBpbmNsdWRpbmcgdGVtcGxhdGUsIGludG8gYW4gZXhwcmVzc2lvbi5cbiAgICBjb25zdCBtZXRhOiBSM0NvbXBvbmVudE1ldGFkYXRhID0ge1xuICAgICAgLi4uZmFjYWRlIGFzIFIzQ29tcG9uZW50TWV0YWRhdGFGYWNhZGVOb1Byb3BBbmRXaGl0ZXNwYWNlLFxuICAgICAgLi4uY29udmVydERpcmVjdGl2ZUZhY2FkZVRvTWV0YWRhdGEoZmFjYWRlKSxcbiAgICAgIHNlbGVjdG9yOiBmYWNhZGUuc2VsZWN0b3IgfHwgdGhpcy5lbGVtZW50U2NoZW1hUmVnaXN0cnkuZ2V0RGVmYXVsdENvbXBvbmVudEVsZW1lbnROYW1lKCksXG4gICAgICB0ZW1wbGF0ZSxcbiAgICAgIGRlY2xhcmF0aW9uTGlzdEVtaXRNb2RlOiBEZWNsYXJhdGlvbkxpc3RFbWl0TW9kZS5EaXJlY3QsXG4gICAgICBzdHlsZXM6IFsuLi5mYWNhZGUuc3R5bGVzLCAuLi50ZW1wbGF0ZS5zdHlsZXNdLFxuICAgICAgZW5jYXBzdWxhdGlvbjogZmFjYWRlLmVuY2Fwc3VsYXRpb24gYXMgYW55LFxuICAgICAgaW50ZXJwb2xhdGlvbixcbiAgICAgIGNoYW5nZURldGVjdGlvbjogZmFjYWRlLmNoYW5nZURldGVjdGlvbixcbiAgICAgIGFuaW1hdGlvbnM6IGZhY2FkZS5hbmltYXRpb25zICE9IG51bGwgPyBuZXcgV3JhcHBlZE5vZGVFeHByKGZhY2FkZS5hbmltYXRpb25zKSA6IG51bGwsXG4gICAgICB2aWV3UHJvdmlkZXJzOiBmYWNhZGUudmlld1Byb3ZpZGVycyAhPSBudWxsID8gbmV3IFdyYXBwZWROb2RlRXhwcihmYWNhZGUudmlld1Byb3ZpZGVycykgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICByZWxhdGl2ZUNvbnRleHRGaWxlUGF0aDogJycsXG4gICAgICBpMThuVXNlRXh0ZXJuYWxJZHM6IHRydWUsXG4gICAgfTtcbiAgICBjb25zdCBqaXRFeHByZXNzaW9uU291cmNlTWFwID0gYG5nOi8vLyR7ZmFjYWRlLm5hbWV9LmpzYDtcbiAgICByZXR1cm4gdGhpcy5jb21waWxlQ29tcG9uZW50RnJvbU1ldGEoYW5ndWxhckNvcmVFbnYsIGppdEV4cHJlc3Npb25Tb3VyY2VNYXAsIG1ldGEpO1xuICB9XG5cbiAgY29tcGlsZUNvbXBvbmVudERlY2xhcmF0aW9uKFxuICAgICAgYW5ndWxhckNvcmVFbnY6IENvcmVFbnZpcm9ubWVudCwgc291cmNlTWFwVXJsOiBzdHJpbmcsXG4gICAgICBkZWNsYXJhdGlvbjogUjNEZWNsYXJlQ29tcG9uZW50RmFjYWRlKTogYW55IHtcbiAgICBjb25zdCB0eXBlU291cmNlU3BhbiA9XG4gICAgICAgIHRoaXMuY3JlYXRlUGFyc2VTb3VyY2VTcGFuKCdDb21wb25lbnQnLCBkZWNsYXJhdGlvbi50eXBlLm5hbWUsIHNvdXJjZU1hcFVybCk7XG4gICAgY29uc3QgbWV0YSA9IGNvbnZlcnREZWNsYXJlQ29tcG9uZW50RmFjYWRlVG9NZXRhZGF0YShkZWNsYXJhdGlvbiwgdHlwZVNvdXJjZVNwYW4sIHNvdXJjZU1hcFVybCk7XG4gICAgcmV0dXJuIHRoaXMuY29tcGlsZUNvbXBvbmVudEZyb21NZXRhKGFuZ3VsYXJDb3JlRW52LCBzb3VyY2VNYXBVcmwsIG1ldGEpO1xuICB9XG5cbiAgcHJpdmF0ZSBjb21waWxlQ29tcG9uZW50RnJvbU1ldGEoXG4gICAgICBhbmd1bGFyQ29yZUVudjogQ29yZUVudmlyb25tZW50LCBzb3VyY2VNYXBVcmw6IHN0cmluZywgbWV0YTogUjNDb21wb25lbnRNZXRhZGF0YSk6IGFueSB7XG4gICAgY29uc3QgY29uc3RhbnRQb29sID0gbmV3IENvbnN0YW50UG9vbCgpO1xuICAgIGNvbnN0IGJpbmRpbmdQYXJzZXIgPSBtYWtlQmluZGluZ1BhcnNlcihtZXRhLmludGVycG9sYXRpb24pO1xuICAgIGNvbnN0IHJlcyA9IGNvbXBpbGVDb21wb25lbnRGcm9tTWV0YWRhdGEobWV0YSwgY29uc3RhbnRQb29sLCBiaW5kaW5nUGFyc2VyKTtcbiAgICByZXR1cm4gdGhpcy5qaXRFeHByZXNzaW9uKFxuICAgICAgICByZXMuZXhwcmVzc2lvbiwgYW5ndWxhckNvcmVFbnYsIHNvdXJjZU1hcFVybCwgY29uc3RhbnRQb29sLnN0YXRlbWVudHMpO1xuICB9XG5cbiAgY29tcGlsZUZhY3RvcnkoXG4gICAgICBhbmd1bGFyQ29yZUVudjogQ29yZUVudmlyb25tZW50LCBzb3VyY2VNYXBVcmw6IHN0cmluZywgbWV0YTogUjNGYWN0b3J5RGVmTWV0YWRhdGFGYWNhZGUpIHtcbiAgICBjb25zdCBmYWN0b3J5UmVzID0gY29tcGlsZUZhY3RvcnlGdW5jdGlvbih7XG4gICAgICBuYW1lOiBtZXRhLm5hbWUsXG4gICAgICB0eXBlOiB3cmFwUmVmZXJlbmNlKG1ldGEudHlwZSksXG4gICAgICBpbnRlcm5hbFR5cGU6IG5ldyBXcmFwcGVkTm9kZUV4cHIobWV0YS50eXBlKSxcbiAgICAgIHR5cGVBcmd1bWVudENvdW50OiBtZXRhLnR5cGVBcmd1bWVudENvdW50LFxuICAgICAgZGVwczogY29udmVydFIzRGVwZW5kZW5jeU1ldGFkYXRhQXJyYXkobWV0YS5kZXBzKSxcbiAgICAgIHRhcmdldDogbWV0YS50YXJnZXQsXG4gICAgfSk7XG4gICAgcmV0dXJuIHRoaXMuaml0RXhwcmVzc2lvbihcbiAgICAgICAgZmFjdG9yeVJlcy5leHByZXNzaW9uLCBhbmd1bGFyQ29yZUVudiwgc291cmNlTWFwVXJsLCBmYWN0b3J5UmVzLnN0YXRlbWVudHMpO1xuICB9XG5cbiAgY29tcGlsZUZhY3RvcnlEZWNsYXJhdGlvbihcbiAgICAgIGFuZ3VsYXJDb3JlRW52OiBDb3JlRW52aXJvbm1lbnQsIHNvdXJjZU1hcFVybDogc3RyaW5nLCBtZXRhOiBSM0RlY2xhcmVGYWN0b3J5RmFjYWRlKSB7XG4gICAgY29uc3QgZmFjdG9yeVJlcyA9IGNvbXBpbGVGYWN0b3J5RnVuY3Rpb24oe1xuICAgICAgbmFtZTogbWV0YS50eXBlLm5hbWUsXG4gICAgICB0eXBlOiB3cmFwUmVmZXJlbmNlKG1ldGEudHlwZSksXG4gICAgICBpbnRlcm5hbFR5cGU6IG5ldyBXcmFwcGVkTm9kZUV4cHIobWV0YS50eXBlKSxcbiAgICAgIHR5cGVBcmd1bWVudENvdW50OiAwLFxuICAgICAgZGVwczogbWV0YS5kZXBzICYmIG1ldGEuZGVwcy5tYXAoY29udmVydFIzRGVjbGFyZURlcGVuZGVuY3lNZXRhZGF0YSksXG4gICAgICB0YXJnZXQ6IG1ldGEudGFyZ2V0LFxuICAgIH0pO1xuICAgIHJldHVybiB0aGlzLmppdEV4cHJlc3Npb24oXG4gICAgICAgIGZhY3RvcnlSZXMuZXhwcmVzc2lvbiwgYW5ndWxhckNvcmVFbnYsIHNvdXJjZU1hcFVybCwgZmFjdG9yeVJlcy5zdGF0ZW1lbnRzKTtcbiAgfVxuXG5cbiAgY3JlYXRlUGFyc2VTb3VyY2VTcGFuKGtpbmQ6IHN0cmluZywgdHlwZU5hbWU6IHN0cmluZywgc291cmNlVXJsOiBzdHJpbmcpOiBQYXJzZVNvdXJjZVNwYW4ge1xuICAgIHJldHVybiByM0ppdFR5cGVTb3VyY2VTcGFuKGtpbmQsIHR5cGVOYW1lLCBzb3VyY2VVcmwpO1xuICB9XG5cbiAgLyoqXG4gICAqIEpJVCBjb21waWxlcyBhbiBleHByZXNzaW9uIGFuZCByZXR1cm5zIHRoZSByZXN1bHQgb2YgZXhlY3V0aW5nIHRoYXQgZXhwcmVzc2lvbi5cbiAgICpcbiAgICogQHBhcmFtIGRlZiB0aGUgZGVmaW5pdGlvbiB3aGljaCB3aWxsIGJlIGNvbXBpbGVkIGFuZCBleGVjdXRlZCB0byBnZXQgdGhlIHZhbHVlIHRvIHBhdGNoXG4gICAqIEBwYXJhbSBjb250ZXh0IGFuIG9iamVjdCBtYXAgb2YgQGFuZ3VsYXIvY29yZSBzeW1ib2wgbmFtZXMgdG8gc3ltYm9scyB3aGljaCB3aWxsIGJlIGF2YWlsYWJsZVxuICAgKiBpbiB0aGUgY29udGV4dCBvZiB0aGUgY29tcGlsZWQgZXhwcmVzc2lvblxuICAgKiBAcGFyYW0gc291cmNlVXJsIGEgVVJMIHRvIHVzZSBmb3IgdGhlIHNvdXJjZSBtYXAgb2YgdGhlIGNvbXBpbGVkIGV4cHJlc3Npb25cbiAgICogQHBhcmFtIHByZVN0YXRlbWVudHMgYSBjb2xsZWN0aW9uIG9mIHN0YXRlbWVudHMgdGhhdCBzaG91bGQgYmUgZXZhbHVhdGVkIGJlZm9yZSB0aGUgZXhwcmVzc2lvbi5cbiAgICovXG4gIHByaXZhdGUgaml0RXhwcmVzc2lvbihcbiAgICAgIGRlZjogRXhwcmVzc2lvbiwgY29udGV4dDoge1trZXk6IHN0cmluZ106IGFueX0sIHNvdXJjZVVybDogc3RyaW5nLFxuICAgICAgcHJlU3RhdGVtZW50czogU3RhdGVtZW50W10pOiBhbnkge1xuICAgIC8vIFRoZSBDb25zdGFudFBvb2wgbWF5IGNvbnRhaW4gU3RhdGVtZW50cyB3aGljaCBkZWNsYXJlIHZhcmlhYmxlcyB1c2VkIGluIHRoZSBmaW5hbCBleHByZXNzaW9uLlxuICAgIC8vIFRoZXJlZm9yZSwgaXRzIHN0YXRlbWVudHMgbmVlZCB0byBwcmVjZWRlIHRoZSBhY3R1YWwgSklUIG9wZXJhdGlvbi4gVGhlIGZpbmFsIHN0YXRlbWVudCBpcyBhXG4gICAgLy8gZGVjbGFyYXRpb24gb2YgJGRlZiB3aGljaCBpcyBzZXQgdG8gdGhlIGV4cHJlc3Npb24gYmVpbmcgY29tcGlsZWQuXG4gICAgY29uc3Qgc3RhdGVtZW50czogU3RhdGVtZW50W10gPSBbXG4gICAgICAuLi5wcmVTdGF0ZW1lbnRzLFxuICAgICAgbmV3IERlY2xhcmVWYXJTdG10KCckZGVmJywgZGVmLCB1bmRlZmluZWQsIFtTdG10TW9kaWZpZXIuRXhwb3J0ZWRdKSxcbiAgICBdO1xuXG4gICAgY29uc3QgcmVzID0gdGhpcy5qaXRFdmFsdWF0b3IuZXZhbHVhdGVTdGF0ZW1lbnRzKFxuICAgICAgICBzb3VyY2VVcmwsIHN0YXRlbWVudHMsIG5ldyBSM0ppdFJlZmxlY3Rvcihjb250ZXh0KSwgLyogZW5hYmxlU291cmNlTWFwcyAqLyB0cnVlKTtcbiAgICByZXR1cm4gcmVzWyckZGVmJ107XG4gIH1cbn1cblxuLy8gVGhpcyBzZWVtcyB0byBiZSBuZWVkZWQgdG8gcGxhY2F0ZSBUUyB2My4wIG9ubHlcbnR5cGUgUjNDb21wb25lbnRNZXRhZGF0YUZhY2FkZU5vUHJvcEFuZFdoaXRlc3BhY2UgPSBQaWNrPFxuICAgIFIzQ29tcG9uZW50TWV0YWRhdGFGYWNhZGUsXG4gICAgRXhjbHVkZTxFeGNsdWRlPGtleW9mIFIzQ29tcG9uZW50TWV0YWRhdGFGYWNhZGUsICdwcmVzZXJ2ZVdoaXRlc3BhY2VzJz4sICdwcm9wTWV0YWRhdGEnPj47XG5cbmNvbnN0IFVTRV9DTEFTUyA9IE9iamVjdC5rZXlzKHt1c2VDbGFzczogbnVsbH0pWzBdO1xuY29uc3QgVVNFX0ZBQ1RPUlkgPSBPYmplY3Qua2V5cyh7dXNlRmFjdG9yeTogbnVsbH0pWzBdO1xuY29uc3QgVVNFX1ZBTFVFID0gT2JqZWN0LmtleXMoe3VzZVZhbHVlOiBudWxsfSlbMF07XG5jb25zdCBVU0VfRVhJU1RJTkcgPSBPYmplY3Qua2V5cyh7dXNlRXhpc3Rpbmc6IG51bGx9KVswXTtcblxuZnVuY3Rpb24gY29udmVydFRvUjNRdWVyeU1ldGFkYXRhKGZhY2FkZTogUjNRdWVyeU1ldGFkYXRhRmFjYWRlKTogUjNRdWVyeU1ldGFkYXRhIHtcbiAgcmV0dXJuIHtcbiAgICAuLi5mYWNhZGUsXG4gICAgcHJlZGljYXRlOiBBcnJheS5pc0FycmF5KGZhY2FkZS5wcmVkaWNhdGUpID8gZmFjYWRlLnByZWRpY2F0ZSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IFdyYXBwZWROb2RlRXhwcihmYWNhZGUucHJlZGljYXRlKSxcbiAgICByZWFkOiBmYWNhZGUucmVhZCA/IG5ldyBXcmFwcGVkTm9kZUV4cHIoZmFjYWRlLnJlYWQpIDogbnVsbCxcbiAgICBzdGF0aWM6IGZhY2FkZS5zdGF0aWMsXG4gICAgZW1pdERpc3RpbmN0Q2hhbmdlc09ubHk6IGZhY2FkZS5lbWl0RGlzdGluY3RDaGFuZ2VzT25seSxcbiAgfTtcbn1cblxuZnVuY3Rpb24gY29udmVydFF1ZXJ5RGVjbGFyYXRpb25Ub01ldGFkYXRhKGRlY2xhcmF0aW9uOiBSM0RlY2xhcmVRdWVyeU1ldGFkYXRhRmFjYWRlKTpcbiAgICBSM1F1ZXJ5TWV0YWRhdGEge1xuICByZXR1cm4ge1xuICAgIHByb3BlcnR5TmFtZTogZGVjbGFyYXRpb24ucHJvcGVydHlOYW1lLFxuICAgIGZpcnN0OiBkZWNsYXJhdGlvbi5maXJzdCA/PyBmYWxzZSxcbiAgICBwcmVkaWNhdGU6IEFycmF5LmlzQXJyYXkoZGVjbGFyYXRpb24ucHJlZGljYXRlKSA/IGRlY2xhcmF0aW9uLnByZWRpY2F0ZSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgV3JhcHBlZE5vZGVFeHByKGRlY2xhcmF0aW9uLnByZWRpY2F0ZSksXG4gICAgZGVzY2VuZGFudHM6IGRlY2xhcmF0aW9uLmRlc2NlbmRhbnRzID8/IGZhbHNlLFxuICAgIHJlYWQ6IGRlY2xhcmF0aW9uLnJlYWQgPyBuZXcgV3JhcHBlZE5vZGVFeHByKGRlY2xhcmF0aW9uLnJlYWQpIDogbnVsbCxcbiAgICBzdGF0aWM6IGRlY2xhcmF0aW9uLnN0YXRpYyA/PyBmYWxzZSxcbiAgICBlbWl0RGlzdGluY3RDaGFuZ2VzT25seTogZGVjbGFyYXRpb24uZW1pdERpc3RpbmN0Q2hhbmdlc09ubHkgPz8gdHJ1ZSxcbiAgfTtcbn1cblxuZnVuY3Rpb24gY29udmVydERpcmVjdGl2ZUZhY2FkZVRvTWV0YWRhdGEoZmFjYWRlOiBSM0RpcmVjdGl2ZU1ldGFkYXRhRmFjYWRlKTogUjNEaXJlY3RpdmVNZXRhZGF0YSB7XG4gIGNvbnN0IGlucHV0c0Zyb21NZXRhZGF0YSA9IHBhcnNlSW5wdXRPdXRwdXRzKGZhY2FkZS5pbnB1dHMgfHwgW10pO1xuICBjb25zdCBvdXRwdXRzRnJvbU1ldGFkYXRhID0gcGFyc2VJbnB1dE91dHB1dHMoZmFjYWRlLm91dHB1dHMgfHwgW10pO1xuICBjb25zdCBwcm9wTWV0YWRhdGEgPSBmYWNhZGUucHJvcE1ldGFkYXRhO1xuICBjb25zdCBpbnB1dHNGcm9tVHlwZTogU3RyaW5nTWFwV2l0aFJlbmFtZSA9IHt9O1xuICBjb25zdCBvdXRwdXRzRnJvbVR5cGU6IFN0cmluZ01hcCA9IHt9O1xuICBmb3IgKGNvbnN0IGZpZWxkIGluIHByb3BNZXRhZGF0YSkge1xuICAgIGlmIChwcm9wTWV0YWRhdGEuaGFzT3duUHJvcGVydHkoZmllbGQpKSB7XG4gICAgICBwcm9wTWV0YWRhdGFbZmllbGRdLmZvckVhY2goYW5uID0+IHtcbiAgICAgICAgaWYgKGlzSW5wdXQoYW5uKSkge1xuICAgICAgICAgIGlucHV0c0Zyb21UeXBlW2ZpZWxkXSA9XG4gICAgICAgICAgICAgIGFubi5iaW5kaW5nUHJvcGVydHlOYW1lID8gW2Fubi5iaW5kaW5nUHJvcGVydHlOYW1lLCBmaWVsZF0gOiBmaWVsZDtcbiAgICAgICAgfSBlbHNlIGlmIChpc091dHB1dChhbm4pKSB7XG4gICAgICAgICAgb3V0cHV0c0Zyb21UeXBlW2ZpZWxkXSA9IGFubi5iaW5kaW5nUHJvcGVydHlOYW1lIHx8IGZpZWxkO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4ge1xuICAgIC4uLmZhY2FkZSBhcyBSM0RpcmVjdGl2ZU1ldGFkYXRhRmFjYWRlTm9Qcm9wQW5kV2hpdGVzcGFjZSxcbiAgICB0eXBlQXJndW1lbnRDb3VudDogMCxcbiAgICB0eXBlU291cmNlU3BhbjogZmFjYWRlLnR5cGVTb3VyY2VTcGFuLFxuICAgIHR5cGU6IHdyYXBSZWZlcmVuY2UoZmFjYWRlLnR5cGUpLFxuICAgIGludGVybmFsVHlwZTogbmV3IFdyYXBwZWROb2RlRXhwcihmYWNhZGUudHlwZSksXG4gICAgZGVwczogbnVsbCxcbiAgICBob3N0OiBleHRyYWN0SG9zdEJpbmRpbmdzKGZhY2FkZS5wcm9wTWV0YWRhdGEsIGZhY2FkZS50eXBlU291cmNlU3BhbiwgZmFjYWRlLmhvc3QpLFxuICAgIGlucHV0czogey4uLmlucHV0c0Zyb21NZXRhZGF0YSwgLi4uaW5wdXRzRnJvbVR5cGV9LFxuICAgIG91dHB1dHM6IHsuLi5vdXRwdXRzRnJvbU1ldGFkYXRhLCAuLi5vdXRwdXRzRnJvbVR5cGV9LFxuICAgIHF1ZXJpZXM6IGZhY2FkZS5xdWVyaWVzLm1hcChjb252ZXJ0VG9SM1F1ZXJ5TWV0YWRhdGEpLFxuICAgIHByb3ZpZGVyczogZmFjYWRlLnByb3ZpZGVycyAhPSBudWxsID8gbmV3IFdyYXBwZWROb2RlRXhwcihmYWNhZGUucHJvdmlkZXJzKSA6IG51bGwsXG4gICAgdmlld1F1ZXJpZXM6IGZhY2FkZS52aWV3UXVlcmllcy5tYXAoY29udmVydFRvUjNRdWVyeU1ldGFkYXRhKSxcbiAgICBmdWxsSW5oZXJpdGFuY2U6IGZhbHNlLFxuICB9O1xufVxuXG5mdW5jdGlvbiBjb252ZXJ0RGVjbGFyZURpcmVjdGl2ZUZhY2FkZVRvTWV0YWRhdGEoXG4gICAgZGVjbGFyYXRpb246IFIzRGVjbGFyZURpcmVjdGl2ZUZhY2FkZSwgdHlwZVNvdXJjZVNwYW46IFBhcnNlU291cmNlU3Bhbik6IFIzRGlyZWN0aXZlTWV0YWRhdGEge1xuICByZXR1cm4ge1xuICAgIG5hbWU6IGRlY2xhcmF0aW9uLnR5cGUubmFtZSxcbiAgICB0eXBlOiB3cmFwUmVmZXJlbmNlKGRlY2xhcmF0aW9uLnR5cGUpLFxuICAgIHR5cGVTb3VyY2VTcGFuLFxuICAgIGludGVybmFsVHlwZTogbmV3IFdyYXBwZWROb2RlRXhwcihkZWNsYXJhdGlvbi50eXBlKSxcbiAgICBzZWxlY3RvcjogZGVjbGFyYXRpb24uc2VsZWN0b3IgPz8gbnVsbCxcbiAgICBpbnB1dHM6IGRlY2xhcmF0aW9uLmlucHV0cyA/PyB7fSxcbiAgICBvdXRwdXRzOiBkZWNsYXJhdGlvbi5vdXRwdXRzID8/IHt9LFxuICAgIGhvc3Q6IGNvbnZlcnRIb3N0RGVjbGFyYXRpb25Ub01ldGFkYXRhKGRlY2xhcmF0aW9uLmhvc3QpLFxuICAgIHF1ZXJpZXM6IChkZWNsYXJhdGlvbi5xdWVyaWVzID8/IFtdKS5tYXAoY29udmVydFF1ZXJ5RGVjbGFyYXRpb25Ub01ldGFkYXRhKSxcbiAgICB2aWV3UXVlcmllczogKGRlY2xhcmF0aW9uLnZpZXdRdWVyaWVzID8/IFtdKS5tYXAoY29udmVydFF1ZXJ5RGVjbGFyYXRpb25Ub01ldGFkYXRhKSxcbiAgICBwcm92aWRlcnM6IGRlY2xhcmF0aW9uLnByb3ZpZGVycyAhPT0gdW5kZWZpbmVkID8gbmV3IFdyYXBwZWROb2RlRXhwcihkZWNsYXJhdGlvbi5wcm92aWRlcnMpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICBleHBvcnRBczogZGVjbGFyYXRpb24uZXhwb3J0QXMgPz8gbnVsbCxcbiAgICB1c2VzSW5oZXJpdGFuY2U6IGRlY2xhcmF0aW9uLnVzZXNJbmhlcml0YW5jZSA/PyBmYWxzZSxcbiAgICBsaWZlY3ljbGU6IHt1c2VzT25DaGFuZ2VzOiBkZWNsYXJhdGlvbi51c2VzT25DaGFuZ2VzID8/IGZhbHNlfSxcbiAgICBkZXBzOiBudWxsLFxuICAgIHR5cGVBcmd1bWVudENvdW50OiAwLFxuICAgIGZ1bGxJbmhlcml0YW5jZTogZmFsc2UsXG4gIH07XG59XG5cbmZ1bmN0aW9uIGNvbnZlcnRIb3N0RGVjbGFyYXRpb25Ub01ldGFkYXRhKGhvc3Q6IFIzRGVjbGFyZURpcmVjdGl2ZUZhY2FkZVsnaG9zdCddID0ge30pOlxuICAgIFIzSG9zdE1ldGFkYXRhIHtcbiAgcmV0dXJuIHtcbiAgICBhdHRyaWJ1dGVzOiBjb252ZXJ0T3BhcXVlVmFsdWVzVG9FeHByZXNzaW9ucyhob3N0LmF0dHJpYnV0ZXMgPz8ge30pLFxuICAgIGxpc3RlbmVyczogaG9zdC5saXN0ZW5lcnMgPz8ge30sXG4gICAgcHJvcGVydGllczogaG9zdC5wcm9wZXJ0aWVzID8/IHt9LFxuICAgIHNwZWNpYWxBdHRyaWJ1dGVzOiB7XG4gICAgICBjbGFzc0F0dHI6IGhvc3QuY2xhc3NBdHRyaWJ1dGUsXG4gICAgICBzdHlsZUF0dHI6IGhvc3Quc3R5bGVBdHRyaWJ1dGUsXG4gICAgfSxcbiAgfTtcbn1cblxuZnVuY3Rpb24gY29udmVydE9wYXF1ZVZhbHVlc1RvRXhwcmVzc2lvbnMob2JqOiB7W2tleTogc3RyaW5nXTogT3BhcXVlVmFsdWV9KTpcbiAgICB7W2tleTogc3RyaW5nXTogV3JhcHBlZE5vZGVFeHByPHVua25vd24+fSB7XG4gIGNvbnN0IHJlc3VsdDoge1trZXk6IHN0cmluZ106IFdyYXBwZWROb2RlRXhwcjx1bmtub3duPn0gPSB7fTtcbiAgZm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXMob2JqKSkge1xuICAgIHJlc3VsdFtrZXldID0gbmV3IFdyYXBwZWROb2RlRXhwcihvYmpba2V5XSk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZnVuY3Rpb24gY29udmVydERlY2xhcmVDb21wb25lbnRGYWNhZGVUb01ldGFkYXRhKFxuICAgIGRlY2xhcmF0aW9uOiBSM0RlY2xhcmVDb21wb25lbnRGYWNhZGUsIHR5cGVTb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgc291cmNlTWFwVXJsOiBzdHJpbmcpOiBSM0NvbXBvbmVudE1ldGFkYXRhIHtcbiAgY29uc3Qge3RlbXBsYXRlLCBpbnRlcnBvbGF0aW9ufSA9IHBhcnNlSml0VGVtcGxhdGUoXG4gICAgICBkZWNsYXJhdGlvbi50ZW1wbGF0ZSwgZGVjbGFyYXRpb24udHlwZS5uYW1lLCBzb3VyY2VNYXBVcmwsXG4gICAgICBkZWNsYXJhdGlvbi5wcmVzZXJ2ZVdoaXRlc3BhY2VzID8/IGZhbHNlLCBkZWNsYXJhdGlvbi5pbnRlcnBvbGF0aW9uKTtcblxuICByZXR1cm4ge1xuICAgIC4uLmNvbnZlcnREZWNsYXJlRGlyZWN0aXZlRmFjYWRlVG9NZXRhZGF0YShkZWNsYXJhdGlvbiwgdHlwZVNvdXJjZVNwYW4pLFxuICAgIHRlbXBsYXRlLFxuICAgIHN0eWxlczogZGVjbGFyYXRpb24uc3R5bGVzID8/IFtdLFxuICAgIGRpcmVjdGl2ZXM6IChkZWNsYXJhdGlvbi5jb21wb25lbnRzID8/IFtdKVxuICAgICAgICAgICAgICAgICAgICAuY29uY2F0KGRlY2xhcmF0aW9uLmRpcmVjdGl2ZXMgPz8gW10pXG4gICAgICAgICAgICAgICAgICAgIC5tYXAoY29udmVydFVzZWREaXJlY3RpdmVEZWNsYXJhdGlvblRvTWV0YWRhdGEpLFxuICAgIHBpcGVzOiBjb252ZXJ0VXNlZFBpcGVzVG9NZXRhZGF0YShkZWNsYXJhdGlvbi5waXBlcyksXG4gICAgdmlld1Byb3ZpZGVyczogZGVjbGFyYXRpb24udmlld1Byb3ZpZGVycyAhPT0gdW5kZWZpbmVkID9cbiAgICAgICAgbmV3IFdyYXBwZWROb2RlRXhwcihkZWNsYXJhdGlvbi52aWV3UHJvdmlkZXJzKSA6XG4gICAgICAgIG51bGwsXG4gICAgYW5pbWF0aW9uczogZGVjbGFyYXRpb24uYW5pbWF0aW9ucyAhPT0gdW5kZWZpbmVkID8gbmV3IFdyYXBwZWROb2RlRXhwcihkZWNsYXJhdGlvbi5hbmltYXRpb25zKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICBjaGFuZ2VEZXRlY3Rpb246IGRlY2xhcmF0aW9uLmNoYW5nZURldGVjdGlvbiA/PyBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5EZWZhdWx0LFxuICAgIGVuY2Fwc3VsYXRpb246IGRlY2xhcmF0aW9uLmVuY2Fwc3VsYXRpb24gPz8gVmlld0VuY2Fwc3VsYXRpb24uRW11bGF0ZWQsXG4gICAgaW50ZXJwb2xhdGlvbixcbiAgICBkZWNsYXJhdGlvbkxpc3RFbWl0TW9kZTogRGVjbGFyYXRpb25MaXN0RW1pdE1vZGUuQ2xvc3VyZVJlc29sdmVkLFxuICAgIHJlbGF0aXZlQ29udGV4dEZpbGVQYXRoOiAnJyxcbiAgICBpMThuVXNlRXh0ZXJuYWxJZHM6IHRydWUsXG4gIH07XG59XG5cbmZ1bmN0aW9uIGNvbnZlcnRVc2VkRGlyZWN0aXZlRGVjbGFyYXRpb25Ub01ldGFkYXRhKGRlY2xhcmF0aW9uOiBSM0RlY2xhcmVVc2VkRGlyZWN0aXZlRmFjYWRlKTpcbiAgICBSM1VzZWREaXJlY3RpdmVNZXRhZGF0YSB7XG4gIHJldHVybiB7XG4gICAgc2VsZWN0b3I6IGRlY2xhcmF0aW9uLnNlbGVjdG9yLFxuICAgIHR5cGU6IG5ldyBXcmFwcGVkTm9kZUV4cHIoZGVjbGFyYXRpb24udHlwZSksXG4gICAgaW5wdXRzOiBkZWNsYXJhdGlvbi5pbnB1dHMgPz8gW10sXG4gICAgb3V0cHV0czogZGVjbGFyYXRpb24ub3V0cHV0cyA/PyBbXSxcbiAgICBleHBvcnRBczogZGVjbGFyYXRpb24uZXhwb3J0QXMgPz8gbnVsbCxcbiAgfTtcbn1cblxuZnVuY3Rpb24gY29udmVydFVzZWRQaXBlc1RvTWV0YWRhdGEoZGVjbGFyZWRQaXBlczogUjNEZWNsYXJlQ29tcG9uZW50RmFjYWRlWydwaXBlcyddKTpcbiAgICBNYXA8c3RyaW5nLCBFeHByZXNzaW9uPiB7XG4gIGNvbnN0IHBpcGVzID0gbmV3IE1hcDxzdHJpbmcsIEV4cHJlc3Npb24+KCk7XG4gIGlmIChkZWNsYXJlZFBpcGVzID09PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gcGlwZXM7XG4gIH1cblxuICBmb3IgKGNvbnN0IHBpcGVOYW1lIG9mIE9iamVjdC5rZXlzKGRlY2xhcmVkUGlwZXMpKSB7XG4gICAgY29uc3QgcGlwZVR5cGUgPSBkZWNsYXJlZFBpcGVzW3BpcGVOYW1lXTtcbiAgICBwaXBlcy5zZXQocGlwZU5hbWUsIG5ldyBXcmFwcGVkTm9kZUV4cHIocGlwZVR5cGUpKTtcbiAgfVxuICByZXR1cm4gcGlwZXM7XG59XG5cbmZ1bmN0aW9uIHBhcnNlSml0VGVtcGxhdGUoXG4gICAgdGVtcGxhdGU6IHN0cmluZywgdHlwZU5hbWU6IHN0cmluZywgc291cmNlTWFwVXJsOiBzdHJpbmcsIHByZXNlcnZlV2hpdGVzcGFjZXM6IGJvb2xlYW4sXG4gICAgaW50ZXJwb2xhdGlvbjogW3N0cmluZywgc3RyaW5nXXx1bmRlZmluZWQpIHtcbiAgY29uc3QgaW50ZXJwb2xhdGlvbkNvbmZpZyA9XG4gICAgICBpbnRlcnBvbGF0aW9uID8gSW50ZXJwb2xhdGlvbkNvbmZpZy5mcm9tQXJyYXkoaW50ZXJwb2xhdGlvbikgOiBERUZBVUxUX0lOVEVSUE9MQVRJT05fQ09ORklHO1xuICAvLyBQYXJzZSB0aGUgdGVtcGxhdGUgYW5kIGNoZWNrIGZvciBlcnJvcnMuXG4gIGNvbnN0IHBhcnNlZCA9IHBhcnNlVGVtcGxhdGUoXG4gICAgICB0ZW1wbGF0ZSwgc291cmNlTWFwVXJsLCB7cHJlc2VydmVXaGl0ZXNwYWNlczogcHJlc2VydmVXaGl0ZXNwYWNlcywgaW50ZXJwb2xhdGlvbkNvbmZpZ30pO1xuICBpZiAocGFyc2VkLmVycm9ycyAhPT0gbnVsbCkge1xuICAgIGNvbnN0IGVycm9ycyA9IHBhcnNlZC5lcnJvcnMubWFwKGVyciA9PiBlcnIudG9TdHJpbmcoKSkuam9pbignLCAnKTtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEVycm9ycyBkdXJpbmcgSklUIGNvbXBpbGF0aW9uIG9mIHRlbXBsYXRlIGZvciAke3R5cGVOYW1lfTogJHtlcnJvcnN9YCk7XG4gIH1cbiAgcmV0dXJuIHt0ZW1wbGF0ZTogcGFyc2VkLCBpbnRlcnBvbGF0aW9uOiBpbnRlcnBvbGF0aW9uQ29uZmlnfTtcbn1cblxuLy8gVGhpcyBzZWVtcyB0byBiZSBuZWVkZWQgdG8gcGxhY2F0ZSBUUyB2My4wIG9ubHlcbnR5cGUgUjNEaXJlY3RpdmVNZXRhZGF0YUZhY2FkZU5vUHJvcEFuZFdoaXRlc3BhY2UgPVxuICAgIFBpY2s8UjNEaXJlY3RpdmVNZXRhZGF0YUZhY2FkZSwgRXhjbHVkZTxrZXlvZiBSM0RpcmVjdGl2ZU1ldGFkYXRhRmFjYWRlLCAncHJvcE1ldGFkYXRhJz4+O1xuXG4vKipcbiAqIENvbnZlcnQgdGhlIGV4cHJlc3Npb24sIGlmIHByZXNlbnQgdG8gYW4gYFIzUHJvdmlkZXJFeHByZXNzaW9uYC5cbiAqXG4gKiBJbiBKSVQgbW9kZSB3ZSBkbyBub3Qgd2FudCB0aGUgY29tcGlsZXIgdG8gd3JhcCB0aGUgZXhwcmVzc2lvbiBpbiBhIGBmb3J3YXJkUmVmKClgIGNhbGwgYmVjYXVzZSxcbiAqIGlmIGl0IGlzIHJlZmVyZW5jaW5nIGEgdHlwZSB0aGF0IGhhcyBub3QgeWV0IGJlZW4gZGVmaW5lZCwgaXQgd2lsbCBoYXZlIGFscmVhZHkgYmVlbiB3cmFwcGVkIGluXG4gKiBhIGBmb3J3YXJkUmVmKClgIC0gZWl0aGVyIGJ5IHRoZSBhcHBsaWNhdGlvbiBkZXZlbG9wZXIgb3IgZHVyaW5nIHBhcnRpYWwtY29tcGlsYXRpb24uIFRodXMgd2UgY2FuXG4gKiBzZXQgYGlzRm9yd2FyZFJlZmAgdG8gYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gY29udmVydFRvUHJvdmlkZXJFeHByZXNzaW9uKG9iajogYW55LCBwcm9wZXJ0eTogc3RyaW5nKTogUjNQcm92aWRlckV4cHJlc3Npb258dW5kZWZpbmVkIHtcbiAgaWYgKG9iai5oYXNPd25Qcm9wZXJ0eShwcm9wZXJ0eSkpIHtcbiAgICByZXR1cm4gY3JlYXRlUjNQcm92aWRlckV4cHJlc3Npb24obmV3IFdyYXBwZWROb2RlRXhwcihvYmpbcHJvcGVydHldKSwgLyogaXNGb3J3YXJkUmVmICovIGZhbHNlKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG59XG5cbmZ1bmN0aW9uIHdyYXBFeHByZXNzaW9uKG9iajogYW55LCBwcm9wZXJ0eTogc3RyaW5nKTogV3JhcHBlZE5vZGVFeHByPGFueT58dW5kZWZpbmVkIHtcbiAgaWYgKG9iai5oYXNPd25Qcm9wZXJ0eShwcm9wZXJ0eSkpIHtcbiAgICByZXR1cm4gbmV3IFdyYXBwZWROb2RlRXhwcihvYmpbcHJvcGVydHldKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNvbXB1dGVQcm92aWRlZEluKHByb3ZpZGVkSW46IEZ1bmN0aW9ufHN0cmluZ3xudWxsfHVuZGVmaW5lZCk6IFIzUHJvdmlkZXJFeHByZXNzaW9uIHtcbiAgY29uc3QgZXhwcmVzc2lvbiA9IChwcm92aWRlZEluID09IG51bGwgfHwgdHlwZW9mIHByb3ZpZGVkSW4gPT09ICdzdHJpbmcnKSA/XG4gICAgICBuZXcgTGl0ZXJhbEV4cHIocHJvdmlkZWRJbiA/PyBudWxsKSA6XG4gICAgICBuZXcgV3JhcHBlZE5vZGVFeHByKHByb3ZpZGVkSW4pO1xuICAvLyBTZWUgYGNvbnZlcnRUb1Byb3ZpZGVyRXhwcmVzc2lvbigpYCBmb3Igd2h5IGBpc0ZvcndhcmRSZWZgIGlzIGZhbHNlLlxuICByZXR1cm4gY3JlYXRlUjNQcm92aWRlckV4cHJlc3Npb24oZXhwcmVzc2lvbiwgLyogaXNGb3J3YXJkUmVmICovIGZhbHNlKTtcbn1cblxuZnVuY3Rpb24gY29udmVydFIzRGVwZW5kZW5jeU1ldGFkYXRhQXJyYXkoZmFjYWRlczogUjNEZXBlbmRlbmN5TWV0YWRhdGFGYWNhZGVbXXxudWxsfFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdW5kZWZpbmVkKTogUjNEZXBlbmRlbmN5TWV0YWRhdGFbXXxudWxsIHtcbiAgcmV0dXJuIGZhY2FkZXMgPT0gbnVsbCA/IG51bGwgOiBmYWNhZGVzLm1hcChjb252ZXJ0UjNEZXBlbmRlbmN5TWV0YWRhdGEpO1xufVxuXG5mdW5jdGlvbiBjb252ZXJ0UjNEZXBlbmRlbmN5TWV0YWRhdGEoZmFjYWRlOiBSM0RlcGVuZGVuY3lNZXRhZGF0YUZhY2FkZSk6IFIzRGVwZW5kZW5jeU1ldGFkYXRhIHtcbiAgY29uc3QgaXNBdHRyaWJ1dGVEZXAgPSBmYWNhZGUuYXR0cmlidXRlICE9IG51bGw7ICAvLyBib3RoIGBudWxsYCBhbmQgYHVuZGVmaW5lZGBcbiAgY29uc3QgcmF3VG9rZW4gPSBmYWNhZGUudG9rZW4gPT09IG51bGwgPyBudWxsIDogbmV3IFdyYXBwZWROb2RlRXhwcihmYWNhZGUudG9rZW4pO1xuICAvLyBJbiBKSVQgbW9kZSwgaWYgdGhlIGRlcCBpcyBhbiBgQEF0dHJpYnV0ZSgpYCB0aGVuIHdlIHVzZSB0aGUgYXR0cmlidXRlIG5hbWUgZ2l2ZW4gaW5cbiAgLy8gYGF0dHJpYnV0ZWAgcmF0aGVyIHRoYW4gdGhlIGB0b2tlbmAuXG4gIGNvbnN0IHRva2VuID0gaXNBdHRyaWJ1dGVEZXAgPyBuZXcgV3JhcHBlZE5vZGVFeHByKGZhY2FkZS5hdHRyaWJ1dGUpIDogcmF3VG9rZW47XG4gIHJldHVybiBjcmVhdGVSM0RlcGVuZGVuY3lNZXRhZGF0YShcbiAgICAgIHRva2VuLCBpc0F0dHJpYnV0ZURlcCwgZmFjYWRlLmhvc3QsIGZhY2FkZS5vcHRpb25hbCwgZmFjYWRlLnNlbGYsIGZhY2FkZS5za2lwU2VsZik7XG59XG5cbmZ1bmN0aW9uIGNvbnZlcnRSM0RlY2xhcmVEZXBlbmRlbmN5TWV0YWRhdGEoZmFjYWRlOiBSM0RlY2xhcmVEZXBlbmRlbmN5TWV0YWRhdGFGYWNhZGUpOlxuICAgIFIzRGVwZW5kZW5jeU1ldGFkYXRhIHtcbiAgY29uc3QgaXNBdHRyaWJ1dGVEZXAgPSBmYWNhZGUuYXR0cmlidXRlID8/IGZhbHNlO1xuICBjb25zdCB0b2tlbiA9IGZhY2FkZS50b2tlbiA9PT0gbnVsbCA/IG51bGwgOiBuZXcgV3JhcHBlZE5vZGVFeHByKGZhY2FkZS50b2tlbik7XG4gIHJldHVybiBjcmVhdGVSM0RlcGVuZGVuY3lNZXRhZGF0YShcbiAgICAgIHRva2VuLCBpc0F0dHJpYnV0ZURlcCwgZmFjYWRlLmhvc3QgPz8gZmFsc2UsIGZhY2FkZS5vcHRpb25hbCA/PyBmYWxzZSwgZmFjYWRlLnNlbGYgPz8gZmFsc2UsXG4gICAgICBmYWNhZGUuc2tpcFNlbGYgPz8gZmFsc2UpO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVSM0RlcGVuZGVuY3lNZXRhZGF0YShcbiAgICB0b2tlbjogV3JhcHBlZE5vZGVFeHByPHVua25vd24+fG51bGwsIGlzQXR0cmlidXRlRGVwOiBib29sZWFuLCBob3N0OiBib29sZWFuLCBvcHRpb25hbDogYm9vbGVhbixcbiAgICBzZWxmOiBib29sZWFuLCBza2lwU2VsZjogYm9vbGVhbik6IFIzRGVwZW5kZW5jeU1ldGFkYXRhIHtcbiAgLy8gSWYgdGhlIGRlcCBpcyBhbiBgQEF0dHJpYnV0ZSgpYCB0aGUgYGF0dHJpYnV0ZU5hbWVUeXBlYCBvdWdodCB0byBiZSB0aGUgYHVua25vd25gIHR5cGUuXG4gIC8vIEJ1dCB0eXBlcyBhcmUgbm90IGF2YWlsYWJsZSBhdCBydW50aW1lIHNvIHdlIGp1c3QgdXNlIGEgbGl0ZXJhbCBgXCI8dW5rbm93bj5cImAgc3RyaW5nIGFzIGEgZHVtbXlcbiAgLy8gbWFya2VyLlxuICBjb25zdCBhdHRyaWJ1dGVOYW1lVHlwZSA9IGlzQXR0cmlidXRlRGVwID8gbGl0ZXJhbCgndW5rbm93bicpIDogbnVsbDtcbiAgcmV0dXJuIHt0b2tlbiwgYXR0cmlidXRlTmFtZVR5cGUsIGhvc3QsIG9wdGlvbmFsLCBzZWxmLCBza2lwU2VsZn07XG59XG5cbmZ1bmN0aW9uIGV4dHJhY3RIb3N0QmluZGluZ3MoXG4gICAgcHJvcE1ldGFkYXRhOiB7W2tleTogc3RyaW5nXTogYW55W119LCBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgaG9zdD86IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9KTogUGFyc2VkSG9zdEJpbmRpbmdzIHtcbiAgLy8gRmlyc3QgcGFyc2UgdGhlIGRlY2xhcmF0aW9ucyBmcm9tIHRoZSBtZXRhZGF0YS5cbiAgY29uc3QgYmluZGluZ3MgPSBwYXJzZUhvc3RCaW5kaW5ncyhob3N0IHx8IHt9KTtcblxuICAvLyBBZnRlciB0aGF0IGNoZWNrIGhvc3QgYmluZGluZ3MgZm9yIGVycm9yc1xuICBjb25zdCBlcnJvcnMgPSB2ZXJpZnlIb3N0QmluZGluZ3MoYmluZGluZ3MsIHNvdXJjZVNwYW4pO1xuICBpZiAoZXJyb3JzLmxlbmd0aCkge1xuICAgIHRocm93IG5ldyBFcnJvcihlcnJvcnMubWFwKChlcnJvcjogUGFyc2VFcnJvcikgPT4gZXJyb3IubXNnKS5qb2luKCdcXG4nKSk7XG4gIH1cblxuICAvLyBOZXh0LCBsb29wIG92ZXIgdGhlIHByb3BlcnRpZXMgb2YgdGhlIG9iamVjdCwgbG9va2luZyBmb3IgQEhvc3RCaW5kaW5nIGFuZCBASG9zdExpc3RlbmVyLlxuICBmb3IgKGNvbnN0IGZpZWxkIGluIHByb3BNZXRhZGF0YSkge1xuICAgIGlmIChwcm9wTWV0YWRhdGEuaGFzT3duUHJvcGVydHkoZmllbGQpKSB7XG4gICAgICBwcm9wTWV0YWRhdGFbZmllbGRdLmZvckVhY2goYW5uID0+IHtcbiAgICAgICAgaWYgKGlzSG9zdEJpbmRpbmcoYW5uKSkge1xuICAgICAgICAgIC8vIFNpbmNlIHRoaXMgaXMgYSBkZWNvcmF0b3IsIHdlIGtub3cgdGhhdCB0aGUgdmFsdWUgaXMgYSBjbGFzcyBtZW1iZXIuIEFsd2F5cyBhY2Nlc3MgaXRcbiAgICAgICAgICAvLyB0aHJvdWdoIGB0aGlzYCBzbyB0aGF0IGZ1cnRoZXIgZG93biB0aGUgbGluZSBpdCBjYW4ndCBiZSBjb25mdXNlZCBmb3IgYSBsaXRlcmFsIHZhbHVlXG4gICAgICAgICAgLy8gKGUuZy4gaWYgdGhlcmUncyBhIHByb3BlcnR5IGNhbGxlZCBgdHJ1ZWApLlxuICAgICAgICAgIGJpbmRpbmdzLnByb3BlcnRpZXNbYW5uLmhvc3RQcm9wZXJ0eU5hbWUgfHwgZmllbGRdID1cbiAgICAgICAgICAgICAgZ2V0U2FmZVByb3BlcnR5QWNjZXNzU3RyaW5nKCd0aGlzJywgZmllbGQpO1xuICAgICAgICB9IGVsc2UgaWYgKGlzSG9zdExpc3RlbmVyKGFubikpIHtcbiAgICAgICAgICBiaW5kaW5ncy5saXN0ZW5lcnNbYW5uLmV2ZW50TmFtZSB8fCBmaWVsZF0gPSBgJHtmaWVsZH0oJHsoYW5uLmFyZ3MgfHwgW10pLmpvaW4oJywnKX0pYDtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGJpbmRpbmdzO1xufVxuXG5mdW5jdGlvbiBpc0hvc3RCaW5kaW5nKHZhbHVlOiBhbnkpOiB2YWx1ZSBpcyBIb3N0QmluZGluZyB7XG4gIHJldHVybiB2YWx1ZS5uZ01ldGFkYXRhTmFtZSA9PT0gJ0hvc3RCaW5kaW5nJztcbn1cblxuZnVuY3Rpb24gaXNIb3N0TGlzdGVuZXIodmFsdWU6IGFueSk6IHZhbHVlIGlzIEhvc3RMaXN0ZW5lciB7XG4gIHJldHVybiB2YWx1ZS5uZ01ldGFkYXRhTmFtZSA9PT0gJ0hvc3RMaXN0ZW5lcic7XG59XG5cblxuZnVuY3Rpb24gaXNJbnB1dCh2YWx1ZTogYW55KTogdmFsdWUgaXMgSW5wdXQge1xuICByZXR1cm4gdmFsdWUubmdNZXRhZGF0YU5hbWUgPT09ICdJbnB1dCc7XG59XG5cbmZ1bmN0aW9uIGlzT3V0cHV0KHZhbHVlOiBhbnkpOiB2YWx1ZSBpcyBPdXRwdXQge1xuICByZXR1cm4gdmFsdWUubmdNZXRhZGF0YU5hbWUgPT09ICdPdXRwdXQnO1xufVxuXG5mdW5jdGlvbiBwYXJzZUlucHV0T3V0cHV0cyh2YWx1ZXM6IHN0cmluZ1tdKTogU3RyaW5nTWFwIHtcbiAgcmV0dXJuIHZhbHVlcy5yZWR1Y2UoKG1hcCwgdmFsdWUpID0+IHtcbiAgICBjb25zdCBbZmllbGQsIHByb3BlcnR5XSA9IHZhbHVlLnNwbGl0KCcsJykubWFwKHBpZWNlID0+IHBpZWNlLnRyaW0oKSk7XG4gICAgbWFwW2ZpZWxkXSA9IHByb3BlcnR5IHx8IGZpZWxkO1xuICAgIHJldHVybiBtYXA7XG4gIH0sIHt9IGFzIFN0cmluZ01hcCk7XG59XG5cbmZ1bmN0aW9uIGNvbnZlcnREZWNsYXJlUGlwZUZhY2FkZVRvTWV0YWRhdGEoZGVjbGFyYXRpb246IFIzRGVjbGFyZVBpcGVGYWNhZGUpOiBSM1BpcGVNZXRhZGF0YSB7XG4gIHJldHVybiB7XG4gICAgbmFtZTogZGVjbGFyYXRpb24udHlwZS5uYW1lLFxuICAgIHR5cGU6IHdyYXBSZWZlcmVuY2UoZGVjbGFyYXRpb24udHlwZSksXG4gICAgaW50ZXJuYWxUeXBlOiBuZXcgV3JhcHBlZE5vZGVFeHByKGRlY2xhcmF0aW9uLnR5cGUpLFxuICAgIHR5cGVBcmd1bWVudENvdW50OiAwLFxuICAgIHBpcGVOYW1lOiBkZWNsYXJhdGlvbi5uYW1lLFxuICAgIGRlcHM6IG51bGwsXG4gICAgcHVyZTogZGVjbGFyYXRpb24ucHVyZSA/PyB0cnVlLFxuICB9O1xufVxuXG5mdW5jdGlvbiBjb252ZXJ0RGVjbGFyZUluamVjdG9yRmFjYWRlVG9NZXRhZGF0YShkZWNsYXJhdGlvbjogUjNEZWNsYXJlSW5qZWN0b3JGYWNhZGUpOlxuICAgIFIzSW5qZWN0b3JNZXRhZGF0YSB7XG4gIHJldHVybiB7XG4gICAgbmFtZTogZGVjbGFyYXRpb24udHlwZS5uYW1lLFxuICAgIHR5cGU6IHdyYXBSZWZlcmVuY2UoZGVjbGFyYXRpb24udHlwZSksXG4gICAgaW50ZXJuYWxUeXBlOiBuZXcgV3JhcHBlZE5vZGVFeHByKGRlY2xhcmF0aW9uLnR5cGUpLFxuICAgIHByb3ZpZGVyczogZGVjbGFyYXRpb24ucHJvdmlkZXJzICE9PSB1bmRlZmluZWQgPyBuZXcgV3JhcHBlZE5vZGVFeHByKGRlY2xhcmF0aW9uLnByb3ZpZGVycykgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgIGltcG9ydHM6IGRlY2xhcmF0aW9uLmltcG9ydHMgIT09IHVuZGVmaW5lZCA/XG4gICAgICAgIGRlY2xhcmF0aW9uLmltcG9ydHMubWFwKGkgPT4gbmV3IFdyYXBwZWROb2RlRXhwcihpKSkgOlxuICAgICAgICBbXSxcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHB1Ymxpc2hGYWNhZGUoZ2xvYmFsOiBhbnkpIHtcbiAgY29uc3Qgbmc6IEV4cG9ydGVkQ29tcGlsZXJGYWNhZGUgPSBnbG9iYWwubmcgfHwgKGdsb2JhbC5uZyA9IHt9KTtcbiAgbmcuybVjb21waWxlckZhY2FkZSA9IG5ldyBDb21waWxlckZhY2FkZUltcGwoKTtcbn1cbiJdfQ==