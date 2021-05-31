/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { FocusMonitor } from '@angular/cdk/a11y';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { SelectionModel } from '@angular/cdk/collections';
import { Attribute, ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChildren, Directive, ElementRef, EventEmitter, forwardRef, Input, Optional, Output, QueryList, ViewChild, ViewEncapsulation, InjectionToken, Inject, } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { mixinDisableRipple, } from '@angular/material/core';
/**
 * Injection token that can be used to configure the
 * default options for all button toggles within an app.
 */
export const MAT_BUTTON_TOGGLE_DEFAULT_OPTIONS = new InjectionToken('MAT_BUTTON_TOGGLE_DEFAULT_OPTIONS');
/**
 * Injection token that can be used to reference instances of `MatButtonToggleGroup`.
 * It serves as alternative token to the actual `MatButtonToggleGroup` class which
 * could cause unnecessary retention of the class and its component metadata.
 */
export const MAT_BUTTON_TOGGLE_GROUP = new InjectionToken('MatButtonToggleGroup');
/**
 * Provider Expression that allows mat-button-toggle-group to register as a ControlValueAccessor.
 * This allows it to support [(ngModel)].
 * @docs-private
 */
export const MAT_BUTTON_TOGGLE_GROUP_VALUE_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => MatButtonToggleGroup),
    multi: true
};
// Counter used to generate unique IDs.
let uniqueIdCounter = 0;
/** Change event object emitted by MatButtonToggle. */
export class MatButtonToggleChange {
    constructor(
    /** The MatButtonToggle that emits the event. */
    source, 
    /** The value assigned to the MatButtonToggle. */
    value) {
        this.source = source;
        this.value = value;
    }
}
/** Exclusive selection button toggle group that behaves like a radio-button group. */
export class MatButtonToggleGroup {
    constructor(_changeDetector, defaultOptions) {
        this._changeDetector = _changeDetector;
        this._vertical = false;
        this._multiple = false;
        this._disabled = false;
        /**
         * The method to be called in order to update ngModel.
         * Now `ngModel` binding is not supported in multiple selection mode.
         */
        this._controlValueAccessorChangeFn = () => { };
        /** onTouch function registered via registerOnTouch (ControlValueAccessor). */
        this._onTouched = () => { };
        this._name = `mat-button-toggle-group-${uniqueIdCounter++}`;
        /**
         * Event that emits whenever the value of the group changes.
         * Used to facilitate two-way data binding.
         * @docs-private
         */
        this.valueChange = new EventEmitter();
        /** Event emitted when the group's value changes. */
        this.change = new EventEmitter();
        this.appearance =
            defaultOptions && defaultOptions.appearance ? defaultOptions.appearance : 'standard';
    }
    /** `name` attribute for the underlying `input` element. */
    get name() { return this._name; }
    set name(value) {
        this._name = value;
        if (this._buttonToggles) {
            this._buttonToggles.forEach(toggle => {
                toggle.name = this._name;
                toggle._markForCheck();
            });
        }
    }
    /** Whether the toggle group is vertical. */
    get vertical() { return this._vertical; }
    set vertical(value) {
        this._vertical = coerceBooleanProperty(value);
    }
    /** Value of the toggle group. */
    get value() {
        const selected = this._selectionModel ? this._selectionModel.selected : [];
        if (this.multiple) {
            return selected.map(toggle => toggle.value);
        }
        return selected[0] ? selected[0].value : undefined;
    }
    set value(newValue) {
        this._setSelectionByValue(newValue);
        this.valueChange.emit(this.value);
    }
    /** Selected button toggles in the group. */
    get selected() {
        const selected = this._selectionModel ? this._selectionModel.selected : [];
        return this.multiple ? selected : (selected[0] || null);
    }
    /** Whether multiple button toggles can be selected. */
    get multiple() { return this._multiple; }
    set multiple(value) {
        this._multiple = coerceBooleanProperty(value);
    }
    /** Whether multiple button toggle group is disabled. */
    get disabled() { return this._disabled; }
    set disabled(value) {
        this._disabled = coerceBooleanProperty(value);
        if (this._buttonToggles) {
            this._buttonToggles.forEach(toggle => toggle._markForCheck());
        }
    }
    ngOnInit() {
        this._selectionModel = new SelectionModel(this.multiple, undefined, false);
    }
    ngAfterContentInit() {
        this._selectionModel.select(...this._buttonToggles.filter(toggle => toggle.checked));
    }
    /**
     * Sets the model value. Implemented as part of ControlValueAccessor.
     * @param value Value to be set to the model.
     */
    writeValue(value) {
        this.value = value;
        this._changeDetector.markForCheck();
    }
    // Implemented as part of ControlValueAccessor.
    registerOnChange(fn) {
        this._controlValueAccessorChangeFn = fn;
    }
    // Implemented as part of ControlValueAccessor.
    registerOnTouched(fn) {
        this._onTouched = fn;
    }
    // Implemented as part of ControlValueAccessor.
    setDisabledState(isDisabled) {
        this.disabled = isDisabled;
    }
    /** Dispatch change event with current selection and group value. */
    _emitChangeEvent() {
        const selected = this.selected;
        const source = Array.isArray(selected) ? selected[selected.length - 1] : selected;
        const event = new MatButtonToggleChange(source, this.value);
        this._controlValueAccessorChangeFn(event.value);
        this.change.emit(event);
    }
    /**
     * Syncs a button toggle's selected state with the model value.
     * @param toggle Toggle to be synced.
     * @param select Whether the toggle should be selected.
     * @param isUserInput Whether the change was a result of a user interaction.
     * @param deferEvents Whether to defer emitting the change events.
     */
    _syncButtonToggle(toggle, select, isUserInput = false, deferEvents = false) {
        // Deselect the currently-selected toggle, if we're in single-selection
        // mode and the button being toggled isn't selected at the moment.
        if (!this.multiple && this.selected && !toggle.checked) {
            this.selected.checked = false;
        }
        if (this._selectionModel) {
            if (select) {
                this._selectionModel.select(toggle);
            }
            else {
                this._selectionModel.deselect(toggle);
            }
        }
        else {
            deferEvents = true;
        }
        // We need to defer in some cases in order to avoid "changed after checked errors", however
        // the side-effect is that we may end up updating the model value out of sequence in others
        // The `deferEvents` flag allows us to decide whether to do it on a case-by-case basis.
        if (deferEvents) {
            Promise.resolve().then(() => this._updateModelValue(isUserInput));
        }
        else {
            this._updateModelValue(isUserInput);
        }
    }
    /** Checks whether a button toggle is selected. */
    _isSelected(toggle) {
        return this._selectionModel && this._selectionModel.isSelected(toggle);
    }
    /** Determines whether a button toggle should be checked on init. */
    _isPrechecked(toggle) {
        if (typeof this._rawValue === 'undefined') {
            return false;
        }
        if (this.multiple && Array.isArray(this._rawValue)) {
            return this._rawValue.some(value => toggle.value != null && value === toggle.value);
        }
        return toggle.value === this._rawValue;
    }
    /** Updates the selection state of the toggles in the group based on a value. */
    _setSelectionByValue(value) {
        this._rawValue = value;
        if (!this._buttonToggles) {
            return;
        }
        if (this.multiple && value) {
            if (!Array.isArray(value) && (typeof ngDevMode === 'undefined' || ngDevMode)) {
                throw Error('Value must be an array in multiple-selection mode.');
            }
            this._clearSelection();
            value.forEach((currentValue) => this._selectValue(currentValue));
        }
        else {
            this._clearSelection();
            this._selectValue(value);
        }
    }
    /** Clears the selected toggles. */
    _clearSelection() {
        this._selectionModel.clear();
        this._buttonToggles.forEach(toggle => toggle.checked = false);
    }
    /** Selects a value if there's a toggle that corresponds to it. */
    _selectValue(value) {
        const correspondingOption = this._buttonToggles.find(toggle => {
            return toggle.value != null && toggle.value === value;
        });
        if (correspondingOption) {
            correspondingOption.checked = true;
            this._selectionModel.select(correspondingOption);
        }
    }
    /** Syncs up the group's value with the model and emits the change event. */
    _updateModelValue(isUserInput) {
        // Only emit the change event for user input.
        if (isUserInput) {
            this._emitChangeEvent();
        }
        // Note: we emit this one no matter whether it was a user interaction, because
        // it is used by Angular to sync up the two-way data binding.
        this.valueChange.emit(this.value);
    }
}
MatButtonToggleGroup.decorators = [
    { type: Directive, args: [{
                selector: 'mat-button-toggle-group',
                providers: [
                    MAT_BUTTON_TOGGLE_GROUP_VALUE_ACCESSOR,
                    { provide: MAT_BUTTON_TOGGLE_GROUP, useExisting: MatButtonToggleGroup },
                ],
                host: {
                    'role': 'group',
                    'class': 'mat-button-toggle-group',
                    '[attr.aria-disabled]': 'disabled',
                    '[class.mat-button-toggle-vertical]': 'vertical',
                    '[class.mat-button-toggle-group-appearance-standard]': 'appearance === "standard"',
                },
                exportAs: 'matButtonToggleGroup',
            },] }
];
MatButtonToggleGroup.ctorParameters = () => [
    { type: ChangeDetectorRef },
    { type: undefined, decorators: [{ type: Optional }, { type: Inject, args: [MAT_BUTTON_TOGGLE_DEFAULT_OPTIONS,] }] }
];
MatButtonToggleGroup.propDecorators = {
    _buttonToggles: [{ type: ContentChildren, args: [forwardRef(() => MatButtonToggle), {
                    // Note that this would technically pick up toggles
                    // from nested groups, but that's not a case that we support.
                    descendants: true
                },] }],
    appearance: [{ type: Input }],
    name: [{ type: Input }],
    vertical: [{ type: Input }],
    value: [{ type: Input }],
    valueChange: [{ type: Output }],
    multiple: [{ type: Input }],
    disabled: [{ type: Input }],
    change: [{ type: Output }]
};
// Boilerplate for applying mixins to the MatButtonToggle class.
/** @docs-private */
class MatButtonToggleBase {
}
const _MatButtonToggleMixinBase = mixinDisableRipple(MatButtonToggleBase);
/** Single button inside of a toggle group. */
export class MatButtonToggle extends _MatButtonToggleMixinBase {
    constructor(toggleGroup, _changeDetectorRef, _elementRef, _focusMonitor, defaultTabIndex, defaultOptions) {
        super();
        this._changeDetectorRef = _changeDetectorRef;
        this._elementRef = _elementRef;
        this._focusMonitor = _focusMonitor;
        this._isSingleSelector = false;
        this._checked = false;
        /**
         * Users can specify the `aria-labelledby` attribute which will be forwarded to the input element
         */
        this.ariaLabelledby = null;
        this._disabled = false;
        /** Event emitted when the group value changes. */
        this.change = new EventEmitter();
        const parsedTabIndex = Number(defaultTabIndex);
        this.tabIndex = (parsedTabIndex || parsedTabIndex === 0) ? parsedTabIndex : null;
        this.buttonToggleGroup = toggleGroup;
        this.appearance =
            defaultOptions && defaultOptions.appearance ? defaultOptions.appearance : 'standard';
    }
    /** Unique ID for the underlying `button` element. */
    get buttonId() { return `${this.id}-button`; }
    /** The appearance style of the button. */
    get appearance() {
        return this.buttonToggleGroup ? this.buttonToggleGroup.appearance : this._appearance;
    }
    set appearance(value) {
        this._appearance = value;
    }
    /** Whether the button is checked. */
    get checked() {
        return this.buttonToggleGroup ? this.buttonToggleGroup._isSelected(this) : this._checked;
    }
    set checked(value) {
        const newValue = coerceBooleanProperty(value);
        if (newValue !== this._checked) {
            this._checked = newValue;
            if (this.buttonToggleGroup) {
                this.buttonToggleGroup._syncButtonToggle(this, this._checked);
            }
            this._changeDetectorRef.markForCheck();
        }
    }
    /** Whether the button is disabled. */
    get disabled() {
        return this._disabled || (this.buttonToggleGroup && this.buttonToggleGroup.disabled);
    }
    set disabled(value) { this._disabled = coerceBooleanProperty(value); }
    ngOnInit() {
        const group = this.buttonToggleGroup;
        this._isSingleSelector = group && !group.multiple;
        this.id = this.id || `mat-button-toggle-${uniqueIdCounter++}`;
        if (this._isSingleSelector) {
            this.name = group.name;
        }
        if (group) {
            if (group._isPrechecked(this)) {
                this.checked = true;
            }
            else if (group._isSelected(this) !== this._checked) {
                // As as side effect of the circular dependency between the toggle group and the button,
                // we may end up in a state where the button is supposed to be checked on init, but it
                // isn't, because the checked value was assigned too early. This can happen when Ivy
                // assigns the static input value before the `ngOnInit` has run.
                group._syncButtonToggle(this, this._checked);
            }
        }
    }
    ngAfterViewInit() {
        this._focusMonitor.monitor(this._elementRef, true);
    }
    ngOnDestroy() {
        const group = this.buttonToggleGroup;
        this._focusMonitor.stopMonitoring(this._elementRef);
        // Remove the toggle from the selection once it's destroyed. Needs to happen
        // on the next tick in order to avoid "changed after checked" errors.
        if (group && group._isSelected(this)) {
            group._syncButtonToggle(this, false, false, true);
        }
    }
    /** Focuses the button. */
    focus(options) {
        this._buttonElement.nativeElement.focus(options);
    }
    /** Checks the button toggle due to an interaction with the underlying native button. */
    _onButtonClick() {
        const newChecked = this._isSingleSelector ? true : !this._checked;
        if (newChecked !== this._checked) {
            this._checked = newChecked;
            if (this.buttonToggleGroup) {
                this.buttonToggleGroup._syncButtonToggle(this, this._checked, true);
                this.buttonToggleGroup._onTouched();
            }
        }
        // Emit a change event when it's the single selector
        this.change.emit(new MatButtonToggleChange(this, this.value));
    }
    /**
     * Marks the button toggle as needing checking for change detection.
     * This method is exposed because the parent button toggle group will directly
     * update bound properties of the radio button.
     */
    _markForCheck() {
        // When the group value changes, the button will not be notified.
        // Use `markForCheck` to explicit update button toggle's status.
        this._changeDetectorRef.markForCheck();
    }
}
MatButtonToggle.decorators = [
    { type: Component, args: [{
                selector: 'mat-button-toggle',
                template: "<button #button class=\"mat-button-toggle-button mat-focus-indicator\"\n        type=\"button\"\n        [id]=\"buttonId\"\n        [attr.tabindex]=\"disabled ? -1 : tabIndex\"\n        [attr.aria-pressed]=\"checked\"\n        [disabled]=\"disabled || null\"\n        [attr.name]=\"name || null\"\n        [attr.aria-label]=\"ariaLabel\"\n        [attr.aria-labelledby]=\"ariaLabelledby\"\n        (click)=\"_onButtonClick()\">\n  <span class=\"mat-button-toggle-label-content\">\n    <ng-content></ng-content>\n  </span>\n</button>\n\n<span class=\"mat-button-toggle-focus-overlay\"></span>\n<span class=\"mat-button-toggle-ripple\" matRipple\n     [matRippleTrigger]=\"button\"\n     [matRippleDisabled]=\"this.disableRipple || this.disabled\">\n</span>\n",
                encapsulation: ViewEncapsulation.None,
                exportAs: 'matButtonToggle',
                changeDetection: ChangeDetectionStrategy.OnPush,
                inputs: ['disableRipple'],
                host: {
                    '[class.mat-button-toggle-standalone]': '!buttonToggleGroup',
                    '[class.mat-button-toggle-checked]': 'checked',
                    '[class.mat-button-toggle-disabled]': 'disabled',
                    '[class.mat-button-toggle-appearance-standard]': 'appearance === "standard"',
                    'class': 'mat-button-toggle',
                    '[attr.aria-label]': 'null',
                    '[attr.aria-labelledby]': 'null',
                    '[attr.id]': 'id',
                    '[attr.name]': 'null',
                    '(focus)': 'focus()',
                    'role': 'presentation',
                },
                styles: [".mat-button-toggle-standalone,.mat-button-toggle-group{position:relative;display:inline-flex;flex-direction:row;white-space:nowrap;overflow:hidden;border-radius:2px;-webkit-tap-highlight-color:transparent}.cdk-high-contrast-active .mat-button-toggle-standalone,.cdk-high-contrast-active .mat-button-toggle-group{outline:solid 1px}.mat-button-toggle-standalone.mat-button-toggle-appearance-standard,.mat-button-toggle-group-appearance-standard{border-radius:4px}.cdk-high-contrast-active .mat-button-toggle-standalone.mat-button-toggle-appearance-standard,.cdk-high-contrast-active .mat-button-toggle-group-appearance-standard{outline:0}.mat-button-toggle-vertical{flex-direction:column}.mat-button-toggle-vertical .mat-button-toggle-label-content{display:block}.mat-button-toggle{white-space:nowrap;position:relative}.mat-button-toggle .mat-icon svg{vertical-align:top}.mat-button-toggle.cdk-keyboard-focused .mat-button-toggle-focus-overlay{opacity:1}.cdk-high-contrast-active .mat-button-toggle.cdk-keyboard-focused .mat-button-toggle-focus-overlay{opacity:.5}.mat-button-toggle-appearance-standard:not(.mat-button-toggle-disabled):hover .mat-button-toggle-focus-overlay{opacity:.04}.mat-button-toggle-appearance-standard.cdk-keyboard-focused:not(.mat-button-toggle-disabled) .mat-button-toggle-focus-overlay{opacity:.12}.cdk-high-contrast-active .mat-button-toggle-appearance-standard.cdk-keyboard-focused:not(.mat-button-toggle-disabled) .mat-button-toggle-focus-overlay{opacity:.5}@media(hover: none){.mat-button-toggle-appearance-standard:not(.mat-button-toggle-disabled):hover .mat-button-toggle-focus-overlay{display:none}}.mat-button-toggle-label-content{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;display:inline-block;line-height:36px;padding:0 16px;position:relative}.mat-button-toggle-appearance-standard .mat-button-toggle-label-content{padding:0 12px}.mat-button-toggle-label-content>*{vertical-align:middle}.mat-button-toggle-focus-overlay{border-radius:inherit;pointer-events:none;opacity:0;top:0;left:0;right:0;bottom:0;position:absolute}.mat-button-toggle-checked .mat-button-toggle-focus-overlay{border-bottom:solid 36px}.cdk-high-contrast-active .mat-button-toggle-checked .mat-button-toggle-focus-overlay{opacity:.5;height:0}.cdk-high-contrast-active .mat-button-toggle-checked.mat-button-toggle-appearance-standard .mat-button-toggle-focus-overlay{border-bottom:solid 500px}.mat-button-toggle .mat-button-toggle-ripple{top:0;left:0;right:0;bottom:0;position:absolute;pointer-events:none}.mat-button-toggle-button{border:0;background:none;color:inherit;padding:0;margin:0;font:inherit;outline:none;width:100%;cursor:pointer}.mat-button-toggle-disabled .mat-button-toggle-button{cursor:default}.mat-button-toggle-button::-moz-focus-inner{border:0}\n"]
            },] }
];
MatButtonToggle.ctorParameters = () => [
    { type: MatButtonToggleGroup, decorators: [{ type: Optional }, { type: Inject, args: [MAT_BUTTON_TOGGLE_GROUP,] }] },
    { type: ChangeDetectorRef },
    { type: ElementRef },
    { type: FocusMonitor },
    { type: String, decorators: [{ type: Attribute, args: ['tabindex',] }] },
    { type: undefined, decorators: [{ type: Optional }, { type: Inject, args: [MAT_BUTTON_TOGGLE_DEFAULT_OPTIONS,] }] }
];
MatButtonToggle.propDecorators = {
    ariaLabel: [{ type: Input, args: ['aria-label',] }],
    ariaLabelledby: [{ type: Input, args: ['aria-labelledby',] }],
    _buttonElement: [{ type: ViewChild, args: ['button',] }],
    id: [{ type: Input }],
    name: [{ type: Input }],
    value: [{ type: Input }],
    tabIndex: [{ type: Input }],
    appearance: [{ type: Input }],
    checked: [{ type: Input }],
    disabled: [{ type: Input }],
    change: [{ type: Output }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnV0dG9uLXRvZ2dsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9idXR0b24tdG9nZ2xlL2J1dHRvbi10b2dnbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQy9DLE9BQU8sRUFBZSxxQkFBcUIsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQzFFLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSwwQkFBMEIsQ0FBQztBQUN4RCxPQUFPLEVBRUwsU0FBUyxFQUNULHVCQUF1QixFQUN2QixpQkFBaUIsRUFDakIsU0FBUyxFQUNULGVBQWUsRUFDZixTQUFTLEVBQ1QsVUFBVSxFQUNWLFlBQVksRUFDWixVQUFVLEVBQ1YsS0FBSyxFQUdMLFFBQVEsRUFDUixNQUFNLEVBQ04sU0FBUyxFQUNULFNBQVMsRUFDVCxpQkFBaUIsRUFDakIsY0FBYyxFQUNkLE1BQU0sR0FFUCxNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQXVCLGlCQUFpQixFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDdkUsT0FBTyxFQUVMLGtCQUFrQixHQUVuQixNQUFNLHdCQUF3QixDQUFDO0FBb0JoQzs7O0dBR0c7QUFDSCxNQUFNLENBQUMsTUFBTSxpQ0FBaUMsR0FDMUMsSUFBSSxjQUFjLENBQWdDLG1DQUFtQyxDQUFDLENBQUM7QUFFM0Y7Ozs7R0FJRztBQUNILE1BQU0sQ0FBQyxNQUFNLHVCQUF1QixHQUNoQyxJQUFJLGNBQWMsQ0FBdUIsc0JBQXNCLENBQUMsQ0FBQztBQUVyRTs7OztHQUlHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sc0NBQXNDLEdBQVE7SUFDekQsT0FBTyxFQUFFLGlCQUFpQjtJQUMxQixXQUFXLEVBQUUsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDLG9CQUFvQixDQUFDO0lBQ25ELEtBQUssRUFBRSxJ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bUI7Z0JBQzdCLGl3QkFBaUM7Z0JBRWpDLGFBQWEsRUFBRSxpQkFBaUIsQ0FBQyxJQUFJO2dCQUNyQyxRQUFRLEVBQUUsaUJBQWlCO2dCQUMzQixlQUFlLEVBQUUsdUJBQXVCLENBQUMsTUFBTTtnQkFDL0MsTUFBTSxFQUFFLENBQUMsZUFBZSxDQUFDO2dCQUN6QixJQUFJLEVBQUU7b0JBQ0osc0NBQXNDLEVBQUUsb0JBQW9CO29CQUM1RCxtQ0FBbUMsRUFBRSxTQUFTO29CQUM5QyxvQ0FBb0MsRUFBRSxVQUFVO29CQUNoRCwrQ0FBK0MsRUFBRSwyQkFBMkI7b0JBQzVFLE9BQU8sRUFBRSxtQkFBbUI7b0JBQzVCLG1CQUFtQixFQUFFLE1BQU07b0JBQzNCLHdCQUF3QixFQUFFLE1BQU07b0JBQ2hDLFdBQVcsRUFBRSxJQUFJO29CQUNqQixhQUFhLEVBQUUsTUFBTTtvQkFDckIsU0FBUyxFQUFFLFNBQVM7b0JBQ3BCLE1BQU0sRUFBRSxjQUFjO2lCQUN2Qjs7YUFDRjs7O1lBZ0Z1RSxvQkFBb0IsdUJBQTdFLFFBQVEsWUFBSSxNQUFNLFNBQUMsdUJBQXVCO1lBMWR2RCxpQkFBaUI7WUFJakIsVUFBVTtZQVhKLFlBQVk7eUNBcWVMLFNBQVMsU0FBQyxVQUFVOzRDQUNwQixRQUFRLFlBQUksTUFBTSxTQUFDLGlDQUFpQzs7O3dCQTFFaEUsS0FBSyxTQUFDLFlBQVk7NkJBS2xCLEtBQUssU0FBQyxpQkFBaUI7NkJBR3ZCLFNBQVMsU0FBQyxRQUFRO2lCQVNsQixLQUFLO21CQUdMLEtBQUs7b0JBR0wsS0FBSzt1QkFHTCxLQUFLO3lCQUdMLEtBQUs7c0JBVUwsS0FBSzt1QkFtQkwsS0FBSztxQkFRTCxNQUFNIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Rm9jdXNNb25pdG9yfSBmcm9tICdAYW5ndWxhci9jZGsvYTExeSc7XG5pbXBvcnQge0Jvb2xlYW5JbnB1dCwgY29lcmNlQm9vbGVhblByb3BlcnR5fSBmcm9tICdAYW5ndWxhci9jZGsvY29lcmNpb24nO1xuaW1wb3J0IHtTZWxlY3Rpb25Nb2RlbH0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvbGxlY3Rpb25zJztcbmltcG9ydCB7XG4gIEFmdGVyQ29udGVudEluaXQsXG4gIEF0dHJpYnV0ZSxcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gIENoYW5nZURldGVjdG9yUmVmLFxuICBDb21wb25lbnQsXG4gIENvbnRlbnRDaGlsZHJlbixcbiAgRGlyZWN0aXZlLFxuICBFbGVtZW50UmVmLFxuICBFdmVudEVtaXR0ZXIsXG4gIGZvcndhcmRSZWYsXG4gIElucHV0LFxuICBPbkRlc3Ryb3ksXG4gIE9uSW5pdCxcbiAgT3B0aW9uYWwsXG4gIE91dHB1dCxcbiAgUXVlcnlMaXN0LFxuICBWaWV3Q2hpbGQsXG4gIFZpZXdFbmNhcHN1bGF0aW9uLFxuICBJbmplY3Rpb25Ub2tlbixcbiAgSW5qZWN0LFxuICBBZnRlclZpZXdJbml0LFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7Q29udHJvbFZhbHVlQWNjZXNzb3IsIE5HX1ZBTFVFX0FDQ0VTU09SfSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XG5pbXBvcnQge1xuICBDYW5EaXNhYmxlUmlwcGxlLFxuICBtaXhpbkRpc2FibGVSaXBwbGUsXG4gIENhbkRpc2FibGVSaXBwbGVDdG9yLFxufSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9jb3JlJztcblxuXG4vKipcbiAqIEBkZXByZWNhdGVkIE5vIGxvbmdlciB1c2VkLlxuICogQGJyZWFraW5nLWNoYW5nZSAxMS4wLjBcbiAqL1xuZXhwb3J0IHR5cGUgVG9nZ2xlVHlwZSA9ICdjaGVja2JveCcgfCAncmFkaW8nO1xuXG4vKiogUG9zc2libGUgYXBwZWFyYW5jZSBzdHlsZXMgZm9yIHRoZSBidXR0b24gdG9nZ2xlLiAqL1xuZXhwb3J0IHR5cGUgTWF0QnV0dG9uVG9nZ2xlQXBwZWFyYW5jZSA9ICdsZWdhY3knIHwgJ3N0YW5kYXJkJztcblxuLyoqXG4gKiBSZXByZXNlbnRzIHRoZSBkZWZhdWx0IG9wdGlvbnMgZm9yIHRoZSBidXR0b24gdG9nZ2xlIHRoYXQgY2FuIGJlIGNvbmZpZ3VyZWRcbiAqIHVzaW5nIHRoZSBgTUFUX0JVVFRPTl9UT0dHTEVfREVGQVVMVF9PUFRJT05TYCBpbmplY3Rpb24gdG9rZW4uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTWF0QnV0dG9uVG9nZ2xlRGVmYXVsdE9wdGlvbnMge1xuICBhcHBlYXJhbmNlPzogTWF0QnV0dG9uVG9nZ2xlQXBwZWFyYW5jZTtcbn1cblxuLyoqXG4gKiBJbmplY3Rpb24gdG9rZW4gdGhhdCBjYW4gYmUgdXNlZCB0byBjb25maWd1cmUgdGhlXG4gKiBkZWZhdWx0IG9wdGlvbnMgZm9yIGFsbCBidXR0b24gdG9nZ2xlcyB3aXRoaW4gYW4gYXBwLlxuICovXG5leHBvcnQgY29uc3QgTUFUX0JVVFRPTl9UT0dHTEVfREVGQVVMVF9PUFRJT05TID1cbiAgICBuZXcgSW5qZWN0aW9uVG9rZW48TWF0QnV0dG9uVG9nZ2xlRGVmYXVsdE9wdGlvbnM+KCdNQVRfQlVUVE9OX1RPR0dMRV9ERUZBVUxUX09QVElPTlMnKTtcblxuLyoqXG4gKiBJbmplY3Rpb24gdG9rZW4gdGhhdCBjYW4gYmUgdXNlZCB0byByZWZlcmVuY2UgaW5zdGFuY2VzIG9mIGBNYXRCdXR0b25Ub2dnbGVHcm91cGAuXG4gKiBJdCBzZXJ2ZXMgYXMgYWx0ZXJuYXRpdmUgdG9rZW4gdG8gdGhlIGFjdHVhbCBgTWF0QnV0dG9uVG9nZ2xlR3JvdXBgIGNsYXNzIHdoaWNoXG4gKiBjb3VsZCBjYXVzZSB1bm5lY2Vzc2FyeSByZXRlbnRpb24gb2YgdGhlIGNsYXNzIGFuZCBpdHMgY29tcG9uZW50IG1ldGFkYXRhLlxuICovXG5leHBvcnQgY29uc3QgTUFUX0JVVFRPTl9UT0dHTEVfR1JPVVAgPVxuICAgIG5ldyBJbmplY3Rpb25Ub2tlbjxNYXRCdXR0b25Ub2dnbGVHcm91cD4oJ01hdEJ1dHRvblRvZ2dsZUdyb3VwJyk7XG5cbi8qKlxuICogUHJvdmlkZXIgRXhwcmVzc2lvbiB0aGF0IGFsbG93cyBtYXQtYnV0dG9uLXRvZ2dsZS1ncm91cCB0byByZWdpc3RlciBhcyBhIENvbnRyb2xWYWx1ZUFjY2Vzc29yLlxuICogVGhpcyBhbGxvd3MgaXQgdG8gc3VwcG9ydCBbKG5nTW9kZWwpXS5cbiAqIEBkb2NzLXByaXZhdGVcbiAqL1xuZXhwb3J0IGNvbnN0IE1BVF9CVVRUT05fVE9HR0xFX0dST1VQX1ZBTFVFX0FDQ0VTU09SOiBhbnkgPSB7XG4gIHByb3ZpZGU6IE5HX1ZBTFVFX0FDQ0VTU09SLFxuICB1c2VFeGlzdGluZzogZm9yd2FyZFJlZigoKSA9PiBNYXRCdXR0b25Ub2dnbGVHcm91cCksXG4gIG11bHRpOiB0cnVlXG59O1xuXG4vLyBDb3VudGVyIHVzZWQgdG8gZ2VuZXJhdGUgdW5pcXVlIElEcy5cbmxldCB1bmlxdWVJZENvdW50ZXIgPSAwO1xuXG4vKiogQ2hhbmdlIGV2ZW50IG9iamVjdCBlbWl0dGVkIGJ5IE1hdEJ1dHRvblRvZ2dsZS4gKi9cbmV4cG9ydCBjbGFzcyBNYXRCdXR0b25Ub2dnbGVDaGFuZ2Uge1xuICBjb25zdHJ1Y3RvcihcbiAgICAvKiogVGhlIE1hdEJ1dHRvblRvZ2dsZSB0aGF0IGVtaXRzIHRoZSBldmVudC4gKi9cbiAgICBwdWJsaWMgc291cmNlOiBNYXRCdXR0b25Ub2dnbGUsXG5cbiAgICAvKiogVGhlIHZhbHVlIGFzc2lnbmVkIHRvIHRoZSBNYXRCdXR0b25Ub2dnbGUuICovXG4gICAgcHVibGljIHZhbHVlOiBhbnkpIHt9XG59XG5cbi8qKiBFeGNsdXNpdmUgc2VsZWN0aW9uIGJ1dHRvbiB0b2dnbGUgZ3JvdXAgdGhhdCBiZWhhdmVzIGxpa2UgYSByYWRpby1idXR0b24gZ3JvdXAuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdtYXQtYnV0dG9uLXRvZ2dsZS1ncm91cCcsXG4gIHByb3ZpZGVyczogW1xuICAgIE1BVF9CVVRUT05fVE9HR0xFX0dST1VQX1ZBTFVFX0FDQ0VTU09SLFxuICAgIHtwcm92aWRlOiBNQVRfQlVUVE9OX1RPR0dMRV9HUk9VUCwgdXNlRXhpc3Rpbmc6IE1hdEJ1dHRvblRvZ2dsZUdyb3VwfSxcbiAgXSxcbiAgaG9zdDoge1xuICAgICdyb2xlJzogJ2dyb3VwJyxcbiAgICAnY2xhc3MnOiAnbWF0LWJ1dHRvbi10b2dnbGUtZ3JvdXAnLFxuICAgICdbYXR0ci5hcmlhLWRpc2FibGVkXSc6ICdkaXNhYmxlZCcsXG4gICAgJ1tjbGFzcy5tYXQtYnV0dG9uLXRvZ2dsZS12ZXJ0aWNhbF0nOiAndmVydGljYWwnLFxuICAgICdbY2xhc3MubWF0LWJ1dHRvbi10b2dnbGUtZ3JvdXAtYXBwZWFyYW5jZS1zdGFuZGFyZF0nOiAnYXBwZWFyYW5jZSA9PT0gXCJzdGFuZGFyZFwiJyxcbiAgfSxcbiAgZXhwb3J0QXM6ICdtYXRCdXR0b25Ub2dnbGVHcm91cCcsXG59KVxuZXhwb3J0IGNsYXNzIE1hdEJ1dHRvblRvZ2dsZUdyb3VwIGltcGxlbWVudHMgQ29udHJvbFZhbHVlQWNjZXNzb3IsIE9uSW5pdCwgQWZ0ZXJDb250ZW50SW5pdCB7XG4gIHByaXZhdGUgX3ZlcnRpY2FsID0gZmFsc2U7XG4gIHByaXZhdGUgX211bHRpcGxlID0gZmFsc2U7XG4gIHByaXZhdGUgX2Rpc2FibGVkID0gZmFsc2U7XG4gIHByaXZhdGUgX3NlbGVjdGlvbk1vZGVsOiBTZWxlY3Rpb25Nb2RlbDxNYXRCdXR0b25Ub2dnbGU+O1xuXG4gIC8qKlxuICAgKiBSZWZlcmVuY2UgdG8gdGhlIHJhdyB2YWx1ZSB0aGF0IHRoZSBjb25zdW1lciB0cmllZCB0byBhc3NpZ24uIFRoZSByZWFsXG4gICAqIHZhbHVlIHdpbGwgZXhjbHVkZSBhbnkgdmFsdWVzIGZyb20gdGhpcyBvbmUgdGhhdCBkb24ndCBjb3JyZXNwb25kIHRvIGFcbiAgICogdG9nZ2xlLiBVc2VmdWwgZm9yIHRoZSBjYXNlcyB3aGVyZSB0aGUgdmFsdWUgaXMgYXNzaWduZWQgYmVmb3JlIHRoZSB0b2dnbGVzXG4gICAqIGhhdmUgYmVlbiBpbml0aWFsaXplZCBvciBhdCB0aGUgc2FtZSB0aGF0IHRoZXkncmUgYmVpbmcgc3dhcHBlZCBvdXQuXG4gICAqL1xuICBwcml2YXRlIF9yYXdWYWx1ZTogYW55O1xuXG4gIC8qKlxuICAgKiBUaGUgbWV0aG9kIHRvIGJlIGNhbGxlZCBpbiBvcmRlciB0byB1cGRhdGUgbmdNb2RlbC5cbiAgICogTm93IGBuZ01vZGVsYCBiaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQgaW4gbXVsdGlwbGUgc2VsZWN0aW9uIG1vZGUuXG4gICAqL1xuICBfY29udHJvbFZhbHVlQWNjZXNzb3JDaGFuZ2VGbjogKHZhbHVlOiBhbnkpID0+IHZvaWQgPSAoKSA9PiB7fTtcblxuICAvKiogb25Ub3VjaCBmdW5jdGlvbiByZWdpc3RlcmVkIHZpYSByZWdpc3Rlck9uVG91Y2ggKENvbnRyb2xWYWx1ZUFjY2Vzc29yKS4gKi9cbiAgX29uVG91Y2hlZDogKCkgPT4gYW55ID0gKCkgPT4ge307XG5cbiAgLyoqIENoaWxkIGJ1dHRvbiB0b2dnbGUgYnV0dG9ucy4gKi9cbiAgQENvbnRlbnRDaGlsZHJlbihmb3J3YXJkUmVmKCgpID0+IE1hdEJ1dHRvblRvZ2dsZSksIHtcbiAgICAvLyBOb3RlIHRoYXQgdGhpcyB3b3VsZCB0ZWNobmljYWxseSBwaWNrIHVwIHRvZ2dsZXNcbiAgICAvLyBmcm9tIG5lc3RlZCBncm91cHMsIGJ1dCB0aGF0J3Mgbm90IGEgY2FzZSB0aGF0IHdlIHN1cHBvcnQuXG4gICAgZGVzY2VuZGFudHM6IHRydWVcbiAgfSkgX2J1dHRvblRvZ2dsZXM6IFF1ZXJ5TGlzdDxNYXRCdXR0b25Ub2dnbGU+O1xuXG4gIC8qKiBUaGUgYXBwZWFyYW5jZSBmb3IgYWxsIHRoZSBidXR0b25zIGluIHRoZSBncm91cC4gKi9cbiAgQElucHV0KCkgYXBwZWFyYW5jZTogTWF0QnV0dG9uVG9nZ2xlQXBwZWFyYW5jZTtcblxuICAvKiogYG5hbWVgIGF0dHJpYnV0ZSBmb3IgdGhlIHVuZGVybHlpbmcgYGlucHV0YCBlbGVtZW50LiAqL1xuICBASW5wdXQoKVxuICBnZXQgbmFtZSgpOiBzdHJpbmcgeyByZXR1cm4gdGhpcy5fbmFtZTsgfVxuICBzZXQgbmFtZSh2YWx1ZTogc3RyaW5nKSB7XG4gICAgdGhpcy5fbmFtZSA9IHZhbHVlO1xuXG4gICAgaWYgKHRoaXMuX2J1dHRvblRvZ2dsZXMpIHtcbiAgICAgIHRoaXMuX2J1dHRvblRvZ2dsZXMuZm9yRWFjaCh0b2dnbGUgPT4ge1xuICAgICAgICB0b2dnbGUubmFtZSA9IHRoaXMuX25hbWU7XG4gICAgICAgIHRvZ2dsZS5fbWFya0ZvckNoZWNrKCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cbiAgcHJpdmF0ZSBfbmFtZSA9IGBtYXQtYnV0dG9uLXRvZ2dsZS1ncm91cC0ke3VuaXF1ZUlkQ291bnRlcisrfWA7XG5cbiAgLyoqIFdoZXRoZXIgdGhlIHRvZ2dsZSBncm91cCBpcyB2ZXJ0aWNhbC4gKi9cbiAgQElucHV0KClcbiAgZ2V0IHZlcnRpY2FsKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5fdmVydGljYWw7IH1cbiAgc2V0IHZlcnRpY2FsKHZhbHVlOiBib29sZWFuKSB7XG4gICAgdGhpcy5fdmVydGljYWwgPSBjb2VyY2VCb29sZWFuUHJvcGVydHkodmFsdWUpO1xuICB9XG5cbiAgLyoqIFZhbHVlIG9mIHRoZSB0b2dnbGUgZ3JvdXAuICovXG4gIEBJbnB1dCgpXG4gIGdldCB2YWx1ZSgpOiBhbnkge1xuICAgIGNvbnN0IHNlbGVjdGVkID0gdGhpcy5fc2VsZWN0aW9uTW9kZWwgPyB0aGlzLl9zZWxlY3Rpb25Nb2RlbC5zZWxlY3RlZCA6IFtdO1xuXG4gICAgaWYgKHRoaXMubXVsdGlwbGUpIHtcbiAgICAgIHJldHVybiBzZWxlY3RlZC5tYXAodG9nZ2xlID0+IHRvZ2dsZS52YWx1ZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHNlbGVjdGVkWzBdID8gc2VsZWN0ZWRbMF0udmFsdWUgOiB1bmRlZmluZWQ7XG4gIH1cbiAgc2V0IHZhbHVlKG5ld1ZhbHVlOiBhbnkpIHtcbiAgICB0aGlzLl9zZXRTZWxlY3Rpb25CeVZhbHVlKG5ld1ZhbHVlKTtcbiAgICB0aGlzLnZhbHVlQ2hhbmdlLmVtaXQodGhpcy52YWx1ZSk7XG4gIH1cblxuICAvKipcbiAgICogRXZlbnQgdGhhdCBlbWl0cyB3aGVuZXZlciB0aGUgdmFsdWUgb2YgdGhlIGdyb3VwIGNoYW5nZXMuXG4gICAqIFVzZWQgdG8gZmFjaWxpdGF0ZSB0d28td2F5IGRhdGEgYmluZGluZy5cbiAgICogQGRvY3MtcHJpdmF0ZVxuICAgKi9cbiAgQE91dHB1dCgpIHJlYWRvbmx5IHZhbHVlQ2hhbmdlID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG5cbiAgLyoqIFNlbGVjdGVkIGJ1dHRvbiB0b2dnbGVzIGluIHRoZSBncm91cC4gKi9cbiAgZ2V0IHNlbGVjdGVkKCk6IE1hdEJ1dHRvblRvZ2dsZSB8IE1hdEJ1dHRvblRvZ2dsZVtdIHtcbiAgICBjb25zdCBzZWxlY3RlZCA9IHRoaXMuX3NlbGVjdGlvbk1vZGVsID8gdGhpcy5fc2VsZWN0aW9uTW9kZWwuc2VsZWN0ZWQgOiBbXTtcbiAgICByZXR1cm4gdGhpcy5tdWx0aXBsZSA/IHNlbGVjdGVkIDogKHNlbGVjdGVkWzBdIHx8IG51bGwpO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgbXVsdGlwbGUgYnV0dG9uIHRvZ2dsZXMgY2FuIGJlIHNlbGVjdGVkLiAqL1xuICBASW5wdXQoKVxuICBnZXQgbXVsdGlwbGUoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLl9tdWx0aXBsZTsgfVxuICBzZXQgbXVsdGlwbGUodmFsdWU6IGJvb2xlYW4pIHtcbiAgICB0aGlzLl9tdWx0aXBsZSA9IGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eSh2YWx1ZSk7XG4gIH1cblxuICAvKiogV2hldGhlciBtdWx0aXBsZSBidXR0b24gdG9nZ2xlIGdyb3VwIGlzIGRpc2FibGVkLiAqL1xuICBASW5wdXQoKVxuICBnZXQgZGlzYWJsZWQoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLl9kaXNhYmxlZDsgfVxuICBzZXQgZGlzYWJsZWQodmFsdWU6IGJvb2xlYW4pIHtcbiAgICB0aGlzLl9kaXNhYmxlZCA9IGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eSh2YWx1ZSk7XG5cbiAgICBpZiAodGhpcy5fYnV0dG9uVG9nZ2xlcykge1xuICAgICAgdGhpcy5fYnV0dG9uVG9nZ2xlcy5mb3JFYWNoKHRvZ2dsZSA9PiB0b2dnbGUuX21hcmtGb3JDaGVjaygpKTtcbiAgICB9XG4gIH1cblxuICAvKiogRXZlbnQgZW1pdHRlZCB3aGVuIHRoZSBncm91cCdzIHZhbHVlIGNoYW5nZXMuICovXG4gIEBPdXRwdXQoKSByZWFkb25seSBjaGFuZ2U6IEV2ZW50RW1pdHRlcjxNYXRCdXR0b25Ub2dnbGVDaGFuZ2U+ID1cbiAgICAgIG5ldyBFdmVudEVtaXR0ZXI8TWF0QnV0dG9uVG9nZ2xlQ2hhbmdlPigpO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgX2NoYW5nZURldGVjdG9yOiBDaGFuZ2VEZXRlY3RvclJlZixcbiAgICBAT3B0aW9uYWwoKSBASW5qZWN0KE1BVF9CVVRUT05fVE9HR0xFX0RFRkFVTFRfT1BUSU9OUylcbiAgICAgICAgZGVmYXVsdE9wdGlvbnM/OiBNYXRCdXR0b25Ub2dnbGVEZWZhdWx0T3B0aW9ucykge1xuXG4gICAgICB0aGlzLmFwcGVhcmFuY2UgPVxuICAgICAgICAgIGRlZmF1bHRPcHRpb25zICYmIGRlZmF1bHRPcHRpb25zLmFwcGVhcmFuY2UgPyBkZWZhdWx0T3B0aW9ucy5hcHBlYXJhbmNlIDogJ3N0YW5kYXJkJztcbiAgICB9XG5cbiAgbmdPbkluaXQoKSB7XG4gICAgdGhpcy5fc2VsZWN0aW9uTW9kZWwgPSBuZXcgU2VsZWN0aW9uTW9kZWw8TWF0QnV0dG9uVG9nZ2xlPih0aGlzLm11bHRpcGxlLCB1bmRlZmluZWQsIGZhbHNlKTtcbiAgfVxuXG4gIG5nQWZ0ZXJDb250ZW50SW5pdCgpIHtcbiAgICB0aGlzLl9zZWxlY3Rpb25Nb2RlbC5zZWxlY3QoLi4udGhpcy5fYnV0dG9uVG9nZ2xlcy5maWx0ZXIodG9nZ2xlID0+IHRvZ2dsZS5jaGVja2VkKSk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgbW9kZWwgdmFsdWUuIEltcGxlbWVudGVkIGFzIHBhcnQgb2YgQ29udHJvbFZhbHVlQWNjZXNzb3IuXG4gICAqIEBwYXJhbSB2YWx1ZSBWYWx1ZSB0byBiZSBzZXQgdG8gdGhlIG1vZGVsLlxuICAgKi9cbiAgd3JpdGVWYWx1ZSh2YWx1ZTogYW55KSB7XG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgIHRoaXMuX2NoYW5nZURldGVjdG9yLm1hcmtGb3JDaGVjaygpO1xuICB9XG5cbiAgLy8gSW1wbGVtZW50ZWQgYXMgcGFydCBvZiBDb250cm9sVmFsdWVBY2Nlc3Nvci5cbiAgcmVnaXN0ZXJPbkNoYW5nZShmbjogKHZhbHVlOiBhbnkpID0+IHZvaWQpIHtcbiAgICB0aGlzLl9jb250cm9sVmFsdWVBY2Nlc3NvckNoYW5nZUZuID0gZm47XG4gIH1cblxuICAvLyBJbXBsZW1lbnRlZCBhcyBwYXJ0IG9mIENvbnRyb2xWYWx1ZUFjY2Vzc29yLlxuICByZWdpc3Rlck9uVG91Y2hlZChmbjogYW55KSB7XG4gICAgdGhpcy5fb25Ub3VjaGVkID0gZm47XG4gIH1cblxuICAvLyBJbXBsZW1lbnRlZCBhcyBwYXJ0IG9mIENvbnRyb2xWYWx1ZUFjY2Vzc29yLlxuICBzZXREaXNhYmxlZFN0YXRlKGlzRGlzYWJsZWQ6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLmRpc2FibGVkID0gaXNEaXNhYmxlZDtcbiAgfVxuXG4gIC8qKiBEaXNwYXRjaCBjaGFuZ2UgZXZlbnQgd2l0aCBjdXJyZW50IHNlbGVjdGlvbiBhbmQgZ3JvdXAgdmFsdWUuICovXG4gIF9lbWl0Q2hhbmdlRXZlbnQoKTogdm9pZCB7XG4gICAgY29uc3Qgc2VsZWN0ZWQgPSB0aGlzLnNlbGVjdGVkO1xuICAgIGNvbnN0IHNvdXJjZSA9IEFycmF5LmlzQXJyYXkoc2VsZWN0ZWQpID8gc2VsZWN0ZWRbc2VsZWN0ZWQubGVuZ3RoIC0gMV0gOiBzZWxlY3RlZDtcbiAgICBjb25zdCBldmVudCA9IG5ldyBNYXRCdXR0b25Ub2dnbGVDaGFuZ2Uoc291cmNlISwgdGhpcy52YWx1ZSk7XG4gICAgdGhpcy5fY29udHJvbFZhbHVlQWNjZXNzb3JDaGFuZ2VGbihldmVudC52YWx1ZSk7XG4gICAgdGhpcy5jaGFuZ2UuZW1pdChldmVudCk7XG4gIH1cblxuICAvKipcbiAgICogU3luY3MgYSBidXR0b24gdG9nZ2xlJ3Mgc2VsZWN0ZWQgc3RhdGUgd2l0aCB0aGUgbW9kZWwgdmFsdWUuXG4gICAqIEBwYXJhbSB0b2dnbGUgVG9nZ2xlIHRvIGJlIHN5bmNlZC5cbiAgICogQHBhcmFtIHNlbGVjdCBXaGV0aGVyIHRoZSB0b2dnbGUgc2hvdWxkIGJlIHNlbGVjdGVkLlxuICAgKiBAcGFyYW0gaXNVc2VySW5wdXQgV2hldGhlciB0aGUgY2hhbmdlIHdhcyBhIHJlc3VsdCBvZiBhIHVzZXIgaW50ZXJhY3Rpb24uXG4gICAqIEBwYXJhbSBkZWZlckV2ZW50cyBXaGV0aGVyIHRvIGRlZmVyIGVtaXR0aW5nIHRoZSBjaGFuZ2UgZXZlbnRzLlxuICAgKi9cbiAgX3N5bmNCdXR0b25Ub2dnbGUodG9nZ2xlOiBNYXRCdXR0b25Ub2dnbGUsXG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdDogYm9vbGVhbixcbiAgICAgICAgICAgICAgICAgICAgaXNVc2VySW5wdXQgPSBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJFdmVudHMgPSBmYWxzZSkge1xuICAgIC8vIERlc2VsZWN0IHRoZSBjdXJyZW50bHktc2VsZWN0ZWQgdG9nZ2xlLCBpZiB3ZSdyZSBpbiBzaW5nbGUtc2VsZWN0aW9uXG4gICAgLy8gbW9kZSBhbmQgdGhlIGJ1dHRvbiBiZWluZyB0b2dnbGVkIGlzbid0IHNlbGVjdGVkIGF0IHRoZSBtb21lbnQuXG4gICAgaWYgKCF0aGlzLm11bHRpcGxlICYmIHRoaXMuc2VsZWN0ZWQgJiYgIXRvZ2dsZS5jaGVja2VkKSB7XG4gICAgICAodGhpcy5zZWxlY3RlZCBhcyBNYXRCdXR0b25Ub2dnbGUpLmNoZWNrZWQgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fc2VsZWN0aW9uTW9kZWwpIHtcbiAgICAgIGlmIChzZWxlY3QpIHtcbiAgICAgICAgdGhpcy5fc2VsZWN0aW9uTW9kZWwuc2VsZWN0KHRvZ2dsZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9zZWxlY3Rpb25Nb2RlbC5kZXNlbGVjdCh0b2dnbGUpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBkZWZlckV2ZW50cyA9IHRydWU7XG4gICAgfVxuXG4gICAgLy8gV2UgbmVlZCB0byBkZWZlciBpbiBzb21lIGNhc2VzIGluIG9yZGVyIHRvIGF2b2lkIFwiY2hhbmdlZCBhZnRlciBjaGVja2VkIGVycm9yc1wiLCBob3dldmVyXG4gICAgLy8gdGhlIHNpZGUtZWZmZWN0IGlzIHRoYXQgd2UgbWF5IGVuZCB1cCB1cGRhdGluZyB0aGUgbW9kZWwgdmFsdWUgb3V0IG9mIHNlcXVlbmNlIGluIG90aGVyc1xuICAgIC8vIFRoZSBgZGVmZXJFdmVudHNgIGZsYWcgYWxsb3dzIHVzIHRvIGRlY2lkZSB3aGV0aGVyIHRvIGRvIGl0IG9uIGEgY2FzZS1ieS1jYXNlIGJhc2lzLlxuICAgIGlmIChkZWZlckV2ZW50cykge1xuICAgICAgUHJvbWlzZS5yZXNvbHZlKCkudGhlbigoKSA9PiB0aGlzLl91cGRhdGVNb2RlbFZhbHVlKGlzVXNlcklucHV0KSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3VwZGF0ZU1vZGVsVmFsdWUoaXNVc2VySW5wdXQpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBDaGVja3Mgd2hldGhlciBhIGJ1dHRvbiB0b2dnbGUgaXMgc2VsZWN0ZWQuICovXG4gIF9pc1NlbGVjdGVkKHRvZ2dsZTogTWF0QnV0dG9uVG9nZ2xlKSB7XG4gICAgcmV0dXJuIHRoaXMuX3NlbGVjdGlvbk1vZGVsICYmIHRoaXMuX3NlbGVjdGlvbk1vZGVsLmlzU2VsZWN0ZWQodG9nZ2xlKTtcbiAgfVxuXG4gIC8qKiBEZXRlcm1pbmVzIHdoZXRoZXIgYSBidXR0b24gdG9nZ2xlIHNob3VsZCBiZSBjaGVja2VkIG9uIGluaXQuICovXG4gIF9pc1ByZWNoZWNrZWQodG9nZ2xlOiBNYXRCdXR0b25Ub2dnbGUpIHtcbiAgICBpZiAodHlwZW9mIHRoaXMuX3Jhd1ZhbHVlID09PSAndW5kZWZpbmVkJykge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmICh0aGlzLm11bHRpcGxlICYmIEFycmF5LmlzQXJyYXkodGhpcy5fcmF3VmFsdWUpKSB7XG4gICAgICByZXR1cm4gdGhpcy5fcmF3VmFsdWUuc29tZSh2YWx1ZSA9PiB0b2dnbGUudmFsdWUgIT0gbnVsbCAmJiB2YWx1ZSA9PT0gdG9nZ2xlLnZhbHVlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdG9nZ2xlLnZhbHVlID09PSB0aGlzLl9yYXdWYWx1ZTtcbiAgfVxuXG4gIC8qKiBVcGRhdGVzIHRoZSBzZWxlY3Rpb24gc3RhdGUgb2YgdGhlIHRvZ2dsZXMgaW4gdGhlIGdyb3VwIGJhc2VkIG9uIGEgdmFsdWUuICovXG4gIHByaXZhdGUgX3NldFNlbGVjdGlvbkJ5VmFsdWUodmFsdWU6IGFueXxhbnlbXSkge1xuICAgIHRoaXMuX3Jhd1ZhbHVlID0gdmFsdWU7XG5cbiAgICBpZiAoIXRoaXMuX2J1dHRvblRvZ2dsZXMpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5tdWx0aXBsZSAmJiB2YWx1ZSkge1xuICAgICAgaWYgKCFBcnJheS5pc0FycmF5KHZhbHVlKSAmJiAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSkge1xuICAgICAgICB0aHJvdyBFcnJvcignVmFsdWUgbXVzdCBiZSBhbiBhcnJheSBpbiBtdWx0aXBsZS1zZWxlY3Rpb24gbW9kZS4nKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fY2xlYXJTZWxlY3Rpb24oKTtcbiAgICAgIHZhbHVlLmZvckVhY2goKGN1cnJlbnRWYWx1ZTogYW55KSA9PiB0aGlzLl9zZWxlY3RWYWx1ZShjdXJyZW50VmFsdWUpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fY2xlYXJTZWxlY3Rpb24oKTtcbiAgICAgIHRoaXMuX3NlbGVjdFZhbHVlKHZhbHVlKTtcbiAgICB9XG4gIH1cblxuICAvKiogQ2xlYXJzIHRoZSBzZWxlY3RlZCB0b2dnbGVzLiAqL1xuICBwcml2YXRlIF9jbGVhclNlbGVjdGlvbigpIHtcbiAgICB0aGlzLl9zZWxlY3Rpb25Nb2RlbC5jbGVhcigpO1xuICAgIHRoaXMuX2J1dHRvblRvZ2dsZXMuZm9yRWFjaCh0b2dnbGUgPT4gdG9nZ2xlLmNoZWNrZWQgPSBmYWxzZSk7XG4gIH1cblxuICAvKiogU2VsZWN0cyBhIHZhbHVlIGlmIHRoZXJlJ3MgYSB0b2dnbGUgdGhhdCBjb3JyZXNwb25kcyB0byBpdC4gKi9cbiAgcHJpdmF0ZSBfc2VsZWN0VmFsdWUodmFsdWU6IGFueSkge1xuICAgIGNvbnN0IGNvcnJlc3BvbmRpbmdPcHRpb24gPSB0aGlzLl9idXR0b25Ub2dnbGVzLmZpbmQodG9nZ2xlID0+IHtcbiAgICAgIHJldHVybiB0b2dnbGUudmFsdWUgIT0gbnVsbCAmJiB0b2dnbGUudmFsdWUgPT09IHZhbHVlO1xuICAgIH0pO1xuXG4gICAgaWYgKGNvcnJlc3BvbmRpbmdPcHRpb24pIHtcbiAgICAgIGNvcnJlc3BvbmRpbmdPcHRpb24uY2hlY2tlZCA9IHRydWU7XG4gICAgICB0aGlzLl9zZWxlY3Rpb25Nb2RlbC5zZWxlY3QoY29ycmVzcG9uZGluZ09wdGlvbik7XG4gICAgfVxuICB9XG5cbiAgLyoqIFN5bmNzIHVwIHRoZSBncm91cCdzIHZhbHVlIHdpdGggdGhlIG1vZGVsIGFuZCBlbWl0cyB0aGUgY2hhbmdlIGV2ZW50LiAqL1xuICBwcml2YXRlIF91cGRhdGVNb2RlbFZhbHVlKGlzVXNlcklucHV0OiBib29sZWFuKSB7XG4gICAgLy8gT25seSBlbWl0IHRoZSBjaGFuZ2UgZXZlbnQgZm9yIHVzZXIgaW5wdXQuXG4gICAgaWYgKGlzVXNlcklucHV0KSB7XG4gICAgICB0aGlzLl9lbWl0Q2hhbmdlRXZlbnQoKTtcbiAgICB9XG5cbiAgICAvLyBOb3RlOiB3ZSBlbWl0IHRoaXMgb25lIG5vIG1hdHRlciB3aGV0aGVyIGl0IHdhcyBhIHVzZXIgaW50ZXJhY3Rpb24sIGJlY2F1c2VcbiAgICAvLyBpdCBpcyB1c2VkIGJ5IEFuZ3VsYXIgdG8gc3luYyB1cCB0aGUgdHdvLXdheSBkYXRhIGJpbmRpbmcuXG4gICAgdGhpcy52YWx1ZUNoYW5nZS5lbWl0KHRoaXMudmFsdWUpO1xuICB9XG5cbiAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2Rpc2FibGVkOiBCb29sZWFuSW5wdXQ7XG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9tdWx0aXBsZTogQm9vbGVhbklucHV0O1xuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfdmVydGljYWw6IEJvb2xlYW5JbnB1dDtcbn1cblxuLy8gQm9pbGVycGxhdGUgZm9yIGFwcGx5aW5nIG1peGlucyB0byB0aGUgTWF0QnV0dG9uVG9nZ2xlIGNsYXNzLlxuLyoqIEBkb2NzLXByaXZhdGUgKi9cbmNsYXNzIE1hdEJ1dHRvblRvZ2dsZUJhc2Uge31cbmNvbnN0IF9NYXRCdXR0b25Ub2dnbGVNaXhpbkJhc2U6IENhbkRpc2FibGVSaXBwbGVDdG9yICYgdHlwZW9mIE1hdEJ1dHRvblRvZ2dsZUJhc2UgPVxuICAgIG1peGluRGlzYWJsZVJpcHBsZShNYXRCdXR0b25Ub2dnbGVCYXNlKTtcblxuLyoqIFNpbmdsZSBidXR0b24gaW5zaWRlIG9mIGEgdG9nZ2xlIGdyb3VwLiAqL1xuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnbWF0LWJ1dHRvbi10b2dnbGUnLFxuICB0ZW1wbGF0ZVVybDogJ2J1dHRvbi10b2dnbGUuaHRtbCcsXG4gIHN0eWxlVXJsczogWydidXR0b24tdG9nZ2xlLmNzcyddLFxuICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lLFxuICBleHBvcnRBczogJ21hdEJ1dHRvblRvZ2dsZScsXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoLFxuICBpbnB1dHM6IFsnZGlzYWJsZVJpcHBsZSddLFxuICBob3N0OiB7XG4gICAgJ1tjbGFzcy5tYXQtYnV0dG9uLXRvZ2dsZS1zdGFuZGFsb25lXSc6ICchYnV0dG9uVG9nZ2xlR3JvdXAnLFxuICAgICdbY2xhc3MubWF0LWJ1dHRvbi10b2dnbGUtY2hlY2tlZF0nOiAnY2hlY2tlZCcsXG4gICAgJ1tjbGFzcy5tYXQtYnV0dG9uLXRvZ2dsZS1kaXNhYmxlZF0nOiAnZGlzYWJsZWQnLFxuICAgICdbY2xhc3MubWF0LWJ1dHRvbi10b2dnbGUtYXBwZWFyYW5jZS1zdGFuZGFyZF0nOiAnYXBwZWFyYW5jZSA9PT0gXCJzdGFuZGFyZFwiJyxcbiAgICAnY2xhc3MnOiAnbWF0LWJ1dHRvbi10b2dnbGUnLFxuICAgICdbYXR0ci5hcmlhLWxhYmVsXSc6ICdudWxsJyxcbiAgICAnW2F0dHIuYXJpYS1sYWJlbGxlZGJ5XSc6ICdudWxsJyxcbiAgICAnW2F0dHIuaWRdJzogJ2lkJyxcbiAgICAnW2F0dHIubmFtZV0nOiAnbnVsbCcsXG4gICAgJyhmb2N1cyknOiAnZm9jdXMoKScsXG4gICAgJ3JvbGUnOiAncHJlc2VudGF0aW9uJyxcbiAgfVxufSlcbmV4cG9ydCBjbGFzcyBNYXRCdXR0b25Ub2dnbGUgZXh0ZW5kcyBfTWF0QnV0dG9uVG9nZ2xlTWl4aW5CYXNlIGltcGxlbWVudHMgT25Jbml0LCBBZnRlclZpZXdJbml0LFxuICBDYW5EaXNhYmxlUmlwcGxlLCBPbkRlc3Ryb3kge1xuXG4gIHByaXZhdGUgX2lzU2luZ2xlU2VsZWN0b3IgPSBmYWxzZTtcbiAgcHJpdmF0ZSBfY2hlY2tlZCA9IGZhbHNlO1xuXG4gIC8qKlxuICAgKiBBdHRhY2hlZCB0byB0aGUgYXJpYS1sYWJlbCBhdHRyaWJ1dGUgb2YgdGhlIGhvc3QgZWxlbWVudC4gSW4gbW9zdCBjYXNlcywgYXJpYS1sYWJlbGxlZGJ5IHdpbGxcbiAgICogdGFrZSBwcmVjZWRlbmNlIHNvIHRoaXMgbWF5IGJlIG9taXR0ZWQuXG4gICAqL1xuICBASW5wdXQoJ2FyaWEtbGFiZWwnKSBhcmlhTGFiZWw6IHN0cmluZztcblxuICAvKipcbiAgICogVXNlcnMgY2FuIHNwZWNpZnkgdGhlIGBhcmlhLWxhYmVsbGVkYnlgIGF0dHJpYnV0ZSB3aGljaCB3aWxsIGJlIGZvcndhcmRlZCB0byB0aGUgaW5wdXQgZWxlbWVudFxuICAgKi9cbiAgQElucHV0KCdhcmlhLWxhYmVsbGVkYnknKSBhcmlhTGFiZWxsZWRieTogc3RyaW5nIHwgbnVsbCA9IG51bGw7XG5cbiAgLyoqIFVuZGVybHlpbmcgbmF0aXZlIGBidXR0b25gIGVsZW1lbnQuICovXG4gIEBWaWV3Q2hpbGQoJ2J1dHRvbicpIF9idXR0b25FbGVtZW50OiBFbGVtZW50UmVmPEhUTUxCdXR0b25FbGVtZW50PjtcblxuICAvKiogVGhlIHBhcmVudCBidXR0b24gdG9nZ2xlIGdyb3VwIChleGNsdXNpdmUgc2VsZWN0aW9uKS4gT3B0aW9uYWwuICovXG4gIGJ1dHRvblRvZ2dsZUdyb3VwOiBNYXRCdXR0b25Ub2dnbGVHcm91cDtcblxuICAvKiogVW5pcXVlIElEIGZvciB0aGUgdW5kZXJseWluZyBgYnV0dG9uYCBlbGVtZW50LiAqL1xuICBnZXQgYnV0dG9uSWQoKTogc3RyaW5nIHsgcmV0dXJuIGAke3RoaXMuaWR9LWJ1dHRvbmA7IH1cblxuICAvKiogVGhlIHVuaXF1ZSBJRCBmb3IgdGhpcyBidXR0b24gdG9nZ2xlLiAqL1xuICBASW5wdXQoKSBpZDogc3RyaW5nO1xuXG4gIC8qKiBIVE1MJ3MgJ25hbWUnIGF0dHJpYnV0ZSB1c2VkIHRvIGdyb3VwIHJhZGlvcyBmb3IgdW5pcXVlIHNlbGVjdGlvbi4gKi9cbiAgQElucHV0KCkgbmFtZTogc3RyaW5nO1xuXG4gIC8qKiBNYXRCdXR0b25Ub2dnbGVHcm91cCByZWFkcyB0aGlzIHRvIGFzc2lnbiBpdHMgb3duIHZhbHVlLiAqL1xuICBASW5wdXQoKSB2YWx1ZTogYW55O1xuXG4gIC8qKiBUYWJpbmRleCBmb3IgdGhlIHRvZ2dsZS4gKi9cbiAgQElucHV0KCkgdGFiSW5kZXg6IG51bWJlciB8IG51bGw7XG5cbiAgLyoqIFRoZSBhcHBlYXJhbmNlIHN0eWxlIG9mIHRoZSBidXR0b24uICovXG4gIEBJbnB1dCgpXG4gIGdldCBhcHBlYXJhbmNlKCk6IE1hdEJ1dHRvblRvZ2dsZUFwcGVhcmFuY2Uge1xuICAgIHJldHVybiB0aGlzLmJ1dHRvblRvZ2dsZUdyb3VwID8gdGhpcy5idXR0b25Ub2dnbGVHcm91cC5hcHBlYXJhbmNlIDogdGhpcy5fYXBwZWFyYW5jZTtcbiAgfVxuICBzZXQgYXBwZWFyYW5jZSh2YWx1ZTogTWF0QnV0dG9uVG9nZ2xlQXBwZWFyYW5jZSkge1xuICAgIHRoaXMuX2FwcGVhcmFuY2UgPSB2YWx1ZTtcbiAgfVxuICBwcml2YXRlIF9hcHBlYXJhbmNlOiBNYXRCdXR0b25Ub2dnbGVBcHBlYXJhbmNlO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBidXR0b24gaXMgY2hlY2tlZC4gKi9cbiAgQElucHV0KClcbiAgZ2V0IGNoZWNrZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuYnV0dG9uVG9nZ2xlR3JvdXAgPyB0aGlzLmJ1dHRvblRvZ2dsZUdyb3VwLl9pc1NlbGVjdGVkKHRoaXMpIDogdGhpcy5fY2hlY2tlZDtcbiAgfVxuICBzZXQgY2hlY2tlZCh2YWx1ZTogYm9vbGVhbikge1xuICAgIGNvbnN0IG5ld1ZhbHVlID0gY29lcmNlQm9vbGVhblByb3BlcnR5KHZhbHVlKTtcblxuICAgIGlmIChuZXdWYWx1ZSAhPT0gdGhpcy5fY2hlY2tlZCkge1xuICAgICAgdGhpcy5fY2hlY2tlZCA9IG5ld1ZhbHVlO1xuXG4gICAgICBpZiAodGhpcy5idXR0b25Ub2dnbGVHcm91cCkge1xuICAgICAgICB0aGlzLmJ1dHRvblRvZ2dsZUdyb3VwLl9zeW5jQnV0dG9uVG9nZ2xlKHRoaXMsIHRoaXMuX2NoZWNrZWQpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZi5tYXJrRm9yQ2hlY2soKTtcbiAgICB9XG4gIH1cblxuICAvKiogV2hldGhlciB0aGUgYnV0dG9uIGlzIGRpc2FibGVkLiAqL1xuICBASW5wdXQoKVxuICBnZXQgZGlzYWJsZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2Rpc2FibGVkIHx8ICh0aGlzLmJ1dHRvblRvZ2dsZUdyb3VwICYmIHRoaXMuYnV0dG9uVG9nZ2xlR3JvdXAuZGlzYWJsZWQpO1xuICB9XG4gIHNldCBkaXNhYmxlZCh2YWx1ZTogYm9vbGVhbikgeyB0aGlzLl9kaXNhYmxlZCA9IGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eSh2YWx1ZSk7IH1cbiAgcHJpdmF0ZSBfZGlzYWJsZWQ6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAvKiogRXZlbnQgZW1pdHRlZCB3aGVuIHRoZSBncm91cCB2YWx1ZSBjaGFuZ2VzLiAqL1xuICBAT3V0cHV0KCkgcmVhZG9ubHkgY2hhbmdlOiBFdmVudEVtaXR0ZXI8TWF0QnV0dG9uVG9nZ2xlQ2hhbmdlPiA9XG4gICAgICBuZXcgRXZlbnRFbWl0dGVyPE1hdEJ1dHRvblRvZ2dsZUNoYW5nZT4oKTtcblxuICBjb25zdHJ1Y3RvcihAT3B0aW9uYWwoKSBASW5qZWN0KE1BVF9CVVRUT05fVE9HR0xFX0dST1VQKSB0b2dnbGVHcm91cDogTWF0QnV0dG9uVG9nZ2xlR3JvdXAsXG4gICAgICAgICAgICAgIHByaXZhdGUgX2NoYW5nZURldGVjdG9yUmVmOiBDaGFuZ2VEZXRlY3RvclJlZixcbiAgICAgICAgICAgICAgcHJpdmF0ZSBfZWxlbWVudFJlZjogRWxlbWVudFJlZjxIVE1MRWxlbWVudD4sXG4gICAgICAgICAgICAgIHByaXZhdGUgX2ZvY3VzTW9uaXRvcjogRm9jdXNNb25pdG9yLFxuICAgICAgICAgICAgICBAQXR0cmlidXRlKCd0YWJpbmRleCcpIGRlZmF1bHRUYWJJbmRleDogc3RyaW5nLFxuICAgICAgICAgICAgICBAT3B0aW9uYWwoKSBASW5qZWN0KE1BVF9CVVRUT05fVE9HR0xFX0RFRkFVTFRfT1BUSU9OUylcbiAgICAgICAgICAgICAgICAgIGRlZmF1bHRPcHRpb25zPzogTWF0QnV0dG9uVG9nZ2xlRGVmYXVsdE9wdGlvbnMpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgY29uc3QgcGFyc2VkVGFiSW5kZXggPSBOdW1iZXIoZGVmYXVsdFRhYkluZGV4KTtcbiAgICB0aGlzLnRhYkluZGV4ID0gKHBhcnNlZFRhYkluZGV4IHx8IHBhcnNlZFRhYkluZGV4ID09PSAwKSA/IHBhcnNlZFRhYkluZGV4IDogbnVsbDtcbiAgICB0aGlzLmJ1dHRvblRvZ2dsZUdyb3VwID0gdG9nZ2xlR3JvdXA7XG4gICAgdGhpcy5hcHBlYXJhbmNlID1cbiAgICAgICAgZGVmYXVsdE9wdGlvbnMgJiYgZGVmYXVsdE9wdGlvbnMuYXBwZWFyYW5jZSA/IGRlZmF1bHRPcHRpb25zLmFwcGVhcmFuY2UgOiAnc3RhbmRhcmQnO1xuICB9XG5cbiAgbmdPbkluaXQoKSB7XG4gICAgY29uc3QgZ3JvdXAgPSB0aGlzLmJ1dHRvblRvZ2dsZUdyb3VwO1xuICAgIHRoaXMuX2lzU2luZ2xlU2VsZWN0b3IgPSBncm91cCAmJiAhZ3JvdXAubXVsdGlwbGU7XG4gICAgdGhpcy5pZCA9IHRoaXMuaWQgfHwgYG1hdC1idXR0b24tdG9nZ2xlLSR7dW5pcXVlSWRDb3VudGVyKyt9YDtcblxuICAgIGlmICh0aGlzLl9pc1NpbmdsZVNlbGVjdG9yKSB7XG4gICAgICB0aGlzLm5hbWUgPSBncm91cC5uYW1lO1xuICAgIH1cblxuICAgIGlmIChncm91cCkge1xuICAgICAgaWYgKGdyb3VwLl9pc1ByZWNoZWNrZWQodGhpcykpIHtcbiAgICAgICAgdGhpcy5jaGVja2VkID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSBpZiAoZ3JvdXAuX2lzU2VsZWN0ZWQodGhpcykgIT09IHRoaXMuX2NoZWNrZWQpIHtcbiAgICAgICAgLy8gQXMgYXMgc2lkZSBlZmZlY3Qgb2YgdGhlIGNpcmN1bGFyIGRlcGVuZGVuY3kgYmV0d2VlbiB0aGUgdG9nZ2xlIGdyb3VwIGFuZCB0aGUgYnV0dG9uLFxuICAgICAgICAvLyB3ZSBtYXkgZW5kIHVwIGluIGEgc3RhdGUgd2hlcmUgdGhlIGJ1dHRvbiBpcyBzdXBwb3NlZCB0byBiZSBjaGVja2VkIG9uIGluaXQsIGJ1dCBpdFxuICAgICAgICAvLyBpc24ndCwgYmVjYXVzZSB0aGUgY2hlY2tlZCB2YWx1ZSB3YXMgYXNzaWduZWQgdG9vIGVhcmx5LiBUaGlzIGNhbiBoYXBwZW4gd2hlbiBJdnlcbiAgICAgICAgLy8gYXNzaWducyB0aGUgc3RhdGljIGlucHV0IHZhbHVlIGJlZm9yZSB0aGUgYG5nT25Jbml0YCBoYXMgcnVuLlxuICAgICAgICBncm91cC5fc3luY0J1dHRvblRvZ2dsZSh0aGlzLCB0aGlzLl9jaGVja2VkKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBuZ0FmdGVyVmlld0luaXQoKSB7XG4gICAgdGhpcy5fZm9jdXNNb25pdG9yLm1vbml0b3IodGhpcy5fZWxlbWVudFJlZiwgdHJ1ZSk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICBjb25zdCBncm91cCA9IHRoaXMuYnV0dG9uVG9nZ2xlR3JvdXA7XG5cbiAgICB0aGlzLl9mb2N1c01vbml0b3Iuc3RvcE1vbml0b3JpbmcodGhpcy5fZWxlbWVudFJlZik7XG5cbiAgICAvLyBSZW1vdmUgdGhlIHRvZ2dsZSBmcm9tIHRoZSBzZWxlY3Rpb24gb25jZSBpdCdzIGRlc3Ryb3llZC4gTmVlZHMgdG8gaGFwcGVuXG4gICAgLy8gb24gdGhlIG5leHQgdGljayBpbiBvcmRlciB0byBhdm9pZCBcImNoYW5nZWQgYWZ0ZXIgY2hlY2tlZFwiIGVycm9ycy5cbiAgICBpZiAoZ3JvdXAgJiYgZ3JvdXAuX2lzU2VsZWN0ZWQodGhpcykpIHtcbiAgICAgIGdyb3VwLl9zeW5jQnV0dG9uVG9nZ2xlKHRoaXMsIGZhbHNlLCBmYWxzZSwgdHJ1ZSk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEZvY3VzZXMgdGhlIGJ1dHRvbi4gKi9cbiAgZm9jdXMob3B0aW9ucz86IEZvY3VzT3B0aW9ucyk6IHZvaWQge1xuICAgIHRoaXMuX2J1dHRvbkVsZW1lbnQubmF0aXZlRWxlbWVudC5mb2N1cyhvcHRpb25zKTtcbiAgfVxuXG4gIC8qKiBDaGVja3MgdGhlIGJ1dHRvbiB0b2dnbGUgZHVlIHRvIGFuIGludGVyYWN0aW9uIHdpdGggdGhlIHVuZGVybHlpbmcgbmF0aXZlIGJ1dHRvbi4gKi9cbiAgX29uQnV0dG9uQ2xpY2soKSB7XG4gICAgY29uc3QgbmV3Q2hlY2tlZCA9IHRoaXMuX2lzU2luZ2xlU2VsZWN0b3IgPyB0cnVlIDogIXRoaXMuX2NoZWNrZWQ7XG5cbiAgICBpZiAobmV3Q2hlY2tlZCAhPT0gdGhpcy5fY2hlY2tlZCkge1xuICAgICAgdGhpcy5fY2hlY2tlZCA9IG5ld0NoZWNrZWQ7XG4gICAgICBpZiAodGhpcy5idXR0b25Ub2dnbGVHcm91cCkge1xuICAgICAgICB0aGlzLmJ1dHRvblRvZ2dsZUdyb3VwLl9zeW5jQnV0dG9uVG9nZ2xlKHRoaXMsIHRoaXMuX2NoZWNrZWQsIHRydWUpO1xuICAgICAgICB0aGlzLmJ1dHRvblRvZ2dsZUdyb3VwLl9vblRvdWNoZWQoKTtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gRW1pdCBhIGNoYW5nZSBldmVudCB3aGVuIGl0J3MgdGhlIHNpbmdsZSBzZWxlY3RvclxuICAgIHRoaXMuY2hhbmdlLmVtaXQobmV3IE1hdEJ1dHRvblRvZ2dsZUNoYW5nZSh0aGlzLCB0aGlzLnZhbHVlKSk7XG4gIH1cblxuICAvKipcbiAgICogTWFya3MgdGhlIGJ1dHRvbiB0b2dnbGUgYXMgbmVlZGluZyBjaGVja2luZyBmb3IgY2hhbmdlIGRldGVjdGlvbi5cbiAgICogVGhpcyBtZXRob2QgaXMgZXhwb3NlZCBiZWNhdXNlIHRoZSBwYXJlbnQgYnV0dG9uIHRvZ2dsZSBncm91cCB3aWxsIGRpcmVjdGx5XG4gICAqIHVwZGF0ZSBib3VuZCBwcm9wZXJ0aWVzIG9mIHRoZSByYWRpbyBidXR0b24uXG4gICAqL1xuICBfbWFya0ZvckNoZWNrKCkge1xuICAgIC8vIFdoZW4gdGhlIGdyb3VwIHZhbHVlIGNoYW5nZXMsIHRoZSBidXR0b24gd2lsbCBub3QgYmUgbm90aWZpZWQuXG4gICAgLy8gVXNlIGBtYXJrRm9yQ2hlY2tgIHRvIGV4cGxpY2l0IHVwZGF0ZSBidXR0b24gdG9nZ2xlJ3Mgc3RhdHVzLlxuICAgIHRoaXMuX2NoYW5nZURldGVjdG9yUmVmLm1hcmtGb3JDaGVjaygpO1xuICB9XG5cbiAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2NoZWNrZWQ6IEJvb2xlYW5JbnB1dDtcbiAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2Rpc2FibGVkOiBCb29sZWFuSW5wdXQ7XG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV92ZXJ0aWNhbDogQm9vbGVhbklucHV0O1xuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfbXVsdGlwbGU6IEJvb2xlYW5JbnB1dDtcbiAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2Rpc2FibGVSaXBwbGU6IEJvb2xlYW5JbnB1dDtcbn1cbiJdfQ==