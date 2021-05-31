/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { DOWN_ARROW } from '@angular/cdk/keycodes';
import { Directive, ElementRef, EventEmitter, Inject, Input, Optional, Output, } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS, } from '@angular/material/core';
import { Subscription, Subject } from 'rxjs';
import { createMissingDateImplError } from './datepicker-errors';
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
            return this._lastValueValid ?
                null : { 'matDatepickerParse': { 'text': this._elementRef.nativeElement.value } };
        };
        /** The form control validator for the date filter. */
        this._filterValidator = (control) => {
            const controlValue = this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(control.value));
            return !controlValue || this._matchesFilter(controlValue) ?
                null : { 'matDatepickerFilter': true };
        };
        /** The form control validator for the min date. */
        this._minValidator = (control) => {
            const controlValue = this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(control.value));
            const min = this._getMinDate();
            return (!min || !controlValue ||
                this._dateAdapter.compareDate(min, controlValue) <= 0) ?
                null : { 'matDatepickerMin': { 'min': min, 'actual': controlValue } };
        };
        /** The form control validator for the max date. */
        this._maxValidator = (control) => {
            const controlValue = this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(control.value));
            const max = this._getMaxDate();
            return (!max || !controlValue ||
                this._dateAdapter.compareDate(max, controlValue) >= 0) ?
                null : { 'matDatepickerMax': { 'max': max, 'actual': controlValue } };
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
    /** The value of the input. */
    get value() {
        return this._model ? this._getValueFromModel(this._model.selection) : this._pendingValue;
    }
    set value(value) {
        this._assignValueProgrammatically(value);
    }
    /** Whether the datepicker-input is disabled. */
    get disabled() { return !!this._disabled || this._parentDisabled(); }
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
        const isAltDownArrow = event.altKey && event.keyCode === DOWN_ARROW;
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
        if (!this._dateAdapter.sameDate(date, this.value)) {
            this._assignValue(date);
            this._cvaOnChange(date);
            this.dateInput.emit(new MatDatepickerInputEvent(this, this._elementRef.nativeElement));
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
            value ? this._dateAdapter.format(value, this._dateFormats.display.dateInput) : '';
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
MatDatepickerInputBase.decorators = [
    { type: Directive }
];
MatDatepickerInputBase.ctorParameters = () => [
    { type: ElementRef },
    { type: DateAdapter, decorators: [{ type: Optional }] },
    { type: undefined, decorators: [{ type: Optional }, { type: Inject, args: [MAT_DATE_FORMATS,] }] }
];
MatDatepickerInputBase.propDecorators = {
    value: [{ type: Input }],
    disabled: [{ type: Input }],
    dateChange: [{ type: Output }],
    dateInput: [{ type: Output }]
};
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZXBpY2tlci1pbnB1dC1iYXNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL2RhdGVwaWNrZXIvZGF0ZXBpY2tlci1pbnB1dC1iYXNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBZSxxQkFBcUIsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQzFFLE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUNqRCxPQUFPLEVBQ0wsU0FBUyxFQUNULFVBQVUsRUFDVixZQUFZLEVBQ1osTUFBTSxFQUNOLEtBQUssRUFFTCxRQUFRLEVBQ1IsTUFBTSxHQUlQLE1BQU0sZUFBZSxDQUFDO0FBUXZCLE9BQU8sRUFDTCxXQUFXLEVBQ1gsZ0JBQWdCLEdBRWpCLE1BQU0sd0JBQXdCLENBQUM7QUFDaEMsT0FBTyxFQUFDLFlBQVksRUFBRSxPQUFPLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDM0MsT0FBTyxFQUFDLDBCQUEwQixFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFPL0Q7Ozs7R0FJRztBQUNILE1BQU0sT0FBTyx1QkFBdUI7SUFJbEM7SUFDSSwwRUFBMEU7SUFDbkUsTUFBb0M7SUFDM0Msa0ZBQWtGO0lBQzNFLGFBQTBCO1FBRjFCLFdBQU0sR0FBTixNQUFNLENBQThCO1FBRXBDLGtCQUFhLEdBQWIsYUFBYSxDQUFhO1FBQ25DLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7SUFDakMsQ0FBQztDQUNGO0FBS0Qsd0NBQXdDO0FBRXhDLE1BQU0sT0FBZ0Isc0JBQXNCO0lBMEoxQyxZQUNjLFdBQXlDLEVBQ2hDLFlBQTRCLEVBQ0QsWUFBNEI7UUFGaEUsZ0JBQVcsR0FBWCxXQUFXLENBQThCO1FBQ2hDLGlCQUFZLEdBQVosWUFBWSxDQUFnQjtRQUNELGlCQUFZLEdBQVosWUFBWSxDQUFnQjtR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SSxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDbEMsQ0FBQzs7O1lBdlRGLFNBQVM7OztZQXJEUixVQUFVO1lBbUJWLFdBQVcsdUJBK0xOLFFBQVE7NENBQ1IsUUFBUSxZQUFJLE1BQU0sU0FBQyxnQkFBZ0I7OztvQkF0SnZDLEtBQUs7dUJBVUwsS0FBSzt5QkF5QkwsTUFBTTt3QkFJTixNQUFNOztBQWdSVDs7O0dBR0c7QUFDSCxNQUFNLFVBQVUscUJBQXFCLENBQ25DLE9BQXNCLEVBQ3RCLE9BQTZCO0lBQzdCLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7SUFFbEMsS0FBSyxJQUFJLEdBQUcsSUFBSSxJQUFJLEVBQUU7UUFDcEIsTUFBTSxFQUFDLGFBQWEsRUFBRSxZQUFZLEVBQUMsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFbkQsSUFBSSxPQUFPLENBQUMsY0FBYyxDQUFDLGFBQWEsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDLEVBQUU7WUFDakYsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsYUFBYSxFQUFFLFlBQVksQ0FBQyxFQUFFO2dCQUNsRCxPQUFPLElBQUksQ0FBQzthQUNiO1NBQ0Y7YUFBTTtZQUNMLE9BQU8sSUFBSSxDQUFDO1NBQ2I7S0FDRjtJQUVELE9BQU8sS0FBSyxDQUFDO0FBQ2YsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0Jvb2xlYW5JbnB1dCwgY29lcmNlQm9vbGVhblByb3BlcnR5fSBmcm9tICdAYW5ndWxhci9jZGsvY29lcmNpb24nO1xuaW1wb3J0IHtET1dOX0FSUk9XfSBmcm9tICdAYW5ndWxhci9jZGsva2V5Y29kZXMnO1xuaW1wb3J0IHtcbiAgRGlyZWN0aXZlLFxuICBFbGVtZW50UmVmLFxuICBFdmVudEVtaXR0ZXIsXG4gIEluamVjdCxcbiAgSW5wdXQsXG4gIE9uRGVzdHJveSxcbiAgT3B0aW9uYWwsXG4gIE91dHB1dCxcbiAgQWZ0ZXJWaWV3SW5pdCxcbiAgT25DaGFuZ2VzLFxuICBTaW1wbGVDaGFuZ2VzLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7XG4gIEFic3RyYWN0Q29udHJvbCxcbiAgQ29udHJvbFZhbHVlQWNjZXNzb3IsXG4gIFZhbGlkYXRpb25FcnJvcnMsXG4gIFZhbGlkYXRvcixcbiAgVmFsaWRhdG9yRm4sXG59IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcbmltcG9ydCB7XG4gIERhdGVBZGFwdGVyLFxuICBNQVRfREFURV9GT1JNQVRTLFxuICBNYXREYXRlRm9ybWF0cyxcbn0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvY29yZSc7XG5pbXBvcnQge1N1YnNjcmlwdGlvbiwgU3ViamVjdH0gZnJvbSAncnhqcyc7XG5pbXBvcnQge2NyZWF0ZU1pc3NpbmdEYXRlSW1wbEVycm9yfSBmcm9tICcuL2RhdGVwaWNrZXItZXJyb3JzJztcbmltcG9ydCB7XG4gIEV4dHJhY3REYXRlVHlwZUZyb21TZWxlY3Rpb24sXG4gIE1hdERhdGVTZWxlY3Rpb25Nb2RlbCxcbiAgRGF0ZVNlbGVjdGlvbk1vZGVsQ2hhbmdlLFxufSBmcm9tICcuL2RhdGUtc2VsZWN0aW9uLW1vZGVsJztcblxuLyoqXG4gKiBBbiBldmVudCB1c2VkIGZvciBkYXRlcGlja2VyIGlucHV0IGFuZCBjaGFuZ2UgZXZlbnRzLiBXZSBkb24ndCBhbHdheXMgaGF2ZSBhY2Nlc3MgdG8gYSBuYXRpdmVcbiAqIGlucHV0IG9yIGNoYW5nZSBldmVudCBiZWNhdXNlIHRoZSBldmVudCBtYXkgaGF2ZSBiZWVuIHRyaWdnZXJlZCBieSB0aGUgdXNlciBjbGlja2luZyBvbiB0aGVcbiAqIGNhbGVuZGFyIHBvcHVwLiBGb3IgY29uc2lzdGVuY3ksIHdlIGFsd2F5cyB1c2UgTWF0RGF0ZXBpY2tlcklucHV0RXZlbnQgaW5zdGVhZC5cbiAqL1xuZXhwb3J0IGNsYXNzIE1hdERhdGVwaWNrZXJJbnB1dEV2ZW50PEQsIFMgPSB1bmtub3duPiB7XG4gIC8qKiBUaGUgbmV3IHZhbHVlIGZvciB0aGUgdGFyZ2V0IGRhdGVwaWNrZXIgaW5wdXQuICovXG4gIHZhbHVlOiBEIHwgbnVsbDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIC8qKiBSZWZlcmVuY2UgdG8gdGhlIGRhdGVwaWNrZXIgaW5wdXQgY29tcG9uZW50IHRoYXQgZW1pdHRlZCB0aGUgZXZlbnQuICovXG4gICAgICBwdWJsaWMgdGFyZ2V0OiBNYXREYXRlcGlja2VySW5wdXRCYXNlPFMsIEQ+LFxuICAgICAgLyoqIFJlZmVyZW5jZSB0byB0aGUgbmF0aXZlIGlucHV0IGVsZW1lbnQgYXNzb2NpYXRlZCB3aXRoIHRoZSBkYXRlcGlja2VyIGlucHV0LiAqL1xuICAgICAgcHVibGljIHRhcmdldEVsZW1lbnQ6IEhUTUxFbGVtZW50KSB7XG4gICAgdGhpcy52YWx1ZSA9IHRoaXMudGFyZ2V0LnZhbHVlO1xuICB9XG59XG5cbi8qKiBGdW5jdGlvbiB0aGF0IGNhbiBiZSB1c2VkIHRvIGZpbHRlciBvdXQgZGF0ZXMgZnJvbSBhIGNhbGVuZGFyLiAqL1xuZXhwb3J0IHR5cGUgRGF0ZUZpbHRlckZuPEQ+ID0gKGRhdGU6IEQgfCBudWxsKSA9PiBib29sZWFuO1xuXG4vKiogQmFzZSBjbGFzcyBmb3IgZGF0ZXBpY2tlciBpbnB1dHMuICovXG5ARGlyZWN0aXZlKClcbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBNYXREYXRlcGlja2VySW5wdXRCYXNlPFMsIEQgPSBFeHRyYWN0RGF0ZVR5cGVGcm9tU2VsZWN0aW9uPFM+PlxuICBpbXBsZW1lbnRzIENvbnRyb2xWYWx1ZUFjY2Vzc29yLCBBZnRlclZpZXdJbml0LCBPbkNoYW5nZXMsIE9uRGVzdHJveSwgVmFsaWRhdG9yIHtcblxuICAvKiogV2hldGhlciB0aGUgY29tcG9uZW50IGhhcyBiZWVuIGluaXRpYWxpemVkLiAqL1xuICBwcml2YXRlIF9pc0luaXRpYWxpemVkOiBib29sZWFuO1xuXG4gIC8qKiBUaGUgdmFsdWUgb2YgdGhlIGlucHV0LiAqL1xuICBASW5wdXQoKVxuICBnZXQgdmFsdWUoKTogRCB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLl9tb2RlbCA/IHRoaXMuX2dldFZhbHVlRnJvbU1vZGVsKHRoaXMuX21vZGVsLnNlbGVjdGlvbikgOiB0aGlzLl9wZW5kaW5nVmFsdWU7XG4gIH1cbiAgc2V0IHZhbHVlKHZhbHVlOiBEIHwgbnVsbCkge1xuICAgIHRoaXMuX2Fzc2lnblZhbHVlUHJvZ3JhbW1hdGljYWxseSh2YWx1ZSk7XG4gIH1cbiAgcHJvdGVjdGVkIF9tb2RlbDogTWF0RGF0ZVNlbGVjdGlvbk1vZGVsPFMsIEQ+IHwgdW5kZWZpbmVkO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBkYXRlcGlja2VyLWlucHV0IGlzIGRpc2FibGVkLiAqL1xuICBASW5wdXQoKVxuICBnZXQgZGlzYWJsZWQoKTogYm9vbGVhbiB7IHJldHVybiAhIXRoaXMuX2Rpc2FibGVkIHx8IHRoaXMuX3BhcmVudERpc2FibGVkKCk7IH1cbiAgc2V0IGRpc2FibGVkKHZhbHVlOiBib29sZWFuKSB7XG4gICAgY29uc3QgbmV3VmFsdWUgPSBjb2VyY2VCb29sZWFuUHJvcGVydHkodmFsdWUpO1xuICAgIGNvbnN0IGVsZW1lbnQgPSB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQ7XG5cbiAgICBpZiAodGhpcy5fZGlzYWJsZWQgIT09IG5ld1ZhbHVlKSB7XG4gICAgICB0aGlzLl9kaXNhYmxlZCA9IG5ld1ZhbHVlO1xuICAgICAgdGhpcy5zdGF0ZUNoYW5nZXMubmV4dCh1bmRlZmluZWQpO1xuICAgIH1cblxuICAgIC8vIFdlIG5lZWQgdG8gbnVsbCBjaGVjayB0aGUgYGJsdXJgIG1ldGhvZCwgYmVjYXVzZSBpdCdzIHVuZGVmaW5lZCBkdXJpbmcgU1NSLlxuICAgIC8vIEluIEl2eSBzdGF0aWMgYmluZGluZ3MgYXJlIGludm9rZWQgZWFybGllciwgYmVmb3JlIHRoZSBlbGVtZW50IGlzIGF0dGFjaGVkIHRvIHRoZSBET00uXG4gICAgLy8gVGhpcyBjYW4gY2F1c2UgYW4gZXJyb3IgdG8gYmUgdGhyb3duIGluIHNvbWUgYnJvd3NlcnMgKElFL0VkZ2UpIHdoaWNoIGFzc2VydCB0aGF0IHRoZVxuICAgIC8vIGVsZW1lbnQgaGFzIGJlZW4gaW5zZXJ0ZWQuXG4gICAgaWYgKG5ld1ZhbHVlICYmIHRoaXMuX2lzSW5pdGlhbGl6ZWQgJiYgZWxlbWVudC5ibHVyKSB7XG4gICAgICAvLyBOb3JtYWxseSwgbmF0aXZlIGlucHV0IGVsZW1lbnRzIGF1dG9tYXRpY2FsbHkgYmx1ciBpZiB0aGV5IHR1cm4gZGlzYWJsZWQuIFRoaXMgYmVoYXZpb3JcbiAgICAgIC8vIGlzIHByb2JsZW1hdGljLCBiZWNhdXNlIGl0IHdvdWxkIG1lYW4gdGhhdCBpdCB0cmlnZ2VycyBhbm90aGVyIGNoYW5nZSBkZXRlY3Rpb24gY3ljbGUsXG4gICAgICAvLyB3aGljaCB0aGVuIGNhdXNlcyBhIGNoYW5nZWQgYWZ0ZXIgY2hlY2tlZCBlcnJvciBpZiB0aGUgaW5wdXQgZWxlbWVudCB3YXMgZm9jdXNlZCBiZWZvcmUuXG4gICAgICBlbGVtZW50LmJsdXIoKTtcbiAgICB9XG4gIH1cbiAgcHJpdmF0ZSBfZGlzYWJsZWQ6IGJvb2xlYW47XG5cbiAgLyoqIEVtaXRzIHdoZW4gYSBgY2hhbmdlYCBldmVudCBpcyBmaXJlZCBvbiB0aGlzIGA8aW5wdXQ+YC4gKi9cbiAgQE91dHB1dCgpIHJlYWRvbmx5IGRhdGVDaGFuZ2U6IEV2ZW50RW1pdHRlcjxNYXREYXRlcGlja2VySW5wdXRFdmVudDxELCBTPj4gPVxuICAgICAgbmV3IEV2ZW50RW1pdHRlcjxNYXREYXRlcGlja2VySW5wdXRFdmVudDxELCBTPj4oKTtcblxuICAvKiogRW1pdHMgd2hlbiBhbiBgaW5wdXRgIGV2ZW50IGlzIGZpcmVkIG9uIHRoaXMgYDxpbnB1dD5gLiAqL1xuICBAT3V0cHV0KCkgcmVhZG9ubHkgZGF0ZUlucHV0OiBFdmVudEVtaXR0ZXI8TWF0RGF0ZXBpY2tlcklucHV0RXZlbnQ8RCwgUz4+ID1cbiAgICAgIG5ldyBFdmVudEVtaXR0ZXI8TWF0RGF0ZXBpY2tlcklucHV0RXZlbnQ8RCwgUz4+KCk7XG5cbiAgLyoqIEVtaXRzIHdoZW4gdGhlIGludGVybmFsIHN0YXRlIGhhcyBjaGFuZ2VkICovXG4gIHJlYWRvbmx5IHN0YXRlQ2hhbmdlcyA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XG5cbiAgX29uVG91Y2hlZCA9ICgpID0+IHt9O1xuICBfdmFsaWRhdG9yT25DaGFuZ2UgPSAoKSA9PiB7fTtcblxuICBwcml2YXRlIF9jdmFPbkNoYW5nZTogKHZhbHVlOiBhbnkpID0+IHZvaWQgPSAoKSA9PiB7fTtcbiAgcHJpdmF0ZSBfdmFsdWVDaGFuZ2VzU3Vic2NyaXB0aW9uID0gU3Vic2NyaXB0aW9uLkVNUFRZO1xuICBwcml2YXRlIF9sb2NhbGVTdWJzY3JpcHRpb24gPSBTdWJzY3JpcHRpb24uRU1QVFk7XG5cbiAgLyoqXG4gICAqIFNpbmNlIHRoZSB2YWx1ZSBpcyBrZXB0IG9uIHRoZSBtb2RlbCB3aGljaCBpcyBhc3NpZ25lZCBpbiBhbiBJbnB1dCxcbiAgICogd2UgbWlnaHQgZ2V0IGEgdmFsdWUgYmVmb3JlIHdlIGhhdmUgYSBtb2RlbC4gVGhpcyBwcm9wZXJ0eSBrZWVwcyB0cmFja1xuICAgKiBvZiB0aGUgdmFsdWUgdW50aWwgd2UgaGF2ZSBzb21ld2hlcmUgdG8gYXNzaWduIGl0LlxuICAgKi9cbiAgcHJpdmF0ZSBfcGVuZGluZ1ZhbHVlOiBEIHwgbnVsbDtcblxuICAvKiogVGhlIGZvcm0gY29udHJvbCB2YWxpZGF0b3IgZm9yIHdoZXRoZXIgdGhlIGlucHV0IHBhcnNlcy4gKi9cbiAgcHJpdmF0ZSBfcGFyc2VWYWxpZGF0b3I6IFZhbGlkYXRvckZuID0gKCk6IFZhbGlkYXRpb25FcnJvcnMgfCBudWxsID0+IHtcbiAgICByZXR1cm4gdGhpcy5fbGFzdFZhbHVlVmFsaWQgP1xuICAgICAgICBudWxsIDogeydtYXREYXRlcGlja2VyUGFyc2UnOiB7J3RleHQnOiB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQudmFsdWV9fTtcbiAgfVxuXG4gIC8qKiBUaGUgZm9ybSBjb250cm9sIHZhbGlkYXRvciBmb3IgdGhlIGRhdGUgZmlsdGVyLiAqL1xuICBwcml2YXRlIF9maWx0ZXJWYWxpZGF0b3I6IFZhbGlkYXRvckZuID0gKGNvbnRyb2w6IEFic3RyYWN0Q29udHJvbCk6IFZhbGlkYXRpb25FcnJvcnMgfCBudWxsID0+IHtcbiAgICBjb25zdCBjb250cm9sVmFsdWUgPSB0aGlzLl9kYXRlQWRhcHRlci5nZXRWYWxpZERhdGVPck51bGwoXG4gICAgICB0aGlzLl9kYXRlQWRhcHRlci5kZXNlcmlhbGl6ZShjb250cm9sLnZhbHVlKSk7XG4gICAgcmV0dXJuICFjb250cm9sVmFsdWUgfHwgdGhpcy5fbWF0Y2hlc0ZpbHRlcihjb250cm9sVmFsdWUpID9cbiAgICAgICAgbnVsbCA6IHsnbWF0RGF0ZXBpY2tlckZpbHRlcic6IHRydWV9O1xuICB9XG5cbiAgLyoqIFRoZSBmb3JtIGNvbnRyb2wgdmFsaWRhdG9yIGZvciB0aGUgbWluIGRhdGUuICovXG4gIHByaXZhdGUgX21pblZhbGlkYXRvcjogVmFsaWRhdG9yRm4gPSAoY29udHJvbDogQWJzdHJhY3RDb250cm9sKTogVmFsaWRhdGlvbkVycm9ycyB8IG51bGwgPT4ge1xuICAgIGNvbnN0IGNvbnRyb2xWYWx1ZSA9IHRoaXMuX2RhdGVBZGFwdGVyLmdldFZhbGlkRGF0ZU9yTnVsbChcbiAgICAgIHRoaXMuX2RhdGVBZGFwdGVyLmRlc2VyaWFsaXplKGNvbnRyb2wudmFsdWUpKTtcbiAgICBjb25zdCBtaW4gPSB0aGlzLl9nZXRNaW5EYXRlKCk7XG4gICAgcmV0dXJuICghbWluIHx8ICFjb250cm9sVmFsdWUgfHxcbiAgICAgICAgdGhpcy5fZGF0ZUFkYXB0ZXIuY29tcGFyZURhdGUobWluLCBjb250cm9sVmFsdWUpIDw9IDApID9cbiAgICAgICAgbnVsbCA6IHsnbWF0RGF0ZXBpY2tlck1pbic6IHsnbWluJzogbWluLCAnYWN0dWFsJzogY29udHJvbFZhbHVlfX07XG4gIH1cblxuICAvKiogVGhlIGZvcm0gY29udHJvbCB2YWxpZGF0b3IgZm9yIHRoZSBtYXggZGF0ZS4gKi9cbiAgcHJpdmF0ZSBfbWF4VmFsaWRhdG9yOiBWYWxpZGF0b3JGbiA9IChjb250cm9sOiBBYnN0cmFjdENvbnRyb2wpOiBWYWxpZGF0aW9uRXJyb3JzIHwgbnVsbCA9PiB7XG4gICAgY29uc3QgY29udHJvbFZhbHVlID0gdGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0VmFsaWREYXRlT3JOdWxsKFxuICAgICAgdGhpcy5fZGF0ZUFkYXB0ZXIuZGVzZXJpYWxpemUoY29udHJvbC52YWx1ZSkpO1xuICAgIGNvbnN0IG1heCA9IHRoaXMuX2dldE1heERhdGUoKTtcbiAgICByZXR1cm4gKCFtYXggfHwgIWNvbnRyb2xWYWx1ZSB8fFxuICAgICAgICB0aGlzLl9kYXRlQWRhcHRlci5jb21wYXJlRGF0ZShtYXgsIGNvbnRyb2xWYWx1ZSkgPj0gMCkgP1xuICAgICAgICBudWxsIDogeydtYXREYXRlcGlja2VyTWF4JzogeydtYXgnOiBtYXgsICdhY3R1YWwnOiBjb250cm9sVmFsdWV9fTtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBiYXNlIHZhbGlkYXRvciBmdW5jdGlvbnMuICovXG4gIHByb3RlY3RlZCBfZ2V0VmFsaWRhdG9ycygpOiBWYWxpZGF0b3JGbltdIHtcbiAgICByZXR1cm4gW3RoaXMuX3BhcnNlVmFsaWRhdG9yLCB0aGlzLl9taW5WYWxpZGF0b3IsIHRoaXMuX21heFZhbGlkYXRvciwgdGhpcy5fZmlsdGVyVmFsaWRhdG9yXTtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBtaW5pbXVtIGRhdGUgZm9yIHRoZSBpbnB1dC4gVXNlZCBmb3IgdmFsaWRhdGlvbi4gKi9cbiAgYWJzdHJhY3QgX2dldE1pbkRhdGUoKTogRCB8IG51bGw7XG5cbiAgLyoqIEdldHMgdGhlIG1heGltdW0gZGF0ZSBmb3IgdGhlIGlucHV0LiBVc2VkIGZvciB2YWxpZGF0aW9uLiAqL1xuICBhYnN0cmFjdCBfZ2V0TWF4RGF0ZSgpOiBEIHwgbnVsbDtcblxuICAvKiogR2V0cyB0aGUgZGF0ZSBmaWx0ZXIgZnVuY3Rpb24uIFVzZWQgZm9yIHZhbGlkYXRpb24uICovXG4gIHByb3RlY3RlZCBhYnN0cmFjdCBfZ2V0RGF0ZUZpbHRlcigpOiBEYXRlRmlsdGVyRm48RD4gfCB1bmRlZmluZWQ7XG5cbiAgLyoqIFJlZ2lzdGVycyBhIGRhdGUgc2VsZWN0aW9uIG1vZGVsIHdpdGggdGhlIGlucHV0LiAqL1xuICBfcmVnaXN0ZXJNb2RlbChtb2RlbDogTWF0RGF0ZVNlbGVjdGlvbk1vZGVsPFMsIEQ+KTogdm9pZCB7XG4gICAgdGhpcy5fbW9kZWwgPSBtb2RlbDtcbiAgICB0aGlzLl92YWx1ZUNoYW5nZXNTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcblxuICAgIGlmICh0aGlzLl9wZW5kaW5nVmFsdWUpIHtcbiAgICAgIHRoaXMuX2Fzc2lnblZhbHVlKHRoaXMuX3BlbmRpbmdWYWx1ZSk7XG4gICAgfVxuXG4gICAgdGhpcy5fdmFsdWVDaGFuZ2VzU3Vic2NyaXB0aW9uID0gdGhpcy5fbW9kZWwuc2VsZWN0aW9uQ2hhbmdlZC5zdWJzY3JpYmUoZXZlbnQgPT4ge1xuICAgICAgaWYgKHRoaXMuX3Nob3VsZEhhbmRsZUNoYW5nZUV2ZW50KGV2ZW50KSkge1xuICAgICAgICBjb25zdCB2YWx1ZSA9IHRoaXMuX2dldFZhbHVlRnJvbU1vZGVsKGV2ZW50LnNlbGVjdGlvbik7XG4gICAgICAgIHRoaXMuX2xhc3RWYWx1ZVZhbGlkID0gdGhpcy5faXNWYWxpZFZhbHVlKHZhbHVlKTtcbiAgICAgICAgdGhpcy5fY3ZhT25DaGFuZ2UodmFsdWUpO1xuICAgICAgICB0aGlzLl9vblRvdWNoZWQoKTtcbiAgICAgICAgdGhpcy5fZm9ybWF0VmFsdWUodmFsdWUpO1xuICAgICAgICB0aGlzLmRhdGVJbnB1dC5lbWl0KG5ldyBNYXREYXRlcGlja2VySW5wdXRFdmVudCh0aGlzLCB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQpKTtcbiAgICAgICAgdGhpcy5kYXRlQ2hhbmdlLmVtaXQobmV3IE1hdERhdGVwaWNrZXJJbnB1dEV2ZW50KHRoaXMsIHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudCkpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqIE9wZW5zIHRoZSBwb3B1cCBhc3NvY2lhdGVkIHdpdGggdGhlIGlucHV0LiAqL1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgX29wZW5Qb3B1cCgpOiB2b2lkO1xuXG4gIC8qKiBBc3NpZ25zIGEgdmFsdWUgdG8gdGhlIGlucHV0J3MgbW9kZWwuICovXG4gIHByb3RlY3RlZCBhYnN0cmFjdCBfYXNzaWduVmFsdWVUb01vZGVsKG1vZGVsOiBEIHwgbnVsbCk6IHZvaWQ7XG5cbiAgLyoqIENvbnZlcnRzIGEgdmFsdWUgZnJvbSB0aGUgbW9kZWwgaW50byBhIG5hdGl2ZSB2YWx1ZSBmb3IgdGhlIGlucHV0LiAqL1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgX2dldFZhbHVlRnJvbU1vZGVsKG1vZGVsVmFsdWU6IFMpOiBEIHwgbnVsbDtcblxuICAvKiogQ29tYmluZWQgZm9ybSBjb250cm9sIHZhbGlkYXRvciBmb3IgdGhpcyBpbnB1dC4gKi9cbiAgcHJvdGVjdGVkIGFic3RyYWN0IF92YWxpZGF0b3I6IFZhbGlkYXRvckZuIHwgbnVsbDtcblxuICAvKiogUHJlZGljYXRlIHRoYXQgZGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSBpbnB1dCBzaG91bGQgaGFuZGxlIGEgcGFydGljdWxhciBjaGFuZ2UgZXZlbnQuICovXG4gIHByb3RlY3RlZCBhYnN0cmFjdCBfc2hvdWxkSGFuZGxlQ2hhbmdlRXZlbnQoZXZlbnQ6IERhdGVTZWxlY3Rpb25Nb2RlbENoYW5nZTxTPik6IGJvb2xlYW47XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGxhc3QgdmFsdWUgc2V0IG9uIHRoZSBpbnB1dCB3YXMgdmFsaWQuICovXG4gIHByb3RlY3RlZCBfbGFzdFZhbHVlVmFsaWQgPSBmYWxzZTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByb3RlY3RlZCBfZWxlbWVudFJlZjogRWxlbWVudFJlZjxIVE1MSW5wdXRFbGVtZW50PixcbiAgICAgIEBPcHRpb25hbCgpIHB1YmxpYyBfZGF0ZUFkYXB0ZXI6IERhdGVBZGFwdGVyPEQ+LFxuICAgICAgQE9wdGlvbmFsKCkgQEluamVjdChNQVRfREFURV9GT1JNQVRTKSBwcml2YXRlIF9kYXRlRm9ybWF0czogTWF0RGF0ZUZvcm1hdHMpIHtcblxuICAgIGlmICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpIHtcbiAgICAgIGlmICghdGhpcy5fZGF0ZUFkYXB0ZXIpIHtcbiAgICAgICAgdGhyb3cgY3JlYXRlTWlzc2luZ0RhdGVJbXBsRXJyb3IoJ0RhdGVBZGFwdGVyJyk7XG4gICAgICB9XG4gICAgICBpZiAoIXRoaXMuX2RhdGVGb3JtYXRzKSB7XG4gICAgICAgIHRocm93IGNyZWF0ZU1pc3NpbmdEYXRlSW1wbEVycm9yKCdNQVRfREFURV9GT1JNQVRTJyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gVXBkYXRlIHRoZSBkaXNwbGF5ZWQgZGF0ZSB3aGVuIHRoZSBsb2NhbGUgY2hhbmdlcy5cbiAgICB0aGlzLl9sb2NhbGVTdWJzY3JpcHRpb24gPSBfZGF0ZUFkYXB0ZXIubG9jYWxlQ2hhbmdlcy5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgdGhpcy5fYXNzaWduVmFsdWVQcm9ncmFtbWF0aWNhbGx5KHRoaXMudmFsdWUpO1xuICAgIH0pO1xuICB9XG5cbiAgbmdBZnRlclZpZXdJbml0KCkge1xuICAgIHRoaXMuX2lzSW5pdGlhbGl6ZWQgPSB0cnVlO1xuICB9XG5cbiAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcykge1xuICAgIGlmIChkYXRlSW5wdXRzSGF2ZUNoYW5nZWQoY2hhbmdlcywgdGhpcy5fZGF0ZUFkYXB0ZXIpKSB7XG4gICAgICB0aGlzLnN0YXRlQ2hhbmdlcy5uZXh0KHVuZGVmaW5lZCk7XG4gICAgfVxuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdGhpcy5fdmFsdWVDaGFuZ2VzU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG4gICAgdGhpcy5fbG9jYWxlU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG4gICAgdGhpcy5zdGF0ZUNoYW5nZXMuY29tcGxldGUoKTtcbiAgfVxuXG4gIC8qKiBAZG9jcy1wcml2YXRlICovXG4gIHJlZ2lzdGVyT25WYWxpZGF0b3JDaGFuZ2UoZm46ICgpID0+IHZvaWQpOiB2b2lkIHtcbiAgICB0aGlzLl92YWxpZGF0b3JPbkNoYW5nZSA9IGZuO1xuICB9XG5cbiAgLyoqIEBkb2NzLXByaXZhdGUgKi9cbiAgdmFsaWRhdGUoYzogQWJzdHJhY3RDb250cm9sKTogVmFsaWRhdGlvbkVycm9ycyB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLl92YWxpZGF0b3IgPyB0aGlzLl92YWxpZGF0b3IoYykgOiBudWxsO1xuICB9XG5cbiAgLy8gSW1wbGVtZW50ZWQgYXMgcGFydCBvZiBDb250cm9sVmFsdWVBY2Nlc3Nvci5cbiAgd3JpdGVWYWx1ZSh2YWx1ZTogRCk6IHZvaWQge1xuICAgIHRoaXMuX2Fzc2lnblZhbHVlUHJvZ3JhbW1hdGljYWxseSh2YWx1ZSk7XG4gIH1cblxuICAvLyBJbXBsZW1lbnRlZCBhcyBwYXJ0IG9mIENvbnRyb2xWYWx1ZUFjY2Vzc29yLlxuICByZWdpc3Rlck9uQ2hhbmdlKGZuOiAodmFsdWU6IGFueSkgPT4gdm9pZCk6IHZvaWQge1xuICAgIHRoaXMuX2N2YU9uQ2hhbmdlID0gZm47XG4gIH1cblxuICAvLyBJbXBsZW1lbnRlZCBhcyBwYXJ0IG9mIENvbnRyb2xWYWx1ZUFjY2Vzc29yLlxuICByZWdpc3Rlck9uVG91Y2hlZChmbjogKCkgPT4gdm9pZCk6IHZvaWQge1xuICAgIHRoaXMuX29uVG91Y2hlZCA9IGZuO1xuICB9XG5cbiAgLy8gSW1wbGVtZW50ZWQgYXMgcGFydCBvZiBDb250cm9sVmFsdWVBY2Nlc3Nvci5cbiAgc2V0RGlzYWJsZWRTdGF0ZShpc0Rpc2FibGVkOiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5kaXNhYmxlZCA9IGlzRGlzYWJsZWQ7XG4gIH1cblxuICBfb25LZXlkb3duKGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG4gICAgY29uc3QgaXNBbHREb3duQXJyb3cgPSBldmVudC5hbHRLZXkgJiYgZXZlbnQua2V5Q29kZSA9PT0gRE9XTl9BUlJPVztcblxuICAgIGlmIChpc0FsdERvd25BcnJvdyAmJiAhdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LnJlYWRPbmx5KSB7XG4gICAgICB0aGlzLl9vcGVuUG9wdXAoKTtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgfVxuICB9XG5cbiAgX29uSW5wdXQodmFsdWU6IHN0cmluZykge1xuICAgIGNvbnN0IGxhc3RWYWx1ZVdhc1ZhbGlkID0gdGhpcy5fbGFzdFZhbHVlVmFsaWQ7XG4gICAgbGV0IGRhdGUgPSB0aGlzLl9kYXRlQWRhcHRlci5wYXJzZSh2YWx1ZSwgdGhpcy5fZGF0ZUZvcm1hdHMucGFyc2UuZGF0ZUlucHV0KTtcbiAgICB0aGlzLl9sYXN0VmFsdWVWYWxpZCA9IHRoaXMuX2lzVmFsaWRWYWx1ZShkYXRlKTtcbiAgICBkYXRlID0gdGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0VmFsaWREYXRlT3JOdWxsKGRhdGUpO1xuXG4gICAgaWYgKCF0aGlzLl9kYXRlQWRhcHRlci5zYW1lRGF0ZShkYXRlLCB0aGlzLnZhbHVlKSkge1xuICAgICAgdGhpcy5fYXNzaWduVmFsdWUoZGF0ZSk7XG4gICAgICB0aGlzLl9jdmFPbkNoYW5nZShkYXRlKTtcbiAgICAgIHRoaXMuZGF0ZUlucHV0LmVtaXQobmV3IE1hdERhdGVwaWNrZXJJbnB1dEV2ZW50KHRoaXMsIHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudCkpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBDYWxsIHRoZSBDVkEgY2hhbmdlIGhhbmRsZXIgZm9yIGludmFsaWQgdmFsdWVzXG4gICAgICAvLyBzaW5jZSB0aGlzIGlzIHdoYXQgbWFya3MgdGhlIGNvbnRyb2wgYXMgZGlydHkuXG4gICAgICBpZiAodmFsdWUgJiYgIXRoaXMudmFsdWUpIHtcbiAgICAgICAgdGhpcy5fY3ZhT25DaGFuZ2UoZGF0ZSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChsYXN0VmFsdWVXYXNWYWxpZCAhPT0gdGhpcy5fbGFzdFZhbHVlVmFsaWQpIHtcbiAgICAgICAgdGhpcy5fdmFsaWRhdG9yT25DaGFuZ2UoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBfb25DaGFuZ2UoKSB7XG4gICAgdGhpcy5kYXRlQ2hhbmdlLmVtaXQobmV3IE1hdERhdGVwaWNrZXJJbnB1dEV2ZW50KHRoaXMsIHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudCkpO1xuICB9XG5cbiAgLyoqIEhhbmRsZXMgYmx1ciBldmVudHMgb24gdGhlIGlucHV0LiAqL1xuICBfb25CbHVyKCkge1xuICAgIC8vIFJlZm9ybWF0IHRoZSBpbnB1dCBvbmx5IGlmIHdlIGhhdmUgYSB2YWxpZCB2YWx1ZS5cbiAgICBpZiAodGhpcy52YWx1ZSkge1xuICAgICAgdGhpcy5fZm9ybWF0VmFsdWUodGhpcy52YWx1ZSk7XG4gICAgfVxuXG4gICAgdGhpcy5fb25Ub3VjaGVkKCk7XG4gIH1cblxuICAvKiogRm9ybWF0cyBhIHZhbHVlIGFuZCBzZXRzIGl0IG9uIHRoZSBpbnB1dCBlbGVtZW50LiAqL1xuICBwcm90ZWN0ZWQgX2Zvcm1hdFZhbHVlKHZhbHVlOiBEIHwgbnVsbCkge1xuICAgIHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC52YWx1ZSA9XG4gICAgICAgIHZhbHVlID8gdGhpcy5fZGF0ZUFkYXB0ZXIuZm9ybWF0KHZhbHVlLCB0aGlzLl9kYXRlRm9ybWF0cy5kaXNwbGF5LmRhdGVJbnB1dCkgOiAnJztcbiAgfVxuXG4gIC8qKiBBc3NpZ25zIGEgdmFsdWUgdG8gdGhlIG1vZGVsLiAqL1xuICBwcml2YXRlIF9hc3NpZ25WYWx1ZSh2YWx1ZTogRCB8IG51bGwpIHtcbiAgICAvLyBXZSBtYXkgZ2V0IHNvbWUgaW5jb21pbmcgdmFsdWVzIGJlZm9yZSB0aGUgbW9kZWwgd2FzXG4gICAgLy8gYXNzaWduZWQuIFNhdmUgdGhlIHZhbHVlIHNvIHRoYXQgd2UgY2FuIGFzc2lnbiBpdCBsYXRlci5cbiAgICBpZiAodGhpcy5fbW9kZWwpIHtcbiAgICAgIHRoaXMuX2Fzc2lnblZhbHVlVG9Nb2RlbCh2YWx1ZSk7XG4gICAgICB0aGlzLl9wZW5kaW5nVmFsdWUgPSBudWxsO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9wZW5kaW5nVmFsdWUgPSB2YWx1ZTtcbiAgICB9XG4gIH1cblxuICAvKiogV2hldGhlciBhIHZhbHVlIGlzIGNvbnNpZGVyZWQgdmFsaWQuICovXG4gIHByaXZhdGUgX2lzVmFsaWRWYWx1ZSh2YWx1ZTogRCB8IG51bGwpOiBib29sZWFuIHtcbiAgICByZXR1cm4gIXZhbHVlIHx8IHRoaXMuX2RhdGVBZGFwdGVyLmlzVmFsaWQodmFsdWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyB3aGV0aGVyIGEgcGFyZW50IGNvbnRyb2wgaXMgZGlzYWJsZWQuIFRoaXMgaXMgaW4gcGxhY2Ugc28gdGhhdCBpdCBjYW4gYmUgb3ZlcnJpZGRlblxuICAgKiBieSBpbnB1dHMgZXh0ZW5kaW5nIHRoaXMgb25lIHdoaWNoIGNhbiBiZSBwbGFjZWQgaW5zaWRlIG9mIGEgZ3JvdXAgdGhhdCBjYW4gYmUgZGlzYWJsZWQuXG4gICAqL1xuICBwcm90ZWN0ZWQgX3BhcmVudERpc2FibGVkKCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKiBQcm9ncmFtbWF0aWNhbGx5IGFzc2lnbnMgYSB2YWx1ZSB0byB0aGUgaW5wdXQuICovXG4gIHByb3RlY3RlZCBfYXNzaWduVmFsdWVQcm9ncmFtbWF0aWNhbGx5KHZhbHVlOiBEIHwgbnVsbCkge1xuICAgIHZhbHVlID0gdGhpcy5fZGF0ZUFkYXB0ZXIuZGVzZXJpYWxpemUodmFsdWUpO1xuICAgIHRoaXMuX2xhc3RWYWx1ZVZhbGlkID0gdGhpcy5faXNWYWxpZFZhbHVlKHZhbHVlKTtcbiAgICB2YWx1ZSA9IHRoaXMuX2RhdGVBZGFwdGVyLmdldFZhbGlkRGF0ZU9yTnVsbCh2YWx1ZSk7XG4gICAgdGhpcy5fYXNzaWduVmFsdWUodmFsdWUpO1xuICAgIHRoaXMuX2Zvcm1hdFZhbHVlKHZhbHVlKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHdoZXRoZXIgYSB2YWx1ZSBtYXRjaGVzIHRoZSBjdXJyZW50IGRhdGUgZmlsdGVyLiAqL1xuICBfbWF0Y2hlc0ZpbHRlcih2YWx1ZTogRCB8IG51bGwpOiBib29sZWFuIHtcbiAgICBjb25zdCBmaWx0ZXIgPSB0aGlzLl9nZXREYXRlRmlsdGVyKCk7XG4gICAgcmV0dXJuICFmaWx0ZXIgfHwgZmlsdGVyKHZhbHVlKTtcbiAgfVxuXG4gIC8vIEFjY2VwdCBgYW55YCB0byBhdm9pZCBjb25mbGljdHMgd2l0aCBvdGhlciBkaXJlY3RpdmVzIG9uIGA8aW5wdXQ+YCB0aGF0XG4gIC8vIG1heSBhY2NlcHQgZGlmZmVyZW50IHR5cGVzLlxuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfdmFsdWU6IGFueTtcbiAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2Rpc2FibGVkOiBCb29sZWFuSW5wdXQ7XG59XG5cbi8qKlxuICogQ2hlY2tzIHdoZXRoZXIgdGhlIGBTaW1wbGVDaGFuZ2VzYCBvYmplY3QgZnJvbSBhbiBgbmdPbkNoYW5nZXNgXG4gKiBjYWxsYmFjayBoYXMgYW55IGNoYW5nZXMsIGFjY291bnRpbmcgZm9yIGRhdGUgb2JqZWN0cy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRhdGVJbnB1dHNIYXZlQ2hhbmdlZChcbiAgY2hhbmdlczogU2ltcGxlQ2hhbmdlcyxcbiAgYWRhcHRlcjogRGF0ZUFkYXB0ZXI8dW5rbm93bj4pOiBib29sZWFuIHtcbiAgY29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKGNoYW5nZXMpO1xuXG4gIGZvciAobGV0IGtleSBvZiBrZXlzKSB7XG4gICAgY29uc3Qge3ByZXZpb3VzVmFsdWUsIGN1cnJlbnRWYWx1ZX0gPSBjaGFuZ2VzW2tleV07XG5cbiAgICBpZiAoYWRhcHRlci5pc0RhdGVJbnN0YW5jZShwcmV2aW91c1ZhbHVlKSAmJiBhZGFwdGVyLmlzRGF0ZUluc3RhbmNlKGN1cnJlbnRWYWx1ZSkpIHtcbiAgICAgIGlmICghYWRhcHRlci5zYW1lRGF0ZShwcmV2aW91c1ZhbHVlLCBjdXJyZW50VmFsdWUpKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZmFsc2U7XG59XG4iXX0=