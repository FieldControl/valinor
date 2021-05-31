/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ChangeDetectionStrategy } from '../../change_detection/constants';
import { Injector } from '../../di/injector';
import { assertEqual } from '../../util/assert';
import { assertLView } from '../assert';
import { discoverLocalRefs, getComponentAtNodeIndex, getDirectivesAtNodeIndex, getLContext } from '../context_discovery';
import { getComponentDef, getDirectiveDef } from '../definition';
import { NodeInjector } from '../di';
import { buildDebugNode } from '../instructions/lview_debug';
import { isLView } from '../interfaces/type_checks';
import { CLEANUP, CONTEXT, FLAGS, T_HOST, TVIEW } from '../interfaces/view';
import { getLViewParent, getRootContext } from './view_traversal_utils';
import { getTNode, unwrapRNode } from './view_utils';
/**
 * Retrieves the component instance associated with a given DOM element.
 *
 * @usageNotes
 * Given the following DOM structure:
 *
 * ```html
 * <app-root>
 *   <div>
 *     <child-comp></child-comp>
 *   </div>
 * </app-root>
 * ```
 *
 * Calling `getComponent` on `<child-comp>` will return the instance of `ChildComponent`
 * associated with this DOM element.
 *
 * Calling the function on `<app-root>` will return the `MyApp` instance.
 *
 *
 * @param element DOM element from which the component should be retrieved.
 * @returns Component instance associated with the element or `null` if there
 *    is no component associated with it.
 *
 * @publicApi
 * @globalApi ng
 */
export function getComponent(element) {
    assertDomElement(element);
    const context = getLContext(element);
    if (context === null)
        return null;
    if (context.component === undefined) {
        context.component = getComponentAtNodeIndex(context.nodeIndex, context.lView);
    }
    return context.component;
}
/**
 * If inside an embedded view (e.g. `*ngIf` or `*ngFor`), retrieves the context of the embedded
 * view that the element is part of. Otherwise retrieves the instance of the component whose view
 * owns the element (in this case, the result is the same as calling `getOwningComponent`).
 *
 * @param element Element for which to get the surrounding component instance.
 * @returns Instance of the component that is around the element or null if the element isn't
 *    inside any component.
 *
 * @publicApi
 * @globalApi ng
 */
export function getContext(element) {
    assertDomElement(element);
    const context = getLContext(element);
    return context === null ? null : context.lView[CONTEXT];
}
/**
 * Retrieves the component instance whose view contains the DOM element.
 *
 * For example, if `<child-comp>` is used in the template of `<app-comp>`
 * (i.e. a `ViewChild` of `<app-comp>`), calling `getOwningComponent` on `<child-comp>`
 * would return `<app-comp>`.
 *
 * @param elementOrDir DOM element, component or directive instance
 *    for which to retrieve the root components.
 * @returns Component instance whose view owns the DOM element or null if the element is not
 *    part of a component view.
 *
 * @publicApi
 * @globalApi ng
 */
export function getOwningComponent(elementOrDir) {
    const context = getLContext(elementOrDir);
    if (context === null)
        return null;
    let lView = context.lView;
    let parent;
    ngDevMode && assertLView(lView);
    while (lView[TVIEW].type === 2 /* Embedded */ && (parent = getLViewParent(lView))) {
        lView = parent;
    }
    return lView[FLAGS] & 512 /* IsRoot */ ? null : lView[CONTEXT];
}
/**
 * Retrieves all root components associated with a DOM element, directive or component instance.
 * Root components are those which have been bootstrapped by Angular.
 *
 * @param elementOrDir DOM element, component or directive instance
 *    for which to retrieve the root components.
 * @returns Root components associated with the target object.
 *
 * @publicApi
 * @globalApi ng
 */
export function getRootComponents(elementOrDir) {
    return [...getRootContext(elementOrDir).components];
}
/**
 * Retrieves an `Injector` associated with an element, component or directive instance.
 *
 * @param elementOrDir DOM element, component or directive instance for which to
 *    retrieve the injector.
 * @returns Injector associated with the element, component or directive instance.
 *
 * @publicApi
 * @globalApi ng
 */
export function getInjector(elementOrDir) {
    const context = getLContext(elementOrDir);
    if (context === null)
        return Injector.NULL;
    const tNode = context.lView[TVIEW].data[context.nodeIndex];
    return new NodeInjector(tNode, context.lView);
}
/**
 * Retrieve a set of injection tokens at a given DOM node.
 *
 * @param element Element for which the injection tokens should be retrieved.
 */
export function getInjectionTokens(element) {
    const context = getLContext(element);
    if (context === null)
        return [];
    const lView = context.lView;
    const tView = lView[TVIEW];
    const tNode = tView.data[context.nodeIndex];
    const providerTokens = [];
    const startIndex = tNode.providerIndexes & 1048575 /* ProvidersStartIndexMask */;
    const endIndex = tNode.directiveEnd;
    for (let i = startIndex; i < endIndex; i++) {
        let value = tView.data[i];
        if (isDirectiveDefHack(value)) {
            // The fact that we sometimes store Type and sometimes DirectiveDef in this location is a
            // design flaw.  We should always store same type so that we can be monomorphic. The issue
            // is that for Components/Directives we store the def instead the type. The correct behavior
            // is that we should always be storing injectable type in this location.
            value = value.type;
        }
        providerTokens.push(value);
    }
    return providerTokens;
}
/**
 * Retrieves directive instances associated with a given DOM node. Does not include
 * component instances.
 *
 * @usageNotes
 * Given the following DOM structure:
 *
 * ```html
 * <app-root>
 *   <button my-button></button>
 *   <my-comp></my-comp>
 * </app-root>
 * ```
 *
 * Calling `getDirectives` on `<button>` will return an array with an instance of the `MyButton`
 * directive that is associated with the DOM node.
 *
 * Calling `getDirectives` on `<my-comp>` will return an empty array.
 *
 * @param node DOM node for which to get the directives.
 * @returns Array of directives associated with the node.
 *
 * @publicApi
 * @globalApi ng
 */
export function getDirectives(node) {
    // Skip text nodes because we can't have directives associated with them.
    if (node instanceof Text) {
        return [];
    }
    const context = getLContext(node);
    if (context === null) {
        return [];
    }
    const lView = context.lView;
    const tView = lView[TVIEW];
    const nodeIndex = context.nodeIndex;
    if (!(tView === null || tView === void 0 ? void 0 : tView.data[nodeIndex])) {
        return [];
    }
    if (context.directives === undefined) {
        context.directives = getDirectivesAtNodeIndex(nodeIndex, lView, false);
    }
    // The `directives` in this case are a named array called `LComponentView`. Clone the
    // result so we don't expose an internal data structure in the user's console.
    return context.directives === null ? [] : [...context.directives];
}
/**
 * Returns the debug (partial) metadata for a particular directive or component instance.
 * The function accepts an instance of a directive or component and returns the corresponding
 * metadata.
 *
 * @param directiveOrComponentInstance Instance of a directive or component
 * @returns metadata of the passed directive or component
 *
 * @publicApi
 * @globalApi ng
 */
export function getDirectiveMetadata(directiveOrComponentInstance) {
    const { constructor } = directiveOrComponentInstance;
    if (!constructor) {
        throw new Error('Unable to find the instance constructor');
    }
    // In case a component inherits from a directive, we may have component and directive metadata
    // To ensure we don't get the metadata of the directive, we want to call `getComponentDef` first.
    const componentDef = getComponentDef(constructor);
    if (componentDef) {
        return {
            inputs: componentDef.inputs,
            outputs: componentDef.outputs,
            encapsulation: componentDef.encapsulation,
            changeDetection: componentDef.onPush ? ChangeDetectionStrategy.OnPush :
                ChangeDetectionStrategy.Default
        };
    }
    const directiveDef = getDirectiveDef(constructor);
    if (directiveDef) {
        return { inputs: directiveDef.inputs, outputs: directiveDef.outputs };
    }
    return null;
}
/**
 * Retrieve map of local references.
 *
 * The references are retrieved as a map of local reference name to element or directive instance.
 *
 * @param target DOM element, component or directive instance for which to retrieve
 *    the local references.
 */
export function getLocalRefs(target) {
    const context = getLContext(target);
    if (context === null)
        return {};
    if (context.localRefs === undefined) {
        context.localRefs = discoverLocalRefs(context.lView, context.nodeIndex);
    }
    return context.localRefs || {};
}
/**
 * Retrieves the host element of a component or directive instance.
 * The host element is the DOM element that matched the selector of the directive.
 *
 * @param componentOrDirective Component or directive instance for which the host
 *     element should be retrieved.
 * @returns Host element of the target.
 *
 * @publicApi
 * @globalApi ng
 */
export function getHostElement(componentOrDirective) {
    return getLContext(componentOrDirective).native;
}
/**
 * Retrieves the rendered text for a given component.
 *
 * This function retrieves the host element of a component and
 * and then returns the `textContent` for that element. This implies
 * that the text returned will include re-projected content of
 * the component as well.
 *
 * @param component The component to return the content text for.
 */
export function getRenderedText(component) {
    const hostElement = getHostElement(component);
    return hostElement.textContent || '';
}
/**
 * Retrieves a list of event listeners associated with a DOM element. The list does include host
 * listeners, but it does not include event listeners defined outside of the Angular context
 * (e.g. through `addEventListener`).
 *
 * @usageNotes
 * Given the following DOM structure:
 *
 * ```html
 * <app-root>
 *   <div (click)="doSomething()"></div>
 * </app-root>
 * ```
 *
 * Calling `getListeners` on `<div>` will return an object that looks as follows:
 *
 * ```ts
 * {
 *   name: 'click',
 *   element: <div>,
 *   callback: () => doSomething(),
 *   useCapture: false
 * }
 * ```
 *
 * @param element Element for which the DOM listeners should be retrieved.
 * @returns Array of event listeners on the DOM element.
 *
 * @publicApi
 * @globalApi ng
 */
export function getListeners(element) {
    assertDomElement(element);
    const lContext = getLContext(element);
    if (lContext === null)
        return [];
    const lView = lContext.lView;
    const tView = lView[TVIEW];
    const lCleanup = lView[CLEANUP];
    const tCleanup = tView.cleanup;
    const listeners = [];
    if (tCleanup && lCleanup) {
        for (let i = 0; i < tCleanup.length;) {
            const firstParam = tCleanup[i++];
            const secondParam = tCleanup[i++];
            if (typeof firstParam === 'string') {
                const name = firstParam;
                const listenerElement = unwrapRNode(lView[secondParam]);
                const callback = lCleanup[tCleanup[i++]];
                const useCaptureOrIndx = tCleanup[i++];
                // if useCaptureOrIndx is boolean then report it as is.
                // if useCaptureOrIndx is positive number then it in unsubscribe method
                // if useCaptureOrIndx is negative number then it is a Subscription
                const type = (typeof useCaptureOrIndx === 'boolean' || useCaptureOrIndx >= 0) ? 'dom' : 'output';
                const useCapture = typeof useCaptureOrIndx === 'boolean' ? useCaptureOrIndx : false;
                if (element == listenerElement) {
                    listeners.push({ element, name, callback, useCapture, type });
                }
            }
        }
    }
    listeners.sort(sortListeners);
    return listeners;
}
function sortListeners(a, b) {
    if (a.name == b.name)
        return 0;
    return a.name < b.name ? -1 : 1;
}
/**
 * This function should not exist because it is megamorphic and only mostly correct.
 *
 * See call site for more info.
 */
function isDirectiveDefHack(obj) {
    return obj.type !== undefined && obj.template !== undefined && obj.declaredInputs !== undefined;
}
/**
 * Returns the attached `DebugNode` instance for an element in the DOM.
 *
 * @param element DOM element which is owned by an existing component's view.
 */
export function getDebugNode(element) {
    if (ngDevMode && !(element instanceof Node)) {
        throw new Error('Expecting instance of DOM Element');
    }
    const lContext = getLContext(element);
    if (lContext === null) {
        return null;
    }
    const lView = lContext.lView;
    const nodeIndex = lContext.nodeIndex;
    if (nodeIndex !== -1) {
        const valueInLView = lView[nodeIndex];
        // this means that value in the lView is a component with its own
        // data. In this situation the TNode is not accessed at the same spot.
        const tNode = isLView(valueInLView) ? valueInLView[T_HOST] : getTNode(lView[TVIEW], nodeIndex);
        ngDevMode &&
            assertEqual(tNode.index, nodeIndex, 'Expecting that TNode at index is same as index');
        return buildDebugNode(tNode, lView);
    }
    return null;
}
/**
 * Retrieve the component `LView` from component/element.
 *
 * NOTE: `LView` is a private and should not be leaked outside.
 *       Don't export this method to `ng.*` on window.
 *
 * @param target DOM element or component instance for which to retrieve the LView.
 */
export function getComponentLView(target) {
    const lContext = getLContext(target);
    const nodeIndx = lContext.nodeIndex;
    const lView = lContext.lView;
    const componentLView = lView[nodeIndx];
    ngDevMode && assertLView(componentLView);
    return componentLView;
}
/** Asserts that a value is a DOM Element. */
function assertDomElement(value) {
    if (typeof Element !== 'undefined' && !(value instanceof Element)) {
        throw new Error('Expecting instance of DOM Element');
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlzY292ZXJ5X3V0aWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS9zcmMvcmVuZGVyMy91dGlsL2Rpc2NvdmVyeV91dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsdUJBQXVCLEVBQUMsTUFBTSxrQ0FBa0MsQ0FBQztBQUN6RSxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFFM0MsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQzlDLE9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSxXQUFXLENBQUM7QUFDdEMsT0FBTyxFQUFDLGlCQUFpQixFQUFFLHVCQUF1QixFQUFFLHdCQUF3QixFQUFFLFdBQVcsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBQ3ZILE9BQU8sRUFBQyxlQUFlLEVBQUUsZUFBZSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQy9ELE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxPQUFPLENBQUM7QUFDbkMsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLDZCQUE2QixDQUFDO0FBSTNELE9BQU8sRUFBQyxPQUFPLEVBQUMsTUFBTSwyQkFBMkIsQ0FBQztBQUNsRCxPQUFPLEVBQUMsT0FBTyxFQUFFLE9BQU8sRUFBYSxLQUFLLEVBQXFCLE1BQU0sRUFBRSxLQUFLLEVBQVksTUFBTSxvQkFBb0IsQ0FBQztBQUVuSCxPQUFPLEVBQUMsY0FBYyxFQUFFLGNBQWMsRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBQ3RFLE9BQU8sRUFBQyxRQUFRLEVBQUUsV0FBVyxFQUFDLE1BQU0sY0FBYyxDQUFDO0FBSW5EOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQTBCRztBQUNILE1BQU0sVUFBVSxZQUFZLENBQUksT0FBZ0I7SUFDOUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLENBQUM7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QUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBRSxZQUFZLENBQUMsTUFBTSxDQUFXLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDaEcsU0FBUztZQUNMLFdBQVcsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxnREFBZ0QsQ0FBQyxDQUFDO1FBQzFGLE9BQU8sY0FBYyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztLQUNyQztJQUVELE9BQU8sSUFBSSxDQUFDO0FBQ2QsQ0FBQztBQUVEOzs7Ozs7O0dBT0c7QUFDSCxNQUFNLFVBQVUsaUJBQWlCLENBQUMsTUFBVztJQUMzQyxNQUFNLFFBQVEsR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFFLENBQUM7SUFDdEMsTUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLFNBQVMsQ0FBQztJQUNwQyxNQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDO0lBQzdCLE1BQU0sY0FBYyxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUN2QyxTQUFTLElBQUksV0FBVyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQ3pDLE9BQU8sY0FBYyxDQUFDO0FBQ3hCLENBQUM7QUFFRCw2Q0FBNkM7QUFDN0MsU0FBUyxnQkFBZ0IsQ0FBQyxLQUFVO0lBQ2xDLElBQUksT0FBTyxPQUFPLEtBQUssV0FBVyxJQUFJLENBQUMsQ0FBQyxLQUFLLFlBQVksT0FBTyxDQUFDLEVBQUU7UUFDakUsTUFBTSxJQUFJLEtBQUssQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDO0tBQ3REO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NoYW5nZURldGVjdGlvblN0cmF0ZWd5fSBmcm9tICcuLi8uLi9jaGFuZ2VfZGV0ZWN0aW9uL2NvbnN0YW50cyc7XG5pbXBvcnQge0luamVjdG9yfSBmcm9tICcuLi8uLi9kaS9pbmplY3Rvcic7XG5pbXBvcnQge1ZpZXdFbmNhcHN1bGF0aW9ufSBmcm9tICcuLi8uLi9tZXRhZGF0YS92aWV3JztcbmltcG9ydCB7YXNzZXJ0RXF1YWx9IGZyb20gJy4uLy4uL3V0aWwvYXNzZXJ0JztcbmltcG9ydCB7YXNzZXJ0TFZpZXd9IGZyb20gJy4uL2Fzc2VydCc7XG5pbXBvcnQge2Rpc2NvdmVyTG9jYWxSZWZzLCBnZXRDb21wb25lbnRBdE5vZGVJbmRleCwgZ2V0RGlyZWN0aXZlc0F0Tm9kZUluZGV4LCBnZXRMQ29udGV4dH0gZnJvbSAnLi4vY29udGV4dF9kaXNjb3ZlcnknO1xuaW1wb3J0IHtnZXRDb21wb25lbnREZWYsIGdldERpcmVjdGl2ZURlZn0gZnJvbSAnLi4vZGVmaW5pdGlvbic7XG5pbXBvcnQge05vZGVJbmplY3Rvcn0gZnJvbSAnLi4vZGknO1xuaW1wb3J0IHtidWlsZERlYnVnTm9kZX0gZnJvbSAnLi4vaW5zdHJ1Y3Rpb25zL2x2aWV3X2RlYnVnJztcbmltcG9ydCB7TENvbnRleHR9IGZyb20gJy4uL2ludGVyZmFjZXMvY29udGV4dCc7XG5pbXBvcnQge0RpcmVjdGl2ZURlZn0gZnJvbSAnLi4vaW50ZXJmYWNlcy9kZWZpbml0aW9uJztcbmltcG9ydCB7VEVsZW1lbnROb2RlLCBUTm9kZSwgVE5vZGVQcm92aWRlckluZGV4ZXN9IGZyb20gJy4uL2ludGVyZmFjZXMvbm9kZSc7XG5pbXBvcnQge2lzTFZpZXd9IGZyb20gJy4uL2ludGVyZmFjZXMvdHlwZV9jaGVja3MnO1xuaW1wb3J0IHtDTEVBTlVQLCBDT05URVhULCBEZWJ1Z05vZGUsIEZMQUdTLCBMVmlldywgTFZpZXdGbGFncywgVF9IT1NULCBUVklFVywgVFZpZXdUeXBlfSBmcm9tICcuLi9pbnRlcmZhY2VzL3ZpZXcnO1xuaW1wb3J0IHtzdHJpbmdpZnlGb3JFcnJvcn0gZnJvbSAnLi9zdHJpbmdpZnlfdXRpbHMnO1xuaW1wb3J0IHtnZXRMVmlld1BhcmVudCwgZ2V0Um9vdENvbnRleHR9IGZyb20gJy4vdmlld190cmF2ZXJzYWxfdXRpbHMnO1xuaW1wb3J0IHtnZXRUTm9kZSwgdW53cmFwUk5vZGV9IGZyb20gJy4vdmlld191dGlscyc7XG5cblxuXG4vKipcbiAqIFJldHJpZXZlcyB0aGUgY29tcG9uZW50IGluc3RhbmNlIGFzc29jaWF0ZWQgd2l0aCBhIGdpdmVuIERPTSBlbGVtZW50LlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKiBHaXZlbiB0aGUgZm9sbG93aW5nIERPTSBzdHJ1Y3R1cmU6XG4gKlxuICogYGBgaHRtbFxuICogPGFwcC1yb290PlxuICogICA8ZGl2PlxuICogICAgIDxjaGlsZC1jb21wPjwvY2hpbGQtY29tcD5cbiAqICAgPC9kaXY+XG4gKiA8L2FwcC1yb290PlxuICogYGBgXG4gKlxuICogQ2FsbGluZyBgZ2V0Q29tcG9uZW50YCBvbiBgPGNoaWxkLWNvbXA+YCB3aWxsIHJldHVybiB0aGUgaW5zdGFuY2Ugb2YgYENoaWxkQ29tcG9uZW50YFxuICogYXNzb2NpYXRlZCB3aXRoIHRoaXMgRE9NIGVsZW1lbnQuXG4gKlxuICogQ2FsbGluZyB0aGUgZnVuY3Rpb24gb24gYDxhcHAtcm9vdD5gIHdpbGwgcmV0dXJuIHRoZSBgTXlBcHBgIGluc3RhbmNlLlxuICpcbiAqXG4gKiBAcGFyYW0gZWxlbWVudCBET00gZWxlbWVudCBmcm9tIHdoaWNoIHRoZSBjb21wb25lbnQgc2hvdWxkIGJlIHJldHJpZXZlZC5cbiAqIEByZXR1cm5zIENvbXBvbmVudCBpbnN0YW5jZSBhc3NvY2lhdGVkIHdpdGggdGhlIGVsZW1lbnQgb3IgYG51bGxgIGlmIHRoZXJlXG4gKiAgICBpcyBubyBjb21wb25lbnQgYXNzb2NpYXRlZCB3aXRoIGl0LlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqIEBnbG9iYWxBcGkgbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldENvbXBvbmVudDxUPihlbGVtZW50OiBFbGVtZW50KTogVHxudWxsIHtcbiAgYXNzZXJ0RG9tRWxlbWVudChlbGVtZW50KTtcbiAgY29uc3QgY29udGV4dCA9IGdldExDb250ZXh0KGVsZW1lbnQpO1xuICBpZiAoY29udGV4dCA9PT0gbnVsbCkgcmV0dXJuIG51bGw7XG5cbiAgaWYgKGNvbnRleHQuY29tcG9uZW50ID09PSB1bmRlZmluZWQpIHtcbiAgICBjb250ZXh0LmNvbXBvbmVudCA9IGdldENvbXBvbmVudEF0Tm9kZUluZGV4KGNvbnRleHQubm9kZUluZGV4LCBjb250ZXh0LmxWaWV3KTtcbiAgfVxuXG4gIHJldHVybiBjb250ZXh0LmNvbXBvbmVudCBhcyBUO1xufVxuXG5cbi8qKlxuICogSWYgaW5zaWRlIGFuIGVtYmVkZGVkIHZpZXcgKGUuZy4gYCpuZ0lmYCBvciBgKm5nRm9yYCksIHJldHJpZXZlcyB0aGUgY29udGV4dCBvZiB0aGUgZW1iZWRkZWRcbiAqIHZpZXcgdGhhdCB0aGUgZWxlbWVudCBpcyBwYXJ0IG9mLiBPdGhlcndpc2UgcmV0cmlldmVzIHRoZSBpbnN0YW5jZSBvZiB0aGUgY29tcG9uZW50IHdob3NlIHZpZXdcbiAqIG93bnMgdGhlIGVsZW1lbnQgKGluIHRoaXMgY2FzZSwgdGhlIHJlc3VsdCBpcyB0aGUgc2FtZSBhcyBjYWxsaW5nIGBnZXRPd25pbmdDb21wb25lbnRgKS5cbiAqXG4gKiBAcGFyYW0gZWxlbWVudCBFbGVtZW50IGZvciB3aGljaCB0byBnZXQgdGhlIHN1cnJvdW5kaW5nIGNvbXBvbmVudCBpbnN0YW5jZS5cbiAqIEByZXR1cm5zIEluc3RhbmNlIG9mIHRoZSBjb21wb25lbnQgdGhhdCBpcyBhcm91bmQgdGhlIGVsZW1lbnQgb3IgbnVsbCBpZiB0aGUgZWxlbWVudCBpc24ndFxuICogICAgaW5zaWRlIGFueSBjb21wb25lbnQuXG4gKlxuICogQHB1YmxpY0FwaVxuICogQGdsb2JhbEFwaSBuZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29udGV4dDxUPihlbGVtZW50OiBFbGVtZW50KTogVHxudWxsIHtcbiAgYXNzZXJ0RG9tRWxlbWVudChlbGVtZW50KTtcbiAgY29uc3QgY29udGV4dCA9IGdldExDb250ZXh0KGVsZW1lbnQpO1xuICByZXR1cm4gY29udGV4dCA9PT0gbnVsbCA/IG51bGwgOiBjb250ZXh0LmxWaWV3W0NPTlRFWFRdIGFzIFQ7XG59XG5cbi8qKlxuICogUmV0cmlldmVzIHRoZSBjb21wb25lbnQgaW5zdGFuY2Ugd2hvc2UgdmlldyBjb250YWlucyB0aGUgRE9NIGVsZW1lbnQuXG4gKlxuICogRm9yIGV4YW1wbGUsIGlmIGA8Y2hpbGQtY29tcD5gIGlzIHVzZWQgaW4gdGhlIHRlbXBsYXRlIG9mIGA8YXBwLWNvbXA+YFxuICogKGkuZS4gYSBgVmlld0NoaWxkYCBvZiBgPGFwcC1jb21wPmApLCBjYWxsaW5nIGBnZXRPd25pbmdDb21wb25lbnRgIG9uIGA8Y2hpbGQtY29tcD5gXG4gKiB3b3VsZCByZXR1cm4gYDxhcHAtY29tcD5gLlxuICpcbiAqIEBwYXJhbSBlbGVtZW50T3JEaXIgRE9NIGVsZW1lbnQsIGNvbXBvbmVudCBvciBkaXJlY3RpdmUgaW5zdGFuY2VcbiAqICAgIGZvciB3aGljaCB0byByZXRyaWV2ZSB0aGUgcm9vdCBjb21wb25lbnRzLlxuICogQHJldHVybnMgQ29tcG9uZW50IGluc3RhbmNlIHdob3NlIHZpZXcgb3ducyB0aGUgRE9NIGVsZW1lbnQgb3IgbnVsbCBpZiB0aGUgZWxlbWVudCBpcyBub3RcbiAqICAgIHBhcnQgb2YgYSBjb21wb25lbnQgdmlldy5cbiAqXG4gKiBAcHVibGljQXBpXG4gKiBAZ2xvYmFsQXBpIG5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRPd25pbmdDb21wb25lbnQ8VD4oZWxlbWVudE9yRGlyOiBFbGVtZW50fHt9KTogVHxudWxsIHtcbiAgY29uc3QgY29udGV4dCA9IGdldExDb250ZXh0KGVsZW1lbnRPckRpcik7XG4gIGlmIChjb250ZXh0ID09PSBudWxsKSByZXR1cm4gbnVsbDtcblxuICBsZXQgbFZpZXcgPSBjb250ZXh0LmxWaWV3O1xuICBsZXQgcGFyZW50OiBMVmlld3xudWxsO1xuICBuZ0Rldk1vZGUgJiYgYXNzZXJ0TFZpZXcobFZpZXcpO1xuICB3aGlsZSAobFZpZXdbVFZJRVddLnR5cGUgPT09IFRWaWV3VHlwZS5FbWJlZGRlZCAmJiAocGFyZW50ID0gZ2V0TFZpZXdQYXJlbnQobFZpZXcpISkpIHtcbiAgICBsVmlldyA9IHBhcmVudDtcbiAgfVxuICByZXR1cm4gbFZpZXdbRkxBR1NdICYgTFZpZXdGbGFncy5Jc1Jvb3QgPyBudWxsIDogbFZpZXdbQ09OVEVYVF0gYXMgVDtcbn1cblxuLyoqXG4gKiBSZXRyaWV2ZXMgYWxsIHJvb3QgY29tcG9uZW50cyBhc3NvY2lhdGVkIHdpdGggYSBET00gZWxlbWVudCwgZGlyZWN0aXZlIG9yIGNvbXBvbmVudCBpbnN0YW5jZS5cbiAqIFJvb3QgY29tcG9uZW50cyBhcmUgdGhvc2Ugd2hpY2ggaGF2ZSBiZWVuIGJvb3RzdHJhcHBlZCBieSBBbmd1bGFyLlxuICpcbiAqIEBwYXJhbSBlbGVtZW50T3JEaXIgRE9NIGVsZW1lbnQsIGNvbXBvbmVudCBvciBkaXJlY3RpdmUgaW5zdGFuY2VcbiAqICAgIGZvciB3aGljaCB0byByZXRyaWV2ZSB0aGUgcm9vdCBjb21wb25lbnRzLlxuICogQHJldHVybnMgUm9vdCBjb21wb25lbnRzIGFzc29jaWF0ZWQgd2l0aCB0aGUgdGFyZ2V0IG9iamVjdC5cbiAqXG4gKiBAcHVibGljQXBpXG4gKiBAZ2xvYmFsQXBpIG5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRSb290Q29tcG9uZW50cyhlbGVtZW50T3JEaXI6IEVsZW1lbnR8e30pOiB7fVtdIHtcbiAgcmV0dXJuIFsuLi5nZXRSb290Q29udGV4dChlbGVtZW50T3JEaXIpLmNvbXBvbmVudHNdO1xufVxuXG4vKipcbiAqIFJldHJpZXZlcyBhbiBgSW5qZWN0b3JgIGFzc29jaWF0ZWQgd2l0aCBhbiBlbGVtZW50LCBjb21wb25lbnQgb3IgZGlyZWN0aXZlIGluc3RhbmNlLlxuICpcbiAqIEBwYXJhbSBlbGVtZW50T3JEaXIgRE9NIGVsZW1lbnQsIGNvbXBvbmVudCBvciBkaXJlY3RpdmUgaW5zdGFuY2UgZm9yIHdoaWNoIHRvXG4gKiAgICByZXRyaWV2ZSB0aGUgaW5qZWN0b3IuXG4gKiBAcmV0dXJucyBJbmplY3RvciBhc3NvY2lhdGVkIHdpdGggdGhlIGVsZW1lbnQsIGNvbXBvbmVudCBvciBkaXJlY3RpdmUgaW5zdGFuY2UuXG4gKlxuICogQHB1YmxpY0FwaVxuICogQGdsb2JhbEFwaSBuZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0SW5qZWN0b3IoZWxlbWVudE9yRGlyOiBFbGVtZW50fHt9KTogSW5qZWN0b3Ige1xuICBjb25zdCBjb250ZXh0ID0gZ2V0TENvbnRleHQoZWxlbWVudE9yRGlyKTtcbiAgaWYgKGNvbnRleHQgPT09IG51bGwpIHJldHVybiBJbmplY3Rvci5OVUxMO1xuXG4gIGNvbnN0IHROb2RlID0gY29udGV4dC5sVmlld1tUVklFV10uZGF0YVtjb250ZXh0Lm5vZGVJbmRleF0gYXMgVEVsZW1lbnROb2RlO1xuICByZXR1cm4gbmV3IE5vZGVJbmplY3Rvcih0Tm9kZSwgY29udGV4dC5sVmlldyk7XG59XG5cbi8qKlxuICogUmV0cmlldmUgYSBzZXQgb2YgaW5qZWN0aW9uIHRva2VucyBhdCBhIGdpdmVuIERPTSBub2RlLlxuICpcbiAqIEBwYXJhbSBlbGVtZW50IEVsZW1lbnQgZm9yIHdoaWNoIHRoZSBpbmplY3Rpb24gdG9rZW5zIHNob3VsZCBiZSByZXRyaWV2ZWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRJbmplY3Rpb25Ub2tlbnMoZWxlbWVudDogRWxlbWVudCk6IGFueVtdIHtcbiAgY29uc3QgY29udGV4dCA9IGdldExDb250ZXh0KGVsZW1lbnQpO1xuICBpZiAoY29udGV4dCA9PT0gbnVsbCkgcmV0dXJuIFtdO1xuICBjb25zdCBsVmlldyA9IGNvbnRleHQubFZpZXc7XG4gIGNvbnN0IHRWaWV3ID0gbFZpZXdbVFZJRVddO1xuICBjb25zdCB0Tm9kZSA9IHRWaWV3LmRhdGFbY29udGV4dC5ub2RlSW5kZXhdIGFzIFROb2RlO1xuICBjb25zdCBwcm92aWRlclRva2VuczogYW55W10gPSBbXTtcbiAgY29uc3Qgc3RhcnRJbmRleCA9IHROb2RlLnByb3ZpZGVySW5kZXhlcyAmIFROb2RlUHJvdmlkZXJJbmRleGVzLlByb3ZpZGVyc1N0YXJ0SW5kZXhNYXNrO1xuICBjb25zdCBlbmRJbmRleCA9IHROb2RlLmRpcmVjdGl2ZUVuZDtcbiAgZm9yIChsZXQgaSA9IHN0YXJ0SW5kZXg7IGkgPCBlbmRJbmRleDsgaSsrKSB7XG4gICAgbGV0IHZhbHVlID0gdFZpZXcuZGF0YVtpXTtcbiAgICBpZiAoaXNEaXJlY3RpdmVEZWZIYWNrKHZhbHVlKSkge1xuICAgICAgLy8gVGhlIGZhY3QgdGhhdCB3ZSBzb21ldGltZXMgc3RvcmUgVHlwZSBhbmQgc29tZXRpbWVzIERpcmVjdGl2ZURlZiBpbiB0aGlzIGxvY2F0aW9uIGlzIGFcbiAgICAgIC8vIGRlc2lnbiBmbGF3LiAgV2Ugc2hvdWxkIGFsd2F5cyBzdG9yZSBzYW1lIHR5cGUgc28gdGhhdCB3ZSBjYW4gYmUgbW9ub21vcnBoaWMuIFRoZSBpc3N1ZVxuICAgICAgLy8gaXMgdGhhdCBmb3IgQ29tcG9uZW50cy9EaXJlY3RpdmVzIHdlIHN0b3JlIHRoZSBkZWYgaW5zdGVhZCB0aGUgdHlwZS4gVGhlIGNvcnJlY3QgYmVoYXZpb3JcbiAgICAgIC8vIGlzIHRoYXQgd2Ugc2hvdWxkIGFsd2F5cyBiZSBzdG9yaW5nIGluamVjdGFibGUgdHlwZSBpbiB0aGlzIGxvY2F0aW9uLlxuICAgICAgdmFsdWUgPSB2YWx1ZS50eXBlO1xuICAgIH1cbiAgICBwcm92aWRlclRva2Vucy5wdXNoKHZhbHVlKTtcbiAgfVxuICByZXR1cm4gcHJvdmlkZXJUb2tlbnM7XG59XG5cbi8qKlxuICogUmV0cmlldmVzIGRpcmVjdGl2ZSBpbnN0YW5jZXMgYXNzb2NpYXRlZCB3aXRoIGEgZ2l2ZW4gRE9NIG5vZGUuIERvZXMgbm90IGluY2x1ZGVcbiAqIGNvbXBvbmVudCBpbnN0YW5jZXMuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqIEdpdmVuIHRoZSBmb2xsb3dpbmcgRE9NIHN0cnVjdHVyZTpcbiAqXG4gKiBgYGBodG1sXG4gKiA8YXBwLXJvb3Q+XG4gKiAgIDxidXR0b24gbXktYnV0dG9uPjwvYnV0dG9uPlxuICogICA8bXktY29tcD48L215LWNvbXA+XG4gKiA8L2FwcC1yb290PlxuICogYGBgXG4gKlxuICogQ2FsbGluZyBgZ2V0RGlyZWN0aXZlc2Agb24gYDxidXR0b24+YCB3aWxsIHJldHVybiBhbiBhcnJheSB3aXRoIGFuIGluc3RhbmNlIG9mIHRoZSBgTXlCdXR0b25gXG4gKiBkaXJlY3RpdmUgdGhhdCBpcyBhc3NvY2lhdGVkIHdpdGggdGhlIERPTSBub2RlLlxuICpcbiAqIENhbGxpbmcgYGdldERpcmVjdGl2ZXNgIG9uIGA8bXktY29tcD5gIHdpbGwgcmV0dXJuIGFuIGVtcHR5IGFycmF5LlxuICpcbiAqIEBwYXJhbSBub2RlIERPTSBub2RlIGZvciB3aGljaCB0byBnZXQgdGhlIGRpcmVjdGl2ZXMuXG4gKiBAcmV0dXJucyBBcnJheSBvZiBkaXJlY3RpdmVzIGFzc29jaWF0ZWQgd2l0aCB0aGUgbm9kZS5cbiAqXG4gKiBAcHVibGljQXBpXG4gKiBAZ2xvYmFsQXBpIG5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXREaXJlY3RpdmVzKG5vZGU6IE5vZGUpOiB7fVtdIHtcbiAgLy8gU2tpcCB0ZXh0IG5vZGVzIGJlY2F1c2Ugd2UgY2FuJ3QgaGF2ZSBkaXJlY3RpdmVzIGFzc29jaWF0ZWQgd2l0aCB0aGVtLlxuICBpZiAobm9kZSBpbnN0YW5jZW9mIFRleHQpIHtcbiAgICByZXR1cm4gW107XG4gIH1cblxuICBjb25zdCBjb250ZXh0ID0gZ2V0TENvbnRleHQobm9kZSk7XG4gIGlmIChjb250ZXh0ID09PSBudWxsKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgY29uc3QgbFZpZXcgPSBjb250ZXh0LmxWaWV3O1xuICBjb25zdCB0VmlldyA9IGxWaWV3W1RWSUVXXTtcbiAgY29uc3Qgbm9kZUluZGV4ID0gY29udGV4dC5ub2RlSW5kZXg7XG4gIGlmICghdFZpZXc/LmRhdGFbbm9kZUluZGV4XSkge1xuICAgIHJldHVybiBbXTtcbiAgfVxuICBpZiAoY29udGV4dC5kaXJlY3RpdmVzID09PSB1bmRlZmluZWQpIHtcbiAgICBjb250ZXh0LmRpcmVjdGl2ZXMgPSBnZXREaXJlY3RpdmVzQXROb2RlSW5kZXgobm9kZUluZGV4LCBsVmlldywgZmFsc2UpO1xuICB9XG5cbiAgLy8gVGhlIGBkaXJlY3RpdmVzYCBpbiB0aGlzIGNhc2UgYXJlIGEgbmFtZWQgYXJyYXkgY2FsbGVkIGBMQ29tcG9uZW50Vmlld2AuIENsb25lIHRoZVxuICAvLyByZXN1bHQgc28gd2UgZG9uJ3QgZXhwb3NlIGFuIGludGVybmFsIGRhdGEgc3RydWN0dXJlIGluIHRoZSB1c2VyJ3MgY29uc29sZS5cbiAgcmV0dXJuIGNvbnRleHQuZGlyZWN0aXZlcyA9PT0gbnVsbCA/IFtdIDogWy4uLmNvbnRleHQuZGlyZWN0aXZlc107XG59XG5cbi8qKlxuICogUGFydGlhbCBtZXRhZGF0YSBmb3IgYSBnaXZlbiBkaXJlY3RpdmUgaW5zdGFuY2UuXG4gKiBUaGlzIGluZm9ybWF0aW9uIG1pZ2h0IGJlIHVzZWZ1bCBmb3IgZGVidWdnaW5nIHB1cnBvc2VzIG9yIHRvb2xpbmcuXG4gKiBDdXJyZW50bHkgb25seSBgaW5wdXRzYCBhbmQgYG91dHB1dHNgIG1ldGFkYXRhIGlzIGF2YWlsYWJsZS5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRGlyZWN0aXZlRGVidWdNZXRhZGF0YSB7XG4gIGlucHV0czogUmVjb3JkPHN0cmluZywgc3RyaW5nPjtcbiAgb3V0cHV0czogUmVjb3JkPHN0cmluZywgc3RyaW5nPjtcbn1cblxuLyoqXG4gKiBQYXJ0aWFsIG1ldGFkYXRhIGZvciBhIGdpdmVuIGNvbXBvbmVudCBpbnN0YW5jZS5cbiAqIFRoaXMgaW5mb3JtYXRpb24gbWlnaHQgYmUgdXNlZnVsIGZvciBkZWJ1Z2dpbmcgcHVycG9zZXMgb3IgdG9vbGluZy5cbiAqIEN1cnJlbnRseSB0aGUgZm9sbG93aW5nIGZpZWxkcyBhcmUgYXZhaWxhYmxlOlxuICogIC0gaW5wdXRzXG4gKiAgLSBvdXRwdXRzXG4gKiAgLSBlbmNhcHN1bGF0aW9uXG4gKiAgLSBjaGFuZ2VEZXRlY3Rpb25cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ29tcG9uZW50RGVidWdNZXRhZGF0YSBleHRlbmRzIERpcmVjdGl2ZURlYnVnTWV0YWRhdGEge1xuICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbjtcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBkZWJ1ZyAocGFydGlhbCkgbWV0YWRhdGEgZm9yIGEgcGFydGljdWxhciBkaXJlY3RpdmUgb3IgY29tcG9uZW50IGluc3RhbmNlLlxuICogVGhlIGZ1bmN0aW9uIGFjY2VwdHMgYW4gaW5zdGFuY2Ugb2YgYSBkaXJlY3RpdmUgb3IgY29tcG9uZW50IGFuZCByZXR1cm5zIHRoZSBjb3JyZXNwb25kaW5nXG4gKiBtZXRhZGF0YS5cbiAqXG4gKiBAcGFyYW0gZGlyZWN0aXZlT3JDb21wb25lbnRJbnN0YW5jZSBJbnN0YW5jZSBvZiBhIGRpcmVjdGl2ZSBvciBjb21wb25lbnRcbiAqIEByZXR1cm5zIG1ldGFkYXRhIG9mIHRoZSBwYXNzZWQgZGlyZWN0aXZlIG9yIGNvbXBvbmVudFxuICpcbiAqIEBwdWJsaWNBcGlcbiAqIEBnbG9iYWxBcGkgbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldERpcmVjdGl2ZU1ldGFkYXRhKGRpcmVjdGl2ZU9yQ29tcG9uZW50SW5zdGFuY2U6IGFueSk6IENvbXBvbmVudERlYnVnTWV0YWRhdGF8XG4gICAgRGlyZWN0aXZlRGVidWdNZXRhZGF0YXxudWxsIHtcbiAgY29uc3Qge2NvbnN0cnVjdG9yfSA9IGRpcmVjdGl2ZU9yQ29tcG9uZW50SW5zdGFuY2U7XG4gIGlmICghY29uc3RydWN0b3IpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1VuYWJsZSB0byBmaW5kIHRoZSBpbnN0YW5jZSBjb25zdHJ1Y3RvcicpO1xuICB9XG4gIC8vIEluIGNhc2UgYSBjb21wb25lbnQgaW5oZXJpdHMgZnJvbSBhIGRpcmVjdGl2ZSwgd2UgbWF5IGhhdmUgY29tcG9uZW50IGFuZCBkaXJlY3RpdmUgbWV0YWRhdGFcbiAgLy8gVG8gZW5zdXJlIHdlIGRvbid0IGdldCB0aGUgbWV0YWRhdGEgb2YgdGhlIGRpcmVjdGl2ZSwgd2Ugd2FudCB0byBjYWxsIGBnZXRDb21wb25lbnREZWZgIGZpcnN0LlxuICBjb25zdCBjb21wb25lbnREZWYgPSBnZXRDb21wb25lbnREZWYoY29uc3RydWN0b3IpO1xuICBpZiAoY29tcG9uZW50RGVmKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGlucHV0czogY29tcG9uZW50RGVmLmlucHV0cyxcbiAgICAgIG91dHB1dHM6IGNvbXBvbmVudERlZi5vdXRwdXRzLFxuICAgICAgZW5jYXBzdWxhdGlvbjogY29tcG9uZW50RGVmLmVuY2Fwc3VsYXRpb24sXG4gICAgICBjaGFuZ2VEZXRlY3Rpb246IGNvbXBvbmVudERlZi5vblB1c2ggPyBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2ggOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuRGVmYXVsdFxuICAgIH07XG4gIH1cbiAgY29uc3QgZGlyZWN0aXZlRGVmID0gZ2V0RGlyZWN0aXZlRGVmKGNvbnN0cnVjdG9yKTtcbiAgaWYgKGRpcmVjdGl2ZURlZikge1xuICAgIHJldHVybiB7aW5wdXRzOiBkaXJlY3RpdmVEZWYuaW5wdXRzLCBvdXRwdXRzOiBkaXJlY3RpdmVEZWYub3V0cHV0c307XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59XG5cbi8qKlxuICogUmV0cmlldmUgbWFwIG9mIGxvY2FsIHJlZmVyZW5jZXMuXG4gKlxuICogVGhlIHJlZmVyZW5jZXMgYXJlIHJldHJpZXZlZCBhcyBhIG1hcCBvZiBsb2NhbCByZWZlcmVuY2UgbmFtZSB0byBlbGVtZW50IG9yIGRpcmVjdGl2ZSBpbnN0YW5jZS5cbiAqXG4gKiBAcGFyYW0gdGFyZ2V0IERPTSBlbGVtZW50LCBjb21wb25lbnQgb3IgZGlyZWN0aXZlIGluc3RhbmNlIGZvciB3aGljaCB0byByZXRyaWV2ZVxuICogICAgdGhlIGxvY2FsIHJlZmVyZW5jZXMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRMb2NhbFJlZnModGFyZ2V0OiB7fSk6IHtba2V5OiBzdHJpbmddOiBhbnl9IHtcbiAgY29uc3QgY29udGV4dCA9IGdldExDb250ZXh0KHRhcmdldCk7XG4gIGlmIChjb250ZXh0ID09PSBudWxsKSByZXR1cm4ge307XG5cbiAgaWYgKGNvbnRleHQubG9jYWxSZWZzID09PSB1bmRlZmluZWQpIHtcbiAgICBjb250ZXh0LmxvY2FsUmVmcyA9IGRpc2NvdmVyTG9jYWxSZWZzKGNvbnRleHQubFZpZXcsIGNvbnRleHQubm9kZUluZGV4KTtcbiAgfVxuXG4gIHJldHVybiBjb250ZXh0LmxvY2FsUmVmcyB8fCB7fTtcbn1cblxuLyoqXG4gKiBSZXRyaWV2ZXMgdGhlIGhvc3QgZWxlbWVudCBvZiBhIGNvbXBvbmVudCBvciBkaXJlY3RpdmUgaW5zdGFuY2UuXG4gKiBUaGUgaG9zdCBlbGVtZW50IGlzIHRoZSBET00gZWxlbWVudCB0aGF0IG1hdGNoZWQgdGhlIHNlbGVjdG9yIG9mIHRoZSBkaXJlY3RpdmUuXG4gKlxuICogQHBhcmFtIGNvbXBvbmVudE9yRGlyZWN0aXZlIENvbXBvbmVudCBvciBkaXJlY3RpdmUgaW5zdGFuY2UgZm9yIHdoaWNoIHRoZSBob3N0XG4gKiAgICAgZWxlbWVudCBzaG91bGQgYmUgcmV0cmlldmVkLlxuICogQHJldHVybnMgSG9zdCBlbGVtZW50IG9mIHRoZSB0YXJnZXQuXG4gKlxuICogQHB1YmxpY0FwaVxuICogQGdsb2JhbEFwaSBuZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0SG9zdEVsZW1lbnQoY29tcG9uZW50T3JEaXJlY3RpdmU6IHt9KTogRWxlbWVudCB7XG4gIHJldHVybiBnZXRMQ29udGV4dChjb21wb25lbnRPckRpcmVjdGl2ZSkhLm5hdGl2ZSBhcyB1bmtub3duIGFzIEVsZW1lbnQ7XG59XG5cbi8qKlxuICogUmV0cmlldmVzIHRoZSByZW5kZXJlZCB0ZXh0IGZvciBhIGdpdmVuIGNvbXBvbmVudC5cbiAqXG4gKiBUaGlzIGZ1bmN0aW9uIHJldHJpZXZlcyB0aGUgaG9zdCBlbGVtZW50IG9mIGEgY29tcG9uZW50IGFuZFxuICogYW5kIHRoZW4gcmV0dXJucyB0aGUgYHRleHRDb250ZW50YCBmb3IgdGhhdCBlbGVtZW50LiBUaGlzIGltcGxpZXNcbiAqIHRoYXQgdGhlIHRleHQgcmV0dXJuZWQgd2lsbCBpbmNsdWRlIHJlLXByb2plY3RlZCBjb250ZW50IG9mXG4gKiB0aGUgY29tcG9uZW50IGFzIHdlbGwuXG4gKlxuICogQHBhcmFtIGNvbXBvbmVudCBUaGUgY29tcG9uZW50IHRvIHJldHVybiB0aGUgY29udGVudCB0ZXh0IGZvci5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFJlbmRlcmVkVGV4dChjb21wb25lbnQ6IGFueSk6IHN0cmluZyB7XG4gIGNvbnN0IGhvc3RFbGVtZW50ID0gZ2V0SG9zdEVsZW1lbnQoY29tcG9uZW50KTtcbiAgcmV0dXJuIGhvc3RFbGVtZW50LnRleHRDb250ZW50IHx8ICcnO1xufVxuXG4vKipcbiAqIEV2ZW50IGxpc3RlbmVyIGNvbmZpZ3VyYXRpb24gcmV0dXJuZWQgZnJvbSBgZ2V0TGlzdGVuZXJzYC5cbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBMaXN0ZW5lciB7XG4gIC8qKiBOYW1lIG9mIHRoZSBldmVudCBsaXN0ZW5lci4gKi9cbiAgbmFtZTogc3RyaW5nO1xuICAvKiogRWxlbWVudCB0aGF0IHRoZSBsaXN0ZW5lciBpcyBib3VuZCB0by4gKi9cbiAgZWxlbWVudDogRWxlbWVudDtcbiAgLyoqIENhbGxiYWNrIHRoYXQgaXMgaW52b2tlZCB3aGVuIHRoZSBldmVudCBpcyB0cmlnZ2VyZWQuICovXG4gIGNhbGxiYWNrOiAodmFsdWU6IGFueSkgPT4gYW55O1xuICAvKiogV2hldGhlciB0aGUgbGlzdGVuZXIgaXMgdXNpbmcgZXZlbnQgY2FwdHVyaW5nLiAqL1xuICB1c2VDYXB0dXJlOiBib29sZWFuO1xuICAvKipcbiAgICogVHlwZSBvZiB0aGUgbGlzdGVuZXIgKGUuZy4gYSBuYXRpdmUgRE9NIGV2ZW50IG9yIGEgY3VzdG9tIEBPdXRwdXQpLlxuICAgKi9cbiAgdHlwZTogJ2RvbSd8J291dHB1dCc7XG59XG5cblxuLyoqXG4gKiBSZXRyaWV2ZXMgYSBsaXN0IG9mIGV2ZW50IGxpc3RlbmVycyBhc3NvY2lhdGVkIHdpdGggYSBET00gZWxlbWVudC4gVGhlIGxpc3QgZG9lcyBpbmNsdWRlIGhvc3RcbiAqIGxpc3RlbmVycywgYnV0IGl0IGRvZXMgbm90IGluY2x1ZGUgZXZlbnQgbGlzdGVuZXJzIGRlZmluZWQgb3V0c2lkZSBvZiB0aGUgQW5ndWxhciBjb250ZXh0XG4gKiAoZS5nLiB0aHJvdWdoIGBhZGRFdmVudExpc3RlbmVyYCkuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqIEdpdmVuIHRoZSBmb2xsb3dpbmcgRE9NIHN0cnVjdHVyZTpcbiAqXG4gKiBgYGBodG1sXG4gKiA8YXBwLXJvb3Q+XG4gKiAgIDxkaXYgKGNsaWNrKT1cImRvU29tZXRoaW5nKClcIj48L2Rpdj5cbiAqIDwvYXBwLXJvb3Q+XG4gKiBgYGBcbiAqXG4gKiBDYWxsaW5nIGBnZXRMaXN0ZW5lcnNgIG9uIGA8ZGl2PmAgd2lsbCByZXR1cm4gYW4gb2JqZWN0IHRoYXQgbG9va3MgYXMgZm9sbG93czpcbiAqXG4gKiBgYGB0c1xuICoge1xuICogICBuYW1lOiAnY2xpY2snLFxuICogICBlbGVtZW50OiA8ZGl2PixcbiAqICAgY2FsbGJhY2s6ICgpID0+IGRvU29tZXRoaW5nKCksXG4gKiAgIHVzZUNhcHR1cmU6IGZhbHNlXG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gZWxlbWVudCBFbGVtZW50IGZvciB3aGljaCB0aGUgRE9NIGxpc3RlbmVycyBzaG91bGQgYmUgcmV0cmlldmVkLlxuICogQHJldHVybnMgQXJyYXkgb2YgZXZlbnQgbGlzdGVuZXJzIG9uIHRoZSBET00gZWxlbWVudC5cbiAqXG4gKiBAcHVibGljQXBpXG4gKiBAZ2xvYmFsQXBpIG5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRMaXN0ZW5lcnMoZWxlbWVudDogRWxlbWVudCk6IExpc3RlbmVyW10ge1xuICBhc3NlcnREb21FbGVtZW50KGVsZW1lbnQpO1xuICBjb25zdCBsQ29udGV4dCA9IGdldExDb250ZXh0KGVsZW1lbnQpO1xuICBpZiAobENvbnRleHQgPT09IG51bGwpIHJldHVybiBbXTtcblxuICBjb25zdCBsVmlldyA9IGxDb250ZXh0LmxWaWV3O1xuICBjb25zdCB0VmlldyA9IGxWaWV3W1RWSUVXXTtcbiAgY29uc3QgbENsZWFudXAgPSBsVmlld1tDTEVBTlVQXTtcbiAgY29uc3QgdENsZWFudXAgPSB0Vmlldy5jbGVhbnVwO1xuICBjb25zdCBsaXN0ZW5lcnM6IExpc3RlbmVyW10gPSBbXTtcbiAgaWYgKHRDbGVhbnVwICYmIGxDbGVhbnVwKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0Q2xlYW51cC5sZW5ndGg7KSB7XG4gICAgICBjb25zdCBmaXJzdFBhcmFtID0gdENsZWFudXBbaSsrXTtcbiAgICAgIGNvbnN0IHNlY29uZFBhcmFtID0gdENsZWFudXBbaSsrXTtcbiAgICAgIGlmICh0eXBlb2YgZmlyc3RQYXJhbSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgY29uc3QgbmFtZTogc3RyaW5nID0gZmlyc3RQYXJhbTtcbiAgICAgICAgY29uc3QgbGlzdGVuZXJFbGVtZW50ID0gdW53cmFwUk5vZGUobFZpZXdbc2Vjb25kUGFyYW1dKSBhcyBhbnkgYXMgRWxlbWVudDtcbiAgICAgICAgY29uc3QgY2FsbGJhY2s6ICh2YWx1ZTogYW55KSA9PiBhbnkgPSBsQ2xlYW51cFt0Q2xlYW51cFtpKytdXTtcbiAgICAgICAgY29uc3QgdXNlQ2FwdHVyZU9ySW5keCA9IHRDbGVhbnVwW2krK107XG4gICAgICAgIC8vIGlmIHVzZUNhcHR1cmVPckluZHggaXMgYm9vbGVhbiB0aGVuIHJlcG9ydCBpdCBhcyBpcy5cbiAgICAgICAgLy8gaWYgdXNlQ2FwdHVyZU9ySW5keCBpcyBwb3NpdGl2ZSBudW1iZXIgdGhlbiBpdCBpbiB1bnN1YnNjcmliZSBtZXRob2RcbiAgICAgICAgLy8gaWYgdXNlQ2FwdHVyZU9ySW5keCBpcyBuZWdhdGl2ZSBudW1iZXIgdGhlbiBpdCBpcyBhIFN1YnNjcmlwdGlvblxuICAgICAgICBjb25zdCB0eXBlID1cbiAgICAgICAgICAgICh0eXBlb2YgdXNlQ2FwdHVyZU9ySW5keCA9PT0gJ2Jvb2xlYW4nIHx8IHVzZUNhcHR1cmVPckluZHggPj0gMCkgPyAnZG9tJyA6ICdvdXRwdXQnO1xuICAgICAgICBjb25zdCB1c2VDYXB0dXJlID0gdHlwZW9mIHVzZUNhcHR1cmVPckluZHggPT09ICdib29sZWFuJyA/IHVzZUNhcHR1cmVPckluZHggOiBmYWxzZTtcbiAgICAgICAgaWYgKGVsZW1lbnQgPT0gbGlzdGVuZXJFbGVtZW50KSB7XG4gICAgICAgICAgbGlzdGVuZXJzLnB1c2goe2VsZW1lbnQsIG5hbWUsIGNhbGxiYWNrLCB1c2VDYXB0dXJlLCB0eXBlfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgbGlzdGVuZXJzLnNvcnQoc29ydExpc3RlbmVycyk7XG4gIHJldHVybiBsaXN0ZW5lcnM7XG59XG5cbmZ1bmN0aW9uIHNvcnRMaXN0ZW5lcnMoYTogTGlzdGVuZXIsIGI6IExpc3RlbmVyKSB7XG4gIGlmIChhLm5hbWUgPT0gYi5uYW1lKSByZXR1cm4gMDtcbiAgcmV0dXJuIGEubmFtZSA8IGIubmFtZSA/IC0xIDogMTtcbn1cblxuLyoqXG4gKiBUaGlzIGZ1bmN0aW9uIHNob3VsZCBub3QgZXhpc3QgYmVjYXVzZSBpdCBpcyBtZWdhbW9ycGhpYyBhbmQgb25seSBtb3N0bHkgY29ycmVjdC5cbiAqXG4gKiBTZWUgY2FsbCBzaXRlIGZvciBtb3JlIGluZm8uXG4gKi9cbmZ1bmN0aW9uIGlzRGlyZWN0aXZlRGVmSGFjayhvYmo6IGFueSk6IG9iaiBpcyBEaXJlY3RpdmVEZWY8YW55PiB7XG4gIHJldHVybiBvYmoudHlwZSAhPT0gdW5kZWZpbmVkICYmIG9iai50ZW1wbGF0ZSAhPT0gdW5kZWZpbmVkICYmIG9iai5kZWNsYXJlZElucHV0cyAhPT0gdW5kZWZpbmVkO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIGF0dGFjaGVkIGBEZWJ1Z05vZGVgIGluc3RhbmNlIGZvciBhbiBlbGVtZW50IGluIHRoZSBET00uXG4gKlxuICogQHBhcmFtIGVsZW1lbnQgRE9NIGVsZW1lbnQgd2hpY2ggaXMgb3duZWQgYnkgYW4gZXhpc3RpbmcgY29tcG9uZW50J3Mgdmlldy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldERlYnVnTm9kZShlbGVtZW50OiBFbGVtZW50KTogRGVidWdOb2RlfG51bGwge1xuICBpZiAobmdEZXZNb2RlICYmICEoZWxlbWVudCBpbnN0YW5jZW9mIE5vZGUpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdFeHBlY3RpbmcgaW5zdGFuY2Ugb2YgRE9NIEVsZW1lbnQnKTtcbiAgfVxuXG4gIGNvbnN0IGxDb250ZXh0ID0gZ2V0TENvbnRleHQoZWxlbWVudCk7XG4gIGlmIChsQ29udGV4dCA9PT0gbnVsbCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgY29uc3QgbFZpZXcgPSBsQ29udGV4dC5sVmlldztcbiAgY29uc3Qgbm9kZUluZGV4ID0gbENvbnRleHQubm9kZUluZGV4O1xuICBpZiAobm9kZUluZGV4ICE9PSAtMSkge1xuICAgIGNvbnN0IHZhbHVlSW5MVmlldyA9IGxWaWV3W25vZGVJbmRleF07XG4gICAgLy8gdGhpcyBtZWFucyB0aGF0IHZhbHVlIGluIHRoZSBsVmlldyBpcyBhIGNvbXBvbmVudCB3aXRoIGl0cyBvd25cbiAgICAvLyBkYXRhLiBJbiB0aGlzIHNpdHVhdGlvbiB0aGUgVE5vZGUgaXMgbm90IGFjY2Vzc2VkIGF0IHRoZSBzYW1lIHNwb3QuXG4gICAgY29uc3QgdE5vZGUgPVxuICAgICAgICBpc0xWaWV3KHZhbHVlSW5MVmlldykgPyAodmFsdWVJbkxWaWV3W1RfSE9TVF0gYXMgVE5vZGUpIDogZ2V0VE5vZGUobFZpZXdbVFZJRVddLCBub2RlSW5kZXgpO1xuICAgIG5nRGV2TW9kZSAmJlxuICAgICAgICBhc3NlcnRFcXVhbCh0Tm9kZS5pbmRleCwgbm9kZUluZGV4LCAnRXhwZWN0aW5nIHRoYXQgVE5vZGUgYXQgaW5kZXggaXMgc2FtZSBhcyBpbmRleCcpO1xuICAgIHJldHVybiBidWlsZERlYnVnTm9kZSh0Tm9kZSwgbFZpZXcpO1xuICB9XG5cbiAgcmV0dXJuIG51bGw7XG59XG5cbi8qKlxuICogUmV0cmlldmUgdGhlIGNvbXBvbmVudCBgTFZpZXdgIGZyb20gY29tcG9uZW50L2VsZW1lbnQuXG4gKlxuICogTk9URTogYExWaWV3YCBpcyBhIHByaXZhdGUgYW5kIHNob3VsZCBub3QgYmUgbGVha2VkIG91dHNpZGUuXG4gKiAgICAgICBEb24ndCBleHBvcnQgdGhpcyBtZXRob2QgdG8gYG5nLipgIG9uIHdpbmRvdy5cbiAqXG4gKiBAcGFyYW0gdGFyZ2V0IERPTSBlbGVtZW50IG9yIGNvbXBvbmVudCBpbnN0YW5jZSBmb3Igd2hpY2ggdG8gcmV0cmlldmUgdGhlIExWaWV3LlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29tcG9uZW50TFZpZXcodGFyZ2V0OiBhbnkpOiBMVmlldyB7XG4gIGNvbnN0IGxDb250ZXh0ID0gZ2V0TENvbnRleHQodGFyZ2V0KSE7XG4gIGNvbnN0IG5vZGVJbmR4ID0gbENvbnRleHQubm9kZUluZGV4O1xuICBjb25zdCBsVmlldyA9IGxDb250ZXh0LmxWaWV3O1xuICBjb25zdCBjb21wb25lbnRMVmlldyA9IGxWaWV3W25vZGVJbmR4XTtcbiAgbmdEZXZNb2RlICYmIGFzc2VydExWaWV3KGNvbXBvbmVudExWaWV3KTtcbiAgcmV0dXJuIGNvbXBvbmVudExWaWV3O1xufVxuXG4vKiogQXNzZXJ0cyB0aGF0IGEgdmFsdWUgaXMgYSBET00gRWxlbWVudC4gKi9cbmZ1bmN0aW9uIGFzc2VydERvbUVsZW1lbnQodmFsdWU6IGFueSkge1xuICBpZiAodHlwZW9mIEVsZW1lbnQgIT09ICd1bmRlZmluZWQnICYmICEodmFsdWUgaW5zdGFuY2VvZiBFbGVtZW50KSkge1xuICAgIHRocm93IG5ldyBFcnJvcignRXhwZWN0aW5nIGluc3RhbmNlIG9mIERPTSBFbGVtZW50Jyk7XG4gIH1cbn1cbiJdfQ==