/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, forwardRef, Input } from '@angular/core';
import { emailValidator, maxLengthValidator, maxValidator, minLengthValidator, minValidator, NG_VALIDATORS, nullValidator, patternValidator, requiredTrueValidator, requiredValidator } from '../validators';
/**
 * A base class for Validator-based Directives. The class contains common logic shared across such
 * Directives.
 *
 * For internal use only, this class is not intended for use outside of the Forms package.
 */
class AbstractValidatorDirective {
    constructor() {
        this._validator = nullValidator;
    }
    /**
     * Helper function invoked from child classes to process changes (from `ngOnChanges` hook).
     * @nodoc
     */
    handleChanges(changes) {
        if (this.inputName in changes) {
            const input = this.normalizeInput(changes[this.inputName].currentValue);
            this._validator = this.createValidator(input);
            if (this._onChange) {
                this._onChange();
            }
        }
    }
    /** @nodoc */
    validate(control) {
        return this._validator(control);
    }
    /** @nodoc */
    registerOnValidatorChange(fn) {
        this._onChange = fn;
    }
}
AbstractValidatorDirective.decorators = [
    { type: Directive }
];
/**
 * @description
 * Provider which adds `MaxValidator` to the `NG_VALIDATORS` multi-provider list.
 */
export const MAX_VALIDATOR = {
    provide: NG_VALIDATORS,
    useExisting: forwardRef(() => MaxValidator),
    multi: true
};
/**
 * A directive which installs the {@link MaxValidator} for any `formControlName`,
 * `formControl`, or control with `ngModel` that also has a `max` attribute.
 *
 * @see [Form Validation](guide/form-validation)
 *
 * @usageNotes
 *
 * ### Adding a max validator
 *
 * The following example shows how to add a max validator to an input attached to an
 * ngModel binding.
 *
 * ```html
 * <input type="number" ngModel max="4">
 * ```
 *
 * @ngModule ReactiveFormsModule
 * @ngModule FormsModule
 * @publicApi
 */
export class MaxValidator extends AbstractValidatorDirective {
    constructor() {
        super(...arguments);
        /** @internal */
        this.inputName = 'max';
        /** @internal */
        this.normalizeInput = (input) => parseFloat(input);
        /** @internal */
        this.createValidator = (max) => maxValidator(max);
    }
    /**
     * Declare `ngOnChanges` lifecycle hook at the main directive level (vs keeping it in base class)
     * to avoid differences in handling inheritance of lifecycle hooks between Ivy and ViewEngine in
     * AOT mode. This could be refactored once ViewEngine is removed.
     * @nodoc
     */
    ngOnChanges(changes) {
        this.handleChanges(changes);
    }
}
MaxValidator.decorators = [
    { type: Directive, args: [{
                selector: 'input[type=number][max][formControlName],input[type=number][max][formControl],input[type=number][max][ngModel]',
                providers: [MAX_VALIDATOR],
                host: { '[attr.max]': 'max ? max : null' }
            },] }
];
MaxValidator.propDecorators = {
    max: [{ type: Input }]
};
/**
 * @description
 * Provider which adds `MinValidator` to the `NG_VALIDATORS` multi-provider list.
 */
export const MIN_VALIDATOR = {
    provide: NG_VALIDATORS,
    useExisting: forwardRef(() => MinValidator),
    multi: true
};
/**
 * A directive which installs the {@link MinValidator} for any `formControlName`,
 * `formControl`, or control with `ngModel` that also has a `min` attribute.
 *
 * @see [Form Validation](guide/form-validation)
 *
 * @usageNotes
 *
 * ### Adding a min validator
 *
 * The following example shows how to add a min validator to an input attached to an
 * ngModel binding.
 *
 * ```html
 * <input type="number" ngModel min="4">
 * ```
 *
 * @ngModule ReactiveFormsModule
 * @ngModule FormsModule
 * @publicApi
 */
export class MinValidator extends AbstractValidatorDirective {
    constructor() {
        super(...arguments);
        /** @internal */
        this.inputName = 'min';
        /** @internal */
        this.normalizeInput = (input) => parseFloat(input);
        /** @internal */
        this.createValidator = (min) => minValidator(min);
    }
    /**
     * Declare `ngOnChanges` lifecycle hook at the main directive level (vs keeping it in base class)
     * to avoid differences in handling inheritance of lifecycle hooks between Ivy and ViewEngine in
     * AOT mode. This could be refactored once ViewEngine is removed.
     * @nodoc
     */
    ngOnChanges(changes) {
        this.handleChanges(changes);
    }
}
MinValidator.decorators = [
    { type: Directive, args: [{
                selector: 'input[type=number][min][formControlName],input[type=number][min][formControl],input[type=number][min][ngModel]',
                providers: [MIN_VALIDATOR],
                host: { '[attr.min]': 'min ? min : null' }
            },] }
];
MinValidator.propDecorators = {
    min: [{ type: Input }]
};
/**
 * @description
 * Provider which adds `RequiredValidator` to the `NG_VALIDATORS` multi-provider list.
 */
export const REQUIRED_VALIDATOR = {
    provide: NG_VALIDATORS,
    useExisting: forwardRef(() => RequiredValidator),
    multi: true
};
/**
 * @description
 * Provider which adds `CheckboxRequiredValidator` to the `NG_VALIDATORS` multi-provider list.
 */
export const CHECKBOX_REQUIRED_VALIDATOR = {
    provide: NG_VALIDATORS,
    useExisting: forwardRef(() => CheckboxRequiredValidator),
    multi: true
};
/**
 * @description
 * A directive that adds the `required` validator to any controls marked with the
 * `required` attribute. The directive is provided with the `NG_VALIDATORS` multi-provider list.
 *
 * @see [Form Validation](guide/form-validation)
 *
 * @usageNotes
 *
 * ### Adding a required validator using template-driven forms
 *
 * ```
 * <input name="fullName" ngModel required>
 * ```
 *
 * @ngModule FormsModule
 * @ngModule ReactiveFormsModule
 * @publicApi
 */
export class RequiredValidator {
    constructor() {
        this._required = false;
    }
    /**
     * @description
     * Tracks changes to the required attribute bound to this directive.
     */
    get required() {
        return this._required;
    }
    set required(value) {
        this._required = value != null && value !== false && `${value}` !== 'false';
        if (this._onChange)
            this._onChange();
    }
    /**
     * Method that validates whether the control is empty.
     * Returns the validation result if enabled, otherwise null.
     * @nodoc
     */
    validate(control) {
        return this.required ? requiredValidator(control) : null;
    }
    /**
     * Registers a callback function to call when the validator inputs change.
     * @nodoc
     */
    registerOnValidatorChange(fn) {
        this._onChange = fn;
    }
}
RequiredValidator.decorators = [
    { type: Directive, args: [{
                selector: ':not([type=checkbox])[required][formControlName],:not([type=checkbox])[required][formControl],:not([type=checkbox])[required][ngModel]',
                providers: [REQUIRED_VALIDATOR],
                host: { '[attr.required]': 'required ? "" : null' }
            },] }
];
RequiredValidator.propDecorators = {
    required: [{ type: Input }]
};
/**
 * A Directive that adds the `required` validator to checkbox controls marked with the
 * `required` attribute. The directive is provided with the `NG_VALIDATORS` multi-provider list.
 *
 * @see [Form Validation](guide/form-validation)
 *
 * @usageNotes
 *
 * ### Adding a required checkbox validator using template-driven forms
 *
 * The following example shows how to add a checkbox required validator to an input attached to an
 * ngModel binding.
 *
 * ```
 * <input type="checkbox" name="active" ngModel required>
 * ```
 *
 * @publicApi
 * @ngModule FormsModule
 * @ngModule ReactiveFormsModule
 */
export class CheckboxRequiredValidator extends RequiredValidator {
    /**
     * Method that validates whether or not the checkbox has been checked.
     * Returns the validation result if enabled, otherwise null.
     * @nodoc
     */
    validate(control) {
        return this.required ? requiredTrueValidator(control) : null;
    }
}
CheckboxRequiredValidator.decorators = [
    { type: Directive, args: [{
                selector: 'input[type=checkbox][required][formControlName],input[type=checkbox][required][formControl],input[type=checkbox][required][ngModel]',
                providers: [CHECKBOX_REQUIRED_VALIDATOR],
                host: { '[attr.required]': 'required ? "" : null' }
            },] }
];
/**
 * @description
 * Provider which adds `EmailValidator` to the `NG_VALIDATORS` multi-provider list.
 */
export const EMAIL_VALIDATOR = {
    provide: NG_VALIDATORS,
    useExisting: forwardRef(() => EmailValidator),
    multi: true
};
/**
 * A directive that adds the `email` validator to controls marked with the
 * `email` attribute. The directive is provided with the `NG_VALIDATORS` multi-provider list.
 *
 * @see [Form Validation](guide/form-validation)
 *
 * @usageNotes
 *
 * ### Adding an email validator
 *
 * The following example shows how to add an email validator to an input attached to an ngModel
 * binding.
 *
 * ```
 * <input type="email" name="email" ngModel email>
 * <input type="email" name="email" ngModel email="true">
 * <input type="email" name="email" ngModel [email]="true">
 * ```
 *
 * @publicApi
 * @ngModule FormsModule
 * @ngModule ReactiveFormsModule
 */
export class EmailValidator {
    constructor() {
        this._enabled = false;
    }
    /**
     * @description
     * Tracks changes to the email attribute bound to this directive.
     */
    set email(value) {
        this._enabled = value === '' || value === true || value === 'true';
        if (this._onChange)
            this._onChange();
    }
    /**
     * Method that validates whether an email address is valid.
     * Returns the validation result if enabled, otherwise null.
     * @nodoc
     */
    validate(control) {
        return this._enabled ? emailValidator(control) : null;
    }
    /**
     * Registers a callback function to call when the validator inputs change.
     * @nodoc
     */
    registerOnValidatorChange(fn) {
        this._onChange = fn;
    }
}
EmailValidator.decorators = [
    { type: Directive, args: [{
                selector: '[email][formControlName],[email][formControl],[email][ngModel]',
                providers: [EMAIL_VALIDATOR]
            },] }
];
EmailValidator.propDecorators = {
    email: [{ type: Input }]
};
/**
 * @description
 * Provider which adds `MinLengthValidator` to the `NG_VALIDATORS` multi-provider list.
 */
export const MIN_LENGTH_VALIDATOR = {
    provide: NG_VALIDATORS,
    useExisting: forwardRef(() => MinLengthValidator),
    multi: true
};
/**
 * A directive that adds minimum length validation to controls marked with the
 * `minlength` attribute. The directive is provided with the `NG_VALIDATORS` multi-provider list.
 *
 * @see [Form Validation](guide/form-validation)
 *
 * @usageNotes
 *
 * ### Adding a minimum length validator
 *
 * The following example shows how to add a minimum length validator to an input attached to an
 * ngModel binding.
 *
 * ```html
 * <input name="firstName" ngModel minlength="4">
 * ```
 *
 * @ngModule ReactiveFormsModule
 * @ngModule FormsModule
 * @publicApi
 */
export class MinLengthValidator {
    constructor() {
        this._validator = nullValidator;
    }
    /** @nodoc */
    ngOnChanges(changes) {
        if ('minlength' in changes) {
            this._createValidator();
            if (this._onChange)
                this._onChange();
        }
    }
    /**
     * Method that validates whether the value meets a minimum length requirement.
     * Returns the validation result if enabled, otherwise null.
     * @nodoc
     */
    validate(control) {
        return this.minlength == null ? null : this._validator(control);
    }
    /**
     * Registers a callback function to call when the validator inputs change.
     * @nodoc
     */
    registerOnValidatorChange(fn) {
        this._onChange = fn;
    }
    _createValidator() {
        this._validator = minLengthValidator(typeof this.minlength === 'number' ? this.minlength : parseInt(this.minlength, 10));
    }
}
MinLengthValidator.decorators = [
    { type: Directive, args: [{
                selector: '[minlength][formControlName],[minlength][formControl],[minlength][ngModel]',
                providers: [MIN_LENGTH_VALIDATOR],
                host: { '[attr.minlength]': 'minlength ? minlength : null' }
            },] }
];
MinLengthValidator.propDecorators = {
    minlength: [{ type: Input }]
};
/**
 * @description
 * Provider which adds `MaxLengthValidator` to the `NG_VALIDATORS` multi-provider list.
 */
export const MAX_LENGTH_VALIDATOR = {
    provide: NG_VALIDATORS,
    useExisting: forwardRef(() => MaxLengthValidator),
    multi: true
};
/**
 * A directive that adds max length validation to controls marked with the
 * `maxlength` attribute. The directive is provided with the `NG_VALIDATORS` multi-provider list.
 *
 * @see [Form Validation](guide/form-validation)
 *
 * @usageNotes
 *
 * ### Adding a maximum length validator
 *
 * The following example shows how to add a maximum length validator to an input attached to an
 * ngModel binding.
 *
 * ```html
 * <input name="firstName" ngModel maxlength="25">
 * ```
 *
 * @ngModule ReactiveFormsModule
 * @ngModule FormsModule
 * @publicApi
 */
export class MaxLengthValidator {
    constructor() {
        this._validator = nullValidator;
    }
    /** @nodoc */
    ngOnChanges(changes) {
        if ('maxlength' in changes) {
            this._createValidator();
            if (this._onChange)
                this._onChange();
        }
    }
    /**
     * Method that validates whether the value exceeds the maximum length requirement.
     * @nodoc
     */
    validate(control) {
        return this.maxlength != null ? this._validator(control) : null;
    }
    /**
     * Registers a callback function to call when the validator inputs change.
     * @nodoc
     */
    registerOnValidatorChange(fn) {
        this._onChange = fn;
    }
    _createValidator() {
        this._validator = maxLengthValidator(typeof this.maxlength === 'number' ? this.maxlength : parseInt(this.maxlength, 10));
    }
}
MaxLengthValidator.decorators = [
    { type: Directive, args: [{
                selector: '[maxlength][formControlName],[maxlength][formControl],[maxlength][ngModel]',
                providers: [MAX_LENGTH_VALIDATOR],
                host: { '[attr.maxlength]': 'maxlength ? maxlength : null' }
            },] }
];
MaxLengthValidator.propDecorators = {
    maxlength: [{ type: Input }]
};
/**
 * @description
 * Provider which adds `PatternValidator` to the `NG_VALIDATORS` multi-provider list.
 */
export const PATTERN_VALIDATOR = {
    provide: NG_VALIDATORS,
    useExisting: forwardRef(() => PatternValidator),
    multi: true
};
/**
 * @description
 * A directive that adds regex pattern validation to controls marked with the
 * `pattern` attribute. The regex must match the entire control value.
 * The directive is provided with the `NG_VALIDATORS` multi-provider list.
 *
 * @see [Form Validation](guide/form-validation)
 *
 * @usageNotes
 *
 * ### Adding a pattern validator
 *
 * The following example shows how to add a pattern validator to an input attached to an
 * ngModel binding.
 *
 * ```html
 * <input name="firstName" ngModel pattern="[a-zA-Z ]*">
 * ```
 *
 * @ngModule ReactiveFormsModule
 * @ngModule FormsModule
 * @publicApi
 */
export class PatternValidator {
    constructor() {
        this._validator = nullValidator;
    }
    /** @nodoc */
    ngOnChanges(changes) {
        if ('pattern' in changes) {
            this._createValidator();
            if (this._onChange)
                this._onChange();
        }
    }
    /**
     * Method that validates whether the value matches the pattern requirement.
     * @nodoc
     */
    validate(control) {
        return this._validator(control);
    }
    /**
     * Registers a callback function to call when the validator inputs change.
     * @nodoc
     */
    registerOnValidatorChange(fn) {
        this._onChange = fn;
    }
    _createValidator() {
        this._validator = patternValidator(this.pattern);
    }
}
PatternValidator.decorators = [
    { type: Directive, args: [{
                selector: '[pattern][formControlName],[pattern][formControl],[pattern][ngModel]',
                providers: [PATTERN_VALIDATOR],
                host: { '[attr.pattern]': 'pattern ? pattern : null' }
            },] }
];
PatternValidator.propDecorators = {
    pattern: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdG9ycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2Zvcm1zL3NyYy9kaXJlY3RpdmVzL3ZhbGlkYXRvcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUEyQyxNQUFNLGVBQWUsQ0FBQztBQUlyRyxPQUFPLEVBQUMsY0FBYyxFQUFFLGtCQUFrQixFQUFFLFlBQVksRUFBRSxrQkFBa0IsRUFBRSxZQUFZLEVBQUUsYUFBYSxFQUFFLGFBQWEsRUFBRSxnQkFBZ0IsRUFBRSxxQkFBcUIsRUFBRSxpQkFBaUIsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQTJEM007Ozs7O0dBS0c7QUFDSCxNQUNlLDBCQUEwQjtJQUR6QztRQUVVLGVBQVUsR0FBZ0IsYUFBYSxDQUFDO0lBcURsRCxDQUFDO0lBdkJDOzs7T0FHRztJQUNILGFBQWEsQ0FBQyxPQUFzQjtRQUNsQyxJQUFJLElBQUksQ0FBQyxTQUFTLElBQUksT0FBTyxFQUFFO1lBQzdCLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUN4RSxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDOUMsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFO2dCQUNsQixJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7YUFDbEI7U0FDRjtJQUNILENBQUM7SUFFRCxhQUFhO0lBQ2IsUUFBUSxDQUFDLE9BQXdCO1FBQy9CLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNsQyxDQUFDO0lBRUQsYUFBYTtJQUNiLHlCQUF5QixDQUFDLEVBQWM7UUFDdEMsSUFBSSxDQUFDLFNBQVMs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UTtJQUNwQyxPQUFPLEVBQUUsYUFBYTtJQUN0QixXQUFXLEVBQUUsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDLGdCQUFnQixDQUFDO0lBQy9DLEtBQUssRUFBRSxJQUFJO0NBQ1osQ0FBQztBQUdGOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBc0JHO0FBTUgsTUFBTSxPQUFPLGdCQUFnQjtJQUw3QjtRQU1VLGVBQVUsR0FBZ0IsYUFBYSxDQUFDO0lBcUNsRCxDQUFDO0lBM0JDLGFBQWE7SUFDYixXQUFXLENBQUMsT0FBc0I7UUFDaEMsSUFBSSxTQUFTLElBQUksT0FBTyxFQUFFO1lBQ3hCLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBQ3hCLElBQUksSUFBSSxDQUFDLFNBQVM7Z0JBQUUsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1NBQ3RDO0lBQ0gsQ0FBQztJQUVEOzs7T0FHRztJQUNILFFBQVEsQ0FBQyxPQUF3QjtRQUMvQixPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDbEMsQ0FBQztJQUVEOzs7T0FHRztJQUNILHlCQUF5QixDQUFDLEVBQWM7UUFDdEMsSUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7SUFDdEIsQ0FBQztJQUVPLGdCQUFnQjtRQUN0QixJQUFJLENBQUMsVUFBVSxHQUFHLGdCQUFnQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNuRCxDQUFDOzs7WUExQ0YsU0FBUyxTQUFDO2dCQUNULFFBQVEsRUFBRSxzRUFBc0U7Z0JBQ2hGLFNBQVMsRUFBRSxDQUFDLGlCQUFpQixDQUFDO2dCQUM5QixJQUFJLEVBQUUsRUFBQyxnQkFBZ0IsRUFBRSwwQkFBMEIsRUFBQzthQUNyRDs7O3NCQVNFLEtBQUsiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtEaXJlY3RpdmUsIGZvcndhcmRSZWYsIElucHV0LCBPbkNoYW5nZXMsIFNpbXBsZUNoYW5nZXMsIFN0YXRpY1Byb3ZpZGVyfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7T2JzZXJ2YWJsZX0gZnJvbSAncnhqcyc7XG5cbmltcG9ydCB7QWJzdHJhY3RDb250cm9sfSBmcm9tICcuLi9tb2RlbCc7XG5pbXBvcnQge2VtYWlsVmFsaWRhdG9yLCBtYXhMZW5ndGhWYWxpZGF0b3IsIG1heFZhbGlkYXRvciwgbWluTGVuZ3RoVmFsaWRhdG9yLCBtaW5WYWxpZGF0b3IsIE5HX1ZBTElEQVRPUlMsIG51bGxWYWxpZGF0b3IsIHBhdHRlcm5WYWxpZGF0b3IsIHJlcXVpcmVkVHJ1ZVZhbGlkYXRvciwgcmVxdWlyZWRWYWxpZGF0b3J9IGZyb20gJy4uL3ZhbGlkYXRvcnMnO1xuXG5cbi8qKlxuICogQGRlc2NyaXB0aW9uXG4gKiBEZWZpbmVzIHRoZSBtYXAgb2YgZXJyb3JzIHJldHVybmVkIGZyb20gZmFpbGVkIHZhbGlkYXRpb24gY2hlY2tzLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IHR5cGUgVmFsaWRhdGlvbkVycm9ycyA9IHtcbiAgW2tleTogc3RyaW5nXTogYW55XG59O1xuXG4vKipcbiAqIEBkZXNjcmlwdGlvblxuICogQW4gaW50ZXJmYWNlIGltcGxlbWVudGVkIGJ5IGNsYXNzZXMgdGhhdCBwZXJmb3JtIHN5bmNocm9ub3VzIHZhbGlkYXRpb24uXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqXG4gKiAjIyMgUHJvdmlkZSBhIGN1c3RvbSB2YWxpZGF0b3JcbiAqXG4gKiBUaGUgZm9sbG93aW5nIGV4YW1wbGUgaW1wbGVtZW50cyB0aGUgYFZhbGlkYXRvcmAgaW50ZXJmYWNlIHRvIGNyZWF0ZSBhXG4gKiB2YWxpZGF0b3IgZGlyZWN0aXZlIHdpdGggYSBjdXN0b20gZXJyb3Iga2V5LlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIEBEaXJlY3RpdmUoe1xuICogICBzZWxlY3RvcjogJ1tjdXN0b21WYWxpZGF0b3JdJyxcbiAqICAgcHJvdmlkZXJzOiBbe3Byb3ZpZGU6IE5HX1ZBTElEQVRPUlMsIHVzZUV4aXN0aW5nOiBDdXN0b21WYWxpZGF0b3JEaXJlY3RpdmUsIG11bHRpOiB0cnVlfV1cbiAqIH0pXG4gKiBjbGFzcyBDdXN0b21WYWxpZGF0b3JEaXJlY3RpdmUgaW1wbGVtZW50cyBWYWxpZGF0b3Ige1xuICogICB2YWxpZGF0ZShjb250cm9sOiBBYnN0cmFjdENvbnRyb2wpOiBWYWxpZGF0aW9uRXJyb3JzfG51bGwge1xuICogICAgIHJldHVybiB7J2N1c3RvbSc6IHRydWV9O1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgVmFsaWRhdG9yIHtcbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBNZXRob2QgdGhhdCBwZXJmb3JtcyBzeW5jaHJvbm91cyB2YWxpZGF0aW9uIGFnYWluc3QgdGhlIHByb3ZpZGVkIGNvbnRyb2wuXG4gICAqXG4gICAqIEBwYXJhbSBjb250cm9sIFRoZSBjb250cm9sIHRvIHZhbGlkYXRlIGFnYWluc3QuXG4gICAqXG4gICAqIEByZXR1cm5zIEEgbWFwIG9mIHZhbGlkYXRpb24gZXJyb3JzIGlmIHZhbGlkYXRpb24gZmFpbHMsXG4gICAqIG90aGVyd2lzZSBudWxsLlxuICAgKi9cbiAgdmFsaWRhdGUoY29udHJvbDogQWJzdHJhY3RDb250cm9sKTogVmFsaWRhdGlvbkVycm9yc3xudWxsO1xuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogUmVnaXN0ZXJzIGEgY2FsbGJhY2sgZnVuY3Rpb24gdG8gY2FsbCB3aGVuIHRoZSB2YWxpZGF0b3IgaW5wdXRzIGNoYW5nZS5cbiAgICpcbiAgICogQHBhcmFtIGZuIFRoZSBjYWxsYmFjayBmdW5jdGlvblxuICAgKi9cbiAgcmVnaXN0ZXJPblZhbGlkYXRvckNoYW5nZT8oZm46ICgpID0+IHZvaWQpOiB2b2lkO1xufVxuXG4vKipcbiAqIEEgYmFzZSBjbGFzcyBmb3IgVmFsaWRhdG9yLWJhc2VkIERpcmVjdGl2ZXMuIFRoZSBjbGFzcyBjb250YWlucyBjb21tb24gbG9naWMgc2hhcmVkIGFjcm9zcyBzdWNoXG4gKiBEaXJlY3RpdmVzLlxuICpcbiAqIEZvciBpbnRlcm5hbCB1c2Ugb25seSwgdGhpcyBjbGFzcyBpcyBub3QgaW50ZW5kZWQgZm9yIHVzZSBvdXRzaWRlIG9mIHRoZSBGb3JtcyBwYWNrYWdlLlxuICovXG5ARGlyZWN0aXZlKClcbmFic3RyYWN0IGNsYXNzIEFic3RyYWN0VmFsaWRhdG9yRGlyZWN0aXZlIGltcGxlbWVudHMgVmFsaWRhdG9yIHtcbiAgcHJpdmF0ZSBfdmFsaWRhdG9yOiBWYWxpZGF0b3JGbiA9IG51bGxWYWxpZGF0b3I7XG4gIHByaXZhdGUgX29uQ2hhbmdlITogKCkgPT4gdm9pZDtcblxuICAvKipcbiAgICogTmFtZSBvZiBhbiBpbnB1dCB0aGF0IG1hdGNoZXMgZGlyZWN0aXZlIHNlbGVjdG9yIGF0dHJpYnV0ZSAoZS5nLiBgbWlubGVuZ3RoYCBmb3JcbiAgICogYE1pbkxlbmd0aERpcmVjdGl2ZWApLiBBbiBpbnB1dCB3aXRoIGEgZ2l2ZW4gbmFtZSBtaWdodCBjb250YWluIGNvbmZpZ3VyYXRpb24gaW5mb3JtYXRpb24gKGxpa2VcbiAgICogYG1pbmxlbmd0aD0nMTAnYCkgb3IgYSBmbGFnIHRoYXQgaW5kaWNhdGVzIHdoZXRoZXIgdmFsaWRhdG9yIHNob3VsZCBiZSBlbmFibGVkIChsaWtlXG4gICAqIGBbcmVxdWlyZWRdPSdmYWxzZSdgKS5cbiAgICpcbiAgICogQGludGVybmFsXG4gICAqL1xuICBhYnN0cmFjdCBpbnB1dE5hbWU6IHN0cmluZztcblxuICAvKipcbiAgICogQ3JlYXRlcyBhbiBpbnN0YW5jZSBvZiBhIHZhbGlkYXRvciAoc3BlY2lmaWMgdG8gYSBkaXJlY3RpdmUgdGhhdCBleHRlbmRzIHRoaXMgYmFzZSBjbGFzcykuXG4gICAqXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgYWJzdHJhY3QgY3JlYXRlVmFsaWRhdG9yKGlucHV0OiB1bmtub3duKTogVmFsaWRhdG9yRm47XG5cbiAgLyoqXG4gICAqIFBlcmZvcm1zIHRoZSBuZWNlc3NhcnkgaW5wdXQgbm9ybWFsaXphdGlvbiBiYXNlZCBvbiBhIHNwZWNpZmljIGxvZ2ljIG9mIGEgRGlyZWN0aXZlLlxuICAgKiBGb3IgZXhhbXBsZSwgdGhlIGZ1bmN0aW9uIG1pZ2h0IGJlIHVzZWQgdG8gY29udmVydCBzdHJpbmctYmFzZWQgcmVwcmVzZW50YXRpb24gb2YgdGhlXG4gICAqIGBtaW5sZW5ndGhgIGlucHV0IHRvIGFuIGludGVnZXIgdmFsdWUgdGhhdCBjYW4gbGF0ZXIgYmUgdXNlZCBpbiB0aGUgYFZhbGlkYXRvcnMubWluTGVuZ3RoYFxuICAgKiB2YWxpZGF0b3IuXG4gICAqXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgYWJzdHJhY3Qgbm9ybWFsaXplSW5wdXQoaW5wdXQ6IHVua25vd24pOiB1bmtub3duO1xuXG4gIC8qKlxuICAgKiBIZWxwZXIgZnVuY3Rpb24gaW52b2tlZCBmcm9tIGNoaWxkIGNsYXNzZXMgdG8gcHJvY2VzcyBjaGFuZ2VzIChmcm9tIGBuZ09uQ2hhbmdlc2AgaG9vaykuXG4gICAqIEBub2RvY1xuICAgKi9cbiAgaGFuZGxlQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuaW5wdXROYW1lIGluIGNoYW5nZXMpIHtcbiAgICAgIGNvbnN0IGlucHV0ID0gdGhpcy5ub3JtYWxpemVJbnB1dChjaGFuZ2VzW3RoaXMuaW5wdXROYW1lXS5jdXJyZW50VmFsdWUpO1xuICAgICAgdGhpcy5fdmFsaWRhdG9yID0gdGhpcy5jcmVhdGVWYWxpZGF0b3IoaW5wdXQpO1xuICAgICAgaWYgKHRoaXMuX29uQ2hhbmdlKSB7XG4gICAgICAgIHRoaXMuX29uQ2hhbmdlKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqIEBub2RvYyAqL1xuICB2YWxpZGF0ZShjb250cm9sOiBBYnN0cmFjdENvbnRyb2wpOiBWYWxpZGF0aW9uRXJyb3JzfG51bGwge1xuICAgIHJldHVybiB0aGlzLl92YWxpZGF0b3IoY29udHJvbCk7XG4gIH1cblxuICAvKiogQG5vZG9jICovXG4gIHJlZ2lzdGVyT25WYWxpZGF0b3JDaGFuZ2UoZm46ICgpID0+IHZvaWQpOiB2b2lkIHtcbiAgICB0aGlzLl9vbkNoYW5nZSA9IGZuO1xuICB9XG59XG5cbi8qKlxuICogQGRlc2NyaXB0aW9uXG4gKiBQcm92aWRlciB3aGljaCBhZGRzIGBNYXhWYWxpZGF0b3JgIHRvIHRoZSBgTkdfVkFMSURBVE9SU2AgbXVsdGktcHJvdmlkZXIgbGlzdC5cbiAqL1xuZXhwb3J0IGNvbnN0IE1BWF9WQUxJREFUT1I6IFN0YXRpY1Byb3ZpZGVyID0ge1xuICBwcm92aWRlOiBOR19WQUxJREFUT1JTLFxuICB1c2VFeGlzdGluZzogZm9yd2FyZFJlZigoKSA9PiBNYXhWYWxpZGF0b3IpLFxuICBtdWx0aTogdHJ1ZVxufTtcblxuLyoqXG4gKiBBIGRpcmVjdGl2ZSB3aGljaCBpbnN0YWxscyB0aGUge0BsaW5rIE1heFZhbGlkYXRvcn0gZm9yIGFueSBgZm9ybUNvbnRyb2xOYW1lYCxcbiAqIGBmb3JtQ29udHJvbGAsIG9yIGNvbnRyb2wgd2l0aCBgbmdNb2RlbGAgdGhhdCBhbHNvIGhhcyBhIGBtYXhgIGF0dHJpYnV0ZS5cbiAqXG4gKiBAc2VlIFtGb3JtIFZhbGlkYXRpb25dKGd1aWRlL2Zvcm0tdmFsaWRhdGlvbilcbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICpcbiAqICMjIyBBZGRpbmcgYSBtYXggdmFsaWRhdG9yXG4gKlxuICogVGhlIGZvbGxvd2luZyBleGFtcGxlIHNob3dzIGhvdyB0byBhZGQgYSBtYXggdmFsaWRhdG9yIHRvIGFuIGlucHV0IGF0dGFjaGVkIHRvIGFuXG4gKiBuZ01vZGVsIGJpbmRpbmcuXG4gKlxuICogYGBgaHRtbFxuICogPGlucHV0IHR5cGU9XCJudW1iZXJcIiBuZ01vZGVsIG1heD1cIjRcIj5cbiAqIGBgYFxuICpcbiAqIEBuZ01vZHVsZSBSZWFjdGl2ZUZvcm1zTW9kdWxlXG4gKiBAbmdNb2R1bGUgRm9ybXNNb2R1bGVcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOlxuICAgICAgJ2lucHV0W3R5cGU9bnVtYmVyXVttYXhdW2Zvcm1Db250cm9sTmFtZV0saW5wdXRbdHlwZT1udW1iZXJdW21heF1bZm9ybUNvbnRyb2xdLGlucHV0W3R5cGU9bnVtYmVyXVttYXhdW25nTW9kZWxdJyxcbiAgcHJvdmlkZXJzOiBbTUFYX1ZBTElEQVRPUl0sXG4gIGhvc3Q6IHsnW2F0dHIubWF4XSc6ICdtYXggPyBtYXggOiBudWxsJ31cbn0pXG5leHBvcnQgY2xhc3MgTWF4VmFsaWRhdG9yIGV4dGVuZHMgQWJzdHJhY3RWYWxpZGF0b3JEaXJlY3RpdmUgaW1wbGVtZW50cyBPbkNoYW5nZXMge1xuICAvKipcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIFRyYWNrcyBjaGFuZ2VzIHRvIHRoZSBtYXggYm91bmQgdG8gdGhpcyBkaXJlY3RpdmUuXG4gICAqL1xuICBASW5wdXQoKSBtYXghOiBzdHJpbmd8bnVtYmVyO1xuICAvKiogQGludGVybmFsICovXG4gIGlucHV0TmFtZSA9ICdtYXgnO1xuICAvKiogQGludGVybmFsICovXG4gIG5vcm1hbGl6ZUlucHV0ID0gKGlucHV0OiBzdHJpbmcpOiBudW1iZXIgPT4gcGFyc2VGbG9hdChpbnB1dCk7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgY3JlYXRlVmFsaWRhdG9yID0gKG1heDogbnVtYmVyKTogVmFsaWRhdG9yRm4gPT4gbWF4VmFsaWRhdG9yKG1heCk7XG4gIC8qKlxuICAgKiBEZWNsYXJlIGBuZ09uQ2hhbmdlc2AgbGlmZWN5Y2xlIGhvb2sgYXQgdGhlIG1haW4gZGlyZWN0aXZlIGxldmVsICh2cyBrZWVwaW5nIGl0IGluIGJhc2UgY2xhc3MpXG4gICAqIHRvIGF2b2lkIGRpZmZlcmVuY2VzIGluIGhhbmRsaW5nIGluaGVyaXRhbmNlIG9mIGxpZmVjeWNsZSBob29rcyBiZXR3ZWVuIEl2eSBhbmQgVmlld0VuZ2luZSBpblxuICAgKiBBT1QgbW9kZS4gVGhpcyBjb3VsZCBiZSByZWZhY3RvcmVkIG9uY2UgVmlld0VuZ2luZSBpcyByZW1vdmVkLlxuICAgKiBAbm9kb2NcbiAgICovXG4gIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpOiB2b2lkIHtcbiAgICB0aGlzLmhhbmRsZUNoYW5nZXMoY2hhbmdlcyk7XG4gIH1cbn1cblxuLyoqXG4gKiBAZGVzY3JpcHRpb25cbiAqIFByb3ZpZGVyIHdoaWNoIGFkZHMgYE1pblZhbGlkYXRvcmAgdG8gdGhlIGBOR19WQUxJREFUT1JTYCBtdWx0aS1wcm92aWRlciBsaXN0LlxuICovXG5leHBvcnQgY29uc3QgTUlOX1ZBTElEQVRPUjogU3RhdGljUHJvdmlkZXIgPSB7XG4gIHByb3ZpZGU6IE5HX1ZBTElEQVRPUlMsXG4gIHVzZUV4aXN0aW5nOiBmb3J3YXJkUmVmKCgpID0+IE1pblZhbGlkYXRvciksXG4gIG11bHRpOiB0cnVlXG59O1xuXG4vKipcbiAqIEEgZGlyZWN0aXZlIHdoaWNoIGluc3RhbGxzIHRoZSB7QGxpbmsgTWluVmFsaWRhdG9yfSBmb3IgYW55IGBmb3JtQ29udHJvbE5hbWVgLFxuICogYGZvcm1Db250cm9sYCwgb3IgY29udHJvbCB3aXRoIGBuZ01vZGVsYCB0aGF0IGFsc28gaGFzIGEgYG1pbmAgYXR0cmlidXRlLlxuICpcbiAqIEBzZWUgW0Zvcm0gVmFsaWRhdGlvbl0oZ3VpZGUvZm9ybS12YWxpZGF0aW9uKVxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKlxuICogIyMjIEFkZGluZyBhIG1pbiB2YWxpZGF0b3JcbiAqXG4gKiBUaGUgZm9sbG93aW5nIGV4YW1wbGUgc2hvd3MgaG93IHRvIGFkZCBhIG1pbiB2YWxpZGF0b3IgdG8gYW4gaW5wdXQgYXR0YWNoZWQgdG8gYW5cbiAqIG5nTW9kZWwgYmluZGluZy5cbiAqXG4gKiBgYGBodG1sXG4gKiA8aW5wdXQgdHlwZT1cIm51bWJlclwiIG5nTW9kZWwgbWluPVwiNFwiPlxuICogYGBgXG4gKlxuICogQG5nTW9kdWxlIFJlYWN0aXZlRm9ybXNNb2R1bGVcbiAqIEBuZ01vZHVsZSBGb3Jtc01vZHVsZVxuICogQHB1YmxpY0FwaVxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6XG4gICAgICAnaW5wdXRbdHlwZT1udW1iZXJdW21pbl1bZm9ybUNvbnRyb2xOYW1lXSxpbnB1dFt0eXBlPW51bWJlcl1bbWluXVtmb3JtQ29udHJvbF0saW5wdXRbdHlwZT1udW1iZXJdW21pbl1bbmdNb2RlbF0nLFxuICBwcm92aWRlcnM6IFtNSU5fVkFMSURBVE9SXSxcbiAgaG9zdDogeydbYXR0ci5taW5dJzogJ21pbiA/IG1pbiA6IG51bGwnfVxufSlcbmV4cG9ydCBjbGFzcyBNaW5WYWxpZGF0b3IgZXh0ZW5kcyBBYnN0cmFjdFZhbGlkYXRvckRpcmVjdGl2ZSBpbXBsZW1lbnRzIE9uQ2hhbmdlcyB7XG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogVHJhY2tzIGNoYW5nZXMgdG8gdGhlIG1pbiBib3VuZCB0byB0aGlzIGRpcmVjdGl2ZS5cbiAgICovXG4gIEBJbnB1dCgpIG1pbiE6IHN0cmluZ3xudW1iZXI7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgaW5wdXROYW1lID0gJ21pbic7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgbm9ybWFsaXplSW5wdXQgPSAoaW5wdXQ6IHN0cmluZyk6IG51bWJlciA9PiBwYXJzZUZsb2F0KGlucHV0KTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBjcmVhdGVWYWxpZGF0b3IgPSAobWluOiBudW1iZXIpOiBWYWxpZGF0b3JGbiA9PiBtaW5WYWxpZGF0b3IobWluKTtcbiAgLyoqXG4gICAqIERlY2xhcmUgYG5nT25DaGFuZ2VzYCBsaWZlY3ljbGUgaG9vayBhdCB0aGUgbWFpbiBkaXJlY3RpdmUgbGV2ZWwgKHZzIGtlZXBpbmcgaXQgaW4gYmFzZSBjbGFzcylcbiAgICogdG8gYXZvaWQgZGlmZmVyZW5jZXMgaW4gaGFuZGxpbmcgaW5oZXJpdGFuY2Ugb2YgbGlmZWN5Y2xlIGhvb2tzIGJldHdlZW4gSXZ5IGFuZCBWaWV3RW5naW5lIGluXG4gICAqIEFPVCBtb2RlLiBUaGlzIGNvdWxkIGJlIHJlZmFjdG9yZWQgb25jZSBWaWV3RW5naW5lIGlzIHJlbW92ZWQuXG4gICAqIEBub2RvY1xuICAgKi9cbiAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcyk6IHZvaWQge1xuICAgIHRoaXMuaGFuZGxlQ2hhbmdlcyhjaGFuZ2VzKTtcbiAgfVxufVxuXG4vKipcbiAqIEBkZXNjcmlwdGlvblxuICogQW4gaW50ZXJmYWNlIGltcGxlbWVudGVkIGJ5IGNsYXNzZXMgdGhhdCBwZXJmb3JtIGFzeW5jaHJvbm91cyB2YWxpZGF0aW9uLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKlxuICogIyMjIFByb3ZpZGUgYSBjdXN0b20gYXN5bmMgdmFsaWRhdG9yIGRpcmVjdGl2ZVxuICpcbiAqIFRoZSBmb2xsb3dpbmcgZXhhbXBsZSBpbXBsZW1lbnRzIHRoZSBgQXN5bmNWYWxpZGF0b3JgIGludGVyZmFjZSB0byBjcmVhdGUgYW5cbiAqIGFzeW5jIHZhbGlkYXRvciBkaXJlY3RpdmUgd2l0aCBhIGN1c3RvbSBlcnJvciBrZXkuXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogaW1wb3J0IHsgb2YgfSBmcm9tICdyeGpzJztcbiAqXG4gKiBARGlyZWN0aXZlKHtcbiAqICAgc2VsZWN0b3I6ICdbY3VzdG9tQXN5bmNWYWxpZGF0b3JdJyxcbiAqICAgcHJvdmlkZXJzOiBbe3Byb3ZpZGU6IE5HX0FTWU5DX1ZBTElEQVRPUlMsIHVzZUV4aXN0aW5nOiBDdXN0b21Bc3luY1ZhbGlkYXRvckRpcmVjdGl2ZSwgbXVsdGk6XG4gKiB0cnVlfV1cbiAqIH0pXG4gKiBjbGFzcyBDdXN0b21Bc3luY1ZhbGlkYXRvckRpcmVjdGl2ZSBpbXBsZW1lbnRzIEFzeW5jVmFsaWRhdG9yIHtcbiAqICAgdmFsaWRhdGUoY29udHJvbDogQWJzdHJhY3RDb250cm9sKTogT2JzZXJ2YWJsZTxWYWxpZGF0aW9uRXJyb3JzfG51bGw+IHtcbiAqICAgICByZXR1cm4gb2YoeydjdXN0b20nOiB0cnVlfSk7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBc3luY1ZhbGlkYXRvciBleHRlbmRzIFZhbGlkYXRvciB7XG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogTWV0aG9kIHRoYXQgcGVyZm9ybXMgYXN5bmMgdmFsaWRhdGlvbiBhZ2FpbnN0IHRoZSBwcm92aWRlZCBjb250cm9sLlxuICAgKlxuICAgKiBAcGFyYW0gY29udHJvbCBUaGUgY29udHJvbCB0byB2YWxpZGF0ZSBhZ2FpbnN0LlxuICAgKlxuICAgKiBAcmV0dXJucyBBIHByb21pc2Ugb3Igb2JzZXJ2YWJsZSB0aGF0IHJlc29sdmVzIGEgbWFwIG9mIHZhbGlkYXRpb24gZXJyb3JzXG4gICAqIGlmIHZhbGlkYXRpb24gZmFpbHMsIG90aGVyd2lzZSBudWxsLlxuICAgKi9cbiAgdmFsaWRhdGUoY29udHJvbDogQWJzdHJhY3RDb250cm9sKTpcbiAgICAgIFByb21pc2U8VmFsaWRhdGlvbkVycm9yc3xudWxsPnxPYnNlcnZhYmxlPFZhbGlkYXRpb25FcnJvcnN8bnVsbD47XG59XG5cbi8qKlxuICogQGRlc2NyaXB0aW9uXG4gKiBQcm92aWRlciB3aGljaCBhZGRzIGBSZXF1aXJlZFZhbGlkYXRvcmAgdG8gdGhlIGBOR19WQUxJREFUT1JTYCBtdWx0aS1wcm92aWRlciBsaXN0LlxuICovXG5leHBvcnQgY29uc3QgUkVRVUlSRURfVkFMSURBVE9SOiBTdGF0aWNQcm92aWRlciA9IHtcbiAgcHJvdmlkZTogTkdfVkFMSURBVE9SUyxcbiAgdXNlRXhpc3Rpbmc6IGZvcndhcmRSZWYoKCkgPT4gUmVxdWlyZWRWYWxpZGF0b3IpLFxuICBtdWx0aTogdHJ1ZVxufTtcblxuLyoqXG4gKiBAZGVzY3JpcHRpb25cbiAqIFByb3ZpZGVyIHdoaWNoIGFkZHMgYENoZWNrYm94UmVxdWlyZWRWYWxpZGF0b3JgIHRvIHRoZSBgTkdfVkFMSURBVE9SU2AgbXVsdGktcHJvdmlkZXIgbGlzdC5cbiAqL1xuZXhwb3J0IGNvbnN0IENIRUNLQk9YX1JFUVVJUkVEX1ZBTElEQVRPUjogU3RhdGljUHJvdmlkZXIgPSB7XG4gIHByb3ZpZGU6IE5HX1ZBTElEQVRPUlMsXG4gIHVzZUV4aXN0aW5nOiBmb3J3YXJkUmVmKCgpID0+IENoZWNrYm94UmVxdWlyZWRWYWxpZGF0b3IpLFxuICBtdWx0aTogdHJ1ZVxufTtcblxuXG4vKipcbiAqIEBkZXNjcmlwdGlvblxuICogQSBkaXJlY3RpdmUgdGhhdCBhZGRzIHRoZSBgcmVxdWlyZWRgIHZhbGlkYXRvciB0byBhbnkgY29udHJvbHMgbWFya2VkIHdpdGggdGhlXG4gKiBgcmVxdWlyZWRgIGF0dHJpYnV0ZS4gVGhlIGRpcmVjdGl2ZSBpcyBwcm92aWRlZCB3aXRoIHRoZSBgTkdfVkFMSURBVE9SU2AgbXVsdGktcHJvdmlkZXIgbGlzdC5cbiAqXG4gKiBAc2VlIFtGb3JtIFZhbGlkYXRpb25dKGd1aWRlL2Zvcm0tdmFsaWRhdGlvbilcbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICpcbiAqICMjIyBBZGRpbmcgYSByZXF1aXJlZCB2YWxpZGF0b3IgdXNpbmcgdGVtcGxhdGUtZHJpdmVuIGZvcm1zXG4gKlxuICogYGBgXG4gKiA8aW5wdXQgbmFtZT1cImZ1bGxOYW1lXCIgbmdNb2RlbCByZXF1aXJlZD5cbiAqIGBgYFxuICpcbiAqIEBuZ01vZHVsZSBGb3Jtc01vZHVsZVxuICogQG5nTW9kdWxlIFJlYWN0aXZlRm9ybXNNb2R1bGVcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOlxuICAgICAgJzpub3QoW3R5cGU9Y2hlY2tib3hdKVtyZXF1aXJlZF1bZm9ybUNvbnRyb2xOYW1lXSw6bm90KFt0eXBlPWNoZWNrYm94XSlbcmVxdWlyZWRdW2Zvcm1Db250cm9sXSw6bm90KFt0eXBlPWNoZWNrYm94XSlbcmVxdWlyZWRdW25nTW9kZWxdJyxcbiAgcHJvdmlkZXJzOiBbUkVRVUlSRURfVkFMSURBVE9SXSxcbiAgaG9zdDogeydbYXR0ci5yZXF1aXJlZF0nOiAncmVxdWlyZWQgPyBcIlwiIDogbnVsbCd9XG59KVxuZXhwb3J0IGNsYXNzIFJlcXVpcmVkVmFsaWRhdG9yIGltcGxlbWVudHMgVmFsaWRhdG9yIHtcbiAgcHJpdmF0ZSBfcmVxdWlyZWQgPSBmYWxzZTtcbiAgcHJpdmF0ZSBfb25DaGFuZ2U/OiAoKSA9PiB2b2lkO1xuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogVHJhY2tzIGNoYW5nZXMgdG8gdGhlIHJlcXVpcmVkIGF0dHJpYnV0ZSBib3VuZCB0byB0aGlzIGRpcmVjdGl2ZS5cbiAgICovXG4gIEBJbnB1dCgpXG4gIGdldCByZXF1aXJlZCgpOiBib29sZWFufHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX3JlcXVpcmVkO1xuICB9XG5cbiAgc2V0IHJlcXVpcmVkKHZhbHVlOiBib29sZWFufHN0cmluZykge1xuICAgIHRoaXMuX3JlcXVpcmVkID0gdmFsdWUgIT0gbnVsbCAmJiB2YWx1ZSAhPT0gZmFsc2UgJiYgYCR7dmFsdWV9YCAhPT0gJ2ZhbHNlJztcbiAgICBpZiAodGhpcy5fb25DaGFuZ2UpIHRoaXMuX29uQ2hhbmdlKCk7XG4gIH1cblxuICAvKipcbiAgICogTWV0aG9kIHRoYXQgdmFsaWRhdGVzIHdoZXRoZXIgdGhlIGNvbnRyb2wgaXMgZW1wdHkuXG4gICAqIFJldHVybnMgdGhlIHZhbGlkYXRpb24gcmVzdWx0IGlmIGVuYWJsZWQsIG90aGVyd2lzZSBudWxsLlxuICAgKiBAbm9kb2NcbiAgICovXG4gIHZhbGlkYXRlKGNvbnRyb2w6IEFic3RyYWN0Q29udHJvbCk6IFZhbGlkYXRpb25FcnJvcnN8bnVsbCB7XG4gICAgcmV0dXJuIHRoaXMucmVxdWlyZWQgPyByZXF1aXJlZFZhbGlkYXRvcihjb250cm9sKSA6IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXJzIGEgY2FsbGJhY2sgZnVuY3Rpb24gdG8gY2FsbCB3aGVuIHRoZSB2YWxpZGF0b3IgaW5wdXRzIGNoYW5nZS5cbiAgICogQG5vZG9jXG4gICAqL1xuICByZWdpc3Rlck9uVmFsaWRhdG9yQ2hhbmdlKGZuOiAoKSA9PiB2b2lkKTogdm9pZCB7XG4gICAgdGhpcy5fb25DaGFuZ2UgPSBmbjtcbiAgfVxufVxuXG5cbi8qKlxuICogQSBEaXJlY3RpdmUgdGhhdCBhZGRzIHRoZSBgcmVxdWlyZWRgIHZhbGlkYXRvciB0byBjaGVja2JveCBjb250cm9scyBtYXJrZWQgd2l0aCB0aGVcbiAqIGByZXF1aXJlZGAgYXR0cmlidXRlLiBUaGUgZGlyZWN0aXZlIGlzIHByb3ZpZGVkIHdpdGggdGhlIGBOR19WQUxJREFUT1JTYCBtdWx0aS1wcm92aWRlciBsaXN0LlxuICpcbiAqIEBzZWUgW0Zvcm0gVmFsaWRhdGlvbl0oZ3VpZGUvZm9ybS12YWxpZGF0aW9uKVxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKlxuICogIyMjIEFkZGluZyBhIHJlcXVpcmVkIGNoZWNrYm94IHZhbGlkYXRvciB1c2luZyB0ZW1wbGF0ZS1kcml2ZW4gZm9ybXNcbiAqXG4gKiBUaGUgZm9sbG93aW5nIGV4YW1wbGUgc2hvd3MgaG93IHRvIGFkZCBhIGNoZWNrYm94IHJlcXVpcmVkIHZhbGlkYXRvciB0byBhbiBpbnB1dCBhdHRhY2hlZCB0byBhblxuICogbmdNb2RlbCBiaW5kaW5nLlxuICpcbiAqIGBgYFxuICogPGlucHV0IHR5cGU9XCJjaGVja2JveFwiIG5hbWU9XCJhY3RpdmVcIiBuZ01vZGVsIHJlcXVpcmVkPlxuICogYGBgXG4gKlxuICogQHB1YmxpY0FwaVxuICogQG5nTW9kdWxlIEZvcm1zTW9kdWxlXG4gKiBAbmdNb2R1bGUgUmVhY3RpdmVGb3Jtc01vZHVsZVxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6XG4gICAgICAnaW5wdXRbdHlwZT1jaGVja2JveF1bcmVxdWlyZWRdW2Zvcm1Db250cm9sTmFtZV0saW5wdXRbdHlwZT1jaGVja2JveF1bcmVxdWlyZWRdW2Zvcm1Db250cm9sXSxpbnB1dFt0eXBlPWNoZWNrYm94XVtyZXF1aXJlZF1bbmdNb2RlbF0nLFxuICBwcm92aWRlcnM6IFtDSEVDS0JPWF9SRVFVSVJFRF9WQUxJREFUT1JdLFxuICBob3N0OiB7J1thdHRyLnJlcXVpcmVkXSc6ICdyZXF1aXJlZCA/IFwiXCIgOiBudWxsJ31cbn0pXG5leHBvcnQgY2xhc3MgQ2hlY2tib3hSZXF1aXJlZFZhbGlkYXRvciBleHRlbmRzIFJlcXVpcmVkVmFsaWRhdG9yIHtcbiAgLyoqXG4gICAqIE1ldGhvZCB0aGF0IHZhbGlkYXRlcyB3aGV0aGVyIG9yIG5vdCB0aGUgY2hlY2tib3ggaGFzIGJlZW4gY2hlY2tlZC5cbiAgICogUmV0dXJucyB0aGUgdmFsaWRhdGlvbiByZXN1bHQgaWYgZW5hYmxlZCwgb3RoZXJ3aXNlIG51bGwuXG4gICAqIEBub2RvY1xuICAgKi9cbiAgdmFsaWRhdGUoY29udHJvbDogQWJzdHJhY3RDb250cm9sKTogVmFsaWRhdGlvbkVycm9yc3xudWxsIHtcbiAgICByZXR1cm4gdGhpcy5yZXF1aXJlZCA/IHJlcXVpcmVkVHJ1ZVZhbGlkYXRvcihjb250cm9sKSA6IG51bGw7XG4gIH1cbn1cblxuLyoqXG4gKiBAZGVzY3JpcHRpb25cbiAqIFByb3ZpZGVyIHdoaWNoIGFkZHMgYEVtYWlsVmFsaWRhdG9yYCB0byB0aGUgYE5HX1ZBTElEQVRPUlNgIG11bHRpLXByb3ZpZGVyIGxpc3QuXG4gKi9cbmV4cG9ydCBjb25zdCBFTUFJTF9WQUxJREFUT1I6IGFueSA9IHtcbiAgcHJvdmlkZTogTkdfVkFMSURBVE9SUyxcbiAgdXNlRXhpc3Rpbmc6IGZvcndhcmRSZWYoKCkgPT4gRW1haWxWYWxpZGF0b3IpLFxuICBtdWx0aTogdHJ1ZVxufTtcblxuLyoqXG4gKiBBIGRpcmVjdGl2ZSB0aGF0IGFkZHMgdGhlIGBlbWFpbGAgdmFsaWRhdG9yIHRvIGNvbnRyb2xzIG1hcmtlZCB3aXRoIHRoZVxuICogYGVtYWlsYCBhdHRyaWJ1dGUuIFRoZSBkaXJlY3RpdmUgaXMgcHJvdmlkZWQgd2l0aCB0aGUgYE5HX1ZBTElEQVRPUlNgIG11bHRpLXByb3ZpZGVyIGxpc3QuXG4gKlxuICogQHNlZSBbRm9ybSBWYWxpZGF0aW9uXShndWlkZS9mb3JtLXZhbGlkYXRpb24pXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqXG4gKiAjIyMgQWRkaW5nIGFuIGVtYWlsIHZhbGlkYXRvclxuICpcbiAqIFRoZSBmb2xsb3dpbmcgZXhhbXBsZSBzaG93cyBob3cgdG8gYWRkIGFuIGVtYWlsIHZhbGlkYXRvciB0byBhbiBpbnB1dCBhdHRhY2hlZCB0byBhbiBuZ01vZGVsXG4gKiBiaW5kaW5nLlxuICpcbiAqIGBgYFxuICogPGlucHV0IHR5cGU9XCJlbWFpbFwiIG5hbWU9XCJlbWFpbFwiIG5nTW9kZWwgZW1haWw+XG4gKiA8aW5wdXQgdHlwZT1cImVtYWlsXCIgbmFtZT1cImVtYWlsXCIgbmdNb2RlbCBlbWFpbD1cInRydWVcIj5cbiAqIDxpbnB1dCB0eXBlPVwiZW1haWxcIiBuYW1lPVwiZW1haWxcIiBuZ01vZGVsIFtlbWFpbF09XCJ0cnVlXCI+XG4gKiBgYGBcbiAqXG4gKiBAcHVibGljQXBpXG4gKiBAbmdNb2R1bGUgRm9ybXNNb2R1bGVcbiAqIEBuZ01vZHVsZSBSZWFjdGl2ZUZvcm1zTW9kdWxlXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tlbWFpbF1bZm9ybUNvbnRyb2xOYW1lXSxbZW1haWxdW2Zvcm1Db250cm9sXSxbZW1haWxdW25nTW9kZWxdJyxcbiAgcHJvdmlkZXJzOiBbRU1BSUxfVkFMSURBVE9SXVxufSlcbmV4cG9ydCBjbGFzcyBFbWFpbFZhbGlkYXRvciBpbXBsZW1lbnRzIFZhbGlkYXRvciB7XG4gIHByaXZhdGUgX2VuYWJsZWQgPSBmYWxzZTtcbiAgcHJpdmF0ZSBfb25DaGFuZ2U/OiAoKSA9PiB2b2lkO1xuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogVHJhY2tzIGNoYW5nZXMgdG8gdGhlIGVtYWlsIGF0dHJpYnV0ZSBib3VuZCB0byB0aGlzIGRpcmVjdGl2ZS5cbiAgICovXG4gIEBJbnB1dCgpXG4gIHNldCBlbWFpbCh2YWx1ZTogYm9vbGVhbnxzdHJpbmcpIHtcbiAgICB0aGlzLl9lbmFibGVkID0gdmFsdWUgPT09ICcnIHx8IHZhbHVlID09PSB0cnVlIHx8IHZhbHVlID09PSAndHJ1ZSc7XG4gICAgaWYgKHRoaXMuX29uQ2hhbmdlKSB0aGlzLl9vbkNoYW5nZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIE1ldGhvZCB0aGF0IHZhbGlkYXRlcyB3aGV0aGVyIGFuIGVtYWlsIGFkZHJlc3MgaXMgdmFsaWQuXG4gICAqIFJldHVybnMgdGhlIHZhbGlkYXRpb24gcmVzdWx0IGlmIGVuYWJsZWQsIG90aGVyd2lzZSBudWxsLlxuICAgKiBAbm9kb2NcbiAgICovXG4gIHZhbGlkYXRlKGNvbnRyb2w6IEFic3RyYWN0Q29udHJvbCk6IFZhbGlkYXRpb25FcnJvcnN8bnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuX2VuYWJsZWQgPyBlbWFpbFZhbGlkYXRvcihjb250cm9sKSA6IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXJzIGEgY2FsbGJhY2sgZnVuY3Rpb24gdG8gY2FsbCB3aGVuIHRoZSB2YWxpZGF0b3IgaW5wdXRzIGNoYW5nZS5cbiAgICogQG5vZG9jXG4gICAqL1xuICByZWdpc3Rlck9uVmFsaWRhdG9yQ2hhbmdlKGZuOiAoKSA9PiB2b2lkKTogdm9pZCB7XG4gICAgdGhpcy5fb25DaGFuZ2UgPSBmbjtcbiAgfVxufVxuXG4vKipcbiAqIEBkZXNjcmlwdGlvblxuICogQSBmdW5jdGlvbiB0aGF0IHJlY2VpdmVzIGEgY29udHJvbCBhbmQgc3luY2hyb25vdXNseSByZXR1cm5zIGEgbWFwIG9mXG4gKiB2YWxpZGF0aW9uIGVycm9ycyBpZiBwcmVzZW50LCBvdGhlcndpc2UgbnVsbC5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgVmFsaWRhdG9yRm4ge1xuICAoY29udHJvbDogQWJzdHJhY3RDb250cm9sKTogVmFsaWRhdGlvbkVycm9yc3xudWxsO1xufVxuXG4vKipcbiAqIEBkZXNjcmlwdGlvblxuICogQSBmdW5jdGlvbiB0aGF0IHJlY2VpdmVzIGEgY29udHJvbCBhbmQgcmV0dXJucyBhIFByb21pc2Ugb3Igb2JzZXJ2YWJsZVxuICogdGhhdCBlbWl0cyB2YWxpZGF0aW9uIGVycm9ycyBpZiBwcmVzZW50LCBvdGhlcndpc2UgbnVsbC5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQXN5bmNWYWxpZGF0b3JGbiB7XG4gIChjb250cm9sOiBBYnN0cmFjdENvbnRyb2wpOiBQcm9taXNlPFZhbGlkYXRpb25FcnJvcnN8bnVsbD58T2JzZXJ2YWJsZTxWYWxpZGF0aW9uRXJyb3JzfG51bGw+O1xufVxuXG4vKipcbiAqIEBkZXNjcmlwdGlvblxuICogUHJvdmlkZXIgd2hpY2ggYWRkcyBgTWluTGVuZ3RoVmFsaWRhdG9yYCB0byB0aGUgYE5HX1ZBTElEQVRPUlNgIG11bHRpLXByb3ZpZGVyIGxpc3QuXG4gKi9cbmV4cG9ydCBjb25zdCBNSU5fTEVOR1RIX1ZBTElEQVRPUjogYW55ID0ge1xuICBwcm92aWRlOiBOR19WQUxJREFUT1JTLFxuICB1c2VFeGlzdGluZzogZm9yd2FyZFJlZigoKSA9PiBNaW5MZW5ndGhWYWxpZGF0b3IpLFxuICBtdWx0aTogdHJ1ZVxufTtcblxuLyoqXG4gKiBBIGRpcmVjdGl2ZSB0aGF0IGFkZHMgbWluaW11bSBsZW5ndGggdmFsaWRhdGlvbiB0byBjb250cm9scyBtYXJrZWQgd2l0aCB0aGVcbiAqIGBtaW5sZW5ndGhgIGF0dHJpYnV0ZS4gVGhlIGRpcmVjdGl2ZSBpcyBwcm92aWRlZCB3aXRoIHRoZSBgTkdfVkFMSURBVE9SU2AgbXVsdGktcHJvdmlkZXIgbGlzdC5cbiAqXG4gKiBAc2VlIFtGb3JtIFZhbGlkYXRpb25dKGd1aWRlL2Zvcm0tdmFsaWRhdGlvbilcbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICpcbiAqICMjIyBBZGRpbmcgYSBtaW5pbXVtIGxlbmd0aCB2YWxpZGF0b3JcbiAqXG4gKiBUaGUgZm9sbG93aW5nIGV4YW1wbGUgc2hvd3MgaG93IHRvIGFkZCBhIG1pbmltdW0gbGVuZ3RoIHZhbGlkYXRvciB0byBhbiBpbnB1dCBhdHRhY2hlZCB0byBhblxuICogbmdNb2RlbCBiaW5kaW5nLlxuICpcbiAqIGBgYGh0bWxcbiAqIDxpbnB1dCBuYW1lPVwiZmlyc3ROYW1lXCIgbmdNb2RlbCBtaW5sZW5ndGg9XCI0XCI+XG4gKiBgYGBcbiAqXG4gKiBAbmdNb2R1bGUgUmVhY3RpdmVGb3Jtc01vZHVsZVxuICogQG5nTW9kdWxlIEZvcm1zTW9kdWxlXG4gKiBAcHVibGljQXBpXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1ttaW5sZW5ndGhdW2Zvcm1Db250cm9sTmFtZV0sW21pbmxlbmd0aF1bZm9ybUNvbnRyb2xdLFttaW5sZW5ndGhdW25nTW9kZWxdJyxcbiAgcHJvdmlkZXJzOiBbTUlOX0xFTkdUSF9WQUxJREFUT1JdLFxuICBob3N0OiB7J1thdHRyLm1pbmxlbmd0aF0nOiAnbWlubGVuZ3RoID8gbWlubGVuZ3RoIDogbnVsbCd9XG59KVxuZXhwb3J0IGNsYXNzIE1pbkxlbmd0aFZhbGlkYXRvciBpbXBsZW1lbnRzIFZhbGlkYXRvciwgT25DaGFuZ2VzIHtcbiAgcHJpdmF0ZSBfdmFsaWRhdG9yOiBWYWxpZGF0b3JGbiA9IG51bGxWYWxpZGF0b3I7XG4gIHByaXZhdGUgX29uQ2hhbmdlPzogKCkgPT4gdm9pZDtcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIFRyYWNrcyBjaGFuZ2VzIHRvIHRoZSBtaW5pbXVtIGxlbmd0aCBib3VuZCB0byB0aGlzIGRpcmVjdGl2ZS5cbiAgICovXG4gIEBJbnB1dCgpXG4gIG1pbmxlbmd0aCE6IHN0cmluZ3xudW1iZXI7ICAvLyBUaGlzIGlucHV0IGlzIGFsd2F5cyBkZWZpbmVkLCBzaW5jZSB0aGUgbmFtZSBtYXRjaGVzIHNlbGVjdG9yLlxuXG4gIC8qKiBAbm9kb2MgKi9cbiAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcyk6IHZvaWQge1xuICAgIGlmICgnbWlubGVuZ3RoJyBpbiBjaGFuZ2VzKSB7XG4gICAgICB0aGlzLl9jcmVhdGVWYWxpZGF0b3IoKTtcbiAgICAgIGlmICh0aGlzLl9vbkNoYW5nZSkgdGhpcy5fb25DaGFuZ2UoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogTWV0aG9kIHRoYXQgdmFsaWRhdGVzIHdoZXRoZXIgdGhlIHZhbHVlIG1lZXRzIGEgbWluaW11bSBsZW5ndGggcmVxdWlyZW1lbnQuXG4gICAqIFJldHVybnMgdGhlIHZhbGlkYXRpb24gcmVzdWx0IGlmIGVuYWJsZWQsIG90aGVyd2lzZSBudWxsLlxuICAgKiBAbm9kb2NcbiAgICovXG4gIHZhbGlkYXRlKGNvbnRyb2w6IEFic3RyYWN0Q29udHJvbCk6IFZhbGlkYXRpb25FcnJvcnN8bnVsbCB7XG4gICAgcmV0dXJuIHRoaXMubWlubGVuZ3RoID09IG51bGwgPyBudWxsIDogdGhpcy5fdmFsaWRhdG9yKGNvbnRyb2wpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVycyBhIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGNhbGwgd2hlbiB0aGUgdmFsaWRhdG9yIGlucHV0cyBjaGFuZ2UuXG4gICAqIEBub2RvY1xuICAgKi9cbiAgcmVnaXN0ZXJPblZhbGlkYXRvckNoYW5nZShmbjogKCkgPT4gdm9pZCk6IHZvaWQge1xuICAgIHRoaXMuX29uQ2hhbmdlID0gZm47XG4gIH1cblxuICBwcml2YXRlIF9jcmVhdGVWYWxpZGF0b3IoKTogdm9pZCB7XG4gICAgdGhpcy5fdmFsaWRhdG9yID0gbWluTGVuZ3RoVmFsaWRhdG9yKFxuICAgICAgICB0eXBlb2YgdGhpcy5taW5sZW5ndGggPT09ICdudW1iZXInID8gdGhpcy5taW5sZW5ndGggOiBwYXJzZUludCh0aGlzLm1pbmxlbmd0aCwgMTApKTtcbiAgfVxufVxuXG4vKipcbiAqIEBkZXNjcmlwdGlvblxuICogUHJvdmlkZXIgd2hpY2ggYWRkcyBgTWF4TGVuZ3RoVmFsaWRhdG9yYCB0byB0aGUgYE5HX1ZBTElEQVRPUlNgIG11bHRpLXByb3ZpZGVyIGxpc3QuXG4gKi9cbmV4cG9ydCBjb25zdCBNQVhfTEVOR1RIX1ZBTElEQVRPUjogYW55ID0ge1xuICBwcm92aWRlOiBOR19WQUxJREFUT1JTLFxuICB1c2VFeGlzdGluZzogZm9yd2FyZFJlZigoKSA9PiBNYXhMZW5ndGhWYWxpZGF0b3IpLFxuICBtdWx0aTogdHJ1ZVxufTtcblxuLyoqXG4gKiBBIGRpcmVjdGl2ZSB0aGF0IGFkZHMgbWF4IGxlbmd0aCB2YWxpZGF0aW9uIHRvIGNvbnRyb2xzIG1hcmtlZCB3aXRoIHRoZVxuICogYG1heGxlbmd0aGAgYXR0cmlidXRlLiBUaGUgZGlyZWN0aXZlIGlzIHByb3ZpZGVkIHdpdGggdGhlIGBOR19WQUxJREFUT1JTYCBtdWx0aS1wcm92aWRlciBsaXN0LlxuICpcbiAqIEBzZWUgW0Zvcm0gVmFsaWRhdGlvbl0oZ3VpZGUvZm9ybS12YWxpZGF0aW9uKVxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKlxuICogIyMjIEFkZGluZyBhIG1heGltdW0gbGVuZ3RoIHZhbGlkYXRvclxuICpcbiAqIFRoZSBmb2xsb3dpbmcgZXhhbXBsZSBzaG93cyBob3cgdG8gYWRkIGEgbWF4aW11bSBsZW5ndGggdmFsaWRhdG9yIHRvIGFuIGlucHV0IGF0dGFjaGVkIHRvIGFuXG4gKiBuZ01vZGVsIGJpbmRpbmcuXG4gKlxuICogYGBgaHRtbFxuICogPGlucHV0IG5hbWU9XCJmaXJzdE5hbWVcIiBuZ01vZGVsIG1heGxlbmd0aD1cIjI1XCI+XG4gKiBgYGBcbiAqXG4gKiBAbmdNb2R1bGUgUmVhY3RpdmVGb3Jtc01vZHVsZVxuICogQG5nTW9kdWxlIEZvcm1zTW9kdWxlXG4gKiBAcHVibGljQXBpXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1ttYXhsZW5ndGhdW2Zvcm1Db250cm9sTmFtZV0sW21heGxlbmd0aF1bZm9ybUNvbnRyb2xdLFttYXhsZW5ndGhdW25nTW9kZWxdJyxcbiAgcHJvdmlkZXJzOiBbTUFYX0xFTkdUSF9WQUxJREFUT1JdLFxuICBob3N0OiB7J1thdHRyLm1heGxlbmd0aF0nOiAnbWF4bGVuZ3RoID8gbWF4bGVuZ3RoIDogbnVsbCd9XG59KVxuZXhwb3J0IGNsYXNzIE1heExlbmd0aFZhbGlkYXRvciBpbXBsZW1lbnRzIFZhbGlkYXRvciwgT25DaGFuZ2VzIHtcbiAgcHJpdmF0ZSBfdmFsaWRhdG9yOiBWYWxpZGF0b3JGbiA9IG51bGxWYWxpZGF0b3I7XG4gIHByaXZhdGUgX29uQ2hhbmdlPzogKCkgPT4gdm9pZDtcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIFRyYWNrcyBjaGFuZ2VzIHRvIHRoZSBtYXhpbXVtIGxlbmd0aCBib3VuZCB0byB0aGlzIGRpcmVjdGl2ZS5cbiAgICovXG4gIEBJbnB1dCgpXG4gIG1heGxlbmd0aCE6IHN0cmluZ3xudW1iZXI7ICAvLyBUaGlzIGlucHV0IGlzIGFsd2F5cyBkZWZpbmVkLCBzaW5jZSB0aGUgbmFtZSBtYXRjaGVzIHNlbGVjdG9yLlxuXG4gIC8qKiBAbm9kb2MgKi9cbiAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcyk6IHZvaWQge1xuICAgIGlmICgnbWF4bGVuZ3RoJyBpbiBjaGFuZ2VzKSB7XG4gICAgICB0aGlzLl9jcmVhdGVWYWxpZGF0b3IoKTtcbiAgICAgIGlmICh0aGlzLl9vbkNoYW5nZSkgdGhpcy5fb25DaGFuZ2UoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogTWV0aG9kIHRoYXQgdmFsaWRhdGVzIHdoZXRoZXIgdGhlIHZhbHVlIGV4Y2VlZHMgdGhlIG1heGltdW0gbGVuZ3RoIHJlcXVpcmVtZW50LlxuICAgKiBAbm9kb2NcbiAgICovXG4gIHZhbGlkYXRlKGNvbnRyb2w6IEFic3RyYWN0Q29udHJvbCk6IFZhbGlkYXRpb25FcnJvcnN8bnVsbCB7XG4gICAgcmV0dXJuIHRoaXMubWF4bGVuZ3RoICE9IG51bGwgPyB0aGlzLl92YWxpZGF0b3IoY29udHJvbCkgOiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVycyBhIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGNhbGwgd2hlbiB0aGUgdmFsaWRhdG9yIGlucHV0cyBjaGFuZ2UuXG4gICAqIEBub2RvY1xuICAgKi9cbiAgcmVnaXN0ZXJPblZhbGlkYXRvckNoYW5nZShmbjogKCkgPT4gdm9pZCk6IHZvaWQge1xuICAgIHRoaXMuX29uQ2hhbmdlID0gZm47XG4gIH1cblxuICBwcml2YXRlIF9jcmVhdGVWYWxpZGF0b3IoKTogdm9pZCB7XG4gICAgdGhpcy5fdmFsaWRhdG9yID0gbWF4TGVuZ3RoVmFsaWRhdG9yKFxuICAgICAgICB0eXBlb2YgdGhpcy5tYXhsZW5ndGggPT09ICdudW1iZXInID8gdGhpcy5tYXhsZW5ndGggOiBwYXJzZUludCh0aGlzLm1heGxlbmd0aCwgMTApKTtcbiAgfVxufVxuXG4vKipcbiAqIEBkZXNjcmlwdGlvblxuICogUHJvdmlkZXIgd2hpY2ggYWRkcyBgUGF0dGVyblZhbGlkYXRvcmAgdG8gdGhlIGBOR19WQUxJREFUT1JTYCBtdWx0aS1wcm92aWRlciBsaXN0LlxuICovXG5leHBvcnQgY29uc3QgUEFUVEVSTl9WQUxJREFUT1I6IGFueSA9IHtcbiAgcHJvdmlkZTogTkdfVkFMSURBVE9SUyxcbiAgdXNlRXhpc3Rpbmc6IGZvcndhcmRSZWYoKCkgPT4gUGF0dGVyblZhbGlkYXRvciksXG4gIG11bHRpOiB0cnVlXG59O1xuXG5cbi8qKlxuICogQGRlc2NyaXB0aW9uXG4gKiBBIGRpcmVjdGl2ZSB0aGF0IGFkZHMgcmVnZXggcGF0dGVybiB2YWxpZGF0aW9uIHRvIGNvbnRyb2xzIG1hcmtlZCB3aXRoIHRoZVxuICogYHBhdHRlcm5gIGF0dHJpYnV0ZS4gVGhlIHJlZ2V4IG11c3QgbWF0Y2ggdGhlIGVudGlyZSBjb250cm9sIHZhbHVlLlxuICogVGhlIGRpcmVjdGl2ZSBpcyBwcm92aWRlZCB3aXRoIHRoZSBgTkdfVkFMSURBVE9SU2AgbXVsdGktcHJvdmlkZXIgbGlzdC5cbiAqXG4gKiBAc2VlIFtGb3JtIFZhbGlkYXRpb25dKGd1aWRlL2Zvcm0tdmFsaWRhdGlvbilcbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICpcbiAqICMjIyBBZGRpbmcgYSBwYXR0ZXJuIHZhbGlkYXRvclxuICpcbiAqIFRoZSBmb2xsb3dpbmcgZXhhbXBsZSBzaG93cyBob3cgdG8gYWRkIGEgcGF0dGVybiB2YWxpZGF0b3IgdG8gYW4gaW5wdXQgYXR0YWNoZWQgdG8gYW5cbiAqIG5nTW9kZWwgYmluZGluZy5cbiAqXG4gKiBgYGBodG1sXG4gKiA8aW5wdXQgbmFtZT1cImZpcnN0TmFtZVwiIG5nTW9kZWwgcGF0dGVybj1cIlthLXpBLVogXSpcIj5cbiAqIGBgYFxuICpcbiAqIEBuZ01vZHVsZSBSZWFjdGl2ZUZvcm1zTW9kdWxlXG4gKiBAbmdNb2R1bGUgRm9ybXNNb2R1bGVcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW3BhdHRlcm5dW2Zvcm1Db250cm9sTmFtZV0sW3BhdHRlcm5dW2Zvcm1Db250cm9sXSxbcGF0dGVybl1bbmdNb2RlbF0nLFxuICBwcm92aWRlcnM6IFtQQVRURVJOX1ZBTElEQVRPUl0sXG4gIGhvc3Q6IHsnW2F0dHIucGF0dGVybl0nOiAncGF0dGVybiA/IHBhdHRlcm4gOiBudWxsJ31cbn0pXG5leHBvcnQgY2xhc3MgUGF0dGVyblZhbGlkYXRvciBpbXBsZW1lbnRzIFZhbGlkYXRvciwgT25DaGFuZ2VzIHtcbiAgcHJpdmF0ZSBfdmFsaWRhdG9yOiBWYWxpZGF0b3JGbiA9IG51bGxWYWxpZGF0b3I7XG4gIHByaXZhdGUgX29uQ2hhbmdlPzogKCkgPT4gdm9pZDtcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIFRyYWNrcyBjaGFuZ2VzIHRvIHRoZSBwYXR0ZXJuIGJvdW5kIHRvIHRoaXMgZGlyZWN0aXZlLlxuICAgKi9cbiAgQElucHV0KClcbiAgcGF0dGVybiE6IHN0cmluZ3xSZWdFeHA7ICAvLyBUaGlzIGlucHV0IGlzIGFsd2F5cyBkZWZpbmVkLCBzaW5jZSB0aGUgbmFtZSBtYXRjaGVzIHNlbGVjdG9yLlxuXG4gIC8qKiBAbm9kb2MgKi9cbiAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcyk6IHZvaWQge1xuICAgIGlmICgncGF0dGVybicgaW4gY2hhbmdlcykge1xuICAgICAgdGhpcy5fY3JlYXRlVmFsaWRhdG9yKCk7XG4gICAgICBpZiAodGhpcy5fb25DaGFuZ2UpIHRoaXMuX29uQ2hhbmdlKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIE1ldGhvZCB0aGF0IHZhbGlkYXRlcyB3aGV0aGVyIHRoZSB2YWx1ZSBtYXRjaGVzIHRoZSBwYXR0ZXJuIHJlcXVpcmVtZW50LlxuICAgKiBAbm9kb2NcbiAgICovXG4gIHZhbGlkYXRlKGNvbnRyb2w6IEFic3RyYWN0Q29udHJvbCk6IFZhbGlkYXRpb25FcnJvcnN8bnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuX3ZhbGlkYXRvcihjb250cm9sKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlcnMgYSBjYWxsYmFjayBmdW5jdGlvbiB0byBjYWxsIHdoZW4gdGhlIHZhbGlkYXRvciBpbnB1dHMgY2hhbmdlLlxuICAgKiBAbm9kb2NcbiAgICovXG4gIHJlZ2lzdGVyT25WYWxpZGF0b3JDaGFuZ2UoZm46ICgpID0+IHZvaWQpOiB2b2lkIHtcbiAgICB0aGlzLl9vbkNoYW5nZSA9IGZuO1xuICB9XG5cbiAgcHJpdmF0ZSBfY3JlYXRlVmFsaWRhdG9yKCk6IHZvaWQge1xuICAgIHRoaXMuX3ZhbGlkYXRvciA9IHBhdHRlcm5WYWxpZGF0b3IodGhpcy5wYXR0ZXJuKTtcbiAgfVxufVxuIl19