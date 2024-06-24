/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
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
import * as a11yClickLib from './a11y_click';
import { ActionResolver } from './action_resolver';
import * as eventLib from './event';
import { A11Y_CLICK_SUPPORT, MOUSE_SPECIAL_SUPPORT } from './event_contract_defines';
import * as eventInfoLib from './event_info';
import { EventType, NON_BUBBLING_MOUSE_EVENTS } from './event_type';
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
    static { this.A11Y_CLICK_SUPPORT = A11Y_CLICK_SUPPORT; }
    static { this.MOUSE_SPECIAL_SUPPORT = MOUSE_SPECIAL_SUPPORT; }
    constructor(containerManager, useActionResolver = true) {
        this.useActionResolver = useActionResolver;
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
        /** Whether to add an a11y click listener. */
        this.addA11yClickListener = false;
        this.containerManager = containerManager;
        if (this.useActionResolver) {
            this.actionResolver = new ActionResolver({
                syntheticMouseEventSupport: EventContract.MOUSE_SPECIAL_SUPPORT,
            });
        }
        if (EventContract.A11Y_CLICK_SUPPORT) {
            // Add a11y click support to the `EventContract`.
            this.addA11yClickSupport();
        }
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
        if (this.useActionResolver) {
            this.actionResolver.resolveEventType(eventInfo);
            this.actionResolver.resolveAction(eventInfo);
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
        if (!EventContract.MOUSE_SPECIAL_SUPPORT && NON_BUBBLING_MOUSE_EVENTS.indexOf(eventType) >= 0) {
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
        // Automatically install a keypress/keydown event handler if support for
        // accessible clicks is turned on.
        if (this.addA11yClickListener && eventType === EventType.CLICK) {
            this.addEvent(EventType.KEYDOWN);
        }
    }
    /**
     * Gets the queued early events and replay them using the appropriate handler
     * in the provided event contract. Once all the events are replayed, it cleans
     * up the early contract.
     */
    replayEarlyEvents(earlyJsactionContainer = window) {
        // Check if the early contract is present and prevent calling this function
        // more than once.
        const earlyJsactionData = earlyJsactionContainer._ejsa;
        if (!earlyJsactionData) {
            return;
        }
        // Replay the early contract events.
        const earlyEventInfos = earlyJsactionData.q;
        for (let idx = 0; idx < earlyEventInfos.length; idx++) {
            const earlyEventInfo = earlyEventInfos[idx];
            const eventTypes = this.getEventTypesForBrowserEventType(earlyEventInfo.eventType);
            for (let i = 0; i < eventTypes.length; i++) {
                const eventInfo = eventInfoLib.cloneEventInfo(earlyEventInfo);
                // EventInfo eventType maps to JSAction's internal event type,
                // rather than the browser event type.
                eventInfoLib.setEventType(eventInfo, eventTypes[i]);
                this.handleEventInfo(eventInfo);
            }
        }
        // Clean up the early contract.
        const earlyEventHandler = earlyJsactionData.h;
        removeEventListeners(earlyJsactionData.c, earlyJsactionData.et, earlyEventHandler);
        removeEventListeners(earlyJsactionData.c, earlyJsactionData.etc, earlyEventHandler, true);
        delete earlyJsactionContainer._ejsa;
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
    /**
     * Adds a11y click support to the given `EventContract`. Meant to be called in
     * the same compilation unit as the `EventContract`.
     */
    addA11yClickSupport() {
        this.addA11yClickSupportImpl(a11yClickLib.updateEventInfoForA11yClick, a11yClickLib.preventDefaultForA11yClick, a11yClickLib.populateClickOnlyAction);
    }
    /**
     * Enables a11y click support to be deferred. Meant to be called in the same
     * compilation unit as the `EventContract`.
     */
    exportAddA11yClickSupport() {
        this.addA11yClickListener = true;
        this.ecaacs = this.addA11yClickSupportImpl.bind(this);
    }
    /**
     * Unrenamed function that loads a11yClickSupport.
     */
    addA11yClickSupportImpl(updateEventInfoForA11yClick, preventDefaultForA11yClick, populateClickOnlyAction) {
        this.addA11yClickListener = true;
        if (this.useActionResolver) {
            this.actionResolver.addA11yClickSupport(updateEventInfoForA11yClick, preventDefaultForA11yClick, populateClickOnlyAction);
        }
    }
}
function removeEventListeners(container, eventTypes, earlyEventHandler, capture) {
    for (let idx = 0; idx < eventTypes.length; idx++) {
        container.removeEventListener(eventTypes[idx], earlyEventHandler, /* useCapture */ capture);
    }
}
/**
 * Adds a11y click support to the given `EventContract`. Meant to be called
 * in a different compilation unit from the `EventContract`. The `EventContract`
 * must have called `exportAddA11yClickSupport` in its compilation unit for this
 * to have any effect.
 */
export function addDeferredA11yClickSupport(eventContract) {
    eventContract.ecaacs?.(a11yClickLib.updateEventInfoForA11yClick, a11yClickLib.preventDefaultForA11yClick, a11yClickLib.populateClickOnlyAction);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnRjb250cmFjdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvcHJpbWl0aXZlcy9ldmVudC1kaXNwYXRjaC9zcmMvZXZlbnRjb250cmFjdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXNCRztBQUVILE9BQU8sS0FBSyxZQUFZLE1BQU0sY0FBYyxDQUFDO0FBQzdDLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUVqRCxPQUFPLEtBQUssUUFBUSxNQUFNLFNBQVMsQ0FBQztBQUVwQyxPQUFPLEVBQUMsa0JBQWtCLEVBQUUscUJBQXFCLEVBQUMsTUFBTSwwQkFBMEIsQ0FBQztBQUNuRixPQUFPLEtBQUssWUFBWSxNQUFNLGNBQWMsQ0FBQztBQUM3QyxPQUFPLEVBQUMsU0FBUyxFQUFFLHlCQUF5QixFQUFDLE1BQU0sY0FBYyxDQUFDO0FBK0JsRTs7Ozs7Ozs7Ozs7OztHQWFHO0FBQ0gsTUFBTSxPQUFPLGFBQWE7YUFDakIsdUJBQWtCLEdBQUcsa0JBQWtCLEFBQXJCLENBQXNCO2FBQ3hDLDBCQUFxQixHQUFHLHFCQUFxQixBQUF4QixDQUF5QjtJQXlDckQsWUFDRSxnQkFBK0MsRUFDOUIsb0JBQW9CLElBQUk7UUFBeEIsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFPO1FBckMzQzs7Ozs7O1dBTUc7UUFDSyxrQkFBYSxHQUFrQyxFQUFFLENBQUM7UUFFbEQsc0NBQWlDLEdBQThCLEVBQUUsQ0FBQztRQUUxRTs7Ozs7O1dBTUc7UUFDSyxlQUFVLEdBQXNCLElBQUksQ0FBQztRQUU3Qzs7O1dBR0c7UUFDSyxxQkFBZ0IsR0FBb0MsRUFBRSxDQUFDO1FBRS9ELDZDQUE2QztRQUNyQyx5QkFBb0IsR0FBRyxLQUFLLENBQUM7UUFZbkMsSUFBSSxDQUFDLGdCQUFnQixHQUFHLGdCQUFnQixDQUFDO1FBQ3pDLElBQUksSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7WUFDM0IsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLGNBQWMsQ0FBQztnQkFDdkMsMEJBQTBCLEVBQUUsYUFBYSxDQUFDLHFCQUFxQjthQUNoRSxDQUFDLENBQUM7UUFDTCxDQUFDO1FBQ0QsSUFBSSxhQUFhLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztZQUNyQyxpREFBaUQ7WUFDakQsSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7UUFDN0IsQ0FBQztJQUNILENBQUM7SUFFTyxXQUFXLENBQUMsU0FBaUIsRUFBRSxLQUFZLEVBQUUsU0FBa0I7UUFDckUsTUFBTSxTQUFTLEdBQUcsWUFBWSxDQUFDLDZCQUE2QjtRQUMxRCxnQkFBZ0IsQ0FBQyxTQUFTO1FBQzFCLFlBQVksQ0FBQyxLQUFLO1FBQ2xCLG9CQUFvQixDQUFDLEtBQUssQ0FBQyxNQUFpQjtRQUM1QyxnQkFBZ0IsQ0FBQyxTQUFTO1FBQzFCLGdCQUFnQixDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FDNUIsQ0FBQztRQUNGLElBQUksQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDbEMsQ0FBQztJQUVEOztPQUVHO0lBQ0ssZUFBZSxDQUFDLFNBQWlDO1FBQ3ZELElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDckIsOERBQThEO1lBQzlELFlBQVksQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQzFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDdkMsT0FBTztRQUNULENBQUM7UUFDRCxJQUFJLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1lBQzNCLElBQUksQ0FBQyxjQUFlLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDakQsSUFBSSxDQUFDLGNBQWUsQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDaEQsQ0FBQztRQUNELElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDN0IsQ0FBQztJQUVEOzs7Ozs7Ozs7Ozs7T0FZRztJQUNILFFBQVEsQ0FBQyxTQUFpQixFQUFFLGlCQUEwQjtRQUNwRCxJQUFJLFNBQVMsSUFBSSxJQUFJLENBQUMsYUFBYSxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7WUFDOUQsT0FBTztRQUNULENBQUM7UUFFRCxJQUFJLENBQUMsYUFBYSxDQUFDLHFCQUFxQixJQUFJLHlCQUF5QixDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztZQUM5RixPQUFPO1FBQ1QsQ0FBQztRQUVELE1BQU0sWUFBWSxHQUFHLENBQUMsU0FBaUIsRUFBRSxLQUFZLEVBQUUsU0FBa0IsRUFBRSxFQUFFO1lBQzNFLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFLEtBQUssRUFBRSxTQUFTLENBQUMsQ0FBQztRQUNoRCxDQUFDLENBQUM7UUFFRixtREFBbUQ7UUFDbkQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsR0FBRyxZQUFZLENBQUM7UUFFN0MsTUFBTSxnQkFBZ0IsR0FBRyxRQUFRLENBQUMsbUJBQW1CLENBQUMsaUJBQWlCLElBQUksU0FBUyxDQUFDLENBQUM7UUFFdEYsSUFBSSxnQkFBZ0IsS0FBSyxTQUFTLEVBQUUsQ0FBQztZQUNuQyxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsaUNBQWlDLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDbEYsVUFBVSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUMzQixJQUFJLENBQUMsaUNBQWlDLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxVQUFVLENBQUM7UUFDeEUsQ0FBQztRQUVELElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxnQkFBZ0IsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLE9BQWdCLEVBQUUsRUFBRTtZQUM1RSxPQUFPLENBQUMsS0FBWSxFQUFFLEVBQUU7Z0JBQ3RCLFlBQVksQ0FBQyxTQUFTLEVBQUUsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQzFDLENBQUMsQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUFDO1FBRUgsd0VBQXdFO1FBQ3hFLGtDQUFrQztRQUNsQyxJQUFJLElBQUksQ0FBQyxvQkFBb0IsSUFBSSxTQUFTLEtBQUssU0FBUyxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQy9ELElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ25DLENBQUM7SUFDSCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILGlCQUFpQixDQUNmLHlCQUFxRCxNQUFvQztRQUV6RiwyRUFBMkU7UUFDM0Usa0JBQWtCO1FBQ2xCLE1BQU0saUJBQWlCLEdBQWtDLHNCQUFzQixDQUFDLEtBQUssQ0FBQztRQUN0RixJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztZQUN2QixPQUFPO1FBQ1QsQ0FBQztRQUVELG9DQUFvQztRQUNwQyxNQUFNLGVBQWUsR0FBNkIsaUJBQWlCLENBQUMsQ0FBQyxDQUFDO1FBQ3RFLEtBQUssSUFBSSxHQUFHLEdBQUcsQ0FBQyxFQUFFLEdBQUcsR0FBRyxlQUFlLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUM7WUFDdEQsTUFBTSxjQUFjLEdBQTJCLGVBQWUsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNwRSxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsZ0NBQWdDLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ25GLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7Z0JBQzNDLE1BQU0sU0FBUyxHQUFHLFlBQVksQ0FBQyxjQUFjLENBQUMsY0FBYyxDQUFDLENBQUM7Z0JBQzlELDhEQUE4RDtnQkFDOUQsc0NBQXNDO2dCQUN0QyxZQUFZLENBQUMsWUFBWSxDQUFDLFNBQVMsRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDcEQsSUFBSSxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNsQyxDQUFDO1FBQ0gsQ0FBQztRQUVELCtCQUErQjtRQUMvQixNQUFNLGlCQUFpQixHQUEyQixpQkFBaUIsQ0FBQyxDQUFDLENBQUM7UUFDdEUsb0JBQW9CLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxFQUFFLGlCQUFpQixDQUFDLEVBQUUsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1FBQ25GLG9CQUFvQixDQUFDLGlCQUFpQixDQUFDLENBQUMsRUFBRSxpQkFBaUIsQ0FBQyxHQUFHLEVBQUUsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDMUYsT0FBTyxzQkFBc0IsQ0FBQyxLQUFLLENBQUM7SUFDdEMsQ0FBQztJQUVEOzs7T0FHRztJQUNLLGdDQUFnQyxDQUFDLGdCQUF3QjtRQUMvRCxNQUFNLFVBQVUsR0FBRyxFQUFFLENBQUM7UUFDdEIsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLGdCQUFnQixDQUFDLEVBQUUsQ0FBQztZQUN6QyxVQUFVLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDcEMsQ0FBQztRQUNELElBQUksSUFBSSxDQUFDLGlDQUFpQyxDQUFDLGdCQUFnQixDQUFDLEVBQUUsQ0FBQztZQUM3RCxVQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLGlDQUFpQyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQztRQUMvRSxDQUFDO1FBQ0QsT0FBTyxVQUFVLENBQUM7SUFDcEIsQ0FBQztJQUVEOztPQUVHO0lBQ0gsT0FBTyxDQUFDLFNBQWlCO1FBQ3ZCLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILE9BQU87UUFDTCxJQUFJLENBQUMsZ0JBQWlCLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDakMsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQztRQUM3QixJQUFJLENBQUMsYUFBYSxHQUFHLEVBQUUsQ0FBQztRQUN4QixJQUFJLENBQUMsaUNBQWlDLEdBQUcsRUFBRSxDQUFDO1FBQzVDLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxFQUFFLENBQUM7SUFDN0IsQ0FBQztJQUVEOzs7Ozs7OztPQVFHO0lBQ0gsa0JBQWtCLENBQUMsVUFBc0IsRUFBRSxXQUF3QjtRQUNqRSxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxXQUFXLENBQUMsQ0FBQztJQUNyQyxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILElBQUksQ0FBQyxVQUFzQixFQUFFLFdBQXdCO1FBQ25ELElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO1FBRTdCLElBQUksSUFBSSxDQUFDLGdCQUFnQixFQUFFLE1BQU0sRUFBRSxDQUFDO1lBQ2xDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7Z0JBQ3RELElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDakQsQ0FBQztZQUNELElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUM7UUFDL0IsQ0FBQztJQUNILENBQUM7SUFFRDs7O09BR0c7SUFDSCxtQkFBbUI7UUFDakIsSUFBSSxDQUFDLHVCQUF1QixDQUMxQixZQUFZLENBQUMsMkJBQTJCLEVBQ3hDLFlBQVksQ0FBQywwQkFBMEIsRUFDdkMsWUFBWSxDQUFDLHVCQUF1QixDQUNyQyxDQUFDO0lBQ0osQ0FBQztJQUVEOzs7T0FHRztJQUNILHlCQUF5QjtRQUN2QixJQUFJLENBQUMsb0JBQW9CLEdBQUcsSUFBSSxDQUFDO1FBQ2pDLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLHVCQUF1QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN4RCxDQUFDO0lBRUQ7O09BRUc7SUFDSyx1QkFBdUIsQ0FDN0IsMkJBQTRFLEVBQzVFLDBCQUEwRSxFQUMxRSx1QkFBb0U7UUFFcEUsSUFBSSxDQUFDLG9CQUFvQixHQUFHLElBQUksQ0FBQztRQUNqQyxJQUFJLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1lBQzNCLElBQUksQ0FBQyxjQUFlLENBQUMsbUJBQW1CLENBQ3RDLDJCQUEyQixFQUMzQiwwQkFBMEIsRUFDMUIsdUJBQXVCLENBQ3hCLENBQUM7UUFDSixDQUFDO0lBQ0gsQ0FBQzs7QUFHSCxTQUFTLG9CQUFvQixDQUMzQixTQUFzQixFQUN0QixVQUFvQixFQUNwQixpQkFBcUMsRUFDckMsT0FBaUI7SUFFakIsS0FBSyxJQUFJLEdBQUcsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLFVBQVUsQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQztRQUNqRCxTQUFTLENBQUMsbUJBQW1CLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxFQUFFLGlCQUFpQixFQUFFLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzlGLENBQUM7QUFDSCxDQUFDO0FBRUQ7Ozs7O0dBS0c7QUFDSCxNQUFNLFVBQVUsMkJBQTJCLENBQUMsYUFBNEI7SUFDdEUsYUFBYSxDQUFDLE1BQU0sRUFBRSxDQUNwQixZQUFZLENBQUMsMkJBQTJCLEVBQ3hDLFlBQVksQ0FBQywwQkFBMEIsRUFDdkMsWUFBWSxDQUFDLHVCQUF1QixDQUNyQyxDQUFDO0FBQ0osQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG4vKipcbiAqIEBmaWxlb3ZlcnZpZXcgSW1wbGVtZW50cyB0aGUgbG9jYWwgZXZlbnQgaGFuZGxpbmcgY29udHJhY3QuIFRoaXNcbiAqIGFsbG93cyBET00gb2JqZWN0cyBpbiBhIGNvbnRhaW5lciB0aGF0IGVudGVycyBpbnRvIHRoaXMgY29udHJhY3QgdG9cbiAqIGRlZmluZSBldmVudCBoYW5kbGVycyB3aGljaCBhcmUgZXhlY3V0ZWQgaW4gYSBsb2NhbCBjb250ZXh0LlxuICpcbiAqIE9uZSBFdmVudENvbnRyYWN0IGluc3RhbmNlIGNhbiBtYW5hZ2UgdGhlIGNvbnRyYWN0IGZvciBtdWx0aXBsZVxuICogY29udGFpbmVycywgd2hpY2ggYXJlIGFkZGVkIHVzaW5nIHRoZSBhZGRDb250YWluZXIoKSBtZXRob2QuXG4gKlxuICogRXZlbnRzIGNhbiBiZSByZWdpc3RlcmVkIHVzaW5nIHRoZSBhZGRFdmVudCgpIG1ldGhvZC5cbiAqXG4gKiBBIERpc3BhdGNoZXIgaXMgYWRkZWQgdXNpbmcgdGhlIHJlZ2lzdGVyRGlzcGF0Y2hlcigpIG1ldGhvZC4gVW50aWwgdGhlcmUgaXNcbiAqIGEgZGlzcGF0Y2hlciwgZXZlbnRzIGFyZSBxdWV1ZWQuIFRoZSBpZGVhIGlzIHRoYXQgdGhlIEV2ZW50Q29udHJhY3RcbiAqIGNsYXNzIGlzIGlubGluZWQgaW4gdGhlIEhUTUwgb2YgdGhlIHRvcCBsZXZlbCBwYWdlIGFuZCBpbnN0YW50aWF0ZWRcbiAqIHJpZ2h0IGFmdGVyIHRoZSBzdGFydCBvZiA8Ym9keT4uIFRoZSBEaXNwYXRjaGVyIGNsYXNzIGlzIGNvbnRhaW5lZFxuICogaW4gdGhlIGV4dGVybmFsIGRlZmVycmVkIGpzLCBhbmQgaW5zdGFudGlhdGVkIGFuZCByZWdpc3RlcmVkIHdpdGhcbiAqIEV2ZW50Q29udHJhY3Qgd2hlbiB0aGUgZXh0ZXJuYWwgamF2YXNjcmlwdCBpbiB0aGUgcGFnZSBsb2Fkcy4gVGhlXG4gKiBleHRlcm5hbCBqYXZhc2NyaXB0IHdpbGwgYWxzbyByZWdpc3RlciB0aGUganNhY3Rpb24gaGFuZGxlcnMsIHdoaWNoXG4gKiB0aGVuIHBpY2sgdXAgdGhlIHF1ZXVlZCBldmVudHMgYXQgdGhlIHRpbWUgb2YgcmVnaXN0cmF0aW9uLlxuICpcbiAqIFNpbmNlIHRoaXMgY2xhc3MgaXMgbWVhbnQgdG8gYmUgaW5saW5lZCBpbiB0aGUgbWFpbiBwYWdlIEhUTUwsIHRoZVxuICogc2l6ZSBvZiB0aGUgYmluYXJ5IGNvbXBpbGVkIGZyb20gdGhpcyBmaWxlIE1VU1QgYmUga2VwdCBhcyBzbWFsbCBhc1xuICogcG9zc2libGUgYW5kIHRodXMgaXRzIGRlcGVuZGVuY2llcyB0byBhIG1pbmltdW0uXG4gKi9cblxuaW1wb3J0ICogYXMgYTExeUNsaWNrTGliIGZyb20gJy4vYTExeV9jbGljayc7XG5pbXBvcnQge0FjdGlvblJlc29sdmVyfSBmcm9tICcuL2FjdGlvbl9yZXNvbHZlcic7XG5pbXBvcnQge0Vhcmx5SnNhY3Rpb25EYXRhLCBFYXJseUpzYWN0aW9uRGF0YUNvbnRhaW5lcn0gZnJvbSAnLi9lYXJseWV2ZW50Y29udHJhY3QnO1xuaW1wb3J0ICogYXMgZXZlbnRMaWIgZnJvbSAnLi9ldmVudCc7XG5pbXBvcnQge0V2ZW50Q29udHJhY3RDb250YWluZXJNYW5hZ2VyfSBmcm9tICcuL2V2ZW50X2NvbnRyYWN0X2NvbnRhaW5lcic7XG5pbXBvcnQge0ExMVlfQ0xJQ0tfU1VQUE9SVCwgTU9VU0VfU1BFQ0lBTF9TVVBQT1JUfSBmcm9tICcuL2V2ZW50X2NvbnRyYWN0X2RlZmluZXMnO1xuaW1wb3J0ICogYXMgZXZlbnRJbmZvTGliIGZyb20gJy4vZXZlbnRfaW5mbyc7XG5pbXBvcnQge0V2ZW50VHlwZSwgTk9OX0JVQkJMSU5HX01PVVNFX0VWRU5UU30gZnJvbSAnLi9ldmVudF90eXBlJztcbmltcG9ydCB7UmVzdHJpY3Rpb259IGZyb20gJy4vcmVzdHJpY3Rpb24nO1xuXG4vKipcbiAqIFRoZSBBUEkgb2YgYW4gRXZlbnRDb250cmFjdCB0aGF0IGlzIHNhZmUgdG8gY2FsbCBmcm9tIGFueSBjb21waWxhdGlvbiB1bml0LlxuICovXG5leHBvcnQgZGVjbGFyZSBpbnRlcmZhY2UgVW5yZW5hbWVkRXZlbnRDb250cmFjdCB7XG4gIC8vIEFsaWFzIGZvciBKc2N0aW9uIEV2ZW50Q29udHJhY3QgcmVnaXN0ZXJEaXNwYXRjaGVyLlxuICBlY3JkKGRpc3BhdGNoZXI6IERpc3BhdGNoZXIsIHJlc3RyaWN0aW9uOiBSZXN0cmljdGlvbik6IHZvaWQ7XG4gIC8vIFVucmVuYW1lZCBmdW5jdGlvbi4gQWJicmV2aWF0aW9uIGZvciBgZXZlbnRDb250cmFjdC5hZGRBMTF5Q2xpY2tTdXBwb3J0YC5cbiAgZWNhYWNzPzogKFxuICAgIHVwZGF0ZUV2ZW50SW5mb0ZvckExMXlDbGljazogdHlwZW9mIGExMXlDbGlja0xpYi51cGRhdGVFdmVudEluZm9Gb3JBMTF5Q2xpY2ssXG4gICAgcHJldmVudERlZmF1bHRGb3JBMTF5Q2xpY2s6IHR5cGVvZiBhMTF5Q2xpY2tMaWIucHJldmVudERlZmF1bHRGb3JBMTF5Q2xpY2ssXG4gICAgcG9wdWxhdGVDbGlja09ubHlBY3Rpb246IHR5cGVvZiBhMTF5Q2xpY2tMaWIucG9wdWxhdGVDbGlja09ubHlBY3Rpb24sXG4gICkgPT4gdm9pZDtcbn1cblxuLyoqIEEgZnVuY3Rpb24gdGhhdCBpcyBjYWxsZWQgdG8gaGFuZGxlIGV2ZW50cyBjYXB0dXJlZCBieSB0aGUgRXZlbnRDb250cmFjdC4gKi9cbmV4cG9ydCB0eXBlIERpc3BhdGNoZXIgPSAoZXZlbnRJbmZvOiBldmVudEluZm9MaWIuRXZlbnRJbmZvLCBnbG9iYWxEaXNwYXRjaD86IGJvb2xlYW4pID0+IHZvaWQ7XG5cbi8qKlxuICogQSBmdW5jdGlvbiB0aGF0IGhhbmRsZXMgYW4gZXZlbnQgZGlzcGF0Y2hlZCBmcm9tIHRoZSBicm93c2VyLlxuICpcbiAqIGV2ZW50VHlwZTogTWF5IGRpZmZlciBmcm9tIGBldmVudC50eXBlYCBpZiBKU0FjdGlvbiB1c2VzIGFcbiAqIHNob3J0LWhhbmQgbmFtZSBvciBpcyBwYXRjaGluZyBvdmVyIGFuIG5vbi1idWJibGluZyBldmVudCB3aXRoIGEgYnViYmxpbmdcbiAqIHZhcmlhbnQuXG4gKiBldmVudDogVGhlIG5hdGl2ZSBicm93c2VyIGV2ZW50LlxuICogY29udGFpbmVyOiBUaGUgY29udGFpbmVyIGZvciB0aGlzIGRpc3BhdGNoLlxuICovXG50eXBlIEV2ZW50SGFuZGxlciA9IChldmVudFR5cGU6IHN0cmluZywgZXZlbnQ6IEV2ZW50LCBjb250YWluZXI6IEVsZW1lbnQpID0+IHZvaWQ7XG5cbi8qKlxuICogRXZlbnRDb250cmFjdCBpbnRlcmNlcHRzIGV2ZW50cyBpbiB0aGUgYnViYmxpbmcgcGhhc2UgYXQgdGhlXG4gKiBib3VuZGFyeSBvZiBhIGNvbnRhaW5lciBlbGVtZW50LCBhbmQgbWFwcyB0aGVtIHRvIGdlbmVyaWMgYWN0aW9uc1xuICogd2hpY2ggYXJlIHNwZWNpZmllZCB1c2luZyB0aGUgY3VzdG9tIGpzYWN0aW9uIGF0dHJpYnV0ZSBpblxuICogSFRNTC4gQmVoYXZpb3Igb2YgdGhlIGFwcGxpY2F0aW9uIGlzIHRoZW4gc3BlY2lmaWVkIGluIHRlcm1zIG9mXG4gKiBoYW5kbGVyIGZvciBzdWNoIGFjdGlvbnMsIGNmLiBqc2FjdGlvbi5EaXNwYXRjaGVyIGluIGRpc3BhdGNoZXIuanMuXG4gKlxuICogVGhpcyBoYXMgc2V2ZXJhbCBiZW5lZml0czogKDEpIE5vIERPTSBldmVudCBoYW5kbGVycyBuZWVkIHRvIGJlXG4gKiByZWdpc3RlcmVkIG9uIHRoZSBzcGVjaWZpYyBlbGVtZW50cyBpbiB0aGUgVUkuICgyKSBUaGUgc2V0IG9mXG4gKiBldmVudHMgdGhhdCB0aGUgYXBwbGljYXRpb24gaGFzIHRvIGhhbmRsZSBjYW4gYmUgc3BlY2lmaWVkIGluIHRlcm1zXG4gKiBvZiB0aGUgc2VtYW50aWNzIG9mIHRoZSBhcHBsaWNhdGlvbiwgcmF0aGVyIHRoYW4gaW4gdGVybXMgb2YgRE9NXG4gKiBldmVudHMuICgzKSBJbnZvY2F0aW9uIG9mIGhhbmRsZXJzIGNhbiBiZSBkZWxheWVkIGFuZCBoYW5kbGVycyBjYW5cbiAqIGJlIGRlbGF5IGxvYWRlZCBpbiBhIGdlbmVyaWMgd2F5LlxuICovXG5leHBvcnQgY2xhc3MgRXZlbnRDb250cmFjdCBpbXBsZW1lbnRzIFVucmVuYW1lZEV2ZW50Q29udHJhY3Qge1xuICBzdGF0aWMgQTExWV9DTElDS19TVVBQT1JUID0gQTExWV9DTElDS19TVVBQT1JUO1xuICBzdGF0aWMgTU9VU0VfU1BFQ0lBTF9TVVBQT1JUID0gTU9VU0VfU1BFQ0lBTF9TVVBQT1JUO1xuXG4gIHByaXZhdGUgY29udGFpbmVyTWFuYWdlcjogRXZlbnRDb250cmFjdENvbnRhaW5lck1hbmFnZXIgfCBudWxsO1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgYWN0aW9uUmVzb2x2ZXI/OiBBY3Rpb25SZXNvbHZlcjtcblxuICAvKipcbiAgICogVGhlIERPTSBldmVudHMgd2hpY2ggdGhpcyBjb250cmFjdCBjb3ZlcnMuIFVzZWQgdG8gcHJldmVudCBkb3VibGVcbiAgICogcmVnaXN0cmF0aW9uIG9mIGV2ZW50IHR5cGVzLiBUaGUgdmFsdWUgb2YgdGhlIG1hcCBpcyB0aGVcbiAgICogaW50ZXJuYWxseSBjcmVhdGVkIERPTSBldmVudCBoYW5kbGVyIGZ1bmN0aW9uIHRoYXQgaGFuZGxlcyB0aGVcbiAgICogRE9NIGV2ZW50cy4gU2VlIGFkZEV2ZW50KCkuXG4gICAqXG4gICAqL1xuICBwcml2YXRlIGV2ZW50SGFuZGxlcnM6IHtba2V5OiBzdHJpbmddOiBFdmVudEhhbmRsZXJ9ID0ge307XG5cbiAgcHJpdmF0ZSBicm93c2VyRXZlbnRUeXBlVG9FeHRyYUV2ZW50VHlwZXM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmdbXX0gPSB7fTtcblxuICAvKipcbiAgICogVGhlIGRpc3BhdGNoZXIgZnVuY3Rpb24uIEV2ZW50cyBhcmUgcGFzc2VkIHRvIHRoaXMgZnVuY3Rpb24gZm9yXG4gICAqIGhhbmRsaW5nIG9uY2UgaXQgd2FzIHNldCB1c2luZyB0aGUgcmVnaXN0ZXJEaXNwYXRjaGVyKCkgbWV0aG9kLiBUaGlzIGlzXG4gICAqIGRvbmUgYmVjYXVzZSB0aGUgZnVuY3Rpb24gaXMgcGFzc2VkIGZyb20gYW5vdGhlciBqc2JpbmFyeSwgc28gcGFzc2luZyB0aGVcbiAgICogaW5zdGFuY2UgYW5kIGludm9raW5nIHRoZSBtZXRob2QgaGVyZSB3b3VsZCByZXF1aXJlIHRvIGxlYXZlIHRoZSBtZXRob2RcbiAgICogdW5vYmZ1c2NhdGVkLlxuICAgKi9cbiAgcHJpdmF0ZSBkaXNwYXRjaGVyOiBEaXNwYXRjaGVyIHwgbnVsbCA9IG51bGw7XG5cbiAgLyoqXG4gICAqIFRoZSBsaXN0IG9mIHN1c3BlbmRlZCBgRXZlbnRJbmZvYCB0aGF0IHdpbGwgYmUgZGlzcGF0Y2hlZFxuICAgKiBhcyBzb29uIGFzIHRoZSBgRGlzcGF0Y2hlcmAgaXMgcmVnaXN0ZXJlZC5cbiAgICovXG4gIHByaXZhdGUgcXVldWVkRXZlbnRJbmZvczogZXZlbnRJbmZvTGliLkV2ZW50SW5mb1tdIHwgbnVsbCA9IFtdO1xuXG4gIC8qKiBXaGV0aGVyIHRvIGFkZCBhbiBhMTF5IGNsaWNrIGxpc3RlbmVyLiAqL1xuICBwcml2YXRlIGFkZEExMXlDbGlja0xpc3RlbmVyID0gZmFsc2U7XG5cbiAgZWNhYWNzPzogKFxuICAgIHVwZGF0ZUV2ZW50SW5mb0ZvckExMXlDbGljazogdHlwZW9mIGExMXlDbGlja0xpYi51cGRhdGVFdmVudEluZm9Gb3JBMTF5Q2xpY2ssXG4gICAgcHJldmVudERlZmF1bHRGb3JBMTF5Q2xpY2s6IHR5cGVvZiBhMTF5Q2xpY2tMaWIucHJldmVudERlZmF1bHRGb3JBMTF5Q2xpY2ssXG4gICAgcG9wdWxhdGVDbGlja09ubHlBY3Rpb246IHR5cGVvZiBhMTF5Q2xpY2tMaWIucG9wdWxhdGVDbGlja09ubHlBY3Rpb24sXG4gICkgPT4gdm9pZDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBjb250YWluZXJNYW5hZ2VyOiBFdmVudENvbnRyYWN0Q29udGFpbmVyTWFuYWdlcixcbiAgICBwcml2YXRlIHJlYWRvbmx5IHVzZUFjdGlvblJlc29sdmVyID0gdHJ1ZSxcbiAgKSB7XG4gICAgdGhpcy5jb250YWluZXJNYW5hZ2VyID0gY29udGFpbmVyTWFuYWdlcjtcbiAgICBpZiAodGhpcy51c2VBY3Rpb25SZXNvbHZlcikge1xuICAgICAgdGhpcy5hY3Rpb25SZXNvbHZlciA9IG5ldyBBY3Rpb25SZXNvbHZlcih7XG4gICAgICAgIHN5bnRoZXRpY01vdXNlRXZlbnRTdXBwb3J0OiBFdmVudENvbnRyYWN0Lk1PVVNFX1NQRUNJQUxfU1VQUE9SVCxcbiAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAoRXZlbnRDb250cmFjdC5BMTFZX0NMSUNLX1NVUFBPUlQpIHtcbiAgICAgIC8vIEFkZCBhMTF5IGNsaWNrIHN1cHBvcnQgdG8gdGhlIGBFdmVudENvbnRyYWN0YC5cbiAgICAgIHRoaXMuYWRkQTExeUNsaWNrU3VwcG9ydCgpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgaGFuZGxlRXZlbnQoZXZlbnRUeXBlOiBzdHJpbmcsIGV2ZW50OiBFdmVudCwgY29udGFpbmVyOiBFbGVtZW50KSB7XG4gICAgY29uc3QgZXZlbnRJbmZvID0gZXZlbnRJbmZvTGliLmNyZWF0ZUV2ZW50SW5mb0Zyb21QYXJhbWV0ZXJzKFxuICAgICAgLyogZXZlbnRUeXBlPSAqLyBldmVudFR5cGUsXG4gICAgICAvKiBldmVudD0gKi8gZXZlbnQsXG4gICAgICAvKiB0YXJnZXRFbGVtZW50PSAqLyBldmVudC50YXJnZXQgYXMgRWxlbWVudCxcbiAgICAgIC8qIGNvbnRhaW5lcj0gKi8gY29udGFpbmVyLFxuICAgICAgLyogdGltZXN0YW1wPSAqLyBEYXRlLm5vdygpLFxuICAgICk7XG4gICAgdGhpcy5oYW5kbGVFdmVudEluZm8oZXZlbnRJbmZvKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGUgYW4gYEV2ZW50SW5mb2AuXG4gICAqL1xuICBwcml2YXRlIGhhbmRsZUV2ZW50SW5mbyhldmVudEluZm86IGV2ZW50SW5mb0xpYi5FdmVudEluZm8pIHtcbiAgICBpZiAoIXRoaXMuZGlzcGF0Y2hlcikge1xuICAgICAgLy8gQWxsIGV2ZW50cyBhcmUgcXVldWVkIHdoZW4gdGhlIGRpc3BhdGNoZXIgaXNuJ3QgeWV0IGxvYWRlZC5cbiAgICAgIGV2ZW50SW5mb0xpYi5zZXRJc1JlcGxheShldmVudEluZm8sIHRydWUpO1xuICAgICAgdGhpcy5xdWV1ZWRFdmVudEluZm9zPy5wdXNoKGV2ZW50SW5mbyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICh0aGlzLnVzZUFjdGlvblJlc29sdmVyKSB7XG4gICAgICB0aGlzLmFjdGlvblJlc29sdmVyIS5yZXNvbHZlRXZlbnRUeXBlKGV2ZW50SW5mbyk7XG4gICAgICB0aGlzLmFjdGlvblJlc29sdmVyIS5yZXNvbHZlQWN0aW9uKGV2ZW50SW5mbyk7XG4gICAgfVxuICAgIHRoaXMuZGlzcGF0Y2hlcihldmVudEluZm8pO1xuICB9XG5cbiAgLyoqXG4gICAqIEVuYWJsZXMganNhY3Rpb24gaGFuZGxlcnMgdG8gYmUgY2FsbGVkIGZvciB0aGUgZXZlbnQgdHlwZSBnaXZlbiBieVxuICAgKiBuYW1lLlxuICAgKlxuICAgKiBJZiB0aGUgZXZlbnQgaXMgYWxyZWFkeSByZWdpc3RlcmVkLCB0aGlzIGRvZXMgbm90aGluZy5cbiAgICpcbiAgICogQHBhcmFtIHByZWZpeGVkRXZlbnRUeXBlIElmIHN1cHBsaWVkLCB0aGlzIGV2ZW50IGlzIHVzZWQgaW5cbiAgICogICAgIHRoZSBhY3R1YWwgYnJvd3NlciBldmVudCByZWdpc3RyYXRpb24gaW5zdGVhZCBvZiB0aGUgbmFtZSB0aGF0IGlzXG4gICAqICAgICBleHBvc2VkIHRvIGpzYWN0aW9uLiBVc2UgdGhpcyBpZiB5b3UgZS5nLiB3YW50IHVzZXJzIHRvIGJlIGFibGVcbiAgICogICAgIHRvIHN1YnNjcmliZSB0byBqc2FjdGlvbj1cInRyYW5zaXRpb25FbmQ6Zm9vXCIgd2hpbGUgdGhlIHVuZGVybHlpbmdcbiAgICogICAgIGV2ZW50IGlzIHdlYmtpdFRyYW5zaXRpb25FbmQgaW4gb25lIGJyb3dzZXIgYW5kIG1velRyYW5zaXRpb25FbmRcbiAgICogICAgIGluIGFub3RoZXIuXG4gICAqL1xuICBhZGRFdmVudChldmVudFR5cGU6IHN0cmluZywgcHJlZml4ZWRFdmVudFR5cGU/OiBzdHJpbmcpIHtcbiAgICBpZiAoZXZlbnRUeXBlIGluIHRoaXMuZXZlbnRIYW5kbGVycyB8fCAhdGhpcy5jb250YWluZXJNYW5hZ2VyKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKCFFdmVudENvbnRyYWN0Lk1PVVNFX1NQRUNJQUxfU1VQUE9SVCAmJiBOT05fQlVCQkxJTkdfTU9VU0VfRVZFTlRTLmluZGV4T2YoZXZlbnRUeXBlKSA+PSAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgZXZlbnRIYW5kbGVyID0gKGV2ZW50VHlwZTogc3RyaW5nLCBldmVudDogRXZlbnQsIGNvbnRhaW5lcjogRWxlbWVudCkgPT4ge1xuICAgICAgdGhpcy5oYW5kbGVFdmVudChldmVudFR5cGUsIGV2ZW50LCBjb250YWluZXIpO1xuICAgIH07XG5cbiAgICAvLyBTdG9yZSB0aGUgY2FsbGJhY2sgdG8gYWxsb3cgdXMgdG8gcmVwbGF5IGV2ZW50cy5cbiAgICB0aGlzLmV2ZW50SGFuZGxlcnNbZXZlbnRUeXBlXSA9IGV2ZW50SGFuZGxlcjtcblxuICAgIGNvbnN0IGJyb3dzZXJFdmVudFR5cGUgPSBldmVudExpYi5nZXRCcm93c2VyRXZlbnRUeXBlKHByZWZpeGVkRXZlbnRUeXBlIHx8IGV2ZW50VHlwZSk7XG5cbiAgICBpZiAoYnJvd3NlckV2ZW50VHlwZSAhPT0gZXZlbnRUeXBlKSB7XG4gICAgICBjb25zdCBldmVudFR5cGVzID0gdGhpcy5icm93c2VyRXZlbnRUeXBlVG9FeHRyYUV2ZW50VHlwZXNbYnJvd3NlckV2ZW50VHlwZV0gfHwgW107XG4gICAgICBldmVudFR5cGVzLnB1c2goZXZlbnRUeXBlKTtcbiAgICAgIHRoaXMuYnJvd3NlckV2ZW50VHlwZVRvRXh0cmFFdmVudFR5cGVzW2Jyb3dzZXJFdmVudFR5cGVdID0gZXZlbnRUeXBlcztcbiAgICB9XG5cbiAgICB0aGlzLmNvbnRhaW5lck1hbmFnZXIuYWRkRXZlbnRMaXN0ZW5lcihicm93c2VyRXZlbnRUeXBlLCAoZWxlbWVudDogRWxlbWVudCkgPT4ge1xuICAgICAgcmV0dXJuIChldmVudDogRXZlbnQpID0+IHtcbiAgICAgICAgZXZlbnRIYW5kbGVyKGV2ZW50VHlwZSwgZXZlbnQsIGVsZW1lbnQpO1xuICAgICAgfTtcbiAgICB9KTtcblxuICAgIC8vIEF1dG9tYXRpY2FsbHkgaW5zdGFsbCBhIGtleXByZXNzL2tleWRvd24gZXZlbnQgaGFuZGxlciBpZiBzdXBwb3J0IGZvclxuICAgIC8vIGFjY2Vzc2libGUgY2xpY2tzIGlzIHR1cm5lZCBvbi5cbiAgICBpZiAodGhpcy5hZGRBMTF5Q2xpY2tMaXN0ZW5lciAmJiBldmVudFR5cGUgPT09IEV2ZW50VHlwZS5DTElDSykge1xuICAgICAgdGhpcy5hZGRFdmVudChFdmVudFR5cGUuS0VZRE9XTik7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIHF1ZXVlZCBlYXJseSBldmVudHMgYW5kIHJlcGxheSB0aGVtIHVzaW5nIHRoZSBhcHByb3ByaWF0ZSBoYW5kbGVyXG4gICAqIGluIHRoZSBwcm92aWRlZCBldmVudCBjb250cmFjdC4gT25jZSBhbGwgdGhlIGV2ZW50cyBhcmUgcmVwbGF5ZWQsIGl0IGNsZWFuc1xuICAgKiB1cCB0aGUgZWFybHkgY29udHJhY3QuXG4gICAqL1xuICByZXBsYXlFYXJseUV2ZW50cyhcbiAgICBlYXJseUpzYWN0aW9uQ29udGFpbmVyOiBFYXJseUpzYWN0aW9uRGF0YUNvbnRhaW5lciA9IHdpbmRvdyBhcyBFYXJseUpzYWN0aW9uRGF0YUNvbnRhaW5lcixcbiAgKSB7XG4gICAgLy8gQ2hlY2sgaWYgdGhlIGVhcmx5IGNvbnRyYWN0IGlzIHByZXNlbnQgYW5kIHByZXZlbnQgY2FsbGluZyB0aGlzIGZ1bmN0aW9uXG4gICAgLy8gbW9yZSB0aGFuIG9uY2UuXG4gICAgY29uc3QgZWFybHlKc2FjdGlvbkRhdGE6IEVhcmx5SnNhY3Rpb25EYXRhIHwgdW5kZWZpbmVkID0gZWFybHlKc2FjdGlvbkNvbnRhaW5lci5fZWpzYTtcbiAgICBpZiAoIWVhcmx5SnNhY3Rpb25EYXRhKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gUmVwbGF5IHRoZSBlYXJseSBjb250cmFjdCBldmVudHMuXG4gICAgY29uc3QgZWFybHlFdmVudEluZm9zOiBldmVudEluZm9MaWIuRXZlbnRJbmZvW10gPSBlYXJseUpzYWN0aW9uRGF0YS5xO1xuICAgIGZvciAobGV0IGlkeCA9IDA7IGlkeCA8IGVhcmx5RXZlbnRJbmZvcy5sZW5ndGg7IGlkeCsrKSB7XG4gICAgICBjb25zdCBlYXJseUV2ZW50SW5mbzogZXZlbnRJbmZvTGliLkV2ZW50SW5mbyA9IGVhcmx5RXZlbnRJbmZvc1tpZHhdO1xuICAgICAgY29uc3QgZXZlbnRUeXBlcyA9IHRoaXMuZ2V0RXZlbnRUeXBlc0ZvckJyb3dzZXJFdmVudFR5cGUoZWFybHlFdmVudEluZm8uZXZlbnRUeXBlKTtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZXZlbnRUeXBlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBldmVudEluZm8gPSBldmVudEluZm9MaWIuY2xvbmVFdmVudEluZm8oZWFybHlFdmVudEluZm8pO1xuICAgICAgICAvLyBFdmVudEluZm8gZXZlbnRUeXBlIG1hcHMgdG8gSlNBY3Rpb24ncyBpbnRlcm5hbCBldmVudCB0eXBlLFxuICAgICAgICAvLyByYXRoZXIgdGhhbiB0aGUgYnJvd3NlciBldmVudCB0eXBlLlxuICAgICAgICBldmVudEluZm9MaWIuc2V0RXZlbnRUeXBlKGV2ZW50SW5mbywgZXZlbnRUeXBlc1tpXSk7XG4gICAgICAgIHRoaXMuaGFuZGxlRXZlbnRJbmZvKGV2ZW50SW5mbyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQ2xlYW4gdXAgdGhlIGVhcmx5IGNvbnRyYWN0LlxuICAgIGNvbnN0IGVhcmx5RXZlbnRIYW5kbGVyOiAoZXZlbnQ6IEV2ZW50KSA9PiB2b2lkID0gZWFybHlKc2FjdGlvbkRhdGEuaDtcbiAgICByZW1vdmVFdmVudExpc3RlbmVycyhlYXJseUpzYWN0aW9uRGF0YS5jLCBlYXJseUpzYWN0aW9uRGF0YS5ldCwgZWFybHlFdmVudEhhbmRsZXIpO1xuICAgIHJlbW92ZUV2ZW50TGlzdGVuZXJzKGVhcmx5SnNhY3Rpb25EYXRhLmMsIGVhcmx5SnNhY3Rpb25EYXRhLmV0YywgZWFybHlFdmVudEhhbmRsZXIsIHRydWUpO1xuICAgIGRlbGV0ZSBlYXJseUpzYWN0aW9uQ29udGFpbmVyLl9lanNhO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYWxsIEpTQWN0aW9uIGV2ZW50IHR5cGVzIHRoYXQgaGF2ZSBiZWVuIHJlZ2lzdGVyZWQgZm9yIGEgZ2l2ZW5cbiAgICogYnJvd3NlciBldmVudCB0eXBlLlxuICAgKi9cbiAgcHJpdmF0ZSBnZXRFdmVudFR5cGVzRm9yQnJvd3NlckV2ZW50VHlwZShicm93c2VyRXZlbnRUeXBlOiBzdHJpbmcpIHtcbiAgICBjb25zdCBldmVudFR5cGVzID0gW107XG4gICAgaWYgKHRoaXMuZXZlbnRIYW5kbGVyc1ticm93c2VyRXZlbnRUeXBlXSkge1xuICAgICAgZXZlbnRUeXBlcy5wdXNoKGJyb3dzZXJFdmVudFR5cGUpO1xuICAgIH1cbiAgICBpZiAodGhpcy5icm93c2VyRXZlbnRUeXBlVG9FeHRyYUV2ZW50VHlwZXNbYnJvd3NlckV2ZW50VHlwZV0pIHtcbiAgICAgIGV2ZW50VHlwZXMucHVzaCguLi50aGlzLmJyb3dzZXJFdmVudFR5cGVUb0V4dHJhRXZlbnRUeXBlc1ticm93c2VyRXZlbnRUeXBlXSk7XG4gICAgfVxuICAgIHJldHVybiBldmVudFR5cGVzO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGV2ZW50IGhhbmRsZXIgZnVuY3Rpb24gZm9yIGEgZ2l2ZW4gZXZlbnQgdHlwZS5cbiAgICovXG4gIGhhbmRsZXIoZXZlbnRUeXBlOiBzdHJpbmcpOiBFdmVudEhhbmRsZXIgfCB1bmRlZmluZWQge1xuICAgIHJldHVybiB0aGlzLmV2ZW50SGFuZGxlcnNbZXZlbnRUeXBlXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbGVhbnMgdXAgdGhlIGV2ZW50IGNvbnRyYWN0LiBUaGlzIHJlc2V0cyBhbGwgb2YgdGhlIGBFdmVudENvbnRyYWN0YCdzXG4gICAqIGludGVybmFsIHN0YXRlLiBVc2VycyBhcmUgcmVzcG9uc2libGUgZm9yIG5vdCB1c2luZyB0aGlzIGBFdmVudENvbnRyYWN0YFxuICAgKiBhZnRlciBpdCBoYXMgYmVlbiBjbGVhbmVkIHVwLlxuICAgKi9cbiAgY2xlYW5VcCgpIHtcbiAgICB0aGlzLmNvbnRhaW5lck1hbmFnZXIhLmNsZWFuVXAoKTtcbiAgICB0aGlzLmNvbnRhaW5lck1hbmFnZXIgPSBudWxsO1xuICAgIHRoaXMuZXZlbnRIYW5kbGVycyA9IHt9O1xuICAgIHRoaXMuYnJvd3NlckV2ZW50VHlwZVRvRXh0cmFFdmVudFR5cGVzID0ge307XG4gICAgdGhpcy5kaXNwYXRjaGVyID0gbnVsbDtcbiAgICB0aGlzLnF1ZXVlZEV2ZW50SW5mb3MgPSBbXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlciBhIGRpc3BhdGNoZXIgZnVuY3Rpb24uIEV2ZW50IGluZm8gb2YgZWFjaCBldmVudCBtYXBwZWQgdG9cbiAgICogYSBqc2FjdGlvbiBpcyBwYXNzZWQgZm9yIGhhbmRsaW5nIHRvIHRoaXMgY2FsbGJhY2suIFRoZSBxdWV1ZWRcbiAgICogZXZlbnRzIGFyZSBwYXNzZWQgYXMgd2VsbCB0byB0aGUgZGlzcGF0Y2hlciBmb3IgbGF0ZXIgcmVwbGF5aW5nXG4gICAqIG9uY2UgdGhlIGRpc3BhdGNoZXIgaXMgcmVnaXN0ZXJlZC4gQ2xlYXJzIHRoZSBldmVudCBxdWV1ZSB0byBudWxsLlxuICAgKlxuICAgKiBAcGFyYW0gZGlzcGF0Y2hlciBUaGUgZGlzcGF0Y2hlciBmdW5jdGlvbi5cbiAgICogQHBhcmFtIHJlc3RyaWN0aW9uXG4gICAqL1xuICByZWdpc3RlckRpc3BhdGNoZXIoZGlzcGF0Y2hlcjogRGlzcGF0Y2hlciwgcmVzdHJpY3Rpb246IFJlc3RyaWN0aW9uKSB7XG4gICAgdGhpcy5lY3JkKGRpc3BhdGNoZXIsIHJlc3RyaWN0aW9uKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVbnJlbmFtZWQgYWxpYXMgZm9yIHJlZ2lzdGVyRGlzcGF0Y2hlci4gTmVjZXNzYXJ5IGZvciBhbnkgY29kZWJhc2VzIHRoYXRcbiAgICogc3BsaXQgdGhlIGBFdmVudENvbnRyYWN0YCBhbmQgYERpc3BhdGNoZXJgIGNvZGUgaW50byBkaWZmZXJlbnQgY29tcGlsYXRpb25cbiAgICogdW5pdHMuXG4gICAqL1xuICBlY3JkKGRpc3BhdGNoZXI6IERpc3BhdGNoZXIsIHJlc3RyaWN0aW9uOiBSZXN0cmljdGlvbikge1xuICAgIHRoaXMuZGlzcGF0Y2hlciA9IGRpc3BhdGNoZXI7XG5cbiAgICBpZiAodGhpcy5xdWV1ZWRFdmVudEluZm9zPy5sZW5ndGgpIHtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5xdWV1ZWRFdmVudEluZm9zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHRoaXMuaGFuZGxlRXZlbnRJbmZvKHRoaXMucXVldWVkRXZlbnRJbmZvc1tpXSk7XG4gICAgICB9XG4gICAgICB0aGlzLnF1ZXVlZEV2ZW50SW5mb3MgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGExMXkgY2xpY2sgc3VwcG9ydCB0byB0aGUgZ2l2ZW4gYEV2ZW50Q29udHJhY3RgLiBNZWFudCB0byBiZSBjYWxsZWQgaW5cbiAgICogdGhlIHNhbWUgY29tcGlsYXRpb24gdW5pdCBhcyB0aGUgYEV2ZW50Q29udHJhY3RgLlxuICAgKi9cbiAgYWRkQTExeUNsaWNrU3VwcG9ydCgpIHtcbiAgICB0aGlzLmFkZEExMXlDbGlja1N1cHBvcnRJbXBsKFxuICAgICAgYTExeUNsaWNrTGliLnVwZGF0ZUV2ZW50SW5mb0ZvckExMXlDbGljayxcbiAgICAgIGExMXlDbGlja0xpYi5wcmV2ZW50RGVmYXVsdEZvckExMXlDbGljayxcbiAgICAgIGExMXlDbGlja0xpYi5wb3B1bGF0ZUNsaWNrT25seUFjdGlvbixcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIEVuYWJsZXMgYTExeSBjbGljayBzdXBwb3J0IHRvIGJlIGRlZmVycmVkLiBNZWFudCB0byBiZSBjYWxsZWQgaW4gdGhlIHNhbWVcbiAgICogY29tcGlsYXRpb24gdW5pdCBhcyB0aGUgYEV2ZW50Q29udHJhY3RgLlxuICAgKi9cbiAgZXhwb3J0QWRkQTExeUNsaWNrU3VwcG9ydCgpIHtcbiAgICB0aGlzLmFkZEExMXlDbGlja0xpc3RlbmVyID0gdHJ1ZTtcbiAgICB0aGlzLmVjYWFjcyA9IHRoaXMuYWRkQTExeUNsaWNrU3VwcG9ydEltcGwuYmluZCh0aGlzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVbnJlbmFtZWQgZnVuY3Rpb24gdGhhdCBsb2FkcyBhMTF5Q2xpY2tTdXBwb3J0LlxuICAgKi9cbiAgcHJpdmF0ZSBhZGRBMTF5Q2xpY2tTdXBwb3J0SW1wbChcbiAgICB1cGRhdGVFdmVudEluZm9Gb3JBMTF5Q2xpY2s6IHR5cGVvZiBhMTF5Q2xpY2tMaWIudXBkYXRlRXZlbnRJbmZvRm9yQTExeUNsaWNrLFxuICAgIHByZXZlbnREZWZhdWx0Rm9yQTExeUNsaWNrOiB0eXBlb2YgYTExeUNsaWNrTGliLnByZXZlbnREZWZhdWx0Rm9yQTExeUNsaWNrLFxuICAgIHBvcHVsYXRlQ2xpY2tPbmx5QWN0aW9uOiB0eXBlb2YgYTExeUNsaWNrTGliLnBvcHVsYXRlQ2xpY2tPbmx5QWN0aW9uLFxuICApIHtcbiAgICB0aGlzLmFkZEExMXlDbGlja0xpc3RlbmVyID0gdHJ1ZTtcbiAgICBpZiAodGhpcy51c2VBY3Rpb25SZXNvbHZlcikge1xuICAgICAgdGhpcy5hY3Rpb25SZXNvbHZlciEuYWRkQTExeUNsaWNrU3VwcG9ydChcbiAgICAgICAgdXBkYXRlRXZlbnRJbmZvRm9yQTExeUNsaWNrLFxuICAgICAgICBwcmV2ZW50RGVmYXVsdEZvckExMXlDbGljayxcbiAgICAgICAgcG9wdWxhdGVDbGlja09ubHlBY3Rpb24sXG4gICAgICApO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiByZW1vdmVFdmVudExpc3RlbmVycyhcbiAgY29udGFpbmVyOiBIVE1MRWxlbWVudCxcbiAgZXZlbnRUeXBlczogc3RyaW5nW10sXG4gIGVhcmx5RXZlbnRIYW5kbGVyOiAoZTogRXZlbnQpID0+IHZvaWQsXG4gIGNhcHR1cmU/OiBib29sZWFuLFxuKSB7XG4gIGZvciAobGV0IGlkeCA9IDA7IGlkeCA8IGV2ZW50VHlwZXMubGVuZ3RoOyBpZHgrKykge1xuICAgIGNvbnRhaW5lci5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50VHlwZXNbaWR4XSwgZWFybHlFdmVudEhhbmRsZXIsIC8qIHVzZUNhcHR1cmUgKi8gY2FwdHVyZSk7XG4gIH1cbn1cblxuLyoqXG4gKiBBZGRzIGExMXkgY2xpY2sgc3VwcG9ydCB0byB0aGUgZ2l2ZW4gYEV2ZW50Q29udHJhY3RgLiBNZWFudCB0byBiZSBjYWxsZWRcbiAqIGluIGEgZGlmZmVyZW50IGNvbXBpbGF0aW9uIHVuaXQgZnJvbSB0aGUgYEV2ZW50Q29udHJhY3RgLiBUaGUgYEV2ZW50Q29udHJhY3RgXG4gKiBtdXN0IGhhdmUgY2FsbGVkIGBleHBvcnRBZGRBMTF5Q2xpY2tTdXBwb3J0YCBpbiBpdHMgY29tcGlsYXRpb24gdW5pdCBmb3IgdGhpc1xuICogdG8gaGF2ZSBhbnkgZWZmZWN0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gYWRkRGVmZXJyZWRBMTF5Q2xpY2tTdXBwb3J0KGV2ZW50Q29udHJhY3Q6IEV2ZW50Q29udHJhY3QpIHtcbiAgZXZlbnRDb250cmFjdC5lY2FhY3M/LihcbiAgICBhMTF5Q2xpY2tMaWIudXBkYXRlRXZlbnRJbmZvRm9yQTExeUNsaWNrLFxuICAgIGExMXlDbGlja0xpYi5wcmV2ZW50RGVmYXVsdEZvckExMXlDbGljayxcbiAgICBhMTF5Q2xpY2tMaWIucG9wdWxhdGVDbGlja09ubHlBY3Rpb24sXG4gICk7XG59XG4iXX0=