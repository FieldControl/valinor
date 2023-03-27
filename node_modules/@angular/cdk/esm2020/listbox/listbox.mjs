/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ChangeDetectorRef, ContentChildren, Directive, ElementRef, forwardRef, inject, Input, Output, QueryList, } from '@angular/core';
import { ActiveDescendantKeyManager } from '@angular/cdk/a11y';
import { A, DOWN_ARROW, END, ENTER, hasModifierKey, HOME, LEFT_ARROW, RIGHT_ARROW, SPACE, UP_ARROW, } from '@angular/cdk/keycodes';
import { coerceArray, coerceBooleanProperty } from '@angular/cdk/coercion';
import { SelectionModel } from '@angular/cdk/collections';
import { defer, merge, Subject } from 'rxjs';
import { filter, map, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Directionality } from '@angular/cdk/bidi';
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
        this._disabled = coerceBooleanProperty(value);
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
}
CdkOption.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: CdkOption, deps: [], target: i0.ɵɵFactoryTarget.Directive });
CdkOption.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "15.2.0-rc.0", type: CdkOption, isStandalone: true, selector: "[cdkOption]", inputs: { id: "id", value: ["cdkOption", "value"], typeaheadLabel: ["cdkOptionTypeaheadLabel", "typeaheadLabel"], disabled: ["cdkOptionDisabled", "disabled"], enabledTabIndex: ["tabindex", "enabledTabIndex"] }, host: { attributes: { "role": "option" }, listeners: { "click": "_clicked.next($event)", "focus": "_handleFocus()" }, properties: { "id": "id", "attr.aria-selected": "isSelected()", "attr.tabindex": "_getTabIndex()", "attr.aria-disabled": "disabled", "class.cdk-option-active": "isActive()" }, classAttribute: "cdk-option" }, exportAs: ["cdkOption"], ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: CdkOption, decorators: [{
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
                args: ['cdkOptionDisabled']
            }], enabledTabIndex: [{
                type: Input,
                args: ['tabindex']
            }] } });
export class CdkListbox {
    constructor() {
        this._generatedId = `cdk-listbox-${nextId++}`;
        this._disabled = false;
        this._useActiveDescendant = false;
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
        /** A predicate that skips disabled options. */
        this._skipDisabledPredicate = (option) => option.disabled;
        /** A predicate that does not skip any options. */
        this._skipNonePredicate = () => false;
        /** Whether the listbox currently has focus. */
        this._hasFocus = false;
    }
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
        this.selectionModel.multiple = coerceBooleanProperty(value);
        if (this.options) {
            this._updateInternalValue();
        }
    }
    /** Whether the listbox is disabled. */
    get disabled() {
        return this._disabled;
    }
    set disabled(value) {
        this._disabled = coerceBooleanProperty(value);
    }
    /** Whether the listbox will use active descendant or will move focus onto the options. */
    get useActiveDescendant() {
        return this._useActiveDescendant;
    }
    set useActiveDescendant(shouldUseActiveDescendant) {
        this._useActiveDescendant = coerceBooleanProperty(shouldUseActiveDescendant);
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
        this._navigationWrapDisabled = coerceBooleanProperty(wrap);
        this.listKeyManager?.withWrap(!this._navigationWrapDisabled);
    }
    /** Whether keyboard navigation should skip over disabled items. */
    get navigateDisabledOptions() {
        return this._navigateDisabledOptions;
    }
    set navigateDisabledOptions(skip) {
        this._navigateDisabledOptions = coerceBooleanProperty(skip);
        this.listKeyManager?.skipPredicate(this._navigateDisabledOptions ? this._skipNonePredicate : this._skipDisabledPredicate);
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
        if (this._disabled) {
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
        const otherElement = event.relatedTarget;
        if (this.element !== otherElement && !this.element.contains(otherElement)) {
            this._onTouched();
            this._hasFocus = false;
            this._setNextFocusToSelectedOption();
        }
    }
    /** Get the id of the active option if active descendant is being used. */
    _getAriaActiveDescendant() {
        return this._useActiveDescendant ? this.listKeyManager?.activeItem?.id : null;
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
}
CdkListbox.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: CdkListbox, deps: [], target: i0.ɵɵFactoryTarget.Directive });
CdkListbox.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "15.2.0-rc.0", type: CdkListbox, isStandalone: true, selector: "[cdkListbox]", inputs: { id: "id", enabledTabIndex: ["tabindex", "enabledTabIndex"], value: ["cdkListboxValue", "value"], multiple: ["cdkListboxMultiple", "multiple"], disabled: ["cdkListboxDisabled", "disabled"], useActiveDescendant: ["cdkListboxUseActiveDescendant", "useActiveDescendant"], orientation: ["cdkListboxOrientation", "orientation"], compareWith: ["cdkListboxCompareWith", "compareWith"], navigationWrapDisabled: ["cdkListboxNavigationWrapDisabled", "navigationWrapDisabled"], navigateDisabledOptions: ["cdkListboxNavigatesDisabledOptions", "navigateDisabledOptions"] }, outputs: { valueChange: "cdkListboxValueChange" }, host: { attributes: { "role": "listbox" }, listeners: { "focus": "_handleFocus()", "keydown": "_handleKeydown($event)", "focusout": "_handleFocusOut($event)", "focusin": "_handleFocusIn()" }, properties: { "id": "id", "attr.tabindex": "_getTabIndex()", "attr.aria-disabled": "disabled", "attr.aria-multiselectable": "multiple", "attr.aria-activedescendant": "_getAriaActiveDescendant()", "attr.aria-orientation": "orientation" }, classAttribute: "cdk-listbox" }, providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => CdkListbox),
            multi: true,
        },
    ], queries: [{ propertyName: "options", predicate: CdkOption, descendants: true }], exportAs: ["cdkListbox"], ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: CdkListbox, decorators: [{
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
        }], propDecorators: { id: [{
                type: Input
            }], enabledTabIndex: [{
                type: Input,
                args: ['tabindex']
            }], value: [{
                type: Input,
                args: ['cdkListboxValue']
            }], multiple: [{
                type: Input,
                args: ['cdkListboxMultiple']
            }], disabled: [{
                type: Input,
                args: ['cdkListboxDisabled']
            }], useActiveDescendant: [{
                type: Input,
                args: ['cdkListboxUseActiveDescendant']
            }], orientation: [{
                type: Input,
                args: ['cdkListboxOrientation']
            }], compareWith: [{
                type: Input,
                args: ['cdkListboxCompareWith']
            }], navigationWrapDisabled: [{
                type: Input,
                args: ['cdkListboxNavigationWrapDisabled']
            }], navigateDisabledOptions: [{
                type: Input,
                args: ['cdkListboxNavigatesDisabledOptions']
            }], valueChange: [{
                type: Output,
                args: ['cdkListboxValueChange']
            }], options: [{
                type: ContentChildren,
                args: [CdkOption, { descendants: true }]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdGJveC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvbGlzdGJveC9saXN0Ym94LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFFTCxpQkFBaUIsRUFDakIsZUFBZSxFQUNmLFNBQVMsRUFDVCxVQUFVLEVBQ1YsVUFBVSxFQUNWLE1BQU0sRUFDTixLQUFLLEVBRUwsTUFBTSxFQUNOLFNBQVMsR0FDVixNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUMsMEJBQTBCLEVBQXNDLE1BQU0sbUJBQW1CLENBQUM7QUFDbEcsT0FBTyxFQUNMLENBQUMsRUFDRCxVQUFVLEVBQ1YsR0FBRyxFQUNILEtBQUssRUFDTCxjQUFjLEVBQ2QsSUFBSSxFQUNKLFVBQVUsRUFDVixXQUFXLEVBQ1gsS0FBSyxFQUNMLFFBQVEsR0FDVCxNQUFNLHVCQUF1QixDQUFDO0FBQy9CLE9BQU8sRUFBZSxXQUFXLEVBQUUscUJBQXFCLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUN2RixPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sMEJBQTBCLENBQUM7QUFDeEQsT0FBTyxFQUFDLEtBQUssRUFBRSxLQUFLLEVBQWMsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQ3ZELE9BQU8sRUFBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDNUUsT0FBTyxFQUF1QixpQkFBaUIsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQ3ZFLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQzs7QUFFakQsc0RBQXNEO0FBQ3RELElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQztBQUVmOzs7Ozs7O0dBT0c7QUFDSCxNQUFNLHFCQUF5QixTQUFRLGNBQWlCO0lBQ3RELFlBQ1MsV0FBVyxLQUFLLEVBQ3ZCLHVCQUE2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UTtzQkFEWCxLQUFLO3VCQUFDLG9CQUFvQjtnQkFXdkIsbUJBQW1CO3NCQUR0QixLQUFLO3VCQUFDLCtCQUErQjtnQkFXbEMsV0FBVztzQkFEZCxLQUFLO3VCQUFDLHVCQUF1QjtnQkFnQjFCLFdBQVc7c0JBRGQsS0FBSzt1QkFBQyx1QkFBdUI7Z0JBYTFCLHNCQUFzQjtzQkFEekIsS0FBSzt1QkFBQyxrQ0FBa0M7Z0JBWXJDLHVCQUF1QjtzQkFEMUIsS0FBSzt1QkFBQyxvQ0FBb0M7Z0JBYUQsV0FBVztzQkFBcEQsTUFBTTt1QkFBQyx1QkFBdUI7Z0JBRzRCLE9BQU87c0JBQWpFLGVBQWU7dUJBQUMsU0FBUyxFQUFFLEVBQUMsV0FBVyxFQUFFLElBQUksRUFBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1xuICBBZnRlckNvbnRlbnRJbml0LFxuICBDaGFuZ2VEZXRlY3RvclJlZixcbiAgQ29udGVudENoaWxkcmVuLFxuICBEaXJlY3RpdmUsXG4gIEVsZW1lbnRSZWYsXG4gIGZvcndhcmRSZWYsXG4gIGluamVjdCxcbiAgSW5wdXQsXG4gIE9uRGVzdHJveSxcbiAgT3V0cHV0LFxuICBRdWVyeUxpc3QsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtBY3RpdmVEZXNjZW5kYW50S2V5TWFuYWdlciwgSGlnaGxpZ2h0YWJsZSwgTGlzdEtleU1hbmFnZXJPcHRpb259IGZyb20gJ0Bhbmd1bGFyL2Nkay9hMTF5JztcbmltcG9ydCB7XG4gIEEsXG4gIERPV05fQVJST1csXG4gIEVORCxcbiAgRU5URVIsXG4gIGhhc01vZGlmaWVyS2V5LFxuICBIT01FLFxuICBMRUZUX0FSUk9XLFxuICBSSUdIVF9BUlJPVyxcbiAgU1BBQ0UsXG4gIFVQX0FSUk9XLFxufSBmcm9tICdAYW5ndWxhci9jZGsva2V5Y29kZXMnO1xuaW1wb3J0IHtCb29sZWFuSW5wdXQsIGNvZXJjZUFycmF5LCBjb2VyY2VCb29sZWFuUHJvcGVydHl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2VyY2lvbic7XG5pbXBvcnQge1NlbGVjdGlvbk1vZGVsfSBmcm9tICdAYW5ndWxhci9jZGsvY29sbGVjdGlvbnMnO1xuaW1wb3J0IHtkZWZlciwgbWVyZ2UsIE9ic2VydmFibGUsIFN1YmplY3R9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtmaWx0ZXIsIG1hcCwgc3RhcnRXaXRoLCBzd2l0Y2hNYXAsIHRha2VVbnRpbH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0IHtDb250cm9sVmFsdWVBY2Nlc3NvciwgTkdfVkFMVUVfQUNDRVNTT1J9IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcbmltcG9ydCB7RGlyZWN0aW9uYWxpdHl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9iaWRpJztcblxuLyoqIFRoZSBuZXh0IGlkIHRvIHVzZSBmb3IgY3JlYXRpbmcgdW5pcXVlIERPTSBJRHMuICovXG5sZXQgbmV4dElkID0gMDtcblxuLyoqXG4gKiBBbiBpbXBsZW1lbnRhdGlvbiBvZiBTZWxlY3Rpb25Nb2RlbCB0aGF0IGludGVybmFsbHkgYWx3YXlzIHJlcHJlc2VudHMgdGhlIHNlbGVjdGlvbiBhcyBhXG4gKiBtdWx0aS1zZWxlY3Rpb24uIFRoaXMgaXMgbmVjZXNzYXJ5IHNvIHRoYXQgd2UgY2FuIHJlY292ZXIgdGhlIGZ1bGwgc2VsZWN0aW9uIGlmIHRoZSB1c2VyXG4gKiBzd2l0Y2hlcyB0aGUgbGlzdGJveCBmcm9tIHNpbmdsZS1zZWxlY3Rpb24gdG8gbXVsdGktc2VsZWN0aW9uIGFmdGVyIGluaXRpYWxpemF0aW9uLlxuICpcbiAqIFRoaXMgc2VsZWN0aW9uIG1vZGVsIG1heSByZXBvcnQgbXVsdGlwbGUgc2VsZWN0ZWQgdmFsdWVzLCBldmVuIGlmIGl0IGlzIGluIHNpbmdsZS1zZWxlY3Rpb25cbiAqIG1vZGUuIEl0IGlzIHVwIHRvIHRoZSB1c2VyIChDZGtMaXN0Ym94KSB0byBjaGVjayBmb3IgaW52YWxpZCBzZWxlY3Rpb25zLlxuICovXG5jbGFzcyBMaXN0Ym94U2VsZWN0aW9uTW9kZWw8VD4gZXh0ZW5kcyBTZWxlY3Rpb25Nb2RlbDxUPiB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyBtdWx0aXBsZSA9IGZhbHNlLFxuICAgIGluaXRpYWxseVNlbGVjdGVkVmFsdWVzPzogVFtdLFxuICAgIGVtaXRDaGFuZ2VzID0gdHJ1ZSxcbiAgICBjb21wYXJlV2l0aD86IChvMTogVCwgbzI6IFQpID0+IGJvb2xlYW4sXG4gICkge1xuICAgIHN1cGVyKHRydWUsIGluaXRpYWxseVNlbGVjdGVkVmFsdWVzLCBlbWl0Q2hhbmdlcywgY29tcGFyZVdpdGgpO1xuICB9XG5cbiAgb3ZlcnJpZGUgaXNNdWx0aXBsZVNlbGVjdGlvbigpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5tdWx0aXBsZTtcbiAgfVxuXG4gIG92ZXJyaWRlIHNlbGVjdCguLi52YWx1ZXM6IFRbXSkge1xuICAgIC8vIFRoZSBzdXBlciBjbGFzcyBpcyBhbHdheXMgaW4gbXVsdGktc2VsZWN0aW9uIG1vZGUsIHNvIHdlIG5lZWQgdG8gb3ZlcnJpZGUgdGhlIGJlaGF2aW9yIGlmXG4gICAgLy8gdGhpcyBzZWxlY3Rpb24gbW9kZWwgYWN0dWFsbHkgYmVsb25ncyB0byBhIHNpbmdsZS1zZWxlY3Rpb24gbGlzdGJveC5cbiAgICBpZiAodGhpcy5tdWx0aXBsZSkge1xuICAgICAgcmV0dXJuIHN1cGVyLnNlbGVjdCguLi52YWx1ZXMpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gc3VwZXIuc2V0U2VsZWN0aW9uKC4uLnZhbHVlcyk7XG4gICAgfVxuICB9XG59XG5cbi8qKiBBIHNlbGVjdGFibGUgb3B0aW9uIGluIGEgbGlzdGJveC4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tjZGtPcHRpb25dJyxcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbiAgZXhwb3J0QXM6ICdjZGtPcHRpb24nLFxuICBob3N0OiB7XG4gICAgJ3JvbGUnOiAnb3B0aW9uJyxcbiAgICAnY2xhc3MnOiAnY2RrLW9wdGlvbicsXG4gICAgJ1tpZF0nOiAnaWQnLFxuICAgICdbYXR0ci5hcmlhLXNlbGVjdGVkXSc6ICdpc1NlbGVjdGVkKCknLFxuICAgICdbYXR0ci50YWJpbmRleF0nOiAnX2dldFRhYkluZGV4KCknLFxuICAgICdbYXR0ci5hcmlhLWRpc2FibGVkXSc6ICdkaXNhYmxlZCcsXG4gICAgJ1tjbGFzcy5jZGstb3B0aW9uLWFjdGl2ZV0nOiAnaXNBY3RpdmUoKScsXG4gICAgJyhjbGljayknOiAnX2NsaWNrZWQubmV4dCgkZXZlbnQpJyxcbiAgICAnKGZvY3VzKSc6ICdfaGFuZGxlRm9jdXMoKScsXG4gIH0sXG59KVxuZXhwb3J0IGNsYXNzIENka09wdGlvbjxUID0gdW5rbm93bj4gaW1wbGVtZW50cyBMaXN0S2V5TWFuYWdlck9wdGlvbiwgSGlnaGxpZ2h0YWJsZSwgT25EZXN0cm95IHtcbiAgLyoqIFRoZSBpZCBvZiB0aGUgb3B0aW9uJ3MgaG9zdCBlbGVtZW50LiAqL1xuICBASW5wdXQoKVxuICBnZXQgaWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2lkIHx8IHRoaXMuX2dlbmVyYXRlZElkO1xuICB9XG4gIHNldCBpZCh2YWx1ZSkge1xuICAgIHRoaXMuX2lkID0gdmFsdWU7XG4gIH1cbiAgcHJpdmF0ZSBfaWQ6IHN0cmluZztcbiAgcHJpdmF0ZSBfZ2VuZXJhdGVkSWQgPSBgY2RrLW9wdGlvbi0ke25leHRJZCsrfWA7XG5cbiAgLyoqIFRoZSB2YWx1ZSBvZiB0aGlzIG9wdGlvbi4gKi9cbiAgQElucHV0KCdjZGtPcHRpb24nKSB2YWx1ZTogVDtcblxuICAvKipcbiAgICogVGhlIHRleHQgdXNlZCB0byBsb2NhdGUgdGhpcyBpdGVtIGR1cmluZyBsaXN0Ym94IHR5cGVhaGVhZC4gSWYgbm90IHNwZWNpZmllZCxcbiAgICogdGhlIGB0ZXh0Q29udGVudGAgb2YgdGhlIGl0ZW0gd2lsbCBiZSB1c2VkLlxuICAgKi9cbiAgQElucHV0KCdjZGtPcHRpb25UeXBlYWhlYWRMYWJlbCcpIHR5cGVhaGVhZExhYmVsOiBzdHJpbmc7XG5cbiAgLyoqIFdoZXRoZXIgdGhpcyBvcHRpb24gaXMgZGlzYWJsZWQuICovXG4gIEBJbnB1dCgnY2RrT3B0aW9uRGlzYWJsZWQnKVxuICBnZXQgZGlzYWJsZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMubGlzdGJveC5kaXNhYmxlZCB8fCB0aGlzLl9kaXNhYmxlZDtcbiAgfVxuICBzZXQgZGlzYWJsZWQodmFsdWU6IEJvb2xlYW5JbnB1dCkge1xuICAgIHRoaXMuX2Rpc2FibGVkID0gY29lcmNlQm9vbGVhblByb3BlcnR5KHZhbHVlKTtcbiAgfVxuICBwcml2YXRlIF9kaXNhYmxlZDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIC8qKiBUaGUgdGFiaW5kZXggb2YgdGhlIG9wdGlvbiB3aGVuIGl0IGlzIGVuYWJsZWQuICovXG4gIEBJbnB1dCgndGFiaW5kZXgnKVxuICBnZXQgZW5hYmxlZFRhYkluZGV4KCkge1xuICAgIHJldHVybiB0aGlzLl9lbmFibGVkVGFiSW5kZXggPT09IHVuZGVmaW5lZFxuICAgICAgPyB0aGlzLmxpc3Rib3guZW5hYmxlZFRhYkluZGV4XG4gICAgICA6IHRoaXMuX2VuYWJsZWRUYWJJbmRleDtcbiAgfVxuICBzZXQgZW5hYmxlZFRhYkluZGV4KHZhbHVlKSB7XG4gICAgdGhpcy5fZW5hYmxlZFRhYkluZGV4ID0gdmFsdWU7XG4gIH1cbiAgcHJpdmF0ZSBfZW5hYmxlZFRhYkluZGV4PzogbnVtYmVyIHwgbnVsbDtcblxuICAvKiogVGhlIG9wdGlvbidzIGhvc3QgZWxlbWVudCAqL1xuICByZWFkb25seSBlbGVtZW50OiBIVE1MRWxlbWVudCA9IGluamVjdChFbGVtZW50UmVmKS5uYXRpdmVFbGVtZW50O1xuXG4gIC8qKiBUaGUgcGFyZW50IGxpc3Rib3ggdGhpcyBvcHRpb24gYmVsb25ncyB0by4gKi9cbiAgcHJvdGVjdGVkIHJlYWRvbmx5IGxpc3Rib3g6IENka0xpc3Rib3g8VD4gPSBpbmplY3QoQ2RrTGlzdGJveCk7XG5cbiAgLyoqIEVtaXRzIHdoZW4gdGhlIG9wdGlvbiBpcyBkZXN0cm95ZWQuICovXG4gIHByb3RlY3RlZCBkZXN0cm95ZWQgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xuXG4gIC8qKiBFbWl0cyB3aGVuIHRoZSBvcHRpb24gaXMgY2xpY2tlZC4gKi9cbiAgcmVhZG9ubHkgX2NsaWNrZWQgPSBuZXcgU3ViamVjdDxNb3VzZUV2ZW50PigpO1xuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIHRoaXMuZGVzdHJveWVkLm5leHQoKTtcbiAgICB0aGlzLmRlc3Ryb3llZC5jb21wbGV0ZSgpO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhpcyBvcHRpb24gaXMgc2VsZWN0ZWQuICovXG4gIGlzU2VsZWN0ZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMubGlzdGJveC5pc1NlbGVjdGVkKHRoaXMpO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhpcyBvcHRpb24gaXMgYWN0aXZlLiAqL1xuICBpc0FjdGl2ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5saXN0Ym94LmlzQWN0aXZlKHRoaXMpO1xuICB9XG5cbiAgLyoqIFRvZ2dsZSB0aGUgc2VsZWN0ZWQgc3RhdGUgb2YgdGhpcyBvcHRpb24uICovXG4gIHRvZ2dsZSgpIHtcbiAgICB0aGlzLmxpc3Rib3gudG9nZ2xlKHRoaXMpO1xuICB9XG5cbiAgLyoqIFNlbGVjdCB0aGlzIG9wdGlvbiBpZiBpdCBpcyBub3Qgc2VsZWN0ZWQuICovXG4gIHNlbGVjdCgpIHtcbiAgICB0aGlzLmxpc3Rib3guc2VsZWN0KHRoaXMpO1xuICB9XG5cbiAgLyoqIERlc2VsZWN0IHRoaXMgb3B0aW9uIGlmIGl0IGlzIHNlbGVjdGVkLiAqL1xuICBkZXNlbGVjdCgpIHtcbiAgICB0aGlzLmxpc3Rib3guZGVzZWxlY3QodGhpcyk7XG4gIH1cblxuICAvKiogRm9jdXMgdGhpcyBvcHRpb24uICovXG4gIGZvY3VzKCkge1xuICAgIHRoaXMuZWxlbWVudC5mb2N1cygpO1xuICB9XG5cbiAgLyoqIEdldCB0aGUgbGFiZWwgZm9yIHRoaXMgZWxlbWVudCB3aGljaCBpcyByZXF1aXJlZCBieSB0aGUgRm9jdXNhYmxlT3B0aW9uIGludGVyZmFjZS4gKi9cbiAgZ2V0TGFiZWwoKSB7XG4gICAgcmV0dXJuICh0aGlzLnR5cGVhaGVhZExhYmVsID8/IHRoaXMuZWxlbWVudC50ZXh0Q29udGVudD8udHJpbSgpKSB8fCAnJztcbiAgfVxuXG4gIC8qKlxuICAgKiBOby1vcCBpbXBsZW1lbnRlZCBhcyBhIHBhcnQgb2YgYEhpZ2hsaWdodGFibGVgLlxuICAgKiBAZG9jcy1wcml2YXRlXG4gICAqL1xuICBzZXRBY3RpdmVTdHlsZXMoKSB7fVxuXG4gIC8qKlxuICAgKiBOby1vcCBpbXBsZW1lbnRlZCBhcyBhIHBhcnQgb2YgYEhpZ2hsaWdodGFibGVgLlxuICAgKiBAZG9jcy1wcml2YXRlXG4gICAqL1xuICBzZXRJbmFjdGl2ZVN0eWxlcygpIHt9XG5cbiAgLyoqIEhhbmRsZSBmb2N1cyBldmVudHMgb24gdGhlIG9wdGlvbi4gKi9cbiAgcHJvdGVjdGVkIF9oYW5kbGVGb2N1cygpIHtcbiAgICAvLyBPcHRpb25zIGNhbiB3aW5kIHVwIGdldHRpbmcgZm9jdXNlZCBpbiBhY3RpdmUgZGVzY2VuZGFudCBtb2RlIGlmIHRoZSB1c2VyIGNsaWNrcyBvbiB0aGVtLlxuICAgIC8vIEluIHRoaXMgY2FzZSwgd2UgcHVzaCBmb2N1cyBiYWNrIHRvIHRoZSBwYXJlbnQgbGlzdGJveCB0byBwcmV2ZW50IGFuIGV4dHJhIHRhYiBzdG9wIHdoZW5cbiAgICAvLyB0aGUgdXNlciBwZXJmb3JtcyBhIHNoaWZ0K3RhYi5cbiAgICBpZiAodGhpcy5saXN0Ym94LnVzZUFjdGl2ZURlc2NlbmRhbnQpIHtcbiAgICAgIHRoaXMubGlzdGJveC5fc2V0QWN0aXZlT3B0aW9uKHRoaXMpO1xuICAgICAgdGhpcy5saXN0Ym94LmZvY3VzKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEdldCB0aGUgdGFiaW5kZXggZm9yIHRoaXMgb3B0aW9uLiAqL1xuICBwcm90ZWN0ZWQgX2dldFRhYkluZGV4KCkge1xuICAgIGlmICh0aGlzLmxpc3Rib3gudXNlQWN0aXZlRGVzY2VuZGFudCB8fCB0aGlzLmRpc2FibGVkKSB7XG4gICAgICByZXR1cm4gLTE7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmlzQWN0aXZlKCkgPyB0aGlzLmVuYWJsZWRUYWJJbmRleCA6IC0xO1xuICB9XG59XG5cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tjZGtMaXN0Ym94XScsXG4gIHN0YW5kYWxvbmU6IHRydWUsXG4gIGV4cG9ydEFzOiAnY2RrTGlzdGJveCcsXG4gIGhvc3Q6IHtcbiAgICAncm9sZSc6ICdsaXN0Ym94JyxcbiAgICAnY2xhc3MnOiAnY2RrLWxpc3Rib3gnLFxuICAgICdbaWRdJzogJ2lkJyxcbiAgICAnW2F0dHIudGFiaW5kZXhdJzogJ19nZXRUYWJJbmRleCgpJyxcbiAgICAnW2F0dHIuYXJpYS1kaXNhYmxlZF0nOiAnZGlzYWJsZWQnLFxuICAgICdbYXR0ci5hcmlhLW11bHRpc2VsZWN0YWJsZV0nOiAnbXVsdGlwbGUnLFxuICAgICdbYXR0ci5hcmlhLWFjdGl2ZWRlc2NlbmRhbnRdJzogJ19nZXRBcmlhQWN0aXZlRGVzY2VuZGFudCgpJyxcbiAgICAnW2F0dHIuYXJpYS1vcmllbnRhdGlvbl0nOiAnb3JpZW50YXRpb24nLFxuICAgICcoZm9jdXMpJzogJ19oYW5kbGVGb2N1cygpJyxcbiAgICAnKGtleWRvd24pJzogJ19oYW5kbGVLZXlkb3duKCRldmVudCknLFxuICAgICcoZm9jdXNvdXQpJzogJ19oYW5kbGVGb2N1c091dCgkZXZlbnQpJyxcbiAgICAnKGZvY3VzaW4pJzogJ19oYW5kbGVGb2N1c0luKCknLFxuICB9LFxuICBwcm92aWRlcnM6IFtcbiAgICB7XG4gICAgICBwcm92aWRlOiBOR19WQUxVRV9BQ0NFU1NPUixcbiAgICAgIHVzZUV4aXN0aW5nOiBmb3J3YXJkUmVmKCgpID0+IENka0xpc3Rib3gpLFxuICAgICAgbXVsdGk6IHRydWUsXG4gICAgfSxcbiAgXSxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrTGlzdGJveDxUID0gdW5rbm93bj4gaW1wbGVtZW50cyBBZnRlckNvbnRlbnRJbml0LCBPbkRlc3Ryb3ksIENvbnRyb2xWYWx1ZUFjY2Vzc29yIHtcbiAgLyoqIFRoZSBpZCBvZiB0aGUgb3B0aW9uJ3MgaG9zdCBlbGVtZW50LiAqL1xuICBASW5wdXQoKVxuICBnZXQgaWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2lkIHx8IHRoaXMuX2dlbmVyYXRlZElkO1xuICB9XG4gIHNldCBpZCh2YWx1ZSkge1xuICAgIHRoaXMuX2lkID0gdmFsdWU7XG4gIH1cbiAgcHJpdmF0ZSBfaWQ6IHN0cmluZztcbiAgcHJpdmF0ZSBfZ2VuZXJhdGVkSWQgPSBgY2RrLWxpc3Rib3gtJHtuZXh0SWQrK31gO1xuXG4gIC8qKiBUaGUgdGFiaW5kZXggdG8gdXNlIHdoZW4gdGhlIGxpc3Rib3ggaXMgZW5hYmxlZC4gKi9cbiAgQElucHV0KCd0YWJpbmRleCcpXG4gIGdldCBlbmFibGVkVGFiSW5kZXgoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2VuYWJsZWRUYWJJbmRleCA9PT0gdW5kZWZpbmVkID8gMCA6IHRoaXMuX2VuYWJsZWRUYWJJbmRleDtcbiAgfVxuICBzZXQgZW5hYmxlZFRhYkluZGV4KHZhbHVlKSB7XG4gICAgdGhpcy5fZW5hYmxlZFRhYkluZGV4ID0gdmFsdWU7XG4gIH1cbiAgcHJpdmF0ZSBfZW5hYmxlZFRhYkluZGV4PzogbnVtYmVyIHwgbnVsbDtcblxuICAvKiogVGhlIHZhbHVlIHNlbGVjdGVkIGluIHRoZSBsaXN0Ym94LCByZXByZXNlbnRlZCBhcyBhbiBhcnJheSBvZiBvcHRpb24gdmFsdWVzLiAqL1xuICBASW5wdXQoJ2Nka0xpc3Rib3hWYWx1ZScpXG4gIGdldCB2YWx1ZSgpOiByZWFkb25seSBUW10ge1xuICAgIHJldHVybiB0aGlzLl9pbnZhbGlkID8gW10gOiB0aGlzLnNlbGVjdGlvbk1vZGVsLnNlbGVjdGVkO1xuICB9XG4gIHNldCB2YWx1ZSh2YWx1ZTogcmVhZG9ubHkgVFtdKSB7XG4gICAgdGhpcy5fc2V0U2VsZWN0aW9uKHZhbHVlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoZSBsaXN0Ym94IGFsbG93cyBtdWx0aXBsZSBvcHRpb25zIHRvIGJlIHNlbGVjdGVkLiBJZiB0aGUgdmFsdWUgc3dpdGNoZXMgZnJvbSBgdHJ1ZWBcbiAgICogdG8gYGZhbHNlYCwgYW5kIG1vcmUgdGhhbiBvbmUgb3B0aW9uIGlzIHNlbGVjdGVkLCBhbGwgb3B0aW9ucyBhcmUgZGVzZWxlY3RlZC5cbiAgICovXG4gIEBJbnB1dCgnY2RrTGlzdGJveE11bHRpcGxlJylcbiAgZ2V0IG11bHRpcGxlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnNlbGVjdGlvbk1vZGVsLm11bHRpcGxlO1xuICB9XG4gIHNldCBtdWx0aXBsZSh2YWx1ZTogQm9vbGVhbklucHV0KSB7XG4gICAgdGhpcy5zZWxlY3Rpb25Nb2RlbC5tdWx0aXBsZSA9IGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eSh2YWx1ZSk7XG5cbiAgICBpZiAodGhpcy5vcHRpb25zKSB7XG4gICAgICB0aGlzLl91cGRhdGVJbnRlcm5hbFZhbHVlKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGxpc3Rib3ggaXMgZGlzYWJsZWQuICovXG4gIEBJbnB1dCgnY2RrTGlzdGJveERpc2FibGVkJylcbiAgZ2V0IGRpc2FibGVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9kaXNhYmxlZDtcbiAgfVxuICBzZXQgZGlzYWJsZWQodmFsdWU6IEJvb2xlYW5JbnB1dCkge1xuICAgIHRoaXMuX2Rpc2FibGVkID0gY29lcmNlQm9vbGVhblByb3BlcnR5KHZhbHVlKTtcbiAgfVxuICBwcml2YXRlIF9kaXNhYmxlZDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBsaXN0Ym94IHdpbGwgdXNlIGFjdGl2ZSBkZXNjZW5kYW50IG9yIHdpbGwgbW92ZSBmb2N1cyBvbnRvIHRoZSBvcHRpb25zLiAqL1xuICBASW5wdXQoJ2Nka0xpc3Rib3hVc2VBY3RpdmVEZXNjZW5kYW50JylcbiAgZ2V0IHVzZUFjdGl2ZURlc2NlbmRhbnQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX3VzZUFjdGl2ZURlc2NlbmRhbnQ7XG4gIH1cbiAgc2V0IHVzZUFjdGl2ZURlc2NlbmRhbnQoc2hvdWxkVXNlQWN0aXZlRGVzY2VuZGFudDogQm9vbGVhbklucHV0KSB7XG4gICAgdGhpcy5fdXNlQWN0aXZlRGVzY2VuZGFudCA9IGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eShzaG91bGRVc2VBY3RpdmVEZXNjZW5kYW50KTtcbiAgfVxuICBwcml2YXRlIF91c2VBY3RpdmVEZXNjZW5kYW50OiBib29sZWFuID0gZmFsc2U7XG5cbiAgLyoqIFRoZSBvcmllbnRhdGlvbiBvZiB0aGUgbGlzdGJveC4gT25seSBhZmZlY3RzIGtleWJvYXJkIGludGVyYWN0aW9uLCBub3QgdmlzdWFsIGxheW91dC4gKi9cbiAgQElucHV0KCdjZGtMaXN0Ym94T3JpZW50YXRpb24nKVxuICBnZXQgb3JpZW50YXRpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuX29yaWVudGF0aW9uO1xuICB9XG4gIHNldCBvcmllbnRhdGlvbih2YWx1ZTogJ2hvcml6b250YWwnIHwgJ3ZlcnRpY2FsJykge1xuICAgIHRoaXMuX29yaWVudGF0aW9uID0gdmFsdWUgPT09ICdob3Jpem9udGFsJyA/ICdob3Jpem9udGFsJyA6ICd2ZXJ0aWNhbCc7XG4gICAgaWYgKHZhbHVlID09PSAnaG9yaXpvbnRhbCcpIHtcbiAgICAgIHRoaXMubGlzdEtleU1hbmFnZXI/LndpdGhIb3Jpem9udGFsT3JpZW50YXRpb24odGhpcy5fZGlyPy52YWx1ZSB8fCAnbHRyJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubGlzdEtleU1hbmFnZXI/LndpdGhWZXJ0aWNhbE9yaWVudGF0aW9uKCk7XG4gICAgfVxuICB9XG4gIHByaXZhdGUgX29yaWVudGF0aW9uOiAnaG9yaXpvbnRhbCcgfCAndmVydGljYWwnID0gJ3ZlcnRpY2FsJztcblxuICAvKiogVGhlIGZ1bmN0aW9uIHVzZWQgdG8gY29tcGFyZSBvcHRpb24gdmFsdWVzLiAqL1xuICBASW5wdXQoJ2Nka0xpc3Rib3hDb21wYXJlV2l0aCcpXG4gIGdldCBjb21wYXJlV2l0aCgpOiB1bmRlZmluZWQgfCAoKG8xOiBULCBvMjogVCkgPT4gYm9vbGVhbikge1xuICAgIHJldHVybiB0aGlzLnNlbGVjdGlvbk1vZGVsLmNvbXBhcmVXaXRoO1xuICB9XG4gIHNldCBjb21wYXJlV2l0aChmbjogdW5kZWZpbmVkIHwgKChvMTogVCwgbzI6IFQpID0+IGJvb2xlYW4pKSB7XG4gICAgdGhpcy5zZWxlY3Rpb25Nb2RlbC5jb21wYXJlV2l0aCA9IGZuO1xuICB9XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlIGtleWJvYXJkIG5hdmlnYXRpb24gc2hvdWxkIHdyYXAgd2hlbiB0aGUgdXNlciBwcmVzc2VzIGFycm93IGRvd24gb24gdGhlIGxhc3QgaXRlbVxuICAgKiBvciBhcnJvdyB1cCBvbiB0aGUgZmlyc3QgaXRlbS5cbiAgICovXG4gIEBJbnB1dCgnY2RrTGlzdGJveE5hdmlnYXRpb25XcmFwRGlzYWJsZWQnKVxuICBnZXQgbmF2aWdhdGlvbldyYXBEaXNhYmxlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5fbmF2aWdhdGlvbldyYXBEaXNhYmxlZDtcbiAgfVxuICBzZXQgbmF2aWdhdGlvbldyYXBEaXNhYmxlZCh3cmFwOiBCb29sZWFuSW5wdXQpIHtcbiAgICB0aGlzLl9uYXZpZ2F0aW9uV3JhcERpc2FibGVkID0gY29lcmNlQm9vbGVhblByb3BlcnR5KHdyYXApO1xuICAgIHRoaXMubGlzdEtleU1hbmFnZXI/LndpdGhXcmFwKCF0aGlzLl9uYXZpZ2F0aW9uV3JhcERpc2FibGVkKTtcbiAgfVxuICBwcml2YXRlIF9uYXZpZ2F0aW9uV3JhcERpc2FibGVkID0gZmFsc2U7XG5cbiAgLyoqIFdoZXRoZXIga2V5Ym9hcmQgbmF2aWdhdGlvbiBzaG91bGQgc2tpcCBvdmVyIGRpc2FibGVkIGl0ZW1zLiAqL1xuICBASW5wdXQoJ2Nka0xpc3Rib3hOYXZpZ2F0ZXNEaXNhYmxlZE9wdGlvbnMnKVxuICBnZXQgbmF2aWdhdGVEaXNhYmxlZE9wdGlvbnMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX25hdmlnYXRlRGlzYWJsZWRPcHRpb25zO1xuICB9XG4gIHNldCBuYXZpZ2F0ZURpc2FibGVkT3B0aW9ucyhza2lwOiBCb29sZWFuSW5wdXQpIHtcbiAgICB0aGlzLl9uYXZpZ2F0ZURpc2FibGVkT3B0aW9ucyA9IGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eShza2lwKTtcbiAgICB0aGlzLmxpc3RLZXlNYW5hZ2VyPy5za2lwUHJlZGljYXRlKFxuICAgICAgdGhpcy5fbmF2aWdhdGVEaXNhYmxlZE9wdGlvbnMgPyB0aGlzLl9za2lwTm9uZVByZWRpY2F0ZSA6IHRoaXMuX3NraXBEaXNhYmxlZFByZWRpY2F0ZSxcbiAgICApO1xuICB9XG4gIHByaXZhdGUgX25hdmlnYXRlRGlzYWJsZWRPcHRpb25zID0gZmFsc2U7XG5cbiAgLyoqIEVtaXRzIHdoZW4gdGhlIHNlbGVjdGVkIHZhbHVlKHMpIGluIHRoZSBsaXN0Ym94IGNoYW5nZS4gKi9cbiAgQE91dHB1dCgnY2RrTGlzdGJveFZhbHVlQ2hhbmdlJykgcmVhZG9ubHkgdmFsdWVDaGFuZ2UgPSBuZXcgU3ViamVjdDxMaXN0Ym94VmFsdWVDaGFuZ2VFdmVudDxUPj4oKTtcblxuICAvKiogVGhlIGNoaWxkIG9wdGlvbnMgaW4gdGhpcyBsaXN0Ym94LiAqL1xuICBAQ29udGVudENoaWxkcmVuKENka09wdGlvbiwge2Rlc2NlbmRhbnRzOiB0cnVlfSkgcHJvdGVjdGVkIG9wdGlvbnM6IFF1ZXJ5TGlzdDxDZGtPcHRpb248VD4+O1xuXG4gIC8qKiBUaGUgc2VsZWN0aW9uIG1vZGVsIHVzZWQgYnkgdGhlIGxpc3Rib3guICovXG4gIHByb3RlY3RlZCBzZWxlY3Rpb25Nb2RlbCA9IG5ldyBMaXN0Ym94U2VsZWN0aW9uTW9kZWw8VD4oKTtcblxuICAvKiogVGhlIGtleSBtYW5hZ2VyIHRoYXQgbWFuYWdlcyBrZXlib2FyZCBuYXZpZ2F0aW9uIGZvciB0aGlzIGxpc3Rib3guICovXG4gIHByb3RlY3RlZCBsaXN0S2V5TWFuYWdlcjogQWN0aXZlRGVzY2VuZGFudEtleU1hbmFnZXI8Q2RrT3B0aW9uPFQ+PjtcblxuICAvKiogRW1pdHMgd2hlbiB0aGUgbGlzdGJveCBpcyBkZXN0cm95ZWQuICovXG4gIHByb3RlY3RlZCByZWFkb25seSBkZXN0cm95ZWQgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xuXG4gIC8qKiBUaGUgaG9zdCBlbGVtZW50IG9mIHRoZSBsaXN0Ym94LiAqL1xuICBwcm90ZWN0ZWQgcmVhZG9ubHkgZWxlbWVudDogSFRNTEVsZW1lbnQgPSBpbmplY3QoRWxlbWVudFJlZikubmF0aXZlRWxlbWVudDtcblxuICAvKiogVGhlIGNoYW5nZSBkZXRlY3RvciBmb3IgdGhpcyBsaXN0Ym94LiAqL1xuICBwcm90ZWN0ZWQgcmVhZG9ubHkgY2hhbmdlRGV0ZWN0b3JSZWYgPSBpbmplY3QoQ2hhbmdlRGV0ZWN0b3JSZWYpO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgdmFsdWUgaW4gdGhlIHNlbGVjdGlvbiBtb2RlbCBpcyBpbnZhbGlkLiAqL1xuICBwcml2YXRlIF9pbnZhbGlkID0gZmFsc2U7XG5cbiAgLyoqIFRoZSBsYXN0IHVzZXItdHJpZ2dlcmVkIG9wdGlvbi4gKi9cbiAgcHJpdmF0ZSBfbGFzdFRyaWdnZXJlZDogQ2RrT3B0aW9uPFQ+IHwgbnVsbCA9IG51bGw7XG5cbiAgLyoqIENhbGxiYWNrIGNhbGxlZCB3aGVuIHRoZSBsaXN0Ym94IGhhcyBiZWVuIHRvdWNoZWQgKi9cbiAgcHJpdmF0ZSBfb25Ub3VjaGVkID0gKCkgPT4ge307XG5cbiAgLyoqIENhbGxiYWNrIGNhbGxlZCB3aGVuIHRoZSBsaXN0Ym94IHZhbHVlIGNoYW5nZXMgKi9cbiAgcHJpdmF0ZSBfb25DaGFuZ2U6ICh2YWx1ZTogcmVhZG9ubHkgVFtdKSA9PiB2b2lkID0gKCkgPT4ge307XG5cbiAgLyoqIEVtaXRzIHdoZW4gYW4gb3B0aW9uIGhhcyBiZWVuIGNsaWNrZWQuICovXG4gIHByaXZhdGUgX29wdGlvbkNsaWNrZWQgPSBkZWZlcigoKSA9PlxuICAgICh0aGlzLm9wdGlvbnMuY2hhbmdlcyBhcyBPYnNlcnZhYmxlPENka09wdGlvbjxUPltdPikucGlwZShcbiAgICAgIHN0YXJ0V2l0aCh0aGlzLm9wdGlvbnMpLFxuICAgICAgc3dpdGNoTWFwKG9wdGlvbnMgPT5cbiAgICAgICAgbWVyZ2UoLi4ub3B0aW9ucy5tYXAob3B0aW9uID0+IG9wdGlvbi5fY2xpY2tlZC5waXBlKG1hcChldmVudCA9PiAoe29wdGlvbiwgZXZlbnR9KSkpKSksXG4gICAgICApLFxuICAgICksXG4gICk7XG5cbiAgLyoqIFRoZSBkaXJlY3Rpb25hbGl0eSBvZiB0aGUgcGFnZS4gKi9cbiAgcHJpdmF0ZSByZWFkb25seSBfZGlyID0gaW5qZWN0KERpcmVjdGlvbmFsaXR5LCB7b3B0aW9uYWw6IHRydWV9KTtcblxuICAvKiogQSBwcmVkaWNhdGUgdGhhdCBza2lwcyBkaXNhYmxlZCBvcHRpb25zLiAqL1xuICBwcml2YXRlIHJlYWRvbmx5IF9za2lwRGlzYWJsZWRQcmVkaWNhdGUgPSAob3B0aW9uOiBDZGtPcHRpb248VD4pID0+IG9wdGlvbi5kaXNhYmxlZDtcblxuICAvKiogQSBwcmVkaWNhdGUgdGhhdCBkb2VzIG5vdCBza2lwIGFueSBvcHRpb25zLiAqL1xuICBwcml2YXRlIHJlYWRvbmx5IF9za2lwTm9uZVByZWRpY2F0ZSA9ICgpID0+IGZhbHNlO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBsaXN0Ym94IGN1cnJlbnRseSBoYXMgZm9jdXMuICovXG4gIHByaXZhdGUgX2hhc0ZvY3VzID0gZmFsc2U7XG5cbiAgbmdBZnRlckNvbnRlbnRJbml0KCkge1xuICAgIGlmICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpIHtcbiAgICAgIHRoaXMuX3ZlcmlmeU5vT3B0aW9uVmFsdWVDb2xsaXNpb25zKCk7XG4gICAgICB0aGlzLl92ZXJpZnlPcHRpb25WYWx1ZXMoKTtcbiAgICB9XG5cbiAgICB0aGlzLl9pbml0S2V5TWFuYWdlcigpO1xuXG4gICAgLy8gVXBkYXRlIHRoZSBpbnRlcm5hbCB2YWx1ZSB3aGVuZXZlciB0aGUgb3B0aW9ucyBvciB0aGUgbW9kZWwgdmFsdWUgY2hhbmdlcy5cbiAgICBtZXJnZSh0aGlzLnNlbGVjdGlvbk1vZGVsLmNoYW5nZWQsIHRoaXMub3B0aW9ucy5jaGFuZ2VzKVxuICAgICAgLnBpcGUoc3RhcnRXaXRoKG51bGwpLCB0YWtlVW50aWwodGhpcy5kZXN0cm95ZWQpKVxuICAgICAgLnN1YnNjcmliZSgoKSA9PiB0aGlzLl91cGRhdGVJbnRlcm5hbFZhbHVlKCkpO1xuXG4gICAgdGhpcy5fb3B0aW9uQ2xpY2tlZFxuICAgICAgLnBpcGUoXG4gICAgICAgIGZpbHRlcigoe29wdGlvbn0pID0+ICFvcHRpb24uZGlzYWJsZWQpLFxuICAgICAgICB0YWtlVW50aWwodGhpcy5kZXN0cm95ZWQpLFxuICAgICAgKVxuICAgICAgLnN1YnNjcmliZSgoe29wdGlvbiwgZXZlbnR9KSA9PiB0aGlzLl9oYW5kbGVPcHRpb25DbGlja2VkKG9wdGlvbiwgZXZlbnQpKTtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIHRoaXMubGlzdEtleU1hbmFnZXI/LmRlc3Ryb3koKTtcbiAgICB0aGlzLmRlc3Ryb3llZC5uZXh0KCk7XG4gICAgdGhpcy5kZXN0cm95ZWQuY29tcGxldGUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUb2dnbGUgdGhlIHNlbGVjdGVkIHN0YXRlIG9mIHRoZSBnaXZlbiBvcHRpb24uXG4gICAqIEBwYXJhbSBvcHRpb24gVGhlIG9wdGlvbiB0byB0b2dnbGVcbiAgICovXG4gIHRvZ2dsZShvcHRpb246IENka09wdGlvbjxUPikge1xuICAgIHRoaXMudG9nZ2xlVmFsdWUob3B0aW9uLnZhbHVlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUb2dnbGUgdGhlIHNlbGVjdGVkIHN0YXRlIG9mIHRoZSBnaXZlbiB2YWx1ZS5cbiAgICogQHBhcmFtIHZhbHVlIFRoZSB2YWx1ZSB0byB0b2dnbGVcbiAgICovXG4gIHRvZ2dsZVZhbHVlKHZhbHVlOiBUKSB7XG4gICAgaWYgKHRoaXMuX2ludmFsaWQpIHtcbiAgICAgIHRoaXMuc2VsZWN0aW9uTW9kZWwuY2xlYXIoZmFsc2UpO1xuICAgIH1cbiAgICB0aGlzLnNlbGVjdGlvbk1vZGVsLnRvZ2dsZSh2YWx1ZSk7XG4gIH1cblxuICAvKipcbiAgICogU2VsZWN0IHRoZSBnaXZlbiBvcHRpb24uXG4gICAqIEBwYXJhbSBvcHRpb24gVGhlIG9wdGlvbiB0byBzZWxlY3RcbiAgICovXG4gIHNlbGVjdChvcHRpb246IENka09wdGlvbjxUPikge1xuICAgIHRoaXMuc2VsZWN0VmFsdWUob3B0aW9uLnZhbHVlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWxlY3QgdGhlIGdpdmVuIHZhbHVlLlxuICAgKiBAcGFyYW0gdmFsdWUgVGhlIHZhbHVlIHRvIHNlbGVjdFxuICAgKi9cbiAgc2VsZWN0VmFsdWUodmFsdWU6IFQpIHtcbiAgICBpZiAodGhpcy5faW52YWxpZCkge1xuICAgICAgdGhpcy5zZWxlY3Rpb25Nb2RlbC5jbGVhcihmYWxzZSk7XG4gICAgfVxuICAgIHRoaXMuc2VsZWN0aW9uTW9kZWwuc2VsZWN0KHZhbHVlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXNlbGVjdCB0aGUgZ2l2ZW4gb3B0aW9uLlxuICAgKiBAcGFyYW0gb3B0aW9uIFRoZSBvcHRpb24gdG8gZGVzZWxlY3RcbiAgICovXG4gIGRlc2VsZWN0KG9wdGlvbjogQ2RrT3B0aW9uPFQ+KSB7XG4gICAgdGhpcy5kZXNlbGVjdFZhbHVlKG9wdGlvbi52YWx1ZSk7XG4gIH1cblxuICAvKipcbiAgICogRGVzZWxlY3QgdGhlIGdpdmVuIHZhbHVlLlxuICAgKiBAcGFyYW0gdmFsdWUgVGhlIHZhbHVlIHRvIGRlc2VsZWN0XG4gICAqL1xuICBkZXNlbGVjdFZhbHVlKHZhbHVlOiBUKSB7XG4gICAgaWYgKHRoaXMuX2ludmFsaWQpIHtcbiAgICAgIHRoaXMuc2VsZWN0aW9uTW9kZWwuY2xlYXIoZmFsc2UpO1xuICAgIH1cbiAgICB0aGlzLnNlbGVjdGlvbk1vZGVsLmRlc2VsZWN0KHZhbHVlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIHNlbGVjdGVkIHN0YXRlIG9mIGFsbCBvcHRpb25zLlxuICAgKiBAcGFyYW0gaXNTZWxlY3RlZCBUaGUgbmV3IHNlbGVjdGVkIHN0YXRlIHRvIHNldFxuICAgKi9cbiAgc2V0QWxsU2VsZWN0ZWQoaXNTZWxlY3RlZDogYm9vbGVhbikge1xuICAgIGlmICghaXNTZWxlY3RlZCkge1xuICAgICAgdGhpcy5zZWxlY3Rpb25Nb2RlbC5jbGVhcigpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodGhpcy5faW52YWxpZCkge1xuICAgICAgICB0aGlzLnNlbGVjdGlvbk1vZGVsLmNsZWFyKGZhbHNlKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuc2VsZWN0aW9uTW9kZWwuc2VsZWN0KC4uLnRoaXMub3B0aW9ucy5tYXAob3B0aW9uID0+IG9wdGlvbi52YWx1ZSkpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgd2hldGhlciB0aGUgZ2l2ZW4gb3B0aW9uIGlzIHNlbGVjdGVkLlxuICAgKiBAcGFyYW0gb3B0aW9uIFRoZSBvcHRpb24gdG8gZ2V0IHRoZSBzZWxlY3RlZCBzdGF0ZSBvZlxuICAgKi9cbiAgaXNTZWxlY3RlZChvcHRpb246IENka09wdGlvbjxUPikge1xuICAgIHJldHVybiB0aGlzLmlzVmFsdWVTZWxlY3RlZChvcHRpb24udmFsdWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB3aGV0aGVyIHRoZSBnaXZlbiBvcHRpb24gaXMgYWN0aXZlLlxuICAgKiBAcGFyYW0gb3B0aW9uIFRoZSBvcHRpb24gdG8gZ2V0IHRoZSBhY3RpdmUgc3RhdGUgb2ZcbiAgICovXG4gIGlzQWN0aXZlKG9wdGlvbjogQ2RrT3B0aW9uPFQ+KTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICEhKHRoaXMubGlzdEtleU1hbmFnZXI/LmFjdGl2ZUl0ZW0gPT09IG9wdGlvbik7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHdoZXRoZXIgdGhlIGdpdmVuIHZhbHVlIGlzIHNlbGVjdGVkLlxuICAgKiBAcGFyYW0gdmFsdWUgVGhlIHZhbHVlIHRvIGdldCB0aGUgc2VsZWN0ZWQgc3RhdGUgb2ZcbiAgICovXG4gIGlzVmFsdWVTZWxlY3RlZCh2YWx1ZTogVCkge1xuICAgIGlmICh0aGlzLl9pbnZhbGlkKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnNlbGVjdGlvbk1vZGVsLmlzU2VsZWN0ZWQodmFsdWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVycyBhIGNhbGxiYWNrIHRvIGJlIGludm9rZWQgd2hlbiB0aGUgbGlzdGJveCdzIHZhbHVlIGNoYW5nZXMgZnJvbSB1c2VyIGlucHV0LlxuICAgKiBAcGFyYW0gZm4gVGhlIGNhbGxiYWNrIHRvIHJlZ2lzdGVyXG4gICAqIEBkb2NzLXByaXZhdGVcbiAgICovXG4gIHJlZ2lzdGVyT25DaGFuZ2UoZm46ICh2YWx1ZTogcmVhZG9ubHkgVFtdKSA9PiB2b2lkKTogdm9pZCB7XG4gICAgdGhpcy5fb25DaGFuZ2UgPSBmbjtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlcnMgYSBjYWxsYmFjayB0byBiZSBpbnZva2VkIHdoZW4gdGhlIGxpc3Rib3ggaXMgYmx1cnJlZCBieSB0aGUgdXNlci5cbiAgICogQHBhcmFtIGZuIFRoZSBjYWxsYmFjayB0byByZWdpc3RlclxuICAgKiBAZG9jcy1wcml2YXRlXG4gICAqL1xuICByZWdpc3Rlck9uVG91Y2hlZChmbjogKCkgPT4ge30pOiB2b2lkIHtcbiAgICB0aGlzLl9vblRvdWNoZWQgPSBmbjtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBsaXN0Ym94J3MgdmFsdWUuXG4gICAqIEBwYXJhbSB2YWx1ZSBUaGUgbmV3IHZhbHVlIG9mIHRoZSBsaXN0Ym94XG4gICAqIEBkb2NzLXByaXZhdGVcbiAgICovXG4gIHdyaXRlVmFsdWUodmFsdWU6IHJlYWRvbmx5IFRbXSk6IHZvaWQge1xuICAgIHRoaXMuX3NldFNlbGVjdGlvbih2YWx1ZSk7XG4gICAgdGhpcy5fdmVyaWZ5T3B0aW9uVmFsdWVzKCk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgZGlzYWJsZWQgc3RhdGUgb2YgdGhlIGxpc3Rib3guXG4gICAqIEBwYXJhbSBpc0Rpc2FibGVkIFRoZSBuZXcgZGlzYWJsZWQgc3RhdGVcbiAgICogQGRvY3MtcHJpdmF0ZVxuICAgKi9cbiAgc2V0RGlzYWJsZWRTdGF0ZShpc0Rpc2FibGVkOiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5kaXNhYmxlZCA9IGlzRGlzYWJsZWQ7XG4gIH1cblxuICAvKiogRm9jdXMgdGhlIGxpc3Rib3gncyBob3N0IGVsZW1lbnQuICovXG4gIGZvY3VzKCkge1xuICAgIHRoaXMuZWxlbWVudC5mb2N1cygpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRyaWdnZXJzIHRoZSBnaXZlbiBvcHRpb24gaW4gcmVzcG9uc2UgdG8gdXNlciBpbnRlcmFjdGlvbi5cbiAgICogLSBJbiBzaW5nbGUgc2VsZWN0aW9uIG1vZGU6IHNlbGVjdHMgdGhlIG9wdGlvbiBhbmQgZGVzZWxlY3RzIGFueSBvdGhlciBzZWxlY3RlZCBvcHRpb24uXG4gICAqIC0gSW4gbXVsdGkgc2VsZWN0aW9uIG1vZGU6IHRvZ2dsZXMgdGhlIHNlbGVjdGVkIHN0YXRlIG9mIHRoZSBvcHRpb24uXG4gICAqIEBwYXJhbSBvcHRpb24gVGhlIG9wdGlvbiB0byB0cmlnZ2VyXG4gICAqL1xuICBwcm90ZWN0ZWQgdHJpZ2dlck9wdGlvbihvcHRpb246IENka09wdGlvbjxUPiB8IG51bGwpIHtcbiAgICBpZiAob3B0aW9uICYmICFvcHRpb24uZGlzYWJsZWQpIHtcbiAgICAgIHRoaXMuX2xhc3RUcmlnZ2VyZWQgPSBvcHRpb247XG4gICAgICBjb25zdCBjaGFuZ2VkID0gdGhpcy5tdWx0aXBsZVxuICAgICAgICA/IHRoaXMuc2VsZWN0aW9uTW9kZWwudG9nZ2xlKG9wdGlvbi52YWx1ZSlcbiAgICAgICAgOiB0aGlzLnNlbGVjdGlvbk1vZGVsLnNlbGVjdChvcHRpb24udmFsdWUpO1xuICAgICAgaWYgKGNoYW5nZWQpIHtcbiAgICAgICAgdGhpcy5fb25DaGFuZ2UodGhpcy52YWx1ZSk7XG4gICAgICAgIHRoaXMudmFsdWVDaGFuZ2UubmV4dCh7XG4gICAgICAgICAgdmFsdWU6IHRoaXMudmFsdWUsXG4gICAgICAgICAgbGlzdGJveDogdGhpcyxcbiAgICAgICAgICBvcHRpb246IG9wdGlvbixcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFRyaWdnZXIgdGhlIGdpdmVuIHJhbmdlIG9mIG9wdGlvbnMgaW4gcmVzcG9uc2UgdG8gdXNlciBpbnRlcmFjdGlvbi5cbiAgICogU2hvdWxkIG9ubHkgYmUgY2FsbGVkIGluIG11bHRpLXNlbGVjdGlvbiBtb2RlLlxuICAgKiBAcGFyYW0gdHJpZ2dlciBUaGUgb3B0aW9uIHRoYXQgd2FzIHRyaWdnZXJlZFxuICAgKiBAcGFyYW0gZnJvbSBUaGUgc3RhcnQgaW5kZXggb2YgdGhlIG9wdGlvbnMgdG8gdG9nZ2xlXG4gICAqIEBwYXJhbSB0byBUaGUgZW5kIGluZGV4IG9mIHRoZSBvcHRpb25zIHRvIHRvZ2dsZVxuICAgKiBAcGFyYW0gb24gV2hldGhlciB0byB0b2dnbGUgdGhlIG9wdGlvbiByYW5nZSBvblxuICAgKi9cbiAgcHJvdGVjdGVkIHRyaWdnZXJSYW5nZSh0cmlnZ2VyOiBDZGtPcHRpb248VD4gfCBudWxsLCBmcm9tOiBudW1iZXIsIHRvOiBudW1iZXIsIG9uOiBib29sZWFuKSB7XG4gICAgaWYgKHRoaXMuZGlzYWJsZWQgfHwgKHRyaWdnZXIgJiYgdHJpZ2dlci5kaXNhYmxlZCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5fbGFzdFRyaWdnZXJlZCA9IHRyaWdnZXI7XG4gICAgY29uc3QgaXNFcXVhbCA9IHRoaXMuY29tcGFyZVdpdGggPz8gT2JqZWN0LmlzO1xuICAgIGNvbnN0IHVwZGF0ZVZhbHVlcyA9IFsuLi50aGlzLm9wdGlvbnNdXG4gICAgICAuc2xpY2UoTWF0aC5tYXgoMCwgTWF0aC5taW4oZnJvbSwgdG8pKSwgTWF0aC5taW4odGhpcy5vcHRpb25zLmxlbmd0aCwgTWF0aC5tYXgoZnJvbSwgdG8pICsgMSkpXG4gICAgICAuZmlsdGVyKG9wdGlvbiA9PiAhb3B0aW9uLmRpc2FibGVkKVxuICAgICAgLm1hcChvcHRpb24gPT4gb3B0aW9uLnZhbHVlKTtcbiAgICBjb25zdCBzZWxlY3RlZCA9IFsuLi50aGlzLnZhbHVlXTtcbiAgICBmb3IgKGNvbnN0IHVwZGF0ZVZhbHVlIG9mIHVwZGF0ZVZhbHVlcykge1xuICAgICAgY29uc3Qgc2VsZWN0ZWRJbmRleCA9IHNlbGVjdGVkLmZpbmRJbmRleChzZWxlY3RlZFZhbHVlID0+XG4gICAgICAgIGlzRXF1YWwoc2VsZWN0ZWRWYWx1ZSwgdXBkYXRlVmFsdWUpLFxuICAgICAgKTtcbiAgICAgIGlmIChvbiAmJiBzZWxlY3RlZEluZGV4ID09PSAtMSkge1xuICAgICAgICBzZWxlY3RlZC5wdXNoKHVwZGF0ZVZhbHVlKTtcbiAgICAgIH0gZWxzZSBpZiAoIW9uICYmIHNlbGVjdGVkSW5kZXggIT09IC0xKSB7XG4gICAgICAgIHNlbGVjdGVkLnNwbGljZShzZWxlY3RlZEluZGV4LCAxKTtcbiAgICAgIH1cbiAgICB9XG4gICAgbGV0IGNoYW5nZWQgPSB0aGlzLnNlbGVjdGlvbk1vZGVsLnNldFNlbGVjdGlvbiguLi5zZWxlY3RlZCk7XG4gICAgaWYgKGNoYW5nZWQpIHtcbiAgICAgIHRoaXMuX29uQ2hhbmdlKHRoaXMudmFsdWUpO1xuICAgICAgdGhpcy52YWx1ZUNoYW5nZS5uZXh0KHtcbiAgICAgICAgdmFsdWU6IHRoaXMudmFsdWUsXG4gICAgICAgIGxpc3Rib3g6IHRoaXMsXG4gICAgICAgIG9wdGlvbjogdHJpZ2dlcixcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBnaXZlbiBvcHRpb24gYXMgYWN0aXZlLlxuICAgKiBAcGFyYW0gb3B0aW9uIFRoZSBvcHRpb24gdG8gbWFrZSBhY3RpdmVcbiAgICovXG4gIF9zZXRBY3RpdmVPcHRpb24ob3B0aW9uOiBDZGtPcHRpb248VD4pIHtcbiAgICB0aGlzLmxpc3RLZXlNYW5hZ2VyLnNldEFjdGl2ZUl0ZW0ob3B0aW9uKTtcbiAgfVxuXG4gIC8qKiBDYWxsZWQgd2hlbiB0aGUgbGlzdGJveCByZWNlaXZlcyBmb2N1cy4gKi9cbiAgcHJvdGVjdGVkIF9oYW5kbGVGb2N1cygpIHtcbiAgICBpZiAoIXRoaXMudXNlQWN0aXZlRGVzY2VuZGFudCkge1xuICAgICAgaWYgKHRoaXMuc2VsZWN0aW9uTW9kZWwuc2VsZWN0ZWQubGVuZ3RoID4gMCkge1xuICAgICAgICB0aGlzLl9zZXROZXh0Rm9jdXNUb1NlbGVjdGVkT3B0aW9uKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmxpc3RLZXlNYW5hZ2VyLnNldE5leHRJdGVtQWN0aXZlKCk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX2ZvY3VzQWN0aXZlT3B0aW9uKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIENhbGxlZCB3aGVuIHRoZSB1c2VyIHByZXNzZXMga2V5ZG93biBvbiB0aGUgbGlzdGJveC4gKi9cbiAgcHJvdGVjdGVkIF9oYW5kbGVLZXlkb3duKGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG4gICAgaWYgKHRoaXMuX2Rpc2FibGVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qge2tleUNvZGV9ID0gZXZlbnQ7XG4gICAgY29uc3QgcHJldmlvdXNBY3RpdmVJbmRleCA9IHRoaXMubGlzdEtleU1hbmFnZXIuYWN0aXZlSXRlbUluZGV4O1xuICAgIGNvbnN0IGN0cmxLZXlzID0gWydjdHJsS2V5JywgJ21ldGFLZXknXSBhcyBjb25zdDtcblxuICAgIGlmICh0aGlzLm11bHRpcGxlICYmIGtleUNvZGUgPT09IEEgJiYgaGFzTW9kaWZpZXJLZXkoZXZlbnQsIC4uLmN0cmxLZXlzKSkge1xuICAgICAgLy8gVG9nZ2xlIGFsbCBvcHRpb25zIG9mZiBpZiB0aGV5J3JlIGFsbCBzZWxlY3RlZCwgb3RoZXJ3aXNlIHRvZ2dsZSB0aGVtIGFsbCBvbi5cbiAgICAgIHRoaXMudHJpZ2dlclJhbmdlKFxuICAgICAgICBudWxsLFxuICAgICAgICAwLFxuICAgICAgICB0aGlzLm9wdGlvbnMubGVuZ3RoIC0gMSxcbiAgICAgICAgdGhpcy5vcHRpb25zLmxlbmd0aCAhPT0gdGhpcy52YWx1ZS5sZW5ndGgsXG4gICAgICApO1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoXG4gICAgICB0aGlzLm11bHRpcGxlICYmXG4gICAgICAoa2V5Q29kZSA9PT0gU1BBQ0UgfHwga2V5Q29kZSA9PT0gRU5URVIpICYmXG4gICAgICBoYXNNb2RpZmllcktleShldmVudCwgJ3NoaWZ0S2V5JylcbiAgICApIHtcbiAgICAgIGlmICh0aGlzLmxpc3RLZXlNYW5hZ2VyLmFjdGl2ZUl0ZW0gJiYgdGhpcy5saXN0S2V5TWFuYWdlci5hY3RpdmVJdGVtSW5kZXggIT0gbnVsbCkge1xuICAgICAgICB0aGlzLnRyaWdnZXJSYW5nZShcbiAgICAgICAgICB0aGlzLmxpc3RLZXlNYW5hZ2VyLmFjdGl2ZUl0ZW0sXG4gICAgICAgICAgdGhpcy5fZ2V0TGFzdFRyaWdnZXJlZEluZGV4KCkgPz8gdGhpcy5saXN0S2V5TWFuYWdlci5hY3RpdmVJdGVtSW5kZXgsXG4gICAgICAgICAgdGhpcy5saXN0S2V5TWFuYWdlci5hY3RpdmVJdGVtSW5kZXgsXG4gICAgICAgICAgIXRoaXMubGlzdEtleU1hbmFnZXIuYWN0aXZlSXRlbS5pc1NlbGVjdGVkKCksXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChcbiAgICAgIHRoaXMubXVsdGlwbGUgJiZcbiAgICAgIGtleUNvZGUgPT09IEhPTUUgJiZcbiAgICAgIGhhc01vZGlmaWVyS2V5KGV2ZW50LCAuLi5jdHJsS2V5cykgJiZcbiAgICAgIGhhc01vZGlmaWVyS2V5KGV2ZW50LCAnc2hpZnRLZXknKVxuICAgICkge1xuICAgICAgY29uc3QgdHJpZ2dlciA9IHRoaXMubGlzdEtleU1hbmFnZXIuYWN0aXZlSXRlbTtcbiAgICAgIGlmICh0cmlnZ2VyKSB7XG4gICAgICAgIGNvbnN0IGZyb20gPSB0aGlzLmxpc3RLZXlNYW5hZ2VyLmFjdGl2ZUl0ZW1JbmRleCE7XG4gICAgICAgIHRoaXMubGlzdEtleU1hbmFnZXIuc2V0Rmlyc3RJdGVtQWN0aXZlKCk7XG4gICAgICAgIHRoaXMudHJpZ2dlclJhbmdlKFxuICAgICAgICAgIHRyaWdnZXIsXG4gICAgICAgICAgZnJvbSxcbiAgICAgICAgICB0aGlzLmxpc3RLZXlNYW5hZ2VyLmFjdGl2ZUl0ZW1JbmRleCEsXG4gICAgICAgICAgIXRyaWdnZXIuaXNTZWxlY3RlZCgpLFxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoXG4gICAgICB0aGlzLm11bHRpcGxlICYmXG4gICAgICBrZXlDb2RlID09PSBFTkQgJiZcbiAgICAgIGhhc01vZGlmaWVyS2V5KGV2ZW50LCAuLi5jdHJsS2V5cykgJiZcbiAgICAgIGhhc01vZGlmaWVyS2V5KGV2ZW50LCAnc2hpZnRLZXknKVxuICAgICkge1xuICAgICAgY29uc3QgdHJpZ2dlciA9IHRoaXMubGlzdEtleU1hbmFnZXIuYWN0aXZlSXRlbTtcbiAgICAgIGlmICh0cmlnZ2VyKSB7XG4gICAgICAgIGNvbnN0IGZyb20gPSB0aGlzLmxpc3RLZXlNYW5hZ2VyLmFjdGl2ZUl0ZW1JbmRleCE7XG4gICAgICAgIHRoaXMubGlzdEtleU1hbmFnZXIuc2V0TGFzdEl0ZW1BY3RpdmUoKTtcbiAgICAgICAgdGhpcy50cmlnZ2VyUmFuZ2UoXG4gICAgICAgICAgdHJpZ2dlcixcbiAgICAgICAgICBmcm9tLFxuICAgICAgICAgIHRoaXMubGlzdEtleU1hbmFnZXIuYWN0aXZlSXRlbUluZGV4ISxcbiAgICAgICAgICAhdHJpZ2dlci5pc1NlbGVjdGVkKCksXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChrZXlDb2RlID09PSBTUEFDRSB8fCBrZXlDb2RlID09PSBFTlRFUikge1xuICAgICAgdGhpcy50cmlnZ2VyT3B0aW9uKHRoaXMubGlzdEtleU1hbmFnZXIuYWN0aXZlSXRlbSk7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGlzTmF2S2V5ID1cbiAgICAgIGtleUNvZGUgPT09IFVQX0FSUk9XIHx8XG4gICAgICBrZXlDb2RlID09PSBET1dOX0FSUk9XIHx8XG4gICAgICBrZXlDb2RlID09PSBMRUZUX0FSUk9XIHx8XG4gICAgICBrZXlDb2RlID09PSBSSUdIVF9BUlJPVyB8fFxuICAgICAga2V5Q29kZSA9PT0gSE9NRSB8fFxuICAgICAga2V5Q29kZSA9PT0gRU5EO1xuICAgIHRoaXMubGlzdEtleU1hbmFnZXIub25LZXlkb3duKGV2ZW50KTtcbiAgICAvLyBXaWxsIHNlbGVjdCBhbiBvcHRpb24gaWYgc2hpZnQgd2FzIHByZXNzZWQgd2hpbGUgbmF2aWdhdGluZyB0byB0aGUgb3B0aW9uXG4gICAgaWYgKGlzTmF2S2V5ICYmIGV2ZW50LnNoaWZ0S2V5ICYmIHByZXZpb3VzQWN0aXZlSW5kZXggIT09IHRoaXMubGlzdEtleU1hbmFnZXIuYWN0aXZlSXRlbUluZGV4KSB7XG4gICAgICB0aGlzLnRyaWdnZXJPcHRpb24odGhpcy5saXN0S2V5TWFuYWdlci5hY3RpdmVJdGVtKTtcbiAgICB9XG4gIH1cblxuICAvKiogQ2FsbGVkIHdoZW4gYSBmb2N1cyBtb3ZlcyBpbnRvIHRoZSBsaXN0Ym94LiAqL1xuICBwcm90ZWN0ZWQgX2hhbmRsZUZvY3VzSW4oKSB7XG4gICAgLy8gTm90ZSB0aGF0IHdlIHVzZSBhIGBmb2N1c2luYCBoYW5kbGVyIGZvciB0aGlzIGluc3RlYWQgb2YgdGhlIGV4aXN0aW5nIGBmb2N1c2AgaGFuZGxlcixcbiAgICAvLyBiZWNhdXNlIGZvY3VzIHdvbid0IGxhbmQgb24gdGhlIGxpc3Rib3ggaWYgYHVzZUFjdGl2ZURlc2NlbmRhbnRgIGlzIGVuYWJsZWQuXG4gICAgdGhpcy5faGFzRm9jdXMgPSB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIHRoZSBmb2N1cyBsZWF2ZXMgYW4gZWxlbWVudCBpbiB0aGUgbGlzdGJveC5cbiAgICogQHBhcmFtIGV2ZW50IFRoZSBmb2N1c291dCBldmVudFxuICAgKi9cbiAgcHJvdGVjdGVkIF9oYW5kbGVGb2N1c091dChldmVudDogRm9jdXNFdmVudCkge1xuICAgIGNvbnN0IG90aGVyRWxlbWVudCA9IGV2ZW50LnJlbGF0ZWRUYXJnZXQgYXMgRWxlbWVudDtcbiAgICBpZiAodGhpcy5lbGVtZW50ICE9PSBvdGhlckVsZW1lbnQgJiYgIXRoaXMuZWxlbWVudC5jb250YWlucyhvdGhlckVsZW1lbnQpKSB7XG4gICAgICB0aGlzLl9vblRvdWNoZWQoKTtcbiAgICAgIHRoaXMuX2hhc0ZvY3VzID0gZmFsc2U7XG4gICAgICB0aGlzLl9zZXROZXh0Rm9jdXNUb1NlbGVjdGVkT3B0aW9uKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEdldCB0aGUgaWQgb2YgdGhlIGFjdGl2ZSBvcHRpb24gaWYgYWN0aXZlIGRlc2NlbmRhbnQgaXMgYmVpbmcgdXNlZC4gKi9cbiAgcHJvdGVjdGVkIF9nZXRBcmlhQWN0aXZlRGVzY2VuZGFudCgpOiBzdHJpbmcgfCBudWxsIHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdGhpcy5fdXNlQWN0aXZlRGVzY2VuZGFudCA/IHRoaXMubGlzdEtleU1hbmFnZXI/LmFjdGl2ZUl0ZW0/LmlkIDogbnVsbDtcbiAgfVxuXG4gIC8qKiBHZXQgdGhlIHRhYmluZGV4IGZvciB0aGUgbGlzdGJveC4gKi9cbiAgcHJvdGVjdGVkIF9nZXRUYWJJbmRleCgpIHtcbiAgICBpZiAodGhpcy5kaXNhYmxlZCkge1xuICAgICAgcmV0dXJuIC0xO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy51c2VBY3RpdmVEZXNjZW5kYW50IHx8ICF0aGlzLmxpc3RLZXlNYW5hZ2VyLmFjdGl2ZUl0ZW0gPyB0aGlzLmVuYWJsZWRUYWJJbmRleCA6IC0xO1xuICB9XG5cbiAgLyoqIEluaXRpYWxpemUgdGhlIGtleSBtYW5hZ2VyLiAqL1xuICBwcml2YXRlIF9pbml0S2V5TWFuYWdlcigpIHtcbiAgICB0aGlzLmxpc3RLZXlNYW5hZ2VyID0gbmV3IEFjdGl2ZURlc2NlbmRhbnRLZXlNYW5hZ2VyKHRoaXMub3B0aW9ucylcbiAgICAgIC53aXRoV3JhcCghdGhpcy5fbmF2aWdhdGlvbldyYXBEaXNhYmxlZClcbiAgICAgIC53aXRoVHlwZUFoZWFkKClcbiAgICAgIC53aXRoSG9tZUFuZEVuZCgpXG4gICAgICAud2l0aEFsbG93ZWRNb2RpZmllcktleXMoWydzaGlmdEtleSddKVxuICAgICAgLnNraXBQcmVkaWNhdGUoXG4gICAgICAgIHRoaXMuX25hdmlnYXRlRGlzYWJsZWRPcHRpb25zID8gdGhpcy5fc2tpcE5vbmVQcmVkaWNhdGUgOiB0aGlzLl9za2lwRGlzYWJsZWRQcmVkaWNhdGUsXG4gICAgICApO1xuXG4gICAgaWYgKHRoaXMub3JpZW50YXRpb24gPT09ICd2ZXJ0aWNhbCcpIHtcbiAgICAgIHRoaXMubGlzdEtleU1hbmFnZXIud2l0aFZlcnRpY2FsT3JpZW50YXRpb24oKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5saXN0S2V5TWFuYWdlci53aXRoSG9yaXpvbnRhbE9yaWVudGF0aW9uKHRoaXMuX2Rpcj8udmFsdWUgfHwgJ2x0cicpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnNlbGVjdGlvbk1vZGVsLnNlbGVjdGVkLmxlbmd0aCkge1xuICAgICAgUHJvbWlzZS5yZXNvbHZlKCkudGhlbigoKSA9PiB0aGlzLl9zZXROZXh0Rm9jdXNUb1NlbGVjdGVkT3B0aW9uKCkpO1xuICAgIH1cblxuICAgIHRoaXMubGlzdEtleU1hbmFnZXIuY2hhbmdlLnN1YnNjcmliZSgoKSA9PiB0aGlzLl9mb2N1c0FjdGl2ZU9wdGlvbigpKTtcbiAgfVxuXG4gIC8qKiBGb2N1cyB0aGUgYWN0aXZlIG9wdGlvbi4gKi9cbiAgcHJpdmF0ZSBfZm9jdXNBY3RpdmVPcHRpb24oKSB7XG4gICAgaWYgKCF0aGlzLnVzZUFjdGl2ZURlc2NlbmRhbnQpIHtcbiAgICAgIHRoaXMubGlzdEtleU1hbmFnZXIuYWN0aXZlSXRlbT8uZm9jdXMoKTtcbiAgICB9XG4gICAgdGhpcy5jaGFuZ2VEZXRlY3RvclJlZi5tYXJrRm9yQ2hlY2soKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIHNlbGVjdGVkIHZhbHVlcy5cbiAgICogQHBhcmFtIHZhbHVlIFRoZSBsaXN0IG9mIG5ldyBzZWxlY3RlZCB2YWx1ZXMuXG4gICAqL1xuICBwcml2YXRlIF9zZXRTZWxlY3Rpb24odmFsdWU6IHJlYWRvbmx5IFRbXSkge1xuICAgIGlmICh0aGlzLl9pbnZhbGlkKSB7XG4gICAgICB0aGlzLnNlbGVjdGlvbk1vZGVsLmNsZWFyKGZhbHNlKTtcbiAgICB9XG4gICAgdGhpcy5zZWxlY3Rpb25Nb2RlbC5zZXRTZWxlY3Rpb24oLi4udGhpcy5fY29lcmNlVmFsdWUodmFsdWUpKTtcblxuICAgIGlmICghdGhpcy5faGFzRm9jdXMpIHtcbiAgICAgIHRoaXMuX3NldE5leHRGb2N1c1RvU2VsZWN0ZWRPcHRpb24oKTtcbiAgICB9XG4gIH1cblxuICAvKiogU2V0cyB0aGUgZmlyc3Qgc2VsZWN0ZWQgb3B0aW9uIGFzIGZpcnN0IGluIHRoZSBrZXlib2FyZCBmb2N1cyBvcmRlci4gKi9cbiAgcHJpdmF0ZSBfc2V0TmV4dEZvY3VzVG9TZWxlY3RlZE9wdGlvbigpIHtcbiAgICAvLyBOdWxsIGNoZWNrIHRoZSBvcHRpb25zIHNpbmNlIHRoZXkgb25seSBnZXQgZGVmaW5lZCBhZnRlciBgbmdBZnRlckNvbnRlbnRJbml0YC5cbiAgICBjb25zdCBzZWxlY3RlZCA9IHRoaXMub3B0aW9ucz8uZmluZChvcHRpb24gPT4gb3B0aW9uLmlzU2VsZWN0ZWQoKSk7XG5cbiAgICBpZiAoc2VsZWN0ZWQpIHtcbiAgICAgIHRoaXMubGlzdEtleU1hbmFnZXIudXBkYXRlQWN0aXZlSXRlbShzZWxlY3RlZCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFVwZGF0ZSB0aGUgaW50ZXJuYWwgdmFsdWUgb2YgdGhlIGxpc3Rib3ggYmFzZWQgb24gdGhlIHNlbGVjdGlvbiBtb2RlbC4gKi9cbiAgcHJpdmF0ZSBfdXBkYXRlSW50ZXJuYWxWYWx1ZSgpIHtcbiAgICBjb25zdCBpbmRleENhY2hlID0gbmV3IE1hcDxULCBudW1iZXI+KCk7XG4gICAgdGhpcy5zZWxlY3Rpb25Nb2RlbC5zb3J0KChhOiBULCBiOiBUKSA9PiB7XG4gICAgICBjb25zdCBhSW5kZXggPSB0aGlzLl9nZXRJbmRleEZvclZhbHVlKGluZGV4Q2FjaGUsIGEpO1xuICAgICAgY29uc3QgYkluZGV4ID0gdGhpcy5fZ2V0SW5kZXhGb3JWYWx1ZShpbmRleENhY2hlLCBiKTtcbiAgICAgIHJldHVybiBhSW5kZXggLSBiSW5kZXg7XG4gICAgfSk7XG4gICAgY29uc3Qgc2VsZWN0ZWQgPSB0aGlzLnNlbGVjdGlvbk1vZGVsLnNlbGVjdGVkO1xuICAgIHRoaXMuX2ludmFsaWQgPVxuICAgICAgKCF0aGlzLm11bHRpcGxlICYmIHNlbGVjdGVkLmxlbmd0aCA+IDEpIHx8ICEhdGhpcy5fZ2V0SW52YWxpZE9wdGlvblZhbHVlcyhzZWxlY3RlZCkubGVuZ3RoO1xuICAgIHRoaXMuY2hhbmdlRGV0ZWN0b3JSZWYubWFya0ZvckNoZWNrKCk7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgaW5kZXggb2YgdGhlIGdpdmVuIHZhbHVlIGluIHRoZSBnaXZlbiBsaXN0IG9mIG9wdGlvbnMuXG4gICAqIEBwYXJhbSBjYWNoZSBUaGUgY2FjaGUgb2YgaW5kaWNlcyBmb3VuZCBzbyBmYXJcbiAgICogQHBhcmFtIHZhbHVlIFRoZSB2YWx1ZSB0byBmaW5kXG4gICAqIEByZXR1cm4gVGhlIGluZGV4IG9mIHRoZSB2YWx1ZSBpbiB0aGUgb3B0aW9ucyBsaXN0XG4gICAqL1xuICBwcml2YXRlIF9nZXRJbmRleEZvclZhbHVlKGNhY2hlOiBNYXA8VCwgbnVtYmVyPiwgdmFsdWU6IFQpIHtcbiAgICBjb25zdCBpc0VxdWFsID0gdGhpcy5jb21wYXJlV2l0aCB8fCBPYmplY3QuaXM7XG4gICAgaWYgKCFjYWNoZS5oYXModmFsdWUpKSB7XG4gICAgICBsZXQgaW5kZXggPSAtMTtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5vcHRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChpc0VxdWFsKHZhbHVlLCB0aGlzLm9wdGlvbnMuZ2V0KGkpIS52YWx1ZSkpIHtcbiAgICAgICAgICBpbmRleCA9IGk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGNhY2hlLnNldCh2YWx1ZSwgaW5kZXgpO1xuICAgIH1cbiAgICByZXR1cm4gY2FjaGUuZ2V0KHZhbHVlKSE7XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlIHRoZSB1c2VyIGNsaWNraW5nIGFuIG9wdGlvbi5cbiAgICogQHBhcmFtIG9wdGlvbiBUaGUgb3B0aW9uIHRoYXQgd2FzIGNsaWNrZWQuXG4gICAqL1xuICBwcml2YXRlIF9oYW5kbGVPcHRpb25DbGlja2VkKG9wdGlvbjogQ2RrT3B0aW9uPFQ+LCBldmVudDogTW91c2VFdmVudCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgdGhpcy5saXN0S2V5TWFuYWdlci5zZXRBY3RpdmVJdGVtKG9wdGlvbik7XG4gICAgaWYgKGV2ZW50LnNoaWZ0S2V5ICYmIHRoaXMubXVsdGlwbGUpIHtcbiAgICAgIHRoaXMudHJpZ2dlclJhbmdlKFxuICAgICAgICBvcHRpb24sXG4gICAgICAgIHRoaXMuX2dldExhc3RUcmlnZ2VyZWRJbmRleCgpID8/IHRoaXMubGlzdEtleU1hbmFnZXIuYWN0aXZlSXRlbUluZGV4ISxcbiAgICAgICAgdGhpcy5saXN0S2V5TWFuYWdlci5hY3RpdmVJdGVtSW5kZXghLFxuICAgICAgICAhb3B0aW9uLmlzU2VsZWN0ZWQoKSxcbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMudHJpZ2dlck9wdGlvbihvcHRpb24pO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBWZXJpZmllcyB0aGF0IG5vIHR3byBvcHRpb25zIHJlcHJlc2VudCB0aGUgc2FtZSB2YWx1ZSB1bmRlciB0aGUgY29tcGFyZVdpdGggZnVuY3Rpb24uICovXG4gIHByaXZhdGUgX3ZlcmlmeU5vT3B0aW9uVmFsdWVDb2xsaXNpb25zKCkge1xuICAgIHRoaXMub3B0aW9ucy5jaGFuZ2VzLnBpcGUoc3RhcnRXaXRoKHRoaXMub3B0aW9ucyksIHRha2VVbnRpbCh0aGlzLmRlc3Ryb3llZCkpLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICBjb25zdCBpc0VxdWFsID0gdGhpcy5jb21wYXJlV2l0aCA/PyBPYmplY3QuaXM7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMub3B0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBvcHRpb24gPSB0aGlzLm9wdGlvbnMuZ2V0KGkpITtcbiAgICAgICAgbGV0IGR1cGxpY2F0ZTogQ2RrT3B0aW9uPFQ+IHwgbnVsbCA9IG51bGw7XG4gICAgICAgIGZvciAobGV0IGogPSBpICsgMTsgaiA8IHRoaXMub3B0aW9ucy5sZW5ndGg7IGorKykge1xuICAgICAgICAgIGNvbnN0IG90aGVyID0gdGhpcy5vcHRpb25zLmdldChqKSE7XG4gICAgICAgICAgaWYgKGlzRXF1YWwob3B0aW9uLnZhbHVlLCBvdGhlci52YWx1ZSkpIHtcbiAgICAgICAgICAgIGR1cGxpY2F0ZSA9IG90aGVyO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChkdXBsaWNhdGUpIHtcbiAgICAgICAgICAvLyBUT0RPKG1tYWxlcmJhKTogTGluayB0byBkb2NzIGFib3V0IHRoaXMuXG4gICAgICAgICAgaWYgKHRoaXMuY29tcGFyZVdpdGgpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgICAgICAgYEZvdW5kIG11bHRpcGxlIENka09wdGlvbiByZXByZXNlbnRpbmcgdGhlIHNhbWUgdmFsdWUgdW5kZXIgdGhlIGdpdmVuIGNvbXBhcmVXaXRoIGZ1bmN0aW9uYCxcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG9wdGlvbjE6IG9wdGlvbi5lbGVtZW50LFxuICAgICAgICAgICAgICAgIG9wdGlvbjI6IGR1cGxpY2F0ZS5lbGVtZW50LFxuICAgICAgICAgICAgICAgIGNvbXBhcmVXaXRoOiB0aGlzLmNvbXBhcmVXaXRoLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBGb3VuZCBtdWx0aXBsZSBDZGtPcHRpb24gd2l0aCB0aGUgc2FtZSB2YWx1ZWAsIHtcbiAgICAgICAgICAgICAgb3B0aW9uMTogb3B0aW9uLmVsZW1lbnQsXG4gICAgICAgICAgICAgIG9wdGlvbjI6IGR1cGxpY2F0ZS5lbGVtZW50LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqIFZlcmlmaWVzIHRoYXQgdGhlIG9wdGlvbiB2YWx1ZXMgYXJlIHZhbGlkLiAqL1xuICBwcml2YXRlIF92ZXJpZnlPcHRpb25WYWx1ZXMoKSB7XG4gICAgaWYgKHRoaXMub3B0aW9ucyAmJiAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSkge1xuICAgICAgY29uc3Qgc2VsZWN0ZWQgPSB0aGlzLnNlbGVjdGlvbk1vZGVsLnNlbGVjdGVkO1xuICAgICAgY29uc3QgaW52YWxpZFZhbHVlcyA9IHRoaXMuX2dldEludmFsaWRPcHRpb25WYWx1ZXMoc2VsZWN0ZWQpO1xuXG4gICAgICBpZiAoIXRoaXMubXVsdGlwbGUgJiYgc2VsZWN0ZWQubGVuZ3RoID4gMSkge1xuICAgICAgICB0aHJvdyBFcnJvcignTGlzdGJveCBjYW5ub3QgaGF2ZSBtb3JlIHRoYW4gb25lIHNlbGVjdGVkIHZhbHVlIGluIG11bHRpLXNlbGVjdGlvbiBtb2RlLicpO1xuICAgICAgfVxuXG4gICAgICBpZiAoaW52YWxpZFZhbHVlcy5sZW5ndGgpIHtcbiAgICAgICAgdGhyb3cgRXJyb3IoJ0xpc3Rib3ggaGFzIHNlbGVjdGVkIHZhbHVlcyB0aGF0IGRvIG5vdCBtYXRjaCBhbnkgb2YgaXRzIG9wdGlvbnMuJyk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENvZXJjZXMgYSB2YWx1ZSBpbnRvIGFuIGFycmF5IHJlcHJlc2VudGluZyBhIGxpc3Rib3ggc2VsZWN0aW9uLlxuICAgKiBAcGFyYW0gdmFsdWUgVGhlIHZhbHVlIHRvIGNvZXJjZVxuICAgKiBAcmV0dXJuIEFuIGFycmF5XG4gICAqL1xuICBwcml2YXRlIF9jb2VyY2VWYWx1ZSh2YWx1ZTogcmVhZG9ubHkgVFtdKSB7XG4gICAgcmV0dXJuIHZhbHVlID09IG51bGwgPyBbXSA6IGNvZXJjZUFycmF5KHZhbHVlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIHN1Ymxpc3Qgb2YgdmFsdWVzIHRoYXQgZG8gbm90IHJlcHJlc2VudCB2YWxpZCBvcHRpb24gdmFsdWVzIGluIHRoaXMgbGlzdGJveC5cbiAgICogQHBhcmFtIHZhbHVlcyBUaGUgbGlzdCBvZiB2YWx1ZXNcbiAgICogQHJldHVybiBUaGUgc3VibGlzdCBvZiB2YWx1ZXMgdGhhdCBhcmUgbm90IHZhbGlkIG9wdGlvbiB2YWx1ZXNcbiAgICovXG4gIHByaXZhdGUgX2dldEludmFsaWRPcHRpb25WYWx1ZXModmFsdWVzOiByZWFkb25seSBUW10pIHtcbiAgICBjb25zdCBpc0VxdWFsID0gdGhpcy5jb21wYXJlV2l0aCB8fCBPYmplY3QuaXM7XG4gICAgY29uc3QgdmFsaWRWYWx1ZXMgPSAodGhpcy5vcHRpb25zIHx8IFtdKS5tYXAob3B0aW9uID0+IG9wdGlvbi52YWx1ZSk7XG4gICAgcmV0dXJuIHZhbHVlcy5maWx0ZXIodmFsdWUgPT4gIXZhbGlkVmFsdWVzLnNvbWUodmFsaWRWYWx1ZSA9PiBpc0VxdWFsKHZhbHVlLCB2YWxpZFZhbHVlKSkpO1xuICB9XG5cbiAgLyoqIEdldCB0aGUgaW5kZXggb2YgdGhlIGxhc3QgdHJpZ2dlcmVkIG9wdGlvbi4gKi9cbiAgcHJpdmF0ZSBfZ2V0TGFzdFRyaWdnZXJlZEluZGV4KCkge1xuICAgIGNvbnN0IGluZGV4ID0gdGhpcy5vcHRpb25zLnRvQXJyYXkoKS5pbmRleE9mKHRoaXMuX2xhc3RUcmlnZ2VyZWQhKTtcbiAgICByZXR1cm4gaW5kZXggPT09IC0xID8gbnVsbCA6IGluZGV4O1xuICB9XG59XG5cbi8qKiBDaGFuZ2UgZXZlbnQgdGhhdCBpcyBmaXJlZCB3aGVuZXZlciB0aGUgdmFsdWUgb2YgdGhlIGxpc3Rib3ggY2hhbmdlcy4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTGlzdGJveFZhbHVlQ2hhbmdlRXZlbnQ8VD4ge1xuICAvKiogVGhlIG5ldyB2YWx1ZSBvZiB0aGUgbGlzdGJveC4gKi9cbiAgcmVhZG9ubHkgdmFsdWU6IHJlYWRvbmx5IFRbXTtcblxuICAvKiogUmVmZXJlbmNlIHRvIHRoZSBsaXN0Ym94IHRoYXQgZW1pdHRlZCB0aGUgZXZlbnQuICovXG4gIHJlYWRvbmx5IGxpc3Rib3g6IENka0xpc3Rib3g8VD47XG5cbiAgLyoqIFJlZmVyZW5jZSB0byB0aGUgb3B0aW9uIHRoYXQgd2FzIHRyaWdnZXJlZC4gKi9cbiAgcmVhZG9ubHkgb3B0aW9uOiBDZGtPcHRpb248VD4gfCBudWxsO1xufVxuIl19