/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { DOCUMENT, ɵgetDOM as getDOM } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { EventManagerPlugin } from './event_manager';
import * as i0 from "@angular/core";
/**
 * Defines supported modifiers for key events.
 */
const MODIFIER_KEYS = ['alt', 'control', 'meta', 'shift'];
// The following values are here for cross-browser compatibility and to match the W3C standard
// cf https://www.w3.org/TR/DOM-Level-3-Events-key/
const _keyMap = {
    '\b': 'Backspace',
    '\t': 'Tab',
    '\x7F': 'Delete',
    '\x1B': 'Escape',
    'Del': 'Delete',
    'Esc': 'Escape',
    'Left': 'ArrowLeft',
    'Right': 'ArrowRight',
    'Up': 'ArrowUp',
    'Down': 'ArrowDown',
    'Menu': 'ContextMenu',
    'Scroll': 'ScrollLock',
    'Win': 'OS',
};
/**
 * Retrieves modifiers from key-event objects.
 */
const MODIFIER_KEY_GETTERS = {
    'alt': (event) => event.altKey,
    'control': (event) => event.ctrlKey,
    'meta': (event) => event.metaKey,
    'shift': (event) => event.shiftKey,
};
/**
 * A browser plug-in that provides support for handling of key events in Angular.
 */
export class KeyEventsPlugin extends EventManagerPlugin {
    /**
     * Initializes an instance of the browser plug-in.
     * @param doc The document in which key events will be detected.
     */
    constructor(doc) {
        super(doc);
    }
    /**
     * Reports whether a named key event is supported.
     * @param eventName The event name to query.
     * @return True if the named key event is supported.
     */
    supports(eventName) {
        return KeyEventsPlugin.parseEventName(eventName) != null;
    }
    /**
     * Registers a handler for a specific element and key event.
     * @param element The HTML element to receive event notifications.
     * @param eventName The name of the key event to listen for.
     * @param handler A function to call when the notification occurs. Receives the
     * event object as an argument.
     * @returns The key event that was registered.
     */
    addEventListener(element, eventName, handler) {
        const parsedEvent = KeyEventsPlugin.parseEventName(eventName);
        const outsideHandler = KeyEventsPlugin.eventCallback(parsedEvent['fullKey'], handler, this.manager.getZone());
        return this.manager.getZone().runOutsideAngular(() => {
            return getDOM().onAndCancel(element, parsedEvent['domEventName'], outsideHandler);
        });
    }
    /**
     * Parses the user provided full keyboard event definition and normalizes it for
     * later internal use. It ensures the string is all lowercase, converts special
     * characters to a standard spelling, and orders all the values consistently.
     *
     * @param eventName The name of the key event to listen for.
     * @returns an object with the full, normalized string, and the dom event name
     * or null in the case when the event doesn't match a keyboard event.
     */
    static parseEventName(eventName) {
        const parts = eventName.toLowerCase().split('.');
        const domEventName = parts.shift();
        if (parts.length === 0 || !(domEventName === 'keydown' || domEventName === 'keyup')) {
            return null;
        }
        const key = KeyEventsPlugin._normalizeKey(parts.pop());
        let fullKey = '';
        let codeIX = parts.indexOf('code');
        if (codeIX > -1) {
            parts.splice(codeIX, 1);
            fullKey = 'code.';
        }
        MODIFIER_KEYS.forEach((modifierName) => {
            const index = parts.indexOf(modifierName);
            if (index > -1) {
                parts.splice(index, 1);
                fullKey += modifierName + '.';
            }
        });
        fullKey += key;
        if (parts.length != 0 || key.length === 0) {
            // returning null instead of throwing to let another plugin process the event
            return null;
        }
        // NOTE: Please don't rewrite this as so, as it will break JSCompiler property renaming.
        //       The code must remain in the `result['domEventName']` form.
        // return {domEventName, fullKey};
        const result = {};
        result['domEventName'] = domEventName;
        result['fullKey'] = fullKey;
        return result;
    }
    /**
     * Determines whether the actual keys pressed match the configured key code string.
     * The `fullKeyCode` event is normalized in the `parseEventName` method when the
     * event is attached to the DOM during the `addEventListener` call. This is unseen
     * by the end user and is normalized for internal consistency and parsing.
     *
     * @param event The keyboard event.
     * @param fullKeyCode The normalized user defined expected key event string
     * @returns boolean.
     */
    static matchEventFullKeyCode(event, fullKeyCode) {
        let keycode = _keyMap[event.key] || event.key;
        let key = '';
        if (fullKeyCode.indexOf('code.') > -1) {
            keycode = event.code;
            key = 'code.';
        }
        // the keycode could be unidentified so we have to check here
        if (keycode == null || !keycode)
            return false;
        keycode = keycode.toLowerCase();
        if (keycode === ' ') {
            keycode = 'space'; // for readability
        }
        else if (keycode === '.') {
            keycode = 'dot'; // because '.' is used as a separator in event names
        }
        MODIFIER_KEYS.forEach((modifierName) => {
            if (modifierName !== keycode) {
                const modifierGetter = MODIFIER_KEY_GETTERS[modifierName];
                if (modifierGetter(event)) {
                    key += modifierName + '.';
                }
            }
        });
        key += keycode;
        return key === fullKeyCode;
    }
    /**
     * Configures a handler callback for a key event.
     * @param fullKey The event name that combines all simultaneous keystrokes.
     * @param handler The function that responds to the key event.
     * @param zone The zone in which the event occurred.
     * @returns A callback function.
     */
    static eventCallback(fullKey, handler, zone) {
        return (event) => {
            if (KeyEventsPlugin.matchEventFullKeyCode(event, fullKey)) {
                zone.runGuarded(() => handler(event));
            }
        };
    }
    /** @internal */
    static _normalizeKey(keyName) {
        return keyName === 'esc' ? 'escape' : keyName;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: KeyEventsPlugin, deps: [{ token: DOCUMENT }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: KeyEventsPlugin }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: KeyEventsPlugin, decorators: [{
            type: Injectable
        }], ctorParameters: () => [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [DOCUMENT]
                }] }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5X2V2ZW50cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3BsYXRmb3JtLWJyb3dzZXIvc3JjL2RvbS9ldmVudHMva2V5X2V2ZW50cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsUUFBUSxFQUFFLE9BQU8sSUFBSSxNQUFNLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUM1RCxPQUFPLEVBQUMsTUFBTSxFQUFFLFVBQVUsRUFBUyxNQUFNLGVBQWUsQ0FBQztBQUV6RCxPQUFPLEVBQUMsa0JBQWtCLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQzs7QUFFbkQ7O0dBRUc7QUFDSCxNQUFNLGFBQWEsR0FBRyxDQUFDLEtBQUssRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBRTFELDhGQUE4RjtBQUM5RixtREFBbUQ7QUFDbkQsTUFBTSxPQUFPLEdBQTBCO0lBQ3JDLElBQUksRUFBRSxXQUFXO0lBQ2pCLElBQUksRUFBRSxLQUFLO0lBQ1gsTUFBTSxFQUFFLFFBQVE7SUFDaEIsTUFBTSxFQUFFLFFBQVE7SUFDaEIsS0FBSyxFQUFFLFFBQVE7SUFDZixLQUFLLEVBQUUsUUFBUTtJQUNmLE1BQU0sRUFBRSxXQUFXO0lBQ25CLE9BQU8sRUFBRSxZQUFZO0lBQ3JCLElBQUksRUFBRSxTQUFTO0lBQ2YsTUFBTSxFQUFFLFdBQVc7SUFDbkIsTUFBTSxFQUFFLGFBQWE7SUFDckIsUUFBUSxFQUFFLFlBQVk7SUFDdEIsS0FBSyxFQUFFLElBQUk7Q0FDWixDQUFDO0FBRUY7O0dBRUc7QUFDSCxNQUFNLG9CQUFvQixHQUF1RDtJQUMvRSxLQUFLLEVBQUUsQ0FBQyxLQUFvQixFQUFFLEVBQUUsQ0FBQyxLQUFLLENBQUMsTUFBTTtJQUM3QyxTQUFTLEVBQUUsQ0FBQyxLQUFvQixFQUFFLEVBQUUsQ0FBQyxLQUFLLENBQUMsT0FBTztJ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R0FBRyxJQUFJLFlBQVksR0FBRyxHQUFHLENBQUM7Z0JBQzVCLENBQUM7WUFDSCxDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFDSCxHQUFHLElBQUksT0FBTyxDQUFDO1FBQ2YsT0FBTyxHQUFHLEtBQUssV0FBVyxDQUFDO0lBQzdCLENBQUM7SUFFRDs7Ozs7O09BTUc7SUFDSCxNQUFNLENBQUMsYUFBYSxDQUFDLE9BQWUsRUFBRSxPQUFpQixFQUFFLElBQVk7UUFDbkUsT0FBTyxDQUFDLEtBQW9CLEVBQUUsRUFBRTtZQUM5QixJQUFJLGVBQWUsQ0FBQyxxQkFBcUIsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLEVBQUUsQ0FBQztnQkFDMUQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUN4QyxDQUFDO1FBQ0gsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUVELGdCQUFnQjtJQUNoQixNQUFNLENBQUMsYUFBYSxDQUFDLE9BQWU7UUFDbEMsT0FBTyxPQUFPLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQztJQUNoRCxDQUFDO3lIQS9JVSxlQUFlLGtCQUtOLFFBQVE7NkhBTGpCLGVBQWU7O3NHQUFmLGVBQWU7a0JBRDNCLFVBQVU7OzBCQU1JLE1BQU07MkJBQUMsUUFBUSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtET0NVTUVOVCwgybVnZXRET00gYXMgZ2V0RE9NfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHtJbmplY3QsIEluamVjdGFibGUsIE5nWm9uZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7RXZlbnRNYW5hZ2VyUGx1Z2lufSBmcm9tICcuL2V2ZW50X21hbmFnZXInO1xuXG4vKipcbiAqIERlZmluZXMgc3VwcG9ydGVkIG1vZGlmaWVycyBmb3Iga2V5IGV2ZW50cy5cbiAqL1xuY29uc3QgTU9ESUZJRVJfS0VZUyA9IFsnYWx0JywgJ2NvbnRyb2wnLCAnbWV0YScsICdzaGlmdCddO1xuXG4vLyBUaGUgZm9sbG93aW5nIHZhbHVlcyBhcmUgaGVyZSBmb3IgY3Jvc3MtYnJvd3NlciBjb21wYXRpYmlsaXR5IGFuZCB0byBtYXRjaCB0aGUgVzNDIHN0YW5kYXJkXG4vLyBjZiBodHRwczovL3d3dy53My5vcmcvVFIvRE9NLUxldmVsLTMtRXZlbnRzLWtleS9cbmNvbnN0IF9rZXlNYXA6IHtbazogc3RyaW5nXTogc3RyaW5nfSA9IHtcbiAgJ1xcYic6ICdCYWNrc3BhY2UnLFxuICAnXFx0JzogJ1RhYicsXG4gICdcXHg3Ric6ICdEZWxldGUnLFxuICAnXFx4MUInOiAnRXNjYXBlJyxcbiAgJ0RlbCc6ICdEZWxldGUnLFxuICAnRXNjJzogJ0VzY2FwZScsXG4gICdMZWZ0JzogJ0Fycm93TGVmdCcsXG4gICdSaWdodCc6ICdBcnJvd1JpZ2h0JyxcbiAgJ1VwJzogJ0Fycm93VXAnLFxuICAnRG93bic6ICdBcnJvd0Rvd24nLFxuICAnTWVudSc6ICdDb250ZXh0TWVudScsXG4gICdTY3JvbGwnOiAnU2Nyb2xsTG9jaycsXG4gICdXaW4nOiAnT1MnLFxufTtcblxuLyoqXG4gKiBSZXRyaWV2ZXMgbW9kaWZpZXJzIGZyb20ga2V5LWV2ZW50IG9iamVjdHMuXG4gKi9cbmNvbnN0IE1PRElGSUVSX0tFWV9HRVRURVJTOiB7W2tleTogc3RyaW5nXTogKGV2ZW50OiBLZXlib2FyZEV2ZW50KSA9PiBib29sZWFufSA9IHtcbiAgJ2FsdCc6IChldmVudDogS2V5Ym9hcmRFdmVudCkgPT4gZXZlbnQuYWx0S2V5LFxuICAnY29udHJvbCc6IChldmVudDogS2V5Ym9hcmRFdmVudCkgPT4gZXZlbnQuY3RybEtleSxcbiAgJ21ldGEnOiAoZXZlbnQ6IEtleWJvYXJkRXZlbnQpID0+IGV2ZW50Lm1ldGFLZXksXG4gICdzaGlmdCc6IChldmVudDogS2V5Ym9hcmRFdmVudCkgPT4gZXZlbnQuc2hpZnRLZXksXG59O1xuXG4vKipcbiAqIEEgYnJvd3NlciBwbHVnLWluIHRoYXQgcHJvdmlkZXMgc3VwcG9ydCBmb3IgaGFuZGxpbmcgb2Yga2V5IGV2ZW50cyBpbiBBbmd1bGFyLlxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgS2V5RXZlbnRzUGx1Z2luIGV4dGVuZHMgRXZlbnRNYW5hZ2VyUGx1Z2luIHtcbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIGFuIGluc3RhbmNlIG9mIHRoZSBicm93c2VyIHBsdWctaW4uXG4gICAqIEBwYXJhbSBkb2MgVGhlIGRvY3VtZW50IGluIHdoaWNoIGtleSBldmVudHMgd2lsbCBiZSBkZXRlY3RlZC5cbiAgICovXG4gIGNvbnN0cnVjdG9yKEBJbmplY3QoRE9DVU1FTlQpIGRvYzogYW55KSB7XG4gICAgc3VwZXIoZG9jKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXBvcnRzIHdoZXRoZXIgYSBuYW1lZCBrZXkgZXZlbnQgaXMgc3VwcG9ydGVkLlxuICAgKiBAcGFyYW0gZXZlbnROYW1lIFRoZSBldmVudCBuYW1lIHRvIHF1ZXJ5LlxuICAgKiBAcmV0dXJuIFRydWUgaWYgdGhlIG5hbWVkIGtleSBldmVudCBpcyBzdXBwb3J0ZWQuXG4gICAqL1xuICBvdmVycmlkZSBzdXBwb3J0cyhldmVudE5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBLZXlFdmVudHNQbHVnaW4ucGFyc2VFdmVudE5hbWUoZXZlbnROYW1lKSAhPSBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVycyBhIGhhbmRsZXIgZm9yIGEgc3BlY2lmaWMgZWxlbWVudCBhbmQga2V5IGV2ZW50LlxuICAgKiBAcGFyYW0gZWxlbWVudCBUaGUgSFRNTCBlbGVtZW50IHRvIHJlY2VpdmUgZXZlbnQgbm90aWZpY2F0aW9ucy5cbiAgICogQHBhcmFtIGV2ZW50TmFtZSBUaGUgbmFtZSBvZiB0aGUga2V5IGV2ZW50IHRvIGxpc3RlbiBmb3IuXG4gICAqIEBwYXJhbSBoYW5kbGVyIEEgZnVuY3Rpb24gdG8gY2FsbCB3aGVuIHRoZSBub3RpZmljYXRpb24gb2NjdXJzLiBSZWNlaXZlcyB0aGVcbiAgICogZXZlbnQgb2JqZWN0IGFzIGFuIGFyZ3VtZW50LlxuICAgKiBAcmV0dXJucyBUaGUga2V5IGV2ZW50IHRoYXQgd2FzIHJlZ2lzdGVyZWQuXG4gICAqL1xuICBvdmVycmlkZSBhZGRFdmVudExpc3RlbmVyKGVsZW1lbnQ6IEhUTUxFbGVtZW50LCBldmVudE5hbWU6IHN0cmluZywgaGFuZGxlcjogRnVuY3Rpb24pOiBGdW5jdGlvbiB7XG4gICAgY29uc3QgcGFyc2VkRXZlbnQgPSBLZXlFdmVudHNQbHVnaW4ucGFyc2VFdmVudE5hbWUoZXZlbnROYW1lKSE7XG5cbiAgICBjb25zdCBvdXRzaWRlSGFuZGxlciA9IEtleUV2ZW50c1BsdWdpbi5ldmVudENhbGxiYWNrKFxuICAgICAgcGFyc2VkRXZlbnRbJ2Z1bGxLZXknXSxcbiAgICAgIGhhbmRsZXIsXG4gICAgICB0aGlzLm1hbmFnZXIuZ2V0Wm9uZSgpLFxuICAgICk7XG5cbiAgICByZXR1cm4gdGhpcy5tYW5hZ2VyLmdldFpvbmUoKS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICByZXR1cm4gZ2V0RE9NKCkub25BbmRDYW5jZWwoZWxlbWVudCwgcGFyc2VkRXZlbnRbJ2RvbUV2ZW50TmFtZSddLCBvdXRzaWRlSGFuZGxlcik7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUGFyc2VzIHRoZSB1c2VyIHByb3ZpZGVkIGZ1bGwga2V5Ym9hcmQgZXZlbnQgZGVmaW5pdGlvbiBhbmQgbm9ybWFsaXplcyBpdCBmb3JcbiAgICogbGF0ZXIgaW50ZXJuYWwgdXNlLiBJdCBlbnN1cmVzIHRoZSBzdHJpbmcgaXMgYWxsIGxvd2VyY2FzZSwgY29udmVydHMgc3BlY2lhbFxuICAgKiBjaGFyYWN0ZXJzIHRvIGEgc3RhbmRhcmQgc3BlbGxpbmcsIGFuZCBvcmRlcnMgYWxsIHRoZSB2YWx1ZXMgY29uc2lzdGVudGx5LlxuICAgKlxuICAgKiBAcGFyYW0gZXZlbnROYW1lIFRoZSBuYW1lIG9mIHRoZSBrZXkgZXZlbnQgdG8gbGlzdGVuIGZvci5cbiAgICogQHJldHVybnMgYW4gb2JqZWN0IHdpdGggdGhlIGZ1bGwsIG5vcm1hbGl6ZWQgc3RyaW5nLCBhbmQgdGhlIGRvbSBldmVudCBuYW1lXG4gICAqIG9yIG51bGwgaW4gdGhlIGNhc2Ugd2hlbiB0aGUgZXZlbnQgZG9lc24ndCBtYXRjaCBhIGtleWJvYXJkIGV2ZW50LlxuICAgKi9cbiAgc3RhdGljIHBhcnNlRXZlbnROYW1lKGV2ZW50TmFtZTogc3RyaW5nKToge2Z1bGxLZXk6IHN0cmluZzsgZG9tRXZlbnROYW1lOiBzdHJpbmd9IHwgbnVsbCB7XG4gICAgY29uc3QgcGFydHM6IHN0cmluZ1tdID0gZXZlbnROYW1lLnRvTG93ZXJDYXNlKCkuc3BsaXQoJy4nKTtcblxuICAgIGNvbnN0IGRvbUV2ZW50TmFtZSA9IHBhcnRzLnNoaWZ0KCk7XG4gICAgaWYgKHBhcnRzLmxlbmd0aCA9PT0gMCB8fCAhKGRvbUV2ZW50TmFtZSA9PT0gJ2tleWRvd24nIHx8IGRvbUV2ZW50TmFtZSA9PT0gJ2tleXVwJykpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IGtleSA9IEtleUV2ZW50c1BsdWdpbi5fbm9ybWFsaXplS2V5KHBhcnRzLnBvcCgpISk7XG5cbiAgICBsZXQgZnVsbEtleSA9ICcnO1xuICAgIGxldCBjb2RlSVggPSBwYXJ0cy5pbmRleE9mKCdjb2RlJyk7XG4gICAgaWYgKGNvZGVJWCA+IC0xKSB7XG4gICAgICBwYXJ0cy5zcGxpY2UoY29kZUlYLCAxKTtcbiAgICAgIGZ1bGxLZXkgPSAnY29kZS4nO1xuICAgIH1cbiAgICBNT0RJRklFUl9LRVlTLmZvckVhY2goKG1vZGlmaWVyTmFtZSkgPT4ge1xuICAgICAgY29uc3QgaW5kZXg6IG51bWJlciA9IHBhcnRzLmluZGV4T2YobW9kaWZpZXJOYW1lKTtcbiAgICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICAgIHBhcnRzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIGZ1bGxLZXkgKz0gbW9kaWZpZXJOYW1lICsgJy4nO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGZ1bGxLZXkgKz0ga2V5O1xuXG4gICAgaWYgKHBhcnRzLmxlbmd0aCAhPSAwIHx8IGtleS5sZW5ndGggPT09IDApIHtcbiAgICAgIC8vIHJldHVybmluZyBudWxsIGluc3RlYWQgb2YgdGhyb3dpbmcgdG8gbGV0IGFub3RoZXIgcGx1Z2luIHByb2Nlc3MgdGhlIGV2ZW50XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBOT1RFOiBQbGVhc2UgZG9uJ3QgcmV3cml0ZSB0aGlzIGFzIHNvLCBhcyBpdCB3aWxsIGJyZWFrIEpTQ29tcGlsZXIgcHJvcGVydHkgcmVuYW1pbmcuXG4gICAgLy8gICAgICAgVGhlIGNvZGUgbXVzdCByZW1haW4gaW4gdGhlIGByZXN1bHRbJ2RvbUV2ZW50TmFtZSddYCBmb3JtLlxuICAgIC8vIHJldHVybiB7ZG9tRXZlbnROYW1lLCBmdWxsS2V5fTtcbiAgICBjb25zdCByZXN1bHQ6IHtmdWxsS2V5OiBzdHJpbmc7IGRvbUV2ZW50TmFtZTogc3RyaW5nfSA9IHt9IGFzIGFueTtcbiAgICByZXN1bHRbJ2RvbUV2ZW50TmFtZSddID0gZG9tRXZlbnROYW1lO1xuICAgIHJlc3VsdFsnZnVsbEtleSddID0gZnVsbEtleTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLyoqXG4gICAqIERldGVybWluZXMgd2hldGhlciB0aGUgYWN0dWFsIGtleXMgcHJlc3NlZCBtYXRjaCB0aGUgY29uZmlndXJlZCBrZXkgY29kZSBzdHJpbmcuXG4gICAqIFRoZSBgZnVsbEtleUNvZGVgIGV2ZW50IGlzIG5vcm1hbGl6ZWQgaW4gdGhlIGBwYXJzZUV2ZW50TmFtZWAgbWV0aG9kIHdoZW4gdGhlXG4gICAqIGV2ZW50IGlzIGF0dGFjaGVkIHRvIHRoZSBET00gZHVyaW5nIHRoZSBgYWRkRXZlbnRMaXN0ZW5lcmAgY2FsbC4gVGhpcyBpcyB1bnNlZW5cbiAgICogYnkgdGhlIGVuZCB1c2VyIGFuZCBpcyBub3JtYWxpemVkIGZvciBpbnRlcm5hbCBjb25zaXN0ZW5jeSBhbmQgcGFyc2luZy5cbiAgICpcbiAgICogQHBhcmFtIGV2ZW50IFRoZSBrZXlib2FyZCBldmVudC5cbiAgICogQHBhcmFtIGZ1bGxLZXlDb2RlIFRoZSBub3JtYWxpemVkIHVzZXIgZGVmaW5lZCBleHBlY3RlZCBrZXkgZXZlbnQgc3RyaW5nXG4gICAqIEByZXR1cm5zIGJvb2xlYW4uXG4gICAqL1xuICBzdGF0aWMgbWF0Y2hFdmVudEZ1bGxLZXlDb2RlKGV2ZW50OiBLZXlib2FyZEV2ZW50LCBmdWxsS2V5Q29kZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgbGV0IGtleWNvZGUgPSBfa2V5TWFwW2V2ZW50LmtleV0gfHwgZXZlbnQua2V5O1xuICAgIGxldCBrZXkgPSAnJztcbiAgICBpZiAoZnVsbEtleUNvZGUuaW5kZXhPZignY29kZS4nKSA+IC0xKSB7XG4gICAgICBrZXljb2RlID0gZXZlbnQuY29kZTtcbiAgICAgIGtleSA9ICdjb2RlLic7XG4gICAgfVxuICAgIC8vIHRoZSBrZXljb2RlIGNvdWxkIGJlIHVuaWRlbnRpZmllZCBzbyB3ZSBoYXZlIHRvIGNoZWNrIGhlcmVcbiAgICBpZiAoa2V5Y29kZSA9PSBudWxsIHx8ICFrZXljb2RlKSByZXR1cm4gZmFsc2U7XG4gICAga2V5Y29kZSA9IGtleWNvZGUudG9Mb3dlckNhc2UoKTtcbiAgICBpZiAoa2V5Y29kZSA9PT0gJyAnKSB7XG4gICAgICBrZXljb2RlID0gJ3NwYWNlJzsgLy8gZm9yIHJlYWRhYmlsaXR5XG4gICAgfSBlbHNlIGlmIChrZXljb2RlID09PSAnLicpIHtcbiAgICAgIGtleWNvZGUgPSAnZG90JzsgLy8gYmVjYXVzZSAnLicgaXMgdXNlZCBhcyBhIHNlcGFyYXRvciBpbiBldmVudCBuYW1lc1xuICAgIH1cbiAgICBNT0RJRklFUl9LRVlTLmZvckVhY2goKG1vZGlmaWVyTmFtZSkgPT4ge1xuICAgICAgaWYgKG1vZGlmaWVyTmFtZSAhPT0ga2V5Y29kZSkge1xuICAgICAgICBjb25zdCBtb2RpZmllckdldHRlciA9IE1PRElGSUVSX0tFWV9HRVRURVJTW21vZGlmaWVyTmFtZV07XG4gICAgICAgIGlmIChtb2RpZmllckdldHRlcihldmVudCkpIHtcbiAgICAgICAgICBrZXkgKz0gbW9kaWZpZXJOYW1lICsgJy4nO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gICAga2V5ICs9IGtleWNvZGU7XG4gICAgcmV0dXJuIGtleSA9PT0gZnVsbEtleUNvZGU7XG4gIH1cblxuICAvKipcbiAgICogQ29uZmlndXJlcyBhIGhhbmRsZXIgY2FsbGJhY2sgZm9yIGEga2V5IGV2ZW50LlxuICAgKiBAcGFyYW0gZnVsbEtleSBUaGUgZXZlbnQgbmFtZSB0aGF0IGNvbWJpbmVzIGFsbCBzaW11bHRhbmVvdXMga2V5c3Ryb2tlcy5cbiAgICogQHBhcmFtIGhhbmRsZXIgVGhlIGZ1bmN0aW9uIHRoYXQgcmVzcG9uZHMgdG8gdGhlIGtleSBldmVudC5cbiAgICogQHBhcmFtIHpvbmUgVGhlIHpvbmUgaW4gd2hpY2ggdGhlIGV2ZW50IG9jY3VycmVkLlxuICAgKiBAcmV0dXJucyBBIGNhbGxiYWNrIGZ1bmN0aW9uLlxuICAgKi9cbiAgc3RhdGljIGV2ZW50Q2FsbGJhY2soZnVsbEtleTogc3RyaW5nLCBoYW5kbGVyOiBGdW5jdGlvbiwgem9uZTogTmdab25lKTogRnVuY3Rpb24ge1xuICAgIHJldHVybiAoZXZlbnQ6IEtleWJvYXJkRXZlbnQpID0+IHtcbiAgICAgIGlmIChLZXlFdmVudHNQbHVnaW4ubWF0Y2hFdmVudEZ1bGxLZXlDb2RlKGV2ZW50LCBmdWxsS2V5KSkge1xuICAgICAgICB6b25lLnJ1bkd1YXJkZWQoKCkgPT4gaGFuZGxlcihldmVudCkpO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIHN0YXRpYyBfbm9ybWFsaXplS2V5KGtleU5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGtleU5hbWUgPT09ICdlc2MnID8gJ2VzY2FwZScgOiBrZXlOYW1lO1xuICB9XG59XG4iXX0=