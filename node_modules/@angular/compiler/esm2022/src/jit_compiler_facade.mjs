/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ConstantPool } from './constant_pool';
import { ChangeDetectionStrategy, ViewEncapsulation, } from './core';
import { compileInjectable } from './injectable_compiler_2';
import { DEFAULT_INTERPOLATION_CONFIG, InterpolationConfig } from './ml_parser/defaults';
import { DeclareVarStmt, literal, LiteralExpr, StmtModifier, WrappedNodeExpr, } from './output/output_ast';
import { JitEvaluator } from './output/output_jit';
import { r3JitTypeSourceSpan } from './parse_util';
import { compileFactoryFunction, FactoryTarget } from './render3/r3_factory';
import { compileInjector } from './render3/r3_injector_compiler';
import { R3JitReflector } from './render3/r3_jit';
import { compileNgModule, compileNgModuleDeclarationExpression, R3NgModuleMetadataKind, R3SelectorScopeMode, } from './render3/r3_module_compiler';
import { compilePipeFromMetadata } from './render3/r3_pipe_compiler';
import { createMayBeForwardRefExpression, getSafePropertyAccessString, wrapReference, } from './render3/util';
import { R3TemplateDependencyKind, } from './render3/view/api';
import { compileComponentFromMetadata, compileDirectiveFromMetadata, parseHostBindings, verifyHostBindings, } from './render3/view/compiler';
import { R3TargetBinder } from './render3/view/t2_binder';
import { makeBindingParser, parseTemplate } from './render3/view/template';
import { ResourceLoader } from './resource_loader';
import { DomElementSchemaRegistry } from './schema/dom_element_schema_registry';
import { SelectorMatcher } from './selector';
export class CompilerFacadeImpl {
    constructor(jitEvaluator = new JitEvaluator()) {
        this.jitEvaluator = jitEvaluator;
        this.FactoryTarget = FactoryTarget;
        this.ResourceLoader = ResourceLoader;
        this.elementSchemaRegistry = new DomElementSchemaRegistry();
    }
    compilePipe(angularCoreEnv, sourceMapUrl, facade) {
        const metadata = {
            name: facade.name,
            type: wrapReference(facade.type),
            typeArgumentCount: 0,
            deps: null,
            pipeName: facade.pipeName,
            pure: facade.pure,
            isStandalone: facade.isStandalone,
        };
        const res = compilePipeFromMetadata(metadata);
        return this.jitExpression(res.expression, angularCoreEnv, sourceMapUrl, []);
    }
    compilePipeDeclaration(angularCoreEnv, sourceMapUrl, declaration) {
        const meta = convertDeclarePipeFacadeToMetadata(declaration);
        const res = compilePipeFromMetadata(meta);
        return this.jitExpression(res.expression, angularCoreEnv, sourceMapUrl, []);
    }
    compileInjectable(angularCoreEnv, sourceMapUrl, facade) {
        const { expression, statements } = compileInjectable({
            name: facade.name,
            type: wrapReference(facade.type),
            typeArgumentCount: facade.typeArgumentCount,
            providedIn: computeProvidedIn(facade.providedIn),
            useClass: convertToProviderExpression(facade, 'useClass'),
            useFactory: wrapExpression(facade, 'useFactory'),
            useValue: convertToProviderExpression(facade, 'useValue'),
            useExisting: convertToProviderExpression(facade, 'useExisting'),
            deps: facade.deps?.map(convertR3DependencyMetadata),
        }, 
        /* resolveForwardRefs */ true);
        return this.jitExpression(expression, angularCoreEnv, sourceMapUrl, statements);
    }
    compileInjectableDeclaration(angularCoreEnv, sourceMapUrl, facade) {
        const { expression, statements } = compileInjectable({
            name: facade.type.name,
            type: wrapReference(facade.type),
            typeArgumentCount: 0,
            providedIn: computeProvidedIn(facade.providedIn),
            useClass: convertToProviderExpression(facade, 'useClass'),
            useFactory: wrapExpression(facade, 'useFactory'),
            useValue: convertToProviderExpression(facade, 'useValue'),
            useExisting: convertToProviderExpression(facade, 'useExisting'),
            deps: facade.deps?.map(convertR3DeclareDependencyMetadata),
        }, 
        /* resolveForwardRefs */ true);
        return this.jitExpression(expression, angularCoreEnv, sourceMapUrl, statements);
    }
    compileInjector(angularCoreEnv, sourceMapUrl, facade) {
        const meta = {
            name: facade.name,
            type: wrapReference(facade.type),
            providers: facade.providers && facade.providers.length > 0
                ? new WrappedNodeExpr(facade.providers)
                : null,
            imports: facade.imports.map((i) => new WrappedNodeExpr(i)),
        };
        const res = compileInjector(meta);
        return this.jitExpression(res.expression, angularCoreEnv, sourceMapUrl, []);
    }
    compileInjectorDeclaration(angularCoreEnv, sourceMapUrl, declaration) {
        const meta = convertDeclareInjectorFacadeToMetadata(declaration);
        const res = compileInjector(meta);
        return this.jitExpression(res.expression, angularCoreEnv, sourceMapUrl, []);
    }
    compileNgModule(angularCoreEnv, sourceMapUrl, facade) {
        const meta = {
            kind: R3NgModuleMetadataKind.Global,
            type: wrapReference(facade.type),
            bootstrap: facade.bootstrap.map(wrapReference),
            declarations: facade.declarations.map(wrapReference),
            publicDeclarationTypes: null, // only needed for types in AOT
            imports: facade.imports.map(wrapReference),
            includeImportTypes: true,
            exports: facade.exports.map(wrapReference),
            selectorScopeMode: R3SelectorScopeMode.Inline,
            containsForwardDecls: false,
            schemas: facade.schemas ? facade.schemas.map(wrapReference) : null,
            id: facade.id ? new WrappedNodeExpr(facade.id) : null,
        };
        const res = compileNgModule(meta);
        return this.jitExpression(res.expression, angularCoreEnv, sourceMapUrl, []);
    }
    compileNgModuleDeclaration(angularCoreEnv, sourceMapUrl, declaration) {
        const expression = compileNgModuleDeclarationExpression(declaration);
        return this.jitExpression(expression, angularCoreEnv, sourceMapUrl, []);
    }
    compileDirective(angularCoreEnv, sourceMapUrl, facade) {
        const meta = convertDirectiveFacadeToMetadata(facade);
        return this.compileDirectiveFromMeta(angularCoreEnv, sourceMapUrl, meta);
    }
    compileDirectiveDeclaration(angularCoreEnv, sourceMapUrl, declaration) {
        const typeSourceSpan = this.createParseSourceSpan('Directive', declaration.type.name, sourceMapUrl);
        const meta = convertDeclareDirectiveFacadeToMetadata(declaration, typeSourceSpan);
        return this.compileDirectiveFromMeta(angularCoreEnv, sourceMapUrl, meta);
    }
    compileDirectiveFromMeta(angularCoreEnv, sourceMapUrl, meta) {
        const constantPool = new ConstantPool();
        const bindingParser = makeBindingParser();
        const res = compileDirectiveFromMetadata(meta, constantPool, bindingParser);
        return this.jitExpression(res.expression, angularCoreEnv, sourceMapUrl, constantPool.statements);
    }
    compileComponent(angularCoreEnv, sourceMapUrl, facade) {
        // Parse the template and check for errors.
        const { template, interpolation, defer } = parseJitTemplate(facade.template, facade.name, sourceMapUrl, facade.preserveWhitespaces, facade.interpolation, undefined);
        // Compile the component metadata, including template, into an expression.
        const meta = {
            ...facade,
            ...convertDirectiveFacadeToMetadata(facade),
            selector: facade.selector || this.elementSchemaRegistry.getDefaultComponentElementName(),
            template,
            declarations: facade.declarations.map(convertDeclarationFacadeToMetadata),
            declarationListEmitMode: 0 /* DeclarationListEmitMode.Direct */,
            defer,
            styles: [...facade.styles, ...template.styles],
            encapsulation: facade.encapsulation,
            interpolation,
            changeDetection: facade.changeDetection ?? null,
            animations: facade.animations != null ? new WrappedNodeExpr(facade.animations) : null,
            viewProviders: facade.viewProviders != null ? new WrappedNodeExpr(facade.viewProviders) : null,
            relativeContextFilePath: '',
            i18nUseExternalIds: true,
        };
        const jitExpressionSourceMap = `ng:///${facade.name}.js`;
        return this.compileComponentFromMeta(angularCoreEnv, jitExpressionSourceMap, meta);
    }
    compileComponentDeclaration(angularCoreEnv, sourceMapUrl, declaration) {
        const typeSourceSpan = this.createParseSourceSpan('Component', declaration.type.name, sourceMapUrl);
        const meta = convertDeclareComponentFacadeToMetadata(declaration, typeSourceSpan, sourceMapUrl);
        return this.compileComponentFromMeta(angularCoreEnv, sourceMapUrl, meta);
    }
    compileComponentFromMeta(angularCoreEnv, sourceMapUrl, meta) {
        const constantPool = new ConstantPool();
        const bindingParser = makeBindingParser(meta.interpolation);
        const res = compileComponentFromMetadata(meta, constantPool, bindingParser);
        return this.jitExpression(res.expression, angularCoreEnv, sourceMapUrl, constantPool.statements);
    }
    compileFactory(angularCoreEnv, sourceMapUrl, meta) {
        const factoryRes = compileFactoryFunction({
            name: meta.name,
            type: wrapReference(meta.type),
            typeArgumentCount: meta.typeArgumentCount,
            deps: convertR3DependencyMetadataArray(meta.deps),
            target: meta.target,
        });
        return this.jitExpression(factoryRes.expression, angularCoreEnv, sourceMapUrl, factoryRes.statements);
    }
    compileFactoryDeclaration(angularCoreEnv, sourceMapUrl, meta) {
        const factoryRes = compileFactoryFunction({
            name: meta.type.name,
            type: wrapReference(meta.type),
            typeArgumentCount: 0,
            deps: Array.isArray(meta.deps)
                ? meta.deps.map(convertR3DeclareDependencyMetadata)
                : meta.deps,
            target: meta.target,
        });
        return this.jitExpression(factoryRes.expression, angularCoreEnv, sourceMapUrl, factoryRes.statements);
    }
    createParseSourceSpan(kind, typeName, sourceUrl) {
        return r3JitTypeSourceSpan(kind, typeName, sourceUrl);
    }
    /**
     * JIT compiles an expression and returns the result of executing that expression.
     *
     * @param def the definition which will be compiled and executed to get the value to patch
     * @param context an object map of @angular/core symbol names to symbols which will be available
     * in the context of the compiled expression
     * @param sourceUrl a URL to use for the source map of the compiled expression
     * @param preStatements a collection of statements that should be evaluated before the expression.
     */
    jitExpression(def, context, sourceUrl, preStatements) {
        // The ConstantPool may contain Statements which declare variables used in the final expression.
        // Therefore, its statements need to precede the actual JIT operation. The final statement is a
        // declaration of $def which is set to the expression being compiled.
        const statements = [
            ...preStatements,
            new DeclareVarStmt('$def', def, undefined, StmtModifier.Exported),
        ];
        const res = this.jitEvaluator.evaluateStatements(sourceUrl, statements, new R3JitReflector(context), 
        /* enableSourceMaps */ true);
        return res['$def'];
    }
}
function convertToR3QueryMetadata(facade) {
    return {
        ...facade,
        isSignal: facade.isSignal,
        predicate: convertQueryPredicate(facade.predicate),
        read: facade.read ? new WrappedNodeExpr(facade.read) : null,
        static: facade.static,
        emitDistinctChangesOnly: facade.emitDistinctChangesOnly,
    };
}
function convertQueryDeclarationToMetadata(declaration) {
    return {
        propertyName: declaration.propertyName,
        first: declaration.first ?? false,
        predicate: convertQueryPredicate(declaration.predicate),
        descendants: declaration.descendants ?? false,
        read: declaration.read ? new WrappedNodeExpr(declaration.read) : null,
        static: declaration.static ?? false,
        emitDistinctChangesOnly: declaration.emitDistinctChangesOnly ?? true,
        isSignal: !!declaration.isSignal,
    };
}
function convertQueryPredicate(predicate) {
    return Array.isArray(predicate)
        ? // The predicate is an array of strings so pass it through.
            predicate
        : // The predicate is a type - assume that we will need to unwrap any `forwardRef()` calls.
            createMayBeForwardRefExpression(new WrappedNodeExpr(predicate), 1 /* ForwardRefHandling.Wrapped */);
}
function convertDirectiveFacadeToMetadata(facade) {
    const inputsFromMetadata = parseInputsArray(facade.inputs || []);
    const outputsFromMetadata = parseMappingStringArray(facade.outputs || []);
    const propMetadata = facade.propMetadata;
    const inputsFromType = {};
    const outputsFromType = {};
    for (const field in propMetadata) {
        if (propMetadata.hasOwnProperty(field)) {
            propMetadata[field].forEach((ann) => {
                if (isInput(ann)) {
                    inputsFromType[field] = {
                        bindingPropertyName: ann.alias || field,
                        classPropertyName: field,
                        required: ann.required || false,
                        // For JIT, decorators are used to declare signal inputs. That is because of
                        // a technical limitation where it's not possible to statically reflect class
                        // members of a directive/component at runtime before instantiating the class.
                        isSignal: !!ann.isSignal,
                        transformFunction: ann.transform != null ? new WrappedNodeExpr(ann.transform) : null,
                    };
                }
                else if (isOutput(ann)) {
                    outputsFromType[field] = ann.alias || field;
                }
            });
        }
    }
    const hostDirectives = facade.hostDirectives?.length
        ? facade.hostDirectives.map((hostDirective) => {
            return typeof hostDirective === 'function'
                ? {
                    directive: wrapReference(hostDirective),
                    inputs: null,
                    outputs: null,
                    isForwardReference: false,
                }
                : {
                    directive: wrapReference(hostDirective.directive),
                    isForwardReference: false,
                    inputs: hostDirective.inputs ? parseMappingStringArray(hostDirective.inputs) : null,
                    outputs: hostDirective.outputs
                        ? parseMappingStringArray(hostDirective.outputs)
                        : null,
                };
        })
        : null;
    return {
        ...facade,
        typeArgumentCount: 0,
        typeSourceSpan: facade.typeSourceSpan,
        type: wrapReference(facade.type),
        deps: null,
        host: {
            ...extractHostBindings(facade.propMetadata, facade.typeSourceSpan, facade.host),
        },
        inputs: { ...inputsFromMetadata, ...inputsFromType },
        outputs: { ...outputsFromMetadata, ...outputsFromType },
        queries: facade.queries.map(convertToR3QueryMetadata),
        providers: facade.providers != null ? new WrappedNodeExpr(facade.providers) : null,
        viewQueries: facade.viewQueries.map(convertToR3QueryMetadata),
        fullInheritance: false,
        hostDirectives,
    };
}
function convertDeclareDirectiveFacadeToMetadata(declaration, typeSourceSpan) {
    const hostDirectives = declaration.hostDirectives?.length
        ? declaration.hostDirectives.map((dir) => ({
            directive: wrapReference(dir.directive),
            isForwardReference: false,
            inputs: dir.inputs ? getHostDirectiveBindingMapping(dir.inputs) : null,
            outputs: dir.outputs ? getHostDirectiveBindingMapping(dir.outputs) : null,
        }))
        : null;
    return {
        name: declaration.type.name,
        type: wrapReference(declaration.type),
        typeSourceSpan,
        selector: declaration.selector ?? null,
        inputs: declaration.inputs ? inputsPartialMetadataToInputMetadata(declaration.inputs) : {},
        outputs: declaration.outputs ?? {},
        host: convertHostDeclarationToMetadata(declaration.host),
        queries: (declaration.queries ?? []).map(convertQueryDeclarationToMetadata),
        viewQueries: (declaration.viewQueries ?? []).map(convertQueryDeclarationToMetadata),
        providers: declaration.providers !== undefined ? new WrappedNodeExpr(declaration.providers) : null,
        exportAs: declaration.exportAs ?? null,
        usesInheritance: declaration.usesInheritance ?? false,
        lifecycle: { usesOnChanges: declaration.usesOnChanges ?? false },
        deps: null,
        typeArgumentCount: 0,
        fullInheritance: false,
        isStandalone: declaration.isStandalone ?? false,
        isSignal: declaration.isSignal ?? false,
        hostDirectives,
    };
}
function convertHostDeclarationToMetadata(host = {}) {
    return {
        attributes: convertOpaqueValuesToExpressions(host.attributes ?? {}),
        listeners: host.listeners ?? {},
        properties: host.properties ?? {},
        specialAttributes: {
            classAttr: host.classAttribute,
            styleAttr: host.styleAttribute,
        },
    };
}
/**
 * Parses a host directive mapping where each odd array key is the name of an input/output
 * and each even key is its public name, e.g. `['one', 'oneAlias', 'two', 'two']`.
 */
function getHostDirectiveBindingMapping(array) {
    let result = null;
    for (let i = 1; i < array.length; i += 2) {
        result = result || {};
        result[array[i - 1]] = array[i];
    }
    return result;
}
function convertOpaqueValuesToExpressions(obj) {
    const result = {};
    for (const key of Object.keys(obj)) {
        result[key] = new WrappedNodeExpr(obj[key]);
    }
    return result;
}
function convertDeclareComponentFacadeToMetadata(decl, typeSourceSpan, sourceMapUrl) {
    const { template, interpolation, defer } = parseJitTemplate(decl.template, decl.type.name, sourceMapUrl, decl.preserveWhitespaces ?? false, decl.interpolation, decl.deferBlockDependencies);
    const declarations = [];
    if (decl.dependencies) {
        for (const innerDep of decl.dependencies) {
            switch (innerDep.kind) {
                case 'directive':
                case 'component':
                    declarations.push(convertDirectiveDeclarationToMetadata(innerDep));
                    break;
                case 'pipe':
                    declarations.push(convertPipeDeclarationToMetadata(innerDep));
                    break;
            }
        }
    }
    else if (decl.components || decl.directives || decl.pipes) {
        // Existing declarations on NPM may not be using the new `dependencies` merged field, and may
        // have separate fields for dependencies instead. Unify them for JIT compilation.
        decl.components &&
            declarations.push(...decl.components.map((dir) => convertDirectiveDeclarationToMetadata(dir, /* isComponent */ true)));
        decl.directives &&
            declarations.push(...decl.directives.map((dir) => convertDirectiveDeclarationToMetadata(dir)));
        decl.pipes && declarations.push(...convertPipeMapToMetadata(decl.pipes));
    }
    return {
        ...convertDeclareDirectiveFacadeToMetadata(decl, typeSourceSpan),
        template,
        styles: decl.styles ?? [],
        declarations,
        viewProviders: decl.viewProviders !== undefined ? new WrappedNodeExpr(decl.viewProviders) : null,
        animations: decl.animations !== undefined ? new WrappedNodeExpr(decl.animations) : null,
        defer,
        changeDetection: decl.changeDetection ?? ChangeDetectionStrategy.Default,
        encapsulation: decl.encapsulation ?? ViewEncapsulation.Emulated,
        interpolation,
        declarationListEmitMode: 2 /* DeclarationListEmitMode.ClosureResolved */,
        relativeContextFilePath: '',
        i18nUseExternalIds: true,
    };
}
function convertDeclarationFacadeToMetadata(declaration) {
    return {
        ...declaration,
        type: new WrappedNodeExpr(declaration.type),
    };
}
function convertDirectiveDeclarationToMetadata(declaration, isComponent = null) {
    return {
        kind: R3TemplateDependencyKind.Directive,
        isComponent: isComponent || declaration.kind === 'component',
        selector: declaration.selector,
        type: new WrappedNodeExpr(declaration.type),
        inputs: declaration.inputs ?? [],
        outputs: declaration.outputs ?? [],
        exportAs: declaration.exportAs ?? null,
    };
}
function convertPipeMapToMetadata(pipes) {
    if (!pipes) {
        return [];
    }
    return Object.keys(pipes).map((name) => {
        return {
            kind: R3TemplateDependencyKind.Pipe,
            name,
            type: new WrappedNodeExpr(pipes[name]),
        };
    });
}
function convertPipeDeclarationToMetadata(pipe) {
    return {
        kind: R3TemplateDependencyKind.Pipe,
        name: pipe.name,
        type: new WrappedNodeExpr(pipe.type),
    };
}
function parseJitTemplate(template, typeName, sourceMapUrl, preserveWhitespaces, interpolation, deferBlockDependencies) {
    const interpolationConfig = interpolation
        ? InterpolationConfig.fromArray(interpolation)
        : DEFAULT_INTERPOLATION_CONFIG;
    // Parse the template and check for errors.
    const parsed = parseTemplate(template, sourceMapUrl, {
        preserveWhitespaces,
        interpolationConfig,
    });
    if (parsed.errors !== null) {
        const errors = parsed.errors.map((err) => err.toString()).join(', ');
        throw new Error(`Errors during JIT compilation of template for ${typeName}: ${errors}`);
    }
    const binder = new R3TargetBinder(new SelectorMatcher());
    const boundTarget = binder.bind({ template: parsed.nodes });
    return {
        template: parsed,
        interpolation: interpolationConfig,
        defer: createR3ComponentDeferMetadata(boundTarget, deferBlockDependencies),
    };
}
/**
 * Convert the expression, if present to an `R3ProviderExpression`.
 *
 * In JIT mode we do not want the compiler to wrap the expression in a `forwardRef()` call because,
 * if it is referencing a type that has not yet been defined, it will have already been wrapped in
 * a `forwardRef()` - either by the application developer or during partial-compilation. Thus we can
 * use `ForwardRefHandling.None`.
 */
function convertToProviderExpression(obj, property) {
    if (obj.hasOwnProperty(property)) {
        return createMayBeForwardRefExpression(new WrappedNodeExpr(obj[property]), 0 /* ForwardRefHandling.None */);
    }
    else {
        return undefined;
    }
}
function wrapExpression(obj, property) {
    if (obj.hasOwnProperty(property)) {
        return new WrappedNodeExpr(obj[property]);
    }
    else {
        return undefined;
    }
}
function computeProvidedIn(providedIn) {
    const expression = typeof providedIn === 'function'
        ? new WrappedNodeExpr(providedIn)
        : new LiteralExpr(providedIn ?? null);
    // See `convertToProviderExpression()` for why this uses `ForwardRefHandling.None`.
    return createMayBeForwardRefExpression(expression, 0 /* ForwardRefHandling.None */);
}
function convertR3DependencyMetadataArray(facades) {
    return facades == null ? null : facades.map(convertR3DependencyMetadata);
}
function convertR3DependencyMetadata(facade) {
    const isAttributeDep = facade.attribute != null; // both `null` and `undefined`
    const rawToken = facade.token === null ? null : new WrappedNodeExpr(facade.token);
    // In JIT mode, if the dep is an `@Attribute()` then we use the attribute name given in
    // `attribute` rather than the `token`.
    const token = isAttributeDep ? new WrappedNodeExpr(facade.attribute) : rawToken;
    return createR3DependencyMetadata(token, isAttributeDep, facade.host, facade.optional, facade.self, facade.skipSelf);
}
function convertR3DeclareDependencyMetadata(facade) {
    const isAttributeDep = facade.attribute ?? false;
    const token = facade.token === null ? null : new WrappedNodeExpr(facade.token);
    return createR3DependencyMetadata(token, isAttributeDep, facade.host ?? false, facade.optional ?? false, facade.self ?? false, facade.skipSelf ?? false);
}
function createR3DependencyMetadata(token, isAttributeDep, host, optional, self, skipSelf) {
    // If the dep is an `@Attribute()` the `attributeNameType` ought to be the `unknown` type.
    // But types are not available at runtime so we just use a literal `"<unknown>"` string as a dummy
    // marker.
    const attributeNameType = isAttributeDep ? literal('unknown') : null;
    return { token, attributeNameType, host, optional, self, skipSelf };
}
function createR3ComponentDeferMetadata(boundTarget, deferBlockDependencies) {
    const deferredBlocks = boundTarget.getDeferBlocks();
    const blocks = new Map();
    for (let i = 0; i < deferredBlocks.length; i++) {
        const dependencyFn = deferBlockDependencies?.[i];
        blocks.set(deferredBlocks[i], dependencyFn ? new WrappedNodeExpr(dependencyFn) : null);
    }
    return { mode: 0 /* DeferBlockDepsEmitMode.PerBlock */, blocks };
}
function extractHostBindings(propMetadata, sourceSpan, host) {
    // First parse the declarations from the metadata.
    const bindings = parseHostBindings(host || {});
    // After that check host bindings for errors
    const errors = verifyHostBindings(bindings, sourceSpan);
    if (errors.length) {
        throw new Error(errors.map((error) => error.msg).join('\n'));
    }
    // Next, loop over the properties of the object, looking for @HostBinding and @HostListener.
    for (const field in propMetadata) {
        if (propMetadata.hasOwnProperty(field)) {
            propMetadata[field].forEach((ann) => {
                if (isHostBinding(ann)) {
                    // Since this is a decorator, we know that the value is a class member. Always access it
                    // through `this` so that further down the line it can't be confused for a literal value
                    // (e.g. if there's a property called `true`).
                    bindings.properties[ann.hostPropertyName || field] = getSafePropertyAccessString('this', field);
                }
                else if (isHostListener(ann)) {
                    bindings.listeners[ann.eventName || field] = `${field}(${(ann.args || []).join(',')})`;
                }
            });
        }
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
function inputsPartialMetadataToInputMetadata(inputs) {
    return Object.keys(inputs).reduce((result, minifiedClassName) => {
        const value = inputs[minifiedClassName];
        // Handle legacy partial input output.
        if (typeof value === 'string' || Array.isArray(value)) {
            result[minifiedClassName] = parseLegacyInputPartialOutput(value);
        }
        else {
            result[minifiedClassName] = {
                bindingPropertyName: value.publicName,
                classPropertyName: minifiedClassName,
                transformFunction: value.transformFunction !== null ? new WrappedNodeExpr(value.transformFunction) : null,
                required: value.isRequired,
                isSignal: value.isSignal,
            };
        }
        return result;
    }, {});
}
/**
 * Parses the legacy input partial output. For more details see `partial/directive.ts`.
 * TODO(legacy-partial-output-inputs): Remove in v18.
 */
function parseLegacyInputPartialOutput(value) {
    if (typeof value === 'string') {
        return {
            bindingPropertyName: value,
            classPropertyName: value,
            transformFunction: null,
            required: false,
            // legacy partial output does not capture signal inputs.
            isSignal: false,
        };
    }
    return {
        bindingPropertyName: value[0],
        classPropertyName: value[1],
        transformFunction: value[2] ? new WrappedNodeExpr(value[2]) : null,
        required: false,
        // legacy partial output does not capture signal inputs.
        isSignal: false,
    };
}
function parseInputsArray(values) {
    return values.reduce((results, value) => {
        if (typeof value === 'string') {
            const [bindingPropertyName, classPropertyName] = parseMappingString(value);
            results[classPropertyName] = {
                bindingPropertyName,
                classPropertyName,
                required: false,
                // Signal inputs not supported for the inputs array.
                isSignal: false,
                transformFunction: null,
            };
        }
        else {
            results[value.name] = {
                bindingPropertyName: value.alias || value.name,
                classPropertyName: value.name,
                required: value.required || false,
                // Signal inputs not supported for the inputs array.
                isSignal: false,
                transformFunction: value.transform != null ? new WrappedNodeExpr(value.transform) : null,
            };
        }
        return results;
    }, {});
}
function parseMappingStringArray(values) {
    return values.reduce((results, value) => {
        const [alias, fieldName] = parseMappingString(value);
        results[fieldName] = alias;
        return results;
    }, {});
}
function parseMappingString(value) {
    // Either the value is 'field' or 'field: property'. In the first case, `property` will
    // be undefined, in which case the field name should also be used as the property name.
    const [fieldName, bindingPropertyName] = value.split(':', 2).map((str) => str.trim());
    return [bindingPropertyName ?? fieldName, fieldName];
}
function convertDeclarePipeFacadeToMetadata(declaration) {
    return {
        name: declaration.type.name,
        type: wrapReference(declaration.type),
        typeArgumentCount: 0,
        pipeName: declaration.name,
        deps: null,
        pure: declaration.pure ?? true,
        isStandalone: declaration.isStandalone ?? false,
    };
}
function convertDeclareInjectorFacadeToMetadata(declaration) {
    return {
        name: declaration.type.name,
        type: wrapReference(declaration.type),
        providers: declaration.providers !== undefined && declaration.providers.length > 0
            ? new WrappedNodeExpr(declaration.providers)
            : null,
        imports: declaration.imports !== undefined
            ? declaration.imports.map((i) => new WrappedNodeExpr(i))
            : [],
    };
}
export function publishFacade(global) {
    const ng = global.ng || (global.ng = {});
    ng.ɵcompilerFacade = new CompilerFacadeImpl();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaml0X2NvbXBpbGVyX2ZhY2FkZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy9qaXRfY29tcGlsZXJfZmFjYWRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQThCSCxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDN0MsT0FBTyxFQUNMLHVCQUF1QixFQUt2QixpQkFBaUIsR0FDbEIsTUFBTSxRQUFRLENBQUM7QUFDaEIsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0seUJBQXlCLENBQUM7QUFDMUQsT0FBTyxFQUFDLDRCQUE0QixFQUFFLG1CQUFtQixFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFDdkYsT0FBTyxFQUNMLGNBQWMsRUFFZCxPQUFPLEVBQ1AsV0FBVyxFQUVYLFlBQVksRUFDWixlQUFlLEdBQ2hCLE1BQU0scUJBQXFCLENBQUM7QUFDN0IsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQ2pELE9BQU8sRUFBOEIsbUJBQW1CLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFFOUUsT0FBTyxFQUFDLHNCQUFzQixFQUFFLGFBQWEsRUFBdUIsTUFBTSxzQkFBc0IsQ0FBQztBQUNqRyxPQUFPLEVBQUMsZUFBZSxFQUFxQixNQUFNLGdDQUFnQyxDQUFDO0FBQ25GLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUNoRCxPQUFPLEVBQ0wsZUFBZSxFQUNmLG9DQUFvQyxFQUVwQyxzQkFBc0IsRUFDdEIsbUJBQW1CLEdBQ3BCLE1BQU0sOEJBQThCLENBQUM7QUFDdEMsT0FBTyxFQUFDLHVCQUF1QixFQUFpQixNQUFNLDRCQUE0QixDQUFDO0FBQ25GLE9BQU8sRUFDTCwrQkFBK0IsRUFFL0IsMkJBQTJCLEVBRTNCLGFBQWEsR0FDZCxNQUFNLGdCQUFnQixDQUFDO0FBQ3hCLE9BQU8s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b3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbmltcG9ydCB7XG4gIENvbXBpbGVyRmFjYWRlLFxuICBDb3JlRW52aXJvbm1lbnQsXG4gIEV4cG9ydGVkQ29tcGlsZXJGYWNhZGUsXG4gIExlZ2FjeUlucHV0UGFydGlhbE1hcHBpbmcsXG4gIE9wYXF1ZVZhbHVlLFxuICBSM0NvbXBvbmVudE1ldGFkYXRhRmFjYWRlLFxuICBSM0RlY2xhcmVDb21wb25lbnRGYWNhZGUsXG4gIFIzRGVjbGFyZURlcGVuZGVuY3lNZXRhZGF0YUZhY2FkZSxcbiAgUjNEZWNsYXJlRGlyZWN0aXZlRGVwZW5kZW5jeUZhY2FkZSxcbiAgUjNEZWNsYXJlRGlyZWN0aXZlRmFjYWRlLFxuICBSM0RlY2xhcmVGYWN0b3J5RmFjYWRlLFxuICBSM0RlY2xhcmVJbmplY3RhYmxlRmFjYWRlLFxuICBSM0RlY2xhcmVJbmplY3RvckZhY2FkZSxcbiAgUjNEZWNsYXJlTmdNb2R1bGVGYWNhZGUsXG4gIFIzRGVjbGFyZVBpcGVEZXBlbmRlbmN5RmFjYWRlLFxuICBSM0RlY2xhcmVQaXBlRmFjYWRlLFxuICBSM0RlY2xhcmVRdWVyeU1ldGFkYXRhRmFjYWRlLFxuICBSM0RlcGVuZGVuY3lNZXRhZGF0YUZhY2FkZSxcbiAgUjNEaXJlY3RpdmVNZXRhZGF0YUZhY2FkZSxcbiAgUjNGYWN0b3J5RGVmTWV0YWRhdGFGYWNhZGUsXG4gIFIzSW5qZWN0YWJsZU1ldGFkYXRhRmFjYWRlLFxuICBSM0luamVjdG9yTWV0YWRhdGFGYWNhZGUsXG4gIFIzTmdNb2R1bGVNZXRhZGF0YUZhY2FkZSxcbiAgUjNQaXBlTWV0YWRhdGFGYWNhZGUsXG4gIFIzUXVlcnlNZXRhZGF0YUZhY2FkZSxcbiAgUjNUZW1wbGF0ZURlcGVuZGVuY3lGYWNhZGUsXG59IGZyb20gJy4vY29tcGlsZXJfZmFjYWRlX2ludGVyZmFjZSc7XG5pbXBvcnQge0NvbnN0YW50UG9vbH0gZnJvbSAnLi9jb25zdGFudF9wb29sJztcbmltcG9ydCB7XG4gIENoYW5nZURldGVjdGlvblN0cmF0ZWd5LFxuICBIb3N0QmluZGluZyxcbiAgSG9zdExpc3RlbmVyLFxuICBJbnB1dCxcbiAgT3V0cHV0LFxuICBWaWV3RW5jYXBzdWxhdGlvbixcbn0gZnJvbSAnLi9jb3JlJztcbmltcG9ydCB7Y29tcGlsZUluamVjdGFibGV9IGZyb20gJy4vaW5qZWN0YWJsZV9jb21waWxlcl8yJztcbmltcG9ydCB7REVGQVVMVF9JTlRFUlBPTEFUSU9OX0NPTkZJRywgSW50ZXJwb2xhdGlvbkNvbmZpZ30gZnJvbSAnLi9tbF9wYXJzZXIvZGVmYXVsdHMnO1xuaW1wb3J0IHtcbiAgRGVjbGFyZVZhclN0bXQsXG4gIEV4cHJlc3Npb24sXG4gIGxpdGVyYWwsXG4gIExpdGVyYWxFeHByLFxuICBTdGF0ZW1lbnQsXG4gIFN0bXRNb2RpZmllcixcbiAgV3JhcHBlZE5vZGVFeHByLFxufSBmcm9tICcuL291dHB1dC9vdXRwdXRfYXN0JztcbmltcG9ydCB7Sml0RXZhbHVhdG9yfSBmcm9tICcuL291dHB1dC9vdXRwdXRfaml0JztcbmltcG9ydCB7UGFyc2VFcnJvciwgUGFyc2VTb3VyY2VTcGFuLCByM0ppdFR5cGVTb3VyY2VTcGFufSBmcm9tICcuL3BhcnNlX3V0aWwnO1xuaW1wb3J0IHtEZWZlcnJlZEJsb2NrfSBmcm9tICcuL3JlbmRlcjMvcjNfYXN0JztcbmltcG9ydCB7Y29tcGlsZUZhY3RvcnlGdW5jdGlvbiwgRmFjdG9yeVRhcmdldCwgUjNEZXBlbmRlbmN5TWV0YWRhdGF9IGZyb20gJy4vcmVuZGVyMy9yM19mYWN0b3J5JztcbmltcG9ydCB7Y29tcGlsZUluamVjdG9yLCBSM0luamVjdG9yTWV0YWRhdGF9IGZyb20gJy4vcmVuZGVyMy9yM19pbmplY3Rvcl9jb21waWxlcic7XG5pbXBvcnQge1IzSml0UmVmbGVjdG9yfSBmcm9tICcuL3JlbmRlcjMvcjNfaml0JztcbmltcG9ydCB7XG4gIGNvbXBpbGVOZ01vZHVsZSxcbiAgY29tcGlsZU5nTW9kdWxlRGVjbGFyYXRpb25FeHByZXNzaW9uLFxuICBSM05nTW9kdWxlTWV0YWRhdGEsXG4gIFIzTmdNb2R1bGVNZXRhZGF0YUtpbmQsXG4gIFIzU2VsZWN0b3JTY29wZU1vZGUsXG59IGZyb20gJy4vcmVuZGVyMy9yM19tb2R1bGVfY29tcGlsZXInO1xuaW1wb3J0IHtjb21waWxlUGlwZUZyb21NZXRhZGF0YSwgUjNQaXBlTWV0YWRhdGF9IGZyb20gJy4vcmVuZGVyMy9yM19waXBlX2NvbXBpbGVyJztcbmltcG9ydCB7XG4gIGNyZWF0ZU1heUJlRm9yd2FyZFJlZkV4cHJlc3Npb24sXG4gIEZvcndhcmRSZWZIYW5kbGluZyxcbiAgZ2V0U2FmZVByb3BlcnR5QWNjZXNzU3RyaW5nLFxuICBNYXliZUZvcndhcmRSZWZFeHByZXNzaW9uLFxuICB3cmFwUmVmZXJlbmNlLFxufSBmcm9tICcuL3JlbmRlcjMvdXRpbCc7XG5pbXBvcnQge1xuICBEZWNsYXJhdGlvbkxpc3RFbWl0TW9kZSxcbiAgRGVmZXJCbG9ja0RlcHNFbWl0TW9kZSxcbiAgUjNDb21wb25lbnREZWZlck1ldGFkYXRhLFxuICBSM0NvbXBvbmVudE1ldGFkYXRhLFxuICBSM0RpcmVjdGl2ZURlcGVuZGVuY3lNZXRhZGF0YSxcbiAgUjNEaXJlY3RpdmVNZXRhZGF0YSxcbiAgUjNIb3N0RGlyZWN0aXZlTWV0YWRhdGEsXG4gIFIzSG9zdE1ldGFkYXRhLFxuICBSM0lucHV0TWV0YWRhdGEsXG4gIFIzUGlwZURlcGVuZGVuY3lNZXRhZGF0YSxcbiAgUjNRdWVyeU1ldGFkYXRhLFxuICBSM1RlbXBsYXRlRGVwZW5kZW5jeSxcbiAgUjNUZW1wbGF0ZURlcGVuZGVuY3lLaW5kLFxuICBSM1RlbXBsYXRlRGVwZW5kZW5jeU1ldGFkYXRhLFxufSBmcm9tICcuL3JlbmRlcjMvdmlldy9hcGknO1xuaW1wb3J0IHtcbiAgY29tcGlsZUNvbXBvbmVudEZyb21NZXRhZGF0YSxcbiAgY29tcGlsZURpcmVjdGl2ZUZyb21NZXRhZGF0YSxcbiAgUGFyc2VkSG9zdEJpbmRpbmdzLFxuICBwYXJzZUhvc3RCaW5kaW5ncyxcbiAgdmVyaWZ5SG9zdEJpbmRpbmdzLFxufSBmcm9tICcuL3JlbmRlcjMvdmlldy9jb21waWxlcic7XG5cbmltcG9ydCB0eXBlIHtCb3VuZFRhcmdldH0gZnJvbSAnLi9yZW5kZXIzL3ZpZXcvdDJfYXBpJztcbmltcG9ydCB7UjNUYXJnZXRCaW5kZXJ9IGZyb20gJy4vcmVuZGVyMy92aWV3L3QyX2JpbmRlcic7XG5pbXBvcnQge21ha2VCaW5kaW5nUGFyc2VyLCBwYXJzZVRlbXBsYXRlfSBmcm9tICcuL3JlbmRlcjMvdmlldy90ZW1wbGF0ZSc7XG5pbXBvcnQge1Jlc291cmNlTG9hZGVyfSBmcm9tICcuL3Jlc291cmNlX2xvYWRlcic7XG5pbXBvcnQge0RvbUVsZW1lbnRTY2hlbWFSZWdpc3RyeX0gZnJvbSAnLi9zY2hlbWEvZG9tX2VsZW1lbnRfc2NoZW1hX3JlZ2lzdHJ5JztcbmltcG9ydCB7U2VsZWN0b3JNYXRjaGVyfSBmcm9tICcuL3NlbGVjdG9yJztcblxuZXhwb3J0IGNsYXNzIENvbXBpbGVyRmFjYWRlSW1wbCBpbXBsZW1lbnRzIENvbXBpbGVyRmFjYWRlIHtcbiAgRmFjdG9yeVRhcmdldCA9IEZhY3RvcnlUYXJnZXQ7XG4gIFJlc291cmNlTG9hZGVyID0gUmVzb3VyY2VMb2FkZXI7XG4gIHByaXZhdGUgZWxlbWVudFNjaGVtYVJlZ2lzdHJ5ID0gbmV3IERvbUVsZW1lbnRTY2hlbWFSZWdpc3RyeSgpO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgaml0RXZhbHVhdG9yID0gbmV3IEppdEV2YWx1YXRvcigpKSB7fVxuXG4gIGNvbXBpbGVQaXBlKFxuICAgIGFuZ3VsYXJDb3JlRW52OiBDb3JlRW52aXJvbm1lbnQsXG4gICAgc291cmNlTWFwVXJsOiBzdHJpbmcsXG4gICAgZmFjYWRlOiBSM1BpcGVNZXRhZGF0YUZhY2FkZSxcbiAgKTogYW55IHtcbiAgICBjb25zdCBtZXRhZGF0YTogUjNQaXBlTWV0YWRhdGEgPSB7XG4gICAgICBuYW1lOiBmYWNhZGUubmFtZSxcbiAgICAgIHR5cGU6IHdyYXBSZWZlcmVuY2UoZmFjYWRlLnR5cGUpLFxuICAgICAgdHlwZUFyZ3VtZW50Q291bnQ6IDAsXG4gICAgICBkZXBzOiBudWxsLFxuICAgICAgcGlwZU5hbWU6IGZhY2FkZS5waXBlTmFtZSxcbiAgICAgIHB1cmU6IGZhY2FkZS5wdXJlLFxuICAgICAgaXNTdGFuZGFsb25lOiBmYWNhZGUuaXNTdGFuZGFsb25lLFxuICAgIH07XG4gICAgY29uc3QgcmVzID0gY29tcGlsZVBpcGVGcm9tTWV0YWRhdGEobWV0YWRhdGEpO1xuICAgIHJldHVybiB0aGlzLmppdEV4cHJlc3Npb24ocmVzLmV4cHJlc3Npb24sIGFuZ3VsYXJDb3JlRW52LCBzb3VyY2VNYXBVcmwsIFtdKTtcbiAgfVxuXG4gIGNvbXBpbGVQaXBlRGVjbGFyYXRpb24oXG4gICAgYW5ndWxhckNvcmVFbnY6IENvcmVFbnZpcm9ubWVudCxcbiAgICBzb3VyY2VNYXBVcmw6IHN0cmluZyxcbiAgICBkZWNsYXJhdGlvbjogUjNEZWNsYXJlUGlwZUZhY2FkZSxcbiAgKTogYW55IHtcbiAgICBjb25zdCBtZXRhID0gY29udmVydERlY2xhcmVQaXBlRmFjYWRlVG9NZXRhZGF0YShkZWNsYXJhdGlvbik7XG4gICAgY29uc3QgcmVzID0gY29tcGlsZVBpcGVGcm9tTWV0YWRhdGEobWV0YSk7XG4gICAgcmV0dXJuIHRoaXMuaml0RXhwcmVzc2lvbihyZXMuZXhwcmVzc2lvbiwgYW5ndWxhckNvcmVFbnYsIHNvdXJjZU1hcFVybCwgW10pO1xuICB9XG5cbiAgY29tcGlsZUluamVjdGFibGUoXG4gICAgYW5ndWxhckNvcmVFbnY6IENvcmVFbnZpcm9ubWVudCxcbiAgICBzb3VyY2VNYXBVcmw6IHN0cmluZyxcbiAgICBmYWNhZGU6IFIzSW5qZWN0YWJsZU1ldGFkYXRhRmFjYWRlLFxuICApOiBhbnkge1xuICAgIGNvbnN0IHtleHByZXNzaW9uLCBzdGF0ZW1lbnRzfSA9IGNvbXBpbGVJbmplY3RhYmxlKFxuICAgICAge1xuICAgICAgICBuYW1lOiBmYWNhZGUubmFtZSxcbiAgICAgICAgdHlwZTogd3JhcFJlZmVyZW5jZShmYWNhZGUudHlwZSksXG4gICAgICAgIHR5cGVBcmd1bWVudENvdW50OiBmYWNhZGUudHlwZUFyZ3VtZW50Q291bnQsXG4gICAgICAgIHByb3ZpZGVkSW46IGNvbXB1dGVQcm92aWRlZEluKGZhY2FkZS5wcm92aWRlZEluKSxcbiAgICAgICAgdXNlQ2xhc3M6IGNvbnZlcnRUb1Byb3ZpZGVyRXhwcmVzc2lvbihmYWNhZGUsICd1c2VDbGFzcycpLFxuICAgICAgICB1c2VGYWN0b3J5OiB3cmFwRXhwcmVzc2lvbihmYWNhZGUsICd1c2VGYWN0b3J5JyksXG4gICAgICAgIHVzZVZhbHVlOiBjb252ZXJ0VG9Qcm92aWRlckV4cHJlc3Npb24oZmFjYWRlLCAndXNlVmFsdWUnKSxcbiAgICAgICAgdXNlRXhpc3Rpbmc6IGNvbnZlcnRUb1Byb3ZpZGVyRXhwcmVzc2lvbihmYWNhZGUsICd1c2VFeGlzdGluZycpLFxuICAgICAgICBkZXBzOiBmYWNhZGUuZGVwcz8ubWFwKGNvbnZlcnRSM0RlcGVuZGVuY3lNZXRhZGF0YSksXG4gICAgICB9LFxuICAgICAgLyogcmVzb2x2ZUZvcndhcmRSZWZzICovIHRydWUsXG4gICAgKTtcblxuICAgIHJldHVybiB0aGlzLmppdEV4cHJlc3Npb24oZXhwcmVzc2lvbiwgYW5ndWxhckNvcmVFbnYsIHNvdXJjZU1hcFVybCwgc3RhdGVtZW50cyk7XG4gIH1cblxuICBjb21waWxlSW5qZWN0YWJsZURlY2xhcmF0aW9uKFxuICAgIGFuZ3VsYXJDb3JlRW52OiBDb3JlRW52aXJvbm1lbnQsXG4gICAgc291cmNlTWFwVXJsOiBzdHJpbmcsXG4gICAgZmFjYWRlOiBSM0RlY2xhcmVJbmplY3RhYmxlRmFjYWRlLFxuICApOiBhbnkge1xuICAgIGNvbnN0IHtleHByZXNzaW9uLCBzdGF0ZW1lbnRzfSA9IGNvbXBpbGVJbmplY3RhYmxlKFxuICAgICAge1xuICAgICAgICBuYW1lOiBmYWNhZGUudHlwZS5uYW1lLFxuICAgICAgICB0eXBlOiB3cmFwUmVmZXJlbmNlKGZhY2FkZS50eXBlKSxcbiAgICAgICAgdHlwZUFyZ3VtZW50Q291bnQ6IDAsXG4gICAgICAgIHByb3ZpZGVkSW46IGNvbXB1dGVQcm92aWRlZEluKGZhY2FkZS5wcm92aWRlZEluKSxcbiAgICAgICAgdXNlQ2xhc3M6IGNvbnZlcnRUb1Byb3ZpZGVyRXhwcmVzc2lvbihmYWNhZGUsICd1c2VDbGFzcycpLFxuICAgICAgICB1c2VGYWN0b3J5OiB3cmFwRXhwcmVzc2lvbihmYWNhZGUsICd1c2VGYWN0b3J5JyksXG4gICAgICAgIHVzZVZhbHVlOiBjb252ZXJ0VG9Qcm92aWRlckV4cHJlc3Npb24oZmFjYWRlLCAndXNlVmFsdWUnKSxcbiAgICAgICAgdXNlRXhpc3Rpbmc6IGNvbnZlcnRUb1Byb3ZpZGVyRXhwcmVzc2lvbihmYWNhZGUsICd1c2VFeGlzdGluZycpLFxuICAgICAgICBkZXBzOiBmYWNhZGUuZGVwcz8ubWFwKGNvbnZlcnRSM0RlY2xhcmVEZXBlbmRlbmN5TWV0YWRhdGEpLFxuICAgICAgfSxcbiAgICAgIC8qIHJlc29sdmVGb3J3YXJkUmVmcyAqLyB0cnVlLFxuICAgICk7XG5cbiAgICByZXR1cm4gdGhpcy5qaXRFeHByZXNzaW9uKGV4cHJlc3Npb24sIGFuZ3VsYXJDb3JlRW52LCBzb3VyY2VNYXBVcmwsIHN0YXRlbWVudHMpO1xuICB9XG5cbiAgY29tcGlsZUluamVjdG9yKFxuICAgIGFuZ3VsYXJDb3JlRW52OiBDb3JlRW52aXJvbm1lbnQsXG4gICAgc291cmNlTWFwVXJsOiBzdHJpbmcsXG4gICAgZmFjYWRlOiBSM0luamVjdG9yTWV0YWRhdGFGYWNhZGUsXG4gICk6IGFueSB7XG4gICAgY29uc3QgbWV0YTogUjNJbmplY3Rvck1ldGFkYXRhID0ge1xuICAgICAgbmFtZTogZmFjYWRlLm5hbWUsXG4gICAgICB0eXBlOiB3cmFwUmVmZXJlbmNlKGZhY2FkZS50eXBlKSxcbiAgICAgIHByb3ZpZGVyczpcbiAgICAgICAgZmFjYWRlLnByb3ZpZGVycyAmJiBmYWNhZGUucHJvdmlkZXJzLmxlbmd0aCA+IDBcbiAgICAgICAgICA/IG5ldyBXcmFwcGVkTm9kZUV4cHIoZmFjYWRlLnByb3ZpZGVycylcbiAgICAgICAgICA6IG51bGwsXG4gICAgICBpbXBvcnRzOiBmYWNhZGUuaW1wb3J0cy5tYXAoKGkpID0+IG5ldyBXcmFwcGVkTm9kZUV4cHIoaSkpLFxuICAgIH07XG4gICAgY29uc3QgcmVzID0gY29tcGlsZUluamVjdG9yKG1ldGEpO1xuICAgIHJldHVybiB0aGlzLmppdEV4cHJlc3Npb24ocmVzLmV4cHJlc3Npb24sIGFuZ3VsYXJDb3JlRW52LCBzb3VyY2VNYXBVcmwsIFtdKTtcbiAgfVxuXG4gIGNvbXBpbGVJbmplY3RvckRlY2xhcmF0aW9uKFxuICAgIGFuZ3VsYXJDb3JlRW52OiBDb3JlRW52aXJvbm1lbnQsXG4gICAgc291cmNlTWFwVXJsOiBzdHJpbmcsXG4gICAgZGVjbGFyYXRpb246IFIzRGVjbGFyZUluamVjdG9yRmFjYWRlLFxuICApOiBhbnkge1xuICAgIGNvbnN0IG1ldGEgPSBjb252ZXJ0RGVjbGFyZUluamVjdG9yRmFjYWRlVG9NZXRhZGF0YShkZWNsYXJhdGlvbik7XG4gICAgY29uc3QgcmVzID0gY29tcGlsZUluamVjdG9yKG1ldGEpO1xuICAgIHJldHVybiB0aGlzLmppdEV4cHJlc3Npb24ocmVzLmV4cHJlc3Npb24sIGFuZ3VsYXJDb3JlRW52LCBzb3VyY2VNYXBVcmwsIFtdKTtcbiAgfVxuXG4gIGNvbXBpbGVOZ01vZHVsZShcbiAgICBhbmd1bGFyQ29yZUVudjogQ29yZUVudmlyb25tZW50LFxuICAgIHNvdXJjZU1hcFVybDogc3RyaW5nLFxuICAgIGZhY2FkZTogUjNOZ01vZHVsZU1ldGFkYXRhRmFjYWRlLFxuICApOiBhbnkge1xuICAgIGNvbnN0IG1ldGE6IFIzTmdNb2R1bGVNZXRhZGF0YSA9IHtcbiAgICAgIGtpbmQ6IFIzTmdNb2R1bGVNZXRhZGF0YUtpbmQuR2xvYmFsLFxuICAgICAgdHlwZTogd3JhcFJlZmVyZW5jZShmYWNhZGUudHlwZSksXG4gICAgICBib290c3RyYXA6IGZhY2FkZS5ib290c3RyYXAubWFwKHdyYXBSZWZlcmVuY2UpLFxuICAgICAgZGVjbGFyYXRpb25zOiBmYWNhZGUuZGVjbGFyYXRpb25zLm1hcCh3cmFwUmVmZXJlbmNlKSxcbiAgICAgIHB1YmxpY0RlY2xhcmF0aW9uVHlwZXM6IG51bGwsIC8vIG9ubHkgbmVlZGVkIGZvciB0eXBlcyBpbiBBT1RcbiAgICAgIGltcG9ydHM6IGZhY2FkZS5pbXBvcnRzLm1hcCh3cmFwUmVmZXJlbmNlKSxcbiAgICAgIGluY2x1ZGVJbXBvcnRUeXBlczogdHJ1ZSxcbiAgICAgIGV4cG9ydHM6IGZhY2FkZS5leHBvcnRzLm1hcCh3cmFwUmVmZXJlbmNlKSxcbiAgICAgIHNlbGVjdG9yU2NvcGVNb2RlOiBSM1NlbGVjdG9yU2NvcGVNb2RlLklubGluZSxcbiAgICAgIGNvbnRhaW5zRm9yd2FyZERlY2xzOiBmYWxzZSxcbiAgICAgIHNjaGVtYXM6IGZhY2FkZS5zY2hlbWFzID8gZmFjYWRlLnNjaGVtYXMubWFwKHdyYXBSZWZlcmVuY2UpIDogbnVsbCxcbiAgICAgIGlkOiBmYWNhZGUuaWQgPyBuZXcgV3JhcHBlZE5vZGVFeHByKGZhY2FkZS5pZCkgOiBudWxsLFxuICAgIH07XG4gICAgY29uc3QgcmVzID0gY29tcGlsZU5nTW9kdWxlKG1ldGEpO1xuICAgIHJldHVybiB0aGlzLmppdEV4cHJlc3Npb24ocmVzLmV4cHJlc3Npb24sIGFuZ3VsYXJDb3JlRW52LCBzb3VyY2VNYXBVcmwsIFtdKTtcbiAgfVxuXG4gIGNvbXBpbGVOZ01vZHVsZURlY2xhcmF0aW9uKFxuICAgIGFuZ3VsYXJDb3JlRW52OiBDb3JlRW52aXJvbm1lbnQsXG4gICAgc291cmNlTWFwVXJsOiBzdHJpbmcsXG4gICAgZGVjbGFyYXRpb246IFIzRGVjbGFyZU5nTW9kdWxlRmFjYWRlLFxuICApOiBhbnkge1xuICAgIGNvbnN0IGV4cHJlc3Npb24gPSBjb21waWxlTmdNb2R1bGVEZWNsYXJhdGlvbkV4cHJlc3Npb24oZGVjbGFyYXRpb24pO1xuICAgIHJldHVybiB0aGlzLmppdEV4cHJlc3Npb24oZXhwcmVzc2lvbiwgYW5ndWxhckNvcmVFbnYsIHNvdXJjZU1hcFVybCwgW10pO1xuICB9XG5cbiAgY29tcGlsZURpcmVjdGl2ZShcbiAgICBhbmd1bGFyQ29yZUVudjogQ29yZUVudmlyb25tZW50LFxuICAgIHNvdXJjZU1hcFVybDogc3RyaW5nLFxuICAgIGZhY2FkZTogUjNEaXJlY3RpdmVNZXRhZGF0YUZhY2FkZSxcbiAgKTogYW55IHtcbiAgICBjb25zdCBtZXRhOiBSM0RpcmVjdGl2ZU1ldGFkYXRhID0gY29udmVydERpcmVjdGl2ZUZhY2FkZVRvTWV0YWRhdGEoZmFjYWRlKTtcbiAgICByZXR1cm4gdGhpcy5jb21waWxlRGlyZWN0aXZlRnJvbU1ldGEoYW5ndWxhckNvcmVFbnYsIHNvdXJjZU1hcFVybCwgbWV0YSk7XG4gIH1cblxuICBjb21waWxlRGlyZWN0aXZlRGVjbGFyYXRpb24oXG4gICAgYW5ndWxhckNvcmVFbnY6IENvcmVFbnZpcm9ubWVudCxcbiAgICBzb3VyY2VNYXBVcmw6IHN0cmluZyxcbiAgICBkZWNsYXJhdGlvbjogUjNEZWNsYXJlRGlyZWN0aXZlRmFjYWRlLFxuICApOiBhbnkge1xuICAgIGNvbnN0IHR5cGVTb3VyY2VTcGFuID0gdGhpcy5jcmVhdGVQYXJzZVNvdXJjZVNwYW4oXG4gICAgICAnRGlyZWN0aXZlJyxcbiAgICAgIGRlY2xhcmF0aW9uLnR5cGUubmFtZSxcbiAgICAgIHNvdXJjZU1hcFVybCxcbiAgICApO1xuICAgIGNvbnN0IG1ldGEgPSBjb252ZXJ0RGVjbGFyZURpcmVjdGl2ZUZhY2FkZVRvTWV0YWRhdGEoZGVjbGFyYXRpb24sIHR5cGVTb3VyY2VTcGFuKTtcbiAgICByZXR1cm4gdGhpcy5jb21waWxlRGlyZWN0aXZlRnJvbU1ldGEoYW5ndWxhckNvcmVFbnYsIHNvdXJjZU1hcFVybCwgbWV0YSk7XG4gIH1cblxuICBwcml2YXRlIGNvbXBpbGVEaXJlY3RpdmVGcm9tTWV0YShcbiAgICBhbmd1bGFyQ29yZUVudjogQ29yZUVudmlyb25tZW50LFxuICAgIHNvdXJjZU1hcFVybDogc3RyaW5nLFxuICAgIG1ldGE6IFIzRGlyZWN0aXZlTWV0YWRhdGEsXG4gICk6IGFueSB7XG4gICAgY29uc3QgY29uc3RhbnRQb29sID0gbmV3IENvbnN0YW50UG9vbCgpO1xuICAgIGNvbnN0IGJpbmRpbmdQYXJzZXIgPSBtYWtlQmluZGluZ1BhcnNlcigpO1xuICAgIGNvbnN0IHJlcyA9IGNvbXBpbGVEaXJlY3RpdmVGcm9tTWV0YWRhdGEobWV0YSwgY29uc3RhbnRQb29sLCBiaW5kaW5nUGFyc2VyKTtcbiAgICByZXR1cm4gdGhpcy5qaXRFeHByZXNzaW9uKFxuICAgICAgcmVzLmV4cHJlc3Npb24sXG4gICAgICBhbmd1bGFyQ29yZUVudixcbiAgICAgIHNvdXJjZU1hcFVybCxcbiAgICAgIGNvbnN0YW50UG9vbC5zdGF0ZW1lbnRzLFxuICAgICk7XG4gIH1cblxuICBjb21waWxlQ29tcG9uZW50KFxuICAgIGFuZ3VsYXJDb3JlRW52OiBDb3JlRW52aXJvbm1lbnQsXG4gICAgc291cmNlTWFwVXJsOiBzdHJpbmcsXG4gICAgZmFjYWRlOiBSM0NvbXBvbmVudE1ldGFkYXRhRmFjYWRlLFxuICApOiBhbnkge1xuICAgIC8vIFBhcnNlIHRoZSB0ZW1wbGF0ZSBhbmQgY2hlY2sgZm9yIGVycm9ycy5cbiAgICBjb25zdCB7dGVtcGxhdGUsIGludGVycG9sYXRpb24sIGRlZmVyfSA9IHBhcnNlSml0VGVtcGxhdGUoXG4gICAgICBmYWNhZGUudGVtcGxhdGUsXG4gICAgICBmYWNhZGUubmFtZSxcbiAgICAgIHNvdXJjZU1hcFVybCxcbiAgICAgIGZhY2FkZS5wcmVzZXJ2ZVdoaXRlc3BhY2VzLFxuICAgICAgZmFjYWRlLmludGVycG9sYXRpb24sXG4gICAgICB1bmRlZmluZWQsXG4gICAgKTtcblxuICAgIC8vIENvbXBpbGUgdGhlIGNvbXBvbmVudCBtZXRhZGF0YSwgaW5jbHVkaW5nIHRlbXBsYXRlLCBpbnRvIGFuIGV4cHJlc3Npb24uXG4gICAgY29uc3QgbWV0YTogUjNDb21wb25lbnRNZXRhZGF0YTxSM1RlbXBsYXRlRGVwZW5kZW5jeT4gPSB7XG4gICAgICAuLi5mYWNhZGUsXG4gICAgICAuLi5jb252ZXJ0RGlyZWN0aXZlRmFjYWRlVG9NZXRhZGF0YShmYWNhZGUpLFxuICAgICAgc2VsZWN0b3I6IGZhY2FkZS5zZWxlY3RvciB8fCB0aGlzLmVsZW1lbnRTY2hlbWFSZWdpc3RyeS5nZXREZWZhdWx0Q29tcG9uZW50RWxlbWVudE5hbWUoKSxcbiAgICAgIHRlbXBsYXRlLFxuICAgICAgZGVjbGFyYXRpb25zOiBmYWNhZGUuZGVjbGFyYXRpb25zLm1hcChjb252ZXJ0RGVjbGFyYXRpb25GYWNhZGVUb01ldGFkYXRhKSxcbiAgICAgIGRlY2xhcmF0aW9uTGlzdEVtaXRNb2RlOiBEZWNsYXJhdGlvbkxpc3RFbWl0TW9kZS5EaXJlY3QsXG4gICAgICBkZWZlcixcblxuICAgICAgc3R5bGVzOiBbLi4uZmFjYWRlLnN0eWxlcywgLi4udGVtcGxhdGUuc3R5bGVzXSxcbiAgICAgIGVuY2Fwc3VsYXRpb246IGZhY2FkZS5lbmNhcHN1bGF0aW9uLFxuICAgICAgaW50ZXJwb2xhdGlvbixcbiAgICAgIGNoYW5nZURldGVjdGlvbjogZmFjYWRlLmNoYW5nZURldGVjdGlvbiA/PyBudWxsLFxuICAgICAgYW5pbWF0aW9uczogZmFjYWRlLmFuaW1hdGlvbnMgIT0gbnVsbCA/IG5ldyBXcmFwcGVkTm9kZUV4cHIoZmFjYWRlLmFuaW1hdGlvbnMpIDogbnVsbCxcbiAgICAgIHZpZXdQcm92aWRlcnM6XG4gICAgICAgIGZhY2FkZS52aWV3UHJvdmlkZXJzICE9IG51bGwgPyBuZXcgV3JhcHBlZE5vZGVFeHByKGZhY2FkZS52aWV3UHJvdmlkZXJzKSA6IG51bGwsXG4gICAgICByZWxhdGl2ZUNvbnRleHRGaWxlUGF0aDogJycsXG4gICAgICBpMThuVXNlRXh0ZXJuYWxJZHM6IHRydWUsXG4gICAgfTtcbiAgICBjb25zdCBqaXRFeHByZXNzaW9uU291cmNlTWFwID0gYG5nOi8vLyR7ZmFjYWRlLm5hbWV9LmpzYDtcbiAgICByZXR1cm4gdGhpcy5jb21waWxlQ29tcG9uZW50RnJvbU1ldGEoYW5ndWxhckNvcmVFbnYsIGppdEV4cHJlc3Npb25Tb3VyY2VNYXAsIG1ldGEpO1xuICB9XG5cbiAgY29tcGlsZUNvbXBvbmVudERlY2xhcmF0aW9uKFxuICAgIGFuZ3VsYXJDb3JlRW52OiBDb3JlRW52aXJvbm1lbnQsXG4gICAgc291cmNlTWFwVXJsOiBzdHJpbmcsXG4gICAgZGVjbGFyYXRpb246IFIzRGVjbGFyZUNvbXBvbmVudEZhY2FkZSxcbiAgKTogYW55IHtcbiAgICBjb25zdCB0eXBlU291cmNlU3BhbiA9IHRoaXMuY3JlYXRlUGFyc2VTb3VyY2VTcGFuKFxuICAgICAgJ0NvbXBvbmVudCcsXG4gICAgICBkZWNsYXJhdGlvbi50eXBlLm5hbWUsXG4gICAgICBzb3VyY2VNYXBVcmwsXG4gICAgKTtcbiAgICBjb25zdCBtZXRhID0gY29udmVydERlY2xhcmVDb21wb25lbnRGYWNhZGVUb01ldGFkYXRhKGRlY2xhcmF0aW9uLCB0eXBlU291cmNlU3Bhbiwgc291cmNlTWFwVXJsKTtcbiAgICByZXR1cm4gdGhpcy5jb21waWxlQ29tcG9uZW50RnJvbU1ldGEoYW5ndWxhckNvcmVFbnYsIHNvdXJjZU1hcFVybCwgbWV0YSk7XG4gIH1cblxuICBwcml2YXRlIGNvbXBpbGVDb21wb25lbnRGcm9tTWV0YShcbiAgICBhbmd1bGFyQ29yZUVudjogQ29yZUVudmlyb25tZW50LFxuICAgIHNvdXJjZU1hcFVybDogc3RyaW5nLFxuICAgIG1ldGE6IFIzQ29tcG9uZW50TWV0YWRhdGE8UjNUZW1wbGF0ZURlcGVuZGVuY3k+LFxuICApOiBhbnkge1xuICAgIGNvbnN0IGNvbnN0YW50UG9vbCA9IG5ldyBDb25zdGFudFBvb2woKTtcbiAgICBjb25zdCBiaW5kaW5nUGFyc2VyID0gbWFrZUJpbmRpbmdQYXJzZXIobWV0YS5pbnRlcnBvbGF0aW9uKTtcbiAgICBjb25zdCByZXMgPSBjb21waWxlQ29tcG9uZW50RnJvbU1ldGFkYXRhKG1ldGEsIGNvbnN0YW50UG9vbCwgYmluZGluZ1BhcnNlcik7XG4gICAgcmV0dXJuIHRoaXMuaml0RXhwcmVzc2lvbihcbiAgICAgIHJlcy5leHByZXNzaW9uLFxuICAgICAgYW5ndWxhckNvcmVFbnYsXG4gICAgICBzb3VyY2VNYXBVcmwsXG4gICAgICBjb25zdGFudFBvb2wuc3RhdGVtZW50cyxcbiAgICApO1xuICB9XG5cbiAgY29tcGlsZUZhY3RvcnkoXG4gICAgYW5ndWxhckNvcmVFbnY6IENvcmVFbnZpcm9ubWVudCxcbiAgICBzb3VyY2VNYXBVcmw6IHN0cmluZyxcbiAgICBtZXRhOiBSM0ZhY3RvcnlEZWZNZXRhZGF0YUZhY2FkZSxcbiAgKSB7XG4gICAgY29uc3QgZmFjdG9yeVJlcyA9IGNvbXBpbGVGYWN0b3J5RnVuY3Rpb24oe1xuICAgICAgbmFtZTogbWV0YS5uYW1lLFxuICAgICAgdHlwZTogd3JhcFJlZmVyZW5jZShtZXRhLnR5cGUpLFxuICAgICAgdHlwZUFyZ3VtZW50Q291bnQ6IG1ldGEudHlwZUFyZ3VtZW50Q291bnQsXG4gICAgICBkZXBzOiBjb252ZXJ0UjNEZXBlbmRlbmN5TWV0YWRhdGFBcnJheShtZXRhLmRlcHMpLFxuICAgICAgdGFyZ2V0OiBtZXRhLnRhcmdldCxcbiAgICB9KTtcbiAgICByZXR1cm4gdGhpcy5qaXRFeHByZXNzaW9uKFxuICAgICAgZmFjdG9yeVJlcy5leHByZXNzaW9uLFxuICAgICAgYW5ndWxhckNvcmVFbnYsXG4gICAgICBzb3VyY2VNYXBVcmwsXG4gICAgICBmYWN0b3J5UmVzLnN0YXRlbWVudHMsXG4gICAgKTtcbiAgfVxuXG4gIGNvbXBpbGVGYWN0b3J5RGVjbGFyYXRpb24oXG4gICAgYW5ndWxhckNvcmVFbnY6IENvcmVFbnZpcm9ubWVudCxcbiAgICBzb3VyY2VNYXBVcmw6IHN0cmluZyxcbiAgICBtZXRhOiBSM0RlY2xhcmVGYWN0b3J5RmFjYWRlLFxuICApIHtcbiAgICBjb25zdCBmYWN0b3J5UmVzID0gY29tcGlsZUZhY3RvcnlGdW5jdGlvbih7XG4gICAgICBuYW1lOiBtZXRhLnR5cGUubmFtZSxcbiAgICAgIHR5cGU6IHdyYXBSZWZlcmVuY2UobWV0YS50eXBlKSxcbiAgICAgIHR5cGVBcmd1bWVudENvdW50OiAwLFxuICAgICAgZGVwczogQXJyYXkuaXNBcnJheShtZXRhLmRlcHMpXG4gICAgICAgID8gbWV0YS5kZXBzLm1hcChjb252ZXJ0UjNEZWNsYXJlRGVwZW5kZW5jeU1ldGFkYXRhKVxuICAgICAgICA6IG1ldGEuZGVwcyxcbiAgICAgIHRhcmdldDogbWV0YS50YXJnZXQsXG4gICAgfSk7XG4gICAgcmV0dXJuIHRoaXMuaml0RXhwcmVzc2lvbihcbiAgICAgIGZhY3RvcnlSZXMuZXhwcmVzc2lvbixcbiAgICAgIGFuZ3VsYXJDb3JlRW52LFxuICAgICAgc291cmNlTWFwVXJsLFxuICAgICAgZmFjdG9yeVJlcy5zdGF0ZW1lbnRzLFxuICAgICk7XG4gIH1cblxuICBjcmVhdGVQYXJzZVNvdXJjZVNwYW4oa2luZDogc3RyaW5nLCB0eXBlTmFtZTogc3RyaW5nLCBzb3VyY2VVcmw6IHN0cmluZyk6IFBhcnNlU291cmNlU3BhbiB7XG4gICAgcmV0dXJuIHIzSml0VHlwZVNvdXJjZVNwYW4oa2luZCwgdHlwZU5hbWUsIHNvdXJjZVVybCk7XG4gIH1cblxuICAvKipcbiAgICogSklUIGNvbXBpbGVzIGFuIGV4cHJlc3Npb24gYW5kIHJldHVybnMgdGhlIHJlc3VsdCBvZiBleGVjdXRpbmcgdGhhdCBleHByZXNzaW9uLlxuICAgKlxuICAgKiBAcGFyYW0gZGVmIHRoZSBkZWZpbml0aW9uIHdoaWNoIHdpbGwgYmUgY29tcGlsZWQgYW5kIGV4ZWN1dGVkIHRvIGdldCB0aGUgdmFsdWUgdG8gcGF0Y2hcbiAgICogQHBhcmFtIGNvbnRleHQgYW4gb2JqZWN0IG1hcCBvZiBAYW5ndWxhci9jb3JlIHN5bWJvbCBuYW1lcyB0byBzeW1ib2xzIHdoaWNoIHdpbGwgYmUgYXZhaWxhYmxlXG4gICAqIGluIHRoZSBjb250ZXh0IG9mIHRoZSBjb21waWxlZCBleHByZXNzaW9uXG4gICAqIEBwYXJhbSBzb3VyY2VVcmwgYSBVUkwgdG8gdXNlIGZvciB0aGUgc291cmNlIG1hcCBvZiB0aGUgY29tcGlsZWQgZXhwcmVzc2lvblxuICAgKiBAcGFyYW0gcHJlU3RhdGVtZW50cyBhIGNvbGxlY3Rpb24gb2Ygc3RhdGVtZW50cyB0aGF0IHNob3VsZCBiZSBldmFsdWF0ZWQgYmVmb3JlIHRoZSBleHByZXNzaW9uLlxuICAgKi9cbiAgcHJpdmF0ZSBqaXRFeHByZXNzaW9uKFxuICAgIGRlZjogRXhwcmVzc2lvbixcbiAgICBjb250ZXh0OiB7W2tleTogc3RyaW5nXTogYW55fSxcbiAgICBzb3VyY2VVcmw6IHN0cmluZyxcbiAgICBwcmVTdGF0ZW1lbnRzOiBTdGF0ZW1lbnRbXSxcbiAgKTogYW55IHtcbiAgICAvLyBUaGUgQ29uc3RhbnRQb29sIG1heSBjb250YWluIFN0YXRlbWVudHMgd2hpY2ggZGVjbGFyZSB2YXJpYWJsZXMgdXNlZCBpbiB0aGUgZmluYWwgZXhwcmVzc2lvbi5cbiAgICAvLyBUaGVyZWZvcmUsIGl0cyBzdGF0ZW1lbnRzIG5lZWQgdG8gcHJlY2VkZSB0aGUgYWN0dWFsIEpJVCBvcGVyYXRpb24uIFRoZSBmaW5hbCBzdGF0ZW1lbnQgaXMgYVxuICAgIC8vIGRlY2xhcmF0aW9uIG9mICRkZWYgd2hpY2ggaXMgc2V0IHRvIHRoZSBleHByZXNzaW9uIGJlaW5nIGNvbXBpbGVkLlxuICAgIGNvbnN0IHN0YXRlbWVudHM6IFN0YXRlbWVudFtdID0gW1xuICAgICAgLi4ucHJlU3RhdGVtZW50cyxcbiAgICAgIG5ldyBEZWNsYXJlVmFyU3RtdCgnJGRlZicsIGRlZiwgdW5kZWZpbmVkLCBTdG10TW9kaWZpZXIuRXhwb3J0ZWQpLFxuICAgIF07XG5cbiAgICBjb25zdCByZXMgPSB0aGlzLmppdEV2YWx1YXRvci5ldmFsdWF0ZVN0YXRlbWVudHMoXG4gICAgICBzb3VyY2VVcmwsXG4gICAgICBzdGF0ZW1lbnRzLFxuICAgICAgbmV3IFIzSml0UmVmbGVjdG9yKGNvbnRleHQpLFxuICAgICAgLyogZW5hYmxlU291cmNlTWFwcyAqLyB0cnVlLFxuICAgICk7XG4gICAgcmV0dXJuIHJlc1snJGRlZiddO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNvbnZlcnRUb1IzUXVlcnlNZXRhZGF0YShmYWNhZGU6IFIzUXVlcnlNZXRhZGF0YUZhY2FkZSk6IFIzUXVlcnlNZXRhZGF0YSB7XG4gIHJldHVybiB7XG4gICAgLi4uZmFjYWRlLFxuICAgIGlzU2lnbmFsOiBmYWNhZGUuaXNTaWduYWwsXG4gICAgcHJlZGljYXRlOiBjb252ZXJ0UXVlcnlQcmVkaWNhdGUoZmFjYWRlLnByZWRpY2F0ZSksXG4gICAgcmVhZDogZmFjYWRlLnJlYWQgPyBuZXcgV3JhcHBlZE5vZGVFeHByKGZhY2FkZS5yZWFkKSA6IG51bGwsXG4gICAgc3RhdGljOiBmYWNhZGUuc3RhdGljLFxuICAgIGVtaXREaXN0aW5jdENoYW5nZXNPbmx5OiBmYWNhZGUuZW1pdERpc3RpbmN0Q2hhbmdlc09ubHksXG4gIH07XG59XG5cbmZ1bmN0aW9uIGNvbnZlcnRRdWVyeURlY2xhcmF0aW9uVG9NZXRhZGF0YShcbiAgZGVjbGFyYXRpb246IFIzRGVjbGFyZVF1ZXJ5TWV0YWRhdGFGYWNhZGUsXG4pOiBSM1F1ZXJ5TWV0YWRhdGEge1xuICByZXR1cm4ge1xuICAgIHByb3BlcnR5TmFtZTogZGVjbGFyYXRpb24ucHJvcGVydHlOYW1lLFxuICAgIGZpcnN0OiBkZWNsYXJhdGlvbi5maXJzdCA/PyBmYWxzZSxcbiAgICBwcmVkaWNhdGU6IGNvbnZlcnRRdWVyeVByZWRpY2F0ZShkZWNsYXJhdGlvbi5wcmVkaWNhdGUpLFxuICAgIGRlc2NlbmRhbnRzOiBkZWNsYXJhdGlvbi5kZXNjZW5kYW50cyA/PyBmYWxzZSxcbiAgICByZWFkOiBkZWNsYXJhdGlvbi5yZWFkID8gbmV3IFdyYXBwZWROb2RlRXhwcihkZWNsYXJhdGlvbi5yZWFkKSA6IG51bGwsXG4gICAgc3RhdGljOiBkZWNsYXJhdGlvbi5zdGF0aWMgPz8gZmFsc2UsXG4gICAgZW1pdERpc3RpbmN0Q2hhbmdlc09ubHk6IGRlY2xhcmF0aW9uLmVtaXREaXN0aW5jdENoYW5nZXNPbmx5ID8/IHRydWUsXG4gICAgaXNTaWduYWw6ICEhZGVjbGFyYXRpb24uaXNTaWduYWwsXG4gIH07XG59XG5cbmZ1bmN0aW9uIGNvbnZlcnRRdWVyeVByZWRpY2F0ZShcbiAgcHJlZGljYXRlOiBPcGFxdWVWYWx1ZSB8IHN0cmluZ1tdLFxuKTogTWF5YmVGb3J3YXJkUmVmRXhwcmVzc2lvbiB8IHN0cmluZ1tdIHtcbiAgcmV0dXJuIEFycmF5LmlzQXJyYXkocHJlZGljYXRlKVxuICAgID8gLy8gVGhlIHByZWRpY2F0ZSBpcyBhbiBhcnJheSBvZiBzdHJpbmdzIHNvIHBhc3MgaXQgdGhyb3VnaC5cbiAgICAgIHByZWRpY2F0ZVxuICAgIDogLy8gVGhlIHByZWRpY2F0ZSBpcyBhIHR5cGUgLSBhc3N1bWUgdGhhdCB3ZSB3aWxsIG5lZWQgdG8gdW53cmFwIGFueSBgZm9yd2FyZFJlZigpYCBjYWxscy5cbiAgICAgIGNyZWF0ZU1heUJlRm9yd2FyZFJlZkV4cHJlc3Npb24obmV3IFdyYXBwZWROb2RlRXhwcihwcmVkaWNhdGUpLCBGb3J3YXJkUmVmSGFuZGxpbmcuV3JhcHBlZCk7XG59XG5cbmZ1bmN0aW9uIGNvbnZlcnREaXJlY3RpdmVGYWNhZGVUb01ldGFkYXRhKGZhY2FkZTogUjNEaXJlY3RpdmVNZXRhZGF0YUZhY2FkZSk6IFIzRGlyZWN0aXZlTWV0YWRhdGEge1xuICBjb25zdCBpbnB1dHNGcm9tTWV0YWRhdGEgPSBwYXJzZUlucHV0c0FycmF5KGZhY2FkZS5pbnB1dHMgfHwgW10pO1xuICBjb25zdCBvdXRwdXRzRnJvbU1ldGFkYXRhID0gcGFyc2VNYXBwaW5nU3RyaW5nQXJyYXkoZmFjYWRlLm91dHB1dHMgfHwgW10pO1xuICBjb25zdCBwcm9wTWV0YWRhdGEgPSBmYWNhZGUucHJvcE1ldGFkYXRhO1xuICBjb25zdCBpbnB1dHNGcm9tVHlwZTogUmVjb3JkPHN0cmluZywgUjNJbnB1dE1ldGFkYXRhPiA9IHt9O1xuICBjb25zdCBvdXRwdXRzRnJvbVR5cGU6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7fTtcbiAgZm9yIChjb25zdCBmaWVsZCBpbiBwcm9wTWV0YWRhdGEpIHtcbiAgICBpZiAocHJvcE1ldGFkYXRhLmhhc093blByb3BlcnR5KGZpZWxkKSkge1xuICAgICAgcHJvcE1ldGFkYXRhW2ZpZWxkXS5mb3JFYWNoKChhbm4pID0+IHtcbiAgICAgICAgaWYgKGlzSW5wdXQoYW5uKSkge1xuICAgICAgICAgIGlucHV0c0Zyb21UeXBlW2ZpZWxkXSA9IHtcbiAgICAgICAgICAgIGJpbmRpbmdQcm9wZXJ0eU5hbWU6IGFubi5hbGlhcyB8fCBmaWVsZCxcbiAgICAgICAgICAgIGNsYXNzUHJvcGVydHlOYW1lOiBmaWVsZCxcbiAgICAgICAgICAgIHJlcXVpcmVkOiBhbm4ucmVxdWlyZWQgfHwgZmFsc2UsXG4gICAgICAgICAgICAvLyBGb3IgSklULCBkZWNvcmF0b3JzIGFyZSB1c2VkIHRvIGRlY2xhcmUgc2lnbmFsIGlucHV0cy4gVGhhdCBpcyBiZWNhdXNlIG9mXG4gICAgICAgICAgICAvLyBhIHRlY2huaWNhbCBsaW1pdGF0aW9uIHdoZXJlIGl0J3Mgbm90IHBvc3NpYmxlIHRvIHN0YXRpY2FsbHkgcmVmbGVjdCBjbGFzc1xuICAgICAgICAgICAgLy8gbWVtYmVycyBvZiBhIGRpcmVjdGl2ZS9jb21wb25lbnQgYXQgcnVudGltZSBiZWZvcmUgaW5zdGFudGlhdGluZyB0aGUgY2xhc3MuXG4gICAgICAgICAgICBpc1NpZ25hbDogISFhbm4uaXNTaWduYWwsXG4gICAgICAgICAgICB0cmFuc2Zvcm1GdW5jdGlvbjogYW5uLnRyYW5zZm9ybSAhPSBudWxsID8gbmV3IFdyYXBwZWROb2RlRXhwcihhbm4udHJhbnNmb3JtKSA6IG51bGwsXG4gICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIGlmIChpc091dHB1dChhbm4pKSB7XG4gICAgICAgICAgb3V0cHV0c0Zyb21UeXBlW2ZpZWxkXSA9IGFubi5hbGlhcyB8fCBmaWVsZDtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgY29uc3QgaG9zdERpcmVjdGl2ZXMgPSBmYWNhZGUuaG9zdERpcmVjdGl2ZXM/Lmxlbmd0aFxuICAgID8gZmFjYWRlLmhvc3REaXJlY3RpdmVzLm1hcCgoaG9zdERpcmVjdGl2ZSkgPT4ge1xuICAgICAgICByZXR1cm4gdHlwZW9mIGhvc3REaXJlY3RpdmUgPT09ICdmdW5jdGlvbidcbiAgICAgICAgICA/IHtcbiAgICAgICAgICAgICAgZGlyZWN0aXZlOiB3cmFwUmVmZXJlbmNlKGhvc3REaXJlY3RpdmUpLFxuICAgICAgICAgICAgICBpbnB1dHM6IG51bGwsXG4gICAgICAgICAgICAgIG91dHB1dHM6IG51bGwsXG4gICAgICAgICAgICAgIGlzRm9yd2FyZFJlZmVyZW5jZTogZmFsc2UsXG4gICAgICAgICAgICB9XG4gICAgICAgICAgOiB7XG4gICAgICAgICAgICAgIGRpcmVjdGl2ZTogd3JhcFJlZmVyZW5jZShob3N0RGlyZWN0aXZlLmRpcmVjdGl2ZSksXG4gICAgICAgICAgICAgIGlzRm9yd2FyZFJlZmVyZW5jZTogZmFsc2UsXG4gICAgICAgICAgICAgIGlucHV0czogaG9zdERpcmVjdGl2ZS5pbnB1dHMgPyBwYXJzZU1hcHBpbmdTdHJpbmdBcnJheShob3N0RGlyZWN0aXZlLmlucHV0cykgOiBudWxsLFxuICAgICAgICAgICAgICBvdXRwdXRzOiBob3N0RGlyZWN0aXZlLm91dHB1dHNcbiAgICAgICAgICAgICAgICA/IHBhcnNlTWFwcGluZ1N0cmluZ0FycmF5KGhvc3REaXJlY3RpdmUub3V0cHV0cylcbiAgICAgICAgICAgICAgICA6IG51bGwsXG4gICAgICAgICAgICB9O1xuICAgICAgfSlcbiAgICA6IG51bGw7XG5cbiAgcmV0dXJuIHtcbiAgICAuLi5mYWNhZGUsXG4gICAgdHlwZUFyZ3VtZW50Q291bnQ6IDAsXG4gICAgdHlwZVNvdXJjZVNwYW46IGZhY2FkZS50eXBlU291cmNlU3BhbixcbiAgICB0eXBlOiB3cmFwUmVmZXJlbmNlKGZhY2FkZS50eXBlKSxcbiAgICBkZXBzOiBudWxsLFxuICAgIGhvc3Q6IHtcbiAgICAgIC4uLmV4dHJhY3RIb3N0QmluZGluZ3MoZmFjYWRlLnByb3BNZXRhZGF0YSwgZmFjYWRlLnR5cGVTb3VyY2VTcGFuLCBmYWNhZGUuaG9zdCksXG4gICAgfSxcbiAgICBpbnB1dHM6IHsuLi5pbnB1dHNGcm9tTWV0YWRhdGEsIC4uLmlucHV0c0Zyb21UeXBlfSxcbiAgICBvdXRwdXRzOiB7Li4ub3V0cHV0c0Zyb21NZXRhZGF0YSwgLi4ub3V0cHV0c0Zyb21UeXBlfSxcbiAgICBxdWVyaWVzOiBmYWNhZGUucXVlcmllcy5tYXAoY29udmVydFRvUjNRdWVyeU1ldGFkYXRhKSxcbiAgICBwcm92aWRlcnM6IGZhY2FkZS5wcm92aWRlcnMgIT0gbnVsbCA/IG5ldyBXcmFwcGVkTm9kZUV4cHIoZmFjYWRlLnByb3ZpZGVycykgOiBudWxsLFxuICAgIHZpZXdRdWVyaWVzOiBmYWNhZGUudmlld1F1ZXJpZXMubWFwKGNvbnZlcnRUb1IzUXVlcnlNZXRhZGF0YSksXG4gICAgZnVsbEluaGVyaXRhbmNlOiBmYWxzZSxcbiAgICBob3N0RGlyZWN0aXZlcyxcbiAgfTtcbn1cblxuZnVuY3Rpb24gY29udmVydERlY2xhcmVEaXJlY3RpdmVGYWNhZGVUb01ldGFkYXRhKFxuICBkZWNsYXJhdGlvbjogUjNEZWNsYXJlRGlyZWN0aXZlRmFjYWRlLFxuICB0eXBlU291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuKTogUjNEaXJlY3RpdmVNZXRhZGF0YSB7XG4gIGNvbnN0IGhvc3REaXJlY3RpdmVzID0gZGVjbGFyYXRpb24uaG9zdERpcmVjdGl2ZXM/Lmxlbmd0aFxuICAgID8gZGVjbGFyYXRpb24uaG9zdERpcmVjdGl2ZXMubWFwKChkaXIpID0+ICh7XG4gICAgICAgIGRpcmVjdGl2ZTogd3JhcFJlZmVyZW5jZShkaXIuZGlyZWN0aXZlKSxcbiAgICAgICAgaXNGb3J3YXJkUmVmZXJlbmNlOiBmYWxzZSxcbiAgICAgICAgaW5wdXRzOiBkaXIuaW5wdXRzID8gZ2V0SG9zdERpcmVjdGl2ZUJpbmRpbmdNYXBwaW5nKGRpci5pbnB1dHMpIDogbnVsbCxcbiAgICAgICAgb3V0cHV0czogZGlyLm91dHB1dHMgPyBnZXRIb3N0RGlyZWN0aXZlQmluZGluZ01hcHBpbmcoZGlyLm91dHB1dHMpIDogbnVsbCxcbiAgICAgIH0pKVxuICAgIDogbnVsbDtcblxuICByZXR1cm4ge1xuICAgIG5hbWU6IGRlY2xhcmF0aW9uLnR5cGUubmFtZSxcbiAgICB0eXBlOiB3cmFwUmVmZXJlbmNlKGRlY2xhcmF0aW9uLnR5cGUpLFxuICAgIHR5cGVTb3VyY2VTcGFuLFxuICAgIHNlbGVjdG9yOiBkZWNsYXJhdGlvbi5zZWxlY3RvciA/PyBudWxsLFxuICAgIGlucHV0czogZGVjbGFyYXRpb24uaW5wdXRzID8gaW5wdXRzUGFydGlhbE1ldGFkYXRhVG9JbnB1dE1ldGFkYXRhKGRlY2xhcmF0aW9uLmlucHV0cykgOiB7fSxcbiAgICBvdXRwdXRzOiBkZWNsYXJhdGlvbi5vdXRwdXRzID8/IHt9LFxuICAgIGhvc3Q6IGNvbnZlcnRIb3N0RGVjbGFyYXRpb25Ub01ldGFkYXRhKGRlY2xhcmF0aW9uLmhvc3QpLFxuICAgIHF1ZXJpZXM6IChkZWNsYXJhdGlvbi5xdWVyaWVzID8/IFtdKS5tYXAoY29udmVydFF1ZXJ5RGVjbGFyYXRpb25Ub01ldGFkYXRhKSxcbiAgICB2aWV3UXVlcmllczogKGRlY2xhcmF0aW9uLnZpZXdRdWVyaWVzID8/IFtdKS5tYXAoY29udmVydFF1ZXJ5RGVjbGFyYXRpb25Ub01ldGFkYXRhKSxcbiAgICBwcm92aWRlcnM6XG4gICAgICBkZWNsYXJhdGlvbi5wcm92aWRlcnMgIT09IHVuZGVmaW5lZCA/IG5ldyBXcmFwcGVkTm9kZUV4cHIoZGVjbGFyYXRpb24ucHJvdmlkZXJzKSA6IG51bGwsXG4gICAgZXhwb3J0QXM6IGRlY2xhcmF0aW9uLmV4cG9ydEFzID8/IG51bGwsXG4gICAgdXNlc0luaGVyaXRhbmNlOiBkZWNsYXJhdGlvbi51c2VzSW5oZXJpdGFuY2UgPz8gZmFsc2UsXG4gICAgbGlmZWN5Y2xlOiB7dXNlc09uQ2hhbmdlczogZGVjbGFyYXRpb24udXNlc09uQ2hhbmdlcyA/PyBmYWxzZX0sXG4gICAgZGVwczogbnVsbCxcbiAgICB0eXBlQXJndW1lbnRDb3VudDogMCxcbiAgICBmdWxsSW5oZXJpdGFuY2U6IGZhbHNlLFxuICAgIGlzU3RhbmRhbG9uZTogZGVjbGFyYXRpb24uaXNTdGFuZGFsb25lID8/IGZhbHNlLFxuICAgIGlzU2lnbmFsOiBkZWNsYXJhdGlvbi5pc1NpZ25hbCA/PyBmYWxzZSxcbiAgICBob3N0RGlyZWN0aXZlcyxcbiAgfTtcbn1cblxuZnVuY3Rpb24gY29udmVydEhvc3REZWNsYXJhdGlvblRvTWV0YWRhdGEoXG4gIGhvc3Q6IFIzRGVjbGFyZURpcmVjdGl2ZUZhY2FkZVsnaG9zdCddID0ge30sXG4pOiBSM0hvc3RNZXRhZGF0YSB7XG4gIHJldHVybiB7XG4gICAgYXR0cmlidXRlczogY29udmVydE9wYXF1ZVZhbHVlc1RvRXhwcmVzc2lvbnMoaG9zdC5hdHRyaWJ1dGVzID8/IHt9KSxcbiAgICBsaXN0ZW5lcnM6IGhvc3QubGlzdGVuZXJzID8/IHt9LFxuICAgIHByb3BlcnRpZXM6IGhvc3QucHJvcGVydGllcyA/PyB7fSxcbiAgICBzcGVjaWFsQXR0cmlidXRlczoge1xuICAgICAgY2xhc3NBdHRyOiBob3N0LmNsYXNzQXR0cmlidXRlLFxuICAgICAgc3R5bGVBdHRyOiBob3N0LnN0eWxlQXR0cmlidXRlLFxuICAgIH0sXG4gIH07XG59XG5cbi8qKlxuICogUGFyc2VzIGEgaG9zdCBkaXJlY3RpdmUgbWFwcGluZyB3aGVyZSBlYWNoIG9kZCBhcnJheSBrZXkgaXMgdGhlIG5hbWUgb2YgYW4gaW5wdXQvb3V0cHV0XG4gKiBhbmQgZWFjaCBldmVuIGtleSBpcyBpdHMgcHVibGljIG5hbWUsIGUuZy4gYFsnb25lJywgJ29uZUFsaWFzJywgJ3R3bycsICd0d28nXWAuXG4gKi9cbmZ1bmN0aW9uIGdldEhvc3REaXJlY3RpdmVCaW5kaW5nTWFwcGluZyhhcnJheTogc3RyaW5nW10pIHtcbiAgbGV0IHJlc3VsdDoge1twdWJsaWNOYW1lOiBzdHJpbmddOiBzdHJpbmd9IHwgbnVsbCA9IG51bGw7XG5cbiAgZm9yIChsZXQgaSA9IDE7IGkgPCBhcnJheS5sZW5ndGg7IGkgKz0gMikge1xuICAgIHJlc3VsdCA9IHJlc3VsdCB8fCB7fTtcbiAgICByZXN1bHRbYXJyYXlbaSAtIDFdXSA9IGFycmF5W2ldO1xuICB9XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZnVuY3Rpb24gY29udmVydE9wYXF1ZVZhbHVlc1RvRXhwcmVzc2lvbnMob2JqOiB7W2tleTogc3RyaW5nXTogT3BhcXVlVmFsdWV9KToge1xuICBba2V5OiBzdHJpbmddOiBXcmFwcGVkTm9kZUV4cHI8dW5rbm93bj47XG59IHtcbiAgY29uc3QgcmVzdWx0OiB7W2tleTogc3RyaW5nXTogV3JhcHBlZE5vZGVFeHByPHVua25vd24+fSA9IHt9O1xuICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhvYmopKSB7XG4gICAgcmVzdWx0W2tleV0gPSBuZXcgV3JhcHBlZE5vZGVFeHByKG9ialtrZXldKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBjb252ZXJ0RGVjbGFyZUNvbXBvbmVudEZhY2FkZVRvTWV0YWRhdGEoXG4gIGRlY2w6IFIzRGVjbGFyZUNvbXBvbmVudEZhY2FkZSxcbiAgdHlwZVNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgc291cmNlTWFwVXJsOiBzdHJpbmcsXG4pOiBSM0NvbXBvbmVudE1ldGFkYXRhPFIzVGVtcGxhdGVEZXBlbmRlbmN5TWV0YWRhdGE+IHtcbiAgY29uc3Qge3RlbXBsYXRlLCBpbnRlcnBvbGF0aW9uLCBkZWZlcn0gPSBwYXJzZUppdFRlbXBsYXRlKFxuICAgIGRlY2wudGVtcGxhdGUsXG4gICAgZGVjbC50eXBlLm5hbWUsXG4gICAgc291cmNlTWFwVXJsLFxuICAgIGRlY2wucHJlc2VydmVXaGl0ZXNwYWNlcyA/PyBmYWxzZSxcbiAgICBkZWNsLmludGVycG9sYXRpb24sXG4gICAgZGVjbC5kZWZlckJsb2NrRGVwZW5kZW5jaWVzLFxuICApO1xuXG4gIGNvbnN0IGRlY2xhcmF0aW9uczogUjNUZW1wbGF0ZURlcGVuZGVuY3lNZXRhZGF0YVtdID0gW107XG4gIGlmIChkZWNsLmRlcGVuZGVuY2llcykge1xuICAgIGZvciAoY29uc3QgaW5uZXJEZXAgb2YgZGVjbC5kZXBlbmRlbmNpZXMpIHtcbiAgICAgIHN3aXRjaCAoaW5uZXJEZXAua2luZCkge1xuICAgICAgICBjYXNlICdkaXJlY3RpdmUnOlxuICAgICAgICBjYXNlICdjb21wb25lbnQnOlxuICAgICAgICAgIGRlY2xhcmF0aW9ucy5wdXNoKGNvbnZlcnREaXJlY3RpdmVEZWNsYXJhdGlvblRvTWV0YWRhdGEoaW5uZXJEZXApKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAncGlwZSc6XG4gICAgICAgICAgZGVjbGFyYXRpb25zLnB1c2goY29udmVydFBpcGVEZWNsYXJhdGlvblRvTWV0YWRhdGEoaW5uZXJEZXApKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSBpZiAoZGVjbC5jb21wb25lbnRzIHx8IGRlY2wuZGlyZWN0aXZlcyB8fCBkZWNsLnBpcGVzKSB7XG4gICAgLy8gRXhpc3RpbmcgZGVjbGFyYXRpb25zIG9uIE5QTSBtYXkgbm90IGJlIHVzaW5nIHRoZSBuZXcgYGRlcGVuZGVuY2llc2AgbWVyZ2VkIGZpZWxkLCBhbmQgbWF5XG4gICAgLy8gaGF2ZSBzZXBhcmF0ZSBmaWVsZHMgZm9yIGRlcGVuZGVuY2llcyBpbnN0ZWFkLiBVbmlmeSB0aGVtIGZvciBKSVQgY29tcGlsYXRpb24uXG4gICAgZGVjbC5jb21wb25lbnRzICYmXG4gICAgICBkZWNsYXJhdGlvbnMucHVzaChcbiAgICAgICAgLi4uZGVjbC5jb21wb25lbnRzLm1hcCgoZGlyKSA9PlxuICAgICAgICAgIGNvbnZlcnREaXJlY3RpdmVEZWNsYXJhdGlvblRvTWV0YWRhdGEoZGlyLCAvKiBpc0NvbXBvbmVudCAqLyB0cnVlKSxcbiAgICAgICAgKSxcbiAgICAgICk7XG4gICAgZGVjbC5kaXJlY3RpdmVzICYmXG4gICAgICBkZWNsYXJhdGlvbnMucHVzaChcbiAgICAgICAgLi4uZGVjbC5kaXJlY3RpdmVzLm1hcCgoZGlyKSA9PiBjb252ZXJ0RGlyZWN0aXZlRGVjbGFyYXRpb25Ub01ldGFkYXRhKGRpcikpLFxuICAgICAgKTtcbiAgICBkZWNsLnBpcGVzICYmIGRlY2xhcmF0aW9ucy5wdXNoKC4uLmNvbnZlcnRQaXBlTWFwVG9NZXRhZGF0YShkZWNsLnBpcGVzKSk7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIC4uLmNvbnZlcnREZWNsYXJlRGlyZWN0aXZlRmFjYWRlVG9NZXRhZGF0YShkZWNsLCB0eXBlU291cmNlU3BhbiksXG4gICAgdGVtcGxhdGUsXG4gICAgc3R5bGVzOiBkZWNsLnN0eWxlcyA/PyBbXSxcbiAgICBkZWNsYXJhdGlvbnMsXG4gICAgdmlld1Byb3ZpZGVyczpcbiAgICAgIGRlY2wudmlld1Byb3ZpZGVycyAhPT0gdW5kZWZpbmVkID8gbmV3IFdyYXBwZWROb2RlRXhwcihkZWNsLnZpZXdQcm92aWRlcnMpIDogbnVsbCxcbiAgICBhbmltYXRpb25zOiBkZWNsLmFuaW1hdGlvbnMgIT09IHVuZGVmaW5lZCA/IG5ldyBXcmFwcGVkTm9kZUV4cHIoZGVjbC5hbmltYXRpb25zKSA6IG51bGwsXG4gICAgZGVmZXIsXG5cbiAgICBjaGFuZ2VEZXRlY3Rpb246IGRlY2wuY2hhbmdlRGV0ZWN0aW9uID8/IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LkRlZmF1bHQsXG4gICAgZW5jYXBzdWxhdGlvbjogZGVjbC5lbmNhcHN1bGF0aW9uID8/IFZpZXdFbmNhcHN1bGF0aW9uLkVtdWxhdGVkLFxuICAgIGludGVycG9sYXRpb24sXG4gICAgZGVjbGFyYXRpb25MaXN0RW1pdE1vZGU6IERlY2xhcmF0aW9uTGlzdEVtaXRNb2RlLkNsb3N1cmVSZXNvbHZlZCxcbiAgICByZWxhdGl2ZUNvbnRleHRGaWxlUGF0aDogJycsXG4gICAgaTE4blVzZUV4dGVybmFsSWRzOiB0cnVlLFxuICB9O1xufVxuXG5mdW5jdGlvbiBjb252ZXJ0RGVjbGFyYXRpb25GYWNhZGVUb01ldGFkYXRhKFxuICBkZWNsYXJhdGlvbjogUjNUZW1wbGF0ZURlcGVuZGVuY3lGYWNhZGUsXG4pOiBSM1RlbXBsYXRlRGVwZW5kZW5jeSB7XG4gIHJldHVybiB7XG4gICAgLi4uZGVjbGFyYXRpb24sXG4gICAgdHlwZTogbmV3IFdyYXBwZWROb2RlRXhwcihkZWNsYXJhdGlvbi50eXBlKSxcbiAgfTtcbn1cblxuZnVuY3Rpb24gY29udmVydERpcmVjdGl2ZURlY2xhcmF0aW9uVG9NZXRhZGF0YShcbiAgZGVjbGFyYXRpb246IFIzRGVjbGFyZURpcmVjdGl2ZURlcGVuZGVuY3lGYWNhZGUsXG4gIGlzQ29tcG9uZW50OiB0cnVlIHwgbnVsbCA9IG51bGwsXG4pOiBSM0RpcmVjdGl2ZURlcGVuZGVuY3lNZXRhZGF0YSB7XG4gIHJldHVybiB7XG4gICAga2luZDogUjNUZW1wbGF0ZURlcGVuZGVuY3lLaW5kLkRpcmVjdGl2ZSxcbiAgICBpc0NvbXBvbmVudDogaXNDb21wb25lbnQgfHwgZGVjbGFyYXRpb24ua2luZCA9PT0gJ2NvbXBvbmVudCcsXG4gICAgc2VsZWN0b3I6IGRlY2xhcmF0aW9uLnNlbGVjdG9yLFxuICAgIHR5cGU6IG5ldyBXcmFwcGVkTm9kZUV4cHIoZGVjbGFyYXRpb24udHlwZSksXG4gICAgaW5wdXRzOiBkZWNsYXJhdGlvbi5pbnB1dHMgPz8gW10sXG4gICAgb3V0cHV0czogZGVjbGFyYXRpb24ub3V0cHV0cyA/PyBbXSxcbiAgICBleHBvcnRBczogZGVjbGFyYXRpb24uZXhwb3J0QXMgPz8gbnVsbCxcbiAgfTtcbn1cblxuZnVuY3Rpb24gY29udmVydFBpcGVNYXBUb01ldGFkYXRhKFxuICBwaXBlczogUjNEZWNsYXJlQ29tcG9uZW50RmFjYWRlWydwaXBlcyddLFxuKTogUjNQaXBlRGVwZW5kZW5jeU1ldGFkYXRhW10ge1xuICBpZiAoIXBpcGVzKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgcmV0dXJuIE9iamVjdC5rZXlzKHBpcGVzKS5tYXAoKG5hbWUpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAga2luZDogUjNUZW1wbGF0ZURlcGVuZGVuY3lLaW5kLlBpcGUsXG4gICAgICBuYW1lLFxuICAgICAgdHlwZTogbmV3IFdyYXBwZWROb2RlRXhwcihwaXBlc1tuYW1lXSksXG4gICAgfTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGNvbnZlcnRQaXBlRGVjbGFyYXRpb25Ub01ldGFkYXRhKFxuICBwaXBlOiBSM0RlY2xhcmVQaXBlRGVwZW5kZW5jeUZhY2FkZSxcbik6IFIzUGlwZURlcGVuZGVuY3lNZXRhZGF0YSB7XG4gIHJldHVybiB7XG4gICAga2luZDogUjNUZW1wbGF0ZURlcGVuZGVuY3lLaW5kLlBpcGUsXG4gICAgbmFtZTogcGlwZS5uYW1lLFxuICAgIHR5cGU6IG5ldyBXcmFwcGVkTm9kZUV4cHIocGlwZS50eXBlKSxcbiAgfTtcbn1cblxuZnVuY3Rpb24gcGFyc2VKaXRUZW1wbGF0ZShcbiAgdGVtcGxhdGU6IHN0cmluZyxcbiAgdHlwZU5hbWU6IHN0cmluZyxcbiAgc291cmNlTWFwVXJsOiBzdHJpbmcsXG4gIHByZXNlcnZlV2hpdGVzcGFjZXM6IGJvb2xlYW4sXG4gIGludGVycG9sYXRpb246IFtzdHJpbmcsIHN0cmluZ10gfCB1bmRlZmluZWQsXG4gIGRlZmVyQmxvY2tEZXBlbmRlbmNpZXM6ICgoKSA9PiBQcm9taXNlPHVua25vd24+IHwgbnVsbClbXSB8IHVuZGVmaW5lZCxcbikge1xuICBjb25zdCBpbnRlcnBvbGF0aW9uQ29uZmlnID0gaW50ZXJwb2xhdGlvblxuICAgID8gSW50ZXJwb2xhdGlvbkNvbmZpZy5mcm9tQXJyYXkoaW50ZXJwb2xhdGlvbilcbiAgICA6IERFRkFVTFRfSU5URVJQT0xBVElPTl9DT05GSUc7XG4gIC8vIFBhcnNlIHRoZSB0ZW1wbGF0ZSBhbmQgY2hlY2sgZm9yIGVycm9ycy5cbiAgY29uc3QgcGFyc2VkID0gcGFyc2VUZW1wbGF0ZSh0ZW1wbGF0ZSwgc291cmNlTWFwVXJsLCB7XG4gICAgcHJlc2VydmVXaGl0ZXNwYWNlcyxcbiAgICBpbnRlcnBvbGF0aW9uQ29uZmlnLFxuICB9KTtcbiAgaWYgKHBhcnNlZC5lcnJvcnMgIT09IG51bGwpIHtcbiAgICBjb25zdCBlcnJvcnMgPSBwYXJzZWQuZXJyb3JzLm1hcCgoZXJyKSA9PiBlcnIudG9TdHJpbmcoKSkuam9pbignLCAnKTtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEVycm9ycyBkdXJpbmcgSklUIGNvbXBpbGF0aW9uIG9mIHRlbXBsYXRlIGZvciAke3R5cGVOYW1lfTogJHtlcnJvcnN9YCk7XG4gIH1cbiAgY29uc3QgYmluZGVyID0gbmV3IFIzVGFyZ2V0QmluZGVyKG5ldyBTZWxlY3Rvck1hdGNoZXIoKSk7XG4gIGNvbnN0IGJvdW5kVGFyZ2V0ID0gYmluZGVyLmJpbmQoe3RlbXBsYXRlOiBwYXJzZWQubm9kZXN9KTtcblxuICByZXR1cm4ge1xuICAgIHRlbXBsYXRlOiBwYXJzZWQsXG4gICAgaW50ZXJwb2xhdGlvbjogaW50ZXJwb2xhdGlvbkNvbmZpZyxcbiAgICBkZWZlcjogY3JlYXRlUjNDb21wb25lbnREZWZlck1ldGFkYXRhKGJvdW5kVGFyZ2V0LCBkZWZlckJsb2NrRGVwZW5kZW5jaWVzKSxcbiAgfTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IHRoZSBleHByZXNzaW9uLCBpZiBwcmVzZW50IHRvIGFuIGBSM1Byb3ZpZGVyRXhwcmVzc2lvbmAuXG4gKlxuICogSW4gSklUIG1vZGUgd2UgZG8gbm90IHdhbnQgdGhlIGNvbXBpbGVyIHRvIHdyYXAgdGhlIGV4cHJlc3Npb24gaW4gYSBgZm9yd2FyZFJlZigpYCBjYWxsIGJlY2F1c2UsXG4gKiBpZiBpdCBpcyByZWZlcmVuY2luZyBhIHR5cGUgdGhhdCBoYXMgbm90IHlldCBiZWVuIGRlZmluZWQsIGl0IHdpbGwgaGF2ZSBhbHJlYWR5IGJlZW4gd3JhcHBlZCBpblxuICogYSBgZm9yd2FyZFJlZigpYCAtIGVpdGhlciBieSB0aGUgYXBwbGljYXRpb24gZGV2ZWxvcGVyIG9yIGR1cmluZyBwYXJ0aWFsLWNvbXBpbGF0aW9uLiBUaHVzIHdlIGNhblxuICogdXNlIGBGb3J3YXJkUmVmSGFuZGxpbmcuTm9uZWAuXG4gKi9cbmZ1bmN0aW9uIGNvbnZlcnRUb1Byb3ZpZGVyRXhwcmVzc2lvbihcbiAgb2JqOiBhbnksXG4gIHByb3BlcnR5OiBzdHJpbmcsXG4pOiBNYXliZUZvcndhcmRSZWZFeHByZXNzaW9uIHwgdW5kZWZpbmVkIHtcbiAgaWYgKG9iai5oYXNPd25Qcm9wZXJ0eShwcm9wZXJ0eSkpIHtcbiAgICByZXR1cm4gY3JlYXRlTWF5QmVGb3J3YXJkUmVmRXhwcmVzc2lvbihcbiAgICAgIG5ldyBXcmFwcGVkTm9kZUV4cHIob2JqW3Byb3BlcnR5XSksXG4gICAgICBGb3J3YXJkUmVmSGFuZGxpbmcuTm9uZSxcbiAgICApO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cbn1cblxuZnVuY3Rpb24gd3JhcEV4cHJlc3Npb24ob2JqOiBhbnksIHByb3BlcnR5OiBzdHJpbmcpOiBXcmFwcGVkTm9kZUV4cHI8YW55PiB8IHVuZGVmaW5lZCB7XG4gIGlmIChvYmouaGFzT3duUHJvcGVydHkocHJvcGVydHkpKSB7XG4gICAgcmV0dXJuIG5ldyBXcmFwcGVkTm9kZUV4cHIob2JqW3Byb3BlcnR5XSk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxufVxuXG5mdW5jdGlvbiBjb21wdXRlUHJvdmlkZWRJbihcbiAgcHJvdmlkZWRJbjogRnVuY3Rpb24gfCBzdHJpbmcgfCBudWxsIHwgdW5kZWZpbmVkLFxuKTogTWF5YmVGb3J3YXJkUmVmRXhwcmVzc2lvbiB7XG4gIGNvbnN0IGV4cHJlc3Npb24gPVxuICAgIHR5cGVvZiBwcm92aWRlZEluID09PSAnZnVuY3Rpb24nXG4gICAgICA/IG5ldyBXcmFwcGVkTm9kZUV4cHIocHJvdmlkZWRJbilcbiAgICAgIDogbmV3IExpdGVyYWxFeHByKHByb3ZpZGVkSW4gPz8gbnVsbCk7XG4gIC8vIFNlZSBgY29udmVydFRvUHJvdmlkZXJFeHByZXNzaW9uKClgIGZvciB3aHkgdGhpcyB1c2VzIGBGb3J3YXJkUmVmSGFuZGxpbmcuTm9uZWAuXG4gIHJldHVybiBjcmVhdGVNYXlCZUZvcndhcmRSZWZFeHByZXNzaW9uKGV4cHJlc3Npb24sIEZvcndhcmRSZWZIYW5kbGluZy5Ob25lKTtcbn1cblxuZnVuY3Rpb24gY29udmVydFIzRGVwZW5kZW5jeU1ldGFkYXRhQXJyYXkoXG4gIGZhY2FkZXM6IFIzRGVwZW5kZW5jeU1ldGFkYXRhRmFjYWRlW10gfCBudWxsIHwgdW5kZWZpbmVkLFxuKTogUjNEZXBlbmRlbmN5TWV0YWRhdGFbXSB8IG51bGwge1xuICByZXR1cm4gZmFjYWRlcyA9PSBudWxsID8gbnVsbCA6IGZhY2FkZXMubWFwKGNvbnZlcnRSM0RlcGVuZGVuY3lNZXRhZGF0YSk7XG59XG5cbmZ1bmN0aW9uIGNvbnZlcnRSM0RlcGVuZGVuY3lNZXRhZGF0YShmYWNhZGU6IFIzRGVwZW5kZW5jeU1ldGFkYXRhRmFjYWRlKTogUjNEZXBlbmRlbmN5TWV0YWRhdGEge1xuICBjb25zdCBpc0F0dHJpYnV0ZURlcCA9IGZhY2FkZS5hdHRyaWJ1dGUgIT0gbnVsbDsgLy8gYm90aCBgbnVsbGAgYW5kIGB1bmRlZmluZWRgXG4gIGNvbnN0IHJhd1Rva2VuID0gZmFjYWRlLnRva2VuID09PSBudWxsID8gbnVsbCA6IG5ldyBXcmFwcGVkTm9kZUV4cHIoZmFjYWRlLnRva2VuKTtcbiAgLy8gSW4gSklUIG1vZGUsIGlmIHRoZSBkZXAgaXMgYW4gYEBBdHRyaWJ1dGUoKWAgdGhlbiB3ZSB1c2UgdGhlIGF0dHJpYnV0ZSBuYW1lIGdpdmVuIGluXG4gIC8vIGBhdHRyaWJ1dGVgIHJhdGhlciB0aGFuIHRoZSBgdG9rZW5gLlxuICBjb25zdCB0b2tlbiA9IGlzQXR0cmlidXRlRGVwID8gbmV3IFdyYXBwZWROb2RlRXhwcihmYWNhZGUuYXR0cmlidXRlKSA6IHJhd1Rva2VuO1xuICByZXR1cm4gY3JlYXRlUjNEZXBlbmRlbmN5TWV0YWRhdGEoXG4gICAgdG9rZW4sXG4gICAgaXNBdHRyaWJ1dGVEZXAsXG4gICAgZmFjYWRlLmhvc3QsXG4gICAgZmFjYWRlLm9wdGlvbmFsLFxuICAgIGZhY2FkZS5zZWxmLFxuICAgIGZhY2FkZS5za2lwU2VsZixcbiAgKTtcbn1cblxuZnVuY3Rpb24gY29udmVydFIzRGVjbGFyZURlcGVuZGVuY3lNZXRhZGF0YShcbiAgZmFjYWRlOiBSM0RlY2xhcmVEZXBlbmRlbmN5TWV0YWRhdGFGYWNhZGUsXG4pOiBSM0RlcGVuZGVuY3lNZXRhZGF0YSB7XG4gIGNvbnN0IGlzQXR0cmlidXRlRGVwID0gZmFjYWRlLmF0dHJpYnV0ZSA/PyBmYWxzZTtcbiAgY29uc3QgdG9rZW4gPSBmYWNhZGUudG9rZW4gPT09IG51bGwgPyBudWxsIDogbmV3IFdyYXBwZWROb2RlRXhwcihmYWNhZGUudG9rZW4pO1xuICByZXR1cm4gY3JlYXRlUjNEZXBlbmRlbmN5TWV0YWRhdGEoXG4gICAgdG9rZW4sXG4gICAgaXNBdHRyaWJ1dGVEZXAsXG4gICAgZmFjYWRlLmhvc3QgPz8gZmFsc2UsXG4gICAgZmFjYWRlLm9wdGlvbmFsID8/IGZhbHNlLFxuICAgIGZhY2FkZS5zZWxmID8/IGZhbHNlLFxuICAgIGZhY2FkZS5za2lwU2VsZiA/PyBmYWxzZSxcbiAgKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlUjNEZXBlbmRlbmN5TWV0YWRhdGEoXG4gIHRva2VuOiBXcmFwcGVkTm9kZUV4cHI8dW5rbm93bj4gfCBudWxsLFxuICBpc0F0dHJpYnV0ZURlcDogYm9vbGVhbixcbiAgaG9zdDogYm9vbGVhbixcbiAgb3B0aW9uYWw6IGJvb2xlYW4sXG4gIHNlbGY6IGJvb2xlYW4sXG4gIHNraXBTZWxmOiBib29sZWFuLFxuKTogUjNEZXBlbmRlbmN5TWV0YWRhdGEge1xuICAvLyBJZiB0aGUgZGVwIGlzIGFuIGBAQXR0cmlidXRlKClgIHRoZSBgYXR0cmlidXRlTmFtZVR5cGVgIG91Z2h0IHRvIGJlIHRoZSBgdW5rbm93bmAgdHlwZS5cbiAgLy8gQnV0IHR5cGVzIGFyZSBub3QgYXZhaWxhYmxlIGF0IHJ1bnRpbWUgc28gd2UganVzdCB1c2UgYSBsaXRlcmFsIGBcIjx1bmtub3duPlwiYCBzdHJpbmcgYXMgYSBkdW1teVxuICAvLyBtYXJrZXIuXG4gIGNvbnN0IGF0dHJpYnV0ZU5hbWVUeXBlID0gaXNBdHRyaWJ1dGVEZXAgPyBsaXRlcmFsKCd1bmtub3duJykgOiBudWxsO1xuICByZXR1cm4ge3Rva2VuLCBhdHRyaWJ1dGVOYW1lVHlwZSwgaG9zdCwgb3B0aW9uYWwsIHNlbGYsIHNraXBTZWxmfTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlUjNDb21wb25lbnREZWZlck1ldGFkYXRhKFxuICBib3VuZFRhcmdldDogQm91bmRUYXJnZXQ8YW55PixcbiAgZGVmZXJCbG9ja0RlcGVuZGVuY2llczogKCgpID0+IFByb21pc2U8dW5rbm93bj4gfCBudWxsKVtdIHwgdW5kZWZpbmVkLFxuKTogUjNDb21wb25lbnREZWZlck1ldGFkYXRhIHtcbiAgY29uc3QgZGVmZXJyZWRCbG9ja3MgPSBib3VuZFRhcmdldC5nZXREZWZlckJsb2NrcygpO1xuICBjb25zdCBibG9ja3MgPSBuZXcgTWFwPERlZmVycmVkQmxvY2ssIEV4cHJlc3Npb24gfCBudWxsPigpO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgZGVmZXJyZWRCbG9ja3MubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBkZXBlbmRlbmN5Rm4gPSBkZWZlckJsb2NrRGVwZW5kZW5jaWVzPy5baV07XG4gICAgYmxvY2tzLnNldChkZWZlcnJlZEJsb2Nrc1tpXSwgZGVwZW5kZW5jeUZuID8gbmV3IFdyYXBwZWROb2RlRXhwcihkZXBlbmRlbmN5Rm4pIDogbnVsbCk7XG4gIH1cblxuICByZXR1cm4ge21vZGU6IERlZmVyQmxvY2tEZXBzRW1pdE1vZGUuUGVyQmxvY2ssIGJsb2Nrc307XG59XG5cbmZ1bmN0aW9uIGV4dHJhY3RIb3N0QmluZGluZ3MoXG4gIHByb3BNZXRhZGF0YToge1trZXk6IHN0cmluZ106IGFueVtdfSxcbiAgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICBob3N0Pzoge1trZXk6IHN0cmluZ106IHN0cmluZ30sXG4pOiBQYXJzZWRIb3N0QmluZGluZ3Mge1xuICAvLyBGaXJzdCBwYXJzZSB0aGUgZGVjbGFyYXRpb25zIGZyb20gdGhlIG1ldGFkYXRhLlxuICBjb25zdCBiaW5kaW5ncyA9IHBhcnNlSG9zdEJpbmRpbmdzKGhvc3QgfHwge30pO1xuXG4gIC8vIEFmdGVyIHRoYXQgY2hlY2sgaG9zdCBiaW5kaW5ncyBmb3IgZXJyb3JzXG4gIGNvbnN0IGVycm9ycyA9IHZlcmlmeUhvc3RCaW5kaW5ncyhiaW5kaW5ncywgc291cmNlU3Bhbik7XG4gIGlmIChlcnJvcnMubGVuZ3RoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGVycm9ycy5tYXAoKGVycm9yOiBQYXJzZUVycm9yKSA9PiBlcnJvci5tc2cpLmpvaW4oJ1xcbicpKTtcbiAgfVxuXG4gIC8vIE5leHQsIGxvb3Agb3ZlciB0aGUgcHJvcGVydGllcyBvZiB0aGUgb2JqZWN0LCBsb29raW5nIGZvciBASG9zdEJpbmRpbmcgYW5kIEBIb3N0TGlzdGVuZXIuXG4gIGZvciAoY29uc3QgZmllbGQgaW4gcHJvcE1ldGFkYXRhKSB7XG4gICAgaWYgKHByb3BNZXRhZGF0YS5oYXNPd25Qcm9wZXJ0eShmaWVsZCkpIHtcbiAgICAgIHByb3BNZXRhZGF0YVtmaWVsZF0uZm9yRWFjaCgoYW5uKSA9PiB7XG4gICAgICAgIGlmIChpc0hvc3RCaW5kaW5nKGFubikpIHtcbiAgICAgICAgICAvLyBTaW5jZSB0aGlzIGlzIGEgZGVjb3JhdG9yLCB3ZSBrbm93IHRoYXQgdGhlIHZhbHVlIGlzIGEgY2xhc3MgbWVtYmVyLiBBbHdheXMgYWNjZXNzIGl0XG4gICAgICAgICAgLy8gdGhyb3VnaCBgdGhpc2Agc28gdGhhdCBmdXJ0aGVyIGRvd24gdGhlIGxpbmUgaXQgY2FuJ3QgYmUgY29uZnVzZWQgZm9yIGEgbGl0ZXJhbCB2YWx1ZVxuICAgICAgICAgIC8vIChlLmcuIGlmIHRoZXJlJ3MgYSBwcm9wZXJ0eSBjYWxsZWQgYHRydWVgKS5cbiAgICAgICAgICBiaW5kaW5ncy5wcm9wZXJ0aWVzW2Fubi5ob3N0UHJvcGVydHlOYW1lIHx8IGZpZWxkXSA9IGdldFNhZmVQcm9wZXJ0eUFjY2Vzc1N0cmluZyhcbiAgICAgICAgICAgICd0aGlzJyxcbiAgICAgICAgICAgIGZpZWxkLFxuICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSBpZiAoaXNIb3N0TGlzdGVuZXIoYW5uKSkge1xuICAgICAgICAgIGJpbmRpbmdzLmxpc3RlbmVyc1thbm4uZXZlbnROYW1lIHx8IGZpZWxkXSA9IGAke2ZpZWxkfSgkeyhhbm4uYXJncyB8fCBbXSkuam9pbignLCcpfSlgO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gYmluZGluZ3M7XG59XG5cbmZ1bmN0aW9uIGlzSG9zdEJpbmRpbmcodmFsdWU6IGFueSk6IHZhbHVlIGlzIEhvc3RCaW5kaW5nIHtcbiAgcmV0dXJuIHZhbHVlLm5nTWV0YWRhdGFOYW1lID09PSAnSG9zdEJpbmRpbmcnO1xufVxuXG5mdW5jdGlvbiBpc0hvc3RMaXN0ZW5lcih2YWx1ZTogYW55KTogdmFsdWUgaXMgSG9zdExpc3RlbmVyIHtcbiAgcmV0dXJuIHZhbHVlLm5nTWV0YWRhdGFOYW1lID09PSAnSG9zdExpc3RlbmVyJztcbn1cblxuZnVuY3Rpb24gaXNJbnB1dCh2YWx1ZTogYW55KTogdmFsdWUgaXMgSW5wdXQge1xuICByZXR1cm4gdmFsdWUubmdNZXRhZGF0YU5hbWUgPT09ICdJbnB1dCc7XG59XG5cbmZ1bmN0aW9uIGlzT3V0cHV0KHZhbHVlOiBhbnkpOiB2YWx1ZSBpcyBPdXRwdXQge1xuICByZXR1cm4gdmFsdWUubmdNZXRhZGF0YU5hbWUgPT09ICdPdXRwdXQnO1xufVxuXG5mdW5jdGlvbiBpbnB1dHNQYXJ0aWFsTWV0YWRhdGFUb0lucHV0TWV0YWRhdGEoXG4gIGlucHV0czogTm9uTnVsbGFibGU8UjNEZWNsYXJlRGlyZWN0aXZlRmFjYWRlWydpbnB1dHMnXT4sXG4pIHtcbiAgcmV0dXJuIE9iamVjdC5rZXlzKGlucHV0cykucmVkdWNlPFJlY29yZDxzdHJpbmcsIFIzSW5wdXRNZXRhZGF0YT4+KFxuICAgIChyZXN1bHQsIG1pbmlmaWVkQ2xhc3NOYW1lKSA9PiB7XG4gICAgICBjb25zdCB2YWx1ZSA9IGlucHV0c1ttaW5pZmllZENsYXNzTmFtZV07XG5cbiAgICAgIC8vIEhhbmRsZSBsZWdhY3kgcGFydGlhbCBpbnB1dCBvdXRwdXQuXG4gICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyB8fCBBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgICByZXN1bHRbbWluaWZpZWRDbGFzc05hbWVdID0gcGFyc2VMZWdhY3lJbnB1dFBhcnRpYWxPdXRwdXQodmFsdWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzdWx0W21pbmlmaWVkQ2xhc3NOYW1lXSA9IHtcbiAgICAgICAgICBiaW5kaW5nUHJvcGVydHlOYW1lOiB2YWx1ZS5wdWJsaWNOYW1lLFxuICAgICAgICAgIGNsYXNzUHJvcGVydHlOYW1lOiBtaW5pZmllZENsYXNzTmFtZSxcbiAgICAgICAgICB0cmFuc2Zvcm1GdW5jdGlvbjpcbiAgICAgICAgICAgIHZhbHVlLnRyYW5zZm9ybUZ1bmN0aW9uICE9PSBudWxsID8gbmV3IFdyYXBwZWROb2RlRXhwcih2YWx1ZS50cmFuc2Zvcm1GdW5jdGlvbikgOiBudWxsLFxuICAgICAgICAgIHJlcXVpcmVkOiB2YWx1ZS5pc1JlcXVpcmVkLFxuICAgICAgICAgIGlzU2lnbmFsOiB2YWx1ZS5pc1NpZ25hbCxcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuICAgIHt9LFxuICApO1xufVxuXG4vKipcbiAqIFBhcnNlcyB0aGUgbGVnYWN5IGlucHV0IHBhcnRpYWwgb3V0cHV0LiBGb3IgbW9yZSBkZXRhaWxzIHNlZSBgcGFydGlhbC9kaXJlY3RpdmUudHNgLlxuICogVE9ETyhsZWdhY3ktcGFydGlhbC1vdXRwdXQtaW5wdXRzKTogUmVtb3ZlIGluIHYxOC5cbiAqL1xuZnVuY3Rpb24gcGFyc2VMZWdhY3lJbnB1dFBhcnRpYWxPdXRwdXQodmFsdWU6IExlZ2FjeUlucHV0UGFydGlhbE1hcHBpbmcpOiBSM0lucHV0TWV0YWRhdGEge1xuICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgIHJldHVybiB7XG4gICAgICBiaW5kaW5nUHJvcGVydHlOYW1lOiB2YWx1ZSxcbiAgICAgIGNsYXNzUHJvcGVydHlOYW1lOiB2YWx1ZSxcbiAgICAgIHRyYW5zZm9ybUZ1bmN0aW9uOiBudWxsLFxuICAgICAgcmVxdWlyZWQ6IGZhbHNlLFxuICAgICAgLy8gbGVnYWN5IHBhcnRpYWwgb3V0cHV0IGRvZXMgbm90IGNhcHR1cmUgc2lnbmFsIGlucHV0cy5cbiAgICAgIGlzU2lnbmFsOiBmYWxzZSxcbiAgICB9O1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBiaW5kaW5nUHJvcGVydHlOYW1lOiB2YWx1ZVswXSxcbiAgICBjbGFzc1Byb3BlcnR5TmFtZTogdmFsdWVbMV0sXG4gICAgdHJhbnNmb3JtRnVuY3Rpb246IHZhbHVlWzJdID8gbmV3IFdyYXBwZWROb2RlRXhwcih2YWx1ZVsyXSkgOiBudWxsLFxuICAgIHJlcXVpcmVkOiBmYWxzZSxcbiAgICAvLyBsZWdhY3kgcGFydGlhbCBvdXRwdXQgZG9lcyBub3QgY2FwdHVyZSBzaWduYWwgaW5wdXRzLlxuICAgIGlzU2lnbmFsOiBmYWxzZSxcbiAgfTtcbn1cblxuZnVuY3Rpb24gcGFyc2VJbnB1dHNBcnJheShcbiAgdmFsdWVzOiAoc3RyaW5nIHwge25hbWU6IHN0cmluZzsgYWxpYXM/OiBzdHJpbmc7IHJlcXVpcmVkPzogYm9vbGVhbjsgdHJhbnNmb3JtPzogRnVuY3Rpb259KVtdLFxuKSB7XG4gIHJldHVybiB2YWx1ZXMucmVkdWNlPFJlY29yZDxzdHJpbmcsIFIzSW5wdXRNZXRhZGF0YT4+KChyZXN1bHRzLCB2YWx1ZSkgPT4ge1xuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgICBjb25zdCBbYmluZGluZ1Byb3BlcnR5TmFtZSwgY2xhc3NQcm9wZXJ0eU5hbWVdID0gcGFyc2VNYXBwaW5nU3RyaW5nKHZhbHVlKTtcbiAgICAgIHJlc3VsdHNbY2xhc3NQcm9wZXJ0eU5hbWVdID0ge1xuICAgICAgICBiaW5kaW5nUHJvcGVydHlOYW1lLFxuICAgICAgICBjbGFzc1Byb3BlcnR5TmFtZSxcbiAgICAgICAgcmVxdWlyZWQ6IGZhbHNlLFxuICAgICAgICAvLyBTaWduYWwgaW5wdXRzIG5vdCBzdXBwb3J0ZWQgZm9yIHRoZSBpbnB1dHMgYXJyYXkuXG4gICAgICAgIGlzU2lnbmFsOiBmYWxzZSxcbiAgICAgICAgdHJhbnNmb3JtRnVuY3Rpb246IG51bGwsXG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHRzW3ZhbHVlLm5hbWVdID0ge1xuICAgICAgICBiaW5kaW5nUHJvcGVydHlOYW1lOiB2YWx1ZS5hbGlhcyB8fCB2YWx1ZS5uYW1lLFxuICAgICAgICBjbGFzc1Byb3BlcnR5TmFtZTogdmFsdWUubmFtZSxcbiAgICAgICAgcmVxdWlyZWQ6IHZhbHVlLnJlcXVpcmVkIHx8IGZhbHNlLFxuICAgICAgICAvLyBTaWduYWwgaW5wdXRzIG5vdCBzdXBwb3J0ZWQgZm9yIHRoZSBpbnB1dHMgYXJyYXkuXG4gICAgICAgIGlzU2lnbmFsOiBmYWxzZSxcbiAgICAgICAgdHJhbnNmb3JtRnVuY3Rpb246IHZhbHVlLnRyYW5zZm9ybSAhPSBudWxsID8gbmV3IFdyYXBwZWROb2RlRXhwcih2YWx1ZS50cmFuc2Zvcm0pIDogbnVsbCxcbiAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzO1xuICB9LCB7fSk7XG59XG5cbmZ1bmN0aW9uIHBhcnNlTWFwcGluZ1N0cmluZ0FycmF5KHZhbHVlczogc3RyaW5nW10pOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+IHtcbiAgcmV0dXJuIHZhbHVlcy5yZWR1Y2U8UmVjb3JkPHN0cmluZywgc3RyaW5nPj4oKHJlc3VsdHMsIHZhbHVlKSA9PiB7XG4gICAgY29uc3QgW2FsaWFzLCBmaWVsZE5hbWVdID0gcGFyc2VNYXBwaW5nU3RyaW5nKHZhbHVlKTtcbiAgICByZXN1bHRzW2ZpZWxkTmFtZV0gPSBhbGlhcztcbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfSwge30pO1xufVxuXG5mdW5jdGlvbiBwYXJzZU1hcHBpbmdTdHJpbmcodmFsdWU6IHN0cmluZyk6IFthbGlhczogc3RyaW5nLCBmaWVsZE5hbWU6IHN0cmluZ10ge1xuICAvLyBFaXRoZXIgdGhlIHZhbHVlIGlzICdmaWVsZCcgb3IgJ2ZpZWxkOiBwcm9wZXJ0eScuIEluIHRoZSBmaXJzdCBjYXNlLCBgcHJvcGVydHlgIHdpbGxcbiAgLy8gYmUgdW5kZWZpbmVkLCBpbiB3aGljaCBjYXNlIHRoZSBmaWVsZCBuYW1lIHNob3VsZCBhbHNvIGJlIHVzZWQgYXMgdGhlIHByb3BlcnR5IG5hbWUuXG4gIGNvbnN0IFtmaWVsZE5hbWUsIGJpbmRpbmdQcm9wZXJ0eU5hbWVdID0gdmFsdWUuc3BsaXQoJzonLCAyKS5tYXAoKHN0cikgPT4gc3RyLnRyaW0oKSk7XG4gIHJldHVybiBbYmluZGluZ1Byb3BlcnR5TmFtZSA/PyBmaWVsZE5hbWUsIGZpZWxkTmFtZV07XG59XG5cbmZ1bmN0aW9uIGNvbnZlcnREZWNsYXJlUGlwZUZhY2FkZVRvTWV0YWRhdGEoZGVjbGFyYXRpb246IFIzRGVjbGFyZVBpcGVGYWNhZGUpOiBSM1BpcGVNZXRhZGF0YSB7XG4gIHJldHVybiB7XG4gICAgbmFtZTogZGVjbGFyYXRpb24udHlwZS5uYW1lLFxuICAgIHR5cGU6IHdyYXBSZWZlcmVuY2UoZGVjbGFyYXRpb24udHlwZSksXG4gICAgdHlwZUFyZ3VtZW50Q291bnQ6IDAsXG4gICAgcGlwZU5hbWU6IGRlY2xhcmF0aW9uLm5hbWUsXG4gICAgZGVwczogbnVsbCxcbiAgICBwdXJlOiBkZWNsYXJhdGlvbi5wdXJlID8/IHRydWUsXG4gICAgaXNTdGFuZGFsb25lOiBkZWNsYXJhdGlvbi5pc1N0YW5kYWxvbmUgPz8gZmFsc2UsXG4gIH07XG59XG5cbmZ1bmN0aW9uIGNvbnZlcnREZWNsYXJlSW5qZWN0b3JGYWNhZGVUb01ldGFkYXRhKFxuICBkZWNsYXJhdGlvbjogUjNEZWNsYXJlSW5qZWN0b3JGYWNhZGUsXG4pOiBSM0luamVjdG9yTWV0YWRhdGEge1xuICByZXR1cm4ge1xuICAgIG5hbWU6IGRlY2xhcmF0aW9uLnR5cGUubmFtZSxcbiAgICB0eXBlOiB3cmFwUmVmZXJlbmNlKGRlY2xhcmF0aW9uLnR5cGUpLFxuICAgIHByb3ZpZGVyczpcbiAgICAgIGRlY2xhcmF0aW9uLnByb3ZpZGVycyAhPT0gdW5kZWZpbmVkICYmIGRlY2xhcmF0aW9uLnByb3ZpZGVycy5sZW5ndGggPiAwXG4gICAgICAgID8gbmV3IFdyYXBwZWROb2RlRXhwcihkZWNsYXJhdGlvbi5wcm92aWRlcnMpXG4gICAgICAgIDogbnVsbCxcbiAgICBpbXBvcnRzOlxuICAgICAgZGVjbGFyYXRpb24uaW1wb3J0cyAhPT0gdW5kZWZpbmVkXG4gICAgICAgID8gZGVjbGFyYXRpb24uaW1wb3J0cy5tYXAoKGkpID0+IG5ldyBXcmFwcGVkTm9kZUV4cHIoaSkpXG4gICAgICAgIDogW10sXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwdWJsaXNoRmFjYWRlKGdsb2JhbDogYW55KSB7XG4gIGNvbnN0IG5nOiBFeHBvcnRlZENvbXBpbGVyRmFjYWRlID0gZ2xvYmFsLm5nIHx8IChnbG9iYWwubmcgPSB7fSk7XG4gIG5nLsm1Y29tcGlsZXJGYWNhZGUgPSBuZXcgQ29tcGlsZXJGYWNhZGVJbXBsKCk7XG59XG4iXX0=