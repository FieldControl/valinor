/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Attribute } from './attribute';
import { Char } from './char';
import { EventType } from './event_type';
import { OWNER } from './property';
import * as cache from './cache';
import * as eventInfoLib from './event_info';
import * as eventLib from './event';
/**
 * Since maps from event to action are immutable we can use a single map
 * to represent the empty map.
 */
const EMPTY_ACTION_MAP = {};
/**
 * This regular expression matches a semicolon.
 */
const REGEXP_SEMICOLON = /\s*;\s*/;
/** If no event type is defined, defaults to `click`. */
const DEFAULT_EVENT_TYPE = EventType.CLICK;
/** Resolves actions for Events. */
export class ActionResolver {
    constructor({ syntheticMouseEventSupport = false, } = {}) {
        this.a11yClickSupport = false;
        this.updateEventInfoForA11yClick = undefined;
        this.preventDefaultForA11yClick = undefined;
        this.populateClickOnlyAction = undefined;
        this.syntheticMouseEventSupport = syntheticMouseEventSupport;
    }
    resolveEventType(eventInfo) {
        // We distinguish modified and plain clicks in order to support the
        // default browser behavior of modified clicks on links; usually to
        // open the URL of the link in new tab or new window on ctrl/cmd
        // click. A DOM 'click' event is mapped to the jsaction 'click'
        // event iff there is no modifier present on the event. If there is
        // a modifier, it's mapped to 'clickmod' instead.
        //
        // It's allowed to omit the event in the jsaction attribute. In that
        // case, 'click' is assumed. Thus the following two are equivalent:
        //
        //   <a href="someurl" jsaction="gna.fu">
        //   <a href="someurl" jsaction="click:gna.fu">
        //
        // For unmodified clicks, EventContract invokes the jsaction
        // 'gna.fu'. For modified clicks, EventContract won't find a
        // suitable action and leave the event to be handled by the
        // browser.
        //
        // In order to also invoke a jsaction handler for a modifier click,
        // 'clickmod' needs to be used:
        //
        //   <a href="someurl" jsaction="clickmod:gna.fu">
        //
        // EventContract invokes the jsaction 'gna.fu' for modified
        // clicks. Unmodified clicks are left to the browser.
        //
        // In order to set up the event contract to handle both clickonly and
        // clickmod, only addEvent(EventType.CLICK) is necessary.
        //
        // In order to set up the event contract to handle click,
        // addEvent() is necessary for CLICK, KEYDOWN, and KEYPRESS event types.  If
        // a11y click support is enabled, addEvent() will set up the appropriate key
        // event handler automatically.
        if (eventInfoLib.getEventType(eventInfo) === EventType.CLICK &&
            eventLib.isModifiedClickEvent(eventInfoLib.getEvent(eventInfo))) {
            eventInfoLib.setEventType(eventInfo, EventType.CLICKMOD);
        }
        else if (this.a11yClickSupport) {
            this.updateEventInfoForA11yClick(eventInfo);
        }
    }
    resolveAction(eventInfo) {
        if (eventInfoLib.getResolved(eventInfo)) {
            return;
        }
        this.populateAction(eventInfo, eventInfoLib.getTargetElement(eventInfo));
        eventInfoLib.setResolved(eventInfo, true);
    }
    resolveParentAction(eventInfo) {
        const action = eventInfoLib.getAction(eventInfo);
        const actionElement = action && eventInfoLib.getActionElement(action);
        eventInfoLib.unsetAction(eventInfo);
        const parentNode = actionElement && this.getParentNode(actionElement);
        if (!parentNode) {
            return;
        }
        this.populateAction(eventInfo, parentNode);
    }
    /**
     * Searches for a jsaction that the DOM event maps to and creates an
     * object containing event information used for dispatching by
     * jsaction.Dispatcher. This method populates the `action` and `actionElement`
     * fields of the EventInfo object passed in by finding the first
     * jsaction attribute above the target Node of the event, and below
     * the container Node, that specifies a jsaction for the event
     * type. If no such jsaction is found, then action is undefined.
     *
     * @param eventInfo `EventInfo` to set `action` and `actionElement` if an
     *    action is found on any `Element` in the path of the `Event`.
     */
    populateAction(eventInfo, currentTarget) {
        let actionElement = currentTarget;
        while (actionElement && actionElement !== eventInfoLib.getContainer(eventInfo)) {
            if (actionElement.nodeType === Node.ELEMENT_NODE) {
                this.populateActionOnElement(actionElement, eventInfo);
            }
            if (eventInfoLib.getAction(eventInfo)) {
                // An event is handled by at most one jsaction. Thus we stop at the
                // first matching jsaction specified in a jsaction attribute up the
                // ancestor chain of the event target node.
                break;
            }
            actionElement = this.getParentNode(actionElement);
        }
        const action = eventInfoLib.getAction(eventInfo);
        if (!action) {
            // No action found.
            return;
        }
        if (this.a11yClickSupport) {
            this.preventDefaultForA11yClick(eventInfo);
        }
        // We attempt to handle the mouseenter/mouseleave events here by
        // detecting whether the mouseover/mouseout events correspond to
        // entering/leaving an element.
        if (this.syntheticMouseEventSupport) {
            if (eventInfoLib.getEventType(eventInfo) === EventType.MOUSEENTER ||
                eventInfoLib.getEventType(eventInfo) === EventType.MOUSELEAVE ||
                eventInfoLib.getEventType(eventInfo) === EventType.POINTERENTER ||
                eventInfoLib.getEventType(eventInfo) === EventType.POINTERLEAVE) {
                // We attempt to handle the mouseenter/mouseleave events here by
                // detecting whether the mouseover/mouseout events correspond to
                // entering/leaving an element.
                if (eventLib.isMouseSpecialEvent(eventInfoLib.getEvent(eventInfo), eventInfoLib.getEventType(eventInfo), eventInfoLib.getActionElement(action))) {
                    // If both mouseover/mouseout and mouseenter/mouseleave events are
                    // enabled, two separate handlers for mouseover/mouseout are
                    // registered. Both handlers will see the same event instance
                    // so we create a copy to avoid interfering with the dispatching of
                    // the mouseover/mouseout event.
                    const copiedEvent = eventLib.createMouseSpecialEvent(eventInfoLib.getEvent(eventInfo), eventInfoLib.getActionElement(action));
                    eventInfoLib.setEvent(eventInfo, copiedEvent);
                    // Since the mouseenter/mouseleave events do not bubble, the target
                    // of the event is technically the `actionElement` (the node with the
                    // `jsaction` attribute)
                    eventInfoLib.setTargetElement(eventInfo, eventInfoLib.getActionElement(action));
                }
                else {
                    eventInfoLib.unsetAction(eventInfo);
                }
            }
        }
    }
    /**
     * Walk to the parent node, unless the node has a different owner in
     * which case we walk to the owner. Attempt to walk to host of a
     * shadow root if needed.
     */
    getParentNode(element) {
        const owner = element[OWNER];
        if (owner) {
            return owner;
        }
        const parentNode = element.parentNode;
        if (parentNode?.nodeName === '#document-fragment') {
            return parentNode?.host ?? null;
        }
        return parentNode;
    }
    /**
     * Accesses the jsaction map on a node and retrieves the name of the
     * action the given event is mapped to, if any. It parses the
     * attribute value and stores it in a property on the node for
     * subsequent retrieval without re-parsing and re-accessing the
     * attribute.
     *
     * @param actionElement The DOM node to retrieve the jsaction map from.
     * @param eventInfo `EventInfo` to set `action` and `actionElement` if an
     *    action is found on the `actionElement`.
     */
    populateActionOnElement(actionElement, eventInfo) {
        const actionMap = this.parseActions(actionElement);
        const actionName = actionMap[eventInfoLib.getEventType(eventInfo)];
        if (actionName !== undefined) {
            eventInfoLib.setAction(eventInfo, actionName, actionElement);
        }
        if (this.a11yClickSupport) {
            this.populateClickOnlyAction(actionElement, eventInfo, actionMap);
        }
    }
    /**
     * Parses and caches an element's jsaction element into a map.
     *
     * This is primarily for internal use.
     *
     * @param actionElement The DOM node to retrieve the jsaction map from.
     * @return Map from event to qualified name of the jsaction bound to it.
     */
    parseActions(actionElement) {
        let actionMap = cache.get(actionElement);
        if (!actionMap) {
            const jsactionAttribute = actionElement.getAttribute(Attribute.JSACTION);
            if (!jsactionAttribute) {
                actionMap = EMPTY_ACTION_MAP;
                cache.set(actionElement, actionMap);
            }
            else {
                actionMap = cache.getParsed(jsactionAttribute);
                if (!actionMap) {
                    actionMap = {};
                    const values = jsactionAttribute.split(REGEXP_SEMICOLON);
                    for (let idx = 0; idx < values.length; idx++) {
                        const value = values[idx];
                        if (!value) {
                            continue;
                        }
                        const colon = value.indexOf(Char.EVENT_ACTION_SEPARATOR);
                        const hasColon = colon !== -1;
                        const type = hasColon ? value.substr(0, colon).trim() : DEFAULT_EVENT_TYPE;
                        const action = hasColon ? value.substr(colon + 1).trim() : value;
                        actionMap[type] = action;
                    }
                    cache.setParsed(jsactionAttribute, actionMap);
                }
                cache.set(actionElement, actionMap);
            }
        }
        return actionMap;
    }
    addA11yClickSupport(updateEventInfoForA11yClick, preventDefaultForA11yClick, populateClickOnlyAction) {
        this.a11yClickSupport = true;
        this.updateEventInfoForA11yClick = updateEventInfoForA11yClick;
        this.preventDefaultForA11yClick = preventDefaultForA11yClick;
        this.populateClickOnlyAction = populateClickOnlyAction;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aW9uX3Jlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS9wcmltaXRpdmVzL2V2ZW50LWRpc3BhdGNoL3NyYy9hY3Rpb25fcmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLGFBQWEsQ0FBQztBQUN0QyxPQUFPLEVBQUMsSUFBSSxFQUFDLE1BQU0sUUFBUSxDQUFDO0FBQzVCLE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFDdkMsT0FBTyxFQUFDLEtBQUssRUFBQyxNQUFNLFlBQVksQ0FBQztBQUVqQyxPQUFPLEtBQUssS0FBSyxNQUFNLFNBQVMsQ0FBQztBQUNqQyxPQUFPLEtBQUssWUFBWSxNQUFNLGNBQWMsQ0FBQztBQUM3QyxPQUFPLEtBQUssUUFBUSxNQUFNLFNBQVMsQ0FBQztBQUVwQzs7O0dBR0c7QUFDSCxNQUFNLGdCQUFnQixHQUE0QixFQUFFLENBQUM7QUFFckQ7O0dBRUc7QUFDSCxNQUFNLGdCQUFnQixHQUFHLFNBQVMsQ0FBQztBQUVuQyx3REFBd0Q7QUFDeEQsTUFBTSxrQkFBa0IsR0FBVyxTQUFTLENBQUMsS0FBSyxDQUFDO0FBRW5ELG1DQUFtQztBQUNuQyxNQUFNLE9BQU8sY0FBYztJQWN6QixZQUFZLEVBQ1YsMEJBQTBCLEdBQUcsS0FBSyxNQUdoQyxFQUFFO1FBakJFLHFCQUFnQixHQUFZLEtBQUssQ0FBQztRQUdsQyxnQ0FBMkIsR0FBaUQsU0FBUyxDQUFDO1FBRXRGLCtCQUEwQixHQUFpRCxTQUFTLENBQUM7UUFFckYsNEJBQXVCLEdBSW5CLFNBQVMsQ0FBQztRQU9wQixJQUFJLENBQUMsMEJBQTBCLEdBQUcsMEJBQTBCLENBQUM7SUFDL0QsQ0FBQztJQUVELGdCQUFnQixDQUFDLFNBQWlDO1FBQ2hELG1FQUFtRTtRQUNuRSxt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LEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQzt3QkFDM0UsTUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO3dCQUNqRSxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDO29CQUMzQixDQUFDO29CQUNELEtBQUssQ0FBQyxTQUFTLENBQUMsaUJBQWlCLEVBQUUsU0FBUyxDQUFDLENBQUM7Z0JBQ2hELENBQUM7Z0JBQ0QsS0FBSyxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDdEMsQ0FBQztRQUNILENBQUM7UUFDRCxPQUFPLFNBQVMsQ0FBQztJQUNuQixDQUFDO0lBRUQsbUJBQW1CLENBQ2pCLDJCQUF5RSxFQUN6RSwwQkFBdUUsRUFDdkUsdUJBQWlFO1FBRWpFLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUM7UUFDN0IsSUFBSSxDQUFDLDJCQUEyQixHQUFHLDJCQUEyQixDQUFDO1FBQy9ELElBQUksQ0FBQywwQkFBMEIsR0FBRywwQkFBMEIsQ0FBQztRQUM3RCxJQUFJLENBQUMsdUJBQXVCLEdBQUcsdUJBQXVCLENBQUM7SUFDekQsQ0FBQztDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7QXR0cmlidXRlfSBmcm9tICcuL2F0dHJpYnV0ZSc7XG5pbXBvcnQge0NoYXJ9IGZyb20gJy4vY2hhcic7XG5pbXBvcnQge0V2ZW50VHlwZX0gZnJvbSAnLi9ldmVudF90eXBlJztcbmltcG9ydCB7T1dORVJ9IGZyb20gJy4vcHJvcGVydHknO1xuaW1wb3J0ICogYXMgYTExeUNsaWNrIGZyb20gJy4vYTExeV9jbGljayc7XG5pbXBvcnQgKiBhcyBjYWNoZSBmcm9tICcuL2NhY2hlJztcbmltcG9ydCAqIGFzIGV2ZW50SW5mb0xpYiBmcm9tICcuL2V2ZW50X2luZm8nO1xuaW1wb3J0ICogYXMgZXZlbnRMaWIgZnJvbSAnLi9ldmVudCc7XG5cbi8qKlxuICogU2luY2UgbWFwcyBmcm9tIGV2ZW50IHRvIGFjdGlvbiBhcmUgaW1tdXRhYmxlIHdlIGNhbiB1c2UgYSBzaW5nbGUgbWFwXG4gKiB0byByZXByZXNlbnQgdGhlIGVtcHR5IG1hcC5cbiAqL1xuY29uc3QgRU1QVFlfQUNUSU9OX01BUDoge1trZXk6IHN0cmluZ106IHN0cmluZ30gPSB7fTtcblxuLyoqXG4gKiBUaGlzIHJlZ3VsYXIgZXhwcmVzc2lvbiBtYXRjaGVzIGEgc2VtaWNvbG9uLlxuICovXG5jb25zdCBSRUdFWFBfU0VNSUNPTE9OID0gL1xccyo7XFxzKi87XG5cbi8qKiBJZiBubyBldmVudCB0eXBlIGlzIGRlZmluZWQsIGRlZmF1bHRzIHRvIGBjbGlja2AuICovXG5jb25zdCBERUZBVUxUX0VWRU5UX1RZUEU6IHN0cmluZyA9IEV2ZW50VHlwZS5DTElDSztcblxuLyoqIFJlc29sdmVzIGFjdGlvbnMgZm9yIEV2ZW50cy4gKi9cbmV4cG9ydCBjbGFzcyBBY3Rpb25SZXNvbHZlciB7XG4gIHByaXZhdGUgYTExeUNsaWNrU3VwcG9ydDogYm9vbGVhbiA9IGZhbHNlO1xuICBwcml2YXRlIHJlYWRvbmx5IHN5bnRoZXRpY01vdXNlRXZlbnRTdXBwb3J0OiBib29sZWFuO1xuXG4gIHByaXZhdGUgdXBkYXRlRXZlbnRJbmZvRm9yQTExeUNsaWNrPzogKGV2ZW50SW5mbzogZXZlbnRJbmZvTGliLkV2ZW50SW5mbykgPT4gdm9pZCA9IHVuZGVmaW5lZDtcblxuICBwcml2YXRlIHByZXZlbnREZWZhdWx0Rm9yQTExeUNsaWNrPzogKGV2ZW50SW5mbzogZXZlbnRJbmZvTGliLkV2ZW50SW5mbykgPT4gdm9pZCA9IHVuZGVmaW5lZDtcblxuICBwcml2YXRlIHBvcHVsYXRlQ2xpY2tPbmx5QWN0aW9uPzogKFxuICAgIGFjdGlvbkVsZW1lbnQ6IEVsZW1lbnQsXG4gICAgZXZlbnRJbmZvOiBldmVudEluZm9MaWIuRXZlbnRJbmZvLFxuICAgIGFjdGlvbk1hcDoge1trZXk6IHN0cmluZ106IHN0cmluZ30sXG4gICkgPT4gdm9pZCA9IHVuZGVmaW5lZDtcblxuICBjb25zdHJ1Y3Rvcih7XG4gICAgc3ludGhldGljTW91c2VFdmVudFN1cHBvcnQgPSBmYWxzZSxcbiAgfToge1xuICAgIHN5bnRoZXRpY01vdXNlRXZlbnRTdXBwb3J0PzogYm9vbGVhbjtcbiAgfSA9IHt9KSB7XG4gICAgdGhpcy5zeW50aGV0aWNNb3VzZUV2ZW50U3VwcG9ydCA9IHN5bnRoZXRpY01vdXNlRXZlbnRTdXBwb3J0O1xuICB9XG5cbiAgcmVzb2x2ZUV2ZW50VHlwZShldmVudEluZm86IGV2ZW50SW5mb0xpYi5FdmVudEluZm8pIHtcbiAgICAvLyBXZSBkaXN0aW5ndWlzaCBtb2RpZmllZCBhbmQgcGxhaW4gY2xpY2tzIGluIG9yZGVyIHRvIHN1cHBvcnQgdGhlXG4gICAgLy8gZGVmYXVsdCBicm93c2VyIGJlaGF2aW9yIG9mIG1vZGlmaWVkIGNsaWNrcyBvbiBsaW5rczsgdXN1YWxseSB0b1xuICAgIC8vIG9wZW4gdGhlIFVSTCBvZiB0aGUgbGluayBpbiBuZXcgdGFiIG9yIG5ldyB3aW5kb3cgb24gY3RybC9jbWRcbiAgICAvLyBjbGljay4gQSBET00gJ2NsaWNrJyBldmVudCBpcyBtYXBwZWQgdG8gdGhlIGpzYWN0aW9uICdjbGljaydcbiAgICAvLyBldmVudCBpZmYgdGhlcmUgaXMgbm8gbW9kaWZpZXIgcHJlc2VudCBvbiB0aGUgZXZlbnQuIElmIHRoZXJlIGlzXG4gICAgLy8gYSBtb2RpZmllciwgaXQncyBtYXBwZWQgdG8gJ2NsaWNrbW9kJyBpbnN0ZWFkLlxuICAgIC8vXG4gICAgLy8gSXQncyBhbGxvd2VkIHRvIG9taXQgdGhlIGV2ZW50IGluIHRoZSBqc2FjdGlvbiBhdHRyaWJ1dGUuIEluIHRoYXRcbiAgICAvLyBjYXNlLCAnY2xpY2snIGlzIGFzc3VtZWQuIFRodXMgdGhlIGZvbGxvd2luZyB0d28gYXJlIGVxdWl2YWxlbnQ6XG4gICAgLy9cbiAgICAvLyAgIDxhIGhyZWY9XCJzb21ldXJsXCIganNhY3Rpb249XCJnbmEuZnVcIj5cbiAgICAvLyAgIDxhIGhyZWY9XCJzb21ldXJsXCIganNhY3Rpb249XCJjbGljazpnbmEuZnVcIj5cbiAgICAvL1xuICAgIC8vIEZvciB1bm1vZGlmaWVkIGNsaWNrcywgRXZlbnRDb250cmFjdCBpbnZva2VzIHRoZSBqc2FjdGlvblxuICAgIC8vICdnbmEuZnUnLiBGb3IgbW9kaWZpZWQgY2xpY2tzLCBFdmVudENvbnRyYWN0IHdvbid0IGZpbmQgYVxuICAgIC8vIHN1aXRhYmxlIGFjdGlvbiBhbmQgbGVhdmUgdGhlIGV2ZW50IHRvIGJlIGhhbmRsZWQgYnkgdGhlXG4gICAgLy8gYnJvd3Nlci5cbiAgICAvL1xuICAgIC8vIEluIG9yZGVyIHRvIGFsc28gaW52b2tlIGEganNhY3Rpb24gaGFuZGxlciBmb3IgYSBtb2RpZmllciBjbGljayxcbiAgICAvLyAnY2xpY2ttb2QnIG5lZWRzIHRvIGJlIHVzZWQ6XG4gICAgLy9cbiAgICAvLyAgIDxhIGhyZWY9XCJzb21ldXJsXCIganNhY3Rpb249XCJjbGlja21vZDpnbmEuZnVcIj5cbiAgICAvL1xuICAgIC8vIEV2ZW50Q29udHJhY3QgaW52b2tlcyB0aGUganNhY3Rpb24gJ2duYS5mdScgZm9yIG1vZGlmaWVkXG4gICAgLy8gY2xpY2tzLiBVbm1vZGlmaWVkIGNsaWNrcyBhcmUgbGVmdCB0byB0aGUgYnJvd3Nlci5cbiAgICAvL1xuICAgIC8vIEluIG9yZGVyIHRvIHNldCB1cCB0aGUgZXZlbnQgY29udHJhY3QgdG8gaGFuZGxlIGJvdGggY2xpY2tvbmx5IGFuZFxuICAgIC8vIGNsaWNrbW9kLCBvbmx5IGFkZEV2ZW50KEV2ZW50VHlwZS5DTElDSykgaXMgbmVjZXNzYXJ5LlxuICAgIC8vXG4gICAgLy8gSW4gb3JkZXIgdG8gc2V0IHVwIHRoZSBldmVudCBjb250cmFjdCB0byBoYW5kbGUgY2xpY2ssXG4gICAgLy8gYWRkRXZlbnQoKSBpcyBuZWNlc3NhcnkgZm9yIENMSUNLLCBLRVlET1dOLCBhbmQgS0VZUFJFU1MgZXZlbnQgdHlwZXMuICBJZlxuICAgIC8vIGExMXkgY2xpY2sgc3VwcG9ydCBpcyBlbmFibGVkLCBhZGRFdmVudCgpIHdpbGwgc2V0IHVwIHRoZSBhcHByb3ByaWF0ZSBrZXlcbiAgICAvLyBldmVudCBoYW5kbGVyIGF1dG9tYXRpY2FsbHkuXG4gICAgaWYgKFxuICAgICAgZXZlbnRJbmZvTGliLmdldEV2ZW50VHlwZShldmVudEluZm8pID09PSBFdmVudFR5cGUuQ0xJQ0sgJiZcbiAgICAgIGV2ZW50TGliLmlzTW9kaWZpZWRDbGlja0V2ZW50KGV2ZW50SW5mb0xpYi5nZXRFdmVudChldmVudEluZm8pKVxuICAgICkge1xuICAgICAgZXZlbnRJbmZvTGliLnNldEV2ZW50VHlwZShldmVudEluZm8sIEV2ZW50VHlwZS5DTElDS01PRCk7XG4gICAgfSBlbHNlIGlmICh0aGlzLmExMXlDbGlja1N1cHBvcnQpIHtcbiAgICAgIHRoaXMudXBkYXRlRXZlbnRJbmZvRm9yQTExeUNsaWNrIShldmVudEluZm8pO1xuICAgIH1cbiAgfVxuXG4gIHJlc29sdmVBY3Rpb24oZXZlbnRJbmZvOiBldmVudEluZm9MaWIuRXZlbnRJbmZvKSB7XG4gICAgaWYgKGV2ZW50SW5mb0xpYi5nZXRSZXNvbHZlZChldmVudEluZm8pKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMucG9wdWxhdGVBY3Rpb24oZXZlbnRJbmZvLCBldmVudEluZm9MaWIuZ2V0VGFyZ2V0RWxlbWVudChldmVudEluZm8pKTtcbiAgICBldmVudEluZm9MaWIuc2V0UmVzb2x2ZWQoZXZlbnRJbmZvLCB0cnVlKTtcbiAgfVxuXG4gIHJlc29sdmVQYXJlbnRBY3Rpb24oZXZlbnRJbmZvOiBldmVudEluZm9MaWIuRXZlbnRJbmZvKSB7XG4gICAgY29uc3QgYWN0aW9uID0gZXZlbnRJbmZvTGliLmdldEFjdGlvbihldmVudEluZm8pO1xuICAgIGNvbnN0IGFjdGlvbkVsZW1lbnQgPSBhY3Rpb24gJiYgZXZlbnRJbmZvTGliLmdldEFjdGlvbkVsZW1lbnQoYWN0aW9uKTtcbiAgICBldmVudEluZm9MaWIudW5zZXRBY3Rpb24oZXZlbnRJbmZvKTtcbiAgICBjb25zdCBwYXJlbnROb2RlID0gYWN0aW9uRWxlbWVudCAmJiB0aGlzLmdldFBhcmVudE5vZGUoYWN0aW9uRWxlbWVudCk7XG4gICAgaWYgKCFwYXJlbnROb2RlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMucG9wdWxhdGVBY3Rpb24oZXZlbnRJbmZvLCBwYXJlbnROb2RlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWFyY2hlcyBmb3IgYSBqc2FjdGlvbiB0aGF0IHRoZSBET00gZXZlbnQgbWFwcyB0byBhbmQgY3JlYXRlcyBhblxuICAgKiBvYmplY3QgY29udGFpbmluZyBldmVudCBpbmZvcm1hdGlvbiB1c2VkIGZvciBkaXNwYXRjaGluZyBieVxuICAgKiBqc2FjdGlvbi5EaXNwYXRjaGVyLiBUaGlzIG1ldGhvZCBwb3B1bGF0ZXMgdGhlIGBhY3Rpb25gIGFuZCBgYWN0aW9uRWxlbWVudGBcbiAgICogZmllbGRzIG9mIHRoZSBFdmVudEluZm8gb2JqZWN0IHBhc3NlZCBpbiBieSBmaW5kaW5nIHRoZSBmaXJzdFxuICAgKiBqc2FjdGlvbiBhdHRyaWJ1dGUgYWJvdmUgdGhlIHRhcmdldCBOb2RlIG9mIHRoZSBldmVudCwgYW5kIGJlbG93XG4gICAqIHRoZSBjb250YWluZXIgTm9kZSwgdGhhdCBzcGVjaWZpZXMgYSBqc2FjdGlvbiBmb3IgdGhlIGV2ZW50XG4gICAqIHR5cGUuIElmIG5vIHN1Y2gganNhY3Rpb24gaXMgZm91bmQsIHRoZW4gYWN0aW9uIGlzIHVuZGVmaW5lZC5cbiAgICpcbiAgICogQHBhcmFtIGV2ZW50SW5mbyBgRXZlbnRJbmZvYCB0byBzZXQgYGFjdGlvbmAgYW5kIGBhY3Rpb25FbGVtZW50YCBpZiBhblxuICAgKiAgICBhY3Rpb24gaXMgZm91bmQgb24gYW55IGBFbGVtZW50YCBpbiB0aGUgcGF0aCBvZiB0aGUgYEV2ZW50YC5cbiAgICovXG4gIHByaXZhdGUgcG9wdWxhdGVBY3Rpb24oZXZlbnRJbmZvOiBldmVudEluZm9MaWIuRXZlbnRJbmZvLCBjdXJyZW50VGFyZ2V0OiBFbGVtZW50KSB7XG4gICAgbGV0IGFjdGlvbkVsZW1lbnQ6IEVsZW1lbnQgfCBudWxsID0gY3VycmVudFRhcmdldDtcbiAgICB3aGlsZSAoYWN0aW9uRWxlbWVudCAmJiBhY3Rpb25FbGVtZW50ICE9PSBldmVudEluZm9MaWIuZ2V0Q29udGFpbmVyKGV2ZW50SW5mbykpIHtcbiAgICAgIGlmIChhY3Rpb25FbGVtZW50Lm5vZGVUeXBlID09PSBOb2RlLkVMRU1FTlRfTk9ERSkge1xuICAgICAgICB0aGlzLnBvcHVsYXRlQWN0aW9uT25FbGVtZW50KGFjdGlvbkVsZW1lbnQsIGV2ZW50SW5mbyk7XG4gICAgICB9XG5cbiAgICAgIGlmIChldmVudEluZm9MaWIuZ2V0QWN0aW9uKGV2ZW50SW5mbykpIHtcbiAgICAgICAgLy8gQW4gZXZlbnQgaXMgaGFuZGxlZCBieSBhdCBtb3N0IG9uZSBqc2FjdGlvbi4gVGh1cyB3ZSBzdG9wIGF0IHRoZVxuICAgICAgICAvLyBmaXJzdCBtYXRjaGluZyBqc2FjdGlvbiBzcGVjaWZpZWQgaW4gYSBqc2FjdGlvbiBhdHRyaWJ1dGUgdXAgdGhlXG4gICAgICAgIC8vIGFuY2VzdG9yIGNoYWluIG9mIHRoZSBldmVudCB0YXJnZXQgbm9kZS5cbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBhY3Rpb25FbGVtZW50ID0gdGhpcy5nZXRQYXJlbnROb2RlKGFjdGlvbkVsZW1lbnQpO1xuICAgIH1cblxuICAgIGNvbnN0IGFjdGlvbiA9IGV2ZW50SW5mb0xpYi5nZXRBY3Rpb24oZXZlbnRJbmZvKTtcbiAgICBpZiAoIWFjdGlvbikge1xuICAgICAgLy8gTm8gYWN0aW9uIGZvdW5kLlxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmExMXlDbGlja1N1cHBvcnQpIHtcbiAgICAgIHRoaXMucHJldmVudERlZmF1bHRGb3JBMTF5Q2xpY2shKGV2ZW50SW5mbyk7XG4gICAgfVxuXG4gICAgLy8gV2UgYXR0ZW1wdCB0byBoYW5kbGUgdGhlIG1vdXNlZW50ZXIvbW91c2VsZWF2ZSBldmVudHMgaGVyZSBieVxuICAgIC8vIGRldGVjdGluZyB3aGV0aGVyIHRoZSBtb3VzZW92ZXIvbW91c2VvdXQgZXZlbnRzIGNvcnJlc3BvbmQgdG9cbiAgICAvLyBlbnRlcmluZy9sZWF2aW5nIGFuIGVsZW1lbnQuXG4gICAgaWYgKHRoaXMuc3ludGhldGljTW91c2VFdmVudFN1cHBvcnQpIHtcbiAgICAgIGlmIChcbiAgICAgICAgZXZlbnRJbmZvTGliLmdldEV2ZW50VHlwZShldmVudEluZm8pID09PSBFdmVudFR5cGUuTU9VU0VFTlRFUiB8fFxuICAgICAgICBldmVudEluZm9MaWIuZ2V0RXZlbnRUeXBlKGV2ZW50SW5mbykgPT09IEV2ZW50VHlwZS5NT1VTRUxFQVZFIHx8XG4gICAgICAgIGV2ZW50SW5mb0xpYi5nZXRFdmVudFR5cGUoZXZlbnRJbmZvKSA9PT0gRXZlbnRUeXBlLlBPSU5URVJFTlRFUiB8fFxuICAgICAgICBldmVudEluZm9MaWIuZ2V0RXZlbnRUeXBlKGV2ZW50SW5mbykgPT09IEV2ZW50VHlwZS5QT0lOVEVSTEVBVkVcbiAgICAgICkge1xuICAgICAgICAvLyBXZSBhdHRlbXB0IHRvIGhhbmRsZSB0aGUgbW91c2VlbnRlci9tb3VzZWxlYXZlIGV2ZW50cyBoZXJlIGJ5XG4gICAgICAgIC8vIGRldGVjdGluZyB3aGV0aGVyIHRoZSBtb3VzZW92ZXIvbW91c2VvdXQgZXZlbnRzIGNvcnJlc3BvbmQgdG9cbiAgICAgICAgLy8gZW50ZXJpbmcvbGVhdmluZyBhbiBlbGVtZW50LlxuICAgICAgICBpZiAoXG4gICAgICAgICAgZXZlbnRMaWIuaXNNb3VzZVNwZWNpYWxFdmVudChcbiAgICAgICAgICAgIGV2ZW50SW5mb0xpYi5nZXRFdmVudChldmVudEluZm8pLFxuICAgICAgICAgICAgZXZlbnRJbmZvTGliLmdldEV2ZW50VHlwZShldmVudEluZm8pLFxuICAgICAgICAgICAgZXZlbnRJbmZvTGliLmdldEFjdGlvbkVsZW1lbnQoYWN0aW9uKSxcbiAgICAgICAgICApXG4gICAgICAgICkge1xuICAgICAgICAgIC8vIElmIGJvdGggbW91c2VvdmVyL21vdXNlb3V0IGFuZCBtb3VzZWVudGVyL21vdXNlbGVhdmUgZXZlbnRzIGFyZVxuICAgICAgICAgIC8vIGVuYWJsZWQsIHR3byBzZXBhcmF0ZSBoYW5kbGVycyBmb3IgbW91c2VvdmVyL21vdXNlb3V0IGFyZVxuICAgICAgICAgIC8vIHJlZ2lzdGVyZWQuIEJvdGggaGFuZGxlcnMgd2lsbCBzZWUgdGhlIHNhbWUgZXZlbnQgaW5zdGFuY2VcbiAgICAgICAgICAvLyBzbyB3ZSBjcmVhdGUgYSBjb3B5IHRvIGF2b2lkIGludGVyZmVyaW5nIHdpdGggdGhlIGRpc3BhdGNoaW5nIG9mXG4gICAgICAgICAgLy8gdGhlIG1vdXNlb3Zlci9tb3VzZW91dCBldmVudC5cbiAgICAgICAgICBjb25zdCBjb3BpZWRFdmVudCA9IGV2ZW50TGliLmNyZWF0ZU1vdXNlU3BlY2lhbEV2ZW50KFxuICAgICAgICAgICAgZXZlbnRJbmZvTGliLmdldEV2ZW50KGV2ZW50SW5mbyksXG4gICAgICAgICAgICBldmVudEluZm9MaWIuZ2V0QWN0aW9uRWxlbWVudChhY3Rpb24pLFxuICAgICAgICAgICk7XG4gICAgICAgICAgZXZlbnRJbmZvTGliLnNldEV2ZW50KGV2ZW50SW5mbywgY29waWVkRXZlbnQpO1xuICAgICAgICAgIC8vIFNpbmNlIHRoZSBtb3VzZWVudGVyL21vdXNlbGVhdmUgZXZlbnRzIGRvIG5vdCBidWJibGUsIHRoZSB0YXJnZXRcbiAgICAgICAgICAvLyBvZiB0aGUgZXZlbnQgaXMgdGVjaG5pY2FsbHkgdGhlIGBhY3Rpb25FbGVtZW50YCAodGhlIG5vZGUgd2l0aCB0aGVcbiAgICAgICAgICAvLyBganNhY3Rpb25gIGF0dHJpYnV0ZSlcbiAgICAgICAgICBldmVudEluZm9MaWIuc2V0VGFyZ2V0RWxlbWVudChldmVudEluZm8sIGV2ZW50SW5mb0xpYi5nZXRBY3Rpb25FbGVtZW50KGFjdGlvbikpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGV2ZW50SW5mb0xpYi51bnNldEFjdGlvbihldmVudEluZm8pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFdhbGsgdG8gdGhlIHBhcmVudCBub2RlLCB1bmxlc3MgdGhlIG5vZGUgaGFzIGEgZGlmZmVyZW50IG93bmVyIGluXG4gICAqIHdoaWNoIGNhc2Ugd2Ugd2FsayB0byB0aGUgb3duZXIuIEF0dGVtcHQgdG8gd2FsayB0byBob3N0IG9mIGFcbiAgICogc2hhZG93IHJvb3QgaWYgbmVlZGVkLlxuICAgKi9cbiAgcHJpdmF0ZSBnZXRQYXJlbnROb2RlKGVsZW1lbnQ6IEVsZW1lbnQpOiBFbGVtZW50IHwgbnVsbCB7XG4gICAgY29uc3Qgb3duZXIgPSBlbGVtZW50W09XTkVSXTtcbiAgICBpZiAob3duZXIpIHtcbiAgICAgIHJldHVybiBvd25lciBhcyBFbGVtZW50O1xuICAgIH1cbiAgICBjb25zdCBwYXJlbnROb2RlID0gZWxlbWVudC5wYXJlbnROb2RlO1xuICAgIGlmIChwYXJlbnROb2RlPy5ub2RlTmFtZSA9PT0gJyNkb2N1bWVudC1mcmFnbWVudCcpIHtcbiAgICAgIHJldHVybiAocGFyZW50Tm9kZSBhcyBTaGFkb3dSb290IHwgbnVsbCk/Lmhvc3QgPz8gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIHBhcmVudE5vZGUgYXMgRWxlbWVudCB8IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogQWNjZXNzZXMgdGhlIGpzYWN0aW9uIG1hcCBvbiBhIG5vZGUgYW5kIHJldHJpZXZlcyB0aGUgbmFtZSBvZiB0aGVcbiAgICogYWN0aW9uIHRoZSBnaXZlbiBldmVudCBpcyBtYXBwZWQgdG8sIGlmIGFueS4gSXQgcGFyc2VzIHRoZVxuICAgKiBhdHRyaWJ1dGUgdmFsdWUgYW5kIHN0b3JlcyBpdCBpbiBhIHByb3BlcnR5IG9uIHRoZSBub2RlIGZvclxuICAgKiBzdWJzZXF1ZW50IHJldHJpZXZhbCB3aXRob3V0IHJlLXBhcnNpbmcgYW5kIHJlLWFjY2Vzc2luZyB0aGVcbiAgICogYXR0cmlidXRlLlxuICAgKlxuICAgKiBAcGFyYW0gYWN0aW9uRWxlbWVudCBUaGUgRE9NIG5vZGUgdG8gcmV0cmlldmUgdGhlIGpzYWN0aW9uIG1hcCBmcm9tLlxuICAgKiBAcGFyYW0gZXZlbnRJbmZvIGBFdmVudEluZm9gIHRvIHNldCBgYWN0aW9uYCBhbmQgYGFjdGlvbkVsZW1lbnRgIGlmIGFuXG4gICAqICAgIGFjdGlvbiBpcyBmb3VuZCBvbiB0aGUgYGFjdGlvbkVsZW1lbnRgLlxuICAgKi9cbiAgcHJpdmF0ZSBwb3B1bGF0ZUFjdGlvbk9uRWxlbWVudChhY3Rpb25FbGVtZW50OiBFbGVtZW50LCBldmVudEluZm86IGV2ZW50SW5mb0xpYi5FdmVudEluZm8pIHtcbiAgICBjb25zdCBhY3Rpb25NYXAgPSB0aGlzLnBhcnNlQWN0aW9ucyhhY3Rpb25FbGVtZW50KTtcblxuICAgIGNvbnN0IGFjdGlvbk5hbWUgPSBhY3Rpb25NYXBbZXZlbnRJbmZvTGliLmdldEV2ZW50VHlwZShldmVudEluZm8pXTtcbiAgICBpZiAoYWN0aW9uTmFtZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBldmVudEluZm9MaWIuc2V0QWN0aW9uKGV2ZW50SW5mbywgYWN0aW9uTmFtZSwgYWN0aW9uRWxlbWVudCk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuYTExeUNsaWNrU3VwcG9ydCkge1xuICAgICAgdGhpcy5wb3B1bGF0ZUNsaWNrT25seUFjdGlvbiEoYWN0aW9uRWxlbWVudCwgZXZlbnRJbmZvLCBhY3Rpb25NYXApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBQYXJzZXMgYW5kIGNhY2hlcyBhbiBlbGVtZW50J3MganNhY3Rpb24gZWxlbWVudCBpbnRvIGEgbWFwLlxuICAgKlxuICAgKiBUaGlzIGlzIHByaW1hcmlseSBmb3IgaW50ZXJuYWwgdXNlLlxuICAgKlxuICAgKiBAcGFyYW0gYWN0aW9uRWxlbWVudCBUaGUgRE9NIG5vZGUgdG8gcmV0cmlldmUgdGhlIGpzYWN0aW9uIG1hcCBmcm9tLlxuICAgKiBAcmV0dXJuIE1hcCBmcm9tIGV2ZW50IHRvIHF1YWxpZmllZCBuYW1lIG9mIHRoZSBqc2FjdGlvbiBib3VuZCB0byBpdC5cbiAgICovXG4gIHByaXZhdGUgcGFyc2VBY3Rpb25zKGFjdGlvbkVsZW1lbnQ6IEVsZW1lbnQpOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSB7XG4gICAgbGV0IGFjdGlvbk1hcDoge1trZXk6IHN0cmluZ106IHN0cmluZ30gfCB1bmRlZmluZWQgPSBjYWNoZS5nZXQoYWN0aW9uRWxlbWVudCk7XG4gICAgaWYgKCFhY3Rpb25NYXApIHtcbiAgICAgIGNvbnN0IGpzYWN0aW9uQXR0cmlidXRlID0gYWN0aW9uRWxlbWVudC5nZXRBdHRyaWJ1dGUoQXR0cmlidXRlLkpTQUNUSU9OKTtcbiAgICAgIGlmICghanNhY3Rpb25BdHRyaWJ1dGUpIHtcbiAgICAgICAgYWN0aW9uTWFwID0gRU1QVFlfQUNUSU9OX01BUDtcbiAgICAgICAgY2FjaGUuc2V0KGFjdGlvbkVsZW1lbnQsIGFjdGlvbk1hcCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhY3Rpb25NYXAgPSBjYWNoZS5nZXRQYXJzZWQoanNhY3Rpb25BdHRyaWJ1dGUpO1xuICAgICAgICBpZiAoIWFjdGlvbk1hcCkge1xuICAgICAgICAgIGFjdGlvbk1hcCA9IHt9O1xuICAgICAgICAgIGNvbnN0IHZhbHVlcyA9IGpzYWN0aW9uQXR0cmlidXRlLnNwbGl0KFJFR0VYUF9TRU1JQ09MT04pO1xuICAgICAgICAgIGZvciAobGV0IGlkeCA9IDA7IGlkeCA8IHZhbHVlcy5sZW5ndGg7IGlkeCsrKSB7XG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHZhbHVlc1tpZHhdO1xuICAgICAgICAgICAgaWYgKCF2YWx1ZSkge1xuICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGNvbG9uID0gdmFsdWUuaW5kZXhPZihDaGFyLkVWRU5UX0FDVElPTl9TRVBBUkFUT1IpO1xuICAgICAgICAgICAgY29uc3QgaGFzQ29sb24gPSBjb2xvbiAhPT0gLTE7XG4gICAgICAgICAgICBjb25zdCB0eXBlID0gaGFzQ29sb24gPyB2YWx1ZS5zdWJzdHIoMCwgY29sb24pLnRyaW0oKSA6IERFRkFVTFRfRVZFTlRfVFlQRTtcbiAgICAgICAgICAgIGNvbnN0IGFjdGlvbiA9IGhhc0NvbG9uID8gdmFsdWUuc3Vic3RyKGNvbG9uICsgMSkudHJpbSgpIDogdmFsdWU7XG4gICAgICAgICAgICBhY3Rpb25NYXBbdHlwZV0gPSBhY3Rpb247XG4gICAgICAgICAgfVxuICAgICAgICAgIGNhY2hlLnNldFBhcnNlZChqc2FjdGlvbkF0dHJpYnV0ZSwgYWN0aW9uTWFwKTtcbiAgICAgICAgfVxuICAgICAgICBjYWNoZS5zZXQoYWN0aW9uRWxlbWVudCwgYWN0aW9uTWFwKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGFjdGlvbk1hcDtcbiAgfVxuXG4gIGFkZEExMXlDbGlja1N1cHBvcnQoXG4gICAgdXBkYXRlRXZlbnRJbmZvRm9yQTExeUNsaWNrOiB0eXBlb2YgYTExeUNsaWNrLnVwZGF0ZUV2ZW50SW5mb0ZvckExMXlDbGljayxcbiAgICBwcmV2ZW50RGVmYXVsdEZvckExMXlDbGljazogdHlwZW9mIGExMXlDbGljay5wcmV2ZW50RGVmYXVsdEZvckExMXlDbGljayxcbiAgICBwb3B1bGF0ZUNsaWNrT25seUFjdGlvbjogdHlwZW9mIGExMXlDbGljay5wb3B1bGF0ZUNsaWNrT25seUFjdGlvbixcbiAgKSB7XG4gICAgdGhpcy5hMTF5Q2xpY2tTdXBwb3J0ID0gdHJ1ZTtcbiAgICB0aGlzLnVwZGF0ZUV2ZW50SW5mb0ZvckExMXlDbGljayA9IHVwZGF0ZUV2ZW50SW5mb0ZvckExMXlDbGljaztcbiAgICB0aGlzLnByZXZlbnREZWZhdWx0Rm9yQTExeUNsaWNrID0gcHJldmVudERlZmF1bHRGb3JBMTF5Q2xpY2s7XG4gICAgdGhpcy5wb3B1bGF0ZUNsaWNrT25seUFjdGlvbiA9IHBvcHVsYXRlQ2xpY2tPbmx5QWN0aW9uO1xuICB9XG59XG4iXX0=