/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { EnvironmentInjector } from '../di/r3_injector';
import { validateMatchingNode } from '../hydration/error_handling';
import { CONTAINERS } from '../hydration/interfaces';
import { isInSkipHydrationBlock } from '../hydration/skip_hydration';
import { getSegmentHead, isDisconnectedNode, markRNodeAsClaimedByHydration, } from '../hydration/utils';
import { findMatchingDehydratedView, locateDehydratedViewsInContainer } from '../hydration/views';
import { isType } from '../interface/type';
import { assertNodeInjector } from '../render3/assert';
import { ComponentFactory as R3ComponentFactory } from '../render3/component_ref';
import { getComponentDef } from '../render3/definition';
import { getParentInjectorLocation, NodeInjector } from '../render3/di';
import { addToViewTree, createLContainer } from '../render3/instructions/shared';
import { CONTAINER_HEADER_OFFSET, DEHYDRATED_VIEWS, NATIVE, VIEW_REFS, } from '../render3/interfaces/container';
import { isLContainer } from '../render3/interfaces/type_checks';
import { HEADER_OFFSET, HYDRATION, PARENT, RENDERER, T_HOST, TVIEW, } from '../render3/interfaces/view';
import { assertTNodeType } from '../render3/node_assert';
import { destroyLView, detachView, nativeInsertBefore, nativeNextSibling, nativeParentNode, } from '../render3/node_manipulation';
import { getCurrentTNode, getLView } from '../render3/state';
import { getParentInjectorIndex, getParentInjectorView, hasParentInjector, } from '../render3/util/injector_utils';
import { getNativeByTNode, unwrapRNode, viewAttachedToContainer } from '../render3/util/view_utils';
import { addLViewToLContainer, shouldAddViewToDom } from '../render3/view_manipulation';
import { ViewRef as R3ViewRef } from '../render3/view_ref';
import { addToArray, removeFromArray } from '../util/array_utils';
import { assertDefined, assertEqual, assertGreaterThan, assertLessThan, throwError, } from '../util/assert';
import { createElementRef } from './element_ref';
/**
 * Represents a container where one or more views can be attached to a component.
 *
 * Can contain *host views* (created by instantiating a
 * component with the `createComponent()` method), and *embedded views*
 * (created by instantiating a `TemplateRef` with the `createEmbeddedView()` method).
 *
 * A view container instance can contain other view containers,
 * creating a view hierarchy.
 *
 * @usageNotes
 *
 * The example below demonstrates how the `createComponent` function can be used
 * to create an instance of a ComponentRef dynamically and attach it to an ApplicationRef,
 * so that it gets included into change detection cycles.
 *
 * Note: the example uses standalone components, but the function can also be used for
 * non-standalone components (declared in an NgModule) as well.
 *
 * ```typescript
 * @Component({
 *   standalone: true,
 *   selector: 'dynamic',
 *   template: `<span>This is a content of a dynamic component.</span>`,
 * })
 * class DynamicComponent {
 *   vcr = inject(ViewContainerRef);
 * }
 *
 * @Component({
 *   standalone: true,
 *   selector: 'app',
 *   template: `<main>Hi! This is the main content.</main>`,
 * })
 * class AppComponent {
 *   vcr = inject(ViewContainerRef);
 *
 *   ngAfterViewInit() {
 *     const compRef = this.vcr.createComponent(DynamicComponent);
 *     compRef.changeDetectorRef.detectChanges();
 *   }
 * }
 * ```
 *
 * @see {@link ComponentRef}
 * @see {@link EmbeddedViewRef}
 *
 * @publicApi
 */
export class ViewContainerRef {
    /**
     * @internal
     * @nocollapse
     */
    static { this.__NG_ELEMENT_ID__ = injectViewContainerRef; }
}
/**
 * Creates a ViewContainerRef and stores it on the injector. Or, if the ViewContainerRef
 * already exists, retrieves the existing ViewContainerRef.
 *
 * @returns The ViewContainerRef instance to use
 */
export function injectViewContainerRef() {
    const previousTNode = getCurrentTNode();
    return createContainerRef(previousTNode, getLView());
}
const VE_ViewContainerRef = ViewContainerRef;
// TODO(alxhub): cleaning up this indirection triggers a subtle bug in Closure in g3. Once the fix
// for that lands, this can be cleaned up.
const R3ViewContainerRef = class ViewContainerRef extends VE_ViewContainerRef {
    constructor(_lContainer, _hostTNode, _hostLView) {
        super();
        this._lContainer = _lContainer;
        this._hostTNode = _hostTNode;
        this._hostLView = _hostLView;
    }
    get element() {
        return createElementRef(this._hostTNode, this._hostLView);
    }
    get injector() {
        return new NodeInjector(this._hostTNode, this._hostLView);
    }
    /** @deprecated No replacement */
    get parentInjector() {
        const parentLocation = getParentInjectorLocation(this._hostTNode, this._hostLView);
        if (hasParentInjector(parentLocation)) {
            const parentView = getParentInjectorView(parentLocation, this._hostLView);
            const injectorIndex = getParentInjectorIndex(parentLocation);
            ngDevMode && assertNodeInjector(parentView, injectorIndex);
            const parentTNode = parentView[TVIEW].data[injectorIndex + 8 /* NodeInjectorOffset.TNODE */];
            return new NodeInjector(parentTNode, parentView);
        }
        else {
            return new NodeInjector(null, this._hostLView);
        }
    }
    clear() {
        while (this.length > 0) {
            this.remove(this.length - 1);
        }
    }
    get(index) {
        const viewRefs = getViewRefs(this._lContainer);
        return (viewRefs !== null && viewRefs[index]) || null;
    }
    get length() {
        return this._lContainer.length - CONTAINER_HEADER_OFFSET;
    }
    createEmbeddedView(templateRef, context, indexOrOptions) {
        let index;
        let injector;
        if (typeof indexOrOptions === 'number') {
            index = indexOrOptions;
        }
        else if (indexOrOptions != null) {
            index = indexOrOptions.index;
            injector = indexOrOptions.injector;
        }
        const dehydratedView = findMatchingDehydratedView(this._lContainer, templateRef.ssrId);
        const viewRef = templateRef.createEmbeddedViewImpl(context || {}, injector, dehydratedView);
        this.insertImpl(viewRef, index, shouldAddViewToDom(this._hostTNode, dehydratedView));
        return viewRef;
    }
    createComponent(componentFactoryOrType, indexOrOptions, injector, projectableNodes, environmentInjector) {
        const isComponentFactory = componentFactoryOrType && !isType(componentFactoryOrType);
        let index;
        // This function supports 2 signatures and we need to handle options correctly for both:
        //   1. When first argument is a Component type. This signature also requires extra
        //      options to be provided as object (more ergonomic option).
        //   2. First argument is a Component factory. In this case extra options are represented as
        //      positional arguments. This signature is less ergonomic and will be deprecated.
        if (isComponentFactory) {
            if (ngDevMode) {
                assertEqual(typeof indexOrOptions !== 'object', true, 'It looks like Component factory was provided as the first argument ' +
                    'and an options object as the second argument. This combination of arguments ' +
                    'is incompatible. You can either change the first argument to provide Component ' +
                    'type or change the second argument to be a number (representing an index at ' +
                    "which to insert the new component's host view into this container)");
            }
            index = indexOrOptions;
        }
        else {
            if (ngDevMode) {
                assertDefined(getComponentDef(componentFactoryOrType), `Provided Component class doesn't contain Component definition. ` +
                    `Please check whether provided class has @Component decorator.`);
                assertEqual(typeof indexOrOptions !== 'number', true, 'It looks like Component type was provided as the first argument ' +
                    "and a number (representing an index at which to insert the new component's " +
                    'host view into this container as the second argument. This combination of arguments ' +
                    'is incompatible. Please use an object as the second argument instead.');
            }
            const options = (indexOrOptions || {});
            if (ngDevMode && options.environmentInjector && options.ngModuleRef) {
                throwError(`Cannot pass both environmentInjector and ngModuleRef options to createComponent().`);
            }
            index = options.index;
            injector = options.injector;
            projectableNodes = options.projectableNodes;
            environmentInjector = options.environmentInjector || options.ngModuleRef;
        }
        const componentFactory = isComponentFactory
            ? componentFactoryOrType
            : new R3ComponentFactory(getComponentDef(componentFactoryOrType));
        const contextInjector = injector || this.parentInjector;
        // If an `NgModuleRef` is not provided explicitly, try retrieving it from the DI tree.
        if (!environmentInjector && componentFactory.ngModule == null) {
            // For the `ComponentFactory` case, entering this logic is very unlikely, since we expect that
            // an instance of a `ComponentFactory`, resolved via `ComponentFactoryResolver` would have an
            // `ngModule` field. This is possible in some test scenarios and potentially in some JIT-based
            // use-cases. For the `ComponentFactory` case we preserve backwards-compatibility and try
            // using a provided injector first, then fall back to the parent injector of this
            // `ViewContainerRef` instance.
            //
            // For the factory-less case, it's critical to establish a connection with the module
            // injector tree (by retrieving an instance of an `NgModuleRef` and accessing its injector),
            // so that a component can use DI tokens provided in MgModules. For this reason, we can not
            // rely on the provided injector, since it might be detached from the DI tree (for example, if
            // it was created via `Injector.create` without specifying a parent injector, or if an
            // injector is retrieved from an `NgModuleRef` created via `createNgModule` using an
            // NgModule outside of a module tree). Instead, we always use `ViewContainerRef`'s parent
            // injector, which is normally connected to the DI tree, which includes module injector
            // subtree.
            const _injector = isComponentFactory ? contextInjector : this.parentInjector;
            // DO NOT REFACTOR. The code here used to have a `injector.get(NgModuleRef, null) ||
            // undefined` expression which seems to cause internal google apps to fail. This is documented
            // in the following internal bug issue: go/b/142967802
            const result = _injector.get(EnvironmentInjector, null);
            if (result) {
                environmentInjector = result;
            }
        }
        const componentDef = getComponentDef(componentFactory.componentType ?? {});
        const dehydratedView = findMatchingDehydratedView(this._lContainer, componentDef?.id ?? null);
        const rNode = dehydratedView?.firstChild ?? null;
        const componentRef = componentFactory.create(contextInjector, projectableNodes, rNode, environmentInjector);
        this.insertImpl(componentRef.hostView, index, shouldAddViewToDom(this._hostTNode, dehydratedView));
        return componentRef;
    }
    insert(viewRef, index) {
        return this.insertImpl(viewRef, index, true);
    }
    insertImpl(viewRef, index, addToDOM) {
        const lView = viewRef._lView;
        if (ngDevMode && viewRef.destroyed) {
            throw new Error('Cannot insert a destroyed View in a ViewContainer!');
        }
        if (viewAttachedToContainer(lView)) {
            // If view is already attached, detach it first so we clean up references appropriately.
            const prevIdx = this.indexOf(viewRef);
            // A view might be attached either to this or a different container. The `prevIdx` for
            // those cases will be:
            // equal to -1 for views attached to this ViewContainerRef
            // >= 0 for views attached to a different ViewContainerRef
            if (prevIdx !== -1) {
                this.detach(prevIdx);
            }
            else {
                const prevLContainer = lView[PARENT];
                ngDevMode &&
                    assertEqual(isLContainer(prevLContainer), true, 'An attached view should have its PARENT point to a container.');
                // We need to re-create a R3ViewContainerRef instance since those are not stored on
                // LView (nor anywhere else).
                const prevVCRef = new R3ViewContainerRef(prevLContainer, prevLContainer[T_HOST], prevLContainer[PARENT]);
                prevVCRef.detach(prevVCRef.indexOf(viewRef));
            }
        }
        // Logical operation of adding `LView` to `LContainer`
        const adjustedIdx = this._adjustIndex(index);
        const lContainer = this._lContainer;
        addLViewToLContainer(lContainer, lView, adjustedIdx, addToDOM);
        viewRef.attachToViewContainerRef();
        addToArray(getOrCreateViewRefs(lContainer), adjustedIdx, viewRef);
        return viewRef;
    }
    move(viewRef, newIndex) {
        if (ngDevMode && viewRef.destroyed) {
            throw new Error('Cannot move a destroyed View in a ViewContainer!');
        }
        return this.insert(viewRef, newIndex);
    }
    indexOf(viewRef) {
        const viewRefsArr = getViewRefs(this._lContainer);
        return viewRefsArr !== null ? viewRefsArr.indexOf(viewRef) : -1;
    }
    remove(index) {
        const adjustedIdx = this._adjustIndex(index, -1);
        const detachedView = detachView(this._lContainer, adjustedIdx);
        if (detachedView) {
            // Before destroying the view, remove it from the container's array of `ViewRef`s.
            // This ensures the view container length is updated before calling
            // `destroyLView`, which could recursively call view container methods that
            // rely on an accurate container length.
            // (e.g. a method on this view container being called by a child directive's OnDestroy
            // lifecycle hook)
            removeFromArray(getOrCreateViewRefs(this._lContainer), adjustedIdx);
            destroyLView(detachedView[TVIEW], detachedView);
        }
    }
    detach(index) {
        const adjustedIdx = this._adjustIndex(index, -1);
        const view = detachView(this._lContainer, adjustedIdx);
        const wasDetached = view && removeFromArray(getOrCreateViewRefs(this._lContainer), adjustedIdx) != null;
        return wasDetached ? new R3ViewRef(view) : null;
    }
    _adjustIndex(index, shift = 0) {
        if (index == null) {
            return this.length + shift;
        }
        if (ngDevMode) {
            assertGreaterThan(index, -1, `ViewRef index must be positive, got ${index}`);
            // +1 because it's legal to insert at the end.
            assertLessThan(index, this.length + 1 + shift, 'index');
        }
        return index;
    }
};
function getViewRefs(lContainer) {
    return lContainer[VIEW_REFS];
}
function getOrCreateViewRefs(lContainer) {
    return (lContainer[VIEW_REFS] || (lContainer[VIEW_REFS] = []));
}
/**
 * Creates a ViewContainerRef and stores it on the injector.
 *
 * @param hostTNode The node that is requesting a ViewContainerRef
 * @param hostLView The view to which the node belongs
 * @returns The ViewContainerRef instance to use
 */
export function createContainerRef(hostTNode, hostLView) {
    ngDevMode && assertTNodeType(hostTNode, 12 /* TNodeType.AnyContainer */ | 3 /* TNodeType.AnyRNode */);
    let lContainer;
    const slotValue = hostLView[hostTNode.index];
    if (isLContainer(slotValue)) {
        // If the host is a container, we don't need to create a new LContainer
        lContainer = slotValue;
    }
    else {
        // An LContainer anchor can not be `null`, but we set it here temporarily
        // and update to the actual value later in this function (see
        // `_locateOrCreateAnchorNode`).
        lContainer = createLContainer(slotValue, hostLView, null, hostTNode);
        hostLView[hostTNode.index] = lContainer;
        addToViewTree(hostLView, lContainer);
    }
    _locateOrCreateAnchorNode(lContainer, hostLView, hostTNode, slotValue);
    return new R3ViewContainerRef(lContainer, hostTNode, hostLView);
}
/**
 * Creates and inserts a comment node that acts as an anchor for a view container.
 *
 * If the host is a regular element, we have to insert a comment node manually which will
 * be used as an anchor when inserting elements. In this specific case we use low-level DOM
 * manipulation to insert it.
 */
function insertAnchorNode(hostLView, hostTNode) {
    const renderer = hostLView[RENDERER];
    ngDevMode && ngDevMode.rendererCreateComment++;
    const commentNode = renderer.createComment(ngDevMode ? 'container' : '');
    const hostNative = getNativeByTNode(hostTNode, hostLView);
    const parentOfHostNative = nativeParentNode(renderer, hostNative);
    nativeInsertBefore(renderer, parentOfHostNative, commentNode, nativeNextSibling(renderer, hostNative), false);
    return commentNode;
}
let _locateOrCreateAnchorNode = createAnchorNode;
let _populateDehydratedViewsInLContainer = () => false; // noop by default
/**
 * Looks up dehydrated views that belong to a given LContainer and populates
 * this information into the `LContainer[DEHYDRATED_VIEWS]` slot. When running
 * in client-only mode, this function is a noop.
 *
 * @param lContainer LContainer that should be populated.
 * @param tNode Corresponding TNode.
 * @param hostLView LView that hosts LContainer.
 * @returns a boolean flag that indicates whether a populating operation
 *   was successful. The operation might be unsuccessful in case is has completed
 *   previously, we are rendering in client-only mode or this content is located
 *   in a skip hydration section.
 */
export function populateDehydratedViewsInLContainer(lContainer, tNode, hostLView) {
    return _populateDehydratedViewsInLContainer(lContainer, tNode, hostLView);
}
/**
 * Regular creation mode: an anchor is created and
 * assigned to the `lContainer[NATIVE]` slot.
 */
function createAnchorNode(lContainer, hostLView, hostTNode, slotValue) {
    // We already have a native element (anchor) set, return.
    if (lContainer[NATIVE])
        return;
    let commentNode;
    // If the host is an element container, the native host element is guaranteed to be a
    // comment and we can reuse that comment as anchor element for the new LContainer.
    // The comment node in question is already part of the DOM structure so we don't need to append
    // it again.
    if (hostTNode.type & 8 /* TNodeType.ElementContainer */) {
        commentNode = unwrapRNode(slotValue);
    }
    else {
        commentNode = insertAnchorNode(hostLView, hostTNode);
    }
    lContainer[NATIVE] = commentNode;
}
/**
 * Hydration logic that looks up all dehydrated views in this container
 * and puts them into `lContainer[DEHYDRATED_VIEWS]` slot.
 *
 * @returns a boolean flag that indicates whether a populating operation
 *   was successful. The operation might be unsuccessful in case is has completed
 *   previously, we are rendering in client-only mode or this content is located
 *   in a skip hydration section.
 */
function populateDehydratedViewsInLContainerImpl(lContainer, tNode, hostLView) {
    // We already have a native element (anchor) set and the process
    // of finding dehydrated views happened (so the `lContainer[DEHYDRATED_VIEWS]`
    // is not null), exit early.
    if (lContainer[NATIVE] && lContainer[DEHYDRATED_VIEWS]) {
        return true;
    }
    const hydrationInfo = hostLView[HYDRATION];
    const noOffsetIndex = tNode.index - HEADER_OFFSET;
    const isNodeCreationMode = !hydrationInfo ||
        isInSkipHydrationBlock(tNode) ||
        isDisconnectedNode(hydrationInfo, noOffsetIndex);
    // Regular creation mode.
    if (isNodeCreationMode) {
        return false;
    }
    // Hydration mode, looking up an anchor node and dehydrated views in DOM.
    const currentRNode = getSegmentHead(hydrationInfo, noOffsetIndex);
    const serializedViews = hydrationInfo.data[CONTAINERS]?.[noOffsetIndex];
    ngDevMode &&
        assertDefined(serializedViews, 'Unexpected state: no hydration info available for a given TNode, ' +
            'which represents a view container.');
    const [commentNode, dehydratedViews] = locateDehydratedViewsInContainer(currentRNode, serializedViews);
    if (ngDevMode) {
        validateMatchingNode(commentNode, Node.COMMENT_NODE, null, hostLView, tNode, true);
        // Do not throw in case this node is already claimed (thus `false` as a second
        // argument). If this container is created based on an `<ng-template>`, the comment
        // node would be already claimed from the `template` instruction. If an element acts
        // as an anchor (e.g. <div #vcRef>), a separate comment node would be created/located,
        // so we need to claim it here.
        markRNodeAsClaimedByHydration(commentNode, false);
    }
    lContainer[NATIVE] = commentNode;
    lContainer[DEHYDRATED_VIEWS] = dehydratedViews;
    return true;
}
function locateOrCreateAnchorNode(lContainer, hostLView, hostTNode, slotValue) {
    if (!_populateDehydratedViewsInLContainer(lContainer, hostTNode, hostLView)) {
        // Populating dehydrated views operation returned `false`, which indicates
        // that the logic was running in client-only mode, this an anchor comment
        // node should be created for this container.
        createAnchorNode(lContainer, hostLView, hostTNode, slotValue);
    }
}
export function enableLocateOrCreateContainerRefImpl() {
    _locateOrCreateAnchorNode = locateOrCreateAnchorNode;
    _populateDehydratedViewsInLContainer = populateDehydratedViewsInLContainerImpl;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld19jb250YWluZXJfcmVmLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS9zcmMvbGlua2VyL3ZpZXdfY29udGFpbmVyX3JlZi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFHSCxPQUFPLEVBQUMsbUJBQW1CLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUN0RCxPQUFPLEVBQUMsb0JBQW9CLEVBQUMsTUFBTSw2QkFBNkIsQ0FBQztBQUNqRSxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0seUJBQXlCLENBQUM7QUFDbkQsT0FBTyxFQUFDLHNCQUFzQixFQUFDLE1BQU0sNkJBQTZCLENBQUM7QUFDbkUsT0FBTyxFQUNMLGNBQWMsRUFDZCxrQkFBa0IsRUFDbEIsNkJBQTZCLEdBQzlCLE1BQU0sb0JBQW9CLENBQUM7QUFDNUIsT0FBTyxFQUFDLDBCQUEwQixFQUFFLGdDQUFnQyxFQUFDLE1BQU0sb0JBQW9CLENBQUM7QUFDaEcsT0FBTyxFQUFDLE1BQU0sRUFBTyxNQUFNLG1CQUFtQixDQUFDO0FBQy9DLE9BQU8sRUFBQyxrQkFBa0IsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQ3JELE9BQU8sRUFBQyxnQkFBZ0IsSUFBSSxrQkFBa0IsRUFBQyxNQUFNLDBCQUEwQixDQUFDO0FBQ2hGLE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUN0RCxPQUFPLEVBQUMseUJBQXlCLEVBQUUsWUFBWSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3RFLE9BQU8sRUFBQyxhQUFhLEVBQUUsZ0JBQWdCLEVBQUMsTUFBTSxnQ0FBZ0MsQ0FBQztBQUMvRSxPQUFPLEVBQ0wsdUJBQXVCLEVBQ3ZCLGdCQUFnQixFQUVoQixNQUFNLEVBQ04sU0FBUyxHQUNWLE1BQU0saUNBQWlDLENBQUM7QUFXekMsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLG1DQUFtQyxDQUFD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O1FBQy9CLDZCQUE2QixDQUFDLFdBQVcsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNwRCxDQUFDO0lBRUQsVUFBVSxDQUFDLE1BQU0sQ0FBQyxHQUFHLFdBQXVCLENBQUM7SUFDN0MsVUFBVSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsZUFBZSxDQUFDO0lBRS9DLE9BQU8sSUFBSSxDQUFDO0FBQ2QsQ0FBQztBQUVELFNBQVMsd0JBQXdCLENBQy9CLFVBQXNCLEVBQ3RCLFNBQWdCLEVBQ2hCLFNBQWdCLEVBQ2hCLFNBQWM7SUFFZCxJQUFJLENBQUMsb0NBQW9DLENBQUMsVUFBVSxFQUFFLFNBQVMsRUFBRSxTQUFTLENBQUMsRUFBRSxDQUFDO1FBQzVFLDBFQUEwRTtRQUMxRSx5RUFBeUU7UUFDekUsNkNBQTZDO1FBQzdDLGdCQUFnQixDQUFDLFVBQVUsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQ2hFLENBQUM7QUFDSCxDQUFDO0FBRUQsTUFBTSxVQUFVLG9DQUFvQztJQUNsRCx5QkFBeUIsR0FBRyx3QkFBd0IsQ0FBQztJQUNyRCxvQ0FBb0MsR0FBRyx1Q0FBdUMsQ0FBQztBQUNqRixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuZGV2L2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdG9yfSBmcm9tICcuLi9kaS9pbmplY3Rvcic7XG5pbXBvcnQge0Vudmlyb25tZW50SW5qZWN0b3J9IGZyb20gJy4uL2RpL3IzX2luamVjdG9yJztcbmltcG9ydCB7dmFsaWRhdGVNYXRjaGluZ05vZGV9IGZyb20gJy4uL2h5ZHJhdGlvbi9lcnJvcl9oYW5kbGluZyc7XG5pbXBvcnQge0NPTlRBSU5FUlN9IGZyb20gJy4uL2h5ZHJhdGlvbi9pbnRlcmZhY2VzJztcbmltcG9ydCB7aXNJblNraXBIeWRyYXRpb25CbG9ja30gZnJvbSAnLi4vaHlkcmF0aW9uL3NraXBfaHlkcmF0aW9uJztcbmltcG9ydCB7XG4gIGdldFNlZ21lbnRIZWFkLFxuICBpc0Rpc2Nvbm5lY3RlZE5vZGUsXG4gIG1hcmtSTm9kZUFzQ2xhaW1lZEJ5SHlkcmF0aW9uLFxufSBmcm9tICcuLi9oeWRyYXRpb24vdXRpbHMnO1xuaW1wb3J0IHtmaW5kTWF0Y2hpbmdEZWh5ZHJhdGVkVmlldywgbG9jYXRlRGVoeWRyYXRlZFZpZXdzSW5Db250YWluZXJ9IGZyb20gJy4uL2h5ZHJhdGlvbi92aWV3cyc7XG5pbXBvcnQge2lzVHlwZSwgVHlwZX0gZnJvbSAnLi4vaW50ZXJmYWNlL3R5cGUnO1xuaW1wb3J0IHthc3NlcnROb2RlSW5qZWN0b3J9IGZyb20gJy4uL3JlbmRlcjMvYXNzZXJ0JztcbmltcG9ydCB7Q29tcG9uZW50RmFjdG9yeSBhcyBSM0NvbXBvbmVudEZhY3Rvcnl9IGZyb20gJy4uL3JlbmRlcjMvY29tcG9uZW50X3JlZic7XG5pbXBvcnQge2dldENvbXBvbmVudERlZn0gZnJvbSAnLi4vcmVuZGVyMy9kZWZpbml0aW9uJztcbmltcG9ydCB7Z2V0UGFyZW50SW5qZWN0b3JMb2NhdGlvbiwgTm9kZUluamVjdG9yfSBmcm9tICcuLi9yZW5kZXIzL2RpJztcbmltcG9ydCB7YWRkVG9WaWV3VHJlZSwgY3JlYXRlTENvbnRhaW5lcn0gZnJvbSAnLi4vcmVuZGVyMy9pbnN0cnVjdGlvbnMvc2hhcmVkJztcbmltcG9ydCB7XG4gIENPTlRBSU5FUl9IRUFERVJfT0ZGU0VULFxuICBERUhZRFJBVEVEX1ZJRVdTLFxuICBMQ29udGFpbmVyLFxuICBOQVRJVkUsXG4gIFZJRVdfUkVGUyxcbn0gZnJvbSAnLi4vcmVuZGVyMy9pbnRlcmZhY2VzL2NvbnRhaW5lcic7XG5pbXBvcnQge05vZGVJbmplY3Rvck9mZnNldH0gZnJvbSAnLi4vcmVuZGVyMy9pbnRlcmZhY2VzL2luamVjdG9yJztcbmltcG9ydCB7XG4gIFRDb250YWluZXJOb2RlLFxuICBURGlyZWN0aXZlSG9zdE5vZGUsXG4gIFRFbGVtZW50Q29udGFpbmVyTm9kZSxcbiAgVEVsZW1lbnROb2RlLFxuICBUTm9kZSxcbiAgVE5vZGVUeXBlLFxufSBmcm9tICcuLi9yZW5kZXIzL2ludGVyZmFjZXMvbm9kZSc7XG5pbXBvcnQge1JDb21tZW50LCBSTm9kZX0gZnJvbSAnLi4vcmVuZGVyMy9pbnRlcmZhY2VzL3JlbmRlcmVyX2RvbSc7XG5pbXBvcnQge2lzTENvbnRhaW5lcn0gZnJvbSAnLi4vcmVuZGVyMy9pbnRlcmZhY2VzL3R5cGVfY2hlY2tzJztcbmltcG9ydCB7XG4gIEhFQURFUl9PRkZTRVQsXG4gIEhZRFJBVElPTixcbiAgTFZpZXcsXG4gIFBBUkVOVCxcbiAgUkVOREVSRVIsXG4gIFRfSE9TVCxcbiAgVFZJRVcsXG59IGZyb20gJy4uL3JlbmRlcjMvaW50ZXJmYWNlcy92aWV3JztcbmltcG9ydCB7YXNzZXJ0VE5vZGVUeXBlfSBmcm9tICcuLi9yZW5kZXIzL25vZGVfYXNzZXJ0JztcbmltcG9ydCB7XG4gIGRlc3Ryb3lMVmlldyxcbiAgZGV0YWNoVmlldyxcbiAgbmF0aXZlSW5zZXJ0QmVmb3JlLFxuICBuYXRpdmVOZXh0U2libGluZyxcbiAgbmF0aXZlUGFyZW50Tm9kZSxcbn0gZnJvbSAnLi4vcmVuZGVyMy9ub2RlX21hbmlwdWxhdGlvbic7XG5pbXBvcnQge2dldEN1cnJlbnRUTm9kZSwgZ2V0TFZpZXd9IGZyb20gJy4uL3JlbmRlcjMvc3RhdGUnO1xuaW1wb3J0IHtcbiAgZ2V0UGFyZW50SW5qZWN0b3JJbmRleCxcbiAgZ2V0UGFyZW50SW5qZWN0b3JWaWV3LFxuICBoYXNQYXJlbnRJbmplY3Rvcixcbn0gZnJvbSAnLi4vcmVuZGVyMy91dGlsL2luamVjdG9yX3V0aWxzJztcbmltcG9ydCB7Z2V0TmF0aXZlQnlUTm9kZSwgdW53cmFwUk5vZGUsIHZpZXdBdHRhY2hlZFRvQ29udGFpbmVyfSBmcm9tICcuLi9yZW5kZXIzL3V0aWwvdmlld191dGlscyc7XG5pbXBvcnQge2FkZExWaWV3VG9MQ29udGFpbmVyLCBzaG91bGRBZGRWaWV3VG9Eb219IGZyb20gJy4uL3JlbmRlcjMvdmlld19tYW5pcHVsYXRpb24nO1xuaW1wb3J0IHtWaWV3UmVmIGFzIFIzVmlld1JlZn0gZnJvbSAnLi4vcmVuZGVyMy92aWV3X3JlZic7XG5pbXBvcnQge2FkZFRvQXJyYXksIHJlbW92ZUZyb21BcnJheX0gZnJvbSAnLi4vdXRpbC9hcnJheV91dGlscyc7XG5pbXBvcnQge1xuICBhc3NlcnREZWZpbmVkLFxuICBhc3NlcnRFcXVhbCxcbiAgYXNzZXJ0R3JlYXRlclRoYW4sXG4gIGFzc2VydExlc3NUaGFuLFxuICB0aHJvd0Vycm9yLFxufSBmcm9tICcuLi91dGlsL2Fzc2VydCc7XG5cbmltcG9ydCB7Q29tcG9uZW50RmFjdG9yeSwgQ29tcG9uZW50UmVmfSBmcm9tICcuL2NvbXBvbmVudF9mYWN0b3J5JztcbmltcG9ydCB7Y3JlYXRlRWxlbWVudFJlZiwgRWxlbWVudFJlZn0gZnJvbSAnLi9lbGVtZW50X3JlZic7XG5pbXBvcnQge05nTW9kdWxlUmVmfSBmcm9tICcuL25nX21vZHVsZV9mYWN0b3J5JztcbmltcG9ydCB7VGVtcGxhdGVSZWZ9IGZyb20gJy4vdGVtcGxhdGVfcmVmJztcbmltcG9ydCB7RW1iZWRkZWRWaWV3UmVmLCBWaWV3UmVmfSBmcm9tICcuL3ZpZXdfcmVmJztcblxuLyoqXG4gKiBSZXByZXNlbnRzIGEgY29udGFpbmVyIHdoZXJlIG9uZSBvciBtb3JlIHZpZXdzIGNhbiBiZSBhdHRhY2hlZCB0byBhIGNvbXBvbmVudC5cbiAqXG4gKiBDYW4gY29udGFpbiAqaG9zdCB2aWV3cyogKGNyZWF0ZWQgYnkgaW5zdGFudGlhdGluZyBhXG4gKiBjb21wb25lbnQgd2l0aCB0aGUgYGNyZWF0ZUNvbXBvbmVudCgpYCBtZXRob2QpLCBhbmQgKmVtYmVkZGVkIHZpZXdzKlxuICogKGNyZWF0ZWQgYnkgaW5zdGFudGlhdGluZyBhIGBUZW1wbGF0ZVJlZmAgd2l0aCB0aGUgYGNyZWF0ZUVtYmVkZGVkVmlldygpYCBtZXRob2QpLlxuICpcbiAqIEEgdmlldyBjb250YWluZXIgaW5zdGFuY2UgY2FuIGNvbnRhaW4gb3RoZXIgdmlldyBjb250YWluZXJzLFxuICogY3JlYXRpbmcgYSB2aWV3IGhpZXJhcmNoeS5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICpcbiAqIFRoZSBleGFtcGxlIGJlbG93IGRlbW9uc3RyYXRlcyBob3cgdGhlIGBjcmVhdGVDb21wb25lbnRgIGZ1bmN0aW9uIGNhbiBiZSB1c2VkXG4gKiB0byBjcmVhdGUgYW4gaW5zdGFuY2Ugb2YgYSBDb21wb25lbnRSZWYgZHluYW1pY2FsbHkgYW5kIGF0dGFjaCBpdCB0byBhbiBBcHBsaWNhdGlvblJlZixcbiAqIHNvIHRoYXQgaXQgZ2V0cyBpbmNsdWRlZCBpbnRvIGNoYW5nZSBkZXRlY3Rpb24gY3ljbGVzLlxuICpcbiAqIE5vdGU6IHRoZSBleGFtcGxlIHVzZXMgc3RhbmRhbG9uZSBjb21wb25lbnRzLCBidXQgdGhlIGZ1bmN0aW9uIGNhbiBhbHNvIGJlIHVzZWQgZm9yXG4gKiBub24tc3RhbmRhbG9uZSBjb21wb25lbnRzIChkZWNsYXJlZCBpbiBhbiBOZ01vZHVsZSkgYXMgd2VsbC5cbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc3RhbmRhbG9uZTogdHJ1ZSxcbiAqICAgc2VsZWN0b3I6ICdkeW5hbWljJyxcbiAqICAgdGVtcGxhdGU6IGA8c3Bhbj5UaGlzIGlzIGEgY29udGVudCBvZiBhIGR5bmFtaWMgY29tcG9uZW50Ljwvc3Bhbj5gLFxuICogfSlcbiAqIGNsYXNzIER5bmFtaWNDb21wb25lbnQge1xuICogICB2Y3IgPSBpbmplY3QoVmlld0NvbnRhaW5lclJlZik7XG4gKiB9XG4gKlxuICogQENvbXBvbmVudCh7XG4gKiAgIHN0YW5kYWxvbmU6IHRydWUsXG4gKiAgIHNlbGVjdG9yOiAnYXBwJyxcbiAqICAgdGVtcGxhdGU6IGA8bWFpbj5IaSEgVGhpcyBpcyB0aGUgbWFpbiBjb250ZW50LjwvbWFpbj5gLFxuICogfSlcbiAqIGNsYXNzIEFwcENvbXBvbmVudCB7XG4gKiAgIHZjciA9IGluamVjdChWaWV3Q29udGFpbmVyUmVmKTtcbiAqXG4gKiAgIG5nQWZ0ZXJWaWV3SW5pdCgpIHtcbiAqICAgICBjb25zdCBjb21wUmVmID0gdGhpcy52Y3IuY3JlYXRlQ29tcG9uZW50KER5bmFtaWNDb21wb25lbnQpO1xuICogICAgIGNvbXBSZWYuY2hhbmdlRGV0ZWN0b3JSZWYuZGV0ZWN0Q2hhbmdlcygpO1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBAc2VlIHtAbGluayBDb21wb25lbnRSZWZ9XG4gKiBAc2VlIHtAbGluayBFbWJlZGRlZFZpZXdSZWZ9XG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgVmlld0NvbnRhaW5lclJlZiB7XG4gIC8qKlxuICAgKiBBbmNob3IgZWxlbWVudCB0aGF0IHNwZWNpZmllcyB0aGUgbG9jYXRpb24gb2YgdGhpcyBjb250YWluZXIgaW4gdGhlIGNvbnRhaW5pbmcgdmlldy5cbiAgICogRWFjaCB2aWV3IGNvbnRhaW5lciBjYW4gaGF2ZSBvbmx5IG9uZSBhbmNob3IgZWxlbWVudCwgYW5kIGVhY2ggYW5jaG9yIGVsZW1lbnRcbiAgICogY2FuIGhhdmUgb25seSBhIHNpbmdsZSB2aWV3IGNvbnRhaW5lci5cbiAgICpcbiAgICogUm9vdCBlbGVtZW50cyBvZiB2aWV3cyBhdHRhY2hlZCB0byB0aGlzIGNvbnRhaW5lciBiZWNvbWUgc2libGluZ3Mgb2YgdGhlIGFuY2hvciBlbGVtZW50IGluXG4gICAqIHRoZSByZW5kZXJlZCB2aWV3LlxuICAgKlxuICAgKiBBY2Nlc3MgdGhlIGBWaWV3Q29udGFpbmVyUmVmYCBvZiBhbiBlbGVtZW50IGJ5IHBsYWNpbmcgYSBgRGlyZWN0aXZlYCBpbmplY3RlZFxuICAgKiB3aXRoIGBWaWV3Q29udGFpbmVyUmVmYCBvbiB0aGUgZWxlbWVudCwgb3IgdXNlIGEgYFZpZXdDaGlsZGAgcXVlcnkuXG4gICAqXG4gICAqIDwhLS0gVE9ETzogcmVuYW1lIHRvIGFuY2hvckVsZW1lbnQgLS0+XG4gICAqL1xuICBhYnN0cmFjdCBnZXQgZWxlbWVudCgpOiBFbGVtZW50UmVmO1xuXG4gIC8qKlxuICAgKiBUaGUgZGVwZW5kZW5jeSBpbmplY3RvciBmb3IgdGhpcyB2aWV3IGNvbnRhaW5lci5cbiAgICovXG4gIGFic3RyYWN0IGdldCBpbmplY3RvcigpOiBJbmplY3RvcjtcblxuICAvKiogQGRlcHJlY2F0ZWQgTm8gcmVwbGFjZW1lbnQgKi9cbiAgYWJzdHJhY3QgZ2V0IHBhcmVudEluamVjdG9yKCk6IEluamVjdG9yO1xuXG4gIC8qKlxuICAgKiBEZXN0cm95cyBhbGwgdmlld3MgaW4gdGhpcyBjb250YWluZXIuXG4gICAqL1xuICBhYnN0cmFjdCBjbGVhcigpOiB2b2lkO1xuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZXMgYSB2aWV3IGZyb20gdGhpcyBjb250YWluZXIuXG4gICAqIEBwYXJhbSBpbmRleCBUaGUgMC1iYXNlZCBpbmRleCBvZiB0aGUgdmlldyB0byByZXRyaWV2ZS5cbiAgICogQHJldHVybnMgVGhlIGBWaWV3UmVmYCBpbnN0YW5jZSwgb3IgbnVsbCBpZiB0aGUgaW5kZXggaXMgb3V0IG9mIHJhbmdlLlxuICAgKi9cbiAgYWJzdHJhY3QgZ2V0KGluZGV4OiBudW1iZXIpOiBWaWV3UmVmIHwgbnVsbDtcblxuICAvKipcbiAgICogUmVwb3J0cyBob3cgbWFueSB2aWV3cyBhcmUgY3VycmVudGx5IGF0dGFjaGVkIHRvIHRoaXMgY29udGFpbmVyLlxuICAgKiBAcmV0dXJucyBUaGUgbnVtYmVyIG9mIHZpZXdzLlxuICAgKi9cbiAgYWJzdHJhY3QgZ2V0IGxlbmd0aCgpOiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIEluc3RhbnRpYXRlcyBhbiBlbWJlZGRlZCB2aWV3IGFuZCBpbnNlcnRzIGl0XG4gICAqIGludG8gdGhpcyBjb250YWluZXIuXG4gICAqIEBwYXJhbSB0ZW1wbGF0ZVJlZiBUaGUgSFRNTCB0ZW1wbGF0ZSB0aGF0IGRlZmluZXMgdGhlIHZpZXcuXG4gICAqIEBwYXJhbSBjb250ZXh0IFRoZSBkYXRhLWJpbmRpbmcgY29udGV4dCBvZiB0aGUgZW1iZWRkZWQgdmlldywgYXMgZGVjbGFyZWRcbiAgICogaW4gdGhlIGA8bmctdGVtcGxhdGU+YCB1c2FnZS5cbiAgICogQHBhcmFtIG9wdGlvbnMgRXh0cmEgY29uZmlndXJhdGlvbiBmb3IgdGhlIGNyZWF0ZWQgdmlldy4gSW5jbHVkZXM6XG4gICAqICAqIGluZGV4OiBUaGUgMC1iYXNlZCBpbmRleCBhdCB3aGljaCB0byBpbnNlcnQgdGhlIG5ldyB2aWV3IGludG8gdGhpcyBjb250YWluZXIuXG4gICAqICAgICAgICAgICBJZiBub3Qgc3BlY2lmaWVkLCBhcHBlbmRzIHRoZSBuZXcgdmlldyBhcyB0aGUgbGFzdCBlbnRyeS5cbiAgICogICogaW5qZWN0b3I6IEluamVjdG9yIHRvIGJlIHVzZWQgd2l0aGluIHRoZSBlbWJlZGRlZCB2aWV3LlxuICAgKlxuICAgKiBAcmV0dXJucyBUaGUgYFZpZXdSZWZgIGluc3RhbmNlIGZvciB0aGUgbmV3bHkgY3JlYXRlZCB2aWV3LlxuICAgKi9cbiAgYWJzdHJhY3QgY3JlYXRlRW1iZWRkZWRWaWV3PEM+KFxuICAgIHRlbXBsYXRlUmVmOiBUZW1wbGF0ZVJlZjxDPixcbiAgICBjb250ZXh0PzogQyxcbiAgICBvcHRpb25zPzoge1xuICAgICAgaW5kZXg/OiBudW1iZXI7XG4gICAgICBpbmplY3Rvcj86IEluamVjdG9yO1xuICAgIH0sXG4gICk6IEVtYmVkZGVkVmlld1JlZjxDPjtcblxuICAvKipcbiAgICogSW5zdGFudGlhdGVzIGFuIGVtYmVkZGVkIHZpZXcgYW5kIGluc2VydHMgaXRcbiAgICogaW50byB0aGlzIGNvbnRhaW5lci5cbiAgICogQHBhcmFtIHRlbXBsYXRlUmVmIFRoZSBIVE1MIHRlbXBsYXRlIHRoYXQgZGVmaW5lcyB0aGUgdmlldy5cbiAgICogQHBhcmFtIGNvbnRleHQgVGhlIGRhdGEtYmluZGluZyBjb250ZXh0IG9mIHRoZSBlbWJlZGRlZCB2aWV3LCBhcyBkZWNsYXJlZFxuICAgKiBpbiB0aGUgYDxuZy10ZW1wbGF0ZT5gIHVzYWdlLlxuICAgKiBAcGFyYW0gaW5kZXggVGhlIDAtYmFzZWQgaW5kZXggYXQgd2hpY2ggdG8gaW5zZXJ0IHRoZSBuZXcgdmlldyBpbnRvIHRoaXMgY29udGFpbmVyLlxuICAgKiBJZiBub3Qgc3BlY2lmaWVkLCBhcHBlbmRzIHRoZSBuZXcgdmlldyBhcyB0aGUgbGFzdCBlbnRyeS5cbiAgICpcbiAgICogQHJldHVybnMgVGhlIGBWaWV3UmVmYCBpbnN0YW5jZSBmb3IgdGhlIG5ld2x5IGNyZWF0ZWQgdmlldy5cbiAgICovXG4gIGFic3RyYWN0IGNyZWF0ZUVtYmVkZGVkVmlldzxDPihcbiAgICB0ZW1wbGF0ZVJlZjogVGVtcGxhdGVSZWY8Qz4sXG4gICAgY29udGV4dD86IEMsXG4gICAgaW5kZXg/OiBudW1iZXIsXG4gICk6IEVtYmVkZGVkVmlld1JlZjxDPjtcblxuICAvKipcbiAgICogSW5zdGFudGlhdGVzIGEgc2luZ2xlIGNvbXBvbmVudCBhbmQgaW5zZXJ0cyBpdHMgaG9zdCB2aWV3IGludG8gdGhpcyBjb250YWluZXIuXG4gICAqXG4gICAqIEBwYXJhbSBjb21wb25lbnRUeXBlIENvbXBvbmVudCBUeXBlIHRvIHVzZS5cbiAgICogQHBhcmFtIG9wdGlvbnMgQW4gb2JqZWN0IHRoYXQgY29udGFpbnMgZXh0cmEgcGFyYW1ldGVyczpcbiAgICogICogaW5kZXg6IHRoZSBpbmRleCBhdCB3aGljaCB0byBpbnNlcnQgdGhlIG5ldyBjb21wb25lbnQncyBob3N0IHZpZXcgaW50byB0aGlzIGNvbnRhaW5lci5cbiAgICogICAgICAgICAgIElmIG5vdCBzcGVjaWZpZWQsIGFwcGVuZHMgdGhlIG5ldyB2aWV3IGFzIHRoZSBsYXN0IGVudHJ5LlxuICAgKiAgKiBpbmplY3RvcjogdGhlIGluamVjdG9yIHRvIHVzZSBhcyB0aGUgcGFyZW50IGZvciB0aGUgbmV3IGNvbXBvbmVudC5cbiAgICogICogbmdNb2R1bGVSZWY6IGFuIE5nTW9kdWxlUmVmIG9mIHRoZSBjb21wb25lbnQncyBOZ01vZHVsZSwgeW91IHNob3VsZCBhbG1vc3QgYWx3YXlzIHByb3ZpZGVcbiAgICogICAgICAgICAgICAgICAgIHRoaXMgdG8gZW5zdXJlIHRoYXQgYWxsIGV4cGVjdGVkIHByb3ZpZGVycyBhcmUgYXZhaWxhYmxlIGZvciB0aGUgY29tcG9uZW50XG4gICAqICAgICAgICAgICAgICAgICBpbnN0YW50aWF0aW9uLlxuICAgKiAgKiBlbnZpcm9ubWVudEluamVjdG9yOiBhbiBFbnZpcm9ubWVudEluamVjdG9yIHdoaWNoIHdpbGwgcHJvdmlkZSB0aGUgY29tcG9uZW50J3MgZW52aXJvbm1lbnQuXG4gICAqICAgICAgICAgICAgICAgICB5b3Ugc2hvdWxkIGFsbW9zdCBhbHdheXMgcHJvdmlkZSB0aGlzIHRvIGVuc3VyZSB0aGF0IGFsbCBleHBlY3RlZCBwcm92aWRlcnNcbiAgICogICAgICAgICAgICAgICAgIGFyZSBhdmFpbGFibGUgZm9yIHRoZSBjb21wb25lbnQgaW5zdGFudGlhdGlvbi4gVGhpcyBvcHRpb24gaXMgaW50ZW5kZWQgdG9cbiAgICogICAgICAgICAgICAgICAgIHJlcGxhY2UgdGhlIGBuZ01vZHVsZVJlZmAgcGFyYW1ldGVyLlxuICAgKiAgKiBwcm9qZWN0YWJsZU5vZGVzOiBsaXN0IG9mIERPTSBub2RlcyB0aGF0IHNob3VsZCBiZSBwcm9qZWN0ZWQgdGhyb3VnaFxuICAgKiAgICAgICAgICAgICAgICAgICAgICBbYDxuZy1jb250ZW50PmBdKGFwaS9jb3JlL25nLWNvbnRlbnQpIG9mIHRoZSBuZXcgY29tcG9uZW50IGluc3RhbmNlLlxuICAgKlxuICAgKiBAcmV0dXJucyBUaGUgbmV3IGBDb21wb25lbnRSZWZgIHdoaWNoIGNvbnRhaW5zIHRoZSBjb21wb25lbnQgaW5zdGFuY2UgYW5kIHRoZSBob3N0IHZpZXcuXG4gICAqL1xuICBhYnN0cmFjdCBjcmVhdGVDb21wb25lbnQ8Qz4oXG4gICAgY29tcG9uZW50VHlwZTogVHlwZTxDPixcbiAgICBvcHRpb25zPzoge1xuICAgICAgaW5kZXg/OiBudW1iZXI7XG4gICAgICBpbmplY3Rvcj86IEluamVjdG9yO1xuICAgICAgbmdNb2R1bGVSZWY/OiBOZ01vZHVsZVJlZjx1bmtub3duPjtcbiAgICAgIGVudmlyb25tZW50SW5qZWN0b3I/OiBFbnZpcm9ubWVudEluamVjdG9yIHwgTmdNb2R1bGVSZWY8dW5rbm93bj47XG4gICAgICBwcm9qZWN0YWJsZU5vZGVzPzogTm9kZVtdW107XG4gICAgfSxcbiAgKTogQ29tcG9uZW50UmVmPEM+O1xuXG4gIC8qKlxuICAgKiBJbnN0YW50aWF0ZXMgYSBzaW5nbGUgY29tcG9uZW50IGFuZCBpbnNlcnRzIGl0cyBob3N0IHZpZXcgaW50byB0aGlzIGNvbnRhaW5lci5cbiAgICpcbiAgICogQHBhcmFtIGNvbXBvbmVudEZhY3RvcnkgQ29tcG9uZW50IGZhY3RvcnkgdG8gdXNlLlxuICAgKiBAcGFyYW0gaW5kZXggVGhlIGluZGV4IGF0IHdoaWNoIHRvIGluc2VydCB0aGUgbmV3IGNvbXBvbmVudCdzIGhvc3QgdmlldyBpbnRvIHRoaXMgY29udGFpbmVyLlxuICAgKiBJZiBub3Qgc3BlY2lmaWVkLCBhcHBlbmRzIHRoZSBuZXcgdmlldyBhcyB0aGUgbGFzdCBlbnRyeS5cbiAgICogQHBhcmFtIGluamVjdG9yIFRoZSBpbmplY3RvciB0byB1c2UgYXMgdGhlIHBhcmVudCBmb3IgdGhlIG5ldyBjb21wb25lbnQuXG4gICAqIEBwYXJhbSBwcm9qZWN0YWJsZU5vZGVzIExpc3Qgb2YgRE9NIG5vZGVzIHRoYXQgc2hvdWxkIGJlIHByb2plY3RlZCB0aHJvdWdoXG4gICAqICAgICBbYDxuZy1jb250ZW50PmBdKGFwaS9jb3JlL25nLWNvbnRlbnQpIG9mIHRoZSBuZXcgY29tcG9uZW50IGluc3RhbmNlLlxuICAgKiBAcGFyYW0gbmdNb2R1bGVSZWYgQW4gaW5zdGFuY2Ugb2YgdGhlIE5nTW9kdWxlUmVmIHRoYXQgcmVwcmVzZW50IGFuIE5nTW9kdWxlLlxuICAgKiBUaGlzIGluZm9ybWF0aW9uIGlzIHVzZWQgdG8gcmV0cmlldmUgY29ycmVzcG9uZGluZyBOZ01vZHVsZSBpbmplY3Rvci5cbiAgICpcbiAgICogQHJldHVybnMgVGhlIG5ldyBgQ29tcG9uZW50UmVmYCB3aGljaCBjb250YWlucyB0aGUgY29tcG9uZW50IGluc3RhbmNlIGFuZCB0aGUgaG9zdCB2aWV3LlxuICAgKlxuICAgKiBAZGVwcmVjYXRlZCBBbmd1bGFyIG5vIGxvbmdlciByZXF1aXJlcyBjb21wb25lbnQgZmFjdG9yaWVzIHRvIGR5bmFtaWNhbGx5IGNyZWF0ZSBjb21wb25lbnRzLlxuICAgKiAgICAgVXNlIGRpZmZlcmVudCBzaWduYXR1cmUgb2YgdGhlIGBjcmVhdGVDb21wb25lbnRgIG1ldGhvZCwgd2hpY2ggYWxsb3dzIHBhc3NpbmdcbiAgICogICAgIENvbXBvbmVudCBjbGFzcyBkaXJlY3RseS5cbiAgICovXG4gIGFic3RyYWN0IGNyZWF0ZUNvbXBvbmVudDxDPihcbiAgICBjb21wb25lbnRGYWN0b3J5OiBDb21wb25lbnRGYWN0b3J5PEM+LFxuICAgIGluZGV4PzogbnVtYmVyLFxuICAgIGluamVjdG9yPzogSW5qZWN0b3IsXG4gICAgcHJvamVjdGFibGVOb2Rlcz86IGFueVtdW10sXG4gICAgZW52aXJvbm1lbnRJbmplY3Rvcj86IEVudmlyb25tZW50SW5qZWN0b3IgfCBOZ01vZHVsZVJlZjxhbnk+LFxuICApOiBDb21wb25lbnRSZWY8Qz47XG5cbiAgLyoqXG4gICAqIEluc2VydHMgYSB2aWV3IGludG8gdGhpcyBjb250YWluZXIuXG4gICAqIEBwYXJhbSB2aWV3UmVmIFRoZSB2aWV3IHRvIGluc2VydC5cbiAgICogQHBhcmFtIGluZGV4IFRoZSAwLWJhc2VkIGluZGV4IGF0IHdoaWNoIHRvIGluc2VydCB0aGUgdmlldy5cbiAgICogSWYgbm90IHNwZWNpZmllZCwgYXBwZW5kcyB0aGUgbmV3IHZpZXcgYXMgdGhlIGxhc3QgZW50cnkuXG4gICAqIEByZXR1cm5zIFRoZSBpbnNlcnRlZCBgVmlld1JlZmAgaW5zdGFuY2UuXG4gICAqXG4gICAqL1xuICBhYnN0cmFjdCBpbnNlcnQodmlld1JlZjogVmlld1JlZiwgaW5kZXg/OiBudW1iZXIpOiBWaWV3UmVmO1xuXG4gIC8qKlxuICAgKiBNb3ZlcyBhIHZpZXcgdG8gYSBuZXcgbG9jYXRpb24gaW4gdGhpcyBjb250YWluZXIuXG4gICAqIEBwYXJhbSB2aWV3UmVmIFRoZSB2aWV3IHRvIG1vdmUuXG4gICAqIEBwYXJhbSBpbmRleCBUaGUgMC1iYXNlZCBpbmRleCBvZiB0aGUgbmV3IGxvY2F0aW9uLlxuICAgKiBAcmV0dXJucyBUaGUgbW92ZWQgYFZpZXdSZWZgIGluc3RhbmNlLlxuICAgKi9cbiAgYWJzdHJhY3QgbW92ZSh2aWV3UmVmOiBWaWV3UmVmLCBjdXJyZW50SW5kZXg6IG51bWJlcik6IFZpZXdSZWY7XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGluZGV4IG9mIGEgdmlldyB3aXRoaW4gdGhlIGN1cnJlbnQgY29udGFpbmVyLlxuICAgKiBAcGFyYW0gdmlld1JlZiBUaGUgdmlldyB0byBxdWVyeS5cbiAgICogQHJldHVybnMgVGhlIDAtYmFzZWQgaW5kZXggb2YgdGhlIHZpZXcncyBwb3NpdGlvbiBpbiB0aGlzIGNvbnRhaW5lcixcbiAgICogb3IgYC0xYCBpZiB0aGlzIGNvbnRhaW5lciBkb2Vzbid0IGNvbnRhaW4gdGhlIHZpZXcuXG4gICAqL1xuICBhYnN0cmFjdCBpbmRleE9mKHZpZXdSZWY6IFZpZXdSZWYpOiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIERlc3Ryb3lzIGEgdmlldyBhdHRhY2hlZCB0byB0aGlzIGNvbnRhaW5lclxuICAgKiBAcGFyYW0gaW5kZXggVGhlIDAtYmFzZWQgaW5kZXggb2YgdGhlIHZpZXcgdG8gZGVzdHJveS5cbiAgICogSWYgbm90IHNwZWNpZmllZCwgdGhlIGxhc3QgdmlldyBpbiB0aGUgY29udGFpbmVyIGlzIHJlbW92ZWQuXG4gICAqL1xuICBhYnN0cmFjdCByZW1vdmUoaW5kZXg/OiBudW1iZXIpOiB2b2lkO1xuXG4gIC8qKlxuICAgKiBEZXRhY2hlcyBhIHZpZXcgZnJvbSB0aGlzIGNvbnRhaW5lciB3aXRob3V0IGRlc3Ryb3lpbmcgaXQuXG4gICAqIFVzZSBhbG9uZyB3aXRoIGBpbnNlcnQoKWAgdG8gbW92ZSBhIHZpZXcgd2l0aGluIHRoZSBjdXJyZW50IGNvbnRhaW5lci5cbiAgICogQHBhcmFtIGluZGV4IFRoZSAwLWJhc2VkIGluZGV4IG9mIHRoZSB2aWV3IHRvIGRldGFjaC5cbiAgICogSWYgbm90IHNwZWNpZmllZCwgdGhlIGxhc3QgdmlldyBpbiB0aGUgY29udGFpbmVyIGlzIGRldGFjaGVkLlxuICAgKi9cbiAgYWJzdHJhY3QgZGV0YWNoKGluZGV4PzogbnVtYmVyKTogVmlld1JlZiB8IG51bGw7XG5cbiAgLyoqXG4gICAqIEBpbnRlcm5hbFxuICAgKiBAbm9jb2xsYXBzZVxuICAgKi9cbiAgc3RhdGljIF9fTkdfRUxFTUVOVF9JRF9fOiAoKSA9PiBWaWV3Q29udGFpbmVyUmVmID0gaW5qZWN0Vmlld0NvbnRhaW5lclJlZjtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgVmlld0NvbnRhaW5lclJlZiBhbmQgc3RvcmVzIGl0IG9uIHRoZSBpbmplY3Rvci4gT3IsIGlmIHRoZSBWaWV3Q29udGFpbmVyUmVmXG4gKiBhbHJlYWR5IGV4aXN0cywgcmV0cmlldmVzIHRoZSBleGlzdGluZyBWaWV3Q29udGFpbmVyUmVmLlxuICpcbiAqIEByZXR1cm5zIFRoZSBWaWV3Q29udGFpbmVyUmVmIGluc3RhbmNlIHRvIHVzZVxuICovXG5leHBvcnQgZnVuY3Rpb24gaW5qZWN0Vmlld0NvbnRhaW5lclJlZigpOiBWaWV3Q29udGFpbmVyUmVmIHtcbiAgY29uc3QgcHJldmlvdXNUTm9kZSA9IGdldEN1cnJlbnRUTm9kZSgpIGFzIFRFbGVtZW50Tm9kZSB8IFRFbGVtZW50Q29udGFpbmVyTm9kZSB8IFRDb250YWluZXJOb2RlO1xuICByZXR1cm4gY3JlYXRlQ29udGFpbmVyUmVmKHByZXZpb3VzVE5vZGUsIGdldExWaWV3KCkpO1xufVxuXG5jb25zdCBWRV9WaWV3Q29udGFpbmVyUmVmID0gVmlld0NvbnRhaW5lclJlZjtcblxuLy8gVE9ETyhhbHhodWIpOiBjbGVhbmluZyB1cCB0aGlzIGluZGlyZWN0aW9uIHRyaWdnZXJzIGEgc3VidGxlIGJ1ZyBpbiBDbG9zdXJlIGluIGczLiBPbmNlIHRoZSBmaXhcbi8vIGZvciB0aGF0IGxhbmRzLCB0aGlzIGNhbiBiZSBjbGVhbmVkIHVwLlxuY29uc3QgUjNWaWV3Q29udGFpbmVyUmVmID0gY2xhc3MgVmlld0NvbnRhaW5lclJlZiBleHRlbmRzIFZFX1ZpZXdDb250YWluZXJSZWYge1xuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIF9sQ29udGFpbmVyOiBMQ29udGFpbmVyLFxuICAgIHByaXZhdGUgX2hvc3RUTm9kZTogVEVsZW1lbnROb2RlIHwgVENvbnRhaW5lck5vZGUgfCBURWxlbWVudENvbnRhaW5lck5vZGUsXG4gICAgcHJpdmF0ZSBfaG9zdExWaWV3OiBMVmlldyxcbiAgKSB7XG4gICAgc3VwZXIoKTtcbiAgfVxuXG4gIG92ZXJyaWRlIGdldCBlbGVtZW50KCk6IEVsZW1lbnRSZWYge1xuICAgIHJldHVybiBjcmVhdGVFbGVtZW50UmVmKHRoaXMuX2hvc3RUTm9kZSwgdGhpcy5faG9zdExWaWV3KTtcbiAgfVxuXG4gIG92ZXJyaWRlIGdldCBpbmplY3RvcigpOiBJbmplY3RvciB7XG4gICAgcmV0dXJuIG5ldyBOb2RlSW5qZWN0b3IodGhpcy5faG9zdFROb2RlLCB0aGlzLl9ob3N0TFZpZXcpO1xuICB9XG5cbiAgLyoqIEBkZXByZWNhdGVkIE5vIHJlcGxhY2VtZW50ICovXG4gIG92ZXJyaWRlIGdldCBwYXJlbnRJbmplY3RvcigpOiBJbmplY3RvciB7XG4gICAgY29uc3QgcGFyZW50TG9jYXRpb24gPSBnZXRQYXJlbnRJbmplY3RvckxvY2F0aW9uKHRoaXMuX2hvc3RUTm9kZSwgdGhpcy5faG9zdExWaWV3KTtcbiAgICBpZiAoaGFzUGFyZW50SW5qZWN0b3IocGFyZW50TG9jYXRpb24pKSB7XG4gICAgICBjb25zdCBwYXJlbnRWaWV3ID0gZ2V0UGFyZW50SW5qZWN0b3JWaWV3KHBhcmVudExvY2F0aW9uLCB0aGlzLl9ob3N0TFZpZXcpO1xuICAgICAgY29uc3QgaW5qZWN0b3JJbmRleCA9IGdldFBhcmVudEluamVjdG9ySW5kZXgocGFyZW50TG9jYXRpb24pO1xuICAgICAgbmdEZXZNb2RlICYmIGFzc2VydE5vZGVJbmplY3RvcihwYXJlbnRWaWV3LCBpbmplY3RvckluZGV4KTtcbiAgICAgIGNvbnN0IHBhcmVudFROb2RlID0gcGFyZW50Vmlld1tUVklFV10uZGF0YVtcbiAgICAgICAgaW5qZWN0b3JJbmRleCArIE5vZGVJbmplY3Rvck9mZnNldC5UTk9ERVxuICAgICAgXSBhcyBURWxlbWVudE5vZGU7XG4gICAgICByZXR1cm4gbmV3IE5vZGVJbmplY3RvcihwYXJlbnRUTm9kZSwgcGFyZW50Vmlldyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBuZXcgTm9kZUluamVjdG9yKG51bGwsIHRoaXMuX2hvc3RMVmlldyk7XG4gICAgfVxuICB9XG5cbiAgb3ZlcnJpZGUgY2xlYXIoKTogdm9pZCB7XG4gICAgd2hpbGUgKHRoaXMubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5yZW1vdmUodGhpcy5sZW5ndGggLSAxKTtcbiAgICB9XG4gIH1cblxuICBvdmVycmlkZSBnZXQoaW5kZXg6IG51bWJlcik6IFZpZXdSZWYgfCBudWxsIHtcbiAgICBjb25zdCB2aWV3UmVmcyA9IGdldFZpZXdSZWZzKHRoaXMuX2xDb250YWluZXIpO1xuICAgIHJldHVybiAodmlld1JlZnMgIT09IG51bGwgJiYgdmlld1JlZnNbaW5kZXhdKSB8fCBudWxsO1xuICB9XG5cbiAgb3ZlcnJpZGUgZ2V0IGxlbmd0aCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9sQ29udGFpbmVyLmxlbmd0aCAtIENPTlRBSU5FUl9IRUFERVJfT0ZGU0VUO1xuICB9XG5cbiAgb3ZlcnJpZGUgY3JlYXRlRW1iZWRkZWRWaWV3PEM+KFxuICAgIHRlbXBsYXRlUmVmOiBUZW1wbGF0ZVJlZjxDPixcbiAgICBjb250ZXh0PzogQyxcbiAgICBvcHRpb25zPzoge1xuICAgICAgaW5kZXg/OiBudW1iZXI7XG4gICAgICBpbmplY3Rvcj86IEluamVjdG9yO1xuICAgIH0sXG4gICk6IEVtYmVkZGVkVmlld1JlZjxDPjtcbiAgb3ZlcnJpZGUgY3JlYXRlRW1iZWRkZWRWaWV3PEM+KFxuICAgIHRlbXBsYXRlUmVmOiBUZW1wbGF0ZVJlZjxDPixcbiAgICBjb250ZXh0PzogQyxcbiAgICBpbmRleD86IG51bWJlcixcbiAgKTogRW1iZWRkZWRWaWV3UmVmPEM+O1xuICBvdmVycmlkZSBjcmVhdGVFbWJlZGRlZFZpZXc8Qz4oXG4gICAgdGVtcGxhdGVSZWY6IFRlbXBsYXRlUmVmPEM+LFxuICAgIGNvbnRleHQ/OiBDLFxuICAgIGluZGV4T3JPcHRpb25zPzpcbiAgICAgIHwgbnVtYmVyXG4gICAgICB8IHtcbiAgICAgICAgICBpbmRleD86IG51bWJlcjtcbiAgICAgICAgICBpbmplY3Rvcj86IEluamVjdG9yO1xuICAgICAgICB9LFxuICApOiBFbWJlZGRlZFZpZXdSZWY8Qz4ge1xuICAgIGxldCBpbmRleDogbnVtYmVyIHwgdW5kZWZpbmVkO1xuICAgIGxldCBpbmplY3RvcjogSW5qZWN0b3IgfCB1bmRlZmluZWQ7XG5cbiAgICBpZiAodHlwZW9mIGluZGV4T3JPcHRpb25zID09PSAnbnVtYmVyJykge1xuICAgICAgaW5kZXggPSBpbmRleE9yT3B0aW9ucztcbiAgICB9IGVsc2UgaWYgKGluZGV4T3JPcHRpb25zICE9IG51bGwpIHtcbiAgICAgIGluZGV4ID0gaW5kZXhPck9wdGlvbnMuaW5kZXg7XG4gICAgICBpbmplY3RvciA9IGluZGV4T3JPcHRpb25zLmluamVjdG9yO1xuICAgIH1cblxuICAgIGNvbnN0IGRlaHlkcmF0ZWRWaWV3ID0gZmluZE1hdGNoaW5nRGVoeWRyYXRlZFZpZXcodGhpcy5fbENvbnRhaW5lciwgdGVtcGxhdGVSZWYuc3NySWQpO1xuICAgIGNvbnN0IHZpZXdSZWYgPSB0ZW1wbGF0ZVJlZi5jcmVhdGVFbWJlZGRlZFZpZXdJbXBsKFxuICAgICAgY29udGV4dCB8fCA8YW55Pnt9LFxuICAgICAgaW5qZWN0b3IsXG4gICAgICBkZWh5ZHJhdGVkVmlldyxcbiAgICApO1xuICAgIHRoaXMuaW5zZXJ0SW1wbCh2aWV3UmVmLCBpbmRleCwgc2hvdWxkQWRkVmlld1RvRG9tKHRoaXMuX2hvc3RUTm9kZSwgZGVoeWRyYXRlZFZpZXcpKTtcbiAgICByZXR1cm4gdmlld1JlZjtcbiAgfVxuXG4gIG92ZXJyaWRlIGNyZWF0ZUNvbXBvbmVudDxDPihcbiAgICBjb21wb25lbnRUeXBlOiBUeXBlPEM+LFxuICAgIG9wdGlvbnM/OiB7XG4gICAgICBpbmRleD86IG51bWJlcjtcbiAgICAgIGluamVjdG9yPzogSW5qZWN0b3I7XG4gICAgICBwcm9qZWN0YWJsZU5vZGVzPzogTm9kZVtdW107XG4gICAgICBuZ01vZHVsZVJlZj86IE5nTW9kdWxlUmVmPHVua25vd24+O1xuICAgIH0sXG4gICk6IENvbXBvbmVudFJlZjxDPjtcbiAgLyoqXG4gICAqIEBkZXByZWNhdGVkIEFuZ3VsYXIgbm8gbG9uZ2VyIHJlcXVpcmVzIGNvbXBvbmVudCBmYWN0b3JpZXMgdG8gZHluYW1pY2FsbHkgY3JlYXRlIGNvbXBvbmVudHMuXG4gICAqICAgICBVc2UgZGlmZmVyZW50IHNpZ25hdHVyZSBvZiB0aGUgYGNyZWF0ZUNvbXBvbmVudGAgbWV0aG9kLCB3aGljaCBhbGxvd3MgcGFzc2luZ1xuICAgKiAgICAgQ29tcG9uZW50IGNsYXNzIGRpcmVjdGx5LlxuICAgKi9cbiAgb3ZlcnJpZGUgY3JlYXRlQ29tcG9uZW50PEM+KFxuICAgIGNvbXBvbmVudEZhY3Rvcnk6IENvbXBvbmVudEZhY3Rvcnk8Qz4sXG4gICAgaW5kZXg/OiBudW1iZXIgfCB1bmRlZmluZWQsXG4gICAgaW5qZWN0b3I/OiBJbmplY3RvciB8IHVuZGVmaW5lZCxcbiAgICBwcm9qZWN0YWJsZU5vZGVzPzogYW55W11bXSB8IHVuZGVmaW5lZCxcbiAgICBlbnZpcm9ubWVudEluamVjdG9yPzogRW52aXJvbm1lbnRJbmplY3RvciB8IE5nTW9kdWxlUmVmPGFueT4gfCB1bmRlZmluZWQsXG4gICk6IENvbXBvbmVudFJlZjxDPjtcbiAgb3ZlcnJpZGUgY3JlYXRlQ29tcG9uZW50PEM+KFxuICAgIGNvbXBvbmVudEZhY3RvcnlPclR5cGU6IENvbXBvbmVudEZhY3Rvcnk8Qz4gfCBUeXBlPEM+LFxuICAgIGluZGV4T3JPcHRpb25zPzpcbiAgICAgIHwgbnVtYmVyXG4gICAgICB8IHVuZGVmaW5lZFxuICAgICAgfCB7XG4gICAgICAgICAgaW5kZXg/OiBudW1iZXI7XG4gICAgICAgICAgaW5qZWN0b3I/OiBJbmplY3RvcjtcbiAgICAgICAgICBuZ01vZHVsZVJlZj86IE5nTW9kdWxlUmVmPHVua25vd24+O1xuICAgICAgICAgIGVudmlyb25tZW50SW5qZWN0b3I/OiBFbnZpcm9ubWVudEluamVjdG9yIHwgTmdNb2R1bGVSZWY8dW5rbm93bj47XG4gICAgICAgICAgcHJvamVjdGFibGVOb2Rlcz86IE5vZGVbXVtdO1xuICAgICAgICB9LFxuICAgIGluamVjdG9yPzogSW5qZWN0b3IgfCB1bmRlZmluZWQsXG4gICAgcHJvamVjdGFibGVOb2Rlcz86IGFueVtdW10gfCB1bmRlZmluZWQsXG4gICAgZW52aXJvbm1lbnRJbmplY3Rvcj86IEVudmlyb25tZW50SW5qZWN0b3IgfCBOZ01vZHVsZVJlZjxhbnk+IHwgdW5kZWZpbmVkLFxuICApOiBDb21wb25lbnRSZWY8Qz4ge1xuICAgIGNvbnN0IGlzQ29tcG9uZW50RmFjdG9yeSA9IGNvbXBvbmVudEZhY3RvcnlPclR5cGUgJiYgIWlzVHlwZShjb21wb25lbnRGYWN0b3J5T3JUeXBlKTtcbiAgICBsZXQgaW5kZXg6IG51bWJlciB8IHVuZGVmaW5lZDtcblxuICAgIC8vIFRoaXMgZnVuY3Rpb24gc3VwcG9ydHMgMiBzaWduYXR1cmVzIGFuZCB3ZSBuZWVkIHRvIGhhbmRsZSBvcHRpb25zIGNvcnJlY3RseSBmb3IgYm90aDpcbiAgICAvLyAgIDEuIFdoZW4gZmlyc3QgYXJndW1lbnQgaXMgYSBDb21wb25lbnQgdHlwZS4gVGhpcyBzaWduYXR1cmUgYWxzbyByZXF1aXJlcyBleHRyYVxuICAgIC8vICAgICAgb3B0aW9ucyB0byBiZSBwcm92aWRlZCBhcyBvYmplY3QgKG1vcmUgZXJnb25vbWljIG9wdGlvbikuXG4gICAgLy8gICAyLiBGaXJzdCBhcmd1bWVudCBpcyBhIENvbXBvbmVudCBmYWN0b3J5LiBJbiB0aGlzIGNhc2UgZXh0cmEgb3B0aW9ucyBhcmUgcmVwcmVzZW50ZWQgYXNcbiAgICAvLyAgICAgIHBvc2l0aW9uYWwgYXJndW1lbnRzLiBUaGlzIHNpZ25hdHVyZSBpcyBsZXNzIGVyZ29ub21pYyBhbmQgd2lsbCBiZSBkZXByZWNhdGVkLlxuICAgIGlmIChpc0NvbXBvbmVudEZhY3RvcnkpIHtcbiAgICAgIGlmIChuZ0Rldk1vZGUpIHtcbiAgICAgICAgYXNzZXJ0RXF1YWwoXG4gICAgICAgICAgdHlwZW9mIGluZGV4T3JPcHRpb25zICE9PSAnb2JqZWN0JyxcbiAgICAgICAgICB0cnVlLFxuICAgICAgICAgICdJdCBsb29rcyBsaWtlIENvbXBvbmVudCBmYWN0b3J5IHdhcyBwcm92aWRlZCBhcyB0aGUgZmlyc3QgYXJndW1lbnQgJyArXG4gICAgICAgICAgICAnYW5kIGFuIG9wdGlvbnMgb2JqZWN0IGFzIHRoZSBzZWNvbmQgYXJndW1lbnQuIFRoaXMgY29tYmluYXRpb24gb2YgYXJndW1lbnRzICcgK1xuICAgICAgICAgICAgJ2lzIGluY29tcGF0aWJsZS4gWW91IGNhbiBlaXRoZXIgY2hhbmdlIHRoZSBmaXJzdCBhcmd1bWVudCB0byBwcm92aWRlIENvbXBvbmVudCAnICtcbiAgICAgICAgICAgICd0eXBlIG9yIGNoYW5nZSB0aGUgc2Vjb25kIGFyZ3VtZW50IHRvIGJlIGEgbnVtYmVyIChyZXByZXNlbnRpbmcgYW4gaW5kZXggYXQgJyArXG4gICAgICAgICAgICBcIndoaWNoIHRvIGluc2VydCB0aGUgbmV3IGNvbXBvbmVudCdzIGhvc3QgdmlldyBpbnRvIHRoaXMgY29udGFpbmVyKVwiLFxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgaW5kZXggPSBpbmRleE9yT3B0aW9ucyBhcyBudW1iZXIgfCB1bmRlZmluZWQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChuZ0Rldk1vZGUpIHtcbiAgICAgICAgYXNzZXJ0RGVmaW5lZChcbiAgICAgICAgICBnZXRDb21wb25lbnREZWYoY29tcG9uZW50RmFjdG9yeU9yVHlwZSksXG4gICAgICAgICAgYFByb3ZpZGVkIENvbXBvbmVudCBjbGFzcyBkb2Vzbid0IGNvbnRhaW4gQ29tcG9uZW50IGRlZmluaXRpb24uIGAgK1xuICAgICAgICAgICAgYFBsZWFzZSBjaGVjayB3aGV0aGVyIHByb3ZpZGVkIGNsYXNzIGhhcyBAQ29tcG9uZW50IGRlY29yYXRvci5gLFxuICAgICAgICApO1xuICAgICAgICBhc3NlcnRFcXVhbChcbiAgICAgICAgICB0eXBlb2YgaW5kZXhPck9wdGlvbnMgIT09ICdudW1iZXInLFxuICAgICAgICAgIHRydWUsXG4gICAgICAgICAgJ0l0IGxvb2tzIGxpa2UgQ29tcG9uZW50IHR5cGUgd2FzIHByb3ZpZGVkIGFzIHRoZSBmaXJzdCBhcmd1bWVudCAnICtcbiAgICAgICAgICAgIFwiYW5kIGEgbnVtYmVyIChyZXByZXNlbnRpbmcgYW4gaW5kZXggYXQgd2hpY2ggdG8gaW5zZXJ0IHRoZSBuZXcgY29tcG9uZW50J3MgXCIgK1xuICAgICAgICAgICAgJ2hvc3QgdmlldyBpbnRvIHRoaXMgY29udGFpbmVyIGFzIHRoZSBzZWNvbmQgYXJndW1lbnQuIFRoaXMgY29tYmluYXRpb24gb2YgYXJndW1lbnRzICcgK1xuICAgICAgICAgICAgJ2lzIGluY29tcGF0aWJsZS4gUGxlYXNlIHVzZSBhbiBvYmplY3QgYXMgdGhlIHNlY29uZCBhcmd1bWVudCBpbnN0ZWFkLicsXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICBjb25zdCBvcHRpb25zID0gKGluZGV4T3JPcHRpb25zIHx8IHt9KSBhcyB7XG4gICAgICAgIGluZGV4PzogbnVtYmVyO1xuICAgICAgICBpbmplY3Rvcj86IEluamVjdG9yO1xuICAgICAgICBuZ01vZHVsZVJlZj86IE5nTW9kdWxlUmVmPHVua25vd24+O1xuICAgICAgICBlbnZpcm9ubWVudEluamVjdG9yPzogRW52aXJvbm1lbnRJbmplY3RvciB8IE5nTW9kdWxlUmVmPHVua25vd24+O1xuICAgICAgICBwcm9qZWN0YWJsZU5vZGVzPzogTm9kZVtdW107XG4gICAgICB9O1xuICAgICAgaWYgKG5nRGV2TW9kZSAmJiBvcHRpb25zLmVudmlyb25tZW50SW5qZWN0b3IgJiYgb3B0aW9ucy5uZ01vZHVsZVJlZikge1xuICAgICAgICB0aHJvd0Vycm9yKFxuICAgICAgICAgIGBDYW5ub3QgcGFzcyBib3RoIGVudmlyb25tZW50SW5qZWN0b3IgYW5kIG5nTW9kdWxlUmVmIG9wdGlvbnMgdG8gY3JlYXRlQ29tcG9uZW50KCkuYCxcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIGluZGV4ID0gb3B0aW9ucy5pbmRleDtcbiAgICAgIGluamVjdG9yID0gb3B0aW9ucy5pbmplY3RvcjtcbiAgICAgIHByb2plY3RhYmxlTm9kZXMgPSBvcHRpb25zLnByb2plY3RhYmxlTm9kZXM7XG4gICAgICBlbnZpcm9ubWVudEluamVjdG9yID0gb3B0aW9ucy5lbnZpcm9ubWVudEluamVjdG9yIHx8IG9wdGlvbnMubmdNb2R1bGVSZWY7XG4gICAgfVxuXG4gICAgY29uc3QgY29tcG9uZW50RmFjdG9yeTogQ29tcG9uZW50RmFjdG9yeTxDPiA9IGlzQ29tcG9uZW50RmFjdG9yeVxuICAgICAgPyAoY29tcG9uZW50RmFjdG9yeU9yVHlwZSBhcyBDb21wb25lbnRGYWN0b3J5PEM+KVxuICAgICAgOiBuZXcgUjNDb21wb25lbnRGYWN0b3J5KGdldENvbXBvbmVudERlZihjb21wb25lbnRGYWN0b3J5T3JUeXBlKSEpO1xuICAgIGNvbnN0IGNvbnRleHRJbmplY3RvciA9IGluamVjdG9yIHx8IHRoaXMucGFyZW50SW5qZWN0b3I7XG5cbiAgICAvLyBJZiBhbiBgTmdNb2R1bGVSZWZgIGlzIG5vdCBwcm92aWRlZCBleHBsaWNpdGx5LCB0cnkgcmV0cmlldmluZyBpdCBmcm9tIHRoZSBESSB0cmVlLlxuICAgIGlmICghZW52aXJvbm1lbnRJbmplY3RvciAmJiAoY29tcG9uZW50RmFjdG9yeSBhcyBhbnkpLm5nTW9kdWxlID09IG51bGwpIHtcbiAgICAgIC8vIEZvciB0aGUgYENvbXBvbmVudEZhY3RvcnlgIGNhc2UsIGVudGVyaW5nIHRoaXMgbG9naWMgaXMgdmVyeSB1bmxpa2VseSwgc2luY2Ugd2UgZXhwZWN0IHRoYXRcbiAgICAgIC8vIGFuIGluc3RhbmNlIG9mIGEgYENvbXBvbmVudEZhY3RvcnlgLCByZXNvbHZlZCB2aWEgYENvbXBvbmVudEZhY3RvcnlSZXNvbHZlcmAgd291bGQgaGF2ZSBhblxuICAgICAgLy8gYG5nTW9kdWxlYCBmaWVsZC4gVGhpcyBpcyBwb3NzaWJsZSBpbiBzb21lIHRlc3Qgc2NlbmFyaW9zIGFuZCBwb3RlbnRpYWxseSBpbiBzb21lIEpJVC1iYXNlZFxuICAgICAgLy8gdXNlLWNhc2VzLiBGb3IgdGhlIGBDb21wb25lbnRGYWN0b3J5YCBjYXNlIHdlIHByZXNlcnZlIGJhY2t3YXJkcy1jb21wYXRpYmlsaXR5IGFuZCB0cnlcbiAgICAgIC8vIHVzaW5nIGEgcHJvdmlkZWQgaW5qZWN0b3IgZmlyc3QsIHRoZW4gZmFsbCBiYWNrIHRvIHRoZSBwYXJlbnQgaW5qZWN0b3Igb2YgdGhpc1xuICAgICAgLy8gYFZpZXdDb250YWluZXJSZWZgIGluc3RhbmNlLlxuICAgICAgLy9cbiAgICAgIC8vIEZvciB0aGUgZmFjdG9yeS1sZXNzIGNhc2UsIGl0J3MgY3JpdGljYWwgdG8gZXN0YWJsaXNoIGEgY29ubmVjdGlvbiB3aXRoIHRoZSBtb2R1bGVcbiAgICAgIC8vIGluamVjdG9yIHRyZWUgKGJ5IHJldHJpZXZpbmcgYW4gaW5zdGFuY2Ugb2YgYW4gYE5nTW9kdWxlUmVmYCBhbmQgYWNjZXNzaW5nIGl0cyBpbmplY3RvciksXG4gICAgICAvLyBzbyB0aGF0IGEgY29tcG9uZW50IGNhbiB1c2UgREkgdG9rZW5zIHByb3ZpZGVkIGluIE1nTW9kdWxlcy4gRm9yIHRoaXMgcmVhc29uLCB3ZSBjYW4gbm90XG4gICAgICAvLyByZWx5IG9uIHRoZSBwcm92aWRlZCBpbmplY3Rvciwgc2luY2UgaXQgbWlnaHQgYmUgZGV0YWNoZWQgZnJvbSB0aGUgREkgdHJlZSAoZm9yIGV4YW1wbGUsIGlmXG4gICAgICAvLyBpdCB3YXMgY3JlYXRlZCB2aWEgYEluamVjdG9yLmNyZWF0ZWAgd2l0aG91dCBzcGVjaWZ5aW5nIGEgcGFyZW50IGluamVjdG9yLCBvciBpZiBhblxuICAgICAgLy8gaW5qZWN0b3IgaXMgcmV0cmlldmVkIGZyb20gYW4gYE5nTW9kdWxlUmVmYCBjcmVhdGVkIHZpYSBgY3JlYXRlTmdNb2R1bGVgIHVzaW5nIGFuXG4gICAgICAvLyBOZ01vZHVsZSBvdXRzaWRlIG9mIGEgbW9kdWxlIHRyZWUpLiBJbnN0ZWFkLCB3ZSBhbHdheXMgdXNlIGBWaWV3Q29udGFpbmVyUmVmYCdzIHBhcmVudFxuICAgICAgLy8gaW5qZWN0b3IsIHdoaWNoIGlzIG5vcm1hbGx5IGNvbm5lY3RlZCB0byB0aGUgREkgdHJlZSwgd2hpY2ggaW5jbHVkZXMgbW9kdWxlIGluamVjdG9yXG4gICAgICAvLyBzdWJ0cmVlLlxuICAgICAgY29uc3QgX2luamVjdG9yID0gaXNDb21wb25lbnRGYWN0b3J5ID8gY29udGV4dEluamVjdG9yIDogdGhpcy5wYXJlbnRJbmplY3RvcjtcblxuICAgICAgLy8gRE8gTk9UIFJFRkFDVE9SLiBUaGUgY29kZSBoZXJlIHVzZWQgdG8gaGF2ZSBhIGBpbmplY3Rvci5nZXQoTmdNb2R1bGVSZWYsIG51bGwpIHx8XG4gICAgICAvLyB1bmRlZmluZWRgIGV4cHJlc3Npb24gd2hpY2ggc2VlbXMgdG8gY2F1c2UgaW50ZXJuYWwgZ29vZ2xlIGFwcHMgdG8gZmFpbC4gVGhpcyBpcyBkb2N1bWVudGVkXG4gICAgICAvLyBpbiB0aGUgZm9sbG93aW5nIGludGVybmFsIGJ1ZyBpc3N1ZTogZ28vYi8xNDI5Njc4MDJcbiAgICAgIGNvbnN0IHJlc3VsdCA9IF9pbmplY3Rvci5nZXQoRW52aXJvbm1lbnRJbmplY3RvciwgbnVsbCk7XG4gICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgIGVudmlyb25tZW50SW5qZWN0b3IgPSByZXN1bHQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgY29tcG9uZW50RGVmID0gZ2V0Q29tcG9uZW50RGVmKGNvbXBvbmVudEZhY3RvcnkuY29tcG9uZW50VHlwZSA/PyB7fSk7XG4gICAgY29uc3QgZGVoeWRyYXRlZFZpZXcgPSBmaW5kTWF0Y2hpbmdEZWh5ZHJhdGVkVmlldyh0aGlzLl9sQ29udGFpbmVyLCBjb21wb25lbnREZWY/LmlkID8/IG51bGwpO1xuICAgIGNvbnN0IHJOb2RlID0gZGVoeWRyYXRlZFZpZXc/LmZpcnN0Q2hpbGQgPz8gbnVsbDtcbiAgICBjb25zdCBjb21wb25lbnRSZWYgPSBjb21wb25lbnRGYWN0b3J5LmNyZWF0ZShcbiAgICAgIGNvbnRleHRJbmplY3RvcixcbiAgICAgIHByb2plY3RhYmxlTm9kZXMsXG4gICAgICByTm9kZSxcbiAgICAgIGVudmlyb25tZW50SW5qZWN0b3IsXG4gICAgKTtcbiAgICB0aGlzLmluc2VydEltcGwoXG4gICAgICBjb21wb25lbnRSZWYuaG9zdFZpZXcsXG4gICAgICBpbmRleCxcbiAgICAgIHNob3VsZEFkZFZpZXdUb0RvbSh0aGlzLl9ob3N0VE5vZGUsIGRlaHlkcmF0ZWRWaWV3KSxcbiAgICApO1xuICAgIHJldHVybiBjb21wb25lbnRSZWY7XG4gIH1cblxuICBvdmVycmlkZSBpbnNlcnQodmlld1JlZjogVmlld1JlZiwgaW5kZXg/OiBudW1iZXIpOiBWaWV3UmVmIHtcbiAgICByZXR1cm4gdGhpcy5pbnNlcnRJbXBsKHZpZXdSZWYsIGluZGV4LCB0cnVlKTtcbiAgfVxuXG4gIHByaXZhdGUgaW5zZXJ0SW1wbCh2aWV3UmVmOiBWaWV3UmVmLCBpbmRleD86IG51bWJlciwgYWRkVG9ET00/OiBib29sZWFuKTogVmlld1JlZiB7XG4gICAgY29uc3QgbFZpZXcgPSAodmlld1JlZiBhcyBSM1ZpZXdSZWY8YW55PikuX2xWaWV3ITtcblxuICAgIGlmIChuZ0Rldk1vZGUgJiYgdmlld1JlZi5kZXN0cm95ZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IGluc2VydCBhIGRlc3Ryb3llZCBWaWV3IGluIGEgVmlld0NvbnRhaW5lciEnKTtcbiAgICB9XG5cbiAgICBpZiAodmlld0F0dGFjaGVkVG9Db250YWluZXIobFZpZXcpKSB7XG4gICAgICAvLyBJZiB2aWV3IGlzIGFscmVhZHkgYXR0YWNoZWQsIGRldGFjaCBpdCBmaXJzdCBzbyB3ZSBjbGVhbiB1cCByZWZlcmVuY2VzIGFwcHJvcHJpYXRlbHkuXG5cbiAgICAgIGNvbnN0IHByZXZJZHggPSB0aGlzLmluZGV4T2Yodmlld1JlZik7XG5cbiAgICAgIC8vIEEgdmlldyBtaWdodCBiZSBhdHRhY2hlZCBlaXRoZXIgdG8gdGhpcyBvciBhIGRpZmZlcmVudCBjb250YWluZXIuIFRoZSBgcHJldklkeGAgZm9yXG4gICAgICAvLyB0aG9zZSBjYXNlcyB3aWxsIGJlOlxuICAgICAgLy8gZXF1YWwgdG8gLTEgZm9yIHZpZXdzIGF0dGFjaGVkIHRvIHRoaXMgVmlld0NvbnRhaW5lclJlZlxuICAgICAgLy8gPj0gMCBmb3Igdmlld3MgYXR0YWNoZWQgdG8gYSBkaWZmZXJlbnQgVmlld0NvbnRhaW5lclJlZlxuICAgICAgaWYgKHByZXZJZHggIT09IC0xKSB7XG4gICAgICAgIHRoaXMuZGV0YWNoKHByZXZJZHgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgcHJldkxDb250YWluZXIgPSBsVmlld1tQQVJFTlRdIGFzIExDb250YWluZXI7XG4gICAgICAgIG5nRGV2TW9kZSAmJlxuICAgICAgICAgIGFzc2VydEVxdWFsKFxuICAgICAgICAgICAgaXNMQ29udGFpbmVyKHByZXZMQ29udGFpbmVyKSxcbiAgICAgICAgICAgIHRydWUsXG4gICAgICAgICAgICAnQW4gYXR0YWNoZWQgdmlldyBzaG91bGQgaGF2ZSBpdHMgUEFSRU5UIHBvaW50IHRvIGEgY29udGFpbmVyLicsXG4gICAgICAgICAgKTtcblxuICAgICAgICAvLyBXZSBuZWVkIHRvIHJlLWNyZWF0ZSBhIFIzVmlld0NvbnRhaW5lclJlZiBpbnN0YW5jZSBzaW5jZSB0aG9zZSBhcmUgbm90IHN0b3JlZCBvblxuICAgICAgICAvLyBMVmlldyAobm9yIGFueXdoZXJlIGVsc2UpLlxuICAgICAgICBjb25zdCBwcmV2VkNSZWYgPSBuZXcgUjNWaWV3Q29udGFpbmVyUmVmKFxuICAgICAgICAgIHByZXZMQ29udGFpbmVyLFxuICAgICAgICAgIHByZXZMQ29udGFpbmVyW1RfSE9TVF0gYXMgVERpcmVjdGl2ZUhvc3ROb2RlLFxuICAgICAgICAgIHByZXZMQ29udGFpbmVyW1BBUkVOVF0sXG4gICAgICAgICk7XG5cbiAgICAgICAgcHJldlZDUmVmLmRldGFjaChwcmV2VkNSZWYuaW5kZXhPZih2aWV3UmVmKSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gTG9naWNhbCBvcGVyYXRpb24gb2YgYWRkaW5nIGBMVmlld2AgdG8gYExDb250YWluZXJgXG4gICAgY29uc3QgYWRqdXN0ZWRJZHggPSB0aGlzLl9hZGp1c3RJbmRleChpbmRleCk7XG4gICAgY29uc3QgbENvbnRhaW5lciA9IHRoaXMuX2xDb250YWluZXI7XG5cbiAgICBhZGRMVmlld1RvTENvbnRhaW5lcihsQ29udGFpbmVyLCBsVmlldywgYWRqdXN0ZWRJZHgsIGFkZFRvRE9NKTtcblxuICAgICh2aWV3UmVmIGFzIFIzVmlld1JlZjxhbnk+KS5hdHRhY2hUb1ZpZXdDb250YWluZXJSZWYoKTtcbiAgICBhZGRUb0FycmF5KGdldE9yQ3JlYXRlVmlld1JlZnMobENvbnRhaW5lciksIGFkanVzdGVkSWR4LCB2aWV3UmVmKTtcblxuICAgIHJldHVybiB2aWV3UmVmO1xuICB9XG5cbiAgb3ZlcnJpZGUgbW92ZSh2aWV3UmVmOiBWaWV3UmVmLCBuZXdJbmRleDogbnVtYmVyKTogVmlld1JlZiB7XG4gICAgaWYgKG5nRGV2TW9kZSAmJiB2aWV3UmVmLmRlc3Ryb3llZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgbW92ZSBhIGRlc3Ryb3llZCBWaWV3IGluIGEgVmlld0NvbnRhaW5lciEnKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuaW5zZXJ0KHZpZXdSZWYsIG5ld0luZGV4KTtcbiAgfVxuXG4gIG92ZXJyaWRlIGluZGV4T2Yodmlld1JlZjogVmlld1JlZik6IG51bWJlciB7XG4gICAgY29uc3Qgdmlld1JlZnNBcnIgPSBnZXRWaWV3UmVmcyh0aGlzLl9sQ29udGFpbmVyKTtcbiAgICByZXR1cm4gdmlld1JlZnNBcnIgIT09IG51bGwgPyB2aWV3UmVmc0Fyci5pbmRleE9mKHZpZXdSZWYpIDogLTE7XG4gIH1cblxuICBvdmVycmlkZSByZW1vdmUoaW5kZXg/OiBudW1iZXIpOiB2b2lkIHtcbiAgICBjb25zdCBhZGp1c3RlZElkeCA9IHRoaXMuX2FkanVzdEluZGV4KGluZGV4LCAtMSk7XG4gICAgY29uc3QgZGV0YWNoZWRWaWV3ID0gZGV0YWNoVmlldyh0aGlzLl9sQ29udGFpbmVyLCBhZGp1c3RlZElkeCk7XG5cbiAgICBpZiAoZGV0YWNoZWRWaWV3KSB7XG4gICAgICAvLyBCZWZvcmUgZGVzdHJveWluZyB0aGUgdmlldywgcmVtb3ZlIGl0IGZyb20gdGhlIGNvbnRhaW5lcidzIGFycmF5IG9mIGBWaWV3UmVmYHMuXG4gICAgICAvLyBUaGlzIGVuc3VyZXMgdGhlIHZpZXcgY29udGFpbmVyIGxlbmd0aCBpcyB1cGRhdGVkIGJlZm9yZSBjYWxsaW5nXG4gICAgICAvLyBgZGVzdHJveUxWaWV3YCwgd2hpY2ggY291bGQgcmVjdXJzaXZlbHkgY2FsbCB2aWV3IGNvbnRhaW5lciBtZXRob2RzIHRoYXRcbiAgICAgIC8vIHJlbHkgb24gYW4gYWNjdXJhdGUgY29udGFpbmVyIGxlbmd0aC5cbiAgICAgIC8vIChlLmcuIGEgbWV0aG9kIG9uIHRoaXMgdmlldyBjb250YWluZXIgYmVpbmcgY2FsbGVkIGJ5IGEgY2hpbGQgZGlyZWN0aXZlJ3MgT25EZXN0cm95XG4gICAgICAvLyBsaWZlY3ljbGUgaG9vaylcbiAgICAgIHJlbW92ZUZyb21BcnJheShnZXRPckNyZWF0ZVZpZXdSZWZzKHRoaXMuX2xDb250YWluZXIpLCBhZGp1c3RlZElkeCk7XG4gICAgICBkZXN0cm95TFZpZXcoZGV0YWNoZWRWaWV3W1RWSUVXXSwgZGV0YWNoZWRWaWV3KTtcbiAgICB9XG4gIH1cblxuICBvdmVycmlkZSBkZXRhY2goaW5kZXg/OiBudW1iZXIpOiBWaWV3UmVmIHwgbnVsbCB7XG4gICAgY29uc3QgYWRqdXN0ZWRJZHggPSB0aGlzLl9hZGp1c3RJbmRleChpbmRleCwgLTEpO1xuICAgIGNvbnN0IHZpZXcgPSBkZXRhY2hWaWV3KHRoaXMuX2xDb250YWluZXIsIGFkanVzdGVkSWR4KTtcblxuICAgIGNvbnN0IHdhc0RldGFjaGVkID1cbiAgICAgIHZpZXcgJiYgcmVtb3ZlRnJvbUFycmF5KGdldE9yQ3JlYXRlVmlld1JlZnModGhpcy5fbENvbnRhaW5lciksIGFkanVzdGVkSWR4KSAhPSBudWxsO1xuICAgIHJldHVybiB3YXNEZXRhY2hlZCA/IG5ldyBSM1ZpZXdSZWYodmlldyEpIDogbnVsbDtcbiAgfVxuXG4gIHByaXZhdGUgX2FkanVzdEluZGV4KGluZGV4PzogbnVtYmVyLCBzaGlmdDogbnVtYmVyID0gMCkge1xuICAgIGlmIChpbmRleCA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gdGhpcy5sZW5ndGggKyBzaGlmdDtcbiAgICB9XG4gICAgaWYgKG5nRGV2TW9kZSkge1xuICAgICAgYXNzZXJ0R3JlYXRlclRoYW4oaW5kZXgsIC0xLCBgVmlld1JlZiBpbmRleCBtdXN0IGJlIHBvc2l0aXZlLCBnb3QgJHtpbmRleH1gKTtcbiAgICAgIC8vICsxIGJlY2F1c2UgaXQncyBsZWdhbCB0byBpbnNlcnQgYXQgdGhlIGVuZC5cbiAgICAgIGFzc2VydExlc3NUaGFuKGluZGV4LCB0aGlzLmxlbmd0aCArIDEgKyBzaGlmdCwgJ2luZGV4Jyk7XG4gICAgfVxuICAgIHJldHVybiBpbmRleDtcbiAgfVxufTtcblxuZnVuY3Rpb24gZ2V0Vmlld1JlZnMobENvbnRhaW5lcjogTENvbnRhaW5lcik6IFZpZXdSZWZbXSB8IG51bGwge1xuICByZXR1cm4gbENvbnRhaW5lcltWSUVXX1JFRlNdIGFzIFZpZXdSZWZbXTtcbn1cblxuZnVuY3Rpb24gZ2V0T3JDcmVhdGVWaWV3UmVmcyhsQ29udGFpbmVyOiBMQ29udGFpbmVyKTogVmlld1JlZltdIHtcbiAgcmV0dXJuIChsQ29udGFpbmVyW1ZJRVdfUkVGU10gfHwgKGxDb250YWluZXJbVklFV19SRUZTXSA9IFtdKSkgYXMgVmlld1JlZltdO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBWaWV3Q29udGFpbmVyUmVmIGFuZCBzdG9yZXMgaXQgb24gdGhlIGluamVjdG9yLlxuICpcbiAqIEBwYXJhbSBob3N0VE5vZGUgVGhlIG5vZGUgdGhhdCBpcyByZXF1ZXN0aW5nIGEgVmlld0NvbnRhaW5lclJlZlxuICogQHBhcmFtIGhvc3RMVmlldyBUaGUgdmlldyB0byB3aGljaCB0aGUgbm9kZSBiZWxvbmdzXG4gKiBAcmV0dXJucyBUaGUgVmlld0NvbnRhaW5lclJlZiBpbnN0YW5jZSB0byB1c2VcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUNvbnRhaW5lclJlZihcbiAgaG9zdFROb2RlOiBURWxlbWVudE5vZGUgfCBUQ29udGFpbmVyTm9kZSB8IFRFbGVtZW50Q29udGFpbmVyTm9kZSxcbiAgaG9zdExWaWV3OiBMVmlldyxcbik6IFZpZXdDb250YWluZXJSZWYge1xuICBuZ0Rldk1vZGUgJiYgYXNzZXJ0VE5vZGVUeXBlKGhvc3RUTm9kZSwgVE5vZGVUeXBlLkFueUNvbnRhaW5lciB8IFROb2RlVHlwZS5BbnlSTm9kZSk7XG5cbiAgbGV0IGxDb250YWluZXI6IExDb250YWluZXI7XG4gIGNvbnN0IHNsb3RWYWx1ZSA9IGhvc3RMVmlld1tob3N0VE5vZGUuaW5kZXhdO1xuICBpZiAoaXNMQ29udGFpbmVyKHNsb3RWYWx1ZSkpIHtcbiAgICAvLyBJZiB0aGUgaG9zdCBpcyBhIGNvbnRhaW5lciwgd2UgZG9uJ3QgbmVlZCB0byBjcmVhdGUgYSBuZXcgTENvbnRhaW5lclxuICAgIGxDb250YWluZXIgPSBzbG90VmFsdWU7XG4gIH0gZWxzZSB7XG4gICAgLy8gQW4gTENvbnRhaW5lciBhbmNob3IgY2FuIG5vdCBiZSBgbnVsbGAsIGJ1dCB3ZSBzZXQgaXQgaGVyZSB0ZW1wb3JhcmlseVxuICAgIC8vIGFuZCB1cGRhdGUgdG8gdGhlIGFjdHVhbCB2YWx1ZSBsYXRlciBpbiB0aGlzIGZ1bmN0aW9uIChzZWVcbiAgICAvLyBgX2xvY2F0ZU9yQ3JlYXRlQW5jaG9yTm9kZWApLlxuICAgIGxDb250YWluZXIgPSBjcmVhdGVMQ29udGFpbmVyKHNsb3RWYWx1ZSwgaG9zdExWaWV3LCBudWxsISwgaG9zdFROb2RlKTtcbiAgICBob3N0TFZpZXdbaG9zdFROb2RlLmluZGV4XSA9IGxDb250YWluZXI7XG4gICAgYWRkVG9WaWV3VHJlZShob3N0TFZpZXcsIGxDb250YWluZXIpO1xuICB9XG4gIF9sb2NhdGVPckNyZWF0ZUFuY2hvck5vZGUobENvbnRhaW5lciwgaG9zdExWaWV3LCBob3N0VE5vZGUsIHNsb3RWYWx1ZSk7XG5cbiAgcmV0dXJuIG5ldyBSM1ZpZXdDb250YWluZXJSZWYobENvbnRhaW5lciwgaG9zdFROb2RlLCBob3N0TFZpZXcpO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYW5kIGluc2VydHMgYSBjb21tZW50IG5vZGUgdGhhdCBhY3RzIGFzIGFuIGFuY2hvciBmb3IgYSB2aWV3IGNvbnRhaW5lci5cbiAqXG4gKiBJZiB0aGUgaG9zdCBpcyBhIHJlZ3VsYXIgZWxlbWVudCwgd2UgaGF2ZSB0byBpbnNlcnQgYSBjb21tZW50IG5vZGUgbWFudWFsbHkgd2hpY2ggd2lsbFxuICogYmUgdXNlZCBhcyBhbiBhbmNob3Igd2hlbiBpbnNlcnRpbmcgZWxlbWVudHMuIEluIHRoaXMgc3BlY2lmaWMgY2FzZSB3ZSB1c2UgbG93LWxldmVsIERPTVxuICogbWFuaXB1bGF0aW9uIHRvIGluc2VydCBpdC5cbiAqL1xuZnVuY3Rpb24gaW5zZXJ0QW5jaG9yTm9kZShob3N0TFZpZXc6IExWaWV3LCBob3N0VE5vZGU6IFROb2RlKTogUkNvbW1lbnQge1xuICBjb25zdCByZW5kZXJlciA9IGhvc3RMVmlld1tSRU5ERVJFUl07XG4gIG5nRGV2TW9kZSAmJiBuZ0Rldk1vZGUucmVuZGVyZXJDcmVhdGVDb21tZW50Kys7XG4gIGNvbnN0IGNvbW1lbnROb2RlID0gcmVuZGVyZXIuY3JlYXRlQ29tbWVudChuZ0Rldk1vZGUgPyAnY29udGFpbmVyJyA6ICcnKTtcblxuICBjb25zdCBob3N0TmF0aXZlID0gZ2V0TmF0aXZlQnlUTm9kZShob3N0VE5vZGUsIGhvc3RMVmlldykhO1xuICBjb25zdCBwYXJlbnRPZkhvc3ROYXRpdmUgPSBuYXRpdmVQYXJlbnROb2RlKHJlbmRlcmVyLCBob3N0TmF0aXZlKTtcbiAgbmF0aXZlSW5zZXJ0QmVmb3JlKFxuICAgIHJlbmRlcmVyLFxuICAgIHBhcmVudE9mSG9zdE5hdGl2ZSEsXG4gICAgY29tbWVudE5vZGUsXG4gICAgbmF0aXZlTmV4dFNpYmxpbmcocmVuZGVyZXIsIGhvc3ROYXRpdmUpLFxuICAgIGZhbHNlLFxuICApO1xuICByZXR1cm4gY29tbWVudE5vZGU7XG59XG5cbmxldCBfbG9jYXRlT3JDcmVhdGVBbmNob3JOb2RlID0gY3JlYXRlQW5jaG9yTm9kZTtcbmxldCBfcG9wdWxhdGVEZWh5ZHJhdGVkVmlld3NJbkxDb250YWluZXI6IHR5cGVvZiBwb3B1bGF0ZURlaHlkcmF0ZWRWaWV3c0luTENvbnRhaW5lckltcGwgPSAoKSA9PlxuICBmYWxzZTsgLy8gbm9vcCBieSBkZWZhdWx0XG5cbi8qKlxuICogTG9va3MgdXAgZGVoeWRyYXRlZCB2aWV3cyB0aGF0IGJlbG9uZyB0byBhIGdpdmVuIExDb250YWluZXIgYW5kIHBvcHVsYXRlc1xuICogdGhpcyBpbmZvcm1hdGlvbiBpbnRvIHRoZSBgTENvbnRhaW5lcltERUhZRFJBVEVEX1ZJRVdTXWAgc2xvdC4gV2hlbiBydW5uaW5nXG4gKiBpbiBjbGllbnQtb25seSBtb2RlLCB0aGlzIGZ1bmN0aW9uIGlzIGEgbm9vcC5cbiAqXG4gKiBAcGFyYW0gbENvbnRhaW5lciBMQ29udGFpbmVyIHRoYXQgc2hvdWxkIGJlIHBvcHVsYXRlZC5cbiAqIEBwYXJhbSB0Tm9kZSBDb3JyZXNwb25kaW5nIFROb2RlLlxuICogQHBhcmFtIGhvc3RMVmlldyBMVmlldyB0aGF0IGhvc3RzIExDb250YWluZXIuXG4gKiBAcmV0dXJucyBhIGJvb2xlYW4gZmxhZyB0aGF0IGluZGljYXRlcyB3aGV0aGVyIGEgcG9wdWxhdGluZyBvcGVyYXRpb25cbiAqICAgd2FzIHN1Y2Nlc3NmdWwuIFRoZSBvcGVyYXRpb24gbWlnaHQgYmUgdW5zdWNjZXNzZnVsIGluIGNhc2UgaXMgaGFzIGNvbXBsZXRlZFxuICogICBwcmV2aW91c2x5LCB3ZSBhcmUgcmVuZGVyaW5nIGluIGNsaWVudC1vbmx5IG1vZGUgb3IgdGhpcyBjb250ZW50IGlzIGxvY2F0ZWRcbiAqICAgaW4gYSBza2lwIGh5ZHJhdGlvbiBzZWN0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcG9wdWxhdGVEZWh5ZHJhdGVkVmlld3NJbkxDb250YWluZXIoXG4gIGxDb250YWluZXI6IExDb250YWluZXIsXG4gIHROb2RlOiBUTm9kZSxcbiAgaG9zdExWaWV3OiBMVmlldyxcbik6IGJvb2xlYW4ge1xuICByZXR1cm4gX3BvcHVsYXRlRGVoeWRyYXRlZFZpZXdzSW5MQ29udGFpbmVyKGxDb250YWluZXIsIHROb2RlLCBob3N0TFZpZXcpO1xufVxuXG4vKipcbiAqIFJlZ3VsYXIgY3JlYXRpb24gbW9kZTogYW4gYW5jaG9yIGlzIGNyZWF0ZWQgYW5kXG4gKiBhc3NpZ25lZCB0byB0aGUgYGxDb250YWluZXJbTkFUSVZFXWAgc2xvdC5cbiAqL1xuZnVuY3Rpb24gY3JlYXRlQW5jaG9yTm9kZShcbiAgbENvbnRhaW5lcjogTENvbnRhaW5lcixcbiAgaG9zdExWaWV3OiBMVmlldyxcbiAgaG9zdFROb2RlOiBUTm9kZSxcbiAgc2xvdFZhbHVlOiBhbnksXG4pIHtcbiAgLy8gV2UgYWxyZWFkeSBoYXZlIGEgbmF0aXZlIGVsZW1lbnQgKGFuY2hvcikgc2V0LCByZXR1cm4uXG4gIGlmIChsQ29udGFpbmVyW05BVElWRV0pIHJldHVybjtcblxuICBsZXQgY29tbWVudE5vZGU6IFJDb21tZW50O1xuICAvLyBJZiB0aGUgaG9zdCBpcyBhbiBlbGVtZW50IGNvbnRhaW5lciwgdGhlIG5hdGl2ZSBob3N0IGVsZW1lbnQgaXMgZ3VhcmFudGVlZCB0byBiZSBhXG4gIC8vIGNvbW1lbnQgYW5kIHdlIGNhbiByZXVzZSB0aGF0IGNvbW1lbnQgYXMgYW5jaG9yIGVsZW1lbnQgZm9yIHRoZSBuZXcgTENvbnRhaW5lci5cbiAgLy8gVGhlIGNvbW1lbnQgbm9kZSBpbiBxdWVzdGlvbiBpcyBhbHJlYWR5IHBhcnQgb2YgdGhlIERPTSBzdHJ1Y3R1cmUgc28gd2UgZG9uJ3QgbmVlZCB0byBhcHBlbmRcbiAgLy8gaXQgYWdhaW4uXG4gIGlmIChob3N0VE5vZGUudHlwZSAmIFROb2RlVHlwZS5FbGVtZW50Q29udGFpbmVyKSB7XG4gICAgY29tbWVudE5vZGUgPSB1bndyYXBSTm9kZShzbG90VmFsdWUpIGFzIFJDb21tZW50O1xuICB9IGVsc2Uge1xuICAgIGNvbW1lbnROb2RlID0gaW5zZXJ0QW5jaG9yTm9kZShob3N0TFZpZXcsIGhvc3RUTm9kZSk7XG4gIH1cbiAgbENvbnRhaW5lcltOQVRJVkVdID0gY29tbWVudE5vZGU7XG59XG5cbi8qKlxuICogSHlkcmF0aW9uIGxvZ2ljIHRoYXQgbG9va3MgdXAgYWxsIGRlaHlkcmF0ZWQgdmlld3MgaW4gdGhpcyBjb250YWluZXJcbiAqIGFuZCBwdXRzIHRoZW0gaW50byBgbENvbnRhaW5lcltERUhZRFJBVEVEX1ZJRVdTXWAgc2xvdC5cbiAqXG4gKiBAcmV0dXJucyBhIGJvb2xlYW4gZmxhZyB0aGF0IGluZGljYXRlcyB3aGV0aGVyIGEgcG9wdWxhdGluZyBvcGVyYXRpb25cbiAqICAgd2FzIHN1Y2Nlc3NmdWwuIFRoZSBvcGVyYXRpb24gbWlnaHQgYmUgdW5zdWNjZXNzZnVsIGluIGNhc2UgaXMgaGFzIGNvbXBsZXRlZFxuICogICBwcmV2aW91c2x5LCB3ZSBhcmUgcmVuZGVyaW5nIGluIGNsaWVudC1vbmx5IG1vZGUgb3IgdGhpcyBjb250ZW50IGlzIGxvY2F0ZWRcbiAqICAgaW4gYSBza2lwIGh5ZHJhdGlvbiBzZWN0aW9uLlxuICovXG5mdW5jdGlvbiBwb3B1bGF0ZURlaHlkcmF0ZWRWaWV3c0luTENvbnRhaW5lckltcGwoXG4gIGxDb250YWluZXI6IExDb250YWluZXIsXG4gIHROb2RlOiBUTm9kZSxcbiAgaG9zdExWaWV3OiBMVmlldyxcbik6IGJvb2xlYW4ge1xuICAvLyBXZSBhbHJlYWR5IGhhdmUgYSBuYXRpdmUgZWxlbWVudCAoYW5jaG9yKSBzZXQgYW5kIHRoZSBwcm9jZXNzXG4gIC8vIG9mIGZpbmRpbmcgZGVoeWRyYXRlZCB2aWV3cyBoYXBwZW5lZCAoc28gdGhlIGBsQ29udGFpbmVyW0RFSFlEUkFURURfVklFV1NdYFxuICAvLyBpcyBub3QgbnVsbCksIGV4aXQgZWFybHkuXG4gIGlmIChsQ29udGFpbmVyW05BVElWRV0gJiYgbENvbnRhaW5lcltERUhZRFJBVEVEX1ZJRVdTXSkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgY29uc3QgaHlkcmF0aW9uSW5mbyA9IGhvc3RMVmlld1tIWURSQVRJT05dO1xuICBjb25zdCBub09mZnNldEluZGV4ID0gdE5vZGUuaW5kZXggLSBIRUFERVJfT0ZGU0VUO1xuICBjb25zdCBpc05vZGVDcmVhdGlvbk1vZGUgPVxuICAgICFoeWRyYXRpb25JbmZvIHx8XG4gICAgaXNJblNraXBIeWRyYXRpb25CbG9jayh0Tm9kZSkgfHxcbiAgICBpc0Rpc2Nvbm5lY3RlZE5vZGUoaHlkcmF0aW9uSW5mbywgbm9PZmZzZXRJbmRleCk7XG5cbiAgLy8gUmVndWxhciBjcmVhdGlvbiBtb2RlLlxuICBpZiAoaXNOb2RlQ3JlYXRpb25Nb2RlKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gSHlkcmF0aW9uIG1vZGUsIGxvb2tpbmcgdXAgYW4gYW5jaG9yIG5vZGUgYW5kIGRlaHlkcmF0ZWQgdmlld3MgaW4gRE9NLlxuICBjb25zdCBjdXJyZW50Uk5vZGU6IFJOb2RlIHwgbnVsbCA9IGdldFNlZ21lbnRIZWFkKGh5ZHJhdGlvbkluZm8sIG5vT2Zmc2V0SW5kZXgpO1xuXG4gIGNvbnN0IHNlcmlhbGl6ZWRWaWV3cyA9IGh5ZHJhdGlvbkluZm8uZGF0YVtDT05UQUlORVJTXT8uW25vT2Zmc2V0SW5kZXhdO1xuICBuZ0Rldk1vZGUgJiZcbiAgICBhc3NlcnREZWZpbmVkKFxuICAgICAgc2VyaWFsaXplZFZpZXdzLFxuICAgICAgJ1VuZXhwZWN0ZWQgc3RhdGU6IG5vIGh5ZHJhdGlvbiBpbmZvIGF2YWlsYWJsZSBmb3IgYSBnaXZlbiBUTm9kZSwgJyArXG4gICAgICAgICd3aGljaCByZXByZXNlbnRzIGEgdmlldyBjb250YWluZXIuJyxcbiAgICApO1xuXG4gIGNvbnN0IFtjb21tZW50Tm9kZSwgZGVoeWRyYXRlZFZpZXdzXSA9IGxvY2F0ZURlaHlkcmF0ZWRWaWV3c0luQ29udGFpbmVyKFxuICAgIGN1cnJlbnRSTm9kZSEsXG4gICAgc2VyaWFsaXplZFZpZXdzISxcbiAgKTtcblxuICBpZiAobmdEZXZNb2RlKSB7XG4gICAgdmFsaWRhdGVNYXRjaGluZ05vZGUoY29tbWVudE5vZGUsIE5vZGUuQ09NTUVOVF9OT0RFLCBudWxsLCBob3N0TFZpZXcsIHROb2RlLCB0cnVlKTtcbiAgICAvLyBEbyBub3QgdGhyb3cgaW4gY2FzZSB0aGlzIG5vZGUgaXMgYWxyZWFkeSBjbGFpbWVkICh0aHVzIGBmYWxzZWAgYXMgYSBzZWNvbmRcbiAgICAvLyBhcmd1bWVudCkuIElmIHRoaXMgY29udGFpbmVyIGlzIGNyZWF0ZWQgYmFzZWQgb24gYW4gYDxuZy10ZW1wbGF0ZT5gLCB0aGUgY29tbWVudFxuICAgIC8vIG5vZGUgd291bGQgYmUgYWxyZWFkeSBjbGFpbWVkIGZyb20gdGhlIGB0ZW1wbGF0ZWAgaW5zdHJ1Y3Rpb24uIElmIGFuIGVsZW1lbnQgYWN0c1xuICAgIC8vIGFzIGFuIGFuY2hvciAoZS5nLiA8ZGl2ICN2Y1JlZj4pLCBhIHNlcGFyYXRlIGNvbW1lbnQgbm9kZSB3b3VsZCBiZSBjcmVhdGVkL2xvY2F0ZWQsXG4gICAgLy8gc28gd2UgbmVlZCB0byBjbGFpbSBpdCBoZXJlLlxuICAgIG1hcmtSTm9kZUFzQ2xhaW1lZEJ5SHlkcmF0aW9uKGNvbW1lbnROb2RlLCBmYWxzZSk7XG4gIH1cblxuICBsQ29udGFpbmVyW05BVElWRV0gPSBjb21tZW50Tm9kZSBhcyBSQ29tbWVudDtcbiAgbENvbnRhaW5lcltERUhZRFJBVEVEX1ZJRVdTXSA9IGRlaHlkcmF0ZWRWaWV3cztcblxuICByZXR1cm4gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gbG9jYXRlT3JDcmVhdGVBbmNob3JOb2RlKFxuICBsQ29udGFpbmVyOiBMQ29udGFpbmVyLFxuICBob3N0TFZpZXc6IExWaWV3LFxuICBob3N0VE5vZGU6IFROb2RlLFxuICBzbG90VmFsdWU6IGFueSxcbik6IHZvaWQge1xuICBpZiAoIV9wb3B1bGF0ZURlaHlkcmF0ZWRWaWV3c0luTENvbnRhaW5lcihsQ29udGFpbmVyLCBob3N0VE5vZGUsIGhvc3RMVmlldykpIHtcbiAgICAvLyBQb3B1bGF0aW5nIGRlaHlkcmF0ZWQgdmlld3Mgb3BlcmF0aW9uIHJldHVybmVkIGBmYWxzZWAsIHdoaWNoIGluZGljYXRlc1xuICAgIC8vIHRoYXQgdGhlIGxvZ2ljIHdhcyBydW5uaW5nIGluIGNsaWVudC1vbmx5IG1vZGUsIHRoaXMgYW4gYW5jaG9yIGNvbW1lbnRcbiAgICAvLyBub2RlIHNob3VsZCBiZSBjcmVhdGVkIGZvciB0aGlzIGNvbnRhaW5lci5cbiAgICBjcmVhdGVBbmNob3JOb2RlKGxDb250YWluZXIsIGhvc3RMVmlldywgaG9zdFROb2RlLCBzbG90VmFsdWUpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBlbmFibGVMb2NhdGVPckNyZWF0ZUNvbnRhaW5lclJlZkltcGwoKSB7XG4gIF9sb2NhdGVPckNyZWF0ZUFuY2hvck5vZGUgPSBsb2NhdGVPckNyZWF0ZUFuY2hvck5vZGU7XG4gIF9wb3B1bGF0ZURlaHlkcmF0ZWRWaWV3c0luTENvbnRhaW5lciA9IHBvcHVsYXRlRGVoeWRyYXRlZFZpZXdzSW5MQ29udGFpbmVySW1wbDtcbn1cbiJdfQ==