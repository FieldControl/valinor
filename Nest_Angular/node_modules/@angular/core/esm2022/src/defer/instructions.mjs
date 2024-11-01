/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { setActiveConsumer } from '@angular/core/primitives/signals';
import { CachedInjectorService } from '../cached_injector_service';
import { EnvironmentInjector, InjectionToken } from '../di';
import { internalImportProvidersFrom } from '../di/provider_collection';
import { RuntimeError } from '../errors';
import { findMatchingDehydratedView } from '../hydration/views';
import { populateDehydratedViewsInLContainer } from '../linker/view_container_ref';
import { PendingTasks } from '../pending_tasks';
import { assertLContainer, assertTNodeForLView } from '../render3/assert';
import { bindingUpdated } from '../render3/bindings';
import { ChainedInjector } from '../render3/chained_injector';
import { getComponentDef, getDirectiveDef, getPipeDef } from '../render3/definition';
import { getTemplateLocationDetails } from '../render3/instructions/element_validation';
import { markViewDirty } from '../render3/instructions/mark_view_dirty';
import { handleError } from '../render3/instructions/shared';
import { declareTemplate } from '../render3/instructions/template';
import { isDestroyed } from '../render3/interfaces/type_checks';
import { HEADER_OFFSET, INJECTOR, PARENT, TVIEW } from '../render3/interfaces/view';
import { getCurrentTNode, getLView, getSelectedTNode, getTView, nextBindingIndex, } from '../render3/state';
import { isPlatformBrowser } from '../render3/util/misc_utils';
import { getConstant, getTNode, removeLViewOnDestroy, storeLViewOnDestroy, } from '../render3/util/view_utils';
import { addLViewToLContainer, createAndRenderEmbeddedLView, removeLViewFromLContainer, shouldAddViewToDom, } from '../render3/view_manipulation';
import { assertDefined, throwError } from '../util/assert';
import { performanceMarkFeature } from '../util/performance';
import { invokeAllTriggerCleanupFns, invokeTriggerCleanupFns, storeTriggerCleanupFn, } from './cleanup';
import { onHover, onInteraction, onViewport, registerDomTrigger } from './dom_triggers';
import { onIdle } from './idle_scheduler';
import { DEFER_BLOCK_STATE, DeferBlockBehavior, DeferBlockInternalState, DeferBlockState, DeferDependenciesLoadingState, LOADING_AFTER_CLEANUP_FN, NEXT_DEFER_BLOCK_STATE, STATE_IS_FROZEN_UNTIL, } from './interfaces';
import { onTimer, scheduleTimerTrigger } from './timer_scheduler';
import { addDepsToRegistry, assertDeferredDependenciesLoaded, getLDeferBlockDetails, getLoadingBlockAfter, getMinimumDurationForState, getPrimaryBlockTNode, getTDeferBlockDetails, getTemplateIndexForState, setLDeferBlockDetails, setTDeferBlockDetails, } from './utils';
/**
 * **INTERNAL**, avoid referencing it in application code.
 * *
 * Injector token that allows to provide `DeferBlockDependencyInterceptor` class
 * implementation.
 *
 * This token is only injected in devMode
 */
export const DEFER_BLOCK_DEPENDENCY_INTERCEPTOR = new InjectionToken('DEFER_BLOCK_DEPENDENCY_INTERCEPTOR');
/**
 * **INTERNAL**, token used for configuring defer block behavior.
 */
export const DEFER_BLOCK_CONFIG = new InjectionToken(ngDevMode ? 'DEFER_BLOCK_CONFIG' : '');
/**
 * Returns whether defer blocks should be triggered.
 *
 * Currently, defer blocks are not triggered on the server,
 * only placeholder content is rendered (if provided).
 */
function shouldTriggerDeferBlock(injector) {
    const config = injector.get(DEFER_BLOCK_CONFIG, null, { optional: true });
    if (config?.behavior === DeferBlockBehavior.Manual) {
        return false;
    }
    return isPlatformBrowser(injector);
}
/**
 * Reference to the timer-based scheduler implementation of defer block state
 * rendering method. It's used to make timer-based scheduling tree-shakable.
 * If `minimum` or `after` parameters are used, compiler generates an extra
 * argument for the `ɵɵdefer` instruction, which references a timer-based
 * implementation.
 */
let applyDeferBlockStateWithSchedulingImpl = null;
/**
 * Enables timer-related scheduling if `after` or `minimum` parameters are setup
 * on the `@loading` or `@placeholder` blocks.
 */
export function ɵɵdeferEnableTimerScheduling(tView, tDetails, placeholderConfigIndex, loadingConfigIndex) {
    const tViewConsts = tView.consts;
    if (placeholderConfigIndex != null) {
        tDetails.placeholderBlockConfig = getConstant(tViewConsts, placeholderConfigIndex);
    }
    if (loadingConfigIndex != null) {
        tDetails.loadingBlockConfig = getConstant(tViewConsts, loadingConfigIndex);
    }
    // Enable implementation that supports timer-based scheduling.
    if (applyDeferBlockStateWithSchedulingImpl === null) {
        applyDeferBlockStateWithSchedulingImpl = applyDeferBlockStateWithScheduling;
    }
}
/**
 * Creates runtime data structures for defer blocks.
 *
 * @param index Index of the `defer` instruction.
 * @param primaryTmplIndex Index of the template with the primary block content.
 * @param dependencyResolverFn Function that contains dependencies for this defer block.
 * @param loadingTmplIndex Index of the template with the loading block content.
 * @param placeholderTmplIndex Index of the template with the placeholder block content.
 * @param errorTmplIndex Index of the template with the error block content.
 * @param loadingConfigIndex Index in the constants array of the configuration of the loading.
 *     block.
 * @param placeholderConfigIndex Index in the constants array of the configuration of the
 *     placeholder block.
 * @param enableTimerScheduling Function that enables timer-related scheduling if `after`
 *     or `minimum` parameters are setup on the `@loading` or `@placeholder` blocks.
 *
 * @codeGenApi
 */
export function ɵɵdefer(index, primaryTmplIndex, dependencyResolverFn, loadingTmplIndex, placeholderTmplIndex, errorTmplIndex, loadingConfigIndex, placeholderConfigIndex, enableTimerScheduling) {
    const lView = getLView();
    const tView = getTView();
    const adjustedIndex = index + HEADER_OFFSET;
    const tNode = declareTemplate(lView, tView, index, null, 0, 0);
    if (tView.firstCreatePass) {
        performanceMarkFeature('NgDefer');
        const tDetails = {
            primaryTmplIndex,
            loadingTmplIndex: loadingTmplIndex ?? null,
            placeholderTmplIndex: placeholderTmplIndex ?? null,
            errorTmplIndex: errorTmplIndex ?? null,
            placeholderBlockConfig: null,
            loadingBlockConfig: null,
            dependencyResolverFn: dependencyResolverFn ?? null,
            loadingState: DeferDependenciesLoadingState.NOT_STARTED,
            loadingPromise: null,
            providers: null,
        };
        enableTimerScheduling?.(tView, tDetails, placeholderConfigIndex, loadingConfigIndex);
        setTDeferBlockDetails(tView, adjustedIndex, tDetails);
    }
    const lContainer = lView[adjustedIndex];
    // If hydration is enabled, looks up dehydrated views in the DOM
    // using hydration annotation info and stores those views on LContainer.
    // In client-only mode, this function is a noop.
    populateDehydratedViewsInLContainer(lContainer, tNode, lView);
    // Init instance-specific defer details and store it.
    const lDetails = [
        null, // NEXT_DEFER_BLOCK_STATE
        DeferBlockInternalState.Initial, // DEFER_BLOCK_STATE
        null, // STATE_IS_FROZEN_UNTIL
        null, // LOADING_AFTER_CLEANUP_FN
        null, // TRIGGER_CLEANUP_FNS
        null, // PREFETCH_TRIGGER_CLEANUP_FNS
    ];
    setLDeferBlockDetails(lView, adjustedIndex, lDetails);
    const cleanupTriggersFn = () => invokeAllTriggerCleanupFns(lDetails);
    // When defer block is triggered - unsubscribe from LView destroy cleanup.
    storeTriggerCleanupFn(0 /* TriggerType.Regular */, lDetails, () => removeLViewOnDestroy(lView, cleanupTriggersFn));
    storeLViewOnDestroy(lView, cleanupTriggersFn);
}
/**
 * Loads defer block dependencies when a trigger value becomes truthy.
 * @codeGenApi
 */
export function ɵɵdeferWhen(rawValue) {
    const lView = getLView();
    const bindingIndex = nextBindingIndex();
    if (bindingUpdated(lView, bindingIndex, rawValue)) {
        const prevConsumer = setActiveConsumer(null);
        try {
            const value = Boolean(rawValue); // handle truthy or falsy values
            const tNode = getSelectedTNode();
            const lDetails = getLDeferBlockDetails(lView, tNode);
            const renderedState = lDetails[DEFER_BLOCK_STATE];
            if (value === false && renderedState === DeferBlockInternalState.Initial) {
                // If nothing is rendered yet, render a placeholder (if defined).
                renderPlaceholder(lView, tNode);
            }
            else if (value === true &&
                (renderedState === DeferBlockInternalState.Initial ||
                    renderedState === DeferBlockState.Placeholder)) {
                // The `when` condition has changed to `true`, trigger defer block loading
                // if the block is either in initial (nothing is rendered) or a placeholder
                // state.
                triggerDeferBlock(lView, tNode);
            }
        }
        finally {
            setActiveConsumer(prevConsumer);
        }
    }
}
/**
 * Prefetches the deferred content when a value becomes truthy.
 * @codeGenApi
 */
export function ɵɵdeferPrefetchWhen(rawValue) {
    const lView = getLView();
    const bindingIndex = nextBindingIndex();
    if (bindingUpdated(lView, bindingIndex, rawValue)) {
        const prevConsumer = setActiveConsumer(null);
        try {
            const value = Boolean(rawValue); // handle truthy or falsy values
            const tView = lView[TVIEW];
            const tNode = getSelectedTNode();
            const tDetails = getTDeferBlockDetails(tView, tNode);
            if (value === true && tDetails.loadingState === DeferDependenciesLoadingState.NOT_STARTED) {
                // If loading has not been started yet, trigger it now.
                triggerPrefetching(tDetails, lView, tNode);
            }
        }
        finally {
            setActiveConsumer(prevConsumer);
        }
    }
}
/**
 * Sets up logic to handle the `on idle` deferred trigger.
 * @codeGenApi
 */
export function ɵɵdeferOnIdle() {
    scheduleDelayedTrigger(onIdle);
}
/**
 * Sets up logic to handle the `prefetch on idle` deferred trigger.
 * @codeGenApi
 */
export function ɵɵdeferPrefetchOnIdle() {
    scheduleDelayedPrefetching(onIdle);
}
/**
 * Sets up logic to handle the `on immediate` deferred trigger.
 * @codeGenApi
 */
export function ɵɵdeferOnImmediate() {
    const lView = getLView();
    const tNode = getCurrentTNode();
    const tView = lView[TVIEW];
    const injector = lView[INJECTOR];
    const tDetails = getTDeferBlockDetails(tView, tNode);
    // Render placeholder block only if loading template is not present and we're on
    // the client to avoid content flickering, since it would be immediately replaced
    // by the loading block.
    if (!shouldTriggerDeferBlock(injector) || tDetails.loadingTmplIndex === null) {
        renderPlaceholder(lView, tNode);
    }
    triggerDeferBlock(lView, tNode);
}
/**
 * Sets up logic to handle the `prefetch on immediate` deferred trigger.
 * @codeGenApi
 */
export function ɵɵdeferPrefetchOnImmediate() {
    const lView = getLView();
    const tNode = getCurrentTNode();
    const tView = lView[TVIEW];
    const tDetails = getTDeferBlockDetails(tView, tNode);
    if (tDetails.loadingState === DeferDependenciesLoadingState.NOT_STARTED) {
        triggerResourceLoading(tDetails, lView, tNode);
    }
}
/**
 * Creates runtime data structures for the `on timer` deferred trigger.
 * @param delay Amount of time to wait before loading the content.
 * @codeGenApi
 */
export function ɵɵdeferOnTimer(delay) {
    scheduleDelayedTrigger(onTimer(delay));
}
/**
 * Creates runtime data structures for the `prefetch on timer` deferred trigger.
 * @param delay Amount of time to wait before prefetching the content.
 * @codeGenApi
 */
export function ɵɵdeferPrefetchOnTimer(delay) {
    scheduleDelayedPrefetching(onTimer(delay));
}
/**
 * Creates runtime data structures for the `on hover` deferred trigger.
 * @param triggerIndex Index at which to find the trigger element.
 * @param walkUpTimes Number of times to walk up/down the tree hierarchy to find the trigger.
 * @codeGenApi
 */
export function ɵɵdeferOnHover(triggerIndex, walkUpTimes) {
    const lView = getLView();
    const tNode = getCurrentTNode();
    renderPlaceholder(lView, tNode);
    registerDomTrigger(lView, tNode, triggerIndex, walkUpTimes, onHover, () => triggerDeferBlock(lView, tNode), 0 /* TriggerType.Regular */);
}
/**
 * Creates runtime data structures for the `prefetch on hover` deferred trigger.
 * @param triggerIndex Index at which to find the trigger element.
 * @param walkUpTimes Number of times to walk up/down the tree hierarchy to find the trigger.
 * @codeGenApi
 */
export function ɵɵdeferPrefetchOnHover(triggerIndex, walkUpTimes) {
    const lView = getLView();
    const tNode = getCurrentTNode();
    const tView = lView[TVIEW];
    const tDetails = getTDeferBlockDetails(tView, tNode);
    if (tDetails.loadingState === DeferDependenciesLoadingState.NOT_STARTED) {
        registerDomTrigger(lView, tNode, triggerIndex, walkUpTimes, onHover, () => triggerPrefetching(tDetails, lView, tNode), 1 /* TriggerType.Prefetch */);
    }
}
/**
 * Creates runtime data structures for the `on interaction` deferred trigger.
 * @param triggerIndex Index at which to find the trigger element.
 * @param walkUpTimes Number of times to walk up/down the tree hierarchy to find the trigger.
 * @codeGenApi
 */
export function ɵɵdeferOnInteraction(triggerIndex, walkUpTimes) {
    const lView = getLView();
    const tNode = getCurrentTNode();
    renderPlaceholder(lView, tNode);
    registerDomTrigger(lView, tNode, triggerIndex, walkUpTimes, onInteraction, () => triggerDeferBlock(lView, tNode), 0 /* TriggerType.Regular */);
}
/**
 * Creates runtime data structures for the `prefetch on interaction` deferred trigger.
 * @param triggerIndex Index at which to find the trigger element.
 * @param walkUpTimes Number of times to walk up/down the tree hierarchy to find the trigger.
 * @codeGenApi
 */
export function ɵɵdeferPrefetchOnInteraction(triggerIndex, walkUpTimes) {
    const lView = getLView();
    const tNode = getCurrentTNode();
    const tView = lView[TVIEW];
    const tDetails = getTDeferBlockDetails(tView, tNode);
    if (tDetails.loadingState === DeferDependenciesLoadingState.NOT_STARTED) {
        registerDomTrigger(lView, tNode, triggerIndex, walkUpTimes, onInteraction, () => triggerPrefetching(tDetails, lView, tNode), 1 /* TriggerType.Prefetch */);
    }
}
/**
 * Creates runtime data structures for the `on viewport` deferred trigger.
 * @param triggerIndex Index at which to find the trigger element.
 * @param walkUpTimes Number of times to walk up/down the tree hierarchy to find the trigger.
 * @codeGenApi
 */
export function ɵɵdeferOnViewport(triggerIndex, walkUpTimes) {
    const lView = getLView();
    const tNode = getCurrentTNode();
    renderPlaceholder(lView, tNode);
    registerDomTrigger(lView, tNode, triggerIndex, walkUpTimes, onViewport, () => triggerDeferBlock(lView, tNode), 0 /* TriggerType.Regular */);
}
/**
 * Creates runtime data structures for the `prefetch on viewport` deferred trigger.
 * @param triggerIndex Index at which to find the trigger element.
 * @param walkUpTimes Number of times to walk up/down the tree hierarchy to find the trigger.
 * @codeGenApi
 */
export function ɵɵdeferPrefetchOnViewport(triggerIndex, walkUpTimes) {
    const lView = getLView();
    const tNode = getCurrentTNode();
    const tView = lView[TVIEW];
    const tDetails = getTDeferBlockDetails(tView, tNode);
    if (tDetails.loadingState === DeferDependenciesLoadingState.NOT_STARTED) {
        registerDomTrigger(lView, tNode, triggerIndex, walkUpTimes, onViewport, () => triggerPrefetching(tDetails, lView, tNode), 1 /* TriggerType.Prefetch */);
    }
}
/********** Helper functions **********/
/**
 * Schedules triggering of a defer block for `on idle` and `on timer` conditions.
 */
function scheduleDelayedTrigger(scheduleFn) {
    const lView = getLView();
    const tNode = getCurrentTNode();
    renderPlaceholder(lView, tNode);
    // Only trigger the scheduled trigger on the browser
    // since we don't want to delay the server response.
    if (isPlatformBrowser(lView[INJECTOR])) {
        const cleanupFn = scheduleFn(() => triggerDeferBlock(lView, tNode), lView);
        const lDetails = getLDeferBlockDetails(lView, tNode);
        storeTriggerCleanupFn(0 /* TriggerType.Regular */, lDetails, cleanupFn);
    }
}
/**
 * Schedules prefetching for `on idle` and `on timer` triggers.
 *
 * @param scheduleFn A function that does the scheduling.
 */
function scheduleDelayedPrefetching(scheduleFn) {
    const lView = getLView();
    // Only trigger the scheduled trigger on the browser
    // since we don't want to delay the server response.
    if (isPlatformBrowser(lView[INJECTOR])) {
        const tNode = getCurrentTNode();
        const tView = lView[TVIEW];
        const tDetails = getTDeferBlockDetails(tView, tNode);
        if (tDetails.loadingState === DeferDependenciesLoadingState.NOT_STARTED) {
            const lDetails = getLDeferBlockDetails(lView, tNode);
            const prefetch = () => triggerPrefetching(tDetails, lView, tNode);
            const cleanupFn = scheduleFn(prefetch, lView);
            storeTriggerCleanupFn(1 /* TriggerType.Prefetch */, lDetails, cleanupFn);
        }
    }
}
/**
 * Transitions a defer block to the new state. Updates the  necessary
 * data structures and renders corresponding block.
 *
 * @param newState New state that should be applied to the defer block.
 * @param tNode TNode that represents a defer block.
 * @param lContainer Represents an instance of a defer block.
 * @param skipTimerScheduling Indicates that `@loading` and `@placeholder` block
 *   should be rendered immediately, even if they have `after` or `minimum` config
 *   options setup. This flag to needed for testing APIs to transition defer block
 *   between states via `DeferFixture.render` method.
 */
export function renderDeferBlockState(newState, tNode, lContainer, skipTimerScheduling = false) {
    const hostLView = lContainer[PARENT];
    const hostTView = hostLView[TVIEW];
    // Check if this view is not destroyed. Since the loading process was async,
    // the view might end up being destroyed by the time rendering happens.
    if (isDestroyed(hostLView))
        return;
    // Make sure this TNode belongs to TView that represents host LView.
    ngDevMode && assertTNodeForLView(tNode, hostLView);
    const lDetails = getLDeferBlockDetails(hostLView, tNode);
    ngDevMode && assertDefined(lDetails, 'Expected a defer block state defined');
    const currentState = lDetails[DEFER_BLOCK_STATE];
    if (isValidStateChange(currentState, newState) &&
        isValidStateChange(lDetails[NEXT_DEFER_BLOCK_STATE] ?? -1, newState)) {
        const injector = hostLView[INJECTOR];
        const tDetails = getTDeferBlockDetails(hostTView, tNode);
        // Skips scheduling on the server since it can delay the server response.
        const needsScheduling = !skipTimerScheduling &&
            isPlatformBrowser(injector) &&
            (getLoadingBlockAfter(tDetails) !== null ||
                getMinimumDurationForState(tDetails, DeferBlockState.Loading) !== null ||
                getMinimumDurationForState(tDetails, DeferBlockState.Placeholder));
        if (ngDevMode && needsScheduling) {
            assertDefined(applyDeferBlockStateWithSchedulingImpl, 'Expected scheduling function to be defined');
        }
        const applyStateFn = needsScheduling
            ? applyDeferBlockStateWithSchedulingImpl
            : applyDeferBlockState;
        try {
            applyStateFn(newState, lDetails, lContainer, tNode, hostLView);
        }
        catch (error) {
            handleError(hostLView, error);
        }
    }
}
/**
 * Checks whether there is a cached injector associated with a given defer block
 * declaration and returns if it exists. If there is no cached injector present -
 * creates a new injector and stores in the cache.
 */
function getOrCreateEnvironmentInjector(parentInjector, tDetails, providers) {
    return parentInjector
        .get(CachedInjectorService)
        .getOrCreateInjector(tDetails, parentInjector, providers, ngDevMode ? 'DeferBlock Injector' : '');
}
/**
 * Creates a new injector, which contains providers collected from dependencies (NgModules) of
 * defer-loaded components. This function detects different types of parent injectors and creates
 * a new injector based on that.
 */
function createDeferBlockInjector(parentInjector, tDetails, providers) {
    // Check if the parent injector is an instance of a `ChainedInjector`.
    //
    // In this case, we retain the shape of the injector and use a newly created
    // `EnvironmentInjector` as a parent in the `ChainedInjector`. That is needed to
    // make sure that the primary injector gets consulted first (since it's typically
    // a NodeInjector) and `EnvironmentInjector` tree is consulted after that.
    if (parentInjector instanceof ChainedInjector) {
        const origInjector = parentInjector.injector;
        // Guaranteed to be an environment injector
        const parentEnvInjector = parentInjector.parentInjector;
        const envInjector = getOrCreateEnvironmentInjector(parentEnvInjector, tDetails, providers);
        return new ChainedInjector(origInjector, envInjector);
    }
    const parentEnvInjector = parentInjector.get(EnvironmentInjector);
    // If the `parentInjector` is *not* an `EnvironmentInjector` - we need to create
    // a new `ChainedInjector` with the following setup:
    //
    //  - the provided `parentInjector` becomes a primary injector
    //  - an existing (real) `EnvironmentInjector` becomes a parent injector for
    //    a newly-created one, which contains extra providers
    //
    // So the final order in which injectors would be consulted in this case would look like this:
    //
    //  1. Provided `parentInjector`
    //  2. Newly-created `EnvironmentInjector` with extra providers
    //  3. `EnvironmentInjector` from the `parentInjector`
    if (parentEnvInjector !== parentInjector) {
        const envInjector = getOrCreateEnvironmentInjector(parentEnvInjector, tDetails, providers);
        return new ChainedInjector(parentInjector, envInjector);
    }
    // The `parentInjector` is an instance of an `EnvironmentInjector`.
    // No need for special handling, we can use `parentInjector` as a
    // parent injector directly.
    return getOrCreateEnvironmentInjector(parentInjector, tDetails, providers);
}
/**
 * Applies changes to the DOM to reflect a given state.
 */
function applyDeferBlockState(newState, lDetails, lContainer, tNode, hostLView) {
    const stateTmplIndex = getTemplateIndexForState(newState, hostLView, tNode);
    if (stateTmplIndex !== null) {
        lDetails[DEFER_BLOCK_STATE] = newState;
        const hostTView = hostLView[TVIEW];
        const adjustedIndex = stateTmplIndex + HEADER_OFFSET;
        const activeBlockTNode = getTNode(hostTView, adjustedIndex);
        // There is only 1 view that can be present in an LContainer that
        // represents a defer block, so always refer to the first one.
        const viewIndex = 0;
        removeLViewFromLContainer(lContainer, viewIndex);
        let injector;
        if (newState === DeferBlockState.Complete) {
            // When we render a defer block in completed state, there might be
            // newly loaded standalone components used within the block, which may
            // import NgModules with providers. In order to make those providers
            // available for components declared in that NgModule, we create an instance
            // of an environment injector to host those providers and pass this injector
            // to the logic that creates a view.
            const tDetails = getTDeferBlockDetails(hostTView, tNode);
            const providers = tDetails.providers;
            if (providers && providers.length > 0) {
                injector = createDeferBlockInjector(hostLView[INJECTOR], tDetails, providers);
            }
        }
        const dehydratedView = findMatchingDehydratedView(lContainer, activeBlockTNode.tView.ssrId);
        const embeddedLView = createAndRenderEmbeddedLView(hostLView, activeBlockTNode, null, {
            dehydratedView,
            injector,
        });
        addLViewToLContainer(lContainer, embeddedLView, viewIndex, shouldAddViewToDom(activeBlockTNode, dehydratedView));
        markViewDirty(embeddedLView, 2 /* NotificationSource.DeferBlockStateUpdate */);
    }
}
/**
 * Extends the `applyDeferBlockState` with timer-based scheduling.
 * This function becomes available on a page if there are defer blocks
 * that use `after` or `minimum` parameters in the `@loading` or
 * `@placeholder` blocks.
 */
function applyDeferBlockStateWithScheduling(newState, lDetails, lContainer, tNode, hostLView) {
    const now = Date.now();
    const hostTView = hostLView[TVIEW];
    const tDetails = getTDeferBlockDetails(hostTView, tNode);
    if (lDetails[STATE_IS_FROZEN_UNTIL] === null || lDetails[STATE_IS_FROZEN_UNTIL] <= now) {
        lDetails[STATE_IS_FROZEN_UNTIL] = null;
        const loadingAfter = getLoadingBlockAfter(tDetails);
        const inLoadingAfterPhase = lDetails[LOADING_AFTER_CLEANUP_FN] !== null;
        if (newState === DeferBlockState.Loading && loadingAfter !== null && !inLoadingAfterPhase) {
            // Trying to render loading, but it has an `after` config,
            // so schedule an update action after a timeout.
            lDetails[NEXT_DEFER_BLOCK_STATE] = newState;
            const cleanupFn = scheduleDeferBlockUpdate(loadingAfter, lDetails, tNode, lContainer, hostLView);
            lDetails[LOADING_AFTER_CLEANUP_FN] = cleanupFn;
        }
        else {
            // If we transition to a complete or an error state and there is a pending
            // operation to render loading after a timeout - invoke a cleanup operation,
            // which stops the timer.
            if (newState > DeferBlockState.Loading && inLoadingAfterPhase) {
                lDetails[LOADING_AFTER_CLEANUP_FN]();
                lDetails[LOADING_AFTER_CLEANUP_FN] = null;
                lDetails[NEXT_DEFER_BLOCK_STATE] = null;
            }
            applyDeferBlockState(newState, lDetails, lContainer, tNode, hostLView);
            const duration = getMinimumDurationForState(tDetails, newState);
            if (duration !== null) {
                lDetails[STATE_IS_FROZEN_UNTIL] = now + duration;
                scheduleDeferBlockUpdate(duration, lDetails, tNode, lContainer, hostLView);
            }
        }
    }
    else {
        // We are still rendering the previous state.
        // Update the `NEXT_DEFER_BLOCK_STATE`, which would be
        // picked up once it's time to transition to the next state.
        lDetails[NEXT_DEFER_BLOCK_STATE] = newState;
    }
}
/**
 * Schedules an update operation after a specified timeout.
 */
function scheduleDeferBlockUpdate(timeout, lDetails, tNode, lContainer, hostLView) {
    const callback = () => {
        const nextState = lDetails[NEXT_DEFER_BLOCK_STATE];
        lDetails[STATE_IS_FROZEN_UNTIL] = null;
        lDetails[NEXT_DEFER_BLOCK_STATE] = null;
        if (nextState !== null) {
            renderDeferBlockState(nextState, tNode, lContainer);
        }
    };
    return scheduleTimerTrigger(timeout, callback, hostLView);
}
/**
 * Checks whether we can transition to the next state.
 *
 * We transition to the next state if the previous state was represented
 * with a number that is less than the next state. For example, if the current
 * state is "loading" (represented as `1`), we should not show a placeholder
 * (represented as `0`), but we can show a completed state (represented as `2`)
 * or an error state (represented as `3`).
 */
function isValidStateChange(currentState, newState) {
    return currentState < newState;
}
/**
 * Trigger prefetching of dependencies for a defer block.
 *
 * @param tDetails Static information about this defer block.
 * @param lView LView of a host view.
 */
export function triggerPrefetching(tDetails, lView, tNode) {
    if (lView[INJECTOR] && shouldTriggerDeferBlock(lView[INJECTOR])) {
        triggerResourceLoading(tDetails, lView, tNode);
    }
}
/**
 * Trigger loading of defer block dependencies if the process hasn't started yet.
 *
 * @param tDetails Static information about this defer block.
 * @param lView LView of a host view.
 */
export function triggerResourceLoading(tDetails, lView, tNode) {
    const injector = lView[INJECTOR];
    const tView = lView[TVIEW];
    if (tDetails.loadingState !== DeferDependenciesLoadingState.NOT_STARTED) {
        // If the loading status is different from initial one, it means that
        // the loading of dependencies is in progress and there is nothing to do
        // in this function. All details can be obtained from the `tDetails` object.
        return tDetails.loadingPromise ?? Promise.resolve();
    }
    const lDetails = getLDeferBlockDetails(lView, tNode);
    const primaryBlockTNode = getPrimaryBlockTNode(tView, tDetails);
    // Switch from NOT_STARTED -> IN_PROGRESS state.
    tDetails.loadingState = DeferDependenciesLoadingState.IN_PROGRESS;
    // Prefetching is triggered, cleanup all registered prefetch triggers.
    invokeTriggerCleanupFns(1 /* TriggerType.Prefetch */, lDetails);
    let dependenciesFn = tDetails.dependencyResolverFn;
    if (ngDevMode) {
        // Check if dependency function interceptor is configured.
        const deferDependencyInterceptor = injector.get(DEFER_BLOCK_DEPENDENCY_INTERCEPTOR, null, {
            optional: true,
        });
        if (deferDependencyInterceptor) {
            dependenciesFn = deferDependencyInterceptor.intercept(dependenciesFn);
        }
    }
    // Indicate that an application is not stable and has a pending task.
    const pendingTasks = injector.get(PendingTasks);
    const taskId = pendingTasks.add();
    // The `dependenciesFn` might be `null` when all dependencies within
    // a given defer block were eagerly referenced elsewhere in a file,
    // thus no dynamic `import()`s were produced.
    if (!dependenciesFn) {
        tDetails.loadingPromise = Promise.resolve().then(() => {
            tDetails.loadingPromise = null;
            tDetails.loadingState = DeferDependenciesLoadingState.COMPLETE;
            pendingTasks.remove(taskId);
        });
        return tDetails.loadingPromise;
    }
    // Start downloading of defer block dependencies.
    tDetails.loadingPromise = Promise.allSettled(dependenciesFn()).then((results) => {
        let failed = false;
        const directiveDefs = [];
        const pipeDefs = [];
        for (const result of results) {
            if (result.status === 'fulfilled') {
                const dependency = result.value;
                const directiveDef = getComponentDef(dependency) || getDirectiveDef(dependency);
                if (directiveDef) {
                    directiveDefs.push(directiveDef);
                }
                else {
                    const pipeDef = getPipeDef(dependency);
                    if (pipeDef) {
                        pipeDefs.push(pipeDef);
                    }
                }
            }
            else {
                failed = true;
                break;
            }
        }
        // Loading is completed, we no longer need the loading Promise
        // and a pending task should also be removed.
        tDetails.loadingPromise = null;
        pendingTasks.remove(taskId);
        if (failed) {
            tDetails.loadingState = DeferDependenciesLoadingState.FAILED;
            if (tDetails.errorTmplIndex === null) {
                const templateLocation = ngDevMode ? getTemplateLocationDetails(lView) : '';
                const error = new RuntimeError(750 /* RuntimeErrorCode.DEFER_LOADING_FAILED */, ngDevMode &&
                    'Loading dependencies for `@defer` block failed, ' +
                        `but no \`@error\` block was configured${templateLocation}. ` +
                        'Consider using the `@error` block to render an error state.');
                handleError(lView, error);
            }
        }
        else {
            tDetails.loadingState = DeferDependenciesLoadingState.COMPLETE;
            // Update directive and pipe registries to add newly downloaded dependencies.
            const primaryBlockTView = primaryBlockTNode.tView;
            if (directiveDefs.length > 0) {
                primaryBlockTView.directiveRegistry = addDepsToRegistry(primaryBlockTView.directiveRegistry, directiveDefs);
                // Extract providers from all NgModules imported by standalone components
                // used within this defer block.
                const directiveTypes = directiveDefs.map((def) => def.type);
                const providers = internalImportProvidersFrom(false, ...directiveTypes);
                tDetails.providers = providers;
            }
            if (pipeDefs.length > 0) {
                primaryBlockTView.pipeRegistry = addDepsToRegistry(primaryBlockTView.pipeRegistry, pipeDefs);
            }
        }
    });
    return tDetails.loadingPromise;
}
/** Utility function to render placeholder content (if present) */
function renderPlaceholder(lView, tNode) {
    const lContainer = lView[tNode.index];
    ngDevMode && assertLContainer(lContainer);
    renderDeferBlockState(DeferBlockState.Placeholder, tNode, lContainer);
}
/**
 * Subscribes to the "loading" Promise and renders corresponding defer sub-block,
 * based on the loading results.
 *
 * @param lContainer Represents an instance of a defer block.
 * @param tNode Represents defer block info shared across all instances.
 */
function renderDeferStateAfterResourceLoading(tDetails, tNode, lContainer) {
    ngDevMode &&
        assertDefined(tDetails.loadingPromise, 'Expected loading Promise to exist on this defer block');
    tDetails.loadingPromise.then(() => {
        if (tDetails.loadingState === DeferDependenciesLoadingState.COMPLETE) {
            ngDevMode && assertDeferredDependenciesLoaded(tDetails);
            // Everything is loaded, show the primary block content
            renderDeferBlockState(DeferBlockState.Complete, tNode, lContainer);
        }
        else if (tDetails.loadingState === DeferDependenciesLoadingState.FAILED) {
            renderDeferBlockState(DeferBlockState.Error, tNode, lContainer);
        }
    });
}
/**
 * Attempts to trigger loading of defer block dependencies.
 * If the block is already in a loading, completed or an error state -
 * no additional actions are taken.
 */
function triggerDeferBlock(lView, tNode) {
    const tView = lView[TVIEW];
    const lContainer = lView[tNode.index];
    const injector = lView[INJECTOR];
    ngDevMode && assertLContainer(lContainer);
    if (!shouldTriggerDeferBlock(injector))
        return;
    const lDetails = getLDeferBlockDetails(lView, tNode);
    const tDetails = getTDeferBlockDetails(tView, tNode);
    // Defer block is triggered, cleanup all registered trigger functions.
    invokeAllTriggerCleanupFns(lDetails);
    switch (tDetails.loadingState) {
        case DeferDependenciesLoadingState.NOT_STARTED:
            renderDeferBlockState(DeferBlockState.Loading, tNode, lContainer);
            triggerResourceLoading(tDetails, lView, tNode);
            // The `loadingState` might have changed to "loading".
            if (tDetails.loadingState ===
                DeferDependenciesLoadingState.IN_PROGRESS) {
                renderDeferStateAfterResourceLoading(tDetails, tNode, lContainer);
            }
            break;
        case DeferDependenciesLoadingState.IN_PROGRESS:
            renderDeferBlockState(DeferBlockState.Loading, tNode, lContainer);
            renderDeferStateAfterResourceLoading(tDetails, tNode, lContainer);
            break;
        case DeferDependenciesLoadingState.COMPLETE:
            ngDevMode && assertDeferredDependenciesLoaded(tDetails);
            renderDeferBlockState(DeferBlockState.Complete, tNode, lContainer);
            break;
        case DeferDependenciesLoadingState.FAILED:
            renderDeferBlockState(DeferBlockState.Error, tNode, lContainer);
            break;
        default:
            if (ngDevMode) {
                throwError('Unknown defer block state');
            }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5zdHJ1Y3Rpb25zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS9zcmMvZGVmZXIvaW5zdHJ1Y3Rpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLGtDQUFrQyxDQUFDO0FBRW5FLE9BQU8sRUFBQyxxQkFBcUIsRUFBQyxNQUFNLDRCQUE0QixDQUFDO0FBRWpFLE9BQU8sRUFBQyxtQkFBbUIsRUFBRSxjQUFjLEVBQXFCLE1BQU0sT0FBTyxDQUFDO0FBQzlFLE9BQU8sRUFBQywyQkFBMkIsRUFBQyxNQUFNLDJCQUEyQixDQUFDO0FBQ3RFLE9BQU8sRUFBQyxZQUFZLEVBQW1CLE1BQU0sV0FBVyxDQUFDO0FBQ3pELE9BQU8sRUFBQywwQkFBMEIsRUFBQyxNQUFNLG9CQUFvQixDQUFDO0FBQzlELE9BQU8sRUFBQyxtQ0FBbUMsRUFBQyxNQUFNLDhCQUE4QixDQUFDO0FBQ2pGLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUM5QyxPQUFPLEVBQUMsZ0JBQWdCLEVBQUUsbUJBQW1CLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUN4RSxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDbkQsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLDZCQUE2QixDQUFDO0FBQzVELE9BQU8sRUFBQyxlQUFlLEVBQUUsZUFBZSxFQUFFLFVBQVUsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQ25GLE9BQU8sRUFBQywwQkFBMEIsRUFBQyxNQUFNLDRDQUE0QyxDQUFDO0FBQ3RGLE9BQU8sRUFBQyxhQUFhLEVBQUMsTUFBTSx5Q0FBeUMsQ0FBQztBQUN0RSxPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0sZ0NBQWdDLENBQUM7QUFDM0QsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLGtD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ICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuZGV2L2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge3NldEFjdGl2ZUNvbnN1bWVyfSBmcm9tICdAYW5ndWxhci9jb3JlL3ByaW1pdGl2ZXMvc2lnbmFscyc7XG5cbmltcG9ydCB7Q2FjaGVkSW5qZWN0b3JTZXJ2aWNlfSBmcm9tICcuLi9jYWNoZWRfaW5qZWN0b3Jfc2VydmljZSc7XG5pbXBvcnQge05vdGlmaWNhdGlvblNvdXJjZX0gZnJvbSAnLi4vY2hhbmdlX2RldGVjdGlvbi9zY2hlZHVsaW5nL3pvbmVsZXNzX3NjaGVkdWxpbmcnO1xuaW1wb3J0IHtFbnZpcm9ubWVudEluamVjdG9yLCBJbmplY3Rpb25Ub2tlbiwgSW5qZWN0b3IsIFByb3ZpZGVyfSBmcm9tICcuLi9kaSc7XG5pbXBvcnQge2ludGVybmFsSW1wb3J0UHJvdmlkZXJzRnJvbX0gZnJvbSAnLi4vZGkvcHJvdmlkZXJfY29sbGVjdGlvbic7XG5pbXBvcnQge1J1bnRpbWVFcnJvciwgUnVudGltZUVycm9yQ29kZX0gZnJvbSAnLi4vZXJyb3JzJztcbmltcG9ydCB7ZmluZE1hdGNoaW5nRGVoeWRyYXRlZFZpZXd9IGZyb20gJy4uL2h5ZHJhdGlvbi92aWV3cyc7XG5pbXBvcnQge3BvcHVsYXRlRGVoeWRyYXRlZFZpZXdzSW5MQ29udGFpbmVyfSBmcm9tICcuLi9saW5rZXIvdmlld19jb250YWluZXJfcmVmJztcbmltcG9ydCB7UGVuZGluZ1Rhc2tzfSBmcm9tICcuLi9wZW5kaW5nX3Rhc2tzJztcbmltcG9ydCB7YXNzZXJ0TENvbnRhaW5lciwgYXNzZXJ0VE5vZGVGb3JMVmlld30gZnJvbSAnLi4vcmVuZGVyMy9hc3NlcnQnO1xuaW1wb3J0IHtiaW5kaW5nVXBkYXRlZH0gZnJvbSAnLi4vcmVuZGVyMy9iaW5kaW5ncyc7XG5pbXBvcnQge0NoYWluZWRJbmplY3Rvcn0gZnJvbSAnLi4vcmVuZGVyMy9jaGFpbmVkX2luamVjdG9yJztcbmltcG9ydCB7Z2V0Q29tcG9uZW50RGVmLCBnZXREaXJlY3RpdmVEZWYsIGdldFBpcGVEZWZ9IGZyb20gJy4uL3JlbmRlcjMvZGVmaW5pdGlvbic7XG5pbXBvcnQge2dldFRlbXBsYXRlTG9jYXRpb25EZXRhaWxzfSBmcm9tICcuLi9yZW5kZXIzL2luc3RydWN0aW9ucy9lbGVtZW50X3ZhbGlkYXRpb24nO1xuaW1wb3J0IHttYXJrVmlld0RpcnR5fSBmcm9tICcuLi9yZW5kZXIzL2luc3RydWN0aW9ucy9tYXJrX3ZpZXdfZGlydHknO1xuaW1wb3J0IHtoYW5kbGVFcnJvcn0gZnJvbSAnLi4vcmVuZGVyMy9pbnN0cnVjdGlvbnMvc2hhcmVkJztcbmltcG9ydCB7ZGVjbGFyZVRlbXBsYXRlfSBmcm9tICcuLi9yZW5kZXIzL2luc3RydWN0aW9ucy90ZW1wbGF0ZSc7XG5pbXBvcnQge0xDb250YWluZXJ9IGZyb20gJy4uL3JlbmRlcjMvaW50ZXJmYWNlcy9jb250YWluZXInO1xuaW1wb3J0IHtEaXJlY3RpdmVEZWZMaXN0LCBQaXBlRGVmTGlzdH0gZnJvbSAnLi4vcmVuZGVyMy9pbnRlcmZhY2VzL2RlZmluaXRpb24nO1xuaW1wb3J0IHtUQ29udGFpbmVyTm9kZSwgVE5vZGV9IGZyb20gJy4uL3JlbmRlcjMvaW50ZXJmYWNlcy9ub2RlJztcbmltcG9ydCB7aXNEZXN0cm95ZWR9IGZyb20gJy4uL3JlbmRlcjMvaW50ZXJmYWNlcy90eXBlX2NoZWNrcyc7XG5pbXBvcnQge0hFQURFUl9PRkZTRVQsIElOSkVDVE9SLCBMVmlldywgUEFSRU5ULCBUVklFVywgVFZpZXd9IGZyb20gJy4uL3JlbmRlcjMvaW50ZXJmYWNlcy92aWV3JztcbmltcG9ydCB7XG4gIGdldEN1cnJlbnRUTm9kZSxcbiAgZ2V0TFZpZXcsXG4gIGdldFNlbGVjdGVkVE5vZGUsXG4gIGdldFRWaWV3LFxuICBuZXh0QmluZGluZ0luZGV4LFxufSBmcm9tICcuLi9yZW5kZXIzL3N0YXRlJztcbmltcG9ydCB7aXNQbGF0Zm9ybUJyb3dzZXJ9IGZyb20gJy4uL3JlbmRlcjMvdXRpbC9taXNjX3V0aWxzJztcbmltcG9ydCB7XG4gIGdldENvbnN0YW50LFxuICBnZXRUTm9kZSxcbiAgcmVtb3ZlTFZpZXdPbkRlc3Ryb3ksXG4gIHN0b3JlTFZpZXdPbkRlc3Ryb3ksXG59IGZyb20gJy4uL3JlbmRlcjMvdXRpbC92aWV3X3V0aWxzJztcbmltcG9ydCB7XG4gIGFkZExWaWV3VG9MQ29udGFpbmVyLFxuICBjcmVhdGVBbmRSZW5kZXJFbWJlZGRlZExWaWV3LFxuICByZW1vdmVMVmlld0Zyb21MQ29udGFpbmVyLFxuICBzaG91bGRBZGRWaWV3VG9Eb20sXG59IGZyb20gJy4uL3JlbmRlcjMvdmlld19tYW5pcHVsYXRpb24nO1xuaW1wb3J0IHthc3NlcnREZWZpbmVkLCB0aHJvd0Vycm9yfSBmcm9tICcuLi91dGlsL2Fzc2VydCc7XG5pbXBvcnQge3BlcmZvcm1hbmNlTWFya0ZlYXR1cmV9IGZyb20gJy4uL3V0aWwvcGVyZm9ybWFuY2UnO1xuXG5pbXBvcnQge1xuICBpbnZva2VBbGxUcmlnZ2VyQ2xlYW51cEZucyxcbiAgaW52b2tlVHJpZ2dlckNsZWFudXBGbnMsXG4gIHN0b3JlVHJpZ2dlckNsZWFudXBGbixcbn0gZnJvbSAnLi9jbGVhbnVwJztcbmltcG9ydCB7b25Ib3Zlciwgb25JbnRlcmFjdGlvbiwgb25WaWV3cG9ydCwgcmVnaXN0ZXJEb21UcmlnZ2VyfSBmcm9tICcuL2RvbV90cmlnZ2Vycyc7XG5pbXBvcnQge29uSWRsZX0gZnJvbSAnLi9pZGxlX3NjaGVkdWxlcic7XG5pbXBvcnQge1xuICBERUZFUl9CTE9DS19TVEFURSxcbiAgRGVmZXJCbG9ja0JlaGF2aW9yLFxuICBEZWZlckJsb2NrQ29uZmlnLFxuICBEZWZlckJsb2NrRGVwZW5kZW5jeUludGVyY2VwdG9yLFxuICBEZWZlckJsb2NrSW50ZXJuYWxTdGF0ZSxcbiAgRGVmZXJCbG9ja1N0YXRlLFxuICBEZWZlckRlcGVuZGVuY2llc0xvYWRpbmdTdGF0ZSxcbiAgRGVmZXJyZWRMb2FkaW5nQmxvY2tDb25maWcsXG4gIERlZmVycmVkUGxhY2Vob2xkZXJCbG9ja0NvbmZpZyxcbiAgRGVwZW5kZW5jeVJlc29sdmVyRm4sXG4gIExEZWZlckJsb2NrRGV0YWlscyxcbiAgTE9BRElOR19BRlRFUl9DTEVBTlVQX0ZOLFxuICBORVhUX0RFRkVSX0JMT0NLX1NUQVRFLFxuICBTVEFURV9JU19GUk9aRU5fVU5USUwsXG4gIFREZWZlckJsb2NrRGV0YWlscyxcbiAgVHJpZ2dlclR5cGUsXG59IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5pbXBvcnQge29uVGltZXIsIHNjaGVkdWxlVGltZXJUcmlnZ2VyfSBmcm9tICcuL3RpbWVyX3NjaGVkdWxlcic7XG5pbXBvcnQge1xuICBhZGREZXBzVG9SZWdpc3RyeSxcbiAgYXNzZXJ0RGVmZXJyZWREZXBlbmRlbmNpZXNMb2FkZWQsXG4gIGdldExEZWZlckJsb2NrRGV0YWlscyxcbiAgZ2V0TG9hZGluZ0Jsb2NrQWZ0ZXIsXG4gIGdldE1pbmltdW1EdXJhdGlvbkZvclN0YXRlLFxuICBnZXRQcmltYXJ5QmxvY2tUTm9kZSxcbiAgZ2V0VERlZmVyQmxvY2tEZXRhaWxzLFxuICBnZXRUZW1wbGF0ZUluZGV4Rm9yU3RhdGUsXG4gIHNldExEZWZlckJsb2NrRGV0YWlscyxcbiAgc2V0VERlZmVyQmxvY2tEZXRhaWxzLFxufSBmcm9tICcuL3V0aWxzJztcblxuLyoqXG4gKiAqKklOVEVSTkFMKiosIGF2b2lkIHJlZmVyZW5jaW5nIGl0IGluIGFwcGxpY2F0aW9uIGNvZGUuXG4gKiAqXG4gKiBJbmplY3RvciB0b2tlbiB0aGF0IGFsbG93cyB0byBwcm92aWRlIGBEZWZlckJsb2NrRGVwZW5kZW5jeUludGVyY2VwdG9yYCBjbGFzc1xuICogaW1wbGVtZW50YXRpb24uXG4gKlxuICogVGhpcyB0b2tlbiBpcyBvbmx5IGluamVjdGVkIGluIGRldk1vZGVcbiAqL1xuZXhwb3J0IGNvbnN0IERFRkVSX0JMT0NLX0RFUEVOREVOQ1lfSU5URVJDRVBUT1IgPVxuICBuZXcgSW5qZWN0aW9uVG9rZW48RGVmZXJCbG9ja0RlcGVuZGVuY3lJbnRlcmNlcHRvcj4oJ0RFRkVSX0JMT0NLX0RFUEVOREVOQ1lfSU5URVJDRVBUT1InKTtcblxuLyoqXG4gKiAqKklOVEVSTkFMKiosIHRva2VuIHVzZWQgZm9yIGNvbmZpZ3VyaW5nIGRlZmVyIGJsb2NrIGJlaGF2aW9yLlxuICovXG5leHBvcnQgY29uc3QgREVGRVJfQkxPQ0tfQ09ORklHID0gbmV3IEluamVjdGlvblRva2VuPERlZmVyQmxvY2tDb25maWc+KFxuICBuZ0Rldk1vZGUgPyAnREVGRVJfQkxPQ0tfQ09ORklHJyA6ICcnLFxuKTtcblxuLyoqXG4gKiBSZXR1cm5zIHdoZXRoZXIgZGVmZXIgYmxvY2tzIHNob3VsZCBiZSB0cmlnZ2VyZWQuXG4gKlxuICogQ3VycmVudGx5LCBkZWZlciBibG9ja3MgYXJlIG5vdCB0cmlnZ2VyZWQgb24gdGhlIHNlcnZlcixcbiAqIG9ubHkgcGxhY2Vob2xkZXIgY29udGVudCBpcyByZW5kZXJlZCAoaWYgcHJvdmlkZWQpLlxuICovXG5mdW5jdGlvbiBzaG91bGRUcmlnZ2VyRGVmZXJCbG9jayhpbmplY3RvcjogSW5qZWN0b3IpOiBib29sZWFuIHtcbiAgY29uc3QgY29uZmlnID0gaW5qZWN0b3IuZ2V0KERFRkVSX0JMT0NLX0NPTkZJRywgbnVsbCwge29wdGlvbmFsOiB0cnVlfSk7XG4gIGlmIChjb25maWc/LmJlaGF2aW9yID09PSBEZWZlckJsb2NrQmVoYXZpb3IuTWFudWFsKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiBpc1BsYXRmb3JtQnJvd3NlcihpbmplY3Rvcik7XG59XG5cbi8qKlxuICogUmVmZXJlbmNlIHRvIHRoZSB0aW1lci1iYXNlZCBzY2hlZHVsZXIgaW1wbGVtZW50YXRpb24gb2YgZGVmZXIgYmxvY2sgc3RhdGVcbiAqIHJlbmRlcmluZyBtZXRob2QuIEl0J3MgdXNlZCB0byBtYWtlIHRpbWVyLWJhc2VkIHNjaGVkdWxpbmcgdHJlZS1zaGFrYWJsZS5cbiAqIElmIGBtaW5pbXVtYCBvciBgYWZ0ZXJgIHBhcmFtZXRlcnMgYXJlIHVzZWQsIGNvbXBpbGVyIGdlbmVyYXRlcyBhbiBleHRyYVxuICogYXJndW1lbnQgZm9yIHRoZSBgybXJtWRlZmVyYCBpbnN0cnVjdGlvbiwgd2hpY2ggcmVmZXJlbmNlcyBhIHRpbWVyLWJhc2VkXG4gKiBpbXBsZW1lbnRhdGlvbi5cbiAqL1xubGV0IGFwcGx5RGVmZXJCbG9ja1N0YXRlV2l0aFNjaGVkdWxpbmdJbXBsOiB0eXBlb2YgYXBwbHlEZWZlckJsb2NrU3RhdGUgfCBudWxsID0gbnVsbDtcblxuLyoqXG4gKiBFbmFibGVzIHRpbWVyLXJlbGF0ZWQgc2NoZWR1bGluZyBpZiBgYWZ0ZXJgIG9yIGBtaW5pbXVtYCBwYXJhbWV0ZXJzIGFyZSBzZXR1cFxuICogb24gdGhlIGBAbG9hZGluZ2Agb3IgYEBwbGFjZWhvbGRlcmAgYmxvY2tzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gybXJtWRlZmVyRW5hYmxlVGltZXJTY2hlZHVsaW5nKFxuICB0VmlldzogVFZpZXcsXG4gIHREZXRhaWxzOiBURGVmZXJCbG9ja0RldGFpbHMsXG4gIHBsYWNlaG9sZGVyQ29uZmlnSW5kZXg/OiBudW1iZXIgfCBudWxsLFxuICBsb2FkaW5nQ29uZmlnSW5kZXg/OiBudW1iZXIgfCBudWxsLFxuKSB7XG4gIGNvbnN0IHRWaWV3Q29uc3RzID0gdFZpZXcuY29uc3RzO1xuICBpZiAocGxhY2Vob2xkZXJDb25maWdJbmRleCAhPSBudWxsKSB7XG4gICAgdERldGFpbHMucGxhY2Vob2xkZXJCbG9ja0NvbmZpZyA9IGdldENvbnN0YW50PERlZmVycmVkUGxhY2Vob2xkZXJCbG9ja0NvbmZpZz4oXG4gICAgICB0Vmlld0NvbnN0cyxcbiAgICAgIHBsYWNlaG9sZGVyQ29uZmlnSW5kZXgsXG4gICAgKTtcbiAgfVxuICBpZiAobG9hZGluZ0NvbmZpZ0luZGV4ICE9IG51bGwpIHtcbiAgICB0RGV0YWlscy5sb2FkaW5nQmxvY2tDb25maWcgPSBnZXRDb25zdGFudDxEZWZlcnJlZExvYWRpbmdCbG9ja0NvbmZpZz4oXG4gICAgICB0Vmlld0NvbnN0cyxcbiAgICAgIGxvYWRpbmdDb25maWdJbmRleCxcbiAgICApO1xuICB9XG5cbiAgLy8gRW5hYmxlIGltcGxlbWVudGF0aW9uIHRoYXQgc3VwcG9ydHMgdGltZXItYmFzZWQgc2NoZWR1bGluZy5cbiAgaWYgKGFwcGx5RGVmZXJCbG9ja1N0YXRlV2l0aFNjaGVkdWxpbmdJbXBsID09PSBudWxsKSB7XG4gICAgYXBwbHlEZWZlckJsb2NrU3RhdGVXaXRoU2NoZWR1bGluZ0ltcGwgPSBhcHBseURlZmVyQmxvY2tTdGF0ZVdpdGhTY2hlZHVsaW5nO1xuICB9XG59XG5cbi8qKlxuICogQ3JlYXRlcyBydW50aW1lIGRhdGEgc3RydWN0dXJlcyBmb3IgZGVmZXIgYmxvY2tzLlxuICpcbiAqIEBwYXJhbSBpbmRleCBJbmRleCBvZiB0aGUgYGRlZmVyYCBpbnN0cnVjdGlvbi5cbiAqIEBwYXJhbSBwcmltYXJ5VG1wbEluZGV4IEluZGV4IG9mIHRoZSB0ZW1wbGF0ZSB3aXRoIHRoZSBwcmltYXJ5IGJsb2NrIGNvbnRlbnQuXG4gKiBAcGFyYW0gZGVwZW5kZW5jeVJlc29sdmVyRm4gRnVuY3Rpb24gdGhhdCBjb250YWlucyBkZXBlbmRlbmNpZXMgZm9yIHRoaXMgZGVmZXIgYmxvY2suXG4gKiBAcGFyYW0gbG9hZGluZ1RtcGxJbmRleCBJbmRleCBvZiB0aGUgdGVtcGxhdGUgd2l0aCB0aGUgbG9hZGluZyBibG9jayBjb250ZW50LlxuICogQHBhcmFtIHBsYWNlaG9sZGVyVG1wbEluZGV4IEluZGV4IG9mIHRoZSB0ZW1wbGF0ZSB3aXRoIHRoZSBwbGFjZWhvbGRlciBibG9jayBjb250ZW50LlxuICogQHBhcmFtIGVycm9yVG1wbEluZGV4IEluZGV4IG9mIHRoZSB0ZW1wbGF0ZSB3aXRoIHRoZSBlcnJvciBibG9jayBjb250ZW50LlxuICogQHBhcmFtIGxvYWRpbmdDb25maWdJbmRleCBJbmRleCBpbiB0aGUgY29uc3RhbnRzIGFycmF5IG9mIHRoZSBjb25maWd1cmF0aW9uIG9mIHRoZSBsb2FkaW5nLlxuICogICAgIGJsb2NrLlxuICogQHBhcmFtIHBsYWNlaG9sZGVyQ29uZmlnSW5kZXggSW5kZXggaW4gdGhlIGNvbnN0YW50cyBhcnJheSBvZiB0aGUgY29uZmlndXJhdGlvbiBvZiB0aGVcbiAqICAgICBwbGFjZWhvbGRlciBibG9jay5cbiAqIEBwYXJhbSBlbmFibGVUaW1lclNjaGVkdWxpbmcgRnVuY3Rpb24gdGhhdCBlbmFibGVzIHRpbWVyLXJlbGF0ZWQgc2NoZWR1bGluZyBpZiBgYWZ0ZXJgXG4gKiAgICAgb3IgYG1pbmltdW1gIHBhcmFtZXRlcnMgYXJlIHNldHVwIG9uIHRoZSBgQGxvYWRpbmdgIG9yIGBAcGxhY2Vob2xkZXJgIGJsb2Nrcy5cbiAqXG4gKiBAY29kZUdlbkFwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gybXJtWRlZmVyKFxuICBpbmRleDogbnVtYmVyLFxuICBwcmltYXJ5VG1wbEluZGV4OiBudW1iZXIsXG4gIGRlcGVuZGVuY3lSZXNvbHZlckZuPzogRGVwZW5kZW5jeVJlc29sdmVyRm4gfCBudWxsLFxuICBsb2FkaW5nVG1wbEluZGV4PzogbnVtYmVyIHwgbnVsbCxcbiAgcGxhY2Vob2xkZXJUbXBsSW5kZXg/OiBudW1iZXIgfCBudWxsLFxuICBlcnJvclRtcGxJbmRleD86IG51bWJlciB8IG51bGwsXG4gIGxvYWRpbmdDb25maWdJbmRleD86IG51bWJlciB8IG51bGwsXG4gIHBsYWNlaG9sZGVyQ29uZmlnSW5kZXg/OiBudW1iZXIgfCBudWxsLFxuICBlbmFibGVUaW1lclNjaGVkdWxpbmc/OiB0eXBlb2YgybXJtWRlZmVyRW5hYmxlVGltZXJTY2hlZHVsaW5nLFxuKSB7XG4gIGNvbnN0IGxWaWV3ID0gZ2V0TFZpZXcoKTtcbiAgY29uc3QgdFZpZXcgPSBnZXRUVmlldygpO1xuICBjb25zdCBhZGp1c3RlZEluZGV4ID0gaW5kZXggKyBIRUFERVJfT0ZGU0VUO1xuICBjb25zdCB0Tm9kZSA9IGRlY2xhcmVUZW1wbGF0ZShsVmlldywgdFZpZXcsIGluZGV4LCBudWxsLCAwLCAwKTtcblxuICBpZiAodFZpZXcuZmlyc3RDcmVhdGVQYXNzKSB7XG4gICAgcGVyZm9ybWFuY2VNYXJrRmVhdHVyZSgnTmdEZWZlcicpO1xuXG4gICAgY29uc3QgdERldGFpbHM6IFREZWZlckJsb2NrRGV0YWlscyA9IHtcbiAgICAgIHByaW1hcnlUbXBsSW5kZXgsXG4gICAgICBsb2FkaW5nVG1wbEluZGV4OiBsb2FkaW5nVG1wbEluZGV4ID8/IG51bGwsXG4gICAgICBwbGFjZWhvbGRlclRtcGxJbmRleDogcGxhY2Vob2xkZXJUbXBsSW5kZXggPz8gbnVsbCxcbiAgICAgIGVycm9yVG1wbEluZGV4OiBlcnJvclRtcGxJbmRleCA/PyBudWxsLFxuICAgICAgcGxhY2Vob2xkZXJCbG9ja0NvbmZpZzogbnVsbCxcbiAgICAgIGxvYWRpbmdCbG9ja0NvbmZpZzogbnVsbCxcbiAgICAgIGRlcGVuZGVuY3lSZXNvbHZlckZuOiBkZXBlbmRlbmN5UmVzb2x2ZXJGbiA/PyBudWxsLFxuICAgICAgbG9hZGluZ1N0YXRlOiBEZWZlckRlcGVuZGVuY2llc0xvYWRpbmdTdGF0ZS5OT1RfU1RBUlRFRCxcbiAgICAgIGxvYWRpbmdQcm9taXNlOiBudWxsLFxuICAgICAgcHJvdmlkZXJzOiBudWxsLFxuICAgIH07XG4gICAgZW5hYmxlVGltZXJTY2hlZHVsaW5nPy4odFZpZXcsIHREZXRhaWxzLCBwbGFjZWhvbGRlckNvbmZpZ0luZGV4LCBsb2FkaW5nQ29uZmlnSW5kZXgpO1xuICAgIHNldFREZWZlckJsb2NrRGV0YWlscyh0VmlldywgYWRqdXN0ZWRJbmRleCwgdERldGFpbHMpO1xuICB9XG5cbiAgY29uc3QgbENvbnRhaW5lciA9IGxWaWV3W2FkanVzdGVkSW5kZXhdO1xuXG4gIC8vIElmIGh5ZHJhdGlvbiBpcyBlbmFibGVkLCBsb29rcyB1cCBkZWh5ZHJhdGVkIHZpZXdzIGluIHRoZSBET01cbiAgLy8gdXNpbmcgaHlkcmF0aW9uIGFubm90YXRpb24gaW5mbyBhbmQgc3RvcmVzIHRob3NlIHZpZXdzIG9uIExDb250YWluZXIuXG4gIC8vIEluIGNsaWVudC1vbmx5IG1vZGUsIHRoaXMgZnVuY3Rpb24gaXMgYSBub29wLlxuICBwb3B1bGF0ZURlaHlkcmF0ZWRWaWV3c0luTENvbnRhaW5lcihsQ29udGFpbmVyLCB0Tm9kZSwgbFZpZXcpO1xuXG4gIC8vIEluaXQgaW5zdGFuY2Utc3BlY2lmaWMgZGVmZXIgZGV0YWlscyBhbmQgc3RvcmUgaXQuXG4gIGNvbnN0IGxEZXRhaWxzOiBMRGVmZXJCbG9ja0RldGFpbHMgPSBbXG4gICAgbnVsbCwgLy8gTkVYVF9ERUZFUl9CTE9DS19TVEFURVxuICAgIERlZmVyQmxvY2tJbnRlcm5hbFN0YXRlLkluaXRpYWwsIC8vIERFRkVSX0JMT0NLX1NUQVRFXG4gICAgbnVsbCwgLy8gU1RBVEVfSVNfRlJPWkVOX1VOVElMXG4gICAgbnVsbCwgLy8gTE9BRElOR19BRlRFUl9DTEVBTlVQX0ZOXG4gICAgbnVsbCwgLy8gVFJJR0dFUl9DTEVBTlVQX0ZOU1xuICAgIG51bGwsIC8vIFBSRUZFVENIX1RSSUdHRVJfQ0xFQU5VUF9GTlNcbiAgXTtcbiAgc2V0TERlZmVyQmxvY2tEZXRhaWxzKGxWaWV3LCBhZGp1c3RlZEluZGV4LCBsRGV0YWlscyk7XG5cbiAgY29uc3QgY2xlYW51cFRyaWdnZXJzRm4gPSAoKSA9PiBpbnZva2VBbGxUcmlnZ2VyQ2xlYW51cEZucyhsRGV0YWlscyk7XG5cbiAgLy8gV2hlbiBkZWZlciBibG9jayBpcyB0cmlnZ2VyZWQgLSB1bnN1YnNjcmliZSBmcm9tIExWaWV3IGRlc3Ryb3kgY2xlYW51cC5cbiAgc3RvcmVUcmlnZ2VyQ2xlYW51cEZuKFRyaWdnZXJUeXBlLlJlZ3VsYXIsIGxEZXRhaWxzLCAoKSA9PlxuICAgIHJlbW92ZUxWaWV3T25EZXN0cm95KGxWaWV3LCBjbGVhbnVwVHJpZ2dlcnNGbiksXG4gICk7XG4gIHN0b3JlTFZpZXdPbkRlc3Ryb3kobFZpZXcsIGNsZWFudXBUcmlnZ2Vyc0ZuKTtcbn1cblxuLyoqXG4gKiBMb2FkcyBkZWZlciBibG9jayBkZXBlbmRlbmNpZXMgd2hlbiBhIHRyaWdnZXIgdmFsdWUgYmVjb21lcyB0cnV0aHkuXG4gKiBAY29kZUdlbkFwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gybXJtWRlZmVyV2hlbihyYXdWYWx1ZTogdW5rbm93bikge1xuICBjb25zdCBsVmlldyA9IGdldExWaWV3KCk7XG4gIGNvbnN0IGJpbmRpbmdJbmRleCA9IG5leHRCaW5kaW5nSW5kZXgoKTtcbiAgaWYgKGJpbmRpbmdVcGRhdGVkKGxWaWV3LCBiaW5kaW5nSW5kZXgsIHJhd1ZhbHVlKSkge1xuICAgIGNvbnN0IHByZXZDb25zdW1lciA9IHNldEFjdGl2ZUNvbnN1bWVyKG51bGwpO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB2YWx1ZSA9IEJvb2xlYW4ocmF3VmFsdWUpOyAvLyBoYW5kbGUgdHJ1dGh5IG9yIGZhbHN5IHZhbHVlc1xuICAgICAgY29uc3QgdE5vZGUgPSBnZXRTZWxlY3RlZFROb2RlKCk7XG4gICAgICBjb25zdCBsRGV0YWlscyA9IGdldExEZWZlckJsb2NrRGV0YWlscyhsVmlldywgdE5vZGUpO1xuICAgICAgY29uc3QgcmVuZGVyZWRTdGF0ZSA9IGxEZXRhaWxzW0RFRkVSX0JMT0NLX1NUQVRFXTtcbiAgICAgIGlmICh2YWx1ZSA9PT0gZmFsc2UgJiYgcmVuZGVyZWRTdGF0ZSA9PT0gRGVmZXJCbG9ja0ludGVybmFsU3RhdGUuSW5pdGlhbCkge1xuICAgICAgICAvLyBJZiBub3RoaW5nIGlzIHJlbmRlcmVkIHlldCwgcmVuZGVyIGEgcGxhY2Vob2xkZXIgKGlmIGRlZmluZWQpLlxuICAgICAgICByZW5kZXJQbGFjZWhvbGRlcihsVmlldywgdE5vZGUpO1xuICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgdmFsdWUgPT09IHRydWUgJiZcbiAgICAgICAgKHJlbmRlcmVkU3RhdGUgPT09IERlZmVyQmxvY2tJbnRlcm5hbFN0YXRlLkluaXRpYWwgfHxcbiAgICAgICAgICByZW5kZXJlZFN0YXRlID09PSBEZWZlckJsb2NrU3RhdGUuUGxhY2Vob2xkZXIpXG4gICAgICApIHtcbiAgICAgICAgLy8gVGhlIGB3aGVuYCBjb25kaXRpb24gaGFzIGNoYW5nZWQgdG8gYHRydWVgLCB0cmlnZ2VyIGRlZmVyIGJsb2NrIGxvYWRpbmdcbiAgICAgICAgLy8gaWYgdGhlIGJsb2NrIGlzIGVpdGhlciBpbiBpbml0aWFsIChub3RoaW5nIGlzIHJlbmRlcmVkKSBvciBhIHBsYWNlaG9sZGVyXG4gICAgICAgIC8vIHN0YXRlLlxuICAgICAgICB0cmlnZ2VyRGVmZXJCbG9jayhsVmlldywgdE5vZGUpO1xuICAgICAgfVxuICAgIH0gZmluYWxseSB7XG4gICAgICBzZXRBY3RpdmVDb25zdW1lcihwcmV2Q29uc3VtZXIpO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIFByZWZldGNoZXMgdGhlIGRlZmVycmVkIGNvbnRlbnQgd2hlbiBhIHZhbHVlIGJlY29tZXMgdHJ1dGh5LlxuICogQGNvZGVHZW5BcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIMm1ybVkZWZlclByZWZldGNoV2hlbihyYXdWYWx1ZTogdW5rbm93bikge1xuICBjb25zdCBsVmlldyA9IGdldExWaWV3KCk7XG4gIGNvbnN0IGJpbmRpbmdJbmRleCA9IG5leHRCaW5kaW5nSW5kZXgoKTtcblxuICBpZiAoYmluZGluZ1VwZGF0ZWQobFZpZXcsIGJpbmRpbmdJbmRleCwgcmF3VmFsdWUpKSB7XG4gICAgY29uc3QgcHJldkNvbnN1bWVyID0gc2V0QWN0aXZlQ29uc3VtZXIobnVsbCk7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHZhbHVlID0gQm9vbGVhbihyYXdWYWx1ZSk7IC8vIGhhbmRsZSB0cnV0aHkgb3IgZmFsc3kgdmFsdWVzXG4gICAgICBjb25zdCB0VmlldyA9IGxWaWV3W1RWSUVXXTtcbiAgICAgIGNvbnN0IHROb2RlID0gZ2V0U2VsZWN0ZWRUTm9kZSgpO1xuICAgICAgY29uc3QgdERldGFpbHMgPSBnZXRURGVmZXJCbG9ja0RldGFpbHModFZpZXcsIHROb2RlKTtcbiAgICAgIGlmICh2YWx1ZSA9PT0gdHJ1ZSAmJiB0RGV0YWlscy5sb2FkaW5nU3RhdGUgPT09IERlZmVyRGVwZW5kZW5jaWVzTG9hZGluZ1N0YXRlLk5PVF9TVEFSVEVEKSB7XG4gICAgICAgIC8vIElmIGxvYWRpbmcgaGFzIG5vdCBiZWVuIHN0YXJ0ZWQgeWV0LCB0cmlnZ2VyIGl0IG5vdy5cbiAgICAgICAgdHJpZ2dlclByZWZldGNoaW5nKHREZXRhaWxzLCBsVmlldywgdE5vZGUpO1xuICAgICAgfVxuICAgIH0gZmluYWxseSB7XG4gICAgICBzZXRBY3RpdmVDb25zdW1lcihwcmV2Q29uc3VtZXIpO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIFNldHMgdXAgbG9naWMgdG8gaGFuZGxlIHRoZSBgb24gaWRsZWAgZGVmZXJyZWQgdHJpZ2dlci5cbiAqIEBjb2RlR2VuQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiDJtcm1ZGVmZXJPbklkbGUoKSB7XG4gIHNjaGVkdWxlRGVsYXllZFRyaWdnZXIob25JZGxlKTtcbn1cblxuLyoqXG4gKiBTZXRzIHVwIGxvZ2ljIHRvIGhhbmRsZSB0aGUgYHByZWZldGNoIG9uIGlkbGVgIGRlZmVycmVkIHRyaWdnZXIuXG4gKiBAY29kZUdlbkFwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gybXJtWRlZmVyUHJlZmV0Y2hPbklkbGUoKSB7XG4gIHNjaGVkdWxlRGVsYXllZFByZWZldGNoaW5nKG9uSWRsZSk7XG59XG5cbi8qKlxuICogU2V0cyB1cCBsb2dpYyB0byBoYW5kbGUgdGhlIGBvbiBpbW1lZGlhdGVgIGRlZmVycmVkIHRyaWdnZXIuXG4gKiBAY29kZUdlbkFwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gybXJtWRlZmVyT25JbW1lZGlhdGUoKSB7XG4gIGNvbnN0IGxWaWV3ID0gZ2V0TFZpZXcoKTtcbiAgY29uc3QgdE5vZGUgPSBnZXRDdXJyZW50VE5vZGUoKSE7XG4gIGNvbnN0IHRWaWV3ID0gbFZpZXdbVFZJRVddO1xuICBjb25zdCBpbmplY3RvciA9IGxWaWV3W0lOSkVDVE9SXSE7XG4gIGNvbnN0IHREZXRhaWxzID0gZ2V0VERlZmVyQmxvY2tEZXRhaWxzKHRWaWV3LCB0Tm9kZSk7XG5cbiAgLy8gUmVuZGVyIHBsYWNlaG9sZGVyIGJsb2NrIG9ubHkgaWYgbG9hZGluZyB0ZW1wbGF0ZSBpcyBub3QgcHJlc2VudCBhbmQgd2UncmUgb25cbiAgLy8gdGhlIGNsaWVudCB0byBhdm9pZCBjb250ZW50IGZsaWNrZXJpbmcsIHNpbmNlIGl0IHdvdWxkIGJlIGltbWVkaWF0ZWx5IHJlcGxhY2VkXG4gIC8vIGJ5IHRoZSBsb2FkaW5nIGJsb2NrLlxuICBpZiAoIXNob3VsZFRyaWdnZXJEZWZlckJsb2NrKGluamVjdG9yKSB8fCB0RGV0YWlscy5sb2FkaW5nVG1wbEluZGV4ID09PSBudWxsKSB7XG4gICAgcmVuZGVyUGxhY2Vob2xkZXIobFZpZXcsIHROb2RlKTtcbiAgfVxuICB0cmlnZ2VyRGVmZXJCbG9jayhsVmlldywgdE5vZGUpO1xufVxuXG4vKipcbiAqIFNldHMgdXAgbG9naWMgdG8gaGFuZGxlIHRoZSBgcHJlZmV0Y2ggb24gaW1tZWRpYXRlYCBkZWZlcnJlZCB0cmlnZ2VyLlxuICogQGNvZGVHZW5BcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIMm1ybVkZWZlclByZWZldGNoT25JbW1lZGlhdGUoKSB7XG4gIGNvbnN0IGxWaWV3ID0gZ2V0TFZpZXcoKTtcbiAgY29uc3QgdE5vZGUgPSBnZXRDdXJyZW50VE5vZGUoKSE7XG4gIGNvbnN0IHRWaWV3ID0gbFZpZXdbVFZJRVddO1xuICBjb25zdCB0RGV0YWlscyA9IGdldFREZWZlckJsb2NrRGV0YWlscyh0VmlldywgdE5vZGUpO1xuXG4gIGlmICh0RGV0YWlscy5sb2FkaW5nU3RhdGUgPT09IERlZmVyRGVwZW5kZW5jaWVzTG9hZGluZ1N0YXRlLk5PVF9TVEFSVEVEKSB7XG4gICAgdHJpZ2dlclJlc291cmNlTG9hZGluZyh0RGV0YWlscywgbFZpZXcsIHROb2RlKTtcbiAgfVxufVxuXG4vKipcbiAqIENyZWF0ZXMgcnVudGltZSBkYXRhIHN0cnVjdHVyZXMgZm9yIHRoZSBgb24gdGltZXJgIGRlZmVycmVkIHRyaWdnZXIuXG4gKiBAcGFyYW0gZGVsYXkgQW1vdW50IG9mIHRpbWUgdG8gd2FpdCBiZWZvcmUgbG9hZGluZyB0aGUgY29udGVudC5cbiAqIEBjb2RlR2VuQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiDJtcm1ZGVmZXJPblRpbWVyKGRlbGF5OiBudW1iZXIpIHtcbiAgc2NoZWR1bGVEZWxheWVkVHJpZ2dlcihvblRpbWVyKGRlbGF5KSk7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBydW50aW1lIGRhdGEgc3RydWN0dXJlcyBmb3IgdGhlIGBwcmVmZXRjaCBvbiB0aW1lcmAgZGVmZXJyZWQgdHJpZ2dlci5cbiAqIEBwYXJhbSBkZWxheSBBbW91bnQgb2YgdGltZSB0byB3YWl0IGJlZm9yZSBwcmVmZXRjaGluZyB0aGUgY29udGVudC5cbiAqIEBjb2RlR2VuQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiDJtcm1ZGVmZXJQcmVmZXRjaE9uVGltZXIoZGVsYXk6IG51bWJlcikge1xuICBzY2hlZHVsZURlbGF5ZWRQcmVmZXRjaGluZyhvblRpbWVyKGRlbGF5KSk7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBydW50aW1lIGRhdGEgc3RydWN0dXJlcyBmb3IgdGhlIGBvbiBob3ZlcmAgZGVmZXJyZWQgdHJpZ2dlci5cbiAqIEBwYXJhbSB0cmlnZ2VySW5kZXggSW5kZXggYXQgd2hpY2ggdG8gZmluZCB0aGUgdHJpZ2dlciBlbGVtZW50LlxuICogQHBhcmFtIHdhbGtVcFRpbWVzIE51bWJlciBvZiB0aW1lcyB0byB3YWxrIHVwL2Rvd24gdGhlIHRyZWUgaGllcmFyY2h5IHRvIGZpbmQgdGhlIHRyaWdnZXIuXG4gKiBAY29kZUdlbkFwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gybXJtWRlZmVyT25Ib3Zlcih0cmlnZ2VySW5kZXg6IG51bWJlciwgd2Fsa1VwVGltZXM/OiBudW1iZXIpIHtcbiAgY29uc3QgbFZpZXcgPSBnZXRMVmlldygpO1xuICBjb25zdCB0Tm9kZSA9IGdldEN1cnJlbnRUTm9kZSgpITtcblxuICByZW5kZXJQbGFjZWhvbGRlcihsVmlldywgdE5vZGUpO1xuICByZWdpc3RlckRvbVRyaWdnZXIoXG4gICAgbFZpZXcsXG4gICAgdE5vZGUsXG4gICAgdHJpZ2dlckluZGV4LFxuICAgIHdhbGtVcFRpbWVzLFxuICAgIG9uSG92ZXIsXG4gICAgKCkgPT4gdHJpZ2dlckRlZmVyQmxvY2sobFZpZXcsIHROb2RlKSxcbiAgICBUcmlnZ2VyVHlwZS5SZWd1bGFyLFxuICApO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgcnVudGltZSBkYXRhIHN0cnVjdHVyZXMgZm9yIHRoZSBgcHJlZmV0Y2ggb24gaG92ZXJgIGRlZmVycmVkIHRyaWdnZXIuXG4gKiBAcGFyYW0gdHJpZ2dlckluZGV4IEluZGV4IGF0IHdoaWNoIHRvIGZpbmQgdGhlIHRyaWdnZXIgZWxlbWVudC5cbiAqIEBwYXJhbSB3YWxrVXBUaW1lcyBOdW1iZXIgb2YgdGltZXMgdG8gd2FsayB1cC9kb3duIHRoZSB0cmVlIGhpZXJhcmNoeSB0byBmaW5kIHRoZSB0cmlnZ2VyLlxuICogQGNvZGVHZW5BcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIMm1ybVkZWZlclByZWZldGNoT25Ib3Zlcih0cmlnZ2VySW5kZXg6IG51bWJlciwgd2Fsa1VwVGltZXM/OiBudW1iZXIpIHtcbiAgY29uc3QgbFZpZXcgPSBnZXRMVmlldygpO1xuICBjb25zdCB0Tm9kZSA9IGdldEN1cnJlbnRUTm9kZSgpITtcbiAgY29uc3QgdFZpZXcgPSBsVmlld1tUVklFV107XG4gIGNvbnN0IHREZXRhaWxzID0gZ2V0VERlZmVyQmxvY2tEZXRhaWxzKHRWaWV3LCB0Tm9kZSk7XG5cbiAgaWYgKHREZXRhaWxzLmxvYWRpbmdTdGF0ZSA9PT0gRGVmZXJEZXBlbmRlbmNpZXNMb2FkaW5nU3RhdGUuTk9UX1NUQVJURUQpIHtcbiAgICByZWdpc3RlckRvbVRyaWdnZXIoXG4gICAgICBsVmlldyxcbiAgICAgIHROb2RlLFxuICAgICAgdHJpZ2dlckluZGV4LFxuICAgICAgd2Fsa1VwVGltZXMsXG4gICAgICBvbkhvdmVyLFxuICAgICAgKCkgPT4gdHJpZ2dlclByZWZldGNoaW5nKHREZXRhaWxzLCBsVmlldywgdE5vZGUpLFxuICAgICAgVHJpZ2dlclR5cGUuUHJlZmV0Y2gsXG4gICAgKTtcbiAgfVxufVxuXG4vKipcbiAqIENyZWF0ZXMgcnVudGltZSBkYXRhIHN0cnVjdHVyZXMgZm9yIHRoZSBgb24gaW50ZXJhY3Rpb25gIGRlZmVycmVkIHRyaWdnZXIuXG4gKiBAcGFyYW0gdHJpZ2dlckluZGV4IEluZGV4IGF0IHdoaWNoIHRvIGZpbmQgdGhlIHRyaWdnZXIgZWxlbWVudC5cbiAqIEBwYXJhbSB3YWxrVXBUaW1lcyBOdW1iZXIgb2YgdGltZXMgdG8gd2FsayB1cC9kb3duIHRoZSB0cmVlIGhpZXJhcmNoeSB0byBmaW5kIHRoZSB0cmlnZ2VyLlxuICogQGNvZGVHZW5BcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIMm1ybVkZWZlck9uSW50ZXJhY3Rpb24odHJpZ2dlckluZGV4OiBudW1iZXIsIHdhbGtVcFRpbWVzPzogbnVtYmVyKSB7XG4gIGNvbnN0IGxWaWV3ID0gZ2V0TFZpZXcoKTtcbiAgY29uc3QgdE5vZGUgPSBnZXRDdXJyZW50VE5vZGUoKSE7XG5cbiAgcmVuZGVyUGxhY2Vob2xkZXIobFZpZXcsIHROb2RlKTtcbiAgcmVnaXN0ZXJEb21UcmlnZ2VyKFxuICAgIGxWaWV3LFxuICAgIHROb2RlLFxuICAgIHRyaWdnZXJJbmRleCxcbiAgICB3YWxrVXBUaW1lcyxcbiAgICBvbkludGVyYWN0aW9uLFxuICAgICgpID0+IHRyaWdnZXJEZWZlckJsb2NrKGxWaWV3LCB0Tm9kZSksXG4gICAgVHJpZ2dlclR5cGUuUmVndWxhcixcbiAgKTtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIHJ1bnRpbWUgZGF0YSBzdHJ1Y3R1cmVzIGZvciB0aGUgYHByZWZldGNoIG9uIGludGVyYWN0aW9uYCBkZWZlcnJlZCB0cmlnZ2VyLlxuICogQHBhcmFtIHRyaWdnZXJJbmRleCBJbmRleCBhdCB3aGljaCB0byBmaW5kIHRoZSB0cmlnZ2VyIGVsZW1lbnQuXG4gKiBAcGFyYW0gd2Fsa1VwVGltZXMgTnVtYmVyIG9mIHRpbWVzIHRvIHdhbGsgdXAvZG93biB0aGUgdHJlZSBoaWVyYXJjaHkgdG8gZmluZCB0aGUgdHJpZ2dlci5cbiAqIEBjb2RlR2VuQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiDJtcm1ZGVmZXJQcmVmZXRjaE9uSW50ZXJhY3Rpb24odHJpZ2dlckluZGV4OiBudW1iZXIsIHdhbGtVcFRpbWVzPzogbnVtYmVyKSB7XG4gIGNvbnN0IGxWaWV3ID0gZ2V0TFZpZXcoKTtcbiAgY29uc3QgdE5vZGUgPSBnZXRDdXJyZW50VE5vZGUoKSE7XG4gIGNvbnN0IHRWaWV3ID0gbFZpZXdbVFZJRVddO1xuICBjb25zdCB0RGV0YWlscyA9IGdldFREZWZlckJsb2NrRGV0YWlscyh0VmlldywgdE5vZGUpO1xuXG4gIGlmICh0RGV0YWlscy5sb2FkaW5nU3RhdGUgPT09IERlZmVyRGVwZW5kZW5jaWVzTG9hZGluZ1N0YXRlLk5PVF9TVEFSVEVEKSB7XG4gICAgcmVnaXN0ZXJEb21UcmlnZ2VyKFxuICAgICAgbFZpZXcsXG4gICAgICB0Tm9kZSxcbiAgICAgIHRyaWdnZXJJbmRleCxcbiAgICAgIHdhbGtVcFRpbWVzLFxuICAgICAgb25JbnRlcmFjdGlvbixcbiAgICAgICgpID0+IHRyaWdnZXJQcmVmZXRjaGluZyh0RGV0YWlscywgbFZpZXcsIHROb2RlKSxcbiAgICAgIFRyaWdnZXJUeXBlLlByZWZldGNoLFxuICAgICk7XG4gIH1cbn1cblxuLyoqXG4gKiBDcmVhdGVzIHJ1bnRpbWUgZGF0YSBzdHJ1Y3R1cmVzIGZvciB0aGUgYG9uIHZpZXdwb3J0YCBkZWZlcnJlZCB0cmlnZ2VyLlxuICogQHBhcmFtIHRyaWdnZXJJbmRleCBJbmRleCBhdCB3aGljaCB0byBmaW5kIHRoZSB0cmlnZ2VyIGVsZW1lbnQuXG4gKiBAcGFyYW0gd2Fsa1VwVGltZXMgTnVtYmVyIG9mIHRpbWVzIHRvIHdhbGsgdXAvZG93biB0aGUgdHJlZSBoaWVyYXJjaHkgdG8gZmluZCB0aGUgdHJpZ2dlci5cbiAqIEBjb2RlR2VuQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiDJtcm1ZGVmZXJPblZpZXdwb3J0KHRyaWdnZXJJbmRleDogbnVtYmVyLCB3YWxrVXBUaW1lcz86IG51bWJlcikge1xuICBjb25zdCBsVmlldyA9IGdldExWaWV3KCk7XG4gIGNvbnN0IHROb2RlID0gZ2V0Q3VycmVudFROb2RlKCkhO1xuXG4gIHJlbmRlclBsYWNlaG9sZGVyKGxWaWV3LCB0Tm9kZSk7XG4gIHJlZ2lzdGVyRG9tVHJpZ2dlcihcbiAgICBsVmlldyxcbiAgICB0Tm9kZSxcbiAgICB0cmlnZ2VySW5kZXgsXG4gICAgd2Fsa1VwVGltZXMsXG4gICAgb25WaWV3cG9ydCxcbiAgICAoKSA9PiB0cmlnZ2VyRGVmZXJCbG9jayhsVmlldywgdE5vZGUpLFxuICAgIFRyaWdnZXJUeXBlLlJlZ3VsYXIsXG4gICk7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBydW50aW1lIGRhdGEgc3RydWN0dXJlcyBmb3IgdGhlIGBwcmVmZXRjaCBvbiB2aWV3cG9ydGAgZGVmZXJyZWQgdHJpZ2dlci5cbiAqIEBwYXJhbSB0cmlnZ2VySW5kZXggSW5kZXggYXQgd2hpY2ggdG8gZmluZCB0aGUgdHJpZ2dlciBlbGVtZW50LlxuICogQHBhcmFtIHdhbGtVcFRpbWVzIE51bWJlciBvZiB0aW1lcyB0byB3YWxrIHVwL2Rvd24gdGhlIHRyZWUgaGllcmFyY2h5IHRvIGZpbmQgdGhlIHRyaWdnZXIuXG4gKiBAY29kZUdlbkFwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gybXJtWRlZmVyUHJlZmV0Y2hPblZpZXdwb3J0KHRyaWdnZXJJbmRleDogbnVtYmVyLCB3YWxrVXBUaW1lcz86IG51bWJlcikge1xuICBjb25zdCBsVmlldyA9IGdldExWaWV3KCk7XG4gIGNvbnN0IHROb2RlID0gZ2V0Q3VycmVudFROb2RlKCkhO1xuICBjb25zdCB0VmlldyA9IGxWaWV3W1RWSUVXXTtcbiAgY29uc3QgdERldGFpbHMgPSBnZXRURGVmZXJCbG9ja0RldGFpbHModFZpZXcsIHROb2RlKTtcblxuICBpZiAodERldGFpbHMubG9hZGluZ1N0YXRlID09PSBEZWZlckRlcGVuZGVuY2llc0xvYWRpbmdTdGF0ZS5OT1RfU1RBUlRFRCkge1xuICAgIHJlZ2lzdGVyRG9tVHJpZ2dlcihcbiAgICAgIGxWaWV3LFxuICAgICAgdE5vZGUsXG4gICAgICB0cmlnZ2VySW5kZXgsXG4gICAgICB3YWxrVXBUaW1lcyxcbiAgICAgIG9uVmlld3BvcnQsXG4gICAgICAoKSA9PiB0cmlnZ2VyUHJlZmV0Y2hpbmcodERldGFpbHMsIGxWaWV3LCB0Tm9kZSksXG4gICAgICBUcmlnZ2VyVHlwZS5QcmVmZXRjaCxcbiAgICApO1xuICB9XG59XG5cbi8qKioqKioqKioqIEhlbHBlciBmdW5jdGlvbnMgKioqKioqKioqKi9cblxuLyoqXG4gKiBTY2hlZHVsZXMgdHJpZ2dlcmluZyBvZiBhIGRlZmVyIGJsb2NrIGZvciBgb24gaWRsZWAgYW5kIGBvbiB0aW1lcmAgY29uZGl0aW9ucy5cbiAqL1xuZnVuY3Rpb24gc2NoZWR1bGVEZWxheWVkVHJpZ2dlcihcbiAgc2NoZWR1bGVGbjogKGNhbGxiYWNrOiBWb2lkRnVuY3Rpb24sIGxWaWV3OiBMVmlldykgPT4gVm9pZEZ1bmN0aW9uLFxuKSB7XG4gIGNvbnN0IGxWaWV3ID0gZ2V0TFZpZXcoKTtcbiAgY29uc3QgdE5vZGUgPSBnZXRDdXJyZW50VE5vZGUoKSE7XG5cbiAgcmVuZGVyUGxhY2Vob2xkZXIobFZpZXcsIHROb2RlKTtcblxuICAvLyBPbmx5IHRyaWdnZXIgdGhlIHNjaGVkdWxlZCB0cmlnZ2VyIG9uIHRoZSBicm93c2VyXG4gIC8vIHNpbmNlIHdlIGRvbid0IHdhbnQgdG8gZGVsYXkgdGhlIHNlcnZlciByZXNwb25zZS5cbiAgaWYgKGlzUGxhdGZvcm1Ccm93c2VyKGxWaWV3W0lOSkVDVE9SXSEpKSB7XG4gICAgY29uc3QgY2xlYW51cEZuID0gc2NoZWR1bGVGbigoKSA9PiB0cmlnZ2VyRGVmZXJCbG9jayhsVmlldywgdE5vZGUpLCBsVmlldyk7XG4gICAgY29uc3QgbERldGFpbHMgPSBnZXRMRGVmZXJCbG9ja0RldGFpbHMobFZpZXcsIHROb2RlKTtcbiAgICBzdG9yZVRyaWdnZXJDbGVhbnVwRm4oVHJpZ2dlclR5cGUuUmVndWxhciwgbERldGFpbHMsIGNsZWFudXBGbik7XG4gIH1cbn1cblxuLyoqXG4gKiBTY2hlZHVsZXMgcHJlZmV0Y2hpbmcgZm9yIGBvbiBpZGxlYCBhbmQgYG9uIHRpbWVyYCB0cmlnZ2Vycy5cbiAqXG4gKiBAcGFyYW0gc2NoZWR1bGVGbiBBIGZ1bmN0aW9uIHRoYXQgZG9lcyB0aGUgc2NoZWR1bGluZy5cbiAqL1xuZnVuY3Rpb24gc2NoZWR1bGVEZWxheWVkUHJlZmV0Y2hpbmcoXG4gIHNjaGVkdWxlRm46IChjYWxsYmFjazogVm9pZEZ1bmN0aW9uLCBsVmlldzogTFZpZXcpID0+IFZvaWRGdW5jdGlvbixcbikge1xuICBjb25zdCBsVmlldyA9IGdldExWaWV3KCk7XG5cbiAgLy8gT25seSB0cmlnZ2VyIHRoZSBzY2hlZHVsZWQgdHJpZ2dlciBvbiB0aGUgYnJvd3NlclxuICAvLyBzaW5jZSB3ZSBkb24ndCB3YW50IHRvIGRlbGF5IHRoZSBzZXJ2ZXIgcmVzcG9uc2UuXG4gIGlmIChpc1BsYXRmb3JtQnJvd3NlcihsVmlld1tJTkpFQ1RPUl0hKSkge1xuICAgIGNvbnN0IHROb2RlID0gZ2V0Q3VycmVudFROb2RlKCkhO1xuICAgIGNvbnN0IHRWaWV3ID0gbFZpZXdbVFZJRVddO1xuICAgIGNvbnN0IHREZXRhaWxzID0gZ2V0VERlZmVyQmxvY2tEZXRhaWxzKHRWaWV3LCB0Tm9kZSk7XG5cbiAgICBpZiAodERldGFpbHMubG9hZGluZ1N0YXRlID09PSBEZWZlckRlcGVuZGVuY2llc0xvYWRpbmdTdGF0ZS5OT1RfU1RBUlRFRCkge1xuICAgICAgY29uc3QgbERldGFpbHMgPSBnZXRMRGVmZXJCbG9ja0RldGFpbHMobFZpZXcsIHROb2RlKTtcbiAgICAgIGNvbnN0IHByZWZldGNoID0gKCkgPT4gdHJpZ2dlclByZWZldGNoaW5nKHREZXRhaWxzLCBsVmlldywgdE5vZGUpO1xuICAgICAgY29uc3QgY2xlYW51cEZuID0gc2NoZWR1bGVGbihwcmVmZXRjaCwgbFZpZXcpO1xuICAgICAgc3RvcmVUcmlnZ2VyQ2xlYW51cEZuKFRyaWdnZXJUeXBlLlByZWZldGNoLCBsRGV0YWlscywgY2xlYW51cEZuKTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBUcmFuc2l0aW9ucyBhIGRlZmVyIGJsb2NrIHRvIHRoZSBuZXcgc3RhdGUuIFVwZGF0ZXMgdGhlICBuZWNlc3NhcnlcbiAqIGRhdGEgc3RydWN0dXJlcyBhbmQgcmVuZGVycyBjb3JyZXNwb25kaW5nIGJsb2NrLlxuICpcbiAqIEBwYXJhbSBuZXdTdGF0ZSBOZXcgc3RhdGUgdGhhdCBzaG91bGQgYmUgYXBwbGllZCB0byB0aGUgZGVmZXIgYmxvY2suXG4gKiBAcGFyYW0gdE5vZGUgVE5vZGUgdGhhdCByZXByZXNlbnRzIGEgZGVmZXIgYmxvY2suXG4gKiBAcGFyYW0gbENvbnRhaW5lciBSZXByZXNlbnRzIGFuIGluc3RhbmNlIG9mIGEgZGVmZXIgYmxvY2suXG4gKiBAcGFyYW0gc2tpcFRpbWVyU2NoZWR1bGluZyBJbmRpY2F0ZXMgdGhhdCBgQGxvYWRpbmdgIGFuZCBgQHBsYWNlaG9sZGVyYCBibG9ja1xuICogICBzaG91bGQgYmUgcmVuZGVyZWQgaW1tZWRpYXRlbHksIGV2ZW4gaWYgdGhleSBoYXZlIGBhZnRlcmAgb3IgYG1pbmltdW1gIGNvbmZpZ1xuICogICBvcHRpb25zIHNldHVwLiBUaGlzIGZsYWcgdG8gbmVlZGVkIGZvciB0ZXN0aW5nIEFQSXMgdG8gdHJhbnNpdGlvbiBkZWZlciBibG9ja1xuICogICBiZXR3ZWVuIHN0YXRlcyB2aWEgYERlZmVyRml4dHVyZS5yZW5kZXJgIG1ldGhvZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlckRlZmVyQmxvY2tTdGF0ZShcbiAgbmV3U3RhdGU6IERlZmVyQmxvY2tTdGF0ZSxcbiAgdE5vZGU6IFROb2RlLFxuICBsQ29udGFpbmVyOiBMQ29udGFpbmVyLFxuICBza2lwVGltZXJTY2hlZHVsaW5nID0gZmFsc2UsXG4pOiB2b2lkIHtcbiAgY29uc3QgaG9zdExWaWV3ID0gbENvbnRhaW5lcltQQVJFTlRdO1xuICBjb25zdCBob3N0VFZpZXcgPSBob3N0TFZpZXdbVFZJRVddO1xuXG4gIC8vIENoZWNrIGlmIHRoaXMgdmlldyBpcyBub3QgZGVzdHJveWVkLiBTaW5jZSB0aGUgbG9hZGluZyBwcm9jZXNzIHdhcyBhc3luYyxcbiAgLy8gdGhlIHZpZXcgbWlnaHQgZW5kIHVwIGJlaW5nIGRlc3Ryb3llZCBieSB0aGUgdGltZSByZW5kZXJpbmcgaGFwcGVucy5cbiAgaWYgKGlzRGVzdHJveWVkKGhvc3RMVmlldykpIHJldHVybjtcblxuICAvLyBNYWtlIHN1cmUgdGhpcyBUTm9kZSBiZWxvbmdzIHRvIFRWaWV3IHRoYXQgcmVwcmVzZW50cyBob3N0IExWaWV3LlxuICBuZ0Rldk1vZGUgJiYgYXNzZXJ0VE5vZGVGb3JMVmlldyh0Tm9kZSwgaG9zdExWaWV3KTtcblxuICBjb25zdCBsRGV0YWlscyA9IGdldExEZWZlckJsb2NrRGV0YWlscyhob3N0TFZpZXcsIHROb2RlKTtcblxuICBuZ0Rldk1vZGUgJiYgYXNzZXJ0RGVmaW5lZChsRGV0YWlscywgJ0V4cGVjdGVkIGEgZGVmZXIgYmxvY2sgc3RhdGUgZGVmaW5lZCcpO1xuXG4gIGNvbnN0IGN1cnJlbnRTdGF0ZSA9IGxEZXRhaWxzW0RFRkVSX0JMT0NLX1NUQVRFXTtcblxuICBpZiAoXG4gICAgaXNWYWxpZFN0YXRlQ2hhbmdlKGN1cnJlbnRTdGF0ZSwgbmV3U3RhdGUpICYmXG4gICAgaXNWYWxpZFN0YXRlQ2hhbmdlKGxEZXRhaWxzW05FWFRfREVGRVJfQkxPQ0tfU1RBVEVdID8/IC0xLCBuZXdTdGF0ZSlcbiAgKSB7XG4gICAgY29uc3QgaW5qZWN0b3IgPSBob3N0TFZpZXdbSU5KRUNUT1JdITtcbiAgICBjb25zdCB0RGV0YWlscyA9IGdldFREZWZlckJsb2NrRGV0YWlscyhob3N0VFZpZXcsIHROb2RlKTtcbiAgICAvLyBTa2lwcyBzY2hlZHVsaW5nIG9uIHRoZSBzZXJ2ZXIgc2luY2UgaXQgY2FuIGRlbGF5IHRoZSBzZXJ2ZXIgcmVzcG9uc2UuXG4gICAgY29uc3QgbmVlZHNTY2hlZHVsaW5nID1cbiAgICAgICFza2lwVGltZXJTY2hlZHVsaW5nICYmXG4gICAgICBpc1BsYXRmb3JtQnJvd3NlcihpbmplY3RvcikgJiZcbiAgICAgIChnZXRMb2FkaW5nQmxvY2tBZnRlcih0RGV0YWlscykgIT09IG51bGwgfHxcbiAgICAgICAgZ2V0TWluaW11bUR1cmF0aW9uRm9yU3RhdGUodERldGFpbHMsIERlZmVyQmxvY2tTdGF0ZS5Mb2FkaW5nKSAhPT0gbnVsbCB8fFxuICAgICAgICBnZXRNaW5pbXVtRHVyYXRpb25Gb3JTdGF0ZSh0RGV0YWlscywgRGVmZXJCbG9ja1N0YXRlLlBsYWNlaG9sZGVyKSk7XG5cbiAgICBpZiAobmdEZXZNb2RlICYmIG5lZWRzU2NoZWR1bGluZykge1xuICAgICAgYXNzZXJ0RGVmaW5lZChcbiAgICAgICAgYXBwbHlEZWZlckJsb2NrU3RhdGVXaXRoU2NoZWR1bGluZ0ltcGwsXG4gICAgICAgICdFeHBlY3RlZCBzY2hlZHVsaW5nIGZ1bmN0aW9uIHRvIGJlIGRlZmluZWQnLFxuICAgICAgKTtcbiAgICB9XG5cbiAgICBjb25zdCBhcHBseVN0YXRlRm4gPSBuZWVkc1NjaGVkdWxpbmdcbiAgICAgID8gYXBwbHlEZWZlckJsb2NrU3RhdGVXaXRoU2NoZWR1bGluZ0ltcGwhXG4gICAgICA6IGFwcGx5RGVmZXJCbG9ja1N0YXRlO1xuICAgIHRyeSB7XG4gICAgICBhcHBseVN0YXRlRm4obmV3U3RhdGUsIGxEZXRhaWxzLCBsQ29udGFpbmVyLCB0Tm9kZSwgaG9zdExWaWV3KTtcbiAgICB9IGNhdGNoIChlcnJvcjogdW5rbm93bikge1xuICAgICAgaGFuZGxlRXJyb3IoaG9zdExWaWV3LCBlcnJvcik7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQ2hlY2tzIHdoZXRoZXIgdGhlcmUgaXMgYSBjYWNoZWQgaW5qZWN0b3IgYXNzb2NpYXRlZCB3aXRoIGEgZ2l2ZW4gZGVmZXIgYmxvY2tcbiAqIGRlY2xhcmF0aW9uIGFuZCByZXR1cm5zIGlmIGl0IGV4aXN0cy4gSWYgdGhlcmUgaXMgbm8gY2FjaGVkIGluamVjdG9yIHByZXNlbnQgLVxuICogY3JlYXRlcyBhIG5ldyBpbmplY3RvciBhbmQgc3RvcmVzIGluIHRoZSBjYWNoZS5cbiAqL1xuZnVuY3Rpb24gZ2V0T3JDcmVhdGVFbnZpcm9ubWVudEluamVjdG9yKFxuICBwYXJlbnRJbmplY3RvcjogSW5qZWN0b3IsXG4gIHREZXRhaWxzOiBURGVmZXJCbG9ja0RldGFpbHMsXG4gIHByb3ZpZGVyczogUHJvdmlkZXJbXSxcbikge1xuICByZXR1cm4gcGFyZW50SW5qZWN0b3JcbiAgICAuZ2V0KENhY2hlZEluamVjdG9yU2VydmljZSlcbiAgICAuZ2V0T3JDcmVhdGVJbmplY3RvcihcbiAgICAgIHREZXRhaWxzLFxuICAgICAgcGFyZW50SW5qZWN0b3IgYXMgRW52aXJvbm1lbnRJbmplY3RvcixcbiAgICAgIHByb3ZpZGVycyxcbiAgICAgIG5nRGV2TW9kZSA/ICdEZWZlckJsb2NrIEluamVjdG9yJyA6ICcnLFxuICAgICk7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBpbmplY3Rvciwgd2hpY2ggY29udGFpbnMgcHJvdmlkZXJzIGNvbGxlY3RlZCBmcm9tIGRlcGVuZGVuY2llcyAoTmdNb2R1bGVzKSBvZlxuICogZGVmZXItbG9hZGVkIGNvbXBvbmVudHMuIFRoaXMgZnVuY3Rpb24gZGV0ZWN0cyBkaWZmZXJlbnQgdHlwZXMgb2YgcGFyZW50IGluamVjdG9ycyBhbmQgY3JlYXRlc1xuICogYSBuZXcgaW5qZWN0b3IgYmFzZWQgb24gdGhhdC5cbiAqL1xuZnVuY3Rpb24gY3JlYXRlRGVmZXJCbG9ja0luamVjdG9yKFxuICBwYXJlbnRJbmplY3RvcjogSW5qZWN0b3IsXG4gIHREZXRhaWxzOiBURGVmZXJCbG9ja0RldGFpbHMsXG4gIHByb3ZpZGVyczogUHJvdmlkZXJbXSxcbikge1xuICAvLyBDaGVjayBpZiB0aGUgcGFyZW50IGluamVjdG9yIGlzIGFuIGluc3RhbmNlIG9mIGEgYENoYWluZWRJbmplY3RvcmAuXG4gIC8vXG4gIC8vIEluIHRoaXMgY2FzZSwgd2UgcmV0YWluIHRoZSBzaGFwZSBvZiB0aGUgaW5qZWN0b3IgYW5kIHVzZSBhIG5ld2x5IGNyZWF0ZWRcbiAgLy8gYEVudmlyb25tZW50SW5qZWN0b3JgIGFzIGEgcGFyZW50IGluIHRoZSBgQ2hhaW5lZEluamVjdG9yYC4gVGhhdCBpcyBuZWVkZWQgdG9cbiAgLy8gbWFrZSBzdXJlIHRoYXQgdGhlIHByaW1hcnkgaW5qZWN0b3IgZ2V0cyBjb25zdWx0ZWQgZmlyc3QgKHNpbmNlIGl0J3MgdHlwaWNhbGx5XG4gIC8vIGEgTm9kZUluamVjdG9yKSBhbmQgYEVudmlyb25tZW50SW5qZWN0b3JgIHRyZWUgaXMgY29uc3VsdGVkIGFmdGVyIHRoYXQuXG4gIGlmIChwYXJlbnRJbmplY3RvciBpbnN0YW5jZW9mIENoYWluZWRJbmplY3Rvcikge1xuICAgIGNvbnN0IG9yaWdJbmplY3RvciA9IHBhcmVudEluamVjdG9yLmluamVjdG9yO1xuICAgIC8vIEd1YXJhbnRlZWQgdG8gYmUgYW4gZW52aXJvbm1lbnQgaW5qZWN0b3JcbiAgICBjb25zdCBwYXJlbnRFbnZJbmplY3RvciA9IHBhcmVudEluamVjdG9yLnBhcmVudEluamVjdG9yO1xuXG4gICAgY29uc3QgZW52SW5qZWN0b3IgPSBnZXRPckNyZWF0ZUVudmlyb25tZW50SW5qZWN0b3IocGFyZW50RW52SW5qZWN0b3IsIHREZXRhaWxzLCBwcm92aWRlcnMpO1xuICAgIHJldHVybiBuZXcgQ2hhaW5lZEluamVjdG9yKG9yaWdJbmplY3RvciwgZW52SW5qZWN0b3IpO1xuICB9XG5cbiAgY29uc3QgcGFyZW50RW52SW5qZWN0b3IgPSBwYXJlbnRJbmplY3Rvci5nZXQoRW52aXJvbm1lbnRJbmplY3Rvcik7XG5cbiAgLy8gSWYgdGhlIGBwYXJlbnRJbmplY3RvcmAgaXMgKm5vdCogYW4gYEVudmlyb25tZW50SW5qZWN0b3JgIC0gd2UgbmVlZCB0byBjcmVhdGVcbiAgLy8gYSBuZXcgYENoYWluZWRJbmplY3RvcmAgd2l0aCB0aGUgZm9sbG93aW5nIHNldHVwOlxuICAvL1xuICAvLyAgLSB0aGUgcHJvdmlkZWQgYHBhcmVudEluamVjdG9yYCBiZWNvbWVzIGEgcHJpbWFyeSBpbmplY3RvclxuICAvLyAgLSBhbiBleGlzdGluZyAocmVhbCkgYEVudmlyb25tZW50SW5qZWN0b3JgIGJlY29tZXMgYSBwYXJlbnQgaW5qZWN0b3IgZm9yXG4gIC8vICAgIGEgbmV3bHktY3JlYXRlZCBvbmUsIHdoaWNoIGNvbnRhaW5zIGV4dHJhIHByb3ZpZGVyc1xuICAvL1xuICAvLyBTbyB0aGUgZmluYWwgb3JkZXIgaW4gd2hpY2ggaW5qZWN0b3JzIHdvdWxkIGJlIGNvbnN1bHRlZCBpbiB0aGlzIGNhc2Ugd291bGQgbG9vayBsaWtlIHRoaXM6XG4gIC8vXG4gIC8vICAxLiBQcm92aWRlZCBgcGFyZW50SW5qZWN0b3JgXG4gIC8vICAyLiBOZXdseS1jcmVhdGVkIGBFbnZpcm9ubWVudEluamVjdG9yYCB3aXRoIGV4dHJhIHByb3ZpZGVyc1xuICAvLyAgMy4gYEVudmlyb25tZW50SW5qZWN0b3JgIGZyb20gdGhlIGBwYXJlbnRJbmplY3RvcmBcbiAgaWYgKHBhcmVudEVudkluamVjdG9yICE9PSBwYXJlbnRJbmplY3Rvcikge1xuICAgIGNvbnN0IGVudkluamVjdG9yID0gZ2V0T3JDcmVhdGVFbnZpcm9ubWVudEluamVjdG9yKHBhcmVudEVudkluamVjdG9yLCB0RGV0YWlscywgcHJvdmlkZXJzKTtcbiAgICByZXR1cm4gbmV3IENoYWluZWRJbmplY3RvcihwYXJlbnRJbmplY3RvciwgZW52SW5qZWN0b3IpO1xuICB9XG5cbiAgLy8gVGhlIGBwYXJlbnRJbmplY3RvcmAgaXMgYW4gaW5zdGFuY2Ugb2YgYW4gYEVudmlyb25tZW50SW5qZWN0b3JgLlxuICAvLyBObyBuZWVkIGZvciBzcGVjaWFsIGhhbmRsaW5nLCB3ZSBjYW4gdXNlIGBwYXJlbnRJbmplY3RvcmAgYXMgYVxuICAvLyBwYXJlbnQgaW5qZWN0b3IgZGlyZWN0bHkuXG4gIHJldHVybiBnZXRPckNyZWF0ZUVudmlyb25tZW50SW5qZWN0b3IocGFyZW50SW5qZWN0b3IsIHREZXRhaWxzLCBwcm92aWRlcnMpO1xufVxuXG4vKipcbiAqIEFwcGxpZXMgY2hhbmdlcyB0byB0aGUgRE9NIHRvIHJlZmxlY3QgYSBnaXZlbiBzdGF0ZS5cbiAqL1xuZnVuY3Rpb24gYXBwbHlEZWZlckJsb2NrU3RhdGUoXG4gIG5ld1N0YXRlOiBEZWZlckJsb2NrU3RhdGUsXG4gIGxEZXRhaWxzOiBMRGVmZXJCbG9ja0RldGFpbHMsXG4gIGxDb250YWluZXI6IExDb250YWluZXIsXG4gIHROb2RlOiBUTm9kZSxcbiAgaG9zdExWaWV3OiBMVmlldzx1bmtub3duPixcbikge1xuICBjb25zdCBzdGF0ZVRtcGxJbmRleCA9IGdldFRlbXBsYXRlSW5kZXhGb3JTdGF0ZShuZXdTdGF0ZSwgaG9zdExWaWV3LCB0Tm9kZSk7XG5cbiAgaWYgKHN0YXRlVG1wbEluZGV4ICE9PSBudWxsKSB7XG4gICAgbERldGFpbHNbREVGRVJfQkxPQ0tfU1RBVEVdID0gbmV3U3RhdGU7XG4gICAgY29uc3QgaG9zdFRWaWV3ID0gaG9zdExWaWV3W1RWSUVXXTtcbiAgICBjb25zdCBhZGp1c3RlZEluZGV4ID0gc3RhdGVUbXBsSW5kZXggKyBIRUFERVJfT0ZGU0VUO1xuICAgIGNvbnN0IGFjdGl2ZUJsb2NrVE5vZGUgPSBnZXRUTm9kZShob3N0VFZpZXcsIGFkanVzdGVkSW5kZXgpIGFzIFRDb250YWluZXJOb2RlO1xuXG4gICAgLy8gVGhlcmUgaXMgb25seSAxIHZpZXcgdGhhdCBjYW4gYmUgcHJlc2VudCBpbiBhbiBMQ29udGFpbmVyIHRoYXRcbiAgICAvLyByZXByZXNlbnRzIGEgZGVmZXIgYmxvY2ssIHNvIGFsd2F5cyByZWZlciB0byB0aGUgZmlyc3Qgb25lLlxuICAgIGNvbnN0IHZpZXdJbmRleCA9IDA7XG5cbiAgICByZW1vdmVMVmlld0Zyb21MQ29udGFpbmVyKGxDb250YWluZXIsIHZpZXdJbmRleCk7XG5cbiAgICBsZXQgaW5qZWN0b3I6IEluamVjdG9yIHwgdW5kZWZpbmVkO1xuICAgIGlmIChuZXdTdGF0ZSA9PT0gRGVmZXJCbG9ja1N0YXRlLkNvbXBsZXRlKSB7XG4gICAgICAvLyBXaGVuIHdlIHJlbmRlciBhIGRlZmVyIGJsb2NrIGluIGNvbXBsZXRlZCBzdGF0ZSwgdGhlcmUgbWlnaHQgYmVcbiAgICAgIC8vIG5ld2x5IGxvYWRlZCBzdGFuZGFsb25lIGNvbXBvbmVudHMgdXNlZCB3aXRoaW4gdGhlIGJsb2NrLCB3aGljaCBtYXlcbiAgICAgIC8vIGltcG9ydCBOZ01vZHVsZXMgd2l0aCBwcm92aWRlcnMuIEluIG9yZGVyIHRvIG1ha2UgdGhvc2UgcHJvdmlkZXJzXG4gICAgICAvLyBhdmFpbGFibGUgZm9yIGNvbXBvbmVudHMgZGVjbGFyZWQgaW4gdGhhdCBOZ01vZHVsZSwgd2UgY3JlYXRlIGFuIGluc3RhbmNlXG4gICAgICAvLyBvZiBhbiBlbnZpcm9ubWVudCBpbmplY3RvciB0byBob3N0IHRob3NlIHByb3ZpZGVycyBhbmQgcGFzcyB0aGlzIGluamVjdG9yXG4gICAgICAvLyB0byB0aGUgbG9naWMgdGhhdCBjcmVhdGVzIGEgdmlldy5cbiAgICAgIGNvbnN0IHREZXRhaWxzID0gZ2V0VERlZmVyQmxvY2tEZXRhaWxzKGhvc3RUVmlldywgdE5vZGUpO1xuICAgICAgY29uc3QgcHJvdmlkZXJzID0gdERldGFpbHMucHJvdmlkZXJzO1xuICAgICAgaWYgKHByb3ZpZGVycyAmJiBwcm92aWRlcnMubGVuZ3RoID4gMCkge1xuICAgICAgICBpbmplY3RvciA9IGNyZWF0ZURlZmVyQmxvY2tJbmplY3Rvcihob3N0TFZpZXdbSU5KRUNUT1JdISwgdERldGFpbHMsIHByb3ZpZGVycyk7XG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IGRlaHlkcmF0ZWRWaWV3ID0gZmluZE1hdGNoaW5nRGVoeWRyYXRlZFZpZXcobENvbnRhaW5lciwgYWN0aXZlQmxvY2tUTm9kZS50VmlldyEuc3NySWQpO1xuICAgIGNvbnN0IGVtYmVkZGVkTFZpZXcgPSBjcmVhdGVBbmRSZW5kZXJFbWJlZGRlZExWaWV3KGhvc3RMVmlldywgYWN0aXZlQmxvY2tUTm9kZSwgbnVsbCwge1xuICAgICAgZGVoeWRyYXRlZFZpZXcsXG4gICAgICBpbmplY3RvcixcbiAgICB9KTtcbiAgICBhZGRMVmlld1RvTENvbnRhaW5lcihcbiAgICAgIGxDb250YWluZXIsXG4gICAgICBlbWJlZGRlZExWaWV3LFxuICAgICAgdmlld0luZGV4LFxuICAgICAgc2hvdWxkQWRkVmlld1RvRG9tKGFjdGl2ZUJsb2NrVE5vZGUsIGRlaHlkcmF0ZWRWaWV3KSxcbiAgICApO1xuICAgIG1hcmtWaWV3RGlydHkoZW1iZWRkZWRMVmlldywgTm90aWZpY2F0aW9uU291cmNlLkRlZmVyQmxvY2tTdGF0ZVVwZGF0ZSk7XG4gIH1cbn1cblxuLyoqXG4gKiBFeHRlbmRzIHRoZSBgYXBwbHlEZWZlckJsb2NrU3RhdGVgIHdpdGggdGltZXItYmFzZWQgc2NoZWR1bGluZy5cbiAqIFRoaXMgZnVuY3Rpb24gYmVjb21lcyBhdmFpbGFibGUgb24gYSBwYWdlIGlmIHRoZXJlIGFyZSBkZWZlciBibG9ja3NcbiAqIHRoYXQgdXNlIGBhZnRlcmAgb3IgYG1pbmltdW1gIHBhcmFtZXRlcnMgaW4gdGhlIGBAbG9hZGluZ2Agb3JcbiAqIGBAcGxhY2Vob2xkZXJgIGJsb2Nrcy5cbiAqL1xuZnVuY3Rpb24gYXBwbHlEZWZlckJsb2NrU3RhdGVXaXRoU2NoZWR1bGluZyhcbiAgbmV3U3RhdGU6IERlZmVyQmxvY2tTdGF0ZSxcbiAgbERldGFpbHM6IExEZWZlckJsb2NrRGV0YWlscyxcbiAgbENvbnRhaW5lcjogTENvbnRhaW5lcixcbiAgdE5vZGU6IFROb2RlLFxuICBob3N0TFZpZXc6IExWaWV3PHVua25vd24+LFxuKSB7XG4gIGNvbnN0IG5vdyA9IERhdGUubm93KCk7XG4gIGNvbnN0IGhvc3RUVmlldyA9IGhvc3RMVmlld1tUVklFV107XG4gIGNvbnN0IHREZXRhaWxzID0gZ2V0VERlZmVyQmxvY2tEZXRhaWxzKGhvc3RUVmlldywgdE5vZGUpO1xuXG4gIGlmIChsRGV0YWlsc1tTVEFURV9JU19GUk9aRU5fVU5USUxdID09PSBudWxsIHx8IGxEZXRhaWxzW1NUQVRFX0lTX0ZST1pFTl9VTlRJTF0gPD0gbm93KSB7XG4gICAgbERldGFpbHNbU1RBVEVfSVNfRlJPWkVOX1VOVElMXSA9IG51bGw7XG5cbiAgICBjb25zdCBsb2FkaW5nQWZ0ZXIgPSBnZXRMb2FkaW5nQmxvY2tBZnRlcih0RGV0YWlscyk7XG4gICAgY29uc3QgaW5Mb2FkaW5nQWZ0ZXJQaGFzZSA9IGxEZXRhaWxzW0xPQURJTkdfQUZURVJfQ0xFQU5VUF9GTl0gIT09IG51bGw7XG4gICAgaWYgKG5ld1N0YXRlID09PSBEZWZlckJsb2NrU3RhdGUuTG9hZGluZyAmJiBsb2FkaW5nQWZ0ZXIgIT09IG51bGwgJiYgIWluTG9hZGluZ0FmdGVyUGhhc2UpIHtcbiAgICAgIC8vIFRyeWluZyB0byByZW5kZXIgbG9hZGluZywgYnV0IGl0IGhhcyBhbiBgYWZ0ZXJgIGNvbmZpZyxcbiAgICAgIC8vIHNvIHNjaGVkdWxlIGFuIHVwZGF0ZSBhY3Rpb24gYWZ0ZXIgYSB0aW1lb3V0LlxuICAgICAgbERldGFpbHNbTkVYVF9ERUZFUl9CTE9DS19TVEFURV0gPSBuZXdTdGF0ZTtcbiAgICAgIGNvbnN0IGNsZWFudXBGbiA9IHNjaGVkdWxlRGVmZXJCbG9ja1VwZGF0ZShcbiAgICAgICAgbG9hZGluZ0FmdGVyLFxuICAgICAgICBsRGV0YWlscyxcbiAgICAgICAgdE5vZGUsXG4gICAgICAgIGxDb250YWluZXIsXG4gICAgICAgIGhvc3RMVmlldyxcbiAgICAgICk7XG4gICAgICBsRGV0YWlsc1tMT0FESU5HX0FGVEVSX0NMRUFOVVBfRk5dID0gY2xlYW51cEZuO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBJZiB3ZSB0cmFuc2l0aW9uIHRvIGEgY29tcGxldGUgb3IgYW4gZXJyb3Igc3RhdGUgYW5kIHRoZXJlIGlzIGEgcGVuZGluZ1xuICAgICAgLy8gb3BlcmF0aW9uIHRvIHJlbmRlciBsb2FkaW5nIGFmdGVyIGEgdGltZW91dCAtIGludm9rZSBhIGNsZWFudXAgb3BlcmF0aW9uLFxuICAgICAgLy8gd2hpY2ggc3RvcHMgdGhlIHRpbWVyLlxuICAgICAgaWYgKG5ld1N0YXRlID4gRGVmZXJCbG9ja1N0YXRlLkxvYWRpbmcgJiYgaW5Mb2FkaW5nQWZ0ZXJQaGFzZSkge1xuICAgICAgICBsRGV0YWlsc1tMT0FESU5HX0FGVEVSX0NMRUFOVVBfRk5dISgpO1xuICAgICAgICBsRGV0YWlsc1tMT0FESU5HX0FGVEVSX0NMRUFOVVBfRk5dID0gbnVsbDtcbiAgICAgICAgbERldGFpbHNbTkVYVF9ERUZFUl9CTE9DS19TVEFURV0gPSBudWxsO1xuICAgICAgfVxuXG4gICAgICBhcHBseURlZmVyQmxvY2tTdGF0ZShuZXdTdGF0ZSwgbERldGFpbHMsIGxDb250YWluZXIsIHROb2RlLCBob3N0TFZpZXcpO1xuXG4gICAgICBjb25zdCBkdXJhdGlvbiA9IGdldE1pbmltdW1EdXJhdGlvbkZvclN0YXRlKHREZXRhaWxzLCBuZXdTdGF0ZSk7XG4gICAgICBpZiAoZHVyYXRpb24gIT09IG51bGwpIHtcbiAgICAgICAgbERldGFpbHNbU1RBVEVfSVNfRlJPWkVOX1VOVElMXSA9IG5vdyArIGR1cmF0aW9uO1xuICAgICAgICBzY2hlZHVsZURlZmVyQmxvY2tVcGRhdGUoZHVyYXRpb24sIGxEZXRhaWxzLCB0Tm9kZSwgbENvbnRhaW5lciwgaG9zdExWaWV3KTtcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgLy8gV2UgYXJlIHN0aWxsIHJlbmRlcmluZyB0aGUgcHJldmlvdXMgc3RhdGUuXG4gICAgLy8gVXBkYXRlIHRoZSBgTkVYVF9ERUZFUl9CTE9DS19TVEFURWAsIHdoaWNoIHdvdWxkIGJlXG4gICAgLy8gcGlja2VkIHVwIG9uY2UgaXQncyB0aW1lIHRvIHRyYW5zaXRpb24gdG8gdGhlIG5leHQgc3RhdGUuXG4gICAgbERldGFpbHNbTkVYVF9ERUZFUl9CTE9DS19TVEFURV0gPSBuZXdTdGF0ZTtcbiAgfVxufVxuXG4vKipcbiAqIFNjaGVkdWxlcyBhbiB1cGRhdGUgb3BlcmF0aW9uIGFmdGVyIGEgc3BlY2lmaWVkIHRpbWVvdXQuXG4gKi9cbmZ1bmN0aW9uIHNjaGVkdWxlRGVmZXJCbG9ja1VwZGF0ZShcbiAgdGltZW91dDogbnVtYmVyLFxuICBsRGV0YWlsczogTERlZmVyQmxvY2tEZXRhaWxzLFxuICB0Tm9kZTogVE5vZGUsXG4gIGxDb250YWluZXI6IExDb250YWluZXIsXG4gIGhvc3RMVmlldzogTFZpZXc8dW5rbm93bj4sXG4pOiBWb2lkRnVuY3Rpb24ge1xuICBjb25zdCBjYWxsYmFjayA9ICgpID0+IHtcbiAgICBjb25zdCBuZXh0U3RhdGUgPSBsRGV0YWlsc1tORVhUX0RFRkVSX0JMT0NLX1NUQVRFXTtcbiAgICBsRGV0YWlsc1tTVEFURV9JU19GUk9aRU5fVU5USUxdID0gbnVsbDtcbiAgICBsRGV0YWlsc1tORVhUX0RFRkVSX0JMT0NLX1NUQVRFXSA9IG51bGw7XG4gICAgaWYgKG5leHRTdGF0ZSAhPT0gbnVsbCkge1xuICAgICAgcmVuZGVyRGVmZXJCbG9ja1N0YXRlKG5leHRTdGF0ZSwgdE5vZGUsIGxDb250YWluZXIpO1xuICAgIH1cbiAgfTtcbiAgcmV0dXJuIHNjaGVkdWxlVGltZXJUcmlnZ2VyKHRpbWVvdXQsIGNhbGxiYWNrLCBob3N0TFZpZXcpO1xufVxuXG4vKipcbiAqIENoZWNrcyB3aGV0aGVyIHdlIGNhbiB0cmFuc2l0aW9uIHRvIHRoZSBuZXh0IHN0YXRlLlxuICpcbiAqIFdlIHRyYW5zaXRpb24gdG8gdGhlIG5leHQgc3RhdGUgaWYgdGhlIHByZXZpb3VzIHN0YXRlIHdhcyByZXByZXNlbnRlZFxuICogd2l0aCBhIG51bWJlciB0aGF0IGlzIGxlc3MgdGhhbiB0aGUgbmV4dCBzdGF0ZS4gRm9yIGV4YW1wbGUsIGlmIHRoZSBjdXJyZW50XG4gKiBzdGF0ZSBpcyBcImxvYWRpbmdcIiAocmVwcmVzZW50ZWQgYXMgYDFgKSwgd2Ugc2hvdWxkIG5vdCBzaG93IGEgcGxhY2Vob2xkZXJcbiAqIChyZXByZXNlbnRlZCBhcyBgMGApLCBidXQgd2UgY2FuIHNob3cgYSBjb21wbGV0ZWQgc3RhdGUgKHJlcHJlc2VudGVkIGFzIGAyYClcbiAqIG9yIGFuIGVycm9yIHN0YXRlIChyZXByZXNlbnRlZCBhcyBgM2ApLlxuICovXG5mdW5jdGlvbiBpc1ZhbGlkU3RhdGVDaGFuZ2UoXG4gIGN1cnJlbnRTdGF0ZTogRGVmZXJCbG9ja1N0YXRlIHwgRGVmZXJCbG9ja0ludGVybmFsU3RhdGUsXG4gIG5ld1N0YXRlOiBEZWZlckJsb2NrU3RhdGUsXG4pOiBib29sZWFuIHtcbiAgcmV0dXJuIGN1cnJlbnRTdGF0ZSA8IG5ld1N0YXRlO1xufVxuXG4vKipcbiAqIFRyaWdnZXIgcHJlZmV0Y2hpbmcgb2YgZGVwZW5kZW5jaWVzIGZvciBhIGRlZmVyIGJsb2NrLlxuICpcbiAqIEBwYXJhbSB0RGV0YWlscyBTdGF0aWMgaW5mb3JtYXRpb24gYWJvdXQgdGhpcyBkZWZlciBibG9jay5cbiAqIEBwYXJhbSBsVmlldyBMVmlldyBvZiBhIGhvc3Qgdmlldy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRyaWdnZXJQcmVmZXRjaGluZyh0RGV0YWlsczogVERlZmVyQmxvY2tEZXRhaWxzLCBsVmlldzogTFZpZXcsIHROb2RlOiBUTm9kZSkge1xuICBpZiAobFZpZXdbSU5KRUNUT1JdICYmIHNob3VsZFRyaWdnZXJEZWZlckJsb2NrKGxWaWV3W0lOSkVDVE9SXSEpKSB7XG4gICAgdHJpZ2dlclJlc291cmNlTG9hZGluZyh0RGV0YWlscywgbFZpZXcsIHROb2RlKTtcbiAgfVxufVxuXG4vKipcbiAqIFRyaWdnZXIgbG9hZGluZyBvZiBkZWZlciBibG9jayBkZXBlbmRlbmNpZXMgaWYgdGhlIHByb2Nlc3MgaGFzbid0IHN0YXJ0ZWQgeWV0LlxuICpcbiAqIEBwYXJhbSB0RGV0YWlscyBTdGF0aWMgaW5mb3JtYXRpb24gYWJvdXQgdGhpcyBkZWZlciBibG9jay5cbiAqIEBwYXJhbSBsVmlldyBMVmlldyBvZiBhIGhvc3Qgdmlldy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRyaWdnZXJSZXNvdXJjZUxvYWRpbmcoXG4gIHREZXRhaWxzOiBURGVmZXJCbG9ja0RldGFpbHMsXG4gIGxWaWV3OiBMVmlldyxcbiAgdE5vZGU6IFROb2RlLFxuKTogUHJvbWlzZTx1bmtub3duPiB7XG4gIGNvbnN0IGluamVjdG9yID0gbFZpZXdbSU5KRUNUT1JdITtcbiAgY29uc3QgdFZpZXcgPSBsVmlld1tUVklFV107XG5cbiAgaWYgKHREZXRhaWxzLmxvYWRpbmdTdGF0ZSAhPT0gRGVmZXJEZXBlbmRlbmNpZXNMb2FkaW5nU3RhdGUuTk9UX1NUQVJURUQpIHtcbiAgICAvLyBJZiB0aGUgbG9hZGluZyBzdGF0dXMgaXMgZGlmZmVyZW50IGZyb20gaW5pdGlhbCBvbmUsIGl0IG1lYW5zIHRoYXRcbiAgICAvLyB0aGUgbG9hZGluZyBvZiBkZXBlbmRlbmNpZXMgaXMgaW4gcHJvZ3Jlc3MgYW5kIHRoZXJlIGlzIG5vdGhpbmcgdG8gZG9cbiAgICAvLyBpbiB0aGlzIGZ1bmN0aW9uLiBBbGwgZGV0YWlscyBjYW4gYmUgb2J0YWluZWQgZnJvbSB0aGUgYHREZXRhaWxzYCBvYmplY3QuXG4gICAgcmV0dXJuIHREZXRhaWxzLmxvYWRpbmdQcm9taXNlID8/IFByb21pc2UucmVzb2x2ZSgpO1xuICB9XG5cbiAgY29uc3QgbERldGFpbHMgPSBnZXRMRGVmZXJCbG9ja0RldGFpbHMobFZpZXcsIHROb2RlKTtcbiAgY29uc3QgcHJpbWFyeUJsb2NrVE5vZGUgPSBnZXRQcmltYXJ5QmxvY2tUTm9kZSh0VmlldywgdERldGFpbHMpO1xuXG4gIC8vIFN3aXRjaCBmcm9tIE5PVF9TVEFSVEVEIC0+IElOX1BST0dSRVNTIHN0YXRlLlxuICB0RGV0YWlscy5sb2FkaW5nU3RhdGUgPSBEZWZlckRlcGVuZGVuY2llc0xvYWRpbmdTdGF0ZS5JTl9QUk9HUkVTUztcblxuICAvLyBQcmVmZXRjaGluZyBpcyB0cmlnZ2VyZWQsIGNsZWFudXAgYWxsIHJlZ2lzdGVyZWQgcHJlZmV0Y2ggdHJpZ2dlcnMuXG4gIGludm9rZVRyaWdnZXJDbGVhbnVwRm5zKFRyaWdnZXJUeXBlLlByZWZldGNoLCBsRGV0YWlscyk7XG5cbiAgbGV0IGRlcGVuZGVuY2llc0ZuID0gdERldGFpbHMuZGVwZW5kZW5jeVJlc29sdmVyRm47XG5cbiAgaWYgKG5nRGV2TW9kZSkge1xuICAgIC8vIENoZWNrIGlmIGRlcGVuZGVuY3kgZnVuY3Rpb24gaW50ZXJjZXB0b3IgaXMgY29uZmlndXJlZC5cbiAgICBjb25zdCBkZWZlckRlcGVuZGVuY3lJbnRlcmNlcHRvciA9IGluamVjdG9yLmdldChERUZFUl9CTE9DS19ERVBFTkRFTkNZX0lOVEVSQ0VQVE9SLCBudWxsLCB7XG4gICAgICBvcHRpb25hbDogdHJ1ZSxcbiAgICB9KTtcblxuICAgIGlmIChkZWZlckRlcGVuZGVuY3lJbnRlcmNlcHRvcikge1xuICAgICAgZGVwZW5kZW5jaWVzRm4gPSBkZWZlckRlcGVuZGVuY3lJbnRlcmNlcHRvci5pbnRlcmNlcHQoZGVwZW5kZW5jaWVzRm4pO1xuICAgIH1cbiAgfVxuXG4gIC8vIEluZGljYXRlIHRoYXQgYW4gYXBwbGljYXRpb24gaXMgbm90IHN0YWJsZSBhbmQgaGFzIGEgcGVuZGluZyB0YXNrLlxuICBjb25zdCBwZW5kaW5nVGFza3MgPSBpbmplY3Rvci5nZXQoUGVuZGluZ1Rhc2tzKTtcbiAgY29uc3QgdGFza0lkID0gcGVuZGluZ1Rhc2tzLmFkZCgpO1xuXG4gIC8vIFRoZSBgZGVwZW5kZW5jaWVzRm5gIG1pZ2h0IGJlIGBudWxsYCB3aGVuIGFsbCBkZXBlbmRlbmNpZXMgd2l0aGluXG4gIC8vIGEgZ2l2ZW4gZGVmZXIgYmxvY2sgd2VyZSBlYWdlcmx5IHJlZmVyZW5jZWQgZWxzZXdoZXJlIGluIGEgZmlsZSxcbiAgLy8gdGh1cyBubyBkeW5hbWljIGBpbXBvcnQoKWBzIHdlcmUgcHJvZHVjZWQuXG4gIGlmICghZGVwZW5kZW5jaWVzRm4pIHtcbiAgICB0RGV0YWlscy5sb2FkaW5nUHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZSgpLnRoZW4oKCkgPT4ge1xuICAgICAgdERldGFpbHMubG9hZGluZ1Byb21pc2UgPSBudWxsO1xuICAgICAgdERldGFpbHMubG9hZGluZ1N0YXRlID0gRGVmZXJEZXBlbmRlbmNpZXNMb2FkaW5nU3RhdGUuQ09NUExFVEU7XG4gICAgICBwZW5kaW5nVGFza3MucmVtb3ZlKHRhc2tJZCk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHREZXRhaWxzLmxvYWRpbmdQcm9taXNlO1xuICB9XG5cbiAgLy8gU3RhcnQgZG93bmxvYWRpbmcgb2YgZGVmZXIgYmxvY2sgZGVwZW5kZW5jaWVzLlxuICB0RGV0YWlscy5sb2FkaW5nUHJvbWlzZSA9IFByb21pc2UuYWxsU2V0dGxlZChkZXBlbmRlbmNpZXNGbigpKS50aGVuKChyZXN1bHRzKSA9PiB7XG4gICAgbGV0IGZhaWxlZCA9IGZhbHNlO1xuICAgIGNvbnN0IGRpcmVjdGl2ZURlZnM6IERpcmVjdGl2ZURlZkxpc3QgPSBbXTtcbiAgICBjb25zdCBwaXBlRGVmczogUGlwZURlZkxpc3QgPSBbXTtcblxuICAgIGZvciAoY29uc3QgcmVzdWx0IG9mIHJlc3VsdHMpIHtcbiAgICAgIGlmIChyZXN1bHQuc3RhdHVzID09PSAnZnVsZmlsbGVkJykge1xuICAgICAgICBjb25zdCBkZXBlbmRlbmN5ID0gcmVzdWx0LnZhbHVlO1xuICAgICAgICBjb25zdCBkaXJlY3RpdmVEZWYgPSBnZXRDb21wb25lbnREZWYoZGVwZW5kZW5jeSkgfHwgZ2V0RGlyZWN0aXZlRGVmKGRlcGVuZGVuY3kpO1xuICAgICAgICBpZiAoZGlyZWN0aXZlRGVmKSB7XG4gICAgICAgICAgZGlyZWN0aXZlRGVmcy5wdXNoKGRpcmVjdGl2ZURlZik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3QgcGlwZURlZiA9IGdldFBpcGVEZWYoZGVwZW5kZW5jeSk7XG4gICAgICAgICAgaWYgKHBpcGVEZWYpIHtcbiAgICAgICAgICAgIHBpcGVEZWZzLnB1c2gocGlwZURlZik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmYWlsZWQgPSB0cnVlO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBMb2FkaW5nIGlzIGNvbXBsZXRlZCwgd2Ugbm8gbG9uZ2VyIG5lZWQgdGhlIGxvYWRpbmcgUHJvbWlzZVxuICAgIC8vIGFuZCBhIHBlbmRpbmcgdGFzayBzaG91bGQgYWxzbyBiZSByZW1vdmVkLlxuICAgIHREZXRhaWxzLmxvYWRpbmdQcm9taXNlID0gbnVsbDtcbiAgICBwZW5kaW5nVGFza3MucmVtb3ZlKHRhc2tJZCk7XG5cbiAgICBpZiAoZmFpbGVkKSB7XG4gICAgICB0RGV0YWlscy5sb2FkaW5nU3RhdGUgPSBEZWZlckRlcGVuZGVuY2llc0xvYWRpbmdTdGF0ZS5GQUlMRUQ7XG5cbiAgICAgIGlmICh0RGV0YWlscy5lcnJvclRtcGxJbmRleCA9PT0gbnVsbCkge1xuICAgICAgICBjb25zdCB0ZW1wbGF0ZUxvY2F0aW9uID0gbmdEZXZNb2RlID8gZ2V0VGVtcGxhdGVMb2NhdGlvbkRldGFpbHMobFZpZXcpIDogJyc7XG4gICAgICAgIGNvbnN0IGVycm9yID0gbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgICBSdW50aW1lRXJyb3JDb2RlLkRFRkVSX0xPQURJTkdfRkFJTEVELFxuICAgICAgICAgIG5nRGV2TW9kZSAmJlxuICAgICAgICAgICAgJ0xvYWRpbmcgZGVwZW5kZW5jaWVzIGZvciBgQGRlZmVyYCBibG9jayBmYWlsZWQsICcgK1xuICAgICAgICAgICAgICBgYnV0IG5vIFxcYEBlcnJvclxcYCBibG9jayB3YXMgY29uZmlndXJlZCR7dGVtcGxhdGVMb2NhdGlvbn0uIGAgK1xuICAgICAgICAgICAgICAnQ29uc2lkZXIgdXNpbmcgdGhlIGBAZXJyb3JgIGJsb2NrIHRvIHJlbmRlciBhbiBlcnJvciBzdGF0ZS4nLFxuICAgICAgICApO1xuICAgICAgICBoYW5kbGVFcnJvcihsVmlldywgZXJyb3IpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0RGV0YWlscy5sb2FkaW5nU3RhdGUgPSBEZWZlckRlcGVuZGVuY2llc0xvYWRpbmdTdGF0ZS5DT01QTEVURTtcblxuICAgICAgLy8gVXBkYXRlIGRpcmVjdGl2ZSBhbmQgcGlwZSByZWdpc3RyaWVzIHRvIGFkZCBuZXdseSBkb3dubG9hZGVkIGRlcGVuZGVuY2llcy5cbiAgICAgIGNvbnN0IHByaW1hcnlCbG9ja1RWaWV3ID0gcHJpbWFyeUJsb2NrVE5vZGUudFZpZXchO1xuICAgICAgaWYgKGRpcmVjdGl2ZURlZnMubGVuZ3RoID4gMCkge1xuICAgICAgICBwcmltYXJ5QmxvY2tUVmlldy5kaXJlY3RpdmVSZWdpc3RyeSA9IGFkZERlcHNUb1JlZ2lzdHJ5PERpcmVjdGl2ZURlZkxpc3Q+KFxuICAgICAgICAgIHByaW1hcnlCbG9ja1RWaWV3LmRpcmVjdGl2ZVJlZ2lzdHJ5LFxuICAgICAgICAgIGRpcmVjdGl2ZURlZnMsXG4gICAgICAgICk7XG5cbiAgICAgICAgLy8gRXh0cmFjdCBwcm92aWRlcnMgZnJvbSBhbGwgTmdNb2R1bGVzIGltcG9ydGVkIGJ5IHN0YW5kYWxvbmUgY29tcG9uZW50c1xuICAgICAgICAvLyB1c2VkIHdpdGhpbiB0aGlzIGRlZmVyIGJsb2NrLlxuICAgICAgICBjb25zdCBkaXJlY3RpdmVUeXBlcyA9IGRpcmVjdGl2ZURlZnMubWFwKChkZWYpID0+IGRlZi50eXBlKTtcbiAgICAgICAgY29uc3QgcHJvdmlkZXJzID0gaW50ZXJuYWxJbXBvcnRQcm92aWRlcnNGcm9tKGZhbHNlLCAuLi5kaXJlY3RpdmVUeXBlcyk7XG4gICAgICAgIHREZXRhaWxzLnByb3ZpZGVycyA9IHByb3ZpZGVycztcbiAgICAgIH1cbiAgICAgIGlmIChwaXBlRGVmcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHByaW1hcnlCbG9ja1RWaWV3LnBpcGVSZWdpc3RyeSA9IGFkZERlcHNUb1JlZ2lzdHJ5PFBpcGVEZWZMaXN0PihcbiAgICAgICAgICBwcmltYXJ5QmxvY2tUVmlldy5waXBlUmVnaXN0cnksXG4gICAgICAgICAgcGlwZURlZnMsXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIHREZXRhaWxzLmxvYWRpbmdQcm9taXNlO1xufVxuXG4vKiogVXRpbGl0eSBmdW5jdGlvbiB0byByZW5kZXIgcGxhY2Vob2xkZXIgY29udGVudCAoaWYgcHJlc2VudCkgKi9cbmZ1bmN0aW9uIHJlbmRlclBsYWNlaG9sZGVyKGxWaWV3OiBMVmlldywgdE5vZGU6IFROb2RlKSB7XG4gIGNvbnN0IGxDb250YWluZXIgPSBsVmlld1t0Tm9kZS5pbmRleF07XG4gIG5nRGV2TW9kZSAmJiBhc3NlcnRMQ29udGFpbmVyKGxDb250YWluZXIpO1xuXG4gIHJlbmRlckRlZmVyQmxvY2tTdGF0ZShEZWZlckJsb2NrU3RhdGUuUGxhY2Vob2xkZXIsIHROb2RlLCBsQ29udGFpbmVyKTtcbn1cblxuLyoqXG4gKiBTdWJzY3JpYmVzIHRvIHRoZSBcImxvYWRpbmdcIiBQcm9taXNlIGFuZCByZW5kZXJzIGNvcnJlc3BvbmRpbmcgZGVmZXIgc3ViLWJsb2NrLFxuICogYmFzZWQgb24gdGhlIGxvYWRpbmcgcmVzdWx0cy5cbiAqXG4gKiBAcGFyYW0gbENvbnRhaW5lciBSZXByZXNlbnRzIGFuIGluc3RhbmNlIG9mIGEgZGVmZXIgYmxvY2suXG4gKiBAcGFyYW0gdE5vZGUgUmVwcmVzZW50cyBkZWZlciBibG9jayBpbmZvIHNoYXJlZCBhY3Jvc3MgYWxsIGluc3RhbmNlcy5cbiAqL1xuZnVuY3Rpb24gcmVuZGVyRGVmZXJTdGF0ZUFmdGVyUmVzb3VyY2VMb2FkaW5nKFxuICB0RGV0YWlsczogVERlZmVyQmxvY2tEZXRhaWxzLFxuICB0Tm9kZTogVE5vZGUsXG4gIGxDb250YWluZXI6IExDb250YWluZXIsXG4pIHtcbiAgbmdEZXZNb2RlICYmXG4gICAgYXNzZXJ0RGVmaW5lZCh0RGV0YWlscy5sb2FkaW5nUHJvbWlzZSwgJ0V4cGVjdGVkIGxvYWRpbmcgUHJvbWlzZSB0byBleGlzdCBvbiB0aGlzIGRlZmVyIGJsb2NrJyk7XG5cbiAgdERldGFpbHMubG9hZGluZ1Byb21pc2UhLnRoZW4oKCkgPT4ge1xuICAgIGlmICh0RGV0YWlscy5sb2FkaW5nU3RhdGUgPT09IERlZmVyRGVwZW5kZW5jaWVzTG9hZGluZ1N0YXRlLkNPTVBMRVRFKSB7XG4gICAgICBuZ0Rldk1vZGUgJiYgYXNzZXJ0RGVmZXJyZWREZXBlbmRlbmNpZXNMb2FkZWQodERldGFpbHMpO1xuXG4gICAgICAvLyBFdmVyeXRoaW5nIGlzIGxvYWRlZCwgc2hvdyB0aGUgcHJpbWFyeSBibG9jayBjb250ZW50XG4gICAgICByZW5kZXJEZWZlckJsb2NrU3RhdGUoRGVmZXJCbG9ja1N0YXRlLkNvbXBsZXRlLCB0Tm9kZSwgbENvbnRhaW5lcik7XG4gICAgfSBlbHNlIGlmICh0RGV0YWlscy5sb2FkaW5nU3RhdGUgPT09IERlZmVyRGVwZW5kZW5jaWVzTG9hZGluZ1N0YXRlLkZBSUxFRCkge1xuICAgICAgcmVuZGVyRGVmZXJCbG9ja1N0YXRlKERlZmVyQmxvY2tTdGF0ZS5FcnJvciwgdE5vZGUsIGxDb250YWluZXIpO1xuICAgIH1cbiAgfSk7XG59XG5cbi8qKlxuICogQXR0ZW1wdHMgdG8gdHJpZ2dlciBsb2FkaW5nIG9mIGRlZmVyIGJsb2NrIGRlcGVuZGVuY2llcy5cbiAqIElmIHRoZSBibG9jayBpcyBhbHJlYWR5IGluIGEgbG9hZGluZywgY29tcGxldGVkIG9yIGFuIGVycm9yIHN0YXRlIC1cbiAqIG5vIGFkZGl0aW9uYWwgYWN0aW9ucyBhcmUgdGFrZW4uXG4gKi9cbmZ1bmN0aW9uIHRyaWdnZXJEZWZlckJsb2NrKGxWaWV3OiBMVmlldywgdE5vZGU6IFROb2RlKSB7XG4gIGNvbnN0IHRWaWV3ID0gbFZpZXdbVFZJRVddO1xuICBjb25zdCBsQ29udGFpbmVyID0gbFZpZXdbdE5vZGUuaW5kZXhdO1xuICBjb25zdCBpbmplY3RvciA9IGxWaWV3W0lOSkVDVE9SXSE7XG4gIG5nRGV2TW9kZSAmJiBhc3NlcnRMQ29udGFpbmVyKGxDb250YWluZXIpO1xuXG4gIGlmICghc2hvdWxkVHJpZ2dlckRlZmVyQmxvY2soaW5qZWN0b3IpKSByZXR1cm47XG5cbiAgY29uc3QgbERldGFpbHMgPSBnZXRMRGVmZXJCbG9ja0RldGFpbHMobFZpZXcsIHROb2RlKTtcbiAgY29uc3QgdERldGFpbHMgPSBnZXRURGVmZXJCbG9ja0RldGFpbHModFZpZXcsIHROb2RlKTtcblxuICAvLyBEZWZlciBibG9jayBpcyB0cmlnZ2VyZWQsIGNsZWFudXAgYWxsIHJlZ2lzdGVyZWQgdHJpZ2dlciBmdW5jdGlvbnMuXG4gIGludm9rZUFsbFRyaWdnZXJDbGVhbnVwRm5zKGxEZXRhaWxzKTtcblxuICBzd2l0Y2ggKHREZXRhaWxzLmxvYWRpbmdTdGF0ZSkge1xuICAgIGNhc2UgRGVmZXJEZXBlbmRlbmNpZXNMb2FkaW5nU3RhdGUuTk9UX1NUQVJURUQ6XG4gICAgICByZW5kZXJEZWZlckJsb2NrU3RhdGUoRGVmZXJCbG9ja1N0YXRlLkxvYWRpbmcsIHROb2RlLCBsQ29udGFpbmVyKTtcbiAgICAgIHRyaWdnZXJSZXNvdXJjZUxvYWRpbmcodERldGFpbHMsIGxWaWV3LCB0Tm9kZSk7XG5cbiAgICAgIC8vIFRoZSBgbG9hZGluZ1N0YXRlYCBtaWdodCBoYXZlIGNoYW5nZWQgdG8gXCJsb2FkaW5nXCIuXG4gICAgICBpZiAoXG4gICAgICAgICh0RGV0YWlscy5sb2FkaW5nU3RhdGUgYXMgRGVmZXJEZXBlbmRlbmNpZXNMb2FkaW5nU3RhdGUpID09PVxuICAgICAgICBEZWZlckRlcGVuZGVuY2llc0xvYWRpbmdTdGF0ZS5JTl9QUk9HUkVTU1xuICAgICAgKSB7XG4gICAgICAgIHJlbmRlckRlZmVyU3RhdGVBZnRlclJlc291cmNlTG9hZGluZyh0RGV0YWlscywgdE5vZGUsIGxDb250YWluZXIpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSBEZWZlckRlcGVuZGVuY2llc0xvYWRpbmdTdGF0ZS5JTl9QUk9HUkVTUzpcbiAgICAgIHJlbmRlckRlZmVyQmxvY2tTdGF0ZShEZWZlckJsb2NrU3RhdGUuTG9hZGluZywgdE5vZGUsIGxDb250YWluZXIpO1xuICAgICAgcmVuZGVyRGVmZXJTdGF0ZUFmdGVyUmVzb3VyY2VMb2FkaW5nKHREZXRhaWxzLCB0Tm9kZSwgbENvbnRhaW5lcik7XG4gICAgICBicmVhaztcbiAgICBjYXNlIERlZmVyRGVwZW5kZW5jaWVzTG9hZGluZ1N0YXRlLkNPTVBMRVRFOlxuICAgICAgbmdEZXZNb2RlICYmIGFzc2VydERlZmVycmVkRGVwZW5kZW5jaWVzTG9hZGVkKHREZXRhaWxzKTtcbiAgICAgIHJlbmRlckRlZmVyQmxvY2tTdGF0ZShEZWZlckJsb2NrU3RhdGUuQ29tcGxldGUsIHROb2RlLCBsQ29udGFpbmVyKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgRGVmZXJEZXBlbmRlbmNpZXNMb2FkaW5nU3RhdGUuRkFJTEVEOlxuICAgICAgcmVuZGVyRGVmZXJCbG9ja1N0YXRlKERlZmVyQmxvY2tTdGF0ZS5FcnJvciwgdE5vZGUsIGxDb250YWluZXIpO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIGlmIChuZ0Rldk1vZGUpIHtcbiAgICAgICAgdGhyb3dFcnJvcignVW5rbm93biBkZWZlciBibG9jayBzdGF0ZScpO1xuICAgICAgfVxuICB9XG59XG4iXX0=