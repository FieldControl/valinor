/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { getCompilerFacade } from '../../compiler/compiler_facade';
import { resolveForwardRef } from '../../di/forward_ref';
import { getReflect, reflectDependencies } from '../../di/jit/util';
import { componentNeedsResolution, maybeQueueResolutionOfComponentResources } from '../../metadata/resource_loading';
import { ViewEncapsulation } from '../../metadata/view';
import { EMPTY_ARRAY, EMPTY_OBJ } from '../../util/empty';
import { initNgDevMode } from '../../util/ng_dev_mode';
import { getComponentDef, getDirectiveDef } from '../definition';
import { NG_COMP_DEF, NG_DIR_DEF, NG_FACTORY_DEF } from '../fields';
import { stringifyForError } from '../util/stringify_utils';
import { angularCoreEnv } from './environment';
import { getJitOptions } from './jit_options';
import { flushModuleScopingQueueAsMuchAsPossible, patchComponentDefWithScope, transitiveScopesFor } from './module';
/**
 * Keep track of the compilation depth to avoid reentrancy issues during JIT compilation. This
 * matters in the following scenario:
 *
 * Consider a component 'A' that extends component 'B', both declared in module 'M'. During
 * the compilation of 'A' the definition of 'B' is requested to capture the inheritance chain,
 * potentially triggering compilation of 'B'. If this nested compilation were to trigger
 * `flushModuleScopingQueueAsMuchAsPossible` it may happen that module 'M' is still pending in the
 * queue, resulting in 'A' and 'B' to be patched with the NgModule scope. As the compilation of
 * 'A' is still in progress, this would introduce a circular dependency on its compilation. To avoid
 * this issue, the module scope queue is only flushed for compilations at the depth 0, to ensure
 * all compilations have finished.
 */
let compilationDepth = 0;
/**
 * Compile an Angular component according to its decorator metadata, and patch the resulting
 * component def (ɵcmp) onto the component type.
 *
 * Compilation may be asynchronous (due to the need to resolve URLs for the component template or
 * other resources, for example). In the event that compilation is not immediate, `compileComponent`
 * will enqueue resource resolution into a global queue and will fail to return the `ɵcmp`
 * until the global queue has been resolved with a call to `resolveComponentResources`.
 */
export function compileComponent(type, metadata) {
    // Initialize ngDevMode. This must be the first statement in compileComponent.
    // See the `initNgDevMode` docstring for more information.
    (typeof ngDevMode === 'undefined' || ngDevMode) && initNgDevMode();
    let ngComponentDef = null;
    // Metadata may have resources which need to be resolved.
    maybeQueueResolutionOfComponentResources(type, metadata);
    // Note that we're using the same function as `Directive`, because that's only subset of metadata
    // that we need to create the ngFactoryDef. We're avoiding using the component metadata
    // because we'd have to resolve the asynchronous templates.
    addDirectiveFactoryDef(type, metadata);
    Object.defineProperty(type, NG_COMP_DEF, {
        get: () => {
            if (ngComponentDef === null) {
                const compiler = getCompilerFacade();
                if (componentNeedsResolution(metadata)) {
                    const error = [`Component '${type.name}' is not resolved:`];
                    if (metadata.templateUrl) {
                        error.push(` - templateUrl: ${metadata.templateUrl}`);
                    }
                    if (metadata.styleUrls && metadata.styleUrls.length) {
                        error.push(` - styleUrls: ${JSON.stringify(metadata.styleUrls)}`);
                    }
                    error.push(`Did you run and wait for 'resolveComponentResources()'?`);
                    throw new Error(error.join('\n'));
                }
                // This const was called `jitOptions` previously but had to be renamed to `options` because
                // of a bug with Terser that caused optimized JIT builds to throw a `ReferenceError`.
                // This bug was investigated in https://github.com/angular/angular-cli/issues/17264.
                // We should not rename it back until https://github.com/terser/terser/issues/615 is fixed.
                const options = getJitOptions();
                let preserveWhitespaces = metadata.preserveWhitespaces;
                if (preserveWhitespaces === undefined) {
                    if (options !== null && options.preserveWhitespaces !== undefined) {
                        preserveWhitespaces = options.preserveWhitespaces;
                    }
                    else {
                        preserveWhitespaces = false;
                    }
                }
                let encapsulation = metadata.encapsulation;
                if (encapsulation === undefined) {
                    if (options !== null && options.defaultEncapsulation !== undefined) {
                        encapsulation = options.defaultEncapsulation;
                    }
                    else {
                        encapsulation = ViewEncapsulation.Emulated;
                    }
                }
                const templateUrl = metadata.templateUrl || `ng:///${type.name}/template.html`;
                const meta = Object.assign(Object.assign({}, directiveMetadata(type, metadata)), { typeSourceSpan: compiler.createParseSourceSpan('Component', type.name, templateUrl), template: metadata.template || '', preserveWhitespaces, styles: metadata.styles || EMPTY_ARRAY, animations: metadata.animations, directives: [], changeDetection: metadata.changeDetection, pipes: new Map(), encapsulation, interpolation: metadata.interpolation, viewProviders: metadata.viewProviders || null });
                compilationDepth++;
                try {
                    if (meta.usesInheritance) {
                        addDirectiveDefToUndecoratedParents(type);
                    }
                    ngComponentDef = compiler.compileComponent(angularCoreEnv, templateUrl, meta);
                }
                finally {
                    // Ensure that the compilation depth is decremented even when the compilation failed.
                    compilationDepth--;
                }
                if (compilationDepth === 0) {
                    // When NgModule decorator executed, we enqueued the module definition such that
                    // it would only dequeue and add itself as module scope to all of its declarations,
                    // but only if  if all of its declarations had resolved. This call runs the check
                    // to see if any modules that are in the queue can be dequeued and add scope to
                    // their declarations.
                    flushModuleScopingQueueAsMuchAsPossible();
                }
                // If component compilation is async, then the @NgModule annotation which declares the
                // component may execute and set an ngSelectorScope property on the component type. This
                // allows the component to patch itself with directiveDefs from the module after it
                // finishes compiling.
                if (hasSelectorScope(type)) {
                    const scopes = transitiveScopesFor(type.ngSelectorScope);
                    patchComponentDefWithScope(ngComponentDef, scopes);
                }
            }
            return ngComponentDef;
        },
        // Make the property configurable in dev mode to allow overriding in tests
        configurable: !!ngDevMode,
    });
}
function hasSelectorScope(component) {
    return component.ngSelectorScope !== undefined;
}
/**
 * Compile an Angular directive according to its decorator metadata, and patch the resulting
 * directive def onto the component type.
 *
 * In the event that compilation is not immediate, `compileDirective` will return a `Promise` which
 * will resolve when compilation completes and the directive becomes usable.
 */
export function compileDirective(type, directive) {
    let ngDirectiveDef = null;
    addDirectiveFactoryDef(type, directive || {});
    Object.defineProperty(type, NG_DIR_DEF, {
        get: () => {
            if (ngDirectiveDef === null) {
                // `directive` can be null in the case of abstract directives as a base class
                // that use `@Directive()` with no selector. In that case, pass empty object to the
                // `directiveMetadata` function instead of null.
                const meta = getDirectiveMetadata(type, directive || {});
                ngDirectiveDef =
                    getCompilerFacade().compileDirective(angularCoreEnv, meta.sourceMapUrl, meta.metadata);
            }
            return ngDirectiveDef;
        },
        // Make the property configurable in dev mode to allow overriding in tests
        configurable: !!ngDevMode,
    });
}
function getDirectiveMetadata(type, metadata) {
    const name = type && type.name;
    const sourceMapUrl = `ng:///${name}/ɵdir.js`;
    const compiler = getCompilerFacade();
    const facade = directiveMetadata(type, metadata);
    facade.typeSourceSpan = compiler.createParseSourceSpan('Directive', name, sourceMapUrl);
    if (facade.usesInheritance) {
        addDirectiveDefToUndecoratedParents(type);
    }
    return { metadata: facade, sourceMapUrl };
}
function addDirectiveFactoryDef(type, metadata) {
    let ngFactoryDef = null;
    Object.defineProperty(type, NG_FACTORY_DEF, {
        get: () => {
            if (ngFactoryDef === null) {
                const meta = getDirectiveMetadata(type, metadata);
                const compiler = getCompilerFacade();
                ngFactoryDef = compiler.compileFactory(angularCoreEnv, `ng:///${type.name}/ɵfac.js`, {
                    name: meta.metadata.name,
                    type: meta.metadata.type,
                    typeArgumentCount: 0,
                    deps: reflectDependencies(type),
                    target: compiler.FactoryTarget.Directive
                });
            }
            return ngFactoryDef;
        },
        // Make the property configurable in dev mode to allow overriding in tests
        configurable: !!ngDevMode,
    });
}
export function extendsDirectlyFromObject(type) {
    return Object.getPrototypeOf(type.prototype) === Object.prototype;
}
/**
 * Extract the `R3DirectiveMetadata` for a particular directive (either a `Directive` or a
 * `Component`).
 */
export function directiveMetadata(type, metadata) {
    // Reflect inputs and outputs.
    const reflect = getReflect();
    const propMetadata = reflect.ownPropMetadata(type);
    return {
        name: type.name,
        type: type,
        selector: metadata.selector !== undefined ? metadata.selector : null,
        host: metadata.host || EMPTY_OBJ,
        propMetadata: propMetadata,
        inputs: metadata.inputs || EMPTY_ARRAY,
        outputs: metadata.outputs || EMPTY_ARRAY,
        queries: extractQueriesMetadata(type, propMetadata, isContentQuery),
        lifecycle: { usesOnChanges: reflect.hasLifecycleHook(type, 'ngOnChanges') },
        typeSourceSpan: null,
        usesInheritance: !extendsDirectlyFromObject(type),
        exportAs: extractExportAs(metadata.exportAs),
        providers: metadata.providers || null,
        viewQueries: extractQueriesMetadata(type, propMetadata, isViewQuery)
    };
}
/**
 * Adds a directive definition to all parent classes of a type that don't have an Angular decorator.
 */
function addDirectiveDefToUndecoratedParents(type) {
    const objPrototype = Object.prototype;
    let parent = Object.getPrototypeOf(type.prototype).constructor;
    // Go up the prototype until we hit `Object`.
    while (parent && parent !== objPrototype) {
        // Since inheritance works if the class was annotated already, we only need to add
        // the def if there are no annotations and the def hasn't been created already.
        if (!getDirectiveDef(parent) && !getComponentDef(parent) &&
            shouldAddAbstractDirective(parent)) {
            compileDirective(parent, null);
        }
        parent = Object.getPrototypeOf(parent);
    }
}
function convertToR3QueryPredicate(selector) {
    return typeof selector === 'string' ? splitByComma(selector) : resolveForwardRef(selector);
}
export function convertToR3QueryMetadata(propertyName, ann) {
    return {
        propertyName: propertyName,
        predicate: convertToR3QueryPredicate(ann.selector),
        descendants: ann.descendants,
        first: ann.first,
        read: ann.read ? ann.read : null,
        static: !!ann.static,
        emitDistinctChangesOnly: !!ann.emitDistinctChangesOnly,
    };
}
function extractQueriesMetadata(type, propMetadata, isQueryAnn) {
    const queriesMeta = [];
    for (const field in propMetadata) {
        if (propMetadata.hasOwnProperty(field)) {
            const annotations = propMetadata[field];
            annotations.forEach(ann => {
                if (isQueryAnn(ann)) {
                    if (!ann.selector) {
                        throw new Error(`Can't construct a query for the property "${field}" of ` +
                            `"${stringifyForError(type)}" since the query selector wasn't defined.`);
                    }
                    if (annotations.some(isInputAnnotation)) {
                        throw new Error(`Cannot combine @Input decorators with query decorators`);
                    }
                    queriesMeta.push(convertToR3QueryMetadata(field, ann));
                }
            });
        }
    }
    return queriesMeta;
}
function extractExportAs(exportAs) {
    return exportAs === undefined ? null : splitByComma(exportAs);
}
function isContentQuery(value) {
    const name = value.ngMetadataName;
    return name === 'ContentChild' || name === 'ContentChildren';
}
function isViewQuery(value) {
    const name = value.ngMetadataName;
    return name === 'ViewChild' || name === 'ViewChildren';
}
function isInputAnnotation(value) {
    return value.ngMetadataName === 'Input';
}
function splitByComma(value) {
    return value.split(',').map(piece => piece.trim());
}
const LIFECYCLE_HOOKS = [
    'ngOnChanges', 'ngOnInit', 'ngOnDestroy', 'ngDoCheck', 'ngAfterViewInit', 'ngAfterViewChecked',
    'ngAfterContentInit', 'ngAfterContentChecked'
];
function shouldAddAbstractDirective(type) {
    const reflect = getReflect();
    if (LIFECYCLE_HOOKS.some(hookName => reflect.hasLifecycleHook(type, hookName))) {
        return true;
    }
    const propMetadata = reflect.propMetadata(type);
    for (const field in propMetadata) {
        const annotations = propMetadata[field];
        for (let i = 0; i < annotations.length; i++) {
            const current = annotations[i];
            const metadataName = current.ngMetadataName;
            if (isInputAnnotation(current) || isContentQuery(current) || isViewQuery(current) ||
                metadataName === 'Output' || metadataName === 'HostBinding' ||
                metadataName === 'HostListener') {
                return true;
            }
        }
    }
    return false;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlyZWN0aXZlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS9zcmMvcmVuZGVyMy9qaXQvZGlyZWN0aXZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxpQkFBaUIsRUFBNEIsTUFBTSxnQ0FBZ0MsQ0FBQztBQUU1RixPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSxzQkFBc0IsQ0FBQztBQUN2RCxPQUFPLEVBQUMsVUFBVSxFQUFFLG1CQUFtQixFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFJbEUsT0FBTyxFQUFDLHdCQUF3QixFQUFFLHdDQUF3QyxFQUFDLE1BQU0saUNBQWlDLENBQUM7QUFDbkgsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDdEQsT0FBTyxFQUFDLFdBQVcsRUFBRSxTQUFTLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUN4RCxPQUFPLEVBQUMsYUFBYSxFQUFDLE1BQU0sd0JBQXdCLENBQUM7QUFDckQsT0FBTyxFQUFDLGVBQWUsRUFBRSxlQUFlLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDL0QsT0FBTyxFQUFDLFdBQVcsRUFBRSxVQUFVLEVBQUUsY0FBYyxFQUFDLE1BQU0sV0FBVyxDQUFDO0FBRWxFLE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLHlCQUF5QixDQUFDO0FBRTFELE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDN0MsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUM1QyxPQUFPLEVBQUMsdUNBQXVDLEVBQUUsMEJBQTBCLEVBQUUsbUJBQW1CLEVBQUMsTUFBTSxVQUFVLENBQUM7QUFFbEg7Ozs7Ozs7Ozs7OztHQVlHO0FBQ0gsSUFBSSxnQkFBZ0IsR0FBRyxDQUFDLENBQUM7QUFFekI7Ozs7Ozs7O0dBUUc7QUFDSCxNQUFN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QUFFLENBQUMsRUFBRSxFQUFFO1lBQzNDLE1BQU0sT0FBTyxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMvQixNQUFNLFlBQVksR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDO1lBRTVDLElBQUksaUJBQWlCLENBQUMsT0FBTyxDQUFDLElBQUksY0FBYyxDQUFDLE9BQU8sQ0FBQyxJQUFJLFdBQVcsQ0FBQyxPQUFPLENBQUM7Z0JBQzdFLFlBQVksS0FBSyxRQUFRLElBQUksWUFBWSxLQUFLLGFBQWE7Z0JBQzNELFlBQVksS0FBSyxjQUFjLEVBQUU7Z0JBQ25DLE9BQU8sSUFBSSxDQUFDO2FBQ2I7U0FDRjtLQUNGO0lBRUQsT0FBTyxLQUFLLENBQUM7QUFDZixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Z2V0Q29tcGlsZXJGYWNhZGUsIFIzRGlyZWN0aXZlTWV0YWRhdGFGYWNhZGV9IGZyb20gJy4uLy4uL2NvbXBpbGVyL2NvbXBpbGVyX2ZhY2FkZSc7XG5pbXBvcnQge1IzQ29tcG9uZW50TWV0YWRhdGFGYWNhZGUsIFIzUXVlcnlNZXRhZGF0YUZhY2FkZX0gZnJvbSAnLi4vLi4vY29tcGlsZXIvY29tcGlsZXJfZmFjYWRlX2ludGVyZmFjZSc7XG5pbXBvcnQge3Jlc29sdmVGb3J3YXJkUmVmfSBmcm9tICcuLi8uLi9kaS9mb3J3YXJkX3JlZic7XG5pbXBvcnQge2dldFJlZmxlY3QsIHJlZmxlY3REZXBlbmRlbmNpZXN9IGZyb20gJy4uLy4uL2RpL2ppdC91dGlsJztcbmltcG9ydCB7VHlwZX0gZnJvbSAnLi4vLi4vaW50ZXJmYWNlL3R5cGUnO1xuaW1wb3J0IHtRdWVyeX0gZnJvbSAnLi4vLi4vbWV0YWRhdGEvZGknO1xuaW1wb3J0IHtDb21wb25lbnQsIERpcmVjdGl2ZSwgSW5wdXR9IGZyb20gJy4uLy4uL21ldGFkYXRhL2RpcmVjdGl2ZXMnO1xuaW1wb3J0IHtjb21wb25lbnROZWVkc1Jlc29sdXRpb24sIG1heWJlUXVldWVSZXNvbHV0aW9uT2ZDb21wb25lbnRSZXNvdXJjZXN9IGZyb20gJy4uLy4uL21ldGFkYXRhL3Jlc291cmNlX2xvYWRpbmcnO1xuaW1wb3J0IHtWaWV3RW5jYXBzdWxhdGlvbn0gZnJvbSAnLi4vLi4vbWV0YWRhdGEvdmlldyc7XG5pbXBvcnQge0VNUFRZX0FSUkFZLCBFTVBUWV9PQkp9IGZyb20gJy4uLy4uL3V0aWwvZW1wdHknO1xuaW1wb3J0IHtpbml0TmdEZXZNb2RlfSBmcm9tICcuLi8uLi91dGlsL25nX2Rldl9tb2RlJztcbmltcG9ydCB7Z2V0Q29tcG9uZW50RGVmLCBnZXREaXJlY3RpdmVEZWZ9IGZyb20gJy4uL2RlZmluaXRpb24nO1xuaW1wb3J0IHtOR19DT01QX0RFRiwgTkdfRElSX0RFRiwgTkdfRkFDVE9SWV9ERUZ9IGZyb20gJy4uL2ZpZWxkcyc7XG5pbXBvcnQge0NvbXBvbmVudFR5cGV9IGZyb20gJy4uL2ludGVyZmFjZXMvZGVmaW5pdGlvbic7XG5pbXBvcnQge3N0cmluZ2lmeUZvckVycm9yfSBmcm9tICcuLi91dGlsL3N0cmluZ2lmeV91dGlscyc7XG5cbmltcG9ydCB7YW5ndWxhckNvcmVFbnZ9IGZyb20gJy4vZW52aXJvbm1lbnQnO1xuaW1wb3J0IHtnZXRKaXRPcHRpb25zfSBmcm9tICcuL2ppdF9vcHRpb25zJztcbmltcG9ydCB7Zmx1c2hNb2R1bGVTY29waW5nUXVldWVBc011Y2hBc1Bvc3NpYmxlLCBwYXRjaENvbXBvbmVudERlZldpdGhTY29wZSwgdHJhbnNpdGl2ZVNjb3Blc0Zvcn0gZnJvbSAnLi9tb2R1bGUnO1xuXG4vKipcbiAqIEtlZXAgdHJhY2sgb2YgdGhlIGNvbXBpbGF0aW9uIGRlcHRoIHRvIGF2b2lkIHJlZW50cmFuY3kgaXNzdWVzIGR1cmluZyBKSVQgY29tcGlsYXRpb24uIFRoaXNcbiAqIG1hdHRlcnMgaW4gdGhlIGZvbGxvd2luZyBzY2VuYXJpbzpcbiAqXG4gKiBDb25zaWRlciBhIGNvbXBvbmVudCAnQScgdGhhdCBleHRlbmRzIGNvbXBvbmVudCAnQicsIGJvdGggZGVjbGFyZWQgaW4gbW9kdWxlICdNJy4gRHVyaW5nXG4gKiB0aGUgY29tcGlsYXRpb24gb2YgJ0EnIHRoZSBkZWZpbml0aW9uIG9mICdCJyBpcyByZXF1ZXN0ZWQgdG8gY2FwdHVyZSB0aGUgaW5oZXJpdGFuY2UgY2hhaW4sXG4gKiBwb3RlbnRpYWxseSB0cmlnZ2VyaW5nIGNvbXBpbGF0aW9uIG9mICdCJy4gSWYgdGhpcyBuZXN0ZWQgY29tcGlsYXRpb24gd2VyZSB0byB0cmlnZ2VyXG4gKiBgZmx1c2hNb2R1bGVTY29waW5nUXVldWVBc011Y2hBc1Bvc3NpYmxlYCBpdCBtYXkgaGFwcGVuIHRoYXQgbW9kdWxlICdNJyBpcyBzdGlsbCBwZW5kaW5nIGluIHRoZVxuICogcXVldWUsIHJlc3VsdGluZyBpbiAnQScgYW5kICdCJyB0byBiZSBwYXRjaGVkIHdpdGggdGhlIE5nTW9kdWxlIHNjb3BlLiBBcyB0aGUgY29tcGlsYXRpb24gb2ZcbiAqICdBJyBpcyBzdGlsbCBpbiBwcm9ncmVzcywgdGhpcyB3b3VsZCBpbnRyb2R1Y2UgYSBjaXJjdWxhciBkZXBlbmRlbmN5IG9uIGl0cyBjb21waWxhdGlvbi4gVG8gYXZvaWRcbiAqIHRoaXMgaXNzdWUsIHRoZSBtb2R1bGUgc2NvcGUgcXVldWUgaXMgb25seSBmbHVzaGVkIGZvciBjb21waWxhdGlvbnMgYXQgdGhlIGRlcHRoIDAsIHRvIGVuc3VyZVxuICogYWxsIGNvbXBpbGF0aW9ucyBoYXZlIGZpbmlzaGVkLlxuICovXG5sZXQgY29tcGlsYXRpb25EZXB0aCA9IDA7XG5cbi8qKlxuICogQ29tcGlsZSBhbiBBbmd1bGFyIGNvbXBvbmVudCBhY2NvcmRpbmcgdG8gaXRzIGRlY29yYXRvciBtZXRhZGF0YSwgYW5kIHBhdGNoIHRoZSByZXN1bHRpbmdcbiAqIGNvbXBvbmVudCBkZWYgKMm1Y21wKSBvbnRvIHRoZSBjb21wb25lbnQgdHlwZS5cbiAqXG4gKiBDb21waWxhdGlvbiBtYXkgYmUgYXN5bmNocm9ub3VzIChkdWUgdG8gdGhlIG5lZWQgdG8gcmVzb2x2ZSBVUkxzIGZvciB0aGUgY29tcG9uZW50IHRlbXBsYXRlIG9yXG4gKiBvdGhlciByZXNvdXJjZXMsIGZvciBleGFtcGxlKS4gSW4gdGhlIGV2ZW50IHRoYXQgY29tcGlsYXRpb24gaXMgbm90IGltbWVkaWF0ZSwgYGNvbXBpbGVDb21wb25lbnRgXG4gKiB3aWxsIGVucXVldWUgcmVzb3VyY2UgcmVzb2x1dGlvbiBpbnRvIGEgZ2xvYmFsIHF1ZXVlIGFuZCB3aWxsIGZhaWwgdG8gcmV0dXJuIHRoZSBgybVjbXBgXG4gKiB1bnRpbCB0aGUgZ2xvYmFsIHF1ZXVlIGhhcyBiZWVuIHJlc29sdmVkIHdpdGggYSBjYWxsIHRvIGByZXNvbHZlQ29tcG9uZW50UmVzb3VyY2VzYC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbXBpbGVDb21wb25lbnQodHlwZTogVHlwZTxhbnk+LCBtZXRhZGF0YTogQ29tcG9uZW50KTogdm9pZCB7XG4gIC8vIEluaXRpYWxpemUgbmdEZXZNb2RlLiBUaGlzIG11c3QgYmUgdGhlIGZpcnN0IHN0YXRlbWVudCBpbiBjb21waWxlQ29tcG9uZW50LlxuICAvLyBTZWUgdGhlIGBpbml0TmdEZXZNb2RlYCBkb2NzdHJpbmcgZm9yIG1vcmUgaW5mb3JtYXRpb24uXG4gICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpICYmIGluaXROZ0Rldk1vZGUoKTtcblxuICBsZXQgbmdDb21wb25lbnREZWY6IGFueSA9IG51bGw7XG5cbiAgLy8gTWV0YWRhdGEgbWF5IGhhdmUgcmVzb3VyY2VzIHdoaWNoIG5lZWQgdG8gYmUgcmVzb2x2ZWQuXG4gIG1heWJlUXVldWVSZXNvbHV0aW9uT2ZDb21wb25lbnRSZXNvdXJjZXModHlwZSwgbWV0YWRhdGEpO1xuXG4gIC8vIE5vdGUgdGhhdCB3ZSdyZSB1c2luZyB0aGUgc2FtZSBmdW5jdGlvbiBhcyBgRGlyZWN0aXZlYCwgYmVjYXVzZSB0aGF0J3Mgb25seSBzdWJzZXQgb2YgbWV0YWRhdGFcbiAgLy8gdGhhdCB3ZSBuZWVkIHRvIGNyZWF0ZSB0aGUgbmdGYWN0b3J5RGVmLiBXZSdyZSBhdm9pZGluZyB1c2luZyB0aGUgY29tcG9uZW50IG1ldGFkYXRhXG4gIC8vIGJlY2F1c2Ugd2UnZCBoYXZlIHRvIHJlc29sdmUgdGhlIGFzeW5jaHJvbm91cyB0ZW1wbGF0ZXMuXG4gIGFkZERpcmVjdGl2ZUZhY3RvcnlEZWYodHlwZSwgbWV0YWRhdGEpO1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0eXBlLCBOR19DT01QX0RFRiwge1xuICAgIGdldDogKCkgPT4ge1xuICAgICAgaWYgKG5nQ29tcG9uZW50RGVmID09PSBudWxsKSB7XG4gICAgICAgIGNvbnN0IGNvbXBpbGVyID0gZ2V0Q29tcGlsZXJGYWNhZGUoKTtcblxuICAgICAgICBpZiAoY29tcG9uZW50TmVlZHNSZXNvbHV0aW9uKG1ldGFkYXRhKSkge1xuICAgICAgICAgIGNvbnN0IGVycm9yID0gW2BDb21wb25lbnQgJyR7dHlwZS5uYW1lfScgaXMgbm90IHJlc29sdmVkOmBdO1xuICAgICAgICAgIGlmIChtZXRhZGF0YS50ZW1wbGF0ZVVybCkge1xuICAgICAgICAgICAgZXJyb3IucHVzaChgIC0gdGVtcGxhdGVVcmw6ICR7bWV0YWRhdGEudGVtcGxhdGVVcmx9YCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChtZXRhZGF0YS5zdHlsZVVybHMgJiYgbWV0YWRhdGEuc3R5bGVVcmxzLmxlbmd0aCkge1xuICAgICAgICAgICAgZXJyb3IucHVzaChgIC0gc3R5bGVVcmxzOiAke0pTT04uc3RyaW5naWZ5KG1ldGFkYXRhLnN0eWxlVXJscyl9YCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVycm9yLnB1c2goYERpZCB5b3UgcnVuIGFuZCB3YWl0IGZvciAncmVzb2x2ZUNvbXBvbmVudFJlc291cmNlcygpJz9gKTtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyb3Iuam9pbignXFxuJykpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVGhpcyBjb25zdCB3YXMgY2FsbGVkIGBqaXRPcHRpb25zYCBwcmV2aW91c2x5IGJ1dCBoYWQgdG8gYmUgcmVuYW1lZCB0byBgb3B0aW9uc2AgYmVjYXVzZVxuICAgICAgICAvLyBvZiBhIGJ1ZyB3aXRoIFRlcnNlciB0aGF0IGNhdXNlZCBvcHRpbWl6ZWQgSklUIGJ1aWxkcyB0byB0aHJvdyBhIGBSZWZlcmVuY2VFcnJvcmAuXG4gICAgICAgIC8vIFRoaXMgYnVnIHdhcyBpbnZlc3RpZ2F0ZWQgaW4gaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci1jbGkvaXNzdWVzLzE3MjY0LlxuICAgICAgICAvLyBXZSBzaG91bGQgbm90IHJlbmFtZSBpdCBiYWNrIHVudGlsIGh0dHBzOi8vZ2l0aHViLmNvbS90ZXJzZXIvdGVyc2VyL2lzc3Vlcy82MTUgaXMgZml4ZWQuXG4gICAgICAgIGNvbnN0IG9wdGlvbnMgPSBnZXRKaXRPcHRpb25zKCk7XG4gICAgICAgIGxldCBwcmVzZXJ2ZVdoaXRlc3BhY2VzID0gbWV0YWRhdGEucHJlc2VydmVXaGl0ZXNwYWNlcztcbiAgICAgICAgaWYgKHByZXNlcnZlV2hpdGVzcGFjZXMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGlmIChvcHRpb25zICE9PSBudWxsICYmIG9wdGlvbnMucHJlc2VydmVXaGl0ZXNwYWNlcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBwcmVzZXJ2ZVdoaXRlc3BhY2VzID0gb3B0aW9ucy5wcmVzZXJ2ZVdoaXRlc3BhY2VzO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwcmVzZXJ2ZVdoaXRlc3BhY2VzID0gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGxldCBlbmNhcHN1bGF0aW9uID0gbWV0YWRhdGEuZW5jYXBzdWxhdGlvbjtcbiAgICAgICAgaWYgKGVuY2Fwc3VsYXRpb24gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGlmIChvcHRpb25zICE9PSBudWxsICYmIG9wdGlvbnMuZGVmYXVsdEVuY2Fwc3VsYXRpb24gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgZW5jYXBzdWxhdGlvbiA9IG9wdGlvbnMuZGVmYXVsdEVuY2Fwc3VsYXRpb247XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVuY2Fwc3VsYXRpb24gPSBWaWV3RW5jYXBzdWxhdGlvbi5FbXVsYXRlZDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB0ZW1wbGF0ZVVybCA9IG1ldGFkYXRhLnRlbXBsYXRlVXJsIHx8IGBuZzovLy8ke3R5cGUubmFtZX0vdGVtcGxhdGUuaHRtbGA7XG4gICAgICAgIGNvbnN0IG1ldGE6IFIzQ29tcG9uZW50TWV0YWRhdGFGYWNhZGUgPSB7XG4gICAgICAgICAgLi4uZGlyZWN0aXZlTWV0YWRhdGEodHlwZSwgbWV0YWRhdGEpLFxuICAgICAgICAgIHR5cGVTb3VyY2VTcGFuOiBjb21waWxlci5jcmVhdGVQYXJzZVNvdXJjZVNwYW4oJ0NvbXBvbmVudCcsIHR5cGUubmFtZSwgdGVtcGxhdGVVcmwpLFxuICAgICAgICAgIHRlbXBsYXRlOiBtZXRhZGF0YS50ZW1wbGF0ZSB8fCAnJyxcbiAgICAgICAgICBwcmVzZXJ2ZVdoaXRlc3BhY2VzLFxuICAgICAgICAgIHN0eWxlczogbWV0YWRhdGEuc3R5bGVzIHx8IEVNUFRZX0FSUkFZLFxuICAgICAgICAgIGFuaW1hdGlvbnM6IG1ldGFkYXRhLmFuaW1hdGlvbnMsXG4gICAgICAgICAgZGlyZWN0aXZlczogW10sXG4gICAgICAgICAgY2hhbmdlRGV0ZWN0aW9uOiBtZXRhZGF0YS5jaGFuZ2VEZXRlY3Rpb24sXG4gICAgICAgICAgcGlwZXM6IG5ldyBNYXAoKSxcbiAgICAgICAgICBlbmNhcHN1bGF0aW9uLFxuICAgICAgICAgIGludGVycG9sYXRpb246IG1ldGFkYXRhLmludGVycG9sYXRpb24sXG4gICAgICAgICAgdmlld1Byb3ZpZGVyczogbWV0YWRhdGEudmlld1Byb3ZpZGVycyB8fCBudWxsLFxuICAgICAgICB9O1xuXG4gICAgICAgIGNvbXBpbGF0aW9uRGVwdGgrKztcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBpZiAobWV0YS51c2VzSW5oZXJpdGFuY2UpIHtcbiAgICAgICAgICAgIGFkZERpcmVjdGl2ZURlZlRvVW5kZWNvcmF0ZWRQYXJlbnRzKHR5cGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBuZ0NvbXBvbmVudERlZiA9IGNvbXBpbGVyLmNvbXBpbGVDb21wb25lbnQoYW5ndWxhckNvcmVFbnYsIHRlbXBsYXRlVXJsLCBtZXRhKTtcbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAvLyBFbnN1cmUgdGhhdCB0aGUgY29tcGlsYXRpb24gZGVwdGggaXMgZGVjcmVtZW50ZWQgZXZlbiB3aGVuIHRoZSBjb21waWxhdGlvbiBmYWlsZWQuXG4gICAgICAgICAgY29tcGlsYXRpb25EZXB0aC0tO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNvbXBpbGF0aW9uRGVwdGggPT09IDApIHtcbiAgICAgICAgICAvLyBXaGVuIE5nTW9kdWxlIGRlY29yYXRvciBleGVjdXRlZCwgd2UgZW5xdWV1ZWQgdGhlIG1vZHVsZSBkZWZpbml0aW9uIHN1Y2ggdGhhdFxuICAgICAgICAgIC8vIGl0IHdvdWxkIG9ubHkgZGVxdWV1ZSBhbmQgYWRkIGl0c2VsZiBhcyBtb2R1bGUgc2NvcGUgdG8gYWxsIG9mIGl0cyBkZWNsYXJhdGlvbnMsXG4gICAgICAgICAgLy8gYnV0IG9ubHkgaWYgIGlmIGFsbCBvZiBpdHMgZGVjbGFyYXRpb25zIGhhZCByZXNvbHZlZC4gVGhpcyBjYWxsIHJ1bnMgdGhlIGNoZWNrXG4gICAgICAgICAgLy8gdG8gc2VlIGlmIGFueSBtb2R1bGVzIHRoYXQgYXJlIGluIHRoZSBxdWV1ZSBjYW4gYmUgZGVxdWV1ZWQgYW5kIGFkZCBzY29wZSB0b1xuICAgICAgICAgIC8vIHRoZWlyIGRlY2xhcmF0aW9ucy5cbiAgICAgICAgICBmbHVzaE1vZHVsZVNjb3BpbmdRdWV1ZUFzTXVjaEFzUG9zc2libGUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIElmIGNvbXBvbmVudCBjb21waWxhdGlvbiBpcyBhc3luYywgdGhlbiB0aGUgQE5nTW9kdWxlIGFubm90YXRpb24gd2hpY2ggZGVjbGFyZXMgdGhlXG4gICAgICAgIC8vIGNvbXBvbmVudCBtYXkgZXhlY3V0ZSBhbmQgc2V0IGFuIG5nU2VsZWN0b3JTY29wZSBwcm9wZXJ0eSBvbiB0aGUgY29tcG9uZW50IHR5cGUuIFRoaXNcbiAgICAgICAgLy8gYWxsb3dzIHRoZSBjb21wb25lbnQgdG8gcGF0Y2ggaXRzZWxmIHdpdGggZGlyZWN0aXZlRGVmcyBmcm9tIHRoZSBtb2R1bGUgYWZ0ZXIgaXRcbiAgICAgICAgLy8gZmluaXNoZXMgY29tcGlsaW5nLlxuICAgICAgICBpZiAoaGFzU2VsZWN0b3JTY29wZSh0eXBlKSkge1xuICAgICAgICAgIGNvbnN0IHNjb3BlcyA9IHRyYW5zaXRpdmVTY29wZXNGb3IodHlwZS5uZ1NlbGVjdG9yU2NvcGUpO1xuICAgICAgICAgIHBhdGNoQ29tcG9uZW50RGVmV2l0aFNjb3BlKG5nQ29tcG9uZW50RGVmLCBzY29wZXMpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gbmdDb21wb25lbnREZWY7XG4gICAgfSxcbiAgICAvLyBNYWtlIHRoZSBwcm9wZXJ0eSBjb25maWd1cmFibGUgaW4gZGV2IG1vZGUgdG8gYWxsb3cgb3ZlcnJpZGluZyBpbiB0ZXN0c1xuICAgIGNvbmZpZ3VyYWJsZTogISFuZ0Rldk1vZGUsXG4gIH0pO1xufVxuXG5mdW5jdGlvbiBoYXNTZWxlY3RvclNjb3BlPFQ+KGNvbXBvbmVudDogVHlwZTxUPik6IGNvbXBvbmVudCBpcyBUeXBlPFQ+JlxuICAgIHtuZ1NlbGVjdG9yU2NvcGU6IFR5cGU8YW55Pn0ge1xuICByZXR1cm4gKGNvbXBvbmVudCBhcyB7bmdTZWxlY3RvclNjb3BlPzogYW55fSkubmdTZWxlY3RvclNjb3BlICE9PSB1bmRlZmluZWQ7XG59XG5cbi8qKlxuICogQ29tcGlsZSBhbiBBbmd1bGFyIGRpcmVjdGl2ZSBhY2NvcmRpbmcgdG8gaXRzIGRlY29yYXRvciBtZXRhZGF0YSwgYW5kIHBhdGNoIHRoZSByZXN1bHRpbmdcbiAqIGRpcmVjdGl2ZSBkZWYgb250byB0aGUgY29tcG9uZW50IHR5cGUuXG4gKlxuICogSW4gdGhlIGV2ZW50IHRoYXQgY29tcGlsYXRpb24gaXMgbm90IGltbWVkaWF0ZSwgYGNvbXBpbGVEaXJlY3RpdmVgIHdpbGwgcmV0dXJuIGEgYFByb21pc2VgIHdoaWNoXG4gKiB3aWxsIHJlc29sdmUgd2hlbiBjb21waWxhdGlvbiBjb21wbGV0ZXMgYW5kIHRoZSBkaXJlY3RpdmUgYmVjb21lcyB1c2FibGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb21waWxlRGlyZWN0aXZlKHR5cGU6IFR5cGU8YW55PiwgZGlyZWN0aXZlOiBEaXJlY3RpdmV8bnVsbCk6IHZvaWQge1xuICBsZXQgbmdEaXJlY3RpdmVEZWY6IGFueSA9IG51bGw7XG5cbiAgYWRkRGlyZWN0aXZlRmFjdG9yeURlZih0eXBlLCBkaXJlY3RpdmUgfHwge30pO1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0eXBlLCBOR19ESVJfREVGLCB7XG4gICAgZ2V0OiAoKSA9PiB7XG4gICAgICBpZiAobmdEaXJlY3RpdmVEZWYgPT09IG51bGwpIHtcbiAgICAgICAgLy8gYGRpcmVjdGl2ZWAgY2FuIGJlIG51bGwgaW4gdGhlIGNhc2Ugb2YgYWJzdHJhY3QgZGlyZWN0aXZlcyBhcyBhIGJhc2UgY2xhc3NcbiAgICAgICAgLy8gdGhhdCB1c2UgYEBEaXJlY3RpdmUoKWAgd2l0aCBubyBzZWxlY3Rvci4gSW4gdGhhdCBjYXNlLCBwYXNzIGVtcHR5IG9iamVjdCB0byB0aGVcbiAgICAgICAgLy8gYGRpcmVjdGl2ZU1ldGFkYXRhYCBmdW5jdGlvbiBpbnN0ZWFkIG9mIG51bGwuXG4gICAgICAgIGNvbnN0IG1ldGEgPSBnZXREaXJlY3RpdmVNZXRhZGF0YSh0eXBlLCBkaXJlY3RpdmUgfHwge30pO1xuICAgICAgICBuZ0RpcmVjdGl2ZURlZiA9XG4gICAgICAgICAgICBnZXRDb21waWxlckZhY2FkZSgpLmNvbXBpbGVEaXJlY3RpdmUoYW5ndWxhckNvcmVFbnYsIG1ldGEuc291cmNlTWFwVXJsLCBtZXRhLm1ldGFkYXRhKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZ0RpcmVjdGl2ZURlZjtcbiAgICB9LFxuICAgIC8vIE1ha2UgdGhlIHByb3BlcnR5IGNvbmZpZ3VyYWJsZSBpbiBkZXYgbW9kZSB0byBhbGxvdyBvdmVycmlkaW5nIGluIHRlc3RzXG4gICAgY29uZmlndXJhYmxlOiAhIW5nRGV2TW9kZSxcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldERpcmVjdGl2ZU1ldGFkYXRhKHR5cGU6IFR5cGU8YW55PiwgbWV0YWRhdGE6IERpcmVjdGl2ZSkge1xuICBjb25zdCBuYW1lID0gdHlwZSAmJiB0eXBlLm5hbWU7XG4gIGNvbnN0IHNvdXJjZU1hcFVybCA9IGBuZzovLy8ke25hbWV9L8m1ZGlyLmpzYDtcbiAgY29uc3QgY29tcGlsZXIgPSBnZXRDb21waWxlckZhY2FkZSgpO1xuICBjb25zdCBmYWNhZGUgPSBkaXJlY3RpdmVNZXRhZGF0YSh0eXBlIGFzIENvbXBvbmVudFR5cGU8YW55PiwgbWV0YWRhdGEpO1xuICBmYWNhZGUudHlwZVNvdXJjZVNwYW4gPSBjb21waWxlci5jcmVhdGVQYXJzZVNvdXJjZVNwYW4oJ0RpcmVjdGl2ZScsIG5hbWUsIHNvdXJjZU1hcFVybCk7XG4gIGlmIChmYWNhZGUudXNlc0luaGVyaXRhbmNlKSB7XG4gICAgYWRkRGlyZWN0aXZlRGVmVG9VbmRlY29yYXRlZFBhcmVudHModHlwZSk7XG4gIH1cbiAgcmV0dXJuIHttZXRhZGF0YTogZmFjYWRlLCBzb3VyY2VNYXBVcmx9O1xufVxuXG5mdW5jdGlvbiBhZGREaXJlY3RpdmVGYWN0b3J5RGVmKHR5cGU6IFR5cGU8YW55PiwgbWV0YWRhdGE6IERpcmVjdGl2ZXxDb21wb25lbnQpIHtcbiAgbGV0IG5nRmFjdG9yeURlZjogYW55ID0gbnVsbDtcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkodHlwZSwgTkdfRkFDVE9SWV9ERUYsIHtcbiAgICBnZXQ6ICgpID0+IHtcbiAgICAgIGlmIChuZ0ZhY3RvcnlEZWYgPT09IG51bGwpIHtcbiAgICAgICAgY29uc3QgbWV0YSA9IGdldERpcmVjdGl2ZU1ldGFkYXRhKHR5cGUsIG1ldGFkYXRhKTtcbiAgICAgICAgY29uc3QgY29tcGlsZXIgPSBnZXRDb21waWxlckZhY2FkZSgpO1xuICAgICAgICBuZ0ZhY3RvcnlEZWYgPSBjb21waWxlci5jb21waWxlRmFjdG9yeShhbmd1bGFyQ29yZUVudiwgYG5nOi8vLyR7dHlwZS5uYW1lfS/JtWZhYy5qc2AsIHtcbiAgICAgICAgICBuYW1lOiBtZXRhLm1ldGFkYXRhLm5hbWUsXG4gICAgICAgICAgdHlwZTogbWV0YS5tZXRhZGF0YS50eXBlLFxuICAgICAgICAgIHR5cGVBcmd1bWVudENvdW50OiAwLFxuICAgICAgICAgIGRlcHM6IHJlZmxlY3REZXBlbmRlbmNpZXModHlwZSksXG4gICAgICAgICAgdGFyZ2V0OiBjb21waWxlci5GYWN0b3J5VGFyZ2V0LkRpcmVjdGl2ZVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZ0ZhY3RvcnlEZWY7XG4gICAgfSxcbiAgICAvLyBNYWtlIHRoZSBwcm9wZXJ0eSBjb25maWd1cmFibGUgaW4gZGV2IG1vZGUgdG8gYWxsb3cgb3ZlcnJpZGluZyBpbiB0ZXN0c1xuICAgIGNvbmZpZ3VyYWJsZTogISFuZ0Rldk1vZGUsXG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZXh0ZW5kc0RpcmVjdGx5RnJvbU9iamVjdCh0eXBlOiBUeXBlPGFueT4pOiBib29sZWFuIHtcbiAgcmV0dXJuIE9iamVjdC5nZXRQcm90b3R5cGVPZih0eXBlLnByb3RvdHlwZSkgPT09IE9iamVjdC5wcm90b3R5cGU7XG59XG5cbi8qKlxuICogRXh0cmFjdCB0aGUgYFIzRGlyZWN0aXZlTWV0YWRhdGFgIGZvciBhIHBhcnRpY3VsYXIgZGlyZWN0aXZlIChlaXRoZXIgYSBgRGlyZWN0aXZlYCBvciBhXG4gKiBgQ29tcG9uZW50YCkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkaXJlY3RpdmVNZXRhZGF0YSh0eXBlOiBUeXBlPGFueT4sIG1ldGFkYXRhOiBEaXJlY3RpdmUpOiBSM0RpcmVjdGl2ZU1ldGFkYXRhRmFjYWRlIHtcbiAgLy8gUmVmbGVjdCBpbnB1dHMgYW5kIG91dHB1dHMuXG4gIGNvbnN0IHJlZmxlY3QgPSBnZXRSZWZsZWN0KCk7XG4gIGNvbnN0IHByb3BNZXRhZGF0YSA9IHJlZmxlY3Qub3duUHJvcE1ldGFkYXRhKHR5cGUpO1xuXG4gIHJldHVybiB7XG4gICAgbmFtZTogdHlwZS5uYW1lLFxuICAgIHR5cGU6IHR5cGUsXG4gICAgc2VsZWN0b3I6IG1ldGFkYXRhLnNlbGVjdG9yICE9PSB1bmRlZmluZWQgPyBtZXRhZGF0YS5zZWxlY3RvciA6IG51bGwsXG4gICAgaG9zdDogbWV0YWRhdGEuaG9zdCB8fCBFTVBUWV9PQkosXG4gICAgcHJvcE1ldGFkYXRhOiBwcm9wTWV0YWRhdGEsXG4gICAgaW5wdXRzOiBtZXRhZGF0YS5pbnB1dHMgfHwgRU1QVFlfQVJSQVksXG4gICAgb3V0cHV0czogbWV0YWRhdGEub3V0cHV0cyB8fCBFTVBUWV9BUlJBWSxcbiAgICBxdWVyaWVzOiBleHRyYWN0UXVlcmllc01ldGFkYXRhKHR5cGUsIHByb3BNZXRhZGF0YSwgaXNDb250ZW50UXVlcnkpLFxuICAgIGxpZmVjeWNsZToge3VzZXNPbkNoYW5nZXM6IHJlZmxlY3QuaGFzTGlmZWN5Y2xlSG9vayh0eXBlLCAnbmdPbkNoYW5nZXMnKX0sXG4gICAgdHlwZVNvdXJjZVNwYW46IG51bGwhLFxuICAgIHVzZXNJbmhlcml0YW5jZTogIWV4dGVuZHNEaXJlY3RseUZyb21PYmplY3QodHlwZSksXG4gICAgZXhwb3J0QXM6IGV4dHJhY3RFeHBvcnRBcyhtZXRhZGF0YS5leHBvcnRBcyksXG4gICAgcHJvdmlkZXJzOiBtZXRhZGF0YS5wcm92aWRlcnMgfHwgbnVsbCxcbiAgICB2aWV3UXVlcmllczogZXh0cmFjdFF1ZXJpZXNNZXRhZGF0YSh0eXBlLCBwcm9wTWV0YWRhdGEsIGlzVmlld1F1ZXJ5KVxuICB9O1xufVxuXG4vKipcbiAqIEFkZHMgYSBkaXJlY3RpdmUgZGVmaW5pdGlvbiB0byBhbGwgcGFyZW50IGNsYXNzZXMgb2YgYSB0eXBlIHRoYXQgZG9uJ3QgaGF2ZSBhbiBBbmd1bGFyIGRlY29yYXRvci5cbiAqL1xuZnVuY3Rpb24gYWRkRGlyZWN0aXZlRGVmVG9VbmRlY29yYXRlZFBhcmVudHModHlwZTogVHlwZTxhbnk+KSB7XG4gIGNvbnN0IG9ialByb3RvdHlwZSA9IE9iamVjdC5wcm90b3R5cGU7XG4gIGxldCBwYXJlbnQgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YodHlwZS5wcm90b3R5cGUpLmNvbnN0cnVjdG9yO1xuXG4gIC8vIEdvIHVwIHRoZSBwcm90b3R5cGUgdW50aWwgd2UgaGl0IGBPYmplY3RgLlxuICB3aGlsZSAocGFyZW50ICYmIHBhcmVudCAhPT0gb2JqUHJvdG90eXBlKSB7XG4gICAgLy8gU2luY2UgaW5oZXJpdGFuY2Ugd29ya3MgaWYgdGhlIGNsYXNzIHdhcyBhbm5vdGF0ZWQgYWxyZWFkeSwgd2Ugb25seSBuZWVkIHRvIGFkZFxuICAgIC8vIHRoZSBkZWYgaWYgdGhlcmUgYXJlIG5vIGFubm90YXRpb25zIGFuZCB0aGUgZGVmIGhhc24ndCBiZWVuIGNyZWF0ZWQgYWxyZWFkeS5cbiAgICBpZiAoIWdldERpcmVjdGl2ZURlZihwYXJlbnQpICYmICFnZXRDb21wb25lbnREZWYocGFyZW50KSAmJlxuICAgICAgICBzaG91bGRBZGRBYnN0cmFjdERpcmVjdGl2ZShwYXJlbnQpKSB7XG4gICAgICBjb21waWxlRGlyZWN0aXZlKHBhcmVudCwgbnVsbCk7XG4gICAgfVxuICAgIHBhcmVudCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihwYXJlbnQpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNvbnZlcnRUb1IzUXVlcnlQcmVkaWNhdGUoc2VsZWN0b3I6IGFueSk6IGFueXxzdHJpbmdbXSB7XG4gIHJldHVybiB0eXBlb2Ygc2VsZWN0b3IgPT09ICdzdHJpbmcnID8gc3BsaXRCeUNvbW1hKHNlbGVjdG9yKSA6IHJlc29sdmVGb3J3YXJkUmVmKHNlbGVjdG9yKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbnZlcnRUb1IzUXVlcnlNZXRhZGF0YShwcm9wZXJ0eU5hbWU6IHN0cmluZywgYW5uOiBRdWVyeSk6IFIzUXVlcnlNZXRhZGF0YUZhY2FkZSB7XG4gIHJldHVybiB7XG4gICAgcHJvcGVydHlOYW1lOiBwcm9wZXJ0eU5hbWUsXG4gICAgcHJlZGljYXRlOiBjb252ZXJ0VG9SM1F1ZXJ5UHJlZGljYXRlKGFubi5zZWxlY3RvciksXG4gICAgZGVzY2VuZGFudHM6IGFubi5kZXNjZW5kYW50cyxcbiAgICBmaXJzdDogYW5uLmZpcnN0LFxuICAgIHJlYWQ6IGFubi5yZWFkID8gYW5uLnJlYWQgOiBudWxsLFxuICAgIHN0YXRpYzogISFhbm4uc3RhdGljLFxuICAgIGVtaXREaXN0aW5jdENoYW5nZXNPbmx5OiAhIWFubi5lbWl0RGlzdGluY3RDaGFuZ2VzT25seSxcbiAgfTtcbn1cbmZ1bmN0aW9uIGV4dHJhY3RRdWVyaWVzTWV0YWRhdGEoXG4gICAgdHlwZTogVHlwZTxhbnk+LCBwcm9wTWV0YWRhdGE6IHtba2V5OiBzdHJpbmddOiBhbnlbXX0sXG4gICAgaXNRdWVyeUFubjogKGFubjogYW55KSA9PiBhbm4gaXMgUXVlcnkpOiBSM1F1ZXJ5TWV0YWRhdGFGYWNhZGVbXSB7XG4gIGNvbnN0IHF1ZXJpZXNNZXRhOiBSM1F1ZXJ5TWV0YWRhdGFGYWNhZGVbXSA9IFtdO1xuICBmb3IgKGNvbnN0IGZpZWxkIGluIHByb3BNZXRhZGF0YSkge1xuICAgIGlmIChwcm9wTWV0YWRhdGEuaGFzT3duUHJvcGVydHkoZmllbGQpKSB7XG4gICAgICBjb25zdCBhbm5vdGF0aW9ucyA9IHByb3BNZXRhZGF0YVtmaWVsZF07XG4gICAgICBhbm5vdGF0aW9ucy5mb3JFYWNoKGFubiA9PiB7XG4gICAgICAgIGlmIChpc1F1ZXJ5QW5uKGFubikpIHtcbiAgICAgICAgICBpZiAoIWFubi5zZWxlY3Rvcikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICAgIGBDYW4ndCBjb25zdHJ1Y3QgYSBxdWVyeSBmb3IgdGhlIHByb3BlcnR5IFwiJHtmaWVsZH1cIiBvZiBgICtcbiAgICAgICAgICAgICAgICBgXCIke3N0cmluZ2lmeUZvckVycm9yKHR5cGUpfVwiIHNpbmNlIHRoZSBxdWVyeSBzZWxlY3RvciB3YXNuJ3QgZGVmaW5lZC5gKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGFubm90YXRpb25zLnNvbWUoaXNJbnB1dEFubm90YXRpb24pKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENhbm5vdCBjb21iaW5lIEBJbnB1dCBkZWNvcmF0b3JzIHdpdGggcXVlcnkgZGVjb3JhdG9yc2ApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBxdWVyaWVzTWV0YS5wdXNoKGNvbnZlcnRUb1IzUXVlcnlNZXRhZGF0YShmaWVsZCwgYW5uKSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcXVlcmllc01ldGE7XG59XG5cbmZ1bmN0aW9uIGV4dHJhY3RFeHBvcnRBcyhleHBvcnRBczogc3RyaW5nfHVuZGVmaW5lZCk6IHN0cmluZ1tdfG51bGwge1xuICByZXR1cm4gZXhwb3J0QXMgPT09IHVuZGVmaW5lZCA/IG51bGwgOiBzcGxpdEJ5Q29tbWEoZXhwb3J0QXMpO1xufVxuXG5mdW5jdGlvbiBpc0NvbnRlbnRRdWVyeSh2YWx1ZTogYW55KTogdmFsdWUgaXMgUXVlcnkge1xuICBjb25zdCBuYW1lID0gdmFsdWUubmdNZXRhZGF0YU5hbWU7XG4gIHJldHVybiBuYW1lID09PSAnQ29udGVudENoaWxkJyB8fCBuYW1lID09PSAnQ29udGVudENoaWxkcmVuJztcbn1cblxuZnVuY3Rpb24gaXNWaWV3UXVlcnkodmFsdWU6IGFueSk6IHZhbHVlIGlzIFF1ZXJ5IHtcbiAgY29uc3QgbmFtZSA9IHZhbHVlLm5nTWV0YWRhdGFOYW1lO1xuICByZXR1cm4gbmFtZSA9PT0gJ1ZpZXdDaGlsZCcgfHwgbmFtZSA9PT0gJ1ZpZXdDaGlsZHJlbic7XG59XG5cbmZ1bmN0aW9uIGlzSW5wdXRBbm5vdGF0aW9uKHZhbHVlOiBhbnkpOiB2YWx1ZSBpcyBJbnB1dCB7XG4gIHJldHVybiB2YWx1ZS5uZ01ldGFkYXRhTmFtZSA9PT0gJ0lucHV0Jztcbn1cblxuZnVuY3Rpb24gc3BsaXRCeUNvbW1hKHZhbHVlOiBzdHJpbmcpOiBzdHJpbmdbXSB7XG4gIHJldHVybiB2YWx1ZS5zcGxpdCgnLCcpLm1hcChwaWVjZSA9PiBwaWVjZS50cmltKCkpO1xufVxuXG5jb25zdCBMSUZFQ1lDTEVfSE9PS1MgPSBbXG4gICduZ09uQ2hhbmdlcycsICduZ09uSW5pdCcsICduZ09uRGVzdHJveScsICduZ0RvQ2hlY2snLCAnbmdBZnRlclZpZXdJbml0JywgJ25nQWZ0ZXJWaWV3Q2hlY2tlZCcsXG4gICduZ0FmdGVyQ29udGVudEluaXQnLCAnbmdBZnRlckNvbnRlbnRDaGVja2VkJ1xuXTtcblxuZnVuY3Rpb24gc2hvdWxkQWRkQWJzdHJhY3REaXJlY3RpdmUodHlwZTogVHlwZTxhbnk+KTogYm9vbGVhbiB7XG4gIGNvbnN0IHJlZmxlY3QgPSBnZXRSZWZsZWN0KCk7XG5cbiAgaWYgKExJRkVDWUNMRV9IT09LUy5zb21lKGhvb2tOYW1lID0+IHJlZmxlY3QuaGFzTGlmZWN5Y2xlSG9vayh0eXBlLCBob29rTmFtZSkpKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBjb25zdCBwcm9wTWV0YWRhdGEgPSByZWZsZWN0LnByb3BNZXRhZGF0YSh0eXBlKTtcblxuICBmb3IgKGNvbnN0IGZpZWxkIGluIHByb3BNZXRhZGF0YSkge1xuICAgIGNvbnN0IGFubm90YXRpb25zID0gcHJvcE1ldGFkYXRhW2ZpZWxkXTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYW5ub3RhdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGN1cnJlbnQgPSBhbm5vdGF0aW9uc1tpXTtcbiAgICAgIGNvbnN0IG1ldGFkYXRhTmFtZSA9IGN1cnJlbnQubmdNZXRhZGF0YU5hbWU7XG5cbiAgICAgIGlmIChpc0lucHV0QW5ub3RhdGlvbihjdXJyZW50KSB8fCBpc0NvbnRlbnRRdWVyeShjdXJyZW50KSB8fCBpc1ZpZXdRdWVyeShjdXJyZW50KSB8fFxuICAgICAgICAgIG1ldGFkYXRhTmFtZSA9PT0gJ091dHB1dCcgfHwgbWV0YWRhdGFOYW1lID09PSAnSG9zdEJpbmRpbmcnIHx8XG4gICAgICAgICAgbWV0YWRhdGFOYW1lID09PSAnSG9zdExpc3RlbmVyJykge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gZmFsc2U7XG59XG4iXX0=