/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
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
        hostDirectives: convertHostDirectivesToMetadata(facade),
    };
}
function convertDeclareDirectiveFacadeToMetadata(declaration, typeSourceSpan) {
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
        hostDirectives: convertHostDirectivesToMetadata(declaration),
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
function convertHostDirectivesToMetadata(metadata) {
    if (metadata.hostDirectives?.length) {
        return metadata.hostDirectives.map((hostDirective) => {
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
                    outputs: hostDirective.outputs ? parseMappingStringArray(hostDirective.outputs) : null,
                };
        });
    }
    return null;
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
    const parsed = parseTemplate(template, sourceMapUrl, { preserveWhitespaces, interpolationConfig });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaml0X2NvbXBpbGVyX2ZhY2FkZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy9qaXRfY29tcGlsZXJfZmFjYWRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQThCSCxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDN0MsT0FBTyxFQUNMLHVCQUF1QixFQUt2QixpQkFBaUIsR0FDbEIsTUFBTSxRQUFRLENBQUM7QUFDaEIsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0seUJBQXlCLENBQUM7QUFDMUQsT0FBTyxFQUFDLDRCQUE0QixFQUFFLG1CQUFtQixFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFDdkYsT0FBTyxFQUNMLGNBQWMsRUFFZCxPQUFPLEVBQ1AsV0FBVyxFQUVYLFlBQVksRUFDWixlQUFlLEdBQ2hCLE1BQU0scUJBQXFCLENBQUM7QUFDN0IsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQ2pELE9BQU8sRUFBOEIsbUJBQW1CLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFFOUUsT0FBTyxFQUFDLHNCQUFzQixFQUFFLGFBQWEsRUFBdUIsTUFBTSxzQkFBc0IsQ0FBQztBQUNqRyxPQUFPLEVBQUMsZUFBZSxFQUFxQixNQUFNLGdDQUFnQyxDQUFDO0FBQ25GLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUNoRCxPQUFPLEVBQ0wsZUFBZSxFQUNmLG9DQUFvQyxFQUVwQyxzQkFBc0IsRUFDdEIsbUJBQW1CLEdBQ3BCLE1BQU0sOEJBQThCLENBQUM7QUFDdEMsT0FBTyxFQUFDLHVCQUF1QixFQUFpQixNQUFNLDRCQUE0QixDQUFDO0FBQ25GLE9BQU8sRUFDTCwrQkFBK0IsRUFFL0IsMkJBQTJCLEVBRTNCLGFBQWEsR0FDZCxNQUFNLGdCQUFnQixDQUFDO0FBQ3hCLE9BQU8s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Q0FBQyxDQUFDLEVBQUU7S0FDVCxDQUFDO0FBQ0osQ0FBQztBQUVELE1BQU0sVUFBVSxhQUFhLENBQUMsTUFBVztJQUN2QyxNQUFNLEVBQUUsR0FBMkIsTUFBTSxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7SUFDakUsRUFBRSxDQUFDLGVBQWUsR0FBRyxJQUFJLGtCQUFrQixFQUFFLENBQUM7QUFDaEQsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1xuICBDb21waWxlckZhY2FkZSxcbiAgQ29yZUVudmlyb25tZW50LFxuICBFeHBvcnRlZENvbXBpbGVyRmFjYWRlLFxuICBMZWdhY3lJbnB1dFBhcnRpYWxNYXBwaW5nLFxuICBPcGFxdWVWYWx1ZSxcbiAgUjNDb21wb25lbnRNZXRhZGF0YUZhY2FkZSxcbiAgUjNEZWNsYXJlQ29tcG9uZW50RmFjYWRlLFxuICBSM0RlY2xhcmVEZXBlbmRlbmN5TWV0YWRhdGFGYWNhZGUsXG4gIFIzRGVjbGFyZURpcmVjdGl2ZURlcGVuZGVuY3lGYWNhZGUsXG4gIFIzRGVjbGFyZURpcmVjdGl2ZUZhY2FkZSxcbiAgUjNEZWNsYXJlRmFjdG9yeUZhY2FkZSxcbiAgUjNEZWNsYXJlSW5qZWN0YWJsZUZhY2FkZSxcbiAgUjNEZWNsYXJlSW5qZWN0b3JGYWNhZGUsXG4gIFIzRGVjbGFyZU5nTW9kdWxlRmFjYWRlLFxuICBSM0RlY2xhcmVQaXBlRGVwZW5kZW5jeUZhY2FkZSxcbiAgUjNEZWNsYXJlUGlwZUZhY2FkZSxcbiAgUjNEZWNsYXJlUXVlcnlNZXRhZGF0YUZhY2FkZSxcbiAgUjNEZXBlbmRlbmN5TWV0YWRhdGFGYWNhZGUsXG4gIFIzRGlyZWN0aXZlTWV0YWRhdGFGYWNhZGUsXG4gIFIzRmFjdG9yeURlZk1ldGFkYXRhRmFjYWRlLFxuICBSM0luamVjdGFibGVNZXRhZGF0YUZhY2FkZSxcbiAgUjNJbmplY3Rvck1ldGFkYXRhRmFjYWRlLFxuICBSM05nTW9kdWxlTWV0YWRhdGFGYWNhZGUsXG4gIFIzUGlwZU1ldGFkYXRhRmFjYWRlLFxuICBSM1F1ZXJ5TWV0YWRhdGFGYWNhZGUsXG4gIFIzVGVtcGxhdGVEZXBlbmRlbmN5RmFjYWRlLFxufSBmcm9tICcuL2NvbXBpbGVyX2ZhY2FkZV9pbnRlcmZhY2UnO1xuaW1wb3J0IHtDb25zdGFudFBvb2x9IGZyb20gJy4vY29uc3RhbnRfcG9vbCc7XG5pbXBvcnQge1xuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgSG9zdEJpbmRpbmcsXG4gIEhvc3RMaXN0ZW5lcixcbiAgSW5wdXQsXG4gIE91dHB1dCxcbiAgVmlld0VuY2Fwc3VsYXRpb24sXG59IGZyb20gJy4vY29yZSc7XG5pbXBvcnQge2NvbXBpbGVJbmplY3RhYmxlfSBmcm9tICcuL2luamVjdGFibGVfY29tcGlsZXJfMic7XG5pbXBvcnQge0RFRkFVTFRfSU5URVJQT0xBVElPTl9DT05GSUcsIEludGVycG9sYXRpb25Db25maWd9IGZyb20gJy4vbWxfcGFyc2VyL2RlZmF1bHRzJztcbmltcG9ydCB7XG4gIERlY2xhcmVWYXJTdG10LFxuICBFeHByZXNzaW9uLFxuICBsaXRlcmFsLFxuICBMaXRlcmFsRXhwcixcbiAgU3RhdGVtZW50LFxuICBTdG10TW9kaWZpZXIsXG4gIFdyYXBwZWROb2RlRXhwcixcbn0gZnJvbSAnLi9vdXRwdXQvb3V0cHV0X2FzdCc7XG5pbXBvcnQge0ppdEV2YWx1YXRvcn0gZnJvbSAnLi9vdXRwdXQvb3V0cHV0X2ppdCc7XG5pbXBvcnQge1BhcnNlRXJyb3IsIFBhcnNlU291cmNlU3BhbiwgcjNKaXRUeXBlU291cmNlU3Bhbn0gZnJvbSAnLi9wYXJzZV91dGlsJztcbmltcG9ydCB7RGVmZXJyZWRCbG9ja30gZnJvbSAnLi9yZW5kZXIzL3IzX2FzdCc7XG5pbXBvcnQge2NvbXBpbGVGYWN0b3J5RnVuY3Rpb24sIEZhY3RvcnlUYXJnZXQsIFIzRGVwZW5kZW5jeU1ldGFkYXRhfSBmcm9tICcuL3JlbmRlcjMvcjNfZmFjdG9yeSc7XG5pbXBvcnQge2NvbXBpbGVJbmplY3RvciwgUjNJbmplY3Rvck1ldGFkYXRhfSBmcm9tICcuL3JlbmRlcjMvcjNfaW5qZWN0b3JfY29tcGlsZXInO1xuaW1wb3J0IHtSM0ppdFJlZmxlY3Rvcn0gZnJvbSAnLi9yZW5kZXIzL3IzX2ppdCc7XG5pbXBvcnQge1xuICBjb21waWxlTmdNb2R1bGUsXG4gIGNvbXBpbGVOZ01vZHVsZURlY2xhcmF0aW9uRXhwcmVzc2lvbixcbiAgUjNOZ01vZHVsZU1ldGFkYXRhLFxuICBSM05nTW9kdWxlTWV0YWRhdGFLaW5kLFxuICBSM1NlbGVjdG9yU2NvcGVNb2RlLFxufSBmcm9tICcuL3JlbmRlcjMvcjNfbW9kdWxlX2NvbXBpbGVyJztcbmltcG9ydCB7Y29tcGlsZVBpcGVGcm9tTWV0YWRhdGEsIFIzUGlwZU1ldGFkYXRhfSBmcm9tICcuL3JlbmRlcjMvcjNfcGlwZV9jb21waWxlcic7XG5pbXBvcnQge1xuICBjcmVhdGVNYXlCZUZvcndhcmRSZWZFeHByZXNzaW9uLFxuICBGb3J3YXJkUmVmSGFuZGxpbmcsXG4gIGdldFNhZmVQcm9wZXJ0eUFjY2Vzc1N0cmluZyxcbiAgTWF5YmVGb3J3YXJkUmVmRXhwcmVzc2lvbixcbiAgd3JhcFJlZmVyZW5jZSxcbn0gZnJvbSAnLi9yZW5kZXIzL3V0aWwnO1xuaW1wb3J0IHtcbiAgRGVjbGFyYXRpb25MaXN0RW1pdE1vZGUsXG4gIERlZmVyQmxvY2tEZXBzRW1pdE1vZGUsXG4gIFIzQ29tcG9uZW50RGVmZXJNZXRhZGF0YSxcbiAgUjNDb21wb25lbnRNZXRhZGF0YSxcbiAgUjNEaXJlY3RpdmVEZXBlbmRlbmN5TWV0YWRhdGEsXG4gIFIzRGlyZWN0aXZlTWV0YWRhdGEsXG4gIFIzSG9zdERpcmVjdGl2ZU1ldGFkYXRhLFxuICBSM0hvc3RNZXRhZGF0YSxcbiAgUjNJbnB1dE1ldGFkYXRhLFxuICBSM1BpcGVEZXBlbmRlbmN5TWV0YWRhdGEsXG4gIFIzUXVlcnlNZXRhZGF0YSxcbiAgUjNUZW1wbGF0ZURlcGVuZGVuY3ksXG4gIFIzVGVtcGxhdGVEZXBlbmRlbmN5S2luZCxcbiAgUjNUZW1wbGF0ZURlcGVuZGVuY3lNZXRhZGF0YSxcbn0gZnJvbSAnLi9yZW5kZXIzL3ZpZXcvYXBpJztcbmltcG9ydCB7XG4gIGNvbXBpbGVDb21wb25lbnRGcm9tTWV0YWRhdGEsXG4gIGNvbXBpbGVEaXJlY3RpdmVGcm9tTWV0YWRhdGEsXG4gIFBhcnNlZEhvc3RCaW5kaW5ncyxcbiAgcGFyc2VIb3N0QmluZGluZ3MsXG4gIHZlcmlmeUhvc3RCaW5kaW5ncyxcbn0gZnJvbSAnLi9yZW5kZXIzL3ZpZXcvY29tcGlsZXInO1xuXG5pbXBvcnQgdHlwZSB7Qm91bmRUYXJnZXR9IGZyb20gJy4vcmVuZGVyMy92aWV3L3QyX2FwaSc7XG5pbXBvcnQge1IzVGFyZ2V0QmluZGVyfSBmcm9tICcuL3JlbmRlcjMvdmlldy90Ml9iaW5kZXInO1xuaW1wb3J0IHttYWtlQmluZGluZ1BhcnNlciwgcGFyc2VUZW1wbGF0ZX0gZnJvbSAnLi9yZW5kZXIzL3ZpZXcvdGVtcGxhdGUnO1xuaW1wb3J0IHtSZXNvdXJjZUxvYWRlcn0gZnJvbSAnLi9yZXNvdXJjZV9sb2FkZXInO1xuaW1wb3J0IHtEb21FbGVtZW50U2NoZW1hUmVnaXN0cnl9IGZyb20gJy4vc2NoZW1hL2RvbV9lbGVtZW50X3NjaGVtYV9yZWdpc3RyeSc7XG5pbXBvcnQge1NlbGVjdG9yTWF0Y2hlcn0gZnJvbSAnLi9zZWxlY3Rvcic7XG5cbmV4cG9ydCBjbGFzcyBDb21waWxlckZhY2FkZUltcGwgaW1wbGVtZW50cyBDb21waWxlckZhY2FkZSB7XG4gIEZhY3RvcnlUYXJnZXQgPSBGYWN0b3J5VGFyZ2V0O1xuICBSZXNvdXJjZUxvYWRlciA9IFJlc291cmNlTG9hZGVyO1xuICBwcml2YXRlIGVsZW1lbnRTY2hlbWFSZWdpc3RyeSA9IG5ldyBEb21FbGVtZW50U2NoZW1hUmVnaXN0cnkoKTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGppdEV2YWx1YXRvciA9IG5ldyBKaXRFdmFsdWF0b3IoKSkge31cblxuICBjb21waWxlUGlwZShcbiAgICBhbmd1bGFyQ29yZUVudjogQ29yZUVudmlyb25tZW50LFxuICAgIHNvdXJjZU1hcFVybDogc3RyaW5nLFxuICAgIGZhY2FkZTogUjNQaXBlTWV0YWRhdGFGYWNhZGUsXG4gICk6IGFueSB7XG4gICAgY29uc3QgbWV0YWRhdGE6IFIzUGlwZU1ldGFkYXRhID0ge1xuICAgICAgbmFtZTogZmFjYWRlLm5hbWUsXG4gICAgICB0eXBlOiB3cmFwUmVmZXJlbmNlKGZhY2FkZS50eXBlKSxcbiAgICAgIHR5cGVBcmd1bWVudENvdW50OiAwLFxuICAgICAgZGVwczogbnVsbCxcbiAgICAgIHBpcGVOYW1lOiBmYWNhZGUucGlwZU5hbWUsXG4gICAgICBwdXJlOiBmYWNhZGUucHVyZSxcbiAgICAgIGlzU3RhbmRhbG9uZTogZmFjYWRlLmlzU3RhbmRhbG9uZSxcbiAgICB9O1xuICAgIGNvbnN0IHJlcyA9IGNvbXBpbGVQaXBlRnJvbU1ldGFkYXRhKG1ldGFkYXRhKTtcbiAgICByZXR1cm4gdGhpcy5qaXRFeHByZXNzaW9uKHJlcy5leHByZXNzaW9uLCBhbmd1bGFyQ29yZUVudiwgc291cmNlTWFwVXJsLCBbXSk7XG4gIH1cblxuICBjb21waWxlUGlwZURlY2xhcmF0aW9uKFxuICAgIGFuZ3VsYXJDb3JlRW52OiBDb3JlRW52aXJvbm1lbnQsXG4gICAgc291cmNlTWFwVXJsOiBzdHJpbmcsXG4gICAgZGVjbGFyYXRpb246IFIzRGVjbGFyZVBpcGVGYWNhZGUsXG4gICk6IGFueSB7XG4gICAgY29uc3QgbWV0YSA9IGNvbnZlcnREZWNsYXJlUGlwZUZhY2FkZVRvTWV0YWRhdGEoZGVjbGFyYXRpb24pO1xuICAgIGNvbnN0IHJlcyA9IGNvbXBpbGVQaXBlRnJvbU1ldGFkYXRhKG1ldGEpO1xuICAgIHJldHVybiB0aGlzLmppdEV4cHJlc3Npb24ocmVzLmV4cHJlc3Npb24sIGFuZ3VsYXJDb3JlRW52LCBzb3VyY2VNYXBVcmwsIFtdKTtcbiAgfVxuXG4gIGNvbXBpbGVJbmplY3RhYmxlKFxuICAgIGFuZ3VsYXJDb3JlRW52OiBDb3JlRW52aXJvbm1lbnQsXG4gICAgc291cmNlTWFwVXJsOiBzdHJpbmcsXG4gICAgZmFjYWRlOiBSM0luamVjdGFibGVNZXRhZGF0YUZhY2FkZSxcbiAgKTogYW55IHtcbiAgICBjb25zdCB7ZXhwcmVzc2lvbiwgc3RhdGVtZW50c30gPSBjb21waWxlSW5qZWN0YWJsZShcbiAgICAgIHtcbiAgICAgICAgbmFtZTogZmFjYWRlLm5hbWUsXG4gICAgICAgIHR5cGU6IHdyYXBSZWZlcmVuY2UoZmFjYWRlLnR5cGUpLFxuICAgICAgICB0eXBlQXJndW1lbnRDb3VudDogZmFjYWRlLnR5cGVBcmd1bWVudENvdW50LFxuICAgICAgICBwcm92aWRlZEluOiBjb21wdXRlUHJvdmlkZWRJbihmYWNhZGUucHJvdmlkZWRJbiksXG4gICAgICAgIHVzZUNsYXNzOiBjb252ZXJ0VG9Qcm92aWRlckV4cHJlc3Npb24oZmFjYWRlLCAndXNlQ2xhc3MnKSxcbiAgICAgICAgdXNlRmFjdG9yeTogd3JhcEV4cHJlc3Npb24oZmFjYWRlLCAndXNlRmFjdG9yeScpLFxuICAgICAgICB1c2VWYWx1ZTogY29udmVydFRvUHJvdmlkZXJFeHByZXNzaW9uKGZhY2FkZSwgJ3VzZVZhbHVlJyksXG4gICAgICAgIHVzZUV4aXN0aW5nOiBjb252ZXJ0VG9Qcm92aWRlckV4cHJlc3Npb24oZmFjYWRlLCAndXNlRXhpc3RpbmcnKSxcbiAgICAgICAgZGVwczogZmFjYWRlLmRlcHM/Lm1hcChjb252ZXJ0UjNEZXBlbmRlbmN5TWV0YWRhdGEpLFxuICAgICAgfSxcbiAgICAgIC8qIHJlc29sdmVGb3J3YXJkUmVmcyAqLyB0cnVlLFxuICAgICk7XG5cbiAgICByZXR1cm4gdGhpcy5qaXRFeHByZXNzaW9uKGV4cHJlc3Npb24sIGFuZ3VsYXJDb3JlRW52LCBzb3VyY2VNYXBVcmwsIHN0YXRlbWVudHMpO1xuICB9XG5cbiAgY29tcGlsZUluamVjdGFibGVEZWNsYXJhdGlvbihcbiAgICBhbmd1bGFyQ29yZUVudjogQ29yZUVudmlyb25tZW50LFxuICAgIHNvdXJjZU1hcFVybDogc3RyaW5nLFxuICAgIGZhY2FkZTogUjNEZWNsYXJlSW5qZWN0YWJsZUZhY2FkZSxcbiAgKTogYW55IHtcbiAgICBjb25zdCB7ZXhwcmVzc2lvbiwgc3RhdGVtZW50c30gPSBjb21waWxlSW5qZWN0YWJsZShcbiAgICAgIHtcbiAgICAgICAgbmFtZTogZmFjYWRlLnR5cGUubmFtZSxcbiAgICAgICAgdHlwZTogd3JhcFJlZmVyZW5jZShmYWNhZGUudHlwZSksXG4gICAgICAgIHR5cGVBcmd1bWVudENvdW50OiAwLFxuICAgICAgICBwcm92aWRlZEluOiBjb21wdXRlUHJvdmlkZWRJbihmYWNhZGUucHJvdmlkZWRJbiksXG4gICAgICAgIHVzZUNsYXNzOiBjb252ZXJ0VG9Qcm92aWRlckV4cHJlc3Npb24oZmFjYWRlLCAndXNlQ2xhc3MnKSxcbiAgICAgICAgdXNlRmFjdG9yeTogd3JhcEV4cHJlc3Npb24oZmFjYWRlLCAndXNlRmFjdG9yeScpLFxuICAgICAgICB1c2VWYWx1ZTogY29udmVydFRvUHJvdmlkZXJFeHByZXNzaW9uKGZhY2FkZSwgJ3VzZVZhbHVlJyksXG4gICAgICAgIHVzZUV4aXN0aW5nOiBjb252ZXJ0VG9Qcm92aWRlckV4cHJlc3Npb24oZmFjYWRlLCAndXNlRXhpc3RpbmcnKSxcbiAgICAgICAgZGVwczogZmFjYWRlLmRlcHM/Lm1hcChjb252ZXJ0UjNEZWNsYXJlRGVwZW5kZW5jeU1ldGFkYXRhKSxcbiAgICAgIH0sXG4gICAgICAvKiByZXNvbHZlRm9yd2FyZFJlZnMgKi8gdHJ1ZSxcbiAgICApO1xuXG4gICAgcmV0dXJuIHRoaXMuaml0RXhwcmVzc2lvbihleHByZXNzaW9uLCBhbmd1bGFyQ29yZUVudiwgc291cmNlTWFwVXJsLCBzdGF0ZW1lbnRzKTtcbiAgfVxuXG4gIGNvbXBpbGVJbmplY3RvcihcbiAgICBhbmd1bGFyQ29yZUVudjogQ29yZUVudmlyb25tZW50LFxuICAgIHNvdXJjZU1hcFVybDogc3RyaW5nLFxuICAgIGZhY2FkZTogUjNJbmplY3Rvck1ldGFkYXRhRmFjYWRlLFxuICApOiBhbnkge1xuICAgIGNvbnN0IG1ldGE6IFIzSW5qZWN0b3JNZXRhZGF0YSA9IHtcbiAgICAgIG5hbWU6IGZhY2FkZS5uYW1lLFxuICAgICAgdHlwZTogd3JhcFJlZmVyZW5jZShmYWNhZGUudHlwZSksXG4gICAgICBwcm92aWRlcnM6XG4gICAgICAgIGZhY2FkZS5wcm92aWRlcnMgJiYgZmFjYWRlLnByb3ZpZGVycy5sZW5ndGggPiAwXG4gICAgICAgICAgPyBuZXcgV3JhcHBlZE5vZGVFeHByKGZhY2FkZS5wcm92aWRlcnMpXG4gICAgICAgICAgOiBudWxsLFxuICAgICAgaW1wb3J0czogZmFjYWRlLmltcG9ydHMubWFwKChpKSA9PiBuZXcgV3JhcHBlZE5vZGVFeHByKGkpKSxcbiAgICB9O1xuICAgIGNvbnN0IHJlcyA9IGNvbXBpbGVJbmplY3RvcihtZXRhKTtcbiAgICByZXR1cm4gdGhpcy5qaXRFeHByZXNzaW9uKHJlcy5leHByZXNzaW9uLCBhbmd1bGFyQ29yZUVudiwgc291cmNlTWFwVXJsLCBbXSk7XG4gIH1cblxuICBjb21waWxlSW5qZWN0b3JEZWNsYXJhdGlvbihcbiAgICBhbmd1bGFyQ29yZUVudjogQ29yZUVudmlyb25tZW50LFxuICAgIHNvdXJjZU1hcFVybDogc3RyaW5nLFxuICAgIGRlY2xhcmF0aW9uOiBSM0RlY2xhcmVJbmplY3RvckZhY2FkZSxcbiAgKTogYW55IHtcbiAgICBjb25zdCBtZXRhID0gY29udmVydERlY2xhcmVJbmplY3RvckZhY2FkZVRvTWV0YWRhdGEoZGVjbGFyYXRpb24pO1xuICAgIGNvbnN0IHJlcyA9IGNvbXBpbGVJbmplY3RvcihtZXRhKTtcbiAgICByZXR1cm4gdGhpcy5qaXRFeHByZXNzaW9uKHJlcy5leHByZXNzaW9uLCBhbmd1bGFyQ29yZUVudiwgc291cmNlTWFwVXJsLCBbXSk7XG4gIH1cblxuICBjb21waWxlTmdNb2R1bGUoXG4gICAgYW5ndWxhckNvcmVFbnY6IENvcmVFbnZpcm9ubWVudCxcbiAgICBzb3VyY2VNYXBVcmw6IHN0cmluZyxcbiAgICBmYWNhZGU6IFIzTmdNb2R1bGVNZXRhZGF0YUZhY2FkZSxcbiAgKTogYW55IHtcbiAgICBjb25zdCBtZXRhOiBSM05nTW9kdWxlTWV0YWRhdGEgPSB7XG4gICAgICBraW5kOiBSM05nTW9kdWxlTWV0YWRhdGFLaW5kLkdsb2JhbCxcbiAgICAgIHR5cGU6IHdyYXBSZWZlcmVuY2UoZmFjYWRlLnR5cGUpLFxuICAgICAgYm9vdHN0cmFwOiBmYWNhZGUuYm9vdHN0cmFwLm1hcCh3cmFwUmVmZXJlbmNlKSxcbiAgICAgIGRlY2xhcmF0aW9uczogZmFjYWRlLmRlY2xhcmF0aW9ucy5tYXAod3JhcFJlZmVyZW5jZSksXG4gICAgICBwdWJsaWNEZWNsYXJhdGlvblR5cGVzOiBudWxsLCAvLyBvbmx5IG5lZWRlZCBmb3IgdHlwZXMgaW4gQU9UXG4gICAgICBpbXBvcnRzOiBmYWNhZGUuaW1wb3J0cy5tYXAod3JhcFJlZmVyZW5jZSksXG4gICAgICBpbmNsdWRlSW1wb3J0VHlwZXM6IHRydWUsXG4gICAgICBleHBvcnRzOiBmYWNhZGUuZXhwb3J0cy5tYXAod3JhcFJlZmVyZW5jZSksXG4gICAgICBzZWxlY3RvclNjb3BlTW9kZTogUjNTZWxlY3RvclNjb3BlTW9kZS5JbmxpbmUsXG4gICAgICBjb250YWluc0ZvcndhcmREZWNsczogZmFsc2UsXG4gICAgICBzY2hlbWFzOiBmYWNhZGUuc2NoZW1hcyA/IGZhY2FkZS5zY2hlbWFzLm1hcCh3cmFwUmVmZXJlbmNlKSA6IG51bGwsXG4gICAgICBpZDogZmFjYWRlLmlkID8gbmV3IFdyYXBwZWROb2RlRXhwcihmYWNhZGUuaWQpIDogbnVsbCxcbiAgICB9O1xuICAgIGNvbnN0IHJlcyA9IGNvbXBpbGVOZ01vZHVsZShtZXRhKTtcbiAgICByZXR1cm4gdGhpcy5qaXRFeHByZXNzaW9uKHJlcy5leHByZXNzaW9uLCBhbmd1bGFyQ29yZUVudiwgc291cmNlTWFwVXJsLCBbXSk7XG4gIH1cblxuICBjb21waWxlTmdNb2R1bGVEZWNsYXJhdGlvbihcbiAgICBhbmd1bGFyQ29yZUVudjogQ29yZUVudmlyb25tZW50LFxuICAgIHNvdXJjZU1hcFVybDogc3RyaW5nLFxuICAgIGRlY2xhcmF0aW9uOiBSM0RlY2xhcmVOZ01vZHVsZUZhY2FkZSxcbiAgKTogYW55IHtcbiAgICBjb25zdCBleHByZXNzaW9uID0gY29tcGlsZU5nTW9kdWxlRGVjbGFyYXRpb25FeHByZXNzaW9uKGRlY2xhcmF0aW9uKTtcbiAgICByZXR1cm4gdGhpcy5qaXRFeHByZXNzaW9uKGV4cHJlc3Npb24sIGFuZ3VsYXJDb3JlRW52LCBzb3VyY2VNYXBVcmwsIFtdKTtcbiAgfVxuXG4gIGNvbXBpbGVEaXJlY3RpdmUoXG4gICAgYW5ndWxhckNvcmVFbnY6IENvcmVFbnZpcm9ubWVudCxcbiAgICBzb3VyY2VNYXBVcmw6IHN0cmluZyxcbiAgICBmYWNhZGU6IFIzRGlyZWN0aXZlTWV0YWRhdGFGYWNhZGUsXG4gICk6IGFueSB7XG4gICAgY29uc3QgbWV0YTogUjNEaXJlY3RpdmVNZXRhZGF0YSA9IGNvbnZlcnREaXJlY3RpdmVGYWNhZGVUb01ldGFkYXRhKGZhY2FkZSk7XG4gICAgcmV0dXJuIHRoaXMuY29tcGlsZURpcmVjdGl2ZUZyb21NZXRhKGFuZ3VsYXJDb3JlRW52LCBzb3VyY2VNYXBVcmwsIG1ldGEpO1xuICB9XG5cbiAgY29tcGlsZURpcmVjdGl2ZURlY2xhcmF0aW9uKFxuICAgIGFuZ3VsYXJDb3JlRW52OiBDb3JlRW52aXJvbm1lbnQsXG4gICAgc291cmNlTWFwVXJsOiBzdHJpbmcsXG4gICAgZGVjbGFyYXRpb246IFIzRGVjbGFyZURpcmVjdGl2ZUZhY2FkZSxcbiAgKTogYW55IHtcbiAgICBjb25zdCB0eXBlU291cmNlU3BhbiA9IHRoaXMuY3JlYXRlUGFyc2VTb3VyY2VTcGFuKFxuICAgICAgJ0RpcmVjdGl2ZScsXG4gICAgICBkZWNsYXJhdGlvbi50eXBlLm5hbWUsXG4gICAgICBzb3VyY2VNYXBVcmwsXG4gICAgKTtcbiAgICBjb25zdCBtZXRhID0gY29udmVydERlY2xhcmVEaXJlY3RpdmVGYWNhZGVUb01ldGFkYXRhKGRlY2xhcmF0aW9uLCB0eXBlU291cmNlU3Bhbik7XG4gICAgcmV0dXJuIHRoaXMuY29tcGlsZURpcmVjdGl2ZUZyb21NZXRhKGFuZ3VsYXJDb3JlRW52LCBzb3VyY2VNYXBVcmwsIG1ldGEpO1xuICB9XG5cbiAgcHJpdmF0ZSBjb21waWxlRGlyZWN0aXZlRnJvbU1ldGEoXG4gICAgYW5ndWxhckNvcmVFbnY6IENvcmVFbnZpcm9ubWVudCxcbiAgICBzb3VyY2VNYXBVcmw6IHN0cmluZyxcbiAgICBtZXRhOiBSM0RpcmVjdGl2ZU1ldGFkYXRhLFxuICApOiBhbnkge1xuICAgIGNvbnN0IGNvbnN0YW50UG9vbCA9IG5ldyBDb25zdGFudFBvb2woKTtcbiAgICBjb25zdCBiaW5kaW5nUGFyc2VyID0gbWFrZUJpbmRpbmdQYXJzZXIoKTtcbiAgICBjb25zdCByZXMgPSBjb21waWxlRGlyZWN0aXZlRnJvbU1ldGFkYXRhKG1ldGEsIGNvbnN0YW50UG9vbCwgYmluZGluZ1BhcnNlcik7XG4gICAgcmV0dXJuIHRoaXMuaml0RXhwcmVzc2lvbihcbiAgICAgIHJlcy5leHByZXNzaW9uLFxuICAgICAgYW5ndWxhckNvcmVFbnYsXG4gICAgICBzb3VyY2VNYXBVcmwsXG4gICAgICBjb25zdGFudFBvb2wuc3RhdGVtZW50cyxcbiAgICApO1xuICB9XG5cbiAgY29tcGlsZUNvbXBvbmVudChcbiAgICBhbmd1bGFyQ29yZUVudjogQ29yZUVudmlyb25tZW50LFxuICAgIHNvdXJjZU1hcFVybDogc3RyaW5nLFxuICAgIGZhY2FkZTogUjNDb21wb25lbnRNZXRhZGF0YUZhY2FkZSxcbiAgKTogYW55IHtcbiAgICAvLyBQYXJzZSB0aGUgdGVtcGxhdGUgYW5kIGNoZWNrIGZvciBlcnJvcnMuXG4gICAgY29uc3Qge3RlbXBsYXRlLCBpbnRlcnBvbGF0aW9uLCBkZWZlcn0gPSBwYXJzZUppdFRlbXBsYXRlKFxuICAgICAgZmFjYWRlLnRlbXBsYXRlLFxuICAgICAgZmFjYWRlLm5hbWUsXG4gICAgICBzb3VyY2VNYXBVcmwsXG4gICAgICBmYWNhZGUucHJlc2VydmVXaGl0ZXNwYWNlcyxcbiAgICAgIGZhY2FkZS5pbnRlcnBvbGF0aW9uLFxuICAgICAgdW5kZWZpbmVkLFxuICAgICk7XG5cbiAgICAvLyBDb21waWxlIHRoZSBjb21wb25lbnQgbWV0YWRhdGEsIGluY2x1ZGluZyB0ZW1wbGF0ZSwgaW50byBhbiBleHByZXNzaW9uLlxuICAgIGNvbnN0IG1ldGE6IFIzQ29tcG9uZW50TWV0YWRhdGE8UjNUZW1wbGF0ZURlcGVuZGVuY3k+ID0ge1xuICAgICAgLi4uZmFjYWRlLFxuICAgICAgLi4uY29udmVydERpcmVjdGl2ZUZhY2FkZVRvTWV0YWRhdGEoZmFjYWRlKSxcbiAgICAgIHNlbGVjdG9yOiBmYWNhZGUuc2VsZWN0b3IgfHwgdGhpcy5lbGVtZW50U2NoZW1hUmVnaXN0cnkuZ2V0RGVmYXVsdENvbXBvbmVudEVsZW1lbnROYW1lKCksXG4gICAgICB0ZW1wbGF0ZSxcbiAgICAgIGRlY2xhcmF0aW9uczogZmFjYWRlLmRlY2xhcmF0aW9ucy5tYXAoY29udmVydERlY2xhcmF0aW9uRmFjYWRlVG9NZXRhZGF0YSksXG4gICAgICBkZWNsYXJhdGlvbkxpc3RFbWl0TW9kZTogRGVjbGFyYXRpb25MaXN0RW1pdE1vZGUuRGlyZWN0LFxuICAgICAgZGVmZXIsXG5cbiAgICAgIHN0eWxlczogWy4uLmZhY2FkZS5zdHlsZXMsIC4uLnRlbXBsYXRlLnN0eWxlc10sXG4gICAgICBlbmNhcHN1bGF0aW9uOiBmYWNhZGUuZW5jYXBzdWxhdGlvbixcbiAgICAgIGludGVycG9sYXRpb24sXG4gICAgICBjaGFuZ2VEZXRlY3Rpb246IGZhY2FkZS5jaGFuZ2VEZXRlY3Rpb24gPz8gbnVsbCxcbiAgICAgIGFuaW1hdGlvbnM6IGZhY2FkZS5hbmltYXRpb25zICE9IG51bGwgPyBuZXcgV3JhcHBlZE5vZGVFeHByKGZhY2FkZS5hbmltYXRpb25zKSA6IG51bGwsXG4gICAgICB2aWV3UHJvdmlkZXJzOlxuICAgICAgICBmYWNhZGUudmlld1Byb3ZpZGVycyAhPSBudWxsID8gbmV3IFdyYXBwZWROb2RlRXhwcihmYWNhZGUudmlld1Byb3ZpZGVycykgOiBudWxsLFxuICAgICAgcmVsYXRpdmVDb250ZXh0RmlsZVBhdGg6ICcnLFxuICAgICAgaTE4blVzZUV4dGVybmFsSWRzOiB0cnVlLFxuICAgIH07XG4gICAgY29uc3Qgaml0RXhwcmVzc2lvblNvdXJjZU1hcCA9IGBuZzovLy8ke2ZhY2FkZS5uYW1lfS5qc2A7XG4gICAgcmV0dXJuIHRoaXMuY29tcGlsZUNvbXBvbmVudEZyb21NZXRhKGFuZ3VsYXJDb3JlRW52LCBqaXRFeHByZXNzaW9uU291cmNlTWFwLCBtZXRhKTtcbiAgfVxuXG4gIGNvbXBpbGVDb21wb25lbnREZWNsYXJhdGlvbihcbiAgICBhbmd1bGFyQ29yZUVudjogQ29yZUVudmlyb25tZW50LFxuICAgIHNvdXJjZU1hcFVybDogc3RyaW5nLFxuICAgIGRlY2xhcmF0aW9uOiBSM0RlY2xhcmVDb21wb25lbnRGYWNhZGUsXG4gICk6IGFueSB7XG4gICAgY29uc3QgdHlwZVNvdXJjZVNwYW4gPSB0aGlzLmNyZWF0ZVBhcnNlU291cmNlU3BhbihcbiAgICAgICdDb21wb25lbnQnLFxuICAgICAgZGVjbGFyYXRpb24udHlwZS5uYW1lLFxuICAgICAgc291cmNlTWFwVXJsLFxuICAgICk7XG4gICAgY29uc3QgbWV0YSA9IGNvbnZlcnREZWNsYXJlQ29tcG9uZW50RmFjYWRlVG9NZXRhZGF0YShkZWNsYXJhdGlvbiwgdHlwZVNvdXJjZVNwYW4sIHNvdXJjZU1hcFVybCk7XG4gICAgcmV0dXJuIHRoaXMuY29tcGlsZUNvbXBvbmVudEZyb21NZXRhKGFuZ3VsYXJDb3JlRW52LCBzb3VyY2VNYXBVcmwsIG1ldGEpO1xuICB9XG5cbiAgcHJpdmF0ZSBjb21waWxlQ29tcG9uZW50RnJvbU1ldGEoXG4gICAgYW5ndWxhckNvcmVFbnY6IENvcmVFbnZpcm9ubWVudCxcbiAgICBzb3VyY2VNYXBVcmw6IHN0cmluZyxcbiAgICBtZXRhOiBSM0NvbXBvbmVudE1ldGFkYXRhPFIzVGVtcGxhdGVEZXBlbmRlbmN5PixcbiAgKTogYW55IHtcbiAgICBjb25zdCBjb25zdGFudFBvb2wgPSBuZXcgQ29uc3RhbnRQb29sKCk7XG4gICAgY29uc3QgYmluZGluZ1BhcnNlciA9IG1ha2VCaW5kaW5nUGFyc2VyKG1ldGEuaW50ZXJwb2xhdGlvbik7XG4gICAgY29uc3QgcmVzID0gY29tcGlsZUNvbXBvbmVudEZyb21NZXRhZGF0YShtZXRhLCBjb25zdGFudFBvb2wsIGJpbmRpbmdQYXJzZXIpO1xuICAgIHJldHVybiB0aGlzLmppdEV4cHJlc3Npb24oXG4gICAgICByZXMuZXhwcmVzc2lvbixcbiAgICAgIGFuZ3VsYXJDb3JlRW52LFxuICAgICAgc291cmNlTWFwVXJsLFxuICAgICAgY29uc3RhbnRQb29sLnN0YXRlbWVudHMsXG4gICAgKTtcbiAgfVxuXG4gIGNvbXBpbGVGYWN0b3J5KFxuICAgIGFuZ3VsYXJDb3JlRW52OiBDb3JlRW52aXJvbm1lbnQsXG4gICAgc291cmNlTWFwVXJsOiBzdHJpbmcsXG4gICAgbWV0YTogUjNGYWN0b3J5RGVmTWV0YWRhdGFGYWNhZGUsXG4gICkge1xuICAgIGNvbnN0IGZhY3RvcnlSZXMgPSBjb21waWxlRmFjdG9yeUZ1bmN0aW9uKHtcbiAgICAgIG5hbWU6IG1ldGEubmFtZSxcbiAgICAgIHR5cGU6IHdyYXBSZWZlcmVuY2UobWV0YS50eXBlKSxcbiAgICAgIHR5cGVBcmd1bWVudENvdW50OiBtZXRhLnR5cGVBcmd1bWVudENvdW50LFxuICAgICAgZGVwczogY29udmVydFIzRGVwZW5kZW5jeU1ldGFkYXRhQXJyYXkobWV0YS5kZXBzKSxcbiAgICAgIHRhcmdldDogbWV0YS50YXJnZXQsXG4gICAgfSk7XG4gICAgcmV0dXJuIHRoaXMuaml0RXhwcmVzc2lvbihcbiAgICAgIGZhY3RvcnlSZXMuZXhwcmVzc2lvbixcbiAgICAgIGFuZ3VsYXJDb3JlRW52LFxuICAgICAgc291cmNlTWFwVXJsLFxuICAgICAgZmFjdG9yeVJlcy5zdGF0ZW1lbnRzLFxuICAgICk7XG4gIH1cblxuICBjb21waWxlRmFjdG9yeURlY2xhcmF0aW9uKFxuICAgIGFuZ3VsYXJDb3JlRW52OiBDb3JlRW52aXJvbm1lbnQsXG4gICAgc291cmNlTWFwVXJsOiBzdHJpbmcsXG4gICAgbWV0YTogUjNEZWNsYXJlRmFjdG9yeUZhY2FkZSxcbiAgKSB7XG4gICAgY29uc3QgZmFjdG9yeVJlcyA9IGNvbXBpbGVGYWN0b3J5RnVuY3Rpb24oe1xuICAgICAgbmFtZTogbWV0YS50eXBlLm5hbWUsXG4gICAgICB0eXBlOiB3cmFwUmVmZXJlbmNlKG1ldGEudHlwZSksXG4gICAgICB0eXBlQXJndW1lbnRDb3VudDogMCxcbiAgICAgIGRlcHM6IEFycmF5LmlzQXJyYXkobWV0YS5kZXBzKVxuICAgICAgICA/IG1ldGEuZGVwcy5tYXAoY29udmVydFIzRGVjbGFyZURlcGVuZGVuY3lNZXRhZGF0YSlcbiAgICAgICAgOiBtZXRhLmRlcHMsXG4gICAgICB0YXJnZXQ6IG1ldGEudGFyZ2V0LFxuICAgIH0pO1xuICAgIHJldHVybiB0aGlzLmppdEV4cHJlc3Npb24oXG4gICAgICBmYWN0b3J5UmVzLmV4cHJlc3Npb24sXG4gICAgICBhbmd1bGFyQ29yZUVudixcbiAgICAgIHNvdXJjZU1hcFVybCxcbiAgICAgIGZhY3RvcnlSZXMuc3RhdGVtZW50cyxcbiAgICApO1xuICB9XG5cbiAgY3JlYXRlUGFyc2VTb3VyY2VTcGFuKGtpbmQ6IHN0cmluZywgdHlwZU5hbWU6IHN0cmluZywgc291cmNlVXJsOiBzdHJpbmcpOiBQYXJzZVNvdXJjZVNwYW4ge1xuICAgIHJldHVybiByM0ppdFR5cGVTb3VyY2VTcGFuKGtpbmQsIHR5cGVOYW1lLCBzb3VyY2VVcmwpO1xuICB9XG5cbiAgLyoqXG4gICAqIEpJVCBjb21waWxlcyBhbiBleHByZXNzaW9uIGFuZCByZXR1cm5zIHRoZSByZXN1bHQgb2YgZXhlY3V0aW5nIHRoYXQgZXhwcmVzc2lvbi5cbiAgICpcbiAgICogQHBhcmFtIGRlZiB0aGUgZGVmaW5pdGlvbiB3aGljaCB3aWxsIGJlIGNvbXBpbGVkIGFuZCBleGVjdXRlZCB0byBnZXQgdGhlIHZhbHVlIHRvIHBhdGNoXG4gICAqIEBwYXJhbSBjb250ZXh0IGFuIG9iamVjdCBtYXAgb2YgQGFuZ3VsYXIvY29yZSBzeW1ib2wgbmFtZXMgdG8gc3ltYm9scyB3aGljaCB3aWxsIGJlIGF2YWlsYWJsZVxuICAgKiBpbiB0aGUgY29udGV4dCBvZiB0aGUgY29tcGlsZWQgZXhwcmVzc2lvblxuICAgKiBAcGFyYW0gc291cmNlVXJsIGEgVVJMIHRvIHVzZSBmb3IgdGhlIHNvdXJjZSBtYXAgb2YgdGhlIGNvbXBpbGVkIGV4cHJlc3Npb25cbiAgICogQHBhcmFtIHByZVN0YXRlbWVudHMgYSBjb2xsZWN0aW9uIG9mIHN0YXRlbWVudHMgdGhhdCBzaG91bGQgYmUgZXZhbHVhdGVkIGJlZm9yZSB0aGUgZXhwcmVzc2lvbi5cbiAgICovXG4gIHByaXZhdGUgaml0RXhwcmVzc2lvbihcbiAgICBkZWY6IEV4cHJlc3Npb24sXG4gICAgY29udGV4dDoge1trZXk6IHN0cmluZ106IGFueX0sXG4gICAgc291cmNlVXJsOiBzdHJpbmcsXG4gICAgcHJlU3RhdGVtZW50czogU3RhdGVtZW50W10sXG4gICk6IGFueSB7XG4gICAgLy8gVGhlIENvbnN0YW50UG9vbCBtYXkgY29udGFpbiBTdGF0ZW1lbnRzIHdoaWNoIGRlY2xhcmUgdmFyaWFibGVzIHVzZWQgaW4gdGhlIGZpbmFsIGV4cHJlc3Npb24uXG4gICAgLy8gVGhlcmVmb3JlLCBpdHMgc3RhdGVtZW50cyBuZWVkIHRvIHByZWNlZGUgdGhlIGFjdHVhbCBKSVQgb3BlcmF0aW9uLiBUaGUgZmluYWwgc3RhdGVtZW50IGlzIGFcbiAgICAvLyBkZWNsYXJhdGlvbiBvZiAkZGVmIHdoaWNoIGlzIHNldCB0byB0aGUgZXhwcmVzc2lvbiBiZWluZyBjb21waWxlZC5cbiAgICBjb25zdCBzdGF0ZW1lbnRzOiBTdGF0ZW1lbnRbXSA9IFtcbiAgICAgIC4uLnByZVN0YXRlbWVudHMsXG4gICAgICBuZXcgRGVjbGFyZVZhclN0bXQoJyRkZWYnLCBkZWYsIHVuZGVmaW5lZCwgU3RtdE1vZGlmaWVyLkV4cG9ydGVkKSxcbiAgICBdO1xuXG4gICAgY29uc3QgcmVzID0gdGhpcy5qaXRFdmFsdWF0b3IuZXZhbHVhdGVTdGF0ZW1lbnRzKFxuICAgICAgc291cmNlVXJsLFxuICAgICAgc3RhdGVtZW50cyxcbiAgICAgIG5ldyBSM0ppdFJlZmxlY3Rvcihjb250ZXh0KSxcbiAgICAgIC8qIGVuYWJsZVNvdXJjZU1hcHMgKi8gdHJ1ZSxcbiAgICApO1xuICAgIHJldHVybiByZXNbJyRkZWYnXTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjb252ZXJ0VG9SM1F1ZXJ5TWV0YWRhdGEoZmFjYWRlOiBSM1F1ZXJ5TWV0YWRhdGFGYWNhZGUpOiBSM1F1ZXJ5TWV0YWRhdGEge1xuICByZXR1cm4ge1xuICAgIC4uLmZhY2FkZSxcbiAgICBpc1NpZ25hbDogZmFjYWRlLmlzU2lnbmFsLFxuICAgIHByZWRpY2F0ZTogY29udmVydFF1ZXJ5UHJlZGljYXRlKGZhY2FkZS5wcmVkaWNhdGUpLFxuICAgIHJlYWQ6IGZhY2FkZS5yZWFkID8gbmV3IFdyYXBwZWROb2RlRXhwcihmYWNhZGUucmVhZCkgOiBudWxsLFxuICAgIHN0YXRpYzogZmFjYWRlLnN0YXRpYyxcbiAgICBlbWl0RGlzdGluY3RDaGFuZ2VzT25seTogZmFjYWRlLmVtaXREaXN0aW5jdENoYW5nZXNPbmx5LFxuICB9O1xufVxuXG5mdW5jdGlvbiBjb252ZXJ0UXVlcnlEZWNsYXJhdGlvblRvTWV0YWRhdGEoXG4gIGRlY2xhcmF0aW9uOiBSM0RlY2xhcmVRdWVyeU1ldGFkYXRhRmFjYWRlLFxuKTogUjNRdWVyeU1ldGFkYXRhIHtcbiAgcmV0dXJuIHtcbiAgICBwcm9wZXJ0eU5hbWU6IGRlY2xhcmF0aW9uLnByb3BlcnR5TmFtZSxcbiAgICBmaXJzdDogZGVjbGFyYXRpb24uZmlyc3QgPz8gZmFsc2UsXG4gICAgcHJlZGljYXRlOiBjb252ZXJ0UXVlcnlQcmVkaWNhdGUoZGVjbGFyYXRpb24ucHJlZGljYXRlKSxcbiAgICBkZXNjZW5kYW50czogZGVjbGFyYXRpb24uZGVzY2VuZGFudHMgPz8gZmFsc2UsXG4gICAgcmVhZDogZGVjbGFyYXRpb24ucmVhZCA/IG5ldyBXcmFwcGVkTm9kZUV4cHIoZGVjbGFyYXRpb24ucmVhZCkgOiBudWxsLFxuICAgIHN0YXRpYzogZGVjbGFyYXRpb24uc3RhdGljID8/IGZhbHNlLFxuICAgIGVtaXREaXN0aW5jdENoYW5nZXNPbmx5OiBkZWNsYXJhdGlvbi5lbWl0RGlzdGluY3RDaGFuZ2VzT25seSA/PyB0cnVlLFxuICAgIGlzU2lnbmFsOiAhIWRlY2xhcmF0aW9uLmlzU2lnbmFsLFxuICB9O1xufVxuXG5mdW5jdGlvbiBjb252ZXJ0UXVlcnlQcmVkaWNhdGUoXG4gIHByZWRpY2F0ZTogT3BhcXVlVmFsdWUgfCBzdHJpbmdbXSxcbik6IE1heWJlRm9yd2FyZFJlZkV4cHJlc3Npb24gfCBzdHJpbmdbXSB7XG4gIHJldHVybiBBcnJheS5pc0FycmF5KHByZWRpY2F0ZSlcbiAgICA/IC8vIFRoZSBwcmVkaWNhdGUgaXMgYW4gYXJyYXkgb2Ygc3RyaW5ncyBzbyBwYXNzIGl0IHRocm91Z2guXG4gICAgICBwcmVkaWNhdGVcbiAgICA6IC8vIFRoZSBwcmVkaWNhdGUgaXMgYSB0eXBlIC0gYXNzdW1lIHRoYXQgd2Ugd2lsbCBuZWVkIHRvIHVud3JhcCBhbnkgYGZvcndhcmRSZWYoKWAgY2FsbHMuXG4gICAgICBjcmVhdGVNYXlCZUZvcndhcmRSZWZFeHByZXNzaW9uKG5ldyBXcmFwcGVkTm9kZUV4cHIocHJlZGljYXRlKSwgRm9yd2FyZFJlZkhhbmRsaW5nLldyYXBwZWQpO1xufVxuXG5mdW5jdGlvbiBjb252ZXJ0RGlyZWN0aXZlRmFjYWRlVG9NZXRhZGF0YShmYWNhZGU6IFIzRGlyZWN0aXZlTWV0YWRhdGFGYWNhZGUpOiBSM0RpcmVjdGl2ZU1ldGFkYXRhIHtcbiAgY29uc3QgaW5wdXRzRnJvbU1ldGFkYXRhID0gcGFyc2VJbnB1dHNBcnJheShmYWNhZGUuaW5wdXRzIHx8IFtdKTtcbiAgY29uc3Qgb3V0cHV0c0Zyb21NZXRhZGF0YSA9IHBhcnNlTWFwcGluZ1N0cmluZ0FycmF5KGZhY2FkZS5vdXRwdXRzIHx8IFtdKTtcbiAgY29uc3QgcHJvcE1ldGFkYXRhID0gZmFjYWRlLnByb3BNZXRhZGF0YTtcbiAgY29uc3QgaW5wdXRzRnJvbVR5cGU6IFJlY29yZDxzdHJpbmcsIFIzSW5wdXRNZXRhZGF0YT4gPSB7fTtcbiAgY29uc3Qgb3V0cHV0c0Zyb21UeXBlOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge307XG4gIGZvciAoY29uc3QgZmllbGQgaW4gcHJvcE1ldGFkYXRhKSB7XG4gICAgaWYgKHByb3BNZXRhZGF0YS5oYXNPd25Qcm9wZXJ0eShmaWVsZCkpIHtcbiAgICAgIHByb3BNZXRhZGF0YVtmaWVsZF0uZm9yRWFjaCgoYW5uKSA9PiB7XG4gICAgICAgIGlmIChpc0lucHV0KGFubikpIHtcbiAgICAgICAgICBpbnB1dHNGcm9tVHlwZVtmaWVsZF0gPSB7XG4gICAgICAgICAgICBiaW5kaW5nUHJvcGVydHlOYW1lOiBhbm4uYWxpYXMgfHwgZmllbGQsXG4gICAgICAgICAgICBjbGFzc1Byb3BlcnR5TmFtZTogZmllbGQsXG4gICAgICAgICAgICByZXF1aXJlZDogYW5uLnJlcXVpcmVkIHx8IGZhbHNlLFxuICAgICAgICAgICAgLy8gRm9yIEpJVCwgZGVjb3JhdG9ycyBhcmUgdXNlZCB0byBkZWNsYXJlIHNpZ25hbCBpbnB1dHMuIFRoYXQgaXMgYmVjYXVzZSBvZlxuICAgICAgICAgICAgLy8gYSB0ZWNobmljYWwgbGltaXRhdGlvbiB3aGVyZSBpdCdzIG5vdCBwb3NzaWJsZSB0byBzdGF0aWNhbGx5IHJlZmxlY3QgY2xhc3NcbiAgICAgICAgICAgIC8vIG1lbWJlcnMgb2YgYSBkaXJlY3RpdmUvY29tcG9uZW50IGF0IHJ1bnRpbWUgYmVmb3JlIGluc3RhbnRpYXRpbmcgdGhlIGNsYXNzLlxuICAgICAgICAgICAgaXNTaWduYWw6ICEhYW5uLmlzU2lnbmFsLFxuICAgICAgICAgICAgdHJhbnNmb3JtRnVuY3Rpb246IGFubi50cmFuc2Zvcm0gIT0gbnVsbCA/IG5ldyBXcmFwcGVkTm9kZUV4cHIoYW5uLnRyYW5zZm9ybSkgOiBudWxsLFxuICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSBpZiAoaXNPdXRwdXQoYW5uKSkge1xuICAgICAgICAgIG91dHB1dHNGcm9tVHlwZVtmaWVsZF0gPSBhbm4uYWxpYXMgfHwgZmllbGQ7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7XG4gICAgLi4uZmFjYWRlLFxuICAgIHR5cGVBcmd1bWVudENvdW50OiAwLFxuICAgIHR5cGVTb3VyY2VTcGFuOiBmYWNhZGUudHlwZVNvdXJjZVNwYW4sXG4gICAgdHlwZTogd3JhcFJlZmVyZW5jZShmYWNhZGUudHlwZSksXG4gICAgZGVwczogbnVsbCxcbiAgICBob3N0OiB7XG4gICAgICAuLi5leHRyYWN0SG9zdEJpbmRpbmdzKGZhY2FkZS5wcm9wTWV0YWRhdGEsIGZhY2FkZS50eXBlU291cmNlU3BhbiwgZmFjYWRlLmhvc3QpLFxuICAgIH0sXG4gICAgaW5wdXRzOiB7Li4uaW5wdXRzRnJvbU1ldGFkYXRhLCAuLi5pbnB1dHNGcm9tVHlwZX0sXG4gICAgb3V0cHV0czogey4uLm91dHB1dHNGcm9tTWV0YWRhdGEsIC4uLm91dHB1dHNGcm9tVHlwZX0sXG4gICAgcXVlcmllczogZmFjYWRlLnF1ZXJpZXMubWFwKGNvbnZlcnRUb1IzUXVlcnlNZXRhZGF0YSksXG4gICAgcHJvdmlkZXJzOiBmYWNhZGUucHJvdmlkZXJzICE9IG51bGwgPyBuZXcgV3JhcHBlZE5vZGVFeHByKGZhY2FkZS5wcm92aWRlcnMpIDogbnVsbCxcbiAgICB2aWV3UXVlcmllczogZmFjYWRlLnZpZXdRdWVyaWVzLm1hcChjb252ZXJ0VG9SM1F1ZXJ5TWV0YWRhdGEpLFxuICAgIGZ1bGxJbmhlcml0YW5jZTogZmFsc2UsXG4gICAgaG9zdERpcmVjdGl2ZXM6IGNvbnZlcnRIb3N0RGlyZWN0aXZlc1RvTWV0YWRhdGEoZmFjYWRlKSxcbiAgfTtcbn1cblxuZnVuY3Rpb24gY29udmVydERlY2xhcmVEaXJlY3RpdmVGYWNhZGVUb01ldGFkYXRhKFxuICBkZWNsYXJhdGlvbjogUjNEZWNsYXJlRGlyZWN0aXZlRmFjYWRlLFxuICB0eXBlU291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuKTogUjNEaXJlY3RpdmVNZXRhZGF0YSB7XG4gIHJldHVybiB7XG4gICAgbmFtZTogZGVjbGFyYXRpb24udHlwZS5uYW1lLFxuICAgIHR5cGU6IHdyYXBSZWZlcmVuY2UoZGVjbGFyYXRpb24udHlwZSksXG4gICAgdHlwZVNvdXJjZVNwYW4sXG4gICAgc2VsZWN0b3I6IGRlY2xhcmF0aW9uLnNlbGVjdG9yID8/IG51bGwsXG4gICAgaW5wdXRzOiBkZWNsYXJhdGlvbi5pbnB1dHMgPyBpbnB1dHNQYXJ0aWFsTWV0YWRhdGFUb0lucHV0TWV0YWRhdGEoZGVjbGFyYXRpb24uaW5wdXRzKSA6IHt9LFxuICAgIG91dHB1dHM6IGRlY2xhcmF0aW9uLm91dHB1dHMgPz8ge30sXG4gICAgaG9zdDogY29udmVydEhvc3REZWNsYXJhdGlvblRvTWV0YWRhdGEoZGVjbGFyYXRpb24uaG9zdCksXG4gICAgcXVlcmllczogKGRlY2xhcmF0aW9uLnF1ZXJpZXMgPz8gW10pLm1hcChjb252ZXJ0UXVlcnlEZWNsYXJhdGlvblRvTWV0YWRhdGEpLFxuICAgIHZpZXdRdWVyaWVzOiAoZGVjbGFyYXRpb24udmlld1F1ZXJpZXMgPz8gW10pLm1hcChjb252ZXJ0UXVlcnlEZWNsYXJhdGlvblRvTWV0YWRhdGEpLFxuICAgIHByb3ZpZGVyczpcbiAgICAgIGRlY2xhcmF0aW9uLnByb3ZpZGVycyAhPT0gdW5kZWZpbmVkID8gbmV3IFdyYXBwZWROb2RlRXhwcihkZWNsYXJhdGlvbi5wcm92aWRlcnMpIDogbnVsbCxcbiAgICBleHBvcnRBczogZGVjbGFyYXRpb24uZXhwb3J0QXMgPz8gbnVsbCxcbiAgICB1c2VzSW5oZXJpdGFuY2U6IGRlY2xhcmF0aW9uLnVzZXNJbmhlcml0YW5jZSA/PyBmYWxzZSxcbiAgICBsaWZlY3ljbGU6IHt1c2VzT25DaGFuZ2VzOiBkZWNsYXJhdGlvbi51c2VzT25DaGFuZ2VzID8/IGZhbHNlfSxcbiAgICBkZXBzOiBudWxsLFxuICAgIHR5cGVBcmd1bWVudENvdW50OiAwLFxuICAgIGZ1bGxJbmhlcml0YW5jZTogZmFsc2UsXG4gICAgaXNTdGFuZGFsb25lOiBkZWNsYXJhdGlvbi5pc1N0YW5kYWxvbmUgPz8gZmFsc2UsXG4gICAgaXNTaWduYWw6IGRlY2xhcmF0aW9uLmlzU2lnbmFsID8/IGZhbHNlLFxuICAgIGhvc3REaXJlY3RpdmVzOiBjb252ZXJ0SG9zdERpcmVjdGl2ZXNUb01ldGFkYXRhKGRlY2xhcmF0aW9uKSxcbiAgfTtcbn1cblxuZnVuY3Rpb24gY29udmVydEhvc3REZWNsYXJhdGlvblRvTWV0YWRhdGEoXG4gIGhvc3Q6IFIzRGVjbGFyZURpcmVjdGl2ZUZhY2FkZVsnaG9zdCddID0ge30sXG4pOiBSM0hvc3RNZXRhZGF0YSB7XG4gIHJldHVybiB7XG4gICAgYXR0cmlidXRlczogY29udmVydE9wYXF1ZVZhbHVlc1RvRXhwcmVzc2lvbnMoaG9zdC5hdHRyaWJ1dGVzID8/IHt9KSxcbiAgICBsaXN0ZW5lcnM6IGhvc3QubGlzdGVuZXJzID8/IHt9LFxuICAgIHByb3BlcnRpZXM6IGhvc3QucHJvcGVydGllcyA/PyB7fSxcbiAgICBzcGVjaWFsQXR0cmlidXRlczoge1xuICAgICAgY2xhc3NBdHRyOiBob3N0LmNsYXNzQXR0cmlidXRlLFxuICAgICAgc3R5bGVBdHRyOiBob3N0LnN0eWxlQXR0cmlidXRlLFxuICAgIH0sXG4gIH07XG59XG5cbmZ1bmN0aW9uIGNvbnZlcnRIb3N0RGlyZWN0aXZlc1RvTWV0YWRhdGEoXG4gIG1ldGFkYXRhOiBSM0RlY2xhcmVEaXJlY3RpdmVGYWNhZGUgfCBSM0RpcmVjdGl2ZU1ldGFkYXRhRmFjYWRlLFxuKTogUjNIb3N0RGlyZWN0aXZlTWV0YWRhdGFbXSB8IG51bGwge1xuICBpZiAobWV0YWRhdGEuaG9zdERpcmVjdGl2ZXM/Lmxlbmd0aCkge1xuICAgIHJldHVybiBtZXRhZGF0YS5ob3N0RGlyZWN0aXZlcy5tYXAoKGhvc3REaXJlY3RpdmUpID0+IHtcbiAgICAgIHJldHVybiB0eXBlb2YgaG9zdERpcmVjdGl2ZSA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgICA/IHtcbiAgICAgICAgICAgIGRpcmVjdGl2ZTogd3JhcFJlZmVyZW5jZShob3N0RGlyZWN0aXZlKSxcbiAgICAgICAgICAgIGlucHV0czogbnVsbCxcbiAgICAgICAgICAgIG91dHB1dHM6IG51bGwsXG4gICAgICAgICAgICBpc0ZvcndhcmRSZWZlcmVuY2U6IGZhbHNlLFxuICAgICAgICAgIH1cbiAgICAgICAgOiB7XG4gICAgICAgICAgICBkaXJlY3RpdmU6IHdyYXBSZWZlcmVuY2UoaG9zdERpcmVjdGl2ZS5kaXJlY3RpdmUpLFxuICAgICAgICAgICAgaXNGb3J3YXJkUmVmZXJlbmNlOiBmYWxzZSxcbiAgICAgICAgICAgIGlucHV0czogaG9zdERpcmVjdGl2ZS5pbnB1dHMgPyBwYXJzZU1hcHBpbmdTdHJpbmdBcnJheShob3N0RGlyZWN0aXZlLmlucHV0cykgOiBudWxsLFxuICAgICAgICAgICAgb3V0cHV0czogaG9zdERpcmVjdGl2ZS5vdXRwdXRzID8gcGFyc2VNYXBwaW5nU3RyaW5nQXJyYXkoaG9zdERpcmVjdGl2ZS5vdXRwdXRzKSA6IG51bGwsXG4gICAgICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiBudWxsO1xufVxuXG5mdW5jdGlvbiBjb252ZXJ0T3BhcXVlVmFsdWVzVG9FeHByZXNzaW9ucyhvYmo6IHtba2V5OiBzdHJpbmddOiBPcGFxdWVWYWx1ZX0pOiB7XG4gIFtrZXk6IHN0cmluZ106IFdyYXBwZWROb2RlRXhwcjx1bmtub3duPjtcbn0ge1xuICBjb25zdCByZXN1bHQ6IHtba2V5OiBzdHJpbmddOiBXcmFwcGVkTm9kZUV4cHI8dW5rbm93bj59ID0ge307XG4gIGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKG9iaikpIHtcbiAgICByZXN1bHRba2V5XSA9IG5ldyBXcmFwcGVkTm9kZUV4cHIob2JqW2tleV0pO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIGNvbnZlcnREZWNsYXJlQ29tcG9uZW50RmFjYWRlVG9NZXRhZGF0YShcbiAgZGVjbDogUjNEZWNsYXJlQ29tcG9uZW50RmFjYWRlLFxuICB0eXBlU291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICBzb3VyY2VNYXBVcmw6IHN0cmluZyxcbik6IFIzQ29tcG9uZW50TWV0YWRhdGE8UjNUZW1wbGF0ZURlcGVuZGVuY3lNZXRhZGF0YT4ge1xuICBjb25zdCB7dGVtcGxhdGUsIGludGVycG9sYXRpb24sIGRlZmVyfSA9IHBhcnNlSml0VGVtcGxhdGUoXG4gICAgZGVjbC50ZW1wbGF0ZSxcbiAgICBkZWNsLnR5cGUubmFtZSxcbiAgICBzb3VyY2VNYXBVcmwsXG4gICAgZGVjbC5wcmVzZXJ2ZVdoaXRlc3BhY2VzID8/IGZhbHNlLFxuICAgIGRlY2wuaW50ZXJwb2xhdGlvbixcbiAgICBkZWNsLmRlZmVyQmxvY2tEZXBlbmRlbmNpZXMsXG4gICk7XG5cbiAgY29uc3QgZGVjbGFyYXRpb25zOiBSM1RlbXBsYXRlRGVwZW5kZW5jeU1ldGFkYXRhW10gPSBbXTtcbiAgaWYgKGRlY2wuZGVwZW5kZW5jaWVzKSB7XG4gICAgZm9yIChjb25zdCBpbm5lckRlcCBvZiBkZWNsLmRlcGVuZGVuY2llcykge1xuICAgICAgc3dpdGNoIChpbm5lckRlcC5raW5kKSB7XG4gICAgICAgIGNhc2UgJ2RpcmVjdGl2ZSc6XG4gICAgICAgIGNhc2UgJ2NvbXBvbmVudCc6XG4gICAgICAgICAgZGVjbGFyYXRpb25zLnB1c2goY29udmVydERpcmVjdGl2ZURlY2xhcmF0aW9uVG9NZXRhZGF0YShpbm5lckRlcCkpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdwaXBlJzpcbiAgICAgICAgICBkZWNsYXJhdGlvbnMucHVzaChjb252ZXJ0UGlwZURlY2xhcmF0aW9uVG9NZXRhZGF0YShpbm5lckRlcCkpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIGlmIChkZWNsLmNvbXBvbmVudHMgfHwgZGVjbC5kaXJlY3RpdmVzIHx8IGRlY2wucGlwZXMpIHtcbiAgICAvLyBFeGlzdGluZyBkZWNsYXJhdGlvbnMgb24gTlBNIG1heSBub3QgYmUgdXNpbmcgdGhlIG5ldyBgZGVwZW5kZW5jaWVzYCBtZXJnZWQgZmllbGQsIGFuZCBtYXlcbiAgICAvLyBoYXZlIHNlcGFyYXRlIGZpZWxkcyBmb3IgZGVwZW5kZW5jaWVzIGluc3RlYWQuIFVuaWZ5IHRoZW0gZm9yIEpJVCBjb21waWxhdGlvbi5cbiAgICBkZWNsLmNvbXBvbmVudHMgJiZcbiAgICAgIGRlY2xhcmF0aW9ucy5wdXNoKFxuICAgICAgICAuLi5kZWNsLmNvbXBvbmVudHMubWFwKChkaXIpID0+XG4gICAgICAgICAgY29udmVydERpcmVjdGl2ZURlY2xhcmF0aW9uVG9NZXRhZGF0YShkaXIsIC8qIGlzQ29tcG9uZW50ICovIHRydWUpLFxuICAgICAgICApLFxuICAgICAgKTtcbiAgICBkZWNsLmRpcmVjdGl2ZXMgJiZcbiAgICAgIGRlY2xhcmF0aW9ucy5wdXNoKFxuICAgICAgICAuLi5kZWNsLmRpcmVjdGl2ZXMubWFwKChkaXIpID0+IGNvbnZlcnREaXJlY3RpdmVEZWNsYXJhdGlvblRvTWV0YWRhdGEoZGlyKSksXG4gICAgICApO1xuICAgIGRlY2wucGlwZXMgJiYgZGVjbGFyYXRpb25zLnB1c2goLi4uY29udmVydFBpcGVNYXBUb01ldGFkYXRhKGRlY2wucGlwZXMpKTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgLi4uY29udmVydERlY2xhcmVEaXJlY3RpdmVGYWNhZGVUb01ldGFkYXRhKGRlY2wsIHR5cGVTb3VyY2VTcGFuKSxcbiAgICB0ZW1wbGF0ZSxcbiAgICBzdHlsZXM6IGRlY2wuc3R5bGVzID8/IFtdLFxuICAgIGRlY2xhcmF0aW9ucyxcbiAgICB2aWV3UHJvdmlkZXJzOlxuICAgICAgZGVjbC52aWV3UHJvdmlkZXJzICE9PSB1bmRlZmluZWQgPyBuZXcgV3JhcHBlZE5vZGVFeHByKGRlY2wudmlld1Byb3ZpZGVycykgOiBudWxsLFxuICAgIGFuaW1hdGlvbnM6IGRlY2wuYW5pbWF0aW9ucyAhPT0gdW5kZWZpbmVkID8gbmV3IFdyYXBwZWROb2RlRXhwcihkZWNsLmFuaW1hdGlvbnMpIDogbnVsbCxcbiAgICBkZWZlcixcblxuICAgIGNoYW5nZURldGVjdGlvbjogZGVjbC5jaGFuZ2VEZXRlY3Rpb24gPz8gQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuRGVmYXVsdCxcbiAgICBlbmNhcHN1bGF0aW9uOiBkZWNsLmVuY2Fwc3VsYXRpb24gPz8gVmlld0VuY2Fwc3VsYXRpb24uRW11bGF0ZWQsXG4gICAgaW50ZXJwb2xhdGlvbixcbiAgICBkZWNsYXJhdGlvbkxpc3RFbWl0TW9kZTogRGVjbGFyYXRpb25MaXN0RW1pdE1vZGUuQ2xvc3VyZVJlc29sdmVkLFxuICAgIHJlbGF0aXZlQ29udGV4dEZpbGVQYXRoOiAnJyxcbiAgICBpMThuVXNlRXh0ZXJuYWxJZHM6IHRydWUsXG4gIH07XG59XG5cbmZ1bmN0aW9uIGNvbnZlcnREZWNsYXJhdGlvbkZhY2FkZVRvTWV0YWRhdGEoXG4gIGRlY2xhcmF0aW9uOiBSM1RlbXBsYXRlRGVwZW5kZW5jeUZhY2FkZSxcbik6IFIzVGVtcGxhdGVEZXBlbmRlbmN5IHtcbiAgcmV0dXJuIHtcbiAgICAuLi5kZWNsYXJhdGlvbixcbiAgICB0eXBlOiBuZXcgV3JhcHBlZE5vZGVFeHByKGRlY2xhcmF0aW9uLnR5cGUpLFxuICB9O1xufVxuXG5mdW5jdGlvbiBjb252ZXJ0RGlyZWN0aXZlRGVjbGFyYXRpb25Ub01ldGFkYXRhKFxuICBkZWNsYXJhdGlvbjogUjNEZWNsYXJlRGlyZWN0aXZlRGVwZW5kZW5jeUZhY2FkZSxcbiAgaXNDb21wb25lbnQ6IHRydWUgfCBudWxsID0gbnVsbCxcbik6IFIzRGlyZWN0aXZlRGVwZW5kZW5jeU1ldGFkYXRhIHtcbiAgcmV0dXJuIHtcbiAgICBraW5kOiBSM1RlbXBsYXRlRGVwZW5kZW5jeUtpbmQuRGlyZWN0aXZlLFxuICAgIGlzQ29tcG9uZW50OiBpc0NvbXBvbmVudCB8fCBkZWNsYXJhdGlvbi5raW5kID09PSAnY29tcG9uZW50JyxcbiAgICBzZWxlY3RvcjogZGVjbGFyYXRpb24uc2VsZWN0b3IsXG4gICAgdHlwZTogbmV3IFdyYXBwZWROb2RlRXhwcihkZWNsYXJhdGlvbi50eXBlKSxcbiAgICBpbnB1dHM6IGRlY2xhcmF0aW9uLmlucHV0cyA/PyBbXSxcbiAgICBvdXRwdXRzOiBkZWNsYXJhdGlvbi5vdXRwdXRzID8/IFtdLFxuICAgIGV4cG9ydEFzOiBkZWNsYXJhdGlvbi5leHBvcnRBcyA/PyBudWxsLFxuICB9O1xufVxuXG5mdW5jdGlvbiBjb252ZXJ0UGlwZU1hcFRvTWV0YWRhdGEoXG4gIHBpcGVzOiBSM0RlY2xhcmVDb21wb25lbnRGYWNhZGVbJ3BpcGVzJ10sXG4pOiBSM1BpcGVEZXBlbmRlbmN5TWV0YWRhdGFbXSB7XG4gIGlmICghcGlwZXMpIHtcbiAgICByZXR1cm4gW107XG4gIH1cblxuICByZXR1cm4gT2JqZWN0LmtleXMocGlwZXMpLm1hcCgobmFtZSkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICBraW5kOiBSM1RlbXBsYXRlRGVwZW5kZW5jeUtpbmQuUGlwZSxcbiAgICAgIG5hbWUsXG4gICAgICB0eXBlOiBuZXcgV3JhcHBlZE5vZGVFeHByKHBpcGVzW25hbWVdKSxcbiAgICB9O1xuICB9KTtcbn1cblxuZnVuY3Rpb24gY29udmVydFBpcGVEZWNsYXJhdGlvblRvTWV0YWRhdGEoXG4gIHBpcGU6IFIzRGVjbGFyZVBpcGVEZXBlbmRlbmN5RmFjYWRlLFxuKTogUjNQaXBlRGVwZW5kZW5jeU1ldGFkYXRhIHtcbiAgcmV0dXJuIHtcbiAgICBraW5kOiBSM1RlbXBsYXRlRGVwZW5kZW5jeUtpbmQuUGlwZSxcbiAgICBuYW1lOiBwaXBlLm5hbWUsXG4gICAgdHlwZTogbmV3IFdyYXBwZWROb2RlRXhwcihwaXBlLnR5cGUpLFxuICB9O1xufVxuXG5mdW5jdGlvbiBwYXJzZUppdFRlbXBsYXRlKFxuICB0ZW1wbGF0ZTogc3RyaW5nLFxuICB0eXBlTmFtZTogc3RyaW5nLFxuICBzb3VyY2VNYXBVcmw6IHN0cmluZyxcbiAgcHJlc2VydmVXaGl0ZXNwYWNlczogYm9vbGVhbixcbiAgaW50ZXJwb2xhdGlvbjogW3N0cmluZywgc3RyaW5nXSB8IHVuZGVmaW5lZCxcbiAgZGVmZXJCbG9ja0RlcGVuZGVuY2llczogKCgpID0+IFByb21pc2U8dW5rbm93bj4gfCBudWxsKVtdIHwgdW5kZWZpbmVkLFxuKSB7XG4gIGNvbnN0IGludGVycG9sYXRpb25Db25maWcgPSBpbnRlcnBvbGF0aW9uXG4gICAgPyBJbnRlcnBvbGF0aW9uQ29uZmlnLmZyb21BcnJheShpbnRlcnBvbGF0aW9uKVxuICAgIDogREVGQVVMVF9JTlRFUlBPTEFUSU9OX0NPTkZJRztcbiAgLy8gUGFyc2UgdGhlIHRlbXBsYXRlIGFuZCBjaGVjayBmb3IgZXJyb3JzLlxuICBjb25zdCBwYXJzZWQgPSBwYXJzZVRlbXBsYXRlKHRlbXBsYXRlLCBzb3VyY2VNYXBVcmwsIHtwcmVzZXJ2ZVdoaXRlc3BhY2VzLCBpbnRlcnBvbGF0aW9uQ29uZmlnfSk7XG4gIGlmIChwYXJzZWQuZXJyb3JzICE9PSBudWxsKSB7XG4gICAgY29uc3QgZXJyb3JzID0gcGFyc2VkLmVycm9ycy5tYXAoKGVycikgPT4gZXJyLnRvU3RyaW5nKCkpLmpvaW4oJywgJyk7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBFcnJvcnMgZHVyaW5nIEpJVCBjb21waWxhdGlvbiBvZiB0ZW1wbGF0ZSBmb3IgJHt0eXBlTmFtZX06ICR7ZXJyb3JzfWApO1xuICB9XG4gIGNvbnN0IGJpbmRlciA9IG5ldyBSM1RhcmdldEJpbmRlcihuZXcgU2VsZWN0b3JNYXRjaGVyKCkpO1xuICBjb25zdCBib3VuZFRhcmdldCA9IGJpbmRlci5iaW5kKHt0ZW1wbGF0ZTogcGFyc2VkLm5vZGVzfSk7XG5cbiAgcmV0dXJuIHtcbiAgICB0ZW1wbGF0ZTogcGFyc2VkLFxuICAgIGludGVycG9sYXRpb246IGludGVycG9sYXRpb25Db25maWcsXG4gICAgZGVmZXI6IGNyZWF0ZVIzQ29tcG9uZW50RGVmZXJNZXRhZGF0YShib3VuZFRhcmdldCwgZGVmZXJCbG9ja0RlcGVuZGVuY2llcyksXG4gIH07XG59XG5cbi8qKlxuICogQ29udmVydCB0aGUgZXhwcmVzc2lvbiwgaWYgcHJlc2VudCB0byBhbiBgUjNQcm92aWRlckV4cHJlc3Npb25gLlxuICpcbiAqIEluIEpJVCBtb2RlIHdlIGRvIG5vdCB3YW50IHRoZSBjb21waWxlciB0byB3cmFwIHRoZSBleHByZXNzaW9uIGluIGEgYGZvcndhcmRSZWYoKWAgY2FsbCBiZWNhdXNlLFxuICogaWYgaXQgaXMgcmVmZXJlbmNpbmcgYSB0eXBlIHRoYXQgaGFzIG5vdCB5ZXQgYmVlbiBkZWZpbmVkLCBpdCB3aWxsIGhhdmUgYWxyZWFkeSBiZWVuIHdyYXBwZWQgaW5cbiAqIGEgYGZvcndhcmRSZWYoKWAgLSBlaXRoZXIgYnkgdGhlIGFwcGxpY2F0aW9uIGRldmVsb3BlciBvciBkdXJpbmcgcGFydGlhbC1jb21waWxhdGlvbi4gVGh1cyB3ZSBjYW5cbiAqIHVzZSBgRm9yd2FyZFJlZkhhbmRsaW5nLk5vbmVgLlxuICovXG5mdW5jdGlvbiBjb252ZXJ0VG9Qcm92aWRlckV4cHJlc3Npb24oXG4gIG9iajogYW55LFxuICBwcm9wZXJ0eTogc3RyaW5nLFxuKTogTWF5YmVGb3J3YXJkUmVmRXhwcmVzc2lvbiB8IHVuZGVmaW5lZCB7XG4gIGlmIChvYmouaGFzT3duUHJvcGVydHkocHJvcGVydHkpKSB7XG4gICAgcmV0dXJuIGNyZWF0ZU1heUJlRm9yd2FyZFJlZkV4cHJlc3Npb24oXG4gICAgICBuZXcgV3JhcHBlZE5vZGVFeHByKG9ialtwcm9wZXJ0eV0pLFxuICAgICAgRm9yd2FyZFJlZkhhbmRsaW5nLk5vbmUsXG4gICAgKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG59XG5cbmZ1bmN0aW9uIHdyYXBFeHByZXNzaW9uKG9iajogYW55LCBwcm9wZXJ0eTogc3RyaW5nKTogV3JhcHBlZE5vZGVFeHByPGFueT4gfCB1bmRlZmluZWQge1xuICBpZiAob2JqLmhhc093blByb3BlcnR5KHByb3BlcnR5KSkge1xuICAgIHJldHVybiBuZXcgV3JhcHBlZE5vZGVFeHByKG9ialtwcm9wZXJ0eV0pO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cbn1cblxuZnVuY3Rpb24gY29tcHV0ZVByb3ZpZGVkSW4oXG4gIHByb3ZpZGVkSW46IEZ1bmN0aW9uIHwgc3RyaW5nIHwgbnVsbCB8IHVuZGVmaW5lZCxcbik6IE1heWJlRm9yd2FyZFJlZkV4cHJlc3Npb24ge1xuICBjb25zdCBleHByZXNzaW9uID1cbiAgICB0eXBlb2YgcHJvdmlkZWRJbiA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgPyBuZXcgV3JhcHBlZE5vZGVFeHByKHByb3ZpZGVkSW4pXG4gICAgICA6IG5ldyBMaXRlcmFsRXhwcihwcm92aWRlZEluID8/IG51bGwpO1xuICAvLyBTZWUgYGNvbnZlcnRUb1Byb3ZpZGVyRXhwcmVzc2lvbigpYCBmb3Igd2h5IHRoaXMgdXNlcyBgRm9yd2FyZFJlZkhhbmRsaW5nLk5vbmVgLlxuICByZXR1cm4gY3JlYXRlTWF5QmVGb3J3YXJkUmVmRXhwcmVzc2lvbihleHByZXNzaW9uLCBGb3J3YXJkUmVmSGFuZGxpbmcuTm9uZSk7XG59XG5cbmZ1bmN0aW9uIGNvbnZlcnRSM0RlcGVuZGVuY3lNZXRhZGF0YUFycmF5KFxuICBmYWNhZGVzOiBSM0RlcGVuZGVuY3lNZXRhZGF0YUZhY2FkZVtdIHwgbnVsbCB8IHVuZGVmaW5lZCxcbik6IFIzRGVwZW5kZW5jeU1ldGFkYXRhW10gfCBudWxsIHtcbiAgcmV0dXJuIGZhY2FkZXMgPT0gbnVsbCA/IG51bGwgOiBmYWNhZGVzLm1hcChjb252ZXJ0UjNEZXBlbmRlbmN5TWV0YWRhdGEpO1xufVxuXG5mdW5jdGlvbiBjb252ZXJ0UjNEZXBlbmRlbmN5TWV0YWRhdGEoZmFjYWRlOiBSM0RlcGVuZGVuY3lNZXRhZGF0YUZhY2FkZSk6IFIzRGVwZW5kZW5jeU1ldGFkYXRhIHtcbiAgY29uc3QgaXNBdHRyaWJ1dGVEZXAgPSBmYWNhZGUuYXR0cmlidXRlICE9IG51bGw7IC8vIGJvdGggYG51bGxgIGFuZCBgdW5kZWZpbmVkYFxuICBjb25zdCByYXdUb2tlbiA9IGZhY2FkZS50b2tlbiA9PT0gbnVsbCA/IG51bGwgOiBuZXcgV3JhcHBlZE5vZGVFeHByKGZhY2FkZS50b2tlbik7XG4gIC8vIEluIEpJVCBtb2RlLCBpZiB0aGUgZGVwIGlzIGFuIGBAQXR0cmlidXRlKClgIHRoZW4gd2UgdXNlIHRoZSBhdHRyaWJ1dGUgbmFtZSBnaXZlbiBpblxuICAvLyBgYXR0cmlidXRlYCByYXRoZXIgdGhhbiB0aGUgYHRva2VuYC5cbiAgY29uc3QgdG9rZW4gPSBpc0F0dHJpYnV0ZURlcCA/IG5ldyBXcmFwcGVkTm9kZUV4cHIoZmFjYWRlLmF0dHJpYnV0ZSkgOiByYXdUb2tlbjtcbiAgcmV0dXJuIGNyZWF0ZVIzRGVwZW5kZW5jeU1ldGFkYXRhKFxuICAgIHRva2VuLFxuICAgIGlzQXR0cmlidXRlRGVwLFxuICAgIGZhY2FkZS5ob3N0LFxuICAgIGZhY2FkZS5vcHRpb25hbCxcbiAgICBmYWNhZGUuc2VsZixcbiAgICBmYWNhZGUuc2tpcFNlbGYsXG4gICk7XG59XG5cbmZ1bmN0aW9uIGNvbnZlcnRSM0RlY2xhcmVEZXBlbmRlbmN5TWV0YWRhdGEoXG4gIGZhY2FkZTogUjNEZWNsYXJlRGVwZW5kZW5jeU1ldGFkYXRhRmFjYWRlLFxuKTogUjNEZXBlbmRlbmN5TWV0YWRhdGEge1xuICBjb25zdCBpc0F0dHJpYnV0ZURlcCA9IGZhY2FkZS5hdHRyaWJ1dGUgPz8gZmFsc2U7XG4gIGNvbnN0IHRva2VuID0gZmFjYWRlLnRva2VuID09PSBudWxsID8gbnVsbCA6IG5ldyBXcmFwcGVkTm9kZUV4cHIoZmFjYWRlLnRva2VuKTtcbiAgcmV0dXJuIGNyZWF0ZVIzRGVwZW5kZW5jeU1ldGFkYXRhKFxuICAgIHRva2VuLFxuICAgIGlzQXR0cmlidXRlRGVwLFxuICAgIGZhY2FkZS5ob3N0ID8/IGZhbHNlLFxuICAgIGZhY2FkZS5vcHRpb25hbCA/PyBmYWxzZSxcbiAgICBmYWNhZGUuc2VsZiA/PyBmYWxzZSxcbiAgICBmYWNhZGUuc2tpcFNlbGYgPz8gZmFsc2UsXG4gICk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVIzRGVwZW5kZW5jeU1ldGFkYXRhKFxuICB0b2tlbjogV3JhcHBlZE5vZGVFeHByPHVua25vd24+IHwgbnVsbCxcbiAgaXNBdHRyaWJ1dGVEZXA6IGJvb2xlYW4sXG4gIGhvc3Q6IGJvb2xlYW4sXG4gIG9wdGlvbmFsOiBib29sZWFuLFxuICBzZWxmOiBib29sZWFuLFxuICBza2lwU2VsZjogYm9vbGVhbixcbik6IFIzRGVwZW5kZW5jeU1ldGFkYXRhIHtcbiAgLy8gSWYgdGhlIGRlcCBpcyBhbiBgQEF0dHJpYnV0ZSgpYCB0aGUgYGF0dHJpYnV0ZU5hbWVUeXBlYCBvdWdodCB0byBiZSB0aGUgYHVua25vd25gIHR5cGUuXG4gIC8vIEJ1dCB0eXBlcyBhcmUgbm90IGF2YWlsYWJsZSBhdCBydW50aW1lIHNvIHdlIGp1c3QgdXNlIGEgbGl0ZXJhbCBgXCI8dW5rbm93bj5cImAgc3RyaW5nIGFzIGEgZHVtbXlcbiAgLy8gbWFya2VyLlxuICBjb25zdCBhdHRyaWJ1dGVOYW1lVHlwZSA9IGlzQXR0cmlidXRlRGVwID8gbGl0ZXJhbCgndW5rbm93bicpIDogbnVsbDtcbiAgcmV0dXJuIHt0b2tlbiwgYXR0cmlidXRlTmFtZVR5cGUsIGhvc3QsIG9wdGlvbmFsLCBzZWxmLCBza2lwU2VsZn07XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVIzQ29tcG9uZW50RGVmZXJNZXRhZGF0YShcbiAgYm91bmRUYXJnZXQ6IEJvdW5kVGFyZ2V0PGFueT4sXG4gIGRlZmVyQmxvY2tEZXBlbmRlbmNpZXM6ICgoKSA9PiBQcm9taXNlPHVua25vd24+IHwgbnVsbClbXSB8IHVuZGVmaW5lZCxcbik6IFIzQ29tcG9uZW50RGVmZXJNZXRhZGF0YSB7XG4gIGNvbnN0IGRlZmVycmVkQmxvY2tzID0gYm91bmRUYXJnZXQuZ2V0RGVmZXJCbG9ja3MoKTtcbiAgY29uc3QgYmxvY2tzID0gbmV3IE1hcDxEZWZlcnJlZEJsb2NrLCBFeHByZXNzaW9uIHwgbnVsbD4oKTtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IGRlZmVycmVkQmxvY2tzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgZGVwZW5kZW5jeUZuID0gZGVmZXJCbG9ja0RlcGVuZGVuY2llcz8uW2ldO1xuICAgIGJsb2Nrcy5zZXQoZGVmZXJyZWRCbG9ja3NbaV0sIGRlcGVuZGVuY3lGbiA/IG5ldyBXcmFwcGVkTm9kZUV4cHIoZGVwZW5kZW5jeUZuKSA6IG51bGwpO1xuICB9XG5cbiAgcmV0dXJuIHttb2RlOiBEZWZlckJsb2NrRGVwc0VtaXRNb2RlLlBlckJsb2NrLCBibG9ja3N9O1xufVxuXG5mdW5jdGlvbiBleHRyYWN0SG9zdEJpbmRpbmdzKFxuICBwcm9wTWV0YWRhdGE6IHtba2V5OiBzdHJpbmddOiBhbnlbXX0sXG4gIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgaG9zdD86IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9LFxuKTogUGFyc2VkSG9zdEJpbmRpbmdzIHtcbiAgLy8gRmlyc3QgcGFyc2UgdGhlIGRlY2xhcmF0aW9ucyBmcm9tIHRoZSBtZXRhZGF0YS5cbiAgY29uc3QgYmluZGluZ3MgPSBwYXJzZUhvc3RCaW5kaW5ncyhob3N0IHx8IHt9KTtcblxuICAvLyBBZnRlciB0aGF0IGNoZWNrIGhvc3QgYmluZGluZ3MgZm9yIGVycm9yc1xuICBjb25zdCBlcnJvcnMgPSB2ZXJpZnlIb3N0QmluZGluZ3MoYmluZGluZ3MsIHNvdXJjZVNwYW4pO1xuICBpZiAoZXJyb3JzLmxlbmd0aCkge1xuICAgIHRocm93IG5ldyBFcnJvcihlcnJvcnMubWFwKChlcnJvcjogUGFyc2VFcnJvcikgPT4gZXJyb3IubXNnKS5qb2luKCdcXG4nKSk7XG4gIH1cblxuICAvLyBOZXh0LCBsb29wIG92ZXIgdGhlIHByb3BlcnRpZXMgb2YgdGhlIG9iamVjdCwgbG9va2luZyBmb3IgQEhvc3RCaW5kaW5nIGFuZCBASG9zdExpc3RlbmVyLlxuICBmb3IgKGNvbnN0IGZpZWxkIGluIHByb3BNZXRhZGF0YSkge1xuICAgIGlmIChwcm9wTWV0YWRhdGEuaGFzT3duUHJvcGVydHkoZmllbGQpKSB7XG4gICAgICBwcm9wTWV0YWRhdGFbZmllbGRdLmZvckVhY2goKGFubikgPT4ge1xuICAgICAgICBpZiAoaXNIb3N0QmluZGluZyhhbm4pKSB7XG4gICAgICAgICAgLy8gU2luY2UgdGhpcyBpcyBhIGRlY29yYXRvciwgd2Uga25vdyB0aGF0IHRoZSB2YWx1ZSBpcyBhIGNsYXNzIG1lbWJlci4gQWx3YXlzIGFjY2VzcyBpdFxuICAgICAgICAgIC8vIHRocm91Z2ggYHRoaXNgIHNvIHRoYXQgZnVydGhlciBkb3duIHRoZSBsaW5lIGl0IGNhbid0IGJlIGNvbmZ1c2VkIGZvciBhIGxpdGVyYWwgdmFsdWVcbiAgICAgICAgICAvLyAoZS5nLiBpZiB0aGVyZSdzIGEgcHJvcGVydHkgY2FsbGVkIGB0cnVlYCkuXG4gICAgICAgICAgYmluZGluZ3MucHJvcGVydGllc1thbm4uaG9zdFByb3BlcnR5TmFtZSB8fCBmaWVsZF0gPSBnZXRTYWZlUHJvcGVydHlBY2Nlc3NTdHJpbmcoXG4gICAgICAgICAgICAndGhpcycsXG4gICAgICAgICAgICBmaWVsZCxcbiAgICAgICAgICApO1xuICAgICAgICB9IGVsc2UgaWYgKGlzSG9zdExpc3RlbmVyKGFubikpIHtcbiAgICAgICAgICBiaW5kaW5ncy5saXN0ZW5lcnNbYW5uLmV2ZW50TmFtZSB8fCBmaWVsZF0gPSBgJHtmaWVsZH0oJHsoYW5uLmFyZ3MgfHwgW10pLmpvaW4oJywnKX0pYDtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGJpbmRpbmdzO1xufVxuXG5mdW5jdGlvbiBpc0hvc3RCaW5kaW5nKHZhbHVlOiBhbnkpOiB2YWx1ZSBpcyBIb3N0QmluZGluZyB7XG4gIHJldHVybiB2YWx1ZS5uZ01ldGFkYXRhTmFtZSA9PT0gJ0hvc3RCaW5kaW5nJztcbn1cblxuZnVuY3Rpb24gaXNIb3N0TGlzdGVuZXIodmFsdWU6IGFueSk6IHZhbHVlIGlzIEhvc3RMaXN0ZW5lciB7XG4gIHJldHVybiB2YWx1ZS5uZ01ldGFkYXRhTmFtZSA9PT0gJ0hvc3RMaXN0ZW5lcic7XG59XG5cbmZ1bmN0aW9uIGlzSW5wdXQodmFsdWU6IGFueSk6IHZhbHVlIGlzIElucHV0IHtcbiAgcmV0dXJuIHZhbHVlLm5nTWV0YWRhdGFOYW1lID09PSAnSW5wdXQnO1xufVxuXG5mdW5jdGlvbiBpc091dHB1dCh2YWx1ZTogYW55KTogdmFsdWUgaXMgT3V0cHV0IHtcbiAgcmV0dXJuIHZhbHVlLm5nTWV0YWRhdGFOYW1lID09PSAnT3V0cHV0Jztcbn1cblxuZnVuY3Rpb24gaW5wdXRzUGFydGlhbE1ldGFkYXRhVG9JbnB1dE1ldGFkYXRhKFxuICBpbnB1dHM6IE5vbk51bGxhYmxlPFIzRGVjbGFyZURpcmVjdGl2ZUZhY2FkZVsnaW5wdXRzJ10+LFxuKSB7XG4gIHJldHVybiBPYmplY3Qua2V5cyhpbnB1dHMpLnJlZHVjZTxSZWNvcmQ8c3RyaW5nLCBSM0lucHV0TWV0YWRhdGE+PihcbiAgICAocmVzdWx0LCBtaW5pZmllZENsYXNzTmFtZSkgPT4ge1xuICAgICAgY29uc3QgdmFsdWUgPSBpbnB1dHNbbWluaWZpZWRDbGFzc05hbWVdO1xuXG4gICAgICAvLyBIYW5kbGUgbGVnYWN5IHBhcnRpYWwgaW5wdXQgb3V0cHV0LlxuICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgfHwgQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgcmVzdWx0W21pbmlmaWVkQ2xhc3NOYW1lXSA9IHBhcnNlTGVnYWN5SW5wdXRQYXJ0aWFsT3V0cHV0KHZhbHVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc3VsdFttaW5pZmllZENsYXNzTmFtZV0gPSB7XG4gICAgICAgICAgYmluZGluZ1Byb3BlcnR5TmFtZTogdmFsdWUucHVibGljTmFtZSxcbiAgICAgICAgICBjbGFzc1Byb3BlcnR5TmFtZTogbWluaWZpZWRDbGFzc05hbWUsXG4gICAgICAgICAgdHJhbnNmb3JtRnVuY3Rpb246XG4gICAgICAgICAgICB2YWx1ZS50cmFuc2Zvcm1GdW5jdGlvbiAhPT0gbnVsbCA/IG5ldyBXcmFwcGVkTm9kZUV4cHIodmFsdWUudHJhbnNmb3JtRnVuY3Rpb24pIDogbnVsbCxcbiAgICAgICAgICByZXF1aXJlZDogdmFsdWUuaXNSZXF1aXJlZCxcbiAgICAgICAgICBpc1NpZ25hbDogdmFsdWUuaXNTaWduYWwsXG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcbiAgICB7fSxcbiAgKTtcbn1cblxuLyoqXG4gKiBQYXJzZXMgdGhlIGxlZ2FjeSBpbnB1dCBwYXJ0aWFsIG91dHB1dC4gRm9yIG1vcmUgZGV0YWlscyBzZWUgYHBhcnRpYWwvZGlyZWN0aXZlLnRzYC5cbiAqIFRPRE8obGVnYWN5LXBhcnRpYWwtb3V0cHV0LWlucHV0cyk6IFJlbW92ZSBpbiB2MTguXG4gKi9cbmZ1bmN0aW9uIHBhcnNlTGVnYWN5SW5wdXRQYXJ0aWFsT3V0cHV0KHZhbHVlOiBMZWdhY3lJbnB1dFBhcnRpYWxNYXBwaW5nKTogUjNJbnB1dE1ldGFkYXRhIHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4ge1xuICAgICAgYmluZGluZ1Byb3BlcnR5TmFtZTogdmFsdWUsXG4gICAgICBjbGFzc1Byb3BlcnR5TmFtZTogdmFsdWUsXG4gICAgICB0cmFuc2Zvcm1GdW5jdGlvbjogbnVsbCxcbiAgICAgIHJlcXVpcmVkOiBmYWxzZSxcbiAgICAgIC8vIGxlZ2FjeSBwYXJ0aWFsIG91dHB1dCBkb2VzIG5vdCBjYXB0dXJlIHNpZ25hbCBpbnB1dHMuXG4gICAgICBpc1NpZ25hbDogZmFsc2UsXG4gICAgfTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgYmluZGluZ1Byb3BlcnR5TmFtZTogdmFsdWVbMF0sXG4gICAgY2xhc3NQcm9wZXJ0eU5hbWU6IHZhbHVlWzFdLFxuICAgIHRyYW5zZm9ybUZ1bmN0aW9uOiB2YWx1ZVsyXSA/IG5ldyBXcmFwcGVkTm9kZUV4cHIodmFsdWVbMl0pIDogbnVsbCxcbiAgICByZXF1aXJlZDogZmFsc2UsXG4gICAgLy8gbGVnYWN5IHBhcnRpYWwgb3V0cHV0IGRvZXMgbm90IGNhcHR1cmUgc2lnbmFsIGlucHV0cy5cbiAgICBpc1NpZ25hbDogZmFsc2UsXG4gIH07XG59XG5cbmZ1bmN0aW9uIHBhcnNlSW5wdXRzQXJyYXkoXG4gIHZhbHVlczogKHN0cmluZyB8IHtuYW1lOiBzdHJpbmc7IGFsaWFzPzogc3RyaW5nOyByZXF1aXJlZD86IGJvb2xlYW47IHRyYW5zZm9ybT86IEZ1bmN0aW9ufSlbXSxcbikge1xuICByZXR1cm4gdmFsdWVzLnJlZHVjZTxSZWNvcmQ8c3RyaW5nLCBSM0lucHV0TWV0YWRhdGE+PigocmVzdWx0cywgdmFsdWUpID0+IHtcbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgICAgY29uc3QgW2JpbmRpbmdQcm9wZXJ0eU5hbWUsIGNsYXNzUHJvcGVydHlOYW1lXSA9IHBhcnNlTWFwcGluZ1N0cmluZyh2YWx1ZSk7XG4gICAgICByZXN1bHRzW2NsYXNzUHJvcGVydHlOYW1lXSA9IHtcbiAgICAgICAgYmluZGluZ1Byb3BlcnR5TmFtZSxcbiAgICAgICAgY2xhc3NQcm9wZXJ0eU5hbWUsXG4gICAgICAgIHJlcXVpcmVkOiBmYWxzZSxcbiAgICAgICAgLy8gU2lnbmFsIGlucHV0cyBub3Qgc3VwcG9ydGVkIGZvciB0aGUgaW5wdXRzIGFycmF5LlxuICAgICAgICBpc1NpZ25hbDogZmFsc2UsXG4gICAgICAgIHRyYW5zZm9ybUZ1bmN0aW9uOiBudWxsLFxuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0c1t2YWx1ZS5uYW1lXSA9IHtcbiAgICAgICAgYmluZGluZ1Byb3BlcnR5TmFtZTogdmFsdWUuYWxpYXMgfHwgdmFsdWUubmFtZSxcbiAgICAgICAgY2xhc3NQcm9wZXJ0eU5hbWU6IHZhbHVlLm5hbWUsXG4gICAgICAgIHJlcXVpcmVkOiB2YWx1ZS5yZXF1aXJlZCB8fCBmYWxzZSxcbiAgICAgICAgLy8gU2lnbmFsIGlucHV0cyBub3Qgc3VwcG9ydGVkIGZvciB0aGUgaW5wdXRzIGFycmF5LlxuICAgICAgICBpc1NpZ25hbDogZmFsc2UsXG4gICAgICAgIHRyYW5zZm9ybUZ1bmN0aW9uOiB2YWx1ZS50cmFuc2Zvcm0gIT0gbnVsbCA/IG5ldyBXcmFwcGVkTm9kZUV4cHIodmFsdWUudHJhbnNmb3JtKSA6IG51bGwsXG4gICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfSwge30pO1xufVxuXG5mdW5jdGlvbiBwYXJzZU1hcHBpbmdTdHJpbmdBcnJheSh2YWx1ZXM6IHN0cmluZ1tdKTogUmVjb3JkPHN0cmluZywgc3RyaW5nPiB7XG4gIHJldHVybiB2YWx1ZXMucmVkdWNlPFJlY29yZDxzdHJpbmcsIHN0cmluZz4+KChyZXN1bHRzLCB2YWx1ZSkgPT4ge1xuICAgIGNvbnN0IFthbGlhcywgZmllbGROYW1lXSA9IHBhcnNlTWFwcGluZ1N0cmluZyh2YWx1ZSk7XG4gICAgcmVzdWx0c1tmaWVsZE5hbWVdID0gYWxpYXM7XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH0sIHt9KTtcbn1cblxuZnVuY3Rpb24gcGFyc2VNYXBwaW5nU3RyaW5nKHZhbHVlOiBzdHJpbmcpOiBbYWxpYXM6IHN0cmluZywgZmllbGROYW1lOiBzdHJpbmddIHtcbiAgLy8gRWl0aGVyIHRoZSB2YWx1ZSBpcyAnZmllbGQnIG9yICdmaWVsZDogcHJvcGVydHknLiBJbiB0aGUgZmlyc3QgY2FzZSwgYHByb3BlcnR5YCB3aWxsXG4gIC8vIGJlIHVuZGVmaW5lZCwgaW4gd2hpY2ggY2FzZSB0aGUgZmllbGQgbmFtZSBzaG91bGQgYWxzbyBiZSB1c2VkIGFzIHRoZSBwcm9wZXJ0eSBuYW1lLlxuICBjb25zdCBbZmllbGROYW1lLCBiaW5kaW5nUHJvcGVydHlOYW1lXSA9IHZhbHVlLnNwbGl0KCc6JywgMikubWFwKChzdHIpID0+IHN0ci50cmltKCkpO1xuICByZXR1cm4gW2JpbmRpbmdQcm9wZXJ0eU5hbWUgPz8gZmllbGROYW1lLCBmaWVsZE5hbWVdO1xufVxuXG5mdW5jdGlvbiBjb252ZXJ0RGVjbGFyZVBpcGVGYWNhZGVUb01ldGFkYXRhKGRlY2xhcmF0aW9uOiBSM0RlY2xhcmVQaXBlRmFjYWRlKTogUjNQaXBlTWV0YWRhdGEge1xuICByZXR1cm4ge1xuICAgIG5hbWU6IGRlY2xhcmF0aW9uLnR5cGUubmFtZSxcbiAgICB0eXBlOiB3cmFwUmVmZXJlbmNlKGRlY2xhcmF0aW9uLnR5cGUpLFxuICAgIHR5cGVBcmd1bWVudENvdW50OiAwLFxuICAgIHBpcGVOYW1lOiBkZWNsYXJhdGlvbi5uYW1lLFxuICAgIGRlcHM6IG51bGwsXG4gICAgcHVyZTogZGVjbGFyYXRpb24ucHVyZSA/PyB0cnVlLFxuICAgIGlzU3RhbmRhbG9uZTogZGVjbGFyYXRpb24uaXNTdGFuZGFsb25lID8/IGZhbHNlLFxuICB9O1xufVxuXG5mdW5jdGlvbiBjb252ZXJ0RGVjbGFyZUluamVjdG9yRmFjYWRlVG9NZXRhZGF0YShcbiAgZGVjbGFyYXRpb246IFIzRGVjbGFyZUluamVjdG9yRmFjYWRlLFxuKTogUjNJbmplY3Rvck1ldGFkYXRhIHtcbiAgcmV0dXJuIHtcbiAgICBuYW1lOiBkZWNsYXJhdGlvbi50eXBlLm5hbWUsXG4gICAgdHlwZTogd3JhcFJlZmVyZW5jZShkZWNsYXJhdGlvbi50eXBlKSxcbiAgICBwcm92aWRlcnM6XG4gICAgICBkZWNsYXJhdGlvbi5wcm92aWRlcnMgIT09IHVuZGVmaW5lZCAmJiBkZWNsYXJhdGlvbi5wcm92aWRlcnMubGVuZ3RoID4gMFxuICAgICAgICA/IG5ldyBXcmFwcGVkTm9kZUV4cHIoZGVjbGFyYXRpb24ucHJvdmlkZXJzKVxuICAgICAgICA6IG51bGwsXG4gICAgaW1wb3J0czpcbiAgICAgIGRlY2xhcmF0aW9uLmltcG9ydHMgIT09IHVuZGVmaW5lZFxuICAgICAgICA/IGRlY2xhcmF0aW9uLmltcG9ydHMubWFwKChpKSA9PiBuZXcgV3JhcHBlZE5vZGVFeHByKGkpKVxuICAgICAgICA6IFtdLFxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcHVibGlzaEZhY2FkZShnbG9iYWw6IGFueSkge1xuICBjb25zdCBuZzogRXhwb3J0ZWRDb21waWxlckZhY2FkZSA9IGdsb2JhbC5uZyB8fCAoZ2xvYmFsLm5nID0ge30pO1xuICBuZy7JtWNvbXBpbGVyRmFjYWRlID0gbmV3IENvbXBpbGVyRmFjYWRlSW1wbCgpO1xufVxuIl19