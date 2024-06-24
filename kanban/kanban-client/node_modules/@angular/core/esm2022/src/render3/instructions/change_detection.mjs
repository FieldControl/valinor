/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { consumerAfterComputation, consumerBeforeComputation, consumerPollProducersForChange, } from '@angular/core/primitives/signals';
import { RuntimeError } from '../../errors';
import { assertDefined, assertEqual } from '../../util/assert';
import { executeCheckHooks, executeInitAndCheckHooks, incrementInitPhaseFlags } from '../hooks';
import { CONTAINER_HEADER_OFFSET, LContainerFlags, MOVED_VIEWS } from '../interfaces/container';
import { CONTEXT, EFFECTS_TO_SCHEDULE, ENVIRONMENT, FLAGS, REACTIVE_TEMPLATE_CONSUMER, TVIEW, } from '../interfaces/view';
import { getOrBorrowReactiveLViewConsumer, maybeReturnReactiveLViewConsumer, } from '../reactive_lview_consumer';
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
    let prevConsumer = null;
    let currentConsumer = null;
    if (!isInCheckNoChangesPass && viewShouldHaveReactiveConsumer(tView)) {
        currentConsumer = getOrBorrowReactiveLViewConsumer(lView);
        prevConsumer = consumerBeforeComputation(currentConsumer);
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
            maybeReturnReactiveLViewConsumer(currentConsumer);
        }
        leaveView();
    }
}
/**
 * Indicates if the view should get its own reactive consumer node.
 *
 * In the current design, all embedded views share a consumer with the component view. This allows
 * us to refresh at the component level rather than at a per-view level. In addition, root views get
 * their own reactive node because root component will have a host view that executes the
 * component's host bindings. This needs to be tracked in a consumer as well.
 *
 * To get a more granular change detection than per-component, all we would just need to update the
 * condition here so that a given view gets a reactive consumer which can become dirty independently
 * from its parent component. For example embedded views for signal components could be created with
 * a new type "SignalEmbeddedView" and the condition here wouldn't even need updating in order to
 * get granular per-view change detection for signal components.
 */
function viewShouldHaveReactiveConsumer(tView) {
    return tView.type !== 2 /* TViewType.Embedded */;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhbmdlX2RldGVjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc3JjL3JlbmRlcjMvaW5zdHJ1Y3Rpb25zL2NoYW5nZV9kZXRlY3Rpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUNMLHdCQUF3QixFQUN4Qix5QkFBeUIsRUFDekIsOEJBQThCLEdBRS9CLE1BQU0sa0NBQWtDLENBQUM7QUFFMUMsT0FBTyxFQUFDLFlBQVksRUFBbUIsTUFBTSxjQUFjLENBQUM7QUFDNUQsT0FBTyxFQUFDLGFBQWEsRUFBRSxXQUFXLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUM3RCxPQUFPLEVBQUMsaUJBQWlCLEVBQUUsd0JBQXdCLEVBQUUsdUJBQXVCLEVBQUMsTUFBTSxVQUFVLENBQUM7QUFDOUYsT0FBTyxFQUFDLHVCQUF1QixFQUFFLGVBQWUsRUFBRSxXQUFXLEVBQUMsTUFBTSx5QkFBeUIsQ0FBQztBQUU5RixPQUFPLEVBQ0wsT0FBTyxFQUNQLG1CQUFtQixFQUNuQixXQUFXLEVBQ1gsS0FBSyxFQUlMLDBCQUEwQixFQUMxQixLQUFLLEdBR04sTUFBTSxvQkFBb0IsQ0FBQztBQUM1QixPQUFPLEVBQ0wsZ0NBQWdDLEVBQ2hDLGdDQUFnQyxHQUVqQyxNQUFNLDRCQUE0QixDQUFDO0FBQ3BDLE9BQU8sRUFDTCxrQkFBa0IsRUFDbEIsU0FBUyxFQUNULDBCQUEwQixFQUMxQixzQkFBc0IsRUFDdEIsaUJBQWlCLEVBQ2pCLFNBQVMsRUFDVCxlQUFlLEVBQ2YseUJBQXlCLEVBQ3pCLG9CQUFvQixHQUNyQixNQUFNLFVBQVUsQ0FBQztBQUNsQixPQUFPLEVBQUMsa0JBQWtCLEVBQUUsaUJBQWlCLEVBQUMsTUFBTSw4QkFBOEIsQ0FBQztBQUNuRixPQUFPLEVBQ0wsd0JBQXdCLEVBQ3hCLGNBQWMsRUFDZCx5QkFBeUIsRUFDekIsa0JB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LENBQUMsQ0FBQyxnRkFBMEQsQ0FBQyxDQUFDO0lBRTlFLElBQUksaUJBQWlCLEVBQUUsQ0FBQztRQUN0QixXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBQzVELENBQUM7U0FBTSxJQUFJLEtBQUssK0NBQW9DLEVBQUUsQ0FBQztRQUNyRCw0QkFBNEIsQ0FBQyxLQUFLLHVDQUErQixDQUFDO1FBQ2xFLE1BQU0sVUFBVSxHQUFHLEtBQUssQ0FBQyxVQUFVLENBQUM7UUFDcEMsSUFBSSxVQUFVLEtBQUssSUFBSSxFQUFFLENBQUM7WUFDeEIsOEJBQThCLENBQUMsS0FBSyxFQUFFLFVBQVUsdUNBQStCLENBQUM7UUFDbEYsQ0FBQztJQUNILENBQUM7QUFDSCxDQUFDO0FBRUQsb0VBQW9FO0FBQ3BFLFNBQVMsOEJBQThCLENBQ3JDLFNBQWdCLEVBQ2hCLFVBQW9CLEVBQ3BCLElBQXlCO0lBRXpCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7UUFDM0Msd0JBQXdCLENBQUMsU0FBUyxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUMzRCxDQUFDO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1xuICBjb25zdW1lckFmdGVyQ29tcHV0YXRpb24sXG4gIGNvbnN1bWVyQmVmb3JlQ29tcHV0YXRpb24sXG4gIGNvbnN1bWVyUG9sbFByb2R1Y2Vyc0ZvckNoYW5nZSxcbiAgUmVhY3RpdmVOb2RlLFxufSBmcm9tICdAYW5ndWxhci9jb3JlL3ByaW1pdGl2ZXMvc2lnbmFscyc7XG5cbmltcG9ydCB7UnVudGltZUVycm9yLCBSdW50aW1lRXJyb3JDb2RlfSBmcm9tICcuLi8uLi9lcnJvcnMnO1xuaW1wb3J0IHthc3NlcnREZWZpbmVkLCBhc3NlcnRFcXVhbH0gZnJvbSAnLi4vLi4vdXRpbC9hc3NlcnQnO1xuaW1wb3J0IHtleGVjdXRlQ2hlY2tIb29rcywgZXhlY3V0ZUluaXRBbmRDaGVja0hvb2tzLCBpbmNyZW1lbnRJbml0UGhhc2VGbGFnc30gZnJvbSAnLi4vaG9va3MnO1xuaW1wb3J0IHtDT05UQUlORVJfSEVBREVSX09GRlNFVCwgTENvbnRhaW5lckZsYWdzLCBNT1ZFRF9WSUVXU30gZnJvbSAnLi4vaW50ZXJmYWNlcy9jb250YWluZXInO1xuaW1wb3J0IHtDb21wb25lbnRUZW1wbGF0ZSwgUmVuZGVyRmxhZ3N9IGZyb20gJy4uL2ludGVyZmFjZXMvZGVmaW5pdGlvbic7XG5pbXBvcnQge1xuICBDT05URVhULFxuICBFRkZFQ1RTX1RPX1NDSEVEVUxFLFxuICBFTlZJUk9OTUVOVCxcbiAgRkxBR1MsXG4gIEluaXRQaGFzZVN0YXRlLFxuICBMVmlldyxcbiAgTFZpZXdGbGFncyxcbiAgUkVBQ1RJVkVfVEVNUExBVEVfQ09OU1VNRVIsXG4gIFRWSUVXLFxuICBUVmlldyxcbiAgVFZpZXdUeXBlLFxufSBmcm9tICcuLi9pbnRlcmZhY2VzL3ZpZXcnO1xuaW1wb3J0IHtcbiAgZ2V0T3JCb3Jyb3dSZWFjdGl2ZUxWaWV3Q29uc3VtZXIsXG4gIG1heWJlUmV0dXJuUmVhY3RpdmVMVmlld0NvbnN1bWVyLFxuICBSZWFjdGl2ZUxWaWV3Q29uc3VtZXIsXG59IGZyb20gJy4uL3JlYWN0aXZlX2x2aWV3X2NvbnN1bWVyJztcbmltcG9ydCB7XG4gIENoZWNrTm9DaGFuZ2VzTW9kZSxcbiAgZW50ZXJWaWV3LFxuICBpc0V4aGF1c3RpdmVDaGVja05vQ2hhbmdlcyxcbiAgaXNJbkNoZWNrTm9DaGFuZ2VzTW9kZSxcbiAgaXNSZWZyZXNoaW5nVmlld3MsXG4gIGxlYXZlVmlldyxcbiAgc2V0QmluZGluZ0luZGV4LFxuICBzZXRJc0luQ2hlY2tOb0NoYW5nZXNNb2RlLFxuICBzZXRJc1JlZnJlc2hpbmdWaWV3cyxcbn0gZnJvbSAnLi4vc3RhdGUnO1xuaW1wb3J0IHtnZXRGaXJzdExDb250YWluZXIsIGdldE5leHRMQ29udGFpbmVyfSBmcm9tICcuLi91dGlsL3ZpZXdfdHJhdmVyc2FsX3V0aWxzJztcbmltcG9ydCB7XG4gIGdldENvbXBvbmVudExWaWV3QnlJbmRleCxcbiAgaXNDcmVhdGlvbk1vZGUsXG4gIG1hcmtBbmNlc3RvcnNGb3JUcmF2ZXJzYWwsXG4gIG1hcmtWaWV3Rm9yUmVmcmVzaCxcbiAgcmVxdWlyZXNSZWZyZXNoT3JUcmF2ZXJzYWwsXG4gIHJlc2V0UHJlT3JkZXJIb29rRmxhZ3MsXG4gIHZpZXdBdHRhY2hlZFRvQ2hhbmdlRGV0ZWN0b3IsXG59IGZyb20gJy4uL3V0aWwvdmlld191dGlscyc7XG5cbmltcG9ydCB7XG4gIGV4ZWN1dGVUZW1wbGF0ZSxcbiAgZXhlY3V0ZVZpZXdRdWVyeUZuLFxuICBoYW5kbGVFcnJvcixcbiAgcHJvY2Vzc0hvc3RCaW5kaW5nT3BDb2RlcyxcbiAgcmVmcmVzaENvbnRlbnRRdWVyaWVzLFxufSBmcm9tICcuL3NoYXJlZCc7XG5cbi8qKlxuICogVGhlIG1heGltdW0gbnVtYmVyIG9mIHRpbWVzIHRoZSBjaGFuZ2UgZGV0ZWN0aW9uIHRyYXZlcnNhbCB3aWxsIHJlcnVuIGJlZm9yZSB0aHJvd2luZyBhbiBlcnJvci5cbiAqL1xuZXhwb3J0IGNvbnN0IE1BWElNVU1fUkVGUkVTSF9SRVJVTlMgPSAxMDA7XG5cbmV4cG9ydCBmdW5jdGlvbiBkZXRlY3RDaGFuZ2VzSW50ZXJuYWwoXG4gIGxWaWV3OiBMVmlldyxcbiAgbm90aWZ5RXJyb3JIYW5kbGVyID0gdHJ1ZSxcbiAgbW9kZSA9IENoYW5nZURldGVjdGlvbk1vZGUuR2xvYmFsLFxuKSB7XG4gIGNvbnN0IGVudmlyb25tZW50ID0gbFZpZXdbRU5WSVJPTk1FTlRdO1xuICBjb25zdCByZW5kZXJlckZhY3RvcnkgPSBlbnZpcm9ubWVudC5yZW5kZXJlckZhY3Rvcnk7XG5cbiAgLy8gQ2hlY2sgbm8gY2hhbmdlcyBtb2RlIGlzIGEgZGV2IG9ubHkgbW9kZSB1c2VkIHRvIHZlcmlmeSB0aGF0IGJpbmRpbmdzIGhhdmUgbm90IGNoYW5nZWRcbiAgLy8gc2luY2UgdGhleSB3ZXJlIGFzc2lnbmVkLiBXZSBkbyBub3Qgd2FudCB0byBpbnZva2UgcmVuZGVyZXIgZmFjdG9yeSBmdW5jdGlvbnMgaW4gdGhhdCBtb2RlXG4gIC8vIHRvIGF2b2lkIGFueSBwb3NzaWJsZSBzaWRlLWVmZmVjdHMuXG4gIGNvbnN0IGNoZWNrTm9DaGFuZ2VzTW9kZSA9ICEhbmdEZXZNb2RlICYmIGlzSW5DaGVja05vQ2hhbmdlc01vZGUoKTtcblxuICBpZiAoIWNoZWNrTm9DaGFuZ2VzTW9kZSkge1xuICAgIHJlbmRlcmVyRmFjdG9yeS5iZWdpbj8uKCk7XG4gIH1cblxuICB0cnkge1xuICAgIGRldGVjdENoYW5nZXNJblZpZXdXaGlsZURpcnR5KGxWaWV3LCBtb2RlKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBpZiAobm90aWZ5RXJyb3JIYW5kbGVyKSB7XG4gICAgICBoYW5kbGVFcnJvcihsVmlldywgZXJyb3IpO1xuICAgIH1cbiAgICB0aHJvdyBlcnJvcjtcbiAgfSBmaW5hbGx5IHtcbiAgICBpZiAoIWNoZWNrTm9DaGFuZ2VzTW9kZSkge1xuICAgICAgcmVuZGVyZXJGYWN0b3J5LmVuZD8uKCk7XG5cbiAgICAgIC8vIE9uZSBmaW5hbCBmbHVzaCBvZiB0aGUgZWZmZWN0cyBxdWV1ZSB0byBjYXRjaCBhbnkgZWZmZWN0cyBjcmVhdGVkIGluIGBuZ0FmdGVyVmlld0luaXRgIG9yXG4gICAgICAvLyBvdGhlciBwb3N0LW9yZGVyIGhvb2tzLlxuICAgICAgZW52aXJvbm1lbnQuaW5saW5lRWZmZWN0UnVubmVyPy5mbHVzaCgpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBkZXRlY3RDaGFuZ2VzSW5WaWV3V2hpbGVEaXJ0eShsVmlldzogTFZpZXcsIG1vZGU6IENoYW5nZURldGVjdGlvbk1vZGUpIHtcbiAgY29uc3QgbGFzdElzUmVmcmVzaGluZ1ZpZXdzVmFsdWUgPSBpc1JlZnJlc2hpbmdWaWV3cygpO1xuICB0cnkge1xuICAgIHNldElzUmVmcmVzaGluZ1ZpZXdzKHRydWUpO1xuICAgIGRldGVjdENoYW5nZXNJblZpZXcobFZpZXcsIG1vZGUpO1xuXG4gICAgLy8gV2UgZG9uJ3QgbmVlZCBvciB3YW50IHRvIGRvIGFueSBsb29waW5nIHdoZW4gaW4gZXhoYXVzdGl2ZSBjaGVja05vQ2hhbmdlcyBiZWNhdXNlIHdlXG4gICAgLy8gYWxyZWFkeSB0cmF2ZXJzZSBhbGwgdGhlIHZpZXdzIGFuZCBub3RoaW5nIHNob3VsZCBjaGFuZ2Ugc28gd2Ugc2hvdWxkbid0IGhhdmUgdG8gZG9cbiAgICAvLyBhbm90aGVyIHBhc3MgdG8gcGljayB1cCBuZXcgY2hhbmdlcy5cbiAgICBpZiAobmdEZXZNb2RlICYmIGlzRXhoYXVzdGl2ZUNoZWNrTm9DaGFuZ2VzKCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgcmV0cmllcyA9IDA7XG4gICAgLy8gSWYgYWZ0ZXIgcnVubmluZyBjaGFuZ2UgZGV0ZWN0aW9uLCB0aGlzIHZpZXcgc3RpbGwgbmVlZHMgdG8gYmUgcmVmcmVzaGVkIG9yIHRoZXJlIGFyZVxuICAgIC8vIGRlc2NlbmRhbnRzIHZpZXdzIHRoYXQgbmVlZCB0byBiZSByZWZyZXNoZWQgZHVlIHRvIHJlLWRpcnR5aW5nIGR1cmluZyB0aGUgY2hhbmdlIGRldGVjdGlvblxuICAgIC8vIHJ1biwgZGV0ZWN0IGNoYW5nZXMgb24gdGhlIHZpZXcgYWdhaW4uIFdlIHJ1biBjaGFuZ2UgZGV0ZWN0aW9uIGluIGBUYXJnZXRlZGAgbW9kZSB0byBvbmx5XG4gICAgLy8gcmVmcmVzaCB2aWV3cyB3aXRoIHRoZSBgUmVmcmVzaFZpZXdgIGZsYWcuXG4gICAgd2hpbGUgKHJlcXVpcmVzUmVmcmVzaE9yVHJhdmVyc2FsKGxWaWV3KSkge1xuICAgICAgaWYgKHJldHJpZXMgPT09IE1BWElNVU1fUkVGUkVTSF9SRVJVTlMpIHtcbiAgICAgICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgICBSdW50aW1lRXJyb3JDb2RlLklORklOSVRFX0NIQU5HRV9ERVRFQ1RJT04sXG4gICAgICAgICAgbmdEZXZNb2RlICYmXG4gICAgICAgICAgICAnSW5maW5pdGUgY2hhbmdlIGRldGVjdGlvbiB3aGlsZSB0cnlpbmcgdG8gcmVmcmVzaCB2aWV3cy4gJyArXG4gICAgICAgICAgICAgICdUaGVyZSBtYXkgYmUgY29tcG9uZW50cyB3aGljaCBlYWNoIGNhdXNlIHRoZSBvdGhlciB0byByZXF1aXJlIGEgcmVmcmVzaCwgJyArXG4gICAgICAgICAgICAgICdjYXVzaW5nIGFuIGluZmluaXRlIGxvb3AuJyxcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIHJldHJpZXMrKztcbiAgICAgIC8vIEV2ZW4gaWYgdGhpcyB2aWV3IGlzIGRldGFjaGVkLCB3ZSBzdGlsbCBkZXRlY3QgY2hhbmdlcyBpbiB0YXJnZXRlZCBtb2RlIGJlY2F1c2UgdGhpcyB3YXNcbiAgICAgIC8vIHRoZSByb290IG9mIHRoZSBjaGFuZ2UgZGV0ZWN0aW9uIHJ1bi5cbiAgICAgIGRldGVjdENoYW5nZXNJblZpZXcobFZpZXcsIENoYW5nZURldGVjdGlvbk1vZGUuVGFyZ2V0ZWQpO1xuICAgIH1cbiAgfSBmaW5hbGx5IHtcbiAgICAvLyByZXN0b3JlIHN0YXRlIHRvIHdoYXQgaXQgd2FzIGJlZm9yZSBlbnRlcmluZyB0aGlzIGNoYW5nZSBkZXRlY3Rpb24gbG9vcFxuICAgIHNldElzUmVmcmVzaGluZ1ZpZXdzKGxhc3RJc1JlZnJlc2hpbmdWaWV3c1ZhbHVlKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tOb0NoYW5nZXNJbnRlcm5hbChcbiAgbFZpZXc6IExWaWV3LFxuICBtb2RlOiBDaGVja05vQ2hhbmdlc01vZGUsXG4gIG5vdGlmeUVycm9ySGFuZGxlciA9IHRydWUsXG4pIHtcbiAgc2V0SXNJbkNoZWNrTm9DaGFuZ2VzTW9kZShtb2RlKTtcbiAgdHJ5IHtcbiAgICBkZXRlY3RDaGFuZ2VzSW50ZXJuYWwobFZpZXcsIG5vdGlmeUVycm9ySGFuZGxlcik7XG4gIH0gZmluYWxseSB7XG4gICAgc2V0SXNJbkNoZWNrTm9DaGFuZ2VzTW9kZShDaGVja05vQ2hhbmdlc01vZGUuT2ZmKTtcbiAgfVxufVxuXG4vKipcbiAqIERpZmZlcmVudCBtb2RlcyBvZiB0cmF2ZXJzaW5nIHRoZSBsb2dpY2FsIHZpZXcgdHJlZSBkdXJpbmcgY2hhbmdlIGRldGVjdGlvbi5cbiAqXG4gKlxuICogVGhlIGNoYW5nZSBkZXRlY3Rpb24gdHJhdmVyc2FsIGFsZ29yaXRobSBzd2l0Y2hlcyBiZXR3ZWVuIHRoZXNlIG1vZGVzIGJhc2VkIG9uIHZhcmlvdXNcbiAqIGNvbmRpdGlvbnMuXG4gKi9cbmV4cG9ydCBjb25zdCBlbnVtIENoYW5nZURldGVjdGlvbk1vZGUge1xuICAvKipcbiAgICogSW4gYEdsb2JhbGAgbW9kZSwgYERpcnR5YCBhbmQgYENoZWNrQWx3YXlzYCB2aWV3cyBhcmUgcmVmcmVzaGVkIGFzIHdlbGwgYXMgdmlld3Mgd2l0aCB0aGVcbiAgICogYFJlZnJlc2hWaWV3YCBmbGFnLlxuICAgKi9cbiAgR2xvYmFsLFxuICAvKipcbiAgICogSW4gYFRhcmdldGVkYCBtb2RlLCBvbmx5IHZpZXdzIHdpdGggdGhlIGBSZWZyZXNoVmlld2AgZmxhZyBvciB1cGRhdGVkIHNpZ25hbHMgYXJlIHJlZnJlc2hlZC5cbiAgICovXG4gIFRhcmdldGVkLFxufVxuXG4vKipcbiAqIFByb2Nlc3NlcyBhIHZpZXcgaW4gdXBkYXRlIG1vZGUuIFRoaXMgaW5jbHVkZXMgYSBudW1iZXIgb2Ygc3RlcHMgaW4gYSBzcGVjaWZpYyBvcmRlcjpcbiAqIC0gZXhlY3V0aW5nIGEgdGVtcGxhdGUgZnVuY3Rpb24gaW4gdXBkYXRlIG1vZGU7XG4gKiAtIGV4ZWN1dGluZyBob29rcztcbiAqIC0gcmVmcmVzaGluZyBxdWVyaWVzO1xuICogLSBzZXR0aW5nIGhvc3QgYmluZGluZ3M7XG4gKiAtIHJlZnJlc2hpbmcgY2hpbGQgKGVtYmVkZGVkIGFuZCBjb21wb25lbnQpIHZpZXdzLlxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiByZWZyZXNoVmlldzxUPihcbiAgdFZpZXc6IFRWaWV3LFxuICBsVmlldzogTFZpZXcsXG4gIHRlbXBsYXRlRm46IENvbXBvbmVudFRlbXBsYXRlPHt9PiB8IG51bGwsXG4gIGNvbnRleHQ6IFQsXG4pIHtcbiAgbmdEZXZNb2RlICYmIGFzc2VydEVxdWFsKGlzQ3JlYXRpb25Nb2RlKGxWaWV3KSwgZmFsc2UsICdTaG91bGQgYmUgcnVuIGluIHVwZGF0ZSBtb2RlJyk7XG4gIGNvbnN0IGZsYWdzID0gbFZpZXdbRkxBR1NdO1xuICBpZiAoKGZsYWdzICYgTFZpZXdGbGFncy5EZXN0cm95ZWQpID09PSBMVmlld0ZsYWdzLkRlc3Ryb3llZCkgcmV0dXJuO1xuXG4gIC8vIENoZWNrIG5vIGNoYW5nZXMgbW9kZSBpcyBhIGRldiBvbmx5IG1vZGUgdXNlZCB0byB2ZXJpZnkgdGhhdCBiaW5kaW5ncyBoYXZlIG5vdCBjaGFuZ2VkXG4gIC8vIHNpbmNlIHRoZXkgd2VyZSBhc3NpZ25lZC4gV2UgZG8gbm90IHdhbnQgdG8gZXhlY3V0ZSBsaWZlY3ljbGUgaG9va3MgaW4gdGhhdCBtb2RlLlxuICBjb25zdCBpc0luQ2hlY2tOb0NoYW5nZXNQYXNzID0gbmdEZXZNb2RlICYmIGlzSW5DaGVja05vQ2hhbmdlc01vZGUoKTtcbiAgY29uc3QgaXNJbkV4aGF1c3RpdmVDaGVja05vQ2hhbmdlc1Bhc3MgPSBuZ0Rldk1vZGUgJiYgaXNFeGhhdXN0aXZlQ2hlY2tOb0NoYW5nZXMoKTtcblxuICAhaXNJbkNoZWNrTm9DaGFuZ2VzUGFzcyAmJiBsVmlld1tFTlZJUk9OTUVOVF0uaW5saW5lRWZmZWN0UnVubmVyPy5mbHVzaCgpO1xuXG4gIC8vIFN0YXJ0IGNvbXBvbmVudCByZWFjdGl2ZSBjb250ZXh0XG4gIC8vIC0gV2UgbWlnaHQgYWxyZWFkeSBiZSBpbiBhIHJlYWN0aXZlIGNvbnRleHQgaWYgdGhpcyBpcyBhbiBlbWJlZGRlZCB2aWV3IG9mIHRoZSBob3N0LlxuICAvLyAtIFdlIG1pZ2h0IGJlIGRlc2NlbmRpbmcgaW50byBhIHZpZXcgdGhhdCBuZWVkcyBhIGNvbnN1bWVyLlxuICBlbnRlclZpZXcobFZpZXcpO1xuICBsZXQgcHJldkNvbnN1bWVyOiBSZWFjdGl2ZU5vZGUgfCBudWxsID0gbnVsbDtcbiAgbGV0IGN1cnJlbnRDb25zdW1lcjogUmVhY3RpdmVMVmlld0NvbnN1bWVyIHwgbnVsbCA9IG51bGw7XG4gIGlmICghaXNJbkNoZWNrTm9DaGFuZ2VzUGFzcyAmJiB2aWV3U2hvdWxkSGF2ZVJlYWN0aXZlQ29uc3VtZXIodFZpZXcpKSB7XG4gICAgY3VycmVudENvbnN1bWVyID0gZ2V0T3JCb3Jyb3dSZWFjdGl2ZUxWaWV3Q29uc3VtZXIobFZpZXcpO1xuICAgIHByZXZDb25zdW1lciA9IGNvbnN1bWVyQmVmb3JlQ29tcHV0YXRpb24oY3VycmVudENvbnN1bWVyKTtcbiAgfVxuXG4gIHRyeSB7XG4gICAgcmVzZXRQcmVPcmRlckhvb2tGbGFncyhsVmlldyk7XG5cbiAgICBzZXRCaW5kaW5nSW5kZXgodFZpZXcuYmluZGluZ1N0YXJ0SW5kZXgpO1xuICAgIGlmICh0ZW1wbGF0ZUZuICE9PSBudWxsKSB7XG4gICAgICBleGVjdXRlVGVtcGxhdGUodFZpZXcsIGxWaWV3LCB0ZW1wbGF0ZUZuLCBSZW5kZXJGbGFncy5VcGRhdGUsIGNvbnRleHQpO1xuICAgIH1cblxuICAgIGNvbnN0IGhvb2tzSW5pdFBoYXNlQ29tcGxldGVkID1cbiAgICAgIChmbGFncyAmIExWaWV3RmxhZ3MuSW5pdFBoYXNlU3RhdGVNYXNrKSA9PT0gSW5pdFBoYXNlU3RhdGUuSW5pdFBoYXNlQ29tcGxldGVkO1xuXG4gICAgLy8gZXhlY3V0ZSBwcmUtb3JkZXIgaG9va3MgKE9uSW5pdCwgT25DaGFuZ2VzLCBEb0NoZWNrKVxuICAgIC8vIFBFUkYgV0FSTklORzogZG8gTk9UIGV4dHJhY3QgdGhpcyB0byBhIHNlcGFyYXRlIGZ1bmN0aW9uIHdpdGhvdXQgcnVubmluZyBiZW5jaG1hcmtzXG4gICAgaWYgKCFpc0luQ2hlY2tOb0NoYW5nZXNQYXNzKSB7XG4gICAgICBpZiAoaG9va3NJbml0UGhhc2VDb21wbGV0ZWQpIHtcbiAgICAgICAgY29uc3QgcHJlT3JkZXJDaGVja0hvb2tzID0gdFZpZXcucHJlT3JkZXJDaGVja0hvb2tzO1xuICAgICAgICBpZiAocHJlT3JkZXJDaGVja0hvb2tzICE9PSBudWxsKSB7XG4gICAgICAgICAgZXhlY3V0ZUNoZWNrSG9va3MobFZpZXcsIHByZU9yZGVyQ2hlY2tIb29rcywgbnVsbCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IHByZU9yZGVySG9va3MgPSB0Vmlldy5wcmVPcmRlckhvb2tzO1xuICAgICAgICBpZiAocHJlT3JkZXJIb29rcyAhPT0gbnVsbCkge1xuICAgICAgICAgIGV4ZWN1dGVJbml0QW5kQ2hlY2tIb29rcyhsVmlldywgcHJlT3JkZXJIb29rcywgSW5pdFBoYXNlU3RhdGUuT25Jbml0SG9va3NUb0JlUnVuLCBudWxsKTtcbiAgICAgICAgfVxuICAgICAgICBpbmNyZW1lbnRJbml0UGhhc2VGbGFncyhsVmlldywgSW5pdFBoYXNlU3RhdGUuT25Jbml0SG9va3NUb0JlUnVuKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBXZSBkbyBub3QgbmVlZCB0byBtYXJrIHRyYW5zcGxhbnRlZCB2aWV3cyBmb3IgcmVmcmVzaCB3aGVuIGRvaW5nIGV4aGF1c3RpdmUgY2hlY2tzXG4gICAgLy8gYmVjYXVzZSBhbGwgdmlld3Mgd2lsbCBiZSByZWFjaGVkIGFueXdheXMgZHVyaW5nIHRoZSB0cmF2ZXJzYWwuXG4gICAgaWYgKCFpc0luRXhoYXVzdGl2ZUNoZWNrTm9DaGFuZ2VzUGFzcykge1xuICAgICAgLy8gRmlyc3QgbWFyayB0cmFuc3BsYW50ZWQgdmlld3MgdGhhdCBhcmUgZGVjbGFyZWQgaW4gdGhpcyBsVmlldyBhcyBuZWVkaW5nIGEgcmVmcmVzaCBhdCB0aGVpclxuICAgICAgLy8gaW5zZXJ0aW9uIHBvaW50cy4gVGhpcyBpcyBuZWVkZWQgdG8gYXZvaWQgdGhlIHNpdHVhdGlvbiB3aGVyZSB0aGUgdGVtcGxhdGUgaXMgZGVmaW5lZCBpbiB0aGlzXG4gICAgICAvLyBgTFZpZXdgIGJ1dCBpdHMgZGVjbGFyYXRpb24gYXBwZWFycyBhZnRlciB0aGUgaW5zZXJ0aW9uIGNvbXBvbmVudC5cbiAgICAgIG1hcmtUcmFuc3BsYW50ZWRWaWV3c0ZvclJlZnJlc2gobFZpZXcpO1xuICAgIH1cbiAgICBkZXRlY3RDaGFuZ2VzSW5FbWJlZGRlZFZpZXdzKGxWaWV3LCBDaGFuZ2VEZXRlY3Rpb25Nb2RlLkdsb2JhbCk7XG5cbiAgICAvLyBDb250ZW50IHF1ZXJ5IHJlc3VsdHMgbXVzdCBiZSByZWZyZXNoZWQgYmVmb3JlIGNvbnRlbnQgaG9va3MgYXJlIGNhbGxlZC5cbiAgICBpZiAodFZpZXcuY29udGVudFF1ZXJpZXMgIT09IG51bGwpIHtcbiAgICAgIHJlZnJlc2hDb250ZW50UXVlcmllcyh0VmlldywgbFZpZXcpO1xuICAgIH1cblxuICAgIC8vIGV4ZWN1dGUgY29udGVudCBob29rcyAoQWZ0ZXJDb250ZW50SW5pdCwgQWZ0ZXJDb250ZW50Q2hlY2tlZClcbiAgICAvLyBQRVJGIFdBUk5JTkc6IGRvIE5PVCBleHRyYWN0IHRoaXMgdG8gYSBzZXBhcmF0ZSBmdW5jdGlvbiB3aXRob3V0IHJ1bm5pbmcgYmVuY2htYXJrc1xuICAgIGlmICghaXNJbkNoZWNrTm9DaGFuZ2VzUGFzcykge1xuICAgICAgaWYgKGhvb2tzSW5pdFBoYXNlQ29tcGxldGVkKSB7XG4gICAgICAgIGNvbnN0IGNvbnRlbnRDaGVja0hvb2tzID0gdFZpZXcuY29udGVudENoZWNrSG9va3M7XG4gICAgICAgIGlmIChjb250ZW50Q2hlY2tIb29rcyAhPT0gbnVsbCkge1xuICAgICAgICAgIGV4ZWN1dGVDaGVja0hvb2tzKGxWaWV3LCBjb250ZW50Q2hlY2tIb29rcyk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IGNvbnRlbnRIb29rcyA9IHRWaWV3LmNvbnRlbnRIb29rcztcbiAgICAgICAgaWYgKGNvbnRlbnRIb29rcyAhPT0gbnVsbCkge1xuICAgICAgICAgIGV4ZWN1dGVJbml0QW5kQ2hlY2tIb29rcyhcbiAgICAgICAgICAgIGxWaWV3LFxuICAgICAgICAgICAgY29udGVudEhvb2tzLFxuICAgICAgICAgICAgSW5pdFBoYXNlU3RhdGUuQWZ0ZXJDb250ZW50SW5pdEhvb2tzVG9CZVJ1bixcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIGluY3JlbWVudEluaXRQaGFzZUZsYWdzKGxWaWV3LCBJbml0UGhhc2VTdGF0ZS5BZnRlckNvbnRlbnRJbml0SG9va3NUb0JlUnVuKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBwcm9jZXNzSG9zdEJpbmRpbmdPcENvZGVzKHRWaWV3LCBsVmlldyk7XG5cbiAgICAvLyBSZWZyZXNoIGNoaWxkIGNvbXBvbmVudCB2aWV3cy5cbiAgICBjb25zdCBjb21wb25lbnRzID0gdFZpZXcuY29tcG9uZW50cztcbiAgICBpZiAoY29tcG9uZW50cyAhPT0gbnVsbCkge1xuICAgICAgZGV0ZWN0Q2hhbmdlc0luQ2hpbGRDb21wb25lbnRzKGxWaWV3LCBjb21wb25lbnRzLCBDaGFuZ2VEZXRlY3Rpb25Nb2RlLkdsb2JhbCk7XG4gICAgfVxuXG4gICAgLy8gVmlldyBxdWVyaWVzIG11c3QgZXhlY3V0ZSBhZnRlciByZWZyZXNoaW5nIGNoaWxkIGNvbXBvbmVudHMgYmVjYXVzZSBhIHRlbXBsYXRlIGluIHRoaXMgdmlld1xuICAgIC8vIGNvdWxkIGJlIGluc2VydGVkIGluIGEgY2hpbGQgY29tcG9uZW50LiBJZiB0aGUgdmlldyBxdWVyeSBleGVjdXRlcyBiZWZvcmUgY2hpbGQgY29tcG9uZW50XG4gICAgLy8gcmVmcmVzaCwgdGhlIHRlbXBsYXRlIG1pZ2h0IG5vdCB5ZXQgYmUgaW5zZXJ0ZWQuXG4gICAgY29uc3Qgdmlld1F1ZXJ5ID0gdFZpZXcudmlld1F1ZXJ5O1xuICAgIGlmICh2aWV3UXVlcnkgIT09IG51bGwpIHtcbiAgICAgIGV4ZWN1dGVWaWV3UXVlcnlGbjxUPihSZW5kZXJGbGFncy5VcGRhdGUsIHZpZXdRdWVyeSwgY29udGV4dCk7XG4gICAgfVxuXG4gICAgLy8gZXhlY3V0ZSB2aWV3IGhvb2tzIChBZnRlclZpZXdJbml0LCBBZnRlclZpZXdDaGVja2VkKVxuICAgIC8vIFBFUkYgV0FSTklORzogZG8gTk9UIGV4dHJhY3QgdGhpcyB0byBhIHNlcGFyYXRlIGZ1bmN0aW9uIHdpdGhvdXQgcnVubmluZyBiZW5jaG1hcmtzXG4gICAgaWYgKCFpc0luQ2hlY2tOb0NoYW5nZXNQYXNzKSB7XG4gICAgICBpZiAoaG9va3NJbml0UGhhc2VDb21wbGV0ZWQpIHtcbiAgICAgICAgY29uc3Qgdmlld0NoZWNrSG9va3MgPSB0Vmlldy52aWV3Q2hlY2tIb29rcztcbiAgICAgICAgaWYgKHZpZXdDaGVja0hvb2tzICE9PSBudWxsKSB7XG4gICAgICAgICAgZXhlY3V0ZUNoZWNrSG9va3MobFZpZXcsIHZpZXdDaGVja0hvb2tzKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3Qgdmlld0hvb2tzID0gdFZpZXcudmlld0hvb2tzO1xuICAgICAgICBpZiAodmlld0hvb2tzICE9PSBudWxsKSB7XG4gICAgICAgICAgZXhlY3V0ZUluaXRBbmRDaGVja0hvb2tzKGxWaWV3LCB2aWV3SG9va3MsIEluaXRQaGFzZVN0YXRlLkFmdGVyVmlld0luaXRIb29rc1RvQmVSdW4pO1xuICAgICAgICB9XG4gICAgICAgIGluY3JlbWVudEluaXRQaGFzZUZsYWdzKGxWaWV3LCBJbml0UGhhc2VTdGF0ZS5BZnRlclZpZXdJbml0SG9va3NUb0JlUnVuKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHRWaWV3LmZpcnN0VXBkYXRlUGFzcyA9PT0gdHJ1ZSkge1xuICAgICAgLy8gV2UgbmVlZCB0byBtYWtlIHN1cmUgdGhhdCB3ZSBvbmx5IGZsaXAgdGhlIGZsYWcgb24gc3VjY2Vzc2Z1bCBgcmVmcmVzaFZpZXdgIG9ubHlcbiAgICAgIC8vIERvbid0IGRvIHRoaXMgaW4gYGZpbmFsbHlgIGJsb2NrLlxuICAgICAgLy8gSWYgd2UgZGlkIHRoaXMgaW4gYGZpbmFsbHlgIGJsb2NrIHRoZW4gYW4gZXhjZXB0aW9uIGNvdWxkIGJsb2NrIHRoZSBleGVjdXRpb24gb2Ygc3R5bGluZ1xuICAgICAgLy8gaW5zdHJ1Y3Rpb25zIHdoaWNoIGluIHR1cm4gd291bGQgYmUgdW5hYmxlIHRvIGluc2VydCB0aGVtc2VsdmVzIGludG8gdGhlIHN0eWxpbmcgbGlua2VkXG4gICAgICAvLyBsaXN0LiBUaGUgcmVzdWx0IG9mIHRoaXMgd291bGQgYmUgdGhhdCBpZiB0aGUgZXhjZXB0aW9uIHdvdWxkIG5vdCBiZSB0aHJvdyBvbiBzdWJzZXF1ZW50IENEXG4gICAgICAvLyB0aGUgc3R5bGluZyB3b3VsZCBiZSB1bmFibGUgdG8gcHJvY2VzcyBpdCBkYXRhIGFuZCByZWZsZWN0IHRvIHRoZSBET00uXG4gICAgICB0Vmlldy5maXJzdFVwZGF0ZVBhc3MgPSBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBTY2hlZHVsZSBhbnkgZWZmZWN0cyB0aGF0IGFyZSB3YWl0aW5nIG9uIHRoZSB1cGRhdGUgcGFzcyBvZiB0aGlzIHZpZXcuXG4gICAgaWYgKGxWaWV3W0VGRkVDVFNfVE9fU0NIRURVTEVdKSB7XG4gICAgICBmb3IgKGNvbnN0IG5vdGlmeUVmZmVjdCBvZiBsVmlld1tFRkZFQ1RTX1RPX1NDSEVEVUxFXSkge1xuICAgICAgICBub3RpZnlFZmZlY3QoKTtcbiAgICAgIH1cblxuICAgICAgLy8gT25jZSB0aGV5J3ZlIGJlZW4gcnVuLCB3ZSBjYW4gZHJvcCB0aGUgYXJyYXkuXG4gICAgICBsVmlld1tFRkZFQ1RTX1RPX1NDSEVEVUxFXSA9IG51bGw7XG4gICAgfVxuXG4gICAgLy8gRG8gbm90IHJlc2V0IHRoZSBkaXJ0eSBzdGF0ZSB3aGVuIHJ1bm5pbmcgaW4gY2hlY2sgbm8gY2hhbmdlcyBtb2RlLiBXZSBkb24ndCB3YW50IGNvbXBvbmVudHNcbiAgICAvLyB0byBiZWhhdmUgZGlmZmVyZW50bHkgZGVwZW5kaW5nIG9uIHdoZXRoZXIgY2hlY2sgbm8gY2hhbmdlcyBpcyBlbmFibGVkIG9yIG5vdC4gRm9yIGV4YW1wbGU6XG4gICAgLy8gTWFya2luZyBhbiBPblB1c2ggY29tcG9uZW50IGFzIGRpcnR5IGZyb20gd2l0aGluIHRoZSBgbmdBZnRlclZpZXdJbml0YCBob29rIGluIG9yZGVyIHRvXG4gICAgLy8gcmVmcmVzaCBhIGBOZ0NsYXNzYCBiaW5kaW5nIHNob3VsZCB3b3JrLiBJZiB3ZSB3b3VsZCByZXNldCB0aGUgZGlydHkgc3RhdGUgaW4gdGhlIGNoZWNrXG4gICAgLy8gbm8gY2hhbmdlcyBjeWNsZSwgdGhlIGNvbXBvbmVudCB3b3VsZCBiZSBub3QgYmUgZGlydHkgZm9yIHRoZSBuZXh0IHVwZGF0ZSBwYXNzLiBUaGlzIHdvdWxkXG4gICAgLy8gYmUgZGlmZmVyZW50IGluIHByb2R1Y3Rpb24gbW9kZSB3aGVyZSB0aGUgY29tcG9uZW50IGRpcnR5IHN0YXRlIGlzIG5vdCByZXNldC5cbiAgICBpZiAoIWlzSW5DaGVja05vQ2hhbmdlc1Bhc3MpIHtcbiAgICAgIGxWaWV3W0ZMQUdTXSAmPSB+KExWaWV3RmxhZ3MuRGlydHkgfCBMVmlld0ZsYWdzLkZpcnN0TFZpZXdQYXNzKTtcbiAgICB9XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBpZiAoIWlzSW5DaGVja05vQ2hhbmdlc1Bhc3MpIHtcbiAgICAgIC8vIElmIHJlZnJlc2hpbmcgYSB2aWV3IGNhdXNlcyBhbiBlcnJvciwgd2UgbmVlZCB0byByZW1hcmsgdGhlIGFuY2VzdG9ycyBhcyBuZWVkaW5nIHRyYXZlcnNhbFxuICAgICAgLy8gYmVjYXVzZSB0aGUgZXJyb3IgbWlnaHQgaGF2ZSBjYXVzZWQgYSBzaXR1YXRpb24gd2hlcmUgdmlld3MgYmVsb3cgdGhlIGN1cnJlbnQgbG9jYXRpb24gYXJlXG4gICAgICAvLyBkaXJ0eSBidXQgd2lsbCBiZSB1bnJlYWNoYWJsZSBiZWNhdXNlIHRoZSBcImhhcyBkaXJ0eSBjaGlsZHJlblwiIGZsYWcgaW4gdGhlIGFuY2VzdG9ycyBoYXMgYmVlblxuICAgICAgLy8gY2xlYXJlZCBkdXJpbmcgY2hhbmdlIGRldGVjdGlvbiBhbmQgd2UgZmFpbGVkIHRvIHJ1biB0byBjb21wbGV0aW9uLlxuICAgICAgbWFya0FuY2VzdG9yc0ZvclRyYXZlcnNhbChsVmlldyk7XG4gICAgfVxuICAgIHRocm93IGU7XG4gIH0gZmluYWxseSB7XG4gICAgaWYgKGN1cnJlbnRDb25zdW1lciAhPT0gbnVsbCkge1xuICAgICAgY29uc3VtZXJBZnRlckNvbXB1dGF0aW9uKGN1cnJlbnRDb25zdW1lciwgcHJldkNvbnN1bWVyKTtcbiAgICAgIG1heWJlUmV0dXJuUmVhY3RpdmVMVmlld0NvbnN1bWVyKGN1cnJlbnRDb25zdW1lcik7XG4gICAgfVxuICAgIGxlYXZlVmlldygpO1xuICB9XG59XG5cbi8qKlxuICogSW5kaWNhdGVzIGlmIHRoZSB2aWV3IHNob3VsZCBnZXQgaXRzIG93biByZWFjdGl2ZSBjb25zdW1lciBub2RlLlxuICpcbiAqIEluIHRoZSBjdXJyZW50IGRlc2lnbiwgYWxsIGVtYmVkZGVkIHZpZXdzIHNoYXJlIGEgY29uc3VtZXIgd2l0aCB0aGUgY29tcG9uZW50IHZpZXcuIFRoaXMgYWxsb3dzXG4gKiB1cyB0byByZWZyZXNoIGF0IHRoZSBjb21wb25lbnQgbGV2ZWwgcmF0aGVyIHRoYW4gYXQgYSBwZXItdmlldyBsZXZlbC4gSW4gYWRkaXRpb24sIHJvb3Qgdmlld3MgZ2V0XG4gKiB0aGVpciBvd24gcmVhY3RpdmUgbm9kZSBiZWNhdXNlIHJvb3QgY29tcG9uZW50IHdpbGwgaGF2ZSBhIGhvc3QgdmlldyB0aGF0IGV4ZWN1dGVzIHRoZVxuICogY29tcG9uZW50J3MgaG9zdCBiaW5kaW5ncy4gVGhpcyBuZWVkcyB0byBiZSB0cmFja2VkIGluIGEgY29uc3VtZXIgYXMgd2VsbC5cbiAqXG4gKiBUbyBnZXQgYSBtb3JlIGdyYW51bGFyIGNoYW5nZSBkZXRlY3Rpb24gdGhhbiBwZXItY29tcG9uZW50LCBhbGwgd2Ugd291bGQganVzdCBuZWVkIHRvIHVwZGF0ZSB0aGVcbiAqIGNvbmRpdGlvbiBoZXJlIHNvIHRoYXQgYSBnaXZlbiB2aWV3IGdldHMgYSByZWFjdGl2ZSBjb25zdW1lciB3aGljaCBjYW4gYmVjb21lIGRpcnR5IGluZGVwZW5kZW50bHlcbiAqIGZyb20gaXRzIHBhcmVudCBjb21wb25lbnQuIEZvciBleGFtcGxlIGVtYmVkZGVkIHZpZXdzIGZvciBzaWduYWwgY29tcG9uZW50cyBjb3VsZCBiZSBjcmVhdGVkIHdpdGhcbiAqIGEgbmV3IHR5cGUgXCJTaWduYWxFbWJlZGRlZFZpZXdcIiBhbmQgdGhlIGNvbmRpdGlvbiBoZXJlIHdvdWxkbid0IGV2ZW4gbmVlZCB1cGRhdGluZyBpbiBvcmRlciB0b1xuICogZ2V0IGdyYW51bGFyIHBlci12aWV3IGNoYW5nZSBkZXRlY3Rpb24gZm9yIHNpZ25hbCBjb21wb25lbnRzLlxuICovXG5mdW5jdGlvbiB2aWV3U2hvdWxkSGF2ZVJlYWN0aXZlQ29uc3VtZXIodFZpZXc6IFRWaWV3KSB7XG4gIHJldHVybiB0Vmlldy50eXBlICE9PSBUVmlld1R5cGUuRW1iZWRkZWQ7XG59XG5cbi8qKlxuICogR29lcyBvdmVyIGVtYmVkZGVkIHZpZXdzIChvbmVzIGNyZWF0ZWQgdGhyb3VnaCBWaWV3Q29udGFpbmVyUmVmIEFQSXMpIGFuZCByZWZyZXNoZXNcbiAqIHRoZW0gYnkgZXhlY3V0aW5nIGFuIGFzc29jaWF0ZWQgdGVtcGxhdGUgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIGRldGVjdENoYW5nZXNJbkVtYmVkZGVkVmlld3MobFZpZXc6IExWaWV3LCBtb2RlOiBDaGFuZ2VEZXRlY3Rpb25Nb2RlKSB7XG4gIGZvciAoXG4gICAgbGV0IGxDb250YWluZXIgPSBnZXRGaXJzdExDb250YWluZXIobFZpZXcpO1xuICAgIGxDb250YWluZXIgIT09IG51bGw7XG4gICAgbENvbnRhaW5lciA9IGdldE5leHRMQ29udGFpbmVyKGxDb250YWluZXIpXG4gICkge1xuICAgIGZvciAobGV0IGkgPSBDT05UQUlORVJfSEVBREVSX09GRlNFVDsgaSA8IGxDb250YWluZXIubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGVtYmVkZGVkTFZpZXcgPSBsQ29udGFpbmVyW2ldO1xuICAgICAgZGV0ZWN0Q2hhbmdlc0luVmlld0lmQXR0YWNoZWQoZW1iZWRkZWRMVmlldywgbW9kZSk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogTWFyayB0cmFuc3BsYW50ZWQgdmlld3MgYXMgbmVlZGluZyB0byBiZSByZWZyZXNoZWQgYXQgdGhlaXIgYXR0YWNobWVudCBwb2ludHMuXG4gKlxuICogQHBhcmFtIGxWaWV3IFRoZSBgTFZpZXdgIHRoYXQgbWF5IGhhdmUgdHJhbnNwbGFudGVkIHZpZXdzLlxuICovXG5mdW5jdGlvbiBtYXJrVHJhbnNwbGFudGVkVmlld3NGb3JSZWZyZXNoKGxWaWV3OiBMVmlldykge1xuICBmb3IgKFxuICAgIGxldCBsQ29udGFpbmVyID0gZ2V0Rmlyc3RMQ29udGFpbmVyKGxWaWV3KTtcbiAgICBsQ29udGFpbmVyICE9PSBudWxsO1xuICAgIGxDb250YWluZXIgPSBnZXROZXh0TENvbnRhaW5lcihsQ29udGFpbmVyKVxuICApIHtcbiAgICBpZiAoIShsQ29udGFpbmVyW0ZMQUdTXSAmIExDb250YWluZXJGbGFncy5IYXNUcmFuc3BsYW50ZWRWaWV3cykpIGNvbnRpbnVlO1xuXG4gICAgY29uc3QgbW92ZWRWaWV3cyA9IGxDb250YWluZXJbTU9WRURfVklFV1NdITtcbiAgICBuZ0Rldk1vZGUgJiYgYXNzZXJ0RGVmaW5lZChtb3ZlZFZpZXdzLCAnVHJhbnNwbGFudGVkIFZpZXcgZmxhZ3Mgc2V0IGJ1dCBtaXNzaW5nIE1PVkVEX1ZJRVdTJyk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBtb3ZlZFZpZXdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBtb3ZlZExWaWV3ID0gbW92ZWRWaWV3c1tpXSE7XG4gICAgICBtYXJrVmlld0ZvclJlZnJlc2gobW92ZWRMVmlldyk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogRGV0ZWN0cyBjaGFuZ2VzIGluIGEgY29tcG9uZW50IGJ5IGVudGVyaW5nIHRoZSBjb21wb25lbnQgdmlldyBhbmQgcHJvY2Vzc2luZyBpdHMgYmluZGluZ3MsXG4gKiBxdWVyaWVzLCBldGMuIGlmIGl0IGlzIENoZWNrQWx3YXlzLCBPblB1c2ggYW5kIERpcnR5LCBldGMuXG4gKlxuICogQHBhcmFtIGNvbXBvbmVudEhvc3RJZHggIEVsZW1lbnQgaW5kZXggaW4gTFZpZXdbXSAoYWRqdXN0ZWQgZm9yIEhFQURFUl9PRkZTRVQpXG4gKi9cbmZ1bmN0aW9uIGRldGVjdENoYW5nZXNJbkNvbXBvbmVudChcbiAgaG9zdExWaWV3OiBMVmlldyxcbiAgY29tcG9uZW50SG9zdElkeDogbnVtYmVyLFxuICBtb2RlOiBDaGFuZ2VEZXRlY3Rpb25Nb2RlLFxuKTogdm9pZCB7XG4gIG5nRGV2TW9kZSAmJiBhc3NlcnRFcXVhbChpc0NyZWF0aW9uTW9kZShob3N0TFZpZXcpLCBmYWxzZSwgJ1Nob3VsZCBiZSBydW4gaW4gdXBkYXRlIG1vZGUnKTtcbiAgY29uc3QgY29tcG9uZW50VmlldyA9IGdldENvbXBvbmVudExWaWV3QnlJbmRleChjb21wb25lbnRIb3N0SWR4LCBob3N0TFZpZXcpO1xuICBkZXRlY3RDaGFuZ2VzSW5WaWV3SWZBdHRhY2hlZChjb21wb25lbnRWaWV3LCBtb2RlKTtcbn1cblxuLyoqXG4gKiBWaXNpdHMgYSB2aWV3IGFzIHBhcnQgb2YgY2hhbmdlIGRldGVjdGlvbiB0cmF2ZXJzYWwuXG4gKlxuICogSWYgdGhlIHZpZXcgaXMgZGV0YWNoZWQsIG5vIGFkZGl0aW9uYWwgdHJhdmVyc2FsIGhhcHBlbnMuXG4gKi9cbmZ1bmN0aW9uIGRldGVjdENoYW5nZXNJblZpZXdJZkF0dGFjaGVkKGxWaWV3OiBMVmlldywgbW9kZTogQ2hhbmdlRGV0ZWN0aW9uTW9kZSkge1xuICBpZiAoIXZpZXdBdHRhY2hlZFRvQ2hhbmdlRGV0ZWN0b3IobFZpZXcpKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGRldGVjdENoYW5nZXNJblZpZXcobFZpZXcsIG1vZGUpO1xufVxuXG4vKipcbiAqIFZpc2l0cyBhIHZpZXcgYXMgcGFydCBvZiBjaGFuZ2UgZGV0ZWN0aW9uIHRyYXZlcnNhbC5cbiAqXG4gKiBUaGUgdmlldyBpcyByZWZyZXNoZWQgaWY6XG4gKiAtIElmIHRoZSB2aWV3IGlzIENoZWNrQWx3YXlzIG9yIERpcnR5IGFuZCBDaGFuZ2VEZXRlY3Rpb25Nb2RlIGlzIGBHbG9iYWxgXG4gKiAtIElmIHRoZSB2aWV3IGhhcyB0aGUgYFJlZnJlc2hWaWV3YCBmbGFnXG4gKlxuICogVGhlIHZpZXcgaXMgbm90IHJlZnJlc2hlZCwgYnV0IGRlc2NlbmRhbnRzIGFyZSB0cmF2ZXJzZWQgaW4gYENoYW5nZURldGVjdGlvbk1vZGUuVGFyZ2V0ZWRgIGlmIHRoZVxuICogdmlldyBIYXNDaGlsZFZpZXdzVG9SZWZyZXNoIGZsYWcgaXMgc2V0LlxuICovXG5mdW5jdGlvbiBkZXRlY3RDaGFuZ2VzSW5WaWV3KGxWaWV3OiBMVmlldywgbW9kZTogQ2hhbmdlRGV0ZWN0aW9uTW9kZSkge1xuICBjb25zdCBpc0luQ2hlY2tOb0NoYW5nZXNQYXNzID0gbmdEZXZNb2RlICYmIGlzSW5DaGVja05vQ2hhbmdlc01vZGUoKTtcbiAgY29uc3QgdFZpZXcgPSBsVmlld1tUVklFV107XG4gIGNvbnN0IGZsYWdzID0gbFZpZXdbRkxBR1NdO1xuICBjb25zdCBjb25zdW1lciA9IGxWaWV3W1JFQUNUSVZFX1RFTVBMQVRFX0NPTlNVTUVSXTtcblxuICAvLyBSZWZyZXNoIENoZWNrQWx3YXlzIHZpZXdzIGluIEdsb2JhbCBtb2RlLlxuICBsZXQgc2hvdWxkUmVmcmVzaFZpZXc6IGJvb2xlYW4gPSAhIShcbiAgICBtb2RlID09PSBDaGFuZ2VEZXRlY3Rpb25Nb2RlLkdsb2JhbCAmJiBmbGFncyAmIExWaWV3RmxhZ3MuQ2hlY2tBbHdheXNcbiAgKTtcblxuICAvLyBSZWZyZXNoIERpcnR5IHZpZXdzIGluIEdsb2JhbCBtb2RlLCBhcyBsb25nIGFzIHdlJ3JlIG5vdCBpbiBjaGVja05vQ2hhbmdlcy5cbiAgLy8gQ2hlY2tOb0NoYW5nZXMgbmV2ZXIgd29ya2VkIHdpdGggYE9uUHVzaGAgY29tcG9uZW50cyBiZWNhdXNlIHRoZSBgRGlydHlgIGZsYWcgd2FzXG4gIC8vIGNsZWFyZWQgYmVmb3JlIGNoZWNrTm9DaGFuZ2VzIHJhbi4gQmVjYXVzZSB0aGVyZSBpcyBub3cgYSBsb29wIGZvciB0byBjaGVjayBmb3JcbiAgLy8gYmFja3dhcmRzIHZpZXdzLCBpdCBnaXZlcyBhbiBvcHBvcnR1bml0eSBmb3IgYE9uUHVzaGAgY29tcG9uZW50cyB0byBiZSBtYXJrZWQgYERpcnR5YFxuICAvLyBiZWZvcmUgdGhlIENoZWNrTm9DaGFuZ2VzIHBhc3MuIFdlIGRvbid0IHdhbnQgZXhpc3RpbmcgZXJyb3JzIHRoYXQgYXJlIGhpZGRlbiBieSB0aGVcbiAgLy8gY3VycmVudCBDaGVja05vQ2hhbmdlcyBidWcgdG8gc3VyZmFjZSB3aGVuIG1ha2luZyB1bnJlbGF0ZWQgY2hhbmdlcy5cbiAgc2hvdWxkUmVmcmVzaFZpZXcgfHw9ICEhKFxuICAgIGZsYWdzICYgTFZpZXdGbGFncy5EaXJ0eSAmJlxuICAgIG1vZGUgPT09IENoYW5nZURldGVjdGlvbk1vZGUuR2xvYmFsICYmXG4gICAgIWlzSW5DaGVja05vQ2hhbmdlc1Bhc3NcbiAgKTtcblxuICAvLyBBbHdheXMgcmVmcmVzaCB2aWV3cyBtYXJrZWQgZm9yIHJlZnJlc2gsIHJlZ2FyZGxlc3Mgb2YgbW9kZS5cbiAgc2hvdWxkUmVmcmVzaFZpZXcgfHw9ICEhKGZsYWdzICYgTFZpZXdGbGFncy5SZWZyZXNoVmlldyk7XG5cbiAgLy8gUmVmcmVzaCB2aWV3cyB3aGVuIHRoZXkgaGF2ZSBhIGRpcnR5IHJlYWN0aXZlIGNvbnN1bWVyLCByZWdhcmRsZXNzIG9mIG1vZGUuXG4gIHNob3VsZFJlZnJlc2hWaWV3IHx8PSAhIShjb25zdW1lcj8uZGlydHkgJiYgY29uc3VtZXJQb2xsUHJvZHVjZXJzRm9yQ2hhbmdlKGNvbnN1bWVyKSk7XG5cbiAgc2hvdWxkUmVmcmVzaFZpZXcgfHw9ICEhKG5nRGV2TW9kZSAmJiBpc0V4aGF1c3RpdmVDaGVja05vQ2hhbmdlcygpKTtcblxuICAvLyBNYXJrIHRoZSBGbGFncyBhbmQgYFJlYWN0aXZlTm9kZWAgYXMgbm90IGRpcnR5IGJlZm9yZSByZWZyZXNoaW5nIHRoZSBjb21wb25lbnQsIHNvIHRoYXQgdGhleVxuICAvLyBjYW4gYmUgcmUtZGlydGllZCBkdXJpbmcgdGhlIHJlZnJlc2ggcHJvY2Vzcy5cbiAgaWYgKGNvbnN1bWVyKSB7XG4gICAgY29uc3VtZXIuZGlydHkgPSBmYWxzZTtcbiAgfVxuICBsVmlld1tGTEFHU10gJj0gfihMVmlld0ZsYWdzLkhhc0NoaWxkVmlld3NUb1JlZnJlc2ggfCBMVmlld0ZsYWdzLlJlZnJlc2hWaWV3KTtcblxuICBpZiAoc2hvdWxkUmVmcmVzaFZpZXcpIHtcbiAgICByZWZyZXNoVmlldyh0VmlldywgbFZpZXcsIHRWaWV3LnRlbXBsYXRlLCBsVmlld1tDT05URVhUXSk7XG4gIH0gZWxzZSBpZiAoZmxhZ3MgJiBMVmlld0ZsYWdzLkhhc0NoaWxkVmlld3NUb1JlZnJlc2gpIHtcbiAgICBkZXRlY3RDaGFuZ2VzSW5FbWJlZGRlZFZpZXdzKGxWaWV3LCBDaGFuZ2VEZXRlY3Rpb25Nb2RlLlRhcmdldGVkKTtcbiAgICBjb25zdCBjb21wb25lbnRzID0gdFZpZXcuY29tcG9uZW50cztcbiAgICBpZiAoY29tcG9uZW50cyAhPT0gbnVsbCkge1xuICAgICAgZGV0ZWN0Q2hhbmdlc0luQ2hpbGRDb21wb25lbnRzKGxWaWV3LCBjb21wb25lbnRzLCBDaGFuZ2VEZXRlY3Rpb25Nb2RlLlRhcmdldGVkKTtcbiAgICB9XG4gIH1cbn1cblxuLyoqIFJlZnJlc2hlcyBjaGlsZCBjb21wb25lbnRzIGluIHRoZSBjdXJyZW50IHZpZXcgKHVwZGF0ZSBtb2RlKS4gKi9cbmZ1bmN0aW9uIGRldGVjdENoYW5nZXNJbkNoaWxkQ29tcG9uZW50cyhcbiAgaG9zdExWaWV3OiBMVmlldyxcbiAgY29tcG9uZW50czogbnVtYmVyW10sXG4gIG1vZGU6IENoYW5nZURldGVjdGlvbk1vZGUsXG4pOiB2b2lkIHtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb21wb25lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgZGV0ZWN0Q2hhbmdlc0luQ29tcG9uZW50KGhvc3RMVmlldywgY29tcG9uZW50c1tpXSwgbW9kZSk7XG4gIH1cbn1cbiJdfQ==