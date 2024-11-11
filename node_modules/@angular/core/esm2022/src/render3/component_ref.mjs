/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { setActiveConsumer } from '@angular/core/primitives/signals';
import { ChangeDetectionScheduler, } from '../change_detection/scheduling/zoneless_scheduling';
import { EnvironmentInjector } from '../di/r3_injector';
import { RuntimeError } from '../errors';
import { retrieveHydrationInfo } from '../hydration/utils';
import { ComponentFactory as AbstractComponentFactory, ComponentRef as AbstractComponentRef, } from '../linker/component_factory';
import { ComponentFactoryResolver as AbstractComponentFactoryResolver } from '../linker/component_factory_resolver';
import { createElementRef } from '../linker/element_ref';
import { RendererFactory2 } from '../render/api';
import { Sanitizer } from '../sanitization/sanitizer';
import { assertDefined, assertGreaterThan, assertIndexInRange } from '../util/assert';
import { assertComponentType, assertNoDuplicateDirectives } from './assert';
import { attachPatchData } from './context_discovery';
import { getComponentDef } from './definition';
import { depsTracker } from './deps_tracker/deps_tracker';
import { getNodeInjectable, NodeInjector } from './di';
import { registerPostOrderHooks } from './hooks';
import { reportUnknownPropertyError } from './instructions/element_validation';
import { markViewDirty } from './instructions/mark_view_dirty';
import { renderView } from './instructions/render';
import { addToViewTree, createLView, createTView, executeContentQueries, getOrCreateComponentTView, getOrCreateTNode, initializeDirectives, invokeDirectivesHostBindings, locateHostElement, markAsComponentHost, setInputsForProperty, } from './instructions/shared';
import { InputFlags } from './interfaces/input_flags';
import { CONTEXT, HEADER_OFFSET, INJECTOR, TVIEW, } from './interfaces/view';
import { MATH_ML_NAMESPACE, SVG_NAMESPACE } from './namespaces';
import { createElementNode, setupStaticAttributes, writeDirectClass } from './node_manipulation';
import { extractAttrsAndClassesFromSelector, stringifyCSSSelectorList, } from './node_selector_matcher';
import { enterView, getCurrentTNode, getLView, leaveView } from './state';
import { computeStaticStyling } from './styling/static_styling';
import { mergeHostAttrs, setUpAttributes } from './util/attrs_utils';
import { debugStringifyTypeForError, stringifyForError } from './util/stringify_utils';
import { getComponentLViewByIndex, getNativeByTNode, getTNode } from './util/view_utils';
import { ViewRef } from './view_ref';
import { ChainedInjector } from './chained_injector';
import { unregisterLView } from './interfaces/lview_tracking';
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
function toRefArray(map, isInputMap) {
    const array = [];
    for (const publicName in map) {
        if (!map.hasOwnProperty(publicName)) {
            continue;
        }
        const value = map[publicName];
        if (value === undefined) {
            continue;
        }
        const isArray = Array.isArray(value);
        const propName = isArray ? value[0] : value;
        const flags = isArray ? value[1] : InputFlags.None;
        if (isInputMap) {
            array.push({
                propName: propName,
                templateName: publicName,
                isSignal: (flags & InputFlags.SignalBased) !== 0,
            });
        }
        else {
            array.push({
                propName: propName,
                templateName: publicName,
            });
        }
    }
    return array;
}
function getNamespace(elementName) {
    const name = elementName.toLowerCase();
    return name === 'svg' ? SVG_NAMESPACE : name === 'math' ? MATH_ML_NAMESPACE : null;
}
/**
 * ComponentFactory interface implementation.
 */
export class ComponentFactory extends AbstractComponentFactory {
    get inputs() {
        const componentDef = this.componentDef;
        const inputTransforms = componentDef.inputTransforms;
        const refArray = toRefArray(componentDef.inputs, true);
        if (inputTransforms !== null) {
            for (const input of refArray) {
                if (inputTransforms.hasOwnProperty(input.propName)) {
                    input.transform = inputTransforms[input.propName];
                }
            }
        }
        return refArray;
    }
    get outputs() {
        return toRefArray(this.componentDef.outputs, false);
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
        this.ngContentSelectors = componentDef.ngContentSelectors
            ? componentDef.ngContentSelectors
            : [];
        this.isBoundToModule = !!ngModule;
    }
    create(injector, projectableNodes, rootSelectorOrNode, environmentInjector) {
        const prevConsumer = setActiveConsumer(null);
        try {
            // Check if the component is orphan
            if (ngDevMode &&
                (typeof ngJitMode === 'undefined' || ngJitMode) &&
                this.componentDef.debugInfo?.forbidOrphanRendering) {
                if (depsTracker.isOrphanComponent(this.componentType)) {
                    throw new RuntimeError(1001 /* RuntimeErrorCode.RUNTIME_DEPS_ORPHAN_COMPONENT */, `Orphan component found! Trying to render the component ${debugStringifyTypeForError(this.componentType)} without first loading the NgModule that declares it. It is recommended to make this component standalone in order to avoid this error. If this is not possible now, import the component's NgModule in the appropriate NgModule, or the standalone component in which you are trying to render this component. If this is a lazy import, load the NgModule lazily as well and use its module injector.`);
                }
            }
            environmentInjector = environmentInjector || this.ngModule;
            let realEnvironmentInjector = environmentInjector instanceof EnvironmentInjector
                ? environmentInjector
                : environmentInjector?.injector;
            if (realEnvironmentInjector && this.componentDef.getStandaloneInjector !== null) {
                realEnvironmentInjector =
                    this.componentDef.getStandaloneInjector(realEnvironmentInjector) ||
                        realEnvironmentInjector;
            }
            const rootViewInjector = realEnvironmentInjector
                ? new ChainedInjector(injector, realEnvironmentInjector)
                : injector;
            const rendererFactory = rootViewInjector.get(RendererFactory2, null);
            if (rendererFactory === null) {
                throw new RuntimeError(407 /* RuntimeErrorCode.RENDERER_NOT_FOUND */, ngDevMode &&
                    'Angular was not able to inject a renderer (RendererFactory2). ' +
                        'Likely this is due to a broken DI hierarchy. ' +
                        'Make sure that any injector used to create this component has a correct parent.');
            }
            const sanitizer = rootViewInjector.get(Sanitizer, null);
            const changeDetectionScheduler = rootViewInjector.get(ChangeDetectionScheduler, null);
            const environment = {
                rendererFactory,
                sanitizer,
                // We don't use inline effects (yet).
                inlineEffectRunner: null,
                changeDetectionScheduler,
            };
            const hostRenderer = rendererFactory.createRenderer(null, this.componentDef);
            // Determine a tag name used for creating host elements when this component is created
            // dynamically. Default to 'div' if this component did not specify any tag name in its
            // selector.
            const elementName = this.componentDef.selectors[0][0] || 'div';
            const hostRNode = rootSelectorOrNode
                ? locateHostElement(hostRenderer, rootSelectorOrNode, this.componentDef.encapsulation, rootViewInjector)
                : createElementNode(hostRenderer, elementName, getNamespace(elementName));
            let rootFlags = 512 /* LViewFlags.IsRoot */;
            if (this.componentDef.signals) {
                rootFlags |= 4096 /* LViewFlags.SignalView */;
            }
            else if (!this.componentDef.onPush) {
                rootFlags |= 16 /* LViewFlags.CheckAlways */;
            }
            let hydrationInfo = null;
            if (hostRNode !== null) {
                hydrationInfo = retrieveHydrationInfo(hostRNode, rootViewInjector, true /* isRootView */);
            }
            // Create the root view. Uses empty TView and ContentTemplate.
            const rootTView = createTView(0 /* TViewType.Root */, null, null, 1, 0, null, null, null, null, null, null);
            const rootLView = createLView(null, rootTView, null, rootFlags, null, null, environment, hostRenderer, rootViewInjector, null, hydrationInfo);
            // rootView is the parent when bootstrapping
            // TODO(misko): it looks like we are entering view here but we don't really need to as
            // `renderView` does that. However as the code is written it is needed because
            // `createRootComponentView` and `createRootComponent` both read global state. Fixing those
            // issues would allow us to drop this.
            enterView(rootLView);
            let component;
            let tElementNode;
            let componentView = null;
            try {
                const rootComponentDef = this.componentDef;
                let rootDirectives;
                let hostDirectiveDefs = null;
                if (rootComponentDef.findHostDirectiveDefs) {
                    rootDirectives = [];
                    hostDirectiveDefs = new Map();
                    rootComponentDef.findHostDirectiveDefs(rootComponentDef, rootDirectives, hostDirectiveDefs);
                    rootDirectives.push(rootComponentDef);
                    ngDevMode && assertNoDuplicateDirectives(rootDirectives);
                }
                else {
                    rootDirectives = [rootComponentDef];
                }
                const hostTNode = createRootComponentTNode(rootLView, hostRNode);
                componentView = createRootComponentView(hostTNode, hostRNode, rootComponentDef, rootDirectives, rootLView, environment, hostRenderer);
                tElementNode = getTNode(rootTView, HEADER_OFFSET);
                // TODO(crisbeto): in practice `hostRNode` should always be defined, but there are some
                // tests where the renderer is mocked out and `undefined` is returned. We should update the
                // tests so that this check can be removed.
                if (hostRNode) {
                    setRootNodeAttributes(hostRenderer, rootComponentDef, hostRNode, rootSelectorOrNode);
                }
                if (projectableNodes !== undefined) {
                    projectNodes(tElementNode, this.ngContentSelectors, projectableNodes);
                }
                // TODO: should LifecycleHooksFeature and other host features be generated by the compiler
                // and executed here? Angular 5 reference: https://stackblitz.com/edit/lifecycle-hooks-vcref
                component = createRootComponent(componentView, rootComponentDef, rootDirectives, hostDirectiveDefs, rootLView, [LifecycleHooksFeature]);
                renderView(rootTView, rootLView, null);
            }
            catch (e) {
                // Stop tracking the views if creation failed since
                // the consumer won't have a way to dereference them.
                if (componentView !== null) {
                    unregisterLView(componentView);
                }
                unregisterLView(rootLView);
                throw e;
            }
            finally {
                leaveView();
            }
            return new ComponentRef(this.componentType, component, createElementRef(tElementNode, rootLView), rootLView, tElementNode);
        }
        finally {
            setActiveConsumer(prevConsumer);
        }
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
        this.previousInputValues = null;
        this.instance = instance;
        this.hostView = this.changeDetectorRef = new ViewRef(_rootLView, undefined /* _cdRefInjectingView */, false /* notifyErrorHandler */);
        this.componentType = componentType;
    }
    setInput(name, value) {
        const inputData = this._tNode.inputs;
        let dataValue;
        if (inputData !== null && (dataValue = inputData[name])) {
            this.previousInputValues ??= new Map();
            // Do not set the input if it is the same as the last value
            // This behavior matches `bindingUpdated` when binding inputs in templates.
            if (this.previousInputValues.has(name) &&
                Object.is(this.previousInputValues.get(name), value)) {
                return;
            }
            const lView = this._rootLView;
            setInputsForProperty(lView[TVIEW], lView, dataValue, name, value);
            this.previousInputValues.set(name, value);
            const childComponentLView = getComponentLViewByIndex(this._tNode.index, lView);
            markViewDirty(childComponentLView, 1 /* NotificationSource.SetInput */);
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
 * @param hostRNode Render host element.
 * @param rootComponentDef ComponentDef
 * @param rootView The parent view where the host node is stored
 * @param rendererFactory Factory to be used for creating child renderers.
 * @param hostRenderer The current renderer
 * @param sanitizer The sanitizer, if provided
 *
 * @returns Component view created
 */
function createRootComponentView(tNode, hostRNode, rootComponentDef, rootDirectives, rootView, environment, hostRenderer) {
    const tView = rootView[TVIEW];
    applyRootComponentStyling(rootDirectives, tNode, hostRNode, hostRenderer);
    // Hydration info is on the host element and needs to be retrieved
    // and passed to the component LView.
    let hydrationInfo = null;
    if (hostRNode !== null) {
        hydrationInfo = retrieveHydrationInfo(hostRNode, rootView[INJECTOR]);
    }
    const viewRenderer = environment.rendererFactory.createRenderer(hostRNode, rootComponentDef);
    let lViewFlags = 16 /* LViewFlags.CheckAlways */;
    if (rootComponentDef.signals) {
        lViewFlags = 4096 /* LViewFlags.SignalView */;
    }
    else if (rootComponentDef.onPush) {
        lViewFlags = 64 /* LViewFlags.Dirty */;
    }
    const componentView = createLView(rootView, getOrCreateComponentTView(rootComponentDef), null, lViewFlags, rootView[tNode.index], tNode, environment, viewRenderer, null, null, hydrationInfo);
    if (tView.firstCreatePass) {
        markAsComponentHost(tView, tNode, rootDirectives.length - 1);
    }
    addToViewTree(rootView, componentView);
    // Store component view at node index, with node as the HOST
    return (rootView[tNode.index] = componentView);
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
    executeContentQueries(tView, rootTNode, rootLView);
    return component;
}
/** Sets the static attributes on a root component. */
function setRootNodeAttributes(hostRenderer, componentDef, hostRNode, rootSelectorOrNode) {
    if (rootSelectorOrNode) {
        // The placeholder will be replaced with the actual version at build time.
        setUpAttributes(hostRenderer, hostRNode, ['ng-version', '18.2.7']);
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
    const projection = (tNode.projection = []);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9uZW50X3JlZi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc3JjL3JlbmRlcjMvY29tcG9uZW50X3JlZi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSxrQ0FBa0MsQ0FBQztBQUduRSxPQUFPLEVBQ0wsd0JBQXdCLEdBRXpCLE1BQU0sb0RBQW9ELENBQUM7QUFFNUQsT0FBTyxFQUFDLG1CQUFtQixFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDdEQsT0FBTyxFQUFDLFlBQVksRUFBbUIsTUFBTSxXQUFXLENBQUM7QUFFekQsT0FBTyxFQUFDLHFCQUFxQixFQUFDLE1BQU0sb0JBQW9CLENBQUM7QUFFekQsT0FBTyxFQUNMLGdCQUFnQixJQUFJLHdCQUF3QixFQUM1QyxZQUFZLElBQUksb0JBQW9CLEdBQ3JDLE1BQU0sNkJBQTZCLENBQUM7QUFDckMsT0FBTyxFQUFDLHdCQUF3QixJQUFJLGdDQUFnQyxFQUFDLE1BQU0sc0NBQXNDLENBQUM7QUFDbEgsT0FBTyxFQUFDLGdCQUFnQixFQUFhLE1BQU0sdUJBQXVCLENBQUM7QUFFbkUsT0FBTyxFQUFZLGdCQUFnQixFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQzFELE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSwyQkFBMkIsQ0FBQztBQUNwRCxPQUFPLEVBQUMsYUFBYSxFQUFFLGlCQUFpQixFQUFFLGtCQUFrQixFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFHcEYsT0FBTyxFQUFDLG1CQUFtQixFQUFFLDJCQUEyQixFQUFDLE1BQU0sVUFBVSxDQUFDO0FBQzFFLE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUNwRCxPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0sY0FBYyxDQUFDO0FBQzdDLE9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSw2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QUFFRDs7Ozs7Ozs7Ozs7O0dBWUc7QUFDSCxNQUFNLFVBQVUscUJBQXFCO0lBQ25DLE1BQU0sS0FBSyxHQUFHLGVBQWUsRUFBRyxDQUFDO0lBQ2pDLFNBQVMsSUFBSSxhQUFhLENBQUMsS0FBSyxFQUFFLG1CQUFtQixDQUFDLENBQUM7SUFDdkQsc0JBQXNCLENBQUMsUUFBUSxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDbkQsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtzZXRBY3RpdmVDb25zdW1lcn0gZnJvbSAnQGFuZ3VsYXIvY29yZS9wcmltaXRpdmVzL3NpZ25hbHMnO1xuXG5pbXBvcnQge0NoYW5nZURldGVjdG9yUmVmfSBmcm9tICcuLi9jaGFuZ2VfZGV0ZWN0aW9uL2NoYW5nZV9kZXRlY3Rvcl9yZWYnO1xuaW1wb3J0IHtcbiAgQ2hhbmdlRGV0ZWN0aW9uU2NoZWR1bGVyLFxuICBOb3RpZmljYXRpb25Tb3VyY2UsXG59IGZyb20gJy4uL2NoYW5nZV9kZXRlY3Rpb24vc2NoZWR1bGluZy96b25lbGVzc19zY2hlZHVsaW5nJztcbmltcG9ydCB7SW5qZWN0b3J9IGZyb20gJy4uL2RpL2luamVjdG9yJztcbmltcG9ydCB7RW52aXJvbm1lbnRJbmplY3Rvcn0gZnJvbSAnLi4vZGkvcjNfaW5qZWN0b3InO1xuaW1wb3J0IHtSdW50aW1lRXJyb3IsIFJ1bnRpbWVFcnJvckNvZGV9IGZyb20gJy4uL2Vycm9ycyc7XG5pbXBvcnQge0RlaHlkcmF0ZWRWaWV3fSBmcm9tICcuLi9oeWRyYXRpb24vaW50ZXJmYWNlcyc7XG5pbXBvcnQge3JldHJpZXZlSHlkcmF0aW9uSW5mb30gZnJvbSAnLi4vaHlkcmF0aW9uL3V0aWxzJztcbmltcG9ydCB7VHlwZX0gZnJvbSAnLi4vaW50ZXJmYWNlL3R5cGUnO1xuaW1wb3J0IHtcbiAgQ29tcG9uZW50RmFjdG9yeSBhcyBBYnN0cmFjdENvbXBvbmVudEZhY3RvcnksXG4gIENvbXBvbmVudFJlZiBhcyBBYnN0cmFjdENvbXBvbmVudFJlZixcbn0gZnJvbSAnLi4vbGlua2VyL2NvbXBvbmVudF9mYWN0b3J5JztcbmltcG9ydCB7Q29tcG9uZW50RmFjdG9yeVJlc29sdmVyIGFzIEFic3RyYWN0Q29tcG9uZW50RmFjdG9yeVJlc29sdmVyfSBmcm9tICcuLi9saW5rZXIvY29tcG9uZW50X2ZhY3RvcnlfcmVzb2x2ZXInO1xuaW1wb3J0IHtjcmVhdGVFbGVtZW50UmVmLCBFbGVtZW50UmVmfSBmcm9tICcuLi9saW5rZXIvZWxlbWVudF9yZWYnO1xuaW1wb3J0IHtOZ01vZHVsZVJlZn0gZnJvbSAnLi4vbGlua2VyL25nX21vZHVsZV9mYWN0b3J5JztcbmltcG9ydCB7UmVuZGVyZXIyLCBSZW5kZXJlckZhY3RvcnkyfSBmcm9tICcuLi9yZW5kZXIvYXBpJztcbmltcG9ydCB7U2FuaXRpemVyfSBmcm9tICcuLi9zYW5pdGl6YXRpb24vc2FuaXRpemVyJztcbmltcG9ydCB7YXNzZXJ0RGVmaW5lZCwgYXNzZXJ0R3JlYXRlclRoYW4sIGFzc2VydEluZGV4SW5SYW5nZX0gZnJvbSAnLi4vdXRpbC9hc3NlcnQnO1xuXG5pbXBvcnQge0FmdGVyUmVuZGVyTWFuYWdlcn0gZnJvbSAnLi9hZnRlcl9yZW5kZXIvbWFuYWdlcic7XG5pbXBvcnQge2Fzc2VydENvbXBvbmVudFR5cGUsIGFzc2VydE5vRHVwbGljYXRlRGlyZWN0aXZlc30gZnJvbSAnLi9hc3NlcnQnO1xuaW1wb3J0IHthdHRhY2hQYXRjaERhdGF9IGZyb20gJy4vY29udGV4dF9kaXNjb3ZlcnknO1xuaW1wb3J0IHtnZXRDb21wb25lbnREZWZ9IGZyb20gJy4vZGVmaW5pdGlvbic7XG5pbXBvcnQge2RlcHNUcmFja2VyfSBmcm9tICcuL2RlcHNfdHJhY2tlci9kZXBzX3RyYWNrZXInO1xuaW1wb3J0IHtnZXROb2RlSW5qZWN0YWJsZSwgTm9kZUluamVjdG9yfSBmcm9tICcuL2RpJztcbmltcG9ydCB7cmVnaXN0ZXJQb3N0T3JkZXJIb29rc30gZnJvbSAnLi9ob29rcyc7XG5pbXBvcnQge3JlcG9ydFVua25vd25Qcm9wZXJ0eUVycm9yfSBmcm9tICcuL2luc3RydWN0aW9ucy9lbGVtZW50X3ZhbGlkYXRpb24nO1xuaW1wb3J0IHttYXJrVmlld0RpcnR5fSBmcm9tICcuL2luc3RydWN0aW9ucy9tYXJrX3ZpZXdfZGlydHknO1xuaW1wb3J0IHtyZW5kZXJWaWV3fSBmcm9tICcuL2luc3RydWN0aW9ucy9yZW5kZXInO1xuaW1wb3J0IHtcbiAgYWRkVG9WaWV3VHJlZSxcbiAgY3JlYXRlTFZpZXcsXG4gIGNyZWF0ZVRWaWV3LFxuICBleGVjdXRlQ29udGVudFF1ZXJpZXMsXG4gIGdldE9yQ3JlYXRlQ29tcG9uZW50VFZpZXcsXG4gIGdldE9yQ3JlYXRlVE5vZGUsXG4gIGluaXRpYWxpemVEaXJlY3RpdmVzLFxuICBpbnZva2VEaXJlY3RpdmVzSG9zdEJpbmRpbmdzLFxuICBsb2NhdGVIb3N0RWxlbWVudCxcbiAgbWFya0FzQ29tcG9uZW50SG9zdCxcbiAgc2V0SW5wdXRzRm9yUHJvcGVydHksXG59IGZyb20gJy4vaW5zdHJ1Y3Rpb25zL3NoYXJlZCc7XG5pbXBvcnQge0NvbXBvbmVudERlZiwgRGlyZWN0aXZlRGVmLCBIb3N0RGlyZWN0aXZlRGVmc30gZnJvbSAnLi9pbnRlcmZhY2VzL2RlZmluaXRpb24nO1xuaW1wb3J0IHtJbnB1dEZsYWdzfSBmcm9tICcuL2ludGVyZmFjZXMvaW5wdXRfZmxhZ3MnO1xuaW1wb3J0IHtcbiAgTm9kZUlucHV0QmluZGluZ3MsXG4gIFRDb250YWluZXJOb2RlLFxuICBURWxlbWVudENvbnRhaW5lck5vZGUsXG4gIFRFbGVtZW50Tm9kZSxcbiAgVE5vZGUsXG4gIFROb2RlVHlwZSxcbn0gZnJvbSAnLi9pbnRlcmZhY2VzL25vZGUnO1xuaW1wb3J0IHtSZW5kZXJlcn0gZnJvbSAnLi9pbnRlcmZhY2VzL3JlbmRlcmVyJztcbmltcG9ydCB7UkVsZW1lbnQsIFJOb2RlfSBmcm9tICcuL2ludGVyZmFjZXMvcmVuZGVyZXJfZG9tJztcbmltcG9ydCB7XG4gIENPTlRFWFQsXG4gIEhFQURFUl9PRkZTRVQsXG4gIElOSkVDVE9SLFxuICBMVmlldyxcbiAgTFZpZXdFbnZpcm9ubWVudCxcbiAgTFZpZXdGbGFncyxcbiAgVFZJRVcsXG4gIFRWaWV3VHlwZSxcbn0gZnJvbSAnLi9pbnRlcmZhY2VzL3ZpZXcnO1xuaW1wb3J0IHtNQVRIX01MX05BTUVTUEFDRSwgU1ZHX05BTUVTUEFDRX0gZnJvbSAnLi9uYW1lc3BhY2VzJztcbmltcG9ydCB7Y3JlYXRlRWxlbWVudE5vZGUsIHNldHVwU3RhdGljQXR0cmlidXRlcywgd3JpdGVEaXJlY3RDbGFzc30gZnJvbSAnLi9ub2RlX21hbmlwdWxhdGlvbic7XG5pbXBvcnQge1xuICBleHRyYWN0QXR0cnNBbmRDbGFzc2VzRnJvbVNlbGVjdG9yLFxuICBzdHJpbmdpZnlDU1NTZWxlY3Rvckxpc3QsXG59IGZyb20gJy4vbm9kZV9zZWxlY3Rvcl9tYXRjaGVyJztcbmltcG9ydCB7ZW50ZXJWaWV3LCBnZXRDdXJyZW50VE5vZGUsIGdldExWaWV3LCBsZWF2ZVZpZXd9IGZyb20gJy4vc3RhdGUnO1xuaW1wb3J0IHtjb21wdXRlU3RhdGljU3R5bGluZ30gZnJvbSAnLi9zdHlsaW5nL3N0YXRpY19zdHlsaW5nJztcbmltcG9ydCB7bWVyZ2VIb3N0QXR0cnMsIHNldFVwQXR0cmlidXRlc30gZnJvbSAnLi91dGlsL2F0dHJzX3V0aWxzJztcbmltcG9ydCB7ZGVidWdTdHJpbmdpZnlUeXBlRm9yRXJyb3IsIHN0cmluZ2lmeUZvckVycm9yfSBmcm9tICcuL3V0aWwvc3RyaW5naWZ5X3V0aWxzJztcbmltcG9ydCB7Z2V0Q29tcG9uZW50TFZpZXdCeUluZGV4LCBnZXROYXRpdmVCeVROb2RlLCBnZXRUTm9kZX0gZnJvbSAnLi91dGlsL3ZpZXdfdXRpbHMnO1xuaW1wb3J0IHtWaWV3UmVmfSBmcm9tICcuL3ZpZXdfcmVmJztcbmltcG9ydCB7Q2hhaW5lZEluamVjdG9yfSBmcm9tICcuL2NoYWluZWRfaW5qZWN0b3InO1xuaW1wb3J0IHt1bnJlZ2lzdGVyTFZpZXd9IGZyb20gJy4vaW50ZXJmYWNlcy9sdmlld190cmFja2luZyc7XG5cbmV4cG9ydCBjbGFzcyBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIgZXh0ZW5kcyBBYnN0cmFjdENvbXBvbmVudEZhY3RvcnlSZXNvbHZlciB7XG4gIC8qKlxuICAgKiBAcGFyYW0gbmdNb2R1bGUgVGhlIE5nTW9kdWxlUmVmIHRvIHdoaWNoIGFsbCByZXNvbHZlZCBmYWN0b3JpZXMgYXJlIGJvdW5kLlxuICAgKi9cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBuZ01vZHVsZT86IE5nTW9kdWxlUmVmPGFueT4pIHtcbiAgICBzdXBlcigpO1xuICB9XG5cbiAgb3ZlcnJpZGUgcmVzb2x2ZUNvbXBvbmVudEZhY3Rvcnk8VD4oY29tcG9uZW50OiBUeXBlPFQ+KTogQWJzdHJhY3RDb21wb25lbnRGYWN0b3J5PFQ+IHtcbiAgICBuZ0Rldk1vZGUgJiYgYXNzZXJ0Q29tcG9uZW50VHlwZShjb21wb25lbnQpO1xuICAgIGNvbnN0IGNvbXBvbmVudERlZiA9IGdldENvbXBvbmVudERlZihjb21wb25lbnQpITtcbiAgICByZXR1cm4gbmV3IENvbXBvbmVudEZhY3RvcnkoY29tcG9uZW50RGVmLCB0aGlzLm5nTW9kdWxlKTtcbiAgfVxufVxuXG5mdW5jdGlvbiB0b1JlZkFycmF5PFQ+KFxuICBtYXA6IERpcmVjdGl2ZURlZjxUPlsnaW5wdXRzJ10sXG4gIGlzSW5wdXRNYXA6IHRydWUsXG4pOiBDb21wb25lbnRGYWN0b3J5PFQ+WydpbnB1dHMnXTtcbmZ1bmN0aW9uIHRvUmVmQXJyYXk8VD4oXG4gIG1hcDogRGlyZWN0aXZlRGVmPFQ+WydvdXRwdXRzJ10sXG4gIGlzSW5wdXQ6IGZhbHNlLFxuKTogQ29tcG9uZW50RmFjdG9yeTxUPlsnb3V0cHV0cyddO1xuXG5mdW5jdGlvbiB0b1JlZkFycmF5PFxuICBULFxuICBJc0lucHV0TWFwIGV4dGVuZHMgYm9vbGVhbixcbiAgUmV0dXJuIGV4dGVuZHMgSXNJbnB1dE1hcCBleHRlbmRzIHRydWVcbiAgICA/IENvbXBvbmVudEZhY3Rvcnk8VD5bJ2lucHV0cyddXG4gICAgOiBDb21wb25lbnRGYWN0b3J5PFQ+WydvdXRwdXRzJ10sXG4+KG1hcDogRGlyZWN0aXZlRGVmPFQ+WydpbnB1dHMnXSB8IERpcmVjdGl2ZURlZjxUPlsnb3V0cHV0cyddLCBpc0lucHV0TWFwOiBJc0lucHV0TWFwKTogUmV0dXJuIHtcbiAgY29uc3QgYXJyYXk6IFJldHVybiA9IFtdIGFzIHVua25vd24gYXMgUmV0dXJuO1xuICBmb3IgKGNvbnN0IHB1YmxpY05hbWUgaW4gbWFwKSB7XG4gICAgaWYgKCFtYXAuaGFzT3duUHJvcGVydHkocHVibGljTmFtZSkpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIGNvbnN0IHZhbHVlID0gbWFwW3B1YmxpY05hbWVdO1xuICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBjb25zdCBpc0FycmF5ID0gQXJyYXkuaXNBcnJheSh2YWx1ZSk7XG4gICAgY29uc3QgcHJvcE5hbWU6IHN0cmluZyA9IGlzQXJyYXkgPyB2YWx1ZVswXSA6IHZhbHVlO1xuICAgIGNvbnN0IGZsYWdzOiBJbnB1dEZsYWdzID0gaXNBcnJheSA/IHZhbHVlWzFdIDogSW5wdXRGbGFncy5Ob25lO1xuXG4gICAgaWYgKGlzSW5wdXRNYXApIHtcbiAgICAgIChhcnJheSBhcyBDb21wb25lbnRGYWN0b3J5PFQ+WydpbnB1dHMnXSkucHVzaCh7XG4gICAgICAgIHByb3BOYW1lOiBwcm9wTmFtZSxcbiAgICAgICAgdGVtcGxhdGVOYW1lOiBwdWJsaWNOYW1lLFxuICAgICAgICBpc1NpZ25hbDogKGZsYWdzICYgSW5wdXRGbGFncy5TaWduYWxCYXNlZCkgIT09IDAsXG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgKGFycmF5IGFzIENvbXBvbmVudEZhY3Rvcnk8VD5bJ291dHB1dHMnXSkucHVzaCh7XG4gICAgICAgIHByb3BOYW1lOiBwcm9wTmFtZSxcbiAgICAgICAgdGVtcGxhdGVOYW1lOiBwdWJsaWNOYW1lLFxuICAgICAgfSk7XG4gICAgfVxuICB9XG4gIHJldHVybiBhcnJheTtcbn1cblxuZnVuY3Rpb24gZ2V0TmFtZXNwYWNlKGVsZW1lbnROYW1lOiBzdHJpbmcpOiBzdHJpbmcgfCBudWxsIHtcbiAgY29uc3QgbmFtZSA9IGVsZW1lbnROYW1lLnRvTG93ZXJDYXNlKCk7XG4gIHJldHVybiBuYW1lID09PSAnc3ZnJyA/IFNWR19OQU1FU1BBQ0UgOiBuYW1lID09PSAnbWF0aCcgPyBNQVRIX01MX05BTUVTUEFDRSA6IG51bGw7XG59XG5cbi8qKlxuICogQ29tcG9uZW50RmFjdG9yeSBpbnRlcmZhY2UgaW1wbGVtZW50YXRpb24uXG4gKi9cbmV4cG9ydCBjbGFzcyBDb21wb25lbnRGYWN0b3J5PFQ+IGV4dGVuZHMgQWJzdHJhY3RDb21wb25lbnRGYWN0b3J5PFQ+IHtcbiAgb3ZlcnJpZGUgc2VsZWN0b3I6IHN0cmluZztcbiAgb3ZlcnJpZGUgY29tcG9uZW50VHlwZTogVHlwZTxhbnk+O1xuICBvdmVycmlkZSBuZ0NvbnRlbnRTZWxlY3RvcnM6IHN0cmluZ1tdO1xuICBpc0JvdW5kVG9Nb2R1bGU6IGJvb2xlYW47XG5cbiAgb3ZlcnJpZGUgZ2V0IGlucHV0cygpOiB7XG4gICAgcHJvcE5hbWU6IHN0cmluZztcbiAgICB0ZW1wbGF0ZU5hbWU6IHN0cmluZztcbiAgICBpc1NpZ25hbDogYm9vbGVhbjtcbiAgICB0cmFuc2Zvcm0/OiAodmFsdWU6IGFueSkgPT4gYW55O1xuICB9W10ge1xuICAgIGNvbnN0IGNvbXBvbmVudERlZiA9IHRoaXMuY29tcG9uZW50RGVmO1xuICAgIGNvbnN0IGlucHV0VHJhbnNmb3JtcyA9IGNvbXBvbmVudERlZi5pbnB1dFRyYW5zZm9ybXM7XG4gICAgY29uc3QgcmVmQXJyYXkgPSB0b1JlZkFycmF5KGNvbXBvbmVudERlZi5pbnB1dHMsIHRydWUpO1xuXG4gICAgaWYgKGlucHV0VHJhbnNmb3JtcyAhPT0gbnVsbCkge1xuICAgICAgZm9yIChjb25zdCBpbnB1dCBvZiByZWZBcnJheSkge1xuICAgICAgICBpZiAoaW5wdXRUcmFuc2Zvcm1zLmhhc093blByb3BlcnR5KGlucHV0LnByb3BOYW1lKSkge1xuICAgICAgICAgIGlucHV0LnRyYW5zZm9ybSA9IGlucHV0VHJhbnNmb3Jtc1tpbnB1dC5wcm9wTmFtZV07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcmVmQXJyYXk7XG4gIH1cblxuICBvdmVycmlkZSBnZXQgb3V0cHV0cygpOiB7cHJvcE5hbWU6IHN0cmluZzsgdGVtcGxhdGVOYW1lOiBzdHJpbmd9W10ge1xuICAgIHJldHVybiB0b1JlZkFycmF5KHRoaXMuY29tcG9uZW50RGVmLm91dHB1dHMsIGZhbHNlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0gY29tcG9uZW50RGVmIFRoZSBjb21wb25lbnQgZGVmaW5pdGlvbi5cbiAgICogQHBhcmFtIG5nTW9kdWxlIFRoZSBOZ01vZHVsZVJlZiB0byB3aGljaCB0aGUgZmFjdG9yeSBpcyBib3VuZC5cbiAgICovXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgY29tcG9uZW50RGVmOiBDb21wb25lbnREZWY8YW55PixcbiAgICBwcml2YXRlIG5nTW9kdWxlPzogTmdNb2R1bGVSZWY8YW55PixcbiAgKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLmNvbXBvbmVudFR5cGUgPSBjb21wb25lbnREZWYudHlwZTtcbiAgICB0aGlzLnNlbGVjdG9yID0gc3RyaW5naWZ5Q1NTU2VsZWN0b3JMaXN0KGNvbXBvbmVudERlZi5zZWxlY3RvcnMpO1xuICAgIHRoaXMubmdDb250ZW50U2VsZWN0b3JzID0gY29tcG9uZW50RGVmLm5nQ29udGVudFNlbGVjdG9yc1xuICAgICAgPyBjb21wb25lbnREZWYubmdDb250ZW50U2VsZWN0b3JzXG4gICAgICA6IFtdO1xuICAgIHRoaXMuaXNCb3VuZFRvTW9kdWxlID0gISFuZ01vZHVsZTtcbiAgfVxuXG4gIG92ZXJyaWRlIGNyZWF0ZShcbiAgICBpbmplY3RvcjogSW5qZWN0b3IsXG4gICAgcHJvamVjdGFibGVOb2Rlcz86IGFueVtdW10gfCB1bmRlZmluZWQsXG4gICAgcm9vdFNlbGVjdG9yT3JOb2RlPzogYW55LFxuICAgIGVudmlyb25tZW50SW5qZWN0b3I/OiBOZ01vZHVsZVJlZjxhbnk+IHwgRW52aXJvbm1lbnRJbmplY3RvciB8IHVuZGVmaW5lZCxcbiAgKTogQWJzdHJhY3RDb21wb25lbnRSZWY8VD4ge1xuICAgIGNvbnN0IHByZXZDb25zdW1lciA9IHNldEFjdGl2ZUNvbnN1bWVyKG51bGwpO1xuICAgIHRyeSB7XG4gICAgICAvLyBDaGVjayBpZiB0aGUgY29tcG9uZW50IGlzIG9ycGhhblxuICAgICAgaWYgKFxuICAgICAgICBuZ0Rldk1vZGUgJiZcbiAgICAgICAgKHR5cGVvZiBuZ0ppdE1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nSml0TW9kZSkgJiZcbiAgICAgICAgdGhpcy5jb21wb25lbnREZWYuZGVidWdJbmZvPy5mb3JiaWRPcnBoYW5SZW5kZXJpbmdcbiAgICAgICkge1xuICAgICAgICBpZiAoZGVwc1RyYWNrZXIuaXNPcnBoYW5Db21wb25lbnQodGhpcy5jb21wb25lbnRUeXBlKSkge1xuICAgICAgICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgICAgICBSdW50aW1lRXJyb3JDb2RlLlJVTlRJTUVfREVQU19PUlBIQU5fQ09NUE9ORU5ULFxuICAgICAgICAgICAgYE9ycGhhbiBjb21wb25lbnQgZm91bmQhIFRyeWluZyB0byByZW5kZXIgdGhlIGNvbXBvbmVudCAke2RlYnVnU3RyaW5naWZ5VHlwZUZvckVycm9yKFxuICAgICAgICAgICAgICB0aGlzLmNvbXBvbmVudFR5cGUsXG4gICAgICAgICAgICApfSB3aXRob3V0IGZpcnN0IGxvYWRpbmcgdGhlIE5nTW9kdWxlIHRoYXQgZGVjbGFyZXMgaXQuIEl0IGlzIHJlY29tbWVuZGVkIHRvIG1ha2UgdGhpcyBjb21wb25lbnQgc3RhbmRhbG9uZSBpbiBvcmRlciB0byBhdm9pZCB0aGlzIGVycm9yLiBJZiB0aGlzIGlzIG5vdCBwb3NzaWJsZSBub3csIGltcG9ydCB0aGUgY29tcG9uZW50J3MgTmdNb2R1bGUgaW4gdGhlIGFwcHJvcHJpYXRlIE5nTW9kdWxlLCBvciB0aGUgc3RhbmRhbG9uZSBjb21wb25lbnQgaW4gd2hpY2ggeW91IGFyZSB0cnlpbmcgdG8gcmVuZGVyIHRoaXMgY29tcG9uZW50LiBJZiB0aGlzIGlzIGEgbGF6eSBpbXBvcnQsIGxvYWQgdGhlIE5nTW9kdWxlIGxhemlseSBhcyB3ZWxsIGFuZCB1c2UgaXRzIG1vZHVsZSBpbmplY3Rvci5gLFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZW52aXJvbm1lbnRJbmplY3RvciA9IGVudmlyb25tZW50SW5qZWN0b3IgfHwgdGhpcy5uZ01vZHVsZTtcblxuICAgICAgbGV0IHJlYWxFbnZpcm9ubWVudEluamVjdG9yID1cbiAgICAgICAgZW52aXJvbm1lbnRJbmplY3RvciBpbnN0YW5jZW9mIEVudmlyb25tZW50SW5qZWN0b3JcbiAgICAgICAgICA/IGVudmlyb25tZW50SW5qZWN0b3JcbiAgICAgICAgICA6IGVudmlyb25tZW50SW5qZWN0b3I/LmluamVjdG9yO1xuXG4gICAgICBpZiAocmVhbEVudmlyb25tZW50SW5qZWN0b3IgJiYgdGhpcy5jb21wb25lbnREZWYuZ2V0U3RhbmRhbG9uZUluamVjdG9yICE9PSBudWxsKSB7XG4gICAgICAgIHJlYWxFbnZpcm9ubWVudEluamVjdG9yID1cbiAgICAgICAgICB0aGlzLmNvbXBvbmVudERlZi5nZXRTdGFuZGFsb25lSW5qZWN0b3IocmVhbEVudmlyb25tZW50SW5qZWN0b3IpIHx8XG4gICAgICAgICAgcmVhbEVudmlyb25tZW50SW5qZWN0b3I7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHJvb3RWaWV3SW5qZWN0b3IgPSByZWFsRW52aXJvbm1lbnRJbmplY3RvclxuICAgICAgICA/IG5ldyBDaGFpbmVkSW5qZWN0b3IoaW5qZWN0b3IsIHJlYWxFbnZpcm9ubWVudEluamVjdG9yKVxuICAgICAgICA6IGluamVjdG9yO1xuXG4gICAgICBjb25zdCByZW5kZXJlckZhY3RvcnkgPSByb290Vmlld0luamVjdG9yLmdldChSZW5kZXJlckZhY3RvcnkyLCBudWxsKTtcbiAgICAgIGlmIChyZW5kZXJlckZhY3RvcnkgPT09IG51bGwpIHtcbiAgICAgICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgICBSdW50aW1lRXJyb3JDb2RlLlJFTkRFUkVSX05PVF9GT1VORCxcbiAgICAgICAgICBuZ0Rldk1vZGUgJiZcbiAgICAgICAgICAgICdBbmd1bGFyIHdhcyBub3QgYWJsZSB0byBpbmplY3QgYSByZW5kZXJlciAoUmVuZGVyZXJGYWN0b3J5MikuICcgK1xuICAgICAgICAgICAgICAnTGlrZWx5IHRoaXMgaXMgZHVlIHRvIGEgYnJva2VuIERJIGhpZXJhcmNoeS4gJyArXG4gICAgICAgICAgICAgICdNYWtlIHN1cmUgdGhhdCBhbnkgaW5qZWN0b3IgdXNlZCB0byBjcmVhdGUgdGhpcyBjb21wb25lbnQgaGFzIGEgY29ycmVjdCBwYXJlbnQuJyxcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHNhbml0aXplciA9IHJvb3RWaWV3SW5qZWN0b3IuZ2V0KFNhbml0aXplciwgbnVsbCk7XG5cbiAgICAgIGNvbnN0IGNoYW5nZURldGVjdGlvblNjaGVkdWxlciA9IHJvb3RWaWV3SW5qZWN0b3IuZ2V0KENoYW5nZURldGVjdGlvblNjaGVkdWxlciwgbnVsbCk7XG5cbiAgICAgIGNvbnN0IGVudmlyb25tZW50OiBMVmlld0Vudmlyb25tZW50ID0ge1xuICAgICAgICByZW5kZXJlckZhY3RvcnksXG4gICAgICAgIHNhbml0aXplcixcbiAgICAgICAgLy8gV2UgZG9uJ3QgdXNlIGlubGluZSBlZmZlY3RzICh5ZXQpLlxuICAgICAgICBpbmxpbmVFZmZlY3RSdW5uZXI6IG51bGwsXG4gICAgICAgIGNoYW5nZURldGVjdGlvblNjaGVkdWxlcixcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IGhvc3RSZW5kZXJlciA9IHJlbmRlcmVyRmFjdG9yeS5jcmVhdGVSZW5kZXJlcihudWxsLCB0aGlzLmNvbXBvbmVudERlZik7XG4gICAgICAvLyBEZXRlcm1pbmUgYSB0YWcgbmFtZSB1c2VkIGZvciBjcmVhdGluZyBob3N0IGVsZW1lbnRzIHdoZW4gdGhpcyBjb21wb25lbnQgaXMgY3JlYXRlZFxuICAgICAgLy8gZHluYW1pY2FsbHkuIERlZmF1bHQgdG8gJ2RpdicgaWYgdGhpcyBjb21wb25lbnQgZGlkIG5vdCBzcGVjaWZ5IGFueSB0YWcgbmFtZSBpbiBpdHNcbiAgICAgIC8vIHNlbGVjdG9yLlxuICAgICAgY29uc3QgZWxlbWVudE5hbWUgPSAodGhpcy5jb21wb25lbnREZWYuc2VsZWN0b3JzWzBdWzBdIGFzIHN0cmluZykgfHwgJ2Rpdic7XG4gICAgICBjb25zdCBob3N0Uk5vZGUgPSByb290U2VsZWN0b3JPck5vZGVcbiAgICAgICAgPyBsb2NhdGVIb3N0RWxlbWVudChcbiAgICAgICAgICAgIGhvc3RSZW5kZXJlcixcbiAgICAgICAgICAgIHJvb3RTZWxlY3Rvck9yTm9kZSxcbiAgICAgICAgICAgIHRoaXMuY29tcG9uZW50RGVmLmVuY2Fwc3VsYXRpb24sXG4gICAgICAgICAgICByb290Vmlld0luamVjdG9yLFxuICAgICAgICAgIClcbiAgICAgICAgOiBjcmVhdGVFbGVtZW50Tm9kZShob3N0UmVuZGVyZXIsIGVsZW1lbnROYW1lLCBnZXROYW1lc3BhY2UoZWxlbWVudE5hbWUpKTtcblxuICAgICAgbGV0IHJvb3RGbGFncyA9IExWaWV3RmxhZ3MuSXNSb290O1xuICAgICAgaWYgKHRoaXMuY29tcG9uZW50RGVmLnNpZ25hbHMpIHtcbiAgICAgICAgcm9vdEZsYWdzIHw9IExWaWV3RmxhZ3MuU2lnbmFsVmlldztcbiAgICAgIH0gZWxzZSBpZiAoIXRoaXMuY29tcG9uZW50RGVmLm9uUHVzaCkge1xuICAgICAgICByb290RmxhZ3MgfD0gTFZpZXdGbGFncy5DaGVja0Fsd2F5cztcbiAgICAgIH1cblxuICAgICAgbGV0IGh5ZHJhdGlvbkluZm86IERlaHlkcmF0ZWRWaWV3IHwgbnVsbCA9IG51bGw7XG4gICAgICBpZiAoaG9zdFJOb2RlICE9PSBudWxsKSB7XG4gICAgICAgIGh5ZHJhdGlvbkluZm8gPSByZXRyaWV2ZUh5ZHJhdGlvbkluZm8oaG9zdFJOb2RlLCByb290Vmlld0luamVjdG9yLCB0cnVlIC8qIGlzUm9vdFZpZXcgKi8pO1xuICAgICAgfVxuXG4gICAgICAvLyBDcmVhdGUgdGhlIHJvb3Qgdmlldy4gVXNlcyBlbXB0eSBUVmlldyBhbmQgQ29udGVudFRlbXBsYXRlLlxuICAgICAgY29uc3Qgcm9vdFRWaWV3ID0gY3JlYXRlVFZpZXcoXG4gICAgICAgIFRWaWV3VHlwZS5Sb290LFxuICAgICAgICBudWxsLFxuICAgICAgICBudWxsLFxuICAgICAgICAxLFxuICAgICAgICAwLFxuICAgICAgICBudWxsLFxuICAgICAgICBudWxsLFxuICAgICAgICBudWxsLFxuICAgICAgICBudWxsLFxuICAgICAgICBudWxsLFxuICAgICAgICBudWxsLFxuICAgICAgKTtcbiAgICAgIGNvbnN0IHJvb3RMVmlldyA9IGNyZWF0ZUxWaWV3KFxuICAgICAgICBudWxsLFxuICAgICAgICByb290VFZpZXcsXG4gICAgICAgIG51bGwsXG4gICAgICAgIHJvb3RGbGFncyxcbiAgICAgICAgbnVsbCxcbiAgICAgICAgbnVsbCxcbiAgICAgICAgZW52aXJvbm1lbnQsXG4gICAgICAgIGhvc3RSZW5kZXJlcixcbiAgICAgICAgcm9vdFZpZXdJbmplY3RvcixcbiAgICAgICAgbnVsbCxcbiAgICAgICAgaHlkcmF0aW9uSW5mbyxcbiAgICAgICk7XG5cbiAgICAgIC8vIHJvb3RWaWV3IGlzIHRoZSBwYXJlbnQgd2hlbiBib290c3RyYXBwaW5nXG4gICAgICAvLyBUT0RPKG1pc2tvKTogaXQgbG9va3MgbGlrZSB3ZSBhcmUgZW50ZXJpbmcgdmlldyBoZXJlIGJ1dCB3ZSBkb24ndCByZWFsbHkgbmVlZCB0byBhc1xuICAgICAgLy8gYHJlbmRlclZpZXdgIGRvZXMgdGhhdC4gSG93ZXZlciBhcyB0aGUgY29kZSBpcyB3cml0dGVuIGl0IGlzIG5lZWRlZCBiZWNhdXNlXG4gICAgICAvLyBgY3JlYXRlUm9vdENvbXBvbmVudFZpZXdgIGFuZCBgY3JlYXRlUm9vdENvbXBvbmVudGAgYm90aCByZWFkIGdsb2JhbCBzdGF0ZS4gRml4aW5nIHRob3NlXG4gICAgICAvLyBpc3N1ZXMgd291bGQgYWxsb3cgdXMgdG8gZHJvcCB0aGlzLlxuICAgICAgZW50ZXJWaWV3KHJvb3RMVmlldyk7XG5cbiAgICAgIGxldCBjb21wb25lbnQ6IFQ7XG4gICAgICBsZXQgdEVsZW1lbnROb2RlOiBURWxlbWVudE5vZGU7XG4gICAgICBsZXQgY29tcG9uZW50VmlldzogTFZpZXcgfCBudWxsID0gbnVsbDtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3Qgcm9vdENvbXBvbmVudERlZiA9IHRoaXMuY29tcG9uZW50RGVmO1xuICAgICAgICBsZXQgcm9vdERpcmVjdGl2ZXM6IERpcmVjdGl2ZURlZjx1bmtub3duPltdO1xuICAgICAgICBsZXQgaG9zdERpcmVjdGl2ZURlZnM6IEhvc3REaXJlY3RpdmVEZWZzIHwgbnVsbCA9IG51bGw7XG5cbiAgICAgICAgaWYgKHJvb3RDb21wb25lbnREZWYuZmluZEhvc3REaXJlY3RpdmVEZWZzKSB7XG4gICAgICAgICAgcm9vdERpcmVjdGl2ZXMgPSBbXTtcbiAgICAgICAgICBob3N0RGlyZWN0aXZlRGVmcyA9IG5ldyBNYXAoKTtcbiAgICAgICAgICByb290Q29tcG9uZW50RGVmLmZpbmRIb3N0RGlyZWN0aXZlRGVmcyhcbiAgICAgICAgICAgIHJvb3RDb21wb25lbnREZWYsXG4gICAgICAgICAgICByb290RGlyZWN0aXZlcyxcbiAgICAgICAgICAgIGhvc3REaXJlY3RpdmVEZWZzLFxuICAgICAgICAgICk7XG4gICAgICAgICAgcm9vdERpcmVjdGl2ZXMucHVzaChyb290Q29tcG9uZW50RGVmKTtcbiAgICAgICAgICBuZ0Rldk1vZGUgJiYgYXNzZXJ0Tm9EdXBsaWNhdGVEaXJlY3RpdmVzKHJvb3REaXJlY3RpdmVzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByb290RGlyZWN0aXZlcyA9IFtyb290Q29tcG9uZW50RGVmXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGhvc3RUTm9kZSA9IGNyZWF0ZVJvb3RDb21wb25lbnRUTm9kZShyb290TFZpZXcsIGhvc3RSTm9kZSk7XG4gICAgICAgIGNvbXBvbmVudFZpZXcgPSBjcmVhdGVSb290Q29tcG9uZW50VmlldyhcbiAgICAgICAgICBob3N0VE5vZGUsXG4gICAgICAgICAgaG9zdFJOb2RlLFxuICAgICAgICAgIHJvb3RDb21wb25lbnREZWYsXG4gICAgICAgICAgcm9vdERpcmVjdGl2ZXMsXG4gICAgICAgICAgcm9vdExWaWV3LFxuICAgICAgICAgIGVudmlyb25tZW50LFxuICAgICAgICAgIGhvc3RSZW5kZXJlcixcbiAgICAgICAgKTtcblxuICAgICAgICB0RWxlbWVudE5vZGUgPSBnZXRUTm9kZShyb290VFZpZXcsIEhFQURFUl9PRkZTRVQpIGFzIFRFbGVtZW50Tm9kZTtcblxuICAgICAgICAvLyBUT0RPKGNyaXNiZXRvKTogaW4gcHJhY3RpY2UgYGhvc3RSTm9kZWAgc2hvdWxkIGFsd2F5cyBiZSBkZWZpbmVkLCBidXQgdGhlcmUgYXJlIHNvbWVcbiAgICAgICAgLy8gdGVzdHMgd2hlcmUgdGhlIHJlbmRlcmVyIGlzIG1vY2tlZCBvdXQgYW5kIGB1bmRlZmluZWRgIGlzIHJldHVybmVkLiBXZSBzaG91bGQgdXBkYXRlIHRoZVxuICAgICAgICAvLyB0ZXN0cyBzbyB0aGF0IHRoaXMgY2hlY2sgY2FuIGJlIHJlbW92ZWQuXG4gICAgICAgIGlmIChob3N0Uk5vZGUpIHtcbiAgICAgICAgICBzZXRSb290Tm9kZUF0dHJpYnV0ZXMoaG9zdFJlbmRlcmVyLCByb290Q29tcG9uZW50RGVmLCBob3N0Uk5vZGUsIHJvb3RTZWxlY3Rvck9yTm9kZSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocHJvamVjdGFibGVOb2RlcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgcHJvamVjdE5vZGVzKHRFbGVtZW50Tm9kZSwgdGhpcy5uZ0NvbnRlbnRTZWxlY3RvcnMsIHByb2plY3RhYmxlTm9kZXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVE9ETzogc2hvdWxkIExpZmVjeWNsZUhvb2tzRmVhdHVyZSBhbmQgb3RoZXIgaG9zdCBmZWF0dXJlcyBiZSBnZW5lcmF0ZWQgYnkgdGhlIGNvbXBpbGVyXG4gICAgICAgIC8vIGFuZCBleGVjdXRlZCBoZXJlPyBBbmd1bGFyIDUgcmVmZXJlbmNlOiBodHRwczovL3N0YWNrYmxpdHouY29tL2VkaXQvbGlmZWN5Y2xlLWhvb2tzLXZjcmVmXG4gICAgICAgIGNvbXBvbmVudCA9IGNyZWF0ZVJvb3RDb21wb25lbnQoXG4gICAgICAgICAgY29tcG9uZW50VmlldyxcbiAgICAgICAgICByb290Q29tcG9uZW50RGVmLFxuICAgICAgICAgIHJvb3REaXJlY3RpdmVzLFxuICAgICAgICAgIGhvc3REaXJlY3RpdmVEZWZzLFxuICAgICAgICAgIHJvb3RMVmlldyxcbiAgICAgICAgICBbTGlmZWN5Y2xlSG9va3NGZWF0dXJlXSxcbiAgICAgICAgKTtcbiAgICAgICAgcmVuZGVyVmlldyhyb290VFZpZXcsIHJvb3RMVmlldywgbnVsbCk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIC8vIFN0b3AgdHJhY2tpbmcgdGhlIHZpZXdzIGlmIGNyZWF0aW9uIGZhaWxlZCBzaW5jZVxuICAgICAgICAvLyB0aGUgY29uc3VtZXIgd29uJ3QgaGF2ZSBhIHdheSB0byBkZXJlZmVyZW5jZSB0aGVtLlxuICAgICAgICBpZiAoY29tcG9uZW50VmlldyAhPT0gbnVsbCkge1xuICAgICAgICAgIHVucmVnaXN0ZXJMVmlldyhjb21wb25lbnRWaWV3KTtcbiAgICAgICAgfVxuICAgICAgICB1bnJlZ2lzdGVyTFZpZXcocm9vdExWaWV3KTtcbiAgICAgICAgdGhyb3cgZTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIGxlYXZlVmlldygpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbmV3IENvbXBvbmVudFJlZihcbiAgICAgICAgdGhpcy5jb21wb25lbnRUeXBlLFxuICAgICAgICBjb21wb25lbnQsXG4gICAgICAgIGNyZWF0ZUVsZW1lbnRSZWYodEVsZW1lbnROb2RlLCByb290TFZpZXcpLFxuICAgICAgICByb290TFZpZXcsXG4gICAgICAgIHRFbGVtZW50Tm9kZSxcbiAgICAgICk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNldEFjdGl2ZUNvbnN1bWVyKHByZXZDb25zdW1lcik7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogUmVwcmVzZW50cyBhbiBpbnN0YW5jZSBvZiBhIENvbXBvbmVudCBjcmVhdGVkIHZpYSBhIHtAbGluayBDb21wb25lbnRGYWN0b3J5fS5cbiAqXG4gKiBgQ29tcG9uZW50UmVmYCBwcm92aWRlcyBhY2Nlc3MgdG8gdGhlIENvbXBvbmVudCBJbnN0YW5jZSBhcyB3ZWxsIG90aGVyIG9iamVjdHMgcmVsYXRlZCB0byB0aGlzXG4gKiBDb21wb25lbnQgSW5zdGFuY2UgYW5kIGFsbG93cyB5b3UgdG8gZGVzdHJveSB0aGUgQ29tcG9uZW50IEluc3RhbmNlIHZpYSB0aGUge0BsaW5rICNkZXN0cm95fVxuICogbWV0aG9kLlxuICpcbiAqL1xuZXhwb3J0IGNsYXNzIENvbXBvbmVudFJlZjxUPiBleHRlbmRzIEFic3RyYWN0Q29tcG9uZW50UmVmPFQ+IHtcbiAgb3ZlcnJpZGUgaW5zdGFuY2U6IFQ7XG4gIG92ZXJyaWRlIGhvc3RWaWV3OiBWaWV3UmVmPFQ+O1xuICBvdmVycmlkZSBjaGFuZ2VEZXRlY3RvclJlZjogQ2hhbmdlRGV0ZWN0b3JSZWY7XG4gIG92ZXJyaWRlIGNvbXBvbmVudFR5cGU6IFR5cGU8VD47XG4gIHByaXZhdGUgcHJldmlvdXNJbnB1dFZhbHVlczogTWFwPHN0cmluZywgdW5rbm93bj4gfCBudWxsID0gbnVsbDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBjb21wb25lbnRUeXBlOiBUeXBlPFQ+LFxuICAgIGluc3RhbmNlOiBULFxuICAgIHB1YmxpYyBsb2NhdGlvbjogRWxlbWVudFJlZixcbiAgICBwcml2YXRlIF9yb290TFZpZXc6IExWaWV3LFxuICAgIHByaXZhdGUgX3ROb2RlOiBURWxlbWVudE5vZGUgfCBUQ29udGFpbmVyTm9kZSB8IFRFbGVtZW50Q29udGFpbmVyTm9kZSxcbiAgKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLmluc3RhbmNlID0gaW5zdGFuY2U7XG4gICAgdGhpcy5ob3N0VmlldyA9IHRoaXMuY2hhbmdlRGV0ZWN0b3JSZWYgPSBuZXcgVmlld1JlZjxUPihcbiAgICAgIF9yb290TFZpZXcsXG4gICAgICB1bmRlZmluZWQgLyogX2NkUmVmSW5qZWN0aW5nVmlldyAqLyxcbiAgICAgIGZhbHNlIC8qIG5vdGlmeUVycm9ySGFuZGxlciAqLyxcbiAgICApO1xuICAgIHRoaXMuY29tcG9uZW50VHlwZSA9IGNvbXBvbmVudFR5cGU7XG4gIH1cblxuICBvdmVycmlkZSBzZXRJbnB1dChuYW1lOiBzdHJpbmcsIHZhbHVlOiB1bmtub3duKTogdm9pZCB7XG4gICAgY29uc3QgaW5wdXREYXRhID0gdGhpcy5fdE5vZGUuaW5wdXRzO1xuICAgIGxldCBkYXRhVmFsdWU6IE5vZGVJbnB1dEJpbmRpbmdzW3R5cGVvZiBuYW1lXSB8IHVuZGVmaW5lZDtcbiAgICBpZiAoaW5wdXREYXRhICE9PSBudWxsICYmIChkYXRhVmFsdWUgPSBpbnB1dERhdGFbbmFtZV0pKSB7XG4gICAgICB0aGlzLnByZXZpb3VzSW5wdXRWYWx1ZXMgPz89IG5ldyBNYXAoKTtcbiAgICAgIC8vIERvIG5vdCBzZXQgdGhlIGlucHV0IGlmIGl0IGlzIHRoZSBzYW1lIGFzIHRoZSBsYXN0IHZhbHVlXG4gICAgICAvLyBUaGlzIGJlaGF2aW9yIG1hdGNoZXMgYGJpbmRpbmdVcGRhdGVkYCB3aGVuIGJpbmRpbmcgaW5wdXRzIGluIHRlbXBsYXRlcy5cbiAgICAgIGlmIChcbiAgICAgICAgdGhpcy5wcmV2aW91c0lucHV0VmFsdWVzLmhhcyhuYW1lKSAmJlxuICAgICAgICBPYmplY3QuaXModGhpcy5wcmV2aW91c0lucHV0VmFsdWVzLmdldChuYW1lKSwgdmFsdWUpXG4gICAgICApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBsVmlldyA9IHRoaXMuX3Jvb3RMVmlldztcbiAgICAgIHNldElucHV0c0ZvclByb3BlcnR5KGxWaWV3W1RWSUVXXSwgbFZpZXcsIGRhdGFWYWx1ZSwgbmFtZSwgdmFsdWUpO1xuICAgICAgdGhpcy5wcmV2aW91c0lucHV0VmFsdWVzLnNldChuYW1lLCB2YWx1ZSk7XG4gICAgICBjb25zdCBjaGlsZENvbXBvbmVudExWaWV3ID0gZ2V0Q29tcG9uZW50TFZpZXdCeUluZGV4KHRoaXMuX3ROb2RlLmluZGV4LCBsVmlldyk7XG4gICAgICBtYXJrVmlld0RpcnR5KGNoaWxkQ29tcG9uZW50TFZpZXcsIE5vdGlmaWNhdGlvblNvdXJjZS5TZXRJbnB1dCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChuZ0Rldk1vZGUpIHtcbiAgICAgICAgY29uc3QgY21wTmFtZUZvckVycm9yID0gc3RyaW5naWZ5Rm9yRXJyb3IodGhpcy5jb21wb25lbnRUeXBlKTtcbiAgICAgICAgbGV0IG1lc3NhZ2UgPSBgQ2FuJ3Qgc2V0IHZhbHVlIG9mIHRoZSAnJHtuYW1lfScgaW5wdXQgb24gdGhlICcke2NtcE5hbWVGb3JFcnJvcn0nIGNvbXBvbmVudC4gYDtcbiAgICAgICAgbWVzc2FnZSArPSBgTWFrZSBzdXJlIHRoYXQgdGhlICcke25hbWV9JyBwcm9wZXJ0eSBpcyBhbm5vdGF0ZWQgd2l0aCBASW5wdXQoKSBvciBhIG1hcHBlZCBASW5wdXQoJyR7bmFtZX0nKSBleGlzdHMuYDtcbiAgICAgICAgcmVwb3J0VW5rbm93blByb3BlcnR5RXJyb3IobWVzc2FnZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgb3ZlcnJpZGUgZ2V0IGluamVjdG9yKCk6IEluamVjdG9yIHtcbiAgICByZXR1cm4gbmV3IE5vZGVJbmplY3Rvcih0aGlzLl90Tm9kZSwgdGhpcy5fcm9vdExWaWV3KTtcbiAgfVxuXG4gIG92ZXJyaWRlIGRlc3Ryb3koKTogdm9pZCB7XG4gICAgdGhpcy5ob3N0Vmlldy5kZXN0cm95KCk7XG4gIH1cblxuICBvdmVycmlkZSBvbkRlc3Ryb3koY2FsbGJhY2s6ICgpID0+IHZvaWQpOiB2b2lkIHtcbiAgICB0aGlzLmhvc3RWaWV3Lm9uRGVzdHJveShjYWxsYmFjayk7XG4gIH1cbn1cblxuLyoqIFJlcHJlc2VudHMgYSBIb3N0RmVhdHVyZSBmdW5jdGlvbi4gKi9cbnR5cGUgSG9zdEZlYXR1cmUgPSA8VD4oY29tcG9uZW50OiBULCBjb21wb25lbnREZWY6IENvbXBvbmVudERlZjxUPikgPT4gdm9pZDtcblxuLyoqIENyZWF0ZXMgYSBUTm9kZSB0aGF0IGNhbiBiZSB1c2VkIHRvIGluc3RhbnRpYXRlIGEgcm9vdCBjb21wb25lbnQuICovXG5mdW5jdGlvbiBjcmVhdGVSb290Q29tcG9uZW50VE5vZGUobFZpZXc6IExWaWV3LCByTm9kZTogUk5vZGUpOiBURWxlbWVudE5vZGUge1xuICBjb25zdCB0VmlldyA9IGxWaWV3W1RWSUVXXTtcbiAgY29uc3QgaW5kZXggPSBIRUFERVJfT0ZGU0VUO1xuICBuZ0Rldk1vZGUgJiYgYXNzZXJ0SW5kZXhJblJhbmdlKGxWaWV3LCBpbmRleCk7XG4gIGxWaWV3W2luZGV4XSA9IHJOb2RlO1xuXG4gIC8vICcjaG9zdCcgaXMgYWRkZWQgaGVyZSBhcyB3ZSBkb24ndCBrbm93IHRoZSByZWFsIGhvc3QgRE9NIG5hbWUgKHdlIGRvbid0IHdhbnQgdG8gcmVhZCBpdCkgYW5kIGF0XG4gIC8vIHRoZSBzYW1lIHRpbWUgd2Ugd2FudCB0byBjb21tdW5pY2F0ZSB0aGUgZGVidWcgYFROb2RlYCB0aGF0IHRoaXMgaXMgYSBzcGVjaWFsIGBUTm9kZWBcbiAgLy8gcmVwcmVzZW50aW5nIGEgaG9zdCBlbGVtZW50LlxuICByZXR1cm4gZ2V0T3JDcmVhdGVUTm9kZSh0VmlldywgaW5kZXgsIFROb2RlVHlwZS5FbGVtZW50LCAnI2hvc3QnLCBudWxsKTtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIHRoZSByb290IGNvbXBvbmVudCB2aWV3IGFuZCB0aGUgcm9vdCBjb21wb25lbnQgbm9kZS5cbiAqXG4gKiBAcGFyYW0gaG9zdFJOb2RlIFJlbmRlciBob3N0IGVsZW1lbnQuXG4gKiBAcGFyYW0gcm9vdENvbXBvbmVudERlZiBDb21wb25lbnREZWZcbiAqIEBwYXJhbSByb290VmlldyBUaGUgcGFyZW50IHZpZXcgd2hlcmUgdGhlIGhvc3Qgbm9kZSBpcyBzdG9yZWRcbiAqIEBwYXJhbSByZW5kZXJlckZhY3RvcnkgRmFjdG9yeSB0byBiZSB1c2VkIGZvciBjcmVhdGluZyBjaGlsZCByZW5kZXJlcnMuXG4gKiBAcGFyYW0gaG9zdFJlbmRlcmVyIFRoZSBjdXJyZW50IHJlbmRlcmVyXG4gKiBAcGFyYW0gc2FuaXRpemVyIFRoZSBzYW5pdGl6ZXIsIGlmIHByb3ZpZGVkXG4gKlxuICogQHJldHVybnMgQ29tcG9uZW50IHZpZXcgY3JlYXRlZFxuICovXG5mdW5jdGlvbiBjcmVhdGVSb290Q29tcG9uZW50VmlldyhcbiAgdE5vZGU6IFRFbGVtZW50Tm9kZSxcbiAgaG9zdFJOb2RlOiBSRWxlbWVudCB8IG51bGwsXG4gIHJvb3RDb21wb25lbnREZWY6IENvbXBvbmVudERlZjxhbnk+LFxuICByb290RGlyZWN0aXZlczogRGlyZWN0aXZlRGVmPGFueT5bXSxcbiAgcm9vdFZpZXc6IExWaWV3LFxuICBlbnZpcm9ubWVudDogTFZpZXdFbnZpcm9ubWVudCxcbiAgaG9zdFJlbmRlcmVyOiBSZW5kZXJlcixcbik6IExWaWV3IHtcbiAgY29uc3QgdFZpZXcgPSByb290Vmlld1tUVklFV107XG4gIGFwcGx5Um9vdENvbXBvbmVudFN0eWxpbmcocm9vdERpcmVjdGl2ZXMsIHROb2RlLCBob3N0Uk5vZGUsIGhvc3RSZW5kZXJlcik7XG5cbiAgLy8gSHlkcmF0aW9uIGluZm8gaXMgb24gdGhlIGhvc3QgZWxlbWVudCBhbmQgbmVlZHMgdG8gYmUgcmV0cmlldmVkXG4gIC8vIGFuZCBwYXNzZWQgdG8gdGhlIGNvbXBvbmVudCBMVmlldy5cbiAgbGV0IGh5ZHJhdGlvbkluZm86IERlaHlkcmF0ZWRWaWV3IHwgbnVsbCA9IG51bGw7XG4gIGlmIChob3N0Uk5vZGUgIT09IG51bGwpIHtcbiAgICBoeWRyYXRpb25JbmZvID0gcmV0cmlldmVIeWRyYXRpb25JbmZvKGhvc3RSTm9kZSwgcm9vdFZpZXdbSU5KRUNUT1JdISk7XG4gIH1cbiAgY29uc3Qgdmlld1JlbmRlcmVyID0gZW52aXJvbm1lbnQucmVuZGVyZXJGYWN0b3J5LmNyZWF0ZVJlbmRlcmVyKGhvc3RSTm9kZSwgcm9vdENvbXBvbmVudERlZik7XG4gIGxldCBsVmlld0ZsYWdzID0gTFZpZXdGbGFncy5DaGVja0Fsd2F5cztcbiAgaWYgKHJvb3RDb21wb25lbnREZWYuc2lnbmFscykge1xuICAgIGxWaWV3RmxhZ3MgPSBMVmlld0ZsYWdzLlNpZ25hbFZpZXc7XG4gIH0gZWxzZSBpZiAocm9vdENvbXBvbmVudERlZi5vblB1c2gpIHtcbiAgICBsVmlld0ZsYWdzID0gTFZpZXdGbGFncy5EaXJ0eTtcbiAgfVxuICBjb25zdCBjb21wb25lbnRWaWV3ID0gY3JlYXRlTFZpZXcoXG4gICAgcm9vdFZpZXcsXG4gICAgZ2V0T3JDcmVhdGVDb21wb25lbnRUVmlldyhyb290Q29tcG9uZW50RGVmKSxcbiAgICBudWxsLFxuICAgIGxWaWV3RmxhZ3MsXG4gICAgcm9vdFZpZXdbdE5vZGUuaW5kZXhdLFxuICAgIHROb2RlLFxuICAgIGVudmlyb25tZW50LFxuICAgIHZpZXdSZW5kZXJlcixcbiAgICBudWxsLFxuICAgIG51bGwsXG4gICAgaHlkcmF0aW9uSW5mbyxcbiAgKTtcblxuICBpZiAodFZpZXcuZmlyc3RDcmVhdGVQYXNzKSB7XG4gICAgbWFya0FzQ29tcG9uZW50SG9zdCh0VmlldywgdE5vZGUsIHJvb3REaXJlY3RpdmVzLmxlbmd0aCAtIDEpO1xuICB9XG5cbiAgYWRkVG9WaWV3VHJlZShyb290VmlldywgY29tcG9uZW50Vmlldyk7XG5cbiAgLy8gU3RvcmUgY29tcG9uZW50IHZpZXcgYXQgbm9kZSBpbmRleCwgd2l0aCBub2RlIGFzIHRoZSBIT1NUXG4gIHJldHVybiAocm9vdFZpZXdbdE5vZGUuaW5kZXhdID0gY29tcG9uZW50Vmlldyk7XG59XG5cbi8qKiBTZXRzIHVwIHRoZSBzdHlsaW5nIGluZm9ybWF0aW9uIG9uIGEgcm9vdCBjb21wb25lbnQuICovXG5mdW5jdGlvbiBhcHBseVJvb3RDb21wb25lbnRTdHlsaW5nKFxuICByb290RGlyZWN0aXZlczogRGlyZWN0aXZlRGVmPGFueT5bXSxcbiAgdE5vZGU6IFRFbGVtZW50Tm9kZSxcbiAgck5vZGU6IFJFbGVtZW50IHwgbnVsbCxcbiAgaG9zdFJlbmRlcmVyOiBSZW5kZXJlcixcbik6IHZvaWQge1xuICBmb3IgKGNvbnN0IGRlZiBvZiByb290RGlyZWN0aXZlcykge1xuICAgIHROb2RlLm1lcmdlZEF0dHJzID0gbWVyZ2VIb3N0QXR0cnModE5vZGUubWVyZ2VkQXR0cnMsIGRlZi5ob3N0QXR0cnMpO1xuICB9XG5cbiAgaWYgKHROb2RlLm1lcmdlZEF0dHJzICE9PSBudWxsKSB7XG4gICAgY29tcHV0ZVN0YXRpY1N0eWxpbmcodE5vZGUsIHROb2RlLm1lcmdlZEF0dHJzLCB0cnVlKTtcblxuICAgIGlmIChyTm9kZSAhPT0gbnVsbCkge1xuICAgICAgc2V0dXBTdGF0aWNBdHRyaWJ1dGVzKGhvc3RSZW5kZXJlciwgck5vZGUsIHROb2RlKTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgcm9vdCBjb21wb25lbnQgYW5kIHNldHMgaXQgdXAgd2l0aCBmZWF0dXJlcyBhbmQgaG9zdCBiaW5kaW5ncy5TaGFyZWQgYnlcbiAqIHJlbmRlckNvbXBvbmVudCgpIGFuZCBWaWV3Q29udGFpbmVyUmVmLmNyZWF0ZUNvbXBvbmVudCgpLlxuICovXG5mdW5jdGlvbiBjcmVhdGVSb290Q29tcG9uZW50PFQ+KFxuICBjb21wb25lbnRWaWV3OiBMVmlldyxcbiAgcm9vdENvbXBvbmVudERlZjogQ29tcG9uZW50RGVmPFQ+LFxuICByb290RGlyZWN0aXZlczogRGlyZWN0aXZlRGVmPGFueT5bXSxcbiAgaG9zdERpcmVjdGl2ZURlZnM6IEhvc3REaXJlY3RpdmVEZWZzIHwgbnVsbCxcbiAgcm9vdExWaWV3OiBMVmlldyxcbiAgaG9zdEZlYXR1cmVzOiBIb3N0RmVhdHVyZVtdIHwgbnVsbCxcbik6IGFueSB7XG4gIGNvbnN0IHJvb3RUTm9kZSA9IGdldEN1cnJlbnRUTm9kZSgpIGFzIFRFbGVtZW50Tm9kZTtcbiAgbmdEZXZNb2RlICYmIGFzc2VydERlZmluZWQocm9vdFROb2RlLCAndE5vZGUgc2hvdWxkIGhhdmUgYmVlbiBhbHJlYWR5IGNyZWF0ZWQnKTtcbiAgY29uc3QgdFZpZXcgPSByb290TFZpZXdbVFZJRVddO1xuICBjb25zdCBuYXRpdmUgPSBnZXROYXRpdmVCeVROb2RlKHJvb3RUTm9kZSwgcm9vdExWaWV3KTtcblxuICBpbml0aWFsaXplRGlyZWN0aXZlcyh0Vmlldywgcm9vdExWaWV3LCByb290VE5vZGUsIHJvb3REaXJlY3RpdmVzLCBudWxsLCBob3N0RGlyZWN0aXZlRGVmcyk7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCByb290RGlyZWN0aXZlcy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IGRpcmVjdGl2ZUluZGV4ID0gcm9vdFROb2RlLmRpcmVjdGl2ZVN0YXJ0ICsgaTtcbiAgICBjb25zdCBkaXJlY3RpdmVJbnN0YW5jZSA9IGdldE5vZGVJbmplY3RhYmxlKHJvb3RMVmlldywgdFZpZXcsIGRpcmVjdGl2ZUluZGV4LCByb290VE5vZGUpO1xuICAgIGF0dGFjaFBhdGNoRGF0YShkaXJlY3RpdmVJbnN0YW5jZSwgcm9vdExWaWV3KTtcbiAgfVxuXG4gIGludm9rZURpcmVjdGl2ZXNIb3N0QmluZGluZ3ModFZpZXcsIHJvb3RMVmlldywgcm9vdFROb2RlKTtcblxuICBpZiAobmF0aXZlKSB7XG4gICAgYXR0YWNoUGF0Y2hEYXRhKG5hdGl2ZSwgcm9vdExWaWV3KTtcbiAgfVxuXG4gIC8vIFdlJ3JlIGd1YXJhbnRlZWQgZm9yIHRoZSBgY29tcG9uZW50T2Zmc2V0YCB0byBiZSBwb3NpdGl2ZSBoZXJlXG4gIC8vIHNpbmNlIGEgcm9vdCBjb21wb25lbnQgYWx3YXlzIG1hdGNoZXMgYSBjb21wb25lbnQgZGVmLlxuICBuZ0Rldk1vZGUgJiZcbiAgICBhc3NlcnRHcmVhdGVyVGhhbihyb290VE5vZGUuY29tcG9uZW50T2Zmc2V0LCAtMSwgJ2NvbXBvbmVudE9mZnNldCBtdXN0IGJlIGdyZWF0IHRoYW4gLTEnKTtcbiAgY29uc3QgY29tcG9uZW50ID0gZ2V0Tm9kZUluamVjdGFibGUoXG4gICAgcm9vdExWaWV3LFxuICAgIHRWaWV3LFxuICAgIHJvb3RUTm9kZS5kaXJlY3RpdmVTdGFydCArIHJvb3RUTm9kZS5jb21wb25lbnRPZmZzZXQsXG4gICAgcm9vdFROb2RlLFxuICApO1xuICBjb21wb25lbnRWaWV3W0NPTlRFWFRdID0gcm9vdExWaWV3W0NPTlRFWFRdID0gY29tcG9uZW50O1xuXG4gIGlmIChob3N0RmVhdHVyZXMgIT09IG51bGwpIHtcbiAgICBmb3IgKGNvbnN0IGZlYXR1cmUgb2YgaG9zdEZlYXR1cmVzKSB7XG4gICAgICBmZWF0dXJlKGNvbXBvbmVudCwgcm9vdENvbXBvbmVudERlZik7XG4gICAgfVxuICB9XG5cbiAgLy8gV2Ugd2FudCB0byBnZW5lcmF0ZSBhbiBlbXB0eSBRdWVyeUxpc3QgZm9yIHJvb3QgY29udGVudCBxdWVyaWVzIGZvciBiYWNrd2FyZHNcbiAgLy8gY29tcGF0aWJpbGl0eSB3aXRoIFZpZXdFbmdpbmUuXG4gIGV4ZWN1dGVDb250ZW50UXVlcmllcyh0Vmlldywgcm9vdFROb2RlLCByb290TFZpZXcpO1xuXG4gIHJldHVybiBjb21wb25lbnQ7XG59XG5cbi8qKiBTZXRzIHRoZSBzdGF0aWMgYXR0cmlidXRlcyBvbiBhIHJvb3QgY29tcG9uZW50LiAqL1xuZnVuY3Rpb24gc2V0Um9vdE5vZGVBdHRyaWJ1dGVzKFxuICBob3N0UmVuZGVyZXI6IFJlbmRlcmVyMixcbiAgY29tcG9uZW50RGVmOiBDb21wb25lbnREZWY8dW5rbm93bj4sXG4gIGhvc3RSTm9kZTogUkVsZW1lbnQsXG4gIHJvb3RTZWxlY3Rvck9yTm9kZTogYW55LFxuKSB7XG4gIGlmIChyb290U2VsZWN0b3JPck5vZGUpIHtcbiAgICAvLyBUaGUgcGxhY2Vob2xkZXIgd2lsbCBiZSByZXBsYWNlZCB3aXRoIHRoZSBhY3R1YWwgdmVyc2lvbiBhdCBidWlsZCB0aW1lLlxuICAgIHNldFVwQXR0cmlidXRlcyhob3N0UmVuZGVyZXIsIGhvc3RSTm9kZSwgWyduZy12ZXJzaW9uJywgJzAuMC4wLVBMQUNFSE9MREVSJ10pO1xuICB9IGVsc2Uge1xuICAgIC8vIElmIGhvc3QgZWxlbWVudCBpcyBjcmVhdGVkIGFzIGEgcGFydCBvZiB0aGlzIGZ1bmN0aW9uIGNhbGwgKGkuZS4gYHJvb3RTZWxlY3Rvck9yTm9kZWBcbiAgICAvLyBpcyBub3QgZGVmaW5lZCksIGFsc28gYXBwbHkgYXR0cmlidXRlcyBhbmQgY2xhc3NlcyBleHRyYWN0ZWQgZnJvbSBjb21wb25lbnQgc2VsZWN0b3IuXG4gICAgLy8gRXh0cmFjdCBhdHRyaWJ1dGVzIGFuZCBjbGFzc2VzIGZyb20gdGhlIGZpcnN0IHNlbGVjdG9yIG9ubHkgdG8gbWF0Y2ggVkUgYmVoYXZpb3IuXG4gICAgY29uc3Qge2F0dHJzLCBjbGFzc2VzfSA9IGV4dHJhY3RBdHRyc0FuZENsYXNzZXNGcm9tU2VsZWN0b3IoY29tcG9uZW50RGVmLnNlbGVjdG9yc1swXSk7XG4gICAgaWYgKGF0dHJzKSB7XG4gICAgICBzZXRVcEF0dHJpYnV0ZXMoaG9zdFJlbmRlcmVyLCBob3N0Uk5vZGUsIGF0dHJzKTtcbiAgICB9XG4gICAgaWYgKGNsYXNzZXMgJiYgY2xhc3Nlcy5sZW5ndGggPiAwKSB7XG4gICAgICB3cml0ZURpcmVjdENsYXNzKGhvc3RSZW5kZXJlciwgaG9zdFJOb2RlLCBjbGFzc2VzLmpvaW4oJyAnKSk7XG4gICAgfVxuICB9XG59XG5cbi8qKiBQcm9qZWN0cyB0aGUgYHByb2plY3RhYmxlTm9kZXNgIHRoYXQgd2VyZSBzcGVjaWZpZWQgd2hlbiBjcmVhdGluZyBhIHJvb3QgY29tcG9uZW50LiAqL1xuZnVuY3Rpb24gcHJvamVjdE5vZGVzKFxuICB0Tm9kZTogVEVsZW1lbnROb2RlLFxuICBuZ0NvbnRlbnRTZWxlY3RvcnM6IHN0cmluZ1tdLFxuICBwcm9qZWN0YWJsZU5vZGVzOiBhbnlbXVtdLFxuKSB7XG4gIGNvbnN0IHByb2plY3Rpb246IChUTm9kZSB8IFJOb2RlW10gfCBudWxsKVtdID0gKHROb2RlLnByb2plY3Rpb24gPSBbXSk7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbmdDb250ZW50U2VsZWN0b3JzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3Qgbm9kZXNmb3JTbG90ID0gcHJvamVjdGFibGVOb2Rlc1tpXTtcbiAgICAvLyBQcm9qZWN0YWJsZSBub2RlcyBjYW4gYmUgcGFzc2VkIGFzIGFycmF5IG9mIGFycmF5cyBvciBhbiBhcnJheSBvZiBpdGVyYWJsZXMgKG5nVXBncmFkZVxuICAgIC8vIGNhc2UpLiBIZXJlIHdlIGRvIG5vcm1hbGl6ZSBwYXNzZWQgZGF0YSBzdHJ1Y3R1cmUgdG8gYmUgYW4gYXJyYXkgb2YgYXJyYXlzIHRvIGF2b2lkXG4gICAgLy8gY29tcGxleCBjaGVja3MgZG93biB0aGUgbGluZS5cbiAgICAvLyBXZSBhbHNvIG5vcm1hbGl6ZSB0aGUgbGVuZ3RoIG9mIHRoZSBwYXNzZWQgaW4gcHJvamVjdGFibGUgbm9kZXMgKHRvIG1hdGNoIHRoZSBudW1iZXIgb2ZcbiAgICAvLyA8bmctY29udGFpbmVyPiBzbG90cyBkZWZpbmVkIGJ5IGEgY29tcG9uZW50KS5cbiAgICBwcm9qZWN0aW9uLnB1c2gobm9kZXNmb3JTbG90ICE9IG51bGwgPyBBcnJheS5mcm9tKG5vZGVzZm9yU2xvdCkgOiBudWxsKTtcbiAgfVxufVxuXG4vKipcbiAqIFVzZWQgdG8gZW5hYmxlIGxpZmVjeWNsZSBob29rcyBvbiB0aGUgcm9vdCBjb21wb25lbnQuXG4gKlxuICogSW5jbHVkZSB0aGlzIGZlYXR1cmUgd2hlbiBjYWxsaW5nIGByZW5kZXJDb21wb25lbnRgIGlmIHRoZSByb290IGNvbXBvbmVudFxuICogeW91IGFyZSByZW5kZXJpbmcgaGFzIGxpZmVjeWNsZSBob29rcyBkZWZpbmVkLiBPdGhlcndpc2UsIHRoZSBob29rcyB3b24ndFxuICogYmUgY2FsbGVkIHByb3Blcmx5LlxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogYGBgXG4gKiByZW5kZXJDb21wb25lbnQoQXBwQ29tcG9uZW50LCB7aG9zdEZlYXR1cmVzOiBbTGlmZWN5Y2xlSG9va3NGZWF0dXJlXX0pO1xuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBMaWZlY3ljbGVIb29rc0ZlYXR1cmUoKTogdm9pZCB7XG4gIGNvbnN0IHROb2RlID0gZ2V0Q3VycmVudFROb2RlKCkhO1xuICBuZ0Rldk1vZGUgJiYgYXNzZXJ0RGVmaW5lZCh0Tm9kZSwgJ1ROb2RlIGlzIHJlcXVpcmVkJyk7XG4gIHJlZ2lzdGVyUG9zdE9yZGVySG9va3MoZ2V0TFZpZXcoKVtUVklFV10sIHROb2RlKTtcbn1cbiJdfQ==