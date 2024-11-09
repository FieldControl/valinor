/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { booleanAttribute, ChangeDetectorRef, ContentChildren, Directive, ElementRef, forwardRef, inject, Input, NgZone, Output, QueryList, } from '@angular/core';
import { ActiveDescendantKeyManager } from '@angular/cdk/a11y';
import { A, DOWN_ARROW, END, ENTER, hasModifierKey, HOME, LEFT_ARROW, RIGHT_ARROW, SPACE, UP_ARROW, } from '@angular/cdk/keycodes';
import { coerceArray } from '@angular/cdk/coercion';
import { SelectionModel } from '@angular/cdk/collections';
import { defer, fromEvent, merge, Subject } from 'rxjs';
import { filter, map, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Directionality } from '@angular/cdk/bidi';
import { Platform } from '@angular/cdk/platform';
import * as i0 from "@angular/core";
/** The next id to use for creating unique DOM IDs. */
let nextId = 0;
/**
 * An implementation of SelectionModel that internally always represents the selection as a
 * multi-selection. This is necessary so that we can recover the full selection if the user
 * switches the listbox from single-selection to multi-selection after initialization.
 *
 * This selection model may report multiple selected values, even if it is in single-selection
 * mode. It is up to the user (CdkListbox) to check for invalid selections.
 */
class ListboxSelectionModel extends SelectionModel {
    constructor(multiple = false, initiallySelectedValues, emitChanges = true, compareWith) {
        super(true, initiallySelectedValues, emitChanges, compareWith);
        this.multiple = multiple;
    }
    isMultipleSelection() {
        return this.multiple;
    }
    select(...values) {
        // The super class is always in multi-selection mode, so we need to override the behavior if
        // this selection model actually belongs to a single-selection listbox.
        if (this.multiple) {
            return super.select(...values);
        }
        else {
            return super.setSelection(...values);
        }
    }
}
/** A selectable option in a listbox. */
export class CdkOption {
    constructor() {
        this._generatedId = `cdk-option-${nextId++}`;
        this._disabled = false;
        /** The option's host element */
        this.element = inject(ElementRef).nativeElement;
        /** The parent listbox this option belongs to. */
        this.listbox = inject(CdkListbox);
        /** Emits when the option is destroyed. */
        this.destroyed = new Subject();
        /** Emits when the option is clicked. */
        this._clicked = new Subject();
    }
    /** The id of the option's host element. */
    get id() {
        return this._id || this._generatedId;
    }
    set id(value) {
        this._id = value;
    }
    /** Whether this option is disabled. */
    get disabled() {
        return this.listbox.disabled || this._disabled;
    }
    set disabled(value) {
        this._disabled = value;
    }
    /** The tabindex of the option when it is enabled. */
    get enabledTabIndex() {
        return this._enabledTabIndex === undefined
            ? this.listbox.enabledTabIndex
            : this._enabledTabIndex;
    }
    set enabledTabIndex(value) {
        this._enabledTabIndex = value;
    }
    ngOnDestroy() {
        this.destroyed.next();
        this.destroyed.complete();
    }
    /** Whether this option is selected. */
    isSelected() {
        return this.listbox.isSelected(this);
    }
    /** Whether this option is active. */
    isActive() {
        return this.listbox.isActive(this);
    }
    /** Toggle the selected state of this option. */
    toggle() {
        this.listbox.toggle(this);
    }
    /** Select this option if it is not selected. */
    select() {
        this.listbox.select(this);
    }
    /** Deselect this option if it is selected. */
    deselect() {
        this.listbox.deselect(this);
    }
    /** Focus this option. */
    focus() {
        this.element.focus();
    }
    /** Get the label for this element which is required by the FocusableOption interface. */
    getLabel() {
        return (this.typeaheadLabel ?? this.element.textContent?.trim()) || '';
    }
    /**
     * No-op implemented as a part of `Highlightable`.
     * @docs-private
     */
    setActiveStyles() { }
    /**
     * No-op implemented as a part of `Highlightable`.
     * @docs-private
     */
    setInactiveStyles() { }
    /** Handle focus events on the option. */
    _handleFocus() {
        // Options can wind up getting focused in active descendant mode if the user clicks on them.
        // In this case, we push focus back to the parent listbox to prevent an extra tab stop when
        // the user performs a shift+tab.
        if (this.listbox.useActiveDescendant) {
            this.listbox._setActiveOption(this);
            this.listbox.focus();
        }
    }
    /** Get the tabindex for this option. */
    _getTabIndex() {
        if (this.listbox.useActiveDescendant || this.disabled) {
            return -1;
        }
        return this.isActive() ? this.enabledTabIndex : -1;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.2.0", ngImport: i0, type: CdkOption, deps: [], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "16.1.0", version: "17.2.0", type: CdkOption, isStandalone: true, selector: "[cdkOption]", inputs: { id: "id", value: ["cdkOption", "value"], typeaheadLabel: ["cdkOptionTypeaheadLabel", "typeaheadLabel"], disabled: ["cdkOptionDisabled", "disabled", booleanAttribute], enabledTabIndex: ["tabindex", "enabledTabIndex"] }, host: { attributes: { "role": "option" }, listeners: { "click": "_clicked.next($event)", "focus": "_handleFocus()" }, properties: { "id": "id", "attr.aria-selected": "isSelected()", "attr.tabindex": "_getTabIndex()", "attr.aria-disabled": "disabled", "class.cdk-option-active": "isActive()" }, classAttribute: "cdk-option" }, exportAs: ["cdkOption"], ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.2.0", ngImport: i0, type: CdkOption, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkOption]',
                    standalone: true,
                    exportAs: 'cdkOption',
                    host: {
                        'role': 'option',
                        'class': 'cdk-option',
                        '[id]': 'id',
                        '[attr.aria-selected]': 'isSelected()',
                        '[attr.tabindex]': '_getTabIndex()',
                        '[attr.aria-disabled]': 'disabled',
                        '[class.cdk-option-active]': 'isActive()',
                        '(click)': '_clicked.next($event)',
                        '(focus)': '_handleFocus()',
                    },
                }]
        }], propDecorators: { id: [{
                type: Input
            }], value: [{
                type: Input,
                args: ['cdkOption']
            }], typeaheadLabel: [{
                type: Input,
                args: ['cdkOptionTypeaheadLabel']
            }], disabled: [{
                type: Input,
                args: [{ alias: 'cdkOptionDisabled', transform: booleanAttribute }]
            }], enabledTabIndex: [{
                type: Input,
                args: ['tabindex']
            }] } });
export class CdkListbox {
    /** The id of the option's host element. */
    get id() {
        return this._id || this._generatedId;
    }
    set id(value) {
        this._id = value;
    }
    /** The tabindex to use when the listbox is enabled. */
    get enabledTabIndex() {
        return this._enabledTabIndex === undefined ? 0 : this._enabledTabIndex;
    }
    set enabledTabIndex(value) {
        this._enabledTabIndex = value;
    }
    /** The value selected in the listbox, represented as an array of option values. */
    get value() {
        return this._invalid ? [] : this.selectionModel.selected;
    }
    set value(value) {
        this._setSelection(value);
    }
    /**
     * Whether the listbox allows multiple options to be selected. If the value switches from `true`
     * to `false`, and more than one option is selected, all options are deselected.
     */
    get multiple() {
        return this.selectionModel.multiple;
    }
    set multiple(value) {
        this.selectionModel.multiple = value;
        if (this.options) {
            this._updateInternalValue();
        }
    }
    /** The orientation of the listbox. Only affects keyboard interaction, not visual layout. */
    get orientation() {
        return this._orientation;
    }
    set orientation(value) {
        this._orientation = value === 'horizontal' ? 'horizontal' : 'vertical';
        if (value === 'horizontal') {
            this.listKeyManager?.withHorizontalOrientation(this._dir?.value || 'ltr');
        }
        else {
            this.listKeyManager?.withVerticalOrientation();
        }
    }
    /** The function used to compare option values. */
    get compareWith() {
        return this.selectionModel.compareWith;
    }
    set compareWith(fn) {
        this.selectionModel.compareWith = fn;
    }
    /**
     * Whether the keyboard navigation should wrap when the user presses arrow down on the last item
     * or arrow up on the first item.
     */
    get navigationWrapDisabled() {
        return this._navigationWrapDisabled;
    }
    set navigationWrapDisabled(wrap) {
        this._navigationWrapDisabled = wrap;
        this.listKeyManager?.withWrap(!this._navigationWrapDisabled);
    }
    /** Whether keyboard navigation should skip over disabled items. */
    get navigateDisabledOptions() {
        return this._navigateDisabledOptions;
    }
    set navigateDisabledOptions(skip) {
        this._navigateDisabledOptions = skip;
        this.listKeyManager?.skipPredicate(this._navigateDisabledOptions ? this._skipNonePredicate : this._skipDisabledPredicate);
    }
    constructor() {
        this._generatedId = `cdk-listbox-${nextId++}`;
        /** Whether the listbox is disabled. */
        this.disabled = false;
        /** Whether the listbox will use active descendant or will move focus onto the options. */
        this.useActiveDescendant = false;
        this._orientation = 'vertical';
        this._navigationWrapDisabled = false;
        this._navigateDisabledOptions = false;
        /** Emits when the selected value(s) in the listbox change. */
        this.valueChange = new Subject();
        /** The selection model used by the listbox. */
        this.selectionModel = new ListboxSelectionModel();
        /** Emits when the listbox is destroyed. */
        this.destroyed = new Subject();
        /** The host element of the listbox. */
        this.element = inject(ElementRef).nativeElement;
        /** The Angular zone. */
        this.ngZone = inject(NgZone);
        /** The change detector for this listbox. */
        this.changeDetectorRef = inject(ChangeDetectorRef);
        /** Whether the currently selected value in the selection model is invalid. */
        this._invalid = false;
        /** The last user-triggered option. */
        this._lastTriggered = null;
        /** Callback called when the listbox has been touched */
        this._onTouched = () => { };
        /** Callback called when the listbox value changes */
        this._onChange = () => { };
        /** Emits when an option has been clicked. */
        this._optionClicked = defer(() => this.options.changes.pipe(startWith(this.options), switchMap(options => merge(...options.map(option => option._clicked.pipe(map(event => ({ option, event }))))))));
        /** The directionality of the page. */
        this._dir = inject(Directionality, { optional: true });
        /** Whether the component is being rendered in the browser. */
        this._isBrowser = inject(Platform).isBrowser;
        /** A predicate that skips disabled options. */
        this._skipDisabledPredicate = (option) => option.disabled;
        /** A predicate that does not skip any options. */
        this._skipNonePredicate = () => false;
        /** Whether the listbox currently has focus. */
        this._hasFocus = false;
        /** A reference to the option that was active before the listbox lost focus. */
        this._previousActiveOption = null;
        if (this._isBrowser) {
            this._setPreviousActiveOptionAsActiveOptionOnWindowBlur();
        }
    }
    ngAfterContentInit() {
        if (typeof ngDevMode === 'undefined' || ngDevMode) {
            this._verifyNoOptionValueCollisions();
            this._verifyOptionValues();
        }
        this._initKeyManager();
        // Update the internal value whenever the options or the model value changes.
        merge(this.selectionModel.changed, this.options.changes)
            .pipe(startWith(null), takeUntil(this.destroyed))
            .subscribe(() => this._updateInternalValue());
        this._optionClicked
            .pipe(filter(({ option }) => !option.disabled), takeUntil(this.destroyed))
            .subscribe(({ option, event }) => this._handleOptionClicked(option, event));
    }
    ngOnDestroy() {
        this.listKeyManager?.destroy();
        this.destroyed.next();
        this.destroyed.complete();
    }
    /**
     * Toggle the selected state of the given option.
     * @param option The option to toggle
     */
    toggle(option) {
        this.toggleValue(option.value);
    }
    /**
     * Toggle the selected state of the given value.
     * @param value The value to toggle
     */
    toggleValue(value) {
        if (this._invalid) {
            this.selectionModel.clear(false);
        }
        this.selectionModel.toggle(value);
    }
    /**
     * Select the given option.
     * @param option The option to select
     */
    select(option) {
        this.selectValue(option.value);
    }
    /**
     * Select the given value.
     * @param value The value to select
     */
    selectValue(value) {
        if (this._invalid) {
            this.selectionModel.clear(false);
        }
        this.selectionModel.select(value);
    }
    /**
     * Deselect the given option.
     * @param option The option to deselect
     */
    deselect(option) {
        this.deselectValue(option.value);
    }
    /**
     * Deselect the given value.
     * @param value The value to deselect
     */
    deselectValue(value) {
        if (this._invalid) {
            this.selectionModel.clear(false);
        }
        this.selectionModel.deselect(value);
    }
    /**
     * Set the selected state of all options.
     * @param isSelected The new selected state to set
     */
    setAllSelected(isSelected) {
        if (!isSelected) {
            this.selectionModel.clear();
        }
        else {
            if (this._invalid) {
                this.selectionModel.clear(false);
            }
            this.selectionModel.select(...this.options.map(option => option.value));
        }
    }
    /**
     * Get whether the given option is selected.
     * @param option The option to get the selected state of
     */
    isSelected(option) {
        return this.isValueSelected(option.value);
    }
    /**
     * Get whether the given option is active.
     * @param option The option to get the active state of
     */
    isActive(option) {
        return !!(this.listKeyManager?.activeItem === option);
    }
    /**
     * Get whether the given value is selected.
     * @param value The value to get the selected state of
     */
    isValueSelected(value) {
        if (this._invalid) {
            return false;
        }
        return this.selectionModel.isSelected(value);
    }
    /**
     * Registers a callback to be invoked when the listbox's value changes from user input.
     * @param fn The callback to register
     * @docs-private
     */
    registerOnChange(fn) {
        this._onChange = fn;
    }
    /**
     * Registers a callback to be invoked when the listbox is blurred by the user.
     * @param fn The callback to register
     * @docs-private
     */
    registerOnTouched(fn) {
        this._onTouched = fn;
    }
    /**
     * Sets the listbox's value.
     * @param value The new value of the listbox
     * @docs-private
     */
    writeValue(value) {
        this._setSelection(value);
        this._verifyOptionValues();
    }
    /**
     * Sets the disabled state of the listbox.
     * @param isDisabled The new disabled state
     * @docs-private
     */
    setDisabledState(isDisabled) {
        this.disabled = isDisabled;
    }
    /** Focus the listbox's host element. */
    focus() {
        this.element.focus();
    }
    /**
     * Triggers the given option in response to user interaction.
     * - In single selection mode: selects the option and deselects any other selected option.
     * - In multi selection mode: toggles the selected state of the option.
     * @param option The option to trigger
     */
    triggerOption(option) {
        if (option && !option.disabled) {
            this._lastTriggered = option;
            const changed = this.multiple
                ? this.selectionModel.toggle(option.value)
                : this.selectionModel.select(option.value);
            if (changed) {
                this._onChange(this.value);
                this.valueChange.next({
                    value: this.value,
                    listbox: this,
                    option: option,
                });
            }
        }
    }
    /**
     * Trigger the given range of options in response to user interaction.
     * Should only be called in multi-selection mode.
     * @param trigger The option that was triggered
     * @param from The start index of the options to toggle
     * @param to The end index of the options to toggle
     * @param on Whether to toggle the option range on
     */
    triggerRange(trigger, from, to, on) {
        if (this.disabled || (trigger && trigger.disabled)) {
            return;
        }
        this._lastTriggered = trigger;
        const isEqual = this.compareWith ?? Object.is;
        const updateValues = [...this.options]
            .slice(Math.max(0, Math.min(from, to)), Math.min(this.options.length, Math.max(from, to) + 1))
            .filter(option => !option.disabled)
            .map(option => option.value);
        const selected = [...this.value];
        for (const updateValue of updateValues) {
            const selectedIndex = selected.findIndex(selectedValue => isEqual(selectedValue, updateValue));
            if (on && selectedIndex === -1) {
                selected.push(updateValue);
            }
            else if (!on && selectedIndex !== -1) {
                selected.splice(selectedIndex, 1);
            }
        }
        let changed = this.selectionModel.setSelection(...selected);
        if (changed) {
            this._onChange(this.value);
            this.valueChange.next({
                value: this.value,
                listbox: this,
                option: trigger,
            });
        }
    }
    /**
     * Sets the given option as active.
     * @param option The option to make active
     */
    _setActiveOption(option) {
        this.listKeyManager.setActiveItem(option);
    }
    /** Called when the listbox receives focus. */
    _handleFocus() {
        if (!this.useActiveDescendant) {
            if (this.selectionModel.selected.length > 0) {
                this._setNextFocusToSelectedOption();
            }
            else {
                this.listKeyManager.setNextItemActive();
            }
            this._focusActiveOption();
        }
    }
    /** Called when the user presses keydown on the listbox. */
    _handleKeydown(event) {
        if (this.disabled) {
            return;
        }
        const { keyCode } = event;
        const previousActiveIndex = this.listKeyManager.activeItemIndex;
        const ctrlKeys = ['ctrlKey', 'metaKey'];
        if (this.multiple && keyCode === A && hasModifierKey(event, ...ctrlKeys)) {
            // Toggle all options off if they're all selected, otherwise toggle them all on.
            this.triggerRange(null, 0, this.options.length - 1, this.options.length !== this.value.length);
            event.preventDefault();
            return;
        }
        if (this.multiple &&
            (keyCode === SPACE || keyCode === ENTER) &&
            hasModifierKey(event, 'shiftKey')) {
            if (this.listKeyManager.activeItem && this.listKeyManager.activeItemIndex != null) {
                this.triggerRange(this.listKeyManager.activeItem, this._getLastTriggeredIndex() ?? this.listKeyManager.activeItemIndex, this.listKeyManager.activeItemIndex, !this.listKeyManager.activeItem.isSelected());
            }
            event.preventDefault();
            return;
        }
        if (this.multiple &&
            keyCode === HOME &&
            hasModifierKey(event, ...ctrlKeys) &&
            hasModifierKey(event, 'shiftKey')) {
            const trigger = this.listKeyManager.activeItem;
            if (trigger) {
                const from = this.listKeyManager.activeItemIndex;
                this.listKeyManager.setFirstItemActive();
                this.triggerRange(trigger, from, this.listKeyManager.activeItemIndex, !trigger.isSelected());
            }
            event.preventDefault();
            return;
        }
        if (this.multiple &&
            keyCode === END &&
            hasModifierKey(event, ...ctrlKeys) &&
            hasModifierKey(event, 'shiftKey')) {
            const trigger = this.listKeyManager.activeItem;
            if (trigger) {
                const from = this.listKeyManager.activeItemIndex;
                this.listKeyManager.setLastItemActive();
                this.triggerRange(trigger, from, this.listKeyManager.activeItemIndex, !trigger.isSelected());
            }
            event.preventDefault();
            return;
        }
        if (keyCode === SPACE || keyCode === ENTER) {
            this.triggerOption(this.listKeyManager.activeItem);
            event.preventDefault();
            return;
        }
        const isNavKey = keyCode === UP_ARROW ||
            keyCode === DOWN_ARROW ||
            keyCode === LEFT_ARROW ||
            keyCode === RIGHT_ARROW ||
            keyCode === HOME ||
            keyCode === END;
        this.listKeyManager.onKeydown(event);
        // Will select an option if shift was pressed while navigating to the option
        if (isNavKey && event.shiftKey && previousActiveIndex !== this.listKeyManager.activeItemIndex) {
            this.triggerOption(this.listKeyManager.activeItem);
        }
    }
    /** Called when a focus moves into the listbox. */
    _handleFocusIn() {
        // Note that we use a `focusin` handler for this instead of the existing `focus` handler,
        // because focus won't land on the listbox if `useActiveDescendant` is enabled.
        this._hasFocus = true;
    }
    /**
     * Called when the focus leaves an element in the listbox.
     * @param event The focusout event
     */
    _handleFocusOut(event) {
        // Some browsers (e.g. Chrome and Firefox) trigger the focusout event when the user returns back to the document.
        // To prevent losing the active option in this case, we store it in `_previousActiveOption` and restore it on the window `blur` event
        // This ensures that the `activeItem` matches the actual focused element when the user returns to the document.
        this._previousActiveOption = this.listKeyManager.activeItem;
        const otherElement = event.relatedTarget;
        if (this.element !== otherElement && !this.element.contains(otherElement)) {
            this._onTouched();
            this._hasFocus = false;
            this._setNextFocusToSelectedOption();
        }
    }
    /** Get the id of the active option if active descendant is being used. */
    _getAriaActiveDescendant() {
        return this.useActiveDescendant ? this.listKeyManager?.activeItem?.id : null;
    }
    /** Get the tabindex for the listbox. */
    _getTabIndex() {
        if (this.disabled) {
            return -1;
        }
        return this.useActiveDescendant || !this.listKeyManager.activeItem ? this.enabledTabIndex : -1;
    }
    /** Initialize the key manager. */
    _initKeyManager() {
        this.listKeyManager = new ActiveDescendantKeyManager(this.options)
            .withWrap(!this._navigationWrapDisabled)
            .withTypeAhead()
            .withHomeAndEnd()
            .withAllowedModifierKeys(['shiftKey'])
            .skipPredicate(this._navigateDisabledOptions ? this._skipNonePredicate : this._skipDisabledPredicate);
        if (this.orientation === 'vertical') {
            this.listKeyManager.withVerticalOrientation();
        }
        else {
            this.listKeyManager.withHorizontalOrientation(this._dir?.value || 'ltr');
        }
        if (this.selectionModel.selected.length) {
            Promise.resolve().then(() => this._setNextFocusToSelectedOption());
        }
        this.listKeyManager.change.subscribe(() => this._focusActiveOption());
        this.options.changes.pipe(takeUntil(this.destroyed)).subscribe(() => {
            const activeOption = this.listKeyManager.activeItem;
            // If the active option was deleted, we need to reset
            // the key manager so it can allow focus back in.
            if (activeOption && !this.options.find(option => option === activeOption)) {
                this.listKeyManager.setActiveItem(-1);
                this.changeDetectorRef.markForCheck();
            }
        });
    }
    /** Focus the active option. */
    _focusActiveOption() {
        if (!this.useActiveDescendant) {
            this.listKeyManager.activeItem?.focus();
        }
        this.changeDetectorRef.markForCheck();
    }
    /**
     * Set the selected values.
     * @param value The list of new selected values.
     */
    _setSelection(value) {
        if (this._invalid) {
            this.selectionModel.clear(false);
        }
        this.selectionModel.setSelection(...this._coerceValue(value));
        if (!this._hasFocus) {
            this._setNextFocusToSelectedOption();
        }
    }
    /** Sets the first selected option as first in the keyboard focus order. */
    _setNextFocusToSelectedOption() {
        // Null check the options since they only get defined after `ngAfterContentInit`.
        const selected = this.options?.find(option => option.isSelected());
        if (selected) {
            this.listKeyManager.updateActiveItem(selected);
        }
    }
    /** Update the internal value of the listbox based on the selection model. */
    _updateInternalValue() {
        const indexCache = new Map();
        this.selectionModel.sort((a, b) => {
            const aIndex = this._getIndexForValue(indexCache, a);
            const bIndex = this._getIndexForValue(indexCache, b);
            return aIndex - bIndex;
        });
        const selected = this.selectionModel.selected;
        this._invalid =
            (!this.multiple && selected.length > 1) || !!this._getInvalidOptionValues(selected).length;
        this.changeDetectorRef.markForCheck();
    }
    /**
     * Gets the index of the given value in the given list of options.
     * @param cache The cache of indices found so far
     * @param value The value to find
     * @return The index of the value in the options list
     */
    _getIndexForValue(cache, value) {
        const isEqual = this.compareWith || Object.is;
        if (!cache.has(value)) {
            let index = -1;
            for (let i = 0; i < this.options.length; i++) {
                if (isEqual(value, this.options.get(i).value)) {
                    index = i;
                    break;
                }
            }
            cache.set(value, index);
        }
        return cache.get(value);
    }
    /**
     * Handle the user clicking an option.
     * @param option The option that was clicked.
     */
    _handleOptionClicked(option, event) {
        event.preventDefault();
        this.listKeyManager.setActiveItem(option);
        if (event.shiftKey && this.multiple) {
            this.triggerRange(option, this._getLastTriggeredIndex() ?? this.listKeyManager.activeItemIndex, this.listKeyManager.activeItemIndex, !option.isSelected());
        }
        else {
            this.triggerOption(option);
        }
    }
    /** Verifies that no two options represent the same value under the compareWith function. */
    _verifyNoOptionValueCollisions() {
        this.options.changes.pipe(startWith(this.options), takeUntil(this.destroyed)).subscribe(() => {
            const isEqual = this.compareWith ?? Object.is;
            for (let i = 0; i < this.options.length; i++) {
                const option = this.options.get(i);
                let duplicate = null;
                for (let j = i + 1; j < this.options.length; j++) {
                    const other = this.options.get(j);
                    if (isEqual(option.value, other.value)) {
                        duplicate = other;
                        break;
                    }
                }
                if (duplicate) {
                    // TODO(mmalerba): Link to docs about this.
                    if (this.compareWith) {
                        console.warn(`Found multiple CdkOption representing the same value under the given compareWith function`, {
                            option1: option.element,
                            option2: duplicate.element,
                            compareWith: this.compareWith,
                        });
                    }
                    else {
                        console.warn(`Found multiple CdkOption with the same value`, {
                            option1: option.element,
                            option2: duplicate.element,
                        });
                    }
                    return;
                }
            }
        });
    }
    /** Verifies that the option values are valid. */
    _verifyOptionValues() {
        if (this.options && (typeof ngDevMode === 'undefined' || ngDevMode)) {
            const selected = this.selectionModel.selected;
            const invalidValues = this._getInvalidOptionValues(selected);
            if (!this.multiple && selected.length > 1) {
                throw Error('Listbox cannot have more than one selected value in multi-selection mode.');
            }
            if (invalidValues.length) {
                throw Error('Listbox has selected values that do not match any of its options.');
            }
        }
    }
    /**
     * Coerces a value into an array representing a listbox selection.
     * @param value The value to coerce
     * @return An array
     */
    _coerceValue(value) {
        return value == null ? [] : coerceArray(value);
    }
    /**
     * Get the sublist of values that do not represent valid option values in this listbox.
     * @param values The list of values
     * @return The sublist of values that are not valid option values
     */
    _getInvalidOptionValues(values) {
        const isEqual = this.compareWith || Object.is;
        const validValues = (this.options || []).map(option => option.value);
        return values.filter(value => !validValues.some(validValue => isEqual(value, validValue)));
    }
    /** Get the index of the last triggered option. */
    _getLastTriggeredIndex() {
        const index = this.options.toArray().indexOf(this._lastTriggered);
        return index === -1 ? null : index;
    }
    /**
     * Set previous active option as active option on window blur.
     * This ensures that the `activeOption` matches the actual focused element when the user returns to the document.
     */
    _setPreviousActiveOptionAsActiveOptionOnWindowBlur() {
        this.ngZone.runOutsideAngular(() => {
            fromEvent(window, 'blur')
                .pipe(takeUntil(this.destroyed))
                .subscribe(() => {
                if (this.element.contains(document.activeElement) && this._previousActiveOption) {
                    this._setActiveOption(this._previousActiveOption);
                    this._previousActiveOption = null;
                }
            });
        });
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.2.0", ngImport: i0, type: CdkListbox, deps: [], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "16.1.0", version: "17.2.0", type: CdkListbox, isStandalone: true, selector: "[cdkListbox]", inputs: { id: "id", enabledTabIndex: ["tabindex", "enabledTabIndex"], value: ["cdkListboxValue", "value"], multiple: ["cdkListboxMultiple", "multiple", booleanAttribute], disabled: ["cdkListboxDisabled", "disabled", booleanAttribute], useActiveDescendant: ["cdkListboxUseActiveDescendant", "useActiveDescendant", booleanAttribute], orientation: ["cdkListboxOrientation", "orientation"], compareWith: ["cdkListboxCompareWith", "compareWith"], navigationWrapDisabled: ["cdkListboxNavigationWrapDisabled", "navigationWrapDisabled", booleanAttribute], navigateDisabledOptions: ["cdkListboxNavigatesDisabledOptions", "navigateDisabledOptions", booleanAttribute] }, outputs: { valueChange: "cdkListboxValueChange" }, host: { attributes: { "role": "listbox" }, listeners: { "focus": "_handleFocus()", "keydown": "_handleKeydown($event)", "focusout": "_handleFocusOut($event)", "focusin": "_handleFocusIn()" }, properties: { "id": "id", "attr.tabindex": "_getTabIndex()", "attr.aria-disabled": "disabled", "attr.aria-multiselectable": "multiple", "attr.aria-activedescendant": "_getAriaActiveDescendant()", "attr.aria-orientation": "orientation" }, classAttribute: "cdk-listbox" }, providers: [
            {
                provide: NG_VALUE_ACCESSOR,
                useExisting: forwardRef(() => CdkListbox),
                multi: true,
            },
        ], queries: [{ propertyName: "options", predicate: CdkOption, descendants: true }], exportAs: ["cdkListbox"], ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.2.0", ngImport: i0, type: CdkListbox, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkListbox]',
                    standalone: true,
                    exportAs: 'cdkListbox',
                    host: {
                        'role': 'listbox',
                        'class': 'cdk-listbox',
                        '[id]': 'id',
                        '[attr.tabindex]': '_getTabIndex()',
                        '[attr.aria-disabled]': 'disabled',
                        '[attr.aria-multiselectable]': 'multiple',
                        '[attr.aria-activedescendant]': '_getAriaActiveDescendant()',
                        '[attr.aria-orientation]': 'orientation',
                        '(focus)': '_handleFocus()',
                        '(keydown)': '_handleKeydown($event)',
                        '(focusout)': '_handleFocusOut($event)',
                        '(focusin)': '_handleFocusIn()',
                    },
                    providers: [
                        {
                            provide: NG_VALUE_ACCESSOR,
                            useExisting: forwardRef(() => CdkListbox),
                            multi: true,
                        },
                    ],
                }]
        }], ctorParameters: () => [], propDecorators: { id: [{
                type: Input
            }], enabledTabIndex: [{
                type: Input,
                args: ['tabindex']
            }], value: [{
                type: Input,
                args: ['cdkListboxValue']
            }], multiple: [{
                type: Input,
                args: [{ alias: 'cdkListboxMultiple', transform: booleanAttribute }]
            }], disabled: [{
                type: Input,
                args: [{ alias: 'cdkListboxDisabled', transform: booleanAttribute }]
            }], useActiveDescendant: [{
                type: Input,
                args: [{ alias: 'cdkListboxUseActiveDescendant', transform: booleanAttribute }]
            }], orientation: [{
                type: Input,
                args: ['cdkListboxOrientation']
            }], compareWith: [{
                type: Input,
                args: ['cdkListboxCompareWith']
            }], navigationWrapDisabled: [{
                type: Input,
                args: [{ alias: 'cdkListboxNavigationWrapDisabled', transform: booleanAttribute }]
            }], navigateDisabledOptions: [{
                type: Input,
                args: [{ alias: 'cdkListboxNavigatesDisabledOptions', transform: booleanAttribute }]
            }], valueChange: [{
                type: Output,
                args: ['cdkListboxValueChange']
            }], options: [{
                type: ContentChildren,
                args: [CdkOption, { descendants: true }]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdGJveC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvbGlzdGJveC9saXN0Ym94LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFFTCxnQkFBZ0IsRUFDaEIsaUJBQWlCLEVBQ2pCLGVBQWUsRUFDZixTQUFTLEVBQ1QsVUFBVSxFQUNWLFVBQVUsRUFDVixNQUFNLEVBQ04sS0FBSyxFQUNMLE1BQU0sRUFFTixNQUFNLEVBQ04sU0FBUyxHQUNWLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBQywwQkFBMEIsRUFBc0MsTUFBTSxtQkFBbUIsQ0FBQztBQUNsRyxPQUFPLEVBQ0wsQ0FBQyxFQUNELFVBQVUsRUFDVixHQUFHLEVBQ0gsS0FBSyxFQUNMLGNBQWMsRUFDZCxJQUFJLEVBQ0osVUFBVSxFQUNWLFdBQVcsRUFDWCxLQUFLLEVBQ0wsUUFBUSxHQUNULE1BQU0sdUJBQXVCLENBQUM7QUFDL0IsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQ2xELE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSwwQkFBMEIsQ0FBQztBQUN4RCxPQUFPLEVBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQWMsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQ2xFLE9BQU8sRUFBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDNUUsT0FBTyxFQUF1QixpQkFBaUIsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQ3ZFLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUNqRCxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sdUJBQXVCLENBQUM7O0FBRS9DLHNEQUFzRDtBQUN0RCxJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUM7QUFFZjs7Ozs7OztH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RGQsS0FBSzt1QkFBQyx1QkFBdUI7Z0JBZ0IxQixXQUFXO3NCQURkLEtBQUs7dUJBQUMsdUJBQXVCO2dCQWExQixzQkFBc0I7c0JBRHpCLEtBQUs7dUJBQUMsRUFBQyxLQUFLLEVBQUUsa0NBQWtDLEVBQUUsU0FBUyxFQUFFLGdCQUFnQixFQUFDO2dCQVkzRSx1QkFBdUI7c0JBRDFCLEtBQUs7dUJBQUMsRUFBQyxLQUFLLEVBQUUsb0NBQW9DLEVBQUUsU0FBUyxFQUFFLGdCQUFnQixFQUFDO2dCQWF2QyxXQUFXO3NCQUFwRCxNQUFNO3VCQUFDLHVCQUF1QjtnQkFHNEIsT0FBTztzQkFBakUsZUFBZTt1QkFBQyxTQUFTLEVBQUUsRUFBQyxXQUFXLEVBQUUsSUFBSSxFQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7XG4gIEFmdGVyQ29udGVudEluaXQsXG4gIGJvb2xlYW5BdHRyaWJ1dGUsXG4gIENoYW5nZURldGVjdG9yUmVmLFxuICBDb250ZW50Q2hpbGRyZW4sXG4gIERpcmVjdGl2ZSxcbiAgRWxlbWVudFJlZixcbiAgZm9yd2FyZFJlZixcbiAgaW5qZWN0LFxuICBJbnB1dCxcbiAgTmdab25lLFxuICBPbkRlc3Ryb3ksXG4gIE91dHB1dCxcbiAgUXVlcnlMaXN0LFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7QWN0aXZlRGVzY2VuZGFudEtleU1hbmFnZXIsIEhpZ2hsaWdodGFibGUsIExpc3RLZXlNYW5hZ2VyT3B0aW9ufSBmcm9tICdAYW5ndWxhci9jZGsvYTExeSc7XG5pbXBvcnQge1xuICBBLFxuICBET1dOX0FSUk9XLFxuICBFTkQsXG4gIEVOVEVSLFxuICBoYXNNb2RpZmllcktleSxcbiAgSE9NRSxcbiAgTEVGVF9BUlJPVyxcbiAgUklHSFRfQVJST1csXG4gIFNQQUNFLFxuICBVUF9BUlJPVyxcbn0gZnJvbSAnQGFuZ3VsYXIvY2RrL2tleWNvZGVzJztcbmltcG9ydCB7Y29lcmNlQXJyYXl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2VyY2lvbic7XG5pbXBvcnQge1NlbGVjdGlvbk1vZGVsfSBmcm9tICdAYW5ndWxhci9jZGsvY29sbGVjdGlvbnMnO1xuaW1wb3J0IHtkZWZlciwgZnJvbUV2ZW50LCBtZXJnZSwgT2JzZXJ2YWJsZSwgU3ViamVjdH0gZnJvbSAncnhqcyc7XG5pbXBvcnQge2ZpbHRlciwgbWFwLCBzdGFydFdpdGgsIHN3aXRjaE1hcCwgdGFrZVVudGlsfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5pbXBvcnQge0NvbnRyb2xWYWx1ZUFjY2Vzc29yLCBOR19WQUxVRV9BQ0NFU1NPUn0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xuaW1wb3J0IHtEaXJlY3Rpb25hbGl0eX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2JpZGknO1xuaW1wb3J0IHtQbGF0Zm9ybX0gZnJvbSAnQGFuZ3VsYXIvY2RrL3BsYXRmb3JtJztcblxuLyoqIFRoZSBuZXh0IGlkIHRvIHVzZSBmb3IgY3JlYXRpbmcgdW5pcXVlIERPTSBJRHMuICovXG5sZXQgbmV4dElkID0gMDtcblxuLyoqXG4gKiBBbiBpbXBsZW1lbnRhdGlvbiBvZiBTZWxlY3Rpb25Nb2RlbCB0aGF0IGludGVybmFsbHkgYWx3YXlzIHJlcHJlc2VudHMgdGhlIHNlbGVjdGlvbiBhcyBhXG4gKiBtdWx0aS1zZWxlY3Rpb24uIFRoaXMgaXMgbmVjZXNzYXJ5IHNvIHRoYXQgd2UgY2FuIHJlY292ZXIgdGhlIGZ1bGwgc2VsZWN0aW9uIGlmIHRoZSB1c2VyXG4gKiBzd2l0Y2hlcyB0aGUgbGlzdGJveCBmcm9tIHNpbmdsZS1zZWxlY3Rpb24gdG8gbXVsdGktc2VsZWN0aW9uIGFmdGVyIGluaXRpYWxpemF0aW9uLlxuICpcbiAqIFRoaXMgc2VsZWN0aW9uIG1vZGVsIG1heSByZXBvcnQgbXVsdGlwbGUgc2VsZWN0ZWQgdmFsdWVzLCBldmVuIGlmIGl0IGlzIGluIHNpbmdsZS1zZWxlY3Rpb25cbiAqIG1vZGUuIEl0IGlzIHVwIHRvIHRoZSB1c2VyIChDZGtMaXN0Ym94KSB0byBjaGVjayBmb3IgaW52YWxpZCBzZWxlY3Rpb25zLlxuICovXG5jbGFzcyBMaXN0Ym94U2VsZWN0aW9uTW9kZWw8VD4gZXh0ZW5kcyBTZWxlY3Rpb25Nb2RlbDxUPiB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyBtdWx0aXBsZSA9IGZhbHNlLFxuICAgIGluaXRpYWxseVNlbGVjdGVkVmFsdWVzPzogVFtdLFxuICAgIGVtaXRDaGFuZ2VzID0gdHJ1ZSxcbiAgICBjb21wYXJlV2l0aD86IChvMTogVCwgbzI6IFQpID0+IGJvb2xlYW4sXG4gICkge1xuICAgIHN1cGVyKHRydWUsIGluaXRpYWxseVNlbGVjdGVkVmFsdWVzLCBlbWl0Q2hhbmdlcywgY29tcGFyZVdpdGgpO1xuICB9XG5cbiAgb3ZlcnJpZGUgaXNNdWx0aXBsZVNlbGVjdGlvbigpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5tdWx0aXBsZTtcbiAgfVxuXG4gIG92ZXJyaWRlIHNlbGVjdCguLi52YWx1ZXM6IFRbXSkge1xuICAgIC8vIFRoZSBzdXBlciBjbGFzcyBpcyBhbHdheXMgaW4gbXVsdGktc2VsZWN0aW9uIG1vZGUsIHNvIHdlIG5lZWQgdG8gb3ZlcnJpZGUgdGhlIGJlaGF2aW9yIGlmXG4gICAgLy8gdGhpcyBzZWxlY3Rpb24gbW9kZWwgYWN0dWFsbHkgYmVsb25ncyB0byBhIHNpbmdsZS1zZWxlY3Rpb24gbGlzdGJveC5cbiAgICBpZiAodGhpcy5tdWx0aXBsZSkge1xuICAgICAgcmV0dXJuIHN1cGVyLnNlbGVjdCguLi52YWx1ZXMpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gc3VwZXIuc2V0U2VsZWN0aW9uKC4uLnZhbHVlcyk7XG4gICAgfVxuICB9XG59XG5cbi8qKiBBIHNlbGVjdGFibGUgb3B0aW9uIGluIGEgbGlzdGJveC4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tjZGtPcHRpb25dJyxcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbiAgZXhwb3J0QXM6ICdjZGtPcHRpb24nLFxuICBob3N0OiB7XG4gICAgJ3JvbGUnOiAnb3B0aW9uJyxcbiAgICAnY2xhc3MnOiAnY2RrLW9wdGlvbicsXG4gICAgJ1tpZF0nOiAnaWQnLFxuICAgICdbYXR0ci5hcmlhLXNlbGVjdGVkXSc6ICdpc1NlbGVjdGVkKCknLFxuICAgICdbYXR0ci50YWJpbmRleF0nOiAnX2dldFRhYkluZGV4KCknLFxuICAgICdbYXR0ci5hcmlhLWRpc2FibGVkXSc6ICdkaXNhYmxlZCcsXG4gICAgJ1tjbGFzcy5jZGstb3B0aW9uLWFjdGl2ZV0nOiAnaXNBY3RpdmUoKScsXG4gICAgJyhjbGljayknOiAnX2NsaWNrZWQubmV4dCgkZXZlbnQpJyxcbiAgICAnKGZvY3VzKSc6ICdfaGFuZGxlRm9jdXMoKScsXG4gIH0sXG59KVxuZXhwb3J0IGNsYXNzIENka09wdGlvbjxUID0gdW5rbm93bj4gaW1wbGVtZW50cyBMaXN0S2V5TWFuYWdlck9wdGlvbiwgSGlnaGxpZ2h0YWJsZSwgT25EZXN0cm95IHtcbiAgLyoqIFRoZSBpZCBvZiB0aGUgb3B0aW9uJ3MgaG9zdCBlbGVtZW50LiAqL1xuICBASW5wdXQoKVxuICBnZXQgaWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2lkIHx8IHRoaXMuX2dlbmVyYXRlZElkO1xuICB9XG4gIHNldCBpZCh2YWx1ZSkge1xuICAgIHRoaXMuX2lkID0gdmFsdWU7XG4gIH1cbiAgcHJpdmF0ZSBfaWQ6IHN0cmluZztcbiAgcHJpdmF0ZSBfZ2VuZXJhdGVkSWQgPSBgY2RrLW9wdGlvbi0ke25leHRJZCsrfWA7XG5cbiAgLyoqIFRoZSB2YWx1ZSBvZiB0aGlzIG9wdGlvbi4gKi9cbiAgQElucHV0KCdjZGtPcHRpb24nKSB2YWx1ZTogVDtcblxuICAvKipcbiAgICogVGhlIHRleHQgdXNlZCB0byBsb2NhdGUgdGhpcyBpdGVtIGR1cmluZyBsaXN0Ym94IHR5cGVhaGVhZC4gSWYgbm90IHNwZWNpZmllZCxcbiAgICogdGhlIGB0ZXh0Q29udGVudGAgb2YgdGhlIGl0ZW0gd2lsbCBiZSB1c2VkLlxuICAgKi9cbiAgQElucHV0KCdjZGtPcHRpb25UeXBlYWhlYWRMYWJlbCcpIHR5cGVhaGVhZExhYmVsOiBzdHJpbmcgfCBudWxsO1xuXG4gIC8qKiBXaGV0aGVyIHRoaXMgb3B0aW9uIGlzIGRpc2FibGVkLiAqL1xuICBASW5wdXQoe2FsaWFzOiAnY2RrT3B0aW9uRGlzYWJsZWQnLCB0cmFuc2Zvcm06IGJvb2xlYW5BdHRyaWJ1dGV9KVxuICBnZXQgZGlzYWJsZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMubGlzdGJveC5kaXNhYmxlZCB8fCB0aGlzLl9kaXNhYmxlZDtcbiAgfVxuICBzZXQgZGlzYWJsZWQodmFsdWU6IGJvb2xlYW4pIHtcbiAgICB0aGlzLl9kaXNhYmxlZCA9IHZhbHVlO1xuICB9XG4gIHByaXZhdGUgX2Rpc2FibGVkOiBib29sZWFuID0gZmFsc2U7XG5cbiAgLyoqIFRoZSB0YWJpbmRleCBvZiB0aGUgb3B0aW9uIHdoZW4gaXQgaXMgZW5hYmxlZC4gKi9cbiAgQElucHV0KCd0YWJpbmRleCcpXG4gIGdldCBlbmFibGVkVGFiSW5kZXgoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2VuYWJsZWRUYWJJbmRleCA9PT0gdW5kZWZpbmVkXG4gICAgICA/IHRoaXMubGlzdGJveC5lbmFibGVkVGFiSW5kZXhcbiAgICAgIDogdGhpcy5fZW5hYmxlZFRhYkluZGV4O1xuICB9XG4gIHNldCBlbmFibGVkVGFiSW5kZXgodmFsdWUpIHtcbiAgICB0aGlzLl9lbmFibGVkVGFiSW5kZXggPSB2YWx1ZTtcbiAgfVxuICBwcml2YXRlIF9lbmFibGVkVGFiSW5kZXg/OiBudW1iZXIgfCBudWxsO1xuXG4gIC8qKiBUaGUgb3B0aW9uJ3MgaG9zdCBlbGVtZW50ICovXG4gIHJlYWRvbmx5IGVsZW1lbnQ6IEhUTUxFbGVtZW50ID0gaW5qZWN0KEVsZW1lbnRSZWYpLm5hdGl2ZUVsZW1lbnQ7XG5cbiAgLyoqIFRoZSBwYXJlbnQgbGlzdGJveCB0aGlzIG9wdGlvbiBiZWxvbmdzIHRvLiAqL1xuICBwcm90ZWN0ZWQgcmVhZG9ubHkgbGlzdGJveDogQ2RrTGlzdGJveDxUPiA9IGluamVjdChDZGtMaXN0Ym94KTtcblxuICAvKiogRW1pdHMgd2hlbiB0aGUgb3B0aW9uIGlzIGRlc3Ryb3llZC4gKi9cbiAgcHJvdGVjdGVkIGRlc3Ryb3llZCA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XG5cbiAgLyoqIEVtaXRzIHdoZW4gdGhlIG9wdGlvbiBpcyBjbGlja2VkLiAqL1xuICByZWFkb25seSBfY2xpY2tlZCA9IG5ldyBTdWJqZWN0PE1vdXNlRXZlbnQ+KCk7XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdGhpcy5kZXN0cm95ZWQubmV4dCgpO1xuICAgIHRoaXMuZGVzdHJveWVkLmNvbXBsZXRlKCk7XG4gIH1cblxuICAvKiogV2hldGhlciB0aGlzIG9wdGlvbiBpcyBzZWxlY3RlZC4gKi9cbiAgaXNTZWxlY3RlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5saXN0Ym94LmlzU2VsZWN0ZWQodGhpcyk7XG4gIH1cblxuICAvKiogV2hldGhlciB0aGlzIG9wdGlvbiBpcyBhY3RpdmUuICovXG4gIGlzQWN0aXZlKCkge1xuICAgIHJldHVybiB0aGlzLmxpc3Rib3guaXNBY3RpdmUodGhpcyk7XG4gIH1cblxuICAvKiogVG9nZ2xlIHRoZSBzZWxlY3RlZCBzdGF0ZSBvZiB0aGlzIG9wdGlvbi4gKi9cbiAgdG9nZ2xlKCkge1xuICAgIHRoaXMubGlzdGJveC50b2dnbGUodGhpcyk7XG4gIH1cblxuICAvKiogU2VsZWN0IHRoaXMgb3B0aW9uIGlmIGl0IGlzIG5vdCBzZWxlY3RlZC4gKi9cbiAgc2VsZWN0KCkge1xuICAgIHRoaXMubGlzdGJveC5zZWxlY3QodGhpcyk7XG4gIH1cblxuICAvKiogRGVzZWxlY3QgdGhpcyBvcHRpb24gaWYgaXQgaXMgc2VsZWN0ZWQuICovXG4gIGRlc2VsZWN0KCkge1xuICAgIHRoaXMubGlzdGJveC5kZXNlbGVjdCh0aGlzKTtcbiAgfVxuXG4gIC8qKiBGb2N1cyB0aGlzIG9wdGlvbi4gKi9cbiAgZm9jdXMoKSB7XG4gICAgdGhpcy5lbGVtZW50LmZvY3VzKCk7XG4gIH1cblxuICAvKiogR2V0IHRoZSBsYWJlbCBmb3IgdGhpcyBlbGVtZW50IHdoaWNoIGlzIHJlcXVpcmVkIGJ5IHRoZSBGb2N1c2FibGVPcHRpb24gaW50ZXJmYWNlLiAqL1xuICBnZXRMYWJlbCgpIHtcbiAgICByZXR1cm4gKHRoaXMudHlwZWFoZWFkTGFiZWwgPz8gdGhpcy5lbGVtZW50LnRleHRDb250ZW50Py50cmltKCkpIHx8ICcnO1xuICB9XG5cbiAgLyoqXG4gICAqIE5vLW9wIGltcGxlbWVudGVkIGFzIGEgcGFydCBvZiBgSGlnaGxpZ2h0YWJsZWAuXG4gICAqIEBkb2NzLXByaXZhdGVcbiAgICovXG4gIHNldEFjdGl2ZVN0eWxlcygpIHt9XG5cbiAgLyoqXG4gICAqIE5vLW9wIGltcGxlbWVudGVkIGFzIGEgcGFydCBvZiBgSGlnaGxpZ2h0YWJsZWAuXG4gICAqIEBkb2NzLXByaXZhdGVcbiAgICovXG4gIHNldEluYWN0aXZlU3R5bGVzKCkge31cblxuICAvKiogSGFuZGxlIGZvY3VzIGV2ZW50cyBvbiB0aGUgb3B0aW9uLiAqL1xuICBwcm90ZWN0ZWQgX2hhbmRsZUZvY3VzKCkge1xuICAgIC8vIE9wdGlvbnMgY2FuIHdpbmQgdXAgZ2V0dGluZyBmb2N1c2VkIGluIGFjdGl2ZSBkZXNjZW5kYW50IG1vZGUgaWYgdGhlIHVzZXIgY2xpY2tzIG9uIHRoZW0uXG4gICAgLy8gSW4gdGhpcyBjYXNlLCB3ZSBwdXNoIGZvY3VzIGJhY2sgdG8gdGhlIHBhcmVudCBsaXN0Ym94IHRvIHByZXZlbnQgYW4gZXh0cmEgdGFiIHN0b3Agd2hlblxuICAgIC8vIHRoZSB1c2VyIHBlcmZvcm1zIGEgc2hpZnQrdGFiLlxuICAgIGlmICh0aGlzLmxpc3Rib3gudXNlQWN0aXZlRGVzY2VuZGFudCkge1xuICAgICAgdGhpcy5saXN0Ym94Ll9zZXRBY3RpdmVPcHRpb24odGhpcyk7XG4gICAgICB0aGlzLmxpc3Rib3guZm9jdXMoKTtcbiAgICB9XG4gIH1cblxuICAvKiogR2V0IHRoZSB0YWJpbmRleCBmb3IgdGhpcyBvcHRpb24uICovXG4gIHByb3RlY3RlZCBfZ2V0VGFiSW5kZXgoKSB7XG4gICAgaWYgKHRoaXMubGlzdGJveC51c2VBY3RpdmVEZXNjZW5kYW50IHx8IHRoaXMuZGlzYWJsZWQpIHtcbiAgICAgIHJldHVybiAtMTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuaXNBY3RpdmUoKSA/IHRoaXMuZW5hYmxlZFRhYkluZGV4IDogLTE7XG4gIH1cbn1cblxuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW2Nka0xpc3Rib3hdJyxcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbiAgZXhwb3J0QXM6ICdjZGtMaXN0Ym94JyxcbiAgaG9zdDoge1xuICAgICdyb2xlJzogJ2xpc3Rib3gnLFxuICAgICdjbGFzcyc6ICdjZGstbGlzdGJveCcsXG4gICAgJ1tpZF0nOiAnaWQnLFxuICAgICdbYXR0ci50YWJpbmRleF0nOiAnX2dldFRhYkluZGV4KCknLFxuICAgICdbYXR0ci5hcmlhLWRpc2FibGVkXSc6ICdkaXNhYmxlZCcsXG4gICAgJ1thdHRyLmFyaWEtbXVsdGlzZWxlY3RhYmxlXSc6ICdtdWx0aXBsZScsXG4gICAgJ1thdHRyLmFyaWEtYWN0aXZlZGVzY2VuZGFudF0nOiAnX2dldEFyaWFBY3RpdmVEZXNjZW5kYW50KCknLFxuICAgICdbYXR0ci5hcmlhLW9yaWVudGF0aW9uXSc6ICdvcmllbnRhdGlvbicsXG4gICAgJyhmb2N1cyknOiAnX2hhbmRsZUZvY3VzKCknLFxuICAgICcoa2V5ZG93biknOiAnX2hhbmRsZUtleWRvd24oJGV2ZW50KScsXG4gICAgJyhmb2N1c291dCknOiAnX2hhbmRsZUZvY3VzT3V0KCRldmVudCknLFxuICAgICcoZm9jdXNpbiknOiAnX2hhbmRsZUZvY3VzSW4oKScsXG4gIH0sXG4gIHByb3ZpZGVyczogW1xuICAgIHtcbiAgICAgIHByb3ZpZGU6IE5HX1ZBTFVFX0FDQ0VTU09SLFxuICAgICAgdXNlRXhpc3Rpbmc6IGZvcndhcmRSZWYoKCkgPT4gQ2RrTGlzdGJveCksXG4gICAgICBtdWx0aTogdHJ1ZSxcbiAgICB9LFxuICBdLFxufSlcbmV4cG9ydCBjbGFzcyBDZGtMaXN0Ym94PFQgPSB1bmtub3duPiBpbXBsZW1lbnRzIEFmdGVyQ29udGVudEluaXQsIE9uRGVzdHJveSwgQ29udHJvbFZhbHVlQWNjZXNzb3Ige1xuICAvKiogVGhlIGlkIG9mIHRoZSBvcHRpb24ncyBob3N0IGVsZW1lbnQuICovXG4gIEBJbnB1dCgpXG4gIGdldCBpZCgpIHtcbiAgICByZXR1cm4gdGhpcy5faWQgfHwgdGhpcy5fZ2VuZXJhdGVkSWQ7XG4gIH1cbiAgc2V0IGlkKHZhbHVlKSB7XG4gICAgdGhpcy5faWQgPSB2YWx1ZTtcbiAgfVxuICBwcml2YXRlIF9pZDogc3RyaW5nO1xuICBwcml2YXRlIF9nZW5lcmF0ZWRJZCA9IGBjZGstbGlzdGJveC0ke25leHRJZCsrfWA7XG5cbiAgLyoqIFRoZSB0YWJpbmRleCB0byB1c2Ugd2hlbiB0aGUgbGlzdGJveCBpcyBlbmFibGVkLiAqL1xuICBASW5wdXQoJ3RhYmluZGV4JylcbiAgZ2V0IGVuYWJsZWRUYWJJbmRleCgpIHtcbiAgICByZXR1cm4gdGhpcy5fZW5hYmxlZFRhYkluZGV4ID09PSB1bmRlZmluZWQgPyAwIDogdGhpcy5fZW5hYmxlZFRhYkluZGV4O1xuICB9XG4gIHNldCBlbmFibGVkVGFiSW5kZXgodmFsdWUpIHtcbiAgICB0aGlzLl9lbmFibGVkVGFiSW5kZXggPSB2YWx1ZTtcbiAgfVxuICBwcml2YXRlIF9lbmFibGVkVGFiSW5kZXg/OiBudW1iZXIgfCBudWxsO1xuXG4gIC8qKiBUaGUgdmFsdWUgc2VsZWN0ZWQgaW4gdGhlIGxpc3Rib3gsIHJlcHJlc2VudGVkIGFzIGFuIGFycmF5IG9mIG9wdGlvbiB2YWx1ZXMuICovXG4gIEBJbnB1dCgnY2RrTGlzdGJveFZhbHVlJylcbiAgZ2V0IHZhbHVlKCk6IHJlYWRvbmx5IFRbXSB7XG4gICAgcmV0dXJuIHRoaXMuX2ludmFsaWQgPyBbXSA6IHRoaXMuc2VsZWN0aW9uTW9kZWwuc2VsZWN0ZWQ7XG4gIH1cbiAgc2V0IHZhbHVlKHZhbHVlOiByZWFkb25seSBUW10pIHtcbiAgICB0aGlzLl9zZXRTZWxlY3Rpb24odmFsdWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlIGxpc3Rib3ggYWxsb3dzIG11bHRpcGxlIG9wdGlvbnMgdG8gYmUgc2VsZWN0ZWQuIElmIHRoZSB2YWx1ZSBzd2l0Y2hlcyBmcm9tIGB0cnVlYFxuICAgKiB0byBgZmFsc2VgLCBhbmQgbW9yZSB0aGFuIG9uZSBvcHRpb24gaXMgc2VsZWN0ZWQsIGFsbCBvcHRpb25zIGFyZSBkZXNlbGVjdGVkLlxuICAgKi9cbiAgQElucHV0KHthbGlhczogJ2Nka0xpc3Rib3hNdWx0aXBsZScsIHRyYW5zZm9ybTogYm9vbGVhbkF0dHJpYnV0ZX0pXG4gIGdldCBtdWx0aXBsZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5zZWxlY3Rpb25Nb2RlbC5tdWx0aXBsZTtcbiAgfVxuICBzZXQgbXVsdGlwbGUodmFsdWU6IGJvb2xlYW4pIHtcbiAgICB0aGlzLnNlbGVjdGlvbk1vZGVsLm11bHRpcGxlID0gdmFsdWU7XG5cbiAgICBpZiAodGhpcy5vcHRpb25zKSB7XG4gICAgICB0aGlzLl91cGRhdGVJbnRlcm5hbFZhbHVlKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGxpc3Rib3ggaXMgZGlzYWJsZWQuICovXG4gIEBJbnB1dCh7YWxpYXM6ICdjZGtMaXN0Ym94RGlzYWJsZWQnLCB0cmFuc2Zvcm06IGJvb2xlYW5BdHRyaWJ1dGV9KVxuICBkaXNhYmxlZDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBsaXN0Ym94IHdpbGwgdXNlIGFjdGl2ZSBkZXNjZW5kYW50IG9yIHdpbGwgbW92ZSBmb2N1cyBvbnRvIHRoZSBvcHRpb25zLiAqL1xuICBASW5wdXQoe2FsaWFzOiAnY2RrTGlzdGJveFVzZUFjdGl2ZURlc2NlbmRhbnQnLCB0cmFuc2Zvcm06IGJvb2xlYW5BdHRyaWJ1dGV9KVxuICB1c2VBY3RpdmVEZXNjZW5kYW50OiBib29sZWFuID0gZmFsc2U7XG5cbiAgLyoqIFRoZSBvcmllbnRhdGlvbiBvZiB0aGUgbGlzdGJveC4gT25seSBhZmZlY3RzIGtleWJvYXJkIGludGVyYWN0aW9uLCBub3QgdmlzdWFsIGxheW91dC4gKi9cbiAgQElucHV0KCdjZGtMaXN0Ym94T3JpZW50YXRpb24nKVxuICBnZXQgb3JpZW50YXRpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuX29yaWVudGF0aW9uO1xuICB9XG4gIHNldCBvcmllbnRhdGlvbih2YWx1ZTogJ2hvcml6b250YWwnIHwgJ3ZlcnRpY2FsJykge1xuICAgIHRoaXMuX29yaWVudGF0aW9uID0gdmFsdWUgPT09ICdob3Jpem9udGFsJyA/ICdob3Jpem9udGFsJyA6ICd2ZXJ0aWNhbCc7XG4gICAgaWYgKHZhbHVlID09PSAnaG9yaXpvbnRhbCcpIHtcbiAgICAgIHRoaXMubGlzdEtleU1hbmFnZXI/LndpdGhIb3Jpem9udGFsT3JpZW50YXRpb24odGhpcy5fZGlyPy52YWx1ZSB8fCAnbHRyJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubGlzdEtleU1hbmFnZXI/LndpdGhWZXJ0aWNhbE9yaWVudGF0aW9uKCk7XG4gICAgfVxuICB9XG4gIHByaXZhdGUgX29yaWVudGF0aW9uOiAnaG9yaXpvbnRhbCcgfCAndmVydGljYWwnID0gJ3ZlcnRpY2FsJztcblxuICAvKiogVGhlIGZ1bmN0aW9uIHVzZWQgdG8gY29tcGFyZSBvcHRpb24gdmFsdWVzLiAqL1xuICBASW5wdXQoJ2Nka0xpc3Rib3hDb21wYXJlV2l0aCcpXG4gIGdldCBjb21wYXJlV2l0aCgpOiB1bmRlZmluZWQgfCAoKG8xOiBULCBvMjogVCkgPT4gYm9vbGVhbikge1xuICAgIHJldHVybiB0aGlzLnNlbGVjdGlvbk1vZGVsLmNvbXBhcmVXaXRoO1xuICB9XG4gIHNldCBjb21wYXJlV2l0aChmbjogdW5kZWZpbmVkIHwgKChvMTogVCwgbzI6IFQpID0+IGJvb2xlYW4pKSB7XG4gICAgdGhpcy5zZWxlY3Rpb25Nb2RlbC5jb21wYXJlV2l0aCA9IGZuO1xuICB9XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlIGtleWJvYXJkIG5hdmlnYXRpb24gc2hvdWxkIHdyYXAgd2hlbiB0aGUgdXNlciBwcmVzc2VzIGFycm93IGRvd24gb24gdGhlIGxhc3QgaXRlbVxuICAgKiBvciBhcnJvdyB1cCBvbiB0aGUgZmlyc3QgaXRlbS5cbiAgICovXG4gIEBJbnB1dCh7YWxpYXM6ICdjZGtMaXN0Ym94TmF2aWdhdGlvbldyYXBEaXNhYmxlZCcsIHRyYW5zZm9ybTogYm9vbGVhbkF0dHJpYnV0ZX0pXG4gIGdldCBuYXZpZ2F0aW9uV3JhcERpc2FibGVkKCkge1xuICAgIHJldHVybiB0aGlzLl9uYXZpZ2F0aW9uV3JhcERpc2FibGVkO1xuICB9XG4gIHNldCBuYXZpZ2F0aW9uV3JhcERpc2FibGVkKHdyYXA6IGJvb2xlYW4pIHtcbiAgICB0aGlzLl9uYXZpZ2F0aW9uV3JhcERpc2FibGVkID0gd3JhcDtcbiAgICB0aGlzLmxpc3RLZXlNYW5hZ2VyPy53aXRoV3JhcCghdGhpcy5fbmF2aWdhdGlvbldyYXBEaXNhYmxlZCk7XG4gIH1cbiAgcHJpdmF0ZSBfbmF2aWdhdGlvbldyYXBEaXNhYmxlZCA9IGZhbHNlO1xuXG4gIC8qKiBXaGV0aGVyIGtleWJvYXJkIG5hdmlnYXRpb24gc2hvdWxkIHNraXAgb3ZlciBkaXNhYmxlZCBpdGVtcy4gKi9cbiAgQElucHV0KHthbGlhczogJ2Nka0xpc3Rib3hOYXZpZ2F0ZXNEaXNhYmxlZE9wdGlvbnMnLCB0cmFuc2Zvcm06IGJvb2xlYW5BdHRyaWJ1dGV9KVxuICBnZXQgbmF2aWdhdGVEaXNhYmxlZE9wdGlvbnMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX25hdmlnYXRlRGlzYWJsZWRPcHRpb25zO1xuICB9XG4gIHNldCBuYXZpZ2F0ZURpc2FibGVkT3B0aW9ucyhza2lwOiBib29sZWFuKSB7XG4gICAgdGhpcy5fbmF2aWdhdGVEaXNhYmxlZE9wdGlvbnMgPSBza2lwO1xuICAgIHRoaXMubGlzdEtleU1hbmFnZXI/LnNraXBQcmVkaWNhdGUoXG4gICAgICB0aGlzLl9uYXZpZ2F0ZURpc2FibGVkT3B0aW9ucyA/IHRoaXMuX3NraXBOb25lUHJlZGljYXRlIDogdGhpcy5fc2tpcERpc2FibGVkUHJlZGljYXRlLFxuICAgICk7XG4gIH1cbiAgcHJpdmF0ZSBfbmF2aWdhdGVEaXNhYmxlZE9wdGlvbnMgPSBmYWxzZTtcblxuICAvKiogRW1pdHMgd2hlbiB0aGUgc2VsZWN0ZWQgdmFsdWUocykgaW4gdGhlIGxpc3Rib3ggY2hhbmdlLiAqL1xuICBAT3V0cHV0KCdjZGtMaXN0Ym94VmFsdWVDaGFuZ2UnKSByZWFkb25seSB2YWx1ZUNoYW5nZSA9IG5ldyBTdWJqZWN0PExpc3Rib3hWYWx1ZUNoYW5nZUV2ZW50PFQ+PigpO1xuXG4gIC8qKiBUaGUgY2hpbGQgb3B0aW9ucyBpbiB0aGlzIGxpc3Rib3guICovXG4gIEBDb250ZW50Q2hpbGRyZW4oQ2RrT3B0aW9uLCB7ZGVzY2VuZGFudHM6IHRydWV9KSBwcm90ZWN0ZWQgb3B0aW9uczogUXVlcnlMaXN0PENka09wdGlvbjxUPj47XG5cbiAgLyoqIFRoZSBzZWxlY3Rpb24gbW9kZWwgdXNlZCBieSB0aGUgbGlzdGJveC4gKi9cbiAgcHJvdGVjdGVkIHNlbGVjdGlvbk1vZGVsID0gbmV3IExpc3Rib3hTZWxlY3Rpb25Nb2RlbDxUPigpO1xuXG4gIC8qKiBUaGUga2V5IG1hbmFnZXIgdGhhdCBtYW5hZ2VzIGtleWJvYXJkIG5hdmlnYXRpb24gZm9yIHRoaXMgbGlzdGJveC4gKi9cbiAgcHJvdGVjdGVkIGxpc3RLZXlNYW5hZ2VyOiBBY3RpdmVEZXNjZW5kYW50S2V5TWFuYWdlcjxDZGtPcHRpb248VD4+O1xuXG4gIC8qKiBFbWl0cyB3aGVuIHRoZSBsaXN0Ym94IGlzIGRlc3Ryb3llZC4gKi9cbiAgcHJvdGVjdGVkIHJlYWRvbmx5IGRlc3Ryb3llZCA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XG5cbiAgLyoqIFRoZSBob3N0IGVsZW1lbnQgb2YgdGhlIGxpc3Rib3guICovXG4gIHByb3RlY3RlZCByZWFkb25seSBlbGVtZW50OiBIVE1MRWxlbWVudCA9IGluamVjdChFbGVtZW50UmVmKS5uYXRpdmVFbGVtZW50O1xuXG4gIC8qKiBUaGUgQW5ndWxhciB6b25lLiAqL1xuICBwcm90ZWN0ZWQgcmVhZG9ubHkgbmdab25lID0gaW5qZWN0KE5nWm9uZSk7XG5cbiAgLyoqIFRoZSBjaGFuZ2UgZGV0ZWN0b3IgZm9yIHRoaXMgbGlzdGJveC4gKi9cbiAgcHJvdGVjdGVkIHJlYWRvbmx5IGNoYW5nZURldGVjdG9yUmVmID0gaW5qZWN0KENoYW5nZURldGVjdG9yUmVmKTtcblxuICAvKiogV2hldGhlciB0aGUgY3VycmVudGx5IHNlbGVjdGVkIHZhbHVlIGluIHRoZSBzZWxlY3Rpb24gbW9kZWwgaXMgaW52YWxpZC4gKi9cbiAgcHJpdmF0ZSBfaW52YWxpZCA9IGZhbHNlO1xuXG4gIC8qKiBUaGUgbGFzdCB1c2VyLXRyaWdnZXJlZCBvcHRpb24uICovXG4gIHByaXZhdGUgX2xhc3RUcmlnZ2VyZWQ6IENka09wdGlvbjxUPiB8IG51bGwgPSBudWxsO1xuXG4gIC8qKiBDYWxsYmFjayBjYWxsZWQgd2hlbiB0aGUgbGlzdGJveCBoYXMgYmVlbiB0b3VjaGVkICovXG4gIHByaXZhdGUgX29uVG91Y2hlZCA9ICgpID0+IHt9O1xuXG4gIC8qKiBDYWxsYmFjayBjYWxsZWQgd2hlbiB0aGUgbGlzdGJveCB2YWx1ZSBjaGFuZ2VzICovXG4gIHByaXZhdGUgX29uQ2hhbmdlOiAodmFsdWU6IHJlYWRvbmx5IFRbXSkgPT4gdm9pZCA9ICgpID0+IHt9O1xuXG4gIC8qKiBFbWl0cyB3aGVuIGFuIG9wdGlvbiBoYXMgYmVlbiBjbGlja2VkLiAqL1xuICBwcml2YXRlIF9vcHRpb25DbGlja2VkID0gZGVmZXIoKCkgPT5cbiAgICAodGhpcy5vcHRpb25zLmNoYW5nZXMgYXMgT2JzZXJ2YWJsZTxDZGtPcHRpb248VD5bXT4pLnBpcGUoXG4gICAgICBzdGFydFdpdGgodGhpcy5vcHRpb25zKSxcbiAgICAgIHN3aXRjaE1hcChvcHRpb25zID0+XG4gICAgICAgIG1lcmdlKC4uLm9wdGlvbnMubWFwKG9wdGlvbiA9PiBvcHRpb24uX2NsaWNrZWQucGlwZShtYXAoZXZlbnQgPT4gKHtvcHRpb24sIGV2ZW50fSkpKSkpLFxuICAgICAgKSxcbiAgICApLFxuICApO1xuXG4gIC8qKiBUaGUgZGlyZWN0aW9uYWxpdHkgb2YgdGhlIHBhZ2UuICovXG4gIHByaXZhdGUgcmVhZG9ubHkgX2RpciA9IGluamVjdChEaXJlY3Rpb25hbGl0eSwge29wdGlvbmFsOiB0cnVlfSk7XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGNvbXBvbmVudCBpcyBiZWluZyByZW5kZXJlZCBpbiB0aGUgYnJvd3Nlci4gKi9cbiAgcHJpdmF0ZSByZWFkb25seSBfaXNCcm93c2VyOiBib29sZWFuID0gaW5qZWN0KFBsYXRmb3JtKS5pc0Jyb3dzZXI7XG5cbiAgLyoqIEEgcHJlZGljYXRlIHRoYXQgc2tpcHMgZGlzYWJsZWQgb3B0aW9ucy4gKi9cbiAgcHJpdmF0ZSByZWFkb25seSBfc2tpcERpc2FibGVkUHJlZGljYXRlID0gKG9wdGlvbjogQ2RrT3B0aW9uPFQ+KSA9PiBvcHRpb24uZGlzYWJsZWQ7XG5cbiAgLyoqIEEgcHJlZGljYXRlIHRoYXQgZG9lcyBub3Qgc2tpcCBhbnkgb3B0aW9ucy4gKi9cbiAgcHJpdmF0ZSByZWFkb25seSBfc2tpcE5vbmVQcmVkaWNhdGUgPSAoKSA9PiBmYWxzZTtcblxuICAvKiogV2hldGhlciB0aGUgbGlzdGJveCBjdXJyZW50bHkgaGFzIGZvY3VzLiAqL1xuICBwcml2YXRlIF9oYXNGb2N1cyA9IGZhbHNlO1xuXG4gIC8qKiBBIHJlZmVyZW5jZSB0byB0aGUgb3B0aW9uIHRoYXQgd2FzIGFjdGl2ZSBiZWZvcmUgdGhlIGxpc3Rib3ggbG9zdCBmb2N1cy4gKi9cbiAgcHJpdmF0ZSBfcHJldmlvdXNBY3RpdmVPcHRpb246IENka09wdGlvbjxUPiB8IG51bGwgPSBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIGlmICh0aGlzLl9pc0Jyb3dzZXIpIHtcbiAgICAgIHRoaXMuX3NldFByZXZpb3VzQWN0aXZlT3B0aW9uQXNBY3RpdmVPcHRpb25PbldpbmRvd0JsdXIoKTtcbiAgICB9XG4gIH1cblxuICBuZ0FmdGVyQ29udGVudEluaXQoKSB7XG4gICAgaWYgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkge1xuICAgICAgdGhpcy5fdmVyaWZ5Tm9PcHRpb25WYWx1ZUNvbGxpc2lvbnMoKTtcbiAgICAgIHRoaXMuX3ZlcmlmeU9wdGlvblZhbHVlcygpO1xuICAgIH1cblxuICAgIHRoaXMuX2luaXRLZXlNYW5hZ2VyKCk7XG5cbiAgICAvLyBVcGRhdGUgdGhlIGludGVybmFsIHZhbHVlIHdoZW5ldmVyIHRoZSBvcHRpb25zIG9yIHRoZSBtb2RlbCB2YWx1ZSBjaGFuZ2VzLlxuICAgIG1lcmdlKHRoaXMuc2VsZWN0aW9uTW9kZWwuY2hhbmdlZCwgdGhpcy5vcHRpb25zLmNoYW5nZXMpXG4gICAgICAucGlwZShzdGFydFdpdGgobnVsbCksIHRha2VVbnRpbCh0aGlzLmRlc3Ryb3llZCkpXG4gICAgICAuc3Vic2NyaWJlKCgpID0+IHRoaXMuX3VwZGF0ZUludGVybmFsVmFsdWUoKSk7XG5cbiAgICB0aGlzLl9vcHRpb25DbGlja2VkXG4gICAgICAucGlwZShcbiAgICAgICAgZmlsdGVyKCh7b3B0aW9ufSkgPT4gIW9wdGlvbi5kaXNhYmxlZCksXG4gICAgICAgIHRha2VVbnRpbCh0aGlzLmRlc3Ryb3llZCksXG4gICAgICApXG4gICAgICAuc3Vic2NyaWJlKCh7b3B0aW9uLCBldmVudH0pID0+IHRoaXMuX2hhbmRsZU9wdGlvbkNsaWNrZWQob3B0aW9uLCBldmVudCkpO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdGhpcy5saXN0S2V5TWFuYWdlcj8uZGVzdHJveSgpO1xuICAgIHRoaXMuZGVzdHJveWVkLm5leHQoKTtcbiAgICB0aGlzLmRlc3Ryb3llZC5jb21wbGV0ZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRvZ2dsZSB0aGUgc2VsZWN0ZWQgc3RhdGUgb2YgdGhlIGdpdmVuIG9wdGlvbi5cbiAgICogQHBhcmFtIG9wdGlvbiBUaGUgb3B0aW9uIHRvIHRvZ2dsZVxuICAgKi9cbiAgdG9nZ2xlKG9wdGlvbjogQ2RrT3B0aW9uPFQ+KSB7XG4gICAgdGhpcy50b2dnbGVWYWx1ZShvcHRpb24udmFsdWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRvZ2dsZSB0aGUgc2VsZWN0ZWQgc3RhdGUgb2YgdGhlIGdpdmVuIHZhbHVlLlxuICAgKiBAcGFyYW0gdmFsdWUgVGhlIHZhbHVlIHRvIHRvZ2dsZVxuICAgKi9cbiAgdG9nZ2xlVmFsdWUodmFsdWU6IFQpIHtcbiAgICBpZiAodGhpcy5faW52YWxpZCkge1xuICAgICAgdGhpcy5zZWxlY3Rpb25Nb2RlbC5jbGVhcihmYWxzZSk7XG4gICAgfVxuICAgIHRoaXMuc2VsZWN0aW9uTW9kZWwudG9nZ2xlKHZhbHVlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWxlY3QgdGhlIGdpdmVuIG9wdGlvbi5cbiAgICogQHBhcmFtIG9wdGlvbiBUaGUgb3B0aW9uIHRvIHNlbGVjdFxuICAgKi9cbiAgc2VsZWN0KG9wdGlvbjogQ2RrT3B0aW9uPFQ+KSB7XG4gICAgdGhpcy5zZWxlY3RWYWx1ZShvcHRpb24udmFsdWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlbGVjdCB0aGUgZ2l2ZW4gdmFsdWUuXG4gICAqIEBwYXJhbSB2YWx1ZSBUaGUgdmFsdWUgdG8gc2VsZWN0XG4gICAqL1xuICBzZWxlY3RWYWx1ZSh2YWx1ZTogVCkge1xuICAgIGlmICh0aGlzLl9pbnZhbGlkKSB7XG4gICAgICB0aGlzLnNlbGVjdGlvbk1vZGVsLmNsZWFyKGZhbHNlKTtcbiAgICB9XG4gICAgdGhpcy5zZWxlY3Rpb25Nb2RlbC5zZWxlY3QodmFsdWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIERlc2VsZWN0IHRoZSBnaXZlbiBvcHRpb24uXG4gICAqIEBwYXJhbSBvcHRpb24gVGhlIG9wdGlvbiB0byBkZXNlbGVjdFxuICAgKi9cbiAgZGVzZWxlY3Qob3B0aW9uOiBDZGtPcHRpb248VD4pIHtcbiAgICB0aGlzLmRlc2VsZWN0VmFsdWUob3B0aW9uLnZhbHVlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXNlbGVjdCB0aGUgZ2l2ZW4gdmFsdWUuXG4gICAqIEBwYXJhbSB2YWx1ZSBUaGUgdmFsdWUgdG8gZGVzZWxlY3RcbiAgICovXG4gIGRlc2VsZWN0VmFsdWUodmFsdWU6IFQpIHtcbiAgICBpZiAodGhpcy5faW52YWxpZCkge1xuICAgICAgdGhpcy5zZWxlY3Rpb25Nb2RlbC5jbGVhcihmYWxzZSk7XG4gICAgfVxuICAgIHRoaXMuc2VsZWN0aW9uTW9kZWwuZGVzZWxlY3QodmFsdWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCB0aGUgc2VsZWN0ZWQgc3RhdGUgb2YgYWxsIG9wdGlvbnMuXG4gICAqIEBwYXJhbSBpc1NlbGVjdGVkIFRoZSBuZXcgc2VsZWN0ZWQgc3RhdGUgdG8gc2V0XG4gICAqL1xuICBzZXRBbGxTZWxlY3RlZChpc1NlbGVjdGVkOiBib29sZWFuKSB7XG4gICAgaWYgKCFpc1NlbGVjdGVkKSB7XG4gICAgICB0aGlzLnNlbGVjdGlvbk1vZGVsLmNsZWFyKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0aGlzLl9pbnZhbGlkKSB7XG4gICAgICAgIHRoaXMuc2VsZWN0aW9uTW9kZWwuY2xlYXIoZmFsc2UpO1xuICAgICAgfVxuICAgICAgdGhpcy5zZWxlY3Rpb25Nb2RlbC5zZWxlY3QoLi4udGhpcy5vcHRpb25zLm1hcChvcHRpb24gPT4gb3B0aW9uLnZhbHVlKSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCB3aGV0aGVyIHRoZSBnaXZlbiBvcHRpb24gaXMgc2VsZWN0ZWQuXG4gICAqIEBwYXJhbSBvcHRpb24gVGhlIG9wdGlvbiB0byBnZXQgdGhlIHNlbGVjdGVkIHN0YXRlIG9mXG4gICAqL1xuICBpc1NlbGVjdGVkKG9wdGlvbjogQ2RrT3B0aW9uPFQ+KSB7XG4gICAgcmV0dXJuIHRoaXMuaXNWYWx1ZVNlbGVjdGVkKG9wdGlvbi52YWx1ZSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHdoZXRoZXIgdGhlIGdpdmVuIG9wdGlvbiBpcyBhY3RpdmUuXG4gICAqIEBwYXJhbSBvcHRpb24gVGhlIG9wdGlvbiB0byBnZXQgdGhlIGFjdGl2ZSBzdGF0ZSBvZlxuICAgKi9cbiAgaXNBY3RpdmUob3B0aW9uOiBDZGtPcHRpb248VD4pOiBib29sZWFuIHtcbiAgICByZXR1cm4gISEodGhpcy5saXN0S2V5TWFuYWdlcj8uYWN0aXZlSXRlbSA9PT0gb3B0aW9uKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgd2hldGhlciB0aGUgZ2l2ZW4gdmFsdWUgaXMgc2VsZWN0ZWQuXG4gICAqIEBwYXJhbSB2YWx1ZSBUaGUgdmFsdWUgdG8gZ2V0IHRoZSBzZWxlY3RlZCBzdGF0ZSBvZlxuICAgKi9cbiAgaXNWYWx1ZVNlbGVjdGVkKHZhbHVlOiBUKSB7XG4gICAgaWYgKHRoaXMuX2ludmFsaWQpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuc2VsZWN0aW9uTW9kZWwuaXNTZWxlY3RlZCh2YWx1ZSk7XG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXJzIGEgY2FsbGJhY2sgdG8gYmUgaW52b2tlZCB3aGVuIHRoZSBsaXN0Ym94J3MgdmFsdWUgY2hhbmdlcyBmcm9tIHVzZXIgaW5wdXQuXG4gICAqIEBwYXJhbSBmbiBUaGUgY2FsbGJhY2sgdG8gcmVnaXN0ZXJcbiAgICogQGRvY3MtcHJpdmF0ZVxuICAgKi9cbiAgcmVnaXN0ZXJPbkNoYW5nZShmbjogKHZhbHVlOiByZWFkb25seSBUW10pID0+IHZvaWQpOiB2b2lkIHtcbiAgICB0aGlzLl9vbkNoYW5nZSA9IGZuO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVycyBhIGNhbGxiYWNrIHRvIGJlIGludm9rZWQgd2hlbiB0aGUgbGlzdGJveCBpcyBibHVycmVkIGJ5IHRoZSB1c2VyLlxuICAgKiBAcGFyYW0gZm4gVGhlIGNhbGxiYWNrIHRvIHJlZ2lzdGVyXG4gICAqIEBkb2NzLXByaXZhdGVcbiAgICovXG4gIHJlZ2lzdGVyT25Ub3VjaGVkKGZuOiAoKSA9PiB7fSk6IHZvaWQge1xuICAgIHRoaXMuX29uVG91Y2hlZCA9IGZuO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGxpc3Rib3gncyB2YWx1ZS5cbiAgICogQHBhcmFtIHZhbHVlIFRoZSBuZXcgdmFsdWUgb2YgdGhlIGxpc3Rib3hcbiAgICogQGRvY3MtcHJpdmF0ZVxuICAgKi9cbiAgd3JpdGVWYWx1ZSh2YWx1ZTogcmVhZG9ubHkgVFtdKTogdm9pZCB7XG4gICAgdGhpcy5fc2V0U2VsZWN0aW9uKHZhbHVlKTtcbiAgICB0aGlzLl92ZXJpZnlPcHRpb25WYWx1ZXMoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBkaXNhYmxlZCBzdGF0ZSBvZiB0aGUgbGlzdGJveC5cbiAgICogQHBhcmFtIGlzRGlzYWJsZWQgVGhlIG5ldyBkaXNhYmxlZCBzdGF0ZVxuICAgKiBAZG9jcy1wcml2YXRlXG4gICAqL1xuICBzZXREaXNhYmxlZFN0YXRlKGlzRGlzYWJsZWQ6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLmRpc2FibGVkID0gaXNEaXNhYmxlZDtcbiAgfVxuXG4gIC8qKiBGb2N1cyB0aGUgbGlzdGJveCdzIGhvc3QgZWxlbWVudC4gKi9cbiAgZm9jdXMoKSB7XG4gICAgdGhpcy5lbGVtZW50LmZvY3VzKCk7XG4gIH1cblxuICAvKipcbiAgICogVHJpZ2dlcnMgdGhlIGdpdmVuIG9wdGlvbiBpbiByZXNwb25zZSB0byB1c2VyIGludGVyYWN0aW9uLlxuICAgKiAtIEluIHNpbmdsZSBzZWxlY3Rpb24gbW9kZTogc2VsZWN0cyB0aGUgb3B0aW9uIGFuZCBkZXNlbGVjdHMgYW55IG90aGVyIHNlbGVjdGVkIG9wdGlvbi5cbiAgICogLSBJbiBtdWx0aSBzZWxlY3Rpb24gbW9kZTogdG9nZ2xlcyB0aGUgc2VsZWN0ZWQgc3RhdGUgb2YgdGhlIG9wdGlvbi5cbiAgICogQHBhcmFtIG9wdGlvbiBUaGUgb3B0aW9uIHRvIHRyaWdnZXJcbiAgICovXG4gIHByb3RlY3RlZCB0cmlnZ2VyT3B0aW9uKG9wdGlvbjogQ2RrT3B0aW9uPFQ+IHwgbnVsbCkge1xuICAgIGlmIChvcHRpb24gJiYgIW9wdGlvbi5kaXNhYmxlZCkge1xuICAgICAgdGhpcy5fbGFzdFRyaWdnZXJlZCA9IG9wdGlvbjtcbiAgICAgIGNvbnN0IGNoYW5nZWQgPSB0aGlzLm11bHRpcGxlXG4gICAgICAgID8gdGhpcy5zZWxlY3Rpb25Nb2RlbC50b2dnbGUob3B0aW9uLnZhbHVlKVxuICAgICAgICA6IHRoaXMuc2VsZWN0aW9uTW9kZWwuc2VsZWN0KG9wdGlvbi52YWx1ZSk7XG4gICAgICBpZiAoY2hhbmdlZCkge1xuICAgICAgICB0aGlzLl9vbkNoYW5nZSh0aGlzLnZhbHVlKTtcbiAgICAgICAgdGhpcy52YWx1ZUNoYW5nZS5uZXh0KHtcbiAgICAgICAgICB2YWx1ZTogdGhpcy52YWx1ZSxcbiAgICAgICAgICBsaXN0Ym94OiB0aGlzLFxuICAgICAgICAgIG9wdGlvbjogb3B0aW9uLFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVHJpZ2dlciB0aGUgZ2l2ZW4gcmFuZ2Ugb2Ygb3B0aW9ucyBpbiByZXNwb25zZSB0byB1c2VyIGludGVyYWN0aW9uLlxuICAgKiBTaG91bGQgb25seSBiZSBjYWxsZWQgaW4gbXVsdGktc2VsZWN0aW9uIG1vZGUuXG4gICAqIEBwYXJhbSB0cmlnZ2VyIFRoZSBvcHRpb24gdGhhdCB3YXMgdHJpZ2dlcmVkXG4gICAqIEBwYXJhbSBmcm9tIFRoZSBzdGFydCBpbmRleCBvZiB0aGUgb3B0aW9ucyB0byB0b2dnbGVcbiAgICogQHBhcmFtIHRvIFRoZSBlbmQgaW5kZXggb2YgdGhlIG9wdGlvbnMgdG8gdG9nZ2xlXG4gICAqIEBwYXJhbSBvbiBXaGV0aGVyIHRvIHRvZ2dsZSB0aGUgb3B0aW9uIHJhbmdlIG9uXG4gICAqL1xuICBwcm90ZWN0ZWQgdHJpZ2dlclJhbmdlKHRyaWdnZXI6IENka09wdGlvbjxUPiB8IG51bGwsIGZyb206IG51bWJlciwgdG86IG51bWJlciwgb246IGJvb2xlYW4pIHtcbiAgICBpZiAodGhpcy5kaXNhYmxlZCB8fCAodHJpZ2dlciAmJiB0cmlnZ2VyLmRpc2FibGVkKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLl9sYXN0VHJpZ2dlcmVkID0gdHJpZ2dlcjtcbiAgICBjb25zdCBpc0VxdWFsID0gdGhpcy5jb21wYXJlV2l0aCA/PyBPYmplY3QuaXM7XG4gICAgY29uc3QgdXBkYXRlVmFsdWVzID0gWy4uLnRoaXMub3B0aW9uc11cbiAgICAgIC5zbGljZShNYXRoLm1heCgwLCBNYXRoLm1pbihmcm9tLCB0bykpLCBNYXRoLm1pbih0aGlzLm9wdGlvbnMubGVuZ3RoLCBNYXRoLm1heChmcm9tLCB0bykgKyAxKSlcbiAgICAgIC5maWx0ZXIob3B0aW9uID0+ICFvcHRpb24uZGlzYWJsZWQpXG4gICAgICAubWFwKG9wdGlvbiA9PiBvcHRpb24udmFsdWUpO1xuICAgIGNvbnN0IHNlbGVjdGVkID0gWy4uLnRoaXMudmFsdWVdO1xuICAgIGZvciAoY29uc3QgdXBkYXRlVmFsdWUgb2YgdXBkYXRlVmFsdWVzKSB7XG4gICAgICBjb25zdCBzZWxlY3RlZEluZGV4ID0gc2VsZWN0ZWQuZmluZEluZGV4KHNlbGVjdGVkVmFsdWUgPT5cbiAgICAgICAgaXNFcXVhbChzZWxlY3RlZFZhbHVlLCB1cGRhdGVWYWx1ZSksXG4gICAgICApO1xuICAgICAgaWYgKG9uICYmIHNlbGVjdGVkSW5kZXggPT09IC0xKSB7XG4gICAgICAgIHNlbGVjdGVkLnB1c2godXBkYXRlVmFsdWUpO1xuICAgICAgfSBlbHNlIGlmICghb24gJiYgc2VsZWN0ZWRJbmRleCAhPT0gLTEpIHtcbiAgICAgICAgc2VsZWN0ZWQuc3BsaWNlKHNlbGVjdGVkSW5kZXgsIDEpO1xuICAgICAgfVxuICAgIH1cbiAgICBsZXQgY2hhbmdlZCA9IHRoaXMuc2VsZWN0aW9uTW9kZWwuc2V0U2VsZWN0aW9uKC4uLnNlbGVjdGVkKTtcbiAgICBpZiAoY2hhbmdlZCkge1xuICAgICAgdGhpcy5fb25DaGFuZ2UodGhpcy52YWx1ZSk7XG4gICAgICB0aGlzLnZhbHVlQ2hhbmdlLm5leHQoe1xuICAgICAgICB2YWx1ZTogdGhpcy52YWx1ZSxcbiAgICAgICAgbGlzdGJveDogdGhpcyxcbiAgICAgICAgb3B0aW9uOiB0cmlnZ2VyLFxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGdpdmVuIG9wdGlvbiBhcyBhY3RpdmUuXG4gICAqIEBwYXJhbSBvcHRpb24gVGhlIG9wdGlvbiB0byBtYWtlIGFjdGl2ZVxuICAgKi9cbiAgX3NldEFjdGl2ZU9wdGlvbihvcHRpb246IENka09wdGlvbjxUPikge1xuICAgIHRoaXMubGlzdEtleU1hbmFnZXIuc2V0QWN0aXZlSXRlbShvcHRpb24pO1xuICB9XG5cbiAgLyoqIENhbGxlZCB3aGVuIHRoZSBsaXN0Ym94IHJlY2VpdmVzIGZvY3VzLiAqL1xuICBwcm90ZWN0ZWQgX2hhbmRsZUZvY3VzKCkge1xuICAgIGlmICghdGhpcy51c2VBY3RpdmVEZXNjZW5kYW50KSB7XG4gICAgICBpZiAodGhpcy5zZWxlY3Rpb25Nb2RlbC5zZWxlY3RlZC5sZW5ndGggPiAwKSB7XG4gICAgICAgIHRoaXMuX3NldE5leHRGb2N1c1RvU2VsZWN0ZWRPcHRpb24oKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMubGlzdEtleU1hbmFnZXIuc2V0TmV4dEl0ZW1BY3RpdmUoKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fZm9jdXNBY3RpdmVPcHRpb24oKTtcbiAgICB9XG4gIH1cblxuICAvKiogQ2FsbGVkIHdoZW4gdGhlIHVzZXIgcHJlc3NlcyBrZXlkb3duIG9uIHRoZSBsaXN0Ym94LiAqL1xuICBwcm90ZWN0ZWQgX2hhbmRsZUtleWRvd24oZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcbiAgICBpZiAodGhpcy5kaXNhYmxlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHtrZXlDb2RlfSA9IGV2ZW50O1xuICAgIGNvbnN0IHByZXZpb3VzQWN0aXZlSW5kZXggPSB0aGlzLmxpc3RLZXlNYW5hZ2VyLmFjdGl2ZUl0ZW1JbmRleDtcbiAgICBjb25zdCBjdHJsS2V5cyA9IFsnY3RybEtleScsICdtZXRhS2V5J10gYXMgY29uc3Q7XG5cbiAgICBpZiAodGhpcy5tdWx0aXBsZSAmJiBrZXlDb2RlID09PSBBICYmIGhhc01vZGlmaWVyS2V5KGV2ZW50LCAuLi5jdHJsS2V5cykpIHtcbiAgICAgIC8vIFRvZ2dsZSBhbGwgb3B0aW9ucyBvZmYgaWYgdGhleSdyZSBhbGwgc2VsZWN0ZWQsIG90aGVyd2lzZSB0b2dnbGUgdGhlbSBhbGwgb24uXG4gICAgICB0aGlzLnRyaWdnZXJSYW5nZShcbiAgICAgICAgbnVsbCxcbiAgICAgICAgMCxcbiAgICAgICAgdGhpcy5vcHRpb25zLmxlbmd0aCAtIDEsXG4gICAgICAgIHRoaXMub3B0aW9ucy5sZW5ndGggIT09IHRoaXMudmFsdWUubGVuZ3RoLFxuICAgICAgKTtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKFxuICAgICAgdGhpcy5tdWx0aXBsZSAmJlxuICAgICAgKGtleUNvZGUgPT09IFNQQUNFIHx8IGtleUNvZGUgPT09IEVOVEVSKSAmJlxuICAgICAgaGFzTW9kaWZpZXJLZXkoZXZlbnQsICdzaGlmdEtleScpXG4gICAgKSB7XG4gICAgICBpZiAodGhpcy5saXN0S2V5TWFuYWdlci5hY3RpdmVJdGVtICYmIHRoaXMubGlzdEtleU1hbmFnZXIuYWN0aXZlSXRlbUluZGV4ICE9IG51bGwpIHtcbiAgICAgICAgdGhpcy50cmlnZ2VyUmFuZ2UoXG4gICAgICAgICAgdGhpcy5saXN0S2V5TWFuYWdlci5hY3RpdmVJdGVtLFxuICAgICAgICAgIHRoaXMuX2dldExhc3RUcmlnZ2VyZWRJbmRleCgpID8/IHRoaXMubGlzdEtleU1hbmFnZXIuYWN0aXZlSXRlbUluZGV4LFxuICAgICAgICAgIHRoaXMubGlzdEtleU1hbmFnZXIuYWN0aXZlSXRlbUluZGV4LFxuICAgICAgICAgICF0aGlzLmxpc3RLZXlNYW5hZ2VyLmFjdGl2ZUl0ZW0uaXNTZWxlY3RlZCgpLFxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoXG4gICAgICB0aGlzLm11bHRpcGxlICYmXG4gICAgICBrZXlDb2RlID09PSBIT01FICYmXG4gICAgICBoYXNNb2RpZmllcktleShldmVudCwgLi4uY3RybEtleXMpICYmXG4gICAgICBoYXNNb2RpZmllcktleShldmVudCwgJ3NoaWZ0S2V5JylcbiAgICApIHtcbiAgICAgIGNvbnN0IHRyaWdnZXIgPSB0aGlzLmxpc3RLZXlNYW5hZ2VyLmFjdGl2ZUl0ZW07XG4gICAgICBpZiAodHJpZ2dlcikge1xuICAgICAgICBjb25zdCBmcm9tID0gdGhpcy5saXN0S2V5TWFuYWdlci5hY3RpdmVJdGVtSW5kZXghO1xuICAgICAgICB0aGlzLmxpc3RLZXlNYW5hZ2VyLnNldEZpcnN0SXRlbUFjdGl2ZSgpO1xuICAgICAgICB0aGlzLnRyaWdnZXJSYW5nZShcbiAgICAgICAgICB0cmlnZ2VyLFxuICAgICAgICAgIGZyb20sXG4gICAgICAgICAgdGhpcy5saXN0S2V5TWFuYWdlci5hY3RpdmVJdGVtSW5kZXghLFxuICAgICAgICAgICF0cmlnZ2VyLmlzU2VsZWN0ZWQoKSxcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKFxuICAgICAgdGhpcy5tdWx0aXBsZSAmJlxuICAgICAga2V5Q29kZSA9PT0gRU5EICYmXG4gICAgICBoYXNNb2RpZmllcktleShldmVudCwgLi4uY3RybEtleXMpICYmXG4gICAgICBoYXNNb2RpZmllcktleShldmVudCwgJ3NoaWZ0S2V5JylcbiAgICApIHtcbiAgICAgIGNvbnN0IHRyaWdnZXIgPSB0aGlzLmxpc3RLZXlNYW5hZ2VyLmFjdGl2ZUl0ZW07XG4gICAgICBpZiAodHJpZ2dlcikge1xuICAgICAgICBjb25zdCBmcm9tID0gdGhpcy5saXN0S2V5TWFuYWdlci5hY3RpdmVJdGVtSW5kZXghO1xuICAgICAgICB0aGlzLmxpc3RLZXlNYW5hZ2VyLnNldExhc3RJdGVtQWN0aXZlKCk7XG4gICAgICAgIHRoaXMudHJpZ2dlclJhbmdlKFxuICAgICAgICAgIHRyaWdnZXIsXG4gICAgICAgICAgZnJvbSxcbiAgICAgICAgICB0aGlzLmxpc3RLZXlNYW5hZ2VyLmFjdGl2ZUl0ZW1JbmRleCEsXG4gICAgICAgICAgIXRyaWdnZXIuaXNTZWxlY3RlZCgpLFxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoa2V5Q29kZSA9PT0gU1BBQ0UgfHwga2V5Q29kZSA9PT0gRU5URVIpIHtcbiAgICAgIHRoaXMudHJpZ2dlck9wdGlvbih0aGlzLmxpc3RLZXlNYW5hZ2VyLmFjdGl2ZUl0ZW0pO1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBpc05hdktleSA9XG4gICAgICBrZXlDb2RlID09PSBVUF9BUlJPVyB8fFxuICAgICAga2V5Q29kZSA9PT0gRE9XTl9BUlJPVyB8fFxuICAgICAga2V5Q29kZSA9PT0gTEVGVF9BUlJPVyB8fFxuICAgICAga2V5Q29kZSA9PT0gUklHSFRfQVJST1cgfHxcbiAgICAgIGtleUNvZGUgPT09IEhPTUUgfHxcbiAgICAgIGtleUNvZGUgPT09IEVORDtcbiAgICB0aGlzLmxpc3RLZXlNYW5hZ2VyLm9uS2V5ZG93bihldmVudCk7XG4gICAgLy8gV2lsbCBzZWxlY3QgYW4gb3B0aW9uIGlmIHNoaWZ0IHdhcyBwcmVzc2VkIHdoaWxlIG5hdmlnYXRpbmcgdG8gdGhlIG9wdGlvblxuICAgIGlmIChpc05hdktleSAmJiBldmVudC5zaGlmdEtleSAmJiBwcmV2aW91c0FjdGl2ZUluZGV4ICE9PSB0aGlzLmxpc3RLZXlNYW5hZ2VyLmFjdGl2ZUl0ZW1JbmRleCkge1xuICAgICAgdGhpcy50cmlnZ2VyT3B0aW9uKHRoaXMubGlzdEtleU1hbmFnZXIuYWN0aXZlSXRlbSk7XG4gICAgfVxuICB9XG5cbiAgLyoqIENhbGxlZCB3aGVuIGEgZm9jdXMgbW92ZXMgaW50byB0aGUgbGlzdGJveC4gKi9cbiAgcHJvdGVjdGVkIF9oYW5kbGVGb2N1c0luKCkge1xuICAgIC8vIE5vdGUgdGhhdCB3ZSB1c2UgYSBgZm9jdXNpbmAgaGFuZGxlciBmb3IgdGhpcyBpbnN0ZWFkIG9mIHRoZSBleGlzdGluZyBgZm9jdXNgIGhhbmRsZXIsXG4gICAgLy8gYmVjYXVzZSBmb2N1cyB3b24ndCBsYW5kIG9uIHRoZSBsaXN0Ym94IGlmIGB1c2VBY3RpdmVEZXNjZW5kYW50YCBpcyBlbmFibGVkLlxuICAgIHRoaXMuX2hhc0ZvY3VzID0gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiB0aGUgZm9jdXMgbGVhdmVzIGFuIGVsZW1lbnQgaW4gdGhlIGxpc3Rib3guXG4gICAqIEBwYXJhbSBldmVudCBUaGUgZm9jdXNvdXQgZXZlbnRcbiAgICovXG4gIHByb3RlY3RlZCBfaGFuZGxlRm9jdXNPdXQoZXZlbnQ6IEZvY3VzRXZlbnQpIHtcbiAgICAvLyBTb21lIGJyb3dzZXJzIChlLmcuIENocm9tZSBhbmQgRmlyZWZveCkgdHJpZ2dlciB0aGUgZm9jdXNvdXQgZXZlbnQgd2hlbiB0aGUgdXNlciByZXR1cm5zIGJhY2sgdG8gdGhlIGRvY3VtZW50LlxuICAgIC8vIFRvIHByZXZlbnQgbG9zaW5nIHRoZSBhY3RpdmUgb3B0aW9uIGluIHRoaXMgY2FzZSwgd2Ugc3RvcmUgaXQgaW4gYF9wcmV2aW91c0FjdGl2ZU9wdGlvbmAgYW5kIHJlc3RvcmUgaXQgb24gdGhlIHdpbmRvdyBgYmx1cmAgZXZlbnRcbiAgICAvLyBUaGlzIGVuc3VyZXMgdGhhdCB0aGUgYGFjdGl2ZUl0ZW1gIG1hdGNoZXMgdGhlIGFjdHVhbCBmb2N1c2VkIGVsZW1lbnQgd2hlbiB0aGUgdXNlciByZXR1cm5zIHRvIHRoZSBkb2N1bWVudC5cbiAgICB0aGlzLl9wcmV2aW91c0FjdGl2ZU9wdGlvbiA9IHRoaXMubGlzdEtleU1hbmFnZXIuYWN0aXZlSXRlbTtcblxuICAgIGNvbnN0IG90aGVyRWxlbWVudCA9IGV2ZW50LnJlbGF0ZWRUYXJnZXQgYXMgRWxlbWVudDtcbiAgICBpZiAodGhpcy5lbGVtZW50ICE9PSBvdGhlckVsZW1lbnQgJiYgIXRoaXMuZWxlbWVudC5jb250YWlucyhvdGhlckVsZW1lbnQpKSB7XG4gICAgICB0aGlzLl9vblRvdWNoZWQoKTtcbiAgICAgIHRoaXMuX2hhc0ZvY3VzID0gZmFsc2U7XG4gICAgICB0aGlzLl9zZXROZXh0Rm9jdXNUb1NlbGVjdGVkT3B0aW9uKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEdldCB0aGUgaWQgb2YgdGhlIGFjdGl2ZSBvcHRpb24gaWYgYWN0aXZlIGRlc2NlbmRhbnQgaXMgYmVpbmcgdXNlZC4gKi9cbiAgcHJvdGVjdGVkIF9nZXRBcmlhQWN0aXZlRGVzY2VuZGFudCgpOiBzdHJpbmcgfCBudWxsIHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdGhpcy51c2VBY3RpdmVEZXNjZW5kYW50ID8gdGhpcy5saXN0S2V5TWFuYWdlcj8uYWN0aXZlSXRlbT8uaWQgOiBudWxsO1xuICB9XG5cbiAgLyoqIEdldCB0aGUgdGFiaW5kZXggZm9yIHRoZSBsaXN0Ym94LiAqL1xuICBwcm90ZWN0ZWQgX2dldFRhYkluZGV4KCkge1xuICAgIGlmICh0aGlzLmRpc2FibGVkKSB7XG4gICAgICByZXR1cm4gLTE7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnVzZUFjdGl2ZURlc2NlbmRhbnQgfHwgIXRoaXMubGlzdEtleU1hbmFnZXIuYWN0aXZlSXRlbSA/IHRoaXMuZW5hYmxlZFRhYkluZGV4IDogLTE7XG4gIH1cblxuICAvKiogSW5pdGlhbGl6ZSB0aGUga2V5IG1hbmFnZXIuICovXG4gIHByaXZhdGUgX2luaXRLZXlNYW5hZ2VyKCkge1xuICAgIHRoaXMubGlzdEtleU1hbmFnZXIgPSBuZXcgQWN0aXZlRGVzY2VuZGFudEtleU1hbmFnZXIodGhpcy5vcHRpb25zKVxuICAgICAgLndpdGhXcmFwKCF0aGlzLl9uYXZpZ2F0aW9uV3JhcERpc2FibGVkKVxuICAgICAgLndpdGhUeXBlQWhlYWQoKVxuICAgICAgLndpdGhIb21lQW5kRW5kKClcbiAgICAgIC53aXRoQWxsb3dlZE1vZGlmaWVyS2V5cyhbJ3NoaWZ0S2V5J10pXG4gICAgICAuc2tpcFByZWRpY2F0ZShcbiAgICAgICAgdGhpcy5fbmF2aWdhdGVEaXNhYmxlZE9wdGlvbnMgPyB0aGlzLl9za2lwTm9uZVByZWRpY2F0ZSA6IHRoaXMuX3NraXBEaXNhYmxlZFByZWRpY2F0ZSxcbiAgICAgICk7XG5cbiAgICBpZiAodGhpcy5vcmllbnRhdGlvbiA9PT0gJ3ZlcnRpY2FsJykge1xuICAgICAgdGhpcy5saXN0S2V5TWFuYWdlci53aXRoVmVydGljYWxPcmllbnRhdGlvbigpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmxpc3RLZXlNYW5hZ2VyLndpdGhIb3Jpem9udGFsT3JpZW50YXRpb24odGhpcy5fZGlyPy52YWx1ZSB8fCAnbHRyJyk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuc2VsZWN0aW9uTW9kZWwuc2VsZWN0ZWQubGVuZ3RoKSB7XG4gICAgICBQcm9taXNlLnJlc29sdmUoKS50aGVuKCgpID0+IHRoaXMuX3NldE5leHRGb2N1c1RvU2VsZWN0ZWRPcHRpb24oKSk7XG4gICAgfVxuXG4gICAgdGhpcy5saXN0S2V5TWFuYWdlci5jaGFuZ2Uuc3Vic2NyaWJlKCgpID0+IHRoaXMuX2ZvY3VzQWN0aXZlT3B0aW9uKCkpO1xuXG4gICAgdGhpcy5vcHRpb25zLmNoYW5nZXMucGlwZSh0YWtlVW50aWwodGhpcy5kZXN0cm95ZWQpKS5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgY29uc3QgYWN0aXZlT3B0aW9uID0gdGhpcy5saXN0S2V5TWFuYWdlci5hY3RpdmVJdGVtO1xuXG4gICAgICAvLyBJZiB0aGUgYWN0aXZlIG9wdGlvbiB3YXMgZGVsZXRlZCwgd2UgbmVlZCB0byByZXNldFxuICAgICAgLy8gdGhlIGtleSBtYW5hZ2VyIHNvIGl0IGNhbiBhbGxvdyBmb2N1cyBiYWNrIGluLlxuICAgICAgaWYgKGFjdGl2ZU9wdGlvbiAmJiAhdGhpcy5vcHRpb25zLmZpbmQob3B0aW9uID0+IG9wdGlvbiA9PT0gYWN0aXZlT3B0aW9uKSkge1xuICAgICAgICB0aGlzLmxpc3RLZXlNYW5hZ2VyLnNldEFjdGl2ZUl0ZW0oLTEpO1xuICAgICAgICB0aGlzLmNoYW5nZURldGVjdG9yUmVmLm1hcmtGb3JDaGVjaygpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqIEZvY3VzIHRoZSBhY3RpdmUgb3B0aW9uLiAqL1xuICBwcml2YXRlIF9mb2N1c0FjdGl2ZU9wdGlvbigpIHtcbiAgICBpZiAoIXRoaXMudXNlQWN0aXZlRGVzY2VuZGFudCkge1xuICAgICAgdGhpcy5saXN0S2V5TWFuYWdlci5hY3RpdmVJdGVtPy5mb2N1cygpO1xuICAgIH1cbiAgICB0aGlzLmNoYW5nZURldGVjdG9yUmVmLm1hcmtGb3JDaGVjaygpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCB0aGUgc2VsZWN0ZWQgdmFsdWVzLlxuICAgKiBAcGFyYW0gdmFsdWUgVGhlIGxpc3Qgb2YgbmV3IHNlbGVjdGVkIHZhbHVlcy5cbiAgICovXG4gIHByaXZhdGUgX3NldFNlbGVjdGlvbih2YWx1ZTogcmVhZG9ubHkgVFtdKSB7XG4gICAgaWYgKHRoaXMuX2ludmFsaWQpIHtcbiAgICAgIHRoaXMuc2VsZWN0aW9uTW9kZWwuY2xlYXIoZmFsc2UpO1xuICAgIH1cbiAgICB0aGlzLnNlbGVjdGlvbk1vZGVsLnNldFNlbGVjdGlvbiguLi50aGlzLl9jb2VyY2VWYWx1ZSh2YWx1ZSkpO1xuXG4gICAgaWYgKCF0aGlzLl9oYXNGb2N1cykge1xuICAgICAgdGhpcy5fc2V0TmV4dEZvY3VzVG9TZWxlY3RlZE9wdGlvbigpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBTZXRzIHRoZSBmaXJzdCBzZWxlY3RlZCBvcHRpb24gYXMgZmlyc3QgaW4gdGhlIGtleWJvYXJkIGZvY3VzIG9yZGVyLiAqL1xuICBwcml2YXRlIF9zZXROZXh0Rm9jdXNUb1NlbGVjdGVkT3B0aW9uKCkge1xuICAgIC8vIE51bGwgY2hlY2sgdGhlIG9wdGlvbnMgc2luY2UgdGhleSBvbmx5IGdldCBkZWZpbmVkIGFmdGVyIGBuZ0FmdGVyQ29udGVudEluaXRgLlxuICAgIGNvbnN0IHNlbGVjdGVkID0gdGhpcy5vcHRpb25zPy5maW5kKG9wdGlvbiA9PiBvcHRpb24uaXNTZWxlY3RlZCgpKTtcblxuICAgIGlmIChzZWxlY3RlZCkge1xuICAgICAgdGhpcy5saXN0S2V5TWFuYWdlci51cGRhdGVBY3RpdmVJdGVtKHNlbGVjdGVkKTtcbiAgICB9XG4gIH1cblxuICAvKiogVXBkYXRlIHRoZSBpbnRlcm5hbCB2YWx1ZSBvZiB0aGUgbGlzdGJveCBiYXNlZCBvbiB0aGUgc2VsZWN0aW9uIG1vZGVsLiAqL1xuICBwcml2YXRlIF91cGRhdGVJbnRlcm5hbFZhbHVlKCkge1xuICAgIGNvbnN0IGluZGV4Q2FjaGUgPSBuZXcgTWFwPFQsIG51bWJlcj4oKTtcbiAgICB0aGlzLnNlbGVjdGlvbk1vZGVsLnNvcnQoKGE6IFQsIGI6IFQpID0+IHtcbiAgICAgIGNvbnN0IGFJbmRleCA9IHRoaXMuX2dldEluZGV4Rm9yVmFsdWUoaW5kZXhDYWNoZSwgYSk7XG4gICAgICBjb25zdCBiSW5kZXggPSB0aGlzLl9nZXRJbmRleEZvclZhbHVlKGluZGV4Q2FjaGUsIGIpO1xuICAgICAgcmV0dXJuIGFJbmRleCAtIGJJbmRleDtcbiAgICB9KTtcbiAgICBjb25zdCBzZWxlY3RlZCA9IHRoaXMuc2VsZWN0aW9uTW9kZWwuc2VsZWN0ZWQ7XG4gICAgdGhpcy5faW52YWxpZCA9XG4gICAgICAoIXRoaXMubXVsdGlwbGUgJiYgc2VsZWN0ZWQubGVuZ3RoID4gMSkgfHwgISF0aGlzLl9nZXRJbnZhbGlkT3B0aW9uVmFsdWVzKHNlbGVjdGVkKS5sZW5ndGg7XG4gICAgdGhpcy5jaGFuZ2VEZXRlY3RvclJlZi5tYXJrRm9yQ2hlY2soKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBpbmRleCBvZiB0aGUgZ2l2ZW4gdmFsdWUgaW4gdGhlIGdpdmVuIGxpc3Qgb2Ygb3B0aW9ucy5cbiAgICogQHBhcmFtIGNhY2hlIFRoZSBjYWNoZSBvZiBpbmRpY2VzIGZvdW5kIHNvIGZhclxuICAgKiBAcGFyYW0gdmFsdWUgVGhlIHZhbHVlIHRvIGZpbmRcbiAgICogQHJldHVybiBUaGUgaW5kZXggb2YgdGhlIHZhbHVlIGluIHRoZSBvcHRpb25zIGxpc3RcbiAgICovXG4gIHByaXZhdGUgX2dldEluZGV4Rm9yVmFsdWUoY2FjaGU6IE1hcDxULCBudW1iZXI+LCB2YWx1ZTogVCkge1xuICAgIGNvbnN0IGlzRXF1YWwgPSB0aGlzLmNvbXBhcmVXaXRoIHx8IE9iamVjdC5pcztcbiAgICBpZiAoIWNhY2hlLmhhcyh2YWx1ZSkpIHtcbiAgICAgIGxldCBpbmRleCA9IC0xO1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLm9wdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGlzRXF1YWwodmFsdWUsIHRoaXMub3B0aW9ucy5nZXQoaSkhLnZhbHVlKSkge1xuICAgICAgICAgIGluZGV4ID0gaTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgY2FjaGUuc2V0KHZhbHVlLCBpbmRleCk7XG4gICAgfVxuICAgIHJldHVybiBjYWNoZS5nZXQodmFsdWUpITtcbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGUgdGhlIHVzZXIgY2xpY2tpbmcgYW4gb3B0aW9uLlxuICAgKiBAcGFyYW0gb3B0aW9uIFRoZSBvcHRpb24gdGhhdCB3YXMgY2xpY2tlZC5cbiAgICovXG4gIHByaXZhdGUgX2hhbmRsZU9wdGlvbkNsaWNrZWQob3B0aW9uOiBDZGtPcHRpb248VD4sIGV2ZW50OiBNb3VzZUV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICB0aGlzLmxpc3RLZXlNYW5hZ2VyLnNldEFjdGl2ZUl0ZW0ob3B0aW9uKTtcbiAgICBpZiAoZXZlbnQuc2hpZnRLZXkgJiYgdGhpcy5tdWx0aXBsZSkge1xuICAgICAgdGhpcy50cmlnZ2VyUmFuZ2UoXG4gICAgICAgIG9wdGlvbixcbiAgICAgICAgdGhpcy5fZ2V0TGFzdFRyaWdnZXJlZEluZGV4KCkgPz8gdGhpcy5saXN0S2V5TWFuYWdlci5hY3RpdmVJdGVtSW5kZXghLFxuICAgICAgICB0aGlzLmxpc3RLZXlNYW5hZ2VyLmFjdGl2ZUl0ZW1JbmRleCEsXG4gICAgICAgICFvcHRpb24uaXNTZWxlY3RlZCgpLFxuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy50cmlnZ2VyT3B0aW9uKG9wdGlvbik7XG4gICAgfVxuICB9XG5cbiAgLyoqIFZlcmlmaWVzIHRoYXQgbm8gdHdvIG9wdGlvbnMgcmVwcmVzZW50IHRoZSBzYW1lIHZhbHVlIHVuZGVyIHRoZSBjb21wYXJlV2l0aCBmdW5jdGlvbi4gKi9cbiAgcHJpdmF0ZSBfdmVyaWZ5Tm9PcHRpb25WYWx1ZUNvbGxpc2lvbnMoKSB7XG4gICAgdGhpcy5vcHRpb25zLmNoYW5nZXMucGlwZShzdGFydFdpdGgodGhpcy5vcHRpb25zKSwgdGFrZVVudGlsKHRoaXMuZGVzdHJveWVkKSkuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgIGNvbnN0IGlzRXF1YWwgPSB0aGlzLmNvbXBhcmVXaXRoID8/IE9iamVjdC5pcztcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5vcHRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IG9wdGlvbiA9IHRoaXMub3B0aW9ucy5nZXQoaSkhO1xuICAgICAgICBsZXQgZHVwbGljYXRlOiBDZGtPcHRpb248VD4gfCBudWxsID0gbnVsbDtcbiAgICAgICAgZm9yIChsZXQgaiA9IGkgKyAxOyBqIDwgdGhpcy5vcHRpb25zLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgY29uc3Qgb3RoZXIgPSB0aGlzLm9wdGlvbnMuZ2V0KGopITtcbiAgICAgICAgICBpZiAoaXNFcXVhbChvcHRpb24udmFsdWUsIG90aGVyLnZhbHVlKSkge1xuICAgICAgICAgICAgZHVwbGljYXRlID0gb3RoZXI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGR1cGxpY2F0ZSkge1xuICAgICAgICAgIC8vIFRPRE8obW1hbGVyYmEpOiBMaW5rIHRvIGRvY3MgYWJvdXQgdGhpcy5cbiAgICAgICAgICBpZiAodGhpcy5jb21wYXJlV2l0aCkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAgICAgICBgRm91bmQgbXVsdGlwbGUgQ2RrT3B0aW9uIHJlcHJlc2VudGluZyB0aGUgc2FtZSB2YWx1ZSB1bmRlciB0aGUgZ2l2ZW4gY29tcGFyZVdpdGggZnVuY3Rpb25gLFxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgb3B0aW9uMTogb3B0aW9uLmVsZW1lbnQsXG4gICAgICAgICAgICAgICAgb3B0aW9uMjogZHVwbGljYXRlLmVsZW1lbnQsXG4gICAgICAgICAgICAgICAgY29tcGFyZVdpdGg6IHRoaXMuY29tcGFyZVdpdGgsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYEZvdW5kIG11bHRpcGxlIENka09wdGlvbiB3aXRoIHRoZSBzYW1lIHZhbHVlYCwge1xuICAgICAgICAgICAgICBvcHRpb24xOiBvcHRpb24uZWxlbWVudCxcbiAgICAgICAgICAgICAgb3B0aW9uMjogZHVwbGljYXRlLmVsZW1lbnQsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKiogVmVyaWZpZXMgdGhhdCB0aGUgb3B0aW9uIHZhbHVlcyBhcmUgdmFsaWQuICovXG4gIHByaXZhdGUgX3ZlcmlmeU9wdGlvblZhbHVlcygpIHtcbiAgICBpZiAodGhpcy5vcHRpb25zICYmICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpKSB7XG4gICAgICBjb25zdCBzZWxlY3RlZCA9IHRoaXMuc2VsZWN0aW9uTW9kZWwuc2VsZWN0ZWQ7XG4gICAgICBjb25zdCBpbnZhbGlkVmFsdWVzID0gdGhpcy5fZ2V0SW52YWxpZE9wdGlvblZhbHVlcyhzZWxlY3RlZCk7XG5cbiAgICAgIGlmICghdGhpcy5tdWx0aXBsZSAmJiBzZWxlY3RlZC5sZW5ndGggPiAxKSB7XG4gICAgICAgIHRocm93IEVycm9yKCdMaXN0Ym94IGNhbm5vdCBoYXZlIG1vcmUgdGhhbiBvbmUgc2VsZWN0ZWQgdmFsdWUgaW4gbXVsdGktc2VsZWN0aW9uIG1vZGUuJyk7XG4gICAgICB9XG5cbiAgICAgIGlmIChpbnZhbGlkVmFsdWVzLmxlbmd0aCkge1xuICAgICAgICB0aHJvdyBFcnJvcignTGlzdGJveCBoYXMgc2VsZWN0ZWQgdmFsdWVzIHRoYXQgZG8gbm90IG1hdGNoIGFueSBvZiBpdHMgb3B0aW9ucy4nKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ29lcmNlcyBhIHZhbHVlIGludG8gYW4gYXJyYXkgcmVwcmVzZW50aW5nIGEgbGlzdGJveCBzZWxlY3Rpb24uXG4gICAqIEBwYXJhbSB2YWx1ZSBUaGUgdmFsdWUgdG8gY29lcmNlXG4gICAqIEByZXR1cm4gQW4gYXJyYXlcbiAgICovXG4gIHByaXZhdGUgX2NvZXJjZVZhbHVlKHZhbHVlOiByZWFkb25seSBUW10pIHtcbiAgICByZXR1cm4gdmFsdWUgPT0gbnVsbCA/IFtdIDogY29lcmNlQXJyYXkodmFsdWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgc3VibGlzdCBvZiB2YWx1ZXMgdGhhdCBkbyBub3QgcmVwcmVzZW50IHZhbGlkIG9wdGlvbiB2YWx1ZXMgaW4gdGhpcyBsaXN0Ym94LlxuICAgKiBAcGFyYW0gdmFsdWVzIFRoZSBsaXN0IG9mIHZhbHVlc1xuICAgKiBAcmV0dXJuIFRoZSBzdWJsaXN0IG9mIHZhbHVlcyB0aGF0IGFyZSBub3QgdmFsaWQgb3B0aW9uIHZhbHVlc1xuICAgKi9cbiAgcHJpdmF0ZSBfZ2V0SW52YWxpZE9wdGlvblZhbHVlcyh2YWx1ZXM6IHJlYWRvbmx5IFRbXSkge1xuICAgIGNvbnN0IGlzRXF1YWwgPSB0aGlzLmNvbXBhcmVXaXRoIHx8IE9iamVjdC5pcztcbiAgICBjb25zdCB2YWxpZFZhbHVlcyA9ICh0aGlzLm9wdGlvbnMgfHwgW10pLm1hcChvcHRpb24gPT4gb3B0aW9uLnZhbHVlKTtcbiAgICByZXR1cm4gdmFsdWVzLmZpbHRlcih2YWx1ZSA9PiAhdmFsaWRWYWx1ZXMuc29tZSh2YWxpZFZhbHVlID0+IGlzRXF1YWwodmFsdWUsIHZhbGlkVmFsdWUpKSk7XG4gIH1cblxuICAvKiogR2V0IHRoZSBpbmRleCBvZiB0aGUgbGFzdCB0cmlnZ2VyZWQgb3B0aW9uLiAqL1xuICBwcml2YXRlIF9nZXRMYXN0VHJpZ2dlcmVkSW5kZXgoKSB7XG4gICAgY29uc3QgaW5kZXggPSB0aGlzLm9wdGlvbnMudG9BcnJheSgpLmluZGV4T2YodGhpcy5fbGFzdFRyaWdnZXJlZCEpO1xuICAgIHJldHVybiBpbmRleCA9PT0gLTEgPyBudWxsIDogaW5kZXg7XG4gIH1cblxuICAvKipcbiAgICogU2V0IHByZXZpb3VzIGFjdGl2ZSBvcHRpb24gYXMgYWN0aXZlIG9wdGlvbiBvbiB3aW5kb3cgYmx1ci5cbiAgICogVGhpcyBlbnN1cmVzIHRoYXQgdGhlIGBhY3RpdmVPcHRpb25gIG1hdGNoZXMgdGhlIGFjdHVhbCBmb2N1c2VkIGVsZW1lbnQgd2hlbiB0aGUgdXNlciByZXR1cm5zIHRvIHRoZSBkb2N1bWVudC5cbiAgICovXG4gIHByaXZhdGUgX3NldFByZXZpb3VzQWN0aXZlT3B0aW9uQXNBY3RpdmVPcHRpb25PbldpbmRvd0JsdXIoKSB7XG4gICAgdGhpcy5uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgZnJvbUV2ZW50KHdpbmRvdywgJ2JsdXInKVxuICAgICAgICAucGlwZSh0YWtlVW50aWwodGhpcy5kZXN0cm95ZWQpKVxuICAgICAgICAuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgICAgICBpZiAodGhpcy5lbGVtZW50LmNvbnRhaW5zKGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQpICYmIHRoaXMuX3ByZXZpb3VzQWN0aXZlT3B0aW9uKSB7XG4gICAgICAgICAgICB0aGlzLl9zZXRBY3RpdmVPcHRpb24odGhpcy5fcHJldmlvdXNBY3RpdmVPcHRpb24pO1xuICAgICAgICAgICAgdGhpcy5fcHJldmlvdXNBY3RpdmVPcHRpb24gPSBudWxsO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSk7XG4gIH1cbn1cblxuLyoqIENoYW5nZSBldmVudCB0aGF0IGlzIGZpcmVkIHdoZW5ldmVyIHRoZSB2YWx1ZSBvZiB0aGUgbGlzdGJveCBjaGFuZ2VzLiAqL1xuZXhwb3J0IGludGVyZmFjZSBMaXN0Ym94VmFsdWVDaGFuZ2VFdmVudDxUPiB7XG4gIC8qKiBUaGUgbmV3IHZhbHVlIG9mIHRoZSBsaXN0Ym94LiAqL1xuICByZWFkb25seSB2YWx1ZTogcmVhZG9ubHkgVFtdO1xuXG4gIC8qKiBSZWZlcmVuY2UgdG8gdGhlIGxpc3Rib3ggdGhhdCBlbWl0dGVkIHRoZSBldmVudC4gKi9cbiAgcmVhZG9ubHkgbGlzdGJveDogQ2RrTGlzdGJveDxUPjtcblxuICAvKiogUmVmZXJlbmNlIHRvIHRoZSBvcHRpb24gdGhhdCB3YXMgdHJpZ2dlcmVkLiAqL1xuICByZWFkb25seSBvcHRpb246IENka09wdGlvbjxUPiB8IG51bGw7XG59XG4iXX0=