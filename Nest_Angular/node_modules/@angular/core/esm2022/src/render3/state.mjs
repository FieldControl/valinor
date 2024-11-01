/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { InjectFlags } from '../di/interface/injector';
import { assertDefined, assertEqual, assertGreaterThanOrEqual, assertLessThan, assertNotEqual, throwError, } from '../util/assert';
import { assertLViewOrUndefined, assertTNodeForLView, assertTNodeForTView } from './assert';
import { CONTEXT, DECLARATION_VIEW, HEADER_OFFSET, T_HOST, TVIEW, } from './interfaces/view';
import { MATH_ML_NAMESPACE, SVG_NAMESPACE } from './namespaces';
import { getTNode, walkUpViews } from './util/view_utils';
const instructionState = {
    lFrame: createLFrame(null),
    bindingsEnabled: true,
    skipHydrationRootTNode: null,
};
export var CheckNoChangesMode;
(function (CheckNoChangesMode) {
    CheckNoChangesMode[CheckNoChangesMode["Off"] = 0] = "Off";
    CheckNoChangesMode[CheckNoChangesMode["Exhaustive"] = 1] = "Exhaustive";
    CheckNoChangesMode[CheckNoChangesMode["OnlyDirtyViews"] = 2] = "OnlyDirtyViews";
})(CheckNoChangesMode || (CheckNoChangesMode = {}));
/**
 * In this mode, any changes in bindings will throw an ExpressionChangedAfterChecked error.
 *
 * Necessary to support ChangeDetectorRef.checkNoChanges().
 *
 * The `checkNoChanges` function is invoked only in ngDevMode=true and verifies that no unintended
 * changes exist in the change detector or its children.
 */
let _checkNoChangesMode = 0; /* CheckNoChangesMode.Off */
/**
 * Flag used to indicate that we are in the middle running change detection on a view
 *
 * @see detectChangesInViewWhileDirty
 */
let _isRefreshingViews = false;
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
 * Returns true if currently inside a skip hydration block.
 * @returns boolean
 */
export function isInSkipHydrationBlock() {
    return instructionState.skipHydrationRootTNode !== null;
}
/**
 * Returns true if this is the root TNode of the skip hydration block.
 * @param tNode the current TNode
 * @returns boolean
 */
export function isSkipHydrationRootTNode(tNode) {
    return instructionState.skipHydrationRootTNode === tNode;
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
 * Sets a flag to specify that the TNode is in a skip hydration block.
 * @param tNode the current TNode
 */
export function enterSkipHydrationBlock(tNode) {
    instructionState.skipHydrationRootTNode = tNode;
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
 * Clears the root skip hydration node when leaving a skip hydration block.
 */
export function leaveSkipHydrationBlock() {
    instructionState.skipHydrationRootTNode = null;
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
/**
 * Clears the view set in `ɵɵrestoreView` from memory. Returns the passed in
 * value so that it can be used as a return value of an instruction.
 *
 * @codeGenApi
 */
export function ɵɵresetView(value) {
    instructionState.lFrame.contextLView = null;
    return value;
}
export function getCurrentTNode() {
    let currentTNode = getCurrentTNodePlaceholderOk();
    while (currentTNode !== null && currentTNode.type === 64 /* TNodeType.Placeholder */) {
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
export function getContextLView() {
    const contextLView = instructionState.lFrame.contextLView;
    ngDevMode && assertDefined(contextLView, 'contextLView must be defined.');
    return contextLView;
}
export function isInCheckNoChangesMode() {
    !ngDevMode && throwError('Must never be called in production mode');
    return _checkNoChangesMode !== CheckNoChangesMode.Off;
}
export function isExhaustiveCheckNoChanges() {
    !ngDevMode && throwError('Must never be called in production mode');
    return _checkNoChangesMode === CheckNoChangesMode.Exhaustive;
}
export function setIsInCheckNoChangesMode(mode) {
    !ngDevMode && throwError('Must never be called in production mode');
    _checkNoChangesMode = mode;
}
export function isRefreshingViews() {
    return _isRefreshingViews;
}
export function setIsRefreshingViews(mode) {
    _isRefreshingViews = mode;
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
    return (instructionState.lFrame.bindingIndex = value);
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
    if (tView.type === 2 /* TViewType.Embedded */) {
        ngDevMode && assertDefined(tView.declTNode, 'Embedded TNodes should have declaration parents.');
        return tView.declTNode;
    }
    // Components don't have `TView.declTNode` because each instance of component could be
    // inserted in different location, hence `TView.declTNode` is meaningless.
    // Falling back to `T_HOST` in case we cross component boundary.
    if (tView.type === 1 /* TViewType.Component */) {
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
                if (parentTNode.type & (2 /* TNodeType.Element */ | 8 /* TNodeType.ElementContainer */)) {
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
    const lFrame = (instructionState.lFrame = allocLFrame());
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
    const contextLView = (instructionState.lFrame.contextLView = walkUpViews(level, instructionState.lFrame.contextLView));
    return contextLView[CONTEXT];
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
    ngDevMode &&
        index !== -1 &&
        assertGreaterThanOrEqual(index, HEADER_OFFSET, 'Index must be past HEADER_OFFSET (or -1).');
    ngDevMode &&
        assertLessThan(index, instructionState.lFrame.lView.length, "Can't set index passed end of LView");
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
let _wasLastNodeCreated = true;
/**
 * Retrieves a global flag that indicates whether the most recent DOM node
 * was created or hydrated.
 */
export function wasLastNodeCreated() {
    return _wasLastNodeCreated;
}
/**
 * Sets a global flag to indicate whether the most recent DOM node
 * was created or hydrated.
 */
export function lastNodeWasCreated(flag) {
    _wasLastNodeCreated = flag;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy9yZW5kZXIzL3N0YXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSwwQkFBMEIsQ0FBQztBQUNyRCxPQUFPLEVBQ0wsYUFBYSxFQUNiLFdBQVcsRUFDWCx3QkFBd0IsRUFDeEIsY0FBYyxFQUNkLGNBQWMsRUFDZCxVQUFVLEdBQ1gsTUFBTSxnQkFBZ0IsQ0FBQztBQUV4QixPQUFPLEVBQUMsc0JBQXNCLEVBQUUsbUJBQW1CLEVBQUUsbUJBQW1CLEVBQUMsTUFBTSxVQUFVLENBQUM7QUFHMUYsT0FBTyxFQUNMLE9BQU8sRUFDUCxnQkFBZ0IsRUFDaEIsYUFBYSxFQUdiLE1BQU0sRUFFTixLQUFLLEdBR04sTUFBTSxtQkFBbUIsQ0FBQztBQUMzQixPQUFPLEVBQUMsaUJBQWlCLEVBQUUsYUFBYSxFQUFDLE1BQU0sY0FBYyxDQUFDO0FBQzlELE9BQU8sRUFBQyxRQUFRLEVBQUUsV0FBVyxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUEwS3hELE1BQU0sZ0JBQWdCLEdBQXFCO0lBQ3pDLE1BQU0sRUFBRSxZQUFZLENBQUMsSUFBSSxDQUFDO0lBQzFCLGVBQWUsRUFBRSxJQUFJO0lBQ3JCLHNCQUFzQixFQUFFLElBQUk7Q0FDN0IsQ0FBQztBQUVGLE1BQU0sQ0FBTixJQUFZLGtCQUlYO0FBSkQsV0FBWSxrQkFBa0I7SUFDNUIseURBQUcsQ0FBQTtJQUNILHVFQUFVLENBQUE7SUFDViwrRUFBYyxDQUFBO0FBQ2hCLENBQUMsRUFKVyxrQkFBa0IsS0FBbEIsa0JBQWtCLFFBSTdCO0FBRUQ7Ozs7Ozs7R0FPRztBQUNILElBQUksbUJBQW1CLEdBQXVCLENBQUMsQ0FBQyxDQUFDLDRCQUE0QjtBQUU3RTs7OztHQUlHO0FBQ0gsSUFBSSxrQkFBa0IsR0FBRyxL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QUFVLGNBQWM7SUFDNUIsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLGdCQUFnQixHQUFHLGFBQWEsQ0FBQztBQUMzRCxDQUFDO0FBRUQ7Ozs7R0FJRztBQUNILE1BQU0sVUFBVSxpQkFBaUI7SUFDL0IsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLGdCQUFnQixHQUFHLGlCQUFpQixDQUFDO0FBQy9ELENBQUM7QUFFRDs7Ozs7R0FLRztBQUNILE1BQU0sVUFBVSxlQUFlO0lBQzdCLHFCQUFxQixFQUFFLENBQUM7QUFDMUIsQ0FBQztBQUVEOzs7R0FHRztBQUNILE1BQU0sVUFBVSxxQkFBcUI7SUFDbkMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQztBQUNsRCxDQUFDO0FBRUQsTUFBTSxVQUFVLFlBQVk7SUFDMUIsT0FBTyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUM7QUFDbEQsQ0FBQztBQUVELElBQUksbUJBQW1CLEdBQUcsSUFBSSxDQUFDO0FBRS9COzs7R0FHRztBQUNILE1BQU0sVUFBVSxrQkFBa0I7SUFDaEMsT0FBTyxtQkFBbUIsQ0FBQztBQUM3QixDQUFDO0FBRUQ7OztHQUdHO0FBQ0gsTUFBTSxVQUFVLGtCQUFrQixDQUFDLElBQWE7SUFDOUMsbUJBQW1CLEdBQUcsSUFBSSxDQUFDO0FBQzdCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbmltcG9ydCB7SW5qZWN0RmxhZ3N9IGZyb20gJy4uL2RpL2ludGVyZmFjZS9pbmplY3Rvcic7XG5pbXBvcnQge1xuICBhc3NlcnREZWZpbmVkLFxuICBhc3NlcnRFcXVhbCxcbiAgYXNzZXJ0R3JlYXRlclRoYW5PckVxdWFsLFxuICBhc3NlcnRMZXNzVGhhbixcbiAgYXNzZXJ0Tm90RXF1YWwsXG4gIHRocm93RXJyb3IsXG59IGZyb20gJy4uL3V0aWwvYXNzZXJ0JztcblxuaW1wb3J0IHthc3NlcnRMVmlld09yVW5kZWZpbmVkLCBhc3NlcnRUTm9kZUZvckxWaWV3LCBhc3NlcnRUTm9kZUZvclRWaWV3fSBmcm9tICcuL2Fzc2VydCc7XG5pbXBvcnQge0RpcmVjdGl2ZURlZn0gZnJvbSAnLi9pbnRlcmZhY2VzL2RlZmluaXRpb24nO1xuaW1wb3J0IHtUTm9kZSwgVE5vZGVUeXBlfSBmcm9tICcuL2ludGVyZmFjZXMvbm9kZSc7XG5pbXBvcnQge1xuICBDT05URVhULFxuICBERUNMQVJBVElPTl9WSUVXLFxuICBIRUFERVJfT0ZGU0VULFxuICBMVmlldyxcbiAgT3BhcXVlVmlld1N0YXRlLFxuICBUX0hPU1QsXG4gIFREYXRhLFxuICBUVklFVyxcbiAgVFZpZXcsXG4gIFRWaWV3VHlwZSxcbn0gZnJvbSAnLi9pbnRlcmZhY2VzL3ZpZXcnO1xuaW1wb3J0IHtNQVRIX01MX05BTUVTUEFDRSwgU1ZHX05BTUVTUEFDRX0gZnJvbSAnLi9uYW1lc3BhY2VzJztcbmltcG9ydCB7Z2V0VE5vZGUsIHdhbGtVcFZpZXdzfSBmcm9tICcuL3V0aWwvdmlld191dGlscyc7XG5cbi8qKlxuICpcbiAqL1xuaW50ZXJmYWNlIExGcmFtZSB7XG4gIC8qKlxuICAgKiBQYXJlbnQgTEZyYW1lLlxuICAgKlxuICAgKiBUaGlzIGlzIG5lZWRlZCB3aGVuIGBsZWF2ZVZpZXdgIGlzIGNhbGxlZCB0byByZXN0b3JlIHRoZSBwcmV2aW91cyBzdGF0ZS5cbiAgICovXG4gIHBhcmVudDogTEZyYW1lO1xuXG4gIC8qKlxuICAgKiBDaGlsZCBMRnJhbWUuXG4gICAqXG4gICAqIFRoaXMgaXMgdXNlZCB0byBjYWNoZSBleGlzdGluZyBMRnJhbWVzIHRvIHJlbGlldmUgdGhlIG1lbW9yeSBwcmVzc3VyZS5cbiAgICovXG4gIGNoaWxkOiBMRnJhbWUgfCBudWxsO1xuXG4gIC8qKlxuICAgKiBTdGF0ZSBvZiB0aGUgY3VycmVudCB2aWV3IGJlaW5nIHByb2Nlc3NlZC5cbiAgICpcbiAgICogQW4gYXJyYXkgb2Ygbm9kZXMgKHRleHQsIGVsZW1lbnQsIGNvbnRhaW5lciwgZXRjKSwgcGlwZXMsIHRoZWlyIGJpbmRpbmdzLCBhbmRcbiAgICogYW55IGxvY2FsIHZhcmlhYmxlcyB0aGF0IG5lZWQgdG8gYmUgc3RvcmVkIGJldHdlZW4gaW52b2NhdGlvbnMuXG4gICAqL1xuICBsVmlldzogTFZpZXc7XG5cbiAgLyoqXG4gICAqIEN1cnJlbnQgYFRWaWV3YCBhc3NvY2lhdGVkIHdpdGggdGhlIGBMRnJhbWUubFZpZXdgLlxuICAgKlxuICAgKiBPbmUgY2FuIGdldCBgVFZpZXdgIGZyb20gYGxGcmFtZVtUVklFV11gIGhvd2V2ZXIgYmVjYXVzZSBpdCBpcyBzbyBjb21tb24gaXQgbWFrZXMgc2Vuc2UgdG9cbiAgICogc3RvcmUgaXQgaW4gYExGcmFtZWAgZm9yIHBlcmYgcmVhc29ucy5cbiAgICovXG4gIHRWaWV3OiBUVmlldztcblxuICAvKipcbiAgICogVXNlZCB0byBzZXQgdGhlIHBhcmVudCBwcm9wZXJ0eSB3aGVuIG5vZGVzIGFyZSBjcmVhdGVkIGFuZCB0cmFjayBxdWVyeSByZXN1bHRzLlxuICAgKlxuICAgKiBUaGlzIGlzIHVzZWQgaW4gY29uanVuY3Rpb24gd2l0aCBgaXNQYXJlbnRgLlxuICAgKi9cbiAgY3VycmVudFROb2RlOiBUTm9kZSB8IG51bGw7XG5cbiAgLyoqXG4gICAqIElmIGBpc1BhcmVudGAgaXM6XG4gICAqICAtIGB0cnVlYDogdGhlbiBgY3VycmVudFROb2RlYCBwb2ludHMgdG8gYSBwYXJlbnQgbm9kZS5cbiAgICogIC0gYGZhbHNlYDogdGhlbiBgY3VycmVudFROb2RlYCBwb2ludHMgdG8gcHJldmlvdXMgbm9kZSAoc2libGluZykuXG4gICAqL1xuICBpc1BhcmVudDogYm9vbGVhbjtcblxuICAvKipcbiAgICogSW5kZXggb2YgY3VycmVudGx5IHNlbGVjdGVkIGVsZW1lbnQgaW4gTFZpZXcuXG4gICAqXG4gICAqIFVzZWQgYnkgYmluZGluZyBpbnN0cnVjdGlvbnMuIFVwZGF0ZWQgYXMgcGFydCBvZiBhZHZhbmNlIGluc3RydWN0aW9uLlxuICAgKi9cbiAgc2VsZWN0ZWRJbmRleDogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBDdXJyZW50IHBvaW50ZXIgdG8gdGhlIGJpbmRpbmcgaW5kZXguXG4gICAqL1xuICBiaW5kaW5nSW5kZXg6IG51bWJlcjtcblxuICAvKipcbiAgICogVGhlIGxhc3Qgdmlld0RhdGEgcmV0cmlldmVkIGJ5IG5leHRDb250ZXh0KCkuXG4gICAqIEFsbG93cyBidWlsZGluZyBuZXh0Q29udGV4dCgpIGFuZCByZWZlcmVuY2UoKSBjYWxscy5cbiAgICpcbiAgICogZS5nLiBjb25zdCBpbm5lciA9IHgoKS4kaW1wbGljaXQ7IGNvbnN0IG91dGVyID0geCgpLiRpbXBsaWNpdDtcbiAgICovXG4gIGNvbnRleHRMVmlldzogTFZpZXcgfCBudWxsO1xuXG4gIC8qKlxuICAgKiBTdG9yZSB0aGUgZWxlbWVudCBkZXB0aCBjb3VudC4gVGhpcyBpcyB1c2VkIHRvIGlkZW50aWZ5IHRoZSByb290IGVsZW1lbnRzIG9mIHRoZSB0ZW1wbGF0ZVxuICAgKiBzbyB0aGF0IHdlIGNhbiB0aGVuIGF0dGFjaCBwYXRjaCBkYXRhIGBMVmlld2AgdG8gb25seSB0aG9zZSBlbGVtZW50cy4gV2Uga25vdyB0aGF0IHRob3NlXG4gICAqIGFyZSB0aGUgb25seSBwbGFjZXMgd2hlcmUgdGhlIHBhdGNoIGRhdGEgY291bGQgY2hhbmdlLCB0aGlzIHdheSB3ZSB3aWxsIHNhdmUgb24gbnVtYmVyXG4gICAqIG9mIHBsYWNlcyB3aGVyZSB0aGEgcGF0Y2hpbmcgb2NjdXJzLlxuICAgKi9cbiAgZWxlbWVudERlcHRoQ291bnQ6IG51bWJlcjtcblxuICAvKipcbiAgICogQ3VycmVudCBuYW1lc3BhY2UgdG8gYmUgdXNlZCB3aGVuIGNyZWF0aW5nIGVsZW1lbnRzXG4gICAqL1xuICBjdXJyZW50TmFtZXNwYWNlOiBzdHJpbmcgfCBudWxsO1xuXG4gIC8qKlxuICAgKiBUaGUgcm9vdCBpbmRleCBmcm9tIHdoaWNoIHB1cmUgZnVuY3Rpb24gaW5zdHJ1Y3Rpb25zIHNob3VsZCBjYWxjdWxhdGUgdGhlaXIgYmluZGluZ1xuICAgKiBpbmRpY2VzLiBJbiBjb21wb25lbnQgdmlld3MsIHRoaXMgaXMgVFZpZXcuYmluZGluZ1N0YXJ0SW5kZXguIEluIGEgaG9zdCBiaW5kaW5nXG4gICAqIGNvbnRleHQsIHRoaXMgaXMgdGhlIFRWaWV3LmV4cGFuZG9TdGFydEluZGV4ICsgYW55IGRpcnMvaG9zdFZhcnMgYmVmb3JlIHRoZSBnaXZlbiBkaXIuXG4gICAqL1xuICBiaW5kaW5nUm9vdEluZGV4OiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIEN1cnJlbnQgaW5kZXggb2YgYSBWaWV3IG9yIENvbnRlbnQgUXVlcnkgd2hpY2ggbmVlZHMgdG8gYmUgcHJvY2Vzc2VkIG5leHQuXG4gICAqIFdlIGl0ZXJhdGUgb3ZlciB0aGUgbGlzdCBvZiBRdWVyaWVzIGFuZCBpbmNyZW1lbnQgY3VycmVudCBxdWVyeSBpbmRleCBhdCBldmVyeSBzdGVwLlxuICAgKi9cbiAgY3VycmVudFF1ZXJ5SW5kZXg6IG51bWJlcjtcblxuICAvKipcbiAgICogV2hlbiBob3N0IGJpbmRpbmcgaXMgZXhlY3V0aW5nIHRoaXMgcG9pbnRzIHRvIHRoZSBkaXJlY3RpdmUgaW5kZXguXG4gICAqIGBUVmlldy5kYXRhW2N1cnJlbnREaXJlY3RpdmVJbmRleF1gIGlzIGBEaXJlY3RpdmVEZWZgXG4gICAqIGBMVmlld1tjdXJyZW50RGlyZWN0aXZlSW5kZXhdYCBpcyBkaXJlY3RpdmUgaW5zdGFuY2UuXG4gICAqL1xuICBjdXJyZW50RGlyZWN0aXZlSW5kZXg6IG51bWJlcjtcblxuICAvKipcbiAgICogQXJlIHdlIGN1cnJlbnRseSBpbiBpMThuIGJsb2NrIGFzIGRlbm90ZWQgYnkgYMm1ybVlbGVtZW50U3RhcnRgIGFuZCBgybXJtWVsZW1lbnRFbmRgLlxuICAgKlxuICAgKiBUaGlzIGluZm9ybWF0aW9uIGlzIG5lZWRlZCBiZWNhdXNlIHdoaWxlIHdlIGFyZSBpbiBpMThuIGJsb2NrIGFsbCBlbGVtZW50cyBtdXN0IGJlIHByZS1kZWNsYXJlZFxuICAgKiBpbiB0aGUgdHJhbnNsYXRpb24uIChpLmUuIGBIZWxsbyDvv70jMu+/vVdvcmxk77+9LyMy77+9IWAgcHJlLWRlY2xhcmVzIGVsZW1lbnQgYXQgYO+/vSMy77+9YCBsb2NhdGlvbi4pXG4gICAqIFRoaXMgYWxsb2NhdGVzIGBUTm9kZVR5cGUuUGxhY2Vob2xkZXJgIGVsZW1lbnQgYXQgbG9jYXRpb24gYDJgLiBJZiB0cmFuc2xhdG9yIHJlbW92ZXMgYO+/vSMy77+9YFxuICAgKiBmcm9tIHRyYW5zbGF0aW9uIHRoYW4gdGhlIHJ1bnRpbWUgbXVzdCBhbHNvIGVuc3VyZSB0aGEgZWxlbWVudCBhdCBgMmAgZG9lcyBub3QgZ2V0IGluc2VydGVkXG4gICAqIGludG8gdGhlIERPTS4gVGhlIHRyYW5zbGF0aW9uIGRvZXMgbm90IGNhcnJ5IGluZm9ybWF0aW9uIGFib3V0IGRlbGV0ZWQgZWxlbWVudHMuIFRoZXJlZm9yIHRoZVxuICAgKiBvbmx5IHdheSB0byBrbm93IHRoYXQgYW4gZWxlbWVudCBpcyBkZWxldGVkIGlzIHRoYXQgaXQgd2FzIG5vdCBwcmUtZGVjbGFyZWQgaW4gdGhlIHRyYW5zbGF0aW9uLlxuICAgKlxuICAgKiBUaGlzIGZsYWcgd29ya3MgYnkgZW5zdXJpbmcgdGhhdCBlbGVtZW50cyB3aGljaCBhcmUgY3JlYXRlZCB3aXRob3V0IHByZS1kZWNsYXJhdGlvblxuICAgKiAoYFROb2RlVHlwZS5QbGFjZWhvbGRlcmApIGFyZSBub3QgaW5zZXJ0ZWQgaW50byB0aGUgRE9NIHJlbmRlciB0cmVlLiAoSXQgZG9lcyBtZWFuIHRoYXQgdGhlXG4gICAqIGVsZW1lbnQgc3RpbGwgZ2V0cyBpbnN0YW50aWF0ZWQgYWxvbmcgd2l0aCBhbGwgb2YgaXRzIGJlaGF2aW9yIFtkaXJlY3RpdmVzXSlcbiAgICovXG4gIGluSTE4bjogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBBbGwgaW1wbGljaXQgaW5zdHJ1Y3Rpb24gc3RhdGUgaXMgc3RvcmVkIGhlcmUuXG4gKlxuICogSXQgaXMgdXNlZnVsIHRvIGhhdmUgYSBzaW5nbGUgb2JqZWN0IHdoZXJlIGFsbCBvZiB0aGUgc3RhdGUgaXMgc3RvcmVkIGFzIGEgbWVudGFsIG1vZGVsXG4gKiAocmF0aGVyIGl0IGJlaW5nIHNwcmVhZCBhY3Jvc3MgbWFueSBkaWZmZXJlbnQgdmFyaWFibGVzLilcbiAqXG4gKiBQRVJGIE5PVEU6IFR1cm5zIG91dCB0aGF0IHdyaXRpbmcgdG8gYSB0cnVlIGdsb2JhbCB2YXJpYWJsZSBpcyBzbG93ZXIgdGhhblxuICogaGF2aW5nIGFuIGludGVybWVkaWF0ZSBvYmplY3Qgd2l0aCBwcm9wZXJ0aWVzLlxuICovXG5pbnRlcmZhY2UgSW5zdHJ1Y3Rpb25TdGF0ZSB7XG4gIC8qKlxuICAgKiBDdXJyZW50IGBMRnJhbWVgXG4gICAqXG4gICAqIGBudWxsYCBpZiB3ZSBoYXZlIG5vdCBjYWxsZWQgYGVudGVyVmlld2BcbiAgICovXG4gIGxGcmFtZTogTEZyYW1lO1xuXG4gIC8qKlxuICAgKiBTdG9yZXMgd2hldGhlciBkaXJlY3RpdmVzIHNob3VsZCBiZSBtYXRjaGVkIHRvIGVsZW1lbnRzLlxuICAgKlxuICAgKiBXaGVuIHRlbXBsYXRlIGNvbnRhaW5zIGBuZ05vbkJpbmRhYmxlYCB0aGVuIHdlIG5lZWQgdG8gcHJldmVudCB0aGUgcnVudGltZSBmcm9tIG1hdGNoaW5nXG4gICAqIGRpcmVjdGl2ZXMgb24gY2hpbGRyZW4gb2YgdGhhdCBlbGVtZW50LlxuICAgKlxuICAgKiBFeGFtcGxlOlxuICAgKiBgYGBcbiAgICogPG15LWNvbXAgbXktZGlyZWN0aXZlPlxuICAgKiAgIFNob3VsZCBtYXRjaCBjb21wb25lbnQgLyBkaXJlY3RpdmUuXG4gICAqIDwvbXktY29tcD5cbiAgICogPGRpdiBuZ05vbkJpbmRhYmxlPlxuICAgKiAgIDxteS1jb21wIG15LWRpcmVjdGl2ZT5cbiAgICogICAgIFNob3VsZCBub3QgbWF0Y2ggY29tcG9uZW50IC8gZGlyZWN0aXZlIGJlY2F1c2Ugd2UgYXJlIGluIG5nTm9uQmluZGFibGUuXG4gICAqICAgPC9teS1jb21wPlxuICAgKiA8L2Rpdj5cbiAgICogYGBgXG4gICAqL1xuICBiaW5kaW5nc0VuYWJsZWQ6IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIFN0b3JlcyB0aGUgcm9vdCBUTm9kZSB0aGF0IGhhcyB0aGUgJ25nU2tpcEh5ZHJhdGlvbicgYXR0cmlidXRlIG9uIGl0IGZvciBsYXRlciByZWZlcmVuY2UuXG4gICAqXG4gICAqIEV4YW1wbGU6XG4gICAqIGBgYFxuICAgKiA8bXktY29tcCBuZ1NraXBIeWRyYXRpb24+XG4gICAqICAgU2hvdWxkIHJlZmVyZW5jZSB0aGlzIHJvb3Qgbm9kZVxuICAgKiA8L215LWNvbXA+XG4gICAqIGBgYFxuICAgKi9cbiAgc2tpcEh5ZHJhdGlvblJvb3RUTm9kZTogVE5vZGUgfCBudWxsO1xufVxuXG5jb25zdCBpbnN0cnVjdGlvblN0YXRlOiBJbnN0cnVjdGlvblN0YXRlID0ge1xuICBsRnJhbWU6IGNyZWF0ZUxGcmFtZShudWxsKSxcbiAgYmluZGluZ3NFbmFibGVkOiB0cnVlLFxuICBza2lwSHlkcmF0aW9uUm9vdFROb2RlOiBudWxsLFxufTtcblxuZXhwb3J0IGVudW0gQ2hlY2tOb0NoYW5nZXNNb2RlIHtcbiAgT2ZmLFxuICBFeGhhdXN0aXZlLFxuICBPbmx5RGlydHlWaWV3cyxcbn1cblxuLyoqXG4gKiBJbiB0aGlzIG1vZGUsIGFueSBjaGFuZ2VzIGluIGJpbmRpbmdzIHdpbGwgdGhyb3cgYW4gRXhwcmVzc2lvbkNoYW5nZWRBZnRlckNoZWNrZWQgZXJyb3IuXG4gKlxuICogTmVjZXNzYXJ5IHRvIHN1cHBvcnQgQ2hhbmdlRGV0ZWN0b3JSZWYuY2hlY2tOb0NoYW5nZXMoKS5cbiAqXG4gKiBUaGUgYGNoZWNrTm9DaGFuZ2VzYCBmdW5jdGlvbiBpcyBpbnZva2VkIG9ubHkgaW4gbmdEZXZNb2RlPXRydWUgYW5kIHZlcmlmaWVzIHRoYXQgbm8gdW5pbnRlbmRlZFxuICogY2hhbmdlcyBleGlzdCBpbiB0aGUgY2hhbmdlIGRldGVjdG9yIG9yIGl0cyBjaGlsZHJlbi5cbiAqL1xubGV0IF9jaGVja05vQ2hhbmdlc01vZGU6IENoZWNrTm9DaGFuZ2VzTW9kZSA9IDA7IC8qIENoZWNrTm9DaGFuZ2VzTW9kZS5PZmYgKi9cblxuLyoqXG4gKiBGbGFnIHVzZWQgdG8gaW5kaWNhdGUgdGhhdCB3ZSBhcmUgaW4gdGhlIG1pZGRsZSBydW5uaW5nIGNoYW5nZSBkZXRlY3Rpb24gb24gYSB2aWV3XG4gKlxuICogQHNlZSBkZXRlY3RDaGFuZ2VzSW5WaWV3V2hpbGVEaXJ0eVxuICovXG5sZXQgX2lzUmVmcmVzaGluZ1ZpZXdzID0gZmFsc2U7XG5cbi8qKlxuICogUmV0dXJucyB0cnVlIGlmIHRoZSBpbnN0cnVjdGlvbiBzdGF0ZSBzdGFjayBpcyBlbXB0eS5cbiAqXG4gKiBJbnRlbmRlZCB0byBiZSBjYWxsZWQgZnJvbSB0ZXN0cyBvbmx5ICh0cmVlIHNoYWtlbiBvdGhlcndpc2UpLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc3BlY09ubHlJc0luc3RydWN0aW9uU3RhdGVFbXB0eSgpOiBib29sZWFuIHtcbiAgcmV0dXJuIGluc3RydWN0aW9uU3RhdGUubEZyYW1lLnBhcmVudCA9PT0gbnVsbDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEVsZW1lbnREZXB0aENvdW50KCkge1xuICByZXR1cm4gaW5zdHJ1Y3Rpb25TdGF0ZS5sRnJhbWUuZWxlbWVudERlcHRoQ291bnQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbmNyZWFzZUVsZW1lbnREZXB0aENvdW50KCkge1xuICBpbnN0cnVjdGlvblN0YXRlLmxGcmFtZS5lbGVtZW50RGVwdGhDb3VudCsrO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVjcmVhc2VFbGVtZW50RGVwdGhDb3VudCgpIHtcbiAgaW5zdHJ1Y3Rpb25TdGF0ZS5sRnJhbWUuZWxlbWVudERlcHRoQ291bnQtLTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEJpbmRpbmdzRW5hYmxlZCgpOiBib29sZWFuIHtcbiAgcmV0dXJuIGluc3RydWN0aW9uU3RhdGUuYmluZGluZ3NFbmFibGVkO1xufVxuXG4vKipcbiAqIFJldHVybnMgdHJ1ZSBpZiBjdXJyZW50bHkgaW5zaWRlIGEgc2tpcCBoeWRyYXRpb24gYmxvY2suXG4gKiBAcmV0dXJucyBib29sZWFuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0luU2tpcEh5ZHJhdGlvbkJsb2NrKCk6IGJvb2xlYW4ge1xuICByZXR1cm4gaW5zdHJ1Y3Rpb25TdGF0ZS5za2lwSHlkcmF0aW9uUm9vdFROb2RlICE9PSBudWxsO1xufVxuXG4vKipcbiAqIFJldHVybnMgdHJ1ZSBpZiB0aGlzIGlzIHRoZSByb290IFROb2RlIG9mIHRoZSBza2lwIGh5ZHJhdGlvbiBibG9jay5cbiAqIEBwYXJhbSB0Tm9kZSB0aGUgY3VycmVudCBUTm9kZVxuICogQHJldHVybnMgYm9vbGVhblxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNTa2lwSHlkcmF0aW9uUm9vdFROb2RlKHROb2RlOiBUTm9kZSk6IGJvb2xlYW4ge1xuICByZXR1cm4gaW5zdHJ1Y3Rpb25TdGF0ZS5za2lwSHlkcmF0aW9uUm9vdFROb2RlID09PSB0Tm9kZTtcbn1cblxuLyoqXG4gKiBFbmFibGVzIGRpcmVjdGl2ZSBtYXRjaGluZyBvbiBlbGVtZW50cy5cbiAqXG4gKiAgKiBFeGFtcGxlOlxuICogYGBgXG4gKiA8bXktY29tcCBteS1kaXJlY3RpdmU+XG4gKiAgIFNob3VsZCBtYXRjaCBjb21wb25lbnQgLyBkaXJlY3RpdmUuXG4gKiA8L215LWNvbXA+XG4gKiA8ZGl2IG5nTm9uQmluZGFibGU+XG4gKiAgIDwhLS0gybXJtWRpc2FibGVCaW5kaW5ncygpIC0tPlxuICogICA8bXktY29tcCBteS1kaXJlY3RpdmU+XG4gKiAgICAgU2hvdWxkIG5vdCBtYXRjaCBjb21wb25lbnQgLyBkaXJlY3RpdmUgYmVjYXVzZSB3ZSBhcmUgaW4gbmdOb25CaW5kYWJsZS5cbiAqICAgPC9teS1jb21wPlxuICogICA8IS0tIMm1ybVlbmFibGVCaW5kaW5ncygpIC0tPlxuICogPC9kaXY+XG4gKiBgYGBcbiAqXG4gKiBAY29kZUdlbkFwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gybXJtWVuYWJsZUJpbmRpbmdzKCk6IHZvaWQge1xuICBpbnN0cnVjdGlvblN0YXRlLmJpbmRpbmdzRW5hYmxlZCA9IHRydWU7XG59XG5cbi8qKlxuICogU2V0cyBhIGZsYWcgdG8gc3BlY2lmeSB0aGF0IHRoZSBUTm9kZSBpcyBpbiBhIHNraXAgaHlkcmF0aW9uIGJsb2NrLlxuICogQHBhcmFtIHROb2RlIHRoZSBjdXJyZW50IFROb2RlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlbnRlclNraXBIeWRyYXRpb25CbG9jayh0Tm9kZTogVE5vZGUpOiB2b2lkIHtcbiAgaW5zdHJ1Y3Rpb25TdGF0ZS5za2lwSHlkcmF0aW9uUm9vdFROb2RlID0gdE5vZGU7XG59XG5cbi8qKlxuICogRGlzYWJsZXMgZGlyZWN0aXZlIG1hdGNoaW5nIG9uIGVsZW1lbnQuXG4gKlxuICogICogRXhhbXBsZTpcbiAqIGBgYFxuICogPG15LWNvbXAgbXktZGlyZWN0aXZlPlxuICogICBTaG91bGQgbWF0Y2ggY29tcG9uZW50IC8gZGlyZWN0aXZlLlxuICogPC9teS1jb21wPlxuICogPGRpdiBuZ05vbkJpbmRhYmxlPlxuICogICA8IS0tIMm1ybVkaXNhYmxlQmluZGluZ3MoKSAtLT5cbiAqICAgPG15LWNvbXAgbXktZGlyZWN0aXZlPlxuICogICAgIFNob3VsZCBub3QgbWF0Y2ggY29tcG9uZW50IC8gZGlyZWN0aXZlIGJlY2F1c2Ugd2UgYXJlIGluIG5nTm9uQmluZGFibGUuXG4gKiAgIDwvbXktY29tcD5cbiAqICAgPCEtLSDJtcm1ZW5hYmxlQmluZGluZ3MoKSAtLT5cbiAqIDwvZGl2PlxuICogYGBgXG4gKlxuICogQGNvZGVHZW5BcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIMm1ybVkaXNhYmxlQmluZGluZ3MoKTogdm9pZCB7XG4gIGluc3RydWN0aW9uU3RhdGUuYmluZGluZ3NFbmFibGVkID0gZmFsc2U7XG59XG5cbi8qKlxuICogQ2xlYXJzIHRoZSByb290IHNraXAgaHlkcmF0aW9uIG5vZGUgd2hlbiBsZWF2aW5nIGEgc2tpcCBoeWRyYXRpb24gYmxvY2suXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsZWF2ZVNraXBIeWRyYXRpb25CbG9jaygpOiB2b2lkIHtcbiAgaW5zdHJ1Y3Rpb25TdGF0ZS5za2lwSHlkcmF0aW9uUm9vdFROb2RlID0gbnVsbDtcbn1cblxuLyoqXG4gKiBSZXR1cm4gdGhlIGN1cnJlbnQgYExWaWV3YC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldExWaWV3PFQ+KCk6IExWaWV3PFQ+IHtcbiAgcmV0dXJuIGluc3RydWN0aW9uU3RhdGUubEZyYW1lLmxWaWV3IGFzIExWaWV3PFQ+O1xufVxuXG4vKipcbiAqIFJldHVybiB0aGUgY3VycmVudCBgVFZpZXdgLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0VFZpZXcoKTogVFZpZXcge1xuICByZXR1cm4gaW5zdHJ1Y3Rpb25TdGF0ZS5sRnJhbWUudFZpZXc7XG59XG5cbi8qKlxuICogUmVzdG9yZXMgYGNvbnRleHRWaWV3RGF0YWAgdG8gdGhlIGdpdmVuIE9wYXF1ZVZpZXdTdGF0ZSBpbnN0YW5jZS5cbiAqXG4gKiBVc2VkIGluIGNvbmp1bmN0aW9uIHdpdGggdGhlIGdldEN1cnJlbnRWaWV3KCkgaW5zdHJ1Y3Rpb24gdG8gc2F2ZSBhIHNuYXBzaG90XG4gKiBvZiB0aGUgY3VycmVudCB2aWV3IGFuZCByZXN0b3JlIGl0IHdoZW4gbGlzdGVuZXJzIGFyZSBpbnZva2VkLiBUaGlzIGFsbG93c1xuICogd2Fsa2luZyB0aGUgZGVjbGFyYXRpb24gdmlldyB0cmVlIGluIGxpc3RlbmVycyB0byBnZXQgdmFycyBmcm9tIHBhcmVudCB2aWV3cy5cbiAqXG4gKiBAcGFyYW0gdmlld1RvUmVzdG9yZSBUaGUgT3BhcXVlVmlld1N0YXRlIGluc3RhbmNlIHRvIHJlc3RvcmUuXG4gKiBAcmV0dXJucyBDb250ZXh0IG9mIHRoZSByZXN0b3JlZCBPcGFxdWVWaWV3U3RhdGUgaW5zdGFuY2UuXG4gKlxuICogQGNvZGVHZW5BcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIMm1ybVyZXN0b3JlVmlldzxUID0gYW55Pih2aWV3VG9SZXN0b3JlOiBPcGFxdWVWaWV3U3RhdGUpOiBUIHtcbiAgaW5zdHJ1Y3Rpb25TdGF0ZS5sRnJhbWUuY29udGV4dExWaWV3ID0gdmlld1RvUmVzdG9yZSBhcyBhbnkgYXMgTFZpZXc7XG4gIHJldHVybiAodmlld1RvUmVzdG9yZSBhcyBhbnkgYXMgTFZpZXcpW0NPTlRFWFRdIGFzIHVua25vd24gYXMgVDtcbn1cblxuLyoqXG4gKiBDbGVhcnMgdGhlIHZpZXcgc2V0IGluIGDJtcm1cmVzdG9yZVZpZXdgIGZyb20gbWVtb3J5LiBSZXR1cm5zIHRoZSBwYXNzZWQgaW5cbiAqIHZhbHVlIHNvIHRoYXQgaXQgY2FuIGJlIHVzZWQgYXMgYSByZXR1cm4gdmFsdWUgb2YgYW4gaW5zdHJ1Y3Rpb24uXG4gKlxuICogQGNvZGVHZW5BcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIMm1ybVyZXNldFZpZXc8VD4odmFsdWU/OiBUKTogVCB8IHVuZGVmaW5lZCB7XG4gIGluc3RydWN0aW9uU3RhdGUubEZyYW1lLmNvbnRleHRMVmlldyA9IG51bGw7XG4gIHJldHVybiB2YWx1ZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEN1cnJlbnRUTm9kZSgpOiBUTm9kZSB8IG51bGwge1xuICBsZXQgY3VycmVudFROb2RlID0gZ2V0Q3VycmVudFROb2RlUGxhY2Vob2xkZXJPaygpO1xuICB3aGlsZSAoY3VycmVudFROb2RlICE9PSBudWxsICYmIGN1cnJlbnRUTm9kZS50eXBlID09PSBUTm9kZVR5cGUuUGxhY2Vob2xkZXIpIHtcbiAgICBjdXJyZW50VE5vZGUgPSBjdXJyZW50VE5vZGUucGFyZW50O1xuICB9XG4gIHJldHVybiBjdXJyZW50VE5vZGU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRDdXJyZW50VE5vZGVQbGFjZWhvbGRlck9rKCk6IFROb2RlIHwgbnVsbCB7XG4gIHJldHVybiBpbnN0cnVjdGlvblN0YXRlLmxGcmFtZS5jdXJyZW50VE5vZGU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRDdXJyZW50UGFyZW50VE5vZGUoKTogVE5vZGUgfCBudWxsIHtcbiAgY29uc3QgbEZyYW1lID0gaW5zdHJ1Y3Rpb25TdGF0ZS5sRnJhbWU7XG4gIGNvbnN0IGN1cnJlbnRUTm9kZSA9IGxGcmFtZS5jdXJyZW50VE5vZGU7XG4gIHJldHVybiBsRnJhbWUuaXNQYXJlbnQgPyBjdXJyZW50VE5vZGUgOiBjdXJyZW50VE5vZGUhLnBhcmVudDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldEN1cnJlbnRUTm9kZSh0Tm9kZTogVE5vZGUgfCBudWxsLCBpc1BhcmVudDogYm9vbGVhbikge1xuICBuZ0Rldk1vZGUgJiYgdE5vZGUgJiYgYXNzZXJ0VE5vZGVGb3JUVmlldyh0Tm9kZSwgaW5zdHJ1Y3Rpb25TdGF0ZS5sRnJhbWUudFZpZXcpO1xuICBjb25zdCBsRnJhbWUgPSBpbnN0cnVjdGlvblN0YXRlLmxGcmFtZTtcbiAgbEZyYW1lLmN1cnJlbnRUTm9kZSA9IHROb2RlO1xuICBsRnJhbWUuaXNQYXJlbnQgPSBpc1BhcmVudDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzQ3VycmVudFROb2RlUGFyZW50KCk6IGJvb2xlYW4ge1xuICByZXR1cm4gaW5zdHJ1Y3Rpb25TdGF0ZS5sRnJhbWUuaXNQYXJlbnQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRDdXJyZW50VE5vZGVBc05vdFBhcmVudCgpOiB2b2lkIHtcbiAgaW5zdHJ1Y3Rpb25TdGF0ZS5sRnJhbWUuaXNQYXJlbnQgPSBmYWxzZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldENvbnRleHRMVmlldygpOiBMVmlldyB7XG4gIGNvbnN0IGNvbnRleHRMVmlldyA9IGluc3RydWN0aW9uU3RhdGUubEZyYW1lLmNvbnRleHRMVmlldztcbiAgbmdEZXZNb2RlICYmIGFzc2VydERlZmluZWQoY29udGV4dExWaWV3LCAnY29udGV4dExWaWV3IG11c3QgYmUgZGVmaW5lZC4nKTtcbiAgcmV0dXJuIGNvbnRleHRMVmlldyE7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0luQ2hlY2tOb0NoYW5nZXNNb2RlKCk6IGJvb2xlYW4ge1xuICAhbmdEZXZNb2RlICYmIHRocm93RXJyb3IoJ011c3QgbmV2ZXIgYmUgY2FsbGVkIGluIHByb2R1Y3Rpb24gbW9kZScpO1xuICByZXR1cm4gX2NoZWNrTm9DaGFuZ2VzTW9kZSAhPT0gQ2hlY2tOb0NoYW5nZXNNb2RlLk9mZjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRXhoYXVzdGl2ZUNoZWNrTm9DaGFuZ2VzKCk6IGJvb2xlYW4ge1xuICAhbmdEZXZNb2RlICYmIHRocm93RXJyb3IoJ011c3QgbmV2ZXIgYmUgY2FsbGVkIGluIHByb2R1Y3Rpb24gbW9kZScpO1xuICByZXR1cm4gX2NoZWNrTm9DaGFuZ2VzTW9kZSA9PT0gQ2hlY2tOb0NoYW5nZXNNb2RlLkV4aGF1c3RpdmU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRJc0luQ2hlY2tOb0NoYW5nZXNNb2RlKG1vZGU6IENoZWNrTm9DaGFuZ2VzTW9kZSk6IHZvaWQge1xuICAhbmdEZXZNb2RlICYmIHRocm93RXJyb3IoJ011c3QgbmV2ZXIgYmUgY2FsbGVkIGluIHByb2R1Y3Rpb24gbW9kZScpO1xuICBfY2hlY2tOb0NoYW5nZXNNb2RlID0gbW9kZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzUmVmcmVzaGluZ1ZpZXdzKCk6IGJvb2xlYW4ge1xuICByZXR1cm4gX2lzUmVmcmVzaGluZ1ZpZXdzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0SXNSZWZyZXNoaW5nVmlld3MobW9kZTogYm9vbGVhbik6IHZvaWQge1xuICBfaXNSZWZyZXNoaW5nVmlld3MgPSBtb2RlO1xufVxuXG4vLyB0b3AgbGV2ZWwgdmFyaWFibGVzIHNob3VsZCBub3QgYmUgZXhwb3J0ZWQgZm9yIHBlcmZvcm1hbmNlIHJlYXNvbnMgKFBFUkZfTk9URVMubWQpXG5leHBvcnQgZnVuY3Rpb24gZ2V0QmluZGluZ1Jvb3QoKSB7XG4gIGNvbnN0IGxGcmFtZSA9IGluc3RydWN0aW9uU3RhdGUubEZyYW1lO1xuICBsZXQgaW5kZXggPSBsRnJhbWUuYmluZGluZ1Jvb3RJbmRleDtcbiAgaWYgKGluZGV4ID09PSAtMSkge1xuICAgIGluZGV4ID0gbEZyYW1lLmJpbmRpbmdSb290SW5kZXggPSBsRnJhbWUudFZpZXcuYmluZGluZ1N0YXJ0SW5kZXg7XG4gIH1cbiAgcmV0dXJuIGluZGV4O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0QmluZGluZ0luZGV4KCk6IG51bWJlciB7XG4gIHJldHVybiBpbnN0cnVjdGlvblN0YXRlLmxGcmFtZS5iaW5kaW5nSW5kZXg7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRCaW5kaW5nSW5kZXgodmFsdWU6IG51bWJlcik6IG51bWJlciB7XG4gIHJldHVybiAoaW5zdHJ1Y3Rpb25TdGF0ZS5sRnJhbWUuYmluZGluZ0luZGV4ID0gdmFsdWUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbmV4dEJpbmRpbmdJbmRleCgpOiBudW1iZXIge1xuICByZXR1cm4gaW5zdHJ1Y3Rpb25TdGF0ZS5sRnJhbWUuYmluZGluZ0luZGV4Kys7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbmNyZW1lbnRCaW5kaW5nSW5kZXgoY291bnQ6IG51bWJlcik6IG51bWJlciB7XG4gIGNvbnN0IGxGcmFtZSA9IGluc3RydWN0aW9uU3RhdGUubEZyYW1lO1xuICBjb25zdCBpbmRleCA9IGxGcmFtZS5iaW5kaW5nSW5kZXg7XG4gIGxGcmFtZS5iaW5kaW5nSW5kZXggPSBsRnJhbWUuYmluZGluZ0luZGV4ICsgY291bnQ7XG4gIHJldHVybiBpbmRleDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzSW5JMThuQmxvY2soKSB7XG4gIHJldHVybiBpbnN0cnVjdGlvblN0YXRlLmxGcmFtZS5pbkkxOG47XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRJbkkxOG5CbG9jayhpc0luSTE4bkJsb2NrOiBib29sZWFuKTogdm9pZCB7XG4gIGluc3RydWN0aW9uU3RhdGUubEZyYW1lLmluSTE4biA9IGlzSW5JMThuQmxvY2s7XG59XG5cbi8qKlxuICogU2V0IGEgbmV3IGJpbmRpbmcgcm9vdCBpbmRleCBzbyB0aGF0IGhvc3QgdGVtcGxhdGUgZnVuY3Rpb25zIGNhbiBleGVjdXRlLlxuICpcbiAqIEJpbmRpbmdzIGluc2lkZSB0aGUgaG9zdCB0ZW1wbGF0ZSBhcmUgMCBpbmRleC4gQnV0IGJlY2F1c2Ugd2UgZG9uJ3Qga25vdyBhaGVhZCBvZiB0aW1lXG4gKiBob3cgbWFueSBob3N0IGJpbmRpbmdzIHdlIGhhdmUgd2UgY2FuJ3QgcHJlLWNvbXB1dGUgdGhlbS4gRm9yIHRoaXMgcmVhc29uIHRoZXkgYXJlIGFsbFxuICogMCBpbmRleCBhbmQgd2UganVzdCBzaGlmdCB0aGUgcm9vdCBzbyB0aGF0IHRoZXkgbWF0Y2ggbmV4dCBhdmFpbGFibGUgbG9jYXRpb24gaW4gdGhlIExWaWV3LlxuICpcbiAqIEBwYXJhbSBiaW5kaW5nUm9vdEluZGV4IFJvb3QgaW5kZXggZm9yIGBob3N0QmluZGluZ3NgXG4gKiBAcGFyYW0gY3VycmVudERpcmVjdGl2ZUluZGV4IGBURGF0YVtjdXJyZW50RGlyZWN0aXZlSW5kZXhdYCB3aWxsIHBvaW50IHRvIHRoZSBjdXJyZW50IGRpcmVjdGl2ZVxuICogICAgICAgIHdob3NlIGBob3N0QmluZGluZ3NgIGFyZSBiZWluZyBwcm9jZXNzZWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXRCaW5kaW5nUm9vdEZvckhvc3RCaW5kaW5ncyhcbiAgYmluZGluZ1Jvb3RJbmRleDogbnVtYmVyLFxuICBjdXJyZW50RGlyZWN0aXZlSW5kZXg6IG51bWJlcixcbikge1xuICBjb25zdCBsRnJhbWUgPSBpbnN0cnVjdGlvblN0YXRlLmxGcmFtZTtcbiAgbEZyYW1lLmJpbmRpbmdJbmRleCA9IGxGcmFtZS5iaW5kaW5nUm9vdEluZGV4ID0gYmluZGluZ1Jvb3RJbmRleDtcbiAgc2V0Q3VycmVudERpcmVjdGl2ZUluZGV4KGN1cnJlbnREaXJlY3RpdmVJbmRleCk7XG59XG5cbi8qKlxuICogV2hlbiBob3N0IGJpbmRpbmcgaXMgZXhlY3V0aW5nIHRoaXMgcG9pbnRzIHRvIHRoZSBkaXJlY3RpdmUgaW5kZXguXG4gKiBgVFZpZXcuZGF0YVtnZXRDdXJyZW50RGlyZWN0aXZlSW5kZXgoKV1gIGlzIGBEaXJlY3RpdmVEZWZgXG4gKiBgTFZpZXdbZ2V0Q3VycmVudERpcmVjdGl2ZUluZGV4KCldYCBpcyBkaXJlY3RpdmUgaW5zdGFuY2UuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRDdXJyZW50RGlyZWN0aXZlSW5kZXgoKTogbnVtYmVyIHtcbiAgcmV0dXJuIGluc3RydWN0aW9uU3RhdGUubEZyYW1lLmN1cnJlbnREaXJlY3RpdmVJbmRleDtcbn1cblxuLyoqXG4gKiBTZXRzIGFuIGluZGV4IG9mIGEgZGlyZWN0aXZlIHdob3NlIGBob3N0QmluZGluZ3NgIGFyZSBiZWluZyBwcm9jZXNzZWQuXG4gKlxuICogQHBhcmFtIGN1cnJlbnREaXJlY3RpdmVJbmRleCBgVERhdGFgIGluZGV4IHdoZXJlIGN1cnJlbnQgZGlyZWN0aXZlIGluc3RhbmNlIGNhbiBiZSBmb3VuZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldEN1cnJlbnREaXJlY3RpdmVJbmRleChjdXJyZW50RGlyZWN0aXZlSW5kZXg6IG51bWJlcik6IHZvaWQge1xuICBpbnN0cnVjdGlvblN0YXRlLmxGcmFtZS5jdXJyZW50RGlyZWN0aXZlSW5kZXggPSBjdXJyZW50RGlyZWN0aXZlSW5kZXg7XG59XG5cbi8qKlxuICogUmV0cmlldmUgdGhlIGN1cnJlbnQgYERpcmVjdGl2ZURlZmAgd2hpY2ggaXMgYWN0aXZlIHdoZW4gYGhvc3RCaW5kaW5nc2AgaW5zdHJ1Y3Rpb24gaXMgYmVpbmdcbiAqIGV4ZWN1dGVkLlxuICpcbiAqIEBwYXJhbSB0RGF0YSBDdXJyZW50IGBURGF0YWAgd2hlcmUgdGhlIGBEaXJlY3RpdmVEZWZgIHdpbGwgYmUgbG9va2VkIHVwIGF0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q3VycmVudERpcmVjdGl2ZURlZih0RGF0YTogVERhdGEpOiBEaXJlY3RpdmVEZWY8YW55PiB8IG51bGwge1xuICBjb25zdCBjdXJyZW50RGlyZWN0aXZlSW5kZXggPSBpbnN0cnVjdGlvblN0YXRlLmxGcmFtZS5jdXJyZW50RGlyZWN0aXZlSW5kZXg7XG4gIHJldHVybiBjdXJyZW50RGlyZWN0aXZlSW5kZXggPT09IC0xID8gbnVsbCA6ICh0RGF0YVtjdXJyZW50RGlyZWN0aXZlSW5kZXhdIGFzIERpcmVjdGl2ZURlZjxhbnk+KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEN1cnJlbnRRdWVyeUluZGV4KCk6IG51bWJlciB7XG4gIHJldHVybiBpbnN0cnVjdGlvblN0YXRlLmxGcmFtZS5jdXJyZW50UXVlcnlJbmRleDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldEN1cnJlbnRRdWVyeUluZGV4KHZhbHVlOiBudW1iZXIpOiB2b2lkIHtcbiAgaW5zdHJ1Y3Rpb25TdGF0ZS5sRnJhbWUuY3VycmVudFF1ZXJ5SW5kZXggPSB2YWx1ZTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEgYFROb2RlYCBvZiB0aGUgbG9jYXRpb24gd2hlcmUgdGhlIGN1cnJlbnQgYExWaWV3YCBpcyBkZWNsYXJlZCBhdC5cbiAqXG4gKiBAcGFyYW0gbFZpZXcgYW4gYExWaWV3YCB0aGF0IHdlIHdhbnQgdG8gZmluZCBwYXJlbnQgYFROb2RlYCBmb3IuXG4gKi9cbmZ1bmN0aW9uIGdldERlY2xhcmF0aW9uVE5vZGUobFZpZXc6IExWaWV3KTogVE5vZGUgfCBudWxsIHtcbiAgY29uc3QgdFZpZXcgPSBsVmlld1tUVklFV107XG5cbiAgLy8gUmV0dXJuIHRoZSBkZWNsYXJhdGlvbiBwYXJlbnQgZm9yIGVtYmVkZGVkIHZpZXdzXG4gIGlmICh0Vmlldy50eXBlID09PSBUVmlld1R5cGUuRW1iZWRkZWQpIHtcbiAgICBuZ0Rldk1vZGUgJiYgYXNzZXJ0RGVmaW5lZCh0Vmlldy5kZWNsVE5vZGUsICdFbWJlZGRlZCBUTm9kZXMgc2hvdWxkIGhhdmUgZGVjbGFyYXRpb24gcGFyZW50cy4nKTtcbiAgICByZXR1cm4gdFZpZXcuZGVjbFROb2RlO1xuICB9XG5cbiAgLy8gQ29tcG9uZW50cyBkb24ndCBoYXZlIGBUVmlldy5kZWNsVE5vZGVgIGJlY2F1c2UgZWFjaCBpbnN0YW5jZSBvZiBjb21wb25lbnQgY291bGQgYmVcbiAgLy8gaW5zZXJ0ZWQgaW4gZGlmZmVyZW50IGxvY2F0aW9uLCBoZW5jZSBgVFZpZXcuZGVjbFROb2RlYCBpcyBtZWFuaW5nbGVzcy5cbiAgLy8gRmFsbGluZyBiYWNrIHRvIGBUX0hPU1RgIGluIGNhc2Ugd2UgY3Jvc3MgY29tcG9uZW50IGJvdW5kYXJ5LlxuICBpZiAodFZpZXcudHlwZSA9PT0gVFZpZXdUeXBlLkNvbXBvbmVudCkge1xuICAgIHJldHVybiBsVmlld1tUX0hPU1RdO1xuICB9XG5cbiAgLy8gUmVtYWluaW5nIFROb2RlIHR5cGUgaXMgYFRWaWV3VHlwZS5Sb290YCB3aGljaCBkb2Vzbid0IGhhdmUgYSBwYXJlbnQgVE5vZGUuXG4gIHJldHVybiBudWxsO1xufVxuXG4vKipcbiAqIFRoaXMgaXMgYSBsaWdodCB3ZWlnaHQgdmVyc2lvbiBvZiB0aGUgYGVudGVyVmlld2Agd2hpY2ggaXMgbmVlZGVkIGJ5IHRoZSBESSBzeXN0ZW0uXG4gKlxuICogQHBhcmFtIGxWaWV3IGBMVmlld2AgbG9jYXRpb24gb2YgdGhlIERJIGNvbnRleHQuXG4gKiBAcGFyYW0gdE5vZGUgYFROb2RlYCBmb3IgREkgY29udGV4dFxuICogQHBhcmFtIGZsYWdzIERJIGNvbnRleHQgZmxhZ3MuIGlmIGBTa2lwU2VsZmAgZmxhZyBpcyBzZXQgdGhhbiB3ZSB3YWxrIHVwIHRoZSBkZWNsYXJhdGlvblxuICogICAgIHRyZWUgZnJvbSBgdE5vZGVgICB1bnRpbCB3ZSBmaW5kIHBhcmVudCBkZWNsYXJlZCBgVEVsZW1lbnROb2RlYC5cbiAqIEByZXR1cm5zIGB0cnVlYCBpZiB3ZSBoYXZlIHN1Y2Nlc3NmdWxseSBlbnRlcmVkIERJIGFzc29jaWF0ZWQgd2l0aCBgdE5vZGVgIChvciB3aXRoIGRlY2xhcmVkXG4gKiAgICAgYFROb2RlYCBpZiBgZmxhZ3NgIGhhcyAgYFNraXBTZWxmYCkuIEZhaWxpbmcgdG8gZW50ZXIgREkgaW1wbGllcyB0aGF0IG5vIGFzc29jaWF0ZWRcbiAqICAgICBgTm9kZUluamVjdG9yYCBjYW4gYmUgZm91bmQgYW5kIHdlIHNob3VsZCBpbnN0ZWFkIHVzZSBgTW9kdWxlSW5qZWN0b3JgLlxuICogICAgIC0gSWYgYHRydWVgIHRoYW4gdGhpcyBjYWxsIG11c3QgYmUgZmFsbG93ZWQgYnkgYGxlYXZlRElgXG4gKiAgICAgLSBJZiBgZmFsc2VgIHRoYW4gdGhpcyBjYWxsIGZhaWxlZCBhbmQgd2Ugc2hvdWxkIE5PVCBjYWxsIGBsZWF2ZURJYFxuICovXG5leHBvcnQgZnVuY3Rpb24gZW50ZXJESShsVmlldzogTFZpZXcsIHROb2RlOiBUTm9kZSwgZmxhZ3M6IEluamVjdEZsYWdzKSB7XG4gIG5nRGV2TW9kZSAmJiBhc3NlcnRMVmlld09yVW5kZWZpbmVkKGxWaWV3KTtcblxuICBpZiAoZmxhZ3MgJiBJbmplY3RGbGFncy5Ta2lwU2VsZikge1xuICAgIG5nRGV2TW9kZSAmJiBhc3NlcnRUTm9kZUZvclRWaWV3KHROb2RlLCBsVmlld1tUVklFV10pO1xuXG4gICAgbGV0IHBhcmVudFROb2RlID0gdE5vZGUgYXMgVE5vZGUgfCBudWxsO1xuICAgIGxldCBwYXJlbnRMVmlldyA9IGxWaWV3O1xuXG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgIG5nRGV2TW9kZSAmJiBhc3NlcnREZWZpbmVkKHBhcmVudFROb2RlLCAnUGFyZW50IFROb2RlIHNob3VsZCBiZSBkZWZpbmVkJyk7XG4gICAgICBwYXJlbnRUTm9kZSA9IHBhcmVudFROb2RlIS5wYXJlbnQgYXMgVE5vZGUgfCBudWxsO1xuICAgICAgaWYgKHBhcmVudFROb2RlID09PSBudWxsICYmICEoZmxhZ3MgJiBJbmplY3RGbGFncy5Ib3N0KSkge1xuICAgICAgICBwYXJlbnRUTm9kZSA9IGdldERlY2xhcmF0aW9uVE5vZGUocGFyZW50TFZpZXcpO1xuICAgICAgICBpZiAocGFyZW50VE5vZGUgPT09IG51bGwpIGJyZWFrO1xuXG4gICAgICAgIC8vIEluIHRoaXMgY2FzZSwgYSBwYXJlbnQgZXhpc3RzIGFuZCBpcyBkZWZpbml0ZWx5IGFuIGVsZW1lbnQuIFNvIGl0IHdpbGwgZGVmaW5pdGVseVxuICAgICAgICAvLyBoYXZlIGFuIGV4aXN0aW5nIGxWaWV3IGFzIHRoZSBkZWNsYXJhdGlvbiB2aWV3LCB3aGljaCBpcyB3aHkgd2UgY2FuIGFzc3VtZSBpdCdzIGRlZmluZWQuXG4gICAgICAgIG5nRGV2TW9kZSAmJiBhc3NlcnREZWZpbmVkKHBhcmVudExWaWV3LCAnUGFyZW50IExWaWV3IHNob3VsZCBiZSBkZWZpbmVkJyk7XG4gICAgICAgIHBhcmVudExWaWV3ID0gcGFyZW50TFZpZXdbREVDTEFSQVRJT05fVklFV10hO1xuXG4gICAgICAgIC8vIEluIEl2eSB0aGVyZSBhcmUgQ29tbWVudCBub2RlcyB0aGF0IGNvcnJlc3BvbmQgdG8gbmdJZiBhbmQgTmdGb3IgZW1iZWRkZWQgZGlyZWN0aXZlc1xuICAgICAgICAvLyBXZSB3YW50IHRvIHNraXAgdGhvc2UgYW5kIGxvb2sgb25seSBhdCBFbGVtZW50cyBhbmQgRWxlbWVudENvbnRhaW5lcnMgdG8gZW5zdXJlXG4gICAgICAgIC8vIHdlJ3JlIGxvb2tpbmcgYXQgdHJ1ZSBwYXJlbnQgbm9kZXMsIGFuZCBub3QgY29udGVudCBvciBvdGhlciB0eXBlcy5cbiAgICAgICAgaWYgKHBhcmVudFROb2RlLnR5cGUgJiAoVE5vZGVUeXBlLkVsZW1lbnQgfCBUTm9kZVR5cGUuRWxlbWVudENvbnRhaW5lcikpIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChwYXJlbnRUTm9kZSA9PT0gbnVsbCkge1xuICAgICAgLy8gSWYgd2UgZmFpbGVkIHRvIGZpbmQgYSBwYXJlbnQgVE5vZGUgdGhpcyBtZWFucyB0aGF0IHdlIHNob3VsZCB1c2UgbW9kdWxlIGluamVjdG9yLlxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0gZWxzZSB7XG4gICAgICB0Tm9kZSA9IHBhcmVudFROb2RlO1xuICAgICAgbFZpZXcgPSBwYXJlbnRMVmlldztcbiAgICB9XG4gIH1cblxuICBuZ0Rldk1vZGUgJiYgYXNzZXJ0VE5vZGVGb3JMVmlldyh0Tm9kZSwgbFZpZXcpO1xuICBjb25zdCBsRnJhbWUgPSAoaW5zdHJ1Y3Rpb25TdGF0ZS5sRnJhbWUgPSBhbGxvY0xGcmFtZSgpKTtcbiAgbEZyYW1lLmN1cnJlbnRUTm9kZSA9IHROb2RlO1xuICBsRnJhbWUubFZpZXcgPSBsVmlldztcblxuICByZXR1cm4gdHJ1ZTtcbn1cblxuLyoqXG4gKiBTd2FwIHRoZSBjdXJyZW50IGxWaWV3IHdpdGggYSBuZXcgbFZpZXcuXG4gKlxuICogRm9yIHBlcmZvcm1hbmNlIHJlYXNvbnMgd2Ugc3RvcmUgdGhlIGxWaWV3IGluIHRoZSB0b3AgbGV2ZWwgb2YgdGhlIG1vZHVsZS5cbiAqIFRoaXMgd2F5IHdlIG1pbmltaXplIHRoZSBudW1iZXIgb2YgcHJvcGVydGllcyB0byByZWFkLiBXaGVuZXZlciBhIG5ldyB2aWV3XG4gKiBpcyBlbnRlcmVkIHdlIGhhdmUgdG8gc3RvcmUgdGhlIGxWaWV3IGZvciBsYXRlciwgYW5kIHdoZW4gdGhlIHZpZXcgaXNcbiAqIGV4aXRlZCB0aGUgc3RhdGUgaGFzIHRvIGJlIHJlc3RvcmVkXG4gKlxuICogQHBhcmFtIG5ld1ZpZXcgTmV3IGxWaWV3IHRvIGJlY29tZSBhY3RpdmVcbiAqIEByZXR1cm5zIHRoZSBwcmV2aW91c2x5IGFjdGl2ZSBsVmlldztcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVudGVyVmlldyhuZXdWaWV3OiBMVmlldyk6IHZvaWQge1xuICBuZ0Rldk1vZGUgJiYgYXNzZXJ0Tm90RXF1YWwobmV3Vmlld1swXSwgbmV3Vmlld1sxXSBhcyBhbnksICc/Pz8/Jyk7XG4gIG5nRGV2TW9kZSAmJiBhc3NlcnRMVmlld09yVW5kZWZpbmVkKG5ld1ZpZXcpO1xuICBjb25zdCBuZXdMRnJhbWUgPSBhbGxvY0xGcmFtZSgpO1xuICBpZiAobmdEZXZNb2RlKSB7XG4gICAgYXNzZXJ0RXF1YWwobmV3TEZyYW1lLmlzUGFyZW50LCB0cnVlLCAnRXhwZWN0ZWQgY2xlYW4gTEZyYW1lJyk7XG4gICAgYXNzZXJ0RXF1YWwobmV3TEZyYW1lLmxWaWV3LCBudWxsLCAnRXhwZWN0ZWQgY2xlYW4gTEZyYW1lJyk7XG4gICAgYXNzZXJ0RXF1YWwobmV3TEZyYW1lLnRWaWV3LCBudWxsLCAnRXhwZWN0ZWQgY2xlYW4gTEZyYW1lJyk7XG4gICAgYXNzZXJ0RXF1YWwobmV3TEZyYW1lLnNlbGVjdGVkSW5kZXgsIC0xLCAnRXhwZWN0ZWQgY2xlYW4gTEZyYW1lJyk7XG4gICAgYXNzZXJ0RXF1YWwobmV3TEZyYW1lLmVsZW1lbnREZXB0aENvdW50LCAwLCAnRXhwZWN0ZWQgY2xlYW4gTEZyYW1lJyk7XG4gICAgYXNzZXJ0RXF1YWwobmV3TEZyYW1lLmN1cnJlbnREaXJlY3RpdmVJbmRleCwgLTEsICdFeHBlY3RlZCBjbGVhbiBMRnJhbWUnKTtcbiAgICBhc3NlcnRFcXVhbChuZXdMRnJhbWUuY3VycmVudE5hbWVzcGFjZSwgbnVsbCwgJ0V4cGVjdGVkIGNsZWFuIExGcmFtZScpO1xuICAgIGFzc2VydEVxdWFsKG5ld0xGcmFtZS5iaW5kaW5nUm9vdEluZGV4LCAtMSwgJ0V4cGVjdGVkIGNsZWFuIExGcmFtZScpO1xuICAgIGFzc2VydEVxdWFsKG5ld0xGcmFtZS5jdXJyZW50UXVlcnlJbmRleCwgMCwgJ0V4cGVjdGVkIGNsZWFuIExGcmFtZScpO1xuICB9XG4gIGNvbnN0IHRWaWV3ID0gbmV3Vmlld1tUVklFV107XG4gIGluc3RydWN0aW9uU3RhdGUubEZyYW1lID0gbmV3TEZyYW1lO1xuICBuZ0Rldk1vZGUgJiYgdFZpZXcuZmlyc3RDaGlsZCAmJiBhc3NlcnRUTm9kZUZvclRWaWV3KHRWaWV3LmZpcnN0Q2hpbGQsIHRWaWV3KTtcbiAgbmV3TEZyYW1lLmN1cnJlbnRUTm9kZSA9IHRWaWV3LmZpcnN0Q2hpbGQhO1xuICBuZXdMRnJhbWUubFZpZXcgPSBuZXdWaWV3O1xuICBuZXdMRnJhbWUudFZpZXcgPSB0VmlldztcbiAgbmV3TEZyYW1lLmNvbnRleHRMVmlldyA9IG5ld1ZpZXc7XG4gIG5ld0xGcmFtZS5iaW5kaW5nSW5kZXggPSB0Vmlldy5iaW5kaW5nU3RhcnRJbmRleDtcbiAgbmV3TEZyYW1lLmluSTE4biA9IGZhbHNlO1xufVxuXG4vKipcbiAqIEFsbG9jYXRlcyBuZXh0IGZyZWUgTEZyYW1lLiBUaGlzIGZ1bmN0aW9uIHRyaWVzIHRvIHJldXNlIHRoZSBgTEZyYW1lYHMgdG8gbG93ZXIgbWVtb3J5IHByZXNzdXJlLlxuICovXG5mdW5jdGlvbiBhbGxvY0xGcmFtZSgpIHtcbiAgY29uc3QgY3VycmVudExGcmFtZSA9IGluc3RydWN0aW9uU3RhdGUubEZyYW1lO1xuICBjb25zdCBjaGlsZExGcmFtZSA9IGN1cnJlbnRMRnJhbWUgPT09IG51bGwgPyBudWxsIDogY3VycmVudExGcmFtZS5jaGlsZDtcbiAgY29uc3QgbmV3TEZyYW1lID0gY2hpbGRMRnJhbWUgPT09IG51bGwgPyBjcmVhdGVMRnJhbWUoY3VycmVudExGcmFtZSkgOiBjaGlsZExGcmFtZTtcbiAgcmV0dXJuIG5ld0xGcmFtZTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlTEZyYW1lKHBhcmVudDogTEZyYW1lIHwgbnVsbCk6IExGcmFtZSB7XG4gIGNvbnN0IGxGcmFtZTogTEZyYW1lID0ge1xuICAgIGN1cnJlbnRUTm9kZTogbnVsbCxcbiAgICBpc1BhcmVudDogdHJ1ZSxcbiAgICBsVmlldzogbnVsbCEsXG4gICAgdFZpZXc6IG51bGwhLFxuICAgIHNlbGVjdGVkSW5kZXg6IC0xLFxuICAgIGNvbnRleHRMVmlldzogbnVsbCxcbiAgICBlbGVtZW50RGVwdGhDb3VudDogMCxcbiAgICBjdXJyZW50TmFtZXNwYWNlOiBudWxsLFxuICAgIGN1cnJlbnREaXJlY3RpdmVJbmRleDogLTEsXG4gICAgYmluZGluZ1Jvb3RJbmRleDogLTEsXG4gICAgYmluZGluZ0luZGV4OiAtMSxcbiAgICBjdXJyZW50UXVlcnlJbmRleDogMCxcbiAgICBwYXJlbnQ6IHBhcmVudCEsXG4gICAgY2hpbGQ6IG51bGwsXG4gICAgaW5JMThuOiBmYWxzZSxcbiAgfTtcbiAgcGFyZW50ICE9PSBudWxsICYmIChwYXJlbnQuY2hpbGQgPSBsRnJhbWUpOyAvLyBsaW5rIHRoZSBuZXcgTEZyYW1lIGZvciByZXVzZS5cbiAgcmV0dXJuIGxGcmFtZTtcbn1cblxuLyoqXG4gKiBBIGxpZ2h0d2VpZ2h0IHZlcnNpb24gb2YgbGVhdmUgd2hpY2ggaXMgdXNlZCB3aXRoIERJLlxuICpcbiAqIFRoaXMgZnVuY3Rpb24gb25seSByZXNldHMgYGN1cnJlbnRUTm9kZWAgYW5kIGBMVmlld2AgYXMgdGhvc2UgYXJlIHRoZSBvbmx5IHByb3BlcnRpZXNcbiAqIHVzZWQgd2l0aCBESSAoYGVudGVyREkoKWApLlxuICpcbiAqIE5PVEU6IFRoaXMgZnVuY3Rpb24gaXMgcmVleHBvcnRlZCBhcyBgbGVhdmVESWAuIEhvd2V2ZXIgYGxlYXZlRElgIGhhcyByZXR1cm4gdHlwZSBvZiBgdm9pZGAgd2hlcmVcbiAqIGFzIGBsZWF2ZVZpZXdMaWdodGAgaGFzIGBMRnJhbWVgLiBUaGlzIGlzIHNvIHRoYXQgYGxlYXZlVmlld0xpZ2h0YCBjYW4gYmUgdXNlZCBpbiBgbGVhdmVWaWV3YC5cbiAqL1xuZnVuY3Rpb24gbGVhdmVWaWV3TGlnaHQoKTogTEZyYW1lIHtcbiAgY29uc3Qgb2xkTEZyYW1lID0gaW5zdHJ1Y3Rpb25TdGF0ZS5sRnJhbWU7XG4gIGluc3RydWN0aW9uU3RhdGUubEZyYW1lID0gb2xkTEZyYW1lLnBhcmVudDtcbiAgb2xkTEZyYW1lLmN1cnJlbnRUTm9kZSA9IG51bGwhO1xuICBvbGRMRnJhbWUubFZpZXcgPSBudWxsITtcbiAgcmV0dXJuIG9sZExGcmFtZTtcbn1cblxuLyoqXG4gKiBUaGlzIGlzIGEgbGlnaHR3ZWlnaHQgdmVyc2lvbiBvZiB0aGUgYGxlYXZlVmlld2Agd2hpY2ggaXMgbmVlZGVkIGJ5IHRoZSBESSBzeXN0ZW0uXG4gKlxuICogTk9URTogdGhpcyBmdW5jdGlvbiBpcyBhbiBhbGlhcyBzbyB0aGF0IHdlIGNhbiBjaGFuZ2UgdGhlIHR5cGUgb2YgdGhlIGZ1bmN0aW9uIHRvIGhhdmUgYHZvaWRgXG4gKiByZXR1cm4gdHlwZS5cbiAqL1xuZXhwb3J0IGNvbnN0IGxlYXZlREk6ICgpID0+IHZvaWQgPSBsZWF2ZVZpZXdMaWdodDtcblxuLyoqXG4gKiBMZWF2ZSB0aGUgY3VycmVudCBgTFZpZXdgXG4gKlxuICogVGhpcyBwb3BzIHRoZSBgTEZyYW1lYCB3aXRoIHRoZSBhc3NvY2lhdGVkIGBMVmlld2AgZnJvbSB0aGUgc3RhY2suXG4gKlxuICogSU1QT1JUQU5UOiBXZSBtdXN0IHplcm8gb3V0IHRoZSBgTEZyYW1lYCB2YWx1ZXMgaGVyZSBvdGhlcndpc2UgdGhleSB3aWxsIGJlIHJldGFpbmVkLiBUaGlzIGlzXG4gKiBiZWNhdXNlIGZvciBwZXJmb3JtYW5jZSByZWFzb25zIHdlIGRvbid0IHJlbGVhc2UgYExGcmFtZWAgYnV0IHJhdGhlciBrZWVwIGl0IGZvciBuZXh0IHVzZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxlYXZlVmlldygpIHtcbiAgY29uc3Qgb2xkTEZyYW1lID0gbGVhdmVWaWV3TGlnaHQoKTtcbiAgb2xkTEZyYW1lLmlzUGFyZW50ID0gdHJ1ZTtcbiAgb2xkTEZyYW1lLnRWaWV3ID0gbnVsbCE7XG4gIG9sZExGcmFtZS5zZWxlY3RlZEluZGV4ID0gLTE7XG4gIG9sZExGcmFtZS5jb250ZXh0TFZpZXcgPSBudWxsO1xuICBvbGRMRnJhbWUuZWxlbWVudERlcHRoQ291bnQgPSAwO1xuICBvbGRMRnJhbWUuY3VycmVudERpcmVjdGl2ZUluZGV4ID0gLTE7XG4gIG9sZExGcmFtZS5jdXJyZW50TmFtZXNwYWNlID0gbnVsbDtcbiAgb2xkTEZyYW1lLmJpbmRpbmdSb290SW5kZXggPSAtMTtcbiAgb2xkTEZyYW1lLmJpbmRpbmdJbmRleCA9IC0xO1xuICBvbGRMRnJhbWUuY3VycmVudFF1ZXJ5SW5kZXggPSAwO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbmV4dENvbnRleHRJbXBsPFQgPSBhbnk+KGxldmVsOiBudW1iZXIpOiBUIHtcbiAgY29uc3QgY29udGV4dExWaWV3ID0gKGluc3RydWN0aW9uU3RhdGUubEZyYW1lLmNvbnRleHRMVmlldyA9IHdhbGtVcFZpZXdzKFxuICAgIGxldmVsLFxuICAgIGluc3RydWN0aW9uU3RhdGUubEZyYW1lLmNvbnRleHRMVmlldyEsXG4gICkpO1xuICByZXR1cm4gY29udGV4dExWaWV3W0NPTlRFWFRdIGFzIHVua25vd24gYXMgVDtcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgZWxlbWVudCBpbmRleC5cbiAqXG4gKiBVc2VkIHdpdGgge0BsaW5rIHByb3BlcnR5fSBpbnN0cnVjdGlvbiAoYW5kIG1vcmUgaW4gdGhlIGZ1dHVyZSkgdG8gaWRlbnRpZnkgdGhlIGluZGV4IGluIHRoZVxuICogY3VycmVudCBgTFZpZXdgIHRvIGFjdCBvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFNlbGVjdGVkSW5kZXgoKSB7XG4gIHJldHVybiBpbnN0cnVjdGlvblN0YXRlLmxGcmFtZS5zZWxlY3RlZEluZGV4O1xufVxuXG4vKipcbiAqIFNldHMgdGhlIG1vc3QgcmVjZW50IGluZGV4IHBhc3NlZCB0byB7QGxpbmsgc2VsZWN0fVxuICpcbiAqIFVzZWQgd2l0aCB7QGxpbmsgcHJvcGVydHl9IGluc3RydWN0aW9uIChhbmQgbW9yZSBpbiB0aGUgZnV0dXJlKSB0byBpZGVudGlmeSB0aGUgaW5kZXggaW4gdGhlXG4gKiBjdXJyZW50IGBMVmlld2AgdG8gYWN0IG9uLlxuICpcbiAqIChOb3RlIHRoYXQgaWYgYW4gXCJleGl0IGZ1bmN0aW9uXCIgd2FzIHNldCBlYXJsaWVyICh2aWEgYHNldEVsZW1lbnRFeGl0Rm4oKWApIHRoZW4gdGhhdCB3aWxsIGJlXG4gKiBydW4gaWYgYW5kIHdoZW4gdGhlIHByb3ZpZGVkIGBpbmRleGAgdmFsdWUgaXMgZGlmZmVyZW50IGZyb20gdGhlIGN1cnJlbnQgc2VsZWN0ZWQgaW5kZXggdmFsdWUuKVxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0U2VsZWN0ZWRJbmRleChpbmRleDogbnVtYmVyKSB7XG4gIG5nRGV2TW9kZSAmJlxuICAgIGluZGV4ICE9PSAtMSAmJlxuICAgIGFzc2VydEdyZWF0ZXJUaGFuT3JFcXVhbChpbmRleCwgSEVBREVSX09GRlNFVCwgJ0luZGV4IG11c3QgYmUgcGFzdCBIRUFERVJfT0ZGU0VUIChvciAtMSkuJyk7XG4gIG5nRGV2TW9kZSAmJlxuICAgIGFzc2VydExlc3NUaGFuKFxuICAgICAgaW5kZXgsXG4gICAgICBpbnN0cnVjdGlvblN0YXRlLmxGcmFtZS5sVmlldy5sZW5ndGgsXG4gICAgICBcIkNhbid0IHNldCBpbmRleCBwYXNzZWQgZW5kIG9mIExWaWV3XCIsXG4gICAgKTtcbiAgaW5zdHJ1Y3Rpb25TdGF0ZS5sRnJhbWUuc2VsZWN0ZWRJbmRleCA9IGluZGV4O1xufVxuXG4vKipcbiAqIEdldHMgdGhlIGB0Tm9kZWAgdGhhdCByZXByZXNlbnRzIGN1cnJlbnRseSBzZWxlY3RlZCBlbGVtZW50LlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0U2VsZWN0ZWRUTm9kZSgpIHtcbiAgY29uc3QgbEZyYW1lID0gaW5zdHJ1Y3Rpb25TdGF0ZS5sRnJhbWU7XG4gIHJldHVybiBnZXRUTm9kZShsRnJhbWUudFZpZXcsIGxGcmFtZS5zZWxlY3RlZEluZGV4KTtcbn1cblxuLyoqXG4gKiBTZXRzIHRoZSBuYW1lc3BhY2UgdXNlZCB0byBjcmVhdGUgZWxlbWVudHMgdG8gYCdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZydgIGluIGdsb2JhbCBzdGF0ZS5cbiAqXG4gKiBAY29kZUdlbkFwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gybXJtW5hbWVzcGFjZVNWRygpIHtcbiAgaW5zdHJ1Y3Rpb25TdGF0ZS5sRnJhbWUuY3VycmVudE5hbWVzcGFjZSA9IFNWR19OQU1FU1BBQ0U7XG59XG5cbi8qKlxuICogU2V0cyB0aGUgbmFtZXNwYWNlIHVzZWQgdG8gY3JlYXRlIGVsZW1lbnRzIHRvIGAnaHR0cDovL3d3dy53My5vcmcvMTk5OC9NYXRoTUwvJ2AgaW4gZ2xvYmFsIHN0YXRlLlxuICpcbiAqIEBjb2RlR2VuQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiDJtcm1bmFtZXNwYWNlTWF0aE1MKCkge1xuICBpbnN0cnVjdGlvblN0YXRlLmxGcmFtZS5jdXJyZW50TmFtZXNwYWNlID0gTUFUSF9NTF9OQU1FU1BBQ0U7XG59XG5cbi8qKlxuICogU2V0cyB0aGUgbmFtZXNwYWNlIHVzZWQgdG8gY3JlYXRlIGVsZW1lbnRzIHRvIGBudWxsYCwgd2hpY2ggZm9yY2VzIGVsZW1lbnQgY3JlYXRpb24gdG8gdXNlXG4gKiBgY3JlYXRlRWxlbWVudGAgcmF0aGVyIHRoYW4gYGNyZWF0ZUVsZW1lbnROU2AuXG4gKlxuICogQGNvZGVHZW5BcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIMm1ybVuYW1lc3BhY2VIVE1MKCkge1xuICBuYW1lc3BhY2VIVE1MSW50ZXJuYWwoKTtcbn1cblxuLyoqXG4gKiBTZXRzIHRoZSBuYW1lc3BhY2UgdXNlZCB0byBjcmVhdGUgZWxlbWVudHMgdG8gYG51bGxgLCB3aGljaCBmb3JjZXMgZWxlbWVudCBjcmVhdGlvbiB0byB1c2VcbiAqIGBjcmVhdGVFbGVtZW50YCByYXRoZXIgdGhhbiBgY3JlYXRlRWxlbWVudE5TYC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG5hbWVzcGFjZUhUTUxJbnRlcm5hbCgpIHtcbiAgaW5zdHJ1Y3Rpb25TdGF0ZS5sRnJhbWUuY3VycmVudE5hbWVzcGFjZSA9IG51bGw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXROYW1lc3BhY2UoKTogc3RyaW5nIHwgbnVsbCB7XG4gIHJldHVybiBpbnN0cnVjdGlvblN0YXRlLmxGcmFtZS5jdXJyZW50TmFtZXNwYWNlO1xufVxuXG5sZXQgX3dhc0xhc3ROb2RlQ3JlYXRlZCA9IHRydWU7XG5cbi8qKlxuICogUmV0cmlldmVzIGEgZ2xvYmFsIGZsYWcgdGhhdCBpbmRpY2F0ZXMgd2hldGhlciB0aGUgbW9zdCByZWNlbnQgRE9NIG5vZGVcbiAqIHdhcyBjcmVhdGVkIG9yIGh5ZHJhdGVkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gd2FzTGFzdE5vZGVDcmVhdGVkKCk6IGJvb2xlYW4ge1xuICByZXR1cm4gX3dhc0xhc3ROb2RlQ3JlYXRlZDtcbn1cblxuLyoqXG4gKiBTZXRzIGEgZ2xvYmFsIGZsYWcgdG8gaW5kaWNhdGUgd2hldGhlciB0aGUgbW9zdCByZWNlbnQgRE9NIG5vZGVcbiAqIHdhcyBjcmVhdGVkIG9yIGh5ZHJhdGVkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gbGFzdE5vZGVXYXNDcmVhdGVkKGZsYWc6IGJvb2xlYW4pOiB2b2lkIHtcbiAgX3dhc0xhc3ROb2RlQ3JlYXRlZCA9IGZsYWc7XG59XG4iXX0=