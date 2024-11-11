/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdG9ycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2Zvcm1zL3NyYy92YWxpZGF0b3JzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFDTCxjQUFjLEVBQ2QsVUFBVSxJQUFJLFNBQVMsRUFDdkIsZUFBZSxJQUFJLGNBQWMsRUFDakMsYUFBYSxJQUFJLFlBQVksR0FDOUIsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFDLFFBQVEsRUFBRSxJQUFJLEVBQWEsTUFBTSxNQUFNLENBQUM7QUFDaEQsT0FBTyxFQUFDLEdBQUcsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBWW5DLFNBQVMsaUJBQWlCLENBQUMsS0FBVTtJQUNuQzs7OztPQUlHO0lBQ0gsT0FBTyxDQUNMLEtBQUssSUFBSSxJQUFJLElBQUksQ0FBQyxDQUFDLE9BQU8sS0FBSyxLQUFLLFFBQVEsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FDN0YsQ0FBQztBQUNKLENBQUM7QUFFRCxTQUFTLGNBQWMsQ0FBQyxLQUFVO0lBQ2hDLHdGQUF3RjtJQUN4RixPQUFPLEtBQUssSUFBSSxJQUFJLElBQUksT0FBTyxLQUFLLENBQUMsTUFBTSxLQUFLLFFBQVEsQ0FBQztBQUMzRCxDQUFDO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQTJCRztBQUNILE1BQU0sQ0FBQyxNQUFNLGFBQWEsR0FBRyxJQUFJLGNBQWMsQ0FDN0MsU0FBUyxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FDaEMsQ0FBQztBQUVGOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBNEJHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxjQUFjLENBQ25ELFNBQVMs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QUM7WUFDOUIsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNsQixDQUFDO0lBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDSCxPQUFPLE9BQU8sQ0FBQztBQUNqQixDQUFDO0FBRUQsTUFBTSxVQUFVLGdCQUFnQixDQUM5QixVQUFtQixFQUNuQixpQkFBaUM7SUFFakMsT0FBTyxtQkFBbUIsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDNUYsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtcbiAgSW5qZWN0aW9uVG9rZW4sXG4gIMm1aXNQcm9taXNlIGFzIGlzUHJvbWlzZSxcbiAgybVpc1N1YnNjcmliYWJsZSBhcyBpc1N1YnNjcmliYWJsZSxcbiAgybVSdW50aW1lRXJyb3IgYXMgUnVudGltZUVycm9yLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7Zm9ya0pvaW4sIGZyb20sIE9ic2VydmFibGV9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHttYXB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuaW1wb3J0IHtcbiAgQXN5bmNWYWxpZGF0b3IsXG4gIEFzeW5jVmFsaWRhdG9yRm4sXG4gIFZhbGlkYXRpb25FcnJvcnMsXG4gIFZhbGlkYXRvcixcbiAgVmFsaWRhdG9yRm4sXG59IGZyb20gJy4vZGlyZWN0aXZlcy92YWxpZGF0b3JzJztcbmltcG9ydCB7UnVudGltZUVycm9yQ29kZX0gZnJvbSAnLi9lcnJvcnMnO1xuaW1wb3J0IHtBYnN0cmFjdENvbnRyb2x9IGZyb20gJy4vbW9kZWwvYWJzdHJhY3RfbW9kZWwnO1xuXG5mdW5jdGlvbiBpc0VtcHR5SW5wdXRWYWx1ZSh2YWx1ZTogYW55KTogYm9vbGVhbiB7XG4gIC8qKlxuICAgKiBDaGVjayBpZiB0aGUgb2JqZWN0IGlzIGEgc3RyaW5nIG9yIGFycmF5IGJlZm9yZSBldmFsdWF0aW5nIHRoZSBsZW5ndGggYXR0cmlidXRlLlxuICAgKiBUaGlzIGF2b2lkcyBmYWxzZWx5IHJlamVjdGluZyBvYmplY3RzIHRoYXQgY29udGFpbiBhIGN1c3RvbSBsZW5ndGggYXR0cmlidXRlLlxuICAgKiBGb3IgZXhhbXBsZSwgdGhlIG9iamVjdCB7aWQ6IDEsIGxlbmd0aDogMCwgd2lkdGg6IDB9IHNob3VsZCBub3QgYmUgcmV0dXJuZWQgYXMgZW1wdHkuXG4gICAqL1xuICByZXR1cm4gKFxuICAgIHZhbHVlID09IG51bGwgfHwgKCh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnIHx8IEFycmF5LmlzQXJyYXkodmFsdWUpKSAmJiB2YWx1ZS5sZW5ndGggPT09IDApXG4gICk7XG59XG5cbmZ1bmN0aW9uIGhhc1ZhbGlkTGVuZ3RoKHZhbHVlOiBhbnkpOiBib29sZWFuIHtcbiAgLy8gbm9uLXN0cmljdCBjb21wYXJpc29uIGlzIGludGVudGlvbmFsLCB0byBjaGVjayBmb3IgYm90aCBgbnVsbGAgYW5kIGB1bmRlZmluZWRgIHZhbHVlc1xuICByZXR1cm4gdmFsdWUgIT0gbnVsbCAmJiB0eXBlb2YgdmFsdWUubGVuZ3RoID09PSAnbnVtYmVyJztcbn1cblxuLyoqXG4gKiBAZGVzY3JpcHRpb25cbiAqIEFuIGBJbmplY3Rpb25Ub2tlbmAgZm9yIHJlZ2lzdGVyaW5nIGFkZGl0aW9uYWwgc3luY2hyb25vdXMgdmFsaWRhdG9ycyB1c2VkIHdpdGhcbiAqIGBBYnN0cmFjdENvbnRyb2xgcy5cbiAqXG4gKiBAc2VlIHtAbGluayBOR19BU1lOQ19WQUxJREFUT1JTfVxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKlxuICogIyMjIFByb3ZpZGluZyBhIGN1c3RvbSB2YWxpZGF0b3JcbiAqXG4gKiBUaGUgZm9sbG93aW5nIGV4YW1wbGUgcmVnaXN0ZXJzIGEgY3VzdG9tIHZhbGlkYXRvciBkaXJlY3RpdmUuIEFkZGluZyB0aGUgdmFsaWRhdG9yIHRvIHRoZVxuICogZXhpc3RpbmcgY29sbGVjdGlvbiBvZiB2YWxpZGF0b3JzIHJlcXVpcmVzIHRoZSBgbXVsdGk6IHRydWVgIG9wdGlvbi5cbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBARGlyZWN0aXZlKHtcbiAqICAgc2VsZWN0b3I6ICdbY3VzdG9tVmFsaWRhdG9yXScsXG4gKiAgIHByb3ZpZGVyczogW3twcm92aWRlOiBOR19WQUxJREFUT1JTLCB1c2VFeGlzdGluZzogQ3VzdG9tVmFsaWRhdG9yRGlyZWN0aXZlLCBtdWx0aTogdHJ1ZX1dXG4gKiB9KVxuICogY2xhc3MgQ3VzdG9tVmFsaWRhdG9yRGlyZWN0aXZlIGltcGxlbWVudHMgVmFsaWRhdG9yIHtcbiAqICAgdmFsaWRhdGUoY29udHJvbDogQWJzdHJhY3RDb250cm9sKTogVmFsaWRhdGlvbkVycm9ycyB8IG51bGwge1xuICogICAgIHJldHVybiB7ICdjdXN0b20nOiB0cnVlIH07XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNvbnN0IE5HX1ZBTElEQVRPUlMgPSBuZXcgSW5qZWN0aW9uVG9rZW48UmVhZG9ubHlBcnJheTxWYWxpZGF0b3IgfCBGdW5jdGlvbj4+KFxuICBuZ0Rldk1vZGUgPyAnTmdWYWxpZGF0b3JzJyA6ICcnLFxuKTtcblxuLyoqXG4gKiBAZGVzY3JpcHRpb25cbiAqIEFuIGBJbmplY3Rpb25Ub2tlbmAgZm9yIHJlZ2lzdGVyaW5nIGFkZGl0aW9uYWwgYXN5bmNocm9ub3VzIHZhbGlkYXRvcnMgdXNlZCB3aXRoXG4gKiBgQWJzdHJhY3RDb250cm9sYHMuXG4gKlxuICogQHNlZSB7QGxpbmsgTkdfVkFMSURBVE9SU31cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICpcbiAqICMjIyBQcm92aWRlIGEgY3VzdG9tIGFzeW5jIHZhbGlkYXRvciBkaXJlY3RpdmVcbiAqXG4gKiBUaGUgZm9sbG93aW5nIGV4YW1wbGUgaW1wbGVtZW50cyB0aGUgYEFzeW5jVmFsaWRhdG9yYCBpbnRlcmZhY2UgdG8gY3JlYXRlIGFuXG4gKiBhc3luYyB2YWxpZGF0b3IgZGlyZWN0aXZlIHdpdGggYSBjdXN0b20gZXJyb3Iga2V5LlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIEBEaXJlY3RpdmUoe1xuICogICBzZWxlY3RvcjogJ1tjdXN0b21Bc3luY1ZhbGlkYXRvcl0nLFxuICogICBwcm92aWRlcnM6IFt7cHJvdmlkZTogTkdfQVNZTkNfVkFMSURBVE9SUywgdXNlRXhpc3Rpbmc6IEN1c3RvbUFzeW5jVmFsaWRhdG9yRGlyZWN0aXZlLCBtdWx0aTpcbiAqIHRydWV9XVxuICogfSlcbiAqIGNsYXNzIEN1c3RvbUFzeW5jVmFsaWRhdG9yRGlyZWN0aXZlIGltcGxlbWVudHMgQXN5bmNWYWxpZGF0b3Ige1xuICogICB2YWxpZGF0ZShjb250cm9sOiBBYnN0cmFjdENvbnRyb2wpOiBQcm9taXNlPFZhbGlkYXRpb25FcnJvcnN8bnVsbD4ge1xuICogICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoeydjdXN0b20nOiB0cnVlfSk7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNvbnN0IE5HX0FTWU5DX1ZBTElEQVRPUlMgPSBuZXcgSW5qZWN0aW9uVG9rZW48UmVhZG9ubHlBcnJheTxWYWxpZGF0b3IgfCBGdW5jdGlvbj4+KFxuICBuZ0Rldk1vZGUgPyAnTmdBc3luY1ZhbGlkYXRvcnMnIDogJycsXG4pO1xuXG4vKipcbiAqIEEgcmVndWxhciBleHByZXNzaW9uIHRoYXQgbWF0Y2hlcyB2YWxpZCBlLW1haWwgYWRkcmVzc2VzLlxuICpcbiAqIEF0IGEgaGlnaCBsZXZlbCwgdGhpcyByZWdleHAgbWF0Y2hlcyBlLW1haWwgYWRkcmVzc2VzIG9mIHRoZSBmb3JtYXQgYGxvY2FsLXBhcnRAdGxkYCwgd2hlcmU6XG4gKiAtIGBsb2NhbC1wYXJ0YCBjb25zaXN0cyBvZiBvbmUgb3IgbW9yZSBvZiB0aGUgYWxsb3dlZCBjaGFyYWN0ZXJzIChhbHBoYW51bWVyaWMgYW5kIHNvbWVcbiAqICAgcHVuY3R1YXRpb24gc3ltYm9scykuXG4gKiAtIGBsb2NhbC1wYXJ0YCBjYW5ub3QgYmVnaW4gb3IgZW5kIHdpdGggYSBwZXJpb2QgKGAuYCkuXG4gKiAtIGBsb2NhbC1wYXJ0YCBjYW5ub3QgYmUgbG9uZ2VyIHRoYW4gNjQgY2hhcmFjdGVycy5cbiAqIC0gYHRsZGAgY29uc2lzdHMgb2Ygb25lIG9yIG1vcmUgYGxhYmVsc2Agc2VwYXJhdGVkIGJ5IHBlcmlvZHMgKGAuYCkuIEZvciBleGFtcGxlIGBsb2NhbGhvc3RgIG9yXG4gKiAgIGBmb28uY29tYC5cbiAqIC0gQSBgbGFiZWxgIGNvbnNpc3RzIG9mIG9uZSBvciBtb3JlIG9mIHRoZSBhbGxvd2VkIGNoYXJhY3RlcnMgKGFscGhhbnVtZXJpYywgZGFzaGVzIChgLWApIGFuZFxuICogICBwZXJpb2RzIChgLmApKS5cbiAqIC0gQSBgbGFiZWxgIGNhbm5vdCBiZWdpbiBvciBlbmQgd2l0aCBhIGRhc2ggKGAtYCkgb3IgYSBwZXJpb2QgKGAuYCkuXG4gKiAtIEEgYGxhYmVsYCBjYW5ub3QgYmUgbG9uZ2VyIHRoYW4gNjMgY2hhcmFjdGVycy5cbiAqIC0gVGhlIHdob2xlIGFkZHJlc3MgY2Fubm90IGJlIGxvbmdlciB0aGFuIDI1NCBjaGFyYWN0ZXJzLlxuICpcbiAqICMjIEltcGxlbWVudGF0aW9uIGJhY2tncm91bmRcbiAqXG4gKiBUaGlzIHJlZ2V4cCB3YXMgcG9ydGVkIG92ZXIgZnJvbSBBbmd1bGFySlMgKHNlZSB0aGVyZSBmb3IgZ2l0IGhpc3RvcnkpOlxuICogaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci5qcy9ibG9iL2MxMzNlZjgzNi9zcmMvbmcvZGlyZWN0aXZlL2lucHV0LmpzI0wyN1xuICogSXQgaXMgYmFzZWQgb24gdGhlXG4gKiBbV0hBVFdHIHZlcnNpb25dKGh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL2lucHV0Lmh0bWwjdmFsaWQtZS1tYWlsLWFkZHJlc3MpIHdpdGhcbiAqIHNvbWUgZW5oYW5jZW1lbnRzIHRvIGluY29ycG9yYXRlIG1vcmUgUkZDIHJ1bGVzIChzdWNoIGFzIHJ1bGVzIHJlbGF0ZWQgdG8gZG9tYWluIG5hbWVzIGFuZCB0aGVcbiAqIGxlbmd0aHMgb2YgZGlmZmVyZW50IHBhcnRzIG9mIHRoZSBhZGRyZXNzKS4gVGhlIG1haW4gZGlmZmVyZW5jZXMgZnJvbSB0aGUgV0hBVFdHIHZlcnNpb24gYXJlOlxuICogICAtIERpc2FsbG93IGBsb2NhbC1wYXJ0YCB0byBiZWdpbiBvciBlbmQgd2l0aCBhIHBlcmlvZCAoYC5gKS5cbiAqICAgLSBEaXNhbGxvdyBgbG9jYWwtcGFydGAgbGVuZ3RoIHRvIGV4Y2VlZCA2NCBjaGFyYWN0ZXJzLlxuICogICAtIERpc2FsbG93IHRvdGFsIGFkZHJlc3MgbGVuZ3RoIHRvIGV4Y2VlZCAyNTQgY2hhcmFjdGVycy5cbiAqXG4gKiBTZWUgW3RoaXMgY29tbWl0XShodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyLmpzL2NvbW1pdC9mM2Y1Y2Y3MmUpIGZvciBtb3JlIGRldGFpbHMuXG4gKi9cbmNvbnN0IEVNQUlMX1JFR0VYUCA9XG4gIC9eKD89LnsxLDI1NH0kKSg/PS57MSw2NH1AKVthLXpBLVowLTkhIyQlJicqKy89P15fYHt8fX4tXSsoPzpcXC5bYS16QS1aMC05ISMkJSYnKisvPT9eX2B7fH1+LV0rKSpAW2EtekEtWjAtOV0oPzpbYS16QS1aMC05LV17MCw2MX1bYS16QS1aMC05XSk/KD86XFwuW2EtekEtWjAtOV0oPzpbYS16QS1aMC05LV17MCw2MX1bYS16QS1aMC05XSk/KSokLztcblxuLyoqXG4gKiBAZGVzY3JpcHRpb25cbiAqIFByb3ZpZGVzIGEgc2V0IG9mIGJ1aWx0LWluIHZhbGlkYXRvcnMgdGhhdCBjYW4gYmUgdXNlZCBieSBmb3JtIGNvbnRyb2xzLlxuICpcbiAqIEEgdmFsaWRhdG9yIGlzIGEgZnVuY3Rpb24gdGhhdCBwcm9jZXNzZXMgYSBgRm9ybUNvbnRyb2xgIG9yIGNvbGxlY3Rpb24gb2ZcbiAqIGNvbnRyb2xzIGFuZCByZXR1cm5zIGFuIGVycm9yIG1hcCBvciBudWxsLiBBIG51bGwgbWFwIG1lYW5zIHRoYXQgdmFsaWRhdGlvbiBoYXMgcGFzc2VkLlxuICpcbiAqIEBzZWUgW0Zvcm0gVmFsaWRhdGlvbl0oZ3VpZGUvZm9ybXMvZm9ybS12YWxpZGF0aW9uKVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNsYXNzIFZhbGlkYXRvcnMge1xuICAvKipcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIFZhbGlkYXRvciB0aGF0IHJlcXVpcmVzIHRoZSBjb250cm9sJ3MgdmFsdWUgdG8gYmUgZ3JlYXRlciB0aGFuIG9yIGVxdWFsIHRvIHRoZSBwcm92aWRlZCBudW1iZXIuXG4gICAqXG4gICAqIEB1c2FnZU5vdGVzXG4gICAqXG4gICAqICMjIyBWYWxpZGF0ZSBhZ2FpbnN0IGEgbWluaW11bSBvZiAzXG4gICAqXG4gICAqIGBgYHR5cGVzY3JpcHRcbiAgICogY29uc3QgY29udHJvbCA9IG5ldyBGb3JtQ29udHJvbCgyLCBWYWxpZGF0b3JzLm1pbigzKSk7XG4gICAqXG4gICAqIGNvbnNvbGUubG9nKGNvbnRyb2wuZXJyb3JzKTsgLy8ge21pbjoge21pbjogMywgYWN0dWFsOiAyfX1cbiAgICogYGBgXG4gICAqXG4gICAqIEByZXR1cm5zIEEgdmFsaWRhdG9yIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhbiBlcnJvciBtYXAgd2l0aCB0aGVcbiAgICogYG1pbmAgcHJvcGVydHkgaWYgdGhlIHZhbGlkYXRpb24gY2hlY2sgZmFpbHMsIG90aGVyd2lzZSBgbnVsbGAuXG4gICAqXG4gICAqIEBzZWUge0BsaW5rIHVwZGF0ZVZhbHVlQW5kVmFsaWRpdHkoKX1cbiAgICpcbiAgICovXG4gIHN0YXRpYyBtaW4obWluOiBudW1iZXIpOiBWYWxpZGF0b3JGbiB7XG4gICAgcmV0dXJuIG1pblZhbGlkYXRvcihtaW4pO1xuICB9XG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBWYWxpZGF0b3IgdGhhdCByZXF1aXJlcyB0aGUgY29udHJvbCdzIHZhbHVlIHRvIGJlIGxlc3MgdGhhbiBvciBlcXVhbCB0byB0aGUgcHJvdmlkZWQgbnVtYmVyLlxuICAgKlxuICAgKiBAdXNhZ2VOb3Rlc1xuICAgKlxuICAgKiAjIyMgVmFsaWRhdGUgYWdhaW5zdCBhIG1heGltdW0gb2YgMTVcbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiBjb25zdCBjb250cm9sID0gbmV3IEZvcm1Db250cm9sKDE2LCBWYWxpZGF0b3JzLm1heCgxNSkpO1xuICAgKlxuICAgKiBjb25zb2xlLmxvZyhjb250cm9sLmVycm9ycyk7IC8vIHttYXg6IHttYXg6IDE1LCBhY3R1YWw6IDE2fX1cbiAgICogYGBgXG4gICAqXG4gICAqIEByZXR1cm5zIEEgdmFsaWRhdG9yIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhbiBlcnJvciBtYXAgd2l0aCB0aGVcbiAgICogYG1heGAgcHJvcGVydHkgaWYgdGhlIHZhbGlkYXRpb24gY2hlY2sgZmFpbHMsIG90aGVyd2lzZSBgbnVsbGAuXG4gICAqXG4gICAqIEBzZWUge0BsaW5rIHVwZGF0ZVZhbHVlQW5kVmFsaWRpdHkoKX1cbiAgICpcbiAgICovXG4gIHN0YXRpYyBtYXgobWF4OiBudW1iZXIpOiBWYWxpZGF0b3JGbiB7XG4gICAgcmV0dXJuIG1heFZhbGlkYXRvcihtYXgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBWYWxpZGF0b3IgdGhhdCByZXF1aXJlcyB0aGUgY29udHJvbCBoYXZlIGEgbm9uLWVtcHR5IHZhbHVlLlxuICAgKlxuICAgKiBAdXNhZ2VOb3Rlc1xuICAgKlxuICAgKiAjIyMgVmFsaWRhdGUgdGhhdCB0aGUgZmllbGQgaXMgbm9uLWVtcHR5XG4gICAqXG4gICAqIGBgYHR5cGVzY3JpcHRcbiAgICogY29uc3QgY29udHJvbCA9IG5ldyBGb3JtQ29udHJvbCgnJywgVmFsaWRhdG9ycy5yZXF1aXJlZCk7XG4gICAqXG4gICAqIGNvbnNvbGUubG9nKGNvbnRyb2wuZXJyb3JzKTsgLy8ge3JlcXVpcmVkOiB0cnVlfVxuICAgKiBgYGBcbiAgICpcbiAgICogQHJldHVybnMgQW4gZXJyb3IgbWFwIHdpdGggdGhlIGByZXF1aXJlZGAgcHJvcGVydHlcbiAgICogaWYgdGhlIHZhbGlkYXRpb24gY2hlY2sgZmFpbHMsIG90aGVyd2lzZSBgbnVsbGAuXG4gICAqXG4gICAqIEBzZWUge0BsaW5rIHVwZGF0ZVZhbHVlQW5kVmFsaWRpdHkoKX1cbiAgICpcbiAgICovXG4gIHN0YXRpYyByZXF1aXJlZChjb250cm9sOiBBYnN0cmFjdENvbnRyb2wpOiBWYWxpZGF0aW9uRXJyb3JzIHwgbnVsbCB7XG4gICAgcmV0dXJuIHJlcXVpcmVkVmFsaWRhdG9yKGNvbnRyb2wpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBWYWxpZGF0b3IgdGhhdCByZXF1aXJlcyB0aGUgY29udHJvbCdzIHZhbHVlIGJlIHRydWUuIFRoaXMgdmFsaWRhdG9yIGlzIGNvbW1vbmx5XG4gICAqIHVzZWQgZm9yIHJlcXVpcmVkIGNoZWNrYm94ZXMuXG4gICAqXG4gICAqIEB1c2FnZU5vdGVzXG4gICAqXG4gICAqICMjIyBWYWxpZGF0ZSB0aGF0IHRoZSBmaWVsZCB2YWx1ZSBpcyB0cnVlXG4gICAqXG4gICAqIGBgYHR5cGVzY3JpcHRcbiAgICogY29uc3QgY29udHJvbCA9IG5ldyBGb3JtQ29udHJvbCgnc29tZSB2YWx1ZScsIFZhbGlkYXRvcnMucmVxdWlyZWRUcnVlKTtcbiAgICpcbiAgICogY29uc29sZS5sb2coY29udHJvbC5lcnJvcnMpOyAvLyB7cmVxdWlyZWQ6IHRydWV9XG4gICAqIGBgYFxuICAgKlxuICAgKiBAcmV0dXJucyBBbiBlcnJvciBtYXAgdGhhdCBjb250YWlucyB0aGUgYHJlcXVpcmVkYCBwcm9wZXJ0eVxuICAgKiBzZXQgdG8gYHRydWVgIGlmIHRoZSB2YWxpZGF0aW9uIGNoZWNrIGZhaWxzLCBvdGhlcndpc2UgYG51bGxgLlxuICAgKlxuICAgKiBAc2VlIHtAbGluayB1cGRhdGVWYWx1ZUFuZFZhbGlkaXR5KCl9XG4gICAqXG4gICAqL1xuICBzdGF0aWMgcmVxdWlyZWRUcnVlKGNvbnRyb2w6IEFic3RyYWN0Q29udHJvbCk6IFZhbGlkYXRpb25FcnJvcnMgfCBudWxsIHtcbiAgICByZXR1cm4gcmVxdWlyZWRUcnVlVmFsaWRhdG9yKGNvbnRyb2wpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBWYWxpZGF0b3IgdGhhdCByZXF1aXJlcyB0aGUgY29udHJvbCdzIHZhbHVlIHBhc3MgYW4gZW1haWwgdmFsaWRhdGlvbiB0ZXN0LlxuICAgKlxuICAgKiBUZXN0cyB0aGUgdmFsdWUgdXNpbmcgYSBbcmVndWxhclxuICAgKiBleHByZXNzaW9uXShodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L0d1aWRlL1JlZ3VsYXJfRXhwcmVzc2lvbnMpXG4gICAqIHBhdHRlcm4gc3VpdGFibGUgZm9yIGNvbW1vbiB1c2UgY2FzZXMuIFRoZSBwYXR0ZXJuIGlzIGJhc2VkIG9uIHRoZSBkZWZpbml0aW9uIG9mIGEgdmFsaWQgZW1haWxcbiAgICogYWRkcmVzcyBpbiB0aGUgW1dIQVRXRyBIVE1MXG4gICAqIHNwZWNpZmljYXRpb25dKGh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL2lucHV0Lmh0bWwjdmFsaWQtZS1tYWlsLWFkZHJlc3MpIHdpdGhcbiAgICogc29tZSBlbmhhbmNlbWVudHMgdG8gaW5jb3Jwb3JhdGUgbW9yZSBSRkMgcnVsZXMgKHN1Y2ggYXMgcnVsZXMgcmVsYXRlZCB0byBkb21haW4gbmFtZXMgYW5kIHRoZVxuICAgKiBsZW5ndGhzIG9mIGRpZmZlcmVudCBwYXJ0cyBvZiB0aGUgYWRkcmVzcykuXG4gICAqXG4gICAqIFRoZSBkaWZmZXJlbmNlcyBmcm9tIHRoZSBXSEFUV0cgdmVyc2lvbiBpbmNsdWRlOlxuICAgKiAtIERpc2FsbG93IGBsb2NhbC1wYXJ0YCAodGhlIHBhcnQgYmVmb3JlIHRoZSBgQGAgc3ltYm9sKSB0byBiZWdpbiBvciBlbmQgd2l0aCBhIHBlcmlvZCAoYC5gKS5cbiAgICogLSBEaXNhbGxvdyBgbG9jYWwtcGFydGAgdG8gYmUgbG9uZ2VyIHRoYW4gNjQgY2hhcmFjdGVycy5cbiAgICogLSBEaXNhbGxvdyB0aGUgd2hvbGUgYWRkcmVzcyB0byBiZSBsb25nZXIgdGhhbiAyNTQgY2hhcmFjdGVycy5cbiAgICpcbiAgICogSWYgdGhpcyBwYXR0ZXJuIGRvZXMgbm90IHNhdGlzZnkgeW91ciBidXNpbmVzcyBuZWVkcywgeW91IGNhbiB1c2UgYFZhbGlkYXRvcnMucGF0dGVybigpYCB0b1xuICAgKiB2YWxpZGF0ZSB0aGUgdmFsdWUgYWdhaW5zdCBhIGRpZmZlcmVudCBwYXR0ZXJuLlxuICAgKlxuICAgKiBAdXNhZ2VOb3Rlc1xuICAgKlxuICAgKiAjIyMgVmFsaWRhdGUgdGhhdCB0aGUgZmllbGQgbWF0Y2hlcyBhIHZhbGlkIGVtYWlsIHBhdHRlcm5cbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiBjb25zdCBjb250cm9sID0gbmV3IEZvcm1Db250cm9sKCdiYWRAJywgVmFsaWRhdG9ycy5lbWFpbCk7XG4gICAqXG4gICAqIGNvbnNvbGUubG9nKGNvbnRyb2wuZXJyb3JzKTsgLy8ge2VtYWlsOiB0cnVlfVxuICAgKiBgYGBcbiAgICpcbiAgICogQHJldHVybnMgQW4gZXJyb3IgbWFwIHdpdGggdGhlIGBlbWFpbGAgcHJvcGVydHlcbiAgICogaWYgdGhlIHZhbGlkYXRpb24gY2hlY2sgZmFpbHMsIG90aGVyd2lzZSBgbnVsbGAuXG4gICAqXG4gICAqIEBzZWUge0BsaW5rIHVwZGF0ZVZhbHVlQW5kVmFsaWRpdHkoKX1cbiAgICpcbiAgICovXG4gIHN0YXRpYyBlbWFpbChjb250cm9sOiBBYnN0cmFjdENvbnRyb2wpOiBWYWxpZGF0aW9uRXJyb3JzIHwgbnVsbCB7XG4gICAgcmV0dXJuIGVtYWlsVmFsaWRhdG9yKGNvbnRyb2wpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBWYWxpZGF0b3IgdGhhdCByZXF1aXJlcyB0aGUgbGVuZ3RoIG9mIHRoZSBjb250cm9sJ3MgdmFsdWUgdG8gYmUgZ3JlYXRlciB0aGFuIG9yIGVxdWFsXG4gICAqIHRvIHRoZSBwcm92aWRlZCBtaW5pbXVtIGxlbmd0aC4gVGhpcyB2YWxpZGF0b3IgaXMgYWxzbyBwcm92aWRlZCBieSBkZWZhdWx0IGlmIHlvdSB1c2UgdGhlXG4gICAqIHRoZSBIVE1MNSBgbWlubGVuZ3RoYCBhdHRyaWJ1dGUuIE5vdGUgdGhhdCB0aGUgYG1pbkxlbmd0aGAgdmFsaWRhdG9yIGlzIGludGVuZGVkIHRvIGJlIHVzZWRcbiAgICogb25seSBmb3IgdHlwZXMgdGhhdCBoYXZlIGEgbnVtZXJpYyBgbGVuZ3RoYCBwcm9wZXJ0eSwgc3VjaCBhcyBzdHJpbmdzIG9yIGFycmF5cy4gVGhlXG4gICAqIGBtaW5MZW5ndGhgIHZhbGlkYXRvciBsb2dpYyBpcyBhbHNvIG5vdCBpbnZva2VkIGZvciB2YWx1ZXMgd2hlbiB0aGVpciBgbGVuZ3RoYCBwcm9wZXJ0eSBpcyAwXG4gICAqIChmb3IgZXhhbXBsZSBpbiBjYXNlIG9mIGFuIGVtcHR5IHN0cmluZyBvciBhbiBlbXB0eSBhcnJheSksIHRvIHN1cHBvcnQgb3B0aW9uYWwgY29udHJvbHMuIFlvdVxuICAgKiBjYW4gdXNlIHRoZSBzdGFuZGFyZCBgcmVxdWlyZWRgIHZhbGlkYXRvciBpZiBlbXB0eSB2YWx1ZXMgc2hvdWxkIG5vdCBiZSBjb25zaWRlcmVkIHZhbGlkLlxuICAgKlxuICAgKiBAdXNhZ2VOb3Rlc1xuICAgKlxuICAgKiAjIyMgVmFsaWRhdGUgdGhhdCB0aGUgZmllbGQgaGFzIGEgbWluaW11bSBvZiAzIGNoYXJhY3RlcnNcbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiBjb25zdCBjb250cm9sID0gbmV3IEZvcm1Db250cm9sKCduZycsIFZhbGlkYXRvcnMubWluTGVuZ3RoKDMpKTtcbiAgICpcbiAgICogY29uc29sZS5sb2coY29udHJvbC5lcnJvcnMpOyAvLyB7bWlubGVuZ3RoOiB7cmVxdWlyZWRMZW5ndGg6IDMsIGFjdHVhbExlbmd0aDogMn19XG4gICAqIGBgYFxuICAgKlxuICAgKiBgYGBodG1sXG4gICAqIDxpbnB1dCBtaW5sZW5ndGg9XCI1XCI+XG4gICAqIGBgYFxuICAgKlxuICAgKiBAcmV0dXJucyBBIHZhbGlkYXRvciBmdW5jdGlvbiB0aGF0IHJldHVybnMgYW4gZXJyb3IgbWFwIHdpdGggdGhlXG4gICAqIGBtaW5sZW5ndGhgIHByb3BlcnR5IGlmIHRoZSB2YWxpZGF0aW9uIGNoZWNrIGZhaWxzLCBvdGhlcndpc2UgYG51bGxgLlxuICAgKlxuICAgKiBAc2VlIHtAbGluayB1cGRhdGVWYWx1ZUFuZFZhbGlkaXR5KCl9XG4gICAqXG4gICAqL1xuICBzdGF0aWMgbWluTGVuZ3RoKG1pbkxlbmd0aDogbnVtYmVyKTogVmFsaWRhdG9yRm4ge1xuICAgIHJldHVybiBtaW5MZW5ndGhWYWxpZGF0b3IobWluTGVuZ3RoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogVmFsaWRhdG9yIHRoYXQgcmVxdWlyZXMgdGhlIGxlbmd0aCBvZiB0aGUgY29udHJvbCdzIHZhbHVlIHRvIGJlIGxlc3MgdGhhbiBvciBlcXVhbFxuICAgKiB0byB0aGUgcHJvdmlkZWQgbWF4aW11bSBsZW5ndGguIFRoaXMgdmFsaWRhdG9yIGlzIGFsc28gcHJvdmlkZWQgYnkgZGVmYXVsdCBpZiB5b3UgdXNlIHRoZVxuICAgKiB0aGUgSFRNTDUgYG1heGxlbmd0aGAgYXR0cmlidXRlLiBOb3RlIHRoYXQgdGhlIGBtYXhMZW5ndGhgIHZhbGlkYXRvciBpcyBpbnRlbmRlZCB0byBiZSB1c2VkXG4gICAqIG9ubHkgZm9yIHR5cGVzIHRoYXQgaGF2ZSBhIG51bWVyaWMgYGxlbmd0aGAgcHJvcGVydHksIHN1Y2ggYXMgc3RyaW5ncyBvciBhcnJheXMuXG4gICAqXG4gICAqIEB1c2FnZU5vdGVzXG4gICAqXG4gICAqICMjIyBWYWxpZGF0ZSB0aGF0IHRoZSBmaWVsZCBoYXMgbWF4aW11bSBvZiA1IGNoYXJhY3RlcnNcbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiBjb25zdCBjb250cm9sID0gbmV3IEZvcm1Db250cm9sKCdBbmd1bGFyJywgVmFsaWRhdG9ycy5tYXhMZW5ndGgoNSkpO1xuICAgKlxuICAgKiBjb25zb2xlLmxvZyhjb250cm9sLmVycm9ycyk7IC8vIHttYXhsZW5ndGg6IHtyZXF1aXJlZExlbmd0aDogNSwgYWN0dWFsTGVuZ3RoOiA3fX1cbiAgICogYGBgXG4gICAqXG4gICAqIGBgYGh0bWxcbiAgICogPGlucHV0IG1heGxlbmd0aD1cIjVcIj5cbiAgICogYGBgXG4gICAqXG4gICAqIEByZXR1cm5zIEEgdmFsaWRhdG9yIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhbiBlcnJvciBtYXAgd2l0aCB0aGVcbiAgICogYG1heGxlbmd0aGAgcHJvcGVydHkgaWYgdGhlIHZhbGlkYXRpb24gY2hlY2sgZmFpbHMsIG90aGVyd2lzZSBgbnVsbGAuXG4gICAqXG4gICAqIEBzZWUge0BsaW5rIHVwZGF0ZVZhbHVlQW5kVmFsaWRpdHkoKX1cbiAgICpcbiAgICovXG4gIHN0YXRpYyBtYXhMZW5ndGgobWF4TGVuZ3RoOiBudW1iZXIpOiBWYWxpZGF0b3JGbiB7XG4gICAgcmV0dXJuIG1heExlbmd0aFZhbGlkYXRvcihtYXhMZW5ndGgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBWYWxpZGF0b3IgdGhhdCByZXF1aXJlcyB0aGUgY29udHJvbCdzIHZhbHVlIHRvIG1hdGNoIGEgcmVnZXggcGF0dGVybi4gVGhpcyB2YWxpZGF0b3IgaXMgYWxzb1xuICAgKiBwcm92aWRlZCBieSBkZWZhdWx0IGlmIHlvdSB1c2UgdGhlIEhUTUw1IGBwYXR0ZXJuYCBhdHRyaWJ1dGUuXG4gICAqXG4gICAqIEB1c2FnZU5vdGVzXG4gICAqXG4gICAqICMjIyBWYWxpZGF0ZSB0aGF0IHRoZSBmaWVsZCBvbmx5IGNvbnRhaW5zIGxldHRlcnMgb3Igc3BhY2VzXG4gICAqXG4gICAqIGBgYHR5cGVzY3JpcHRcbiAgICogY29uc3QgY29udHJvbCA9IG5ldyBGb3JtQ29udHJvbCgnMScsIFZhbGlkYXRvcnMucGF0dGVybignW2EtekEtWiBdKicpKTtcbiAgICpcbiAgICogY29uc29sZS5sb2coY29udHJvbC5lcnJvcnMpOyAvLyB7cGF0dGVybjoge3JlcXVpcmVkUGF0dGVybjogJ15bYS16QS1aIF0qJCcsIGFjdHVhbFZhbHVlOiAnMSd9fVxuICAgKiBgYGBcbiAgICpcbiAgICogYGBgaHRtbFxuICAgKiA8aW5wdXQgcGF0dGVybj1cIlthLXpBLVogXSpcIj5cbiAgICogYGBgXG4gICAqXG4gICAqICMjIyBQYXR0ZXJuIG1hdGNoaW5nIHdpdGggdGhlIGdsb2JhbCBvciBzdGlja3kgZmxhZ1xuICAgKlxuICAgKiBgUmVnRXhwYCBvYmplY3RzIGNyZWF0ZWQgd2l0aCB0aGUgYGdgIG9yIGB5YCBmbGFncyB0aGF0IGFyZSBwYXNzZWQgaW50byBgVmFsaWRhdG9ycy5wYXR0ZXJuYFxuICAgKiBjYW4gcHJvZHVjZSBkaWZmZXJlbnQgcmVzdWx0cyBvbiB0aGUgc2FtZSBpbnB1dCB3aGVuIHZhbGlkYXRpb25zIGFyZSBydW4gY29uc2VjdXRpdmVseS4gVGhpcyBpc1xuICAgKiBkdWUgdG8gaG93IHRoZSBiZWhhdmlvciBvZiBgUmVnRXhwLnByb3RvdHlwZS50ZXN0YCBpc1xuICAgKiBzcGVjaWZpZWQgaW4gW0VDTUEtMjYyXShodHRwczovL3RjMzkuZXMvZWNtYTI2Mi8jc2VjLXJlZ2V4cGJ1aWx0aW5leGVjKVxuICAgKiAoYFJlZ0V4cGAgcHJlc2VydmVzIHRoZSBpbmRleCBvZiB0aGUgbGFzdCBtYXRjaCB3aGVuIHRoZSBnbG9iYWwgb3Igc3RpY2t5IGZsYWcgaXMgdXNlZCkuXG4gICAqIER1ZSB0byB0aGlzIGJlaGF2aW9yLCBpdCBpcyByZWNvbW1lbmRlZCB0aGF0IHdoZW4gdXNpbmdcbiAgICogYFZhbGlkYXRvcnMucGF0dGVybmAgeW91ICoqZG8gbm90KiogcGFzcyBpbiBhIGBSZWdFeHBgIG9iamVjdCB3aXRoIGVpdGhlciB0aGUgZ2xvYmFsIG9yIHN0aWNreVxuICAgKiBmbGFnIGVuYWJsZWQuXG4gICAqXG4gICAqIGBgYHR5cGVzY3JpcHRcbiAgICogLy8gTm90IHJlY29tbWVuZGVkIChzaW5jZSB0aGUgYGdgIGZsYWcgaXMgdXNlZClcbiAgICogY29uc3QgY29udHJvbE9uZSA9IG5ldyBGb3JtQ29udHJvbCgnMScsIFZhbGlkYXRvcnMucGF0dGVybigvZm9vL2cpKTtcbiAgICpcbiAgICogLy8gR29vZFxuICAgKiBjb25zdCBjb250cm9sVHdvID0gbmV3IEZvcm1Db250cm9sKCcxJywgVmFsaWRhdG9ycy5wYXR0ZXJuKC9mb28vKSk7XG4gICAqIGBgYFxuICAgKlxuICAgKiBAcGFyYW0gcGF0dGVybiBBIHJlZ3VsYXIgZXhwcmVzc2lvbiB0byBiZSB1c2VkIGFzIGlzIHRvIHRlc3QgdGhlIHZhbHVlcywgb3IgYSBzdHJpbmcuXG4gICAqIElmIGEgc3RyaW5nIGlzIHBhc3NlZCwgdGhlIGBeYCBjaGFyYWN0ZXIgaXMgcHJlcGVuZGVkIGFuZCB0aGUgYCRgIGNoYXJhY3RlciBpc1xuICAgKiBhcHBlbmRlZCB0byB0aGUgcHJvdmlkZWQgc3RyaW5nIChpZiBub3QgYWxyZWFkeSBwcmVzZW50KSwgYW5kIHRoZSByZXN1bHRpbmcgcmVndWxhclxuICAgKiBleHByZXNzaW9uIGlzIHVzZWQgdG8gdGVzdCB0aGUgdmFsdWVzLlxuICAgKlxuICAgKiBAcmV0dXJucyBBIHZhbGlkYXRvciBmdW5jdGlvbiB0aGF0IHJldHVybnMgYW4gZXJyb3IgbWFwIHdpdGggdGhlXG4gICAqIGBwYXR0ZXJuYCBwcm9wZXJ0eSBpZiB0aGUgdmFsaWRhdGlvbiBjaGVjayBmYWlscywgb3RoZXJ3aXNlIGBudWxsYC5cbiAgICpcbiAgICogQHNlZSB7QGxpbmsgdXBkYXRlVmFsdWVBbmRWYWxpZGl0eSgpfVxuICAgKlxuICAgKi9cbiAgc3RhdGljIHBhdHRlcm4ocGF0dGVybjogc3RyaW5nIHwgUmVnRXhwKTogVmFsaWRhdG9yRm4ge1xuICAgIHJldHVybiBwYXR0ZXJuVmFsaWRhdG9yKHBhdHRlcm4pO1xuICB9XG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBWYWxpZGF0b3IgdGhhdCBwZXJmb3JtcyBubyBvcGVyYXRpb24uXG4gICAqXG4gICAqIEBzZWUge0BsaW5rIHVwZGF0ZVZhbHVlQW5kVmFsaWRpdHkoKX1cbiAgICpcbiAgICovXG4gIHN0YXRpYyBudWxsVmFsaWRhdG9yKGNvbnRyb2w6IEFic3RyYWN0Q29udHJvbCk6IFZhbGlkYXRpb25FcnJvcnMgfCBudWxsIHtcbiAgICByZXR1cm4gbnVsbFZhbGlkYXRvcihjb250cm9sKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogQ29tcG9zZSBtdWx0aXBsZSB2YWxpZGF0b3JzIGludG8gYSBzaW5nbGUgZnVuY3Rpb24gdGhhdCByZXR1cm5zIHRoZSB1bmlvblxuICAgKiBvZiB0aGUgaW5kaXZpZHVhbCBlcnJvciBtYXBzIGZvciB0aGUgcHJvdmlkZWQgY29udHJvbC5cbiAgICpcbiAgICogQHJldHVybnMgQSB2YWxpZGF0b3IgZnVuY3Rpb24gdGhhdCByZXR1cm5zIGFuIGVycm9yIG1hcCB3aXRoIHRoZVxuICAgKiBtZXJnZWQgZXJyb3IgbWFwcyBvZiB0aGUgdmFsaWRhdG9ycyBpZiB0aGUgdmFsaWRhdGlvbiBjaGVjayBmYWlscywgb3RoZXJ3aXNlIGBudWxsYC5cbiAgICpcbiAgICogQHNlZSB7QGxpbmsgdXBkYXRlVmFsdWVBbmRWYWxpZGl0eSgpfVxuICAgKlxuICAgKi9cbiAgc3RhdGljIGNvbXBvc2UodmFsaWRhdG9yczogbnVsbCk6IG51bGw7XG4gIHN0YXRpYyBjb21wb3NlKHZhbGlkYXRvcnM6IChWYWxpZGF0b3JGbiB8IG51bGwgfCB1bmRlZmluZWQpW10pOiBWYWxpZGF0b3JGbiB8IG51bGw7XG4gIHN0YXRpYyBjb21wb3NlKHZhbGlkYXRvcnM6IChWYWxpZGF0b3JGbiB8IG51bGwgfCB1bmRlZmluZWQpW10gfCBudWxsKTogVmFsaWRhdG9yRm4gfCBudWxsIHtcbiAgICByZXR1cm4gY29tcG9zZSh2YWxpZGF0b3JzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogQ29tcG9zZSBtdWx0aXBsZSBhc3luYyB2YWxpZGF0b3JzIGludG8gYSBzaW5nbGUgZnVuY3Rpb24gdGhhdCByZXR1cm5zIHRoZSB1bmlvblxuICAgKiBvZiB0aGUgaW5kaXZpZHVhbCBlcnJvciBvYmplY3RzIGZvciB0aGUgcHJvdmlkZWQgY29udHJvbC5cbiAgICpcbiAgICogQHJldHVybnMgQSB2YWxpZGF0b3IgZnVuY3Rpb24gdGhhdCByZXR1cm5zIGFuIGVycm9yIG1hcCB3aXRoIHRoZVxuICAgKiBtZXJnZWQgZXJyb3Igb2JqZWN0cyBvZiB0aGUgYXN5bmMgdmFsaWRhdG9ycyBpZiB0aGUgdmFsaWRhdGlvbiBjaGVjayBmYWlscywgb3RoZXJ3aXNlIGBudWxsYC5cbiAgICpcbiAgICogQHNlZSB7QGxpbmsgdXBkYXRlVmFsdWVBbmRWYWxpZGl0eSgpfVxuICAgKlxuICAgKi9cbiAgc3RhdGljIGNvbXBvc2VBc3luYyh2YWxpZGF0b3JzOiAoQXN5bmNWYWxpZGF0b3JGbiB8IG51bGwpW10pOiBBc3luY1ZhbGlkYXRvckZuIHwgbnVsbCB7XG4gICAgcmV0dXJuIGNvbXBvc2VBc3luYyh2YWxpZGF0b3JzKTtcbiAgfVxufVxuXG4vKipcbiAqIFZhbGlkYXRvciB0aGF0IHJlcXVpcmVzIHRoZSBjb250cm9sJ3MgdmFsdWUgdG8gYmUgZ3JlYXRlciB0aGFuIG9yIGVxdWFsIHRvIHRoZSBwcm92aWRlZCBudW1iZXIuXG4gKiBTZWUgYFZhbGlkYXRvcnMubWluYCBmb3IgYWRkaXRpb25hbCBpbmZvcm1hdGlvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1pblZhbGlkYXRvcihtaW46IG51bWJlcik6IFZhbGlkYXRvckZuIHtcbiAgcmV0dXJuIChjb250cm9sOiBBYnN0cmFjdENvbnRyb2wpOiBWYWxpZGF0aW9uRXJyb3JzIHwgbnVsbCA9PiB7XG4gICAgaWYgKGlzRW1wdHlJbnB1dFZhbHVlKGNvbnRyb2wudmFsdWUpIHx8IGlzRW1wdHlJbnB1dFZhbHVlKG1pbikpIHtcbiAgICAgIHJldHVybiBudWxsOyAvLyBkb24ndCB2YWxpZGF0ZSBlbXB0eSB2YWx1ZXMgdG8gYWxsb3cgb3B0aW9uYWwgY29udHJvbHNcbiAgICB9XG4gICAgY29uc3QgdmFsdWUgPSBwYXJzZUZsb2F0KGNvbnRyb2wudmFsdWUpO1xuICAgIC8vIENvbnRyb2xzIHdpdGggTmFOIHZhbHVlcyBhZnRlciBwYXJzaW5nIHNob3VsZCBiZSB0cmVhdGVkIGFzIG5vdCBoYXZpbmcgYVxuICAgIC8vIG1pbmltdW0sIHBlciB0aGUgSFRNTCBmb3JtcyBzcGVjOiBodHRwczovL3d3dy53My5vcmcvVFIvaHRtbDUvZm9ybXMuaHRtbCNhdHRyLWlucHV0LW1pblxuICAgIHJldHVybiAhaXNOYU4odmFsdWUpICYmIHZhbHVlIDwgbWluID8geydtaW4nOiB7J21pbic6IG1pbiwgJ2FjdHVhbCc6IGNvbnRyb2wudmFsdWV9fSA6IG51bGw7XG4gIH07XG59XG5cbi8qKlxuICogVmFsaWRhdG9yIHRoYXQgcmVxdWlyZXMgdGhlIGNvbnRyb2wncyB2YWx1ZSB0byBiZSBsZXNzIHRoYW4gb3IgZXF1YWwgdG8gdGhlIHByb3ZpZGVkIG51bWJlci5cbiAqIFNlZSBgVmFsaWRhdG9ycy5tYXhgIGZvciBhZGRpdGlvbmFsIGluZm9ybWF0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gbWF4VmFsaWRhdG9yKG1heDogbnVtYmVyKTogVmFsaWRhdG9yRm4ge1xuICByZXR1cm4gKGNvbnRyb2w6IEFic3RyYWN0Q29udHJvbCk6IFZhbGlkYXRpb25FcnJvcnMgfCBudWxsID0+IHtcbiAgICBpZiAoaXNFbXB0eUlucHV0VmFsdWUoY29udHJvbC52YWx1ZSkgfHwgaXNFbXB0eUlucHV0VmFsdWUobWF4KSkge1xuICAgICAgcmV0dXJuIG51bGw7IC8vIGRvbid0IHZhbGlkYXRlIGVtcHR5IHZhbHVlcyB0byBhbGxvdyBvcHRpb25hbCBjb250cm9sc1xuICAgIH1cbiAgICBjb25zdCB2YWx1ZSA9IHBhcnNlRmxvYXQoY29udHJvbC52YWx1ZSk7XG4gICAgLy8gQ29udHJvbHMgd2l0aCBOYU4gdmFsdWVzIGFmdGVyIHBhcnNpbmcgc2hvdWxkIGJlIHRyZWF0ZWQgYXMgbm90IGhhdmluZyBhXG4gICAgLy8gbWF4aW11bSwgcGVyIHRoZSBIVE1MIGZvcm1zIHNwZWM6IGh0dHBzOi8vd3d3LnczLm9yZy9UUi9odG1sNS9mb3Jtcy5odG1sI2F0dHItaW5wdXQtbWF4XG4gICAgcmV0dXJuICFpc05hTih2YWx1ZSkgJiYgdmFsdWUgPiBtYXggPyB7J21heCc6IHsnbWF4JzogbWF4LCAnYWN0dWFsJzogY29udHJvbC52YWx1ZX19IDogbnVsbDtcbiAgfTtcbn1cblxuLyoqXG4gKiBWYWxpZGF0b3IgdGhhdCByZXF1aXJlcyB0aGUgY29udHJvbCBoYXZlIGEgbm9uLWVtcHR5IHZhbHVlLlxuICogU2VlIGBWYWxpZGF0b3JzLnJlcXVpcmVkYCBmb3IgYWRkaXRpb25hbCBpbmZvcm1hdGlvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlcXVpcmVkVmFsaWRhdG9yKGNvbnRyb2w6IEFic3RyYWN0Q29udHJvbCk6IFZhbGlkYXRpb25FcnJvcnMgfCBudWxsIHtcbiAgcmV0dXJuIGlzRW1wdHlJbnB1dFZhbHVlKGNvbnRyb2wudmFsdWUpID8geydyZXF1aXJlZCc6IHRydWV9IDogbnVsbDtcbn1cblxuLyoqXG4gKiBWYWxpZGF0b3IgdGhhdCByZXF1aXJlcyB0aGUgY29udHJvbCdzIHZhbHVlIGJlIHRydWUuIFRoaXMgdmFsaWRhdG9yIGlzIGNvbW1vbmx5XG4gKiB1c2VkIGZvciByZXF1aXJlZCBjaGVja2JveGVzLlxuICogU2VlIGBWYWxpZGF0b3JzLnJlcXVpcmVkVHJ1ZWAgZm9yIGFkZGl0aW9uYWwgaW5mb3JtYXRpb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXF1aXJlZFRydWVWYWxpZGF0b3IoY29udHJvbDogQWJzdHJhY3RDb250cm9sKTogVmFsaWRhdGlvbkVycm9ycyB8IG51bGwge1xuICByZXR1cm4gY29udHJvbC52YWx1ZSA9PT0gdHJ1ZSA/IG51bGwgOiB7J3JlcXVpcmVkJzogdHJ1ZX07XG59XG5cbi8qKlxuICogVmFsaWRhdG9yIHRoYXQgcmVxdWlyZXMgdGhlIGNvbnRyb2wncyB2YWx1ZSBwYXNzIGFuIGVtYWlsIHZhbGlkYXRpb24gdGVzdC5cbiAqIFNlZSBgVmFsaWRhdG9ycy5lbWFpbGAgZm9yIGFkZGl0aW9uYWwgaW5mb3JtYXRpb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlbWFpbFZhbGlkYXRvcihjb250cm9sOiBBYnN0cmFjdENvbnRyb2wpOiBWYWxpZGF0aW9uRXJyb3JzIHwgbnVsbCB7XG4gIGlmIChpc0VtcHR5SW5wdXRWYWx1ZShjb250cm9sLnZhbHVlKSkge1xuICAgIHJldHVybiBudWxsOyAvLyBkb24ndCB2YWxpZGF0ZSBlbXB0eSB2YWx1ZXMgdG8gYWxsb3cgb3B0aW9uYWwgY29udHJvbHNcbiAgfVxuICByZXR1cm4gRU1BSUxfUkVHRVhQLnRlc3QoY29udHJvbC52YWx1ZSkgPyBudWxsIDogeydlbWFpbCc6IHRydWV9O1xufVxuXG4vKipcbiAqIFZhbGlkYXRvciB0aGF0IHJlcXVpcmVzIHRoZSBsZW5ndGggb2YgdGhlIGNvbnRyb2wncyB2YWx1ZSB0byBiZSBncmVhdGVyIHRoYW4gb3IgZXF1YWxcbiAqIHRvIHRoZSBwcm92aWRlZCBtaW5pbXVtIGxlbmd0aC4gU2VlIGBWYWxpZGF0b3JzLm1pbkxlbmd0aGAgZm9yIGFkZGl0aW9uYWwgaW5mb3JtYXRpb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtaW5MZW5ndGhWYWxpZGF0b3IobWluTGVuZ3RoOiBudW1iZXIpOiBWYWxpZGF0b3JGbiB7XG4gIHJldHVybiAoY29udHJvbDogQWJzdHJhY3RDb250cm9sKTogVmFsaWRhdGlvbkVycm9ycyB8IG51bGwgPT4ge1xuICAgIGlmIChpc0VtcHR5SW5wdXRWYWx1ZShjb250cm9sLnZhbHVlKSB8fCAhaGFzVmFsaWRMZW5ndGgoY29udHJvbC52YWx1ZSkpIHtcbiAgICAgIC8vIGRvbid0IHZhbGlkYXRlIGVtcHR5IHZhbHVlcyB0byBhbGxvdyBvcHRpb25hbCBjb250cm9sc1xuICAgICAgLy8gZG9uJ3QgdmFsaWRhdGUgdmFsdWVzIHdpdGhvdXQgYGxlbmd0aGAgcHJvcGVydHlcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHJldHVybiBjb250cm9sLnZhbHVlLmxlbmd0aCA8IG1pbkxlbmd0aFxuICAgICAgPyB7J21pbmxlbmd0aCc6IHsncmVxdWlyZWRMZW5ndGgnOiBtaW5MZW5ndGgsICdhY3R1YWxMZW5ndGgnOiBjb250cm9sLnZhbHVlLmxlbmd0aH19XG4gICAgICA6IG51bGw7XG4gIH07XG59XG5cbi8qKlxuICogVmFsaWRhdG9yIHRoYXQgcmVxdWlyZXMgdGhlIGxlbmd0aCBvZiB0aGUgY29udHJvbCdzIHZhbHVlIHRvIGJlIGxlc3MgdGhhbiBvciBlcXVhbFxuICogdG8gdGhlIHByb3ZpZGVkIG1heGltdW0gbGVuZ3RoLiBTZWUgYFZhbGlkYXRvcnMubWF4TGVuZ3RoYCBmb3IgYWRkaXRpb25hbCBpbmZvcm1hdGlvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1heExlbmd0aFZhbGlkYXRvcihtYXhMZW5ndGg6IG51bWJlcik6IFZhbGlkYXRvckZuIHtcbiAgcmV0dXJuIChjb250cm9sOiBBYnN0cmFjdENvbnRyb2wpOiBWYWxpZGF0aW9uRXJyb3JzIHwgbnVsbCA9PiB7XG4gICAgcmV0dXJuIGhhc1ZhbGlkTGVuZ3RoKGNvbnRyb2wudmFsdWUpICYmIGNvbnRyb2wudmFsdWUubGVuZ3RoID4gbWF4TGVuZ3RoXG4gICAgICA/IHsnbWF4bGVuZ3RoJzogeydyZXF1aXJlZExlbmd0aCc6IG1heExlbmd0aCwgJ2FjdHVhbExlbmd0aCc6IGNvbnRyb2wudmFsdWUubGVuZ3RofX1cbiAgICAgIDogbnVsbDtcbiAgfTtcbn1cblxuLyoqXG4gKiBWYWxpZGF0b3IgdGhhdCByZXF1aXJlcyB0aGUgY29udHJvbCdzIHZhbHVlIHRvIG1hdGNoIGEgcmVnZXggcGF0dGVybi5cbiAqIFNlZSBgVmFsaWRhdG9ycy5wYXR0ZXJuYCBmb3IgYWRkaXRpb25hbCBpbmZvcm1hdGlvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhdHRlcm5WYWxpZGF0b3IocGF0dGVybjogc3RyaW5nIHwgUmVnRXhwKTogVmFsaWRhdG9yRm4ge1xuICBpZiAoIXBhdHRlcm4pIHJldHVybiBudWxsVmFsaWRhdG9yO1xuICBsZXQgcmVnZXg6IFJlZ0V4cDtcbiAgbGV0IHJlZ2V4U3RyOiBzdHJpbmc7XG4gIGlmICh0eXBlb2YgcGF0dGVybiA9PT0gJ3N0cmluZycpIHtcbiAgICByZWdleFN0ciA9ICcnO1xuXG4gICAgaWYgKHBhdHRlcm4uY2hhckF0KDApICE9PSAnXicpIHJlZ2V4U3RyICs9ICdeJztcblxuICAgIHJlZ2V4U3RyICs9IHBhdHRlcm47XG5cbiAgICBpZiAocGF0dGVybi5jaGFyQXQocGF0dGVybi5sZW5ndGggLSAxKSAhPT0gJyQnKSByZWdleFN0ciArPSAnJCc7XG5cbiAgICByZWdleCA9IG5ldyBSZWdFeHAocmVnZXhTdHIpO1xuICB9IGVsc2Uge1xuICAgIHJlZ2V4U3RyID0gcGF0dGVybi50b1N0cmluZygpO1xuICAgIHJlZ2V4ID0gcGF0dGVybjtcbiAgfVxuICByZXR1cm4gKGNvbnRyb2w6IEFic3RyYWN0Q29udHJvbCk6IFZhbGlkYXRpb25FcnJvcnMgfCBudWxsID0+IHtcbiAgICBpZiAoaXNFbXB0eUlucHV0VmFsdWUoY29udHJvbC52YWx1ZSkpIHtcbiAgICAgIHJldHVybiBudWxsOyAvLyBkb24ndCB2YWxpZGF0ZSBlbXB0eSB2YWx1ZXMgdG8gYWxsb3cgb3B0aW9uYWwgY29udHJvbHNcbiAgICB9XG4gICAgY29uc3QgdmFsdWU6IHN0cmluZyA9IGNvbnRyb2wudmFsdWU7XG4gICAgcmV0dXJuIHJlZ2V4LnRlc3QodmFsdWUpXG4gICAgICA/IG51bGxcbiAgICAgIDogeydwYXR0ZXJuJzogeydyZXF1aXJlZFBhdHRlcm4nOiByZWdleFN0ciwgJ2FjdHVhbFZhbHVlJzogdmFsdWV9fTtcbiAgfTtcbn1cblxuLyoqXG4gKiBGdW5jdGlvbiB0aGF0IGhhcyBgVmFsaWRhdG9yRm5gIHNoYXBlLCBidXQgcGVyZm9ybXMgbm8gb3BlcmF0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gbnVsbFZhbGlkYXRvcihjb250cm9sOiBBYnN0cmFjdENvbnRyb2wpOiBWYWxpZGF0aW9uRXJyb3JzIHwgbnVsbCB7XG4gIHJldHVybiBudWxsO1xufVxuXG5mdW5jdGlvbiBpc1ByZXNlbnQobzogYW55KTogYm9vbGVhbiB7XG4gIHJldHVybiBvICE9IG51bGw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0b09ic2VydmFibGUodmFsdWU6IGFueSk6IE9ic2VydmFibGU8YW55PiB7XG4gIGNvbnN0IG9icyA9IGlzUHJvbWlzZSh2YWx1ZSkgPyBmcm9tKHZhbHVlKSA6IHZhbHVlO1xuICBpZiAoKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkgJiYgIWlzU3Vic2NyaWJhYmxlKG9icykpIHtcbiAgICBsZXQgZXJyb3JNZXNzYWdlID0gYEV4cGVjdGVkIGFzeW5jIHZhbGlkYXRvciB0byByZXR1cm4gUHJvbWlzZSBvciBPYnNlcnZhYmxlLmA7XG4gICAgLy8gQSBzeW5jaHJvbm91cyB2YWxpZGF0b3Igd2lsbCByZXR1cm4gb2JqZWN0IG9yIG51bGwuXG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGVycm9yTWVzc2FnZSArPVxuICAgICAgICAnIEFyZSB5b3UgdXNpbmcgYSBzeW5jaHJvbm91cyB2YWxpZGF0b3Igd2hlcmUgYW4gYXN5bmMgdmFsaWRhdG9yIGlzIGV4cGVjdGVkPyc7XG4gICAgfVxuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoUnVudGltZUVycm9yQ29kZS5XUk9OR19WQUxJREFUT1JfUkVUVVJOX1RZUEUsIGVycm9yTWVzc2FnZSk7XG4gIH1cbiAgcmV0dXJuIG9icztcbn1cblxuZnVuY3Rpb24gbWVyZ2VFcnJvcnMoYXJyYXlPZkVycm9yczogKFZhbGlkYXRpb25FcnJvcnMgfCBudWxsKVtdKTogVmFsaWRhdGlvbkVycm9ycyB8IG51bGwge1xuICBsZXQgcmVzOiB7W2tleTogc3RyaW5nXTogYW55fSA9IHt9O1xuICBhcnJheU9mRXJyb3JzLmZvckVhY2goKGVycm9yczogVmFsaWRhdGlvbkVycm9ycyB8IG51bGwpID0+IHtcbiAgICByZXMgPSBlcnJvcnMgIT0gbnVsbCA/IHsuLi5yZXMhLCAuLi5lcnJvcnN9IDogcmVzITtcbiAgfSk7XG5cbiAgcmV0dXJuIE9iamVjdC5rZXlzKHJlcykubGVuZ3RoID09PSAwID8gbnVsbCA6IHJlcztcbn1cblxudHlwZSBHZW5lcmljVmFsaWRhdG9yRm4gPSAoY29udHJvbDogQWJzdHJhY3RDb250cm9sKSA9PiBhbnk7XG5cbmZ1bmN0aW9uIGV4ZWN1dGVWYWxpZGF0b3JzPFYgZXh0ZW5kcyBHZW5lcmljVmFsaWRhdG9yRm4+KFxuICBjb250cm9sOiBBYnN0cmFjdENvbnRyb2wsXG4gIHZhbGlkYXRvcnM6IFZbXSxcbik6IFJldHVyblR5cGU8Vj5bXSB7XG4gIHJldHVybiB2YWxpZGF0b3JzLm1hcCgodmFsaWRhdG9yKSA9PiB2YWxpZGF0b3IoY29udHJvbCkpO1xufVxuXG5mdW5jdGlvbiBpc1ZhbGlkYXRvckZuPFY+KHZhbGlkYXRvcjogViB8IFZhbGlkYXRvciB8IEFzeW5jVmFsaWRhdG9yKTogdmFsaWRhdG9yIGlzIFYge1xuICByZXR1cm4gISh2YWxpZGF0b3IgYXMgVmFsaWRhdG9yKS52YWxpZGF0ZTtcbn1cblxuLyoqXG4gKiBHaXZlbiB0aGUgbGlzdCBvZiB2YWxpZGF0b3JzIHRoYXQgbWF5IGNvbnRhaW4gYm90aCBmdW5jdGlvbnMgYXMgd2VsbCBhcyBjbGFzc2VzLCByZXR1cm4gdGhlIGxpc3RcbiAqIG9mIHZhbGlkYXRvciBmdW5jdGlvbnMgKGNvbnZlcnQgdmFsaWRhdG9yIGNsYXNzZXMgaW50byB2YWxpZGF0b3IgZnVuY3Rpb25zKS4gVGhpcyBpcyBuZWVkZWQgdG9cbiAqIGhhdmUgY29uc2lzdGVudCBzdHJ1Y3R1cmUgaW4gdmFsaWRhdG9ycyBsaXN0IGJlZm9yZSBjb21wb3NpbmcgdGhlbS5cbiAqXG4gKiBAcGFyYW0gdmFsaWRhdG9ycyBUaGUgc2V0IG9mIHZhbGlkYXRvcnMgdGhhdCBtYXkgY29udGFpbiB2YWxpZGF0b3JzIGJvdGggaW4gcGxhaW4gZnVuY3Rpb24gZm9ybVxuICogICAgIGFzIHdlbGwgYXMgcmVwcmVzZW50ZWQgYXMgYSB2YWxpZGF0b3IgY2xhc3MuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemVWYWxpZGF0b3JzPFY+KHZhbGlkYXRvcnM6IChWIHwgVmFsaWRhdG9yIHwgQXN5bmNWYWxpZGF0b3IpW10pOiBWW10ge1xuICByZXR1cm4gdmFsaWRhdG9ycy5tYXAoKHZhbGlkYXRvcikgPT4ge1xuICAgIHJldHVybiBpc1ZhbGlkYXRvckZuPFY+KHZhbGlkYXRvcilcbiAgICAgID8gdmFsaWRhdG9yXG4gICAgICA6ICgoKGM6IEFic3RyYWN0Q29udHJvbCkgPT4gdmFsaWRhdG9yLnZhbGlkYXRlKGMpKSBhcyB1bmtub3duIGFzIFYpO1xuICB9KTtcbn1cblxuLyoqXG4gKiBNZXJnZXMgc3luY2hyb25vdXMgdmFsaWRhdG9ycyBpbnRvIGEgc2luZ2xlIHZhbGlkYXRvciBmdW5jdGlvbi5cbiAqIFNlZSBgVmFsaWRhdG9ycy5jb21wb3NlYCBmb3IgYWRkaXRpb25hbCBpbmZvcm1hdGlvbi5cbiAqL1xuZnVuY3Rpb24gY29tcG9zZSh2YWxpZGF0b3JzOiAoVmFsaWRhdG9yRm4gfCBudWxsIHwgdW5kZWZpbmVkKVtdIHwgbnVsbCk6IFZhbGlkYXRvckZuIHwgbnVsbCB7XG4gIGlmICghdmFsaWRhdG9ycykgcmV0dXJuIG51bGw7XG4gIGNvbnN0IHByZXNlbnRWYWxpZGF0b3JzOiBWYWxpZGF0b3JGbltdID0gdmFsaWRhdG9ycy5maWx0ZXIoaXNQcmVzZW50KSBhcyBhbnk7XG4gIGlmIChwcmVzZW50VmFsaWRhdG9ycy5sZW5ndGggPT0gMCkgcmV0dXJuIG51bGw7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIChjb250cm9sOiBBYnN0cmFjdENvbnRyb2wpIHtcbiAgICByZXR1cm4gbWVyZ2VFcnJvcnMoZXhlY3V0ZVZhbGlkYXRvcnM8VmFsaWRhdG9yRm4+KGNvbnRyb2wsIHByZXNlbnRWYWxpZGF0b3JzKSk7XG4gIH07XG59XG5cbi8qKlxuICogQWNjZXB0cyBhIGxpc3Qgb2YgdmFsaWRhdG9ycyBvZiBkaWZmZXJlbnQgcG9zc2libGUgc2hhcGVzIChgVmFsaWRhdG9yYCBhbmQgYFZhbGlkYXRvckZuYCksXG4gKiBub3JtYWxpemVzIHRoZSBsaXN0IChjb252ZXJ0cyBldmVyeXRoaW5nIHRvIGBWYWxpZGF0b3JGbmApIGFuZCBtZXJnZXMgdGhlbSBpbnRvIGEgc2luZ2xlXG4gKiB2YWxpZGF0b3IgZnVuY3Rpb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb21wb3NlVmFsaWRhdG9ycyh2YWxpZGF0b3JzOiBBcnJheTxWYWxpZGF0b3IgfCBWYWxpZGF0b3JGbj4pOiBWYWxpZGF0b3JGbiB8IG51bGwge1xuICByZXR1cm4gdmFsaWRhdG9ycyAhPSBudWxsID8gY29tcG9zZShub3JtYWxpemVWYWxpZGF0b3JzPFZhbGlkYXRvckZuPih2YWxpZGF0b3JzKSkgOiBudWxsO1xufVxuXG4vKipcbiAqIE1lcmdlcyBhc3luY2hyb25vdXMgdmFsaWRhdG9ycyBpbnRvIGEgc2luZ2xlIHZhbGlkYXRvciBmdW5jdGlvbi5cbiAqIFNlZSBgVmFsaWRhdG9ycy5jb21wb3NlQXN5bmNgIGZvciBhZGRpdGlvbmFsIGluZm9ybWF0aW9uLlxuICovXG5mdW5jdGlvbiBjb21wb3NlQXN5bmModmFsaWRhdG9yczogKEFzeW5jVmFsaWRhdG9yRm4gfCBudWxsKVtdKTogQXN5bmNWYWxpZGF0b3JGbiB8IG51bGwge1xuICBpZiAoIXZhbGlkYXRvcnMpIHJldHVybiBudWxsO1xuICBjb25zdCBwcmVzZW50VmFsaWRhdG9yczogQXN5bmNWYWxpZGF0b3JGbltdID0gdmFsaWRhdG9ycy5maWx0ZXIoaXNQcmVzZW50KSBhcyBhbnk7XG4gIGlmIChwcmVzZW50VmFsaWRhdG9ycy5sZW5ndGggPT0gMCkgcmV0dXJuIG51bGw7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIChjb250cm9sOiBBYnN0cmFjdENvbnRyb2wpIHtcbiAgICBjb25zdCBvYnNlcnZhYmxlcyA9IGV4ZWN1dGVWYWxpZGF0b3JzPEFzeW5jVmFsaWRhdG9yRm4+KGNvbnRyb2wsIHByZXNlbnRWYWxpZGF0b3JzKS5tYXAoXG4gICAgICB0b09ic2VydmFibGUsXG4gICAgKTtcbiAgICByZXR1cm4gZm9ya0pvaW4ob2JzZXJ2YWJsZXMpLnBpcGUobWFwKG1lcmdlRXJyb3JzKSk7XG4gIH07XG59XG5cbi8qKlxuICogQWNjZXB0cyBhIGxpc3Qgb2YgYXN5bmMgdmFsaWRhdG9ycyBvZiBkaWZmZXJlbnQgcG9zc2libGUgc2hhcGVzIChgQXN5bmNWYWxpZGF0b3JgIGFuZFxuICogYEFzeW5jVmFsaWRhdG9yRm5gKSwgbm9ybWFsaXplcyB0aGUgbGlzdCAoY29udmVydHMgZXZlcnl0aGluZyB0byBgQXN5bmNWYWxpZGF0b3JGbmApIGFuZCBtZXJnZXNcbiAqIHRoZW0gaW50byBhIHNpbmdsZSB2YWxpZGF0b3IgZnVuY3Rpb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb21wb3NlQXN5bmNWYWxpZGF0b3JzKFxuICB2YWxpZGF0b3JzOiBBcnJheTxBc3luY1ZhbGlkYXRvciB8IEFzeW5jVmFsaWRhdG9yRm4+LFxuKTogQXN5bmNWYWxpZGF0b3JGbiB8IG51bGwge1xuICByZXR1cm4gdmFsaWRhdG9ycyAhPSBudWxsXG4gICAgPyBjb21wb3NlQXN5bmMobm9ybWFsaXplVmFsaWRhdG9yczxBc3luY1ZhbGlkYXRvckZuPih2YWxpZGF0b3JzKSlcbiAgICA6IG51bGw7XG59XG5cbi8qKlxuICogTWVyZ2VzIHJhdyBjb250cm9sIHZhbGlkYXRvcnMgd2l0aCBhIGdpdmVuIGRpcmVjdGl2ZSB2YWxpZGF0b3IgYW5kIHJldHVybnMgdGhlIGNvbWJpbmVkIGxpc3Qgb2ZcbiAqIHZhbGlkYXRvcnMgYXMgYW4gYXJyYXkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtZXJnZVZhbGlkYXRvcnM8Vj4oY29udHJvbFZhbGlkYXRvcnM6IFYgfCBWW10gfCBudWxsLCBkaXJWYWxpZGF0b3I6IFYpOiBWW10ge1xuICBpZiAoY29udHJvbFZhbGlkYXRvcnMgPT09IG51bGwpIHJldHVybiBbZGlyVmFsaWRhdG9yXTtcbiAgcmV0dXJuIEFycmF5LmlzQXJyYXkoY29udHJvbFZhbGlkYXRvcnMpXG4gICAgPyBbLi4uY29udHJvbFZhbGlkYXRvcnMsIGRpclZhbGlkYXRvcl1cbiAgICA6IFtjb250cm9sVmFsaWRhdG9ycywgZGlyVmFsaWRhdG9yXTtcbn1cblxuLyoqXG4gKiBSZXRyaWV2ZXMgdGhlIGxpc3Qgb2YgcmF3IHN5bmNocm9ub3VzIHZhbGlkYXRvcnMgYXR0YWNoZWQgdG8gYSBnaXZlbiBjb250cm9sLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29udHJvbFZhbGlkYXRvcnMoY29udHJvbDogQWJzdHJhY3RDb250cm9sKTogVmFsaWRhdG9yRm4gfCBWYWxpZGF0b3JGbltdIHwgbnVsbCB7XG4gIHJldHVybiAoY29udHJvbCBhcyBhbnkpLl9yYXdWYWxpZGF0b3JzIGFzIFZhbGlkYXRvckZuIHwgVmFsaWRhdG9yRm5bXSB8IG51bGw7XG59XG5cbi8qKlxuICogUmV0cmlldmVzIHRoZSBsaXN0IG9mIHJhdyBhc3luY2hyb25vdXMgdmFsaWRhdG9ycyBhdHRhY2hlZCB0byBhIGdpdmVuIGNvbnRyb2wuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRDb250cm9sQXN5bmNWYWxpZGF0b3JzKFxuICBjb250cm9sOiBBYnN0cmFjdENvbnRyb2wsXG4pOiBBc3luY1ZhbGlkYXRvckZuIHwgQXN5bmNWYWxpZGF0b3JGbltdIHwgbnVsbCB7XG4gIHJldHVybiAoY29udHJvbCBhcyBhbnkpLl9yYXdBc3luY1ZhbGlkYXRvcnMgYXMgQXN5bmNWYWxpZGF0b3JGbiB8IEFzeW5jVmFsaWRhdG9yRm5bXSB8IG51bGw7XG59XG5cbi8qKlxuICogQWNjZXB0cyBhIHNpbmdsZXRvbiB2YWxpZGF0b3IsIGFuIGFycmF5LCBvciBudWxsLCBhbmQgcmV0dXJucyBhbiBhcnJheSB0eXBlIHdpdGggdGhlIHByb3ZpZGVkXG4gKiB2YWxpZGF0b3JzLlxuICpcbiAqIEBwYXJhbSB2YWxpZGF0b3JzIEEgdmFsaWRhdG9yLCB2YWxpZGF0b3JzLCBvciBudWxsLlxuICogQHJldHVybnMgQSB2YWxpZGF0b3JzIGFycmF5LlxuICovXG5leHBvcnQgZnVuY3Rpb24gbWFrZVZhbGlkYXRvcnNBcnJheTxUIGV4dGVuZHMgVmFsaWRhdG9yRm4gfCBBc3luY1ZhbGlkYXRvckZuPihcbiAgdmFsaWRhdG9yczogVCB8IFRbXSB8IG51bGwsXG4pOiBUW10ge1xuICBpZiAoIXZhbGlkYXRvcnMpIHJldHVybiBbXTtcbiAgcmV0dXJuIEFycmF5LmlzQXJyYXkodmFsaWRhdG9ycykgPyB2YWxpZGF0b3JzIDogW3ZhbGlkYXRvcnNdO1xufVxuXG4vKipcbiAqIERldGVybWluZXMgd2hldGhlciBhIHZhbGlkYXRvciBvciB2YWxpZGF0b3JzIGFycmF5IGhhcyBhIGdpdmVuIHZhbGlkYXRvci5cbiAqXG4gKiBAcGFyYW0gdmFsaWRhdG9ycyBUaGUgdmFsaWRhdG9yIG9yIHZhbGlkYXRvcnMgdG8gY29tcGFyZSBhZ2FpbnN0LlxuICogQHBhcmFtIHZhbGlkYXRvciBUaGUgdmFsaWRhdG9yIHRvIGNoZWNrLlxuICogQHJldHVybnMgV2hldGhlciB0aGUgdmFsaWRhdG9yIGlzIHByZXNlbnQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBoYXNWYWxpZGF0b3I8VCBleHRlbmRzIFZhbGlkYXRvckZuIHwgQXN5bmNWYWxpZGF0b3JGbj4oXG4gIHZhbGlkYXRvcnM6IFQgfCBUW10gfCBudWxsLFxuICB2YWxpZGF0b3I6IFQsXG4pOiBib29sZWFuIHtcbiAgcmV0dXJuIEFycmF5LmlzQXJyYXkodmFsaWRhdG9ycykgPyB2YWxpZGF0b3JzLmluY2x1ZGVzKHZhbGlkYXRvcikgOiB2YWxpZGF0b3JzID09PSB2YWxpZGF0b3I7XG59XG5cbi8qKlxuICogQ29tYmluZXMgdHdvIGFycmF5cyBvZiB2YWxpZGF0b3JzIGludG8gb25lLiBJZiBkdXBsaWNhdGVzIGFyZSBwcm92aWRlZCwgb25seSBvbmUgd2lsbCBiZSBhZGRlZC5cbiAqXG4gKiBAcGFyYW0gdmFsaWRhdG9ycyBUaGUgbmV3IHZhbGlkYXRvcnMuXG4gKiBAcGFyYW0gY3VycmVudFZhbGlkYXRvcnMgVGhlIGJhc2UgYXJyYXkgb2YgY3VycmVudCB2YWxpZGF0b3JzLlxuICogQHJldHVybnMgQW4gYXJyYXkgb2YgdmFsaWRhdG9ycy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFkZFZhbGlkYXRvcnM8VCBleHRlbmRzIFZhbGlkYXRvckZuIHwgQXN5bmNWYWxpZGF0b3JGbj4oXG4gIHZhbGlkYXRvcnM6IFQgfCBUW10sXG4gIGN1cnJlbnRWYWxpZGF0b3JzOiBUIHwgVFtdIHwgbnVsbCxcbik6IFRbXSB7XG4gIGNvbnN0IGN1cnJlbnQgPSBtYWtlVmFsaWRhdG9yc0FycmF5KGN1cnJlbnRWYWxpZGF0b3JzKTtcbiAgY29uc3QgdmFsaWRhdG9yc1RvQWRkID0gbWFrZVZhbGlkYXRvcnNBcnJheSh2YWxpZGF0b3JzKTtcbiAgdmFsaWRhdG9yc1RvQWRkLmZvckVhY2goKHY6IFQpID0+IHtcbiAgICAvLyBOb3RlOiBpZiB0aGVyZSBhcmUgZHVwbGljYXRlIGVudHJpZXMgaW4gdGhlIG5ldyB2YWxpZGF0b3JzIGFycmF5LFxuICAgIC8vIG9ubHkgdGhlIGZpcnN0IG9uZSB3b3VsZCBiZSBhZGRlZCB0byB0aGUgY3VycmVudCBsaXN0IG9mIHZhbGlkYXRvcnMuXG4gICAgLy8gRHVwbGljYXRlIG9uZXMgd291bGQgYmUgaWdub3JlZCBzaW5jZSBgaGFzVmFsaWRhdG9yYCB3b3VsZCBkZXRlY3RcbiAgICAvLyB0aGUgcHJlc2VuY2Ugb2YgYSB2YWxpZGF0b3IgZnVuY3Rpb24gYW5kIHdlIHVwZGF0ZSB0aGUgY3VycmVudCBsaXN0IGluIHBsYWNlLlxuICAgIGlmICghaGFzVmFsaWRhdG9yKGN1cnJlbnQsIHYpKSB7XG4gICAgICBjdXJyZW50LnB1c2godik7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIGN1cnJlbnQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW1vdmVWYWxpZGF0b3JzPFQgZXh0ZW5kcyBWYWxpZGF0b3JGbiB8IEFzeW5jVmFsaWRhdG9yRm4+KFxuICB2YWxpZGF0b3JzOiBUIHwgVFtdLFxuICBjdXJyZW50VmFsaWRhdG9yczogVCB8IFRbXSB8IG51bGwsXG4pOiBUW10ge1xuICByZXR1cm4gbWFrZVZhbGlkYXRvcnNBcnJheShjdXJyZW50VmFsaWRhdG9ycykuZmlsdGVyKCh2KSA9PiAhaGFzVmFsaWRhdG9yKHZhbGlkYXRvcnMsIHYpKTtcbn1cbiJdfQ==