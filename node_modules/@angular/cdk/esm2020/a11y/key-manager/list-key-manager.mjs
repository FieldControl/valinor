/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { QueryList } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { UP_ARROW, DOWN_ARROW, LEFT_ARROW, RIGHT_ARROW, TAB, A, Z, ZERO, NINE, hasModifierKey, HOME, END, PAGE_UP, PAGE_DOWN, } from '@angular/cdk/keycodes';
import { debounceTime, filter, map, tap } from 'rxjs/operators';
/**
 * This class manages keyboard events for selectable lists. If you pass it a query list
 * of items, it will set the active item correctly when arrow events occur.
 */
export class ListKeyManager {
    constructor(_items) {
        this._items = _items;
        this._activeItemIndex = -1;
        this._activeItem = null;
        this._wrap = false;
        this._letterKeyStream = new Subject();
        this._typeaheadSubscription = Subscription.EMPTY;
        this._vertical = true;
        this._allowedModifierKeys = [];
        this._homeAndEnd = false;
        this._pageUpAndDown = { enabled: false, delta: 10 };
        /**
         * Predicate function that can be used to check whether an item should be skipped
         * by the key manager. By default, disabled items are skipped.
         */
        this._skipPredicateFn = (item) => item.disabled;
        // Buffer for the letters that the user has pressed when the typeahead option is turned on.
        this._pressedLetters = [];
        /**
         * Stream that emits any time the TAB key is pressed, so components can react
         * when focus is shifted off of the list.
         */
        this.tabOut = new Subject();
        /** Stream that emits whenever the active item of the list manager changes. */
        this.change = new Subject();
        // We allow for the items to be an array because, in some cases, the consumer may
        // not have access to a QueryList of the items they want to manage (e.g. when the
        // items aren't being collected via `ViewChildren` or `ContentChildren`).
        if (_items instanceof QueryList) {
            this._itemChangesSubscription = _items.changes.subscribe((newItems) => {
                if (this._activeItem) {
                    const itemArray = newItems.toArray();
                    const newIndex = itemArray.indexOf(this._activeItem);
                    if (newIndex > -1 && newIndex !== this._activeItemIndex) {
                        this._activeItemIndex = newIndex;
                    }
                }
            });
        }
    }
    /**
     * Sets the predicate function that determines which items should be skipped by the
     * list key manager.
     * @param predicate Function that determines whether the given item should be skipped.
     */
    skipPredicate(predicate) {
        this._skipPredicateFn = predicate;
        return this;
    }
    /**
     * Configures wrapping mode, which determines whether the active item will wrap to
     * the other end of list when there are no more items in the given direction.
     * @param shouldWrap Whether the list should wrap when reaching the end.
     */
    withWrap(shouldWrap = true) {
        this._wrap = shouldWrap;
        return this;
    }
    /**
     * Configures whether the key manager should be able to move the selection vertically.
     * @param enabled Whether vertical selection should be enabled.
     */
    withVerticalOrientation(enabled = true) {
        this._vertical = enabled;
        return this;
    }
    /**
     * Configures the key manager to move the selection horizontally.
     * Passing in `null` will disable horizontal movement.
     * @param direction Direction in which the selection can be moved.
     */
    withHorizontalOrientation(direction) {
        this._horizontal = direction;
        return this;
    }
    /**
     * Modifier keys which are allowed to be held down and whose default actions will be prevented
     * as the user is pressing the arrow keys. Defaults to not allowing any modifier keys.
     */
    withAllowedModifierKeys(keys) {
        this._allowedModifierKeys = keys;
        return this;
    }
    /**
     * Turns on typeahead mode which allows users to set the active item by typing.
     * @param debounceInterval Time to wait after the last keystroke before setting the active item.
     */
    withTypeAhead(debounceInterval = 200) {
        if ((typeof ngDevMode === 'undefined' || ngDevMode) &&
            this._items.length &&
            this._items.some(item => typeof item.getLabel !== 'function')) {
            throw Error('ListKeyManager items in typeahead mode must implement the `getLabel` method.');
        }
        this._typeaheadSubscription.unsubscribe();
        // Debounce the presses of non-navigational keys, collect the ones that correspond to letters
        // and convert those letters back into a string. Afterwards find the first item that starts
        // with that string and select it.
        this._typeaheadSubscription = this._letterKeyStream
            .pipe(tap(letter => this._pressedLetters.push(letter)), debounceTime(debounceInterval), filter(() => this._pressedLetters.length > 0), map(() => this._pressedLetters.join('')))
            .subscribe(inputString => {
            const items = this._getItemsArray();
            // Start at 1 because we want to start searching at the item immediately
            // following the current active item.
            for (let i = 1; i < items.length + 1; i++) {
                const index = (this._activeItemIndex + i) % items.length;
                const item = items[index];
                if (!this._skipPredicateFn(item) &&
                    item.getLabel().toUpperCase().trim().indexOf(inputString) === 0) {
                    this.setActiveItem(index);
                    break;
                }
            }
            this._pressedLetters = [];
        });
        return this;
    }
    /** Cancels the current typeahead sequence. */
    cancelTypeahead() {
        this._pressedLetters = [];
        return this;
    }
    /**
     * Configures the key manager to activate the first and last items
     * respectively when the Home or End key is pressed.
     * @param enabled Whether pressing the Home or End key activates the first/last item.
     */
    withHomeAndEnd(enabled = true) {
        this._homeAndEnd = enabled;
        return this;
    }
    /**
     * Configures the key manager to activate every 10th, configured or first/last element in up/down direction
     * respectively when the Page-Up or Page-Down key is pressed.
     * @param enabled Whether pressing the Page-Up or Page-Down key activates the first/last item.
     * @param delta Whether pressing the Home or End key activates the first/last item.
     */
    withPageUpDown(enabled = true, delta = 10) {
        this._pageUpAndDown = { enabled, delta };
        return this;
    }
    setActiveItem(item) {
        const previousActiveItem = this._activeItem;
        this.updateActiveItem(item);
        if (this._activeItem !== previousActiveItem) {
            this.change.next(this._activeItemIndex);
        }
    }
    /**
     * Sets the active item depending on the key event passed in.
     * @param event Keyboard event to be used for determining which element should be active.
     */
    onKeydown(event) {
        const keyCode = event.keyCode;
        const modifiers = ['altKey', 'ctrlKey', 'metaKey', 'shiftKey'];
        const isModifierAllowed = modifiers.every(modifier => {
            return !event[modifier] || this._allowedModifierKeys.indexOf(modifier) > -1;
        });
        switch (keyCode) {
            case TAB:
                this.tabOut.next();
                return;
            case DOWN_ARROW:
                if (this._vertical && isModifierAllowed) {
                    this.setNextItemActive();
                    break;
                }
                else {
                    return;
                }
            case UP_ARROW:
                if (this._vertical && isModifierAllowed) {
                    this.setPreviousItemActive();
                    break;
                }
                else {
                    return;
                }
            case RIGHT_ARROW:
                if (this._horizontal && isModifierAllowed) {
                    this._horizontal === 'rtl' ? this.setPreviousItemActive() : this.setNextItemActive();
                    break;
                }
                else {
                    return;
                }
            case LEFT_ARROW:
                if (this._horizontal && isModifierAllowed) {
                    this._horizontal === 'rtl' ? this.setNextItemActive() : this.setPreviousItemActive();
                    break;
                }
                else {
                    return;
                }
            case HOME:
                if (this._homeAndEnd && isModifierAllowed) {
                    this.setFirstItemActive();
                    break;
                }
                else {
                    return;
                }
            case END:
                if (this._homeAndEnd && isModifierAllowed) {
                    this.setLastItemActive();
                    break;
                }
                else {
                    return;
                }
            case PAGE_UP:
                if (this._pageUpAndDown.enabled && isModifierAllowed) {
                    const targetIndex = this._activeItemIndex - this._pageUpAndDown.delta;
                    this._setActiveItemByIndex(targetIndex > 0 ? targetIndex : 0, 1);
                    break;
                }
                else {
                    return;
                }
            case PAGE_DOWN:
                if (this._pageUpAndDown.enabled && isModifierAllowed) {
                    const targetIndex = this._activeItemIndex + this._pageUpAndDown.delta;
                    const itemsLength = this._getItemsArray().length;
                    this._setActiveItemByIndex(targetIndex < itemsLength ? targetIndex : itemsLength - 1, -1);
                    break;
                }
                else {
                    return;
                }
            default:
                if (isModifierAllowed || hasModifierKey(event, 'shiftKey')) {
                    // Attempt to use the `event.key` which also maps it to the user's keyboard language,
                    // otherwise fall back to resolving alphanumeric characters via the keyCode.
                    if (event.key && event.key.length === 1) {
                        this._letterKeyStream.next(event.key.toLocaleUpperCase());
                    }
                    else if ((keyCode >= A && keyCode <= Z) || (keyCode >= ZERO && keyCode <= NINE)) {
                        this._letterKeyStream.next(String.fromCharCode(keyCode));
                    }
                }
                // Note that we return here, in order to avoid preventing
                // the default action of non-navigational keys.
                return;
        }
        this._pressedLetters = [];
        event.preventDefault();
    }
    /** Index of the currently active item. */
    get activeItemIndex() {
        return this._activeItemIndex;
    }
    /** The active item. */
    get activeItem() {
        return this._activeItem;
    }
    /** Gets whether the user is currently typing into the manager using the typeahead feature. */
    isTyping() {
        return this._pressedLetters.length > 0;
    }
    /** Sets the active item to the first enabled item in the list. */
    setFirstItemActive() {
        this._setActiveItemByIndex(0, 1);
    }
    /** Sets the active item to the last enabled item in the list. */
    setLastItemActive() {
        this._setActiveItemByIndex(this._items.length - 1, -1);
    }
    /** Sets the active item to the next enabled item in the list. */
    setNextItemActive() {
        this._activeItemIndex < 0 ? this.setFirstItemActive() : this._setActiveItemByDelta(1);
    }
    /** Sets the active item to a previous enabled item in the list. */
    setPreviousItemActive() {
        this._activeItemIndex < 0 && this._wrap
            ? this.setLastItemActive()
            : this._setActiveItemByDelta(-1);
    }
    updateActiveItem(item) {
        const itemArray = this._getItemsArray();
        const index = typeof item === 'number' ? item : itemArray.indexOf(item);
        const activeItem = itemArray[index];
        // Explicitly check for `null` and `undefined` because other falsy values are valid.
        this._activeItem = activeItem == null ? null : activeItem;
        this._activeItemIndex = index;
    }
    /** Cleans up the key manager. */
    destroy() {
        this._typeaheadSubscription.unsubscribe();
        this._itemChangesSubscription?.unsubscribe();
        this._letterKeyStream.complete();
        this.tabOut.complete();
        this.change.complete();
        this._pressedLetters = [];
    }
    /**
     * This method sets the active item, given a list of items and the delta between the
     * currently active item and the new active item. It will calculate differently
     * depending on whether wrap mode is turned on.
     */
    _setActiveItemByDelta(delta) {
        this._wrap ? this._setActiveInWrapMode(delta) : this._setActiveInDefaultMode(delta);
    }
    /**
     * Sets the active item properly given "wrap" mode. In other words, it will continue to move
     * down the list until it finds an item that is not disabled, and it will wrap if it
     * encounters either end of the list.
     */
    _setActiveInWrapMode(delta) {
        const items = this._getItemsArray();
        for (let i = 1; i <= items.length; i++) {
            const index = (this._activeItemIndex + delta * i + items.length) % items.length;
            const item = items[index];
            if (!this._skipPredicateFn(item)) {
                this.setActiveItem(index);
                return;
            }
        }
    }
    /**
     * Sets the active item properly given the default mode. In other words, it will
     * continue to move down the list until it finds an item that is not disabled. If
     * it encounters either end of the list, it will stop and not wrap.
     */
    _setActiveInDefaultMode(delta) {
        this._setActiveItemByIndex(this._activeItemIndex + delta, delta);
    }
    /**
     * Sets the active item to the first enabled item starting at the index specified. If the
     * item is disabled, it will move in the fallbackDelta direction until it either
     * finds an enabled item or encounters the end of the list.
     */
    _setActiveItemByIndex(index, fallbackDelta) {
        const items = this._getItemsArray();
        if (!items[index]) {
            return;
        }
        while (this._skipPredicateFn(items[index])) {
            index += fallbackDelta;
            if (!items[index]) {
                return;
            }
        }
        this.setActiveItem(index);
    }
    /** Returns the items as an array. */
    _getItemsArray() {
        return this._items instanceof QueryList ? this._items.toArray() : this._items;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdC1rZXktbWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvYTExeS9rZXktbWFuYWdlci9saXN0LWtleS1tYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDeEMsT0FBTyxFQUFDLE9BQU8sRUFBRSxZQUFZLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDM0MsT0FBTyxFQUNMLFFBQVEsRUFDUixVQUFVLEVBQ1YsVUFBVSxFQUNWLFdBQVcsRUFDWCxHQUFHLEVBQ0gsQ0FBQyxFQUNELENBQUMsRUFDRCxJQUFJLEVBQ0osSUFBSSxFQUNKLGNBQWMsRUFDZCxJQUFJLEVBQ0osR0FBRyxFQUNILE9BQU8sRUFDUCxTQUFTLEdBQ1YsTUFBTSx1QkFBdUIsQ0FBQztBQUMvQixPQUFPLEVBQUMsWUFBWSxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFjOUQ7OztHQUdHO0FBQ0gsTUFBTSxPQUFPLGNBQWM7SUFzQnpCLFlBQW9CLE1BQTBCO1FBQTFCLFdBQU0sR0FBTixNQUFNLENBQW9CO1FBckJ0QyxxQkFBZ0IsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUN0QixnQkFBVyxHQUFhLElBQUksQ0FBQztRQUM3QixVQUFLLEdBQUcsS0FBSyxDQUFDO1FBQ0wscUJBQWdCLEdBQUcsSUFBSSxPQUFPLEVBQVUsQ0FBQztRQUNsRCwyQkFBc0IsR0FBRyxZQUFZLENBQUMsS0FBSyxDQUFDO1FBRTVDLGNBQVMsR0FBRyxJQUFJLENBQUM7UUFFakIseUJBQW9CLEdBQWdDLEVBQUUsQ0FBQztRQUN2RCxnQkFBVyxHQUFHLEtBQUssQ0FBQztRQUNwQixtQkFBYyxHQUFHLEVBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFDLENB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RCxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzVCLENBQUM7SUFFRCxxQ0FBcUM7SUFDN0IsY0FBYztRQUNwQixPQUFPLElBQUksQ0FBQyxNQUFNLFlBQVksU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO0lBQ2hGLENBQUM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1F1ZXJ5TGlzdH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge1N1YmplY3QsIFN1YnNjcmlwdGlvbn0gZnJvbSAncnhqcyc7XG5pbXBvcnQge1xuICBVUF9BUlJPVyxcbiAgRE9XTl9BUlJPVyxcbiAgTEVGVF9BUlJPVyxcbiAgUklHSFRfQVJST1csXG4gIFRBQixcbiAgQSxcbiAgWixcbiAgWkVSTyxcbiAgTklORSxcbiAgaGFzTW9kaWZpZXJLZXksXG4gIEhPTUUsXG4gIEVORCxcbiAgUEFHRV9VUCxcbiAgUEFHRV9ET1dOLFxufSBmcm9tICdAYW5ndWxhci9jZGsva2V5Y29kZXMnO1xuaW1wb3J0IHtkZWJvdW5jZVRpbWUsIGZpbHRlciwgbWFwLCB0YXB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuLyoqIFRoaXMgaW50ZXJmYWNlIGlzIGZvciBpdGVtcyB0aGF0IGNhbiBiZSBwYXNzZWQgdG8gYSBMaXN0S2V5TWFuYWdlci4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTGlzdEtleU1hbmFnZXJPcHRpb24ge1xuICAvKiogV2hldGhlciB0aGUgb3B0aW9uIGlzIGRpc2FibGVkLiAqL1xuICBkaXNhYmxlZD86IGJvb2xlYW47XG5cbiAgLyoqIEdldHMgdGhlIGxhYmVsIGZvciB0aGlzIG9wdGlvbi4gKi9cbiAgZ2V0TGFiZWw/KCk6IHN0cmluZztcbn1cblxuLyoqIE1vZGlmaWVyIGtleXMgaGFuZGxlZCBieSB0aGUgTGlzdEtleU1hbmFnZXIuICovXG5leHBvcnQgdHlwZSBMaXN0S2V5TWFuYWdlck1vZGlmaWVyS2V5ID0gJ2FsdEtleScgfCAnY3RybEtleScgfCAnbWV0YUtleScgfCAnc2hpZnRLZXknO1xuXG4vKipcbiAqIFRoaXMgY2xhc3MgbWFuYWdlcyBrZXlib2FyZCBldmVudHMgZm9yIHNlbGVjdGFibGUgbGlzdHMuIElmIHlvdSBwYXNzIGl0IGEgcXVlcnkgbGlzdFxuICogb2YgaXRlbXMsIGl0IHdpbGwgc2V0IHRoZSBhY3RpdmUgaXRlbSBjb3JyZWN0bHkgd2hlbiBhcnJvdyBldmVudHMgb2NjdXIuXG4gKi9cbmV4cG9ydCBjbGFzcyBMaXN0S2V5TWFuYWdlcjxUIGV4dGVuZHMgTGlzdEtleU1hbmFnZXJPcHRpb24+IHtcbiAgcHJpdmF0ZSBfYWN0aXZlSXRlbUluZGV4ID0gLTE7XG4gIHByaXZhdGUgX2FjdGl2ZUl0ZW06IFQgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBfd3JhcCA9IGZhbHNlO1xuICBwcml2YXRlIHJlYWRvbmx5IF9sZXR0ZXJLZXlTdHJlYW0gPSBuZXcgU3ViamVjdDxzdHJpbmc+KCk7XG4gIHByaXZhdGUgX3R5cGVhaGVhZFN1YnNjcmlwdGlvbiA9IFN1YnNjcmlwdGlvbi5FTVBUWTtcbiAgcHJpdmF0ZSBfaXRlbUNoYW5nZXNTdWJzY3JpcHRpb24/OiBTdWJzY3JpcHRpb247XG4gIHByaXZhdGUgX3ZlcnRpY2FsID0gdHJ1ZTtcbiAgcHJpdmF0ZSBfaG9yaXpvbnRhbDogJ2x0cicgfCAncnRsJyB8IG51bGw7XG4gIHByaXZhdGUgX2FsbG93ZWRNb2RpZmllcktleXM6IExpc3RLZXlNYW5hZ2VyTW9kaWZpZXJLZXlbXSA9IFtdO1xuICBwcml2YXRlIF9ob21lQW5kRW5kID0gZmFsc2U7XG4gIHByaXZhdGUgX3BhZ2VVcEFuZERvd24gPSB7ZW5hYmxlZDogZmFsc2UsIGRlbHRhOiAxMH07XG5cbiAgLyoqXG4gICAqIFByZWRpY2F0ZSBmdW5jdGlvbiB0aGF0IGNhbiBiZSB1c2VkIHRvIGNoZWNrIHdoZXRoZXIgYW4gaXRlbSBzaG91bGQgYmUgc2tpcHBlZFxuICAgKiBieSB0aGUga2V5IG1hbmFnZXIuIEJ5IGRlZmF1bHQsIGRpc2FibGVkIGl0ZW1zIGFyZSBza2lwcGVkLlxuICAgKi9cbiAgcHJpdmF0ZSBfc2tpcFByZWRpY2F0ZUZuID0gKGl0ZW06IFQpID0+IGl0ZW0uZGlzYWJsZWQ7XG5cbiAgLy8gQnVmZmVyIGZvciB0aGUgbGV0dGVycyB0aGF0IHRoZSB1c2VyIGhhcyBwcmVzc2VkIHdoZW4gdGhlIHR5cGVhaGVhZCBvcHRpb24gaXMgdHVybmVkIG9uLlxuICBwcml2YXRlIF9wcmVzc2VkTGV0dGVyczogc3RyaW5nW10gPSBbXTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9pdGVtczogUXVlcnlMaXN0PFQ+IHwgVFtdKSB7XG4gICAgLy8gV2UgYWxsb3cgZm9yIHRoZSBpdGVtcyB0byBiZSBhbiBhcnJheSBiZWNhdXNlLCBpbiBzb21lIGNhc2VzLCB0aGUgY29uc3VtZXIgbWF5XG4gICAgLy8gbm90IGhhdmUgYWNjZXNzIHRvIGEgUXVlcnlMaXN0IG9mIHRoZSBpdGVtcyB0aGV5IHdhbnQgdG8gbWFuYWdlIChlLmcuIHdoZW4gdGhlXG4gICAgLy8gaXRlbXMgYXJlbid0IGJlaW5nIGNvbGxlY3RlZCB2aWEgYFZpZXdDaGlsZHJlbmAgb3IgYENvbnRlbnRDaGlsZHJlbmApLlxuICAgIGlmIChfaXRlbXMgaW5zdGFuY2VvZiBRdWVyeUxpc3QpIHtcbiAgICAgIHRoaXMuX2l0ZW1DaGFuZ2VzU3Vic2NyaXB0aW9uID0gX2l0ZW1zLmNoYW5nZXMuc3Vic2NyaWJlKChuZXdJdGVtczogUXVlcnlMaXN0PFQ+KSA9PiB7XG4gICAgICAgIGlmICh0aGlzLl9hY3RpdmVJdGVtKSB7XG4gICAgICAgICAgY29uc3QgaXRlbUFycmF5ID0gbmV3SXRlbXMudG9BcnJheSgpO1xuICAgICAgICAgIGNvbnN0IG5ld0luZGV4ID0gaXRlbUFycmF5LmluZGV4T2YodGhpcy5fYWN0aXZlSXRlbSk7XG5cbiAgICAgICAgICBpZiAobmV3SW5kZXggPiAtMSAmJiBuZXdJbmRleCAhPT0gdGhpcy5fYWN0aXZlSXRlbUluZGV4KSB7XG4gICAgICAgICAgICB0aGlzLl9hY3RpdmVJdGVtSW5kZXggPSBuZXdJbmRleDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTdHJlYW0gdGhhdCBlbWl0cyBhbnkgdGltZSB0aGUgVEFCIGtleSBpcyBwcmVzc2VkLCBzbyBjb21wb25lbnRzIGNhbiByZWFjdFxuICAgKiB3aGVuIGZvY3VzIGlzIHNoaWZ0ZWQgb2ZmIG9mIHRoZSBsaXN0LlxuICAgKi9cbiAgcmVhZG9ubHkgdGFiT3V0ID0gbmV3IFN1YmplY3Q8dm9pZD4oKTtcblxuICAvKiogU3RyZWFtIHRoYXQgZW1pdHMgd2hlbmV2ZXIgdGhlIGFjdGl2ZSBpdGVtIG9mIHRoZSBsaXN0IG1hbmFnZXIgY2hhbmdlcy4gKi9cbiAgcmVhZG9ubHkgY2hhbmdlID0gbmV3IFN1YmplY3Q8bnVtYmVyPigpO1xuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBwcmVkaWNhdGUgZnVuY3Rpb24gdGhhdCBkZXRlcm1pbmVzIHdoaWNoIGl0ZW1zIHNob3VsZCBiZSBza2lwcGVkIGJ5IHRoZVxuICAgKiBsaXN0IGtleSBtYW5hZ2VyLlxuICAgKiBAcGFyYW0gcHJlZGljYXRlIEZ1bmN0aW9uIHRoYXQgZGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSBnaXZlbiBpdGVtIHNob3VsZCBiZSBza2lwcGVkLlxuICAgKi9cbiAgc2tpcFByZWRpY2F0ZShwcmVkaWNhdGU6IChpdGVtOiBUKSA9PiBib29sZWFuKTogdGhpcyB7XG4gICAgdGhpcy5fc2tpcFByZWRpY2F0ZUZuID0gcHJlZGljYXRlO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbmZpZ3VyZXMgd3JhcHBpbmcgbW9kZSwgd2hpY2ggZGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSBhY3RpdmUgaXRlbSB3aWxsIHdyYXAgdG9cbiAgICogdGhlIG90aGVyIGVuZCBvZiBsaXN0IHdoZW4gdGhlcmUgYXJlIG5vIG1vcmUgaXRlbXMgaW4gdGhlIGdpdmVuIGRpcmVjdGlvbi5cbiAgICogQHBhcmFtIHNob3VsZFdyYXAgV2hldGhlciB0aGUgbGlzdCBzaG91bGQgd3JhcCB3aGVuIHJlYWNoaW5nIHRoZSBlbmQuXG4gICAqL1xuICB3aXRoV3JhcChzaG91bGRXcmFwID0gdHJ1ZSk6IHRoaXMge1xuICAgIHRoaXMuX3dyYXAgPSBzaG91bGRXcmFwO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbmZpZ3VyZXMgd2hldGhlciB0aGUga2V5IG1hbmFnZXIgc2hvdWxkIGJlIGFibGUgdG8gbW92ZSB0aGUgc2VsZWN0aW9uIHZlcnRpY2FsbHkuXG4gICAqIEBwYXJhbSBlbmFibGVkIFdoZXRoZXIgdmVydGljYWwgc2VsZWN0aW9uIHNob3VsZCBiZSBlbmFibGVkLlxuICAgKi9cbiAgd2l0aFZlcnRpY2FsT3JpZW50YXRpb24oZW5hYmxlZDogYm9vbGVhbiA9IHRydWUpOiB0aGlzIHtcbiAgICB0aGlzLl92ZXJ0aWNhbCA9IGVuYWJsZWQ7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogQ29uZmlndXJlcyB0aGUga2V5IG1hbmFnZXIgdG8gbW92ZSB0aGUgc2VsZWN0aW9uIGhvcml6b250YWxseS5cbiAgICogUGFzc2luZyBpbiBgbnVsbGAgd2lsbCBkaXNhYmxlIGhvcml6b250YWwgbW92ZW1lbnQuXG4gICAqIEBwYXJhbSBkaXJlY3Rpb24gRGlyZWN0aW9uIGluIHdoaWNoIHRoZSBzZWxlY3Rpb24gY2FuIGJlIG1vdmVkLlxuICAgKi9cbiAgd2l0aEhvcml6b250YWxPcmllbnRhdGlvbihkaXJlY3Rpb246ICdsdHInIHwgJ3J0bCcgfCBudWxsKTogdGhpcyB7XG4gICAgdGhpcy5faG9yaXpvbnRhbCA9IGRpcmVjdGlvbjtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBNb2RpZmllciBrZXlzIHdoaWNoIGFyZSBhbGxvd2VkIHRvIGJlIGhlbGQgZG93biBhbmQgd2hvc2UgZGVmYXVsdCBhY3Rpb25zIHdpbGwgYmUgcHJldmVudGVkXG4gICAqIGFzIHRoZSB1c2VyIGlzIHByZXNzaW5nIHRoZSBhcnJvdyBrZXlzLiBEZWZhdWx0cyB0byBub3QgYWxsb3dpbmcgYW55IG1vZGlmaWVyIGtleXMuXG4gICAqL1xuICB3aXRoQWxsb3dlZE1vZGlmaWVyS2V5cyhrZXlzOiBMaXN0S2V5TWFuYWdlck1vZGlmaWVyS2V5W10pOiB0aGlzIHtcbiAgICB0aGlzLl9hbGxvd2VkTW9kaWZpZXJLZXlzID0ga2V5cztcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBUdXJucyBvbiB0eXBlYWhlYWQgbW9kZSB3aGljaCBhbGxvd3MgdXNlcnMgdG8gc2V0IHRoZSBhY3RpdmUgaXRlbSBieSB0eXBpbmcuXG4gICAqIEBwYXJhbSBkZWJvdW5jZUludGVydmFsIFRpbWUgdG8gd2FpdCBhZnRlciB0aGUgbGFzdCBrZXlzdHJva2UgYmVmb3JlIHNldHRpbmcgdGhlIGFjdGl2ZSBpdGVtLlxuICAgKi9cbiAgd2l0aFR5cGVBaGVhZChkZWJvdW5jZUludGVydmFsOiBudW1iZXIgPSAyMDApOiB0aGlzIHtcbiAgICBpZiAoXG4gICAgICAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSAmJlxuICAgICAgdGhpcy5faXRlbXMubGVuZ3RoICYmXG4gICAgICB0aGlzLl9pdGVtcy5zb21lKGl0ZW0gPT4gdHlwZW9mIGl0ZW0uZ2V0TGFiZWwgIT09ICdmdW5jdGlvbicpXG4gICAgKSB7XG4gICAgICB0aHJvdyBFcnJvcignTGlzdEtleU1hbmFnZXIgaXRlbXMgaW4gdHlwZWFoZWFkIG1vZGUgbXVzdCBpbXBsZW1lbnQgdGhlIGBnZXRMYWJlbGAgbWV0aG9kLicpO1xuICAgIH1cblxuICAgIHRoaXMuX3R5cGVhaGVhZFN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuXG4gICAgLy8gRGVib3VuY2UgdGhlIHByZXNzZXMgb2Ygbm9uLW5hdmlnYXRpb25hbCBrZXlzLCBjb2xsZWN0IHRoZSBvbmVzIHRoYXQgY29ycmVzcG9uZCB0byBsZXR0ZXJzXG4gICAgLy8gYW5kIGNvbnZlcnQgdGhvc2UgbGV0dGVycyBiYWNrIGludG8gYSBzdHJpbmcuIEFmdGVyd2FyZHMgZmluZCB0aGUgZmlyc3QgaXRlbSB0aGF0IHN0YXJ0c1xuICAgIC8vIHdpdGggdGhhdCBzdHJpbmcgYW5kIHNlbGVjdCBpdC5cbiAgICB0aGlzLl90eXBlYWhlYWRTdWJzY3JpcHRpb24gPSB0aGlzLl9sZXR0ZXJLZXlTdHJlYW1cbiAgICAgIC5waXBlKFxuICAgICAgICB0YXAobGV0dGVyID0+IHRoaXMuX3ByZXNzZWRMZXR0ZXJzLnB1c2gobGV0dGVyKSksXG4gICAgICAgIGRlYm91bmNlVGltZShkZWJvdW5jZUludGVydmFsKSxcbiAgICAgICAgZmlsdGVyKCgpID0+IHRoaXMuX3ByZXNzZWRMZXR0ZXJzLmxlbmd0aCA+IDApLFxuICAgICAgICBtYXAoKCkgPT4gdGhpcy5fcHJlc3NlZExldHRlcnMuam9pbignJykpLFxuICAgICAgKVxuICAgICAgLnN1YnNjcmliZShpbnB1dFN0cmluZyA9PiB7XG4gICAgICAgIGNvbnN0IGl0ZW1zID0gdGhpcy5fZ2V0SXRlbXNBcnJheSgpO1xuXG4gICAgICAgIC8vIFN0YXJ0IGF0IDEgYmVjYXVzZSB3ZSB3YW50IHRvIHN0YXJ0IHNlYXJjaGluZyBhdCB0aGUgaXRlbSBpbW1lZGlhdGVseVxuICAgICAgICAvLyBmb2xsb3dpbmcgdGhlIGN1cnJlbnQgYWN0aXZlIGl0ZW0uXG4gICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDwgaXRlbXMubGVuZ3RoICsgMTsgaSsrKSB7XG4gICAgICAgICAgY29uc3QgaW5kZXggPSAodGhpcy5fYWN0aXZlSXRlbUluZGV4ICsgaSkgJSBpdGVtcy5sZW5ndGg7XG4gICAgICAgICAgY29uc3QgaXRlbSA9IGl0ZW1zW2luZGV4XTtcblxuICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICF0aGlzLl9za2lwUHJlZGljYXRlRm4oaXRlbSkgJiZcbiAgICAgICAgICAgIGl0ZW0uZ2V0TGFiZWwhKCkudG9VcHBlckNhc2UoKS50cmltKCkuaW5kZXhPZihpbnB1dFN0cmluZykgPT09IDBcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIHRoaXMuc2V0QWN0aXZlSXRlbShpbmRleCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9wcmVzc2VkTGV0dGVycyA9IFtdO1xuICAgICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKiBDYW5jZWxzIHRoZSBjdXJyZW50IHR5cGVhaGVhZCBzZXF1ZW5jZS4gKi9cbiAgY2FuY2VsVHlwZWFoZWFkKCk6IHRoaXMge1xuICAgIHRoaXMuX3ByZXNzZWRMZXR0ZXJzID0gW107XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogQ29uZmlndXJlcyB0aGUga2V5IG1hbmFnZXIgdG8gYWN0aXZhdGUgdGhlIGZpcnN0IGFuZCBsYXN0IGl0ZW1zXG4gICAqIHJlc3BlY3RpdmVseSB3aGVuIHRoZSBIb21lIG9yIEVuZCBrZXkgaXMgcHJlc3NlZC5cbiAgICogQHBhcmFtIGVuYWJsZWQgV2hldGhlciBwcmVzc2luZyB0aGUgSG9tZSBvciBFbmQga2V5IGFjdGl2YXRlcyB0aGUgZmlyc3QvbGFzdCBpdGVtLlxuICAgKi9cbiAgd2l0aEhvbWVBbmRFbmQoZW5hYmxlZDogYm9vbGVhbiA9IHRydWUpOiB0aGlzIHtcbiAgICB0aGlzLl9ob21lQW5kRW5kID0gZW5hYmxlZDtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBDb25maWd1cmVzIHRoZSBrZXkgbWFuYWdlciB0byBhY3RpdmF0ZSBldmVyeSAxMHRoLCBjb25maWd1cmVkIG9yIGZpcnN0L2xhc3QgZWxlbWVudCBpbiB1cC9kb3duIGRpcmVjdGlvblxuICAgKiByZXNwZWN0aXZlbHkgd2hlbiB0aGUgUGFnZS1VcCBvciBQYWdlLURvd24ga2V5IGlzIHByZXNzZWQuXG4gICAqIEBwYXJhbSBlbmFibGVkIFdoZXRoZXIgcHJlc3NpbmcgdGhlIFBhZ2UtVXAgb3IgUGFnZS1Eb3duIGtleSBhY3RpdmF0ZXMgdGhlIGZpcnN0L2xhc3QgaXRlbS5cbiAgICogQHBhcmFtIGRlbHRhIFdoZXRoZXIgcHJlc3NpbmcgdGhlIEhvbWUgb3IgRW5kIGtleSBhY3RpdmF0ZXMgdGhlIGZpcnN0L2xhc3QgaXRlbS5cbiAgICovXG4gIHdpdGhQYWdlVXBEb3duKGVuYWJsZWQ6IGJvb2xlYW4gPSB0cnVlLCBkZWx0YTogbnVtYmVyID0gMTApOiB0aGlzIHtcbiAgICB0aGlzLl9wYWdlVXBBbmREb3duID0ge2VuYWJsZWQsIGRlbHRhfTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBhY3RpdmUgaXRlbSB0byB0aGUgaXRlbSBhdCB0aGUgaW5kZXggc3BlY2lmaWVkLlxuICAgKiBAcGFyYW0gaW5kZXggVGhlIGluZGV4IG9mIHRoZSBpdGVtIHRvIGJlIHNldCBhcyBhY3RpdmUuXG4gICAqL1xuICBzZXRBY3RpdmVJdGVtKGluZGV4OiBudW1iZXIpOiB2b2lkO1xuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBhY3RpdmUgaXRlbSB0byB0aGUgc3BlY2lmaWVkIGl0ZW0uXG4gICAqIEBwYXJhbSBpdGVtIFRoZSBpdGVtIHRvIGJlIHNldCBhcyBhY3RpdmUuXG4gICAqL1xuICBzZXRBY3RpdmVJdGVtKGl0ZW06IFQpOiB2b2lkO1xuXG4gIHNldEFjdGl2ZUl0ZW0oaXRlbTogYW55KTogdm9pZCB7XG4gICAgY29uc3QgcHJldmlvdXNBY3RpdmVJdGVtID0gdGhpcy5fYWN0aXZlSXRlbTtcblxuICAgIHRoaXMudXBkYXRlQWN0aXZlSXRlbShpdGVtKTtcblxuICAgIGlmICh0aGlzLl9hY3RpdmVJdGVtICE9PSBwcmV2aW91c0FjdGl2ZUl0ZW0pIHtcbiAgICAgIHRoaXMuY2hhbmdlLm5leHQodGhpcy5fYWN0aXZlSXRlbUluZGV4KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgYWN0aXZlIGl0ZW0gZGVwZW5kaW5nIG9uIHRoZSBrZXkgZXZlbnQgcGFzc2VkIGluLlxuICAgKiBAcGFyYW0gZXZlbnQgS2V5Ym9hcmQgZXZlbnQgdG8gYmUgdXNlZCBmb3IgZGV0ZXJtaW5pbmcgd2hpY2ggZWxlbWVudCBzaG91bGQgYmUgYWN0aXZlLlxuICAgKi9cbiAgb25LZXlkb3duKGV2ZW50OiBLZXlib2FyZEV2ZW50KTogdm9pZCB7XG4gICAgY29uc3Qga2V5Q29kZSA9IGV2ZW50LmtleUNvZGU7XG4gICAgY29uc3QgbW9kaWZpZXJzOiBMaXN0S2V5TWFuYWdlck1vZGlmaWVyS2V5W10gPSBbJ2FsdEtleScsICdjdHJsS2V5JywgJ21ldGFLZXknLCAnc2hpZnRLZXknXTtcbiAgICBjb25zdCBpc01vZGlmaWVyQWxsb3dlZCA9IG1vZGlmaWVycy5ldmVyeShtb2RpZmllciA9PiB7XG4gICAgICByZXR1cm4gIWV2ZW50W21vZGlmaWVyXSB8fCB0aGlzLl9hbGxvd2VkTW9kaWZpZXJLZXlzLmluZGV4T2YobW9kaWZpZXIpID4gLTE7XG4gICAgfSk7XG5cbiAgICBzd2l0Y2ggKGtleUNvZGUpIHtcbiAgICAgIGNhc2UgVEFCOlxuICAgICAgICB0aGlzLnRhYk91dC5uZXh0KCk7XG4gICAgICAgIHJldHVybjtcblxuICAgICAgY2FzZSBET1dOX0FSUk9XOlxuICAgICAgICBpZiAodGhpcy5fdmVydGljYWwgJiYgaXNNb2RpZmllckFsbG93ZWQpIHtcbiAgICAgICAgICB0aGlzLnNldE5leHRJdGVtQWN0aXZlKCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgIGNhc2UgVVBfQVJST1c6XG4gICAgICAgIGlmICh0aGlzLl92ZXJ0aWNhbCAmJiBpc01vZGlmaWVyQWxsb3dlZCkge1xuICAgICAgICAgIHRoaXMuc2V0UHJldmlvdXNJdGVtQWN0aXZlKCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgIGNhc2UgUklHSFRfQVJST1c6XG4gICAgICAgIGlmICh0aGlzLl9ob3Jpem9udGFsICYmIGlzTW9kaWZpZXJBbGxvd2VkKSB7XG4gICAgICAgICAgdGhpcy5faG9yaXpvbnRhbCA9PT0gJ3J0bCcgPyB0aGlzLnNldFByZXZpb3VzSXRlbUFjdGl2ZSgpIDogdGhpcy5zZXROZXh0SXRlbUFjdGl2ZSgpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICBjYXNlIExFRlRfQVJST1c6XG4gICAgICAgIGlmICh0aGlzLl9ob3Jpem9udGFsICYmIGlzTW9kaWZpZXJBbGxvd2VkKSB7XG4gICAgICAgICAgdGhpcy5faG9yaXpvbnRhbCA9PT0gJ3J0bCcgPyB0aGlzLnNldE5leHRJdGVtQWN0aXZlKCkgOiB0aGlzLnNldFByZXZpb3VzSXRlbUFjdGl2ZSgpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICBjYXNlIEhPTUU6XG4gICAgICAgIGlmICh0aGlzLl9ob21lQW5kRW5kICYmIGlzTW9kaWZpZXJBbGxvd2VkKSB7XG4gICAgICAgICAgdGhpcy5zZXRGaXJzdEl0ZW1BY3RpdmUoKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgY2FzZSBFTkQ6XG4gICAgICAgIGlmICh0aGlzLl9ob21lQW5kRW5kICYmIGlzTW9kaWZpZXJBbGxvd2VkKSB7XG4gICAgICAgICAgdGhpcy5zZXRMYXN0SXRlbUFjdGl2ZSgpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICBjYXNlIFBBR0VfVVA6XG4gICAgICAgIGlmICh0aGlzLl9wYWdlVXBBbmREb3duLmVuYWJsZWQgJiYgaXNNb2RpZmllckFsbG93ZWQpIHtcbiAgICAgICAgICBjb25zdCB0YXJnZXRJbmRleCA9IHRoaXMuX2FjdGl2ZUl0ZW1JbmRleCAtIHRoaXMuX3BhZ2VVcEFuZERvd24uZGVsdGE7XG4gICAgICAgICAgdGhpcy5fc2V0QWN0aXZlSXRlbUJ5SW5kZXgodGFyZ2V0SW5kZXggPiAwID8gdGFyZ2V0SW5kZXggOiAwLCAxKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgY2FzZSBQQUdFX0RPV046XG4gICAgICAgIGlmICh0aGlzLl9wYWdlVXBBbmREb3duLmVuYWJsZWQgJiYgaXNNb2RpZmllckFsbG93ZWQpIHtcbiAgICAgICAgICBjb25zdCB0YXJnZXRJbmRleCA9IHRoaXMuX2FjdGl2ZUl0ZW1JbmRleCArIHRoaXMuX3BhZ2VVcEFuZERvd24uZGVsdGE7XG4gICAgICAgICAgY29uc3QgaXRlbXNMZW5ndGggPSB0aGlzLl9nZXRJdGVtc0FycmF5KCkubGVuZ3RoO1xuICAgICAgICAgIHRoaXMuX3NldEFjdGl2ZUl0ZW1CeUluZGV4KHRhcmdldEluZGV4IDwgaXRlbXNMZW5ndGggPyB0YXJnZXRJbmRleCA6IGl0ZW1zTGVuZ3RoIC0gMSwgLTEpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBpZiAoaXNNb2RpZmllckFsbG93ZWQgfHwgaGFzTW9kaWZpZXJLZXkoZXZlbnQsICdzaGlmdEtleScpKSB7XG4gICAgICAgICAgLy8gQXR0ZW1wdCB0byB1c2UgdGhlIGBldmVudC5rZXlgIHdoaWNoIGFsc28gbWFwcyBpdCB0byB0aGUgdXNlcidzIGtleWJvYXJkIGxhbmd1YWdlLFxuICAgICAgICAgIC8vIG90aGVyd2lzZSBmYWxsIGJhY2sgdG8gcmVzb2x2aW5nIGFscGhhbnVtZXJpYyBjaGFyYWN0ZXJzIHZpYSB0aGUga2V5Q29kZS5cbiAgICAgICAgICBpZiAoZXZlbnQua2V5ICYmIGV2ZW50LmtleS5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgIHRoaXMuX2xldHRlcktleVN0cmVhbS5uZXh0KGV2ZW50LmtleS50b0xvY2FsZVVwcGVyQ2FzZSgpKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKChrZXlDb2RlID49IEEgJiYga2V5Q29kZSA8PSBaKSB8fCAoa2V5Q29kZSA+PSBaRVJPICYmIGtleUNvZGUgPD0gTklORSkpIHtcbiAgICAgICAgICAgIHRoaXMuX2xldHRlcktleVN0cmVhbS5uZXh0KFN0cmluZy5mcm9tQ2hhckNvZGUoa2V5Q29kZSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE5vdGUgdGhhdCB3ZSByZXR1cm4gaGVyZSwgaW4gb3JkZXIgdG8gYXZvaWQgcHJldmVudGluZ1xuICAgICAgICAvLyB0aGUgZGVmYXVsdCBhY3Rpb24gb2Ygbm9uLW5hdmlnYXRpb25hbCBrZXlzLlxuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5fcHJlc3NlZExldHRlcnMgPSBbXTtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICB9XG5cbiAgLyoqIEluZGV4IG9mIHRoZSBjdXJyZW50bHkgYWN0aXZlIGl0ZW0uICovXG4gIGdldCBhY3RpdmVJdGVtSW5kZXgoKTogbnVtYmVyIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuX2FjdGl2ZUl0ZW1JbmRleDtcbiAgfVxuXG4gIC8qKiBUaGUgYWN0aXZlIGl0ZW0uICovXG4gIGdldCBhY3RpdmVJdGVtKCk6IFQgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5fYWN0aXZlSXRlbTtcbiAgfVxuXG4gIC8qKiBHZXRzIHdoZXRoZXIgdGhlIHVzZXIgaXMgY3VycmVudGx5IHR5cGluZyBpbnRvIHRoZSBtYW5hZ2VyIHVzaW5nIHRoZSB0eXBlYWhlYWQgZmVhdHVyZS4gKi9cbiAgaXNUeXBpbmcoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX3ByZXNzZWRMZXR0ZXJzLmxlbmd0aCA+IDA7XG4gIH1cblxuICAvKiogU2V0cyB0aGUgYWN0aXZlIGl0ZW0gdG8gdGhlIGZpcnN0IGVuYWJsZWQgaXRlbSBpbiB0aGUgbGlzdC4gKi9cbiAgc2V0Rmlyc3RJdGVtQWN0aXZlKCk6IHZvaWQge1xuICAgIHRoaXMuX3NldEFjdGl2ZUl0ZW1CeUluZGV4KDAsIDEpO1xuICB9XG5cbiAgLyoqIFNldHMgdGhlIGFjdGl2ZSBpdGVtIHRvIHRoZSBsYXN0IGVuYWJsZWQgaXRlbSBpbiB0aGUgbGlzdC4gKi9cbiAgc2V0TGFzdEl0ZW1BY3RpdmUoKTogdm9pZCB7XG4gICAgdGhpcy5fc2V0QWN0aXZlSXRlbUJ5SW5kZXgodGhpcy5faXRlbXMubGVuZ3RoIC0gMSwgLTEpO1xuICB9XG5cbiAgLyoqIFNldHMgdGhlIGFjdGl2ZSBpdGVtIHRvIHRoZSBuZXh0IGVuYWJsZWQgaXRlbSBpbiB0aGUgbGlzdC4gKi9cbiAgc2V0TmV4dEl0ZW1BY3RpdmUoKTogdm9pZCB7XG4gICAgdGhpcy5fYWN0aXZlSXRlbUluZGV4IDwgMCA/IHRoaXMuc2V0Rmlyc3RJdGVtQWN0aXZlKCkgOiB0aGlzLl9zZXRBY3RpdmVJdGVtQnlEZWx0YSgxKTtcbiAgfVxuXG4gIC8qKiBTZXRzIHRoZSBhY3RpdmUgaXRlbSB0byBhIHByZXZpb3VzIGVuYWJsZWQgaXRlbSBpbiB0aGUgbGlzdC4gKi9cbiAgc2V0UHJldmlvdXNJdGVtQWN0aXZlKCk6IHZvaWQge1xuICAgIHRoaXMuX2FjdGl2ZUl0ZW1JbmRleCA8IDAgJiYgdGhpcy5fd3JhcFxuICAgICAgPyB0aGlzLnNldExhc3RJdGVtQWN0aXZlKClcbiAgICAgIDogdGhpcy5fc2V0QWN0aXZlSXRlbUJ5RGVsdGEoLTEpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFsbG93cyBzZXR0aW5nIHRoZSBhY3RpdmUgd2l0aG91dCBhbnkgb3RoZXIgZWZmZWN0cy5cbiAgICogQHBhcmFtIGluZGV4IEluZGV4IG9mIHRoZSBpdGVtIHRvIGJlIHNldCBhcyBhY3RpdmUuXG4gICAqL1xuICB1cGRhdGVBY3RpdmVJdGVtKGluZGV4OiBudW1iZXIpOiB2b2lkO1xuXG4gIC8qKlxuICAgKiBBbGxvd3Mgc2V0dGluZyB0aGUgYWN0aXZlIGl0ZW0gd2l0aG91dCBhbnkgb3RoZXIgZWZmZWN0cy5cbiAgICogQHBhcmFtIGl0ZW0gSXRlbSB0byBiZSBzZXQgYXMgYWN0aXZlLlxuICAgKi9cbiAgdXBkYXRlQWN0aXZlSXRlbShpdGVtOiBUKTogdm9pZDtcblxuICB1cGRhdGVBY3RpdmVJdGVtKGl0ZW06IGFueSk6IHZvaWQge1xuICAgIGNvbnN0IGl0ZW1BcnJheSA9IHRoaXMuX2dldEl0ZW1zQXJyYXkoKTtcbiAgICBjb25zdCBpbmRleCA9IHR5cGVvZiBpdGVtID09PSAnbnVtYmVyJyA/IGl0ZW0gOiBpdGVtQXJyYXkuaW5kZXhPZihpdGVtKTtcbiAgICBjb25zdCBhY3RpdmVJdGVtID0gaXRlbUFycmF5W2luZGV4XTtcblxuICAgIC8vIEV4cGxpY2l0bHkgY2hlY2sgZm9yIGBudWxsYCBhbmQgYHVuZGVmaW5lZGAgYmVjYXVzZSBvdGhlciBmYWxzeSB2YWx1ZXMgYXJlIHZhbGlkLlxuICAgIHRoaXMuX2FjdGl2ZUl0ZW0gPSBhY3RpdmVJdGVtID09IG51bGwgPyBudWxsIDogYWN0aXZlSXRlbTtcbiAgICB0aGlzLl9hY3RpdmVJdGVtSW5kZXggPSBpbmRleDtcbiAgfVxuXG4gIC8qKiBDbGVhbnMgdXAgdGhlIGtleSBtYW5hZ2VyLiAqL1xuICBkZXN0cm95KCkge1xuICAgIHRoaXMuX3R5cGVhaGVhZFN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICAgIHRoaXMuX2l0ZW1DaGFuZ2VzU3Vic2NyaXB0aW9uPy51bnN1YnNjcmliZSgpO1xuICAgIHRoaXMuX2xldHRlcktleVN0cmVhbS5jb21wbGV0ZSgpO1xuICAgIHRoaXMudGFiT3V0LmNvbXBsZXRlKCk7XG4gICAgdGhpcy5jaGFuZ2UuY29tcGxldGUoKTtcbiAgICB0aGlzLl9wcmVzc2VkTGV0dGVycyA9IFtdO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgbWV0aG9kIHNldHMgdGhlIGFjdGl2ZSBpdGVtLCBnaXZlbiBhIGxpc3Qgb2YgaXRlbXMgYW5kIHRoZSBkZWx0YSBiZXR3ZWVuIHRoZVxuICAgKiBjdXJyZW50bHkgYWN0aXZlIGl0ZW0gYW5kIHRoZSBuZXcgYWN0aXZlIGl0ZW0uIEl0IHdpbGwgY2FsY3VsYXRlIGRpZmZlcmVudGx5XG4gICAqIGRlcGVuZGluZyBvbiB3aGV0aGVyIHdyYXAgbW9kZSBpcyB0dXJuZWQgb24uXG4gICAqL1xuICBwcml2YXRlIF9zZXRBY3RpdmVJdGVtQnlEZWx0YShkZWx0YTogLTEgfCAxKTogdm9pZCB7XG4gICAgdGhpcy5fd3JhcCA/IHRoaXMuX3NldEFjdGl2ZUluV3JhcE1vZGUoZGVsdGEpIDogdGhpcy5fc2V0QWN0aXZlSW5EZWZhdWx0TW9kZShkZWx0YSk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgYWN0aXZlIGl0ZW0gcHJvcGVybHkgZ2l2ZW4gXCJ3cmFwXCIgbW9kZS4gSW4gb3RoZXIgd29yZHMsIGl0IHdpbGwgY29udGludWUgdG8gbW92ZVxuICAgKiBkb3duIHRoZSBsaXN0IHVudGlsIGl0IGZpbmRzIGFuIGl0ZW0gdGhhdCBpcyBub3QgZGlzYWJsZWQsIGFuZCBpdCB3aWxsIHdyYXAgaWYgaXRcbiAgICogZW5jb3VudGVycyBlaXRoZXIgZW5kIG9mIHRoZSBsaXN0LlxuICAgKi9cbiAgcHJpdmF0ZSBfc2V0QWN0aXZlSW5XcmFwTW9kZShkZWx0YTogLTEgfCAxKTogdm9pZCB7XG4gICAgY29uc3QgaXRlbXMgPSB0aGlzLl9nZXRJdGVtc0FycmF5KCk7XG5cbiAgICBmb3IgKGxldCBpID0gMTsgaSA8PSBpdGVtcy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgaW5kZXggPSAodGhpcy5fYWN0aXZlSXRlbUluZGV4ICsgZGVsdGEgKiBpICsgaXRlbXMubGVuZ3RoKSAlIGl0ZW1zLmxlbmd0aDtcbiAgICAgIGNvbnN0IGl0ZW0gPSBpdGVtc1tpbmRleF07XG5cbiAgICAgIGlmICghdGhpcy5fc2tpcFByZWRpY2F0ZUZuKGl0ZW0pKSB7XG4gICAgICAgIHRoaXMuc2V0QWN0aXZlSXRlbShpbmRleCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgYWN0aXZlIGl0ZW0gcHJvcGVybHkgZ2l2ZW4gdGhlIGRlZmF1bHQgbW9kZS4gSW4gb3RoZXIgd29yZHMsIGl0IHdpbGxcbiAgICogY29udGludWUgdG8gbW92ZSBkb3duIHRoZSBsaXN0IHVudGlsIGl0IGZpbmRzIGFuIGl0ZW0gdGhhdCBpcyBub3QgZGlzYWJsZWQuIElmXG4gICAqIGl0IGVuY291bnRlcnMgZWl0aGVyIGVuZCBvZiB0aGUgbGlzdCwgaXQgd2lsbCBzdG9wIGFuZCBub3Qgd3JhcC5cbiAgICovXG4gIHByaXZhdGUgX3NldEFjdGl2ZUluRGVmYXVsdE1vZGUoZGVsdGE6IC0xIHwgMSk6IHZvaWQge1xuICAgIHRoaXMuX3NldEFjdGl2ZUl0ZW1CeUluZGV4KHRoaXMuX2FjdGl2ZUl0ZW1JbmRleCArIGRlbHRhLCBkZWx0YSk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgYWN0aXZlIGl0ZW0gdG8gdGhlIGZpcnN0IGVuYWJsZWQgaXRlbSBzdGFydGluZyBhdCB0aGUgaW5kZXggc3BlY2lmaWVkLiBJZiB0aGVcbiAgICogaXRlbSBpcyBkaXNhYmxlZCwgaXQgd2lsbCBtb3ZlIGluIHRoZSBmYWxsYmFja0RlbHRhIGRpcmVjdGlvbiB1bnRpbCBpdCBlaXRoZXJcbiAgICogZmluZHMgYW4gZW5hYmxlZCBpdGVtIG9yIGVuY291bnRlcnMgdGhlIGVuZCBvZiB0aGUgbGlzdC5cbiAgICovXG4gIHByaXZhdGUgX3NldEFjdGl2ZUl0ZW1CeUluZGV4KGluZGV4OiBudW1iZXIsIGZhbGxiYWNrRGVsdGE6IC0xIHwgMSk6IHZvaWQge1xuICAgIGNvbnN0IGl0ZW1zID0gdGhpcy5fZ2V0SXRlbXNBcnJheSgpO1xuXG4gICAgaWYgKCFpdGVtc1tpbmRleF0pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB3aGlsZSAodGhpcy5fc2tpcFByZWRpY2F0ZUZuKGl0ZW1zW2luZGV4XSkpIHtcbiAgICAgIGluZGV4ICs9IGZhbGxiYWNrRGVsdGE7XG5cbiAgICAgIGlmICghaXRlbXNbaW5kZXhdKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnNldEFjdGl2ZUl0ZW0oaW5kZXgpO1xuICB9XG5cbiAgLyoqIFJldHVybnMgdGhlIGl0ZW1zIGFzIGFuIGFycmF5LiAqL1xuICBwcml2YXRlIF9nZXRJdGVtc0FycmF5KCk6IFRbXSB7XG4gICAgcmV0dXJuIHRoaXMuX2l0ZW1zIGluc3RhbmNlb2YgUXVlcnlMaXN0ID8gdGhpcy5faXRlbXMudG9BcnJheSgpIDogdGhpcy5faXRlbXM7XG4gIH1cbn1cbiJdfQ==