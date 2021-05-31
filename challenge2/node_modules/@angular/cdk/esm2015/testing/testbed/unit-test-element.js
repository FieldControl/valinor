/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import * as keyCodes from '@angular/cdk/keycodes';
import { _getTextWithExcludedElements, TestKey, } from '@angular/cdk/testing';
import { clearElement, createFakeEvent, dispatchFakeEvent, dispatchMouseEvent, dispatchPointerEvent, isTextInput, triggerBlur, triggerFocus, typeInElement, dispatchEvent, } from './fake-events';
/** Maps `TestKey` constants to the `keyCode` and `key` values used by native browser events. */
const keyMap = {
    [TestKey.BACKSPACE]: { keyCode: keyCodes.BACKSPACE, key: 'Backspace' },
    [TestKey.TAB]: { keyCode: keyCodes.TAB, key: 'Tab' },
    [TestKey.ENTER]: { keyCode: keyCodes.ENTER, key: 'Enter' },
    [TestKey.SHIFT]: { keyCode: keyCodes.SHIFT, key: 'Shift' },
    [TestKey.CONTROL]: { keyCode: keyCodes.CONTROL, key: 'Control' },
    [TestKey.ALT]: { keyCode: keyCodes.ALT, key: 'Alt' },
    [TestKey.ESCAPE]: { keyCode: keyCodes.ESCAPE, key: 'Escape' },
    [TestKey.PAGE_UP]: { keyCode: keyCodes.PAGE_UP, key: 'PageUp' },
    [TestKey.PAGE_DOWN]: { keyCode: keyCodes.PAGE_DOWN, key: 'PageDown' },
    [TestKey.END]: { keyCode: keyCodes.END, key: 'End' },
    [TestKey.HOME]: { keyCode: keyCodes.HOME, key: 'Home' },
    [TestKey.LEFT_ARROW]: { keyCode: keyCodes.LEFT_ARROW, key: 'ArrowLeft' },
    [TestKey.UP_ARROW]: { keyCode: keyCodes.UP_ARROW, key: 'ArrowUp' },
    [TestKey.RIGHT_ARROW]: { keyCode: keyCodes.RIGHT_ARROW, key: 'ArrowRight' },
    [TestKey.DOWN_ARROW]: { keyCode: keyCodes.DOWN_ARROW, key: 'ArrowDown' },
    [TestKey.INSERT]: { keyCode: keyCodes.INSERT, key: 'Insert' },
    [TestKey.DELETE]: { keyCode: keyCodes.DELETE, key: 'Delete' },
    [TestKey.F1]: { keyCode: keyCodes.F1, key: 'F1' },
    [TestKey.F2]: { keyCode: keyCodes.F2, key: 'F2' },
    [TestKey.F3]: { keyCode: keyCodes.F3, key: 'F3' },
    [TestKey.F4]: { keyCode: keyCodes.F4, key: 'F4' },
    [TestKey.F5]: { keyCode: keyCodes.F5, key: 'F5' },
    [TestKey.F6]: { keyCode: keyCodes.F6, key: 'F6' },
    [TestKey.F7]: { keyCode: keyCodes.F7, key: 'F7' },
    [TestKey.F8]: { keyCode: keyCodes.F8, key: 'F8' },
    [TestKey.F9]: { keyCode: keyCodes.F9, key: 'F9' },
    [TestKey.F10]: { keyCode: keyCodes.F10, key: 'F10' },
    [TestKey.F11]: { keyCode: keyCodes.F11, key: 'F11' },
    [TestKey.F12]: { keyCode: keyCodes.F12, key: 'F12' },
    [TestKey.META]: { keyCode: keyCodes.META, key: 'Meta' }
};
/** A `TestElement` implementation for unit tests. */
export class UnitTestElement {
    constructor(element, _stabilize) {
        this.element = element;
        this._stabilize = _stabilize;
    }
    /** Blur the element. */
    blur() {
        return __awaiter(this, void 0, void 0, function* () {
            triggerBlur(this.element);
            yield this._stabilize();
        });
    }
    /** Clear the element's input (for input and textarea elements only). */
    clear() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!isTextInput(this.element)) {
                throw Error('Attempting to clear an invalid element');
            }
            clearElement(this.element);
            yield this._stabilize();
        });
    }
    click(...args) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._dispatchMouseEventSequence('click', args, 0);
            yield this._stabilize();
        });
    }
    rightClick(...args) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._dispatchMouseEventSequence('contextmenu', args, 2);
            yield this._stabilize();
        });
    }
    /** Focus the element. */
    focus() {
        return __awaiter(this, void 0, void 0, function* () {
            triggerFocus(this.element);
            yield this._stabilize();
        });
    }
    /** Get the computed value of the given CSS property for the element. */
    getCssValue(property) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._stabilize();
            // TODO(mmalerba): Consider adding value normalization if we run into common cases where its
            //  needed.
            return getComputedStyle(this.element).getPropertyValue(property);
        });
    }
    /** Hovers the mouse over the element. */
    hover() {
        return __awaiter(this, void 0, void 0, function* () {
            this._dispatchPointerEventIfSupported('pointerenter');
            dispatchMouseEvent(this.element, 'mouseenter');
            yield this._stabilize();
        });
    }
    /** Moves the mouse away from the element. */
    mouseAway() {
        return __awaiter(this, void 0, void 0, function* () {
            this._dispatchPointerEventIfSupported('pointerleave');
            dispatchMouseEvent(this.element, 'mouseleave');
            yield this._stabilize();
        });
    }
    sendKeys(...modifiersAndKeys) {
        return __awaiter(this, void 0, void 0, function* () {
            const args = modifiersAndKeys.map(k => typeof k === 'number' ? keyMap[k] : k);
            typeInElement(this.element, ...args);
            yield this._stabilize();
        });
    }
    /**
     * Gets the text from the element.
     * @param options Options that affect what text is included.
     */
    text(options) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._stabilize();
            if (options === null || options === void 0 ? void 0 : options.exclude) {
                return _getTextWithExcludedElements(this.element, options.exclude);
            }
            return (this.element.textContent || '').trim();
        });
    }
    /** Gets the value for the given attribute from the element. */
    getAttribute(name) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._stabilize();
            return this.element.getAttribute(name);
        });
    }
    /** Checks whether the element has the given class. */
    hasClass(name) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._stabilize();
            return this.element.classList.contains(name);
        });
    }
    /** Gets the dimensions of the element. */
    getDimensions() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._stabilize();
            return this.element.getBoundingClientRect();
        });
    }
    /** Gets the value of a property of an element. */
    getProperty(name) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._stabilize();
            return this.element[name];
        });
    }
    /** Sets the value of a property of an input. */
    setInputValue(value) {
        return __awaiter(this, void 0, void 0, function* () {
            this.element.value = value;
            yield this._stabilize();
        });
    }
    /** Selects the options at the specified indexes inside of a native `select` element. */
    selectOptions(...optionIndexes) {
        return __awaiter(this, void 0, void 0, function* () {
            let hasChanged = false;
            const options = this.element.querySelectorAll('option');
            const indexes = new Set(optionIndexes); // Convert to a set to remove duplicates.
            for (let i = 0; i < options.length; i++) {
                const option = options[i];
                const wasSelected = option.selected;
                // We have to go through `option.selected`, because `HTMLSelectElement.value` doesn't
                // allow for multiple options to be selected, even in `multiple` mode.
                option.selected = indexes.has(i);
                if (option.selected !== wasSelected) {
                    hasChanged = true;
                    dispatchFakeEvent(this.element, 'change');
                }
            }
            if (hasChanged) {
                yield this._stabilize();
            }
        });
    }
    /** Checks whether this element matches the given selector. */
    matchesSelector(selector) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._stabilize();
            const elementPrototype = Element.prototype;
            return (elementPrototype['matches'] || elementPrototype['msMatchesSelector'])
                .call(this.element, selector);
        });
    }
    /** Checks whether the element is focused. */
    isFocused() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._stabilize();
            return document.activeElement === this.element;
        });
    }
    /**
     * Dispatches an event with a particular name.
     * @param name Name of the event to be dispatched.
     */
    dispatchEvent(name, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = createFakeEvent(name);
            if (data) {
                // tslint:disable-next-line:ban Have to use `Object.assign` to preserve the original object.
                Object.assign(event, data);
            }
            dispatchEvent(this.element, event);
            yield this._stabilize();
        });
    }
    /**
     * Dispatches a pointer event on the current element if the browser supports it.
     * @param name Name of the pointer event to be dispatched.
     * @param clientX Coordinate of the user's pointer along the X axis.
     * @param clientY Coordinate of the user's pointer along the Y axis.
     * @param button Mouse button that should be pressed when dispatching the event.
     */
    _dispatchPointerEventIfSupported(name, clientX, clientY, button) {
        // The latest versions of all browsers we support have the new `PointerEvent` API.
        // Though since we capture the two most recent versions of these browsers, we also
        // need to support Safari 12 at time of writing. Safari 12 does not have support for this,
        // so we need to conditionally create and dispatch these events based on feature detection.
        if (typeof PointerEvent !== 'undefined' && PointerEvent) {
            dispatchPointerEvent(this.element, name, clientX, clientY, { isPrimary: true, button });
        }
    }
    /** Dispatches all the events that are part of a mouse event sequence. */
    _dispatchMouseEventSequence(name, args, button) {
        return __awaiter(this, void 0, void 0, function* () {
            let clientX = undefined;
            let clientY = undefined;
            let modifiers = {};
            if (args.length && typeof args[args.length - 1] === 'object') {
                modifiers = args.pop();
            }
            if (args.length) {
                const { left, top, width, height } = yield this.getDimensions();
                const relativeX = args[0] === 'center' ? width / 2 : args[0];
                const relativeY = args[0] === 'center' ? height / 2 : args[1];
                // Round the computed click position as decimal pixels are not
                // supported by mouse events and could lead to unexpected results.
                clientX = Math.round(left + relativeX);
                clientY = Math.round(top + relativeY);
            }
            this._dispatchPointerEventIfSupported('pointerdown', clientX, clientY, button);
            dispatchMouseEvent(this.element, 'mousedown', clientX, clientY, button, modifiers);
            this._dispatchPointerEventIfSupported('pointerup', clientX, clientY, button);
            dispatchMouseEvent(this.element, 'mouseup', clientX, clientY, button, modifiers);
            dispatchMouseEvent(this.element, name, clientX, clientY, button, modifiers);
            // This call to _stabilize should not be needed since the callers will already do that them-
            // selves. Nevertheless it breaks some tests in g3 without it. It needs to be investigated
            // why removing breaks those tests.
            yield this._stabilize();
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidW5pdC10ZXN0LWVsZW1lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL3Rlc3RpbmcvdGVzdGJlZC91bml0LXRlc3QtZWxlbWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBRUgsT0FBTyxLQUFLLFFBQVEsTUFBTSx1QkFBdUIsQ0FBQztBQUNsRCxPQUFPLEVBQ0wsNEJBQTRCLEVBSTVCLE9BQU8sR0FHUixNQUFNLHNCQUFzQixDQUFDO0FBQzlCLE9BQU8sRUFDTCxZQUFZLEVBQ1osZUFBZSxFQUNmLGlCQUFpQixFQUNqQixrQkFBa0IsRUFDbEIsb0JBQW9CLEVBQ3BCLFdBQVcsRUFDWCxXQUFXLEVBQ1gsWUFBWSxFQUNaLGFBQWEsRUFDYixhQUFhLEdBQ2QsTUFBTSxlQUFlLENBQUM7QUFFdkIsZ0dBQWdHO0FBQ2hHLE1BQU0sTUFBTSxHQUFHO0lBQ2IsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEVBQUUsRUFBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLFNBQVMsRUFBRSxHQUFHLEVBQUUsV0FBVyxFQUFDO0lBQ3BFLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBQztJQUNsRCxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUM7SUFDeEQsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsT0FBTyxFQUFDO0lBQ3hELENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBQztJQUM5RCxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUM7SUFDbEQsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFDO0lBQzNELENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBQztJQUM3RCxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsRUFBRSxFQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsU0FBUyxFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUM7SUFDbkUsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFDO0lBQ2xELENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBQztJQUNyRCxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsRUFBRSxFQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsVUFBVSxFQUFFLEdBQUcsRUFBRSxXQUFXLEVBQUM7SUFDdEUsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFDO0lBQ2hFLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxFQUFFLEVBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxXQUFXLEVBQUUsR0FBRyxFQUFFLFlBQVksRUFBQztJQUN6RSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsRUFBRSxFQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsVUFBVSxFQUFFLEdBQUcsRUFBRSxXQUFXLEVBQUM7SUFDdEUsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFDO0lBQzNELENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBQztJQUMzRCxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUM7SUFDL0MsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFDO0lBQy9DLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBQztJQUMvQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUM7SUFDL0MsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFDO0lBQy9DLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBQztJQUMvQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUM7SUFDL0MsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLEVBQUUsRUFBRSxH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LElBQUksQ0FBQyxDQUFDLENBQVcsQ0FBQztnQkFFeEUsOERBQThEO2dCQUM5RCxrRUFBa0U7Z0JBQ2xFLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxTQUFTLENBQUMsQ0FBQztnQkFDdkMsT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLFNBQVMsQ0FBQyxDQUFDO2FBQ3ZDO1lBRUQsSUFBSSxDQUFDLGdDQUFnQyxDQUFDLGFBQWEsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQy9FLGtCQUFrQixDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsV0FBVyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQ25GLElBQUksQ0FBQyxnQ0FBZ0MsQ0FBQyxXQUFXLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztZQUM3RSxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxTQUFTLENBQUMsQ0FBQztZQUNqRixrQkFBa0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxTQUFTLENBQUMsQ0FBQztZQUU1RSw0RkFBNEY7WUFDNUYsMEZBQTBGO1lBQzFGLG1DQUFtQztZQUNuQyxNQUFNLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUMxQixDQUFDO0tBQUE7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBrZXlDb2RlcyBmcm9tICdAYW5ndWxhci9jZGsva2V5Y29kZXMnO1xuaW1wb3J0IHtcbiAgX2dldFRleHRXaXRoRXhjbHVkZWRFbGVtZW50cyxcbiAgRWxlbWVudERpbWVuc2lvbnMsXG4gIE1vZGlmaWVyS2V5cyxcbiAgVGVzdEVsZW1lbnQsXG4gIFRlc3RLZXksXG4gIFRleHRPcHRpb25zLFxuICBFdmVudERhdGEsXG59IGZyb20gJ0Bhbmd1bGFyL2Nkay90ZXN0aW5nJztcbmltcG9ydCB7XG4gIGNsZWFyRWxlbWVudCxcbiAgY3JlYXRlRmFrZUV2ZW50LFxuICBkaXNwYXRjaEZha2VFdmVudCxcbiAgZGlzcGF0Y2hNb3VzZUV2ZW50LFxuICBkaXNwYXRjaFBvaW50ZXJFdmVudCxcbiAgaXNUZXh0SW5wdXQsXG4gIHRyaWdnZXJCbHVyLFxuICB0cmlnZ2VyRm9jdXMsXG4gIHR5cGVJbkVsZW1lbnQsXG4gIGRpc3BhdGNoRXZlbnQsXG59IGZyb20gJy4vZmFrZS1ldmVudHMnO1xuXG4vKiogTWFwcyBgVGVzdEtleWAgY29uc3RhbnRzIHRvIHRoZSBga2V5Q29kZWAgYW5kIGBrZXlgIHZhbHVlcyB1c2VkIGJ5IG5hdGl2ZSBicm93c2VyIGV2ZW50cy4gKi9cbmNvbnN0IGtleU1hcCA9IHtcbiAgW1Rlc3RLZXkuQkFDS1NQQUNFXToge2tleUNvZGU6IGtleUNvZGVzLkJBQ0tTUEFDRSwga2V5OiAnQmFja3NwYWNlJ30sXG4gIFtUZXN0S2V5LlRBQl06IHtrZXlDb2RlOiBrZXlDb2Rlcy5UQUIsIGtleTogJ1RhYid9LFxuICBbVGVzdEtleS5FTlRFUl06IHtrZXlDb2RlOiBrZXlDb2Rlcy5FTlRFUiwga2V5OiAnRW50ZXInfSxcbiAgW1Rlc3RLZXkuU0hJRlRdOiB7a2V5Q29kZToga2V5Q29kZXMuU0hJRlQsIGtleTogJ1NoaWZ0J30sXG4gIFtUZXN0S2V5LkNPTlRST0xdOiB7a2V5Q29kZToga2V5Q29kZXMuQ09OVFJPTCwga2V5OiAnQ29udHJvbCd9LFxuICBbVGVzdEtleS5BTFRdOiB7a2V5Q29kZToga2V5Q29kZXMuQUxULCBrZXk6ICdBbHQnfSxcbiAgW1Rlc3RLZXkuRVNDQVBFXToge2tleUNvZGU6IGtleUNvZGVzLkVTQ0FQRSwga2V5OiAnRXNjYXBlJ30sXG4gIFtUZXN0S2V5LlBBR0VfVVBdOiB7a2V5Q29kZToga2V5Q29kZXMuUEFHRV9VUCwga2V5OiAnUGFnZVVwJ30sXG4gIFtUZXN0S2V5LlBBR0VfRE9XTl06IHtrZXlDb2RlOiBrZXlDb2Rlcy5QQUdFX0RPV04sIGtleTogJ1BhZ2VEb3duJ30sXG4gIFtUZXN0S2V5LkVORF06IHtrZXlDb2RlOiBrZXlDb2Rlcy5FTkQsIGtleTogJ0VuZCd9LFxuICBbVGVzdEtleS5IT01FXToge2tleUNvZGU6IGtleUNvZGVzLkhPTUUsIGtleTogJ0hvbWUnfSxcbiAgW1Rlc3RLZXkuTEVGVF9BUlJPV106IHtrZXlDb2RlOiBrZXlDb2Rlcy5MRUZUX0FSUk9XLCBrZXk6ICdBcnJvd0xlZnQnfSxcbiAgW1Rlc3RLZXkuVVBfQVJST1ddOiB7a2V5Q29kZToga2V5Q29kZXMuVVBfQVJST1csIGtleTogJ0Fycm93VXAnfSxcbiAgW1Rlc3RLZXkuUklHSFRfQVJST1ddOiB7a2V5Q29kZToga2V5Q29kZXMuUklHSFRfQVJST1csIGtleTogJ0Fycm93UmlnaHQnfSxcbiAgW1Rlc3RLZXkuRE9XTl9BUlJPV106IHtrZXlDb2RlOiBrZXlDb2Rlcy5ET1dOX0FSUk9XLCBrZXk6ICdBcnJvd0Rvd24nfSxcbiAgW1Rlc3RLZXkuSU5TRVJUXToge2tleUNvZGU6IGtleUNvZGVzLklOU0VSVCwga2V5OiAnSW5zZXJ0J30sXG4gIFtUZXN0S2V5LkRFTEVURV06IHtrZXlDb2RlOiBrZXlDb2Rlcy5ERUxFVEUsIGtleTogJ0RlbGV0ZSd9LFxuICBbVGVzdEtleS5GMV06IHtrZXlDb2RlOiBrZXlDb2Rlcy5GMSwga2V5OiAnRjEnfSxcbiAgW1Rlc3RLZXkuRjJdOiB7a2V5Q29kZToga2V5Q29kZXMuRjIsIGtleTogJ0YyJ30sXG4gIFtUZXN0S2V5LkYzXToge2tleUNvZGU6IGtleUNvZGVzLkYzLCBrZXk6ICdGMyd9LFxuICBbVGVzdEtleS5GNF06IHtrZXlDb2RlOiBrZXlDb2Rlcy5GNCwga2V5OiAnRjQnfSxcbiAgW1Rlc3RLZXkuRjVdOiB7a2V5Q29kZToga2V5Q29kZXMuRjUsIGtleTogJ0Y1J30sXG4gIFtUZXN0S2V5LkY2XToge2tleUNvZGU6IGtleUNvZGVzLkY2LCBrZXk6ICdGNid9LFxuICBbVGVzdEtleS5GN106IHtrZXlDb2RlOiBrZXlDb2Rlcy5GNywga2V5OiAnRjcnfSxcbiAgW1Rlc3RLZXkuRjhdOiB7a2V5Q29kZToga2V5Q29kZXMuRjgsIGtleTogJ0Y4J30sXG4gIFtUZXN0S2V5LkY5XToge2tleUNvZGU6IGtleUNvZGVzLkY5LCBrZXk6ICdGOSd9LFxuICBbVGVzdEtleS5GMTBdOiB7a2V5Q29kZToga2V5Q29kZXMuRjEwLCBrZXk6ICdGMTAnfSxcbiAgW1Rlc3RLZXkuRjExXToge2tleUNvZGU6IGtleUNvZGVzLkYxMSwga2V5OiAnRjExJ30sXG4gIFtUZXN0S2V5LkYxMl06IHtrZXlDb2RlOiBrZXlDb2Rlcy5GMTIsIGtleTogJ0YxMid9LFxuICBbVGVzdEtleS5NRVRBXToge2tleUNvZGU6IGtleUNvZGVzLk1FVEEsIGtleTogJ01ldGEnfVxufTtcblxuLyoqIEEgYFRlc3RFbGVtZW50YCBpbXBsZW1lbnRhdGlvbiBmb3IgdW5pdCB0ZXN0cy4gKi9cbmV4cG9ydCBjbGFzcyBVbml0VGVzdEVsZW1lbnQgaW1wbGVtZW50cyBUZXN0RWxlbWVudCB7XG4gIGNvbnN0cnVjdG9yKHJlYWRvbmx5IGVsZW1lbnQ6IEVsZW1lbnQsIHByaXZhdGUgX3N0YWJpbGl6ZTogKCkgPT4gUHJvbWlzZTx2b2lkPikge31cblxuICAvKiogQmx1ciB0aGUgZWxlbWVudC4gKi9cbiAgYXN5bmMgYmx1cigpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICB0cmlnZ2VyQmx1cih0aGlzLmVsZW1lbnQgYXMgSFRNTEVsZW1lbnQpO1xuICAgIGF3YWl0IHRoaXMuX3N0YWJpbGl6ZSgpO1xuICB9XG5cbiAgLyoqIENsZWFyIHRoZSBlbGVtZW50J3MgaW5wdXQgKGZvciBpbnB1dCBhbmQgdGV4dGFyZWEgZWxlbWVudHMgb25seSkuICovXG4gIGFzeW5jIGNsZWFyKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICghaXNUZXh0SW5wdXQodGhpcy5lbGVtZW50KSkge1xuICAgICAgdGhyb3cgRXJyb3IoJ0F0dGVtcHRpbmcgdG8gY2xlYXIgYW4gaW52YWxpZCBlbGVtZW50Jyk7XG4gICAgfVxuICAgIGNsZWFyRWxlbWVudCh0aGlzLmVsZW1lbnQpO1xuICAgIGF3YWl0IHRoaXMuX3N0YWJpbGl6ZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIENsaWNrIHRoZSBlbGVtZW50IGF0IHRoZSBkZWZhdWx0IGxvY2F0aW9uIGZvciB0aGUgY3VycmVudCBlbnZpcm9ubWVudC4gSWYgeW91IG5lZWQgdG8gZ3VhcmFudGVlXG4gICAqIHRoZSBlbGVtZW50IGlzIGNsaWNrZWQgYXQgYSBzcGVjaWZpYyBsb2NhdGlvbiwgY29uc2lkZXIgdXNpbmcgYGNsaWNrKCdjZW50ZXInKWAgb3JcbiAgICogYGNsaWNrKHgsIHkpYCBpbnN0ZWFkLlxuICAgKi9cbiAgY2xpY2sobW9kaWZpZXJzPzogTW9kaWZpZXJLZXlzKTogUHJvbWlzZTx2b2lkPjtcbiAgLyoqIENsaWNrIHRoZSBlbGVtZW50IGF0IHRoZSBlbGVtZW50J3MgY2VudGVyLiAqL1xuICBjbGljayhsb2NhdGlvbjogJ2NlbnRlcicsIG1vZGlmaWVycz86IE1vZGlmaWVyS2V5cyk6IFByb21pc2U8dm9pZD47XG4gIC8qKlxuICAgKiBDbGljayB0aGUgZWxlbWVudCBhdCB0aGUgc3BlY2lmaWVkIGNvb3JkaW5hdGVzIHJlbGF0aXZlIHRvIHRoZSB0b3AtbGVmdCBvZiB0aGUgZWxlbWVudC5cbiAgICogQHBhcmFtIHJlbGF0aXZlWCBDb29yZGluYXRlIHdpdGhpbiB0aGUgZWxlbWVudCwgYWxvbmcgdGhlIFgtYXhpcyBhdCB3aGljaCB0byBjbGljay5cbiAgICogQHBhcmFtIHJlbGF0aXZlWSBDb29yZGluYXRlIHdpdGhpbiB0aGUgZWxlbWVudCwgYWxvbmcgdGhlIFktYXhpcyBhdCB3aGljaCB0byBjbGljay5cbiAgICogQHBhcmFtIG1vZGlmaWVycyBNb2RpZmllciBrZXlzIGhlbGQgd2hpbGUgY2xpY2tpbmdcbiAgICovXG4gIGNsaWNrKHJlbGF0aXZlWDogbnVtYmVyLCByZWxhdGl2ZVk6IG51bWJlciwgbW9kaWZpZXJzPzogTW9kaWZpZXJLZXlzKTogUHJvbWlzZTx2b2lkPjtcbiAgYXN5bmMgY2xpY2soLi4uYXJnczogW01vZGlmaWVyS2V5cz9dIHwgWydjZW50ZXInLCBNb2RpZmllcktleXM/XSB8XG4gICAgW251bWJlciwgbnVtYmVyLCBNb2RpZmllcktleXM/XSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMuX2Rpc3BhdGNoTW91c2VFdmVudFNlcXVlbmNlKCdjbGljaycsIGFyZ3MsIDApO1xuICAgIGF3YWl0IHRoaXMuX3N0YWJpbGl6ZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJpZ2h0IGNsaWNrcyBvbiB0aGUgZWxlbWVudCBhdCB0aGUgc3BlY2lmaWVkIGNvb3JkaW5hdGVzIHJlbGF0aXZlIHRvIHRoZSB0b3AtbGVmdCBvZiBpdC5cbiAgICogQHBhcmFtIHJlbGF0aXZlWCBDb29yZGluYXRlIHdpdGhpbiB0aGUgZWxlbWVudCwgYWxvbmcgdGhlIFgtYXhpcyBhdCB3aGljaCB0byBjbGljay5cbiAgICogQHBhcmFtIHJlbGF0aXZlWSBDb29yZGluYXRlIHdpdGhpbiB0aGUgZWxlbWVudCwgYWxvbmcgdGhlIFktYXhpcyBhdCB3aGljaCB0byBjbGljay5cbiAgICogQHBhcmFtIG1vZGlmaWVycyBNb2RpZmllciBrZXlzIGhlbGQgd2hpbGUgY2xpY2tpbmdcbiAgICovXG4gIHJpZ2h0Q2xpY2socmVsYXRpdmVYOiBudW1iZXIsIHJlbGF0aXZlWTogbnVtYmVyLCBtb2RpZmllcnM/OiBNb2RpZmllcktleXMpOiBQcm9taXNlPHZvaWQ+O1xuICBhc3luYyByaWdodENsaWNrKC4uLmFyZ3M6IFtNb2RpZmllcktleXM/XSB8IFsnY2VudGVyJywgTW9kaWZpZXJLZXlzP10gfFxuICAgIFtudW1iZXIsIG51bWJlciwgTW9kaWZpZXJLZXlzP10pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLl9kaXNwYXRjaE1vdXNlRXZlbnRTZXF1ZW5jZSgnY29udGV4dG1lbnUnLCBhcmdzLCAyKTtcbiAgICBhd2FpdCB0aGlzLl9zdGFiaWxpemUoKTtcbiAgfVxuXG4gIC8qKiBGb2N1cyB0aGUgZWxlbWVudC4gKi9cbiAgYXN5bmMgZm9jdXMoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdHJpZ2dlckZvY3VzKHRoaXMuZWxlbWVudCBhcyBIVE1MRWxlbWVudCk7XG4gICAgYXdhaXQgdGhpcy5fc3RhYmlsaXplKCk7XG4gIH1cblxuICAvKiogR2V0IHRoZSBjb21wdXRlZCB2YWx1ZSBvZiB0aGUgZ2l2ZW4gQ1NTIHByb3BlcnR5IGZvciB0aGUgZWxlbWVudC4gKi9cbiAgYXN5bmMgZ2V0Q3NzVmFsdWUocHJvcGVydHk6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgYXdhaXQgdGhpcy5fc3RhYmlsaXplKCk7XG4gICAgLy8gVE9ETyhtbWFsZXJiYSk6IENvbnNpZGVyIGFkZGluZyB2YWx1ZSBub3JtYWxpemF0aW9uIGlmIHdlIHJ1biBpbnRvIGNvbW1vbiBjYXNlcyB3aGVyZSBpdHNcbiAgICAvLyAgbmVlZGVkLlxuICAgIHJldHVybiBnZXRDb21wdXRlZFN0eWxlKHRoaXMuZWxlbWVudCkuZ2V0UHJvcGVydHlWYWx1ZShwcm9wZXJ0eSk7XG4gIH1cblxuICAvKiogSG92ZXJzIHRoZSBtb3VzZSBvdmVyIHRoZSBlbGVtZW50LiAqL1xuICBhc3luYyBob3ZlcigpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICB0aGlzLl9kaXNwYXRjaFBvaW50ZXJFdmVudElmU3VwcG9ydGVkKCdwb2ludGVyZW50ZXInKTtcbiAgICBkaXNwYXRjaE1vdXNlRXZlbnQodGhpcy5lbGVtZW50LCAnbW91c2VlbnRlcicpO1xuICAgIGF3YWl0IHRoaXMuX3N0YWJpbGl6ZSgpO1xuICB9XG5cbiAgLyoqIE1vdmVzIHRoZSBtb3VzZSBhd2F5IGZyb20gdGhlIGVsZW1lbnQuICovXG4gIGFzeW5jIG1vdXNlQXdheSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICB0aGlzLl9kaXNwYXRjaFBvaW50ZXJFdmVudElmU3VwcG9ydGVkKCdwb2ludGVybGVhdmUnKTtcbiAgICBkaXNwYXRjaE1vdXNlRXZlbnQodGhpcy5lbGVtZW50LCAnbW91c2VsZWF2ZScpO1xuICAgIGF3YWl0IHRoaXMuX3N0YWJpbGl6ZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlbmRzIHRoZSBnaXZlbiBzdHJpbmcgdG8gdGhlIGlucHV0IGFzIGEgc2VyaWVzIG9mIGtleSBwcmVzc2VzLiBBbHNvIGZpcmVzIGlucHV0IGV2ZW50c1xuICAgKiBhbmQgYXR0ZW1wdHMgdG8gYWRkIHRoZSBzdHJpbmcgdG8gdGhlIEVsZW1lbnQncyB2YWx1ZS5cbiAgICovXG4gIGFzeW5jIHNlbmRLZXlzKC4uLmtleXM6IChzdHJpbmcgfCBUZXN0S2V5KVtdKTogUHJvbWlzZTx2b2lkPjtcbiAgLyoqXG4gICAqIFNlbmRzIHRoZSBnaXZlbiBzdHJpbmcgdG8gdGhlIGlucHV0IGFzIGEgc2VyaWVzIG9mIGtleSBwcmVzc2VzLiBBbHNvIGZpcmVzIGlucHV0IGV2ZW50c1xuICAgKiBhbmQgYXR0ZW1wdHMgdG8gYWRkIHRoZSBzdHJpbmcgdG8gdGhlIEVsZW1lbnQncyB2YWx1ZS5cbiAgICovXG4gIGFzeW5jIHNlbmRLZXlzKG1vZGlmaWVyczogTW9kaWZpZXJLZXlzLCAuLi5rZXlzOiAoc3RyaW5nIHwgVGVzdEtleSlbXSk6IFByb21pc2U8dm9pZD47XG4gIGFzeW5jIHNlbmRLZXlzKC4uLm1vZGlmaWVyc0FuZEtleXM6IGFueVtdKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgYXJncyA9IG1vZGlmaWVyc0FuZEtleXMubWFwKGsgPT4gdHlwZW9mIGsgPT09ICdudW1iZXInID8ga2V5TWFwW2sgYXMgVGVzdEtleV0gOiBrKTtcbiAgICB0eXBlSW5FbGVtZW50KHRoaXMuZWxlbWVudCBhcyBIVE1MRWxlbWVudCwgLi4uYXJncyk7XG4gICAgYXdhaXQgdGhpcy5fc3RhYmlsaXplKCk7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgdGV4dCBmcm9tIHRoZSBlbGVtZW50LlxuICAgKiBAcGFyYW0gb3B0aW9ucyBPcHRpb25zIHRoYXQgYWZmZWN0IHdoYXQgdGV4dCBpcyBpbmNsdWRlZC5cbiAgICovXG4gIGFzeW5jIHRleHQob3B0aW9ucz86IFRleHRPcHRpb25zKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBhd2FpdCB0aGlzLl9zdGFiaWxpemUoKTtcbiAgICBpZiAob3B0aW9ucz8uZXhjbHVkZSkge1xuICAgICAgcmV0dXJuIF9nZXRUZXh0V2l0aEV4Y2x1ZGVkRWxlbWVudHModGhpcy5lbGVtZW50LCBvcHRpb25zLmV4Y2x1ZGUpO1xuICAgIH1cbiAgICByZXR1cm4gKHRoaXMuZWxlbWVudC50ZXh0Q29udGVudCB8fCAnJykudHJpbSgpO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIHZhbHVlIGZvciB0aGUgZ2l2ZW4gYXR0cmlidXRlIGZyb20gdGhlIGVsZW1lbnQuICovXG4gIGFzeW5jIGdldEF0dHJpYnV0ZShuYW1lOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZ3xudWxsPiB7XG4gICAgYXdhaXQgdGhpcy5fc3RhYmlsaXplKCk7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudC5nZXRBdHRyaWJ1dGUobmFtZSk7XG4gIH1cblxuICAvKiogQ2hlY2tzIHdoZXRoZXIgdGhlIGVsZW1lbnQgaGFzIHRoZSBnaXZlbiBjbGFzcy4gKi9cbiAgYXN5bmMgaGFzQ2xhc3MobmFtZTogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgYXdhaXQgdGhpcy5fc3RhYmlsaXplKCk7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMobmFtZSk7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgZGltZW5zaW9ucyBvZiB0aGUgZWxlbWVudC4gKi9cbiAgYXN5bmMgZ2V0RGltZW5zaW9ucygpOiBQcm9taXNlPEVsZW1lbnREaW1lbnNpb25zPiB7XG4gICAgYXdhaXQgdGhpcy5fc3RhYmlsaXplKCk7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSB2YWx1ZSBvZiBhIHByb3BlcnR5IG9mIGFuIGVsZW1lbnQuICovXG4gIGFzeW5jIGdldFByb3BlcnR5KG5hbWU6IHN0cmluZyk6IFByb21pc2U8YW55PiB7XG4gICAgYXdhaXQgdGhpcy5fc3RhYmlsaXplKCk7XG4gICAgcmV0dXJuICh0aGlzLmVsZW1lbnQgYXMgYW55KVtuYW1lXTtcbiAgfVxuXG4gIC8qKiBTZXRzIHRoZSB2YWx1ZSBvZiBhIHByb3BlcnR5IG9mIGFuIGlucHV0LiAqL1xuICBhc3luYyBzZXRJbnB1dFZhbHVlKHZhbHVlOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAodGhpcy5lbGVtZW50IGFzIGFueSkudmFsdWUgPSB2YWx1ZTtcbiAgICBhd2FpdCB0aGlzLl9zdGFiaWxpemUoKTtcbiAgfVxuXG4gIC8qKiBTZWxlY3RzIHRoZSBvcHRpb25zIGF0IHRoZSBzcGVjaWZpZWQgaW5kZXhlcyBpbnNpZGUgb2YgYSBuYXRpdmUgYHNlbGVjdGAgZWxlbWVudC4gKi9cbiAgYXN5bmMgc2VsZWN0T3B0aW9ucyguLi5vcHRpb25JbmRleGVzOiBudW1iZXJbXSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGxldCBoYXNDaGFuZ2VkID0gZmFsc2U7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKCdvcHRpb24nKTtcbiAgICBjb25zdCBpbmRleGVzID0gbmV3IFNldChvcHRpb25JbmRleGVzKTsgLy8gQ29udmVydCB0byBhIHNldCB0byByZW1vdmUgZHVwbGljYXRlcy5cblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb3B0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3Qgb3B0aW9uID0gb3B0aW9uc1tpXTtcbiAgICAgIGNvbnN0IHdhc1NlbGVjdGVkID0gb3B0aW9uLnNlbGVjdGVkO1xuXG4gICAgICAvLyBXZSBoYXZlIHRvIGdvIHRocm91Z2ggYG9wdGlvbi5zZWxlY3RlZGAsIGJlY2F1c2UgYEhUTUxTZWxlY3RFbGVtZW50LnZhbHVlYCBkb2Vzbid0XG4gICAgICAvLyBhbGxvdyBmb3IgbXVsdGlwbGUgb3B0aW9ucyB0byBiZSBzZWxlY3RlZCwgZXZlbiBpbiBgbXVsdGlwbGVgIG1vZGUuXG4gICAgICBvcHRpb24uc2VsZWN0ZWQgPSBpbmRleGVzLmhhcyhpKTtcblxuICAgICAgaWYgKG9wdGlvbi5zZWxlY3RlZCAhPT0gd2FzU2VsZWN0ZWQpIHtcbiAgICAgICAgaGFzQ2hhbmdlZCA9IHRydWU7XG4gICAgICAgIGRpc3BhdGNoRmFrZUV2ZW50KHRoaXMuZWxlbWVudCwgJ2NoYW5nZScpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChoYXNDaGFuZ2VkKSB7XG4gICAgICBhd2FpdCB0aGlzLl9zdGFiaWxpemUoKTtcbiAgICB9XG4gIH1cblxuICAvKiogQ2hlY2tzIHdoZXRoZXIgdGhpcyBlbGVtZW50IG1hdGNoZXMgdGhlIGdpdmVuIHNlbGVjdG9yLiAqL1xuICBhc3luYyBtYXRjaGVzU2VsZWN0b3Ioc2VsZWN0b3I6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGF3YWl0IHRoaXMuX3N0YWJpbGl6ZSgpO1xuICAgIGNvbnN0IGVsZW1lbnRQcm90b3R5cGUgPSBFbGVtZW50LnByb3RvdHlwZSBhcyBhbnk7XG4gICAgcmV0dXJuIChlbGVtZW50UHJvdG90eXBlWydtYXRjaGVzJ10gfHwgZWxlbWVudFByb3RvdHlwZVsnbXNNYXRjaGVzU2VsZWN0b3InXSlcbiAgICAgICAgLmNhbGwodGhpcy5lbGVtZW50LCBzZWxlY3Rvcik7XG4gIH1cblxuICAvKiogQ2hlY2tzIHdoZXRoZXIgdGhlIGVsZW1lbnQgaXMgZm9jdXNlZC4gKi9cbiAgYXN5bmMgaXNGb2N1c2VkKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGF3YWl0IHRoaXMuX3N0YWJpbGl6ZSgpO1xuICAgIHJldHVybiBkb2N1bWVudC5hY3RpdmVFbGVtZW50ID09PSB0aGlzLmVsZW1lbnQ7XG4gIH1cblxuICAvKipcbiAgICogRGlzcGF0Y2hlcyBhbiBldmVudCB3aXRoIGEgcGFydGljdWxhciBuYW1lLlxuICAgKiBAcGFyYW0gbmFtZSBOYW1lIG9mIHRoZSBldmVudCB0byBiZSBkaXNwYXRjaGVkLlxuICAgKi9cbiAgYXN5bmMgZGlzcGF0Y2hFdmVudChuYW1lOiBzdHJpbmcsIGRhdGE/OiBSZWNvcmQ8c3RyaW5nLCBFdmVudERhdGE+KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgZXZlbnQgPSBjcmVhdGVGYWtlRXZlbnQobmFtZSk7XG5cbiAgICBpZiAoZGF0YSkge1xuICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOmJhbiBIYXZlIHRvIHVzZSBgT2JqZWN0LmFzc2lnbmAgdG8gcHJlc2VydmUgdGhlIG9yaWdpbmFsIG9iamVjdC5cbiAgICAgIE9iamVjdC5hc3NpZ24oZXZlbnQsIGRhdGEpO1xuICAgIH1cblxuICAgIGRpc3BhdGNoRXZlbnQodGhpcy5lbGVtZW50LCBldmVudCk7XG4gICAgYXdhaXQgdGhpcy5fc3RhYmlsaXplKCk7XG4gIH1cblxuICAvKipcbiAgICogRGlzcGF0Y2hlcyBhIHBvaW50ZXIgZXZlbnQgb24gdGhlIGN1cnJlbnQgZWxlbWVudCBpZiB0aGUgYnJvd3NlciBzdXBwb3J0cyBpdC5cbiAgICogQHBhcmFtIG5hbWUgTmFtZSBvZiB0aGUgcG9pbnRlciBldmVudCB0byBiZSBkaXNwYXRjaGVkLlxuICAgKiBAcGFyYW0gY2xpZW50WCBDb29yZGluYXRlIG9mIHRoZSB1c2VyJ3MgcG9pbnRlciBhbG9uZyB0aGUgWCBheGlzLlxuICAgKiBAcGFyYW0gY2xpZW50WSBDb29yZGluYXRlIG9mIHRoZSB1c2VyJ3MgcG9pbnRlciBhbG9uZyB0aGUgWSBheGlzLlxuICAgKiBAcGFyYW0gYnV0dG9uIE1vdXNlIGJ1dHRvbiB0aGF0IHNob3VsZCBiZSBwcmVzc2VkIHdoZW4gZGlzcGF0Y2hpbmcgdGhlIGV2ZW50LlxuICAgKi9cbiAgcHJpdmF0ZSBfZGlzcGF0Y2hQb2ludGVyRXZlbnRJZlN1cHBvcnRlZChcbiAgICBuYW1lOiBzdHJpbmcsIGNsaWVudFg/OiBudW1iZXIsIGNsaWVudFk/OiBudW1iZXIsIGJ1dHRvbj86IG51bWJlcikge1xuICAgIC8vIFRoZSBsYXRlc3QgdmVyc2lvbnMgb2YgYWxsIGJyb3dzZXJzIHdlIHN1cHBvcnQgaGF2ZSB0aGUgbmV3IGBQb2ludGVyRXZlbnRgIEFQSS5cbiAgICAvLyBUaG91Z2ggc2luY2Ugd2UgY2FwdHVyZSB0aGUgdHdvIG1vc3QgcmVjZW50IHZlcnNpb25zIG9mIHRoZXNlIGJyb3dzZXJzLCB3ZSBhbHNvXG4gICAgLy8gbmVlZCB0byBzdXBwb3J0IFNhZmFyaSAxMiBhdCB0aW1lIG9mIHdyaXRpbmcuIFNhZmFyaSAxMiBkb2VzIG5vdCBoYXZlIHN1cHBvcnQgZm9yIHRoaXMsXG4gICAgLy8gc28gd2UgbmVlZCB0byBjb25kaXRpb25hbGx5IGNyZWF0ZSBhbmQgZGlzcGF0Y2ggdGhlc2UgZXZlbnRzIGJhc2VkIG9uIGZlYXR1cmUgZGV0ZWN0aW9uLlxuICAgIGlmICh0eXBlb2YgUG9pbnRlckV2ZW50ICE9PSAndW5kZWZpbmVkJyAmJiBQb2ludGVyRXZlbnQpIHtcbiAgICAgIGRpc3BhdGNoUG9pbnRlckV2ZW50KHRoaXMuZWxlbWVudCwgbmFtZSwgY2xpZW50WCwgY2xpZW50WSwge2lzUHJpbWFyeTogdHJ1ZSwgYnV0dG9ufSk7XG4gICAgfVxuICB9XG5cbiAgLyoqIERpc3BhdGNoZXMgYWxsIHRoZSBldmVudHMgdGhhdCBhcmUgcGFydCBvZiBhIG1vdXNlIGV2ZW50IHNlcXVlbmNlLiAqL1xuICBwcml2YXRlIGFzeW5jIF9kaXNwYXRjaE1vdXNlRXZlbnRTZXF1ZW5jZShcbiAgICBuYW1lOiBzdHJpbmcsXG4gICAgYXJnczogW01vZGlmaWVyS2V5cz9dIHwgWydjZW50ZXInLCBNb2RpZmllcktleXM/XSB8IFtudW1iZXIsIG51bWJlciwgTW9kaWZpZXJLZXlzP10sXG4gICAgYnV0dG9uPzogbnVtYmVyKSB7XG4gICAgbGV0IGNsaWVudFg6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBsZXQgY2xpZW50WTogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIGxldCBtb2RpZmllcnM6IE1vZGlmaWVyS2V5cyA9IHt9O1xuXG4gICAgaWYgKGFyZ3MubGVuZ3RoICYmIHR5cGVvZiBhcmdzW2FyZ3MubGVuZ3RoIC0gMV0gPT09ICdvYmplY3QnKSB7XG4gICAgICBtb2RpZmllcnMgPSBhcmdzLnBvcCgpIGFzIE1vZGlmaWVyS2V5cztcbiAgICB9XG5cbiAgICBpZiAoYXJncy5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IHtsZWZ0LCB0b3AsIHdpZHRoLCBoZWlnaHR9ID0gYXdhaXQgdGhpcy5nZXREaW1lbnNpb25zKCk7XG4gICAgICBjb25zdCByZWxhdGl2ZVggPSBhcmdzWzBdID09PSAnY2VudGVyJyA/IHdpZHRoIC8gMiA6IGFyZ3NbMF0gYXMgbnVtYmVyO1xuICAgICAgY29uc3QgcmVsYXRpdmVZID0gYXJnc1swXSA9PT0gJ2NlbnRlcicgPyBoZWlnaHQgLyAyIDogYXJnc1sxXSBhcyBudW1iZXI7XG5cbiAgICAgIC8vIFJvdW5kIHRoZSBjb21wdXRlZCBjbGljayBwb3NpdGlvbiBhcyBkZWNpbWFsIHBpeGVscyBhcmUgbm90XG4gICAgICAvLyBzdXBwb3J0ZWQgYnkgbW91c2UgZXZlbnRzIGFuZCBjb3VsZCBsZWFkIHRvIHVuZXhwZWN0ZWQgcmVzdWx0cy5cbiAgICAgIGNsaWVudFggPSBNYXRoLnJvdW5kKGxlZnQgKyByZWxhdGl2ZVgpO1xuICAgICAgY2xpZW50WSA9IE1hdGgucm91bmQodG9wICsgcmVsYXRpdmVZKTtcbiAgICB9XG5cbiAgICB0aGlzLl9kaXNwYXRjaFBvaW50ZXJFdmVudElmU3VwcG9ydGVkKCdwb2ludGVyZG93bicsIGNsaWVudFgsIGNsaWVudFksIGJ1dHRvbik7XG4gICAgZGlzcGF0Y2hNb3VzZUV2ZW50KHRoaXMuZWxlbWVudCwgJ21vdXNlZG93bicsIGNsaWVudFgsIGNsaWVudFksIGJ1dHRvbiwgbW9kaWZpZXJzKTtcbiAgICB0aGlzLl9kaXNwYXRjaFBvaW50ZXJFdmVudElmU3VwcG9ydGVkKCdwb2ludGVydXAnLCBjbGllbnRYLCBjbGllbnRZLCBidXR0b24pO1xuICAgIGRpc3BhdGNoTW91c2VFdmVudCh0aGlzLmVsZW1lbnQsICdtb3VzZXVwJywgY2xpZW50WCwgY2xpZW50WSwgYnV0dG9uLCBtb2RpZmllcnMpO1xuICAgIGRpc3BhdGNoTW91c2VFdmVudCh0aGlzLmVsZW1lbnQsIG5hbWUsIGNsaWVudFgsIGNsaWVudFksIGJ1dHRvbiwgbW9kaWZpZXJzKTtcblxuICAgIC8vIFRoaXMgY2FsbCB0byBfc3RhYmlsaXplIHNob3VsZCBub3QgYmUgbmVlZGVkIHNpbmNlIHRoZSBjYWxsZXJzIHdpbGwgYWxyZWFkeSBkbyB0aGF0IHRoZW0tXG4gICAgLy8gc2VsdmVzLiBOZXZlcnRoZWxlc3MgaXQgYnJlYWtzIHNvbWUgdGVzdHMgaW4gZzMgd2l0aG91dCBpdC4gSXQgbmVlZHMgdG8gYmUgaW52ZXN0aWdhdGVkXG4gICAgLy8gd2h5IHJlbW92aW5nIGJyZWFrcyB0aG9zZSB0ZXN0cy5cbiAgICBhd2FpdCB0aGlzLl9zdGFiaWxpemUoKTtcbiAgfVxufVxuIl19