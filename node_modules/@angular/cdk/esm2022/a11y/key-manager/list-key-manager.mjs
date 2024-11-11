/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { QueryList, effect, isSignal } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { UP_ARROW, DOWN_ARROW, LEFT_ARROW, RIGHT_ARROW, TAB, hasModifierKey, HOME, END, PAGE_UP, PAGE_DOWN, } from '@angular/cdk/keycodes';
import { Typeahead } from './typeahead';
/**
 * This class manages keyboard events for selectable lists. If you pass it a query list
 * of items, it will set the active item correctly when arrow events occur.
 */
export class ListKeyManager {
    constructor(_items, injector) {
        this._items = _items;
        this._activeItemIndex = -1;
        this._activeItem = null;
        this._wrap = false;
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
            this._itemChangesSubscription = _items.changes.subscribe((newItems) => this._itemsChanged(newItems.toArray()));
        }
        else if (isSignal(_items)) {
            if (!injector && (typeof ngDevMode === 'undefined' || ngDevMode)) {
                throw new Error('ListKeyManager constructed with a signal must receive an injector');
            }
            this._effectRef = effect(() => this._itemsChanged(_items()), { injector });
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
        if (typeof ngDevMode === 'undefined' || ngDevMode) {
            const items = this._getItemsArray();
            if (items.length > 0 && items.some(item => typeof item.getLabel !== 'function')) {
                throw Error('ListKeyManager items in typeahead mode must implement the `getLabel` method.');
            }
        }
        this._typeaheadSubscription.unsubscribe();
        const items = this._getItemsArray();
        this._typeahead = new Typeahead(items, {
            debounceInterval: typeof debounceInterval === 'number' ? debounceInterval : undefined,
            skipPredicate: item => this._skipPredicateFn(item),
        });
        this._typeaheadSubscription = this._typeahead.selectedItem.subscribe(item => {
            this.setActiveItem(item);
        });
        return this;
    }
    /** Cancels the current typeahead sequence. */
    cancelTypeahead() {
        this._typeahead?.reset();
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
                    this._typeahead?.handleKey(event);
                }
                // Note that we return here, in order to avoid preventing
                // the default action of non-navigational keys.
                return;
        }
        this._typeahead?.reset();
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
        return !!this._typeahead && this._typeahead.isTyping();
    }
    /** Sets the active item to the first enabled item in the list. */
    setFirstItemActive() {
        this._setActiveItemByIndex(0, 1);
    }
    /** Sets the active item to the last enabled item in the list. */
    setLastItemActive() {
        this._setActiveItemByIndex(this._getItemsArray().length - 1, -1);
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
        this._typeahead?.setCurrentSelectedItemIndex(index);
    }
    /** Cleans up the key manager. */
    destroy() {
        this._typeaheadSubscription.unsubscribe();
        this._itemChangesSubscription?.unsubscribe();
        this._effectRef?.destroy();
        this._typeahead?.destroy();
        this.tabOut.complete();
        this.change.complete();
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
        if (isSignal(this._items)) {
            return this._items();
        }
        return this._items instanceof QueryList ? this._items.toArray() : this._items;
    }
    /** Callback for when the items have changed. */
    _itemsChanged(newItems) {
        this._typeahead?.setItems(newItems);
        if (this._activeItem) {
            const newIndex = newItems.indexOf(this._activeItem);
            if (newIndex > -1 && newIndex !== this._activeItemIndex) {
                this._activeItemIndex = newIndex;
                this._typeahead?.setCurrentSelectedItemIndex(newIndex);
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdC1rZXktbWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvYTExeS9rZXktbWFuYWdlci9saXN0LWtleS1tYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBc0IsU0FBUyxFQUFVLE1BQU0sRUFBRSxRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDdkYsT0FBTyxFQUFDLE9BQU8sRUFBRSxZQUFZLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDM0MsT0FBTyxFQUNMLFFBQVEsRUFDUixVQUFVLEVBQ1YsVUFBVSxFQUNWLFdBQVcsRUFDWCxHQUFHLEVBQ0gsY0FBYyxFQUNkLElBQUksRUFDSixHQUFHLEVBQ0gsT0FBTyxFQUNQLFNBQVMsR0FDVixNQUFNLHVCQUF1QixDQUFDO0FBQy9CLE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxhQUFhLENBQUM7QUFjdEM7OztHQUdHO0FBQ0gsTUFBTSxPQUFPLGNBQWM7SUFzQnpCLFlBQ1UsTUFBOEUsRUFDdEYsUUFBbUI7UUFEWCxXQUFNLEdBQU4sTUFBTSxDQUF3RTtRQXRCaEYscUJBQWdCLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDdEIsZ0JBQVcsR0FBYSxJQUFJLENBQUM7UUFDN0IsVUFBSyxHQUFHLEtBQUssQ0FBQztRQUNkLDJCQUFzQixHQUFHLFlBQVksQ0FBQyxLQUFLLENBQUM7UUFFNUMsY0FBUyxHQUFHLElBQUksQ0FBQztRQUVqQix5QkFBb0IsR0FBZ0MsRUFBRSxDQUFDO1FBQ3ZELGdCQUFXLEdBQUcsS0FBSyxDQUFDO1FBQ3BCLG1CQUFjLEdBQUcsRUFBQyxPQUFPLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUMsQ0FBQztRQUlyRDs7O1dBR0c7UUFDSyxxQkFBZ0IsR0FBRyxDQUFDLElBQU8sRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQztR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QyxJQUFJLFFBQVEsS0FBSyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztnQkFDeEQsSUFBSSxDQUFDLGdCQUFnQixHQUFHLFFBQVEsQ0FBQztnQkFDakMsSUFBSSxDQUFDLFVBQVUsRUFBRSwyQkFBMkIsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUN6RCxDQUFDO1FBQ0gsQ0FBQztJQUNILENBQUM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0VmZmVjdFJlZiwgSW5qZWN0b3IsIFF1ZXJ5TGlzdCwgU2lnbmFsLCBlZmZlY3QsIGlzU2lnbmFsfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7U3ViamVjdCwgU3Vic2NyaXB0aW9ufSBmcm9tICdyeGpzJztcbmltcG9ydCB7XG4gIFVQX0FSUk9XLFxuICBET1dOX0FSUk9XLFxuICBMRUZUX0FSUk9XLFxuICBSSUdIVF9BUlJPVyxcbiAgVEFCLFxuICBoYXNNb2RpZmllcktleSxcbiAgSE9NRSxcbiAgRU5ELFxuICBQQUdFX1VQLFxuICBQQUdFX0RPV04sXG59IGZyb20gJ0Bhbmd1bGFyL2Nkay9rZXljb2Rlcyc7XG5pbXBvcnQge1R5cGVhaGVhZH0gZnJvbSAnLi90eXBlYWhlYWQnO1xuXG4vKiogVGhpcyBpbnRlcmZhY2UgaXMgZm9yIGl0ZW1zIHRoYXQgY2FuIGJlIHBhc3NlZCB0byBhIExpc3RLZXlNYW5hZ2VyLiAqL1xuZXhwb3J0IGludGVyZmFjZSBMaXN0S2V5TWFuYWdlck9wdGlvbiB7XG4gIC8qKiBXaGV0aGVyIHRoZSBvcHRpb24gaXMgZGlzYWJsZWQuICovXG4gIGRpc2FibGVkPzogYm9vbGVhbjtcblxuICAvKiogR2V0cyB0aGUgbGFiZWwgZm9yIHRoaXMgb3B0aW9uLiAqL1xuICBnZXRMYWJlbD8oKTogc3RyaW5nO1xufVxuXG4vKiogTW9kaWZpZXIga2V5cyBoYW5kbGVkIGJ5IHRoZSBMaXN0S2V5TWFuYWdlci4gKi9cbmV4cG9ydCB0eXBlIExpc3RLZXlNYW5hZ2VyTW9kaWZpZXJLZXkgPSAnYWx0S2V5JyB8ICdjdHJsS2V5JyB8ICdtZXRhS2V5JyB8ICdzaGlmdEtleSc7XG5cbi8qKlxuICogVGhpcyBjbGFzcyBtYW5hZ2VzIGtleWJvYXJkIGV2ZW50cyBmb3Igc2VsZWN0YWJsZSBsaXN0cy4gSWYgeW91IHBhc3MgaXQgYSBxdWVyeSBsaXN0XG4gKiBvZiBpdGVtcywgaXQgd2lsbCBzZXQgdGhlIGFjdGl2ZSBpdGVtIGNvcnJlY3RseSB3aGVuIGFycm93IGV2ZW50cyBvY2N1ci5cbiAqL1xuZXhwb3J0IGNsYXNzIExpc3RLZXlNYW5hZ2VyPFQgZXh0ZW5kcyBMaXN0S2V5TWFuYWdlck9wdGlvbj4ge1xuICBwcml2YXRlIF9hY3RpdmVJdGVtSW5kZXggPSAtMTtcbiAgcHJpdmF0ZSBfYWN0aXZlSXRlbTogVCB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIF93cmFwID0gZmFsc2U7XG4gIHByaXZhdGUgX3R5cGVhaGVhZFN1YnNjcmlwdGlvbiA9IFN1YnNjcmlwdGlvbi5FTVBUWTtcbiAgcHJpdmF0ZSBfaXRlbUNoYW5nZXNTdWJzY3JpcHRpb24/OiBTdWJzY3JpcHRpb247XG4gIHByaXZhdGUgX3ZlcnRpY2FsID0gdHJ1ZTtcbiAgcHJpdmF0ZSBfaG9yaXpvbnRhbDogJ2x0cicgfCAncnRsJyB8IG51bGw7XG4gIHByaXZhdGUgX2FsbG93ZWRNb2RpZmllcktleXM6IExpc3RLZXlNYW5hZ2VyTW9kaWZpZXJLZXlbXSA9IFtdO1xuICBwcml2YXRlIF9ob21lQW5kRW5kID0gZmFsc2U7XG4gIHByaXZhdGUgX3BhZ2VVcEFuZERvd24gPSB7ZW5hYmxlZDogZmFsc2UsIGRlbHRhOiAxMH07XG4gIHByaXZhdGUgX2VmZmVjdFJlZjogRWZmZWN0UmVmIHwgdW5kZWZpbmVkO1xuICBwcml2YXRlIF90eXBlYWhlYWQ/OiBUeXBlYWhlYWQ8VD47XG5cbiAgLyoqXG4gICAqIFByZWRpY2F0ZSBmdW5jdGlvbiB0aGF0IGNhbiBiZSB1c2VkIHRvIGNoZWNrIHdoZXRoZXIgYW4gaXRlbSBzaG91bGQgYmUgc2tpcHBlZFxuICAgKiBieSB0aGUga2V5IG1hbmFnZXIuIEJ5IGRlZmF1bHQsIGRpc2FibGVkIGl0ZW1zIGFyZSBza2lwcGVkLlxuICAgKi9cbiAgcHJpdmF0ZSBfc2tpcFByZWRpY2F0ZUZuID0gKGl0ZW06IFQpID0+IGl0ZW0uZGlzYWJsZWQ7XG5cbiAgY29uc3RydWN0b3IoaXRlbXM6IFF1ZXJ5TGlzdDxUPiB8IFRbXSB8IHJlYWRvbmx5IFRbXSk7XG4gIGNvbnN0cnVjdG9yKGl0ZW1zOiBTaWduYWw8VFtdPiB8IFNpZ25hbDxyZWFkb25seSBUW10+LCBpbmplY3RvcjogSW5qZWN0b3IpO1xuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIF9pdGVtczogUXVlcnlMaXN0PFQ+IHwgVFtdIHwgcmVhZG9ubHkgVFtdIHwgU2lnbmFsPFRbXT4gfCBTaWduYWw8cmVhZG9ubHkgVFtdPixcbiAgICBpbmplY3Rvcj86IEluamVjdG9yLFxuICApIHtcbiAgICAvLyBXZSBhbGxvdyBmb3IgdGhlIGl0ZW1zIHRvIGJlIGFuIGFycmF5IGJlY2F1c2UsIGluIHNvbWUgY2FzZXMsIHRoZSBjb25zdW1lciBtYXlcbiAgICAvLyBub3QgaGF2ZSBhY2Nlc3MgdG8gYSBRdWVyeUxpc3Qgb2YgdGhlIGl0ZW1zIHRoZXkgd2FudCB0byBtYW5hZ2UgKGUuZy4gd2hlbiB0aGVcbiAgICAvLyBpdGVtcyBhcmVuJ3QgYmVpbmcgY29sbGVjdGVkIHZpYSBgVmlld0NoaWxkcmVuYCBvciBgQ29udGVudENoaWxkcmVuYCkuXG4gICAgaWYgKF9pdGVtcyBpbnN0YW5jZW9mIFF1ZXJ5TGlzdCkge1xuICAgICAgdGhpcy5faXRlbUNoYW5nZXNTdWJzY3JpcHRpb24gPSBfaXRlbXMuY2hhbmdlcy5zdWJzY3JpYmUoKG5ld0l0ZW1zOiBRdWVyeUxpc3Q8VD4pID0+XG4gICAgICAgIHRoaXMuX2l0ZW1zQ2hhbmdlZChuZXdJdGVtcy50b0FycmF5KCkpLFxuICAgICAgKTtcbiAgICB9IGVsc2UgaWYgKGlzU2lnbmFsKF9pdGVtcykpIHtcbiAgICAgIGlmICghaW5qZWN0b3IgJiYgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdMaXN0S2V5TWFuYWdlciBjb25zdHJ1Y3RlZCB3aXRoIGEgc2lnbmFsIG11c3QgcmVjZWl2ZSBhbiBpbmplY3RvcicpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9lZmZlY3RSZWYgPSBlZmZlY3QoKCkgPT4gdGhpcy5faXRlbXNDaGFuZ2VkKF9pdGVtcygpKSwge2luamVjdG9yfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFN0cmVhbSB0aGF0IGVtaXRzIGFueSB0aW1lIHRoZSBUQUIga2V5IGlzIHByZXNzZWQsIHNvIGNvbXBvbmVudHMgY2FuIHJlYWN0XG4gICAqIHdoZW4gZm9jdXMgaXMgc2hpZnRlZCBvZmYgb2YgdGhlIGxpc3QuXG4gICAqL1xuICByZWFkb25seSB0YWJPdXQgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xuXG4gIC8qKiBTdHJlYW0gdGhhdCBlbWl0cyB3aGVuZXZlciB0aGUgYWN0aXZlIGl0ZW0gb2YgdGhlIGxpc3QgbWFuYWdlciBjaGFuZ2VzLiAqL1xuICByZWFkb25seSBjaGFuZ2UgPSBuZXcgU3ViamVjdDxudW1iZXI+KCk7XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHByZWRpY2F0ZSBmdW5jdGlvbiB0aGF0IGRldGVybWluZXMgd2hpY2ggaXRlbXMgc2hvdWxkIGJlIHNraXBwZWQgYnkgdGhlXG4gICAqIGxpc3Qga2V5IG1hbmFnZXIuXG4gICAqIEBwYXJhbSBwcmVkaWNhdGUgRnVuY3Rpb24gdGhhdCBkZXRlcm1pbmVzIHdoZXRoZXIgdGhlIGdpdmVuIGl0ZW0gc2hvdWxkIGJlIHNraXBwZWQuXG4gICAqL1xuICBza2lwUHJlZGljYXRlKHByZWRpY2F0ZTogKGl0ZW06IFQpID0+IGJvb2xlYW4pOiB0aGlzIHtcbiAgICB0aGlzLl9za2lwUHJlZGljYXRlRm4gPSBwcmVkaWNhdGU7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogQ29uZmlndXJlcyB3cmFwcGluZyBtb2RlLCB3aGljaCBkZXRlcm1pbmVzIHdoZXRoZXIgdGhlIGFjdGl2ZSBpdGVtIHdpbGwgd3JhcCB0b1xuICAgKiB0aGUgb3RoZXIgZW5kIG9mIGxpc3Qgd2hlbiB0aGVyZSBhcmUgbm8gbW9yZSBpdGVtcyBpbiB0aGUgZ2l2ZW4gZGlyZWN0aW9uLlxuICAgKiBAcGFyYW0gc2hvdWxkV3JhcCBXaGV0aGVyIHRoZSBsaXN0IHNob3VsZCB3cmFwIHdoZW4gcmVhY2hpbmcgdGhlIGVuZC5cbiAgICovXG4gIHdpdGhXcmFwKHNob3VsZFdyYXAgPSB0cnVlKTogdGhpcyB7XG4gICAgdGhpcy5fd3JhcCA9IHNob3VsZFdyYXA7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogQ29uZmlndXJlcyB3aGV0aGVyIHRoZSBrZXkgbWFuYWdlciBzaG91bGQgYmUgYWJsZSB0byBtb3ZlIHRoZSBzZWxlY3Rpb24gdmVydGljYWxseS5cbiAgICogQHBhcmFtIGVuYWJsZWQgV2hldGhlciB2ZXJ0aWNhbCBzZWxlY3Rpb24gc2hvdWxkIGJlIGVuYWJsZWQuXG4gICAqL1xuICB3aXRoVmVydGljYWxPcmllbnRhdGlvbihlbmFibGVkOiBib29sZWFuID0gdHJ1ZSk6IHRoaXMge1xuICAgIHRoaXMuX3ZlcnRpY2FsID0gZW5hYmxlZDtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBDb25maWd1cmVzIHRoZSBrZXkgbWFuYWdlciB0byBtb3ZlIHRoZSBzZWxlY3Rpb24gaG9yaXpvbnRhbGx5LlxuICAgKiBQYXNzaW5nIGluIGBudWxsYCB3aWxsIGRpc2FibGUgaG9yaXpvbnRhbCBtb3ZlbWVudC5cbiAgICogQHBhcmFtIGRpcmVjdGlvbiBEaXJlY3Rpb24gaW4gd2hpY2ggdGhlIHNlbGVjdGlvbiBjYW4gYmUgbW92ZWQuXG4gICAqL1xuICB3aXRoSG9yaXpvbnRhbE9yaWVudGF0aW9uKGRpcmVjdGlvbjogJ2x0cicgfCAncnRsJyB8IG51bGwpOiB0aGlzIHtcbiAgICB0aGlzLl9ob3Jpem9udGFsID0gZGlyZWN0aW9uO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIE1vZGlmaWVyIGtleXMgd2hpY2ggYXJlIGFsbG93ZWQgdG8gYmUgaGVsZCBkb3duIGFuZCB3aG9zZSBkZWZhdWx0IGFjdGlvbnMgd2lsbCBiZSBwcmV2ZW50ZWRcbiAgICogYXMgdGhlIHVzZXIgaXMgcHJlc3NpbmcgdGhlIGFycm93IGtleXMuIERlZmF1bHRzIHRvIG5vdCBhbGxvd2luZyBhbnkgbW9kaWZpZXIga2V5cy5cbiAgICovXG4gIHdpdGhBbGxvd2VkTW9kaWZpZXJLZXlzKGtleXM6IExpc3RLZXlNYW5hZ2VyTW9kaWZpZXJLZXlbXSk6IHRoaXMge1xuICAgIHRoaXMuX2FsbG93ZWRNb2RpZmllcktleXMgPSBrZXlzO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFR1cm5zIG9uIHR5cGVhaGVhZCBtb2RlIHdoaWNoIGFsbG93cyB1c2VycyB0byBzZXQgdGhlIGFjdGl2ZSBpdGVtIGJ5IHR5cGluZy5cbiAgICogQHBhcmFtIGRlYm91bmNlSW50ZXJ2YWwgVGltZSB0byB3YWl0IGFmdGVyIHRoZSBsYXN0IGtleXN0cm9rZSBiZWZvcmUgc2V0dGluZyB0aGUgYWN0aXZlIGl0ZW0uXG4gICAqL1xuICB3aXRoVHlwZUFoZWFkKGRlYm91bmNlSW50ZXJ2YWw6IG51bWJlciA9IDIwMCk6IHRoaXMge1xuICAgIGlmICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpIHtcbiAgICAgIGNvbnN0IGl0ZW1zID0gdGhpcy5fZ2V0SXRlbXNBcnJheSgpO1xuICAgICAgaWYgKGl0ZW1zLmxlbmd0aCA+IDAgJiYgaXRlbXMuc29tZShpdGVtID0+IHR5cGVvZiBpdGVtLmdldExhYmVsICE9PSAnZnVuY3Rpb24nKSkge1xuICAgICAgICB0aHJvdyBFcnJvcignTGlzdEtleU1hbmFnZXIgaXRlbXMgaW4gdHlwZWFoZWFkIG1vZGUgbXVzdCBpbXBsZW1lbnQgdGhlIGBnZXRMYWJlbGAgbWV0aG9kLicpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuX3R5cGVhaGVhZFN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuXG4gICAgY29uc3QgaXRlbXMgPSB0aGlzLl9nZXRJdGVtc0FycmF5KCk7XG4gICAgdGhpcy5fdHlwZWFoZWFkID0gbmV3IFR5cGVhaGVhZChpdGVtcywge1xuICAgICAgZGVib3VuY2VJbnRlcnZhbDogdHlwZW9mIGRlYm91bmNlSW50ZXJ2YWwgPT09ICdudW1iZXInID8gZGVib3VuY2VJbnRlcnZhbCA6IHVuZGVmaW5lZCxcbiAgICAgIHNraXBQcmVkaWNhdGU6IGl0ZW0gPT4gdGhpcy5fc2tpcFByZWRpY2F0ZUZuKGl0ZW0pLFxuICAgIH0pO1xuXG4gICAgdGhpcy5fdHlwZWFoZWFkU3Vic2NyaXB0aW9uID0gdGhpcy5fdHlwZWFoZWFkLnNlbGVjdGVkSXRlbS5zdWJzY3JpYmUoaXRlbSA9PiB7XG4gICAgICB0aGlzLnNldEFjdGl2ZUl0ZW0oaXRlbSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKiBDYW5jZWxzIHRoZSBjdXJyZW50IHR5cGVhaGVhZCBzZXF1ZW5jZS4gKi9cbiAgY2FuY2VsVHlwZWFoZWFkKCk6IHRoaXMge1xuICAgIHRoaXMuX3R5cGVhaGVhZD8ucmVzZXQoKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBDb25maWd1cmVzIHRoZSBrZXkgbWFuYWdlciB0byBhY3RpdmF0ZSB0aGUgZmlyc3QgYW5kIGxhc3QgaXRlbXNcbiAgICogcmVzcGVjdGl2ZWx5IHdoZW4gdGhlIEhvbWUgb3IgRW5kIGtleSBpcyBwcmVzc2VkLlxuICAgKiBAcGFyYW0gZW5hYmxlZCBXaGV0aGVyIHByZXNzaW5nIHRoZSBIb21lIG9yIEVuZCBrZXkgYWN0aXZhdGVzIHRoZSBmaXJzdC9sYXN0IGl0ZW0uXG4gICAqL1xuICB3aXRoSG9tZUFuZEVuZChlbmFibGVkOiBib29sZWFuID0gdHJ1ZSk6IHRoaXMge1xuICAgIHRoaXMuX2hvbWVBbmRFbmQgPSBlbmFibGVkO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbmZpZ3VyZXMgdGhlIGtleSBtYW5hZ2VyIHRvIGFjdGl2YXRlIGV2ZXJ5IDEwdGgsIGNvbmZpZ3VyZWQgb3IgZmlyc3QvbGFzdCBlbGVtZW50IGluIHVwL2Rvd24gZGlyZWN0aW9uXG4gICAqIHJlc3BlY3RpdmVseSB3aGVuIHRoZSBQYWdlLVVwIG9yIFBhZ2UtRG93biBrZXkgaXMgcHJlc3NlZC5cbiAgICogQHBhcmFtIGVuYWJsZWQgV2hldGhlciBwcmVzc2luZyB0aGUgUGFnZS1VcCBvciBQYWdlLURvd24ga2V5IGFjdGl2YXRlcyB0aGUgZmlyc3QvbGFzdCBpdGVtLlxuICAgKiBAcGFyYW0gZGVsdGEgV2hldGhlciBwcmVzc2luZyB0aGUgSG9tZSBvciBFbmQga2V5IGFjdGl2YXRlcyB0aGUgZmlyc3QvbGFzdCBpdGVtLlxuICAgKi9cbiAgd2l0aFBhZ2VVcERvd24oZW5hYmxlZDogYm9vbGVhbiA9IHRydWUsIGRlbHRhOiBudW1iZXIgPSAxMCk6IHRoaXMge1xuICAgIHRoaXMuX3BhZ2VVcEFuZERvd24gPSB7ZW5hYmxlZCwgZGVsdGF9O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGFjdGl2ZSBpdGVtIHRvIHRoZSBpdGVtIGF0IHRoZSBpbmRleCBzcGVjaWZpZWQuXG4gICAqIEBwYXJhbSBpbmRleCBUaGUgaW5kZXggb2YgdGhlIGl0ZW0gdG8gYmUgc2V0IGFzIGFjdGl2ZS5cbiAgICovXG4gIHNldEFjdGl2ZUl0ZW0oaW5kZXg6IG51bWJlcik6IHZvaWQ7XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGFjdGl2ZSBpdGVtIHRvIHRoZSBzcGVjaWZpZWQgaXRlbS5cbiAgICogQHBhcmFtIGl0ZW0gVGhlIGl0ZW0gdG8gYmUgc2V0IGFzIGFjdGl2ZS5cbiAgICovXG4gIHNldEFjdGl2ZUl0ZW0oaXRlbTogVCk6IHZvaWQ7XG5cbiAgc2V0QWN0aXZlSXRlbShpdGVtOiBhbnkpOiB2b2lkIHtcbiAgICBjb25zdCBwcmV2aW91c0FjdGl2ZUl0ZW0gPSB0aGlzLl9hY3RpdmVJdGVtO1xuXG4gICAgdGhpcy51cGRhdGVBY3RpdmVJdGVtKGl0ZW0pO1xuXG4gICAgaWYgKHRoaXMuX2FjdGl2ZUl0ZW0gIT09IHByZXZpb3VzQWN0aXZlSXRlbSkge1xuICAgICAgdGhpcy5jaGFuZ2UubmV4dCh0aGlzLl9hY3RpdmVJdGVtSW5kZXgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBhY3RpdmUgaXRlbSBkZXBlbmRpbmcgb24gdGhlIGtleSBldmVudCBwYXNzZWQgaW4uXG4gICAqIEBwYXJhbSBldmVudCBLZXlib2FyZCBldmVudCB0byBiZSB1c2VkIGZvciBkZXRlcm1pbmluZyB3aGljaCBlbGVtZW50IHNob3VsZCBiZSBhY3RpdmUuXG4gICAqL1xuICBvbktleWRvd24oZXZlbnQ6IEtleWJvYXJkRXZlbnQpOiB2b2lkIHtcbiAgICBjb25zdCBrZXlDb2RlID0gZXZlbnQua2V5Q29kZTtcbiAgICBjb25zdCBtb2RpZmllcnM6IExpc3RLZXlNYW5hZ2VyTW9kaWZpZXJLZXlbXSA9IFsnYWx0S2V5JywgJ2N0cmxLZXknLCAnbWV0YUtleScsICdzaGlmdEtleSddO1xuICAgIGNvbnN0IGlzTW9kaWZpZXJBbGxvd2VkID0gbW9kaWZpZXJzLmV2ZXJ5KG1vZGlmaWVyID0+IHtcbiAgICAgIHJldHVybiAhZXZlbnRbbW9kaWZpZXJdIHx8IHRoaXMuX2FsbG93ZWRNb2RpZmllcktleXMuaW5kZXhPZihtb2RpZmllcikgPiAtMTtcbiAgICB9KTtcblxuICAgIHN3aXRjaCAoa2V5Q29kZSkge1xuICAgICAgY2FzZSBUQUI6XG4gICAgICAgIHRoaXMudGFiT3V0Lm5leHQoKTtcbiAgICAgICAgcmV0dXJuO1xuXG4gICAgICBjYXNlIERPV05fQVJST1c6XG4gICAgICAgIGlmICh0aGlzLl92ZXJ0aWNhbCAmJiBpc01vZGlmaWVyQWxsb3dlZCkge1xuICAgICAgICAgIHRoaXMuc2V0TmV4dEl0ZW1BY3RpdmUoKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgY2FzZSBVUF9BUlJPVzpcbiAgICAgICAgaWYgKHRoaXMuX3ZlcnRpY2FsICYmIGlzTW9kaWZpZXJBbGxvd2VkKSB7XG4gICAgICAgICAgdGhpcy5zZXRQcmV2aW91c0l0ZW1BY3RpdmUoKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgY2FzZSBSSUdIVF9BUlJPVzpcbiAgICAgICAgaWYgKHRoaXMuX2hvcml6b250YWwgJiYgaXNNb2RpZmllckFsbG93ZWQpIHtcbiAgICAgICAgICB0aGlzLl9ob3Jpem9udGFsID09PSAncnRsJyA/IHRoaXMuc2V0UHJldmlvdXNJdGVtQWN0aXZlKCkgOiB0aGlzLnNldE5leHRJdGVtQWN0aXZlKCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgIGNhc2UgTEVGVF9BUlJPVzpcbiAgICAgICAgaWYgKHRoaXMuX2hvcml6b250YWwgJiYgaXNNb2RpZmllckFsbG93ZWQpIHtcbiAgICAgICAgICB0aGlzLl9ob3Jpem9udGFsID09PSAncnRsJyA/IHRoaXMuc2V0TmV4dEl0ZW1BY3RpdmUoKSA6IHRoaXMuc2V0UHJldmlvdXNJdGVtQWN0aXZlKCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgIGNhc2UgSE9NRTpcbiAgICAgICAgaWYgKHRoaXMuX2hvbWVBbmRFbmQgJiYgaXNNb2RpZmllckFsbG93ZWQpIHtcbiAgICAgICAgICB0aGlzLnNldEZpcnN0SXRlbUFjdGl2ZSgpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICBjYXNlIEVORDpcbiAgICAgICAgaWYgKHRoaXMuX2hvbWVBbmRFbmQgJiYgaXNNb2RpZmllckFsbG93ZWQpIHtcbiAgICAgICAgICB0aGlzLnNldExhc3RJdGVtQWN0aXZlKCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgIGNhc2UgUEFHRV9VUDpcbiAgICAgICAgaWYgKHRoaXMuX3BhZ2VVcEFuZERvd24uZW5hYmxlZCAmJiBpc01vZGlmaWVyQWxsb3dlZCkge1xuICAgICAgICAgIGNvbnN0IHRhcmdldEluZGV4ID0gdGhpcy5fYWN0aXZlSXRlbUluZGV4IC0gdGhpcy5fcGFnZVVwQW5kRG93bi5kZWx0YTtcbiAgICAgICAgICB0aGlzLl9zZXRBY3RpdmVJdGVtQnlJbmRleCh0YXJnZXRJbmRleCA+IDAgPyB0YXJnZXRJbmRleCA6IDAsIDEpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICBjYXNlIFBBR0VfRE9XTjpcbiAgICAgICAgaWYgKHRoaXMuX3BhZ2VVcEFuZERvd24uZW5hYmxlZCAmJiBpc01vZGlmaWVyQWxsb3dlZCkge1xuICAgICAgICAgIGNvbnN0IHRhcmdldEluZGV4ID0gdGhpcy5fYWN0aXZlSXRlbUluZGV4ICsgdGhpcy5fcGFnZVVwQW5kRG93bi5kZWx0YTtcbiAgICAgICAgICBjb25zdCBpdGVtc0xlbmd0aCA9IHRoaXMuX2dldEl0ZW1zQXJyYXkoKS5sZW5ndGg7XG4gICAgICAgICAgdGhpcy5fc2V0QWN0aXZlSXRlbUJ5SW5kZXgodGFyZ2V0SW5kZXggPCBpdGVtc0xlbmd0aCA/IHRhcmdldEluZGV4IDogaXRlbXNMZW5ndGggLSAxLCAtMSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGlmIChpc01vZGlmaWVyQWxsb3dlZCB8fCBoYXNNb2RpZmllcktleShldmVudCwgJ3NoaWZ0S2V5JykpIHtcbiAgICAgICAgICB0aGlzLl90eXBlYWhlYWQ/LmhhbmRsZUtleShldmVudCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBOb3RlIHRoYXQgd2UgcmV0dXJuIGhlcmUsIGluIG9yZGVyIHRvIGF2b2lkIHByZXZlbnRpbmdcbiAgICAgICAgLy8gdGhlIGRlZmF1bHQgYWN0aW9uIG9mIG5vbi1uYXZpZ2F0aW9uYWwga2V5cy5cbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX3R5cGVhaGVhZD8ucmVzZXQoKTtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICB9XG5cbiAgLyoqIEluZGV4IG9mIHRoZSBjdXJyZW50bHkgYWN0aXZlIGl0ZW0uICovXG4gIGdldCBhY3RpdmVJdGVtSW5kZXgoKTogbnVtYmVyIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuX2FjdGl2ZUl0ZW1JbmRleDtcbiAgfVxuXG4gIC8qKiBUaGUgYWN0aXZlIGl0ZW0uICovXG4gIGdldCBhY3RpdmVJdGVtKCk6IFQgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5fYWN0aXZlSXRlbTtcbiAgfVxuXG4gIC8qKiBHZXRzIHdoZXRoZXIgdGhlIHVzZXIgaXMgY3VycmVudGx5IHR5cGluZyBpbnRvIHRoZSBtYW5hZ2VyIHVzaW5nIHRoZSB0eXBlYWhlYWQgZmVhdHVyZS4gKi9cbiAgaXNUeXBpbmcoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICEhdGhpcy5fdHlwZWFoZWFkICYmIHRoaXMuX3R5cGVhaGVhZC5pc1R5cGluZygpO1xuICB9XG5cbiAgLyoqIFNldHMgdGhlIGFjdGl2ZSBpdGVtIHRvIHRoZSBmaXJzdCBlbmFibGVkIGl0ZW0gaW4gdGhlIGxpc3QuICovXG4gIHNldEZpcnN0SXRlbUFjdGl2ZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9zZXRBY3RpdmVJdGVtQnlJbmRleCgwLCAxKTtcbiAgfVxuXG4gIC8qKiBTZXRzIHRoZSBhY3RpdmUgaXRlbSB0byB0aGUgbGFzdCBlbmFibGVkIGl0ZW0gaW4gdGhlIGxpc3QuICovXG4gIHNldExhc3RJdGVtQWN0aXZlKCk6IHZvaWQge1xuICAgIHRoaXMuX3NldEFjdGl2ZUl0ZW1CeUluZGV4KHRoaXMuX2dldEl0ZW1zQXJyYXkoKS5sZW5ndGggLSAxLCAtMSk7XG4gIH1cblxuICAvKiogU2V0cyB0aGUgYWN0aXZlIGl0ZW0gdG8gdGhlIG5leHQgZW5hYmxlZCBpdGVtIGluIHRoZSBsaXN0LiAqL1xuICBzZXROZXh0SXRlbUFjdGl2ZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9hY3RpdmVJdGVtSW5kZXggPCAwID8gdGhpcy5zZXRGaXJzdEl0ZW1BY3RpdmUoKSA6IHRoaXMuX3NldEFjdGl2ZUl0ZW1CeURlbHRhKDEpO1xuICB9XG5cbiAgLyoqIFNldHMgdGhlIGFjdGl2ZSBpdGVtIHRvIGEgcHJldmlvdXMgZW5hYmxlZCBpdGVtIGluIHRoZSBsaXN0LiAqL1xuICBzZXRQcmV2aW91c0l0ZW1BY3RpdmUoKTogdm9pZCB7XG4gICAgdGhpcy5fYWN0aXZlSXRlbUluZGV4IDwgMCAmJiB0aGlzLl93cmFwXG4gICAgICA/IHRoaXMuc2V0TGFzdEl0ZW1BY3RpdmUoKVxuICAgICAgOiB0aGlzLl9zZXRBY3RpdmVJdGVtQnlEZWx0YSgtMSk7XG4gIH1cblxuICAvKipcbiAgICogQWxsb3dzIHNldHRpbmcgdGhlIGFjdGl2ZSB3aXRob3V0IGFueSBvdGhlciBlZmZlY3RzLlxuICAgKiBAcGFyYW0gaW5kZXggSW5kZXggb2YgdGhlIGl0ZW0gdG8gYmUgc2V0IGFzIGFjdGl2ZS5cbiAgICovXG4gIHVwZGF0ZUFjdGl2ZUl0ZW0oaW5kZXg6IG51bWJlcik6IHZvaWQ7XG5cbiAgLyoqXG4gICAqIEFsbG93cyBzZXR0aW5nIHRoZSBhY3RpdmUgaXRlbSB3aXRob3V0IGFueSBvdGhlciBlZmZlY3RzLlxuICAgKiBAcGFyYW0gaXRlbSBJdGVtIHRvIGJlIHNldCBhcyBhY3RpdmUuXG4gICAqL1xuICB1cGRhdGVBY3RpdmVJdGVtKGl0ZW06IFQpOiB2b2lkO1xuXG4gIHVwZGF0ZUFjdGl2ZUl0ZW0oaXRlbTogYW55KTogdm9pZCB7XG4gICAgY29uc3QgaXRlbUFycmF5ID0gdGhpcy5fZ2V0SXRlbXNBcnJheSgpO1xuICAgIGNvbnN0IGluZGV4ID0gdHlwZW9mIGl0ZW0gPT09ICdudW1iZXInID8gaXRlbSA6IGl0ZW1BcnJheS5pbmRleE9mKGl0ZW0pO1xuICAgIGNvbnN0IGFjdGl2ZUl0ZW0gPSBpdGVtQXJyYXlbaW5kZXhdO1xuXG4gICAgLy8gRXhwbGljaXRseSBjaGVjayBmb3IgYG51bGxgIGFuZCBgdW5kZWZpbmVkYCBiZWNhdXNlIG90aGVyIGZhbHN5IHZhbHVlcyBhcmUgdmFsaWQuXG4gICAgdGhpcy5fYWN0aXZlSXRlbSA9IGFjdGl2ZUl0ZW0gPT0gbnVsbCA/IG51bGwgOiBhY3RpdmVJdGVtO1xuICAgIHRoaXMuX2FjdGl2ZUl0ZW1JbmRleCA9IGluZGV4O1xuICAgIHRoaXMuX3R5cGVhaGVhZD8uc2V0Q3VycmVudFNlbGVjdGVkSXRlbUluZGV4KGluZGV4KTtcbiAgfVxuXG4gIC8qKiBDbGVhbnMgdXAgdGhlIGtleSBtYW5hZ2VyLiAqL1xuICBkZXN0cm95KCkge1xuICAgIHRoaXMuX3R5cGVhaGVhZFN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICAgIHRoaXMuX2l0ZW1DaGFuZ2VzU3Vic2NyaXB0aW9uPy51bnN1YnNjcmliZSgpO1xuICAgIHRoaXMuX2VmZmVjdFJlZj8uZGVzdHJveSgpO1xuICAgIHRoaXMuX3R5cGVhaGVhZD8uZGVzdHJveSgpO1xuICAgIHRoaXMudGFiT3V0LmNvbXBsZXRlKCk7XG4gICAgdGhpcy5jaGFuZ2UuY29tcGxldGUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIG1ldGhvZCBzZXRzIHRoZSBhY3RpdmUgaXRlbSwgZ2l2ZW4gYSBsaXN0IG9mIGl0ZW1zIGFuZCB0aGUgZGVsdGEgYmV0d2VlbiB0aGVcbiAgICogY3VycmVudGx5IGFjdGl2ZSBpdGVtIGFuZCB0aGUgbmV3IGFjdGl2ZSBpdGVtLiBJdCB3aWxsIGNhbGN1bGF0ZSBkaWZmZXJlbnRseVxuICAgKiBkZXBlbmRpbmcgb24gd2hldGhlciB3cmFwIG1vZGUgaXMgdHVybmVkIG9uLlxuICAgKi9cbiAgcHJpdmF0ZSBfc2V0QWN0aXZlSXRlbUJ5RGVsdGEoZGVsdGE6IC0xIHwgMSk6IHZvaWQge1xuICAgIHRoaXMuX3dyYXAgPyB0aGlzLl9zZXRBY3RpdmVJbldyYXBNb2RlKGRlbHRhKSA6IHRoaXMuX3NldEFjdGl2ZUluRGVmYXVsdE1vZGUoZGVsdGEpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGFjdGl2ZSBpdGVtIHByb3Blcmx5IGdpdmVuIFwid3JhcFwiIG1vZGUuIEluIG90aGVyIHdvcmRzLCBpdCB3aWxsIGNvbnRpbnVlIHRvIG1vdmVcbiAgICogZG93biB0aGUgbGlzdCB1bnRpbCBpdCBmaW5kcyBhbiBpdGVtIHRoYXQgaXMgbm90IGRpc2FibGVkLCBhbmQgaXQgd2lsbCB3cmFwIGlmIGl0XG4gICAqIGVuY291bnRlcnMgZWl0aGVyIGVuZCBvZiB0aGUgbGlzdC5cbiAgICovXG4gIHByaXZhdGUgX3NldEFjdGl2ZUluV3JhcE1vZGUoZGVsdGE6IC0xIHwgMSk6IHZvaWQge1xuICAgIGNvbnN0IGl0ZW1zID0gdGhpcy5fZ2V0SXRlbXNBcnJheSgpO1xuXG4gICAgZm9yIChsZXQgaSA9IDE7IGkgPD0gaXRlbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGluZGV4ID0gKHRoaXMuX2FjdGl2ZUl0ZW1JbmRleCArIGRlbHRhICogaSArIGl0ZW1zLmxlbmd0aCkgJSBpdGVtcy5sZW5ndGg7XG4gICAgICBjb25zdCBpdGVtID0gaXRlbXNbaW5kZXhdO1xuXG4gICAgICBpZiAoIXRoaXMuX3NraXBQcmVkaWNhdGVGbihpdGVtKSkge1xuICAgICAgICB0aGlzLnNldEFjdGl2ZUl0ZW0oaW5kZXgpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGFjdGl2ZSBpdGVtIHByb3Blcmx5IGdpdmVuIHRoZSBkZWZhdWx0IG1vZGUuIEluIG90aGVyIHdvcmRzLCBpdCB3aWxsXG4gICAqIGNvbnRpbnVlIHRvIG1vdmUgZG93biB0aGUgbGlzdCB1bnRpbCBpdCBmaW5kcyBhbiBpdGVtIHRoYXQgaXMgbm90IGRpc2FibGVkLiBJZlxuICAgKiBpdCBlbmNvdW50ZXJzIGVpdGhlciBlbmQgb2YgdGhlIGxpc3QsIGl0IHdpbGwgc3RvcCBhbmQgbm90IHdyYXAuXG4gICAqL1xuICBwcml2YXRlIF9zZXRBY3RpdmVJbkRlZmF1bHRNb2RlKGRlbHRhOiAtMSB8IDEpOiB2b2lkIHtcbiAgICB0aGlzLl9zZXRBY3RpdmVJdGVtQnlJbmRleCh0aGlzLl9hY3RpdmVJdGVtSW5kZXggKyBkZWx0YSwgZGVsdGEpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGFjdGl2ZSBpdGVtIHRvIHRoZSBmaXJzdCBlbmFibGVkIGl0ZW0gc3RhcnRpbmcgYXQgdGhlIGluZGV4IHNwZWNpZmllZC4gSWYgdGhlXG4gICAqIGl0ZW0gaXMgZGlzYWJsZWQsIGl0IHdpbGwgbW92ZSBpbiB0aGUgZmFsbGJhY2tEZWx0YSBkaXJlY3Rpb24gdW50aWwgaXQgZWl0aGVyXG4gICAqIGZpbmRzIGFuIGVuYWJsZWQgaXRlbSBvciBlbmNvdW50ZXJzIHRoZSBlbmQgb2YgdGhlIGxpc3QuXG4gICAqL1xuICBwcml2YXRlIF9zZXRBY3RpdmVJdGVtQnlJbmRleChpbmRleDogbnVtYmVyLCBmYWxsYmFja0RlbHRhOiAtMSB8IDEpOiB2b2lkIHtcbiAgICBjb25zdCBpdGVtcyA9IHRoaXMuX2dldEl0ZW1zQXJyYXkoKTtcblxuICAgIGlmICghaXRlbXNbaW5kZXhdKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgd2hpbGUgKHRoaXMuX3NraXBQcmVkaWNhdGVGbihpdGVtc1tpbmRleF0pKSB7XG4gICAgICBpbmRleCArPSBmYWxsYmFja0RlbHRhO1xuXG4gICAgICBpZiAoIWl0ZW1zW2luZGV4XSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5zZXRBY3RpdmVJdGVtKGluZGV4KTtcbiAgfVxuXG4gIC8qKiBSZXR1cm5zIHRoZSBpdGVtcyBhcyBhbiBhcnJheS4gKi9cbiAgcHJpdmF0ZSBfZ2V0SXRlbXNBcnJheSgpOiBUW10gfCByZWFkb25seSBUW10ge1xuICAgIGlmIChpc1NpZ25hbCh0aGlzLl9pdGVtcykpIHtcbiAgICAgIHJldHVybiB0aGlzLl9pdGVtcygpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9pdGVtcyBpbnN0YW5jZW9mIFF1ZXJ5TGlzdCA/IHRoaXMuX2l0ZW1zLnRvQXJyYXkoKSA6IHRoaXMuX2l0ZW1zO1xuICB9XG5cbiAgLyoqIENhbGxiYWNrIGZvciB3aGVuIHRoZSBpdGVtcyBoYXZlIGNoYW5nZWQuICovXG4gIHByaXZhdGUgX2l0ZW1zQ2hhbmdlZChuZXdJdGVtczogVFtdIHwgcmVhZG9ubHkgVFtdKSB7XG4gICAgdGhpcy5fdHlwZWFoZWFkPy5zZXRJdGVtcyhuZXdJdGVtcyk7XG4gICAgaWYgKHRoaXMuX2FjdGl2ZUl0ZW0pIHtcbiAgICAgIGNvbnN0IG5ld0luZGV4ID0gbmV3SXRlbXMuaW5kZXhPZih0aGlzLl9hY3RpdmVJdGVtKTtcblxuICAgICAgaWYgKG5ld0luZGV4ID4gLTEgJiYgbmV3SW5kZXggIT09IHRoaXMuX2FjdGl2ZUl0ZW1JbmRleCkge1xuICAgICAgICB0aGlzLl9hY3RpdmVJdGVtSW5kZXggPSBuZXdJbmRleDtcbiAgICAgICAgdGhpcy5fdHlwZWFoZWFkPy5zZXRDdXJyZW50U2VsZWN0ZWRJdGVtSW5kZXgobmV3SW5kZXgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIl19