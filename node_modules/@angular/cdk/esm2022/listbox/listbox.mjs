/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ActiveDescendantKeyManager } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { coerceArray } from '@angular/cdk/coercion';
import { SelectionModel } from '@angular/cdk/collections';
import { A, DOWN_ARROW, END, ENTER, hasModifierKey, HOME, LEFT_ARROW, RIGHT_ARROW, SPACE, UP_ARROW, } from '@angular/cdk/keycodes';
import { Platform } from '@angular/cdk/platform';
import { booleanAttribute, ChangeDetectorRef, ContentChildren, Directive, ElementRef, forwardRef, inject, Input, NgZone, Output, QueryList, } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { defer, fromEvent, merge, Subject } from 'rxjs';
import { filter, map, startWith, switchMap, takeUntil } from 'rxjs/operators';
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
    setActiveStyles() {
        // If the listbox is using `aria-activedescendant` the option won't have focus so the
        // browser won't scroll them into view automatically so we need to do it ourselves.
        if (this.listbox.useActiveDescendant) {
            this.element.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        }
    }
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkOption, deps: [], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "16.1.0", version: "18.2.0-next.2", type: CdkOption, isStandalone: true, selector: "[cdkOption]", inputs: { id: "id", value: ["cdkOption", "value"], typeaheadLabel: ["cdkOptionTypeaheadLabel", "typeaheadLabel"], disabled: ["cdkOptionDisabled", "disabled", booleanAttribute], enabledTabIndex: ["tabindex", "enabledTabIndex"] }, host: { attributes: { "role": "option" }, listeners: { "click": "_clicked.next($event)", "focus": "_handleFocus()" }, properties: { "id": "id", "attr.aria-selected": "isSelected()", "attr.tabindex": "_getTabIndex()", "attr.aria-disabled": "disabled", "class.cdk-option-active": "isActive()" }, classAttribute: "cdk-option" }, exportAs: ["cdkOption"], ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkOption, decorators: [{
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
        this.changeDetectorRef.markForCheck();
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkListbox, deps: [], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "16.1.0", version: "18.2.0-next.2", type: CdkListbox, isStandalone: true, selector: "[cdkListbox]", inputs: { id: "id", enabledTabIndex: ["tabindex", "enabledTabIndex"], value: ["cdkListboxValue", "value"], multiple: ["cdkListboxMultiple", "multiple", booleanAttribute], disabled: ["cdkListboxDisabled", "disabled", booleanAttribute], useActiveDescendant: ["cdkListboxUseActiveDescendant", "useActiveDescendant", booleanAttribute], orientation: ["cdkListboxOrientation", "orientation"], compareWith: ["cdkListboxCompareWith", "compareWith"], navigationWrapDisabled: ["cdkListboxNavigationWrapDisabled", "navigationWrapDisabled", booleanAttribute], navigateDisabledOptions: ["cdkListboxNavigatesDisabledOptions", "navigateDisabledOptions", booleanAttribute] }, outputs: { valueChange: "cdkListboxValueChange" }, host: { attributes: { "role": "listbox" }, listeners: { "focus": "_handleFocus()", "keydown": "_handleKeydown($event)", "focusout": "_handleFocusOut($event)", "focusin": "_handleFocusIn()" }, properties: { "id": "id", "attr.tabindex": "_getTabIndex()", "attr.aria-disabled": "disabled", "attr.aria-multiselectable": "multiple", "attr.aria-activedescendant": "_getAriaActiveDescendant()", "attr.aria-orientation": "orientation" }, classAttribute: "cdk-listbox" }, providers: [
            {
                provide: NG_VALUE_ACCESSOR,
                useExisting: forwardRef(() => CdkListbox),
                multi: true,
            },
        ], queries: [{ propertyName: "options", predicate: CdkOption, descendants: true }], exportAs: ["cdkListbox"], ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkListbox, decorators: [{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdGJveC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvbGlzdGJveC9saXN0Ym94LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQywwQkFBMEIsRUFBc0MsTUFBTSxtQkFBbUIsQ0FBQztBQUNsRyxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDakQsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQ2xELE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSwwQkFBMEIsQ0FBQztBQUN4RCxPQUFPLEVBQ0wsQ0FBQyxFQUNELFVBQVUsRUFDVixHQUFHLEVBQ0gsS0FBSyxFQUNMLGNBQWMsRUFDZCxJQUFJLEVBQ0osVUFBVSxFQUNWLFdBQVcsRUFDWCxLQUFLLEVBQ0wsUUFBUSxHQUNULE1BQU0sdUJBQXVCLENBQUM7QUFDL0IsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQy9DLE9BQU8sRUFFTCxnQkFBZ0IsRUFDaEIsaUJBQWlCLEVBQ2pCLGVBQWUsRUFDZixTQUFTLEVBQ1QsVUFBVSxFQUNWLFVBQVUsRUFDVixNQUFNLEVBQ04sS0FBSyxFQUNMLE1BQU0sRUFFTixNQUFNLEVBQ04sU0FBUyxHQUNWLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBdUIsaUJBQWlCLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUN2RSxPQUFPLEVBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQWMsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQ2xFLE9BQU8sRUFBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7O0FBRTVFLHNEQUFzRDtBQUN0RCxJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUM7QUFFZjs7Ozs7OztH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QUFLLEVBQUUsb0JBQW9CLEVBQUUsU0FBUyxFQUFFLGdCQUFnQixFQUFDO2dCQWNqRSxRQUFRO3NCQURQLEtBQUs7dUJBQUMsRUFBQyxLQUFLLEVBQUUsb0JBQW9CLEVBQUUsU0FBUyxFQUFFLGdCQUFnQixFQUFDO2dCQUtqRSxtQkFBbUI7c0JBRGxCLEtBQUs7dUJBQUMsRUFBQyxLQUFLLEVBQUUsK0JBQStCLEVBQUUsU0FBUyxFQUFFLGdCQUFnQixFQUFDO2dCQUt4RSxXQUFXO3NCQURkLEtBQUs7dUJBQUMsdUJBQXVCO2dCQWdCMUIsV0FBVztzQkFEZCxLQUFLO3VCQUFDLHVCQUF1QjtnQkFhMUIsc0JBQXNCO3NCQUR6QixLQUFLO3VCQUFDLEVBQUMsS0FBSyxFQUFFLGtDQUFrQyxFQUFFLFNBQVMsRUFBRSxnQkFBZ0IsRUFBQztnQkFZM0UsdUJBQXVCO3NCQUQxQixLQUFLO3VCQUFDLEVBQUMsS0FBSyxFQUFFLG9DQUFvQyxFQUFFLFNBQVMsRUFBRSxnQkFBZ0IsRUFBQztnQkFhdkMsV0FBVztzQkFBcEQsTUFBTTt1QkFBQyx1QkFBdUI7Z0JBRzRCLE9BQU87c0JBQWpFLGVBQWU7dUJBQUMsU0FBUyxFQUFFLEVBQUMsV0FBVyxFQUFFLElBQUksRUFBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0FjdGl2ZURlc2NlbmRhbnRLZXlNYW5hZ2VyLCBIaWdobGlnaHRhYmxlLCBMaXN0S2V5TWFuYWdlck9wdGlvbn0gZnJvbSAnQGFuZ3VsYXIvY2RrL2ExMXknO1xuaW1wb3J0IHtEaXJlY3Rpb25hbGl0eX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2JpZGknO1xuaW1wb3J0IHtjb2VyY2VBcnJheX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvZXJjaW9uJztcbmltcG9ydCB7U2VsZWN0aW9uTW9kZWx9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2xsZWN0aW9ucyc7XG5pbXBvcnQge1xuICBBLFxuICBET1dOX0FSUk9XLFxuICBFTkQsXG4gIEVOVEVSLFxuICBoYXNNb2RpZmllcktleSxcbiAgSE9NRSxcbiAgTEVGVF9BUlJPVyxcbiAgUklHSFRfQVJST1csXG4gIFNQQUNFLFxuICBVUF9BUlJPVyxcbn0gZnJvbSAnQGFuZ3VsYXIvY2RrL2tleWNvZGVzJztcbmltcG9ydCB7UGxhdGZvcm19IGZyb20gJ0Bhbmd1bGFyL2Nkay9wbGF0Zm9ybSc7XG5pbXBvcnQge1xuICBBZnRlckNvbnRlbnRJbml0LFxuICBib29sZWFuQXR0cmlidXRlLFxuICBDaGFuZ2VEZXRlY3RvclJlZixcbiAgQ29udGVudENoaWxkcmVuLFxuICBEaXJlY3RpdmUsXG4gIEVsZW1lbnRSZWYsXG4gIGZvcndhcmRSZWYsXG4gIGluamVjdCxcbiAgSW5wdXQsXG4gIE5nWm9uZSxcbiAgT25EZXN0cm95LFxuICBPdXRwdXQsXG4gIFF1ZXJ5TGlzdCxcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0NvbnRyb2xWYWx1ZUFjY2Vzc29yLCBOR19WQUxVRV9BQ0NFU1NPUn0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xuaW1wb3J0IHtkZWZlciwgZnJvbUV2ZW50LCBtZXJnZSwgT2JzZXJ2YWJsZSwgU3ViamVjdH0gZnJvbSAncnhqcyc7XG5pbXBvcnQge2ZpbHRlciwgbWFwLCBzdGFydFdpdGgsIHN3aXRjaE1hcCwgdGFrZVVudGlsfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbi8qKiBUaGUgbmV4dCBpZCB0byB1c2UgZm9yIGNyZWF0aW5nIHVuaXF1ZSBET00gSURzLiAqL1xubGV0IG5leHRJZCA9IDA7XG5cbi8qKlxuICogQW4gaW1wbGVtZW50YXRpb24gb2YgU2VsZWN0aW9uTW9kZWwgdGhhdCBpbnRlcm5hbGx5IGFsd2F5cyByZXByZXNlbnRzIHRoZSBzZWxlY3Rpb24gYXMgYVxuICogbXVsdGktc2VsZWN0aW9uLiBUaGlzIGlzIG5lY2Vzc2FyeSBzbyB0aGF0IHdlIGNhbiByZWNvdmVyIHRoZSBmdWxsIHNlbGVjdGlvbiBpZiB0aGUgdXNlclxuICogc3dpdGNoZXMgdGhlIGxpc3Rib3ggZnJvbSBzaW5nbGUtc2VsZWN0aW9uIHRvIG11bHRpLXNlbGVjdGlvbiBhZnRlciBpbml0aWFsaXphdGlvbi5cbiAqXG4gKiBUaGlzIHNlbGVjdGlvbiBtb2RlbCBtYXkgcmVwb3J0IG11bHRpcGxlIHNlbGVjdGVkIHZhbHVlcywgZXZlbiBpZiBpdCBpcyBpbiBzaW5nbGUtc2VsZWN0aW9uXG4gKiBtb2RlLiBJdCBpcyB1cCB0byB0aGUgdXNlciAoQ2RrTGlzdGJveCkgdG8gY2hlY2sgZm9yIGludmFsaWQgc2VsZWN0aW9ucy5cbiAqL1xuY2xhc3MgTGlzdGJveFNlbGVjdGlvbk1vZGVsPFQ+IGV4dGVuZHMgU2VsZWN0aW9uTW9kZWw8VD4ge1xuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgbXVsdGlwbGUgPSBmYWxzZSxcbiAgICBpbml0aWFsbHlTZWxlY3RlZFZhbHVlcz86IFRbXSxcbiAgICBlbWl0Q2hhbmdlcyA9IHRydWUsXG4gICAgY29tcGFyZVdpdGg/OiAobzE6IFQsIG8yOiBUKSA9PiBib29sZWFuLFxuICApIHtcbiAgICBzdXBlcih0cnVlLCBpbml0aWFsbHlTZWxlY3RlZFZhbHVlcywgZW1pdENoYW5nZXMsIGNvbXBhcmVXaXRoKTtcbiAgfVxuXG4gIG92ZXJyaWRlIGlzTXVsdGlwbGVTZWxlY3Rpb24oKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMubXVsdGlwbGU7XG4gIH1cblxuICBvdmVycmlkZSBzZWxlY3QoLi4udmFsdWVzOiBUW10pIHtcbiAgICAvLyBUaGUgc3VwZXIgY2xhc3MgaXMgYWx3YXlzIGluIG11bHRpLXNlbGVjdGlvbiBtb2RlLCBzbyB3ZSBuZWVkIHRvIG92ZXJyaWRlIHRoZSBiZWhhdmlvciBpZlxuICAgIC8vIHRoaXMgc2VsZWN0aW9uIG1vZGVsIGFjdHVhbGx5IGJlbG9uZ3MgdG8gYSBzaW5nbGUtc2VsZWN0aW9uIGxpc3Rib3guXG4gICAgaWYgKHRoaXMubXVsdGlwbGUpIHtcbiAgICAgIHJldHVybiBzdXBlci5zZWxlY3QoLi4udmFsdWVzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHN1cGVyLnNldFNlbGVjdGlvbiguLi52YWx1ZXMpO1xuICAgIH1cbiAgfVxufVxuXG4vKiogQSBzZWxlY3RhYmxlIG9wdGlvbiBpbiBhIGxpc3Rib3guICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbY2RrT3B0aW9uXScsXG4gIHN0YW5kYWxvbmU6IHRydWUsXG4gIGV4cG9ydEFzOiAnY2RrT3B0aW9uJyxcbiAgaG9zdDoge1xuICAgICdyb2xlJzogJ29wdGlvbicsXG4gICAgJ2NsYXNzJzogJ2Nkay1vcHRpb24nLFxuICAgICdbaWRdJzogJ2lkJyxcbiAgICAnW2F0dHIuYXJpYS1zZWxlY3RlZF0nOiAnaXNTZWxlY3RlZCgpJyxcbiAgICAnW2F0dHIudGFiaW5kZXhdJzogJ19nZXRUYWJJbmRleCgpJyxcbiAgICAnW2F0dHIuYXJpYS1kaXNhYmxlZF0nOiAnZGlzYWJsZWQnLFxuICAgICdbY2xhc3MuY2RrLW9wdGlvbi1hY3RpdmVdJzogJ2lzQWN0aXZlKCknLFxuICAgICcoY2xpY2spJzogJ19jbGlja2VkLm5leHQoJGV2ZW50KScsXG4gICAgJyhmb2N1cyknOiAnX2hhbmRsZUZvY3VzKCknLFxuICB9LFxufSlcbmV4cG9ydCBjbGFzcyBDZGtPcHRpb248VCA9IHVua25vd24+IGltcGxlbWVudHMgTGlzdEtleU1hbmFnZXJPcHRpb24sIEhpZ2hsaWdodGFibGUsIE9uRGVzdHJveSB7XG4gIC8qKiBUaGUgaWQgb2YgdGhlIG9wdGlvbidzIGhvc3QgZWxlbWVudC4gKi9cbiAgQElucHV0KClcbiAgZ2V0IGlkKCkge1xuICAgIHJldHVybiB0aGlzLl9pZCB8fCB0aGlzLl9nZW5lcmF0ZWRJZDtcbiAgfVxuICBzZXQgaWQodmFsdWUpIHtcbiAgICB0aGlzLl9pZCA9IHZhbHVlO1xuICB9XG4gIHByaXZhdGUgX2lkOiBzdHJpbmc7XG4gIHByaXZhdGUgX2dlbmVyYXRlZElkID0gYGNkay1vcHRpb24tJHtuZXh0SWQrK31gO1xuXG4gIC8qKiBUaGUgdmFsdWUgb2YgdGhpcyBvcHRpb24uICovXG4gIEBJbnB1dCgnY2RrT3B0aW9uJykgdmFsdWU6IFQ7XG5cbiAgLyoqXG4gICAqIFRoZSB0ZXh0IHVzZWQgdG8gbG9jYXRlIHRoaXMgaXRlbSBkdXJpbmcgbGlzdGJveCB0eXBlYWhlYWQuIElmIG5vdCBzcGVjaWZpZWQsXG4gICAqIHRoZSBgdGV4dENvbnRlbnRgIG9mIHRoZSBpdGVtIHdpbGwgYmUgdXNlZC5cbiAgICovXG4gIEBJbnB1dCgnY2RrT3B0aW9uVHlwZWFoZWFkTGFiZWwnKSB0eXBlYWhlYWRMYWJlbDogc3RyaW5nIHwgbnVsbDtcblxuICAvKiogV2hldGhlciB0aGlzIG9wdGlvbiBpcyBkaXNhYmxlZC4gKi9cbiAgQElucHV0KHthbGlhczogJ2Nka09wdGlvbkRpc2FibGVkJywgdHJhbnNmb3JtOiBib29sZWFuQXR0cmlidXRlfSlcbiAgZ2V0IGRpc2FibGVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmxpc3Rib3guZGlzYWJsZWQgfHwgdGhpcy5fZGlzYWJsZWQ7XG4gIH1cbiAgc2V0IGRpc2FibGVkKHZhbHVlOiBib29sZWFuKSB7XG4gICAgdGhpcy5fZGlzYWJsZWQgPSB2YWx1ZTtcbiAgfVxuICBwcml2YXRlIF9kaXNhYmxlZDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIC8qKiBUaGUgdGFiaW5kZXggb2YgdGhlIG9wdGlvbiB3aGVuIGl0IGlzIGVuYWJsZWQuICovXG4gIEBJbnB1dCgndGFiaW5kZXgnKVxuICBnZXQgZW5hYmxlZFRhYkluZGV4KCkge1xuICAgIHJldHVybiB0aGlzLl9lbmFibGVkVGFiSW5kZXggPT09IHVuZGVmaW5lZFxuICAgICAgPyB0aGlzLmxpc3Rib3guZW5hYmxlZFRhYkluZGV4XG4gICAgICA6IHRoaXMuX2VuYWJsZWRUYWJJbmRleDtcbiAgfVxuICBzZXQgZW5hYmxlZFRhYkluZGV4KHZhbHVlKSB7XG4gICAgdGhpcy5fZW5hYmxlZFRhYkluZGV4ID0gdmFsdWU7XG4gIH1cbiAgcHJpdmF0ZSBfZW5hYmxlZFRhYkluZGV4PzogbnVtYmVyIHwgbnVsbDtcblxuICAvKiogVGhlIG9wdGlvbidzIGhvc3QgZWxlbWVudCAqL1xuICByZWFkb25seSBlbGVtZW50OiBIVE1MRWxlbWVudCA9IGluamVjdChFbGVtZW50UmVmKS5uYXRpdmVFbGVtZW50O1xuXG4gIC8qKiBUaGUgcGFyZW50IGxpc3Rib3ggdGhpcyBvcHRpb24gYmVsb25ncyB0by4gKi9cbiAgcHJvdGVjdGVkIHJlYWRvbmx5IGxpc3Rib3g6IENka0xpc3Rib3g8VD4gPSBpbmplY3QoQ2RrTGlzdGJveCk7XG5cbiAgLyoqIEVtaXRzIHdoZW4gdGhlIG9wdGlvbiBpcyBkZXN0cm95ZWQuICovXG4gIHByb3RlY3RlZCBkZXN0cm95ZWQgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xuXG4gIC8qKiBFbWl0cyB3aGVuIHRoZSBvcHRpb24gaXMgY2xpY2tlZC4gKi9cbiAgcmVhZG9ubHkgX2NsaWNrZWQgPSBuZXcgU3ViamVjdDxNb3VzZUV2ZW50PigpO1xuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIHRoaXMuZGVzdHJveWVkLm5leHQoKTtcbiAgICB0aGlzLmRlc3Ryb3llZC5jb21wbGV0ZSgpO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhpcyBvcHRpb24gaXMgc2VsZWN0ZWQuICovXG4gIGlzU2VsZWN0ZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMubGlzdGJveC5pc1NlbGVjdGVkKHRoaXMpO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhpcyBvcHRpb24gaXMgYWN0aXZlLiAqL1xuICBpc0FjdGl2ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5saXN0Ym94LmlzQWN0aXZlKHRoaXMpO1xuICB9XG5cbiAgLyoqIFRvZ2dsZSB0aGUgc2VsZWN0ZWQgc3RhdGUgb2YgdGhpcyBvcHRpb24uICovXG4gIHRvZ2dsZSgpIHtcbiAgICB0aGlzLmxpc3Rib3gudG9nZ2xlKHRoaXMpO1xuICB9XG5cbiAgLyoqIFNlbGVjdCB0aGlzIG9wdGlvbiBpZiBpdCBpcyBub3Qgc2VsZWN0ZWQuICovXG4gIHNlbGVjdCgpIHtcbiAgICB0aGlzLmxpc3Rib3guc2VsZWN0KHRoaXMpO1xuICB9XG5cbiAgLyoqIERlc2VsZWN0IHRoaXMgb3B0aW9uIGlmIGl0IGlzIHNlbGVjdGVkLiAqL1xuICBkZXNlbGVjdCgpIHtcbiAgICB0aGlzLmxpc3Rib3guZGVzZWxlY3QodGhpcyk7XG4gIH1cblxuICAvKiogRm9jdXMgdGhpcyBvcHRpb24uICovXG4gIGZvY3VzKCkge1xuICAgIHRoaXMuZWxlbWVudC5mb2N1cygpO1xuICB9XG5cbiAgLyoqIEdldCB0aGUgbGFiZWwgZm9yIHRoaXMgZWxlbWVudCB3aGljaCBpcyByZXF1aXJlZCBieSB0aGUgRm9jdXNhYmxlT3B0aW9uIGludGVyZmFjZS4gKi9cbiAgZ2V0TGFiZWwoKSB7XG4gICAgcmV0dXJuICh0aGlzLnR5cGVhaGVhZExhYmVsID8/IHRoaXMuZWxlbWVudC50ZXh0Q29udGVudD8udHJpbSgpKSB8fCAnJztcbiAgfVxuXG4gIC8qKlxuICAgKiBOby1vcCBpbXBsZW1lbnRlZCBhcyBhIHBhcnQgb2YgYEhpZ2hsaWdodGFibGVgLlxuICAgKiBAZG9jcy1wcml2YXRlXG4gICAqL1xuICBzZXRBY3RpdmVTdHlsZXMoKSB7XG4gICAgLy8gSWYgdGhlIGxpc3Rib3ggaXMgdXNpbmcgYGFyaWEtYWN0aXZlZGVzY2VuZGFudGAgdGhlIG9wdGlvbiB3b24ndCBoYXZlIGZvY3VzIHNvIHRoZVxuICAgIC8vIGJyb3dzZXIgd29uJ3Qgc2Nyb2xsIHRoZW0gaW50byB2aWV3IGF1dG9tYXRpY2FsbHkgc28gd2UgbmVlZCB0byBkbyBpdCBvdXJzZWx2ZXMuXG4gICAgaWYgKHRoaXMubGlzdGJveC51c2VBY3RpdmVEZXNjZW5kYW50KSB7XG4gICAgICB0aGlzLmVsZW1lbnQuc2Nyb2xsSW50b1ZpZXcoe2Jsb2NrOiAnbmVhcmVzdCcsIGlubGluZTogJ25lYXJlc3QnfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIE5vLW9wIGltcGxlbWVudGVkIGFzIGEgcGFydCBvZiBgSGlnaGxpZ2h0YWJsZWAuXG4gICAqIEBkb2NzLXByaXZhdGVcbiAgICovXG4gIHNldEluYWN0aXZlU3R5bGVzKCkge31cblxuICAvKiogSGFuZGxlIGZvY3VzIGV2ZW50cyBvbiB0aGUgb3B0aW9uLiAqL1xuICBwcm90ZWN0ZWQgX2hhbmRsZUZvY3VzKCkge1xuICAgIC8vIE9wdGlvbnMgY2FuIHdpbmQgdXAgZ2V0dGluZyBmb2N1c2VkIGluIGFjdGl2ZSBkZXNjZW5kYW50IG1vZGUgaWYgdGhlIHVzZXIgY2xpY2tzIG9uIHRoZW0uXG4gICAgLy8gSW4gdGhpcyBjYXNlLCB3ZSBwdXNoIGZvY3VzIGJhY2sgdG8gdGhlIHBhcmVudCBsaXN0Ym94IHRvIHByZXZlbnQgYW4gZXh0cmEgdGFiIHN0b3Agd2hlblxuICAgIC8vIHRoZSB1c2VyIHBlcmZvcm1zIGEgc2hpZnQrdGFiLlxuICAgIGlmICh0aGlzLmxpc3Rib3gudXNlQWN0aXZlRGVzY2VuZGFudCkge1xuICAgICAgdGhpcy5saXN0Ym94Ll9zZXRBY3RpdmVPcHRpb24odGhpcyk7XG4gICAgICB0aGlzLmxpc3Rib3guZm9jdXMoKTtcbiAgICB9XG4gIH1cblxuICAvKiogR2V0IHRoZSB0YWJpbmRleCBmb3IgdGhpcyBvcHRpb24uICovXG4gIHByb3RlY3RlZCBfZ2V0VGFiSW5kZXgoKSB7XG4gICAgaWYgKHRoaXMubGlzdGJveC51c2VBY3RpdmVEZXNjZW5kYW50IHx8IHRoaXMuZGlzYWJsZWQpIHtcbiAgICAgIHJldHVybiAtMTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuaXNBY3RpdmUoKSA/IHRoaXMuZW5hYmxlZFRhYkluZGV4IDogLTE7XG4gIH1cbn1cblxuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW2Nka0xpc3Rib3hdJyxcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbiAgZXhwb3J0QXM6ICdjZGtMaXN0Ym94JyxcbiAgaG9zdDoge1xuICAgICdyb2xlJzogJ2xpc3Rib3gnLFxuICAgICdjbGFzcyc6ICdjZGstbGlzdGJveCcsXG4gICAgJ1tpZF0nOiAnaWQnLFxuICAgICdbYXR0ci50YWJpbmRleF0nOiAnX2dldFRhYkluZGV4KCknLFxuICAgICdbYXR0ci5hcmlhLWRpc2FibGVkXSc6ICdkaXNhYmxlZCcsXG4gICAgJ1thdHRyLmFyaWEtbXVsdGlzZWxlY3RhYmxlXSc6ICdtdWx0aXBsZScsXG4gICAgJ1thdHRyLmFyaWEtYWN0aXZlZGVzY2VuZGFudF0nOiAnX2dldEFyaWFBY3RpdmVEZXNjZW5kYW50KCknLFxuICAgICdbYXR0ci5hcmlhLW9yaWVudGF0aW9uXSc6ICdvcmllbnRhdGlvbicsXG4gICAgJyhmb2N1cyknOiAnX2hhbmRsZUZvY3VzKCknLFxuICAgICcoa2V5ZG93biknOiAnX2hhbmRsZUtleWRvd24oJGV2ZW50KScsXG4gICAgJyhmb2N1c291dCknOiAnX2hhbmRsZUZvY3VzT3V0KCRldmVudCknLFxuICAgICcoZm9jdXNpbiknOiAnX2hhbmRsZUZvY3VzSW4oKScsXG4gIH0sXG4gIHByb3ZpZGVyczogW1xuICAgIHtcbiAgICAgIHByb3ZpZGU6IE5HX1ZBTFVFX0FDQ0VTU09SLFxuICAgICAgdXNlRXhpc3Rpbmc6IGZvcndhcmRSZWYoKCkgPT4gQ2RrTGlzdGJveCksXG4gICAgICBtdWx0aTogdHJ1ZSxcbiAgICB9LFxuICBdLFxufSlcbmV4cG9ydCBjbGFzcyBDZGtMaXN0Ym94PFQgPSB1bmtub3duPiBpbXBsZW1lbnRzIEFmdGVyQ29udGVudEluaXQsIE9uRGVzdHJveSwgQ29udHJvbFZhbHVlQWNjZXNzb3Ige1xuICAvKiogVGhlIGlkIG9mIHRoZSBvcHRpb24ncyBob3N0IGVsZW1lbnQuICovXG4gIEBJbnB1dCgpXG4gIGdldCBpZCgpIHtcbiAgICByZXR1cm4gdGhpcy5faWQgfHwgdGhpcy5fZ2VuZXJhdGVkSWQ7XG4gIH1cbiAgc2V0IGlkKHZhbHVlKSB7XG4gICAgdGhpcy5faWQgPSB2YWx1ZTtcbiAgfVxuICBwcml2YXRlIF9pZDogc3RyaW5nO1xuICBwcml2YXRlIF9nZW5lcmF0ZWRJZCA9IGBjZGstbGlzdGJveC0ke25leHRJZCsrfWA7XG5cbiAgLyoqIFRoZSB0YWJpbmRleCB0byB1c2Ugd2hlbiB0aGUgbGlzdGJveCBpcyBlbmFibGVkLiAqL1xuICBASW5wdXQoJ3RhYmluZGV4JylcbiAgZ2V0IGVuYWJsZWRUYWJJbmRleCgpIHtcbiAgICByZXR1cm4gdGhpcy5fZW5hYmxlZFRhYkluZGV4ID09PSB1bmRlZmluZWQgPyAwIDogdGhpcy5fZW5hYmxlZFRhYkluZGV4O1xuICB9XG4gIHNldCBlbmFibGVkVGFiSW5kZXgodmFsdWUpIHtcbiAgICB0aGlzLl9lbmFibGVkVGFiSW5kZXggPSB2YWx1ZTtcbiAgfVxuICBwcml2YXRlIF9lbmFibGVkVGFiSW5kZXg/OiBudW1iZXIgfCBudWxsO1xuXG4gIC8qKiBUaGUgdmFsdWUgc2VsZWN0ZWQgaW4gdGhlIGxpc3Rib3gsIHJlcHJlc2VudGVkIGFzIGFuIGFycmF5IG9mIG9wdGlvbiB2YWx1ZXMuICovXG4gIEBJbnB1dCgnY2RrTGlzdGJveFZhbHVlJylcbiAgZ2V0IHZhbHVlKCk6IHJlYWRvbmx5IFRbXSB7XG4gICAgcmV0dXJuIHRoaXMuX2ludmFsaWQgPyBbXSA6IHRoaXMuc2VsZWN0aW9uTW9kZWwuc2VsZWN0ZWQ7XG4gIH1cbiAgc2V0IHZhbHVlKHZhbHVlOiByZWFkb25seSBUW10pIHtcbiAgICB0aGlzLl9zZXRTZWxlY3Rpb24odmFsdWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlIGxpc3Rib3ggYWxsb3dzIG11bHRpcGxlIG9wdGlvbnMgdG8gYmUgc2VsZWN0ZWQuIElmIHRoZSB2YWx1ZSBzd2l0Y2hlcyBmcm9tIGB0cnVlYFxuICAgKiB0byBgZmFsc2VgLCBhbmQgbW9yZSB0aGFuIG9uZSBvcHRpb24gaXMgc2VsZWN0ZWQsIGFsbCBvcHRpb25zIGFyZSBkZXNlbGVjdGVkLlxuICAgKi9cbiAgQElucHV0KHthbGlhczogJ2Nka0xpc3Rib3hNdWx0aXBsZScsIHRyYW5zZm9ybTogYm9vbGVhbkF0dHJpYnV0ZX0pXG4gIGdldCBtdWx0aXBsZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5zZWxlY3Rpb25Nb2RlbC5tdWx0aXBsZTtcbiAgfVxuICBzZXQgbXVsdGlwbGUodmFsdWU6IGJvb2xlYW4pIHtcbiAgICB0aGlzLnNlbGVjdGlvbk1vZGVsLm11bHRpcGxlID0gdmFsdWU7XG5cbiAgICBpZiAodGhpcy5vcHRpb25zKSB7XG4gICAgICB0aGlzLl91cGRhdGVJbnRlcm5hbFZhbHVlKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGxpc3Rib3ggaXMgZGlzYWJsZWQuICovXG4gIEBJbnB1dCh7YWxpYXM6ICdjZGtMaXN0Ym94RGlzYWJsZWQnLCB0cmFuc2Zvcm06IGJvb2xlYW5BdHRyaWJ1dGV9KVxuICBkaXNhYmxlZDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBsaXN0Ym94IHdpbGwgdXNlIGFjdGl2ZSBkZXNjZW5kYW50IG9yIHdpbGwgbW92ZSBmb2N1cyBvbnRvIHRoZSBvcHRpb25zLiAqL1xuICBASW5wdXQoe2FsaWFzOiAnY2RrTGlzdGJveFVzZUFjdGl2ZURlc2NlbmRhbnQnLCB0cmFuc2Zvcm06IGJvb2xlYW5BdHRyaWJ1dGV9KVxuICB1c2VBY3RpdmVEZXNjZW5kYW50OiBib29sZWFuID0gZmFsc2U7XG5cbiAgLyoqIFRoZSBvcmllbnRhdGlvbiBvZiB0aGUgbGlzdGJveC4gT25seSBhZmZlY3RzIGtleWJvYXJkIGludGVyYWN0aW9uLCBub3QgdmlzdWFsIGxheW91dC4gKi9cbiAgQElucHV0KCdjZGtMaXN0Ym94T3JpZW50YXRpb24nKVxuICBnZXQgb3JpZW50YXRpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuX29yaWVudGF0aW9uO1xuICB9XG4gIHNldCBvcmllbnRhdGlvbih2YWx1ZTogJ2hvcml6b250YWwnIHwgJ3ZlcnRpY2FsJykge1xuICAgIHRoaXMuX29yaWVudGF0aW9uID0gdmFsdWUgPT09ICdob3Jpem9udGFsJyA/ICdob3Jpem9udGFsJyA6ICd2ZXJ0aWNhbCc7XG4gICAgaWYgKHZhbHVlID09PSAnaG9yaXpvbnRhbCcpIHtcbiAgICAgIHRoaXMubGlzdEtleU1hbmFnZXI/LndpdGhIb3Jpem9udGFsT3JpZW50YXRpb24odGhpcy5fZGlyPy52YWx1ZSB8fCAnbHRyJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubGlzdEtleU1hbmFnZXI/LndpdGhWZXJ0aWNhbE9yaWVudGF0aW9uKCk7XG4gICAgfVxuICB9XG4gIHByaXZhdGUgX29yaWVudGF0aW9uOiAnaG9yaXpvbnRhbCcgfCAndmVydGljYWwnID0gJ3ZlcnRpY2FsJztcblxuICAvKiogVGhlIGZ1bmN0aW9uIHVzZWQgdG8gY29tcGFyZSBvcHRpb24gdmFsdWVzLiAqL1xuICBASW5wdXQoJ2Nka0xpc3Rib3hDb21wYXJlV2l0aCcpXG4gIGdldCBjb21wYXJlV2l0aCgpOiB1bmRlZmluZWQgfCAoKG8xOiBULCBvMjogVCkgPT4gYm9vbGVhbikge1xuICAgIHJldHVybiB0aGlzLnNlbGVjdGlvbk1vZGVsLmNvbXBhcmVXaXRoO1xuICB9XG4gIHNldCBjb21wYXJlV2l0aChmbjogdW5kZWZpbmVkIHwgKChvMTogVCwgbzI6IFQpID0+IGJvb2xlYW4pKSB7XG4gICAgdGhpcy5zZWxlY3Rpb25Nb2RlbC5jb21wYXJlV2l0aCA9IGZuO1xuICB9XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlIGtleWJvYXJkIG5hdmlnYXRpb24gc2hvdWxkIHdyYXAgd2hlbiB0aGUgdXNlciBwcmVzc2VzIGFycm93IGRvd24gb24gdGhlIGxhc3QgaXRlbVxuICAgKiBvciBhcnJvdyB1cCBvbiB0aGUgZmlyc3QgaXRlbS5cbiAgICovXG4gIEBJbnB1dCh7YWxpYXM6ICdjZGtMaXN0Ym94TmF2aWdhdGlvbldyYXBEaXNhYmxlZCcsIHRyYW5zZm9ybTogYm9vbGVhbkF0dHJpYnV0ZX0pXG4gIGdldCBuYXZpZ2F0aW9uV3JhcERpc2FibGVkKCkge1xuICAgIHJldHVybiB0aGlzLl9uYXZpZ2F0aW9uV3JhcERpc2FibGVkO1xuICB9XG4gIHNldCBuYXZpZ2F0aW9uV3JhcERpc2FibGVkKHdyYXA6IGJvb2xlYW4pIHtcbiAgICB0aGlzLl9uYXZpZ2F0aW9uV3JhcERpc2FibGVkID0gd3JhcDtcbiAgICB0aGlzLmxpc3RLZXlNYW5hZ2VyPy53aXRoV3JhcCghdGhpcy5fbmF2aWdhdGlvbldyYXBEaXNhYmxlZCk7XG4gIH1cbiAgcHJpdmF0ZSBfbmF2aWdhdGlvbldyYXBEaXNhYmxlZCA9IGZhbHNlO1xuXG4gIC8qKiBXaGV0aGVyIGtleWJvYXJkIG5hdmlnYXRpb24gc2hvdWxkIHNraXAgb3ZlciBkaXNhYmxlZCBpdGVtcy4gKi9cbiAgQElucHV0KHthbGlhczogJ2Nka0xpc3Rib3hOYXZpZ2F0ZXNEaXNhYmxlZE9wdGlvbnMnLCB0cmFuc2Zvcm06IGJvb2xlYW5BdHRyaWJ1dGV9KVxuICBnZXQgbmF2aWdhdGVEaXNhYmxlZE9wdGlvbnMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX25hdmlnYXRlRGlzYWJsZWRPcHRpb25zO1xuICB9XG4gIHNldCBuYXZpZ2F0ZURpc2FibGVkT3B0aW9ucyhza2lwOiBib29sZWFuKSB7XG4gICAgdGhpcy5fbmF2aWdhdGVEaXNhYmxlZE9wdGlvbnMgPSBza2lwO1xuICAgIHRoaXMubGlzdEtleU1hbmFnZXI/LnNraXBQcmVkaWNhdGUoXG4gICAgICB0aGlzLl9uYXZpZ2F0ZURpc2FibGVkT3B0aW9ucyA/IHRoaXMuX3NraXBOb25lUHJlZGljYXRlIDogdGhpcy5fc2tpcERpc2FibGVkUHJlZGljYXRlLFxuICAgICk7XG4gIH1cbiAgcHJpdmF0ZSBfbmF2aWdhdGVEaXNhYmxlZE9wdGlvbnMgPSBmYWxzZTtcblxuICAvKiogRW1pdHMgd2hlbiB0aGUgc2VsZWN0ZWQgdmFsdWUocykgaW4gdGhlIGxpc3Rib3ggY2hhbmdlLiAqL1xuICBAT3V0cHV0KCdjZGtMaXN0Ym94VmFsdWVDaGFuZ2UnKSByZWFkb25seSB2YWx1ZUNoYW5nZSA9IG5ldyBTdWJqZWN0PExpc3Rib3hWYWx1ZUNoYW5nZUV2ZW50PFQ+PigpO1xuXG4gIC8qKiBUaGUgY2hpbGQgb3B0aW9ucyBpbiB0aGlzIGxpc3Rib3guICovXG4gIEBDb250ZW50Q2hpbGRyZW4oQ2RrT3B0aW9uLCB7ZGVzY2VuZGFudHM6IHRydWV9KSBwcm90ZWN0ZWQgb3B0aW9uczogUXVlcnlMaXN0PENka09wdGlvbjxUPj47XG5cbiAgLyoqIFRoZSBzZWxlY3Rpb24gbW9kZWwgdXNlZCBieSB0aGUgbGlzdGJveC4gKi9cbiAgcHJvdGVjdGVkIHNlbGVjdGlvbk1vZGVsID0gbmV3IExpc3Rib3hTZWxlY3Rpb25Nb2RlbDxUPigpO1xuXG4gIC8qKiBUaGUga2V5IG1hbmFnZXIgdGhhdCBtYW5hZ2VzIGtleWJvYXJkIG5hdmlnYXRpb24gZm9yIHRoaXMgbGlzdGJveC4gKi9cbiAgcHJvdGVjdGVkIGxpc3RLZXlNYW5hZ2VyOiBBY3RpdmVEZXNjZW5kYW50S2V5TWFuYWdlcjxDZGtPcHRpb248VD4+O1xuXG4gIC8qKiBFbWl0cyB3aGVuIHRoZSBsaXN0Ym94IGlzIGRlc3Ryb3llZC4gKi9cbiAgcHJvdGVjdGVkIHJlYWRvbmx5IGRlc3Ryb3llZCA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XG5cbiAgLyoqIFRoZSBob3N0IGVsZW1lbnQgb2YgdGhlIGxpc3Rib3guICovXG4gIHByb3RlY3RlZCByZWFkb25seSBlbGVtZW50OiBIVE1MRWxlbWVudCA9IGluamVjdChFbGVtZW50UmVmKS5uYXRpdmVFbGVtZW50O1xuXG4gIC8qKiBUaGUgQW5ndWxhciB6b25lLiAqL1xuICBwcm90ZWN0ZWQgcmVhZG9ubHkgbmdab25lID0gaW5qZWN0KE5nWm9uZSk7XG5cbiAgLyoqIFRoZSBjaGFuZ2UgZGV0ZWN0b3IgZm9yIHRoaXMgbGlzdGJveC4gKi9cbiAgcHJvdGVjdGVkIHJlYWRvbmx5IGNoYW5nZURldGVjdG9yUmVmID0gaW5qZWN0KENoYW5nZURldGVjdG9yUmVmKTtcblxuICAvKiogV2hldGhlciB0aGUgY3VycmVudGx5IHNlbGVjdGVkIHZhbHVlIGluIHRoZSBzZWxlY3Rpb24gbW9kZWwgaXMgaW52YWxpZC4gKi9cbiAgcHJpdmF0ZSBfaW52YWxpZCA9IGZhbHNlO1xuXG4gIC8qKiBUaGUgbGFzdCB1c2VyLXRyaWdnZXJlZCBvcHRpb24uICovXG4gIHByaXZhdGUgX2xhc3RUcmlnZ2VyZWQ6IENka09wdGlvbjxUPiB8IG51bGwgPSBudWxsO1xuXG4gIC8qKiBDYWxsYmFjayBjYWxsZWQgd2hlbiB0aGUgbGlzdGJveCBoYXMgYmVlbiB0b3VjaGVkICovXG4gIHByaXZhdGUgX29uVG91Y2hlZCA9ICgpID0+IHt9O1xuXG4gIC8qKiBDYWxsYmFjayBjYWxsZWQgd2hlbiB0aGUgbGlzdGJveCB2YWx1ZSBjaGFuZ2VzICovXG4gIHByaXZhdGUgX29uQ2hhbmdlOiAodmFsdWU6IHJlYWRvbmx5IFRbXSkgPT4gdm9pZCA9ICgpID0+IHt9O1xuXG4gIC8qKiBFbWl0cyB3aGVuIGFuIG9wdGlvbiBoYXMgYmVlbiBjbGlja2VkLiAqL1xuICBwcml2YXRlIF9vcHRpb25DbGlja2VkID0gZGVmZXIoKCkgPT5cbiAgICAodGhpcy5vcHRpb25zLmNoYW5nZXMgYXMgT2JzZXJ2YWJsZTxDZGtPcHRpb248VD5bXT4pLnBpcGUoXG4gICAgICBzdGFydFdpdGgodGhpcy5vcHRpb25zKSxcbiAgICAgIHN3aXRjaE1hcChvcHRpb25zID0+XG4gICAgICAgIG1lcmdlKC4uLm9wdGlvbnMubWFwKG9wdGlvbiA9PiBvcHRpb24uX2NsaWNrZWQucGlwZShtYXAoZXZlbnQgPT4gKHtvcHRpb24sIGV2ZW50fSkpKSkpLFxuICAgICAgKSxcbiAgICApLFxuICApO1xuXG4gIC8qKiBUaGUgZGlyZWN0aW9uYWxpdHkgb2YgdGhlIHBhZ2UuICovXG4gIHByaXZhdGUgcmVhZG9ubHkgX2RpciA9IGluamVjdChEaXJlY3Rpb25hbGl0eSwge29wdGlvbmFsOiB0cnVlfSk7XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGNvbXBvbmVudCBpcyBiZWluZyByZW5kZXJlZCBpbiB0aGUgYnJvd3Nlci4gKi9cbiAgcHJpdmF0ZSByZWFkb25seSBfaXNCcm93c2VyOiBib29sZWFuID0gaW5qZWN0KFBsYXRmb3JtKS5pc0Jyb3dzZXI7XG5cbiAgLyoqIEEgcHJlZGljYXRlIHRoYXQgc2tpcHMgZGlzYWJsZWQgb3B0aW9ucy4gKi9cbiAgcHJpdmF0ZSByZWFkb25seSBfc2tpcERpc2FibGVkUHJlZGljYXRlID0gKG9wdGlvbjogQ2RrT3B0aW9uPFQ+KSA9PiBvcHRpb24uZGlzYWJsZWQ7XG5cbiAgLyoqIEEgcHJlZGljYXRlIHRoYXQgZG9lcyBub3Qgc2tpcCBhbnkgb3B0aW9ucy4gKi9cbiAgcHJpdmF0ZSByZWFkb25seSBfc2tpcE5vbmVQcmVkaWNhdGUgPSAoKSA9PiBmYWxzZTtcblxuICAvKiogV2hldGhlciB0aGUgbGlzdGJveCBjdXJyZW50bHkgaGFzIGZvY3VzLiAqL1xuICBwcml2YXRlIF9oYXNGb2N1cyA9IGZhbHNlO1xuXG4gIC8qKiBBIHJlZmVyZW5jZSB0byB0aGUgb3B0aW9uIHRoYXQgd2FzIGFjdGl2ZSBiZWZvcmUgdGhlIGxpc3Rib3ggbG9zdCBmb2N1cy4gKi9cbiAgcHJpdmF0ZSBfcHJldmlvdXNBY3RpdmVPcHRpb246IENka09wdGlvbjxUPiB8IG51bGwgPSBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIGlmICh0aGlzLl9pc0Jyb3dzZXIpIHtcbiAgICAgIHRoaXMuX3NldFByZXZpb3VzQWN0aXZlT3B0aW9uQXNBY3RpdmVPcHRpb25PbldpbmRvd0JsdXIoKTtcbiAgICB9XG4gIH1cblxuICBuZ0FmdGVyQ29udGVudEluaXQoKSB7XG4gICAgaWYgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkge1xuICAgICAgdGhpcy5fdmVyaWZ5Tm9PcHRpb25WYWx1ZUNvbGxpc2lvbnMoKTtcbiAgICAgIHRoaXMuX3ZlcmlmeU9wdGlvblZhbHVlcygpO1xuICAgIH1cblxuICAgIHRoaXMuX2luaXRLZXlNYW5hZ2VyKCk7XG5cbiAgICAvLyBVcGRhdGUgdGhlIGludGVybmFsIHZhbHVlIHdoZW5ldmVyIHRoZSBvcHRpb25zIG9yIHRoZSBtb2RlbCB2YWx1ZSBjaGFuZ2VzLlxuICAgIG1lcmdlKHRoaXMuc2VsZWN0aW9uTW9kZWwuY2hhbmdlZCwgdGhpcy5vcHRpb25zLmNoYW5nZXMpXG4gICAgICAucGlwZShzdGFydFdpdGgobnVsbCksIHRha2VVbnRpbCh0aGlzLmRlc3Ryb3llZCkpXG4gICAgICAuc3Vic2NyaWJlKCgpID0+IHRoaXMuX3VwZGF0ZUludGVybmFsVmFsdWUoKSk7XG5cbiAgICB0aGlzLl9vcHRpb25DbGlja2VkXG4gICAgICAucGlwZShcbiAgICAgICAgZmlsdGVyKCh7b3B0aW9ufSkgPT4gIW9wdGlvbi5kaXNhYmxlZCksXG4gICAgICAgIHRha2VVbnRpbCh0aGlzLmRlc3Ryb3llZCksXG4gICAgICApXG4gICAgICAuc3Vic2NyaWJlKCh7b3B0aW9uLCBldmVudH0pID0+IHRoaXMuX2hhbmRsZU9wdGlvbkNsaWNrZWQob3B0aW9uLCBldmVudCkpO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdGhpcy5saXN0S2V5TWFuYWdlcj8uZGVzdHJveSgpO1xuICAgIHRoaXMuZGVzdHJveWVkLm5leHQoKTtcbiAgICB0aGlzLmRlc3Ryb3llZC5jb21wbGV0ZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRvZ2dsZSB0aGUgc2VsZWN0ZWQgc3RhdGUgb2YgdGhlIGdpdmVuIG9wdGlvbi5cbiAgICogQHBhcmFtIG9wdGlvbiBUaGUgb3B0aW9uIHRvIHRvZ2dsZVxuICAgKi9cbiAgdG9nZ2xlKG9wdGlvbjogQ2RrT3B0aW9uPFQ+KSB7XG4gICAgdGhpcy50b2dnbGVWYWx1ZShvcHRpb24udmFsdWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRvZ2dsZSB0aGUgc2VsZWN0ZWQgc3RhdGUgb2YgdGhlIGdpdmVuIHZhbHVlLlxuICAgKiBAcGFyYW0gdmFsdWUgVGhlIHZhbHVlIHRvIHRvZ2dsZVxuICAgKi9cbiAgdG9nZ2xlVmFsdWUodmFsdWU6IFQpIHtcbiAgICBpZiAodGhpcy5faW52YWxpZCkge1xuICAgICAgdGhpcy5zZWxlY3Rpb25Nb2RlbC5jbGVhcihmYWxzZSk7XG4gICAgfVxuICAgIHRoaXMuc2VsZWN0aW9uTW9kZWwudG9nZ2xlKHZhbHVlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWxlY3QgdGhlIGdpdmVuIG9wdGlvbi5cbiAgICogQHBhcmFtIG9wdGlvbiBUaGUgb3B0aW9uIHRvIHNlbGVjdFxuICAgKi9cbiAgc2VsZWN0KG9wdGlvbjogQ2RrT3B0aW9uPFQ+KSB7XG4gICAgdGhpcy5zZWxlY3RWYWx1ZShvcHRpb24udmFsdWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlbGVjdCB0aGUgZ2l2ZW4gdmFsdWUuXG4gICAqIEBwYXJhbSB2YWx1ZSBUaGUgdmFsdWUgdG8gc2VsZWN0XG4gICAqL1xuICBzZWxlY3RWYWx1ZSh2YWx1ZTogVCkge1xuICAgIGlmICh0aGlzLl9pbnZhbGlkKSB7XG4gICAgICB0aGlzLnNlbGVjdGlvbk1vZGVsLmNsZWFyKGZhbHNlKTtcbiAgICB9XG4gICAgdGhpcy5zZWxlY3Rpb25Nb2RlbC5zZWxlY3QodmFsdWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIERlc2VsZWN0IHRoZSBnaXZlbiBvcHRpb24uXG4gICAqIEBwYXJhbSBvcHRpb24gVGhlIG9wdGlvbiB0byBkZXNlbGVjdFxuICAgKi9cbiAgZGVzZWxlY3Qob3B0aW9uOiBDZGtPcHRpb248VD4pIHtcbiAgICB0aGlzLmRlc2VsZWN0VmFsdWUob3B0aW9uLnZhbHVlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXNlbGVjdCB0aGUgZ2l2ZW4gdmFsdWUuXG4gICAqIEBwYXJhbSB2YWx1ZSBUaGUgdmFsdWUgdG8gZGVzZWxlY3RcbiAgICovXG4gIGRlc2VsZWN0VmFsdWUodmFsdWU6IFQpIHtcbiAgICBpZiAodGhpcy5faW52YWxpZCkge1xuICAgICAgdGhpcy5zZWxlY3Rpb25Nb2RlbC5jbGVhcihmYWxzZSk7XG4gICAgfVxuICAgIHRoaXMuc2VsZWN0aW9uTW9kZWwuZGVzZWxlY3QodmFsdWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCB0aGUgc2VsZWN0ZWQgc3RhdGUgb2YgYWxsIG9wdGlvbnMuXG4gICAqIEBwYXJhbSBpc1NlbGVjdGVkIFRoZSBuZXcgc2VsZWN0ZWQgc3RhdGUgdG8gc2V0XG4gICAqL1xuICBzZXRBbGxTZWxlY3RlZChpc1NlbGVjdGVkOiBib29sZWFuKSB7XG4gICAgaWYgKCFpc1NlbGVjdGVkKSB7XG4gICAgICB0aGlzLnNlbGVjdGlvbk1vZGVsLmNsZWFyKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0aGlzLl9pbnZhbGlkKSB7XG4gICAgICAgIHRoaXMuc2VsZWN0aW9uTW9kZWwuY2xlYXIoZmFsc2UpO1xuICAgICAgfVxuICAgICAgdGhpcy5zZWxlY3Rpb25Nb2RlbC5zZWxlY3QoLi4udGhpcy5vcHRpb25zLm1hcChvcHRpb24gPT4gb3B0aW9uLnZhbHVlKSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCB3aGV0aGVyIHRoZSBnaXZlbiBvcHRpb24gaXMgc2VsZWN0ZWQuXG4gICAqIEBwYXJhbSBvcHRpb24gVGhlIG9wdGlvbiB0byBnZXQgdGhlIHNlbGVjdGVkIHN0YXRlIG9mXG4gICAqL1xuICBpc1NlbGVjdGVkKG9wdGlvbjogQ2RrT3B0aW9uPFQ+KSB7XG4gICAgcmV0dXJuIHRoaXMuaXNWYWx1ZVNlbGVjdGVkKG9wdGlvbi52YWx1ZSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHdoZXRoZXIgdGhlIGdpdmVuIG9wdGlvbiBpcyBhY3RpdmUuXG4gICAqIEBwYXJhbSBvcHRpb24gVGhlIG9wdGlvbiB0byBnZXQgdGhlIGFjdGl2ZSBzdGF0ZSBvZlxuICAgKi9cbiAgaXNBY3RpdmUob3B0aW9uOiBDZGtPcHRpb248VD4pOiBib29sZWFuIHtcbiAgICByZXR1cm4gISEodGhpcy5saXN0S2V5TWFuYWdlcj8uYWN0aXZlSXRlbSA9PT0gb3B0aW9uKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgd2hldGhlciB0aGUgZ2l2ZW4gdmFsdWUgaXMgc2VsZWN0ZWQuXG4gICAqIEBwYXJhbSB2YWx1ZSBUaGUgdmFsdWUgdG8gZ2V0IHRoZSBzZWxlY3RlZCBzdGF0ZSBvZlxuICAgKi9cbiAgaXNWYWx1ZVNlbGVjdGVkKHZhbHVlOiBUKSB7XG4gICAgaWYgKHRoaXMuX2ludmFsaWQpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuc2VsZWN0aW9uTW9kZWwuaXNTZWxlY3RlZCh2YWx1ZSk7XG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXJzIGEgY2FsbGJhY2sgdG8gYmUgaW52b2tlZCB3aGVuIHRoZSBsaXN0Ym94J3MgdmFsdWUgY2hhbmdlcyBmcm9tIHVzZXIgaW5wdXQuXG4gICAqIEBwYXJhbSBmbiBUaGUgY2FsbGJhY2sgdG8gcmVnaXN0ZXJcbiAgICogQGRvY3MtcHJpdmF0ZVxuICAgKi9cbiAgcmVnaXN0ZXJPbkNoYW5nZShmbjogKHZhbHVlOiByZWFkb25seSBUW10pID0+IHZvaWQpOiB2b2lkIHtcbiAgICB0aGlzLl9vbkNoYW5nZSA9IGZuO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVycyBhIGNhbGxiYWNrIHRvIGJlIGludm9rZWQgd2hlbiB0aGUgbGlzdGJveCBpcyBibHVycmVkIGJ5IHRoZSB1c2VyLlxuICAgKiBAcGFyYW0gZm4gVGhlIGNhbGxiYWNrIHRvIHJlZ2lzdGVyXG4gICAqIEBkb2NzLXByaXZhdGVcbiAgICovXG4gIHJlZ2lzdGVyT25Ub3VjaGVkKGZuOiAoKSA9PiB7fSk6IHZvaWQge1xuICAgIHRoaXMuX29uVG91Y2hlZCA9IGZuO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGxpc3Rib3gncyB2YWx1ZS5cbiAgICogQHBhcmFtIHZhbHVlIFRoZSBuZXcgdmFsdWUgb2YgdGhlIGxpc3Rib3hcbiAgICogQGRvY3MtcHJpdmF0ZVxuICAgKi9cbiAgd3JpdGVWYWx1ZSh2YWx1ZTogcmVhZG9ubHkgVFtdKTogdm9pZCB7XG4gICAgdGhpcy5fc2V0U2VsZWN0aW9uKHZhbHVlKTtcbiAgICB0aGlzLl92ZXJpZnlPcHRpb25WYWx1ZXMoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBkaXNhYmxlZCBzdGF0ZSBvZiB0aGUgbGlzdGJveC5cbiAgICogQHBhcmFtIGlzRGlzYWJsZWQgVGhlIG5ldyBkaXNhYmxlZCBzdGF0ZVxuICAgKiBAZG9jcy1wcml2YXRlXG4gICAqL1xuICBzZXREaXNhYmxlZFN0YXRlKGlzRGlzYWJsZWQ6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLmRpc2FibGVkID0gaXNEaXNhYmxlZDtcbiAgICB0aGlzLmNoYW5nZURldGVjdG9yUmVmLm1hcmtGb3JDaGVjaygpO1xuICB9XG5cbiAgLyoqIEZvY3VzIHRoZSBsaXN0Ym94J3MgaG9zdCBlbGVtZW50LiAqL1xuICBmb2N1cygpIHtcbiAgICB0aGlzLmVsZW1lbnQuZm9jdXMoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUcmlnZ2VycyB0aGUgZ2l2ZW4gb3B0aW9uIGluIHJlc3BvbnNlIHRvIHVzZXIgaW50ZXJhY3Rpb24uXG4gICAqIC0gSW4gc2luZ2xlIHNlbGVjdGlvbiBtb2RlOiBzZWxlY3RzIHRoZSBvcHRpb24gYW5kIGRlc2VsZWN0cyBhbnkgb3RoZXIgc2VsZWN0ZWQgb3B0aW9uLlxuICAgKiAtIEluIG11bHRpIHNlbGVjdGlvbiBtb2RlOiB0b2dnbGVzIHRoZSBzZWxlY3RlZCBzdGF0ZSBvZiB0aGUgb3B0aW9uLlxuICAgKiBAcGFyYW0gb3B0aW9uIFRoZSBvcHRpb24gdG8gdHJpZ2dlclxuICAgKi9cbiAgcHJvdGVjdGVkIHRyaWdnZXJPcHRpb24ob3B0aW9uOiBDZGtPcHRpb248VD4gfCBudWxsKSB7XG4gICAgaWYgKG9wdGlvbiAmJiAhb3B0aW9uLmRpc2FibGVkKSB7XG4gICAgICB0aGlzLl9sYXN0VHJpZ2dlcmVkID0gb3B0aW9uO1xuICAgICAgY29uc3QgY2hhbmdlZCA9IHRoaXMubXVsdGlwbGVcbiAgICAgICAgPyB0aGlzLnNlbGVjdGlvbk1vZGVsLnRvZ2dsZShvcHRpb24udmFsdWUpXG4gICAgICAgIDogdGhpcy5zZWxlY3Rpb25Nb2RlbC5zZWxlY3Qob3B0aW9uLnZhbHVlKTtcbiAgICAgIGlmIChjaGFuZ2VkKSB7XG4gICAgICAgIHRoaXMuX29uQ2hhbmdlKHRoaXMudmFsdWUpO1xuICAgICAgICB0aGlzLnZhbHVlQ2hhbmdlLm5leHQoe1xuICAgICAgICAgIHZhbHVlOiB0aGlzLnZhbHVlLFxuICAgICAgICAgIGxpc3Rib3g6IHRoaXMsXG4gICAgICAgICAgb3B0aW9uOiBvcHRpb24sXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUcmlnZ2VyIHRoZSBnaXZlbiByYW5nZSBvZiBvcHRpb25zIGluIHJlc3BvbnNlIHRvIHVzZXIgaW50ZXJhY3Rpb24uXG4gICAqIFNob3VsZCBvbmx5IGJlIGNhbGxlZCBpbiBtdWx0aS1zZWxlY3Rpb24gbW9kZS5cbiAgICogQHBhcmFtIHRyaWdnZXIgVGhlIG9wdGlvbiB0aGF0IHdhcyB0cmlnZ2VyZWRcbiAgICogQHBhcmFtIGZyb20gVGhlIHN0YXJ0IGluZGV4IG9mIHRoZSBvcHRpb25zIHRvIHRvZ2dsZVxuICAgKiBAcGFyYW0gdG8gVGhlIGVuZCBpbmRleCBvZiB0aGUgb3B0aW9ucyB0byB0b2dnbGVcbiAgICogQHBhcmFtIG9uIFdoZXRoZXIgdG8gdG9nZ2xlIHRoZSBvcHRpb24gcmFuZ2Ugb25cbiAgICovXG4gIHByb3RlY3RlZCB0cmlnZ2VyUmFuZ2UodHJpZ2dlcjogQ2RrT3B0aW9uPFQ+IHwgbnVsbCwgZnJvbTogbnVtYmVyLCB0bzogbnVtYmVyLCBvbjogYm9vbGVhbikge1xuICAgIGlmICh0aGlzLmRpc2FibGVkIHx8ICh0cmlnZ2VyICYmIHRyaWdnZXIuZGlzYWJsZWQpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuX2xhc3RUcmlnZ2VyZWQgPSB0cmlnZ2VyO1xuICAgIGNvbnN0IGlzRXF1YWwgPSB0aGlzLmNvbXBhcmVXaXRoID8/IE9iamVjdC5pcztcbiAgICBjb25zdCB1cGRhdGVWYWx1ZXMgPSBbLi4udGhpcy5vcHRpb25zXVxuICAgICAgLnNsaWNlKE1hdGgubWF4KDAsIE1hdGgubWluKGZyb20sIHRvKSksIE1hdGgubWluKHRoaXMub3B0aW9ucy5sZW5ndGgsIE1hdGgubWF4KGZyb20sIHRvKSArIDEpKVxuICAgICAgLmZpbHRlcihvcHRpb24gPT4gIW9wdGlvbi5kaXNhYmxlZClcbiAgICAgIC5tYXAob3B0aW9uID0+IG9wdGlvbi52YWx1ZSk7XG4gICAgY29uc3Qgc2VsZWN0ZWQgPSBbLi4udGhpcy52YWx1ZV07XG4gICAgZm9yIChjb25zdCB1cGRhdGVWYWx1ZSBvZiB1cGRhdGVWYWx1ZXMpIHtcbiAgICAgIGNvbnN0IHNlbGVjdGVkSW5kZXggPSBzZWxlY3RlZC5maW5kSW5kZXgoc2VsZWN0ZWRWYWx1ZSA9PlxuICAgICAgICBpc0VxdWFsKHNlbGVjdGVkVmFsdWUsIHVwZGF0ZVZhbHVlKSxcbiAgICAgICk7XG4gICAgICBpZiAob24gJiYgc2VsZWN0ZWRJbmRleCA9PT0gLTEpIHtcbiAgICAgICAgc2VsZWN0ZWQucHVzaCh1cGRhdGVWYWx1ZSk7XG4gICAgICB9IGVsc2UgaWYgKCFvbiAmJiBzZWxlY3RlZEluZGV4ICE9PSAtMSkge1xuICAgICAgICBzZWxlY3RlZC5zcGxpY2Uoc2VsZWN0ZWRJbmRleCwgMSk7XG4gICAgICB9XG4gICAgfVxuICAgIGxldCBjaGFuZ2VkID0gdGhpcy5zZWxlY3Rpb25Nb2RlbC5zZXRTZWxlY3Rpb24oLi4uc2VsZWN0ZWQpO1xuICAgIGlmIChjaGFuZ2VkKSB7XG4gICAgICB0aGlzLl9vbkNoYW5nZSh0aGlzLnZhbHVlKTtcbiAgICAgIHRoaXMudmFsdWVDaGFuZ2UubmV4dCh7XG4gICAgICAgIHZhbHVlOiB0aGlzLnZhbHVlLFxuICAgICAgICBsaXN0Ym94OiB0aGlzLFxuICAgICAgICBvcHRpb246IHRyaWdnZXIsXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgZ2l2ZW4gb3B0aW9uIGFzIGFjdGl2ZS5cbiAgICogQHBhcmFtIG9wdGlvbiBUaGUgb3B0aW9uIHRvIG1ha2UgYWN0aXZlXG4gICAqL1xuICBfc2V0QWN0aXZlT3B0aW9uKG9wdGlvbjogQ2RrT3B0aW9uPFQ+KSB7XG4gICAgdGhpcy5saXN0S2V5TWFuYWdlci5zZXRBY3RpdmVJdGVtKG9wdGlvbik7XG4gIH1cblxuICAvKiogQ2FsbGVkIHdoZW4gdGhlIGxpc3Rib3ggcmVjZWl2ZXMgZm9jdXMuICovXG4gIHByb3RlY3RlZCBfaGFuZGxlRm9jdXMoKSB7XG4gICAgaWYgKCF0aGlzLnVzZUFjdGl2ZURlc2NlbmRhbnQpIHtcbiAgICAgIGlmICh0aGlzLnNlbGVjdGlvbk1vZGVsLnNlbGVjdGVkLmxlbmd0aCA+IDApIHtcbiAgICAgICAgdGhpcy5fc2V0TmV4dEZvY3VzVG9TZWxlY3RlZE9wdGlvbigpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5saXN0S2V5TWFuYWdlci5zZXROZXh0SXRlbUFjdGl2ZSgpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9mb2N1c0FjdGl2ZU9wdGlvbigpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBDYWxsZWQgd2hlbiB0aGUgdXNlciBwcmVzc2VzIGtleWRvd24gb24gdGhlIGxpc3Rib3guICovXG4gIHByb3RlY3RlZCBfaGFuZGxlS2V5ZG93bihldmVudDogS2V5Ym9hcmRFdmVudCkge1xuICAgIGlmICh0aGlzLmRpc2FibGVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qge2tleUNvZGV9ID0gZXZlbnQ7XG4gICAgY29uc3QgcHJldmlvdXNBY3RpdmVJbmRleCA9IHRoaXMubGlzdEtleU1hbmFnZXIuYWN0aXZlSXRlbUluZGV4O1xuICAgIGNvbnN0IGN0cmxLZXlzID0gWydjdHJsS2V5JywgJ21ldGFLZXknXSBhcyBjb25zdDtcblxuICAgIGlmICh0aGlzLm11bHRpcGxlICYmIGtleUNvZGUgPT09IEEgJiYgaGFzTW9kaWZpZXJLZXkoZXZlbnQsIC4uLmN0cmxLZXlzKSkge1xuICAgICAgLy8gVG9nZ2xlIGFsbCBvcHRpb25zIG9mZiBpZiB0aGV5J3JlIGFsbCBzZWxlY3RlZCwgb3RoZXJ3aXNlIHRvZ2dsZSB0aGVtIGFsbCBvbi5cbiAgICAgIHRoaXMudHJpZ2dlclJhbmdlKFxuICAgICAgICBudWxsLFxuICAgICAgICAwLFxuICAgICAgICB0aGlzLm9wdGlvbnMubGVuZ3RoIC0gMSxcbiAgICAgICAgdGhpcy5vcHRpb25zLmxlbmd0aCAhPT0gdGhpcy52YWx1ZS5sZW5ndGgsXG4gICAgICApO1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoXG4gICAgICB0aGlzLm11bHRpcGxlICYmXG4gICAgICAoa2V5Q29kZSA9PT0gU1BBQ0UgfHwga2V5Q29kZSA9PT0gRU5URVIpICYmXG4gICAgICBoYXNNb2RpZmllcktleShldmVudCwgJ3NoaWZ0S2V5JylcbiAgICApIHtcbiAgICAgIGlmICh0aGlzLmxpc3RLZXlNYW5hZ2VyLmFjdGl2ZUl0ZW0gJiYgdGhpcy5saXN0S2V5TWFuYWdlci5hY3RpdmVJdGVtSW5kZXggIT0gbnVsbCkge1xuICAgICAgICB0aGlzLnRyaWdnZXJSYW5nZShcbiAgICAgICAgICB0aGlzLmxpc3RLZXlNYW5hZ2VyLmFjdGl2ZUl0ZW0sXG4gICAgICAgICAgdGhpcy5fZ2V0TGFzdFRyaWdnZXJlZEluZGV4KCkgPz8gdGhpcy5saXN0S2V5TWFuYWdlci5hY3RpdmVJdGVtSW5kZXgsXG4gICAgICAgICAgdGhpcy5saXN0S2V5TWFuYWdlci5hY3RpdmVJdGVtSW5kZXgsXG4gICAgICAgICAgIXRoaXMubGlzdEtleU1hbmFnZXIuYWN0aXZlSXRlbS5pc1NlbGVjdGVkKCksXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChcbiAgICAgIHRoaXMubXVsdGlwbGUgJiZcbiAgICAgIGtleUNvZGUgPT09IEhPTUUgJiZcbiAgICAgIGhhc01vZGlmaWVyS2V5KGV2ZW50LCAuLi5jdHJsS2V5cykgJiZcbiAgICAgIGhhc01vZGlmaWVyS2V5KGV2ZW50LCAnc2hpZnRLZXknKVxuICAgICkge1xuICAgICAgY29uc3QgdHJpZ2dlciA9IHRoaXMubGlzdEtleU1hbmFnZXIuYWN0aXZlSXRlbTtcbiAgICAgIGlmICh0cmlnZ2VyKSB7XG4gICAgICAgIGNvbnN0IGZyb20gPSB0aGlzLmxpc3RLZXlNYW5hZ2VyLmFjdGl2ZUl0ZW1JbmRleCE7XG4gICAgICAgIHRoaXMubGlzdEtleU1hbmFnZXIuc2V0Rmlyc3RJdGVtQWN0aXZlKCk7XG4gICAgICAgIHRoaXMudHJpZ2dlclJhbmdlKFxuICAgICAgICAgIHRyaWdnZXIsXG4gICAgICAgICAgZnJvbSxcbiAgICAgICAgICB0aGlzLmxpc3RLZXlNYW5hZ2VyLmFjdGl2ZUl0ZW1JbmRleCEsXG4gICAgICAgICAgIXRyaWdnZXIuaXNTZWxlY3RlZCgpLFxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoXG4gICAgICB0aGlzLm11bHRpcGxlICYmXG4gICAgICBrZXlDb2RlID09PSBFTkQgJiZcbiAgICAgIGhhc01vZGlmaWVyS2V5KGV2ZW50LCAuLi5jdHJsS2V5cykgJiZcbiAgICAgIGhhc01vZGlmaWVyS2V5KGV2ZW50LCAnc2hpZnRLZXknKVxuICAgICkge1xuICAgICAgY29uc3QgdHJpZ2dlciA9IHRoaXMubGlzdEtleU1hbmFnZXIuYWN0aXZlSXRlbTtcbiAgICAgIGlmICh0cmlnZ2VyKSB7XG4gICAgICAgIGNvbnN0IGZyb20gPSB0aGlzLmxpc3RLZXlNYW5hZ2VyLmFjdGl2ZUl0ZW1JbmRleCE7XG4gICAgICAgIHRoaXMubGlzdEtleU1hbmFnZXIuc2V0TGFzdEl0ZW1BY3RpdmUoKTtcbiAgICAgICAgdGhpcy50cmlnZ2VyUmFuZ2UoXG4gICAgICAgICAgdHJpZ2dlcixcbiAgICAgICAgICBmcm9tLFxuICAgICAgICAgIHRoaXMubGlzdEtleU1hbmFnZXIuYWN0aXZlSXRlbUluZGV4ISxcbiAgICAgICAgICAhdHJpZ2dlci5pc1NlbGVjdGVkKCksXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChrZXlDb2RlID09PSBTUEFDRSB8fCBrZXlDb2RlID09PSBFTlRFUikge1xuICAgICAgdGhpcy50cmlnZ2VyT3B0aW9uKHRoaXMubGlzdEtleU1hbmFnZXIuYWN0aXZlSXRlbSk7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGlzTmF2S2V5ID1cbiAgICAgIGtleUNvZGUgPT09IFVQX0FSUk9XIHx8XG4gICAgICBrZXlDb2RlID09PSBET1dOX0FSUk9XIHx8XG4gICAgICBrZXlDb2RlID09PSBMRUZUX0FSUk9XIHx8XG4gICAgICBrZXlDb2RlID09PSBSSUdIVF9BUlJPVyB8fFxuICAgICAga2V5Q29kZSA9PT0gSE9NRSB8fFxuICAgICAga2V5Q29kZSA9PT0gRU5EO1xuICAgIHRoaXMubGlzdEtleU1hbmFnZXIub25LZXlkb3duKGV2ZW50KTtcbiAgICAvLyBXaWxsIHNlbGVjdCBhbiBvcHRpb24gaWYgc2hpZnQgd2FzIHByZXNzZWQgd2hpbGUgbmF2aWdhdGluZyB0byB0aGUgb3B0aW9uXG4gICAgaWYgKGlzTmF2S2V5ICYmIGV2ZW50LnNoaWZ0S2V5ICYmIHByZXZpb3VzQWN0aXZlSW5kZXggIT09IHRoaXMubGlzdEtleU1hbmFnZXIuYWN0aXZlSXRlbUluZGV4KSB7XG4gICAgICB0aGlzLnRyaWdnZXJPcHRpb24odGhpcy5saXN0S2V5TWFuYWdlci5hY3RpdmVJdGVtKTtcbiAgICB9XG4gIH1cblxuICAvKiogQ2FsbGVkIHdoZW4gYSBmb2N1cyBtb3ZlcyBpbnRvIHRoZSBsaXN0Ym94LiAqL1xuICBwcm90ZWN0ZWQgX2hhbmRsZUZvY3VzSW4oKSB7XG4gICAgLy8gTm90ZSB0aGF0IHdlIHVzZSBhIGBmb2N1c2luYCBoYW5kbGVyIGZvciB0aGlzIGluc3RlYWQgb2YgdGhlIGV4aXN0aW5nIGBmb2N1c2AgaGFuZGxlcixcbiAgICAvLyBiZWNhdXNlIGZvY3VzIHdvbid0IGxhbmQgb24gdGhlIGxpc3Rib3ggaWYgYHVzZUFjdGl2ZURlc2NlbmRhbnRgIGlzIGVuYWJsZWQuXG4gICAgdGhpcy5faGFzRm9jdXMgPSB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIHRoZSBmb2N1cyBsZWF2ZXMgYW4gZWxlbWVudCBpbiB0aGUgbGlzdGJveC5cbiAgICogQHBhcmFtIGV2ZW50IFRoZSBmb2N1c291dCBldmVudFxuICAgKi9cbiAgcHJvdGVjdGVkIF9oYW5kbGVGb2N1c091dChldmVudDogRm9jdXNFdmVudCkge1xuICAgIC8vIFNvbWUgYnJvd3NlcnMgKGUuZy4gQ2hyb21lIGFuZCBGaXJlZm94KSB0cmlnZ2VyIHRoZSBmb2N1c291dCBldmVudCB3aGVuIHRoZSB1c2VyIHJldHVybnMgYmFjayB0byB0aGUgZG9jdW1lbnQuXG4gICAgLy8gVG8gcHJldmVudCBsb3NpbmcgdGhlIGFjdGl2ZSBvcHRpb24gaW4gdGhpcyBjYXNlLCB3ZSBzdG9yZSBpdCBpbiBgX3ByZXZpb3VzQWN0aXZlT3B0aW9uYCBhbmQgcmVzdG9yZSBpdCBvbiB0aGUgd2luZG93IGBibHVyYCBldmVudFxuICAgIC8vIFRoaXMgZW5zdXJlcyB0aGF0IHRoZSBgYWN0aXZlSXRlbWAgbWF0Y2hlcyB0aGUgYWN0dWFsIGZvY3VzZWQgZWxlbWVudCB3aGVuIHRoZSB1c2VyIHJldHVybnMgdG8gdGhlIGRvY3VtZW50LlxuICAgIHRoaXMuX3ByZXZpb3VzQWN0aXZlT3B0aW9uID0gdGhpcy5saXN0S2V5TWFuYWdlci5hY3RpdmVJdGVtO1xuXG4gICAgY29uc3Qgb3RoZXJFbGVtZW50ID0gZXZlbnQucmVsYXRlZFRhcmdldCBhcyBFbGVtZW50O1xuICAgIGlmICh0aGlzLmVsZW1lbnQgIT09IG90aGVyRWxlbWVudCAmJiAhdGhpcy5lbGVtZW50LmNvbnRhaW5zKG90aGVyRWxlbWVudCkpIHtcbiAgICAgIHRoaXMuX29uVG91Y2hlZCgpO1xuICAgICAgdGhpcy5faGFzRm9jdXMgPSBmYWxzZTtcbiAgICAgIHRoaXMuX3NldE5leHRGb2N1c1RvU2VsZWN0ZWRPcHRpb24oKTtcbiAgICB9XG4gIH1cblxuICAvKiogR2V0IHRoZSBpZCBvZiB0aGUgYWN0aXZlIG9wdGlvbiBpZiBhY3RpdmUgZGVzY2VuZGFudCBpcyBiZWluZyB1c2VkLiAqL1xuICBwcm90ZWN0ZWQgX2dldEFyaWFBY3RpdmVEZXNjZW5kYW50KCk6IHN0cmluZyB8IG51bGwgfCB1bmRlZmluZWQge1xuICAgIHJldHVybiB0aGlzLnVzZUFjdGl2ZURlc2NlbmRhbnQgPyB0aGlzLmxpc3RLZXlNYW5hZ2VyPy5hY3RpdmVJdGVtPy5pZCA6IG51bGw7XG4gIH1cblxuICAvKiogR2V0IHRoZSB0YWJpbmRleCBmb3IgdGhlIGxpc3Rib3guICovXG4gIHByb3RlY3RlZCBfZ2V0VGFiSW5kZXgoKSB7XG4gICAgaWYgKHRoaXMuZGlzYWJsZWQpIHtcbiAgICAgIHJldHVybiAtMTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMudXNlQWN0aXZlRGVzY2VuZGFudCB8fCAhdGhpcy5saXN0S2V5TWFuYWdlci5hY3RpdmVJdGVtID8gdGhpcy5lbmFibGVkVGFiSW5kZXggOiAtMTtcbiAgfVxuXG4gIC8qKiBJbml0aWFsaXplIHRoZSBrZXkgbWFuYWdlci4gKi9cbiAgcHJpdmF0ZSBfaW5pdEtleU1hbmFnZXIoKSB7XG4gICAgdGhpcy5saXN0S2V5TWFuYWdlciA9IG5ldyBBY3RpdmVEZXNjZW5kYW50S2V5TWFuYWdlcih0aGlzLm9wdGlvbnMpXG4gICAgICAud2l0aFdyYXAoIXRoaXMuX25hdmlnYXRpb25XcmFwRGlzYWJsZWQpXG4gICAgICAud2l0aFR5cGVBaGVhZCgpXG4gICAgICAud2l0aEhvbWVBbmRFbmQoKVxuICAgICAgLndpdGhBbGxvd2VkTW9kaWZpZXJLZXlzKFsnc2hpZnRLZXknXSlcbiAgICAgIC5za2lwUHJlZGljYXRlKFxuICAgICAgICB0aGlzLl9uYXZpZ2F0ZURpc2FibGVkT3B0aW9ucyA/IHRoaXMuX3NraXBOb25lUHJlZGljYXRlIDogdGhpcy5fc2tpcERpc2FibGVkUHJlZGljYXRlLFxuICAgICAgKTtcblxuICAgIGlmICh0aGlzLm9yaWVudGF0aW9uID09PSAndmVydGljYWwnKSB7XG4gICAgICB0aGlzLmxpc3RLZXlNYW5hZ2VyLndpdGhWZXJ0aWNhbE9yaWVudGF0aW9uKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubGlzdEtleU1hbmFnZXIud2l0aEhvcml6b250YWxPcmllbnRhdGlvbih0aGlzLl9kaXI/LnZhbHVlIHx8ICdsdHInKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5zZWxlY3Rpb25Nb2RlbC5zZWxlY3RlZC5sZW5ndGgpIHtcbiAgICAgIFByb21pc2UucmVzb2x2ZSgpLnRoZW4oKCkgPT4gdGhpcy5fc2V0TmV4dEZvY3VzVG9TZWxlY3RlZE9wdGlvbigpKTtcbiAgICB9XG5cbiAgICB0aGlzLmxpc3RLZXlNYW5hZ2VyLmNoYW5nZS5zdWJzY3JpYmUoKCkgPT4gdGhpcy5fZm9jdXNBY3RpdmVPcHRpb24oKSk7XG5cbiAgICB0aGlzLm9wdGlvbnMuY2hhbmdlcy5waXBlKHRha2VVbnRpbCh0aGlzLmRlc3Ryb3llZCkpLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICBjb25zdCBhY3RpdmVPcHRpb24gPSB0aGlzLmxpc3RLZXlNYW5hZ2VyLmFjdGl2ZUl0ZW07XG5cbiAgICAgIC8vIElmIHRoZSBhY3RpdmUgb3B0aW9uIHdhcyBkZWxldGVkLCB3ZSBuZWVkIHRvIHJlc2V0XG4gICAgICAvLyB0aGUga2V5IG1hbmFnZXIgc28gaXQgY2FuIGFsbG93IGZvY3VzIGJhY2sgaW4uXG4gICAgICBpZiAoYWN0aXZlT3B0aW9uICYmICF0aGlzLm9wdGlvbnMuZmluZChvcHRpb24gPT4gb3B0aW9uID09PSBhY3RpdmVPcHRpb24pKSB7XG4gICAgICAgIHRoaXMubGlzdEtleU1hbmFnZXIuc2V0QWN0aXZlSXRlbSgtMSk7XG4gICAgICAgIHRoaXMuY2hhbmdlRGV0ZWN0b3JSZWYubWFya0ZvckNoZWNrKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKiogRm9jdXMgdGhlIGFjdGl2ZSBvcHRpb24uICovXG4gIHByaXZhdGUgX2ZvY3VzQWN0aXZlT3B0aW9uKCkge1xuICAgIGlmICghdGhpcy51c2VBY3RpdmVEZXNjZW5kYW50KSB7XG4gICAgICB0aGlzLmxpc3RLZXlNYW5hZ2VyLmFjdGl2ZUl0ZW0/LmZvY3VzKCk7XG4gICAgfVxuICAgIHRoaXMuY2hhbmdlRGV0ZWN0b3JSZWYubWFya0ZvckNoZWNrKCk7XG4gIH1cblxuICAvKipcbiAgICogU2V0IHRoZSBzZWxlY3RlZCB2YWx1ZXMuXG4gICAqIEBwYXJhbSB2YWx1ZSBUaGUgbGlzdCBvZiBuZXcgc2VsZWN0ZWQgdmFsdWVzLlxuICAgKi9cbiAgcHJpdmF0ZSBfc2V0U2VsZWN0aW9uKHZhbHVlOiByZWFkb25seSBUW10pIHtcbiAgICBpZiAodGhpcy5faW52YWxpZCkge1xuICAgICAgdGhpcy5zZWxlY3Rpb25Nb2RlbC5jbGVhcihmYWxzZSk7XG4gICAgfVxuICAgIHRoaXMuc2VsZWN0aW9uTW9kZWwuc2V0U2VsZWN0aW9uKC4uLnRoaXMuX2NvZXJjZVZhbHVlKHZhbHVlKSk7XG5cbiAgICBpZiAoIXRoaXMuX2hhc0ZvY3VzKSB7XG4gICAgICB0aGlzLl9zZXROZXh0Rm9jdXNUb1NlbGVjdGVkT3B0aW9uKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFNldHMgdGhlIGZpcnN0IHNlbGVjdGVkIG9wdGlvbiBhcyBmaXJzdCBpbiB0aGUga2V5Ym9hcmQgZm9jdXMgb3JkZXIuICovXG4gIHByaXZhdGUgX3NldE5leHRGb2N1c1RvU2VsZWN0ZWRPcHRpb24oKSB7XG4gICAgLy8gTnVsbCBjaGVjayB0aGUgb3B0aW9ucyBzaW5jZSB0aGV5IG9ubHkgZ2V0IGRlZmluZWQgYWZ0ZXIgYG5nQWZ0ZXJDb250ZW50SW5pdGAuXG4gICAgY29uc3Qgc2VsZWN0ZWQgPSB0aGlzLm9wdGlvbnM/LmZpbmQob3B0aW9uID0+IG9wdGlvbi5pc1NlbGVjdGVkKCkpO1xuXG4gICAgaWYgKHNlbGVjdGVkKSB7XG4gICAgICB0aGlzLmxpc3RLZXlNYW5hZ2VyLnVwZGF0ZUFjdGl2ZUl0ZW0oc2VsZWN0ZWQpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBVcGRhdGUgdGhlIGludGVybmFsIHZhbHVlIG9mIHRoZSBsaXN0Ym94IGJhc2VkIG9uIHRoZSBzZWxlY3Rpb24gbW9kZWwuICovXG4gIHByaXZhdGUgX3VwZGF0ZUludGVybmFsVmFsdWUoKSB7XG4gICAgY29uc3QgaW5kZXhDYWNoZSA9IG5ldyBNYXA8VCwgbnVtYmVyPigpO1xuICAgIHRoaXMuc2VsZWN0aW9uTW9kZWwuc29ydCgoYTogVCwgYjogVCkgPT4ge1xuICAgICAgY29uc3QgYUluZGV4ID0gdGhpcy5fZ2V0SW5kZXhGb3JWYWx1ZShpbmRleENhY2hlLCBhKTtcbiAgICAgIGNvbnN0IGJJbmRleCA9IHRoaXMuX2dldEluZGV4Rm9yVmFsdWUoaW5kZXhDYWNoZSwgYik7XG4gICAgICByZXR1cm4gYUluZGV4IC0gYkluZGV4O1xuICAgIH0pO1xuICAgIGNvbnN0IHNlbGVjdGVkID0gdGhpcy5zZWxlY3Rpb25Nb2RlbC5zZWxlY3RlZDtcbiAgICB0aGlzLl9pbnZhbGlkID1cbiAgICAgICghdGhpcy5tdWx0aXBsZSAmJiBzZWxlY3RlZC5sZW5ndGggPiAxKSB8fCAhIXRoaXMuX2dldEludmFsaWRPcHRpb25WYWx1ZXMoc2VsZWN0ZWQpLmxlbmd0aDtcbiAgICB0aGlzLmNoYW5nZURldGVjdG9yUmVmLm1hcmtGb3JDaGVjaygpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIGluZGV4IG9mIHRoZSBnaXZlbiB2YWx1ZSBpbiB0aGUgZ2l2ZW4gbGlzdCBvZiBvcHRpb25zLlxuICAgKiBAcGFyYW0gY2FjaGUgVGhlIGNhY2hlIG9mIGluZGljZXMgZm91bmQgc28gZmFyXG4gICAqIEBwYXJhbSB2YWx1ZSBUaGUgdmFsdWUgdG8gZmluZFxuICAgKiBAcmV0dXJuIFRoZSBpbmRleCBvZiB0aGUgdmFsdWUgaW4gdGhlIG9wdGlvbnMgbGlzdFxuICAgKi9cbiAgcHJpdmF0ZSBfZ2V0SW5kZXhGb3JWYWx1ZShjYWNoZTogTWFwPFQsIG51bWJlcj4sIHZhbHVlOiBUKSB7XG4gICAgY29uc3QgaXNFcXVhbCA9IHRoaXMuY29tcGFyZVdpdGggfHwgT2JqZWN0LmlzO1xuICAgIGlmICghY2FjaGUuaGFzKHZhbHVlKSkge1xuICAgICAgbGV0IGluZGV4ID0gLTE7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMub3B0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoaXNFcXVhbCh2YWx1ZSwgdGhpcy5vcHRpb25zLmdldChpKSEudmFsdWUpKSB7XG4gICAgICAgICAgaW5kZXggPSBpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBjYWNoZS5zZXQodmFsdWUsIGluZGV4KTtcbiAgICB9XG4gICAgcmV0dXJuIGNhY2hlLmdldCh2YWx1ZSkhO1xuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZSB0aGUgdXNlciBjbGlja2luZyBhbiBvcHRpb24uXG4gICAqIEBwYXJhbSBvcHRpb24gVGhlIG9wdGlvbiB0aGF0IHdhcyBjbGlja2VkLlxuICAgKi9cbiAgcHJpdmF0ZSBfaGFuZGxlT3B0aW9uQ2xpY2tlZChvcHRpb246IENka09wdGlvbjxUPiwgZXZlbnQ6IE1vdXNlRXZlbnQpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHRoaXMubGlzdEtleU1hbmFnZXIuc2V0QWN0aXZlSXRlbShvcHRpb24pO1xuICAgIGlmIChldmVudC5zaGlmdEtleSAmJiB0aGlzLm11bHRpcGxlKSB7XG4gICAgICB0aGlzLnRyaWdnZXJSYW5nZShcbiAgICAgICAgb3B0aW9uLFxuICAgICAgICB0aGlzLl9nZXRMYXN0VHJpZ2dlcmVkSW5kZXgoKSA/PyB0aGlzLmxpc3RLZXlNYW5hZ2VyLmFjdGl2ZUl0ZW1JbmRleCEsXG4gICAgICAgIHRoaXMubGlzdEtleU1hbmFnZXIuYWN0aXZlSXRlbUluZGV4ISxcbiAgICAgICAgIW9wdGlvbi5pc1NlbGVjdGVkKCksXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnRyaWdnZXJPcHRpb24ob3B0aW9uKTtcbiAgICB9XG4gIH1cblxuICAvKiogVmVyaWZpZXMgdGhhdCBubyB0d28gb3B0aW9ucyByZXByZXNlbnQgdGhlIHNhbWUgdmFsdWUgdW5kZXIgdGhlIGNvbXBhcmVXaXRoIGZ1bmN0aW9uLiAqL1xuICBwcml2YXRlIF92ZXJpZnlOb09wdGlvblZhbHVlQ29sbGlzaW9ucygpIHtcbiAgICB0aGlzLm9wdGlvbnMuY2hhbmdlcy5waXBlKHN0YXJ0V2l0aCh0aGlzLm9wdGlvbnMpLCB0YWtlVW50aWwodGhpcy5kZXN0cm95ZWQpKS5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgY29uc3QgaXNFcXVhbCA9IHRoaXMuY29tcGFyZVdpdGggPz8gT2JqZWN0LmlzO1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLm9wdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3Qgb3B0aW9uID0gdGhpcy5vcHRpb25zLmdldChpKSE7XG4gICAgICAgIGxldCBkdXBsaWNhdGU6IENka09wdGlvbjxUPiB8IG51bGwgPSBudWxsO1xuICAgICAgICBmb3IgKGxldCBqID0gaSArIDE7IGogPCB0aGlzLm9wdGlvbnMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICBjb25zdCBvdGhlciA9IHRoaXMub3B0aW9ucy5nZXQoaikhO1xuICAgICAgICAgIGlmIChpc0VxdWFsKG9wdGlvbi52YWx1ZSwgb3RoZXIudmFsdWUpKSB7XG4gICAgICAgICAgICBkdXBsaWNhdGUgPSBvdGhlcjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoZHVwbGljYXRlKSB7XG4gICAgICAgICAgLy8gVE9ETyhtbWFsZXJiYSk6IExpbmsgdG8gZG9jcyBhYm91dCB0aGlzLlxuICAgICAgICAgIGlmICh0aGlzLmNvbXBhcmVXaXRoKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgICAgICAgIGBGb3VuZCBtdWx0aXBsZSBDZGtPcHRpb24gcmVwcmVzZW50aW5nIHRoZSBzYW1lIHZhbHVlIHVuZGVyIHRoZSBnaXZlbiBjb21wYXJlV2l0aCBmdW5jdGlvbmAsXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBvcHRpb24xOiBvcHRpb24uZWxlbWVudCxcbiAgICAgICAgICAgICAgICBvcHRpb24yOiBkdXBsaWNhdGUuZWxlbWVudCxcbiAgICAgICAgICAgICAgICBjb21wYXJlV2l0aDogdGhpcy5jb21wYXJlV2l0aCxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgRm91bmQgbXVsdGlwbGUgQ2RrT3B0aW9uIHdpdGggdGhlIHNhbWUgdmFsdWVgLCB7XG4gICAgICAgICAgICAgIG9wdGlvbjE6IG9wdGlvbi5lbGVtZW50LFxuICAgICAgICAgICAgICBvcHRpb24yOiBkdXBsaWNhdGUuZWxlbWVudCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBWZXJpZmllcyB0aGF0IHRoZSBvcHRpb24gdmFsdWVzIGFyZSB2YWxpZC4gKi9cbiAgcHJpdmF0ZSBfdmVyaWZ5T3B0aW9uVmFsdWVzKCkge1xuICAgIGlmICh0aGlzLm9wdGlvbnMgJiYgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkpIHtcbiAgICAgIGNvbnN0IHNlbGVjdGVkID0gdGhpcy5zZWxlY3Rpb25Nb2RlbC5zZWxlY3RlZDtcbiAgICAgIGNvbnN0IGludmFsaWRWYWx1ZXMgPSB0aGlzLl9nZXRJbnZhbGlkT3B0aW9uVmFsdWVzKHNlbGVjdGVkKTtcblxuICAgICAgaWYgKCF0aGlzLm11bHRpcGxlICYmIHNlbGVjdGVkLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgdGhyb3cgRXJyb3IoJ0xpc3Rib3ggY2Fubm90IGhhdmUgbW9yZSB0aGFuIG9uZSBzZWxlY3RlZCB2YWx1ZSBpbiBtdWx0aS1zZWxlY3Rpb24gbW9kZS4nKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGludmFsaWRWYWx1ZXMubGVuZ3RoKSB7XG4gICAgICAgIHRocm93IEVycm9yKCdMaXN0Ym94IGhhcyBzZWxlY3RlZCB2YWx1ZXMgdGhhdCBkbyBub3QgbWF0Y2ggYW55IG9mIGl0cyBvcHRpb25zLicpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDb2VyY2VzIGEgdmFsdWUgaW50byBhbiBhcnJheSByZXByZXNlbnRpbmcgYSBsaXN0Ym94IHNlbGVjdGlvbi5cbiAgICogQHBhcmFtIHZhbHVlIFRoZSB2YWx1ZSB0byBjb2VyY2VcbiAgICogQHJldHVybiBBbiBhcnJheVxuICAgKi9cbiAgcHJpdmF0ZSBfY29lcmNlVmFsdWUodmFsdWU6IHJlYWRvbmx5IFRbXSkge1xuICAgIHJldHVybiB2YWx1ZSA9PSBudWxsID8gW10gOiBjb2VyY2VBcnJheSh2YWx1ZSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBzdWJsaXN0IG9mIHZhbHVlcyB0aGF0IGRvIG5vdCByZXByZXNlbnQgdmFsaWQgb3B0aW9uIHZhbHVlcyBpbiB0aGlzIGxpc3Rib3guXG4gICAqIEBwYXJhbSB2YWx1ZXMgVGhlIGxpc3Qgb2YgdmFsdWVzXG4gICAqIEByZXR1cm4gVGhlIHN1Ymxpc3Qgb2YgdmFsdWVzIHRoYXQgYXJlIG5vdCB2YWxpZCBvcHRpb24gdmFsdWVzXG4gICAqL1xuICBwcml2YXRlIF9nZXRJbnZhbGlkT3B0aW9uVmFsdWVzKHZhbHVlczogcmVhZG9ubHkgVFtdKSB7XG4gICAgY29uc3QgaXNFcXVhbCA9IHRoaXMuY29tcGFyZVdpdGggfHwgT2JqZWN0LmlzO1xuICAgIGNvbnN0IHZhbGlkVmFsdWVzID0gKHRoaXMub3B0aW9ucyB8fCBbXSkubWFwKG9wdGlvbiA9PiBvcHRpb24udmFsdWUpO1xuICAgIHJldHVybiB2YWx1ZXMuZmlsdGVyKHZhbHVlID0+ICF2YWxpZFZhbHVlcy5zb21lKHZhbGlkVmFsdWUgPT4gaXNFcXVhbCh2YWx1ZSwgdmFsaWRWYWx1ZSkpKTtcbiAgfVxuXG4gIC8qKiBHZXQgdGhlIGluZGV4IG9mIHRoZSBsYXN0IHRyaWdnZXJlZCBvcHRpb24uICovXG4gIHByaXZhdGUgX2dldExhc3RUcmlnZ2VyZWRJbmRleCgpIHtcbiAgICBjb25zdCBpbmRleCA9IHRoaXMub3B0aW9ucy50b0FycmF5KCkuaW5kZXhPZih0aGlzLl9sYXN0VHJpZ2dlcmVkISk7XG4gICAgcmV0dXJuIGluZGV4ID09PSAtMSA/IG51bGwgOiBpbmRleDtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgcHJldmlvdXMgYWN0aXZlIG9wdGlvbiBhcyBhY3RpdmUgb3B0aW9uIG9uIHdpbmRvdyBibHVyLlxuICAgKiBUaGlzIGVuc3VyZXMgdGhhdCB0aGUgYGFjdGl2ZU9wdGlvbmAgbWF0Y2hlcyB0aGUgYWN0dWFsIGZvY3VzZWQgZWxlbWVudCB3aGVuIHRoZSB1c2VyIHJldHVybnMgdG8gdGhlIGRvY3VtZW50LlxuICAgKi9cbiAgcHJpdmF0ZSBfc2V0UHJldmlvdXNBY3RpdmVPcHRpb25Bc0FjdGl2ZU9wdGlvbk9uV2luZG93Qmx1cigpIHtcbiAgICB0aGlzLm5nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICBmcm9tRXZlbnQod2luZG93LCAnYmx1cicpXG4gICAgICAgIC5waXBlKHRha2VVbnRpbCh0aGlzLmRlc3Ryb3llZCkpXG4gICAgICAgIC5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICAgIGlmICh0aGlzLmVsZW1lbnQuY29udGFpbnMoZG9jdW1lbnQuYWN0aXZlRWxlbWVudCkgJiYgdGhpcy5fcHJldmlvdXNBY3RpdmVPcHRpb24pIHtcbiAgICAgICAgICAgIHRoaXMuX3NldEFjdGl2ZU9wdGlvbih0aGlzLl9wcmV2aW91c0FjdGl2ZU9wdGlvbik7XG4gICAgICAgICAgICB0aGlzLl9wcmV2aW91c0FjdGl2ZU9wdGlvbiA9IG51bGw7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9KTtcbiAgfVxufVxuXG4vKiogQ2hhbmdlIGV2ZW50IHRoYXQgaXMgZmlyZWQgd2hlbmV2ZXIgdGhlIHZhbHVlIG9mIHRoZSBsaXN0Ym94IGNoYW5nZXMuICovXG5leHBvcnQgaW50ZXJmYWNlIExpc3Rib3hWYWx1ZUNoYW5nZUV2ZW50PFQ+IHtcbiAgLyoqIFRoZSBuZXcgdmFsdWUgb2YgdGhlIGxpc3Rib3guICovXG4gIHJlYWRvbmx5IHZhbHVlOiByZWFkb25seSBUW107XG5cbiAgLyoqIFJlZmVyZW5jZSB0byB0aGUgbGlzdGJveCB0aGF0IGVtaXR0ZWQgdGhlIGV2ZW50LiAqL1xuICByZWFkb25seSBsaXN0Ym94OiBDZGtMaXN0Ym94PFQ+O1xuXG4gIC8qKiBSZWZlcmVuY2UgdG8gdGhlIG9wdGlvbiB0aGF0IHdhcyB0cmlnZ2VyZWQuICovXG4gIHJlYWRvbmx5IG9wdGlvbjogQ2RrT3B0aW9uPFQ+IHwgbnVsbDtcbn1cbiJdfQ==