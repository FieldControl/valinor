/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { FocusKeyManager, FocusMonitor } from '@angular/cdk/a11y';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { SelectionModel } from '@angular/cdk/collections';
import { A, DOWN_ARROW, ENTER, hasModifierKey, SPACE, UP_ARROW, } from '@angular/cdk/keycodes';
import { Attribute, ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChild, ContentChildren, ElementRef, EventEmitter, forwardRef, Inject, Input, Output, QueryList, ViewChild, ViewEncapsulation, } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatLine, mixinDisableRipple, setLines, } from '@angular/material/core';
import { Subject } from 'rxjs';
import { startWith, takeUntil } from 'rxjs/operators';
import { MatListAvatarCssMatStyler, MatListIconCssMatStyler } from './list';
class MatSelectionListBase {
}
const _MatSelectionListMixinBase = mixinDisableRipple(MatSelectionListBase);
class MatListOptionBase {
}
const _MatListOptionMixinBase = mixinDisableRipple(MatListOptionBase);
/** @docs-private */
export const MAT_SELECTION_LIST_VALUE_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => MatSelectionList),
    multi: true
};
/** Change event that is being fired whenever the selected state of an option changes. */
export class MatSelectionListChange {
    constructor(
    /** Reference to the selection list that emitted the event. */
    source, 
    /**
     * Reference to the option that has been changed.
     * @deprecated Use `options` instead, because some events may change more than one option.
     * @breaking-change 12.0.0
     */
    option, 
    /** Reference to the options that have been changed. */
    options) {
        this.source = source;
        this.option = option;
        this.options = options;
    }
}
/**
 * Component for list-options of selection-list. Each list-option can automatically
 * generate a checkbox and can put current item into the selectionModel of selection-list
 * if the current item is selected.
 */
export class MatListOption extends _MatListOptionMixinBase {
    constructor(_element, _changeDetector, 
    /** @docs-private */
    selectionList) {
        super();
        this._element = _element;
        this._changeDetector = _changeDetector;
        this.selectionList = selectionList;
        this._selected = false;
        this._disabled = false;
        this._hasFocus = false;
        /** Whether the label should appear before or after the checkbox. Defaults to 'after' */
        this.checkboxPosition = 'after';
        /**
         * This is set to true after the first OnChanges cycle so we don't clear the value of `selected`
         * in the first cycle.
         */
        this._inputsInitialized = false;
    }
    /** Theme color of the list option. This sets the color of the checkbox. */
    get color() { return this._color || this.selectionList.color; }
    set color(newValue) { this._color = newValue; }
    /** Value of the option */
    get value() { return this._value; }
    set value(newValue) {
        if (this.selected &&
            !this.selectionList.compareWith(newValue, this.value) &&
            this._inputsInitialized) {
            this.selected = false;
        }
        this._value = newValue;
    }
    /** Whether the option is disabled. */
    get disabled() { return this._disabled || (this.selectionList && this.selectionList.disabled); }
    set disabled(value) {
        const newValue = coerceBooleanProperty(value);
        if (newValue !== this._disabled) {
            this._disabled = newValue;
            this._changeDetector.markForCheck();
        }
    }
    /** Whether the option is selected. */
    get selected() { return this.selectionList.selectedOptions.isSelected(this); }
    set selected(value) {
        const isSelected = coerceBooleanProperty(value);
        if (isSelected !== this._selected) {
            this._setSelected(isSelected);
            if (isSelected || this.selectionList.multiple) {
                this.selectionList._reportValueChange();
            }
        }
    }
    ngOnInit() {
        const list = this.selectionList;
        if (list._value && list._value.some(value => list.compareWith(value, this._value))) {
            this._setSelected(true);
        }
        const wasSelected = this._selected;
        // List options that are selected at initialization can't be reported properly to the form
        // control. This is because it takes some time until the selection-list knows about all
        // available options. Also it can happen that the ControlValueAccessor has an initial value
        // that should be used instead. Deferring the value change report to the next tick ensures
        // that the form control value is not being overwritten.
        Promise.resolve().then(() => {
            if (this._selected || wasSelected) {
                this.selected = true;
                this._changeDetector.markForCheck();
            }
        });
        this._inputsInitialized = true;
    }
    ngAfterContentInit() {
        setLines(this._lines, this._element);
    }
    ngOnDestroy() {
        if (this.selected) {
            // We have to delay this until the next tick in order
            // to avoid changed after checked errors.
            Promise.resolve().then(() => {
                this.selected = false;
            });
        }
        const hadFocus = this._hasFocus;
        const newActiveItem = this.selectionList._removeOptionFromList(this);
        // Only move focus if this option was focused at the time it was destroyed.
        if (hadFocus && newActiveItem) {
            newActiveItem.focus();
        }
    }
    /** Toggles the selection state of the option. */
    toggle() {
        this.selected = !this.selected;
    }
    /** Allows for programmatic focusing of the option. */
    focus() {
        this._element.nativeElement.focus();
    }
    /**
     * Returns the list item's text label. Implemented as a part of the FocusKeyManager.
     * @docs-private
     */
    getLabel() {
        return this._text ? (this._text.nativeElement.textContent || '') : '';
    }
    /** Whether this list item should show a ripple effect when clicked. */
    _isRippleDisabled() {
        return this.disabled || this.disableRipple || this.selectionList.disableRipple;
    }
    _handleClick() {
        if (!this.disabled && (this.selectionList.multiple || !this.selected)) {
            this.toggle();
            // Emit a change event if the selected state of the option changed through user interaction.
            this.selectionList._emitChangeEvent([this]);
        }
    }
    _handleFocus() {
        this.selectionList._setFocusedOption(this);
        this._hasFocus = true;
    }
    _handleBlur() {
        this.selectionList._onTouched();
        this._hasFocus = false;
    }
    /** Retrieves the DOM element of the component host. */
    _getHostElement() {
        return this._element.nativeElement;
    }
    /** Sets the selected state of the option. Returns whether the value has changed. */
    _setSelected(selected) {
        if (selected === this._selected) {
            return false;
        }
        this._selected = selected;
        if (selected) {
            this.selectionList.selectedOptions.select(this);
        }
        else {
            this.selectionList.selectedOptions.deselect(this);
        }
        this._changeDetector.markForCheck();
        return true;
    }
    /**
     * Notifies Angular that the option needs to be checked in the next change detection run. Mainly
     * used to trigger an update of the list option if the disabled state of the selection list
     * changed.
     */
    _markForCheck() {
        this._changeDetector.markForCheck();
    }
}
MatListOption.decorators = [
    { type: Component, args: [{
                selector: 'mat-list-option',
                exportAs: 'matListOption',
                inputs: ['disableRipple'],
                host: {
                    'role': 'option',
                    'class': 'mat-list-item mat-list-option mat-focus-indicator',
                    '(focus)': '_handleFocus()',
                    '(blur)': '_handleBlur()',
                    '(click)': '_handleClick()',
                    '[class.mat-list-item-disabled]': 'disabled',
                    '[class.mat-list-item-with-avatar]': '_avatar || _icon',
                    // Manually set the "primary" or "warn" class if the color has been explicitly
                    // set to "primary" or "warn". The pseudo checkbox picks up these classes for
                    // its theme.
                    '[class.mat-primary]': 'color === "primary"',
                    // Even though accent is the default, we need to set this class anyway, because the  list might
                    // be placed inside a parent that has one of the other colors with a higher specificity.
                    '[class.mat-accent]': 'color !== "primary" && color !== "warn"',
                    '[class.mat-warn]': 'color === "warn"',
                    '[class.mat-list-single-selected-option]': 'selected && !selectionList.multiple',
                    '[attr.aria-selected]': 'selected',
                    '[attr.aria-disabled]': 'disabled',
                    '[attr.tabindex]': '-1',
                },
                template: "<div class=\"mat-list-item-content\"\n  [class.mat-list-item-content-reverse]=\"checkboxPosition == 'after'\">\n\n  <div mat-ripple\n    class=\"mat-list-item-ripple\"\n    [matRippleTrigger]=\"_getHostElement()\"\n    [matRippleDisabled]=\"_isRippleDisabled()\"></div>\n\n  <mat-pseudo-checkbox\n    *ngIf=\"selectionList.multiple\"\n    [state]=\"selected ? 'checked' : 'unchecked'\"\n    [disabled]=\"disabled\"></mat-pseudo-checkbox>\n\n  <div class=\"mat-list-text\" #text><ng-content></ng-content></div>\n\n  <ng-content select=\"[mat-list-avatar], [mat-list-icon], [matListAvatar], [matListIcon]\">\n  </ng-content>\n\n</div>\n",
                encapsulation: ViewEncapsulation.None,
                changeDetection: ChangeDetectionStrategy.OnPush
            },] }
];
MatListOption.ctorParameters = () => [
    { type: ElementRef },
    { type: ChangeDetectorRef },
    { type: MatSelectionList, decorators: [{ type: Inject, args: [forwardRef(() => MatSelectionList),] }] }
];
MatListOption.propDecorators = {
    _avatar: [{ type: ContentChild, args: [MatListAvatarCssMatStyler,] }],
    _icon: [{ type: ContentChild, args: [MatListIconCssMatStyler,] }],
    _lines: [{ type: ContentChildren, args: [MatLine, { descendants: true },] }],
    _text: [{ type: ViewChild, args: ['text',] }],
    checkboxPosition: [{ type: Input }],
    color: [{ type: Input }],
    value: [{ type: Input }],
    disabled: [{ type: Input }],
    selected: [{ type: Input }]
};
/**
 * Material Design list component where each item is a selectable option. Behaves as a listbox.
 */
export class MatSelectionList extends _MatSelectionListMixinBase {
    constructor(_element, 
    // @breaking-change 11.0.0 Remove `tabIndex` parameter.
    tabIndex, _changeDetector, 
    // @breaking-change 11.0.0 `_focusMonitor` parameter to become required.
    _focusMonitor) {
        super();
        this._element = _element;
        this._changeDetector = _changeDetector;
        this._focusMonitor = _focusMonitor;
        this._multiple = true;
        this._contentInitialized = false;
        /** Emits a change event whenever the selected state of an option changes. */
        this.selectionChange = new EventEmitter();
        /**
         * Tabindex of the selection list.
         * @breaking-change 11.0.0 Remove `tabIndex` input.
         */
        this.tabIndex = 0;
        /** Theme color of the selection list. This sets the checkbox color for all list options. */
        this.color = 'accent';
        /**
         * Function used for comparing an option against the selected value when determining which
         * options should appear as selected. The first argument is the value of an options. The second
         * one is a value from the selected value. A boolean must be returned.
         */
        this.compareWith = (a1, a2) => a1 === a2;
        this._disabled = false;
        /** The currently selected options. */
        this.selectedOptions = new SelectionModel(this._multiple);
        /** The tabindex of the selection list. */
        this._tabIndex = -1;
        /** View to model callback that should be called whenever the selected options change. */
        this._onChange = (_) => { };
        /** Emits when the list has been destroyed. */
        this._destroyed = new Subject();
        /** View to model callback that should be called if the list or its options lost focus. */
        this._onTouched = () => { };
    }
    /** Whether the selection list is disabled. */
    get disabled() { return this._disabled; }
    set disabled(value) {
        this._disabled = coerceBooleanProperty(value);
        // The `MatSelectionList` and `MatListOption` are using the `OnPush` change detection
        // strategy. Therefore the options will not check for any changes if the `MatSelectionList`
        // changed its state. Since we know that a change to `disabled` property of the list affects
        // the state of the options, we manually mark each option for check.
        this._markOptionsForCheck();
    }
    /** Whether selection is limited to one or multiple items (default multiple). */
    get multiple() { return this._multiple; }
    set multiple(value) {
        const newValue = coerceBooleanProperty(value);
        if (newValue !== this._multiple) {
            if (this._contentInitialized && (typeof ngDevMode === 'undefined' || ngDevMode)) {
                throw new Error('Cannot change `multiple` mode of mat-selection-list after initialization.');
            }
            this._multiple = newValue;
            this.selectedOptions = new SelectionModel(this._multiple, this.selectedOptions.selected);
        }
    }
    ngAfterContentInit() {
        var _a;
        this._contentInitialized = true;
        this._keyManager = new FocusKeyManager(this.options)
            .withWrap()
            .withTypeAhead()
            .withHomeAndEnd()
            // Allow disabled items to be focusable. For accessibility reasons, there must be a way for
            // screenreader users, that allows reading the different options of the list.
            .skipPredicate(() => false)
            .withAllowedModifierKeys(['shiftKey']);
        if (this._value) {
            this._setOptionsFromValues(this._value);
        }
        // If the user attempts to tab out of the selection list, allow focus to escape.
        this._keyManager.tabOut.pipe(takeUntil(this._destroyed)).subscribe(() => {
            this._allowFocusEscape();
        });
        // When the number of options change, update the tabindex of the selection list.
        this.options.changes.pipe(startWith(null), takeUntil(this._destroyed)).subscribe(() => {
            this._updateTabIndex();
        });
        // Sync external changes to the model back to the options.
        this.selectedOptions.changed.pipe(takeUntil(this._destroyed)).subscribe(event => {
            if (event.added) {
                for (let item of event.added) {
                    item.selected = true;
                }
            }
            if (event.removed) {
                for (let item of event.removed) {
                    item.selected = false;
                }
            }
        });
        // @breaking-change 11.0.0 Remove null assertion once _focusMonitor is required.
        (_a = this._focusMonitor) === null || _a === void 0 ? void 0 : _a.monitor(this._element).pipe(takeUntil(this._destroyed)).subscribe(origin => {
            if (origin === 'keyboard' || origin === 'program') {
                const activeIndex = this._keyManager.activeItemIndex;
                if (!activeIndex || activeIndex === -1) {
                    // If there is no active index, set focus to the first option.
                    this._keyManager.setFirstItemActive();
                }
                else {
                    // Otherwise, set focus to the active option.
                    this._keyManager.setActiveItem(activeIndex);
                }
            }
        });
    }
    ngOnChanges(changes) {
        const disableRippleChanges = changes['disableRipple'];
        const colorChanges = changes['color'];
        if ((disableRippleChanges && !disableRippleChanges.firstChange) ||
            (colorChanges && !colorChanges.firstChange)) {
            this._markOptionsForCheck();
        }
    }
    ngOnDestroy() {
        var _a;
        // @breaking-change 11.0.0 Remove null assertion once _focusMonitor is required.
        (_a = this._focusMonitor) === null || _a === void 0 ? void 0 : _a.stopMonitoring(this._element);
        this._destroyed.next();
        this._destroyed.complete();
        this._isDestroyed = true;
    }
    /** Focuses the selection list. */
    focus(options) {
        this._element.nativeElement.focus(options);
    }
    /** Selects all of the options. Returns the options that changed as a result. */
    selectAll() {
        return this._setAllOptionsSelected(true);
    }
    /** Deselects all of the options. Returns the options that changed as a result. */
    deselectAll() {
        return this._setAllOptionsSelected(false);
    }
    /** Sets the focused option of the selection-list. */
    _setFocusedOption(option) {
        this._keyManager.updateActiveItem(option);
    }
    /**
     * Removes an option from the selection list and updates the active item.
     * @returns Currently-active item.
     */
    _removeOptionFromList(option) {
        const optionIndex = this._getOptionIndex(option);
        if (optionIndex > -1 && this._keyManager.activeItemIndex === optionIndex) {
            // Check whether the option is the last item
            if (optionIndex > 0) {
                this._keyManager.updateActiveItem(optionIndex - 1);
            }
            else if (optionIndex === 0 && this.options.length > 1) {
                this._keyManager.updateActiveItem(Math.min(optionIndex + 1, this.options.length - 1));
            }
        }
        return this._keyManager.activeItem;
    }
    /** Passes relevant key presses to our key manager. */
    _keydown(event) {
        const keyCode = event.keyCode;
        const manager = this._keyManager;
        const previousFocusIndex = manager.activeItemIndex;
        const hasModifier = hasModifierKey(event);
        switch (keyCode) {
            case SPACE:
            case ENTER:
                if (!hasModifier && !manager.isTyping()) {
                    this._toggleFocusedOption();
                    // Always prevent space from scrolling the page since the list has focus
                    event.preventDefault();
                }
                break;
            default:
                // The "A" key gets special treatment, because it's used for the "select all" functionality.
                if (keyCode === A && this.multiple && hasModifierKey(event, 'ctrlKey') &&
                    !manager.isTyping()) {
                    const shouldSelect = this.options.some(option => !option.disabled && !option.selected);
                    this._setAllOptionsSelected(shouldSelect, true, true);
                    event.preventDefault();
                }
                else {
                    manager.onKeydown(event);
                }
        }
        if (this.multiple && (keyCode === UP_ARROW || keyCode === DOWN_ARROW) && event.shiftKey &&
            manager.activeItemIndex !== previousFocusIndex) {
            this._toggleFocusedOption();
        }
    }
    /** Reports a value change to the ControlValueAccessor */
    _reportValueChange() {
        // Stop reporting value changes after the list has been destroyed. This avoids
        // cases where the list might wrongly reset its value once it is removed, but
        // the form control is still live.
        if (this.options && !this._isDestroyed) {
            const value = this._getSelectedOptionValues();
            this._onChange(value);
            this._value = value;
        }
    }
    /** Emits a change event if the selected state of an option changed. */
    _emitChangeEvent(options) {
        this.selectionChange.emit(new MatSelectionListChange(this, options[0], options));
    }
    /** Implemented as part of ControlValueAccessor. */
    writeValue(values) {
        this._value = values;
        if (this.options) {
            this._setOptionsFromValues(values || []);
        }
    }
    /** Implemented as a part of ControlValueAccessor. */
    setDisabledState(isDisabled) {
        this.disabled = isDisabled;
    }
    /** Implemented as part of ControlValueAccessor. */
    registerOnChange(fn) {
        this._onChange = fn;
    }
    /** Implemented as part of ControlValueAccessor. */
    registerOnTouched(fn) {
        this._onTouched = fn;
    }
    /** Sets the selected options based on the specified values. */
    _setOptionsFromValues(values) {
        this.options.forEach(option => option._setSelected(false));
        values.forEach(value => {
            const correspondingOption = this.options.find(option => {
                // Skip options that are already in the model. This allows us to handle cases
                // where the same primitive value is selected multiple times.
                return option.selected ? false : this.compareWith(option.value, value);
            });
            if (correspondingOption) {
                correspondingOption._setSelected(true);
            }
        });
    }
    /** Returns the values of the selected options. */
    _getSelectedOptionValues() {
        return this.options.filter(option => option.selected).map(option => option.value);
    }
    /** Toggles the state of the currently focused option if enabled. */
    _toggleFocusedOption() {
        let focusedIndex = this._keyManager.activeItemIndex;
        if (focusedIndex != null && this._isValidIndex(focusedIndex)) {
            let focusedOption = this.options.toArray()[focusedIndex];
            if (focusedOption && !focusedOption.disabled && (this._multiple || !focusedOption.selected)) {
                focusedOption.toggle();
                // Emit a change event because the focused option changed its state through user
                // interaction.
                this._emitChangeEvent([focusedOption]);
            }
        }
    }
    /**
     * Sets the selected state on all of the options
     * and emits an event if anything changed.
     */
    _setAllOptionsSelected(isSelected, skipDisabled, isUserInput) {
        // Keep track of whether anything changed, because we only want to
        // emit the changed event when something actually changed.
        const changedOptions = [];
        this.options.forEach(option => {
            if ((!skipDisabled || !option.disabled) && option._setSelected(isSelected)) {
                changedOptions.push(option);
            }
        });
        if (changedOptions.length) {
            this._reportValueChange();
            if (isUserInput) {
                this._emitChangeEvent(changedOptions);
            }
        }
        return changedOptions;
    }
    /**
     * Utility to ensure all indexes are valid.
     * @param index The index to be checked.
     * @returns True if the index is valid for our list of options.
     */
    _isValidIndex(index) {
        return index >= 0 && index < this.options.length;
    }
    /** Returns the index of the specified list option. */
    _getOptionIndex(option) {
        return this.options.toArray().indexOf(option);
    }
    /** Marks all the options to be checked in the next change detection run. */
    _markOptionsForCheck() {
        if (this.options) {
            this.options.forEach(option => option._markForCheck());
        }
    }
    /**
     * Removes the tabindex from the selection list and resets it back afterwards, allowing the user
     * to tab out of it. This prevents the list from capturing focus and redirecting it back within
     * the list, creating a focus trap if it user tries to tab away.
     */
    _allowFocusEscape() {
        this._tabIndex = -1;
        setTimeout(() => {
            this._tabIndex = 0;
            this._changeDetector.markForCheck();
        });
    }
    /** Updates the tabindex based upon if the selection list is empty. */
    _updateTabIndex() {
        this._tabIndex = (this.options.length === 0) ? -1 : 0;
    }
}
MatSelectionList.decorators = [
    { type: Component, args: [{
                selector: 'mat-selection-list',
                exportAs: 'matSelectionList',
                inputs: ['disableRipple'],
                host: {
                    'role': 'listbox',
                    'class': 'mat-selection-list mat-list-base',
                    '(keydown)': '_keydown($event)',
                    '[attr.aria-multiselectable]': 'multiple',
                    '[attr.aria-disabled]': 'disabled.toString()',
                    '[attr.tabindex]': '_tabIndex',
                },
                template: '<ng-content></ng-content>',
                encapsulation: ViewEncapsulation.None,
                providers: [MAT_SELECTION_LIST_VALUE_ACCESSOR],
                changeDetection: ChangeDetectionStrategy.OnPush,
                styles: [".mat-subheader{display:flex;box-sizing:border-box;padding:16px;align-items:center}.mat-list-base .mat-subheader{margin:0}.mat-list-base{padding-top:8px;display:block;-webkit-tap-highlight-color:transparent}.mat-list-base .mat-subheader{height:48px;line-height:16px}.mat-list-base .mat-subheader:first-child{margin-top:-8px}.mat-list-base .mat-list-item,.mat-list-base .mat-list-option{display:block;height:48px;-webkit-tap-highlight-color:transparent;width:100%;padding:0}.mat-list-base .mat-list-item .mat-list-item-content,.mat-list-base .mat-list-option .mat-list-item-content{display:flex;flex-direction:row;align-items:center;box-sizing:border-box;padding:0 16px;position:relative;height:inherit}.mat-list-base .mat-list-item .mat-list-item-content-reverse,.mat-list-base .mat-list-option .mat-list-item-content-reverse{display:flex;align-items:center;padding:0 16px;flex-direction:row-reverse;justify-content:space-around}.mat-list-base .mat-list-item .mat-list-item-ripple,.mat-list-base .mat-list-option .mat-list-item-ripple{top:0;left:0;right:0;bottom:0;position:absolute;pointer-events:none}.mat-list-base .mat-list-item.mat-list-item-with-avatar,.mat-list-base .mat-list-option.mat-list-item-with-avatar{height:56px}.mat-list-base .mat-list-item.mat-2-line,.mat-list-base .mat-list-option.mat-2-line{height:72px}.mat-list-base .mat-list-item.mat-3-line,.mat-list-base .mat-list-option.mat-3-line{height:88px}.mat-list-base .mat-list-item.mat-multi-line,.mat-list-base .mat-list-option.mat-multi-line{height:auto}.mat-list-base .mat-list-item.mat-multi-line .mat-list-item-content,.mat-list-base .mat-list-option.mat-multi-line .mat-list-item-content{padding-top:16px;padding-bottom:16px}.mat-list-base .mat-list-item .mat-list-text,.mat-list-base .mat-list-option .mat-list-text{display:flex;flex-direction:column;flex:auto;box-sizing:border-box;overflow:hidden;padding:0}.mat-list-base .mat-list-item .mat-list-text>*,.mat-list-base .mat-list-option .mat-list-text>*{margin:0;padding:0;font-weight:normal;font-size:inherit}.mat-list-base .mat-list-item .mat-list-text:empty,.mat-list-base .mat-list-option .mat-list-text:empty{display:none}.mat-list-base .mat-list-item.mat-list-item-with-avatar .mat-list-item-content .mat-list-text,.mat-list-base .mat-list-item.mat-list-option .mat-list-item-content .mat-list-text,.mat-list-base .mat-list-option.mat-list-item-with-avatar .mat-list-item-content .mat-list-text,.mat-list-base .mat-list-option.mat-list-option .mat-list-item-content .mat-list-text{padding-right:0;padding-left:16px}[dir=rtl] .mat-list-base .mat-list-item.mat-list-item-with-avatar .mat-list-item-content .mat-list-text,[dir=rtl] .mat-list-base .mat-list-item.mat-list-option .mat-list-item-content .mat-list-text,[dir=rtl] .mat-list-base .mat-list-option.mat-list-item-with-avatar .mat-list-item-content .mat-list-text,[dir=rtl] .mat-list-base .mat-list-option.mat-list-option .mat-list-item-content .mat-list-text{padding-right:16px;padding-left:0}.mat-list-base .mat-list-item.mat-list-item-with-avatar .mat-list-item-content-reverse .mat-list-text,.mat-list-base .mat-list-item.mat-list-option .mat-list-item-content-reverse .mat-list-text,.mat-list-base .mat-list-option.mat-list-item-with-avatar .mat-list-item-content-reverse .mat-list-text,.mat-list-base .mat-list-option.mat-list-option .mat-list-item-content-reverse .mat-list-text{padding-left:0;padding-right:16px}[dir=rtl] .mat-list-base .mat-list-item.mat-list-item-with-avatar .mat-list-item-content-reverse .mat-list-text,[dir=rtl] .mat-list-base .mat-list-item.mat-list-option .mat-list-item-content-reverse .mat-list-text,[dir=rtl] .mat-list-base .mat-list-option.mat-list-item-with-avatar .mat-list-item-content-reverse .mat-list-text,[dir=rtl] .mat-list-base .mat-list-option.mat-list-option .mat-list-item-content-reverse .mat-list-text{padding-right:0;padding-left:16px}.mat-list-base .mat-list-item.mat-list-item-with-avatar.mat-list-option .mat-list-item-content-reverse .mat-list-text,.mat-list-base .mat-list-item.mat-list-item-with-avatar.mat-list-option .mat-list-item-content .mat-list-text,.mat-list-base .mat-list-option.mat-list-item-with-avatar.mat-list-option .mat-list-item-content-reverse .mat-list-text,.mat-list-base .mat-list-option.mat-list-item-with-avatar.mat-list-option .mat-list-item-content .mat-list-text{padding-right:16px;padding-left:16px}.mat-list-base .mat-list-item .mat-list-avatar,.mat-list-base .mat-list-option .mat-list-avatar{flex-shrink:0;width:40px;height:40px;border-radius:50%;object-fit:cover}.mat-list-base .mat-list-item .mat-list-avatar~.mat-divider-inset,.mat-list-base .mat-list-option .mat-list-avatar~.mat-divider-inset{margin-left:72px;width:calc(100% - 72px)}[dir=rtl] .mat-list-base .mat-list-item .mat-list-avatar~.mat-divider-inset,[dir=rtl] .mat-list-base .mat-list-option .mat-list-avatar~.mat-divider-inset{margin-left:auto;margin-right:72px}.mat-list-base .mat-list-item .mat-list-icon,.mat-list-base .mat-list-option .mat-list-icon{flex-shrink:0;width:24px;height:24px;font-size:24px;box-sizing:content-box;border-radius:50%;padding:4px}.mat-list-base .mat-list-item .mat-list-icon~.mat-divider-inset,.mat-list-base .mat-list-option .mat-list-icon~.mat-divider-inset{margin-left:64px;width:calc(100% - 64px)}[dir=rtl] .mat-list-base .mat-list-item .mat-list-icon~.mat-divider-inset,[dir=rtl] .mat-list-base .mat-list-option .mat-list-icon~.mat-divider-inset{margin-left:auto;margin-right:64px}.mat-list-base .mat-list-item .mat-divider,.mat-list-base .mat-list-option .mat-divider{position:absolute;bottom:0;left:0;width:100%;margin:0}[dir=rtl] .mat-list-base .mat-list-item .mat-divider,[dir=rtl] .mat-list-base .mat-list-option .mat-divider{margin-left:auto;margin-right:0}.mat-list-base .mat-list-item .mat-divider.mat-divider-inset,.mat-list-base .mat-list-option .mat-divider.mat-divider-inset{position:absolute}.mat-list-base[dense]{padding-top:4px;display:block}.mat-list-base[dense] .mat-subheader{height:40px;line-height:8px}.mat-list-base[dense] .mat-subheader:first-child{margin-top:-4px}.mat-list-base[dense] .mat-list-item,.mat-list-base[dense] .mat-list-option{display:block;height:40px;-webkit-tap-highlight-color:transparent;width:100%;padding:0}.mat-list-base[dense] .mat-list-item .mat-list-item-content,.mat-list-base[dense] .mat-list-option .mat-list-item-content{display:flex;flex-direction:row;align-items:center;box-sizing:border-box;padding:0 16px;position:relative;height:inherit}.mat-list-base[dense] .mat-list-item .mat-list-item-content-reverse,.mat-list-base[dense] .mat-list-option .mat-list-item-content-reverse{display:flex;align-items:center;padding:0 16px;flex-direction:row-reverse;justify-content:space-around}.mat-list-base[dense] .mat-list-item .mat-list-item-ripple,.mat-list-base[dense] .mat-list-option .mat-list-item-ripple{top:0;left:0;right:0;bottom:0;position:absolute;pointer-events:none}.mat-list-base[dense] .mat-list-item.mat-list-item-with-avatar,.mat-list-base[dense] .mat-list-option.mat-list-item-with-avatar{height:48px}.mat-list-base[dense] .mat-list-item.mat-2-line,.mat-list-base[dense] .mat-list-option.mat-2-line{height:60px}.mat-list-base[dense] .mat-list-item.mat-3-line,.mat-list-base[dense] .mat-list-option.mat-3-line{height:76px}.mat-list-base[dense] .mat-list-item.mat-multi-line,.mat-list-base[dense] .mat-list-option.mat-multi-line{height:auto}.mat-list-base[dense] .mat-list-item.mat-multi-line .mat-list-item-content,.mat-list-base[dense] .mat-list-option.mat-multi-line .mat-list-item-content{padding-top:16px;padding-bottom:16px}.mat-list-base[dense] .mat-list-item .mat-list-text,.mat-list-base[dense] .mat-list-option .mat-list-text{display:flex;flex-direction:column;flex:auto;box-sizing:border-box;overflow:hidden;padding:0}.mat-list-base[dense] .mat-list-item .mat-list-text>*,.mat-list-base[dense] .mat-list-option .mat-list-text>*{margin:0;padding:0;font-weight:normal;font-size:inherit}.mat-list-base[dense] .mat-list-item .mat-list-text:empty,.mat-list-base[dense] .mat-list-option .mat-list-text:empty{display:none}.mat-list-base[dense] .mat-list-item.mat-list-item-with-avatar .mat-list-item-content .mat-list-text,.mat-list-base[dense] .mat-list-item.mat-list-option .mat-list-item-content .mat-list-text,.mat-list-base[dense] .mat-list-option.mat-list-item-with-avatar .mat-list-item-content .mat-list-text,.mat-list-base[dense] .mat-list-option.mat-list-option .mat-list-item-content .mat-list-text{padding-right:0;padding-left:16px}[dir=rtl] .mat-list-base[dense] .mat-list-item.mat-list-item-with-avatar .mat-list-item-content .mat-list-text,[dir=rtl] .mat-list-base[dense] .mat-list-item.mat-list-option .mat-list-item-content .mat-list-text,[dir=rtl] .mat-list-base[dense] .mat-list-option.mat-list-item-with-avatar .mat-list-item-content .mat-list-text,[dir=rtl] .mat-list-base[dense] .mat-list-option.mat-list-option .mat-list-item-content .mat-list-text{padding-right:16px;padding-left:0}.mat-list-base[dense] .mat-list-item.mat-list-item-with-avatar .mat-list-item-content-reverse .mat-list-text,.mat-list-base[dense] .mat-list-item.mat-list-option .mat-list-item-content-reverse .mat-list-text,.mat-list-base[dense] .mat-list-option.mat-list-item-with-avatar .mat-list-item-content-reverse .mat-list-text,.mat-list-base[dense] .mat-list-option.mat-list-option .mat-list-item-content-reverse .mat-list-text{padding-left:0;padding-right:16px}[dir=rtl] .mat-list-base[dense] .mat-list-item.mat-list-item-with-avatar .mat-list-item-content-reverse .mat-list-text,[dir=rtl] .mat-list-base[dense] .mat-list-item.mat-list-option .mat-list-item-content-reverse .mat-list-text,[dir=rtl] .mat-list-base[dense] .mat-list-option.mat-list-item-with-avatar .mat-list-item-content-reverse .mat-list-text,[dir=rtl] .mat-list-base[dense] .mat-list-option.mat-list-option .mat-list-item-content-reverse .mat-list-text{padding-right:0;padding-left:16px}.mat-list-base[dense] .mat-list-item.mat-list-item-with-avatar.mat-list-option .mat-list-item-content-reverse .mat-list-text,.mat-list-base[dense] .mat-list-item.mat-list-item-with-avatar.mat-list-option .mat-list-item-content .mat-list-text,.mat-list-base[dense] .mat-list-option.mat-list-item-with-avatar.mat-list-option .mat-list-item-content-reverse .mat-list-text,.mat-list-base[dense] .mat-list-option.mat-list-item-with-avatar.mat-list-option .mat-list-item-content .mat-list-text{padding-right:16px;padding-left:16px}.mat-list-base[dense] .mat-list-item .mat-list-avatar,.mat-list-base[dense] .mat-list-option .mat-list-avatar{flex-shrink:0;width:36px;height:36px;border-radius:50%;object-fit:cover}.mat-list-base[dense] .mat-list-item .mat-list-avatar~.mat-divider-inset,.mat-list-base[dense] .mat-list-option .mat-list-avatar~.mat-divider-inset{margin-left:68px;width:calc(100% - 68px)}[dir=rtl] .mat-list-base[dense] .mat-list-item .mat-list-avatar~.mat-divider-inset,[dir=rtl] .mat-list-base[dense] .mat-list-option .mat-list-avatar~.mat-divider-inset{margin-left:auto;margin-right:68px}.mat-list-base[dense] .mat-list-item .mat-list-icon,.mat-list-base[dense] .mat-list-option .mat-list-icon{flex-shrink:0;width:20px;height:20px;font-size:20px;box-sizing:content-box;border-radius:50%;padding:4px}.mat-list-base[dense] .mat-list-item .mat-list-icon~.mat-divider-inset,.mat-list-base[dense] .mat-list-option .mat-list-icon~.mat-divider-inset{margin-left:60px;width:calc(100% - 60px)}[dir=rtl] .mat-list-base[dense] .mat-list-item .mat-list-icon~.mat-divider-inset,[dir=rtl] .mat-list-base[dense] .mat-list-option .mat-list-icon~.mat-divider-inset{margin-left:auto;margin-right:60px}.mat-list-base[dense] .mat-list-item .mat-divider,.mat-list-base[dense] .mat-list-option .mat-divider{position:absolute;bottom:0;left:0;width:100%;margin:0}[dir=rtl] .mat-list-base[dense] .mat-list-item .mat-divider,[dir=rtl] .mat-list-base[dense] .mat-list-option .mat-divider{margin-left:auto;margin-right:0}.mat-list-base[dense] .mat-list-item .mat-divider.mat-divider-inset,.mat-list-base[dense] .mat-list-option .mat-divider.mat-divider-inset{position:absolute}.mat-nav-list a{text-decoration:none;color:inherit}.mat-nav-list .mat-list-item{cursor:pointer;outline:none}mat-action-list button{background:none;color:inherit;border:none;font:inherit;outline:inherit;-webkit-tap-highlight-color:transparent;text-align:left}[dir=rtl] mat-action-list button{text-align:right}mat-action-list button::-moz-focus-inner{border:0}mat-action-list .mat-list-item{cursor:pointer;outline:inherit}.mat-list-option:not(.mat-list-item-disabled){cursor:pointer;outline:none}.mat-list-item-disabled{pointer-events:none}.cdk-high-contrast-active .mat-list-item-disabled{opacity:.5}.cdk-high-contrast-active :host .mat-list-item-disabled{opacity:.5}.cdk-high-contrast-active .mat-selection-list:focus{outline-style:dotted}.cdk-high-contrast-active .mat-list-option:hover,.cdk-high-contrast-active .mat-list-option:focus,.cdk-high-contrast-active .mat-nav-list .mat-list-item:hover,.cdk-high-contrast-active .mat-nav-list .mat-list-item:focus,.cdk-high-contrast-active mat-action-list .mat-list-item:hover,.cdk-high-contrast-active mat-action-list .mat-list-item:focus{outline:dotted 1px}.cdk-high-contrast-active .mat-list-single-selected-option::after{content:\"\";position:absolute;top:50%;right:16px;transform:translateY(-50%);width:10px;height:0;border-bottom:solid 10px;border-radius:10px}.cdk-high-contrast-active [dir=rtl] .mat-list-single-selected-option::after{right:auto;left:16px}@media(hover: none){.mat-list-option:not(.mat-list-single-selected-option):not(.mat-list-item-disabled):hover,.mat-nav-list .mat-list-item:not(.mat-list-item-disabled):hover,.mat-action-list .mat-list-item:not(.mat-list-item-disabled):hover{background:none}}\n"]
            },] }
];
MatSelectionList.ctorParameters = () => [
    { type: ElementRef },
    { type: String, decorators: [{ type: Attribute, args: ['tabindex',] }] },
    { type: ChangeDetectorRef },
    { type: FocusMonitor }
];
MatSelectionList.propDecorators = {
    options: [{ type: ContentChildren, args: [MatListOption, { descendants: true },] }],
    selectionChange: [{ type: Output }],
    tabIndex: [{ type: Input }],
    color: [{ type: Input }],
    compareWith: [{ type: Input }],
    disabled: [{ type: Input }],
    multiple: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VsZWN0aW9uLWxpc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvbGlzdC9zZWxlY3Rpb24tbGlzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQWtCLGVBQWUsRUFBRSxZQUFZLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUNqRixPQUFPLEVBQWUscUJBQXFCLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUMxRSxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sMEJBQTBCLENBQUM7QUFDeEQsT0FBTyxFQUNMLENBQUMsRUFDRCxVQUFVLEVBQ1YsS0FBSyxFQUNMLGNBQWMsRUFDZCxLQUFLLEVBQ0wsUUFBUSxHQUNULE1BQU0sdUJBQXVCLENBQUM7QUFDL0IsT0FBTyxFQUVMLFNBQVMsRUFDVCx1QkFBdUIsRUFDdkIsaUJBQWlCLEVBQ2pCLFNBQVMsRUFDVCxZQUFZLEVBQ1osZUFBZSxFQUNmLFVBQVUsRUFDVixZQUFZLEVBQ1osVUFBVSxFQUNWLE1BQU0sRUFDTixLQUFLLEVBSUwsTUFBTSxFQUNOLFNBQVMsRUFFVCxTQUFTLEVBQ1QsaUJBQWlCLEdBQ2xCLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBdUIsaUJBQWlCLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUN2RSxPQUFPLEVBR0wsT0FBTyxFQUNQLGtCQUFrQixFQUNsQixRQUFRLEdBRVQsTUFBTSx3QkFBd0IsQ0FBQztBQUNoQyxPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQzdCLE9BQU8sRUFBQyxTQUFTLEVBQUUsU0FBUyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDcEQsT0FBTyxFQUFDLHlCQUF5QixFQUFFLHVCQUF1QixFQUFDLE1BQU0sUUFBUSxDQUFDO0FBRTFFLE1BQU0sb0JBQW9CO0NBQUc7QUFDN0IsTUFBTSwwQkFBMEIsR0FDNUIsa0JBQWtC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QUEyQjtnQkFFckMsYUFBYSxFQUFFLGlCQUFpQixDQUFDLElBQUk7Z0JBQ3JDLFNBQVMsRUFBRSxDQUFDLGlDQUFpQyxDQUFDO2dCQUM5QyxlQUFlLEVBQUUsdUJBQXVCLENBQUMsTUFBTTs7YUFDaEQ7OztZQWhVQyxVQUFVO3lDQXNaUCxTQUFTLFNBQUMsVUFBVTtZQTFadkIsaUJBQWlCO1lBZnVCLFlBQVk7OztzQkE2Vm5ELGVBQWUsU0FBQyxhQUFhLEVBQUUsRUFBQyxXQUFXLEVBQUUsSUFBSSxFQUFDOzhCQUdsRCxNQUFNO3VCQU9OLEtBQUs7b0JBR0wsS0FBSzswQkFPTCxLQUFLO3VCQUdMLEtBQUs7dUJBY0wsS0FBSyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0ZvY3VzYWJsZU9wdGlvbiwgRm9jdXNLZXlNYW5hZ2VyLCBGb2N1c01vbml0b3J9IGZyb20gJ0Bhbmd1bGFyL2Nkay9hMTF5JztcbmltcG9ydCB7Qm9vbGVhbklucHV0LCBjb2VyY2VCb29sZWFuUHJvcGVydHl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2VyY2lvbic7XG5pbXBvcnQge1NlbGVjdGlvbk1vZGVsfSBmcm9tICdAYW5ndWxhci9jZGsvY29sbGVjdGlvbnMnO1xuaW1wb3J0IHtcbiAgQSxcbiAgRE9XTl9BUlJPVyxcbiAgRU5URVIsXG4gIGhhc01vZGlmaWVyS2V5LFxuICBTUEFDRSxcbiAgVVBfQVJST1csXG59IGZyb20gJ0Bhbmd1bGFyL2Nkay9rZXljb2Rlcyc7XG5pbXBvcnQge1xuICBBZnRlckNvbnRlbnRJbml0LFxuICBBdHRyaWJ1dGUsXG4gIENoYW5nZURldGVjdGlvblN0cmF0ZWd5LFxuICBDaGFuZ2VEZXRlY3RvclJlZixcbiAgQ29tcG9uZW50LFxuICBDb250ZW50Q2hpbGQsXG4gIENvbnRlbnRDaGlsZHJlbixcbiAgRWxlbWVudFJlZixcbiAgRXZlbnRFbWl0dGVyLFxuICBmb3J3YXJkUmVmLFxuICBJbmplY3QsXG4gIElucHV0LFxuICBPbkNoYW5nZXMsXG4gIE9uRGVzdHJveSxcbiAgT25Jbml0LFxuICBPdXRwdXQsXG4gIFF1ZXJ5TGlzdCxcbiAgU2ltcGxlQ2hhbmdlcyxcbiAgVmlld0NoaWxkLFxuICBWaWV3RW5jYXBzdWxhdGlvbixcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0NvbnRyb2xWYWx1ZUFjY2Vzc29yLCBOR19WQUxVRV9BQ0NFU1NPUn0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xuaW1wb3J0IHtcbiAgQ2FuRGlzYWJsZVJpcHBsZSxcbiAgQ2FuRGlzYWJsZVJpcHBsZUN0b3IsXG4gIE1hdExpbmUsXG4gIG1peGluRGlzYWJsZVJpcHBsZSxcbiAgc2V0TGluZXMsXG4gIFRoZW1lUGFsZXR0ZSxcbn0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvY29yZSc7XG5pbXBvcnQge1N1YmplY3R9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtzdGFydFdpdGgsIHRha2VVbnRpbH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0IHtNYXRMaXN0QXZhdGFyQ3NzTWF0U3R5bGVyLCBNYXRMaXN0SWNvbkNzc01hdFN0eWxlcn0gZnJvbSAnLi9saXN0JztcblxuY2xhc3MgTWF0U2VsZWN0aW9uTGlzdEJhc2Uge31cbmNvbnN0IF9NYXRTZWxlY3Rpb25MaXN0TWl4aW5CYXNlOiBDYW5EaXNhYmxlUmlwcGxlQ3RvciAmIHR5cGVvZiBNYXRTZWxlY3Rpb25MaXN0QmFzZSA9XG4gICAgbWl4aW5EaXNhYmxlUmlwcGxlKE1hdFNlbGVjdGlvbkxpc3RCYXNlKTtcblxuY2xhc3MgTWF0TGlzdE9wdGlvbkJhc2Uge31cbmNvbnN0IF9NYXRMaXN0T3B0aW9uTWl4aW5CYXNlOiBDYW5EaXNhYmxlUmlwcGxlQ3RvciAmIHR5cGVvZiBNYXRMaXN0T3B0aW9uQmFzZSA9XG4gICAgbWl4aW5EaXNhYmxlUmlwcGxlKE1hdExpc3RPcHRpb25CYXNlKTtcblxuLyoqIEBkb2NzLXByaXZhdGUgKi9cbmV4cG9ydCBjb25zdCBNQVRfU0VMRUNUSU9OX0xJU1RfVkFMVUVfQUNDRVNTT1I6IGFueSA9IHtcbiAgcHJvdmlkZTogTkdfVkFMVUVfQUNDRVNTT1IsXG4gIHVzZUV4aXN0aW5nOiBmb3J3YXJkUmVmKCgpID0+IE1hdFNlbGVjdGlvbkxpc3QpLFxuICBtdWx0aTogdHJ1ZVxufTtcblxuLyoqIENoYW5nZSBldmVudCB0aGF0IGlzIGJlaW5nIGZpcmVkIHdoZW5ldmVyIHRoZSBzZWxlY3RlZCBzdGF0ZSBvZiBhbiBvcHRpb24gY2hhbmdlcy4gKi9cbmV4cG9ydCBjbGFzcyBNYXRTZWxlY3Rpb25MaXN0Q2hhbmdlIHtcbiAgY29uc3RydWN0b3IoXG4gICAgLyoqIFJlZmVyZW5jZSB0byB0aGUgc2VsZWN0aW9uIGxpc3QgdGhhdCBlbWl0dGVkIHRoZSBldmVudC4gKi9cbiAgICBwdWJsaWMgc291cmNlOiBNYXRTZWxlY3Rpb25MaXN0LFxuICAgIC8qKlxuICAgICAqIFJlZmVyZW5jZSB0byB0aGUgb3B0aW9uIHRoYXQgaGFzIGJlZW4gY2hhbmdlZC5cbiAgICAgKiBAZGVwcmVjYXRlZCBVc2UgYG9wdGlvbnNgIGluc3RlYWQsIGJlY2F1c2Ugc29tZSBldmVudHMgbWF5IGNoYW5nZSBtb3JlIHRoYW4gb25lIG9wdGlvbi5cbiAgICAgKiBAYnJlYWtpbmctY2hhbmdlIDEyLjAuMFxuICAgICAqL1xuICAgIHB1YmxpYyBvcHRpb246IE1hdExpc3RPcHRpb24sXG4gICAgLyoqIFJlZmVyZW5jZSB0byB0aGUgb3B0aW9ucyB0aGF0IGhhdmUgYmVlbiBjaGFuZ2VkLiAqL1xuICAgIHB1YmxpYyBvcHRpb25zOiBNYXRMaXN0T3B0aW9uW10pIHt9XG59XG5cbi8qKlxuICogVHlwZSBkZXNjcmliaW5nIHBvc3NpYmxlIHBvc2l0aW9ucyBvZiBhIGNoZWNrYm94IGluIGEgbGlzdCBvcHRpb25cbiAqIHdpdGggcmVzcGVjdCB0byB0aGUgbGlzdCBpdGVtJ3MgdGV4dC5cbiAqL1xuZXhwb3J0IHR5cGUgTWF0TGlzdE9wdGlvbkNoZWNrYm94UG9zaXRpb24gPSAnYmVmb3JlJ3wnYWZ0ZXInO1xuXG4vKipcbiAqIENvbXBvbmVudCBmb3IgbGlzdC1vcHRpb25zIG9mIHNlbGVjdGlvbi1saXN0LiBFYWNoIGxpc3Qtb3B0aW9uIGNhbiBhdXRvbWF0aWNhbGx5XG4gKiBnZW5lcmF0ZSBhIGNoZWNrYm94IGFuZCBjYW4gcHV0IGN1cnJlbnQgaXRlbSBpbnRvIHRoZSBzZWxlY3Rpb25Nb2RlbCBvZiBzZWxlY3Rpb24tbGlzdFxuICogaWYgdGhlIGN1cnJlbnQgaXRlbSBpcyBzZWxlY3RlZC5cbiAqL1xuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnbWF0LWxpc3Qtb3B0aW9uJyxcbiAgZXhwb3J0QXM6ICdtYXRMaXN0T3B0aW9uJyxcbiAgaW5wdXRzOiBbJ2Rpc2FibGVSaXBwbGUnXSxcbiAgaG9zdDoge1xuICAgICdyb2xlJzogJ29wdGlvbicsXG4gICAgJ2NsYXNzJzogJ21hdC1saXN0LWl0ZW0gbWF0LWxpc3Qtb3B0aW9uIG1hdC1mb2N1cy1pbmRpY2F0b3InLFxuICAgICcoZm9jdXMpJzogJ19oYW5kbGVGb2N1cygpJyxcbiAgICAnKGJsdXIpJzogJ19oYW5kbGVCbHVyKCknLFxuICAgICcoY2xpY2spJzogJ19oYW5kbGVDbGljaygpJyxcbiAgICAnW2NsYXNzLm1hdC1saXN0LWl0ZW0tZGlzYWJsZWRdJzogJ2Rpc2FibGVkJyxcbiAgICAnW2NsYXNzLm1hdC1saXN0LWl0ZW0td2l0aC1hdmF0YXJdJzogJ19hdmF0YXIgfHwgX2ljb24nLFxuICAgIC8vIE1hbnVhbGx5IHNldCB0aGUgXCJwcmltYXJ5XCIgb3IgXCJ3YXJuXCIgY2xhc3MgaWYgdGhlIGNvbG9yIGhhcyBiZWVuIGV4cGxpY2l0bHlcbiAgICAvLyBzZXQgdG8gXCJwcmltYXJ5XCIgb3IgXCJ3YXJuXCIuIFRoZSBwc2V1ZG8gY2hlY2tib3ggcGlja3MgdXAgdGhlc2UgY2xhc3NlcyBmb3JcbiAgICAvLyBpdHMgdGhlbWUuXG4gICAgJ1tjbGFzcy5tYXQtcHJpbWFyeV0nOiAnY29sb3IgPT09IFwicHJpbWFyeVwiJyxcbiAgICAvLyBFdmVuIHRob3VnaCBhY2NlbnQgaXMgdGhlIGRlZmF1bHQsIHdlIG5lZWQgdG8gc2V0IHRoaXMgY2xhc3MgYW55d2F5LCBiZWNhdXNlIHRoZSAgbGlzdCBtaWdodFxuICAgIC8vIGJlIHBsYWNlZCBpbnNpZGUgYSBwYXJlbnQgdGhhdCBoYXMgb25lIG9mIHRoZSBvdGhlciBjb2xvcnMgd2l0aCBhIGhpZ2hlciBzcGVjaWZpY2l0eS5cbiAgICAnW2NsYXNzLm1hdC1hY2NlbnRdJzogJ2NvbG9yICE9PSBcInByaW1hcnlcIiAmJiBjb2xvciAhPT0gXCJ3YXJuXCInLFxuICAgICdbY2xhc3MubWF0LXdhcm5dJzogJ2NvbG9yID09PSBcIndhcm5cIicsXG4gICAgJ1tjbGFzcy5tYXQtbGlzdC1zaW5nbGUtc2VsZWN0ZWQtb3B0aW9uXSc6ICdzZWxlY3RlZCAmJiAhc2VsZWN0aW9uTGlzdC5tdWx0aXBsZScsXG4gICAgJ1thdHRyLmFyaWEtc2VsZWN0ZWRdJzogJ3NlbGVjdGVkJyxcbiAgICAnW2F0dHIuYXJpYS1kaXNhYmxlZF0nOiAnZGlzYWJsZWQnLFxuICAgICdbYXR0ci50YWJpbmRleF0nOiAnLTEnLFxuICB9LFxuICB0ZW1wbGF0ZVVybDogJ2xpc3Qtb3B0aW9uLmh0bWwnLFxuICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lLFxuICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5Lk9uUHVzaCxcbn0pXG5leHBvcnQgY2xhc3MgTWF0TGlzdE9wdGlvbiBleHRlbmRzIF9NYXRMaXN0T3B0aW9uTWl4aW5CYXNlIGltcGxlbWVudHMgQWZ0ZXJDb250ZW50SW5pdCwgT25EZXN0cm95LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE9uSW5pdCwgRm9jdXNhYmxlT3B0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIENhbkRpc2FibGVSaXBwbGUge1xuICBwcml2YXRlIF9zZWxlY3RlZCA9IGZhbHNlO1xuICBwcml2YXRlIF9kaXNhYmxlZCA9IGZhbHNlO1xuICBwcml2YXRlIF9oYXNGb2N1cyA9IGZhbHNlO1xuXG4gIEBDb250ZW50Q2hpbGQoTWF0TGlzdEF2YXRhckNzc01hdFN0eWxlcikgX2F2YXRhcjogTWF0TGlzdEF2YXRhckNzc01hdFN0eWxlcjtcbiAgQENvbnRlbnRDaGlsZChNYXRMaXN0SWNvbkNzc01hdFN0eWxlcikgX2ljb246IE1hdExpc3RJY29uQ3NzTWF0U3R5bGVyO1xuICBAQ29udGVudENoaWxkcmVuKE1hdExpbmUsIHtkZXNjZW5kYW50czogdHJ1ZX0pIF9saW5lczogUXVlcnlMaXN0PE1hdExpbmU+O1xuXG4gIC8qKiBET00gZWxlbWVudCBjb250YWluaW5nIHRoZSBpdGVtJ3MgdGV4dC4gKi9cbiAgQFZpZXdDaGlsZCgndGV4dCcpIF90ZXh0OiBFbGVtZW50UmVmO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBsYWJlbCBzaG91bGQgYXBwZWFyIGJlZm9yZSBvciBhZnRlciB0aGUgY2hlY2tib3guIERlZmF1bHRzIHRvICdhZnRlcicgKi9cbiAgQElucHV0KCkgY2hlY2tib3hQb3NpdGlvbjogTWF0TGlzdE9wdGlvbkNoZWNrYm94UG9zaXRpb24gPSAnYWZ0ZXInO1xuXG4gIC8qKiBUaGVtZSBjb2xvciBvZiB0aGUgbGlzdCBvcHRpb24uIFRoaXMgc2V0cyB0aGUgY29sb3Igb2YgdGhlIGNoZWNrYm94LiAqL1xuICBASW5wdXQoKVxuICBnZXQgY29sb3IoKTogVGhlbWVQYWxldHRlIHsgcmV0dXJuIHRoaXMuX2NvbG9yIHx8IHRoaXMuc2VsZWN0aW9uTGlzdC5jb2xvcjsgfVxuICBzZXQgY29sb3IobmV3VmFsdWU6IFRoZW1lUGFsZXR0ZSkgeyB0aGlzLl9jb2xvciA9IG5ld1ZhbHVlOyB9XG4gIHByaXZhdGUgX2NvbG9yOiBUaGVtZVBhbGV0dGU7XG5cbiAgLyoqXG4gICAqIFRoaXMgaXMgc2V0IHRvIHRydWUgYWZ0ZXIgdGhlIGZpcnN0IE9uQ2hhbmdlcyBjeWNsZSBzbyB3ZSBkb24ndCBjbGVhciB0aGUgdmFsdWUgb2YgYHNlbGVjdGVkYFxuICAgKiBpbiB0aGUgZmlyc3QgY3ljbGUuXG4gICAqL1xuICBwcml2YXRlIF9pbnB1dHNJbml0aWFsaXplZCA9IGZhbHNlO1xuICAvKiogVmFsdWUgb2YgdGhlIG9wdGlvbiAqL1xuICBASW5wdXQoKVxuICBnZXQgdmFsdWUoKTogYW55IHsgcmV0dXJuIHRoaXMuX3ZhbHVlOyB9XG4gIHNldCB2YWx1ZShuZXdWYWx1ZTogYW55KSB7XG4gICAgaWYgKFxuICAgICAgdGhpcy5zZWxlY3RlZCAmJlxuICAgICAgIXRoaXMuc2VsZWN0aW9uTGlzdC5jb21wYXJlV2l0aChuZXdWYWx1ZSwgdGhpcy52YWx1ZSkgJiZcbiAgICAgIHRoaXMuX2lucHV0c0luaXRpYWxpemVkXG4gICAgKSB7XG4gICAgICB0aGlzLnNlbGVjdGVkID0gZmFsc2U7XG4gICAgfVxuXG4gICAgdGhpcy5fdmFsdWUgPSBuZXdWYWx1ZTtcbiAgfVxuICBwcml2YXRlIF92YWx1ZTogYW55O1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBvcHRpb24gaXMgZGlzYWJsZWQuICovXG4gIEBJbnB1dCgpXG4gIGdldCBkaXNhYmxlZCgpIHsgcmV0dXJuIHRoaXMuX2Rpc2FibGVkIHx8ICh0aGlzLnNlbGVjdGlvbkxpc3QgJiYgdGhpcy5zZWxlY3Rpb25MaXN0LmRpc2FibGVkKTsgfVxuICBzZXQgZGlzYWJsZWQodmFsdWU6IGFueSkge1xuICAgIGNvbnN0IG5ld1ZhbHVlID0gY29lcmNlQm9vbGVhblByb3BlcnR5KHZhbHVlKTtcblxuICAgIGlmIChuZXdWYWx1ZSAhPT0gdGhpcy5fZGlzYWJsZWQpIHtcbiAgICAgIHRoaXMuX2Rpc2FibGVkID0gbmV3VmFsdWU7XG4gICAgICB0aGlzLl9jaGFuZ2VEZXRlY3Rvci5tYXJrRm9yQ2hlY2soKTtcbiAgICB9XG4gIH1cblxuICAvKiogV2hldGhlciB0aGUgb3B0aW9uIGlzIHNlbGVjdGVkLiAqL1xuICBASW5wdXQoKVxuICBnZXQgc2VsZWN0ZWQoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLnNlbGVjdGlvbkxpc3Quc2VsZWN0ZWRPcHRpb25zLmlzU2VsZWN0ZWQodGhpcyk7IH1cbiAgc2V0IHNlbGVjdGVkKHZhbHVlOiBib29sZWFuKSB7XG4gICAgY29uc3QgaXNTZWxlY3RlZCA9IGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eSh2YWx1ZSk7XG5cbiAgICBpZiAoaXNTZWxlY3RlZCAhPT0gdGhpcy5fc2VsZWN0ZWQpIHtcbiAgICAgIHRoaXMuX3NldFNlbGVjdGVkKGlzU2VsZWN0ZWQpO1xuXG4gICAgICBpZiAoaXNTZWxlY3RlZCB8fCB0aGlzLnNlbGVjdGlvbkxpc3QubXVsdGlwbGUpIHtcbiAgICAgICAgdGhpcy5zZWxlY3Rpb25MaXN0Ll9yZXBvcnRWYWx1ZUNoYW5nZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX2VsZW1lbnQ6IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+LFxuICAgICAgICAgICAgICBwcml2YXRlIF9jaGFuZ2VEZXRlY3RvcjogQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gICAgICAgICAgICAgIC8qKiBAZG9jcy1wcml2YXRlICovXG4gICAgICAgICAgICAgIEBJbmplY3QoZm9yd2FyZFJlZigoKSA9PiBNYXRTZWxlY3Rpb25MaXN0KSkgcHVibGljIHNlbGVjdGlvbkxpc3Q6IE1hdFNlbGVjdGlvbkxpc3QpIHtcbiAgICBzdXBlcigpO1xuICB9XG5cbiAgbmdPbkluaXQoKSB7XG4gICAgY29uc3QgbGlzdCA9IHRoaXMuc2VsZWN0aW9uTGlzdDtcblxuICAgIGlmIChsaXN0Ll92YWx1ZSAmJiBsaXN0Ll92YWx1ZS5zb21lKHZhbHVlID0+IGxpc3QuY29tcGFyZVdpdGgodmFsdWUsIHRoaXMuX3ZhbHVlKSkpIHtcbiAgICAgIHRoaXMuX3NldFNlbGVjdGVkKHRydWUpO1xuICAgIH1cblxuICAgIGNvbnN0IHdhc1NlbGVjdGVkID0gdGhpcy5fc2VsZWN0ZWQ7XG5cbiAgICAvLyBMaXN0IG9wdGlvbnMgdGhhdCBhcmUgc2VsZWN0ZWQgYXQgaW5pdGlhbGl6YXRpb24gY2FuJ3QgYmUgcmVwb3J0ZWQgcHJvcGVybHkgdG8gdGhlIGZvcm1cbiAgICAvLyBjb250cm9sLiBUaGlzIGlzIGJlY2F1c2UgaXQgdGFrZXMgc29tZSB0aW1lIHVudGlsIHRoZSBzZWxlY3Rpb24tbGlzdCBrbm93cyBhYm91dCBhbGxcbiAgICAvLyBhdmFpbGFibGUgb3B0aW9ucy4gQWxzbyBpdCBjYW4gaGFwcGVuIHRoYXQgdGhlIENvbnRyb2xWYWx1ZUFjY2Vzc29yIGhhcyBhbiBpbml0aWFsIHZhbHVlXG4gICAgLy8gdGhhdCBzaG91bGQgYmUgdXNlZCBpbnN0ZWFkLiBEZWZlcnJpbmcgdGhlIHZhbHVlIGNoYW5nZSByZXBvcnQgdG8gdGhlIG5leHQgdGljayBlbnN1cmVzXG4gICAgLy8gdGhhdCB0aGUgZm9ybSBjb250cm9sIHZhbHVlIGlzIG5vdCBiZWluZyBvdmVyd3JpdHRlbi5cbiAgICBQcm9taXNlLnJlc29sdmUoKS50aGVuKCgpID0+IHtcbiAgICAgIGlmICh0aGlzLl9zZWxlY3RlZCB8fCB3YXNTZWxlY3RlZCkge1xuICAgICAgICB0aGlzLnNlbGVjdGVkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5fY2hhbmdlRGV0ZWN0b3IubWFya0ZvckNoZWNrKCk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgdGhpcy5faW5wdXRzSW5pdGlhbGl6ZWQgPSB0cnVlO1xuICB9XG5cbiAgbmdBZnRlckNvbnRlbnRJbml0KCkge1xuICAgIHNldExpbmVzKHRoaXMuX2xpbmVzLCB0aGlzLl9lbGVtZW50KTtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCk6IHZvaWQge1xuICAgIGlmICh0aGlzLnNlbGVjdGVkKSB7XG4gICAgICAvLyBXZSBoYXZlIHRvIGRlbGF5IHRoaXMgdW50aWwgdGhlIG5leHQgdGljayBpbiBvcmRlclxuICAgICAgLy8gdG8gYXZvaWQgY2hhbmdlZCBhZnRlciBjaGVja2VkIGVycm9ycy5cbiAgICAgIFByb21pc2UucmVzb2x2ZSgpLnRoZW4oKCkgPT4ge1xuICAgICAgICB0aGlzLnNlbGVjdGVkID0gZmFsc2U7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBjb25zdCBoYWRGb2N1cyA9IHRoaXMuX2hhc0ZvY3VzO1xuICAgIGNvbnN0IG5ld0FjdGl2ZUl0ZW0gPSB0aGlzLnNlbGVjdGlvbkxpc3QuX3JlbW92ZU9wdGlvbkZyb21MaXN0KHRoaXMpO1xuXG4gICAgLy8gT25seSBtb3ZlIGZvY3VzIGlmIHRoaXMgb3B0aW9uIHdhcyBmb2N1c2VkIGF0IHRoZSB0aW1lIGl0IHdhcyBkZXN0cm95ZWQuXG4gICAgaWYgKGhhZEZvY3VzICYmIG5ld0FjdGl2ZUl0ZW0pIHtcbiAgICAgIG5ld0FjdGl2ZUl0ZW0uZm9jdXMoKTtcbiAgICB9XG4gIH1cblxuICAvKiogVG9nZ2xlcyB0aGUgc2VsZWN0aW9uIHN0YXRlIG9mIHRoZSBvcHRpb24uICovXG4gIHRvZ2dsZSgpOiB2b2lkIHtcbiAgICB0aGlzLnNlbGVjdGVkID0gIXRoaXMuc2VsZWN0ZWQ7XG4gIH1cblxuICAvKiogQWxsb3dzIGZvciBwcm9ncmFtbWF0aWMgZm9jdXNpbmcgb2YgdGhlIG9wdGlvbi4gKi9cbiAgZm9jdXMoKTogdm9pZCB7XG4gICAgdGhpcy5fZWxlbWVudC5uYXRpdmVFbGVtZW50LmZvY3VzKCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgbGlzdCBpdGVtJ3MgdGV4dCBsYWJlbC4gSW1wbGVtZW50ZWQgYXMgYSBwYXJ0IG9mIHRoZSBGb2N1c0tleU1hbmFnZXIuXG4gICAqIEBkb2NzLXByaXZhdGVcbiAgICovXG4gIGdldExhYmVsKCkge1xuICAgIHJldHVybiB0aGlzLl90ZXh0ID8gKHRoaXMuX3RleHQubmF0aXZlRWxlbWVudC50ZXh0Q29udGVudCB8fCAnJykgOiAnJztcbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoaXMgbGlzdCBpdGVtIHNob3VsZCBzaG93IGEgcmlwcGxlIGVmZmVjdCB3aGVuIGNsaWNrZWQuICovXG4gIF9pc1JpcHBsZURpc2FibGVkKCkge1xuICAgIHJldHVybiB0aGlzLmRpc2FibGVkIHx8IHRoaXMuZGlzYWJsZVJpcHBsZSB8fCB0aGlzLnNlbGVjdGlvbkxpc3QuZGlzYWJsZVJpcHBsZTtcbiAgfVxuXG4gIF9oYW5kbGVDbGljaygpIHtcbiAgICBpZiAoIXRoaXMuZGlzYWJsZWQgJiYgKHRoaXMuc2VsZWN0aW9uTGlzdC5tdWx0aXBsZSB8fCAhdGhpcy5zZWxlY3RlZCkpIHtcbiAgICAgIHRoaXMudG9nZ2xlKCk7XG5cbiAgICAgIC8vIEVtaXQgYSBjaGFuZ2UgZXZlbnQgaWYgdGhlIHNlbGVjdGVkIHN0YXRlIG9mIHRoZSBvcHRpb24gY2hhbmdlZCB0aHJvdWdoIHVzZXIgaW50ZXJhY3Rpb24uXG4gICAgICB0aGlzLnNlbGVjdGlvbkxpc3QuX2VtaXRDaGFuZ2VFdmVudChbdGhpc10pO1xuICAgIH1cbiAgfVxuXG4gIF9oYW5kbGVGb2N1cygpIHtcbiAgICB0aGlzLnNlbGVjdGlvbkxpc3QuX3NldEZvY3VzZWRPcHRpb24odGhpcyk7XG4gICAgdGhpcy5faGFzRm9jdXMgPSB0cnVlO1xuICB9XG5cbiAgX2hhbmRsZUJsdXIoKSB7XG4gICAgdGhpcy5zZWxlY3Rpb25MaXN0Ll9vblRvdWNoZWQoKTtcbiAgICB0aGlzLl9oYXNGb2N1cyA9IGZhbHNlO1xuICB9XG5cbiAgLyoqIFJldHJpZXZlcyB0aGUgRE9NIGVsZW1lbnQgb2YgdGhlIGNvbXBvbmVudCBob3N0LiAqL1xuICBfZ2V0SG9zdEVsZW1lbnQoKTogSFRNTEVsZW1lbnQge1xuICAgIHJldHVybiB0aGlzLl9lbGVtZW50Lm5hdGl2ZUVsZW1lbnQ7XG4gIH1cblxuICAvKiogU2V0cyB0aGUgc2VsZWN0ZWQgc3RhdGUgb2YgdGhlIG9wdGlvbi4gUmV0dXJucyB3aGV0aGVyIHRoZSB2YWx1ZSBoYXMgY2hhbmdlZC4gKi9cbiAgX3NldFNlbGVjdGVkKHNlbGVjdGVkOiBib29sZWFuKTogYm9vbGVhbiB7XG4gICAgaWYgKHNlbGVjdGVkID09PSB0aGlzLl9zZWxlY3RlZCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHRoaXMuX3NlbGVjdGVkID0gc2VsZWN0ZWQ7XG5cbiAgICBpZiAoc2VsZWN0ZWQpIHtcbiAgICAgIHRoaXMuc2VsZWN0aW9uTGlzdC5zZWxlY3RlZE9wdGlvbnMuc2VsZWN0KHRoaXMpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnNlbGVjdGlvbkxpc3Quc2VsZWN0ZWRPcHRpb25zLmRlc2VsZWN0KHRoaXMpO1xuICAgIH1cblxuICAgIHRoaXMuX2NoYW5nZURldGVjdG9yLm1hcmtGb3JDaGVjaygpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIE5vdGlmaWVzIEFuZ3VsYXIgdGhhdCB0aGUgb3B0aW9uIG5lZWRzIHRvIGJlIGNoZWNrZWQgaW4gdGhlIG5leHQgY2hhbmdlIGRldGVjdGlvbiBydW4uIE1haW5seVxuICAgKiB1c2VkIHRvIHRyaWdnZXIgYW4gdXBkYXRlIG9mIHRoZSBsaXN0IG9wdGlvbiBpZiB0aGUgZGlzYWJsZWQgc3RhdGUgb2YgdGhlIHNlbGVjdGlvbiBsaXN0XG4gICAqIGNoYW5nZWQuXG4gICAqL1xuICBfbWFya0ZvckNoZWNrKCkge1xuICAgIHRoaXMuX2NoYW5nZURldGVjdG9yLm1hcmtGb3JDaGVjaygpO1xuICB9XG5cbiAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2Rpc2FibGVkOiBCb29sZWFuSW5wdXQ7XG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zZWxlY3RlZDogQm9vbGVhbklucHV0O1xuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZGlzYWJsZVJpcHBsZTogQm9vbGVhbklucHV0O1xufVxuXG5cbi8qKlxuICogTWF0ZXJpYWwgRGVzaWduIGxpc3QgY29tcG9uZW50IHdoZXJlIGVhY2ggaXRlbSBpcyBhIHNlbGVjdGFibGUgb3B0aW9uLiBCZWhhdmVzIGFzIGEgbGlzdGJveC5cbiAqL1xuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnbWF0LXNlbGVjdGlvbi1saXN0JyxcbiAgZXhwb3J0QXM6ICdtYXRTZWxlY3Rpb25MaXN0JyxcbiAgaW5wdXRzOiBbJ2Rpc2FibGVSaXBwbGUnXSxcbiAgaG9zdDoge1xuICAgICdyb2xlJzogJ2xpc3Rib3gnLFxuICAgICdjbGFzcyc6ICdtYXQtc2VsZWN0aW9uLWxpc3QgbWF0LWxpc3QtYmFzZScsXG4gICAgJyhrZXlkb3duKSc6ICdfa2V5ZG93bigkZXZlbnQpJyxcbiAgICAnW2F0dHIuYXJpYS1tdWx0aXNlbGVjdGFibGVdJzogJ211bHRpcGxlJyxcbiAgICAnW2F0dHIuYXJpYS1kaXNhYmxlZF0nOiAnZGlzYWJsZWQudG9TdHJpbmcoKScsXG4gICAgJ1thdHRyLnRhYmluZGV4XSc6ICdfdGFiSW5kZXgnLFxuICB9LFxuICB0ZW1wbGF0ZTogJzxuZy1jb250ZW50PjwvbmctY29udGVudD4nLFxuICBzdHlsZVVybHM6IFsnbGlzdC5jc3MnXSxcbiAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZSxcbiAgcHJvdmlkZXJzOiBbTUFUX1NFTEVDVElPTl9MSVNUX1ZBTFVFX0FDQ0VTU09SXSxcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2hcbn0pXG5leHBvcnQgY2xhc3MgTWF0U2VsZWN0aW9uTGlzdCBleHRlbmRzIF9NYXRTZWxlY3Rpb25MaXN0TWl4aW5CYXNlIGltcGxlbWVudHMgQ2FuRGlzYWJsZVJpcHBsZSxcbiAgQWZ0ZXJDb250ZW50SW5pdCwgQ29udHJvbFZhbHVlQWNjZXNzb3IsIE9uRGVzdHJveSwgT25DaGFuZ2VzIHtcbiAgcHJpdmF0ZSBfbXVsdGlwbGUgPSB0cnVlO1xuICBwcml2YXRlIF9jb250ZW50SW5pdGlhbGl6ZWQgPSBmYWxzZTtcblxuICAvKiogVGhlIEZvY3VzS2V5TWFuYWdlciB3aGljaCBoYW5kbGVzIGZvY3VzLiAqL1xuICBfa2V5TWFuYWdlcjogRm9jdXNLZXlNYW5hZ2VyPE1hdExpc3RPcHRpb24+O1xuXG4gIC8qKiBUaGUgb3B0aW9uIGNvbXBvbmVudHMgY29udGFpbmVkIHdpdGhpbiB0aGlzIHNlbGVjdGlvbi1saXN0LiAqL1xuICBAQ29udGVudENoaWxkcmVuKE1hdExpc3RPcHRpb24sIHtkZXNjZW5kYW50czogdHJ1ZX0pIG9wdGlvbnM6IFF1ZXJ5TGlzdDxNYXRMaXN0T3B0aW9uPjtcblxuICAvKiogRW1pdHMgYSBjaGFuZ2UgZXZlbnQgd2hlbmV2ZXIgdGhlIHNlbGVjdGVkIHN0YXRlIG9mIGFuIG9wdGlvbiBjaGFuZ2VzLiAqL1xuICBAT3V0cHV0KCkgcmVhZG9ubHkgc2VsZWN0aW9uQ2hhbmdlOiBFdmVudEVtaXR0ZXI8TWF0U2VsZWN0aW9uTGlzdENoYW5nZT4gPVxuICAgICAgbmV3IEV2ZW50RW1pdHRlcjxNYXRTZWxlY3Rpb25MaXN0Q2hhbmdlPigpO1xuXG4gIC8qKlxuICAgKiBUYWJpbmRleCBvZiB0aGUgc2VsZWN0aW9uIGxpc3QuXG4gICAqIEBicmVha2luZy1jaGFuZ2UgMTEuMC4wIFJlbW92ZSBgdGFiSW5kZXhgIGlucHV0LlxuICAgKi9cbiAgQElucHV0KCkgdGFiSW5kZXg6IG51bWJlciA9IDA7XG5cbiAgLyoqIFRoZW1lIGNvbG9yIG9mIHRoZSBzZWxlY3Rpb24gbGlzdC4gVGhpcyBzZXRzIHRoZSBjaGVja2JveCBjb2xvciBmb3IgYWxsIGxpc3Qgb3B0aW9ucy4gKi9cbiAgQElucHV0KCkgY29sb3I6IFRoZW1lUGFsZXR0ZSA9ICdhY2NlbnQnO1xuXG4gIC8qKlxuICAgKiBGdW5jdGlvbiB1c2VkIGZvciBjb21wYXJpbmcgYW4gb3B0aW9uIGFnYWluc3QgdGhlIHNlbGVjdGVkIHZhbHVlIHdoZW4gZGV0ZXJtaW5pbmcgd2hpY2hcbiAgICogb3B0aW9ucyBzaG91bGQgYXBwZWFyIGFzIHNlbGVjdGVkLiBUaGUgZmlyc3QgYXJndW1lbnQgaXMgdGhlIHZhbHVlIG9mIGFuIG9wdGlvbnMuIFRoZSBzZWNvbmRcbiAgICogb25lIGlzIGEgdmFsdWUgZnJvbSB0aGUgc2VsZWN0ZWQgdmFsdWUuIEEgYm9vbGVhbiBtdXN0IGJlIHJldHVybmVkLlxuICAgKi9cbiAgQElucHV0KCkgY29tcGFyZVdpdGg6IChvMTogYW55LCBvMjogYW55KSA9PiBib29sZWFuID0gKGExLCBhMikgPT4gYTEgPT09IGEyO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBzZWxlY3Rpb24gbGlzdCBpcyBkaXNhYmxlZC4gKi9cbiAgQElucHV0KClcbiAgZ2V0IGRpc2FibGVkKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5fZGlzYWJsZWQ7IH1cbiAgc2V0IGRpc2FibGVkKHZhbHVlOiBib29sZWFuKSB7XG4gICAgdGhpcy5fZGlzYWJsZWQgPSBjb2VyY2VCb29sZWFuUHJvcGVydHkodmFsdWUpO1xuXG4gICAgLy8gVGhlIGBNYXRTZWxlY3Rpb25MaXN0YCBhbmQgYE1hdExpc3RPcHRpb25gIGFyZSB1c2luZyB0aGUgYE9uUHVzaGAgY2hhbmdlIGRldGVjdGlvblxuICAgIC8vIHN0cmF0ZWd5LiBUaGVyZWZvcmUgdGhlIG9wdGlvbnMgd2lsbCBub3QgY2hlY2sgZm9yIGFueSBjaGFuZ2VzIGlmIHRoZSBgTWF0U2VsZWN0aW9uTGlzdGBcbiAgICAvLyBjaGFuZ2VkIGl0cyBzdGF0ZS4gU2luY2Ugd2Uga25vdyB0aGF0IGEgY2hhbmdlIHRvIGBkaXNhYmxlZGAgcHJvcGVydHkgb2YgdGhlIGxpc3QgYWZmZWN0c1xuICAgIC8vIHRoZSBzdGF0ZSBvZiB0aGUgb3B0aW9ucywgd2UgbWFudWFsbHkgbWFyayBlYWNoIG9wdGlvbiBmb3IgY2hlY2suXG4gICAgdGhpcy5fbWFya09wdGlvbnNGb3JDaGVjaygpO1xuICB9XG4gIHByaXZhdGUgX2Rpc2FibGVkOiBib29sZWFuID0gZmFsc2U7XG5cbiAgLyoqIFdoZXRoZXIgc2VsZWN0aW9uIGlzIGxpbWl0ZWQgdG8gb25lIG9yIG11bHRpcGxlIGl0ZW1zIChkZWZhdWx0IG11bHRpcGxlKS4gKi9cbiAgQElucHV0KClcbiAgZ2V0IG11bHRpcGxlKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5fbXVsdGlwbGU7IH1cbiAgc2V0IG11bHRpcGxlKHZhbHVlOiBib29sZWFuKSB7XG4gICAgY29uc3QgbmV3VmFsdWUgPSBjb2VyY2VCb29sZWFuUHJvcGVydHkodmFsdWUpO1xuXG4gICAgaWYgKG5ld1ZhbHVlICE9PSB0aGlzLl9tdWx0aXBsZSkge1xuICAgICAgaWYgKHRoaXMuX2NvbnRlbnRJbml0aWFsaXplZCAmJiAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAnQ2Fubm90IGNoYW5nZSBgbXVsdGlwbGVgIG1vZGUgb2YgbWF0LXNlbGVjdGlvbi1saXN0IGFmdGVyIGluaXRpYWxpemF0aW9uLicpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9tdWx0aXBsZSA9IG5ld1ZhbHVlO1xuICAgICAgdGhpcy5zZWxlY3RlZE9wdGlvbnMgPSBuZXcgU2VsZWN0aW9uTW9kZWwodGhpcy5fbXVsdGlwbGUsIHRoaXMuc2VsZWN0ZWRPcHRpb25zLnNlbGVjdGVkKTtcbiAgICB9XG4gIH1cblxuICAvKiogVGhlIGN1cnJlbnRseSBzZWxlY3RlZCBvcHRpb25zLiAqL1xuICBzZWxlY3RlZE9wdGlvbnMgPSBuZXcgU2VsZWN0aW9uTW9kZWw8TWF0TGlzdE9wdGlvbj4odGhpcy5fbXVsdGlwbGUpO1xuXG4gIC8qKiBUaGUgdGFiaW5kZXggb2YgdGhlIHNlbGVjdGlvbiBsaXN0LiAqL1xuICBfdGFiSW5kZXggPSAtMTtcblxuICAvKiogVmlldyB0byBtb2RlbCBjYWxsYmFjayB0aGF0IHNob3VsZCBiZSBjYWxsZWQgd2hlbmV2ZXIgdGhlIHNlbGVjdGVkIG9wdGlvbnMgY2hhbmdlLiAqL1xuICBwcml2YXRlIF9vbkNoYW5nZTogKHZhbHVlOiBhbnkpID0+IHZvaWQgPSAoXzogYW55KSA9PiB7fTtcblxuICAvKiogS2VlcHMgdHJhY2sgb2YgdGhlIGN1cnJlbnRseS1zZWxlY3RlZCB2YWx1ZS4gKi9cbiAgX3ZhbHVlOiBzdHJpbmdbXXxudWxsO1xuXG4gIC8qKiBFbWl0cyB3aGVuIHRoZSBsaXN0IGhhcyBiZWVuIGRlc3Ryb3llZC4gKi9cbiAgcHJpdmF0ZSByZWFkb25seSBfZGVzdHJveWVkID0gbmV3IFN1YmplY3Q8dm9pZD4oKTtcblxuICAvKiogVmlldyB0byBtb2RlbCBjYWxsYmFjayB0aGF0IHNob3VsZCBiZSBjYWxsZWQgaWYgdGhlIGxpc3Qgb3IgaXRzIG9wdGlvbnMgbG9zdCBmb2N1cy4gKi9cbiAgX29uVG91Y2hlZDogKCkgPT4gdm9pZCA9ICgpID0+IHt9O1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBsaXN0IGhhcyBiZWVuIGRlc3Ryb3llZC4gKi9cbiAgcHJpdmF0ZSBfaXNEZXN0cm95ZWQ6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfZWxlbWVudDogRWxlbWVudFJlZjxIVE1MRWxlbWVudD4sXG4gICAgLy8gQGJyZWFraW5nLWNoYW5nZSAxMS4wLjAgUmVtb3ZlIGB0YWJJbmRleGAgcGFyYW1ldGVyLlxuICAgIEBBdHRyaWJ1dGUoJ3RhYmluZGV4JykgdGFiSW5kZXg6IHN0cmluZyxcbiAgICBwcml2YXRlIF9jaGFuZ2VEZXRlY3RvcjogQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gICAgLy8gQGJyZWFraW5nLWNoYW5nZSAxMS4wLjAgYF9mb2N1c01vbml0b3JgIHBhcmFtZXRlciB0byBiZWNvbWUgcmVxdWlyZWQuXG4gICAgcHJpdmF0ZSBfZm9jdXNNb25pdG9yPzogRm9jdXNNb25pdG9yKSB7XG4gICAgc3VwZXIoKTtcbiAgfVxuXG4gIG5nQWZ0ZXJDb250ZW50SW5pdCgpOiB2b2lkIHtcbiAgICB0aGlzLl9jb250ZW50SW5pdGlhbGl6ZWQgPSB0cnVlO1xuXG4gICAgdGhpcy5fa2V5TWFuYWdlciA9IG5ldyBGb2N1c0tleU1hbmFnZXI8TWF0TGlzdE9wdGlvbj4odGhpcy5vcHRpb25zKVxuICAgICAgLndpdGhXcmFwKClcbiAgICAgIC53aXRoVHlwZUFoZWFkKClcbiAgICAgIC53aXRoSG9tZUFuZEVuZCgpXG4gICAgICAvLyBBbGxvdyBkaXNhYmxlZCBpdGVtcyB0byBiZSBmb2N1c2FibGUuIEZvciBhY2Nlc3NpYmlsaXR5IHJlYXNvbnMsIHRoZXJlIG11c3QgYmUgYSB3YXkgZm9yXG4gICAgICAvLyBzY3JlZW5yZWFkZXIgdXNlcnMsIHRoYXQgYWxsb3dzIHJlYWRpbmcgdGhlIGRpZmZlcmVudCBvcHRpb25zIG9mIHRoZSBsaXN0LlxuICAgICAgLnNraXBQcmVkaWNhdGUoKCkgPT4gZmFsc2UpXG4gICAgICAud2l0aEFsbG93ZWRNb2RpZmllcktleXMoWydzaGlmdEtleSddKTtcblxuICAgIGlmICh0aGlzLl92YWx1ZSkge1xuICAgICAgdGhpcy5fc2V0T3B0aW9uc0Zyb21WYWx1ZXModGhpcy5fdmFsdWUpO1xuICAgIH1cblxuICAgIC8vIElmIHRoZSB1c2VyIGF0dGVtcHRzIHRvIHRhYiBvdXQgb2YgdGhlIHNlbGVjdGlvbiBsaXN0LCBhbGxvdyBmb2N1cyB0byBlc2NhcGUuXG4gICAgdGhpcy5fa2V5TWFuYWdlci50YWJPdXQucGlwZSh0YWtlVW50aWwodGhpcy5fZGVzdHJveWVkKSkuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgIHRoaXMuX2FsbG93Rm9jdXNFc2NhcGUoKTtcbiAgICB9KTtcblxuICAgIC8vIFdoZW4gdGhlIG51bWJlciBvZiBvcHRpb25zIGNoYW5nZSwgdXBkYXRlIHRoZSB0YWJpbmRleCBvZiB0aGUgc2VsZWN0aW9uIGxpc3QuXG4gICAgdGhpcy5vcHRpb25zLmNoYW5nZXMucGlwZShzdGFydFdpdGgobnVsbCksIHRha2VVbnRpbCh0aGlzLl9kZXN0cm95ZWQpKS5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgdGhpcy5fdXBkYXRlVGFiSW5kZXgoKTtcbiAgICB9KTtcblxuICAgIC8vIFN5bmMgZXh0ZXJuYWwgY2hhbmdlcyB0byB0aGUgbW9kZWwgYmFjayB0byB0aGUgb3B0aW9ucy5cbiAgICB0aGlzLnNlbGVjdGVkT3B0aW9ucy5jaGFuZ2VkLnBpcGUodGFrZVVudGlsKHRoaXMuX2Rlc3Ryb3llZCkpLnN1YnNjcmliZShldmVudCA9PiB7XG4gICAgICBpZiAoZXZlbnQuYWRkZWQpIHtcbiAgICAgICAgZm9yIChsZXQgaXRlbSBvZiBldmVudC5hZGRlZCkge1xuICAgICAgICAgIGl0ZW0uc2VsZWN0ZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChldmVudC5yZW1vdmVkKSB7XG4gICAgICAgIGZvciAobGV0IGl0ZW0gb2YgZXZlbnQucmVtb3ZlZCkge1xuICAgICAgICAgIGl0ZW0uc2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gQGJyZWFraW5nLWNoYW5nZSAxMS4wLjAgUmVtb3ZlIG51bGwgYXNzZXJ0aW9uIG9uY2UgX2ZvY3VzTW9uaXRvciBpcyByZXF1aXJlZC5cbiAgICB0aGlzLl9mb2N1c01vbml0b3I/Lm1vbml0b3IodGhpcy5fZWxlbWVudClcbiAgICAgIC5waXBlKHRha2VVbnRpbCh0aGlzLl9kZXN0cm95ZWQpKVxuICAgICAgLnN1YnNjcmliZShvcmlnaW4gPT4ge1xuICAgICAgICBpZiAob3JpZ2luID09PSAna2V5Ym9hcmQnIHx8IG9yaWdpbiA9PT0gJ3Byb2dyYW0nKSB7XG4gICAgICAgICAgY29uc3QgYWN0aXZlSW5kZXggPSB0aGlzLl9rZXlNYW5hZ2VyLmFjdGl2ZUl0ZW1JbmRleDtcblxuICAgICAgICAgIGlmICghYWN0aXZlSW5kZXggfHwgYWN0aXZlSW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICAvLyBJZiB0aGVyZSBpcyBubyBhY3RpdmUgaW5kZXgsIHNldCBmb2N1cyB0byB0aGUgZmlyc3Qgb3B0aW9uLlxuICAgICAgICAgICAgdGhpcy5fa2V5TWFuYWdlci5zZXRGaXJzdEl0ZW1BY3RpdmUoKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gT3RoZXJ3aXNlLCBzZXQgZm9jdXMgdG8gdGhlIGFjdGl2ZSBvcHRpb24uXG4gICAgICAgICAgICB0aGlzLl9rZXlNYW5hZ2VyLnNldEFjdGl2ZUl0ZW0oYWN0aXZlSW5kZXgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gIH1cblxuICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKSB7XG4gICAgY29uc3QgZGlzYWJsZVJpcHBsZUNoYW5nZXMgPSBjaGFuZ2VzWydkaXNhYmxlUmlwcGxlJ107XG4gICAgY29uc3QgY29sb3JDaGFuZ2VzID0gY2hhbmdlc1snY29sb3InXTtcblxuICAgIGlmICgoZGlzYWJsZVJpcHBsZUNoYW5nZXMgJiYgIWRpc2FibGVSaXBwbGVDaGFuZ2VzLmZpcnN0Q2hhbmdlKSB8fFxuICAgICAgICAoY29sb3JDaGFuZ2VzICYmICFjb2xvckNoYW5nZXMuZmlyc3RDaGFuZ2UpKSB7XG4gICAgICB0aGlzLl9tYXJrT3B0aW9uc0ZvckNoZWNrKCk7XG4gICAgfVxuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgLy8gQGJyZWFraW5nLWNoYW5nZSAxMS4wLjAgUmVtb3ZlIG51bGwgYXNzZXJ0aW9uIG9uY2UgX2ZvY3VzTW9uaXRvciBpcyByZXF1aXJlZC5cbiAgICB0aGlzLl9mb2N1c01vbml0b3I/LnN0b3BNb25pdG9yaW5nKHRoaXMuX2VsZW1lbnQpO1xuICAgIHRoaXMuX2Rlc3Ryb3llZC5uZXh0KCk7XG4gICAgdGhpcy5fZGVzdHJveWVkLmNvbXBsZXRlKCk7XG4gICAgdGhpcy5faXNEZXN0cm95ZWQgPSB0cnVlO1xuICB9XG5cbiAgLyoqIEZvY3VzZXMgdGhlIHNlbGVjdGlvbiBsaXN0LiAqL1xuICBmb2N1cyhvcHRpb25zPzogRm9jdXNPcHRpb25zKSB7XG4gICAgdGhpcy5fZWxlbWVudC5uYXRpdmVFbGVtZW50LmZvY3VzKG9wdGlvbnMpO1xuICB9XG5cbiAgLyoqIFNlbGVjdHMgYWxsIG9mIHRoZSBvcHRpb25zLiBSZXR1cm5zIHRoZSBvcHRpb25zIHRoYXQgY2hhbmdlZCBhcyBhIHJlc3VsdC4gKi9cbiAgc2VsZWN0QWxsKCk6IE1hdExpc3RPcHRpb25bXSB7XG4gICAgcmV0dXJuIHRoaXMuX3NldEFsbE9wdGlvbnNTZWxlY3RlZCh0cnVlKTtcbiAgfVxuXG4gIC8qKiBEZXNlbGVjdHMgYWxsIG9mIHRoZSBvcHRpb25zLiBSZXR1cm5zIHRoZSBvcHRpb25zIHRoYXQgY2hhbmdlZCBhcyBhIHJlc3VsdC4gKi9cbiAgZGVzZWxlY3RBbGwoKTogTWF0TGlzdE9wdGlvbltdIHtcbiAgICByZXR1cm4gdGhpcy5fc2V0QWxsT3B0aW9uc1NlbGVjdGVkKGZhbHNlKTtcbiAgfVxuXG4gIC8qKiBTZXRzIHRoZSBmb2N1c2VkIG9wdGlvbiBvZiB0aGUgc2VsZWN0aW9uLWxpc3QuICovXG4gIF9zZXRGb2N1c2VkT3B0aW9uKG9wdGlvbjogTWF0TGlzdE9wdGlvbikge1xuICAgIHRoaXMuX2tleU1hbmFnZXIudXBkYXRlQWN0aXZlSXRlbShvcHRpb24pO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgYW4gb3B0aW9uIGZyb20gdGhlIHNlbGVjdGlvbiBsaXN0IGFuZCB1cGRhdGVzIHRoZSBhY3RpdmUgaXRlbS5cbiAgICogQHJldHVybnMgQ3VycmVudGx5LWFjdGl2ZSBpdGVtLlxuICAgKi9cbiAgX3JlbW92ZU9wdGlvbkZyb21MaXN0KG9wdGlvbjogTWF0TGlzdE9wdGlvbik6IE1hdExpc3RPcHRpb24gfCBudWxsIHtcbiAgICBjb25zdCBvcHRpb25JbmRleCA9IHRoaXMuX2dldE9wdGlvbkluZGV4KG9wdGlvbik7XG5cbiAgICBpZiAob3B0aW9uSW5kZXggPiAtMSAmJiB0aGlzLl9rZXlNYW5hZ2VyLmFjdGl2ZUl0ZW1JbmRleCA9PT0gb3B0aW9uSW5kZXgpIHtcbiAgICAgIC8vIENoZWNrIHdoZXRoZXIgdGhlIG9wdGlvbiBpcyB0aGUgbGFzdCBpdGVtXG4gICAgICBpZiAob3B0aW9uSW5kZXggPiAwKSB7XG4gICAgICAgIHRoaXMuX2tleU1hbmFnZXIudXBkYXRlQWN0aXZlSXRlbShvcHRpb25JbmRleCAtIDEpO1xuICAgICAgfSBlbHNlIGlmIChvcHRpb25JbmRleCA9PT0gMCAmJiB0aGlzLm9wdGlvbnMubGVuZ3RoID4gMSkge1xuICAgICAgICB0aGlzLl9rZXlNYW5hZ2VyLnVwZGF0ZUFjdGl2ZUl0ZW0oTWF0aC5taW4ob3B0aW9uSW5kZXggKyAxLCB0aGlzLm9wdGlvbnMubGVuZ3RoIC0gMSkpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9rZXlNYW5hZ2VyLmFjdGl2ZUl0ZW07XG4gIH1cblxuICAvKiogUGFzc2VzIHJlbGV2YW50IGtleSBwcmVzc2VzIHRvIG91ciBrZXkgbWFuYWdlci4gKi9cbiAgX2tleWRvd24oZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcbiAgICBjb25zdCBrZXlDb2RlID0gZXZlbnQua2V5Q29kZTtcbiAgICBjb25zdCBtYW5hZ2VyID0gdGhpcy5fa2V5TWFuYWdlcjtcbiAgICBjb25zdCBwcmV2aW91c0ZvY3VzSW5kZXggPSBtYW5hZ2VyLmFjdGl2ZUl0ZW1JbmRleDtcbiAgICBjb25zdCBoYXNNb2RpZmllciA9IGhhc01vZGlmaWVyS2V5KGV2ZW50KTtcblxuICAgIHN3aXRjaCAoa2V5Q29kZSkge1xuICAgICAgY2FzZSBTUEFDRTpcbiAgICAgIGNhc2UgRU5URVI6XG4gICAgICAgIGlmICghaGFzTW9kaWZpZXIgJiYgIW1hbmFnZXIuaXNUeXBpbmcoKSkge1xuICAgICAgICAgIHRoaXMuX3RvZ2dsZUZvY3VzZWRPcHRpb24oKTtcbiAgICAgICAgICAvLyBBbHdheXMgcHJldmVudCBzcGFjZSBmcm9tIHNjcm9sbGluZyB0aGUgcGFnZSBzaW5jZSB0aGUgbGlzdCBoYXMgZm9jdXNcbiAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgLy8gVGhlIFwiQVwiIGtleSBnZXRzIHNwZWNpYWwgdHJlYXRtZW50LCBiZWNhdXNlIGl0J3MgdXNlZCBmb3IgdGhlIFwic2VsZWN0IGFsbFwiIGZ1bmN0aW9uYWxpdHkuXG4gICAgICAgIGlmIChrZXlDb2RlID09PSBBICYmIHRoaXMubXVsdGlwbGUgJiYgaGFzTW9kaWZpZXJLZXkoZXZlbnQsICdjdHJsS2V5JykgJiZcbiAgICAgICAgICAgICFtYW5hZ2VyLmlzVHlwaW5nKCkpIHtcbiAgICAgICAgICBjb25zdCBzaG91bGRTZWxlY3QgPSB0aGlzLm9wdGlvbnMuc29tZShvcHRpb24gPT4gIW9wdGlvbi5kaXNhYmxlZCAmJiAhb3B0aW9uLnNlbGVjdGVkKTtcbiAgICAgICAgICB0aGlzLl9zZXRBbGxPcHRpb25zU2VsZWN0ZWQoc2hvdWxkU2VsZWN0LCB0cnVlLCB0cnVlKTtcbiAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG1hbmFnZXIub25LZXlkb3duKGV2ZW50KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLm11bHRpcGxlICYmIChrZXlDb2RlID09PSBVUF9BUlJPVyB8fCBrZXlDb2RlID09PSBET1dOX0FSUk9XKSAmJiBldmVudC5zaGlmdEtleSAmJlxuICAgICAgICBtYW5hZ2VyLmFjdGl2ZUl0ZW1JbmRleCAhPT0gcHJldmlvdXNGb2N1c0luZGV4KSB7XG4gICAgICB0aGlzLl90b2dnbGVGb2N1c2VkT3B0aW9uKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFJlcG9ydHMgYSB2YWx1ZSBjaGFuZ2UgdG8gdGhlIENvbnRyb2xWYWx1ZUFjY2Vzc29yICovXG4gIF9yZXBvcnRWYWx1ZUNoYW5nZSgpIHtcbiAgICAvLyBTdG9wIHJlcG9ydGluZyB2YWx1ZSBjaGFuZ2VzIGFmdGVyIHRoZSBsaXN0IGhhcyBiZWVuIGRlc3Ryb3llZC4gVGhpcyBhdm9pZHNcbiAgICAvLyBjYXNlcyB3aGVyZSB0aGUgbGlzdCBtaWdodCB3cm9uZ2x5IHJlc2V0IGl0cyB2YWx1ZSBvbmNlIGl0IGlzIHJlbW92ZWQsIGJ1dFxuICAgIC8vIHRoZSBmb3JtIGNvbnRyb2wgaXMgc3RpbGwgbGl2ZS5cbiAgICBpZiAodGhpcy5vcHRpb25zICYmICF0aGlzLl9pc0Rlc3Ryb3llZCkge1xuICAgICAgY29uc3QgdmFsdWUgPSB0aGlzLl9nZXRTZWxlY3RlZE9wdGlvblZhbHVlcygpO1xuICAgICAgdGhpcy5fb25DaGFuZ2UodmFsdWUpO1xuICAgICAgdGhpcy5fdmFsdWUgPSB2YWx1ZTtcbiAgICB9XG4gIH1cblxuICAvKiogRW1pdHMgYSBjaGFuZ2UgZXZlbnQgaWYgdGhlIHNlbGVjdGVkIHN0YXRlIG9mIGFuIG9wdGlvbiBjaGFuZ2VkLiAqL1xuICBfZW1pdENoYW5nZUV2ZW50KG9wdGlvbnM6IE1hdExpc3RPcHRpb25bXSkge1xuICAgIHRoaXMuc2VsZWN0aW9uQ2hhbmdlLmVtaXQobmV3IE1hdFNlbGVjdGlvbkxpc3RDaGFuZ2UodGhpcywgb3B0aW9uc1swXSwgb3B0aW9ucykpO1xuICB9XG5cbiAgLyoqIEltcGxlbWVudGVkIGFzIHBhcnQgb2YgQ29udHJvbFZhbHVlQWNjZXNzb3IuICovXG4gIHdyaXRlVmFsdWUodmFsdWVzOiBzdHJpbmdbXSk6IHZvaWQge1xuICAgIHRoaXMuX3ZhbHVlID0gdmFsdWVzO1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucykge1xuICAgICAgdGhpcy5fc2V0T3B0aW9uc0Zyb21WYWx1ZXModmFsdWVzIHx8IFtdKTtcbiAgICB9XG4gIH1cblxuICAvKiogSW1wbGVtZW50ZWQgYXMgYSBwYXJ0IG9mIENvbnRyb2xWYWx1ZUFjY2Vzc29yLiAqL1xuICBzZXREaXNhYmxlZFN0YXRlKGlzRGlzYWJsZWQ6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLmRpc2FibGVkID0gaXNEaXNhYmxlZDtcbiAgfVxuXG4gIC8qKiBJbXBsZW1lbnRlZCBhcyBwYXJ0IG9mIENvbnRyb2xWYWx1ZUFjY2Vzc29yLiAqL1xuICByZWdpc3Rlck9uQ2hhbmdlKGZuOiAodmFsdWU6IGFueSkgPT4gdm9pZCk6IHZvaWQge1xuICAgIHRoaXMuX29uQ2hhbmdlID0gZm47XG4gIH1cblxuICAvKiogSW1wbGVtZW50ZWQgYXMgcGFydCBvZiBDb250cm9sVmFsdWVBY2Nlc3Nvci4gKi9cbiAgcmVnaXN0ZXJPblRvdWNoZWQoZm46ICgpID0+IHZvaWQpOiB2b2lkIHtcbiAgICB0aGlzLl9vblRvdWNoZWQgPSBmbjtcbiAgfVxuXG4gIC8qKiBTZXRzIHRoZSBzZWxlY3RlZCBvcHRpb25zIGJhc2VkIG9uIHRoZSBzcGVjaWZpZWQgdmFsdWVzLiAqL1xuICBwcml2YXRlIF9zZXRPcHRpb25zRnJvbVZhbHVlcyh2YWx1ZXM6IHN0cmluZ1tdKSB7XG4gICAgdGhpcy5vcHRpb25zLmZvckVhY2gob3B0aW9uID0+IG9wdGlvbi5fc2V0U2VsZWN0ZWQoZmFsc2UpKTtcblxuICAgIHZhbHVlcy5mb3JFYWNoKHZhbHVlID0+IHtcbiAgICAgIGNvbnN0IGNvcnJlc3BvbmRpbmdPcHRpb24gPSB0aGlzLm9wdGlvbnMuZmluZChvcHRpb24gPT4ge1xuICAgICAgICAvLyBTa2lwIG9wdGlvbnMgdGhhdCBhcmUgYWxyZWFkeSBpbiB0aGUgbW9kZWwuIFRoaXMgYWxsb3dzIHVzIHRvIGhhbmRsZSBjYXNlc1xuICAgICAgICAvLyB3aGVyZSB0aGUgc2FtZSBwcmltaXRpdmUgdmFsdWUgaXMgc2VsZWN0ZWQgbXVsdGlwbGUgdGltZXMuXG4gICAgICAgIHJldHVybiBvcHRpb24uc2VsZWN0ZWQgPyBmYWxzZSA6IHRoaXMuY29tcGFyZVdpdGgob3B0aW9uLnZhbHVlLCB2YWx1ZSk7XG4gICAgICB9KTtcblxuICAgICAgaWYgKGNvcnJlc3BvbmRpbmdPcHRpb24pIHtcbiAgICAgICAgY29ycmVzcG9uZGluZ09wdGlvbi5fc2V0U2VsZWN0ZWQodHJ1ZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKiogUmV0dXJucyB0aGUgdmFsdWVzIG9mIHRoZSBzZWxlY3RlZCBvcHRpb25zLiAqL1xuICBwcml2YXRlIF9nZXRTZWxlY3RlZE9wdGlvblZhbHVlcygpOiBzdHJpbmdbXSB7XG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucy5maWx0ZXIob3B0aW9uID0+IG9wdGlvbi5zZWxlY3RlZCkubWFwKG9wdGlvbiA9PiBvcHRpb24udmFsdWUpO1xuICB9XG5cbiAgLyoqIFRvZ2dsZXMgdGhlIHN0YXRlIG9mIHRoZSBjdXJyZW50bHkgZm9jdXNlZCBvcHRpb24gaWYgZW5hYmxlZC4gKi9cbiAgcHJpdmF0ZSBfdG9nZ2xlRm9jdXNlZE9wdGlvbigpOiB2b2lkIHtcbiAgICBsZXQgZm9jdXNlZEluZGV4ID0gdGhpcy5fa2V5TWFuYWdlci5hY3RpdmVJdGVtSW5kZXg7XG5cbiAgICBpZiAoZm9jdXNlZEluZGV4ICE9IG51bGwgJiYgdGhpcy5faXNWYWxpZEluZGV4KGZvY3VzZWRJbmRleCkpIHtcbiAgICAgIGxldCBmb2N1c2VkT3B0aW9uOiBNYXRMaXN0T3B0aW9uID0gdGhpcy5vcHRpb25zLnRvQXJyYXkoKVtmb2N1c2VkSW5kZXhdO1xuXG4gICAgICBpZiAoZm9jdXNlZE9wdGlvbiAmJiAhZm9jdXNlZE9wdGlvbi5kaXNhYmxlZCAmJiAodGhpcy5fbXVsdGlwbGUgfHwgIWZvY3VzZWRPcHRpb24uc2VsZWN0ZWQpKSB7XG4gICAgICAgIGZvY3VzZWRPcHRpb24udG9nZ2xlKCk7XG5cbiAgICAgICAgLy8gRW1pdCBhIGNoYW5nZSBldmVudCBiZWNhdXNlIHRoZSBmb2N1c2VkIG9wdGlvbiBjaGFuZ2VkIGl0cyBzdGF0ZSB0aHJvdWdoIHVzZXJcbiAgICAgICAgLy8gaW50ZXJhY3Rpb24uXG4gICAgICAgIHRoaXMuX2VtaXRDaGFuZ2VFdmVudChbZm9jdXNlZE9wdGlvbl0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBzZWxlY3RlZCBzdGF0ZSBvbiBhbGwgb2YgdGhlIG9wdGlvbnNcbiAgICogYW5kIGVtaXRzIGFuIGV2ZW50IGlmIGFueXRoaW5nIGNoYW5nZWQuXG4gICAqL1xuICBwcml2YXRlIF9zZXRBbGxPcHRpb25zU2VsZWN0ZWQoXG4gICAgaXNTZWxlY3RlZDogYm9vbGVhbixcbiAgICBza2lwRGlzYWJsZWQ/OiBib29sZWFuLFxuICAgIGlzVXNlcklucHV0PzogYm9vbGVhbik6IE1hdExpc3RPcHRpb25bXSB7XG4gICAgLy8gS2VlcCB0cmFjayBvZiB3aGV0aGVyIGFueXRoaW5nIGNoYW5nZWQsIGJlY2F1c2Ugd2Ugb25seSB3YW50IHRvXG4gICAgLy8gZW1pdCB0aGUgY2hhbmdlZCBldmVudCB3aGVuIHNvbWV0aGluZyBhY3R1YWxseSBjaGFuZ2VkLlxuICAgIGNvbnN0IGNoYW5nZWRPcHRpb25zOiBNYXRMaXN0T3B0aW9uW10gPSBbXTtcblxuICAgIHRoaXMub3B0aW9ucy5mb3JFYWNoKG9wdGlvbiA9PiB7XG4gICAgICBpZiAoKCFza2lwRGlzYWJsZWQgfHwgIW9wdGlvbi5kaXNhYmxlZCkgJiYgb3B0aW9uLl9zZXRTZWxlY3RlZChpc1NlbGVjdGVkKSkge1xuICAgICAgICBjaGFuZ2VkT3B0aW9ucy5wdXNoKG9wdGlvbik7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBpZiAoY2hhbmdlZE9wdGlvbnMubGVuZ3RoKSB7XG4gICAgICB0aGlzLl9yZXBvcnRWYWx1ZUNoYW5nZSgpO1xuXG4gICAgICBpZiAoaXNVc2VySW5wdXQpIHtcbiAgICAgICAgdGhpcy5fZW1pdENoYW5nZUV2ZW50KGNoYW5nZWRPcHRpb25zKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gY2hhbmdlZE9wdGlvbnM7XG4gIH1cblxuICAvKipcbiAgICogVXRpbGl0eSB0byBlbnN1cmUgYWxsIGluZGV4ZXMgYXJlIHZhbGlkLlxuICAgKiBAcGFyYW0gaW5kZXggVGhlIGluZGV4IHRvIGJlIGNoZWNrZWQuXG4gICAqIEByZXR1cm5zIFRydWUgaWYgdGhlIGluZGV4IGlzIHZhbGlkIGZvciBvdXIgbGlzdCBvZiBvcHRpb25zLlxuICAgKi9cbiAgcHJpdmF0ZSBfaXNWYWxpZEluZGV4KGluZGV4OiBudW1iZXIpOiBib29sZWFuIHtcbiAgICByZXR1cm4gaW5kZXggPj0gMCAmJiBpbmRleCA8IHRoaXMub3B0aW9ucy5sZW5ndGg7XG4gIH1cblxuICAvKiogUmV0dXJucyB0aGUgaW5kZXggb2YgdGhlIHNwZWNpZmllZCBsaXN0IG9wdGlvbi4gKi9cbiAgcHJpdmF0ZSBfZ2V0T3B0aW9uSW5kZXgob3B0aW9uOiBNYXRMaXN0T3B0aW9uKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5vcHRpb25zLnRvQXJyYXkoKS5pbmRleE9mKG9wdGlvbik7XG4gIH1cblxuICAvKiogTWFya3MgYWxsIHRoZSBvcHRpb25zIHRvIGJlIGNoZWNrZWQgaW4gdGhlIG5leHQgY2hhbmdlIGRldGVjdGlvbiBydW4uICovXG4gIHByaXZhdGUgX21hcmtPcHRpb25zRm9yQ2hlY2soKSB7XG4gICAgaWYgKHRoaXMub3B0aW9ucykge1xuICAgICAgdGhpcy5vcHRpb25zLmZvckVhY2gob3B0aW9uID0+IG9wdGlvbi5fbWFya0ZvckNoZWNrKCkpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIHRoZSB0YWJpbmRleCBmcm9tIHRoZSBzZWxlY3Rpb24gbGlzdCBhbmQgcmVzZXRzIGl0IGJhY2sgYWZ0ZXJ3YXJkcywgYWxsb3dpbmcgdGhlIHVzZXJcbiAgICogdG8gdGFiIG91dCBvZiBpdC4gVGhpcyBwcmV2ZW50cyB0aGUgbGlzdCBmcm9tIGNhcHR1cmluZyBmb2N1cyBhbmQgcmVkaXJlY3RpbmcgaXQgYmFjayB3aXRoaW5cbiAgICogdGhlIGxpc3QsIGNyZWF0aW5nIGEgZm9jdXMgdHJhcCBpZiBpdCB1c2VyIHRyaWVzIHRvIHRhYiBhd2F5LlxuICAgKi9cbiAgcHJpdmF0ZSBfYWxsb3dGb2N1c0VzY2FwZSgpIHtcbiAgICB0aGlzLl90YWJJbmRleCA9IC0xO1xuXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICB0aGlzLl90YWJJbmRleCA9IDA7XG4gICAgICB0aGlzLl9jaGFuZ2VEZXRlY3Rvci5tYXJrRm9yQ2hlY2soKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBVcGRhdGVzIHRoZSB0YWJpbmRleCBiYXNlZCB1cG9uIGlmIHRoZSBzZWxlY3Rpb24gbGlzdCBpcyBlbXB0eS4gKi9cbiAgcHJpdmF0ZSBfdXBkYXRlVGFiSW5kZXgoKTogdm9pZCB7XG4gICAgdGhpcy5fdGFiSW5kZXggPSAodGhpcy5vcHRpb25zLmxlbmd0aCA9PT0gMCkgPyAtMSA6IDA7XG4gIH1cblxuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZGlzYWJsZWQ6IEJvb2xlYW5JbnB1dDtcbiAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2Rpc2FibGVSaXBwbGU6IEJvb2xlYW5JbnB1dDtcbiAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX211bHRpcGxlOiBCb29sZWFuSW5wdXQ7XG59XG4iXX0=