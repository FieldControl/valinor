/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as dom from './dom';
import { isCaptureEvent, EventType } from './event_type';
import { KeyCode } from './key_code';
/**
 * Gets a browser event type, if it would differ from the JSAction event type.
 */
export function getBrowserEventType(eventType) {
    // Mouseenter and mouseleave events are not handled directly because they
    // are not available everywhere. In browsers where they are available, they
    // don't bubble and aren't visible at the container boundary. Instead, we
    // synthesize the mouseenter and mouseleave events from mouseover and
    // mouseout events, respectively. Cf. eventcontract.js.
    if (eventType === EventType.MOUSEENTER) {
        return EventType.MOUSEOVER;
    }
    else if (eventType === EventType.MOUSELEAVE) {
        return EventType.MOUSEOUT;
    }
    else if (eventType === EventType.POINTERENTER) {
        return EventType.POINTEROVER;
    }
    else if (eventType === EventType.POINTERLEAVE) {
        return EventType.POINTEROUT;
    }
    return eventType;
}
/**
 * Registers the event handler function with the given DOM element for
 * the given event type.
 *
 * @param element The element.
 * @param eventType The event type.
 * @param handler The handler function to install.
 * @return Information needed to uninstall the event handler eventually.
 */
export function addEventListener(element, eventType, handler) {
    // All event handlers are registered in the bubbling
    // phase.
    //
    // All browsers support focus and blur, but these events only are propagated
    // in the capture phase. Very legacy browsers do not support focusin or
    // focusout.
    //
    // It would be a bad idea to register all event handlers in the
    // capture phase because then regular onclick handlers would not be
    // executed at all on events that trigger a jsaction. That's not
    // entirely what we want, at least for now.
    //
    // Error and load events (i.e. on images) do not bubble so they are also
    // handled in the capture phase.
    let capture = false;
    if (isCaptureEvent(eventType)) {
        capture = true;
    }
    element.addEventListener(eventType, handler, capture);
    return { eventType, handler, capture };
}
/**
 * Removes the event handler for the given event from the element.
 * the given event type.
 *
 * @param element The element.
 * @param info The information needed to deregister the handler, as returned by
 *     addEventListener(), above.
 */
export function removeEventListener(element, info) {
    if (element.removeEventListener) {
        element.removeEventListener(info.eventType, info.handler, info.capture);
        // `detachEvent` is an old DOM API.
        // tslint:disable-next-line:no-any
    }
    else if (element.detachEvent) {
        // `detachEvent` is an old DOM API.
        // tslint:disable-next-line:no-any
        element.detachEvent(`on${info.eventType}`, info.handler);
    }
}
/**
 * Cancels propagation of an event.
 * @param e The event to cancel propagation for.
 */
export function stopPropagation(e) {
    e.stopPropagation ? e.stopPropagation() : (e.cancelBubble = true);
}
/**
 * Prevents the default action of an event.
 * @param e The event to prevent the default action for.
 */
export function preventDefault(e) {
    e.preventDefault ? e.preventDefault() : (e.returnValue = false);
}
/**
 * Gets the target Element of the event. In Firefox, a text node may appear as
 * the target of the event, in which case we return the parent element of the
 * text node.
 * @param e The event to get the target of.
 * @return The target element.
 */
export function getTarget(e) {
    let el = e.target;
    // In Firefox, the event may have a text node as its target. We always
    // want the parent Element the text node belongs to, however.
    if (!el.getAttribute && el.parentNode) {
        el = el.parentNode;
    }
    return el;
}
/**
 * Whether we are on a Mac. Not pulling in useragent just for this.
 */
let isMac = typeof navigator !== 'undefined' && /Macintosh/.test(navigator.userAgent);
/**
 * Determines and returns whether the given event (which is assumed to be a
 * click event) is a middle click.
 * NOTE: There is not a consistent way to identify middle click
 * http://www.unixpapa.com/js/mouse.html
 */
function isMiddleClick(e) {
    return (
    // `which` is an old DOM API.
    // tslint:disable-next-line:no-any
    e.which === 2 ||
        // `which` is an old DOM API.
        // tslint:disable-next-line:no-any
        (e.which == null &&
            // `button` is an old DOM API.
            // tslint:disable-next-line:no-any
            e.button === 4) // middle click for IE
    );
}
/**
 * Determines and returns whether the given event (which is assumed
 * to be a click event) is modified. A middle click is considered a modified
 * click to retain the default browser action, which opens a link in a new tab.
 * @param e The event.
 * @return Whether the given event is modified.
 */
export function isModifiedClickEvent(e) {
    return (
    // `metaKey` is an old DOM API.
    // tslint:disable-next-line:no-any
    (isMac && e.metaKey) ||
        // `ctrlKey` is an old DOM API.
        // tslint:disable-next-line:no-any
        (!isMac && e.ctrlKey) ||
        isMiddleClick(e) ||
        // `shiftKey` is an old DOM API.
        // tslint:disable-next-line:no-any
        e.shiftKey);
}
/** Whether we are on WebKit (e.g., Chrome). */
export const isWebKit = typeof navigator !== 'undefined' &&
    !/Opera/.test(navigator.userAgent) &&
    /WebKit/.test(navigator.userAgent);
/** Whether we are on IE. */
export const isIe = typeof navigator !== 'undefined' &&
    (/MSIE/.test(navigator.userAgent) || /Trident/.test(navigator.userAgent));
/** Whether we are on Gecko (e.g., Firefox). */
export const isGecko = typeof navigator !== 'undefined' &&
    !/Opera|WebKit/.test(navigator.userAgent) &&
    /Gecko/.test(navigator.product);
/**
 * Determines and returns whether the given element is a valid target for
 * keypress/keydown DOM events that act like regular DOM clicks.
 * @param el The element.
 * @return Whether the given element is a valid action key target.
 */
export function isValidActionKeyTarget(el) {
    if (!('getAttribute' in el)) {
        return false;
    }
    if (isTextControl(el)) {
        return false;
    }
    if (isNativelyActivatable(el)) {
        return false;
    }
    // `isContentEditable` is an old DOM API.
    // tslint:disable-next-line:no-any
    if (el.isContentEditable) {
        return false;
    }
    return true;
}
/**
 * Whether an event has a modifier key activated.
 * @param e The event.
 * @return True, if a modifier key is activated.
 */
function hasModifierKey(e) {
    return (
    // `ctrlKey` is an old DOM API.
    // tslint:disable-next-line:no-any
    e.ctrlKey ||
        // `shiftKey` is an old DOM API.
        // tslint:disable-next-line:no-any
        e.shiftKey ||
        // `altKey` is an old DOM API.
        // tslint:disable-next-line:no-any
        e.altKey ||
        // `metaKey` is an old DOM API.
        // tslint:disable-next-line:no-any
        e.metaKey);
}
/**
 * Determines and returns whether the given event has a target that already
 * has event handlers attached because it is a native HTML control. Used to
 * determine if preventDefault should be called when isActionKeyEvent is true.
 * @param e The event.
 * @return If preventDefault should be called.
 */
export function shouldCallPreventDefaultOnNativeHtmlControl(e) {
    const el = getTarget(e);
    const tagName = el.tagName.toUpperCase();
    const role = (el.getAttribute('role') || '').toUpperCase();
    if (tagName === 'BUTTON' || role === 'BUTTON') {
        return true;
    }
    if (!isNativeHTMLControl(el)) {
        return false;
    }
    if (tagName === 'A') {
        return false;
    }
    /**
     * Fix for physical d-pads on feature phone platforms; the native event
     * (ie. isTrusted: true) needs to fire to show the OPTION list. See
     * b/135288469 for more info.
     */
    if (tagName === 'SELECT') {
        return false;
    }
    if (processSpace(el)) {
        return false;
    }
    if (isTextControl(el)) {
        return false;
    }
    return true;
}
/**
 * Determines and returns whether the given event acts like a regular DOM click,
 * and should be handled instead of the click.  If this returns true, the caller
 * will call preventDefault() to prevent a possible duplicate event.
 * This is represented by a keypress (keydown on Gecko browsers) on Enter or
 * Space key.
 * @param e The event.
 * @return True, if the event emulates a DOM click.
 */
export function isActionKeyEvent(e) {
    let key = 
    // `which` is an old DOM API.
    // tslint:disable-next-line:no-any
    e.which ||
        // `keyCode` is an old DOM API.
        // tslint:disable-next-line:no-any
        e.keyCode;
    if (!key && e.key) {
        key = ACTION_KEY_TO_KEYCODE[e.key];
    }
    if (isWebKit && key === KeyCode.MAC_ENTER) {
        key = KeyCode.ENTER;
    }
    if (key !== KeyCode.ENTER && key !== KeyCode.SPACE) {
        return false;
    }
    const el = getTarget(e);
    if (e.type !== EventType.KEYDOWN || !isValidActionKeyTarget(el) || hasModifierKey(e)) {
        return false;
    }
    // For <input type="checkbox">, we must only handle the browser's native click
    // event, so that the browser can toggle the checkbox.
    if (processSpace(el) && key === KeyCode.SPACE) {
        return false;
    }
    // If this element is non-focusable, ignore stray keystrokes (b/18337209)
    // Sscreen readers can move without tab focus, so any tabIndex is focusable.
    // See B/21809604
    if (!isFocusable(el)) {
        return false;
    }
    const type = (el.getAttribute('role') ||
        el.type ||
        el.tagName).toUpperCase();
    const isSpecificTriggerKey = IDENTIFIER_TO_KEY_TRIGGER_MAPPING[type] % key === 0;
    const isDefaultTriggerKey = !(type in IDENTIFIER_TO_KEY_TRIGGER_MAPPING) && key === KeyCode.ENTER;
    const hasType = el.tagName.toUpperCase() !== 'INPUT' || !!el.type;
    return (isSpecificTriggerKey || isDefaultTriggerKey) && hasType;
}
/**
 * Checks whether a DOM element can receive keyboard focus.
 * This code is based on goog.dom.isFocusable, but simplified since we shouldn't
 * care about visibility if we're already handling a keyboard event.
 */
function isFocusable(el) {
    return ((el.tagName in NATIVELY_FOCUSABLE_ELEMENTS || hasSpecifiedTabIndex(el)) &&
        !el.disabled);
}
/**
 * @param element Element to check.
 * @return Whether the element has a specified tab index.
 */
function hasSpecifiedTabIndex(element) {
    // IE returns 0 for an unset tabIndex, so we must use getAttributeNode(),
    // which returns an object with a 'specified' property if tabIndex is
    // specified.  This works on other browsers, too.
    const attrNode = element.getAttributeNode('tabindex'); // Must be lowercase!
    return attrNode != null && attrNode.specified;
}
/** Element tagnames that are focusable by default. */
const NATIVELY_FOCUSABLE_ELEMENTS = {
    'A': 1,
    'INPUT': 1,
    'TEXTAREA': 1,
    'SELECT': 1,
    'BUTTON': 1,
};
/** @return True, if the Space key was pressed. */
export function isSpaceKeyEvent(e) {
    const key = 
    // `which` is an old DOM API.
    // tslint:disable-next-line:no-any
    e.which ||
        // `keyCode` is an old DOM API.
        // tslint:disable-next-line:no-any
        e.keyCode;
    const el = getTarget(e);
    const elementName = (el.type || el.tagName).toUpperCase();
    return key === KeyCode.SPACE && elementName !== 'CHECKBOX';
}
/**
 * Determines whether the event corresponds to a non-bubbling mouse
 * event type (mouseenter, mouseleave, pointerenter, and pointerleave).
 *
 * During mouseover (mouseenter) and pointerover (pointerenter), the
 * relatedTarget is the element being entered from. During mouseout (mouseleave)
 * and pointerout (pointerleave), the relatedTarget is the element being exited
 * to.
 *
 * In both cases, if relatedTarget is outside target, then the corresponding
 * special event has occurred, otherwise it hasn't.
 *
 * @param e The mouseover/mouseout event.
 * @param type The type of the mouse special event.
 * @param element The element on which the jsaction for the
 *     mouseenter/mouseleave event is defined.
 * @return True if the event is a mouseenter/mouseleave event.
 */
export function isMouseSpecialEvent(e, type, element) {
    // `relatedTarget` is an old DOM API.
    // tslint:disable-next-line:no-any
    const related = e.relatedTarget;
    return (((e.type === EventType.MOUSEOVER && type === EventType.MOUSEENTER) ||
        (e.type === EventType.MOUSEOUT && type === EventType.MOUSELEAVE) ||
        (e.type === EventType.POINTEROVER && type === EventType.POINTERENTER) ||
        (e.type === EventType.POINTEROUT && type === EventType.POINTERLEAVE)) &&
        (!related || (related !== element && !dom.contains(element, related))));
}
/**
 * Creates a new EventLike object for a mouseenter/mouseleave event that's
 * derived from the original corresponding mouseover/mouseout event.
 * @param e The event.
 * @param target The element on which the jsaction for the mouseenter/mouseleave
 *     event is defined.
 * @return A modified event-like object copied from the event object passed into
 *     this function.
 */
export function createMouseSpecialEvent(e, target) {
    // We have to create a copy of the event object because we need to mutate
    // its fields. We do this for the special mouse events because the event
    // target needs to be retargeted to the action element rather than the real
    // element (since we are simulating the special mouse events with mouseover/
    // mouseout).
    //
    // Since we're making a copy anyways, we might as well attempt to convert
    // this event into a pseudo-real mouseenter/mouseleave event by adjusting
    // its type.
    //
    // tslint:disable-next-line:no-any
    const copy = {};
    for (const property in e) {
        if (property === 'srcElement' || property === 'target') {
            continue;
        }
        const key = property;
        // Making a copy requires iterating through all properties of `Event`.
        // tslint:disable-next-line:no-dict-access-on-struct-type
        const value = e[key];
        if (typeof value === 'function') {
            continue;
        }
        // Value should be the expected type, but the value of `key` is not known
        // statically.
        // tslint:disable-next-line:no-any
        copy[key] = value;
    }
    if (e.type === EventType.MOUSEOVER) {
        copy['type'] = EventType.MOUSEENTER;
    }
    else if (e.type === EventType.MOUSEOUT) {
        copy['type'] = EventType.MOUSELEAVE;
    }
    else if (e.type === EventType.POINTEROVER) {
        copy['type'] = EventType.POINTERENTER;
    }
    else {
        copy['type'] = EventType.POINTERLEAVE;
    }
    copy['target'] = copy['srcElement'] = target;
    copy['bubbles'] = false;
    return copy;
}
/**
 * Returns touch data extracted from the touch event: clientX, clientY, screenX
 * and screenY. If the event has no touch information at all, the returned
 * value is null.
 *
 * The fields of this Object are unquoted.
 *
 * @param event A touch event.
 */
export function getTouchData(event) {
    const touch = (event.changedTouches && event.changedTouches[0]) || (event.touches && event.touches[0]);
    if (!touch) {
        return null;
    }
    return {
        clientX: touch.clientX,
        clientY: touch.clientY,
        screenX: touch.screenX,
        screenY: touch.screenY,
    };
}
/**
 * Creates a new EventLike object for a "click" event that's derived from the
 * original corresponding "touchend" event for a fast-click implementation.
 *
 * It takes a touch event, adds common fields found in a click event and
 * changes the type to 'click', so that the resulting event looks more like
 * a real click event.
 *
 * @param event A touch event.
 * @return A modified event-like object copied from the event object passed into
 *     this function.
 */
export function recreateTouchEventAsClick(event) {
    const click = {};
    click['originalEventType'] = event.type;
    click['type'] = EventType.CLICK;
    for (const property in event) {
        if (property === 'type' || property === 'srcElement') {
            continue;
        }
        const key = property;
        // Making a copy requires iterating through all properties of `TouchEvent`.
        // tslint:disable-next-line:no-dict-access-on-struct-type
        const value = event[key];
        if (typeof value === 'function') {
            continue;
        }
        // Value should be the expected type, but the value of `key` is not known
        // statically.
        // tslint:disable-next-line:no-any
        click[key] = value;
    }
    // Ensure that the event has the most recent timestamp. This timestamp
    // may be used in the future to validate or cancel subsequent click events.
    click['timeStamp'] = Date.now();
    // Emulate preventDefault and stopPropagation behavior
    click['defaultPrevented'] = false;
    click['preventDefault'] = syntheticPreventDefault;
    click['_propagationStopped'] = false;
    click['stopPropagation'] = syntheticStopPropagation;
    // Emulate click coordinates using touch info
    const touch = getTouchData(event);
    if (touch) {
        click['clientX'] = touch.clientX;
        click['clientY'] = touch.clientY;
        click['screenX'] = touch.screenX;
        click['screenY'] = touch.screenY;
    }
    return click;
}
/**
 * An implementation of "preventDefault" for a synthesized event. Simply
 * sets "defaultPrevented" property to true.
 */
function syntheticPreventDefault() {
    this.defaultPrevented = true;
}
/**
 * An implementation of "stopPropagation" for a synthesized event. It simply
 * sets a synthetic non-standard "_propagationStopped" property to true.
 */
function syntheticStopPropagation() {
    this._propagationStopped = true;
}
/**
 * Mapping of KeyboardEvent.key values to
 * KeyCode values.
 */
const ACTION_KEY_TO_KEYCODE = {
    'Enter': KeyCode.ENTER,
    ' ': KeyCode.SPACE,
};
/**
 * Mapping of HTML element identifiers (ARIA role, type, or tagName) to the
 * keys (enter and/or space) that should activate them. A value of zero means
 * that both should activate them.
 */
export const IDENTIFIER_TO_KEY_TRIGGER_MAPPING = {
    'A': KeyCode.ENTER,
    'BUTTON': 0,
    'CHECKBOX': KeyCode.SPACE,
    'COMBOBOX': KeyCode.ENTER,
    'FILE': 0,
    'GRIDCELL': KeyCode.ENTER,
    'LINK': KeyCode.ENTER,
    'LISTBOX': KeyCode.ENTER,
    'MENU': 0,
    'MENUBAR': 0,
    'MENUITEM': 0,
    'MENUITEMCHECKBOX': 0,
    'MENUITEMRADIO': 0,
    'OPTION': 0,
    'RADIO': KeyCode.SPACE,
    'RADIOGROUP': KeyCode.SPACE,
    'RESET': 0,
    'SUBMIT': 0,
    'SWITCH': KeyCode.SPACE,
    'TAB': 0,
    'TREE': KeyCode.ENTER,
    'TREEITEM': KeyCode.ENTER,
};
/**
 * Returns whether or not to process space based on the type of the element;
 * checks to make sure that type is not null.
 * @param element The element.
 * @return Whether or not to process space based on type.
 */
function processSpace(element) {
    const type = (element.getAttribute('type') || element.tagName).toUpperCase();
    return type in PROCESS_SPACE;
}
/**
 * Returns whether or not the given element is a text control.
 * @param el The element.
 * @return Whether or not the given element is a text control.
 */
function isTextControl(el) {
    const type = (el.getAttribute('type') || el.tagName).toUpperCase();
    return type in TEXT_CONTROLS;
}
/**
 * Returns if the given element is a native HTML control.
 * @param el The element.
 * @return If the given element is a native HTML control.
 */
export function isNativeHTMLControl(el) {
    return el.tagName.toUpperCase() in NATIVE_HTML_CONTROLS;
}
/**
 * Returns if the given element is natively activatable. Browsers emit click
 * events for natively activatable elements, even when activated via keyboard.
 * For these elements, we don't need to raise a11y click events.
 * @param el The element.
 * @return If the given element is a native HTML control.
 */
function isNativelyActivatable(el) {
    return (el.tagName.toUpperCase() === 'BUTTON' ||
        (!!el.type && el.type.toUpperCase() === 'FILE'));
}
/**
 * HTML <input> types (not ARIA roles) which will auto-trigger a click event for
 * the Space key, with side-effects. We will not call preventDefault if space is
 * pressed, nor will we raise a11y click events.  For all other elements, we can
 * suppress the default event (which has no desired side-effects) and handle the
 * keydown ourselves.
 */
const PROCESS_SPACE = {
    'CHECKBOX': true,
    'FILE': true,
    'OPTION': true,
    'RADIO': true,
};
/** TagNames and Input types for which to not process enter/space as click. */
const TEXT_CONTROLS = {
    'COLOR': true,
    'DATE': true,
    'DATETIME': true,
    'DATETIME-LOCAL': true,
    'EMAIL': true,
    'MONTH': true,
    'NUMBER': true,
    'PASSWORD': true,
    'RANGE': true,
    'SEARCH': true,
    'TEL': true,
    'TEXT': true,
    'TEXTAREA': true,
    'TIME': true,
    'URL': true,
    'WEEK': true,
};
/** TagNames that are native HTML controls. */
const NATIVE_HTML_CONTROLS = {
    'A': true,
    'AREA': true,
    'BUTTON': true,
    'DIALOG': true,
    'IMG': true,
    'INPUT': true,
    'LINK': true,
    'MENU': true,
    'OPTGROUP': true,
    'OPTION': true,
    'PROGRESS': true,
    'SELECT': true,
    'TEXTAREA': true,
};
/** Exported for testing. */
export const testing = {
    setIsMac(value) {
        isMac = value;
    },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3ByaW1pdGl2ZXMvZXZlbnQtZGlzcGF0Y2gvc3JjL2V2ZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sS0FBSyxHQUFHLE1BQU0sT0FBTyxDQUFDO0FBRTdCLE9BQU8sRUFBQyxjQUFjLEVBQUUsU0FBUyxFQUFDLE1BQU0sY0FBYyxDQUFDO0FBQ3ZELE9BQU8sRUFBQyxPQUFPLEVBQUMsTUFBTSxZQUFZLENBQUM7QUFFbkM7O0dBRUc7QUFDSCxNQUFNLFVBQVUsbUJBQW1CLENBQUMsU0FBaUI7SUFDbkQseUVBQXlFO0lBQ3pFLDJFQUEyRTtJQUMzRSx5RUFBeUU7SUFDekUscUVBQXFFO0lBQ3JFLHVEQUF1RDtJQUN2RCxJQUFJLFNBQVMsS0FBSyxTQUFTLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDdkMsT0FBTyxTQUFTLENBQUMsU0FBUyxDQUFDO0lBQzdCLENBQUM7U0FBTSxJQUFJLFNBQVMsS0FBSyxTQUFTLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDOUMsT0FBTyxTQUFTLENBQUMsUUFBUSxDQUFDO0lBQzVCLENBQUM7U0FBTSxJQUFJLFNBQVMsS0FBSyxTQUFTLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDaEQsT0FBTyxTQUFTLENBQUMsV0FBVyxDQUFDO0lBQy9CLENBQUM7U0FBTSxJQUFJLFNBQVMsS0FBSyxTQUFTLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDaEQsT0FBTyxTQUFTLENBQUMsVUFBVSxDQUFDO0lBQzlCLENBQUM7SUFDRCxPQUFPLFNBQVMsQ0FBQztBQUNuQixDQUFDO0FBRUQ7Ozs7Ozs7O0dBUUc7QUFDSCxNQUFNLFVBQVUsZ0JBQWdCLENBQzlCLE9BQWdCLEVBQ2hCLFNBQWlCLEVBQ2pCLE9BQStCO0lBRS9CLG9EQUFvRDtJQUNwRCxTQUFTO0lBQ1QsRUFB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QUNiLE1BQU0sRUFBRSxJQUFJO0lBQ1osTUFBTSxFQUFFLElBQUk7SUFDWixVQUFVLEVBQUUsSUFBSTtJQUNoQixRQUFRLEVBQUUsSUFBSTtJQUNkLFVBQVUsRUFBRSxJQUFJO0lBQ2hCLFFBQVEsRUFBRSxJQUFJO0lBQ2QsVUFBVSxFQUFFLElBQUk7Q0FDakIsQ0FBQztBQUVGLDRCQUE0QjtBQUM1QixNQUFNLENBQUMsTUFBTSxPQUFPLEdBQUc7SUFDckIsUUFBUSxDQUFDLEtBQWM7UUFDckIsS0FBSyxHQUFHLEtBQUssQ0FBQztJQUNoQixDQUFDO0NBQ0YsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBkb20gZnJvbSAnLi9kb20nO1xuaW1wb3J0IHtFdmVudEhhbmRsZXJJbmZvfSBmcm9tICcuL2V2ZW50X2hhbmRsZXInO1xuaW1wb3J0IHtpc0NhcHR1cmVFdmVudCwgRXZlbnRUeXBlfSBmcm9tICcuL2V2ZW50X3R5cGUnO1xuaW1wb3J0IHtLZXlDb2RlfSBmcm9tICcuL2tleV9jb2RlJztcblxuLyoqXG4gKiBHZXRzIGEgYnJvd3NlciBldmVudCB0eXBlLCBpZiBpdCB3b3VsZCBkaWZmZXIgZnJvbSB0aGUgSlNBY3Rpb24gZXZlbnQgdHlwZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEJyb3dzZXJFdmVudFR5cGUoZXZlbnRUeXBlOiBzdHJpbmcpIHtcbiAgLy8gTW91c2VlbnRlciBhbmQgbW91c2VsZWF2ZSBldmVudHMgYXJlIG5vdCBoYW5kbGVkIGRpcmVjdGx5IGJlY2F1c2UgdGhleVxuICAvLyBhcmUgbm90IGF2YWlsYWJsZSBldmVyeXdoZXJlLiBJbiBicm93c2VycyB3aGVyZSB0aGV5IGFyZSBhdmFpbGFibGUsIHRoZXlcbiAgLy8gZG9uJ3QgYnViYmxlIGFuZCBhcmVuJ3QgdmlzaWJsZSBhdCB0aGUgY29udGFpbmVyIGJvdW5kYXJ5LiBJbnN0ZWFkLCB3ZVxuICAvLyBzeW50aGVzaXplIHRoZSBtb3VzZWVudGVyIGFuZCBtb3VzZWxlYXZlIGV2ZW50cyBmcm9tIG1vdXNlb3ZlciBhbmRcbiAgLy8gbW91c2VvdXQgZXZlbnRzLCByZXNwZWN0aXZlbHkuIENmLiBldmVudGNvbnRyYWN0LmpzLlxuICBpZiAoZXZlbnRUeXBlID09PSBFdmVudFR5cGUuTU9VU0VFTlRFUikge1xuICAgIHJldHVybiBFdmVudFR5cGUuTU9VU0VPVkVSO1xuICB9IGVsc2UgaWYgKGV2ZW50VHlwZSA9PT0gRXZlbnRUeXBlLk1PVVNFTEVBVkUpIHtcbiAgICByZXR1cm4gRXZlbnRUeXBlLk1PVVNFT1VUO1xuICB9IGVsc2UgaWYgKGV2ZW50VHlwZSA9PT0gRXZlbnRUeXBlLlBPSU5URVJFTlRFUikge1xuICAgIHJldHVybiBFdmVudFR5cGUuUE9JTlRFUk9WRVI7XG4gIH0gZWxzZSBpZiAoZXZlbnRUeXBlID09PSBFdmVudFR5cGUuUE9JTlRFUkxFQVZFKSB7XG4gICAgcmV0dXJuIEV2ZW50VHlwZS5QT0lOVEVST1VUO1xuICB9XG4gIHJldHVybiBldmVudFR5cGU7XG59XG5cbi8qKlxuICogUmVnaXN0ZXJzIHRoZSBldmVudCBoYW5kbGVyIGZ1bmN0aW9uIHdpdGggdGhlIGdpdmVuIERPTSBlbGVtZW50IGZvclxuICogdGhlIGdpdmVuIGV2ZW50IHR5cGUuXG4gKlxuICogQHBhcmFtIGVsZW1lbnQgVGhlIGVsZW1lbnQuXG4gKiBAcGFyYW0gZXZlbnRUeXBlIFRoZSBldmVudCB0eXBlLlxuICogQHBhcmFtIGhhbmRsZXIgVGhlIGhhbmRsZXIgZnVuY3Rpb24gdG8gaW5zdGFsbC5cbiAqIEByZXR1cm4gSW5mb3JtYXRpb24gbmVlZGVkIHRvIHVuaW5zdGFsbCB0aGUgZXZlbnQgaGFuZGxlciBldmVudHVhbGx5LlxuICovXG5leHBvcnQgZnVuY3Rpb24gYWRkRXZlbnRMaXN0ZW5lcihcbiAgZWxlbWVudDogRWxlbWVudCxcbiAgZXZlbnRUeXBlOiBzdHJpbmcsXG4gIGhhbmRsZXI6IChldmVudDogRXZlbnQpID0+IHZvaWQsXG4pOiBFdmVudEhhbmRsZXJJbmZvIHtcbiAgLy8gQWxsIGV2ZW50IGhhbmRsZXJzIGFyZSByZWdpc3RlcmVkIGluIHRoZSBidWJibGluZ1xuICAvLyBwaGFzZS5cbiAgLy9cbiAgLy8gQWxsIGJyb3dzZXJzIHN1cHBvcnQgZm9jdXMgYW5kIGJsdXIsIGJ1dCB0aGVzZSBldmVudHMgb25seSBhcmUgcHJvcGFnYXRlZFxuICAvLyBpbiB0aGUgY2FwdHVyZSBwaGFzZS4gVmVyeSBsZWdhY3kgYnJvd3NlcnMgZG8gbm90IHN1cHBvcnQgZm9jdXNpbiBvclxuICAvLyBmb2N1c291dC5cbiAgLy9cbiAgLy8gSXQgd291bGQgYmUgYSBiYWQgaWRlYSB0byByZWdpc3RlciBhbGwgZXZlbnQgaGFuZGxlcnMgaW4gdGhlXG4gIC8vIGNhcHR1cmUgcGhhc2UgYmVjYXVzZSB0aGVuIHJlZ3VsYXIgb25jbGljayBoYW5kbGVycyB3b3VsZCBub3QgYmVcbiAgLy8gZXhlY3V0ZWQgYXQgYWxsIG9uIGV2ZW50cyB0aGF0IHRyaWdnZXIgYSBqc2FjdGlvbi4gVGhhdCdzIG5vdFxuICAvLyBlbnRpcmVseSB3aGF0IHdlIHdhbnQsIGF0IGxlYXN0IGZvciBub3cuXG4gIC8vXG4gIC8vIEVycm9yIGFuZCBsb2FkIGV2ZW50cyAoaS5lLiBvbiBpbWFnZXMpIGRvIG5vdCBidWJibGUgc28gdGhleSBhcmUgYWxzb1xuICAvLyBoYW5kbGVkIGluIHRoZSBjYXB0dXJlIHBoYXNlLlxuICBsZXQgY2FwdHVyZSA9IGZhbHNlO1xuXG4gIGlmIChpc0NhcHR1cmVFdmVudChldmVudFR5cGUpKSB7XG4gICAgY2FwdHVyZSA9IHRydWU7XG4gIH1cbiAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50VHlwZSwgaGFuZGxlciwgY2FwdHVyZSk7XG5cbiAgcmV0dXJuIHtldmVudFR5cGUsIGhhbmRsZXIsIGNhcHR1cmV9O1xufVxuXG4vKipcbiAqIFJlbW92ZXMgdGhlIGV2ZW50IGhhbmRsZXIgZm9yIHRoZSBnaXZlbiBldmVudCBmcm9tIHRoZSBlbGVtZW50LlxuICogdGhlIGdpdmVuIGV2ZW50IHR5cGUuXG4gKlxuICogQHBhcmFtIGVsZW1lbnQgVGhlIGVsZW1lbnQuXG4gKiBAcGFyYW0gaW5mbyBUaGUgaW5mb3JtYXRpb24gbmVlZGVkIHRvIGRlcmVnaXN0ZXIgdGhlIGhhbmRsZXIsIGFzIHJldHVybmVkIGJ5XG4gKiAgICAgYWRkRXZlbnRMaXN0ZW5lcigpLCBhYm92ZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZUV2ZW50TGlzdGVuZXIoZWxlbWVudDogRWxlbWVudCwgaW5mbzogRXZlbnRIYW5kbGVySW5mbykge1xuICBpZiAoZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKSB7XG4gICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGluZm8uZXZlbnRUeXBlLCBpbmZvLmhhbmRsZXIgYXMgRXZlbnRMaXN0ZW5lciwgaW5mby5jYXB0dXJlKTtcbiAgICAvLyBgZGV0YWNoRXZlbnRgIGlzIGFuIG9sZCBET00gQVBJLlxuICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1hbnlcbiAgfSBlbHNlIGlmICgoZWxlbWVudCBhcyBhbnkpLmRldGFjaEV2ZW50KSB7XG4gICAgLy8gYGRldGFjaEV2ZW50YCBpcyBhbiBvbGQgRE9NIEFQSS5cbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tYW55XG4gICAgKGVsZW1lbnQgYXMgYW55KS5kZXRhY2hFdmVudChgb24ke2luZm8uZXZlbnRUeXBlfWAsIGluZm8uaGFuZGxlcik7XG4gIH1cbn1cblxuLyoqXG4gKiBDYW5jZWxzIHByb3BhZ2F0aW9uIG9mIGFuIGV2ZW50LlxuICogQHBhcmFtIGUgVGhlIGV2ZW50IHRvIGNhbmNlbCBwcm9wYWdhdGlvbiBmb3IuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdG9wUHJvcGFnYXRpb24oZTogRXZlbnQpIHtcbiAgZS5zdG9wUHJvcGFnYXRpb24gPyBlLnN0b3BQcm9wYWdhdGlvbigpIDogKGUuY2FuY2VsQnViYmxlID0gdHJ1ZSk7XG59XG5cbi8qKlxuICogUHJldmVudHMgdGhlIGRlZmF1bHQgYWN0aW9uIG9mIGFuIGV2ZW50LlxuICogQHBhcmFtIGUgVGhlIGV2ZW50IHRvIHByZXZlbnQgdGhlIGRlZmF1bHQgYWN0aW9uIGZvci5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHByZXZlbnREZWZhdWx0KGU6IEV2ZW50KSB7XG4gIGUucHJldmVudERlZmF1bHQgPyBlLnByZXZlbnREZWZhdWx0KCkgOiAoZS5yZXR1cm5WYWx1ZSA9IGZhbHNlKTtcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSB0YXJnZXQgRWxlbWVudCBvZiB0aGUgZXZlbnQuIEluIEZpcmVmb3gsIGEgdGV4dCBub2RlIG1heSBhcHBlYXIgYXNcbiAqIHRoZSB0YXJnZXQgb2YgdGhlIGV2ZW50LCBpbiB3aGljaCBjYXNlIHdlIHJldHVybiB0aGUgcGFyZW50IGVsZW1lbnQgb2YgdGhlXG4gKiB0ZXh0IG5vZGUuXG4gKiBAcGFyYW0gZSBUaGUgZXZlbnQgdG8gZ2V0IHRoZSB0YXJnZXQgb2YuXG4gKiBAcmV0dXJuIFRoZSB0YXJnZXQgZWxlbWVudC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFRhcmdldChlOiBFdmVudCk6IEVsZW1lbnQge1xuICBsZXQgZWwgPSBlLnRhcmdldCBhcyBFbGVtZW50O1xuXG4gIC8vIEluIEZpcmVmb3gsIHRoZSBldmVudCBtYXkgaGF2ZSBhIHRleHQgbm9kZSBhcyBpdHMgdGFyZ2V0LiBXZSBhbHdheXNcbiAgLy8gd2FudCB0aGUgcGFyZW50IEVsZW1lbnQgdGhlIHRleHQgbm9kZSBiZWxvbmdzIHRvLCBob3dldmVyLlxuICBpZiAoIWVsLmdldEF0dHJpYnV0ZSAmJiBlbC5wYXJlbnROb2RlKSB7XG4gICAgZWwgPSBlbC5wYXJlbnROb2RlIGFzIEVsZW1lbnQ7XG4gIH1cblxuICByZXR1cm4gZWw7XG59XG5cbi8qKlxuICogV2hldGhlciB3ZSBhcmUgb24gYSBNYWMuIE5vdCBwdWxsaW5nIGluIHVzZXJhZ2VudCBqdXN0IGZvciB0aGlzLlxuICovXG5sZXQgaXNNYWM6IGJvb2xlYW4gPSB0eXBlb2YgbmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJyAmJiAvTWFjaW50b3NoLy50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpO1xuXG4vKipcbiAqIERldGVybWluZXMgYW5kIHJldHVybnMgd2hldGhlciB0aGUgZ2l2ZW4gZXZlbnQgKHdoaWNoIGlzIGFzc3VtZWQgdG8gYmUgYVxuICogY2xpY2sgZXZlbnQpIGlzIGEgbWlkZGxlIGNsaWNrLlxuICogTk9URTogVGhlcmUgaXMgbm90IGEgY29uc2lzdGVudCB3YXkgdG8gaWRlbnRpZnkgbWlkZGxlIGNsaWNrXG4gKiBodHRwOi8vd3d3LnVuaXhwYXBhLmNvbS9qcy9tb3VzZS5odG1sXG4gKi9cbmZ1bmN0aW9uIGlzTWlkZGxlQ2xpY2soZTogRXZlbnQpOiBib29sZWFuIHtcbiAgcmV0dXJuIChcbiAgICAvLyBgd2hpY2hgIGlzIGFuIG9sZCBET00gQVBJLlxuICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1hbnlcbiAgICAoZSBhcyBhbnkpLndoaWNoID09PSAyIHx8XG4gICAgLy8gYHdoaWNoYCBpcyBhbiBvbGQgRE9NIEFQSS5cbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tYW55XG4gICAgKChlIGFzIGFueSkud2hpY2ggPT0gbnVsbCAmJlxuICAgICAgLy8gYGJ1dHRvbmAgaXMgYW4gb2xkIERPTSBBUEkuXG4gICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tYW55XG4gICAgICAoZSBhcyBhbnkpLmJ1dHRvbiA9PT0gNCkgLy8gbWlkZGxlIGNsaWNrIGZvciBJRVxuICApO1xufVxuXG4vKipcbiAqIERldGVybWluZXMgYW5kIHJldHVybnMgd2hldGhlciB0aGUgZ2l2ZW4gZXZlbnQgKHdoaWNoIGlzIGFzc3VtZWRcbiAqIHRvIGJlIGEgY2xpY2sgZXZlbnQpIGlzIG1vZGlmaWVkLiBBIG1pZGRsZSBjbGljayBpcyBjb25zaWRlcmVkIGEgbW9kaWZpZWRcbiAqIGNsaWNrIHRvIHJldGFpbiB0aGUgZGVmYXVsdCBicm93c2VyIGFjdGlvbiwgd2hpY2ggb3BlbnMgYSBsaW5rIGluIGEgbmV3IHRhYi5cbiAqIEBwYXJhbSBlIFRoZSBldmVudC5cbiAqIEByZXR1cm4gV2hldGhlciB0aGUgZ2l2ZW4gZXZlbnQgaXMgbW9kaWZpZWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc01vZGlmaWVkQ2xpY2tFdmVudChlOiBFdmVudCk6IGJvb2xlYW4ge1xuICByZXR1cm4gKFxuICAgIC8vIGBtZXRhS2V5YCBpcyBhbiBvbGQgRE9NIEFQSS5cbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tYW55XG4gICAgKGlzTWFjICYmIChlIGFzIGFueSkubWV0YUtleSkgfHxcbiAgICAvLyBgY3RybEtleWAgaXMgYW4gb2xkIERPTSBBUEkuXG4gICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWFueVxuICAgICghaXNNYWMgJiYgKGUgYXMgYW55KS5jdHJsS2V5KSB8fFxuICAgIGlzTWlkZGxlQ2xpY2soZSkgfHxcbiAgICAvLyBgc2hpZnRLZXlgIGlzIGFuIG9sZCBET00gQVBJLlxuICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1hbnlcbiAgICAoZSBhcyBhbnkpLnNoaWZ0S2V5XG4gICk7XG59XG5cbi8qKiBXaGV0aGVyIHdlIGFyZSBvbiBXZWJLaXQgKGUuZy4sIENocm9tZSkuICovXG5leHBvcnQgY29uc3QgaXNXZWJLaXQ6IGJvb2xlYW4gPVxuICB0eXBlb2YgbmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJyAmJlxuICAhL09wZXJhLy50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpICYmXG4gIC9XZWJLaXQvLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCk7XG5cbi8qKiBXaGV0aGVyIHdlIGFyZSBvbiBJRS4gKi9cbmV4cG9ydCBjb25zdCBpc0llOiBib29sZWFuID1cbiAgdHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgKC9NU0lFLy50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpIHx8IC9UcmlkZW50Ly50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpKTtcblxuLyoqIFdoZXRoZXIgd2UgYXJlIG9uIEdlY2tvIChlLmcuLCBGaXJlZm94KS4gKi9cbmV4cG9ydCBjb25zdCBpc0dlY2tvOiBib29sZWFuID1cbiAgdHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgIS9PcGVyYXxXZWJLaXQvLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCkgJiZcbiAgL0dlY2tvLy50ZXN0KG5hdmlnYXRvci5wcm9kdWN0KTtcblxuLyoqXG4gKiBEZXRlcm1pbmVzIGFuZCByZXR1cm5zIHdoZXRoZXIgdGhlIGdpdmVuIGVsZW1lbnQgaXMgYSB2YWxpZCB0YXJnZXQgZm9yXG4gKiBrZXlwcmVzcy9rZXlkb3duIERPTSBldmVudHMgdGhhdCBhY3QgbGlrZSByZWd1bGFyIERPTSBjbGlja3MuXG4gKiBAcGFyYW0gZWwgVGhlIGVsZW1lbnQuXG4gKiBAcmV0dXJuIFdoZXRoZXIgdGhlIGdpdmVuIGVsZW1lbnQgaXMgYSB2YWxpZCBhY3Rpb24ga2V5IHRhcmdldC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzVmFsaWRBY3Rpb25LZXlUYXJnZXQoZWw6IEVsZW1lbnQpOiBib29sZWFuIHtcbiAgaWYgKCEoJ2dldEF0dHJpYnV0ZScgaW4gZWwpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGlmIChpc1RleHRDb250cm9sKGVsKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBpZiAoaXNOYXRpdmVseUFjdGl2YXRhYmxlKGVsKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICAvLyBgaXNDb250ZW50RWRpdGFibGVgIGlzIGFuIG9sZCBET00gQVBJLlxuICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tYW55XG4gIGlmICgoZWwgYXMgYW55KS5pc0NvbnRlbnRFZGl0YWJsZSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufVxuXG4vKipcbiAqIFdoZXRoZXIgYW4gZXZlbnQgaGFzIGEgbW9kaWZpZXIga2V5IGFjdGl2YXRlZC5cbiAqIEBwYXJhbSBlIFRoZSBldmVudC5cbiAqIEByZXR1cm4gVHJ1ZSwgaWYgYSBtb2RpZmllciBrZXkgaXMgYWN0aXZhdGVkLlxuICovXG5mdW5jdGlvbiBoYXNNb2RpZmllcktleShlOiBFdmVudCk6IGJvb2xlYW4ge1xuICByZXR1cm4gKFxuICAgIC8vIGBjdHJsS2V5YCBpcyBhbiBvbGQgRE9NIEFQSS5cbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tYW55XG4gICAgKGUgYXMgYW55KS5jdHJsS2V5IHx8XG4gICAgLy8gYHNoaWZ0S2V5YCBpcyBhbiBvbGQgRE9NIEFQSS5cbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tYW55XG4gICAgKGUgYXMgYW55KS5zaGlmdEtleSB8fFxuICAgIC8vIGBhbHRLZXlgIGlzIGFuIG9sZCBET00gQVBJLlxuICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1hbnlcbiAgICAoZSBhcyBhbnkpLmFsdEtleSB8fFxuICAgIC8vIGBtZXRhS2V5YCBpcyBhbiBvbGQgRE9NIEFQSS5cbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tYW55XG4gICAgKGUgYXMgYW55KS5tZXRhS2V5XG4gICk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lcyBhbmQgcmV0dXJucyB3aGV0aGVyIHRoZSBnaXZlbiBldmVudCBoYXMgYSB0YXJnZXQgdGhhdCBhbHJlYWR5XG4gKiBoYXMgZXZlbnQgaGFuZGxlcnMgYXR0YWNoZWQgYmVjYXVzZSBpdCBpcyBhIG5hdGl2ZSBIVE1MIGNvbnRyb2wuIFVzZWQgdG9cbiAqIGRldGVybWluZSBpZiBwcmV2ZW50RGVmYXVsdCBzaG91bGQgYmUgY2FsbGVkIHdoZW4gaXNBY3Rpb25LZXlFdmVudCBpcyB0cnVlLlxuICogQHBhcmFtIGUgVGhlIGV2ZW50LlxuICogQHJldHVybiBJZiBwcmV2ZW50RGVmYXVsdCBzaG91bGQgYmUgY2FsbGVkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2hvdWxkQ2FsbFByZXZlbnREZWZhdWx0T25OYXRpdmVIdG1sQ29udHJvbChlOiBFdmVudCk6IGJvb2xlYW4ge1xuICBjb25zdCBlbCA9IGdldFRhcmdldChlKTtcbiAgY29uc3QgdGFnTmFtZSA9IGVsLnRhZ05hbWUudG9VcHBlckNhc2UoKTtcbiAgY29uc3Qgcm9sZSA9IChlbC5nZXRBdHRyaWJ1dGUoJ3JvbGUnKSB8fCAnJykudG9VcHBlckNhc2UoKTtcblxuICBpZiAodGFnTmFtZSA9PT0gJ0JVVFRPTicgfHwgcm9sZSA9PT0gJ0JVVFRPTicpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICBpZiAoIWlzTmF0aXZlSFRNTENvbnRyb2woZWwpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGlmICh0YWdOYW1lID09PSAnQScpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgLyoqXG4gICAqIEZpeCBmb3IgcGh5c2ljYWwgZC1wYWRzIG9uIGZlYXR1cmUgcGhvbmUgcGxhdGZvcm1zOyB0aGUgbmF0aXZlIGV2ZW50XG4gICAqIChpZS4gaXNUcnVzdGVkOiB0cnVlKSBuZWVkcyB0byBmaXJlIHRvIHNob3cgdGhlIE9QVElPTiBsaXN0LiBTZWVcbiAgICogYi8xMzUyODg0NjkgZm9yIG1vcmUgaW5mby5cbiAgICovXG4gIGlmICh0YWdOYW1lID09PSAnU0VMRUNUJykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBpZiAocHJvY2Vzc1NwYWNlKGVsKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBpZiAoaXNUZXh0Q29udHJvbChlbCkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lcyBhbmQgcmV0dXJucyB3aGV0aGVyIHRoZSBnaXZlbiBldmVudCBhY3RzIGxpa2UgYSByZWd1bGFyIERPTSBjbGljayxcbiAqIGFuZCBzaG91bGQgYmUgaGFuZGxlZCBpbnN0ZWFkIG9mIHRoZSBjbGljay4gIElmIHRoaXMgcmV0dXJucyB0cnVlLCB0aGUgY2FsbGVyXG4gKiB3aWxsIGNhbGwgcHJldmVudERlZmF1bHQoKSB0byBwcmV2ZW50IGEgcG9zc2libGUgZHVwbGljYXRlIGV2ZW50LlxuICogVGhpcyBpcyByZXByZXNlbnRlZCBieSBhIGtleXByZXNzIChrZXlkb3duIG9uIEdlY2tvIGJyb3dzZXJzKSBvbiBFbnRlciBvclxuICogU3BhY2Uga2V5LlxuICogQHBhcmFtIGUgVGhlIGV2ZW50LlxuICogQHJldHVybiBUcnVlLCBpZiB0aGUgZXZlbnQgZW11bGF0ZXMgYSBET00gY2xpY2suXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0FjdGlvbktleUV2ZW50KGU6IEV2ZW50KTogYm9vbGVhbiB7XG4gIGxldCBrZXkgPVxuICAgIC8vIGB3aGljaGAgaXMgYW4gb2xkIERPTSBBUEkuXG4gICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWFueVxuICAgIChlIGFzIGFueSkud2hpY2ggfHxcbiAgICAvLyBga2V5Q29kZWAgaXMgYW4gb2xkIERPTSBBUEkuXG4gICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWFueVxuICAgIChlIGFzIGFueSkua2V5Q29kZTtcbiAgaWYgKCFrZXkgJiYgKGUgYXMgS2V5Ym9hcmRFdmVudCkua2V5KSB7XG4gICAga2V5ID0gQUNUSU9OX0tFWV9UT19LRVlDT0RFWyhlIGFzIEtleWJvYXJkRXZlbnQpLmtleV07XG4gIH1cbiAgaWYgKGlzV2ViS2l0ICYmIGtleSA9PT0gS2V5Q29kZS5NQUNfRU5URVIpIHtcbiAgICBrZXkgPSBLZXlDb2RlLkVOVEVSO1xuICB9XG4gIGlmIChrZXkgIT09IEtleUNvZGUuRU5URVIgJiYga2V5ICE9PSBLZXlDb2RlLlNQQUNFKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGNvbnN0IGVsID0gZ2V0VGFyZ2V0KGUpO1xuICBpZiAoZS50eXBlICE9PSBFdmVudFR5cGUuS0VZRE9XTiB8fCAhaXNWYWxpZEFjdGlvbktleVRhcmdldChlbCkgfHwgaGFzTW9kaWZpZXJLZXkoZSkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBGb3IgPGlucHV0IHR5cGU9XCJjaGVja2JveFwiPiwgd2UgbXVzdCBvbmx5IGhhbmRsZSB0aGUgYnJvd3NlcidzIG5hdGl2ZSBjbGlja1xuICAvLyBldmVudCwgc28gdGhhdCB0aGUgYnJvd3NlciBjYW4gdG9nZ2xlIHRoZSBjaGVja2JveC5cbiAgaWYgKHByb2Nlc3NTcGFjZShlbCkgJiYga2V5ID09PSBLZXlDb2RlLlNQQUNFKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gSWYgdGhpcyBlbGVtZW50IGlzIG5vbi1mb2N1c2FibGUsIGlnbm9yZSBzdHJheSBrZXlzdHJva2VzIChiLzE4MzM3MjA5KVxuICAvLyBTc2NyZWVuIHJlYWRlcnMgY2FuIG1vdmUgd2l0aG91dCB0YWIgZm9jdXMsIHNvIGFueSB0YWJJbmRleCBpcyBmb2N1c2FibGUuXG4gIC8vIFNlZSBCLzIxODA5NjA0XG4gIGlmICghaXNGb2N1c2FibGUoZWwpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgY29uc3QgdHlwZSA9IChcbiAgICBlbC5nZXRBdHRyaWJ1dGUoJ3JvbGUnKSB8fFxuICAgIChlbCBhcyBIVE1MSW5wdXRFbGVtZW50KS50eXBlIHx8XG4gICAgZWwudGFnTmFtZVxuICApLnRvVXBwZXJDYXNlKCk7XG4gIGNvbnN0IGlzU3BlY2lmaWNUcmlnZ2VyS2V5ID0gSURFTlRJRklFUl9UT19LRVlfVFJJR0dFUl9NQVBQSU5HW3R5cGVdICUga2V5ID09PSAwO1xuICBjb25zdCBpc0RlZmF1bHRUcmlnZ2VyS2V5ID0gISh0eXBlIGluIElERU5USUZJRVJfVE9fS0VZX1RSSUdHRVJfTUFQUElORykgJiYga2V5ID09PSBLZXlDb2RlLkVOVEVSO1xuICBjb25zdCBoYXNUeXBlID0gZWwudGFnTmFtZS50b1VwcGVyQ2FzZSgpICE9PSAnSU5QVVQnIHx8ICEhKGVsIGFzIEhUTUxJbnB1dEVsZW1lbnQpLnR5cGU7XG4gIHJldHVybiAoaXNTcGVjaWZpY1RyaWdnZXJLZXkgfHwgaXNEZWZhdWx0VHJpZ2dlcktleSkgJiYgaGFzVHlwZTtcbn1cblxuLyoqXG4gKiBDaGVja3Mgd2hldGhlciBhIERPTSBlbGVtZW50IGNhbiByZWNlaXZlIGtleWJvYXJkIGZvY3VzLlxuICogVGhpcyBjb2RlIGlzIGJhc2VkIG9uIGdvb2cuZG9tLmlzRm9jdXNhYmxlLCBidXQgc2ltcGxpZmllZCBzaW5jZSB3ZSBzaG91bGRuJ3RcbiAqIGNhcmUgYWJvdXQgdmlzaWJpbGl0eSBpZiB3ZSdyZSBhbHJlYWR5IGhhbmRsaW5nIGEga2V5Ym9hcmQgZXZlbnQuXG4gKi9cbmZ1bmN0aW9uIGlzRm9jdXNhYmxlKGVsOiBFbGVtZW50KTogYm9vbGVhbiB7XG4gIHJldHVybiAoXG4gICAgKGVsLnRhZ05hbWUgaW4gTkFUSVZFTFlfRk9DVVNBQkxFX0VMRU1FTlRTIHx8IGhhc1NwZWNpZmllZFRhYkluZGV4KGVsKSkgJiZcbiAgICAhKGVsIGFzIEhUTUxJbnB1dEVsZW1lbnQpLmRpc2FibGVkXG4gICk7XG59XG5cbi8qKlxuICogQHBhcmFtIGVsZW1lbnQgRWxlbWVudCB0byBjaGVjay5cbiAqIEByZXR1cm4gV2hldGhlciB0aGUgZWxlbWVudCBoYXMgYSBzcGVjaWZpZWQgdGFiIGluZGV4LlxuICovXG5mdW5jdGlvbiBoYXNTcGVjaWZpZWRUYWJJbmRleChlbGVtZW50OiBFbGVtZW50KTogYm9vbGVhbiB7XG4gIC8vIElFIHJldHVybnMgMCBmb3IgYW4gdW5zZXQgdGFiSW5kZXgsIHNvIHdlIG11c3QgdXNlIGdldEF0dHJpYnV0ZU5vZGUoKSxcbiAgLy8gd2hpY2ggcmV0dXJucyBhbiBvYmplY3Qgd2l0aCBhICdzcGVjaWZpZWQnIHByb3BlcnR5IGlmIHRhYkluZGV4IGlzXG4gIC8vIHNwZWNpZmllZC4gIFRoaXMgd29ya3Mgb24gb3RoZXIgYnJvd3NlcnMsIHRvby5cbiAgY29uc3QgYXR0ck5vZGUgPSBlbGVtZW50LmdldEF0dHJpYnV0ZU5vZGUoJ3RhYmluZGV4Jyk7IC8vIE11c3QgYmUgbG93ZXJjYXNlIVxuICByZXR1cm4gYXR0ck5vZGUgIT0gbnVsbCAmJiBhdHRyTm9kZS5zcGVjaWZpZWQ7XG59XG5cbi8qKiBFbGVtZW50IHRhZ25hbWVzIHRoYXQgYXJlIGZvY3VzYWJsZSBieSBkZWZhdWx0LiAqL1xuY29uc3QgTkFUSVZFTFlfRk9DVVNBQkxFX0VMRU1FTlRTOiB7W2tleTogc3RyaW5nXTogbnVtYmVyfSA9IHtcbiAgJ0EnOiAxLFxuICAnSU5QVVQnOiAxLFxuICAnVEVYVEFSRUEnOiAxLFxuICAnU0VMRUNUJzogMSxcbiAgJ0JVVFRPTic6IDEsXG59O1xuXG4vKiogQHJldHVybiBUcnVlLCBpZiB0aGUgU3BhY2Uga2V5IHdhcyBwcmVzc2VkLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzU3BhY2VLZXlFdmVudChlOiBFdmVudCk6IGJvb2xlYW4ge1xuICBjb25zdCBrZXkgPVxuICAgIC8vIGB3aGljaGAgaXMgYW4gb2xkIERPTSBBUEkuXG4gICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWFueVxuICAgIChlIGFzIGFueSkud2hpY2ggfHxcbiAgICAvLyBga2V5Q29kZWAgaXMgYW4gb2xkIERPTSBBUEkuXG4gICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWFueVxuICAgIChlIGFzIGFueSkua2V5Q29kZTtcbiAgY29uc3QgZWwgPSBnZXRUYXJnZXQoZSk7XG4gIGNvbnN0IGVsZW1lbnROYW1lID0gKChlbCBhcyBIVE1MSW5wdXRFbGVtZW50KS50eXBlIHx8IGVsLnRhZ05hbWUpLnRvVXBwZXJDYXNlKCk7XG4gIHJldHVybiBrZXkgPT09IEtleUNvZGUuU1BBQ0UgJiYgZWxlbWVudE5hbWUgIT09ICdDSEVDS0JPWCc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSBldmVudCBjb3JyZXNwb25kcyB0byBhIG5vbi1idWJibGluZyBtb3VzZVxuICogZXZlbnQgdHlwZSAobW91c2VlbnRlciwgbW91c2VsZWF2ZSwgcG9pbnRlcmVudGVyLCBhbmQgcG9pbnRlcmxlYXZlKS5cbiAqXG4gKiBEdXJpbmcgbW91c2VvdmVyIChtb3VzZWVudGVyKSBhbmQgcG9pbnRlcm92ZXIgKHBvaW50ZXJlbnRlciksIHRoZVxuICogcmVsYXRlZFRhcmdldCBpcyB0aGUgZWxlbWVudCBiZWluZyBlbnRlcmVkIGZyb20uIER1cmluZyBtb3VzZW91dCAobW91c2VsZWF2ZSlcbiAqIGFuZCBwb2ludGVyb3V0IChwb2ludGVybGVhdmUpLCB0aGUgcmVsYXRlZFRhcmdldCBpcyB0aGUgZWxlbWVudCBiZWluZyBleGl0ZWRcbiAqIHRvLlxuICpcbiAqIEluIGJvdGggY2FzZXMsIGlmIHJlbGF0ZWRUYXJnZXQgaXMgb3V0c2lkZSB0YXJnZXQsIHRoZW4gdGhlIGNvcnJlc3BvbmRpbmdcbiAqIHNwZWNpYWwgZXZlbnQgaGFzIG9jY3VycmVkLCBvdGhlcndpc2UgaXQgaGFzbid0LlxuICpcbiAqIEBwYXJhbSBlIFRoZSBtb3VzZW92ZXIvbW91c2VvdXQgZXZlbnQuXG4gKiBAcGFyYW0gdHlwZSBUaGUgdHlwZSBvZiB0aGUgbW91c2Ugc3BlY2lhbCBldmVudC5cbiAqIEBwYXJhbSBlbGVtZW50IFRoZSBlbGVtZW50IG9uIHdoaWNoIHRoZSBqc2FjdGlvbiBmb3IgdGhlXG4gKiAgICAgbW91c2VlbnRlci9tb3VzZWxlYXZlIGV2ZW50IGlzIGRlZmluZWQuXG4gKiBAcmV0dXJuIFRydWUgaWYgdGhlIGV2ZW50IGlzIGEgbW91c2VlbnRlci9tb3VzZWxlYXZlIGV2ZW50LlxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNNb3VzZVNwZWNpYWxFdmVudChlOiBFdmVudCwgdHlwZTogc3RyaW5nLCBlbGVtZW50OiBFbGVtZW50KTogYm9vbGVhbiB7XG4gIC8vIGByZWxhdGVkVGFyZ2V0YCBpcyBhbiBvbGQgRE9NIEFQSS5cbiAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWFueVxuICBjb25zdCByZWxhdGVkID0gKGUgYXMgYW55KS5yZWxhdGVkVGFyZ2V0IGFzIE5vZGU7XG5cbiAgcmV0dXJuIChcbiAgICAoKGUudHlwZSA9PT0gRXZlbnRUeXBlLk1PVVNFT1ZFUiAmJiB0eXBlID09PSBFdmVudFR5cGUuTU9VU0VFTlRFUikgfHxcbiAgICAgIChlLnR5cGUgPT09IEV2ZW50VHlwZS5NT1VTRU9VVCAmJiB0eXBlID09PSBFdmVudFR5cGUuTU9VU0VMRUFWRSkgfHxcbiAgICAgIChlLnR5cGUgPT09IEV2ZW50VHlwZS5QT0lOVEVST1ZFUiAmJiB0eXBlID09PSBFdmVudFR5cGUuUE9JTlRFUkVOVEVSKSB8fFxuICAgICAgKGUudHlwZSA9PT0gRXZlbnRUeXBlLlBPSU5URVJPVVQgJiYgdHlwZSA9PT0gRXZlbnRUeXBlLlBPSU5URVJMRUFWRSkpICYmXG4gICAgKCFyZWxhdGVkIHx8IChyZWxhdGVkICE9PSBlbGVtZW50ICYmICFkb20uY29udGFpbnMoZWxlbWVudCwgcmVsYXRlZCkpKVxuICApO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgRXZlbnRMaWtlIG9iamVjdCBmb3IgYSBtb3VzZWVudGVyL21vdXNlbGVhdmUgZXZlbnQgdGhhdCdzXG4gKiBkZXJpdmVkIGZyb20gdGhlIG9yaWdpbmFsIGNvcnJlc3BvbmRpbmcgbW91c2VvdmVyL21vdXNlb3V0IGV2ZW50LlxuICogQHBhcmFtIGUgVGhlIGV2ZW50LlxuICogQHBhcmFtIHRhcmdldCBUaGUgZWxlbWVudCBvbiB3aGljaCB0aGUganNhY3Rpb24gZm9yIHRoZSBtb3VzZWVudGVyL21vdXNlbGVhdmVcbiAqICAgICBldmVudCBpcyBkZWZpbmVkLlxuICogQHJldHVybiBBIG1vZGlmaWVkIGV2ZW50LWxpa2Ugb2JqZWN0IGNvcGllZCBmcm9tIHRoZSBldmVudCBvYmplY3QgcGFzc2VkIGludG9cbiAqICAgICB0aGlzIGZ1bmN0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlTW91c2VTcGVjaWFsRXZlbnQoZTogRXZlbnQsIHRhcmdldDogRWxlbWVudCk6IEV2ZW50IHtcbiAgLy8gV2UgaGF2ZSB0byBjcmVhdGUgYSBjb3B5IG9mIHRoZSBldmVudCBvYmplY3QgYmVjYXVzZSB3ZSBuZWVkIHRvIG11dGF0ZVxuICAvLyBpdHMgZmllbGRzLiBXZSBkbyB0aGlzIGZvciB0aGUgc3BlY2lhbCBtb3VzZSBldmVudHMgYmVjYXVzZSB0aGUgZXZlbnRcbiAgLy8gdGFyZ2V0IG5lZWRzIHRvIGJlIHJldGFyZ2V0ZWQgdG8gdGhlIGFjdGlvbiBlbGVtZW50IHJhdGhlciB0aGFuIHRoZSByZWFsXG4gIC8vIGVsZW1lbnQgKHNpbmNlIHdlIGFyZSBzaW11bGF0aW5nIHRoZSBzcGVjaWFsIG1vdXNlIGV2ZW50cyB3aXRoIG1vdXNlb3Zlci9cbiAgLy8gbW91c2VvdXQpLlxuICAvL1xuICAvLyBTaW5jZSB3ZSdyZSBtYWtpbmcgYSBjb3B5IGFueXdheXMsIHdlIG1pZ2h0IGFzIHdlbGwgYXR0ZW1wdCB0byBjb252ZXJ0XG4gIC8vIHRoaXMgZXZlbnQgaW50byBhIHBzZXVkby1yZWFsIG1vdXNlZW50ZXIvbW91c2VsZWF2ZSBldmVudCBieSBhZGp1c3RpbmdcbiAgLy8gaXRzIHR5cGUuXG4gIC8vXG4gIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1hbnlcbiAgY29uc3QgY29weTogey1yZWFkb25seSBbUCBpbiBrZXlvZiBFdmVudF0/OiBFdmVudFtQXX0gPSB7fTtcbiAgZm9yIChjb25zdCBwcm9wZXJ0eSBpbiBlKSB7XG4gICAgaWYgKHByb3BlcnR5ID09PSAnc3JjRWxlbWVudCcgfHwgcHJvcGVydHkgPT09ICd0YXJnZXQnKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgY29uc3Qga2V5ID0gcHJvcGVydHkgYXMga2V5b2YgRXZlbnQ7XG4gICAgLy8gTWFraW5nIGEgY29weSByZXF1aXJlcyBpdGVyYXRpbmcgdGhyb3VnaCBhbGwgcHJvcGVydGllcyBvZiBgRXZlbnRgLlxuICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1kaWN0LWFjY2Vzcy1vbi1zdHJ1Y3QtdHlwZVxuICAgIGNvbnN0IHZhbHVlID0gZVtrZXldO1xuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICAvLyBWYWx1ZSBzaG91bGQgYmUgdGhlIGV4cGVjdGVkIHR5cGUsIGJ1dCB0aGUgdmFsdWUgb2YgYGtleWAgaXMgbm90IGtub3duXG4gICAgLy8gc3RhdGljYWxseS5cbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tYW55XG4gICAgY29weVtrZXldID0gdmFsdWUgYXMgYW55O1xuICB9XG4gIGlmIChlLnR5cGUgPT09IEV2ZW50VHlwZS5NT1VTRU9WRVIpIHtcbiAgICBjb3B5Wyd0eXBlJ10gPSBFdmVudFR5cGUuTU9VU0VFTlRFUjtcbiAgfSBlbHNlIGlmIChlLnR5cGUgPT09IEV2ZW50VHlwZS5NT1VTRU9VVCkge1xuICAgIGNvcHlbJ3R5cGUnXSA9IEV2ZW50VHlwZS5NT1VTRUxFQVZFO1xuICB9IGVsc2UgaWYgKGUudHlwZSA9PT0gRXZlbnRUeXBlLlBPSU5URVJPVkVSKSB7XG4gICAgY29weVsndHlwZSddID0gRXZlbnRUeXBlLlBPSU5URVJFTlRFUjtcbiAgfSBlbHNlIHtcbiAgICBjb3B5Wyd0eXBlJ10gPSBFdmVudFR5cGUuUE9JTlRFUkxFQVZFO1xuICB9XG4gIGNvcHlbJ3RhcmdldCddID0gY29weVsnc3JjRWxlbWVudCddID0gdGFyZ2V0O1xuICBjb3B5WydidWJibGVzJ10gPSBmYWxzZTtcbiAgcmV0dXJuIGNvcHkgYXMgRXZlbnQ7XG59XG5cbi8qKlxuICogUmV0dXJucyB0b3VjaCBkYXRhIGV4dHJhY3RlZCBmcm9tIHRoZSB0b3VjaCBldmVudDogY2xpZW50WCwgY2xpZW50WSwgc2NyZWVuWFxuICogYW5kIHNjcmVlblkuIElmIHRoZSBldmVudCBoYXMgbm8gdG91Y2ggaW5mb3JtYXRpb24gYXQgYWxsLCB0aGUgcmV0dXJuZWRcbiAqIHZhbHVlIGlzIG51bGwuXG4gKlxuICogVGhlIGZpZWxkcyBvZiB0aGlzIE9iamVjdCBhcmUgdW5xdW90ZWQuXG4gKlxuICogQHBhcmFtIGV2ZW50IEEgdG91Y2ggZXZlbnQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRUb3VjaERhdGEoXG4gIGV2ZW50OiBUb3VjaEV2ZW50LFxuKToge2NsaWVudFg6IG51bWJlcjsgY2xpZW50WTogbnVtYmVyOyBzY3JlZW5YOiBudW1iZXI7IHNjcmVlblk6IG51bWJlcn0gfCBudWxsIHtcbiAgY29uc3QgdG91Y2ggPVxuICAgIChldmVudC5jaGFuZ2VkVG91Y2hlcyAmJiBldmVudC5jaGFuZ2VkVG91Y2hlc1swXSkgfHwgKGV2ZW50LnRvdWNoZXMgJiYgZXZlbnQudG91Y2hlc1swXSk7XG4gIGlmICghdG91Y2gpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICByZXR1cm4ge1xuICAgIGNsaWVudFg6IHRvdWNoLmNsaWVudFgsXG4gICAgY2xpZW50WTogdG91Y2guY2xpZW50WSxcbiAgICBzY3JlZW5YOiB0b3VjaC5zY3JlZW5YLFxuICAgIHNjcmVlblk6IHRvdWNoLnNjcmVlblksXG4gIH07XG59XG5cbmRlY2xhcmUgaW50ZXJmYWNlIFN5bnRoZXRpY01vdXNlRXZlbnQgZXh0ZW5kcyBFdmVudCB7XG4gIC8vIFJlZGVjbGFyZWQgZnJvbSBFdmVudCB0byBpbmRpY2F0ZSB0aGF0IGl0IGlzIG5vdCByZWFkb25seS5cbiAgZGVmYXVsdFByZXZlbnRlZDogYm9vbGVhbjtcbiAgb3JpZ2luYWxFdmVudFR5cGU6IHN0cmluZztcbiAgX3Byb3BhZ2F0aW9uU3RvcHBlZD86IGJvb2xlYW47XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBFdmVudExpa2Ugb2JqZWN0IGZvciBhIFwiY2xpY2tcIiBldmVudCB0aGF0J3MgZGVyaXZlZCBmcm9tIHRoZVxuICogb3JpZ2luYWwgY29ycmVzcG9uZGluZyBcInRvdWNoZW5kXCIgZXZlbnQgZm9yIGEgZmFzdC1jbGljayBpbXBsZW1lbnRhdGlvbi5cbiAqXG4gKiBJdCB0YWtlcyBhIHRvdWNoIGV2ZW50LCBhZGRzIGNvbW1vbiBmaWVsZHMgZm91bmQgaW4gYSBjbGljayBldmVudCBhbmRcbiAqIGNoYW5nZXMgdGhlIHR5cGUgdG8gJ2NsaWNrJywgc28gdGhhdCB0aGUgcmVzdWx0aW5nIGV2ZW50IGxvb2tzIG1vcmUgbGlrZVxuICogYSByZWFsIGNsaWNrIGV2ZW50LlxuICpcbiAqIEBwYXJhbSBldmVudCBBIHRvdWNoIGV2ZW50LlxuICogQHJldHVybiBBIG1vZGlmaWVkIGV2ZW50LWxpa2Ugb2JqZWN0IGNvcGllZCBmcm9tIHRoZSBldmVudCBvYmplY3QgcGFzc2VkIGludG9cbiAqICAgICB0aGlzIGZ1bmN0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVjcmVhdGVUb3VjaEV2ZW50QXNDbGljayhldmVudDogVG91Y2hFdmVudCk6IE1vdXNlRXZlbnQge1xuICBjb25zdCBjbGljazogey1yZWFkb25seSBbUCBpbiBrZXlvZiBNb3VzZUV2ZW50XT86IE1vdXNlRXZlbnRbUF19ICYgUGFydGlhbDxTeW50aGV0aWNNb3VzZUV2ZW50PiA9XG4gICAge307XG4gIGNsaWNrWydvcmlnaW5hbEV2ZW50VHlwZSddID0gZXZlbnQudHlwZTtcbiAgY2xpY2tbJ3R5cGUnXSA9IEV2ZW50VHlwZS5DTElDSztcbiAgZm9yIChjb25zdCBwcm9wZXJ0eSBpbiBldmVudCkge1xuICAgIGlmIChwcm9wZXJ0eSA9PT0gJ3R5cGUnIHx8IHByb3BlcnR5ID09PSAnc3JjRWxlbWVudCcpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICBjb25zdCBrZXkgPSBwcm9wZXJ0eSBhcyBrZXlvZiBUb3VjaEV2ZW50O1xuICAgIC8vIE1ha2luZyBhIGNvcHkgcmVxdWlyZXMgaXRlcmF0aW5nIHRocm91Z2ggYWxsIHByb3BlcnRpZXMgb2YgYFRvdWNoRXZlbnRgLlxuICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1kaWN0LWFjY2Vzcy1vbi1zdHJ1Y3QtdHlwZVxuICAgIGNvbnN0IHZhbHVlID0gZXZlbnRba2V5XTtcbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgLy8gVmFsdWUgc2hvdWxkIGJlIHRoZSBleHBlY3RlZCB0eXBlLCBidXQgdGhlIHZhbHVlIG9mIGBrZXlgIGlzIG5vdCBrbm93blxuICAgIC8vIHN0YXRpY2FsbHkuXG4gICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWFueVxuICAgIGNsaWNrW2tleSBhcyBrZXlvZiBNb3VzZUV2ZW50XSA9IHZhbHVlIGFzIGFueTtcbiAgfVxuXG4gIC8vIEVuc3VyZSB0aGF0IHRoZSBldmVudCBoYXMgdGhlIG1vc3QgcmVjZW50IHRpbWVzdGFtcC4gVGhpcyB0aW1lc3RhbXBcbiAgLy8gbWF5IGJlIHVzZWQgaW4gdGhlIGZ1dHVyZSB0byB2YWxpZGF0ZSBvciBjYW5jZWwgc3Vic2VxdWVudCBjbGljayBldmVudHMuXG4gIGNsaWNrWyd0aW1lU3RhbXAnXSA9IERhdGUubm93KCk7XG5cbiAgLy8gRW11bGF0ZSBwcmV2ZW50RGVmYXVsdCBhbmQgc3RvcFByb3BhZ2F0aW9uIGJlaGF2aW9yXG4gIGNsaWNrWydkZWZhdWx0UHJldmVudGVkJ10gPSBmYWxzZTtcbiAgY2xpY2tbJ3ByZXZlbnREZWZhdWx0J10gPSBzeW50aGV0aWNQcmV2ZW50RGVmYXVsdDtcbiAgY2xpY2tbJ19wcm9wYWdhdGlvblN0b3BwZWQnXSA9IGZhbHNlO1xuICBjbGlja1snc3RvcFByb3BhZ2F0aW9uJ10gPSBzeW50aGV0aWNTdG9wUHJvcGFnYXRpb247XG5cbiAgLy8gRW11bGF0ZSBjbGljayBjb29yZGluYXRlcyB1c2luZyB0b3VjaCBpbmZvXG4gIGNvbnN0IHRvdWNoID0gZ2V0VG91Y2hEYXRhKGV2ZW50KTtcbiAgaWYgKHRvdWNoKSB7XG4gICAgY2xpY2tbJ2NsaWVudFgnXSA9IHRvdWNoLmNsaWVudFg7XG4gICAgY2xpY2tbJ2NsaWVudFknXSA9IHRvdWNoLmNsaWVudFk7XG4gICAgY2xpY2tbJ3NjcmVlblgnXSA9IHRvdWNoLnNjcmVlblg7XG4gICAgY2xpY2tbJ3NjcmVlblknXSA9IHRvdWNoLnNjcmVlblk7XG4gIH1cbiAgcmV0dXJuIGNsaWNrIGFzIE1vdXNlRXZlbnQ7XG59XG5cbi8qKlxuICogQW4gaW1wbGVtZW50YXRpb24gb2YgXCJwcmV2ZW50RGVmYXVsdFwiIGZvciBhIHN5bnRoZXNpemVkIGV2ZW50LiBTaW1wbHlcbiAqIHNldHMgXCJkZWZhdWx0UHJldmVudGVkXCIgcHJvcGVydHkgdG8gdHJ1ZS5cbiAqL1xuZnVuY3Rpb24gc3ludGhldGljUHJldmVudERlZmF1bHQodGhpczogRXZlbnQpIHtcbiAgKHRoaXMgYXMgU3ludGhldGljTW91c2VFdmVudCkuZGVmYXVsdFByZXZlbnRlZCA9IHRydWU7XG59XG5cbi8qKlxuICogQW4gaW1wbGVtZW50YXRpb24gb2YgXCJzdG9wUHJvcGFnYXRpb25cIiBmb3IgYSBzeW50aGVzaXplZCBldmVudC4gSXQgc2ltcGx5XG4gKiBzZXRzIGEgc3ludGhldGljIG5vbi1zdGFuZGFyZCBcIl9wcm9wYWdhdGlvblN0b3BwZWRcIiBwcm9wZXJ0eSB0byB0cnVlLlxuICovXG5mdW5jdGlvbiBzeW50aGV0aWNTdG9wUHJvcGFnYXRpb24odGhpczogRXZlbnQpIHtcbiAgKHRoaXMgYXMgU3ludGhldGljTW91c2VFdmVudCkuX3Byb3BhZ2F0aW9uU3RvcHBlZCA9IHRydWU7XG59XG5cbi8qKlxuICogTWFwcGluZyBvZiBLZXlib2FyZEV2ZW50LmtleSB2YWx1ZXMgdG9cbiAqIEtleUNvZGUgdmFsdWVzLlxuICovXG5jb25zdCBBQ1RJT05fS0VZX1RPX0tFWUNPREU6IHtba2V5OiBzdHJpbmddOiBudW1iZXJ9ID0ge1xuICAnRW50ZXInOiBLZXlDb2RlLkVOVEVSLFxuICAnICc6IEtleUNvZGUuU1BBQ0UsXG59O1xuXG4vKipcbiAqIE1hcHBpbmcgb2YgSFRNTCBlbGVtZW50IGlkZW50aWZpZXJzIChBUklBIHJvbGUsIHR5cGUsIG9yIHRhZ05hbWUpIHRvIHRoZVxuICoga2V5cyAoZW50ZXIgYW5kL29yIHNwYWNlKSB0aGF0IHNob3VsZCBhY3RpdmF0ZSB0aGVtLiBBIHZhbHVlIG9mIHplcm8gbWVhbnNcbiAqIHRoYXQgYm90aCBzaG91bGQgYWN0aXZhdGUgdGhlbS5cbiAqL1xuZXhwb3J0IGNvbnN0IElERU5USUZJRVJfVE9fS0VZX1RSSUdHRVJfTUFQUElORzoge1trZXk6IHN0cmluZ106IG51bWJlcn0gPSB7XG4gICdBJzogS2V5Q29kZS5FTlRFUixcbiAgJ0JVVFRPTic6IDAsXG4gICdDSEVDS0JPWCc6IEtleUNvZGUuU1BBQ0UsXG4gICdDT01CT0JPWCc6IEtleUNvZGUuRU5URVIsXG4gICdGSUxFJzogMCxcbiAgJ0dSSURDRUxMJzogS2V5Q29kZS5FTlRFUixcbiAgJ0xJTksnOiBLZXlDb2RlLkVOVEVSLFxuICAnTElTVEJPWCc6IEtleUNvZGUuRU5URVIsXG4gICdNRU5VJzogMCxcbiAgJ01FTlVCQVInOiAwLFxuICAnTUVOVUlURU0nOiAwLFxuICAnTUVOVUlURU1DSEVDS0JPWCc6IDAsXG4gICdNRU5VSVRFTVJBRElPJzogMCxcbiAgJ09QVElPTic6IDAsXG4gICdSQURJTyc6IEtleUNvZGUuU1BBQ0UsXG4gICdSQURJT0dST1VQJzogS2V5Q29kZS5TUEFDRSxcbiAgJ1JFU0VUJzogMCxcbiAgJ1NVQk1JVCc6IDAsXG4gICdTV0lUQ0gnOiBLZXlDb2RlLlNQQUNFLFxuICAnVEFCJzogMCxcbiAgJ1RSRUUnOiBLZXlDb2RlLkVOVEVSLFxuICAnVFJFRUlURU0nOiBLZXlDb2RlLkVOVEVSLFxufTtcblxuLyoqXG4gKiBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRvIHByb2Nlc3Mgc3BhY2UgYmFzZWQgb24gdGhlIHR5cGUgb2YgdGhlIGVsZW1lbnQ7XG4gKiBjaGVja3MgdG8gbWFrZSBzdXJlIHRoYXQgdHlwZSBpcyBub3QgbnVsbC5cbiAqIEBwYXJhbSBlbGVtZW50IFRoZSBlbGVtZW50LlxuICogQHJldHVybiBXaGV0aGVyIG9yIG5vdCB0byBwcm9jZXNzIHNwYWNlIGJhc2VkIG9uIHR5cGUuXG4gKi9cbmZ1bmN0aW9uIHByb2Nlc3NTcGFjZShlbGVtZW50OiBFbGVtZW50KTogYm9vbGVhbiB7XG4gIGNvbnN0IHR5cGUgPSAoZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3R5cGUnKSB8fCBlbGVtZW50LnRhZ05hbWUpLnRvVXBwZXJDYXNlKCk7XG4gIHJldHVybiB0eXBlIGluIFBST0NFU1NfU1BBQ0U7XG59XG5cbi8qKlxuICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgZ2l2ZW4gZWxlbWVudCBpcyBhIHRleHQgY29udHJvbC5cbiAqIEBwYXJhbSBlbCBUaGUgZWxlbWVudC5cbiAqIEByZXR1cm4gV2hldGhlciBvciBub3QgdGhlIGdpdmVuIGVsZW1lbnQgaXMgYSB0ZXh0IGNvbnRyb2wuXG4gKi9cbmZ1bmN0aW9uIGlzVGV4dENvbnRyb2woZWw6IEVsZW1lbnQpOiBib29sZWFuIHtcbiAgY29uc3QgdHlwZSA9IChlbC5nZXRBdHRyaWJ1dGUoJ3R5cGUnKSB8fCBlbC50YWdOYW1lKS50b1VwcGVyQ2FzZSgpO1xuICByZXR1cm4gdHlwZSBpbiBURVhUX0NPTlRST0xTO1xufVxuXG4vKipcbiAqIFJldHVybnMgaWYgdGhlIGdpdmVuIGVsZW1lbnQgaXMgYSBuYXRpdmUgSFRNTCBjb250cm9sLlxuICogQHBhcmFtIGVsIFRoZSBlbGVtZW50LlxuICogQHJldHVybiBJZiB0aGUgZ2l2ZW4gZWxlbWVudCBpcyBhIG5hdGl2ZSBIVE1MIGNvbnRyb2wuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc05hdGl2ZUhUTUxDb250cm9sKGVsOiBFbGVtZW50KTogYm9vbGVhbiB7XG4gIHJldHVybiBlbC50YWdOYW1lLnRvVXBwZXJDYXNlKCkgaW4gTkFUSVZFX0hUTUxfQ09OVFJPTFM7XG59XG5cbi8qKlxuICogUmV0dXJucyBpZiB0aGUgZ2l2ZW4gZWxlbWVudCBpcyBuYXRpdmVseSBhY3RpdmF0YWJsZS4gQnJvd3NlcnMgZW1pdCBjbGlja1xuICogZXZlbnRzIGZvciBuYXRpdmVseSBhY3RpdmF0YWJsZSBlbGVtZW50cywgZXZlbiB3aGVuIGFjdGl2YXRlZCB2aWEga2V5Ym9hcmQuXG4gKiBGb3IgdGhlc2UgZWxlbWVudHMsIHdlIGRvbid0IG5lZWQgdG8gcmFpc2UgYTExeSBjbGljayBldmVudHMuXG4gKiBAcGFyYW0gZWwgVGhlIGVsZW1lbnQuXG4gKiBAcmV0dXJuIElmIHRoZSBnaXZlbiBlbGVtZW50IGlzIGEgbmF0aXZlIEhUTUwgY29udHJvbC5cbiAqL1xuZnVuY3Rpb24gaXNOYXRpdmVseUFjdGl2YXRhYmxlKGVsOiBFbGVtZW50KTogYm9vbGVhbiB7XG4gIHJldHVybiAoXG4gICAgZWwudGFnTmFtZS50b1VwcGVyQ2FzZSgpID09PSAnQlVUVE9OJyB8fFxuICAgICghIShlbCBhcyBIVE1MSW5wdXRFbGVtZW50KS50eXBlICYmIChlbCBhcyBIVE1MSW5wdXRFbGVtZW50KS50eXBlLnRvVXBwZXJDYXNlKCkgPT09ICdGSUxFJylcbiAgKTtcbn1cblxuLyoqXG4gKiBIVE1MIDxpbnB1dD4gdHlwZXMgKG5vdCBBUklBIHJvbGVzKSB3aGljaCB3aWxsIGF1dG8tdHJpZ2dlciBhIGNsaWNrIGV2ZW50IGZvclxuICogdGhlIFNwYWNlIGtleSwgd2l0aCBzaWRlLWVmZmVjdHMuIFdlIHdpbGwgbm90IGNhbGwgcHJldmVudERlZmF1bHQgaWYgc3BhY2UgaXNcbiAqIHByZXNzZWQsIG5vciB3aWxsIHdlIHJhaXNlIGExMXkgY2xpY2sgZXZlbnRzLiAgRm9yIGFsbCBvdGhlciBlbGVtZW50cywgd2UgY2FuXG4gKiBzdXBwcmVzcyB0aGUgZGVmYXVsdCBldmVudCAod2hpY2ggaGFzIG5vIGRlc2lyZWQgc2lkZS1lZmZlY3RzKSBhbmQgaGFuZGxlIHRoZVxuICoga2V5ZG93biBvdXJzZWx2ZXMuXG4gKi9cbmNvbnN0IFBST0NFU1NfU1BBQ0U6IHtba2V5OiBzdHJpbmddOiBib29sZWFufSA9IHtcbiAgJ0NIRUNLQk9YJzogdHJ1ZSxcbiAgJ0ZJTEUnOiB0cnVlLFxuICAnT1BUSU9OJzogdHJ1ZSxcbiAgJ1JBRElPJzogdHJ1ZSxcbn07XG5cbi8qKiBUYWdOYW1lcyBhbmQgSW5wdXQgdHlwZXMgZm9yIHdoaWNoIHRvIG5vdCBwcm9jZXNzIGVudGVyL3NwYWNlIGFzIGNsaWNrLiAqL1xuY29uc3QgVEVYVF9DT05UUk9MUzoge1trZXk6IHN0cmluZ106IGJvb2xlYW59ID0ge1xuICAnQ09MT1InOiB0cnVlLFxuICAnREFURSc6IHRydWUsXG4gICdEQVRFVElNRSc6IHRydWUsXG4gICdEQVRFVElNRS1MT0NBTCc6IHRydWUsXG4gICdFTUFJTCc6IHRydWUsXG4gICdNT05USCc6IHRydWUsXG4gICdOVU1CRVInOiB0cnVlLFxuICAnUEFTU1dPUkQnOiB0cnVlLFxuICAnUkFOR0UnOiB0cnVlLFxuICAnU0VBUkNIJzogdHJ1ZSxcbiAgJ1RFTCc6IHRydWUsXG4gICdURVhUJzogdHJ1ZSxcbiAgJ1RFWFRBUkVBJzogdHJ1ZSxcbiAgJ1RJTUUnOiB0cnVlLFxuICAnVVJMJzogdHJ1ZSxcbiAgJ1dFRUsnOiB0cnVlLFxufTtcblxuLyoqIFRhZ05hbWVzIHRoYXQgYXJlIG5hdGl2ZSBIVE1MIGNvbnRyb2xzLiAqL1xuY29uc3QgTkFUSVZFX0hUTUxfQ09OVFJPTFM6IHtba2V5OiBzdHJpbmddOiBib29sZWFufSA9IHtcbiAgJ0EnOiB0cnVlLFxuICAnQVJFQSc6IHRydWUsXG4gICdCVVRUT04nOiB0cnVlLFxuICAnRElBTE9HJzogdHJ1ZSxcbiAgJ0lNRyc6IHRydWUsXG4gICdJTlBVVCc6IHRydWUsXG4gICdMSU5LJzogdHJ1ZSxcbiAgJ01FTlUnOiB0cnVlLFxuICAnT1BUR1JPVVAnOiB0cnVlLFxuICAnT1BUSU9OJzogdHJ1ZSxcbiAgJ1BST0dSRVNTJzogdHJ1ZSxcbiAgJ1NFTEVDVCc6IHRydWUsXG4gICdURVhUQVJFQSc6IHRydWUsXG59O1xuXG4vKiogRXhwb3J0ZWQgZm9yIHRlc3RpbmcuICovXG5leHBvcnQgY29uc3QgdGVzdGluZyA9IHtcbiAgc2V0SXNNYWModmFsdWU6IGJvb2xlYW4pIHtcbiAgICBpc01hYyA9IHZhbHVlO1xuICB9LFxufTtcbiJdfQ==