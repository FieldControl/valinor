/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Component, ChangeDetectionStrategy, ViewEncapsulation, Input, Optional, ContentChild, ChangeDetectorRef, Self, ElementRef, Inject, } from '@angular/core';
import { MatFormFieldControl, MAT_FORM_FIELD } from '@angular/material/form-field';
import { DateAdapter } from '@angular/material/core';
import { ControlContainer } from '@angular/forms';
import { Subject, merge, Subscription } from 'rxjs';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { MatStartDate, MatEndDate, MAT_DATE_RANGE_INPUT_PARENT, } from './date-range-input-parts';
import { createMissingDateImplError } from './datepicker-errors';
import { dateInputsHaveChanged } from './datepicker-input-base';
import * as i0 from "@angular/core";
import * as i1 from "@angular/forms";
import * as i2 from "@angular/material/core";
import * as i3 from "@angular/cdk/a11y";
let nextUniqueId = 0;
export class MatDateRangeInput {
    /** Current value of the range input. */
    get value() {
        return this._model ? this._model.selection : null;
    }
    /** Whether the control's label should float. */
    get shouldLabelFloat() {
        return this.focused || !this.empty;
    }
    /**
     * Implemented as a part of `MatFormFieldControl`.
     * Set the placeholder attribute on `matStartDate` and `matEndDate`.
     * @docs-private
     */
    get placeholder() {
        const start = this._startInput?._getPlaceholder() || '';
        const end = this._endInput?._getPlaceholder() || '';
        return start || end ? `${start} ${this.separator} ${end}` : '';
    }
    /** The range picker that this input is associated with. */
    get rangePicker() {
        return this._rangePicker;
    }
    set rangePicker(rangePicker) {
        if (rangePicker) {
            this._model = rangePicker.registerInput(this);
            this._rangePicker = rangePicker;
            this._closedSubscription.unsubscribe();
            this._closedSubscription = rangePicker.closedStream.subscribe(() => {
                this._startInput?._onTouched();
                this._endInput?._onTouched();
            });
            this._registerModel(this._model);
        }
    }
    /** Whether the input is required. */
    get required() {
        return !!this._required;
    }
    set required(value) {
        this._required = coerceBooleanProperty(value);
    }
    /** Function that can be used to filter out dates within the date range picker. */
    get dateFilter() {
        return this._dateFilter;
    }
    set dateFilter(value) {
        const start = this._startInput;
        const end = this._endInput;
        const wasMatchingStart = start && start._matchesFilter(start.value);
        const wasMatchingEnd = end && end._matchesFilter(start.value);
        this._dateFilter = value;
        if (start && start._matchesFilter(start.value) !== wasMatchingStart) {
            start._validatorOnChange();
        }
        if (end && end._matchesFilter(end.value) !== wasMatchingEnd) {
            end._validatorOnChange();
        }
    }
    /** The minimum valid date. */
    get min() {
        return this._min;
    }
    set min(value) {
        const validValue = this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(value));
        if (!this._dateAdapter.sameDate(validValue, this._min)) {
            this._min = validValue;
            this._revalidate();
        }
    }
    /** The maximum valid date. */
    get max() {
        return this._max;
    }
    set max(value) {
        const validValue = this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(value));
        if (!this._dateAdapter.sameDate(validValue, this._max)) {
            this._max = validValue;
            this._revalidate();
        }
    }
    /** Whether the input is disabled. */
    get disabled() {
        return this._startInput && this._endInput
            ? this._startInput.disabled && this._endInput.disabled
            : this._groupDisabled;
    }
    set disabled(value) {
        const newValue = coerceBooleanProperty(value);
        if (newValue !== this._groupDisabled) {
            this._groupDisabled = newValue;
            this.stateChanges.next(undefined);
        }
    }
    /** Whether the input is in an error state. */
    get errorState() {
        if (this._startInput && this._endInput) {
            return this._startInput.errorState || this._endInput.errorState;
        }
        return false;
    }
    /** Whether the datepicker input is empty. */
    get empty() {
        const startEmpty = this._startInput ? this._startInput.isEmpty() : false;
        const endEmpty = this._endInput ? this._endInput.isEmpty() : false;
        return startEmpty && endEmpty;
    }
    constructor(_changeDetectorRef, _elementRef, control, _dateAdapter, _formField) {
        this._changeDetectorRef = _changeDetectorRef;
        this._elementRef = _elementRef;
        this._dateAdapter = _dateAdapter;
        this._formField = _formField;
        this._closedSubscription = Subscription.EMPTY;
        /** Unique ID for the group. */
        this.id = `mat-date-range-input-${nextUniqueId++}`;
        /** Whether the control is focused. */
        this.focused = false;
        /** Name of the form control. */
        this.controlType = 'mat-date-range-input';
        this._groupDisabled = false;
        /** Value for the `aria-describedby` attribute of the inputs. */
        this._ariaDescribedBy = null;
        /** Separator text to be shown between the inputs. */
        this.separator = '–';
        /** Start of the comparison range that should be shown in the calendar. */
        this.comparisonStart = null;
        /** End of the comparison range that should be shown in the calendar. */
        this.comparisonEnd = null;
        /** Emits when the input's state has changed. */
        this.stateChanges = new Subject();
        if (!_dateAdapter && (typeof ngDevMode === 'undefined' || ngDevMode)) {
            throw createMissingDateImplError('DateAdapter');
        }
        // The datepicker module can be used both with MDC and non-MDC form fields. We have
        // to conditionally add the MDC input class so that the range picker looks correctly.
        if (_formField?._elementRef.nativeElement.classList.contains('mat-mdc-form-field')) {
            const classList = _elementRef.nativeElement.classList;
            classList.add('mat-mdc-input-element');
            classList.add('mat-mdc-form-field-input-control');
        }
        // TODO(crisbeto): remove `as any` after #18206 lands.
        this.ngControl = control;
    }
    /**
     * Implemented as a part of `MatFormFieldControl`.
     * @docs-private
     */
    setDescribedByIds(ids) {
        this._ariaDescribedBy = ids.length ? ids.join(' ') : null;
    }
    /**
     * Implemented as a part of `MatFormFieldControl`.
     * @docs-private
     */
    onContainerClick() {
        if (!this.focused && !this.disabled) {
            if (!this._model || !this._model.selection.start) {
                this._startInput.focus();
            }
            else {
                this._endInput.focus();
            }
        }
    }
    ngAfterContentInit() {
        if (typeof ngDevMode === 'undefined' || ngDevMode) {
            if (!this._startInput) {
                throw Error('mat-date-range-input must contain a matStartDate input');
            }
            if (!this._endInput) {
                throw Error('mat-date-range-input must contain a matEndDate input');
            }
        }
        if (this._model) {
            this._registerModel(this._model);
        }
        // We don't need to unsubscribe from this, because we
        // know that the input streams will be completed on destroy.
        merge(this._startInput.stateChanges, this._endInput.stateChanges).subscribe(() => {
            this.stateChanges.next(undefined);
        });
    }
    ngOnChanges(changes) {
        if (dateInputsHaveChanged(changes, this._dateAdapter)) {
            this.stateChanges.next(undefined);
        }
    }
    ngOnDestroy() {
        this._closedSubscription.unsubscribe();
        this.stateChanges.complete();
    }
    /** Gets the date at which the calendar should start. */
    getStartValue() {
        return this.value ? this.value.start : null;
    }
    /** Gets the input's theme palette. */
    getThemePalette() {
        return this._formField ? this._formField.color : undefined;
    }
    /** Gets the element to which the calendar overlay should be attached. */
    getConnectedOverlayOrigin() {
        return this._formField ? this._formField.getConnectedOverlayOrigin() : this._elementRef;
    }
    /** Gets the ID of an element that should be used a description for the calendar overlay. */
    getOverlayLabelId() {
        return this._formField ? this._formField.getLabelId() : null;
    }
    /** Gets the value that is used to mirror the state input. */
    _getInputMirrorValue(part) {
        const input = part === 'start' ? this._startInput : this._endInput;
        return input ? input.getMirrorValue() : '';
    }
    /** Whether the input placeholders should be hidden. */
    _shouldHidePlaceholders() {
        return this._startInput ? !this._startInput.isEmpty() : false;
    }
    /** Handles the value in one of the child inputs changing. */
    _handleChildValueChange() {
        this.stateChanges.next(undefined);
        this._changeDetectorRef.markForCheck();
    }
    /** Opens the date range picker associated with the input. */
    _openDatepicker() {
        if (this._rangePicker) {
            this._rangePicker.open();
        }
    }
    /** Whether the separate text should be hidden. */
    _shouldHideSeparator() {
        return ((!this._formField ||
            (this._formField.getLabelId() && !this._formField._shouldLabelFloat())) &&
            this.empty);
    }
    /** Gets the value for the `aria-labelledby` attribute of the inputs. */
    _getAriaLabelledby() {
        const formField = this._formField;
        return formField && formField._hasFloatingLabel() ? formField._labelId : null;
    }
    _getStartDateAccessibleName() {
        return this._startInput._getAccessibleName();
    }
    _getEndDateAccessibleName() {
        return this._endInput._getAccessibleName();
    }
    /** Updates the focused state of the range input. */
    _updateFocus(origin) {
        this.focused = origin !== null;
        this.stateChanges.next();
    }
    /** Re-runs the validators on the start/end inputs. */
    _revalidate() {
        if (this._startInput) {
            this._startInput._validatorOnChange();
        }
        if (this._endInput) {
            this._endInput._validatorOnChange();
        }
    }
    /** Registers the current date selection model with the start/end inputs. */
    _registerModel(model) {
        if (this._startInput) {
            this._startInput._registerModel(model);
        }
        if (this._endInput) {
            this._endInput._registerModel(model);
        }
    }
}
MatDateRangeInput.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: MatDateRangeInput, deps: [{ token: i0.ChangeDetectorRef }, { token: i0.ElementRef }, { token: i1.ControlContainer, optional: true, self: true }, { token: i2.DateAdapter, optional: true }, { token: MAT_FORM_FIELD, optional: true }], target: i0.ɵɵFactoryTarget.Component });
MatDateRangeInput.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "15.2.0-rc.0", type: MatDateRangeInput, selector: "mat-date-range-input", inputs: { rangePicker: "rangePicker", required: "required", dateFilter: "dateFilter", min: "min", max: "max", disabled: "disabled", separator: "separator", comparisonStart: "comparisonStart", comparisonEnd: "comparisonEnd" }, host: { attributes: { "role": "group" }, properties: { "class.mat-date-range-input-hide-placeholders": "_shouldHidePlaceholders()", "class.mat-date-range-input-required": "required", "attr.id": "id", "attr.aria-labelledby": "_getAriaLabelledby()", "attr.aria-describedby": "_ariaDescribedBy", "attr.data-mat-calendar": "rangePicker ? rangePicker.id : null" }, classAttribute: "mat-date-range-input" }, providers: [
        { provide: MatFormFieldControl, useExisting: MatDateRangeInput },
        { provide: MAT_DATE_RANGE_INPUT_PARENT, useExisting: MatDateRangeInput },
    ], queries: [{ propertyName: "_startInput", first: true, predicate: MatStartDate, descendants: true }, { propertyName: "_endInput", first: true, predicate: MatEndDate, descendants: true }], exportAs: ["matDateRangeInput"], usesOnChanges: true, ngImport: i0, template: "<div\n  class=\"mat-date-range-input-container\"\n  cdkMonitorSubtreeFocus\n  (cdkFocusChange)=\"_updateFocus($event)\">\n  <div class=\"mat-date-range-input-wrapper\">\n    <ng-content select=\"input[matStartDate]\"></ng-content>\n    <span\n      class=\"mat-date-range-input-mirror\"\n      aria-hidden=\"true\">{{_getInputMirrorValue('start')}}</span>\n  </div>\n\n  <span\n    class=\"mat-date-range-input-separator\"\n    [class.mat-date-range-input-separator-hidden]=\"_shouldHideSeparator()\">{{separator}}</span>\n\n  <div class=\"mat-date-range-input-wrapper mat-date-range-input-end-wrapper\">\n    <ng-content select=\"input[matEndDate]\"></ng-content>\n    <span\n      class=\"mat-date-range-input-mirror\"\n      aria-hidden=\"true\">{{_getInputMirrorValue('end')}}</span>\n  </div>\n</div>\n\n", styles: [".mat-date-range-input{display:block;width:100%}.mat-date-range-input-container{display:flex;align-items:center}.mat-date-range-input-separator{transition:opacity 400ms 133.3333333333ms cubic-bezier(0.25, 0.8, 0.25, 1);margin:0 4px}._mat-animation-noopable .mat-date-range-input-separator{transition:none}.mat-date-range-input-separator-hidden{-webkit-user-select:none;user-select:none;opacity:0;transition:none}.mat-date-range-input-wrapper{position:relative;overflow:hidden;max-width:calc(50% - 4px)}.mat-date-range-input-end-wrapper{flex-grow:1}.mat-date-range-input-inner{position:absolute;top:0;left:0;font:inherit;background:rgba(0,0,0,0);color:currentColor;border:none;outline:none;padding:0;margin:0;vertical-align:bottom;text-align:inherit;-webkit-appearance:none;width:100%;height:100%}.mat-date-range-input-inner:-moz-ui-invalid{box-shadow:none}.mat-date-range-input-inner::placeholder{transition:color 400ms 133.3333333333ms cubic-bezier(0.25, 0.8, 0.25, 1)}.mat-date-range-input-inner::-moz-placeholder{transition:color 400ms 133.3333333333ms cubic-bezier(0.25, 0.8, 0.25, 1)}.mat-date-range-input-inner::-webkit-input-placeholder{transition:color 400ms 133.3333333333ms cubic-bezier(0.25, 0.8, 0.25, 1)}.mat-date-range-input-inner:-ms-input-placeholder{transition:color 400ms 133.3333333333ms cubic-bezier(0.25, 0.8, 0.25, 1)}.mat-form-field-hide-placeholder .mat-date-range-input-inner::placeholder,.mat-date-range-input-hide-placeholders .mat-date-range-input-inner::placeholder{-webkit-user-select:none;user-select:none;color:rgba(0,0,0,0) !important;-webkit-text-fill-color:rgba(0,0,0,0);transition:none}.cdk-high-contrast-active .mat-form-field-hide-placeholder .mat-date-range-input-inner::placeholder,.cdk-high-contrast-active .mat-date-range-input-hide-placeholders .mat-date-range-input-inner::placeholder{opacity:0}.mat-form-field-hide-placeholder .mat-date-range-input-inner::-moz-placeholder,.mat-date-range-input-hide-placeholders .mat-date-range-input-inner::-moz-placeholder{-webkit-user-select:none;user-select:none;color:rgba(0,0,0,0) !important;-webkit-text-fill-color:rgba(0,0,0,0);transition:none}.cdk-high-contrast-active .mat-form-field-hide-placeholder .mat-date-range-input-inner::-moz-placeholder,.cdk-high-contrast-active .mat-date-range-input-hide-placeholders .mat-date-range-input-inner::-moz-placeholder{opacity:0}.mat-form-field-hide-placeholder .mat-date-range-input-inner::-webkit-input-placeholder,.mat-date-range-input-hide-placeholders .mat-date-range-input-inner::-webkit-input-placeholder{-webkit-user-select:none;user-select:none;color:rgba(0,0,0,0) !important;-webkit-text-fill-color:rgba(0,0,0,0);transition:none}.cdk-high-contrast-active .mat-form-field-hide-placeholder .mat-date-range-input-inner::-webkit-input-placeholder,.cdk-high-contrast-active .mat-date-range-input-hide-placeholders .mat-date-range-input-inner::-webkit-input-placeholder{opacity:0}.mat-form-field-hide-placeholder .mat-date-range-input-inner:-ms-input-placeholder,.mat-date-range-input-hide-placeholders .mat-date-range-input-inner:-ms-input-placeholder{-webkit-user-select:none;user-select:none;color:rgba(0,0,0,0) !important;-webkit-text-fill-color:rgba(0,0,0,0);transition:none}.cdk-high-contrast-active .mat-form-field-hide-placeholder .mat-date-range-input-inner:-ms-input-placeholder,.cdk-high-contrast-active .mat-date-range-input-hide-placeholders .mat-date-range-input-inner:-ms-input-placeholder{opacity:0}._mat-animation-noopable .mat-date-range-input-inner::placeholder{transition:none}._mat-animation-noopable .mat-date-range-input-inner::-moz-placeholder{transition:none}._mat-animation-noopable .mat-date-range-input-inner::-webkit-input-placeholder{transition:none}._mat-animation-noopable .mat-date-range-input-inner:-ms-input-placeholder{transition:none}.mat-date-range-input-mirror{-webkit-user-select:none;user-select:none;visibility:hidden;white-space:nowrap;display:inline-block;min-width:2px}.mat-mdc-form-field-type-mat-date-range-input .mat-mdc-form-field-infix{width:200px}"], dependencies: [{ kind: "directive", type: i3.CdkMonitorFocus, selector: "[cdkMonitorElementFocus], [cdkMonitorSubtreeFocus]", outputs: ["cdkFocusChange"], exportAs: ["cdkMonitorFocus"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: MatDateRangeInput, decorators: [{
            type: Component,
            args: [{ selector: 'mat-date-range-input', exportAs: 'matDateRangeInput', host: {
                        'class': 'mat-date-range-input',
                        '[class.mat-date-range-input-hide-placeholders]': '_shouldHidePlaceholders()',
                        '[class.mat-date-range-input-required]': 'required',
                        '[attr.id]': 'id',
                        'role': 'group',
                        '[attr.aria-labelledby]': '_getAriaLabelledby()',
                        '[attr.aria-describedby]': '_ariaDescribedBy',
                        // Used by the test harness to tie this input to its calendar. We can't depend on
                        // `aria-owns` for this, because it's only defined while the calendar is open.
                        '[attr.data-mat-calendar]': 'rangePicker ? rangePicker.id : null',
                    }, changeDetection: ChangeDetectionStrategy.OnPush, encapsulation: ViewEncapsulation.None, providers: [
                        { provide: MatFormFieldControl, useExisting: MatDateRangeInput },
                        { provide: MAT_DATE_RANGE_INPUT_PARENT, useExisting: MatDateRangeInput },
                    ], template: "<div\n  class=\"mat-date-range-input-container\"\n  cdkMonitorSubtreeFocus\n  (cdkFocusChange)=\"_updateFocus($event)\">\n  <div class=\"mat-date-range-input-wrapper\">\n    <ng-content select=\"input[matStartDate]\"></ng-content>\n    <span\n      class=\"mat-date-range-input-mirror\"\n      aria-hidden=\"true\">{{_getInputMirrorValue('start')}}</span>\n  </div>\n\n  <span\n    class=\"mat-date-range-input-separator\"\n    [class.mat-date-range-input-separator-hidden]=\"_shouldHideSeparator()\">{{separator}}</span>\n\n  <div class=\"mat-date-range-input-wrapper mat-date-range-input-end-wrapper\">\n    <ng-content select=\"input[matEndDate]\"></ng-content>\n    <span\n      class=\"mat-date-range-input-mirror\"\n      aria-hidden=\"true\">{{_getInputMirrorValue('end')}}</span>\n  </div>\n</div>\n\n", styles: [".mat-date-range-input{display:block;width:100%}.mat-date-range-input-container{display:flex;align-items:center}.mat-date-range-input-separator{transition:opacity 400ms 133.3333333333ms cubic-bezier(0.25, 0.8, 0.25, 1);margin:0 4px}._mat-animation-noopable .mat-date-range-input-separator{transition:none}.mat-date-range-input-separator-hidden{-webkit-user-select:none;user-select:none;opacity:0;transition:none}.mat-date-range-input-wrapper{position:relative;overflow:hidden;max-width:calc(50% - 4px)}.mat-date-range-input-end-wrapper{flex-grow:1}.mat-date-range-input-inner{position:absolute;top:0;left:0;font:inherit;background:rgba(0,0,0,0);color:currentColor;border:none;outline:none;padding:0;margin:0;vertical-align:bottom;text-align:inherit;-webkit-appearance:none;width:100%;height:100%}.mat-date-range-input-inner:-moz-ui-invalid{box-shadow:none}.mat-date-range-input-inner::placeholder{transition:color 400ms 133.3333333333ms cubic-bezier(0.25, 0.8, 0.25, 1)}.mat-date-range-input-inner::-moz-placeholder{transition:color 400ms 133.3333333333ms cubic-bezier(0.25, 0.8, 0.25, 1)}.mat-date-range-input-inner::-webkit-input-placeholder{transition:color 400ms 133.3333333333ms cubic-bezier(0.25, 0.8, 0.25, 1)}.mat-date-range-input-inner:-ms-input-placeholder{transition:color 400ms 133.3333333333ms cubic-bezier(0.25, 0.8, 0.25, 1)}.mat-form-field-hide-placeholder .mat-date-range-input-inner::placeholder,.mat-date-range-input-hide-placeholders .mat-date-range-input-inner::placeholder{-webkit-user-select:none;user-select:none;color:rgba(0,0,0,0) !important;-webkit-text-fill-color:rgba(0,0,0,0);transition:none}.cdk-high-contrast-active .mat-form-field-hide-placeholder .mat-date-range-input-inner::placeholder,.cdk-high-contrast-active .mat-date-range-input-hide-placeholders .mat-date-range-input-inner::placeholder{opacity:0}.mat-form-field-hide-placeholder .mat-date-range-input-inner::-moz-placeholder,.mat-date-range-input-hide-placeholders .mat-date-range-input-inner::-moz-placeholder{-webkit-user-select:none;user-select:none;color:rgba(0,0,0,0) !important;-webkit-text-fill-color:rgba(0,0,0,0);transition:none}.cdk-high-contrast-active .mat-form-field-hide-placeholder .mat-date-range-input-inner::-moz-placeholder,.cdk-high-contrast-active .mat-date-range-input-hide-placeholders .mat-date-range-input-inner::-moz-placeholder{opacity:0}.mat-form-field-hide-placeholder .mat-date-range-input-inner::-webkit-input-placeholder,.mat-date-range-input-hide-placeholders .mat-date-range-input-inner::-webkit-input-placeholder{-webkit-user-select:none;user-select:none;color:rgba(0,0,0,0) !important;-webkit-text-fill-color:rgba(0,0,0,0);transition:none}.cdk-high-contrast-active .mat-form-field-hide-placeholder .mat-date-range-input-inner::-webkit-input-placeholder,.cdk-high-contrast-active .mat-date-range-input-hide-placeholders .mat-date-range-input-inner::-webkit-input-placeholder{opacity:0}.mat-form-field-hide-placeholder .mat-date-range-input-inner:-ms-input-placeholder,.mat-date-range-input-hide-placeholders .mat-date-range-input-inner:-ms-input-placeholder{-webkit-user-select:none;user-select:none;color:rgba(0,0,0,0) !important;-webkit-text-fill-color:rgba(0,0,0,0);transition:none}.cdk-high-contrast-active .mat-form-field-hide-placeholder .mat-date-range-input-inner:-ms-input-placeholder,.cdk-high-contrast-active .mat-date-range-input-hide-placeholders .mat-date-range-input-inner:-ms-input-placeholder{opacity:0}._mat-animation-noopable .mat-date-range-input-inner::placeholder{transition:none}._mat-animation-noopable .mat-date-range-input-inner::-moz-placeholder{transition:none}._mat-animation-noopable .mat-date-range-input-inner::-webkit-input-placeholder{transition:none}._mat-animation-noopable .mat-date-range-input-inner:-ms-input-placeholder{transition:none}.mat-date-range-input-mirror{-webkit-user-select:none;user-select:none;visibility:hidden;white-space:nowrap;display:inline-block;min-width:2px}.mat-mdc-form-field-type-mat-date-range-input .mat-mdc-form-field-infix{width:200px}"] }]
        }], ctorParameters: function () { return [{ type: i0.ChangeDetectorRef }, { type: i0.ElementRef }, { type: i1.ControlContainer, decorators: [{
                    type: Optional
                }, {
                    type: Self
                }] }, { type: i2.DateAdapter, decorators: [{
                    type: Optional
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [MAT_FORM_FIELD]
                }] }]; }, propDecorators: { rangePicker: [{
                type: Input
            }], required: [{
                type: Input
            }], dateFilter: [{
                type: Input
            }], min: [{
                type: Input
            }], max: [{
                type: Input
            }], disabled: [{
                type: Input
            }], separator: [{
                type: Input
            }], comparisonStart: [{
                type: Input
            }], comparisonEnd: [{
                type: Input
            }], _startInput: [{
                type: ContentChild,
                args: [MatStartDate]
            }], _endInput: [{
                type: ContentChild,
                args: [MatEndDate]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZS1yYW5nZS1pbnB1dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9kYXRlcGlja2VyL2RhdGUtcmFuZ2UtaW5wdXQudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvZGF0ZXBpY2tlci9kYXRlLXJhbmdlLWlucHV0Lmh0bWwiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUNMLFNBQVMsRUFDVCx1QkFBdUIsRUFDdkIsaUJBQWlCLEVBQ2pCLEtBQUssRUFDTCxRQUFRLEVBRVIsWUFBWSxFQUVaLGlCQUFpQixFQUNqQixJQUFJLEVBQ0osVUFBVSxFQUNWLE1BQU0sR0FHUCxNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUMsbUJBQW1CLEVBQUUsY0FBYyxFQUFDLE1BQU0sOEJBQThCLENBQUM7QUFDakYsT0FBTyxFQUFlLFdBQVcsRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBQ2pFLE9BQU8sRUFBWSxnQkFBZ0IsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQzNELE9BQU8sRUFBQyxPQUFPLEVBQUUsS0FBSyxFQUFFLFlBQVksRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUVsRCxPQUFPLEVBQUMscUJBQXFCLEVBQWUsTUFBTSx1QkFBdUIsQ0FBQztBQUMxRSxPQUFPLEVBQ0wsWUFBWSxFQUNaLFVBQVUsRUFFViwyQkFBMkIsR0FDNUIsTUFBTSwwQkFBMEIsQ0FBQztBQUVsQyxPQUFPLEVBQUMsMEJBQTBCLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUMvRCxPQUFPLEVBQWUscUJBQXFCLEVBQXVCLE1BQU0seUJBQXlCLENBQUM7Ozs7O0FBSWxHLElBQUksWUFBWSxHQUFHLENBQUMsQ0FBQztBQTBCckIsTUFBTSxPQUFPLGlCQUFpQjtJQVk1Qix3Q0FBd0M7SUFDeEMsSUFBSSxLQUFLO1FBQ1AsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFD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QU87d0JBQ2Ysd0JBQXdCLEVBQUUsc0JBQXNCO3dCQUNoRCx5QkFBeUIsRUFBRSxrQkFBa0I7d0JBQzdDLGlGQUFpRjt3QkFDakYsOEVBQThFO3dCQUM5RSwwQkFBMEIsRUFBRSxxQ0FBcUM7cUJBQ2xFLG1CQUNnQix1QkFBdUIsQ0FBQyxNQUFNLGlCQUNoQyxpQkFBaUIsQ0FBQyxJQUFJLGFBQzFCO3dCQUNULEVBQUMsT0FBTyxFQUFFLG1CQUFtQixFQUFFLFdBQVcsbUJBQW1CLEVBQUM7d0JBQzlELEVBQUMsT0FBTyxFQUFFLDJCQUEyQixFQUFFLFdBQVcsbUJBQW1CLEVBQUM7cUJBQ3ZFOzswQkE2TEUsUUFBUTs7MEJBQUksSUFBSTs7MEJBQ2hCLFFBQVE7OzBCQUNSLFFBQVE7OzBCQUFJLE1BQU07MkJBQUMsY0FBYzs0Q0FqSmhDLFdBQVc7c0JBRGQsS0FBSztnQkFvQkYsUUFBUTtzQkFEWCxLQUFLO2dCQVdGLFVBQVU7c0JBRGIsS0FBSztnQkF1QkYsR0FBRztzQkFETixLQUFLO2dCQWdCRixHQUFHO3NCQUROLEtBQUs7Z0JBZ0JGLFFBQVE7c0JBRFgsS0FBSztnQkF1Q0csU0FBUztzQkFBakIsS0FBSztnQkFHRyxlQUFlO3NCQUF2QixLQUFLO2dCQUdHLGFBQWE7c0JBQXJCLEtBQUs7Z0JBRXNCLFdBQVc7c0JBQXRDLFlBQVk7dUJBQUMsWUFBWTtnQkFDQSxTQUFTO3NCQUFsQyxZQUFZO3VCQUFDLFVBQVUiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtcbiAgQ29tcG9uZW50LFxuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgVmlld0VuY2Fwc3VsYXRpb24sXG4gIElucHV0LFxuICBPcHRpb25hbCxcbiAgT25EZXN0cm95LFxuICBDb250ZW50Q2hpbGQsXG4gIEFmdGVyQ29udGVudEluaXQsXG4gIENoYW5nZURldGVjdG9yUmVmLFxuICBTZWxmLFxuICBFbGVtZW50UmVmLFxuICBJbmplY3QsXG4gIE9uQ2hhbmdlcyxcbiAgU2ltcGxlQ2hhbmdlcyxcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge01hdEZvcm1GaWVsZENvbnRyb2wsIE1BVF9GT1JNX0ZJRUxEfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9mb3JtLWZpZWxkJztcbmltcG9ydCB7VGhlbWVQYWxldHRlLCBEYXRlQWRhcHRlcn0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvY29yZSc7XG5pbXBvcnQge05nQ29udHJvbCwgQ29udHJvbENvbnRhaW5lcn0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xuaW1wb3J0IHtTdWJqZWN0LCBtZXJnZSwgU3Vic2NyaXB0aW9ufSBmcm9tICdyeGpzJztcbmltcG9ydCB7Rm9jdXNPcmlnaW59IGZyb20gJ0Bhbmd1bGFyL2Nkay9hMTF5JztcbmltcG9ydCB7Y29lcmNlQm9vbGVhblByb3BlcnR5LCBCb29sZWFuSW5wdXR9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2VyY2lvbic7XG5pbXBvcnQge1xuICBNYXRTdGFydERhdGUsXG4gIE1hdEVuZERhdGUsXG4gIE1hdERhdGVSYW5nZUlucHV0UGFyZW50LFxuICBNQVRfREFURV9SQU5HRV9JTlBVVF9QQVJFTlQsXG59IGZyb20gJy4vZGF0ZS1yYW5nZS1pbnB1dC1wYXJ0cyc7XG5pbXBvcnQge01hdERhdGVwaWNrZXJDb250cm9sLCBNYXREYXRlcGlja2VyUGFuZWx9IGZyb20gJy4vZGF0ZXBpY2tlci1iYXNlJztcbmltcG9ydCB7Y3JlYXRlTWlzc2luZ0RhdGVJbXBsRXJyb3J9IGZyb20gJy4vZGF0ZXBpY2tlci1lcnJvcnMnO1xuaW1wb3J0IHtEYXRlRmlsdGVyRm4sIGRhdGVJbnB1dHNIYXZlQ2hhbmdlZCwgX01hdEZvcm1GaWVsZFBhcnRpYWx9IGZyb20gJy4vZGF0ZXBpY2tlci1pbnB1dC1iYXNlJztcbmltcG9ydCB7TWF0RGF0ZVJhbmdlUGlja2VySW5wdXR9IGZyb20gJy4vZGF0ZS1yYW5nZS1waWNrZXInO1xuaW1wb3J0IHtEYXRlUmFuZ2UsIE1hdERhdGVTZWxlY3Rpb25Nb2RlbH0gZnJvbSAnLi9kYXRlLXNlbGVjdGlvbi1tb2RlbCc7XG5cbmxldCBuZXh0VW5pcXVlSWQgPSAwO1xuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdtYXQtZGF0ZS1yYW5nZS1pbnB1dCcsXG4gIHRlbXBsYXRlVXJsOiAnZGF0ZS1yYW5nZS1pbnB1dC5odG1sJyxcbiAgc3R5bGVVcmxzOiBbJ2RhdGUtcmFuZ2UtaW5wdXQuY3NzJ10sXG4gIGV4cG9ydEFzOiAnbWF0RGF0ZVJhbmdlSW5wdXQnLFxuICBob3N0OiB7XG4gICAgJ2NsYXNzJzogJ21hdC1kYXRlLXJhbmdlLWlucHV0JyxcbiAgICAnW2NsYXNzLm1hdC1kYXRlLXJhbmdlLWlucHV0LWhpZGUtcGxhY2Vob2xkZXJzXSc6ICdfc2hvdWxkSGlkZVBsYWNlaG9sZGVycygpJyxcbiAgICAnW2NsYXNzLm1hdC1kYXRlLXJhbmdlLWlucHV0LXJlcXVpcmVkXSc6ICdyZXF1aXJlZCcsXG4gICAgJ1thdHRyLmlkXSc6ICdpZCcsXG4gICAgJ3JvbGUnOiAnZ3JvdXAnLFxuICAgICdbYXR0ci5hcmlhLWxhYmVsbGVkYnldJzogJ19nZXRBcmlhTGFiZWxsZWRieSgpJyxcbiAgICAnW2F0dHIuYXJpYS1kZXNjcmliZWRieV0nOiAnX2FyaWFEZXNjcmliZWRCeScsXG4gICAgLy8gVXNlZCBieSB0aGUgdGVzdCBoYXJuZXNzIHRvIHRpZSB0aGlzIGlucHV0IHRvIGl0cyBjYWxlbmRhci4gV2UgY2FuJ3QgZGVwZW5kIG9uXG4gICAgLy8gYGFyaWEtb3duc2AgZm9yIHRoaXMsIGJlY2F1c2UgaXQncyBvbmx5IGRlZmluZWQgd2hpbGUgdGhlIGNhbGVuZGFyIGlzIG9wZW4uXG4gICAgJ1thdHRyLmRhdGEtbWF0LWNhbGVuZGFyXSc6ICdyYW5nZVBpY2tlciA/IHJhbmdlUGlja2VyLmlkIDogbnVsbCcsXG4gIH0sXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoLFxuICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lLFxuICBwcm92aWRlcnM6IFtcbiAgICB7cHJvdmlkZTogTWF0Rm9ybUZpZWxkQ29udHJvbCwgdXNlRXhpc3Rpbmc6IE1hdERhdGVSYW5nZUlucHV0fSxcbiAgICB7cHJvdmlkZTogTUFUX0RBVEVfUkFOR0VfSU5QVVRfUEFSRU5ULCB1c2VFeGlzdGluZzogTWF0RGF0ZVJhbmdlSW5wdXR9LFxuICBdLFxufSlcbmV4cG9ydCBjbGFzcyBNYXREYXRlUmFuZ2VJbnB1dDxEPlxuICBpbXBsZW1lbnRzXG4gICAgTWF0Rm9ybUZpZWxkQ29udHJvbDxEYXRlUmFuZ2U8RD4+LFxuICAgIE1hdERhdGVwaWNrZXJDb250cm9sPEQ+LFxuICAgIE1hdERhdGVSYW5nZUlucHV0UGFyZW50PEQ+LFxuICAgIE1hdERhdGVSYW5nZVBpY2tlcklucHV0PEQ+LFxuICAgIEFmdGVyQ29udGVudEluaXQsXG4gICAgT25DaGFuZ2VzLFxuICAgIE9uRGVzdHJveVxue1xuICBwcml2YXRlIF9jbG9zZWRTdWJzY3JpcHRpb24gPSBTdWJzY3JpcHRpb24uRU1QVFk7XG5cbiAgLyoqIEN1cnJlbnQgdmFsdWUgb2YgdGhlIHJhbmdlIGlucHV0LiAqL1xuICBnZXQgdmFsdWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX21vZGVsID8gdGhpcy5fbW9kZWwuc2VsZWN0aW9uIDogbnVsbDtcbiAgfVxuXG4gIC8qKiBVbmlxdWUgSUQgZm9yIHRoZSBncm91cC4gKi9cbiAgaWQgPSBgbWF0LWRhdGUtcmFuZ2UtaW5wdXQtJHtuZXh0VW5pcXVlSWQrK31gO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBjb250cm9sIGlzIGZvY3VzZWQuICovXG4gIGZvY3VzZWQgPSBmYWxzZTtcblxuICAvKiogV2hldGhlciB0aGUgY29udHJvbCdzIGxhYmVsIHNob3VsZCBmbG9hdC4gKi9cbiAgZ2V0IHNob3VsZExhYmVsRmxvYXQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuZm9jdXNlZCB8fCAhdGhpcy5lbXB0eTtcbiAgfVxuXG4gIC8qKiBOYW1lIG9mIHRoZSBmb3JtIGNvbnRyb2wuICovXG4gIGNvbnRyb2xUeXBlID0gJ21hdC1kYXRlLXJhbmdlLWlucHV0JztcblxuICAvKipcbiAgICogSW1wbGVtZW50ZWQgYXMgYSBwYXJ0IG9mIGBNYXRGb3JtRmllbGRDb250cm9sYC5cbiAgICogU2V0IHRoZSBwbGFjZWhvbGRlciBhdHRyaWJ1dGUgb24gYG1hdFN0YXJ0RGF0ZWAgYW5kIGBtYXRFbmREYXRlYC5cbiAgICogQGRvY3MtcHJpdmF0ZVxuICAgKi9cbiAgZ2V0IHBsYWNlaG9sZGVyKCkge1xuICAgIGNvbnN0IHN0YXJ0ID0gdGhpcy5fc3RhcnRJbnB1dD8uX2dldFBsYWNlaG9sZGVyKCkgfHwgJyc7XG4gICAgY29uc3QgZW5kID0gdGhpcy5fZW5kSW5wdXQ/Ll9nZXRQbGFjZWhvbGRlcigpIHx8ICcnO1xuICAgIHJldHVybiBzdGFydCB8fCBlbmQgPyBgJHtzdGFydH0gJHt0aGlzLnNlcGFyYXRvcn0gJHtlbmR9YCA6ICcnO1xuICB9XG5cbiAgLyoqIFRoZSByYW5nZSBwaWNrZXIgdGhhdCB0aGlzIGlucHV0IGlzIGFzc29jaWF0ZWQgd2l0aC4gKi9cbiAgQElucHV0KClcbiAgZ2V0IHJhbmdlUGlja2VyKCkge1xuICAgIHJldHVybiB0aGlzLl9yYW5nZVBpY2tlcjtcbiAgfVxuICBzZXQgcmFuZ2VQaWNrZXIocmFuZ2VQaWNrZXI6IE1hdERhdGVwaWNrZXJQYW5lbDxNYXREYXRlcGlja2VyQ29udHJvbDxEPiwgRGF0ZVJhbmdlPEQ+LCBEPikge1xuICAgIGlmIChyYW5nZVBpY2tlcikge1xuICAgICAgdGhpcy5fbW9kZWwgPSByYW5nZVBpY2tlci5yZWdpc3RlcklucHV0KHRoaXMpO1xuICAgICAgdGhpcy5fcmFuZ2VQaWNrZXIgPSByYW5nZVBpY2tlcjtcbiAgICAgIHRoaXMuX2Nsb3NlZFN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICAgICAgdGhpcy5fY2xvc2VkU3Vic2NyaXB0aW9uID0gcmFuZ2VQaWNrZXIuY2xvc2VkU3RyZWFtLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgIHRoaXMuX3N0YXJ0SW5wdXQ/Ll9vblRvdWNoZWQoKTtcbiAgICAgICAgdGhpcy5fZW5kSW5wdXQ/Ll9vblRvdWNoZWQoKTtcbiAgICAgIH0pO1xuICAgICAgdGhpcy5fcmVnaXN0ZXJNb2RlbCh0aGlzLl9tb2RlbCEpO1xuICAgIH1cbiAgfVxuICBwcml2YXRlIF9yYW5nZVBpY2tlcjogTWF0RGF0ZXBpY2tlclBhbmVsPE1hdERhdGVwaWNrZXJDb250cm9sPEQ+LCBEYXRlUmFuZ2U8RD4sIEQ+O1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBpbnB1dCBpcyByZXF1aXJlZC4gKi9cbiAgQElucHV0KClcbiAgZ2V0IHJlcXVpcmVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAhIXRoaXMuX3JlcXVpcmVkO1xuICB9XG4gIHNldCByZXF1aXJlZCh2YWx1ZTogQm9vbGVhbklucHV0KSB7XG4gICAgdGhpcy5fcmVxdWlyZWQgPSBjb2VyY2VCb29sZWFuUHJvcGVydHkodmFsdWUpO1xuICB9XG4gIHByaXZhdGUgX3JlcXVpcmVkOiBib29sZWFuO1xuXG4gIC8qKiBGdW5jdGlvbiB0aGF0IGNhbiBiZSB1c2VkIHRvIGZpbHRlciBvdXQgZGF0ZXMgd2l0aGluIHRoZSBkYXRlIHJhbmdlIHBpY2tlci4gKi9cbiAgQElucHV0KClcbiAgZ2V0IGRhdGVGaWx0ZXIoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2RhdGVGaWx0ZXI7XG4gIH1cbiAgc2V0IGRhdGVGaWx0ZXIodmFsdWU6IERhdGVGaWx0ZXJGbjxEPikge1xuICAgIGNvbnN0IHN0YXJ0ID0gdGhpcy5fc3RhcnRJbnB1dDtcbiAgICBjb25zdCBlbmQgPSB0aGlzLl9lbmRJbnB1dDtcbiAgICBjb25zdCB3YXNNYXRjaGluZ1N0YXJ0ID0gc3RhcnQgJiYgc3RhcnQuX21hdGNoZXNGaWx0ZXIoc3RhcnQudmFsdWUpO1xuICAgIGNvbnN0IHdhc01hdGNoaW5nRW5kID0gZW5kICYmIGVuZC5fbWF0Y2hlc0ZpbHRlcihzdGFydC52YWx1ZSk7XG4gICAgdGhpcy5fZGF0ZUZpbHRlciA9IHZhbHVlO1xuXG4gICAgaWYgKHN0YXJ0ICYmIHN0YXJ0Ll9tYXRjaGVzRmlsdGVyKHN0YXJ0LnZhbHVlKSAhPT0gd2FzTWF0Y2hpbmdTdGFydCkge1xuICAgICAgc3RhcnQuX3ZhbGlkYXRvck9uQ2hhbmdlKCk7XG4gICAgfVxuXG4gICAgaWYgKGVuZCAmJiBlbmQuX21hdGNoZXNGaWx0ZXIoZW5kLnZhbHVlKSAhPT0gd2FzTWF0Y2hpbmdFbmQpIHtcbiAgICAgIGVuZC5fdmFsaWRhdG9yT25DaGFuZ2UoKTtcbiAgICB9XG4gIH1cbiAgcHJpdmF0ZSBfZGF0ZUZpbHRlcjogRGF0ZUZpbHRlckZuPEQ+O1xuXG4gIC8qKiBUaGUgbWluaW11bSB2YWxpZCBkYXRlLiAqL1xuICBASW5wdXQoKVxuICBnZXQgbWluKCk6IEQgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5fbWluO1xuICB9XG4gIHNldCBtaW4odmFsdWU6IEQgfCBudWxsKSB7XG4gICAgY29uc3QgdmFsaWRWYWx1ZSA9IHRoaXMuX2RhdGVBZGFwdGVyLmdldFZhbGlkRGF0ZU9yTnVsbCh0aGlzLl9kYXRlQWRhcHRlci5kZXNlcmlhbGl6ZSh2YWx1ZSkpO1xuXG4gICAgaWYgKCF0aGlzLl9kYXRlQWRhcHRlci5zYW1lRGF0ZSh2YWxpZFZhbHVlLCB0aGlzLl9taW4pKSB7XG4gICAgICB0aGlzLl9taW4gPSB2YWxpZFZhbHVlO1xuICAgICAgdGhpcy5fcmV2YWxpZGF0ZSgpO1xuICAgIH1cbiAgfVxuICBwcml2YXRlIF9taW46IEQgfCBudWxsO1xuXG4gIC8qKiBUaGUgbWF4aW11bSB2YWxpZCBkYXRlLiAqL1xuICBASW5wdXQoKVxuICBnZXQgbWF4KCk6IEQgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5fbWF4O1xuICB9XG4gIHNldCBtYXgodmFsdWU6IEQgfCBudWxsKSB7XG4gICAgY29uc3QgdmFsaWRWYWx1ZSA9IHRoaXMuX2RhdGVBZGFwdGVyLmdldFZhbGlkRGF0ZU9yTnVsbCh0aGlzLl9kYXRlQWRhcHRlci5kZXNlcmlhbGl6ZSh2YWx1ZSkpO1xuXG4gICAgaWYgKCF0aGlzLl9kYXRlQWRhcHRlci5zYW1lRGF0ZSh2YWxpZFZhbHVlLCB0aGlzLl9tYXgpKSB7XG4gICAgICB0aGlzLl9tYXggPSB2YWxpZFZhbHVlO1xuICAgICAgdGhpcy5fcmV2YWxpZGF0ZSgpO1xuICAgIH1cbiAgfVxuICBwcml2YXRlIF9tYXg6IEQgfCBudWxsO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBpbnB1dCBpcyBkaXNhYmxlZC4gKi9cbiAgQElucHV0KClcbiAgZ2V0IGRpc2FibGVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9zdGFydElucHV0ICYmIHRoaXMuX2VuZElucHV0XG4gICAgICA/IHRoaXMuX3N0YXJ0SW5wdXQuZGlzYWJsZWQgJiYgdGhpcy5fZW5kSW5wdXQuZGlzYWJsZWRcbiAgICAgIDogdGhpcy5fZ3JvdXBEaXNhYmxlZDtcbiAgfVxuICBzZXQgZGlzYWJsZWQodmFsdWU6IEJvb2xlYW5JbnB1dCkge1xuICAgIGNvbnN0IG5ld1ZhbHVlID0gY29lcmNlQm9vbGVhblByb3BlcnR5KHZhbHVlKTtcblxuICAgIGlmIChuZXdWYWx1ZSAhPT0gdGhpcy5fZ3JvdXBEaXNhYmxlZCkge1xuICAgICAgdGhpcy5fZ3JvdXBEaXNhYmxlZCA9IG5ld1ZhbHVlO1xuICAgICAgdGhpcy5zdGF0ZUNoYW5nZXMubmV4dCh1bmRlZmluZWQpO1xuICAgIH1cbiAgfVxuICBfZ3JvdXBEaXNhYmxlZCA9IGZhbHNlO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBpbnB1dCBpcyBpbiBhbiBlcnJvciBzdGF0ZS4gKi9cbiAgZ2V0IGVycm9yU3RhdGUoKTogYm9vbGVhbiB7XG4gICAgaWYgKHRoaXMuX3N0YXJ0SW5wdXQgJiYgdGhpcy5fZW5kSW5wdXQpIHtcbiAgICAgIHJldHVybiB0aGlzLl9zdGFydElucHV0LmVycm9yU3RhdGUgfHwgdGhpcy5fZW5kSW5wdXQuZXJyb3JTdGF0ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKiogV2hldGhlciB0aGUgZGF0ZXBpY2tlciBpbnB1dCBpcyBlbXB0eS4gKi9cbiAgZ2V0IGVtcHR5KCk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHN0YXJ0RW1wdHkgPSB0aGlzLl9zdGFydElucHV0ID8gdGhpcy5fc3RhcnRJbnB1dC5pc0VtcHR5KCkgOiBmYWxzZTtcbiAgICBjb25zdCBlbmRFbXB0eSA9IHRoaXMuX2VuZElucHV0ID8gdGhpcy5fZW5kSW5wdXQuaXNFbXB0eSgpIDogZmFsc2U7XG4gICAgcmV0dXJuIHN0YXJ0RW1wdHkgJiYgZW5kRW1wdHk7XG4gIH1cblxuICAvKiogVmFsdWUgZm9yIHRoZSBgYXJpYS1kZXNjcmliZWRieWAgYXR0cmlidXRlIG9mIHRoZSBpbnB1dHMuICovXG4gIF9hcmlhRGVzY3JpYmVkQnk6IHN0cmluZyB8IG51bGwgPSBudWxsO1xuXG4gIC8qKiBEYXRlIHNlbGVjdGlvbiBtb2RlbCBjdXJyZW50bHkgcmVnaXN0ZXJlZCB3aXRoIHRoZSBpbnB1dC4gKi9cbiAgcHJpdmF0ZSBfbW9kZWw6IE1hdERhdGVTZWxlY3Rpb25Nb2RlbDxEYXRlUmFuZ2U8RD4+IHwgdW5kZWZpbmVkO1xuXG4gIC8qKiBTZXBhcmF0b3IgdGV4dCB0byBiZSBzaG93biBiZXR3ZWVuIHRoZSBpbnB1dHMuICovXG4gIEBJbnB1dCgpIHNlcGFyYXRvciA9ICfigJMnO1xuXG4gIC8qKiBTdGFydCBvZiB0aGUgY29tcGFyaXNvbiByYW5nZSB0aGF0IHNob3VsZCBiZSBzaG93biBpbiB0aGUgY2FsZW5kYXIuICovXG4gIEBJbnB1dCgpIGNvbXBhcmlzb25TdGFydDogRCB8IG51bGwgPSBudWxsO1xuXG4gIC8qKiBFbmQgb2YgdGhlIGNvbXBhcmlzb24gcmFuZ2UgdGhhdCBzaG91bGQgYmUgc2hvd24gaW4gdGhlIGNhbGVuZGFyLiAqL1xuICBASW5wdXQoKSBjb21wYXJpc29uRW5kOiBEIHwgbnVsbCA9IG51bGw7XG5cbiAgQENvbnRlbnRDaGlsZChNYXRTdGFydERhdGUpIF9zdGFydElucHV0OiBNYXRTdGFydERhdGU8RD47XG4gIEBDb250ZW50Q2hpbGQoTWF0RW5kRGF0ZSkgX2VuZElucHV0OiBNYXRFbmREYXRlPEQ+O1xuXG4gIC8qKlxuICAgKiBJbXBsZW1lbnRlZCBhcyBhIHBhcnQgb2YgYE1hdEZvcm1GaWVsZENvbnRyb2xgLlxuICAgKiBUT0RPKGNyaXNiZXRvKTogY2hhbmdlIHR5cGUgdG8gYEFic3RyYWN0Q29udHJvbERpcmVjdGl2ZWAgYWZ0ZXIgIzE4MjA2IGxhbmRzLlxuICAgKiBAZG9jcy1wcml2YXRlXG4gICAqL1xuICBuZ0NvbnRyb2w6IE5nQ29udHJvbCB8IG51bGw7XG5cbiAgLyoqIEVtaXRzIHdoZW4gdGhlIGlucHV0J3Mgc3RhdGUgaGFzIGNoYW5nZWQuICovXG4gIHJlYWRvbmx5IHN0YXRlQ2hhbmdlcyA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBfY2hhbmdlRGV0ZWN0b3JSZWY6IENoYW5nZURldGVjdG9yUmVmLFxuICAgIHByaXZhdGUgX2VsZW1lbnRSZWY6IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+LFxuICAgIEBPcHRpb25hbCgpIEBTZWxmKCkgY29udHJvbDogQ29udHJvbENvbnRhaW5lcixcbiAgICBAT3B0aW9uYWwoKSBwcml2YXRlIF9kYXRlQWRhcHRlcjogRGF0ZUFkYXB0ZXI8RD4sXG4gICAgQE9wdGlvbmFsKCkgQEluamVjdChNQVRfRk9STV9GSUVMRCkgcHJpdmF0ZSBfZm9ybUZpZWxkPzogX01hdEZvcm1GaWVsZFBhcnRpYWwsXG4gICkge1xuICAgIGlmICghX2RhdGVBZGFwdGVyICYmICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpKSB7XG4gICAgICB0aHJvdyBjcmVhdGVNaXNzaW5nRGF0ZUltcGxFcnJvcignRGF0ZUFkYXB0ZXInKTtcbiAgICB9XG5cbiAgICAvLyBUaGUgZGF0ZXBpY2tlciBtb2R1bGUgY2FuIGJlIHVzZWQgYm90aCB3aXRoIE1EQyBhbmQgbm9uLU1EQyBmb3JtIGZpZWxkcy4gV2UgaGF2ZVxuICAgIC8vIHRvIGNvbmRpdGlvbmFsbHkgYWRkIHRoZSBNREMgaW5wdXQgY2xhc3Mgc28gdGhhdCB0aGUgcmFuZ2UgcGlja2VyIGxvb2tzIGNvcnJlY3RseS5cbiAgICBpZiAoX2Zvcm1GaWVsZD8uX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ21hdC1tZGMtZm9ybS1maWVsZCcpKSB7XG4gICAgICBjb25zdCBjbGFzc0xpc3QgPSBfZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LmNsYXNzTGlzdDtcbiAgICAgIGNsYXNzTGlzdC5hZGQoJ21hdC1tZGMtaW5wdXQtZWxlbWVudCcpO1xuICAgICAgY2xhc3NMaXN0LmFkZCgnbWF0LW1kYy1mb3JtLWZpZWxkLWlucHV0LWNvbnRyb2wnKTtcbiAgICB9XG5cbiAgICAvLyBUT0RPKGNyaXNiZXRvKTogcmVtb3ZlIGBhcyBhbnlgIGFmdGVyICMxODIwNiBsYW5kcy5cbiAgICB0aGlzLm5nQ29udHJvbCA9IGNvbnRyb2wgYXMgYW55O1xuICB9XG5cbiAgLyoqXG4gICAqIEltcGxlbWVudGVkIGFzIGEgcGFydCBvZiBgTWF0Rm9ybUZpZWxkQ29udHJvbGAuXG4gICAqIEBkb2NzLXByaXZhdGVcbiAgICovXG4gIHNldERlc2NyaWJlZEJ5SWRzKGlkczogc3RyaW5nW10pOiB2b2lkIHtcbiAgICB0aGlzLl9hcmlhRGVzY3JpYmVkQnkgPSBpZHMubGVuZ3RoID8gaWRzLmpvaW4oJyAnKSA6IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogSW1wbGVtZW50ZWQgYXMgYSBwYXJ0IG9mIGBNYXRGb3JtRmllbGRDb250cm9sYC5cbiAgICogQGRvY3MtcHJpdmF0ZVxuICAgKi9cbiAgb25Db250YWluZXJDbGljaygpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuZm9jdXNlZCAmJiAhdGhpcy5kaXNhYmxlZCkge1xuICAgICAgaWYgKCF0aGlzLl9tb2RlbCB8fCAhdGhpcy5fbW9kZWwuc2VsZWN0aW9uLnN0YXJ0KSB7XG4gICAgICAgIHRoaXMuX3N0YXJ0SW5wdXQuZm9jdXMoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX2VuZElucHV0LmZvY3VzKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgbmdBZnRlckNvbnRlbnRJbml0KCkge1xuICAgIGlmICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpIHtcbiAgICAgIGlmICghdGhpcy5fc3RhcnRJbnB1dCkge1xuICAgICAgICB0aHJvdyBFcnJvcignbWF0LWRhdGUtcmFuZ2UtaW5wdXQgbXVzdCBjb250YWluIGEgbWF0U3RhcnREYXRlIGlucHV0Jyk7XG4gICAgICB9XG5cbiAgICAgIGlmICghdGhpcy5fZW5kSW5wdXQpIHtcbiAgICAgICAgdGhyb3cgRXJyb3IoJ21hdC1kYXRlLXJhbmdlLWlucHV0IG11c3QgY29udGFpbiBhIG1hdEVuZERhdGUgaW5wdXQnKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5fbW9kZWwpIHtcbiAgICAgIHRoaXMuX3JlZ2lzdGVyTW9kZWwodGhpcy5fbW9kZWwpO1xuICAgIH1cblxuICAgIC8vIFdlIGRvbid0IG5lZWQgdG8gdW5zdWJzY3JpYmUgZnJvbSB0aGlzLCBiZWNhdXNlIHdlXG4gICAgLy8ga25vdyB0aGF0IHRoZSBpbnB1dCBzdHJlYW1zIHdpbGwgYmUgY29tcGxldGVkIG9uIGRlc3Ryb3kuXG4gICAgbWVyZ2UodGhpcy5fc3RhcnRJbnB1dC5zdGF0ZUNoYW5nZXMsIHRoaXMuX2VuZElucHV0LnN0YXRlQ2hhbmdlcykuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgIHRoaXMuc3RhdGVDaGFuZ2VzLm5leHQodW5kZWZpbmVkKTtcbiAgICB9KTtcbiAgfVxuXG4gIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpIHtcbiAgICBpZiAoZGF0ZUlucHV0c0hhdmVDaGFuZ2VkKGNoYW5nZXMsIHRoaXMuX2RhdGVBZGFwdGVyKSkge1xuICAgICAgdGhpcy5zdGF0ZUNoYW5nZXMubmV4dCh1bmRlZmluZWQpO1xuICAgIH1cbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIHRoaXMuX2Nsb3NlZFN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICAgIHRoaXMuc3RhdGVDaGFuZ2VzLmNvbXBsZXRlKCk7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgZGF0ZSBhdCB3aGljaCB0aGUgY2FsZW5kYXIgc2hvdWxkIHN0YXJ0LiAqL1xuICBnZXRTdGFydFZhbHVlKCk6IEQgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy52YWx1ZSA/IHRoaXMudmFsdWUuc3RhcnQgOiBudWxsO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIGlucHV0J3MgdGhlbWUgcGFsZXR0ZS4gKi9cbiAgZ2V0VGhlbWVQYWxldHRlKCk6IFRoZW1lUGFsZXR0ZSB7XG4gICAgcmV0dXJuIHRoaXMuX2Zvcm1GaWVsZCA/IHRoaXMuX2Zvcm1GaWVsZC5jb2xvciA6IHVuZGVmaW5lZDtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBlbGVtZW50IHRvIHdoaWNoIHRoZSBjYWxlbmRhciBvdmVybGF5IHNob3VsZCBiZSBhdHRhY2hlZC4gKi9cbiAgZ2V0Q29ubmVjdGVkT3ZlcmxheU9yaWdpbigpOiBFbGVtZW50UmVmIHtcbiAgICByZXR1cm4gdGhpcy5fZm9ybUZpZWxkID8gdGhpcy5fZm9ybUZpZWxkLmdldENvbm5lY3RlZE92ZXJsYXlPcmlnaW4oKSA6IHRoaXMuX2VsZW1lbnRSZWY7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgSUQgb2YgYW4gZWxlbWVudCB0aGF0IHNob3VsZCBiZSB1c2VkIGEgZGVzY3JpcHRpb24gZm9yIHRoZSBjYWxlbmRhciBvdmVybGF5LiAqL1xuICBnZXRPdmVybGF5TGFiZWxJZCgpOiBzdHJpbmcgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5fZm9ybUZpZWxkID8gdGhpcy5fZm9ybUZpZWxkLmdldExhYmVsSWQoKSA6IG51bGw7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgdmFsdWUgdGhhdCBpcyB1c2VkIHRvIG1pcnJvciB0aGUgc3RhdGUgaW5wdXQuICovXG4gIF9nZXRJbnB1dE1pcnJvclZhbHVlKHBhcnQ6ICdzdGFydCcgfCAnZW5kJykge1xuICAgIGNvbnN0IGlucHV0ID0gcGFydCA9PT0gJ3N0YXJ0JyA/IHRoaXMuX3N0YXJ0SW5wdXQgOiB0aGlzLl9lbmRJbnB1dDtcbiAgICByZXR1cm4gaW5wdXQgPyBpbnB1dC5nZXRNaXJyb3JWYWx1ZSgpIDogJyc7XG4gIH1cblxuICAvKiogV2hldGhlciB0aGUgaW5wdXQgcGxhY2Vob2xkZXJzIHNob3VsZCBiZSBoaWRkZW4uICovXG4gIF9zaG91bGRIaWRlUGxhY2Vob2xkZXJzKCkge1xuICAgIHJldHVybiB0aGlzLl9zdGFydElucHV0ID8gIXRoaXMuX3N0YXJ0SW5wdXQuaXNFbXB0eSgpIDogZmFsc2U7XG4gIH1cblxuICAvKiogSGFuZGxlcyB0aGUgdmFsdWUgaW4gb25lIG9mIHRoZSBjaGlsZCBpbnB1dHMgY2hhbmdpbmcuICovXG4gIF9oYW5kbGVDaGlsZFZhbHVlQ2hhbmdlKCkge1xuICAgIHRoaXMuc3RhdGVDaGFuZ2VzLm5leHQodW5kZWZpbmVkKTtcbiAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZi5tYXJrRm9yQ2hlY2soKTtcbiAgfVxuXG4gIC8qKiBPcGVucyB0aGUgZGF0ZSByYW5nZSBwaWNrZXIgYXNzb2NpYXRlZCB3aXRoIHRoZSBpbnB1dC4gKi9cbiAgX29wZW5EYXRlcGlja2VyKCkge1xuICAgIGlmICh0aGlzLl9yYW5nZVBpY2tlcikge1xuICAgICAgdGhpcy5fcmFuZ2VQaWNrZXIub3BlbigpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZSBzZXBhcmF0ZSB0ZXh0IHNob3VsZCBiZSBoaWRkZW4uICovXG4gIF9zaG91bGRIaWRlU2VwYXJhdG9yKCkge1xuICAgIHJldHVybiAoXG4gICAgICAoIXRoaXMuX2Zvcm1GaWVsZCB8fFxuICAgICAgICAodGhpcy5fZm9ybUZpZWxkLmdldExhYmVsSWQoKSAmJiAhdGhpcy5fZm9ybUZpZWxkLl9zaG91bGRMYWJlbEZsb2F0KCkpKSAmJlxuICAgICAgdGhpcy5lbXB0eVxuICAgICk7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgdmFsdWUgZm9yIHRoZSBgYXJpYS1sYWJlbGxlZGJ5YCBhdHRyaWJ1dGUgb2YgdGhlIGlucHV0cy4gKi9cbiAgX2dldEFyaWFMYWJlbGxlZGJ5KCkge1xuICAgIGNvbnN0IGZvcm1GaWVsZCA9IHRoaXMuX2Zvcm1GaWVsZDtcbiAgICByZXR1cm4gZm9ybUZpZWxkICYmIGZvcm1GaWVsZC5faGFzRmxvYXRpbmdMYWJlbCgpID8gZm9ybUZpZWxkLl9sYWJlbElkIDogbnVsbDtcbiAgfVxuXG4gIF9nZXRTdGFydERhdGVBY2Nlc3NpYmxlTmFtZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9zdGFydElucHV0Ll9nZXRBY2Nlc3NpYmxlTmFtZSgpO1xuICB9XG5cbiAgX2dldEVuZERhdGVBY2Nlc3NpYmxlTmFtZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9lbmRJbnB1dC5fZ2V0QWNjZXNzaWJsZU5hbWUoKTtcbiAgfVxuXG4gIC8qKiBVcGRhdGVzIHRoZSBmb2N1c2VkIHN0YXRlIG9mIHRoZSByYW5nZSBpbnB1dC4gKi9cbiAgX3VwZGF0ZUZvY3VzKG9yaWdpbjogRm9jdXNPcmlnaW4pIHtcbiAgICB0aGlzLmZvY3VzZWQgPSBvcmlnaW4gIT09IG51bGw7XG4gICAgdGhpcy5zdGF0ZUNoYW5nZXMubmV4dCgpO1xuICB9XG5cbiAgLyoqIFJlLXJ1bnMgdGhlIHZhbGlkYXRvcnMgb24gdGhlIHN0YXJ0L2VuZCBpbnB1dHMuICovXG4gIHByaXZhdGUgX3JldmFsaWRhdGUoKSB7XG4gICAgaWYgKHRoaXMuX3N0YXJ0SW5wdXQpIHtcbiAgICAgIHRoaXMuX3N0YXJ0SW5wdXQuX3ZhbGlkYXRvck9uQ2hhbmdlKCk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2VuZElucHV0KSB7XG4gICAgICB0aGlzLl9lbmRJbnB1dC5fdmFsaWRhdG9yT25DaGFuZ2UoKTtcbiAgICB9XG4gIH1cblxuICAvKiogUmVnaXN0ZXJzIHRoZSBjdXJyZW50IGRhdGUgc2VsZWN0aW9uIG1vZGVsIHdpdGggdGhlIHN0YXJ0L2VuZCBpbnB1dHMuICovXG4gIHByaXZhdGUgX3JlZ2lzdGVyTW9kZWwobW9kZWw6IE1hdERhdGVTZWxlY3Rpb25Nb2RlbDxEYXRlUmFuZ2U8RD4+KSB7XG4gICAgaWYgKHRoaXMuX3N0YXJ0SW5wdXQpIHtcbiAgICAgIHRoaXMuX3N0YXJ0SW5wdXQuX3JlZ2lzdGVyTW9kZWwobW9kZWwpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9lbmRJbnB1dCkge1xuICAgICAgdGhpcy5fZW5kSW5wdXQuX3JlZ2lzdGVyTW9kZWwobW9kZWwpO1xuICAgIH1cbiAgfVxufVxuIiwiPGRpdlxuICBjbGFzcz1cIm1hdC1kYXRlLXJhbmdlLWlucHV0LWNvbnRhaW5lclwiXG4gIGNka01vbml0b3JTdWJ0cmVlRm9jdXNcbiAgKGNka0ZvY3VzQ2hhbmdlKT1cIl91cGRhdGVGb2N1cygkZXZlbnQpXCI+XG4gIDxkaXYgY2xhc3M9XCJtYXQtZGF0ZS1yYW5nZS1pbnB1dC13cmFwcGVyXCI+XG4gICAgPG5nLWNvbnRlbnQgc2VsZWN0PVwiaW5wdXRbbWF0U3RhcnREYXRlXVwiPjwvbmctY29udGVudD5cbiAgICA8c3BhblxuICAgICAgY2xhc3M9XCJtYXQtZGF0ZS1yYW5nZS1pbnB1dC1taXJyb3JcIlxuICAgICAgYXJpYS1oaWRkZW49XCJ0cnVlXCI+e3tfZ2V0SW5wdXRNaXJyb3JWYWx1ZSgnc3RhcnQnKX19PC9zcGFuPlxuICA8L2Rpdj5cblxuICA8c3BhblxuICAgIGNsYXNzPVwibWF0LWRhdGUtcmFuZ2UtaW5wdXQtc2VwYXJhdG9yXCJcbiAgICBbY2xhc3MubWF0LWRhdGUtcmFuZ2UtaW5wdXQtc2VwYXJhdG9yLWhpZGRlbl09XCJfc2hvdWxkSGlkZVNlcGFyYXRvcigpXCI+e3tzZXBhcmF0b3J9fTwvc3Bhbj5cblxuICA8ZGl2IGNsYXNzPVwibWF0LWRhdGUtcmFuZ2UtaW5wdXQtd3JhcHBlciBtYXQtZGF0ZS1yYW5nZS1pbnB1dC1lbmQtd3JhcHBlclwiPlxuICAgIDxuZy1jb250ZW50IHNlbGVjdD1cImlucHV0W21hdEVuZERhdGVdXCI+PC9uZy1jb250ZW50PlxuICAgIDxzcGFuXG4gICAgICBjbGFzcz1cIm1hdC1kYXRlLXJhbmdlLWlucHV0LW1pcnJvclwiXG4gICAgICBhcmlhLWhpZGRlbj1cInRydWVcIj57e19nZXRJbnB1dE1pcnJvclZhbHVlKCdlbmQnKX19PC9zcGFuPlxuICA8L2Rpdj5cbjwvZGl2PlxuXG4iXX0=