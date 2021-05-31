/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ConstantPool } from './constant_pool';
import { ChangeDetectionStrategy, ViewEncapsulation } from './core';
import { compileInjectable, createR3ProviderExpression } from './injectable_compiler_2';
import { DEFAULT_INTERPOLATION_CONFIG, InterpolationConfig } from './ml_parser/interpolation_config';
import { DeclareVarStmt, literal, LiteralExpr, StmtModifier, WrappedNodeExpr } from './output/output_ast';
import { JitEvaluator } from './output/output_jit';
import { r3JitTypeSourceSpan } from './parse_util';
import { compileFactoryFunction, FactoryTarget } from './render3/r3_factory';
import { compileInjector } from './render3/r3_injector_compiler';
import { R3JitReflector } from './render3/r3_jit';
import { compileNgModule, compileNgModuleDeclarationExpression } from './render3/r3_module_compiler';
import { compilePipeFromMetadata } from './render3/r3_pipe_compiler';
import { getSafePropertyAccessString, wrapReference } from './render3/util';
import { compileComponentFromMetadata, compileDirectiveFromMetadata, parseHostBindings, verifyHostBindings } from './render3/view/compiler';
import { makeBindingParser, parseTemplate } from './render3/view/template';
import { ResourceLoader } from './resource_loader';
import { DomElementSchemaRegistry } from './schema/dom_element_schema_registry';
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
            internalType: new WrappedNodeExpr(facade.type),
            typeArgumentCount: 0,
            deps: null,
            pipeName: facade.pipeName,
            pure: facade.pure,
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
        var _a;
        const { expression, statements } = compileInjectable({
            name: facade.name,
            type: wrapReference(facade.type),
            internalType: new WrappedNodeExpr(facade.type),
            typeArgumentCount: facade.typeArgumentCount,
            providedIn: computeProvidedIn(facade.providedIn),
            useClass: convertToProviderExpression(facade, USE_CLASS),
            useFactory: wrapExpression(facade, USE_FACTORY),
            useValue: convertToProviderExpression(facade, USE_VALUE),
            useExisting: convertToProviderExpression(facade, USE_EXISTING),
            deps: (_a = facade.deps) === null || _a === void 0 ? void 0 : _a.map(convertR3DependencyMetadata),
        }, 
        /* resolveForwardRefs */ true);
        return this.jitExpression(expression, angularCoreEnv, sourceMapUrl, statements);
    }
    compileInjectableDeclaration(angularCoreEnv, sourceMapUrl, facade) {
        var _a;
        const { expression, statements } = compileInjectable({
            name: facade.type.name,
            type: wrapReference(facade.type),
            internalType: new WrappedNodeExpr(facade.type),
            typeArgumentCount: 0,
            providedIn: computeProvidedIn(facade.providedIn),
            useClass: convertToProviderExpression(facade, USE_CLASS),
            useFactory: wrapExpression(facade, USE_FACTORY),
            useValue: convertToProviderExpression(facade, USE_VALUE),
            useExisting: convertToProviderExpression(facade, USE_EXISTING),
            deps: (_a = facade.deps) === null || _a === void 0 ? void 0 : _a.map(convertR3DeclareDependencyMetadata),
        }, 
        /* resolveForwardRefs */ true);
        return this.jitExpression(expression, angularCoreEnv, sourceMapUrl, statements);
    }
    compileInjector(angularCoreEnv, sourceMapUrl, facade) {
        const meta = {
            name: facade.name,
            type: wrapReference(facade.type),
            internalType: new WrappedNodeExpr(facade.type),
            providers: new WrappedNodeExpr(facade.providers),
            imports: facade.imports.map(i => new WrappedNodeExpr(i)),
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
            type: wrapReference(facade.type),
            internalType: new WrappedNodeExpr(facade.type),
            adjacentType: new WrappedNodeExpr(facade.type),
            bootstrap: facade.bootstrap.map(wrapReference),
            declarations: facade.declarations.map(wrapReference),
            imports: facade.imports.map(wrapReference),
            exports: facade.exports.map(wrapReference),
            emitInline: true,
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
        const { template, interpolation } = parseJitTemplate(facade.template, facade.name, sourceMapUrl, facade.preserveWhitespaces, facade.interpolation);
        // Compile the component metadata, including template, into an expression.
        const meta = Object.assign(Object.assign(Object.assign({}, facade), convertDirectiveFacadeToMetadata(facade)), { selector: facade.selector || this.elementSchemaRegistry.getDefaultComponentElementName(), template, declarationListEmitMode: 0 /* Direct */, styles: [...facade.styles, ...template.styles], encapsulation: facade.encapsulation, interpolation, changeDetection: facade.changeDetection, animations: facade.animations != null ? new WrappedNodeExpr(facade.animations) : null, viewProviders: facade.viewProviders != null ? new WrappedNodeExpr(facade.viewProviders) :
                null, relativeContextFilePath: '', i18nUseExternalIds: true });
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
            internalType: new WrappedNodeExpr(meta.type),
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
            internalType: new WrappedNodeExpr(meta.type),
            typeArgumentCount: 0,
            deps: meta.deps && meta.deps.map(convertR3DeclareDependencyMetadata),
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
            new DeclareVarStmt('$def', def, undefined, [StmtModifier.Exported]),
        ];
        const res = this.jitEvaluator.evaluateStatements(sourceUrl, statements, new R3JitReflector(context), /* enableSourceMaps */ true);
        return res['$def'];
    }
}
const USE_CLASS = Object.keys({ useClass: null })[0];
const USE_FACTORY = Object.keys({ useFactory: null })[0];
const USE_VALUE = Object.keys({ useValue: null })[0];
const USE_EXISTING = Object.keys({ useExisting: null })[0];
function convertToR3QueryMetadata(facade) {
    return Object.assign(Object.assign({}, facade), { predicate: Array.isArray(facade.predicate) ? facade.predicate :
            new WrappedNodeExpr(facade.predicate), read: facade.read ? new WrappedNodeExpr(facade.read) : null, static: facade.static, emitDistinctChangesOnly: facade.emitDistinctChangesOnly });
}
function convertQueryDeclarationToMetadata(declaration) {
    var _a, _b, _c, _d;
    return {
        propertyName: declaration.propertyName,
        first: (_a = declaration.first) !== null && _a !== void 0 ? _a : false,
        predicate: Array.isArray(declaration.predicate) ? declaration.predicate :
            new WrappedNodeExpr(declaration.predicate),
        descendants: (_b = declaration.descendants) !== null && _b !== void 0 ? _b : false,
        read: declaration.read ? new WrappedNodeExpr(declaration.read) : null,
        static: (_c = declaration.static) !== null && _c !== void 0 ? _c : false,
        emitDistinctChangesOnly: (_d = declaration.emitDistinctChangesOnly) !== null && _d !== void 0 ? _d : true,
    };
}
function convertDirectiveFacadeToMetadata(facade) {
    const inputsFromMetadata = parseInputOutputs(facade.inputs || []);
    const outputsFromMetadata = parseInputOutputs(facade.outputs || []);
    const propMetadata = facade.propMetadata;
    const inputsFromType = {};
    const outputsFromType = {};
    for (const field in propMetadata) {
        if (propMetadata.hasOwnProperty(field)) {
            propMetadata[field].forEach(ann => {
                if (isInput(ann)) {
                    inputsFromType[field] =
                        ann.bindingPropertyName ? [ann.bindingPropertyName, field] : field;
                }
                else if (isOutput(ann)) {
                    outputsFromType[field] = ann.bindingPropertyName || field;
                }
            });
        }
    }
    return Object.assign(Object.assign({}, facade), { typeArgumentCount: 0, typeSourceSpan: facade.typeSourceSpan, type: wrapReference(facade.type), internalType: new WrappedNodeExpr(facade.type), deps: null, host: extractHostBindings(facade.propMetadata, facade.typeSourceSpan, facade.host), inputs: Object.assign(Object.assign({}, inputsFromMetadata), inputsFromType), outputs: Object.assign(Object.assign({}, outputsFromMetadata), outputsFromType), queries: facade.queries.map(convertToR3QueryMetadata), providers: facade.providers != null ? new WrappedNodeExpr(facade.providers) : null, viewQueries: facade.viewQueries.map(convertToR3QueryMetadata), fullInheritance: false });
}
function convertDeclareDirectiveFacadeToMetadata(declaration, typeSourceSpan) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    return {
        name: declaration.type.name,
        type: wrapReference(declaration.type),
        typeSourceSpan,
        internalType: new WrappedNodeExpr(declaration.type),
        selector: (_a = declaration.selector) !== null && _a !== void 0 ? _a : null,
        inputs: (_b = declaration.inputs) !== null && _b !== void 0 ? _b : {},
        outputs: (_c = declaration.outputs) !== null && _c !== void 0 ? _c : {},
        host: convertHostDeclarationToMetadata(declaration.host),
        queries: ((_d = declaration.queries) !== null && _d !== void 0 ? _d : []).map(convertQueryDeclarationToMetadata),
        viewQueries: ((_e = declaration.viewQueries) !== null && _e !== void 0 ? _e : []).map(convertQueryDeclarationToMetadata),
        providers: declaration.providers !== undefined ? new WrappedNodeExpr(declaration.providers) :
            null,
        exportAs: (_f = declaration.exportAs) !== null && _f !== void 0 ? _f : null,
        usesInheritance: (_g = declaration.usesInheritance) !== null && _g !== void 0 ? _g : false,
        lifecycle: { usesOnChanges: (_h = declaration.usesOnChanges) !== null && _h !== void 0 ? _h : false },
        deps: null,
        typeArgumentCount: 0,
        fullInheritance: false,
    };
}
function convertHostDeclarationToMetadata(host = {}) {
    var _a, _b, _c;
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
    const result = {};
    for (const key of Object.keys(obj)) {
        result[key] = new WrappedNodeExpr(obj[key]);
    }
    return result;
}
function convertDeclareComponentFacadeToMetadata(declaration, typeSourceSpan, sourceMapUrl) {
    var _a, _b, _c, _d, _e, _f;
    const { template, interpolation } = parseJitTemplate(declaration.template, declaration.type.name, sourceMapUrl, (_a = declaration.preserveWhitespaces) !== null && _a !== void 0 ? _a : false, declaration.interpolation);
    return Object.assign(Object.assign({}, convertDeclareDirectiveFacadeToMetadata(declaration, typeSourceSpan)), { template, styles: (_b = declaration.styles) !== null && _b !== void 0 ? _b : [], directives: ((_c = declaration.components) !== null && _c !== void 0 ? _c : [])
            .concat((_d = declaration.directives) !== null && _d !== void 0 ? _d : [])
            .map(convertUsedDirectiveDeclarationToMetadata), pipes: convertUsedPipesToMetadata(declaration.pipes), viewProviders: declaration.viewProviders !== undefined ?
            new WrappedNodeExpr(declaration.viewProviders) :
            null, animations: declaration.animations !== undefined ? new WrappedNodeExpr(declaration.animations) :
            null, changeDetection: (_e = declaration.changeDetection) !== null && _e !== void 0 ? _e : ChangeDetectionStrategy.Default, encapsulation: (_f = declaration.encapsulation) !== null && _f !== void 0 ? _f : ViewEncapsulation.Emulated, interpolation, declarationListEmitMode: 2 /* ClosureResolved */, relativeContextFilePath: '', i18nUseExternalIds: true });
}
function convertUsedDirectiveDeclarationToMetadata(declaration) {
    var _a, _b, _c;
    return {
        selector: declaration.selector,
        type: new WrappedNodeExpr(declaration.type),
        inputs: (_a = declaration.inputs) !== null && _a !== void 0 ? _a : [],
        outputs: (_b = declaration.outputs) !== null && _b !== void 0 ? _b : [],
        exportAs: (_c = declaration.exportAs) !== null && _c !== void 0 ? _c : null,
    };
}
function convertUsedPipesToMetadata(declaredPipes) {
    const pipes = new Map();
    if (declaredPipes === undefined) {
        return pipes;
    }
    for (const pipeName of Object.keys(declaredPipes)) {
        const pipeType = declaredPipes[pipeName];
        pipes.set(pipeName, new WrappedNodeExpr(pipeType));
    }
    return pipes;
}
function parseJitTemplate(template, typeName, sourceMapUrl, preserveWhitespaces, interpolation) {
    const interpolationConfig = interpolation ? InterpolationConfig.fromArray(interpolation) : DEFAULT_INTERPOLATION_CONFIG;
    // Parse the template and check for errors.
    const parsed = parseTemplate(template, sourceMapUrl, { preserveWhitespaces: preserveWhitespaces, interpolationConfig });
    if (parsed.errors !== null) {
        const errors = parsed.errors.map(err => err.toString()).join(', ');
        throw new Error(`Errors during JIT compilation of template for ${typeName}: ${errors}`);
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
        return createR3ProviderExpression(new WrappedNodeExpr(obj[property]), /* isForwardRef */ false);
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
    const expression = (providedIn == null || typeof providedIn === 'string') ?
        new LiteralExpr(providedIn !== null && providedIn !== void 0 ? providedIn : null) :
        new WrappedNodeExpr(providedIn);
    // See `convertToProviderExpression()` for why `isForwardRef` is false.
    return createR3ProviderExpression(expression, /* isForwardRef */ false);
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
    var _a, _b, _c, _d, _e;
    const isAttributeDep = (_a = facade.attribute) !== null && _a !== void 0 ? _a : false;
    const token = facade.token === null ? null : new WrappedNodeExpr(facade.token);
    return createR3DependencyMetadata(token, isAttributeDep, (_b = facade.host) !== null && _b !== void 0 ? _b : false, (_c = facade.optional) !== null && _c !== void 0 ? _c : false, (_d = facade.self) !== null && _d !== void 0 ? _d : false, (_e = facade.skipSelf) !== null && _e !== void 0 ? _e : false);
}
function createR3DependencyMetadata(token, isAttributeDep, host, optional, self, skipSelf) {
    // If the dep is an `@Attribute()` the `attributeNameType` ought to be the `unknown` type.
    // But types are not available at runtime so we just use a literal `"<unknown>"` string as a dummy
    // marker.
    const attributeNameType = isAttributeDep ? literal('unknown') : null;
    return { token, attributeNameType, host, optional, self, skipSelf };
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
            propMetadata[field].forEach(ann => {
                if (isHostBinding(ann)) {
                    // Since this is a decorator, we know that the value is a class member. Always access it
                    // through `this` so that further down the line it can't be confused for a literal value
                    // (e.g. if there's a property called `true`).
                    bindings.properties[ann.hostPropertyName || field] =
                        getSafePropertyAccessString('this', field);
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
function parseInputOutputs(values) {
    return values.reduce((map, value) => {
        const [field, property] = value.split(',').map(piece => piece.trim());
        map[field] = property || field;
        return map;
    }, {});
}
function convertDeclarePipeFacadeToMetadata(declaration) {
    var _a;
    return {
        name: declaration.type.name,
        type: wrapReference(declaration.type),
        internalType: new WrappedNodeExpr(declaration.type),
        typeArgumentCount: 0,
        pipeName: declaration.name,
        deps: null,
        pure: (_a = declaration.pure) !== null && _a !== void 0 ? _a : true,
    };
}
function convertDeclareInjectorFacadeToMetadata(declaration) {
    return {
        name: declaration.type.name,
        type: wrapReference(declaration.type),
        internalType: new WrappedNodeExpr(declaration.type),
        providers: declaration.providers !== undefined ? new WrappedNodeExpr(declaration.providers) :
            null,
        imports: declaration.imports !== undefined ?
            declaration.imports.map(i => new WrappedNodeExpr(i)) :
            [],
    };
}
export function publishFacade(global) {
    const ng = global.ng || (global.ng = {});
    ng.ɵcompilerFacade = new CompilerFacadeImpl();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaml0X2NvbXBpbGVyX2ZhY2FkZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy9qaXRfY29tcGlsZXJfZmFjYWRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUlILE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUM3QyxPQUFPLEVBQUMsdUJBQXVCLEVBQTRDLGlCQUFpQixFQUFDLE1BQU0sUUFBUSxDQUFDO0FBQzVHLE9BQU8sRUFBQyxpQkFBaUIsRUFBRSwwQkFBMEIsRUFBdUIsTUFBTSx5QkFBeUIsQ0FBQztBQUM1RyxPQUFPLEVBQUMsNEJBQTRCLEVBQUUsbUJBQW1CLEVBQUMsTUFBTSxrQ0FBa0MsQ0FBQztBQUNuRyxPQUFPLEVBQUMsY0FBYyxFQUFjLE9BQU8sRUFBRSxXQUFXLEVBQWEsWUFBWSxFQUFFLGVBQWUsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQy9ILE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUNqRCxPQUFPLEVBQThCLG1CQUFtQixFQUFDLE1BQU0sY0FBYyxDQUFDO0FBQzlFLE9BQU8sRUFBQyxzQkFBc0IsRUFBRSxhQUFhLEVBQXVCLE1BQU0sc0JBQXNCLENBQUM7QUFDakcsT0FBTyxFQUFDLGVBQWUsRUFBcUIsTUFBTSxnQ0FBZ0MsQ0FBQztBQUNuRixPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sa0JBQWtCLENBQUM7QUFDaEQsT0FBTyxFQUFDLGVBQWUsRUFBRSxvQ0FBb0MsRUFBcUIsTUFBTSw4QkFBOEIsQ0FBQztBQUN2SCxPQUFPLEVBQUMsdUJBQXVCLEVBQWlCLE1BQU0sNEJBQTRCLENBQUM7QUFDbkYsT0FBTyxFQUFDLDJCQUEyQixFQUFFLGFBQWEsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBRTFFLE9BQU8sRUFBQyw0QkFBNEIsRUFBRSw0QkFBNEIsRUFBc0Is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Q0FBQztRQUNwQixRQUFRLEVBQUUsV0FBVyxDQUFDLElBQUk7UUFDMUIsSUFBSSxFQUFFLElBQUk7UUFDVixJQUFJLEVBQUUsTUFBQSxXQUFXLENBQUMsSUFBSSxtQ0FBSSxJQUFJO0tBQy9CLENBQUM7QUFDSixDQUFDO0FBRUQsU0FBUyxzQ0FBc0MsQ0FBQyxXQUFvQztJQUVsRixPQUFPO1FBQ0wsSUFBSSxFQUFFLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSTtRQUMzQixJQUFJLEVBQUUsYUFBYSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUM7UUFDckMsWUFBWSxFQUFFLElBQUksZUFBZSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUM7UUFDbkQsU0FBUyxFQUFFLFdBQVcsQ0FBQyxTQUFTLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLGVBQWUsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztZQUM1QyxJQUFJO1FBQ3JELE9BQU8sRUFBRSxXQUFXLENBQUMsT0FBTyxLQUFLLFNBQVMsQ0FBQyxDQUFDO1lBQ3hDLFdBQVcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3RELEVBQUU7S0FDUCxDQUFDO0FBQ0osQ0FBQztBQUVELE1BQU0sVUFBVSxhQUFhLENBQUMsTUFBVztJQUN2QyxNQUFNLEVBQUUsR0FBMkIsTUFBTSxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7SUFDakUsRUFBRSxDQUFDLGVBQWUsR0FBRyxJQUFJLGtCQUFrQixFQUFFLENBQUM7QUFDaEQsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5cbmltcG9ydCB7Q29tcGlsZXJGYWNhZGUsIENvcmVFbnZpcm9ubWVudCwgRXhwb3J0ZWRDb21waWxlckZhY2FkZSwgT3BhcXVlVmFsdWUsIFIzQ29tcG9uZW50TWV0YWRhdGFGYWNhZGUsIFIzRGVjbGFyZUNvbXBvbmVudEZhY2FkZSwgUjNEZWNsYXJlRGVwZW5kZW5jeU1ldGFkYXRhRmFjYWRlLCBSM0RlY2xhcmVEaXJlY3RpdmVGYWNhZGUsIFIzRGVjbGFyZUZhY3RvcnlGYWNhZGUsIFIzRGVjbGFyZUluamVjdGFibGVGYWNhZGUsIFIzRGVjbGFyZUluamVjdG9yRmFjYWRlLCBSM0RlY2xhcmVOZ01vZHVsZUZhY2FkZSwgUjNEZWNsYXJlUGlwZUZhY2FkZSwgUjNEZWNsYXJlUXVlcnlNZXRhZGF0YUZhY2FkZSwgUjNEZWNsYXJlVXNlZERpcmVjdGl2ZUZhY2FkZSwgUjNEZXBlbmRlbmN5TWV0YWRhdGFGYWNhZGUsIFIzRGlyZWN0aXZlTWV0YWRhdGFGYWNhZGUsIFIzRmFjdG9yeURlZk1ldGFkYXRhRmFjYWRlLCBSM0luamVjdGFibGVNZXRhZGF0YUZhY2FkZSwgUjNJbmplY3Rvck1ldGFkYXRhRmFjYWRlLCBSM05nTW9kdWxlTWV0YWRhdGFGYWNhZGUsIFIzUGlwZU1ldGFkYXRhRmFjYWRlLCBSM1F1ZXJ5TWV0YWRhdGFGYWNhZGUsIFN0cmluZ01hcCwgU3RyaW5nTWFwV2l0aFJlbmFtZX0gZnJvbSAnLi9jb21waWxlcl9mYWNhZGVfaW50ZXJmYWNlJztcbmltcG9ydCB7Q29uc3RhbnRQb29sfSBmcm9tICcuL2NvbnN0YW50X3Bvb2wnO1xuaW1wb3J0IHtDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSwgSG9zdEJpbmRpbmcsIEhvc3RMaXN0ZW5lciwgSW5wdXQsIE91dHB1dCwgVmlld0VuY2Fwc3VsYXRpb259IGZyb20gJy4vY29yZSc7XG5pbXBvcnQge2NvbXBpbGVJbmplY3RhYmxlLCBjcmVhdGVSM1Byb3ZpZGVyRXhwcmVzc2lvbiwgUjNQcm92aWRlckV4cHJlc3Npb259IGZyb20gJy4vaW5qZWN0YWJsZV9jb21waWxlcl8yJztcbmltcG9ydCB7REVGQVVMVF9JTlRFUlBPTEFUSU9OX0NPTkZJRywgSW50ZXJwb2xhdGlvbkNvbmZpZ30gZnJvbSAnLi9tbF9wYXJzZXIvaW50ZXJwb2xhdGlvbl9jb25maWcnO1xuaW1wb3J0IHtEZWNsYXJlVmFyU3RtdCwgRXhwcmVzc2lvbiwgbGl0ZXJhbCwgTGl0ZXJhbEV4cHIsIFN0YXRlbWVudCwgU3RtdE1vZGlmaWVyLCBXcmFwcGVkTm9kZUV4cHJ9IGZyb20gJy4vb3V0cHV0L291dHB1dF9hc3QnO1xuaW1wb3J0IHtKaXRFdmFsdWF0b3J9IGZyb20gJy4vb3V0cHV0L291dHB1dF9qaXQnO1xuaW1wb3J0IHtQYXJzZUVycm9yLCBQYXJzZVNvdXJjZVNwYW4sIHIzSml0VHlwZVNvdXJjZVNwYW59IGZyb20gJy4vcGFyc2VfdXRpbCc7XG5pbXBvcnQge2NvbXBpbGVGYWN0b3J5RnVuY3Rpb24sIEZhY3RvcnlUYXJnZXQsIFIzRGVwZW5kZW5jeU1ldGFkYXRhfSBmcm9tICcuL3JlbmRlcjMvcjNfZmFjdG9yeSc7XG5pbXBvcnQge2NvbXBpbGVJbmplY3RvciwgUjNJbmplY3Rvck1ldGFkYXRhfSBmcm9tICcuL3JlbmRlcjMvcjNfaW5qZWN0b3JfY29tcGlsZXInO1xuaW1wb3J0IHtSM0ppdFJlZmxlY3Rvcn0gZnJvbSAnLi9yZW5kZXIzL3IzX2ppdCc7XG5pbXBvcnQge2NvbXBpbGVOZ01vZHVsZSwgY29tcGlsZU5nTW9kdWxlRGVjbGFyYXRpb25FeHByZXNzaW9uLCBSM05nTW9kdWxlTWV0YWRhdGF9IGZyb20gJy4vcmVuZGVyMy9yM19tb2R1bGVfY29tcGlsZXInO1xuaW1wb3J0IHtjb21waWxlUGlwZUZyb21NZXRhZGF0YSwgUjNQaXBlTWV0YWRhdGF9IGZyb20gJy4vcmVuZGVyMy9yM19waXBlX2NvbXBpbGVyJztcbmltcG9ydCB7Z2V0U2FmZVByb3BlcnR5QWNjZXNzU3RyaW5nLCB3cmFwUmVmZXJlbmNlfSBmcm9tICcuL3JlbmRlcjMvdXRpbCc7XG5pbXBvcnQge0RlY2xhcmF0aW9uTGlzdEVtaXRNb2RlLCBSM0NvbXBvbmVudE1ldGFkYXRhLCBSM0RpcmVjdGl2ZU1ldGFkYXRhLCBSM0hvc3RNZXRhZGF0YSwgUjNRdWVyeU1ldGFkYXRhLCBSM1VzZWREaXJlY3RpdmVNZXRhZGF0YX0gZnJvbSAnLi9yZW5kZXIzL3ZpZXcvYXBpJztcbmltcG9ydCB7Y29tcGlsZUNvbXBvbmVudEZyb21NZXRhZGF0YSwgY29tcGlsZURpcmVjdGl2ZUZyb21NZXRhZGF0YSwgUGFyc2VkSG9zdEJpbmRpbmdzLCBwYXJzZUhvc3RCaW5kaW5ncywgdmVyaWZ5SG9zdEJpbmRpbmdzfSBmcm9tICcuL3JlbmRlcjMvdmlldy9jb21waWxlcic7XG5pbXBvcnQge21ha2VCaW5kaW5nUGFyc2VyLCBwYXJzZVRlbXBsYXRlfSBmcm9tICcuL3JlbmRlcjMvdmlldy90ZW1wbGF0ZSc7XG5pbXBvcnQge1Jlc291cmNlTG9hZGVyfSBmcm9tICcuL3Jlc291cmNlX2xvYWRlcic7XG5pbXBvcnQge0RvbUVsZW1lbnRTY2hlbWFSZWdpc3RyeX0gZnJvbSAnLi9zY2hlbWEvZG9tX2VsZW1lbnRfc2NoZW1hX3JlZ2lzdHJ5JztcblxuZXhwb3J0IGNsYXNzIENvbXBpbGVyRmFjYWRlSW1wbCBpbXBsZW1lbnRzIENvbXBpbGVyRmFjYWRlIHtcbiAgRmFjdG9yeVRhcmdldCA9IEZhY3RvcnlUYXJnZXQgYXMgYW55O1xuICBSZXNvdXJjZUxvYWRlciA9IFJlc291cmNlTG9hZGVyO1xuICBwcml2YXRlIGVsZW1lbnRTY2hlbWFSZWdpc3RyeSA9IG5ldyBEb21FbGVtZW50U2NoZW1hUmVnaXN0cnkoKTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGppdEV2YWx1YXRvciA9IG5ldyBKaXRFdmFsdWF0b3IoKSkge31cblxuICBjb21waWxlUGlwZShhbmd1bGFyQ29yZUVudjogQ29yZUVudmlyb25tZW50LCBzb3VyY2VNYXBVcmw6IHN0cmluZywgZmFjYWRlOiBSM1BpcGVNZXRhZGF0YUZhY2FkZSk6XG4gICAgICBhbnkge1xuICAgIGNvbnN0IG1ldGFkYXRhOiBSM1BpcGVNZXRhZGF0YSA9IHtcbiAgICAgIG5hbWU6IGZhY2FkZS5uYW1lLFxuICAgICAgdHlwZTogd3JhcFJlZmVyZW5jZShmYWNhZGUudHlwZSksXG4gICAgICBpbnRlcm5hbFR5cGU6IG5ldyBXcmFwcGVkTm9kZUV4cHIoZmFjYWRlLnR5cGUpLFxuICAgICAgdHlwZUFyZ3VtZW50Q291bnQ6IDAsXG4gICAgICBkZXBzOiBudWxsLFxuICAgICAgcGlwZU5hbWU6IGZhY2FkZS5waXBlTmFtZSxcbiAgICAgIHB1cmU6IGZhY2FkZS5wdXJlLFxuICAgIH07XG4gICAgY29uc3QgcmVzID0gY29tcGlsZVBpcGVGcm9tTWV0YWRhdGEobWV0YWRhdGEpO1xuICAgIHJldHVybiB0aGlzLmppdEV4cHJlc3Npb24ocmVzLmV4cHJlc3Npb24sIGFuZ3VsYXJDb3JlRW52LCBzb3VyY2VNYXBVcmwsIFtdKTtcbiAgfVxuXG4gIGNvbXBpbGVQaXBlRGVjbGFyYXRpb24oXG4gICAgICBhbmd1bGFyQ29yZUVudjogQ29yZUVudmlyb25tZW50LCBzb3VyY2VNYXBVcmw6IHN0cmluZyxcbiAgICAgIGRlY2xhcmF0aW9uOiBSM0RlY2xhcmVQaXBlRmFjYWRlKTogYW55IHtcbiAgICBjb25zdCBtZXRhID0gY29udmVydERlY2xhcmVQaXBlRmFjYWRlVG9NZXRhZGF0YShkZWNsYXJhdGlvbik7XG4gICAgY29uc3QgcmVzID0gY29tcGlsZVBpcGVGcm9tTWV0YWRhdGEobWV0YSk7XG4gICAgcmV0dXJuIHRoaXMuaml0RXhwcmVzc2lvbihyZXMuZXhwcmVzc2lvbiwgYW5ndWxhckNvcmVFbnYsIHNvdXJjZU1hcFVybCwgW10pO1xuICB9XG5cbiAgY29tcGlsZUluamVjdGFibGUoXG4gICAgICBhbmd1bGFyQ29yZUVudjogQ29yZUVudmlyb25tZW50LCBzb3VyY2VNYXBVcmw6IHN0cmluZyxcbiAgICAgIGZhY2FkZTogUjNJbmplY3RhYmxlTWV0YWRhdGFGYWNhZGUpOiBhbnkge1xuICAgIGNvbnN0IHtleHByZXNzaW9uLCBzdGF0ZW1lbnRzfSA9IGNvbXBpbGVJbmplY3RhYmxlKFxuICAgICAgICB7XG4gICAgICAgICAgbmFtZTogZmFjYWRlLm5hbWUsXG4gICAgICAgICAgdHlwZTogd3JhcFJlZmVyZW5jZShmYWNhZGUudHlwZSksXG4gICAgICAgICAgaW50ZXJuYWxUeXBlOiBuZXcgV3JhcHBlZE5vZGVFeHByKGZhY2FkZS50eXBlKSxcbiAgICAgICAgICB0eXBlQXJndW1lbnRDb3VudDogZmFjYWRlLnR5cGVBcmd1bWVudENvdW50LFxuICAgICAgICAgIHByb3ZpZGVkSW46IGNvbXB1dGVQcm92aWRlZEluKGZhY2FkZS5wcm92aWRlZEluKSxcbiAgICAgICAgICB1c2VDbGFzczogY29udmVydFRvUHJvdmlkZXJFeHByZXNzaW9uKGZhY2FkZSwgVVNFX0NMQVNTKSxcbiAgICAgICAgICB1c2VGYWN0b3J5OiB3cmFwRXhwcmVzc2lvbihmYWNhZGUsIFVTRV9GQUNUT1JZKSxcbiAgICAgICAgICB1c2VWYWx1ZTogY29udmVydFRvUHJvdmlkZXJFeHByZXNzaW9uKGZhY2FkZSwgVVNFX1ZBTFVFKSxcbiAgICAgICAgICB1c2VFeGlzdGluZzogY29udmVydFRvUHJvdmlkZXJFeHByZXNzaW9uKGZhY2FkZSwgVVNFX0VYSVNUSU5HKSxcbiAgICAgICAgICBkZXBzOiBmYWNhZGUuZGVwcz8ubWFwKGNvbnZlcnRSM0RlcGVuZGVuY3lNZXRhZGF0YSksXG4gICAgICAgIH0sXG4gICAgICAgIC8qIHJlc29sdmVGb3J3YXJkUmVmcyAqLyB0cnVlKTtcblxuICAgIHJldHVybiB0aGlzLmppdEV4cHJlc3Npb24oZXhwcmVzc2lvbiwgYW5ndWxhckNvcmVFbnYsIHNvdXJjZU1hcFVybCwgc3RhdGVtZW50cyk7XG4gIH1cblxuICBjb21waWxlSW5qZWN0YWJsZURlY2xhcmF0aW9uKFxuICAgICAgYW5ndWxhckNvcmVFbnY6IENvcmVFbnZpcm9ubWVudCwgc291cmNlTWFwVXJsOiBzdHJpbmcsXG4gICAgICBmYWNhZGU6IFIzRGVjbGFyZUluamVjdGFibGVGYWNhZGUpOiBhbnkge1xuICAgIGNvbnN0IHtleHByZXNzaW9uLCBzdGF0ZW1lbnRzfSA9IGNvbXBpbGVJbmplY3RhYmxlKFxuICAgICAgICB7XG4gICAgICAgICAgbmFtZTogZmFjYWRlLnR5cGUubmFtZSxcbiAgICAgICAgICB0eXBlOiB3cmFwUmVmZXJlbmNlKGZhY2FkZS50eXBlKSxcbiAgICAgICAgICBpbnRlcm5hbFR5cGU6IG5ldyBXcmFwcGVkTm9kZUV4cHIoZmFjYWRlLnR5cGUpLFxuICAgICAgICAgIHR5cGVBcmd1bWVudENvdW50OiAwLFxuICAgICAgICAgIHByb3ZpZGVkSW46IGNvbXB1dGVQcm92aWRlZEluKGZhY2FkZS5wcm92aWRlZEluKSxcbiAgICAgICAgICB1c2VDbGFzczogY29udmVydFRvUHJvdmlkZXJFeHByZXNzaW9uKGZhY2FkZSwgVVNFX0NMQVNTKSxcbiAgICAgICAgICB1c2VGYWN0b3J5OiB3cmFwRXhwcmVzc2lvbihmYWNhZGUsIFVTRV9GQUNUT1JZKSxcbiAgICAgICAgICB1c2VWYWx1ZTogY29udmVydFRvUHJvdmlkZXJFeHByZXNzaW9uKGZhY2FkZSwgVVNFX1ZBTFVFKSxcbiAgICAgICAgICB1c2VFeGlzdGluZzogY29udmVydFRvUHJvdmlkZXJFeHByZXNzaW9uKGZhY2FkZSwgVVNFX0VYSVNUSU5HKSxcbiAgICAgICAgICBkZXBzOiBmYWNhZGUuZGVwcz8ubWFwKGNvbnZlcnRSM0RlY2xhcmVEZXBlbmRlbmN5TWV0YWRhdGEpLFxuICAgICAgICB9LFxuICAgICAgICAvKiByZXNvbHZlRm9yd2FyZFJlZnMgKi8gdHJ1ZSk7XG5cbiAgICByZXR1cm4gdGhpcy5qaXRFeHByZXNzaW9uKGV4cHJlc3Npb24sIGFuZ3VsYXJDb3JlRW52LCBzb3VyY2VNYXBVcmwsIHN0YXRlbWVudHMpO1xuICB9XG5cbiAgY29tcGlsZUluamVjdG9yKFxuICAgICAgYW5ndWxhckNvcmVFbnY6IENvcmVFbnZpcm9ubWVudCwgc291cmNlTWFwVXJsOiBzdHJpbmcsXG4gICAgICBmYWNhZGU6IFIzSW5qZWN0b3JNZXRhZGF0YUZhY2FkZSk6IGFueSB7XG4gICAgY29uc3QgbWV0YTogUjNJbmplY3Rvck1ldGFkYXRhID0ge1xuICAgICAgbmFtZTogZmFjYWRlLm5hbWUsXG4gICAgICB0eXBlOiB3cmFwUmVmZXJlbmNlKGZhY2FkZS50eXBlKSxcbiAgICAgIGludGVybmFsVHlwZTogbmV3IFdyYXBwZWROb2RlRXhwcihmYWNhZGUudHlwZSksXG4gICAgICBwcm92aWRlcnM6IG5ldyBXcmFwcGVkTm9kZUV4cHIoZmFjYWRlLnByb3ZpZGVycyksXG4gICAgICBpbXBvcnRzOiBmYWNhZGUuaW1wb3J0cy5tYXAoaSA9PiBuZXcgV3JhcHBlZE5vZGVFeHByKGkpKSxcbiAgICB9O1xuICAgIGNvbnN0IHJlcyA9IGNvbXBpbGVJbmplY3RvcihtZXRhKTtcbiAgICByZXR1cm4gdGhpcy5qaXRFeHByZXNzaW9uKHJlcy5leHByZXNzaW9uLCBhbmd1bGFyQ29yZUVudiwgc291cmNlTWFwVXJsLCBbXSk7XG4gIH1cblxuICBjb21waWxlSW5qZWN0b3JEZWNsYXJhdGlvbihcbiAgICAgIGFuZ3VsYXJDb3JlRW52OiBDb3JlRW52aXJvbm1lbnQsIHNvdXJjZU1hcFVybDogc3RyaW5nLFxuICAgICAgZGVjbGFyYXRpb246IFIzRGVjbGFyZUluamVjdG9yRmFjYWRlKTogYW55IHtcbiAgICBjb25zdCBtZXRhID0gY29udmVydERlY2xhcmVJbmplY3RvckZhY2FkZVRvTWV0YWRhdGEoZGVjbGFyYXRpb24pO1xuICAgIGNvbnN0IHJlcyA9IGNvbXBpbGVJbmplY3RvcihtZXRhKTtcbiAgICByZXR1cm4gdGhpcy5qaXRFeHByZXNzaW9uKHJlcy5leHByZXNzaW9uLCBhbmd1bGFyQ29yZUVudiwgc291cmNlTWFwVXJsLCBbXSk7XG4gIH1cblxuICBjb21waWxlTmdNb2R1bGUoXG4gICAgICBhbmd1bGFyQ29yZUVudjogQ29yZUVudmlyb25tZW50LCBzb3VyY2VNYXBVcmw6IHN0cmluZyxcbiAgICAgIGZhY2FkZTogUjNOZ01vZHVsZU1ldGFkYXRhRmFjYWRlKTogYW55IHtcbiAgICBjb25zdCBtZXRhOiBSM05nTW9kdWxlTWV0YWRhdGEgPSB7XG4gICAgICB0eXBlOiB3cmFwUmVmZXJlbmNlKGZhY2FkZS50eXBlKSxcbiAgICAgIGludGVybmFsVHlwZTogbmV3IFdyYXBwZWROb2RlRXhwcihmYWNhZGUudHlwZSksXG4gICAgICBhZGphY2VudFR5cGU6IG5ldyBXcmFwcGVkTm9kZUV4cHIoZmFjYWRlLnR5cGUpLFxuICAgICAgYm9vdHN0cmFwOiBmYWNhZGUuYm9vdHN0cmFwLm1hcCh3cmFwUmVmZXJlbmNlKSxcbiAgICAgIGRlY2xhcmF0aW9uczogZmFjYWRlLmRlY2xhcmF0aW9ucy5tYXAod3JhcFJlZmVyZW5jZSksXG4gICAgICBpbXBvcnRzOiBmYWNhZGUuaW1wb3J0cy5tYXAod3JhcFJlZmVyZW5jZSksXG4gICAgICBleHBvcnRzOiBmYWNhZGUuZXhwb3J0cy5tYXAod3JhcFJlZmVyZW5jZSksXG4gICAgICBlbWl0SW5saW5lOiB0cnVlLFxuICAgICAgY29udGFpbnNGb3J3YXJkRGVjbHM6IGZhbHNlLFxuICAgICAgc2NoZW1hczogZmFjYWRlLnNjaGVtYXMgPyBmYWNhZGUuc2NoZW1hcy5tYXAod3JhcFJlZmVyZW5jZSkgOiBudWxsLFxuICAgICAgaWQ6IGZhY2FkZS5pZCA/IG5ldyBXcmFwcGVkTm9kZUV4cHIoZmFjYWRlLmlkKSA6IG51bGwsXG4gICAgfTtcbiAgICBjb25zdCByZXMgPSBjb21waWxlTmdNb2R1bGUobWV0YSk7XG4gICAgcmV0dXJuIHRoaXMuaml0RXhwcmVzc2lvbihyZXMuZXhwcmVzc2lvbiwgYW5ndWxhckNvcmVFbnYsIHNvdXJjZU1hcFVybCwgW10pO1xuICB9XG5cbiAgY29tcGlsZU5nTW9kdWxlRGVjbGFyYXRpb24oXG4gICAgICBhbmd1bGFyQ29yZUVudjogQ29yZUVudmlyb25tZW50LCBzb3VyY2VNYXBVcmw6IHN0cmluZyxcbiAgICAgIGRlY2xhcmF0aW9uOiBSM0RlY2xhcmVOZ01vZHVsZUZhY2FkZSk6IGFueSB7XG4gICAgY29uc3QgZXhwcmVzc2lvbiA9IGNvbXBpbGVOZ01vZHVsZURlY2xhcmF0aW9uRXhwcmVzc2lvbihkZWNsYXJhdGlvbik7XG4gICAgcmV0dXJuIHRoaXMuaml0RXhwcmVzc2lvbihleHByZXNzaW9uLCBhbmd1bGFyQ29yZUVudiwgc291cmNlTWFwVXJsLCBbXSk7XG4gIH1cblxuICBjb21waWxlRGlyZWN0aXZlKFxuICAgICAgYW5ndWxhckNvcmVFbnY6IENvcmVFbnZpcm9ubWVudCwgc291cmNlTWFwVXJsOiBzdHJpbmcsXG4gICAgICBmYWNhZGU6IFIzRGlyZWN0aXZlTWV0YWRhdGFGYWNhZGUpOiBhbnkge1xuICAgIGNvbnN0IG1ldGE6IFIzRGlyZWN0aXZlTWV0YWRhdGEgPSBjb252ZXJ0RGlyZWN0aXZlRmFjYWRlVG9NZXRhZGF0YShmYWNhZGUpO1xuICAgIHJldHVybiB0aGlzLmNvbXBpbGVEaXJlY3RpdmVGcm9tTWV0YShhbmd1bGFyQ29yZUVudiwgc291cmNlTWFwVXJsLCBtZXRhKTtcbiAgfVxuXG4gIGNvbXBpbGVEaXJlY3RpdmVEZWNsYXJhdGlvbihcbiAgICAgIGFuZ3VsYXJDb3JlRW52OiBDb3JlRW52aXJvbm1lbnQsIHNvdXJjZU1hcFVybDogc3RyaW5nLFxuICAgICAgZGVjbGFyYXRpb246IFIzRGVjbGFyZURpcmVjdGl2ZUZhY2FkZSk6IGFueSB7XG4gICAgY29uc3QgdHlwZVNvdXJjZVNwYW4gPVxuICAgICAgICB0aGlzLmNyZWF0ZVBhcnNlU291cmNlU3BhbignRGlyZWN0aXZlJywgZGVjbGFyYXRpb24udHlwZS5uYW1lLCBzb3VyY2VNYXBVcmwpO1xuICAgIGNvbnN0IG1ldGEgPSBjb252ZXJ0RGVjbGFyZURpcmVjdGl2ZUZhY2FkZVRvTWV0YWRhdGEoZGVjbGFyYXRpb24sIHR5cGVTb3VyY2VTcGFuKTtcbiAgICByZXR1cm4gdGhpcy5jb21waWxlRGlyZWN0aXZlRnJvbU1ldGEoYW5ndWxhckNvcmVFbnYsIHNvdXJjZU1hcFVybCwgbWV0YSk7XG4gIH1cblxuICBwcml2YXRlIGNvbXBpbGVEaXJlY3RpdmVGcm9tTWV0YShcbiAgICAgIGFuZ3VsYXJDb3JlRW52OiBDb3JlRW52aXJvbm1lbnQsIHNvdXJjZU1hcFVybDogc3RyaW5nLCBtZXRhOiBSM0RpcmVjdGl2ZU1ldGFkYXRhKTogYW55IHtcbiAgICBjb25zdCBjb25zdGFudFBvb2wgPSBuZXcgQ29uc3RhbnRQb29sKCk7XG4gICAgY29uc3QgYmluZGluZ1BhcnNlciA9IG1ha2VCaW5kaW5nUGFyc2VyKCk7XG4gICAgY29uc3QgcmVzID0gY29tcGlsZURpcmVjdGl2ZUZyb21NZXRhZGF0YShtZXRhLCBjb25zdGFudFBvb2wsIGJpbmRpbmdQYXJzZXIpO1xuICAgIHJldHVybiB0aGlzLmppdEV4cHJlc3Npb24oXG4gICAgICAgIHJlcy5leHByZXNzaW9uLCBhbmd1bGFyQ29yZUVudiwgc291cmNlTWFwVXJsLCBjb25zdGFudFBvb2wuc3RhdGVtZW50cyk7XG4gIH1cblxuICBjb21waWxlQ29tcG9uZW50KFxuICAgICAgYW5ndWxhckNvcmVFbnY6IENvcmVFbnZpcm9ubWVudCwgc291cmNlTWFwVXJsOiBzdHJpbmcsXG4gICAgICBmYWNhZGU6IFIzQ29tcG9uZW50TWV0YWRhdGFGYWNhZGUpOiBhbnkge1xuICAgIC8vIFBhcnNlIHRoZSB0ZW1wbGF0ZSBhbmQgY2hlY2sgZm9yIGVycm9ycy5cbiAgICBjb25zdCB7dGVtcGxhdGUsIGludGVycG9sYXRpb259ID0gcGFyc2VKaXRUZW1wbGF0ZShcbiAgICAgICAgZmFjYWRlLnRlbXBsYXRlLCBmYWNhZGUubmFtZSwgc291cmNlTWFwVXJsLCBmYWNhZGUucHJlc2VydmVXaGl0ZXNwYWNlcyxcbiAgICAgICAgZmFjYWRlLmludGVycG9sYXRpb24pO1xuXG4gICAgLy8gQ29tcGlsZSB0aGUgY29tcG9uZW50IG1ldGFkYXRhLCBpbmNsdWRpbmcgdGVtcGxhdGUsIGludG8gYW4gZXhwcmVzc2lvbi5cbiAgICBjb25zdCBtZXRhOiBSM0NvbXBvbmVudE1ldGFkYXRhID0ge1xuICAgICAgLi4uZmFjYWRlIGFzIFIzQ29tcG9uZW50TWV0YWRhdGFGYWNhZGVOb1Byb3BBbmRXaGl0ZXNwYWNlLFxuICAgICAgLi4uY29udmVydERpcmVjdGl2ZUZhY2FkZVRvTWV0YWRhdGEoZmFjYWRlKSxcbiAgICAgIHNlbGVjdG9yOiBmYWNhZGUuc2VsZWN0b3IgfHwgdGhpcy5lbGVtZW50U2NoZW1hUmVnaXN0cnkuZ2V0RGVmYXVsdENvbXBvbmVudEVsZW1lbnROYW1lKCksXG4gICAgICB0ZW1wbGF0ZSxcbiAgICAgIGRlY2xhcmF0aW9uTGlzdEVtaXRNb2RlOiBEZWNsYXJhdGlvbkxpc3RFbWl0TW9kZS5EaXJlY3QsXG4gICAgICBzdHlsZXM6IFsuLi5mYWNhZGUuc3R5bGVzLCAuLi50ZW1wbGF0ZS5zdHlsZXNdLFxuICAgICAgZW5jYXBzdWxhdGlvbjogZmFjYWRlLmVuY2Fwc3VsYXRpb24gYXMgYW55LFxuICAgICAgaW50ZXJwb2xhdGlvbixcbiAgICAgIGNoYW5nZURldGVjdGlvbjogZmFjYWRlLmNoYW5nZURldGVjdGlvbixcbiAgICAgIGFuaW1hdGlvbnM6IGZhY2FkZS5hbmltYXRpb25zICE9IG51bGwgPyBuZXcgV3JhcHBlZE5vZGVFeHByKGZhY2FkZS5hbmltYXRpb25zKSA6IG51bGwsXG4gICAgICB2aWV3UHJvdmlkZXJzOiBmYWNhZGUudmlld1Byb3ZpZGVycyAhPSBudWxsID8gbmV3IFdyYXBwZWROb2RlRXhwcihmYWNhZGUudmlld1Byb3ZpZGVycykgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICByZWxhdGl2ZUNvbnRleHRGaWxlUGF0aDogJycsXG4gICAgICBpMThuVXNlRXh0ZXJuYWxJZHM6IHRydWUsXG4gICAgfTtcbiAgICBjb25zdCBqaXRFeHByZXNzaW9uU291cmNlTWFwID0gYG5nOi8vLyR7ZmFjYWRlLm5hbWV9LmpzYDtcbiAgICByZXR1cm4gdGhpcy5jb21waWxlQ29tcG9uZW50RnJvbU1ldGEoYW5ndWxhckNvcmVFbnYsIGppdEV4cHJlc3Npb25Tb3VyY2VNYXAsIG1ldGEpO1xuICB9XG5cbiAgY29tcGlsZUNvbXBvbmVudERlY2xhcmF0aW9uKFxuICAgICAgYW5ndWxhckNvcmVFbnY6IENvcmVFbnZpcm9ubWVudCwgc291cmNlTWFwVXJsOiBzdHJpbmcsXG4gICAgICBkZWNsYXJhdGlvbjogUjNEZWNsYXJlQ29tcG9uZW50RmFjYWRlKTogYW55IHtcbiAgICBjb25zdCB0eXBlU291cmNlU3BhbiA9XG4gICAgICAgIHRoaXMuY3JlYXRlUGFyc2VTb3VyY2VTcGFuKCdDb21wb25lbnQnLCBkZWNsYXJhdGlvbi50eXBlLm5hbWUsIHNvdXJjZU1hcFVybCk7XG4gICAgY29uc3QgbWV0YSA9IGNvbnZlcnREZWNsYXJlQ29tcG9uZW50RmFjYWRlVG9NZXRhZGF0YShkZWNsYXJhdGlvbiwgdHlwZVNvdXJjZVNwYW4sIHNvdXJjZU1hcFVybCk7XG4gICAgcmV0dXJuIHRoaXMuY29tcGlsZUNvbXBvbmVudEZyb21NZXRhKGFuZ3VsYXJDb3JlRW52LCBzb3VyY2VNYXBVcmwsIG1ldGEpO1xuICB9XG5cbiAgcHJpdmF0ZSBjb21waWxlQ29tcG9uZW50RnJvbU1ldGEoXG4gICAgICBhbmd1bGFyQ29yZUVudjogQ29yZUVudmlyb25tZW50LCBzb3VyY2VNYXBVcmw6IHN0cmluZywgbWV0YTogUjNDb21wb25lbnRNZXRhZGF0YSk6IGFueSB7XG4gICAgY29uc3QgY29uc3RhbnRQb29sID0gbmV3IENvbnN0YW50UG9vbCgpO1xuICAgIGNvbnN0IGJpbmRpbmdQYXJzZXIgPSBtYWtlQmluZGluZ1BhcnNlcihtZXRhLmludGVycG9sYXRpb24pO1xuICAgIGNvbnN0IHJlcyA9IGNvbXBpbGVDb21wb25lbnRGcm9tTWV0YWRhdGEobWV0YSwgY29uc3RhbnRQb29sLCBiaW5kaW5nUGFyc2VyKTtcbiAgICByZXR1cm4gdGhpcy5qaXRFeHByZXNzaW9uKFxuICAgICAgICByZXMuZXhwcmVzc2lvbiwgYW5ndWxhckNvcmVFbnYsIHNvdXJjZU1hcFVybCwgY29uc3RhbnRQb29sLnN0YXRlbWVudHMpO1xuICB9XG5cbiAgY29tcGlsZUZhY3RvcnkoXG4gICAgICBhbmd1bGFyQ29yZUVudjogQ29yZUVudmlyb25tZW50LCBzb3VyY2VNYXBVcmw6IHN0cmluZywgbWV0YTogUjNGYWN0b3J5RGVmTWV0YWRhdGFGYWNhZGUpIHtcbiAgICBjb25zdCBmYWN0b3J5UmVzID0gY29tcGlsZUZhY3RvcnlGdW5jdGlvbih7XG4gICAgICBuYW1lOiBtZXRhLm5hbWUsXG4gICAgICB0eXBlOiB3cmFwUmVmZXJlbmNlKG1ldGEudHlwZSksXG4gICAgICBpbnRlcm5hbFR5cGU6IG5ldyBXcmFwcGVkTm9kZUV4cHIobWV0YS50eXBlKSxcbiAgICAgIHR5cGVBcmd1bWVudENvdW50OiBtZXRhLnR5cGVBcmd1bWVudENvdW50LFxuICAgICAgZGVwczogY29udmVydFIzRGVwZW5kZW5jeU1ldGFkYXRhQXJyYXkobWV0YS5kZXBzKSxcbiAgICAgIHRhcmdldDogbWV0YS50YXJnZXQsXG4gICAgfSk7XG4gICAgcmV0dXJuIHRoaXMuaml0RXhwcmVzc2lvbihcbiAgICAgICAgZmFjdG9yeVJlcy5leHByZXNzaW9uLCBhbmd1bGFyQ29yZUVudiwgc291cmNlTWFwVXJsLCBmYWN0b3J5UmVzLnN0YXRlbWVudHMpO1xuICB9XG5cbiAgY29tcGlsZUZhY3RvcnlEZWNsYXJhdGlvbihcbiAgICAgIGFuZ3VsYXJDb3JlRW52OiBDb3JlRW52aXJvbm1lbnQsIHNvdXJjZU1hcFVybDogc3RyaW5nLCBtZXRhOiBSM0RlY2xhcmVGYWN0b3J5RmFjYWRlKSB7XG4gICAgY29uc3QgZmFjdG9yeVJlcyA9IGNvbXBpbGVGYWN0b3J5RnVuY3Rpb24oe1xuICAgICAgbmFtZTogbWV0YS50eXBlLm5hbWUsXG4gICAgICB0eXBlOiB3cmFwUmVmZXJlbmNlKG1ldGEudHlwZSksXG4gICAgICBpbnRlcm5hbFR5cGU6IG5ldyBXcmFwcGVkTm9kZUV4cHIobWV0YS50eXBlKSxcbiAgICAgIHR5cGVBcmd1bWVudENvdW50OiAwLFxuICAgICAgZGVwczogbWV0YS5kZXBzICYmIG1ldGEuZGVwcy5tYXAoY29udmVydFIzRGVjbGFyZURlcGVuZGVuY3lNZXRhZGF0YSksXG4gICAgICB0YXJnZXQ6IG1ldGEudGFyZ2V0LFxuICAgIH0pO1xuICAgIHJldHVybiB0aGlzLmppdEV4cHJlc3Npb24oXG4gICAgICAgIGZhY3RvcnlSZXMuZXhwcmVzc2lvbiwgYW5ndWxhckNvcmVFbnYsIHNvdXJjZU1hcFVybCwgZmFjdG9yeVJlcy5zdGF0ZW1lbnRzKTtcbiAgfVxuXG5cbiAgY3JlYXRlUGFyc2VTb3VyY2VTcGFuKGtpbmQ6IHN0cmluZywgdHlwZU5hbWU6IHN0cmluZywgc291cmNlVXJsOiBzdHJpbmcpOiBQYXJzZVNvdXJjZVNwYW4ge1xuICAgIHJldHVybiByM0ppdFR5cGVTb3VyY2VTcGFuKGtpbmQsIHR5cGVOYW1lLCBzb3VyY2VVcmwpO1xuICB9XG5cbiAgLyoqXG4gICAqIEpJVCBjb21waWxlcyBhbiBleHByZXNzaW9uIGFuZCByZXR1cm5zIHRoZSByZXN1bHQgb2YgZXhlY3V0aW5nIHRoYXQgZXhwcmVzc2lvbi5cbiAgICpcbiAgICogQHBhcmFtIGRlZiB0aGUgZGVmaW5pdGlvbiB3aGljaCB3aWxsIGJlIGNvbXBpbGVkIGFuZCBleGVjdXRlZCB0byBnZXQgdGhlIHZhbHVlIHRvIHBhdGNoXG4gICAqIEBwYXJhbSBjb250ZXh0IGFuIG9iamVjdCBtYXAgb2YgQGFuZ3VsYXIvY29yZSBzeW1ib2wgbmFtZXMgdG8gc3ltYm9scyB3aGljaCB3aWxsIGJlIGF2YWlsYWJsZVxuICAgKiBpbiB0aGUgY29udGV4dCBvZiB0aGUgY29tcGlsZWQgZXhwcmVzc2lvblxuICAgKiBAcGFyYW0gc291cmNlVXJsIGEgVVJMIHRvIHVzZSBmb3IgdGhlIHNvdXJjZSBtYXAgb2YgdGhlIGNvbXBpbGVkIGV4cHJlc3Npb25cbiAgICogQHBhcmFtIHByZVN0YXRlbWVudHMgYSBjb2xsZWN0aW9uIG9mIHN0YXRlbWVudHMgdGhhdCBzaG91bGQgYmUgZXZhbHVhdGVkIGJlZm9yZSB0aGUgZXhwcmVzc2lvbi5cbiAgICovXG4gIHByaXZhdGUgaml0RXhwcmVzc2lvbihcbiAgICAgIGRlZjogRXhwcmVzc2lvbiwgY29udGV4dDoge1trZXk6IHN0cmluZ106IGFueX0sIHNvdXJjZVVybDogc3RyaW5nLFxuICAgICAgcHJlU3RhdGVtZW50czogU3RhdGVtZW50W10pOiBhbnkge1xuICAgIC8vIFRoZSBDb25zdGFudFBvb2wgbWF5IGNvbnRhaW4gU3RhdGVtZW50cyB3aGljaCBkZWNsYXJlIHZhcmlhYmxlcyB1c2VkIGluIHRoZSBmaW5hbCBleHByZXNzaW9uLlxuICAgIC8vIFRoZXJlZm9yZSwgaXRzIHN0YXRlbWVudHMgbmVlZCB0byBwcmVjZWRlIHRoZSBhY3R1YWwgSklUIG9wZXJhdGlvbi4gVGhlIGZpbmFsIHN0YXRlbWVudCBpcyBhXG4gICAgLy8gZGVjbGFyYXRpb24gb2YgJGRlZiB3aGljaCBpcyBzZXQgdG8gdGhlIGV4cHJlc3Npb24gYmVpbmcgY29tcGlsZWQuXG4gICAgY29uc3Qgc3RhdGVtZW50czogU3RhdGVtZW50W10gPSBbXG4gICAgICAuLi5wcmVTdGF0ZW1lbnRzLFxuICAgICAgbmV3IERlY2xhcmVWYXJTdG10KCckZGVmJywgZGVmLCB1bmRlZmluZWQsIFtTdG10TW9kaWZpZXIuRXhwb3J0ZWRdKSxcbiAgICBdO1xuXG4gICAgY29uc3QgcmVzID0gdGhpcy5qaXRFdmFsdWF0b3IuZXZhbHVhdGVTdGF0ZW1lbnRzKFxuICAgICAgICBzb3VyY2VVcmwsIHN0YXRlbWVudHMsIG5ldyBSM0ppdFJlZmxlY3Rvcihjb250ZXh0KSwgLyogZW5hYmxlU291cmNlTWFwcyAqLyB0cnVlKTtcbiAgICByZXR1cm4gcmVzWyckZGVmJ107XG4gIH1cbn1cblxuLy8gVGhpcyBzZWVtcyB0byBiZSBuZWVkZWQgdG8gcGxhY2F0ZSBUUyB2My4wIG9ubHlcbnR5cGUgUjNDb21wb25lbnRNZXRhZGF0YUZhY2FkZU5vUHJvcEFuZFdoaXRlc3BhY2UgPSBQaWNrPFxuICAgIFIzQ29tcG9uZW50TWV0YWRhdGFGYWNhZGUsXG4gICAgRXhjbHVkZTxFeGNsdWRlPGtleW9mIFIzQ29tcG9uZW50TWV0YWRhdGFGYWNhZGUsICdwcmVzZXJ2ZVdoaXRlc3BhY2VzJz4sICdwcm9wTWV0YWRhdGEnPj47XG5cbmNvbnN0IFVTRV9DTEFTUyA9IE9iamVjdC5rZXlzKHt1c2VDbGFzczogbnVsbH0pWzBdO1xuY29uc3QgVVNFX0ZBQ1RPUlkgPSBPYmplY3Qua2V5cyh7dXNlRmFjdG9yeTogbnVsbH0pWzBdO1xuY29uc3QgVVNFX1ZBTFVFID0gT2JqZWN0LmtleXMoe3VzZVZhbHVlOiBudWxsfSlbMF07XG5jb25zdCBVU0VfRVhJU1RJTkcgPSBPYmplY3Qua2V5cyh7dXNlRXhpc3Rpbmc6IG51bGx9KVswXTtcblxuZnVuY3Rpb24gY29udmVydFRvUjNRdWVyeU1ldGFkYXRhKGZhY2FkZTogUjNRdWVyeU1ldGFkYXRhRmFjYWRlKTogUjNRdWVyeU1ldGFkYXRhIHtcbiAgcmV0dXJuIHtcbiAgICAuLi5mYWNhZGUsXG4gICAgcHJlZGljYXRlOiBBcnJheS5pc0FycmF5KGZhY2FkZS5wcmVkaWNhdGUpID8gZmFjYWRlLnByZWRpY2F0ZSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IFdyYXBwZWROb2RlRXhwcihmYWNhZGUucHJlZGljYXRlKSxcbiAgICByZWFkOiBmYWNhZGUucmVhZCA/IG5ldyBXcmFwcGVkTm9kZUV4cHIoZmFjYWRlLnJlYWQpIDogbnVsbCxcbiAgICBzdGF0aWM6IGZhY2FkZS5zdGF0aWMsXG4gICAgZW1pdERpc3RpbmN0Q2hhbmdlc09ubHk6IGZhY2FkZS5lbWl0RGlzdGluY3RDaGFuZ2VzT25seSxcbiAgfTtcbn1cblxuZnVuY3Rpb24gY29udmVydFF1ZXJ5RGVjbGFyYXRpb25Ub01ldGFkYXRhKGRlY2xhcmF0aW9uOiBSM0RlY2xhcmVRdWVyeU1ldGFkYXRhRmFjYWRlKTpcbiAgICBSM1F1ZXJ5TWV0YWRhdGEge1xuICByZXR1cm4ge1xuICAgIHByb3BlcnR5TmFtZTogZGVjbGFyYXRpb24ucHJvcGVydHlOYW1lLFxuICAgIGZpcnN0OiBkZWNsYXJhdGlvbi5maXJzdCA/PyBmYWxzZSxcbiAgICBwcmVkaWNhdGU6IEFycmF5LmlzQXJyYXkoZGVjbGFyYXRpb24ucHJlZGljYXRlKSA/IGRlY2xhcmF0aW9uLnByZWRpY2F0ZSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgV3JhcHBlZE5vZGVFeHByKGRlY2xhcmF0aW9uLnByZWRpY2F0ZSksXG4gICAgZGVzY2VuZGFudHM6IGRlY2xhcmF0aW9uLmRlc2NlbmRhbnRzID8/IGZhbHNlLFxuICAgIHJlYWQ6IGRlY2xhcmF0aW9uLnJlYWQgPyBuZXcgV3JhcHBlZE5vZGVFeHByKGRlY2xhcmF0aW9uLnJlYWQpIDogbnVsbCxcbiAgICBzdGF0aWM6IGRlY2xhcmF0aW9uLnN0YXRpYyA/PyBmYWxzZSxcbiAgICBlbWl0RGlzdGluY3RDaGFuZ2VzT25seTogZGVjbGFyYXRpb24uZW1pdERpc3RpbmN0Q2hhbmdlc09ubHkgPz8gdHJ1ZSxcbiAgfTtcbn1cblxuZnVuY3Rpb24gY29udmVydERpcmVjdGl2ZUZhY2FkZVRvTWV0YWRhdGEoZmFjYWRlOiBSM0RpcmVjdGl2ZU1ldGFkYXRhRmFjYWRlKTogUjNEaXJlY3RpdmVNZXRhZGF0YSB7XG4gIGNvbnN0IGlucHV0c0Zyb21NZXRhZGF0YSA9IHBhcnNlSW5wdXRPdXRwdXRzKGZhY2FkZS5pbnB1dHMgfHwgW10pO1xuICBjb25zdCBvdXRwdXRzRnJvbU1ldGFkYXRhID0gcGFyc2VJbnB1dE91dHB1dHMoZmFjYWRlLm91dHB1dHMgfHwgW10pO1xuICBjb25zdCBwcm9wTWV0YWRhdGEgPSBmYWNhZGUucHJvcE1ldGFkYXRhO1xuICBjb25zdCBpbnB1dHNGcm9tVHlwZTogU3RyaW5nTWFwV2l0aFJlbmFtZSA9IHt9O1xuICBjb25zdCBvdXRwdXRzRnJvbVR5cGU6IFN0cmluZ01hcCA9IHt9O1xuICBmb3IgKGNvbnN0IGZpZWxkIGluIHByb3BNZXRhZGF0YSkge1xuICAgIGlmIChwcm9wTWV0YWRhdGEuaGFzT3duUHJvcGVydHkoZmllbGQpKSB7XG4gICAgICBwcm9wTWV0YWRhdGFbZmllbGRdLmZvckVhY2goYW5uID0+IHtcbiAgICAgICAgaWYgKGlzSW5wdXQoYW5uKSkge1xuICAgICAgICAgIGlucHV0c0Zyb21UeXBlW2ZpZWxkXSA9XG4gICAgICAgICAgICAgIGFubi5iaW5kaW5nUHJvcGVydHlOYW1lID8gW2Fubi5iaW5kaW5nUHJvcGVydHlOYW1lLCBmaWVsZF0gOiBmaWVsZDtcbiAgICAgICAgfSBlbHNlIGlmIChpc091dHB1dChhbm4pKSB7XG4gICAgICAgICAgb3V0cHV0c0Zyb21UeXBlW2ZpZWxkXSA9IGFubi5iaW5kaW5nUHJvcGVydHlOYW1lIHx8IGZpZWxkO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4ge1xuICAgIC4uLmZhY2FkZSBhcyBSM0RpcmVjdGl2ZU1ldGFkYXRhRmFjYWRlTm9Qcm9wQW5kV2hpdGVzcGFjZSxcbiAgICB0eXBlQXJndW1lbnRDb3VudDogMCxcbiAgICB0eXBlU291cmNlU3BhbjogZmFjYWRlLnR5cGVTb3VyY2VTcGFuLFxuICAgIHR5cGU6IHdyYXBSZWZlcmVuY2UoZmFjYWRlLnR5cGUpLFxuICAgIGludGVybmFsVHlwZTogbmV3IFdyYXBwZWROb2RlRXhwcihmYWNhZGUudHlwZSksXG4gICAgZGVwczogbnVsbCxcbiAgICBob3N0OiBleHRyYWN0SG9zdEJpbmRpbmdzKGZhY2FkZS5wcm9wTWV0YWRhdGEsIGZhY2FkZS50eXBlU291cmNlU3BhbiwgZmFjYWRlLmhvc3QpLFxuICAgIGlucHV0czogey4uLmlucHV0c0Zyb21NZXRhZGF0YSwgLi4uaW5wdXRzRnJvbVR5cGV9LFxuICAgIG91dHB1dHM6IHsuLi5vdXRwdXRzRnJvbU1ldGFkYXRhLCAuLi5vdXRwdXRzRnJvbVR5cGV9LFxuICAgIHF1ZXJpZXM6IGZhY2FkZS5xdWVyaWVzLm1hcChjb252ZXJ0VG9SM1F1ZXJ5TWV0YWRhdGEpLFxuICAgIHByb3ZpZGVyczogZmFjYWRlLnByb3ZpZGVycyAhPSBudWxsID8gbmV3IFdyYXBwZWROb2RlRXhwcihmYWNhZGUucHJvdmlkZXJzKSA6IG51bGwsXG4gICAgdmlld1F1ZXJpZXM6IGZhY2FkZS52aWV3UXVlcmllcy5tYXAoY29udmVydFRvUjNRdWVyeU1ldGFkYXRhKSxcbiAgICBmdWxsSW5oZXJpdGFuY2U6IGZhbHNlLFxuICB9O1xufVxuXG5mdW5jdGlvbiBjb252ZXJ0RGVjbGFyZURpcmVjdGl2ZUZhY2FkZVRvTWV0YWRhdGEoXG4gICAgZGVjbGFyYXRpb246IFIzRGVjbGFyZURpcmVjdGl2ZUZhY2FkZSwgdHlwZVNvdXJjZVNwYW46IFBhcnNlU291cmNlU3Bhbik6IFIzRGlyZWN0aXZlTWV0YWRhdGEge1xuICByZXR1cm4ge1xuICAgIG5hbWU6IGRlY2xhcmF0aW9uLnR5cGUubmFtZSxcbiAgICB0eXBlOiB3cmFwUmVmZXJlbmNlKGRlY2xhcmF0aW9uLnR5cGUpLFxuICAgIHR5cGVTb3VyY2VTcGFuLFxuICAgIGludGVybmFsVHlwZTogbmV3IFdyYXBwZWROb2RlRXhwcihkZWNsYXJhdGlvbi50eXBlKSxcbiAgICBzZWxlY3RvcjogZGVjbGFyYXRpb24uc2VsZWN0b3IgPz8gbnVsbCxcbiAgICBpbnB1dHM6IGRlY2xhcmF0aW9uLmlucHV0cyA/PyB7fSxcbiAgICBvdXRwdXRzOiBkZWNsYXJhdGlvbi5vdXRwdXRzID8/IHt9LFxuICAgIGhvc3Q6IGNvbnZlcnRIb3N0RGVjbGFyYXRpb25Ub01ldGFkYXRhKGRlY2xhcmF0aW9uLmhvc3QpLFxuICAgIHF1ZXJpZXM6IChkZWNsYXJhdGlvbi5xdWVyaWVzID8/IFtdKS5tYXAoY29udmVydFF1ZXJ5RGVjbGFyYXRpb25Ub01ldGFkYXRhKSxcbiAgICB2aWV3UXVlcmllczogKGRlY2xhcmF0aW9uLnZpZXdRdWVyaWVzID8/IFtdKS5tYXAoY29udmVydFF1ZXJ5RGVjbGFyYXRpb25Ub01ldGFkYXRhKSxcbiAgICBwcm92aWRlcnM6IGRlY2xhcmF0aW9uLnByb3ZpZGVycyAhPT0gdW5kZWZpbmVkID8gbmV3IFdyYXBwZWROb2RlRXhwcihkZWNsYXJhdGlvbi5wcm92aWRlcnMpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICBleHBvcnRBczogZGVjbGFyYXRpb24uZXhwb3J0QXMgPz8gbnVsbCxcbiAgICB1c2VzSW5oZXJpdGFuY2U6IGRlY2xhcmF0aW9uLnVzZXNJbmhlcml0YW5jZSA/PyBmYWxzZSxcbiAgICBsaWZlY3ljbGU6IHt1c2VzT25DaGFuZ2VzOiBkZWNsYXJhdGlvbi51c2VzT25DaGFuZ2VzID8/IGZhbHNlfSxcbiAgICBkZXBzOiBudWxsLFxuICAgIHR5cGVBcmd1bWVudENvdW50OiAwLFxuICAgIGZ1bGxJbmhlcml0YW5jZTogZmFsc2UsXG4gIH07XG59XG5cbmZ1bmN0aW9uIGNvbnZlcnRIb3N0RGVjbGFyYXRpb25Ub01ldGFkYXRhKGhvc3Q6IFIzRGVjbGFyZURpcmVjdGl2ZUZhY2FkZVsnaG9zdCddID0ge30pOlxuICAgIFIzSG9zdE1ldGFkYXRhIHtcbiAgcmV0dXJuIHtcbiAgICBhdHRyaWJ1dGVzOiBjb252ZXJ0T3BhcXVlVmFsdWVzVG9FeHByZXNzaW9ucyhob3N0LmF0dHJpYnV0ZXMgPz8ge30pLFxuICAgIGxpc3RlbmVyczogaG9zdC5saXN0ZW5lcnMgPz8ge30sXG4gICAgcHJvcGVydGllczogaG9zdC5wcm9wZXJ0aWVzID8/IHt9LFxuICAgIHNwZWNpYWxBdHRyaWJ1dGVzOiB7XG4gICAgICBjbGFzc0F0dHI6IGhvc3QuY2xhc3NBdHRyaWJ1dGUsXG4gICAgICBzdHlsZUF0dHI6IGhvc3Quc3R5bGVBdHRyaWJ1dGUsXG4gICAgfSxcbiAgfTtcbn1cblxuZnVuY3Rpb24gY29udmVydE9wYXF1ZVZhbHVlc1RvRXhwcmVzc2lvbnMob2JqOiB7W2tleTogc3RyaW5nXTogT3BhcXVlVmFsdWV9KTpcbiAgICB7W2tleTogc3RyaW5nXTogV3JhcHBlZE5vZGVFeHByPHVua25vd24+fSB7XG4gIGNvbnN0IHJlc3VsdDoge1trZXk6IHN0cmluZ106IFdyYXBwZWROb2RlRXhwcjx1bmtub3duPn0gPSB7fTtcbiAgZm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXMob2JqKSkge1xuICAgIHJlc3VsdFtrZXldID0gbmV3IFdyYXBwZWROb2RlRXhwcihvYmpba2V5XSk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZnVuY3Rpb24gY29udmVydERlY2xhcmVDb21wb25lbnRGYWNhZGVUb01ldGFkYXRhKFxuICAgIGRlY2xhcmF0aW9uOiBSM0RlY2xhcmVDb21wb25lbnRGYWNhZGUsIHR5cGVTb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgc291cmNlTWFwVXJsOiBzdHJpbmcpOiBSM0NvbXBvbmVudE1ldGFkYXRhIHtcbiAgY29uc3Qge3RlbXBsYXRlLCBpbnRlcnBvbGF0aW9ufSA9IHBhcnNlSml0VGVtcGxhdGUoXG4gICAgICBkZWNsYXJhdGlvbi50ZW1wbGF0ZSwgZGVjbGFyYXRpb24udHlwZS5uYW1lLCBzb3VyY2VNYXBVcmwsXG4gICAgICBkZWNsYXJhdGlvbi5wcmVzZXJ2ZVdoaXRlc3BhY2VzID8/IGZhbHNlLCBkZWNsYXJhdGlvbi5pbnRlcnBvbGF0aW9uKTtcblxuICByZXR1cm4ge1xuICAgIC4uLmNvbnZlcnREZWNsYXJlRGlyZWN0aXZlRmFjYWRlVG9NZXRhZGF0YShkZWNsYXJhdGlvbiwgdHlwZVNvdXJjZVNwYW4pLFxuICAgIHRlbXBsYXRlLFxuICAgIHN0eWxlczogZGVjbGFyYXRpb24uc3R5bGVzID8/IFtdLFxuICAgIGRpcmVjdGl2ZXM6IChkZWNsYXJhdGlvbi5jb21wb25lbnRzID8/IFtdKVxuICAgICAgICAgICAgICAgICAgICAuY29uY2F0KGRlY2xhcmF0aW9uLmRpcmVjdGl2ZXMgPz8gW10pXG4gICAgICAgICAgICAgICAgICAgIC5tYXAoY29udmVydFVzZWREaXJlY3RpdmVEZWNsYXJhdGlvblRvTWV0YWRhdGEpLFxuICAgIHBpcGVzOiBjb252ZXJ0VXNlZFBpcGVzVG9NZXRhZGF0YShkZWNsYXJhdGlvbi5waXBlcyksXG4gICAgdmlld1Byb3ZpZGVyczogZGVjbGFyYXRpb24udmlld1Byb3ZpZGVycyAhPT0gdW5kZWZpbmVkID9cbiAgICAgICAgbmV3IFdyYXBwZWROb2RlRXhwcihkZWNsYXJhdGlvbi52aWV3UHJvdmlkZXJzKSA6XG4gICAgICAgIG51bGwsXG4gICAgYW5pbWF0aW9uczogZGVjbGFyYXRpb24uYW5pbWF0aW9ucyAhPT0gdW5kZWZpbmVkID8gbmV3IFdyYXBwZWROb2RlRXhwcihkZWNsYXJhdGlvbi5hbmltYXRpb25zKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICBjaGFuZ2VEZXRlY3Rpb246IGRlY2xhcmF0aW9uLmNoYW5nZURldGVjdGlvbiA/PyBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5EZWZhdWx0LFxuICAgIGVuY2Fwc3VsYXRpb246IGRlY2xhcmF0aW9uLmVuY2Fwc3VsYXRpb24gPz8gVmlld0VuY2Fwc3VsYXRpb24uRW11bGF0ZWQsXG4gICAgaW50ZXJwb2xhdGlvbixcbiAgICBkZWNsYXJhdGlvbkxpc3RFbWl0TW9kZTogRGVjbGFyYXRpb25MaXN0RW1pdE1vZGUuQ2xvc3VyZVJlc29sdmVkLFxuICAgIHJlbGF0aXZlQ29udGV4dEZpbGVQYXRoOiAnJyxcbiAgICBpMThuVXNlRXh0ZXJuYWxJZHM6IHRydWUsXG4gIH07XG59XG5cbmZ1bmN0aW9uIGNvbnZlcnRVc2VkRGlyZWN0aXZlRGVjbGFyYXRpb25Ub01ldGFkYXRhKGRlY2xhcmF0aW9uOiBSM0RlY2xhcmVVc2VkRGlyZWN0aXZlRmFjYWRlKTpcbiAgICBSM1VzZWREaXJlY3RpdmVNZXRhZGF0YSB7XG4gIHJldHVybiB7XG4gICAgc2VsZWN0b3I6IGRlY2xhcmF0aW9uLnNlbGVjdG9yLFxuICAgIHR5cGU6IG5ldyBXcmFwcGVkTm9kZUV4cHIoZGVjbGFyYXRpb24udHlwZSksXG4gICAgaW5wdXRzOiBkZWNsYXJhdGlvbi5pbnB1dHMgPz8gW10sXG4gICAgb3V0cHV0czogZGVjbGFyYXRpb24ub3V0cHV0cyA/PyBbXSxcbiAgICBleHBvcnRBczogZGVjbGFyYXRpb24uZXhwb3J0QXMgPz8gbnVsbCxcbiAgfTtcbn1cblxuZnVuY3Rpb24gY29udmVydFVzZWRQaXBlc1RvTWV0YWRhdGEoZGVjbGFyZWRQaXBlczogUjNEZWNsYXJlQ29tcG9uZW50RmFjYWRlWydwaXBlcyddKTpcbiAgICBNYXA8c3RyaW5nLCBFeHByZXNzaW9uPiB7XG4gIGNvbnN0IHBpcGVzID0gbmV3IE1hcDxzdHJpbmcsIEV4cHJlc3Npb24+KCk7XG4gIGlmIChkZWNsYXJlZFBpcGVzID09PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gcGlwZXM7XG4gIH1cblxuICBmb3IgKGNvbnN0IHBpcGVOYW1lIG9mIE9iamVjdC5rZXlzKGRlY2xhcmVkUGlwZXMpKSB7XG4gICAgY29uc3QgcGlwZVR5cGUgPSBkZWNsYXJlZFBpcGVzW3BpcGVOYW1lXTtcbiAgICBwaXBlcy5zZXQocGlwZU5hbWUsIG5ldyBXcmFwcGVkTm9kZUV4cHIocGlwZVR5cGUpKTtcbiAgfVxuICByZXR1cm4gcGlwZXM7XG59XG5cbmZ1bmN0aW9uIHBhcnNlSml0VGVtcGxhdGUoXG4gICAgdGVtcGxhdGU6IHN0cmluZywgdHlwZU5hbWU6IHN0cmluZywgc291cmNlTWFwVXJsOiBzdHJpbmcsIHByZXNlcnZlV2hpdGVzcGFjZXM6IGJvb2xlYW4sXG4gICAgaW50ZXJwb2xhdGlvbjogW3N0cmluZywgc3RyaW5nXXx1bmRlZmluZWQpIHtcbiAgY29uc3QgaW50ZXJwb2xhdGlvbkNvbmZpZyA9XG4gICAgICBpbnRlcnBvbGF0aW9uID8gSW50ZXJwb2xhdGlvbkNvbmZpZy5mcm9tQXJyYXkoaW50ZXJwb2xhdGlvbikgOiBERUZBVUxUX0lOVEVSUE9MQVRJT05fQ09ORklHO1xuICAvLyBQYXJzZSB0aGUgdGVtcGxhdGUgYW5kIGNoZWNrIGZvciBlcnJvcnMuXG4gIGNvbnN0IHBhcnNlZCA9IHBhcnNlVGVtcGxhdGUoXG4gICAgICB0ZW1wbGF0ZSwgc291cmNlTWFwVXJsLCB7cHJlc2VydmVXaGl0ZXNwYWNlczogcHJlc2VydmVXaGl0ZXNwYWNlcywgaW50ZXJwb2xhdGlvbkNvbmZpZ30pO1xuICBpZiAocGFyc2VkLmVycm9ycyAhPT0gbnVsbCkge1xuICAgIGNvbnN0IGVycm9ycyA9IHBhcnNlZC5lcnJvcnMubWFwKGVyciA9PiBlcnIudG9TdHJpbmcoKSkuam9pbignLCAnKTtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEVycm9ycyBkdXJpbmcgSklUIGNvbXBpbGF0aW9uIG9mIHRlbXBsYXRlIGZvciAke3R5cGVOYW1lfTogJHtlcnJvcnN9YCk7XG4gIH1cbiAgcmV0dXJuIHt0ZW1wbGF0ZTogcGFyc2VkLCBpbnRlcnBvbGF0aW9uOiBpbnRlcnBvbGF0aW9uQ29uZmlnfTtcbn1cblxuLy8gVGhpcyBzZWVtcyB0byBiZSBuZWVkZWQgdG8gcGxhY2F0ZSBUUyB2My4wIG9ubHlcbnR5cGUgUjNEaXJlY3RpdmVNZXRhZGF0YUZhY2FkZU5vUHJvcEFuZFdoaXRlc3BhY2UgPVxuICAgIFBpY2s8UjNEaXJlY3RpdmVNZXRhZGF0YUZhY2FkZSwgRXhjbHVkZTxrZXlvZiBSM0RpcmVjdGl2ZU1ldGFkYXRhRmFjYWRlLCAncHJvcE1ldGFkYXRhJz4+O1xuXG4vKipcbiAqIENvbnZlcnQgdGhlIGV4cHJlc3Npb24sIGlmIHByZXNlbnQgdG8gYW4gYFIzUHJvdmlkZXJFeHByZXNzaW9uYC5cbiAqXG4gKiBJbiBKSVQgbW9kZSB3ZSBkbyBub3Qgd2FudCB0aGUgY29tcGlsZXIgdG8gd3JhcCB0aGUgZXhwcmVzc2lvbiBpbiBhIGBmb3J3YXJkUmVmKClgIGNhbGwgYmVjYXVzZSxcbiAqIGlmIGl0IGlzIHJlZmVyZW5jaW5nIGEgdHlwZSB0aGF0IGhhcyBub3QgeWV0IGJlZW4gZGVmaW5lZCwgaXQgd2lsbCBoYXZlIGFscmVhZHkgYmVlbiB3cmFwcGVkIGluXG4gKiBhIGBmb3J3YXJkUmVmKClgIC0gZWl0aGVyIGJ5IHRoZSBhcHBsaWNhdGlvbiBkZXZlbG9wZXIgb3IgZHVyaW5nIHBhcnRpYWwtY29tcGlsYXRpb24uIFRodXMgd2UgY2FuXG4gKiBzZXQgYGlzRm9yd2FyZFJlZmAgdG8gYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gY29udmVydFRvUHJvdmlkZXJFeHByZXNzaW9uKG9iajogYW55LCBwcm9wZXJ0eTogc3RyaW5nKTogUjNQcm92aWRlckV4cHJlc3Npb258dW5kZWZpbmVkIHtcbiAgaWYgKG9iai5oYXNPd25Qcm9wZXJ0eShwcm9wZXJ0eSkpIHtcbiAgICByZXR1cm4gY3JlYXRlUjNQcm92aWRlckV4cHJlc3Npb24obmV3IFdyYXBwZWROb2RlRXhwcihvYmpbcHJvcGVydHldKSwgLyogaXNGb3J3YXJkUmVmICovIGZhbHNlKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG59XG5cbmZ1bmN0aW9uIHdyYXBFeHByZXNzaW9uKG9iajogYW55LCBwcm9wZXJ0eTogc3RyaW5nKTogV3JhcHBlZE5vZGVFeHByPGFueT58dW5kZWZpbmVkIHtcbiAgaWYgKG9iai5oYXNPd25Qcm9wZXJ0eShwcm9wZXJ0eSkpIHtcbiAgICByZXR1cm4gbmV3IFdyYXBwZWROb2RlRXhwcihvYmpbcHJvcGVydHldKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNvbXB1dGVQcm92aWRlZEluKHByb3ZpZGVkSW46IEZ1bmN0aW9ufHN0cmluZ3xudWxsfHVuZGVmaW5lZCk6IFIzUHJvdmlkZXJFeHByZXNzaW9uIHtcbiAgY29uc3QgZXhwcmVzc2lvbiA9IChwcm92aWRlZEluID09IG51bGwgfHwgdHlwZW9mIHByb3ZpZGVkSW4gPT09ICdzdHJpbmcnKSA/XG4gICAgICBuZXcgTGl0ZXJhbEV4cHIocHJvdmlkZWRJbiA/PyBudWxsKSA6XG4gICAgICBuZXcgV3JhcHBlZE5vZGVFeHByKHByb3ZpZGVkSW4pO1xuICAvLyBTZWUgYGNvbnZlcnRUb1Byb3ZpZGVyRXhwcmVzc2lvbigpYCBmb3Igd2h5IGBpc0ZvcndhcmRSZWZgIGlzIGZhbHNlLlxuICByZXR1cm4gY3JlYXRlUjNQcm92aWRlckV4cHJlc3Npb24oZXhwcmVzc2lvbiwgLyogaXNGb3J3YXJkUmVmICovIGZhbHNlKTtcbn1cblxuZnVuY3Rpb24gY29udmVydFIzRGVwZW5kZW5jeU1ldGFkYXRhQXJyYXkoZmFjYWRlczogUjNEZXBlbmRlbmN5TWV0YWRhdGFGYWNhZGVbXXxudWxsfFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdW5kZWZpbmVkKTogUjNEZXBlbmRlbmN5TWV0YWRhdGFbXXxudWxsIHtcbiAgcmV0dXJuIGZhY2FkZXMgPT0gbnVsbCA/IG51bGwgOiBmYWNhZGVzLm1hcChjb252ZXJ0UjNEZXBlbmRlbmN5TWV0YWRhdGEpO1xufVxuXG5mdW5jdGlvbiBjb252ZXJ0UjNEZXBlbmRlbmN5TWV0YWRhdGEoZmFjYWRlOiBSM0RlcGVuZGVuY3lNZXRhZGF0YUZhY2FkZSk6IFIzRGVwZW5kZW5jeU1ldGFkYXRhIHtcbiAgY29uc3QgaXNBdHRyaWJ1dGVEZXAgPSBmYWNhZGUuYXR0cmlidXRlICE9IG51bGw7ICAvLyBib3RoIGBudWxsYCBhbmQgYHVuZGVmaW5lZGBcbiAgY29uc3QgcmF3VG9rZW4gPSBmYWNhZGUudG9rZW4gPT09IG51bGwgPyBudWxsIDogbmV3IFdyYXBwZWROb2RlRXhwcihmYWNhZGUudG9rZW4pO1xuICAvLyBJbiBKSVQgbW9kZSwgaWYgdGhlIGRlcCBpcyBhbiBgQEF0dHJpYnV0ZSgpYCB0aGVuIHdlIHVzZSB0aGUgYXR0cmlidXRlIG5hbWUgZ2l2ZW4gaW5cbiAgLy8gYGF0dHJpYnV0ZWAgcmF0aGVyIHRoYW4gdGhlIGB0b2tlbmAuXG4gIGNvbnN0IHRva2VuID0gaXNBdHRyaWJ1dGVEZXAgPyBuZXcgV3JhcHBlZE5vZGVFeHByKGZhY2FkZS5hdHRyaWJ1dGUpIDogcmF3VG9rZW47XG4gIHJldHVybiBjcmVhdGVSM0RlcGVuZGVuY3lNZXRhZGF0YShcbiAgICAgIHRva2VuLCBpc0F0dHJpYnV0ZURlcCwgZmFjYWRlLmhvc3QsIGZhY2FkZS5vcHRpb25hbCwgZmFjYWRlLnNlbGYsIGZhY2FkZS5za2lwU2VsZik7XG59XG5cbmZ1bmN0aW9uIGNvbnZlcnRSM0RlY2xhcmVEZXBlbmRlbmN5TWV0YWRhdGEoZmFjYWRlOiBSM0RlY2xhcmVEZXBlbmRlbmN5TWV0YWRhdGFGYWNhZGUpOlxuICAgIFIzRGVwZW5kZW5jeU1ldGFkYXRhIHtcbiAgY29uc3QgaXNBdHRyaWJ1dGVEZXAgPSBmYWNhZGUuYXR0cmlidXRlID8/IGZhbHNlO1xuICBjb25zdCB0b2tlbiA9IGZhY2FkZS50b2tlbiA9PT0gbnVsbCA/IG51bGwgOiBuZXcgV3JhcHBlZE5vZGVFeHByKGZhY2FkZS50b2tlbik7XG4gIHJldHVybiBjcmVhdGVSM0RlcGVuZGVuY3lNZXRhZGF0YShcbiAgICAgIHRva2VuLCBpc0F0dHJpYnV0ZURlcCwgZmFjYWRlLmhvc3QgPz8gZmFsc2UsIGZhY2FkZS5vcHRpb25hbCA/PyBmYWxzZSwgZmFjYWRlLnNlbGYgPz8gZmFsc2UsXG4gICAgICBmYWNhZGUuc2tpcFNlbGYgPz8gZmFsc2UpO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVSM0RlcGVuZGVuY3lNZXRhZGF0YShcbiAgICB0b2tlbjogV3JhcHBlZE5vZGVFeHByPHVua25vd24+fG51bGwsIGlzQXR0cmlidXRlRGVwOiBib29sZWFuLCBob3N0OiBib29sZWFuLCBvcHRpb25hbDogYm9vbGVhbixcbiAgICBzZWxmOiBib29sZWFuLCBza2lwU2VsZjogYm9vbGVhbik6IFIzRGVwZW5kZW5jeU1ldGFkYXRhIHtcbiAgLy8gSWYgdGhlIGRlcCBpcyBhbiBgQEF0dHJpYnV0ZSgpYCB0aGUgYGF0dHJpYnV0ZU5hbWVUeXBlYCBvdWdodCB0byBiZSB0aGUgYHVua25vd25gIHR5cGUuXG4gIC8vIEJ1dCB0eXBlcyBhcmUgbm90IGF2YWlsYWJsZSBhdCBydW50aW1lIHNvIHdlIGp1c3QgdXNlIGEgbGl0ZXJhbCBgXCI8dW5rbm93bj5cImAgc3RyaW5nIGFzIGEgZHVtbXlcbiAgLy8gbWFya2VyLlxuICBjb25zdCBhdHRyaWJ1dGVOYW1lVHlwZSA9IGlzQXR0cmlidXRlRGVwID8gbGl0ZXJhbCgndW5rbm93bicpIDogbnVsbDtcbiAgcmV0dXJuIHt0b2tlbiwgYXR0cmlidXRlTmFtZVR5cGUsIGhvc3QsIG9wdGlvbmFsLCBzZWxmLCBza2lwU2VsZn07XG59XG5cbmZ1bmN0aW9uIGV4dHJhY3RIb3N0QmluZGluZ3MoXG4gICAgcHJvcE1ldGFkYXRhOiB7W2tleTogc3RyaW5nXTogYW55W119LCBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgaG9zdD86IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9KTogUGFyc2VkSG9zdEJpbmRpbmdzIHtcbiAgLy8gRmlyc3QgcGFyc2UgdGhlIGRlY2xhcmF0aW9ucyBmcm9tIHRoZSBtZXRhZGF0YS5cbiAgY29uc3QgYmluZGluZ3MgPSBwYXJzZUhvc3RCaW5kaW5ncyhob3N0IHx8IHt9KTtcblxuICAvLyBBZnRlciB0aGF0IGNoZWNrIGhvc3QgYmluZGluZ3MgZm9yIGVycm9yc1xuICBjb25zdCBlcnJvcnMgPSB2ZXJpZnlIb3N0QmluZGluZ3MoYmluZGluZ3MsIHNvdXJjZVNwYW4pO1xuICBpZiAoZXJyb3JzLmxlbmd0aCkge1xuICAgIHRocm93IG5ldyBFcnJvcihlcnJvcnMubWFwKChlcnJvcjogUGFyc2VFcnJvcikgPT4gZXJyb3IubXNnKS5qb2luKCdcXG4nKSk7XG4gIH1cblxuICAvLyBOZXh0LCBsb29wIG92ZXIgdGhlIHByb3BlcnRpZXMgb2YgdGhlIG9iamVjdCwgbG9va2luZyBmb3IgQEhvc3RCaW5kaW5nIGFuZCBASG9zdExpc3RlbmVyLlxuICBmb3IgKGNvbnN0IGZpZWxkIGluIHByb3BNZXRhZGF0YSkge1xuICAgIGlmIChwcm9wTWV0YWRhdGEuaGFzT3duUHJvcGVydHkoZmllbGQpKSB7XG4gICAgICBwcm9wTWV0YWRhdGFbZmllbGRdLmZvckVhY2goYW5uID0+IHtcbiAgICAgICAgaWYgKGlzSG9zdEJpbmRpbmcoYW5uKSkge1xuICAgICAgICAgIC8vIFNpbmNlIHRoaXMgaXMgYSBkZWNvcmF0b3IsIHdlIGtub3cgdGhhdCB0aGUgdmFsdWUgaXMgYSBjbGFzcyBtZW1iZXIuIEFsd2F5cyBhY2Nlc3MgaXRcbiAgICAgICAgICAvLyB0aHJvdWdoIGB0aGlzYCBzbyB0aGF0IGZ1cnRoZXIgZG93biB0aGUgbGluZSBpdCBjYW4ndCBiZSBjb25mdXNlZCBmb3IgYSBsaXRlcmFsIHZhbHVlXG4gICAgICAgICAgLy8gKGUuZy4gaWYgdGhlcmUncyBhIHByb3BlcnR5IGNhbGxlZCBgdHJ1ZWApLlxuICAgICAgICAgIGJpbmRpbmdzLnByb3BlcnRpZXNbYW5uLmhvc3RQcm9wZXJ0eU5hbWUgfHwgZmllbGRdID1cbiAgICAgICAgICAgICAgZ2V0U2FmZVByb3BlcnR5QWNjZXNzU3RyaW5nKCd0aGlzJywgZmllbGQpO1xuICAgICAgICB9IGVsc2UgaWYgKGlzSG9zdExpc3RlbmVyKGFubikpIHtcbiAgICAgICAgICBiaW5kaW5ncy5saXN0ZW5lcnNbYW5uLmV2ZW50TmFtZSB8fCBmaWVsZF0gPSBgJHtmaWVsZH0oJHsoYW5uLmFyZ3MgfHwgW10pLmpvaW4oJywnKX0pYDtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGJpbmRpbmdzO1xufVxuXG5mdW5jdGlvbiBpc0hvc3RCaW5kaW5nKHZhbHVlOiBhbnkpOiB2YWx1ZSBpcyBIb3N0QmluZGluZyB7XG4gIHJldHVybiB2YWx1ZS5uZ01ldGFkYXRhTmFtZSA9PT0gJ0hvc3RCaW5kaW5nJztcbn1cblxuZnVuY3Rpb24gaXNIb3N0TGlzdGVuZXIodmFsdWU6IGFueSk6IHZhbHVlIGlzIEhvc3RMaXN0ZW5lciB7XG4gIHJldHVybiB2YWx1ZS5uZ01ldGFkYXRhTmFtZSA9PT0gJ0hvc3RMaXN0ZW5lcic7XG59XG5cblxuZnVuY3Rpb24gaXNJbnB1dCh2YWx1ZTogYW55KTogdmFsdWUgaXMgSW5wdXQge1xuICByZXR1cm4gdmFsdWUubmdNZXRhZGF0YU5hbWUgPT09ICdJbnB1dCc7XG59XG5cbmZ1bmN0aW9uIGlzT3V0cHV0KHZhbHVlOiBhbnkpOiB2YWx1ZSBpcyBPdXRwdXQge1xuICByZXR1cm4gdmFsdWUubmdNZXRhZGF0YU5hbWUgPT09ICdPdXRwdXQnO1xufVxuXG5mdW5jdGlvbiBwYXJzZUlucHV0T3V0cHV0cyh2YWx1ZXM6IHN0cmluZ1tdKTogU3RyaW5nTWFwIHtcbiAgcmV0dXJuIHZhbHVlcy5yZWR1Y2UoKG1hcCwgdmFsdWUpID0+IHtcbiAgICBjb25zdCBbZmllbGQsIHByb3BlcnR5XSA9IHZhbHVlLnNwbGl0KCcsJykubWFwKHBpZWNlID0+IHBpZWNlLnRyaW0oKSk7XG4gICAgbWFwW2ZpZWxkXSA9IHByb3BlcnR5IHx8IGZpZWxkO1xuICAgIHJldHVybiBtYXA7XG4gIH0sIHt9IGFzIFN0cmluZ01hcCk7XG59XG5cbmZ1bmN0aW9uIGNvbnZlcnREZWNsYXJlUGlwZUZhY2FkZVRvTWV0YWRhdGEoZGVjbGFyYXRpb246IFIzRGVjbGFyZVBpcGVGYWNhZGUpOiBSM1BpcGVNZXRhZGF0YSB7XG4gIHJldHVybiB7XG4gICAgbmFtZTogZGVjbGFyYXRpb24udHlwZS5uYW1lLFxuICAgIHR5cGU6IHdyYXBSZWZlcmVuY2UoZGVjbGFyYXRpb24udHlwZSksXG4gICAgaW50ZXJuYWxUeXBlOiBuZXcgV3JhcHBlZE5vZGVFeHByKGRlY2xhcmF0aW9uLnR5cGUpLFxuICAgIHR5cGVBcmd1bWVudENvdW50OiAwLFxuICAgIHBpcGVOYW1lOiBkZWNsYXJhdGlvbi5uYW1lLFxuICAgIGRlcHM6IG51bGwsXG4gICAgcHVyZTogZGVjbGFyYXRpb24ucHVyZSA/PyB0cnVlLFxuICB9O1xufVxuXG5mdW5jdGlvbiBjb252ZXJ0RGVjbGFyZUluamVjdG9yRmFjYWRlVG9NZXRhZGF0YShkZWNsYXJhdGlvbjogUjNEZWNsYXJlSW5qZWN0b3JGYWNhZGUpOlxuICAgIFIzSW5qZWN0b3JNZXRhZGF0YSB7XG4gIHJldHVybiB7XG4gICAgbmFtZTogZGVjbGFyYXRpb24udHlwZS5uYW1lLFxuICAgIHR5cGU6IHdyYXBSZWZlcmVuY2UoZGVjbGFyYXRpb24udHlwZSksXG4gICAgaW50ZXJuYWxUeXBlOiBuZXcgV3JhcHBlZE5vZGVFeHByKGRlY2xhcmF0aW9uLnR5cGUpLFxuICAgIHByb3ZpZGVyczogZGVjbGFyYXRpb24ucHJvdmlkZXJzICE9PSB1bmRlZmluZWQgPyBuZXcgV3JhcHBlZE5vZGVFeHByKGRlY2xhcmF0aW9uLnByb3ZpZGVycykgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgIGltcG9ydHM6IGRlY2xhcmF0aW9uLmltcG9ydHMgIT09IHVuZGVmaW5lZCA/XG4gICAgICAgIGRlY2xhcmF0aW9uLmltcG9ydHMubWFwKGkgPT4gbmV3IFdyYXBwZWROb2RlRXhwcihpKSkgOlxuICAgICAgICBbXSxcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHB1Ymxpc2hGYWNhZGUoZ2xvYmFsOiBhbnkpIHtcbiAgY29uc3Qgbmc6IEV4cG9ydGVkQ29tcGlsZXJGYWNhZGUgPSBnbG9iYWwubmcgfHwgKGdsb2JhbC5uZyA9IHt9KTtcbiAgbmcuybVjb21waWxlckZhY2FkZSA9IG5ldyBDb21waWxlckZhY2FkZUltcGwoKTtcbn1cbiJdfQ==