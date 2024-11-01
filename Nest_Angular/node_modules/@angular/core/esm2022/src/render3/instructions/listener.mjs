/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { setActiveConsumer } from '@angular/core/primitives/signals';
import { assertIndexInRange } from '../../util/assert';
import { isDirectiveHost } from '../interfaces/type_checks';
import { CLEANUP, CONTEXT, RENDERER } from '../interfaces/view';
import { assertTNodeType } from '../node_assert';
import { profiler } from '../profiler';
import { getCurrentDirectiveDef, getCurrentTNode, getLView, getTView } from '../state';
import { getComponentLViewByIndex, getNativeByTNode, unwrapRNode } from '../util/view_utils';
import { markViewDirty } from './mark_view_dirty';
import { getOrCreateLViewCleanup, getOrCreateTViewCleanup, handleError, loadComponentRenderer, } from './shared';
/**
 * Contains a reference to a function that disables event replay feature
 * for server-side rendered applications. This function is overridden with
 * an actual implementation when the event replay feature is enabled via
 * `withEventReplay()` call.
 */
let stashEventListener = (el, eventName, listenerFn) => { };
export function setStashFn(fn) {
    stashEventListener = fn;
}
/**
 * Adds an event listener to the current node.
 *
 * If an output exists on one of the node's directives, it also subscribes to the output
 * and saves the subscription for later cleanup.
 *
 * @param eventName Name of the event
 * @param listenerFn The function to be called when event emits
 * @param useCapture Whether or not to use capture in event listener - this argument is a reminder
 *     from the Renderer3 infrastructure and should be removed from the instruction arguments
 * @param eventTargetResolver Function that returns global target information in case this listener
 * should be attached to a global object like window, document or body
 *
 * @codeGenApi
 */
export function ɵɵlistener(eventName, listenerFn, useCapture, eventTargetResolver) {
    const lView = getLView();
    const tView = getTView();
    const tNode = getCurrentTNode();
    listenerInternal(tView, lView, lView[RENDERER], tNode, eventName, listenerFn, eventTargetResolver);
    return ɵɵlistener;
}
/**
 * Registers a synthetic host listener (e.g. `(@foo.start)`) on a component or directive.
 *
 * This instruction is for compatibility purposes and is designed to ensure that a
 * synthetic host listener (e.g. `@HostListener('@foo.start')`) properly gets rendered
 * in the component's renderer. Normally all host listeners are evaluated with the
 * parent component's renderer, but, in the case of animation @triggers, they need
 * to be evaluated with the sub component's renderer (because that's where the
 * animation triggers are defined).
 *
 * Do not use this instruction as a replacement for `listener`. This instruction
 * only exists to ensure compatibility with the ViewEngine's host binding behavior.
 *
 * @param eventName Name of the event
 * @param listenerFn The function to be called when event emits
 * @param useCapture Whether or not to use capture in event listener
 * @param eventTargetResolver Function that returns global target information in case this listener
 * should be attached to a global object like window, document or body
 *
 * @codeGenApi
 */
export function ɵɵsyntheticHostListener(eventName, listenerFn) {
    const tNode = getCurrentTNode();
    const lView = getLView();
    const tView = getTView();
    const currentDef = getCurrentDirectiveDef(tView.data);
    const renderer = loadComponentRenderer(currentDef, tNode, lView);
    listenerInternal(tView, lView, renderer, tNode, eventName, listenerFn);
    return ɵɵsyntheticHostListener;
}
/**
 * A utility function that checks if a given element has already an event handler registered for an
 * event with a specified name. The TView.cleanup data structure is used to find out which events
 * are registered for a given element.
 */
function findExistingListener(tView, lView, eventName, tNodeIdx) {
    const tCleanup = tView.cleanup;
    if (tCleanup != null) {
        for (let i = 0; i < tCleanup.length - 1; i += 2) {
            const cleanupEventName = tCleanup[i];
            if (cleanupEventName === eventName && tCleanup[i + 1] === tNodeIdx) {
                // We have found a matching event name on the same node but it might not have been
                // registered yet, so we must explicitly verify entries in the LView cleanup data
                // structures.
                const lCleanup = lView[CLEANUP];
                const listenerIdxInLCleanup = tCleanup[i + 2];
                return lCleanup.length > listenerIdxInLCleanup ? lCleanup[listenerIdxInLCleanup] : null;
            }
            // TView.cleanup can have a mix of 4-elements entries (for event handler cleanups) or
            // 2-element entries (for directive and queries destroy hooks). As such we can encounter
            // blocks of 4 or 2 items in the tView.cleanup and this is why we iterate over 2 elements
            // first and jump another 2 elements if we detect listeners cleanup (4 elements). Also check
            // documentation of TView.cleanup for more details of this data structure layout.
            if (typeof cleanupEventName === 'string') {
                i += 2;
            }
        }
    }
    return null;
}
export function listenerInternal(tView, lView, renderer, tNode, eventName, listenerFn, eventTargetResolver) {
    const isTNodeDirectiveHost = isDirectiveHost(tNode);
    const firstCreatePass = tView.firstCreatePass;
    const tCleanup = firstCreatePass && getOrCreateTViewCleanup(tView);
    const context = lView[CONTEXT];
    // When the ɵɵlistener instruction was generated and is executed we know that there is either a
    // native listener or a directive output on this element. As such we we know that we will have to
    // register a listener and store its cleanup function on LView.
    const lCleanup = getOrCreateLViewCleanup(lView);
    ngDevMode && assertTNodeType(tNode, 3 /* TNodeType.AnyRNode */ | 12 /* TNodeType.AnyContainer */);
    let processOutputs = true;
    // Adding a native event listener is applicable when:
    // - The corresponding TNode represents a DOM element.
    // - The event target has a resolver (usually resulting in a global object,
    //   such as `window` or `document`).
    if (tNode.type & 3 /* TNodeType.AnyRNode */ || eventTargetResolver) {
        const native = getNativeByTNode(tNode, lView);
        const target = eventTargetResolver ? eventTargetResolver(native) : native;
        const lCleanupIndex = lCleanup.length;
        const idxOrTargetGetter = eventTargetResolver
            ? (_lView) => eventTargetResolver(unwrapRNode(_lView[tNode.index]))
            : tNode.index;
        // In order to match current behavior, native DOM event listeners must be added for all
        // events (including outputs).
        // There might be cases where multiple directives on the same element try to register an event
        // handler function for the same event. In this situation we want to avoid registration of
        // several native listeners as each registration would be intercepted by NgZone and
        // trigger change detection. This would mean that a single user action would result in several
        // change detections being invoked. To avoid this situation we want to have only one call to
        // native handler registration (for the same element and same type of event).
        //
        // In order to have just one native event handler in presence of multiple handler functions,
        // we just register a first handler function as a native event listener and then chain
        // (coalesce) other handler functions on top of the first native handler function.
        let existingListener = null;
        // Please note that the coalescing described here doesn't happen for events specifying an
        // alternative target (ex. (document:click)) - this is to keep backward compatibility with the
        // view engine.
        // Also, we don't have to search for existing listeners is there are no directives
        // matching on a given node as we can't register multiple event handlers for the same event in
        // a template (this would mean having duplicate attributes).
        if (!eventTargetResolver && isTNodeDirectiveHost) {
            existingListener = findExistingListener(tView, lView, eventName, tNode.index);
        }
        if (existingListener !== null) {
            // Attach a new listener to coalesced listeners list, maintaining the order in which
            // listeners are registered. For performance reasons, we keep a reference to the last
            // listener in that list (in `__ngLastListenerFn__` field), so we can avoid going through
            // the entire set each time we need to add a new listener.
            const lastListenerFn = existingListener.__ngLastListenerFn__ || existingListener;
            lastListenerFn.__ngNextListenerFn__ = listenerFn;
            existingListener.__ngLastListenerFn__ = listenerFn;
            processOutputs = false;
        }
        else {
            listenerFn = wrapListener(tNode, lView, context, listenerFn);
            stashEventListener(native, eventName, listenerFn);
            const cleanupFn = renderer.listen(target, eventName, listenerFn);
            ngDevMode && ngDevMode.rendererAddEventListener++;
            lCleanup.push(listenerFn, cleanupFn);
            tCleanup && tCleanup.push(eventName, idxOrTargetGetter, lCleanupIndex, lCleanupIndex + 1);
        }
    }
    else {
        // Even if there is no native listener to add, we still need to wrap the listener so that OnPush
        // ancestors are marked dirty when an event occurs.
        listenerFn = wrapListener(tNode, lView, context, listenerFn);
    }
    // subscribe to directive outputs
    const outputs = tNode.outputs;
    let props;
    if (processOutputs && outputs !== null && (props = outputs[eventName])) {
        const propsLength = props.length;
        if (propsLength) {
            for (let i = 0; i < propsLength; i += 2) {
                const index = props[i];
                ngDevMode && assertIndexInRange(lView, index);
                const minifiedName = props[i + 1];
                const directiveInstance = lView[index];
                const output = directiveInstance[minifiedName];
                if (ngDevMode && !isOutputSubscribable(output)) {
                    throw new Error(`@Output ${minifiedName} not initialized in '${directiveInstance.constructor.name}'.`);
                }
                const subscription = output.subscribe(listenerFn);
                const idx = lCleanup.length;
                lCleanup.push(listenerFn, subscription);
                tCleanup && tCleanup.push(eventName, tNode.index, idx, -(idx + 1));
            }
        }
    }
}
function executeListenerWithErrorHandling(lView, context, listenerFn, e) {
    const prevConsumer = setActiveConsumer(null);
    try {
        profiler(6 /* ProfilerEvent.OutputStart */, context, listenerFn);
        // Only explicitly returning false from a listener should preventDefault
        return listenerFn(e) !== false;
    }
    catch (error) {
        handleError(lView, error);
        return false;
    }
    finally {
        profiler(7 /* ProfilerEvent.OutputEnd */, context, listenerFn);
        setActiveConsumer(prevConsumer);
    }
}
/**
 * Wraps an event listener with a function that marks ancestors dirty and prevents default behavior,
 * if applicable.
 *
 * @param tNode The TNode associated with this listener
 * @param lView The LView that contains this listener
 * @param listenerFn The listener function to call
 * @param wrapWithPreventDefault Whether or not to prevent default behavior
 * (the procedural renderer does this already, so in those cases, we should skip)
 */
function wrapListener(tNode, lView, context, listenerFn) {
    // Note: we are performing most of the work in the listener function itself
    // to optimize listener registration.
    return function wrapListenerIn_markDirtyAndPreventDefault(e) {
        // Ivy uses `Function` as a special token that allows us to unwrap the function
        // so that it can be invoked programmatically by `DebugNode.triggerEventHandler`.
        if (e === Function) {
            return listenerFn;
        }
        // In order to be backwards compatible with View Engine, events on component host nodes
        // must also mark the component view itself dirty (i.e. the view that it owns).
        const startView = tNode.componentOffset > -1 ? getComponentLViewByIndex(tNode.index, lView) : lView;
        markViewDirty(startView, 5 /* NotificationSource.Listener */);
        let result = executeListenerWithErrorHandling(lView, context, listenerFn, e);
        // A just-invoked listener function might have coalesced listeners so we need to check for
        // their presence and invoke as needed.
        let nextListenerFn = wrapListenerIn_markDirtyAndPreventDefault.__ngNextListenerFn__;
        while (nextListenerFn) {
            // We should prevent default if any of the listeners explicitly return false
            result = executeListenerWithErrorHandling(lView, context, nextListenerFn, e) && result;
            nextListenerFn = nextListenerFn.__ngNextListenerFn__;
        }
        return result;
    };
}
/**
 * Whether the given value represents a subscribable output.
 *
 * For example, an `EventEmitter, a `Subject`, an `Observable` or an
 * `OutputEmitter`.
 */
function isOutputSubscribable(value) {
    return (value != null && typeof value.subscribe === 'function');
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdGVuZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy9yZW5kZXIzL2luc3RydWN0aW9ucy9saXN0ZW5lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSxrQ0FBa0MsQ0FBQztBQUduRSxPQUFPLEVBQUMsa0JBQWtCLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUlyRCxPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0sMkJBQTJCLENBQUM7QUFDMUQsT0FBTyxFQUFDLE9BQU8sRUFBRSxPQUFPLEVBQVMsUUFBUSxFQUFRLE1BQU0sb0JBQW9CLENBQUM7QUFDNUUsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQy9DLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxhQUFhLENBQUM7QUFFckMsT0FBTyxFQUFDLHNCQUFzQixFQUFFLGVBQWUsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFDLE1BQU0sVUFBVSxDQUFDO0FBQ3JGLE9BQU8sRUFBQyx3QkFBd0IsRUFBRSxnQkFBZ0IsRUFBRSxXQUFXLEVBQUMsTUFBTSxvQkFBb0IsQ0FBQztBQUUzRixPQUFPLEVBQUMsYUFBYSxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDaEQsT0FBTyxFQUNMLHVCQUF1QixFQUN2Qix1QkFBdUIsRUFDdkIsV0FBVyxFQUNYLHFCQUFxQixHQUN0QixNQUFNLFVBQVUsQ0FBQztBQUVsQjs7Ozs7R0FLRztBQUNILElBQUksa0JBQWtCLEdBQUcsQ0FBQyxFQUFZLEVBQUUsU0FBaUIsRUFBRSxVQUE0QixFQUFFLEVBQUUsR0FBRSxDQUFDLENBQUM7QUFFL0YsTUFBTSxVQUFVLFVBQVUsQ0FBQyxFQUE2QjtJQUN0RCxrQkFBa0IsR0FBRyxFQUFFLENBQUM7QUFDMUIsQ0FBQztBQUVEOzs7Ozs7Ozs7Ozs7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QUFPLFVBQVUsQ0FBQztRQUNwQixDQUFDO1FBRUQsdUZBQXVGO1FBQ3ZGLCtFQUErRTtRQUMvRSxNQUFNLFNBQVMsR0FDYixLQUFLLENBQUMsZUFBZSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyx3QkFBd0IsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFDcEYsYUFBYSxDQUFDLFNBQVMsc0NBQThCLENBQUM7UUFFdEQsSUFBSSxNQUFNLEdBQUcsZ0NBQWdDLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDN0UsMEZBQTBGO1FBQzFGLHVDQUF1QztRQUN2QyxJQUFJLGNBQWMsR0FBUyx5Q0FBMEMsQ0FBQyxvQkFBb0IsQ0FBQztRQUMzRixPQUFPLGNBQWMsRUFBRSxDQUFDO1lBQ3RCLDRFQUE0RTtZQUM1RSxNQUFNLEdBQUcsZ0NBQWdDLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxjQUFjLEVBQUUsQ0FBQyxDQUFDLElBQUksTUFBTSxDQUFDO1lBQ3ZGLGNBQWMsR0FBUyxjQUFlLENBQUMsb0JBQW9CLENBQUM7UUFDOUQsQ0FBQztRQUVELE9BQU8sTUFBTSxDQUFDO0lBQ2hCLENBQUMsQ0FBQztBQUNKLENBQUM7QUFPRDs7Ozs7R0FLRztBQUNILFNBQVMsb0JBQW9CLENBQUMsS0FBYztJQUMxQyxPQUFPLENBQ0wsS0FBSyxJQUFJLElBQUksSUFBSSxPQUFRLEtBQThDLENBQUMsU0FBUyxLQUFLLFVBQVUsQ0FDakcsQ0FBQztBQUNKLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbmltcG9ydCB7c2V0QWN0aXZlQ29uc3VtZXJ9IGZyb20gJ0Bhbmd1bGFyL2NvcmUvcHJpbWl0aXZlcy9zaWduYWxzJztcblxuaW1wb3J0IHtOb3RpZmljYXRpb25Tb3VyY2V9IGZyb20gJy4uLy4uL2NoYW5nZV9kZXRlY3Rpb24vc2NoZWR1bGluZy96b25lbGVzc19zY2hlZHVsaW5nJztcbmltcG9ydCB7YXNzZXJ0SW5kZXhJblJhbmdlfSBmcm9tICcuLi8uLi91dGlsL2Fzc2VydCc7XG5pbXBvcnQge05vZGVPdXRwdXRCaW5kaW5ncywgVE5vZGUsIFROb2RlVHlwZX0gZnJvbSAnLi4vaW50ZXJmYWNlcy9ub2RlJztcbmltcG9ydCB7R2xvYmFsVGFyZ2V0UmVzb2x2ZXIsIFJlbmRlcmVyfSBmcm9tICcuLi9pbnRlcmZhY2VzL3JlbmRlcmVyJztcbmltcG9ydCB7UkVsZW1lbnR9IGZyb20gJy4uL2ludGVyZmFjZXMvcmVuZGVyZXJfZG9tJztcbmltcG9ydCB7aXNEaXJlY3RpdmVIb3N0fSBmcm9tICcuLi9pbnRlcmZhY2VzL3R5cGVfY2hlY2tzJztcbmltcG9ydCB7Q0xFQU5VUCwgQ09OVEVYVCwgTFZpZXcsIFJFTkRFUkVSLCBUVmlld30gZnJvbSAnLi4vaW50ZXJmYWNlcy92aWV3JztcbmltcG9ydCB7YXNzZXJ0VE5vZGVUeXBlfSBmcm9tICcuLi9ub2RlX2Fzc2VydCc7XG5pbXBvcnQge3Byb2ZpbGVyfSBmcm9tICcuLi9wcm9maWxlcic7XG5pbXBvcnQge1Byb2ZpbGVyRXZlbnR9IGZyb20gJy4uL3Byb2ZpbGVyX3R5cGVzJztcbmltcG9ydCB7Z2V0Q3VycmVudERpcmVjdGl2ZURlZiwgZ2V0Q3VycmVudFROb2RlLCBnZXRMVmlldywgZ2V0VFZpZXd9IGZyb20gJy4uL3N0YXRlJztcbmltcG9ydCB7Z2V0Q29tcG9uZW50TFZpZXdCeUluZGV4LCBnZXROYXRpdmVCeVROb2RlLCB1bndyYXBSTm9kZX0gZnJvbSAnLi4vdXRpbC92aWV3X3V0aWxzJztcblxuaW1wb3J0IHttYXJrVmlld0RpcnR5fSBmcm9tICcuL21hcmtfdmlld19kaXJ0eSc7XG5pbXBvcnQge1xuICBnZXRPckNyZWF0ZUxWaWV3Q2xlYW51cCxcbiAgZ2V0T3JDcmVhdGVUVmlld0NsZWFudXAsXG4gIGhhbmRsZUVycm9yLFxuICBsb2FkQ29tcG9uZW50UmVuZGVyZXIsXG59IGZyb20gJy4vc2hhcmVkJztcblxuLyoqXG4gKiBDb250YWlucyBhIHJlZmVyZW5jZSB0byBhIGZ1bmN0aW9uIHRoYXQgZGlzYWJsZXMgZXZlbnQgcmVwbGF5IGZlYXR1cmVcbiAqIGZvciBzZXJ2ZXItc2lkZSByZW5kZXJlZCBhcHBsaWNhdGlvbnMuIFRoaXMgZnVuY3Rpb24gaXMgb3ZlcnJpZGRlbiB3aXRoXG4gKiBhbiBhY3R1YWwgaW1wbGVtZW50YXRpb24gd2hlbiB0aGUgZXZlbnQgcmVwbGF5IGZlYXR1cmUgaXMgZW5hYmxlZCB2aWFcbiAqIGB3aXRoRXZlbnRSZXBsYXkoKWAgY2FsbC5cbiAqL1xubGV0IHN0YXNoRXZlbnRMaXN0ZW5lciA9IChlbDogUkVsZW1lbnQsIGV2ZW50TmFtZTogc3RyaW5nLCBsaXN0ZW5lckZuOiAoZT86IGFueSkgPT4gYW55KSA9PiB7fTtcblxuZXhwb3J0IGZ1bmN0aW9uIHNldFN0YXNoRm4oZm46IHR5cGVvZiBzdGFzaEV2ZW50TGlzdGVuZXIpIHtcbiAgc3Rhc2hFdmVudExpc3RlbmVyID0gZm47XG59XG5cbi8qKlxuICogQWRkcyBhbiBldmVudCBsaXN0ZW5lciB0byB0aGUgY3VycmVudCBub2RlLlxuICpcbiAqIElmIGFuIG91dHB1dCBleGlzdHMgb24gb25lIG9mIHRoZSBub2RlJ3MgZGlyZWN0aXZlcywgaXQgYWxzbyBzdWJzY3JpYmVzIHRvIHRoZSBvdXRwdXRcbiAqIGFuZCBzYXZlcyB0aGUgc3Vic2NyaXB0aW9uIGZvciBsYXRlciBjbGVhbnVwLlxuICpcbiAqIEBwYXJhbSBldmVudE5hbWUgTmFtZSBvZiB0aGUgZXZlbnRcbiAqIEBwYXJhbSBsaXN0ZW5lckZuIFRoZSBmdW5jdGlvbiB0byBiZSBjYWxsZWQgd2hlbiBldmVudCBlbWl0c1xuICogQHBhcmFtIHVzZUNhcHR1cmUgV2hldGhlciBvciBub3QgdG8gdXNlIGNhcHR1cmUgaW4gZXZlbnQgbGlzdGVuZXIgLSB0aGlzIGFyZ3VtZW50IGlzIGEgcmVtaW5kZXJcbiAqICAgICBmcm9tIHRoZSBSZW5kZXJlcjMgaW5mcmFzdHJ1Y3R1cmUgYW5kIHNob3VsZCBiZSByZW1vdmVkIGZyb20gdGhlIGluc3RydWN0aW9uIGFyZ3VtZW50c1xuICogQHBhcmFtIGV2ZW50VGFyZ2V0UmVzb2x2ZXIgRnVuY3Rpb24gdGhhdCByZXR1cm5zIGdsb2JhbCB0YXJnZXQgaW5mb3JtYXRpb24gaW4gY2FzZSB0aGlzIGxpc3RlbmVyXG4gKiBzaG91bGQgYmUgYXR0YWNoZWQgdG8gYSBnbG9iYWwgb2JqZWN0IGxpa2Ugd2luZG93LCBkb2N1bWVudCBvciBib2R5XG4gKlxuICogQGNvZGVHZW5BcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIMm1ybVsaXN0ZW5lcihcbiAgZXZlbnROYW1lOiBzdHJpbmcsXG4gIGxpc3RlbmVyRm46IChlPzogYW55KSA9PiBhbnksXG4gIHVzZUNhcHR1cmU/OiBib29sZWFuLFxuICBldmVudFRhcmdldFJlc29sdmVyPzogR2xvYmFsVGFyZ2V0UmVzb2x2ZXIsXG4pOiB0eXBlb2YgybXJtWxpc3RlbmVyIHtcbiAgY29uc3QgbFZpZXcgPSBnZXRMVmlldzx7fSB8IG51bGw+KCk7XG4gIGNvbnN0IHRWaWV3ID0gZ2V0VFZpZXcoKTtcbiAgY29uc3QgdE5vZGUgPSBnZXRDdXJyZW50VE5vZGUoKSE7XG4gIGxpc3RlbmVySW50ZXJuYWwoXG4gICAgdFZpZXcsXG4gICAgbFZpZXcsXG4gICAgbFZpZXdbUkVOREVSRVJdLFxuICAgIHROb2RlLFxuICAgIGV2ZW50TmFtZSxcbiAgICBsaXN0ZW5lckZuLFxuICAgIGV2ZW50VGFyZ2V0UmVzb2x2ZXIsXG4gICk7XG4gIHJldHVybiDJtcm1bGlzdGVuZXI7XG59XG5cbi8qKlxuICogUmVnaXN0ZXJzIGEgc3ludGhldGljIGhvc3QgbGlzdGVuZXIgKGUuZy4gYChAZm9vLnN0YXJ0KWApIG9uIGEgY29tcG9uZW50IG9yIGRpcmVjdGl2ZS5cbiAqXG4gKiBUaGlzIGluc3RydWN0aW9uIGlzIGZvciBjb21wYXRpYmlsaXR5IHB1cnBvc2VzIGFuZCBpcyBkZXNpZ25lZCB0byBlbnN1cmUgdGhhdCBhXG4gKiBzeW50aGV0aWMgaG9zdCBsaXN0ZW5lciAoZS5nLiBgQEhvc3RMaXN0ZW5lcignQGZvby5zdGFydCcpYCkgcHJvcGVybHkgZ2V0cyByZW5kZXJlZFxuICogaW4gdGhlIGNvbXBvbmVudCdzIHJlbmRlcmVyLiBOb3JtYWxseSBhbGwgaG9zdCBsaXN0ZW5lcnMgYXJlIGV2YWx1YXRlZCB3aXRoIHRoZVxuICogcGFyZW50IGNvbXBvbmVudCdzIHJlbmRlcmVyLCBidXQsIGluIHRoZSBjYXNlIG9mIGFuaW1hdGlvbiBAdHJpZ2dlcnMsIHRoZXkgbmVlZFxuICogdG8gYmUgZXZhbHVhdGVkIHdpdGggdGhlIHN1YiBjb21wb25lbnQncyByZW5kZXJlciAoYmVjYXVzZSB0aGF0J3Mgd2hlcmUgdGhlXG4gKiBhbmltYXRpb24gdHJpZ2dlcnMgYXJlIGRlZmluZWQpLlxuICpcbiAqIERvIG5vdCB1c2UgdGhpcyBpbnN0cnVjdGlvbiBhcyBhIHJlcGxhY2VtZW50IGZvciBgbGlzdGVuZXJgLiBUaGlzIGluc3RydWN0aW9uXG4gKiBvbmx5IGV4aXN0cyB0byBlbnN1cmUgY29tcGF0aWJpbGl0eSB3aXRoIHRoZSBWaWV3RW5naW5lJ3MgaG9zdCBiaW5kaW5nIGJlaGF2aW9yLlxuICpcbiAqIEBwYXJhbSBldmVudE5hbWUgTmFtZSBvZiB0aGUgZXZlbnRcbiAqIEBwYXJhbSBsaXN0ZW5lckZuIFRoZSBmdW5jdGlvbiB0byBiZSBjYWxsZWQgd2hlbiBldmVudCBlbWl0c1xuICogQHBhcmFtIHVzZUNhcHR1cmUgV2hldGhlciBvciBub3QgdG8gdXNlIGNhcHR1cmUgaW4gZXZlbnQgbGlzdGVuZXJcbiAqIEBwYXJhbSBldmVudFRhcmdldFJlc29sdmVyIEZ1bmN0aW9uIHRoYXQgcmV0dXJucyBnbG9iYWwgdGFyZ2V0IGluZm9ybWF0aW9uIGluIGNhc2UgdGhpcyBsaXN0ZW5lclxuICogc2hvdWxkIGJlIGF0dGFjaGVkIHRvIGEgZ2xvYmFsIG9iamVjdCBsaWtlIHdpbmRvdywgZG9jdW1lbnQgb3IgYm9keVxuICpcbiAqIEBjb2RlR2VuQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiDJtcm1c3ludGhldGljSG9zdExpc3RlbmVyKFxuICBldmVudE5hbWU6IHN0cmluZyxcbiAgbGlzdGVuZXJGbjogKGU/OiBhbnkpID0+IGFueSxcbik6IHR5cGVvZiDJtcm1c3ludGhldGljSG9zdExpc3RlbmVyIHtcbiAgY29uc3QgdE5vZGUgPSBnZXRDdXJyZW50VE5vZGUoKSE7XG4gIGNvbnN0IGxWaWV3ID0gZ2V0TFZpZXc8e30gfCBudWxsPigpO1xuICBjb25zdCB0VmlldyA9IGdldFRWaWV3KCk7XG4gIGNvbnN0IGN1cnJlbnREZWYgPSBnZXRDdXJyZW50RGlyZWN0aXZlRGVmKHRWaWV3LmRhdGEpO1xuICBjb25zdCByZW5kZXJlciA9IGxvYWRDb21wb25lbnRSZW5kZXJlcihjdXJyZW50RGVmLCB0Tm9kZSwgbFZpZXcpO1xuICBsaXN0ZW5lckludGVybmFsKHRWaWV3LCBsVmlldywgcmVuZGVyZXIsIHROb2RlLCBldmVudE5hbWUsIGxpc3RlbmVyRm4pO1xuICByZXR1cm4gybXJtXN5bnRoZXRpY0hvc3RMaXN0ZW5lcjtcbn1cblxuLyoqXG4gKiBBIHV0aWxpdHkgZnVuY3Rpb24gdGhhdCBjaGVja3MgaWYgYSBnaXZlbiBlbGVtZW50IGhhcyBhbHJlYWR5IGFuIGV2ZW50IGhhbmRsZXIgcmVnaXN0ZXJlZCBmb3IgYW5cbiAqIGV2ZW50IHdpdGggYSBzcGVjaWZpZWQgbmFtZS4gVGhlIFRWaWV3LmNsZWFudXAgZGF0YSBzdHJ1Y3R1cmUgaXMgdXNlZCB0byBmaW5kIG91dCB3aGljaCBldmVudHNcbiAqIGFyZSByZWdpc3RlcmVkIGZvciBhIGdpdmVuIGVsZW1lbnQuXG4gKi9cbmZ1bmN0aW9uIGZpbmRFeGlzdGluZ0xpc3RlbmVyKFxuICB0VmlldzogVFZpZXcsXG4gIGxWaWV3OiBMVmlldyxcbiAgZXZlbnROYW1lOiBzdHJpbmcsXG4gIHROb2RlSWR4OiBudW1iZXIsXG4pOiAoKGU/OiBhbnkpID0+IGFueSkgfCBudWxsIHtcbiAgY29uc3QgdENsZWFudXAgPSB0Vmlldy5jbGVhbnVwO1xuICBpZiAodENsZWFudXAgIT0gbnVsbCkge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdENsZWFudXAubGVuZ3RoIC0gMTsgaSArPSAyKSB7XG4gICAgICBjb25zdCBjbGVhbnVwRXZlbnROYW1lID0gdENsZWFudXBbaV07XG4gICAgICBpZiAoY2xlYW51cEV2ZW50TmFtZSA9PT0gZXZlbnROYW1lICYmIHRDbGVhbnVwW2kgKyAxXSA9PT0gdE5vZGVJZHgpIHtcbiAgICAgICAgLy8gV2UgaGF2ZSBmb3VuZCBhIG1hdGNoaW5nIGV2ZW50IG5hbWUgb24gdGhlIHNhbWUgbm9kZSBidXQgaXQgbWlnaHQgbm90IGhhdmUgYmVlblxuICAgICAgICAvLyByZWdpc3RlcmVkIHlldCwgc28gd2UgbXVzdCBleHBsaWNpdGx5IHZlcmlmeSBlbnRyaWVzIGluIHRoZSBMVmlldyBjbGVhbnVwIGRhdGFcbiAgICAgICAgLy8gc3RydWN0dXJlcy5cbiAgICAgICAgY29uc3QgbENsZWFudXAgPSBsVmlld1tDTEVBTlVQXSE7XG4gICAgICAgIGNvbnN0IGxpc3RlbmVySWR4SW5MQ2xlYW51cCA9IHRDbGVhbnVwW2kgKyAyXTtcbiAgICAgICAgcmV0dXJuIGxDbGVhbnVwLmxlbmd0aCA+IGxpc3RlbmVySWR4SW5MQ2xlYW51cCA/IGxDbGVhbnVwW2xpc3RlbmVySWR4SW5MQ2xlYW51cF0gOiBudWxsO1xuICAgICAgfVxuICAgICAgLy8gVFZpZXcuY2xlYW51cCBjYW4gaGF2ZSBhIG1peCBvZiA0LWVsZW1lbnRzIGVudHJpZXMgKGZvciBldmVudCBoYW5kbGVyIGNsZWFudXBzKSBvclxuICAgICAgLy8gMi1lbGVtZW50IGVudHJpZXMgKGZvciBkaXJlY3RpdmUgYW5kIHF1ZXJpZXMgZGVzdHJveSBob29rcykuIEFzIHN1Y2ggd2UgY2FuIGVuY291bnRlclxuICAgICAgLy8gYmxvY2tzIG9mIDQgb3IgMiBpdGVtcyBpbiB0aGUgdFZpZXcuY2xlYW51cCBhbmQgdGhpcyBpcyB3aHkgd2UgaXRlcmF0ZSBvdmVyIDIgZWxlbWVudHNcbiAgICAgIC8vIGZpcnN0IGFuZCBqdW1wIGFub3RoZXIgMiBlbGVtZW50cyBpZiB3ZSBkZXRlY3QgbGlzdGVuZXJzIGNsZWFudXAgKDQgZWxlbWVudHMpLiBBbHNvIGNoZWNrXG4gICAgICAvLyBkb2N1bWVudGF0aW9uIG9mIFRWaWV3LmNsZWFudXAgZm9yIG1vcmUgZGV0YWlscyBvZiB0aGlzIGRhdGEgc3RydWN0dXJlIGxheW91dC5cbiAgICAgIGlmICh0eXBlb2YgY2xlYW51cEV2ZW50TmFtZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgaSArPSAyO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxpc3RlbmVySW50ZXJuYWwoXG4gIHRWaWV3OiBUVmlldyxcbiAgbFZpZXc6IExWaWV3PHt9IHwgbnVsbD4sXG4gIHJlbmRlcmVyOiBSZW5kZXJlcixcbiAgdE5vZGU6IFROb2RlLFxuICBldmVudE5hbWU6IHN0cmluZyxcbiAgbGlzdGVuZXJGbjogKGU/OiBhbnkpID0+IGFueSxcbiAgZXZlbnRUYXJnZXRSZXNvbHZlcj86IEdsb2JhbFRhcmdldFJlc29sdmVyLFxuKTogdm9pZCB7XG4gIGNvbnN0IGlzVE5vZGVEaXJlY3RpdmVIb3N0ID0gaXNEaXJlY3RpdmVIb3N0KHROb2RlKTtcbiAgY29uc3QgZmlyc3RDcmVhdGVQYXNzID0gdFZpZXcuZmlyc3RDcmVhdGVQYXNzO1xuICBjb25zdCB0Q2xlYW51cDogZmFsc2UgfCBhbnlbXSA9IGZpcnN0Q3JlYXRlUGFzcyAmJiBnZXRPckNyZWF0ZVRWaWV3Q2xlYW51cCh0Vmlldyk7XG4gIGNvbnN0IGNvbnRleHQgPSBsVmlld1tDT05URVhUXTtcblxuICAvLyBXaGVuIHRoZSDJtcm1bGlzdGVuZXIgaW5zdHJ1Y3Rpb24gd2FzIGdlbmVyYXRlZCBhbmQgaXMgZXhlY3V0ZWQgd2Uga25vdyB0aGF0IHRoZXJlIGlzIGVpdGhlciBhXG4gIC8vIG5hdGl2ZSBsaXN0ZW5lciBvciBhIGRpcmVjdGl2ZSBvdXRwdXQgb24gdGhpcyBlbGVtZW50LiBBcyBzdWNoIHdlIHdlIGtub3cgdGhhdCB3ZSB3aWxsIGhhdmUgdG9cbiAgLy8gcmVnaXN0ZXIgYSBsaXN0ZW5lciBhbmQgc3RvcmUgaXRzIGNsZWFudXAgZnVuY3Rpb24gb24gTFZpZXcuXG4gIGNvbnN0IGxDbGVhbnVwID0gZ2V0T3JDcmVhdGVMVmlld0NsZWFudXAobFZpZXcpO1xuXG4gIG5nRGV2TW9kZSAmJiBhc3NlcnRUTm9kZVR5cGUodE5vZGUsIFROb2RlVHlwZS5BbnlSTm9kZSB8IFROb2RlVHlwZS5BbnlDb250YWluZXIpO1xuXG4gIGxldCBwcm9jZXNzT3V0cHV0cyA9IHRydWU7XG5cbiAgLy8gQWRkaW5nIGEgbmF0aXZlIGV2ZW50IGxpc3RlbmVyIGlzIGFwcGxpY2FibGUgd2hlbjpcbiAgLy8gLSBUaGUgY29ycmVzcG9uZGluZyBUTm9kZSByZXByZXNlbnRzIGEgRE9NIGVsZW1lbnQuXG4gIC8vIC0gVGhlIGV2ZW50IHRhcmdldCBoYXMgYSByZXNvbHZlciAodXN1YWxseSByZXN1bHRpbmcgaW4gYSBnbG9iYWwgb2JqZWN0LFxuICAvLyAgIHN1Y2ggYXMgYHdpbmRvd2Agb3IgYGRvY3VtZW50YCkuXG4gIGlmICh0Tm9kZS50eXBlICYgVE5vZGVUeXBlLkFueVJOb2RlIHx8IGV2ZW50VGFyZ2V0UmVzb2x2ZXIpIHtcbiAgICBjb25zdCBuYXRpdmUgPSBnZXROYXRpdmVCeVROb2RlKHROb2RlLCBsVmlldykgYXMgUkVsZW1lbnQ7XG4gICAgY29uc3QgdGFyZ2V0ID0gZXZlbnRUYXJnZXRSZXNvbHZlciA/IGV2ZW50VGFyZ2V0UmVzb2x2ZXIobmF0aXZlKSA6IG5hdGl2ZTtcbiAgICBjb25zdCBsQ2xlYW51cEluZGV4ID0gbENsZWFudXAubGVuZ3RoO1xuICAgIGNvbnN0IGlkeE9yVGFyZ2V0R2V0dGVyID0gZXZlbnRUYXJnZXRSZXNvbHZlclxuICAgICAgPyAoX2xWaWV3OiBMVmlldykgPT4gZXZlbnRUYXJnZXRSZXNvbHZlcih1bndyYXBSTm9kZShfbFZpZXdbdE5vZGUuaW5kZXhdKSlcbiAgICAgIDogdE5vZGUuaW5kZXg7XG5cbiAgICAvLyBJbiBvcmRlciB0byBtYXRjaCBjdXJyZW50IGJlaGF2aW9yLCBuYXRpdmUgRE9NIGV2ZW50IGxpc3RlbmVycyBtdXN0IGJlIGFkZGVkIGZvciBhbGxcbiAgICAvLyBldmVudHMgKGluY2x1ZGluZyBvdXRwdXRzKS5cblxuICAgIC8vIFRoZXJlIG1pZ2h0IGJlIGNhc2VzIHdoZXJlIG11bHRpcGxlIGRpcmVjdGl2ZXMgb24gdGhlIHNhbWUgZWxlbWVudCB0cnkgdG8gcmVnaXN0ZXIgYW4gZXZlbnRcbiAgICAvLyBoYW5kbGVyIGZ1bmN0aW9uIGZvciB0aGUgc2FtZSBldmVudC4gSW4gdGhpcyBzaXR1YXRpb24gd2Ugd2FudCB0byBhdm9pZCByZWdpc3RyYXRpb24gb2ZcbiAgICAvLyBzZXZlcmFsIG5hdGl2ZSBsaXN0ZW5lcnMgYXMgZWFjaCByZWdpc3RyYXRpb24gd291bGQgYmUgaW50ZXJjZXB0ZWQgYnkgTmdab25lIGFuZFxuICAgIC8vIHRyaWdnZXIgY2hhbmdlIGRldGVjdGlvbi4gVGhpcyB3b3VsZCBtZWFuIHRoYXQgYSBzaW5nbGUgdXNlciBhY3Rpb24gd291bGQgcmVzdWx0IGluIHNldmVyYWxcbiAgICAvLyBjaGFuZ2UgZGV0ZWN0aW9ucyBiZWluZyBpbnZva2VkLiBUbyBhdm9pZCB0aGlzIHNpdHVhdGlvbiB3ZSB3YW50IHRvIGhhdmUgb25seSBvbmUgY2FsbCB0b1xuICAgIC8vIG5hdGl2ZSBoYW5kbGVyIHJlZ2lzdHJhdGlvbiAoZm9yIHRoZSBzYW1lIGVsZW1lbnQgYW5kIHNhbWUgdHlwZSBvZiBldmVudCkuXG4gICAgLy9cbiAgICAvLyBJbiBvcmRlciB0byBoYXZlIGp1c3Qgb25lIG5hdGl2ZSBldmVudCBoYW5kbGVyIGluIHByZXNlbmNlIG9mIG11bHRpcGxlIGhhbmRsZXIgZnVuY3Rpb25zLFxuICAgIC8vIHdlIGp1c3QgcmVnaXN0ZXIgYSBmaXJzdCBoYW5kbGVyIGZ1bmN0aW9uIGFzIGEgbmF0aXZlIGV2ZW50IGxpc3RlbmVyIGFuZCB0aGVuIGNoYWluXG4gICAgLy8gKGNvYWxlc2NlKSBvdGhlciBoYW5kbGVyIGZ1bmN0aW9ucyBvbiB0b3Agb2YgdGhlIGZpcnN0IG5hdGl2ZSBoYW5kbGVyIGZ1bmN0aW9uLlxuICAgIGxldCBleGlzdGluZ0xpc3RlbmVyID0gbnVsbDtcbiAgICAvLyBQbGVhc2Ugbm90ZSB0aGF0IHRoZSBjb2FsZXNjaW5nIGRlc2NyaWJlZCBoZXJlIGRvZXNuJ3QgaGFwcGVuIGZvciBldmVudHMgc3BlY2lmeWluZyBhblxuICAgIC8vIGFsdGVybmF0aXZlIHRhcmdldCAoZXguIChkb2N1bWVudDpjbGljaykpIC0gdGhpcyBpcyB0byBrZWVwIGJhY2t3YXJkIGNvbXBhdGliaWxpdHkgd2l0aCB0aGVcbiAgICAvLyB2aWV3IGVuZ2luZS5cbiAgICAvLyBBbHNvLCB3ZSBkb24ndCBoYXZlIHRvIHNlYXJjaCBmb3IgZXhpc3RpbmcgbGlzdGVuZXJzIGlzIHRoZXJlIGFyZSBubyBkaXJlY3RpdmVzXG4gICAgLy8gbWF0Y2hpbmcgb24gYSBnaXZlbiBub2RlIGFzIHdlIGNhbid0IHJlZ2lzdGVyIG11bHRpcGxlIGV2ZW50IGhhbmRsZXJzIGZvciB0aGUgc2FtZSBldmVudCBpblxuICAgIC8vIGEgdGVtcGxhdGUgKHRoaXMgd291bGQgbWVhbiBoYXZpbmcgZHVwbGljYXRlIGF0dHJpYnV0ZXMpLlxuICAgIGlmICghZXZlbnRUYXJnZXRSZXNvbHZlciAmJiBpc1ROb2RlRGlyZWN0aXZlSG9zdCkge1xuICAgICAgZXhpc3RpbmdMaXN0ZW5lciA9IGZpbmRFeGlzdGluZ0xpc3RlbmVyKHRWaWV3LCBsVmlldywgZXZlbnROYW1lLCB0Tm9kZS5pbmRleCk7XG4gICAgfVxuICAgIGlmIChleGlzdGluZ0xpc3RlbmVyICE9PSBudWxsKSB7XG4gICAgICAvLyBBdHRhY2ggYSBuZXcgbGlzdGVuZXIgdG8gY29hbGVzY2VkIGxpc3RlbmVycyBsaXN0LCBtYWludGFpbmluZyB0aGUgb3JkZXIgaW4gd2hpY2hcbiAgICAgIC8vIGxpc3RlbmVycyBhcmUgcmVnaXN0ZXJlZC4gRm9yIHBlcmZvcm1hbmNlIHJlYXNvbnMsIHdlIGtlZXAgYSByZWZlcmVuY2UgdG8gdGhlIGxhc3RcbiAgICAgIC8vIGxpc3RlbmVyIGluIHRoYXQgbGlzdCAoaW4gYF9fbmdMYXN0TGlzdGVuZXJGbl9fYCBmaWVsZCksIHNvIHdlIGNhbiBhdm9pZCBnb2luZyB0aHJvdWdoXG4gICAgICAvLyB0aGUgZW50aXJlIHNldCBlYWNoIHRpbWUgd2UgbmVlZCB0byBhZGQgYSBuZXcgbGlzdGVuZXIuXG4gICAgICBjb25zdCBsYXN0TGlzdGVuZXJGbiA9ICg8YW55PmV4aXN0aW5nTGlzdGVuZXIpLl9fbmdMYXN0TGlzdGVuZXJGbl9fIHx8IGV4aXN0aW5nTGlzdGVuZXI7XG4gICAgICBsYXN0TGlzdGVuZXJGbi5fX25nTmV4dExpc3RlbmVyRm5fXyA9IGxpc3RlbmVyRm47XG4gICAgICAoPGFueT5leGlzdGluZ0xpc3RlbmVyKS5fX25nTGFzdExpc3RlbmVyRm5fXyA9IGxpc3RlbmVyRm47XG4gICAgICBwcm9jZXNzT3V0cHV0cyA9IGZhbHNlO1xuICAgIH0gZWxzZSB7XG4gICAgICBsaXN0ZW5lckZuID0gd3JhcExpc3RlbmVyKHROb2RlLCBsVmlldywgY29udGV4dCwgbGlzdGVuZXJGbik7XG4gICAgICBzdGFzaEV2ZW50TGlzdGVuZXIobmF0aXZlLCBldmVudE5hbWUsIGxpc3RlbmVyRm4pO1xuICAgICAgY29uc3QgY2xlYW51cEZuID0gcmVuZGVyZXIubGlzdGVuKHRhcmdldCBhcyBSRWxlbWVudCwgZXZlbnROYW1lLCBsaXN0ZW5lckZuKTtcbiAgICAgIG5nRGV2TW9kZSAmJiBuZ0Rldk1vZGUucmVuZGVyZXJBZGRFdmVudExpc3RlbmVyKys7XG5cbiAgICAgIGxDbGVhbnVwLnB1c2gobGlzdGVuZXJGbiwgY2xlYW51cEZuKTtcbiAgICAgIHRDbGVhbnVwICYmIHRDbGVhbnVwLnB1c2goZXZlbnROYW1lLCBpZHhPclRhcmdldEdldHRlciwgbENsZWFudXBJbmRleCwgbENsZWFudXBJbmRleCArIDEpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICAvLyBFdmVuIGlmIHRoZXJlIGlzIG5vIG5hdGl2ZSBsaXN0ZW5lciB0byBhZGQsIHdlIHN0aWxsIG5lZWQgdG8gd3JhcCB0aGUgbGlzdGVuZXIgc28gdGhhdCBPblB1c2hcbiAgICAvLyBhbmNlc3RvcnMgYXJlIG1hcmtlZCBkaXJ0eSB3aGVuIGFuIGV2ZW50IG9jY3Vycy5cbiAgICBsaXN0ZW5lckZuID0gd3JhcExpc3RlbmVyKHROb2RlLCBsVmlldywgY29udGV4dCwgbGlzdGVuZXJGbik7XG4gIH1cblxuICAvLyBzdWJzY3JpYmUgdG8gZGlyZWN0aXZlIG91dHB1dHNcbiAgY29uc3Qgb3V0cHV0cyA9IHROb2RlLm91dHB1dHM7XG4gIGxldCBwcm9wczogTm9kZU91dHB1dEJpbmRpbmdzW2tleW9mIE5vZGVPdXRwdXRCaW5kaW5nc10gfCB1bmRlZmluZWQ7XG4gIGlmIChwcm9jZXNzT3V0cHV0cyAmJiBvdXRwdXRzICE9PSBudWxsICYmIChwcm9wcyA9IG91dHB1dHNbZXZlbnROYW1lXSkpIHtcbiAgICBjb25zdCBwcm9wc0xlbmd0aCA9IHByb3BzLmxlbmd0aDtcbiAgICBpZiAocHJvcHNMZW5ndGgpIHtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcHJvcHNMZW5ndGg7IGkgKz0gMikge1xuICAgICAgICBjb25zdCBpbmRleCA9IHByb3BzW2ldIGFzIG51bWJlcjtcbiAgICAgICAgbmdEZXZNb2RlICYmIGFzc2VydEluZGV4SW5SYW5nZShsVmlldywgaW5kZXgpO1xuICAgICAgICBjb25zdCBtaW5pZmllZE5hbWUgPSBwcm9wc1tpICsgMV07XG4gICAgICAgIGNvbnN0IGRpcmVjdGl2ZUluc3RhbmNlID0gbFZpZXdbaW5kZXhdO1xuICAgICAgICBjb25zdCBvdXRwdXQgPSBkaXJlY3RpdmVJbnN0YW5jZVttaW5pZmllZE5hbWVdO1xuXG4gICAgICAgIGlmIChuZ0Rldk1vZGUgJiYgIWlzT3V0cHV0U3Vic2NyaWJhYmxlKG91dHB1dCkpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgQE91dHB1dCAke21pbmlmaWVkTmFtZX0gbm90IGluaXRpYWxpemVkIGluICcke2RpcmVjdGl2ZUluc3RhbmNlLmNvbnN0cnVjdG9yLm5hbWV9Jy5gLFxuICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzdWJzY3JpcHRpb24gPSAob3V0cHV0IGFzIFN1YnNjcmliYWJsZU91dHB1dDx1bmtub3duPikuc3Vic2NyaWJlKGxpc3RlbmVyRm4pO1xuICAgICAgICBjb25zdCBpZHggPSBsQ2xlYW51cC5sZW5ndGg7XG4gICAgICAgIGxDbGVhbnVwLnB1c2gobGlzdGVuZXJGbiwgc3Vic2NyaXB0aW9uKTtcbiAgICAgICAgdENsZWFudXAgJiYgdENsZWFudXAucHVzaChldmVudE5hbWUsIHROb2RlLmluZGV4LCBpZHgsIC0oaWR4ICsgMSkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBleGVjdXRlTGlzdGVuZXJXaXRoRXJyb3JIYW5kbGluZyhcbiAgbFZpZXc6IExWaWV3LFxuICBjb250ZXh0OiB7fSB8IG51bGwsXG4gIGxpc3RlbmVyRm46IChlPzogYW55KSA9PiBhbnksXG4gIGU6IGFueSxcbik6IGJvb2xlYW4ge1xuICBjb25zdCBwcmV2Q29uc3VtZXIgPSBzZXRBY3RpdmVDb25zdW1lcihudWxsKTtcbiAgdHJ5IHtcbiAgICBwcm9maWxlcihQcm9maWxlckV2ZW50Lk91dHB1dFN0YXJ0LCBjb250ZXh0LCBsaXN0ZW5lckZuKTtcbiAgICAvLyBPbmx5IGV4cGxpY2l0bHkgcmV0dXJuaW5nIGZhbHNlIGZyb20gYSBsaXN0ZW5lciBzaG91bGQgcHJldmVudERlZmF1bHRcbiAgICByZXR1cm4gbGlzdGVuZXJGbihlKSAhPT0gZmFsc2U7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgaGFuZGxlRXJyb3IobFZpZXcsIGVycm9yKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH0gZmluYWxseSB7XG4gICAgcHJvZmlsZXIoUHJvZmlsZXJFdmVudC5PdXRwdXRFbmQsIGNvbnRleHQsIGxpc3RlbmVyRm4pO1xuICAgIHNldEFjdGl2ZUNvbnN1bWVyKHByZXZDb25zdW1lcik7XG4gIH1cbn1cblxuLyoqXG4gKiBXcmFwcyBhbiBldmVudCBsaXN0ZW5lciB3aXRoIGEgZnVuY3Rpb24gdGhhdCBtYXJrcyBhbmNlc3RvcnMgZGlydHkgYW5kIHByZXZlbnRzIGRlZmF1bHQgYmVoYXZpb3IsXG4gKiBpZiBhcHBsaWNhYmxlLlxuICpcbiAqIEBwYXJhbSB0Tm9kZSBUaGUgVE5vZGUgYXNzb2NpYXRlZCB3aXRoIHRoaXMgbGlzdGVuZXJcbiAqIEBwYXJhbSBsVmlldyBUaGUgTFZpZXcgdGhhdCBjb250YWlucyB0aGlzIGxpc3RlbmVyXG4gKiBAcGFyYW0gbGlzdGVuZXJGbiBUaGUgbGlzdGVuZXIgZnVuY3Rpb24gdG8gY2FsbFxuICogQHBhcmFtIHdyYXBXaXRoUHJldmVudERlZmF1bHQgV2hldGhlciBvciBub3QgdG8gcHJldmVudCBkZWZhdWx0IGJlaGF2aW9yXG4gKiAodGhlIHByb2NlZHVyYWwgcmVuZGVyZXIgZG9lcyB0aGlzIGFscmVhZHksIHNvIGluIHRob3NlIGNhc2VzLCB3ZSBzaG91bGQgc2tpcClcbiAqL1xuZnVuY3Rpb24gd3JhcExpc3RlbmVyKFxuICB0Tm9kZTogVE5vZGUsXG4gIGxWaWV3OiBMVmlldzx7fSB8IG51bGw+LFxuICBjb250ZXh0OiB7fSB8IG51bGwsXG4gIGxpc3RlbmVyRm46IChlPzogYW55KSA9PiBhbnksXG4pOiBFdmVudExpc3RlbmVyIHtcbiAgLy8gTm90ZTogd2UgYXJlIHBlcmZvcm1pbmcgbW9zdCBvZiB0aGUgd29yayBpbiB0aGUgbGlzdGVuZXIgZnVuY3Rpb24gaXRzZWxmXG4gIC8vIHRvIG9wdGltaXplIGxpc3RlbmVyIHJlZ2lzdHJhdGlvbi5cbiAgcmV0dXJuIGZ1bmN0aW9uIHdyYXBMaXN0ZW5lckluX21hcmtEaXJ0eUFuZFByZXZlbnREZWZhdWx0KGU6IGFueSkge1xuICAgIC8vIEl2eSB1c2VzIGBGdW5jdGlvbmAgYXMgYSBzcGVjaWFsIHRva2VuIHRoYXQgYWxsb3dzIHVzIHRvIHVud3JhcCB0aGUgZnVuY3Rpb25cbiAgICAvLyBzbyB0aGF0IGl0IGNhbiBiZSBpbnZva2VkIHByb2dyYW1tYXRpY2FsbHkgYnkgYERlYnVnTm9kZS50cmlnZ2VyRXZlbnRIYW5kbGVyYC5cbiAgICBpZiAoZSA9PT0gRnVuY3Rpb24pIHtcbiAgICAgIHJldHVybiBsaXN0ZW5lckZuO1xuICAgIH1cblxuICAgIC8vIEluIG9yZGVyIHRvIGJlIGJhY2t3YXJkcyBjb21wYXRpYmxlIHdpdGggVmlldyBFbmdpbmUsIGV2ZW50cyBvbiBjb21wb25lbnQgaG9zdCBub2Rlc1xuICAgIC8vIG11c3QgYWxzbyBtYXJrIHRoZSBjb21wb25lbnQgdmlldyBpdHNlbGYgZGlydHkgKGkuZS4gdGhlIHZpZXcgdGhhdCBpdCBvd25zKS5cbiAgICBjb25zdCBzdGFydFZpZXcgPVxuICAgICAgdE5vZGUuY29tcG9uZW50T2Zmc2V0ID4gLTEgPyBnZXRDb21wb25lbnRMVmlld0J5SW5kZXgodE5vZGUuaW5kZXgsIGxWaWV3KSA6IGxWaWV3O1xuICAgIG1hcmtWaWV3RGlydHkoc3RhcnRWaWV3LCBOb3RpZmljYXRpb25Tb3VyY2UuTGlzdGVuZXIpO1xuXG4gICAgbGV0IHJlc3VsdCA9IGV4ZWN1dGVMaXN0ZW5lcldpdGhFcnJvckhhbmRsaW5nKGxWaWV3LCBjb250ZXh0LCBsaXN0ZW5lckZuLCBlKTtcbiAgICAvLyBBIGp1c3QtaW52b2tlZCBsaXN0ZW5lciBmdW5jdGlvbiBtaWdodCBoYXZlIGNvYWxlc2NlZCBsaXN0ZW5lcnMgc28gd2UgbmVlZCB0byBjaGVjayBmb3JcbiAgICAvLyB0aGVpciBwcmVzZW5jZSBhbmQgaW52b2tlIGFzIG5lZWRlZC5cbiAgICBsZXQgbmV4dExpc3RlbmVyRm4gPSAoPGFueT53cmFwTGlzdGVuZXJJbl9tYXJrRGlydHlBbmRQcmV2ZW50RGVmYXVsdCkuX19uZ05leHRMaXN0ZW5lckZuX187XG4gICAgd2hpbGUgKG5leHRMaXN0ZW5lckZuKSB7XG4gICAgICAvLyBXZSBzaG91bGQgcHJldmVudCBkZWZhdWx0IGlmIGFueSBvZiB0aGUgbGlzdGVuZXJzIGV4cGxpY2l0bHkgcmV0dXJuIGZhbHNlXG4gICAgICByZXN1bHQgPSBleGVjdXRlTGlzdGVuZXJXaXRoRXJyb3JIYW5kbGluZyhsVmlldywgY29udGV4dCwgbmV4dExpc3RlbmVyRm4sIGUpICYmIHJlc3VsdDtcbiAgICAgIG5leHRMaXN0ZW5lckZuID0gKDxhbnk+bmV4dExpc3RlbmVyRm4pLl9fbmdOZXh0TGlzdGVuZXJGbl9fO1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG59XG5cbi8qKiBEZXNjcmliZXMgYSBzdWJzY3JpYmFibGUgb3V0cHV0IGZpZWxkIHZhbHVlLiAqL1xuaW50ZXJmYWNlIFN1YnNjcmliYWJsZU91dHB1dDxUPiB7XG4gIHN1YnNjcmliZShsaXN0ZW5lcjogKHY6IFQpID0+IHZvaWQpOiB7dW5zdWJzY3JpYmU6ICgpID0+IHZvaWR9O1xufVxuXG4vKipcbiAqIFdoZXRoZXIgdGhlIGdpdmVuIHZhbHVlIHJlcHJlc2VudHMgYSBzdWJzY3JpYmFibGUgb3V0cHV0LlxuICpcbiAqIEZvciBleGFtcGxlLCBhbiBgRXZlbnRFbWl0dGVyLCBhIGBTdWJqZWN0YCwgYW4gYE9ic2VydmFibGVgIG9yIGFuXG4gKiBgT3V0cHV0RW1pdHRlcmAuXG4gKi9cbmZ1bmN0aW9uIGlzT3V0cHV0U3Vic2NyaWJhYmxlKHZhbHVlOiB1bmtub3duKTogdmFsdWUgaXMgU3Vic2NyaWJhYmxlT3V0cHV0PHVua25vd24+IHtcbiAgcmV0dXJuIChcbiAgICB2YWx1ZSAhPSBudWxsICYmIHR5cGVvZiAodmFsdWUgYXMgUGFydGlhbDxTdWJzY3JpYmFibGVPdXRwdXQ8dW5rbm93bj4+KS5zdWJzY3JpYmUgPT09ICdmdW5jdGlvbidcbiAgKTtcbn1cbiJdfQ==