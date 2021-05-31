/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { InjectFlags } from '../di/interface/injector';
import { assertDefined, assertEqual, assertGreaterThanOrEqual, assertLessThan, assertNotEqual } from '../util/assert';
import { assertLViewOrUndefined, assertTNodeForLView, assertTNodeForTView } from './assert';
import { CONTEXT, DECLARATION_VIEW, HEADER_OFFSET, T_HOST, TVIEW } from './interfaces/view';
import { MATH_ML_NAMESPACE, SVG_NAMESPACE } from './namespaces';
import { getTNode } from './util/view_utils';
const instructionState = {
    lFrame: createLFrame(null),
    bindingsEnabled: true,
    isInCheckNoChangesMode: false,
};
/**
 * Returns true if the instruction state stack is empty.
 *
 * Intended to be called from tests only (tree shaken otherwise).
 */
export function specOnlyIsInstructionStateEmpty() {
    return instructionState.lFrame.parent === null;
}
export function getElementDepthCount() {
    return instructionState.lFrame.elementDepthCount;
}
export function increaseElementDepthCount() {
    instructionState.lFrame.elementDepthCount++;
}
export function decreaseElementDepthCount() {
    instructionState.lFrame.elementDepthCount--;
}
export function getBindingsEnabled() {
    return instructionState.bindingsEnabled;
}
/**
 * Enables directive matching on elements.
 *
 *  * Example:
 * ```
 * <my-comp my-directive>
 *   Should match component / directive.
 * </my-comp>
 * <div ngNonBindable>
 *   <!-- ɵɵdisableBindings() -->
 *   <my-comp my-directive>
 *     Should not match component / directive because we are in ngNonBindable.
 *   </my-comp>
 *   <!-- ɵɵenableBindings() -->
 * </div>
 * ```
 *
 * @codeGenApi
 */
export function ɵɵenableBindings() {
    instructionState.bindingsEnabled = true;
}
/**
 * Disables directive matching on element.
 *
 *  * Example:
 * ```
 * <my-comp my-directive>
 *   Should match component / directive.
 * </my-comp>
 * <div ngNonBindable>
 *   <!-- ɵɵdisableBindings() -->
 *   <my-comp my-directive>
 *     Should not match component / directive because we are in ngNonBindable.
 *   </my-comp>
 *   <!-- ɵɵenableBindings() -->
 * </div>
 * ```
 *
 * @codeGenApi
 */
export function ɵɵdisableBindings() {
    instructionState.bindingsEnabled = false;
}
/**
 * Return the current `LView`.
 */
export function getLView() {
    return instructionState.lFrame.lView;
}
/**
 * Return the current `TView`.
 */
export function getTView() {
    return instructionState.lFrame.tView;
}
/**
 * Restores `contextViewData` to the given OpaqueViewState instance.
 *
 * Used in conjunction with the getCurrentView() instruction to save a snapshot
 * of the current view and restore it when listeners are invoked. This allows
 * walking the declaration view tree in listeners to get vars from parent views.
 *
 * @param viewToRestore The OpaqueViewState instance to restore.
 * @returns Context of the restored OpaqueViewState instance.
 *
 * @codeGenApi
 */
export function ɵɵrestoreView(viewToRestore) {
    instructionState.lFrame.contextLView = viewToRestore;
    return viewToRestore[CONTEXT];
}
export function getCurrentTNode() {
    let currentTNode = getCurrentTNodePlaceholderOk();
    while (currentTNode !== null && currentTNode.type === 64 /* Placeholder */) {
        currentTNode = currentTNode.parent;
    }
    return currentTNode;
}
export function getCurrentTNodePlaceholderOk() {
    return instructionState.lFrame.currentTNode;
}
export function getCurrentParentTNode() {
    const lFrame = instructionState.lFrame;
    const currentTNode = lFrame.currentTNode;
    return lFrame.isParent ? currentTNode : currentTNode.parent;
}
export function setCurrentTNode(tNode, isParent) {
    ngDevMode && tNode && assertTNodeForTView(tNode, instructionState.lFrame.tView);
    const lFrame = instructionState.lFrame;
    lFrame.currentTNode = tNode;
    lFrame.isParent = isParent;
}
export function isCurrentTNodeParent() {
    return instructionState.lFrame.isParent;
}
export function setCurrentTNodeAsNotParent() {
    instructionState.lFrame.isParent = false;
}
export function setCurrentTNodeAsParent() {
    instructionState.lFrame.isParent = true;
}
export function getContextLView() {
    return instructionState.lFrame.contextLView;
}
export function isInCheckNoChangesMode() {
    // TODO(misko): remove this from the LView since it is ngDevMode=true mode only.
    return instructionState.isInCheckNoChangesMode;
}
export function setIsInCheckNoChangesMode(mode) {
    instructionState.isInCheckNoChangesMode = mode;
}
// top level variables should not be exported for performance reasons (PERF_NOTES.md)
export function getBindingRoot() {
    const lFrame = instructionState.lFrame;
    let index = lFrame.bindingRootIndex;
    if (index === -1) {
        index = lFrame.bindingRootIndex = lFrame.tView.bindingStartIndex;
    }
    return index;
}
export function getBindingIndex() {
    return instructionState.lFrame.bindingIndex;
}
export function setBindingIndex(value) {
    return instructionState.lFrame.bindingIndex = value;
}
export function nextBindingIndex() {
    return instructionState.lFrame.bindingIndex++;
}
export function incrementBindingIndex(count) {
    const lFrame = instructionState.lFrame;
    const index = lFrame.bindingIndex;
    lFrame.bindingIndex = lFrame.bindingIndex + count;
    return index;
}
export function isInI18nBlock() {
    return instructionState.lFrame.inI18n;
}
export function setInI18nBlock(isInI18nBlock) {
    instructionState.lFrame.inI18n = isInI18nBlock;
}
/**
 * Set a new binding root index so that host template functions can execute.
 *
 * Bindings inside the host template are 0 index. But because we don't know ahead of time
 * how many host bindings we have we can't pre-compute them. For this reason they are all
 * 0 index and we just shift the root so that they match next available location in the LView.
 *
 * @param bindingRootIndex Root index for `hostBindings`
 * @param currentDirectiveIndex `TData[currentDirectiveIndex]` will point to the current directive
 *        whose `hostBindings` are being processed.
 */
export function setBindingRootForHostBindings(bindingRootIndex, currentDirectiveIndex) {
    const lFrame = instructionState.lFrame;
    lFrame.bindingIndex = lFrame.bindingRootIndex = bindingRootIndex;
    setCurrentDirectiveIndex(currentDirectiveIndex);
}
/**
 * When host binding is executing this points to the directive index.
 * `TView.data[getCurrentDirectiveIndex()]` is `DirectiveDef`
 * `LView[getCurrentDirectiveIndex()]` is directive instance.
 */
export function getCurrentDirectiveIndex() {
    return instructionState.lFrame.currentDirectiveIndex;
}
/**
 * Sets an index of a directive whose `hostBindings` are being processed.
 *
 * @param currentDirectiveIndex `TData` index where current directive instance can be found.
 */
export function setCurrentDirectiveIndex(currentDirectiveIndex) {
    instructionState.lFrame.currentDirectiveIndex = currentDirectiveIndex;
}
/**
 * Retrieve the current `DirectiveDef` which is active when `hostBindings` instruction is being
 * executed.
 *
 * @param tData Current `TData` where the `DirectiveDef` will be looked up at.
 */
export function getCurrentDirectiveDef(tData) {
    const currentDirectiveIndex = instructionState.lFrame.currentDirectiveIndex;
    return currentDirectiveIndex === -1 ? null : tData[currentDirectiveIndex];
}
export function getCurrentQueryIndex() {
    return instructionState.lFrame.currentQueryIndex;
}
export function setCurrentQueryIndex(value) {
    instructionState.lFrame.currentQueryIndex = value;
}
/**
 * Returns a `TNode` of the location where the current `LView` is declared at.
 *
 * @param lView an `LView` that we want to find parent `TNode` for.
 */
function getDeclarationTNode(lView) {
    const tView = lView[TVIEW];
    // Return the declaration parent for embedded views
    if (tView.type === 2 /* Embedded */) {
        ngDevMode && assertDefined(tView.declTNode, 'Embedded TNodes should have declaration parents.');
        return tView.declTNode;
    }
    // Components don't have `TView.declTNode` because each instance of component could be
    // inserted in different location, hence `TView.declTNode` is meaningless.
    // Falling back to `T_HOST` in case we cross component boundary.
    if (tView.type === 1 /* Component */) {
        return lView[T_HOST];
    }
    // Remaining TNode type is `TViewType.Root` which doesn't have a parent TNode.
    return null;
}
/**
 * This is a light weight version of the `enterView` which is needed by the DI system.
 *
 * @param lView `LView` location of the DI context.
 * @param tNode `TNode` for DI context
 * @param flags DI context flags. if `SkipSelf` flag is set than we walk up the declaration
 *     tree from `tNode`  until we find parent declared `TElementNode`.
 * @returns `true` if we have successfully entered DI associated with `tNode` (or with declared
 *     `TNode` if `flags` has  `SkipSelf`). Failing to enter DI implies that no associated
 *     `NodeInjector` can be found and we should instead use `ModuleInjector`.
 *     - If `true` than this call must be fallowed by `leaveDI`
 *     - If `false` than this call failed and we should NOT call `leaveDI`
 */
export function enterDI(lView, tNode, flags) {
    ngDevMode && assertLViewOrUndefined(lView);
    if (flags & InjectFlags.SkipSelf) {
        ngDevMode && assertTNodeForTView(tNode, lView[TVIEW]);
        let parentTNode = tNode;
        let parentLView = lView;
        while (true) {
            ngDevMode && assertDefined(parentTNode, 'Parent TNode should be defined');
            parentTNode = parentTNode.parent;
            if (parentTNode === null && !(flags & InjectFlags.Host)) {
                parentTNode = getDeclarationTNode(parentLView);
                if (parentTNode === null)
                    break;
                // In this case, a parent exists and is definitely an element. So it will definitely
                // have an existing lView as the declaration view, which is why we can assume it's defined.
                ngDevMode && assertDefined(parentLView, 'Parent LView should be defined');
                parentLView = parentLView[DECLARATION_VIEW];
                // In Ivy there are Comment nodes that correspond to ngIf and NgFor embedded directives
                // We want to skip those and look only at Elements and ElementContainers to ensure
                // we're looking at true parent nodes, and not content or other types.
                if (parentTNode.type & (2 /* Element */ | 8 /* ElementContainer */)) {
                    break;
                }
            }
            else {
                break;
            }
        }
        if (parentTNode === null) {
            // If we failed to find a parent TNode this means that we should use module injector.
            return false;
        }
        else {
            tNode = parentTNode;
            lView = parentLView;
        }
    }
    ngDevMode && assertTNodeForLView(tNode, lView);
    const lFrame = instructionState.lFrame = allocLFrame();
    lFrame.currentTNode = tNode;
    lFrame.lView = lView;
    return true;
}
/**
 * Swap the current lView with a new lView.
 *
 * For performance reasons we store the lView in the top level of the module.
 * This way we minimize the number of properties to read. Whenever a new view
 * is entered we have to store the lView for later, and when the view is
 * exited the state has to be restored
 *
 * @param newView New lView to become active
 * @returns the previously active lView;
 */
export function enterView(newView) {
    ngDevMode && assertNotEqual(newView[0], newView[1], '????');
    ngDevMode && assertLViewOrUndefined(newView);
    const newLFrame = allocLFrame();
    if (ngDevMode) {
        assertEqual(newLFrame.isParent, true, 'Expected clean LFrame');
        assertEqual(newLFrame.lView, null, 'Expected clean LFrame');
        assertEqual(newLFrame.tView, null, 'Expected clean LFrame');
        assertEqual(newLFrame.selectedIndex, -1, 'Expected clean LFrame');
        assertEqual(newLFrame.elementDepthCount, 0, 'Expected clean LFrame');
        assertEqual(newLFrame.currentDirectiveIndex, -1, 'Expected clean LFrame');
        assertEqual(newLFrame.currentNamespace, null, 'Expected clean LFrame');
        assertEqual(newLFrame.bindingRootIndex, -1, 'Expected clean LFrame');
        assertEqual(newLFrame.currentQueryIndex, 0, 'Expected clean LFrame');
    }
    const tView = newView[TVIEW];
    instructionState.lFrame = newLFrame;
    ngDevMode && tView.firstChild && assertTNodeForTView(tView.firstChild, tView);
    newLFrame.currentTNode = tView.firstChild;
    newLFrame.lView = newView;
    newLFrame.tView = tView;
    newLFrame.contextLView = newView;
    newLFrame.bindingIndex = tView.bindingStartIndex;
    newLFrame.inI18n = false;
}
/**
 * Allocates next free LFrame. This function tries to reuse the `LFrame`s to lower memory pressure.
 */
function allocLFrame() {
    const currentLFrame = instructionState.lFrame;
    const childLFrame = currentLFrame === null ? null : currentLFrame.child;
    const newLFrame = childLFrame === null ? createLFrame(currentLFrame) : childLFrame;
    return newLFrame;
}
function createLFrame(parent) {
    const lFrame = {
        currentTNode: null,
        isParent: true,
        lView: null,
        tView: null,
        selectedIndex: -1,
        contextLView: null,
        elementDepthCount: 0,
        currentNamespace: null,
        currentDirectiveIndex: -1,
        bindingRootIndex: -1,
        bindingIndex: -1,
        currentQueryIndex: 0,
        parent: parent,
        child: null,
        inI18n: false,
    };
    parent !== null && (parent.child = lFrame); // link the new LFrame for reuse.
    return lFrame;
}
/**
 * A lightweight version of leave which is used with DI.
 *
 * This function only resets `currentTNode` and `LView` as those are the only properties
 * used with DI (`enterDI()`).
 *
 * NOTE: This function is reexported as `leaveDI`. However `leaveDI` has return type of `void` where
 * as `leaveViewLight` has `LFrame`. This is so that `leaveViewLight` can be used in `leaveView`.
 */
function leaveViewLight() {
    const oldLFrame = instructionState.lFrame;
    instructionState.lFrame = oldLFrame.parent;
    oldLFrame.currentTNode = null;
    oldLFrame.lView = null;
    return oldLFrame;
}
/**
 * This is a lightweight version of the `leaveView` which is needed by the DI system.
 *
 * NOTE: this function is an alias so that we can change the type of the function to have `void`
 * return type.
 */
export const leaveDI = leaveViewLight;
/**
 * Leave the current `LView`
 *
 * This pops the `LFrame` with the associated `LView` from the stack.
 *
 * IMPORTANT: We must zero out the `LFrame` values here otherwise they will be retained. This is
 * because for performance reasons we don't release `LFrame` but rather keep it for next use.
 */
export function leaveView() {
    const oldLFrame = leaveViewLight();
    oldLFrame.isParent = true;
    oldLFrame.tView = null;
    oldLFrame.selectedIndex = -1;
    oldLFrame.contextLView = null;
    oldLFrame.elementDepthCount = 0;
    oldLFrame.currentDirectiveIndex = -1;
    oldLFrame.currentNamespace = null;
    oldLFrame.bindingRootIndex = -1;
    oldLFrame.bindingIndex = -1;
    oldLFrame.currentQueryIndex = 0;
}
export function nextContextImpl(level) {
    const contextLView = instructionState.lFrame.contextLView =
        walkUpViews(level, instructionState.lFrame.contextLView);
    return contextLView[CONTEXT];
}
function walkUpViews(nestingLevel, currentView) {
    while (nestingLevel > 0) {
        ngDevMode &&
            assertDefined(currentView[DECLARATION_VIEW], 'Declaration view should be defined if nesting level is greater than 0.');
        currentView = currentView[DECLARATION_VIEW];
        nestingLevel--;
    }
    return currentView;
}
/**
 * Gets the currently selected element index.
 *
 * Used with {@link property} instruction (and more in the future) to identify the index in the
 * current `LView` to act on.
 */
export function getSelectedIndex() {
    return instructionState.lFrame.selectedIndex;
}
/**
 * Sets the most recent index passed to {@link select}
 *
 * Used with {@link property} instruction (and more in the future) to identify the index in the
 * current `LView` to act on.
 *
 * (Note that if an "exit function" was set earlier (via `setElementExitFn()`) then that will be
 * run if and when the provided `index` value is different from the current selected index value.)
 */
export function setSelectedIndex(index) {
    ngDevMode && index !== -1 &&
        assertGreaterThanOrEqual(index, HEADER_OFFSET, 'Index must be past HEADER_OFFSET (or -1).');
    ngDevMode &&
        assertLessThan(index, instructionState.lFrame.lView.length, 'Can\'t set index passed end of LView');
    instructionState.lFrame.selectedIndex = index;
}
/**
 * Gets the `tNode` that represents currently selected element.
 */
export function getSelectedTNode() {
    const lFrame = instructionState.lFrame;
    return getTNode(lFrame.tView, lFrame.selectedIndex);
}
/**
 * Sets the namespace used to create elements to `'http://www.w3.org/2000/svg'` in global state.
 *
 * @codeGenApi
 */
export function ɵɵnamespaceSVG() {
    instructionState.lFrame.currentNamespace = SVG_NAMESPACE;
}
/**
 * Sets the namespace used to create elements to `'http://www.w3.org/1998/MathML/'` in global state.
 *
 * @codeGenApi
 */
export function ɵɵnamespaceMathML() {
    instructionState.lFrame.currentNamespace = MATH_ML_NAMESPACE;
}
/**
 * Sets the namespace used to create elements to `null`, which forces element creation to use
 * `createElement` rather than `createElementNS`.
 *
 * @codeGenApi
 */
export function ɵɵnamespaceHTML() {
    namespaceHTMLInternal();
}
/**
 * Sets the namespace used to create elements to `null`, which forces element creation to use
 * `createElement` rather than `createElementNS`.
 */
export function namespaceHTMLInternal() {
    instructionState.lFrame.currentNamespace = null;
}
export function getNamespace() {
    return instructionState.lFrame.currentNamespace;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy9yZW5kZXIzL3N0YXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSwwQkFBMEIsQ0FBQztBQUNyRCxPQUFPLEVBQUMsYUFBYSxFQUFFLFdBQVcsRUFBRSx3QkFBd0IsRUFBRSxjQUFjLEVBQUUsY0FBYyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDcEgsT0FBTyxFQUFDLHNCQUFzQixFQUFFLG1CQUFtQixFQUFFLG1CQUFtQixFQUFDLE1BQU0sVUFBVSxDQUFDO0FBRzFGLE9BQU8sRUFBQyxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsYUFBYSxFQUEwQixNQUFNLEVBQVMsS0FBSyxFQUFtQixNQUFNLG1CQUFtQixDQUFDO0FBQzNJLE9BQU8sRUFBQyxpQkFBaUIsRUFBRSxhQUFhLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFDOUQsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBMEszQyxNQUFNLGdCQUFnQixHQUFxQjtJQUN6QyxNQUFNLEVBQUUsWUFBWSxDQUFDLElBQUksQ0FBQztJQUMxQixlQUFlLEVBQUUsSUFBSTtJQUNyQixzQkFBc0IsRUFBRSxLQUFLO0NBQzlCLENBQUM7QUFFRjs7OztHQUlHO0FBQ0gsTUFBTSxVQUFVLCtCQUErQjtJQUM3QyxPQUFPLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxNQUFNLEtBQUssSUFBSSxDQUFDO0FBQ2pELENBQUM7QUFHRCxNQUFNLFVBQVUsb0JBQW9CO0lBQ2xDLE9BQU8sZ0JBQWdCLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDO0FBQ25ELENBQUM7QUFFRCxNQUFNLFVBQVUseUJBQXlCO0lBQ3ZDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO0FBQzlDLENB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Qy9CLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsR0FBRyxpQkFBaUIsQ0FBQztBQUMvRCxDQUFDO0FBRUQ7Ozs7O0dBS0c7QUFDSCxNQUFNLFVBQVUsZUFBZTtJQUM3QixxQkFBcUIsRUFBRSxDQUFDO0FBQzFCLENBQUM7QUFFRDs7O0dBR0c7QUFDSCxNQUFNLFVBQVUscUJBQXFCO0lBQ25DLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUM7QUFDbEQsQ0FBQztBQUVELE1BQU0sVUFBVSxZQUFZO0lBQzFCLE9BQU8sZ0JBQWdCLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDO0FBQ2xELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtJbmplY3RGbGFnc30gZnJvbSAnLi4vZGkvaW50ZXJmYWNlL2luamVjdG9yJztcbmltcG9ydCB7YXNzZXJ0RGVmaW5lZCwgYXNzZXJ0RXF1YWwsIGFzc2VydEdyZWF0ZXJUaGFuT3JFcXVhbCwgYXNzZXJ0TGVzc1RoYW4sIGFzc2VydE5vdEVxdWFsfSBmcm9tICcuLi91dGlsL2Fzc2VydCc7XG5pbXBvcnQge2Fzc2VydExWaWV3T3JVbmRlZmluZWQsIGFzc2VydFROb2RlRm9yTFZpZXcsIGFzc2VydFROb2RlRm9yVFZpZXd9IGZyb20gJy4vYXNzZXJ0JztcbmltcG9ydCB7RGlyZWN0aXZlRGVmfSBmcm9tICcuL2ludGVyZmFjZXMvZGVmaW5pdGlvbic7XG5pbXBvcnQge1ROb2RlLCBUTm9kZVR5cGV9IGZyb20gJy4vaW50ZXJmYWNlcy9ub2RlJztcbmltcG9ydCB7Q09OVEVYVCwgREVDTEFSQVRJT05fVklFVywgSEVBREVSX09GRlNFVCwgTFZpZXcsIE9wYXF1ZVZpZXdTdGF0ZSwgVF9IT1NULCBURGF0YSwgVFZJRVcsIFRWaWV3LCBUVmlld1R5cGV9IGZyb20gJy4vaW50ZXJmYWNlcy92aWV3JztcbmltcG9ydCB7TUFUSF9NTF9OQU1FU1BBQ0UsIFNWR19OQU1FU1BBQ0V9IGZyb20gJy4vbmFtZXNwYWNlcyc7XG5pbXBvcnQge2dldFROb2RlfSBmcm9tICcuL3V0aWwvdmlld191dGlscyc7XG5cblxuLyoqXG4gKlxuICovXG5pbnRlcmZhY2UgTEZyYW1lIHtcbiAgLyoqXG4gICAqIFBhcmVudCBMRnJhbWUuXG4gICAqXG4gICAqIFRoaXMgaXMgbmVlZGVkIHdoZW4gYGxlYXZlVmlld2AgaXMgY2FsbGVkIHRvIHJlc3RvcmUgdGhlIHByZXZpb3VzIHN0YXRlLlxuICAgKi9cbiAgcGFyZW50OiBMRnJhbWU7XG5cbiAgLyoqXG4gICAqIENoaWxkIExGcmFtZS5cbiAgICpcbiAgICogVGhpcyBpcyB1c2VkIHRvIGNhY2hlIGV4aXN0aW5nIExGcmFtZXMgdG8gcmVsaWV2ZSB0aGUgbWVtb3J5IHByZXNzdXJlLlxuICAgKi9cbiAgY2hpbGQ6IExGcmFtZXxudWxsO1xuXG4gIC8qKlxuICAgKiBTdGF0ZSBvZiB0aGUgY3VycmVudCB2aWV3IGJlaW5nIHByb2Nlc3NlZC5cbiAgICpcbiAgICogQW4gYXJyYXkgb2Ygbm9kZXMgKHRleHQsIGVsZW1lbnQsIGNvbnRhaW5lciwgZXRjKSwgcGlwZXMsIHRoZWlyIGJpbmRpbmdzLCBhbmRcbiAgICogYW55IGxvY2FsIHZhcmlhYmxlcyB0aGF0IG5lZWQgdG8gYmUgc3RvcmVkIGJldHdlZW4gaW52b2NhdGlvbnMuXG4gICAqL1xuICBsVmlldzogTFZpZXc7XG5cbiAgLyoqXG4gICAqIEN1cnJlbnQgYFRWaWV3YCBhc3NvY2lhdGVkIHdpdGggdGhlIGBMRnJhbWUubFZpZXdgLlxuICAgKlxuICAgKiBPbmUgY2FuIGdldCBgVFZpZXdgIGZyb20gYGxGcmFtZVtUVklFV11gIGhvd2V2ZXIgYmVjYXVzZSBpdCBpcyBzbyBjb21tb24gaXQgbWFrZXMgc2Vuc2UgdG9cbiAgICogc3RvcmUgaXQgaW4gYExGcmFtZWAgZm9yIHBlcmYgcmVhc29ucy5cbiAgICovXG4gIHRWaWV3OiBUVmlldztcblxuICAvKipcbiAgICogVXNlZCB0byBzZXQgdGhlIHBhcmVudCBwcm9wZXJ0eSB3aGVuIG5vZGVzIGFyZSBjcmVhdGVkIGFuZCB0cmFjayBxdWVyeSByZXN1bHRzLlxuICAgKlxuICAgKiBUaGlzIGlzIHVzZWQgaW4gY29uanVuY3Rpb24gd2l0aCBgaXNQYXJlbnRgLlxuICAgKi9cbiAgY3VycmVudFROb2RlOiBUTm9kZXxudWxsO1xuXG4gIC8qKlxuICAgKiBJZiBgaXNQYXJlbnRgIGlzOlxuICAgKiAgLSBgdHJ1ZWA6IHRoZW4gYGN1cnJlbnRUTm9kZWAgcG9pbnRzIHRvIGEgcGFyZW50IG5vZGUuXG4gICAqICAtIGBmYWxzZWA6IHRoZW4gYGN1cnJlbnRUTm9kZWAgcG9pbnRzIHRvIHByZXZpb3VzIG5vZGUgKHNpYmxpbmcpLlxuICAgKi9cbiAgaXNQYXJlbnQ6IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIEluZGV4IG9mIGN1cnJlbnRseSBzZWxlY3RlZCBlbGVtZW50IGluIExWaWV3LlxuICAgKlxuICAgKiBVc2VkIGJ5IGJpbmRpbmcgaW5zdHJ1Y3Rpb25zLiBVcGRhdGVkIGFzIHBhcnQgb2YgYWR2YW5jZSBpbnN0cnVjdGlvbi5cbiAgICovXG4gIHNlbGVjdGVkSW5kZXg6IG51bWJlcjtcblxuICAvKipcbiAgICogQ3VycmVudCBwb2ludGVyIHRvIHRoZSBiaW5kaW5nIGluZGV4LlxuICAgKi9cbiAgYmluZGluZ0luZGV4OiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIFRoZSBsYXN0IHZpZXdEYXRhIHJldHJpZXZlZCBieSBuZXh0Q29udGV4dCgpLlxuICAgKiBBbGxvd3MgYnVpbGRpbmcgbmV4dENvbnRleHQoKSBhbmQgcmVmZXJlbmNlKCkgY2FsbHMuXG4gICAqXG4gICAqIGUuZy4gY29uc3QgaW5uZXIgPSB4KCkuJGltcGxpY2l0OyBjb25zdCBvdXRlciA9IHgoKS4kaW1wbGljaXQ7XG4gICAqL1xuICBjb250ZXh0TFZpZXc6IExWaWV3O1xuXG4gIC8qKlxuICAgKiBTdG9yZSB0aGUgZWxlbWVudCBkZXB0aCBjb3VudC4gVGhpcyBpcyB1c2VkIHRvIGlkZW50aWZ5IHRoZSByb290IGVsZW1lbnRzIG9mIHRoZSB0ZW1wbGF0ZVxuICAgKiBzbyB0aGF0IHdlIGNhbiB0aGVuIGF0dGFjaCBwYXRjaCBkYXRhIGBMVmlld2AgdG8gb25seSB0aG9zZSBlbGVtZW50cy4gV2Uga25vdyB0aGF0IHRob3NlXG4gICAqIGFyZSB0aGUgb25seSBwbGFjZXMgd2hlcmUgdGhlIHBhdGNoIGRhdGEgY291bGQgY2hhbmdlLCB0aGlzIHdheSB3ZSB3aWxsIHNhdmUgb24gbnVtYmVyXG4gICAqIG9mIHBsYWNlcyB3aGVyZSB0aGEgcGF0Y2hpbmcgb2NjdXJzLlxuICAgKi9cbiAgZWxlbWVudERlcHRoQ291bnQ6IG51bWJlcjtcblxuICAvKipcbiAgICogQ3VycmVudCBuYW1lc3BhY2UgdG8gYmUgdXNlZCB3aGVuIGNyZWF0aW5nIGVsZW1lbnRzXG4gICAqL1xuICBjdXJyZW50TmFtZXNwYWNlOiBzdHJpbmd8bnVsbDtcblxuXG4gIC8qKlxuICAgKiBUaGUgcm9vdCBpbmRleCBmcm9tIHdoaWNoIHB1cmUgZnVuY3Rpb24gaW5zdHJ1Y3Rpb25zIHNob3VsZCBjYWxjdWxhdGUgdGhlaXIgYmluZGluZ1xuICAgKiBpbmRpY2VzLiBJbiBjb21wb25lbnQgdmlld3MsIHRoaXMgaXMgVFZpZXcuYmluZGluZ1N0YXJ0SW5kZXguIEluIGEgaG9zdCBiaW5kaW5nXG4gICAqIGNvbnRleHQsIHRoaXMgaXMgdGhlIFRWaWV3LmV4cGFuZG9TdGFydEluZGV4ICsgYW55IGRpcnMvaG9zdFZhcnMgYmVmb3JlIHRoZSBnaXZlbiBkaXIuXG4gICAqL1xuICBiaW5kaW5nUm9vdEluZGV4OiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIEN1cnJlbnQgaW5kZXggb2YgYSBWaWV3IG9yIENvbnRlbnQgUXVlcnkgd2hpY2ggbmVlZHMgdG8gYmUgcHJvY2Vzc2VkIG5leHQuXG4gICAqIFdlIGl0ZXJhdGUgb3ZlciB0aGUgbGlzdCBvZiBRdWVyaWVzIGFuZCBpbmNyZW1lbnQgY3VycmVudCBxdWVyeSBpbmRleCBhdCBldmVyeSBzdGVwLlxuICAgKi9cbiAgY3VycmVudFF1ZXJ5SW5kZXg6IG51bWJlcjtcblxuICAvKipcbiAgICogV2hlbiBob3N0IGJpbmRpbmcgaXMgZXhlY3V0aW5nIHRoaXMgcG9pbnRzIHRvIHRoZSBkaXJlY3RpdmUgaW5kZXguXG4gICAqIGBUVmlldy5kYXRhW2N1cnJlbnREaXJlY3RpdmVJbmRleF1gIGlzIGBEaXJlY3RpdmVEZWZgXG4gICAqIGBMVmlld1tjdXJyZW50RGlyZWN0aXZlSW5kZXhdYCBpcyBkaXJlY3RpdmUgaW5zdGFuY2UuXG4gICAqL1xuICBjdXJyZW50RGlyZWN0aXZlSW5kZXg6IG51bWJlcjtcblxuICAvKipcbiAgICogQXJlIHdlIGN1cnJlbnRseSBpbiBpMThuIGJsb2NrIGFzIGRlbm90ZWQgYnkgYMm1ybVlbGVtZW50U3RhcnRgIGFuZCBgybXJtWVsZW1lbnRFbmRgLlxuICAgKlxuICAgKiBUaGlzIGluZm9ybWF0aW9uIGlzIG5lZWRlZCBiZWNhdXNlIHdoaWxlIHdlIGFyZSBpbiBpMThuIGJsb2NrIGFsbCBlbGVtZW50cyBtdXN0IGJlIHByZS1kZWNsYXJlZFxuICAgKiBpbiB0aGUgdHJhbnNsYXRpb24uIChpLmUuIGBIZWxsbyDvv70jMu+/vVdvcmxk77+9LyMy77+9IWAgcHJlLWRlY2xhcmVzIGVsZW1lbnQgYXQgYO+/vSMy77+9YCBsb2NhdGlvbi4pXG4gICAqIFRoaXMgYWxsb2NhdGVzIGBUTm9kZVR5cGUuUGxhY2Vob2xkZXJgIGVsZW1lbnQgYXQgbG9jYXRpb24gYDJgLiBJZiB0cmFuc2xhdG9yIHJlbW92ZXMgYO+/vSMy77+9YFxuICAgKiBmcm9tIHRyYW5zbGF0aW9uIHRoYW4gdGhlIHJ1bnRpbWUgbXVzdCBhbHNvIGVuc3VyZSB0aGEgZWxlbWVudCBhdCBgMmAgZG9lcyBub3QgZ2V0IGluc2VydGVkXG4gICAqIGludG8gdGhlIERPTS4gVGhlIHRyYW5zbGF0aW9uIGRvZXMgbm90IGNhcnJ5IGluZm9ybWF0aW9uIGFib3V0IGRlbGV0ZWQgZWxlbWVudHMuIFRoZXJlZm9yIHRoZVxuICAgKiBvbmx5IHdheSB0byBrbm93IHRoYXQgYW4gZWxlbWVudCBpcyBkZWxldGVkIGlzIHRoYXQgaXQgd2FzIG5vdCBwcmUtZGVjbGFyZWQgaW4gdGhlIHRyYW5zbGF0aW9uLlxuICAgKlxuICAgKiBUaGlzIGZsYWcgd29ya3MgYnkgZW5zdXJpbmcgdGhhdCBlbGVtZW50cyB3aGljaCBhcmUgY3JlYXRlZCB3aXRob3V0IHByZS1kZWNsYXJhdGlvblxuICAgKiAoYFROb2RlVHlwZS5QbGFjZWhvbGRlcmApIGFyZSBub3QgaW5zZXJ0ZWQgaW50byB0aGUgRE9NIHJlbmRlciB0cmVlLiAoSXQgZG9lcyBtZWFuIHRoYXQgdGhlXG4gICAqIGVsZW1lbnQgc3RpbGwgZ2V0cyBpbnN0YW50aWF0ZWQgYWxvbmcgd2l0aCBhbGwgb2YgaXRzIGJlaGF2aW9yIFtkaXJlY3RpdmVzXSlcbiAgICovXG4gIGluSTE4bjogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBBbGwgaW1wbGljaXQgaW5zdHJ1Y3Rpb24gc3RhdGUgaXMgc3RvcmVkIGhlcmUuXG4gKlxuICogSXQgaXMgdXNlZnVsIHRvIGhhdmUgYSBzaW5nbGUgb2JqZWN0IHdoZXJlIGFsbCBvZiB0aGUgc3RhdGUgaXMgc3RvcmVkIGFzIGEgbWVudGFsIG1vZGVsXG4gKiAocmF0aGVyIGl0IGJlaW5nIHNwcmVhZCBhY3Jvc3MgbWFueSBkaWZmZXJlbnQgdmFyaWFibGVzLilcbiAqXG4gKiBQRVJGIE5PVEU6IFR1cm5zIG91dCB0aGF0IHdyaXRpbmcgdG8gYSB0cnVlIGdsb2JhbCB2YXJpYWJsZSBpcyBzbG93ZXIgdGhhblxuICogaGF2aW5nIGFuIGludGVybWVkaWF0ZSBvYmplY3Qgd2l0aCBwcm9wZXJ0aWVzLlxuICovXG5pbnRlcmZhY2UgSW5zdHJ1Y3Rpb25TdGF0ZSB7XG4gIC8qKlxuICAgKiBDdXJyZW50IGBMRnJhbWVgXG4gICAqXG4gICAqIGBudWxsYCBpZiB3ZSBoYXZlIG5vdCBjYWxsZWQgYGVudGVyVmlld2BcbiAgICovXG4gIGxGcmFtZTogTEZyYW1lO1xuXG4gIC8qKlxuICAgKiBTdG9yZXMgd2hldGhlciBkaXJlY3RpdmVzIHNob3VsZCBiZSBtYXRjaGVkIHRvIGVsZW1lbnRzLlxuICAgKlxuICAgKiBXaGVuIHRlbXBsYXRlIGNvbnRhaW5zIGBuZ05vbkJpbmRhYmxlYCB0aGVuIHdlIG5lZWQgdG8gcHJldmVudCB0aGUgcnVudGltZSBmcm9tIG1hdGNoaW5nXG4gICAqIGRpcmVjdGl2ZXMgb24gY2hpbGRyZW4gb2YgdGhhdCBlbGVtZW50LlxuICAgKlxuICAgKiBFeGFtcGxlOlxuICAgKiBgYGBcbiAgICogPG15LWNvbXAgbXktZGlyZWN0aXZlPlxuICAgKiAgIFNob3VsZCBtYXRjaCBjb21wb25lbnQgLyBkaXJlY3RpdmUuXG4gICAqIDwvbXktY29tcD5cbiAgICogPGRpdiBuZ05vbkJpbmRhYmxlPlxuICAgKiAgIDxteS1jb21wIG15LWRpcmVjdGl2ZT5cbiAgICogICAgIFNob3VsZCBub3QgbWF0Y2ggY29tcG9uZW50IC8gZGlyZWN0aXZlIGJlY2F1c2Ugd2UgYXJlIGluIG5nTm9uQmluZGFibGUuXG4gICAqICAgPC9teS1jb21wPlxuICAgKiA8L2Rpdj5cbiAgICogYGBgXG4gICAqL1xuICBiaW5kaW5nc0VuYWJsZWQ6IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIEluIHRoaXMgbW9kZSwgYW55IGNoYW5nZXMgaW4gYmluZGluZ3Mgd2lsbCB0aHJvdyBhbiBFeHByZXNzaW9uQ2hhbmdlZEFmdGVyQ2hlY2tlZCBlcnJvci5cbiAgICpcbiAgICogTmVjZXNzYXJ5IHRvIHN1cHBvcnQgQ2hhbmdlRGV0ZWN0b3JSZWYuY2hlY2tOb0NoYW5nZXMoKS5cbiAgICpcbiAgICogY2hlY2tOb0NoYW5nZXMgUnVucyBvbmx5IGluIGRldm1vZGU9dHJ1ZSBhbmQgdmVyaWZpZXMgdGhhdCBubyB1bmludGVuZGVkIGNoYW5nZXMgZXhpc3QgaW5cbiAgICogdGhlIGNoYW5nZSBkZXRlY3RvciBvciBpdHMgY2hpbGRyZW4uXG4gICAqL1xuICBpc0luQ2hlY2tOb0NoYW5nZXNNb2RlOiBib29sZWFuO1xufVxuXG5jb25zdCBpbnN0cnVjdGlvblN0YXRlOiBJbnN0cnVjdGlvblN0YXRlID0ge1xuICBsRnJhbWU6IGNyZWF0ZUxGcmFtZShudWxsKSxcbiAgYmluZGluZ3NFbmFibGVkOiB0cnVlLFxuICBpc0luQ2hlY2tOb0NoYW5nZXNNb2RlOiBmYWxzZSxcbn07XG5cbi8qKlxuICogUmV0dXJucyB0cnVlIGlmIHRoZSBpbnN0cnVjdGlvbiBzdGF0ZSBzdGFjayBpcyBlbXB0eS5cbiAqXG4gKiBJbnRlbmRlZCB0byBiZSBjYWxsZWQgZnJvbSB0ZXN0cyBvbmx5ICh0cmVlIHNoYWtlbiBvdGhlcndpc2UpLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc3BlY09ubHlJc0luc3RydWN0aW9uU3RhdGVFbXB0eSgpOiBib29sZWFuIHtcbiAgcmV0dXJuIGluc3RydWN0aW9uU3RhdGUubEZyYW1lLnBhcmVudCA9PT0gbnVsbDtcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0RWxlbWVudERlcHRoQ291bnQoKSB7XG4gIHJldHVybiBpbnN0cnVjdGlvblN0YXRlLmxGcmFtZS5lbGVtZW50RGVwdGhDb3VudDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGluY3JlYXNlRWxlbWVudERlcHRoQ291bnQoKSB7XG4gIGluc3RydWN0aW9uU3RhdGUubEZyYW1lLmVsZW1lbnREZXB0aENvdW50Kys7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZWNyZWFzZUVsZW1lbnREZXB0aENvdW50KCkge1xuICBpbnN0cnVjdGlvblN0YXRlLmxGcmFtZS5lbGVtZW50RGVwdGhDb3VudC0tO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0QmluZGluZ3NFbmFibGVkKCk6IGJvb2xlYW4ge1xuICByZXR1cm4gaW5zdHJ1Y3Rpb25TdGF0ZS5iaW5kaW5nc0VuYWJsZWQ7XG59XG5cblxuLyoqXG4gKiBFbmFibGVzIGRpcmVjdGl2ZSBtYXRjaGluZyBvbiBlbGVtZW50cy5cbiAqXG4gKiAgKiBFeGFtcGxlOlxuICogYGBgXG4gKiA8bXktY29tcCBteS1kaXJlY3RpdmU+XG4gKiAgIFNob3VsZCBtYXRjaCBjb21wb25lbnQgLyBkaXJlY3RpdmUuXG4gKiA8L215LWNvbXA+XG4gKiA8ZGl2IG5nTm9uQmluZGFibGU+XG4gKiAgIDwhLS0gybXJtWRpc2FibGVCaW5kaW5ncygpIC0tPlxuICogICA8bXktY29tcCBteS1kaXJlY3RpdmU+XG4gKiAgICAgU2hvdWxkIG5vdCBtYXRjaCBjb21wb25lbnQgLyBkaXJlY3RpdmUgYmVjYXVzZSB3ZSBhcmUgaW4gbmdOb25CaW5kYWJsZS5cbiAqICAgPC9teS1jb21wPlxuICogICA8IS0tIMm1ybVlbmFibGVCaW5kaW5ncygpIC0tPlxuICogPC9kaXY+XG4gKiBgYGBcbiAqXG4gKiBAY29kZUdlbkFwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gybXJtWVuYWJsZUJpbmRpbmdzKCk6IHZvaWQge1xuICBpbnN0cnVjdGlvblN0YXRlLmJpbmRpbmdzRW5hYmxlZCA9IHRydWU7XG59XG5cbi8qKlxuICogRGlzYWJsZXMgZGlyZWN0aXZlIG1hdGNoaW5nIG9uIGVsZW1lbnQuXG4gKlxuICogICogRXhhbXBsZTpcbiAqIGBgYFxuICogPG15LWNvbXAgbXktZGlyZWN0aXZlPlxuICogICBTaG91bGQgbWF0Y2ggY29tcG9uZW50IC8gZGlyZWN0aXZlLlxuICogPC9teS1jb21wPlxuICogPGRpdiBuZ05vbkJpbmRhYmxlPlxuICogICA8IS0tIMm1ybVkaXNhYmxlQmluZGluZ3MoKSAtLT5cbiAqICAgPG15LWNvbXAgbXktZGlyZWN0aXZlPlxuICogICAgIFNob3VsZCBub3QgbWF0Y2ggY29tcG9uZW50IC8gZGlyZWN0aXZlIGJlY2F1c2Ugd2UgYXJlIGluIG5nTm9uQmluZGFibGUuXG4gKiAgIDwvbXktY29tcD5cbiAqICAgPCEtLSDJtcm1ZW5hYmxlQmluZGluZ3MoKSAtLT5cbiAqIDwvZGl2PlxuICogYGBgXG4gKlxuICogQGNvZGVHZW5BcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIMm1ybVkaXNhYmxlQmluZGluZ3MoKTogdm9pZCB7XG4gIGluc3RydWN0aW9uU3RhdGUuYmluZGluZ3NFbmFibGVkID0gZmFsc2U7XG59XG5cbi8qKlxuICogUmV0dXJuIHRoZSBjdXJyZW50IGBMVmlld2AuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRMVmlldygpOiBMVmlldyB7XG4gIHJldHVybiBpbnN0cnVjdGlvblN0YXRlLmxGcmFtZS5sVmlldztcbn1cblxuLyoqXG4gKiBSZXR1cm4gdGhlIGN1cnJlbnQgYFRWaWV3YC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFRWaWV3KCk6IFRWaWV3IHtcbiAgcmV0dXJuIGluc3RydWN0aW9uU3RhdGUubEZyYW1lLnRWaWV3O1xufVxuXG4vKipcbiAqIFJlc3RvcmVzIGBjb250ZXh0Vmlld0RhdGFgIHRvIHRoZSBnaXZlbiBPcGFxdWVWaWV3U3RhdGUgaW5zdGFuY2UuXG4gKlxuICogVXNlZCBpbiBjb25qdW5jdGlvbiB3aXRoIHRoZSBnZXRDdXJyZW50VmlldygpIGluc3RydWN0aW9uIHRvIHNhdmUgYSBzbmFwc2hvdFxuICogb2YgdGhlIGN1cnJlbnQgdmlldyBhbmQgcmVzdG9yZSBpdCB3aGVuIGxpc3RlbmVycyBhcmUgaW52b2tlZC4gVGhpcyBhbGxvd3NcbiAqIHdhbGtpbmcgdGhlIGRlY2xhcmF0aW9uIHZpZXcgdHJlZSBpbiBsaXN0ZW5lcnMgdG8gZ2V0IHZhcnMgZnJvbSBwYXJlbnQgdmlld3MuXG4gKlxuICogQHBhcmFtIHZpZXdUb1Jlc3RvcmUgVGhlIE9wYXF1ZVZpZXdTdGF0ZSBpbnN0YW5jZSB0byByZXN0b3JlLlxuICogQHJldHVybnMgQ29udGV4dCBvZiB0aGUgcmVzdG9yZWQgT3BhcXVlVmlld1N0YXRlIGluc3RhbmNlLlxuICpcbiAqIEBjb2RlR2VuQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiDJtcm1cmVzdG9yZVZpZXc8VCA9IGFueT4odmlld1RvUmVzdG9yZTogT3BhcXVlVmlld1N0YXRlKTogVCB7XG4gIGluc3RydWN0aW9uU3RhdGUubEZyYW1lLmNvbnRleHRMVmlldyA9IHZpZXdUb1Jlc3RvcmUgYXMgYW55IGFzIExWaWV3O1xuICByZXR1cm4gKHZpZXdUb1Jlc3RvcmUgYXMgYW55IGFzIExWaWV3KVtDT05URVhUXSBhcyBUO1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRDdXJyZW50VE5vZGUoKTogVE5vZGV8bnVsbCB7XG4gIGxldCBjdXJyZW50VE5vZGUgPSBnZXRDdXJyZW50VE5vZGVQbGFjZWhvbGRlck9rKCk7XG4gIHdoaWxlIChjdXJyZW50VE5vZGUgIT09IG51bGwgJiYgY3VycmVudFROb2RlLnR5cGUgPT09IFROb2RlVHlwZS5QbGFjZWhvbGRlcikge1xuICAgIGN1cnJlbnRUTm9kZSA9IGN1cnJlbnRUTm9kZS5wYXJlbnQ7XG4gIH1cbiAgcmV0dXJuIGN1cnJlbnRUTm9kZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEN1cnJlbnRUTm9kZVBsYWNlaG9sZGVyT2soKTogVE5vZGV8bnVsbCB7XG4gIHJldHVybiBpbnN0cnVjdGlvblN0YXRlLmxGcmFtZS5jdXJyZW50VE5vZGU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRDdXJyZW50UGFyZW50VE5vZGUoKTogVE5vZGV8bnVsbCB7XG4gIGNvbnN0IGxGcmFtZSA9IGluc3RydWN0aW9uU3RhdGUubEZyYW1lO1xuICBjb25zdCBjdXJyZW50VE5vZGUgPSBsRnJhbWUuY3VycmVudFROb2RlO1xuICByZXR1cm4gbEZyYW1lLmlzUGFyZW50ID8gY3VycmVudFROb2RlIDogY3VycmVudFROb2RlIS5wYXJlbnQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRDdXJyZW50VE5vZGUodE5vZGU6IFROb2RlfG51bGwsIGlzUGFyZW50OiBib29sZWFuKSB7XG4gIG5nRGV2TW9kZSAmJiB0Tm9kZSAmJiBhc3NlcnRUTm9kZUZvclRWaWV3KHROb2RlLCBpbnN0cnVjdGlvblN0YXRlLmxGcmFtZS50Vmlldyk7XG4gIGNvbnN0IGxGcmFtZSA9IGluc3RydWN0aW9uU3RhdGUubEZyYW1lO1xuICBsRnJhbWUuY3VycmVudFROb2RlID0gdE5vZGU7XG4gIGxGcmFtZS5pc1BhcmVudCA9IGlzUGFyZW50O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNDdXJyZW50VE5vZGVQYXJlbnQoKTogYm9vbGVhbiB7XG4gIHJldHVybiBpbnN0cnVjdGlvblN0YXRlLmxGcmFtZS5pc1BhcmVudDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldEN1cnJlbnRUTm9kZUFzTm90UGFyZW50KCk6IHZvaWQge1xuICBpbnN0cnVjdGlvblN0YXRlLmxGcmFtZS5pc1BhcmVudCA9IGZhbHNlO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHNldEN1cnJlbnRUTm9kZUFzUGFyZW50KCk6IHZvaWQge1xuICBpbnN0cnVjdGlvblN0YXRlLmxGcmFtZS5pc1BhcmVudCA9IHRydWU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRDb250ZXh0TFZpZXcoKTogTFZpZXcge1xuICByZXR1cm4gaW5zdHJ1Y3Rpb25TdGF0ZS5sRnJhbWUuY29udGV4dExWaWV3O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNJbkNoZWNrTm9DaGFuZ2VzTW9kZSgpOiBib29sZWFuIHtcbiAgLy8gVE9ETyhtaXNrbyk6IHJlbW92ZSB0aGlzIGZyb20gdGhlIExWaWV3IHNpbmNlIGl0IGlzIG5nRGV2TW9kZT10cnVlIG1vZGUgb25seS5cbiAgcmV0dXJuIGluc3RydWN0aW9uU3RhdGUuaXNJbkNoZWNrTm9DaGFuZ2VzTW9kZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldElzSW5DaGVja05vQ2hhbmdlc01vZGUobW9kZTogYm9vbGVhbik6IHZvaWQge1xuICBpbnN0cnVjdGlvblN0YXRlLmlzSW5DaGVja05vQ2hhbmdlc01vZGUgPSBtb2RlO1xufVxuXG4vLyB0b3AgbGV2ZWwgdmFyaWFibGVzIHNob3VsZCBub3QgYmUgZXhwb3J0ZWQgZm9yIHBlcmZvcm1hbmNlIHJlYXNvbnMgKFBFUkZfTk9URVMubWQpXG5leHBvcnQgZnVuY3Rpb24gZ2V0QmluZGluZ1Jvb3QoKSB7XG4gIGNvbnN0IGxGcmFtZSA9IGluc3RydWN0aW9uU3RhdGUubEZyYW1lO1xuICBsZXQgaW5kZXggPSBsRnJhbWUuYmluZGluZ1Jvb3RJbmRleDtcbiAgaWYgKGluZGV4ID09PSAtMSkge1xuICAgIGluZGV4ID0gbEZyYW1lLmJpbmRpbmdSb290SW5kZXggPSBsRnJhbWUudFZpZXcuYmluZGluZ1N0YXJ0SW5kZXg7XG4gIH1cbiAgcmV0dXJuIGluZGV4O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0QmluZGluZ0luZGV4KCk6IG51bWJlciB7XG4gIHJldHVybiBpbnN0cnVjdGlvblN0YXRlLmxGcmFtZS5iaW5kaW5nSW5kZXg7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRCaW5kaW5nSW5kZXgodmFsdWU6IG51bWJlcik6IG51bWJlciB7XG4gIHJldHVybiBpbnN0cnVjdGlvblN0YXRlLmxGcmFtZS5iaW5kaW5nSW5kZXggPSB2YWx1ZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5leHRCaW5kaW5nSW5kZXgoKTogbnVtYmVyIHtcbiAgcmV0dXJuIGluc3RydWN0aW9uU3RhdGUubEZyYW1lLmJpbmRpbmdJbmRleCsrO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaW5jcmVtZW50QmluZGluZ0luZGV4KGNvdW50OiBudW1iZXIpOiBudW1iZXIge1xuICBjb25zdCBsRnJhbWUgPSBpbnN0cnVjdGlvblN0YXRlLmxGcmFtZTtcbiAgY29uc3QgaW5kZXggPSBsRnJhbWUuYmluZGluZ0luZGV4O1xuICBsRnJhbWUuYmluZGluZ0luZGV4ID0gbEZyYW1lLmJpbmRpbmdJbmRleCArIGNvdW50O1xuICByZXR1cm4gaW5kZXg7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0luSTE4bkJsb2NrKCkge1xuICByZXR1cm4gaW5zdHJ1Y3Rpb25TdGF0ZS5sRnJhbWUuaW5JMThuO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0SW5JMThuQmxvY2soaXNJbkkxOG5CbG9jazogYm9vbGVhbik6IHZvaWQge1xuICBpbnN0cnVjdGlvblN0YXRlLmxGcmFtZS5pbkkxOG4gPSBpc0luSTE4bkJsb2NrO1xufVxuXG4vKipcbiAqIFNldCBhIG5ldyBiaW5kaW5nIHJvb3QgaW5kZXggc28gdGhhdCBob3N0IHRlbXBsYXRlIGZ1bmN0aW9ucyBjYW4gZXhlY3V0ZS5cbiAqXG4gKiBCaW5kaW5ncyBpbnNpZGUgdGhlIGhvc3QgdGVtcGxhdGUgYXJlIDAgaW5kZXguIEJ1dCBiZWNhdXNlIHdlIGRvbid0IGtub3cgYWhlYWQgb2YgdGltZVxuICogaG93IG1hbnkgaG9zdCBiaW5kaW5ncyB3ZSBoYXZlIHdlIGNhbid0IHByZS1jb21wdXRlIHRoZW0uIEZvciB0aGlzIHJlYXNvbiB0aGV5IGFyZSBhbGxcbiAqIDAgaW5kZXggYW5kIHdlIGp1c3Qgc2hpZnQgdGhlIHJvb3Qgc28gdGhhdCB0aGV5IG1hdGNoIG5leHQgYXZhaWxhYmxlIGxvY2F0aW9uIGluIHRoZSBMVmlldy5cbiAqXG4gKiBAcGFyYW0gYmluZGluZ1Jvb3RJbmRleCBSb290IGluZGV4IGZvciBgaG9zdEJpbmRpbmdzYFxuICogQHBhcmFtIGN1cnJlbnREaXJlY3RpdmVJbmRleCBgVERhdGFbY3VycmVudERpcmVjdGl2ZUluZGV4XWAgd2lsbCBwb2ludCB0byB0aGUgY3VycmVudCBkaXJlY3RpdmVcbiAqICAgICAgICB3aG9zZSBgaG9zdEJpbmRpbmdzYCBhcmUgYmVpbmcgcHJvY2Vzc2VkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0QmluZGluZ1Jvb3RGb3JIb3N0QmluZGluZ3MoXG4gICAgYmluZGluZ1Jvb3RJbmRleDogbnVtYmVyLCBjdXJyZW50RGlyZWN0aXZlSW5kZXg6IG51bWJlcikge1xuICBjb25zdCBsRnJhbWUgPSBpbnN0cnVjdGlvblN0YXRlLmxGcmFtZTtcbiAgbEZyYW1lLmJpbmRpbmdJbmRleCA9IGxGcmFtZS5iaW5kaW5nUm9vdEluZGV4ID0gYmluZGluZ1Jvb3RJbmRleDtcbiAgc2V0Q3VycmVudERpcmVjdGl2ZUluZGV4KGN1cnJlbnREaXJlY3RpdmVJbmRleCk7XG59XG5cbi8qKlxuICogV2hlbiBob3N0IGJpbmRpbmcgaXMgZXhlY3V0aW5nIHRoaXMgcG9pbnRzIHRvIHRoZSBkaXJlY3RpdmUgaW5kZXguXG4gKiBgVFZpZXcuZGF0YVtnZXRDdXJyZW50RGlyZWN0aXZlSW5kZXgoKV1gIGlzIGBEaXJlY3RpdmVEZWZgXG4gKiBgTFZpZXdbZ2V0Q3VycmVudERpcmVjdGl2ZUluZGV4KCldYCBpcyBkaXJlY3RpdmUgaW5zdGFuY2UuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRDdXJyZW50RGlyZWN0aXZlSW5kZXgoKTogbnVtYmVyIHtcbiAgcmV0dXJuIGluc3RydWN0aW9uU3RhdGUubEZyYW1lLmN1cnJlbnREaXJlY3RpdmVJbmRleDtcbn1cblxuLyoqXG4gKiBTZXRzIGFuIGluZGV4IG9mIGEgZGlyZWN0aXZlIHdob3NlIGBob3N0QmluZGluZ3NgIGFyZSBiZWluZyBwcm9jZXNzZWQuXG4gKlxuICogQHBhcmFtIGN1cnJlbnREaXJlY3RpdmVJbmRleCBgVERhdGFgIGluZGV4IHdoZXJlIGN1cnJlbnQgZGlyZWN0aXZlIGluc3RhbmNlIGNhbiBiZSBmb3VuZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldEN1cnJlbnREaXJlY3RpdmVJbmRleChjdXJyZW50RGlyZWN0aXZlSW5kZXg6IG51bWJlcik6IHZvaWQge1xuICBpbnN0cnVjdGlvblN0YXRlLmxGcmFtZS5jdXJyZW50RGlyZWN0aXZlSW5kZXggPSBjdXJyZW50RGlyZWN0aXZlSW5kZXg7XG59XG5cbi8qKlxuICogUmV0cmlldmUgdGhlIGN1cnJlbnQgYERpcmVjdGl2ZURlZmAgd2hpY2ggaXMgYWN0aXZlIHdoZW4gYGhvc3RCaW5kaW5nc2AgaW5zdHJ1Y3Rpb24gaXMgYmVpbmdcbiAqIGV4ZWN1dGVkLlxuICpcbiAqIEBwYXJhbSB0RGF0YSBDdXJyZW50IGBURGF0YWAgd2hlcmUgdGhlIGBEaXJlY3RpdmVEZWZgIHdpbGwgYmUgbG9va2VkIHVwIGF0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q3VycmVudERpcmVjdGl2ZURlZih0RGF0YTogVERhdGEpOiBEaXJlY3RpdmVEZWY8YW55PnxudWxsIHtcbiAgY29uc3QgY3VycmVudERpcmVjdGl2ZUluZGV4ID0gaW5zdHJ1Y3Rpb25TdGF0ZS5sRnJhbWUuY3VycmVudERpcmVjdGl2ZUluZGV4O1xuICByZXR1cm4gY3VycmVudERpcmVjdGl2ZUluZGV4ID09PSAtMSA/IG51bGwgOiB0RGF0YVtjdXJyZW50RGlyZWN0aXZlSW5kZXhdIGFzIERpcmVjdGl2ZURlZjxhbnk+O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q3VycmVudFF1ZXJ5SW5kZXgoKTogbnVtYmVyIHtcbiAgcmV0dXJuIGluc3RydWN0aW9uU3RhdGUubEZyYW1lLmN1cnJlbnRRdWVyeUluZGV4O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0Q3VycmVudFF1ZXJ5SW5kZXgodmFsdWU6IG51bWJlcik6IHZvaWQge1xuICBpbnN0cnVjdGlvblN0YXRlLmxGcmFtZS5jdXJyZW50UXVlcnlJbmRleCA9IHZhbHVlO1xufVxuXG4vKipcbiAqIFJldHVybnMgYSBgVE5vZGVgIG9mIHRoZSBsb2NhdGlvbiB3aGVyZSB0aGUgY3VycmVudCBgTFZpZXdgIGlzIGRlY2xhcmVkIGF0LlxuICpcbiAqIEBwYXJhbSBsVmlldyBhbiBgTFZpZXdgIHRoYXQgd2Ugd2FudCB0byBmaW5kIHBhcmVudCBgVE5vZGVgIGZvci5cbiAqL1xuZnVuY3Rpb24gZ2V0RGVjbGFyYXRpb25UTm9kZShsVmlldzogTFZpZXcpOiBUTm9kZXxudWxsIHtcbiAgY29uc3QgdFZpZXcgPSBsVmlld1tUVklFV107XG5cbiAgLy8gUmV0dXJuIHRoZSBkZWNsYXJhdGlvbiBwYXJlbnQgZm9yIGVtYmVkZGVkIHZpZXdzXG4gIGlmICh0Vmlldy50eXBlID09PSBUVmlld1R5cGUuRW1iZWRkZWQpIHtcbiAgICBuZ0Rldk1vZGUgJiYgYXNzZXJ0RGVmaW5lZCh0Vmlldy5kZWNsVE5vZGUsICdFbWJlZGRlZCBUTm9kZXMgc2hvdWxkIGhhdmUgZGVjbGFyYXRpb24gcGFyZW50cy4nKTtcbiAgICByZXR1cm4gdFZpZXcuZGVjbFROb2RlO1xuICB9XG5cbiAgLy8gQ29tcG9uZW50cyBkb24ndCBoYXZlIGBUVmlldy5kZWNsVE5vZGVgIGJlY2F1c2UgZWFjaCBpbnN0YW5jZSBvZiBjb21wb25lbnQgY291bGQgYmVcbiAgLy8gaW5zZXJ0ZWQgaW4gZGlmZmVyZW50IGxvY2F0aW9uLCBoZW5jZSBgVFZpZXcuZGVjbFROb2RlYCBpcyBtZWFuaW5nbGVzcy5cbiAgLy8gRmFsbGluZyBiYWNrIHRvIGBUX0hPU1RgIGluIGNhc2Ugd2UgY3Jvc3MgY29tcG9uZW50IGJvdW5kYXJ5LlxuICBpZiAodFZpZXcudHlwZSA9PT0gVFZpZXdUeXBlLkNvbXBvbmVudCkge1xuICAgIHJldHVybiBsVmlld1tUX0hPU1RdO1xuICB9XG5cbiAgLy8gUmVtYWluaW5nIFROb2RlIHR5cGUgaXMgYFRWaWV3VHlwZS5Sb290YCB3aGljaCBkb2Vzbid0IGhhdmUgYSBwYXJlbnQgVE5vZGUuXG4gIHJldHVybiBudWxsO1xufVxuXG4vKipcbiAqIFRoaXMgaXMgYSBsaWdodCB3ZWlnaHQgdmVyc2lvbiBvZiB0aGUgYGVudGVyVmlld2Agd2hpY2ggaXMgbmVlZGVkIGJ5IHRoZSBESSBzeXN0ZW0uXG4gKlxuICogQHBhcmFtIGxWaWV3IGBMVmlld2AgbG9jYXRpb24gb2YgdGhlIERJIGNvbnRleHQuXG4gKiBAcGFyYW0gdE5vZGUgYFROb2RlYCBmb3IgREkgY29udGV4dFxuICogQHBhcmFtIGZsYWdzIERJIGNvbnRleHQgZmxhZ3MuIGlmIGBTa2lwU2VsZmAgZmxhZyBpcyBzZXQgdGhhbiB3ZSB3YWxrIHVwIHRoZSBkZWNsYXJhdGlvblxuICogICAgIHRyZWUgZnJvbSBgdE5vZGVgICB1bnRpbCB3ZSBmaW5kIHBhcmVudCBkZWNsYXJlZCBgVEVsZW1lbnROb2RlYC5cbiAqIEByZXR1cm5zIGB0cnVlYCBpZiB3ZSBoYXZlIHN1Y2Nlc3NmdWxseSBlbnRlcmVkIERJIGFzc29jaWF0ZWQgd2l0aCBgdE5vZGVgIChvciB3aXRoIGRlY2xhcmVkXG4gKiAgICAgYFROb2RlYCBpZiBgZmxhZ3NgIGhhcyAgYFNraXBTZWxmYCkuIEZhaWxpbmcgdG8gZW50ZXIgREkgaW1wbGllcyB0aGF0IG5vIGFzc29jaWF0ZWRcbiAqICAgICBgTm9kZUluamVjdG9yYCBjYW4gYmUgZm91bmQgYW5kIHdlIHNob3VsZCBpbnN0ZWFkIHVzZSBgTW9kdWxlSW5qZWN0b3JgLlxuICogICAgIC0gSWYgYHRydWVgIHRoYW4gdGhpcyBjYWxsIG11c3QgYmUgZmFsbG93ZWQgYnkgYGxlYXZlRElgXG4gKiAgICAgLSBJZiBgZmFsc2VgIHRoYW4gdGhpcyBjYWxsIGZhaWxlZCBhbmQgd2Ugc2hvdWxkIE5PVCBjYWxsIGBsZWF2ZURJYFxuICovXG5leHBvcnQgZnVuY3Rpb24gZW50ZXJESShsVmlldzogTFZpZXcsIHROb2RlOiBUTm9kZSwgZmxhZ3M6IEluamVjdEZsYWdzKSB7XG4gIG5nRGV2TW9kZSAmJiBhc3NlcnRMVmlld09yVW5kZWZpbmVkKGxWaWV3KTtcblxuICBpZiAoZmxhZ3MgJiBJbmplY3RGbGFncy5Ta2lwU2VsZikge1xuICAgIG5nRGV2TW9kZSAmJiBhc3NlcnRUTm9kZUZvclRWaWV3KHROb2RlLCBsVmlld1tUVklFV10pO1xuXG4gICAgbGV0IHBhcmVudFROb2RlID0gdE5vZGUgYXMgVE5vZGUgfCBudWxsO1xuICAgIGxldCBwYXJlbnRMVmlldyA9IGxWaWV3O1xuXG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgIG5nRGV2TW9kZSAmJiBhc3NlcnREZWZpbmVkKHBhcmVudFROb2RlLCAnUGFyZW50IFROb2RlIHNob3VsZCBiZSBkZWZpbmVkJyk7XG4gICAgICBwYXJlbnRUTm9kZSA9IHBhcmVudFROb2RlIS5wYXJlbnQgYXMgVE5vZGUgfCBudWxsO1xuICAgICAgaWYgKHBhcmVudFROb2RlID09PSBudWxsICYmICEoZmxhZ3MgJiBJbmplY3RGbGFncy5Ib3N0KSkge1xuICAgICAgICBwYXJlbnRUTm9kZSA9IGdldERlY2xhcmF0aW9uVE5vZGUocGFyZW50TFZpZXcpO1xuICAgICAgICBpZiAocGFyZW50VE5vZGUgPT09IG51bGwpIGJyZWFrO1xuXG4gICAgICAgIC8vIEluIHRoaXMgY2FzZSwgYSBwYXJlbnQgZXhpc3RzIGFuZCBpcyBkZWZpbml0ZWx5IGFuIGVsZW1lbnQuIFNvIGl0IHdpbGwgZGVmaW5pdGVseVxuICAgICAgICAvLyBoYXZlIGFuIGV4aXN0aW5nIGxWaWV3IGFzIHRoZSBkZWNsYXJhdGlvbiB2aWV3LCB3aGljaCBpcyB3aHkgd2UgY2FuIGFzc3VtZSBpdCdzIGRlZmluZWQuXG4gICAgICAgIG5nRGV2TW9kZSAmJiBhc3NlcnREZWZpbmVkKHBhcmVudExWaWV3LCAnUGFyZW50IExWaWV3IHNob3VsZCBiZSBkZWZpbmVkJyk7XG4gICAgICAgIHBhcmVudExWaWV3ID0gcGFyZW50TFZpZXdbREVDTEFSQVRJT05fVklFV10hO1xuXG4gICAgICAgIC8vIEluIEl2eSB0aGVyZSBhcmUgQ29tbWVudCBub2RlcyB0aGF0IGNvcnJlc3BvbmQgdG8gbmdJZiBhbmQgTmdGb3IgZW1iZWRkZWQgZGlyZWN0aXZlc1xuICAgICAgICAvLyBXZSB3YW50IHRvIHNraXAgdGhvc2UgYW5kIGxvb2sgb25seSBhdCBFbGVtZW50cyBhbmQgRWxlbWVudENvbnRhaW5lcnMgdG8gZW5zdXJlXG4gICAgICAgIC8vIHdlJ3JlIGxvb2tpbmcgYXQgdHJ1ZSBwYXJlbnQgbm9kZXMsIGFuZCBub3QgY29udGVudCBvciBvdGhlciB0eXBlcy5cbiAgICAgICAgaWYgKHBhcmVudFROb2RlLnR5cGUgJiAoVE5vZGVUeXBlLkVsZW1lbnQgfCBUTm9kZVR5cGUuRWxlbWVudENvbnRhaW5lcikpIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChwYXJlbnRUTm9kZSA9PT0gbnVsbCkge1xuICAgICAgLy8gSWYgd2UgZmFpbGVkIHRvIGZpbmQgYSBwYXJlbnQgVE5vZGUgdGhpcyBtZWFucyB0aGF0IHdlIHNob3VsZCB1c2UgbW9kdWxlIGluamVjdG9yLlxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0gZWxzZSB7XG4gICAgICB0Tm9kZSA9IHBhcmVudFROb2RlO1xuICAgICAgbFZpZXcgPSBwYXJlbnRMVmlldztcbiAgICB9XG4gIH1cblxuICBuZ0Rldk1vZGUgJiYgYXNzZXJ0VE5vZGVGb3JMVmlldyh0Tm9kZSwgbFZpZXcpO1xuICBjb25zdCBsRnJhbWUgPSBpbnN0cnVjdGlvblN0YXRlLmxGcmFtZSA9IGFsbG9jTEZyYW1lKCk7XG4gIGxGcmFtZS5jdXJyZW50VE5vZGUgPSB0Tm9kZTtcbiAgbEZyYW1lLmxWaWV3ID0gbFZpZXc7XG5cbiAgcmV0dXJuIHRydWU7XG59XG5cbi8qKlxuICogU3dhcCB0aGUgY3VycmVudCBsVmlldyB3aXRoIGEgbmV3IGxWaWV3LlxuICpcbiAqIEZvciBwZXJmb3JtYW5jZSByZWFzb25zIHdlIHN0b3JlIHRoZSBsVmlldyBpbiB0aGUgdG9wIGxldmVsIG9mIHRoZSBtb2R1bGUuXG4gKiBUaGlzIHdheSB3ZSBtaW5pbWl6ZSB0aGUgbnVtYmVyIG9mIHByb3BlcnRpZXMgdG8gcmVhZC4gV2hlbmV2ZXIgYSBuZXcgdmlld1xuICogaXMgZW50ZXJlZCB3ZSBoYXZlIHRvIHN0b3JlIHRoZSBsVmlldyBmb3IgbGF0ZXIsIGFuZCB3aGVuIHRoZSB2aWV3IGlzXG4gKiBleGl0ZWQgdGhlIHN0YXRlIGhhcyB0byBiZSByZXN0b3JlZFxuICpcbiAqIEBwYXJhbSBuZXdWaWV3IE5ldyBsVmlldyB0byBiZWNvbWUgYWN0aXZlXG4gKiBAcmV0dXJucyB0aGUgcHJldmlvdXNseSBhY3RpdmUgbFZpZXc7XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlbnRlclZpZXcobmV3VmlldzogTFZpZXcpOiB2b2lkIHtcbiAgbmdEZXZNb2RlICYmIGFzc2VydE5vdEVxdWFsKG5ld1ZpZXdbMF0sIG5ld1ZpZXdbMV0gYXMgYW55LCAnPz8/PycpO1xuICBuZ0Rldk1vZGUgJiYgYXNzZXJ0TFZpZXdPclVuZGVmaW5lZChuZXdWaWV3KTtcbiAgY29uc3QgbmV3TEZyYW1lID0gYWxsb2NMRnJhbWUoKTtcbiAgaWYgKG5nRGV2TW9kZSkge1xuICAgIGFzc2VydEVxdWFsKG5ld0xGcmFtZS5pc1BhcmVudCwgdHJ1ZSwgJ0V4cGVjdGVkIGNsZWFuIExGcmFtZScpO1xuICAgIGFzc2VydEVxdWFsKG5ld0xGcmFtZS5sVmlldywgbnVsbCwgJ0V4cGVjdGVkIGNsZWFuIExGcmFtZScpO1xuICAgIGFzc2VydEVxdWFsKG5ld0xGcmFtZS50VmlldywgbnVsbCwgJ0V4cGVjdGVkIGNsZWFuIExGcmFtZScpO1xuICAgIGFzc2VydEVxdWFsKG5ld0xGcmFtZS5zZWxlY3RlZEluZGV4LCAtMSwgJ0V4cGVjdGVkIGNsZWFuIExGcmFtZScpO1xuICAgIGFzc2VydEVxdWFsKG5ld0xGcmFtZS5lbGVtZW50RGVwdGhDb3VudCwgMCwgJ0V4cGVjdGVkIGNsZWFuIExGcmFtZScpO1xuICAgIGFzc2VydEVxdWFsKG5ld0xGcmFtZS5jdXJyZW50RGlyZWN0aXZlSW5kZXgsIC0xLCAnRXhwZWN0ZWQgY2xlYW4gTEZyYW1lJyk7XG4gICAgYXNzZXJ0RXF1YWwobmV3TEZyYW1lLmN1cnJlbnROYW1lc3BhY2UsIG51bGwsICdFeHBlY3RlZCBjbGVhbiBMRnJhbWUnKTtcbiAgICBhc3NlcnRFcXVhbChuZXdMRnJhbWUuYmluZGluZ1Jvb3RJbmRleCwgLTEsICdFeHBlY3RlZCBjbGVhbiBMRnJhbWUnKTtcbiAgICBhc3NlcnRFcXVhbChuZXdMRnJhbWUuY3VycmVudFF1ZXJ5SW5kZXgsIDAsICdFeHBlY3RlZCBjbGVhbiBMRnJhbWUnKTtcbiAgfVxuICBjb25zdCB0VmlldyA9IG5ld1ZpZXdbVFZJRVddO1xuICBpbnN0cnVjdGlvblN0YXRlLmxGcmFtZSA9IG5ld0xGcmFtZTtcbiAgbmdEZXZNb2RlICYmIHRWaWV3LmZpcnN0Q2hpbGQgJiYgYXNzZXJ0VE5vZGVGb3JUVmlldyh0Vmlldy5maXJzdENoaWxkLCB0Vmlldyk7XG4gIG5ld0xGcmFtZS5jdXJyZW50VE5vZGUgPSB0Vmlldy5maXJzdENoaWxkITtcbiAgbmV3TEZyYW1lLmxWaWV3ID0gbmV3VmlldztcbiAgbmV3TEZyYW1lLnRWaWV3ID0gdFZpZXc7XG4gIG5ld0xGcmFtZS5jb250ZXh0TFZpZXcgPSBuZXdWaWV3ITtcbiAgbmV3TEZyYW1lLmJpbmRpbmdJbmRleCA9IHRWaWV3LmJpbmRpbmdTdGFydEluZGV4O1xuICBuZXdMRnJhbWUuaW5JMThuID0gZmFsc2U7XG59XG5cbi8qKlxuICogQWxsb2NhdGVzIG5leHQgZnJlZSBMRnJhbWUuIFRoaXMgZnVuY3Rpb24gdHJpZXMgdG8gcmV1c2UgdGhlIGBMRnJhbWVgcyB0byBsb3dlciBtZW1vcnkgcHJlc3N1cmUuXG4gKi9cbmZ1bmN0aW9uIGFsbG9jTEZyYW1lKCkge1xuICBjb25zdCBjdXJyZW50TEZyYW1lID0gaW5zdHJ1Y3Rpb25TdGF0ZS5sRnJhbWU7XG4gIGNvbnN0IGNoaWxkTEZyYW1lID0gY3VycmVudExGcmFtZSA9PT0gbnVsbCA/IG51bGwgOiBjdXJyZW50TEZyYW1lLmNoaWxkO1xuICBjb25zdCBuZXdMRnJhbWUgPSBjaGlsZExGcmFtZSA9PT0gbnVsbCA/IGNyZWF0ZUxGcmFtZShjdXJyZW50TEZyYW1lKSA6IGNoaWxkTEZyYW1lO1xuICByZXR1cm4gbmV3TEZyYW1lO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVMRnJhbWUocGFyZW50OiBMRnJhbWV8bnVsbCk6IExGcmFtZSB7XG4gIGNvbnN0IGxGcmFtZTogTEZyYW1lID0ge1xuICAgIGN1cnJlbnRUTm9kZTogbnVsbCxcbiAgICBpc1BhcmVudDogdHJ1ZSxcbiAgICBsVmlldzogbnVsbCEsXG4gICAgdFZpZXc6IG51bGwhLFxuICAgIHNlbGVjdGVkSW5kZXg6IC0xLFxuICAgIGNvbnRleHRMVmlldzogbnVsbCEsXG4gICAgZWxlbWVudERlcHRoQ291bnQ6IDAsXG4gICAgY3VycmVudE5hbWVzcGFjZTogbnVsbCxcbiAgICBjdXJyZW50RGlyZWN0aXZlSW5kZXg6IC0xLFxuICAgIGJpbmRpbmdSb290SW5kZXg6IC0xLFxuICAgIGJpbmRpbmdJbmRleDogLTEsXG4gICAgY3VycmVudFF1ZXJ5SW5kZXg6IDAsXG4gICAgcGFyZW50OiBwYXJlbnQhLFxuICAgIGNoaWxkOiBudWxsLFxuICAgIGluSTE4bjogZmFsc2UsXG4gIH07XG4gIHBhcmVudCAhPT0gbnVsbCAmJiAocGFyZW50LmNoaWxkID0gbEZyYW1lKTsgIC8vIGxpbmsgdGhlIG5ldyBMRnJhbWUgZm9yIHJldXNlLlxuICByZXR1cm4gbEZyYW1lO1xufVxuXG4vKipcbiAqIEEgbGlnaHR3ZWlnaHQgdmVyc2lvbiBvZiBsZWF2ZSB3aGljaCBpcyB1c2VkIHdpdGggREkuXG4gKlxuICogVGhpcyBmdW5jdGlvbiBvbmx5IHJlc2V0cyBgY3VycmVudFROb2RlYCBhbmQgYExWaWV3YCBhcyB0aG9zZSBhcmUgdGhlIG9ubHkgcHJvcGVydGllc1xuICogdXNlZCB3aXRoIERJIChgZW50ZXJESSgpYCkuXG4gKlxuICogTk9URTogVGhpcyBmdW5jdGlvbiBpcyByZWV4cG9ydGVkIGFzIGBsZWF2ZURJYC4gSG93ZXZlciBgbGVhdmVESWAgaGFzIHJldHVybiB0eXBlIG9mIGB2b2lkYCB3aGVyZVxuICogYXMgYGxlYXZlVmlld0xpZ2h0YCBoYXMgYExGcmFtZWAuIFRoaXMgaXMgc28gdGhhdCBgbGVhdmVWaWV3TGlnaHRgIGNhbiBiZSB1c2VkIGluIGBsZWF2ZVZpZXdgLlxuICovXG5mdW5jdGlvbiBsZWF2ZVZpZXdMaWdodCgpOiBMRnJhbWUge1xuICBjb25zdCBvbGRMRnJhbWUgPSBpbnN0cnVjdGlvblN0YXRlLmxGcmFtZTtcbiAgaW5zdHJ1Y3Rpb25TdGF0ZS5sRnJhbWUgPSBvbGRMRnJhbWUucGFyZW50O1xuICBvbGRMRnJhbWUuY3VycmVudFROb2RlID0gbnVsbCE7XG4gIG9sZExGcmFtZS5sVmlldyA9IG51bGwhO1xuICByZXR1cm4gb2xkTEZyYW1lO1xufVxuXG4vKipcbiAqIFRoaXMgaXMgYSBsaWdodHdlaWdodCB2ZXJzaW9uIG9mIHRoZSBgbGVhdmVWaWV3YCB3aGljaCBpcyBuZWVkZWQgYnkgdGhlIERJIHN5c3RlbS5cbiAqXG4gKiBOT1RFOiB0aGlzIGZ1bmN0aW9uIGlzIGFuIGFsaWFzIHNvIHRoYXQgd2UgY2FuIGNoYW5nZSB0aGUgdHlwZSBvZiB0aGUgZnVuY3Rpb24gdG8gaGF2ZSBgdm9pZGBcbiAqIHJldHVybiB0eXBlLlxuICovXG5leHBvcnQgY29uc3QgbGVhdmVESTogKCkgPT4gdm9pZCA9IGxlYXZlVmlld0xpZ2h0O1xuXG4vKipcbiAqIExlYXZlIHRoZSBjdXJyZW50IGBMVmlld2BcbiAqXG4gKiBUaGlzIHBvcHMgdGhlIGBMRnJhbWVgIHdpdGggdGhlIGFzc29jaWF0ZWQgYExWaWV3YCBmcm9tIHRoZSBzdGFjay5cbiAqXG4gKiBJTVBPUlRBTlQ6IFdlIG11c3QgemVybyBvdXQgdGhlIGBMRnJhbWVgIHZhbHVlcyBoZXJlIG90aGVyd2lzZSB0aGV5IHdpbGwgYmUgcmV0YWluZWQuIFRoaXMgaXNcbiAqIGJlY2F1c2UgZm9yIHBlcmZvcm1hbmNlIHJlYXNvbnMgd2UgZG9uJ3QgcmVsZWFzZSBgTEZyYW1lYCBidXQgcmF0aGVyIGtlZXAgaXQgZm9yIG5leHQgdXNlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gbGVhdmVWaWV3KCkge1xuICBjb25zdCBvbGRMRnJhbWUgPSBsZWF2ZVZpZXdMaWdodCgpO1xuICBvbGRMRnJhbWUuaXNQYXJlbnQgPSB0cnVlO1xuICBvbGRMRnJhbWUudFZpZXcgPSBudWxsITtcbiAgb2xkTEZyYW1lLnNlbGVjdGVkSW5kZXggPSAtMTtcbiAgb2xkTEZyYW1lLmNvbnRleHRMVmlldyA9IG51bGwhO1xuICBvbGRMRnJhbWUuZWxlbWVudERlcHRoQ291bnQgPSAwO1xuICBvbGRMRnJhbWUuY3VycmVudERpcmVjdGl2ZUluZGV4ID0gLTE7XG4gIG9sZExGcmFtZS5jdXJyZW50TmFtZXNwYWNlID0gbnVsbDtcbiAgb2xkTEZyYW1lLmJpbmRpbmdSb290SW5kZXggPSAtMTtcbiAgb2xkTEZyYW1lLmJpbmRpbmdJbmRleCA9IC0xO1xuICBvbGRMRnJhbWUuY3VycmVudFF1ZXJ5SW5kZXggPSAwO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbmV4dENvbnRleHRJbXBsPFQgPSBhbnk+KGxldmVsOiBudW1iZXIpOiBUIHtcbiAgY29uc3QgY29udGV4dExWaWV3ID0gaW5zdHJ1Y3Rpb25TdGF0ZS5sRnJhbWUuY29udGV4dExWaWV3ID1cbiAgICAgIHdhbGtVcFZpZXdzKGxldmVsLCBpbnN0cnVjdGlvblN0YXRlLmxGcmFtZS5jb250ZXh0TFZpZXchKTtcbiAgcmV0dXJuIGNvbnRleHRMVmlld1tDT05URVhUXSBhcyBUO1xufVxuXG5mdW5jdGlvbiB3YWxrVXBWaWV3cyhuZXN0aW5nTGV2ZWw6IG51bWJlciwgY3VycmVudFZpZXc6IExWaWV3KTogTFZpZXcge1xuICB3aGlsZSAobmVzdGluZ0xldmVsID4gMCkge1xuICAgIG5nRGV2TW9kZSAmJlxuICAgICAgICBhc3NlcnREZWZpbmVkKFxuICAgICAgICAgICAgY3VycmVudFZpZXdbREVDTEFSQVRJT05fVklFV10sXG4gICAgICAgICAgICAnRGVjbGFyYXRpb24gdmlldyBzaG91bGQgYmUgZGVmaW5lZCBpZiBuZXN0aW5nIGxldmVsIGlzIGdyZWF0ZXIgdGhhbiAwLicpO1xuICAgIGN1cnJlbnRWaWV3ID0gY3VycmVudFZpZXdbREVDTEFSQVRJT05fVklFV10hO1xuICAgIG5lc3RpbmdMZXZlbC0tO1xuICB9XG4gIHJldHVybiBjdXJyZW50Vmlldztcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgZWxlbWVudCBpbmRleC5cbiAqXG4gKiBVc2VkIHdpdGgge0BsaW5rIHByb3BlcnR5fSBpbnN0cnVjdGlvbiAoYW5kIG1vcmUgaW4gdGhlIGZ1dHVyZSkgdG8gaWRlbnRpZnkgdGhlIGluZGV4IGluIHRoZVxuICogY3VycmVudCBgTFZpZXdgIHRvIGFjdCBvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFNlbGVjdGVkSW5kZXgoKSB7XG4gIHJldHVybiBpbnN0cnVjdGlvblN0YXRlLmxGcmFtZS5zZWxlY3RlZEluZGV4O1xufVxuXG4vKipcbiAqIFNldHMgdGhlIG1vc3QgcmVjZW50IGluZGV4IHBhc3NlZCB0byB7QGxpbmsgc2VsZWN0fVxuICpcbiAqIFVzZWQgd2l0aCB7QGxpbmsgcHJvcGVydHl9IGluc3RydWN0aW9uIChhbmQgbW9yZSBpbiB0aGUgZnV0dXJlKSB0byBpZGVudGlmeSB0aGUgaW5kZXggaW4gdGhlXG4gKiBjdXJyZW50IGBMVmlld2AgdG8gYWN0IG9uLlxuICpcbiAqIChOb3RlIHRoYXQgaWYgYW4gXCJleGl0IGZ1bmN0aW9uXCIgd2FzIHNldCBlYXJsaWVyICh2aWEgYHNldEVsZW1lbnRFeGl0Rm4oKWApIHRoZW4gdGhhdCB3aWxsIGJlXG4gKiBydW4gaWYgYW5kIHdoZW4gdGhlIHByb3ZpZGVkIGBpbmRleGAgdmFsdWUgaXMgZGlmZmVyZW50IGZyb20gdGhlIGN1cnJlbnQgc2VsZWN0ZWQgaW5kZXggdmFsdWUuKVxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0U2VsZWN0ZWRJbmRleChpbmRleDogbnVtYmVyKSB7XG4gIG5nRGV2TW9kZSAmJiBpbmRleCAhPT0gLTEgJiZcbiAgICAgIGFzc2VydEdyZWF0ZXJUaGFuT3JFcXVhbChpbmRleCwgSEVBREVSX09GRlNFVCwgJ0luZGV4IG11c3QgYmUgcGFzdCBIRUFERVJfT0ZGU0VUIChvciAtMSkuJyk7XG4gIG5nRGV2TW9kZSAmJlxuICAgICAgYXNzZXJ0TGVzc1RoYW4oXG4gICAgICAgICAgaW5kZXgsIGluc3RydWN0aW9uU3RhdGUubEZyYW1lLmxWaWV3Lmxlbmd0aCwgJ0NhblxcJ3Qgc2V0IGluZGV4IHBhc3NlZCBlbmQgb2YgTFZpZXcnKTtcbiAgaW5zdHJ1Y3Rpb25TdGF0ZS5sRnJhbWUuc2VsZWN0ZWRJbmRleCA9IGluZGV4O1xufVxuXG4vKipcbiAqIEdldHMgdGhlIGB0Tm9kZWAgdGhhdCByZXByZXNlbnRzIGN1cnJlbnRseSBzZWxlY3RlZCBlbGVtZW50LlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0U2VsZWN0ZWRUTm9kZSgpIHtcbiAgY29uc3QgbEZyYW1lID0gaW5zdHJ1Y3Rpb25TdGF0ZS5sRnJhbWU7XG4gIHJldHVybiBnZXRUTm9kZShsRnJhbWUudFZpZXcsIGxGcmFtZS5zZWxlY3RlZEluZGV4KTtcbn1cblxuLyoqXG4gKiBTZXRzIHRoZSBuYW1lc3BhY2UgdXNlZCB0byBjcmVhdGUgZWxlbWVudHMgdG8gYCdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZydgIGluIGdsb2JhbCBzdGF0ZS5cbiAqXG4gKiBAY29kZUdlbkFwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gybXJtW5hbWVzcGFjZVNWRygpIHtcbiAgaW5zdHJ1Y3Rpb25TdGF0ZS5sRnJhbWUuY3VycmVudE5hbWVzcGFjZSA9IFNWR19OQU1FU1BBQ0U7XG59XG5cbi8qKlxuICogU2V0cyB0aGUgbmFtZXNwYWNlIHVzZWQgdG8gY3JlYXRlIGVsZW1lbnRzIHRvIGAnaHR0cDovL3d3dy53My5vcmcvMTk5OC9NYXRoTUwvJ2AgaW4gZ2xvYmFsIHN0YXRlLlxuICpcbiAqIEBjb2RlR2VuQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiDJtcm1bmFtZXNwYWNlTWF0aE1MKCkge1xuICBpbnN0cnVjdGlvblN0YXRlLmxGcmFtZS5jdXJyZW50TmFtZXNwYWNlID0gTUFUSF9NTF9OQU1FU1BBQ0U7XG59XG5cbi8qKlxuICogU2V0cyB0aGUgbmFtZXNwYWNlIHVzZWQgdG8gY3JlYXRlIGVsZW1lbnRzIHRvIGBudWxsYCwgd2hpY2ggZm9yY2VzIGVsZW1lbnQgY3JlYXRpb24gdG8gdXNlXG4gKiBgY3JlYXRlRWxlbWVudGAgcmF0aGVyIHRoYW4gYGNyZWF0ZUVsZW1lbnROU2AuXG4gKlxuICogQGNvZGVHZW5BcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIMm1ybVuYW1lc3BhY2VIVE1MKCkge1xuICBuYW1lc3BhY2VIVE1MSW50ZXJuYWwoKTtcbn1cblxuLyoqXG4gKiBTZXRzIHRoZSBuYW1lc3BhY2UgdXNlZCB0byBjcmVhdGUgZWxlbWVudHMgdG8gYG51bGxgLCB3aGljaCBmb3JjZXMgZWxlbWVudCBjcmVhdGlvbiB0byB1c2VcbiAqIGBjcmVhdGVFbGVtZW50YCByYXRoZXIgdGhhbiBgY3JlYXRlRWxlbWVudE5TYC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG5hbWVzcGFjZUhUTUxJbnRlcm5hbCgpIHtcbiAgaW5zdHJ1Y3Rpb25TdGF0ZS5sRnJhbWUuY3VycmVudE5hbWVzcGFjZSA9IG51bGw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXROYW1lc3BhY2UoKTogc3RyaW5nfG51bGwge1xuICByZXR1cm4gaW5zdHJ1Y3Rpb25TdGF0ZS5sRnJhbWUuY3VycmVudE5hbWVzcGFjZTtcbn1cbiJdfQ==