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
        define("@angular/compiler-cli/src/ngtsc/annotations/src/component", ["require", "exports", "tslib", "@angular/compiler", "typescript", "@angular/compiler-cli/src/ngtsc/diagnostics", "@angular/compiler-cli/src/ngtsc/file_system", "@angular/compiler-cli/src/ngtsc/imports", "@angular/compiler-cli/src/ngtsc/incremental/semantic_graph", "@angular/compiler-cli/src/ngtsc/metadata", "@angular/compiler-cli/src/ngtsc/partial_evaluator", "@angular/compiler-cli/src/ngtsc/perf", "@angular/compiler-cli/src/ngtsc/reflection", "@angular/compiler-cli/src/ngtsc/transform", "@angular/compiler-cli/src/ngtsc/annotations/src/diagnostics", "@angular/compiler-cli/src/ngtsc/annotations/src/directive", "@angular/compiler-cli/src/ngtsc/annotations/src/factory", "@angular/compiler-cli/src/ngtsc/annotations/src/metadata", "@angular/compiler-cli/src/ngtsc/annotations/src/ng_module", "@angular/compiler-cli/src/ngtsc/annotations/src/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ComponentDecoratorHandler = exports.ComponentSymbol = void 0;
    var tslib_1 = require("tslib");
    var compiler_1 = require("@angular/compiler");
    var ts = require("typescript");
    var diagnostics_1 = require("@angular/compiler-cli/src/ngtsc/diagnostics");
    var file_system_1 = require("@angular/compiler-cli/src/ngtsc/file_system");
    var imports_1 = require("@angular/compiler-cli/src/ngtsc/imports");
    var semantic_graph_1 = require("@angular/compiler-cli/src/ngtsc/incremental/semantic_graph");
    var metadata_1 = require("@angular/compiler-cli/src/ngtsc/metadata");
    var partial_evaluator_1 = require("@angular/compiler-cli/src/ngtsc/partial_evaluator");
    var perf_1 = require("@angular/compiler-cli/src/ngtsc/perf");
    var reflection_1 = require("@angular/compiler-cli/src/ngtsc/reflection");
    var transform_1 = require("@angular/compiler-cli/src/ngtsc/transform");
    var diagnostics_2 = require("@angular/compiler-cli/src/ngtsc/annotations/src/diagnostics");
    var directive_1 = require("@angular/compiler-cli/src/ngtsc/annotations/src/directive");
    var factory_1 = require("@angular/compiler-cli/src/ngtsc/annotations/src/factory");
    var metadata_2 = require("@angular/compiler-cli/src/ngtsc/annotations/src/metadata");
    var ng_module_1 = require("@angular/compiler-cli/src/ngtsc/annotations/src/ng_module");
    var util_1 = require("@angular/compiler-cli/src/ngtsc/annotations/src/util");
    var EMPTY_MAP = new Map();
    var EMPTY_ARRAY = [];
    /**
     * Represents an Angular component.
     */
    var ComponentSymbol = /** @class */ (function (_super) {
        tslib_1.__extends(ComponentSymbol, _super);
        function ComponentSymbol() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.usedDirectives = [];
            _this.usedPipes = [];
            _this.isRemotelyScoped = false;
            return _this;
        }
        ComponentSymbol.prototype.isEmitAffected = function (previousSymbol, publicApiAffected) {
            if (!(previousSymbol instanceof ComponentSymbol)) {
                return true;
            }
            // Create an equality function that considers symbols equal if they represent the same
            // declaration, but only if the symbol in the current compilation does not have its public API
            // affected.
            var isSymbolUnaffected = function (current, previous) {
                return semantic_graph_1.isReferenceEqual(current, previous) && !publicApiAffected.has(current.symbol);
            };
            // The emit of a component is affected if either of the following is true:
            //  1. The component used to be remotely scoped but no longer is, or vice versa.
            //  2. The list of used directives has changed or any of those directives have had their public
            //     API changed. If the used directives have been reordered but not otherwise affected then
            //     the component must still be re-emitted, as this may affect directive instantiation order.
            //  3. The list of used pipes has changed, or any of those pipes have had their public API
            //     changed.
            return this.isRemotelyScoped !== previousSymbol.isRemotelyScoped ||
                !semantic_graph_1.isArrayEqual(this.usedDirectives, previousSymbol.usedDirectives, isSymbolUnaffected) ||
                !semantic_graph_1.isArrayEqual(this.usedPipes, previousSymbol.usedPipes, isSymbolUnaffected);
        };
        ComponentSymbol.prototype.isTypeCheckBlockAffected = function (previousSymbol, typeCheckApiAffected) {
            if (!(previousSymbol instanceof ComponentSymbol)) {
                return true;
            }
            // To verify that a used directive is not affected we need to verify that its full inheritance
            // chain is not present in `typeCheckApiAffected`.
            var isInheritanceChainAffected = function (symbol) {
                var currentSymbol = symbol;
                while (currentSymbol instanceof directive_1.DirectiveSymbol) {
                    if (typeCheckApiAffected.has(currentSymbol)) {
                        return true;
                    }
                    currentSymbol = currentSymbol.baseClass;
                }
                return false;
            };
            // Create an equality function that considers directives equal if they represent the same
            // declaration and if the symbol and all symbols it inherits from in the current compilation
            // do not have their type-check API affected.
            var isDirectiveUnaffected = function (current, previous) {
                return semantic_graph_1.isReferenceEqual(current, previous) && !isInheritanceChainAffected(current.symbol);
            };
            // Create an equality function that considers pipes equal if they represent the same
            // declaration and if the symbol in the current compilation does not have its type-check
            // API affected.
            var isPipeUnaffected = function (current, previous) {
                return semantic_graph_1.isReferenceEqual(current, previous) && !typeCheckApiAffected.has(current.symbol);
            };
            // The emit of a type-check block of a component is affected if either of the following is true:
            //  1. The list of used directives has changed or any of those directives have had their
            //     type-check API changed.
            //  2. The list of used pipes has changed, or any of those pipes have had their type-check API
            //     changed.
            return !semantic_graph_1.isArrayEqual(this.usedDirectives, previousSymbol.usedDirectives, isDirectiveUnaffected) ||
                !semantic_graph_1.isArrayEqual(this.usedPipes, previousSymbol.usedPipes, isPipeUnaffected);
        };
        return ComponentSymbol;
    }(directive_1.DirectiveSymbol));
    exports.ComponentSymbol = ComponentSymbol;
    /**
     * `DecoratorHandler` which handles the `@Component` annotation.
     */
    var ComponentDecoratorHandler = /** @class */ (function () {
        function ComponentDecoratorHandler(reflector, evaluator, metaRegistry, metaReader, scopeReader, scopeRegistry, typeCheckScopeRegistry, resourceRegistry, isCore, resourceLoader, rootDirs, defaultPreserveWhitespaces, i18nUseExternalIds, enableI18nLegacyMessageIdFormat, usePoisonedData, i18nNormalizeLineEndingsInICUs, moduleResolver, cycleAnalyzer, cycleHandlingStrategy, refEmitter, depTracker, injectableRegistry, semanticDepGraphUpdater, annotateForClosureCompiler, perf) {
            this.reflector = reflector;
            this.evaluator = evaluator;
            this.metaRegistry = metaRegistry;
            this.metaReader = metaReader;
            this.scopeReader = scopeReader;
            this.scopeRegistry = scopeRegistry;
            this.typeCheckScopeRegistry = typeCheckScopeRegistry;
            this.resourceRegistry = resourceRegistry;
            this.isCore = isCore;
            this.resourceLoader = resourceLoader;
            this.rootDirs = rootDirs;
            this.defaultPreserveWhitespaces = defaultPreserveWhitespaces;
            this.i18nUseExternalIds = i18nUseExternalIds;
            this.enableI18nLegacyMessageIdFormat = enableI18nLegacyMessageIdFormat;
            this.usePoisonedData = usePoisonedData;
            this.i18nNormalizeLineEndingsInICUs = i18nNormalizeLineEndingsInICUs;
            this.moduleResolver = moduleResolver;
            this.cycleAnalyzer = cycleAnalyzer;
            this.cycleHandlingStrategy = cycleHandlingStrategy;
            this.refEmitter = refEmitter;
            this.depTracker = depTracker;
            this.injectableRegistry = injectableRegistry;
            this.semanticDepGraphUpdater = semanticDepGraphUpdater;
            this.annotateForClosureCompiler = annotateForClosureCompiler;
            this.perf = perf;
            this.literalCache = new Map();
            this.elementSchemaRegistry = new compiler_1.DomElementSchemaRegistry();
            /**
             * During the asynchronous preanalyze phase, it's necessary to parse the template to extract
             * any potential <link> tags which might need to be loaded. This cache ensures that work is not
             * thrown away, and the parsed template is reused during the analyze phase.
             */
            this.preanalyzeTemplateCache = new Map();
            this.preanalyzeStylesCache = new Map();
            this.precedence = transform_1.HandlerPrecedence.PRIMARY;
            this.name = ComponentDecoratorHandler.name;
        }
        ComponentDecoratorHandler.prototype.detect = function (node, decorators) {
            if (!decorators) {
                return undefined;
            }
            var decorator = util_1.findAngularDecorator(decorators, 'Component', this.isCore);
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
        ComponentDecoratorHandler.prototype.preanalyze = function (node, decorator) {
            // In preanalyze, resource URLs associated with the component are asynchronously preloaded via
            // the resourceLoader. This is the only time async operations are allowed for a component.
            // These resources are:
            //
            // - the templateUrl, if there is one
            // - any styleUrls if present
            // - any stylesheets referenced from <link> tags in the template itself
            //
            // As a result of the last one, the template must be parsed as part of preanalysis to extract
            // <link> tags, which may involve waiting for the templateUrl to be resolved first.
            var _this = this;
            // If preloading isn't possible, then skip this step.
            if (!this.resourceLoader.canPreload) {
                return undefined;
            }
            var meta = this._resolveLiteral(decorator);
            var component = reflection_1.reflectObjectLiteral(meta);
            var containingFile = node.getSourceFile().fileName;
            var resolveStyleUrl = function (styleUrl) {
                try {
                    var resourceUrl = _this.resourceLoader.resolve(styleUrl, containingFile);
                    return _this.resourceLoader.preload(resourceUrl, { type: 'style', containingFile: containingFile });
                }
                catch (_a) {
                    // Don't worry about failures to preload. We can handle this problem during analysis by
                    // producing a diagnostic.
                    return undefined;
                }
            };
            // A Promise that waits for the template and all <link>ed styles within it to be preloaded.
            var templateAndTemplateStyleResources = this._preloadAndParseTemplate(node, decorator, component, containingFile)
                .then(function (template) {
                if (template === null) {
                    return undefined;
                }
                return Promise.all(template.styleUrls.map(function (styleUrl) { return resolveStyleUrl(styleUrl); }))
                    .then(function () { return undefined; });
            });
            // Extract all the styleUrls in the decorator.
            var componentStyleUrls = this._extractComponentStyleUrls(component);
            // Extract inline styles, process, and cache for use in synchronous analyze phase
            var inlineStyles;
            if (component.has('styles')) {
                var litStyles = directive_1.parseFieldArrayValue(component, 'styles', this.evaluator);
                if (litStyles === null) {
                    this.preanalyzeStylesCache.set(node, null);
                }
                else {
                    inlineStyles = Promise
                        .all(litStyles.map(function (style) { return _this.resourceLoader.preprocessInline(style, { type: 'style', containingFile: containingFile }); }))
                        .then(function (styles) {
                        _this.preanalyzeStylesCache.set(node, styles);
                    });
                }
            }
            else {
                this.preanalyzeStylesCache.set(node, null);
            }
            // Wait for both the template and all styleUrl resources to resolve.
            return Promise
                .all(tslib_1.__spreadArray([
                templateAndTemplateStyleResources, inlineStyles
            ], tslib_1.__read(componentStyleUrls.map(function (styleUrl) { return resolveStyleUrl(styleUrl.url); }))))
                .then(function () { return undefined; });
        };
        ComponentDecoratorHandler.prototype.analyze = function (node, decorator, flags) {
            var e_1, _a;
            var _b;
            if (flags === void 0) { flags = transform_1.HandlerFlags.NONE; }
            this.perf.eventCount(perf_1.PerfEvent.AnalyzeComponent);
            var containingFile = node.getSourceFile().fileName;
            this.literalCache.delete(decorator);
            var diagnostics;
            var isPoisoned = false;
            // @Component inherits @Directive, so begin by extracting the @Directive metadata and building
            // on it.
            var directiveResult = directive_1.extractDirectiveMetadata(node, decorator, this.reflector, this.evaluator, this.isCore, flags, this.annotateForClosureCompiler, this.elementSchemaRegistry.getDefaultComponentElementName());
            if (directiveResult === undefined) {
                // `extractDirectiveMetadata` returns undefined when the @Directive has `jit: true`. In this
                // case, compilation of the decorator is skipped. Returning an empty object signifies
                // that no analysis was produced.
                return {};
            }
            // Next, read the `@Component`-specific fields.
            var component = directiveResult.decorator, metadata = directiveResult.metadata, inputs = directiveResult.inputs, outputs = directiveResult.outputs;
            // Go through the root directories for this project, and select the one with the smallest
            // relative path representation.
            var relativeContextFilePath = this.rootDirs.reduce(function (previous, rootDir) {
                var candidate = file_system_1.relative(file_system_1.absoluteFrom(rootDir), file_system_1.absoluteFrom(containingFile));
                if (previous === undefined || candidate.length < previous.length) {
                    return candidate;
                }
                else {
                    return previous;
                }
            }, undefined);
            // Note that we could technically combine the `viewProvidersRequiringFactory` and
            // `providersRequiringFactory` into a single set, but we keep the separate so that
            // we can distinguish where an error is coming from when logging the diagnostics in `resolve`.
            var viewProvidersRequiringFactory = null;
            var providersRequiringFactory = null;
            var wrappedViewProviders = null;
            if (component.has('viewProviders')) {
                var viewProviders = component.get('viewProviders');
                viewProvidersRequiringFactory =
                    util_1.resolveProvidersRequiringFactory(viewProviders, this.reflector, this.evaluator);
                wrappedViewProviders = new compiler_1.WrappedNodeExpr(this.annotateForClosureCompiler ? util_1.wrapFunctionExpressionsInParens(viewProviders) :
                    viewProviders);
            }
            if (component.has('providers')) {
                providersRequiringFactory = util_1.resolveProvidersRequiringFactory(component.get('providers'), this.reflector, this.evaluator);
            }
            // Parse the template.
            // If a preanalyze phase was executed, the template may already exist in parsed form, so check
            // the preanalyzeTemplateCache.
            // Extract a closure of the template parsing code so that it can be reparsed with different
            // options if needed, like in the indexing pipeline.
            var template;
            if (this.preanalyzeTemplateCache.has(node)) {
                // The template was parsed in preanalyze. Use it and delete it to save memory.
                var preanalyzed = this.preanalyzeTemplateCache.get(node);
                this.preanalyzeTemplateCache.delete(node);
                template = preanalyzed;
            }
            else {
                var templateDecl = this.parseTemplateDeclaration(decorator, component, containingFile);
                template = this.extractTemplate(node, templateDecl);
            }
            var templateResource = template.declaration.isInline ? { path: null, expression: component.get('template') } : {
                path: file_system_1.absoluteFrom(template.declaration.resolvedTemplateUrl),
                expression: template.sourceMapping.node
            };
            // Figure out the set of styles. The ordering here is important: external resources (styleUrls)
            // precede inline styles, and styles defined in the template override styles defined in the
            // component.
            var styles = [];
            var styleResources = this._extractStyleResources(component, containingFile);
            var styleUrls = tslib_1.__spreadArray(tslib_1.__spreadArray([], tslib_1.__read(this._extractComponentStyleUrls(component))), tslib_1.__read(this._extractTemplateStyleUrls(template)));
            try {
                for (var styleUrls_1 = tslib_1.__values(styleUrls), styleUrls_1_1 = styleUrls_1.next(); !styleUrls_1_1.done; styleUrls_1_1 = styleUrls_1.next()) {
                    var styleUrl = styleUrls_1_1.value;
                    try {
                        var resourceUrl = this.resourceLoader.resolve(styleUrl.url, containingFile);
                        var resourceStr = this.resourceLoader.load(resourceUrl);
                        styles.push(resourceStr);
                        if (this.depTracker !== null) {
                            this.depTracker.addResourceDependency(node.getSourceFile(), file_system_1.absoluteFrom(resourceUrl));
                        }
                    }
                    catch (_c) {
                        if (diagnostics === undefined) {
                            diagnostics = [];
                        }
                        var resourceType = styleUrl.source === 2 /* StylesheetFromDecorator */ ?
                            2 /* StylesheetFromDecorator */ :
                            1 /* StylesheetFromTemplate */;
                        diagnostics.push(this.makeResourceNotFoundError(styleUrl.url, styleUrl.nodeForError, resourceType)
                            .toDiagnostic());
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (styleUrls_1_1 && !styleUrls_1_1.done && (_a = styleUrls_1.return)) _a.call(styleUrls_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            // If inline styles were preprocessed use those
            var inlineStyles = null;
            if (this.preanalyzeStylesCache.has(node)) {
                inlineStyles = this.preanalyzeStylesCache.get(node);
                this.preanalyzeStylesCache.delete(node);
                if (inlineStyles !== null) {
                    styles.push.apply(styles, tslib_1.__spreadArray([], tslib_1.__read(inlineStyles)));
                }
            }
            else {
                // Preprocessing is only supported asynchronously
                // If no style cache entry is present asynchronous preanalyze was not executed.
                // This protects against accidental differences in resource contents when preanalysis
                // is not used with a provided transformResource hook on the ResourceHost.
                if (this.resourceLoader.canPreprocess) {
                    throw new Error('Inline resource processing requires asynchronous preanalyze.');
                }
                if (component.has('styles')) {
                    var litStyles = directive_1.parseFieldArrayValue(component, 'styles', this.evaluator);
                    if (litStyles !== null) {
                        inlineStyles = tslib_1.__spreadArray([], tslib_1.__read(litStyles));
                        styles.push.apply(styles, tslib_1.__spreadArray([], tslib_1.__read(litStyles)));
                    }
                }
            }
            if (template.styles.length > 0) {
                styles.push.apply(styles, tslib_1.__spreadArray([], tslib_1.__read(template.styles)));
            }
            var encapsulation = this._resolveEnumValue(component, 'encapsulation', 'ViewEncapsulation') || 0;
            var changeDetection = this._resolveEnumValue(component, 'changeDetection', 'ChangeDetectionStrategy');
            var animations = null;
            if (component.has('animations')) {
                animations = new compiler_1.WrappedNodeExpr(component.get('animations'));
            }
            var output = {
                analysis: {
                    baseClass: util_1.readBaseClass(node, this.reflector, this.evaluator),
                    inputs: inputs,
                    outputs: outputs,
                    meta: tslib_1.__assign(tslib_1.__assign({}, metadata), { template: {
                            nodes: template.nodes,
                            ngContentSelectors: template.ngContentSelectors,
                        }, encapsulation: encapsulation, interpolation: (_b = template.interpolationConfig) !== null && _b !== void 0 ? _b : compiler_1.DEFAULT_INTERPOLATION_CONFIG, styles: styles,
                        // These will be replaced during the compilation step, after all `NgModule`s have been
                        // analyzed and the full compilation scope for the component can be realized.
                        animations: animations, viewProviders: wrappedViewProviders, i18nUseExternalIds: this.i18nUseExternalIds, relativeContextFilePath: relativeContextFilePath }),
                    typeCheckMeta: metadata_1.extractDirectiveTypeCheckMeta(node, inputs, this.reflector),
                    classMetadata: metadata_2.extractClassMetadata(node, this.reflector, this.isCore, this.annotateForClosureCompiler),
                    template: template,
                    providersRequiringFactory: providersRequiringFactory,
                    viewProvidersRequiringFactory: viewProvidersRequiringFactory,
                    inlineStyles: inlineStyles,
                    styleUrls: styleUrls,
                    resources: {
                        styles: styleResources,
                        template: templateResource,
                    },
                    isPoisoned: isPoisoned,
                },
                diagnostics: diagnostics,
            };
            if (changeDetection !== null) {
                output.analysis.meta.changeDetection = changeDetection;
            }
            return output;
        };
        ComponentDecoratorHandler.prototype.symbol = function (node, analysis) {
            var typeParameters = semantic_graph_1.extractSemanticTypeParameters(node);
            return new ComponentSymbol(node, analysis.meta.selector, analysis.inputs, analysis.outputs, analysis.meta.exportAs, analysis.typeCheckMeta, typeParameters);
        };
        ComponentDecoratorHandler.prototype.register = function (node, analysis) {
            // Register this component's information with the `MetadataRegistry`. This ensures that
            // the information about the component is available during the compile() phase.
            var ref = new imports_1.Reference(node);
            this.metaRegistry.registerDirectiveMetadata(tslib_1.__assign(tslib_1.__assign({ ref: ref, name: node.name.text, selector: analysis.meta.selector, exportAs: analysis.meta.exportAs, inputs: analysis.inputs, outputs: analysis.outputs, queries: analysis.meta.queries.map(function (query) { return query.propertyName; }), isComponent: true, baseClass: analysis.baseClass }, analysis.typeCheckMeta), { isPoisoned: analysis.isPoisoned, isStructural: false }));
            this.resourceRegistry.registerResources(analysis.resources, node);
            this.injectableRegistry.registerInjectable(node);
        };
        ComponentDecoratorHandler.prototype.index = function (context, node, analysis) {
            var e_2, _a;
            if (analysis.isPoisoned && !this.usePoisonedData) {
                return null;
            }
            var scope = this.scopeReader.getScopeForComponent(node);
            var selector = analysis.meta.selector;
            var matcher = new compiler_1.SelectorMatcher();
            if (scope !== null) {
                if ((scope.compilation.isPoisoned || scope.exported.isPoisoned) && !this.usePoisonedData) {
                    // Don't bother indexing components which had erroneous scopes, unless specifically
                    // requested.
                    return null;
                }
                try {
                    for (var _b = tslib_1.__values(scope.compilation.directives), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var directive = _c.value;
                        if (directive.selector !== null) {
                            matcher.addSelectables(compiler_1.CssSelector.parse(directive.selector), directive);
                        }
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
            }
            var binder = new compiler_1.R3TargetBinder(matcher);
            var boundTemplate = binder.bind({ template: analysis.template.diagNodes });
            context.addComponent({
                declaration: node,
                selector: selector,
                boundTemplate: boundTemplate,
                templateMeta: {
                    isInline: analysis.template.declaration.isInline,
                    file: analysis.template.file,
                },
            });
        };
        ComponentDecoratorHandler.prototype.typeCheck = function (ctx, node, meta) {
            if (this.typeCheckScopeRegistry === null || !ts.isClassDeclaration(node)) {
                return;
            }
            if (meta.isPoisoned && !this.usePoisonedData) {
                return;
            }
            var scope = this.typeCheckScopeRegistry.getTypeCheckScope(node);
            if (scope.isPoisoned && !this.usePoisonedData) {
                // Don't type-check components that had errors in their scopes, unless requested.
                return;
            }
            var binder = new compiler_1.R3TargetBinder(scope.matcher);
            ctx.addTemplate(new imports_1.Reference(node), binder, meta.template.diagNodes, scope.pipes, scope.schemas, meta.template.sourceMapping, meta.template.file, meta.template.errors);
        };
        ComponentDecoratorHandler.prototype.resolve = function (node, analysis, symbol) {
            var e_3, _a, e_4, _b, e_5, _c, e_6, _d, e_7, _e, e_8, _f, e_9, _g, e_10, _h, e_11, _j;
            var _this = this;
            if (this.semanticDepGraphUpdater !== null && analysis.baseClass instanceof imports_1.Reference) {
                symbol.baseClass = this.semanticDepGraphUpdater.getSymbol(analysis.baseClass.node);
            }
            if (analysis.isPoisoned && !this.usePoisonedData) {
                return {};
            }
            var context = node.getSourceFile();
            // Check whether this component was registered with an NgModule. If so, it should be compiled
            // under that module's compilation scope.
            var scope = this.scopeReader.getScopeForComponent(node);
            var metadata = analysis.meta;
            var data = {
                directives: EMPTY_ARRAY,
                pipes: EMPTY_MAP,
                declarationListEmitMode: 0 /* Direct */,
            };
            if (scope !== null && (!scope.compilation.isPoisoned || this.usePoisonedData)) {
                var matcher = new compiler_1.SelectorMatcher();
                try {
                    for (var _k = tslib_1.__values(scope.compilation.directives), _l = _k.next(); !_l.done; _l = _k.next()) {
                        var dir = _l.value;
                        if (dir.selector !== null) {
                            matcher.addSelectables(compiler_1.CssSelector.parse(dir.selector), dir);
                        }
                    }
                }
                catch (e_3_1) { e_3 = { error: e_3_1 }; }
                finally {
                    try {
                        if (_l && !_l.done && (_a = _k.return)) _a.call(_k);
                    }
                    finally { if (e_3) throw e_3.error; }
                }
                var pipes = new Map();
                try {
                    for (var _m = tslib_1.__values(scope.compilation.pipes), _o = _m.next(); !_o.done; _o = _m.next()) {
                        var pipe = _o.value;
                        pipes.set(pipe.name, pipe.ref);
                    }
                }
                catch (e_4_1) { e_4 = { error: e_4_1 }; }
                finally {
                    try {
                        if (_o && !_o.done && (_b = _m.return)) _b.call(_m);
                    }
                    finally { if (e_4) throw e_4.error; }
                }
                // Next, the component template AST is bound using the R3TargetBinder. This produces a
                // BoundTarget, which is similar to a ts.TypeChecker.
                var binder = new compiler_1.R3TargetBinder(matcher);
                var bound = binder.bind({ template: metadata.template.nodes });
                var usedDirectives = bound.getUsedDirectives().map(function (directive) {
                    var type = _this.refEmitter.emit(directive.ref, context);
                    return {
                        ref: directive.ref,
                        type: type.expression,
                        importedFile: type.importedFile,
                        selector: directive.selector,
                        inputs: directive.inputs.propertyNames,
                        outputs: directive.outputs.propertyNames,
                        exportAs: directive.exportAs,
                        isComponent: directive.isComponent,
                    };
                });
                var usedPipes = [];
                try {
                    for (var _p = tslib_1.__values(bound.getUsedPipes()), _q = _p.next(); !_q.done; _q = _p.next()) {
                        var pipeName = _q.value;
                        if (!pipes.has(pipeName)) {
                            continue;
                        }
                        var pipe = pipes.get(pipeName);
                        var type = this.refEmitter.emit(pipe, context);
                        usedPipes.push({
                            ref: pipe,
                            pipeName: pipeName,
                            expression: type.expression,
                            importedFile: type.importedFile,
                        });
                    }
                }
                catch (e_5_1) { e_5 = { error: e_5_1 }; }
                finally {
                    try {
                        if (_q && !_q.done && (_c = _p.return)) _c.call(_p);
                    }
                    finally { if (e_5) throw e_5.error; }
                }
                if (this.semanticDepGraphUpdater !== null) {
                    symbol.usedDirectives = usedDirectives.map(function (dir) { return _this.semanticDepGraphUpdater.getSemanticReference(dir.ref.node, dir.type); });
                    symbol.usedPipes = usedPipes.map(function (pipe) {
                        return _this.semanticDepGraphUpdater.getSemanticReference(pipe.ref.node, pipe.expression);
                    });
                }
                // Scan through the directives/pipes actually used in the template and check whether any
                // import which needs to be generated would create a cycle.
                var cyclesFromDirectives = new Map();
                try {
                    for (var usedDirectives_1 = tslib_1.__values(usedDirectives), usedDirectives_1_1 = usedDirectives_1.next(); !usedDirectives_1_1.done; usedDirectives_1_1 = usedDirectives_1.next()) {
                        var usedDirective = usedDirectives_1_1.value;
                        var cycle = this._checkForCyclicImport(usedDirective.importedFile, usedDirective.type, context);
                        if (cycle !== null) {
                            cyclesFromDirectives.set(usedDirective, cycle);
                        }
                    }
                }
                catch (e_6_1) { e_6 = { error: e_6_1 }; }
                finally {
                    try {
                        if (usedDirectives_1_1 && !usedDirectives_1_1.done && (_d = usedDirectives_1.return)) _d.call(usedDirectives_1);
                    }
                    finally { if (e_6) throw e_6.error; }
                }
                var cyclesFromPipes = new Map();
                try {
                    for (var usedPipes_1 = tslib_1.__values(usedPipes), usedPipes_1_1 = usedPipes_1.next(); !usedPipes_1_1.done; usedPipes_1_1 = usedPipes_1.next()) {
                        var usedPipe = usedPipes_1_1.value;
                        var cycle = this._checkForCyclicImport(usedPipe.importedFile, usedPipe.expression, context);
                        if (cycle !== null) {
                            cyclesFromPipes.set(usedPipe, cycle);
                        }
                    }
                }
                catch (e_7_1) { e_7 = { error: e_7_1 }; }
                finally {
                    try {
                        if (usedPipes_1_1 && !usedPipes_1_1.done && (_e = usedPipes_1.return)) _e.call(usedPipes_1);
                    }
                    finally { if (e_7) throw e_7.error; }
                }
                var cycleDetected = cyclesFromDirectives.size !== 0 || cyclesFromPipes.size !== 0;
                if (!cycleDetected) {
                    try {
                        // No cycle was detected. Record the imports that need to be created in the cycle detector
                        // so that future cyclic import checks consider their production.
                        for (var usedDirectives_2 = tslib_1.__values(usedDirectives), usedDirectives_2_1 = usedDirectives_2.next(); !usedDirectives_2_1.done; usedDirectives_2_1 = usedDirectives_2.next()) {
                            var _r = usedDirectives_2_1.value, type = _r.type, importedFile = _r.importedFile;
                            this._recordSyntheticImport(importedFile, type, context);
                        }
                    }
                    catch (e_8_1) { e_8 = { error: e_8_1 }; }
                    finally {
                        try {
                            if (usedDirectives_2_1 && !usedDirectives_2_1.done && (_f = usedDirectives_2.return)) _f.call(usedDirectives_2);
                        }
                        finally { if (e_8) throw e_8.error; }
                    }
                    try {
                        for (var usedPipes_2 = tslib_1.__values(usedPipes), usedPipes_2_1 = usedPipes_2.next(); !usedPipes_2_1.done; usedPipes_2_1 = usedPipes_2.next()) {
                            var _s = usedPipes_2_1.value, expression = _s.expression, importedFile = _s.importedFile;
                            this._recordSyntheticImport(importedFile, expression, context);
                        }
                    }
                    catch (e_9_1) { e_9 = { error: e_9_1 }; }
                    finally {
                        try {
                            if (usedPipes_2_1 && !usedPipes_2_1.done && (_g = usedPipes_2.return)) _g.call(usedPipes_2);
                        }
                        finally { if (e_9) throw e_9.error; }
                    }
                    // Check whether the directive/pipe arrays in ɵcmp need to be wrapped in closures.
                    // This is required if any directive/pipe reference is to a declaration in the same file
                    // but declared after this component.
                    var wrapDirectivesAndPipesInClosure = usedDirectives.some(function (dir) { return util_1.isExpressionForwardReference(dir.type, node.name, context); }) ||
                        usedPipes.some(function (pipe) { return util_1.isExpressionForwardReference(pipe.expression, node.name, context); });
                    data.directives = usedDirectives;
                    data.pipes = new Map(usedPipes.map(function (pipe) { return [pipe.pipeName, pipe.expression]; }));
                    data.declarationListEmitMode = wrapDirectivesAndPipesInClosure ?
                        1 /* Closure */ :
                        0 /* Direct */;
                }
                else {
                    if (this.cycleHandlingStrategy === 0 /* UseRemoteScoping */) {
                        // Declaring the directiveDefs/pipeDefs arrays directly would require imports that would
                        // create a cycle. Instead, mark this component as requiring remote scoping, so that the
                        // NgModule file will take care of setting the directives for the component.
                        this.scopeRegistry.setComponentRemoteScope(node, usedDirectives.map(function (dir) { return dir.ref; }), usedPipes.map(function (pipe) { return pipe.ref; }));
                        symbol.isRemotelyScoped = true;
                        // If a semantic graph is being tracked, record the fact that this component is remotely
                        // scoped with the declaring NgModule symbol as the NgModule's emit becomes dependent on
                        // the directive/pipe usages of this component.
                        if (this.semanticDepGraphUpdater !== null) {
                            var moduleSymbol = this.semanticDepGraphUpdater.getSymbol(scope.ngModule);
                            if (!(moduleSymbol instanceof ng_module_1.NgModuleSymbol)) {
                                throw new Error("AssertionError: Expected " + scope.ngModule.name + " to be an NgModuleSymbol.");
                            }
                            moduleSymbol.addRemotelyScopedComponent(symbol, symbol.usedDirectives, symbol.usedPipes);
                        }
                    }
                    else {
                        // We are not able to handle this cycle so throw an error.
                        var relatedMessages = [];
                        try {
                            for (var cyclesFromDirectives_1 = tslib_1.__values(cyclesFromDirectives), cyclesFromDirectives_1_1 = cyclesFromDirectives_1.next(); !cyclesFromDirectives_1_1.done; cyclesFromDirectives_1_1 = cyclesFromDirectives_1.next()) {
                                var _t = tslib_1.__read(cyclesFromDirectives_1_1.value, 2), dir = _t[0], cycle = _t[1];
                                relatedMessages.push(makeCyclicImportInfo(dir.ref, dir.isComponent ? 'component' : 'directive', cycle));
                            }
                        }
                        catch (e_10_1) { e_10 = { error: e_10_1 }; }
                        finally {
                            try {
                                if (cyclesFromDirectives_1_1 && !cyclesFromDirectives_1_1.done && (_h = cyclesFromDirectives_1.return)) _h.call(cyclesFromDirectives_1);
                            }
                            finally { if (e_10) throw e_10.error; }
                        }
                        try {
                            for (var cyclesFromPipes_1 = tslib_1.__values(cyclesFromPipes), cyclesFromPipes_1_1 = cyclesFromPipes_1.next(); !cyclesFromPipes_1_1.done; cyclesFromPipes_1_1 = cyclesFromPipes_1.next()) {
                                var _u = tslib_1.__read(cyclesFromPipes_1_1.value, 2), pipe = _u[0], cycle = _u[1];
                                relatedMessages.push(makeCyclicImportInfo(pipe.ref, 'pipe', cycle));
                            }
                        }
                        catch (e_11_1) { e_11 = { error: e_11_1 }; }
                        finally {
                            try {
                                if (cyclesFromPipes_1_1 && !cyclesFromPipes_1_1.done && (_j = cyclesFromPipes_1.return)) _j.call(cyclesFromPipes_1);
                            }
                            finally { if (e_11) throw e_11.error; }
                        }
                        throw new diagnostics_1.FatalDiagnosticError(diagnostics_1.ErrorCode.IMPORT_CYCLE_DETECTED, node, 'One or more import cycles would need to be created to compile this component, ' +
                            'which is not supported by the current compiler configuration.', relatedMessages);
                    }
                }
            }
            var diagnostics = [];
            if (analysis.providersRequiringFactory !== null &&
                analysis.meta.providers instanceof compiler_1.WrappedNodeExpr) {
                var providerDiagnostics = diagnostics_2.getProviderDiagnostics(analysis.providersRequiringFactory, analysis.meta.providers.node, this.injectableRegistry);
                diagnostics.push.apply(diagnostics, tslib_1.__spreadArray([], tslib_1.__read(providerDiagnostics)));
            }
            if (analysis.viewProvidersRequiringFactory !== null &&
                analysis.meta.viewProviders instanceof compiler_1.WrappedNodeExpr) {
                var viewProviderDiagnostics = diagnostics_2.getProviderDiagnostics(analysis.viewProvidersRequiringFactory, analysis.meta.viewProviders.node, this.injectableRegistry);
                diagnostics.push.apply(diagnostics, tslib_1.__spreadArray([], tslib_1.__read(viewProviderDiagnostics)));
            }
            var directiveDiagnostics = diagnostics_2.getDirectiveDiagnostics(node, this.metaReader, this.evaluator, this.reflector, this.scopeRegistry, 'Component');
            if (directiveDiagnostics !== null) {
                diagnostics.push.apply(diagnostics, tslib_1.__spreadArray([], tslib_1.__read(directiveDiagnostics)));
            }
            if (diagnostics.length > 0) {
                return { diagnostics: diagnostics };
            }
            return { data: data };
        };
        ComponentDecoratorHandler.prototype.updateResources = function (node, analysis) {
            var e_12, _a, e_13, _b, e_14, _c;
            var containingFile = node.getSourceFile().fileName;
            // If the template is external, re-parse it.
            var templateDecl = analysis.template.declaration;
            if (!templateDecl.isInline) {
                analysis.template = this.extractTemplate(node, templateDecl);
            }
            // Update any external stylesheets and rebuild the combined 'styles' list.
            // TODO(alxhub): write tests for styles when the primary compiler uses the updateResources path
            var styles = [];
            if (analysis.styleUrls !== null) {
                try {
                    for (var _d = tslib_1.__values(analysis.styleUrls), _e = _d.next(); !_e.done; _e = _d.next()) {
                        var styleUrl = _e.value;
                        try {
                            var resolvedStyleUrl = this.resourceLoader.resolve(styleUrl.url, containingFile);
                            var styleText = this.resourceLoader.load(resolvedStyleUrl);
                            styles.push(styleText);
                        }
                        catch (e) {
                            // Resource resolve failures should already be in the diagnostics list from the analyze
                            // stage. We do not need to do anything with them when updating resources.
                        }
                    }
                }
                catch (e_12_1) { e_12 = { error: e_12_1 }; }
                finally {
                    try {
                        if (_e && !_e.done && (_a = _d.return)) _a.call(_d);
                    }
                    finally { if (e_12) throw e_12.error; }
                }
            }
            if (analysis.inlineStyles !== null) {
                try {
                    for (var _f = tslib_1.__values(analysis.inlineStyles), _g = _f.next(); !_g.done; _g = _f.next()) {
                        var styleText = _g.value;
                        styles.push(styleText);
                    }
                }
                catch (e_13_1) { e_13 = { error: e_13_1 }; }
                finally {
                    try {
                        if (_g && !_g.done && (_b = _f.return)) _b.call(_f);
                    }
                    finally { if (e_13) throw e_13.error; }
                }
            }
            try {
                for (var _h = tslib_1.__values(analysis.template.styles), _j = _h.next(); !_j.done; _j = _h.next()) {
                    var styleText = _j.value;
                    styles.push(styleText);
                }
            }
            catch (e_14_1) { e_14 = { error: e_14_1 }; }
            finally {
                try {
                    if (_j && !_j.done && (_c = _h.return)) _c.call(_h);
                }
                finally { if (e_14) throw e_14.error; }
            }
            analysis.meta.styles = styles;
        };
        ComponentDecoratorHandler.prototype.compileFull = function (node, analysis, resolution, pool) {
            if (analysis.template.errors !== null && analysis.template.errors.length > 0) {
                return [];
            }
            var meta = tslib_1.__assign(tslib_1.__assign({}, analysis.meta), resolution);
            var fac = factory_1.compileNgFactoryDefField(util_1.toFactoryMetadata(meta, compiler_1.FactoryTarget.Component));
            var def = compiler_1.compileComponentFromMetadata(meta, pool, compiler_1.makeBindingParser());
            var classMetadata = analysis.classMetadata !== null ?
                compiler_1.compileClassMetadata(analysis.classMetadata).toStmt() :
                null;
            return util_1.compileResults(fac, def, classMetadata, 'ɵcmp');
        };
        ComponentDecoratorHandler.prototype.compilePartial = function (node, analysis, resolution) {
            if (analysis.template.errors !== null && analysis.template.errors.length > 0) {
                return [];
            }
            var templateInfo = {
                content: analysis.template.content,
                sourceUrl: analysis.template.declaration.resolvedTemplateUrl,
                isInline: analysis.template.declaration.isInline,
                inlineTemplateLiteralExpression: analysis.template.sourceMapping.type === 'direct' ?
                    new compiler_1.WrappedNodeExpr(analysis.template.sourceMapping.node) :
                    null,
            };
            var meta = tslib_1.__assign(tslib_1.__assign({}, analysis.meta), resolution);
            var fac = factory_1.compileDeclareFactory(util_1.toFactoryMetadata(meta, compiler_1.FactoryTarget.Component));
            var def = compiler_1.compileDeclareComponentFromMetadata(meta, analysis.template, templateInfo);
            var classMetadata = analysis.classMetadata !== null ?
                compiler_1.compileDeclareClassMetadata(analysis.classMetadata).toStmt() :
                null;
            return util_1.compileResults(fac, def, classMetadata, 'ɵcmp');
        };
        ComponentDecoratorHandler.prototype._resolveLiteral = function (decorator) {
            if (this.literalCache.has(decorator)) {
                return this.literalCache.get(decorator);
            }
            if (decorator.args === null || decorator.args.length !== 1) {
                throw new diagnostics_1.FatalDiagnosticError(diagnostics_1.ErrorCode.DECORATOR_ARITY_WRONG, reflection_1.Decorator.nodeForError(decorator), "Incorrect number of arguments to @Component decorator");
            }
            var meta = util_1.unwrapExpression(decorator.args[0]);
            if (!ts.isObjectLiteralExpression(meta)) {
                throw new diagnostics_1.FatalDiagnosticError(diagnostics_1.ErrorCode.DECORATOR_ARG_NOT_LITERAL, meta, "Decorator argument must be literal.");
            }
            this.literalCache.set(decorator, meta);
            return meta;
        };
        ComponentDecoratorHandler.prototype._resolveEnumValue = function (component, field, enumSymbolName) {
            var resolved = null;
            if (component.has(field)) {
                var expr = component.get(field);
                var value = this.evaluator.evaluate(expr);
                if (value instanceof partial_evaluator_1.EnumValue && util_1.isAngularCoreReference(value.enumRef, enumSymbolName)) {
                    resolved = value.resolved;
                }
                else {
                    throw diagnostics_2.createValueHasWrongTypeError(expr, value, field + " must be a member of " + enumSymbolName + " enum from @angular/core");
                }
            }
            return resolved;
        };
        ComponentDecoratorHandler.prototype._extractComponentStyleUrls = function (component) {
            if (!component.has('styleUrls')) {
                return [];
            }
            return this._extractStyleUrlsFromExpression(component.get('styleUrls'));
        };
        ComponentDecoratorHandler.prototype._extractStyleUrlsFromExpression = function (styleUrlsExpr) {
            var e_15, _a, e_16, _b;
            var styleUrls = [];
            if (ts.isArrayLiteralExpression(styleUrlsExpr)) {
                try {
                    for (var _c = tslib_1.__values(styleUrlsExpr.elements), _d = _c.next(); !_d.done; _d = _c.next()) {
                        var styleUrlExpr = _d.value;
                        if (ts.isSpreadElement(styleUrlExpr)) {
                            styleUrls.push.apply(styleUrls, tslib_1.__spreadArray([], tslib_1.__read(this._extractStyleUrlsFromExpression(styleUrlExpr.expression))));
                        }
                        else {
                            var styleUrl = this.evaluator.evaluate(styleUrlExpr);
                            if (typeof styleUrl !== 'string') {
                                throw diagnostics_2.createValueHasWrongTypeError(styleUrlExpr, styleUrl, 'styleUrl must be a string');
                            }
                            styleUrls.push({
                                url: styleUrl,
                                source: 2 /* StylesheetFromDecorator */,
                                nodeForError: styleUrlExpr,
                            });
                        }
                    }
                }
                catch (e_15_1) { e_15 = { error: e_15_1 }; }
                finally {
                    try {
                        if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                    }
                    finally { if (e_15) throw e_15.error; }
                }
            }
            else {
                var evaluatedStyleUrls = this.evaluator.evaluate(styleUrlsExpr);
                if (!isStringArray(evaluatedStyleUrls)) {
                    throw diagnostics_2.createValueHasWrongTypeError(styleUrlsExpr, evaluatedStyleUrls, 'styleUrls must be an array of strings');
                }
                try {
                    for (var evaluatedStyleUrls_1 = tslib_1.__values(evaluatedStyleUrls), evaluatedStyleUrls_1_1 = evaluatedStyleUrls_1.next(); !evaluatedStyleUrls_1_1.done; evaluatedStyleUrls_1_1 = evaluatedStyleUrls_1.next()) {
                        var styleUrl = evaluatedStyleUrls_1_1.value;
                        styleUrls.push({
                            url: styleUrl,
                            source: 2 /* StylesheetFromDecorator */,
                            nodeForError: styleUrlsExpr,
                        });
                    }
                }
                catch (e_16_1) { e_16 = { error: e_16_1 }; }
                finally {
                    try {
                        if (evaluatedStyleUrls_1_1 && !evaluatedStyleUrls_1_1.done && (_b = evaluatedStyleUrls_1.return)) _b.call(evaluatedStyleUrls_1);
                    }
                    finally { if (e_16) throw e_16.error; }
                }
            }
            return styleUrls;
        };
        ComponentDecoratorHandler.prototype._extractStyleResources = function (component, containingFile) {
            var e_17, _a, e_18, _b;
            var styles = new Set();
            function stringLiteralElements(array) {
                return array.elements.filter(function (e) { return ts.isStringLiteralLike(e); });
            }
            // If styleUrls is a literal array, process each resource url individually and
            // register ones that are string literals.
            var styleUrlsExpr = component.get('styleUrls');
            if (styleUrlsExpr !== undefined && ts.isArrayLiteralExpression(styleUrlsExpr)) {
                try {
                    for (var _c = tslib_1.__values(stringLiteralElements(styleUrlsExpr)), _d = _c.next(); !_d.done; _d = _c.next()) {
                        var expression = _d.value;
                        try {
                            var resourceUrl = this.resourceLoader.resolve(expression.text, containingFile);
                            styles.add({ path: file_system_1.absoluteFrom(resourceUrl), expression: expression });
                        }
                        catch (_e) {
                            // Errors in style resource extraction do not need to be handled here. We will produce
                            // diagnostics for each one that fails in the analysis, after we evaluate the `styleUrls`
                            // expression to determine _all_ style resources, not just the string literals.
                        }
                    }
                }
                catch (e_17_1) { e_17 = { error: e_17_1 }; }
                finally {
                    try {
                        if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                    }
                    finally { if (e_17) throw e_17.error; }
                }
            }
            var stylesExpr = component.get('styles');
            if (stylesExpr !== undefined && ts.isArrayLiteralExpression(stylesExpr)) {
                try {
                    for (var _f = tslib_1.__values(stringLiteralElements(stylesExpr)), _g = _f.next(); !_g.done; _g = _f.next()) {
                        var expression = _g.value;
                        styles.add({ path: null, expression: expression });
                    }
                }
                catch (e_18_1) { e_18 = { error: e_18_1 }; }
                finally {
                    try {
                        if (_g && !_g.done && (_b = _f.return)) _b.call(_f);
                    }
                    finally { if (e_18) throw e_18.error; }
                }
            }
            return styles;
        };
        ComponentDecoratorHandler.prototype._preloadAndParseTemplate = function (node, decorator, component, containingFile) {
            var _this = this;
            if (component.has('templateUrl')) {
                // Extract the templateUrl and preload it.
                var templateUrlExpr = component.get('templateUrl');
                var templateUrl = this.evaluator.evaluate(templateUrlExpr);
                if (typeof templateUrl !== 'string') {
                    throw diagnostics_2.createValueHasWrongTypeError(templateUrlExpr, templateUrl, 'templateUrl must be a string');
                }
                try {
                    var resourceUrl = this.resourceLoader.resolve(templateUrl, containingFile);
                    var templatePromise = this.resourceLoader.preload(resourceUrl, { type: 'template', containingFile: containingFile });
                    // If the preload worked, then actually load and parse the template, and wait for any style
                    // URLs to resolve.
                    if (templatePromise !== undefined) {
                        return templatePromise.then(function () {
                            var templateDecl = _this.parseTemplateDeclaration(decorator, component, containingFile);
                            var template = _this.extractTemplate(node, templateDecl);
                            _this.preanalyzeTemplateCache.set(node, template);
                            return template;
                        });
                    }
                    else {
                        return Promise.resolve(null);
                    }
                }
                catch (e) {
                    throw this.makeResourceNotFoundError(templateUrl, templateUrlExpr, 0 /* Template */);
                }
            }
            else {
                var templateDecl = this.parseTemplateDeclaration(decorator, component, containingFile);
                var template = this.extractTemplate(node, templateDecl);
                this.preanalyzeTemplateCache.set(node, template);
                return Promise.resolve(template);
            }
        };
        ComponentDecoratorHandler.prototype.extractTemplate = function (node, template) {
            if (template.isInline) {
                var sourceStr = void 0;
                var sourceParseRange = null;
                var templateContent = void 0;
                var sourceMapping = void 0;
                var escapedString = false;
                var sourceMapUrl = void 0;
                // We only support SourceMaps for inline templates that are simple string literals.
                if (ts.isStringLiteral(template.expression) ||
                    ts.isNoSubstitutionTemplateLiteral(template.expression)) {
                    // the start and end of the `templateExpr` node includes the quotation marks, which we must
                    // strip
                    sourceParseRange = getTemplateRange(template.expression);
                    sourceStr = template.expression.getSourceFile().text;
                    templateContent = template.expression.text;
                    escapedString = true;
                    sourceMapping = {
                        type: 'direct',
                        node: template.expression,
                    };
                    sourceMapUrl = template.resolvedTemplateUrl;
                }
                else {
                    var resolvedTemplate = this.evaluator.evaluate(template.expression);
                    if (typeof resolvedTemplate !== 'string') {
                        throw diagnostics_2.createValueHasWrongTypeError(template.expression, resolvedTemplate, 'template must be a string');
                    }
                    // We do not parse the template directly from the source file using a lexer range, so
                    // the template source and content are set to the statically resolved template.
                    sourceStr = resolvedTemplate;
                    templateContent = resolvedTemplate;
                    sourceMapping = {
                        type: 'indirect',
                        node: template.expression,
                        componentClass: node,
                        template: templateContent,
                    };
                    // Indirect templates cannot be mapped to a particular byte range of any input file, since
                    // they're computed by expressions that may span many files. Don't attempt to map them back
                    // to a given file.
                    sourceMapUrl = null;
                }
                return tslib_1.__assign(tslib_1.__assign({}, this._parseTemplate(template, sourceStr, sourceParseRange, escapedString, sourceMapUrl)), { content: templateContent, sourceMapping: sourceMapping, declaration: template });
            }
            else {
                var templateContent = this.resourceLoader.load(template.resolvedTemplateUrl);
                if (this.depTracker !== null) {
                    this.depTracker.addResourceDependency(node.getSourceFile(), file_system_1.absoluteFrom(template.resolvedTemplateUrl));
                }
                return tslib_1.__assign(tslib_1.__assign({}, this._parseTemplate(template, /* sourceStr */ templateContent, /* sourceParseRange */ null, 
                /* escapedString */ false, 
                /* sourceMapUrl */ template.resolvedTemplateUrl)), { content: templateContent, sourceMapping: {
                        type: 'external',
                        componentClass: node,
                        // TODO(alxhub): TS in g3 is unable to make this inference on its own, so cast it here
                        // until g3 is able to figure this out.
                        node: template.templateUrlExpression,
                        template: templateContent,
                        templateUrl: template.resolvedTemplateUrl,
                    }, declaration: template });
            }
        };
        ComponentDecoratorHandler.prototype._parseTemplate = function (template, sourceStr, sourceParseRange, escapedString, sourceMapUrl) {
            // We always normalize line endings if the template has been escaped (i.e. is inline).
            var i18nNormalizeLineEndingsInICUs = escapedString || this.i18nNormalizeLineEndingsInICUs;
            var parsedTemplate = compiler_1.parseTemplate(sourceStr, sourceMapUrl !== null && sourceMapUrl !== void 0 ? sourceMapUrl : '', {
                preserveWhitespaces: template.preserveWhitespaces,
                interpolationConfig: template.interpolationConfig,
                range: sourceParseRange !== null && sourceParseRange !== void 0 ? sourceParseRange : undefined,
                escapedString: escapedString,
                enableI18nLegacyMessageIdFormat: this.enableI18nLegacyMessageIdFormat,
                i18nNormalizeLineEndingsInICUs: i18nNormalizeLineEndingsInICUs,
                alwaysAttemptHtmlToR3AstConversion: this.usePoisonedData,
            });
            // Unfortunately, the primary parse of the template above may not contain accurate source map
            // information. If used directly, it would result in incorrect code locations in template
            // errors, etc. There are three main problems:
            //
            // 1. `preserveWhitespaces: false` annihilates the correctness of template source mapping, as
            //    the whitespace transformation changes the contents of HTML text nodes before they're
            //    parsed into Angular expressions.
            // 2. `preserveLineEndings: false` causes growing misalignments in templates that use '\r\n'
            //    line endings, by normalizing them to '\n'.
            // 3. By default, the template parser strips leading trivia characters (like spaces, tabs, and
            //    newlines). This also destroys source mapping information.
            //
            // In order to guarantee the correctness of diagnostics, templates are parsed a second time
            // with the above options set to preserve source mappings.
            var diagNodes = compiler_1.parseTemplate(sourceStr, sourceMapUrl !== null && sourceMapUrl !== void 0 ? sourceMapUrl : '', {
                preserveWhitespaces: true,
                preserveLineEndings: true,
                interpolationConfig: template.interpolationConfig,
                range: sourceParseRange !== null && sourceParseRange !== void 0 ? sourceParseRange : undefined,
                escapedString: escapedString,
                enableI18nLegacyMessageIdFormat: this.enableI18nLegacyMessageIdFormat,
                i18nNormalizeLineEndingsInICUs: i18nNormalizeLineEndingsInICUs,
                leadingTriviaChars: [],
                alwaysAttemptHtmlToR3AstConversion: this.usePoisonedData,
            }).nodes;
            return tslib_1.__assign(tslib_1.__assign({}, parsedTemplate), { diagNodes: diagNodes, file: new compiler_1.ParseSourceFile(sourceStr, sourceMapUrl !== null && sourceMapUrl !== void 0 ? sourceMapUrl : '') });
        };
        ComponentDecoratorHandler.prototype.parseTemplateDeclaration = function (decorator, component, containingFile) {
            var preserveWhitespaces = this.defaultPreserveWhitespaces;
            if (component.has('preserveWhitespaces')) {
                var expr = component.get('preserveWhitespaces');
                var value = this.evaluator.evaluate(expr);
                if (typeof value !== 'boolean') {
                    throw diagnostics_2.createValueHasWrongTypeError(expr, value, 'preserveWhitespaces must be a boolean');
                }
                preserveWhitespaces = value;
            }
            var interpolationConfig = compiler_1.DEFAULT_INTERPOLATION_CONFIG;
            if (component.has('interpolation')) {
                var expr = component.get('interpolation');
                var value = this.evaluator.evaluate(expr);
                if (!Array.isArray(value) || value.length !== 2 ||
                    !value.every(function (element) { return typeof element === 'string'; })) {
                    throw diagnostics_2.createValueHasWrongTypeError(expr, value, 'interpolation must be an array with 2 elements of string type');
                }
                interpolationConfig = compiler_1.InterpolationConfig.fromArray(value);
            }
            if (component.has('templateUrl')) {
                var templateUrlExpr = component.get('templateUrl');
                var templateUrl = this.evaluator.evaluate(templateUrlExpr);
                if (typeof templateUrl !== 'string') {
                    throw diagnostics_2.createValueHasWrongTypeError(templateUrlExpr, templateUrl, 'templateUrl must be a string');
                }
                try {
                    var resourceUrl = this.resourceLoader.resolve(templateUrl, containingFile);
                    return {
                        isInline: false,
                        interpolationConfig: interpolationConfig,
                        preserveWhitespaces: preserveWhitespaces,
                        templateUrl: templateUrl,
                        templateUrlExpression: templateUrlExpr,
                        resolvedTemplateUrl: resourceUrl,
                    };
                }
                catch (e) {
                    throw this.makeResourceNotFoundError(templateUrl, templateUrlExpr, 0 /* Template */);
                }
            }
            else if (component.has('template')) {
                return {
                    isInline: true,
                    interpolationConfig: interpolationConfig,
                    preserveWhitespaces: preserveWhitespaces,
                    expression: component.get('template'),
                    templateUrl: containingFile,
                    resolvedTemplateUrl: containingFile,
                };
            }
            else {
                throw new diagnostics_1.FatalDiagnosticError(diagnostics_1.ErrorCode.COMPONENT_MISSING_TEMPLATE, reflection_1.Decorator.nodeForError(decorator), 'component is missing a template');
            }
        };
        ComponentDecoratorHandler.prototype._resolveImportedFile = function (importedFile, expr, origin) {
            // If `importedFile` is not 'unknown' then it accurately reflects the source file that is
            // being imported.
            if (importedFile !== 'unknown') {
                return importedFile;
            }
            // Otherwise `expr` has to be inspected to determine the file that is being imported. If `expr`
            // is not an `ExternalExpr` then it does not correspond with an import, so return null in that
            // case.
            if (!(expr instanceof compiler_1.ExternalExpr)) {
                return null;
            }
            // Figure out what file is being imported.
            return this.moduleResolver.resolveModule(expr.value.moduleName, origin.fileName);
        };
        /**
         * Check whether adding an import from `origin` to the source-file corresponding to `expr` would
         * create a cyclic import.
         *
         * @returns a `Cycle` object if a cycle would be created, otherwise `null`.
         */
        ComponentDecoratorHandler.prototype._checkForCyclicImport = function (importedFile, expr, origin) {
            var imported = this._resolveImportedFile(importedFile, expr, origin);
            if (imported === null) {
                return null;
            }
            // Check whether the import is legal.
            return this.cycleAnalyzer.wouldCreateCycle(origin, imported);
        };
        ComponentDecoratorHandler.prototype._recordSyntheticImport = function (importedFile, expr, origin) {
            var imported = this._resolveImportedFile(importedFile, expr, origin);
            if (imported === null) {
                return;
            }
            this.cycleAnalyzer.recordSyntheticImport(origin, imported);
        };
        ComponentDecoratorHandler.prototype.makeResourceNotFoundError = function (file, nodeForError, resourceType) {
            var errorText;
            switch (resourceType) {
                case 0 /* Template */:
                    errorText = "Could not find template file '" + file + "'.";
                    break;
                case 1 /* StylesheetFromTemplate */:
                    errorText = "Could not find stylesheet file '" + file + "' linked from the template.";
                    break;
                case 2 /* StylesheetFromDecorator */:
                    errorText = "Could not find stylesheet file '" + file + "'.";
                    break;
            }
            return new diagnostics_1.FatalDiagnosticError(diagnostics_1.ErrorCode.COMPONENT_RESOURCE_NOT_FOUND, nodeForError, errorText);
        };
        ComponentDecoratorHandler.prototype._extractTemplateStyleUrls = function (template) {
            if (template.styleUrls === null) {
                return [];
            }
            var nodeForError = getTemplateDeclarationNodeForError(template.declaration);
            return template.styleUrls.map(function (url) { return ({ url: url, source: 1 /* StylesheetFromTemplate */, nodeForError: nodeForError }); });
        };
        return ComponentDecoratorHandler;
    }());
    exports.ComponentDecoratorHandler = ComponentDecoratorHandler;
    function getTemplateRange(templateExpr) {
        var startPos = templateExpr.getStart() + 1;
        var _a = ts.getLineAndCharacterOfPosition(templateExpr.getSourceFile(), startPos), line = _a.line, character = _a.character;
        return {
            startPos: startPos,
            startLine: line,
            startCol: character,
            endPos: templateExpr.getEnd() - 1,
        };
    }
    /** Determines if the result of an evaluation is a string array. */
    function isStringArray(resolvedValue) {
        return Array.isArray(resolvedValue) && resolvedValue.every(function (elem) { return typeof elem === 'string'; });
    }
    /** Determines the node to use for debugging purposes for the given TemplateDeclaration. */
    function getTemplateDeclarationNodeForError(declaration) {
        // TODO(zarend): Change this to if/else when that is compatible with g3. This uses a switch
        // because if/else fails to compile on g3. That is because g3 compiles this in non-strict mode
        // where type inference does not work correctly.
        switch (declaration.isInline) {
            case true:
                return declaration.expression;
            case false:
                return declaration.templateUrlExpression;
        }
    }
    /**
     * Generate a diagnostic related information object that describes a potential cyclic import path.
     */
    function makeCyclicImportInfo(ref, type, cycle) {
        var name = ref.debugName || '(unknown)';
        var path = cycle.getPath().map(function (sf) { return sf.fileName; }).join(' -> ');
        var message = "The " + type + " '" + name + "' is used in the template but importing it would create a cycle: ";
        return diagnostics_1.makeRelatedInformation(ref.node, message + path);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL3NyYy9uZ3RzYy9hbm5vdGF0aW9ucy9zcmMvY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCw4Q0FBdWpCO0lBQ3ZqQiwrQkFBaUM7SUFHakMsMkVBQTBGO0lBQzFGLDJFQUF5RDtJQUN6RCxtRUFBd0Y7SUFFeEYsNkZBQTJLO0lBRTNLLHFFQUFxTztJQUNyTyx1RkFBbUY7SUFDbkYsNkRBQW1EO0lBQ25ELHlFQUFvSDtJQUVwSCx1RUFBOEk7SUFLOUksMkZBQTRHO0lBQzVHLHVGQUE0RjtJQUM1RixtRkFBMEU7SUFDMUUscUZBQWdEO0lBQ2hELHVGQUEyQztJQUMzQyw2RUFBeU87SUFFek8sSUFBTSxTQUFTLEdBQUcsSUFBSSxHQUFHLEVBQXNCLENBQUM7SUFDaEQsSUFBTSxXQUFXLEdBQVUsRUFBRSxDQUFDO0lBK0U5Qjs7T0FFRztJQUNIO1FBQXFDLDJDQUFlO1FBQXBEO1lBQUEscUVBcUVDO1lBcEVDLG9CQUFjLEdBQXdCLEVBQUUsQ0FBQztZQUN6QyxlQUFTLEdBQXdCLEVBQUUsQ0FBQztZQUNwQyxzQkFBZ0IsR0FBRyxLQUFLLENBQUM7O1FBa0UzQixDQUFDO1FBaEVDLHdDQUFjLEdBQWQsVUFBZSxjQUE4QixFQUFFLGlCQUFzQztZQUNuRixJQUFJLENBQUMsQ0FBQyxjQUFjLFlBQVksZUFBZSxDQUFDLEVBQUU7Z0JBQ2hELE9BQU8sSUFBSSxDQUFDO2FBQ2I7WUFFRCxzRkFBc0Y7WUFDdEYsOEZBQThGO1lBQzlGLFlBQVk7WUFDWixJQUFNLGtCQUFrQixHQUFHLFVBQUMsT0FBMEIsRUFBRSxRQUEyQjtnQkFDL0UsT0FBQSxpQ0FBZ0IsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FB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LENBQUMsUUFBUSxFQUFFO1lBQzVCLEtBQUssSUFBSTtnQkFDUCxPQUFPLFdBQVcsQ0FBQyxVQUFVLENBQUM7WUFDaEMsS0FBSyxLQUFLO2dCQUNSLE9BQU8sV0FBVyxDQUFDLHFCQUFxQixDQUFDO1NBQzVDO0lBQ0gsQ0FBQztJQWlFRDs7T0FFRztJQUNILFNBQVMsb0JBQW9CLENBQ3pCLEdBQWMsRUFBRSxJQUFZLEVBQUUsS0FBWTtRQUM1QyxJQUFNLElBQUksR0FBRyxHQUFHLENBQUMsU0FBUyxJQUFJLFdBQVcsQ0FBQztRQUMxQyxJQUFNLElBQUksR0FBRyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUMsR0FBRyxDQUFDLFVBQUEsRUFBRSxJQUFJLE9BQUEsRUFBRSxDQUFDLFFBQVEsRUFBWCxDQUFXLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDakUsSUFBTSxPQUFPLEdBQ1QsU0FBTyxJQUFJLFVBQUssSUFBSSxzRUFBbUUsQ0FBQztRQUM1RixPQUFPLG9DQUFzQixDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsT0FBTyxHQUFHLElBQUksQ0FBQyxDQUFDO0lBQzFELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtjb21waWxlQ2xhc3NNZXRhZGF0YSwgY29tcGlsZUNvbXBvbmVudEZyb21NZXRhZGF0YSwgY29tcGlsZURlY2xhcmVDbGFzc01ldGFkYXRhLCBjb21waWxlRGVjbGFyZUNvbXBvbmVudEZyb21NZXRhZGF0YSwgQ29uc3RhbnRQb29sLCBDc3NTZWxlY3RvciwgRGVjbGFyYXRpb25MaXN0RW1pdE1vZGUsIERlY2xhcmVDb21wb25lbnRUZW1wbGF0ZUluZm8sIERFRkFVTFRfSU5URVJQT0xBVElPTl9DT05GSUcsIERvbUVsZW1lbnRTY2hlbWFSZWdpc3RyeSwgRXhwcmVzc2lvbiwgRXh0ZXJuYWxFeHByLCBGYWN0b3J5VGFyZ2V0LCBJbnRlcnBvbGF0aW9uQ29uZmlnLCBMZXhlclJhbmdlLCBtYWtlQmluZGluZ1BhcnNlciwgUGFyc2VkVGVtcGxhdGUsIFBhcnNlU291cmNlRmlsZSwgcGFyc2VUZW1wbGF0ZSwgUjNDbGFzc01ldGFkYXRhLCBSM0NvbXBvbmVudE1ldGFkYXRhLCBSM1RhcmdldEJpbmRlciwgUjNVc2VkRGlyZWN0aXZlTWV0YWRhdGEsIFNlbGVjdG9yTWF0Y2hlciwgU3RhdGVtZW50LCBUbXBsQXN0Tm9kZSwgV3JhcHBlZE5vZGVFeHByfSBmcm9tICdAYW5ndWxhci9jb21waWxlcic7XG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcblxuaW1wb3J0IHtDeWNsZSwgQ3ljbGVBbmFseXplciwgQ3ljbGVIYW5kbGluZ1N0cmF0ZWd5fSBmcm9tICcuLi8uLi9jeWNsZXMnO1xuaW1wb3J0IHtFcnJvckNvZGUsIEZhdGFsRGlhZ25vc3RpY0Vycm9yLCBtYWtlUmVsYXRlZEluZm9ybWF0aW9ufSBmcm9tICcuLi8uLi9kaWFnbm9zdGljcyc7XG5pbXBvcnQge2Fic29sdXRlRnJvbSwgcmVsYXRpdmV9IGZyb20gJy4uLy4uL2ZpbGVfc3lzdGVtJztcbmltcG9ydCB7SW1wb3J0ZWRGaWxlLCBNb2R1bGVSZXNvbHZlciwgUmVmZXJlbmNlLCBSZWZlcmVuY2VFbWl0dGVyfSBmcm9tICcuLi8uLi9pbXBvcnRzJztcbmltcG9ydCB7RGVwZW5kZW5jeVRyYWNrZXJ9IGZyb20gJy4uLy4uL2luY3JlbWVudGFsL2FwaSc7XG5pbXBvcnQge2V4dHJhY3RTZW1hbnRpY1R5cGVQYXJhbWV0ZXJzLCBpc0FycmF5RXF1YWwsIGlzUmVmZXJlbmNlRXF1YWwsIFNlbWFudGljRGVwR3JhcGhVcGRhdGVyLCBTZW1hbnRpY1JlZmVyZW5jZSwgU2VtYW50aWNTeW1ib2x9IGZyb20gJy4uLy4uL2luY3JlbWVudGFsL3NlbWFudGljX2dyYXBoJztcbmltcG9ydCB7SW5kZXhpbmdDb250ZXh0fSBmcm9tICcuLi8uLi9pbmRleGVyJztcbmltcG9ydCB7Q2xhc3NQcm9wZXJ0eU1hcHBpbmcsIENvbXBvbmVudFJlc291cmNlcywgRGlyZWN0aXZlTWV0YSwgRGlyZWN0aXZlVHlwZUNoZWNrTWV0YSwgZXh0cmFjdERpcmVjdGl2ZVR5cGVDaGVja01ldGEsIEluamVjdGFibGVDbGFzc1JlZ2lzdHJ5LCBNZXRhZGF0YVJlYWRlciwgTWV0YWRhdGFSZWdpc3RyeSwgUmVzb3VyY2UsIFJlc291cmNlUmVnaXN0cnl9IGZyb20gJy4uLy4uL21ldGFkYXRhJztcbmltcG9ydCB7RW51bVZhbHVlLCBQYXJ0aWFsRXZhbHVhdG9yLCBSZXNvbHZlZFZhbHVlfSBmcm9tICcuLi8uLi9wYXJ0aWFsX2V2YWx1YXRvcic7XG5pbXBvcnQge1BlcmZFdmVudCwgUGVyZlJlY29yZGVyfSBmcm9tICcuLi8uLi9wZXJmJztcbmltcG9ydCB7Q2xhc3NEZWNsYXJhdGlvbiwgRGVjbGFyYXRpb25Ob2RlLCBEZWNvcmF0b3IsIFJlZmxlY3Rpb25Ib3N0LCByZWZsZWN0T2JqZWN0TGl0ZXJhbH0gZnJvbSAnLi4vLi4vcmVmbGVjdGlvbic7XG5pbXBvcnQge0NvbXBvbmVudFNjb3BlUmVhZGVyLCBMb2NhbE1vZHVsZVNjb3BlUmVnaXN0cnksIFR5cGVDaGVja1Njb3BlUmVnaXN0cnl9IGZyb20gJy4uLy4uL3Njb3BlJztcbmltcG9ydCB7QW5hbHlzaXNPdXRwdXQsIENvbXBpbGVSZXN1bHQsIERlY29yYXRvckhhbmRsZXIsIERldGVjdFJlc3VsdCwgSGFuZGxlckZsYWdzLCBIYW5kbGVyUHJlY2VkZW5jZSwgUmVzb2x2ZVJlc3VsdH0gZnJvbSAnLi4vLi4vdHJhbnNmb3JtJztcbmltcG9ydCB7VGVtcGxhdGVTb3VyY2VNYXBwaW5nLCBUeXBlQ2hlY2tDb250ZXh0fSBmcm9tICcuLi8uLi90eXBlY2hlY2svYXBpJztcbmltcG9ydCB7U3Vic2V0T2ZLZXlzfSBmcm9tICcuLi8uLi91dGlsL3NyYy90eXBlc2NyaXB0JztcblxuaW1wb3J0IHtSZXNvdXJjZUxvYWRlcn0gZnJvbSAnLi9hcGknO1xuaW1wb3J0IHtjcmVhdGVWYWx1ZUhhc1dyb25nVHlwZUVycm9yLCBnZXREaXJlY3RpdmVEaWFnbm9zdGljcywgZ2V0UHJvdmlkZXJEaWFnbm9zdGljc30gZnJvbSAnLi9kaWFnbm9zdGljcyc7XG5pbXBvcnQge0RpcmVjdGl2ZVN5bWJvbCwgZXh0cmFjdERpcmVjdGl2ZU1ldGFkYXRhLCBwYXJzZUZpZWxkQXJyYXlWYWx1ZX0gZnJvbSAnLi9kaXJlY3RpdmUnO1xuaW1wb3J0IHtjb21waWxlRGVjbGFyZUZhY3RvcnksIGNvbXBpbGVOZ0ZhY3RvcnlEZWZGaWVsZH0gZnJvbSAnLi9mYWN0b3J5JztcbmltcG9ydCB7ZXh0cmFjdENsYXNzTWV0YWRhdGF9IGZyb20gJy4vbWV0YWRhdGEnO1xuaW1wb3J0IHtOZ01vZHVsZVN5bWJvbH0gZnJvbSAnLi9uZ19tb2R1bGUnO1xuaW1wb3J0IHtjb21waWxlUmVzdWx0cywgZmluZEFuZ3VsYXJEZWNvcmF0b3IsIGlzQW5ndWxhckNvcmVSZWZlcmVuY2UsIGlzRXhwcmVzc2lvbkZvcndhcmRSZWZlcmVuY2UsIHJlYWRCYXNlQ2xhc3MsIHJlc29sdmVQcm92aWRlcnNSZXF1aXJpbmdGYWN0b3J5LCB0b0ZhY3RvcnlNZXRhZGF0YSwgdW53cmFwRXhwcmVzc2lvbiwgd3JhcEZ1bmN0aW9uRXhwcmVzc2lvbnNJblBhcmVuc30gZnJvbSAnLi91dGlsJztcblxuY29uc3QgRU1QVFlfTUFQID0gbmV3IE1hcDxzdHJpbmcsIEV4cHJlc3Npb24+KCk7XG5jb25zdCBFTVBUWV9BUlJBWTogYW55W10gPSBbXTtcblxuLyoqXG4gKiBUaGVzZSBmaWVsZHMgb2YgYFIzQ29tcG9uZW50TWV0YWRhdGFgIGFyZSB1cGRhdGVkIGluIHRoZSBgcmVzb2x2ZWAgcGhhc2UuXG4gKlxuICogVGhlIGBrZXlvZiBSM0NvbXBvbmVudE1ldGFkYXRhICZgIGNvbmRpdGlvbiBlbnN1cmVzIHRoYXQgb25seSBmaWVsZHMgb2YgYFIzQ29tcG9uZW50TWV0YWRhdGFgIGNhblxuICogYmUgaW5jbHVkZWQgaGVyZS5cbiAqL1xuZXhwb3J0IHR5cGUgQ29tcG9uZW50TWV0YWRhdGFSZXNvbHZlZEZpZWxkcyA9XG4gICAgU3Vic2V0T2ZLZXlzPFIzQ29tcG9uZW50TWV0YWRhdGEsICdkaXJlY3RpdmVzJ3wncGlwZXMnfCdkZWNsYXJhdGlvbkxpc3RFbWl0TW9kZSc+O1xuXG5leHBvcnQgaW50ZXJmYWNlIENvbXBvbmVudEFuYWx5c2lzRGF0YSB7XG4gIC8qKlxuICAgKiBgbWV0YWAgaW5jbHVkZXMgdGhvc2UgZmllbGRzIG9mIGBSM0NvbXBvbmVudE1ldGFkYXRhYCB3aGljaCBhcmUgY2FsY3VsYXRlZCBhdCBgYW5hbHl6ZWAgdGltZVxuICAgKiAobm90IGR1cmluZyByZXNvbHZlKS5cbiAgICovXG4gIG1ldGE6IE9taXQ8UjNDb21wb25lbnRNZXRhZGF0YSwgQ29tcG9uZW50TWV0YWRhdGFSZXNvbHZlZEZpZWxkcz47XG4gIGJhc2VDbGFzczogUmVmZXJlbmNlPENsYXNzRGVjbGFyYXRpb24+fCdkeW5hbWljJ3xudWxsO1xuICB0eXBlQ2hlY2tNZXRhOiBEaXJlY3RpdmVUeXBlQ2hlY2tNZXRhO1xuICB0ZW1wbGF0ZTogUGFyc2VkVGVtcGxhdGVXaXRoU291cmNlO1xuICBjbGFzc01ldGFkYXRhOiBSM0NsYXNzTWV0YWRhdGF8bnVsbDtcblxuICBpbnB1dHM6IENsYXNzUHJvcGVydHlNYXBwaW5nO1xuICBvdXRwdXRzOiBDbGFzc1Byb3BlcnR5TWFwcGluZztcblxuICAvKipcbiAgICogUHJvdmlkZXJzIGV4dHJhY3RlZCBmcm9tIHRoZSBgcHJvdmlkZXJzYCBmaWVsZCBvZiB0aGUgY29tcG9uZW50IGFubm90YXRpb24gd2hpY2ggd2lsbCByZXF1aXJlXG4gICAqIGFuIEFuZ3VsYXIgZmFjdG9yeSBkZWZpbml0aW9uIGF0IHJ1bnRpbWUuXG4gICAqL1xuICBwcm92aWRlcnNSZXF1aXJpbmdGYWN0b3J5OiBTZXQ8UmVmZXJlbmNlPENsYXNzRGVjbGFyYXRpb24+PnxudWxsO1xuXG4gIC8qKlxuICAgKiBQcm92aWRlcnMgZXh0cmFjdGVkIGZyb20gdGhlIGB2aWV3UHJvdmlkZXJzYCBmaWVsZCBvZiB0aGUgY29tcG9uZW50IGFubm90YXRpb24gd2hpY2ggd2lsbFxuICAgKiByZXF1aXJlIGFuIEFuZ3VsYXIgZmFjdG9yeSBkZWZpbml0aW9uIGF0IHJ1bnRpbWUuXG4gICAqL1xuICB2aWV3UHJvdmlkZXJzUmVxdWlyaW5nRmFjdG9yeTogU2V0PFJlZmVyZW5jZTxDbGFzc0RlY2xhcmF0aW9uPj58bnVsbDtcblxuICByZXNvdXJjZXM6IENvbXBvbmVudFJlc291cmNlcztcblxuICAvKipcbiAgICogYHN0eWxlVXJsc2AgZXh0cmFjdGVkIGZyb20gdGhlIGRlY29yYXRvciwgaWYgcHJlc2VudC5cbiAgICovXG4gIHN0eWxlVXJsczogU3R5bGVVcmxNZXRhW118bnVsbDtcblxuICAvKipcbiAgICogSW5saW5lIHN0eWxlc2hlZXRzIGV4dHJhY3RlZCBmcm9tIHRoZSBkZWNvcmF0b3IsIGlmIHByZXNlbnQuXG4gICAqL1xuICBpbmxpbmVTdHlsZXM6IHN0cmluZ1tdfG51bGw7XG5cbiAgaXNQb2lzb25lZDogYm9vbGVhbjtcbn1cblxuZXhwb3J0IHR5cGUgQ29tcG9uZW50UmVzb2x1dGlvbkRhdGEgPSBQaWNrPFIzQ29tcG9uZW50TWV0YWRhdGEsIENvbXBvbmVudE1ldGFkYXRhUmVzb2x2ZWRGaWVsZHM+O1xuXG4vKipcbiAqIFRoZSBsaXRlcmFsIHN0eWxlIHVybCBleHRyYWN0ZWQgZnJvbSB0aGUgZGVjb3JhdG9yLCBhbG9uZyB3aXRoIG1ldGFkYXRhIGZvciBkaWFnbm9zdGljcy5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBTdHlsZVVybE1ldGEge1xuICB1cmw6IHN0cmluZztcbiAgbm9kZUZvckVycm9yOiB0cy5Ob2RlO1xuICBzb3VyY2U6IFJlc291cmNlVHlwZUZvckRpYWdub3N0aWNzLlN0eWxlc2hlZXRGcm9tVGVtcGxhdGV8XG4gICAgICBSZXNvdXJjZVR5cGVGb3JEaWFnbm9zdGljcy5TdHlsZXNoZWV0RnJvbURlY29yYXRvcjtcbn1cblxuLyoqXG4gKiBJbmZvcm1hdGlvbiBhYm91dCB0aGUgb3JpZ2luIG9mIGEgcmVzb3VyY2UgaW4gdGhlIGFwcGxpY2F0aW9uIGNvZGUuIFRoaXMgaXMgdXNlZCBmb3IgY3JlYXRpbmdcbiAqIGRpYWdub3N0aWNzLCBzbyB3ZSBjYW4gcG9pbnQgdG8gdGhlIHJvb3QgY2F1c2Ugb2YgYW4gZXJyb3IgaW4gdGhlIGFwcGxpY2F0aW9uIGNvZGUuXG4gKlxuICogQSB0ZW1wbGF0ZSByZXNvdXJjZSBjb21lcyBmcm9tIHRoZSBgdGVtcGxhdGVVcmxgIHByb3BlcnR5IG9uIHRoZSBjb21wb25lbnQgZGVjb3JhdG9yLlxuICpcbiAqIFN0eWxlc2hlZXRzIHJlc291cmNlcyBjYW4gY29tZSBmcm9tIGVpdGhlciB0aGUgYHN0eWxlVXJsc2AgcHJvcGVydHkgb24gdGhlIGNvbXBvbmVudCBkZWNvcmF0b3IsXG4gKiBvciBmcm9tIGlubGluZSBgc3R5bGVgIHRhZ3MgYW5kIHN0eWxlIGxpbmtzIG9uIHRoZSBleHRlcm5hbCB0ZW1wbGF0ZS5cbiAqL1xuZXhwb3J0IGNvbnN0IGVudW0gUmVzb3VyY2VUeXBlRm9yRGlhZ25vc3RpY3Mge1xuICBUZW1wbGF0ZSxcbiAgU3R5bGVzaGVldEZyb21UZW1wbGF0ZSxcbiAgU3R5bGVzaGVldEZyb21EZWNvcmF0b3IsXG59XG5cbi8qKlxuICogUmVwcmVzZW50cyBhbiBBbmd1bGFyIGNvbXBvbmVudC5cbiAqL1xuZXhwb3J0IGNsYXNzIENvbXBvbmVudFN5bWJvbCBleHRlbmRzIERpcmVjdGl2ZVN5bWJvbCB7XG4gIHVzZWREaXJlY3RpdmVzOiBTZW1hbnRpY1JlZmVyZW5jZVtdID0gW107XG4gIHVzZWRQaXBlczogU2VtYW50aWNSZWZlcmVuY2VbXSA9IFtdO1xuICBpc1JlbW90ZWx5U2NvcGVkID0gZmFsc2U7XG5cbiAgaXNFbWl0QWZmZWN0ZWQocHJldmlvdXNTeW1ib2w6IFNlbWFudGljU3ltYm9sLCBwdWJsaWNBcGlBZmZlY3RlZDogU2V0PFNlbWFudGljU3ltYm9sPik6IGJvb2xlYW4ge1xuICAgIGlmICghKHByZXZpb3VzU3ltYm9sIGluc3RhbmNlb2YgQ29tcG9uZW50U3ltYm9sKSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLy8gQ3JlYXRlIGFuIGVxdWFsaXR5IGZ1bmN0aW9uIHRoYXQgY29uc2lkZXJzIHN5bWJvbHMgZXF1YWwgaWYgdGhleSByZXByZXNlbnQgdGhlIHNhbWVcbiAgICAvLyBkZWNsYXJhdGlvbiwgYnV0IG9ubHkgaWYgdGhlIHN5bWJvbCBpbiB0aGUgY3VycmVudCBjb21waWxhdGlvbiBkb2VzIG5vdCBoYXZlIGl0cyBwdWJsaWMgQVBJXG4gICAgLy8gYWZmZWN0ZWQuXG4gICAgY29uc3QgaXNTeW1ib2xVbmFmZmVjdGVkID0gKGN1cnJlbnQ6IFNlbWFudGljUmVmZXJlbmNlLCBwcmV2aW91czogU2VtYW50aWNSZWZlcmVuY2UpID0+XG4gICAgICAgIGlzUmVmZXJlbmNlRXF1YWwoY3VycmVudCwgcHJldmlvdXMpICYmICFwdWJsaWNBcGlBZmZlY3RlZC5oYXMoY3VycmVudC5zeW1ib2wpO1xuXG4gICAgLy8gVGhlIGVtaXQgb2YgYSBjb21wb25lbnQgaXMgYWZmZWN0ZWQgaWYgZWl0aGVyIG9mIHRoZSBmb2xsb3dpbmcgaXMgdHJ1ZTpcbiAgICAvLyAgMS4gVGhlIGNvbXBvbmVudCB1c2VkIHRvIGJlIHJlbW90ZWx5IHNjb3BlZCBidXQgbm8gbG9uZ2VyIGlzLCBvciB2aWNlIHZlcnNhLlxuICAgIC8vICAyLiBUaGUgbGlzdCBvZiB1c2VkIGRpcmVjdGl2ZXMgaGFzIGNoYW5nZWQgb3IgYW55IG9mIHRob3NlIGRpcmVjdGl2ZXMgaGF2ZSBoYWQgdGhlaXIgcHVibGljXG4gICAgLy8gICAgIEFQSSBjaGFuZ2VkLiBJZiB0aGUgdXNlZCBkaXJlY3RpdmVzIGhhdmUgYmVlbiByZW9yZGVyZWQgYnV0IG5vdCBvdGhlcndpc2UgYWZmZWN0ZWQgdGhlblxuICAgIC8vICAgICB0aGUgY29tcG9uZW50IG11c3Qgc3RpbGwgYmUgcmUtZW1pdHRlZCwgYXMgdGhpcyBtYXkgYWZmZWN0IGRpcmVjdGl2ZSBpbnN0YW50aWF0aW9uIG9yZGVyLlxuICAgIC8vICAzLiBUaGUgbGlzdCBvZiB1c2VkIHBpcGVzIGhhcyBjaGFuZ2VkLCBvciBhbnkgb2YgdGhvc2UgcGlwZXMgaGF2ZSBoYWQgdGhlaXIgcHVibGljIEFQSVxuICAgIC8vICAgICBjaGFuZ2VkLlxuICAgIHJldHVybiB0aGlzLmlzUmVtb3RlbHlTY29wZWQgIT09IHByZXZpb3VzU3ltYm9sLmlzUmVtb3RlbHlTY29wZWQgfHxcbiAgICAgICAgIWlzQXJyYXlFcXVhbCh0aGlzLnVzZWREaXJlY3RpdmVzLCBwcmV2aW91c1N5bWJvbC51c2VkRGlyZWN0aXZlcywgaXNTeW1ib2xVbmFmZmVjdGVkKSB8fFxuICAgICAgICAhaXNBcnJheUVxdWFsKHRoaXMudXNlZFBpcGVzLCBwcmV2aW91c1N5bWJvbC51c2VkUGlwZXMsIGlzU3ltYm9sVW5hZmZlY3RlZCk7XG4gIH1cblxuICBpc1R5cGVDaGVja0Jsb2NrQWZmZWN0ZWQoXG4gICAgICBwcmV2aW91c1N5bWJvbDogU2VtYW50aWNTeW1ib2wsIHR5cGVDaGVja0FwaUFmZmVjdGVkOiBTZXQ8U2VtYW50aWNTeW1ib2w+KTogYm9vbGVhbiB7XG4gICAgaWYgKCEocHJldmlvdXNTeW1ib2wgaW5zdGFuY2VvZiBDb21wb25lbnRTeW1ib2wpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBUbyB2ZXJpZnkgdGhhdCBhIHVzZWQgZGlyZWN0aXZlIGlzIG5vdCBhZmZlY3RlZCB3ZSBuZWVkIHRvIHZlcmlmeSB0aGF0IGl0cyBmdWxsIGluaGVyaXRhbmNlXG4gICAgLy8gY2hhaW4gaXMgbm90IHByZXNlbnQgaW4gYHR5cGVDaGVja0FwaUFmZmVjdGVkYC5cbiAgICBjb25zdCBpc0luaGVyaXRhbmNlQ2hhaW5BZmZlY3RlZCA9IChzeW1ib2w6IFNlbWFudGljU3ltYm9sKTogYm9vbGVhbiA9PiB7XG4gICAgICBsZXQgY3VycmVudFN5bWJvbDogU2VtYW50aWNTeW1ib2x8bnVsbCA9IHN5bWJvbDtcbiAgICAgIHdoaWxlIChjdXJyZW50U3ltYm9sIGluc3RhbmNlb2YgRGlyZWN0aXZlU3ltYm9sKSB7XG4gICAgICAgIGlmICh0eXBlQ2hlY2tBcGlBZmZlY3RlZC5oYXMoY3VycmVudFN5bWJvbCkpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBjdXJyZW50U3ltYm9sID0gY3VycmVudFN5bWJvbC5iYXNlQ2xhc3M7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9O1xuXG4gICAgLy8gQ3JlYXRlIGFuIGVxdWFsaXR5IGZ1bmN0aW9uIHRoYXQgY29uc2lkZXJzIGRpcmVjdGl2ZXMgZXF1YWwgaWYgdGhleSByZXByZXNlbnQgdGhlIHNhbWVcbiAgICAvLyBkZWNsYXJhdGlvbiBhbmQgaWYgdGhlIHN5bWJvbCBhbmQgYWxsIHN5bWJvbHMgaXQgaW5oZXJpdHMgZnJvbSBpbiB0aGUgY3VycmVudCBjb21waWxhdGlvblxuICAgIC8vIGRvIG5vdCBoYXZlIHRoZWlyIHR5cGUtY2hlY2sgQVBJIGFmZmVjdGVkLlxuICAgIGNvbnN0IGlzRGlyZWN0aXZlVW5hZmZlY3RlZCA9IChjdXJyZW50OiBTZW1hbnRpY1JlZmVyZW5jZSwgcHJldmlvdXM6IFNlbWFudGljUmVmZXJlbmNlKSA9PlxuICAgICAgICBpc1JlZmVyZW5jZUVxdWFsKGN1cnJlbnQsIHByZXZpb3VzKSAmJiAhaXNJbmhlcml0YW5jZUNoYWluQWZmZWN0ZWQoY3VycmVudC5zeW1ib2wpO1xuXG4gICAgLy8gQ3JlYXRlIGFuIGVxdWFsaXR5IGZ1bmN0aW9uIHRoYXQgY29uc2lkZXJzIHBpcGVzIGVxdWFsIGlmIHRoZXkgcmVwcmVzZW50IHRoZSBzYW1lXG4gICAgLy8gZGVjbGFyYXRpb24gYW5kIGlmIHRoZSBzeW1ib2wgaW4gdGhlIGN1cnJlbnQgY29tcGlsYXRpb24gZG9lcyBub3QgaGF2ZSBpdHMgdHlwZS1jaGVja1xuICAgIC8vIEFQSSBhZmZlY3RlZC5cbiAgICBjb25zdCBpc1BpcGVVbmFmZmVjdGVkID0gKGN1cnJlbnQ6IFNlbWFudGljUmVmZXJlbmNlLCBwcmV2aW91czogU2VtYW50aWNSZWZlcmVuY2UpID0+XG4gICAgICAgIGlzUmVmZXJlbmNlRXF1YWwoY3VycmVudCwgcHJldmlvdXMpICYmICF0eXBlQ2hlY2tBcGlBZmZlY3RlZC5oYXMoY3VycmVudC5zeW1ib2wpO1xuXG4gICAgLy8gVGhlIGVtaXQgb2YgYSB0eXBlLWNoZWNrIGJsb2NrIG9mIGEgY29tcG9uZW50IGlzIGFmZmVjdGVkIGlmIGVpdGhlciBvZiB0aGUgZm9sbG93aW5nIGlzIHRydWU6XG4gICAgLy8gIDEuIFRoZSBsaXN0IG9mIHVzZWQgZGlyZWN0aXZlcyBoYXMgY2hhbmdlZCBvciBhbnkgb2YgdGhvc2UgZGlyZWN0aXZlcyBoYXZlIGhhZCB0aGVpclxuICAgIC8vICAgICB0eXBlLWNoZWNrIEFQSSBjaGFuZ2VkLlxuICAgIC8vICAyLiBUaGUgbGlzdCBvZiB1c2VkIHBpcGVzIGhhcyBjaGFuZ2VkLCBvciBhbnkgb2YgdGhvc2UgcGlwZXMgaGF2ZSBoYWQgdGhlaXIgdHlwZS1jaGVjayBBUElcbiAgICAvLyAgICAgY2hhbmdlZC5cbiAgICByZXR1cm4gIWlzQXJyYXlFcXVhbChcbiAgICAgICAgICAgICAgIHRoaXMudXNlZERpcmVjdGl2ZXMsIHByZXZpb3VzU3ltYm9sLnVzZWREaXJlY3RpdmVzLCBpc0RpcmVjdGl2ZVVuYWZmZWN0ZWQpIHx8XG4gICAgICAgICFpc0FycmF5RXF1YWwodGhpcy51c2VkUGlwZXMsIHByZXZpb3VzU3ltYm9sLnVzZWRQaXBlcywgaXNQaXBlVW5hZmZlY3RlZCk7XG4gIH1cbn1cblxuLyoqXG4gKiBgRGVjb3JhdG9ySGFuZGxlcmAgd2hpY2ggaGFuZGxlcyB0aGUgYEBDb21wb25lbnRgIGFubm90YXRpb24uXG4gKi9cbmV4cG9ydCBjbGFzcyBDb21wb25lbnREZWNvcmF0b3JIYW5kbGVyIGltcGxlbWVudHNcbiAgICBEZWNvcmF0b3JIYW5kbGVyPERlY29yYXRvciwgQ29tcG9uZW50QW5hbHlzaXNEYXRhLCBDb21wb25lbnRTeW1ib2wsIENvbXBvbmVudFJlc29sdXRpb25EYXRhPiB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSByZWZsZWN0b3I6IFJlZmxlY3Rpb25Ib3N0LCBwcml2YXRlIGV2YWx1YXRvcjogUGFydGlhbEV2YWx1YXRvcixcbiAgICAgIHByaXZhdGUgbWV0YVJlZ2lzdHJ5OiBNZXRhZGF0YVJlZ2lzdHJ5LCBwcml2YXRlIG1ldGFSZWFkZXI6IE1ldGFkYXRhUmVhZGVyLFxuICAgICAgcHJpdmF0ZSBzY29wZVJlYWRlcjogQ29tcG9uZW50U2NvcGVSZWFkZXIsIHByaXZhdGUgc2NvcGVSZWdpc3RyeTogTG9jYWxNb2R1bGVTY29wZVJlZ2lzdHJ5LFxuICAgICAgcHJpdmF0ZSB0eXBlQ2hlY2tTY29wZVJlZ2lzdHJ5OiBUeXBlQ2hlY2tTY29wZVJlZ2lzdHJ5LFxuICAgICAgcHJpdmF0ZSByZXNvdXJjZVJlZ2lzdHJ5OiBSZXNvdXJjZVJlZ2lzdHJ5LCBwcml2YXRlIGlzQ29yZTogYm9vbGVhbixcbiAgICAgIHByaXZhdGUgcmVzb3VyY2VMb2FkZXI6IFJlc291cmNlTG9hZGVyLCBwcml2YXRlIHJvb3REaXJzOiBSZWFkb25seUFycmF5PHN0cmluZz4sXG4gICAgICBwcml2YXRlIGRlZmF1bHRQcmVzZXJ2ZVdoaXRlc3BhY2VzOiBib29sZWFuLCBwcml2YXRlIGkxOG5Vc2VFeHRlcm5hbElkczogYm9vbGVhbixcbiAgICAgIHByaXZhdGUgZW5hYmxlSTE4bkxlZ2FjeU1lc3NhZ2VJZEZvcm1hdDogYm9vbGVhbiwgcHJpdmF0ZSB1c2VQb2lzb25lZERhdGE6IGJvb2xlYW4sXG4gICAgICBwcml2YXRlIGkxOG5Ob3JtYWxpemVMaW5lRW5kaW5nc0luSUNVczogYm9vbGVhbnx1bmRlZmluZWQsXG4gICAgICBwcml2YXRlIG1vZHVsZVJlc29sdmVyOiBNb2R1bGVSZXNvbHZlciwgcHJpdmF0ZSBjeWNsZUFuYWx5emVyOiBDeWNsZUFuYWx5emVyLFxuICAgICAgcHJpdmF0ZSBjeWNsZUhhbmRsaW5nU3RyYXRlZ3k6IEN5Y2xlSGFuZGxpbmdTdHJhdGVneSwgcHJpdmF0ZSByZWZFbWl0dGVyOiBSZWZlcmVuY2VFbWl0dGVyLFxuICAgICAgcHJpdmF0ZSBkZXBUcmFja2VyOiBEZXBlbmRlbmN5VHJhY2tlcnxudWxsLFxuICAgICAgcHJpdmF0ZSBpbmplY3RhYmxlUmVnaXN0cnk6IEluamVjdGFibGVDbGFzc1JlZ2lzdHJ5LFxuICAgICAgcHJpdmF0ZSBzZW1hbnRpY0RlcEdyYXBoVXBkYXRlcjogU2VtYW50aWNEZXBHcmFwaFVwZGF0ZXJ8bnVsbCxcbiAgICAgIHByaXZhdGUgYW5ub3RhdGVGb3JDbG9zdXJlQ29tcGlsZXI6IGJvb2xlYW4sIHByaXZhdGUgcGVyZjogUGVyZlJlY29yZGVyKSB7fVxuXG4gIHByaXZhdGUgbGl0ZXJhbENhY2hlID0gbmV3IE1hcDxEZWNvcmF0b3IsIHRzLk9iamVjdExpdGVyYWxFeHByZXNzaW9uPigpO1xuICBwcml2YXRlIGVsZW1lbnRTY2hlbWFSZWdpc3RyeSA9IG5ldyBEb21FbGVtZW50U2NoZW1hUmVnaXN0cnkoKTtcblxuICAvKipcbiAgICogRHVyaW5nIHRoZSBhc3luY2hyb25vdXMgcHJlYW5hbHl6ZSBwaGFzZSwgaXQncyBuZWNlc3NhcnkgdG8gcGFyc2UgdGhlIHRlbXBsYXRlIHRvIGV4dHJhY3RcbiAgICogYW55IHBvdGVudGlhbCA8bGluaz4gdGFncyB3aGljaCBtaWdodCBuZWVkIHRvIGJlIGxvYWRlZC4gVGhpcyBjYWNoZSBlbnN1cmVzIHRoYXQgd29yayBpcyBub3RcbiAgICogdGhyb3duIGF3YXksIGFuZCB0aGUgcGFyc2VkIHRlbXBsYXRlIGlzIHJldXNlZCBkdXJpbmcgdGhlIGFuYWx5emUgcGhhc2UuXG4gICAqL1xuICBwcml2YXRlIHByZWFuYWx5emVUZW1wbGF0ZUNhY2hlID0gbmV3IE1hcDxEZWNsYXJhdGlvbk5vZGUsIFBhcnNlZFRlbXBsYXRlV2l0aFNvdXJjZT4oKTtcbiAgcHJpdmF0ZSBwcmVhbmFseXplU3R5bGVzQ2FjaGUgPSBuZXcgTWFwPERlY2xhcmF0aW9uTm9kZSwgc3RyaW5nW118bnVsbD4oKTtcblxuICByZWFkb25seSBwcmVjZWRlbmNlID0gSGFuZGxlclByZWNlZGVuY2UuUFJJTUFSWTtcbiAgcmVhZG9ubHkgbmFtZSA9IENvbXBvbmVudERlY29yYXRvckhhbmRsZXIubmFtZTtcblxuICBkZXRlY3Qobm9kZTogQ2xhc3NEZWNsYXJhdGlvbiwgZGVjb3JhdG9yczogRGVjb3JhdG9yW118bnVsbCk6IERldGVjdFJlc3VsdDxEZWNvcmF0b3I+fHVuZGVmaW5lZCB7XG4gICAgaWYgKCFkZWNvcmF0b3JzKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBjb25zdCBkZWNvcmF0b3IgPSBmaW5kQW5ndWxhckRlY29yYXRvcihkZWNvcmF0b3JzLCAnQ29tcG9uZW50JywgdGhpcy5pc0NvcmUpO1xuICAgIGlmIChkZWNvcmF0b3IgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdHJpZ2dlcjogZGVjb3JhdG9yLm5vZGUsXG4gICAgICAgIGRlY29yYXRvcixcbiAgICAgICAgbWV0YWRhdGE6IGRlY29yYXRvcixcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICB9XG5cbiAgcHJlYW5hbHl6ZShub2RlOiBDbGFzc0RlY2xhcmF0aW9uLCBkZWNvcmF0b3I6IFJlYWRvbmx5PERlY29yYXRvcj4pOiBQcm9taXNlPHZvaWQ+fHVuZGVmaW5lZCB7XG4gICAgLy8gSW4gcHJlYW5hbHl6ZSwgcmVzb3VyY2UgVVJMcyBhc3NvY2lhdGVkIHdpdGggdGhlIGNvbXBvbmVudCBhcmUgYXN5bmNocm9ub3VzbHkgcHJlbG9hZGVkIHZpYVxuICAgIC8vIHRoZSByZXNvdXJjZUxvYWRlci4gVGhpcyBpcyB0aGUgb25seSB0aW1lIGFzeW5jIG9wZXJhdGlvbnMgYXJlIGFsbG93ZWQgZm9yIGEgY29tcG9uZW50LlxuICAgIC8vIFRoZXNlIHJlc291cmNlcyBhcmU6XG4gICAgLy9cbiAgICAvLyAtIHRoZSB0ZW1wbGF0ZVVybCwgaWYgdGhlcmUgaXMgb25lXG4gICAgLy8gLSBhbnkgc3R5bGVVcmxzIGlmIHByZXNlbnRcbiAgICAvLyAtIGFueSBzdHlsZXNoZWV0cyByZWZlcmVuY2VkIGZyb20gPGxpbms+IHRhZ3MgaW4gdGhlIHRlbXBsYXRlIGl0c2VsZlxuICAgIC8vXG4gICAgLy8gQXMgYSByZXN1bHQgb2YgdGhlIGxhc3Qgb25lLCB0aGUgdGVtcGxhdGUgbXVzdCBiZSBwYXJzZWQgYXMgcGFydCBvZiBwcmVhbmFseXNpcyB0byBleHRyYWN0XG4gICAgLy8gPGxpbms+IHRhZ3MsIHdoaWNoIG1heSBpbnZvbHZlIHdhaXRpbmcgZm9yIHRoZSB0ZW1wbGF0ZVVybCB0byBiZSByZXNvbHZlZCBmaXJzdC5cblxuICAgIC8vIElmIHByZWxvYWRpbmcgaXNuJ3QgcG9zc2libGUsIHRoZW4gc2tpcCB0aGlzIHN0ZXAuXG4gICAgaWYgKCF0aGlzLnJlc291cmNlTG9hZGVyLmNhblByZWxvYWQpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgY29uc3QgbWV0YSA9IHRoaXMuX3Jlc29sdmVMaXRlcmFsKGRlY29yYXRvcik7XG4gICAgY29uc3QgY29tcG9uZW50ID0gcmVmbGVjdE9iamVjdExpdGVyYWwobWV0YSk7XG4gICAgY29uc3QgY29udGFpbmluZ0ZpbGUgPSBub2RlLmdldFNvdXJjZUZpbGUoKS5maWxlTmFtZTtcblxuICAgIGNvbnN0IHJlc29sdmVTdHlsZVVybCA9IChzdHlsZVVybDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPnx1bmRlZmluZWQgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzb3VyY2VVcmwgPSB0aGlzLnJlc291cmNlTG9hZGVyLnJlc29sdmUoc3R5bGVVcmwsIGNvbnRhaW5pbmdGaWxlKTtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVzb3VyY2VMb2FkZXIucHJlbG9hZChyZXNvdXJjZVVybCwge3R5cGU6ICdzdHlsZScsIGNvbnRhaW5pbmdGaWxlfSk7XG4gICAgICB9IGNhdGNoIHtcbiAgICAgICAgLy8gRG9uJ3Qgd29ycnkgYWJvdXQgZmFpbHVyZXMgdG8gcHJlbG9hZC4gV2UgY2FuIGhhbmRsZSB0aGlzIHByb2JsZW0gZHVyaW5nIGFuYWx5c2lzIGJ5XG4gICAgICAgIC8vIHByb2R1Y2luZyBhIGRpYWdub3N0aWMuXG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgfTtcblxuICAgIC8vIEEgUHJvbWlzZSB0aGF0IHdhaXRzIGZvciB0aGUgdGVtcGxhdGUgYW5kIGFsbCA8bGluaz5lZCBzdHlsZXMgd2l0aGluIGl0IHRvIGJlIHByZWxvYWRlZC5cbiAgICBjb25zdCB0ZW1wbGF0ZUFuZFRlbXBsYXRlU3R5bGVSZXNvdXJjZXMgPVxuICAgICAgICB0aGlzLl9wcmVsb2FkQW5kUGFyc2VUZW1wbGF0ZShub2RlLCBkZWNvcmF0b3IsIGNvbXBvbmVudCwgY29udGFpbmluZ0ZpbGUpXG4gICAgICAgICAgICAudGhlbigodGVtcGxhdGU6IFBhcnNlZFRlbXBsYXRlV2l0aFNvdXJjZXxudWxsKTogUHJvbWlzZTx2b2lkPnx1bmRlZmluZWQgPT4ge1xuICAgICAgICAgICAgICBpZiAodGVtcGxhdGUgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKHRlbXBsYXRlLnN0eWxlVXJscy5tYXAoc3R5bGVVcmwgPT4gcmVzb2x2ZVN0eWxlVXJsKHN0eWxlVXJsKSkpXG4gICAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB1bmRlZmluZWQpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAvLyBFeHRyYWN0IGFsbCB0aGUgc3R5bGVVcmxzIGluIHRoZSBkZWNvcmF0b3IuXG4gICAgY29uc3QgY29tcG9uZW50U3R5bGVVcmxzID0gdGhpcy5fZXh0cmFjdENvbXBvbmVudFN0eWxlVXJscyhjb21wb25lbnQpO1xuXG4gICAgLy8gRXh0cmFjdCBpbmxpbmUgc3R5bGVzLCBwcm9jZXNzLCBhbmQgY2FjaGUgZm9yIHVzZSBpbiBzeW5jaHJvbm91cyBhbmFseXplIHBoYXNlXG4gICAgbGV0IGlubGluZVN0eWxlcztcbiAgICBpZiAoY29tcG9uZW50Lmhhcygnc3R5bGVzJykpIHtcbiAgICAgIGNvbnN0IGxpdFN0eWxlcyA9IHBhcnNlRmllbGRBcnJheVZhbHVlKGNvbXBvbmVudCwgJ3N0eWxlcycsIHRoaXMuZXZhbHVhdG9yKTtcbiAgICAgIGlmIChsaXRTdHlsZXMgPT09IG51bGwpIHtcbiAgICAgICAgdGhpcy5wcmVhbmFseXplU3R5bGVzQ2FjaGUuc2V0KG5vZGUsIG51bGwpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaW5saW5lU3R5bGVzID0gUHJvbWlzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgLmFsbChsaXRTdHlsZXMubWFwKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlID0+IHRoaXMucmVzb3VyY2VMb2FkZXIucHJlcHJvY2Vzc0lubGluZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGUsIHt0eXBlOiAnc3R5bGUnLCBjb250YWluaW5nRmlsZX0pKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKHN0eWxlcyA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucHJlYW5hbHl6ZVN0eWxlc0NhY2hlLnNldChub2RlLCBzdHlsZXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucHJlYW5hbHl6ZVN0eWxlc0NhY2hlLnNldChub2RlLCBudWxsKTtcbiAgICB9XG5cbiAgICAvLyBXYWl0IGZvciBib3RoIHRoZSB0ZW1wbGF0ZSBhbmQgYWxsIHN0eWxlVXJsIHJlc291cmNlcyB0byByZXNvbHZlLlxuICAgIHJldHVybiBQcm9taXNlXG4gICAgICAgIC5hbGwoW1xuICAgICAgICAgIHRlbXBsYXRlQW5kVGVtcGxhdGVTdHlsZVJlc291cmNlcywgaW5saW5lU3R5bGVzLFxuICAgICAgICAgIC4uLmNvbXBvbmVudFN0eWxlVXJscy5tYXAoc3R5bGVVcmwgPT4gcmVzb2x2ZVN0eWxlVXJsKHN0eWxlVXJsLnVybCkpXG4gICAgICAgIF0pXG4gICAgICAgIC50aGVuKCgpID0+IHVuZGVmaW5lZCk7XG4gIH1cblxuICBhbmFseXplKFxuICAgICAgbm9kZTogQ2xhc3NEZWNsYXJhdGlvbiwgZGVjb3JhdG9yOiBSZWFkb25seTxEZWNvcmF0b3I+LFxuICAgICAgZmxhZ3M6IEhhbmRsZXJGbGFncyA9IEhhbmRsZXJGbGFncy5OT05FKTogQW5hbHlzaXNPdXRwdXQ8Q29tcG9uZW50QW5hbHlzaXNEYXRhPiB7XG4gICAgdGhpcy5wZXJmLmV2ZW50Q291bnQoUGVyZkV2ZW50LkFuYWx5emVDb21wb25lbnQpO1xuICAgIGNvbnN0IGNvbnRhaW5pbmdGaWxlID0gbm9kZS5nZXRTb3VyY2VGaWxlKCkuZmlsZU5hbWU7XG4gICAgdGhpcy5saXRlcmFsQ2FjaGUuZGVsZXRlKGRlY29yYXRvcik7XG5cbiAgICBsZXQgZGlhZ25vc3RpY3M6IHRzLkRpYWdub3N0aWNbXXx1bmRlZmluZWQ7XG4gICAgbGV0IGlzUG9pc29uZWQgPSBmYWxzZTtcbiAgICAvLyBAQ29tcG9uZW50IGluaGVyaXRzIEBEaXJlY3RpdmUsIHNvIGJlZ2luIGJ5IGV4dHJhY3RpbmcgdGhlIEBEaXJlY3RpdmUgbWV0YWRhdGEgYW5kIGJ1aWxkaW5nXG4gICAgLy8gb24gaXQuXG4gICAgY29uc3QgZGlyZWN0aXZlUmVzdWx0ID0gZXh0cmFjdERpcmVjdGl2ZU1ldGFkYXRhKFxuICAgICAgICBub2RlLCBkZWNvcmF0b3IsIHRoaXMucmVmbGVjdG9yLCB0aGlzLmV2YWx1YXRvciwgdGhpcy5pc0NvcmUsIGZsYWdzLFxuICAgICAgICB0aGlzLmFubm90YXRlRm9yQ2xvc3VyZUNvbXBpbGVyLFxuICAgICAgICB0aGlzLmVsZW1lbnRTY2hlbWFSZWdpc3RyeS5nZXREZWZhdWx0Q29tcG9uZW50RWxlbWVudE5hbWUoKSk7XG4gICAgaWYgKGRpcmVjdGl2ZVJlc3VsdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAvLyBgZXh0cmFjdERpcmVjdGl2ZU1ldGFkYXRhYCByZXR1cm5zIHVuZGVmaW5lZCB3aGVuIHRoZSBARGlyZWN0aXZlIGhhcyBgaml0OiB0cnVlYC4gSW4gdGhpc1xuICAgICAgLy8gY2FzZSwgY29tcGlsYXRpb24gb2YgdGhlIGRlY29yYXRvciBpcyBza2lwcGVkLiBSZXR1cm5pbmcgYW4gZW1wdHkgb2JqZWN0IHNpZ25pZmllc1xuICAgICAgLy8gdGhhdCBubyBhbmFseXNpcyB3YXMgcHJvZHVjZWQuXG4gICAgICByZXR1cm4ge307XG4gICAgfVxuXG4gICAgLy8gTmV4dCwgcmVhZCB0aGUgYEBDb21wb25lbnRgLXNwZWNpZmljIGZpZWxkcy5cbiAgICBjb25zdCB7ZGVjb3JhdG9yOiBjb21wb25lbnQsIG1ldGFkYXRhLCBpbnB1dHMsIG91dHB1dHN9ID0gZGlyZWN0aXZlUmVzdWx0O1xuXG4gICAgLy8gR28gdGhyb3VnaCB0aGUgcm9vdCBkaXJlY3RvcmllcyBmb3IgdGhpcyBwcm9qZWN0LCBhbmQgc2VsZWN0IHRoZSBvbmUgd2l0aCB0aGUgc21hbGxlc3RcbiAgICAvLyByZWxhdGl2ZSBwYXRoIHJlcHJlc2VudGF0aW9uLlxuICAgIGNvbnN0IHJlbGF0aXZlQ29udGV4dEZpbGVQYXRoID0gdGhpcy5yb290RGlycy5yZWR1Y2U8c3RyaW5nfHVuZGVmaW5lZD4oKHByZXZpb3VzLCByb290RGlyKSA9PiB7XG4gICAgICBjb25zdCBjYW5kaWRhdGUgPSByZWxhdGl2ZShhYnNvbHV0ZUZyb20ocm9vdERpciksIGFic29sdXRlRnJvbShjb250YWluaW5nRmlsZSkpO1xuICAgICAgaWYgKHByZXZpb3VzID09PSB1bmRlZmluZWQgfHwgY2FuZGlkYXRlLmxlbmd0aCA8IHByZXZpb3VzLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gY2FuZGlkYXRlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHByZXZpb3VzO1xuICAgICAgfVxuICAgIH0sIHVuZGVmaW5lZCkhO1xuXG5cbiAgICAvLyBOb3RlIHRoYXQgd2UgY291bGQgdGVjaG5pY2FsbHkgY29tYmluZSB0aGUgYHZpZXdQcm92aWRlcnNSZXF1aXJpbmdGYWN0b3J5YCBhbmRcbiAgICAvLyBgcHJvdmlkZXJzUmVxdWlyaW5nRmFjdG9yeWAgaW50byBhIHNpbmdsZSBzZXQsIGJ1dCB3ZSBrZWVwIHRoZSBzZXBhcmF0ZSBzbyB0aGF0XG4gICAgLy8gd2UgY2FuIGRpc3Rpbmd1aXNoIHdoZXJlIGFuIGVycm9yIGlzIGNvbWluZyBmcm9tIHdoZW4gbG9nZ2luZyB0aGUgZGlhZ25vc3RpY3MgaW4gYHJlc29sdmVgLlxuICAgIGxldCB2aWV3UHJvdmlkZXJzUmVxdWlyaW5nRmFjdG9yeTogU2V0PFJlZmVyZW5jZTxDbGFzc0RlY2xhcmF0aW9uPj58bnVsbCA9IG51bGw7XG4gICAgbGV0IHByb3ZpZGVyc1JlcXVpcmluZ0ZhY3Rvcnk6IFNldDxSZWZlcmVuY2U8Q2xhc3NEZWNsYXJhdGlvbj4+fG51bGwgPSBudWxsO1xuICAgIGxldCB3cmFwcGVkVmlld1Byb3ZpZGVyczogRXhwcmVzc2lvbnxudWxsID0gbnVsbDtcblxuICAgIGlmIChjb21wb25lbnQuaGFzKCd2aWV3UHJvdmlkZXJzJykpIHtcbiAgICAgIGNvbnN0IHZpZXdQcm92aWRlcnMgPSBjb21wb25lbnQuZ2V0KCd2aWV3UHJvdmlkZXJzJykhO1xuICAgICAgdmlld1Byb3ZpZGVyc1JlcXVpcmluZ0ZhY3RvcnkgPVxuICAgICAgICAgIHJlc29sdmVQcm92aWRlcnNSZXF1aXJpbmdGYWN0b3J5KHZpZXdQcm92aWRlcnMsIHRoaXMucmVmbGVjdG9yLCB0aGlzLmV2YWx1YXRvcik7XG4gICAgICB3cmFwcGVkVmlld1Byb3ZpZGVycyA9IG5ldyBXcmFwcGVkTm9kZUV4cHIoXG4gICAgICAgICAgdGhpcy5hbm5vdGF0ZUZvckNsb3N1cmVDb21waWxlciA/IHdyYXBGdW5jdGlvbkV4cHJlc3Npb25zSW5QYXJlbnModmlld1Byb3ZpZGVycykgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aWV3UHJvdmlkZXJzKTtcbiAgICB9XG5cbiAgICBpZiAoY29tcG9uZW50LmhhcygncHJvdmlkZXJzJykpIHtcbiAgICAgIHByb3ZpZGVyc1JlcXVpcmluZ0ZhY3RvcnkgPSByZXNvbHZlUHJvdmlkZXJzUmVxdWlyaW5nRmFjdG9yeShcbiAgICAgICAgICBjb21wb25lbnQuZ2V0KCdwcm92aWRlcnMnKSEsIHRoaXMucmVmbGVjdG9yLCB0aGlzLmV2YWx1YXRvcik7XG4gICAgfVxuXG4gICAgLy8gUGFyc2UgdGhlIHRlbXBsYXRlLlxuICAgIC8vIElmIGEgcHJlYW5hbHl6ZSBwaGFzZSB3YXMgZXhlY3V0ZWQsIHRoZSB0ZW1wbGF0ZSBtYXkgYWxyZWFkeSBleGlzdCBpbiBwYXJzZWQgZm9ybSwgc28gY2hlY2tcbiAgICAvLyB0aGUgcHJlYW5hbHl6ZVRlbXBsYXRlQ2FjaGUuXG4gICAgLy8gRXh0cmFjdCBhIGNsb3N1cmUgb2YgdGhlIHRlbXBsYXRlIHBhcnNpbmcgY29kZSBzbyB0aGF0IGl0IGNhbiBiZSByZXBhcnNlZCB3aXRoIGRpZmZlcmVudFxuICAgIC8vIG9wdGlvbnMgaWYgbmVlZGVkLCBsaWtlIGluIHRoZSBpbmRleGluZyBwaXBlbGluZS5cbiAgICBsZXQgdGVtcGxhdGU6IFBhcnNlZFRlbXBsYXRlV2l0aFNvdXJjZTtcbiAgICBpZiAodGhpcy5wcmVhbmFseXplVGVtcGxhdGVDYWNoZS5oYXMobm9kZSkpIHtcbiAgICAgIC8vIFRoZSB0ZW1wbGF0ZSB3YXMgcGFyc2VkIGluIHByZWFuYWx5emUuIFVzZSBpdCBhbmQgZGVsZXRlIGl0IHRvIHNhdmUgbWVtb3J5LlxuICAgICAgY29uc3QgcHJlYW5hbHl6ZWQgPSB0aGlzLnByZWFuYWx5emVUZW1wbGF0ZUNhY2hlLmdldChub2RlKSE7XG4gICAgICB0aGlzLnByZWFuYWx5emVUZW1wbGF0ZUNhY2hlLmRlbGV0ZShub2RlKTtcblxuICAgICAgdGVtcGxhdGUgPSBwcmVhbmFseXplZDtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgdGVtcGxhdGVEZWNsID0gdGhpcy5wYXJzZVRlbXBsYXRlRGVjbGFyYXRpb24oZGVjb3JhdG9yLCBjb21wb25lbnQsIGNvbnRhaW5pbmdGaWxlKTtcbiAgICAgIHRlbXBsYXRlID0gdGhpcy5leHRyYWN0VGVtcGxhdGUobm9kZSwgdGVtcGxhdGVEZWNsKTtcbiAgICB9XG4gICAgY29uc3QgdGVtcGxhdGVSZXNvdXJjZSA9XG4gICAgICAgIHRlbXBsYXRlLmRlY2xhcmF0aW9uLmlzSW5saW5lID8ge3BhdGg6IG51bGwsIGV4cHJlc3Npb246IGNvbXBvbmVudC5nZXQoJ3RlbXBsYXRlJykhfSA6IHtcbiAgICAgICAgICBwYXRoOiBhYnNvbHV0ZUZyb20odGVtcGxhdGUuZGVjbGFyYXRpb24ucmVzb2x2ZWRUZW1wbGF0ZVVybCksXG4gICAgICAgICAgZXhwcmVzc2lvbjogdGVtcGxhdGUuc291cmNlTWFwcGluZy5ub2RlXG4gICAgICAgIH07XG5cbiAgICAvLyBGaWd1cmUgb3V0IHRoZSBzZXQgb2Ygc3R5bGVzLiBUaGUgb3JkZXJpbmcgaGVyZSBpcyBpbXBvcnRhbnQ6IGV4dGVybmFsIHJlc291cmNlcyAoc3R5bGVVcmxzKVxuICAgIC8vIHByZWNlZGUgaW5saW5lIHN0eWxlcywgYW5kIHN0eWxlcyBkZWZpbmVkIGluIHRoZSB0ZW1wbGF0ZSBvdmVycmlkZSBzdHlsZXMgZGVmaW5lZCBpbiB0aGVcbiAgICAvLyBjb21wb25lbnQuXG4gICAgbGV0IHN0eWxlczogc3RyaW5nW10gPSBbXTtcblxuICAgIGNvbnN0IHN0eWxlUmVzb3VyY2VzID0gdGhpcy5fZXh0cmFjdFN0eWxlUmVzb3VyY2VzKGNvbXBvbmVudCwgY29udGFpbmluZ0ZpbGUpO1xuICAgIGNvbnN0IHN0eWxlVXJsczogU3R5bGVVcmxNZXRhW10gPSBbXG4gICAgICAuLi50aGlzLl9leHRyYWN0Q29tcG9uZW50U3R5bGVVcmxzKGNvbXBvbmVudCksIC4uLnRoaXMuX2V4dHJhY3RUZW1wbGF0ZVN0eWxlVXJscyh0ZW1wbGF0ZSlcbiAgICBdO1xuXG4gICAgZm9yIChjb25zdCBzdHlsZVVybCBvZiBzdHlsZVVybHMpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc291cmNlVXJsID0gdGhpcy5yZXNvdXJjZUxvYWRlci5yZXNvbHZlKHN0eWxlVXJsLnVybCwgY29udGFpbmluZ0ZpbGUpO1xuICAgICAgICBjb25zdCByZXNvdXJjZVN0ciA9IHRoaXMucmVzb3VyY2VMb2FkZXIubG9hZChyZXNvdXJjZVVybCk7XG4gICAgICAgIHN0eWxlcy5wdXNoKHJlc291cmNlU3RyKTtcbiAgICAgICAgaWYgKHRoaXMuZGVwVHJhY2tlciAhPT0gbnVsbCkge1xuICAgICAgICAgIHRoaXMuZGVwVHJhY2tlci5hZGRSZXNvdXJjZURlcGVuZGVuY3kobm9kZS5nZXRTb3VyY2VGaWxlKCksIGFic29sdXRlRnJvbShyZXNvdXJjZVVybCkpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIHtcbiAgICAgICAgaWYgKGRpYWdub3N0aWNzID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBkaWFnbm9zdGljcyA9IFtdO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHJlc291cmNlVHlwZSA9XG4gICAgICAgICAgICBzdHlsZVVybC5zb3VyY2UgPT09IFJlc291cmNlVHlwZUZvckRpYWdub3N0aWNzLlN0eWxlc2hlZXRGcm9tRGVjb3JhdG9yID9cbiAgICAgICAgICAgIFJlc291cmNlVHlwZUZvckRpYWdub3N0aWNzLlN0eWxlc2hlZXRGcm9tRGVjb3JhdG9yIDpcbiAgICAgICAgICAgIFJlc291cmNlVHlwZUZvckRpYWdub3N0aWNzLlN0eWxlc2hlZXRGcm9tVGVtcGxhdGU7XG4gICAgICAgIGRpYWdub3N0aWNzLnB1c2goXG4gICAgICAgICAgICB0aGlzLm1ha2VSZXNvdXJjZU5vdEZvdW5kRXJyb3Ioc3R5bGVVcmwudXJsLCBzdHlsZVVybC5ub2RlRm9yRXJyb3IsIHJlc291cmNlVHlwZSlcbiAgICAgICAgICAgICAgICAudG9EaWFnbm9zdGljKCkpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIElmIGlubGluZSBzdHlsZXMgd2VyZSBwcmVwcm9jZXNzZWQgdXNlIHRob3NlXG4gICAgbGV0IGlubGluZVN0eWxlczogc3RyaW5nW118bnVsbCA9IG51bGw7XG4gICAgaWYgKHRoaXMucHJlYW5hbHl6ZVN0eWxlc0NhY2hlLmhhcyhub2RlKSkge1xuICAgICAgaW5saW5lU3R5bGVzID0gdGhpcy5wcmVhbmFseXplU3R5bGVzQ2FjaGUuZ2V0KG5vZGUpITtcbiAgICAgIHRoaXMucHJlYW5hbHl6ZVN0eWxlc0NhY2hlLmRlbGV0ZShub2RlKTtcbiAgICAgIGlmIChpbmxpbmVTdHlsZXMgIT09IG51bGwpIHtcbiAgICAgICAgc3R5bGVzLnB1c2goLi4uaW5saW5lU3R5bGVzKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gUHJlcHJvY2Vzc2luZyBpcyBvbmx5IHN1cHBvcnRlZCBhc3luY2hyb25vdXNseVxuICAgICAgLy8gSWYgbm8gc3R5bGUgY2FjaGUgZW50cnkgaXMgcHJlc2VudCBhc3luY2hyb25vdXMgcHJlYW5hbHl6ZSB3YXMgbm90IGV4ZWN1dGVkLlxuICAgICAgLy8gVGhpcyBwcm90ZWN0cyBhZ2FpbnN0IGFjY2lkZW50YWwgZGlmZmVyZW5jZXMgaW4gcmVzb3VyY2UgY29udGVudHMgd2hlbiBwcmVhbmFseXNpc1xuICAgICAgLy8gaXMgbm90IHVzZWQgd2l0aCBhIHByb3ZpZGVkIHRyYW5zZm9ybVJlc291cmNlIGhvb2sgb24gdGhlIFJlc291cmNlSG9zdC5cbiAgICAgIGlmICh0aGlzLnJlc291cmNlTG9hZGVyLmNhblByZXByb2Nlc3MpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbmxpbmUgcmVzb3VyY2UgcHJvY2Vzc2luZyByZXF1aXJlcyBhc3luY2hyb25vdXMgcHJlYW5hbHl6ZS4nKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGNvbXBvbmVudC5oYXMoJ3N0eWxlcycpKSB7XG4gICAgICAgIGNvbnN0IGxpdFN0eWxlcyA9IHBhcnNlRmllbGRBcnJheVZhbHVlKGNvbXBvbmVudCwgJ3N0eWxlcycsIHRoaXMuZXZhbHVhdG9yKTtcbiAgICAgICAgaWYgKGxpdFN0eWxlcyAhPT0gbnVsbCkge1xuICAgICAgICAgIGlubGluZVN0eWxlcyA9IFsuLi5saXRTdHlsZXNdO1xuICAgICAgICAgIHN0eWxlcy5wdXNoKC4uLmxpdFN0eWxlcyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHRlbXBsYXRlLnN0eWxlcy5sZW5ndGggPiAwKSB7XG4gICAgICBzdHlsZXMucHVzaCguLi50ZW1wbGF0ZS5zdHlsZXMpO1xuICAgIH1cblxuICAgIGNvbnN0IGVuY2Fwc3VsYXRpb246IG51bWJlciA9XG4gICAgICAgIHRoaXMuX3Jlc29sdmVFbnVtVmFsdWUoY29tcG9uZW50LCAnZW5jYXBzdWxhdGlvbicsICdWaWV3RW5jYXBzdWxhdGlvbicpIHx8IDA7XG5cbiAgICBjb25zdCBjaGFuZ2VEZXRlY3Rpb246IG51bWJlcnxudWxsID1cbiAgICAgICAgdGhpcy5fcmVzb2x2ZUVudW1WYWx1ZShjb21wb25lbnQsICdjaGFuZ2VEZXRlY3Rpb24nLCAnQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3knKTtcblxuICAgIGxldCBhbmltYXRpb25zOiBFeHByZXNzaW9ufG51bGwgPSBudWxsO1xuICAgIGlmIChjb21wb25lbnQuaGFzKCdhbmltYXRpb25zJykpIHtcbiAgICAgIGFuaW1hdGlvbnMgPSBuZXcgV3JhcHBlZE5vZGVFeHByKGNvbXBvbmVudC5nZXQoJ2FuaW1hdGlvbnMnKSEpO1xuICAgIH1cblxuICAgIGNvbnN0IG91dHB1dDogQW5hbHlzaXNPdXRwdXQ8Q29tcG9uZW50QW5hbHlzaXNEYXRhPiA9IHtcbiAgICAgIGFuYWx5c2lzOiB7XG4gICAgICAgIGJhc2VDbGFzczogcmVhZEJhc2VDbGFzcyhub2RlLCB0aGlzLnJlZmxlY3RvciwgdGhpcy5ldmFsdWF0b3IpLFxuICAgICAgICBpbnB1dHMsXG4gICAgICAgIG91dHB1dHMsXG4gICAgICAgIG1ldGE6IHtcbiAgICAgICAgICAuLi5tZXRhZGF0YSxcbiAgICAgICAgICB0ZW1wbGF0ZToge1xuICAgICAgICAgICAgbm9kZXM6IHRlbXBsYXRlLm5vZGVzLFxuICAgICAgICAgICAgbmdDb250ZW50U2VsZWN0b3JzOiB0ZW1wbGF0ZS5uZ0NvbnRlbnRTZWxlY3RvcnMsXG4gICAgICAgICAgfSxcbiAgICAgICAgICBlbmNhcHN1bGF0aW9uLFxuICAgICAgICAgIGludGVycG9sYXRpb246IHRlbXBsYXRlLmludGVycG9sYXRpb25Db25maWcgPz8gREVGQVVMVF9JTlRFUlBPTEFUSU9OX0NPTkZJRyxcbiAgICAgICAgICBzdHlsZXMsXG5cbiAgICAgICAgICAvLyBUaGVzZSB3aWxsIGJlIHJlcGxhY2VkIGR1cmluZyB0aGUgY29tcGlsYXRpb24gc3RlcCwgYWZ0ZXIgYWxsIGBOZ01vZHVsZWBzIGhhdmUgYmVlblxuICAgICAgICAgIC8vIGFuYWx5emVkIGFuZCB0aGUgZnVsbCBjb21waWxhdGlvbiBzY29wZSBmb3IgdGhlIGNvbXBvbmVudCBjYW4gYmUgcmVhbGl6ZWQuXG4gICAgICAgICAgYW5pbWF0aW9ucyxcbiAgICAgICAgICB2aWV3UHJvdmlkZXJzOiB3cmFwcGVkVmlld1Byb3ZpZGVycyxcbiAgICAgICAgICBpMThuVXNlRXh0ZXJuYWxJZHM6IHRoaXMuaTE4blVzZUV4dGVybmFsSWRzLFxuICAgICAgICAgIHJlbGF0aXZlQ29udGV4dEZpbGVQYXRoLFxuICAgICAgICB9LFxuICAgICAgICB0eXBlQ2hlY2tNZXRhOiBleHRyYWN0RGlyZWN0aXZlVHlwZUNoZWNrTWV0YShub2RlLCBpbnB1dHMsIHRoaXMucmVmbGVjdG9yKSxcbiAgICAgICAgY2xhc3NNZXRhZGF0YTogZXh0cmFjdENsYXNzTWV0YWRhdGEoXG4gICAgICAgICAgICBub2RlLCB0aGlzLnJlZmxlY3RvciwgdGhpcy5pc0NvcmUsIHRoaXMuYW5ub3RhdGVGb3JDbG9zdXJlQ29tcGlsZXIpLFxuICAgICAgICB0ZW1wbGF0ZSxcbiAgICAgICAgcHJvdmlkZXJzUmVxdWlyaW5nRmFjdG9yeSxcbiAgICAgICAgdmlld1Byb3ZpZGVyc1JlcXVpcmluZ0ZhY3RvcnksXG4gICAgICAgIGlubGluZVN0eWxlcyxcbiAgICAgICAgc3R5bGVVcmxzLFxuICAgICAgICByZXNvdXJjZXM6IHtcbiAgICAgICAgICBzdHlsZXM6IHN0eWxlUmVzb3VyY2VzLFxuICAgICAgICAgIHRlbXBsYXRlOiB0ZW1wbGF0ZVJlc291cmNlLFxuICAgICAgICB9LFxuICAgICAgICBpc1BvaXNvbmVkLFxuICAgICAgfSxcbiAgICAgIGRpYWdub3N0aWNzLFxuICAgIH07XG4gICAgaWYgKGNoYW5nZURldGVjdGlvbiAhPT0gbnVsbCkge1xuICAgICAgb3V0cHV0LmFuYWx5c2lzIS5tZXRhLmNoYW5nZURldGVjdGlvbiA9IGNoYW5nZURldGVjdGlvbjtcbiAgICB9XG4gICAgcmV0dXJuIG91dHB1dDtcbiAgfVxuXG4gIHN5bWJvbChub2RlOiBDbGFzc0RlY2xhcmF0aW9uLCBhbmFseXNpczogUmVhZG9ubHk8Q29tcG9uZW50QW5hbHlzaXNEYXRhPik6IENvbXBvbmVudFN5bWJvbCB7XG4gICAgY29uc3QgdHlwZVBhcmFtZXRlcnMgPSBleHRyYWN0U2VtYW50aWNUeXBlUGFyYW1ldGVycyhub2RlKTtcblxuICAgIHJldHVybiBuZXcgQ29tcG9uZW50U3ltYm9sKFxuICAgICAgICBub2RlLCBhbmFseXNpcy5tZXRhLnNlbGVjdG9yLCBhbmFseXNpcy5pbnB1dHMsIGFuYWx5c2lzLm91dHB1dHMsIGFuYWx5c2lzLm1ldGEuZXhwb3J0QXMsXG4gICAgICAgIGFuYWx5c2lzLnR5cGVDaGVja01ldGEsIHR5cGVQYXJhbWV0ZXJzKTtcbiAgfVxuXG4gIHJlZ2lzdGVyKG5vZGU6IENsYXNzRGVjbGFyYXRpb24sIGFuYWx5c2lzOiBDb21wb25lbnRBbmFseXNpc0RhdGEpOiB2b2lkIHtcbiAgICAvLyBSZWdpc3RlciB0aGlzIGNvbXBvbmVudCdzIGluZm9ybWF0aW9uIHdpdGggdGhlIGBNZXRhZGF0YVJlZ2lzdHJ5YC4gVGhpcyBlbnN1cmVzIHRoYXRcbiAgICAvLyB0aGUgaW5mb3JtYXRpb24gYWJvdXQgdGhlIGNvbXBvbmVudCBpcyBhdmFpbGFibGUgZHVyaW5nIHRoZSBjb21waWxlKCkgcGhhc2UuXG4gICAgY29uc3QgcmVmID0gbmV3IFJlZmVyZW5jZShub2RlKTtcbiAgICB0aGlzLm1ldGFSZWdpc3RyeS5yZWdpc3RlckRpcmVjdGl2ZU1ldGFkYXRhKHtcbiAgICAgIHJlZixcbiAgICAgIG5hbWU6IG5vZGUubmFtZS50ZXh0LFxuICAgICAgc2VsZWN0b3I6IGFuYWx5c2lzLm1ldGEuc2VsZWN0b3IsXG4gICAgICBleHBvcnRBczogYW5hbHlzaXMubWV0YS5leHBvcnRBcyxcbiAgICAgIGlucHV0czogYW5hbHlzaXMuaW5wdXRzLFxuICAgICAgb3V0cHV0czogYW5hbHlzaXMub3V0cHV0cyxcbiAgICAgIHF1ZXJpZXM6IGFuYWx5c2lzLm1ldGEucXVlcmllcy5tYXAocXVlcnkgPT4gcXVlcnkucHJvcGVydHlOYW1lKSxcbiAgICAgIGlzQ29tcG9uZW50OiB0cnVlLFxuICAgICAgYmFzZUNsYXNzOiBhbmFseXNpcy5iYXNlQ2xhc3MsXG4gICAgICAuLi5hbmFseXNpcy50eXBlQ2hlY2tNZXRhLFxuICAgICAgaXNQb2lzb25lZDogYW5hbHlzaXMuaXNQb2lzb25lZCxcbiAgICAgIGlzU3RydWN0dXJhbDogZmFsc2UsXG4gICAgfSk7XG5cbiAgICB0aGlzLnJlc291cmNlUmVnaXN0cnkucmVnaXN0ZXJSZXNvdXJjZXMoYW5hbHlzaXMucmVzb3VyY2VzLCBub2RlKTtcbiAgICB0aGlzLmluamVjdGFibGVSZWdpc3RyeS5yZWdpc3RlckluamVjdGFibGUobm9kZSk7XG4gIH1cblxuICBpbmRleChcbiAgICAgIGNvbnRleHQ6IEluZGV4aW5nQ29udGV4dCwgbm9kZTogQ2xhc3NEZWNsYXJhdGlvbiwgYW5hbHlzaXM6IFJlYWRvbmx5PENvbXBvbmVudEFuYWx5c2lzRGF0YT4pIHtcbiAgICBpZiAoYW5hbHlzaXMuaXNQb2lzb25lZCAmJiAhdGhpcy51c2VQb2lzb25lZERhdGEpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCBzY29wZSA9IHRoaXMuc2NvcGVSZWFkZXIuZ2V0U2NvcGVGb3JDb21wb25lbnQobm9kZSk7XG4gICAgY29uc3Qgc2VsZWN0b3IgPSBhbmFseXNpcy5tZXRhLnNlbGVjdG9yO1xuICAgIGNvbnN0IG1hdGNoZXIgPSBuZXcgU2VsZWN0b3JNYXRjaGVyPERpcmVjdGl2ZU1ldGE+KCk7XG4gICAgaWYgKHNjb3BlICE9PSBudWxsKSB7XG4gICAgICBpZiAoKHNjb3BlLmNvbXBpbGF0aW9uLmlzUG9pc29uZWQgfHwgc2NvcGUuZXhwb3J0ZWQuaXNQb2lzb25lZCkgJiYgIXRoaXMudXNlUG9pc29uZWREYXRhKSB7XG4gICAgICAgIC8vIERvbid0IGJvdGhlciBpbmRleGluZyBjb21wb25lbnRzIHdoaWNoIGhhZCBlcnJvbmVvdXMgc2NvcGVzLCB1bmxlc3Mgc3BlY2lmaWNhbGx5XG4gICAgICAgIC8vIHJlcXVlc3RlZC5cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG5cbiAgICAgIGZvciAoY29uc3QgZGlyZWN0aXZlIG9mIHNjb3BlLmNvbXBpbGF0aW9uLmRpcmVjdGl2ZXMpIHtcbiAgICAgICAgaWYgKGRpcmVjdGl2ZS5zZWxlY3RvciAhPT0gbnVsbCkge1xuICAgICAgICAgIG1hdGNoZXIuYWRkU2VsZWN0YWJsZXMoQ3NzU2VsZWN0b3IucGFyc2UoZGlyZWN0aXZlLnNlbGVjdG9yKSwgZGlyZWN0aXZlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBiaW5kZXIgPSBuZXcgUjNUYXJnZXRCaW5kZXIobWF0Y2hlcik7XG4gICAgY29uc3QgYm91bmRUZW1wbGF0ZSA9IGJpbmRlci5iaW5kKHt0ZW1wbGF0ZTogYW5hbHlzaXMudGVtcGxhdGUuZGlhZ05vZGVzfSk7XG5cbiAgICBjb250ZXh0LmFkZENvbXBvbmVudCh7XG4gICAgICBkZWNsYXJhdGlvbjogbm9kZSxcbiAgICAgIHNlbGVjdG9yLFxuICAgICAgYm91bmRUZW1wbGF0ZSxcbiAgICAgIHRlbXBsYXRlTWV0YToge1xuICAgICAgICBpc0lubGluZTogYW5hbHlzaXMudGVtcGxhdGUuZGVjbGFyYXRpb24uaXNJbmxpbmUsXG4gICAgICAgIGZpbGU6IGFuYWx5c2lzLnRlbXBsYXRlLmZpbGUsXG4gICAgICB9LFxuICAgIH0pO1xuICB9XG5cbiAgdHlwZUNoZWNrKGN0eDogVHlwZUNoZWNrQ29udGV4dCwgbm9kZTogQ2xhc3NEZWNsYXJhdGlvbiwgbWV0YTogUmVhZG9ubHk8Q29tcG9uZW50QW5hbHlzaXNEYXRhPik6XG4gICAgICB2b2lkIHtcbiAgICBpZiAodGhpcy50eXBlQ2hlY2tTY29wZVJlZ2lzdHJ5ID09PSBudWxsIHx8ICF0cy5pc0NsYXNzRGVjbGFyYXRpb24obm9kZSkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAobWV0YS5pc1BvaXNvbmVkICYmICF0aGlzLnVzZVBvaXNvbmVkRGF0YSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBzY29wZSA9IHRoaXMudHlwZUNoZWNrU2NvcGVSZWdpc3RyeS5nZXRUeXBlQ2hlY2tTY29wZShub2RlKTtcbiAgICBpZiAoc2NvcGUuaXNQb2lzb25lZCAmJiAhdGhpcy51c2VQb2lzb25lZERhdGEpIHtcbiAgICAgIC8vIERvbid0IHR5cGUtY2hlY2sgY29tcG9uZW50cyB0aGF0IGhhZCBlcnJvcnMgaW4gdGhlaXIgc2NvcGVzLCB1bmxlc3MgcmVxdWVzdGVkLlxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGJpbmRlciA9IG5ldyBSM1RhcmdldEJpbmRlcihzY29wZS5tYXRjaGVyKTtcbiAgICBjdHguYWRkVGVtcGxhdGUoXG4gICAgICAgIG5ldyBSZWZlcmVuY2Uobm9kZSksIGJpbmRlciwgbWV0YS50ZW1wbGF0ZS5kaWFnTm9kZXMsIHNjb3BlLnBpcGVzLCBzY29wZS5zY2hlbWFzLFxuICAgICAgICBtZXRhLnRlbXBsYXRlLnNvdXJjZU1hcHBpbmcsIG1ldGEudGVtcGxhdGUuZmlsZSwgbWV0YS50ZW1wbGF0ZS5lcnJvcnMpO1xuICB9XG5cbiAgcmVzb2x2ZShcbiAgICAgIG5vZGU6IENsYXNzRGVjbGFyYXRpb24sIGFuYWx5c2lzOiBSZWFkb25seTxDb21wb25lbnRBbmFseXNpc0RhdGE+LFxuICAgICAgc3ltYm9sOiBDb21wb25lbnRTeW1ib2wpOiBSZXNvbHZlUmVzdWx0PENvbXBvbmVudFJlc29sdXRpb25EYXRhPiB7XG4gICAgaWYgKHRoaXMuc2VtYW50aWNEZXBHcmFwaFVwZGF0ZXIgIT09IG51bGwgJiYgYW5hbHlzaXMuYmFzZUNsYXNzIGluc3RhbmNlb2YgUmVmZXJlbmNlKSB7XG4gICAgICBzeW1ib2wuYmFzZUNsYXNzID0gdGhpcy5zZW1hbnRpY0RlcEdyYXBoVXBkYXRlci5nZXRTeW1ib2woYW5hbHlzaXMuYmFzZUNsYXNzLm5vZGUpO1xuICAgIH1cblxuICAgIGlmIChhbmFseXNpcy5pc1BvaXNvbmVkICYmICF0aGlzLnVzZVBvaXNvbmVkRGF0YSkge1xuICAgICAgcmV0dXJuIHt9O1xuICAgIH1cblxuICAgIGNvbnN0IGNvbnRleHQgPSBub2RlLmdldFNvdXJjZUZpbGUoKTtcbiAgICAvLyBDaGVjayB3aGV0aGVyIHRoaXMgY29tcG9uZW50IHdhcyByZWdpc3RlcmVkIHdpdGggYW4gTmdNb2R1bGUuIElmIHNvLCBpdCBzaG91bGQgYmUgY29tcGlsZWRcbiAgICAvLyB1bmRlciB0aGF0IG1vZHVsZSdzIGNvbXBpbGF0aW9uIHNjb3BlLlxuICAgIGNvbnN0IHNjb3BlID0gdGhpcy5zY29wZVJlYWRlci5nZXRTY29wZUZvckNvbXBvbmVudChub2RlKTtcbiAgICBsZXQgbWV0YWRhdGEgPSBhbmFseXNpcy5tZXRhIGFzIFJlYWRvbmx5PFIzQ29tcG9uZW50TWV0YWRhdGE+O1xuXG4gICAgY29uc3QgZGF0YTogQ29tcG9uZW50UmVzb2x1dGlvbkRhdGEgPSB7XG4gICAgICBkaXJlY3RpdmVzOiBFTVBUWV9BUlJBWSxcbiAgICAgIHBpcGVzOiBFTVBUWV9NQVAsXG4gICAgICBkZWNsYXJhdGlvbkxpc3RFbWl0TW9kZTogRGVjbGFyYXRpb25MaXN0RW1pdE1vZGUuRGlyZWN0LFxuICAgIH07XG5cbiAgICBpZiAoc2NvcGUgIT09IG51bGwgJiYgKCFzY29wZS5jb21waWxhdGlvbi5pc1BvaXNvbmVkIHx8IHRoaXMudXNlUG9pc29uZWREYXRhKSkge1xuICAgICAgLy8gUmVwbGFjZSB0aGUgZW1wdHkgY29tcG9uZW50cyBhbmQgZGlyZWN0aXZlcyBmcm9tIHRoZSBhbmFseXplKCkgc3RlcCB3aXRoIGEgZnVsbHkgZXhwYW5kZWRcbiAgICAgIC8vIHNjb3BlLiBUaGlzIGlzIHBvc3NpYmxlIG5vdyBiZWNhdXNlIGR1cmluZyByZXNvbHZlKCkgdGhlIHdob2xlIGNvbXBpbGF0aW9uIHVuaXQgaGFzIGJlZW5cbiAgICAgIC8vIGZ1bGx5IGFuYWx5emVkLlxuICAgICAgLy9cbiAgICAgIC8vIEZpcnN0IGl0IG5lZWRzIHRvIGJlIGRldGVybWluZWQgaWYgYWN0dWFsbHkgaW1wb3J0aW5nIHRoZSBkaXJlY3RpdmVzL3BpcGVzIHVzZWQgaW4gdGhlXG4gICAgICAvLyB0ZW1wbGF0ZSB3b3VsZCBjcmVhdGUgYSBjeWNsZS4gQ3VycmVudGx5IG5ndHNjIHJlZnVzZXMgdG8gZ2VuZXJhdGUgY3ljbGVzLCBzbyBhbiBvcHRpb25cbiAgICAgIC8vIGtub3duIGFzIFwicmVtb3RlIHNjb3BpbmdcIiBpcyB1c2VkIGlmIGEgY3ljbGUgd291bGQgYmUgY3JlYXRlZC4gSW4gcmVtb3RlIHNjb3BpbmcsIHRoZVxuICAgICAgLy8gbW9kdWxlIGZpbGUgc2V0cyB0aGUgZGlyZWN0aXZlcy9waXBlcyBvbiB0aGUgybVjbXAgb2YgdGhlIGNvbXBvbmVudCwgd2l0aG91dFxuICAgICAgLy8gcmVxdWlyaW5nIG5ldyBpbXBvcnRzIChidXQgYWxzbyBpbiBhIHdheSB0aGF0IGJyZWFrcyB0cmVlIHNoYWtpbmcpLlxuICAgICAgLy9cbiAgICAgIC8vIERldGVybWluaW5nIHRoaXMgaXMgY2hhbGxlbmdpbmcsIGJlY2F1c2UgdGhlIFRlbXBsYXRlRGVmaW5pdGlvbkJ1aWxkZXIgaXMgcmVzcG9uc2libGUgZm9yXG4gICAgICAvLyBtYXRjaGluZyBkaXJlY3RpdmVzIGFuZCBwaXBlcyBpbiB0aGUgdGVtcGxhdGU7IGhvd2V2ZXIsIHRoYXQgZG9lc24ndCBydW4gdW50aWwgdGhlIGFjdHVhbFxuICAgICAgLy8gY29tcGlsZSgpIHN0ZXAuIEl0J3Mgbm90IHBvc3NpYmxlIHRvIHJ1biB0ZW1wbGF0ZSBjb21waWxhdGlvbiBzb29uZXIgYXMgaXQgcmVxdWlyZXMgdGhlXG4gICAgICAvLyBDb25zdGFudFBvb2wgZm9yIHRoZSBvdmVyYWxsIGZpbGUgYmVpbmcgY29tcGlsZWQgKHdoaWNoIGlzbid0IGF2YWlsYWJsZSB1bnRpbCB0aGVcbiAgICAgIC8vIHRyYW5zZm9ybSBzdGVwKS5cbiAgICAgIC8vXG4gICAgICAvLyBJbnN0ZWFkLCBkaXJlY3RpdmVzL3BpcGVzIGFyZSBtYXRjaGVkIGluZGVwZW5kZW50bHkgaGVyZSwgdXNpbmcgdGhlIFIzVGFyZ2V0QmluZGVyLiBUaGlzXG4gICAgICAvLyBpcyBhbiBhbHRlcm5hdGl2ZSBpbXBsZW1lbnRhdGlvbiBvZiB0ZW1wbGF0ZSBtYXRjaGluZyB3aGljaCBpcyB1c2VkIGZvciB0ZW1wbGF0ZVxuICAgICAgLy8gdHlwZS1jaGVja2luZyBhbmQgd2lsbCBldmVudHVhbGx5IHJlcGxhY2UgbWF0Y2hpbmcgaW4gdGhlIFRlbXBsYXRlRGVmaW5pdGlvbkJ1aWxkZXIuXG5cblxuICAgICAgLy8gU2V0IHVwIHRoZSBSM1RhcmdldEJpbmRlciwgYXMgd2VsbCBhcyBhICdkaXJlY3RpdmVzJyBhcnJheSBhbmQgYSAncGlwZXMnIG1hcCB0aGF0IGFyZVxuICAgICAgLy8gbGF0ZXIgZmVkIHRvIHRoZSBUZW1wbGF0ZURlZmluaXRpb25CdWlsZGVyLiBGaXJzdCwgYSBTZWxlY3Rvck1hdGNoZXIgaXMgY29uc3RydWN0ZWQgdG9cbiAgICAgIC8vIG1hdGNoIGRpcmVjdGl2ZXMgdGhhdCBhcmUgaW4gc2NvcGUuXG4gICAgICB0eXBlIE1hdGNoZWREaXJlY3RpdmUgPSBEaXJlY3RpdmVNZXRhJntzZWxlY3Rvcjogc3RyaW5nfTtcbiAgICAgIGNvbnN0IG1hdGNoZXIgPSBuZXcgU2VsZWN0b3JNYXRjaGVyPE1hdGNoZWREaXJlY3RpdmU+KCk7XG5cbiAgICAgIGZvciAoY29uc3QgZGlyIG9mIHNjb3BlLmNvbXBpbGF0aW9uLmRpcmVjdGl2ZXMpIHtcbiAgICAgICAgaWYgKGRpci5zZWxlY3RvciAhPT0gbnVsbCkge1xuICAgICAgICAgIG1hdGNoZXIuYWRkU2VsZWN0YWJsZXMoQ3NzU2VsZWN0b3IucGFyc2UoZGlyLnNlbGVjdG9yKSwgZGlyIGFzIE1hdGNoZWREaXJlY3RpdmUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBjb25zdCBwaXBlcyA9IG5ldyBNYXA8c3RyaW5nLCBSZWZlcmVuY2U8Q2xhc3NEZWNsYXJhdGlvbj4+KCk7XG4gICAgICBmb3IgKGNvbnN0IHBpcGUgb2Ygc2NvcGUuY29tcGlsYXRpb24ucGlwZXMpIHtcbiAgICAgICAgcGlwZXMuc2V0KHBpcGUubmFtZSwgcGlwZS5yZWYpO1xuICAgICAgfVxuXG4gICAgICAvLyBOZXh0LCB0aGUgY29tcG9uZW50IHRlbXBsYXRlIEFTVCBpcyBib3VuZCB1c2luZyB0aGUgUjNUYXJnZXRCaW5kZXIuIFRoaXMgcHJvZHVjZXMgYVxuICAgICAgLy8gQm91bmRUYXJnZXQsIHdoaWNoIGlzIHNpbWlsYXIgdG8gYSB0cy5UeXBlQ2hlY2tlci5cbiAgICAgIGNvbnN0IGJpbmRlciA9IG5ldyBSM1RhcmdldEJpbmRlcihtYXRjaGVyKTtcbiAgICAgIGNvbnN0IGJvdW5kID0gYmluZGVyLmJpbmQoe3RlbXBsYXRlOiBtZXRhZGF0YS50ZW1wbGF0ZS5ub2Rlc30pO1xuXG4gICAgICAvLyBUaGUgQm91bmRUYXJnZXQga25vd3Mgd2hpY2ggZGlyZWN0aXZlcyBhbmQgcGlwZXMgbWF0Y2hlZCB0aGUgdGVtcGxhdGUuXG4gICAgICB0eXBlIFVzZWREaXJlY3RpdmUgPVxuICAgICAgICAgIFIzVXNlZERpcmVjdGl2ZU1ldGFkYXRhJntyZWY6IFJlZmVyZW5jZTxDbGFzc0RlY2xhcmF0aW9uPiwgaW1wb3J0ZWRGaWxlOiBJbXBvcnRlZEZpbGV9O1xuICAgICAgY29uc3QgdXNlZERpcmVjdGl2ZXM6IFVzZWREaXJlY3RpdmVbXSA9IGJvdW5kLmdldFVzZWREaXJlY3RpdmVzKCkubWFwKGRpcmVjdGl2ZSA9PiB7XG4gICAgICAgIGNvbnN0IHR5cGUgPSB0aGlzLnJlZkVtaXR0ZXIuZW1pdChkaXJlY3RpdmUucmVmLCBjb250ZXh0KTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICByZWY6IGRpcmVjdGl2ZS5yZWYsXG4gICAgICAgICAgdHlwZTogdHlwZS5leHByZXNzaW9uLFxuICAgICAgICAgIGltcG9ydGVkRmlsZTogdHlwZS5pbXBvcnRlZEZpbGUsXG4gICAgICAgICAgc2VsZWN0b3I6IGRpcmVjdGl2ZS5zZWxlY3RvcixcbiAgICAgICAgICBpbnB1dHM6IGRpcmVjdGl2ZS5pbnB1dHMucHJvcGVydHlOYW1lcyxcbiAgICAgICAgICBvdXRwdXRzOiBkaXJlY3RpdmUub3V0cHV0cy5wcm9wZXJ0eU5hbWVzLFxuICAgICAgICAgIGV4cG9ydEFzOiBkaXJlY3RpdmUuZXhwb3J0QXMsXG4gICAgICAgICAgaXNDb21wb25lbnQ6IGRpcmVjdGl2ZS5pc0NvbXBvbmVudCxcbiAgICAgICAgfTtcbiAgICAgIH0pO1xuXG4gICAgICB0eXBlIFVzZWRQaXBlID0ge1xuICAgICAgICByZWY6IFJlZmVyZW5jZTxDbGFzc0RlY2xhcmF0aW9uPixcbiAgICAgICAgcGlwZU5hbWU6IHN0cmluZyxcbiAgICAgICAgZXhwcmVzc2lvbjogRXhwcmVzc2lvbixcbiAgICAgICAgaW1wb3J0ZWRGaWxlOiBJbXBvcnRlZEZpbGUsXG4gICAgICB9O1xuICAgICAgY29uc3QgdXNlZFBpcGVzOiBVc2VkUGlwZVtdID0gW107XG4gICAgICBmb3IgKGNvbnN0IHBpcGVOYW1lIG9mIGJvdW5kLmdldFVzZWRQaXBlcygpKSB7XG4gICAgICAgIGlmICghcGlwZXMuaGFzKHBpcGVOYW1lKSkge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHBpcGUgPSBwaXBlcy5nZXQocGlwZU5hbWUpITtcbiAgICAgICAgY29uc3QgdHlwZSA9IHRoaXMucmVmRW1pdHRlci5lbWl0KHBpcGUsIGNvbnRleHQpO1xuICAgICAgICB1c2VkUGlwZXMucHVzaCh7XG4gICAgICAgICAgcmVmOiBwaXBlLFxuICAgICAgICAgIHBpcGVOYW1lLFxuICAgICAgICAgIGV4cHJlc3Npb246IHR5cGUuZXhwcmVzc2lvbixcbiAgICAgICAgICBpbXBvcnRlZEZpbGU6IHR5cGUuaW1wb3J0ZWRGaWxlLFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLnNlbWFudGljRGVwR3JhcGhVcGRhdGVyICE9PSBudWxsKSB7XG4gICAgICAgIHN5bWJvbC51c2VkRGlyZWN0aXZlcyA9IHVzZWREaXJlY3RpdmVzLm1hcChcbiAgICAgICAgICAgIGRpciA9PiB0aGlzLnNlbWFudGljRGVwR3JhcGhVcGRhdGVyIS5nZXRTZW1hbnRpY1JlZmVyZW5jZShkaXIucmVmLm5vZGUsIGRpci50eXBlKSk7XG4gICAgICAgIHN5bWJvbC51c2VkUGlwZXMgPSB1c2VkUGlwZXMubWFwKFxuICAgICAgICAgICAgcGlwZSA9PlxuICAgICAgICAgICAgICAgIHRoaXMuc2VtYW50aWNEZXBHcmFwaFVwZGF0ZXIhLmdldFNlbWFudGljUmVmZXJlbmNlKHBpcGUucmVmLm5vZGUsIHBpcGUuZXhwcmVzc2lvbikpO1xuICAgICAgfVxuXG4gICAgICAvLyBTY2FuIHRocm91Z2ggdGhlIGRpcmVjdGl2ZXMvcGlwZXMgYWN0dWFsbHkgdXNlZCBpbiB0aGUgdGVtcGxhdGUgYW5kIGNoZWNrIHdoZXRoZXIgYW55XG4gICAgICAvLyBpbXBvcnQgd2hpY2ggbmVlZHMgdG8gYmUgZ2VuZXJhdGVkIHdvdWxkIGNyZWF0ZSBhIGN5Y2xlLlxuICAgICAgY29uc3QgY3ljbGVzRnJvbURpcmVjdGl2ZXMgPSBuZXcgTWFwPFVzZWREaXJlY3RpdmUsIEN5Y2xlPigpO1xuICAgICAgZm9yIChjb25zdCB1c2VkRGlyZWN0aXZlIG9mIHVzZWREaXJlY3RpdmVzKSB7XG4gICAgICAgIGNvbnN0IGN5Y2xlID1cbiAgICAgICAgICAgIHRoaXMuX2NoZWNrRm9yQ3ljbGljSW1wb3J0KHVzZWREaXJlY3RpdmUuaW1wb3J0ZWRGaWxlLCB1c2VkRGlyZWN0aXZlLnR5cGUsIGNvbnRleHQpO1xuICAgICAgICBpZiAoY3ljbGUgIT09IG51bGwpIHtcbiAgICAgICAgICBjeWNsZXNGcm9tRGlyZWN0aXZlcy5zZXQodXNlZERpcmVjdGl2ZSwgY3ljbGUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBjb25zdCBjeWNsZXNGcm9tUGlwZXMgPSBuZXcgTWFwPFVzZWRQaXBlLCBDeWNsZT4oKTtcbiAgICAgIGZvciAoY29uc3QgdXNlZFBpcGUgb2YgdXNlZFBpcGVzKSB7XG4gICAgICAgIGNvbnN0IGN5Y2xlID1cbiAgICAgICAgICAgIHRoaXMuX2NoZWNrRm9yQ3ljbGljSW1wb3J0KHVzZWRQaXBlLmltcG9ydGVkRmlsZSwgdXNlZFBpcGUuZXhwcmVzc2lvbiwgY29udGV4dCk7XG4gICAgICAgIGlmIChjeWNsZSAhPT0gbnVsbCkge1xuICAgICAgICAgIGN5Y2xlc0Zyb21QaXBlcy5zZXQodXNlZFBpcGUsIGN5Y2xlKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjb25zdCBjeWNsZURldGVjdGVkID0gY3ljbGVzRnJvbURpcmVjdGl2ZXMuc2l6ZSAhPT0gMCB8fCBjeWNsZXNGcm9tUGlwZXMuc2l6ZSAhPT0gMDtcbiAgICAgIGlmICghY3ljbGVEZXRlY3RlZCkge1xuICAgICAgICAvLyBObyBjeWNsZSB3YXMgZGV0ZWN0ZWQuIFJlY29yZCB0aGUgaW1wb3J0cyB0aGF0IG5lZWQgdG8gYmUgY3JlYXRlZCBpbiB0aGUgY3ljbGUgZGV0ZWN0b3JcbiAgICAgICAgLy8gc28gdGhhdCBmdXR1cmUgY3ljbGljIGltcG9ydCBjaGVja3MgY29uc2lkZXIgdGhlaXIgcHJvZHVjdGlvbi5cbiAgICAgICAgZm9yIChjb25zdCB7dHlwZSwgaW1wb3J0ZWRGaWxlfSBvZiB1c2VkRGlyZWN0aXZlcykge1xuICAgICAgICAgIHRoaXMuX3JlY29yZFN5bnRoZXRpY0ltcG9ydChpbXBvcnRlZEZpbGUsIHR5cGUsIGNvbnRleHQpO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3Qge2V4cHJlc3Npb24sIGltcG9ydGVkRmlsZX0gb2YgdXNlZFBpcGVzKSB7XG4gICAgICAgICAgdGhpcy5fcmVjb3JkU3ludGhldGljSW1wb3J0KGltcG9ydGVkRmlsZSwgZXhwcmVzc2lvbiwgY29udGV4dCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDaGVjayB3aGV0aGVyIHRoZSBkaXJlY3RpdmUvcGlwZSBhcnJheXMgaW4gybVjbXAgbmVlZCB0byBiZSB3cmFwcGVkIGluIGNsb3N1cmVzLlxuICAgICAgICAvLyBUaGlzIGlzIHJlcXVpcmVkIGlmIGFueSBkaXJlY3RpdmUvcGlwZSByZWZlcmVuY2UgaXMgdG8gYSBkZWNsYXJhdGlvbiBpbiB0aGUgc2FtZSBmaWxlXG4gICAgICAgIC8vIGJ1dCBkZWNsYXJlZCBhZnRlciB0aGlzIGNvbXBvbmVudC5cbiAgICAgICAgY29uc3Qgd3JhcERpcmVjdGl2ZXNBbmRQaXBlc0luQ2xvc3VyZSA9XG4gICAgICAgICAgICB1c2VkRGlyZWN0aXZlcy5zb21lKFxuICAgICAgICAgICAgICAgIGRpciA9PiBpc0V4cHJlc3Npb25Gb3J3YXJkUmVmZXJlbmNlKGRpci50eXBlLCBub2RlLm5hbWUsIGNvbnRleHQpKSB8fFxuICAgICAgICAgICAgdXNlZFBpcGVzLnNvbWUoXG4gICAgICAgICAgICAgICAgcGlwZSA9PiBpc0V4cHJlc3Npb25Gb3J3YXJkUmVmZXJlbmNlKHBpcGUuZXhwcmVzc2lvbiwgbm9kZS5uYW1lLCBjb250ZXh0KSk7XG5cbiAgICAgICAgZGF0YS5kaXJlY3RpdmVzID0gdXNlZERpcmVjdGl2ZXM7XG4gICAgICAgIGRhdGEucGlwZXMgPSBuZXcgTWFwKHVzZWRQaXBlcy5tYXAocGlwZSA9PiBbcGlwZS5waXBlTmFtZSwgcGlwZS5leHByZXNzaW9uXSkpO1xuICAgICAgICBkYXRhLmRlY2xhcmF0aW9uTGlzdEVtaXRNb2RlID0gd3JhcERpcmVjdGl2ZXNBbmRQaXBlc0luQ2xvc3VyZSA/XG4gICAgICAgICAgICBEZWNsYXJhdGlvbkxpc3RFbWl0TW9kZS5DbG9zdXJlIDpcbiAgICAgICAgICAgIERlY2xhcmF0aW9uTGlzdEVtaXRNb2RlLkRpcmVjdDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICh0aGlzLmN5Y2xlSGFuZGxpbmdTdHJhdGVneSA9PT0gQ3ljbGVIYW5kbGluZ1N0cmF0ZWd5LlVzZVJlbW90ZVNjb3BpbmcpIHtcbiAgICAgICAgICAvLyBEZWNsYXJpbmcgdGhlIGRpcmVjdGl2ZURlZnMvcGlwZURlZnMgYXJyYXlzIGRpcmVjdGx5IHdvdWxkIHJlcXVpcmUgaW1wb3J0cyB0aGF0IHdvdWxkXG4gICAgICAgICAgLy8gY3JlYXRlIGEgY3ljbGUuIEluc3RlYWQsIG1hcmsgdGhpcyBjb21wb25lbnQgYXMgcmVxdWlyaW5nIHJlbW90ZSBzY29waW5nLCBzbyB0aGF0IHRoZVxuICAgICAgICAgIC8vIE5nTW9kdWxlIGZpbGUgd2lsbCB0YWtlIGNhcmUgb2Ygc2V0dGluZyB0aGUgZGlyZWN0aXZlcyBmb3IgdGhlIGNvbXBvbmVudC5cbiAgICAgICAgICB0aGlzLnNjb3BlUmVnaXN0cnkuc2V0Q29tcG9uZW50UmVtb3RlU2NvcGUoXG4gICAgICAgICAgICAgIG5vZGUsIHVzZWREaXJlY3RpdmVzLm1hcChkaXIgPT4gZGlyLnJlZiksIHVzZWRQaXBlcy5tYXAocGlwZSA9PiBwaXBlLnJlZikpO1xuICAgICAgICAgIHN5bWJvbC5pc1JlbW90ZWx5U2NvcGVkID0gdHJ1ZTtcblxuICAgICAgICAgIC8vIElmIGEgc2VtYW50aWMgZ3JhcGggaXMgYmVpbmcgdHJhY2tlZCwgcmVjb3JkIHRoZSBmYWN0IHRoYXQgdGhpcyBjb21wb25lbnQgaXMgcmVtb3RlbHlcbiAgICAgICAgICAvLyBzY29wZWQgd2l0aCB0aGUgZGVjbGFyaW5nIE5nTW9kdWxlIHN5bWJvbCBhcyB0aGUgTmdNb2R1bGUncyBlbWl0IGJlY29tZXMgZGVwZW5kZW50IG9uXG4gICAgICAgICAgLy8gdGhlIGRpcmVjdGl2ZS9waXBlIHVzYWdlcyBvZiB0aGlzIGNvbXBvbmVudC5cbiAgICAgICAgICBpZiAodGhpcy5zZW1hbnRpY0RlcEdyYXBoVXBkYXRlciAhPT0gbnVsbCkge1xuICAgICAgICAgICAgY29uc3QgbW9kdWxlU3ltYm9sID0gdGhpcy5zZW1hbnRpY0RlcEdyYXBoVXBkYXRlci5nZXRTeW1ib2woc2NvcGUubmdNb2R1bGUpO1xuICAgICAgICAgICAgaWYgKCEobW9kdWxlU3ltYm9sIGluc3RhbmNlb2YgTmdNb2R1bGVTeW1ib2wpKSB7XG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICAgIGBBc3NlcnRpb25FcnJvcjogRXhwZWN0ZWQgJHtzY29wZS5uZ01vZHVsZS5uYW1lfSB0byBiZSBhbiBOZ01vZHVsZVN5bWJvbC5gKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbW9kdWxlU3ltYm9sLmFkZFJlbW90ZWx5U2NvcGVkQ29tcG9uZW50KFxuICAgICAgICAgICAgICAgIHN5bWJvbCwgc3ltYm9sLnVzZWREaXJlY3RpdmVzLCBzeW1ib2wudXNlZFBpcGVzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gV2UgYXJlIG5vdCBhYmxlIHRvIGhhbmRsZSB0aGlzIGN5Y2xlIHNvIHRocm93IGFuIGVycm9yLlxuICAgICAgICAgIGNvbnN0IHJlbGF0ZWRNZXNzYWdlczogdHMuRGlhZ25vc3RpY1JlbGF0ZWRJbmZvcm1hdGlvbltdID0gW107XG4gICAgICAgICAgZm9yIChjb25zdCBbZGlyLCBjeWNsZV0gb2YgY3ljbGVzRnJvbURpcmVjdGl2ZXMpIHtcbiAgICAgICAgICAgIHJlbGF0ZWRNZXNzYWdlcy5wdXNoKFxuICAgICAgICAgICAgICAgIG1ha2VDeWNsaWNJbXBvcnRJbmZvKGRpci5yZWYsIGRpci5pc0NvbXBvbmVudCA/ICdjb21wb25lbnQnIDogJ2RpcmVjdGl2ZScsIGN5Y2xlKSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGZvciAoY29uc3QgW3BpcGUsIGN5Y2xlXSBvZiBjeWNsZXNGcm9tUGlwZXMpIHtcbiAgICAgICAgICAgIHJlbGF0ZWRNZXNzYWdlcy5wdXNoKG1ha2VDeWNsaWNJbXBvcnRJbmZvKHBpcGUucmVmLCAncGlwZScsIGN5Y2xlKSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRocm93IG5ldyBGYXRhbERpYWdub3N0aWNFcnJvcihcbiAgICAgICAgICAgICAgRXJyb3JDb2RlLklNUE9SVF9DWUNMRV9ERVRFQ1RFRCwgbm9kZSxcbiAgICAgICAgICAgICAgJ09uZSBvciBtb3JlIGltcG9ydCBjeWNsZXMgd291bGQgbmVlZCB0byBiZSBjcmVhdGVkIHRvIGNvbXBpbGUgdGhpcyBjb21wb25lbnQsICcgK1xuICAgICAgICAgICAgICAgICAgJ3doaWNoIGlzIG5vdCBzdXBwb3J0ZWQgYnkgdGhlIGN1cnJlbnQgY29tcGlsZXIgY29uZmlndXJhdGlvbi4nLFxuICAgICAgICAgICAgICByZWxhdGVkTWVzc2FnZXMpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgZGlhZ25vc3RpY3M6IHRzLkRpYWdub3N0aWNbXSA9IFtdO1xuXG4gICAgaWYgKGFuYWx5c2lzLnByb3ZpZGVyc1JlcXVpcmluZ0ZhY3RvcnkgIT09IG51bGwgJiZcbiAgICAgICAgYW5hbHlzaXMubWV0YS5wcm92aWRlcnMgaW5zdGFuY2VvZiBXcmFwcGVkTm9kZUV4cHIpIHtcbiAgICAgIGNvbnN0IHByb3ZpZGVyRGlhZ25vc3RpY3MgPSBnZXRQcm92aWRlckRpYWdub3N0aWNzKFxuICAgICAgICAgIGFuYWx5c2lzLnByb3ZpZGVyc1JlcXVpcmluZ0ZhY3RvcnksIGFuYWx5c2lzLm1ldGEucHJvdmlkZXJzIS5ub2RlLFxuICAgICAgICAgIHRoaXMuaW5qZWN0YWJsZVJlZ2lzdHJ5KTtcbiAgICAgIGRpYWdub3N0aWNzLnB1c2goLi4ucHJvdmlkZXJEaWFnbm9zdGljcyk7XG4gICAgfVxuXG4gICAgaWYgKGFuYWx5c2lzLnZpZXdQcm92aWRlcnNSZXF1aXJpbmdGYWN0b3J5ICE9PSBudWxsICYmXG4gICAgICAgIGFuYWx5c2lzLm1ldGEudmlld1Byb3ZpZGVycyBpbnN0YW5jZW9mIFdyYXBwZWROb2RlRXhwcikge1xuICAgICAgY29uc3Qgdmlld1Byb3ZpZGVyRGlhZ25vc3RpY3MgPSBnZXRQcm92aWRlckRpYWdub3N0aWNzKFxuICAgICAgICAgIGFuYWx5c2lzLnZpZXdQcm92aWRlcnNSZXF1aXJpbmdGYWN0b3J5LCBhbmFseXNpcy5tZXRhLnZpZXdQcm92aWRlcnMhLm5vZGUsXG4gICAgICAgICAgdGhpcy5pbmplY3RhYmxlUmVnaXN0cnkpO1xuICAgICAgZGlhZ25vc3RpY3MucHVzaCguLi52aWV3UHJvdmlkZXJEaWFnbm9zdGljcyk7XG4gICAgfVxuXG4gICAgY29uc3QgZGlyZWN0aXZlRGlhZ25vc3RpY3MgPSBnZXREaXJlY3RpdmVEaWFnbm9zdGljcyhcbiAgICAgICAgbm9kZSwgdGhpcy5tZXRhUmVhZGVyLCB0aGlzLmV2YWx1YXRvciwgdGhpcy5yZWZsZWN0b3IsIHRoaXMuc2NvcGVSZWdpc3RyeSwgJ0NvbXBvbmVudCcpO1xuICAgIGlmIChkaXJlY3RpdmVEaWFnbm9zdGljcyAhPT0gbnVsbCkge1xuICAgICAgZGlhZ25vc3RpY3MucHVzaCguLi5kaXJlY3RpdmVEaWFnbm9zdGljcyk7XG4gICAgfVxuXG4gICAgaWYgKGRpYWdub3N0aWNzLmxlbmd0aCA+IDApIHtcbiAgICAgIHJldHVybiB7ZGlhZ25vc3RpY3N9O1xuICAgIH1cblxuICAgIHJldHVybiB7ZGF0YX07XG4gIH1cblxuICB1cGRhdGVSZXNvdXJjZXMobm9kZTogQ2xhc3NEZWNsYXJhdGlvbiwgYW5hbHlzaXM6IENvbXBvbmVudEFuYWx5c2lzRGF0YSk6IHZvaWQge1xuICAgIGNvbnN0IGNvbnRhaW5pbmdGaWxlID0gbm9kZS5nZXRTb3VyY2VGaWxlKCkuZmlsZU5hbWU7XG5cbiAgICAvLyBJZiB0aGUgdGVtcGxhdGUgaXMgZXh0ZXJuYWwsIHJlLXBhcnNlIGl0LlxuICAgIGNvbnN0IHRlbXBsYXRlRGVjbCA9IGFuYWx5c2lzLnRlbXBsYXRlLmRlY2xhcmF0aW9uO1xuICAgIGlmICghdGVtcGxhdGVEZWNsLmlzSW5saW5lKSB7XG4gICAgICBhbmFseXNpcy50ZW1wbGF0ZSA9IHRoaXMuZXh0cmFjdFRlbXBsYXRlKG5vZGUsIHRlbXBsYXRlRGVjbCk7XG4gICAgfVxuXG4gICAgLy8gVXBkYXRlIGFueSBleHRlcm5hbCBzdHlsZXNoZWV0cyBhbmQgcmVidWlsZCB0aGUgY29tYmluZWQgJ3N0eWxlcycgbGlzdC5cbiAgICAvLyBUT0RPKGFseGh1Yik6IHdyaXRlIHRlc3RzIGZvciBzdHlsZXMgd2hlbiB0aGUgcHJpbWFyeSBjb21waWxlciB1c2VzIHRoZSB1cGRhdGVSZXNvdXJjZXMgcGF0aFxuICAgIGxldCBzdHlsZXM6IHN0cmluZ1tdID0gW107XG4gICAgaWYgKGFuYWx5c2lzLnN0eWxlVXJscyAhPT0gbnVsbCkge1xuICAgICAgZm9yIChjb25zdCBzdHlsZVVybCBvZiBhbmFseXNpcy5zdHlsZVVybHMpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCByZXNvbHZlZFN0eWxlVXJsID0gdGhpcy5yZXNvdXJjZUxvYWRlci5yZXNvbHZlKHN0eWxlVXJsLnVybCwgY29udGFpbmluZ0ZpbGUpO1xuICAgICAgICAgIGNvbnN0IHN0eWxlVGV4dCA9IHRoaXMucmVzb3VyY2VMb2FkZXIubG9hZChyZXNvbHZlZFN0eWxlVXJsKTtcbiAgICAgICAgICBzdHlsZXMucHVzaChzdHlsZVRleHQpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgLy8gUmVzb3VyY2UgcmVzb2x2ZSBmYWlsdXJlcyBzaG91bGQgYWxyZWFkeSBiZSBpbiB0aGUgZGlhZ25vc3RpY3MgbGlzdCBmcm9tIHRoZSBhbmFseXplXG4gICAgICAgICAgLy8gc3RhZ2UuIFdlIGRvIG5vdCBuZWVkIHRvIGRvIGFueXRoaW5nIHdpdGggdGhlbSB3aGVuIHVwZGF0aW5nIHJlc291cmNlcy5cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAoYW5hbHlzaXMuaW5saW5lU3R5bGVzICE9PSBudWxsKSB7XG4gICAgICBmb3IgKGNvbnN0IHN0eWxlVGV4dCBvZiBhbmFseXNpcy5pbmxpbmVTdHlsZXMpIHtcbiAgICAgICAgc3R5bGVzLnB1c2goc3R5bGVUZXh0KTtcbiAgICAgIH1cbiAgICB9XG4gICAgZm9yIChjb25zdCBzdHlsZVRleHQgb2YgYW5hbHlzaXMudGVtcGxhdGUuc3R5bGVzKSB7XG4gICAgICBzdHlsZXMucHVzaChzdHlsZVRleHQpO1xuICAgIH1cblxuICAgIGFuYWx5c2lzLm1ldGEuc3R5bGVzID0gc3R5bGVzO1xuICB9XG5cbiAgY29tcGlsZUZ1bGwoXG4gICAgICBub2RlOiBDbGFzc0RlY2xhcmF0aW9uLCBhbmFseXNpczogUmVhZG9ubHk8Q29tcG9uZW50QW5hbHlzaXNEYXRhPixcbiAgICAgIHJlc29sdXRpb246IFJlYWRvbmx5PENvbXBvbmVudFJlc29sdXRpb25EYXRhPiwgcG9vbDogQ29uc3RhbnRQb29sKTogQ29tcGlsZVJlc3VsdFtdIHtcbiAgICBpZiAoYW5hbHlzaXMudGVtcGxhdGUuZXJyb3JzICE9PSBudWxsICYmIGFuYWx5c2lzLnRlbXBsYXRlLmVycm9ycy5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIGNvbnN0IG1ldGE6IFIzQ29tcG9uZW50TWV0YWRhdGEgPSB7Li4uYW5hbHlzaXMubWV0YSwgLi4ucmVzb2x1dGlvbn07XG4gICAgY29uc3QgZmFjID0gY29tcGlsZU5nRmFjdG9yeURlZkZpZWxkKHRvRmFjdG9yeU1ldGFkYXRhKG1ldGEsIEZhY3RvcnlUYXJnZXQuQ29tcG9uZW50KSk7XG4gICAgY29uc3QgZGVmID0gY29tcGlsZUNvbXBvbmVudEZyb21NZXRhZGF0YShtZXRhLCBwb29sLCBtYWtlQmluZGluZ1BhcnNlcigpKTtcbiAgICBjb25zdCBjbGFzc01ldGFkYXRhID0gYW5hbHlzaXMuY2xhc3NNZXRhZGF0YSAhPT0gbnVsbCA/XG4gICAgICAgIGNvbXBpbGVDbGFzc01ldGFkYXRhKGFuYWx5c2lzLmNsYXNzTWV0YWRhdGEpLnRvU3RtdCgpIDpcbiAgICAgICAgbnVsbDtcbiAgICByZXR1cm4gY29tcGlsZVJlc3VsdHMoZmFjLCBkZWYsIGNsYXNzTWV0YWRhdGEsICfJtWNtcCcpO1xuICB9XG5cbiAgY29tcGlsZVBhcnRpYWwoXG4gICAgICBub2RlOiBDbGFzc0RlY2xhcmF0aW9uLCBhbmFseXNpczogUmVhZG9ubHk8Q29tcG9uZW50QW5hbHlzaXNEYXRhPixcbiAgICAgIHJlc29sdXRpb246IFJlYWRvbmx5PENvbXBvbmVudFJlc29sdXRpb25EYXRhPik6IENvbXBpbGVSZXN1bHRbXSB7XG4gICAgaWYgKGFuYWx5c2lzLnRlbXBsYXRlLmVycm9ycyAhPT0gbnVsbCAmJiBhbmFseXNpcy50ZW1wbGF0ZS5lcnJvcnMubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICBjb25zdCB0ZW1wbGF0ZUluZm86IERlY2xhcmVDb21wb25lbnRUZW1wbGF0ZUluZm8gPSB7XG4gICAgICBjb250ZW50OiBhbmFseXNpcy50ZW1wbGF0ZS5jb250ZW50LFxuICAgICAgc291cmNlVXJsOiBhbmFseXNpcy50ZW1wbGF0ZS5kZWNsYXJhdGlvbi5yZXNvbHZlZFRlbXBsYXRlVXJsLFxuICAgICAgaXNJbmxpbmU6IGFuYWx5c2lzLnRlbXBsYXRlLmRlY2xhcmF0aW9uLmlzSW5saW5lLFxuICAgICAgaW5saW5lVGVtcGxhdGVMaXRlcmFsRXhwcmVzc2lvbjogYW5hbHlzaXMudGVtcGxhdGUuc291cmNlTWFwcGluZy50eXBlID09PSAnZGlyZWN0JyA/XG4gICAgICAgICAgbmV3IFdyYXBwZWROb2RlRXhwcihhbmFseXNpcy50ZW1wbGF0ZS5zb3VyY2VNYXBwaW5nLm5vZGUpIDpcbiAgICAgICAgICBudWxsLFxuICAgIH07XG4gICAgY29uc3QgbWV0YTogUjNDb21wb25lbnRNZXRhZGF0YSA9IHsuLi5hbmFseXNpcy5tZXRhLCAuLi5yZXNvbHV0aW9ufTtcbiAgICBjb25zdCBmYWMgPSBjb21waWxlRGVjbGFyZUZhY3RvcnkodG9GYWN0b3J5TWV0YWRhdGEobWV0YSwgRmFjdG9yeVRhcmdldC5Db21wb25lbnQpKTtcbiAgICBjb25zdCBkZWYgPSBjb21waWxlRGVjbGFyZUNvbXBvbmVudEZyb21NZXRhZGF0YShtZXRhLCBhbmFseXNpcy50ZW1wbGF0ZSwgdGVtcGxhdGVJbmZvKTtcbiAgICBjb25zdCBjbGFzc01ldGFkYXRhID0gYW5hbHlzaXMuY2xhc3NNZXRhZGF0YSAhPT0gbnVsbCA/XG4gICAgICAgIGNvbXBpbGVEZWNsYXJlQ2xhc3NNZXRhZGF0YShhbmFseXNpcy5jbGFzc01ldGFkYXRhKS50b1N0bXQoKSA6XG4gICAgICAgIG51bGw7XG4gICAgcmV0dXJuIGNvbXBpbGVSZXN1bHRzKGZhYywgZGVmLCBjbGFzc01ldGFkYXRhLCAnybVjbXAnKTtcbiAgfVxuXG4gIHByaXZhdGUgX3Jlc29sdmVMaXRlcmFsKGRlY29yYXRvcjogRGVjb3JhdG9yKTogdHMuT2JqZWN0TGl0ZXJhbEV4cHJlc3Npb24ge1xuICAgIGlmICh0aGlzLmxpdGVyYWxDYWNoZS5oYXMoZGVjb3JhdG9yKSkge1xuICAgICAgcmV0dXJuIHRoaXMubGl0ZXJhbENhY2hlLmdldChkZWNvcmF0b3IpITtcbiAgICB9XG4gICAgaWYgKGRlY29yYXRvci5hcmdzID09PSBudWxsIHx8IGRlY29yYXRvci5hcmdzLmxlbmd0aCAhPT0gMSkge1xuICAgICAgdGhyb3cgbmV3IEZhdGFsRGlhZ25vc3RpY0Vycm9yKFxuICAgICAgICAgIEVycm9yQ29kZS5ERUNPUkFUT1JfQVJJVFlfV1JPTkcsIERlY29yYXRvci5ub2RlRm9yRXJyb3IoZGVjb3JhdG9yKSxcbiAgICAgICAgICBgSW5jb3JyZWN0IG51bWJlciBvZiBhcmd1bWVudHMgdG8gQENvbXBvbmVudCBkZWNvcmF0b3JgKTtcbiAgICB9XG4gICAgY29uc3QgbWV0YSA9IHVud3JhcEV4cHJlc3Npb24oZGVjb3JhdG9yLmFyZ3NbMF0pO1xuXG4gICAgaWYgKCF0cy5pc09iamVjdExpdGVyYWxFeHByZXNzaW9uKG1ldGEpKSB7XG4gICAgICB0aHJvdyBuZXcgRmF0YWxEaWFnbm9zdGljRXJyb3IoXG4gICAgICAgICAgRXJyb3JDb2RlLkRFQ09SQVRPUl9BUkdfTk9UX0xJVEVSQUwsIG1ldGEsIGBEZWNvcmF0b3IgYXJndW1lbnQgbXVzdCBiZSBsaXRlcmFsLmApO1xuICAgIH1cblxuICAgIHRoaXMubGl0ZXJhbENhY2hlLnNldChkZWNvcmF0b3IsIG1ldGEpO1xuICAgIHJldHVybiBtZXRhO1xuICB9XG5cbiAgcHJpdmF0ZSBfcmVzb2x2ZUVudW1WYWx1ZShcbiAgICAgIGNvbXBvbmVudDogTWFwPHN0cmluZywgdHMuRXhwcmVzc2lvbj4sIGZpZWxkOiBzdHJpbmcsIGVudW1TeW1ib2xOYW1lOiBzdHJpbmcpOiBudW1iZXJ8bnVsbCB7XG4gICAgbGV0IHJlc29sdmVkOiBudW1iZXJ8bnVsbCA9IG51bGw7XG4gICAgaWYgKGNvbXBvbmVudC5oYXMoZmllbGQpKSB7XG4gICAgICBjb25zdCBleHByID0gY29tcG9uZW50LmdldChmaWVsZCkhO1xuICAgICAgY29uc3QgdmFsdWUgPSB0aGlzLmV2YWx1YXRvci5ldmFsdWF0ZShleHByKSBhcyBhbnk7XG4gICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBFbnVtVmFsdWUgJiYgaXNBbmd1bGFyQ29yZVJlZmVyZW5jZSh2YWx1ZS5lbnVtUmVmLCBlbnVtU3ltYm9sTmFtZSkpIHtcbiAgICAgICAgcmVzb2x2ZWQgPSB2YWx1ZS5yZXNvbHZlZCBhcyBudW1iZXI7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBjcmVhdGVWYWx1ZUhhc1dyb25nVHlwZUVycm9yKFxuICAgICAgICAgICAgZXhwciwgdmFsdWUsIGAke2ZpZWxkfSBtdXN0IGJlIGEgbWVtYmVyIG9mICR7ZW51bVN5bWJvbE5hbWV9IGVudW0gZnJvbSBAYW5ndWxhci9jb3JlYCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXNvbHZlZDtcbiAgfVxuXG4gIHByaXZhdGUgX2V4dHJhY3RDb21wb25lbnRTdHlsZVVybHMoXG4gICAgICBjb21wb25lbnQ6IE1hcDxzdHJpbmcsIHRzLkV4cHJlc3Npb24+LFxuICAgICAgKTogU3R5bGVVcmxNZXRhW10ge1xuICAgIGlmICghY29tcG9uZW50Lmhhcygnc3R5bGVVcmxzJykpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fZXh0cmFjdFN0eWxlVXJsc0Zyb21FeHByZXNzaW9uKGNvbXBvbmVudC5nZXQoJ3N0eWxlVXJscycpISk7XG4gIH1cblxuICBwcml2YXRlIF9leHRyYWN0U3R5bGVVcmxzRnJvbUV4cHJlc3Npb24oc3R5bGVVcmxzRXhwcjogdHMuRXhwcmVzc2lvbik6IFN0eWxlVXJsTWV0YVtdIHtcbiAgICBjb25zdCBzdHlsZVVybHM6IFN0eWxlVXJsTWV0YVtdID0gW107XG5cbiAgICBpZiAodHMuaXNBcnJheUxpdGVyYWxFeHByZXNzaW9uKHN0eWxlVXJsc0V4cHIpKSB7XG4gICAgICBmb3IgKGNvbnN0IHN0eWxlVXJsRXhwciBvZiBzdHlsZVVybHNFeHByLmVsZW1lbnRzKSB7XG4gICAgICAgIGlmICh0cy5pc1NwcmVhZEVsZW1lbnQoc3R5bGVVcmxFeHByKSkge1xuICAgICAgICAgIHN0eWxlVXJscy5wdXNoKC4uLnRoaXMuX2V4dHJhY3RTdHlsZVVybHNGcm9tRXhwcmVzc2lvbihzdHlsZVVybEV4cHIuZXhwcmVzc2lvbikpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnN0IHN0eWxlVXJsID0gdGhpcy5ldmFsdWF0b3IuZXZhbHVhdGUoc3R5bGVVcmxFeHByKTtcblxuICAgICAgICAgIGlmICh0eXBlb2Ygc3R5bGVVcmwgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICB0aHJvdyBjcmVhdGVWYWx1ZUhhc1dyb25nVHlwZUVycm9yKHN0eWxlVXJsRXhwciwgc3R5bGVVcmwsICdzdHlsZVVybCBtdXN0IGJlIGEgc3RyaW5nJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgc3R5bGVVcmxzLnB1c2goe1xuICAgICAgICAgICAgdXJsOiBzdHlsZVVybCxcbiAgICAgICAgICAgIHNvdXJjZTogUmVzb3VyY2VUeXBlRm9yRGlhZ25vc3RpY3MuU3R5bGVzaGVldEZyb21EZWNvcmF0b3IsXG4gICAgICAgICAgICBub2RlRm9yRXJyb3I6IHN0eWxlVXJsRXhwcixcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBldmFsdWF0ZWRTdHlsZVVybHMgPSB0aGlzLmV2YWx1YXRvci5ldmFsdWF0ZShzdHlsZVVybHNFeHByKTtcbiAgICAgIGlmICghaXNTdHJpbmdBcnJheShldmFsdWF0ZWRTdHlsZVVybHMpKSB7XG4gICAgICAgIHRocm93IGNyZWF0ZVZhbHVlSGFzV3JvbmdUeXBlRXJyb3IoXG4gICAgICAgICAgICBzdHlsZVVybHNFeHByLCBldmFsdWF0ZWRTdHlsZVVybHMsICdzdHlsZVVybHMgbXVzdCBiZSBhbiBhcnJheSBvZiBzdHJpbmdzJyk7XG4gICAgICB9XG5cbiAgICAgIGZvciAoY29uc3Qgc3R5bGVVcmwgb2YgZXZhbHVhdGVkU3R5bGVVcmxzKSB7XG4gICAgICAgIHN0eWxlVXJscy5wdXNoKHtcbiAgICAgICAgICB1cmw6IHN0eWxlVXJsLFxuICAgICAgICAgIHNvdXJjZTogUmVzb3VyY2VUeXBlRm9yRGlhZ25vc3RpY3MuU3R5bGVzaGVldEZyb21EZWNvcmF0b3IsXG4gICAgICAgICAgbm9kZUZvckVycm9yOiBzdHlsZVVybHNFeHByLFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gc3R5bGVVcmxzO1xuICB9XG5cbiAgcHJpdmF0ZSBfZXh0cmFjdFN0eWxlUmVzb3VyY2VzKGNvbXBvbmVudDogTWFwPHN0cmluZywgdHMuRXhwcmVzc2lvbj4sIGNvbnRhaW5pbmdGaWxlOiBzdHJpbmcpOlxuICAgICAgUmVhZG9ubHlTZXQ8UmVzb3VyY2U+IHtcbiAgICBjb25zdCBzdHlsZXMgPSBuZXcgU2V0PFJlc291cmNlPigpO1xuICAgIGZ1bmN0aW9uIHN0cmluZ0xpdGVyYWxFbGVtZW50cyhhcnJheTogdHMuQXJyYXlMaXRlcmFsRXhwcmVzc2lvbik6IHRzLlN0cmluZ0xpdGVyYWxMaWtlW10ge1xuICAgICAgcmV0dXJuIGFycmF5LmVsZW1lbnRzLmZpbHRlcihcbiAgICAgICAgICAoZTogdHMuRXhwcmVzc2lvbik6IGUgaXMgdHMuU3RyaW5nTGl0ZXJhbExpa2UgPT4gdHMuaXNTdHJpbmdMaXRlcmFsTGlrZShlKSk7XG4gICAgfVxuXG4gICAgLy8gSWYgc3R5bGVVcmxzIGlzIGEgbGl0ZXJhbCBhcnJheSwgcHJvY2VzcyBlYWNoIHJlc291cmNlIHVybCBpbmRpdmlkdWFsbHkgYW5kXG4gICAgLy8gcmVnaXN0ZXIgb25lcyB0aGF0IGFyZSBzdHJpbmcgbGl0ZXJhbHMuXG4gICAgY29uc3Qgc3R5bGVVcmxzRXhwciA9IGNvbXBvbmVudC5nZXQoJ3N0eWxlVXJscycpO1xuICAgIGlmIChzdHlsZVVybHNFeHByICE9PSB1bmRlZmluZWQgJiYgdHMuaXNBcnJheUxpdGVyYWxFeHByZXNzaW9uKHN0eWxlVXJsc0V4cHIpKSB7XG4gICAgICBmb3IgKGNvbnN0IGV4cHJlc3Npb24gb2Ygc3RyaW5nTGl0ZXJhbEVsZW1lbnRzKHN0eWxlVXJsc0V4cHIpKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3QgcmVzb3VyY2VVcmwgPSB0aGlzLnJlc291cmNlTG9hZGVyLnJlc29sdmUoZXhwcmVzc2lvbi50ZXh0LCBjb250YWluaW5nRmlsZSk7XG4gICAgICAgICAgc3R5bGVzLmFkZCh7cGF0aDogYWJzb2x1dGVGcm9tKHJlc291cmNlVXJsKSwgZXhwcmVzc2lvbn0pO1xuICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAvLyBFcnJvcnMgaW4gc3R5bGUgcmVzb3VyY2UgZXh0cmFjdGlvbiBkbyBub3QgbmVlZCB0byBiZSBoYW5kbGVkIGhlcmUuIFdlIHdpbGwgcHJvZHVjZVxuICAgICAgICAgIC8vIGRpYWdub3N0aWNzIGZvciBlYWNoIG9uZSB0aGF0IGZhaWxzIGluIHRoZSBhbmFseXNpcywgYWZ0ZXIgd2UgZXZhbHVhdGUgdGhlIGBzdHlsZVVybHNgXG4gICAgICAgICAgLy8gZXhwcmVzc2lvbiB0byBkZXRlcm1pbmUgX2FsbF8gc3R5bGUgcmVzb3VyY2VzLCBub3QganVzdCB0aGUgc3RyaW5nIGxpdGVyYWxzLlxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3Qgc3R5bGVzRXhwciA9IGNvbXBvbmVudC5nZXQoJ3N0eWxlcycpO1xuICAgIGlmIChzdHlsZXNFeHByICE9PSB1bmRlZmluZWQgJiYgdHMuaXNBcnJheUxpdGVyYWxFeHByZXNzaW9uKHN0eWxlc0V4cHIpKSB7XG4gICAgICBmb3IgKGNvbnN0IGV4cHJlc3Npb24gb2Ygc3RyaW5nTGl0ZXJhbEVsZW1lbnRzKHN0eWxlc0V4cHIpKSB7XG4gICAgICAgIHN0eWxlcy5hZGQoe3BhdGg6IG51bGwsIGV4cHJlc3Npb259KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gc3R5bGVzO1xuICB9XG5cbiAgcHJpdmF0ZSBfcHJlbG9hZEFuZFBhcnNlVGVtcGxhdGUoXG4gICAgICBub2RlOiBDbGFzc0RlY2xhcmF0aW9uLCBkZWNvcmF0b3I6IERlY29yYXRvciwgY29tcG9uZW50OiBNYXA8c3RyaW5nLCB0cy5FeHByZXNzaW9uPixcbiAgICAgIGNvbnRhaW5pbmdGaWxlOiBzdHJpbmcpOiBQcm9taXNlPFBhcnNlZFRlbXBsYXRlV2l0aFNvdXJjZXxudWxsPiB7XG4gICAgaWYgKGNvbXBvbmVudC5oYXMoJ3RlbXBsYXRlVXJsJykpIHtcbiAgICAgIC8vIEV4dHJhY3QgdGhlIHRlbXBsYXRlVXJsIGFuZCBwcmVsb2FkIGl0LlxuICAgICAgY29uc3QgdGVtcGxhdGVVcmxFeHByID0gY29tcG9uZW50LmdldCgndGVtcGxhdGVVcmwnKSE7XG4gICAgICBjb25zdCB0ZW1wbGF0ZVVybCA9IHRoaXMuZXZhbHVhdG9yLmV2YWx1YXRlKHRlbXBsYXRlVXJsRXhwcik7XG4gICAgICBpZiAodHlwZW9mIHRlbXBsYXRlVXJsICE9PSAnc3RyaW5nJykge1xuICAgICAgICB0aHJvdyBjcmVhdGVWYWx1ZUhhc1dyb25nVHlwZUVycm9yKFxuICAgICAgICAgICAgdGVtcGxhdGVVcmxFeHByLCB0ZW1wbGF0ZVVybCwgJ3RlbXBsYXRlVXJsIG11c3QgYmUgYSBzdHJpbmcnKTtcbiAgICAgIH1cbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc291cmNlVXJsID0gdGhpcy5yZXNvdXJjZUxvYWRlci5yZXNvbHZlKHRlbXBsYXRlVXJsLCBjb250YWluaW5nRmlsZSk7XG4gICAgICAgIGNvbnN0IHRlbXBsYXRlUHJvbWlzZSA9XG4gICAgICAgICAgICB0aGlzLnJlc291cmNlTG9hZGVyLnByZWxvYWQocmVzb3VyY2VVcmwsIHt0eXBlOiAndGVtcGxhdGUnLCBjb250YWluaW5nRmlsZX0pO1xuXG4gICAgICAgIC8vIElmIHRoZSBwcmVsb2FkIHdvcmtlZCwgdGhlbiBhY3R1YWxseSBsb2FkIGFuZCBwYXJzZSB0aGUgdGVtcGxhdGUsIGFuZCB3YWl0IGZvciBhbnkgc3R5bGVcbiAgICAgICAgLy8gVVJMcyB0byByZXNvbHZlLlxuICAgICAgICBpZiAodGVtcGxhdGVQcm9taXNlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICByZXR1cm4gdGVtcGxhdGVQcm9taXNlLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgdGVtcGxhdGVEZWNsID1cbiAgICAgICAgICAgICAgICB0aGlzLnBhcnNlVGVtcGxhdGVEZWNsYXJhdGlvbihkZWNvcmF0b3IsIGNvbXBvbmVudCwgY29udGFpbmluZ0ZpbGUpO1xuICAgICAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB0aGlzLmV4dHJhY3RUZW1wbGF0ZShub2RlLCB0ZW1wbGF0ZURlY2wpO1xuICAgICAgICAgICAgdGhpcy5wcmVhbmFseXplVGVtcGxhdGVDYWNoZS5zZXQobm9kZSwgdGVtcGxhdGUpO1xuICAgICAgICAgICAgcmV0dXJuIHRlbXBsYXRlO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobnVsbCk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgdGhyb3cgdGhpcy5tYWtlUmVzb3VyY2VOb3RGb3VuZEVycm9yKFxuICAgICAgICAgICAgdGVtcGxhdGVVcmwsIHRlbXBsYXRlVXJsRXhwciwgUmVzb3VyY2VUeXBlRm9yRGlhZ25vc3RpY3MuVGVtcGxhdGUpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCB0ZW1wbGF0ZURlY2wgPSB0aGlzLnBhcnNlVGVtcGxhdGVEZWNsYXJhdGlvbihkZWNvcmF0b3IsIGNvbXBvbmVudCwgY29udGFpbmluZ0ZpbGUpO1xuICAgICAgY29uc3QgdGVtcGxhdGUgPSB0aGlzLmV4dHJhY3RUZW1wbGF0ZShub2RlLCB0ZW1wbGF0ZURlY2wpO1xuICAgICAgdGhpcy5wcmVhbmFseXplVGVtcGxhdGVDYWNoZS5zZXQobm9kZSwgdGVtcGxhdGUpO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0ZW1wbGF0ZSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBleHRyYWN0VGVtcGxhdGUobm9kZTogQ2xhc3NEZWNsYXJhdGlvbiwgdGVtcGxhdGU6IFRlbXBsYXRlRGVjbGFyYXRpb24pOlxuICAgICAgUGFyc2VkVGVtcGxhdGVXaXRoU291cmNlIHtcbiAgICBpZiAodGVtcGxhdGUuaXNJbmxpbmUpIHtcbiAgICAgIGxldCBzb3VyY2VTdHI6IHN0cmluZztcbiAgICAgIGxldCBzb3VyY2VQYXJzZVJhbmdlOiBMZXhlclJhbmdlfG51bGwgPSBudWxsO1xuICAgICAgbGV0IHRlbXBsYXRlQ29udGVudDogc3RyaW5nO1xuICAgICAgbGV0IHNvdXJjZU1hcHBpbmc6IFRlbXBsYXRlU291cmNlTWFwcGluZztcbiAgICAgIGxldCBlc2NhcGVkU3RyaW5nID0gZmFsc2U7XG4gICAgICBsZXQgc291cmNlTWFwVXJsOiBzdHJpbmd8bnVsbDtcbiAgICAgIC8vIFdlIG9ubHkgc3VwcG9ydCBTb3VyY2VNYXBzIGZvciBpbmxpbmUgdGVtcGxhdGVzIHRoYXQgYXJlIHNpbXBsZSBzdHJpbmcgbGl0ZXJhbHMuXG4gICAgICBpZiAodHMuaXNTdHJpbmdMaXRlcmFsKHRlbXBsYXRlLmV4cHJlc3Npb24pIHx8XG4gICAgICAgICAgdHMuaXNOb1N1YnN0aXR1dGlvblRlbXBsYXRlTGl0ZXJhbCh0ZW1wbGF0ZS5leHByZXNzaW9uKSkge1xuICAgICAgICAvLyB0aGUgc3RhcnQgYW5kIGVuZCBvZiB0aGUgYHRlbXBsYXRlRXhwcmAgbm9kZSBpbmNsdWRlcyB0aGUgcXVvdGF0aW9uIG1hcmtzLCB3aGljaCB3ZSBtdXN0XG4gICAgICAgIC8vIHN0cmlwXG4gICAgICAgIHNvdXJjZVBhcnNlUmFuZ2UgPSBnZXRUZW1wbGF0ZVJhbmdlKHRlbXBsYXRlLmV4cHJlc3Npb24pO1xuICAgICAgICBzb3VyY2VTdHIgPSB0ZW1wbGF0ZS5leHByZXNzaW9uLmdldFNvdXJjZUZpbGUoKS50ZXh0O1xuICAgICAgICB0ZW1wbGF0ZUNvbnRlbnQgPSB0ZW1wbGF0ZS5leHByZXNzaW9uLnRleHQ7XG4gICAgICAgIGVzY2FwZWRTdHJpbmcgPSB0cnVlO1xuICAgICAgICBzb3VyY2VNYXBwaW5nID0ge1xuICAgICAgICAgIHR5cGU6ICdkaXJlY3QnLFxuICAgICAgICAgIG5vZGU6IHRlbXBsYXRlLmV4cHJlc3Npb24sXG4gICAgICAgIH07XG4gICAgICAgIHNvdXJjZU1hcFVybCA9IHRlbXBsYXRlLnJlc29sdmVkVGVtcGxhdGVVcmw7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCByZXNvbHZlZFRlbXBsYXRlID0gdGhpcy5ldmFsdWF0b3IuZXZhbHVhdGUodGVtcGxhdGUuZXhwcmVzc2lvbik7XG4gICAgICAgIGlmICh0eXBlb2YgcmVzb2x2ZWRUZW1wbGF0ZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICB0aHJvdyBjcmVhdGVWYWx1ZUhhc1dyb25nVHlwZUVycm9yKFxuICAgICAgICAgICAgICB0ZW1wbGF0ZS5leHByZXNzaW9uLCByZXNvbHZlZFRlbXBsYXRlLCAndGVtcGxhdGUgbXVzdCBiZSBhIHN0cmluZycpO1xuICAgICAgICB9XG4gICAgICAgIC8vIFdlIGRvIG5vdCBwYXJzZSB0aGUgdGVtcGxhdGUgZGlyZWN0bHkgZnJvbSB0aGUgc291cmNlIGZpbGUgdXNpbmcgYSBsZXhlciByYW5nZSwgc29cbiAgICAgICAgLy8gdGhlIHRlbXBsYXRlIHNvdXJjZSBhbmQgY29udGVudCBhcmUgc2V0IHRvIHRoZSBzdGF0aWNhbGx5IHJlc29sdmVkIHRlbXBsYXRlLlxuICAgICAgICBzb3VyY2VTdHIgPSByZXNvbHZlZFRlbXBsYXRlO1xuICAgICAgICB0ZW1wbGF0ZUNvbnRlbnQgPSByZXNvbHZlZFRlbXBsYXRlO1xuICAgICAgICBzb3VyY2VNYXBwaW5nID0ge1xuICAgICAgICAgIHR5cGU6ICdpbmRpcmVjdCcsXG4gICAgICAgICAgbm9kZTogdGVtcGxhdGUuZXhwcmVzc2lvbixcbiAgICAgICAgICBjb21wb25lbnRDbGFzczogbm9kZSxcbiAgICAgICAgICB0ZW1wbGF0ZTogdGVtcGxhdGVDb250ZW50LFxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIEluZGlyZWN0IHRlbXBsYXRlcyBjYW5ub3QgYmUgbWFwcGVkIHRvIGEgcGFydGljdWxhciBieXRlIHJhbmdlIG9mIGFueSBpbnB1dCBmaWxlLCBzaW5jZVxuICAgICAgICAvLyB0aGV5J3JlIGNvbXB1dGVkIGJ5IGV4cHJlc3Npb25zIHRoYXQgbWF5IHNwYW4gbWFueSBmaWxlcy4gRG9uJ3QgYXR0ZW1wdCB0byBtYXAgdGhlbSBiYWNrXG4gICAgICAgIC8vIHRvIGEgZ2l2ZW4gZmlsZS5cbiAgICAgICAgc291cmNlTWFwVXJsID0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4udGhpcy5fcGFyc2VUZW1wbGF0ZSh0ZW1wbGF0ZSwgc291cmNlU3RyLCBzb3VyY2VQYXJzZVJhbmdlLCBlc2NhcGVkU3RyaW5nLCBzb3VyY2VNYXBVcmwpLFxuICAgICAgICBjb250ZW50OiB0ZW1wbGF0ZUNvbnRlbnQsXG4gICAgICAgIHNvdXJjZU1hcHBpbmcsXG4gICAgICAgIGRlY2xhcmF0aW9uOiB0ZW1wbGF0ZSxcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHRlbXBsYXRlQ29udGVudCA9IHRoaXMucmVzb3VyY2VMb2FkZXIubG9hZCh0ZW1wbGF0ZS5yZXNvbHZlZFRlbXBsYXRlVXJsKTtcbiAgICAgIGlmICh0aGlzLmRlcFRyYWNrZXIgIT09IG51bGwpIHtcbiAgICAgICAgdGhpcy5kZXBUcmFja2VyLmFkZFJlc291cmNlRGVwZW5kZW5jeShcbiAgICAgICAgICAgIG5vZGUuZ2V0U291cmNlRmlsZSgpLCBhYnNvbHV0ZUZyb20odGVtcGxhdGUucmVzb2x2ZWRUZW1wbGF0ZVVybCkpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4ge1xuICAgICAgICAuLi50aGlzLl9wYXJzZVRlbXBsYXRlKFxuICAgICAgICAgICAgdGVtcGxhdGUsIC8qIHNvdXJjZVN0ciAqLyB0ZW1wbGF0ZUNvbnRlbnQsIC8qIHNvdXJjZVBhcnNlUmFuZ2UgKi8gbnVsbCxcbiAgICAgICAgICAgIC8qIGVzY2FwZWRTdHJpbmcgKi8gZmFsc2UsXG4gICAgICAgICAgICAvKiBzb3VyY2VNYXBVcmwgKi8gdGVtcGxhdGUucmVzb2x2ZWRUZW1wbGF0ZVVybCksXG4gICAgICAgIGNvbnRlbnQ6IHRlbXBsYXRlQ29udGVudCxcbiAgICAgICAgc291cmNlTWFwcGluZzoge1xuICAgICAgICAgIHR5cGU6ICdleHRlcm5hbCcsXG4gICAgICAgICAgY29tcG9uZW50Q2xhc3M6IG5vZGUsXG4gICAgICAgICAgLy8gVE9ETyhhbHhodWIpOiBUUyBpbiBnMyBpcyB1bmFibGUgdG8gbWFrZSB0aGlzIGluZmVyZW5jZSBvbiBpdHMgb3duLCBzbyBjYXN0IGl0IGhlcmVcbiAgICAgICAgICAvLyB1bnRpbCBnMyBpcyBhYmxlIHRvIGZpZ3VyZSB0aGlzIG91dC5cbiAgICAgICAgICBub2RlOiAodGVtcGxhdGUgYXMgRXh0ZXJuYWxUZW1wbGF0ZURlY2xhcmF0aW9uKS50ZW1wbGF0ZVVybEV4cHJlc3Npb24sXG4gICAgICAgICAgdGVtcGxhdGU6IHRlbXBsYXRlQ29udGVudCxcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogdGVtcGxhdGUucmVzb2x2ZWRUZW1wbGF0ZVVybCxcbiAgICAgICAgfSxcbiAgICAgICAgZGVjbGFyYXRpb246IHRlbXBsYXRlLFxuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9wYXJzZVRlbXBsYXRlKFxuICAgICAgdGVtcGxhdGU6IFRlbXBsYXRlRGVjbGFyYXRpb24sIHNvdXJjZVN0cjogc3RyaW5nLCBzb3VyY2VQYXJzZVJhbmdlOiBMZXhlclJhbmdlfG51bGwsXG4gICAgICBlc2NhcGVkU3RyaW5nOiBib29sZWFuLCBzb3VyY2VNYXBVcmw6IHN0cmluZ3xudWxsKTogUGFyc2VkQ29tcG9uZW50VGVtcGxhdGUge1xuICAgIC8vIFdlIGFsd2F5cyBub3JtYWxpemUgbGluZSBlbmRpbmdzIGlmIHRoZSB0ZW1wbGF0ZSBoYXMgYmVlbiBlc2NhcGVkIChpLmUuIGlzIGlubGluZSkuXG4gICAgY29uc3QgaTE4bk5vcm1hbGl6ZUxpbmVFbmRpbmdzSW5JQ1VzID0gZXNjYXBlZFN0cmluZyB8fCB0aGlzLmkxOG5Ob3JtYWxpemVMaW5lRW5kaW5nc0luSUNVcztcblxuICAgIGNvbnN0IHBhcnNlZFRlbXBsYXRlID0gcGFyc2VUZW1wbGF0ZShzb3VyY2VTdHIsIHNvdXJjZU1hcFVybCA/PyAnJywge1xuICAgICAgcHJlc2VydmVXaGl0ZXNwYWNlczogdGVtcGxhdGUucHJlc2VydmVXaGl0ZXNwYWNlcyxcbiAgICAgIGludGVycG9sYXRpb25Db25maWc6IHRlbXBsYXRlLmludGVycG9sYXRpb25Db25maWcsXG4gICAgICByYW5nZTogc291cmNlUGFyc2VSYW5nZSA/PyB1bmRlZmluZWQsXG4gICAgICBlc2NhcGVkU3RyaW5nLFxuICAgICAgZW5hYmxlSTE4bkxlZ2FjeU1lc3NhZ2VJZEZvcm1hdDogdGhpcy5lbmFibGVJMThuTGVnYWN5TWVzc2FnZUlkRm9ybWF0LFxuICAgICAgaTE4bk5vcm1hbGl6ZUxpbmVFbmRpbmdzSW5JQ1VzLFxuICAgICAgYWx3YXlzQXR0ZW1wdEh0bWxUb1IzQXN0Q29udmVyc2lvbjogdGhpcy51c2VQb2lzb25lZERhdGEsXG4gICAgfSk7XG5cbiAgICAvLyBVbmZvcnR1bmF0ZWx5LCB0aGUgcHJpbWFyeSBwYXJzZSBvZiB0aGUgdGVtcGxhdGUgYWJvdmUgbWF5IG5vdCBjb250YWluIGFjY3VyYXRlIHNvdXJjZSBtYXBcbiAgICAvLyBpbmZvcm1hdGlvbi4gSWYgdXNlZCBkaXJlY3RseSwgaXQgd291bGQgcmVzdWx0IGluIGluY29ycmVjdCBjb2RlIGxvY2F0aW9ucyBpbiB0ZW1wbGF0ZVxuICAgIC8vIGVycm9ycywgZXRjLiBUaGVyZSBhcmUgdGhyZWUgbWFpbiBwcm9ibGVtczpcbiAgICAvL1xuICAgIC8vIDEuIGBwcmVzZXJ2ZVdoaXRlc3BhY2VzOiBmYWxzZWAgYW5uaWhpbGF0ZXMgdGhlIGNvcnJlY3RuZXNzIG9mIHRlbXBsYXRlIHNvdXJjZSBtYXBwaW5nLCBhc1xuICAgIC8vICAgIHRoZSB3aGl0ZXNwYWNlIHRyYW5zZm9ybWF0aW9uIGNoYW5nZXMgdGhlIGNvbnRlbnRzIG9mIEhUTUwgdGV4dCBub2RlcyBiZWZvcmUgdGhleSdyZVxuICAgIC8vICAgIHBhcnNlZCBpbnRvIEFuZ3VsYXIgZXhwcmVzc2lvbnMuXG4gICAgLy8gMi4gYHByZXNlcnZlTGluZUVuZGluZ3M6IGZhbHNlYCBjYXVzZXMgZ3Jvd2luZyBtaXNhbGlnbm1lbnRzIGluIHRlbXBsYXRlcyB0aGF0IHVzZSAnXFxyXFxuJ1xuICAgIC8vICAgIGxpbmUgZW5kaW5ncywgYnkgbm9ybWFsaXppbmcgdGhlbSB0byAnXFxuJy5cbiAgICAvLyAzLiBCeSBkZWZhdWx0LCB0aGUgdGVtcGxhdGUgcGFyc2VyIHN0cmlwcyBsZWFkaW5nIHRyaXZpYSBjaGFyYWN0ZXJzIChsaWtlIHNwYWNlcywgdGFicywgYW5kXG4gICAgLy8gICAgbmV3bGluZXMpLiBUaGlzIGFsc28gZGVzdHJveXMgc291cmNlIG1hcHBpbmcgaW5mb3JtYXRpb24uXG4gICAgLy9cbiAgICAvLyBJbiBvcmRlciB0byBndWFyYW50ZWUgdGhlIGNvcnJlY3RuZXNzIG9mIGRpYWdub3N0aWNzLCB0ZW1wbGF0ZXMgYXJlIHBhcnNlZCBhIHNlY29uZCB0aW1lXG4gICAgLy8gd2l0aCB0aGUgYWJvdmUgb3B0aW9ucyBzZXQgdG8gcHJlc2VydmUgc291cmNlIG1hcHBpbmdzLlxuXG4gICAgY29uc3Qge25vZGVzOiBkaWFnTm9kZXN9ID0gcGFyc2VUZW1wbGF0ZShzb3VyY2VTdHIsIHNvdXJjZU1hcFVybCA/PyAnJywge1xuICAgICAgcHJlc2VydmVXaGl0ZXNwYWNlczogdHJ1ZSxcbiAgICAgIHByZXNlcnZlTGluZUVuZGluZ3M6IHRydWUsXG4gICAgICBpbnRlcnBvbGF0aW9uQ29uZmlnOiB0ZW1wbGF0ZS5pbnRlcnBvbGF0aW9uQ29uZmlnLFxuICAgICAgcmFuZ2U6IHNvdXJjZVBhcnNlUmFuZ2UgPz8gdW5kZWZpbmVkLFxuICAgICAgZXNjYXBlZFN0cmluZyxcbiAgICAgIGVuYWJsZUkxOG5MZWdhY3lNZXNzYWdlSWRGb3JtYXQ6IHRoaXMuZW5hYmxlSTE4bkxlZ2FjeU1lc3NhZ2VJZEZvcm1hdCxcbiAgICAgIGkxOG5Ob3JtYWxpemVMaW5lRW5kaW5nc0luSUNVcyxcbiAgICAgIGxlYWRpbmdUcml2aWFDaGFyczogW10sXG4gICAgICBhbHdheXNBdHRlbXB0SHRtbFRvUjNBc3RDb252ZXJzaW9uOiB0aGlzLnVzZVBvaXNvbmVkRGF0YSxcbiAgICB9KTtcblxuICAgIHJldHVybiB7XG4gICAgICAuLi5wYXJzZWRUZW1wbGF0ZSxcbiAgICAgIGRpYWdOb2RlcyxcbiAgICAgIGZpbGU6IG5ldyBQYXJzZVNvdXJjZUZpbGUoc291cmNlU3RyLCBzb3VyY2VNYXBVcmwgPz8gJycpLFxuICAgIH07XG4gIH1cblxuICBwcml2YXRlIHBhcnNlVGVtcGxhdGVEZWNsYXJhdGlvbihcbiAgICAgIGRlY29yYXRvcjogRGVjb3JhdG9yLCBjb21wb25lbnQ6IE1hcDxzdHJpbmcsIHRzLkV4cHJlc3Npb24+LFxuICAgICAgY29udGFpbmluZ0ZpbGU6IHN0cmluZyk6IFRlbXBsYXRlRGVjbGFyYXRpb24ge1xuICAgIGxldCBwcmVzZXJ2ZVdoaXRlc3BhY2VzOiBib29sZWFuID0gdGhpcy5kZWZhdWx0UHJlc2VydmVXaGl0ZXNwYWNlcztcbiAgICBpZiAoY29tcG9uZW50LmhhcygncHJlc2VydmVXaGl0ZXNwYWNlcycpKSB7XG4gICAgICBjb25zdCBleHByID0gY29tcG9uZW50LmdldCgncHJlc2VydmVXaGl0ZXNwYWNlcycpITtcbiAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5ldmFsdWF0b3IuZXZhbHVhdGUoZXhwcik7XG4gICAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnYm9vbGVhbicpIHtcbiAgICAgICAgdGhyb3cgY3JlYXRlVmFsdWVIYXNXcm9uZ1R5cGVFcnJvcihleHByLCB2YWx1ZSwgJ3ByZXNlcnZlV2hpdGVzcGFjZXMgbXVzdCBiZSBhIGJvb2xlYW4nKTtcbiAgICAgIH1cbiAgICAgIHByZXNlcnZlV2hpdGVzcGFjZXMgPSB2YWx1ZTtcbiAgICB9XG5cbiAgICBsZXQgaW50ZXJwb2xhdGlvbkNvbmZpZyA9IERFRkFVTFRfSU5URVJQT0xBVElPTl9DT05GSUc7XG4gICAgaWYgKGNvbXBvbmVudC5oYXMoJ2ludGVycG9sYXRpb24nKSkge1xuICAgICAgY29uc3QgZXhwciA9IGNvbXBvbmVudC5nZXQoJ2ludGVycG9sYXRpb24nKSE7XG4gICAgICBjb25zdCB2YWx1ZSA9IHRoaXMuZXZhbHVhdG9yLmV2YWx1YXRlKGV4cHIpO1xuICAgICAgaWYgKCFBcnJheS5pc0FycmF5KHZhbHVlKSB8fCB2YWx1ZS5sZW5ndGggIT09IDIgfHxcbiAgICAgICAgICAhdmFsdWUuZXZlcnkoZWxlbWVudCA9PiB0eXBlb2YgZWxlbWVudCA9PT0gJ3N0cmluZycpKSB7XG4gICAgICAgIHRocm93IGNyZWF0ZVZhbHVlSGFzV3JvbmdUeXBlRXJyb3IoXG4gICAgICAgICAgICBleHByLCB2YWx1ZSwgJ2ludGVycG9sYXRpb24gbXVzdCBiZSBhbiBhcnJheSB3aXRoIDIgZWxlbWVudHMgb2Ygc3RyaW5nIHR5cGUnKTtcbiAgICAgIH1cbiAgICAgIGludGVycG9sYXRpb25Db25maWcgPSBJbnRlcnBvbGF0aW9uQ29uZmlnLmZyb21BcnJheSh2YWx1ZSBhcyBbc3RyaW5nLCBzdHJpbmddKTtcbiAgICB9XG5cbiAgICBpZiAoY29tcG9uZW50LmhhcygndGVtcGxhdGVVcmwnKSkge1xuICAgICAgY29uc3QgdGVtcGxhdGVVcmxFeHByID0gY29tcG9uZW50LmdldCgndGVtcGxhdGVVcmwnKSE7XG4gICAgICBjb25zdCB0ZW1wbGF0ZVVybCA9IHRoaXMuZXZhbHVhdG9yLmV2YWx1YXRlKHRlbXBsYXRlVXJsRXhwcik7XG4gICAgICBpZiAodHlwZW9mIHRlbXBsYXRlVXJsICE9PSAnc3RyaW5nJykge1xuICAgICAgICB0aHJvdyBjcmVhdGVWYWx1ZUhhc1dyb25nVHlwZUVycm9yKFxuICAgICAgICAgICAgdGVtcGxhdGVVcmxFeHByLCB0ZW1wbGF0ZVVybCwgJ3RlbXBsYXRlVXJsIG11c3QgYmUgYSBzdHJpbmcnKTtcbiAgICAgIH1cbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc291cmNlVXJsID0gdGhpcy5yZXNvdXJjZUxvYWRlci5yZXNvbHZlKHRlbXBsYXRlVXJsLCBjb250YWluaW5nRmlsZSk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaXNJbmxpbmU6IGZhbHNlLFxuICAgICAgICAgIGludGVycG9sYXRpb25Db25maWcsXG4gICAgICAgICAgcHJlc2VydmVXaGl0ZXNwYWNlcyxcbiAgICAgICAgICB0ZW1wbGF0ZVVybCxcbiAgICAgICAgICB0ZW1wbGF0ZVVybEV4cHJlc3Npb246IHRlbXBsYXRlVXJsRXhwcixcbiAgICAgICAgICByZXNvbHZlZFRlbXBsYXRlVXJsOiByZXNvdXJjZVVybCxcbiAgICAgICAgfTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgdGhyb3cgdGhpcy5tYWtlUmVzb3VyY2VOb3RGb3VuZEVycm9yKFxuICAgICAgICAgICAgdGVtcGxhdGVVcmwsIHRlbXBsYXRlVXJsRXhwciwgUmVzb3VyY2VUeXBlRm9yRGlhZ25vc3RpY3MuVGVtcGxhdGUpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoY29tcG9uZW50LmhhcygndGVtcGxhdGUnKSkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgaXNJbmxpbmU6IHRydWUsXG4gICAgICAgIGludGVycG9sYXRpb25Db25maWcsXG4gICAgICAgIHByZXNlcnZlV2hpdGVzcGFjZXMsXG4gICAgICAgIGV4cHJlc3Npb246IGNvbXBvbmVudC5nZXQoJ3RlbXBsYXRlJykhLFxuICAgICAgICB0ZW1wbGF0ZVVybDogY29udGFpbmluZ0ZpbGUsXG4gICAgICAgIHJlc29sdmVkVGVtcGxhdGVVcmw6IGNvbnRhaW5pbmdGaWxlLFxuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEZhdGFsRGlhZ25vc3RpY0Vycm9yKFxuICAgICAgICAgIEVycm9yQ29kZS5DT01QT05FTlRfTUlTU0lOR19URU1QTEFURSwgRGVjb3JhdG9yLm5vZGVGb3JFcnJvcihkZWNvcmF0b3IpLFxuICAgICAgICAgICdjb21wb25lbnQgaXMgbWlzc2luZyBhIHRlbXBsYXRlJyk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfcmVzb2x2ZUltcG9ydGVkRmlsZShpbXBvcnRlZEZpbGU6IEltcG9ydGVkRmlsZSwgZXhwcjogRXhwcmVzc2lvbiwgb3JpZ2luOiB0cy5Tb3VyY2VGaWxlKTpcbiAgICAgIHRzLlNvdXJjZUZpbGV8bnVsbCB7XG4gICAgLy8gSWYgYGltcG9ydGVkRmlsZWAgaXMgbm90ICd1bmtub3duJyB0aGVuIGl0IGFjY3VyYXRlbHkgcmVmbGVjdHMgdGhlIHNvdXJjZSBmaWxlIHRoYXQgaXNcbiAgICAvLyBiZWluZyBpbXBvcnRlZC5cbiAgICBpZiAoaW1wb3J0ZWRGaWxlICE9PSAndW5rbm93bicpIHtcbiAgICAgIHJldHVybiBpbXBvcnRlZEZpbGU7XG4gICAgfVxuXG4gICAgLy8gT3RoZXJ3aXNlIGBleHByYCBoYXMgdG8gYmUgaW5zcGVjdGVkIHRvIGRldGVybWluZSB0aGUgZmlsZSB0aGF0IGlzIGJlaW5nIGltcG9ydGVkLiBJZiBgZXhwcmBcbiAgICAvLyBpcyBub3QgYW4gYEV4dGVybmFsRXhwcmAgdGhlbiBpdCBkb2VzIG5vdCBjb3JyZXNwb25kIHdpdGggYW4gaW1wb3J0LCBzbyByZXR1cm4gbnVsbCBpbiB0aGF0XG4gICAgLy8gY2FzZS5cbiAgICBpZiAoIShleHByIGluc3RhbmNlb2YgRXh0ZXJuYWxFeHByKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLy8gRmlndXJlIG91dCB3aGF0IGZpbGUgaXMgYmVpbmcgaW1wb3J0ZWQuXG4gICAgcmV0dXJuIHRoaXMubW9kdWxlUmVzb2x2ZXIucmVzb2x2ZU1vZHVsZShleHByLnZhbHVlLm1vZHVsZU5hbWUhLCBvcmlnaW4uZmlsZU5hbWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIHdoZXRoZXIgYWRkaW5nIGFuIGltcG9ydCBmcm9tIGBvcmlnaW5gIHRvIHRoZSBzb3VyY2UtZmlsZSBjb3JyZXNwb25kaW5nIHRvIGBleHByYCB3b3VsZFxuICAgKiBjcmVhdGUgYSBjeWNsaWMgaW1wb3J0LlxuICAgKlxuICAgKiBAcmV0dXJucyBhIGBDeWNsZWAgb2JqZWN0IGlmIGEgY3ljbGUgd291bGQgYmUgY3JlYXRlZCwgb3RoZXJ3aXNlIGBudWxsYC5cbiAgICovXG4gIHByaXZhdGUgX2NoZWNrRm9yQ3ljbGljSW1wb3J0KFxuICAgICAgaW1wb3J0ZWRGaWxlOiBJbXBvcnRlZEZpbGUsIGV4cHI6IEV4cHJlc3Npb24sIG9yaWdpbjogdHMuU291cmNlRmlsZSk6IEN5Y2xlfG51bGwge1xuICAgIGNvbnN0IGltcG9ydGVkID0gdGhpcy5fcmVzb2x2ZUltcG9ydGVkRmlsZShpbXBvcnRlZEZpbGUsIGV4cHIsIG9yaWdpbik7XG4gICAgaWYgKGltcG9ydGVkID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgLy8gQ2hlY2sgd2hldGhlciB0aGUgaW1wb3J0IGlzIGxlZ2FsLlxuICAgIHJldHVybiB0aGlzLmN5Y2xlQW5hbHl6ZXIud291bGRDcmVhdGVDeWNsZShvcmlnaW4sIGltcG9ydGVkKTtcbiAgfVxuXG4gIHByaXZhdGUgX3JlY29yZFN5bnRoZXRpY0ltcG9ydChcbiAgICAgIGltcG9ydGVkRmlsZTogSW1wb3J0ZWRGaWxlLCBleHByOiBFeHByZXNzaW9uLCBvcmlnaW46IHRzLlNvdXJjZUZpbGUpOiB2b2lkIHtcbiAgICBjb25zdCBpbXBvcnRlZCA9IHRoaXMuX3Jlc29sdmVJbXBvcnRlZEZpbGUoaW1wb3J0ZWRGaWxlLCBleHByLCBvcmlnaW4pO1xuICAgIGlmIChpbXBvcnRlZCA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuY3ljbGVBbmFseXplci5yZWNvcmRTeW50aGV0aWNJbXBvcnQob3JpZ2luLCBpbXBvcnRlZCk7XG4gIH1cblxuICBwcml2YXRlIG1ha2VSZXNvdXJjZU5vdEZvdW5kRXJyb3IoXG4gICAgICBmaWxlOiBzdHJpbmcsIG5vZGVGb3JFcnJvcjogdHMuTm9kZSxcbiAgICAgIHJlc291cmNlVHlwZTogUmVzb3VyY2VUeXBlRm9yRGlhZ25vc3RpY3MpOiBGYXRhbERpYWdub3N0aWNFcnJvciB7XG4gICAgbGV0IGVycm9yVGV4dDogc3RyaW5nO1xuICAgIHN3aXRjaCAocmVzb3VyY2VUeXBlKSB7XG4gICAgICBjYXNlIFJlc291cmNlVHlwZUZvckRpYWdub3N0aWNzLlRlbXBsYXRlOlxuICAgICAgICBlcnJvclRleHQgPSBgQ291bGQgbm90IGZpbmQgdGVtcGxhdGUgZmlsZSAnJHtmaWxlfScuYDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFJlc291cmNlVHlwZUZvckRpYWdub3N0aWNzLlN0eWxlc2hlZXRGcm9tVGVtcGxhdGU6XG4gICAgICAgIGVycm9yVGV4dCA9IGBDb3VsZCBub3QgZmluZCBzdHlsZXNoZWV0IGZpbGUgJyR7ZmlsZX0nIGxpbmtlZCBmcm9tIHRoZSB0ZW1wbGF0ZS5gO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgUmVzb3VyY2VUeXBlRm9yRGlhZ25vc3RpY3MuU3R5bGVzaGVldEZyb21EZWNvcmF0b3I6XG4gICAgICAgIGVycm9yVGV4dCA9IGBDb3VsZCBub3QgZmluZCBzdHlsZXNoZWV0IGZpbGUgJyR7ZmlsZX0nLmA7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgRmF0YWxEaWFnbm9zdGljRXJyb3IoXG4gICAgICAgIEVycm9yQ29kZS5DT01QT05FTlRfUkVTT1VSQ0VfTk9UX0ZPVU5ELCBub2RlRm9yRXJyb3IsIGVycm9yVGV4dCk7XG4gIH1cblxuICBwcml2YXRlIF9leHRyYWN0VGVtcGxhdGVTdHlsZVVybHModGVtcGxhdGU6IFBhcnNlZFRlbXBsYXRlV2l0aFNvdXJjZSk6IFN0eWxlVXJsTWV0YVtdIHtcbiAgICBpZiAodGVtcGxhdGUuc3R5bGVVcmxzID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgY29uc3Qgbm9kZUZvckVycm9yID0gZ2V0VGVtcGxhdGVEZWNsYXJhdGlvbk5vZGVGb3JFcnJvcih0ZW1wbGF0ZS5kZWNsYXJhdGlvbik7XG4gICAgcmV0dXJuIHRlbXBsYXRlLnN0eWxlVXJscy5tYXAoXG4gICAgICAgIHVybCA9PiAoe3VybCwgc291cmNlOiBSZXNvdXJjZVR5cGVGb3JEaWFnbm9zdGljcy5TdHlsZXNoZWV0RnJvbVRlbXBsYXRlLCBub2RlRm9yRXJyb3J9KSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0VGVtcGxhdGVSYW5nZSh0ZW1wbGF0ZUV4cHI6IHRzLkV4cHJlc3Npb24pIHtcbiAgY29uc3Qgc3RhcnRQb3MgPSB0ZW1wbGF0ZUV4cHIuZ2V0U3RhcnQoKSArIDE7XG4gIGNvbnN0IHtsaW5lLCBjaGFyYWN0ZXJ9ID1cbiAgICAgIHRzLmdldExpbmVBbmRDaGFyYWN0ZXJPZlBvc2l0aW9uKHRlbXBsYXRlRXhwci5nZXRTb3VyY2VGaWxlKCksIHN0YXJ0UG9zKTtcbiAgcmV0dXJuIHtcbiAgICBzdGFydFBvcyxcbiAgICBzdGFydExpbmU6IGxpbmUsXG4gICAgc3RhcnRDb2w6IGNoYXJhY3RlcixcbiAgICBlbmRQb3M6IHRlbXBsYXRlRXhwci5nZXRFbmQoKSAtIDEsXG4gIH07XG59XG5cbi8qKiBEZXRlcm1pbmVzIGlmIHRoZSByZXN1bHQgb2YgYW4gZXZhbHVhdGlvbiBpcyBhIHN0cmluZyBhcnJheS4gKi9cbmZ1bmN0aW9uIGlzU3RyaW5nQXJyYXkocmVzb2x2ZWRWYWx1ZTogUmVzb2x2ZWRWYWx1ZSk6IHJlc29sdmVkVmFsdWUgaXMgc3RyaW5nW10ge1xuICByZXR1cm4gQXJyYXkuaXNBcnJheShyZXNvbHZlZFZhbHVlKSAmJiByZXNvbHZlZFZhbHVlLmV2ZXJ5KGVsZW0gPT4gdHlwZW9mIGVsZW0gPT09ICdzdHJpbmcnKTtcbn1cblxuLyoqIERldGVybWluZXMgdGhlIG5vZGUgdG8gdXNlIGZvciBkZWJ1Z2dpbmcgcHVycG9zZXMgZm9yIHRoZSBnaXZlbiBUZW1wbGF0ZURlY2xhcmF0aW9uLiAqL1xuZnVuY3Rpb24gZ2V0VGVtcGxhdGVEZWNsYXJhdGlvbk5vZGVGb3JFcnJvcihkZWNsYXJhdGlvbjogVGVtcGxhdGVEZWNsYXJhdGlvbik6IHRzLk5vZGUge1xuICAvLyBUT0RPKHphcmVuZCk6IENoYW5nZSB0aGlzIHRvIGlmL2Vsc2Ugd2hlbiB0aGF0IGlzIGNvbXBhdGlibGUgd2l0aCBnMy4gVGhpcyB1c2VzIGEgc3dpdGNoXG4gIC8vIGJlY2F1c2UgaWYvZWxzZSBmYWlscyB0byBjb21waWxlIG9uIGczLiBUaGF0IGlzIGJlY2F1c2UgZzMgY29tcGlsZXMgdGhpcyBpbiBub24tc3RyaWN0IG1vZGVcbiAgLy8gd2hlcmUgdHlwZSBpbmZlcmVuY2UgZG9lcyBub3Qgd29yayBjb3JyZWN0bHkuXG4gIHN3aXRjaCAoZGVjbGFyYXRpb24uaXNJbmxpbmUpIHtcbiAgICBjYXNlIHRydWU6XG4gICAgICByZXR1cm4gZGVjbGFyYXRpb24uZXhwcmVzc2lvbjtcbiAgICBjYXNlIGZhbHNlOlxuICAgICAgcmV0dXJuIGRlY2xhcmF0aW9uLnRlbXBsYXRlVXJsRXhwcmVzc2lvbjtcbiAgfVxufVxuXG4vKipcbiAqIEluZm9ybWF0aW9uIGFib3V0IHRoZSB0ZW1wbGF0ZSB3aGljaCB3YXMgZXh0cmFjdGVkIGR1cmluZyBwYXJzaW5nLlxuICpcbiAqIFRoaXMgY29udGFpbnMgdGhlIGFjdHVhbCBwYXJzZWQgdGVtcGxhdGUgYXMgd2VsbCBhcyBhbnkgbWV0YWRhdGEgY29sbGVjdGVkIGR1cmluZyBpdHMgcGFyc2luZyxcbiAqIHNvbWUgb2Ygd2hpY2ggbWlnaHQgYmUgdXNlZnVsIGZvciByZS1wYXJzaW5nIHRoZSB0ZW1wbGF0ZSB3aXRoIGRpZmZlcmVudCBvcHRpb25zLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFBhcnNlZENvbXBvbmVudFRlbXBsYXRlIGV4dGVuZHMgUGFyc2VkVGVtcGxhdGUge1xuICAvKipcbiAgICogVGhlIHRlbXBsYXRlIEFTVCwgcGFyc2VkIGluIGEgbWFubmVyIHdoaWNoIHByZXNlcnZlcyBzb3VyY2UgbWFwIGluZm9ybWF0aW9uIGZvciBkaWFnbm9zdGljcy5cbiAgICpcbiAgICogTm90IHVzZWZ1bCBmb3IgZW1pdC5cbiAgICovXG4gIGRpYWdOb2RlczogVG1wbEFzdE5vZGVbXTtcblxuICAvKipcbiAgICogVGhlIGBQYXJzZVNvdXJjZUZpbGVgIGZvciB0aGUgdGVtcGxhdGUuXG4gICAqL1xuICBmaWxlOiBQYXJzZVNvdXJjZUZpbGU7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUGFyc2VkVGVtcGxhdGVXaXRoU291cmNlIGV4dGVuZHMgUGFyc2VkQ29tcG9uZW50VGVtcGxhdGUge1xuICAvKiogVGhlIHN0cmluZyBjb250ZW50cyBvZiB0aGUgdGVtcGxhdGUuICovXG4gIGNvbnRlbnQ6IHN0cmluZztcbiAgc291cmNlTWFwcGluZzogVGVtcGxhdGVTb3VyY2VNYXBwaW5nO1xuICBkZWNsYXJhdGlvbjogVGVtcGxhdGVEZWNsYXJhdGlvbjtcbn1cblxuLyoqXG4gKiBDb21tb24gZmllbGRzIGV4dHJhY3RlZCBmcm9tIHRoZSBkZWNsYXJhdGlvbiBvZiBhIHRlbXBsYXRlLlxuICovXG5pbnRlcmZhY2UgQ29tbW9uVGVtcGxhdGVEZWNsYXJhdGlvbiB7XG4gIHByZXNlcnZlV2hpdGVzcGFjZXM6IGJvb2xlYW47XG4gIGludGVycG9sYXRpb25Db25maWc6IEludGVycG9sYXRpb25Db25maWc7XG4gIHRlbXBsYXRlVXJsOiBzdHJpbmc7XG4gIHJlc29sdmVkVGVtcGxhdGVVcmw6IHN0cmluZztcbn1cblxuLyoqXG4gKiBJbmZvcm1hdGlvbiBleHRyYWN0ZWQgZnJvbSB0aGUgZGVjbGFyYXRpb24gb2YgYW4gaW5saW5lIHRlbXBsYXRlLlxuICovXG5pbnRlcmZhY2UgSW5saW5lVGVtcGxhdGVEZWNsYXJhdGlvbiBleHRlbmRzIENvbW1vblRlbXBsYXRlRGVjbGFyYXRpb24ge1xuICBpc0lubGluZTogdHJ1ZTtcbiAgZXhwcmVzc2lvbjogdHMuRXhwcmVzc2lvbjtcbn1cblxuLyoqXG4gKiBJbmZvcm1hdGlvbiBleHRyYWN0ZWQgZnJvbSB0aGUgZGVjbGFyYXRpb24gb2YgYW4gZXh0ZXJuYWwgdGVtcGxhdGUuXG4gKi9cbmludGVyZmFjZSBFeHRlcm5hbFRlbXBsYXRlRGVjbGFyYXRpb24gZXh0ZW5kcyBDb21tb25UZW1wbGF0ZURlY2xhcmF0aW9uIHtcbiAgaXNJbmxpbmU6IGZhbHNlO1xuICB0ZW1wbGF0ZVVybEV4cHJlc3Npb246IHRzLkV4cHJlc3Npb247XG59XG5cbi8qKlxuICogVGhlIGRlY2xhcmF0aW9uIG9mIGEgdGVtcGxhdGUgZXh0cmFjdGVkIGZyb20gYSBjb21wb25lbnQgZGVjb3JhdG9yLlxuICpcbiAqIFRoaXMgZGF0YSBpcyBleHRyYWN0ZWQgYW5kIHN0b3JlZCBzZXBhcmF0ZWx5IHRvIGZhY2lsaXRhdGUgcmUtaW50ZXJwcmV0aW5nIHRoZSB0ZW1wbGF0ZVxuICogZGVjbGFyYXRpb24gd2hlbmV2ZXIgdGhlIGNvbXBpbGVyIGlzIG5vdGlmaWVkIG9mIGEgY2hhbmdlIHRvIGEgdGVtcGxhdGUgZmlsZS4gV2l0aCB0aGlzXG4gKiBpbmZvcm1hdGlvbiwgYENvbXBvbmVudERlY29yYXRvckhhbmRsZXJgIGlzIGFibGUgdG8gcmUtcmVhZCB0aGUgdGVtcGxhdGUgYW5kIHVwZGF0ZSB0aGUgY29tcG9uZW50XG4gKiByZWNvcmQgd2l0aG91dCBuZWVkaW5nIHRvIHBhcnNlIHRoZSBvcmlnaW5hbCBkZWNvcmF0b3IgYWdhaW4uXG4gKi9cbnR5cGUgVGVtcGxhdGVEZWNsYXJhdGlvbiA9IElubGluZVRlbXBsYXRlRGVjbGFyYXRpb258RXh0ZXJuYWxUZW1wbGF0ZURlY2xhcmF0aW9uO1xuXG4vKipcbiAqIEdlbmVyYXRlIGEgZGlhZ25vc3RpYyByZWxhdGVkIGluZm9ybWF0aW9uIG9iamVjdCB0aGF0IGRlc2NyaWJlcyBhIHBvdGVudGlhbCBjeWNsaWMgaW1wb3J0IHBhdGguXG4gKi9cbmZ1bmN0aW9uIG1ha2VDeWNsaWNJbXBvcnRJbmZvKFxuICAgIHJlZjogUmVmZXJlbmNlLCB0eXBlOiBzdHJpbmcsIGN5Y2xlOiBDeWNsZSk6IHRzLkRpYWdub3N0aWNSZWxhdGVkSW5mb3JtYXRpb24ge1xuICBjb25zdCBuYW1lID0gcmVmLmRlYnVnTmFtZSB8fCAnKHVua25vd24pJztcbiAgY29uc3QgcGF0aCA9IGN5Y2xlLmdldFBhdGgoKS5tYXAoc2YgPT4gc2YuZmlsZU5hbWUpLmpvaW4oJyAtPiAnKTtcbiAgY29uc3QgbWVzc2FnZSA9XG4gICAgICBgVGhlICR7dHlwZX0gJyR7bmFtZX0nIGlzIHVzZWQgaW4gdGhlIHRlbXBsYXRlIGJ1dCBpbXBvcnRpbmcgaXQgd291bGQgY3JlYXRlIGEgY3ljbGU6IGA7XG4gIHJldHVybiBtYWtlUmVsYXRlZEluZm9ybWF0aW9uKHJlZi5ub2RlLCBtZXNzYWdlICsgcGF0aCk7XG59XG4iXX0=