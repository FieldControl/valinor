/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { convertToBitFlags } from '../di/injector_compatibility';
import { EnvironmentInjector } from '../di/r3_injector';
import { RuntimeError } from '../errors';
import { ComponentFactory as AbstractComponentFactory, ComponentRef as AbstractComponentRef } from '../linker/component_factory';
import { ComponentFactoryResolver as AbstractComponentFactoryResolver } from '../linker/component_factory_resolver';
import { createElementRef } from '../linker/element_ref';
import { RendererFactory2 } from '../render/api';
import { Sanitizer } from '../sanitization/sanitizer';
import { assertDefined, assertGreaterThan, assertIndexInRange } from '../util/assert';
import { VERSION } from '../version';
import { NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR } from '../view/provider_flags';
import { assertComponentType } from './assert';
import { attachPatchData } from './context_discovery';
import { getComponentDef } from './definition';
import { getNodeInjectable, NodeInjector } from './di';
import { throwProviderNotFoundError } from './errors_di';
import { registerPostOrderHooks } from './hooks';
import { reportUnknownPropertyError } from './instructions/element_validation';
import { addToViewTree, createLView, createTView, executeContentQueries, getOrCreateComponentTView, getOrCreateTNode, initializeDirectives, invokeDirectivesHostBindings, locateHostElement, markAsComponentHost, markDirtyIfOnPush, renderView, setInputsForProperty } from './instructions/shared';
import { CONTEXT, HEADER_OFFSET, TVIEW } from './interfaces/view';
import { MATH_ML_NAMESPACE, SVG_NAMESPACE } from './namespaces';
import { createElementNode, setupStaticAttributes, writeDirectClass } from './node_manipulation';
import { extractAttrsAndClassesFromSelector, stringifyCSSSelectorList } from './node_selector_matcher';
import { enterView, getCurrentTNode, getLView, leaveView } from './state';
import { computeStaticStyling } from './styling/static_styling';
import { mergeHostAttrs, setUpAttributes } from './util/attrs_utils';
import { stringifyForError } from './util/stringify_utils';
import { getNativeByTNode, getTNode } from './util/view_utils';
import { RootViewRef } from './view_ref';
export class ComponentFactoryResolver extends AbstractComponentFactoryResolver {
    /**
     * @param ngModule The NgModuleRef to which all resolved factories are bound.
     */
    constructor(ngModule) {
        super();
        this.ngModule = ngModule;
    }
    resolveComponentFactory(component) {
        ngDevMode && assertComponentType(component);
        const componentDef = getComponentDef(component);
        return new ComponentFactory(componentDef, this.ngModule);
    }
}
function toRefArray(map) {
    const array = [];
    for (let nonMinified in map) {
        if (map.hasOwnProperty(nonMinified)) {
            const minified = map[nonMinified];
            array.push({ propName: minified, templateName: nonMinified });
        }
    }
    return array;
}
function getNamespace(elementName) {
    const name = elementName.toLowerCase();
    return name === 'svg' ? SVG_NAMESPACE : (name === 'math' ? MATH_ML_NAMESPACE : null);
}
/**
 * Injector that looks up a value using a specific injector, before falling back to the module
 * injector. Used primarily when creating components or embedded views dynamically.
 */
class ChainedInjector {
    constructor(injector, parentInjector) {
        this.injector = injector;
        this.parentInjector = parentInjector;
    }
    get(token, notFoundValue, flags) {
        flags = convertToBitFlags(flags);
        const value = this.injector.get(token, NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR, flags);
        if (value !== NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR ||
            notFoundValue === NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR) {
            // Return the value from the root element injector when
            // - it provides it
            //   (value !== NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR)
            // - the module injector should not be checked
            //   (notFoundValue === NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR)
            return value;
        }
        return this.parentInjector.get(token, notFoundValue, flags);
    }
}
/**
 * ComponentFactory interface implementation.
 */
export class ComponentFactory extends AbstractComponentFactory {
    get inputs() {
        return toRefArray(this.componentDef.inputs);
    }
    get outputs() {
        return toRefArray(this.componentDef.outputs);
    }
    /**
     * @param componentDef The component definition.
     * @param ngModule The NgModuleRef to which the factory is bound.
     */
    constructor(componentDef, ngModule) {
        super();
        this.componentDef = componentDef;
        this.ngModule = ngModule;
        this.componentType = componentDef.type;
        this.selector = stringifyCSSSelectorList(componentDef.selectors);
        this.ngContentSelectors =
            componentDef.ngContentSelectors ? componentDef.ngContentSelectors : [];
        this.isBoundToModule = !!ngModule;
    }
    create(injector, projectableNodes, rootSelectorOrNode, environmentInjector) {
        environmentInjector = environmentInjector || this.ngModule;
        let realEnvironmentInjector = environmentInjector instanceof EnvironmentInjector ?
            environmentInjector :
            environmentInjector?.injector;
        if (realEnvironmentInjector && this.componentDef.getStandaloneInjector !== null) {
            realEnvironmentInjector = this.componentDef.getStandaloneInjector(realEnvironmentInjector) ||
                realEnvironmentInjector;
        }
        const rootViewInjector = realEnvironmentInjector ? new ChainedInjector(injector, realEnvironmentInjector) : injector;
        const rendererFactory = rootViewInjector.get(RendererFactory2, null);
        if (rendererFactory === null) {
            throw new RuntimeError(407 /* RuntimeErrorCode.RENDERER_NOT_FOUND */, ngDevMode &&
                'Angular was not able to inject a renderer (RendererFactory2). ' +
                    'Likely this is due to a broken DI hierarchy. ' +
                    'Make sure that any injector used to create this component has a correct parent.');
        }
        const sanitizer = rootViewInjector.get(Sanitizer, null);
        const hostRenderer = rendererFactory.createRenderer(null, this.componentDef);
        // Determine a tag name used for creating host elements when this component is created
        // dynamically. Default to 'div' if this component did not specify any tag name in its selector.
        const elementName = this.componentDef.selectors[0][0] || 'div';
        const hostRNode = rootSelectorOrNode ?
            locateHostElement(hostRenderer, rootSelectorOrNode, this.componentDef.encapsulation) :
            createElementNode(hostRenderer, elementName, getNamespace(elementName));
        const rootFlags = this.componentDef.onPush ? 32 /* LViewFlags.Dirty */ | 256 /* LViewFlags.IsRoot */ :
            16 /* LViewFlags.CheckAlways */ | 256 /* LViewFlags.IsRoot */;
        // Create the root view. Uses empty TView and ContentTemplate.
        const rootTView = createTView(0 /* TViewType.Root */, null, null, 1, 0, null, null, null, null, null);
        const rootLView = createLView(null, rootTView, null, rootFlags, null, null, rendererFactory, hostRenderer, sanitizer, rootViewInjector, null);
        // rootView is the parent when bootstrapping
        // TODO(misko): it looks like we are entering view here but we don't really need to as
        // `renderView` does that. However as the code is written it is needed because
        // `createRootComponentView` and `createRootComponent` both read global state. Fixing those
        // issues would allow us to drop this.
        enterView(rootLView);
        let component;
        let tElementNode;
        try {
            const rootComponentDef = this.componentDef;
            let rootDirectives;
            let hostDirectiveDefs = null;
            if (rootComponentDef.findHostDirectiveDefs) {
                rootDirectives = [];
                hostDirectiveDefs = new Map();
                rootComponentDef.findHostDirectiveDefs(rootComponentDef, rootDirectives, hostDirectiveDefs);
                rootDirectives.push(rootComponentDef);
            }
            else {
                rootDirectives = [rootComponentDef];
            }
            const hostTNode = createRootComponentTNode(rootLView, hostRNode);
            const componentView = createRootComponentView(hostTNode, hostRNode, rootComponentDef, rootDirectives, rootLView, rendererFactory, hostRenderer);
            tElementNode = getTNode(rootTView, HEADER_OFFSET);
            // TODO(crisbeto): in practice `hostRNode` should always be defined, but there are some tests
            // where the renderer is mocked out and `undefined` is returned. We should update the tests so
            // that this check can be removed.
            if (hostRNode) {
                setRootNodeAttributes(hostRenderer, rootComponentDef, hostRNode, rootSelectorOrNode);
            }
            if (projectableNodes !== undefined) {
                projectNodes(tElementNode, this.ngContentSelectors, projectableNodes);
            }
            // TODO: should LifecycleHooksFeature and other host features be generated by the compiler and
            // executed here?
            // Angular 5 reference: https://stackblitz.com/edit/lifecycle-hooks-vcref
            component = createRootComponent(componentView, rootComponentDef, rootDirectives, hostDirectiveDefs, rootLView, [LifecycleHooksFeature]);
            renderView(rootTView, rootLView, null);
        }
        finally {
            leaveView();
        }
        return new ComponentRef(this.componentType, component, createElementRef(tElementNode, rootLView), rootLView, tElementNode);
    }
}
/**
 * Represents an instance of a Component created via a {@link ComponentFactory}.
 *
 * `ComponentRef` provides access to the Component Instance as well other objects related to this
 * Component Instance and allows you to destroy the Component Instance via the {@link #destroy}
 * method.
 *
 */
export class ComponentRef extends AbstractComponentRef {
    constructor(componentType, instance, location, _rootLView, _tNode) {
        super();
        this.location = location;
        this._rootLView = _rootLView;
        this._tNode = _tNode;
        this.instance = instance;
        this.hostView = this.changeDetectorRef = new RootViewRef(_rootLView);
        this.componentType = componentType;
    }
    setInput(name, value) {
        const inputData = this._tNode.inputs;
        let dataValue;
        if (inputData !== null && (dataValue = inputData[name])) {
            const lView = this._rootLView;
            setInputsForProperty(lView[TVIEW], lView, dataValue, name, value);
            markDirtyIfOnPush(lView, this._tNode.index);
        }
        else {
            if (ngDevMode) {
                const cmpNameForError = stringifyForError(this.componentType);
                let message = `Can't set value of the '${name}' input on the '${cmpNameForError}' component. `;
                message += `Make sure that the '${name}' property is annotated with @Input() or a mapped @Input('${name}') exists.`;
                reportUnknownPropertyError(message);
            }
        }
    }
    get injector() {
        return new NodeInjector(this._tNode, this._rootLView);
    }
    destroy() {
        this.hostView.destroy();
    }
    onDestroy(callback) {
        this.hostView.onDestroy(callback);
    }
}
// TODO: A hack to not pull in the NullInjector from @angular/core.
export const NULL_INJECTOR = {
    get: (token, notFoundValue) => {
        throwProviderNotFoundError(token, 'NullInjector');
    }
};
/** Creates a TNode that can be used to instantiate a root component. */
function createRootComponentTNode(lView, rNode) {
    const tView = lView[TVIEW];
    const index = HEADER_OFFSET;
    ngDevMode && assertIndexInRange(lView, index);
    lView[index] = rNode;
    // '#host' is added here as we don't know the real host DOM name (we don't want to read it) and at
    // the same time we want to communicate the debug `TNode` that this is a special `TNode`
    // representing a host element.
    return getOrCreateTNode(tView, index, 2 /* TNodeType.Element */, '#host', null);
}
/**
 * Creates the root component view and the root component node.
 *
 * @param rNode Render host element.
 * @param rootComponentDef ComponentDef
 * @param rootView The parent view where the host node is stored
 * @param rendererFactory Factory to be used for creating child renderers.
 * @param hostRenderer The current renderer
 * @param sanitizer The sanitizer, if provided
 *
 * @returns Component view created
 */
function createRootComponentView(tNode, rNode, rootComponentDef, rootDirectives, rootView, rendererFactory, hostRenderer, sanitizer) {
    const tView = rootView[TVIEW];
    applyRootComponentStyling(rootDirectives, tNode, rNode, hostRenderer);
    const viewRenderer = rendererFactory.createRenderer(rNode, rootComponentDef);
    const componentView = createLView(rootView, getOrCreateComponentTView(rootComponentDef), null, rootComponentDef.onPush ? 32 /* LViewFlags.Dirty */ : 16 /* LViewFlags.CheckAlways */, rootView[tNode.index], tNode, rendererFactory, viewRenderer, sanitizer || null, null, null);
    if (tView.firstCreatePass) {
        markAsComponentHost(tView, tNode, rootDirectives.length - 1);
    }
    addToViewTree(rootView, componentView);
    // Store component view at node index, with node as the HOST
    return rootView[tNode.index] = componentView;
}
/** Sets up the styling information on a root component. */
function applyRootComponentStyling(rootDirectives, tNode, rNode, hostRenderer) {
    for (const def of rootDirectives) {
        tNode.mergedAttrs = mergeHostAttrs(tNode.mergedAttrs, def.hostAttrs);
    }
    if (tNode.mergedAttrs !== null) {
        computeStaticStyling(tNode, tNode.mergedAttrs, true);
        if (rNode !== null) {
            setupStaticAttributes(hostRenderer, rNode, tNode);
        }
    }
}
/**
 * Creates a root component and sets it up with features and host bindings.Shared by
 * renderComponent() and ViewContainerRef.createComponent().
 */
function createRootComponent(componentView, rootComponentDef, rootDirectives, hostDirectiveDefs, rootLView, hostFeatures) {
    const rootTNode = getCurrentTNode();
    ngDevMode && assertDefined(rootTNode, 'tNode should have been already created');
    const tView = rootLView[TVIEW];
    const native = getNativeByTNode(rootTNode, rootLView);
    initializeDirectives(tView, rootLView, rootTNode, rootDirectives, null, hostDirectiveDefs);
    for (let i = 0; i < rootDirectives.length; i++) {
        const directiveIndex = rootTNode.directiveStart + i;
        const directiveInstance = getNodeInjectable(rootLView, tView, directiveIndex, rootTNode);
        attachPatchData(directiveInstance, rootLView);
    }
    invokeDirectivesHostBindings(tView, rootLView, rootTNode);
    if (native) {
        attachPatchData(native, rootLView);
    }
    // We're guaranteed for the `componentOffset` to be positive here
    // since a root component always matches a component def.
    ngDevMode &&
        assertGreaterThan(rootTNode.componentOffset, -1, 'componentOffset must be great than -1');
    const component = getNodeInjectable(rootLView, tView, rootTNode.directiveStart + rootTNode.componentOffset, rootTNode);
    componentView[CONTEXT] = rootLView[CONTEXT] = component;
    if (hostFeatures !== null) {
        for (const feature of hostFeatures) {
            feature(component, rootComponentDef);
        }
    }
    // We want to generate an empty QueryList for root content queries for backwards
    // compatibility with ViewEngine.
    executeContentQueries(tView, rootTNode, componentView);
    return component;
}
/** Sets the static attributes on a root component. */
function setRootNodeAttributes(hostRenderer, componentDef, hostRNode, rootSelectorOrNode) {
    if (rootSelectorOrNode) {
        setUpAttributes(hostRenderer, hostRNode, ['ng-version', VERSION.full]);
    }
    else {
        // If host element is created as a part of this function call (i.e. `rootSelectorOrNode`
        // is not defined), also apply attributes and classes extracted from component selector.
        // Extract attributes and classes from the first selector only to match VE behavior.
        const { attrs, classes } = extractAttrsAndClassesFromSelector(componentDef.selectors[0]);
        if (attrs) {
            setUpAttributes(hostRenderer, hostRNode, attrs);
        }
        if (classes && classes.length > 0) {
            writeDirectClass(hostRenderer, hostRNode, classes.join(' '));
        }
    }
}
/** Projects the `projectableNodes` that were specified when creating a root component. */
function projectNodes(tNode, ngContentSelectors, projectableNodes) {
    const projection = tNode.projection = [];
    for (let i = 0; i < ngContentSelectors.length; i++) {
        const nodesforSlot = projectableNodes[i];
        // Projectable nodes can be passed as array of arrays or an array of iterables (ngUpgrade
        // case). Here we do normalize passed data structure to be an array of arrays to avoid
        // complex checks down the line.
        // We also normalize the length of the passed in projectable nodes (to match the number of
        // <ng-container> slots defined by a component).
        projection.push(nodesforSlot != null ? Array.from(nodesforSlot) : null);
    }
}
/**
 * Used to enable lifecycle hooks on the root component.
 *
 * Include this feature when calling `renderComponent` if the root component
 * you are rendering has lifecycle hooks defined. Otherwise, the hooks won't
 * be called properly.
 *
 * Example:
 *
 * ```
 * renderComponent(AppComponent, {hostFeatures: [LifecycleHooksFeature]});
 * ```
 */
export function LifecycleHooksFeature() {
    const tNode = getCurrentTNode();
    ngDevMode && assertDefined(tNode, 'TNode is required');
    registerPostOrderHooks(getLView()[TVIEW], tNode);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9uZW50X3JlZi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc3JjL3JlbmRlcjMvY29tcG9uZW50X3JlZi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFJSCxPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSw4QkFBOEIsQ0FBQztBQUcvRCxPQUFPLEVBQUMsbUJBQW1CLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUN0RCxPQUFPLEVBQUMsWUFBWSxFQUFtQixNQUFNLFdBQVcsQ0FBQztBQUV6RCxPQUFPLEVBQUMsZ0JBQWdCLElBQUksd0JBQXdCLEVBQUUsWUFBWSxJQUFJLG9CQUFvQixFQUFDLE1BQU0sNkJBQTZCLENBQUM7QUFDL0gsT0FBTyxFQUFDLHdCQUF3QixJQUFJLGdDQUFnQyxFQUFDLE1BQU0sc0NBQXNDLENBQUM7QUFDbEgsT0FBTyxFQUFDLGdCQUFnQixFQUFhLE1BQU0sdUJBQXVCLENBQUM7QUFFbkUsT0FBTyxFQUFZLGdCQUFnQixFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQzFELE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSwyQkFBMkIsQ0FBQztBQUNwRCxPQUFPLEVBQUMsYUFBYSxFQUFFLGlCQUFpQixFQUFFLGtCQUFrQixFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDcEYsT0FBTyxFQUFDLE9BQU8sRUFBQyxNQUFNLFlBQVksQ0FBQztBQUNuQyxPQUFPLEVBQUMscUNBQXFDLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUU3RSxPQUFPLEVBQUMsbUJBQW1CLEVBQUMsTUFBTSxVQUFVLENBQUM7QUFDN0MsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQ3BELE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFDN0MsT0FBTyxFQUFDLGlCQUFpQixFQUFFLFlBQVksRUFBQyxNQUFNLE1BQU0sQ0FB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LENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDekU7QUFDSCxDQUFDO0FBRUQ7Ozs7Ozs7Ozs7OztHQVlHO0FBQ0gsTUFBTSxVQUFVLHFCQUFxQjtJQUNuQyxNQUFNLEtBQUssR0FBRyxlQUFlLEVBQUcsQ0FBQztJQUNqQyxTQUFTLElBQUksYUFBYSxDQUFDLEtBQUssRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO0lBQ3ZELHNCQUFzQixDQUFDLFFBQVEsRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQ25ELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtDaGFuZ2VEZXRlY3RvclJlZn0gZnJvbSAnLi4vY2hhbmdlX2RldGVjdGlvbi9jaGFuZ2VfZGV0ZWN0b3JfcmVmJztcbmltcG9ydCB7SW5qZWN0b3J9IGZyb20gJy4uL2RpL2luamVjdG9yJztcbmltcG9ydCB7Y29udmVydFRvQml0RmxhZ3N9IGZyb20gJy4uL2RpL2luamVjdG9yX2NvbXBhdGliaWxpdHknO1xuaW1wb3J0IHtJbmplY3RGbGFncywgSW5qZWN0T3B0aW9uc30gZnJvbSAnLi4vZGkvaW50ZXJmYWNlL2luamVjdG9yJztcbmltcG9ydCB7UHJvdmlkZXJUb2tlbn0gZnJvbSAnLi4vZGkvcHJvdmlkZXJfdG9rZW4nO1xuaW1wb3J0IHtFbnZpcm9ubWVudEluamVjdG9yfSBmcm9tICcuLi9kaS9yM19pbmplY3Rvcic7XG5pbXBvcnQge1J1bnRpbWVFcnJvciwgUnVudGltZUVycm9yQ29kZX0gZnJvbSAnLi4vZXJyb3JzJztcbmltcG9ydCB7VHlwZX0gZnJvbSAnLi4vaW50ZXJmYWNlL3R5cGUnO1xuaW1wb3J0IHtDb21wb25lbnRGYWN0b3J5IGFzIEFic3RyYWN0Q29tcG9uZW50RmFjdG9yeSwgQ29tcG9uZW50UmVmIGFzIEFic3RyYWN0Q29tcG9uZW50UmVmfSBmcm9tICcuLi9saW5rZXIvY29tcG9uZW50X2ZhY3RvcnknO1xuaW1wb3J0IHtDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIgYXMgQWJzdHJhY3RDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXJ9IGZyb20gJy4uL2xpbmtlci9jb21wb25lbnRfZmFjdG9yeV9yZXNvbHZlcic7XG5pbXBvcnQge2NyZWF0ZUVsZW1lbnRSZWYsIEVsZW1lbnRSZWZ9IGZyb20gJy4uL2xpbmtlci9lbGVtZW50X3JlZic7XG5pbXBvcnQge05nTW9kdWxlUmVmfSBmcm9tICcuLi9saW5rZXIvbmdfbW9kdWxlX2ZhY3RvcnknO1xuaW1wb3J0IHtSZW5kZXJlcjIsIFJlbmRlcmVyRmFjdG9yeTJ9IGZyb20gJy4uL3JlbmRlci9hcGknO1xuaW1wb3J0IHtTYW5pdGl6ZXJ9IGZyb20gJy4uL3Nhbml0aXphdGlvbi9zYW5pdGl6ZXInO1xuaW1wb3J0IHthc3NlcnREZWZpbmVkLCBhc3NlcnRHcmVhdGVyVGhhbiwgYXNzZXJ0SW5kZXhJblJhbmdlfSBmcm9tICcuLi91dGlsL2Fzc2VydCc7XG5pbXBvcnQge1ZFUlNJT059IGZyb20gJy4uL3ZlcnNpb24nO1xuaW1wb3J0IHtOT1RfRk9VTkRfQ0hFQ0tfT05MWV9FTEVNRU5UX0lOSkVDVE9SfSBmcm9tICcuLi92aWV3L3Byb3ZpZGVyX2ZsYWdzJztcblxuaW1wb3J0IHthc3NlcnRDb21wb25lbnRUeXBlfSBmcm9tICcuL2Fzc2VydCc7XG5pbXBvcnQge2F0dGFjaFBhdGNoRGF0YX0gZnJvbSAnLi9jb250ZXh0X2Rpc2NvdmVyeSc7XG5pbXBvcnQge2dldENvbXBvbmVudERlZn0gZnJvbSAnLi9kZWZpbml0aW9uJztcbmltcG9ydCB7Z2V0Tm9kZUluamVjdGFibGUsIE5vZGVJbmplY3Rvcn0gZnJvbSAnLi9kaSc7XG5pbXBvcnQge3Rocm93UHJvdmlkZXJOb3RGb3VuZEVycm9yfSBmcm9tICcuL2Vycm9yc19kaSc7XG5pbXBvcnQge3JlZ2lzdGVyUG9zdE9yZGVySG9va3N9IGZyb20gJy4vaG9va3MnO1xuaW1wb3J0IHtyZXBvcnRVbmtub3duUHJvcGVydHlFcnJvcn0gZnJvbSAnLi9pbnN0cnVjdGlvbnMvZWxlbWVudF92YWxpZGF0aW9uJztcbmltcG9ydCB7YWRkVG9WaWV3VHJlZSwgY3JlYXRlTFZpZXcsIGNyZWF0ZVRWaWV3LCBleGVjdXRlQ29udGVudFF1ZXJpZXMsIGdldE9yQ3JlYXRlQ29tcG9uZW50VFZpZXcsIGdldE9yQ3JlYXRlVE5vZGUsIGluaXRpYWxpemVEaXJlY3RpdmVzLCBpbnZva2VEaXJlY3RpdmVzSG9zdEJpbmRpbmdzLCBsb2NhdGVIb3N0RWxlbWVudCwgbWFya0FzQ29tcG9uZW50SG9zdCwgbWFya0RpcnR5SWZPblB1c2gsIHJlbmRlclZpZXcsIHNldElucHV0c0ZvclByb3BlcnR5fSBmcm9tICcuL2luc3RydWN0aW9ucy9zaGFyZWQnO1xuaW1wb3J0IHtDb21wb25lbnREZWYsIERpcmVjdGl2ZURlZiwgSG9zdERpcmVjdGl2ZURlZnN9IGZyb20gJy4vaW50ZXJmYWNlcy9kZWZpbml0aW9uJztcbmltcG9ydCB7UHJvcGVydHlBbGlhc1ZhbHVlLCBUQ29udGFpbmVyTm9kZSwgVEVsZW1lbnRDb250YWluZXJOb2RlLCBURWxlbWVudE5vZGUsIFROb2RlLCBUTm9kZVR5cGV9IGZyb20gJy4vaW50ZXJmYWNlcy9ub2RlJztcbmltcG9ydCB7UmVuZGVyZXIsIFJlbmRlcmVyRmFjdG9yeX0gZnJvbSAnLi9pbnRlcmZhY2VzL3JlbmRlcmVyJztcbmltcG9ydCB7UkVsZW1lbnQsIFJOb2RlfSBmcm9tICcuL2ludGVyZmFjZXMvcmVuZGVyZXJfZG9tJztcbmltcG9ydCB7Q09OVEVYVCwgSEVBREVSX09GRlNFVCwgTFZpZXcsIExWaWV3RmxhZ3MsIFRWSUVXLCBUVmlld1R5cGV9IGZyb20gJy4vaW50ZXJmYWNlcy92aWV3JztcbmltcG9ydCB7TUFUSF9NTF9OQU1FU1BBQ0UsIFNWR19OQU1FU1BBQ0V9IGZyb20gJy4vbmFtZXNwYWNlcyc7XG5pbXBvcnQge2NyZWF0ZUVsZW1lbnROb2RlLCBzZXR1cFN0YXRpY0F0dHJpYnV0ZXMsIHdyaXRlRGlyZWN0Q2xhc3N9IGZyb20gJy4vbm9kZV9tYW5pcHVsYXRpb24nO1xuaW1wb3J0IHtleHRyYWN0QXR0cnNBbmRDbGFzc2VzRnJvbVNlbGVjdG9yLCBzdHJpbmdpZnlDU1NTZWxlY3Rvckxpc3R9IGZyb20gJy4vbm9kZV9zZWxlY3Rvcl9tYXRjaGVyJztcbmltcG9ydCB7ZW50ZXJWaWV3LCBnZXRDdXJyZW50VE5vZGUsIGdldExWaWV3LCBsZWF2ZVZpZXd9IGZyb20gJy4vc3RhdGUnO1xuaW1wb3J0IHtjb21wdXRlU3RhdGljU3R5bGluZ30gZnJvbSAnLi9zdHlsaW5nL3N0YXRpY19zdHlsaW5nJztcbmltcG9ydCB7bWVyZ2VIb3N0QXR0cnMsIHNldFVwQXR0cmlidXRlc30gZnJvbSAnLi91dGlsL2F0dHJzX3V0aWxzJztcbmltcG9ydCB7c3RyaW5naWZ5Rm9yRXJyb3J9IGZyb20gJy4vdXRpbC9zdHJpbmdpZnlfdXRpbHMnO1xuaW1wb3J0IHtnZXROYXRpdmVCeVROb2RlLCBnZXRUTm9kZX0gZnJvbSAnLi91dGlsL3ZpZXdfdXRpbHMnO1xuaW1wb3J0IHtSb290Vmlld1JlZiwgVmlld1JlZn0gZnJvbSAnLi92aWV3X3JlZic7XG5cbmV4cG9ydCBjbGFzcyBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIgZXh0ZW5kcyBBYnN0cmFjdENvbXBvbmVudEZhY3RvcnlSZXNvbHZlciB7XG4gIC8qKlxuICAgKiBAcGFyYW0gbmdNb2R1bGUgVGhlIE5nTW9kdWxlUmVmIHRvIHdoaWNoIGFsbCByZXNvbHZlZCBmYWN0b3JpZXMgYXJlIGJvdW5kLlxuICAgKi9cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBuZ01vZHVsZT86IE5nTW9kdWxlUmVmPGFueT4pIHtcbiAgICBzdXBlcigpO1xuICB9XG5cbiAgb3ZlcnJpZGUgcmVzb2x2ZUNvbXBvbmVudEZhY3Rvcnk8VD4oY29tcG9uZW50OiBUeXBlPFQ+KTogQWJzdHJhY3RDb21wb25lbnRGYWN0b3J5PFQ+IHtcbiAgICBuZ0Rldk1vZGUgJiYgYXNzZXJ0Q29tcG9uZW50VHlwZShjb21wb25lbnQpO1xuICAgIGNvbnN0IGNvbXBvbmVudERlZiA9IGdldENvbXBvbmVudERlZihjb21wb25lbnQpITtcbiAgICByZXR1cm4gbmV3IENvbXBvbmVudEZhY3RvcnkoY29tcG9uZW50RGVmLCB0aGlzLm5nTW9kdWxlKTtcbiAgfVxufVxuXG5mdW5jdGlvbiB0b1JlZkFycmF5KG1hcDoge1trZXk6IHN0cmluZ106IHN0cmluZ30pOiB7cHJvcE5hbWU6IHN0cmluZzsgdGVtcGxhdGVOYW1lOiBzdHJpbmc7fVtdIHtcbiAgY29uc3QgYXJyYXk6IHtwcm9wTmFtZTogc3RyaW5nOyB0ZW1wbGF0ZU5hbWU6IHN0cmluZzt9W10gPSBbXTtcbiAgZm9yIChsZXQgbm9uTWluaWZpZWQgaW4gbWFwKSB7XG4gICAgaWYgKG1hcC5oYXNPd25Qcm9wZXJ0eShub25NaW5pZmllZCkpIHtcbiAgICAgIGNvbnN0IG1pbmlmaWVkID0gbWFwW25vbk1pbmlmaWVkXTtcbiAgICAgIGFycmF5LnB1c2goe3Byb3BOYW1lOiBtaW5pZmllZCwgdGVtcGxhdGVOYW1lOiBub25NaW5pZmllZH0pO1xuICAgIH1cbiAgfVxuICByZXR1cm4gYXJyYXk7XG59XG5cbmZ1bmN0aW9uIGdldE5hbWVzcGFjZShlbGVtZW50TmFtZTogc3RyaW5nKTogc3RyaW5nfG51bGwge1xuICBjb25zdCBuYW1lID0gZWxlbWVudE5hbWUudG9Mb3dlckNhc2UoKTtcbiAgcmV0dXJuIG5hbWUgPT09ICdzdmcnID8gU1ZHX05BTUVTUEFDRSA6IChuYW1lID09PSAnbWF0aCcgPyBNQVRIX01MX05BTUVTUEFDRSA6IG51bGwpO1xufVxuXG4vKipcbiAqIEluamVjdG9yIHRoYXQgbG9va3MgdXAgYSB2YWx1ZSB1c2luZyBhIHNwZWNpZmljIGluamVjdG9yLCBiZWZvcmUgZmFsbGluZyBiYWNrIHRvIHRoZSBtb2R1bGVcbiAqIGluamVjdG9yLiBVc2VkIHByaW1hcmlseSB3aGVuIGNyZWF0aW5nIGNvbXBvbmVudHMgb3IgZW1iZWRkZWQgdmlld3MgZHluYW1pY2FsbHkuXG4gKi9cbmNsYXNzIENoYWluZWRJbmplY3RvciBpbXBsZW1lbnRzIEluamVjdG9yIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBpbmplY3RvcjogSW5qZWN0b3IsIHByaXZhdGUgcGFyZW50SW5qZWN0b3I6IEluamVjdG9yKSB7fVxuXG4gIGdldDxUPih0b2tlbjogUHJvdmlkZXJUb2tlbjxUPiwgbm90Rm91bmRWYWx1ZT86IFQsIGZsYWdzPzogSW5qZWN0RmxhZ3N8SW5qZWN0T3B0aW9ucyk6IFQge1xuICAgIGZsYWdzID0gY29udmVydFRvQml0RmxhZ3MoZmxhZ3MpO1xuICAgIGNvbnN0IHZhbHVlID0gdGhpcy5pbmplY3Rvci5nZXQ8VHx0eXBlb2YgTk9UX0ZPVU5EX0NIRUNLX09OTFlfRUxFTUVOVF9JTkpFQ1RPUj4oXG4gICAgICAgIHRva2VuLCBOT1RfRk9VTkRfQ0hFQ0tfT05MWV9FTEVNRU5UX0lOSkVDVE9SLCBmbGFncyk7XG5cbiAgICBpZiAodmFsdWUgIT09IE5PVF9GT1VORF9DSEVDS19PTkxZX0VMRU1FTlRfSU5KRUNUT1IgfHxcbiAgICAgICAgbm90Rm91bmRWYWx1ZSA9PT0gKE5PVF9GT1VORF9DSEVDS19PTkxZX0VMRU1FTlRfSU5KRUNUT1IgYXMgdW5rbm93biBhcyBUKSkge1xuICAgICAgLy8gUmV0dXJuIHRoZSB2YWx1ZSBmcm9tIHRoZSByb290IGVsZW1lbnQgaW5qZWN0b3Igd2hlblxuICAgICAgLy8gLSBpdCBwcm92aWRlcyBpdFxuICAgICAgLy8gICAodmFsdWUgIT09IE5PVF9GT1VORF9DSEVDS19PTkxZX0VMRU1FTlRfSU5KRUNUT1IpXG4gICAgICAvLyAtIHRoZSBtb2R1bGUgaW5qZWN0b3Igc2hvdWxkIG5vdCBiZSBjaGVja2VkXG4gICAgICAvLyAgIChub3RGb3VuZFZhbHVlID09PSBOT1RfRk9VTkRfQ0hFQ0tfT05MWV9FTEVNRU5UX0lOSkVDVE9SKVxuICAgICAgcmV0dXJuIHZhbHVlIGFzIFQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMucGFyZW50SW5qZWN0b3IuZ2V0KHRva2VuLCBub3RGb3VuZFZhbHVlLCBmbGFncyk7XG4gIH1cbn1cblxuLyoqXG4gKiBDb21wb25lbnRGYWN0b3J5IGludGVyZmFjZSBpbXBsZW1lbnRhdGlvbi5cbiAqL1xuZXhwb3J0IGNsYXNzIENvbXBvbmVudEZhY3Rvcnk8VD4gZXh0ZW5kcyBBYnN0cmFjdENvbXBvbmVudEZhY3Rvcnk8VD4ge1xuICBvdmVycmlkZSBzZWxlY3Rvcjogc3RyaW5nO1xuICBvdmVycmlkZSBjb21wb25lbnRUeXBlOiBUeXBlPGFueT47XG4gIG92ZXJyaWRlIG5nQ29udGVudFNlbGVjdG9yczogc3RyaW5nW107XG4gIGlzQm91bmRUb01vZHVsZTogYm9vbGVhbjtcblxuICBvdmVycmlkZSBnZXQgaW5wdXRzKCk6IHtwcm9wTmFtZTogc3RyaW5nOyB0ZW1wbGF0ZU5hbWU6IHN0cmluZzt9W10ge1xuICAgIHJldHVybiB0b1JlZkFycmF5KHRoaXMuY29tcG9uZW50RGVmLmlucHV0cyk7XG4gIH1cblxuICBvdmVycmlkZSBnZXQgb3V0cHV0cygpOiB7cHJvcE5hbWU6IHN0cmluZzsgdGVtcGxhdGVOYW1lOiBzdHJpbmc7fVtdIHtcbiAgICByZXR1cm4gdG9SZWZBcnJheSh0aGlzLmNvbXBvbmVudERlZi5vdXRwdXRzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0gY29tcG9uZW50RGVmIFRoZSBjb21wb25lbnQgZGVmaW5pdGlvbi5cbiAgICogQHBhcmFtIG5nTW9kdWxlIFRoZSBOZ01vZHVsZVJlZiB0byB3aGljaCB0aGUgZmFjdG9yeSBpcyBib3VuZC5cbiAgICovXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgY29tcG9uZW50RGVmOiBDb21wb25lbnREZWY8YW55PiwgcHJpdmF0ZSBuZ01vZHVsZT86IE5nTW9kdWxlUmVmPGFueT4pIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuY29tcG9uZW50VHlwZSA9IGNvbXBvbmVudERlZi50eXBlO1xuICAgIHRoaXMuc2VsZWN0b3IgPSBzdHJpbmdpZnlDU1NTZWxlY3Rvckxpc3QoY29tcG9uZW50RGVmLnNlbGVjdG9ycyk7XG4gICAgdGhpcy5uZ0NvbnRlbnRTZWxlY3RvcnMgPVxuICAgICAgICBjb21wb25lbnREZWYubmdDb250ZW50U2VsZWN0b3JzID8gY29tcG9uZW50RGVmLm5nQ29udGVudFNlbGVjdG9ycyA6IFtdO1xuICAgIHRoaXMuaXNCb3VuZFRvTW9kdWxlID0gISFuZ01vZHVsZTtcbiAgfVxuXG4gIG92ZXJyaWRlIGNyZWF0ZShcbiAgICAgIGluamVjdG9yOiBJbmplY3RvciwgcHJvamVjdGFibGVOb2Rlcz86IGFueVtdW118dW5kZWZpbmVkLCByb290U2VsZWN0b3JPck5vZGU/OiBhbnksXG4gICAgICBlbnZpcm9ubWVudEluamVjdG9yPzogTmdNb2R1bGVSZWY8YW55PnxFbnZpcm9ubWVudEluamVjdG9yfFxuICAgICAgdW5kZWZpbmVkKTogQWJzdHJhY3RDb21wb25lbnRSZWY8VD4ge1xuICAgIGVudmlyb25tZW50SW5qZWN0b3IgPSBlbnZpcm9ubWVudEluamVjdG9yIHx8IHRoaXMubmdNb2R1bGU7XG5cbiAgICBsZXQgcmVhbEVudmlyb25tZW50SW5qZWN0b3IgPSBlbnZpcm9ubWVudEluamVjdG9yIGluc3RhbmNlb2YgRW52aXJvbm1lbnRJbmplY3RvciA/XG4gICAgICAgIGVudmlyb25tZW50SW5qZWN0b3IgOlxuICAgICAgICBlbnZpcm9ubWVudEluamVjdG9yPy5pbmplY3RvcjtcblxuICAgIGlmIChyZWFsRW52aXJvbm1lbnRJbmplY3RvciAmJiB0aGlzLmNvbXBvbmVudERlZi5nZXRTdGFuZGFsb25lSW5qZWN0b3IgIT09IG51bGwpIHtcbiAgICAgIHJlYWxFbnZpcm9ubWVudEluamVjdG9yID0gdGhpcy5jb21wb25lbnREZWYuZ2V0U3RhbmRhbG9uZUluamVjdG9yKHJlYWxFbnZpcm9ubWVudEluamVjdG9yKSB8fFxuICAgICAgICAgIHJlYWxFbnZpcm9ubWVudEluamVjdG9yO1xuICAgIH1cblxuICAgIGNvbnN0IHJvb3RWaWV3SW5qZWN0b3IgPVxuICAgICAgICByZWFsRW52aXJvbm1lbnRJbmplY3RvciA/IG5ldyBDaGFpbmVkSW5qZWN0b3IoaW5qZWN0b3IsIHJlYWxFbnZpcm9ubWVudEluamVjdG9yKSA6IGluamVjdG9yO1xuXG4gICAgY29uc3QgcmVuZGVyZXJGYWN0b3J5ID0gcm9vdFZpZXdJbmplY3Rvci5nZXQoUmVuZGVyZXJGYWN0b3J5MiwgbnVsbCk7XG4gICAgaWYgKHJlbmRlcmVyRmFjdG9yeSA9PT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgICBSdW50aW1lRXJyb3JDb2RlLlJFTkRFUkVSX05PVF9GT1VORCxcbiAgICAgICAgICBuZ0Rldk1vZGUgJiZcbiAgICAgICAgICAgICAgJ0FuZ3VsYXIgd2FzIG5vdCBhYmxlIHRvIGluamVjdCBhIHJlbmRlcmVyIChSZW5kZXJlckZhY3RvcnkyKS4gJyArXG4gICAgICAgICAgICAgICAgICAnTGlrZWx5IHRoaXMgaXMgZHVlIHRvIGEgYnJva2VuIERJIGhpZXJhcmNoeS4gJyArXG4gICAgICAgICAgICAgICAgICAnTWFrZSBzdXJlIHRoYXQgYW55IGluamVjdG9yIHVzZWQgdG8gY3JlYXRlIHRoaXMgY29tcG9uZW50IGhhcyBhIGNvcnJlY3QgcGFyZW50LicpO1xuICAgIH1cbiAgICBjb25zdCBzYW5pdGl6ZXIgPSByb290Vmlld0luamVjdG9yLmdldChTYW5pdGl6ZXIsIG51bGwpO1xuXG4gICAgY29uc3QgaG9zdFJlbmRlcmVyID0gcmVuZGVyZXJGYWN0b3J5LmNyZWF0ZVJlbmRlcmVyKG51bGwsIHRoaXMuY29tcG9uZW50RGVmKTtcbiAgICAvLyBEZXRlcm1pbmUgYSB0YWcgbmFtZSB1c2VkIGZvciBjcmVhdGluZyBob3N0IGVsZW1lbnRzIHdoZW4gdGhpcyBjb21wb25lbnQgaXMgY3JlYXRlZFxuICAgIC8vIGR5bmFtaWNhbGx5LiBEZWZhdWx0IHRvICdkaXYnIGlmIHRoaXMgY29tcG9uZW50IGRpZCBub3Qgc3BlY2lmeSBhbnkgdGFnIG5hbWUgaW4gaXRzIHNlbGVjdG9yLlxuICAgIGNvbnN0IGVsZW1lbnROYW1lID0gdGhpcy5jb21wb25lbnREZWYuc2VsZWN0b3JzWzBdWzBdIGFzIHN0cmluZyB8fCAnZGl2JztcbiAgICBjb25zdCBob3N0Uk5vZGUgPSByb290U2VsZWN0b3JPck5vZGUgP1xuICAgICAgICBsb2NhdGVIb3N0RWxlbWVudChob3N0UmVuZGVyZXIsIHJvb3RTZWxlY3Rvck9yTm9kZSwgdGhpcy5jb21wb25lbnREZWYuZW5jYXBzdWxhdGlvbikgOlxuICAgICAgICBjcmVhdGVFbGVtZW50Tm9kZShob3N0UmVuZGVyZXIsIGVsZW1lbnROYW1lLCBnZXROYW1lc3BhY2UoZWxlbWVudE5hbWUpKTtcblxuICAgIGNvbnN0IHJvb3RGbGFncyA9IHRoaXMuY29tcG9uZW50RGVmLm9uUHVzaCA/IExWaWV3RmxhZ3MuRGlydHkgfCBMVmlld0ZsYWdzLklzUm9vdCA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTFZpZXdGbGFncy5DaGVja0Fsd2F5cyB8IExWaWV3RmxhZ3MuSXNSb290O1xuXG4gICAgLy8gQ3JlYXRlIHRoZSByb290IHZpZXcuIFVzZXMgZW1wdHkgVFZpZXcgYW5kIENvbnRlbnRUZW1wbGF0ZS5cbiAgICBjb25zdCByb290VFZpZXcgPSBjcmVhdGVUVmlldyhUVmlld1R5cGUuUm9vdCwgbnVsbCwgbnVsbCwgMSwgMCwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCk7XG4gICAgY29uc3Qgcm9vdExWaWV3ID0gY3JlYXRlTFZpZXcoXG4gICAgICAgIG51bGwsIHJvb3RUVmlldywgbnVsbCwgcm9vdEZsYWdzLCBudWxsLCBudWxsLCByZW5kZXJlckZhY3RvcnksIGhvc3RSZW5kZXJlciwgc2FuaXRpemVyLFxuICAgICAgICByb290Vmlld0luamVjdG9yLCBudWxsKTtcblxuICAgIC8vIHJvb3RWaWV3IGlzIHRoZSBwYXJlbnQgd2hlbiBib290c3RyYXBwaW5nXG4gICAgLy8gVE9ETyhtaXNrbyk6IGl0IGxvb2tzIGxpa2Ugd2UgYXJlIGVudGVyaW5nIHZpZXcgaGVyZSBidXQgd2UgZG9uJ3QgcmVhbGx5IG5lZWQgdG8gYXNcbiAgICAvLyBgcmVuZGVyVmlld2AgZG9lcyB0aGF0LiBIb3dldmVyIGFzIHRoZSBjb2RlIGlzIHdyaXR0ZW4gaXQgaXMgbmVlZGVkIGJlY2F1c2VcbiAgICAvLyBgY3JlYXRlUm9vdENvbXBvbmVudFZpZXdgIGFuZCBgY3JlYXRlUm9vdENvbXBvbmVudGAgYm90aCByZWFkIGdsb2JhbCBzdGF0ZS4gRml4aW5nIHRob3NlXG4gICAgLy8gaXNzdWVzIHdvdWxkIGFsbG93IHVzIHRvIGRyb3AgdGhpcy5cbiAgICBlbnRlclZpZXcocm9vdExWaWV3KTtcblxuICAgIGxldCBjb21wb25lbnQ6IFQ7XG4gICAgbGV0IHRFbGVtZW50Tm9kZTogVEVsZW1lbnROb2RlO1xuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJvb3RDb21wb25lbnREZWYgPSB0aGlzLmNvbXBvbmVudERlZjtcbiAgICAgIGxldCByb290RGlyZWN0aXZlczogRGlyZWN0aXZlRGVmPHVua25vd24+W107XG4gICAgICBsZXQgaG9zdERpcmVjdGl2ZURlZnM6IEhvc3REaXJlY3RpdmVEZWZzfG51bGwgPSBudWxsO1xuXG4gICAgICBpZiAocm9vdENvbXBvbmVudERlZi5maW5kSG9zdERpcmVjdGl2ZURlZnMpIHtcbiAgICAgICAgcm9vdERpcmVjdGl2ZXMgPSBbXTtcbiAgICAgICAgaG9zdERpcmVjdGl2ZURlZnMgPSBuZXcgTWFwKCk7XG4gICAgICAgIHJvb3RDb21wb25lbnREZWYuZmluZEhvc3REaXJlY3RpdmVEZWZzKHJvb3RDb21wb25lbnREZWYsIHJvb3REaXJlY3RpdmVzLCBob3N0RGlyZWN0aXZlRGVmcyk7XG4gICAgICAgIHJvb3REaXJlY3RpdmVzLnB1c2gocm9vdENvbXBvbmVudERlZik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByb290RGlyZWN0aXZlcyA9IFtyb290Q29tcG9uZW50RGVmXTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgaG9zdFROb2RlID0gY3JlYXRlUm9vdENvbXBvbmVudFROb2RlKHJvb3RMVmlldywgaG9zdFJOb2RlKTtcbiAgICAgIGNvbnN0IGNvbXBvbmVudFZpZXcgPSBjcmVhdGVSb290Q29tcG9uZW50VmlldyhcbiAgICAgICAgICBob3N0VE5vZGUsIGhvc3RSTm9kZSwgcm9vdENvbXBvbmVudERlZiwgcm9vdERpcmVjdGl2ZXMsIHJvb3RMVmlldywgcmVuZGVyZXJGYWN0b3J5LFxuICAgICAgICAgIGhvc3RSZW5kZXJlcik7XG5cbiAgICAgIHRFbGVtZW50Tm9kZSA9IGdldFROb2RlKHJvb3RUVmlldywgSEVBREVSX09GRlNFVCkgYXMgVEVsZW1lbnROb2RlO1xuXG4gICAgICAvLyBUT0RPKGNyaXNiZXRvKTogaW4gcHJhY3RpY2UgYGhvc3RSTm9kZWAgc2hvdWxkIGFsd2F5cyBiZSBkZWZpbmVkLCBidXQgdGhlcmUgYXJlIHNvbWUgdGVzdHNcbiAgICAgIC8vIHdoZXJlIHRoZSByZW5kZXJlciBpcyBtb2NrZWQgb3V0IGFuZCBgdW5kZWZpbmVkYCBpcyByZXR1cm5lZC4gV2Ugc2hvdWxkIHVwZGF0ZSB0aGUgdGVzdHMgc29cbiAgICAgIC8vIHRoYXQgdGhpcyBjaGVjayBjYW4gYmUgcmVtb3ZlZC5cbiAgICAgIGlmIChob3N0Uk5vZGUpIHtcbiAgICAgICAgc2V0Um9vdE5vZGVBdHRyaWJ1dGVzKGhvc3RSZW5kZXJlciwgcm9vdENvbXBvbmVudERlZiwgaG9zdFJOb2RlLCByb290U2VsZWN0b3JPck5vZGUpO1xuICAgICAgfVxuXG4gICAgICBpZiAocHJvamVjdGFibGVOb2RlcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHByb2plY3ROb2Rlcyh0RWxlbWVudE5vZGUsIHRoaXMubmdDb250ZW50U2VsZWN0b3JzLCBwcm9qZWN0YWJsZU5vZGVzKTtcbiAgICAgIH1cblxuICAgICAgLy8gVE9ETzogc2hvdWxkIExpZmVjeWNsZUhvb2tzRmVhdHVyZSBhbmQgb3RoZXIgaG9zdCBmZWF0dXJlcyBiZSBnZW5lcmF0ZWQgYnkgdGhlIGNvbXBpbGVyIGFuZFxuICAgICAgLy8gZXhlY3V0ZWQgaGVyZT9cbiAgICAgIC8vIEFuZ3VsYXIgNSByZWZlcmVuY2U6IGh0dHBzOi8vc3RhY2tibGl0ei5jb20vZWRpdC9saWZlY3ljbGUtaG9va3MtdmNyZWZcbiAgICAgIGNvbXBvbmVudCA9IGNyZWF0ZVJvb3RDb21wb25lbnQoXG4gICAgICAgICAgY29tcG9uZW50Vmlldywgcm9vdENvbXBvbmVudERlZiwgcm9vdERpcmVjdGl2ZXMsIGhvc3REaXJlY3RpdmVEZWZzLCByb290TFZpZXcsXG4gICAgICAgICAgW0xpZmVjeWNsZUhvb2tzRmVhdHVyZV0pO1xuICAgICAgcmVuZGVyVmlldyhyb290VFZpZXcsIHJvb3RMVmlldywgbnVsbCk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGxlYXZlVmlldygpO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgQ29tcG9uZW50UmVmKFxuICAgICAgICB0aGlzLmNvbXBvbmVudFR5cGUsIGNvbXBvbmVudCwgY3JlYXRlRWxlbWVudFJlZih0RWxlbWVudE5vZGUsIHJvb3RMVmlldyksIHJvb3RMVmlldyxcbiAgICAgICAgdEVsZW1lbnROb2RlKTtcbiAgfVxufVxuXG4vKipcbiAqIFJlcHJlc2VudHMgYW4gaW5zdGFuY2Ugb2YgYSBDb21wb25lbnQgY3JlYXRlZCB2aWEgYSB7QGxpbmsgQ29tcG9uZW50RmFjdG9yeX0uXG4gKlxuICogYENvbXBvbmVudFJlZmAgcHJvdmlkZXMgYWNjZXNzIHRvIHRoZSBDb21wb25lbnQgSW5zdGFuY2UgYXMgd2VsbCBvdGhlciBvYmplY3RzIHJlbGF0ZWQgdG8gdGhpc1xuICogQ29tcG9uZW50IEluc3RhbmNlIGFuZCBhbGxvd3MgeW91IHRvIGRlc3Ryb3kgdGhlIENvbXBvbmVudCBJbnN0YW5jZSB2aWEgdGhlIHtAbGluayAjZGVzdHJveX1cbiAqIG1ldGhvZC5cbiAqXG4gKi9cbmV4cG9ydCBjbGFzcyBDb21wb25lbnRSZWY8VD4gZXh0ZW5kcyBBYnN0cmFjdENvbXBvbmVudFJlZjxUPiB7XG4gIG92ZXJyaWRlIGluc3RhbmNlOiBUO1xuICBvdmVycmlkZSBob3N0VmlldzogVmlld1JlZjxUPjtcbiAgb3ZlcnJpZGUgY2hhbmdlRGV0ZWN0b3JSZWY6IENoYW5nZURldGVjdG9yUmVmO1xuICBvdmVycmlkZSBjb21wb25lbnRUeXBlOiBUeXBlPFQ+O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgY29tcG9uZW50VHlwZTogVHlwZTxUPiwgaW5zdGFuY2U6IFQsIHB1YmxpYyBsb2NhdGlvbjogRWxlbWVudFJlZiwgcHJpdmF0ZSBfcm9vdExWaWV3OiBMVmlldyxcbiAgICAgIHByaXZhdGUgX3ROb2RlOiBURWxlbWVudE5vZGV8VENvbnRhaW5lck5vZGV8VEVsZW1lbnRDb250YWluZXJOb2RlKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLmluc3RhbmNlID0gaW5zdGFuY2U7XG4gICAgdGhpcy5ob3N0VmlldyA9IHRoaXMuY2hhbmdlRGV0ZWN0b3JSZWYgPSBuZXcgUm9vdFZpZXdSZWY8VD4oX3Jvb3RMVmlldyk7XG4gICAgdGhpcy5jb21wb25lbnRUeXBlID0gY29tcG9uZW50VHlwZTtcbiAgfVxuXG4gIG92ZXJyaWRlIHNldElucHV0KG5hbWU6IHN0cmluZywgdmFsdWU6IHVua25vd24pOiB2b2lkIHtcbiAgICBjb25zdCBpbnB1dERhdGEgPSB0aGlzLl90Tm9kZS5pbnB1dHM7XG4gICAgbGV0IGRhdGFWYWx1ZTogUHJvcGVydHlBbGlhc1ZhbHVlfHVuZGVmaW5lZDtcbiAgICBpZiAoaW5wdXREYXRhICE9PSBudWxsICYmIChkYXRhVmFsdWUgPSBpbnB1dERhdGFbbmFtZV0pKSB7XG4gICAgICBjb25zdCBsVmlldyA9IHRoaXMuX3Jvb3RMVmlldztcbiAgICAgIHNldElucHV0c0ZvclByb3BlcnR5KGxWaWV3W1RWSUVXXSwgbFZpZXcsIGRhdGFWYWx1ZSwgbmFtZSwgdmFsdWUpO1xuICAgICAgbWFya0RpcnR5SWZPblB1c2gobFZpZXcsIHRoaXMuX3ROb2RlLmluZGV4KTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKG5nRGV2TW9kZSkge1xuICAgICAgICBjb25zdCBjbXBOYW1lRm9yRXJyb3IgPSBzdHJpbmdpZnlGb3JFcnJvcih0aGlzLmNvbXBvbmVudFR5cGUpO1xuICAgICAgICBsZXQgbWVzc2FnZSA9XG4gICAgICAgICAgICBgQ2FuJ3Qgc2V0IHZhbHVlIG9mIHRoZSAnJHtuYW1lfScgaW5wdXQgb24gdGhlICcke2NtcE5hbWVGb3JFcnJvcn0nIGNvbXBvbmVudC4gYDtcbiAgICAgICAgbWVzc2FnZSArPSBgTWFrZSBzdXJlIHRoYXQgdGhlICcke1xuICAgICAgICAgICAgbmFtZX0nIHByb3BlcnR5IGlzIGFubm90YXRlZCB3aXRoIEBJbnB1dCgpIG9yIGEgbWFwcGVkIEBJbnB1dCgnJHtuYW1lfScpIGV4aXN0cy5gO1xuICAgICAgICByZXBvcnRVbmtub3duUHJvcGVydHlFcnJvcihtZXNzYWdlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBvdmVycmlkZSBnZXQgaW5qZWN0b3IoKTogSW5qZWN0b3Ige1xuICAgIHJldHVybiBuZXcgTm9kZUluamVjdG9yKHRoaXMuX3ROb2RlLCB0aGlzLl9yb290TFZpZXcpO1xuICB9XG5cbiAgb3ZlcnJpZGUgZGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLmhvc3RWaWV3LmRlc3Ryb3koKTtcbiAgfVxuXG4gIG92ZXJyaWRlIG9uRGVzdHJveShjYWxsYmFjazogKCkgPT4gdm9pZCk6IHZvaWQge1xuICAgIHRoaXMuaG9zdFZpZXcub25EZXN0cm95KGNhbGxiYWNrKTtcbiAgfVxufVxuXG4vKiogUmVwcmVzZW50cyBhIEhvc3RGZWF0dXJlIGZ1bmN0aW9uLiAqL1xudHlwZSBIb3N0RmVhdHVyZSA9ICg8VD4oY29tcG9uZW50OiBULCBjb21wb25lbnREZWY6IENvbXBvbmVudERlZjxUPikgPT4gdm9pZCk7XG5cbi8vIFRPRE86IEEgaGFjayB0byBub3QgcHVsbCBpbiB0aGUgTnVsbEluamVjdG9yIGZyb20gQGFuZ3VsYXIvY29yZS5cbmV4cG9ydCBjb25zdCBOVUxMX0lOSkVDVE9SOiBJbmplY3RvciA9IHtcbiAgZ2V0OiAodG9rZW46IGFueSwgbm90Rm91bmRWYWx1ZT86IGFueSkgPT4ge1xuICAgIHRocm93UHJvdmlkZXJOb3RGb3VuZEVycm9yKHRva2VuLCAnTnVsbEluamVjdG9yJyk7XG4gIH1cbn07XG5cbi8qKiBDcmVhdGVzIGEgVE5vZGUgdGhhdCBjYW4gYmUgdXNlZCB0byBpbnN0YW50aWF0ZSBhIHJvb3QgY29tcG9uZW50LiAqL1xuZnVuY3Rpb24gY3JlYXRlUm9vdENvbXBvbmVudFROb2RlKGxWaWV3OiBMVmlldywgck5vZGU6IFJOb2RlKTogVEVsZW1lbnROb2RlIHtcbiAgY29uc3QgdFZpZXcgPSBsVmlld1tUVklFV107XG4gIGNvbnN0IGluZGV4ID0gSEVBREVSX09GRlNFVDtcbiAgbmdEZXZNb2RlICYmIGFzc2VydEluZGV4SW5SYW5nZShsVmlldywgaW5kZXgpO1xuICBsVmlld1tpbmRleF0gPSByTm9kZTtcblxuICAvLyAnI2hvc3QnIGlzIGFkZGVkIGhlcmUgYXMgd2UgZG9uJ3Qga25vdyB0aGUgcmVhbCBob3N0IERPTSBuYW1lICh3ZSBkb24ndCB3YW50IHRvIHJlYWQgaXQpIGFuZCBhdFxuICAvLyB0aGUgc2FtZSB0aW1lIHdlIHdhbnQgdG8gY29tbXVuaWNhdGUgdGhlIGRlYnVnIGBUTm9kZWAgdGhhdCB0aGlzIGlzIGEgc3BlY2lhbCBgVE5vZGVgXG4gIC8vIHJlcHJlc2VudGluZyBhIGhvc3QgZWxlbWVudC5cbiAgcmV0dXJuIGdldE9yQ3JlYXRlVE5vZGUodFZpZXcsIGluZGV4LCBUTm9kZVR5cGUuRWxlbWVudCwgJyNob3N0JywgbnVsbCk7XG59XG5cbi8qKlxuICogQ3JlYXRlcyB0aGUgcm9vdCBjb21wb25lbnQgdmlldyBhbmQgdGhlIHJvb3QgY29tcG9uZW50IG5vZGUuXG4gKlxuICogQHBhcmFtIHJOb2RlIFJlbmRlciBob3N0IGVsZW1lbnQuXG4gKiBAcGFyYW0gcm9vdENvbXBvbmVudERlZiBDb21wb25lbnREZWZcbiAqIEBwYXJhbSByb290VmlldyBUaGUgcGFyZW50IHZpZXcgd2hlcmUgdGhlIGhvc3Qgbm9kZSBpcyBzdG9yZWRcbiAqIEBwYXJhbSByZW5kZXJlckZhY3RvcnkgRmFjdG9yeSB0byBiZSB1c2VkIGZvciBjcmVhdGluZyBjaGlsZCByZW5kZXJlcnMuXG4gKiBAcGFyYW0gaG9zdFJlbmRlcmVyIFRoZSBjdXJyZW50IHJlbmRlcmVyXG4gKiBAcGFyYW0gc2FuaXRpemVyIFRoZSBzYW5pdGl6ZXIsIGlmIHByb3ZpZGVkXG4gKlxuICogQHJldHVybnMgQ29tcG9uZW50IHZpZXcgY3JlYXRlZFxuICovXG5mdW5jdGlvbiBjcmVhdGVSb290Q29tcG9uZW50VmlldyhcbiAgICB0Tm9kZTogVEVsZW1lbnROb2RlLCByTm9kZTogUkVsZW1lbnR8bnVsbCwgcm9vdENvbXBvbmVudERlZjogQ29tcG9uZW50RGVmPGFueT4sXG4gICAgcm9vdERpcmVjdGl2ZXM6IERpcmVjdGl2ZURlZjxhbnk+W10sIHJvb3RWaWV3OiBMVmlldywgcmVuZGVyZXJGYWN0b3J5OiBSZW5kZXJlckZhY3RvcnksXG4gICAgaG9zdFJlbmRlcmVyOiBSZW5kZXJlciwgc2FuaXRpemVyPzogU2FuaXRpemVyfG51bGwpOiBMVmlldyB7XG4gIGNvbnN0IHRWaWV3ID0gcm9vdFZpZXdbVFZJRVddO1xuICBhcHBseVJvb3RDb21wb25lbnRTdHlsaW5nKHJvb3REaXJlY3RpdmVzLCB0Tm9kZSwgck5vZGUsIGhvc3RSZW5kZXJlcik7XG5cbiAgY29uc3Qgdmlld1JlbmRlcmVyID0gcmVuZGVyZXJGYWN0b3J5LmNyZWF0ZVJlbmRlcmVyKHJOb2RlLCByb290Q29tcG9uZW50RGVmKTtcbiAgY29uc3QgY29tcG9uZW50VmlldyA9IGNyZWF0ZUxWaWV3KFxuICAgICAgcm9vdFZpZXcsIGdldE9yQ3JlYXRlQ29tcG9uZW50VFZpZXcocm9vdENvbXBvbmVudERlZiksIG51bGwsXG4gICAgICByb290Q29tcG9uZW50RGVmLm9uUHVzaCA/IExWaWV3RmxhZ3MuRGlydHkgOiBMVmlld0ZsYWdzLkNoZWNrQWx3YXlzLCByb290Vmlld1t0Tm9kZS5pbmRleF0sXG4gICAgICB0Tm9kZSwgcmVuZGVyZXJGYWN0b3J5LCB2aWV3UmVuZGVyZXIsIHNhbml0aXplciB8fCBudWxsLCBudWxsLCBudWxsKTtcblxuICBpZiAodFZpZXcuZmlyc3RDcmVhdGVQYXNzKSB7XG4gICAgbWFya0FzQ29tcG9uZW50SG9zdCh0VmlldywgdE5vZGUsIHJvb3REaXJlY3RpdmVzLmxlbmd0aCAtIDEpO1xuICB9XG5cbiAgYWRkVG9WaWV3VHJlZShyb290VmlldywgY29tcG9uZW50Vmlldyk7XG5cbiAgLy8gU3RvcmUgY29tcG9uZW50IHZpZXcgYXQgbm9kZSBpbmRleCwgd2l0aCBub2RlIGFzIHRoZSBIT1NUXG4gIHJldHVybiByb290Vmlld1t0Tm9kZS5pbmRleF0gPSBjb21wb25lbnRWaWV3O1xufVxuXG4vKiogU2V0cyB1cCB0aGUgc3R5bGluZyBpbmZvcm1hdGlvbiBvbiBhIHJvb3QgY29tcG9uZW50LiAqL1xuZnVuY3Rpb24gYXBwbHlSb290Q29tcG9uZW50U3R5bGluZyhcbiAgICByb290RGlyZWN0aXZlczogRGlyZWN0aXZlRGVmPGFueT5bXSwgdE5vZGU6IFRFbGVtZW50Tm9kZSwgck5vZGU6IFJFbGVtZW50fG51bGwsXG4gICAgaG9zdFJlbmRlcmVyOiBSZW5kZXJlcik6IHZvaWQge1xuICBmb3IgKGNvbnN0IGRlZiBvZiByb290RGlyZWN0aXZlcykge1xuICAgIHROb2RlLm1lcmdlZEF0dHJzID0gbWVyZ2VIb3N0QXR0cnModE5vZGUubWVyZ2VkQXR0cnMsIGRlZi5ob3N0QXR0cnMpO1xuICB9XG5cbiAgaWYgKHROb2RlLm1lcmdlZEF0dHJzICE9PSBudWxsKSB7XG4gICAgY29tcHV0ZVN0YXRpY1N0eWxpbmcodE5vZGUsIHROb2RlLm1lcmdlZEF0dHJzLCB0cnVlKTtcblxuICAgIGlmIChyTm9kZSAhPT0gbnVsbCkge1xuICAgICAgc2V0dXBTdGF0aWNBdHRyaWJ1dGVzKGhvc3RSZW5kZXJlciwgck5vZGUsIHROb2RlKTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgcm9vdCBjb21wb25lbnQgYW5kIHNldHMgaXQgdXAgd2l0aCBmZWF0dXJlcyBhbmQgaG9zdCBiaW5kaW5ncy5TaGFyZWQgYnlcbiAqIHJlbmRlckNvbXBvbmVudCgpIGFuZCBWaWV3Q29udGFpbmVyUmVmLmNyZWF0ZUNvbXBvbmVudCgpLlxuICovXG5mdW5jdGlvbiBjcmVhdGVSb290Q29tcG9uZW50PFQ+KFxuICAgIGNvbXBvbmVudFZpZXc6IExWaWV3LCByb290Q29tcG9uZW50RGVmOiBDb21wb25lbnREZWY8VD4sIHJvb3REaXJlY3RpdmVzOiBEaXJlY3RpdmVEZWY8YW55PltdLFxuICAgIGhvc3REaXJlY3RpdmVEZWZzOiBIb3N0RGlyZWN0aXZlRGVmc3xudWxsLCByb290TFZpZXc6IExWaWV3LFxuICAgIGhvc3RGZWF0dXJlczogSG9zdEZlYXR1cmVbXXxudWxsKTogYW55IHtcbiAgY29uc3Qgcm9vdFROb2RlID0gZ2V0Q3VycmVudFROb2RlKCkgYXMgVEVsZW1lbnROb2RlO1xuICBuZ0Rldk1vZGUgJiYgYXNzZXJ0RGVmaW5lZChyb290VE5vZGUsICd0Tm9kZSBzaG91bGQgaGF2ZSBiZWVuIGFscmVhZHkgY3JlYXRlZCcpO1xuICBjb25zdCB0VmlldyA9IHJvb3RMVmlld1tUVklFV107XG4gIGNvbnN0IG5hdGl2ZSA9IGdldE5hdGl2ZUJ5VE5vZGUocm9vdFROb2RlLCByb290TFZpZXcpO1xuXG4gIGluaXRpYWxpemVEaXJlY3RpdmVzKHRWaWV3LCByb290TFZpZXcsIHJvb3RUTm9kZSwgcm9vdERpcmVjdGl2ZXMsIG51bGwsIGhvc3REaXJlY3RpdmVEZWZzKTtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IHJvb3REaXJlY3RpdmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgZGlyZWN0aXZlSW5kZXggPSByb290VE5vZGUuZGlyZWN0aXZlU3RhcnQgKyBpO1xuICAgIGNvbnN0IGRpcmVjdGl2ZUluc3RhbmNlID0gZ2V0Tm9kZUluamVjdGFibGUocm9vdExWaWV3LCB0VmlldywgZGlyZWN0aXZlSW5kZXgsIHJvb3RUTm9kZSk7XG4gICAgYXR0YWNoUGF0Y2hEYXRhKGRpcmVjdGl2ZUluc3RhbmNlLCByb290TFZpZXcpO1xuICB9XG5cbiAgaW52b2tlRGlyZWN0aXZlc0hvc3RCaW5kaW5ncyh0Vmlldywgcm9vdExWaWV3LCByb290VE5vZGUpO1xuXG4gIGlmIChuYXRpdmUpIHtcbiAgICBhdHRhY2hQYXRjaERhdGEobmF0aXZlLCByb290TFZpZXcpO1xuICB9XG5cbiAgLy8gV2UncmUgZ3VhcmFudGVlZCBmb3IgdGhlIGBjb21wb25lbnRPZmZzZXRgIHRvIGJlIHBvc2l0aXZlIGhlcmVcbiAgLy8gc2luY2UgYSByb290IGNvbXBvbmVudCBhbHdheXMgbWF0Y2hlcyBhIGNvbXBvbmVudCBkZWYuXG4gIG5nRGV2TW9kZSAmJlxuICAgICAgYXNzZXJ0R3JlYXRlclRoYW4ocm9vdFROb2RlLmNvbXBvbmVudE9mZnNldCwgLTEsICdjb21wb25lbnRPZmZzZXQgbXVzdCBiZSBncmVhdCB0aGFuIC0xJyk7XG4gIGNvbnN0IGNvbXBvbmVudCA9IGdldE5vZGVJbmplY3RhYmxlKFxuICAgICAgcm9vdExWaWV3LCB0Vmlldywgcm9vdFROb2RlLmRpcmVjdGl2ZVN0YXJ0ICsgcm9vdFROb2RlLmNvbXBvbmVudE9mZnNldCwgcm9vdFROb2RlKTtcbiAgY29tcG9uZW50Vmlld1tDT05URVhUXSA9IHJvb3RMVmlld1tDT05URVhUXSA9IGNvbXBvbmVudDtcblxuICBpZiAoaG9zdEZlYXR1cmVzICE9PSBudWxsKSB7XG4gICAgZm9yIChjb25zdCBmZWF0dXJlIG9mIGhvc3RGZWF0dXJlcykge1xuICAgICAgZmVhdHVyZShjb21wb25lbnQsIHJvb3RDb21wb25lbnREZWYpO1xuICAgIH1cbiAgfVxuXG4gIC8vIFdlIHdhbnQgdG8gZ2VuZXJhdGUgYW4gZW1wdHkgUXVlcnlMaXN0IGZvciByb290IGNvbnRlbnQgcXVlcmllcyBmb3IgYmFja3dhcmRzXG4gIC8vIGNvbXBhdGliaWxpdHkgd2l0aCBWaWV3RW5naW5lLlxuICBleGVjdXRlQ29udGVudFF1ZXJpZXModFZpZXcsIHJvb3RUTm9kZSwgY29tcG9uZW50Vmlldyk7XG5cbiAgcmV0dXJuIGNvbXBvbmVudDtcbn1cblxuLyoqIFNldHMgdGhlIHN0YXRpYyBhdHRyaWJ1dGVzIG9uIGEgcm9vdCBjb21wb25lbnQuICovXG5mdW5jdGlvbiBzZXRSb290Tm9kZUF0dHJpYnV0ZXMoXG4gICAgaG9zdFJlbmRlcmVyOiBSZW5kZXJlcjIsIGNvbXBvbmVudERlZjogQ29tcG9uZW50RGVmPHVua25vd24+LCBob3N0Uk5vZGU6IFJFbGVtZW50LFxuICAgIHJvb3RTZWxlY3Rvck9yTm9kZTogYW55KSB7XG4gIGlmIChyb290U2VsZWN0b3JPck5vZGUpIHtcbiAgICBzZXRVcEF0dHJpYnV0ZXMoaG9zdFJlbmRlcmVyLCBob3N0Uk5vZGUsIFsnbmctdmVyc2lvbicsIFZFUlNJT04uZnVsbF0pO1xuICB9IGVsc2Uge1xuICAgIC8vIElmIGhvc3QgZWxlbWVudCBpcyBjcmVhdGVkIGFzIGEgcGFydCBvZiB0aGlzIGZ1bmN0aW9uIGNhbGwgKGkuZS4gYHJvb3RTZWxlY3Rvck9yTm9kZWBcbiAgICAvLyBpcyBub3QgZGVmaW5lZCksIGFsc28gYXBwbHkgYXR0cmlidXRlcyBhbmQgY2xhc3NlcyBleHRyYWN0ZWQgZnJvbSBjb21wb25lbnQgc2VsZWN0b3IuXG4gICAgLy8gRXh0cmFjdCBhdHRyaWJ1dGVzIGFuZCBjbGFzc2VzIGZyb20gdGhlIGZpcnN0IHNlbGVjdG9yIG9ubHkgdG8gbWF0Y2ggVkUgYmVoYXZpb3IuXG4gICAgY29uc3Qge2F0dHJzLCBjbGFzc2VzfSA9IGV4dHJhY3RBdHRyc0FuZENsYXNzZXNGcm9tU2VsZWN0b3IoY29tcG9uZW50RGVmLnNlbGVjdG9yc1swXSk7XG4gICAgaWYgKGF0dHJzKSB7XG4gICAgICBzZXRVcEF0dHJpYnV0ZXMoaG9zdFJlbmRlcmVyLCBob3N0Uk5vZGUsIGF0dHJzKTtcbiAgICB9XG4gICAgaWYgKGNsYXNzZXMgJiYgY2xhc3Nlcy5sZW5ndGggPiAwKSB7XG4gICAgICB3cml0ZURpcmVjdENsYXNzKGhvc3RSZW5kZXJlciwgaG9zdFJOb2RlLCBjbGFzc2VzLmpvaW4oJyAnKSk7XG4gICAgfVxuICB9XG59XG5cbi8qKiBQcm9qZWN0cyB0aGUgYHByb2plY3RhYmxlTm9kZXNgIHRoYXQgd2VyZSBzcGVjaWZpZWQgd2hlbiBjcmVhdGluZyBhIHJvb3QgY29tcG9uZW50LiAqL1xuZnVuY3Rpb24gcHJvamVjdE5vZGVzKFxuICAgIHROb2RlOiBURWxlbWVudE5vZGUsIG5nQ29udGVudFNlbGVjdG9yczogc3RyaW5nW10sIHByb2plY3RhYmxlTm9kZXM6IGFueVtdW10pIHtcbiAgY29uc3QgcHJvamVjdGlvbjogKFROb2RlfFJOb2RlW118bnVsbClbXSA9IHROb2RlLnByb2plY3Rpb24gPSBbXTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBuZ0NvbnRlbnRTZWxlY3RvcnMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBub2Rlc2ZvclNsb3QgPSBwcm9qZWN0YWJsZU5vZGVzW2ldO1xuICAgIC8vIFByb2plY3RhYmxlIG5vZGVzIGNhbiBiZSBwYXNzZWQgYXMgYXJyYXkgb2YgYXJyYXlzIG9yIGFuIGFycmF5IG9mIGl0ZXJhYmxlcyAobmdVcGdyYWRlXG4gICAgLy8gY2FzZSkuIEhlcmUgd2UgZG8gbm9ybWFsaXplIHBhc3NlZCBkYXRhIHN0cnVjdHVyZSB0byBiZSBhbiBhcnJheSBvZiBhcnJheXMgdG8gYXZvaWRcbiAgICAvLyBjb21wbGV4IGNoZWNrcyBkb3duIHRoZSBsaW5lLlxuICAgIC8vIFdlIGFsc28gbm9ybWFsaXplIHRoZSBsZW5ndGggb2YgdGhlIHBhc3NlZCBpbiBwcm9qZWN0YWJsZSBub2RlcyAodG8gbWF0Y2ggdGhlIG51bWJlciBvZlxuICAgIC8vIDxuZy1jb250YWluZXI+IHNsb3RzIGRlZmluZWQgYnkgYSBjb21wb25lbnQpLlxuICAgIHByb2plY3Rpb24ucHVzaChub2Rlc2ZvclNsb3QgIT0gbnVsbCA/IEFycmF5LmZyb20obm9kZXNmb3JTbG90KSA6IG51bGwpO1xuICB9XG59XG5cbi8qKlxuICogVXNlZCB0byBlbmFibGUgbGlmZWN5Y2xlIGhvb2tzIG9uIHRoZSByb290IGNvbXBvbmVudC5cbiAqXG4gKiBJbmNsdWRlIHRoaXMgZmVhdHVyZSB3aGVuIGNhbGxpbmcgYHJlbmRlckNvbXBvbmVudGAgaWYgdGhlIHJvb3QgY29tcG9uZW50XG4gKiB5b3UgYXJlIHJlbmRlcmluZyBoYXMgbGlmZWN5Y2xlIGhvb2tzIGRlZmluZWQuIE90aGVyd2lzZSwgdGhlIGhvb2tzIHdvbid0XG4gKiBiZSBjYWxsZWQgcHJvcGVybHkuXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiBgYGBcbiAqIHJlbmRlckNvbXBvbmVudChBcHBDb21wb25lbnQsIHtob3N0RmVhdHVyZXM6IFtMaWZlY3ljbGVIb29rc0ZlYXR1cmVdfSk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIExpZmVjeWNsZUhvb2tzRmVhdHVyZSgpOiB2b2lkIHtcbiAgY29uc3QgdE5vZGUgPSBnZXRDdXJyZW50VE5vZGUoKSE7XG4gIG5nRGV2TW9kZSAmJiBhc3NlcnREZWZpbmVkKHROb2RlLCAnVE5vZGUgaXMgcmVxdWlyZWQnKTtcbiAgcmVnaXN0ZXJQb3N0T3JkZXJIb29rcyhnZXRMVmlldygpW1RWSUVXXSwgdE5vZGUpO1xufVxuIl19