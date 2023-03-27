/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { DOWN_ARROW, hasModifierKey } from '@angular/cdk/keycodes';
import { Directive, ElementRef, EventEmitter, Inject, Input, Optional, Output, } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { Subscription, Subject } from 'rxjs';
import { createMissingDateImplError } from './datepicker-errors';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/core";
/**
 * An event used for datepicker input and change events. We don't always have access to a native
 * input or change event because the event may have been triggered by the user clicking on the
 * calendar popup. For consistency, we always use MatDatepickerInputEvent instead.
 */
export class MatDatepickerInputEvent {
    constructor(
    /** Reference to the datepicker input component that emitted the event. */
    target, 
    /** Reference to the native input element associated with the datepicker input. */
    targetElement) {
        this.target = target;
        this.targetElement = targetElement;
        this.value = this.target.value;
    }
}
/** Base class for datepicker inputs. */
export class MatDatepickerInputBase {
    /** The value of the input. */
    get value() {
        return this._model ? this._getValueFromModel(this._model.selection) : this._pendingValue;
    }
    set value(value) {
        this._assignValueProgrammatically(value);
    }
    /** Whether the datepicker-input is disabled. */
    get disabled() {
        return !!this._disabled || this._parentDisabled();
    }
    set disabled(value) {
        const newValue = coerceBooleanProperty(value);
        const element = this._elementRef.nativeElement;
        if (this._disabled !== newValue) {
            this._disabled = newValue;
            this.stateChanges.next(undefined);
        }
        // We need to null check the `blur` method, because it's undefined during SSR.
        // In Ivy static bindings are invoked earlier, before the element is attached to the DOM.
        // This can cause an error to be thrown in some browsers (IE/Edge) which assert that the
        // element has been inserted.
        if (newValue && this._isInitialized && element.blur) {
            // Normally, native input elements automatically blur if they turn disabled. This behavior
            // is problematic, because it would mean that it triggers another change detection cycle,
            // which then causes a changed after checked error if the input element was focused before.
            element.blur();
        }
    }
    /** Gets the base validator functions. */
    _getValidators() {
        return [this._parseValidator, this._minValidator, this._maxValidator, this._filterValidator];
    }
    /** Registers a date selection model with the input. */
    _registerModel(model) {
        this._model = model;
        this._valueChangesSubscription.unsubscribe();
        if (this._pendingValue) {
            this._assignValue(this._pendingValue);
        }
        this._valueChangesSubscription = this._model.selectionChanged.subscribe(event => {
            if (this._shouldHandleChangeEvent(event)) {
                const value = this._getValueFromModel(event.selection);
                this._lastValueValid = this._isValidValue(value);
                this._cvaOnChange(value);
                this._onTouched();
                this._formatValue(value);
                this.dateInput.emit(new MatDatepickerInputEvent(this, this._elementRef.nativeElement));
                this.dateChange.emit(new MatDatepickerInputEvent(this, this._elementRef.nativeElement));
            }
        });
    }
    constructor(_elementRef, _dateAdapter, _dateFormats) {
        this._elementRef = _elementRef;
        this._dateAdapter = _dateAdapter;
        this._dateFormats = _dateFormats;
        /** Emits when a `change` event is fired on this `<input>`. */
        this.dateChange = new EventEmitter();
        /** Emits when an `input` event is fired on this `<input>`. */
        this.dateInput = new EventEmitter();
        /** Emits when the internal state has changed */
        this.stateChanges = new Subject();
        this._onTouched = () => { };
        this._validatorOnChange = () => { };
        this._cvaOnChange = () => { };
        this._valueChangesSubscription = Subscription.EMPTY;
        this._localeSubscription = Subscription.EMPTY;
        /** The form control validator for whether the input parses. */
        this._parseValidator = () => {
            return this._lastValueValid
                ? null
                : { 'matDatepickerParse': { 'text': this._elementRef.nativeElement.value } };
        };
        /** The form control validator for the date filter. */
        this._filterValidator = (control) => {
            const controlValue = this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(control.value));
            return !controlValue || this._matchesFilter(controlValue)
                ? null
                : { 'matDatepickerFilter': true };
        };
        /** The form control validator for the min date. */
        this._minValidator = (control) => {
            const controlValue = this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(control.value));
            const min = this._getMinDate();
            return !min || !controlValue || this._dateAdapter.compareDate(min, controlValue) <= 0
                ? null
                : { 'matDatepickerMin': { 'min': min, 'actual': controlValue } };
        };
        /** The form control validator for the max date. */
        this._maxValidator = (control) => {
            const controlValue = this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(control.value));
            const max = this._getMaxDate();
            return !max || !controlValue || this._dateAdapter.compareDate(max, controlValue) >= 0
                ? null
                : { 'matDatepickerMax': { 'max': max, 'actual': controlValue } };
        };
        /** Whether the last value set on the input was valid. */
        this._lastValueValid = false;
        if (typeof ngDevMode === 'undefined' || ngDevMode) {
            if (!this._dateAdapter) {
                throw createMissingDateImplError('DateAdapter');
            }
            if (!this._dateFormats) {
                throw createMissingDateImplError('MAT_DATE_FORMATS');
            }
        }
        // Update the displayed date when the locale changes.
        this._localeSubscription = _dateAdapter.localeChanges.subscribe(() => {
            this._assignValueProgrammatically(this.value);
        });
    }
    ngAfterViewInit() {
        this._isInitialized = true;
    }
    ngOnChanges(changes) {
        if (dateInputsHaveChanged(changes, this._dateAdapter)) {
            this.stateChanges.next(undefined);
        }
    }
    ngOnDestroy() {
        this._valueChangesSubscription.unsubscribe();
        this._localeSubscription.unsubscribe();
        this.stateChanges.complete();
    }
    /** @docs-private */
    registerOnValidatorChange(fn) {
        this._validatorOnChange = fn;
    }
    /** @docs-private */
    validate(c) {
        return this._validator ? this._validator(c) : null;
    }
    // Implemented as part of ControlValueAccessor.
    writeValue(value) {
        this._assignValueProgrammatically(value);
    }
    // Implemented as part of ControlValueAccessor.
    registerOnChange(fn) {
        this._cvaOnChange = fn;
    }
    // Implemented as part of ControlValueAccessor.
    registerOnTouched(fn) {
        this._onTouched = fn;
    }
    // Implemented as part of ControlValueAccessor.
    setDisabledState(isDisabled) {
        this.disabled = isDisabled;
    }
    _onKeydown(event) {
        const ctrlShiftMetaModifiers = ['ctrlKey', 'shiftKey', 'metaKey'];
        const isAltDownArrow = hasModifierKey(event, 'altKey') &&
            event.keyCode === DOWN_ARROW &&
            ctrlShiftMetaModifiers.every((modifier) => !hasModifierKey(event, modifier));
        if (isAltDownArrow && !this._elementRef.nativeElement.readOnly) {
            this._openPopup();
            event.preventDefault();
        }
    }
    _onInput(value) {
        const lastValueWasValid = this._lastValueValid;
        let date = this._dateAdapter.parse(value, this._dateFormats.parse.dateInput);
        this._lastValueValid = this._isValidValue(date);
        date = this._dateAdapter.getValidDateOrNull(date);
        const hasChanged = !this._dateAdapter.sameDate(date, this.value);
        // We need to fire the CVA change event for all
        // nulls, otherwise the validators won't run.
        if (!date || hasChanged) {
            this._cvaOnChange(date);
        }
        else {
            // Call the CVA change handler for invalid values
            // since this is what marks the control as dirty.
            if (value && !this.value) {
                this._cvaOnChange(date);
            }
            if (lastValueWasValid !== this._lastValueValid) {
                this._validatorOnChange();
            }
        }
        if (hasChanged) {
            this._assignValue(date);
            this.dateInput.emit(new MatDatepickerInputEvent(this, this._elementRef.nativeElement));
        }
    }
    _onChange() {
        this.dateChange.emit(new MatDatepickerInputEvent(this, this._elementRef.nativeElement));
    }
    /** Handles blur events on the input. */
    _onBlur() {
        // Reformat the input only if we have a valid value.
        if (this.value) {
            this._formatValue(this.value);
        }
        this._onTouched();
    }
    /** Formats a value and sets it on the input element. */
    _formatValue(value) {
        this._elementRef.nativeElement.value =
            value != null ? this._dateAdapter.format(value, this._dateFormats.display.dateInput) : '';
    }
    /** Assigns a value to the model. */
    _assignValue(value) {
        // We may get some incoming values before the model was
        // assigned. Save the value so that we can assign it later.
        if (this._model) {
            this._assignValueToModel(value);
            this._pendingValue = null;
        }
        else {
            this._pendingValue = value;
        }
    }
    /** Whether a value is considered valid. */
    _isValidValue(value) {
        return !value || this._dateAdapter.isValid(value);
    }
    /**
     * Checks whether a parent control is disabled. This is in place so that it can be overridden
     * by inputs extending this one which can be placed inside of a group that can be disabled.
     */
    _parentDisabled() {
        return false;
    }
    /** Programmatically assigns a value to the input. */
    _assignValueProgrammatically(value) {
        value = this._dateAdapter.deserialize(value);
        this._lastValueValid = this._isValidValue(value);
        value = this._dateAdapter.getValidDateOrNull(value);
        this._assignValue(value);
        this._formatValue(value);
    }
    /** Gets whether a value matches the current date filter. */
    _matchesFilter(value) {
        const filter = this._getDateFilter();
        return !filter || filter(value);
    }
}
MatDatepickerInputBase.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: MatDatepickerInputBase, deps: [{ token: i0.ElementRef }, { token: i1.DateAdapter, optional: true }, { token: MAT_DATE_FORMATS, optional: true }], target: i0.ɵɵFactoryTarget.Directive });
MatDatepickerInputBase.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "15.2.0-rc.0", type: MatDatepickerInputBase, inputs: { value: "value", disabled: "disabled" }, outputs: { dateChange: "dateChange", dateInput: "dateInput" }, usesOnChanges: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: MatDatepickerInputBase, decorators: [{
            type: Directive
        }], ctorParameters: function () { return [{ type: i0.ElementRef }, { type: i1.DateAdapter, decorators: [{
                    type: Optional
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [MAT_DATE_FORMATS]
                }] }]; }, propDecorators: { value: [{
                type: Input
            }], disabled: [{
                type: Input
            }], dateChange: [{
                type: Output
            }], dateInput: [{
                type: Output
            }] } });
/**
 * Checks whether the `SimpleChanges` object from an `ngOnChanges`
 * callback has any changes, accounting for date objects.
 */
export function dateInputsHaveChanged(changes, adapter) {
    const keys = Object.keys(changes);
    for (let key of keys) {
        const { previousValue, currentValue } = changes[key];
        if (adapter.isDateInstance(previousValue) && adapter.isDateInstance(currentValue)) {
            if (!adapter.sameDate(previousValue, currentValue)) {
                return true;
            }
        }
        else {
            return true;
        }
    }
    return false;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZXBpY2tlci1pbnB1dC1iYXNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL2RhdGVwaWNrZXIvZGF0ZXBpY2tlci1pbnB1dC1iYXNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBZSxxQkFBcUIsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQzFFLE9BQU8sRUFBQyxVQUFVLEVBQUUsY0FBYyxFQUFjLE1BQU0sdUJBQXVCLENBQUM7QUFDOUUsT0FBTyxFQUNMLFNBQVMsRUFDVCxVQUFVLEVBQ1YsWUFBWSxFQUNaLE1BQU0sRUFDTixLQUFLLEVBRUwsUUFBUSxFQUNSLE1BQU0sR0FJUCxNQUFNLGVBQWUsQ0FBQztBQVF2QixPQUFPLEVBQUMsV0FBVyxFQUFFLGdCQUFnQixFQUErQixNQUFNLHdCQUF3QixDQUFDO0FBQ25HLE9BQU8sRUFBQyxZQUFZLEVBQUUsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQzNDLE9BQU8sRUFBQywwQkFBMEIsRUFBQyxNQUFNLHFCQUFxQixDQUFDOzs7QUFPL0Q7Ozs7R0FJRztBQUNILE1BQU0sT0FBTyx1QkFBdUI7SUFJbEM7SUFDRSwwRUFBMEU7SUFDbkUsTUFBb0M7SUFDM0Msa0ZBQWtGO0lBQzNFLGFBQTBCO1FBRjFCLFdBQU0sR0FBTixNQUFNLENBQThCO1FBRXBDLGtCQUFhLEdBQWIsYUFBYSxDQUFhO1FBRWpDLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7SUFDakMsQ0FBQztDQUNGO0FBbUJELHdDQUF3QztBQUV4QyxNQUFNLE9BQWdCLHNCQUFzQjtJQU0xQyw4QkFBOEI7SUFDOUIsSUFDSSxLQUFLO1FBQ1AsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxT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SSxDQUFDO2FBQ2I7U0FDRjthQUFNO1lBQ0wsT0FBTyxJQUFJLENBQUM7U0FDYjtLQUNGO0lBRUQsT0FBTyxLQUFLLENBQUM7QUFDZixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Qm9vbGVhbklucHV0LCBjb2VyY2VCb29sZWFuUHJvcGVydHl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2VyY2lvbic7XG5pbXBvcnQge0RPV05fQVJST1csIGhhc01vZGlmaWVyS2V5LCBNb2RpZmllcktleX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2tleWNvZGVzJztcbmltcG9ydCB7XG4gIERpcmVjdGl2ZSxcbiAgRWxlbWVudFJlZixcbiAgRXZlbnRFbWl0dGVyLFxuICBJbmplY3QsXG4gIElucHV0LFxuICBPbkRlc3Ryb3ksXG4gIE9wdGlvbmFsLFxuICBPdXRwdXQsXG4gIEFmdGVyVmlld0luaXQsXG4gIE9uQ2hhbmdlcyxcbiAgU2ltcGxlQ2hhbmdlcyxcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge1xuICBBYnN0cmFjdENvbnRyb2wsXG4gIENvbnRyb2xWYWx1ZUFjY2Vzc29yLFxuICBWYWxpZGF0aW9uRXJyb3JzLFxuICBWYWxpZGF0b3IsXG4gIFZhbGlkYXRvckZuLFxufSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XG5pbXBvcnQge0RhdGVBZGFwdGVyLCBNQVRfREFURV9GT1JNQVRTLCBNYXREYXRlRm9ybWF0cywgVGhlbWVQYWxldHRlfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9jb3JlJztcbmltcG9ydCB7U3Vic2NyaXB0aW9uLCBTdWJqZWN0fSBmcm9tICdyeGpzJztcbmltcG9ydCB7Y3JlYXRlTWlzc2luZ0RhdGVJbXBsRXJyb3J9IGZyb20gJy4vZGF0ZXBpY2tlci1lcnJvcnMnO1xuaW1wb3J0IHtcbiAgRXh0cmFjdERhdGVUeXBlRnJvbVNlbGVjdGlvbixcbiAgTWF0RGF0ZVNlbGVjdGlvbk1vZGVsLFxuICBEYXRlU2VsZWN0aW9uTW9kZWxDaGFuZ2UsXG59IGZyb20gJy4vZGF0ZS1zZWxlY3Rpb24tbW9kZWwnO1xuXG4vKipcbiAqIEFuIGV2ZW50IHVzZWQgZm9yIGRhdGVwaWNrZXIgaW5wdXQgYW5kIGNoYW5nZSBldmVudHMuIFdlIGRvbid0IGFsd2F5cyBoYXZlIGFjY2VzcyB0byBhIG5hdGl2ZVxuICogaW5wdXQgb3IgY2hhbmdlIGV2ZW50IGJlY2F1c2UgdGhlIGV2ZW50IG1heSBoYXZlIGJlZW4gdHJpZ2dlcmVkIGJ5IHRoZSB1c2VyIGNsaWNraW5nIG9uIHRoZVxuICogY2FsZW5kYXIgcG9wdXAuIEZvciBjb25zaXN0ZW5jeSwgd2UgYWx3YXlzIHVzZSBNYXREYXRlcGlja2VySW5wdXRFdmVudCBpbnN0ZWFkLlxuICovXG5leHBvcnQgY2xhc3MgTWF0RGF0ZXBpY2tlcklucHV0RXZlbnQ8RCwgUyA9IHVua25vd24+IHtcbiAgLyoqIFRoZSBuZXcgdmFsdWUgZm9yIHRoZSB0YXJnZXQgZGF0ZXBpY2tlciBpbnB1dC4gKi9cbiAgdmFsdWU6IEQgfCBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIC8qKiBSZWZlcmVuY2UgdG8gdGhlIGRhdGVwaWNrZXIgaW5wdXQgY29tcG9uZW50IHRoYXQgZW1pdHRlZCB0aGUgZXZlbnQuICovXG4gICAgcHVibGljIHRhcmdldDogTWF0RGF0ZXBpY2tlcklucHV0QmFzZTxTLCBEPixcbiAgICAvKiogUmVmZXJlbmNlIHRvIHRoZSBuYXRpdmUgaW5wdXQgZWxlbWVudCBhc3NvY2lhdGVkIHdpdGggdGhlIGRhdGVwaWNrZXIgaW5wdXQuICovXG4gICAgcHVibGljIHRhcmdldEVsZW1lbnQ6IEhUTUxFbGVtZW50LFxuICApIHtcbiAgICB0aGlzLnZhbHVlID0gdGhpcy50YXJnZXQudmFsdWU7XG4gIH1cbn1cblxuLyoqIEZ1bmN0aW9uIHRoYXQgY2FuIGJlIHVzZWQgdG8gZmlsdGVyIG91dCBkYXRlcyBmcm9tIGEgY2FsZW5kYXIuICovXG5leHBvcnQgdHlwZSBEYXRlRmlsdGVyRm48RD4gPSAoZGF0ZTogRCB8IG51bGwpID0+IGJvb2xlYW47XG5cbi8qKlxuICogUGFydGlhbCByZXByZXNlbnRhdGlvbiBvZiBgTWF0Rm9ybUZpZWxkYCB0aGF0IGlzIHVzZWQgZm9yIGJhY2t3YXJkcy1jb21wYXRpYmlsaXR5XG4gKiBiZXR3ZWVuIHRoZSBsZWdhY3kgYW5kIG5vbi1sZWdhY3kgdmFyaWFudHMuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgX01hdEZvcm1GaWVsZFBhcnRpYWwge1xuICBnZXRDb25uZWN0ZWRPdmVybGF5T3JpZ2luKCk6IEVsZW1lbnRSZWY7XG4gIGdldExhYmVsSWQoKTogc3RyaW5nIHwgbnVsbDtcbiAgY29sb3I6IFRoZW1lUGFsZXR0ZTtcbiAgX2VsZW1lbnRSZWY6IEVsZW1lbnRSZWY7XG4gIF9zaG91bGRMYWJlbEZsb2F0KCk6IGJvb2xlYW47XG4gIF9oYXNGbG9hdGluZ0xhYmVsKCk6IGJvb2xlYW47XG4gIF9sYWJlbElkOiBzdHJpbmc7XG59XG5cbi8qKiBCYXNlIGNsYXNzIGZvciBkYXRlcGlja2VyIGlucHV0cy4gKi9cbkBEaXJlY3RpdmUoKVxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIE1hdERhdGVwaWNrZXJJbnB1dEJhc2U8UywgRCA9IEV4dHJhY3REYXRlVHlwZUZyb21TZWxlY3Rpb248Uz4+XG4gIGltcGxlbWVudHMgQ29udHJvbFZhbHVlQWNjZXNzb3IsIEFmdGVyVmlld0luaXQsIE9uQ2hhbmdlcywgT25EZXN0cm95LCBWYWxpZGF0b3JcbntcbiAgLyoqIFdoZXRoZXIgdGhlIGNvbXBvbmVudCBoYXMgYmVlbiBpbml0aWFsaXplZC4gKi9cbiAgcHJpdmF0ZSBfaXNJbml0aWFsaXplZDogYm9vbGVhbjtcblxuICAvKiogVGhlIHZhbHVlIG9mIHRoZSBpbnB1dC4gKi9cbiAgQElucHV0KClcbiAgZ2V0IHZhbHVlKCk6IEQgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5fbW9kZWwgPyB0aGlzLl9nZXRWYWx1ZUZyb21Nb2RlbCh0aGlzLl9tb2RlbC5zZWxlY3Rpb24pIDogdGhpcy5fcGVuZGluZ1ZhbHVlO1xuICB9XG4gIHNldCB2YWx1ZSh2YWx1ZTogYW55KSB7XG4gICAgdGhpcy5fYXNzaWduVmFsdWVQcm9ncmFtbWF0aWNhbGx5KHZhbHVlKTtcbiAgfVxuICBwcm90ZWN0ZWQgX21vZGVsOiBNYXREYXRlU2VsZWN0aW9uTW9kZWw8UywgRD4gfCB1bmRlZmluZWQ7XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGRhdGVwaWNrZXItaW5wdXQgaXMgZGlzYWJsZWQuICovXG4gIEBJbnB1dCgpXG4gIGdldCBkaXNhYmxlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gISF0aGlzLl9kaXNhYmxlZCB8fCB0aGlzLl9wYXJlbnREaXNhYmxlZCgpO1xuICB9XG4gIHNldCBkaXNhYmxlZCh2YWx1ZTogQm9vbGVhbklucHV0KSB7XG4gICAgY29uc3QgbmV3VmFsdWUgPSBjb2VyY2VCb29sZWFuUHJvcGVydHkodmFsdWUpO1xuICAgIGNvbnN0IGVsZW1lbnQgPSB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQ7XG5cbiAgICBpZiAodGhpcy5fZGlzYWJsZWQgIT09IG5ld1ZhbHVlKSB7XG4gICAgICB0aGlzLl9kaXNhYmxlZCA9IG5ld1ZhbHVlO1xuICAgICAgdGhpcy5zdGF0ZUNoYW5nZXMubmV4dCh1bmRlZmluZWQpO1xuICAgIH1cblxuICAgIC8vIFdlIG5lZWQgdG8gbnVsbCBjaGVjayB0aGUgYGJsdXJgIG1ldGhvZCwgYmVjYXVzZSBpdCdzIHVuZGVmaW5lZCBkdXJpbmcgU1NSLlxuICAgIC8vIEluIEl2eSBzdGF0aWMgYmluZGluZ3MgYXJlIGludm9rZWQgZWFybGllciwgYmVmb3JlIHRoZSBlbGVtZW50IGlzIGF0dGFjaGVkIHRvIHRoZSBET00uXG4gICAgLy8gVGhpcyBjYW4gY2F1c2UgYW4gZXJyb3IgdG8gYmUgdGhyb3duIGluIHNvbWUgYnJvd3NlcnMgKElFL0VkZ2UpIHdoaWNoIGFzc2VydCB0aGF0IHRoZVxuICAgIC8vIGVsZW1lbnQgaGFzIGJlZW4gaW5zZXJ0ZWQuXG4gICAgaWYgKG5ld1ZhbHVlICYmIHRoaXMuX2lzSW5pdGlhbGl6ZWQgJiYgZWxlbWVudC5ibHVyKSB7XG4gICAgICAvLyBOb3JtYWxseSwgbmF0aXZlIGlucHV0IGVsZW1lbnRzIGF1dG9tYXRpY2FsbHkgYmx1ciBpZiB0aGV5IHR1cm4gZGlzYWJsZWQuIFRoaXMgYmVoYXZpb3JcbiAgICAgIC8vIGlzIHByb2JsZW1hdGljLCBiZWNhdXNlIGl0IHdvdWxkIG1lYW4gdGhhdCBpdCB0cmlnZ2VycyBhbm90aGVyIGNoYW5nZSBkZXRlY3Rpb24gY3ljbGUsXG4gICAgICAvLyB3aGljaCB0aGVuIGNhdXNlcyBhIGNoYW5nZWQgYWZ0ZXIgY2hlY2tlZCBlcnJvciBpZiB0aGUgaW5wdXQgZWxlbWVudCB3YXMgZm9jdXNlZCBiZWZvcmUuXG4gICAgICBlbGVtZW50LmJsdXIoKTtcbiAgICB9XG4gIH1cbiAgcHJpdmF0ZSBfZGlzYWJsZWQ6IGJvb2xlYW47XG5cbiAgLyoqIEVtaXRzIHdoZW4gYSBgY2hhbmdlYCBldmVudCBpcyBmaXJlZCBvbiB0aGlzIGA8aW5wdXQ+YC4gKi9cbiAgQE91dHB1dCgpIHJlYWRvbmx5IGRhdGVDaGFuZ2U6IEV2ZW50RW1pdHRlcjxNYXREYXRlcGlja2VySW5wdXRFdmVudDxELCBTPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFxuICAgIE1hdERhdGVwaWNrZXJJbnB1dEV2ZW50PEQsIFM+XG4gID4oKTtcblxuICAvKiogRW1pdHMgd2hlbiBhbiBgaW5wdXRgIGV2ZW50IGlzIGZpcmVkIG9uIHRoaXMgYDxpbnB1dD5gLiAqL1xuICBAT3V0cHV0KCkgcmVhZG9ubHkgZGF0ZUlucHV0OiBFdmVudEVtaXR0ZXI8TWF0RGF0ZXBpY2tlcklucHV0RXZlbnQ8RCwgUz4+ID0gbmV3IEV2ZW50RW1pdHRlcjxcbiAgICBNYXREYXRlcGlja2VySW5wdXRFdmVudDxELCBTPlxuICA+KCk7XG5cbiAgLyoqIEVtaXRzIHdoZW4gdGhlIGludGVybmFsIHN0YXRlIGhhcyBjaGFuZ2VkICovXG4gIHJlYWRvbmx5IHN0YXRlQ2hhbmdlcyA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XG5cbiAgX29uVG91Y2hlZCA9ICgpID0+IHt9O1xuICBfdmFsaWRhdG9yT25DaGFuZ2UgPSAoKSA9PiB7fTtcblxuICBwcml2YXRlIF9jdmFPbkNoYW5nZTogKHZhbHVlOiBhbnkpID0+IHZvaWQgPSAoKSA9PiB7fTtcbiAgcHJpdmF0ZSBfdmFsdWVDaGFuZ2VzU3Vic2NyaXB0aW9uID0gU3Vic2NyaXB0aW9uLkVNUFRZO1xuICBwcml2YXRlIF9sb2NhbGVTdWJzY3JpcHRpb24gPSBTdWJzY3JpcHRpb24uRU1QVFk7XG5cbiAgLyoqXG4gICAqIFNpbmNlIHRoZSB2YWx1ZSBpcyBrZXB0IG9uIHRoZSBtb2RlbCB3aGljaCBpcyBhc3NpZ25lZCBpbiBhbiBJbnB1dCxcbiAgICogd2UgbWlnaHQgZ2V0IGEgdmFsdWUgYmVmb3JlIHdlIGhhdmUgYSBtb2RlbC4gVGhpcyBwcm9wZXJ0eSBrZWVwcyB0cmFja1xuICAgKiBvZiB0aGUgdmFsdWUgdW50aWwgd2UgaGF2ZSBzb21ld2hlcmUgdG8gYXNzaWduIGl0LlxuICAgKi9cbiAgcHJpdmF0ZSBfcGVuZGluZ1ZhbHVlOiBEIHwgbnVsbDtcblxuICAvKiogVGhlIGZvcm0gY29udHJvbCB2YWxpZGF0b3IgZm9yIHdoZXRoZXIgdGhlIGlucHV0IHBhcnNlcy4gKi9cbiAgcHJpdmF0ZSBfcGFyc2VWYWxpZGF0b3I6IFZhbGlkYXRvckZuID0gKCk6IFZhbGlkYXRpb25FcnJvcnMgfCBudWxsID0+IHtcbiAgICByZXR1cm4gdGhpcy5fbGFzdFZhbHVlVmFsaWRcbiAgICAgID8gbnVsbFxuICAgICAgOiB7J21hdERhdGVwaWNrZXJQYXJzZSc6IHsndGV4dCc6IHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC52YWx1ZX19O1xuICB9O1xuXG4gIC8qKiBUaGUgZm9ybSBjb250cm9sIHZhbGlkYXRvciBmb3IgdGhlIGRhdGUgZmlsdGVyLiAqL1xuICBwcml2YXRlIF9maWx0ZXJWYWxpZGF0b3I6IFZhbGlkYXRvckZuID0gKGNvbnRyb2w6IEFic3RyYWN0Q29udHJvbCk6IFZhbGlkYXRpb25FcnJvcnMgfCBudWxsID0+IHtcbiAgICBjb25zdCBjb250cm9sVmFsdWUgPSB0aGlzLl9kYXRlQWRhcHRlci5nZXRWYWxpZERhdGVPck51bGwoXG4gICAgICB0aGlzLl9kYXRlQWRhcHRlci5kZXNlcmlhbGl6ZShjb250cm9sLnZhbHVlKSxcbiAgICApO1xuICAgIHJldHVybiAhY29udHJvbFZhbHVlIHx8IHRoaXMuX21hdGNoZXNGaWx0ZXIoY29udHJvbFZhbHVlKVxuICAgICAgPyBudWxsXG4gICAgICA6IHsnbWF0RGF0ZXBpY2tlckZpbHRlcic6IHRydWV9O1xuICB9O1xuXG4gIC8qKiBUaGUgZm9ybSBjb250cm9sIHZhbGlkYXRvciBmb3IgdGhlIG1pbiBkYXRlLiAqL1xuICBwcml2YXRlIF9taW5WYWxpZGF0b3I6IFZhbGlkYXRvckZuID0gKGNvbnRyb2w6IEFic3RyYWN0Q29udHJvbCk6IFZhbGlkYXRpb25FcnJvcnMgfCBudWxsID0+IHtcbiAgICBjb25zdCBjb250cm9sVmFsdWUgPSB0aGlzLl9kYXRlQWRhcHRlci5nZXRWYWxpZERhdGVPck51bGwoXG4gICAgICB0aGlzLl9kYXRlQWRhcHRlci5kZXNlcmlhbGl6ZShjb250cm9sLnZhbHVlKSxcbiAgICApO1xuICAgIGNvbnN0IG1pbiA9IHRoaXMuX2dldE1pbkRhdGUoKTtcbiAgICByZXR1cm4gIW1pbiB8fCAhY29udHJvbFZhbHVlIHx8IHRoaXMuX2RhdGVBZGFwdGVyLmNvbXBhcmVEYXRlKG1pbiwgY29udHJvbFZhbHVlKSA8PSAwXG4gICAgICA/IG51bGxcbiAgICAgIDogeydtYXREYXRlcGlja2VyTWluJzogeydtaW4nOiBtaW4sICdhY3R1YWwnOiBjb250cm9sVmFsdWV9fTtcbiAgfTtcblxuICAvKiogVGhlIGZvcm0gY29udHJvbCB2YWxpZGF0b3IgZm9yIHRoZSBtYXggZGF0ZS4gKi9cbiAgcHJpdmF0ZSBfbWF4VmFsaWRhdG9yOiBWYWxpZGF0b3JGbiA9IChjb250cm9sOiBBYnN0cmFjdENvbnRyb2wpOiBWYWxpZGF0aW9uRXJyb3JzIHwgbnVsbCA9PiB7XG4gICAgY29uc3QgY29udHJvbFZhbHVlID0gdGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0VmFsaWREYXRlT3JOdWxsKFxuICAgICAgdGhpcy5fZGF0ZUFkYXB0ZXIuZGVzZXJpYWxpemUoY29udHJvbC52YWx1ZSksXG4gICAgKTtcbiAgICBjb25zdCBtYXggPSB0aGlzLl9nZXRNYXhEYXRlKCk7XG4gICAgcmV0dXJuICFtYXggfHwgIWNvbnRyb2xWYWx1ZSB8fCB0aGlzLl9kYXRlQWRhcHRlci5jb21wYXJlRGF0ZShtYXgsIGNvbnRyb2xWYWx1ZSkgPj0gMFxuICAgICAgPyBudWxsXG4gICAgICA6IHsnbWF0RGF0ZXBpY2tlck1heCc6IHsnbWF4JzogbWF4LCAnYWN0dWFsJzogY29udHJvbFZhbHVlfX07XG4gIH07XG5cbiAgLyoqIEdldHMgdGhlIGJhc2UgdmFsaWRhdG9yIGZ1bmN0aW9ucy4gKi9cbiAgcHJvdGVjdGVkIF9nZXRWYWxpZGF0b3JzKCk6IFZhbGlkYXRvckZuW10ge1xuICAgIHJldHVybiBbdGhpcy5fcGFyc2VWYWxpZGF0b3IsIHRoaXMuX21pblZhbGlkYXRvciwgdGhpcy5fbWF4VmFsaWRhdG9yLCB0aGlzLl9maWx0ZXJWYWxpZGF0b3JdO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIG1pbmltdW0gZGF0ZSBmb3IgdGhlIGlucHV0LiBVc2VkIGZvciB2YWxpZGF0aW9uLiAqL1xuICBhYnN0cmFjdCBfZ2V0TWluRGF0ZSgpOiBEIHwgbnVsbDtcblxuICAvKiogR2V0cyB0aGUgbWF4aW11bSBkYXRlIGZvciB0aGUgaW5wdXQuIFVzZWQgZm9yIHZhbGlkYXRpb24uICovXG4gIGFic3RyYWN0IF9nZXRNYXhEYXRlKCk6IEQgfCBudWxsO1xuXG4gIC8qKiBHZXRzIHRoZSBkYXRlIGZpbHRlciBmdW5jdGlvbi4gVXNlZCBmb3IgdmFsaWRhdGlvbi4gKi9cbiAgcHJvdGVjdGVkIGFic3RyYWN0IF9nZXREYXRlRmlsdGVyKCk6IERhdGVGaWx0ZXJGbjxEPiB8IHVuZGVmaW5lZDtcblxuICAvKiogUmVnaXN0ZXJzIGEgZGF0ZSBzZWxlY3Rpb24gbW9kZWwgd2l0aCB0aGUgaW5wdXQuICovXG4gIF9yZWdpc3Rlck1vZGVsKG1vZGVsOiBNYXREYXRlU2VsZWN0aW9uTW9kZWw8UywgRD4pOiB2b2lkIHtcbiAgICB0aGlzLl9tb2RlbCA9IG1vZGVsO1xuICAgIHRoaXMuX3ZhbHVlQ2hhbmdlc1N1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuXG4gICAgaWYgKHRoaXMuX3BlbmRpbmdWYWx1ZSkge1xuICAgICAgdGhpcy5fYXNzaWduVmFsdWUodGhpcy5fcGVuZGluZ1ZhbHVlKTtcbiAgICB9XG5cbiAgICB0aGlzLl92YWx1ZUNoYW5nZXNTdWJzY3JpcHRpb24gPSB0aGlzLl9tb2RlbC5zZWxlY3Rpb25DaGFuZ2VkLnN1YnNjcmliZShldmVudCA9PiB7XG4gICAgICBpZiAodGhpcy5fc2hvdWxkSGFuZGxlQ2hhbmdlRXZlbnQoZXZlbnQpKSB7XG4gICAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5fZ2V0VmFsdWVGcm9tTW9kZWwoZXZlbnQuc2VsZWN0aW9uKTtcbiAgICAgICAgdGhpcy5fbGFzdFZhbHVlVmFsaWQgPSB0aGlzLl9pc1ZhbGlkVmFsdWUodmFsdWUpO1xuICAgICAgICB0aGlzLl9jdmFPbkNoYW5nZSh2YWx1ZSk7XG4gICAgICAgIHRoaXMuX29uVG91Y2hlZCgpO1xuICAgICAgICB0aGlzLl9mb3JtYXRWYWx1ZSh2YWx1ZSk7XG4gICAgICAgIHRoaXMuZGF0ZUlucHV0LmVtaXQobmV3IE1hdERhdGVwaWNrZXJJbnB1dEV2ZW50KHRoaXMsIHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudCkpO1xuICAgICAgICB0aGlzLmRhdGVDaGFuZ2UuZW1pdChuZXcgTWF0RGF0ZXBpY2tlcklucHV0RXZlbnQodGhpcywgdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50KSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKiogT3BlbnMgdGhlIHBvcHVwIGFzc29jaWF0ZWQgd2l0aCB0aGUgaW5wdXQuICovXG4gIHByb3RlY3RlZCBhYnN0cmFjdCBfb3BlblBvcHVwKCk6IHZvaWQ7XG5cbiAgLyoqIEFzc2lnbnMgYSB2YWx1ZSB0byB0aGUgaW5wdXQncyBtb2RlbC4gKi9cbiAgcHJvdGVjdGVkIGFic3RyYWN0IF9hc3NpZ25WYWx1ZVRvTW9kZWwobW9kZWw6IEQgfCBudWxsKTogdm9pZDtcblxuICAvKiogQ29udmVydHMgYSB2YWx1ZSBmcm9tIHRoZSBtb2RlbCBpbnRvIGEgbmF0aXZlIHZhbHVlIGZvciB0aGUgaW5wdXQuICovXG4gIHByb3RlY3RlZCBhYnN0cmFjdCBfZ2V0VmFsdWVGcm9tTW9kZWwobW9kZWxWYWx1ZTogUyk6IEQgfCBudWxsO1xuXG4gIC8qKiBDb21iaW5lZCBmb3JtIGNvbnRyb2wgdmFsaWRhdG9yIGZvciB0aGlzIGlucHV0LiAqL1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgX3ZhbGlkYXRvcjogVmFsaWRhdG9yRm4gfCBudWxsO1xuXG4gIC8qKiBQcmVkaWNhdGUgdGhhdCBkZXRlcm1pbmVzIHdoZXRoZXIgdGhlIGlucHV0IHNob3VsZCBoYW5kbGUgYSBwYXJ0aWN1bGFyIGNoYW5nZSBldmVudC4gKi9cbiAgcHJvdGVjdGVkIGFic3RyYWN0IF9zaG91bGRIYW5kbGVDaGFuZ2VFdmVudChldmVudDogRGF0ZVNlbGVjdGlvbk1vZGVsQ2hhbmdlPFM+KTogYm9vbGVhbjtcblxuICAvKiogV2hldGhlciB0aGUgbGFzdCB2YWx1ZSBzZXQgb24gdGhlIGlucHV0IHdhcyB2YWxpZC4gKi9cbiAgcHJvdGVjdGVkIF9sYXN0VmFsdWVWYWxpZCA9IGZhbHNlO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByb3RlY3RlZCBfZWxlbWVudFJlZjogRWxlbWVudFJlZjxIVE1MSW5wdXRFbGVtZW50PixcbiAgICBAT3B0aW9uYWwoKSBwdWJsaWMgX2RhdGVBZGFwdGVyOiBEYXRlQWRhcHRlcjxEPixcbiAgICBAT3B0aW9uYWwoKSBASW5qZWN0KE1BVF9EQVRFX0ZPUk1BVFMpIHByaXZhdGUgX2RhdGVGb3JtYXRzOiBNYXREYXRlRm9ybWF0cyxcbiAgKSB7XG4gICAgaWYgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkge1xuICAgICAgaWYgKCF0aGlzLl9kYXRlQWRhcHRlcikge1xuICAgICAgICB0aHJvdyBjcmVhdGVNaXNzaW5nRGF0ZUltcGxFcnJvcignRGF0ZUFkYXB0ZXInKTtcbiAgICAgIH1cbiAgICAgIGlmICghdGhpcy5fZGF0ZUZvcm1hdHMpIHtcbiAgICAgICAgdGhyb3cgY3JlYXRlTWlzc2luZ0RhdGVJbXBsRXJyb3IoJ01BVF9EQVRFX0ZPUk1BVFMnKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBVcGRhdGUgdGhlIGRpc3BsYXllZCBkYXRlIHdoZW4gdGhlIGxvY2FsZSBjaGFuZ2VzLlxuICAgIHRoaXMuX2xvY2FsZVN1YnNjcmlwdGlvbiA9IF9kYXRlQWRhcHRlci5sb2NhbGVDaGFuZ2VzLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICB0aGlzLl9hc3NpZ25WYWx1ZVByb2dyYW1tYXRpY2FsbHkodGhpcy52YWx1ZSk7XG4gICAgfSk7XG4gIH1cblxuICBuZ0FmdGVyVmlld0luaXQoKSB7XG4gICAgdGhpcy5faXNJbml0aWFsaXplZCA9IHRydWU7XG4gIH1cblxuICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKSB7XG4gICAgaWYgKGRhdGVJbnB1dHNIYXZlQ2hhbmdlZChjaGFuZ2VzLCB0aGlzLl9kYXRlQWRhcHRlcikpIHtcbiAgICAgIHRoaXMuc3RhdGVDaGFuZ2VzLm5leHQodW5kZWZpbmVkKTtcbiAgICB9XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLl92YWx1ZUNoYW5nZXNTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcbiAgICB0aGlzLl9sb2NhbGVTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcbiAgICB0aGlzLnN0YXRlQ2hhbmdlcy5jb21wbGV0ZSgpO1xuICB9XG5cbiAgLyoqIEBkb2NzLXByaXZhdGUgKi9cbiAgcmVnaXN0ZXJPblZhbGlkYXRvckNoYW5nZShmbjogKCkgPT4gdm9pZCk6IHZvaWQge1xuICAgIHRoaXMuX3ZhbGlkYXRvck9uQ2hhbmdlID0gZm47XG4gIH1cblxuICAvKiogQGRvY3MtcHJpdmF0ZSAqL1xuICB2YWxpZGF0ZShjOiBBYnN0cmFjdENvbnRyb2wpOiBWYWxpZGF0aW9uRXJyb3JzIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuX3ZhbGlkYXRvciA/IHRoaXMuX3ZhbGlkYXRvcihjKSA6IG51bGw7XG4gIH1cblxuICAvLyBJbXBsZW1lbnRlZCBhcyBwYXJ0IG9mIENvbnRyb2xWYWx1ZUFjY2Vzc29yLlxuICB3cml0ZVZhbHVlKHZhbHVlOiBEKTogdm9pZCB7XG4gICAgdGhpcy5fYXNzaWduVmFsdWVQcm9ncmFtbWF0aWNhbGx5KHZhbHVlKTtcbiAgfVxuXG4gIC8vIEltcGxlbWVudGVkIGFzIHBhcnQgb2YgQ29udHJvbFZhbHVlQWNjZXNzb3IuXG4gIHJlZ2lzdGVyT25DaGFuZ2UoZm46ICh2YWx1ZTogYW55KSA9PiB2b2lkKTogdm9pZCB7XG4gICAgdGhpcy5fY3ZhT25DaGFuZ2UgPSBmbjtcbiAgfVxuXG4gIC8vIEltcGxlbWVudGVkIGFzIHBhcnQgb2YgQ29udHJvbFZhbHVlQWNjZXNzb3IuXG4gIHJlZ2lzdGVyT25Ub3VjaGVkKGZuOiAoKSA9PiB2b2lkKTogdm9pZCB7XG4gICAgdGhpcy5fb25Ub3VjaGVkID0gZm47XG4gIH1cblxuICAvLyBJbXBsZW1lbnRlZCBhcyBwYXJ0IG9mIENvbnRyb2xWYWx1ZUFjY2Vzc29yLlxuICBzZXREaXNhYmxlZFN0YXRlKGlzRGlzYWJsZWQ6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLmRpc2FibGVkID0gaXNEaXNhYmxlZDtcbiAgfVxuXG4gIF9vbktleWRvd24oZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcbiAgICBjb25zdCBjdHJsU2hpZnRNZXRhTW9kaWZpZXJzOiBNb2RpZmllcktleVtdID0gWydjdHJsS2V5JywgJ3NoaWZ0S2V5JywgJ21ldGFLZXknXTtcbiAgICBjb25zdCBpc0FsdERvd25BcnJvdyA9XG4gICAgICBoYXNNb2RpZmllcktleShldmVudCwgJ2FsdEtleScpICYmXG4gICAgICBldmVudC5rZXlDb2RlID09PSBET1dOX0FSUk9XICYmXG4gICAgICBjdHJsU2hpZnRNZXRhTW9kaWZpZXJzLmV2ZXJ5KChtb2RpZmllcjogTW9kaWZpZXJLZXkpID0+ICFoYXNNb2RpZmllcktleShldmVudCwgbW9kaWZpZXIpKTtcblxuICAgIGlmIChpc0FsdERvd25BcnJvdyAmJiAhdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LnJlYWRPbmx5KSB7XG4gICAgICB0aGlzLl9vcGVuUG9wdXAoKTtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgfVxuICB9XG5cbiAgX29uSW5wdXQodmFsdWU6IHN0cmluZykge1xuICAgIGNvbnN0IGxhc3RWYWx1ZVdhc1ZhbGlkID0gdGhpcy5fbGFzdFZhbHVlVmFsaWQ7XG4gICAgbGV0IGRhdGUgPSB0aGlzLl9kYXRlQWRhcHRlci5wYXJzZSh2YWx1ZSwgdGhpcy5fZGF0ZUZvcm1hdHMucGFyc2UuZGF0ZUlucHV0KTtcbiAgICB0aGlzLl9sYXN0VmFsdWVWYWxpZCA9IHRoaXMuX2lzVmFsaWRWYWx1ZShkYXRlKTtcbiAgICBkYXRlID0gdGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0VmFsaWREYXRlT3JOdWxsKGRhdGUpO1xuICAgIGNvbnN0IGhhc0NoYW5nZWQgPSAhdGhpcy5fZGF0ZUFkYXB0ZXIuc2FtZURhdGUoZGF0ZSwgdGhpcy52YWx1ZSk7XG5cbiAgICAvLyBXZSBuZWVkIHRvIGZpcmUgdGhlIENWQSBjaGFuZ2UgZXZlbnQgZm9yIGFsbFxuICAgIC8vIG51bGxzLCBvdGhlcndpc2UgdGhlIHZhbGlkYXRvcnMgd29uJ3QgcnVuLlxuICAgIGlmICghZGF0ZSB8fCBoYXNDaGFuZ2VkKSB7XG4gICAgICB0aGlzLl9jdmFPbkNoYW5nZShkYXRlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gQ2FsbCB0aGUgQ1ZBIGNoYW5nZSBoYW5kbGVyIGZvciBpbnZhbGlkIHZhbHVlc1xuICAgICAgLy8gc2luY2UgdGhpcyBpcyB3aGF0IG1hcmtzIHRoZSBjb250cm9sIGFzIGRpcnR5LlxuICAgICAgaWYgKHZhbHVlICYmICF0aGlzLnZhbHVlKSB7XG4gICAgICAgIHRoaXMuX2N2YU9uQ2hhbmdlKGRhdGUpO1xuICAgICAgfVxuXG4gICAgICBpZiAobGFzdFZhbHVlV2FzVmFsaWQgIT09IHRoaXMuX2xhc3RWYWx1ZVZhbGlkKSB7XG4gICAgICAgIHRoaXMuX3ZhbGlkYXRvck9uQ2hhbmdlKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGhhc0NoYW5nZWQpIHtcbiAgICAgIHRoaXMuX2Fzc2lnblZhbHVlKGRhdGUpO1xuICAgICAgdGhpcy5kYXRlSW5wdXQuZW1pdChuZXcgTWF0RGF0ZXBpY2tlcklucHV0RXZlbnQodGhpcywgdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50KSk7XG4gICAgfVxuICB9XG5cbiAgX29uQ2hhbmdlKCkge1xuICAgIHRoaXMuZGF0ZUNoYW5nZS5lbWl0KG5ldyBNYXREYXRlcGlja2VySW5wdXRFdmVudCh0aGlzLCB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQpKTtcbiAgfVxuXG4gIC8qKiBIYW5kbGVzIGJsdXIgZXZlbnRzIG9uIHRoZSBpbnB1dC4gKi9cbiAgX29uQmx1cigpIHtcbiAgICAvLyBSZWZvcm1hdCB0aGUgaW5wdXQgb25seSBpZiB3ZSBoYXZlIGEgdmFsaWQgdmFsdWUuXG4gICAgaWYgKHRoaXMudmFsdWUpIHtcbiAgICAgIHRoaXMuX2Zvcm1hdFZhbHVlKHRoaXMudmFsdWUpO1xuICAgIH1cblxuICAgIHRoaXMuX29uVG91Y2hlZCgpO1xuICB9XG5cbiAgLyoqIEZvcm1hdHMgYSB2YWx1ZSBhbmQgc2V0cyBpdCBvbiB0aGUgaW5wdXQgZWxlbWVudC4gKi9cbiAgcHJvdGVjdGVkIF9mb3JtYXRWYWx1ZSh2YWx1ZTogRCB8IG51bGwpIHtcbiAgICB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQudmFsdWUgPVxuICAgICAgdmFsdWUgIT0gbnVsbCA/IHRoaXMuX2RhdGVBZGFwdGVyLmZvcm1hdCh2YWx1ZSwgdGhpcy5fZGF0ZUZvcm1hdHMuZGlzcGxheS5kYXRlSW5wdXQpIDogJyc7XG4gIH1cblxuICAvKiogQXNzaWducyBhIHZhbHVlIHRvIHRoZSBtb2RlbC4gKi9cbiAgcHJpdmF0ZSBfYXNzaWduVmFsdWUodmFsdWU6IEQgfCBudWxsKSB7XG4gICAgLy8gV2UgbWF5IGdldCBzb21lIGluY29taW5nIHZhbHVlcyBiZWZvcmUgdGhlIG1vZGVsIHdhc1xuICAgIC8vIGFzc2lnbmVkLiBTYXZlIHRoZSB2YWx1ZSBzbyB0aGF0IHdlIGNhbiBhc3NpZ24gaXQgbGF0ZXIuXG4gICAgaWYgKHRoaXMuX21vZGVsKSB7XG4gICAgICB0aGlzLl9hc3NpZ25WYWx1ZVRvTW9kZWwodmFsdWUpO1xuICAgICAgdGhpcy5fcGVuZGluZ1ZhbHVlID0gbnVsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fcGVuZGluZ1ZhbHVlID0gdmFsdWU7XG4gICAgfVxuICB9XG5cbiAgLyoqIFdoZXRoZXIgYSB2YWx1ZSBpcyBjb25zaWRlcmVkIHZhbGlkLiAqL1xuICBwcml2YXRlIF9pc1ZhbGlkVmFsdWUodmFsdWU6IEQgfCBudWxsKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICF2YWx1ZSB8fCB0aGlzLl9kYXRlQWRhcHRlci5pc1ZhbGlkKHZhbHVlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3Mgd2hldGhlciBhIHBhcmVudCBjb250cm9sIGlzIGRpc2FibGVkLiBUaGlzIGlzIGluIHBsYWNlIHNvIHRoYXQgaXQgY2FuIGJlIG92ZXJyaWRkZW5cbiAgICogYnkgaW5wdXRzIGV4dGVuZGluZyB0aGlzIG9uZSB3aGljaCBjYW4gYmUgcGxhY2VkIGluc2lkZSBvZiBhIGdyb3VwIHRoYXQgY2FuIGJlIGRpc2FibGVkLlxuICAgKi9cbiAgcHJvdGVjdGVkIF9wYXJlbnREaXNhYmxlZCgpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKiogUHJvZ3JhbW1hdGljYWxseSBhc3NpZ25zIGEgdmFsdWUgdG8gdGhlIGlucHV0LiAqL1xuICBwcm90ZWN0ZWQgX2Fzc2lnblZhbHVlUHJvZ3JhbW1hdGljYWxseSh2YWx1ZTogRCB8IG51bGwpIHtcbiAgICB2YWx1ZSA9IHRoaXMuX2RhdGVBZGFwdGVyLmRlc2VyaWFsaXplKHZhbHVlKTtcbiAgICB0aGlzLl9sYXN0VmFsdWVWYWxpZCA9IHRoaXMuX2lzVmFsaWRWYWx1ZSh2YWx1ZSk7XG4gICAgdmFsdWUgPSB0aGlzLl9kYXRlQWRhcHRlci5nZXRWYWxpZERhdGVPck51bGwodmFsdWUpO1xuICAgIHRoaXMuX2Fzc2lnblZhbHVlKHZhbHVlKTtcbiAgICB0aGlzLl9mb3JtYXRWYWx1ZSh2YWx1ZSk7XG4gIH1cblxuICAvKiogR2V0cyB3aGV0aGVyIGEgdmFsdWUgbWF0Y2hlcyB0aGUgY3VycmVudCBkYXRlIGZpbHRlci4gKi9cbiAgX21hdGNoZXNGaWx0ZXIodmFsdWU6IEQgfCBudWxsKTogYm9vbGVhbiB7XG4gICAgY29uc3QgZmlsdGVyID0gdGhpcy5fZ2V0RGF0ZUZpbHRlcigpO1xuICAgIHJldHVybiAhZmlsdGVyIHx8IGZpbHRlcih2YWx1ZSk7XG4gIH1cbn1cblxuLyoqXG4gKiBDaGVja3Mgd2hldGhlciB0aGUgYFNpbXBsZUNoYW5nZXNgIG9iamVjdCBmcm9tIGFuIGBuZ09uQ2hhbmdlc2BcbiAqIGNhbGxiYWNrIGhhcyBhbnkgY2hhbmdlcywgYWNjb3VudGluZyBmb3IgZGF0ZSBvYmplY3RzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZGF0ZUlucHV0c0hhdmVDaGFuZ2VkKFxuICBjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzLFxuICBhZGFwdGVyOiBEYXRlQWRhcHRlcjx1bmtub3duPixcbik6IGJvb2xlYW4ge1xuICBjb25zdCBrZXlzID0gT2JqZWN0LmtleXMoY2hhbmdlcyk7XG5cbiAgZm9yIChsZXQga2V5IG9mIGtleXMpIHtcbiAgICBjb25zdCB7cHJldmlvdXNWYWx1ZSwgY3VycmVudFZhbHVlfSA9IGNoYW5nZXNba2V5XTtcblxuICAgIGlmIChhZGFwdGVyLmlzRGF0ZUluc3RhbmNlKHByZXZpb3VzVmFsdWUpICYmIGFkYXB0ZXIuaXNEYXRlSW5zdGFuY2UoY3VycmVudFZhbHVlKSkge1xuICAgICAgaWYgKCFhZGFwdGVyLnNhbWVEYXRlKHByZXZpb3VzVmFsdWUsIGN1cnJlbnRWYWx1ZSkpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBmYWxzZTtcbn1cbiJdfQ==