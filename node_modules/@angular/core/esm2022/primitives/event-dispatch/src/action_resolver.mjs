/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Attribute } from './attribute';
import { Char } from './char';
import { EventType } from './event_type';
import { Property } from './property';
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
    constructor({ syntheticMouseEventSupport = false, clickModSupport = true, } = {}) {
        this.a11yClickSupport = false;
        this.clickModSupport = true;
        this.updateEventInfoForA11yClick = undefined;
        this.preventDefaultForA11yClick = undefined;
        this.populateClickOnlyAction = undefined;
        this.syntheticMouseEventSupport = syntheticMouseEventSupport;
        this.clickModSupport = clickModSupport;
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
        if (this.clickModSupport &&
            eventInfoLib.getEventType(eventInfo) === EventType.CLICK &&
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
        const owner = element[Property.OWNER];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aW9uX3Jlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS9wcmltaXRpdmVzL2V2ZW50LWRpc3BhdGNoL3NyYy9hY3Rpb25fcmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLGFBQWEsQ0FBQztBQUN0QyxPQUFPLEVBQUMsSUFBSSxFQUFDLE1BQU0sUUFBUSxDQUFDO0FBQzVCLE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFDdkMsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLFlBQVksQ0FBQztBQUVwQyxPQUFPLEtBQUssS0FBSyxNQUFNLFNBQVMsQ0FBQztBQUNqQyxPQUFPLEtBQUssWUFBWSxNQUFNLGNBQWMsQ0FBQztBQUM3QyxPQUFPLEtBQUssUUFBUSxNQUFNLFNBQVMsQ0FBQztBQUVwQzs7O0dBR0c7QUFDSCxNQUFNLGdCQUFnQixHQUE0QixFQUFFLENBQUM7QUFFckQ7O0dBRUc7QUFDSCxNQUFNLGdCQUFnQixHQUFHLFNBQVMsQ0FBQztBQUVuQyx3REFBd0Q7QUFDeEQsTUFBTSxrQkFBa0IsR0FBVyxTQUFTLENBQUMsS0FBSyxDQUFDO0FBRW5ELG1DQUFtQztBQUNuQyxNQUFNLE9BQU8sY0FBYztJQWV6QixZQUFZLEVBQ1YsMEJBQTBCLEdBQUcsS0FBSyxFQUNsQyxlQUFlLEdBQUcsSUFBSSxNQUlwQixFQUFFO1FBcEJFLHFCQUFnQixHQUFZLEtBQUssQ0FBQztRQUNsQyxvQkFBZSxHQUFZLElBQUksQ0FBQztRQUdoQyxnQ0FBMkIsR0FBaUQsU0FBUyxDQUFDO1FBRXRGLCtCQUEwQixHQUFpRCxTQUFTLENBQUM7UUFFckYsNEJBQXVCLEdBSW5CLFNBQVMsQ0FBQztRQVNwQixJQUFJLENBQUMsMEJBQTBCLEdBQUcsMEJBQTBCLENBQUM7UUFDN0Qs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SUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUM7d0JBQ3pELE1BQU0sUUFBUSxHQUFHLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQzt3QkFDOUIsTUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsa0JBQWtCLENBQUM7d0JBQzNFLE1BQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQzt3QkFDakUsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLE1BQU0sQ0FBQztvQkFDM0IsQ0FBQztvQkFDRCxLQUFLLENBQUMsU0FBUyxDQUFDLGlCQUFpQixFQUFFLFNBQVMsQ0FBQyxDQUFDO2dCQUNoRCxDQUFDO2dCQUNELEtBQUssQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQ3RDLENBQUM7UUFDSCxDQUFDO1FBQ0QsT0FBTyxTQUFTLENBQUM7SUFDbkIsQ0FBQztJQUVELG1CQUFtQixDQUNqQiwyQkFBeUUsRUFDekUsMEJBQXVFLEVBQ3ZFLHVCQUFpRTtRQUVqRSxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDO1FBQzdCLElBQUksQ0FBQywyQkFBMkIsR0FBRywyQkFBMkIsQ0FBQztRQUMvRCxJQUFJLENBQUMsMEJBQTBCLEdBQUcsMEJBQTBCLENBQUM7UUFDN0QsSUFBSSxDQUFDLHVCQUF1QixHQUFHLHVCQUF1QixDQUFDO0lBQ3pELENBQUM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtBdHRyaWJ1dGV9IGZyb20gJy4vYXR0cmlidXRlJztcbmltcG9ydCB7Q2hhcn0gZnJvbSAnLi9jaGFyJztcbmltcG9ydCB7RXZlbnRUeXBlfSBmcm9tICcuL2V2ZW50X3R5cGUnO1xuaW1wb3J0IHtQcm9wZXJ0eX0gZnJvbSAnLi9wcm9wZXJ0eSc7XG5pbXBvcnQgKiBhcyBhMTF5Q2xpY2sgZnJvbSAnLi9hMTF5X2NsaWNrJztcbmltcG9ydCAqIGFzIGNhY2hlIGZyb20gJy4vY2FjaGUnO1xuaW1wb3J0ICogYXMgZXZlbnRJbmZvTGliIGZyb20gJy4vZXZlbnRfaW5mbyc7XG5pbXBvcnQgKiBhcyBldmVudExpYiBmcm9tICcuL2V2ZW50JztcblxuLyoqXG4gKiBTaW5jZSBtYXBzIGZyb20gZXZlbnQgdG8gYWN0aW9uIGFyZSBpbW11dGFibGUgd2UgY2FuIHVzZSBhIHNpbmdsZSBtYXBcbiAqIHRvIHJlcHJlc2VudCB0aGUgZW1wdHkgbWFwLlxuICovXG5jb25zdCBFTVBUWV9BQ1RJT05fTUFQOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSA9IHt9O1xuXG4vKipcbiAqIFRoaXMgcmVndWxhciBleHByZXNzaW9uIG1hdGNoZXMgYSBzZW1pY29sb24uXG4gKi9cbmNvbnN0IFJFR0VYUF9TRU1JQ09MT04gPSAvXFxzKjtcXHMqLztcblxuLyoqIElmIG5vIGV2ZW50IHR5cGUgaXMgZGVmaW5lZCwgZGVmYXVsdHMgdG8gYGNsaWNrYC4gKi9cbmNvbnN0IERFRkFVTFRfRVZFTlRfVFlQRTogc3RyaW5nID0gRXZlbnRUeXBlLkNMSUNLO1xuXG4vKiogUmVzb2x2ZXMgYWN0aW9ucyBmb3IgRXZlbnRzLiAqL1xuZXhwb3J0IGNsYXNzIEFjdGlvblJlc29sdmVyIHtcbiAgcHJpdmF0ZSBhMTF5Q2xpY2tTdXBwb3J0OiBib29sZWFuID0gZmFsc2U7XG4gIHByaXZhdGUgY2xpY2tNb2RTdXBwb3J0OiBib29sZWFuID0gdHJ1ZTtcbiAgcHJpdmF0ZSByZWFkb25seSBzeW50aGV0aWNNb3VzZUV2ZW50U3VwcG9ydDogYm9vbGVhbjtcblxuICBwcml2YXRlIHVwZGF0ZUV2ZW50SW5mb0ZvckExMXlDbGljaz86IChldmVudEluZm86IGV2ZW50SW5mb0xpYi5FdmVudEluZm8pID0+IHZvaWQgPSB1bmRlZmluZWQ7XG5cbiAgcHJpdmF0ZSBwcmV2ZW50RGVmYXVsdEZvckExMXlDbGljaz86IChldmVudEluZm86IGV2ZW50SW5mb0xpYi5FdmVudEluZm8pID0+IHZvaWQgPSB1bmRlZmluZWQ7XG5cbiAgcHJpdmF0ZSBwb3B1bGF0ZUNsaWNrT25seUFjdGlvbj86IChcbiAgICBhY3Rpb25FbGVtZW50OiBFbGVtZW50LFxuICAgIGV2ZW50SW5mbzogZXZlbnRJbmZvTGliLkV2ZW50SW5mbyxcbiAgICBhY3Rpb25NYXA6IHtba2V5OiBzdHJpbmddOiBzdHJpbmcgfCB1bmRlZmluZWR9LFxuICApID0+IHZvaWQgPSB1bmRlZmluZWQ7XG5cbiAgY29uc3RydWN0b3Ioe1xuICAgIHN5bnRoZXRpY01vdXNlRXZlbnRTdXBwb3J0ID0gZmFsc2UsXG4gICAgY2xpY2tNb2RTdXBwb3J0ID0gdHJ1ZSxcbiAgfToge1xuICAgIHN5bnRoZXRpY01vdXNlRXZlbnRTdXBwb3J0PzogYm9vbGVhbjtcbiAgICBjbGlja01vZFN1cHBvcnQ/OiBib29sZWFuO1xuICB9ID0ge30pIHtcbiAgICB0aGlzLnN5bnRoZXRpY01vdXNlRXZlbnRTdXBwb3J0ID0gc3ludGhldGljTW91c2VFdmVudFN1cHBvcnQ7XG4gICAgdGhpcy5jbGlja01vZFN1cHBvcnQgPSBjbGlja01vZFN1cHBvcnQ7XG4gIH1cblxuICByZXNvbHZlRXZlbnRUeXBlKGV2ZW50SW5mbzogZXZlbnRJbmZvTGliLkV2ZW50SW5mbykge1xuICAgIC8vIFdlIGRpc3Rpbmd1aXNoIG1vZGlmaWVkIGFuZCBwbGFpbiBjbGlja3MgaW4gb3JkZXIgdG8gc3VwcG9ydCB0aGVcbiAgICAvLyBkZWZhdWx0IGJyb3dzZXIgYmVoYXZpb3Igb2YgbW9kaWZpZWQgY2xpY2tzIG9uIGxpbmtzOyB1c3VhbGx5IHRvXG4gICAgLy8gb3BlbiB0aGUgVVJMIG9mIHRoZSBsaW5rIGluIG5ldyB0YWIgb3IgbmV3IHdpbmRvdyBvbiBjdHJsL2NtZFxuICAgIC8vIGNsaWNrLiBBIERPTSAnY2xpY2snIGV2ZW50IGlzIG1hcHBlZCB0byB0aGUganNhY3Rpb24gJ2NsaWNrJ1xuICAgIC8vIGV2ZW50IGlmZiB0aGVyZSBpcyBubyBtb2RpZmllciBwcmVzZW50IG9uIHRoZSBldmVudC4gSWYgdGhlcmUgaXNcbiAgICAvLyBhIG1vZGlmaWVyLCBpdCdzIG1hcHBlZCB0byAnY2xpY2ttb2QnIGluc3RlYWQuXG4gICAgLy9cbiAgICAvLyBJdCdzIGFsbG93ZWQgdG8gb21pdCB0aGUgZXZlbnQgaW4gdGhlIGpzYWN0aW9uIGF0dHJpYnV0ZS4gSW4gdGhhdFxuICAgIC8vIGNhc2UsICdjbGljaycgaXMgYXNzdW1lZC4gVGh1cyB0aGUgZm9sbG93aW5nIHR3byBhcmUgZXF1aXZhbGVudDpcbiAgICAvL1xuICAgIC8vICAgPGEgaHJlZj1cInNvbWV1cmxcIiBqc2FjdGlvbj1cImduYS5mdVwiPlxuICAgIC8vICAgPGEgaHJlZj1cInNvbWV1cmxcIiBqc2FjdGlvbj1cImNsaWNrOmduYS5mdVwiPlxuICAgIC8vXG4gICAgLy8gRm9yIHVubW9kaWZpZWQgY2xpY2tzLCBFdmVudENvbnRyYWN0IGludm9rZXMgdGhlIGpzYWN0aW9uXG4gICAgLy8gJ2duYS5mdScuIEZvciBtb2RpZmllZCBjbGlja3MsIEV2ZW50Q29udHJhY3Qgd29uJ3QgZmluZCBhXG4gICAgLy8gc3VpdGFibGUgYWN0aW9uIGFuZCBsZWF2ZSB0aGUgZXZlbnQgdG8gYmUgaGFuZGxlZCBieSB0aGVcbiAgICAvLyBicm93c2VyLlxuICAgIC8vXG4gICAgLy8gSW4gb3JkZXIgdG8gYWxzbyBpbnZva2UgYSBqc2FjdGlvbiBoYW5kbGVyIGZvciBhIG1vZGlmaWVyIGNsaWNrLFxuICAgIC8vICdjbGlja21vZCcgbmVlZHMgdG8gYmUgdXNlZDpcbiAgICAvL1xuICAgIC8vICAgPGEgaHJlZj1cInNvbWV1cmxcIiBqc2FjdGlvbj1cImNsaWNrbW9kOmduYS5mdVwiPlxuICAgIC8vXG4gICAgLy8gRXZlbnRDb250cmFjdCBpbnZva2VzIHRoZSBqc2FjdGlvbiAnZ25hLmZ1JyBmb3IgbW9kaWZpZWRcbiAgICAvLyBjbGlja3MuIFVubW9kaWZpZWQgY2xpY2tzIGFyZSBsZWZ0IHRvIHRoZSBicm93c2VyLlxuICAgIC8vXG4gICAgLy8gSW4gb3JkZXIgdG8gc2V0IHVwIHRoZSBldmVudCBjb250cmFjdCB0byBoYW5kbGUgYm90aCBjbGlja29ubHkgYW5kXG4gICAgLy8gY2xpY2ttb2QsIG9ubHkgYWRkRXZlbnQoRXZlbnRUeXBlLkNMSUNLKSBpcyBuZWNlc3NhcnkuXG4gICAgLy9cbiAgICAvLyBJbiBvcmRlciB0byBzZXQgdXAgdGhlIGV2ZW50IGNvbnRyYWN0IHRvIGhhbmRsZSBjbGljayxcbiAgICAvLyBhZGRFdmVudCgpIGlzIG5lY2Vzc2FyeSBmb3IgQ0xJQ0ssIEtFWURPV04sIGFuZCBLRVlQUkVTUyBldmVudCB0eXBlcy4gIElmXG4gICAgLy8gYTExeSBjbGljayBzdXBwb3J0IGlzIGVuYWJsZWQsIGFkZEV2ZW50KCkgd2lsbCBzZXQgdXAgdGhlIGFwcHJvcHJpYXRlIGtleVxuICAgIC8vIGV2ZW50IGhhbmRsZXIgYXV0b21hdGljYWxseS5cbiAgICBpZiAoXG4gICAgICB0aGlzLmNsaWNrTW9kU3VwcG9ydCAmJlxuICAgICAgZXZlbnRJbmZvTGliLmdldEV2ZW50VHlwZShldmVudEluZm8pID09PSBFdmVudFR5cGUuQ0xJQ0sgJiZcbiAgICAgIGV2ZW50TGliLmlzTW9kaWZpZWRDbGlja0V2ZW50KGV2ZW50SW5mb0xpYi5nZXRFdmVudChldmVudEluZm8pKVxuICAgICkge1xuICAgICAgZXZlbnRJbmZvTGliLnNldEV2ZW50VHlwZShldmVudEluZm8sIEV2ZW50VHlwZS5DTElDS01PRCk7XG4gICAgfSBlbHNlIGlmICh0aGlzLmExMXlDbGlja1N1cHBvcnQpIHtcbiAgICAgIHRoaXMudXBkYXRlRXZlbnRJbmZvRm9yQTExeUNsaWNrIShldmVudEluZm8pO1xuICAgIH1cbiAgfVxuXG4gIHJlc29sdmVBY3Rpb24oZXZlbnRJbmZvOiBldmVudEluZm9MaWIuRXZlbnRJbmZvKSB7XG4gICAgaWYgKGV2ZW50SW5mb0xpYi5nZXRSZXNvbHZlZChldmVudEluZm8pKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMucG9wdWxhdGVBY3Rpb24oZXZlbnRJbmZvLCBldmVudEluZm9MaWIuZ2V0VGFyZ2V0RWxlbWVudChldmVudEluZm8pKTtcbiAgICBldmVudEluZm9MaWIuc2V0UmVzb2x2ZWQoZXZlbnRJbmZvLCB0cnVlKTtcbiAgfVxuXG4gIHJlc29sdmVQYXJlbnRBY3Rpb24oZXZlbnRJbmZvOiBldmVudEluZm9MaWIuRXZlbnRJbmZvKSB7XG4gICAgY29uc3QgYWN0aW9uID0gZXZlbnRJbmZvTGliLmdldEFjdGlvbihldmVudEluZm8pO1xuICAgIGNvbnN0IGFjdGlvbkVsZW1lbnQgPSBhY3Rpb24gJiYgZXZlbnRJbmZvTGliLmdldEFjdGlvbkVsZW1lbnQoYWN0aW9uKTtcbiAgICBldmVudEluZm9MaWIudW5zZXRBY3Rpb24oZXZlbnRJbmZvKTtcbiAgICBjb25zdCBwYXJlbnROb2RlID0gYWN0aW9uRWxlbWVudCAmJiB0aGlzLmdldFBhcmVudE5vZGUoYWN0aW9uRWxlbWVudCk7XG4gICAgaWYgKCFwYXJlbnROb2RlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMucG9wdWxhdGVBY3Rpb24oZXZlbnRJbmZvLCBwYXJlbnROb2RlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWFyY2hlcyBmb3IgYSBqc2FjdGlvbiB0aGF0IHRoZSBET00gZXZlbnQgbWFwcyB0byBhbmQgY3JlYXRlcyBhblxuICAgKiBvYmplY3QgY29udGFpbmluZyBldmVudCBpbmZvcm1hdGlvbiB1c2VkIGZvciBkaXNwYXRjaGluZyBieVxuICAgKiBqc2FjdGlvbi5EaXNwYXRjaGVyLiBUaGlzIG1ldGhvZCBwb3B1bGF0ZXMgdGhlIGBhY3Rpb25gIGFuZCBgYWN0aW9uRWxlbWVudGBcbiAgICogZmllbGRzIG9mIHRoZSBFdmVudEluZm8gb2JqZWN0IHBhc3NlZCBpbiBieSBmaW5kaW5nIHRoZSBmaXJzdFxuICAgKiBqc2FjdGlvbiBhdHRyaWJ1dGUgYWJvdmUgdGhlIHRhcmdldCBOb2RlIG9mIHRoZSBldmVudCwgYW5kIGJlbG93XG4gICAqIHRoZSBjb250YWluZXIgTm9kZSwgdGhhdCBzcGVjaWZpZXMgYSBqc2FjdGlvbiBmb3IgdGhlIGV2ZW50XG4gICAqIHR5cGUuIElmIG5vIHN1Y2gganNhY3Rpb24gaXMgZm91bmQsIHRoZW4gYWN0aW9uIGlzIHVuZGVmaW5lZC5cbiAgICpcbiAgICogQHBhcmFtIGV2ZW50SW5mbyBgRXZlbnRJbmZvYCB0byBzZXQgYGFjdGlvbmAgYW5kIGBhY3Rpb25FbGVtZW50YCBpZiBhblxuICAgKiAgICBhY3Rpb24gaXMgZm91bmQgb24gYW55IGBFbGVtZW50YCBpbiB0aGUgcGF0aCBvZiB0aGUgYEV2ZW50YC5cbiAgICovXG4gIHByaXZhdGUgcG9wdWxhdGVBY3Rpb24oZXZlbnRJbmZvOiBldmVudEluZm9MaWIuRXZlbnRJbmZvLCBjdXJyZW50VGFyZ2V0OiBFbGVtZW50KSB7XG4gICAgbGV0IGFjdGlvbkVsZW1lbnQ6IEVsZW1lbnQgfCBudWxsID0gY3VycmVudFRhcmdldDtcbiAgICB3aGlsZSAoYWN0aW9uRWxlbWVudCAmJiBhY3Rpb25FbGVtZW50ICE9PSBldmVudEluZm9MaWIuZ2V0Q29udGFpbmVyKGV2ZW50SW5mbykpIHtcbiAgICAgIGlmIChhY3Rpb25FbGVtZW50Lm5vZGVUeXBlID09PSBOb2RlLkVMRU1FTlRfTk9ERSkge1xuICAgICAgICB0aGlzLnBvcHVsYXRlQWN0aW9uT25FbGVtZW50KGFjdGlvbkVsZW1lbnQsIGV2ZW50SW5mbyk7XG4gICAgICB9XG5cbiAgICAgIGlmIChldmVudEluZm9MaWIuZ2V0QWN0aW9uKGV2ZW50SW5mbykpIHtcbiAgICAgICAgLy8gQW4gZXZlbnQgaXMgaGFuZGxlZCBieSBhdCBtb3N0IG9uZSBqc2FjdGlvbi4gVGh1cyB3ZSBzdG9wIGF0IHRoZVxuICAgICAgICAvLyBmaXJzdCBtYXRjaGluZyBqc2FjdGlvbiBzcGVjaWZpZWQgaW4gYSBqc2FjdGlvbiBhdHRyaWJ1dGUgdXAgdGhlXG4gICAgICAgIC8vIGFuY2VzdG9yIGNoYWluIG9mIHRoZSBldmVudCB0YXJnZXQgbm9kZS5cbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBhY3Rpb25FbGVtZW50ID0gdGhpcy5nZXRQYXJlbnROb2RlKGFjdGlvbkVsZW1lbnQpO1xuICAgIH1cblxuICAgIGNvbnN0IGFjdGlvbiA9IGV2ZW50SW5mb0xpYi5nZXRBY3Rpb24oZXZlbnRJbmZvKTtcbiAgICBpZiAoIWFjdGlvbikge1xuICAgICAgLy8gTm8gYWN0aW9uIGZvdW5kLlxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmExMXlDbGlja1N1cHBvcnQpIHtcbiAgICAgIHRoaXMucHJldmVudERlZmF1bHRGb3JBMTF5Q2xpY2shKGV2ZW50SW5mbyk7XG4gICAgfVxuXG4gICAgLy8gV2UgYXR0ZW1wdCB0byBoYW5kbGUgdGhlIG1vdXNlZW50ZXIvbW91c2VsZWF2ZSBldmVudHMgaGVyZSBieVxuICAgIC8vIGRldGVjdGluZyB3aGV0aGVyIHRoZSBtb3VzZW92ZXIvbW91c2VvdXQgZXZlbnRzIGNvcnJlc3BvbmQgdG9cbiAgICAvLyBlbnRlcmluZy9sZWF2aW5nIGFuIGVsZW1lbnQuXG4gICAgaWYgKHRoaXMuc3ludGhldGljTW91c2VFdmVudFN1cHBvcnQpIHtcbiAgICAgIGlmIChcbiAgICAgICAgZXZlbnRJbmZvTGliLmdldEV2ZW50VHlwZShldmVudEluZm8pID09PSBFdmVudFR5cGUuTU9VU0VFTlRFUiB8fFxuICAgICAgICBldmVudEluZm9MaWIuZ2V0RXZlbnRUeXBlKGV2ZW50SW5mbykgPT09IEV2ZW50VHlwZS5NT1VTRUxFQVZFIHx8XG4gICAgICAgIGV2ZW50SW5mb0xpYi5nZXRFdmVudFR5cGUoZXZlbnRJbmZvKSA9PT0gRXZlbnRUeXBlLlBPSU5URVJFTlRFUiB8fFxuICAgICAgICBldmVudEluZm9MaWIuZ2V0RXZlbnRUeXBlKGV2ZW50SW5mbykgPT09IEV2ZW50VHlwZS5QT0lOVEVSTEVBVkVcbiAgICAgICkge1xuICAgICAgICAvLyBXZSBhdHRlbXB0IHRvIGhhbmRsZSB0aGUgbW91c2VlbnRlci9tb3VzZWxlYXZlIGV2ZW50cyBoZXJlIGJ5XG4gICAgICAgIC8vIGRldGVjdGluZyB3aGV0aGVyIHRoZSBtb3VzZW92ZXIvbW91c2VvdXQgZXZlbnRzIGNvcnJlc3BvbmQgdG9cbiAgICAgICAgLy8gZW50ZXJpbmcvbGVhdmluZyBhbiBlbGVtZW50LlxuICAgICAgICBpZiAoXG4gICAgICAgICAgZXZlbnRMaWIuaXNNb3VzZVNwZWNpYWxFdmVudChcbiAgICAgICAgICAgIGV2ZW50SW5mb0xpYi5nZXRFdmVudChldmVudEluZm8pLFxuICAgICAgICAgICAgZXZlbnRJbmZvTGliLmdldEV2ZW50VHlwZShldmVudEluZm8pLFxuICAgICAgICAgICAgZXZlbnRJbmZvTGliLmdldEFjdGlvbkVsZW1lbnQoYWN0aW9uKSxcbiAgICAgICAgICApXG4gICAgICAgICkge1xuICAgICAgICAgIC8vIElmIGJvdGggbW91c2VvdmVyL21vdXNlb3V0IGFuZCBtb3VzZWVudGVyL21vdXNlbGVhdmUgZXZlbnRzIGFyZVxuICAgICAgICAgIC8vIGVuYWJsZWQsIHR3byBzZXBhcmF0ZSBoYW5kbGVycyBmb3IgbW91c2VvdmVyL21vdXNlb3V0IGFyZVxuICAgICAgICAgIC8vIHJlZ2lzdGVyZWQuIEJvdGggaGFuZGxlcnMgd2lsbCBzZWUgdGhlIHNhbWUgZXZlbnQgaW5zdGFuY2VcbiAgICAgICAgICAvLyBzbyB3ZSBjcmVhdGUgYSBjb3B5IHRvIGF2b2lkIGludGVyZmVyaW5nIHdpdGggdGhlIGRpc3BhdGNoaW5nIG9mXG4gICAgICAgICAgLy8gdGhlIG1vdXNlb3Zlci9tb3VzZW91dCBldmVudC5cbiAgICAgICAgICBjb25zdCBjb3BpZWRFdmVudCA9IGV2ZW50TGliLmNyZWF0ZU1vdXNlU3BlY2lhbEV2ZW50KFxuICAgICAgICAgICAgZXZlbnRJbmZvTGliLmdldEV2ZW50KGV2ZW50SW5mbyksXG4gICAgICAgICAgICBldmVudEluZm9MaWIuZ2V0QWN0aW9uRWxlbWVudChhY3Rpb24pLFxuICAgICAgICAgICk7XG4gICAgICAgICAgZXZlbnRJbmZvTGliLnNldEV2ZW50KGV2ZW50SW5mbywgY29waWVkRXZlbnQpO1xuICAgICAgICAgIC8vIFNpbmNlIHRoZSBtb3VzZWVudGVyL21vdXNlbGVhdmUgZXZlbnRzIGRvIG5vdCBidWJibGUsIHRoZSB0YXJnZXRcbiAgICAgICAgICAvLyBvZiB0aGUgZXZlbnQgaXMgdGVjaG5pY2FsbHkgdGhlIGBhY3Rpb25FbGVtZW50YCAodGhlIG5vZGUgd2l0aCB0aGVcbiAgICAgICAgICAvLyBganNhY3Rpb25gIGF0dHJpYnV0ZSlcbiAgICAgICAgICBldmVudEluZm9MaWIuc2V0VGFyZ2V0RWxlbWVudChldmVudEluZm8sIGV2ZW50SW5mb0xpYi5nZXRBY3Rpb25FbGVtZW50KGFjdGlvbikpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGV2ZW50SW5mb0xpYi51bnNldEFjdGlvbihldmVudEluZm8pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFdhbGsgdG8gdGhlIHBhcmVudCBub2RlLCB1bmxlc3MgdGhlIG5vZGUgaGFzIGEgZGlmZmVyZW50IG93bmVyIGluXG4gICAqIHdoaWNoIGNhc2Ugd2Ugd2FsayB0byB0aGUgb3duZXIuIEF0dGVtcHQgdG8gd2FsayB0byBob3N0IG9mIGFcbiAgICogc2hhZG93IHJvb3QgaWYgbmVlZGVkLlxuICAgKi9cbiAgcHJpdmF0ZSBnZXRQYXJlbnROb2RlKGVsZW1lbnQ6IEVsZW1lbnQpOiBFbGVtZW50IHwgbnVsbCB7XG4gICAgY29uc3Qgb3duZXIgPSBlbGVtZW50W1Byb3BlcnR5Lk9XTkVSXTtcbiAgICBpZiAob3duZXIpIHtcbiAgICAgIHJldHVybiBvd25lciBhcyBFbGVtZW50O1xuICAgIH1cbiAgICBjb25zdCBwYXJlbnROb2RlID0gZWxlbWVudC5wYXJlbnROb2RlO1xuICAgIGlmIChwYXJlbnROb2RlPy5ub2RlTmFtZSA9PT0gJyNkb2N1bWVudC1mcmFnbWVudCcpIHtcbiAgICAgIHJldHVybiAocGFyZW50Tm9kZSBhcyBTaGFkb3dSb290IHwgbnVsbCk/Lmhvc3QgPz8gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIHBhcmVudE5vZGUgYXMgRWxlbWVudCB8IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogQWNjZXNzZXMgdGhlIGpzYWN0aW9uIG1hcCBvbiBhIG5vZGUgYW5kIHJldHJpZXZlcyB0aGUgbmFtZSBvZiB0aGVcbiAgICogYWN0aW9uIHRoZSBnaXZlbiBldmVudCBpcyBtYXBwZWQgdG8sIGlmIGFueS4gSXQgcGFyc2VzIHRoZVxuICAgKiBhdHRyaWJ1dGUgdmFsdWUgYW5kIHN0b3JlcyBpdCBpbiBhIHByb3BlcnR5IG9uIHRoZSBub2RlIGZvclxuICAgKiBzdWJzZXF1ZW50IHJldHJpZXZhbCB3aXRob3V0IHJlLXBhcnNpbmcgYW5kIHJlLWFjY2Vzc2luZyB0aGVcbiAgICogYXR0cmlidXRlLlxuICAgKlxuICAgKiBAcGFyYW0gYWN0aW9uRWxlbWVudCBUaGUgRE9NIG5vZGUgdG8gcmV0cmlldmUgdGhlIGpzYWN0aW9uIG1hcCBmcm9tLlxuICAgKiBAcGFyYW0gZXZlbnRJbmZvIGBFdmVudEluZm9gIHRvIHNldCBgYWN0aW9uYCBhbmQgYGFjdGlvbkVsZW1lbnRgIGlmIGFuXG4gICAqICAgIGFjdGlvbiBpcyBmb3VuZCBvbiB0aGUgYGFjdGlvbkVsZW1lbnRgLlxuICAgKi9cbiAgcHJpdmF0ZSBwb3B1bGF0ZUFjdGlvbk9uRWxlbWVudChhY3Rpb25FbGVtZW50OiBFbGVtZW50LCBldmVudEluZm86IGV2ZW50SW5mb0xpYi5FdmVudEluZm8pIHtcbiAgICBjb25zdCBhY3Rpb25NYXAgPSB0aGlzLnBhcnNlQWN0aW9ucyhhY3Rpb25FbGVtZW50KTtcblxuICAgIGNvbnN0IGFjdGlvbk5hbWUgPSBhY3Rpb25NYXBbZXZlbnRJbmZvTGliLmdldEV2ZW50VHlwZShldmVudEluZm8pXTtcbiAgICBpZiAoYWN0aW9uTmFtZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBldmVudEluZm9MaWIuc2V0QWN0aW9uKGV2ZW50SW5mbywgYWN0aW9uTmFtZSwgYWN0aW9uRWxlbWVudCk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuYTExeUNsaWNrU3VwcG9ydCkge1xuICAgICAgdGhpcy5wb3B1bGF0ZUNsaWNrT25seUFjdGlvbiEoYWN0aW9uRWxlbWVudCwgZXZlbnRJbmZvLCBhY3Rpb25NYXApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBQYXJzZXMgYW5kIGNhY2hlcyBhbiBlbGVtZW50J3MganNhY3Rpb24gZWxlbWVudCBpbnRvIGEgbWFwLlxuICAgKlxuICAgKiBUaGlzIGlzIHByaW1hcmlseSBmb3IgaW50ZXJuYWwgdXNlLlxuICAgKlxuICAgKiBAcGFyYW0gYWN0aW9uRWxlbWVudCBUaGUgRE9NIG5vZGUgdG8gcmV0cmlldmUgdGhlIGpzYWN0aW9uIG1hcCBmcm9tLlxuICAgKiBAcmV0dXJuIE1hcCBmcm9tIGV2ZW50IHRvIHF1YWxpZmllZCBuYW1lIG9mIHRoZSBqc2FjdGlvbiBib3VuZCB0byBpdC5cbiAgICovXG4gIHByaXZhdGUgcGFyc2VBY3Rpb25zKGFjdGlvbkVsZW1lbnQ6IEVsZW1lbnQpOiB7W2tleTogc3RyaW5nXTogc3RyaW5nIHwgdW5kZWZpbmVkfSB7XG4gICAgbGV0IGFjdGlvbk1hcDoge1trZXk6IHN0cmluZ106IHN0cmluZyB8IHVuZGVmaW5lZH0gfCB1bmRlZmluZWQgPSBjYWNoZS5nZXQoYWN0aW9uRWxlbWVudCk7XG4gICAgaWYgKCFhY3Rpb25NYXApIHtcbiAgICAgIGNvbnN0IGpzYWN0aW9uQXR0cmlidXRlID0gYWN0aW9uRWxlbWVudC5nZXRBdHRyaWJ1dGUoQXR0cmlidXRlLkpTQUNUSU9OKTtcbiAgICAgIGlmICghanNhY3Rpb25BdHRyaWJ1dGUpIHtcbiAgICAgICAgYWN0aW9uTWFwID0gRU1QVFlfQUNUSU9OX01BUDtcbiAgICAgICAgY2FjaGUuc2V0KGFjdGlvbkVsZW1lbnQsIGFjdGlvbk1hcCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhY3Rpb25NYXAgPSBjYWNoZS5nZXRQYXJzZWQoanNhY3Rpb25BdHRyaWJ1dGUpO1xuICAgICAgICBpZiAoIWFjdGlvbk1hcCkge1xuICAgICAgICAgIGFjdGlvbk1hcCA9IHt9O1xuICAgICAgICAgIGNvbnN0IHZhbHVlcyA9IGpzYWN0aW9uQXR0cmlidXRlLnNwbGl0KFJFR0VYUF9TRU1JQ09MT04pO1xuICAgICAgICAgIGZvciAobGV0IGlkeCA9IDA7IGlkeCA8IHZhbHVlcy5sZW5ndGg7IGlkeCsrKSB7XG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHZhbHVlc1tpZHhdO1xuICAgICAgICAgICAgaWYgKCF2YWx1ZSkge1xuICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGNvbG9uID0gdmFsdWUuaW5kZXhPZihDaGFyLkVWRU5UX0FDVElPTl9TRVBBUkFUT1IpO1xuICAgICAgICAgICAgY29uc3QgaGFzQ29sb24gPSBjb2xvbiAhPT0gLTE7XG4gICAgICAgICAgICBjb25zdCB0eXBlID0gaGFzQ29sb24gPyB2YWx1ZS5zdWJzdHIoMCwgY29sb24pLnRyaW0oKSA6IERFRkFVTFRfRVZFTlRfVFlQRTtcbiAgICAgICAgICAgIGNvbnN0IGFjdGlvbiA9IGhhc0NvbG9uID8gdmFsdWUuc3Vic3RyKGNvbG9uICsgMSkudHJpbSgpIDogdmFsdWU7XG4gICAgICAgICAgICBhY3Rpb25NYXBbdHlwZV0gPSBhY3Rpb247XG4gICAgICAgICAgfVxuICAgICAgICAgIGNhY2hlLnNldFBhcnNlZChqc2FjdGlvbkF0dHJpYnV0ZSwgYWN0aW9uTWFwKTtcbiAgICAgICAgfVxuICAgICAgICBjYWNoZS5zZXQoYWN0aW9uRWxlbWVudCwgYWN0aW9uTWFwKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGFjdGlvbk1hcDtcbiAgfVxuXG4gIGFkZEExMXlDbGlja1N1cHBvcnQoXG4gICAgdXBkYXRlRXZlbnRJbmZvRm9yQTExeUNsaWNrOiB0eXBlb2YgYTExeUNsaWNrLnVwZGF0ZUV2ZW50SW5mb0ZvckExMXlDbGljayxcbiAgICBwcmV2ZW50RGVmYXVsdEZvckExMXlDbGljazogdHlwZW9mIGExMXlDbGljay5wcmV2ZW50RGVmYXVsdEZvckExMXlDbGljayxcbiAgICBwb3B1bGF0ZUNsaWNrT25seUFjdGlvbjogdHlwZW9mIGExMXlDbGljay5wb3B1bGF0ZUNsaWNrT25seUFjdGlvbixcbiAgKSB7XG4gICAgdGhpcy5hMTF5Q2xpY2tTdXBwb3J0ID0gdHJ1ZTtcbiAgICB0aGlzLnVwZGF0ZUV2ZW50SW5mb0ZvckExMXlDbGljayA9IHVwZGF0ZUV2ZW50SW5mb0ZvckExMXlDbGljaztcbiAgICB0aGlzLnByZXZlbnREZWZhdWx0Rm9yQTExeUNsaWNrID0gcHJldmVudERlZmF1bHRGb3JBMTF5Q2xpY2s7XG4gICAgdGhpcy5wb3B1bGF0ZUNsaWNrT25seUFjdGlvbiA9IHBvcHVsYXRlQ2xpY2tPbmx5QWN0aW9uO1xuICB9XG59XG4iXX0=