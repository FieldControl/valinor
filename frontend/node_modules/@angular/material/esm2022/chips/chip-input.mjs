/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { BACKSPACE, hasModifierKey } from '@angular/cdk/keycodes';
import { Directive, ElementRef, EventEmitter, Inject, Input, Optional, Output, booleanAttribute, } from '@angular/core';
import { MatFormField, MAT_FORM_FIELD } from '@angular/material/form-field';
import { MAT_CHIPS_DEFAULT_OPTIONS } from './tokens';
import { MatChipGrid } from './chip-grid';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/form-field";
// Increasing integer for generating unique ids.
let nextUniqueId = 0;
/**
 * Directive that adds chip-specific behaviors to an input element inside `<mat-form-field>`.
 * May be placed inside or outside of a `<mat-chip-grid>`.
 */
export class MatChipInput {
    /** Register input for chip list */
    get chipGrid() {
        return this._chipGrid;
    }
    set chipGrid(value) {
        if (value) {
            this._chipGrid = value;
            this._chipGrid.registerInput(this);
        }
    }
    /** Whether the input is disabled. */
    get disabled() {
        return this._disabled || (this._chipGrid && this._chipGrid.disabled);
    }
    set disabled(value) {
        this._disabled = value;
    }
    /** Whether the input is empty. */
    get empty() {
        return !this.inputElement.value;
    }
    constructor(_elementRef, defaultOptions, formField) {
        this._elementRef = _elementRef;
        /** Whether the control is focused. */
        this.focused = false;
        /**
         * Whether or not the chipEnd event will be emitted when the input is blurred.
         */
        this.addOnBlur = false;
        /** Emitted when a chip is to be added. */
        this.chipEnd = new EventEmitter();
        /** The input's placeholder text. */
        this.placeholder = '';
        /** Unique id for the input. */
        this.id = `mat-mdc-chip-list-input-${nextUniqueId++}`;
        this._disabled = false;
        this.inputElement = this._elementRef.nativeElement;
        this.separatorKeyCodes = defaultOptions.separatorKeyCodes;
        if (formField) {
            this.inputElement.classList.add('mat-mdc-form-field-input-control');
        }
    }
    ngOnChanges() {
        this._chipGrid.stateChanges.next();
    }
    ngOnDestroy() {
        this.chipEnd.complete();
    }
    ngAfterContentInit() {
        this._focusLastChipOnBackspace = this.empty;
    }
    /** Utility method to make host definition/tests more clear. */
    _keydown(event) {
        if (event) {
            // To prevent the user from accidentally deleting chips when pressing BACKSPACE continuously,
            // We focus the last chip on backspace only after the user has released the backspace button,
            // And the input is empty (see behaviour in _keyup)
            if (event.keyCode === BACKSPACE && this._focusLastChipOnBackspace) {
                this._chipGrid._focusLastChip();
                event.preventDefault();
                return;
            }
            else {
                this._focusLastChipOnBackspace = false;
            }
        }
        this._emitChipEnd(event);
    }
    /**
     * Pass events to the keyboard manager. Available here for tests.
     */
    _keyup(event) {
        // Allow user to move focus to chips next time he presses backspace
        if (!this._focusLastChipOnBackspace && event.keyCode === BACKSPACE && this.empty) {
            this._focusLastChipOnBackspace = true;
            event.preventDefault();
        }
    }
    /** Checks to see if the blur should emit the (chipEnd) event. */
    _blur() {
        if (this.addOnBlur) {
            this._emitChipEnd();
        }
        this.focused = false;
        // Blur the chip list if it is not focused
        if (!this._chipGrid.focused) {
            this._chipGrid._blur();
        }
        this._chipGrid.stateChanges.next();
    }
    _focus() {
        this.focused = true;
        this._focusLastChipOnBackspace = this.empty;
        this._chipGrid.stateChanges.next();
    }
    /** Checks to see if the (chipEnd) event needs to be emitted. */
    _emitChipEnd(event) {
        if (!event || this._isSeparatorKey(event)) {
            this.chipEnd.emit({
                input: this.inputElement,
                value: this.inputElement.value,
                chipInput: this,
            });
            event?.preventDefault();
        }
    }
    _onInput() {
        // Let chip list know whenever the value changes.
        this._chipGrid.stateChanges.next();
    }
    /** Focuses the input. */
    focus() {
        this.inputElement.focus();
    }
    /** Clears the input */
    clear() {
        this.inputElement.value = '';
        this._focusLastChipOnBackspace = true;
    }
    setDescribedByIds(ids) {
        const element = this._elementRef.nativeElement;
        // Set the value directly in the DOM since this binding
        // is prone to "changed after checked" errors.
        if (ids.length) {
            element.setAttribute('aria-describedby', ids.join(' '));
        }
        else {
            element.removeAttribute('aria-describedby');
        }
    }
    /** Checks whether a keycode is one of the configured separators. */
    _isSeparatorKey(event) {
        return !hasModifierKey(event) && new Set(this.separatorKeyCodes).has(event.keyCode);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.2.0", ngImport: i0, type: MatChipInput, deps: [{ token: i0.ElementRef }, { token: MAT_CHIPS_DEFAULT_OPTIONS }, { token: MAT_FORM_FIELD, optional: true }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "16.1.0", version: "17.2.0", type: MatChipInput, isStandalone: true, selector: "input[matChipInputFor]", inputs: { chipGrid: ["matChipInputFor", "chipGrid"], addOnBlur: ["matChipInputAddOnBlur", "addOnBlur", booleanAttribute], separatorKeyCodes: ["matChipInputSeparatorKeyCodes", "separatorKeyCodes"], placeholder: "placeholder", id: "id", disabled: ["disabled", "disabled", booleanAttribute] }, outputs: { chipEnd: "matChipInputTokenEnd" }, host: { listeners: { "keydown": "_keydown($event)", "keyup": "_keyup($event)", "blur": "_blur()", "focus": "_focus()", "input": "_onInput()" }, properties: { "id": "id", "attr.disabled": "disabled || null", "attr.placeholder": "placeholder || null", "attr.aria-invalid": "_chipGrid && _chipGrid.ngControl ? _chipGrid.ngControl.invalid : null", "attr.aria-required": "_chipGrid && _chipGrid.required || null", "attr.required": "_chipGrid && _chipGrid.required || null" }, classAttribute: "mat-mdc-chip-input mat-mdc-input-element mdc-text-field__input mat-input-element" }, exportAs: ["matChipInput", "matChipInputFor"], usesOnChanges: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.2.0", ngImport: i0, type: MatChipInput, decorators: [{
            type: Directive,
            args: [{
                    selector: 'input[matChipInputFor]',
                    exportAs: 'matChipInput, matChipInputFor',
                    host: {
                        // TODO: eventually we should remove `mat-input-element` from here since it comes from the
                        // non-MDC version of the input. It's currently being kept for backwards compatibility, because
                        // the MDC chips were landed initially with it.
                        'class': 'mat-mdc-chip-input mat-mdc-input-element mdc-text-field__input mat-input-element',
                        '(keydown)': '_keydown($event)',
                        '(keyup)': '_keyup($event)',
                        '(blur)': '_blur()',
                        '(focus)': '_focus()',
                        '(input)': '_onInput()',
                        '[id]': 'id',
                        '[attr.disabled]': 'disabled || null',
                        '[attr.placeholder]': 'placeholder || null',
                        '[attr.aria-invalid]': '_chipGrid && _chipGrid.ngControl ? _chipGrid.ngControl.invalid : null',
                        '[attr.aria-required]': '_chipGrid && _chipGrid.required || null',
                        '[attr.required]': '_chipGrid && _chipGrid.required || null',
                    },
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [MAT_CHIPS_DEFAULT_OPTIONS]
                }] }, { type: i1.MatFormField, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [MAT_FORM_FIELD]
                }] }], propDecorators: { chipGrid: [{
                type: Input,
                args: ['matChipInputFor']
            }], addOnBlur: [{
                type: Input,
                args: [{ alias: 'matChipInputAddOnBlur', transform: booleanAttribute }]
            }], separatorKeyCodes: [{
                type: Input,
                args: ['matChipInputSeparatorKeyCodes']
            }], chipEnd: [{
                type: Output,
                args: ['matChipInputTokenEnd']
            }], placeholder: [{
                type: Input
            }], id: [{
                type: Input
            }], disabled: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hpcC1pbnB1dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9jaGlwcy9jaGlwLWlucHV0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxTQUFTLEVBQUUsY0FBYyxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDaEUsT0FBTyxFQUVMLFNBQVMsRUFDVCxVQUFVLEVBQ1YsWUFBWSxFQUNaLE1BQU0sRUFDTixLQUFLLEVBR0wsUUFBUSxFQUNSLE1BQU0sRUFDTixnQkFBZ0IsR0FDakIsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFDLFlBQVksRUFBRSxjQUFjLEVBQUMsTUFBTSw4QkFBOEIsQ0FBQztBQUMxRSxPQUFPLEVBQXlCLHlCQUF5QixFQUFDLE1BQU0sVUFBVSxDQUFDO0FBQzNFLE9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSxhQUFhLENBQUM7OztBQW1CeEMsZ0RBQWdEO0FBQ2hELElBQUksWUFBWSxHQUFHLENBQUMsQ0FBQztBQUVyQjs7O0dBR0c7QUF1QkgsTUFBTSxPQUFPLFlBQVk7SUFPdkIsbUNBQW1DO0lBQ25DLElBQ0ksUUFBUTtRQUNWLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztJQUN4QixDQUFDO0lBQ0QsSUFBSSxRQUFRLENBQUMsS0FBa0I7UUFDN0IsSUFBSSxLQUFLLEVBQUUsQ0FBQztZQUNWLElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3JDLENBQUM7SUFDSCxDQUFDO0lBMkJELHFDQUFxQztJQUNyQyxJQUNJLFFBQVE7UUFDVixPQUFPLElBQUksQ0FBQyxTQUFTLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDdkUsQ0FBQztJ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LGNBQWM7eUNBeERoQyxRQUFRO3NCQURYLEtBQUs7dUJBQUMsaUJBQWlCO2dCQWdCeEIsU0FBUztzQkFEUixLQUFLO3VCQUFDLEVBQUMsS0FBSyxFQUFFLHVCQUF1QixFQUFFLFNBQVMsRUFBRSxnQkFBZ0IsRUFBQztnQkFTcEUsaUJBQWlCO3NCQURoQixLQUFLO3VCQUFDLCtCQUErQjtnQkFLN0IsT0FBTztzQkFEZixNQUFNO3VCQUFDLHNCQUFzQjtnQkFJckIsV0FBVztzQkFBbkIsS0FBSztnQkFHRyxFQUFFO3NCQUFWLEtBQUs7Z0JBSUYsUUFBUTtzQkFEWCxLQUFLO3VCQUFDLEVBQUMsU0FBUyxFQUFFLGdCQUFnQixFQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7QkFDS1NQQUNFLCBoYXNNb2RpZmllcktleX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2tleWNvZGVzJztcbmltcG9ydCB7XG4gIEFmdGVyQ29udGVudEluaXQsXG4gIERpcmVjdGl2ZSxcbiAgRWxlbWVudFJlZixcbiAgRXZlbnRFbWl0dGVyLFxuICBJbmplY3QsXG4gIElucHV0LFxuICBPbkNoYW5nZXMsXG4gIE9uRGVzdHJveSxcbiAgT3B0aW9uYWwsXG4gIE91dHB1dCxcbiAgYm9vbGVhbkF0dHJpYnV0ZSxcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge01hdEZvcm1GaWVsZCwgTUFUX0ZPUk1fRklFTER9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL2Zvcm0tZmllbGQnO1xuaW1wb3J0IHtNYXRDaGlwc0RlZmF1bHRPcHRpb25zLCBNQVRfQ0hJUFNfREVGQVVMVF9PUFRJT05TfSBmcm9tICcuL3Rva2Vucyc7XG5pbXBvcnQge01hdENoaXBHcmlkfSBmcm9tICcuL2NoaXAtZ3JpZCc7XG5pbXBvcnQge01hdENoaXBUZXh0Q29udHJvbH0gZnJvbSAnLi9jaGlwLXRleHQtY29udHJvbCc7XG5cbi8qKiBSZXByZXNlbnRzIGFuIGlucHV0IGV2ZW50IG9uIGEgYG1hdENoaXBJbnB1dGAuICovXG5leHBvcnQgaW50ZXJmYWNlIE1hdENoaXBJbnB1dEV2ZW50IHtcbiAgLyoqXG4gICAqIFRoZSBuYXRpdmUgYDxpbnB1dD5gIGVsZW1lbnQgdGhhdCB0aGUgZXZlbnQgaXMgYmVpbmcgZmlyZWQgZm9yLlxuICAgKiBAZGVwcmVjYXRlZCBVc2UgYE1hdENoaXBJbnB1dEV2ZW50I2NoaXBJbnB1dC5pbnB1dEVsZW1lbnRgIGluc3RlYWQuXG4gICAqIEBicmVha2luZy1jaGFuZ2UgMTMuMC4wIFRoaXMgcHJvcGVydHkgd2lsbCBiZSByZW1vdmVkLlxuICAgKi9cbiAgaW5wdXQ6IEhUTUxJbnB1dEVsZW1lbnQ7XG5cbiAgLyoqIFRoZSB2YWx1ZSBvZiB0aGUgaW5wdXQuICovXG4gIHZhbHVlOiBzdHJpbmc7XG5cbiAgLyoqIFJlZmVyZW5jZSB0byB0aGUgY2hpcCBpbnB1dCB0aGF0IGVtaXR0ZWQgdGhlIGV2ZW50LiAqL1xuICBjaGlwSW5wdXQ6IE1hdENoaXBJbnB1dDtcbn1cblxuLy8gSW5jcmVhc2luZyBpbnRlZ2VyIGZvciBnZW5lcmF0aW5nIHVuaXF1ZSBpZHMuXG5sZXQgbmV4dFVuaXF1ZUlkID0gMDtcblxuLyoqXG4gKiBEaXJlY3RpdmUgdGhhdCBhZGRzIGNoaXAtc3BlY2lmaWMgYmVoYXZpb3JzIHRvIGFuIGlucHV0IGVsZW1lbnQgaW5zaWRlIGA8bWF0LWZvcm0tZmllbGQ+YC5cbiAqIE1heSBiZSBwbGFjZWQgaW5zaWRlIG9yIG91dHNpZGUgb2YgYSBgPG1hdC1jaGlwLWdyaWQ+YC5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnaW5wdXRbbWF0Q2hpcElucHV0Rm9yXScsXG4gIGV4cG9ydEFzOiAnbWF0Q2hpcElucHV0LCBtYXRDaGlwSW5wdXRGb3InLFxuICBob3N0OiB7XG4gICAgLy8gVE9ETzogZXZlbnR1YWxseSB3ZSBzaG91bGQgcmVtb3ZlIGBtYXQtaW5wdXQtZWxlbWVudGAgZnJvbSBoZXJlIHNpbmNlIGl0IGNvbWVzIGZyb20gdGhlXG4gICAgLy8gbm9uLU1EQyB2ZXJzaW9uIG9mIHRoZSBpbnB1dC4gSXQncyBjdXJyZW50bHkgYmVpbmcga2VwdCBmb3IgYmFja3dhcmRzIGNvbXBhdGliaWxpdHksIGJlY2F1c2VcbiAgICAvLyB0aGUgTURDIGNoaXBzIHdlcmUgbGFuZGVkIGluaXRpYWxseSB3aXRoIGl0LlxuICAgICdjbGFzcyc6ICdtYXQtbWRjLWNoaXAtaW5wdXQgbWF0LW1kYy1pbnB1dC1lbGVtZW50IG1kYy10ZXh0LWZpZWxkX19pbnB1dCBtYXQtaW5wdXQtZWxlbWVudCcsXG4gICAgJyhrZXlkb3duKSc6ICdfa2V5ZG93bigkZXZlbnQpJyxcbiAgICAnKGtleXVwKSc6ICdfa2V5dXAoJGV2ZW50KScsXG4gICAgJyhibHVyKSc6ICdfYmx1cigpJyxcbiAgICAnKGZvY3VzKSc6ICdfZm9jdXMoKScsXG4gICAgJyhpbnB1dCknOiAnX29uSW5wdXQoKScsXG4gICAgJ1tpZF0nOiAnaWQnLFxuICAgICdbYXR0ci5kaXNhYmxlZF0nOiAnZGlzYWJsZWQgfHwgbnVsbCcsXG4gICAgJ1thdHRyLnBsYWNlaG9sZGVyXSc6ICdwbGFjZWhvbGRlciB8fCBudWxsJyxcbiAgICAnW2F0dHIuYXJpYS1pbnZhbGlkXSc6ICdfY2hpcEdyaWQgJiYgX2NoaXBHcmlkLm5nQ29udHJvbCA/IF9jaGlwR3JpZC5uZ0NvbnRyb2wuaW52YWxpZCA6IG51bGwnLFxuICAgICdbYXR0ci5hcmlhLXJlcXVpcmVkXSc6ICdfY2hpcEdyaWQgJiYgX2NoaXBHcmlkLnJlcXVpcmVkIHx8IG51bGwnLFxuICAgICdbYXR0ci5yZXF1aXJlZF0nOiAnX2NoaXBHcmlkICYmIF9jaGlwR3JpZC5yZXF1aXJlZCB8fCBudWxsJyxcbiAgfSxcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbn0pXG5leHBvcnQgY2xhc3MgTWF0Q2hpcElucHV0IGltcGxlbWVudHMgTWF0Q2hpcFRleHRDb250cm9sLCBBZnRlckNvbnRlbnRJbml0LCBPbkNoYW5nZXMsIE9uRGVzdHJveSB7XG4gIC8qKiBVc2VkIHRvIHByZXZlbnQgZm9jdXMgbW92aW5nIHRvIGNoaXBzIHdoaWxlIHVzZXIgaXMgaG9sZGluZyBiYWNrc3BhY2UgKi9cbiAgcHJpdmF0ZSBfZm9jdXNMYXN0Q2hpcE9uQmFja3NwYWNlOiBib29sZWFuO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBjb250cm9sIGlzIGZvY3VzZWQuICovXG4gIGZvY3VzZWQ6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAvKiogUmVnaXN0ZXIgaW5wdXQgZm9yIGNoaXAgbGlzdCAqL1xuICBASW5wdXQoJ21hdENoaXBJbnB1dEZvcicpXG4gIGdldCBjaGlwR3JpZCgpOiBNYXRDaGlwR3JpZCB7XG4gICAgcmV0dXJuIHRoaXMuX2NoaXBHcmlkO1xuICB9XG4gIHNldCBjaGlwR3JpZCh2YWx1ZTogTWF0Q2hpcEdyaWQpIHtcbiAgICBpZiAodmFsdWUpIHtcbiAgICAgIHRoaXMuX2NoaXBHcmlkID0gdmFsdWU7XG4gICAgICB0aGlzLl9jaGlwR3JpZC5yZWdpc3RlcklucHV0KHRoaXMpO1xuICAgIH1cbiAgfVxuICBwcml2YXRlIF9jaGlwR3JpZDogTWF0Q2hpcEdyaWQ7XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgb3Igbm90IHRoZSBjaGlwRW5kIGV2ZW50IHdpbGwgYmUgZW1pdHRlZCB3aGVuIHRoZSBpbnB1dCBpcyBibHVycmVkLlxuICAgKi9cbiAgQElucHV0KHthbGlhczogJ21hdENoaXBJbnB1dEFkZE9uQmx1cicsIHRyYW5zZm9ybTogYm9vbGVhbkF0dHJpYnV0ZX0pXG4gIGFkZE9uQmx1cjogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIC8qKlxuICAgKiBUaGUgbGlzdCBvZiBrZXkgY29kZXMgdGhhdCB3aWxsIHRyaWdnZXIgYSBjaGlwRW5kIGV2ZW50LlxuICAgKlxuICAgKiBEZWZhdWx0cyB0byBgW0VOVEVSXWAuXG4gICAqL1xuICBASW5wdXQoJ21hdENoaXBJbnB1dFNlcGFyYXRvcktleUNvZGVzJylcbiAgc2VwYXJhdG9yS2V5Q29kZXM6IHJlYWRvbmx5IG51bWJlcltdIHwgUmVhZG9ubHlTZXQ8bnVtYmVyPjtcblxuICAvKiogRW1pdHRlZCB3aGVuIGEgY2hpcCBpcyB0byBiZSBhZGRlZC4gKi9cbiAgQE91dHB1dCgnbWF0Q2hpcElucHV0VG9rZW5FbmQnKVxuICByZWFkb25seSBjaGlwRW5kOiBFdmVudEVtaXR0ZXI8TWF0Q2hpcElucHV0RXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxNYXRDaGlwSW5wdXRFdmVudD4oKTtcblxuICAvKiogVGhlIGlucHV0J3MgcGxhY2Vob2xkZXIgdGV4dC4gKi9cbiAgQElucHV0KCkgcGxhY2Vob2xkZXI6IHN0cmluZyA9ICcnO1xuXG4gIC8qKiBVbmlxdWUgaWQgZm9yIHRoZSBpbnB1dC4gKi9cbiAgQElucHV0KCkgaWQ6IHN0cmluZyA9IGBtYXQtbWRjLWNoaXAtbGlzdC1pbnB1dC0ke25leHRVbmlxdWVJZCsrfWA7XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGlucHV0IGlzIGRpc2FibGVkLiAqL1xuICBASW5wdXQoe3RyYW5zZm9ybTogYm9vbGVhbkF0dHJpYnV0ZX0pXG4gIGdldCBkaXNhYmxlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fZGlzYWJsZWQgfHwgKHRoaXMuX2NoaXBHcmlkICYmIHRoaXMuX2NoaXBHcmlkLmRpc2FibGVkKTtcbiAgfVxuICBzZXQgZGlzYWJsZWQodmFsdWU6IGJvb2xlYW4pIHtcbiAgICB0aGlzLl9kaXNhYmxlZCA9IHZhbHVlO1xuICB9XG4gIHByaXZhdGUgX2Rpc2FibGVkOiBib29sZWFuID0gZmFsc2U7XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGlucHV0IGlzIGVtcHR5LiAqL1xuICBnZXQgZW1wdHkoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICF0aGlzLmlucHV0RWxlbWVudC52YWx1ZTtcbiAgfVxuXG4gIC8qKiBUaGUgbmF0aXZlIGlucHV0IGVsZW1lbnQgdG8gd2hpY2ggdGhpcyBkaXJlY3RpdmUgaXMgYXR0YWNoZWQuICovXG4gIHJlYWRvbmx5IGlucHV0RWxlbWVudCE6IEhUTUxJbnB1dEVsZW1lbnQ7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJvdGVjdGVkIF9lbGVtZW50UmVmOiBFbGVtZW50UmVmPEhUTUxJbnB1dEVsZW1lbnQ+LFxuICAgIEBJbmplY3QoTUFUX0NISVBTX0RFRkFVTFRfT1BUSU9OUykgZGVmYXVsdE9wdGlvbnM6IE1hdENoaXBzRGVmYXVsdE9wdGlvbnMsXG4gICAgQE9wdGlvbmFsKCkgQEluamVjdChNQVRfRk9STV9GSUVMRCkgZm9ybUZpZWxkPzogTWF0Rm9ybUZpZWxkLFxuICApIHtcbiAgICB0aGlzLmlucHV0RWxlbWVudCA9IHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudCBhcyBIVE1MSW5wdXRFbGVtZW50O1xuICAgIHRoaXMuc2VwYXJhdG9yS2V5Q29kZXMgPSBkZWZhdWx0T3B0aW9ucy5zZXBhcmF0b3JLZXlDb2RlcztcblxuICAgIGlmIChmb3JtRmllbGQpIHtcbiAgICAgIHRoaXMuaW5wdXRFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ21hdC1tZGMtZm9ybS1maWVsZC1pbnB1dC1jb250cm9sJyk7XG4gICAgfVxuICB9XG5cbiAgbmdPbkNoYW5nZXMoKSB7XG4gICAgdGhpcy5fY2hpcEdyaWQuc3RhdGVDaGFuZ2VzLm5leHQoKTtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCk6IHZvaWQge1xuICAgIHRoaXMuY2hpcEVuZC5jb21wbGV0ZSgpO1xuICB9XG5cbiAgbmdBZnRlckNvbnRlbnRJbml0KCk6IHZvaWQge1xuICAgIHRoaXMuX2ZvY3VzTGFzdENoaXBPbkJhY2tzcGFjZSA9IHRoaXMuZW1wdHk7XG4gIH1cblxuICAvKiogVXRpbGl0eSBtZXRob2QgdG8gbWFrZSBob3N0IGRlZmluaXRpb24vdGVzdHMgbW9yZSBjbGVhci4gKi9cbiAgX2tleWRvd24oZXZlbnQ/OiBLZXlib2FyZEV2ZW50KSB7XG4gICAgaWYgKGV2ZW50KSB7XG4gICAgICAvLyBUbyBwcmV2ZW50IHRoZSB1c2VyIGZyb20gYWNjaWRlbnRhbGx5IGRlbGV0aW5nIGNoaXBzIHdoZW4gcHJlc3NpbmcgQkFDS1NQQUNFIGNvbnRpbnVvdXNseSxcbiAgICAgIC8vIFdlIGZvY3VzIHRoZSBsYXN0IGNoaXAgb24gYmFja3NwYWNlIG9ubHkgYWZ0ZXIgdGhlIHVzZXIgaGFzIHJlbGVhc2VkIHRoZSBiYWNrc3BhY2UgYnV0dG9uLFxuICAgICAgLy8gQW5kIHRoZSBpbnB1dCBpcyBlbXB0eSAoc2VlIGJlaGF2aW91ciBpbiBfa2V5dXApXG4gICAgICBpZiAoZXZlbnQua2V5Q29kZSA9PT0gQkFDS1NQQUNFICYmIHRoaXMuX2ZvY3VzTGFzdENoaXBPbkJhY2tzcGFjZSkge1xuICAgICAgICB0aGlzLl9jaGlwR3JpZC5fZm9jdXNMYXN0Q2hpcCgpO1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9mb2N1c0xhc3RDaGlwT25CYWNrc3BhY2UgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLl9lbWl0Q2hpcEVuZChldmVudCk7XG4gIH1cblxuICAvKipcbiAgICogUGFzcyBldmVudHMgdG8gdGhlIGtleWJvYXJkIG1hbmFnZXIuIEF2YWlsYWJsZSBoZXJlIGZvciB0ZXN0cy5cbiAgICovXG4gIF9rZXl1cChldmVudDogS2V5Ym9hcmRFdmVudCkge1xuICAgIC8vIEFsbG93IHVzZXIgdG8gbW92ZSBmb2N1cyB0byBjaGlwcyBuZXh0IHRpbWUgaGUgcHJlc3NlcyBiYWNrc3BhY2VcbiAgICBpZiAoIXRoaXMuX2ZvY3VzTGFzdENoaXBPbkJhY2tzcGFjZSAmJiBldmVudC5rZXlDb2RlID09PSBCQUNLU1BBQ0UgJiYgdGhpcy5lbXB0eSkge1xuICAgICAgdGhpcy5fZm9jdXNMYXN0Q2hpcE9uQmFja3NwYWNlID0gdHJ1ZTtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIENoZWNrcyB0byBzZWUgaWYgdGhlIGJsdXIgc2hvdWxkIGVtaXQgdGhlIChjaGlwRW5kKSBldmVudC4gKi9cbiAgX2JsdXIoKSB7XG4gICAgaWYgKHRoaXMuYWRkT25CbHVyKSB7XG4gICAgICB0aGlzLl9lbWl0Q2hpcEVuZCgpO1xuICAgIH1cbiAgICB0aGlzLmZvY3VzZWQgPSBmYWxzZTtcbiAgICAvLyBCbHVyIHRoZSBjaGlwIGxpc3QgaWYgaXQgaXMgbm90IGZvY3VzZWRcbiAgICBpZiAoIXRoaXMuX2NoaXBHcmlkLmZvY3VzZWQpIHtcbiAgICAgIHRoaXMuX2NoaXBHcmlkLl9ibHVyKCk7XG4gICAgfVxuICAgIHRoaXMuX2NoaXBHcmlkLnN0YXRlQ2hhbmdlcy5uZXh0KCk7XG4gIH1cblxuICBfZm9jdXMoKSB7XG4gICAgdGhpcy5mb2N1c2VkID0gdHJ1ZTtcbiAgICB0aGlzLl9mb2N1c0xhc3RDaGlwT25CYWNrc3BhY2UgPSB0aGlzLmVtcHR5O1xuICAgIHRoaXMuX2NoaXBHcmlkLnN0YXRlQ2hhbmdlcy5uZXh0KCk7XG4gIH1cblxuICAvKiogQ2hlY2tzIHRvIHNlZSBpZiB0aGUgKGNoaXBFbmQpIGV2ZW50IG5lZWRzIHRvIGJlIGVtaXR0ZWQuICovXG4gIF9lbWl0Q2hpcEVuZChldmVudD86IEtleWJvYXJkRXZlbnQpIHtcbiAgICBpZiAoIWV2ZW50IHx8IHRoaXMuX2lzU2VwYXJhdG9yS2V5KGV2ZW50KSkge1xuICAgICAgdGhpcy5jaGlwRW5kLmVtaXQoe1xuICAgICAgICBpbnB1dDogdGhpcy5pbnB1dEVsZW1lbnQsXG4gICAgICAgIHZhbHVlOiB0aGlzLmlucHV0RWxlbWVudC52YWx1ZSxcbiAgICAgICAgY2hpcElucHV0OiB0aGlzLFxuICAgICAgfSk7XG5cbiAgICAgIGV2ZW50Py5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH1cbiAgfVxuXG4gIF9vbklucHV0KCkge1xuICAgIC8vIExldCBjaGlwIGxpc3Qga25vdyB3aGVuZXZlciB0aGUgdmFsdWUgY2hhbmdlcy5cbiAgICB0aGlzLl9jaGlwR3JpZC5zdGF0ZUNoYW5nZXMubmV4dCgpO1xuICB9XG5cbiAgLyoqIEZvY3VzZXMgdGhlIGlucHV0LiAqL1xuICBmb2N1cygpOiB2b2lkIHtcbiAgICB0aGlzLmlucHV0RWxlbWVudC5mb2N1cygpO1xuICB9XG5cbiAgLyoqIENsZWFycyB0aGUgaW5wdXQgKi9cbiAgY2xlYXIoKTogdm9pZCB7XG4gICAgdGhpcy5pbnB1dEVsZW1lbnQudmFsdWUgPSAnJztcbiAgICB0aGlzLl9mb2N1c0xhc3RDaGlwT25CYWNrc3BhY2UgPSB0cnVlO1xuICB9XG5cbiAgc2V0RGVzY3JpYmVkQnlJZHMoaWRzOiBzdHJpbmdbXSk6IHZvaWQge1xuICAgIGNvbnN0IGVsZW1lbnQgPSB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQ7XG5cbiAgICAvLyBTZXQgdGhlIHZhbHVlIGRpcmVjdGx5IGluIHRoZSBET00gc2luY2UgdGhpcyBiaW5kaW5nXG4gICAgLy8gaXMgcHJvbmUgdG8gXCJjaGFuZ2VkIGFmdGVyIGNoZWNrZWRcIiBlcnJvcnMuXG4gICAgaWYgKGlkcy5sZW5ndGgpIHtcbiAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKCdhcmlhLWRlc2NyaWJlZGJ5JywgaWRzLmpvaW4oJyAnKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKCdhcmlhLWRlc2NyaWJlZGJ5Jyk7XG4gICAgfVxuICB9XG5cbiAgLyoqIENoZWNrcyB3aGV0aGVyIGEga2V5Y29kZSBpcyBvbmUgb2YgdGhlIGNvbmZpZ3VyZWQgc2VwYXJhdG9ycy4gKi9cbiAgcHJpdmF0ZSBfaXNTZXBhcmF0b3JLZXkoZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcbiAgICByZXR1cm4gIWhhc01vZGlmaWVyS2V5KGV2ZW50KSAmJiBuZXcgU2V0KHRoaXMuc2VwYXJhdG9yS2V5Q29kZXMpLmhhcyhldmVudC5rZXlDb2RlKTtcbiAgfVxufVxuIl19