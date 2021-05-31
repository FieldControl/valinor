/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { _getTextWithExcludedElements, TestKey, } from '@angular/cdk/testing';
import { browser, Button, by, Key } from 'protractor';
/** Maps the `TestKey` constants to Protractor's `Key` constants. */
const keyMap = {
    [TestKey.BACKSPACE]: Key.BACK_SPACE,
    [TestKey.TAB]: Key.TAB,
    [TestKey.ENTER]: Key.ENTER,
    [TestKey.SHIFT]: Key.SHIFT,
    [TestKey.CONTROL]: Key.CONTROL,
    [TestKey.ALT]: Key.ALT,
    [TestKey.ESCAPE]: Key.ESCAPE,
    [TestKey.PAGE_UP]: Key.PAGE_UP,
    [TestKey.PAGE_DOWN]: Key.PAGE_DOWN,
    [TestKey.END]: Key.END,
    [TestKey.HOME]: Key.HOME,
    [TestKey.LEFT_ARROW]: Key.ARROW_LEFT,
    [TestKey.UP_ARROW]: Key.ARROW_UP,
    [TestKey.RIGHT_ARROW]: Key.ARROW_RIGHT,
    [TestKey.DOWN_ARROW]: Key.ARROW_DOWN,
    [TestKey.INSERT]: Key.INSERT,
    [TestKey.DELETE]: Key.DELETE,
    [TestKey.F1]: Key.F1,
    [TestKey.F2]: Key.F2,
    [TestKey.F3]: Key.F3,
    [TestKey.F4]: Key.F4,
    [TestKey.F5]: Key.F5,
    [TestKey.F6]: Key.F6,
    [TestKey.F7]: Key.F7,
    [TestKey.F8]: Key.F8,
    [TestKey.F9]: Key.F9,
    [TestKey.F10]: Key.F10,
    [TestKey.F11]: Key.F11,
    [TestKey.F12]: Key.F12,
    [TestKey.META]: Key.META
};
/** Converts a `ModifierKeys` object to a list of Protractor `Key`s. */
function toProtractorModifierKeys(modifiers) {
    const result = [];
    if (modifiers.control) {
        result.push(Key.CONTROL);
    }
    if (modifiers.alt) {
        result.push(Key.ALT);
    }
    if (modifiers.shift) {
        result.push(Key.SHIFT);
    }
    if (modifiers.meta) {
        result.push(Key.META);
    }
    return result;
}
/**
 * A `TestElement` implementation for Protractor.
 * @deprecated
 * @breaking-change 13.0.0
 */
export class ProtractorElement {
    constructor(element) {
        this.element = element;
    }
    /** Blur the element. */
    blur() {
        return __awaiter(this, void 0, void 0, function* () {
            return browser.executeScript('arguments[0].blur()', this.element);
        });
    }
    /** Clear the element's input (for input and textarea elements only). */
    clear() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.element.clear();
        });
    }
    click(...args) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._dispatchClickEventSequence(args, Button.LEFT);
        });
    }
    rightClick(...args) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._dispatchClickEventSequence(args, Button.RIGHT);
        });
    }
    /** Focus the element. */
    focus() {
        return __awaiter(this, void 0, void 0, function* () {
            return browser.executeScript('arguments[0].focus()', this.element);
        });
    }
    /** Get the computed value of the given CSS property for the element. */
    getCssValue(property) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.element.getCssValue(property);
        });
    }
    /** Hovers the mouse over the element. */
    hover() {
        return __awaiter(this, void 0, void 0, function* () {
            return browser.actions()
                .mouseMove(yield this.element.getWebElement())
                .perform();
        });
    }
    /** Moves the mouse away from the element. */
    mouseAway() {
        return __awaiter(this, void 0, void 0, function* () {
            return browser.actions()
                .mouseMove(yield this.element.getWebElement(), { x: -1, y: -1 })
                .perform();
        });
    }
    sendKeys(...modifiersAndKeys) {
        return __awaiter(this, void 0, void 0, function* () {
            const first = modifiersAndKeys[0];
            let modifiers;
            let rest;
            if (typeof first !== 'string' && typeof first !== 'number') {
                modifiers = first;
                rest = modifiersAndKeys.slice(1);
            }
            else {
                modifiers = {};
                rest = modifiersAndKeys;
            }
            const modifierKeys = toProtractorModifierKeys(modifiers);
            const keys = rest.map(k => typeof k === 'string' ? k.split('') : [keyMap[k]])
                .reduce((arr, k) => arr.concat(k), [])
                // Key.chord doesn't work well with geckodriver (mozilla/geckodriver#1502),
                // so avoid it if no modifier keys are required.
                .map(k => modifierKeys.length > 0 ? Key.chord(...modifierKeys, k) : k);
            return this.element.sendKeys(...keys);
        });
    }
    /**
     * Gets the text from the element.
     * @param options Options that affect what text is included.
     */
    text(options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (options === null || options === void 0 ? void 0 : options.exclude) {
                return browser.executeScript(_getTextWithExcludedElements, this.element, options.exclude);
            }
            return this.element.getText();
        });
    }
    /** Gets the value for the given attribute from the element. */
    getAttribute(name) {
        return __awaiter(this, void 0, void 0, function* () {
            return browser.executeScript(`return arguments[0].getAttribute(arguments[1])`, this.element, name);
        });
    }
    /** Checks whether the element has the given class. */
    hasClass(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const classes = (yield this.getAttribute('class')) || '';
            return new Set(classes.split(/\s+/).filter(c => c)).has(name);
        });
    }
    /** Gets the dimensions of the element. */
    getDimensions() {
        return __awaiter(this, void 0, void 0, function* () {
            const { width, height } = yield this.element.getSize();
            const { x: left, y: top } = yield this.element.getLocation();
            return { width, height, left, top };
        });
    }
    /** Gets the value of a property of an element. */
    getProperty(name) {
        return __awaiter(this, void 0, void 0, function* () {
            return browser.executeScript(`return arguments[0][arguments[1]]`, this.element, name);
        });
    }
    /** Sets the value of a property of an input. */
    setInputValue(value) {
        return __awaiter(this, void 0, void 0, function* () {
            return browser.executeScript(`arguments[0].value = arguments[1]`, this.element, value);
        });
    }
    /** Selects the options at the specified indexes inside of a native `select` element. */
    selectOptions(...optionIndexes) {
        return __awaiter(this, void 0, void 0, function* () {
            const options = yield this.element.all(by.css('option'));
            const indexes = new Set(optionIndexes); // Convert to a set to remove duplicates.
            if (options.length && indexes.size) {
                // Reset the value so all the selected states are cleared. We can
                // reuse the input-specific method since the logic is the same.
                yield this.setInputValue('');
                for (let i = 0; i < options.length; i++) {
                    if (indexes.has(i)) {
                        // We have to hold the control key while clicking on options so that multiple can be
                        // selected in multi-selection mode. The key doesn't do anything for single selection.
                        yield browser.actions().keyDown(Key.CONTROL).perform();
                        yield options[i].click();
                        yield browser.actions().keyUp(Key.CONTROL).perform();
                    }
                }
            }
        });
    }
    /** Checks whether this element matches the given selector. */
    matchesSelector(selector) {
        return __awaiter(this, void 0, void 0, function* () {
            return browser.executeScript(`
          return (Element.prototype.matches ||
                  Element.prototype.msMatchesSelector).call(arguments[0], arguments[1])
          `, this.element, selector);
        });
    }
    /** Checks whether the element is focused. */
    isFocused() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.element.equals(browser.driver.switchTo().activeElement());
        });
    }
    /**
     * Dispatches an event with a particular name.
     * @param name Name of the event to be dispatched.
     */
    dispatchEvent(name, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return browser.executeScript(_dispatchEvent, name, this.element, data);
        });
    }
    /** Dispatches all the events that are part of a click event sequence. */
    _dispatchClickEventSequence(args, button) {
        return __awaiter(this, void 0, void 0, function* () {
            let modifiers = {};
            if (args.length && typeof args[args.length - 1] === 'object') {
                modifiers = args.pop();
            }
            const modifierKeys = toProtractorModifierKeys(modifiers);
            // Omitting the offset argument to mouseMove results in clicking the center.
            // This is the default behavior we want, so we use an empty array of offsetArgs if
            // no args remain after popping the modifiers from the args passed to this function.
            const offsetArgs = (args.length === 2 ?
                [{ x: args[0], y: args[1] }] : []);
            let actions = browser.actions()
                .mouseMove(yield this.element.getWebElement(), ...offsetArgs);
            for (const modifierKey of modifierKeys) {
                actions = actions.keyDown(modifierKey);
            }
            actions = actions.click(button);
            for (const modifierKey of modifierKeys) {
                actions = actions.keyUp(modifierKey);
            }
            yield actions.perform();
        });
    }
}
/**
 * Dispatches an event with a particular name and data to an element.
 * Note that this needs to be a pure function, because it gets stringified by
 * Protractor and is executed inside the browser.
 */
function _dispatchEvent(name, element, data) {
    const event = document.createEvent('Event');
    event.initEvent(name);
    if (data) {
        // tslint:disable-next-line:ban Have to use `Object.assign` to preserve the original object.
        Object.assign(event, data);
    }
    // This type has a string index signature, so we cannot access it using a dotted property access.
    element['dispatchEvent'](event);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvdHJhY3Rvci1lbGVtZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay90ZXN0aW5nL3Byb3RyYWN0b3IvcHJvdHJhY3Rvci1lbGVtZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFFSCxPQUFPLEVBQ0wsNEJBQTRCLEVBSTVCLE9BQU8sR0FHUixNQUFNLHNCQUFzQixDQUFDO0FBQzlCLE9BQU8sRUFBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBaUIsR0FBRyxFQUFDLE1BQU0sWUFBWSxDQUFDO0FBRW5FLG9FQUFvRTtBQUNwRSxNQUFNLE1BQU0sR0FBRztJQUNiLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxVQUFVO0lBQ25DLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxHQUFHO0lBQ3RCLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFLEdBQUcsQ0FBQyxLQUFLO0lBQzFCLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFLEdBQUcsQ0FBQyxLQUFLO0lBQzFCLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLEdBQUcsQ0FBQyxPQUFPO0lBQzlCLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxHQUFHO0lBQ3RCLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEdBQUcsQ0FBQyxNQUFNO0lBQzVCLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLEdBQUcsQ0FBQyxPQUFPO0lBQzlCLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxTQUFTO0lBQ2xDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxHQUFHO0lBQ3RCLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxJQUFJO0lBQ3hCLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxVQUFVO0lBQ3BDLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxRQUFRO0lBQ2hDLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxXQUFXO0lBQ3RDLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxVQUFVO0lBQ3BDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEdBQUcsQ0FBQyxNQUFNO0lBQzVCLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEdBQUcsQ0FBQyxNQUFNO0lBQzVCLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFO0lBQ3BCLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFO0lBQ3BCLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFO0lBQ3BCLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFO0lBQ3BCLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFO0lBQ3BCLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFO0lBQ3BCLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFO0lBQ3BCLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFO0lBQ3BCLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFO0lBQ3BCLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxHQUFHO0lBQ3RCLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxHQUFHO0lBQ3RCLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FB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TUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRSxFQUFFLEdBQUcsVUFBVSxDQUFDLENBQUM7WUFFaEUsS0FBSyxNQUFNLFdBQVcsSUFBSSxZQUFZLEVBQUU7Z0JBQ3RDLE9BQU8sR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO2FBQ3hDO1lBQ0QsT0FBTyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDaEMsS0FBSyxNQUFNLFdBQVcsSUFBSSxZQUFZLEVBQUU7Z0JBQ3RDLE9BQU8sR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDO2FBQ3RDO1lBRUQsTUFBTSxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDMUIsQ0FBQztLQUFBO0NBQ0Y7QUFFRDs7OztHQUlHO0FBQ0gsU0FBUyxjQUFjLENBQUMsSUFBWSxFQUFFLE9BQXNCLEVBQUUsSUFBZ0M7SUFDNUYsTUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUM1QyxLQUFLLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBRXRCLElBQUksSUFBSSxFQUFFO1FBQ1IsNEZBQTRGO1FBQzVGLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO0tBQzVCO0lBRUQsaUdBQWlHO0lBQ2pHLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNsQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7XG4gIF9nZXRUZXh0V2l0aEV4Y2x1ZGVkRWxlbWVudHMsXG4gIEVsZW1lbnREaW1lbnNpb25zLFxuICBNb2RpZmllcktleXMsXG4gIFRlc3RFbGVtZW50LFxuICBUZXN0S2V5LFxuICBUZXh0T3B0aW9ucyxcbiAgRXZlbnREYXRhLFxufSBmcm9tICdAYW5ndWxhci9jZGsvdGVzdGluZyc7XG5pbXBvcnQge2Jyb3dzZXIsIEJ1dHRvbiwgYnksIEVsZW1lbnRGaW5kZXIsIEtleX0gZnJvbSAncHJvdHJhY3Rvcic7XG5cbi8qKiBNYXBzIHRoZSBgVGVzdEtleWAgY29uc3RhbnRzIHRvIFByb3RyYWN0b3IncyBgS2V5YCBjb25zdGFudHMuICovXG5jb25zdCBrZXlNYXAgPSB7XG4gIFtUZXN0S2V5LkJBQ0tTUEFDRV06IEtleS5CQUNLX1NQQUNFLFxuICBbVGVzdEtleS5UQUJdOiBLZXkuVEFCLFxuICBbVGVzdEtleS5FTlRFUl06IEtleS5FTlRFUixcbiAgW1Rlc3RLZXkuU0hJRlRdOiBLZXkuU0hJRlQsXG4gIFtUZXN0S2V5LkNPTlRST0xdOiBLZXkuQ09OVFJPTCxcbiAgW1Rlc3RLZXkuQUxUXTogS2V5LkFMVCxcbiAgW1Rlc3RLZXkuRVNDQVBFXTogS2V5LkVTQ0FQRSxcbiAgW1Rlc3RLZXkuUEFHRV9VUF06IEtleS5QQUdFX1VQLFxuICBbVGVzdEtleS5QQUdFX0RPV05dOiBLZXkuUEFHRV9ET1dOLFxuICBbVGVzdEtleS5FTkRdOiBLZXkuRU5ELFxuICBbVGVzdEtleS5IT01FXTogS2V5LkhPTUUsXG4gIFtUZXN0S2V5LkxFRlRfQVJST1ddOiBLZXkuQVJST1dfTEVGVCxcbiAgW1Rlc3RLZXkuVVBfQVJST1ddOiBLZXkuQVJST1dfVVAsXG4gIFtUZXN0S2V5LlJJR0hUX0FSUk9XXTogS2V5LkFSUk9XX1JJR0hULFxuICBbVGVzdEtleS5ET1dOX0FSUk9XXTogS2V5LkFSUk9XX0RPV04sXG4gIFtUZXN0S2V5LklOU0VSVF06IEtleS5JTlNFUlQsXG4gIFtUZXN0S2V5LkRFTEVURV06IEtleS5ERUxFVEUsXG4gIFtUZXN0S2V5LkYxXTogS2V5LkYxLFxuICBbVGVzdEtleS5GMl06IEtleS5GMixcbiAgW1Rlc3RLZXkuRjNdOiBLZXkuRjMsXG4gIFtUZXN0S2V5LkY0XTogS2V5LkY0LFxuICBbVGVzdEtleS5GNV06IEtleS5GNSxcbiAgW1Rlc3RLZXkuRjZdOiBLZXkuRjYsXG4gIFtUZXN0S2V5LkY3XTogS2V5LkY3LFxuICBbVGVzdEtleS5GOF06IEtleS5GOCxcbiAgW1Rlc3RLZXkuRjldOiBLZXkuRjksXG4gIFtUZXN0S2V5LkYxMF06IEtleS5GMTAsXG4gIFtUZXN0S2V5LkYxMV06IEtleS5GMTEsXG4gIFtUZXN0S2V5LkYxMl06IEtleS5GMTIsXG4gIFtUZXN0S2V5Lk1FVEFdOiBLZXkuTUVUQVxufTtcblxuLyoqIENvbnZlcnRzIGEgYE1vZGlmaWVyS2V5c2Agb2JqZWN0IHRvIGEgbGlzdCBvZiBQcm90cmFjdG9yIGBLZXlgcy4gKi9cbmZ1bmN0aW9uIHRvUHJvdHJhY3Rvck1vZGlmaWVyS2V5cyhtb2RpZmllcnM6IE1vZGlmaWVyS2V5cyk6IHN0cmluZ1tdIHtcbiAgY29uc3QgcmVzdWx0OiBzdHJpbmdbXSA9IFtdO1xuICBpZiAobW9kaWZpZXJzLmNvbnRyb2wpIHtcbiAgICByZXN1bHQucHVzaChLZXkuQ09OVFJPTCk7XG4gIH1cbiAgaWYgKG1vZGlmaWVycy5hbHQpIHtcbiAgICByZXN1bHQucHVzaChLZXkuQUxUKTtcbiAgfVxuICBpZiAobW9kaWZpZXJzLnNoaWZ0KSB7XG4gICAgcmVzdWx0LnB1c2goS2V5LlNISUZUKTtcbiAgfVxuICBpZiAobW9kaWZpZXJzLm1ldGEpIHtcbiAgICByZXN1bHQucHVzaChLZXkuTUVUQSk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBBIGBUZXN0RWxlbWVudGAgaW1wbGVtZW50YXRpb24gZm9yIFByb3RyYWN0b3IuXG4gKiBAZGVwcmVjYXRlZFxuICogQGJyZWFraW5nLWNoYW5nZSAxMy4wLjBcbiAqL1xuZXhwb3J0IGNsYXNzIFByb3RyYWN0b3JFbGVtZW50IGltcGxlbWVudHMgVGVzdEVsZW1lbnQge1xuICBjb25zdHJ1Y3RvcihyZWFkb25seSBlbGVtZW50OiBFbGVtZW50RmluZGVyKSB7fVxuXG4gIC8qKiBCbHVyIHRoZSBlbGVtZW50LiAqL1xuICBhc3luYyBibHVyKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiBicm93c2VyLmV4ZWN1dGVTY3JpcHQoJ2FyZ3VtZW50c1swXS5ibHVyKCknLCB0aGlzLmVsZW1lbnQpO1xuICB9XG5cbiAgLyoqIENsZWFyIHRoZSBlbGVtZW50J3MgaW5wdXQgKGZvciBpbnB1dCBhbmQgdGV4dGFyZWEgZWxlbWVudHMgb25seSkuICovXG4gIGFzeW5jIGNsZWFyKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiB0aGlzLmVsZW1lbnQuY2xlYXIoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbGljayB0aGUgZWxlbWVudCBhdCB0aGUgZGVmYXVsdCBsb2NhdGlvbiBmb3IgdGhlIGN1cnJlbnQgZW52aXJvbm1lbnQuIElmIHlvdSBuZWVkIHRvIGd1YXJhbnRlZVxuICAgKiB0aGUgZWxlbWVudCBpcyBjbGlja2VkIGF0IGEgc3BlY2lmaWMgbG9jYXRpb24sIGNvbnNpZGVyIHVzaW5nIGBjbGljaygnY2VudGVyJylgIG9yXG4gICAqIGBjbGljayh4LCB5KWAgaW5zdGVhZC5cbiAgICovXG4gIGNsaWNrKG1vZGlmaWVycz86IE1vZGlmaWVyS2V5cyk6IFByb21pc2U8dm9pZD47XG4gIC8qKiBDbGljayB0aGUgZWxlbWVudCBhdCB0aGUgZWxlbWVudCdzIGNlbnRlci4gKi9cbiAgY2xpY2sobG9jYXRpb246ICdjZW50ZXInLCBtb2RpZmllcnM/OiBNb2RpZmllcktleXMpOiBQcm9taXNlPHZvaWQ+O1xuICAvKipcbiAgICogQ2xpY2sgdGhlIGVsZW1lbnQgYXQgdGhlIHNwZWNpZmllZCBjb29yZGluYXRlcyByZWxhdGl2ZSB0byB0aGUgdG9wLWxlZnQgb2YgdGhlIGVsZW1lbnQuXG4gICAqIEBwYXJhbSByZWxhdGl2ZVggQ29vcmRpbmF0ZSB3aXRoaW4gdGhlIGVsZW1lbnQsIGFsb25nIHRoZSBYLWF4aXMgYXQgd2hpY2ggdG8gY2xpY2suXG4gICAqIEBwYXJhbSByZWxhdGl2ZVkgQ29vcmRpbmF0ZSB3aXRoaW4gdGhlIGVsZW1lbnQsIGFsb25nIHRoZSBZLWF4aXMgYXQgd2hpY2ggdG8gY2xpY2suXG4gICAqIEBwYXJhbSBtb2RpZmllcnMgTW9kaWZpZXIga2V5cyBoZWxkIHdoaWxlIGNsaWNraW5nXG4gICAqL1xuICBjbGljayhyZWxhdGl2ZVg6IG51bWJlciwgcmVsYXRpdmVZOiBudW1iZXIsIG1vZGlmaWVycz86IE1vZGlmaWVyS2V5cyk6IFByb21pc2U8dm9pZD47XG4gIGFzeW5jIGNsaWNrKC4uLmFyZ3M6IFtNb2RpZmllcktleXM/XSB8IFsnY2VudGVyJywgTW9kaWZpZXJLZXlzP10gfFxuICAgIFtudW1iZXIsIG51bWJlciwgTW9kaWZpZXJLZXlzP10pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLl9kaXNwYXRjaENsaWNrRXZlbnRTZXF1ZW5jZShhcmdzLCBCdXR0b24uTEVGVCk7XG4gIH1cblxuICAvKipcbiAgICogUmlnaHQgY2xpY2tzIG9uIHRoZSBlbGVtZW50IGF0IHRoZSBzcGVjaWZpZWQgY29vcmRpbmF0ZXMgcmVsYXRpdmUgdG8gdGhlIHRvcC1sZWZ0IG9mIGl0LlxuICAgKiBAcGFyYW0gcmVsYXRpdmVYIENvb3JkaW5hdGUgd2l0aGluIHRoZSBlbGVtZW50LCBhbG9uZyB0aGUgWC1heGlzIGF0IHdoaWNoIHRvIGNsaWNrLlxuICAgKiBAcGFyYW0gcmVsYXRpdmVZIENvb3JkaW5hdGUgd2l0aGluIHRoZSBlbGVtZW50LCBhbG9uZyB0aGUgWS1heGlzIGF0IHdoaWNoIHRvIGNsaWNrLlxuICAgKiBAcGFyYW0gbW9kaWZpZXJzIE1vZGlmaWVyIGtleXMgaGVsZCB3aGlsZSBjbGlja2luZ1xuICAgKi9cbiAgcmlnaHRDbGljayhyZWxhdGl2ZVg6IG51bWJlciwgcmVsYXRpdmVZOiBudW1iZXIsIG1vZGlmaWVycz86IE1vZGlmaWVyS2V5cyk6IFByb21pc2U8dm9pZD47XG4gIGFzeW5jIHJpZ2h0Q2xpY2soLi4uYXJnczogW01vZGlmaWVyS2V5cz9dIHwgWydjZW50ZXInLCBNb2RpZmllcktleXM/XSB8XG4gICAgW251bWJlciwgbnVtYmVyLCBNb2RpZmllcktleXM/XSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMuX2Rpc3BhdGNoQ2xpY2tFdmVudFNlcXVlbmNlKGFyZ3MsIEJ1dHRvbi5SSUdIVCk7XG4gIH1cblxuICAvKiogRm9jdXMgdGhlIGVsZW1lbnQuICovXG4gIGFzeW5jIGZvY3VzKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiBicm93c2VyLmV4ZWN1dGVTY3JpcHQoJ2FyZ3VtZW50c1swXS5mb2N1cygpJywgdGhpcy5lbGVtZW50KTtcbiAgfVxuXG4gIC8qKiBHZXQgdGhlIGNvbXB1dGVkIHZhbHVlIG9mIHRoZSBnaXZlbiBDU1MgcHJvcGVydHkgZm9yIHRoZSBlbGVtZW50LiAqL1xuICBhc3luYyBnZXRDc3NWYWx1ZShwcm9wZXJ0eTogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50LmdldENzc1ZhbHVlKHByb3BlcnR5KTtcbiAgfVxuXG4gIC8qKiBIb3ZlcnMgdGhlIG1vdXNlIG92ZXIgdGhlIGVsZW1lbnQuICovXG4gIGFzeW5jIGhvdmVyKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiBicm93c2VyLmFjdGlvbnMoKVxuICAgICAgICAubW91c2VNb3ZlKGF3YWl0IHRoaXMuZWxlbWVudC5nZXRXZWJFbGVtZW50KCkpXG4gICAgICAgIC5wZXJmb3JtKCk7XG4gIH1cblxuICAvKiogTW92ZXMgdGhlIG1vdXNlIGF3YXkgZnJvbSB0aGUgZWxlbWVudC4gKi9cbiAgYXN5bmMgbW91c2VBd2F5KCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiBicm93c2VyLmFjdGlvbnMoKVxuICAgICAgICAubW91c2VNb3ZlKGF3YWl0IHRoaXMuZWxlbWVudC5nZXRXZWJFbGVtZW50KCksIHt4OiAtMSwgeTogLTF9KVxuICAgICAgICAucGVyZm9ybSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlbmRzIHRoZSBnaXZlbiBzdHJpbmcgdG8gdGhlIGlucHV0IGFzIGEgc2VyaWVzIG9mIGtleSBwcmVzc2VzLiBBbHNvIGZpcmVzIGlucHV0IGV2ZW50c1xuICAgKiBhbmQgYXR0ZW1wdHMgdG8gYWRkIHRoZSBzdHJpbmcgdG8gdGhlIEVsZW1lbnQncyB2YWx1ZS5cbiAgICovXG4gIGFzeW5jIHNlbmRLZXlzKC4uLmtleXM6IChzdHJpbmcgfCBUZXN0S2V5KVtdKTogUHJvbWlzZTx2b2lkPjtcbiAgLyoqXG4gICAqIFNlbmRzIHRoZSBnaXZlbiBzdHJpbmcgdG8gdGhlIGlucHV0IGFzIGEgc2VyaWVzIG9mIGtleSBwcmVzc2VzLiBBbHNvIGZpcmVzIGlucHV0IGV2ZW50c1xuICAgKiBhbmQgYXR0ZW1wdHMgdG8gYWRkIHRoZSBzdHJpbmcgdG8gdGhlIEVsZW1lbnQncyB2YWx1ZS5cbiAgICovXG4gIGFzeW5jIHNlbmRLZXlzKG1vZGlmaWVyczogTW9kaWZpZXJLZXlzLCAuLi5rZXlzOiAoc3RyaW5nIHwgVGVzdEtleSlbXSk6IFByb21pc2U8dm9pZD47XG4gIGFzeW5jIHNlbmRLZXlzKC4uLm1vZGlmaWVyc0FuZEtleXM6IGFueVtdKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgZmlyc3QgPSBtb2RpZmllcnNBbmRLZXlzWzBdO1xuICAgIGxldCBtb2RpZmllcnM6IE1vZGlmaWVyS2V5cztcbiAgICBsZXQgcmVzdDogKHN0cmluZyB8IFRlc3RLZXkpW107XG4gICAgaWYgKHR5cGVvZiBmaXJzdCAhPT0gJ3N0cmluZycgJiYgdHlwZW9mIGZpcnN0ICE9PSAnbnVtYmVyJykge1xuICAgICAgbW9kaWZpZXJzID0gZmlyc3Q7XG4gICAgICByZXN0ID0gbW9kaWZpZXJzQW5kS2V5cy5zbGljZSgxKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbW9kaWZpZXJzID0ge307XG4gICAgICByZXN0ID0gbW9kaWZpZXJzQW5kS2V5cztcbiAgICB9XG5cbiAgICBjb25zdCBtb2RpZmllcktleXMgPSB0b1Byb3RyYWN0b3JNb2RpZmllcktleXMobW9kaWZpZXJzKTtcbiAgICBjb25zdCBrZXlzID0gcmVzdC5tYXAoayA9PiB0eXBlb2YgayA9PT0gJ3N0cmluZycgPyBrLnNwbGl0KCcnKSA6IFtrZXlNYXBba11dKVxuICAgICAgICAucmVkdWNlKChhcnIsIGspID0+IGFyci5jb25jYXQoayksIFtdKVxuICAgICAgICAvLyBLZXkuY2hvcmQgZG9lc24ndCB3b3JrIHdlbGwgd2l0aCBnZWNrb2RyaXZlciAobW96aWxsYS9nZWNrb2RyaXZlciMxNTAyKSxcbiAgICAgICAgLy8gc28gYXZvaWQgaXQgaWYgbm8gbW9kaWZpZXIga2V5cyBhcmUgcmVxdWlyZWQuXG4gICAgICAgIC5tYXAoayA9PiBtb2RpZmllcktleXMubGVuZ3RoID4gMCA/IEtleS5jaG9yZCguLi5tb2RpZmllcktleXMsIGspIDogayk7XG5cbiAgICByZXR1cm4gdGhpcy5lbGVtZW50LnNlbmRLZXlzKC4uLmtleXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIHRleHQgZnJvbSB0aGUgZWxlbWVudC5cbiAgICogQHBhcmFtIG9wdGlvbnMgT3B0aW9ucyB0aGF0IGFmZmVjdCB3aGF0IHRleHQgaXMgaW5jbHVkZWQuXG4gICAqL1xuICBhc3luYyB0ZXh0KG9wdGlvbnM/OiBUZXh0T3B0aW9ucyk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgaWYgKG9wdGlvbnM/LmV4Y2x1ZGUpIHtcbiAgICAgIHJldHVybiBicm93c2VyLmV4ZWN1dGVTY3JpcHQoX2dldFRleHRXaXRoRXhjbHVkZWRFbGVtZW50cywgdGhpcy5lbGVtZW50LCBvcHRpb25zLmV4Y2x1ZGUpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5lbGVtZW50LmdldFRleHQoKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSB2YWx1ZSBmb3IgdGhlIGdpdmVuIGF0dHJpYnV0ZSBmcm9tIHRoZSBlbGVtZW50LiAqL1xuICBhc3luYyBnZXRBdHRyaWJ1dGUobmFtZTogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmd8bnVsbD4ge1xuICAgIHJldHVybiBicm93c2VyLmV4ZWN1dGVTY3JpcHQoXG4gICAgICAgIGByZXR1cm4gYXJndW1lbnRzWzBdLmdldEF0dHJpYnV0ZShhcmd1bWVudHNbMV0pYCwgdGhpcy5lbGVtZW50LCBuYW1lKTtcbiAgfVxuXG4gIC8qKiBDaGVja3Mgd2hldGhlciB0aGUgZWxlbWVudCBoYXMgdGhlIGdpdmVuIGNsYXNzLiAqL1xuICBhc3luYyBoYXNDbGFzcyhuYW1lOiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCBjbGFzc2VzID0gKGF3YWl0IHRoaXMuZ2V0QXR0cmlidXRlKCdjbGFzcycpKSB8fCAnJztcbiAgICByZXR1cm4gbmV3IFNldChjbGFzc2VzLnNwbGl0KC9cXHMrLykuZmlsdGVyKGMgPT4gYykpLmhhcyhuYW1lKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBkaW1lbnNpb25zIG9mIHRoZSBlbGVtZW50LiAqL1xuICBhc3luYyBnZXREaW1lbnNpb25zKCk6IFByb21pc2U8RWxlbWVudERpbWVuc2lvbnM+IHtcbiAgICBjb25zdCB7d2lkdGgsIGhlaWdodH0gPSBhd2FpdCB0aGlzLmVsZW1lbnQuZ2V0U2l6ZSgpO1xuICAgIGNvbnN0IHt4OiBsZWZ0LCB5OiB0b3B9ID0gYXdhaXQgdGhpcy5lbGVtZW50LmdldExvY2F0aW9uKCk7XG4gICAgcmV0dXJuIHt3aWR0aCwgaGVpZ2h0LCBsZWZ0LCB0b3B9O1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIHZhbHVlIG9mIGEgcHJvcGVydHkgb2YgYW4gZWxlbWVudC4gKi9cbiAgYXN5bmMgZ2V0UHJvcGVydHkobmFtZTogc3RyaW5nKTogUHJvbWlzZTxhbnk+IHtcbiAgICByZXR1cm4gYnJvd3Nlci5leGVjdXRlU2NyaXB0KGByZXR1cm4gYXJndW1lbnRzWzBdW2FyZ3VtZW50c1sxXV1gLCB0aGlzLmVsZW1lbnQsIG5hbWUpO1xuICB9XG5cbiAgLyoqIFNldHMgdGhlIHZhbHVlIG9mIGEgcHJvcGVydHkgb2YgYW4gaW5wdXQuICovXG4gIGFzeW5jIHNldElucHV0VmFsdWUodmFsdWU6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiBicm93c2VyLmV4ZWN1dGVTY3JpcHQoYGFyZ3VtZW50c1swXS52YWx1ZSA9IGFyZ3VtZW50c1sxXWAsIHRoaXMuZWxlbWVudCwgdmFsdWUpO1xuICB9XG5cbiAgLyoqIFNlbGVjdHMgdGhlIG9wdGlvbnMgYXQgdGhlIHNwZWNpZmllZCBpbmRleGVzIGluc2lkZSBvZiBhIG5hdGl2ZSBgc2VsZWN0YCBlbGVtZW50LiAqL1xuICBhc3luYyBzZWxlY3RPcHRpb25zKC4uLm9wdGlvbkluZGV4ZXM6IG51bWJlcltdKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IGF3YWl0IHRoaXMuZWxlbWVudC5hbGwoYnkuY3NzKCdvcHRpb24nKSk7XG4gICAgY29uc3QgaW5kZXhlcyA9IG5ldyBTZXQob3B0aW9uSW5kZXhlcyk7IC8vIENvbnZlcnQgdG8gYSBzZXQgdG8gcmVtb3ZlIGR1cGxpY2F0ZXMuXG5cbiAgICBpZiAob3B0aW9ucy5sZW5ndGggJiYgaW5kZXhlcy5zaXplKSB7XG4gICAgICAvLyBSZXNldCB0aGUgdmFsdWUgc28gYWxsIHRoZSBzZWxlY3RlZCBzdGF0ZXMgYXJlIGNsZWFyZWQuIFdlIGNhblxuICAgICAgLy8gcmV1c2UgdGhlIGlucHV0LXNwZWNpZmljIG1ldGhvZCBzaW5jZSB0aGUgbG9naWMgaXMgdGhlIHNhbWUuXG4gICAgICBhd2FpdCB0aGlzLnNldElucHV0VmFsdWUoJycpO1xuXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG9wdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGluZGV4ZXMuaGFzKGkpKSB7XG4gICAgICAgICAgLy8gV2UgaGF2ZSB0byBob2xkIHRoZSBjb250cm9sIGtleSB3aGlsZSBjbGlja2luZyBvbiBvcHRpb25zIHNvIHRoYXQgbXVsdGlwbGUgY2FuIGJlXG4gICAgICAgICAgLy8gc2VsZWN0ZWQgaW4gbXVsdGktc2VsZWN0aW9uIG1vZGUuIFRoZSBrZXkgZG9lc24ndCBkbyBhbnl0aGluZyBmb3Igc2luZ2xlIHNlbGVjdGlvbi5cbiAgICAgICAgICBhd2FpdCBicm93c2VyLmFjdGlvbnMoKS5rZXlEb3duKEtleS5DT05UUk9MKS5wZXJmb3JtKCk7XG4gICAgICAgICAgYXdhaXQgb3B0aW9uc1tpXS5jbGljaygpO1xuICAgICAgICAgIGF3YWl0IGJyb3dzZXIuYWN0aW9ucygpLmtleVVwKEtleS5DT05UUk9MKS5wZXJmb3JtKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKiogQ2hlY2tzIHdoZXRoZXIgdGhpcyBlbGVtZW50IG1hdGNoZXMgdGhlIGdpdmVuIHNlbGVjdG9yLiAqL1xuICBhc3luYyBtYXRjaGVzU2VsZWN0b3Ioc2VsZWN0b3I6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgICAgcmV0dXJuIGJyb3dzZXIuZXhlY3V0ZVNjcmlwdChgXG4gICAgICAgICAgcmV0dXJuIChFbGVtZW50LnByb3RvdHlwZS5tYXRjaGVzIHx8XG4gICAgICAgICAgICAgICAgICBFbGVtZW50LnByb3RvdHlwZS5tc01hdGNoZXNTZWxlY3RvcikuY2FsbChhcmd1bWVudHNbMF0sIGFyZ3VtZW50c1sxXSlcbiAgICAgICAgICBgLCB0aGlzLmVsZW1lbnQsIHNlbGVjdG9yKTtcbiAgfVxuXG4gIC8qKiBDaGVja3Mgd2hldGhlciB0aGUgZWxlbWVudCBpcyBmb2N1c2VkLiAqL1xuICBhc3luYyBpc0ZvY3VzZWQoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudC5lcXVhbHMoYnJvd3Nlci5kcml2ZXIuc3dpdGNoVG8oKS5hY3RpdmVFbGVtZW50KCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIERpc3BhdGNoZXMgYW4gZXZlbnQgd2l0aCBhIHBhcnRpY3VsYXIgbmFtZS5cbiAgICogQHBhcmFtIG5hbWUgTmFtZSBvZiB0aGUgZXZlbnQgdG8gYmUgZGlzcGF0Y2hlZC5cbiAgICovXG4gIGFzeW5jIGRpc3BhdGNoRXZlbnQobmFtZTogc3RyaW5nLCBkYXRhPzogUmVjb3JkPHN0cmluZywgRXZlbnREYXRhPik6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiBicm93c2VyLmV4ZWN1dGVTY3JpcHQoX2Rpc3BhdGNoRXZlbnQsIG5hbWUsIHRoaXMuZWxlbWVudCwgZGF0YSk7XG4gIH1cblxuICAvKiogRGlzcGF0Y2hlcyBhbGwgdGhlIGV2ZW50cyB0aGF0IGFyZSBwYXJ0IG9mIGEgY2xpY2sgZXZlbnQgc2VxdWVuY2UuICovXG4gIHByaXZhdGUgYXN5bmMgX2Rpc3BhdGNoQ2xpY2tFdmVudFNlcXVlbmNlKFxuICAgIGFyZ3M6IFtNb2RpZmllcktleXM/XSB8IFsnY2VudGVyJywgTW9kaWZpZXJLZXlzP10gfFxuICAgICAgW251bWJlciwgbnVtYmVyLCBNb2RpZmllcktleXM/XSxcbiAgICBidXR0b246IHN0cmluZykge1xuICAgIGxldCBtb2RpZmllcnM6IE1vZGlmaWVyS2V5cyA9IHt9O1xuICAgIGlmIChhcmdzLmxlbmd0aCAmJiB0eXBlb2YgYXJnc1thcmdzLmxlbmd0aCAtIDFdID09PSAnb2JqZWN0Jykge1xuICAgICAgbW9kaWZpZXJzID0gYXJncy5wb3AoKSBhcyBNb2RpZmllcktleXM7XG4gICAgfVxuICAgIGNvbnN0IG1vZGlmaWVyS2V5cyA9IHRvUHJvdHJhY3Rvck1vZGlmaWVyS2V5cyhtb2RpZmllcnMpO1xuXG4gICAgLy8gT21pdHRpbmcgdGhlIG9mZnNldCBhcmd1bWVudCB0byBtb3VzZU1vdmUgcmVzdWx0cyBpbiBjbGlja2luZyB0aGUgY2VudGVyLlxuICAgIC8vIFRoaXMgaXMgdGhlIGRlZmF1bHQgYmVoYXZpb3Igd2Ugd2FudCwgc28gd2UgdXNlIGFuIGVtcHR5IGFycmF5IG9mIG9mZnNldEFyZ3MgaWZcbiAgICAvLyBubyBhcmdzIHJlbWFpbiBhZnRlciBwb3BwaW5nIHRoZSBtb2RpZmllcnMgZnJvbSB0aGUgYXJncyBwYXNzZWQgdG8gdGhpcyBmdW5jdGlvbi5cbiAgICBjb25zdCBvZmZzZXRBcmdzID0gKGFyZ3MubGVuZ3RoID09PSAyID9cbiAgICAgIFt7eDogYXJnc1swXSwgeTogYXJnc1sxXX1dIDogW10pIGFzIFt7eDogbnVtYmVyLCB5OiBudW1iZXJ9XTtcblxuICAgIGxldCBhY3Rpb25zID0gYnJvd3Nlci5hY3Rpb25zKClcbiAgICAgIC5tb3VzZU1vdmUoYXdhaXQgdGhpcy5lbGVtZW50LmdldFdlYkVsZW1lbnQoKSwgLi4ub2Zmc2V0QXJncyk7XG5cbiAgICBmb3IgKGNvbnN0IG1vZGlmaWVyS2V5IG9mIG1vZGlmaWVyS2V5cykge1xuICAgICAgYWN0aW9ucyA9IGFjdGlvbnMua2V5RG93bihtb2RpZmllcktleSk7XG4gICAgfVxuICAgIGFjdGlvbnMgPSBhY3Rpb25zLmNsaWNrKGJ1dHRvbik7XG4gICAgZm9yIChjb25zdCBtb2RpZmllcktleSBvZiBtb2RpZmllcktleXMpIHtcbiAgICAgIGFjdGlvbnMgPSBhY3Rpb25zLmtleVVwKG1vZGlmaWVyS2V5KTtcbiAgICB9XG5cbiAgICBhd2FpdCBhY3Rpb25zLnBlcmZvcm0oKTtcbiAgfVxufVxuXG4vKipcbiAqIERpc3BhdGNoZXMgYW4gZXZlbnQgd2l0aCBhIHBhcnRpY3VsYXIgbmFtZSBhbmQgZGF0YSB0byBhbiBlbGVtZW50LlxuICogTm90ZSB0aGF0IHRoaXMgbmVlZHMgdG8gYmUgYSBwdXJlIGZ1bmN0aW9uLCBiZWNhdXNlIGl0IGdldHMgc3RyaW5naWZpZWQgYnlcbiAqIFByb3RyYWN0b3IgYW5kIGlzIGV4ZWN1dGVkIGluc2lkZSB0aGUgYnJvd3Nlci5cbiAqL1xuZnVuY3Rpb24gX2Rpc3BhdGNoRXZlbnQobmFtZTogc3RyaW5nLCBlbGVtZW50OiBFbGVtZW50RmluZGVyLCBkYXRhPzogUmVjb3JkPHN0cmluZywgRXZlbnREYXRhPikge1xuICBjb25zdCBldmVudCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdFdmVudCcpO1xuICBldmVudC5pbml0RXZlbnQobmFtZSk7XG5cbiAgaWYgKGRhdGEpIHtcbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6YmFuIEhhdmUgdG8gdXNlIGBPYmplY3QuYXNzaWduYCB0byBwcmVzZXJ2ZSB0aGUgb3JpZ2luYWwgb2JqZWN0LlxuICAgIE9iamVjdC5hc3NpZ24oZXZlbnQsIGRhdGEpO1xuICB9XG5cbiAgLy8gVGhpcyB0eXBlIGhhcyBhIHN0cmluZyBpbmRleCBzaWduYXR1cmUsIHNvIHdlIGNhbm5vdCBhY2Nlc3MgaXQgdXNpbmcgYSBkb3R0ZWQgcHJvcGVydHkgYWNjZXNzLlxuICBlbGVtZW50WydkaXNwYXRjaEV2ZW50J10oZXZlbnQpO1xufVxuIl19