/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { consumerAfterComputation, consumerBeforeComputation, consumerDestroy, consumerPollProducersForChange, getActiveConsumer, } from '@angular/core/primitives/signals';
import { RuntimeError } from '../../errors';
import { assertDefined, assertEqual } from '../../util/assert';
import { executeCheckHooks, executeInitAndCheckHooks, incrementInitPhaseFlags } from '../hooks';
import { CONTAINER_HEADER_OFFSET, LContainerFlags, MOVED_VIEWS } from '../interfaces/container';
import { CONTEXT, EFFECTS_TO_SCHEDULE, ENVIRONMENT, FLAGS, REACTIVE_TEMPLATE_CONSUMER, TVIEW, } from '../interfaces/view';
import { getOrCreateTemporaryConsumer, getOrBorrowReactiveLViewConsumer, maybeReturnReactiveLViewConsumer, viewShouldHaveReactiveConsumer, } from '../reactive_lview_consumer';
import { CheckNoChangesMode, enterView, isExhaustiveCheckNoChanges, isInCheckNoChangesMode, isRefreshingViews, leaveView, setBindingIndex, setIsInCheckNoChangesMode, setIsRefreshingViews, } from '../state';
import { getFirstLContainer, getNextLContainer } from '../util/view_traversal_utils';
import { getComponentLViewByIndex, isCreationMode, markAncestorsForTraversal, markViewForRefresh, requiresRefreshOrTraversal, resetPreOrderHookFlags, viewAttachedToChangeDetector, } from '../util/view_utils';
import { executeTemplate, executeViewQueryFn, handleError, processHostBindingOpCodes, refreshContentQueries, } from './shared';
/**
 * The maximum number of times the change detection traversal will rerun before throwing an error.
 */
export const MAXIMUM_REFRESH_RERUNS = 100;
export function detectChangesInternal(lView, notifyErrorHandler = true, mode = 0 /* ChangeDetectionMode.Global */) {
    const environment = lView[ENVIRONMENT];
    const rendererFactory = environment.rendererFactory;
    // Check no changes mode is a dev only mode used to verify that bindings have not changed
    // since they were assigned. We do not want to invoke renderer factory functions in that mode
    // to avoid any possible side-effects.
    const checkNoChangesMode = !!ngDevMode && isInCheckNoChangesMode();
    if (!checkNoChangesMode) {
        rendererFactory.begin?.();
    }
    try {
        detectChangesInViewWhileDirty(lView, mode);
    }
    catch (error) {
        if (notifyErrorHandler) {
            handleError(lView, error);
        }
        throw error;
    }
    finally {
        if (!checkNoChangesMode) {
            rendererFactory.end?.();
            // One final flush of the effects queue to catch any effects created in `ngAfterViewInit` or
            // other post-order hooks.
            environment.inlineEffectRunner?.flush();
        }
    }
}
function detectChangesInViewWhileDirty(lView, mode) {
    const lastIsRefreshingViewsValue = isRefreshingViews();
    try {
        setIsRefreshingViews(true);
        detectChangesInView(lView, mode);
        // We don't need or want to do any looping when in exhaustive checkNoChanges because we
        // already traverse all the views and nothing should change so we shouldn't have to do
        // another pass to pick up new changes.
        if (ngDevMode && isExhaustiveCheckNoChanges()) {
            return;
        }
        let retries = 0;
        // If after running change detection, this view still needs to be refreshed or there are
        // descendants views that need to be refreshed due to re-dirtying during the change detection
        // run, detect changes on the view again. We run change detection in `Targeted` mode to only
        // refresh views with the `RefreshView` flag.
        while (requiresRefreshOrTraversal(lView)) {
            if (retries === MAXIMUM_REFRESH_RERUNS) {
                throw new RuntimeError(103 /* RuntimeErrorCode.INFINITE_CHANGE_DETECTION */, ngDevMode &&
                    'Infinite change detection while trying to refresh views. ' +
                        'There may be components which each cause the other to require a refresh, ' +
                        'causing an infinite loop.');
            }
            retries++;
            // Even if this view is detached, we still detect changes in targeted mode because this was
            // the root of the change detection run.
            detectChangesInView(lView, 1 /* ChangeDetectionMode.Targeted */);
        }
    }
    finally {
        // restore state to what it was before entering this change detection loop
        setIsRefreshingViews(lastIsRefreshingViewsValue);
    }
}
export function checkNoChangesInternal(lView, mode, notifyErrorHandler = true) {
    setIsInCheckNoChangesMode(mode);
    try {
        detectChangesInternal(lView, notifyErrorHandler);
    }
    finally {
        setIsInCheckNoChangesMode(CheckNoChangesMode.Off);
    }
}
/**
 * Processes a view in update mode. This includes a number of steps in a specific order:
 * - executing a template function in update mode;
 * - executing hooks;
 * - refreshing queries;
 * - setting host bindings;
 * - refreshing child (embedded and component) views.
 */
export function refreshView(tView, lView, templateFn, context) {
    ngDevMode && assertEqual(isCreationMode(lView), false, 'Should be run in update mode');
    const flags = lView[FLAGS];
    if ((flags & 256 /* LViewFlags.Destroyed */) === 256 /* LViewFlags.Destroyed */)
        return;
    // Check no changes mode is a dev only mode used to verify that bindings have not changed
    // since they were assigned. We do not want to execute lifecycle hooks in that mode.
    const isInCheckNoChangesPass = ngDevMode && isInCheckNoChangesMode();
    const isInExhaustiveCheckNoChangesPass = ngDevMode && isExhaustiveCheckNoChanges();
    !isInCheckNoChangesPass && lView[ENVIRONMENT].inlineEffectRunner?.flush();
    // Start component reactive context
    // - We might already be in a reactive context if this is an embedded view of the host.
    // - We might be descending into a view that needs a consumer.
    enterView(lView);
    let returnConsumerToPool = true;
    let prevConsumer = null;
    let currentConsumer = null;
    if (!isInCheckNoChangesPass) {
        if (viewShouldHaveReactiveConsumer(tView)) {
            currentConsumer = getOrBorrowReactiveLViewConsumer(lView);
            prevConsumer = consumerBeforeComputation(currentConsumer);
        }
        else if (getActiveConsumer() === null) {
            // If the current view should not have a reactive consumer but we don't have an active consumer,
            // we still need to create a temporary consumer to track any signal reads in this template.
            // This is a rare case that can happen with `viewContainerRef.createEmbeddedView(...).detectChanges()`.
            // This temporary consumer marks the first parent that _should_ have a consumer for refresh.
            // Once that refresh happens, the signals will be tracked in the parent consumer and we can destroy
            // the temporary one.
            returnConsumerToPool = false;
            currentConsumer = getOrCreateTemporaryConsumer(lView);
            prevConsumer = consumerBeforeComputation(currentConsumer);
        }
        else if (lView[REACTIVE_TEMPLATE_CONSUMER]) {
            consumerDestroy(lView[REACTIVE_TEMPLATE_CONSUMER]);
            lView[REACTIVE_TEMPLATE_CONSUMER] = null;
        }
    }
    try {
        resetPreOrderHookFlags(lView);
        setBindingIndex(tView.bindingStartIndex);
        if (templateFn !== null) {
            executeTemplate(tView, lView, templateFn, 2 /* RenderFlags.Update */, context);
        }
        const hooksInitPhaseCompleted = (flags & 3 /* LViewFlags.InitPhaseStateMask */) === 3 /* InitPhaseState.InitPhaseCompleted */;
        // execute pre-order hooks (OnInit, OnChanges, DoCheck)
        // PERF WARNING: do NOT extract this to a separate function without running benchmarks
        if (!isInCheckNoChangesPass) {
            if (hooksInitPhaseCompleted) {
                const preOrderCheckHooks = tView.preOrderCheckHooks;
                if (preOrderCheckHooks !== null) {
                    executeCheckHooks(lView, preOrderCheckHooks, null);
                }
            }
            else {
                const preOrderHooks = tView.preOrderHooks;
                if (preOrderHooks !== null) {
                    executeInitAndCheckHooks(lView, preOrderHooks, 0 /* InitPhaseState.OnInitHooksToBeRun */, null);
                }
                incrementInitPhaseFlags(lView, 0 /* InitPhaseState.OnInitHooksToBeRun */);
            }
        }
        // We do not need to mark transplanted views for refresh when doing exhaustive checks
        // because all views will be reached anyways during the traversal.
        if (!isInExhaustiveCheckNoChangesPass) {
            // First mark transplanted views that are declared in this lView as needing a refresh at their
            // insertion points. This is needed to avoid the situation where the template is defined in this
            // `LView` but its declaration appears after the insertion component.
            markTransplantedViewsForRefresh(lView);
        }
        detectChangesInEmbeddedViews(lView, 0 /* ChangeDetectionMode.Global */);
        // Content query results must be refreshed before content hooks are called.
        if (tView.contentQueries !== null) {
            refreshContentQueries(tView, lView);
        }
        // execute content hooks (AfterContentInit, AfterContentChecked)
        // PERF WARNING: do NOT extract this to a separate function without running benchmarks
        if (!isInCheckNoChangesPass) {
            if (hooksInitPhaseCompleted) {
                const contentCheckHooks = tView.contentCheckHooks;
                if (contentCheckHooks !== null) {
                    executeCheckHooks(lView, contentCheckHooks);
                }
            }
            else {
                const contentHooks = tView.contentHooks;
                if (contentHooks !== null) {
                    executeInitAndCheckHooks(lView, contentHooks, 1 /* InitPhaseState.AfterContentInitHooksToBeRun */);
                }
                incrementInitPhaseFlags(lView, 1 /* InitPhaseState.AfterContentInitHooksToBeRun */);
            }
        }
        processHostBindingOpCodes(tView, lView);
        // Refresh child component views.
        const components = tView.components;
        if (components !== null) {
            detectChangesInChildComponents(lView, components, 0 /* ChangeDetectionMode.Global */);
        }
        // View queries must execute after refreshing child components because a template in this view
        // could be inserted in a child component. If the view query executes before child component
        // refresh, the template might not yet be inserted.
        const viewQuery = tView.viewQuery;
        if (viewQuery !== null) {
            executeViewQueryFn(2 /* RenderFlags.Update */, viewQuery, context);
        }
        // execute view hooks (AfterViewInit, AfterViewChecked)
        // PERF WARNING: do NOT extract this to a separate function without running benchmarks
        if (!isInCheckNoChangesPass) {
            if (hooksInitPhaseCompleted) {
                const viewCheckHooks = tView.viewCheckHooks;
                if (viewCheckHooks !== null) {
                    executeCheckHooks(lView, viewCheckHooks);
                }
            }
            else {
                const viewHooks = tView.viewHooks;
                if (viewHooks !== null) {
                    executeInitAndCheckHooks(lView, viewHooks, 2 /* InitPhaseState.AfterViewInitHooksToBeRun */);
                }
                incrementInitPhaseFlags(lView, 2 /* InitPhaseState.AfterViewInitHooksToBeRun */);
            }
        }
        if (tView.firstUpdatePass === true) {
            // We need to make sure that we only flip the flag on successful `refreshView` only
            // Don't do this in `finally` block.
            // If we did this in `finally` block then an exception could block the execution of styling
            // instructions which in turn would be unable to insert themselves into the styling linked
            // list. The result of this would be that if the exception would not be throw on subsequent CD
            // the styling would be unable to process it data and reflect to the DOM.
            tView.firstUpdatePass = false;
        }
        // Schedule any effects that are waiting on the update pass of this view.
        if (lView[EFFECTS_TO_SCHEDULE]) {
            for (const notifyEffect of lView[EFFECTS_TO_SCHEDULE]) {
                notifyEffect();
            }
            // Once they've been run, we can drop the array.
            lView[EFFECTS_TO_SCHEDULE] = null;
        }
        // Do not reset the dirty state when running in check no changes mode. We don't want components
        // to behave differently depending on whether check no changes is enabled or not. For example:
        // Marking an OnPush component as dirty from within the `ngAfterViewInit` hook in order to
        // refresh a `NgClass` binding should work. If we would reset the dirty state in the check
        // no changes cycle, the component would be not be dirty for the next update pass. This would
        // be different in production mode where the component dirty state is not reset.
        if (!isInCheckNoChangesPass) {
            lView[FLAGS] &= ~(64 /* LViewFlags.Dirty */ | 8 /* LViewFlags.FirstLViewPass */);
        }
    }
    catch (e) {
        if (!isInCheckNoChangesPass) {
            // If refreshing a view causes an error, we need to remark the ancestors as needing traversal
            // because the error might have caused a situation where views below the current location are
            // dirty but will be unreachable because the "has dirty children" flag in the ancestors has been
            // cleared during change detection and we failed to run to completion.
            markAncestorsForTraversal(lView);
        }
        throw e;
    }
    finally {
        if (currentConsumer !== null) {
            consumerAfterComputation(currentConsumer, prevConsumer);
            if (returnConsumerToPool) {
                maybeReturnReactiveLViewConsumer(currentConsumer);
            }
        }
        leaveView();
    }
}
/**
 * Goes over embedded views (ones created through ViewContainerRef APIs) and refreshes
 * them by executing an associated template function.
 */
function detectChangesInEmbeddedViews(lView, mode) {
    for (let lContainer = getFirstLContainer(lView); lContainer !== null; lContainer = getNextLContainer(lContainer)) {
        for (let i = CONTAINER_HEADER_OFFSET; i < lContainer.length; i++) {
            const embeddedLView = lContainer[i];
            detectChangesInViewIfAttached(embeddedLView, mode);
        }
    }
}
/**
 * Mark transplanted views as needing to be refreshed at their attachment points.
 *
 * @param lView The `LView` that may have transplanted views.
 */
function markTransplantedViewsForRefresh(lView) {
    for (let lContainer = getFirstLContainer(lView); lContainer !== null; lContainer = getNextLContainer(lContainer)) {
        if (!(lContainer[FLAGS] & LContainerFlags.HasTransplantedViews))
            continue;
        const movedViews = lContainer[MOVED_VIEWS];
        ngDevMode && assertDefined(movedViews, 'Transplanted View flags set but missing MOVED_VIEWS');
        for (let i = 0; i < movedViews.length; i++) {
            const movedLView = movedViews[i];
            markViewForRefresh(movedLView);
        }
    }
}
/**
 * Detects changes in a component by entering the component view and processing its bindings,
 * queries, etc. if it is CheckAlways, OnPush and Dirty, etc.
 *
 * @param componentHostIdx  Element index in LView[] (adjusted for HEADER_OFFSET)
 */
function detectChangesInComponent(hostLView, componentHostIdx, mode) {
    ngDevMode && assertEqual(isCreationMode(hostLView), false, 'Should be run in update mode');
    const componentView = getComponentLViewByIndex(componentHostIdx, hostLView);
    detectChangesInViewIfAttached(componentView, mode);
}
/**
 * Visits a view as part of change detection traversal.
 *
 * If the view is detached, no additional traversal happens.
 */
function detectChangesInViewIfAttached(lView, mode) {
    if (!viewAttachedToChangeDetector(lView)) {
        return;
    }
    detectChangesInView(lView, mode);
}
/**
 * Visits a view as part of change detection traversal.
 *
 * The view is refreshed if:
 * - If the view is CheckAlways or Dirty and ChangeDetectionMode is `Global`
 * - If the view has the `RefreshView` flag
 *
 * The view is not refreshed, but descendants are traversed in `ChangeDetectionMode.Targeted` if the
 * view HasChildViewsToRefresh flag is set.
 */
function detectChangesInView(lView, mode) {
    const isInCheckNoChangesPass = ngDevMode && isInCheckNoChangesMode();
    const tView = lView[TVIEW];
    const flags = lView[FLAGS];
    const consumer = lView[REACTIVE_TEMPLATE_CONSUMER];
    // Refresh CheckAlways views in Global mode.
    let shouldRefreshView = !!(mode === 0 /* ChangeDetectionMode.Global */ && flags & 16 /* LViewFlags.CheckAlways */);
    // Refresh Dirty views in Global mode, as long as we're not in checkNoChanges.
    // CheckNoChanges never worked with `OnPush` components because the `Dirty` flag was
    // cleared before checkNoChanges ran. Because there is now a loop for to check for
    // backwards views, it gives an opportunity for `OnPush` components to be marked `Dirty`
    // before the CheckNoChanges pass. We don't want existing errors that are hidden by the
    // current CheckNoChanges bug to surface when making unrelated changes.
    shouldRefreshView ||= !!(flags & 64 /* LViewFlags.Dirty */ &&
        mode === 0 /* ChangeDetectionMode.Global */ &&
        !isInCheckNoChangesPass);
    // Always refresh views marked for refresh, regardless of mode.
    shouldRefreshView ||= !!(flags & 1024 /* LViewFlags.RefreshView */);
    // Refresh views when they have a dirty reactive consumer, regardless of mode.
    shouldRefreshView ||= !!(consumer?.dirty && consumerPollProducersForChange(consumer));
    shouldRefreshView ||= !!(ngDevMode && isExhaustiveCheckNoChanges());
    // Mark the Flags and `ReactiveNode` as not dirty before refreshing the component, so that they
    // can be re-dirtied during the refresh process.
    if (consumer) {
        consumer.dirty = false;
    }
    lView[FLAGS] &= ~(8192 /* LViewFlags.HasChildViewsToRefresh */ | 1024 /* LViewFlags.RefreshView */);
    if (shouldRefreshView) {
        refreshView(tView, lView, tView.template, lView[CONTEXT]);
    }
    else if (flags & 8192 /* LViewFlags.HasChildViewsToRefresh */) {
        detectChangesInEmbeddedViews(lView, 1 /* ChangeDetectionMode.Targeted */);
        const components = tView.components;
        if (components !== null) {
            detectChangesInChildComponents(lView, components, 1 /* ChangeDetectionMode.Targeted */);
        }
    }
}
/** Refreshes child components in the current view (update mode). */
function detectChangesInChildComponents(hostLView, components, mode) {
    for (let i = 0; i < components.length; i++) {
        detectChangesInComponent(hostLView, components[i], mode);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhbmdlX2RldGVjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc3JjL3JlbmRlcjMvaW5zdHJ1Y3Rpb25zL2NoYW5nZV9kZXRlY3Rpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUNMLHdCQUF3QixFQUN4Qix5QkFBeUIsRUFDekIsZUFBZSxFQUNmLDhCQUE4QixFQUM5QixpQkFBaUIsR0FFbEIsTUFBTSxrQ0FBa0MsQ0FBQztBQUUxQyxPQUFPLEVBQUMsWUFBWSxFQUFtQixNQUFNLGNBQWMsQ0FBQztBQUM1RCxPQUFPLEVBQUMsYUFBYSxFQUFFLFdBQVcsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQzdELE9BQU8sRUFBQyxpQkFBaUIsRUFBRSx3QkFBd0IsRUFBRSx1QkFBdUIsRUFBQyxNQUFNLFVBQVUsQ0FBQztBQUM5RixPQUFPLEVBQUMsdUJBQXVCLEVBQUUsZUFBZSxFQUFFLFdBQVcsRUFBQyxNQUFNLHlCQUF5QixDQUFDO0FBRTlGLE9BQU8sRUFDTCxPQUFPLEVBQ1AsbUJBQW1CLEVBQ25CLFdBQVcsRUFDWCxLQUFLLEVBSUwsMEJBQTBCLEVBQzFCLEtBQUssR0FFTixNQUFNLG9CQUFvQixDQUFDO0FBQzVCLE9BQU8sRUFDTCw0QkFBNEIsRUFDNUIsZ0NBQWdDLEVBQ2hDLGdDQUFnQyxFQUVoQyw4QkFBOEIsR0FDL0IsTUFBTSw0QkFBNEIsQ0FBQztBQUNwQyxPQUFPLEVBQ0wsa0JBQWtCLEVBQ2xCLFNBQVMsRUFDVCwwQkFBMEIsRUFDMUIsc0JBQXNCLEVBQ3RCLGlCQUFpQixFQUNqQixTQUFTLEVBQ1QsZUFBZSxFQUNmLHlCQUF5QixFQUN6QixvQkFBb0IsR0FDckIsTUFBTSxVQUFVLENBQUM7QUFDbEIsT0FBTyxFQUFDLGtCQUFrQixFQUFFLGlCQUFpQixFQUFDLE1BQU0sOEJBQThCLENBQUM7QUFDbkYs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QUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7UUFDM0Msd0JBQXdCLENBQUMsU0FBUyxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUMzRCxDQUFDO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtcbiAgY29uc3VtZXJBZnRlckNvbXB1dGF0aW9uLFxuICBjb25zdW1lckJlZm9yZUNvbXB1dGF0aW9uLFxuICBjb25zdW1lckRlc3Ryb3ksXG4gIGNvbnN1bWVyUG9sbFByb2R1Y2Vyc0ZvckNoYW5nZSxcbiAgZ2V0QWN0aXZlQ29uc3VtZXIsXG4gIFJlYWN0aXZlTm9kZSxcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZS9wcmltaXRpdmVzL3NpZ25hbHMnO1xuXG5pbXBvcnQge1J1bnRpbWVFcnJvciwgUnVudGltZUVycm9yQ29kZX0gZnJvbSAnLi4vLi4vZXJyb3JzJztcbmltcG9ydCB7YXNzZXJ0RGVmaW5lZCwgYXNzZXJ0RXF1YWx9IGZyb20gJy4uLy4uL3V0aWwvYXNzZXJ0JztcbmltcG9ydCB7ZXhlY3V0ZUNoZWNrSG9va3MsIGV4ZWN1dGVJbml0QW5kQ2hlY2tIb29rcywgaW5jcmVtZW50SW5pdFBoYXNlRmxhZ3N9IGZyb20gJy4uL2hvb2tzJztcbmltcG9ydCB7Q09OVEFJTkVSX0hFQURFUl9PRkZTRVQsIExDb250YWluZXJGbGFncywgTU9WRURfVklFV1N9IGZyb20gJy4uL2ludGVyZmFjZXMvY29udGFpbmVyJztcbmltcG9ydCB7Q29tcG9uZW50VGVtcGxhdGUsIFJlbmRlckZsYWdzfSBmcm9tICcuLi9pbnRlcmZhY2VzL2RlZmluaXRpb24nO1xuaW1wb3J0IHtcbiAgQ09OVEVYVCxcbiAgRUZGRUNUU19UT19TQ0hFRFVMRSxcbiAgRU5WSVJPTk1FTlQsXG4gIEZMQUdTLFxuICBJbml0UGhhc2VTdGF0ZSxcbiAgTFZpZXcsXG4gIExWaWV3RmxhZ3MsXG4gIFJFQUNUSVZFX1RFTVBMQVRFX0NPTlNVTUVSLFxuICBUVklFVyxcbiAgVFZpZXcsXG59IGZyb20gJy4uL2ludGVyZmFjZXMvdmlldyc7XG5pbXBvcnQge1xuICBnZXRPckNyZWF0ZVRlbXBvcmFyeUNvbnN1bWVyLFxuICBnZXRPckJvcnJvd1JlYWN0aXZlTFZpZXdDb25zdW1lcixcbiAgbWF5YmVSZXR1cm5SZWFjdGl2ZUxWaWV3Q29uc3VtZXIsXG4gIFJlYWN0aXZlTFZpZXdDb25zdW1lcixcbiAgdmlld1Nob3VsZEhhdmVSZWFjdGl2ZUNvbnN1bWVyLFxufSBmcm9tICcuLi9yZWFjdGl2ZV9sdmlld19jb25zdW1lcic7XG5pbXBvcnQge1xuICBDaGVja05vQ2hhbmdlc01vZGUsXG4gIGVudGVyVmlldyxcbiAgaXNFeGhhdXN0aXZlQ2hlY2tOb0NoYW5nZXMsXG4gIGlzSW5DaGVja05vQ2hhbmdlc01vZGUsXG4gIGlzUmVmcmVzaGluZ1ZpZXdzLFxuICBsZWF2ZVZpZXcsXG4gIHNldEJpbmRpbmdJbmRleCxcbiAgc2V0SXNJbkNoZWNrTm9DaGFuZ2VzTW9kZSxcbiAgc2V0SXNSZWZyZXNoaW5nVmlld3MsXG59IGZyb20gJy4uL3N0YXRlJztcbmltcG9ydCB7Z2V0Rmlyc3RMQ29udGFpbmVyLCBnZXROZXh0TENvbnRhaW5lcn0gZnJvbSAnLi4vdXRpbC92aWV3X3RyYXZlcnNhbF91dGlscyc7XG5pbXBvcnQge1xuICBnZXRDb21wb25lbnRMVmlld0J5SW5kZXgsXG4gIGlzQ3JlYXRpb25Nb2RlLFxuICBtYXJrQW5jZXN0b3JzRm9yVHJhdmVyc2FsLFxuICBtYXJrVmlld0ZvclJlZnJlc2gsXG4gIHJlcXVpcmVzUmVmcmVzaE9yVHJhdmVyc2FsLFxuICByZXNldFByZU9yZGVySG9va0ZsYWdzLFxuICB2aWV3QXR0YWNoZWRUb0NoYW5nZURldGVjdG9yLFxufSBmcm9tICcuLi91dGlsL3ZpZXdfdXRpbHMnO1xuXG5pbXBvcnQge1xuICBleGVjdXRlVGVtcGxhdGUsXG4gIGV4ZWN1dGVWaWV3UXVlcnlGbixcbiAgaGFuZGxlRXJyb3IsXG4gIHByb2Nlc3NIb3N0QmluZGluZ09wQ29kZXMsXG4gIHJlZnJlc2hDb250ZW50UXVlcmllcyxcbn0gZnJvbSAnLi9zaGFyZWQnO1xuXG4vKipcbiAqIFRoZSBtYXhpbXVtIG51bWJlciBvZiB0aW1lcyB0aGUgY2hhbmdlIGRldGVjdGlvbiB0cmF2ZXJzYWwgd2lsbCByZXJ1biBiZWZvcmUgdGhyb3dpbmcgYW4gZXJyb3IuXG4gKi9cbmV4cG9ydCBjb25zdCBNQVhJTVVNX1JFRlJFU0hfUkVSVU5TID0gMTAwO1xuXG5leHBvcnQgZnVuY3Rpb24gZGV0ZWN0Q2hhbmdlc0ludGVybmFsKFxuICBsVmlldzogTFZpZXcsXG4gIG5vdGlmeUVycm9ySGFuZGxlciA9IHRydWUsXG4gIG1vZGUgPSBDaGFuZ2VEZXRlY3Rpb25Nb2RlLkdsb2JhbCxcbikge1xuICBjb25zdCBlbnZpcm9ubWVudCA9IGxWaWV3W0VOVklST05NRU5UXTtcbiAgY29uc3QgcmVuZGVyZXJGYWN0b3J5ID0gZW52aXJvbm1lbnQucmVuZGVyZXJGYWN0b3J5O1xuXG4gIC8vIENoZWNrIG5vIGNoYW5nZXMgbW9kZSBpcyBhIGRldiBvbmx5IG1vZGUgdXNlZCB0byB2ZXJpZnkgdGhhdCBiaW5kaW5ncyBoYXZlIG5vdCBjaGFuZ2VkXG4gIC8vIHNpbmNlIHRoZXkgd2VyZSBhc3NpZ25lZC4gV2UgZG8gbm90IHdhbnQgdG8gaW52b2tlIHJlbmRlcmVyIGZhY3RvcnkgZnVuY3Rpb25zIGluIHRoYXQgbW9kZVxuICAvLyB0byBhdm9pZCBhbnkgcG9zc2libGUgc2lkZS1lZmZlY3RzLlxuICBjb25zdCBjaGVja05vQ2hhbmdlc01vZGUgPSAhIW5nRGV2TW9kZSAmJiBpc0luQ2hlY2tOb0NoYW5nZXNNb2RlKCk7XG5cbiAgaWYgKCFjaGVja05vQ2hhbmdlc01vZGUpIHtcbiAgICByZW5kZXJlckZhY3RvcnkuYmVnaW4/LigpO1xuICB9XG5cbiAgdHJ5IHtcbiAgICBkZXRlY3RDaGFuZ2VzSW5WaWV3V2hpbGVEaXJ0eShsVmlldywgbW9kZSk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgaWYgKG5vdGlmeUVycm9ySGFuZGxlcikge1xuICAgICAgaGFuZGxlRXJyb3IobFZpZXcsIGVycm9yKTtcbiAgICB9XG4gICAgdGhyb3cgZXJyb3I7XG4gIH0gZmluYWxseSB7XG4gICAgaWYgKCFjaGVja05vQ2hhbmdlc01vZGUpIHtcbiAgICAgIHJlbmRlcmVyRmFjdG9yeS5lbmQ/LigpO1xuXG4gICAgICAvLyBPbmUgZmluYWwgZmx1c2ggb2YgdGhlIGVmZmVjdHMgcXVldWUgdG8gY2F0Y2ggYW55IGVmZmVjdHMgY3JlYXRlZCBpbiBgbmdBZnRlclZpZXdJbml0YCBvclxuICAgICAgLy8gb3RoZXIgcG9zdC1vcmRlciBob29rcy5cbiAgICAgIGVudmlyb25tZW50LmlubGluZUVmZmVjdFJ1bm5lcj8uZmx1c2goKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gZGV0ZWN0Q2hhbmdlc0luVmlld1doaWxlRGlydHkobFZpZXc6IExWaWV3LCBtb2RlOiBDaGFuZ2VEZXRlY3Rpb25Nb2RlKSB7XG4gIGNvbnN0IGxhc3RJc1JlZnJlc2hpbmdWaWV3c1ZhbHVlID0gaXNSZWZyZXNoaW5nVmlld3MoKTtcbiAgdHJ5IHtcbiAgICBzZXRJc1JlZnJlc2hpbmdWaWV3cyh0cnVlKTtcbiAgICBkZXRlY3RDaGFuZ2VzSW5WaWV3KGxWaWV3LCBtb2RlKTtcblxuICAgIC8vIFdlIGRvbid0IG5lZWQgb3Igd2FudCB0byBkbyBhbnkgbG9vcGluZyB3aGVuIGluIGV4aGF1c3RpdmUgY2hlY2tOb0NoYW5nZXMgYmVjYXVzZSB3ZVxuICAgIC8vIGFscmVhZHkgdHJhdmVyc2UgYWxsIHRoZSB2aWV3cyBhbmQgbm90aGluZyBzaG91bGQgY2hhbmdlIHNvIHdlIHNob3VsZG4ndCBoYXZlIHRvIGRvXG4gICAgLy8gYW5vdGhlciBwYXNzIHRvIHBpY2sgdXAgbmV3IGNoYW5nZXMuXG4gICAgaWYgKG5nRGV2TW9kZSAmJiBpc0V4aGF1c3RpdmVDaGVja05vQ2hhbmdlcygpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IHJldHJpZXMgPSAwO1xuICAgIC8vIElmIGFmdGVyIHJ1bm5pbmcgY2hhbmdlIGRldGVjdGlvbiwgdGhpcyB2aWV3IHN0aWxsIG5lZWRzIHRvIGJlIHJlZnJlc2hlZCBvciB0aGVyZSBhcmVcbiAgICAvLyBkZXNjZW5kYW50cyB2aWV3cyB0aGF0IG5lZWQgdG8gYmUgcmVmcmVzaGVkIGR1ZSB0byByZS1kaXJ0eWluZyBkdXJpbmcgdGhlIGNoYW5nZSBkZXRlY3Rpb25cbiAgICAvLyBydW4sIGRldGVjdCBjaGFuZ2VzIG9uIHRoZSB2aWV3IGFnYWluLiBXZSBydW4gY2hhbmdlIGRldGVjdGlvbiBpbiBgVGFyZ2V0ZWRgIG1vZGUgdG8gb25seVxuICAgIC8vIHJlZnJlc2ggdmlld3Mgd2l0aCB0aGUgYFJlZnJlc2hWaWV3YCBmbGFnLlxuICAgIHdoaWxlIChyZXF1aXJlc1JlZnJlc2hPclRyYXZlcnNhbChsVmlldykpIHtcbiAgICAgIGlmIChyZXRyaWVzID09PSBNQVhJTVVNX1JFRlJFU0hfUkVSVU5TKSB7XG4gICAgICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgICAgUnVudGltZUVycm9yQ29kZS5JTkZJTklURV9DSEFOR0VfREVURUNUSU9OLFxuICAgICAgICAgIG5nRGV2TW9kZSAmJlxuICAgICAgICAgICAgJ0luZmluaXRlIGNoYW5nZSBkZXRlY3Rpb24gd2hpbGUgdHJ5aW5nIHRvIHJlZnJlc2ggdmlld3MuICcgK1xuICAgICAgICAgICAgICAnVGhlcmUgbWF5IGJlIGNvbXBvbmVudHMgd2hpY2ggZWFjaCBjYXVzZSB0aGUgb3RoZXIgdG8gcmVxdWlyZSBhIHJlZnJlc2gsICcgK1xuICAgICAgICAgICAgICAnY2F1c2luZyBhbiBpbmZpbml0ZSBsb29wLicsXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICByZXRyaWVzKys7XG4gICAgICAvLyBFdmVuIGlmIHRoaXMgdmlldyBpcyBkZXRhY2hlZCwgd2Ugc3RpbGwgZGV0ZWN0IGNoYW5nZXMgaW4gdGFyZ2V0ZWQgbW9kZSBiZWNhdXNlIHRoaXMgd2FzXG4gICAgICAvLyB0aGUgcm9vdCBvZiB0aGUgY2hhbmdlIGRldGVjdGlvbiBydW4uXG4gICAgICBkZXRlY3RDaGFuZ2VzSW5WaWV3KGxWaWV3LCBDaGFuZ2VEZXRlY3Rpb25Nb2RlLlRhcmdldGVkKTtcbiAgICB9XG4gIH0gZmluYWxseSB7XG4gICAgLy8gcmVzdG9yZSBzdGF0ZSB0byB3aGF0IGl0IHdhcyBiZWZvcmUgZW50ZXJpbmcgdGhpcyBjaGFuZ2UgZGV0ZWN0aW9uIGxvb3BcbiAgICBzZXRJc1JlZnJlc2hpbmdWaWV3cyhsYXN0SXNSZWZyZXNoaW5nVmlld3NWYWx1ZSk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrTm9DaGFuZ2VzSW50ZXJuYWwoXG4gIGxWaWV3OiBMVmlldyxcbiAgbW9kZTogQ2hlY2tOb0NoYW5nZXNNb2RlLFxuICBub3RpZnlFcnJvckhhbmRsZXIgPSB0cnVlLFxuKSB7XG4gIHNldElzSW5DaGVja05vQ2hhbmdlc01vZGUobW9kZSk7XG4gIHRyeSB7XG4gICAgZGV0ZWN0Q2hhbmdlc0ludGVybmFsKGxWaWV3LCBub3RpZnlFcnJvckhhbmRsZXIpO1xuICB9IGZpbmFsbHkge1xuICAgIHNldElzSW5DaGVja05vQ2hhbmdlc01vZGUoQ2hlY2tOb0NoYW5nZXNNb2RlLk9mZik7XG4gIH1cbn1cblxuLyoqXG4gKiBEaWZmZXJlbnQgbW9kZXMgb2YgdHJhdmVyc2luZyB0aGUgbG9naWNhbCB2aWV3IHRyZWUgZHVyaW5nIGNoYW5nZSBkZXRlY3Rpb24uXG4gKlxuICpcbiAqIFRoZSBjaGFuZ2UgZGV0ZWN0aW9uIHRyYXZlcnNhbCBhbGdvcml0aG0gc3dpdGNoZXMgYmV0d2VlbiB0aGVzZSBtb2RlcyBiYXNlZCBvbiB2YXJpb3VzXG4gKiBjb25kaXRpb25zLlxuICovXG5leHBvcnQgY29uc3QgZW51bSBDaGFuZ2VEZXRlY3Rpb25Nb2RlIHtcbiAgLyoqXG4gICAqIEluIGBHbG9iYWxgIG1vZGUsIGBEaXJ0eWAgYW5kIGBDaGVja0Fsd2F5c2Agdmlld3MgYXJlIHJlZnJlc2hlZCBhcyB3ZWxsIGFzIHZpZXdzIHdpdGggdGhlXG4gICAqIGBSZWZyZXNoVmlld2AgZmxhZy5cbiAgICovXG4gIEdsb2JhbCxcbiAgLyoqXG4gICAqIEluIGBUYXJnZXRlZGAgbW9kZSwgb25seSB2aWV3cyB3aXRoIHRoZSBgUmVmcmVzaFZpZXdgIGZsYWcgb3IgdXBkYXRlZCBzaWduYWxzIGFyZSByZWZyZXNoZWQuXG4gICAqL1xuICBUYXJnZXRlZCxcbn1cblxuLyoqXG4gKiBQcm9jZXNzZXMgYSB2aWV3IGluIHVwZGF0ZSBtb2RlLiBUaGlzIGluY2x1ZGVzIGEgbnVtYmVyIG9mIHN0ZXBzIGluIGEgc3BlY2lmaWMgb3JkZXI6XG4gKiAtIGV4ZWN1dGluZyBhIHRlbXBsYXRlIGZ1bmN0aW9uIGluIHVwZGF0ZSBtb2RlO1xuICogLSBleGVjdXRpbmcgaG9va3M7XG4gKiAtIHJlZnJlc2hpbmcgcXVlcmllcztcbiAqIC0gc2V0dGluZyBob3N0IGJpbmRpbmdzO1xuICogLSByZWZyZXNoaW5nIGNoaWxkIChlbWJlZGRlZCBhbmQgY29tcG9uZW50KSB2aWV3cy5cbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gcmVmcmVzaFZpZXc8VD4oXG4gIHRWaWV3OiBUVmlldyxcbiAgbFZpZXc6IExWaWV3LFxuICB0ZW1wbGF0ZUZuOiBDb21wb25lbnRUZW1wbGF0ZTx7fT4gfCBudWxsLFxuICBjb250ZXh0OiBULFxuKSB7XG4gIG5nRGV2TW9kZSAmJiBhc3NlcnRFcXVhbChpc0NyZWF0aW9uTW9kZShsVmlldyksIGZhbHNlLCAnU2hvdWxkIGJlIHJ1biBpbiB1cGRhdGUgbW9kZScpO1xuICBjb25zdCBmbGFncyA9IGxWaWV3W0ZMQUdTXTtcbiAgaWYgKChmbGFncyAmIExWaWV3RmxhZ3MuRGVzdHJveWVkKSA9PT0gTFZpZXdGbGFncy5EZXN0cm95ZWQpIHJldHVybjtcblxuICAvLyBDaGVjayBubyBjaGFuZ2VzIG1vZGUgaXMgYSBkZXYgb25seSBtb2RlIHVzZWQgdG8gdmVyaWZ5IHRoYXQgYmluZGluZ3MgaGF2ZSBub3QgY2hhbmdlZFxuICAvLyBzaW5jZSB0aGV5IHdlcmUgYXNzaWduZWQuIFdlIGRvIG5vdCB3YW50IHRvIGV4ZWN1dGUgbGlmZWN5Y2xlIGhvb2tzIGluIHRoYXQgbW9kZS5cbiAgY29uc3QgaXNJbkNoZWNrTm9DaGFuZ2VzUGFzcyA9IG5nRGV2TW9kZSAmJiBpc0luQ2hlY2tOb0NoYW5nZXNNb2RlKCk7XG4gIGNvbnN0IGlzSW5FeGhhdXN0aXZlQ2hlY2tOb0NoYW5nZXNQYXNzID0gbmdEZXZNb2RlICYmIGlzRXhoYXVzdGl2ZUNoZWNrTm9DaGFuZ2VzKCk7XG5cbiAgIWlzSW5DaGVja05vQ2hhbmdlc1Bhc3MgJiYgbFZpZXdbRU5WSVJPTk1FTlRdLmlubGluZUVmZmVjdFJ1bm5lcj8uZmx1c2goKTtcblxuICAvLyBTdGFydCBjb21wb25lbnQgcmVhY3RpdmUgY29udGV4dFxuICAvLyAtIFdlIG1pZ2h0IGFscmVhZHkgYmUgaW4gYSByZWFjdGl2ZSBjb250ZXh0IGlmIHRoaXMgaXMgYW4gZW1iZWRkZWQgdmlldyBvZiB0aGUgaG9zdC5cbiAgLy8gLSBXZSBtaWdodCBiZSBkZXNjZW5kaW5nIGludG8gYSB2aWV3IHRoYXQgbmVlZHMgYSBjb25zdW1lci5cbiAgZW50ZXJWaWV3KGxWaWV3KTtcbiAgbGV0IHJldHVybkNvbnN1bWVyVG9Qb29sID0gdHJ1ZTtcbiAgbGV0IHByZXZDb25zdW1lcjogUmVhY3RpdmVOb2RlIHwgbnVsbCA9IG51bGw7XG4gIGxldCBjdXJyZW50Q29uc3VtZXI6IFJlYWN0aXZlTFZpZXdDb25zdW1lciB8IG51bGwgPSBudWxsO1xuICBpZiAoIWlzSW5DaGVja05vQ2hhbmdlc1Bhc3MpIHtcbiAgICBpZiAodmlld1Nob3VsZEhhdmVSZWFjdGl2ZUNvbnN1bWVyKHRWaWV3KSkge1xuICAgICAgY3VycmVudENvbnN1bWVyID0gZ2V0T3JCb3Jyb3dSZWFjdGl2ZUxWaWV3Q29uc3VtZXIobFZpZXcpO1xuICAgICAgcHJldkNvbnN1bWVyID0gY29uc3VtZXJCZWZvcmVDb21wdXRhdGlvbihjdXJyZW50Q29uc3VtZXIpO1xuICAgIH0gZWxzZSBpZiAoZ2V0QWN0aXZlQ29uc3VtZXIoKSA9PT0gbnVsbCkge1xuICAgICAgLy8gSWYgdGhlIGN1cnJlbnQgdmlldyBzaG91bGQgbm90IGhhdmUgYSByZWFjdGl2ZSBjb25zdW1lciBidXQgd2UgZG9uJ3QgaGF2ZSBhbiBhY3RpdmUgY29uc3VtZXIsXG4gICAgICAvLyB3ZSBzdGlsbCBuZWVkIHRvIGNyZWF0ZSBhIHRlbXBvcmFyeSBjb25zdW1lciB0byB0cmFjayBhbnkgc2lnbmFsIHJlYWRzIGluIHRoaXMgdGVtcGxhdGUuXG4gICAgICAvLyBUaGlzIGlzIGEgcmFyZSBjYXNlIHRoYXQgY2FuIGhhcHBlbiB3aXRoIGB2aWV3Q29udGFpbmVyUmVmLmNyZWF0ZUVtYmVkZGVkVmlldyguLi4pLmRldGVjdENoYW5nZXMoKWAuXG4gICAgICAvLyBUaGlzIHRlbXBvcmFyeSBjb25zdW1lciBtYXJrcyB0aGUgZmlyc3QgcGFyZW50IHRoYXQgX3Nob3VsZF8gaGF2ZSBhIGNvbnN1bWVyIGZvciByZWZyZXNoLlxuICAgICAgLy8gT25jZSB0aGF0IHJlZnJlc2ggaGFwcGVucywgdGhlIHNpZ25hbHMgd2lsbCBiZSB0cmFja2VkIGluIHRoZSBwYXJlbnQgY29uc3VtZXIgYW5kIHdlIGNhbiBkZXN0cm95XG4gICAgICAvLyB0aGUgdGVtcG9yYXJ5IG9uZS5cbiAgICAgIHJldHVybkNvbnN1bWVyVG9Qb29sID0gZmFsc2U7XG4gICAgICBjdXJyZW50Q29uc3VtZXIgPSBnZXRPckNyZWF0ZVRlbXBvcmFyeUNvbnN1bWVyKGxWaWV3KTtcbiAgICAgIHByZXZDb25zdW1lciA9IGNvbnN1bWVyQmVmb3JlQ29tcHV0YXRpb24oY3VycmVudENvbnN1bWVyKTtcbiAgICB9IGVsc2UgaWYgKGxWaWV3W1JFQUNUSVZFX1RFTVBMQVRFX0NPTlNVTUVSXSkge1xuICAgICAgY29uc3VtZXJEZXN0cm95KGxWaWV3W1JFQUNUSVZFX1RFTVBMQVRFX0NPTlNVTUVSXSk7XG4gICAgICBsVmlld1tSRUFDVElWRV9URU1QTEFURV9DT05TVU1FUl0gPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIHRyeSB7XG4gICAgcmVzZXRQcmVPcmRlckhvb2tGbGFncyhsVmlldyk7XG5cbiAgICBzZXRCaW5kaW5nSW5kZXgodFZpZXcuYmluZGluZ1N0YXJ0SW5kZXgpO1xuICAgIGlmICh0ZW1wbGF0ZUZuICE9PSBudWxsKSB7XG4gICAgICBleGVjdXRlVGVtcGxhdGUodFZpZXcsIGxWaWV3LCB0ZW1wbGF0ZUZuLCBSZW5kZXJGbGFncy5VcGRhdGUsIGNvbnRleHQpO1xuICAgIH1cblxuICAgIGNvbnN0IGhvb2tzSW5pdFBoYXNlQ29tcGxldGVkID1cbiAgICAgIChmbGFncyAmIExWaWV3RmxhZ3MuSW5pdFBoYXNlU3RhdGVNYXNrKSA9PT0gSW5pdFBoYXNlU3RhdGUuSW5pdFBoYXNlQ29tcGxldGVkO1xuXG4gICAgLy8gZXhlY3V0ZSBwcmUtb3JkZXIgaG9va3MgKE9uSW5pdCwgT25DaGFuZ2VzLCBEb0NoZWNrKVxuICAgIC8vIFBFUkYgV0FSTklORzogZG8gTk9UIGV4dHJhY3QgdGhpcyB0byBhIHNlcGFyYXRlIGZ1bmN0aW9uIHdpdGhvdXQgcnVubmluZyBiZW5jaG1hcmtzXG4gICAgaWYgKCFpc0luQ2hlY2tOb0NoYW5nZXNQYXNzKSB7XG4gICAgICBpZiAoaG9va3NJbml0UGhhc2VDb21wbGV0ZWQpIHtcbiAgICAgICAgY29uc3QgcHJlT3JkZXJDaGVja0hvb2tzID0gdFZpZXcucHJlT3JkZXJDaGVja0hvb2tzO1xuICAgICAgICBpZiAocHJlT3JkZXJDaGVja0hvb2tzICE9PSBudWxsKSB7XG4gICAgICAgICAgZXhlY3V0ZUNoZWNrSG9va3MobFZpZXcsIHByZU9yZGVyQ2hlY2tIb29rcywgbnVsbCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IHByZU9yZGVySG9va3MgPSB0Vmlldy5wcmVPcmRlckhvb2tzO1xuICAgICAgICBpZiAocHJlT3JkZXJIb29rcyAhPT0gbnVsbCkge1xuICAgICAgICAgIGV4ZWN1dGVJbml0QW5kQ2hlY2tIb29rcyhsVmlldywgcHJlT3JkZXJIb29rcywgSW5pdFBoYXNlU3RhdGUuT25Jbml0SG9va3NUb0JlUnVuLCBudWxsKTtcbiAgICAgICAgfVxuICAgICAgICBpbmNyZW1lbnRJbml0UGhhc2VGbGFncyhsVmlldywgSW5pdFBoYXNlU3RhdGUuT25Jbml0SG9va3NUb0JlUnVuKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBXZSBkbyBub3QgbmVlZCB0byBtYXJrIHRyYW5zcGxhbnRlZCB2aWV3cyBmb3IgcmVmcmVzaCB3aGVuIGRvaW5nIGV4aGF1c3RpdmUgY2hlY2tzXG4gICAgLy8gYmVjYXVzZSBhbGwgdmlld3Mgd2lsbCBiZSByZWFjaGVkIGFueXdheXMgZHVyaW5nIHRoZSB0cmF2ZXJzYWwuXG4gICAgaWYgKCFpc0luRXhoYXVzdGl2ZUNoZWNrTm9DaGFuZ2VzUGFzcykge1xuICAgICAgLy8gRmlyc3QgbWFyayB0cmFuc3BsYW50ZWQgdmlld3MgdGhhdCBhcmUgZGVjbGFyZWQgaW4gdGhpcyBsVmlldyBhcyBuZWVkaW5nIGEgcmVmcmVzaCBhdCB0aGVpclxuICAgICAgLy8gaW5zZXJ0aW9uIHBvaW50cy4gVGhpcyBpcyBuZWVkZWQgdG8gYXZvaWQgdGhlIHNpdHVhdGlvbiB3aGVyZSB0aGUgdGVtcGxhdGUgaXMgZGVmaW5lZCBpbiB0aGlzXG4gICAgICAvLyBgTFZpZXdgIGJ1dCBpdHMgZGVjbGFyYXRpb24gYXBwZWFycyBhZnRlciB0aGUgaW5zZXJ0aW9uIGNvbXBvbmVudC5cbiAgICAgIG1hcmtUcmFuc3BsYW50ZWRWaWV3c0ZvclJlZnJlc2gobFZpZXcpO1xuICAgIH1cbiAgICBkZXRlY3RDaGFuZ2VzSW5FbWJlZGRlZFZpZXdzKGxWaWV3LCBDaGFuZ2VEZXRlY3Rpb25Nb2RlLkdsb2JhbCk7XG5cbiAgICAvLyBDb250ZW50IHF1ZXJ5IHJlc3VsdHMgbXVzdCBiZSByZWZyZXNoZWQgYmVmb3JlIGNvbnRlbnQgaG9va3MgYXJlIGNhbGxlZC5cbiAgICBpZiAodFZpZXcuY29udGVudFF1ZXJpZXMgIT09IG51bGwpIHtcbiAgICAgIHJlZnJlc2hDb250ZW50UXVlcmllcyh0VmlldywgbFZpZXcpO1xuICAgIH1cblxuICAgIC8vIGV4ZWN1dGUgY29udGVudCBob29rcyAoQWZ0ZXJDb250ZW50SW5pdCwgQWZ0ZXJDb250ZW50Q2hlY2tlZClcbiAgICAvLyBQRVJGIFdBUk5JTkc6IGRvIE5PVCBleHRyYWN0IHRoaXMgdG8gYSBzZXBhcmF0ZSBmdW5jdGlvbiB3aXRob3V0IHJ1bm5pbmcgYmVuY2htYXJrc1xuICAgIGlmICghaXNJbkNoZWNrTm9DaGFuZ2VzUGFzcykge1xuICAgICAgaWYgKGhvb2tzSW5pdFBoYXNlQ29tcGxldGVkKSB7XG4gICAgICAgIGNvbnN0IGNvbnRlbnRDaGVja0hvb2tzID0gdFZpZXcuY29udGVudENoZWNrSG9va3M7XG4gICAgICAgIGlmIChjb250ZW50Q2hlY2tIb29rcyAhPT0gbnVsbCkge1xuICAgICAgICAgIGV4ZWN1dGVDaGVja0hvb2tzKGxWaWV3LCBjb250ZW50Q2hlY2tIb29rcyk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IGNvbnRlbnRIb29rcyA9IHRWaWV3LmNvbnRlbnRIb29rcztcbiAgICAgICAgaWYgKGNvbnRlbnRIb29rcyAhPT0gbnVsbCkge1xuICAgICAgICAgIGV4ZWN1dGVJbml0QW5kQ2hlY2tIb29rcyhcbiAgICAgICAgICAgIGxWaWV3LFxuICAgICAgICAgICAgY29udGVudEhvb2tzLFxuICAgICAgICAgICAgSW5pdFBoYXNlU3RhdGUuQWZ0ZXJDb250ZW50SW5pdEhvb2tzVG9CZVJ1bixcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIGluY3JlbWVudEluaXRQaGFzZUZsYWdzKGxWaWV3LCBJbml0UGhhc2VTdGF0ZS5BZnRlckNvbnRlbnRJbml0SG9va3NUb0JlUnVuKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBwcm9jZXNzSG9zdEJpbmRpbmdPcENvZGVzKHRWaWV3LCBsVmlldyk7XG5cbiAgICAvLyBSZWZyZXNoIGNoaWxkIGNvbXBvbmVudCB2aWV3cy5cbiAgICBjb25zdCBjb21wb25lbnRzID0gdFZpZXcuY29tcG9uZW50cztcbiAgICBpZiAoY29tcG9uZW50cyAhPT0gbnVsbCkge1xuICAgICAgZGV0ZWN0Q2hhbmdlc0luQ2hpbGRDb21wb25lbnRzKGxWaWV3LCBjb21wb25lbnRzLCBDaGFuZ2VEZXRlY3Rpb25Nb2RlLkdsb2JhbCk7XG4gICAgfVxuXG4gICAgLy8gVmlldyBxdWVyaWVzIG11c3QgZXhlY3V0ZSBhZnRlciByZWZyZXNoaW5nIGNoaWxkIGNvbXBvbmVudHMgYmVjYXVzZSBhIHRlbXBsYXRlIGluIHRoaXMgdmlld1xuICAgIC8vIGNvdWxkIGJlIGluc2VydGVkIGluIGEgY2hpbGQgY29tcG9uZW50LiBJZiB0aGUgdmlldyBxdWVyeSBleGVjdXRlcyBiZWZvcmUgY2hpbGQgY29tcG9uZW50XG4gICAgLy8gcmVmcmVzaCwgdGhlIHRlbXBsYXRlIG1pZ2h0IG5vdCB5ZXQgYmUgaW5zZXJ0ZWQuXG4gICAgY29uc3Qgdmlld1F1ZXJ5ID0gdFZpZXcudmlld1F1ZXJ5O1xuICAgIGlmICh2aWV3UXVlcnkgIT09IG51bGwpIHtcbiAgICAgIGV4ZWN1dGVWaWV3UXVlcnlGbjxUPihSZW5kZXJGbGFncy5VcGRhdGUsIHZpZXdRdWVyeSwgY29udGV4dCk7XG4gICAgfVxuXG4gICAgLy8gZXhlY3V0ZSB2aWV3IGhvb2tzIChBZnRlclZpZXdJbml0LCBBZnRlclZpZXdDaGVja2VkKVxuICAgIC8vIFBFUkYgV0FSTklORzogZG8gTk9UIGV4dHJhY3QgdGhpcyB0byBhIHNlcGFyYXRlIGZ1bmN0aW9uIHdpdGhvdXQgcnVubmluZyBiZW5jaG1hcmtzXG4gICAgaWYgKCFpc0luQ2hlY2tOb0NoYW5nZXNQYXNzKSB7XG4gICAgICBpZiAoaG9va3NJbml0UGhhc2VDb21wbGV0ZWQpIHtcbiAgICAgICAgY29uc3Qgdmlld0NoZWNrSG9va3MgPSB0Vmlldy52aWV3Q2hlY2tIb29rcztcbiAgICAgICAgaWYgKHZpZXdDaGVja0hvb2tzICE9PSBudWxsKSB7XG4gICAgICAgICAgZXhlY3V0ZUNoZWNrSG9va3MobFZpZXcsIHZpZXdDaGVja0hvb2tzKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3Qgdmlld0hvb2tzID0gdFZpZXcudmlld0hvb2tzO1xuICAgICAgICBpZiAodmlld0hvb2tzICE9PSBudWxsKSB7XG4gICAgICAgICAgZXhlY3V0ZUluaXRBbmRDaGVja0hvb2tzKGxWaWV3LCB2aWV3SG9va3MsIEluaXRQaGFzZVN0YXRlLkFmdGVyVmlld0luaXRIb29rc1RvQmVSdW4pO1xuICAgICAgICB9XG4gICAgICAgIGluY3JlbWVudEluaXRQaGFzZUZsYWdzKGxWaWV3LCBJbml0UGhhc2VTdGF0ZS5BZnRlclZpZXdJbml0SG9va3NUb0JlUnVuKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHRWaWV3LmZpcnN0VXBkYXRlUGFzcyA9PT0gdHJ1ZSkge1xuICAgICAgLy8gV2UgbmVlZCB0byBtYWtlIHN1cmUgdGhhdCB3ZSBvbmx5IGZsaXAgdGhlIGZsYWcgb24gc3VjY2Vzc2Z1bCBgcmVmcmVzaFZpZXdgIG9ubHlcbiAgICAgIC8vIERvbid0IGRvIHRoaXMgaW4gYGZpbmFsbHlgIGJsb2NrLlxuICAgICAgLy8gSWYgd2UgZGlkIHRoaXMgaW4gYGZpbmFsbHlgIGJsb2NrIHRoZW4gYW4gZXhjZXB0aW9uIGNvdWxkIGJsb2NrIHRoZSBleGVjdXRpb24gb2Ygc3R5bGluZ1xuICAgICAgLy8gaW5zdHJ1Y3Rpb25zIHdoaWNoIGluIHR1cm4gd291bGQgYmUgdW5hYmxlIHRvIGluc2VydCB0aGVtc2VsdmVzIGludG8gdGhlIHN0eWxpbmcgbGlua2VkXG4gICAgICAvLyBsaXN0LiBUaGUgcmVzdWx0IG9mIHRoaXMgd291bGQgYmUgdGhhdCBpZiB0aGUgZXhjZXB0aW9uIHdvdWxkIG5vdCBiZSB0aHJvdyBvbiBzdWJzZXF1ZW50IENEXG4gICAgICAvLyB0aGUgc3R5bGluZyB3b3VsZCBiZSB1bmFibGUgdG8gcHJvY2VzcyBpdCBkYXRhIGFuZCByZWZsZWN0IHRvIHRoZSBET00uXG4gICAgICB0Vmlldy5maXJzdFVwZGF0ZVBhc3MgPSBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBTY2hlZHVsZSBhbnkgZWZmZWN0cyB0aGF0IGFyZSB3YWl0aW5nIG9uIHRoZSB1cGRhdGUgcGFzcyBvZiB0aGlzIHZpZXcuXG4gICAgaWYgKGxWaWV3W0VGRkVDVFNfVE9fU0NIRURVTEVdKSB7XG4gICAgICBmb3IgKGNvbnN0IG5vdGlmeUVmZmVjdCBvZiBsVmlld1tFRkZFQ1RTX1RPX1NDSEVEVUxFXSkge1xuICAgICAgICBub3RpZnlFZmZlY3QoKTtcbiAgICAgIH1cblxuICAgICAgLy8gT25jZSB0aGV5J3ZlIGJlZW4gcnVuLCB3ZSBjYW4gZHJvcCB0aGUgYXJyYXkuXG4gICAgICBsVmlld1tFRkZFQ1RTX1RPX1NDSEVEVUxFXSA9IG51bGw7XG4gICAgfVxuXG4gICAgLy8gRG8gbm90IHJlc2V0IHRoZSBkaXJ0eSBzdGF0ZSB3aGVuIHJ1bm5pbmcgaW4gY2hlY2sgbm8gY2hhbmdlcyBtb2RlLiBXZSBkb24ndCB3YW50IGNvbXBvbmVudHNcbiAgICAvLyB0byBiZWhhdmUgZGlmZmVyZW50bHkgZGVwZW5kaW5nIG9uIHdoZXRoZXIgY2hlY2sgbm8gY2hhbmdlcyBpcyBlbmFibGVkIG9yIG5vdC4gRm9yIGV4YW1wbGU6XG4gICAgLy8gTWFya2luZyBhbiBPblB1c2ggY29tcG9uZW50IGFzIGRpcnR5IGZyb20gd2l0aGluIHRoZSBgbmdBZnRlclZpZXdJbml0YCBob29rIGluIG9yZGVyIHRvXG4gICAgLy8gcmVmcmVzaCBhIGBOZ0NsYXNzYCBiaW5kaW5nIHNob3VsZCB3b3JrLiBJZiB3ZSB3b3VsZCByZXNldCB0aGUgZGlydHkgc3RhdGUgaW4gdGhlIGNoZWNrXG4gICAgLy8gbm8gY2hhbmdlcyBjeWNsZSwgdGhlIGNvbXBvbmVudCB3b3VsZCBiZSBub3QgYmUgZGlydHkgZm9yIHRoZSBuZXh0IHVwZGF0ZSBwYXNzLiBUaGlzIHdvdWxkXG4gICAgLy8gYmUgZGlmZmVyZW50IGluIHByb2R1Y3Rpb24gbW9kZSB3aGVyZSB0aGUgY29tcG9uZW50IGRpcnR5IHN0YXRlIGlzIG5vdCByZXNldC5cbiAgICBpZiAoIWlzSW5DaGVja05vQ2hhbmdlc1Bhc3MpIHtcbiAgICAgIGxWaWV3W0ZMQUdTXSAmPSB+KExWaWV3RmxhZ3MuRGlydHkgfCBMVmlld0ZsYWdzLkZpcnN0TFZpZXdQYXNzKTtcbiAgICB9XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBpZiAoIWlzSW5DaGVja05vQ2hhbmdlc1Bhc3MpIHtcbiAgICAgIC8vIElmIHJlZnJlc2hpbmcgYSB2aWV3IGNhdXNlcyBhbiBlcnJvciwgd2UgbmVlZCB0byByZW1hcmsgdGhlIGFuY2VzdG9ycyBhcyBuZWVkaW5nIHRyYXZlcnNhbFxuICAgICAgLy8gYmVjYXVzZSB0aGUgZXJyb3IgbWlnaHQgaGF2ZSBjYXVzZWQgYSBzaXR1YXRpb24gd2hlcmUgdmlld3MgYmVsb3cgdGhlIGN1cnJlbnQgbG9jYXRpb24gYXJlXG4gICAgICAvLyBkaXJ0eSBidXQgd2lsbCBiZSB1bnJlYWNoYWJsZSBiZWNhdXNlIHRoZSBcImhhcyBkaXJ0eSBjaGlsZHJlblwiIGZsYWcgaW4gdGhlIGFuY2VzdG9ycyBoYXMgYmVlblxuICAgICAgLy8gY2xlYXJlZCBkdXJpbmcgY2hhbmdlIGRldGVjdGlvbiBhbmQgd2UgZmFpbGVkIHRvIHJ1biB0byBjb21wbGV0aW9uLlxuICAgICAgbWFya0FuY2VzdG9yc0ZvclRyYXZlcnNhbChsVmlldyk7XG4gICAgfVxuICAgIHRocm93IGU7XG4gIH0gZmluYWxseSB7XG4gICAgaWYgKGN1cnJlbnRDb25zdW1lciAhPT0gbnVsbCkge1xuICAgICAgY29uc3VtZXJBZnRlckNvbXB1dGF0aW9uKGN1cnJlbnRDb25zdW1lciwgcHJldkNvbnN1bWVyKTtcbiAgICAgIGlmIChyZXR1cm5Db25zdW1lclRvUG9vbCkge1xuICAgICAgICBtYXliZVJldHVyblJlYWN0aXZlTFZpZXdDb25zdW1lcihjdXJyZW50Q29uc3VtZXIpO1xuICAgICAgfVxuICAgIH1cbiAgICBsZWF2ZVZpZXcoKTtcbiAgfVxufVxuXG4vKipcbiAqIEdvZXMgb3ZlciBlbWJlZGRlZCB2aWV3cyAob25lcyBjcmVhdGVkIHRocm91Z2ggVmlld0NvbnRhaW5lclJlZiBBUElzKSBhbmQgcmVmcmVzaGVzXG4gKiB0aGVtIGJ5IGV4ZWN1dGluZyBhbiBhc3NvY2lhdGVkIHRlbXBsYXRlIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBkZXRlY3RDaGFuZ2VzSW5FbWJlZGRlZFZpZXdzKGxWaWV3OiBMVmlldywgbW9kZTogQ2hhbmdlRGV0ZWN0aW9uTW9kZSkge1xuICBmb3IgKFxuICAgIGxldCBsQ29udGFpbmVyID0gZ2V0Rmlyc3RMQ29udGFpbmVyKGxWaWV3KTtcbiAgICBsQ29udGFpbmVyICE9PSBudWxsO1xuICAgIGxDb250YWluZXIgPSBnZXROZXh0TENvbnRhaW5lcihsQ29udGFpbmVyKVxuICApIHtcbiAgICBmb3IgKGxldCBpID0gQ09OVEFJTkVSX0hFQURFUl9PRkZTRVQ7IGkgPCBsQ29udGFpbmVyLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBlbWJlZGRlZExWaWV3ID0gbENvbnRhaW5lcltpXTtcbiAgICAgIGRldGVjdENoYW5nZXNJblZpZXdJZkF0dGFjaGVkKGVtYmVkZGVkTFZpZXcsIG1vZGUpO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIE1hcmsgdHJhbnNwbGFudGVkIHZpZXdzIGFzIG5lZWRpbmcgdG8gYmUgcmVmcmVzaGVkIGF0IHRoZWlyIGF0dGFjaG1lbnQgcG9pbnRzLlxuICpcbiAqIEBwYXJhbSBsVmlldyBUaGUgYExWaWV3YCB0aGF0IG1heSBoYXZlIHRyYW5zcGxhbnRlZCB2aWV3cy5cbiAqL1xuZnVuY3Rpb24gbWFya1RyYW5zcGxhbnRlZFZpZXdzRm9yUmVmcmVzaChsVmlldzogTFZpZXcpIHtcbiAgZm9yIChcbiAgICBsZXQgbENvbnRhaW5lciA9IGdldEZpcnN0TENvbnRhaW5lcihsVmlldyk7XG4gICAgbENvbnRhaW5lciAhPT0gbnVsbDtcbiAgICBsQ29udGFpbmVyID0gZ2V0TmV4dExDb250YWluZXIobENvbnRhaW5lcilcbiAgKSB7XG4gICAgaWYgKCEobENvbnRhaW5lcltGTEFHU10gJiBMQ29udGFpbmVyRmxhZ3MuSGFzVHJhbnNwbGFudGVkVmlld3MpKSBjb250aW51ZTtcblxuICAgIGNvbnN0IG1vdmVkVmlld3MgPSBsQ29udGFpbmVyW01PVkVEX1ZJRVdTXSE7XG4gICAgbmdEZXZNb2RlICYmIGFzc2VydERlZmluZWQobW92ZWRWaWV3cywgJ1RyYW5zcGxhbnRlZCBWaWV3IGZsYWdzIHNldCBidXQgbWlzc2luZyBNT1ZFRF9WSUVXUycpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbW92ZWRWaWV3cy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgbW92ZWRMVmlldyA9IG1vdmVkVmlld3NbaV0hO1xuICAgICAgbWFya1ZpZXdGb3JSZWZyZXNoKG1vdmVkTFZpZXcpO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIERldGVjdHMgY2hhbmdlcyBpbiBhIGNvbXBvbmVudCBieSBlbnRlcmluZyB0aGUgY29tcG9uZW50IHZpZXcgYW5kIHByb2Nlc3NpbmcgaXRzIGJpbmRpbmdzLFxuICogcXVlcmllcywgZXRjLiBpZiBpdCBpcyBDaGVja0Fsd2F5cywgT25QdXNoIGFuZCBEaXJ0eSwgZXRjLlxuICpcbiAqIEBwYXJhbSBjb21wb25lbnRIb3N0SWR4ICBFbGVtZW50IGluZGV4IGluIExWaWV3W10gKGFkanVzdGVkIGZvciBIRUFERVJfT0ZGU0VUKVxuICovXG5mdW5jdGlvbiBkZXRlY3RDaGFuZ2VzSW5Db21wb25lbnQoXG4gIGhvc3RMVmlldzogTFZpZXcsXG4gIGNvbXBvbmVudEhvc3RJZHg6IG51bWJlcixcbiAgbW9kZTogQ2hhbmdlRGV0ZWN0aW9uTW9kZSxcbik6IHZvaWQge1xuICBuZ0Rldk1vZGUgJiYgYXNzZXJ0RXF1YWwoaXNDcmVhdGlvbk1vZGUoaG9zdExWaWV3KSwgZmFsc2UsICdTaG91bGQgYmUgcnVuIGluIHVwZGF0ZSBtb2RlJyk7XG4gIGNvbnN0IGNvbXBvbmVudFZpZXcgPSBnZXRDb21wb25lbnRMVmlld0J5SW5kZXgoY29tcG9uZW50SG9zdElkeCwgaG9zdExWaWV3KTtcbiAgZGV0ZWN0Q2hhbmdlc0luVmlld0lmQXR0YWNoZWQoY29tcG9uZW50VmlldywgbW9kZSk7XG59XG5cbi8qKlxuICogVmlzaXRzIGEgdmlldyBhcyBwYXJ0IG9mIGNoYW5nZSBkZXRlY3Rpb24gdHJhdmVyc2FsLlxuICpcbiAqIElmIHRoZSB2aWV3IGlzIGRldGFjaGVkLCBubyBhZGRpdGlvbmFsIHRyYXZlcnNhbCBoYXBwZW5zLlxuICovXG5mdW5jdGlvbiBkZXRlY3RDaGFuZ2VzSW5WaWV3SWZBdHRhY2hlZChsVmlldzogTFZpZXcsIG1vZGU6IENoYW5nZURldGVjdGlvbk1vZGUpIHtcbiAgaWYgKCF2aWV3QXR0YWNoZWRUb0NoYW5nZURldGVjdG9yKGxWaWV3KSkge1xuICAgIHJldHVybjtcbiAgfVxuICBkZXRlY3RDaGFuZ2VzSW5WaWV3KGxWaWV3LCBtb2RlKTtcbn1cblxuLyoqXG4gKiBWaXNpdHMgYSB2aWV3IGFzIHBhcnQgb2YgY2hhbmdlIGRldGVjdGlvbiB0cmF2ZXJzYWwuXG4gKlxuICogVGhlIHZpZXcgaXMgcmVmcmVzaGVkIGlmOlxuICogLSBJZiB0aGUgdmlldyBpcyBDaGVja0Fsd2F5cyBvciBEaXJ0eSBhbmQgQ2hhbmdlRGV0ZWN0aW9uTW9kZSBpcyBgR2xvYmFsYFxuICogLSBJZiB0aGUgdmlldyBoYXMgdGhlIGBSZWZyZXNoVmlld2AgZmxhZ1xuICpcbiAqIFRoZSB2aWV3IGlzIG5vdCByZWZyZXNoZWQsIGJ1dCBkZXNjZW5kYW50cyBhcmUgdHJhdmVyc2VkIGluIGBDaGFuZ2VEZXRlY3Rpb25Nb2RlLlRhcmdldGVkYCBpZiB0aGVcbiAqIHZpZXcgSGFzQ2hpbGRWaWV3c1RvUmVmcmVzaCBmbGFnIGlzIHNldC5cbiAqL1xuZnVuY3Rpb24gZGV0ZWN0Q2hhbmdlc0luVmlldyhsVmlldzogTFZpZXcsIG1vZGU6IENoYW5nZURldGVjdGlvbk1vZGUpIHtcbiAgY29uc3QgaXNJbkNoZWNrTm9DaGFuZ2VzUGFzcyA9IG5nRGV2TW9kZSAmJiBpc0luQ2hlY2tOb0NoYW5nZXNNb2RlKCk7XG4gIGNvbnN0IHRWaWV3ID0gbFZpZXdbVFZJRVddO1xuICBjb25zdCBmbGFncyA9IGxWaWV3W0ZMQUdTXTtcbiAgY29uc3QgY29uc3VtZXIgPSBsVmlld1tSRUFDVElWRV9URU1QTEFURV9DT05TVU1FUl07XG5cbiAgLy8gUmVmcmVzaCBDaGVja0Fsd2F5cyB2aWV3cyBpbiBHbG9iYWwgbW9kZS5cbiAgbGV0IHNob3VsZFJlZnJlc2hWaWV3OiBib29sZWFuID0gISEoXG4gICAgbW9kZSA9PT0gQ2hhbmdlRGV0ZWN0aW9uTW9kZS5HbG9iYWwgJiYgZmxhZ3MgJiBMVmlld0ZsYWdzLkNoZWNrQWx3YXlzXG4gICk7XG5cbiAgLy8gUmVmcmVzaCBEaXJ0eSB2aWV3cyBpbiBHbG9iYWwgbW9kZSwgYXMgbG9uZyBhcyB3ZSdyZSBub3QgaW4gY2hlY2tOb0NoYW5nZXMuXG4gIC8vIENoZWNrTm9DaGFuZ2VzIG5ldmVyIHdvcmtlZCB3aXRoIGBPblB1c2hgIGNvbXBvbmVudHMgYmVjYXVzZSB0aGUgYERpcnR5YCBmbGFnIHdhc1xuICAvLyBjbGVhcmVkIGJlZm9yZSBjaGVja05vQ2hhbmdlcyByYW4uIEJlY2F1c2UgdGhlcmUgaXMgbm93IGEgbG9vcCBmb3IgdG8gY2hlY2sgZm9yXG4gIC8vIGJhY2t3YXJkcyB2aWV3cywgaXQgZ2l2ZXMgYW4gb3Bwb3J0dW5pdHkgZm9yIGBPblB1c2hgIGNvbXBvbmVudHMgdG8gYmUgbWFya2VkIGBEaXJ0eWBcbiAgLy8gYmVmb3JlIHRoZSBDaGVja05vQ2hhbmdlcyBwYXNzLiBXZSBkb24ndCB3YW50IGV4aXN0aW5nIGVycm9ycyB0aGF0IGFyZSBoaWRkZW4gYnkgdGhlXG4gIC8vIGN1cnJlbnQgQ2hlY2tOb0NoYW5nZXMgYnVnIHRvIHN1cmZhY2Ugd2hlbiBtYWtpbmcgdW5yZWxhdGVkIGNoYW5nZXMuXG4gIHNob3VsZFJlZnJlc2hWaWV3IHx8PSAhIShcbiAgICBmbGFncyAmIExWaWV3RmxhZ3MuRGlydHkgJiZcbiAgICBtb2RlID09PSBDaGFuZ2VEZXRlY3Rpb25Nb2RlLkdsb2JhbCAmJlxuICAgICFpc0luQ2hlY2tOb0NoYW5nZXNQYXNzXG4gICk7XG5cbiAgLy8gQWx3YXlzIHJlZnJlc2ggdmlld3MgbWFya2VkIGZvciByZWZyZXNoLCByZWdhcmRsZXNzIG9mIG1vZGUuXG4gIHNob3VsZFJlZnJlc2hWaWV3IHx8PSAhIShmbGFncyAmIExWaWV3RmxhZ3MuUmVmcmVzaFZpZXcpO1xuXG4gIC8vIFJlZnJlc2ggdmlld3Mgd2hlbiB0aGV5IGhhdmUgYSBkaXJ0eSByZWFjdGl2ZSBjb25zdW1lciwgcmVnYXJkbGVzcyBvZiBtb2RlLlxuICBzaG91bGRSZWZyZXNoVmlldyB8fD0gISEoY29uc3VtZXI/LmRpcnR5ICYmIGNvbnN1bWVyUG9sbFByb2R1Y2Vyc0ZvckNoYW5nZShjb25zdW1lcikpO1xuXG4gIHNob3VsZFJlZnJlc2hWaWV3IHx8PSAhIShuZ0Rldk1vZGUgJiYgaXNFeGhhdXN0aXZlQ2hlY2tOb0NoYW5nZXMoKSk7XG5cbiAgLy8gTWFyayB0aGUgRmxhZ3MgYW5kIGBSZWFjdGl2ZU5vZGVgIGFzIG5vdCBkaXJ0eSBiZWZvcmUgcmVmcmVzaGluZyB0aGUgY29tcG9uZW50LCBzbyB0aGF0IHRoZXlcbiAgLy8gY2FuIGJlIHJlLWRpcnRpZWQgZHVyaW5nIHRoZSByZWZyZXNoIHByb2Nlc3MuXG4gIGlmIChjb25zdW1lcikge1xuICAgIGNvbnN1bWVyLmRpcnR5ID0gZmFsc2U7XG4gIH1cbiAgbFZpZXdbRkxBR1NdICY9IH4oTFZpZXdGbGFncy5IYXNDaGlsZFZpZXdzVG9SZWZyZXNoIHwgTFZpZXdGbGFncy5SZWZyZXNoVmlldyk7XG5cbiAgaWYgKHNob3VsZFJlZnJlc2hWaWV3KSB7XG4gICAgcmVmcmVzaFZpZXcodFZpZXcsIGxWaWV3LCB0Vmlldy50ZW1wbGF0ZSwgbFZpZXdbQ09OVEVYVF0pO1xuICB9IGVsc2UgaWYgKGZsYWdzICYgTFZpZXdGbGFncy5IYXNDaGlsZFZpZXdzVG9SZWZyZXNoKSB7XG4gICAgZGV0ZWN0Q2hhbmdlc0luRW1iZWRkZWRWaWV3cyhsVmlldywgQ2hhbmdlRGV0ZWN0aW9uTW9kZS5UYXJnZXRlZCk7XG4gICAgY29uc3QgY29tcG9uZW50cyA9IHRWaWV3LmNvbXBvbmVudHM7XG4gICAgaWYgKGNvbXBvbmVudHMgIT09IG51bGwpIHtcbiAgICAgIGRldGVjdENoYW5nZXNJbkNoaWxkQ29tcG9uZW50cyhsVmlldywgY29tcG9uZW50cywgQ2hhbmdlRGV0ZWN0aW9uTW9kZS5UYXJnZXRlZCk7XG4gICAgfVxuICB9XG59XG5cbi8qKiBSZWZyZXNoZXMgY2hpbGQgY29tcG9uZW50cyBpbiB0aGUgY3VycmVudCB2aWV3ICh1cGRhdGUgbW9kZSkuICovXG5mdW5jdGlvbiBkZXRlY3RDaGFuZ2VzSW5DaGlsZENvbXBvbmVudHMoXG4gIGhvc3RMVmlldzogTFZpZXcsXG4gIGNvbXBvbmVudHM6IG51bWJlcltdLFxuICBtb2RlOiBDaGFuZ2VEZXRlY3Rpb25Nb2RlLFxuKTogdm9pZCB7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgY29tcG9uZW50cy5sZW5ndGg7IGkrKykge1xuICAgIGRldGVjdENoYW5nZXNJbkNvbXBvbmVudChob3N0TFZpZXcsIGNvbXBvbmVudHNbaV0sIG1vZGUpO1xuICB9XG59XG4iXX0=