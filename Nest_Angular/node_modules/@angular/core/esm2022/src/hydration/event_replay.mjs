/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { isEarlyEventType, isCaptureEventType, EventContractContainer, EventContract, EventDispatcher, registerDispatcher, getAppScopedQueuedEventInfos, clearAppScopedEarlyEventContract, } from '@angular/core/primitives/event-dispatch';
import { APP_BOOTSTRAP_LISTENER, ApplicationRef, whenStable } from '../application/application_ref';
import { ENVIRONMENT_INITIALIZER, Injector } from '../di';
import { inject } from '../di/injector_compatibility';
import { setStashFn } from '../render3/instructions/listener';
import { CLEANUP } from '../render3/interfaces/view';
import { isPlatformBrowser } from '../render3/util/misc_utils';
import { unwrapRNode } from '../render3/util/view_utils';
import { EVENT_REPLAY_ENABLED_DEFAULT, IS_EVENT_REPLAY_ENABLED } from './tokens';
import { sharedStashFunction, removeListeners, invokeRegisteredListeners, JSACTION_EVENT_CONTRACT, } from '../event_delegation_utils';
import { APP_ID } from '../application/application_tokens';
import { performanceMarkFeature } from '../util/performance';
/**
 * A set of DOM elements with `jsaction` attributes.
 */
const jsactionSet = new Set();
/**
 * Determines whether Event Replay feature should be activated on the client.
 */
function shouldEnableEventReplay(injector) {
    return injector.get(IS_EVENT_REPLAY_ENABLED, EVENT_REPLAY_ENABLED_DEFAULT);
}
/**
 * Returns a set of providers required to setup support for event replay.
 * Requires hydration to be enabled separately.
 */
export function withEventReplay() {
    return [
        {
            provide: IS_EVENT_REPLAY_ENABLED,
            useFactory: () => {
                let isEnabled = true;
                if (isPlatformBrowser()) {
                    // Note: globalThis[CONTRACT_PROPERTY] may be undefined in case Event Replay feature
                    // is enabled, but there are no events configured in this application, in which case
                    // we don't activate this feature, since there are no events to replay.
                    const appId = inject(APP_ID);
                    isEnabled = !!window._ejsas?.[appId];
                }
                if (isEnabled) {
                    performanceMarkFeature('NgEventReplay');
                }
                return isEnabled;
            },
        },
        {
            provide: ENVIRONMENT_INITIALIZER,
            useValue: () => {
                const injector = inject(Injector);
                if (isPlatformBrowser(injector) && shouldEnableEventReplay(injector)) {
                    setStashFn((rEl, eventName, listenerFn) => {
                        sharedStashFunction(rEl, eventName, listenerFn);
                        jsactionSet.add(rEl);
                    });
                }
            },
            multi: true,
        },
        {
            provide: APP_BOOTSTRAP_LISTENER,
            useFactory: () => {
                if (isPlatformBrowser()) {
                    const injector = inject(Injector);
                    const appRef = inject(ApplicationRef);
                    return () => {
                        if (!shouldEnableEventReplay(injector)) {
                            return;
                        }
                        // Kick off event replay logic once hydration for the initial part
                        // of the application is completed. This timing is similar to the unclaimed
                        // dehydrated views cleanup timing.
                        whenStable(appRef).then(() => {
                            const eventContractDetails = injector.get(JSACTION_EVENT_CONTRACT);
                            initEventReplay(eventContractDetails, injector);
                            jsactionSet.forEach(removeListeners);
                            // After hydration, we shouldn't need to do anymore work related to
                            // event replay anymore.
                            setStashFn(() => { });
                        });
                    };
                }
                return () => { }; // noop for the server code
            },
            multi: true,
        },
    ];
}
const initEventReplay = (eventDelegation, injector) => {
    const appId = injector.get(APP_ID);
    // This is set in packages/platform-server/src/utils.ts
    const earlyJsactionData = window._ejsas[appId];
    const eventContract = (eventDelegation.instance = new EventContract(new EventContractContainer(earlyJsactionData.c)));
    for (const et of earlyJsactionData.et) {
        eventContract.addEvent(et);
    }
    for (const et of earlyJsactionData.etc) {
        eventContract.addEvent(et);
    }
    const eventInfos = getAppScopedQueuedEventInfos(appId);
    eventContract.replayEarlyEventInfos(eventInfos);
    clearAppScopedEarlyEventContract(appId);
    const dispatcher = new EventDispatcher(invokeRegisteredListeners);
    registerDispatcher(eventContract, dispatcher);
};
/**
 * Extracts information about all DOM events (added in a template) registered on elements in a give
 * LView. Maps collected events to a corresponding DOM element (an element is used as a key).
 */
export function collectDomEventsInfo(tView, lView, eventTypesToReplay) {
    const domEventsInfo = new Map();
    const lCleanup = lView[CLEANUP];
    const tCleanup = tView.cleanup;
    if (!tCleanup || !lCleanup) {
        return domEventsInfo;
    }
    for (let i = 0; i < tCleanup.length;) {
        const firstParam = tCleanup[i++];
        const secondParam = tCleanup[i++];
        if (typeof firstParam !== 'string') {
            continue;
        }
        const eventType = firstParam;
        if (!isEarlyEventType(eventType)) {
            continue;
        }
        if (isCaptureEventType(eventType)) {
            eventTypesToReplay.capture.add(eventType);
        }
        else {
            eventTypesToReplay.regular.add(eventType);
        }
        const listenerElement = unwrapRNode(lView[secondParam]);
        i++; // move the cursor to the next position (location of the listener idx)
        const useCaptureOrIndx = tCleanup[i++];
        // if useCaptureOrIndx is boolean then report it as is.
        // if useCaptureOrIndx is positive number then it in unsubscribe method
        // if useCaptureOrIndx is negative number then it is a Subscription
        const isDomEvent = typeof useCaptureOrIndx === 'boolean' || useCaptureOrIndx >= 0;
        if (!isDomEvent) {
            continue;
        }
        if (!domEventsInfo.has(listenerElement)) {
            domEventsInfo.set(listenerElement, [eventType]);
        }
        else {
            domEventsInfo.get(listenerElement).push(eventType);
        }
    }
    return domEventsInfo;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnRfcmVwbGF5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS9zcmMvaHlkcmF0aW9uL2V2ZW50X3JlcGxheS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQ0wsZ0JBQWdCLEVBQ2hCLGtCQUFrQixFQUNsQixzQkFBc0IsRUFDdEIsYUFBYSxFQUNiLGVBQWUsRUFDZixrQkFBa0IsRUFDbEIsNEJBQTRCLEVBQzVCLGdDQUFnQyxHQUNqQyxNQUFNLHlDQUF5QyxDQUFDO0FBRWpELE9BQU8sRUFBQyxzQkFBc0IsRUFBRSxjQUFjLEVBQUUsVUFBVSxFQUFDLE1BQU0sZ0NBQWdDLENBQUM7QUFDbEcsT0FBTyxFQUFDLHVCQUF1QixFQUFFLFFBQVEsRUFBQyxNQUFNLE9BQU8sQ0FBQztBQUN4RCxPQUFPLEVBQUMsTUFBTSxFQUFDLE1BQU0sOEJBQThCLENBQUM7QUFFcEQsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLGtDQUFrQyxDQUFDO0FBRTVELE9BQU8sRUFBQyxPQUFPLEVBQWUsTUFBTSw0QkFBNEIsQ0FBQztBQUNqRSxPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSw0QkFBNEIsQ0FBQztBQUM3RCxPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0sNEJBQTRCLENBQUM7QUFFdkQsT0FBTyxFQUFDLDRCQUE0QixFQUFFLHVCQUF1QixFQUFDLE1BQU0sVUFBVSxDQUFDO0FBQy9FLE9BQU8sRUFDTCxtQkFBbUIsRUFDbkIsZUFBZSxFQUNmLHlCQUF5QixFQUV6Qix1QkFBdUIsR0FDeEIsTUFBTSwyQkFBMkIsQ0FBQztBQUNuQyxPQUFPLEVBQUMsTUFBTSxFQUFDLE1BQU0sbUNBQW1DLENBQUM7QUFDekQsT0FBTyxFQUFDLHNCQUFzQixFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFFM0Q7O0dBRUc7QUFDSCxNQUFNLFdBQVcsR0FBRyxJQUFJLEdB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R0FBRyxDQUFDLGVBQWUsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7UUFDbEQsQ0FBQzthQUFNLENBQUM7WUFDTixhQUFhLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUN0RCxDQUFDO0lBQ0gsQ0FBQztJQUNELE9BQU8sYUFBYSxDQUFDO0FBQ3ZCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbmltcG9ydCB7XG4gIGlzRWFybHlFdmVudFR5cGUsXG4gIGlzQ2FwdHVyZUV2ZW50VHlwZSxcbiAgRXZlbnRDb250cmFjdENvbnRhaW5lcixcbiAgRXZlbnRDb250cmFjdCxcbiAgRXZlbnREaXNwYXRjaGVyLFxuICByZWdpc3RlckRpc3BhdGNoZXIsXG4gIGdldEFwcFNjb3BlZFF1ZXVlZEV2ZW50SW5mb3MsXG4gIGNsZWFyQXBwU2NvcGVkRWFybHlFdmVudENvbnRyYWN0LFxufSBmcm9tICdAYW5ndWxhci9jb3JlL3ByaW1pdGl2ZXMvZXZlbnQtZGlzcGF0Y2gnO1xuXG5pbXBvcnQge0FQUF9CT09UU1RSQVBfTElTVEVORVIsIEFwcGxpY2F0aW9uUmVmLCB3aGVuU3RhYmxlfSBmcm9tICcuLi9hcHBsaWNhdGlvbi9hcHBsaWNhdGlvbl9yZWYnO1xuaW1wb3J0IHtFTlZJUk9OTUVOVF9JTklUSUFMSVpFUiwgSW5qZWN0b3J9IGZyb20gJy4uL2RpJztcbmltcG9ydCB7aW5qZWN0fSBmcm9tICcuLi9kaS9pbmplY3Rvcl9jb21wYXRpYmlsaXR5JztcbmltcG9ydCB7UHJvdmlkZXJ9IGZyb20gJy4uL2RpL2ludGVyZmFjZS9wcm92aWRlcic7XG5pbXBvcnQge3NldFN0YXNoRm59IGZyb20gJy4uL3JlbmRlcjMvaW5zdHJ1Y3Rpb25zL2xpc3RlbmVyJztcbmltcG9ydCB7UkVsZW1lbnR9IGZyb20gJy4uL3JlbmRlcjMvaW50ZXJmYWNlcy9yZW5kZXJlcl9kb20nO1xuaW1wb3J0IHtDTEVBTlVQLCBMVmlldywgVFZpZXd9IGZyb20gJy4uL3JlbmRlcjMvaW50ZXJmYWNlcy92aWV3JztcbmltcG9ydCB7aXNQbGF0Zm9ybUJyb3dzZXJ9IGZyb20gJy4uL3JlbmRlcjMvdXRpbC9taXNjX3V0aWxzJztcbmltcG9ydCB7dW53cmFwUk5vZGV9IGZyb20gJy4uL3JlbmRlcjMvdXRpbC92aWV3X3V0aWxzJztcblxuaW1wb3J0IHtFVkVOVF9SRVBMQVlfRU5BQkxFRF9ERUZBVUxULCBJU19FVkVOVF9SRVBMQVlfRU5BQkxFRH0gZnJvbSAnLi90b2tlbnMnO1xuaW1wb3J0IHtcbiAgc2hhcmVkU3Rhc2hGdW5jdGlvbixcbiAgcmVtb3ZlTGlzdGVuZXJzLFxuICBpbnZva2VSZWdpc3RlcmVkTGlzdGVuZXJzLFxuICBFdmVudENvbnRyYWN0RGV0YWlscyxcbiAgSlNBQ1RJT05fRVZFTlRfQ09OVFJBQ1QsXG59IGZyb20gJy4uL2V2ZW50X2RlbGVnYXRpb25fdXRpbHMnO1xuaW1wb3J0IHtBUFBfSUR9IGZyb20gJy4uL2FwcGxpY2F0aW9uL2FwcGxpY2F0aW9uX3Rva2Vucyc7XG5pbXBvcnQge3BlcmZvcm1hbmNlTWFya0ZlYXR1cmV9IGZyb20gJy4uL3V0aWwvcGVyZm9ybWFuY2UnO1xuXG4vKipcbiAqIEEgc2V0IG9mIERPTSBlbGVtZW50cyB3aXRoIGBqc2FjdGlvbmAgYXR0cmlidXRlcy5cbiAqL1xuY29uc3QganNhY3Rpb25TZXQgPSBuZXcgU2V0PEVsZW1lbnQ+KCk7XG5cbi8qKlxuICogRGV0ZXJtaW5lcyB3aGV0aGVyIEV2ZW50IFJlcGxheSBmZWF0dXJlIHNob3VsZCBiZSBhY3RpdmF0ZWQgb24gdGhlIGNsaWVudC5cbiAqL1xuZnVuY3Rpb24gc2hvdWxkRW5hYmxlRXZlbnRSZXBsYXkoaW5qZWN0b3I6IEluamVjdG9yKSB7XG4gIHJldHVybiBpbmplY3Rvci5nZXQoSVNfRVZFTlRfUkVQTEFZX0VOQUJMRUQsIEVWRU5UX1JFUExBWV9FTkFCTEVEX0RFRkFVTFQpO1xufVxuXG4vKipcbiAqIFJldHVybnMgYSBzZXQgb2YgcHJvdmlkZXJzIHJlcXVpcmVkIHRvIHNldHVwIHN1cHBvcnQgZm9yIGV2ZW50IHJlcGxheS5cbiAqIFJlcXVpcmVzIGh5ZHJhdGlvbiB0byBiZSBlbmFibGVkIHNlcGFyYXRlbHkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB3aXRoRXZlbnRSZXBsYXkoKTogUHJvdmlkZXJbXSB7XG4gIHJldHVybiBbXG4gICAge1xuICAgICAgcHJvdmlkZTogSVNfRVZFTlRfUkVQTEFZX0VOQUJMRUQsXG4gICAgICB1c2VGYWN0b3J5OiAoKSA9PiB7XG4gICAgICAgIGxldCBpc0VuYWJsZWQgPSB0cnVlO1xuICAgICAgICBpZiAoaXNQbGF0Zm9ybUJyb3dzZXIoKSkge1xuICAgICAgICAgIC8vIE5vdGU6IGdsb2JhbFRoaXNbQ09OVFJBQ1RfUFJPUEVSVFldIG1heSBiZSB1bmRlZmluZWQgaW4gY2FzZSBFdmVudCBSZXBsYXkgZmVhdHVyZVxuICAgICAgICAgIC8vIGlzIGVuYWJsZWQsIGJ1dCB0aGVyZSBhcmUgbm8gZXZlbnRzIGNvbmZpZ3VyZWQgaW4gdGhpcyBhcHBsaWNhdGlvbiwgaW4gd2hpY2ggY2FzZVxuICAgICAgICAgIC8vIHdlIGRvbid0IGFjdGl2YXRlIHRoaXMgZmVhdHVyZSwgc2luY2UgdGhlcmUgYXJlIG5vIGV2ZW50cyB0byByZXBsYXkuXG4gICAgICAgICAgY29uc3QgYXBwSWQgPSBpbmplY3QoQVBQX0lEKTtcbiAgICAgICAgICBpc0VuYWJsZWQgPSAhIXdpbmRvdy5fZWpzYXM/LlthcHBJZF07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzRW5hYmxlZCkge1xuICAgICAgICAgIHBlcmZvcm1hbmNlTWFya0ZlYXR1cmUoJ05nRXZlbnRSZXBsYXknKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaXNFbmFibGVkO1xuICAgICAgfSxcbiAgICB9LFxuICAgIHtcbiAgICAgIHByb3ZpZGU6IEVOVklST05NRU5UX0lOSVRJQUxJWkVSLFxuICAgICAgdXNlVmFsdWU6ICgpID0+IHtcbiAgICAgICAgY29uc3QgaW5qZWN0b3IgPSBpbmplY3QoSW5qZWN0b3IpO1xuICAgICAgICBpZiAoaXNQbGF0Zm9ybUJyb3dzZXIoaW5qZWN0b3IpICYmIHNob3VsZEVuYWJsZUV2ZW50UmVwbGF5KGluamVjdG9yKSkge1xuICAgICAgICAgIHNldFN0YXNoRm4oKHJFbDogUkVsZW1lbnQsIGV2ZW50TmFtZTogc3RyaW5nLCBsaXN0ZW5lckZuOiBWb2lkRnVuY3Rpb24pID0+IHtcbiAgICAgICAgICAgIHNoYXJlZFN0YXNoRnVuY3Rpb24ockVsLCBldmVudE5hbWUsIGxpc3RlbmVyRm4pO1xuICAgICAgICAgICAganNhY3Rpb25TZXQuYWRkKHJFbCBhcyB1bmtub3duIGFzIEVsZW1lbnQpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgbXVsdGk6IHRydWUsXG4gICAgfSxcbiAgICB7XG4gICAgICBwcm92aWRlOiBBUFBfQk9PVFNUUkFQX0xJU1RFTkVSLFxuICAgICAgdXNlRmFjdG9yeTogKCkgPT4ge1xuICAgICAgICBpZiAoaXNQbGF0Zm9ybUJyb3dzZXIoKSkge1xuICAgICAgICAgIGNvbnN0IGluamVjdG9yID0gaW5qZWN0KEluamVjdG9yKTtcbiAgICAgICAgICBjb25zdCBhcHBSZWYgPSBpbmplY3QoQXBwbGljYXRpb25SZWYpO1xuICAgICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICBpZiAoIXNob3VsZEVuYWJsZUV2ZW50UmVwbGF5KGluamVjdG9yKSkge1xuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEtpY2sgb2ZmIGV2ZW50IHJlcGxheSBsb2dpYyBvbmNlIGh5ZHJhdGlvbiBmb3IgdGhlIGluaXRpYWwgcGFydFxuICAgICAgICAgICAgLy8gb2YgdGhlIGFwcGxpY2F0aW9uIGlzIGNvbXBsZXRlZC4gVGhpcyB0aW1pbmcgaXMgc2ltaWxhciB0byB0aGUgdW5jbGFpbWVkXG4gICAgICAgICAgICAvLyBkZWh5ZHJhdGVkIHZpZXdzIGNsZWFudXAgdGltaW5nLlxuICAgICAgICAgICAgd2hlblN0YWJsZShhcHBSZWYpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICBjb25zdCBldmVudENvbnRyYWN0RGV0YWlscyA9IGluamVjdG9yLmdldChKU0FDVElPTl9FVkVOVF9DT05UUkFDVCk7XG4gICAgICAgICAgICAgIGluaXRFdmVudFJlcGxheShldmVudENvbnRyYWN0RGV0YWlscywgaW5qZWN0b3IpO1xuICAgICAgICAgICAgICBqc2FjdGlvblNldC5mb3JFYWNoKHJlbW92ZUxpc3RlbmVycyk7XG4gICAgICAgICAgICAgIC8vIEFmdGVyIGh5ZHJhdGlvbiwgd2Ugc2hvdWxkbid0IG5lZWQgdG8gZG8gYW55bW9yZSB3b3JrIHJlbGF0ZWQgdG9cbiAgICAgICAgICAgICAgLy8gZXZlbnQgcmVwbGF5IGFueW1vcmUuXG4gICAgICAgICAgICAgIHNldFN0YXNoRm4oKCkgPT4ge30pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gKCkgPT4ge307IC8vIG5vb3AgZm9yIHRoZSBzZXJ2ZXIgY29kZVxuICAgICAgfSxcbiAgICAgIG11bHRpOiB0cnVlLFxuICAgIH0sXG4gIF07XG59XG5cbmNvbnN0IGluaXRFdmVudFJlcGxheSA9IChldmVudERlbGVnYXRpb246IEV2ZW50Q29udHJhY3REZXRhaWxzLCBpbmplY3RvcjogSW5qZWN0b3IpID0+IHtcbiAgY29uc3QgYXBwSWQgPSBpbmplY3Rvci5nZXQoQVBQX0lEKTtcbiAgLy8gVGhpcyBpcyBzZXQgaW4gcGFja2FnZXMvcGxhdGZvcm0tc2VydmVyL3NyYy91dGlscy50c1xuICBjb25zdCBlYXJseUpzYWN0aW9uRGF0YSA9IHdpbmRvdy5fZWpzYXMhW2FwcElkXSE7XG4gIGNvbnN0IGV2ZW50Q29udHJhY3QgPSAoZXZlbnREZWxlZ2F0aW9uLmluc3RhbmNlID0gbmV3IEV2ZW50Q29udHJhY3QoXG4gICAgbmV3IEV2ZW50Q29udHJhY3RDb250YWluZXIoZWFybHlKc2FjdGlvbkRhdGEuYyksXG4gICkpO1xuICBmb3IgKGNvbnN0IGV0IG9mIGVhcmx5SnNhY3Rpb25EYXRhLmV0KSB7XG4gICAgZXZlbnRDb250cmFjdC5hZGRFdmVudChldCk7XG4gIH1cbiAgZm9yIChjb25zdCBldCBvZiBlYXJseUpzYWN0aW9uRGF0YS5ldGMpIHtcbiAgICBldmVudENvbnRyYWN0LmFkZEV2ZW50KGV0KTtcbiAgfVxuICBjb25zdCBldmVudEluZm9zID0gZ2V0QXBwU2NvcGVkUXVldWVkRXZlbnRJbmZvcyhhcHBJZCk7XG4gIGV2ZW50Q29udHJhY3QucmVwbGF5RWFybHlFdmVudEluZm9zKGV2ZW50SW5mb3MpO1xuICBjbGVhckFwcFNjb3BlZEVhcmx5RXZlbnRDb250cmFjdChhcHBJZCk7XG4gIGNvbnN0IGRpc3BhdGNoZXIgPSBuZXcgRXZlbnREaXNwYXRjaGVyKGludm9rZVJlZ2lzdGVyZWRMaXN0ZW5lcnMpO1xuICByZWdpc3RlckRpc3BhdGNoZXIoZXZlbnRDb250cmFjdCwgZGlzcGF0Y2hlcik7XG59O1xuXG4vKipcbiAqIEV4dHJhY3RzIGluZm9ybWF0aW9uIGFib3V0IGFsbCBET00gZXZlbnRzIChhZGRlZCBpbiBhIHRlbXBsYXRlKSByZWdpc3RlcmVkIG9uIGVsZW1lbnRzIGluIGEgZ2l2ZVxuICogTFZpZXcuIE1hcHMgY29sbGVjdGVkIGV2ZW50cyB0byBhIGNvcnJlc3BvbmRpbmcgRE9NIGVsZW1lbnQgKGFuIGVsZW1lbnQgaXMgdXNlZCBhcyBhIGtleSkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb2xsZWN0RG9tRXZlbnRzSW5mbyhcbiAgdFZpZXc6IFRWaWV3LFxuICBsVmlldzogTFZpZXcsXG4gIGV2ZW50VHlwZXNUb1JlcGxheToge3JlZ3VsYXI6IFNldDxzdHJpbmc+OyBjYXB0dXJlOiBTZXQ8c3RyaW5nPn0sXG4pOiBNYXA8RWxlbWVudCwgc3RyaW5nW10+IHtcbiAgY29uc3QgZG9tRXZlbnRzSW5mbyA9IG5ldyBNYXA8RWxlbWVudCwgc3RyaW5nW10+KCk7XG4gIGNvbnN0IGxDbGVhbnVwID0gbFZpZXdbQ0xFQU5VUF07XG4gIGNvbnN0IHRDbGVhbnVwID0gdFZpZXcuY2xlYW51cDtcbiAgaWYgKCF0Q2xlYW51cCB8fCAhbENsZWFudXApIHtcbiAgICByZXR1cm4gZG9tRXZlbnRzSW5mbztcbiAgfVxuICBmb3IgKGxldCBpID0gMDsgaSA8IHRDbGVhbnVwLmxlbmd0aDsgKSB7XG4gICAgY29uc3QgZmlyc3RQYXJhbSA9IHRDbGVhbnVwW2krK107XG4gICAgY29uc3Qgc2Vjb25kUGFyYW0gPSB0Q2xlYW51cFtpKytdO1xuICAgIGlmICh0eXBlb2YgZmlyc3RQYXJhbSAhPT0gJ3N0cmluZycpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICBjb25zdCBldmVudFR5cGUgPSBmaXJzdFBhcmFtO1xuICAgIGlmICghaXNFYXJseUV2ZW50VHlwZShldmVudFR5cGUpKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgaWYgKGlzQ2FwdHVyZUV2ZW50VHlwZShldmVudFR5cGUpKSB7XG4gICAgICBldmVudFR5cGVzVG9SZXBsYXkuY2FwdHVyZS5hZGQoZXZlbnRUeXBlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZXZlbnRUeXBlc1RvUmVwbGF5LnJlZ3VsYXIuYWRkKGV2ZW50VHlwZSk7XG4gICAgfVxuICAgIGNvbnN0IGxpc3RlbmVyRWxlbWVudCA9IHVud3JhcFJOb2RlKGxWaWV3W3NlY29uZFBhcmFtXSkgYXMgYW55IGFzIEVsZW1lbnQ7XG4gICAgaSsrOyAvLyBtb3ZlIHRoZSBjdXJzb3IgdG8gdGhlIG5leHQgcG9zaXRpb24gKGxvY2F0aW9uIG9mIHRoZSBsaXN0ZW5lciBpZHgpXG4gICAgY29uc3QgdXNlQ2FwdHVyZU9ySW5keCA9IHRDbGVhbnVwW2krK107XG4gICAgLy8gaWYgdXNlQ2FwdHVyZU9ySW5keCBpcyBib29sZWFuIHRoZW4gcmVwb3J0IGl0IGFzIGlzLlxuICAgIC8vIGlmIHVzZUNhcHR1cmVPckluZHggaXMgcG9zaXRpdmUgbnVtYmVyIHRoZW4gaXQgaW4gdW5zdWJzY3JpYmUgbWV0aG9kXG4gICAgLy8gaWYgdXNlQ2FwdHVyZU9ySW5keCBpcyBuZWdhdGl2ZSBudW1iZXIgdGhlbiBpdCBpcyBhIFN1YnNjcmlwdGlvblxuICAgIGNvbnN0IGlzRG9tRXZlbnQgPSB0eXBlb2YgdXNlQ2FwdHVyZU9ySW5keCA9PT0gJ2Jvb2xlYW4nIHx8IHVzZUNhcHR1cmVPckluZHggPj0gMDtcbiAgICBpZiAoIWlzRG9tRXZlbnQpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICBpZiAoIWRvbUV2ZW50c0luZm8uaGFzKGxpc3RlbmVyRWxlbWVudCkpIHtcbiAgICAgIGRvbUV2ZW50c0luZm8uc2V0KGxpc3RlbmVyRWxlbWVudCwgW2V2ZW50VHlwZV0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBkb21FdmVudHNJbmZvLmdldChsaXN0ZW5lckVsZW1lbnQpIS5wdXNoKGV2ZW50VHlwZSk7XG4gICAgfVxuICB9XG4gIHJldHVybiBkb21FdmVudHNJbmZvO1xufVxuIl19