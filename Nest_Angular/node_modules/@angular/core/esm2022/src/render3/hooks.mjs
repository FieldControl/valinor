/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaG9va3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy9yZW5kZXIzL2hvb2tzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLGtDQUFrQyxDQUFDO0FBWW5FLE9BQU8sRUFBQyxhQUFhLEVBQUUsV0FBVyxFQUFFLGNBQWMsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBRTFFLE9BQU8sRUFBQyxxQkFBcUIsRUFBQyxNQUFNLFVBQVUsQ0FBQztBQUMvQyxPQUFPLEVBQUMsc0JBQXNCLEVBQUMsTUFBTSxpQ0FBaUMsQ0FBQztBQUd2RSxPQUFPLEVBQ0wsS0FBSyxFQUtMLG1CQUFtQixHQUdwQixNQUFNLG1CQUFtQixDQUFDO0FBQzNCLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxZQUFZLENBQUM7QUFFcEMsT0FBTyxFQUFDLHNCQUFzQixFQUFDLE1BQU0sU0FBUyxDQUFDO0FBRS9DOzs7Ozs7Ozs7OztHQVdHO0FBQ0gsTUFBTSxVQUFVLHFCQUFxQixDQUNuQyxjQUFzQixFQUN0QixZQUErQixFQUMvQixLQUFZO0lBRVosU0FBUyxJQUFJLHFCQUFxQixDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzFDLE1BQU0sRUFBQyxXQUFXLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBQyxHQUFHLFlBQVksQ0FBQyxJQUFJLENBQUMsU0FFcEQsQ0FBQztJQUVWLElBQUksV0FBbUMsRUFBRSxDQUFDO1FBQ3hDLE1BQU0sZ0JBQWdCLEdBQUcsc0JBQXNCLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDOUQsQ0FBQyxLQUFLLENBQUMsYUFBYSxLQUFLLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztRQUNwRSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsS0FBSyxFQUFFLENBQUMsQ0FBQyxJ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SyxTQUFTLEVBQ2xFLENBQUM7WUFDRCxXQUFXLENBQUMsS0FBSyxDQUFDLDBEQUE4QyxDQUFDO1lBQ2pFLGdCQUFnQixDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNwQyxDQUFDO0lBQ0gsQ0FBQztTQUFNLENBQUM7UUFDTixnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDcEMsQ0FBQztBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbmltcG9ydCB7c2V0QWN0aXZlQ29uc3VtZXJ9IGZyb20gJ0Bhbmd1bGFyL2NvcmUvcHJpbWl0aXZlcy9zaWduYWxzJztcblxuaW1wb3J0IHtcbiAgQWZ0ZXJDb250ZW50Q2hlY2tlZCxcbiAgQWZ0ZXJDb250ZW50SW5pdCxcbiAgQWZ0ZXJWaWV3Q2hlY2tlZCxcbiAgQWZ0ZXJWaWV3SW5pdCxcbiAgRG9DaGVjayxcbiAgT25DaGFuZ2VzLFxuICBPbkRlc3Ryb3ksXG4gIE9uSW5pdCxcbn0gZnJvbSAnLi4vaW50ZXJmYWNlL2xpZmVjeWNsZV9ob29rcyc7XG5pbXBvcnQge2Fzc2VydERlZmluZWQsIGFzc2VydEVxdWFsLCBhc3NlcnROb3RFcXVhbH0gZnJvbSAnLi4vdXRpbC9hc3NlcnQnO1xuXG5pbXBvcnQge2Fzc2VydEZpcnN0Q3JlYXRlUGFzc30gZnJvbSAnLi9hc3NlcnQnO1xuaW1wb3J0IHtOZ09uQ2hhbmdlc0ZlYXR1cmVJbXBsfSBmcm9tICcuL2ZlYXR1cmVzL25nX29uY2hhbmdlc19mZWF0dXJlJztcbmltcG9ydCB7RGlyZWN0aXZlRGVmfSBmcm9tICcuL2ludGVyZmFjZXMvZGVmaW5pdGlvbic7XG5pbXBvcnQge1ROb2RlfSBmcm9tICcuL2ludGVyZmFjZXMvbm9kZSc7XG5pbXBvcnQge1xuICBGTEFHUyxcbiAgSG9va0RhdGEsXG4gIEluaXRQaGFzZVN0YXRlLFxuICBMVmlldyxcbiAgTFZpZXdGbGFncyxcbiAgUFJFT1JERVJfSE9PS19GTEFHUyxcbiAgUHJlT3JkZXJIb29rRmxhZ3MsXG4gIFRWaWV3LFxufSBmcm9tICcuL2ludGVyZmFjZXMvdmlldyc7XG5pbXBvcnQge3Byb2ZpbGVyfSBmcm9tICcuL3Byb2ZpbGVyJztcbmltcG9ydCB7UHJvZmlsZXJFdmVudH0gZnJvbSAnLi9wcm9maWxlcl90eXBlcyc7XG5pbXBvcnQge2lzSW5DaGVja05vQ2hhbmdlc01vZGV9IGZyb20gJy4vc3RhdGUnO1xuXG4vKipcbiAqIEFkZHMgYWxsIGRpcmVjdGl2ZSBsaWZlY3ljbGUgaG9va3MgZnJvbSB0aGUgZ2l2ZW4gYERpcmVjdGl2ZURlZmAgdG8gdGhlIGdpdmVuIGBUVmlld2AuXG4gKlxuICogTXVzdCBiZSBydW4gKm9ubHkqIG9uIHRoZSBmaXJzdCB0ZW1wbGF0ZSBwYXNzLlxuICpcbiAqIFNldHMgdXAgdGhlIHByZS1vcmRlciBob29rcyBvbiB0aGUgcHJvdmlkZWQgYHRWaWV3YCxcbiAqIHNlZSB7QGxpbmsgSG9va0RhdGF9IGZvciBkZXRhaWxzIGFib3V0IHRoZSBkYXRhIHN0cnVjdHVyZS5cbiAqXG4gKiBAcGFyYW0gZGlyZWN0aXZlSW5kZXggVGhlIGluZGV4IG9mIHRoZSBkaXJlY3RpdmUgaW4gTFZpZXdcbiAqIEBwYXJhbSBkaXJlY3RpdmVEZWYgVGhlIGRlZmluaXRpb24gY29udGFpbmluZyB0aGUgaG9va3MgdG8gc2V0dXAgaW4gdFZpZXdcbiAqIEBwYXJhbSB0VmlldyBUaGUgY3VycmVudCBUVmlld1xuICovXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJQcmVPcmRlckhvb2tzKFxuICBkaXJlY3RpdmVJbmRleDogbnVtYmVyLFxuICBkaXJlY3RpdmVEZWY6IERpcmVjdGl2ZURlZjxhbnk+LFxuICB0VmlldzogVFZpZXcsXG4pOiB2b2lkIHtcbiAgbmdEZXZNb2RlICYmIGFzc2VydEZpcnN0Q3JlYXRlUGFzcyh0Vmlldyk7XG4gIGNvbnN0IHtuZ09uQ2hhbmdlcywgbmdPbkluaXQsIG5nRG9DaGVja30gPSBkaXJlY3RpdmVEZWYudHlwZS5wcm90b3R5cGUgYXMgT25DaGFuZ2VzICZcbiAgICBPbkluaXQgJlxuICAgIERvQ2hlY2s7XG5cbiAgaWYgKG5nT25DaGFuZ2VzIGFzIEZ1bmN0aW9uIHwgdW5kZWZpbmVkKSB7XG4gICAgY29uc3Qgd3JhcHBlZE9uQ2hhbmdlcyA9IE5nT25DaGFuZ2VzRmVhdHVyZUltcGwoZGlyZWN0aXZlRGVmKTtcbiAgICAodFZpZXcucHJlT3JkZXJIb29rcyA/Pz0gW10pLnB1c2goZGlyZWN0aXZlSW5kZXgsIHdyYXBwZWRPbkNoYW5nZXMpO1xuICAgICh0Vmlldy5wcmVPcmRlckNoZWNrSG9va3MgPz89IFtdKS5wdXNoKGRpcmVjdGl2ZUluZGV4LCB3cmFwcGVkT25DaGFuZ2VzKTtcbiAgfVxuXG4gIGlmIChuZ09uSW5pdCkge1xuICAgICh0Vmlldy5wcmVPcmRlckhvb2tzID8/PSBbXSkucHVzaCgwIC0gZGlyZWN0aXZlSW5kZXgsIG5nT25Jbml0KTtcbiAgfVxuXG4gIGlmIChuZ0RvQ2hlY2spIHtcbiAgICAodFZpZXcucHJlT3JkZXJIb29rcyA/Pz0gW10pLnB1c2goZGlyZWN0aXZlSW5kZXgsIG5nRG9DaGVjayk7XG4gICAgKHRWaWV3LnByZU9yZGVyQ2hlY2tIb29rcyA/Pz0gW10pLnB1c2goZGlyZWN0aXZlSW5kZXgsIG5nRG9DaGVjayk7XG4gIH1cbn1cblxuLyoqXG4gKlxuICogTG9vcHMgdGhyb3VnaCB0aGUgZGlyZWN0aXZlcyBvbiB0aGUgcHJvdmlkZWQgYHROb2RlYCBhbmQgcXVldWVzIGhvb2tzIHRvIGJlXG4gKiBydW4gdGhhdCBhcmUgbm90IGluaXRpYWxpemF0aW9uIGhvb2tzLlxuICpcbiAqIFNob3VsZCBiZSBleGVjdXRlZCBkdXJpbmcgYGVsZW1lbnRFbmQoKWAgYW5kIHNpbWlsYXIgdG9cbiAqIHByZXNlcnZlIGhvb2sgZXhlY3V0aW9uIG9yZGVyLiBDb250ZW50LCB2aWV3LCBhbmQgZGVzdHJveSBob29rcyBmb3IgcHJvamVjdGVkXG4gKiBjb21wb25lbnRzIGFuZCBkaXJlY3RpdmVzIG11c3QgYmUgY2FsbGVkICpiZWZvcmUqIHRoZWlyIGhvc3RzLlxuICpcbiAqIFNldHMgdXAgdGhlIGNvbnRlbnQsIHZpZXcsIGFuZCBkZXN0cm95IGhvb2tzIG9uIHRoZSBwcm92aWRlZCBgdFZpZXdgLFxuICogc2VlIHtAbGluayBIb29rRGF0YX0gZm9yIGRldGFpbHMgYWJvdXQgdGhlIGRhdGEgc3RydWN0dXJlLlxuICpcbiAqIE5PVEU6IFRoaXMgZG9lcyBub3Qgc2V0IHVwIGBvbkNoYW5nZXNgLCBgb25Jbml0YCBvciBgZG9DaGVja2AsIHRob3NlIGFyZSBzZXQgdXBcbiAqIHNlcGFyYXRlbHkgYXQgYGVsZW1lbnRTdGFydGAuXG4gKlxuICogQHBhcmFtIHRWaWV3IFRoZSBjdXJyZW50IFRWaWV3XG4gKiBAcGFyYW0gdE5vZGUgVGhlIFROb2RlIHdob3NlIGRpcmVjdGl2ZXMgYXJlIHRvIGJlIHNlYXJjaGVkIGZvciBob29rcyB0byBxdWV1ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJQb3N0T3JkZXJIb29rcyh0VmlldzogVFZpZXcsIHROb2RlOiBUTm9kZSk6IHZvaWQge1xuICBuZ0Rldk1vZGUgJiYgYXNzZXJ0Rmlyc3RDcmVhdGVQYXNzKHRWaWV3KTtcbiAgLy8gSXQncyBuZWNlc3NhcnkgdG8gbG9vcCB0aHJvdWdoIHRoZSBkaXJlY3RpdmVzIGF0IGVsZW1lbnRFbmQoKSAocmF0aGVyIHRoYW4gcHJvY2Vzc2luZyBpblxuICAvLyBkaXJlY3RpdmVDcmVhdGUpIHNvIHdlIGNhbiBwcmVzZXJ2ZSB0aGUgY3VycmVudCBob29rIG9yZGVyLiBDb250ZW50LCB2aWV3LCBhbmQgZGVzdHJveVxuICAvLyBob29rcyBmb3IgcHJvamVjdGVkIGNvbXBvbmVudHMgYW5kIGRpcmVjdGl2ZXMgbXVzdCBiZSBjYWxsZWQgKmJlZm9yZSogdGhlaXIgaG9zdHMuXG4gIGZvciAobGV0IGkgPSB0Tm9kZS5kaXJlY3RpdmVTdGFydCwgZW5kID0gdE5vZGUuZGlyZWN0aXZlRW5kOyBpIDwgZW5kOyBpKyspIHtcbiAgICBjb25zdCBkaXJlY3RpdmVEZWYgPSB0Vmlldy5kYXRhW2ldIGFzIERpcmVjdGl2ZURlZjxhbnk+O1xuICAgIG5nRGV2TW9kZSAmJiBhc3NlcnREZWZpbmVkKGRpcmVjdGl2ZURlZiwgJ0V4cGVjdGluZyBEaXJlY3RpdmVEZWYnKTtcbiAgICBjb25zdCBsaWZlY3ljbGVIb29rczogQWZ0ZXJDb250ZW50SW5pdCAmXG4gICAgICBBZnRlckNvbnRlbnRDaGVja2VkICZcbiAgICAgIEFmdGVyVmlld0luaXQgJlxuICAgICAgQWZ0ZXJWaWV3Q2hlY2tlZCAmXG4gICAgICBPbkRlc3Ryb3kgPSBkaXJlY3RpdmVEZWYudHlwZS5wcm90b3R5cGU7XG4gICAgY29uc3Qge1xuICAgICAgbmdBZnRlckNvbnRlbnRJbml0LFxuICAgICAgbmdBZnRlckNvbnRlbnRDaGVja2VkLFxuICAgICAgbmdBZnRlclZpZXdJbml0LFxuICAgICAgbmdBZnRlclZpZXdDaGVja2VkLFxuICAgICAgbmdPbkRlc3Ryb3ksXG4gICAgfSA9IGxpZmVjeWNsZUhvb2tzO1xuXG4gICAgaWYgKG5nQWZ0ZXJDb250ZW50SW5pdCkge1xuICAgICAgKHRWaWV3LmNvbnRlbnRIb29rcyA/Pz0gW10pLnB1c2goLWksIG5nQWZ0ZXJDb250ZW50SW5pdCk7XG4gICAgfVxuXG4gICAgaWYgKG5nQWZ0ZXJDb250ZW50Q2hlY2tlZCkge1xuICAgICAgKHRWaWV3LmNvbnRlbnRIb29rcyA/Pz0gW10pLnB1c2goaSwgbmdBZnRlckNvbnRlbnRDaGVja2VkKTtcbiAgICAgICh0Vmlldy5jb250ZW50Q2hlY2tIb29rcyA/Pz0gW10pLnB1c2goaSwgbmdBZnRlckNvbnRlbnRDaGVja2VkKTtcbiAgICB9XG5cbiAgICBpZiAobmdBZnRlclZpZXdJbml0KSB7XG4gICAgICAodFZpZXcudmlld0hvb2tzID8/PSBbXSkucHVzaCgtaSwgbmdBZnRlclZpZXdJbml0KTtcbiAgICB9XG5cbiAgICBpZiAobmdBZnRlclZpZXdDaGVja2VkKSB7XG4gICAgICAodFZpZXcudmlld0hvb2tzID8/PSBbXSkucHVzaChpLCBuZ0FmdGVyVmlld0NoZWNrZWQpO1xuICAgICAgKHRWaWV3LnZpZXdDaGVja0hvb2tzID8/PSBbXSkucHVzaChpLCBuZ0FmdGVyVmlld0NoZWNrZWQpO1xuICAgIH1cblxuICAgIGlmIChuZ09uRGVzdHJveSAhPSBudWxsKSB7XG4gICAgICAodFZpZXcuZGVzdHJveUhvb2tzID8/PSBbXSkucHVzaChpLCBuZ09uRGVzdHJveSk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogRXhlY3V0aW5nIGhvb2tzIHJlcXVpcmVzIGNvbXBsZXggbG9naWMgYXMgd2UgbmVlZCB0byBkZWFsIHdpdGggMiBjb25zdHJhaW50cy5cbiAqXG4gKiAxLiBJbml0IGhvb2tzIChuZ09uSW5pdCwgbmdBZnRlckNvbnRlbnRJbml0LCBuZ0FmdGVyVmlld0luaXQpIG11c3QgYWxsIGJlIGV4ZWN1dGVkIG9uY2UgYW5kIG9ubHlcbiAqIG9uY2UsIGFjcm9zcyBtYW55IGNoYW5nZSBkZXRlY3Rpb24gY3ljbGVzLiBUaGlzIG11c3QgYmUgdHJ1ZSBldmVuIGlmIHNvbWUgaG9va3MgdGhyb3csIG9yIGlmXG4gKiBzb21lIHJlY3Vyc2l2ZWx5IHRyaWdnZXIgYSBjaGFuZ2UgZGV0ZWN0aW9uIGN5Y2xlLlxuICogVG8gc29sdmUgdGhhdCwgaXQgaXMgcmVxdWlyZWQgdG8gdHJhY2sgdGhlIHN0YXRlIG9mIHRoZSBleGVjdXRpb24gb2YgdGhlc2UgaW5pdCBob29rcy5cbiAqIFRoaXMgaXMgZG9uZSBieSBzdG9yaW5nIGFuZCBtYWludGFpbmluZyBmbGFncyBpbiB0aGUgdmlldzogdGhlIHtAbGluayBJbml0UGhhc2VTdGF0ZX0sXG4gKiBhbmQgdGhlIGluZGV4IHdpdGhpbiB0aGF0IHBoYXNlLiBUaGV5IGNhbiBiZSBzZWVuIGFzIGEgY3Vyc29yIGluIHRoZSBmb2xsb3dpbmcgc3RydWN0dXJlOlxuICogW1tvbkluaXQxLCBvbkluaXQyXSwgW2FmdGVyQ29udGVudEluaXQxXSwgW2FmdGVyVmlld0luaXQxLCBhZnRlclZpZXdJbml0MiwgYWZ0ZXJWaWV3SW5pdDNdXVxuICogVGhleSBhcmUgc3RvcmVkIGFzIGZsYWdzIGluIExWaWV3W0ZMQUdTXS5cbiAqXG4gKiAyLiBQcmUtb3JkZXIgaG9va3MgY2FuIGJlIGV4ZWN1dGVkIGluIGJhdGNoZXMsIGJlY2F1c2Ugb2YgdGhlIHNlbGVjdCBpbnN0cnVjdGlvbi5cbiAqIFRvIGJlIGFibGUgdG8gcGF1c2UgYW5kIHJlc3VtZSB0aGVpciBleGVjdXRpb24sIHdlIGFsc28gbmVlZCBzb21lIHN0YXRlIGFib3V0IHRoZSBob29rJ3MgYXJyYXlcbiAqIHRoYXQgaXMgYmVpbmcgcHJvY2Vzc2VkOlxuICogLSB0aGUgaW5kZXggb2YgdGhlIG5leHQgaG9vayB0byBiZSBleGVjdXRlZFxuICogLSB0aGUgbnVtYmVyIG9mIGluaXQgaG9va3MgYWxyZWFkeSBmb3VuZCBpbiB0aGUgcHJvY2Vzc2VkIHBhcnQgb2YgdGhlICBhcnJheVxuICogVGhleSBhcmUgc3RvcmVkIGFzIGZsYWdzIGluIExWaWV3W1BSRU9SREVSX0hPT0tfRkxBR1NdLlxuICovXG5cbi8qKlxuICogRXhlY3V0ZXMgcHJlLW9yZGVyIGNoZWNrIGhvb2tzICggT25DaGFuZ2VzLCBEb0NoYW5nZXMpIGdpdmVuIGEgdmlldyB3aGVyZSBhbGwgdGhlIGluaXQgaG9va3Mgd2VyZVxuICogZXhlY3V0ZWQgb25jZS4gVGhpcyBpcyBhIGxpZ2h0IHZlcnNpb24gb2YgZXhlY3V0ZUluaXRBbmRDaGVja1ByZU9yZGVySG9va3Mgd2hlcmUgd2UgY2FuIHNraXAgcmVhZFxuICogLyB3cml0ZSBvZiB0aGUgaW5pdC1ob29rcyByZWxhdGVkIGZsYWdzLlxuICogQHBhcmFtIGxWaWV3IFRoZSBMVmlldyB3aGVyZSBob29rcyBhcmUgZGVmaW5lZFxuICogQHBhcmFtIGhvb2tzIEhvb2tzIHRvIGJlIHJ1blxuICogQHBhcmFtIG5vZGVJbmRleCAzIGNhc2VzIGRlcGVuZGluZyBvbiB0aGUgdmFsdWU6XG4gKiAtIHVuZGVmaW5lZDogYWxsIGhvb2tzIGZyb20gdGhlIGFycmF5IHNob3VsZCBiZSBleGVjdXRlZCAocG9zdC1vcmRlciBjYXNlKVxuICogLSBudWxsOiBleGVjdXRlIGhvb2tzIG9ubHkgZnJvbSB0aGUgc2F2ZWQgaW5kZXggdW50aWwgdGhlIGVuZCBvZiB0aGUgYXJyYXkgKHByZS1vcmRlciBjYXNlLCB3aGVuXG4gKiBmbHVzaGluZyB0aGUgcmVtYWluaW5nIGhvb2tzKVxuICogLSBudW1iZXI6IGV4ZWN1dGUgaG9va3Mgb25seSBmcm9tIHRoZSBzYXZlZCBpbmRleCB1bnRpbCB0aGF0IG5vZGUgaW5kZXggZXhjbHVzaXZlIChwcmUtb3JkZXJcbiAqIGNhc2UsIHdoZW4gZXhlY3V0aW5nIHNlbGVjdChudW1iZXIpKVxuICovXG5leHBvcnQgZnVuY3Rpb24gZXhlY3V0ZUNoZWNrSG9va3MobFZpZXc6IExWaWV3LCBob29rczogSG9va0RhdGEsIG5vZGVJbmRleD86IG51bWJlciB8IG51bGwpIHtcbiAgY2FsbEhvb2tzKGxWaWV3LCBob29rcywgSW5pdFBoYXNlU3RhdGUuSW5pdFBoYXNlQ29tcGxldGVkLCBub2RlSW5kZXgpO1xufVxuXG4vKipcbiAqIEV4ZWN1dGVzIHBvc3Qtb3JkZXIgaW5pdCBhbmQgY2hlY2sgaG9va3MgKG9uZSBvZiBBZnRlckNvbnRlbnRJbml0LCBBZnRlckNvbnRlbnRDaGVja2VkLFxuICogQWZ0ZXJWaWV3SW5pdCwgQWZ0ZXJWaWV3Q2hlY2tlZCkgZ2l2ZW4gYSB2aWV3IHdoZXJlIHRoZXJlIGFyZSBwZW5kaW5nIGluaXQgaG9va3MgdG8gYmUgZXhlY3V0ZWQuXG4gKiBAcGFyYW0gbFZpZXcgVGhlIExWaWV3IHdoZXJlIGhvb2tzIGFyZSBkZWZpbmVkXG4gKiBAcGFyYW0gaG9va3MgSG9va3MgdG8gYmUgcnVuXG4gKiBAcGFyYW0gaW5pdFBoYXNlIEEgcGhhc2UgZm9yIHdoaWNoIGhvb2tzIHNob3VsZCBiZSBydW5cbiAqIEBwYXJhbSBub2RlSW5kZXggMyBjYXNlcyBkZXBlbmRpbmcgb24gdGhlIHZhbHVlOlxuICogLSB1bmRlZmluZWQ6IGFsbCBob29rcyBmcm9tIHRoZSBhcnJheSBzaG91bGQgYmUgZXhlY3V0ZWQgKHBvc3Qtb3JkZXIgY2FzZSlcbiAqIC0gbnVsbDogZXhlY3V0ZSBob29rcyBvbmx5IGZyb20gdGhlIHNhdmVkIGluZGV4IHVudGlsIHRoZSBlbmQgb2YgdGhlIGFycmF5IChwcmUtb3JkZXIgY2FzZSwgd2hlblxuICogZmx1c2hpbmcgdGhlIHJlbWFpbmluZyBob29rcylcbiAqIC0gbnVtYmVyOiBleGVjdXRlIGhvb2tzIG9ubHkgZnJvbSB0aGUgc2F2ZWQgaW5kZXggdW50aWwgdGhhdCBub2RlIGluZGV4IGV4Y2x1c2l2ZSAocHJlLW9yZGVyXG4gKiBjYXNlLCB3aGVuIGV4ZWN1dGluZyBzZWxlY3QobnVtYmVyKSlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGV4ZWN1dGVJbml0QW5kQ2hlY2tIb29rcyhcbiAgbFZpZXc6IExWaWV3LFxuICBob29rczogSG9va0RhdGEsXG4gIGluaXRQaGFzZTogSW5pdFBoYXNlU3RhdGUsXG4gIG5vZGVJbmRleD86IG51bWJlciB8IG51bGwsXG4pIHtcbiAgbmdEZXZNb2RlICYmXG4gICAgYXNzZXJ0Tm90RXF1YWwoXG4gICAgICBpbml0UGhhc2UsXG4gICAgICBJbml0UGhhc2VTdGF0ZS5Jbml0UGhhc2VDb21wbGV0ZWQsXG4gICAgICAnSW5pdCBwcmUtb3JkZXIgaG9va3Mgc2hvdWxkIG5vdCBiZSBjYWxsZWQgbW9yZSB0aGFuIG9uY2UnLFxuICAgICk7XG4gIGlmICgobFZpZXdbRkxBR1NdICYgTFZpZXdGbGFncy5Jbml0UGhhc2VTdGF0ZU1hc2spID09PSBpbml0UGhhc2UpIHtcbiAgICBjYWxsSG9va3MobFZpZXcsIGhvb2tzLCBpbml0UGhhc2UsIG5vZGVJbmRleCk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGluY3JlbWVudEluaXRQaGFzZUZsYWdzKGxWaWV3OiBMVmlldywgaW5pdFBoYXNlOiBJbml0UGhhc2VTdGF0ZSk6IHZvaWQge1xuICBuZ0Rldk1vZGUgJiZcbiAgICBhc3NlcnROb3RFcXVhbChcbiAgICAgIGluaXRQaGFzZSxcbiAgICAgIEluaXRQaGFzZVN0YXRlLkluaXRQaGFzZUNvbXBsZXRlZCxcbiAgICAgICdJbml0IGhvb2tzIHBoYXNlIHNob3VsZCBub3QgYmUgaW5jcmVtZW50ZWQgYWZ0ZXIgYWxsIGluaXQgaG9va3MgaGF2ZSBiZWVuIHJ1bi4nLFxuICAgICk7XG4gIGxldCBmbGFncyA9IGxWaWV3W0ZMQUdTXTtcbiAgaWYgKChmbGFncyAmIExWaWV3RmxhZ3MuSW5pdFBoYXNlU3RhdGVNYXNrKSA9PT0gaW5pdFBoYXNlKSB7XG4gICAgZmxhZ3MgJj0gTFZpZXdGbGFncy5JbmRleFdpdGhpbkluaXRQaGFzZVJlc2V0O1xuICAgIGZsYWdzICs9IExWaWV3RmxhZ3MuSW5pdFBoYXNlU3RhdGVJbmNyZW1lbnRlcjtcbiAgICBsVmlld1tGTEFHU10gPSBmbGFncztcbiAgfVxufVxuXG4vKipcbiAqIENhbGxzIGxpZmVjeWNsZSBob29rcyB3aXRoIHRoZWlyIGNvbnRleHRzLCBza2lwcGluZyBpbml0IGhvb2tzIGlmIGl0J3Mgbm90XG4gKiB0aGUgZmlyc3QgTFZpZXcgcGFzc1xuICpcbiAqIEBwYXJhbSBjdXJyZW50VmlldyBUaGUgY3VycmVudCB2aWV3XG4gKiBAcGFyYW0gYXJyIFRoZSBhcnJheSBpbiB3aGljaCB0aGUgaG9va3MgYXJlIGZvdW5kXG4gKiBAcGFyYW0gaW5pdFBoYXNlU3RhdGUgdGhlIGN1cnJlbnQgc3RhdGUgb2YgdGhlIGluaXQgcGhhc2VcbiAqIEBwYXJhbSBjdXJyZW50Tm9kZUluZGV4IDMgY2FzZXMgZGVwZW5kaW5nIG9uIHRoZSB2YWx1ZTpcbiAqIC0gdW5kZWZpbmVkOiBhbGwgaG9va3MgZnJvbSB0aGUgYXJyYXkgc2hvdWxkIGJlIGV4ZWN1dGVkIChwb3N0LW9yZGVyIGNhc2UpXG4gKiAtIG51bGw6IGV4ZWN1dGUgaG9va3Mgb25seSBmcm9tIHRoZSBzYXZlZCBpbmRleCB1bnRpbCB0aGUgZW5kIG9mIHRoZSBhcnJheSAocHJlLW9yZGVyIGNhc2UsIHdoZW5cbiAqIGZsdXNoaW5nIHRoZSByZW1haW5pbmcgaG9va3MpXG4gKiAtIG51bWJlcjogZXhlY3V0ZSBob29rcyBvbmx5IGZyb20gdGhlIHNhdmVkIGluZGV4IHVudGlsIHRoYXQgbm9kZSBpbmRleCBleGNsdXNpdmUgKHByZS1vcmRlclxuICogY2FzZSwgd2hlbiBleGVjdXRpbmcgc2VsZWN0KG51bWJlcikpXG4gKi9cbmZ1bmN0aW9uIGNhbGxIb29rcyhcbiAgY3VycmVudFZpZXc6IExWaWV3LFxuICBhcnI6IEhvb2tEYXRhLFxuICBpbml0UGhhc2U6IEluaXRQaGFzZVN0YXRlLFxuICBjdXJyZW50Tm9kZUluZGV4OiBudW1iZXIgfCBudWxsIHwgdW5kZWZpbmVkLFxuKTogdm9pZCB7XG4gIG5nRGV2TW9kZSAmJlxuICAgIGFzc2VydEVxdWFsKFxuICAgICAgaXNJbkNoZWNrTm9DaGFuZ2VzTW9kZSgpLFxuICAgICAgZmFsc2UsXG4gICAgICAnSG9va3Mgc2hvdWxkIG5ldmVyIGJlIHJ1biB3aGVuIGluIGNoZWNrIG5vIGNoYW5nZXMgbW9kZS4nLFxuICAgICk7XG4gIGNvbnN0IHN0YXJ0SW5kZXggPVxuICAgIGN1cnJlbnROb2RlSW5kZXggIT09IHVuZGVmaW5lZFxuICAgICAgPyBjdXJyZW50Vmlld1tQUkVPUkRFUl9IT09LX0ZMQUdTXSAmIFByZU9yZGVySG9va0ZsYWdzLkluZGV4T2ZUaGVOZXh0UHJlT3JkZXJIb29rTWFza01hc2tcbiAgICAgIDogMDtcbiAgY29uc3Qgbm9kZUluZGV4TGltaXQgPSBjdXJyZW50Tm9kZUluZGV4ICE9IG51bGwgPyBjdXJyZW50Tm9kZUluZGV4IDogLTE7XG4gIGNvbnN0IG1heCA9IGFyci5sZW5ndGggLSAxOyAvLyBTdG9wIHRoZSBsb29wIGF0IGxlbmd0aCAtIDEsIGJlY2F1c2Ugd2UgbG9vayBmb3IgdGhlIGhvb2sgYXQgaSArIDFcbiAgbGV0IGxhc3ROb2RlSW5kZXhGb3VuZCA9IDA7XG4gIGZvciAobGV0IGkgPSBzdGFydEluZGV4OyBpIDwgbWF4OyBpKyspIHtcbiAgICBjb25zdCBob29rID0gYXJyW2kgKyAxXSBhcyBudW1iZXIgfCAoKCkgPT4gdm9pZCk7XG4gICAgaWYgKHR5cGVvZiBob29rID09PSAnbnVtYmVyJykge1xuICAgICAgbGFzdE5vZGVJbmRleEZvdW5kID0gYXJyW2ldIGFzIG51bWJlcjtcbiAgICAgIGlmIChjdXJyZW50Tm9kZUluZGV4ICE9IG51bGwgJiYgbGFzdE5vZGVJbmRleEZvdW5kID49IGN1cnJlbnROb2RlSW5kZXgpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGlzSW5pdEhvb2sgPSAoYXJyW2ldIGFzIG51bWJlcikgPCAwO1xuICAgICAgaWYgKGlzSW5pdEhvb2spIHtcbiAgICAgICAgY3VycmVudFZpZXdbUFJFT1JERVJfSE9PS19GTEFHU10gKz0gUHJlT3JkZXJIb29rRmxhZ3MuTnVtYmVyT2ZJbml0SG9va3NDYWxsZWRJbmNyZW1lbnRlcjtcbiAgICAgIH1cbiAgICAgIGlmIChsYXN0Tm9kZUluZGV4Rm91bmQgPCBub2RlSW5kZXhMaW1pdCB8fCBub2RlSW5kZXhMaW1pdCA9PSAtMSkge1xuICAgICAgICBjYWxsSG9vayhjdXJyZW50VmlldywgaW5pdFBoYXNlLCBhcnIsIGkpO1xuICAgICAgICBjdXJyZW50Vmlld1tQUkVPUkRFUl9IT09LX0ZMQUdTXSA9XG4gICAgICAgICAgKGN1cnJlbnRWaWV3W1BSRU9SREVSX0hPT0tfRkxBR1NdICYgUHJlT3JkZXJIb29rRmxhZ3MuTnVtYmVyT2ZJbml0SG9va3NDYWxsZWRNYXNrKSArXG4gICAgICAgICAgaSArXG4gICAgICAgICAgMjtcbiAgICAgIH1cbiAgICAgIGkrKztcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBFeGVjdXRlcyBhIHNpbmdsZSBsaWZlY3ljbGUgaG9vaywgbWFraW5nIHN1cmUgdGhhdDpcbiAqIC0gaXQgaXMgY2FsbGVkIGluIHRoZSBub24tcmVhY3RpdmUgY29udGV4dDtcbiAqIC0gcHJvZmlsaW5nIGRhdGEgYXJlIHJlZ2lzdGVyZWQuXG4gKi9cbmZ1bmN0aW9uIGNhbGxIb29rSW50ZXJuYWwoZGlyZWN0aXZlOiBhbnksIGhvb2s6ICgpID0+IHZvaWQpIHtcbiAgcHJvZmlsZXIoUHJvZmlsZXJFdmVudC5MaWZlY3ljbGVIb29rU3RhcnQsIGRpcmVjdGl2ZSwgaG9vayk7XG4gIGNvbnN0IHByZXZDb25zdW1lciA9IHNldEFjdGl2ZUNvbnN1bWVyKG51bGwpO1xuICB0cnkge1xuICAgIGhvb2suY2FsbChkaXJlY3RpdmUpO1xuICB9IGZpbmFsbHkge1xuICAgIHNldEFjdGl2ZUNvbnN1bWVyKHByZXZDb25zdW1lcik7XG4gICAgcHJvZmlsZXIoUHJvZmlsZXJFdmVudC5MaWZlY3ljbGVIb29rRW5kLCBkaXJlY3RpdmUsIGhvb2spO1xuICB9XG59XG5cbi8qKlxuICogRXhlY3V0ZSBvbmUgaG9vayBhZ2FpbnN0IHRoZSBjdXJyZW50IGBMVmlld2AuXG4gKlxuICogQHBhcmFtIGN1cnJlbnRWaWV3IFRoZSBjdXJyZW50IHZpZXdcbiAqIEBwYXJhbSBpbml0UGhhc2VTdGF0ZSB0aGUgY3VycmVudCBzdGF0ZSBvZiB0aGUgaW5pdCBwaGFzZVxuICogQHBhcmFtIGFyciBUaGUgYXJyYXkgaW4gd2hpY2ggdGhlIGhvb2tzIGFyZSBmb3VuZFxuICogQHBhcmFtIGkgVGhlIGN1cnJlbnQgaW5kZXggd2l0aGluIHRoZSBob29rIGRhdGEgYXJyYXlcbiAqL1xuZnVuY3Rpb24gY2FsbEhvb2soY3VycmVudFZpZXc6IExWaWV3LCBpbml0UGhhc2U6IEluaXRQaGFzZVN0YXRlLCBhcnI6IEhvb2tEYXRhLCBpOiBudW1iZXIpIHtcbiAgY29uc3QgaXNJbml0SG9vayA9IChhcnJbaV0gYXMgbnVtYmVyKSA8IDA7XG4gIGNvbnN0IGhvb2sgPSBhcnJbaSArIDFdIGFzICgpID0+IHZvaWQ7XG4gIGNvbnN0IGRpcmVjdGl2ZUluZGV4ID0gaXNJbml0SG9vayA/IC1hcnJbaV0gOiAoYXJyW2ldIGFzIG51bWJlcik7XG4gIGNvbnN0IGRpcmVjdGl2ZSA9IGN1cnJlbnRWaWV3W2RpcmVjdGl2ZUluZGV4XTtcbiAgaWYgKGlzSW5pdEhvb2spIHtcbiAgICBjb25zdCBpbmRleFdpdGhpbnRJbml0UGhhc2UgPSBjdXJyZW50Vmlld1tGTEFHU10gPj4gTFZpZXdGbGFncy5JbmRleFdpdGhpbkluaXRQaGFzZVNoaWZ0O1xuICAgIC8vIFRoZSBpbml0IHBoYXNlIHN0YXRlIG11c3QgYmUgYWx3YXlzIGNoZWNrZWQgaGVyZSBhcyBpdCBtYXkgaGF2ZSBiZWVuIHJlY3Vyc2l2ZWx5IHVwZGF0ZWQuXG4gICAgaWYgKFxuICAgICAgaW5kZXhXaXRoaW50SW5pdFBoYXNlIDxcbiAgICAgICAgY3VycmVudFZpZXdbUFJFT1JERVJfSE9PS19GTEFHU10gPj4gUHJlT3JkZXJIb29rRmxhZ3MuTnVtYmVyT2ZJbml0SG9va3NDYWxsZWRTaGlmdCAmJlxuICAgICAgKGN1cnJlbnRWaWV3W0ZMQUdTXSAmIExWaWV3RmxhZ3MuSW5pdFBoYXNlU3RhdGVNYXNrKSA9PT0gaW5pdFBoYXNlXG4gICAgKSB7XG4gICAgICBjdXJyZW50Vmlld1tGTEFHU10gKz0gTFZpZXdGbGFncy5JbmRleFdpdGhpbkluaXRQaGFzZUluY3JlbWVudGVyO1xuICAgICAgY2FsbEhvb2tJbnRlcm5hbChkaXJlY3RpdmUsIGhvb2spO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBjYWxsSG9va0ludGVybmFsKGRpcmVjdGl2ZSwgaG9vayk7XG4gIH1cbn1cbiJdfQ==