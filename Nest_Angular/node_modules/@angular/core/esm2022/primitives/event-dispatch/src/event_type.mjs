/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/*
 * Names of events that are special to jsaction. These are not all
 * event types that are legal to use in either HTML or the addEvent()
 * API, but these are the ones that are treated specially. All other
 * DOM events can be used in either addEvent() or in the value of the
 * jsaction attribute. Beware of browser specific events or events
 * that don't bubble though: If they are not mentioned here, then
 * event contract doesn't work around their peculiarities.
 */
export const EventType = {
    /**
     * Mouse middle click, introduced in Chrome 55 and not yet supported on
     * other browsers.
     */
    AUXCLICK: 'auxclick',
    /**
     * The change event fired by browsers when the `value` attribute of input,
     * select, and textarea elements are changed.
     */
    CHANGE: 'change',
    /**
     * The click event. In addEvent() refers to all click events, in the
     * jsaction attribute it refers to the unmodified click and Enter/Space
     * keypress events.  In the latter case, a jsaction click will be triggered,
     * for accessibility reasons.  See clickmod and clickonly, below.
     */
    CLICK: 'click',
    /**
     * Specifies the jsaction for a modified click event (i.e. a mouse
     * click with the modifier key Cmd/Ctrl pressed). This event isn't
     * separately enabled in addEvent(), because in the DOM, it's just a
     * click event.
     */
    CLICKMOD: 'clickmod',
    /**
     * Specifies the jsaction for a click-only event.  Click-only doesn't take
     * into account the case where an element with focus receives an Enter/Space
     * keypress.  This event isn't separately enabled in addEvent().
     */
    CLICKONLY: 'clickonly',
    /**
     * The dblclick event.
     */
    DBLCLICK: 'dblclick',
    /**
     * Focus doesn't bubble, but you can use it in addEvent() and
     * jsaction anyway. EventContract does the right thing under the
     * hood.
     */
    FOCUS: 'focus',
    /**
     * This event only exists in IE. For addEvent() and jsaction, use
     * focus instead; EventContract does the right thing even though
     * focus doesn't bubble.
     */
    FOCUSIN: 'focusin',
    /**
     * Analog to focus.
     */
    BLUR: 'blur',
    /**
     * Analog to focusin.
     */
    FOCUSOUT: 'focusout',
    /**
     * Submit doesn't bubble, so it cannot be used with event
     * contract. However, the browser helpfully fires a click event on
     * the submit button of a form (even if the form is not submitted by
     * a click on the submit button). So you should handle click on the
     * submit button instead.
     */
    SUBMIT: 'submit',
    /**
     * The keydown event. In addEvent() and non-click jsaction it represents the
     * regular DOM keydown event. It represents click actions in non-Gecko
     * browsers.
     */
    KEYDOWN: 'keydown',
    /**
     * The keypress event. In addEvent() and non-click jsaction it represents the
     * regular DOM keypress event. It represents click actions in Gecko browsers.
     */
    KEYPRESS: 'keypress',
    /**
     * The keyup event. In addEvent() and non-click jsaction it represents the
     * regular DOM keyup event. It represents click actions in non-Gecko
     * browsers.
     */
    KEYUP: 'keyup',
    /**
     * The mouseup event. Can either be used directly or used implicitly to
     * capture mouseup events. In addEvent(), it represents a regular DOM
     * mouseup event.
     */
    MOUSEUP: 'mouseup',
    /**
     * The mousedown event. Can either be used directly or used implicitly to
     * capture mouseenter events. In addEvent(), it represents a regular DOM
     * mouseover event.
     */
    MOUSEDOWN: 'mousedown',
    /**
     * The mouseover event. Can either be used directly or used implicitly to
     * capture mouseenter events. In addEvent(), it represents a regular DOM
     * mouseover event.
     */
    MOUSEOVER: 'mouseover',
    /**
     * The mouseout event. Can either be used directly or used implicitly to
     * capture mouseover events. In addEvent(), it represents a regular DOM
     * mouseout event.
     */
    MOUSEOUT: 'mouseout',
    /**
     * The mouseenter event. Does not bubble and fires individually on each
     * element being entered within a DOM tree.
     */
    MOUSEENTER: 'mouseenter',
    /**
     * The mouseleave event. Does not bubble and fires individually on each
     * element being entered within a DOM tree.
     */
    MOUSELEAVE: 'mouseleave',
    /**
     * The mousemove event.
     */
    MOUSEMOVE: 'mousemove',
    /**
     * The pointerup event. Can either be used directly or used implicitly to
     * capture pointerup events. In addEvent(), it represents a regular DOM
     * pointerup event.
     */
    POINTERUP: 'pointerup',
    /**
     * The pointerdown event. Can either be used directly or used implicitly to
     * capture pointerenter events. In addEvent(), it represents a regular DOM
     * mouseover event.
     */
    POINTERDOWN: 'pointerdown',
    /**
     * The pointerover event. Can either be used directly or used implicitly to
     * capture pointerenter events. In addEvent(), it represents a regular DOM
     * pointerover event.
     */
    POINTEROVER: 'pointerover',
    /**
     * The pointerout event. Can either be used directly or used implicitly to
     * capture pointerover events. In addEvent(), it represents a regular DOM
     * pointerout event.
     */
    POINTEROUT: 'pointerout',
    /**
     * The pointerenter event. Does not bubble and fires individually on each
     * element being entered within a DOM tree.
     */
    POINTERENTER: 'pointerenter',
    /**
     * The pointerleave event. Does not bubble and fires individually on each
     * element being entered within a DOM tree.
     */
    POINTERLEAVE: 'pointerleave',
    /**
     * The pointermove event.
     */
    POINTERMOVE: 'pointermove',
    /**
     * The pointercancel event.
     */
    POINTERCANCEL: 'pointercancel',
    /**
     * The gotpointercapture event is fired when
     * Element.setPointerCapture(pointerId) is called on a mouse input, or
     * implicitly when a touch input begins.
     */
    GOTPOINTERCAPTURE: 'gotpointercapture',
    /**
     * The lostpointercapture event is fired when
     * Element.releasePointerCapture(pointerId) is called, or implicitly after a
     * touch input ends.
     */
    LOSTPOINTERCAPTURE: 'lostpointercapture',
    /**
     * The error event. The error event doesn't bubble, but you can use it in
     * addEvent() and jsaction anyway. EventContract does the right thing under
     * the hood (except in IE8 which does not use error events).
     */
    ERROR: 'error',
    /**
     * The load event. The load event doesn't bubble, but you can use it in
     * addEvent() and jsaction anyway. EventContract does the right thing
     * under the hood.
     */
    LOAD: 'load',
    /**
     * The unload event.
     */
    UNLOAD: 'unload',
    /**
     * The touchstart event. Bubbles, will only ever fire in browsers with
     * touch support.
     */
    TOUCHSTART: 'touchstart',
    /**
     * The touchend event. Bubbles, will only ever fire in browsers with
     * touch support.
     */
    TOUCHEND: 'touchend',
    /**
     * The touchmove event. Bubbles, will only ever fire in browsers with
     * touch support.
     */
    TOUCHMOVE: 'touchmove',
    /**
     * The input event.
     */
    INPUT: 'input',
    /**
     * The scroll event.
     */
    SCROLL: 'scroll',
    /**
     * The toggle event. The toggle event doesn't bubble, but you can use it in
     * addEvent() and jsaction anyway. EventContract does the right thing
     * under the hood.
     */
    TOGGLE: 'toggle',
    /**
     * A custom event. The actual custom event type is declared as the 'type'
     * field in the event details. Supported in Firefox 6+, IE 9+, and all Chrome
     * versions.
     *
     * This is an internal name. Users should use jsaction's fireCustomEvent to
     * fire custom events instead of relying on this type to create them.
     */
    CUSTOM: '_custom',
};
/** All event types that do not bubble or capture and need a polyfill. */
export const MOUSE_SPECIAL_EVENT_TYPES = [
    EventType.MOUSEENTER,
    EventType.MOUSELEAVE,
    'pointerenter',
    'pointerleave',
];
/** All event types that are registered in the bubble phase. */
export const BUBBLE_EVENT_TYPES = [
    EventType.CLICK,
    EventType.DBLCLICK,
    EventType.FOCUSIN,
    EventType.FOCUSOUT,
    EventType.KEYDOWN,
    EventType.KEYUP,
    EventType.KEYPRESS,
    EventType.MOUSEOVER,
    EventType.MOUSEOUT,
    EventType.SUBMIT,
    EventType.TOUCHSTART,
    EventType.TOUCHEND,
    EventType.TOUCHMOVE,
    'touchcancel',
    'auxclick',
    'change',
    'compositionstart',
    'compositionupdate',
    'compositionend',
    'beforeinput',
    'input',
    'select',
    'copy',
    'cut',
    'paste',
    'mousedown',
    'mouseup',
    'wheel',
    'contextmenu',
    'dragover',
    'dragenter',
    'dragleave',
    'drop',
    'dragstart',
    'dragend',
    'pointerdown',
    'pointermove',
    'pointerup',
    'pointercancel',
    'pointerover',
    'pointerout',
    'gotpointercapture',
    'lostpointercapture',
    // Video events.
    'ended',
    'loadedmetadata',
    // Page visibility events.
    'pagehide',
    'pageshow',
    'visibilitychange',
    // Content visibility events.
    'beforematch',
];
/** All event types that are registered in the capture phase. */
export const CAPTURE_EVENT_TYPES = [
    EventType.FOCUS,
    EventType.BLUR,
    EventType.ERROR,
    EventType.LOAD,
    EventType.TOGGLE,
];
/**
 * Whether or not an event type should be registered in the capture phase.
 * @param eventType
 * @returns bool
 */
export const isCaptureEventType = (eventType) => CAPTURE_EVENT_TYPES.indexOf(eventType) >= 0;
/** All event types that are registered early.  */
const EARLY_EVENT_TYPES = BUBBLE_EVENT_TYPES.concat(CAPTURE_EVENT_TYPES);
/**
 * Whether or not an event type is registered in the early contract.
 */
export const isEarlyEventType = (eventType) => EARLY_EVENT_TYPES.indexOf(eventType) >= 0;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnRfdHlwZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvcHJpbWl0aXZlcy9ldmVudC1kaXNwYXRjaC9zcmMvZXZlbnRfdHlwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSDs7Ozs7Ozs7R0FRRztBQUNILE1BQU0sQ0FBQyxNQUFNLFNBQVMsR0FBRztJQUN2Qjs7O09BR0c7SUFDSCxRQUFRLEVBQUUsVUFBVTtJQUVwQjs7O09BR0c7SUFDSCxNQUFNLEVBQUUsUUFBUTtJQUVoQjs7Ozs7T0FLRztJQUNILEtBQUssRUFBRSxPQUFPO0lBRWQ7Ozs7O09BS0c7SUFDSCxRQUFRLEVBQUUsVUFBVTtJQUVwQjs7OztPQUlHO0lBQ0gsU0FBUyxFQUFFLFdBQVc7SUFFdEI7O09BRUc7SUFDSCxRQUFRLEVBQUUsVUFBVTtJQUVwQjs7OztPQUlHO0lBQ0gsS0FBSyxFQUFFLE9BQU87SUFFZDs7OztPQUlHO0lBQ0gsT0FBTyxFQUFFLFNBQVM7SUFFbEI7O09BRUc7SUFDSCxJQUFJLEVBQUUsTUFBTTtJQUVaOztPQUVHO0lBQ0gsUUFBUSxFQUFFLFVBQVU7SUFFcEI7Ozs7OztPQU1HO0lBQ0gsTUFBTSxFQUFFLFFBQVE7SUFFaEI7Ozs7T0FJRztJQUNILE9BQU8sRUFBRSxTQUFTO0lBRWxCOzs7T0FHRztJQUNILFFBQVEsRUFBRSxVQUFVO0lBRXBCOzs7O09BSUc7SUFDSCxLQUFLLEVBQUUsT0FBTztJQUVkOzs7O09BSUc7SUFDSCxPQUFPLEVBQUUsU0FBUztJQUVsQjs7OztPQUlHO0lBQ0gsU0FBUyxFQUFFLFdBQVc7SUFFdEI7Ozs7T0FJRztJQUNILFNBQVMsRUFBRSxXQUFXO0lBRXRCOzs7O09BSUc7SUFDSCxRQUFRLEVBQUUsVUFBVTtJQUVwQjs7O09BR0c7SUFDSCxVQUFVLEVBQUUsWUFBWTtJQUV4Qjs7O09BR0c7SUFDSCxVQUFVLEVBQUUsWUFB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LEVBQUUsQ0FDdEQsbUJBQW1CLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUU5QyxrREFBa0Q7QUFDbEQsTUFBTSxpQkFBaUIsR0FBRyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsbUJBQW1CLENBQUMsQ0FBQztBQUV6RTs7R0FFRztBQUNILE1BQU0sQ0FBQyxNQUFNLGdCQUFnQixHQUFHLENBQUMsU0FBaUIsRUFBRSxFQUFFLENBQUMsaUJBQWlCLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuLypcbiAqIE5hbWVzIG9mIGV2ZW50cyB0aGF0IGFyZSBzcGVjaWFsIHRvIGpzYWN0aW9uLiBUaGVzZSBhcmUgbm90IGFsbFxuICogZXZlbnQgdHlwZXMgdGhhdCBhcmUgbGVnYWwgdG8gdXNlIGluIGVpdGhlciBIVE1MIG9yIHRoZSBhZGRFdmVudCgpXG4gKiBBUEksIGJ1dCB0aGVzZSBhcmUgdGhlIG9uZXMgdGhhdCBhcmUgdHJlYXRlZCBzcGVjaWFsbHkuIEFsbCBvdGhlclxuICogRE9NIGV2ZW50cyBjYW4gYmUgdXNlZCBpbiBlaXRoZXIgYWRkRXZlbnQoKSBvciBpbiB0aGUgdmFsdWUgb2YgdGhlXG4gKiBqc2FjdGlvbiBhdHRyaWJ1dGUuIEJld2FyZSBvZiBicm93c2VyIHNwZWNpZmljIGV2ZW50cyBvciBldmVudHNcbiAqIHRoYXQgZG9uJ3QgYnViYmxlIHRob3VnaDogSWYgdGhleSBhcmUgbm90IG1lbnRpb25lZCBoZXJlLCB0aGVuXG4gKiBldmVudCBjb250cmFjdCBkb2Vzbid0IHdvcmsgYXJvdW5kIHRoZWlyIHBlY3VsaWFyaXRpZXMuXG4gKi9cbmV4cG9ydCBjb25zdCBFdmVudFR5cGUgPSB7XG4gIC8qKlxuICAgKiBNb3VzZSBtaWRkbGUgY2xpY2ssIGludHJvZHVjZWQgaW4gQ2hyb21lIDU1IGFuZCBub3QgeWV0IHN1cHBvcnRlZCBvblxuICAgKiBvdGhlciBicm93c2Vycy5cbiAgICovXG4gIEFVWENMSUNLOiAnYXV4Y2xpY2snLFxuXG4gIC8qKlxuICAgKiBUaGUgY2hhbmdlIGV2ZW50IGZpcmVkIGJ5IGJyb3dzZXJzIHdoZW4gdGhlIGB2YWx1ZWAgYXR0cmlidXRlIG9mIGlucHV0LFxuICAgKiBzZWxlY3QsIGFuZCB0ZXh0YXJlYSBlbGVtZW50cyBhcmUgY2hhbmdlZC5cbiAgICovXG4gIENIQU5HRTogJ2NoYW5nZScsXG5cbiAgLyoqXG4gICAqIFRoZSBjbGljayBldmVudC4gSW4gYWRkRXZlbnQoKSByZWZlcnMgdG8gYWxsIGNsaWNrIGV2ZW50cywgaW4gdGhlXG4gICAqIGpzYWN0aW9uIGF0dHJpYnV0ZSBpdCByZWZlcnMgdG8gdGhlIHVubW9kaWZpZWQgY2xpY2sgYW5kIEVudGVyL1NwYWNlXG4gICAqIGtleXByZXNzIGV2ZW50cy4gIEluIHRoZSBsYXR0ZXIgY2FzZSwgYSBqc2FjdGlvbiBjbGljayB3aWxsIGJlIHRyaWdnZXJlZCxcbiAgICogZm9yIGFjY2Vzc2liaWxpdHkgcmVhc29ucy4gIFNlZSBjbGlja21vZCBhbmQgY2xpY2tvbmx5LCBiZWxvdy5cbiAgICovXG4gIENMSUNLOiAnY2xpY2snLFxuXG4gIC8qKlxuICAgKiBTcGVjaWZpZXMgdGhlIGpzYWN0aW9uIGZvciBhIG1vZGlmaWVkIGNsaWNrIGV2ZW50IChpLmUuIGEgbW91c2VcbiAgICogY2xpY2sgd2l0aCB0aGUgbW9kaWZpZXIga2V5IENtZC9DdHJsIHByZXNzZWQpLiBUaGlzIGV2ZW50IGlzbid0XG4gICAqIHNlcGFyYXRlbHkgZW5hYmxlZCBpbiBhZGRFdmVudCgpLCBiZWNhdXNlIGluIHRoZSBET00sIGl0J3MganVzdCBhXG4gICAqIGNsaWNrIGV2ZW50LlxuICAgKi9cbiAgQ0xJQ0tNT0Q6ICdjbGlja21vZCcsXG5cbiAgLyoqXG4gICAqIFNwZWNpZmllcyB0aGUganNhY3Rpb24gZm9yIGEgY2xpY2stb25seSBldmVudC4gIENsaWNrLW9ubHkgZG9lc24ndCB0YWtlXG4gICAqIGludG8gYWNjb3VudCB0aGUgY2FzZSB3aGVyZSBhbiBlbGVtZW50IHdpdGggZm9jdXMgcmVjZWl2ZXMgYW4gRW50ZXIvU3BhY2VcbiAgICoga2V5cHJlc3MuICBUaGlzIGV2ZW50IGlzbid0IHNlcGFyYXRlbHkgZW5hYmxlZCBpbiBhZGRFdmVudCgpLlxuICAgKi9cbiAgQ0xJQ0tPTkxZOiAnY2xpY2tvbmx5JyxcblxuICAvKipcbiAgICogVGhlIGRibGNsaWNrIGV2ZW50LlxuICAgKi9cbiAgREJMQ0xJQ0s6ICdkYmxjbGljaycsXG5cbiAgLyoqXG4gICAqIEZvY3VzIGRvZXNuJ3QgYnViYmxlLCBidXQgeW91IGNhbiB1c2UgaXQgaW4gYWRkRXZlbnQoKSBhbmRcbiAgICoganNhY3Rpb24gYW55d2F5LiBFdmVudENvbnRyYWN0IGRvZXMgdGhlIHJpZ2h0IHRoaW5nIHVuZGVyIHRoZVxuICAgKiBob29kLlxuICAgKi9cbiAgRk9DVVM6ICdmb2N1cycsXG5cbiAgLyoqXG4gICAqIFRoaXMgZXZlbnQgb25seSBleGlzdHMgaW4gSUUuIEZvciBhZGRFdmVudCgpIGFuZCBqc2FjdGlvbiwgdXNlXG4gICAqIGZvY3VzIGluc3RlYWQ7IEV2ZW50Q29udHJhY3QgZG9lcyB0aGUgcmlnaHQgdGhpbmcgZXZlbiB0aG91Z2hcbiAgICogZm9jdXMgZG9lc24ndCBidWJibGUuXG4gICAqL1xuICBGT0NVU0lOOiAnZm9jdXNpbicsXG5cbiAgLyoqXG4gICAqIEFuYWxvZyB0byBmb2N1cy5cbiAgICovXG4gIEJMVVI6ICdibHVyJyxcblxuICAvKipcbiAgICogQW5hbG9nIHRvIGZvY3VzaW4uXG4gICAqL1xuICBGT0NVU09VVDogJ2ZvY3Vzb3V0JyxcblxuICAvKipcbiAgICogU3VibWl0IGRvZXNuJ3QgYnViYmxlLCBzbyBpdCBjYW5ub3QgYmUgdXNlZCB3aXRoIGV2ZW50XG4gICAqIGNvbnRyYWN0LiBIb3dldmVyLCB0aGUgYnJvd3NlciBoZWxwZnVsbHkgZmlyZXMgYSBjbGljayBldmVudCBvblxuICAgKiB0aGUgc3VibWl0IGJ1dHRvbiBvZiBhIGZvcm0gKGV2ZW4gaWYgdGhlIGZvcm0gaXMgbm90IHN1Ym1pdHRlZCBieVxuICAgKiBhIGNsaWNrIG9uIHRoZSBzdWJtaXQgYnV0dG9uKS4gU28geW91IHNob3VsZCBoYW5kbGUgY2xpY2sgb24gdGhlXG4gICAqIHN1Ym1pdCBidXR0b24gaW5zdGVhZC5cbiAgICovXG4gIFNVQk1JVDogJ3N1Ym1pdCcsXG5cbiAgLyoqXG4gICAqIFRoZSBrZXlkb3duIGV2ZW50LiBJbiBhZGRFdmVudCgpIGFuZCBub24tY2xpY2sganNhY3Rpb24gaXQgcmVwcmVzZW50cyB0aGVcbiAgICogcmVndWxhciBET00ga2V5ZG93biBldmVudC4gSXQgcmVwcmVzZW50cyBjbGljayBhY3Rpb25zIGluIG5vbi1HZWNrb1xuICAgKiBicm93c2Vycy5cbiAgICovXG4gIEtFWURPV046ICdrZXlkb3duJyxcblxuICAvKipcbiAgICogVGhlIGtleXByZXNzIGV2ZW50LiBJbiBhZGRFdmVudCgpIGFuZCBub24tY2xpY2sganNhY3Rpb24gaXQgcmVwcmVzZW50cyB0aGVcbiAgICogcmVndWxhciBET00ga2V5cHJlc3MgZXZlbnQuIEl0IHJlcHJlc2VudHMgY2xpY2sgYWN0aW9ucyBpbiBHZWNrbyBicm93c2Vycy5cbiAgICovXG4gIEtFWVBSRVNTOiAna2V5cHJlc3MnLFxuXG4gIC8qKlxuICAgKiBUaGUga2V5dXAgZXZlbnQuIEluIGFkZEV2ZW50KCkgYW5kIG5vbi1jbGljayBqc2FjdGlvbiBpdCByZXByZXNlbnRzIHRoZVxuICAgKiByZWd1bGFyIERPTSBrZXl1cCBldmVudC4gSXQgcmVwcmVzZW50cyBjbGljayBhY3Rpb25zIGluIG5vbi1HZWNrb1xuICAgKiBicm93c2Vycy5cbiAgICovXG4gIEtFWVVQOiAna2V5dXAnLFxuXG4gIC8qKlxuICAgKiBUaGUgbW91c2V1cCBldmVudC4gQ2FuIGVpdGhlciBiZSB1c2VkIGRpcmVjdGx5IG9yIHVzZWQgaW1wbGljaXRseSB0b1xuICAgKiBjYXB0dXJlIG1vdXNldXAgZXZlbnRzLiBJbiBhZGRFdmVudCgpLCBpdCByZXByZXNlbnRzIGEgcmVndWxhciBET01cbiAgICogbW91c2V1cCBldmVudC5cbiAgICovXG4gIE1PVVNFVVA6ICdtb3VzZXVwJyxcblxuICAvKipcbiAgICogVGhlIG1vdXNlZG93biBldmVudC4gQ2FuIGVpdGhlciBiZSB1c2VkIGRpcmVjdGx5IG9yIHVzZWQgaW1wbGljaXRseSB0b1xuICAgKiBjYXB0dXJlIG1vdXNlZW50ZXIgZXZlbnRzLiBJbiBhZGRFdmVudCgpLCBpdCByZXByZXNlbnRzIGEgcmVndWxhciBET01cbiAgICogbW91c2VvdmVyIGV2ZW50LlxuICAgKi9cbiAgTU9VU0VET1dOOiAnbW91c2Vkb3duJyxcblxuICAvKipcbiAgICogVGhlIG1vdXNlb3ZlciBldmVudC4gQ2FuIGVpdGhlciBiZSB1c2VkIGRpcmVjdGx5IG9yIHVzZWQgaW1wbGljaXRseSB0b1xuICAgKiBjYXB0dXJlIG1vdXNlZW50ZXIgZXZlbnRzLiBJbiBhZGRFdmVudCgpLCBpdCByZXByZXNlbnRzIGEgcmVndWxhciBET01cbiAgICogbW91c2VvdmVyIGV2ZW50LlxuICAgKi9cbiAgTU9VU0VPVkVSOiAnbW91c2VvdmVyJyxcblxuICAvKipcbiAgICogVGhlIG1vdXNlb3V0IGV2ZW50LiBDYW4gZWl0aGVyIGJlIHVzZWQgZGlyZWN0bHkgb3IgdXNlZCBpbXBsaWNpdGx5IHRvXG4gICAqIGNhcHR1cmUgbW91c2VvdmVyIGV2ZW50cy4gSW4gYWRkRXZlbnQoKSwgaXQgcmVwcmVzZW50cyBhIHJlZ3VsYXIgRE9NXG4gICAqIG1vdXNlb3V0IGV2ZW50LlxuICAgKi9cbiAgTU9VU0VPVVQ6ICdtb3VzZW91dCcsXG5cbiAgLyoqXG4gICAqIFRoZSBtb3VzZWVudGVyIGV2ZW50LiBEb2VzIG5vdCBidWJibGUgYW5kIGZpcmVzIGluZGl2aWR1YWxseSBvbiBlYWNoXG4gICAqIGVsZW1lbnQgYmVpbmcgZW50ZXJlZCB3aXRoaW4gYSBET00gdHJlZS5cbiAgICovXG4gIE1PVVNFRU5URVI6ICdtb3VzZWVudGVyJyxcblxuICAvKipcbiAgICogVGhlIG1vdXNlbGVhdmUgZXZlbnQuIERvZXMgbm90IGJ1YmJsZSBhbmQgZmlyZXMgaW5kaXZpZHVhbGx5IG9uIGVhY2hcbiAgICogZWxlbWVudCBiZWluZyBlbnRlcmVkIHdpdGhpbiBhIERPTSB0cmVlLlxuICAgKi9cbiAgTU9VU0VMRUFWRTogJ21vdXNlbGVhdmUnLFxuXG4gIC8qKlxuICAgKiBUaGUgbW91c2Vtb3ZlIGV2ZW50LlxuICAgKi9cbiAgTU9VU0VNT1ZFOiAnbW91c2Vtb3ZlJyxcblxuICAvKipcbiAgICogVGhlIHBvaW50ZXJ1cCBldmVudC4gQ2FuIGVpdGhlciBiZSB1c2VkIGRpcmVjdGx5IG9yIHVzZWQgaW1wbGljaXRseSB0b1xuICAgKiBjYXB0dXJlIHBvaW50ZXJ1cCBldmVudHMuIEluIGFkZEV2ZW50KCksIGl0IHJlcHJlc2VudHMgYSByZWd1bGFyIERPTVxuICAgKiBwb2ludGVydXAgZXZlbnQuXG4gICAqL1xuICBQT0lOVEVSVVA6ICdwb2ludGVydXAnLFxuXG4gIC8qKlxuICAgKiBUaGUgcG9pbnRlcmRvd24gZXZlbnQuIENhbiBlaXRoZXIgYmUgdXNlZCBkaXJlY3RseSBvciB1c2VkIGltcGxpY2l0bHkgdG9cbiAgICogY2FwdHVyZSBwb2ludGVyZW50ZXIgZXZlbnRzLiBJbiBhZGRFdmVudCgpLCBpdCByZXByZXNlbnRzIGEgcmVndWxhciBET01cbiAgICogbW91c2VvdmVyIGV2ZW50LlxuICAgKi9cbiAgUE9JTlRFUkRPV046ICdwb2ludGVyZG93bicsXG5cbiAgLyoqXG4gICAqIFRoZSBwb2ludGVyb3ZlciBldmVudC4gQ2FuIGVpdGhlciBiZSB1c2VkIGRpcmVjdGx5IG9yIHVzZWQgaW1wbGljaXRseSB0b1xuICAgKiBjYXB0dXJlIHBvaW50ZXJlbnRlciBldmVudHMuIEluIGFkZEV2ZW50KCksIGl0IHJlcHJlc2VudHMgYSByZWd1bGFyIERPTVxuICAgKiBwb2ludGVyb3ZlciBldmVudC5cbiAgICovXG4gIFBPSU5URVJPVkVSOiAncG9pbnRlcm92ZXInLFxuXG4gIC8qKlxuICAgKiBUaGUgcG9pbnRlcm91dCBldmVudC4gQ2FuIGVpdGhlciBiZSB1c2VkIGRpcmVjdGx5IG9yIHVzZWQgaW1wbGljaXRseSB0b1xuICAgKiBjYXB0dXJlIHBvaW50ZXJvdmVyIGV2ZW50cy4gSW4gYWRkRXZlbnQoKSwgaXQgcmVwcmVzZW50cyBhIHJlZ3VsYXIgRE9NXG4gICAqIHBvaW50ZXJvdXQgZXZlbnQuXG4gICAqL1xuICBQT0lOVEVST1VUOiAncG9pbnRlcm91dCcsXG5cbiAgLyoqXG4gICAqIFRoZSBwb2ludGVyZW50ZXIgZXZlbnQuIERvZXMgbm90IGJ1YmJsZSBhbmQgZmlyZXMgaW5kaXZpZHVhbGx5IG9uIGVhY2hcbiAgICogZWxlbWVudCBiZWluZyBlbnRlcmVkIHdpdGhpbiBhIERPTSB0cmVlLlxuICAgKi9cbiAgUE9JTlRFUkVOVEVSOiAncG9pbnRlcmVudGVyJyxcblxuICAvKipcbiAgICogVGhlIHBvaW50ZXJsZWF2ZSBldmVudC4gRG9lcyBub3QgYnViYmxlIGFuZCBmaXJlcyBpbmRpdmlkdWFsbHkgb24gZWFjaFxuICAgKiBlbGVtZW50IGJlaW5nIGVudGVyZWQgd2l0aGluIGEgRE9NIHRyZWUuXG4gICAqL1xuICBQT0lOVEVSTEVBVkU6ICdwb2ludGVybGVhdmUnLFxuXG4gIC8qKlxuICAgKiBUaGUgcG9pbnRlcm1vdmUgZXZlbnQuXG4gICAqL1xuICBQT0lOVEVSTU9WRTogJ3BvaW50ZXJtb3ZlJyxcblxuICAvKipcbiAgICogVGhlIHBvaW50ZXJjYW5jZWwgZXZlbnQuXG4gICAqL1xuICBQT0lOVEVSQ0FOQ0VMOiAncG9pbnRlcmNhbmNlbCcsXG5cbiAgLyoqXG4gICAqIFRoZSBnb3Rwb2ludGVyY2FwdHVyZSBldmVudCBpcyBmaXJlZCB3aGVuXG4gICAqIEVsZW1lbnQuc2V0UG9pbnRlckNhcHR1cmUocG9pbnRlcklkKSBpcyBjYWxsZWQgb24gYSBtb3VzZSBpbnB1dCwgb3JcbiAgICogaW1wbGljaXRseSB3aGVuIGEgdG91Y2ggaW5wdXQgYmVnaW5zLlxuICAgKi9cbiAgR09UUE9JTlRFUkNBUFRVUkU6ICdnb3Rwb2ludGVyY2FwdHVyZScsXG5cbiAgLyoqXG4gICAqIFRoZSBsb3N0cG9pbnRlcmNhcHR1cmUgZXZlbnQgaXMgZmlyZWQgd2hlblxuICAgKiBFbGVtZW50LnJlbGVhc2VQb2ludGVyQ2FwdHVyZShwb2ludGVySWQpIGlzIGNhbGxlZCwgb3IgaW1wbGljaXRseSBhZnRlciBhXG4gICAqIHRvdWNoIGlucHV0IGVuZHMuXG4gICAqL1xuICBMT1NUUE9JTlRFUkNBUFRVUkU6ICdsb3N0cG9pbnRlcmNhcHR1cmUnLFxuXG4gIC8qKlxuICAgKiBUaGUgZXJyb3IgZXZlbnQuIFRoZSBlcnJvciBldmVudCBkb2Vzbid0IGJ1YmJsZSwgYnV0IHlvdSBjYW4gdXNlIGl0IGluXG4gICAqIGFkZEV2ZW50KCkgYW5kIGpzYWN0aW9uIGFueXdheS4gRXZlbnRDb250cmFjdCBkb2VzIHRoZSByaWdodCB0aGluZyB1bmRlclxuICAgKiB0aGUgaG9vZCAoZXhjZXB0IGluIElFOCB3aGljaCBkb2VzIG5vdCB1c2UgZXJyb3IgZXZlbnRzKS5cbiAgICovXG4gIEVSUk9SOiAnZXJyb3InLFxuXG4gIC8qKlxuICAgKiBUaGUgbG9hZCBldmVudC4gVGhlIGxvYWQgZXZlbnQgZG9lc24ndCBidWJibGUsIGJ1dCB5b3UgY2FuIHVzZSBpdCBpblxuICAgKiBhZGRFdmVudCgpIGFuZCBqc2FjdGlvbiBhbnl3YXkuIEV2ZW50Q29udHJhY3QgZG9lcyB0aGUgcmlnaHQgdGhpbmdcbiAgICogdW5kZXIgdGhlIGhvb2QuXG4gICAqL1xuICBMT0FEOiAnbG9hZCcsXG5cbiAgLyoqXG4gICAqIFRoZSB1bmxvYWQgZXZlbnQuXG4gICAqL1xuICBVTkxPQUQ6ICd1bmxvYWQnLFxuXG4gIC8qKlxuICAgKiBUaGUgdG91Y2hzdGFydCBldmVudC4gQnViYmxlcywgd2lsbCBvbmx5IGV2ZXIgZmlyZSBpbiBicm93c2VycyB3aXRoXG4gICAqIHRvdWNoIHN1cHBvcnQuXG4gICAqL1xuICBUT1VDSFNUQVJUOiAndG91Y2hzdGFydCcsXG5cbiAgLyoqXG4gICAqIFRoZSB0b3VjaGVuZCBldmVudC4gQnViYmxlcywgd2lsbCBvbmx5IGV2ZXIgZmlyZSBpbiBicm93c2VycyB3aXRoXG4gICAqIHRvdWNoIHN1cHBvcnQuXG4gICAqL1xuICBUT1VDSEVORDogJ3RvdWNoZW5kJyxcblxuICAvKipcbiAgICogVGhlIHRvdWNobW92ZSBldmVudC4gQnViYmxlcywgd2lsbCBvbmx5IGV2ZXIgZmlyZSBpbiBicm93c2VycyB3aXRoXG4gICAqIHRvdWNoIHN1cHBvcnQuXG4gICAqL1xuICBUT1VDSE1PVkU6ICd0b3VjaG1vdmUnLFxuXG4gIC8qKlxuICAgKiBUaGUgaW5wdXQgZXZlbnQuXG4gICAqL1xuICBJTlBVVDogJ2lucHV0JyxcblxuICAvKipcbiAgICogVGhlIHNjcm9sbCBldmVudC5cbiAgICovXG4gIFNDUk9MTDogJ3Njcm9sbCcsXG5cbiAgLyoqXG4gICAqIFRoZSB0b2dnbGUgZXZlbnQuIFRoZSB0b2dnbGUgZXZlbnQgZG9lc24ndCBidWJibGUsIGJ1dCB5b3UgY2FuIHVzZSBpdCBpblxuICAgKiBhZGRFdmVudCgpIGFuZCBqc2FjdGlvbiBhbnl3YXkuIEV2ZW50Q29udHJhY3QgZG9lcyB0aGUgcmlnaHQgdGhpbmdcbiAgICogdW5kZXIgdGhlIGhvb2QuXG4gICAqL1xuICBUT0dHTEU6ICd0b2dnbGUnLFxuXG4gIC8qKlxuICAgKiBBIGN1c3RvbSBldmVudC4gVGhlIGFjdHVhbCBjdXN0b20gZXZlbnQgdHlwZSBpcyBkZWNsYXJlZCBhcyB0aGUgJ3R5cGUnXG4gICAqIGZpZWxkIGluIHRoZSBldmVudCBkZXRhaWxzLiBTdXBwb3J0ZWQgaW4gRmlyZWZveCA2KywgSUUgOSssIGFuZCBhbGwgQ2hyb21lXG4gICAqIHZlcnNpb25zLlxuICAgKlxuICAgKiBUaGlzIGlzIGFuIGludGVybmFsIG5hbWUuIFVzZXJzIHNob3VsZCB1c2UganNhY3Rpb24ncyBmaXJlQ3VzdG9tRXZlbnQgdG9cbiAgICogZmlyZSBjdXN0b20gZXZlbnRzIGluc3RlYWQgb2YgcmVseWluZyBvbiB0aGlzIHR5cGUgdG8gY3JlYXRlIHRoZW0uXG4gICAqL1xuICBDVVNUT006ICdfY3VzdG9tJyxcbn07XG5cbi8qKiBBbGwgZXZlbnQgdHlwZXMgdGhhdCBkbyBub3QgYnViYmxlIG9yIGNhcHR1cmUgYW5kIG5lZWQgYSBwb2x5ZmlsbC4gKi9cbmV4cG9ydCBjb25zdCBNT1VTRV9TUEVDSUFMX0VWRU5UX1RZUEVTID0gW1xuICBFdmVudFR5cGUuTU9VU0VFTlRFUixcbiAgRXZlbnRUeXBlLk1PVVNFTEVBVkUsXG4gICdwb2ludGVyZW50ZXInLFxuICAncG9pbnRlcmxlYXZlJyxcbl07XG5cbi8qKiBBbGwgZXZlbnQgdHlwZXMgdGhhdCBhcmUgcmVnaXN0ZXJlZCBpbiB0aGUgYnViYmxlIHBoYXNlLiAqL1xuZXhwb3J0IGNvbnN0IEJVQkJMRV9FVkVOVF9UWVBFUyA9IFtcbiAgRXZlbnRUeXBlLkNMSUNLLFxuICBFdmVudFR5cGUuREJMQ0xJQ0ssXG4gIEV2ZW50VHlwZS5GT0NVU0lOLFxuICBFdmVudFR5cGUuRk9DVVNPVVQsXG4gIEV2ZW50VHlwZS5LRVlET1dOLFxuICBFdmVudFR5cGUuS0VZVVAsXG4gIEV2ZW50VHlwZS5LRVlQUkVTUyxcbiAgRXZlbnRUeXBlLk1PVVNFT1ZFUixcbiAgRXZlbnRUeXBlLk1PVVNFT1VULFxuICBFdmVudFR5cGUuU1VCTUlULFxuICBFdmVudFR5cGUuVE9VQ0hTVEFSVCxcbiAgRXZlbnRUeXBlLlRPVUNIRU5ELFxuICBFdmVudFR5cGUuVE9VQ0hNT1ZFLFxuICAndG91Y2hjYW5jZWwnLFxuXG4gICdhdXhjbGljaycsXG4gICdjaGFuZ2UnLFxuICAnY29tcG9zaXRpb25zdGFydCcsXG4gICdjb21wb3NpdGlvbnVwZGF0ZScsXG4gICdjb21wb3NpdGlvbmVuZCcsXG4gICdiZWZvcmVpbnB1dCcsXG4gICdpbnB1dCcsXG4gICdzZWxlY3QnLFxuXG4gICdjb3B5JyxcbiAgJ2N1dCcsXG4gICdwYXN0ZScsXG4gICdtb3VzZWRvd24nLFxuICAnbW91c2V1cCcsXG4gICd3aGVlbCcsXG4gICdjb250ZXh0bWVudScsXG5cbiAgJ2RyYWdvdmVyJyxcbiAgJ2RyYWdlbnRlcicsXG4gICdkcmFnbGVhdmUnLFxuICAnZHJvcCcsXG4gICdkcmFnc3RhcnQnLFxuICAnZHJhZ2VuZCcsXG5cbiAgJ3BvaW50ZXJkb3duJyxcbiAgJ3BvaW50ZXJtb3ZlJyxcbiAgJ3BvaW50ZXJ1cCcsXG4gICdwb2ludGVyY2FuY2VsJyxcbiAgJ3BvaW50ZXJvdmVyJyxcbiAgJ3BvaW50ZXJvdXQnLFxuICAnZ290cG9pbnRlcmNhcHR1cmUnLFxuICAnbG9zdHBvaW50ZXJjYXB0dXJlJyxcblxuICAvLyBWaWRlbyBldmVudHMuXG4gICdlbmRlZCcsXG4gICdsb2FkZWRtZXRhZGF0YScsXG5cbiAgLy8gUGFnZSB2aXNpYmlsaXR5IGV2ZW50cy5cbiAgJ3BhZ2VoaWRlJyxcbiAgJ3BhZ2VzaG93JyxcbiAgJ3Zpc2liaWxpdHljaGFuZ2UnLFxuXG4gIC8vIENvbnRlbnQgdmlzaWJpbGl0eSBldmVudHMuXG4gICdiZWZvcmVtYXRjaCcsXG5dO1xuXG4vKiogQWxsIGV2ZW50IHR5cGVzIHRoYXQgYXJlIHJlZ2lzdGVyZWQgaW4gdGhlIGNhcHR1cmUgcGhhc2UuICovXG5leHBvcnQgY29uc3QgQ0FQVFVSRV9FVkVOVF9UWVBFUyA9IFtcbiAgRXZlbnRUeXBlLkZPQ1VTLFxuICBFdmVudFR5cGUuQkxVUixcbiAgRXZlbnRUeXBlLkVSUk9SLFxuICBFdmVudFR5cGUuTE9BRCxcbiAgRXZlbnRUeXBlLlRPR0dMRSxcbl07XG5cbi8qKlxuICogV2hldGhlciBvciBub3QgYW4gZXZlbnQgdHlwZSBzaG91bGQgYmUgcmVnaXN0ZXJlZCBpbiB0aGUgY2FwdHVyZSBwaGFzZS5cbiAqIEBwYXJhbSBldmVudFR5cGVcbiAqIEByZXR1cm5zIGJvb2xcbiAqL1xuZXhwb3J0IGNvbnN0IGlzQ2FwdHVyZUV2ZW50VHlwZSA9IChldmVudFR5cGU6IHN0cmluZykgPT5cbiAgQ0FQVFVSRV9FVkVOVF9UWVBFUy5pbmRleE9mKGV2ZW50VHlwZSkgPj0gMDtcblxuLyoqIEFsbCBldmVudCB0eXBlcyB0aGF0IGFyZSByZWdpc3RlcmVkIGVhcmx5LiAgKi9cbmNvbnN0IEVBUkxZX0VWRU5UX1RZUEVTID0gQlVCQkxFX0VWRU5UX1RZUEVTLmNvbmNhdChDQVBUVVJFX0VWRU5UX1RZUEVTKTtcblxuLyoqXG4gKiBXaGV0aGVyIG9yIG5vdCBhbiBldmVudCB0eXBlIGlzIHJlZ2lzdGVyZWQgaW4gdGhlIGVhcmx5IGNvbnRyYWN0LlxuICovXG5leHBvcnQgY29uc3QgaXNFYXJseUV2ZW50VHlwZSA9IChldmVudFR5cGU6IHN0cmluZykgPT4gRUFSTFlfRVZFTlRfVFlQRVMuaW5kZXhPZihldmVudFR5cGUpID49IDA7XG4iXX0=