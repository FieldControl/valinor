/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { afterNextRender } from '../render3/after_render/hooks';
import { assertLContainer, assertLView } from '../render3/assert';
import { CONTAINER_HEADER_OFFSET } from '../render3/interfaces/container';
import { isDestroyed } from '../render3/interfaces/type_checks';
import { HEADER_OFFSET, INJECTOR } from '../render3/interfaces/view';
import { getNativeByIndex, removeLViewOnDestroy, storeLViewOnDestroy, walkUpViews, } from '../render3/util/view_utils';
import { assertElement, assertEqual } from '../util/assert';
import { NgZone } from '../zone';
import { storeTriggerCleanupFn } from './cleanup';
import { DEFER_BLOCK_STATE, DeferBlockInternalState, DeferBlockState, } from './interfaces';
import { getLDeferBlockDetails } from './utils';
/** Configuration object used to register passive and capturing events. */
const eventListenerOptions = {
    passive: true,
    capture: true,
};
/** Keeps track of the currently-registered `on hover` triggers. */
const hoverTriggers = new WeakMap();
/** Keeps track of the currently-registered `on interaction` triggers. */
const interactionTriggers = new WeakMap();
/** Currently-registered `viewport` triggers. */
const viewportTriggers = new WeakMap();
/** Names of the events considered as interaction events. */
const interactionEventNames = ['click', 'keydown'];
/** Names of the events considered as hover events. */
const hoverEventNames = ['mouseenter', 'focusin'];
/** `IntersectionObserver` used to observe `viewport` triggers. */
let intersectionObserver = null;
/** Number of elements currently observed with `viewport` triggers. */
let observedViewportElements = 0;
/** Object keeping track of registered callbacks for a deferred block trigger. */
class DeferEventEntry {
    constructor() {
        this.callbacks = new Set();
        this.listener = () => {
            for (const callback of this.callbacks) {
                callback();
            }
        };
    }
}
/**
 * Registers an interaction trigger.
 * @param trigger Element that is the trigger.
 * @param callback Callback to be invoked when the trigger is interacted with.
 */
export function onInteraction(trigger, callback) {
    let entry = interactionTriggers.get(trigger);
    // If this is the first entry for this element, add the listeners.
    if (!entry) {
        // Note that managing events centrally like this lends itself well to using global
        // event delegation. It currently does delegation at the element level, rather than the
        // document level, because:
        // 1. Global delegation is the most effective when there are a lot of events being registered
        // at the same time. Deferred blocks are unlikely to be used in such a way.
        // 2. Matching events to their target isn't free. For each `click` and `keydown` event we
        // would have look through all the triggers and check if the target either is the element
        // itself or it's contained within the element. Given that `click` and `keydown` are some
        // of the most common events, this may end up introducing a lot of runtime overhead.
        // 3. We're still registering only two events per element, no matter how many deferred blocks
        // are referencing it.
        entry = new DeferEventEntry();
        interactionTriggers.set(trigger, entry);
        for (const name of interactionEventNames) {
            trigger.addEventListener(name, entry.listener, eventListenerOptions);
        }
    }
    entry.callbacks.add(callback);
    return () => {
        const { callbacks, listener } = entry;
        callbacks.delete(callback);
        if (callbacks.size === 0) {
            interactionTriggers.delete(trigger);
            for (const name of interactionEventNames) {
                trigger.removeEventListener(name, listener, eventListenerOptions);
            }
        }
    };
}
/**
 * Registers a hover trigger.
 * @param trigger Element that is the trigger.
 * @param callback Callback to be invoked when the trigger is hovered over.
 */
export function onHover(trigger, callback) {
    let entry = hoverTriggers.get(trigger);
    // If this is the first entry for this element, add the listener.
    if (!entry) {
        entry = new DeferEventEntry();
        hoverTriggers.set(trigger, entry);
        for (const name of hoverEventNames) {
            trigger.addEventListener(name, entry.listener, eventListenerOptions);
        }
    }
    entry.callbacks.add(callback);
    return () => {
        const { callbacks, listener } = entry;
        callbacks.delete(callback);
        if (callbacks.size === 0) {
            for (const name of hoverEventNames) {
                trigger.removeEventListener(name, listener, eventListenerOptions);
            }
            hoverTriggers.delete(trigger);
        }
    };
}
/**
 * Registers a viewport trigger.
 * @param trigger Element that is the trigger.
 * @param callback Callback to be invoked when the trigger comes into the viewport.
 * @param injector Injector that can be used by the trigger to resolve DI tokens.
 */
export function onViewport(trigger, callback, injector) {
    const ngZone = injector.get(NgZone);
    let entry = viewportTriggers.get(trigger);
    intersectionObserver =
        intersectionObserver ||
            ngZone.runOutsideAngular(() => {
                return new IntersectionObserver((entries) => {
                    for (const current of entries) {
                        // Only invoke the callbacks if the specific element is intersecting.
                        if (current.isIntersecting && viewportTriggers.has(current.target)) {
                            ngZone.run(viewportTriggers.get(current.target).listener);
                        }
                    }
                });
            });
    if (!entry) {
        entry = new DeferEventEntry();
        ngZone.runOutsideAngular(() => intersectionObserver.observe(trigger));
        viewportTriggers.set(trigger, entry);
        observedViewportElements++;
    }
    entry.callbacks.add(callback);
    return () => {
        // It's possible that a different cleanup callback fully removed this element already.
        if (!viewportTriggers.has(trigger)) {
            return;
        }
        entry.callbacks.delete(callback);
        if (entry.callbacks.size === 0) {
            intersectionObserver?.unobserve(trigger);
            viewportTriggers.delete(trigger);
            observedViewportElements--;
        }
        if (observedViewportElements === 0) {
            intersectionObserver?.disconnect();
            intersectionObserver = null;
        }
    };
}
/**
 * Helper function to get the LView in which a deferred block's trigger is rendered.
 * @param deferredHostLView LView in which the deferred block is defined.
 * @param deferredTNode TNode defining the deferred block.
 * @param walkUpTimes Number of times to go up in the view hierarchy to find the trigger's view.
 *   A negative value means that the trigger is inside the block's placeholder, while an undefined
 *   value means that the trigger is in the same LView as the deferred block.
 */
export function getTriggerLView(deferredHostLView, deferredTNode, walkUpTimes) {
    // The trigger is in the same view, we don't need to traverse.
    if (walkUpTimes == null) {
        return deferredHostLView;
    }
    // A positive value or zero means that the trigger is in a parent view.
    if (walkUpTimes >= 0) {
        return walkUpViews(walkUpTimes, deferredHostLView);
    }
    // If the value is negative, it means that the trigger is inside the placeholder.
    const deferredContainer = deferredHostLView[deferredTNode.index];
    ngDevMode && assertLContainer(deferredContainer);
    const triggerLView = deferredContainer[CONTAINER_HEADER_OFFSET] ?? null;
    // We need to null check, because the placeholder might not have been rendered yet.
    if (ngDevMode && triggerLView !== null) {
        const lDetails = getLDeferBlockDetails(deferredHostLView, deferredTNode);
        const renderedState = lDetails[DEFER_BLOCK_STATE];
        assertEqual(renderedState, DeferBlockState.Placeholder, 'Expected a placeholder to be rendered in this defer block.');
        assertLView(triggerLView);
    }
    return triggerLView;
}
/**
 * Gets the element that a deferred block's trigger is pointing to.
 * @param triggerLView LView in which the trigger is defined.
 * @param triggerIndex Index at which the trigger element should've been rendered.
 */
export function getTriggerElement(triggerLView, triggerIndex) {
    const element = getNativeByIndex(HEADER_OFFSET + triggerIndex, triggerLView);
    ngDevMode && assertElement(element);
    return element;
}
/**
 * Registers a DOM-node based trigger.
 * @param initialLView LView in which the defer block is rendered.
 * @param tNode TNode representing the defer block.
 * @param triggerIndex Index at which to find the trigger element.
 * @param walkUpTimes Number of times to go up/down in the view hierarchy to find the trigger.
 * @param registerFn Function that will register the DOM events.
 * @param callback Callback to be invoked when the trigger receives the event that should render
 *     the deferred block.
 * @param type Trigger type to distinguish between regular and prefetch triggers.
 */
export function registerDomTrigger(initialLView, tNode, triggerIndex, walkUpTimes, registerFn, callback, type) {
    const injector = initialLView[INJECTOR];
    const zone = injector.get(NgZone);
    function pollDomTrigger() {
        // If the initial view was destroyed, we don't need to do anything.
        if (isDestroyed(initialLView)) {
            return;
        }
        const lDetails = getLDeferBlockDetails(initialLView, tNode);
        const renderedState = lDetails[DEFER_BLOCK_STATE];
        // If the block was loaded before the trigger was resolved, we don't need to do anything.
        if (renderedState !== DeferBlockInternalState.Initial &&
            renderedState !== DeferBlockState.Placeholder) {
            return;
        }
        const triggerLView = getTriggerLView(initialLView, tNode, walkUpTimes);
        // Keep polling until we resolve the trigger's LView.
        if (!triggerLView) {
            afterNextRender({ read: pollDomTrigger }, { injector });
            return;
        }
        // It's possible that the trigger's view was destroyed before we resolved the trigger element.
        if (isDestroyed(triggerLView)) {
            return;
        }
        const element = getTriggerElement(triggerLView, triggerIndex);
        const cleanup = registerFn(element, () => {
            // `pollDomTrigger` runs outside the zone (because of `afterNextRender`) and registers its
            // listeners outside the zone, so we jump back into the zone prior to running the callback.
            zone.run(() => {
                if (initialLView !== triggerLView) {
                    removeLViewOnDestroy(triggerLView, cleanup);
                }
                callback();
            });
        }, injector);
        // The trigger and deferred block might be in different LViews.
        // For the main LView the cleanup would happen as a part of
        // `storeTriggerCleanupFn` logic. For trigger LView we register
        // a cleanup function there to remove event handlers in case an
        // LView gets destroyed before a trigger is invoked.
        if (initialLView !== triggerLView) {
            storeLViewOnDestroy(triggerLView, cleanup);
        }
        storeTriggerCleanupFn(type, lDetails, cleanup);
    }
    // Begin polling for the trigger.
    afterNextRender({ read: pollDomTrigger }, { injector });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9tX3RyaWdnZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS9zcmMvZGVmZXIvZG9tX3RyaWdnZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSwrQkFBK0IsQ0FBQztBQUU5RCxPQUFPLEVBQUMsZ0JBQWdCLEVBQUUsV0FBVyxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDaEUsT0FBTyxFQUFDLHVCQUF1QixFQUFDLE1BQU0saUNBQWlDLENBQUM7QUFFeEUsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLG1DQUFtQyxDQUFDO0FBQzlELE9BQU8sRUFBQyxhQUFhLEVBQUUsUUFBUSxFQUFRLE1BQU0sNEJBQTRCLENBQUM7QUFDMUUsT0FBTyxFQUNMLGdCQUFnQixFQUNoQixvQkFBb0IsRUFDcEIsbUJBQW1CLEVBQ25CLFdBQVcsR0FDWixNQUFNLDRCQUE0QixDQUFDO0FBQ3BDLE9BQU8sRUFBQyxhQUFhLEVBQUUsV0FBVyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDMUQsT0FBTyxFQUFDLE1BQU0sRUFBQyxNQUFNLFNBQVMsQ0FBQztBQUMvQixPQUFPLEVBQUMscUJBQXFCLEVBQUMsTUFBTSxXQUFXLENBQUM7QUFFaEQsT0FBTyxFQUNMLGlCQUFpQixFQUNqQix1QkFBdUIsRUFDdkIsZUFBZSxHQUVoQixNQUFNLGNBQWMsQ0FBQztBQUN0QixPQUFPLEVBQUMscUJBQXFCLEVBQUMsTUFBTSxTQUFTLENBQUM7QUFFOUMsMEVBQTBFO0FBQzFFLE1BQU0sb0JBQW9CLEdBQTRCO0lBQ3BELE9BQU8sRUFBRSxJQUFJO0lBQ2IsT0FBTyxFQUFFLElBQUk7Q0FDZCxDQUFDO0FBRUYsbUVBQW1FO0FBQ25FLE1BQU0sYUFBYSxHQUFHLElBQUksT0FBTyxFQUE0QixDQUFDO0FBRTlELHlFQUF5RTtBQUN6RSxNQUFN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TUFBTSxPQUFPLEdBQUcsVUFBVSxDQUN4QixPQUFPLEVBQ1AsR0FBRyxFQUFFO1lBQ0gsMEZBQTBGO1lBQzFGLDJGQUEyRjtZQUMzRixJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRTtnQkFDWixJQUFJLFlBQVksS0FBSyxZQUFZLEVBQUUsQ0FBQztvQkFDbEMsb0JBQW9CLENBQUMsWUFBWSxFQUFFLE9BQU8sQ0FBQyxDQUFDO2dCQUM5QyxDQUFDO2dCQUNELFFBQVEsRUFBRSxDQUFDO1lBQ2IsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDLEVBQ0QsUUFBUSxDQUNULENBQUM7UUFFRiwrREFBK0Q7UUFDL0QsMkRBQTJEO1FBQzNELCtEQUErRDtRQUMvRCwrREFBK0Q7UUFDL0Qsb0RBQW9EO1FBQ3BELElBQUksWUFBWSxLQUFLLFlBQVksRUFBRSxDQUFDO1lBQ2xDLG1CQUFtQixDQUFDLFlBQVksRUFBRSxPQUFPLENBQUMsQ0FBQztRQUM3QyxDQUFDO1FBRUQscUJBQXFCLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNqRCxDQUFDO0lBRUQsaUNBQWlDO0lBQ2pDLGVBQWUsQ0FBQyxFQUFDLElBQUksRUFBRSxjQUFjLEVBQUMsRUFBRSxFQUFDLFFBQVEsRUFBQyxDQUFDLENBQUM7QUFDdEQsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qIVxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHthZnRlck5leHRSZW5kZXJ9IGZyb20gJy4uL3JlbmRlcjMvYWZ0ZXJfcmVuZGVyL2hvb2tzJztcbmltcG9ydCB0eXBlIHtJbmplY3Rvcn0gZnJvbSAnLi4vZGknO1xuaW1wb3J0IHthc3NlcnRMQ29udGFpbmVyLCBhc3NlcnRMVmlld30gZnJvbSAnLi4vcmVuZGVyMy9hc3NlcnQnO1xuaW1wb3J0IHtDT05UQUlORVJfSEVBREVSX09GRlNFVH0gZnJvbSAnLi4vcmVuZGVyMy9pbnRlcmZhY2VzL2NvbnRhaW5lcic7XG5pbXBvcnQge1ROb2RlfSBmcm9tICcuLi9yZW5kZXIzL2ludGVyZmFjZXMvbm9kZSc7XG5pbXBvcnQge2lzRGVzdHJveWVkfSBmcm9tICcuLi9yZW5kZXIzL2ludGVyZmFjZXMvdHlwZV9jaGVja3MnO1xuaW1wb3J0IHtIRUFERVJfT0ZGU0VULCBJTkpFQ1RPUiwgTFZpZXd9IGZyb20gJy4uL3JlbmRlcjMvaW50ZXJmYWNlcy92aWV3JztcbmltcG9ydCB7XG4gIGdldE5hdGl2ZUJ5SW5kZXgsXG4gIHJlbW92ZUxWaWV3T25EZXN0cm95LFxuICBzdG9yZUxWaWV3T25EZXN0cm95LFxuICB3YWxrVXBWaWV3cyxcbn0gZnJvbSAnLi4vcmVuZGVyMy91dGlsL3ZpZXdfdXRpbHMnO1xuaW1wb3J0IHthc3NlcnRFbGVtZW50LCBhc3NlcnRFcXVhbH0gZnJvbSAnLi4vdXRpbC9hc3NlcnQnO1xuaW1wb3J0IHtOZ1pvbmV9IGZyb20gJy4uL3pvbmUnO1xuaW1wb3J0IHtzdG9yZVRyaWdnZXJDbGVhbnVwRm59IGZyb20gJy4vY2xlYW51cCc7XG5cbmltcG9ydCB7XG4gIERFRkVSX0JMT0NLX1NUQVRFLFxuICBEZWZlckJsb2NrSW50ZXJuYWxTdGF0ZSxcbiAgRGVmZXJCbG9ja1N0YXRlLFxuICBUcmlnZ2VyVHlwZSxcbn0gZnJvbSAnLi9pbnRlcmZhY2VzJztcbmltcG9ydCB7Z2V0TERlZmVyQmxvY2tEZXRhaWxzfSBmcm9tICcuL3V0aWxzJztcblxuLyoqIENvbmZpZ3VyYXRpb24gb2JqZWN0IHVzZWQgdG8gcmVnaXN0ZXIgcGFzc2l2ZSBhbmQgY2FwdHVyaW5nIGV2ZW50cy4gKi9cbmNvbnN0IGV2ZW50TGlzdGVuZXJPcHRpb25zOiBBZGRFdmVudExpc3RlbmVyT3B0aW9ucyA9IHtcbiAgcGFzc2l2ZTogdHJ1ZSxcbiAgY2FwdHVyZTogdHJ1ZSxcbn07XG5cbi8qKiBLZWVwcyB0cmFjayBvZiB0aGUgY3VycmVudGx5LXJlZ2lzdGVyZWQgYG9uIGhvdmVyYCB0cmlnZ2Vycy4gKi9cbmNvbnN0IGhvdmVyVHJpZ2dlcnMgPSBuZXcgV2Vha01hcDxFbGVtZW50LCBEZWZlckV2ZW50RW50cnk+KCk7XG5cbi8qKiBLZWVwcyB0cmFjayBvZiB0aGUgY3VycmVudGx5LXJlZ2lzdGVyZWQgYG9uIGludGVyYWN0aW9uYCB0cmlnZ2Vycy4gKi9cbmNvbnN0IGludGVyYWN0aW9uVHJpZ2dlcnMgPSBuZXcgV2Vha01hcDxFbGVtZW50LCBEZWZlckV2ZW50RW50cnk+KCk7XG5cbi8qKiBDdXJyZW50bHktcmVnaXN0ZXJlZCBgdmlld3BvcnRgIHRyaWdnZXJzLiAqL1xuY29uc3Qgdmlld3BvcnRUcmlnZ2VycyA9IG5ldyBXZWFrTWFwPEVsZW1lbnQsIERlZmVyRXZlbnRFbnRyeT4oKTtcblxuLyoqIE5hbWVzIG9mIHRoZSBldmVudHMgY29uc2lkZXJlZCBhcyBpbnRlcmFjdGlvbiBldmVudHMuICovXG5jb25zdCBpbnRlcmFjdGlvbkV2ZW50TmFtZXMgPSBbJ2NsaWNrJywgJ2tleWRvd24nXSBhcyBjb25zdDtcblxuLyoqIE5hbWVzIG9mIHRoZSBldmVudHMgY29uc2lkZXJlZCBhcyBob3ZlciBldmVudHMuICovXG5jb25zdCBob3ZlckV2ZW50TmFtZXMgPSBbJ21vdXNlZW50ZXInLCAnZm9jdXNpbiddIGFzIGNvbnN0O1xuXG4vKiogYEludGVyc2VjdGlvbk9ic2VydmVyYCB1c2VkIHRvIG9ic2VydmUgYHZpZXdwb3J0YCB0cmlnZ2Vycy4gKi9cbmxldCBpbnRlcnNlY3Rpb25PYnNlcnZlcjogSW50ZXJzZWN0aW9uT2JzZXJ2ZXIgfCBudWxsID0gbnVsbDtcblxuLyoqIE51bWJlciBvZiBlbGVtZW50cyBjdXJyZW50bHkgb2JzZXJ2ZWQgd2l0aCBgdmlld3BvcnRgIHRyaWdnZXJzLiAqL1xubGV0IG9ic2VydmVkVmlld3BvcnRFbGVtZW50cyA9IDA7XG5cbi8qKiBPYmplY3Qga2VlcGluZyB0cmFjayBvZiByZWdpc3RlcmVkIGNhbGxiYWNrcyBmb3IgYSBkZWZlcnJlZCBibG9jayB0cmlnZ2VyLiAqL1xuY2xhc3MgRGVmZXJFdmVudEVudHJ5IHtcbiAgY2FsbGJhY2tzID0gbmV3IFNldDxWb2lkRnVuY3Rpb24+KCk7XG5cbiAgbGlzdGVuZXIgPSAoKSA9PiB7XG4gICAgZm9yIChjb25zdCBjYWxsYmFjayBvZiB0aGlzLmNhbGxiYWNrcykge1xuICAgICAgY2FsbGJhY2soKTtcbiAgICB9XG4gIH07XG59XG5cbi8qKlxuICogUmVnaXN0ZXJzIGFuIGludGVyYWN0aW9uIHRyaWdnZXIuXG4gKiBAcGFyYW0gdHJpZ2dlciBFbGVtZW50IHRoYXQgaXMgdGhlIHRyaWdnZXIuXG4gKiBAcGFyYW0gY2FsbGJhY2sgQ2FsbGJhY2sgdG8gYmUgaW52b2tlZCB3aGVuIHRoZSB0cmlnZ2VyIGlzIGludGVyYWN0ZWQgd2l0aC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG9uSW50ZXJhY3Rpb24odHJpZ2dlcjogRWxlbWVudCwgY2FsbGJhY2s6IFZvaWRGdW5jdGlvbik6IFZvaWRGdW5jdGlvbiB7XG4gIGxldCBlbnRyeSA9IGludGVyYWN0aW9uVHJpZ2dlcnMuZ2V0KHRyaWdnZXIpO1xuXG4gIC8vIElmIHRoaXMgaXMgdGhlIGZpcnN0IGVudHJ5IGZvciB0aGlzIGVsZW1lbnQsIGFkZCB0aGUgbGlzdGVuZXJzLlxuICBpZiAoIWVudHJ5KSB7XG4gICAgLy8gTm90ZSB0aGF0IG1hbmFnaW5nIGV2ZW50cyBjZW50cmFsbHkgbGlrZSB0aGlzIGxlbmRzIGl0c2VsZiB3ZWxsIHRvIHVzaW5nIGdsb2JhbFxuICAgIC8vIGV2ZW50IGRlbGVnYXRpb24uIEl0IGN1cnJlbnRseSBkb2VzIGRlbGVnYXRpb24gYXQgdGhlIGVsZW1lbnQgbGV2ZWwsIHJhdGhlciB0aGFuIHRoZVxuICAgIC8vIGRvY3VtZW50IGxldmVsLCBiZWNhdXNlOlxuICAgIC8vIDEuIEdsb2JhbCBkZWxlZ2F0aW9uIGlzIHRoZSBtb3N0IGVmZmVjdGl2ZSB3aGVuIHRoZXJlIGFyZSBhIGxvdCBvZiBldmVudHMgYmVpbmcgcmVnaXN0ZXJlZFxuICAgIC8vIGF0IHRoZSBzYW1lIHRpbWUuIERlZmVycmVkIGJsb2NrcyBhcmUgdW5saWtlbHkgdG8gYmUgdXNlZCBpbiBzdWNoIGEgd2F5LlxuICAgIC8vIDIuIE1hdGNoaW5nIGV2ZW50cyB0byB0aGVpciB0YXJnZXQgaXNuJ3QgZnJlZS4gRm9yIGVhY2ggYGNsaWNrYCBhbmQgYGtleWRvd25gIGV2ZW50IHdlXG4gICAgLy8gd291bGQgaGF2ZSBsb29rIHRocm91Z2ggYWxsIHRoZSB0cmlnZ2VycyBhbmQgY2hlY2sgaWYgdGhlIHRhcmdldCBlaXRoZXIgaXMgdGhlIGVsZW1lbnRcbiAgICAvLyBpdHNlbGYgb3IgaXQncyBjb250YWluZWQgd2l0aGluIHRoZSBlbGVtZW50LiBHaXZlbiB0aGF0IGBjbGlja2AgYW5kIGBrZXlkb3duYCBhcmUgc29tZVxuICAgIC8vIG9mIHRoZSBtb3N0IGNvbW1vbiBldmVudHMsIHRoaXMgbWF5IGVuZCB1cCBpbnRyb2R1Y2luZyBhIGxvdCBvZiBydW50aW1lIG92ZXJoZWFkLlxuICAgIC8vIDMuIFdlJ3JlIHN0aWxsIHJlZ2lzdGVyaW5nIG9ubHkgdHdvIGV2ZW50cyBwZXIgZWxlbWVudCwgbm8gbWF0dGVyIGhvdyBtYW55IGRlZmVycmVkIGJsb2Nrc1xuICAgIC8vIGFyZSByZWZlcmVuY2luZyBpdC5cbiAgICBlbnRyeSA9IG5ldyBEZWZlckV2ZW50RW50cnkoKTtcbiAgICBpbnRlcmFjdGlvblRyaWdnZXJzLnNldCh0cmlnZ2VyLCBlbnRyeSk7XG5cbiAgICBmb3IgKGNvbnN0IG5hbWUgb2YgaW50ZXJhY3Rpb25FdmVudE5hbWVzKSB7XG4gICAgICB0cmlnZ2VyLmFkZEV2ZW50TGlzdGVuZXIobmFtZSwgZW50cnkhLmxpc3RlbmVyLCBldmVudExpc3RlbmVyT3B0aW9ucyk7XG4gICAgfVxuICB9XG5cbiAgZW50cnkuY2FsbGJhY2tzLmFkZChjYWxsYmFjayk7XG5cbiAgcmV0dXJuICgpID0+IHtcbiAgICBjb25zdCB7Y2FsbGJhY2tzLCBsaXN0ZW5lcn0gPSBlbnRyeSE7XG4gICAgY2FsbGJhY2tzLmRlbGV0ZShjYWxsYmFjayk7XG5cbiAgICBpZiAoY2FsbGJhY2tzLnNpemUgPT09IDApIHtcbiAgICAgIGludGVyYWN0aW9uVHJpZ2dlcnMuZGVsZXRlKHRyaWdnZXIpO1xuXG4gICAgICBmb3IgKGNvbnN0IG5hbWUgb2YgaW50ZXJhY3Rpb25FdmVudE5hbWVzKSB7XG4gICAgICAgIHRyaWdnZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcihuYW1lLCBsaXN0ZW5lciwgZXZlbnRMaXN0ZW5lck9wdGlvbnMpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbn1cblxuLyoqXG4gKiBSZWdpc3RlcnMgYSBob3ZlciB0cmlnZ2VyLlxuICogQHBhcmFtIHRyaWdnZXIgRWxlbWVudCB0aGF0IGlzIHRoZSB0cmlnZ2VyLlxuICogQHBhcmFtIGNhbGxiYWNrIENhbGxiYWNrIHRvIGJlIGludm9rZWQgd2hlbiB0aGUgdHJpZ2dlciBpcyBob3ZlcmVkIG92ZXIuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBvbkhvdmVyKHRyaWdnZXI6IEVsZW1lbnQsIGNhbGxiYWNrOiBWb2lkRnVuY3Rpb24pOiBWb2lkRnVuY3Rpb24ge1xuICBsZXQgZW50cnkgPSBob3ZlclRyaWdnZXJzLmdldCh0cmlnZ2VyKTtcblxuICAvLyBJZiB0aGlzIGlzIHRoZSBmaXJzdCBlbnRyeSBmb3IgdGhpcyBlbGVtZW50LCBhZGQgdGhlIGxpc3RlbmVyLlxuICBpZiAoIWVudHJ5KSB7XG4gICAgZW50cnkgPSBuZXcgRGVmZXJFdmVudEVudHJ5KCk7XG4gICAgaG92ZXJUcmlnZ2Vycy5zZXQodHJpZ2dlciwgZW50cnkpO1xuXG4gICAgZm9yIChjb25zdCBuYW1lIG9mIGhvdmVyRXZlbnROYW1lcykge1xuICAgICAgdHJpZ2dlci5hZGRFdmVudExpc3RlbmVyKG5hbWUsIGVudHJ5IS5saXN0ZW5lciwgZXZlbnRMaXN0ZW5lck9wdGlvbnMpO1xuICAgIH1cbiAgfVxuXG4gIGVudHJ5LmNhbGxiYWNrcy5hZGQoY2FsbGJhY2spO1xuXG4gIHJldHVybiAoKSA9PiB7XG4gICAgY29uc3Qge2NhbGxiYWNrcywgbGlzdGVuZXJ9ID0gZW50cnkhO1xuICAgIGNhbGxiYWNrcy5kZWxldGUoY2FsbGJhY2spO1xuXG4gICAgaWYgKGNhbGxiYWNrcy5zaXplID09PSAwKSB7XG4gICAgICBmb3IgKGNvbnN0IG5hbWUgb2YgaG92ZXJFdmVudE5hbWVzKSB7XG4gICAgICAgIHRyaWdnZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcihuYW1lLCBsaXN0ZW5lciwgZXZlbnRMaXN0ZW5lck9wdGlvbnMpO1xuICAgICAgfVxuICAgICAgaG92ZXJUcmlnZ2Vycy5kZWxldGUodHJpZ2dlcik7XG4gICAgfVxuICB9O1xufVxuXG4vKipcbiAqIFJlZ2lzdGVycyBhIHZpZXdwb3J0IHRyaWdnZXIuXG4gKiBAcGFyYW0gdHJpZ2dlciBFbGVtZW50IHRoYXQgaXMgdGhlIHRyaWdnZXIuXG4gKiBAcGFyYW0gY2FsbGJhY2sgQ2FsbGJhY2sgdG8gYmUgaW52b2tlZCB3aGVuIHRoZSB0cmlnZ2VyIGNvbWVzIGludG8gdGhlIHZpZXdwb3J0LlxuICogQHBhcmFtIGluamVjdG9yIEluamVjdG9yIHRoYXQgY2FuIGJlIHVzZWQgYnkgdGhlIHRyaWdnZXIgdG8gcmVzb2x2ZSBESSB0b2tlbnMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBvblZpZXdwb3J0KFxuICB0cmlnZ2VyOiBFbGVtZW50LFxuICBjYWxsYmFjazogVm9pZEZ1bmN0aW9uLFxuICBpbmplY3RvcjogSW5qZWN0b3IsXG4pOiBWb2lkRnVuY3Rpb24ge1xuICBjb25zdCBuZ1pvbmUgPSBpbmplY3Rvci5nZXQoTmdab25lKTtcbiAgbGV0IGVudHJ5ID0gdmlld3BvcnRUcmlnZ2Vycy5nZXQodHJpZ2dlcik7XG5cbiAgaW50ZXJzZWN0aW9uT2JzZXJ2ZXIgPVxuICAgIGludGVyc2VjdGlvbk9ic2VydmVyIHx8XG4gICAgbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgIHJldHVybiBuZXcgSW50ZXJzZWN0aW9uT2JzZXJ2ZXIoKGVudHJpZXMpID0+IHtcbiAgICAgICAgZm9yIChjb25zdCBjdXJyZW50IG9mIGVudHJpZXMpIHtcbiAgICAgICAgICAvLyBPbmx5IGludm9rZSB0aGUgY2FsbGJhY2tzIGlmIHRoZSBzcGVjaWZpYyBlbGVtZW50IGlzIGludGVyc2VjdGluZy5cbiAgICAgICAgICBpZiAoY3VycmVudC5pc0ludGVyc2VjdGluZyAmJiB2aWV3cG9ydFRyaWdnZXJzLmhhcyhjdXJyZW50LnRhcmdldCkpIHtcbiAgICAgICAgICAgIG5nWm9uZS5ydW4odmlld3BvcnRUcmlnZ2Vycy5nZXQoY3VycmVudC50YXJnZXQpIS5saXN0ZW5lcik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcblxuICBpZiAoIWVudHJ5KSB7XG4gICAgZW50cnkgPSBuZXcgRGVmZXJFdmVudEVudHJ5KCk7XG4gICAgbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IGludGVyc2VjdGlvbk9ic2VydmVyIS5vYnNlcnZlKHRyaWdnZXIpKTtcbiAgICB2aWV3cG9ydFRyaWdnZXJzLnNldCh0cmlnZ2VyLCBlbnRyeSk7XG4gICAgb2JzZXJ2ZWRWaWV3cG9ydEVsZW1lbnRzKys7XG4gIH1cblxuICBlbnRyeS5jYWxsYmFja3MuYWRkKGNhbGxiYWNrKTtcblxuICByZXR1cm4gKCkgPT4ge1xuICAgIC8vIEl0J3MgcG9zc2libGUgdGhhdCBhIGRpZmZlcmVudCBjbGVhbnVwIGNhbGxiYWNrIGZ1bGx5IHJlbW92ZWQgdGhpcyBlbGVtZW50IGFscmVhZHkuXG4gICAgaWYgKCF2aWV3cG9ydFRyaWdnZXJzLmhhcyh0cmlnZ2VyKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGVudHJ5IS5jYWxsYmFja3MuZGVsZXRlKGNhbGxiYWNrKTtcblxuICAgIGlmIChlbnRyeSEuY2FsbGJhY2tzLnNpemUgPT09IDApIHtcbiAgICAgIGludGVyc2VjdGlvbk9ic2VydmVyPy51bm9ic2VydmUodHJpZ2dlcik7XG4gICAgICB2aWV3cG9ydFRyaWdnZXJzLmRlbGV0ZSh0cmlnZ2VyKTtcbiAgICAgIG9ic2VydmVkVmlld3BvcnRFbGVtZW50cy0tO1xuICAgIH1cblxuICAgIGlmIChvYnNlcnZlZFZpZXdwb3J0RWxlbWVudHMgPT09IDApIHtcbiAgICAgIGludGVyc2VjdGlvbk9ic2VydmVyPy5kaXNjb25uZWN0KCk7XG4gICAgICBpbnRlcnNlY3Rpb25PYnNlcnZlciA9IG51bGw7XG4gICAgfVxuICB9O1xufVxuXG4vKipcbiAqIEhlbHBlciBmdW5jdGlvbiB0byBnZXQgdGhlIExWaWV3IGluIHdoaWNoIGEgZGVmZXJyZWQgYmxvY2sncyB0cmlnZ2VyIGlzIHJlbmRlcmVkLlxuICogQHBhcmFtIGRlZmVycmVkSG9zdExWaWV3IExWaWV3IGluIHdoaWNoIHRoZSBkZWZlcnJlZCBibG9jayBpcyBkZWZpbmVkLlxuICogQHBhcmFtIGRlZmVycmVkVE5vZGUgVE5vZGUgZGVmaW5pbmcgdGhlIGRlZmVycmVkIGJsb2NrLlxuICogQHBhcmFtIHdhbGtVcFRpbWVzIE51bWJlciBvZiB0aW1lcyB0byBnbyB1cCBpbiB0aGUgdmlldyBoaWVyYXJjaHkgdG8gZmluZCB0aGUgdHJpZ2dlcidzIHZpZXcuXG4gKiAgIEEgbmVnYXRpdmUgdmFsdWUgbWVhbnMgdGhhdCB0aGUgdHJpZ2dlciBpcyBpbnNpZGUgdGhlIGJsb2NrJ3MgcGxhY2Vob2xkZXIsIHdoaWxlIGFuIHVuZGVmaW5lZFxuICogICB2YWx1ZSBtZWFucyB0aGF0IHRoZSB0cmlnZ2VyIGlzIGluIHRoZSBzYW1lIExWaWV3IGFzIHRoZSBkZWZlcnJlZCBibG9jay5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFRyaWdnZXJMVmlldyhcbiAgZGVmZXJyZWRIb3N0TFZpZXc6IExWaWV3LFxuICBkZWZlcnJlZFROb2RlOiBUTm9kZSxcbiAgd2Fsa1VwVGltZXM6IG51bWJlciB8IHVuZGVmaW5lZCxcbik6IExWaWV3IHwgbnVsbCB7XG4gIC8vIFRoZSB0cmlnZ2VyIGlzIGluIHRoZSBzYW1lIHZpZXcsIHdlIGRvbid0IG5lZWQgdG8gdHJhdmVyc2UuXG4gIGlmICh3YWxrVXBUaW1lcyA9PSBudWxsKSB7XG4gICAgcmV0dXJuIGRlZmVycmVkSG9zdExWaWV3O1xuICB9XG5cbiAgLy8gQSBwb3NpdGl2ZSB2YWx1ZSBvciB6ZXJvIG1lYW5zIHRoYXQgdGhlIHRyaWdnZXIgaXMgaW4gYSBwYXJlbnQgdmlldy5cbiAgaWYgKHdhbGtVcFRpbWVzID49IDApIHtcbiAgICByZXR1cm4gd2Fsa1VwVmlld3Mod2Fsa1VwVGltZXMsIGRlZmVycmVkSG9zdExWaWV3KTtcbiAgfVxuXG4gIC8vIElmIHRoZSB2YWx1ZSBpcyBuZWdhdGl2ZSwgaXQgbWVhbnMgdGhhdCB0aGUgdHJpZ2dlciBpcyBpbnNpZGUgdGhlIHBsYWNlaG9sZGVyLlxuICBjb25zdCBkZWZlcnJlZENvbnRhaW5lciA9IGRlZmVycmVkSG9zdExWaWV3W2RlZmVycmVkVE5vZGUuaW5kZXhdO1xuICBuZ0Rldk1vZGUgJiYgYXNzZXJ0TENvbnRhaW5lcihkZWZlcnJlZENvbnRhaW5lcik7XG4gIGNvbnN0IHRyaWdnZXJMVmlldyA9IGRlZmVycmVkQ29udGFpbmVyW0NPTlRBSU5FUl9IRUFERVJfT0ZGU0VUXSA/PyBudWxsO1xuXG4gIC8vIFdlIG5lZWQgdG8gbnVsbCBjaGVjaywgYmVjYXVzZSB0aGUgcGxhY2Vob2xkZXIgbWlnaHQgbm90IGhhdmUgYmVlbiByZW5kZXJlZCB5ZXQuXG4gIGlmIChuZ0Rldk1vZGUgJiYgdHJpZ2dlckxWaWV3ICE9PSBudWxsKSB7XG4gICAgY29uc3QgbERldGFpbHMgPSBnZXRMRGVmZXJCbG9ja0RldGFpbHMoZGVmZXJyZWRIb3N0TFZpZXcsIGRlZmVycmVkVE5vZGUpO1xuICAgIGNvbnN0IHJlbmRlcmVkU3RhdGUgPSBsRGV0YWlsc1tERUZFUl9CTE9DS19TVEFURV07XG4gICAgYXNzZXJ0RXF1YWwoXG4gICAgICByZW5kZXJlZFN0YXRlLFxuICAgICAgRGVmZXJCbG9ja1N0YXRlLlBsYWNlaG9sZGVyLFxuICAgICAgJ0V4cGVjdGVkIGEgcGxhY2Vob2xkZXIgdG8gYmUgcmVuZGVyZWQgaW4gdGhpcyBkZWZlciBibG9jay4nLFxuICAgICk7XG4gICAgYXNzZXJ0TFZpZXcodHJpZ2dlckxWaWV3KTtcbiAgfVxuXG4gIHJldHVybiB0cmlnZ2VyTFZpZXc7XG59XG5cbi8qKlxuICogR2V0cyB0aGUgZWxlbWVudCB0aGF0IGEgZGVmZXJyZWQgYmxvY2sncyB0cmlnZ2VyIGlzIHBvaW50aW5nIHRvLlxuICogQHBhcmFtIHRyaWdnZXJMVmlldyBMVmlldyBpbiB3aGljaCB0aGUgdHJpZ2dlciBpcyBkZWZpbmVkLlxuICogQHBhcmFtIHRyaWdnZXJJbmRleCBJbmRleCBhdCB3aGljaCB0aGUgdHJpZ2dlciBlbGVtZW50IHNob3VsZCd2ZSBiZWVuIHJlbmRlcmVkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0VHJpZ2dlckVsZW1lbnQodHJpZ2dlckxWaWV3OiBMVmlldywgdHJpZ2dlckluZGV4OiBudW1iZXIpOiBFbGVtZW50IHtcbiAgY29uc3QgZWxlbWVudCA9IGdldE5hdGl2ZUJ5SW5kZXgoSEVBREVSX09GRlNFVCArIHRyaWdnZXJJbmRleCwgdHJpZ2dlckxWaWV3KTtcbiAgbmdEZXZNb2RlICYmIGFzc2VydEVsZW1lbnQoZWxlbWVudCk7XG4gIHJldHVybiBlbGVtZW50IGFzIEVsZW1lbnQ7XG59XG5cbi8qKlxuICogUmVnaXN0ZXJzIGEgRE9NLW5vZGUgYmFzZWQgdHJpZ2dlci5cbiAqIEBwYXJhbSBpbml0aWFsTFZpZXcgTFZpZXcgaW4gd2hpY2ggdGhlIGRlZmVyIGJsb2NrIGlzIHJlbmRlcmVkLlxuICogQHBhcmFtIHROb2RlIFROb2RlIHJlcHJlc2VudGluZyB0aGUgZGVmZXIgYmxvY2suXG4gKiBAcGFyYW0gdHJpZ2dlckluZGV4IEluZGV4IGF0IHdoaWNoIHRvIGZpbmQgdGhlIHRyaWdnZXIgZWxlbWVudC5cbiAqIEBwYXJhbSB3YWxrVXBUaW1lcyBOdW1iZXIgb2YgdGltZXMgdG8gZ28gdXAvZG93biBpbiB0aGUgdmlldyBoaWVyYXJjaHkgdG8gZmluZCB0aGUgdHJpZ2dlci5cbiAqIEBwYXJhbSByZWdpc3RlckZuIEZ1bmN0aW9uIHRoYXQgd2lsbCByZWdpc3RlciB0aGUgRE9NIGV2ZW50cy5cbiAqIEBwYXJhbSBjYWxsYmFjayBDYWxsYmFjayB0byBiZSBpbnZva2VkIHdoZW4gdGhlIHRyaWdnZXIgcmVjZWl2ZXMgdGhlIGV2ZW50IHRoYXQgc2hvdWxkIHJlbmRlclxuICogICAgIHRoZSBkZWZlcnJlZCBibG9jay5cbiAqIEBwYXJhbSB0eXBlIFRyaWdnZXIgdHlwZSB0byBkaXN0aW5ndWlzaCBiZXR3ZWVuIHJlZ3VsYXIgYW5kIHByZWZldGNoIHRyaWdnZXJzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJEb21UcmlnZ2VyKFxuICBpbml0aWFsTFZpZXc6IExWaWV3LFxuICB0Tm9kZTogVE5vZGUsXG4gIHRyaWdnZXJJbmRleDogbnVtYmVyLFxuICB3YWxrVXBUaW1lczogbnVtYmVyIHwgdW5kZWZpbmVkLFxuICByZWdpc3RlckZuOiAoZWxlbWVudDogRWxlbWVudCwgY2FsbGJhY2s6IFZvaWRGdW5jdGlvbiwgaW5qZWN0b3I6IEluamVjdG9yKSA9PiBWb2lkRnVuY3Rpb24sXG4gIGNhbGxiYWNrOiBWb2lkRnVuY3Rpb24sXG4gIHR5cGU6IFRyaWdnZXJUeXBlLFxuKSB7XG4gIGNvbnN0IGluamVjdG9yID0gaW5pdGlhbExWaWV3W0lOSkVDVE9SXSE7XG4gIGNvbnN0IHpvbmUgPSBpbmplY3Rvci5nZXQoTmdab25lKTtcbiAgZnVuY3Rpb24gcG9sbERvbVRyaWdnZXIoKSB7XG4gICAgLy8gSWYgdGhlIGluaXRpYWwgdmlldyB3YXMgZGVzdHJveWVkLCB3ZSBkb24ndCBuZWVkIHRvIGRvIGFueXRoaW5nLlxuICAgIGlmIChpc0Rlc3Ryb3llZChpbml0aWFsTFZpZXcpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgbERldGFpbHMgPSBnZXRMRGVmZXJCbG9ja0RldGFpbHMoaW5pdGlhbExWaWV3LCB0Tm9kZSk7XG4gICAgY29uc3QgcmVuZGVyZWRTdGF0ZSA9IGxEZXRhaWxzW0RFRkVSX0JMT0NLX1NUQVRFXTtcblxuICAgIC8vIElmIHRoZSBibG9jayB3YXMgbG9hZGVkIGJlZm9yZSB0aGUgdHJpZ2dlciB3YXMgcmVzb2x2ZWQsIHdlIGRvbid0IG5lZWQgdG8gZG8gYW55dGhpbmcuXG4gICAgaWYgKFxuICAgICAgcmVuZGVyZWRTdGF0ZSAhPT0gRGVmZXJCbG9ja0ludGVybmFsU3RhdGUuSW5pdGlhbCAmJlxuICAgICAgcmVuZGVyZWRTdGF0ZSAhPT0gRGVmZXJCbG9ja1N0YXRlLlBsYWNlaG9sZGVyXG4gICAgKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgdHJpZ2dlckxWaWV3ID0gZ2V0VHJpZ2dlckxWaWV3KGluaXRpYWxMVmlldywgdE5vZGUsIHdhbGtVcFRpbWVzKTtcblxuICAgIC8vIEtlZXAgcG9sbGluZyB1bnRpbCB3ZSByZXNvbHZlIHRoZSB0cmlnZ2VyJ3MgTFZpZXcuXG4gICAgaWYgKCF0cmlnZ2VyTFZpZXcpIHtcbiAgICAgIGFmdGVyTmV4dFJlbmRlcih7cmVhZDogcG9sbERvbVRyaWdnZXJ9LCB7aW5qZWN0b3J9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBJdCdzIHBvc3NpYmxlIHRoYXQgdGhlIHRyaWdnZXIncyB2aWV3IHdhcyBkZXN0cm95ZWQgYmVmb3JlIHdlIHJlc29sdmVkIHRoZSB0cmlnZ2VyIGVsZW1lbnQuXG4gICAgaWYgKGlzRGVzdHJveWVkKHRyaWdnZXJMVmlldykpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBlbGVtZW50ID0gZ2V0VHJpZ2dlckVsZW1lbnQodHJpZ2dlckxWaWV3LCB0cmlnZ2VySW5kZXgpO1xuICAgIGNvbnN0IGNsZWFudXAgPSByZWdpc3RlckZuKFxuICAgICAgZWxlbWVudCxcbiAgICAgICgpID0+IHtcbiAgICAgICAgLy8gYHBvbGxEb21UcmlnZ2VyYCBydW5zIG91dHNpZGUgdGhlIHpvbmUgKGJlY2F1c2Ugb2YgYGFmdGVyTmV4dFJlbmRlcmApIGFuZCByZWdpc3RlcnMgaXRzXG4gICAgICAgIC8vIGxpc3RlbmVycyBvdXRzaWRlIHRoZSB6b25lLCBzbyB3ZSBqdW1wIGJhY2sgaW50byB0aGUgem9uZSBwcmlvciB0byBydW5uaW5nIHRoZSBjYWxsYmFjay5cbiAgICAgICAgem9uZS5ydW4oKCkgPT4ge1xuICAgICAgICAgIGlmIChpbml0aWFsTFZpZXcgIT09IHRyaWdnZXJMVmlldykge1xuICAgICAgICAgICAgcmVtb3ZlTFZpZXdPbkRlc3Ryb3kodHJpZ2dlckxWaWV3LCBjbGVhbnVwKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgaW5qZWN0b3IsXG4gICAgKTtcblxuICAgIC8vIFRoZSB0cmlnZ2VyIGFuZCBkZWZlcnJlZCBibG9jayBtaWdodCBiZSBpbiBkaWZmZXJlbnQgTFZpZXdzLlxuICAgIC8vIEZvciB0aGUgbWFpbiBMVmlldyB0aGUgY2xlYW51cCB3b3VsZCBoYXBwZW4gYXMgYSBwYXJ0IG9mXG4gICAgLy8gYHN0b3JlVHJpZ2dlckNsZWFudXBGbmAgbG9naWMuIEZvciB0cmlnZ2VyIExWaWV3IHdlIHJlZ2lzdGVyXG4gICAgLy8gYSBjbGVhbnVwIGZ1bmN0aW9uIHRoZXJlIHRvIHJlbW92ZSBldmVudCBoYW5kbGVycyBpbiBjYXNlIGFuXG4gICAgLy8gTFZpZXcgZ2V0cyBkZXN0cm95ZWQgYmVmb3JlIGEgdHJpZ2dlciBpcyBpbnZva2VkLlxuICAgIGlmIChpbml0aWFsTFZpZXcgIT09IHRyaWdnZXJMVmlldykge1xuICAgICAgc3RvcmVMVmlld09uRGVzdHJveSh0cmlnZ2VyTFZpZXcsIGNsZWFudXApO1xuICAgIH1cblxuICAgIHN0b3JlVHJpZ2dlckNsZWFudXBGbih0eXBlLCBsRGV0YWlscywgY2xlYW51cCk7XG4gIH1cblxuICAvLyBCZWdpbiBwb2xsaW5nIGZvciB0aGUgdHJpZ2dlci5cbiAgYWZ0ZXJOZXh0UmVuZGVyKHtyZWFkOiBwb2xsRG9tVHJpZ2dlcn0sIHtpbmplY3Rvcn0pO1xufVxuIl19