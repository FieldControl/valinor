/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { getCompilerFacade, } from '../../compiler/compiler_facade';
import { resolveForwardRef } from '../../di/forward_ref';
import { NG_INJ_DEF } from '../../di/interface/defs';
import { reflectDependencies } from '../../di/jit/util';
import { registerNgModuleType } from '../../linker/ng_module_registration';
import { deepForEach, flatten } from '../../util/array_utils';
import { assertDefined } from '../../util/assert';
import { EMPTY_ARRAY } from '../../util/empty';
import { GENERATED_COMP_IDS, getComponentDef, getDirectiveDef, getNgModuleDef, getPipeDef, isStandalone, } from '../definition';
import { depsTracker, USE_RUNTIME_DEPS_TRACKER_FOR_JIT } from '../deps_tracker/deps_tracker';
import { NG_COMP_DEF, NG_DIR_DEF, NG_FACTORY_DEF, NG_MOD_DEF, NG_PIPE_DEF } from '../fields';
import { maybeUnwrapFn } from '../util/misc_utils';
import { stringifyForError } from '../util/stringify_utils';
import { angularCoreEnv } from './environment';
import { patchModuleCompilation } from './module_patch';
import { isModuleWithProviders, isNgModule } from './util';
const moduleQueue = [];
/**
 * Enqueues moduleDef to be checked later to see if scope can be set on its
 * component declarations.
 */
function enqueueModuleForDelayedScoping(moduleType, ngModule) {
    moduleQueue.push({ moduleType, ngModule });
}
let flushingModuleQueue = false;
/**
 * Loops over queued module definitions, if a given module definition has all of its
 * declarations resolved, it dequeues that module definition and sets the scope on
 * its declarations.
 */
export function flushModuleScopingQueueAsMuchAsPossible() {
    if (!flushingModuleQueue) {
        flushingModuleQueue = true;
        try {
            for (let i = moduleQueue.length - 1; i >= 0; i--) {
                const { moduleType, ngModule } = moduleQueue[i];
                if (ngModule.declarations && ngModule.declarations.every(isResolvedDeclaration)) {
                    // dequeue
                    moduleQueue.splice(i, 1);
                    setScopeOnDeclaredComponents(moduleType, ngModule);
                }
            }
        }
        finally {
            flushingModuleQueue = false;
        }
    }
}
/**
 * Returns truthy if a declaration has resolved. If the declaration happens to be
 * an array of declarations, it will recurse to check each declaration in that array
 * (which may also be arrays).
 */
function isResolvedDeclaration(declaration) {
    if (Array.isArray(declaration)) {
        return declaration.every(isResolvedDeclaration);
    }
    return !!resolveForwardRef(declaration);
}
/**
 * Compiles a module in JIT mode.
 *
 * This function automatically gets called when a class has a `@NgModule` decorator.
 */
export function compileNgModule(moduleType, ngModule = {}) {
    patchModuleCompilation();
    compileNgModuleDefs(moduleType, ngModule);
    if (ngModule.id !== undefined) {
        registerNgModuleType(moduleType, ngModule.id);
    }
    // Because we don't know if all declarations have resolved yet at the moment the
    // NgModule decorator is executing, we're enqueueing the setting of module scope
    // on its declarations to be run at a later time when all declarations for the module,
    // including forward refs, have resolved.
    enqueueModuleForDelayedScoping(moduleType, ngModule);
}
/**
 * Compiles and adds the `ɵmod`, `ɵfac` and `ɵinj` properties to the module class.
 *
 * It's possible to compile a module via this API which will allow duplicate declarations in its
 * root.
 */
export function compileNgModuleDefs(moduleType, ngModule, allowDuplicateDeclarationsInRoot = false) {
    ngDevMode && assertDefined(moduleType, 'Required value moduleType');
    ngDevMode && assertDefined(ngModule, 'Required value ngModule');
    const declarations = flatten(ngModule.declarations || EMPTY_ARRAY);
    let ngModuleDef = null;
    Object.defineProperty(moduleType, NG_MOD_DEF, {
        configurable: true,
        get: () => {
            if (ngModuleDef === null) {
                if (ngDevMode && ngModule.imports && ngModule.imports.indexOf(moduleType) > -1) {
                    // We need to assert this immediately, because allowing it to continue will cause it to
                    // go into an infinite loop before we've reached the point where we throw all the errors.
                    throw new Error(`'${stringifyForError(moduleType)}' module can't import itself`);
                }
                const compiler = getCompilerFacade({
                    usage: 0 /* JitCompilerUsage.Decorator */,
                    kind: 'NgModule',
                    type: moduleType,
                });
                ngModuleDef = compiler.compileNgModule(angularCoreEnv, `ng:///${moduleType.name}/ɵmod.js`, {
                    type: moduleType,
                    bootstrap: flatten(ngModule.bootstrap || EMPTY_ARRAY).map(resolveForwardRef),
                    declarations: declarations.map(resolveForwardRef),
                    imports: flatten(ngModule.imports || EMPTY_ARRAY)
                        .map(resolveForwardRef)
                        .map(expandModuleWithProviders),
                    exports: flatten(ngModule.exports || EMPTY_ARRAY)
                        .map(resolveForwardRef)
                        .map(expandModuleWithProviders),
                    schemas: ngModule.schemas ? flatten(ngModule.schemas) : null,
                    id: ngModule.id || null,
                });
                // Set `schemas` on ngModuleDef to an empty array in JIT mode to indicate that runtime
                // should verify that there are no unknown elements in a template. In AOT mode, that check
                // happens at compile time and `schemas` information is not present on Component and Module
                // defs after compilation (so the check doesn't happen the second time at runtime).
                if (!ngModuleDef.schemas) {
                    ngModuleDef.schemas = [];
                }
            }
            return ngModuleDef;
        },
    });
    let ngFactoryDef = null;
    Object.defineProperty(moduleType, NG_FACTORY_DEF, {
        get: () => {
            if (ngFactoryDef === null) {
                const compiler = getCompilerFacade({
                    usage: 0 /* JitCompilerUsage.Decorator */,
                    kind: 'NgModule',
                    type: moduleType,
                });
                ngFactoryDef = compiler.compileFactory(angularCoreEnv, `ng:///${moduleType.name}/ɵfac.js`, {
                    name: moduleType.name,
                    type: moduleType,
                    deps: reflectDependencies(moduleType),
                    target: compiler.FactoryTarget.NgModule,
                    typeArgumentCount: 0,
                });
            }
            return ngFactoryDef;
        },
        // Make the property configurable in dev mode to allow overriding in tests
        configurable: !!ngDevMode,
    });
    let ngInjectorDef = null;
    Object.defineProperty(moduleType, NG_INJ_DEF, {
        get: () => {
            if (ngInjectorDef === null) {
                ngDevMode && verifySemanticsOfNgModuleDef(moduleType, allowDuplicateDeclarationsInRoot);
                const meta = {
                    name: moduleType.name,
                    type: moduleType,
                    providers: ngModule.providers || EMPTY_ARRAY,
                    imports: [
                        (ngModule.imports || EMPTY_ARRAY).map(resolveForwardRef),
                        (ngModule.exports || EMPTY_ARRAY).map(resolveForwardRef),
                    ],
                };
                const compiler = getCompilerFacade({
                    usage: 0 /* JitCompilerUsage.Decorator */,
                    kind: 'NgModule',
                    type: moduleType,
                });
                ngInjectorDef = compiler.compileInjector(angularCoreEnv, `ng:///${moduleType.name}/ɵinj.js`, meta);
            }
            return ngInjectorDef;
        },
        // Make the property configurable in dev mode to allow overriding in tests
        configurable: !!ngDevMode,
    });
}
export function generateStandaloneInDeclarationsError(type, location) {
    const prefix = `Unexpected "${stringifyForError(type)}" found in the "declarations" array of the`;
    const suffix = `"${stringifyForError(type)}" is marked as standalone and can't be declared ` +
        'in any NgModule - did you intend to import it instead (by adding it to the "imports" array)?';
    return `${prefix} ${location}, ${suffix}`;
}
function verifySemanticsOfNgModuleDef(moduleType, allowDuplicateDeclarationsInRoot, importingModule) {
    if (verifiedNgModule.get(moduleType))
        return;
    // skip verifications of standalone components, directives, and pipes
    if (isStandalone(moduleType))
        return;
    verifiedNgModule.set(moduleType, true);
    moduleType = resolveForwardRef(moduleType);
    let ngModuleDef;
    if (importingModule) {
        ngModuleDef = getNgModuleDef(moduleType);
        if (!ngModuleDef) {
            throw new Error(`Unexpected value '${moduleType.name}' imported by the module '${importingModule.name}'. Please add an @NgModule annotation.`);
        }
    }
    else {
        ngModuleDef = getNgModuleDef(moduleType, true);
    }
    const errors = [];
    const declarations = maybeUnwrapFn(ngModuleDef.declarations);
    const imports = maybeUnwrapFn(ngModuleDef.imports);
    flatten(imports)
        .map(unwrapModuleWithProvidersImports)
        .forEach((modOrStandaloneCmpt) => {
        verifySemanticsOfNgModuleImport(modOrStandaloneCmpt, moduleType);
        verifySemanticsOfNgModuleDef(modOrStandaloneCmpt, false, moduleType);
    });
    const exports = maybeUnwrapFn(ngModuleDef.exports);
    declarations.forEach(verifyDeclarationsHaveDefinitions);
    declarations.forEach(verifyDirectivesHaveSelector);
    declarations.forEach((declarationType) => verifyNotStandalone(declarationType, moduleType));
    const combinedDeclarations = [
        ...declarations.map(resolveForwardRef),
        ...flatten(imports.map(computeCombinedExports)).map(resolveForwardRef),
    ];
    exports.forEach(verifyExportsAreDeclaredOrReExported);
    declarations.forEach((decl) => verifyDeclarationIsUnique(decl, allowDuplicateDeclarationsInRoot));
    const ngModule = getAnnotation(moduleType, 'NgModule');
    if (ngModule) {
        ngModule.imports &&
            flatten(ngModule.imports)
                .map(unwrapModuleWithProvidersImports)
                .forEach((mod) => {
                verifySemanticsOfNgModuleImport(mod, moduleType);
                verifySemanticsOfNgModuleDef(mod, false, moduleType);
            });
        ngModule.bootstrap && deepForEach(ngModule.bootstrap, verifyCorrectBootstrapType);
        ngModule.bootstrap && deepForEach(ngModule.bootstrap, verifyComponentIsPartOfNgModule);
    }
    // Throw Error if any errors were detected.
    if (errors.length) {
        throw new Error(errors.join('\n'));
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////
    function verifyDeclarationsHaveDefinitions(type) {
        type = resolveForwardRef(type);
        const def = getComponentDef(type) || getDirectiveDef(type) || getPipeDef(type);
        if (!def) {
            errors.push(`Unexpected value '${stringifyForError(type)}' declared by the module '${stringifyForError(moduleType)}'. Please add a @Pipe/@Directive/@Component annotation.`);
        }
    }
    function verifyDirectivesHaveSelector(type) {
        type = resolveForwardRef(type);
        const def = getDirectiveDef(type);
        if (!getComponentDef(type) && def && def.selectors.length == 0) {
            errors.push(`Directive ${stringifyForError(type)} has no selector, please add it!`);
        }
    }
    function verifyNotStandalone(type, moduleType) {
        type = resolveForwardRef(type);
        const def = getComponentDef(type) || getDirectiveDef(type) || getPipeDef(type);
        if (def?.standalone) {
            const location = `"${stringifyForError(moduleType)}" NgModule`;
            errors.push(generateStandaloneInDeclarationsError(type, location));
        }
    }
    function verifyExportsAreDeclaredOrReExported(type) {
        type = resolveForwardRef(type);
        const kind = (getComponentDef(type) && 'component') ||
            (getDirectiveDef(type) && 'directive') ||
            (getPipeDef(type) && 'pipe');
        if (kind) {
            // only checked if we are declared as Component, Directive, or Pipe
            // Modules don't need to be declared or imported.
            if (combinedDeclarations.lastIndexOf(type) === -1) {
                // We are exporting something which we don't explicitly declare or import.
                errors.push(`Can't export ${kind} ${stringifyForError(type)} from ${stringifyForError(moduleType)} as it was neither declared nor imported!`);
            }
        }
    }
    function verifyDeclarationIsUnique(type, suppressErrors) {
        type = resolveForwardRef(type);
        const existingModule = ownerNgModule.get(type);
        if (existingModule && existingModule !== moduleType) {
            if (!suppressErrors) {
                const modules = [existingModule, moduleType].map(stringifyForError).sort();
                errors.push(`Type ${stringifyForError(type)} is part of the declarations of 2 modules: ${modules[0]} and ${modules[1]}! ` +
                    `Please consider moving ${stringifyForError(type)} to a higher module that imports ${modules[0]} and ${modules[1]}. ` +
                    `You can also create a new NgModule that exports and includes ${stringifyForError(type)} then import that NgModule in ${modules[0]} and ${modules[1]}.`);
            }
        }
        else {
            // Mark type as having owner.
            ownerNgModule.set(type, moduleType);
        }
    }
    function verifyComponentIsPartOfNgModule(type) {
        type = resolveForwardRef(type);
        const existingModule = ownerNgModule.get(type);
        if (!existingModule && !isStandalone(type)) {
            errors.push(`Component ${stringifyForError(type)} is not part of any NgModule or the module has not been imported into your module.`);
        }
    }
    function verifyCorrectBootstrapType(type) {
        type = resolveForwardRef(type);
        if (!getComponentDef(type)) {
            errors.push(`${stringifyForError(type)} cannot be used as an entry component.`);
        }
        if (isStandalone(type)) {
            // Note: this error should be the same as the
            // `NGMODULE_BOOTSTRAP_IS_STANDALONE` one in AOT compiler.
            errors.push(`The \`${stringifyForError(type)}\` class is a standalone component, which can ` +
                `not be used in the \`@NgModule.bootstrap\` array. Use the \`bootstrapApplication\` ` +
                `function for bootstrap instead.`);
        }
    }
    function verifySemanticsOfNgModuleImport(type, importingModule) {
        type = resolveForwardRef(type);
        const directiveDef = getComponentDef(type) || getDirectiveDef(type);
        if (directiveDef !== null && !directiveDef.standalone) {
            throw new Error(`Unexpected directive '${type.name}' imported by the module '${importingModule.name}'. Please add an @NgModule annotation.`);
        }
        const pipeDef = getPipeDef(type);
        if (pipeDef !== null && !pipeDef.standalone) {
            throw new Error(`Unexpected pipe '${type.name}' imported by the module '${importingModule.name}'. Please add an @NgModule annotation.`);
        }
    }
}
function unwrapModuleWithProvidersImports(typeOrWithProviders) {
    typeOrWithProviders = resolveForwardRef(typeOrWithProviders);
    return typeOrWithProviders.ngModule || typeOrWithProviders;
}
function getAnnotation(type, name) {
    let annotation = null;
    collect(type.__annotations__);
    collect(type.decorators);
    return annotation;
    function collect(annotations) {
        if (annotations) {
            annotations.forEach(readAnnotation);
        }
    }
    function readAnnotation(decorator) {
        if (!annotation) {
            const proto = Object.getPrototypeOf(decorator);
            if (proto.ngMetadataName == name) {
                annotation = decorator;
            }
            else if (decorator.type) {
                const proto = Object.getPrototypeOf(decorator.type);
                if (proto.ngMetadataName == name) {
                    annotation = decorator.args[0];
                }
            }
        }
    }
}
/**
 * Keep track of compiled components. This is needed because in tests we often want to compile the
 * same component with more than one NgModule. This would cause an error unless we reset which
 * NgModule the component belongs to. We keep the list of compiled components here so that the
 * TestBed can reset it later.
 */
let ownerNgModule = new WeakMap();
let verifiedNgModule = new WeakMap();
export function resetCompiledComponents() {
    ownerNgModule = new WeakMap();
    verifiedNgModule = new WeakMap();
    moduleQueue.length = 0;
    GENERATED_COMP_IDS.clear();
}
/**
 * Computes the combined declarations of explicit declarations, as well as declarations inherited by
 * traversing the exports of imported modules.
 * @param type
 */
function computeCombinedExports(type) {
    type = resolveForwardRef(type);
    const ngModuleDef = getNgModuleDef(type);
    // a standalone component, directive or pipe
    if (ngModuleDef === null) {
        return [type];
    }
    return flatten(maybeUnwrapFn(ngModuleDef.exports).map((type) => {
        const ngModuleDef = getNgModuleDef(type);
        if (ngModuleDef) {
            verifySemanticsOfNgModuleDef(type, false);
            return computeCombinedExports(type);
        }
        else {
            return type;
        }
    }));
}
/**
 * Some declared components may be compiled asynchronously, and thus may not have their
 * ɵcmp set yet. If this is the case, then a reference to the module is written into
 * the `ngSelectorScope` property of the declared type.
 */
function setScopeOnDeclaredComponents(moduleType, ngModule) {
    const declarations = flatten(ngModule.declarations || EMPTY_ARRAY);
    const transitiveScopes = transitiveScopesFor(moduleType);
    declarations.forEach((declaration) => {
        declaration = resolveForwardRef(declaration);
        if (declaration.hasOwnProperty(NG_COMP_DEF)) {
            // A `ɵcmp` field exists - go ahead and patch the component directly.
            const component = declaration;
            const componentDef = getComponentDef(component);
            patchComponentDefWithScope(componentDef, transitiveScopes);
        }
        else if (!declaration.hasOwnProperty(NG_DIR_DEF) &&
            !declaration.hasOwnProperty(NG_PIPE_DEF)) {
            // Set `ngSelectorScope` for future reference when the component compilation finishes.
            declaration.ngSelectorScope = moduleType;
        }
    });
}
/**
 * Patch the definition of a component with directives and pipes from the compilation scope of
 * a given module.
 */
export function patchComponentDefWithScope(componentDef, transitiveScopes) {
    componentDef.directiveDefs = () => Array.from(transitiveScopes.compilation.directives)
        .map((dir) => dir.hasOwnProperty(NG_COMP_DEF) ? getComponentDef(dir) : getDirectiveDef(dir))
        .filter((def) => !!def);
    componentDef.pipeDefs = () => Array.from(transitiveScopes.compilation.pipes).map((pipe) => getPipeDef(pipe));
    componentDef.schemas = transitiveScopes.schemas;
    // Since we avoid Components/Directives/Pipes recompiling in case there are no overrides, we
    // may face a problem where previously compiled defs available to a given Component/Directive
    // are cached in TView and may become stale (in case any of these defs gets recompiled). In
    // order to avoid this problem, we force fresh TView to be created.
    componentDef.tView = null;
}
/**
 * Compute the pair of transitive scopes (compilation scope and exported scope) for a given type
 * (either a NgModule or a standalone component / directive / pipe).
 */
export function transitiveScopesFor(type) {
    if (isNgModule(type)) {
        if (USE_RUNTIME_DEPS_TRACKER_FOR_JIT) {
            const scope = depsTracker.getNgModuleScope(type);
            const def = getNgModuleDef(type, true);
            return {
                schemas: def.schemas || null,
                ...scope,
            };
        }
        else {
            return transitiveScopesForNgModule(type);
        }
    }
    else if (isStandalone(type)) {
        const directiveDef = getComponentDef(type) || getDirectiveDef(type);
        if (directiveDef !== null) {
            return {
                schemas: null,
                compilation: {
                    directives: new Set(),
                    pipes: new Set(),
                },
                exported: {
                    directives: new Set([type]),
                    pipes: new Set(),
                },
            };
        }
        const pipeDef = getPipeDef(type);
        if (pipeDef !== null) {
            return {
                schemas: null,
                compilation: {
                    directives: new Set(),
                    pipes: new Set(),
                },
                exported: {
                    directives: new Set(),
                    pipes: new Set([type]),
                },
            };
        }
    }
    // TODO: change the error message to be more user-facing and take standalone into account
    throw new Error(`${type.name} does not have a module def (ɵmod property)`);
}
/**
 * Compute the pair of transitive scopes (compilation scope and exported scope) for a given module.
 *
 * This operation is memoized and the result is cached on the module's definition. This function can
 * be called on modules with components that have not fully compiled yet, but the result should not
 * be used until they have.
 *
 * @param moduleType module that transitive scope should be calculated for.
 */
export function transitiveScopesForNgModule(moduleType) {
    const def = getNgModuleDef(moduleType, true);
    if (def.transitiveCompileScopes !== null) {
        return def.transitiveCompileScopes;
    }
    const scopes = {
        schemas: def.schemas || null,
        compilation: {
            directives: new Set(),
            pipes: new Set(),
        },
        exported: {
            directives: new Set(),
            pipes: new Set(),
        },
    };
    maybeUnwrapFn(def.imports).forEach((imported) => {
        // When this module imports another, the imported module's exported directives and pipes are
        // added to the compilation scope of this module.
        const importedScope = transitiveScopesFor(imported);
        importedScope.exported.directives.forEach((entry) => scopes.compilation.directives.add(entry));
        importedScope.exported.pipes.forEach((entry) => scopes.compilation.pipes.add(entry));
    });
    maybeUnwrapFn(def.declarations).forEach((declared) => {
        const declaredWithDefs = declared;
        if (getPipeDef(declaredWithDefs)) {
            scopes.compilation.pipes.add(declared);
        }
        else {
            // Either declared has a ɵcmp or ɵdir, or it's a component which hasn't
            // had its template compiled yet. In either case, it gets added to the compilation's
            // directives.
            scopes.compilation.directives.add(declared);
        }
    });
    maybeUnwrapFn(def.exports).forEach((exported) => {
        const exportedType = exported;
        // Either the type is a module, a pipe, or a component/directive (which may not have a
        // ɵcmp as it might be compiled asynchronously).
        if (isNgModule(exportedType)) {
            // When this module exports another, the exported module's exported directives and pipes are
            // added to both the compilation and exported scopes of this module.
            const exportedScope = transitiveScopesFor(exportedType);
            exportedScope.exported.directives.forEach((entry) => {
                scopes.compilation.directives.add(entry);
                scopes.exported.directives.add(entry);
            });
            exportedScope.exported.pipes.forEach((entry) => {
                scopes.compilation.pipes.add(entry);
                scopes.exported.pipes.add(entry);
            });
        }
        else if (getPipeDef(exportedType)) {
            scopes.exported.pipes.add(exportedType);
        }
        else {
            scopes.exported.directives.add(exportedType);
        }
    });
    def.transitiveCompileScopes = scopes;
    return scopes;
}
function expandModuleWithProviders(value) {
    if (isModuleWithProviders(value)) {
        return value.ngModule;
    }
    return value;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS9zcmMvcmVuZGVyMy9qaXQvbW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFDTCxpQkFBaUIsR0FHbEIsTUFBTSxnQ0FBZ0MsQ0FBQztBQUN4QyxPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSxzQkFBc0IsQ0FBQztBQUN2RCxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0seUJBQXlCLENBQUM7QUFFbkQsT0FBTyxFQUFDLG1CQUFtQixFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFFdEQsT0FBTyxFQUFDLG9CQUFvQixFQUFDLE1BQU0scUNBQXFDLENBQUM7QUFJekUsT0FBTyxFQUFDLFdBQVcsRUFBRSxPQUFPLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUM1RCxPQUFPLEVBQUMsYUFBYSxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDaEQsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBQzdDLE9BQU8sRUFDTCxrQkFBa0IsRUFDbEIsZUFBZSxFQUNmLGVBQWUsRUFDZixjQUFjLEVBQ2QsVUFBVSxFQUNWLFlBQVksR0FDYixNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUMsV0FBVyxFQUFFLGdDQUFnQyxFQUFDLE1BQU0sOEJBQThCLENBQUM7QUFDM0YsT0FBTyxFQUFDLFdBQVcsRUFBRSxVQUFVLEVBQUUsY0FBYyxFQUFFLFVBQVUsRUFBRSxXQUFXLEVBQUMsTUFBTSxXQUFXLENBQUM7QUFFM0YsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLG9CQUFvQixDQUFDO0FBQ2pELE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLHlCQUF5QixDQUFDO0FBRTFELE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDN0MsT0FBTyxFQUFDLHNCQUFzQixFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDdEQsT0FBTyxFQUFDLHFCQUFxQixFQUFFLFVBQVUsRUFBQyxNQUFNLFFBQVEsQ0FBQztBQU96RCxNQUFNLFdBQVcsR0FBc0IsRUFBRSxDQUFDO0FBRTFDOzs7R0FHRztBQUNILFNBQVMsOEJBQThCLENBQUMsVUFBcUIsRUFBRSxRQUFrQjtJQUMvRSxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUMsVUFBVSxFQUFFLFFBQVEsRUFBQyxDQUFDLENBQUM7QUFDM0MsQ0FBQztBQUVELElBQUksbUJBQW1CLEdBQUcsS0FBSyxDQUFDO0FBQ2hDOzs7O0dBSUc7QUFDSCxNQUFNLFVBQVUsdUNBQXVDO0lBQ3JELElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1FBQ3pCLG1CQUFtQixHQUFHLElBQUksQ0FBQztRQUMzQixJQUFJLENBQUM7WUFDSCxLQUFLLElBQUksQ0FBQyxHQUFHLFdBQVcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztnQkFDakQsTUFBTSxFQUFDLFVBQVUsRUFBRSxRQUFRLEVBQUMsR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRTlDLElBQUksUUFBUSxDQUFDLFlBQVksSUFBSSxRQUFRLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxFQUFFLENBQUM7b0JBQ2hGLFVBQVU7b0JBQ1YsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7b0JBQ3pCLDRCQUE0QixDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUMsQ0FBQztnQkFDckQsQ0FBQztZQUNILENBQUM7UUFDSCxDQUFDO2dCQUFTLENBQUM7WUFDVCxtQkFBbUIsR0FBRyxLQUFLLENBQUM7UUFDOUIsQ0FBQztJQUNILENBQUM7QUFDSCxDQUFDO0FBRUQ7Ozs7R0FJRztBQUNILFNBQVMscUJBQXFCLENBQUMsV0FBOEI7SUFDM0QsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUM7UUFDL0IsT0FBTyxXQUFXLENBQUMsS0FBSyxDQUFDLHFCQUFxQixDQUFDLENBQUM7SUFDbEQsQ0FBQztJQUNELE9BQU8sQ0FBQyxDQUFDLGlCQUFpQixDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQzFDLENBQUM7QUFFRDs7OztHQUlHO0FBQ0gsTUFBTSxVQUFVLGVBQWUsQ0FBQyxVQUFxQixFQUFFLFdBQXFCLEVBQUU7SUFDNUUsc0JBQXNCLEVBQUUsQ0FBQztJQUN6QixtQkFBbUIsQ0FBQyxVQUEwQixFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQzFELElBQUksUUFBUSxDQUFDLEVBQUUsS0FBSyxTQUFTLEVBQUUsQ0FBQztRQUM5QixvQkFBb0IsQ0FBQyxVQUEwQixFQUFFLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNoRSxDQUFDO0lBRUQsZ0ZBQWdGO0lBQ2hGLGdGQUFnRjtJQUNoRixzRkFBc0Y7SUFDdEYseUNBQXlDO0lBQ3pDLDhCQUE4QixDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUMsQ0FBQztBQUN2RCxDQUFDO0FBRUQ7Ozs7O0dBS0c7QUFDSCxNQUFNLFVBQVUsbUJBQW1CLENBQ2pDLFVBQXdCLEVBQ3hCLFFBQWtCLEVBQ2xCLG1DQUE0QyxLQUFLO0lBRWpELFNBQVMsSUFBSSxhQUFhLENBQUMsVUFBVSxFQUFFLDJCQUEyQixDQUFDLENBQUM7SUFDcEUsU0FBUyxJQUFJLGFBQWEsQ0FBQyxRQUFRLEVBQUUseUJBQXlCLENBQUMsQ0FBQztJQUNoRSxNQUFNLFlBQVksR0FBZ0IsT0FBTyxDQUFDLFFBQVEsQ0FBQyxZQUFZLElBQUksV0FBVyxDQUFDLENBQUM7SUFDaEYsSUFBSSxXQUFXLEdBQVEsSUFBSSxDQUFDO0lBQzVCLE1BQU0sQ0FBQyxjQUFjLENBQUMsVUFBVSxFQUFFLFVBQVUsRUFBRTtRQUM1QyxZQUFZLEVBQUUsSUFBSTtRQUNsQixHQUFHLEVBQUUsR0FBRyxFQUFFO1lBQ1IsSUFBSSxXQUFXLEtBQUssSUFBSSxFQUFFLENBQUM7Z0JBQ3pCLElBQUksU0FBUyxJQUFJLFFBQVEsQ0FBQyxPQUFPLElBQUksUUFBUSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQztvQkFDL0UsdUZBQXVGO29CQUN2Rix5RkFBeUY7b0JBQ3pGLE1BQU0sSUFBSSxLQUFLLENBQUMsSUFBSSxpQkFBaUIsQ0FBQyxVQUFVLENBQUMsOEJBQThCLENBQUMsQ0FBQztnQkFDbkYsQ0FBQztnQkFDRCxNQUFNLFFBQVEsR0FBRyxpQkFBaUIsQ0FBQztvQkFDakMsS0FBSyxvQ0FBNEI7b0JBQ2pDLElBQUksRUFBRSxVQUFVO29CQUNoQixJQUFJLEVBQUUsVUFBVTtpQkFDakIsQ0FBQyxDQUFDO2dCQUNILFdBQVcsR0FBRyxRQUFRLENBQUMsZUFBZSxDQUFDLGNBQWMsRUFBRSxTQUFTLFVBQVUsQ0FBQyxJQUFJLFVBQVUsRUFBRTtvQkFDekYsSUFBSSxFQUFFLFVBQVU7b0JBQ2hCLFNBQVMsRUFBRSxPQUFPLENBQUMsUUFBUSxDQUFDLFNBQVMsSUFBSSxXQUFXLENBQUMsQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUM7b0JBQzVFLFlBQVksRUFBRSxZQUFZLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDO29CQUNqRCxPQUFPLEVBQUUsT0FBTyxDQUFDLFFBQVEsQ0FBQyxPQUFPLElBQUksV0FBVyxDQUFDO3lCQUM5QyxHQUFHLENBQUMsaUJBQWlCLENBQUM7eUJBQ3RCLEdBQUcsQ0FBQyx5QkFBeUIsQ0FBQztvQkFDakMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxRQUFRLENBQUMsT0FBTyxJQUFJLFdBQVcsQ0FBQzt5QkFDOUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDO3lCQUN0QixHQUFHLENBQUMseUJBQXlCLENBQUM7b0JBQ2pDLE9BQU8sRUFBRSxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJO29CQUM1RCxFQUFFLEVBQUUsUUFBUSxDQUFDLEVBQUUsSUFBSSxJQUFJO2lCQUN4QixDQUFDLENBQUM7Z0JBQ0gsc0ZBQXNGO2dCQUN0RiwwRkFBMEY7Z0JBQzFGLDJGQUEyRjtnQkFDM0YsbUZBQW1GO2dCQUNuRixJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDO29CQUN6QixXQUFXLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztnQkFDM0IsQ0FBQztZQUNILENBQUM7WUFDRCxPQUFPLFdBQVcsQ0FBQztRQUNyQixDQUFDO0tBQ0YsQ0FBQyxDQUFDO0lBRUgsSUFBSSxZQUFZLEdBQVEsSUFBSSxDQUFDO0lBQzdCLE1BQU0sQ0FBQyxjQUFjLENBQUMsVUFBVSxFQUFFLGNBQWMsRUFBRTtRQUNoRCxHQUFHLEVBQUUsR0FBRyxFQUFFO1lBQ1IsSUFBSSxZQUFZLEtBQUssSUFBSSxFQUFFLENBQUM7Z0JBQzFCLE1BQU0sUUFBUSxHQUFHLGlCQUFpQixDQUFDO29CQUNqQyxLQUFLLG9DQUE0QjtvQkFDakMsSUFBSSxFQUFFLFVBQVU7b0JBQ2hCLElBQUksRUFBRSxVQUFVO2lCQUNqQixDQUFDLENBQUM7Z0JBQ0gsWUFBWSxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsY0FBYyxFQUFFLFNBQVMsVUFBVSxDQUFDLElBQUksVUFBVSxFQUFFO29CQUN6RixJQUFJLEVBQUUsVUFBVSxDQUFDLElBQUk7b0JBQ3JCLElBQUksRUFBRSxVQUFVO29CQUNoQixJQUFJLEVBQUUsbUJBQW1CLENBQUMsVUFBVSxDQUFDO29CQUNyQyxNQUFNLEVBQUUsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRO29CQUN2QyxpQkFBaUIsRUFBRSxDQUFDO2lCQUNyQixDQUFDLENBQUM7WUFDTCxDQUFDO1lBQ0QsT0FBTyxZQUFZLENBQUM7UUFDdEIsQ0FBQztRQUNELDBFQUEwRTtRQUMxRSxZQUFZLEVBQUUsQ0FBQyxDQUFDLFNBQVM7S0FDMUIsQ0FBQyxDQUFDO0lBRUgsSUFBSSxhQUFhLEdBQVEsSUFBSSxDQUFDO0lBQzlCLE1BQU0sQ0FBQyxjQUFjLENBQUMsVUFBVSxFQUFFLFVBQVUsRUFBRTtRQUM1QyxHQUFHLEVBQUUsR0FBRyxFQUFFO1lBQ1IsSUFBSSxhQUFhLEtBQUssSUFBSSxFQUFFLENBQUM7Z0JBQzNCLFNBQVMsSUFBSSw0QkFBNEIsQ0FBQyxVQUFVLEVBQUUsZ0NBQWdDLENBQUMsQ0FBQztnQkFDeEYsTUFBTSxJQUFJLEdBQTZCO29CQUNyQyxJQUFJLEVBQUUsVUFBVSxDQUFDLElBQUk7b0JBQ3JCLElBQUksRUFBRSxVQUFVO29CQUNoQixTQUFTLEVBQUUsUUFBUSxDQUFDLFNBQVMsSUFBSSxXQUFXO29CQUM1QyxPQUFPLEVBQUU7d0JBQ1AsQ0FBQyxRQUFRLENBQUMsT0FBTyxJQUFJLFdBQVcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQzt3QkFDeEQsQ0FBQyxRQUFRLENBQUMsT0FBTyxJQUFJLFdBQVcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQztxQkFDekQ7aUJBQ0YsQ0FBQztnQkFDRixNQUFNLFFBQVEsR0FBRyxpQkFBaUIsQ0FBQztvQkFDakMsS0FBSyxvQ0FBNEI7b0JBQ2pDLElBQUksRUFBRSxVQUFVO29CQUNoQixJQUFJLEVBQUUsVUFBVTtpQkFDakIsQ0FBQyxDQUFDO2dCQUNILGFBQWEsR0FBRyxRQUFRLENBQUMsZUFBZSxDQUN0QyxjQUFjLEVBQ2QsU0FBUyxVQUFVLENBQUMsSUFBSSxVQUFVLEVBQ2xDLElBQUksQ0FDTCxDQUFDO1lBQ0osQ0FBQztZQUNELE9BQU8sYUFBYSxDQUFDO1FBQ3ZCLENBQUM7UUFDRCwwRUFBMEU7UUFDMUUsWUFBWSxFQUFFLENBQUMsQ0FBQyxTQUFTO0tBQzFCLENBQUMsQ0FBQztBQUNMLENBQUM7QUFFRCxNQUFNLFVBQVUscUNBQXFDLENBQUMsSUFBZSxFQUFFLFFBQWdCO0lBQ3JGLE1BQU0sTUFBTSxHQUFHLGVBQWUsaUJBQWlCLENBQUMsSUFBSSxDQUFDLDRDQUE0QyxDQUFDO0lBQ2xHLE1BQU0sTUFBTSxHQUNWLElBQUksaUJBQWlCLENBQUMsSUFBSSxDQUFDLGtEQUFrRDtRQUM3RSw4RkFBOEYsQ0FBQztJQUNqRyxPQUFPLEdBQUcsTUFBTSxJQUFJLFFBQVEsS0FBSyxNQUFNLEVBQUUsQ0FBQztBQUM1QyxDQUFDO0FBRUQsU0FBUyw0QkFBNEIsQ0FDbkMsVUFBd0IsRUFDeEIsZ0NBQXlDLEVBQ3pDLGVBQThCO0lBRTlCLElBQUksZ0JBQWdCLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQztRQUFFLE9BQU87SUFFN0MscUVBQXFFO0lBQ3JFLElBQUksWUFBWSxDQUFDLFVBQVUsQ0FBQztRQUFFLE9BQU87SUFFckMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUN2QyxVQUFVLEdBQUcsaUJBQWlCLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDM0MsSUFBSSxXQUE2QixDQUFDO0lBQ2xDLElBQUksZUFBZSxFQUFFLENBQUM7UUFDcEIsV0FBVyxHQUFHLGNBQWMsQ0FBQyxVQUFVLENBQUUsQ0FBQztRQUMxQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDakIsTUFBTSxJQUFJLEtBQUssQ0FDYixxQkFBcUIsVUFBVSxDQUFDLElBQUksNkJBQTZCLGVBQWUsQ0FBQyxJQUFJLHdDQUF3QyxDQUM5SCxDQUFDO1FBQ0osQ0FBQztJQUNILENBQUM7U0FBTSxDQUFDO1FBQ04sV0FBVyxHQUFHLGNBQWMsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDakQsQ0FBQztJQUNELE1BQU0sTUFBTSxHQUFhLEVBQUUsQ0FBQztJQUM1QixNQUFNLFlBQVksR0FBRyxhQUFhLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQzdELE1BQU0sT0FBTyxHQUFHLGFBQWEsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDbkQsT0FBTyxDQUFDLE9BQU8sQ0FBQztTQUNiLEdBQUcsQ0FBQyxnQ0FBZ0MsQ0FBQztTQUNyQyxPQUFPLENBQUMsQ0FBQyxtQkFBbUIsRUFBRSxFQUFFO1FBQy9CLCtCQUErQixDQUFDLG1CQUFtQixFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ2pFLDRCQUE0QixDQUFDLG1CQUFtQixFQUFFLEtBQUssRUFBRSxVQUFVLENBQUMsQ0FBQztJQUN2RSxDQUFDLENBQUMsQ0FBQztJQUNMLE1BQU0sT0FBTyxHQUFHLGFBQWEsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDbkQsWUFBWSxDQUFDLE9BQU8sQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDO0lBQ3hELFlBQVksQ0FBQyxPQUFPLENBQUMsNEJBQTRCLENBQUMsQ0FBQztJQUNuRCxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUMsZUFBZSxFQUFFLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQyxlQUFlLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQztJQUM1RixNQUFNLG9CQUFvQixHQUFnQjtRQUN4QyxHQUFHLFlBQVksQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUM7UUFDdEMsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDO0tBQ3ZFLENBQUM7SUFDRixPQUFPLENBQUMsT0FBTyxDQUFDLG9DQUFvQyxDQUFDLENBQUM7SUFDdEQsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMseUJBQXlCLENBQUMsSUFBSSxFQUFFLGdDQUFnQyxDQUFDLENBQUMsQ0FBQztJQUVsRyxNQUFNLFFBQVEsR0FBRyxhQUFhLENBQVcsVUFBVSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBQ2pFLElBQUksUUFBUSxFQUFFLENBQUM7UUFDYixRQUFRLENBQUMsT0FBTztZQUNkLE9BQU8sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDO2lCQUN0QixHQUFHLENBQUMsZ0NBQWdDLENBQUM7aUJBQ3JDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO2dCQUNmLCtCQUErQixDQUFDLEdBQUcsRUFBRSxVQUFVLENBQUMsQ0FBQztnQkFDakQsNEJBQTRCLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxVQUFVLENBQUMsQ0FBQztZQUN2RCxDQUFDLENBQUMsQ0FBQztRQUNQLFFBQVEsQ0FBQyxTQUFTLElBQUksV0FBVyxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsMEJBQTBCLENBQUMsQ0FBQztRQUNsRixRQUFRLENBQUMsU0FBUyxJQUFJLFdBQVcsQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFLCtCQUErQixDQUFDLENBQUM7SUFDekYsQ0FBQztJQUVELDJDQUEyQztJQUMzQyxJQUFJLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUNsQixNQUFNLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUNyQyxDQUFDO0lBQ0QsZ0dBQWdHO0lBQ2hHLFNBQVMsaUNBQWlDLENBQUMsSUFBZTtRQUN4RCxJQUFJLEdBQUcsaUJBQWlCLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDL0IsTUFBTSxHQUFHLEdBQUcsZUFBZSxDQUFDLElBQUksQ0FBQyxJQUFJLGVBQWUsQ0FBQyxJQUFJLENBQUMsSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDL0UsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQ1QsTUFBTSxDQUFDLElBQUksQ0FDVCxxQkFBcUIsaUJBQWlCLENBQUMsSUFBSSxDQUFDLDZCQUE2QixpQkFBaUIsQ0FDeEYsVUFBVSxDQUNYLHlEQUF5RCxDQUMzRCxDQUFDO1FBQ0osQ0FBQztJQUNILENBQUM7SUFFRCxTQUFTLDRCQUE0QixDQUFDLElBQWU7UUFDbkQsSUFBSSxHQUFHLGlCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBQy9CLE1BQU0sR0FBRyxHQUFHLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNsQyxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUUsQ0FBQztZQUMvRCxNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsaUJBQWlCLENBQUMsSUFBSSxDQUFDLGtDQUFrQyxDQUFDLENBQUM7UUFDdEYsQ0FBQztJQUNILENBQUM7SUFFRCxTQUFTLG1CQUFtQixDQUFDLElBQWUsRUFBRSxVQUF3QjtRQUNwRSxJQUFJLEdBQUcsaUJBQWlCLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDL0IsTUFBTSxHQUFHLEdBQUcsZUFBZSxDQUFDLElBQUksQ0FBQyxJQUFJLGVBQWUsQ0FBQyxJQUFJLENBQUMsSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDL0UsSUFBSSxHQUFHLEVBQUUsVUFBVSxFQUFFLENBQUM7WUFDcEIsTUFBTSxRQUFRLEdBQUcsSUFBSSxpQkFBaUIsQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDO1lBQy9ELE1BQU0sQ0FBQyxJQUFJLENBQUMscUNBQXFDLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDckUsQ0FBQztJQUNILENBQUM7SUFFRCxTQUFTLG9DQUFvQyxDQUFDLElBQWU7UUFDM0QsSUFBSSxHQUFHLGlCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBQy9CLE1BQU0sSUFBSSxHQUNSLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxJQUFJLFdBQVcsQ0FBQztZQUN0QyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsSUFBSSxXQUFXLENBQUM7WUFDdEMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksTUFBTSxDQUFDLENBQUM7UUFDL0IsSUFBSSxJQUFJLEVBQUUsQ0FBQztZQUNULG1FQUFtRTtZQUNuRSxpREFBaUQ7WUFDakQsSUFBSSxvQkFBb0IsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQztnQkFDbEQsMEVBQTBFO2dCQUMxRSxNQUFNLENBQUMsSUFBSSxDQUNULGdCQUFnQixJQUFJLElBQUksaUJBQWlCLENBQUMsSUFBSSxDQUFDLFNBQVMsaUJBQWlCLENBQ3ZFLFVBQVUsQ0FDWCwyQ0FBMkMsQ0FDN0MsQ0FBQztZQUNKLENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQztJQUVELFNBQVMseUJBQXlCLENBQUMsSUFBZSxFQUFFLGNBQXVCO1FBQ3pFLElBQUksR0FBRyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMvQixNQUFNLGNBQWMsR0FBRyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQy9DLElBQUksY0FBYyxJQUFJLGNBQWMsS0FBSyxVQUFVLEVBQUUsQ0FBQztZQUNwRCxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7Z0JBQ3BCLE1BQU0sT0FBTyxHQUFHLENBQUMsY0FBYyxFQUFFLFVBQVUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUMzRSxNQUFNLENBQUMsSUFBSSxDQUNULFFBQVEsaUJBQWlCLENBQUMsSUFBSSxDQUFDLDhDQUM3QixPQUFPLENBQUMsQ0FBQyxDQUNYLFFBQVEsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJO29CQUNwQiwwQkFBMEIsaUJBQWlCLENBQUMsSUFBSSxDQUFDLG9DQUMvQyxPQUFPLENBQUMsQ0FBQyxDQUNYLFFBQVEsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJO29CQUN0QixnRUFBZ0UsaUJBQWlCLENBQy9FLElBQUksQ0FDTCxpQ0FBaUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxRQUFRLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUNwRSxDQUFDO1lBQ0osQ0FBQztRQUNILENBQUM7YUFBTSxDQUFDO1lBQ04sNkJBQTZCO1lBQzdCLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ3RDLENBQUM7SUFDSCxDQUFDO0lBRUQsU0FBUywrQkFBK0IsQ0FBQyxJQUFlO1FBQ3RELElBQUksR0FBRyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMvQixNQUFNLGNBQWMsR0FBRyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQy9DLElBQUksQ0FBQyxjQUFjLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztZQUMzQyxNQUFNLENBQUMsSUFBSSxDQUNULGFBQWEsaUJBQWlCLENBQzVCLElBQUksQ0FDTCxvRkFBb0YsQ0FDdEYsQ0FBQztRQUNKLENBQUM7SUFDSCxDQUFDO0lBRUQsU0FBUywwQkFBMEIsQ0FBQyxJQUFlO1FBQ2pELElBQUksR0FBRyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMvQixJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7WUFDM0IsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLGlCQUFpQixDQUFDLElBQUksQ0FBQyx3Q0FBd0MsQ0FBQyxDQUFDO1FBQ2xGLENBQUM7UUFDRCxJQUFJLFlBQVksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO1lBQ3ZCLDZDQUE2QztZQUM3QywwREFBMEQ7WUFDMUQsTUFBTSxDQUFDLElBQUksQ0FDVCxTQUFTLGlCQUFpQixDQUFDLElBQUksQ0FBQyxnREFBZ0Q7Z0JBQzlFLHFGQUFxRjtnQkFDckYsaUNBQWlDLENBQ3BDLENBQUM7UUFDSixDQUFDO0lBQ0gsQ0FBQztJQUVELFNBQVMsK0JBQStCLENBQUMsSUFBZSxFQUFFLGVBQTBCO1FBQ2xGLElBQUksR0FBRyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUUvQixNQUFNLFlBQVksR0FBRyxlQUFlLENBQUMsSUFBSSxDQUFDLElBQUksZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3BFLElBQUksWUFBWSxLQUFLLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUN0RCxNQUFNLElBQUksS0FBSyxDQUNiLHlCQUF5QixJQUFJLENBQUMsSUFBSSw2QkFBNkIsZUFBZSxDQUFDLElBQUksd0NBQXdDLENBQzVILENBQUM7UUFDSixDQUFDO1FBRUQsTUFBTSxPQUFPLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2pDLElBQUksT0FBTyxLQUFLLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUM1QyxNQUFNLElBQUksS0FBSyxDQUNiLG9CQUFvQixJQUFJLENBQUMsSUFBSSw2QkFBNkIsZUFBZSxDQUFDLElBQUksd0NBQXdDLENBQ3ZILENBQUM7UUFDSixDQUFDO0lBQ0gsQ0FBQztBQUNILENBQUM7QUFFRCxTQUFTLGdDQUFnQyxDQUN2QyxtQkFBc0U7SUFFdEUsbUJBQW1CLEdBQUcsaUJBQWlCLENBQUMsbUJBQW1CLENBQUMsQ0FBQztJQUM3RCxPQUFRLG1CQUEyQixDQUFDLFFBQVEsSUFBSSxtQkFBbUIsQ0FBQztBQUN0RSxDQUFDO0FBRUQsU0FBUyxhQUFhLENBQUksSUFBUyxFQUFFLElBQVk7SUFDL0MsSUFBSSxVQUFVLEdBQWEsSUFBSSxDQUFDO0lBQ2hDLE9BQU8sQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDOUIsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUN6QixPQUFPLFVBQVUsQ0FBQztJQUVsQixTQUFTLE9BQU8sQ0FBQyxXQUF5QjtRQUN4QyxJQUFJLFdBQVcsRUFBRSxDQUFDO1lBQ2hCLFdBQVcsQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDdEMsQ0FBQztJQUNILENBQUM7SUFFRCxTQUFTLGNBQWMsQ0FBQyxTQUd2QjtRQUNDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUNoQixNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQy9DLElBQUksS0FBSyxDQUFDLGNBQWMsSUFBSSxJQUFJLEVBQUUsQ0FBQztnQkFDakMsVUFBVSxHQUFHLFNBQWdCLENBQUM7WUFDaEMsQ0FBQztpQkFBTSxJQUFJLFNBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDMUIsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3BELElBQUksS0FBSyxDQUFDLGNBQWMsSUFBSSxJQUFJLEVBQUUsQ0FBQztvQkFDakMsVUFBVSxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2pDLENBQUM7WUFDSCxDQUFDO1FBQ0gsQ0FBQztJQUNILENBQUM7QUFDSCxDQUFDO0FBRUQ7Ozs7O0dBS0c7QUFDSCxJQUFJLGFBQWEsR0FBRyxJQUFJLE9BQU8sRUFBZ0MsQ0FBQztBQUNoRSxJQUFJLGdCQUFnQixHQUFHLElBQUksT0FBTyxFQUE4QixDQUFDO0FBRWpFLE1BQU0sVUFBVSx1QkFBdUI7SUFDckMsYUFBYSxHQUFHLElBQUksT0FBTyxFQUFnQyxDQUFDO0lBQzVELGdCQUFnQixHQUFHLElBQUksT0FBTyxFQUE4QixDQUFDO0lBQzdELFdBQVcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0lBQ3ZCLGtCQUFrQixDQUFDLEtBQUssRUFBRSxDQUFDO0FBQzdCLENBQUM7QUFFRDs7OztHQUlHO0FBQ0gsU0FBUyxzQkFBc0IsQ0FBQyxJQUFlO0lBQzdDLElBQUksR0FBRyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMvQixNQUFNLFdBQVcsR0FBRyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7SUFFekMsNENBQTRDO0lBQzVDLElBQUksV0FBVyxLQUFLLElBQUksRUFBRSxDQUFDO1FBQ3pCLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNoQixDQUFDO0lBRUQsT0FBTyxPQUFPLENBQ1osYUFBYSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRTtRQUM5QyxNQUFNLFdBQVcsR0FBRyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDekMsSUFBSSxXQUFXLEVBQUUsQ0FBQztZQUNoQiw0QkFBNEIsQ0FBQyxJQUEyQixFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ2pFLE9BQU8sc0JBQXNCLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdEMsQ0FBQzthQUFNLENBQUM7WUFDTixPQUFPLElBQUksQ0FBQztRQUNkLENBQUM7SUFDSCxDQUFDLENBQUMsQ0FDSCxDQUFDO0FBQ0osQ0FBQztBQUVEOzs7O0dBSUc7QUFDSCxTQUFTLDRCQUE0QixDQUFDLFVBQXFCLEVBQUUsUUFBa0I7SUFDN0UsTUFBTSxZQUFZLEdBQWdCLE9BQU8sQ0FBQyxRQUFRLENBQUMsWUFBWSxJQUFJLFdBQVcsQ0FBQyxDQUFDO0lBRWhGLE1BQU0sZ0JBQWdCLEdBQUcsbUJBQW1CLENBQUMsVUFBVSxDQUFDLENBQUM7SUFFekQsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDLFdBQVcsRUFBRSxFQUFFO1FBQ25DLFdBQVcsR0FBRyxpQkFBaUIsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUM3QyxJQUFJLFdBQVcsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQztZQUM1QyxxRUFBcUU7WUFDckUsTUFBTSxTQUFTLEdBQUcsV0FBb0QsQ0FBQztZQUN2RSxNQUFNLFlBQVksR0FBRyxlQUFlLENBQUMsU0FBUyxDQUFFLENBQUM7WUFDakQsMEJBQTBCLENBQUMsWUFBWSxFQUFFLGdCQUFnQixDQUFDLENBQUM7UUFDN0QsQ0FBQzthQUFNLElBQ0wsQ0FBQyxXQUFXLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQztZQUN2QyxDQUFDLFdBQVcsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLEVBQ3hDLENBQUM7WUFDRCxzRkFBc0Y7WUFDckYsV0FBbUQsQ0FBQyxlQUFlLEdBQUcsVUFBVSxDQUFDO1FBQ3BGLENBQUM7SUFDSCxDQUFDLENBQUMsQ0FBQztBQUNMLENBQUM7QUFFRDs7O0dBR0c7QUFDSCxNQUFNLFVBQVUsMEJBQTBCLENBQ3hDLFlBQTZCLEVBQzdCLGdCQUEwQztJQUUxQyxZQUFZLENBQUMsYUFBYSxHQUFHLEdBQUcsRUFBRSxDQUNoQyxLQUFLLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUM7U0FDaEQsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FDWCxHQUFHLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFFLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUUsQ0FDaEY7U0FDQSxNQUFNLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUM1QixZQUFZLENBQUMsUUFBUSxHQUFHLEdBQUcsRUFBRSxDQUMzQixLQUFLLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUUsQ0FBQyxDQUFDO0lBQ2xGLFlBQVksQ0FBQyxPQUFPLEdBQUcsZ0JBQWdCLENBQUMsT0FBTyxDQUFDO0lBRWhELDRGQUE0RjtJQUM1Riw2RkFBNkY7SUFDN0YsMkZBQTJGO0lBQzNGLG1FQUFtRTtJQUNuRSxZQUFZLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztBQUM1QixDQUFDO0FBRUQ7OztHQUdHO0FBQ0gsTUFBTSxVQUFVLG1CQUFtQixDQUFJLElBQWE7SUFDbEQsSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztRQUNyQixJQUFJLGdDQUFnQyxFQUFFLENBQUM7WUFDckMsTUFBTSxLQUFLLEdBQUcsV0FBVyxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2pELE1BQU0sR0FBRyxHQUFHLGNBQWMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDdkMsT0FBTztnQkFDTCxPQUFPLEVBQUUsR0FBRyxDQUFDLE9BQU8sSUFBSSxJQUFJO2dCQUM1QixHQUFHLEtBQUs7YUFDVCxDQUFDO1FBQ0osQ0FBQzthQUFNLENBQUM7WUFDTixPQUFPLDJCQUEyQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzNDLENBQUM7SUFDSCxDQUFDO1NBQU0sSUFBSSxZQUFZLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztRQUM5QixNQUFNLFlBQVksR0FBRyxlQUFlLENBQUMsSUFBSSxDQUFDLElBQUksZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3BFLElBQUksWUFBWSxLQUFLLElBQUksRUFBRSxDQUFDO1lBQzFCLE9BQU87Z0JBQ0wsT0FBTyxFQUFFLElBQUk7Z0JBQ2IsV0FBVyxFQUFFO29CQUNYLFVBQVUsRUFBRSxJQUFJLEdBQUcsRUFBTztvQkFDMUIsS0FBSyxFQUFFLElBQUksR0FBRyxFQUFPO2lCQUN0QjtnQkFDRCxRQUFRLEVBQUU7b0JBQ1IsVUFBVSxFQUFFLElBQUksR0FBRyxDQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ2hDLEtBQUssRUFBRSxJQUFJLEdBQUcsRUFBTztpQkFDdEI7YUFDRixDQUFDO1FBQ0osQ0FBQztRQUVELE1BQU0sT0FBTyxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNqQyxJQUFJLE9BQU8sS0FBSyxJQUFJLEVBQUUsQ0FBQztZQUNyQixPQUFPO2dCQUNMLE9BQU8sRUFBRSxJQUFJO2dCQUNiLFdBQVcsRUFBRTtvQkFDWCxVQUFVLEVBQUUsSUFBSSxHQUFHLEVBQU87b0JBQzFCLEtBQUssRUFBRSxJQUFJLEdBQUcsRUFBTztpQkFDdEI7Z0JBQ0QsUUFBUSxFQUFFO29CQUNSLFVBQVUsRUFBRSxJQUFJLEdBQUcsRUFBTztvQkFDMUIsS0FBSyxFQUFFLElBQUksR0FBRyxDQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7aUJBQzVCO2FBQ0YsQ0FBQztRQUNKLENBQUM7SUFDSCxDQUFDO0lBRUQseUZBQXlGO0lBQ3pGLE1BQU0sSUFBSSxLQUFLLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSw2Q0FBNkMsQ0FBQyxDQUFDO0FBQzdFLENBQUM7QUFFRDs7Ozs7Ozs7R0FRRztBQUNILE1BQU0sVUFBVSwyQkFBMkIsQ0FBSSxVQUFtQjtJQUNoRSxNQUFNLEdBQUcsR0FBRyxjQUFjLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBRTdDLElBQUksR0FBRyxDQUFDLHVCQUF1QixLQUFLLElBQUksRUFBRSxDQUFDO1FBQ3pDLE9BQU8sR0FBRyxDQUFDLHVCQUF1QixDQUFDO0lBQ3JDLENBQUM7SUFFRCxNQUFNLE1BQU0sR0FBNkI7UUFDdkMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxPQUFPLElBQUksSUFBSTtRQUM1QixXQUFXLEVBQUU7WUFDWCxVQUFVLEVBQUUsSUFBSSxHQUFHLEVBQU87WUFDMUIsS0FBSyxFQUFFLElBQUksR0FBRyxFQUFPO1NBQ3RCO1FBQ0QsUUFBUSxFQUFFO1lBQ1IsVUFBVSxFQUFFLElBQUksR0FBRyxFQUFPO1lBQzFCLEtBQUssRUFBRSxJQUFJLEdBQUcsRUFBTztTQUN0QjtLQUNGLENBQUM7SUFFRixhQUFhLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFJLFFBQWlCLEVBQUUsRUFBRTtRQUMxRCw0RkFBNEY7UUFDNUYsaURBQWlEO1FBQ2pELE1BQU0sYUFBYSxHQUFHLG1CQUFtQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3BELGFBQWEsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDL0YsYUFBYSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUN2RixDQUFDLENBQUMsQ0FBQztJQUVILGFBQWEsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUU7UUFDbkQsTUFBTSxnQkFBZ0IsR0FBRyxRQUV4QixDQUFDO1FBRUYsSUFBSSxVQUFVLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxDQUFDO1lBQ2pDLE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN6QyxDQUFDO2FBQU0sQ0FBQztZQUNOLHVFQUF1RTtZQUN2RSxvRkFBb0Y7WUFDcEYsY0FBYztZQUNkLE1BQU0sQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUM5QyxDQUFDO0lBQ0gsQ0FBQyxDQUFDLENBQUM7SUFFSCxhQUFhLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFJLFFBQWlCLEVBQUUsRUFBRTtRQUMxRCxNQUFNLFlBQVksR0FBRyxRQU1wQixDQUFDO1FBRUYsc0ZBQXNGO1FBQ3RGLGdEQUFnRDtRQUNoRCxJQUFJLFVBQVUsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDO1lBQzdCLDRGQUE0RjtZQUM1RixvRUFBb0U7WUFDcEUsTUFBTSxhQUFhLEdBQUcsbUJBQW1CLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDeEQsYUFBYSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUU7Z0JBQ2xELE1BQU0sQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDekMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3hDLENBQUMsQ0FBQyxDQUFDO1lBQ0gsYUFBYSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUU7Z0JBQzdDLE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDcEMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ25DLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQzthQUFNLElBQUksVUFBVSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUM7WUFDcEMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzFDLENBQUM7YUFBTSxDQUFDO1lBQ04sTUFBTSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQy9DLENBQUM7SUFDSCxDQUFDLENBQUMsQ0FBQztJQUVILEdBQUcsQ0FBQyx1QkFBdUIsR0FBRyxNQUFNLENBQUM7SUFDckMsT0FBTyxNQUFNLENBQUM7QUFDaEIsQ0FBQztBQUVELFNBQVMseUJBQXlCLENBQUMsS0FBMEM7SUFDM0UsSUFBSSxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO1FBQ2pDLE9BQU8sS0FBSyxDQUFDLFFBQVEsQ0FBQztJQUN4QixDQUFDO0lBQ0QsT0FBTyxLQUFLLENBQUM7QUFDZixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuZGV2L2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1xuICBnZXRDb21waWxlckZhY2FkZSxcbiAgSml0Q29tcGlsZXJVc2FnZSxcbiAgUjNJbmplY3Rvck1ldGFkYXRhRmFjYWRlLFxufSBmcm9tICcuLi8uLi9jb21waWxlci9jb21waWxlcl9mYWNhZGUnO1xuaW1wb3J0IHtyZXNvbHZlRm9yd2FyZFJlZn0gZnJvbSAnLi4vLi4vZGkvZm9yd2FyZF9yZWYnO1xuaW1wb3J0IHtOR19JTkpfREVGfSBmcm9tICcuLi8uLi9kaS9pbnRlcmZhY2UvZGVmcyc7XG5pbXBvcnQge01vZHVsZVdpdGhQcm92aWRlcnN9IGZyb20gJy4uLy4uL2RpL2ludGVyZmFjZS9wcm92aWRlcic7XG5pbXBvcnQge3JlZmxlY3REZXBlbmRlbmNpZXN9IGZyb20gJy4uLy4uL2RpL2ppdC91dGlsJztcbmltcG9ydCB7VHlwZX0gZnJvbSAnLi4vLi4vaW50ZXJmYWNlL3R5cGUnO1xuaW1wb3J0IHtyZWdpc3Rlck5nTW9kdWxlVHlwZX0gZnJvbSAnLi4vLi4vbGlua2VyL25nX21vZHVsZV9yZWdpc3RyYXRpb24nO1xuaW1wb3J0IHtDb21wb25lbnR9IGZyb20gJy4uLy4uL21ldGFkYXRhL2RpcmVjdGl2ZXMnO1xuaW1wb3J0IHtOZ01vZHVsZX0gZnJvbSAnLi4vLi4vbWV0YWRhdGEvbmdfbW9kdWxlJztcbmltcG9ydCB7TmdNb2R1bGVEZWYsIE5nTW9kdWxlVHJhbnNpdGl2ZVNjb3BlcywgTmdNb2R1bGVUeXBlfSBmcm9tICcuLi8uLi9tZXRhZGF0YS9uZ19tb2R1bGVfZGVmJztcbmltcG9ydCB7ZGVlcEZvckVhY2gsIGZsYXR0ZW59IGZyb20gJy4uLy4uL3V0aWwvYXJyYXlfdXRpbHMnO1xuaW1wb3J0IHthc3NlcnREZWZpbmVkfSBmcm9tICcuLi8uLi91dGlsL2Fzc2VydCc7XG5pbXBvcnQge0VNUFRZX0FSUkFZfSBmcm9tICcuLi8uLi91dGlsL2VtcHR5JztcbmltcG9ydCB7XG4gIEdFTkVSQVRFRF9DT01QX0lEUyxcbiAgZ2V0Q29tcG9uZW50RGVmLFxuICBnZXREaXJlY3RpdmVEZWYsXG4gIGdldE5nTW9kdWxlRGVmLFxuICBnZXRQaXBlRGVmLFxuICBpc1N0YW5kYWxvbmUsXG59IGZyb20gJy4uL2RlZmluaXRpb24nO1xuaW1wb3J0IHtkZXBzVHJhY2tlciwgVVNFX1JVTlRJTUVfREVQU19UUkFDS0VSX0ZPUl9KSVR9IGZyb20gJy4uL2RlcHNfdHJhY2tlci9kZXBzX3RyYWNrZXInO1xuaW1wb3J0IHtOR19DT01QX0RFRiwgTkdfRElSX0RFRiwgTkdfRkFDVE9SWV9ERUYsIE5HX01PRF9ERUYsIE5HX1BJUEVfREVGfSBmcm9tICcuLi9maWVsZHMnO1xuaW1wb3J0IHtDb21wb25lbnREZWZ9IGZyb20gJy4uL2ludGVyZmFjZXMvZGVmaW5pdGlvbic7XG5pbXBvcnQge21heWJlVW53cmFwRm59IGZyb20gJy4uL3V0aWwvbWlzY191dGlscyc7XG5pbXBvcnQge3N0cmluZ2lmeUZvckVycm9yfSBmcm9tICcuLi91dGlsL3N0cmluZ2lmeV91dGlscyc7XG5cbmltcG9ydCB7YW5ndWxhckNvcmVFbnZ9IGZyb20gJy4vZW52aXJvbm1lbnQnO1xuaW1wb3J0IHtwYXRjaE1vZHVsZUNvbXBpbGF0aW9ufSBmcm9tICcuL21vZHVsZV9wYXRjaCc7XG5pbXBvcnQge2lzTW9kdWxlV2l0aFByb3ZpZGVycywgaXNOZ01vZHVsZX0gZnJvbSAnLi91dGlsJztcblxuaW50ZXJmYWNlIE1vZHVsZVF1ZXVlSXRlbSB7XG4gIG1vZHVsZVR5cGU6IFR5cGU8YW55PjtcbiAgbmdNb2R1bGU6IE5nTW9kdWxlO1xufVxuXG5jb25zdCBtb2R1bGVRdWV1ZTogTW9kdWxlUXVldWVJdGVtW10gPSBbXTtcblxuLyoqXG4gKiBFbnF1ZXVlcyBtb2R1bGVEZWYgdG8gYmUgY2hlY2tlZCBsYXRlciB0byBzZWUgaWYgc2NvcGUgY2FuIGJlIHNldCBvbiBpdHNcbiAqIGNvbXBvbmVudCBkZWNsYXJhdGlvbnMuXG4gKi9cbmZ1bmN0aW9uIGVucXVldWVNb2R1bGVGb3JEZWxheWVkU2NvcGluZyhtb2R1bGVUeXBlOiBUeXBlPGFueT4sIG5nTW9kdWxlOiBOZ01vZHVsZSkge1xuICBtb2R1bGVRdWV1ZS5wdXNoKHttb2R1bGVUeXBlLCBuZ01vZHVsZX0pO1xufVxuXG5sZXQgZmx1c2hpbmdNb2R1bGVRdWV1ZSA9IGZhbHNlO1xuLyoqXG4gKiBMb29wcyBvdmVyIHF1ZXVlZCBtb2R1bGUgZGVmaW5pdGlvbnMsIGlmIGEgZ2l2ZW4gbW9kdWxlIGRlZmluaXRpb24gaGFzIGFsbCBvZiBpdHNcbiAqIGRlY2xhcmF0aW9ucyByZXNvbHZlZCwgaXQgZGVxdWV1ZXMgdGhhdCBtb2R1bGUgZGVmaW5pdGlvbiBhbmQgc2V0cyB0aGUgc2NvcGUgb25cbiAqIGl0cyBkZWNsYXJhdGlvbnMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmbHVzaE1vZHVsZVNjb3BpbmdRdWV1ZUFzTXVjaEFzUG9zc2libGUoKSB7XG4gIGlmICghZmx1c2hpbmdNb2R1bGVRdWV1ZSkge1xuICAgIGZsdXNoaW5nTW9kdWxlUXVldWUgPSB0cnVlO1xuICAgIHRyeSB7XG4gICAgICBmb3IgKGxldCBpID0gbW9kdWxlUXVldWUubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgY29uc3Qge21vZHVsZVR5cGUsIG5nTW9kdWxlfSA9IG1vZHVsZVF1ZXVlW2ldO1xuXG4gICAgICAgIGlmIChuZ01vZHVsZS5kZWNsYXJhdGlvbnMgJiYgbmdNb2R1bGUuZGVjbGFyYXRpb25zLmV2ZXJ5KGlzUmVzb2x2ZWREZWNsYXJhdGlvbikpIHtcbiAgICAgICAgICAvLyBkZXF1ZXVlXG4gICAgICAgICAgbW9kdWxlUXVldWUuc3BsaWNlKGksIDEpO1xuICAgICAgICAgIHNldFNjb3BlT25EZWNsYXJlZENvbXBvbmVudHMobW9kdWxlVHlwZSwgbmdNb2R1bGUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGZsdXNoaW5nTW9kdWxlUXVldWUgPSBmYWxzZTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRydXRoeSBpZiBhIGRlY2xhcmF0aW9uIGhhcyByZXNvbHZlZC4gSWYgdGhlIGRlY2xhcmF0aW9uIGhhcHBlbnMgdG8gYmVcbiAqIGFuIGFycmF5IG9mIGRlY2xhcmF0aW9ucywgaXQgd2lsbCByZWN1cnNlIHRvIGNoZWNrIGVhY2ggZGVjbGFyYXRpb24gaW4gdGhhdCBhcnJheVxuICogKHdoaWNoIG1heSBhbHNvIGJlIGFycmF5cykuXG4gKi9cbmZ1bmN0aW9uIGlzUmVzb2x2ZWREZWNsYXJhdGlvbihkZWNsYXJhdGlvbjogYW55W10gfCBUeXBlPGFueT4pOiBib29sZWFuIHtcbiAgaWYgKEFycmF5LmlzQXJyYXkoZGVjbGFyYXRpb24pKSB7XG4gICAgcmV0dXJuIGRlY2xhcmF0aW9uLmV2ZXJ5KGlzUmVzb2x2ZWREZWNsYXJhdGlvbik7XG4gIH1cbiAgcmV0dXJuICEhcmVzb2x2ZUZvcndhcmRSZWYoZGVjbGFyYXRpb24pO1xufVxuXG4vKipcbiAqIENvbXBpbGVzIGEgbW9kdWxlIGluIEpJVCBtb2RlLlxuICpcbiAqIFRoaXMgZnVuY3Rpb24gYXV0b21hdGljYWxseSBnZXRzIGNhbGxlZCB3aGVuIGEgY2xhc3MgaGFzIGEgYEBOZ01vZHVsZWAgZGVjb3JhdG9yLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY29tcGlsZU5nTW9kdWxlKG1vZHVsZVR5cGU6IFR5cGU8YW55PiwgbmdNb2R1bGU6IE5nTW9kdWxlID0ge30pOiB2b2lkIHtcbiAgcGF0Y2hNb2R1bGVDb21waWxhdGlvbigpO1xuICBjb21waWxlTmdNb2R1bGVEZWZzKG1vZHVsZVR5cGUgYXMgTmdNb2R1bGVUeXBlLCBuZ01vZHVsZSk7XG4gIGlmIChuZ01vZHVsZS5pZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcmVnaXN0ZXJOZ01vZHVsZVR5cGUobW9kdWxlVHlwZSBhcyBOZ01vZHVsZVR5cGUsIG5nTW9kdWxlLmlkKTtcbiAgfVxuXG4gIC8vIEJlY2F1c2Ugd2UgZG9uJ3Qga25vdyBpZiBhbGwgZGVjbGFyYXRpb25zIGhhdmUgcmVzb2x2ZWQgeWV0IGF0IHRoZSBtb21lbnQgdGhlXG4gIC8vIE5nTW9kdWxlIGRlY29yYXRvciBpcyBleGVjdXRpbmcsIHdlJ3JlIGVucXVldWVpbmcgdGhlIHNldHRpbmcgb2YgbW9kdWxlIHNjb3BlXG4gIC8vIG9uIGl0cyBkZWNsYXJhdGlvbnMgdG8gYmUgcnVuIGF0IGEgbGF0ZXIgdGltZSB3aGVuIGFsbCBkZWNsYXJhdGlvbnMgZm9yIHRoZSBtb2R1bGUsXG4gIC8vIGluY2x1ZGluZyBmb3J3YXJkIHJlZnMsIGhhdmUgcmVzb2x2ZWQuXG4gIGVucXVldWVNb2R1bGVGb3JEZWxheWVkU2NvcGluZyhtb2R1bGVUeXBlLCBuZ01vZHVsZSk7XG59XG5cbi8qKlxuICogQ29tcGlsZXMgYW5kIGFkZHMgdGhlIGDJtW1vZGAsIGDJtWZhY2AgYW5kIGDJtWluamAgcHJvcGVydGllcyB0byB0aGUgbW9kdWxlIGNsYXNzLlxuICpcbiAqIEl0J3MgcG9zc2libGUgdG8gY29tcGlsZSBhIG1vZHVsZSB2aWEgdGhpcyBBUEkgd2hpY2ggd2lsbCBhbGxvdyBkdXBsaWNhdGUgZGVjbGFyYXRpb25zIGluIGl0c1xuICogcm9vdC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbXBpbGVOZ01vZHVsZURlZnMoXG4gIG1vZHVsZVR5cGU6IE5nTW9kdWxlVHlwZSxcbiAgbmdNb2R1bGU6IE5nTW9kdWxlLFxuICBhbGxvd0R1cGxpY2F0ZURlY2xhcmF0aW9uc0luUm9vdDogYm9vbGVhbiA9IGZhbHNlLFxuKTogdm9pZCB7XG4gIG5nRGV2TW9kZSAmJiBhc3NlcnREZWZpbmVkKG1vZHVsZVR5cGUsICdSZXF1aXJlZCB2YWx1ZSBtb2R1bGVUeXBlJyk7XG4gIG5nRGV2TW9kZSAmJiBhc3NlcnREZWZpbmVkKG5nTW9kdWxlLCAnUmVxdWlyZWQgdmFsdWUgbmdNb2R1bGUnKTtcbiAgY29uc3QgZGVjbGFyYXRpb25zOiBUeXBlPGFueT5bXSA9IGZsYXR0ZW4obmdNb2R1bGUuZGVjbGFyYXRpb25zIHx8IEVNUFRZX0FSUkFZKTtcbiAgbGV0IG5nTW9kdWxlRGVmOiBhbnkgPSBudWxsO1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkobW9kdWxlVHlwZSwgTkdfTU9EX0RFRiwge1xuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICBnZXQ6ICgpID0+IHtcbiAgICAgIGlmIChuZ01vZHVsZURlZiA9PT0gbnVsbCkge1xuICAgICAgICBpZiAobmdEZXZNb2RlICYmIG5nTW9kdWxlLmltcG9ydHMgJiYgbmdNb2R1bGUuaW1wb3J0cy5pbmRleE9mKG1vZHVsZVR5cGUpID4gLTEpIHtcbiAgICAgICAgICAvLyBXZSBuZWVkIHRvIGFzc2VydCB0aGlzIGltbWVkaWF0ZWx5LCBiZWNhdXNlIGFsbG93aW5nIGl0IHRvIGNvbnRpbnVlIHdpbGwgY2F1c2UgaXQgdG9cbiAgICAgICAgICAvLyBnbyBpbnRvIGFuIGluZmluaXRlIGxvb3AgYmVmb3JlIHdlJ3ZlIHJlYWNoZWQgdGhlIHBvaW50IHdoZXJlIHdlIHRocm93IGFsbCB0aGUgZXJyb3JzLlxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgJyR7c3RyaW5naWZ5Rm9yRXJyb3IobW9kdWxlVHlwZSl9JyBtb2R1bGUgY2FuJ3QgaW1wb3J0IGl0c2VsZmApO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGNvbXBpbGVyID0gZ2V0Q29tcGlsZXJGYWNhZGUoe1xuICAgICAgICAgIHVzYWdlOiBKaXRDb21waWxlclVzYWdlLkRlY29yYXRvcixcbiAgICAgICAgICBraW5kOiAnTmdNb2R1bGUnLFxuICAgICAgICAgIHR5cGU6IG1vZHVsZVR5cGUsXG4gICAgICAgIH0pO1xuICAgICAgICBuZ01vZHVsZURlZiA9IGNvbXBpbGVyLmNvbXBpbGVOZ01vZHVsZShhbmd1bGFyQ29yZUVudiwgYG5nOi8vLyR7bW9kdWxlVHlwZS5uYW1lfS/JtW1vZC5qc2AsIHtcbiAgICAgICAgICB0eXBlOiBtb2R1bGVUeXBlLFxuICAgICAgICAgIGJvb3RzdHJhcDogZmxhdHRlbihuZ01vZHVsZS5ib290c3RyYXAgfHwgRU1QVFlfQVJSQVkpLm1hcChyZXNvbHZlRm9yd2FyZFJlZiksXG4gICAgICAgICAgZGVjbGFyYXRpb25zOiBkZWNsYXJhdGlvbnMubWFwKHJlc29sdmVGb3J3YXJkUmVmKSxcbiAgICAgICAgICBpbXBvcnRzOiBmbGF0dGVuKG5nTW9kdWxlLmltcG9ydHMgfHwgRU1QVFlfQVJSQVkpXG4gICAgICAgICAgICAubWFwKHJlc29sdmVGb3J3YXJkUmVmKVxuICAgICAgICAgICAgLm1hcChleHBhbmRNb2R1bGVXaXRoUHJvdmlkZXJzKSxcbiAgICAgICAgICBleHBvcnRzOiBmbGF0dGVuKG5nTW9kdWxlLmV4cG9ydHMgfHwgRU1QVFlfQVJSQVkpXG4gICAgICAgICAgICAubWFwKHJlc29sdmVGb3J3YXJkUmVmKVxuICAgICAgICAgICAgLm1hcChleHBhbmRNb2R1bGVXaXRoUHJvdmlkZXJzKSxcbiAgICAgICAgICBzY2hlbWFzOiBuZ01vZHVsZS5zY2hlbWFzID8gZmxhdHRlbihuZ01vZHVsZS5zY2hlbWFzKSA6IG51bGwsXG4gICAgICAgICAgaWQ6IG5nTW9kdWxlLmlkIHx8IG51bGwsXG4gICAgICAgIH0pO1xuICAgICAgICAvLyBTZXQgYHNjaGVtYXNgIG9uIG5nTW9kdWxlRGVmIHRvIGFuIGVtcHR5IGFycmF5IGluIEpJVCBtb2RlIHRvIGluZGljYXRlIHRoYXQgcnVudGltZVxuICAgICAgICAvLyBzaG91bGQgdmVyaWZ5IHRoYXQgdGhlcmUgYXJlIG5vIHVua25vd24gZWxlbWVudHMgaW4gYSB0ZW1wbGF0ZS4gSW4gQU9UIG1vZGUsIHRoYXQgY2hlY2tcbiAgICAgICAgLy8gaGFwcGVucyBhdCBjb21waWxlIHRpbWUgYW5kIGBzY2hlbWFzYCBpbmZvcm1hdGlvbiBpcyBub3QgcHJlc2VudCBvbiBDb21wb25lbnQgYW5kIE1vZHVsZVxuICAgICAgICAvLyBkZWZzIGFmdGVyIGNvbXBpbGF0aW9uIChzbyB0aGUgY2hlY2sgZG9lc24ndCBoYXBwZW4gdGhlIHNlY29uZCB0aW1lIGF0IHJ1bnRpbWUpLlxuICAgICAgICBpZiAoIW5nTW9kdWxlRGVmLnNjaGVtYXMpIHtcbiAgICAgICAgICBuZ01vZHVsZURlZi5zY2hlbWFzID0gW107XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBuZ01vZHVsZURlZjtcbiAgICB9LFxuICB9KTtcblxuICBsZXQgbmdGYWN0b3J5RGVmOiBhbnkgPSBudWxsO1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkobW9kdWxlVHlwZSwgTkdfRkFDVE9SWV9ERUYsIHtcbiAgICBnZXQ6ICgpID0+IHtcbiAgICAgIGlmIChuZ0ZhY3RvcnlEZWYgPT09IG51bGwpIHtcbiAgICAgICAgY29uc3QgY29tcGlsZXIgPSBnZXRDb21waWxlckZhY2FkZSh7XG4gICAgICAgICAgdXNhZ2U6IEppdENvbXBpbGVyVXNhZ2UuRGVjb3JhdG9yLFxuICAgICAgICAgIGtpbmQ6ICdOZ01vZHVsZScsXG4gICAgICAgICAgdHlwZTogbW9kdWxlVHlwZSxcbiAgICAgICAgfSk7XG4gICAgICAgIG5nRmFjdG9yeURlZiA9IGNvbXBpbGVyLmNvbXBpbGVGYWN0b3J5KGFuZ3VsYXJDb3JlRW52LCBgbmc6Ly8vJHttb2R1bGVUeXBlLm5hbWV9L8m1ZmFjLmpzYCwge1xuICAgICAgICAgIG5hbWU6IG1vZHVsZVR5cGUubmFtZSxcbiAgICAgICAgICB0eXBlOiBtb2R1bGVUeXBlLFxuICAgICAgICAgIGRlcHM6IHJlZmxlY3REZXBlbmRlbmNpZXMobW9kdWxlVHlwZSksXG4gICAgICAgICAgdGFyZ2V0OiBjb21waWxlci5GYWN0b3J5VGFyZ2V0Lk5nTW9kdWxlLFxuICAgICAgICAgIHR5cGVBcmd1bWVudENvdW50OiAwLFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZ0ZhY3RvcnlEZWY7XG4gICAgfSxcbiAgICAvLyBNYWtlIHRoZSBwcm9wZXJ0eSBjb25maWd1cmFibGUgaW4gZGV2IG1vZGUgdG8gYWxsb3cgb3ZlcnJpZGluZyBpbiB0ZXN0c1xuICAgIGNvbmZpZ3VyYWJsZTogISFuZ0Rldk1vZGUsXG4gIH0pO1xuXG4gIGxldCBuZ0luamVjdG9yRGVmOiBhbnkgPSBudWxsO1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkobW9kdWxlVHlwZSwgTkdfSU5KX0RFRiwge1xuICAgIGdldDogKCkgPT4ge1xuICAgICAgaWYgKG5nSW5qZWN0b3JEZWYgPT09IG51bGwpIHtcbiAgICAgICAgbmdEZXZNb2RlICYmIHZlcmlmeVNlbWFudGljc09mTmdNb2R1bGVEZWYobW9kdWxlVHlwZSwgYWxsb3dEdXBsaWNhdGVEZWNsYXJhdGlvbnNJblJvb3QpO1xuICAgICAgICBjb25zdCBtZXRhOiBSM0luamVjdG9yTWV0YWRhdGFGYWNhZGUgPSB7XG4gICAgICAgICAgbmFtZTogbW9kdWxlVHlwZS5uYW1lLFxuICAgICAgICAgIHR5cGU6IG1vZHVsZVR5cGUsXG4gICAgICAgICAgcHJvdmlkZXJzOiBuZ01vZHVsZS5wcm92aWRlcnMgfHwgRU1QVFlfQVJSQVksXG4gICAgICAgICAgaW1wb3J0czogW1xuICAgICAgICAgICAgKG5nTW9kdWxlLmltcG9ydHMgfHwgRU1QVFlfQVJSQVkpLm1hcChyZXNvbHZlRm9yd2FyZFJlZiksXG4gICAgICAgICAgICAobmdNb2R1bGUuZXhwb3J0cyB8fCBFTVBUWV9BUlJBWSkubWFwKHJlc29sdmVGb3J3YXJkUmVmKSxcbiAgICAgICAgICBdLFxuICAgICAgICB9O1xuICAgICAgICBjb25zdCBjb21waWxlciA9IGdldENvbXBpbGVyRmFjYWRlKHtcbiAgICAgICAgICB1c2FnZTogSml0Q29tcGlsZXJVc2FnZS5EZWNvcmF0b3IsXG4gICAgICAgICAga2luZDogJ05nTW9kdWxlJyxcbiAgICAgICAgICB0eXBlOiBtb2R1bGVUeXBlLFxuICAgICAgICB9KTtcbiAgICAgICAgbmdJbmplY3RvckRlZiA9IGNvbXBpbGVyLmNvbXBpbGVJbmplY3RvcihcbiAgICAgICAgICBhbmd1bGFyQ29yZUVudixcbiAgICAgICAgICBgbmc6Ly8vJHttb2R1bGVUeXBlLm5hbWV9L8m1aW5qLmpzYCxcbiAgICAgICAgICBtZXRhLFxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5nSW5qZWN0b3JEZWY7XG4gICAgfSxcbiAgICAvLyBNYWtlIHRoZSBwcm9wZXJ0eSBjb25maWd1cmFibGUgaW4gZGV2IG1vZGUgdG8gYWxsb3cgb3ZlcnJpZGluZyBpbiB0ZXN0c1xuICAgIGNvbmZpZ3VyYWJsZTogISFuZ0Rldk1vZGUsXG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGVTdGFuZGFsb25lSW5EZWNsYXJhdGlvbnNFcnJvcih0eXBlOiBUeXBlPGFueT4sIGxvY2F0aW9uOiBzdHJpbmcpIHtcbiAgY29uc3QgcHJlZml4ID0gYFVuZXhwZWN0ZWQgXCIke3N0cmluZ2lmeUZvckVycm9yKHR5cGUpfVwiIGZvdW5kIGluIHRoZSBcImRlY2xhcmF0aW9uc1wiIGFycmF5IG9mIHRoZWA7XG4gIGNvbnN0IHN1ZmZpeCA9XG4gICAgYFwiJHtzdHJpbmdpZnlGb3JFcnJvcih0eXBlKX1cIiBpcyBtYXJrZWQgYXMgc3RhbmRhbG9uZSBhbmQgY2FuJ3QgYmUgZGVjbGFyZWQgYCArXG4gICAgJ2luIGFueSBOZ01vZHVsZSAtIGRpZCB5b3UgaW50ZW5kIHRvIGltcG9ydCBpdCBpbnN0ZWFkIChieSBhZGRpbmcgaXQgdG8gdGhlIFwiaW1wb3J0c1wiIGFycmF5KT8nO1xuICByZXR1cm4gYCR7cHJlZml4fSAke2xvY2F0aW9ufSwgJHtzdWZmaXh9YDtcbn1cblxuZnVuY3Rpb24gdmVyaWZ5U2VtYW50aWNzT2ZOZ01vZHVsZURlZihcbiAgbW9kdWxlVHlwZTogTmdNb2R1bGVUeXBlLFxuICBhbGxvd0R1cGxpY2F0ZURlY2xhcmF0aW9uc0luUm9vdDogYm9vbGVhbixcbiAgaW1wb3J0aW5nTW9kdWxlPzogTmdNb2R1bGVUeXBlLFxuKTogdm9pZCB7XG4gIGlmICh2ZXJpZmllZE5nTW9kdWxlLmdldChtb2R1bGVUeXBlKSkgcmV0dXJuO1xuXG4gIC8vIHNraXAgdmVyaWZpY2F0aW9ucyBvZiBzdGFuZGFsb25lIGNvbXBvbmVudHMsIGRpcmVjdGl2ZXMsIGFuZCBwaXBlc1xuICBpZiAoaXNTdGFuZGFsb25lKG1vZHVsZVR5cGUpKSByZXR1cm47XG5cbiAgdmVyaWZpZWROZ01vZHVsZS5zZXQobW9kdWxlVHlwZSwgdHJ1ZSk7XG4gIG1vZHVsZVR5cGUgPSByZXNvbHZlRm9yd2FyZFJlZihtb2R1bGVUeXBlKTtcbiAgbGV0IG5nTW9kdWxlRGVmOiBOZ01vZHVsZURlZjxhbnk+O1xuICBpZiAoaW1wb3J0aW5nTW9kdWxlKSB7XG4gICAgbmdNb2R1bGVEZWYgPSBnZXROZ01vZHVsZURlZihtb2R1bGVUeXBlKSE7XG4gICAgaWYgKCFuZ01vZHVsZURlZikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBgVW5leHBlY3RlZCB2YWx1ZSAnJHttb2R1bGVUeXBlLm5hbWV9JyBpbXBvcnRlZCBieSB0aGUgbW9kdWxlICcke2ltcG9ydGluZ01vZHVsZS5uYW1lfScuIFBsZWFzZSBhZGQgYW4gQE5nTW9kdWxlIGFubm90YXRpb24uYCxcbiAgICAgICk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIG5nTW9kdWxlRGVmID0gZ2V0TmdNb2R1bGVEZWYobW9kdWxlVHlwZSwgdHJ1ZSk7XG4gIH1cbiAgY29uc3QgZXJyb3JzOiBzdHJpbmdbXSA9IFtdO1xuICBjb25zdCBkZWNsYXJhdGlvbnMgPSBtYXliZVVud3JhcEZuKG5nTW9kdWxlRGVmLmRlY2xhcmF0aW9ucyk7XG4gIGNvbnN0IGltcG9ydHMgPSBtYXliZVVud3JhcEZuKG5nTW9kdWxlRGVmLmltcG9ydHMpO1xuICBmbGF0dGVuKGltcG9ydHMpXG4gICAgLm1hcCh1bndyYXBNb2R1bGVXaXRoUHJvdmlkZXJzSW1wb3J0cylcbiAgICAuZm9yRWFjaCgobW9kT3JTdGFuZGFsb25lQ21wdCkgPT4ge1xuICAgICAgdmVyaWZ5U2VtYW50aWNzT2ZOZ01vZHVsZUltcG9ydChtb2RPclN0YW5kYWxvbmVDbXB0LCBtb2R1bGVUeXBlKTtcbiAgICAgIHZlcmlmeVNlbWFudGljc09mTmdNb2R1bGVEZWYobW9kT3JTdGFuZGFsb25lQ21wdCwgZmFsc2UsIG1vZHVsZVR5cGUpO1xuICAgIH0pO1xuICBjb25zdCBleHBvcnRzID0gbWF5YmVVbndyYXBGbihuZ01vZHVsZURlZi5leHBvcnRzKTtcbiAgZGVjbGFyYXRpb25zLmZvckVhY2godmVyaWZ5RGVjbGFyYXRpb25zSGF2ZURlZmluaXRpb25zKTtcbiAgZGVjbGFyYXRpb25zLmZvckVhY2godmVyaWZ5RGlyZWN0aXZlc0hhdmVTZWxlY3Rvcik7XG4gIGRlY2xhcmF0aW9ucy5mb3JFYWNoKChkZWNsYXJhdGlvblR5cGUpID0+IHZlcmlmeU5vdFN0YW5kYWxvbmUoZGVjbGFyYXRpb25UeXBlLCBtb2R1bGVUeXBlKSk7XG4gIGNvbnN0IGNvbWJpbmVkRGVjbGFyYXRpb25zOiBUeXBlPGFueT5bXSA9IFtcbiAgICAuLi5kZWNsYXJhdGlvbnMubWFwKHJlc29sdmVGb3J3YXJkUmVmKSxcbiAgICAuLi5mbGF0dGVuKGltcG9ydHMubWFwKGNvbXB1dGVDb21iaW5lZEV4cG9ydHMpKS5tYXAocmVzb2x2ZUZvcndhcmRSZWYpLFxuICBdO1xuICBleHBvcnRzLmZvckVhY2godmVyaWZ5RXhwb3J0c0FyZURlY2xhcmVkT3JSZUV4cG9ydGVkKTtcbiAgZGVjbGFyYXRpb25zLmZvckVhY2goKGRlY2wpID0+IHZlcmlmeURlY2xhcmF0aW9uSXNVbmlxdWUoZGVjbCwgYWxsb3dEdXBsaWNhdGVEZWNsYXJhdGlvbnNJblJvb3QpKTtcblxuICBjb25zdCBuZ01vZHVsZSA9IGdldEFubm90YXRpb248TmdNb2R1bGU+KG1vZHVsZVR5cGUsICdOZ01vZHVsZScpO1xuICBpZiAobmdNb2R1bGUpIHtcbiAgICBuZ01vZHVsZS5pbXBvcnRzICYmXG4gICAgICBmbGF0dGVuKG5nTW9kdWxlLmltcG9ydHMpXG4gICAgICAgIC5tYXAodW53cmFwTW9kdWxlV2l0aFByb3ZpZGVyc0ltcG9ydHMpXG4gICAgICAgIC5mb3JFYWNoKChtb2QpID0+IHtcbiAgICAgICAgICB2ZXJpZnlTZW1hbnRpY3NPZk5nTW9kdWxlSW1wb3J0KG1vZCwgbW9kdWxlVHlwZSk7XG4gICAgICAgICAgdmVyaWZ5U2VtYW50aWNzT2ZOZ01vZHVsZURlZihtb2QsIGZhbHNlLCBtb2R1bGVUeXBlKTtcbiAgICAgICAgfSk7XG4gICAgbmdNb2R1bGUuYm9vdHN0cmFwICYmIGRlZXBGb3JFYWNoKG5nTW9kdWxlLmJvb3RzdHJhcCwgdmVyaWZ5Q29ycmVjdEJvb3RzdHJhcFR5cGUpO1xuICAgIG5nTW9kdWxlLmJvb3RzdHJhcCAmJiBkZWVwRm9yRWFjaChuZ01vZHVsZS5ib290c3RyYXAsIHZlcmlmeUNvbXBvbmVudElzUGFydE9mTmdNb2R1bGUpO1xuICB9XG5cbiAgLy8gVGhyb3cgRXJyb3IgaWYgYW55IGVycm9ycyB3ZXJlIGRldGVjdGVkLlxuICBpZiAoZXJyb3JzLmxlbmd0aCkge1xuICAgIHRocm93IG5ldyBFcnJvcihlcnJvcnMuam9pbignXFxuJykpO1xuICB9XG4gIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICBmdW5jdGlvbiB2ZXJpZnlEZWNsYXJhdGlvbnNIYXZlRGVmaW5pdGlvbnModHlwZTogVHlwZTxhbnk+KTogdm9pZCB7XG4gICAgdHlwZSA9IHJlc29sdmVGb3J3YXJkUmVmKHR5cGUpO1xuICAgIGNvbnN0IGRlZiA9IGdldENvbXBvbmVudERlZih0eXBlKSB8fCBnZXREaXJlY3RpdmVEZWYodHlwZSkgfHwgZ2V0UGlwZURlZih0eXBlKTtcbiAgICBpZiAoIWRlZikge1xuICAgICAgZXJyb3JzLnB1c2goXG4gICAgICAgIGBVbmV4cGVjdGVkIHZhbHVlICcke3N0cmluZ2lmeUZvckVycm9yKHR5cGUpfScgZGVjbGFyZWQgYnkgdGhlIG1vZHVsZSAnJHtzdHJpbmdpZnlGb3JFcnJvcihcbiAgICAgICAgICBtb2R1bGVUeXBlLFxuICAgICAgICApfScuIFBsZWFzZSBhZGQgYSBAUGlwZS9ARGlyZWN0aXZlL0BDb21wb25lbnQgYW5ub3RhdGlvbi5gLFxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiB2ZXJpZnlEaXJlY3RpdmVzSGF2ZVNlbGVjdG9yKHR5cGU6IFR5cGU8YW55Pik6IHZvaWQge1xuICAgIHR5cGUgPSByZXNvbHZlRm9yd2FyZFJlZih0eXBlKTtcbiAgICBjb25zdCBkZWYgPSBnZXREaXJlY3RpdmVEZWYodHlwZSk7XG4gICAgaWYgKCFnZXRDb21wb25lbnREZWYodHlwZSkgJiYgZGVmICYmIGRlZi5zZWxlY3RvcnMubGVuZ3RoID09IDApIHtcbiAgICAgIGVycm9ycy5wdXNoKGBEaXJlY3RpdmUgJHtzdHJpbmdpZnlGb3JFcnJvcih0eXBlKX0gaGFzIG5vIHNlbGVjdG9yLCBwbGVhc2UgYWRkIGl0IWApO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHZlcmlmeU5vdFN0YW5kYWxvbmUodHlwZTogVHlwZTxhbnk+LCBtb2R1bGVUeXBlOiBOZ01vZHVsZVR5cGUpOiB2b2lkIHtcbiAgICB0eXBlID0gcmVzb2x2ZUZvcndhcmRSZWYodHlwZSk7XG4gICAgY29uc3QgZGVmID0gZ2V0Q29tcG9uZW50RGVmKHR5cGUpIHx8IGdldERpcmVjdGl2ZURlZih0eXBlKSB8fCBnZXRQaXBlRGVmKHR5cGUpO1xuICAgIGlmIChkZWY/LnN0YW5kYWxvbmUpIHtcbiAgICAgIGNvbnN0IGxvY2F0aW9uID0gYFwiJHtzdHJpbmdpZnlGb3JFcnJvcihtb2R1bGVUeXBlKX1cIiBOZ01vZHVsZWA7XG4gICAgICBlcnJvcnMucHVzaChnZW5lcmF0ZVN0YW5kYWxvbmVJbkRlY2xhcmF0aW9uc0Vycm9yKHR5cGUsIGxvY2F0aW9uKSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gdmVyaWZ5RXhwb3J0c0FyZURlY2xhcmVkT3JSZUV4cG9ydGVkKHR5cGU6IFR5cGU8YW55Pikge1xuICAgIHR5cGUgPSByZXNvbHZlRm9yd2FyZFJlZih0eXBlKTtcbiAgICBjb25zdCBraW5kID1cbiAgICAgIChnZXRDb21wb25lbnREZWYodHlwZSkgJiYgJ2NvbXBvbmVudCcpIHx8XG4gICAgICAoZ2V0RGlyZWN0aXZlRGVmKHR5cGUpICYmICdkaXJlY3RpdmUnKSB8fFxuICAgICAgKGdldFBpcGVEZWYodHlwZSkgJiYgJ3BpcGUnKTtcbiAgICBpZiAoa2luZCkge1xuICAgICAgLy8gb25seSBjaGVja2VkIGlmIHdlIGFyZSBkZWNsYXJlZCBhcyBDb21wb25lbnQsIERpcmVjdGl2ZSwgb3IgUGlwZVxuICAgICAgLy8gTW9kdWxlcyBkb24ndCBuZWVkIHRvIGJlIGRlY2xhcmVkIG9yIGltcG9ydGVkLlxuICAgICAgaWYgKGNvbWJpbmVkRGVjbGFyYXRpb25zLmxhc3RJbmRleE9mKHR5cGUpID09PSAtMSkge1xuICAgICAgICAvLyBXZSBhcmUgZXhwb3J0aW5nIHNvbWV0aGluZyB3aGljaCB3ZSBkb24ndCBleHBsaWNpdGx5IGRlY2xhcmUgb3IgaW1wb3J0LlxuICAgICAgICBlcnJvcnMucHVzaChcbiAgICAgICAgICBgQ2FuJ3QgZXhwb3J0ICR7a2luZH0gJHtzdHJpbmdpZnlGb3JFcnJvcih0eXBlKX0gZnJvbSAke3N0cmluZ2lmeUZvckVycm9yKFxuICAgICAgICAgICAgbW9kdWxlVHlwZSxcbiAgICAgICAgICApfSBhcyBpdCB3YXMgbmVpdGhlciBkZWNsYXJlZCBub3IgaW1wb3J0ZWQhYCxcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiB2ZXJpZnlEZWNsYXJhdGlvbklzVW5pcXVlKHR5cGU6IFR5cGU8YW55Piwgc3VwcHJlc3NFcnJvcnM6IGJvb2xlYW4pIHtcbiAgICB0eXBlID0gcmVzb2x2ZUZvcndhcmRSZWYodHlwZSk7XG4gICAgY29uc3QgZXhpc3RpbmdNb2R1bGUgPSBvd25lck5nTW9kdWxlLmdldCh0eXBlKTtcbiAgICBpZiAoZXhpc3RpbmdNb2R1bGUgJiYgZXhpc3RpbmdNb2R1bGUgIT09IG1vZHVsZVR5cGUpIHtcbiAgICAgIGlmICghc3VwcHJlc3NFcnJvcnMpIHtcbiAgICAgICAgY29uc3QgbW9kdWxlcyA9IFtleGlzdGluZ01vZHVsZSwgbW9kdWxlVHlwZV0ubWFwKHN0cmluZ2lmeUZvckVycm9yKS5zb3J0KCk7XG4gICAgICAgIGVycm9ycy5wdXNoKFxuICAgICAgICAgIGBUeXBlICR7c3RyaW5naWZ5Rm9yRXJyb3IodHlwZSl9IGlzIHBhcnQgb2YgdGhlIGRlY2xhcmF0aW9ucyBvZiAyIG1vZHVsZXM6ICR7XG4gICAgICAgICAgICBtb2R1bGVzWzBdXG4gICAgICAgICAgfSBhbmQgJHttb2R1bGVzWzFdfSEgYCArXG4gICAgICAgICAgICBgUGxlYXNlIGNvbnNpZGVyIG1vdmluZyAke3N0cmluZ2lmeUZvckVycm9yKHR5cGUpfSB0byBhIGhpZ2hlciBtb2R1bGUgdGhhdCBpbXBvcnRzICR7XG4gICAgICAgICAgICAgIG1vZHVsZXNbMF1cbiAgICAgICAgICAgIH0gYW5kICR7bW9kdWxlc1sxXX0uIGAgK1xuICAgICAgICAgICAgYFlvdSBjYW4gYWxzbyBjcmVhdGUgYSBuZXcgTmdNb2R1bGUgdGhhdCBleHBvcnRzIGFuZCBpbmNsdWRlcyAke3N0cmluZ2lmeUZvckVycm9yKFxuICAgICAgICAgICAgICB0eXBlLFxuICAgICAgICAgICAgKX0gdGhlbiBpbXBvcnQgdGhhdCBOZ01vZHVsZSBpbiAke21vZHVsZXNbMF19IGFuZCAke21vZHVsZXNbMV19LmAsXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIE1hcmsgdHlwZSBhcyBoYXZpbmcgb3duZXIuXG4gICAgICBvd25lck5nTW9kdWxlLnNldCh0eXBlLCBtb2R1bGVUeXBlKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiB2ZXJpZnlDb21wb25lbnRJc1BhcnRPZk5nTW9kdWxlKHR5cGU6IFR5cGU8YW55Pikge1xuICAgIHR5cGUgPSByZXNvbHZlRm9yd2FyZFJlZih0eXBlKTtcbiAgICBjb25zdCBleGlzdGluZ01vZHVsZSA9IG93bmVyTmdNb2R1bGUuZ2V0KHR5cGUpO1xuICAgIGlmICghZXhpc3RpbmdNb2R1bGUgJiYgIWlzU3RhbmRhbG9uZSh0eXBlKSkge1xuICAgICAgZXJyb3JzLnB1c2goXG4gICAgICAgIGBDb21wb25lbnQgJHtzdHJpbmdpZnlGb3JFcnJvcihcbiAgICAgICAgICB0eXBlLFxuICAgICAgICApfSBpcyBub3QgcGFydCBvZiBhbnkgTmdNb2R1bGUgb3IgdGhlIG1vZHVsZSBoYXMgbm90IGJlZW4gaW1wb3J0ZWQgaW50byB5b3VyIG1vZHVsZS5gLFxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiB2ZXJpZnlDb3JyZWN0Qm9vdHN0cmFwVHlwZSh0eXBlOiBUeXBlPGFueT4pIHtcbiAgICB0eXBlID0gcmVzb2x2ZUZvcndhcmRSZWYodHlwZSk7XG4gICAgaWYgKCFnZXRDb21wb25lbnREZWYodHlwZSkpIHtcbiAgICAgIGVycm9ycy5wdXNoKGAke3N0cmluZ2lmeUZvckVycm9yKHR5cGUpfSBjYW5ub3QgYmUgdXNlZCBhcyBhbiBlbnRyeSBjb21wb25lbnQuYCk7XG4gICAgfVxuICAgIGlmIChpc1N0YW5kYWxvbmUodHlwZSkpIHtcbiAgICAgIC8vIE5vdGU6IHRoaXMgZXJyb3Igc2hvdWxkIGJlIHRoZSBzYW1lIGFzIHRoZVxuICAgICAgLy8gYE5HTU9EVUxFX0JPT1RTVFJBUF9JU19TVEFOREFMT05FYCBvbmUgaW4gQU9UIGNvbXBpbGVyLlxuICAgICAgZXJyb3JzLnB1c2goXG4gICAgICAgIGBUaGUgXFxgJHtzdHJpbmdpZnlGb3JFcnJvcih0eXBlKX1cXGAgY2xhc3MgaXMgYSBzdGFuZGFsb25lIGNvbXBvbmVudCwgd2hpY2ggY2FuIGAgK1xuICAgICAgICAgIGBub3QgYmUgdXNlZCBpbiB0aGUgXFxgQE5nTW9kdWxlLmJvb3RzdHJhcFxcYCBhcnJheS4gVXNlIHRoZSBcXGBib290c3RyYXBBcHBsaWNhdGlvblxcYCBgICtcbiAgICAgICAgICBgZnVuY3Rpb24gZm9yIGJvb3RzdHJhcCBpbnN0ZWFkLmAsXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHZlcmlmeVNlbWFudGljc09mTmdNb2R1bGVJbXBvcnQodHlwZTogVHlwZTxhbnk+LCBpbXBvcnRpbmdNb2R1bGU6IFR5cGU8YW55Pikge1xuICAgIHR5cGUgPSByZXNvbHZlRm9yd2FyZFJlZih0eXBlKTtcblxuICAgIGNvbnN0IGRpcmVjdGl2ZURlZiA9IGdldENvbXBvbmVudERlZih0eXBlKSB8fCBnZXREaXJlY3RpdmVEZWYodHlwZSk7XG4gICAgaWYgKGRpcmVjdGl2ZURlZiAhPT0gbnVsbCAmJiAhZGlyZWN0aXZlRGVmLnN0YW5kYWxvbmUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYFVuZXhwZWN0ZWQgZGlyZWN0aXZlICcke3R5cGUubmFtZX0nIGltcG9ydGVkIGJ5IHRoZSBtb2R1bGUgJyR7aW1wb3J0aW5nTW9kdWxlLm5hbWV9Jy4gUGxlYXNlIGFkZCBhbiBATmdNb2R1bGUgYW5ub3RhdGlvbi5gLFxuICAgICAgKTtcbiAgICB9XG5cbiAgICBjb25zdCBwaXBlRGVmID0gZ2V0UGlwZURlZih0eXBlKTtcbiAgICBpZiAocGlwZURlZiAhPT0gbnVsbCAmJiAhcGlwZURlZi5zdGFuZGFsb25lKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBVbmV4cGVjdGVkIHBpcGUgJyR7dHlwZS5uYW1lfScgaW1wb3J0ZWQgYnkgdGhlIG1vZHVsZSAnJHtpbXBvcnRpbmdNb2R1bGUubmFtZX0nLiBQbGVhc2UgYWRkIGFuIEBOZ01vZHVsZSBhbm5vdGF0aW9uLmAsXG4gICAgICApO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiB1bndyYXBNb2R1bGVXaXRoUHJvdmlkZXJzSW1wb3J0cyhcbiAgdHlwZU9yV2l0aFByb3ZpZGVyczogTmdNb2R1bGVUeXBlPGFueT4gfCB7bmdNb2R1bGU6IE5nTW9kdWxlVHlwZTxhbnk+fSxcbik6IE5nTW9kdWxlVHlwZTxhbnk+IHtcbiAgdHlwZU9yV2l0aFByb3ZpZGVycyA9IHJlc29sdmVGb3J3YXJkUmVmKHR5cGVPcldpdGhQcm92aWRlcnMpO1xuICByZXR1cm4gKHR5cGVPcldpdGhQcm92aWRlcnMgYXMgYW55KS5uZ01vZHVsZSB8fCB0eXBlT3JXaXRoUHJvdmlkZXJzO1xufVxuXG5mdW5jdGlvbiBnZXRBbm5vdGF0aW9uPFQ+KHR5cGU6IGFueSwgbmFtZTogc3RyaW5nKTogVCB8IG51bGwge1xuICBsZXQgYW5ub3RhdGlvbjogVCB8IG51bGwgPSBudWxsO1xuICBjb2xsZWN0KHR5cGUuX19hbm5vdGF0aW9uc19fKTtcbiAgY29sbGVjdCh0eXBlLmRlY29yYXRvcnMpO1xuICByZXR1cm4gYW5ub3RhdGlvbjtcblxuICBmdW5jdGlvbiBjb2xsZWN0KGFubm90YXRpb25zOiBhbnlbXSB8IG51bGwpIHtcbiAgICBpZiAoYW5ub3RhdGlvbnMpIHtcbiAgICAgIGFubm90YXRpb25zLmZvckVhY2gocmVhZEFubm90YXRpb24pO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHJlYWRBbm5vdGF0aW9uKGRlY29yYXRvcjoge1xuICAgIHR5cGU6IHtwcm90b3R5cGU6IHtuZ01ldGFkYXRhTmFtZTogc3RyaW5nfTsgYXJnczogYW55W119O1xuICAgIGFyZ3M6IGFueTtcbiAgfSk6IHZvaWQge1xuICAgIGlmICghYW5ub3RhdGlvbikge1xuICAgICAgY29uc3QgcHJvdG8gPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YoZGVjb3JhdG9yKTtcbiAgICAgIGlmIChwcm90by5uZ01ldGFkYXRhTmFtZSA9PSBuYW1lKSB7XG4gICAgICAgIGFubm90YXRpb24gPSBkZWNvcmF0b3IgYXMgYW55O1xuICAgICAgfSBlbHNlIGlmIChkZWNvcmF0b3IudHlwZSkge1xuICAgICAgICBjb25zdCBwcm90byA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihkZWNvcmF0b3IudHlwZSk7XG4gICAgICAgIGlmIChwcm90by5uZ01ldGFkYXRhTmFtZSA9PSBuYW1lKSB7XG4gICAgICAgICAgYW5ub3RhdGlvbiA9IGRlY29yYXRvci5hcmdzWzBdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogS2VlcCB0cmFjayBvZiBjb21waWxlZCBjb21wb25lbnRzLiBUaGlzIGlzIG5lZWRlZCBiZWNhdXNlIGluIHRlc3RzIHdlIG9mdGVuIHdhbnQgdG8gY29tcGlsZSB0aGVcbiAqIHNhbWUgY29tcG9uZW50IHdpdGggbW9yZSB0aGFuIG9uZSBOZ01vZHVsZS4gVGhpcyB3b3VsZCBjYXVzZSBhbiBlcnJvciB1bmxlc3Mgd2UgcmVzZXQgd2hpY2hcbiAqIE5nTW9kdWxlIHRoZSBjb21wb25lbnQgYmVsb25ncyB0by4gV2Uga2VlcCB0aGUgbGlzdCBvZiBjb21waWxlZCBjb21wb25lbnRzIGhlcmUgc28gdGhhdCB0aGVcbiAqIFRlc3RCZWQgY2FuIHJlc2V0IGl0IGxhdGVyLlxuICovXG5sZXQgb3duZXJOZ01vZHVsZSA9IG5ldyBXZWFrTWFwPFR5cGU8YW55PiwgTmdNb2R1bGVUeXBlPGFueT4+KCk7XG5sZXQgdmVyaWZpZWROZ01vZHVsZSA9IG5ldyBXZWFrTWFwPE5nTW9kdWxlVHlwZTxhbnk+LCBib29sZWFuPigpO1xuXG5leHBvcnQgZnVuY3Rpb24gcmVzZXRDb21waWxlZENvbXBvbmVudHMoKTogdm9pZCB7XG4gIG93bmVyTmdNb2R1bGUgPSBuZXcgV2Vha01hcDxUeXBlPGFueT4sIE5nTW9kdWxlVHlwZTxhbnk+PigpO1xuICB2ZXJpZmllZE5nTW9kdWxlID0gbmV3IFdlYWtNYXA8TmdNb2R1bGVUeXBlPGFueT4sIGJvb2xlYW4+KCk7XG4gIG1vZHVsZVF1ZXVlLmxlbmd0aCA9IDA7XG4gIEdFTkVSQVRFRF9DT01QX0lEUy5jbGVhcigpO1xufVxuXG4vKipcbiAqIENvbXB1dGVzIHRoZSBjb21iaW5lZCBkZWNsYXJhdGlvbnMgb2YgZXhwbGljaXQgZGVjbGFyYXRpb25zLCBhcyB3ZWxsIGFzIGRlY2xhcmF0aW9ucyBpbmhlcml0ZWQgYnlcbiAqIHRyYXZlcnNpbmcgdGhlIGV4cG9ydHMgb2YgaW1wb3J0ZWQgbW9kdWxlcy5cbiAqIEBwYXJhbSB0eXBlXG4gKi9cbmZ1bmN0aW9uIGNvbXB1dGVDb21iaW5lZEV4cG9ydHModHlwZTogVHlwZTxhbnk+KTogVHlwZTxhbnk+W10ge1xuICB0eXBlID0gcmVzb2x2ZUZvcndhcmRSZWYodHlwZSk7XG4gIGNvbnN0IG5nTW9kdWxlRGVmID0gZ2V0TmdNb2R1bGVEZWYodHlwZSk7XG5cbiAgLy8gYSBzdGFuZGFsb25lIGNvbXBvbmVudCwgZGlyZWN0aXZlIG9yIHBpcGVcbiAgaWYgKG5nTW9kdWxlRGVmID09PSBudWxsKSB7XG4gICAgcmV0dXJuIFt0eXBlXTtcbiAgfVxuXG4gIHJldHVybiBmbGF0dGVuKFxuICAgIG1heWJlVW53cmFwRm4obmdNb2R1bGVEZWYuZXhwb3J0cykubWFwKCh0eXBlKSA9PiB7XG4gICAgICBjb25zdCBuZ01vZHVsZURlZiA9IGdldE5nTW9kdWxlRGVmKHR5cGUpO1xuICAgICAgaWYgKG5nTW9kdWxlRGVmKSB7XG4gICAgICAgIHZlcmlmeVNlbWFudGljc09mTmdNb2R1bGVEZWYodHlwZSBhcyBhbnkgYXMgTmdNb2R1bGVUeXBlLCBmYWxzZSk7XG4gICAgICAgIHJldHVybiBjb21wdXRlQ29tYmluZWRFeHBvcnRzKHR5cGUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHR5cGU7XG4gICAgICB9XG4gICAgfSksXG4gICk7XG59XG5cbi8qKlxuICogU29tZSBkZWNsYXJlZCBjb21wb25lbnRzIG1heSBiZSBjb21waWxlZCBhc3luY2hyb25vdXNseSwgYW5kIHRodXMgbWF5IG5vdCBoYXZlIHRoZWlyXG4gKiDJtWNtcCBzZXQgeWV0LiBJZiB0aGlzIGlzIHRoZSBjYXNlLCB0aGVuIGEgcmVmZXJlbmNlIHRvIHRoZSBtb2R1bGUgaXMgd3JpdHRlbiBpbnRvXG4gKiB0aGUgYG5nU2VsZWN0b3JTY29wZWAgcHJvcGVydHkgb2YgdGhlIGRlY2xhcmVkIHR5cGUuXG4gKi9cbmZ1bmN0aW9uIHNldFNjb3BlT25EZWNsYXJlZENvbXBvbmVudHMobW9kdWxlVHlwZTogVHlwZTxhbnk+LCBuZ01vZHVsZTogTmdNb2R1bGUpIHtcbiAgY29uc3QgZGVjbGFyYXRpb25zOiBUeXBlPGFueT5bXSA9IGZsYXR0ZW4obmdNb2R1bGUuZGVjbGFyYXRpb25zIHx8IEVNUFRZX0FSUkFZKTtcblxuICBjb25zdCB0cmFuc2l0aXZlU2NvcGVzID0gdHJhbnNpdGl2ZVNjb3Blc0Zvcihtb2R1bGVUeXBlKTtcblxuICBkZWNsYXJhdGlvbnMuZm9yRWFjaCgoZGVjbGFyYXRpb24pID0+IHtcbiAgICBkZWNsYXJhdGlvbiA9IHJlc29sdmVGb3J3YXJkUmVmKGRlY2xhcmF0aW9uKTtcbiAgICBpZiAoZGVjbGFyYXRpb24uaGFzT3duUHJvcGVydHkoTkdfQ09NUF9ERUYpKSB7XG4gICAgICAvLyBBIGDJtWNtcGAgZmllbGQgZXhpc3RzIC0gZ28gYWhlYWQgYW5kIHBhdGNoIHRoZSBjb21wb25lbnQgZGlyZWN0bHkuXG4gICAgICBjb25zdCBjb21wb25lbnQgPSBkZWNsYXJhdGlvbiBhcyBUeXBlPGFueT4gJiB7ybVjbXA6IENvbXBvbmVudERlZjxhbnk+fTtcbiAgICAgIGNvbnN0IGNvbXBvbmVudERlZiA9IGdldENvbXBvbmVudERlZihjb21wb25lbnQpITtcbiAgICAgIHBhdGNoQ29tcG9uZW50RGVmV2l0aFNjb3BlKGNvbXBvbmVudERlZiwgdHJhbnNpdGl2ZVNjb3Blcyk7XG4gICAgfSBlbHNlIGlmIChcbiAgICAgICFkZWNsYXJhdGlvbi5oYXNPd25Qcm9wZXJ0eShOR19ESVJfREVGKSAmJlxuICAgICAgIWRlY2xhcmF0aW9uLmhhc093blByb3BlcnR5KE5HX1BJUEVfREVGKVxuICAgICkge1xuICAgICAgLy8gU2V0IGBuZ1NlbGVjdG9yU2NvcGVgIGZvciBmdXR1cmUgcmVmZXJlbmNlIHdoZW4gdGhlIGNvbXBvbmVudCBjb21waWxhdGlvbiBmaW5pc2hlcy5cbiAgICAgIChkZWNsYXJhdGlvbiBhcyBUeXBlPGFueT4gJiB7bmdTZWxlY3RvclNjb3BlPzogYW55fSkubmdTZWxlY3RvclNjb3BlID0gbW9kdWxlVHlwZTtcbiAgICB9XG4gIH0pO1xufVxuXG4vKipcbiAqIFBhdGNoIHRoZSBkZWZpbml0aW9uIG9mIGEgY29tcG9uZW50IHdpdGggZGlyZWN0aXZlcyBhbmQgcGlwZXMgZnJvbSB0aGUgY29tcGlsYXRpb24gc2NvcGUgb2ZcbiAqIGEgZ2l2ZW4gbW9kdWxlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcGF0Y2hDb21wb25lbnREZWZXaXRoU2NvcGU8Qz4oXG4gIGNvbXBvbmVudERlZjogQ29tcG9uZW50RGVmPEM+LFxuICB0cmFuc2l0aXZlU2NvcGVzOiBOZ01vZHVsZVRyYW5zaXRpdmVTY29wZXMsXG4pIHtcbiAgY29tcG9uZW50RGVmLmRpcmVjdGl2ZURlZnMgPSAoKSA9PlxuICAgIEFycmF5LmZyb20odHJhbnNpdGl2ZVNjb3Blcy5jb21waWxhdGlvbi5kaXJlY3RpdmVzKVxuICAgICAgLm1hcCgoZGlyKSA9PlxuICAgICAgICBkaXIuaGFzT3duUHJvcGVydHkoTkdfQ09NUF9ERUYpID8gZ2V0Q29tcG9uZW50RGVmKGRpcikhIDogZ2V0RGlyZWN0aXZlRGVmKGRpcikhLFxuICAgICAgKVxuICAgICAgLmZpbHRlcigoZGVmKSA9PiAhIWRlZik7XG4gIGNvbXBvbmVudERlZi5waXBlRGVmcyA9ICgpID0+XG4gICAgQXJyYXkuZnJvbSh0cmFuc2l0aXZlU2NvcGVzLmNvbXBpbGF0aW9uLnBpcGVzKS5tYXAoKHBpcGUpID0+IGdldFBpcGVEZWYocGlwZSkhKTtcbiAgY29tcG9uZW50RGVmLnNjaGVtYXMgPSB0cmFuc2l0aXZlU2NvcGVzLnNjaGVtYXM7XG5cbiAgLy8gU2luY2Ugd2UgYXZvaWQgQ29tcG9uZW50cy9EaXJlY3RpdmVzL1BpcGVzIHJlY29tcGlsaW5nIGluIGNhc2UgdGhlcmUgYXJlIG5vIG92ZXJyaWRlcywgd2VcbiAgLy8gbWF5IGZhY2UgYSBwcm9ibGVtIHdoZXJlIHByZXZpb3VzbHkgY29tcGlsZWQgZGVmcyBhdmFpbGFibGUgdG8gYSBnaXZlbiBDb21wb25lbnQvRGlyZWN0aXZlXG4gIC8vIGFyZSBjYWNoZWQgaW4gVFZpZXcgYW5kIG1heSBiZWNvbWUgc3RhbGUgKGluIGNhc2UgYW55IG9mIHRoZXNlIGRlZnMgZ2V0cyByZWNvbXBpbGVkKS4gSW5cbiAgLy8gb3JkZXIgdG8gYXZvaWQgdGhpcyBwcm9ibGVtLCB3ZSBmb3JjZSBmcmVzaCBUVmlldyB0byBiZSBjcmVhdGVkLlxuICBjb21wb25lbnREZWYudFZpZXcgPSBudWxsO1xufVxuXG4vKipcbiAqIENvbXB1dGUgdGhlIHBhaXIgb2YgdHJhbnNpdGl2ZSBzY29wZXMgKGNvbXBpbGF0aW9uIHNjb3BlIGFuZCBleHBvcnRlZCBzY29wZSkgZm9yIGEgZ2l2ZW4gdHlwZVxuICogKGVpdGhlciBhIE5nTW9kdWxlIG9yIGEgc3RhbmRhbG9uZSBjb21wb25lbnQgLyBkaXJlY3RpdmUgLyBwaXBlKS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zaXRpdmVTY29wZXNGb3I8VD4odHlwZTogVHlwZTxUPik6IE5nTW9kdWxlVHJhbnNpdGl2ZVNjb3BlcyB7XG4gIGlmIChpc05nTW9kdWxlKHR5cGUpKSB7XG4gICAgaWYgKFVTRV9SVU5USU1FX0RFUFNfVFJBQ0tFUl9GT1JfSklUKSB7XG4gICAgICBjb25zdCBzY29wZSA9IGRlcHNUcmFja2VyLmdldE5nTW9kdWxlU2NvcGUodHlwZSk7XG4gICAgICBjb25zdCBkZWYgPSBnZXROZ01vZHVsZURlZih0eXBlLCB0cnVlKTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHNjaGVtYXM6IGRlZi5zY2hlbWFzIHx8IG51bGwsXG4gICAgICAgIC4uLnNjb3BlLFxuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRyYW5zaXRpdmVTY29wZXNGb3JOZ01vZHVsZSh0eXBlKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoaXNTdGFuZGFsb25lKHR5cGUpKSB7XG4gICAgY29uc3QgZGlyZWN0aXZlRGVmID0gZ2V0Q29tcG9uZW50RGVmKHR5cGUpIHx8IGdldERpcmVjdGl2ZURlZih0eXBlKTtcbiAgICBpZiAoZGlyZWN0aXZlRGVmICE9PSBudWxsKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBzY2hlbWFzOiBudWxsLFxuICAgICAgICBjb21waWxhdGlvbjoge1xuICAgICAgICAgIGRpcmVjdGl2ZXM6IG5ldyBTZXQ8YW55PigpLFxuICAgICAgICAgIHBpcGVzOiBuZXcgU2V0PGFueT4oKSxcbiAgICAgICAgfSxcbiAgICAgICAgZXhwb3J0ZWQ6IHtcbiAgICAgICAgICBkaXJlY3RpdmVzOiBuZXcgU2V0PGFueT4oW3R5cGVdKSxcbiAgICAgICAgICBwaXBlczogbmV3IFNldDxhbnk+KCksXG4gICAgICAgIH0sXG4gICAgICB9O1xuICAgIH1cblxuICAgIGNvbnN0IHBpcGVEZWYgPSBnZXRQaXBlRGVmKHR5cGUpO1xuICAgIGlmIChwaXBlRGVmICE9PSBudWxsKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBzY2hlbWFzOiBudWxsLFxuICAgICAgICBjb21waWxhdGlvbjoge1xuICAgICAgICAgIGRpcmVjdGl2ZXM6IG5ldyBTZXQ8YW55PigpLFxuICAgICAgICAgIHBpcGVzOiBuZXcgU2V0PGFueT4oKSxcbiAgICAgICAgfSxcbiAgICAgICAgZXhwb3J0ZWQ6IHtcbiAgICAgICAgICBkaXJlY3RpdmVzOiBuZXcgU2V0PGFueT4oKSxcbiAgICAgICAgICBwaXBlczogbmV3IFNldDxhbnk+KFt0eXBlXSksXG4gICAgICAgIH0sXG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIC8vIFRPRE86IGNoYW5nZSB0aGUgZXJyb3IgbWVzc2FnZSB0byBiZSBtb3JlIHVzZXItZmFjaW5nIGFuZCB0YWtlIHN0YW5kYWxvbmUgaW50byBhY2NvdW50XG4gIHRocm93IG5ldyBFcnJvcihgJHt0eXBlLm5hbWV9IGRvZXMgbm90IGhhdmUgYSBtb2R1bGUgZGVmICjJtW1vZCBwcm9wZXJ0eSlgKTtcbn1cblxuLyoqXG4gKiBDb21wdXRlIHRoZSBwYWlyIG9mIHRyYW5zaXRpdmUgc2NvcGVzIChjb21waWxhdGlvbiBzY29wZSBhbmQgZXhwb3J0ZWQgc2NvcGUpIGZvciBhIGdpdmVuIG1vZHVsZS5cbiAqXG4gKiBUaGlzIG9wZXJhdGlvbiBpcyBtZW1vaXplZCBhbmQgdGhlIHJlc3VsdCBpcyBjYWNoZWQgb24gdGhlIG1vZHVsZSdzIGRlZmluaXRpb24uIFRoaXMgZnVuY3Rpb24gY2FuXG4gKiBiZSBjYWxsZWQgb24gbW9kdWxlcyB3aXRoIGNvbXBvbmVudHMgdGhhdCBoYXZlIG5vdCBmdWxseSBjb21waWxlZCB5ZXQsIGJ1dCB0aGUgcmVzdWx0IHNob3VsZCBub3RcbiAqIGJlIHVzZWQgdW50aWwgdGhleSBoYXZlLlxuICpcbiAqIEBwYXJhbSBtb2R1bGVUeXBlIG1vZHVsZSB0aGF0IHRyYW5zaXRpdmUgc2NvcGUgc2hvdWxkIGJlIGNhbGN1bGF0ZWQgZm9yLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNpdGl2ZVNjb3Blc0Zvck5nTW9kdWxlPFQ+KG1vZHVsZVR5cGU6IFR5cGU8VD4pOiBOZ01vZHVsZVRyYW5zaXRpdmVTY29wZXMge1xuICBjb25zdCBkZWYgPSBnZXROZ01vZHVsZURlZihtb2R1bGVUeXBlLCB0cnVlKTtcblxuICBpZiAoZGVmLnRyYW5zaXRpdmVDb21waWxlU2NvcGVzICE9PSBudWxsKSB7XG4gICAgcmV0dXJuIGRlZi50cmFuc2l0aXZlQ29tcGlsZVNjb3BlcztcbiAgfVxuXG4gIGNvbnN0IHNjb3BlczogTmdNb2R1bGVUcmFuc2l0aXZlU2NvcGVzID0ge1xuICAgIHNjaGVtYXM6IGRlZi5zY2hlbWFzIHx8IG51bGwsXG4gICAgY29tcGlsYXRpb246IHtcbiAgICAgIGRpcmVjdGl2ZXM6IG5ldyBTZXQ8YW55PigpLFxuICAgICAgcGlwZXM6IG5ldyBTZXQ8YW55PigpLFxuICAgIH0sXG4gICAgZXhwb3J0ZWQ6IHtcbiAgICAgIGRpcmVjdGl2ZXM6IG5ldyBTZXQ8YW55PigpLFxuICAgICAgcGlwZXM6IG5ldyBTZXQ8YW55PigpLFxuICAgIH0sXG4gIH07XG5cbiAgbWF5YmVVbndyYXBGbihkZWYuaW1wb3J0cykuZm9yRWFjaCg8ST4oaW1wb3J0ZWQ6IFR5cGU8ST4pID0+IHtcbiAgICAvLyBXaGVuIHRoaXMgbW9kdWxlIGltcG9ydHMgYW5vdGhlciwgdGhlIGltcG9ydGVkIG1vZHVsZSdzIGV4cG9ydGVkIGRpcmVjdGl2ZXMgYW5kIHBpcGVzIGFyZVxuICAgIC8vIGFkZGVkIHRvIHRoZSBjb21waWxhdGlvbiBzY29wZSBvZiB0aGlzIG1vZHVsZS5cbiAgICBjb25zdCBpbXBvcnRlZFNjb3BlID0gdHJhbnNpdGl2ZVNjb3Blc0ZvcihpbXBvcnRlZCk7XG4gICAgaW1wb3J0ZWRTY29wZS5leHBvcnRlZC5kaXJlY3RpdmVzLmZvckVhY2goKGVudHJ5KSA9PiBzY29wZXMuY29tcGlsYXRpb24uZGlyZWN0aXZlcy5hZGQoZW50cnkpKTtcbiAgICBpbXBvcnRlZFNjb3BlLmV4cG9ydGVkLnBpcGVzLmZvckVhY2goKGVudHJ5KSA9PiBzY29wZXMuY29tcGlsYXRpb24ucGlwZXMuYWRkKGVudHJ5KSk7XG4gIH0pO1xuXG4gIG1heWJlVW53cmFwRm4oZGVmLmRlY2xhcmF0aW9ucykuZm9yRWFjaCgoZGVjbGFyZWQpID0+IHtcbiAgICBjb25zdCBkZWNsYXJlZFdpdGhEZWZzID0gZGVjbGFyZWQgYXMgVHlwZTxhbnk+ICYge1xuICAgICAgybVwaXBlPzogYW55O1xuICAgIH07XG5cbiAgICBpZiAoZ2V0UGlwZURlZihkZWNsYXJlZFdpdGhEZWZzKSkge1xuICAgICAgc2NvcGVzLmNvbXBpbGF0aW9uLnBpcGVzLmFkZChkZWNsYXJlZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEVpdGhlciBkZWNsYXJlZCBoYXMgYSDJtWNtcCBvciDJtWRpciwgb3IgaXQncyBhIGNvbXBvbmVudCB3aGljaCBoYXNuJ3RcbiAgICAgIC8vIGhhZCBpdHMgdGVtcGxhdGUgY29tcGlsZWQgeWV0LiBJbiBlaXRoZXIgY2FzZSwgaXQgZ2V0cyBhZGRlZCB0byB0aGUgY29tcGlsYXRpb24nc1xuICAgICAgLy8gZGlyZWN0aXZlcy5cbiAgICAgIHNjb3Blcy5jb21waWxhdGlvbi5kaXJlY3RpdmVzLmFkZChkZWNsYXJlZCk7XG4gICAgfVxuICB9KTtcblxuICBtYXliZVVud3JhcEZuKGRlZi5leHBvcnRzKS5mb3JFYWNoKDxFPihleHBvcnRlZDogVHlwZTxFPikgPT4ge1xuICAgIGNvbnN0IGV4cG9ydGVkVHlwZSA9IGV4cG9ydGVkIGFzIFR5cGU8RT4gJiB7XG4gICAgICAvLyBDb21wb25lbnRzLCBEaXJlY3RpdmVzLCBOZ01vZHVsZXMsIGFuZCBQaXBlcyBjYW4gYWxsIGJlIGV4cG9ydGVkLlxuICAgICAgybVjbXA/OiBhbnk7XG4gICAgICDJtWRpcj86IGFueTtcbiAgICAgIMm1bW9kPzogTmdNb2R1bGVEZWY8RT47XG4gICAgICDJtXBpcGU/OiBhbnk7XG4gICAgfTtcblxuICAgIC8vIEVpdGhlciB0aGUgdHlwZSBpcyBhIG1vZHVsZSwgYSBwaXBlLCBvciBhIGNvbXBvbmVudC9kaXJlY3RpdmUgKHdoaWNoIG1heSBub3QgaGF2ZSBhXG4gICAgLy8gybVjbXAgYXMgaXQgbWlnaHQgYmUgY29tcGlsZWQgYXN5bmNocm9ub3VzbHkpLlxuICAgIGlmIChpc05nTW9kdWxlKGV4cG9ydGVkVHlwZSkpIHtcbiAgICAgIC8vIFdoZW4gdGhpcyBtb2R1bGUgZXhwb3J0cyBhbm90aGVyLCB0aGUgZXhwb3J0ZWQgbW9kdWxlJ3MgZXhwb3J0ZWQgZGlyZWN0aXZlcyBhbmQgcGlwZXMgYXJlXG4gICAgICAvLyBhZGRlZCB0byBib3RoIHRoZSBjb21waWxhdGlvbiBhbmQgZXhwb3J0ZWQgc2NvcGVzIG9mIHRoaXMgbW9kdWxlLlxuICAgICAgY29uc3QgZXhwb3J0ZWRTY29wZSA9IHRyYW5zaXRpdmVTY29wZXNGb3IoZXhwb3J0ZWRUeXBlKTtcbiAgICAgIGV4cG9ydGVkU2NvcGUuZXhwb3J0ZWQuZGlyZWN0aXZlcy5mb3JFYWNoKChlbnRyeSkgPT4ge1xuICAgICAgICBzY29wZXMuY29tcGlsYXRpb24uZGlyZWN0aXZlcy5hZGQoZW50cnkpO1xuICAgICAgICBzY29wZXMuZXhwb3J0ZWQuZGlyZWN0aXZlcy5hZGQoZW50cnkpO1xuICAgICAgfSk7XG4gICAgICBleHBvcnRlZFNjb3BlLmV4cG9ydGVkLnBpcGVzLmZvckVhY2goKGVudHJ5KSA9PiB7XG4gICAgICAgIHNjb3Blcy5jb21waWxhdGlvbi5waXBlcy5hZGQoZW50cnkpO1xuICAgICAgICBzY29wZXMuZXhwb3J0ZWQucGlwZXMuYWRkKGVudHJ5KTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAoZ2V0UGlwZURlZihleHBvcnRlZFR5cGUpKSB7XG4gICAgICBzY29wZXMuZXhwb3J0ZWQucGlwZXMuYWRkKGV4cG9ydGVkVHlwZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNjb3Blcy5leHBvcnRlZC5kaXJlY3RpdmVzLmFkZChleHBvcnRlZFR5cGUpO1xuICAgIH1cbiAgfSk7XG5cbiAgZGVmLnRyYW5zaXRpdmVDb21waWxlU2NvcGVzID0gc2NvcGVzO1xuICByZXR1cm4gc2NvcGVzO1xufVxuXG5mdW5jdGlvbiBleHBhbmRNb2R1bGVXaXRoUHJvdmlkZXJzKHZhbHVlOiBUeXBlPGFueT4gfCBNb2R1bGVXaXRoUHJvdmlkZXJzPHt9Pik6IFR5cGU8YW55PiB7XG4gIGlmIChpc01vZHVsZVdpdGhQcm92aWRlcnModmFsdWUpKSB7XG4gICAgcmV0dXJuIHZhbHVlLm5nTW9kdWxlO1xuICB9XG4gIHJldHVybiB2YWx1ZTtcbn1cbiJdfQ==