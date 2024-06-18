/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { setActiveConsumer } from '@angular/core/primitives/signals';
import { assertDefined, assertEqual, assertNotEqual } from '../util/assert';
import { assertFirstCreatePass } from './assert';
import { NgOnChangesFeatureImpl } from './features/ng_onchanges_feature';
import { FLAGS, PREORDER_HOOK_FLAGS, } from './interfaces/view';
import { profiler } from './profiler';
import { isInCheckNoChangesMode } from './state';
/**
 * Adds all directive lifecycle hooks from the given `DirectiveDef` to the given `TView`.
 *
 * Must be run *only* on the first template pass.
 *
 * Sets up the pre-order hooks on the provided `tView`,
 * see {@link HookData} for details about the data structure.
 *
 * @param directiveIndex The index of the directive in LView
 * @param directiveDef The definition containing the hooks to setup in tView
 * @param tView The current TView
 */
export function registerPreOrderHooks(directiveIndex, directiveDef, tView) {
    ngDevMode && assertFirstCreatePass(tView);
    const { ngOnChanges, ngOnInit, ngDoCheck } = directiveDef.type.prototype;
    if (ngOnChanges) {
        const wrappedOnChanges = NgOnChangesFeatureImpl(directiveDef);
        (tView.preOrderHooks ??= []).push(directiveIndex, wrappedOnChanges);
        (tView.preOrderCheckHooks ??= []).push(directiveIndex, wrappedOnChanges);
    }
    if (ngOnInit) {
        (tView.preOrderHooks ??= []).push(0 - directiveIndex, ngOnInit);
    }
    if (ngDoCheck) {
        (tView.preOrderHooks ??= []).push(directiveIndex, ngDoCheck);
        (tView.preOrderCheckHooks ??= []).push(directiveIndex, ngDoCheck);
    }
}
/**
 *
 * Loops through the directives on the provided `tNode` and queues hooks to be
 * run that are not initialization hooks.
 *
 * Should be executed during `elementEnd()` and similar to
 * preserve hook execution order. Content, view, and destroy hooks for projected
 * components and directives must be called *before* their hosts.
 *
 * Sets up the content, view, and destroy hooks on the provided `tView`,
 * see {@link HookData} for details about the data structure.
 *
 * NOTE: This does not set up `onChanges`, `onInit` or `doCheck`, those are set up
 * separately at `elementStart`.
 *
 * @param tView The current TView
 * @param tNode The TNode whose directives are to be searched for hooks to queue
 */
export function registerPostOrderHooks(tView, tNode) {
    ngDevMode && assertFirstCreatePass(tView);
    // It's necessary to loop through the directives at elementEnd() (rather than processing in
    // directiveCreate) so we can preserve the current hook order. Content, view, and destroy
    // hooks for projected components and directives must be called *before* their hosts.
    for (let i = tNode.directiveStart, end = tNode.directiveEnd; i < end; i++) {
        const directiveDef = tView.data[i];
        ngDevMode && assertDefined(directiveDef, 'Expecting DirectiveDef');
        const lifecycleHooks = directiveDef.type.prototype;
        const { ngAfterContentInit, ngAfterContentChecked, ngAfterViewInit, ngAfterViewChecked, ngOnDestroy, } = lifecycleHooks;
        if (ngAfterContentInit) {
            (tView.contentHooks ??= []).push(-i, ngAfterContentInit);
        }
        if (ngAfterContentChecked) {
            (tView.contentHooks ??= []).push(i, ngAfterContentChecked);
            (tView.contentCheckHooks ??= []).push(i, ngAfterContentChecked);
        }
        if (ngAfterViewInit) {
            (tView.viewHooks ??= []).push(-i, ngAfterViewInit);
        }
        if (ngAfterViewChecked) {
            (tView.viewHooks ??= []).push(i, ngAfterViewChecked);
            (tView.viewCheckHooks ??= []).push(i, ngAfterViewChecked);
        }
        if (ngOnDestroy != null) {
            (tView.destroyHooks ??= []).push(i, ngOnDestroy);
        }
    }
}
/**
 * Executing hooks requires complex logic as we need to deal with 2 constraints.
 *
 * 1. Init hooks (ngOnInit, ngAfterContentInit, ngAfterViewInit) must all be executed once and only
 * once, across many change detection cycles. This must be true even if some hooks throw, or if
 * some recursively trigger a change detection cycle.
 * To solve that, it is required to track the state of the execution of these init hooks.
 * This is done by storing and maintaining flags in the view: the {@link InitPhaseState},
 * and the index within that phase. They can be seen as a cursor in the following structure:
 * [[onInit1, onInit2], [afterContentInit1], [afterViewInit1, afterViewInit2, afterViewInit3]]
 * They are stored as flags in LView[FLAGS].
 *
 * 2. Pre-order hooks can be executed in batches, because of the select instruction.
 * To be able to pause and resume their execution, we also need some state about the hook's array
 * that is being processed:
 * - the index of the next hook to be executed
 * - the number of init hooks already found in the processed part of the  array
 * They are stored as flags in LView[PREORDER_HOOK_FLAGS].
 */
/**
 * Executes pre-order check hooks ( OnChanges, DoChanges) given a view where all the init hooks were
 * executed once. This is a light version of executeInitAndCheckPreOrderHooks where we can skip read
 * / write of the init-hooks related flags.
 * @param lView The LView where hooks are defined
 * @param hooks Hooks to be run
 * @param nodeIndex 3 cases depending on the value:
 * - undefined: all hooks from the array should be executed (post-order case)
 * - null: execute hooks only from the saved index until the end of the array (pre-order case, when
 * flushing the remaining hooks)
 * - number: execute hooks only from the saved index until that node index exclusive (pre-order
 * case, when executing select(number))
 */
export function executeCheckHooks(lView, hooks, nodeIndex) {
    callHooks(lView, hooks, 3 /* InitPhaseState.InitPhaseCompleted */, nodeIndex);
}
/**
 * Executes post-order init and check hooks (one of AfterContentInit, AfterContentChecked,
 * AfterViewInit, AfterViewChecked) given a view where there are pending init hooks to be executed.
 * @param lView The LView where hooks are defined
 * @param hooks Hooks to be run
 * @param initPhase A phase for which hooks should be run
 * @param nodeIndex 3 cases depending on the value:
 * - undefined: all hooks from the array should be executed (post-order case)
 * - null: execute hooks only from the saved index until the end of the array (pre-order case, when
 * flushing the remaining hooks)
 * - number: execute hooks only from the saved index until that node index exclusive (pre-order
 * case, when executing select(number))
 */
export function executeInitAndCheckHooks(lView, hooks, initPhase, nodeIndex) {
    ngDevMode &&
        assertNotEqual(initPhase, 3 /* InitPhaseState.InitPhaseCompleted */, 'Init pre-order hooks should not be called more than once');
    if ((lView[FLAGS] & 3 /* LViewFlags.InitPhaseStateMask */) === initPhase) {
        callHooks(lView, hooks, initPhase, nodeIndex);
    }
}
export function incrementInitPhaseFlags(lView, initPhase) {
    ngDevMode &&
        assertNotEqual(initPhase, 3 /* InitPhaseState.InitPhaseCompleted */, 'Init hooks phase should not be incremented after all init hooks have been run.');
    let flags = lView[FLAGS];
    if ((flags & 3 /* LViewFlags.InitPhaseStateMask */) === initPhase) {
        flags &= 16383 /* LViewFlags.IndexWithinInitPhaseReset */;
        flags += 1 /* LViewFlags.InitPhaseStateIncrementer */;
        lView[FLAGS] = flags;
    }
}
/**
 * Calls lifecycle hooks with their contexts, skipping init hooks if it's not
 * the first LView pass
 *
 * @param currentView The current view
 * @param arr The array in which the hooks are found
 * @param initPhaseState the current state of the init phase
 * @param currentNodeIndex 3 cases depending on the value:
 * - undefined: all hooks from the array should be executed (post-order case)
 * - null: execute hooks only from the saved index until the end of the array (pre-order case, when
 * flushing the remaining hooks)
 * - number: execute hooks only from the saved index until that node index exclusive (pre-order
 * case, when executing select(number))
 */
function callHooks(currentView, arr, initPhase, currentNodeIndex) {
    ngDevMode &&
        assertEqual(isInCheckNoChangesMode(), false, 'Hooks should never be run when in check no changes mode.');
    const startIndex = currentNodeIndex !== undefined
        ? currentView[PREORDER_HOOK_FLAGS] & 65535 /* PreOrderHookFlags.IndexOfTheNextPreOrderHookMaskMask */
        : 0;
    const nodeIndexLimit = currentNodeIndex != null ? currentNodeIndex : -1;
    const max = arr.length - 1; // Stop the loop at length - 1, because we look for the hook at i + 1
    let lastNodeIndexFound = 0;
    for (let i = startIndex; i < max; i++) {
        const hook = arr[i + 1];
        if (typeof hook === 'number') {
            lastNodeIndexFound = arr[i];
            if (currentNodeIndex != null && lastNodeIndexFound >= currentNodeIndex) {
                break;
            }
        }
        else {
            const isInitHook = arr[i] < 0;
            if (isInitHook) {
                currentView[PREORDER_HOOK_FLAGS] += 65536 /* PreOrderHookFlags.NumberOfInitHooksCalledIncrementer */;
            }
            if (lastNodeIndexFound < nodeIndexLimit || nodeIndexLimit == -1) {
                callHook(currentView, initPhase, arr, i);
                currentView[PREORDER_HOOK_FLAGS] =
                    (currentView[PREORDER_HOOK_FLAGS] & 4294901760 /* PreOrderHookFlags.NumberOfInitHooksCalledMask */) +
                        i +
                        2;
            }
            i++;
        }
    }
}
/**
 * Executes a single lifecycle hook, making sure that:
 * - it is called in the non-reactive context;
 * - profiling data are registered.
 */
function callHookInternal(directive, hook) {
    profiler(4 /* ProfilerEvent.LifecycleHookStart */, directive, hook);
    const prevConsumer = setActiveConsumer(null);
    try {
        hook.call(directive);
    }
    finally {
        setActiveConsumer(prevConsumer);
        profiler(5 /* ProfilerEvent.LifecycleHookEnd */, directive, hook);
    }
}
/**
 * Execute one hook against the current `LView`.
 *
 * @param currentView The current view
 * @param initPhaseState the current state of the init phase
 * @param arr The array in which the hooks are found
 * @param i The current index within the hook data array
 */
function callHook(currentView, initPhase, arr, i) {
    const isInitHook = arr[i] < 0;
    const hook = arr[i + 1];
    const directiveIndex = isInitHook ? -arr[i] : arr[i];
    const directive = currentView[directiveIndex];
    if (isInitHook) {
        const indexWithintInitPhase = currentView[FLAGS] >> 14 /* LViewFlags.IndexWithinInitPhaseShift */;
        // The init phase state must be always checked here as it may have been recursively updated.
        if (indexWithintInitPhase <
            currentView[PREORDER_HOOK_FLAGS] >> 16 /* PreOrderHookFlags.NumberOfInitHooksCalledShift */ &&
            (currentView[FLAGS] & 3 /* LViewFlags.InitPhaseStateMask */) === initPhase) {
            currentView[FLAGS] += 16384 /* LViewFlags.IndexWithinInitPhaseIncrementer */;
            callHookInternal(directive, hook);
        }
    }
    else {
        callHookInternal(directive, hook);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaG9va3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy9yZW5kZXIzL2hvb2tzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLGtDQUFrQyxDQUFDO0FBWW5FLE9BQU8sRUFBQyxhQUFhLEVBQUUsV0FBVyxFQUFFLGNBQWMsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBRTFFLE9BQU8sRUFBQyxxQkFBcUIsRUFBQyxNQUFNLFVBQVUsQ0FBQztBQUMvQyxPQUFPLEVBQUMsc0JBQXNCLEVBQUMsTUFBTSxpQ0FBaUMsQ0FBQztBQUd2RSxPQUFPLEVBQ0wsS0FBSyxFQUtMLG1CQUFtQixHQUdwQixNQUFNLG1CQUFtQixDQUFDO0FBQzNCLE9BQU8sRUFBQyxRQUFRLEVBQWdCLE1BQU0sWUFBWSxDQUFDO0FBQ25ELE9BQU8sRUFBQyxzQkFBc0IsRUFBQyxNQUFNLFNBQVMsQ0FBQztBQUUvQzs7Ozs7Ozs7Ozs7R0FXRztBQUNILE1BQU0sVUFBVSxxQkFBcUIsQ0FDbkMsY0FBc0IsRUFDdEIsWUFBK0IsRUFDL0IsS0FBWTtJQUVaLFNBQVMsSUFBSSxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUMxQyxNQUFNLEVBQUMsV0FBVyxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUMsR0FBRyxZQUFZLENBQUMsSUFBSSxDQUFDLFNBRXBELENBQUM7SUFFVixJQUFJLFdBQW1DLEVBQUUsQ0FBQztRQUN4QyxNQUFNLGdCQUFnQixHQUFHLHNCQUFzQixDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzlELENBQUMsS0FBSyxDQUFDLGFBQWEsS0FBSyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLGdCQUFnQixDQUFDLENBQUM7UUFDcEUsQ0FBQyxLQUFLLENBQUMsa0JBQWtCLEtBQUssRUFBRSxDQUFDLENBQUMs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QUssU0FBUyxFQUNsRSxDQUFDO1lBQ0QsV0FBVyxDQUFDLEtBQUssQ0FBQywwREFBOEMsQ0FBQztZQUNqRSxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDcEMsQ0FBQztJQUNILENBQUM7U0FBTSxDQUFDO1FBQ04sZ0JBQWdCLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3BDLENBQUM7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7c2V0QWN0aXZlQ29uc3VtZXJ9IGZyb20gJ0Bhbmd1bGFyL2NvcmUvcHJpbWl0aXZlcy9zaWduYWxzJztcblxuaW1wb3J0IHtcbiAgQWZ0ZXJDb250ZW50Q2hlY2tlZCxcbiAgQWZ0ZXJDb250ZW50SW5pdCxcbiAgQWZ0ZXJWaWV3Q2hlY2tlZCxcbiAgQWZ0ZXJWaWV3SW5pdCxcbiAgRG9DaGVjayxcbiAgT25DaGFuZ2VzLFxuICBPbkRlc3Ryb3ksXG4gIE9uSW5pdCxcbn0gZnJvbSAnLi4vaW50ZXJmYWNlL2xpZmVjeWNsZV9ob29rcyc7XG5pbXBvcnQge2Fzc2VydERlZmluZWQsIGFzc2VydEVxdWFsLCBhc3NlcnROb3RFcXVhbH0gZnJvbSAnLi4vdXRpbC9hc3NlcnQnO1xuXG5pbXBvcnQge2Fzc2VydEZpcnN0Q3JlYXRlUGFzc30gZnJvbSAnLi9hc3NlcnQnO1xuaW1wb3J0IHtOZ09uQ2hhbmdlc0ZlYXR1cmVJbXBsfSBmcm9tICcuL2ZlYXR1cmVzL25nX29uY2hhbmdlc19mZWF0dXJlJztcbmltcG9ydCB7RGlyZWN0aXZlRGVmfSBmcm9tICcuL2ludGVyZmFjZXMvZGVmaW5pdGlvbic7XG5pbXBvcnQge1ROb2RlfSBmcm9tICcuL2ludGVyZmFjZXMvbm9kZSc7XG5pbXBvcnQge1xuICBGTEFHUyxcbiAgSG9va0RhdGEsXG4gIEluaXRQaGFzZVN0YXRlLFxuICBMVmlldyxcbiAgTFZpZXdGbGFncyxcbiAgUFJFT1JERVJfSE9PS19GTEFHUyxcbiAgUHJlT3JkZXJIb29rRmxhZ3MsXG4gIFRWaWV3LFxufSBmcm9tICcuL2ludGVyZmFjZXMvdmlldyc7XG5pbXBvcnQge3Byb2ZpbGVyLCBQcm9maWxlckV2ZW50fSBmcm9tICcuL3Byb2ZpbGVyJztcbmltcG9ydCB7aXNJbkNoZWNrTm9DaGFuZ2VzTW9kZX0gZnJvbSAnLi9zdGF0ZSc7XG5cbi8qKlxuICogQWRkcyBhbGwgZGlyZWN0aXZlIGxpZmVjeWNsZSBob29rcyBmcm9tIHRoZSBnaXZlbiBgRGlyZWN0aXZlRGVmYCB0byB0aGUgZ2l2ZW4gYFRWaWV3YC5cbiAqXG4gKiBNdXN0IGJlIHJ1biAqb25seSogb24gdGhlIGZpcnN0IHRlbXBsYXRlIHBhc3MuXG4gKlxuICogU2V0cyB1cCB0aGUgcHJlLW9yZGVyIGhvb2tzIG9uIHRoZSBwcm92aWRlZCBgdFZpZXdgLFxuICogc2VlIHtAbGluayBIb29rRGF0YX0gZm9yIGRldGFpbHMgYWJvdXQgdGhlIGRhdGEgc3RydWN0dXJlLlxuICpcbiAqIEBwYXJhbSBkaXJlY3RpdmVJbmRleCBUaGUgaW5kZXggb2YgdGhlIGRpcmVjdGl2ZSBpbiBMVmlld1xuICogQHBhcmFtIGRpcmVjdGl2ZURlZiBUaGUgZGVmaW5pdGlvbiBjb250YWluaW5nIHRoZSBob29rcyB0byBzZXR1cCBpbiB0Vmlld1xuICogQHBhcmFtIHRWaWV3IFRoZSBjdXJyZW50IFRWaWV3XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlclByZU9yZGVySG9va3MoXG4gIGRpcmVjdGl2ZUluZGV4OiBudW1iZXIsXG4gIGRpcmVjdGl2ZURlZjogRGlyZWN0aXZlRGVmPGFueT4sXG4gIHRWaWV3OiBUVmlldyxcbik6IHZvaWQge1xuICBuZ0Rldk1vZGUgJiYgYXNzZXJ0Rmlyc3RDcmVhdGVQYXNzKHRWaWV3KTtcbiAgY29uc3Qge25nT25DaGFuZ2VzLCBuZ09uSW5pdCwgbmdEb0NoZWNrfSA9IGRpcmVjdGl2ZURlZi50eXBlLnByb3RvdHlwZSBhcyBPbkNoYW5nZXMgJlxuICAgIE9uSW5pdCAmXG4gICAgRG9DaGVjaztcblxuICBpZiAobmdPbkNoYW5nZXMgYXMgRnVuY3Rpb24gfCB1bmRlZmluZWQpIHtcbiAgICBjb25zdCB3cmFwcGVkT25DaGFuZ2VzID0gTmdPbkNoYW5nZXNGZWF0dXJlSW1wbChkaXJlY3RpdmVEZWYpO1xuICAgICh0Vmlldy5wcmVPcmRlckhvb2tzID8/PSBbXSkucHVzaChkaXJlY3RpdmVJbmRleCwgd3JhcHBlZE9uQ2hhbmdlcyk7XG4gICAgKHRWaWV3LnByZU9yZGVyQ2hlY2tIb29rcyA/Pz0gW10pLnB1c2goZGlyZWN0aXZlSW5kZXgsIHdyYXBwZWRPbkNoYW5nZXMpO1xuICB9XG5cbiAgaWYgKG5nT25Jbml0KSB7XG4gICAgKHRWaWV3LnByZU9yZGVySG9va3MgPz89IFtdKS5wdXNoKDAgLSBkaXJlY3RpdmVJbmRleCwgbmdPbkluaXQpO1xuICB9XG5cbiAgaWYgKG5nRG9DaGVjaykge1xuICAgICh0Vmlldy5wcmVPcmRlckhvb2tzID8/PSBbXSkucHVzaChkaXJlY3RpdmVJbmRleCwgbmdEb0NoZWNrKTtcbiAgICAodFZpZXcucHJlT3JkZXJDaGVja0hvb2tzID8/PSBbXSkucHVzaChkaXJlY3RpdmVJbmRleCwgbmdEb0NoZWNrKTtcbiAgfVxufVxuXG4vKipcbiAqXG4gKiBMb29wcyB0aHJvdWdoIHRoZSBkaXJlY3RpdmVzIG9uIHRoZSBwcm92aWRlZCBgdE5vZGVgIGFuZCBxdWV1ZXMgaG9va3MgdG8gYmVcbiAqIHJ1biB0aGF0IGFyZSBub3QgaW5pdGlhbGl6YXRpb24gaG9va3MuXG4gKlxuICogU2hvdWxkIGJlIGV4ZWN1dGVkIGR1cmluZyBgZWxlbWVudEVuZCgpYCBhbmQgc2ltaWxhciB0b1xuICogcHJlc2VydmUgaG9vayBleGVjdXRpb24gb3JkZXIuIENvbnRlbnQsIHZpZXcsIGFuZCBkZXN0cm95IGhvb2tzIGZvciBwcm9qZWN0ZWRcbiAqIGNvbXBvbmVudHMgYW5kIGRpcmVjdGl2ZXMgbXVzdCBiZSBjYWxsZWQgKmJlZm9yZSogdGhlaXIgaG9zdHMuXG4gKlxuICogU2V0cyB1cCB0aGUgY29udGVudCwgdmlldywgYW5kIGRlc3Ryb3kgaG9va3Mgb24gdGhlIHByb3ZpZGVkIGB0Vmlld2AsXG4gKiBzZWUge0BsaW5rIEhvb2tEYXRhfSBmb3IgZGV0YWlscyBhYm91dCB0aGUgZGF0YSBzdHJ1Y3R1cmUuXG4gKlxuICogTk9URTogVGhpcyBkb2VzIG5vdCBzZXQgdXAgYG9uQ2hhbmdlc2AsIGBvbkluaXRgIG9yIGBkb0NoZWNrYCwgdGhvc2UgYXJlIHNldCB1cFxuICogc2VwYXJhdGVseSBhdCBgZWxlbWVudFN0YXJ0YC5cbiAqXG4gKiBAcGFyYW0gdFZpZXcgVGhlIGN1cnJlbnQgVFZpZXdcbiAqIEBwYXJhbSB0Tm9kZSBUaGUgVE5vZGUgd2hvc2UgZGlyZWN0aXZlcyBhcmUgdG8gYmUgc2VhcmNoZWQgZm9yIGhvb2tzIHRvIHF1ZXVlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlclBvc3RPcmRlckhvb2tzKHRWaWV3OiBUVmlldywgdE5vZGU6IFROb2RlKTogdm9pZCB7XG4gIG5nRGV2TW9kZSAmJiBhc3NlcnRGaXJzdENyZWF0ZVBhc3ModFZpZXcpO1xuICAvLyBJdCdzIG5lY2Vzc2FyeSB0byBsb29wIHRocm91Z2ggdGhlIGRpcmVjdGl2ZXMgYXQgZWxlbWVudEVuZCgpIChyYXRoZXIgdGhhbiBwcm9jZXNzaW5nIGluXG4gIC8vIGRpcmVjdGl2ZUNyZWF0ZSkgc28gd2UgY2FuIHByZXNlcnZlIHRoZSBjdXJyZW50IGhvb2sgb3JkZXIuIENvbnRlbnQsIHZpZXcsIGFuZCBkZXN0cm95XG4gIC8vIGhvb2tzIGZvciBwcm9qZWN0ZWQgY29tcG9uZW50cyBhbmQgZGlyZWN0aXZlcyBtdXN0IGJlIGNhbGxlZCAqYmVmb3JlKiB0aGVpciBob3N0cy5cbiAgZm9yIChsZXQgaSA9IHROb2RlLmRpcmVjdGl2ZVN0YXJ0LCBlbmQgPSB0Tm9kZS5kaXJlY3RpdmVFbmQ7IGkgPCBlbmQ7IGkrKykge1xuICAgIGNvbnN0IGRpcmVjdGl2ZURlZiA9IHRWaWV3LmRhdGFbaV0gYXMgRGlyZWN0aXZlRGVmPGFueT47XG4gICAgbmdEZXZNb2RlICYmIGFzc2VydERlZmluZWQoZGlyZWN0aXZlRGVmLCAnRXhwZWN0aW5nIERpcmVjdGl2ZURlZicpO1xuICAgIGNvbnN0IGxpZmVjeWNsZUhvb2tzOiBBZnRlckNvbnRlbnRJbml0ICZcbiAgICAgIEFmdGVyQ29udGVudENoZWNrZWQgJlxuICAgICAgQWZ0ZXJWaWV3SW5pdCAmXG4gICAgICBBZnRlclZpZXdDaGVja2VkICZcbiAgICAgIE9uRGVzdHJveSA9IGRpcmVjdGl2ZURlZi50eXBlLnByb3RvdHlwZTtcbiAgICBjb25zdCB7XG4gICAgICBuZ0FmdGVyQ29udGVudEluaXQsXG4gICAgICBuZ0FmdGVyQ29udGVudENoZWNrZWQsXG4gICAgICBuZ0FmdGVyVmlld0luaXQsXG4gICAgICBuZ0FmdGVyVmlld0NoZWNrZWQsXG4gICAgICBuZ09uRGVzdHJveSxcbiAgICB9ID0gbGlmZWN5Y2xlSG9va3M7XG5cbiAgICBpZiAobmdBZnRlckNvbnRlbnRJbml0KSB7XG4gICAgICAodFZpZXcuY29udGVudEhvb2tzID8/PSBbXSkucHVzaCgtaSwgbmdBZnRlckNvbnRlbnRJbml0KTtcbiAgICB9XG5cbiAgICBpZiAobmdBZnRlckNvbnRlbnRDaGVja2VkKSB7XG4gICAgICAodFZpZXcuY29udGVudEhvb2tzID8/PSBbXSkucHVzaChpLCBuZ0FmdGVyQ29udGVudENoZWNrZWQpO1xuICAgICAgKHRWaWV3LmNvbnRlbnRDaGVja0hvb2tzID8/PSBbXSkucHVzaChpLCBuZ0FmdGVyQ29udGVudENoZWNrZWQpO1xuICAgIH1cblxuICAgIGlmIChuZ0FmdGVyVmlld0luaXQpIHtcbiAgICAgICh0Vmlldy52aWV3SG9va3MgPz89IFtdKS5wdXNoKC1pLCBuZ0FmdGVyVmlld0luaXQpO1xuICAgIH1cblxuICAgIGlmIChuZ0FmdGVyVmlld0NoZWNrZWQpIHtcbiAgICAgICh0Vmlldy52aWV3SG9va3MgPz89IFtdKS5wdXNoKGksIG5nQWZ0ZXJWaWV3Q2hlY2tlZCk7XG4gICAgICAodFZpZXcudmlld0NoZWNrSG9va3MgPz89IFtdKS5wdXNoKGksIG5nQWZ0ZXJWaWV3Q2hlY2tlZCk7XG4gICAgfVxuXG4gICAgaWYgKG5nT25EZXN0cm95ICE9IG51bGwpIHtcbiAgICAgICh0Vmlldy5kZXN0cm95SG9va3MgPz89IFtdKS5wdXNoKGksIG5nT25EZXN0cm95KTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBFeGVjdXRpbmcgaG9va3MgcmVxdWlyZXMgY29tcGxleCBsb2dpYyBhcyB3ZSBuZWVkIHRvIGRlYWwgd2l0aCAyIGNvbnN0cmFpbnRzLlxuICpcbiAqIDEuIEluaXQgaG9va3MgKG5nT25Jbml0LCBuZ0FmdGVyQ29udGVudEluaXQsIG5nQWZ0ZXJWaWV3SW5pdCkgbXVzdCBhbGwgYmUgZXhlY3V0ZWQgb25jZSBhbmQgb25seVxuICogb25jZSwgYWNyb3NzIG1hbnkgY2hhbmdlIGRldGVjdGlvbiBjeWNsZXMuIFRoaXMgbXVzdCBiZSB0cnVlIGV2ZW4gaWYgc29tZSBob29rcyB0aHJvdywgb3IgaWZcbiAqIHNvbWUgcmVjdXJzaXZlbHkgdHJpZ2dlciBhIGNoYW5nZSBkZXRlY3Rpb24gY3ljbGUuXG4gKiBUbyBzb2x2ZSB0aGF0LCBpdCBpcyByZXF1aXJlZCB0byB0cmFjayB0aGUgc3RhdGUgb2YgdGhlIGV4ZWN1dGlvbiBvZiB0aGVzZSBpbml0IGhvb2tzLlxuICogVGhpcyBpcyBkb25lIGJ5IHN0b3JpbmcgYW5kIG1haW50YWluaW5nIGZsYWdzIGluIHRoZSB2aWV3OiB0aGUge0BsaW5rIEluaXRQaGFzZVN0YXRlfSxcbiAqIGFuZCB0aGUgaW5kZXggd2l0aGluIHRoYXQgcGhhc2UuIFRoZXkgY2FuIGJlIHNlZW4gYXMgYSBjdXJzb3IgaW4gdGhlIGZvbGxvd2luZyBzdHJ1Y3R1cmU6XG4gKiBbW29uSW5pdDEsIG9uSW5pdDJdLCBbYWZ0ZXJDb250ZW50SW5pdDFdLCBbYWZ0ZXJWaWV3SW5pdDEsIGFmdGVyVmlld0luaXQyLCBhZnRlclZpZXdJbml0M11dXG4gKiBUaGV5IGFyZSBzdG9yZWQgYXMgZmxhZ3MgaW4gTFZpZXdbRkxBR1NdLlxuICpcbiAqIDIuIFByZS1vcmRlciBob29rcyBjYW4gYmUgZXhlY3V0ZWQgaW4gYmF0Y2hlcywgYmVjYXVzZSBvZiB0aGUgc2VsZWN0IGluc3RydWN0aW9uLlxuICogVG8gYmUgYWJsZSB0byBwYXVzZSBhbmQgcmVzdW1lIHRoZWlyIGV4ZWN1dGlvbiwgd2UgYWxzbyBuZWVkIHNvbWUgc3RhdGUgYWJvdXQgdGhlIGhvb2sncyBhcnJheVxuICogdGhhdCBpcyBiZWluZyBwcm9jZXNzZWQ6XG4gKiAtIHRoZSBpbmRleCBvZiB0aGUgbmV4dCBob29rIHRvIGJlIGV4ZWN1dGVkXG4gKiAtIHRoZSBudW1iZXIgb2YgaW5pdCBob29rcyBhbHJlYWR5IGZvdW5kIGluIHRoZSBwcm9jZXNzZWQgcGFydCBvZiB0aGUgIGFycmF5XG4gKiBUaGV5IGFyZSBzdG9yZWQgYXMgZmxhZ3MgaW4gTFZpZXdbUFJFT1JERVJfSE9PS19GTEFHU10uXG4gKi9cblxuLyoqXG4gKiBFeGVjdXRlcyBwcmUtb3JkZXIgY2hlY2sgaG9va3MgKCBPbkNoYW5nZXMsIERvQ2hhbmdlcykgZ2l2ZW4gYSB2aWV3IHdoZXJlIGFsbCB0aGUgaW5pdCBob29rcyB3ZXJlXG4gKiBleGVjdXRlZCBvbmNlLiBUaGlzIGlzIGEgbGlnaHQgdmVyc2lvbiBvZiBleGVjdXRlSW5pdEFuZENoZWNrUHJlT3JkZXJIb29rcyB3aGVyZSB3ZSBjYW4gc2tpcCByZWFkXG4gKiAvIHdyaXRlIG9mIHRoZSBpbml0LWhvb2tzIHJlbGF0ZWQgZmxhZ3MuXG4gKiBAcGFyYW0gbFZpZXcgVGhlIExWaWV3IHdoZXJlIGhvb2tzIGFyZSBkZWZpbmVkXG4gKiBAcGFyYW0gaG9va3MgSG9va3MgdG8gYmUgcnVuXG4gKiBAcGFyYW0gbm9kZUluZGV4IDMgY2FzZXMgZGVwZW5kaW5nIG9uIHRoZSB2YWx1ZTpcbiAqIC0gdW5kZWZpbmVkOiBhbGwgaG9va3MgZnJvbSB0aGUgYXJyYXkgc2hvdWxkIGJlIGV4ZWN1dGVkIChwb3N0LW9yZGVyIGNhc2UpXG4gKiAtIG51bGw6IGV4ZWN1dGUgaG9va3Mgb25seSBmcm9tIHRoZSBzYXZlZCBpbmRleCB1bnRpbCB0aGUgZW5kIG9mIHRoZSBhcnJheSAocHJlLW9yZGVyIGNhc2UsIHdoZW5cbiAqIGZsdXNoaW5nIHRoZSByZW1haW5pbmcgaG9va3MpXG4gKiAtIG51bWJlcjogZXhlY3V0ZSBob29rcyBvbmx5IGZyb20gdGhlIHNhdmVkIGluZGV4IHVudGlsIHRoYXQgbm9kZSBpbmRleCBleGNsdXNpdmUgKHByZS1vcmRlclxuICogY2FzZSwgd2hlbiBleGVjdXRpbmcgc2VsZWN0KG51bWJlcikpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBleGVjdXRlQ2hlY2tIb29rcyhsVmlldzogTFZpZXcsIGhvb2tzOiBIb29rRGF0YSwgbm9kZUluZGV4PzogbnVtYmVyIHwgbnVsbCkge1xuICBjYWxsSG9va3MobFZpZXcsIGhvb2tzLCBJbml0UGhhc2VTdGF0ZS5Jbml0UGhhc2VDb21wbGV0ZWQsIG5vZGVJbmRleCk7XG59XG5cbi8qKlxuICogRXhlY3V0ZXMgcG9zdC1vcmRlciBpbml0IGFuZCBjaGVjayBob29rcyAob25lIG9mIEFmdGVyQ29udGVudEluaXQsIEFmdGVyQ29udGVudENoZWNrZWQsXG4gKiBBZnRlclZpZXdJbml0LCBBZnRlclZpZXdDaGVja2VkKSBnaXZlbiBhIHZpZXcgd2hlcmUgdGhlcmUgYXJlIHBlbmRpbmcgaW5pdCBob29rcyB0byBiZSBleGVjdXRlZC5cbiAqIEBwYXJhbSBsVmlldyBUaGUgTFZpZXcgd2hlcmUgaG9va3MgYXJlIGRlZmluZWRcbiAqIEBwYXJhbSBob29rcyBIb29rcyB0byBiZSBydW5cbiAqIEBwYXJhbSBpbml0UGhhc2UgQSBwaGFzZSBmb3Igd2hpY2ggaG9va3Mgc2hvdWxkIGJlIHJ1blxuICogQHBhcmFtIG5vZGVJbmRleCAzIGNhc2VzIGRlcGVuZGluZyBvbiB0aGUgdmFsdWU6XG4gKiAtIHVuZGVmaW5lZDogYWxsIGhvb2tzIGZyb20gdGhlIGFycmF5IHNob3VsZCBiZSBleGVjdXRlZCAocG9zdC1vcmRlciBjYXNlKVxuICogLSBudWxsOiBleGVjdXRlIGhvb2tzIG9ubHkgZnJvbSB0aGUgc2F2ZWQgaW5kZXggdW50aWwgdGhlIGVuZCBvZiB0aGUgYXJyYXkgKHByZS1vcmRlciBjYXNlLCB3aGVuXG4gKiBmbHVzaGluZyB0aGUgcmVtYWluaW5nIGhvb2tzKVxuICogLSBudW1iZXI6IGV4ZWN1dGUgaG9va3Mgb25seSBmcm9tIHRoZSBzYXZlZCBpbmRleCB1bnRpbCB0aGF0IG5vZGUgaW5kZXggZXhjbHVzaXZlIChwcmUtb3JkZXJcbiAqIGNhc2UsIHdoZW4gZXhlY3V0aW5nIHNlbGVjdChudW1iZXIpKVxuICovXG5leHBvcnQgZnVuY3Rpb24gZXhlY3V0ZUluaXRBbmRDaGVja0hvb2tzKFxuICBsVmlldzogTFZpZXcsXG4gIGhvb2tzOiBIb29rRGF0YSxcbiAgaW5pdFBoYXNlOiBJbml0UGhhc2VTdGF0ZSxcbiAgbm9kZUluZGV4PzogbnVtYmVyIHwgbnVsbCxcbikge1xuICBuZ0Rldk1vZGUgJiZcbiAgICBhc3NlcnROb3RFcXVhbChcbiAgICAgIGluaXRQaGFzZSxcbiAgICAgIEluaXRQaGFzZVN0YXRlLkluaXRQaGFzZUNvbXBsZXRlZCxcbiAgICAgICdJbml0IHByZS1vcmRlciBob29rcyBzaG91bGQgbm90IGJlIGNhbGxlZCBtb3JlIHRoYW4gb25jZScsXG4gICAgKTtcbiAgaWYgKChsVmlld1tGTEFHU10gJiBMVmlld0ZsYWdzLkluaXRQaGFzZVN0YXRlTWFzaykgPT09IGluaXRQaGFzZSkge1xuICAgIGNhbGxIb29rcyhsVmlldywgaG9va3MsIGluaXRQaGFzZSwgbm9kZUluZGV4KTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaW5jcmVtZW50SW5pdFBoYXNlRmxhZ3MobFZpZXc6IExWaWV3LCBpbml0UGhhc2U6IEluaXRQaGFzZVN0YXRlKTogdm9pZCB7XG4gIG5nRGV2TW9kZSAmJlxuICAgIGFzc2VydE5vdEVxdWFsKFxuICAgICAgaW5pdFBoYXNlLFxuICAgICAgSW5pdFBoYXNlU3RhdGUuSW5pdFBoYXNlQ29tcGxldGVkLFxuICAgICAgJ0luaXQgaG9va3MgcGhhc2Ugc2hvdWxkIG5vdCBiZSBpbmNyZW1lbnRlZCBhZnRlciBhbGwgaW5pdCBob29rcyBoYXZlIGJlZW4gcnVuLicsXG4gICAgKTtcbiAgbGV0IGZsYWdzID0gbFZpZXdbRkxBR1NdO1xuICBpZiAoKGZsYWdzICYgTFZpZXdGbGFncy5Jbml0UGhhc2VTdGF0ZU1hc2spID09PSBpbml0UGhhc2UpIHtcbiAgICBmbGFncyAmPSBMVmlld0ZsYWdzLkluZGV4V2l0aGluSW5pdFBoYXNlUmVzZXQ7XG4gICAgZmxhZ3MgKz0gTFZpZXdGbGFncy5Jbml0UGhhc2VTdGF0ZUluY3JlbWVudGVyO1xuICAgIGxWaWV3W0ZMQUdTXSA9IGZsYWdzO1xuICB9XG59XG5cbi8qKlxuICogQ2FsbHMgbGlmZWN5Y2xlIGhvb2tzIHdpdGggdGhlaXIgY29udGV4dHMsIHNraXBwaW5nIGluaXQgaG9va3MgaWYgaXQncyBub3RcbiAqIHRoZSBmaXJzdCBMVmlldyBwYXNzXG4gKlxuICogQHBhcmFtIGN1cnJlbnRWaWV3IFRoZSBjdXJyZW50IHZpZXdcbiAqIEBwYXJhbSBhcnIgVGhlIGFycmF5IGluIHdoaWNoIHRoZSBob29rcyBhcmUgZm91bmRcbiAqIEBwYXJhbSBpbml0UGhhc2VTdGF0ZSB0aGUgY3VycmVudCBzdGF0ZSBvZiB0aGUgaW5pdCBwaGFzZVxuICogQHBhcmFtIGN1cnJlbnROb2RlSW5kZXggMyBjYXNlcyBkZXBlbmRpbmcgb24gdGhlIHZhbHVlOlxuICogLSB1bmRlZmluZWQ6IGFsbCBob29rcyBmcm9tIHRoZSBhcnJheSBzaG91bGQgYmUgZXhlY3V0ZWQgKHBvc3Qtb3JkZXIgY2FzZSlcbiAqIC0gbnVsbDogZXhlY3V0ZSBob29rcyBvbmx5IGZyb20gdGhlIHNhdmVkIGluZGV4IHVudGlsIHRoZSBlbmQgb2YgdGhlIGFycmF5IChwcmUtb3JkZXIgY2FzZSwgd2hlblxuICogZmx1c2hpbmcgdGhlIHJlbWFpbmluZyBob29rcylcbiAqIC0gbnVtYmVyOiBleGVjdXRlIGhvb2tzIG9ubHkgZnJvbSB0aGUgc2F2ZWQgaW5kZXggdW50aWwgdGhhdCBub2RlIGluZGV4IGV4Y2x1c2l2ZSAocHJlLW9yZGVyXG4gKiBjYXNlLCB3aGVuIGV4ZWN1dGluZyBzZWxlY3QobnVtYmVyKSlcbiAqL1xuZnVuY3Rpb24gY2FsbEhvb2tzKFxuICBjdXJyZW50VmlldzogTFZpZXcsXG4gIGFycjogSG9va0RhdGEsXG4gIGluaXRQaGFzZTogSW5pdFBoYXNlU3RhdGUsXG4gIGN1cnJlbnROb2RlSW5kZXg6IG51bWJlciB8IG51bGwgfCB1bmRlZmluZWQsXG4pOiB2b2lkIHtcbiAgbmdEZXZNb2RlICYmXG4gICAgYXNzZXJ0RXF1YWwoXG4gICAgICBpc0luQ2hlY2tOb0NoYW5nZXNNb2RlKCksXG4gICAgICBmYWxzZSxcbiAgICAgICdIb29rcyBzaG91bGQgbmV2ZXIgYmUgcnVuIHdoZW4gaW4gY2hlY2sgbm8gY2hhbmdlcyBtb2RlLicsXG4gICAgKTtcbiAgY29uc3Qgc3RhcnRJbmRleCA9XG4gICAgY3VycmVudE5vZGVJbmRleCAhPT0gdW5kZWZpbmVkXG4gICAgICA/IGN1cnJlbnRWaWV3W1BSRU9SREVSX0hPT0tfRkxBR1NdICYgUHJlT3JkZXJIb29rRmxhZ3MuSW5kZXhPZlRoZU5leHRQcmVPcmRlckhvb2tNYXNrTWFza1xuICAgICAgOiAwO1xuICBjb25zdCBub2RlSW5kZXhMaW1pdCA9IGN1cnJlbnROb2RlSW5kZXggIT0gbnVsbCA/IGN1cnJlbnROb2RlSW5kZXggOiAtMTtcbiAgY29uc3QgbWF4ID0gYXJyLmxlbmd0aCAtIDE7IC8vIFN0b3AgdGhlIGxvb3AgYXQgbGVuZ3RoIC0gMSwgYmVjYXVzZSB3ZSBsb29rIGZvciB0aGUgaG9vayBhdCBpICsgMVxuICBsZXQgbGFzdE5vZGVJbmRleEZvdW5kID0gMDtcbiAgZm9yIChsZXQgaSA9IHN0YXJ0SW5kZXg7IGkgPCBtYXg7IGkrKykge1xuICAgIGNvbnN0IGhvb2sgPSBhcnJbaSArIDFdIGFzIG51bWJlciB8ICgoKSA9PiB2b2lkKTtcbiAgICBpZiAodHlwZW9mIGhvb2sgPT09ICdudW1iZXInKSB7XG4gICAgICBsYXN0Tm9kZUluZGV4Rm91bmQgPSBhcnJbaV0gYXMgbnVtYmVyO1xuICAgICAgaWYgKGN1cnJlbnROb2RlSW5kZXggIT0gbnVsbCAmJiBsYXN0Tm9kZUluZGV4Rm91bmQgPj0gY3VycmVudE5vZGVJbmRleCkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgaXNJbml0SG9vayA9IChhcnJbaV0gYXMgbnVtYmVyKSA8IDA7XG4gICAgICBpZiAoaXNJbml0SG9vaykge1xuICAgICAgICBjdXJyZW50Vmlld1tQUkVPUkRFUl9IT09LX0ZMQUdTXSArPSBQcmVPcmRlckhvb2tGbGFncy5OdW1iZXJPZkluaXRIb29rc0NhbGxlZEluY3JlbWVudGVyO1xuICAgICAgfVxuICAgICAgaWYgKGxhc3ROb2RlSW5kZXhGb3VuZCA8IG5vZGVJbmRleExpbWl0IHx8IG5vZGVJbmRleExpbWl0ID09IC0xKSB7XG4gICAgICAgIGNhbGxIb29rKGN1cnJlbnRWaWV3LCBpbml0UGhhc2UsIGFyciwgaSk7XG4gICAgICAgIGN1cnJlbnRWaWV3W1BSRU9SREVSX0hPT0tfRkxBR1NdID1cbiAgICAgICAgICAoY3VycmVudFZpZXdbUFJFT1JERVJfSE9PS19GTEFHU10gJiBQcmVPcmRlckhvb2tGbGFncy5OdW1iZXJPZkluaXRIb29rc0NhbGxlZE1hc2spICtcbiAgICAgICAgICBpICtcbiAgICAgICAgICAyO1xuICAgICAgfVxuICAgICAgaSsrO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEV4ZWN1dGVzIGEgc2luZ2xlIGxpZmVjeWNsZSBob29rLCBtYWtpbmcgc3VyZSB0aGF0OlxuICogLSBpdCBpcyBjYWxsZWQgaW4gdGhlIG5vbi1yZWFjdGl2ZSBjb250ZXh0O1xuICogLSBwcm9maWxpbmcgZGF0YSBhcmUgcmVnaXN0ZXJlZC5cbiAqL1xuZnVuY3Rpb24gY2FsbEhvb2tJbnRlcm5hbChkaXJlY3RpdmU6IGFueSwgaG9vazogKCkgPT4gdm9pZCkge1xuICBwcm9maWxlcihQcm9maWxlckV2ZW50LkxpZmVjeWNsZUhvb2tTdGFydCwgZGlyZWN0aXZlLCBob29rKTtcbiAgY29uc3QgcHJldkNvbnN1bWVyID0gc2V0QWN0aXZlQ29uc3VtZXIobnVsbCk7XG4gIHRyeSB7XG4gICAgaG9vay5jYWxsKGRpcmVjdGl2ZSk7XG4gIH0gZmluYWxseSB7XG4gICAgc2V0QWN0aXZlQ29uc3VtZXIocHJldkNvbnN1bWVyKTtcbiAgICBwcm9maWxlcihQcm9maWxlckV2ZW50LkxpZmVjeWNsZUhvb2tFbmQsIGRpcmVjdGl2ZSwgaG9vayk7XG4gIH1cbn1cblxuLyoqXG4gKiBFeGVjdXRlIG9uZSBob29rIGFnYWluc3QgdGhlIGN1cnJlbnQgYExWaWV3YC5cbiAqXG4gKiBAcGFyYW0gY3VycmVudFZpZXcgVGhlIGN1cnJlbnQgdmlld1xuICogQHBhcmFtIGluaXRQaGFzZVN0YXRlIHRoZSBjdXJyZW50IHN0YXRlIG9mIHRoZSBpbml0IHBoYXNlXG4gKiBAcGFyYW0gYXJyIFRoZSBhcnJheSBpbiB3aGljaCB0aGUgaG9va3MgYXJlIGZvdW5kXG4gKiBAcGFyYW0gaSBUaGUgY3VycmVudCBpbmRleCB3aXRoaW4gdGhlIGhvb2sgZGF0YSBhcnJheVxuICovXG5mdW5jdGlvbiBjYWxsSG9vayhjdXJyZW50VmlldzogTFZpZXcsIGluaXRQaGFzZTogSW5pdFBoYXNlU3RhdGUsIGFycjogSG9va0RhdGEsIGk6IG51bWJlcikge1xuICBjb25zdCBpc0luaXRIb29rID0gKGFycltpXSBhcyBudW1iZXIpIDwgMDtcbiAgY29uc3QgaG9vayA9IGFycltpICsgMV0gYXMgKCkgPT4gdm9pZDtcbiAgY29uc3QgZGlyZWN0aXZlSW5kZXggPSBpc0luaXRIb29rID8gLWFycltpXSA6IChhcnJbaV0gYXMgbnVtYmVyKTtcbiAgY29uc3QgZGlyZWN0aXZlID0gY3VycmVudFZpZXdbZGlyZWN0aXZlSW5kZXhdO1xuICBpZiAoaXNJbml0SG9vaykge1xuICAgIGNvbnN0IGluZGV4V2l0aGludEluaXRQaGFzZSA9IGN1cnJlbnRWaWV3W0ZMQUdTXSA+PiBMVmlld0ZsYWdzLkluZGV4V2l0aGluSW5pdFBoYXNlU2hpZnQ7XG4gICAgLy8gVGhlIGluaXQgcGhhc2Ugc3RhdGUgbXVzdCBiZSBhbHdheXMgY2hlY2tlZCBoZXJlIGFzIGl0IG1heSBoYXZlIGJlZW4gcmVjdXJzaXZlbHkgdXBkYXRlZC5cbiAgICBpZiAoXG4gICAgICBpbmRleFdpdGhpbnRJbml0UGhhc2UgPFxuICAgICAgICBjdXJyZW50Vmlld1tQUkVPUkRFUl9IT09LX0ZMQUdTXSA+PiBQcmVPcmRlckhvb2tGbGFncy5OdW1iZXJPZkluaXRIb29rc0NhbGxlZFNoaWZ0ICYmXG4gICAgICAoY3VycmVudFZpZXdbRkxBR1NdICYgTFZpZXdGbGFncy5Jbml0UGhhc2VTdGF0ZU1hc2spID09PSBpbml0UGhhc2VcbiAgICApIHtcbiAgICAgIGN1cnJlbnRWaWV3W0ZMQUdTXSArPSBMVmlld0ZsYWdzLkluZGV4V2l0aGluSW5pdFBoYXNlSW5jcmVtZW50ZXI7XG4gICAgICBjYWxsSG9va0ludGVybmFsKGRpcmVjdGl2ZSwgaG9vayk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGNhbGxIb29rSW50ZXJuYWwoZGlyZWN0aXZlLCBob29rKTtcbiAgfVxufVxuIl19