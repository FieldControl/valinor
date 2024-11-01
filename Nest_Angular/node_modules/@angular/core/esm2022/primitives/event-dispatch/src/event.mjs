/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { isCaptureEventType, EventType } from './event_type';
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
    if (isCaptureEventType(eventType)) {
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
        (!related || (related !== element && !element.contains(related))));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3ByaW1pdGl2ZXMvZXZlbnQtZGlzcGF0Y2gvc3JjL2V2ZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUdILE9BQU8sRUFBQyxrQkFBa0IsRUFBRSxTQUFTLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFDM0QsT0FBTyxFQUFDLE9BQU8sRUFBQyxNQUFNLFlBQVksQ0FBQztBQUVuQzs7R0FFRztBQUNILE1BQU0sVUFBVSxtQkFBbUIsQ0FBQyxTQUFpQjtJQUNuRCx5RUFBeUU7SUFDekUsMkVBQTJFO0lBQzNFLHlFQUF5RTtJQUN6RSxxRUFBcUU7SUFDckUsdURBQXVEO0lBQ3ZELElBQUksU0FBUyxLQUFLLFNBQVMsQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUN2QyxPQUFPLFNBQVMsQ0FBQyxTQUFTLENBQUM7SUFDN0IsQ0FBQztTQUFNLElBQUksU0FBUyxLQUFLLFNBQVMsQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUM5QyxPQUFPLFNBQVMsQ0FBQyxRQUFRLENBQUM7SUFDNUIsQ0FBQztTQUFNLElBQUksU0FBUyxLQUFLLFNBQVMsQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUNoRCxPQUFPLFNBQVMsQ0FBQyxXQUFXLENBQUM7SUFDL0IsQ0FBQztTQUFNLElBQUksU0FBUyxLQUFLLFNBQVMsQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUNoRCxPQUFPLFNBQVMsQ0FBQyxVQUFVLENBQUM7SUFDOUIsQ0FBQztJQUNELE9BQU8sU0FBUyxDQUFDO0FBQ25CLENBQUM7QUFFRDs7Ozs7Ozs7R0FRRztBQUNILE1BQU0sVUFBVSxnQkFBZ0IsQ0FDOUIsT0FBZ0IsRUFDaEIsU0FBaUIsRUFDakIsT0FBK0I7SUFFL0Isb0RBQW9EO0lBQ3BELFNBQVM7SUFDVCxFQUFFO0lBQ0YsNEVBQTRFO0lBQzVFLHVFQUF1RTtJQUN2RSxZ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WixVQUFVLEVBQUUsSUFBSTtJQUNoQixRQUFRLEVBQUUsSUFBSTtJQUNkLFVBQVUsRUFBRSxJQUFJO0lBQ2hCLFFBQVEsRUFBRSxJQUFJO0lBQ2QsVUFBVSxFQUFFLElBQUk7Q0FDakIsQ0FBQztBQUVGLDRCQUE0QjtBQUM1QixNQUFNLENBQUMsTUFBTSxPQUFPLEdBQUc7SUFDckIsUUFBUSxDQUFDLEtBQWM7UUFDckIsS0FBSyxHQUFHLEtBQUssQ0FBQztJQUNoQixDQUFDO0NBQ0YsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtFdmVudEhhbmRsZXJJbmZvfSBmcm9tICcuL2V2ZW50X2hhbmRsZXInO1xuaW1wb3J0IHtpc0NhcHR1cmVFdmVudFR5cGUsIEV2ZW50VHlwZX0gZnJvbSAnLi9ldmVudF90eXBlJztcbmltcG9ydCB7S2V5Q29kZX0gZnJvbSAnLi9rZXlfY29kZSc7XG5cbi8qKlxuICogR2V0cyBhIGJyb3dzZXIgZXZlbnQgdHlwZSwgaWYgaXQgd291bGQgZGlmZmVyIGZyb20gdGhlIEpTQWN0aW9uIGV2ZW50IHR5cGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRCcm93c2VyRXZlbnRUeXBlKGV2ZW50VHlwZTogc3RyaW5nKSB7XG4gIC8vIE1vdXNlZW50ZXIgYW5kIG1vdXNlbGVhdmUgZXZlbnRzIGFyZSBub3QgaGFuZGxlZCBkaXJlY3RseSBiZWNhdXNlIHRoZXlcbiAgLy8gYXJlIG5vdCBhdmFpbGFibGUgZXZlcnl3aGVyZS4gSW4gYnJvd3NlcnMgd2hlcmUgdGhleSBhcmUgYXZhaWxhYmxlLCB0aGV5XG4gIC8vIGRvbid0IGJ1YmJsZSBhbmQgYXJlbid0IHZpc2libGUgYXQgdGhlIGNvbnRhaW5lciBib3VuZGFyeS4gSW5zdGVhZCwgd2VcbiAgLy8gc3ludGhlc2l6ZSB0aGUgbW91c2VlbnRlciBhbmQgbW91c2VsZWF2ZSBldmVudHMgZnJvbSBtb3VzZW92ZXIgYW5kXG4gIC8vIG1vdXNlb3V0IGV2ZW50cywgcmVzcGVjdGl2ZWx5LiBDZi4gZXZlbnRjb250cmFjdC5qcy5cbiAgaWYgKGV2ZW50VHlwZSA9PT0gRXZlbnRUeXBlLk1PVVNFRU5URVIpIHtcbiAgICByZXR1cm4gRXZlbnRUeXBlLk1PVVNFT1ZFUjtcbiAgfSBlbHNlIGlmIChldmVudFR5cGUgPT09IEV2ZW50VHlwZS5NT1VTRUxFQVZFKSB7XG4gICAgcmV0dXJuIEV2ZW50VHlwZS5NT1VTRU9VVDtcbiAgfSBlbHNlIGlmIChldmVudFR5cGUgPT09IEV2ZW50VHlwZS5QT0lOVEVSRU5URVIpIHtcbiAgICByZXR1cm4gRXZlbnRUeXBlLlBPSU5URVJPVkVSO1xuICB9IGVsc2UgaWYgKGV2ZW50VHlwZSA9PT0gRXZlbnRUeXBlLlBPSU5URVJMRUFWRSkge1xuICAgIHJldHVybiBFdmVudFR5cGUuUE9JTlRFUk9VVDtcbiAgfVxuICByZXR1cm4gZXZlbnRUeXBlO1xufVxuXG4vKipcbiAqIFJlZ2lzdGVycyB0aGUgZXZlbnQgaGFuZGxlciBmdW5jdGlvbiB3aXRoIHRoZSBnaXZlbiBET00gZWxlbWVudCBmb3JcbiAqIHRoZSBnaXZlbiBldmVudCB0eXBlLlxuICpcbiAqIEBwYXJhbSBlbGVtZW50IFRoZSBlbGVtZW50LlxuICogQHBhcmFtIGV2ZW50VHlwZSBUaGUgZXZlbnQgdHlwZS5cbiAqIEBwYXJhbSBoYW5kbGVyIFRoZSBoYW5kbGVyIGZ1bmN0aW9uIHRvIGluc3RhbGwuXG4gKiBAcmV0dXJuIEluZm9ybWF0aW9uIG5lZWRlZCB0byB1bmluc3RhbGwgdGhlIGV2ZW50IGhhbmRsZXIgZXZlbnR1YWxseS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFkZEV2ZW50TGlzdGVuZXIoXG4gIGVsZW1lbnQ6IEVsZW1lbnQsXG4gIGV2ZW50VHlwZTogc3RyaW5nLFxuICBoYW5kbGVyOiAoZXZlbnQ6IEV2ZW50KSA9PiB2b2lkLFxuKTogRXZlbnRIYW5kbGVySW5mbyB7XG4gIC8vIEFsbCBldmVudCBoYW5kbGVycyBhcmUgcmVnaXN0ZXJlZCBpbiB0aGUgYnViYmxpbmdcbiAgLy8gcGhhc2UuXG4gIC8vXG4gIC8vIEFsbCBicm93c2VycyBzdXBwb3J0IGZvY3VzIGFuZCBibHVyLCBidXQgdGhlc2UgZXZlbnRzIG9ubHkgYXJlIHByb3BhZ2F0ZWRcbiAgLy8gaW4gdGhlIGNhcHR1cmUgcGhhc2UuIFZlcnkgbGVnYWN5IGJyb3dzZXJzIGRvIG5vdCBzdXBwb3J0IGZvY3VzaW4gb3JcbiAgLy8gZm9jdXNvdXQuXG4gIC8vXG4gIC8vIEl0IHdvdWxkIGJlIGEgYmFkIGlkZWEgdG8gcmVnaXN0ZXIgYWxsIGV2ZW50IGhhbmRsZXJzIGluIHRoZVxuICAvLyBjYXB0dXJlIHBoYXNlIGJlY2F1c2UgdGhlbiByZWd1bGFyIG9uY2xpY2sgaGFuZGxlcnMgd291bGQgbm90IGJlXG4gIC8vIGV4ZWN1dGVkIGF0IGFsbCBvbiBldmVudHMgdGhhdCB0cmlnZ2VyIGEganNhY3Rpb24uIFRoYXQncyBub3RcbiAgLy8gZW50aXJlbHkgd2hhdCB3ZSB3YW50LCBhdCBsZWFzdCBmb3Igbm93LlxuICAvL1xuICAvLyBFcnJvciBhbmQgbG9hZCBldmVudHMgKGkuZS4gb24gaW1hZ2VzKSBkbyBub3QgYnViYmxlIHNvIHRoZXkgYXJlIGFsc29cbiAgLy8gaGFuZGxlZCBpbiB0aGUgY2FwdHVyZSBwaGFzZS5cbiAgbGV0IGNhcHR1cmUgPSBmYWxzZTtcblxuICBpZiAoaXNDYXB0dXJlRXZlbnRUeXBlKGV2ZW50VHlwZSkpIHtcbiAgICBjYXB0dXJlID0gdHJ1ZTtcbiAgfVxuICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnRUeXBlLCBoYW5kbGVyLCBjYXB0dXJlKTtcblxuICByZXR1cm4ge2V2ZW50VHlwZSwgaGFuZGxlciwgY2FwdHVyZX07XG59XG5cbi8qKlxuICogUmVtb3ZlcyB0aGUgZXZlbnQgaGFuZGxlciBmb3IgdGhlIGdpdmVuIGV2ZW50IGZyb20gdGhlIGVsZW1lbnQuXG4gKiB0aGUgZ2l2ZW4gZXZlbnQgdHlwZS5cbiAqXG4gKiBAcGFyYW0gZWxlbWVudCBUaGUgZWxlbWVudC5cbiAqIEBwYXJhbSBpbmZvIFRoZSBpbmZvcm1hdGlvbiBuZWVkZWQgdG8gZGVyZWdpc3RlciB0aGUgaGFuZGxlciwgYXMgcmV0dXJuZWQgYnlcbiAqICAgICBhZGRFdmVudExpc3RlbmVyKCksIGFib3ZlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVtb3ZlRXZlbnRMaXN0ZW5lcihlbGVtZW50OiBFbGVtZW50LCBpbmZvOiBFdmVudEhhbmRsZXJJbmZvKSB7XG4gIGlmIChlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIpIHtcbiAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoaW5mby5ldmVudFR5cGUsIGluZm8uaGFuZGxlciBhcyBFdmVudExpc3RlbmVyLCBpbmZvLmNhcHR1cmUpO1xuICAgIC8vIGBkZXRhY2hFdmVudGAgaXMgYW4gb2xkIERPTSBBUEkuXG4gICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWFueVxuICB9IGVsc2UgaWYgKChlbGVtZW50IGFzIGFueSkuZGV0YWNoRXZlbnQpIHtcbiAgICAvLyBgZGV0YWNoRXZlbnRgIGlzIGFuIG9sZCBET00gQVBJLlxuICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1hbnlcbiAgICAoZWxlbWVudCBhcyBhbnkpLmRldGFjaEV2ZW50KGBvbiR7aW5mby5ldmVudFR5cGV9YCwgaW5mby5oYW5kbGVyKTtcbiAgfVxufVxuXG4vKipcbiAqIENhbmNlbHMgcHJvcGFnYXRpb24gb2YgYW4gZXZlbnQuXG4gKiBAcGFyYW0gZSBUaGUgZXZlbnQgdG8gY2FuY2VsIHByb3BhZ2F0aW9uIGZvci5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN0b3BQcm9wYWdhdGlvbihlOiBFdmVudCkge1xuICBlLnN0b3BQcm9wYWdhdGlvbiA/IGUuc3RvcFByb3BhZ2F0aW9uKCkgOiAoZS5jYW5jZWxCdWJibGUgPSB0cnVlKTtcbn1cblxuLyoqXG4gKiBQcmV2ZW50cyB0aGUgZGVmYXVsdCBhY3Rpb24gb2YgYW4gZXZlbnQuXG4gKiBAcGFyYW0gZSBUaGUgZXZlbnQgdG8gcHJldmVudCB0aGUgZGVmYXVsdCBhY3Rpb24gZm9yLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcHJldmVudERlZmF1bHQoZTogRXZlbnQpIHtcbiAgZS5wcmV2ZW50RGVmYXVsdCA/IGUucHJldmVudERlZmF1bHQoKSA6IChlLnJldHVyblZhbHVlID0gZmFsc2UpO1xufVxuXG4vKipcbiAqIEdldHMgdGhlIHRhcmdldCBFbGVtZW50IG9mIHRoZSBldmVudC4gSW4gRmlyZWZveCwgYSB0ZXh0IG5vZGUgbWF5IGFwcGVhciBhc1xuICogdGhlIHRhcmdldCBvZiB0aGUgZXZlbnQsIGluIHdoaWNoIGNhc2Ugd2UgcmV0dXJuIHRoZSBwYXJlbnQgZWxlbWVudCBvZiB0aGVcbiAqIHRleHQgbm9kZS5cbiAqIEBwYXJhbSBlIFRoZSBldmVudCB0byBnZXQgdGhlIHRhcmdldCBvZi5cbiAqIEByZXR1cm4gVGhlIHRhcmdldCBlbGVtZW50LlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0VGFyZ2V0KGU6IEV2ZW50KTogRWxlbWVudCB7XG4gIGxldCBlbCA9IGUudGFyZ2V0IGFzIEVsZW1lbnQ7XG5cbiAgLy8gSW4gRmlyZWZveCwgdGhlIGV2ZW50IG1heSBoYXZlIGEgdGV4dCBub2RlIGFzIGl0cyB0YXJnZXQuIFdlIGFsd2F5c1xuICAvLyB3YW50IHRoZSBwYXJlbnQgRWxlbWVudCB0aGUgdGV4dCBub2RlIGJlbG9uZ3MgdG8sIGhvd2V2ZXIuXG4gIGlmICghZWwuZ2V0QXR0cmlidXRlICYmIGVsLnBhcmVudE5vZGUpIHtcbiAgICBlbCA9IGVsLnBhcmVudE5vZGUgYXMgRWxlbWVudDtcbiAgfVxuXG4gIHJldHVybiBlbDtcbn1cblxuLyoqXG4gKiBXaGV0aGVyIHdlIGFyZSBvbiBhIE1hYy4gTm90IHB1bGxpbmcgaW4gdXNlcmFnZW50IGp1c3QgZm9yIHRoaXMuXG4gKi9cbmxldCBpc01hYzogYm9vbGVhbiA9IHR5cGVvZiBuYXZpZ2F0b3IgIT09ICd1bmRlZmluZWQnICYmIC9NYWNpbnRvc2gvLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCk7XG5cbi8qKlxuICogRGV0ZXJtaW5lcyBhbmQgcmV0dXJucyB3aGV0aGVyIHRoZSBnaXZlbiBldmVudCAod2hpY2ggaXMgYXNzdW1lZCB0byBiZSBhXG4gKiBjbGljayBldmVudCkgaXMgYSBtaWRkbGUgY2xpY2suXG4gKiBOT1RFOiBUaGVyZSBpcyBub3QgYSBjb25zaXN0ZW50IHdheSB0byBpZGVudGlmeSBtaWRkbGUgY2xpY2tcbiAqIGh0dHA6Ly93d3cudW5peHBhcGEuY29tL2pzL21vdXNlLmh0bWxcbiAqL1xuZnVuY3Rpb24gaXNNaWRkbGVDbGljayhlOiBFdmVudCk6IGJvb2xlYW4ge1xuICByZXR1cm4gKFxuICAgIC8vIGB3aGljaGAgaXMgYW4gb2xkIERPTSBBUEkuXG4gICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWFueVxuICAgIChlIGFzIGFueSkud2hpY2ggPT09IDIgfHxcbiAgICAvLyBgd2hpY2hgIGlzIGFuIG9sZCBET00gQVBJLlxuICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1hbnlcbiAgICAoKGUgYXMgYW55KS53aGljaCA9PSBudWxsICYmXG4gICAgICAvLyBgYnV0dG9uYCBpcyBhbiBvbGQgRE9NIEFQSS5cbiAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1hbnlcbiAgICAgIChlIGFzIGFueSkuYnV0dG9uID09PSA0KSAvLyBtaWRkbGUgY2xpY2sgZm9yIElFXG4gICk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lcyBhbmQgcmV0dXJucyB3aGV0aGVyIHRoZSBnaXZlbiBldmVudCAod2hpY2ggaXMgYXNzdW1lZFxuICogdG8gYmUgYSBjbGljayBldmVudCkgaXMgbW9kaWZpZWQuIEEgbWlkZGxlIGNsaWNrIGlzIGNvbnNpZGVyZWQgYSBtb2RpZmllZFxuICogY2xpY2sgdG8gcmV0YWluIHRoZSBkZWZhdWx0IGJyb3dzZXIgYWN0aW9uLCB3aGljaCBvcGVucyBhIGxpbmsgaW4gYSBuZXcgdGFiLlxuICogQHBhcmFtIGUgVGhlIGV2ZW50LlxuICogQHJldHVybiBXaGV0aGVyIHRoZSBnaXZlbiBldmVudCBpcyBtb2RpZmllZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzTW9kaWZpZWRDbGlja0V2ZW50KGU6IEV2ZW50KTogYm9vbGVhbiB7XG4gIHJldHVybiAoXG4gICAgLy8gYG1ldGFLZXlgIGlzIGFuIG9sZCBET00gQVBJLlxuICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1hbnlcbiAgICAoaXNNYWMgJiYgKGUgYXMgYW55KS5tZXRhS2V5KSB8fFxuICAgIC8vIGBjdHJsS2V5YCBpcyBhbiBvbGQgRE9NIEFQSS5cbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tYW55XG4gICAgKCFpc01hYyAmJiAoZSBhcyBhbnkpLmN0cmxLZXkpIHx8XG4gICAgaXNNaWRkbGVDbGljayhlKSB8fFxuICAgIC8vIGBzaGlmdEtleWAgaXMgYW4gb2xkIERPTSBBUEkuXG4gICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWFueVxuICAgIChlIGFzIGFueSkuc2hpZnRLZXlcbiAgKTtcbn1cblxuLyoqIFdoZXRoZXIgd2UgYXJlIG9uIFdlYktpdCAoZS5nLiwgQ2hyb21lKS4gKi9cbmV4cG9ydCBjb25zdCBpc1dlYktpdDogYm9vbGVhbiA9XG4gIHR5cGVvZiBuYXZpZ2F0b3IgIT09ICd1bmRlZmluZWQnICYmXG4gICEvT3BlcmEvLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCkgJiZcbiAgL1dlYktpdC8udGVzdChuYXZpZ2F0b3IudXNlckFnZW50KTtcblxuLyoqIFdoZXRoZXIgd2UgYXJlIG9uIElFLiAqL1xuZXhwb3J0IGNvbnN0IGlzSWU6IGJvb2xlYW4gPVxuICB0eXBlb2YgbmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJyAmJlxuICAoL01TSUUvLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCkgfHwgL1RyaWRlbnQvLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCkpO1xuXG4vKiogV2hldGhlciB3ZSBhcmUgb24gR2Vja28gKGUuZy4sIEZpcmVmb3gpLiAqL1xuZXhwb3J0IGNvbnN0IGlzR2Vja286IGJvb2xlYW4gPVxuICB0eXBlb2YgbmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJyAmJlxuICAhL09wZXJhfFdlYktpdC8udGVzdChuYXZpZ2F0b3IudXNlckFnZW50KSAmJlxuICAvR2Vja28vLnRlc3QobmF2aWdhdG9yLnByb2R1Y3QpO1xuXG4vKipcbiAqIERldGVybWluZXMgYW5kIHJldHVybnMgd2hldGhlciB0aGUgZ2l2ZW4gZWxlbWVudCBpcyBhIHZhbGlkIHRhcmdldCBmb3JcbiAqIGtleXByZXNzL2tleWRvd24gRE9NIGV2ZW50cyB0aGF0IGFjdCBsaWtlIHJlZ3VsYXIgRE9NIGNsaWNrcy5cbiAqIEBwYXJhbSBlbCBUaGUgZWxlbWVudC5cbiAqIEByZXR1cm4gV2hldGhlciB0aGUgZ2l2ZW4gZWxlbWVudCBpcyBhIHZhbGlkIGFjdGlvbiBrZXkgdGFyZ2V0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNWYWxpZEFjdGlvbktleVRhcmdldChlbDogRWxlbWVudCk6IGJvb2xlYW4ge1xuICBpZiAoISgnZ2V0QXR0cmlidXRlJyBpbiBlbCkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgaWYgKGlzVGV4dENvbnRyb2woZWwpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGlmIChpc05hdGl2ZWx5QWN0aXZhdGFibGUoZWwpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIC8vIGBpc0NvbnRlbnRFZGl0YWJsZWAgaXMgYW4gb2xkIERPTSBBUEkuXG4gIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1hbnlcbiAgaWYgKChlbCBhcyBhbnkpLmlzQ29udGVudEVkaXRhYmxlKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59XG5cbi8qKlxuICogV2hldGhlciBhbiBldmVudCBoYXMgYSBtb2RpZmllciBrZXkgYWN0aXZhdGVkLlxuICogQHBhcmFtIGUgVGhlIGV2ZW50LlxuICogQHJldHVybiBUcnVlLCBpZiBhIG1vZGlmaWVyIGtleSBpcyBhY3RpdmF0ZWQuXG4gKi9cbmZ1bmN0aW9uIGhhc01vZGlmaWVyS2V5KGU6IEV2ZW50KTogYm9vbGVhbiB7XG4gIHJldHVybiAoXG4gICAgLy8gYGN0cmxLZXlgIGlzIGFuIG9sZCBET00gQVBJLlxuICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1hbnlcbiAgICAoZSBhcyBhbnkpLmN0cmxLZXkgfHxcbiAgICAvLyBgc2hpZnRLZXlgIGlzIGFuIG9sZCBET00gQVBJLlxuICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1hbnlcbiAgICAoZSBhcyBhbnkpLnNoaWZ0S2V5IHx8XG4gICAgLy8gYGFsdEtleWAgaXMgYW4gb2xkIERPTSBBUEkuXG4gICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWFueVxuICAgIChlIGFzIGFueSkuYWx0S2V5IHx8XG4gICAgLy8gYG1ldGFLZXlgIGlzIGFuIG9sZCBET00gQVBJLlxuICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1hbnlcbiAgICAoZSBhcyBhbnkpLm1ldGFLZXlcbiAgKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmVzIGFuZCByZXR1cm5zIHdoZXRoZXIgdGhlIGdpdmVuIGV2ZW50IGhhcyBhIHRhcmdldCB0aGF0IGFscmVhZHlcbiAqIGhhcyBldmVudCBoYW5kbGVycyBhdHRhY2hlZCBiZWNhdXNlIGl0IGlzIGEgbmF0aXZlIEhUTUwgY29udHJvbC4gVXNlZCB0b1xuICogZGV0ZXJtaW5lIGlmIHByZXZlbnREZWZhdWx0IHNob3VsZCBiZSBjYWxsZWQgd2hlbiBpc0FjdGlvbktleUV2ZW50IGlzIHRydWUuXG4gKiBAcGFyYW0gZSBUaGUgZXZlbnQuXG4gKiBAcmV0dXJuIElmIHByZXZlbnREZWZhdWx0IHNob3VsZCBiZSBjYWxsZWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzaG91bGRDYWxsUHJldmVudERlZmF1bHRPbk5hdGl2ZUh0bWxDb250cm9sKGU6IEV2ZW50KTogYm9vbGVhbiB7XG4gIGNvbnN0IGVsID0gZ2V0VGFyZ2V0KGUpO1xuICBjb25zdCB0YWdOYW1lID0gZWwudGFnTmFtZS50b1VwcGVyQ2FzZSgpO1xuICBjb25zdCByb2xlID0gKGVsLmdldEF0dHJpYnV0ZSgncm9sZScpIHx8ICcnKS50b1VwcGVyQ2FzZSgpO1xuXG4gIGlmICh0YWdOYW1lID09PSAnQlVUVE9OJyB8fCByb2xlID09PSAnQlVUVE9OJykge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIGlmICghaXNOYXRpdmVIVE1MQ29udHJvbChlbCkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgaWYgKHRhZ05hbWUgPT09ICdBJykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICAvKipcbiAgICogRml4IGZvciBwaHlzaWNhbCBkLXBhZHMgb24gZmVhdHVyZSBwaG9uZSBwbGF0Zm9ybXM7IHRoZSBuYXRpdmUgZXZlbnRcbiAgICogKGllLiBpc1RydXN0ZWQ6IHRydWUpIG5lZWRzIHRvIGZpcmUgdG8gc2hvdyB0aGUgT1BUSU9OIGxpc3QuIFNlZVxuICAgKiBiLzEzNTI4ODQ2OSBmb3IgbW9yZSBpbmZvLlxuICAgKi9cbiAgaWYgKHRhZ05hbWUgPT09ICdTRUxFQ1QnKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGlmIChwcm9jZXNzU3BhY2UoZWwpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGlmIChpc1RleHRDb250cm9sKGVsKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmVzIGFuZCByZXR1cm5zIHdoZXRoZXIgdGhlIGdpdmVuIGV2ZW50IGFjdHMgbGlrZSBhIHJlZ3VsYXIgRE9NIGNsaWNrLFxuICogYW5kIHNob3VsZCBiZSBoYW5kbGVkIGluc3RlYWQgb2YgdGhlIGNsaWNrLiAgSWYgdGhpcyByZXR1cm5zIHRydWUsIHRoZSBjYWxsZXJcbiAqIHdpbGwgY2FsbCBwcmV2ZW50RGVmYXVsdCgpIHRvIHByZXZlbnQgYSBwb3NzaWJsZSBkdXBsaWNhdGUgZXZlbnQuXG4gKiBUaGlzIGlzIHJlcHJlc2VudGVkIGJ5IGEga2V5cHJlc3MgKGtleWRvd24gb24gR2Vja28gYnJvd3NlcnMpIG9uIEVudGVyIG9yXG4gKiBTcGFjZSBrZXkuXG4gKiBAcGFyYW0gZSBUaGUgZXZlbnQuXG4gKiBAcmV0dXJuIFRydWUsIGlmIHRoZSBldmVudCBlbXVsYXRlcyBhIERPTSBjbGljay5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzQWN0aW9uS2V5RXZlbnQoZTogRXZlbnQpOiBib29sZWFuIHtcbiAgbGV0IGtleSA9XG4gICAgLy8gYHdoaWNoYCBpcyBhbiBvbGQgRE9NIEFQSS5cbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tYW55XG4gICAgKGUgYXMgYW55KS53aGljaCB8fFxuICAgIC8vIGBrZXlDb2RlYCBpcyBhbiBvbGQgRE9NIEFQSS5cbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tYW55XG4gICAgKGUgYXMgYW55KS5rZXlDb2RlO1xuICBpZiAoIWtleSAmJiAoZSBhcyBLZXlib2FyZEV2ZW50KS5rZXkpIHtcbiAgICBrZXkgPSBBQ1RJT05fS0VZX1RPX0tFWUNPREVbKGUgYXMgS2V5Ym9hcmRFdmVudCkua2V5XTtcbiAgfVxuICBpZiAoaXNXZWJLaXQgJiYga2V5ID09PSBLZXlDb2RlLk1BQ19FTlRFUikge1xuICAgIGtleSA9IEtleUNvZGUuRU5URVI7XG4gIH1cbiAgaWYgKGtleSAhPT0gS2V5Q29kZS5FTlRFUiAmJiBrZXkgIT09IEtleUNvZGUuU1BBQ0UpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgY29uc3QgZWwgPSBnZXRUYXJnZXQoZSk7XG4gIGlmIChlLnR5cGUgIT09IEV2ZW50VHlwZS5LRVlET1dOIHx8ICFpc1ZhbGlkQWN0aW9uS2V5VGFyZ2V0KGVsKSB8fCBoYXNNb2RpZmllcktleShlKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIEZvciA8aW5wdXQgdHlwZT1cImNoZWNrYm94XCI+LCB3ZSBtdXN0IG9ubHkgaGFuZGxlIHRoZSBicm93c2VyJ3MgbmF0aXZlIGNsaWNrXG4gIC8vIGV2ZW50LCBzbyB0aGF0IHRoZSBicm93c2VyIGNhbiB0b2dnbGUgdGhlIGNoZWNrYm94LlxuICBpZiAocHJvY2Vzc1NwYWNlKGVsKSAmJiBrZXkgPT09IEtleUNvZGUuU1BBQ0UpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBJZiB0aGlzIGVsZW1lbnQgaXMgbm9uLWZvY3VzYWJsZSwgaWdub3JlIHN0cmF5IGtleXN0cm9rZXMgKGIvMTgzMzcyMDkpXG4gIC8vIFNzY3JlZW4gcmVhZGVycyBjYW4gbW92ZSB3aXRob3V0IHRhYiBmb2N1cywgc28gYW55IHRhYkluZGV4IGlzIGZvY3VzYWJsZS5cbiAgLy8gU2VlIEIvMjE4MDk2MDRcbiAgaWYgKCFpc0ZvY3VzYWJsZShlbCkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBjb25zdCB0eXBlID0gKFxuICAgIGVsLmdldEF0dHJpYnV0ZSgncm9sZScpIHx8XG4gICAgKGVsIGFzIEhUTUxJbnB1dEVsZW1lbnQpLnR5cGUgfHxcbiAgICBlbC50YWdOYW1lXG4gICkudG9VcHBlckNhc2UoKTtcbiAgY29uc3QgaXNTcGVjaWZpY1RyaWdnZXJLZXkgPSBJREVOVElGSUVSX1RPX0tFWV9UUklHR0VSX01BUFBJTkdbdHlwZV0gJSBrZXkgPT09IDA7XG4gIGNvbnN0IGlzRGVmYXVsdFRyaWdnZXJLZXkgPSAhKHR5cGUgaW4gSURFTlRJRklFUl9UT19LRVlfVFJJR0dFUl9NQVBQSU5HKSAmJiBrZXkgPT09IEtleUNvZGUuRU5URVI7XG4gIGNvbnN0IGhhc1R5cGUgPSBlbC50YWdOYW1lLnRvVXBwZXJDYXNlKCkgIT09ICdJTlBVVCcgfHwgISEoZWwgYXMgSFRNTElucHV0RWxlbWVudCkudHlwZTtcbiAgcmV0dXJuIChpc1NwZWNpZmljVHJpZ2dlcktleSB8fCBpc0RlZmF1bHRUcmlnZ2VyS2V5KSAmJiBoYXNUeXBlO1xufVxuXG4vKipcbiAqIENoZWNrcyB3aGV0aGVyIGEgRE9NIGVsZW1lbnQgY2FuIHJlY2VpdmUga2V5Ym9hcmQgZm9jdXMuXG4gKiBUaGlzIGNvZGUgaXMgYmFzZWQgb24gZ29vZy5kb20uaXNGb2N1c2FibGUsIGJ1dCBzaW1wbGlmaWVkIHNpbmNlIHdlIHNob3VsZG4ndFxuICogY2FyZSBhYm91dCB2aXNpYmlsaXR5IGlmIHdlJ3JlIGFscmVhZHkgaGFuZGxpbmcgYSBrZXlib2FyZCBldmVudC5cbiAqL1xuZnVuY3Rpb24gaXNGb2N1c2FibGUoZWw6IEVsZW1lbnQpOiBib29sZWFuIHtcbiAgcmV0dXJuIChcbiAgICAoZWwudGFnTmFtZSBpbiBOQVRJVkVMWV9GT0NVU0FCTEVfRUxFTUVOVFMgfHwgaGFzU3BlY2lmaWVkVGFiSW5kZXgoZWwpKSAmJlxuICAgICEoZWwgYXMgSFRNTElucHV0RWxlbWVudCkuZGlzYWJsZWRcbiAgKTtcbn1cblxuLyoqXG4gKiBAcGFyYW0gZWxlbWVudCBFbGVtZW50IHRvIGNoZWNrLlxuICogQHJldHVybiBXaGV0aGVyIHRoZSBlbGVtZW50IGhhcyBhIHNwZWNpZmllZCB0YWIgaW5kZXguXG4gKi9cbmZ1bmN0aW9uIGhhc1NwZWNpZmllZFRhYkluZGV4KGVsZW1lbnQ6IEVsZW1lbnQpOiBib29sZWFuIHtcbiAgLy8gSUUgcmV0dXJucyAwIGZvciBhbiB1bnNldCB0YWJJbmRleCwgc28gd2UgbXVzdCB1c2UgZ2V0QXR0cmlidXRlTm9kZSgpLFxuICAvLyB3aGljaCByZXR1cm5zIGFuIG9iamVjdCB3aXRoIGEgJ3NwZWNpZmllZCcgcHJvcGVydHkgaWYgdGFiSW5kZXggaXNcbiAgLy8gc3BlY2lmaWVkLiAgVGhpcyB3b3JrcyBvbiBvdGhlciBicm93c2VycywgdG9vLlxuICBjb25zdCBhdHRyTm9kZSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlTm9kZSgndGFiaW5kZXgnKTsgLy8gTXVzdCBiZSBsb3dlcmNhc2UhXG4gIHJldHVybiBhdHRyTm9kZSAhPSBudWxsICYmIGF0dHJOb2RlLnNwZWNpZmllZDtcbn1cblxuLyoqIEVsZW1lbnQgdGFnbmFtZXMgdGhhdCBhcmUgZm9jdXNhYmxlIGJ5IGRlZmF1bHQuICovXG5jb25zdCBOQVRJVkVMWV9GT0NVU0FCTEVfRUxFTUVOVFM6IHtba2V5OiBzdHJpbmddOiBudW1iZXJ9ID0ge1xuICAnQSc6IDEsXG4gICdJTlBVVCc6IDEsXG4gICdURVhUQVJFQSc6IDEsXG4gICdTRUxFQ1QnOiAxLFxuICAnQlVUVE9OJzogMSxcbn07XG5cbi8qKiBAcmV0dXJuIFRydWUsIGlmIHRoZSBTcGFjZSBrZXkgd2FzIHByZXNzZWQuICovXG5leHBvcnQgZnVuY3Rpb24gaXNTcGFjZUtleUV2ZW50KGU6IEV2ZW50KTogYm9vbGVhbiB7XG4gIGNvbnN0IGtleSA9XG4gICAgLy8gYHdoaWNoYCBpcyBhbiBvbGQgRE9NIEFQSS5cbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tYW55XG4gICAgKGUgYXMgYW55KS53aGljaCB8fFxuICAgIC8vIGBrZXlDb2RlYCBpcyBhbiBvbGQgRE9NIEFQSS5cbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tYW55XG4gICAgKGUgYXMgYW55KS5rZXlDb2RlO1xuICBjb25zdCBlbCA9IGdldFRhcmdldChlKTtcbiAgY29uc3QgZWxlbWVudE5hbWUgPSAoKGVsIGFzIEhUTUxJbnB1dEVsZW1lbnQpLnR5cGUgfHwgZWwudGFnTmFtZSkudG9VcHBlckNhc2UoKTtcbiAgcmV0dXJuIGtleSA9PT0gS2V5Q29kZS5TUEFDRSAmJiBlbGVtZW50TmFtZSAhPT0gJ0NIRUNLQk9YJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmVzIHdoZXRoZXIgdGhlIGV2ZW50IGNvcnJlc3BvbmRzIHRvIGEgbm9uLWJ1YmJsaW5nIG1vdXNlXG4gKiBldmVudCB0eXBlIChtb3VzZWVudGVyLCBtb3VzZWxlYXZlLCBwb2ludGVyZW50ZXIsIGFuZCBwb2ludGVybGVhdmUpLlxuICpcbiAqIER1cmluZyBtb3VzZW92ZXIgKG1vdXNlZW50ZXIpIGFuZCBwb2ludGVyb3ZlciAocG9pbnRlcmVudGVyKSwgdGhlXG4gKiByZWxhdGVkVGFyZ2V0IGlzIHRoZSBlbGVtZW50IGJlaW5nIGVudGVyZWQgZnJvbS4gRHVyaW5nIG1vdXNlb3V0IChtb3VzZWxlYXZlKVxuICogYW5kIHBvaW50ZXJvdXQgKHBvaW50ZXJsZWF2ZSksIHRoZSByZWxhdGVkVGFyZ2V0IGlzIHRoZSBlbGVtZW50IGJlaW5nIGV4aXRlZFxuICogdG8uXG4gKlxuICogSW4gYm90aCBjYXNlcywgaWYgcmVsYXRlZFRhcmdldCBpcyBvdXRzaWRlIHRhcmdldCwgdGhlbiB0aGUgY29ycmVzcG9uZGluZ1xuICogc3BlY2lhbCBldmVudCBoYXMgb2NjdXJyZWQsIG90aGVyd2lzZSBpdCBoYXNuJ3QuXG4gKlxuICogQHBhcmFtIGUgVGhlIG1vdXNlb3Zlci9tb3VzZW91dCBldmVudC5cbiAqIEBwYXJhbSB0eXBlIFRoZSB0eXBlIG9mIHRoZSBtb3VzZSBzcGVjaWFsIGV2ZW50LlxuICogQHBhcmFtIGVsZW1lbnQgVGhlIGVsZW1lbnQgb24gd2hpY2ggdGhlIGpzYWN0aW9uIGZvciB0aGVcbiAqICAgICBtb3VzZWVudGVyL21vdXNlbGVhdmUgZXZlbnQgaXMgZGVmaW5lZC5cbiAqIEByZXR1cm4gVHJ1ZSBpZiB0aGUgZXZlbnQgaXMgYSBtb3VzZWVudGVyL21vdXNlbGVhdmUgZXZlbnQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc01vdXNlU3BlY2lhbEV2ZW50KGU6IEV2ZW50LCB0eXBlOiBzdHJpbmcsIGVsZW1lbnQ6IEVsZW1lbnQpOiBib29sZWFuIHtcbiAgLy8gYHJlbGF0ZWRUYXJnZXRgIGlzIGFuIG9sZCBET00gQVBJLlxuICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tYW55XG4gIGNvbnN0IHJlbGF0ZWQgPSAoZSBhcyBhbnkpLnJlbGF0ZWRUYXJnZXQgYXMgTm9kZTtcblxuICByZXR1cm4gKFxuICAgICgoZS50eXBlID09PSBFdmVudFR5cGUuTU9VU0VPVkVSICYmIHR5cGUgPT09IEV2ZW50VHlwZS5NT1VTRUVOVEVSKSB8fFxuICAgICAgKGUudHlwZSA9PT0gRXZlbnRUeXBlLk1PVVNFT1VUICYmIHR5cGUgPT09IEV2ZW50VHlwZS5NT1VTRUxFQVZFKSB8fFxuICAgICAgKGUudHlwZSA9PT0gRXZlbnRUeXBlLlBPSU5URVJPVkVSICYmIHR5cGUgPT09IEV2ZW50VHlwZS5QT0lOVEVSRU5URVIpIHx8XG4gICAgICAoZS50eXBlID09PSBFdmVudFR5cGUuUE9JTlRFUk9VVCAmJiB0eXBlID09PSBFdmVudFR5cGUuUE9JTlRFUkxFQVZFKSkgJiZcbiAgICAoIXJlbGF0ZWQgfHwgKHJlbGF0ZWQgIT09IGVsZW1lbnQgJiYgIWVsZW1lbnQuY29udGFpbnMocmVsYXRlZCkpKVxuICApO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgRXZlbnRMaWtlIG9iamVjdCBmb3IgYSBtb3VzZWVudGVyL21vdXNlbGVhdmUgZXZlbnQgdGhhdCdzXG4gKiBkZXJpdmVkIGZyb20gdGhlIG9yaWdpbmFsIGNvcnJlc3BvbmRpbmcgbW91c2VvdmVyL21vdXNlb3V0IGV2ZW50LlxuICogQHBhcmFtIGUgVGhlIGV2ZW50LlxuICogQHBhcmFtIHRhcmdldCBUaGUgZWxlbWVudCBvbiB3aGljaCB0aGUganNhY3Rpb24gZm9yIHRoZSBtb3VzZWVudGVyL21vdXNlbGVhdmVcbiAqICAgICBldmVudCBpcyBkZWZpbmVkLlxuICogQHJldHVybiBBIG1vZGlmaWVkIGV2ZW50LWxpa2Ugb2JqZWN0IGNvcGllZCBmcm9tIHRoZSBldmVudCBvYmplY3QgcGFzc2VkIGludG9cbiAqICAgICB0aGlzIGZ1bmN0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlTW91c2VTcGVjaWFsRXZlbnQoZTogRXZlbnQsIHRhcmdldDogRWxlbWVudCk6IEV2ZW50IHtcbiAgLy8gV2UgaGF2ZSB0byBjcmVhdGUgYSBjb3B5IG9mIHRoZSBldmVudCBvYmplY3QgYmVjYXVzZSB3ZSBuZWVkIHRvIG11dGF0ZVxuICAvLyBpdHMgZmllbGRzLiBXZSBkbyB0aGlzIGZvciB0aGUgc3BlY2lhbCBtb3VzZSBldmVudHMgYmVjYXVzZSB0aGUgZXZlbnRcbiAgLy8gdGFyZ2V0IG5lZWRzIHRvIGJlIHJldGFyZ2V0ZWQgdG8gdGhlIGFjdGlvbiBlbGVtZW50IHJhdGhlciB0aGFuIHRoZSByZWFsXG4gIC8vIGVsZW1lbnQgKHNpbmNlIHdlIGFyZSBzaW11bGF0aW5nIHRoZSBzcGVjaWFsIG1vdXNlIGV2ZW50cyB3aXRoIG1vdXNlb3Zlci9cbiAgLy8gbW91c2VvdXQpLlxuICAvL1xuICAvLyBTaW5jZSB3ZSdyZSBtYWtpbmcgYSBjb3B5IGFueXdheXMsIHdlIG1pZ2h0IGFzIHdlbGwgYXR0ZW1wdCB0byBjb252ZXJ0XG4gIC8vIHRoaXMgZXZlbnQgaW50byBhIHBzZXVkby1yZWFsIG1vdXNlZW50ZXIvbW91c2VsZWF2ZSBldmVudCBieSBhZGp1c3RpbmdcbiAgLy8gaXRzIHR5cGUuXG4gIC8vXG4gIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1hbnlcbiAgY29uc3QgY29weTogey1yZWFkb25seSBbUCBpbiBrZXlvZiBFdmVudF0/OiBFdmVudFtQXX0gPSB7fTtcbiAgZm9yIChjb25zdCBwcm9wZXJ0eSBpbiBlKSB7XG4gICAgaWYgKHByb3BlcnR5ID09PSAnc3JjRWxlbWVudCcgfHwgcHJvcGVydHkgPT09ICd0YXJnZXQnKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgY29uc3Qga2V5ID0gcHJvcGVydHkgYXMga2V5b2YgRXZlbnQ7XG4gICAgLy8gTWFraW5nIGEgY29weSByZXF1aXJlcyBpdGVyYXRpbmcgdGhyb3VnaCBhbGwgcHJvcGVydGllcyBvZiBgRXZlbnRgLlxuICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1kaWN0LWFjY2Vzcy1vbi1zdHJ1Y3QtdHlwZVxuICAgIGNvbnN0IHZhbHVlID0gZVtrZXldO1xuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICAvLyBWYWx1ZSBzaG91bGQgYmUgdGhlIGV4cGVjdGVkIHR5cGUsIGJ1dCB0aGUgdmFsdWUgb2YgYGtleWAgaXMgbm90IGtub3duXG4gICAgLy8gc3RhdGljYWxseS5cbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tYW55XG4gICAgY29weVtrZXldID0gdmFsdWUgYXMgYW55O1xuICB9XG4gIGlmIChlLnR5cGUgPT09IEV2ZW50VHlwZS5NT1VTRU9WRVIpIHtcbiAgICBjb3B5Wyd0eXBlJ10gPSBFdmVudFR5cGUuTU9VU0VFTlRFUjtcbiAgfSBlbHNlIGlmIChlLnR5cGUgPT09IEV2ZW50VHlwZS5NT1VTRU9VVCkge1xuICAgIGNvcHlbJ3R5cGUnXSA9IEV2ZW50VHlwZS5NT1VTRUxFQVZFO1xuICB9IGVsc2UgaWYgKGUudHlwZSA9PT0gRXZlbnRUeXBlLlBPSU5URVJPVkVSKSB7XG4gICAgY29weVsndHlwZSddID0gRXZlbnRUeXBlLlBPSU5URVJFTlRFUjtcbiAgfSBlbHNlIHtcbiAgICBjb3B5Wyd0eXBlJ10gPSBFdmVudFR5cGUuUE9JTlRFUkxFQVZFO1xuICB9XG4gIGNvcHlbJ3RhcmdldCddID0gY29weVsnc3JjRWxlbWVudCddID0gdGFyZ2V0O1xuICBjb3B5WydidWJibGVzJ10gPSBmYWxzZTtcbiAgcmV0dXJuIGNvcHkgYXMgRXZlbnQ7XG59XG5cbi8qKlxuICogUmV0dXJucyB0b3VjaCBkYXRhIGV4dHJhY3RlZCBmcm9tIHRoZSB0b3VjaCBldmVudDogY2xpZW50WCwgY2xpZW50WSwgc2NyZWVuWFxuICogYW5kIHNjcmVlblkuIElmIHRoZSBldmVudCBoYXMgbm8gdG91Y2ggaW5mb3JtYXRpb24gYXQgYWxsLCB0aGUgcmV0dXJuZWRcbiAqIHZhbHVlIGlzIG51bGwuXG4gKlxuICogVGhlIGZpZWxkcyBvZiB0aGlzIE9iamVjdCBhcmUgdW5xdW90ZWQuXG4gKlxuICogQHBhcmFtIGV2ZW50IEEgdG91Y2ggZXZlbnQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRUb3VjaERhdGEoXG4gIGV2ZW50OiBUb3VjaEV2ZW50LFxuKToge2NsaWVudFg6IG51bWJlcjsgY2xpZW50WTogbnVtYmVyOyBzY3JlZW5YOiBudW1iZXI7IHNjcmVlblk6IG51bWJlcn0gfCBudWxsIHtcbiAgY29uc3QgdG91Y2ggPVxuICAgIChldmVudC5jaGFuZ2VkVG91Y2hlcyAmJiBldmVudC5jaGFuZ2VkVG91Y2hlc1swXSkgfHwgKGV2ZW50LnRvdWNoZXMgJiYgZXZlbnQudG91Y2hlc1swXSk7XG4gIGlmICghdG91Y2gpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICByZXR1cm4ge1xuICAgIGNsaWVudFg6IHRvdWNoLmNsaWVudFgsXG4gICAgY2xpZW50WTogdG91Y2guY2xpZW50WSxcbiAgICBzY3JlZW5YOiB0b3VjaC5zY3JlZW5YLFxuICAgIHNjcmVlblk6IHRvdWNoLnNjcmVlblksXG4gIH07XG59XG5cbmRlY2xhcmUgaW50ZXJmYWNlIFN5bnRoZXRpY01vdXNlRXZlbnQgZXh0ZW5kcyBFdmVudCB7XG4gIC8vIFJlZGVjbGFyZWQgZnJvbSBFdmVudCB0byBpbmRpY2F0ZSB0aGF0IGl0IGlzIG5vdCByZWFkb25seS5cbiAgZGVmYXVsdFByZXZlbnRlZDogYm9vbGVhbjtcbiAgb3JpZ2luYWxFdmVudFR5cGU6IHN0cmluZztcbiAgX3Byb3BhZ2F0aW9uU3RvcHBlZD86IGJvb2xlYW47XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBFdmVudExpa2Ugb2JqZWN0IGZvciBhIFwiY2xpY2tcIiBldmVudCB0aGF0J3MgZGVyaXZlZCBmcm9tIHRoZVxuICogb3JpZ2luYWwgY29ycmVzcG9uZGluZyBcInRvdWNoZW5kXCIgZXZlbnQgZm9yIGEgZmFzdC1jbGljayBpbXBsZW1lbnRhdGlvbi5cbiAqXG4gKiBJdCB0YWtlcyBhIHRvdWNoIGV2ZW50LCBhZGRzIGNvbW1vbiBmaWVsZHMgZm91bmQgaW4gYSBjbGljayBldmVudCBhbmRcbiAqIGNoYW5nZXMgdGhlIHR5cGUgdG8gJ2NsaWNrJywgc28gdGhhdCB0aGUgcmVzdWx0aW5nIGV2ZW50IGxvb2tzIG1vcmUgbGlrZVxuICogYSByZWFsIGNsaWNrIGV2ZW50LlxuICpcbiAqIEBwYXJhbSBldmVudCBBIHRvdWNoIGV2ZW50LlxuICogQHJldHVybiBBIG1vZGlmaWVkIGV2ZW50LWxpa2Ugb2JqZWN0IGNvcGllZCBmcm9tIHRoZSBldmVudCBvYmplY3QgcGFzc2VkIGludG9cbiAqICAgICB0aGlzIGZ1bmN0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVjcmVhdGVUb3VjaEV2ZW50QXNDbGljayhldmVudDogVG91Y2hFdmVudCk6IE1vdXNlRXZlbnQge1xuICBjb25zdCBjbGljazogey1yZWFkb25seSBbUCBpbiBrZXlvZiBNb3VzZUV2ZW50XT86IE1vdXNlRXZlbnRbUF19ICYgUGFydGlhbDxTeW50aGV0aWNNb3VzZUV2ZW50PiA9XG4gICAge307XG4gIGNsaWNrWydvcmlnaW5hbEV2ZW50VHlwZSddID0gZXZlbnQudHlwZTtcbiAgY2xpY2tbJ3R5cGUnXSA9IEV2ZW50VHlwZS5DTElDSztcbiAgZm9yIChjb25zdCBwcm9wZXJ0eSBpbiBldmVudCkge1xuICAgIGlmIChwcm9wZXJ0eSA9PT0gJ3R5cGUnIHx8IHByb3BlcnR5ID09PSAnc3JjRWxlbWVudCcpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICBjb25zdCBrZXkgPSBwcm9wZXJ0eSBhcyBrZXlvZiBUb3VjaEV2ZW50O1xuICAgIC8vIE1ha2luZyBhIGNvcHkgcmVxdWlyZXMgaXRlcmF0aW5nIHRocm91Z2ggYWxsIHByb3BlcnRpZXMgb2YgYFRvdWNoRXZlbnRgLlxuICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1kaWN0LWFjY2Vzcy1vbi1zdHJ1Y3QtdHlwZVxuICAgIGNvbnN0IHZhbHVlID0gZXZlbnRba2V5XTtcbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgLy8gVmFsdWUgc2hvdWxkIGJlIHRoZSBleHBlY3RlZCB0eXBlLCBidXQgdGhlIHZhbHVlIG9mIGBrZXlgIGlzIG5vdCBrbm93blxuICAgIC8vIHN0YXRpY2FsbHkuXG4gICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWFueVxuICAgIGNsaWNrW2tleSBhcyBrZXlvZiBNb3VzZUV2ZW50XSA9IHZhbHVlIGFzIGFueTtcbiAgfVxuXG4gIC8vIEVuc3VyZSB0aGF0IHRoZSBldmVudCBoYXMgdGhlIG1vc3QgcmVjZW50IHRpbWVzdGFtcC4gVGhpcyB0aW1lc3RhbXBcbiAgLy8gbWF5IGJlIHVzZWQgaW4gdGhlIGZ1dHVyZSB0byB2YWxpZGF0ZSBvciBjYW5jZWwgc3Vic2VxdWVudCBjbGljayBldmVudHMuXG4gIGNsaWNrWyd0aW1lU3RhbXAnXSA9IERhdGUubm93KCk7XG5cbiAgLy8gRW11bGF0ZSBwcmV2ZW50RGVmYXVsdCBhbmQgc3RvcFByb3BhZ2F0aW9uIGJlaGF2aW9yXG4gIGNsaWNrWydkZWZhdWx0UHJldmVudGVkJ10gPSBmYWxzZTtcbiAgY2xpY2tbJ3ByZXZlbnREZWZhdWx0J10gPSBzeW50aGV0aWNQcmV2ZW50RGVmYXVsdDtcbiAgY2xpY2tbJ19wcm9wYWdhdGlvblN0b3BwZWQnXSA9IGZhbHNlO1xuICBjbGlja1snc3RvcFByb3BhZ2F0aW9uJ10gPSBzeW50aGV0aWNTdG9wUHJvcGFnYXRpb247XG5cbiAgLy8gRW11bGF0ZSBjbGljayBjb29yZGluYXRlcyB1c2luZyB0b3VjaCBpbmZvXG4gIGNvbnN0IHRvdWNoID0gZ2V0VG91Y2hEYXRhKGV2ZW50KTtcbiAgaWYgKHRvdWNoKSB7XG4gICAgY2xpY2tbJ2NsaWVudFgnXSA9IHRvdWNoLmNsaWVudFg7XG4gICAgY2xpY2tbJ2NsaWVudFknXSA9IHRvdWNoLmNsaWVudFk7XG4gICAgY2xpY2tbJ3NjcmVlblgnXSA9IHRvdWNoLnNjcmVlblg7XG4gICAgY2xpY2tbJ3NjcmVlblknXSA9IHRvdWNoLnNjcmVlblk7XG4gIH1cbiAgcmV0dXJuIGNsaWNrIGFzIE1vdXNlRXZlbnQ7XG59XG5cbi8qKlxuICogQW4gaW1wbGVtZW50YXRpb24gb2YgXCJwcmV2ZW50RGVmYXVsdFwiIGZvciBhIHN5bnRoZXNpemVkIGV2ZW50LiBTaW1wbHlcbiAqIHNldHMgXCJkZWZhdWx0UHJldmVudGVkXCIgcHJvcGVydHkgdG8gdHJ1ZS5cbiAqL1xuZnVuY3Rpb24gc3ludGhldGljUHJldmVudERlZmF1bHQodGhpczogRXZlbnQpIHtcbiAgKHRoaXMgYXMgU3ludGhldGljTW91c2VFdmVudCkuZGVmYXVsdFByZXZlbnRlZCA9IHRydWU7XG59XG5cbi8qKlxuICogQW4gaW1wbGVtZW50YXRpb24gb2YgXCJzdG9wUHJvcGFnYXRpb25cIiBmb3IgYSBzeW50aGVzaXplZCBldmVudC4gSXQgc2ltcGx5XG4gKiBzZXRzIGEgc3ludGhldGljIG5vbi1zdGFuZGFyZCBcIl9wcm9wYWdhdGlvblN0b3BwZWRcIiBwcm9wZXJ0eSB0byB0cnVlLlxuICovXG5mdW5jdGlvbiBzeW50aGV0aWNTdG9wUHJvcGFnYXRpb24odGhpczogRXZlbnQpIHtcbiAgKHRoaXMgYXMgU3ludGhldGljTW91c2VFdmVudCkuX3Byb3BhZ2F0aW9uU3RvcHBlZCA9IHRydWU7XG59XG5cbi8qKlxuICogTWFwcGluZyBvZiBLZXlib2FyZEV2ZW50LmtleSB2YWx1ZXMgdG9cbiAqIEtleUNvZGUgdmFsdWVzLlxuICovXG5jb25zdCBBQ1RJT05fS0VZX1RPX0tFWUNPREU6IHtba2V5OiBzdHJpbmddOiBudW1iZXJ9ID0ge1xuICAnRW50ZXInOiBLZXlDb2RlLkVOVEVSLFxuICAnICc6IEtleUNvZGUuU1BBQ0UsXG59O1xuXG4vKipcbiAqIE1hcHBpbmcgb2YgSFRNTCBlbGVtZW50IGlkZW50aWZpZXJzIChBUklBIHJvbGUsIHR5cGUsIG9yIHRhZ05hbWUpIHRvIHRoZVxuICoga2V5cyAoZW50ZXIgYW5kL29yIHNwYWNlKSB0aGF0IHNob3VsZCBhY3RpdmF0ZSB0aGVtLiBBIHZhbHVlIG9mIHplcm8gbWVhbnNcbiAqIHRoYXQgYm90aCBzaG91bGQgYWN0aXZhdGUgdGhlbS5cbiAqL1xuZXhwb3J0IGNvbnN0IElERU5USUZJRVJfVE9fS0VZX1RSSUdHRVJfTUFQUElORzoge1trZXk6IHN0cmluZ106IG51bWJlcn0gPSB7XG4gICdBJzogS2V5Q29kZS5FTlRFUixcbiAgJ0JVVFRPTic6IDAsXG4gICdDSEVDS0JPWCc6IEtleUNvZGUuU1BBQ0UsXG4gICdDT01CT0JPWCc6IEtleUNvZGUuRU5URVIsXG4gICdGSUxFJzogMCxcbiAgJ0dSSURDRUxMJzogS2V5Q29kZS5FTlRFUixcbiAgJ0xJTksnOiBLZXlDb2RlLkVOVEVSLFxuICAnTElTVEJPWCc6IEtleUNvZGUuRU5URVIsXG4gICdNRU5VJzogMCxcbiAgJ01FTlVCQVInOiAwLFxuICAnTUVOVUlURU0nOiAwLFxuICAnTUVOVUlURU1DSEVDS0JPWCc6IDAsXG4gICdNRU5VSVRFTVJBRElPJzogMCxcbiAgJ09QVElPTic6IDAsXG4gICdSQURJTyc6IEtleUNvZGUuU1BBQ0UsXG4gICdSQURJT0dST1VQJzogS2V5Q29kZS5TUEFDRSxcbiAgJ1JFU0VUJzogMCxcbiAgJ1NVQk1JVCc6IDAsXG4gICdTV0lUQ0gnOiBLZXlDb2RlLlNQQUNFLFxuICAnVEFCJzogMCxcbiAgJ1RSRUUnOiBLZXlDb2RlLkVOVEVSLFxuICAnVFJFRUlURU0nOiBLZXlDb2RlLkVOVEVSLFxufTtcblxuLyoqXG4gKiBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRvIHByb2Nlc3Mgc3BhY2UgYmFzZWQgb24gdGhlIHR5cGUgb2YgdGhlIGVsZW1lbnQ7XG4gKiBjaGVja3MgdG8gbWFrZSBzdXJlIHRoYXQgdHlwZSBpcyBub3QgbnVsbC5cbiAqIEBwYXJhbSBlbGVtZW50IFRoZSBlbGVtZW50LlxuICogQHJldHVybiBXaGV0aGVyIG9yIG5vdCB0byBwcm9jZXNzIHNwYWNlIGJhc2VkIG9uIHR5cGUuXG4gKi9cbmZ1bmN0aW9uIHByb2Nlc3NTcGFjZShlbGVtZW50OiBFbGVtZW50KTogYm9vbGVhbiB7XG4gIGNvbnN0IHR5cGUgPSAoZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3R5cGUnKSB8fCBlbGVtZW50LnRhZ05hbWUpLnRvVXBwZXJDYXNlKCk7XG4gIHJldHVybiB0eXBlIGluIFBST0NFU1NfU1BBQ0U7XG59XG5cbi8qKlxuICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgZ2l2ZW4gZWxlbWVudCBpcyBhIHRleHQgY29udHJvbC5cbiAqIEBwYXJhbSBlbCBUaGUgZWxlbWVudC5cbiAqIEByZXR1cm4gV2hldGhlciBvciBub3QgdGhlIGdpdmVuIGVsZW1lbnQgaXMgYSB0ZXh0IGNvbnRyb2wuXG4gKi9cbmZ1bmN0aW9uIGlzVGV4dENvbnRyb2woZWw6IEVsZW1lbnQpOiBib29sZWFuIHtcbiAgY29uc3QgdHlwZSA9IChlbC5nZXRBdHRyaWJ1dGUoJ3R5cGUnKSB8fCBlbC50YWdOYW1lKS50b1VwcGVyQ2FzZSgpO1xuICByZXR1cm4gdHlwZSBpbiBURVhUX0NPTlRST0xTO1xufVxuXG4vKipcbiAqIFJldHVybnMgaWYgdGhlIGdpdmVuIGVsZW1lbnQgaXMgYSBuYXRpdmUgSFRNTCBjb250cm9sLlxuICogQHBhcmFtIGVsIFRoZSBlbGVtZW50LlxuICogQHJldHVybiBJZiB0aGUgZ2l2ZW4gZWxlbWVudCBpcyBhIG5hdGl2ZSBIVE1MIGNvbnRyb2wuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc05hdGl2ZUhUTUxDb250cm9sKGVsOiBFbGVtZW50KTogYm9vbGVhbiB7XG4gIHJldHVybiBlbC50YWdOYW1lLnRvVXBwZXJDYXNlKCkgaW4gTkFUSVZFX0hUTUxfQ09OVFJPTFM7XG59XG5cbi8qKlxuICogUmV0dXJucyBpZiB0aGUgZ2l2ZW4gZWxlbWVudCBpcyBuYXRpdmVseSBhY3RpdmF0YWJsZS4gQnJvd3NlcnMgZW1pdCBjbGlja1xuICogZXZlbnRzIGZvciBuYXRpdmVseSBhY3RpdmF0YWJsZSBlbGVtZW50cywgZXZlbiB3aGVuIGFjdGl2YXRlZCB2aWEga2V5Ym9hcmQuXG4gKiBGb3IgdGhlc2UgZWxlbWVudHMsIHdlIGRvbid0IG5lZWQgdG8gcmFpc2UgYTExeSBjbGljayBldmVudHMuXG4gKiBAcGFyYW0gZWwgVGhlIGVsZW1lbnQuXG4gKiBAcmV0dXJuIElmIHRoZSBnaXZlbiBlbGVtZW50IGlzIGEgbmF0aXZlIEhUTUwgY29udHJvbC5cbiAqL1xuZnVuY3Rpb24gaXNOYXRpdmVseUFjdGl2YXRhYmxlKGVsOiBFbGVtZW50KTogYm9vbGVhbiB7XG4gIHJldHVybiAoXG4gICAgZWwudGFnTmFtZS50b1VwcGVyQ2FzZSgpID09PSAnQlVUVE9OJyB8fFxuICAgICghIShlbCBhcyBIVE1MSW5wdXRFbGVtZW50KS50eXBlICYmIChlbCBhcyBIVE1MSW5wdXRFbGVtZW50KS50eXBlLnRvVXBwZXJDYXNlKCkgPT09ICdGSUxFJylcbiAgKTtcbn1cblxuLyoqXG4gKiBIVE1MIDxpbnB1dD4gdHlwZXMgKG5vdCBBUklBIHJvbGVzKSB3aGljaCB3aWxsIGF1dG8tdHJpZ2dlciBhIGNsaWNrIGV2ZW50IGZvclxuICogdGhlIFNwYWNlIGtleSwgd2l0aCBzaWRlLWVmZmVjdHMuIFdlIHdpbGwgbm90IGNhbGwgcHJldmVudERlZmF1bHQgaWYgc3BhY2UgaXNcbiAqIHByZXNzZWQsIG5vciB3aWxsIHdlIHJhaXNlIGExMXkgY2xpY2sgZXZlbnRzLiAgRm9yIGFsbCBvdGhlciBlbGVtZW50cywgd2UgY2FuXG4gKiBzdXBwcmVzcyB0aGUgZGVmYXVsdCBldmVudCAod2hpY2ggaGFzIG5vIGRlc2lyZWQgc2lkZS1lZmZlY3RzKSBhbmQgaGFuZGxlIHRoZVxuICoga2V5ZG93biBvdXJzZWx2ZXMuXG4gKi9cbmNvbnN0IFBST0NFU1NfU1BBQ0U6IHtba2V5OiBzdHJpbmddOiBib29sZWFufSA9IHtcbiAgJ0NIRUNLQk9YJzogdHJ1ZSxcbiAgJ0ZJTEUnOiB0cnVlLFxuICAnT1BUSU9OJzogdHJ1ZSxcbiAgJ1JBRElPJzogdHJ1ZSxcbn07XG5cbi8qKiBUYWdOYW1lcyBhbmQgSW5wdXQgdHlwZXMgZm9yIHdoaWNoIHRvIG5vdCBwcm9jZXNzIGVudGVyL3NwYWNlIGFzIGNsaWNrLiAqL1xuY29uc3QgVEVYVF9DT05UUk9MUzoge1trZXk6IHN0cmluZ106IGJvb2xlYW59ID0ge1xuICAnQ09MT1InOiB0cnVlLFxuICAnREFURSc6IHRydWUsXG4gICdEQVRFVElNRSc6IHRydWUsXG4gICdEQVRFVElNRS1MT0NBTCc6IHRydWUsXG4gICdFTUFJTCc6IHRydWUsXG4gICdNT05USCc6IHRydWUsXG4gICdOVU1CRVInOiB0cnVlLFxuICAnUEFTU1dPUkQnOiB0cnVlLFxuICAnUkFOR0UnOiB0cnVlLFxuICAnU0VBUkNIJzogdHJ1ZSxcbiAgJ1RFTCc6IHRydWUsXG4gICdURVhUJzogdHJ1ZSxcbiAgJ1RFWFRBUkVBJzogdHJ1ZSxcbiAgJ1RJTUUnOiB0cnVlLFxuICAnVVJMJzogdHJ1ZSxcbiAgJ1dFRUsnOiB0cnVlLFxufTtcblxuLyoqIFRhZ05hbWVzIHRoYXQgYXJlIG5hdGl2ZSBIVE1MIGNvbnRyb2xzLiAqL1xuY29uc3QgTkFUSVZFX0hUTUxfQ09OVFJPTFM6IHtba2V5OiBzdHJpbmddOiBib29sZWFufSA9IHtcbiAgJ0EnOiB0cnVlLFxuICAnQVJFQSc6IHRydWUsXG4gICdCVVRUT04nOiB0cnVlLFxuICAnRElBTE9HJzogdHJ1ZSxcbiAgJ0lNRyc6IHRydWUsXG4gICdJTlBVVCc6IHRydWUsXG4gICdMSU5LJzogdHJ1ZSxcbiAgJ01FTlUnOiB0cnVlLFxuICAnT1BUR1JPVVAnOiB0cnVlLFxuICAnT1BUSU9OJzogdHJ1ZSxcbiAgJ1BST0dSRVNTJzogdHJ1ZSxcbiAgJ1NFTEVDVCc6IHRydWUsXG4gICdURVhUQVJFQSc6IHRydWUsXG59O1xuXG4vKiogRXhwb3J0ZWQgZm9yIHRlc3RpbmcuICovXG5leHBvcnQgY29uc3QgdGVzdGluZyA9IHtcbiAgc2V0SXNNYWModmFsdWU6IGJvb2xlYW4pIHtcbiAgICBpc01hYyA9IHZhbHVlO1xuICB9LFxufTtcbiJdfQ==