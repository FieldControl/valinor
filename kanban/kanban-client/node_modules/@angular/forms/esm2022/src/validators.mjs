/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { InjectionToken, ɵisPromise as isPromise, ɵisSubscribable as isSubscribable, ɵRuntimeError as RuntimeError, } from '@angular/core';
import { forkJoin, from } from 'rxjs';
import { map } from 'rxjs/operators';
function isEmptyInputValue(value) {
    /**
     * Check if the object is a string or array before evaluating the length attribute.
     * This avoids falsely rejecting objects that contain a custom length attribute.
     * For example, the object {id: 1, length: 0, width: 0} should not be returned as empty.
     */
    return (value == null || ((typeof value === 'string' || Array.isArray(value)) && value.length === 0));
}
function hasValidLength(value) {
    // non-strict comparison is intentional, to check for both `null` and `undefined` values
    return value != null && typeof value.length === 'number';
}
/**
 * @description
 * An `InjectionToken` for registering additional synchronous validators used with
 * `AbstractControl`s.
 *
 * @see {@link NG_ASYNC_VALIDATORS}
 *
 * @usageNotes
 *
 * ### Providing a custom validator
 *
 * The following example registers a custom validator directive. Adding the validator to the
 * existing collection of validators requires the `multi: true` option.
 *
 * ```typescript
 * @Directive({
 *   selector: '[customValidator]',
 *   providers: [{provide: NG_VALIDATORS, useExisting: CustomValidatorDirective, multi: true}]
 * })
 * class CustomValidatorDirective implements Validator {
 *   validate(control: AbstractControl): ValidationErrors | null {
 *     return { 'custom': true };
 *   }
 * }
 * ```
 *
 * @publicApi
 */
export const NG_VALIDATORS = new InjectionToken(ngDevMode ? 'NgValidators' : '');
/**
 * @description
 * An `InjectionToken` for registering additional asynchronous validators used with
 * `AbstractControl`s.
 *
 * @see {@link NG_VALIDATORS}
 *
 * @usageNotes
 *
 * ### Provide a custom async validator directive
 *
 * The following example implements the `AsyncValidator` interface to create an
 * async validator directive with a custom error key.
 *
 * ```typescript
 * @Directive({
 *   selector: '[customAsyncValidator]',
 *   providers: [{provide: NG_ASYNC_VALIDATORS, useExisting: CustomAsyncValidatorDirective, multi:
 * true}]
 * })
 * class CustomAsyncValidatorDirective implements AsyncValidator {
 *   validate(control: AbstractControl): Promise<ValidationErrors|null> {
 *     return Promise.resolve({'custom': true});
 *   }
 * }
 * ```
 *
 * @publicApi
 */
export const NG_ASYNC_VALIDATORS = new InjectionToken(ngDevMode ? 'NgAsyncValidators' : '');
/**
 * A regular expression that matches valid e-mail addresses.
 *
 * At a high level, this regexp matches e-mail addresses of the format `local-part@tld`, where:
 * - `local-part` consists of one or more of the allowed characters (alphanumeric and some
 *   punctuation symbols).
 * - `local-part` cannot begin or end with a period (`.`).
 * - `local-part` cannot be longer than 64 characters.
 * - `tld` consists of one or more `labels` separated by periods (`.`). For example `localhost` or
 *   `foo.com`.
 * - A `label` consists of one or more of the allowed characters (alphanumeric, dashes (`-`) and
 *   periods (`.`)).
 * - A `label` cannot begin or end with a dash (`-`) or a period (`.`).
 * - A `label` cannot be longer than 63 characters.
 * - The whole address cannot be longer than 254 characters.
 *
 * ## Implementation background
 *
 * This regexp was ported over from AngularJS (see there for git history):
 * https://github.com/angular/angular.js/blob/c133ef836/src/ng/directive/input.js#L27
 * It is based on the
 * [WHATWG version](https://html.spec.whatwg.org/multipage/input.html#valid-e-mail-address) with
 * some enhancements to incorporate more RFC rules (such as rules related to domain names and the
 * lengths of different parts of the address). The main differences from the WHATWG version are:
 *   - Disallow `local-part` to begin or end with a period (`.`).
 *   - Disallow `local-part` length to exceed 64 characters.
 *   - Disallow total address length to exceed 254 characters.
 *
 * See [this commit](https://github.com/angular/angular.js/commit/f3f5cf72e) for more details.
 */
const EMAIL_REGEXP = /^(?=.{1,254}$)(?=.{1,64}@)[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
/**
 * @description
 * Provides a set of built-in validators that can be used by form controls.
 *
 * A validator is a function that processes a `FormControl` or collection of
 * controls and returns an error map or null. A null map means that validation has passed.
 *
 * @see [Form Validation](guide/forms/form-validation)
 *
 * @publicApi
 */
export class Validators {
    /**
     * @description
     * Validator that requires the control's value to be greater than or equal to the provided number.
     *
     * @usageNotes
     *
     * ### Validate against a minimum of 3
     *
     * ```typescript
     * const control = new FormControl(2, Validators.min(3));
     *
     * console.log(control.errors); // {min: {min: 3, actual: 2}}
     * ```
     *
     * @returns A validator function that returns an error map with the
     * `min` property if the validation check fails, otherwise `null`.
     *
     * @see {@link updateValueAndValidity()}
     *
     */
    static min(min) {
        return minValidator(min);
    }
    /**
     * @description
     * Validator that requires the control's value to be less than or equal to the provided number.
     *
     * @usageNotes
     *
     * ### Validate against a maximum of 15
     *
     * ```typescript
     * const control = new FormControl(16, Validators.max(15));
     *
     * console.log(control.errors); // {max: {max: 15, actual: 16}}
     * ```
     *
     * @returns A validator function that returns an error map with the
     * `max` property if the validation check fails, otherwise `null`.
     *
     * @see {@link updateValueAndValidity()}
     *
     */
    static max(max) {
        return maxValidator(max);
    }
    /**
     * @description
     * Validator that requires the control have a non-empty value.
     *
     * @usageNotes
     *
     * ### Validate that the field is non-empty
     *
     * ```typescript
     * const control = new FormControl('', Validators.required);
     *
     * console.log(control.errors); // {required: true}
     * ```
     *
     * @returns An error map with the `required` property
     * if the validation check fails, otherwise `null`.
     *
     * @see {@link updateValueAndValidity()}
     *
     */
    static required(control) {
        return requiredValidator(control);
    }
    /**
     * @description
     * Validator that requires the control's value be true. This validator is commonly
     * used for required checkboxes.
     *
     * @usageNotes
     *
     * ### Validate that the field value is true
     *
     * ```typescript
     * const control = new FormControl('some value', Validators.requiredTrue);
     *
     * console.log(control.errors); // {required: true}
     * ```
     *
     * @returns An error map that contains the `required` property
     * set to `true` if the validation check fails, otherwise `null`.
     *
     * @see {@link updateValueAndValidity()}
     *
     */
    static requiredTrue(control) {
        return requiredTrueValidator(control);
    }
    /**
     * @description
     * Validator that requires the control's value pass an email validation test.
     *
     * Tests the value using a [regular
     * expression](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions)
     * pattern suitable for common use cases. The pattern is based on the definition of a valid email
     * address in the [WHATWG HTML
     * specification](https://html.spec.whatwg.org/multipage/input.html#valid-e-mail-address) with
     * some enhancements to incorporate more RFC rules (such as rules related to domain names and the
     * lengths of different parts of the address).
     *
     * The differences from the WHATWG version include:
     * - Disallow `local-part` (the part before the `@` symbol) to begin or end with a period (`.`).
     * - Disallow `local-part` to be longer than 64 characters.
     * - Disallow the whole address to be longer than 254 characters.
     *
     * If this pattern does not satisfy your business needs, you can use `Validators.pattern()` to
     * validate the value against a different pattern.
     *
     * @usageNotes
     *
     * ### Validate that the field matches a valid email pattern
     *
     * ```typescript
     * const control = new FormControl('bad@', Validators.email);
     *
     * console.log(control.errors); // {email: true}
     * ```
     *
     * @returns An error map with the `email` property
     * if the validation check fails, otherwise `null`.
     *
     * @see {@link updateValueAndValidity()}
     *
     */
    static email(control) {
        return emailValidator(control);
    }
    /**
     * @description
     * Validator that requires the length of the control's value to be greater than or equal
     * to the provided minimum length. This validator is also provided by default if you use the
     * the HTML5 `minlength` attribute. Note that the `minLength` validator is intended to be used
     * only for types that have a numeric `length` property, such as strings or arrays. The
     * `minLength` validator logic is also not invoked for values when their `length` property is 0
     * (for example in case of an empty string or an empty array), to support optional controls. You
     * can use the standard `required` validator if empty values should not be considered valid.
     *
     * @usageNotes
     *
     * ### Validate that the field has a minimum of 3 characters
     *
     * ```typescript
     * const control = new FormControl('ng', Validators.minLength(3));
     *
     * console.log(control.errors); // {minlength: {requiredLength: 3, actualLength: 2}}
     * ```
     *
     * ```html
     * <input minlength="5">
     * ```
     *
     * @returns A validator function that returns an error map with the
     * `minlength` property if the validation check fails, otherwise `null`.
     *
     * @see {@link updateValueAndValidity()}
     *
     */
    static minLength(minLength) {
        return minLengthValidator(minLength);
    }
    /**
     * @description
     * Validator that requires the length of the control's value to be less than or equal
     * to the provided maximum length. This validator is also provided by default if you use the
     * the HTML5 `maxlength` attribute. Note that the `maxLength` validator is intended to be used
     * only for types that have a numeric `length` property, such as strings or arrays.
     *
     * @usageNotes
     *
     * ### Validate that the field has maximum of 5 characters
     *
     * ```typescript
     * const control = new FormControl('Angular', Validators.maxLength(5));
     *
     * console.log(control.errors); // {maxlength: {requiredLength: 5, actualLength: 7}}
     * ```
     *
     * ```html
     * <input maxlength="5">
     * ```
     *
     * @returns A validator function that returns an error map with the
     * `maxlength` property if the validation check fails, otherwise `null`.
     *
     * @see {@link updateValueAndValidity()}
     *
     */
    static maxLength(maxLength) {
        return maxLengthValidator(maxLength);
    }
    /**
     * @description
     * Validator that requires the control's value to match a regex pattern. This validator is also
     * provided by default if you use the HTML5 `pattern` attribute.
     *
     * @usageNotes
     *
     * ### Validate that the field only contains letters or spaces
     *
     * ```typescript
     * const control = new FormControl('1', Validators.pattern('[a-zA-Z ]*'));
     *
     * console.log(control.errors); // {pattern: {requiredPattern: '^[a-zA-Z ]*$', actualValue: '1'}}
     * ```
     *
     * ```html
     * <input pattern="[a-zA-Z ]*">
     * ```
     *
     * ### Pattern matching with the global or sticky flag
     *
     * `RegExp` objects created with the `g` or `y` flags that are passed into `Validators.pattern`
     * can produce different results on the same input when validations are run consecutively. This is
     * due to how the behavior of `RegExp.prototype.test` is
     * specified in [ECMA-262](https://tc39.es/ecma262/#sec-regexpbuiltinexec)
     * (`RegExp` preserves the index of the last match when the global or sticky flag is used).
     * Due to this behavior, it is recommended that when using
     * `Validators.pattern` you **do not** pass in a `RegExp` object with either the global or sticky
     * flag enabled.
     *
     * ```typescript
     * // Not recommended (since the `g` flag is used)
     * const controlOne = new FormControl('1', Validators.pattern(/foo/g));
     *
     * // Good
     * const controlTwo = new FormControl('1', Validators.pattern(/foo/));
     * ```
     *
     * @param pattern A regular expression to be used as is to test the values, or a string.
     * If a string is passed, the `^` character is prepended and the `$` character is
     * appended to the provided string (if not already present), and the resulting regular
     * expression is used to test the values.
     *
     * @returns A validator function that returns an error map with the
     * `pattern` property if the validation check fails, otherwise `null`.
     *
     * @see {@link updateValueAndValidity()}
     *
     */
    static pattern(pattern) {
        return patternValidator(pattern);
    }
    /**
     * @description
     * Validator that performs no operation.
     *
     * @see {@link updateValueAndValidity()}
     *
     */
    static nullValidator(control) {
        return nullValidator(control);
    }
    static compose(validators) {
        return compose(validators);
    }
    /**
     * @description
     * Compose multiple async validators into a single function that returns the union
     * of the individual error objects for the provided control.
     *
     * @returns A validator function that returns an error map with the
     * merged error objects of the async validators if the validation check fails, otherwise `null`.
     *
     * @see {@link updateValueAndValidity()}
     *
     */
    static composeAsync(validators) {
        return composeAsync(validators);
    }
}
/**
 * Validator that requires the control's value to be greater than or equal to the provided number.
 * See `Validators.min` for additional information.
 */
export function minValidator(min) {
    return (control) => {
        if (isEmptyInputValue(control.value) || isEmptyInputValue(min)) {
            return null; // don't validate empty values to allow optional controls
        }
        const value = parseFloat(control.value);
        // Controls with NaN values after parsing should be treated as not having a
        // minimum, per the HTML forms spec: https://www.w3.org/TR/html5/forms.html#attr-input-min
        return !isNaN(value) && value < min ? { 'min': { 'min': min, 'actual': control.value } } : null;
    };
}
/**
 * Validator that requires the control's value to be less than or equal to the provided number.
 * See `Validators.max` for additional information.
 */
export function maxValidator(max) {
    return (control) => {
        if (isEmptyInputValue(control.value) || isEmptyInputValue(max)) {
            return null; // don't validate empty values to allow optional controls
        }
        const value = parseFloat(control.value);
        // Controls with NaN values after parsing should be treated as not having a
        // maximum, per the HTML forms spec: https://www.w3.org/TR/html5/forms.html#attr-input-max
        return !isNaN(value) && value > max ? { 'max': { 'max': max, 'actual': control.value } } : null;
    };
}
/**
 * Validator that requires the control have a non-empty value.
 * See `Validators.required` for additional information.
 */
export function requiredValidator(control) {
    return isEmptyInputValue(control.value) ? { 'required': true } : null;
}
/**
 * Validator that requires the control's value be true. This validator is commonly
 * used for required checkboxes.
 * See `Validators.requiredTrue` for additional information.
 */
export function requiredTrueValidator(control) {
    return control.value === true ? null : { 'required': true };
}
/**
 * Validator that requires the control's value pass an email validation test.
 * See `Validators.email` for additional information.
 */
export function emailValidator(control) {
    if (isEmptyInputValue(control.value)) {
        return null; // don't validate empty values to allow optional controls
    }
    return EMAIL_REGEXP.test(control.value) ? null : { 'email': true };
}
/**
 * Validator that requires the length of the control's value to be greater than or equal
 * to the provided minimum length. See `Validators.minLength` for additional information.
 */
export function minLengthValidator(minLength) {
    return (control) => {
        if (isEmptyInputValue(control.value) || !hasValidLength(control.value)) {
            // don't validate empty values to allow optional controls
            // don't validate values without `length` property
            return null;
        }
        return control.value.length < minLength
            ? { 'minlength': { 'requiredLength': minLength, 'actualLength': control.value.length } }
            : null;
    };
}
/**
 * Validator that requires the length of the control's value to be less than or equal
 * to the provided maximum length. See `Validators.maxLength` for additional information.
 */
export function maxLengthValidator(maxLength) {
    return (control) => {
        return hasValidLength(control.value) && control.value.length > maxLength
            ? { 'maxlength': { 'requiredLength': maxLength, 'actualLength': control.value.length } }
            : null;
    };
}
/**
 * Validator that requires the control's value to match a regex pattern.
 * See `Validators.pattern` for additional information.
 */
export function patternValidator(pattern) {
    if (!pattern)
        return nullValidator;
    let regex;
    let regexStr;
    if (typeof pattern === 'string') {
        regexStr = '';
        if (pattern.charAt(0) !== '^')
            regexStr += '^';
        regexStr += pattern;
        if (pattern.charAt(pattern.length - 1) !== '$')
            regexStr += '$';
        regex = new RegExp(regexStr);
    }
    else {
        regexStr = pattern.toString();
        regex = pattern;
    }
    return (control) => {
        if (isEmptyInputValue(control.value)) {
            return null; // don't validate empty values to allow optional controls
        }
        const value = control.value;
        return regex.test(value)
            ? null
            : { 'pattern': { 'requiredPattern': regexStr, 'actualValue': value } };
    };
}
/**
 * Function that has `ValidatorFn` shape, but performs no operation.
 */
export function nullValidator(control) {
    return null;
}
function isPresent(o) {
    return o != null;
}
export function toObservable(value) {
    const obs = isPromise(value) ? from(value) : value;
    if ((typeof ngDevMode === 'undefined' || ngDevMode) && !isSubscribable(obs)) {
        let errorMessage = `Expected async validator to return Promise or Observable.`;
        // A synchronous validator will return object or null.
        if (typeof value === 'object') {
            errorMessage +=
                ' Are you using a synchronous validator where an async validator is expected?';
        }
        throw new RuntimeError(-1101 /* RuntimeErrorCode.WRONG_VALIDATOR_RETURN_TYPE */, errorMessage);
    }
    return obs;
}
function mergeErrors(arrayOfErrors) {
    let res = {};
    arrayOfErrors.forEach((errors) => {
        res = errors != null ? { ...res, ...errors } : res;
    });
    return Object.keys(res).length === 0 ? null : res;
}
function executeValidators(control, validators) {
    return validators.map((validator) => validator(control));
}
function isValidatorFn(validator) {
    return !validator.validate;
}
/**
 * Given the list of validators that may contain both functions as well as classes, return the list
 * of validator functions (convert validator classes into validator functions). This is needed to
 * have consistent structure in validators list before composing them.
 *
 * @param validators The set of validators that may contain validators both in plain function form
 *     as well as represented as a validator class.
 */
export function normalizeValidators(validators) {
    return validators.map((validator) => {
        return isValidatorFn(validator)
            ? validator
            : ((c) => validator.validate(c));
    });
}
/**
 * Merges synchronous validators into a single validator function.
 * See `Validators.compose` for additional information.
 */
function compose(validators) {
    if (!validators)
        return null;
    const presentValidators = validators.filter(isPresent);
    if (presentValidators.length == 0)
        return null;
    return function (control) {
        return mergeErrors(executeValidators(control, presentValidators));
    };
}
/**
 * Accepts a list of validators of different possible shapes (`Validator` and `ValidatorFn`),
 * normalizes the list (converts everything to `ValidatorFn`) and merges them into a single
 * validator function.
 */
export function composeValidators(validators) {
    return validators != null ? compose(normalizeValidators(validators)) : null;
}
/**
 * Merges asynchronous validators into a single validator function.
 * See `Validators.composeAsync` for additional information.
 */
function composeAsync(validators) {
    if (!validators)
        return null;
    const presentValidators = validators.filter(isPresent);
    if (presentValidators.length == 0)
        return null;
    return function (control) {
        const observables = executeValidators(control, presentValidators).map(toObservable);
        return forkJoin(observables).pipe(map(mergeErrors));
    };
}
/**
 * Accepts a list of async validators of different possible shapes (`AsyncValidator` and
 * `AsyncValidatorFn`), normalizes the list (converts everything to `AsyncValidatorFn`) and merges
 * them into a single validator function.
 */
export function composeAsyncValidators(validators) {
    return validators != null
        ? composeAsync(normalizeValidators(validators))
        : null;
}
/**
 * Merges raw control validators with a given directive validator and returns the combined list of
 * validators as an array.
 */
export function mergeValidators(controlValidators, dirValidator) {
    if (controlValidators === null)
        return [dirValidator];
    return Array.isArray(controlValidators)
        ? [...controlValidators, dirValidator]
        : [controlValidators, dirValidator];
}
/**
 * Retrieves the list of raw synchronous validators attached to a given control.
 */
export function getControlValidators(control) {
    return control._rawValidators;
}
/**
 * Retrieves the list of raw asynchronous validators attached to a given control.
 */
export function getControlAsyncValidators(control) {
    return control._rawAsyncValidators;
}
/**
 * Accepts a singleton validator, an array, or null, and returns an array type with the provided
 * validators.
 *
 * @param validators A validator, validators, or null.
 * @returns A validators array.
 */
export function makeValidatorsArray(validators) {
    if (!validators)
        return [];
    return Array.isArray(validators) ? validators : [validators];
}
/**
 * Determines whether a validator or validators array has a given validator.
 *
 * @param validators The validator or validators to compare against.
 * @param validator The validator to check.
 * @returns Whether the validator is present.
 */
export function hasValidator(validators, validator) {
    return Array.isArray(validators) ? validators.includes(validator) : validators === validator;
}
/**
 * Combines two arrays of validators into one. If duplicates are provided, only one will be added.
 *
 * @param validators The new validators.
 * @param currentValidators The base array of current validators.
 * @returns An array of validators.
 */
export function addValidators(validators, currentValidators) {
    const current = makeValidatorsArray(currentValidators);
    const validatorsToAdd = makeValidatorsArray(validators);
    validatorsToAdd.forEach((v) => {
        // Note: if there are duplicate entries in the new validators array,
        // only the first one would be added to the current list of validators.
        // Duplicate ones would be ignored since `hasValidator` would detect
        // the presence of a validator function and we update the current list in place.
        if (!hasValidator(current, v)) {
            current.push(v);
        }
    });
    return current;
}
export function removeValidators(validators, currentValidators) {
    return makeValidatorsArray(currentValidators).filter((v) => !hasValidator(validators, v));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdG9ycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2Zvcm1zL3NyYy92YWxpZGF0b3JzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFDTCxjQUFjLEVBQ2QsVUFBVSxJQUFJLFNBQVMsRUFDdkIsZUFBZSxJQUFJLGNBQWMsRUFDakMsYUFBYSxJQUFJLFlBQVksR0FDOUIsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFDLFFBQVEsRUFBRSxJQUFJLEVBQWEsTUFBTSxNQUFNLENBQUM7QUFDaEQsT0FBTyxFQUFDLEdBQUcsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBWW5DLFNBQVMsaUJBQWlCLENBQUMsS0FBVTtJQUNuQzs7OztPQUlHO0lBQ0gsT0FBTyxDQUNMLEtBQUssSUFBSSxJQUFJLElBQUksQ0FBQyxDQUFDLE9BQU8sS0FBSyxLQUFLLFFBQVEsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FDN0YsQ0FBQztBQUNKLENBQUM7QUFFRCxTQUFTLGNBQWMsQ0FBQyxLQUFVO0lBQ2hDLHdGQUF3RjtJQUN4RixPQUFPLEtBQUssSUFBSSxJQUFJLElBQUksT0FBTyxLQUFLLENBQUMsTUFBTSxLQUFLLFFBQVEsQ0FBQztBQUMzRCxDQUFDO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQTJCRztBQUNILE1BQU0sQ0FBQyxNQUFNLGFBQWEsR0FBRyxJQUFJLGNBQWMsQ0FDN0MsU0FBUyxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FDaEMsQ0FBQztBQUVGOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBNEJHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxjQUFjLENBQ25ELFNBQVMs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QUM7WUFDOUIsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNsQixDQUFDO0lBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDSCxPQUFPLE9BQU8sQ0FBQztBQUNqQixDQUFDO0FBRUQsTUFBTSxVQUFVLGdCQUFnQixDQUM5QixVQUFtQixFQUNuQixpQkFBaUM7SUFFakMsT0FBTyxtQkFBbUIsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDNUYsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1xuICBJbmplY3Rpb25Ub2tlbixcbiAgybVpc1Byb21pc2UgYXMgaXNQcm9taXNlLFxuICDJtWlzU3Vic2NyaWJhYmxlIGFzIGlzU3Vic2NyaWJhYmxlLFxuICDJtVJ1bnRpbWVFcnJvciBhcyBSdW50aW1lRXJyb3IsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtmb3JrSm9pbiwgZnJvbSwgT2JzZXJ2YWJsZX0gZnJvbSAncnhqcyc7XG5pbXBvcnQge21hcH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG5pbXBvcnQge1xuICBBc3luY1ZhbGlkYXRvcixcbiAgQXN5bmNWYWxpZGF0b3JGbixcbiAgVmFsaWRhdGlvbkVycm9ycyxcbiAgVmFsaWRhdG9yLFxuICBWYWxpZGF0b3JGbixcbn0gZnJvbSAnLi9kaXJlY3RpdmVzL3ZhbGlkYXRvcnMnO1xuaW1wb3J0IHtSdW50aW1lRXJyb3JDb2RlfSBmcm9tICcuL2Vycm9ycyc7XG5pbXBvcnQge0Fic3RyYWN0Q29udHJvbH0gZnJvbSAnLi9tb2RlbC9hYnN0cmFjdF9tb2RlbCc7XG5cbmZ1bmN0aW9uIGlzRW1wdHlJbnB1dFZhbHVlKHZhbHVlOiBhbnkpOiBib29sZWFuIHtcbiAgLyoqXG4gICAqIENoZWNrIGlmIHRoZSBvYmplY3QgaXMgYSBzdHJpbmcgb3IgYXJyYXkgYmVmb3JlIGV2YWx1YXRpbmcgdGhlIGxlbmd0aCBhdHRyaWJ1dGUuXG4gICAqIFRoaXMgYXZvaWRzIGZhbHNlbHkgcmVqZWN0aW5nIG9iamVjdHMgdGhhdCBjb250YWluIGEgY3VzdG9tIGxlbmd0aCBhdHRyaWJ1dGUuXG4gICAqIEZvciBleGFtcGxlLCB0aGUgb2JqZWN0IHtpZDogMSwgbGVuZ3RoOiAwLCB3aWR0aDogMH0gc2hvdWxkIG5vdCBiZSByZXR1cm5lZCBhcyBlbXB0eS5cbiAgICovXG4gIHJldHVybiAoXG4gICAgdmFsdWUgPT0gbnVsbCB8fCAoKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgfHwgQXJyYXkuaXNBcnJheSh2YWx1ZSkpICYmIHZhbHVlLmxlbmd0aCA9PT0gMClcbiAgKTtcbn1cblxuZnVuY3Rpb24gaGFzVmFsaWRMZW5ndGgodmFsdWU6IGFueSk6IGJvb2xlYW4ge1xuICAvLyBub24tc3RyaWN0IGNvbXBhcmlzb24gaXMgaW50ZW50aW9uYWwsIHRvIGNoZWNrIGZvciBib3RoIGBudWxsYCBhbmQgYHVuZGVmaW5lZGAgdmFsdWVzXG4gIHJldHVybiB2YWx1ZSAhPSBudWxsICYmIHR5cGVvZiB2YWx1ZS5sZW5ndGggPT09ICdudW1iZXInO1xufVxuXG4vKipcbiAqIEBkZXNjcmlwdGlvblxuICogQW4gYEluamVjdGlvblRva2VuYCBmb3IgcmVnaXN0ZXJpbmcgYWRkaXRpb25hbCBzeW5jaHJvbm91cyB2YWxpZGF0b3JzIHVzZWQgd2l0aFxuICogYEFic3RyYWN0Q29udHJvbGBzLlxuICpcbiAqIEBzZWUge0BsaW5rIE5HX0FTWU5DX1ZBTElEQVRPUlN9XG4gKlxuICogQHVzYWdlTm90ZXNcbiAqXG4gKiAjIyMgUHJvdmlkaW5nIGEgY3VzdG9tIHZhbGlkYXRvclxuICpcbiAqIFRoZSBmb2xsb3dpbmcgZXhhbXBsZSByZWdpc3RlcnMgYSBjdXN0b20gdmFsaWRhdG9yIGRpcmVjdGl2ZS4gQWRkaW5nIHRoZSB2YWxpZGF0b3IgdG8gdGhlXG4gKiBleGlzdGluZyBjb2xsZWN0aW9uIG9mIHZhbGlkYXRvcnMgcmVxdWlyZXMgdGhlIGBtdWx0aTogdHJ1ZWAgb3B0aW9uLlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIEBEaXJlY3RpdmUoe1xuICogICBzZWxlY3RvcjogJ1tjdXN0b21WYWxpZGF0b3JdJyxcbiAqICAgcHJvdmlkZXJzOiBbe3Byb3ZpZGU6IE5HX1ZBTElEQVRPUlMsIHVzZUV4aXN0aW5nOiBDdXN0b21WYWxpZGF0b3JEaXJlY3RpdmUsIG11bHRpOiB0cnVlfV1cbiAqIH0pXG4gKiBjbGFzcyBDdXN0b21WYWxpZGF0b3JEaXJlY3RpdmUgaW1wbGVtZW50cyBWYWxpZGF0b3Ige1xuICogICB2YWxpZGF0ZShjb250cm9sOiBBYnN0cmFjdENvbnRyb2wpOiBWYWxpZGF0aW9uRXJyb3JzIHwgbnVsbCB7XG4gKiAgICAgcmV0dXJuIHsgJ2N1c3RvbSc6IHRydWUgfTtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY29uc3QgTkdfVkFMSURBVE9SUyA9IG5ldyBJbmplY3Rpb25Ub2tlbjxSZWFkb25seUFycmF5PFZhbGlkYXRvciB8IEZ1bmN0aW9uPj4oXG4gIG5nRGV2TW9kZSA/ICdOZ1ZhbGlkYXRvcnMnIDogJycsXG4pO1xuXG4vKipcbiAqIEBkZXNjcmlwdGlvblxuICogQW4gYEluamVjdGlvblRva2VuYCBmb3IgcmVnaXN0ZXJpbmcgYWRkaXRpb25hbCBhc3luY2hyb25vdXMgdmFsaWRhdG9ycyB1c2VkIHdpdGhcbiAqIGBBYnN0cmFjdENvbnRyb2xgcy5cbiAqXG4gKiBAc2VlIHtAbGluayBOR19WQUxJREFUT1JTfVxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKlxuICogIyMjIFByb3ZpZGUgYSBjdXN0b20gYXN5bmMgdmFsaWRhdG9yIGRpcmVjdGl2ZVxuICpcbiAqIFRoZSBmb2xsb3dpbmcgZXhhbXBsZSBpbXBsZW1lbnRzIHRoZSBgQXN5bmNWYWxpZGF0b3JgIGludGVyZmFjZSB0byBjcmVhdGUgYW5cbiAqIGFzeW5jIHZhbGlkYXRvciBkaXJlY3RpdmUgd2l0aCBhIGN1c3RvbSBlcnJvciBrZXkuXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogQERpcmVjdGl2ZSh7XG4gKiAgIHNlbGVjdG9yOiAnW2N1c3RvbUFzeW5jVmFsaWRhdG9yXScsXG4gKiAgIHByb3ZpZGVyczogW3twcm92aWRlOiBOR19BU1lOQ19WQUxJREFUT1JTLCB1c2VFeGlzdGluZzogQ3VzdG9tQXN5bmNWYWxpZGF0b3JEaXJlY3RpdmUsIG11bHRpOlxuICogdHJ1ZX1dXG4gKiB9KVxuICogY2xhc3MgQ3VzdG9tQXN5bmNWYWxpZGF0b3JEaXJlY3RpdmUgaW1wbGVtZW50cyBBc3luY1ZhbGlkYXRvciB7XG4gKiAgIHZhbGlkYXRlKGNvbnRyb2w6IEFic3RyYWN0Q29udHJvbCk6IFByb21pc2U8VmFsaWRhdGlvbkVycm9yc3xudWxsPiB7XG4gKiAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh7J2N1c3RvbSc6IHRydWV9KTtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY29uc3QgTkdfQVNZTkNfVkFMSURBVE9SUyA9IG5ldyBJbmplY3Rpb25Ub2tlbjxSZWFkb25seUFycmF5PFZhbGlkYXRvciB8IEZ1bmN0aW9uPj4oXG4gIG5nRGV2TW9kZSA/ICdOZ0FzeW5jVmFsaWRhdG9ycycgOiAnJyxcbik7XG5cbi8qKlxuICogQSByZWd1bGFyIGV4cHJlc3Npb24gdGhhdCBtYXRjaGVzIHZhbGlkIGUtbWFpbCBhZGRyZXNzZXMuXG4gKlxuICogQXQgYSBoaWdoIGxldmVsLCB0aGlzIHJlZ2V4cCBtYXRjaGVzIGUtbWFpbCBhZGRyZXNzZXMgb2YgdGhlIGZvcm1hdCBgbG9jYWwtcGFydEB0bGRgLCB3aGVyZTpcbiAqIC0gYGxvY2FsLXBhcnRgIGNvbnNpc3RzIG9mIG9uZSBvciBtb3JlIG9mIHRoZSBhbGxvd2VkIGNoYXJhY3RlcnMgKGFscGhhbnVtZXJpYyBhbmQgc29tZVxuICogICBwdW5jdHVhdGlvbiBzeW1ib2xzKS5cbiAqIC0gYGxvY2FsLXBhcnRgIGNhbm5vdCBiZWdpbiBvciBlbmQgd2l0aCBhIHBlcmlvZCAoYC5gKS5cbiAqIC0gYGxvY2FsLXBhcnRgIGNhbm5vdCBiZSBsb25nZXIgdGhhbiA2NCBjaGFyYWN0ZXJzLlxuICogLSBgdGxkYCBjb25zaXN0cyBvZiBvbmUgb3IgbW9yZSBgbGFiZWxzYCBzZXBhcmF0ZWQgYnkgcGVyaW9kcyAoYC5gKS4gRm9yIGV4YW1wbGUgYGxvY2FsaG9zdGAgb3JcbiAqICAgYGZvby5jb21gLlxuICogLSBBIGBsYWJlbGAgY29uc2lzdHMgb2Ygb25lIG9yIG1vcmUgb2YgdGhlIGFsbG93ZWQgY2hhcmFjdGVycyAoYWxwaGFudW1lcmljLCBkYXNoZXMgKGAtYCkgYW5kXG4gKiAgIHBlcmlvZHMgKGAuYCkpLlxuICogLSBBIGBsYWJlbGAgY2Fubm90IGJlZ2luIG9yIGVuZCB3aXRoIGEgZGFzaCAoYC1gKSBvciBhIHBlcmlvZCAoYC5gKS5cbiAqIC0gQSBgbGFiZWxgIGNhbm5vdCBiZSBsb25nZXIgdGhhbiA2MyBjaGFyYWN0ZXJzLlxuICogLSBUaGUgd2hvbGUgYWRkcmVzcyBjYW5ub3QgYmUgbG9uZ2VyIHRoYW4gMjU0IGNoYXJhY3RlcnMuXG4gKlxuICogIyMgSW1wbGVtZW50YXRpb24gYmFja2dyb3VuZFxuICpcbiAqIFRoaXMgcmVnZXhwIHdhcyBwb3J0ZWQgb3ZlciBmcm9tIEFuZ3VsYXJKUyAoc2VlIHRoZXJlIGZvciBnaXQgaGlzdG9yeSk6XG4gKiBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyLmpzL2Jsb2IvYzEzM2VmODM2L3NyYy9uZy9kaXJlY3RpdmUvaW5wdXQuanMjTDI3XG4gKiBJdCBpcyBiYXNlZCBvbiB0aGVcbiAqIFtXSEFUV0cgdmVyc2lvbl0oaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2UvaW5wdXQuaHRtbCN2YWxpZC1lLW1haWwtYWRkcmVzcykgd2l0aFxuICogc29tZSBlbmhhbmNlbWVudHMgdG8gaW5jb3Jwb3JhdGUgbW9yZSBSRkMgcnVsZXMgKHN1Y2ggYXMgcnVsZXMgcmVsYXRlZCB0byBkb21haW4gbmFtZXMgYW5kIHRoZVxuICogbGVuZ3RocyBvZiBkaWZmZXJlbnQgcGFydHMgb2YgdGhlIGFkZHJlc3MpLiBUaGUgbWFpbiBkaWZmZXJlbmNlcyBmcm9tIHRoZSBXSEFUV0cgdmVyc2lvbiBhcmU6XG4gKiAgIC0gRGlzYWxsb3cgYGxvY2FsLXBhcnRgIHRvIGJlZ2luIG9yIGVuZCB3aXRoIGEgcGVyaW9kIChgLmApLlxuICogICAtIERpc2FsbG93IGBsb2NhbC1wYXJ0YCBsZW5ndGggdG8gZXhjZWVkIDY0IGNoYXJhY3RlcnMuXG4gKiAgIC0gRGlzYWxsb3cgdG90YWwgYWRkcmVzcyBsZW5ndGggdG8gZXhjZWVkIDI1NCBjaGFyYWN0ZXJzLlxuICpcbiAqIFNlZSBbdGhpcyBjb21taXRdKGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIuanMvY29tbWl0L2YzZjVjZjcyZSkgZm9yIG1vcmUgZGV0YWlscy5cbiAqL1xuY29uc3QgRU1BSUxfUkVHRVhQID1cbiAgL14oPz0uezEsMjU0fSQpKD89LnsxLDY0fUApW2EtekEtWjAtOSEjJCUmJyorLz0/Xl9ge3x9fi1dKyg/OlxcLlthLXpBLVowLTkhIyQlJicqKy89P15fYHt8fX4tXSspKkBbYS16QS1aMC05XSg/OlthLXpBLVowLTktXXswLDYxfVthLXpBLVowLTldKT8oPzpcXC5bYS16QS1aMC05XSg/OlthLXpBLVowLTktXXswLDYxfVthLXpBLVowLTldKT8pKiQvO1xuXG4vKipcbiAqIEBkZXNjcmlwdGlvblxuICogUHJvdmlkZXMgYSBzZXQgb2YgYnVpbHQtaW4gdmFsaWRhdG9ycyB0aGF0IGNhbiBiZSB1c2VkIGJ5IGZvcm0gY29udHJvbHMuXG4gKlxuICogQSB2YWxpZGF0b3IgaXMgYSBmdW5jdGlvbiB0aGF0IHByb2Nlc3NlcyBhIGBGb3JtQ29udHJvbGAgb3IgY29sbGVjdGlvbiBvZlxuICogY29udHJvbHMgYW5kIHJldHVybnMgYW4gZXJyb3IgbWFwIG9yIG51bGwuIEEgbnVsbCBtYXAgbWVhbnMgdGhhdCB2YWxpZGF0aW9uIGhhcyBwYXNzZWQuXG4gKlxuICogQHNlZSBbRm9ybSBWYWxpZGF0aW9uXShndWlkZS9mb3Jtcy9mb3JtLXZhbGlkYXRpb24pXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY2xhc3MgVmFsaWRhdG9ycyB7XG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogVmFsaWRhdG9yIHRoYXQgcmVxdWlyZXMgdGhlIGNvbnRyb2wncyB2YWx1ZSB0byBiZSBncmVhdGVyIHRoYW4gb3IgZXF1YWwgdG8gdGhlIHByb3ZpZGVkIG51bWJlci5cbiAgICpcbiAgICogQHVzYWdlTm90ZXNcbiAgICpcbiAgICogIyMjIFZhbGlkYXRlIGFnYWluc3QgYSBtaW5pbXVtIG9mIDNcbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiBjb25zdCBjb250cm9sID0gbmV3IEZvcm1Db250cm9sKDIsIFZhbGlkYXRvcnMubWluKDMpKTtcbiAgICpcbiAgICogY29uc29sZS5sb2coY29udHJvbC5lcnJvcnMpOyAvLyB7bWluOiB7bWluOiAzLCBhY3R1YWw6IDJ9fVxuICAgKiBgYGBcbiAgICpcbiAgICogQHJldHVybnMgQSB2YWxpZGF0b3IgZnVuY3Rpb24gdGhhdCByZXR1cm5zIGFuIGVycm9yIG1hcCB3aXRoIHRoZVxuICAgKiBgbWluYCBwcm9wZXJ0eSBpZiB0aGUgdmFsaWRhdGlvbiBjaGVjayBmYWlscywgb3RoZXJ3aXNlIGBudWxsYC5cbiAgICpcbiAgICogQHNlZSB7QGxpbmsgdXBkYXRlVmFsdWVBbmRWYWxpZGl0eSgpfVxuICAgKlxuICAgKi9cbiAgc3RhdGljIG1pbihtaW46IG51bWJlcik6IFZhbGlkYXRvckZuIHtcbiAgICByZXR1cm4gbWluVmFsaWRhdG9yKG1pbik7XG4gIH1cblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIFZhbGlkYXRvciB0aGF0IHJlcXVpcmVzIHRoZSBjb250cm9sJ3MgdmFsdWUgdG8gYmUgbGVzcyB0aGFuIG9yIGVxdWFsIHRvIHRoZSBwcm92aWRlZCBudW1iZXIuXG4gICAqXG4gICAqIEB1c2FnZU5vdGVzXG4gICAqXG4gICAqICMjIyBWYWxpZGF0ZSBhZ2FpbnN0IGEgbWF4aW11bSBvZiAxNVxuICAgKlxuICAgKiBgYGB0eXBlc2NyaXB0XG4gICAqIGNvbnN0IGNvbnRyb2wgPSBuZXcgRm9ybUNvbnRyb2woMTYsIFZhbGlkYXRvcnMubWF4KDE1KSk7XG4gICAqXG4gICAqIGNvbnNvbGUubG9nKGNvbnRyb2wuZXJyb3JzKTsgLy8ge21heDoge21heDogMTUsIGFjdHVhbDogMTZ9fVxuICAgKiBgYGBcbiAgICpcbiAgICogQHJldHVybnMgQSB2YWxpZGF0b3IgZnVuY3Rpb24gdGhhdCByZXR1cm5zIGFuIGVycm9yIG1hcCB3aXRoIHRoZVxuICAgKiBgbWF4YCBwcm9wZXJ0eSBpZiB0aGUgdmFsaWRhdGlvbiBjaGVjayBmYWlscywgb3RoZXJ3aXNlIGBudWxsYC5cbiAgICpcbiAgICogQHNlZSB7QGxpbmsgdXBkYXRlVmFsdWVBbmRWYWxpZGl0eSgpfVxuICAgKlxuICAgKi9cbiAgc3RhdGljIG1heChtYXg6IG51bWJlcik6IFZhbGlkYXRvckZuIHtcbiAgICByZXR1cm4gbWF4VmFsaWRhdG9yKG1heCk7XG4gIH1cblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIFZhbGlkYXRvciB0aGF0IHJlcXVpcmVzIHRoZSBjb250cm9sIGhhdmUgYSBub24tZW1wdHkgdmFsdWUuXG4gICAqXG4gICAqIEB1c2FnZU5vdGVzXG4gICAqXG4gICAqICMjIyBWYWxpZGF0ZSB0aGF0IHRoZSBmaWVsZCBpcyBub24tZW1wdHlcbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiBjb25zdCBjb250cm9sID0gbmV3IEZvcm1Db250cm9sKCcnLCBWYWxpZGF0b3JzLnJlcXVpcmVkKTtcbiAgICpcbiAgICogY29uc29sZS5sb2coY29udHJvbC5lcnJvcnMpOyAvLyB7cmVxdWlyZWQ6IHRydWV9XG4gICAqIGBgYFxuICAgKlxuICAgKiBAcmV0dXJucyBBbiBlcnJvciBtYXAgd2l0aCB0aGUgYHJlcXVpcmVkYCBwcm9wZXJ0eVxuICAgKiBpZiB0aGUgdmFsaWRhdGlvbiBjaGVjayBmYWlscywgb3RoZXJ3aXNlIGBudWxsYC5cbiAgICpcbiAgICogQHNlZSB7QGxpbmsgdXBkYXRlVmFsdWVBbmRWYWxpZGl0eSgpfVxuICAgKlxuICAgKi9cbiAgc3RhdGljIHJlcXVpcmVkKGNvbnRyb2w6IEFic3RyYWN0Q29udHJvbCk6IFZhbGlkYXRpb25FcnJvcnMgfCBudWxsIHtcbiAgICByZXR1cm4gcmVxdWlyZWRWYWxpZGF0b3IoY29udHJvbCk7XG4gIH1cblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIFZhbGlkYXRvciB0aGF0IHJlcXVpcmVzIHRoZSBjb250cm9sJ3MgdmFsdWUgYmUgdHJ1ZS4gVGhpcyB2YWxpZGF0b3IgaXMgY29tbW9ubHlcbiAgICogdXNlZCBmb3IgcmVxdWlyZWQgY2hlY2tib3hlcy5cbiAgICpcbiAgICogQHVzYWdlTm90ZXNcbiAgICpcbiAgICogIyMjIFZhbGlkYXRlIHRoYXQgdGhlIGZpZWxkIHZhbHVlIGlzIHRydWVcbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiBjb25zdCBjb250cm9sID0gbmV3IEZvcm1Db250cm9sKCdzb21lIHZhbHVlJywgVmFsaWRhdG9ycy5yZXF1aXJlZFRydWUpO1xuICAgKlxuICAgKiBjb25zb2xlLmxvZyhjb250cm9sLmVycm9ycyk7IC8vIHtyZXF1aXJlZDogdHJ1ZX1cbiAgICogYGBgXG4gICAqXG4gICAqIEByZXR1cm5zIEFuIGVycm9yIG1hcCB0aGF0IGNvbnRhaW5zIHRoZSBgcmVxdWlyZWRgIHByb3BlcnR5XG4gICAqIHNldCB0byBgdHJ1ZWAgaWYgdGhlIHZhbGlkYXRpb24gY2hlY2sgZmFpbHMsIG90aGVyd2lzZSBgbnVsbGAuXG4gICAqXG4gICAqIEBzZWUge0BsaW5rIHVwZGF0ZVZhbHVlQW5kVmFsaWRpdHkoKX1cbiAgICpcbiAgICovXG4gIHN0YXRpYyByZXF1aXJlZFRydWUoY29udHJvbDogQWJzdHJhY3RDb250cm9sKTogVmFsaWRhdGlvbkVycm9ycyB8IG51bGwge1xuICAgIHJldHVybiByZXF1aXJlZFRydWVWYWxpZGF0b3IoY29udHJvbCk7XG4gIH1cblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIFZhbGlkYXRvciB0aGF0IHJlcXVpcmVzIHRoZSBjb250cm9sJ3MgdmFsdWUgcGFzcyBhbiBlbWFpbCB2YWxpZGF0aW9uIHRlc3QuXG4gICAqXG4gICAqIFRlc3RzIHRoZSB2YWx1ZSB1c2luZyBhIFtyZWd1bGFyXG4gICAqIGV4cHJlc3Npb25dKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvR3VpZGUvUmVndWxhcl9FeHByZXNzaW9ucylcbiAgICogcGF0dGVybiBzdWl0YWJsZSBmb3IgY29tbW9uIHVzZSBjYXNlcy4gVGhlIHBhdHRlcm4gaXMgYmFzZWQgb24gdGhlIGRlZmluaXRpb24gb2YgYSB2YWxpZCBlbWFpbFxuICAgKiBhZGRyZXNzIGluIHRoZSBbV0hBVFdHIEhUTUxcbiAgICogc3BlY2lmaWNhdGlvbl0oaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2UvaW5wdXQuaHRtbCN2YWxpZC1lLW1haWwtYWRkcmVzcykgd2l0aFxuICAgKiBzb21lIGVuaGFuY2VtZW50cyB0byBpbmNvcnBvcmF0ZSBtb3JlIFJGQyBydWxlcyAoc3VjaCBhcyBydWxlcyByZWxhdGVkIHRvIGRvbWFpbiBuYW1lcyBhbmQgdGhlXG4gICAqIGxlbmd0aHMgb2YgZGlmZmVyZW50IHBhcnRzIG9mIHRoZSBhZGRyZXNzKS5cbiAgICpcbiAgICogVGhlIGRpZmZlcmVuY2VzIGZyb20gdGhlIFdIQVRXRyB2ZXJzaW9uIGluY2x1ZGU6XG4gICAqIC0gRGlzYWxsb3cgYGxvY2FsLXBhcnRgICh0aGUgcGFydCBiZWZvcmUgdGhlIGBAYCBzeW1ib2wpIHRvIGJlZ2luIG9yIGVuZCB3aXRoIGEgcGVyaW9kIChgLmApLlxuICAgKiAtIERpc2FsbG93IGBsb2NhbC1wYXJ0YCB0byBiZSBsb25nZXIgdGhhbiA2NCBjaGFyYWN0ZXJzLlxuICAgKiAtIERpc2FsbG93IHRoZSB3aG9sZSBhZGRyZXNzIHRvIGJlIGxvbmdlciB0aGFuIDI1NCBjaGFyYWN0ZXJzLlxuICAgKlxuICAgKiBJZiB0aGlzIHBhdHRlcm4gZG9lcyBub3Qgc2F0aXNmeSB5b3VyIGJ1c2luZXNzIG5lZWRzLCB5b3UgY2FuIHVzZSBgVmFsaWRhdG9ycy5wYXR0ZXJuKClgIHRvXG4gICAqIHZhbGlkYXRlIHRoZSB2YWx1ZSBhZ2FpbnN0IGEgZGlmZmVyZW50IHBhdHRlcm4uXG4gICAqXG4gICAqIEB1c2FnZU5vdGVzXG4gICAqXG4gICAqICMjIyBWYWxpZGF0ZSB0aGF0IHRoZSBmaWVsZCBtYXRjaGVzIGEgdmFsaWQgZW1haWwgcGF0dGVyblxuICAgKlxuICAgKiBgYGB0eXBlc2NyaXB0XG4gICAqIGNvbnN0IGNvbnRyb2wgPSBuZXcgRm9ybUNvbnRyb2woJ2JhZEAnLCBWYWxpZGF0b3JzLmVtYWlsKTtcbiAgICpcbiAgICogY29uc29sZS5sb2coY29udHJvbC5lcnJvcnMpOyAvLyB7ZW1haWw6IHRydWV9XG4gICAqIGBgYFxuICAgKlxuICAgKiBAcmV0dXJucyBBbiBlcnJvciBtYXAgd2l0aCB0aGUgYGVtYWlsYCBwcm9wZXJ0eVxuICAgKiBpZiB0aGUgdmFsaWRhdGlvbiBjaGVjayBmYWlscywgb3RoZXJ3aXNlIGBudWxsYC5cbiAgICpcbiAgICogQHNlZSB7QGxpbmsgdXBkYXRlVmFsdWVBbmRWYWxpZGl0eSgpfVxuICAgKlxuICAgKi9cbiAgc3RhdGljIGVtYWlsKGNvbnRyb2w6IEFic3RyYWN0Q29udHJvbCk6IFZhbGlkYXRpb25FcnJvcnMgfCBudWxsIHtcbiAgICByZXR1cm4gZW1haWxWYWxpZGF0b3IoY29udHJvbCk7XG4gIH1cblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIFZhbGlkYXRvciB0aGF0IHJlcXVpcmVzIHRoZSBsZW5ndGggb2YgdGhlIGNvbnRyb2wncyB2YWx1ZSB0byBiZSBncmVhdGVyIHRoYW4gb3IgZXF1YWxcbiAgICogdG8gdGhlIHByb3ZpZGVkIG1pbmltdW0gbGVuZ3RoLiBUaGlzIHZhbGlkYXRvciBpcyBhbHNvIHByb3ZpZGVkIGJ5IGRlZmF1bHQgaWYgeW91IHVzZSB0aGVcbiAgICogdGhlIEhUTUw1IGBtaW5sZW5ndGhgIGF0dHJpYnV0ZS4gTm90ZSB0aGF0IHRoZSBgbWluTGVuZ3RoYCB2YWxpZGF0b3IgaXMgaW50ZW5kZWQgdG8gYmUgdXNlZFxuICAgKiBvbmx5IGZvciB0eXBlcyB0aGF0IGhhdmUgYSBudW1lcmljIGBsZW5ndGhgIHByb3BlcnR5LCBzdWNoIGFzIHN0cmluZ3Mgb3IgYXJyYXlzLiBUaGVcbiAgICogYG1pbkxlbmd0aGAgdmFsaWRhdG9yIGxvZ2ljIGlzIGFsc28gbm90IGludm9rZWQgZm9yIHZhbHVlcyB3aGVuIHRoZWlyIGBsZW5ndGhgIHByb3BlcnR5IGlzIDBcbiAgICogKGZvciBleGFtcGxlIGluIGNhc2Ugb2YgYW4gZW1wdHkgc3RyaW5nIG9yIGFuIGVtcHR5IGFycmF5KSwgdG8gc3VwcG9ydCBvcHRpb25hbCBjb250cm9scy4gWW91XG4gICAqIGNhbiB1c2UgdGhlIHN0YW5kYXJkIGByZXF1aXJlZGAgdmFsaWRhdG9yIGlmIGVtcHR5IHZhbHVlcyBzaG91bGQgbm90IGJlIGNvbnNpZGVyZWQgdmFsaWQuXG4gICAqXG4gICAqIEB1c2FnZU5vdGVzXG4gICAqXG4gICAqICMjIyBWYWxpZGF0ZSB0aGF0IHRoZSBmaWVsZCBoYXMgYSBtaW5pbXVtIG9mIDMgY2hhcmFjdGVyc1xuICAgKlxuICAgKiBgYGB0eXBlc2NyaXB0XG4gICAqIGNvbnN0IGNvbnRyb2wgPSBuZXcgRm9ybUNvbnRyb2woJ25nJywgVmFsaWRhdG9ycy5taW5MZW5ndGgoMykpO1xuICAgKlxuICAgKiBjb25zb2xlLmxvZyhjb250cm9sLmVycm9ycyk7IC8vIHttaW5sZW5ndGg6IHtyZXF1aXJlZExlbmd0aDogMywgYWN0dWFsTGVuZ3RoOiAyfX1cbiAgICogYGBgXG4gICAqXG4gICAqIGBgYGh0bWxcbiAgICogPGlucHV0IG1pbmxlbmd0aD1cIjVcIj5cbiAgICogYGBgXG4gICAqXG4gICAqIEByZXR1cm5zIEEgdmFsaWRhdG9yIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhbiBlcnJvciBtYXAgd2l0aCB0aGVcbiAgICogYG1pbmxlbmd0aGAgcHJvcGVydHkgaWYgdGhlIHZhbGlkYXRpb24gY2hlY2sgZmFpbHMsIG90aGVyd2lzZSBgbnVsbGAuXG4gICAqXG4gICAqIEBzZWUge0BsaW5rIHVwZGF0ZVZhbHVlQW5kVmFsaWRpdHkoKX1cbiAgICpcbiAgICovXG4gIHN0YXRpYyBtaW5MZW5ndGgobWluTGVuZ3RoOiBudW1iZXIpOiBWYWxpZGF0b3JGbiB7XG4gICAgcmV0dXJuIG1pbkxlbmd0aFZhbGlkYXRvcihtaW5MZW5ndGgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBWYWxpZGF0b3IgdGhhdCByZXF1aXJlcyB0aGUgbGVuZ3RoIG9mIHRoZSBjb250cm9sJ3MgdmFsdWUgdG8gYmUgbGVzcyB0aGFuIG9yIGVxdWFsXG4gICAqIHRvIHRoZSBwcm92aWRlZCBtYXhpbXVtIGxlbmd0aC4gVGhpcyB2YWxpZGF0b3IgaXMgYWxzbyBwcm92aWRlZCBieSBkZWZhdWx0IGlmIHlvdSB1c2UgdGhlXG4gICAqIHRoZSBIVE1MNSBgbWF4bGVuZ3RoYCBhdHRyaWJ1dGUuIE5vdGUgdGhhdCB0aGUgYG1heExlbmd0aGAgdmFsaWRhdG9yIGlzIGludGVuZGVkIHRvIGJlIHVzZWRcbiAgICogb25seSBmb3IgdHlwZXMgdGhhdCBoYXZlIGEgbnVtZXJpYyBgbGVuZ3RoYCBwcm9wZXJ0eSwgc3VjaCBhcyBzdHJpbmdzIG9yIGFycmF5cy5cbiAgICpcbiAgICogQHVzYWdlTm90ZXNcbiAgICpcbiAgICogIyMjIFZhbGlkYXRlIHRoYXQgdGhlIGZpZWxkIGhhcyBtYXhpbXVtIG9mIDUgY2hhcmFjdGVyc1xuICAgKlxuICAgKiBgYGB0eXBlc2NyaXB0XG4gICAqIGNvbnN0IGNvbnRyb2wgPSBuZXcgRm9ybUNvbnRyb2woJ0FuZ3VsYXInLCBWYWxpZGF0b3JzLm1heExlbmd0aCg1KSk7XG4gICAqXG4gICAqIGNvbnNvbGUubG9nKGNvbnRyb2wuZXJyb3JzKTsgLy8ge21heGxlbmd0aDoge3JlcXVpcmVkTGVuZ3RoOiA1LCBhY3R1YWxMZW5ndGg6IDd9fVxuICAgKiBgYGBcbiAgICpcbiAgICogYGBgaHRtbFxuICAgKiA8aW5wdXQgbWF4bGVuZ3RoPVwiNVwiPlxuICAgKiBgYGBcbiAgICpcbiAgICogQHJldHVybnMgQSB2YWxpZGF0b3IgZnVuY3Rpb24gdGhhdCByZXR1cm5zIGFuIGVycm9yIG1hcCB3aXRoIHRoZVxuICAgKiBgbWF4bGVuZ3RoYCBwcm9wZXJ0eSBpZiB0aGUgdmFsaWRhdGlvbiBjaGVjayBmYWlscywgb3RoZXJ3aXNlIGBudWxsYC5cbiAgICpcbiAgICogQHNlZSB7QGxpbmsgdXBkYXRlVmFsdWVBbmRWYWxpZGl0eSgpfVxuICAgKlxuICAgKi9cbiAgc3RhdGljIG1heExlbmd0aChtYXhMZW5ndGg6IG51bWJlcik6IFZhbGlkYXRvckZuIHtcbiAgICByZXR1cm4gbWF4TGVuZ3RoVmFsaWRhdG9yKG1heExlbmd0aCk7XG4gIH1cblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIFZhbGlkYXRvciB0aGF0IHJlcXVpcmVzIHRoZSBjb250cm9sJ3MgdmFsdWUgdG8gbWF0Y2ggYSByZWdleCBwYXR0ZXJuLiBUaGlzIHZhbGlkYXRvciBpcyBhbHNvXG4gICAqIHByb3ZpZGVkIGJ5IGRlZmF1bHQgaWYgeW91IHVzZSB0aGUgSFRNTDUgYHBhdHRlcm5gIGF0dHJpYnV0ZS5cbiAgICpcbiAgICogQHVzYWdlTm90ZXNcbiAgICpcbiAgICogIyMjIFZhbGlkYXRlIHRoYXQgdGhlIGZpZWxkIG9ubHkgY29udGFpbnMgbGV0dGVycyBvciBzcGFjZXNcbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiBjb25zdCBjb250cm9sID0gbmV3IEZvcm1Db250cm9sKCcxJywgVmFsaWRhdG9ycy5wYXR0ZXJuKCdbYS16QS1aIF0qJykpO1xuICAgKlxuICAgKiBjb25zb2xlLmxvZyhjb250cm9sLmVycm9ycyk7IC8vIHtwYXR0ZXJuOiB7cmVxdWlyZWRQYXR0ZXJuOiAnXlthLXpBLVogXSokJywgYWN0dWFsVmFsdWU6ICcxJ319XG4gICAqIGBgYFxuICAgKlxuICAgKiBgYGBodG1sXG4gICAqIDxpbnB1dCBwYXR0ZXJuPVwiW2EtekEtWiBdKlwiPlxuICAgKiBgYGBcbiAgICpcbiAgICogIyMjIFBhdHRlcm4gbWF0Y2hpbmcgd2l0aCB0aGUgZ2xvYmFsIG9yIHN0aWNreSBmbGFnXG4gICAqXG4gICAqIGBSZWdFeHBgIG9iamVjdHMgY3JlYXRlZCB3aXRoIHRoZSBgZ2Agb3IgYHlgIGZsYWdzIHRoYXQgYXJlIHBhc3NlZCBpbnRvIGBWYWxpZGF0b3JzLnBhdHRlcm5gXG4gICAqIGNhbiBwcm9kdWNlIGRpZmZlcmVudCByZXN1bHRzIG9uIHRoZSBzYW1lIGlucHV0IHdoZW4gdmFsaWRhdGlvbnMgYXJlIHJ1biBjb25zZWN1dGl2ZWx5LiBUaGlzIGlzXG4gICAqIGR1ZSB0byBob3cgdGhlIGJlaGF2aW9yIG9mIGBSZWdFeHAucHJvdG90eXBlLnRlc3RgIGlzXG4gICAqIHNwZWNpZmllZCBpbiBbRUNNQS0yNjJdKGh0dHBzOi8vdGMzOS5lcy9lY21hMjYyLyNzZWMtcmVnZXhwYnVpbHRpbmV4ZWMpXG4gICAqIChgUmVnRXhwYCBwcmVzZXJ2ZXMgdGhlIGluZGV4IG9mIHRoZSBsYXN0IG1hdGNoIHdoZW4gdGhlIGdsb2JhbCBvciBzdGlja3kgZmxhZyBpcyB1c2VkKS5cbiAgICogRHVlIHRvIHRoaXMgYmVoYXZpb3IsIGl0IGlzIHJlY29tbWVuZGVkIHRoYXQgd2hlbiB1c2luZ1xuICAgKiBgVmFsaWRhdG9ycy5wYXR0ZXJuYCB5b3UgKipkbyBub3QqKiBwYXNzIGluIGEgYFJlZ0V4cGAgb2JqZWN0IHdpdGggZWl0aGVyIHRoZSBnbG9iYWwgb3Igc3RpY2t5XG4gICAqIGZsYWcgZW5hYmxlZC5cbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiAvLyBOb3QgcmVjb21tZW5kZWQgKHNpbmNlIHRoZSBgZ2AgZmxhZyBpcyB1c2VkKVxuICAgKiBjb25zdCBjb250cm9sT25lID0gbmV3IEZvcm1Db250cm9sKCcxJywgVmFsaWRhdG9ycy5wYXR0ZXJuKC9mb28vZykpO1xuICAgKlxuICAgKiAvLyBHb29kXG4gICAqIGNvbnN0IGNvbnRyb2xUd28gPSBuZXcgRm9ybUNvbnRyb2woJzEnLCBWYWxpZGF0b3JzLnBhdHRlcm4oL2Zvby8pKTtcbiAgICogYGBgXG4gICAqXG4gICAqIEBwYXJhbSBwYXR0ZXJuIEEgcmVndWxhciBleHByZXNzaW9uIHRvIGJlIHVzZWQgYXMgaXMgdG8gdGVzdCB0aGUgdmFsdWVzLCBvciBhIHN0cmluZy5cbiAgICogSWYgYSBzdHJpbmcgaXMgcGFzc2VkLCB0aGUgYF5gIGNoYXJhY3RlciBpcyBwcmVwZW5kZWQgYW5kIHRoZSBgJGAgY2hhcmFjdGVyIGlzXG4gICAqIGFwcGVuZGVkIHRvIHRoZSBwcm92aWRlZCBzdHJpbmcgKGlmIG5vdCBhbHJlYWR5IHByZXNlbnQpLCBhbmQgdGhlIHJlc3VsdGluZyByZWd1bGFyXG4gICAqIGV4cHJlc3Npb24gaXMgdXNlZCB0byB0ZXN0IHRoZSB2YWx1ZXMuXG4gICAqXG4gICAqIEByZXR1cm5zIEEgdmFsaWRhdG9yIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhbiBlcnJvciBtYXAgd2l0aCB0aGVcbiAgICogYHBhdHRlcm5gIHByb3BlcnR5IGlmIHRoZSB2YWxpZGF0aW9uIGNoZWNrIGZhaWxzLCBvdGhlcndpc2UgYG51bGxgLlxuICAgKlxuICAgKiBAc2VlIHtAbGluayB1cGRhdGVWYWx1ZUFuZFZhbGlkaXR5KCl9XG4gICAqXG4gICAqL1xuICBzdGF0aWMgcGF0dGVybihwYXR0ZXJuOiBzdHJpbmcgfCBSZWdFeHApOiBWYWxpZGF0b3JGbiB7XG4gICAgcmV0dXJuIHBhdHRlcm5WYWxpZGF0b3IocGF0dGVybik7XG4gIH1cblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIFZhbGlkYXRvciB0aGF0IHBlcmZvcm1zIG5vIG9wZXJhdGlvbi5cbiAgICpcbiAgICogQHNlZSB7QGxpbmsgdXBkYXRlVmFsdWVBbmRWYWxpZGl0eSgpfVxuICAgKlxuICAgKi9cbiAgc3RhdGljIG51bGxWYWxpZGF0b3IoY29udHJvbDogQWJzdHJhY3RDb250cm9sKTogVmFsaWRhdGlvbkVycm9ycyB8IG51bGwge1xuICAgIHJldHVybiBudWxsVmFsaWRhdG9yKGNvbnRyb2wpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBDb21wb3NlIG11bHRpcGxlIHZhbGlkYXRvcnMgaW50byBhIHNpbmdsZSBmdW5jdGlvbiB0aGF0IHJldHVybnMgdGhlIHVuaW9uXG4gICAqIG9mIHRoZSBpbmRpdmlkdWFsIGVycm9yIG1hcHMgZm9yIHRoZSBwcm92aWRlZCBjb250cm9sLlxuICAgKlxuICAgKiBAcmV0dXJucyBBIHZhbGlkYXRvciBmdW5jdGlvbiB0aGF0IHJldHVybnMgYW4gZXJyb3IgbWFwIHdpdGggdGhlXG4gICAqIG1lcmdlZCBlcnJvciBtYXBzIG9mIHRoZSB2YWxpZGF0b3JzIGlmIHRoZSB2YWxpZGF0aW9uIGNoZWNrIGZhaWxzLCBvdGhlcndpc2UgYG51bGxgLlxuICAgKlxuICAgKiBAc2VlIHtAbGluayB1cGRhdGVWYWx1ZUFuZFZhbGlkaXR5KCl9XG4gICAqXG4gICAqL1xuICBzdGF0aWMgY29tcG9zZSh2YWxpZGF0b3JzOiBudWxsKTogbnVsbDtcbiAgc3RhdGljIGNvbXBvc2UodmFsaWRhdG9yczogKFZhbGlkYXRvckZuIHwgbnVsbCB8IHVuZGVmaW5lZClbXSk6IFZhbGlkYXRvckZuIHwgbnVsbDtcbiAgc3RhdGljIGNvbXBvc2UodmFsaWRhdG9yczogKFZhbGlkYXRvckZuIHwgbnVsbCB8IHVuZGVmaW5lZClbXSB8IG51bGwpOiBWYWxpZGF0b3JGbiB8IG51bGwge1xuICAgIHJldHVybiBjb21wb3NlKHZhbGlkYXRvcnMpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBDb21wb3NlIG11bHRpcGxlIGFzeW5jIHZhbGlkYXRvcnMgaW50byBhIHNpbmdsZSBmdW5jdGlvbiB0aGF0IHJldHVybnMgdGhlIHVuaW9uXG4gICAqIG9mIHRoZSBpbmRpdmlkdWFsIGVycm9yIG9iamVjdHMgZm9yIHRoZSBwcm92aWRlZCBjb250cm9sLlxuICAgKlxuICAgKiBAcmV0dXJucyBBIHZhbGlkYXRvciBmdW5jdGlvbiB0aGF0IHJldHVybnMgYW4gZXJyb3IgbWFwIHdpdGggdGhlXG4gICAqIG1lcmdlZCBlcnJvciBvYmplY3RzIG9mIHRoZSBhc3luYyB2YWxpZGF0b3JzIGlmIHRoZSB2YWxpZGF0aW9uIGNoZWNrIGZhaWxzLCBvdGhlcndpc2UgYG51bGxgLlxuICAgKlxuICAgKiBAc2VlIHtAbGluayB1cGRhdGVWYWx1ZUFuZFZhbGlkaXR5KCl9XG4gICAqXG4gICAqL1xuICBzdGF0aWMgY29tcG9zZUFzeW5jKHZhbGlkYXRvcnM6IChBc3luY1ZhbGlkYXRvckZuIHwgbnVsbClbXSk6IEFzeW5jVmFsaWRhdG9yRm4gfCBudWxsIHtcbiAgICByZXR1cm4gY29tcG9zZUFzeW5jKHZhbGlkYXRvcnMpO1xuICB9XG59XG5cbi8qKlxuICogVmFsaWRhdG9yIHRoYXQgcmVxdWlyZXMgdGhlIGNvbnRyb2wncyB2YWx1ZSB0byBiZSBncmVhdGVyIHRoYW4gb3IgZXF1YWwgdG8gdGhlIHByb3ZpZGVkIG51bWJlci5cbiAqIFNlZSBgVmFsaWRhdG9ycy5taW5gIGZvciBhZGRpdGlvbmFsIGluZm9ybWF0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gbWluVmFsaWRhdG9yKG1pbjogbnVtYmVyKTogVmFsaWRhdG9yRm4ge1xuICByZXR1cm4gKGNvbnRyb2w6IEFic3RyYWN0Q29udHJvbCk6IFZhbGlkYXRpb25FcnJvcnMgfCBudWxsID0+IHtcbiAgICBpZiAoaXNFbXB0eUlucHV0VmFsdWUoY29udHJvbC52YWx1ZSkgfHwgaXNFbXB0eUlucHV0VmFsdWUobWluKSkge1xuICAgICAgcmV0dXJuIG51bGw7IC8vIGRvbid0IHZhbGlkYXRlIGVtcHR5IHZhbHVlcyB0byBhbGxvdyBvcHRpb25hbCBjb250cm9sc1xuICAgIH1cbiAgICBjb25zdCB2YWx1ZSA9IHBhcnNlRmxvYXQoY29udHJvbC52YWx1ZSk7XG4gICAgLy8gQ29udHJvbHMgd2l0aCBOYU4gdmFsdWVzIGFmdGVyIHBhcnNpbmcgc2hvdWxkIGJlIHRyZWF0ZWQgYXMgbm90IGhhdmluZyBhXG4gICAgLy8gbWluaW11bSwgcGVyIHRoZSBIVE1MIGZvcm1zIHNwZWM6IGh0dHBzOi8vd3d3LnczLm9yZy9UUi9odG1sNS9mb3Jtcy5odG1sI2F0dHItaW5wdXQtbWluXG4gICAgcmV0dXJuICFpc05hTih2YWx1ZSkgJiYgdmFsdWUgPCBtaW4gPyB7J21pbic6IHsnbWluJzogbWluLCAnYWN0dWFsJzogY29udHJvbC52YWx1ZX19IDogbnVsbDtcbiAgfTtcbn1cblxuLyoqXG4gKiBWYWxpZGF0b3IgdGhhdCByZXF1aXJlcyB0aGUgY29udHJvbCdzIHZhbHVlIHRvIGJlIGxlc3MgdGhhbiBvciBlcXVhbCB0byB0aGUgcHJvdmlkZWQgbnVtYmVyLlxuICogU2VlIGBWYWxpZGF0b3JzLm1heGAgZm9yIGFkZGl0aW9uYWwgaW5mb3JtYXRpb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtYXhWYWxpZGF0b3IobWF4OiBudW1iZXIpOiBWYWxpZGF0b3JGbiB7XG4gIHJldHVybiAoY29udHJvbDogQWJzdHJhY3RDb250cm9sKTogVmFsaWRhdGlvbkVycm9ycyB8IG51bGwgPT4ge1xuICAgIGlmIChpc0VtcHR5SW5wdXRWYWx1ZShjb250cm9sLnZhbHVlKSB8fCBpc0VtcHR5SW5wdXRWYWx1ZShtYXgpKSB7XG4gICAgICByZXR1cm4gbnVsbDsgLy8gZG9uJ3QgdmFsaWRhdGUgZW1wdHkgdmFsdWVzIHRvIGFsbG93IG9wdGlvbmFsIGNvbnRyb2xzXG4gICAgfVxuICAgIGNvbnN0IHZhbHVlID0gcGFyc2VGbG9hdChjb250cm9sLnZhbHVlKTtcbiAgICAvLyBDb250cm9scyB3aXRoIE5hTiB2YWx1ZXMgYWZ0ZXIgcGFyc2luZyBzaG91bGQgYmUgdHJlYXRlZCBhcyBub3QgaGF2aW5nIGFcbiAgICAvLyBtYXhpbXVtLCBwZXIgdGhlIEhUTUwgZm9ybXMgc3BlYzogaHR0cHM6Ly93d3cudzMub3JnL1RSL2h0bWw1L2Zvcm1zLmh0bWwjYXR0ci1pbnB1dC1tYXhcbiAgICByZXR1cm4gIWlzTmFOKHZhbHVlKSAmJiB2YWx1ZSA+IG1heCA/IHsnbWF4JzogeydtYXgnOiBtYXgsICdhY3R1YWwnOiBjb250cm9sLnZhbHVlfX0gOiBudWxsO1xuICB9O1xufVxuXG4vKipcbiAqIFZhbGlkYXRvciB0aGF0IHJlcXVpcmVzIHRoZSBjb250cm9sIGhhdmUgYSBub24tZW1wdHkgdmFsdWUuXG4gKiBTZWUgYFZhbGlkYXRvcnMucmVxdWlyZWRgIGZvciBhZGRpdGlvbmFsIGluZm9ybWF0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVxdWlyZWRWYWxpZGF0b3IoY29udHJvbDogQWJzdHJhY3RDb250cm9sKTogVmFsaWRhdGlvbkVycm9ycyB8IG51bGwge1xuICByZXR1cm4gaXNFbXB0eUlucHV0VmFsdWUoY29udHJvbC52YWx1ZSkgPyB7J3JlcXVpcmVkJzogdHJ1ZX0gOiBudWxsO1xufVxuXG4vKipcbiAqIFZhbGlkYXRvciB0aGF0IHJlcXVpcmVzIHRoZSBjb250cm9sJ3MgdmFsdWUgYmUgdHJ1ZS4gVGhpcyB2YWxpZGF0b3IgaXMgY29tbW9ubHlcbiAqIHVzZWQgZm9yIHJlcXVpcmVkIGNoZWNrYm94ZXMuXG4gKiBTZWUgYFZhbGlkYXRvcnMucmVxdWlyZWRUcnVlYCBmb3IgYWRkaXRpb25hbCBpbmZvcm1hdGlvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlcXVpcmVkVHJ1ZVZhbGlkYXRvcihjb250cm9sOiBBYnN0cmFjdENvbnRyb2wpOiBWYWxpZGF0aW9uRXJyb3JzIHwgbnVsbCB7XG4gIHJldHVybiBjb250cm9sLnZhbHVlID09PSB0cnVlID8gbnVsbCA6IHsncmVxdWlyZWQnOiB0cnVlfTtcbn1cblxuLyoqXG4gKiBWYWxpZGF0b3IgdGhhdCByZXF1aXJlcyB0aGUgY29udHJvbCdzIHZhbHVlIHBhc3MgYW4gZW1haWwgdmFsaWRhdGlvbiB0ZXN0LlxuICogU2VlIGBWYWxpZGF0b3JzLmVtYWlsYCBmb3IgYWRkaXRpb25hbCBpbmZvcm1hdGlvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVtYWlsVmFsaWRhdG9yKGNvbnRyb2w6IEFic3RyYWN0Q29udHJvbCk6IFZhbGlkYXRpb25FcnJvcnMgfCBudWxsIHtcbiAgaWYgKGlzRW1wdHlJbnB1dFZhbHVlKGNvbnRyb2wudmFsdWUpKSB7XG4gICAgcmV0dXJuIG51bGw7IC8vIGRvbid0IHZhbGlkYXRlIGVtcHR5IHZhbHVlcyB0byBhbGxvdyBvcHRpb25hbCBjb250cm9sc1xuICB9XG4gIHJldHVybiBFTUFJTF9SRUdFWFAudGVzdChjb250cm9sLnZhbHVlKSA/IG51bGwgOiB7J2VtYWlsJzogdHJ1ZX07XG59XG5cbi8qKlxuICogVmFsaWRhdG9yIHRoYXQgcmVxdWlyZXMgdGhlIGxlbmd0aCBvZiB0aGUgY29udHJvbCdzIHZhbHVlIHRvIGJlIGdyZWF0ZXIgdGhhbiBvciBlcXVhbFxuICogdG8gdGhlIHByb3ZpZGVkIG1pbmltdW0gbGVuZ3RoLiBTZWUgYFZhbGlkYXRvcnMubWluTGVuZ3RoYCBmb3IgYWRkaXRpb25hbCBpbmZvcm1hdGlvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1pbkxlbmd0aFZhbGlkYXRvcihtaW5MZW5ndGg6IG51bWJlcik6IFZhbGlkYXRvckZuIHtcbiAgcmV0dXJuIChjb250cm9sOiBBYnN0cmFjdENvbnRyb2wpOiBWYWxpZGF0aW9uRXJyb3JzIHwgbnVsbCA9PiB7XG4gICAgaWYgKGlzRW1wdHlJbnB1dFZhbHVlKGNvbnRyb2wudmFsdWUpIHx8ICFoYXNWYWxpZExlbmd0aChjb250cm9sLnZhbHVlKSkge1xuICAgICAgLy8gZG9uJ3QgdmFsaWRhdGUgZW1wdHkgdmFsdWVzIHRvIGFsbG93IG9wdGlvbmFsIGNvbnRyb2xzXG4gICAgICAvLyBkb24ndCB2YWxpZGF0ZSB2YWx1ZXMgd2l0aG91dCBgbGVuZ3RoYCBwcm9wZXJ0eVxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvbnRyb2wudmFsdWUubGVuZ3RoIDwgbWluTGVuZ3RoXG4gICAgICA/IHsnbWlubGVuZ3RoJzogeydyZXF1aXJlZExlbmd0aCc6IG1pbkxlbmd0aCwgJ2FjdHVhbExlbmd0aCc6IGNvbnRyb2wudmFsdWUubGVuZ3RofX1cbiAgICAgIDogbnVsbDtcbiAgfTtcbn1cblxuLyoqXG4gKiBWYWxpZGF0b3IgdGhhdCByZXF1aXJlcyB0aGUgbGVuZ3RoIG9mIHRoZSBjb250cm9sJ3MgdmFsdWUgdG8gYmUgbGVzcyB0aGFuIG9yIGVxdWFsXG4gKiB0byB0aGUgcHJvdmlkZWQgbWF4aW11bSBsZW5ndGguIFNlZSBgVmFsaWRhdG9ycy5tYXhMZW5ndGhgIGZvciBhZGRpdGlvbmFsIGluZm9ybWF0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gbWF4TGVuZ3RoVmFsaWRhdG9yKG1heExlbmd0aDogbnVtYmVyKTogVmFsaWRhdG9yRm4ge1xuICByZXR1cm4gKGNvbnRyb2w6IEFic3RyYWN0Q29udHJvbCk6IFZhbGlkYXRpb25FcnJvcnMgfCBudWxsID0+IHtcbiAgICByZXR1cm4gaGFzVmFsaWRMZW5ndGgoY29udHJvbC52YWx1ZSkgJiYgY29udHJvbC52YWx1ZS5sZW5ndGggPiBtYXhMZW5ndGhcbiAgICAgID8geydtYXhsZW5ndGgnOiB7J3JlcXVpcmVkTGVuZ3RoJzogbWF4TGVuZ3RoLCAnYWN0dWFsTGVuZ3RoJzogY29udHJvbC52YWx1ZS5sZW5ndGh9fVxuICAgICAgOiBudWxsO1xuICB9O1xufVxuXG4vKipcbiAqIFZhbGlkYXRvciB0aGF0IHJlcXVpcmVzIHRoZSBjb250cm9sJ3MgdmFsdWUgdG8gbWF0Y2ggYSByZWdleCBwYXR0ZXJuLlxuICogU2VlIGBWYWxpZGF0b3JzLnBhdHRlcm5gIGZvciBhZGRpdGlvbmFsIGluZm9ybWF0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcGF0dGVyblZhbGlkYXRvcihwYXR0ZXJuOiBzdHJpbmcgfCBSZWdFeHApOiBWYWxpZGF0b3JGbiB7XG4gIGlmICghcGF0dGVybikgcmV0dXJuIG51bGxWYWxpZGF0b3I7XG4gIGxldCByZWdleDogUmVnRXhwO1xuICBsZXQgcmVnZXhTdHI6IHN0cmluZztcbiAgaWYgKHR5cGVvZiBwYXR0ZXJuID09PSAnc3RyaW5nJykge1xuICAgIHJlZ2V4U3RyID0gJyc7XG5cbiAgICBpZiAocGF0dGVybi5jaGFyQXQoMCkgIT09ICdeJykgcmVnZXhTdHIgKz0gJ14nO1xuXG4gICAgcmVnZXhTdHIgKz0gcGF0dGVybjtcblxuICAgIGlmIChwYXR0ZXJuLmNoYXJBdChwYXR0ZXJuLmxlbmd0aCAtIDEpICE9PSAnJCcpIHJlZ2V4U3RyICs9ICckJztcblxuICAgIHJlZ2V4ID0gbmV3IFJlZ0V4cChyZWdleFN0cik7XG4gIH0gZWxzZSB7XG4gICAgcmVnZXhTdHIgPSBwYXR0ZXJuLnRvU3RyaW5nKCk7XG4gICAgcmVnZXggPSBwYXR0ZXJuO1xuICB9XG4gIHJldHVybiAoY29udHJvbDogQWJzdHJhY3RDb250cm9sKTogVmFsaWRhdGlvbkVycm9ycyB8IG51bGwgPT4ge1xuICAgIGlmIChpc0VtcHR5SW5wdXRWYWx1ZShjb250cm9sLnZhbHVlKSkge1xuICAgICAgcmV0dXJuIG51bGw7IC8vIGRvbid0IHZhbGlkYXRlIGVtcHR5IHZhbHVlcyB0byBhbGxvdyBvcHRpb25hbCBjb250cm9sc1xuICAgIH1cbiAgICBjb25zdCB2YWx1ZTogc3RyaW5nID0gY29udHJvbC52YWx1ZTtcbiAgICByZXR1cm4gcmVnZXgudGVzdCh2YWx1ZSlcbiAgICAgID8gbnVsbFxuICAgICAgOiB7J3BhdHRlcm4nOiB7J3JlcXVpcmVkUGF0dGVybic6IHJlZ2V4U3RyLCAnYWN0dWFsVmFsdWUnOiB2YWx1ZX19O1xuICB9O1xufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHRoYXQgaGFzIGBWYWxpZGF0b3JGbmAgc2hhcGUsIGJ1dCBwZXJmb3JtcyBubyBvcGVyYXRpb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBudWxsVmFsaWRhdG9yKGNvbnRyb2w6IEFic3RyYWN0Q29udHJvbCk6IFZhbGlkYXRpb25FcnJvcnMgfCBudWxsIHtcbiAgcmV0dXJuIG51bGw7XG59XG5cbmZ1bmN0aW9uIGlzUHJlc2VudChvOiBhbnkpOiBib29sZWFuIHtcbiAgcmV0dXJuIG8gIT0gbnVsbDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRvT2JzZXJ2YWJsZSh2YWx1ZTogYW55KTogT2JzZXJ2YWJsZTxhbnk+IHtcbiAgY29uc3Qgb2JzID0gaXNQcm9taXNlKHZhbHVlKSA/IGZyb20odmFsdWUpIDogdmFsdWU7XG4gIGlmICgodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSAmJiAhaXNTdWJzY3JpYmFibGUob2JzKSkge1xuICAgIGxldCBlcnJvck1lc3NhZ2UgPSBgRXhwZWN0ZWQgYXN5bmMgdmFsaWRhdG9yIHRvIHJldHVybiBQcm9taXNlIG9yIE9ic2VydmFibGUuYDtcbiAgICAvLyBBIHN5bmNocm9ub3VzIHZhbGlkYXRvciB3aWxsIHJldHVybiBvYmplY3Qgb3IgbnVsbC5cbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xuICAgICAgZXJyb3JNZXNzYWdlICs9XG4gICAgICAgICcgQXJlIHlvdSB1c2luZyBhIHN5bmNocm9ub3VzIHZhbGlkYXRvciB3aGVyZSBhbiBhc3luYyB2YWxpZGF0b3IgaXMgZXhwZWN0ZWQ/JztcbiAgICB9XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihSdW50aW1lRXJyb3JDb2RlLldST05HX1ZBTElEQVRPUl9SRVRVUk5fVFlQRSwgZXJyb3JNZXNzYWdlKTtcbiAgfVxuICByZXR1cm4gb2JzO1xufVxuXG5mdW5jdGlvbiBtZXJnZUVycm9ycyhhcnJheU9mRXJyb3JzOiAoVmFsaWRhdGlvbkVycm9ycyB8IG51bGwpW10pOiBWYWxpZGF0aW9uRXJyb3JzIHwgbnVsbCB7XG4gIGxldCByZXM6IHtba2V5OiBzdHJpbmddOiBhbnl9ID0ge307XG4gIGFycmF5T2ZFcnJvcnMuZm9yRWFjaCgoZXJyb3JzOiBWYWxpZGF0aW9uRXJyb3JzIHwgbnVsbCkgPT4ge1xuICAgIHJlcyA9IGVycm9ycyAhPSBudWxsID8gey4uLnJlcyEsIC4uLmVycm9yc30gOiByZXMhO1xuICB9KTtcblxuICByZXR1cm4gT2JqZWN0LmtleXMocmVzKS5sZW5ndGggPT09IDAgPyBudWxsIDogcmVzO1xufVxuXG50eXBlIEdlbmVyaWNWYWxpZGF0b3JGbiA9IChjb250cm9sOiBBYnN0cmFjdENvbnRyb2wpID0+IGFueTtcblxuZnVuY3Rpb24gZXhlY3V0ZVZhbGlkYXRvcnM8ViBleHRlbmRzIEdlbmVyaWNWYWxpZGF0b3JGbj4oXG4gIGNvbnRyb2w6IEFic3RyYWN0Q29udHJvbCxcbiAgdmFsaWRhdG9yczogVltdLFxuKTogUmV0dXJuVHlwZTxWPltdIHtcbiAgcmV0dXJuIHZhbGlkYXRvcnMubWFwKCh2YWxpZGF0b3IpID0+IHZhbGlkYXRvcihjb250cm9sKSk7XG59XG5cbmZ1bmN0aW9uIGlzVmFsaWRhdG9yRm48Vj4odmFsaWRhdG9yOiBWIHwgVmFsaWRhdG9yIHwgQXN5bmNWYWxpZGF0b3IpOiB2YWxpZGF0b3IgaXMgViB7XG4gIHJldHVybiAhKHZhbGlkYXRvciBhcyBWYWxpZGF0b3IpLnZhbGlkYXRlO1xufVxuXG4vKipcbiAqIEdpdmVuIHRoZSBsaXN0IG9mIHZhbGlkYXRvcnMgdGhhdCBtYXkgY29udGFpbiBib3RoIGZ1bmN0aW9ucyBhcyB3ZWxsIGFzIGNsYXNzZXMsIHJldHVybiB0aGUgbGlzdFxuICogb2YgdmFsaWRhdG9yIGZ1bmN0aW9ucyAoY29udmVydCB2YWxpZGF0b3IgY2xhc3NlcyBpbnRvIHZhbGlkYXRvciBmdW5jdGlvbnMpLiBUaGlzIGlzIG5lZWRlZCB0b1xuICogaGF2ZSBjb25zaXN0ZW50IHN0cnVjdHVyZSBpbiB2YWxpZGF0b3JzIGxpc3QgYmVmb3JlIGNvbXBvc2luZyB0aGVtLlxuICpcbiAqIEBwYXJhbSB2YWxpZGF0b3JzIFRoZSBzZXQgb2YgdmFsaWRhdG9ycyB0aGF0IG1heSBjb250YWluIHZhbGlkYXRvcnMgYm90aCBpbiBwbGFpbiBmdW5jdGlvbiBmb3JtXG4gKiAgICAgYXMgd2VsbCBhcyByZXByZXNlbnRlZCBhcyBhIHZhbGlkYXRvciBjbGFzcy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZVZhbGlkYXRvcnM8Vj4odmFsaWRhdG9yczogKFYgfCBWYWxpZGF0b3IgfCBBc3luY1ZhbGlkYXRvcilbXSk6IFZbXSB7XG4gIHJldHVybiB2YWxpZGF0b3JzLm1hcCgodmFsaWRhdG9yKSA9PiB7XG4gICAgcmV0dXJuIGlzVmFsaWRhdG9yRm48Vj4odmFsaWRhdG9yKVxuICAgICAgPyB2YWxpZGF0b3JcbiAgICAgIDogKCgoYzogQWJzdHJhY3RDb250cm9sKSA9PiB2YWxpZGF0b3IudmFsaWRhdGUoYykpIGFzIHVua25vd24gYXMgVik7XG4gIH0pO1xufVxuXG4vKipcbiAqIE1lcmdlcyBzeW5jaHJvbm91cyB2YWxpZGF0b3JzIGludG8gYSBzaW5nbGUgdmFsaWRhdG9yIGZ1bmN0aW9uLlxuICogU2VlIGBWYWxpZGF0b3JzLmNvbXBvc2VgIGZvciBhZGRpdGlvbmFsIGluZm9ybWF0aW9uLlxuICovXG5mdW5jdGlvbiBjb21wb3NlKHZhbGlkYXRvcnM6IChWYWxpZGF0b3JGbiB8IG51bGwgfCB1bmRlZmluZWQpW10gfCBudWxsKTogVmFsaWRhdG9yRm4gfCBudWxsIHtcbiAgaWYgKCF2YWxpZGF0b3JzKSByZXR1cm4gbnVsbDtcbiAgY29uc3QgcHJlc2VudFZhbGlkYXRvcnM6IFZhbGlkYXRvckZuW10gPSB2YWxpZGF0b3JzLmZpbHRlcihpc1ByZXNlbnQpIGFzIGFueTtcbiAgaWYgKHByZXNlbnRWYWxpZGF0b3JzLmxlbmd0aCA9PSAwKSByZXR1cm4gbnVsbDtcblxuICByZXR1cm4gZnVuY3Rpb24gKGNvbnRyb2w6IEFic3RyYWN0Q29udHJvbCkge1xuICAgIHJldHVybiBtZXJnZUVycm9ycyhleGVjdXRlVmFsaWRhdG9yczxWYWxpZGF0b3JGbj4oY29udHJvbCwgcHJlc2VudFZhbGlkYXRvcnMpKTtcbiAgfTtcbn1cblxuLyoqXG4gKiBBY2NlcHRzIGEgbGlzdCBvZiB2YWxpZGF0b3JzIG9mIGRpZmZlcmVudCBwb3NzaWJsZSBzaGFwZXMgKGBWYWxpZGF0b3JgIGFuZCBgVmFsaWRhdG9yRm5gKSxcbiAqIG5vcm1hbGl6ZXMgdGhlIGxpc3QgKGNvbnZlcnRzIGV2ZXJ5dGhpbmcgdG8gYFZhbGlkYXRvckZuYCkgYW5kIG1lcmdlcyB0aGVtIGludG8gYSBzaW5nbGVcbiAqIHZhbGlkYXRvciBmdW5jdGlvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbXBvc2VWYWxpZGF0b3JzKHZhbGlkYXRvcnM6IEFycmF5PFZhbGlkYXRvciB8IFZhbGlkYXRvckZuPik6IFZhbGlkYXRvckZuIHwgbnVsbCB7XG4gIHJldHVybiB2YWxpZGF0b3JzICE9IG51bGwgPyBjb21wb3NlKG5vcm1hbGl6ZVZhbGlkYXRvcnM8VmFsaWRhdG9yRm4+KHZhbGlkYXRvcnMpKSA6IG51bGw7XG59XG5cbi8qKlxuICogTWVyZ2VzIGFzeW5jaHJvbm91cyB2YWxpZGF0b3JzIGludG8gYSBzaW5nbGUgdmFsaWRhdG9yIGZ1bmN0aW9uLlxuICogU2VlIGBWYWxpZGF0b3JzLmNvbXBvc2VBc3luY2AgZm9yIGFkZGl0aW9uYWwgaW5mb3JtYXRpb24uXG4gKi9cbmZ1bmN0aW9uIGNvbXBvc2VBc3luYyh2YWxpZGF0b3JzOiAoQXN5bmNWYWxpZGF0b3JGbiB8IG51bGwpW10pOiBBc3luY1ZhbGlkYXRvckZuIHwgbnVsbCB7XG4gIGlmICghdmFsaWRhdG9ycykgcmV0dXJuIG51bGw7XG4gIGNvbnN0IHByZXNlbnRWYWxpZGF0b3JzOiBBc3luY1ZhbGlkYXRvckZuW10gPSB2YWxpZGF0b3JzLmZpbHRlcihpc1ByZXNlbnQpIGFzIGFueTtcbiAgaWYgKHByZXNlbnRWYWxpZGF0b3JzLmxlbmd0aCA9PSAwKSByZXR1cm4gbnVsbDtcblxuICByZXR1cm4gZnVuY3Rpb24gKGNvbnRyb2w6IEFic3RyYWN0Q29udHJvbCkge1xuICAgIGNvbnN0IG9ic2VydmFibGVzID0gZXhlY3V0ZVZhbGlkYXRvcnM8QXN5bmNWYWxpZGF0b3JGbj4oY29udHJvbCwgcHJlc2VudFZhbGlkYXRvcnMpLm1hcChcbiAgICAgIHRvT2JzZXJ2YWJsZSxcbiAgICApO1xuICAgIHJldHVybiBmb3JrSm9pbihvYnNlcnZhYmxlcykucGlwZShtYXAobWVyZ2VFcnJvcnMpKTtcbiAgfTtcbn1cblxuLyoqXG4gKiBBY2NlcHRzIGEgbGlzdCBvZiBhc3luYyB2YWxpZGF0b3JzIG9mIGRpZmZlcmVudCBwb3NzaWJsZSBzaGFwZXMgKGBBc3luY1ZhbGlkYXRvcmAgYW5kXG4gKiBgQXN5bmNWYWxpZGF0b3JGbmApLCBub3JtYWxpemVzIHRoZSBsaXN0IChjb252ZXJ0cyBldmVyeXRoaW5nIHRvIGBBc3luY1ZhbGlkYXRvckZuYCkgYW5kIG1lcmdlc1xuICogdGhlbSBpbnRvIGEgc2luZ2xlIHZhbGlkYXRvciBmdW5jdGlvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbXBvc2VBc3luY1ZhbGlkYXRvcnMoXG4gIHZhbGlkYXRvcnM6IEFycmF5PEFzeW5jVmFsaWRhdG9yIHwgQXN5bmNWYWxpZGF0b3JGbj4sXG4pOiBBc3luY1ZhbGlkYXRvckZuIHwgbnVsbCB7XG4gIHJldHVybiB2YWxpZGF0b3JzICE9IG51bGxcbiAgICA/IGNvbXBvc2VBc3luYyhub3JtYWxpemVWYWxpZGF0b3JzPEFzeW5jVmFsaWRhdG9yRm4+KHZhbGlkYXRvcnMpKVxuICAgIDogbnVsbDtcbn1cblxuLyoqXG4gKiBNZXJnZXMgcmF3IGNvbnRyb2wgdmFsaWRhdG9ycyB3aXRoIGEgZ2l2ZW4gZGlyZWN0aXZlIHZhbGlkYXRvciBhbmQgcmV0dXJucyB0aGUgY29tYmluZWQgbGlzdCBvZlxuICogdmFsaWRhdG9ycyBhcyBhbiBhcnJheS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1lcmdlVmFsaWRhdG9yczxWPihjb250cm9sVmFsaWRhdG9yczogViB8IFZbXSB8IG51bGwsIGRpclZhbGlkYXRvcjogVik6IFZbXSB7XG4gIGlmIChjb250cm9sVmFsaWRhdG9ycyA9PT0gbnVsbCkgcmV0dXJuIFtkaXJWYWxpZGF0b3JdO1xuICByZXR1cm4gQXJyYXkuaXNBcnJheShjb250cm9sVmFsaWRhdG9ycylcbiAgICA/IFsuLi5jb250cm9sVmFsaWRhdG9ycywgZGlyVmFsaWRhdG9yXVxuICAgIDogW2NvbnRyb2xWYWxpZGF0b3JzLCBkaXJWYWxpZGF0b3JdO1xufVxuXG4vKipcbiAqIFJldHJpZXZlcyB0aGUgbGlzdCBvZiByYXcgc3luY2hyb25vdXMgdmFsaWRhdG9ycyBhdHRhY2hlZCB0byBhIGdpdmVuIGNvbnRyb2wuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRDb250cm9sVmFsaWRhdG9ycyhjb250cm9sOiBBYnN0cmFjdENvbnRyb2wpOiBWYWxpZGF0b3JGbiB8IFZhbGlkYXRvckZuW10gfCBudWxsIHtcbiAgcmV0dXJuIChjb250cm9sIGFzIGFueSkuX3Jhd1ZhbGlkYXRvcnMgYXMgVmFsaWRhdG9yRm4gfCBWYWxpZGF0b3JGbltdIHwgbnVsbDtcbn1cblxuLyoqXG4gKiBSZXRyaWV2ZXMgdGhlIGxpc3Qgb2YgcmF3IGFzeW5jaHJvbm91cyB2YWxpZGF0b3JzIGF0dGFjaGVkIHRvIGEgZ2l2ZW4gY29udHJvbC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldENvbnRyb2xBc3luY1ZhbGlkYXRvcnMoXG4gIGNvbnRyb2w6IEFic3RyYWN0Q29udHJvbCxcbik6IEFzeW5jVmFsaWRhdG9yRm4gfCBBc3luY1ZhbGlkYXRvckZuW10gfCBudWxsIHtcbiAgcmV0dXJuIChjb250cm9sIGFzIGFueSkuX3Jhd0FzeW5jVmFsaWRhdG9ycyBhcyBBc3luY1ZhbGlkYXRvckZuIHwgQXN5bmNWYWxpZGF0b3JGbltdIHwgbnVsbDtcbn1cblxuLyoqXG4gKiBBY2NlcHRzIGEgc2luZ2xldG9uIHZhbGlkYXRvciwgYW4gYXJyYXksIG9yIG51bGwsIGFuZCByZXR1cm5zIGFuIGFycmF5IHR5cGUgd2l0aCB0aGUgcHJvdmlkZWRcbiAqIHZhbGlkYXRvcnMuXG4gKlxuICogQHBhcmFtIHZhbGlkYXRvcnMgQSB2YWxpZGF0b3IsIHZhbGlkYXRvcnMsIG9yIG51bGwuXG4gKiBAcmV0dXJucyBBIHZhbGlkYXRvcnMgYXJyYXkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtYWtlVmFsaWRhdG9yc0FycmF5PFQgZXh0ZW5kcyBWYWxpZGF0b3JGbiB8IEFzeW5jVmFsaWRhdG9yRm4+KFxuICB2YWxpZGF0b3JzOiBUIHwgVFtdIHwgbnVsbCxcbik6IFRbXSB7XG4gIGlmICghdmFsaWRhdG9ycykgcmV0dXJuIFtdO1xuICByZXR1cm4gQXJyYXkuaXNBcnJheSh2YWxpZGF0b3JzKSA/IHZhbGlkYXRvcnMgOiBbdmFsaWRhdG9yc107XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lcyB3aGV0aGVyIGEgdmFsaWRhdG9yIG9yIHZhbGlkYXRvcnMgYXJyYXkgaGFzIGEgZ2l2ZW4gdmFsaWRhdG9yLlxuICpcbiAqIEBwYXJhbSB2YWxpZGF0b3JzIFRoZSB2YWxpZGF0b3Igb3IgdmFsaWRhdG9ycyB0byBjb21wYXJlIGFnYWluc3QuXG4gKiBAcGFyYW0gdmFsaWRhdG9yIFRoZSB2YWxpZGF0b3IgdG8gY2hlY2suXG4gKiBAcmV0dXJucyBXaGV0aGVyIHRoZSB2YWxpZGF0b3IgaXMgcHJlc2VudC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGhhc1ZhbGlkYXRvcjxUIGV4dGVuZHMgVmFsaWRhdG9yRm4gfCBBc3luY1ZhbGlkYXRvckZuPihcbiAgdmFsaWRhdG9yczogVCB8IFRbXSB8IG51bGwsXG4gIHZhbGlkYXRvcjogVCxcbik6IGJvb2xlYW4ge1xuICByZXR1cm4gQXJyYXkuaXNBcnJheSh2YWxpZGF0b3JzKSA/IHZhbGlkYXRvcnMuaW5jbHVkZXModmFsaWRhdG9yKSA6IHZhbGlkYXRvcnMgPT09IHZhbGlkYXRvcjtcbn1cblxuLyoqXG4gKiBDb21iaW5lcyB0d28gYXJyYXlzIG9mIHZhbGlkYXRvcnMgaW50byBvbmUuIElmIGR1cGxpY2F0ZXMgYXJlIHByb3ZpZGVkLCBvbmx5IG9uZSB3aWxsIGJlIGFkZGVkLlxuICpcbiAqIEBwYXJhbSB2YWxpZGF0b3JzIFRoZSBuZXcgdmFsaWRhdG9ycy5cbiAqIEBwYXJhbSBjdXJyZW50VmFsaWRhdG9ycyBUaGUgYmFzZSBhcnJheSBvZiBjdXJyZW50IHZhbGlkYXRvcnMuXG4gKiBAcmV0dXJucyBBbiBhcnJheSBvZiB2YWxpZGF0b3JzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYWRkVmFsaWRhdG9yczxUIGV4dGVuZHMgVmFsaWRhdG9yRm4gfCBBc3luY1ZhbGlkYXRvckZuPihcbiAgdmFsaWRhdG9yczogVCB8IFRbXSxcbiAgY3VycmVudFZhbGlkYXRvcnM6IFQgfCBUW10gfCBudWxsLFxuKTogVFtdIHtcbiAgY29uc3QgY3VycmVudCA9IG1ha2VWYWxpZGF0b3JzQXJyYXkoY3VycmVudFZhbGlkYXRvcnMpO1xuICBjb25zdCB2YWxpZGF0b3JzVG9BZGQgPSBtYWtlVmFsaWRhdG9yc0FycmF5KHZhbGlkYXRvcnMpO1xuICB2YWxpZGF0b3JzVG9BZGQuZm9yRWFjaCgodjogVCkgPT4ge1xuICAgIC8vIE5vdGU6IGlmIHRoZXJlIGFyZSBkdXBsaWNhdGUgZW50cmllcyBpbiB0aGUgbmV3IHZhbGlkYXRvcnMgYXJyYXksXG4gICAgLy8gb25seSB0aGUgZmlyc3Qgb25lIHdvdWxkIGJlIGFkZGVkIHRvIHRoZSBjdXJyZW50IGxpc3Qgb2YgdmFsaWRhdG9ycy5cbiAgICAvLyBEdXBsaWNhdGUgb25lcyB3b3VsZCBiZSBpZ25vcmVkIHNpbmNlIGBoYXNWYWxpZGF0b3JgIHdvdWxkIGRldGVjdFxuICAgIC8vIHRoZSBwcmVzZW5jZSBvZiBhIHZhbGlkYXRvciBmdW5jdGlvbiBhbmQgd2UgdXBkYXRlIHRoZSBjdXJyZW50IGxpc3QgaW4gcGxhY2UuXG4gICAgaWYgKCFoYXNWYWxpZGF0b3IoY3VycmVudCwgdikpIHtcbiAgICAgIGN1cnJlbnQucHVzaCh2KTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gY3VycmVudDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZVZhbGlkYXRvcnM8VCBleHRlbmRzIFZhbGlkYXRvckZuIHwgQXN5bmNWYWxpZGF0b3JGbj4oXG4gIHZhbGlkYXRvcnM6IFQgfCBUW10sXG4gIGN1cnJlbnRWYWxpZGF0b3JzOiBUIHwgVFtdIHwgbnVsbCxcbik6IFRbXSB7XG4gIHJldHVybiBtYWtlVmFsaWRhdG9yc0FycmF5KGN1cnJlbnRWYWxpZGF0b3JzKS5maWx0ZXIoKHYpID0+ICFoYXNWYWxpZGF0b3IodmFsaWRhdG9ycywgdikpO1xufVxuIl19