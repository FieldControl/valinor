/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { booleanAttribute, Directive, forwardRef, Input, } from '@angular/core';
import { emailValidator, maxLengthValidator, maxValidator, minLengthValidator, minValidator, NG_VALIDATORS, nullValidator, patternValidator, requiredTrueValidator, requiredValidator, } from '../validators';
import * as i0 from "@angular/core";
/**
 * Method that updates string to integer if not already a number
 *
 * @param value The value to convert to integer.
 * @returns value of parameter converted to number or integer.
 */
function toInteger(value) {
    return typeof value === 'number' ? value : parseInt(value, 10);
}
/**
 * Method that ensures that provided value is a float (and converts it to float if needed).
 *
 * @param value The value to convert to float.
 * @returns value of parameter converted to number or float.
 */
function toFloat(value) {
    return typeof value === 'number' ? value : parseFloat(value);
}
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
    /** @nodoc */
    ngOnChanges(changes) {
        if (this.inputName in changes) {
            const input = this.normalizeInput(changes[this.inputName].currentValue);
            this._enabled = this.enabled(input);
            this._validator = this._enabled ? this.createValidator(input) : nullValidator;
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
    /**
     * @description
     * Determines whether this validator should be active or not based on an input.
     * Base class implementation checks whether an input is defined (if the value is different from
     * `null` and `undefined`). Validator classes that extend this base class can override this
     * function with the logic specific to a particular validator directive.
     */
    enabled(input) {
        return input != null /* both `null` and `undefined` */;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: AbstractValidatorDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.7", type: AbstractValidatorDirective, usesOnChanges: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: AbstractValidatorDirective, decorators: [{
            type: Directive
        }] });
/**
 * @description
 * Provider which adds `MaxValidator` to the `NG_VALIDATORS` multi-provider list.
 */
export const MAX_VALIDATOR = {
    provide: NG_VALIDATORS,
    useExisting: forwardRef(() => MaxValidator),
    multi: true,
};
/**
 * A directive which installs the {@link MaxValidator} for any `formControlName`,
 * `formControl`, or control with `ngModel` that also has a `max` attribute.
 *
 * @see [Form Validation](guide/forms/form-validation)
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
        this.normalizeInput = (input) => toFloat(input);
        /** @internal */
        this.createValidator = (max) => maxValidator(max);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: MaxValidator, deps: null, target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.7", type: MaxValidator, selector: "input[type=number][max][formControlName],input[type=number][max][formControl],input[type=number][max][ngModel]", inputs: { max: "max" }, host: { properties: { "attr.max": "_enabled ? max : null" } }, providers: [MAX_VALIDATOR], usesInheritance: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: MaxValidator, decorators: [{
            type: Directive,
            args: [{
                    selector: 'input[type=number][max][formControlName],input[type=number][max][formControl],input[type=number][max][ngModel]',
                    providers: [MAX_VALIDATOR],
                    host: { '[attr.max]': '_enabled ? max : null' },
                }]
        }], propDecorators: { max: [{
                type: Input
            }] } });
/**
 * @description
 * Provider which adds `MinValidator` to the `NG_VALIDATORS` multi-provider list.
 */
export const MIN_VALIDATOR = {
    provide: NG_VALIDATORS,
    useExisting: forwardRef(() => MinValidator),
    multi: true,
};
/**
 * A directive which installs the {@link MinValidator} for any `formControlName`,
 * `formControl`, or control with `ngModel` that also has a `min` attribute.
 *
 * @see [Form Validation](guide/forms/form-validation)
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
        this.normalizeInput = (input) => toFloat(input);
        /** @internal */
        this.createValidator = (min) => minValidator(min);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: MinValidator, deps: null, target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.7", type: MinValidator, selector: "input[type=number][min][formControlName],input[type=number][min][formControl],input[type=number][min][ngModel]", inputs: { min: "min" }, host: { properties: { "attr.min": "_enabled ? min : null" } }, providers: [MIN_VALIDATOR], usesInheritance: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: MinValidator, decorators: [{
            type: Directive,
            args: [{
                    selector: 'input[type=number][min][formControlName],input[type=number][min][formControl],input[type=number][min][ngModel]',
                    providers: [MIN_VALIDATOR],
                    host: { '[attr.min]': '_enabled ? min : null' },
                }]
        }], propDecorators: { min: [{
                type: Input
            }] } });
/**
 * @description
 * Provider which adds `RequiredValidator` to the `NG_VALIDATORS` multi-provider list.
 */
export const REQUIRED_VALIDATOR = {
    provide: NG_VALIDATORS,
    useExisting: forwardRef(() => RequiredValidator),
    multi: true,
};
/**
 * @description
 * Provider which adds `CheckboxRequiredValidator` to the `NG_VALIDATORS` multi-provider list.
 */
export const CHECKBOX_REQUIRED_VALIDATOR = {
    provide: NG_VALIDATORS,
    useExisting: forwardRef(() => CheckboxRequiredValidator),
    multi: true,
};
/**
 * @description
 * A directive that adds the `required` validator to any controls marked with the
 * `required` attribute. The directive is provided with the `NG_VALIDATORS` multi-provider list.
 *
 * @see [Form Validation](guide/forms/form-validation)
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
export class RequiredValidator extends AbstractValidatorDirective {
    constructor() {
        super(...arguments);
        /** @internal */
        this.inputName = 'required';
        /** @internal */
        this.normalizeInput = booleanAttribute;
        /** @internal */
        this.createValidator = (input) => requiredValidator;
    }
    /** @nodoc */
    enabled(input) {
        return input;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: RequiredValidator, deps: null, target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.7", type: RequiredValidator, selector: ":not([type=checkbox])[required][formControlName],:not([type=checkbox])[required][formControl],:not([type=checkbox])[required][ngModel]", inputs: { required: "required" }, host: { properties: { "attr.required": "_enabled ? \"\" : null" } }, providers: [REQUIRED_VALIDATOR], usesInheritance: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: RequiredValidator, decorators: [{
            type: Directive,
            args: [{
                    selector: ':not([type=checkbox])[required][formControlName],:not([type=checkbox])[required][formControl],:not([type=checkbox])[required][ngModel]',
                    providers: [REQUIRED_VALIDATOR],
                    host: { '[attr.required]': '_enabled ? "" : null' },
                }]
        }], propDecorators: { required: [{
                type: Input
            }] } });
/**
 * A Directive that adds the `required` validator to checkbox controls marked with the
 * `required` attribute. The directive is provided with the `NG_VALIDATORS` multi-provider list.
 *
 * @see [Form Validation](guide/forms/form-validation)
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
    constructor() {
        super(...arguments);
        /** @internal */
        this.createValidator = (input) => requiredTrueValidator;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: CheckboxRequiredValidator, deps: null, target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.7", type: CheckboxRequiredValidator, selector: "input[type=checkbox][required][formControlName],input[type=checkbox][required][formControl],input[type=checkbox][required][ngModel]", host: { properties: { "attr.required": "_enabled ? \"\" : null" } }, providers: [CHECKBOX_REQUIRED_VALIDATOR], usesInheritance: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: CheckboxRequiredValidator, decorators: [{
            type: Directive,
            args: [{
                    selector: 'input[type=checkbox][required][formControlName],input[type=checkbox][required][formControl],input[type=checkbox][required][ngModel]',
                    providers: [CHECKBOX_REQUIRED_VALIDATOR],
                    host: { '[attr.required]': '_enabled ? "" : null' },
                }]
        }] });
/**
 * @description
 * Provider which adds `EmailValidator` to the `NG_VALIDATORS` multi-provider list.
 */
export const EMAIL_VALIDATOR = {
    provide: NG_VALIDATORS,
    useExisting: forwardRef(() => EmailValidator),
    multi: true,
};
/**
 * A directive that adds the `email` validator to controls marked with the
 * `email` attribute. The directive is provided with the `NG_VALIDATORS` multi-provider list.
 *
 * The email validation is based on the WHATWG HTML specification with some enhancements to
 * incorporate more RFC rules. More information can be found on the [Validators.email
 * page](api/forms/Validators#email).
 *
 * @see [Form Validation](guide/forms/form-validation)
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
export class EmailValidator extends AbstractValidatorDirective {
    constructor() {
        super(...arguments);
        /** @internal */
        this.inputName = 'email';
        /** @internal */
        this.normalizeInput = booleanAttribute;
        /** @internal */
        this.createValidator = (input) => emailValidator;
    }
    /** @nodoc */
    enabled(input) {
        return input;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: EmailValidator, deps: null, target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.7", type: EmailValidator, selector: "[email][formControlName],[email][formControl],[email][ngModel]", inputs: { email: "email" }, providers: [EMAIL_VALIDATOR], usesInheritance: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: EmailValidator, decorators: [{
            type: Directive,
            args: [{
                    selector: '[email][formControlName],[email][formControl],[email][ngModel]',
                    providers: [EMAIL_VALIDATOR],
                }]
        }], propDecorators: { email: [{
                type: Input
            }] } });
/**
 * @description
 * Provider which adds `MinLengthValidator` to the `NG_VALIDATORS` multi-provider list.
 */
export const MIN_LENGTH_VALIDATOR = {
    provide: NG_VALIDATORS,
    useExisting: forwardRef(() => MinLengthValidator),
    multi: true,
};
/**
 * A directive that adds minimum length validation to controls marked with the
 * `minlength` attribute. The directive is provided with the `NG_VALIDATORS` multi-provider list.
 *
 * @see [Form Validation](guide/forms/form-validation)
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
export class MinLengthValidator extends AbstractValidatorDirective {
    constructor() {
        super(...arguments);
        /** @internal */
        this.inputName = 'minlength';
        /** @internal */
        this.normalizeInput = (input) => toInteger(input);
        /** @internal */
        this.createValidator = (minlength) => minLengthValidator(minlength);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: MinLengthValidator, deps: null, target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.7", type: MinLengthValidator, selector: "[minlength][formControlName],[minlength][formControl],[minlength][ngModel]", inputs: { minlength: "minlength" }, host: { properties: { "attr.minlength": "_enabled ? minlength : null" } }, providers: [MIN_LENGTH_VALIDATOR], usesInheritance: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: MinLengthValidator, decorators: [{
            type: Directive,
            args: [{
                    selector: '[minlength][formControlName],[minlength][formControl],[minlength][ngModel]',
                    providers: [MIN_LENGTH_VALIDATOR],
                    host: { '[attr.minlength]': '_enabled ? minlength : null' },
                }]
        }], propDecorators: { minlength: [{
                type: Input
            }] } });
/**
 * @description
 * Provider which adds `MaxLengthValidator` to the `NG_VALIDATORS` multi-provider list.
 */
export const MAX_LENGTH_VALIDATOR = {
    provide: NG_VALIDATORS,
    useExisting: forwardRef(() => MaxLengthValidator),
    multi: true,
};
/**
 * A directive that adds maximum length validation to controls marked with the
 * `maxlength` attribute. The directive is provided with the `NG_VALIDATORS` multi-provider list.
 *
 * @see [Form Validation](guide/forms/form-validation)
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
export class MaxLengthValidator extends AbstractValidatorDirective {
    constructor() {
        super(...arguments);
        /** @internal */
        this.inputName = 'maxlength';
        /** @internal */
        this.normalizeInput = (input) => toInteger(input);
        /** @internal */
        this.createValidator = (maxlength) => maxLengthValidator(maxlength);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: MaxLengthValidator, deps: null, target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.7", type: MaxLengthValidator, selector: "[maxlength][formControlName],[maxlength][formControl],[maxlength][ngModel]", inputs: { maxlength: "maxlength" }, host: { properties: { "attr.maxlength": "_enabled ? maxlength : null" } }, providers: [MAX_LENGTH_VALIDATOR], usesInheritance: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: MaxLengthValidator, decorators: [{
            type: Directive,
            args: [{
                    selector: '[maxlength][formControlName],[maxlength][formControl],[maxlength][ngModel]',
                    providers: [MAX_LENGTH_VALIDATOR],
                    host: { '[attr.maxlength]': '_enabled ? maxlength : null' },
                }]
        }], propDecorators: { maxlength: [{
                type: Input
            }] } });
/**
 * @description
 * Provider which adds `PatternValidator` to the `NG_VALIDATORS` multi-provider list.
 */
export const PATTERN_VALIDATOR = {
    provide: NG_VALIDATORS,
    useExisting: forwardRef(() => PatternValidator),
    multi: true,
};
/**
 * @description
 * A directive that adds regex pattern validation to controls marked with the
 * `pattern` attribute. The regex must match the entire control value.
 * The directive is provided with the `NG_VALIDATORS` multi-provider list.
 *
 * @see [Form Validation](guide/forms/form-validation)
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
export class PatternValidator extends AbstractValidatorDirective {
    constructor() {
        super(...arguments);
        /** @internal */
        this.inputName = 'pattern';
        /** @internal */
        this.normalizeInput = (input) => input;
        /** @internal */
        this.createValidator = (input) => patternValidator(input);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: PatternValidator, deps: null, target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.7", type: PatternValidator, selector: "[pattern][formControlName],[pattern][formControl],[pattern][ngModel]", inputs: { pattern: "pattern" }, host: { properties: { "attr.pattern": "_enabled ? pattern : null" } }, providers: [PATTERN_VALIDATOR], usesInheritance: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: PatternValidator, decorators: [{
            type: Directive,
            args: [{
                    selector: '[pattern][formControlName],[pattern][formControl],[pattern][ngModel]',
                    providers: [PATTERN_VALIDATOR],
                    host: { '[attr.pattern]': '_enabled ? pattern : null' },
                }]
        }], propDecorators: { pattern: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdG9ycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2Zvcm1zL3NyYy9kaXJlY3RpdmVzL3ZhbGlkYXRvcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUNMLGdCQUFnQixFQUNoQixTQUFTLEVBQ1QsVUFBVSxFQUNWLEtBQUssR0FJTixNQUFNLGVBQWUsQ0FBQztBQUl2QixPQUFPLEVBQ0wsY0FBYyxFQUNkLGtCQUFrQixFQUNsQixZQUFZLEVBQ1osa0JBQWtCLEVBQ2xCLFlBQVksRUFDWixhQUFhLEVBQ2IsYUFBYSxFQUNiLGdCQUFnQixFQUNoQixxQkFBcUIsRUFDckIsaUJBQWlCLEdBQ2xCLE1BQU0sZUFBZSxDQUFDOztBQUV2Qjs7Ozs7R0FLRztBQUNILFNBQVMsU0FBUyxDQUFDLEtBQXNCO0lBQ3ZDLE9BQU8sT0FBTyxLQUFLLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDakUsQ0FBQztBQUVEOzs7OztHQUtHO0FBQ0gsU0FBUyxPQUFPLENBQUMsS0FBc0I7SUFDckMsT0FBTyxPQUFPLEtBQUssS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQy9ELENBQUM7QUEwREQ7Ozs7O0dBS0c7QUFDSCxNQUNlLDBCQUEwQjtJQUR6QztRQUVVLGVBQVUsR0FBZ0IsYUFBYSxDQUFDO0tBdUVqRDtJQWhDQyxhQUFhO0lBQ2IsV0FBVyxDQUFDLE9BQXNCO1FBQ2hDLElBQUksSUFBSSxDQUFDLFNBQVMsSUFBSSxPQUFPLEVBQUUsQ0FBQztZQUM5QixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxD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QkFBaUIsQ0FBQztvQkFDOUIsSUFBSSxFQUFFLEVBQUMsZ0JBQWdCLEVBQUUsMkJBQTJCLEVBQUM7aUJBQ3REOzhCQU9DLE9BQU87c0JBRE4sS0FBSyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtcbiAgYm9vbGVhbkF0dHJpYnV0ZSxcbiAgRGlyZWN0aXZlLFxuICBmb3J3YXJkUmVmLFxuICBJbnB1dCxcbiAgT25DaGFuZ2VzLFxuICBQcm92aWRlcixcbiAgU2ltcGxlQ2hhbmdlcyxcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge09ic2VydmFibGV9IGZyb20gJ3J4anMnO1xuXG5pbXBvcnQge0Fic3RyYWN0Q29udHJvbH0gZnJvbSAnLi4vbW9kZWwvYWJzdHJhY3RfbW9kZWwnO1xuaW1wb3J0IHtcbiAgZW1haWxWYWxpZGF0b3IsXG4gIG1heExlbmd0aFZhbGlkYXRvcixcbiAgbWF4VmFsaWRhdG9yLFxuICBtaW5MZW5ndGhWYWxpZGF0b3IsXG4gIG1pblZhbGlkYXRvcixcbiAgTkdfVkFMSURBVE9SUyxcbiAgbnVsbFZhbGlkYXRvcixcbiAgcGF0dGVyblZhbGlkYXRvcixcbiAgcmVxdWlyZWRUcnVlVmFsaWRhdG9yLFxuICByZXF1aXJlZFZhbGlkYXRvcixcbn0gZnJvbSAnLi4vdmFsaWRhdG9ycyc7XG5cbi8qKlxuICogTWV0aG9kIHRoYXQgdXBkYXRlcyBzdHJpbmcgdG8gaW50ZWdlciBpZiBub3QgYWxyZWFkeSBhIG51bWJlclxuICpcbiAqIEBwYXJhbSB2YWx1ZSBUaGUgdmFsdWUgdG8gY29udmVydCB0byBpbnRlZ2VyLlxuICogQHJldHVybnMgdmFsdWUgb2YgcGFyYW1ldGVyIGNvbnZlcnRlZCB0byBudW1iZXIgb3IgaW50ZWdlci5cbiAqL1xuZnVuY3Rpb24gdG9JbnRlZ2VyKHZhbHVlOiBzdHJpbmcgfCBudW1iZXIpOiBudW1iZXIge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyA/IHZhbHVlIDogcGFyc2VJbnQodmFsdWUsIDEwKTtcbn1cblxuLyoqXG4gKiBNZXRob2QgdGhhdCBlbnN1cmVzIHRoYXQgcHJvdmlkZWQgdmFsdWUgaXMgYSBmbG9hdCAoYW5kIGNvbnZlcnRzIGl0IHRvIGZsb2F0IGlmIG5lZWRlZCkuXG4gKlxuICogQHBhcmFtIHZhbHVlIFRoZSB2YWx1ZSB0byBjb252ZXJ0IHRvIGZsb2F0LlxuICogQHJldHVybnMgdmFsdWUgb2YgcGFyYW1ldGVyIGNvbnZlcnRlZCB0byBudW1iZXIgb3IgZmxvYXQuXG4gKi9cbmZ1bmN0aW9uIHRvRmxvYXQodmFsdWU6IHN0cmluZyB8IG51bWJlcik6IG51bWJlciB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInID8gdmFsdWUgOiBwYXJzZUZsb2F0KHZhbHVlKTtcbn1cblxuLyoqXG4gKiBAZGVzY3JpcHRpb25cbiAqIERlZmluZXMgdGhlIG1hcCBvZiBlcnJvcnMgcmV0dXJuZWQgZnJvbSBmYWlsZWQgdmFsaWRhdGlvbiBjaGVja3MuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgdHlwZSBWYWxpZGF0aW9uRXJyb3JzID0ge1xuICBba2V5OiBzdHJpbmddOiBhbnk7XG59O1xuXG4vKipcbiAqIEBkZXNjcmlwdGlvblxuICogQW4gaW50ZXJmYWNlIGltcGxlbWVudGVkIGJ5IGNsYXNzZXMgdGhhdCBwZXJmb3JtIHN5bmNocm9ub3VzIHZhbGlkYXRpb24uXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqXG4gKiAjIyMgUHJvdmlkZSBhIGN1c3RvbSB2YWxpZGF0b3JcbiAqXG4gKiBUaGUgZm9sbG93aW5nIGV4YW1wbGUgaW1wbGVtZW50cyB0aGUgYFZhbGlkYXRvcmAgaW50ZXJmYWNlIHRvIGNyZWF0ZSBhXG4gKiB2YWxpZGF0b3IgZGlyZWN0aXZlIHdpdGggYSBjdXN0b20gZXJyb3Iga2V5LlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIEBEaXJlY3RpdmUoe1xuICogICBzZWxlY3RvcjogJ1tjdXN0b21WYWxpZGF0b3JdJyxcbiAqICAgcHJvdmlkZXJzOiBbe3Byb3ZpZGU6IE5HX1ZBTElEQVRPUlMsIHVzZUV4aXN0aW5nOiBDdXN0b21WYWxpZGF0b3JEaXJlY3RpdmUsIG11bHRpOiB0cnVlfV1cbiAqIH0pXG4gKiBjbGFzcyBDdXN0b21WYWxpZGF0b3JEaXJlY3RpdmUgaW1wbGVtZW50cyBWYWxpZGF0b3Ige1xuICogICB2YWxpZGF0ZShjb250cm9sOiBBYnN0cmFjdENvbnRyb2wpOiBWYWxpZGF0aW9uRXJyb3JzfG51bGwge1xuICogICAgIHJldHVybiB7J2N1c3RvbSc6IHRydWV9O1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgVmFsaWRhdG9yIHtcbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBNZXRob2QgdGhhdCBwZXJmb3JtcyBzeW5jaHJvbm91cyB2YWxpZGF0aW9uIGFnYWluc3QgdGhlIHByb3ZpZGVkIGNvbnRyb2wuXG4gICAqXG4gICAqIEBwYXJhbSBjb250cm9sIFRoZSBjb250cm9sIHRvIHZhbGlkYXRlIGFnYWluc3QuXG4gICAqXG4gICAqIEByZXR1cm5zIEEgbWFwIG9mIHZhbGlkYXRpb24gZXJyb3JzIGlmIHZhbGlkYXRpb24gZmFpbHMsXG4gICAqIG90aGVyd2lzZSBudWxsLlxuICAgKi9cbiAgdmFsaWRhdGUoY29udHJvbDogQWJzdHJhY3RDb250cm9sKTogVmFsaWRhdGlvbkVycm9ycyB8IG51bGw7XG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBSZWdpc3RlcnMgYSBjYWxsYmFjayBmdW5jdGlvbiB0byBjYWxsIHdoZW4gdGhlIHZhbGlkYXRvciBpbnB1dHMgY2hhbmdlLlxuICAgKlxuICAgKiBAcGFyYW0gZm4gVGhlIGNhbGxiYWNrIGZ1bmN0aW9uXG4gICAqL1xuICByZWdpc3Rlck9uVmFsaWRhdG9yQ2hhbmdlPyhmbjogKCkgPT4gdm9pZCk6IHZvaWQ7XG59XG5cbi8qKlxuICogQSBiYXNlIGNsYXNzIGZvciBWYWxpZGF0b3ItYmFzZWQgRGlyZWN0aXZlcy4gVGhlIGNsYXNzIGNvbnRhaW5zIGNvbW1vbiBsb2dpYyBzaGFyZWQgYWNyb3NzIHN1Y2hcbiAqIERpcmVjdGl2ZXMuXG4gKlxuICogRm9yIGludGVybmFsIHVzZSBvbmx5LCB0aGlzIGNsYXNzIGlzIG5vdCBpbnRlbmRlZCBmb3IgdXNlIG91dHNpZGUgb2YgdGhlIEZvcm1zIHBhY2thZ2UuXG4gKi9cbkBEaXJlY3RpdmUoKVxuYWJzdHJhY3QgY2xhc3MgQWJzdHJhY3RWYWxpZGF0b3JEaXJlY3RpdmUgaW1wbGVtZW50cyBWYWxpZGF0b3IsIE9uQ2hhbmdlcyB7XG4gIHByaXZhdGUgX3ZhbGlkYXRvcjogVmFsaWRhdG9yRm4gPSBudWxsVmFsaWRhdG9yO1xuICBwcml2YXRlIF9vbkNoYW5nZSE6ICgpID0+IHZvaWQ7XG5cbiAgLyoqXG4gICAqIEEgZmxhZyB0aGF0IHRyYWNrcyB3aGV0aGVyIHRoaXMgdmFsaWRhdG9yIGlzIGVuYWJsZWQuXG4gICAqXG4gICAqIE1hcmtpbmcgaXQgYGludGVybmFsYCAodnMgYHByb3RlY3RlZGApLCBzbyB0aGF0IHRoaXMgZmxhZyBjYW4gYmUgdXNlZCBpbiBob3N0IGJpbmRpbmdzIG9mXG4gICAqIGRpcmVjdGl2ZSBjbGFzc2VzIHRoYXQgZXh0ZW5kIHRoaXMgYmFzZSBjbGFzcy5cbiAgICogQGludGVybmFsXG4gICAqL1xuICBfZW5hYmxlZD86IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIE5hbWUgb2YgYW4gaW5wdXQgdGhhdCBtYXRjaGVzIGRpcmVjdGl2ZSBzZWxlY3RvciBhdHRyaWJ1dGUgKGUuZy4gYG1pbmxlbmd0aGAgZm9yXG4gICAqIGBNaW5MZW5ndGhEaXJlY3RpdmVgKS4gQW4gaW5wdXQgd2l0aCBhIGdpdmVuIG5hbWUgbWlnaHQgY29udGFpbiBjb25maWd1cmF0aW9uIGluZm9ybWF0aW9uIChsaWtlXG4gICAqIGBtaW5sZW5ndGg9JzEwJ2ApIG9yIGEgZmxhZyB0aGF0IGluZGljYXRlcyB3aGV0aGVyIHZhbGlkYXRvciBzaG91bGQgYmUgZW5hYmxlZCAobGlrZVxuICAgKiBgW3JlcXVpcmVkXT0nZmFsc2UnYCkuXG4gICAqXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgYWJzdHJhY3QgaW5wdXROYW1lOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYW4gaW5zdGFuY2Ugb2YgYSB2YWxpZGF0b3IgKHNwZWNpZmljIHRvIGEgZGlyZWN0aXZlIHRoYXQgZXh0ZW5kcyB0aGlzIGJhc2UgY2xhc3MpLlxuICAgKlxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIGFic3RyYWN0IGNyZWF0ZVZhbGlkYXRvcihpbnB1dDogdW5rbm93bik6IFZhbGlkYXRvckZuO1xuXG4gIC8qKlxuICAgKiBQZXJmb3JtcyB0aGUgbmVjZXNzYXJ5IGlucHV0IG5vcm1hbGl6YXRpb24gYmFzZWQgb24gYSBzcGVjaWZpYyBsb2dpYyBvZiBhIERpcmVjdGl2ZS5cbiAgICogRm9yIGV4YW1wbGUsIHRoZSBmdW5jdGlvbiBtaWdodCBiZSB1c2VkIHRvIGNvbnZlcnQgc3RyaW5nLWJhc2VkIHJlcHJlc2VudGF0aW9uIG9mIHRoZVxuICAgKiBgbWlubGVuZ3RoYCBpbnB1dCB0byBhbiBpbnRlZ2VyIHZhbHVlIHRoYXQgY2FuIGxhdGVyIGJlIHVzZWQgaW4gdGhlIGBWYWxpZGF0b3JzLm1pbkxlbmd0aGBcbiAgICogdmFsaWRhdG9yLlxuICAgKlxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIGFic3RyYWN0IG5vcm1hbGl6ZUlucHV0KGlucHV0OiB1bmtub3duKTogdW5rbm93bjtcblxuICAvKiogQG5vZG9jICovXG4gIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5pbnB1dE5hbWUgaW4gY2hhbmdlcykge1xuICAgICAgY29uc3QgaW5wdXQgPSB0aGlzLm5vcm1hbGl6ZUlucHV0KGNoYW5nZXNbdGhpcy5pbnB1dE5hbWVdLmN1cnJlbnRWYWx1ZSk7XG4gICAgICB0aGlzLl9lbmFibGVkID0gdGhpcy5lbmFibGVkKGlucHV0KTtcbiAgICAgIHRoaXMuX3ZhbGlkYXRvciA9IHRoaXMuX2VuYWJsZWQgPyB0aGlzLmNyZWF0ZVZhbGlkYXRvcihpbnB1dCkgOiBudWxsVmFsaWRhdG9yO1xuICAgICAgaWYgKHRoaXMuX29uQ2hhbmdlKSB7XG4gICAgICAgIHRoaXMuX29uQ2hhbmdlKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqIEBub2RvYyAqL1xuICB2YWxpZGF0ZShjb250cm9sOiBBYnN0cmFjdENvbnRyb2wpOiBWYWxpZGF0aW9uRXJyb3JzIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuX3ZhbGlkYXRvcihjb250cm9sKTtcbiAgfVxuXG4gIC8qKiBAbm9kb2MgKi9cbiAgcmVnaXN0ZXJPblZhbGlkYXRvckNoYW5nZShmbjogKCkgPT4gdm9pZCk6IHZvaWQge1xuICAgIHRoaXMuX29uQ2hhbmdlID0gZm47XG4gIH1cblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIERldGVybWluZXMgd2hldGhlciB0aGlzIHZhbGlkYXRvciBzaG91bGQgYmUgYWN0aXZlIG9yIG5vdCBiYXNlZCBvbiBhbiBpbnB1dC5cbiAgICogQmFzZSBjbGFzcyBpbXBsZW1lbnRhdGlvbiBjaGVja3Mgd2hldGhlciBhbiBpbnB1dCBpcyBkZWZpbmVkIChpZiB0aGUgdmFsdWUgaXMgZGlmZmVyZW50IGZyb21cbiAgICogYG51bGxgIGFuZCBgdW5kZWZpbmVkYCkuIFZhbGlkYXRvciBjbGFzc2VzIHRoYXQgZXh0ZW5kIHRoaXMgYmFzZSBjbGFzcyBjYW4gb3ZlcnJpZGUgdGhpc1xuICAgKiBmdW5jdGlvbiB3aXRoIHRoZSBsb2dpYyBzcGVjaWZpYyB0byBhIHBhcnRpY3VsYXIgdmFsaWRhdG9yIGRpcmVjdGl2ZS5cbiAgICovXG4gIGVuYWJsZWQoaW5wdXQ6IHVua25vd24pOiBib29sZWFuIHtcbiAgICByZXR1cm4gaW5wdXQgIT0gbnVsbCAvKiBib3RoIGBudWxsYCBhbmQgYHVuZGVmaW5lZGAgKi87XG4gIH1cbn1cblxuLyoqXG4gKiBAZGVzY3JpcHRpb25cbiAqIFByb3ZpZGVyIHdoaWNoIGFkZHMgYE1heFZhbGlkYXRvcmAgdG8gdGhlIGBOR19WQUxJREFUT1JTYCBtdWx0aS1wcm92aWRlciBsaXN0LlxuICovXG5leHBvcnQgY29uc3QgTUFYX1ZBTElEQVRPUjogUHJvdmlkZXIgPSB7XG4gIHByb3ZpZGU6IE5HX1ZBTElEQVRPUlMsXG4gIHVzZUV4aXN0aW5nOiBmb3J3YXJkUmVmKCgpID0+IE1heFZhbGlkYXRvciksXG4gIG11bHRpOiB0cnVlLFxufTtcblxuLyoqXG4gKiBBIGRpcmVjdGl2ZSB3aGljaCBpbnN0YWxscyB0aGUge0BsaW5rIE1heFZhbGlkYXRvcn0gZm9yIGFueSBgZm9ybUNvbnRyb2xOYW1lYCxcbiAqIGBmb3JtQ29udHJvbGAsIG9yIGNvbnRyb2wgd2l0aCBgbmdNb2RlbGAgdGhhdCBhbHNvIGhhcyBhIGBtYXhgIGF0dHJpYnV0ZS5cbiAqXG4gKiBAc2VlIFtGb3JtIFZhbGlkYXRpb25dKGd1aWRlL2Zvcm1zL2Zvcm0tdmFsaWRhdGlvbilcbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICpcbiAqICMjIyBBZGRpbmcgYSBtYXggdmFsaWRhdG9yXG4gKlxuICogVGhlIGZvbGxvd2luZyBleGFtcGxlIHNob3dzIGhvdyB0byBhZGQgYSBtYXggdmFsaWRhdG9yIHRvIGFuIGlucHV0IGF0dGFjaGVkIHRvIGFuXG4gKiBuZ01vZGVsIGJpbmRpbmcuXG4gKlxuICogYGBgaHRtbFxuICogPGlucHV0IHR5cGU9XCJudW1iZXJcIiBuZ01vZGVsIG1heD1cIjRcIj5cbiAqIGBgYFxuICpcbiAqIEBuZ01vZHVsZSBSZWFjdGl2ZUZvcm1zTW9kdWxlXG4gKiBAbmdNb2R1bGUgRm9ybXNNb2R1bGVcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOlxuICAgICdpbnB1dFt0eXBlPW51bWJlcl1bbWF4XVtmb3JtQ29udHJvbE5hbWVdLGlucHV0W3R5cGU9bnVtYmVyXVttYXhdW2Zvcm1Db250cm9sXSxpbnB1dFt0eXBlPW51bWJlcl1bbWF4XVtuZ01vZGVsXScsXG4gIHByb3ZpZGVyczogW01BWF9WQUxJREFUT1JdLFxuICBob3N0OiB7J1thdHRyLm1heF0nOiAnX2VuYWJsZWQgPyBtYXggOiBudWxsJ30sXG59KVxuZXhwb3J0IGNsYXNzIE1heFZhbGlkYXRvciBleHRlbmRzIEFic3RyYWN0VmFsaWRhdG9yRGlyZWN0aXZlIHtcbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBUcmFja3MgY2hhbmdlcyB0byB0aGUgbWF4IGJvdW5kIHRvIHRoaXMgZGlyZWN0aXZlLlxuICAgKi9cbiAgQElucHV0KCkgbWF4ITogc3RyaW5nIHwgbnVtYmVyIHwgbnVsbDtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBvdmVycmlkZSBpbnB1dE5hbWUgPSAnbWF4JztcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBvdmVycmlkZSBub3JtYWxpemVJbnB1dCA9IChpbnB1dDogc3RyaW5nIHwgbnVtYmVyKTogbnVtYmVyID0+IHRvRmxvYXQoaW5wdXQpO1xuICAvKiogQGludGVybmFsICovXG4gIG92ZXJyaWRlIGNyZWF0ZVZhbGlkYXRvciA9IChtYXg6IG51bWJlcik6IFZhbGlkYXRvckZuID0+IG1heFZhbGlkYXRvcihtYXgpO1xufVxuXG4vKipcbiAqIEBkZXNjcmlwdGlvblxuICogUHJvdmlkZXIgd2hpY2ggYWRkcyBgTWluVmFsaWRhdG9yYCB0byB0aGUgYE5HX1ZBTElEQVRPUlNgIG11bHRpLXByb3ZpZGVyIGxpc3QuXG4gKi9cbmV4cG9ydCBjb25zdCBNSU5fVkFMSURBVE9SOiBQcm92aWRlciA9IHtcbiAgcHJvdmlkZTogTkdfVkFMSURBVE9SUyxcbiAgdXNlRXhpc3Rpbmc6IGZvcndhcmRSZWYoKCkgPT4gTWluVmFsaWRhdG9yKSxcbiAgbXVsdGk6IHRydWUsXG59O1xuXG4vKipcbiAqIEEgZGlyZWN0aXZlIHdoaWNoIGluc3RhbGxzIHRoZSB7QGxpbmsgTWluVmFsaWRhdG9yfSBmb3IgYW55IGBmb3JtQ29udHJvbE5hbWVgLFxuICogYGZvcm1Db250cm9sYCwgb3IgY29udHJvbCB3aXRoIGBuZ01vZGVsYCB0aGF0IGFsc28gaGFzIGEgYG1pbmAgYXR0cmlidXRlLlxuICpcbiAqIEBzZWUgW0Zvcm0gVmFsaWRhdGlvbl0oZ3VpZGUvZm9ybXMvZm9ybS12YWxpZGF0aW9uKVxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKlxuICogIyMjIEFkZGluZyBhIG1pbiB2YWxpZGF0b3JcbiAqXG4gKiBUaGUgZm9sbG93aW5nIGV4YW1wbGUgc2hvd3MgaG93IHRvIGFkZCBhIG1pbiB2YWxpZGF0b3IgdG8gYW4gaW5wdXQgYXR0YWNoZWQgdG8gYW5cbiAqIG5nTW9kZWwgYmluZGluZy5cbiAqXG4gKiBgYGBodG1sXG4gKiA8aW5wdXQgdHlwZT1cIm51bWJlclwiIG5nTW9kZWwgbWluPVwiNFwiPlxuICogYGBgXG4gKlxuICogQG5nTW9kdWxlIFJlYWN0aXZlRm9ybXNNb2R1bGVcbiAqIEBuZ01vZHVsZSBGb3Jtc01vZHVsZVxuICogQHB1YmxpY0FwaVxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6XG4gICAgJ2lucHV0W3R5cGU9bnVtYmVyXVttaW5dW2Zvcm1Db250cm9sTmFtZV0saW5wdXRbdHlwZT1udW1iZXJdW21pbl1bZm9ybUNvbnRyb2xdLGlucHV0W3R5cGU9bnVtYmVyXVttaW5dW25nTW9kZWxdJyxcbiAgcHJvdmlkZXJzOiBbTUlOX1ZBTElEQVRPUl0sXG4gIGhvc3Q6IHsnW2F0dHIubWluXSc6ICdfZW5hYmxlZCA/IG1pbiA6IG51bGwnfSxcbn0pXG5leHBvcnQgY2xhc3MgTWluVmFsaWRhdG9yIGV4dGVuZHMgQWJzdHJhY3RWYWxpZGF0b3JEaXJlY3RpdmUge1xuICAvKipcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIFRyYWNrcyBjaGFuZ2VzIHRvIHRoZSBtaW4gYm91bmQgdG8gdGhpcyBkaXJlY3RpdmUuXG4gICAqL1xuICBASW5wdXQoKSBtaW4hOiBzdHJpbmcgfCBudW1iZXIgfCBudWxsO1xuICAvKiogQGludGVybmFsICovXG4gIG92ZXJyaWRlIGlucHV0TmFtZSA9ICdtaW4nO1xuICAvKiogQGludGVybmFsICovXG4gIG92ZXJyaWRlIG5vcm1hbGl6ZUlucHV0ID0gKGlucHV0OiBzdHJpbmcgfCBudW1iZXIpOiBudW1iZXIgPT4gdG9GbG9hdChpbnB1dCk7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgb3ZlcnJpZGUgY3JlYXRlVmFsaWRhdG9yID0gKG1pbjogbnVtYmVyKTogVmFsaWRhdG9yRm4gPT4gbWluVmFsaWRhdG9yKG1pbik7XG59XG5cbi8qKlxuICogQGRlc2NyaXB0aW9uXG4gKiBBbiBpbnRlcmZhY2UgaW1wbGVtZW50ZWQgYnkgY2xhc3NlcyB0aGF0IHBlcmZvcm0gYXN5bmNocm9ub3VzIHZhbGlkYXRpb24uXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqXG4gKiAjIyMgUHJvdmlkZSBhIGN1c3RvbSBhc3luYyB2YWxpZGF0b3IgZGlyZWN0aXZlXG4gKlxuICogVGhlIGZvbGxvd2luZyBleGFtcGxlIGltcGxlbWVudHMgdGhlIGBBc3luY1ZhbGlkYXRvcmAgaW50ZXJmYWNlIHRvIGNyZWF0ZSBhblxuICogYXN5bmMgdmFsaWRhdG9yIGRpcmVjdGl2ZSB3aXRoIGEgY3VzdG9tIGVycm9yIGtleS5cbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBpbXBvcnQgeyBvZiB9IGZyb20gJ3J4anMnO1xuICpcbiAqIEBEaXJlY3RpdmUoe1xuICogICBzZWxlY3RvcjogJ1tjdXN0b21Bc3luY1ZhbGlkYXRvcl0nLFxuICogICBwcm92aWRlcnM6IFt7cHJvdmlkZTogTkdfQVNZTkNfVkFMSURBVE9SUywgdXNlRXhpc3Rpbmc6IEN1c3RvbUFzeW5jVmFsaWRhdG9yRGlyZWN0aXZlLCBtdWx0aTpcbiAqIHRydWV9XVxuICogfSlcbiAqIGNsYXNzIEN1c3RvbUFzeW5jVmFsaWRhdG9yRGlyZWN0aXZlIGltcGxlbWVudHMgQXN5bmNWYWxpZGF0b3Ige1xuICogICB2YWxpZGF0ZShjb250cm9sOiBBYnN0cmFjdENvbnRyb2wpOiBPYnNlcnZhYmxlPFZhbGlkYXRpb25FcnJvcnN8bnVsbD4ge1xuICogICAgIHJldHVybiBvZih7J2N1c3RvbSc6IHRydWV9KTtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgaW50ZXJmYWNlIEFzeW5jVmFsaWRhdG9yIGV4dGVuZHMgVmFsaWRhdG9yIHtcbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBNZXRob2QgdGhhdCBwZXJmb3JtcyBhc3luYyB2YWxpZGF0aW9uIGFnYWluc3QgdGhlIHByb3ZpZGVkIGNvbnRyb2wuXG4gICAqXG4gICAqIEBwYXJhbSBjb250cm9sIFRoZSBjb250cm9sIHRvIHZhbGlkYXRlIGFnYWluc3QuXG4gICAqXG4gICAqIEByZXR1cm5zIEEgcHJvbWlzZSBvciBvYnNlcnZhYmxlIHRoYXQgcmVzb2x2ZXMgYSBtYXAgb2YgdmFsaWRhdGlvbiBlcnJvcnNcbiAgICogaWYgdmFsaWRhdGlvbiBmYWlscywgb3RoZXJ3aXNlIG51bGwuXG4gICAqL1xuICB2YWxpZGF0ZShcbiAgICBjb250cm9sOiBBYnN0cmFjdENvbnRyb2wsXG4gICk6IFByb21pc2U8VmFsaWRhdGlvbkVycm9ycyB8IG51bGw+IHwgT2JzZXJ2YWJsZTxWYWxpZGF0aW9uRXJyb3JzIHwgbnVsbD47XG59XG5cbi8qKlxuICogQGRlc2NyaXB0aW9uXG4gKiBQcm92aWRlciB3aGljaCBhZGRzIGBSZXF1aXJlZFZhbGlkYXRvcmAgdG8gdGhlIGBOR19WQUxJREFUT1JTYCBtdWx0aS1wcm92aWRlciBsaXN0LlxuICovXG5leHBvcnQgY29uc3QgUkVRVUlSRURfVkFMSURBVE9SOiBQcm92aWRlciA9IHtcbiAgcHJvdmlkZTogTkdfVkFMSURBVE9SUyxcbiAgdXNlRXhpc3Rpbmc6IGZvcndhcmRSZWYoKCkgPT4gUmVxdWlyZWRWYWxpZGF0b3IpLFxuICBtdWx0aTogdHJ1ZSxcbn07XG5cbi8qKlxuICogQGRlc2NyaXB0aW9uXG4gKiBQcm92aWRlciB3aGljaCBhZGRzIGBDaGVja2JveFJlcXVpcmVkVmFsaWRhdG9yYCB0byB0aGUgYE5HX1ZBTElEQVRPUlNgIG11bHRpLXByb3ZpZGVyIGxpc3QuXG4gKi9cbmV4cG9ydCBjb25zdCBDSEVDS0JPWF9SRVFVSVJFRF9WQUxJREFUT1I6IFByb3ZpZGVyID0ge1xuICBwcm92aWRlOiBOR19WQUxJREFUT1JTLFxuICB1c2VFeGlzdGluZzogZm9yd2FyZFJlZigoKSA9PiBDaGVja2JveFJlcXVpcmVkVmFsaWRhdG9yKSxcbiAgbXVsdGk6IHRydWUsXG59O1xuXG4vKipcbiAqIEBkZXNjcmlwdGlvblxuICogQSBkaXJlY3RpdmUgdGhhdCBhZGRzIHRoZSBgcmVxdWlyZWRgIHZhbGlkYXRvciB0byBhbnkgY29udHJvbHMgbWFya2VkIHdpdGggdGhlXG4gKiBgcmVxdWlyZWRgIGF0dHJpYnV0ZS4gVGhlIGRpcmVjdGl2ZSBpcyBwcm92aWRlZCB3aXRoIHRoZSBgTkdfVkFMSURBVE9SU2AgbXVsdGktcHJvdmlkZXIgbGlzdC5cbiAqXG4gKiBAc2VlIFtGb3JtIFZhbGlkYXRpb25dKGd1aWRlL2Zvcm1zL2Zvcm0tdmFsaWRhdGlvbilcbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICpcbiAqICMjIyBBZGRpbmcgYSByZXF1aXJlZCB2YWxpZGF0b3IgdXNpbmcgdGVtcGxhdGUtZHJpdmVuIGZvcm1zXG4gKlxuICogYGBgXG4gKiA8aW5wdXQgbmFtZT1cImZ1bGxOYW1lXCIgbmdNb2RlbCByZXF1aXJlZD5cbiAqIGBgYFxuICpcbiAqIEBuZ01vZHVsZSBGb3Jtc01vZHVsZVxuICogQG5nTW9kdWxlIFJlYWN0aXZlRm9ybXNNb2R1bGVcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOlxuICAgICc6bm90KFt0eXBlPWNoZWNrYm94XSlbcmVxdWlyZWRdW2Zvcm1Db250cm9sTmFtZV0sOm5vdChbdHlwZT1jaGVja2JveF0pW3JlcXVpcmVkXVtmb3JtQ29udHJvbF0sOm5vdChbdHlwZT1jaGVja2JveF0pW3JlcXVpcmVkXVtuZ01vZGVsXScsXG4gIHByb3ZpZGVyczogW1JFUVVJUkVEX1ZBTElEQVRPUl0sXG4gIGhvc3Q6IHsnW2F0dHIucmVxdWlyZWRdJzogJ19lbmFibGVkID8gXCJcIiA6IG51bGwnfSxcbn0pXG5leHBvcnQgY2xhc3MgUmVxdWlyZWRWYWxpZGF0b3IgZXh0ZW5kcyBBYnN0cmFjdFZhbGlkYXRvckRpcmVjdGl2ZSB7XG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogVHJhY2tzIGNoYW5nZXMgdG8gdGhlIHJlcXVpcmVkIGF0dHJpYnV0ZSBib3VuZCB0byB0aGlzIGRpcmVjdGl2ZS5cbiAgICovXG4gIEBJbnB1dCgpIHJlcXVpcmVkITogYm9vbGVhbiB8IHN0cmluZztcblxuICAvKiogQGludGVybmFsICovXG4gIG92ZXJyaWRlIGlucHV0TmFtZSA9ICdyZXF1aXJlZCc7XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBvdmVycmlkZSBub3JtYWxpemVJbnB1dCA9IGJvb2xlYW5BdHRyaWJ1dGU7XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBvdmVycmlkZSBjcmVhdGVWYWxpZGF0b3IgPSAoaW5wdXQ6IGJvb2xlYW4pOiBWYWxpZGF0b3JGbiA9PiByZXF1aXJlZFZhbGlkYXRvcjtcblxuICAvKiogQG5vZG9jICovXG4gIG92ZXJyaWRlIGVuYWJsZWQoaW5wdXQ6IGJvb2xlYW4pOiBib29sZWFuIHtcbiAgICByZXR1cm4gaW5wdXQ7XG4gIH1cbn1cblxuLyoqXG4gKiBBIERpcmVjdGl2ZSB0aGF0IGFkZHMgdGhlIGByZXF1aXJlZGAgdmFsaWRhdG9yIHRvIGNoZWNrYm94IGNvbnRyb2xzIG1hcmtlZCB3aXRoIHRoZVxuICogYHJlcXVpcmVkYCBhdHRyaWJ1dGUuIFRoZSBkaXJlY3RpdmUgaXMgcHJvdmlkZWQgd2l0aCB0aGUgYE5HX1ZBTElEQVRPUlNgIG11bHRpLXByb3ZpZGVyIGxpc3QuXG4gKlxuICogQHNlZSBbRm9ybSBWYWxpZGF0aW9uXShndWlkZS9mb3Jtcy9mb3JtLXZhbGlkYXRpb24pXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqXG4gKiAjIyMgQWRkaW5nIGEgcmVxdWlyZWQgY2hlY2tib3ggdmFsaWRhdG9yIHVzaW5nIHRlbXBsYXRlLWRyaXZlbiBmb3Jtc1xuICpcbiAqIFRoZSBmb2xsb3dpbmcgZXhhbXBsZSBzaG93cyBob3cgdG8gYWRkIGEgY2hlY2tib3ggcmVxdWlyZWQgdmFsaWRhdG9yIHRvIGFuIGlucHV0IGF0dGFjaGVkIHRvIGFuXG4gKiBuZ01vZGVsIGJpbmRpbmcuXG4gKlxuICogYGBgXG4gKiA8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgbmFtZT1cImFjdGl2ZVwiIG5nTW9kZWwgcmVxdWlyZWQ+XG4gKiBgYGBcbiAqXG4gKiBAcHVibGljQXBpXG4gKiBAbmdNb2R1bGUgRm9ybXNNb2R1bGVcbiAqIEBuZ01vZHVsZSBSZWFjdGl2ZUZvcm1zTW9kdWxlXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjpcbiAgICAnaW5wdXRbdHlwZT1jaGVja2JveF1bcmVxdWlyZWRdW2Zvcm1Db250cm9sTmFtZV0saW5wdXRbdHlwZT1jaGVja2JveF1bcmVxdWlyZWRdW2Zvcm1Db250cm9sXSxpbnB1dFt0eXBlPWNoZWNrYm94XVtyZXF1aXJlZF1bbmdNb2RlbF0nLFxuICBwcm92aWRlcnM6IFtDSEVDS0JPWF9SRVFVSVJFRF9WQUxJREFUT1JdLFxuICBob3N0OiB7J1thdHRyLnJlcXVpcmVkXSc6ICdfZW5hYmxlZCA/IFwiXCIgOiBudWxsJ30sXG59KVxuZXhwb3J0IGNsYXNzIENoZWNrYm94UmVxdWlyZWRWYWxpZGF0b3IgZXh0ZW5kcyBSZXF1aXJlZFZhbGlkYXRvciB7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgb3ZlcnJpZGUgY3JlYXRlVmFsaWRhdG9yID0gKGlucHV0OiB1bmtub3duKTogVmFsaWRhdG9yRm4gPT4gcmVxdWlyZWRUcnVlVmFsaWRhdG9yO1xufVxuXG4vKipcbiAqIEBkZXNjcmlwdGlvblxuICogUHJvdmlkZXIgd2hpY2ggYWRkcyBgRW1haWxWYWxpZGF0b3JgIHRvIHRoZSBgTkdfVkFMSURBVE9SU2AgbXVsdGktcHJvdmlkZXIgbGlzdC5cbiAqL1xuZXhwb3J0IGNvbnN0IEVNQUlMX1ZBTElEQVRPUjogYW55ID0ge1xuICBwcm92aWRlOiBOR19WQUxJREFUT1JTLFxuICB1c2VFeGlzdGluZzogZm9yd2FyZFJlZigoKSA9PiBFbWFpbFZhbGlkYXRvciksXG4gIG11bHRpOiB0cnVlLFxufTtcblxuLyoqXG4gKiBBIGRpcmVjdGl2ZSB0aGF0IGFkZHMgdGhlIGBlbWFpbGAgdmFsaWRhdG9yIHRvIGNvbnRyb2xzIG1hcmtlZCB3aXRoIHRoZVxuICogYGVtYWlsYCBhdHRyaWJ1dGUuIFRoZSBkaXJlY3RpdmUgaXMgcHJvdmlkZWQgd2l0aCB0aGUgYE5HX1ZBTElEQVRPUlNgIG11bHRpLXByb3ZpZGVyIGxpc3QuXG4gKlxuICogVGhlIGVtYWlsIHZhbGlkYXRpb24gaXMgYmFzZWQgb24gdGhlIFdIQVRXRyBIVE1MIHNwZWNpZmljYXRpb24gd2l0aCBzb21lIGVuaGFuY2VtZW50cyB0b1xuICogaW5jb3Jwb3JhdGUgbW9yZSBSRkMgcnVsZXMuIE1vcmUgaW5mb3JtYXRpb24gY2FuIGJlIGZvdW5kIG9uIHRoZSBbVmFsaWRhdG9ycy5lbWFpbFxuICogcGFnZV0oYXBpL2Zvcm1zL1ZhbGlkYXRvcnMjZW1haWwpLlxuICpcbiAqIEBzZWUgW0Zvcm0gVmFsaWRhdGlvbl0oZ3VpZGUvZm9ybXMvZm9ybS12YWxpZGF0aW9uKVxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKlxuICogIyMjIEFkZGluZyBhbiBlbWFpbCB2YWxpZGF0b3JcbiAqXG4gKiBUaGUgZm9sbG93aW5nIGV4YW1wbGUgc2hvd3MgaG93IHRvIGFkZCBhbiBlbWFpbCB2YWxpZGF0b3IgdG8gYW4gaW5wdXQgYXR0YWNoZWQgdG8gYW4gbmdNb2RlbFxuICogYmluZGluZy5cbiAqXG4gKiBgYGBcbiAqIDxpbnB1dCB0eXBlPVwiZW1haWxcIiBuYW1lPVwiZW1haWxcIiBuZ01vZGVsIGVtYWlsPlxuICogPGlucHV0IHR5cGU9XCJlbWFpbFwiIG5hbWU9XCJlbWFpbFwiIG5nTW9kZWwgZW1haWw9XCJ0cnVlXCI+XG4gKiA8aW5wdXQgdHlwZT1cImVtYWlsXCIgbmFtZT1cImVtYWlsXCIgbmdNb2RlbCBbZW1haWxdPVwidHJ1ZVwiPlxuICogYGBgXG4gKlxuICogQHB1YmxpY0FwaVxuICogQG5nTW9kdWxlIEZvcm1zTW9kdWxlXG4gKiBAbmdNb2R1bGUgUmVhY3RpdmVGb3Jtc01vZHVsZVxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbZW1haWxdW2Zvcm1Db250cm9sTmFtZV0sW2VtYWlsXVtmb3JtQ29udHJvbF0sW2VtYWlsXVtuZ01vZGVsXScsXG4gIHByb3ZpZGVyczogW0VNQUlMX1ZBTElEQVRPUl0sXG59KVxuZXhwb3J0IGNsYXNzIEVtYWlsVmFsaWRhdG9yIGV4dGVuZHMgQWJzdHJhY3RWYWxpZGF0b3JEaXJlY3RpdmUge1xuICAvKipcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIFRyYWNrcyBjaGFuZ2VzIHRvIHRoZSBlbWFpbCBhdHRyaWJ1dGUgYm91bmQgdG8gdGhpcyBkaXJlY3RpdmUuXG4gICAqL1xuICBASW5wdXQoKSBlbWFpbCE6IGJvb2xlYW4gfCBzdHJpbmc7XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBvdmVycmlkZSBpbnB1dE5hbWUgPSAnZW1haWwnO1xuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgb3ZlcnJpZGUgbm9ybWFsaXplSW5wdXQgPSBib29sZWFuQXR0cmlidXRlO1xuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgb3ZlcnJpZGUgY3JlYXRlVmFsaWRhdG9yID0gKGlucHV0OiBudW1iZXIpOiBWYWxpZGF0b3JGbiA9PiBlbWFpbFZhbGlkYXRvcjtcblxuICAvKiogQG5vZG9jICovXG4gIG92ZXJyaWRlIGVuYWJsZWQoaW5wdXQ6IGJvb2xlYW4pOiBib29sZWFuIHtcbiAgICByZXR1cm4gaW5wdXQ7XG4gIH1cbn1cblxuLyoqXG4gKiBAZGVzY3JpcHRpb25cbiAqIEEgZnVuY3Rpb24gdGhhdCByZWNlaXZlcyBhIGNvbnRyb2wgYW5kIHN5bmNocm9ub3VzbHkgcmV0dXJucyBhIG1hcCBvZlxuICogdmFsaWRhdGlvbiBlcnJvcnMgaWYgcHJlc2VudCwgb3RoZXJ3aXNlIG51bGwuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgaW50ZXJmYWNlIFZhbGlkYXRvckZuIHtcbiAgKGNvbnRyb2w6IEFic3RyYWN0Q29udHJvbCk6IFZhbGlkYXRpb25FcnJvcnMgfCBudWxsO1xufVxuXG4vKipcbiAqIEBkZXNjcmlwdGlvblxuICogQSBmdW5jdGlvbiB0aGF0IHJlY2VpdmVzIGEgY29udHJvbCBhbmQgcmV0dXJucyBhIFByb21pc2Ugb3Igb2JzZXJ2YWJsZVxuICogdGhhdCBlbWl0cyB2YWxpZGF0aW9uIGVycm9ycyBpZiBwcmVzZW50LCBvdGhlcndpc2UgbnVsbC5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQXN5bmNWYWxpZGF0b3JGbiB7XG4gIChcbiAgICBjb250cm9sOiBBYnN0cmFjdENvbnRyb2wsXG4gICk6IFByb21pc2U8VmFsaWRhdGlvbkVycm9ycyB8IG51bGw+IHwgT2JzZXJ2YWJsZTxWYWxpZGF0aW9uRXJyb3JzIHwgbnVsbD47XG59XG5cbi8qKlxuICogQGRlc2NyaXB0aW9uXG4gKiBQcm92aWRlciB3aGljaCBhZGRzIGBNaW5MZW5ndGhWYWxpZGF0b3JgIHRvIHRoZSBgTkdfVkFMSURBVE9SU2AgbXVsdGktcHJvdmlkZXIgbGlzdC5cbiAqL1xuZXhwb3J0IGNvbnN0IE1JTl9MRU5HVEhfVkFMSURBVE9SOiBhbnkgPSB7XG4gIHByb3ZpZGU6IE5HX1ZBTElEQVRPUlMsXG4gIHVzZUV4aXN0aW5nOiBmb3J3YXJkUmVmKCgpID0+IE1pbkxlbmd0aFZhbGlkYXRvciksXG4gIG11bHRpOiB0cnVlLFxufTtcblxuLyoqXG4gKiBBIGRpcmVjdGl2ZSB0aGF0IGFkZHMgbWluaW11bSBsZW5ndGggdmFsaWRhdGlvbiB0byBjb250cm9scyBtYXJrZWQgd2l0aCB0aGVcbiAqIGBtaW5sZW5ndGhgIGF0dHJpYnV0ZS4gVGhlIGRpcmVjdGl2ZSBpcyBwcm92aWRlZCB3aXRoIHRoZSBgTkdfVkFMSURBVE9SU2AgbXVsdGktcHJvdmlkZXIgbGlzdC5cbiAqXG4gKiBAc2VlIFtGb3JtIFZhbGlkYXRpb25dKGd1aWRlL2Zvcm1zL2Zvcm0tdmFsaWRhdGlvbilcbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICpcbiAqICMjIyBBZGRpbmcgYSBtaW5pbXVtIGxlbmd0aCB2YWxpZGF0b3JcbiAqXG4gKiBUaGUgZm9sbG93aW5nIGV4YW1wbGUgc2hvd3MgaG93IHRvIGFkZCBhIG1pbmltdW0gbGVuZ3RoIHZhbGlkYXRvciB0byBhbiBpbnB1dCBhdHRhY2hlZCB0byBhblxuICogbmdNb2RlbCBiaW5kaW5nLlxuICpcbiAqIGBgYGh0bWxcbiAqIDxpbnB1dCBuYW1lPVwiZmlyc3ROYW1lXCIgbmdNb2RlbCBtaW5sZW5ndGg9XCI0XCI+XG4gKiBgYGBcbiAqXG4gKiBAbmdNb2R1bGUgUmVhY3RpdmVGb3Jtc01vZHVsZVxuICogQG5nTW9kdWxlIEZvcm1zTW9kdWxlXG4gKiBAcHVibGljQXBpXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1ttaW5sZW5ndGhdW2Zvcm1Db250cm9sTmFtZV0sW21pbmxlbmd0aF1bZm9ybUNvbnRyb2xdLFttaW5sZW5ndGhdW25nTW9kZWxdJyxcbiAgcHJvdmlkZXJzOiBbTUlOX0xFTkdUSF9WQUxJREFUT1JdLFxuICBob3N0OiB7J1thdHRyLm1pbmxlbmd0aF0nOiAnX2VuYWJsZWQgPyBtaW5sZW5ndGggOiBudWxsJ30sXG59KVxuZXhwb3J0IGNsYXNzIE1pbkxlbmd0aFZhbGlkYXRvciBleHRlbmRzIEFic3RyYWN0VmFsaWRhdG9yRGlyZWN0aXZlIHtcbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBUcmFja3MgY2hhbmdlcyB0byB0aGUgbWluaW11bSBsZW5ndGggYm91bmQgdG8gdGhpcyBkaXJlY3RpdmUuXG4gICAqL1xuICBASW5wdXQoKSBtaW5sZW5ndGghOiBzdHJpbmcgfCBudW1iZXIgfCBudWxsO1xuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgb3ZlcnJpZGUgaW5wdXROYW1lID0gJ21pbmxlbmd0aCc7XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBvdmVycmlkZSBub3JtYWxpemVJbnB1dCA9IChpbnB1dDogc3RyaW5nIHwgbnVtYmVyKTogbnVtYmVyID0+IHRvSW50ZWdlcihpbnB1dCk7XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBvdmVycmlkZSBjcmVhdGVWYWxpZGF0b3IgPSAobWlubGVuZ3RoOiBudW1iZXIpOiBWYWxpZGF0b3JGbiA9PiBtaW5MZW5ndGhWYWxpZGF0b3IobWlubGVuZ3RoKTtcbn1cblxuLyoqXG4gKiBAZGVzY3JpcHRpb25cbiAqIFByb3ZpZGVyIHdoaWNoIGFkZHMgYE1heExlbmd0aFZhbGlkYXRvcmAgdG8gdGhlIGBOR19WQUxJREFUT1JTYCBtdWx0aS1wcm92aWRlciBsaXN0LlxuICovXG5leHBvcnQgY29uc3QgTUFYX0xFTkdUSF9WQUxJREFUT1I6IGFueSA9IHtcbiAgcHJvdmlkZTogTkdfVkFMSURBVE9SUyxcbiAgdXNlRXhpc3Rpbmc6IGZvcndhcmRSZWYoKCkgPT4gTWF4TGVuZ3RoVmFsaWRhdG9yKSxcbiAgbXVsdGk6IHRydWUsXG59O1xuXG4vKipcbiAqIEEgZGlyZWN0aXZlIHRoYXQgYWRkcyBtYXhpbXVtIGxlbmd0aCB2YWxpZGF0aW9uIHRvIGNvbnRyb2xzIG1hcmtlZCB3aXRoIHRoZVxuICogYG1heGxlbmd0aGAgYXR0cmlidXRlLiBUaGUgZGlyZWN0aXZlIGlzIHByb3ZpZGVkIHdpdGggdGhlIGBOR19WQUxJREFUT1JTYCBtdWx0aS1wcm92aWRlciBsaXN0LlxuICpcbiAqIEBzZWUgW0Zvcm0gVmFsaWRhdGlvbl0oZ3VpZGUvZm9ybXMvZm9ybS12YWxpZGF0aW9uKVxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKlxuICogIyMjIEFkZGluZyBhIG1heGltdW0gbGVuZ3RoIHZhbGlkYXRvclxuICpcbiAqIFRoZSBmb2xsb3dpbmcgZXhhbXBsZSBzaG93cyBob3cgdG8gYWRkIGEgbWF4aW11bSBsZW5ndGggdmFsaWRhdG9yIHRvIGFuIGlucHV0IGF0dGFjaGVkIHRvIGFuXG4gKiBuZ01vZGVsIGJpbmRpbmcuXG4gKlxuICogYGBgaHRtbFxuICogPGlucHV0IG5hbWU9XCJmaXJzdE5hbWVcIiBuZ01vZGVsIG1heGxlbmd0aD1cIjI1XCI+XG4gKiBgYGBcbiAqXG4gKiBAbmdNb2R1bGUgUmVhY3RpdmVGb3Jtc01vZHVsZVxuICogQG5nTW9kdWxlIEZvcm1zTW9kdWxlXG4gKiBAcHVibGljQXBpXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1ttYXhsZW5ndGhdW2Zvcm1Db250cm9sTmFtZV0sW21heGxlbmd0aF1bZm9ybUNvbnRyb2xdLFttYXhsZW5ndGhdW25nTW9kZWxdJyxcbiAgcHJvdmlkZXJzOiBbTUFYX0xFTkdUSF9WQUxJREFUT1JdLFxuICBob3N0OiB7J1thdHRyLm1heGxlbmd0aF0nOiAnX2VuYWJsZWQgPyBtYXhsZW5ndGggOiBudWxsJ30sXG59KVxuZXhwb3J0IGNsYXNzIE1heExlbmd0aFZhbGlkYXRvciBleHRlbmRzIEFic3RyYWN0VmFsaWRhdG9yRGlyZWN0aXZlIHtcbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBUcmFja3MgY2hhbmdlcyB0byB0aGUgbWF4aW11bSBsZW5ndGggYm91bmQgdG8gdGhpcyBkaXJlY3RpdmUuXG4gICAqL1xuICBASW5wdXQoKSBtYXhsZW5ndGghOiBzdHJpbmcgfCBudW1iZXIgfCBudWxsO1xuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgb3ZlcnJpZGUgaW5wdXROYW1lID0gJ21heGxlbmd0aCc7XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBvdmVycmlkZSBub3JtYWxpemVJbnB1dCA9IChpbnB1dDogc3RyaW5nIHwgbnVtYmVyKTogbnVtYmVyID0+IHRvSW50ZWdlcihpbnB1dCk7XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBvdmVycmlkZSBjcmVhdGVWYWxpZGF0b3IgPSAobWF4bGVuZ3RoOiBudW1iZXIpOiBWYWxpZGF0b3JGbiA9PiBtYXhMZW5ndGhWYWxpZGF0b3IobWF4bGVuZ3RoKTtcbn1cblxuLyoqXG4gKiBAZGVzY3JpcHRpb25cbiAqIFByb3ZpZGVyIHdoaWNoIGFkZHMgYFBhdHRlcm5WYWxpZGF0b3JgIHRvIHRoZSBgTkdfVkFMSURBVE9SU2AgbXVsdGktcHJvdmlkZXIgbGlzdC5cbiAqL1xuZXhwb3J0IGNvbnN0IFBBVFRFUk5fVkFMSURBVE9SOiBhbnkgPSB7XG4gIHByb3ZpZGU6IE5HX1ZBTElEQVRPUlMsXG4gIHVzZUV4aXN0aW5nOiBmb3J3YXJkUmVmKCgpID0+IFBhdHRlcm5WYWxpZGF0b3IpLFxuICBtdWx0aTogdHJ1ZSxcbn07XG5cbi8qKlxuICogQGRlc2NyaXB0aW9uXG4gKiBBIGRpcmVjdGl2ZSB0aGF0IGFkZHMgcmVnZXggcGF0dGVybiB2YWxpZGF0aW9uIHRvIGNvbnRyb2xzIG1hcmtlZCB3aXRoIHRoZVxuICogYHBhdHRlcm5gIGF0dHJpYnV0ZS4gVGhlIHJlZ2V4IG11c3QgbWF0Y2ggdGhlIGVudGlyZSBjb250cm9sIHZhbHVlLlxuICogVGhlIGRpcmVjdGl2ZSBpcyBwcm92aWRlZCB3aXRoIHRoZSBgTkdfVkFMSURBVE9SU2AgbXVsdGktcHJvdmlkZXIgbGlzdC5cbiAqXG4gKiBAc2VlIFtGb3JtIFZhbGlkYXRpb25dKGd1aWRlL2Zvcm1zL2Zvcm0tdmFsaWRhdGlvbilcbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICpcbiAqICMjIyBBZGRpbmcgYSBwYXR0ZXJuIHZhbGlkYXRvclxuICpcbiAqIFRoZSBmb2xsb3dpbmcgZXhhbXBsZSBzaG93cyBob3cgdG8gYWRkIGEgcGF0dGVybiB2YWxpZGF0b3IgdG8gYW4gaW5wdXQgYXR0YWNoZWQgdG8gYW5cbiAqIG5nTW9kZWwgYmluZGluZy5cbiAqXG4gKiBgYGBodG1sXG4gKiA8aW5wdXQgbmFtZT1cImZpcnN0TmFtZVwiIG5nTW9kZWwgcGF0dGVybj1cIlthLXpBLVogXSpcIj5cbiAqIGBgYFxuICpcbiAqIEBuZ01vZHVsZSBSZWFjdGl2ZUZvcm1zTW9kdWxlXG4gKiBAbmdNb2R1bGUgRm9ybXNNb2R1bGVcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW3BhdHRlcm5dW2Zvcm1Db250cm9sTmFtZV0sW3BhdHRlcm5dW2Zvcm1Db250cm9sXSxbcGF0dGVybl1bbmdNb2RlbF0nLFxuICBwcm92aWRlcnM6IFtQQVRURVJOX1ZBTElEQVRPUl0sXG4gIGhvc3Q6IHsnW2F0dHIucGF0dGVybl0nOiAnX2VuYWJsZWQgPyBwYXR0ZXJuIDogbnVsbCd9LFxufSlcbmV4cG9ydCBjbGFzcyBQYXR0ZXJuVmFsaWRhdG9yIGV4dGVuZHMgQWJzdHJhY3RWYWxpZGF0b3JEaXJlY3RpdmUge1xuICAvKipcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIFRyYWNrcyBjaGFuZ2VzIHRvIHRoZSBwYXR0ZXJuIGJvdW5kIHRvIHRoaXMgZGlyZWN0aXZlLlxuICAgKi9cbiAgQElucHV0KClcbiAgcGF0dGVybiE6IHN0cmluZyB8IFJlZ0V4cDsgLy8gVGhpcyBpbnB1dCBpcyBhbHdheXMgZGVmaW5lZCwgc2luY2UgdGhlIG5hbWUgbWF0Y2hlcyBzZWxlY3Rvci5cblxuICAvKiogQGludGVybmFsICovXG4gIG92ZXJyaWRlIGlucHV0TmFtZSA9ICdwYXR0ZXJuJztcblxuICAvKiogQGludGVybmFsICovXG4gIG92ZXJyaWRlIG5vcm1hbGl6ZUlucHV0ID0gKGlucHV0OiBzdHJpbmcgfCBSZWdFeHApOiBzdHJpbmcgfCBSZWdFeHAgPT4gaW5wdXQ7XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBvdmVycmlkZSBjcmVhdGVWYWxpZGF0b3IgPSAoaW5wdXQ6IHN0cmluZyB8IFJlZ0V4cCk6IFZhbGlkYXRvckZuID0+IHBhdHRlcm5WYWxpZGF0b3IoaW5wdXQpO1xufVxuIl19