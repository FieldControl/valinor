/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * @fileoverview Implements the local event handling contract. This
 * allows DOM objects in a container that enters into this contract to
 * define event handlers which are executed in a local context.
 *
 * One EventContract instance can manage the contract for multiple
 * containers, which are added using the addContainer() method.
 *
 * Events can be registered using the addEvent() method.
 *
 * A Dispatcher is added using the registerDispatcher() method. Until there is
 * a dispatcher, events are queued. The idea is that the EventContract
 * class is inlined in the HTML of the top level page and instantiated
 * right after the start of <body>. The Dispatcher class is contained
 * in the external deferred js, and instantiated and registered with
 * EventContract when the external javascript in the page loads. The
 * external javascript will also register the jsaction handlers, which
 * then pick up the queued events at the time of registration.
 *
 * Since this class is meant to be inlined in the main page HTML, the
 * size of the binary compiled from this file MUST be kept as small as
 * possible and thus its dependencies to a minimum.
 */
import { removeAllEventListeners, } from './earlyeventcontract';
import * as eventLib from './event';
import { MOUSE_SPECIAL_SUPPORT } from './event_contract_defines';
import * as eventInfoLib from './event_info';
import { MOUSE_SPECIAL_EVENT_TYPES } from './event_type';
/**
 * EventContract intercepts events in the bubbling phase at the
 * boundary of a container element, and maps them to generic actions
 * which are specified using the custom jsaction attribute in
 * HTML. Behavior of the application is then specified in terms of
 * handler for such actions, cf. jsaction.Dispatcher in dispatcher.js.
 *
 * This has several benefits: (1) No DOM event handlers need to be
 * registered on the specific elements in the UI. (2) The set of
 * events that the application has to handle can be specified in terms
 * of the semantics of the application, rather than in terms of DOM
 * events. (3) Invocation of handlers can be delayed and handlers can
 * be delay loaded in a generic way.
 */
export class EventContract {
    static { this.MOUSE_SPECIAL_SUPPORT = MOUSE_SPECIAL_SUPPORT; }
    constructor(containerManager) {
        /**
         * The DOM events which this contract covers. Used to prevent double
         * registration of event types. The value of the map is the
         * internally created DOM event handler function that handles the
         * DOM events. See addEvent().
         *
         */
        this.eventHandlers = {};
        this.browserEventTypeToExtraEventTypes = {};
        /**
         * The dispatcher function. Events are passed to this function for
         * handling once it was set using the registerDispatcher() method. This is
         * done because the function is passed from another jsbinary, so passing the
         * instance and invoking the method here would require to leave the method
         * unobfuscated.
         */
        this.dispatcher = null;
        /**
         * The list of suspended `EventInfo` that will be dispatched
         * as soon as the `Dispatcher` is registered.
         */
        this.queuedEventInfos = [];
        this.containerManager = containerManager;
    }
    handleEvent(eventType, event, container) {
        const eventInfo = eventInfoLib.createEventInfoFromParameters(
        /* eventType= */ eventType, 
        /* event= */ event, 
        /* targetElement= */ event.target, 
        /* container= */ container, 
        /* timestamp= */ Date.now());
        this.handleEventInfo(eventInfo);
    }
    /**
     * Handle an `EventInfo`.
     */
    handleEventInfo(eventInfo) {
        if (!this.dispatcher) {
            // All events are queued when the dispatcher isn't yet loaded.
            eventInfoLib.setIsReplay(eventInfo, true);
            this.queuedEventInfos?.push(eventInfo);
            return;
        }
        this.dispatcher(eventInfo);
    }
    /**
     * Enables jsaction handlers to be called for the event type given by
     * name.
     *
     * If the event is already registered, this does nothing.
     *
     * @param prefixedEventType If supplied, this event is used in
     *     the actual browser event registration instead of the name that is
     *     exposed to jsaction. Use this if you e.g. want users to be able
     *     to subscribe to jsaction="transitionEnd:foo" while the underlying
     *     event is webkitTransitionEnd in one browser and mozTransitionEnd
     *     in another.
     */
    addEvent(eventType, prefixedEventType) {
        if (eventType in this.eventHandlers || !this.containerManager) {
            return;
        }
        if (!EventContract.MOUSE_SPECIAL_SUPPORT && MOUSE_SPECIAL_EVENT_TYPES.indexOf(eventType) >= 0) {
            return;
        }
        const eventHandler = (eventType, event, container) => {
            this.handleEvent(eventType, event, container);
        };
        // Store the callback to allow us to replay events.
        this.eventHandlers[eventType] = eventHandler;
        const browserEventType = eventLib.getBrowserEventType(prefixedEventType || eventType);
        if (browserEventType !== eventType) {
            const eventTypes = this.browserEventTypeToExtraEventTypes[browserEventType] || [];
            eventTypes.push(eventType);
            this.browserEventTypeToExtraEventTypes[browserEventType] = eventTypes;
        }
        this.containerManager.addEventListener(browserEventType, (element) => {
            return (event) => {
                eventHandler(eventType, event, element);
            };
        });
    }
    /**
     * Gets the queued early events and replay them using the appropriate handler
     * in the provided event contract. Once all the events are replayed, it cleans
     * up the early contract.
     */
    replayEarlyEvents(earlyJsactionData = window._ejsa) {
        // Check if the early contract is present and prevent calling this function
        // more than once.
        if (!earlyJsactionData) {
            return;
        }
        // Replay the early contract events.
        this.replayEarlyEventInfos(earlyJsactionData.q);
        // Clean up the early contract.
        removeAllEventListeners(earlyJsactionData);
        delete window._ejsa;
    }
    /**
     * Replays all the early `EventInfo` objects, dispatching them through the normal
     * `EventContract` flow.
     */
    replayEarlyEventInfos(earlyEventInfos) {
        for (let i = 0; i < earlyEventInfos.length; i++) {
            const earlyEventInfo = earlyEventInfos[i];
            const eventTypes = this.getEventTypesForBrowserEventType(earlyEventInfo.eventType);
            for (let j = 0; j < eventTypes.length; j++) {
                const eventInfo = eventInfoLib.cloneEventInfo(earlyEventInfo);
                // EventInfo eventType maps to JSAction's internal event type,
                // rather than the browser event type.
                eventInfoLib.setEventType(eventInfo, eventTypes[j]);
                this.handleEventInfo(eventInfo);
            }
        }
    }
    /**
     * Returns all JSAction event types that have been registered for a given
     * browser event type.
     */
    getEventTypesForBrowserEventType(browserEventType) {
        const eventTypes = [];
        if (this.eventHandlers[browserEventType]) {
            eventTypes.push(browserEventType);
        }
        if (this.browserEventTypeToExtraEventTypes[browserEventType]) {
            eventTypes.push(...this.browserEventTypeToExtraEventTypes[browserEventType]);
        }
        return eventTypes;
    }
    /**
     * Returns the event handler function for a given event type.
     */
    handler(eventType) {
        return this.eventHandlers[eventType];
    }
    /**
     * Cleans up the event contract. This resets all of the `EventContract`'s
     * internal state. Users are responsible for not using this `EventContract`
     * after it has been cleaned up.
     */
    cleanUp() {
        this.containerManager.cleanUp();
        this.containerManager = null;
        this.eventHandlers = {};
        this.browserEventTypeToExtraEventTypes = {};
        this.dispatcher = null;
        this.queuedEventInfos = [];
    }
    /**
     * Register a dispatcher function. Event info of each event mapped to
     * a jsaction is passed for handling to this callback. The queued
     * events are passed as well to the dispatcher for later replaying
     * once the dispatcher is registered. Clears the event queue to null.
     *
     * @param dispatcher The dispatcher function.
     * @param restriction
     */
    registerDispatcher(dispatcher, restriction) {
        this.ecrd(dispatcher, restriction);
    }
    /**
     * Unrenamed alias for registerDispatcher. Necessary for any codebases that
     * split the `EventContract` and `Dispatcher` code into different compilation
     * units.
     */
    ecrd(dispatcher, restriction) {
        this.dispatcher = dispatcher;
        if (this.queuedEventInfos?.length) {
            for (let i = 0; i < this.queuedEventInfos.length; i++) {
                this.handleEventInfo(this.queuedEventInfos[i]);
            }
            this.queuedEventInfos = null;
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnRjb250cmFjdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvcHJpbWl0aXZlcy9ldmVudC1kaXNwYXRjaC9zcmMvZXZlbnRjb250cmFjdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXNCRztBQUVILE9BQU8sRUFHTCx1QkFBdUIsR0FDeEIsTUFBTSxzQkFBc0IsQ0FBQztBQUM5QixPQUFPLEtBQUssUUFBUSxNQUFNLFNBQVMsQ0FBQztBQUVwQyxPQUFPLEVBQUMscUJBQXFCLEVBQUMsTUFBTSwwQkFBMEIsQ0FBQztBQUMvRCxPQUFPLEtBQUssWUFBWSxNQUFNLGNBQWMsQ0FBQztBQUM3QyxPQUFPLEVBQUMseUJBQXlCLEVBQUMsTUFBTSxjQUFjLENBQUM7QUF5QnZEOzs7Ozs7Ozs7Ozs7O0dBYUc7QUFDSCxNQUFNLE9BQU8sYUFBYTthQUNqQiwwQkFBcUIsR0FBRyxxQkFBcUIsQUFBeEIsQ0FBeUI7SUE4QnJELFlBQVksZ0JBQStDO1FBMUIzRDs7Ozs7O1dBTUc7UUFDSyxrQkFBYSxHQUFrQyxFQUFFLENBQUM7UUFFbEQsc0NBQWlDLEdBQThCLEVBQUUsQ0FBQztRQUUxRTs7Ozs7O1dBTUc7UUFDSyxlQUFVLEdBQXNCLElBQUksQ0FBQztRQUU3Qzs7O1dBR0c7UUFDSyxxQkFBZ0IsR0FBb0MsRUFBRSxDQUFDO1FBRzdELElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxnQkFBZ0IsQ0FBQztJQUMzQyxDQUFDO0lBRU8sV0FBVyxDQUFDLFNBQWlCLEVBQUUsS0FBWSxFQUFFLFNBQWtCO1FBQ3JFLE1BQU0sU0FBUyxHQUFHLFlBQVksQ0FBQyw2QkFBNkI7UUFDMUQsZ0JBQWdCLENBQUMsU0FBUztRQUMxQixZQUFZLENBQUMsS0FBSztRQUNsQixvQkFBb0IsQ0FBQyxLQUFLLENBQUMsTUFBaUI7UUFDNUMs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UUFDN0IsSUFBSSxDQUFDLGFBQWEsR0FBRyxFQUFFLENBQUM7UUFDeEIsSUFBSSxDQUFDLGlDQUFpQyxHQUFHLEVBQUUsQ0FBQztRQUM1QyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztRQUN2QixJQUFJLENBQUMsZ0JBQWdCLEdBQUcsRUFBRSxDQUFDO0lBQzdCLENBQUM7SUFFRDs7Ozs7Ozs7T0FRRztJQUNILGtCQUFrQixDQUFDLFVBQXNCLEVBQUUsV0FBd0I7UUFDakUsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFDckMsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxJQUFJLENBQUMsVUFBc0IsRUFBRSxXQUF3QjtRQUNuRCxJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztRQUU3QixJQUFJLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxNQUFNLEVBQUUsQ0FBQztZQUNsQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO2dCQUN0RCxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2pELENBQUM7WUFDRCxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDO1FBQy9CLENBQUM7SUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuZGV2L2xpY2Vuc2VcbiAqL1xuXG4vKipcbiAqIEBmaWxlb3ZlcnZpZXcgSW1wbGVtZW50cyB0aGUgbG9jYWwgZXZlbnQgaGFuZGxpbmcgY29udHJhY3QuIFRoaXNcbiAqIGFsbG93cyBET00gb2JqZWN0cyBpbiBhIGNvbnRhaW5lciB0aGF0IGVudGVycyBpbnRvIHRoaXMgY29udHJhY3QgdG9cbiAqIGRlZmluZSBldmVudCBoYW5kbGVycyB3aGljaCBhcmUgZXhlY3V0ZWQgaW4gYSBsb2NhbCBjb250ZXh0LlxuICpcbiAqIE9uZSBFdmVudENvbnRyYWN0IGluc3RhbmNlIGNhbiBtYW5hZ2UgdGhlIGNvbnRyYWN0IGZvciBtdWx0aXBsZVxuICogY29udGFpbmVycywgd2hpY2ggYXJlIGFkZGVkIHVzaW5nIHRoZSBhZGRDb250YWluZXIoKSBtZXRob2QuXG4gKlxuICogRXZlbnRzIGNhbiBiZSByZWdpc3RlcmVkIHVzaW5nIHRoZSBhZGRFdmVudCgpIG1ldGhvZC5cbiAqXG4gKiBBIERpc3BhdGNoZXIgaXMgYWRkZWQgdXNpbmcgdGhlIHJlZ2lzdGVyRGlzcGF0Y2hlcigpIG1ldGhvZC4gVW50aWwgdGhlcmUgaXNcbiAqIGEgZGlzcGF0Y2hlciwgZXZlbnRzIGFyZSBxdWV1ZWQuIFRoZSBpZGVhIGlzIHRoYXQgdGhlIEV2ZW50Q29udHJhY3RcbiAqIGNsYXNzIGlzIGlubGluZWQgaW4gdGhlIEhUTUwgb2YgdGhlIHRvcCBsZXZlbCBwYWdlIGFuZCBpbnN0YW50aWF0ZWRcbiAqIHJpZ2h0IGFmdGVyIHRoZSBzdGFydCBvZiA8Ym9keT4uIFRoZSBEaXNwYXRjaGVyIGNsYXNzIGlzIGNvbnRhaW5lZFxuICogaW4gdGhlIGV4dGVybmFsIGRlZmVycmVkIGpzLCBhbmQgaW5zdGFudGlhdGVkIGFuZCByZWdpc3RlcmVkIHdpdGhcbiAqIEV2ZW50Q29udHJhY3Qgd2hlbiB0aGUgZXh0ZXJuYWwgamF2YXNjcmlwdCBpbiB0aGUgcGFnZSBsb2Fkcy4gVGhlXG4gKiBleHRlcm5hbCBqYXZhc2NyaXB0IHdpbGwgYWxzbyByZWdpc3RlciB0aGUganNhY3Rpb24gaGFuZGxlcnMsIHdoaWNoXG4gKiB0aGVuIHBpY2sgdXAgdGhlIHF1ZXVlZCBldmVudHMgYXQgdGhlIHRpbWUgb2YgcmVnaXN0cmF0aW9uLlxuICpcbiAqIFNpbmNlIHRoaXMgY2xhc3MgaXMgbWVhbnQgdG8gYmUgaW5saW5lZCBpbiB0aGUgbWFpbiBwYWdlIEhUTUwsIHRoZVxuICogc2l6ZSBvZiB0aGUgYmluYXJ5IGNvbXBpbGVkIGZyb20gdGhpcyBmaWxlIE1VU1QgYmUga2VwdCBhcyBzbWFsbCBhc1xuICogcG9zc2libGUgYW5kIHRodXMgaXRzIGRlcGVuZGVuY2llcyB0byBhIG1pbmltdW0uXG4gKi9cblxuaW1wb3J0IHtcbiAgRWFybHlKc2FjdGlvbkRhdGEsXG4gIEVhcmx5SnNhY3Rpb25EYXRhQ29udGFpbmVyLFxuICByZW1vdmVBbGxFdmVudExpc3RlbmVycyxcbn0gZnJvbSAnLi9lYXJseWV2ZW50Y29udHJhY3QnO1xuaW1wb3J0ICogYXMgZXZlbnRMaWIgZnJvbSAnLi9ldmVudCc7XG5pbXBvcnQge0V2ZW50Q29udHJhY3RDb250YWluZXJNYW5hZ2VyfSBmcm9tICcuL2V2ZW50X2NvbnRyYWN0X2NvbnRhaW5lcic7XG5pbXBvcnQge01PVVNFX1NQRUNJQUxfU1VQUE9SVH0gZnJvbSAnLi9ldmVudF9jb250cmFjdF9kZWZpbmVzJztcbmltcG9ydCAqIGFzIGV2ZW50SW5mb0xpYiBmcm9tICcuL2V2ZW50X2luZm8nO1xuaW1wb3J0IHtNT1VTRV9TUEVDSUFMX0VWRU5UX1RZUEVTfSBmcm9tICcuL2V2ZW50X3R5cGUnO1xuaW1wb3J0IHtSZXN0cmljdGlvbn0gZnJvbSAnLi9yZXN0cmljdGlvbic7XG5cbi8qKlxuICogVGhlIEFQSSBvZiBhbiBFdmVudENvbnRyYWN0IHRoYXQgaXMgc2FmZSB0byBjYWxsIGZyb20gYW55IGNvbXBpbGF0aW9uIHVuaXQuXG4gKi9cbmV4cG9ydCBkZWNsYXJlIGludGVyZmFjZSBVbnJlbmFtZWRFdmVudENvbnRyYWN0IHtcbiAgLy8gQWxpYXMgZm9yIEpzY3Rpb24gRXZlbnRDb250cmFjdCByZWdpc3RlckRpc3BhdGNoZXIuXG4gIGVjcmQoZGlzcGF0Y2hlcjogRGlzcGF0Y2hlciwgcmVzdHJpY3Rpb246IFJlc3RyaWN0aW9uKTogdm9pZDtcbn1cblxuLyoqIEEgZnVuY3Rpb24gdGhhdCBpcyBjYWxsZWQgdG8gaGFuZGxlIGV2ZW50cyBjYXB0dXJlZCBieSB0aGUgRXZlbnRDb250cmFjdC4gKi9cbmV4cG9ydCB0eXBlIERpc3BhdGNoZXIgPSAoZXZlbnRJbmZvOiBldmVudEluZm9MaWIuRXZlbnRJbmZvLCBnbG9iYWxEaXNwYXRjaD86IGJvb2xlYW4pID0+IHZvaWQ7XG5cbi8qKlxuICogQSBmdW5jdGlvbiB0aGF0IGhhbmRsZXMgYW4gZXZlbnQgZGlzcGF0Y2hlZCBmcm9tIHRoZSBicm93c2VyLlxuICpcbiAqIGV2ZW50VHlwZTogTWF5IGRpZmZlciBmcm9tIGBldmVudC50eXBlYCBpZiBKU0FjdGlvbiB1c2VzIGFcbiAqIHNob3J0LWhhbmQgbmFtZSBvciBpcyBwYXRjaGluZyBvdmVyIGFuIG5vbi1idWJibGluZyBldmVudCB3aXRoIGEgYnViYmxpbmdcbiAqIHZhcmlhbnQuXG4gKiBldmVudDogVGhlIG5hdGl2ZSBicm93c2VyIGV2ZW50LlxuICogY29udGFpbmVyOiBUaGUgY29udGFpbmVyIGZvciB0aGlzIGRpc3BhdGNoLlxuICovXG50eXBlIEV2ZW50SGFuZGxlciA9IChldmVudFR5cGU6IHN0cmluZywgZXZlbnQ6IEV2ZW50LCBjb250YWluZXI6IEVsZW1lbnQpID0+IHZvaWQ7XG5cbi8qKlxuICogRXZlbnRDb250cmFjdCBpbnRlcmNlcHRzIGV2ZW50cyBpbiB0aGUgYnViYmxpbmcgcGhhc2UgYXQgdGhlXG4gKiBib3VuZGFyeSBvZiBhIGNvbnRhaW5lciBlbGVtZW50LCBhbmQgbWFwcyB0aGVtIHRvIGdlbmVyaWMgYWN0aW9uc1xuICogd2hpY2ggYXJlIHNwZWNpZmllZCB1c2luZyB0aGUgY3VzdG9tIGpzYWN0aW9uIGF0dHJpYnV0ZSBpblxuICogSFRNTC4gQmVoYXZpb3Igb2YgdGhlIGFwcGxpY2F0aW9uIGlzIHRoZW4gc3BlY2lmaWVkIGluIHRlcm1zIG9mXG4gKiBoYW5kbGVyIGZvciBzdWNoIGFjdGlvbnMsIGNmLiBqc2FjdGlvbi5EaXNwYXRjaGVyIGluIGRpc3BhdGNoZXIuanMuXG4gKlxuICogVGhpcyBoYXMgc2V2ZXJhbCBiZW5lZml0czogKDEpIE5vIERPTSBldmVudCBoYW5kbGVycyBuZWVkIHRvIGJlXG4gKiByZWdpc3RlcmVkIG9uIHRoZSBzcGVjaWZpYyBlbGVtZW50cyBpbiB0aGUgVUkuICgyKSBUaGUgc2V0IG9mXG4gKiBldmVudHMgdGhhdCB0aGUgYXBwbGljYXRpb24gaGFzIHRvIGhhbmRsZSBjYW4gYmUgc3BlY2lmaWVkIGluIHRlcm1zXG4gKiBvZiB0aGUgc2VtYW50aWNzIG9mIHRoZSBhcHBsaWNhdGlvbiwgcmF0aGVyIHRoYW4gaW4gdGVybXMgb2YgRE9NXG4gKiBldmVudHMuICgzKSBJbnZvY2F0aW9uIG9mIGhhbmRsZXJzIGNhbiBiZSBkZWxheWVkIGFuZCBoYW5kbGVycyBjYW5cbiAqIGJlIGRlbGF5IGxvYWRlZCBpbiBhIGdlbmVyaWMgd2F5LlxuICovXG5leHBvcnQgY2xhc3MgRXZlbnRDb250cmFjdCBpbXBsZW1lbnRzIFVucmVuYW1lZEV2ZW50Q29udHJhY3Qge1xuICBzdGF0aWMgTU9VU0VfU1BFQ0lBTF9TVVBQT1JUID0gTU9VU0VfU1BFQ0lBTF9TVVBQT1JUO1xuXG4gIHByaXZhdGUgY29udGFpbmVyTWFuYWdlcjogRXZlbnRDb250cmFjdENvbnRhaW5lck1hbmFnZXIgfCBudWxsO1xuXG4gIC8qKlxuICAgKiBUaGUgRE9NIGV2ZW50cyB3aGljaCB0aGlzIGNvbnRyYWN0IGNvdmVycy4gVXNlZCB0byBwcmV2ZW50IGRvdWJsZVxuICAgKiByZWdpc3RyYXRpb24gb2YgZXZlbnQgdHlwZXMuIFRoZSB2YWx1ZSBvZiB0aGUgbWFwIGlzIHRoZVxuICAgKiBpbnRlcm5hbGx5IGNyZWF0ZWQgRE9NIGV2ZW50IGhhbmRsZXIgZnVuY3Rpb24gdGhhdCBoYW5kbGVzIHRoZVxuICAgKiBET00gZXZlbnRzLiBTZWUgYWRkRXZlbnQoKS5cbiAgICpcbiAgICovXG4gIHByaXZhdGUgZXZlbnRIYW5kbGVyczoge1trZXk6IHN0cmluZ106IEV2ZW50SGFuZGxlcn0gPSB7fTtcblxuICBwcml2YXRlIGJyb3dzZXJFdmVudFR5cGVUb0V4dHJhRXZlbnRUeXBlczoge1trZXk6IHN0cmluZ106IHN0cmluZ1tdfSA9IHt9O1xuXG4gIC8qKlxuICAgKiBUaGUgZGlzcGF0Y2hlciBmdW5jdGlvbi4gRXZlbnRzIGFyZSBwYXNzZWQgdG8gdGhpcyBmdW5jdGlvbiBmb3JcbiAgICogaGFuZGxpbmcgb25jZSBpdCB3YXMgc2V0IHVzaW5nIHRoZSByZWdpc3RlckRpc3BhdGNoZXIoKSBtZXRob2QuIFRoaXMgaXNcbiAgICogZG9uZSBiZWNhdXNlIHRoZSBmdW5jdGlvbiBpcyBwYXNzZWQgZnJvbSBhbm90aGVyIGpzYmluYXJ5LCBzbyBwYXNzaW5nIHRoZVxuICAgKiBpbnN0YW5jZSBhbmQgaW52b2tpbmcgdGhlIG1ldGhvZCBoZXJlIHdvdWxkIHJlcXVpcmUgdG8gbGVhdmUgdGhlIG1ldGhvZFxuICAgKiB1bm9iZnVzY2F0ZWQuXG4gICAqL1xuICBwcml2YXRlIGRpc3BhdGNoZXI6IERpc3BhdGNoZXIgfCBudWxsID0gbnVsbDtcblxuICAvKipcbiAgICogVGhlIGxpc3Qgb2Ygc3VzcGVuZGVkIGBFdmVudEluZm9gIHRoYXQgd2lsbCBiZSBkaXNwYXRjaGVkXG4gICAqIGFzIHNvb24gYXMgdGhlIGBEaXNwYXRjaGVyYCBpcyByZWdpc3RlcmVkLlxuICAgKi9cbiAgcHJpdmF0ZSBxdWV1ZWRFdmVudEluZm9zOiBldmVudEluZm9MaWIuRXZlbnRJbmZvW10gfCBudWxsID0gW107XG5cbiAgY29uc3RydWN0b3IoY29udGFpbmVyTWFuYWdlcjogRXZlbnRDb250cmFjdENvbnRhaW5lck1hbmFnZXIpIHtcbiAgICB0aGlzLmNvbnRhaW5lck1hbmFnZXIgPSBjb250YWluZXJNYW5hZ2VyO1xuICB9XG5cbiAgcHJpdmF0ZSBoYW5kbGVFdmVudChldmVudFR5cGU6IHN0cmluZywgZXZlbnQ6IEV2ZW50LCBjb250YWluZXI6IEVsZW1lbnQpIHtcbiAgICBjb25zdCBldmVudEluZm8gPSBldmVudEluZm9MaWIuY3JlYXRlRXZlbnRJbmZvRnJvbVBhcmFtZXRlcnMoXG4gICAgICAvKiBldmVudFR5cGU9ICovIGV2ZW50VHlwZSxcbiAgICAgIC8qIGV2ZW50PSAqLyBldmVudCxcbiAgICAgIC8qIHRhcmdldEVsZW1lbnQ9ICovIGV2ZW50LnRhcmdldCBhcyBFbGVtZW50LFxuICAgICAgLyogY29udGFpbmVyPSAqLyBjb250YWluZXIsXG4gICAgICAvKiB0aW1lc3RhbXA9ICovIERhdGUubm93KCksXG4gICAgKTtcbiAgICB0aGlzLmhhbmRsZUV2ZW50SW5mbyhldmVudEluZm8pO1xuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZSBhbiBgRXZlbnRJbmZvYC5cbiAgICovXG4gIHByaXZhdGUgaGFuZGxlRXZlbnRJbmZvKGV2ZW50SW5mbzogZXZlbnRJbmZvTGliLkV2ZW50SW5mbykge1xuICAgIGlmICghdGhpcy5kaXNwYXRjaGVyKSB7XG4gICAgICAvLyBBbGwgZXZlbnRzIGFyZSBxdWV1ZWQgd2hlbiB0aGUgZGlzcGF0Y2hlciBpc24ndCB5ZXQgbG9hZGVkLlxuICAgICAgZXZlbnRJbmZvTGliLnNldElzUmVwbGF5KGV2ZW50SW5mbywgdHJ1ZSk7XG4gICAgICB0aGlzLnF1ZXVlZEV2ZW50SW5mb3M/LnB1c2goZXZlbnRJbmZvKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5kaXNwYXRjaGVyKGV2ZW50SW5mbyk7XG4gIH1cblxuICAvKipcbiAgICogRW5hYmxlcyBqc2FjdGlvbiBoYW5kbGVycyB0byBiZSBjYWxsZWQgZm9yIHRoZSBldmVudCB0eXBlIGdpdmVuIGJ5XG4gICAqIG5hbWUuXG4gICAqXG4gICAqIElmIHRoZSBldmVudCBpcyBhbHJlYWR5IHJlZ2lzdGVyZWQsIHRoaXMgZG9lcyBub3RoaW5nLlxuICAgKlxuICAgKiBAcGFyYW0gcHJlZml4ZWRFdmVudFR5cGUgSWYgc3VwcGxpZWQsIHRoaXMgZXZlbnQgaXMgdXNlZCBpblxuICAgKiAgICAgdGhlIGFjdHVhbCBicm93c2VyIGV2ZW50IHJlZ2lzdHJhdGlvbiBpbnN0ZWFkIG9mIHRoZSBuYW1lIHRoYXQgaXNcbiAgICogICAgIGV4cG9zZWQgdG8ganNhY3Rpb24uIFVzZSB0aGlzIGlmIHlvdSBlLmcuIHdhbnQgdXNlcnMgdG8gYmUgYWJsZVxuICAgKiAgICAgdG8gc3Vic2NyaWJlIHRvIGpzYWN0aW9uPVwidHJhbnNpdGlvbkVuZDpmb29cIiB3aGlsZSB0aGUgdW5kZXJseWluZ1xuICAgKiAgICAgZXZlbnQgaXMgd2Via2l0VHJhbnNpdGlvbkVuZCBpbiBvbmUgYnJvd3NlciBhbmQgbW96VHJhbnNpdGlvbkVuZFxuICAgKiAgICAgaW4gYW5vdGhlci5cbiAgICovXG4gIGFkZEV2ZW50KGV2ZW50VHlwZTogc3RyaW5nLCBwcmVmaXhlZEV2ZW50VHlwZT86IHN0cmluZykge1xuICAgIGlmIChldmVudFR5cGUgaW4gdGhpcy5ldmVudEhhbmRsZXJzIHx8ICF0aGlzLmNvbnRhaW5lck1hbmFnZXIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoIUV2ZW50Q29udHJhY3QuTU9VU0VfU1BFQ0lBTF9TVVBQT1JUICYmIE1PVVNFX1NQRUNJQUxfRVZFTlRfVFlQRVMuaW5kZXhPZihldmVudFR5cGUpID49IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBldmVudEhhbmRsZXIgPSAoZXZlbnRUeXBlOiBzdHJpbmcsIGV2ZW50OiBFdmVudCwgY29udGFpbmVyOiBFbGVtZW50KSA9PiB7XG4gICAgICB0aGlzLmhhbmRsZUV2ZW50KGV2ZW50VHlwZSwgZXZlbnQsIGNvbnRhaW5lcik7XG4gICAgfTtcblxuICAgIC8vIFN0b3JlIHRoZSBjYWxsYmFjayB0byBhbGxvdyB1cyB0byByZXBsYXkgZXZlbnRzLlxuICAgIHRoaXMuZXZlbnRIYW5kbGVyc1tldmVudFR5cGVdID0gZXZlbnRIYW5kbGVyO1xuXG4gICAgY29uc3QgYnJvd3NlckV2ZW50VHlwZSA9IGV2ZW50TGliLmdldEJyb3dzZXJFdmVudFR5cGUocHJlZml4ZWRFdmVudFR5cGUgfHwgZXZlbnRUeXBlKTtcblxuICAgIGlmIChicm93c2VyRXZlbnRUeXBlICE9PSBldmVudFR5cGUpIHtcbiAgICAgIGNvbnN0IGV2ZW50VHlwZXMgPSB0aGlzLmJyb3dzZXJFdmVudFR5cGVUb0V4dHJhRXZlbnRUeXBlc1ticm93c2VyRXZlbnRUeXBlXSB8fCBbXTtcbiAgICAgIGV2ZW50VHlwZXMucHVzaChldmVudFR5cGUpO1xuICAgICAgdGhpcy5icm93c2VyRXZlbnRUeXBlVG9FeHRyYUV2ZW50VHlwZXNbYnJvd3NlckV2ZW50VHlwZV0gPSBldmVudFR5cGVzO1xuICAgIH1cblxuICAgIHRoaXMuY29udGFpbmVyTWFuYWdlci5hZGRFdmVudExpc3RlbmVyKGJyb3dzZXJFdmVudFR5cGUsIChlbGVtZW50OiBFbGVtZW50KSA9PiB7XG4gICAgICByZXR1cm4gKGV2ZW50OiBFdmVudCkgPT4ge1xuICAgICAgICBldmVudEhhbmRsZXIoZXZlbnRUeXBlLCBldmVudCwgZWxlbWVudCk7XG4gICAgICB9O1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIHF1ZXVlZCBlYXJseSBldmVudHMgYW5kIHJlcGxheSB0aGVtIHVzaW5nIHRoZSBhcHByb3ByaWF0ZSBoYW5kbGVyXG4gICAqIGluIHRoZSBwcm92aWRlZCBldmVudCBjb250cmFjdC4gT25jZSBhbGwgdGhlIGV2ZW50cyBhcmUgcmVwbGF5ZWQsIGl0IGNsZWFuc1xuICAgKiB1cCB0aGUgZWFybHkgY29udHJhY3QuXG4gICAqL1xuICByZXBsYXlFYXJseUV2ZW50cyhlYXJseUpzYWN0aW9uRGF0YTogRWFybHlKc2FjdGlvbkRhdGEgfCB1bmRlZmluZWQgPSB3aW5kb3cuX2Vqc2EpIHtcbiAgICAvLyBDaGVjayBpZiB0aGUgZWFybHkgY29udHJhY3QgaXMgcHJlc2VudCBhbmQgcHJldmVudCBjYWxsaW5nIHRoaXMgZnVuY3Rpb25cbiAgICAvLyBtb3JlIHRoYW4gb25jZS5cbiAgICBpZiAoIWVhcmx5SnNhY3Rpb25EYXRhKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gUmVwbGF5IHRoZSBlYXJseSBjb250cmFjdCBldmVudHMuXG4gICAgdGhpcy5yZXBsYXlFYXJseUV2ZW50SW5mb3MoZWFybHlKc2FjdGlvbkRhdGEucSk7XG5cbiAgICAvLyBDbGVhbiB1cCB0aGUgZWFybHkgY29udHJhY3QuXG4gICAgcmVtb3ZlQWxsRXZlbnRMaXN0ZW5lcnMoZWFybHlKc2FjdGlvbkRhdGEpO1xuICAgIGRlbGV0ZSB3aW5kb3cuX2Vqc2E7XG4gIH1cblxuICAvKipcbiAgICogUmVwbGF5cyBhbGwgdGhlIGVhcmx5IGBFdmVudEluZm9gIG9iamVjdHMsIGRpc3BhdGNoaW5nIHRoZW0gdGhyb3VnaCB0aGUgbm9ybWFsXG4gICAqIGBFdmVudENvbnRyYWN0YCBmbG93LlxuICAgKi9cbiAgcmVwbGF5RWFybHlFdmVudEluZm9zKGVhcmx5RXZlbnRJbmZvczogZXZlbnRJbmZvTGliLkV2ZW50SW5mb1tdKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBlYXJseUV2ZW50SW5mb3MubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGVhcmx5RXZlbnRJbmZvOiBldmVudEluZm9MaWIuRXZlbnRJbmZvID0gZWFybHlFdmVudEluZm9zW2ldO1xuICAgICAgY29uc3QgZXZlbnRUeXBlcyA9IHRoaXMuZ2V0RXZlbnRUeXBlc0ZvckJyb3dzZXJFdmVudFR5cGUoZWFybHlFdmVudEluZm8uZXZlbnRUeXBlKTtcbiAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgZXZlbnRUeXBlcy5sZW5ndGg7IGorKykge1xuICAgICAgICBjb25zdCBldmVudEluZm8gPSBldmVudEluZm9MaWIuY2xvbmVFdmVudEluZm8oZWFybHlFdmVudEluZm8pO1xuICAgICAgICAvLyBFdmVudEluZm8gZXZlbnRUeXBlIG1hcHMgdG8gSlNBY3Rpb24ncyBpbnRlcm5hbCBldmVudCB0eXBlLFxuICAgICAgICAvLyByYXRoZXIgdGhhbiB0aGUgYnJvd3NlciBldmVudCB0eXBlLlxuICAgICAgICBldmVudEluZm9MaWIuc2V0RXZlbnRUeXBlKGV2ZW50SW5mbywgZXZlbnRUeXBlc1tqXSk7XG4gICAgICAgIHRoaXMuaGFuZGxlRXZlbnRJbmZvKGV2ZW50SW5mbyk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYWxsIEpTQWN0aW9uIGV2ZW50IHR5cGVzIHRoYXQgaGF2ZSBiZWVuIHJlZ2lzdGVyZWQgZm9yIGEgZ2l2ZW5cbiAgICogYnJvd3NlciBldmVudCB0eXBlLlxuICAgKi9cbiAgcHJpdmF0ZSBnZXRFdmVudFR5cGVzRm9yQnJvd3NlckV2ZW50VHlwZShicm93c2VyRXZlbnRUeXBlOiBzdHJpbmcpIHtcbiAgICBjb25zdCBldmVudFR5cGVzID0gW107XG4gICAgaWYgKHRoaXMuZXZlbnRIYW5kbGVyc1ticm93c2VyRXZlbnRUeXBlXSkge1xuICAgICAgZXZlbnRUeXBlcy5wdXNoKGJyb3dzZXJFdmVudFR5cGUpO1xuICAgIH1cbiAgICBpZiAodGhpcy5icm93c2VyRXZlbnRUeXBlVG9FeHRyYUV2ZW50VHlwZXNbYnJvd3NlckV2ZW50VHlwZV0pIHtcbiAgICAgIGV2ZW50VHlwZXMucHVzaCguLi50aGlzLmJyb3dzZXJFdmVudFR5cGVUb0V4dHJhRXZlbnRUeXBlc1ticm93c2VyRXZlbnRUeXBlXSk7XG4gICAgfVxuICAgIHJldHVybiBldmVudFR5cGVzO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGV2ZW50IGhhbmRsZXIgZnVuY3Rpb24gZm9yIGEgZ2l2ZW4gZXZlbnQgdHlwZS5cbiAgICovXG4gIGhhbmRsZXIoZXZlbnRUeXBlOiBzdHJpbmcpOiBFdmVudEhhbmRsZXIgfCB1bmRlZmluZWQge1xuICAgIHJldHVybiB0aGlzLmV2ZW50SGFuZGxlcnNbZXZlbnRUeXBlXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbGVhbnMgdXAgdGhlIGV2ZW50IGNvbnRyYWN0LiBUaGlzIHJlc2V0cyBhbGwgb2YgdGhlIGBFdmVudENvbnRyYWN0YCdzXG4gICAqIGludGVybmFsIHN0YXRlLiBVc2VycyBhcmUgcmVzcG9uc2libGUgZm9yIG5vdCB1c2luZyB0aGlzIGBFdmVudENvbnRyYWN0YFxuICAgKiBhZnRlciBpdCBoYXMgYmVlbiBjbGVhbmVkIHVwLlxuICAgKi9cbiAgY2xlYW5VcCgpIHtcbiAgICB0aGlzLmNvbnRhaW5lck1hbmFnZXIhLmNsZWFuVXAoKTtcbiAgICB0aGlzLmNvbnRhaW5lck1hbmFnZXIgPSBudWxsO1xuICAgIHRoaXMuZXZlbnRIYW5kbGVycyA9IHt9O1xuICAgIHRoaXMuYnJvd3NlckV2ZW50VHlwZVRvRXh0cmFFdmVudFR5cGVzID0ge307XG4gICAgdGhpcy5kaXNwYXRjaGVyID0gbnVsbDtcbiAgICB0aGlzLnF1ZXVlZEV2ZW50SW5mb3MgPSBbXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlciBhIGRpc3BhdGNoZXIgZnVuY3Rpb24uIEV2ZW50IGluZm8gb2YgZWFjaCBldmVudCBtYXBwZWQgdG9cbiAgICogYSBqc2FjdGlvbiBpcyBwYXNzZWQgZm9yIGhhbmRsaW5nIHRvIHRoaXMgY2FsbGJhY2suIFRoZSBxdWV1ZWRcbiAgICogZXZlbnRzIGFyZSBwYXNzZWQgYXMgd2VsbCB0byB0aGUgZGlzcGF0Y2hlciBmb3IgbGF0ZXIgcmVwbGF5aW5nXG4gICAqIG9uY2UgdGhlIGRpc3BhdGNoZXIgaXMgcmVnaXN0ZXJlZC4gQ2xlYXJzIHRoZSBldmVudCBxdWV1ZSB0byBudWxsLlxuICAgKlxuICAgKiBAcGFyYW0gZGlzcGF0Y2hlciBUaGUgZGlzcGF0Y2hlciBmdW5jdGlvbi5cbiAgICogQHBhcmFtIHJlc3RyaWN0aW9uXG4gICAqL1xuICByZWdpc3RlckRpc3BhdGNoZXIoZGlzcGF0Y2hlcjogRGlzcGF0Y2hlciwgcmVzdHJpY3Rpb246IFJlc3RyaWN0aW9uKSB7XG4gICAgdGhpcy5lY3JkKGRpc3BhdGNoZXIsIHJlc3RyaWN0aW9uKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVbnJlbmFtZWQgYWxpYXMgZm9yIHJlZ2lzdGVyRGlzcGF0Y2hlci4gTmVjZXNzYXJ5IGZvciBhbnkgY29kZWJhc2VzIHRoYXRcbiAgICogc3BsaXQgdGhlIGBFdmVudENvbnRyYWN0YCBhbmQgYERpc3BhdGNoZXJgIGNvZGUgaW50byBkaWZmZXJlbnQgY29tcGlsYXRpb25cbiAgICogdW5pdHMuXG4gICAqL1xuICBlY3JkKGRpc3BhdGNoZXI6IERpc3BhdGNoZXIsIHJlc3RyaWN0aW9uOiBSZXN0cmljdGlvbikge1xuICAgIHRoaXMuZGlzcGF0Y2hlciA9IGRpc3BhdGNoZXI7XG5cbiAgICBpZiAodGhpcy5xdWV1ZWRFdmVudEluZm9zPy5sZW5ndGgpIHtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5xdWV1ZWRFdmVudEluZm9zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHRoaXMuaGFuZGxlRXZlbnRJbmZvKHRoaXMucXVldWVkRXZlbnRJbmZvc1tpXSk7XG4gICAgICB9XG4gICAgICB0aGlzLnF1ZXVlZEV2ZW50SW5mb3MgPSBudWxsO1xuICAgIH1cbiAgfVxufVxuIl19