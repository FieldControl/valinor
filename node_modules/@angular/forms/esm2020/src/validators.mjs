/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { InjectionToken, ɵisObservable as isObservable, ɵisPromise as isPromise, ɵRuntimeError as RuntimeError } from '@angular/core';
import { forkJoin, from } from 'rxjs';
import { map } from 'rxjs/operators';
const NG_DEV_MODE = typeof ngDevMode === 'undefined' || !!ngDevMode;
function isEmptyInputValue(value) {
    /**
     * Check if the object is a string or array before evaluating the length attribute.
     * This avoids falsely rejecting objects that contain a custom length attribute.
     * For example, the object {id: 1, length: 0, width: 0} should not be returned as empty.
     */
    return value == null ||
        ((typeof value === 'string' || Array.isArray(value)) && value.length === 0);
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
 * @see `NG_ASYNC_VALIDATORS`
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
export const NG_VALIDATORS = new InjectionToken('NgValidators');
/**
 * @description
 * An `InjectionToken` for registering additional asynchronous validators used with
 * `AbstractControl`s.
 *
 * @see `NG_VALIDATORS`
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
export const NG_ASYNC_VALIDATORS = new InjectionToken('NgAsyncValidators');
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
 * @see [Form Validation](/guide/form-validation)
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
     * @see `updateValueAndValidity()`
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
     * @see `updateValueAndValidity()`
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
     * @see `updateValueAndValidity()`
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
     * @see `updateValueAndValidity()`
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
     * @see `updateValueAndValidity()`
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
     * @see `updateValueAndValidity()`
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
     * @see `updateValueAndValidity()`
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
     * @see `updateValueAndValidity()`
     *
     */
    static pattern(pattern) {
        return patternValidator(pattern);
    }
    /**
     * @description
     * Validator that performs no operation.
     *
     * @see `updateValueAndValidity()`
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
     * @see `updateValueAndValidity()`
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
        return control.value.length < minLength ?
            { 'minlength': { 'requiredLength': minLength, 'actualLength': control.value.length } } :
            null;
    };
}
/**
 * Validator that requires the length of the control's value to be less than or equal
 * to the provided maximum length. See `Validators.maxLength` for additional information.
 */
export function maxLengthValidator(maxLength) {
    return (control) => {
        return hasValidLength(control.value) && control.value.length > maxLength ?
            { 'maxlength': { 'requiredLength': maxLength, 'actualLength': control.value.length } } :
            null;
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
        return regex.test(value) ? null :
            { 'pattern': { 'requiredPattern': regexStr, 'actualValue': value } };
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
    if (NG_DEV_MODE && !(isObservable(obs))) {
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
    return validators.map(validator => validator(control));
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
    return validators.map(validator => {
        return isValidatorFn(validator) ?
            validator :
            ((c) => validator.validate(c));
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
    return validators != null ? composeAsync(normalizeValidators(validators)) :
        null;
}
/**
 * Merges raw control validators with a given directive validator and returns the combined list of
 * validators as an array.
 */
export function mergeValidators(controlValidators, dirValidator) {
    if (controlValidators === null)
        return [dirValidator];
    return Array.isArray(controlValidators) ? [...controlValidators, dirValidator] :
        [controlValidators, dirValidator];
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
    return makeValidatorsArray(currentValidators).filter(v => !hasValidator(validators, v));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdG9ycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2Zvcm1zL3NyYy92YWxpZGF0b3JzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxjQUFjLEVBQUUsYUFBYSxJQUFJLFlBQVksRUFBRSxVQUFVLElBQUksU0FBUyxFQUFFLGFBQWEsSUFBSSxZQUFZLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDcEksT0FBTyxFQUFDLFFBQVEsRUFBRSxJQUFJLEVBQWEsTUFBTSxNQUFNLENBQUM7QUFDaEQsT0FBTyxFQUFDLEdBQUcsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBTW5DLE1BQU0sV0FBVyxHQUFHLE9BQU8sU0FBUyxLQUFLLFdBQVcsSUFBSSxDQUFDLENBQUMsU0FBUyxDQUFDO0FBRXBFLFNBQVMsaUJBQWlCLENBQUMsS0FBVTtJQUNuQzs7OztPQUlHO0lBQ0gsT0FBTyxLQUFLLElBQUksSUFBSTtRQUNoQixDQUFDLENBQUMsT0FBTyxLQUFLLEtBQUssUUFBUSxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxDQUFDO0FBQ2xGLENBQUM7QUFFRCxTQUFTLGNBQWMsQ0FBQyxLQUFVO0lBQ2hDLHdGQUF3RjtJQUN4RixPQUFPLEtBQUssSUFBSSxJQUFJLElBQUksT0FBTyxLQUFLLENBQUMsTUFBTSxLQUFLLFFBQVEsQ0FBQztBQUMzRCxDQUFDO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQTJCRztBQUNILE1BQU0sQ0FBQyxNQUFNLGFBQWEsR0FBRyxJQUFJLGNBQWMsQ0FBNEIsY0FBYyxDQUFDLENBQUM7QUFFM0Y7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0E0Qkc7QUFDSCxNQUFNLENBQUMsTUFBTSxtQkFBbUIsR0FDNUIsSUFBSSxj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bUIsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsWUFBWSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzFGLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtJbmplY3Rpb25Ub2tlbiwgybVpc09ic2VydmFibGUgYXMgaXNPYnNlcnZhYmxlLCDJtWlzUHJvbWlzZSBhcyBpc1Byb21pc2UsIMm1UnVudGltZUVycm9yIGFzIFJ1bnRpbWVFcnJvcn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge2ZvcmtKb2luLCBmcm9tLCBPYnNlcnZhYmxlfSBmcm9tICdyeGpzJztcbmltcG9ydCB7bWFwfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbmltcG9ydCB7QXN5bmNWYWxpZGF0b3IsIEFzeW5jVmFsaWRhdG9yRm4sIFZhbGlkYXRpb25FcnJvcnMsIFZhbGlkYXRvciwgVmFsaWRhdG9yRm59IGZyb20gJy4vZGlyZWN0aXZlcy92YWxpZGF0b3JzJztcbmltcG9ydCB7UnVudGltZUVycm9yQ29kZX0gZnJvbSAnLi9lcnJvcnMnO1xuaW1wb3J0IHtBYnN0cmFjdENvbnRyb2x9IGZyb20gJy4vbW9kZWwvYWJzdHJhY3RfbW9kZWwnO1xuXG5jb25zdCBOR19ERVZfTU9ERSA9IHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8ICEhbmdEZXZNb2RlO1xuXG5mdW5jdGlvbiBpc0VtcHR5SW5wdXRWYWx1ZSh2YWx1ZTogYW55KTogYm9vbGVhbiB7XG4gIC8qKlxuICAgKiBDaGVjayBpZiB0aGUgb2JqZWN0IGlzIGEgc3RyaW5nIG9yIGFycmF5IGJlZm9yZSBldmFsdWF0aW5nIHRoZSBsZW5ndGggYXR0cmlidXRlLlxuICAgKiBUaGlzIGF2b2lkcyBmYWxzZWx5IHJlamVjdGluZyBvYmplY3RzIHRoYXQgY29udGFpbiBhIGN1c3RvbSBsZW5ndGggYXR0cmlidXRlLlxuICAgKiBGb3IgZXhhbXBsZSwgdGhlIG9iamVjdCB7aWQ6IDEsIGxlbmd0aDogMCwgd2lkdGg6IDB9IHNob3VsZCBub3QgYmUgcmV0dXJuZWQgYXMgZW1wdHkuXG4gICAqL1xuICByZXR1cm4gdmFsdWUgPT0gbnVsbCB8fFxuICAgICAgKCh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnIHx8IEFycmF5LmlzQXJyYXkodmFsdWUpKSAmJiB2YWx1ZS5sZW5ndGggPT09IDApO1xufVxuXG5mdW5jdGlvbiBoYXNWYWxpZExlbmd0aCh2YWx1ZTogYW55KTogYm9vbGVhbiB7XG4gIC8vIG5vbi1zdHJpY3QgY29tcGFyaXNvbiBpcyBpbnRlbnRpb25hbCwgdG8gY2hlY2sgZm9yIGJvdGggYG51bGxgIGFuZCBgdW5kZWZpbmVkYCB2YWx1ZXNcbiAgcmV0dXJuIHZhbHVlICE9IG51bGwgJiYgdHlwZW9mIHZhbHVlLmxlbmd0aCA9PT0gJ251bWJlcic7XG59XG5cbi8qKlxuICogQGRlc2NyaXB0aW9uXG4gKiBBbiBgSW5qZWN0aW9uVG9rZW5gIGZvciByZWdpc3RlcmluZyBhZGRpdGlvbmFsIHN5bmNocm9ub3VzIHZhbGlkYXRvcnMgdXNlZCB3aXRoXG4gKiBgQWJzdHJhY3RDb250cm9sYHMuXG4gKlxuICogQHNlZSBgTkdfQVNZTkNfVkFMSURBVE9SU2BcbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICpcbiAqICMjIyBQcm92aWRpbmcgYSBjdXN0b20gdmFsaWRhdG9yXG4gKlxuICogVGhlIGZvbGxvd2luZyBleGFtcGxlIHJlZ2lzdGVycyBhIGN1c3RvbSB2YWxpZGF0b3IgZGlyZWN0aXZlLiBBZGRpbmcgdGhlIHZhbGlkYXRvciB0byB0aGVcbiAqIGV4aXN0aW5nIGNvbGxlY3Rpb24gb2YgdmFsaWRhdG9ycyByZXF1aXJlcyB0aGUgYG11bHRpOiB0cnVlYCBvcHRpb24uXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogQERpcmVjdGl2ZSh7XG4gKiAgIHNlbGVjdG9yOiAnW2N1c3RvbVZhbGlkYXRvcl0nLFxuICogICBwcm92aWRlcnM6IFt7cHJvdmlkZTogTkdfVkFMSURBVE9SUywgdXNlRXhpc3Rpbmc6IEN1c3RvbVZhbGlkYXRvckRpcmVjdGl2ZSwgbXVsdGk6IHRydWV9XVxuICogfSlcbiAqIGNsYXNzIEN1c3RvbVZhbGlkYXRvckRpcmVjdGl2ZSBpbXBsZW1lbnRzIFZhbGlkYXRvciB7XG4gKiAgIHZhbGlkYXRlKGNvbnRyb2w6IEFic3RyYWN0Q29udHJvbCk6IFZhbGlkYXRpb25FcnJvcnMgfCBudWxsIHtcbiAqICAgICByZXR1cm4geyAnY3VzdG9tJzogdHJ1ZSB9O1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjb25zdCBOR19WQUxJREFUT1JTID0gbmV3IEluamVjdGlvblRva2VuPEFycmF5PFZhbGlkYXRvcnxGdW5jdGlvbj4+KCdOZ1ZhbGlkYXRvcnMnKTtcblxuLyoqXG4gKiBAZGVzY3JpcHRpb25cbiAqIEFuIGBJbmplY3Rpb25Ub2tlbmAgZm9yIHJlZ2lzdGVyaW5nIGFkZGl0aW9uYWwgYXN5bmNocm9ub3VzIHZhbGlkYXRvcnMgdXNlZCB3aXRoXG4gKiBgQWJzdHJhY3RDb250cm9sYHMuXG4gKlxuICogQHNlZSBgTkdfVkFMSURBVE9SU2BcbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICpcbiAqICMjIyBQcm92aWRlIGEgY3VzdG9tIGFzeW5jIHZhbGlkYXRvciBkaXJlY3RpdmVcbiAqXG4gKiBUaGUgZm9sbG93aW5nIGV4YW1wbGUgaW1wbGVtZW50cyB0aGUgYEFzeW5jVmFsaWRhdG9yYCBpbnRlcmZhY2UgdG8gY3JlYXRlIGFuXG4gKiBhc3luYyB2YWxpZGF0b3IgZGlyZWN0aXZlIHdpdGggYSBjdXN0b20gZXJyb3Iga2V5LlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIEBEaXJlY3RpdmUoe1xuICogICBzZWxlY3RvcjogJ1tjdXN0b21Bc3luY1ZhbGlkYXRvcl0nLFxuICogICBwcm92aWRlcnM6IFt7cHJvdmlkZTogTkdfQVNZTkNfVkFMSURBVE9SUywgdXNlRXhpc3Rpbmc6IEN1c3RvbUFzeW5jVmFsaWRhdG9yRGlyZWN0aXZlLCBtdWx0aTpcbiAqIHRydWV9XVxuICogfSlcbiAqIGNsYXNzIEN1c3RvbUFzeW5jVmFsaWRhdG9yRGlyZWN0aXZlIGltcGxlbWVudHMgQXN5bmNWYWxpZGF0b3Ige1xuICogICB2YWxpZGF0ZShjb250cm9sOiBBYnN0cmFjdENvbnRyb2wpOiBQcm9taXNlPFZhbGlkYXRpb25FcnJvcnN8bnVsbD4ge1xuICogICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoeydjdXN0b20nOiB0cnVlfSk7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNvbnN0IE5HX0FTWU5DX1ZBTElEQVRPUlMgPVxuICAgIG5ldyBJbmplY3Rpb25Ub2tlbjxBcnJheTxWYWxpZGF0b3J8RnVuY3Rpb24+PignTmdBc3luY1ZhbGlkYXRvcnMnKTtcblxuLyoqXG4gKiBBIHJlZ3VsYXIgZXhwcmVzc2lvbiB0aGF0IG1hdGNoZXMgdmFsaWQgZS1tYWlsIGFkZHJlc3Nlcy5cbiAqXG4gKiBBdCBhIGhpZ2ggbGV2ZWwsIHRoaXMgcmVnZXhwIG1hdGNoZXMgZS1tYWlsIGFkZHJlc3NlcyBvZiB0aGUgZm9ybWF0IGBsb2NhbC1wYXJ0QHRsZGAsIHdoZXJlOlxuICogLSBgbG9jYWwtcGFydGAgY29uc2lzdHMgb2Ygb25lIG9yIG1vcmUgb2YgdGhlIGFsbG93ZWQgY2hhcmFjdGVycyAoYWxwaGFudW1lcmljIGFuZCBzb21lXG4gKiAgIHB1bmN0dWF0aW9uIHN5bWJvbHMpLlxuICogLSBgbG9jYWwtcGFydGAgY2Fubm90IGJlZ2luIG9yIGVuZCB3aXRoIGEgcGVyaW9kIChgLmApLlxuICogLSBgbG9jYWwtcGFydGAgY2Fubm90IGJlIGxvbmdlciB0aGFuIDY0IGNoYXJhY3RlcnMuXG4gKiAtIGB0bGRgIGNvbnNpc3RzIG9mIG9uZSBvciBtb3JlIGBsYWJlbHNgIHNlcGFyYXRlZCBieSBwZXJpb2RzIChgLmApLiBGb3IgZXhhbXBsZSBgbG9jYWxob3N0YCBvclxuICogICBgZm9vLmNvbWAuXG4gKiAtIEEgYGxhYmVsYCBjb25zaXN0cyBvZiBvbmUgb3IgbW9yZSBvZiB0aGUgYWxsb3dlZCBjaGFyYWN0ZXJzIChhbHBoYW51bWVyaWMsIGRhc2hlcyAoYC1gKSBhbmRcbiAqICAgcGVyaW9kcyAoYC5gKSkuXG4gKiAtIEEgYGxhYmVsYCBjYW5ub3QgYmVnaW4gb3IgZW5kIHdpdGggYSBkYXNoIChgLWApIG9yIGEgcGVyaW9kIChgLmApLlxuICogLSBBIGBsYWJlbGAgY2Fubm90IGJlIGxvbmdlciB0aGFuIDYzIGNoYXJhY3RlcnMuXG4gKiAtIFRoZSB3aG9sZSBhZGRyZXNzIGNhbm5vdCBiZSBsb25nZXIgdGhhbiAyNTQgY2hhcmFjdGVycy5cbiAqXG4gKiAjIyBJbXBsZW1lbnRhdGlvbiBiYWNrZ3JvdW5kXG4gKlxuICogVGhpcyByZWdleHAgd2FzIHBvcnRlZCBvdmVyIGZyb20gQW5ndWxhckpTIChzZWUgdGhlcmUgZm9yIGdpdCBoaXN0b3J5KTpcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIuanMvYmxvYi9jMTMzZWY4MzYvc3JjL25nL2RpcmVjdGl2ZS9pbnB1dC5qcyNMMjdcbiAqIEl0IGlzIGJhc2VkIG9uIHRoZVxuICogW1dIQVRXRyB2ZXJzaW9uXShodHRwczovL2h0bWwuc3BlYy53aGF0d2cub3JnL211bHRpcGFnZS9pbnB1dC5odG1sI3ZhbGlkLWUtbWFpbC1hZGRyZXNzKSB3aXRoXG4gKiBzb21lIGVuaGFuY2VtZW50cyB0byBpbmNvcnBvcmF0ZSBtb3JlIFJGQyBydWxlcyAoc3VjaCBhcyBydWxlcyByZWxhdGVkIHRvIGRvbWFpbiBuYW1lcyBhbmQgdGhlXG4gKiBsZW5ndGhzIG9mIGRpZmZlcmVudCBwYXJ0cyBvZiB0aGUgYWRkcmVzcykuIFRoZSBtYWluIGRpZmZlcmVuY2VzIGZyb20gdGhlIFdIQVRXRyB2ZXJzaW9uIGFyZTpcbiAqICAgLSBEaXNhbGxvdyBgbG9jYWwtcGFydGAgdG8gYmVnaW4gb3IgZW5kIHdpdGggYSBwZXJpb2QgKGAuYCkuXG4gKiAgIC0gRGlzYWxsb3cgYGxvY2FsLXBhcnRgIGxlbmd0aCB0byBleGNlZWQgNjQgY2hhcmFjdGVycy5cbiAqICAgLSBEaXNhbGxvdyB0b3RhbCBhZGRyZXNzIGxlbmd0aCB0byBleGNlZWQgMjU0IGNoYXJhY3RlcnMuXG4gKlxuICogU2VlIFt0aGlzIGNvbW1pdF0oaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci5qcy9jb21taXQvZjNmNWNmNzJlKSBmb3IgbW9yZSBkZXRhaWxzLlxuICovXG5jb25zdCBFTUFJTF9SRUdFWFAgPVxuICAgIC9eKD89LnsxLDI1NH0kKSg/PS57MSw2NH1AKVthLXpBLVowLTkhIyQlJicqKy89P15fYHt8fX4tXSsoPzpcXC5bYS16QS1aMC05ISMkJSYnKisvPT9eX2B7fH1+LV0rKSpAW2EtekEtWjAtOV0oPzpbYS16QS1aMC05LV17MCw2MX1bYS16QS1aMC05XSk/KD86XFwuW2EtekEtWjAtOV0oPzpbYS16QS1aMC05LV17MCw2MX1bYS16QS1aMC05XSk/KSokLztcblxuLyoqXG4gKiBAZGVzY3JpcHRpb25cbiAqIFByb3ZpZGVzIGEgc2V0IG9mIGJ1aWx0LWluIHZhbGlkYXRvcnMgdGhhdCBjYW4gYmUgdXNlZCBieSBmb3JtIGNvbnRyb2xzLlxuICpcbiAqIEEgdmFsaWRhdG9yIGlzIGEgZnVuY3Rpb24gdGhhdCBwcm9jZXNzZXMgYSBgRm9ybUNvbnRyb2xgIG9yIGNvbGxlY3Rpb24gb2ZcbiAqIGNvbnRyb2xzIGFuZCByZXR1cm5zIGFuIGVycm9yIG1hcCBvciBudWxsLiBBIG51bGwgbWFwIG1lYW5zIHRoYXQgdmFsaWRhdGlvbiBoYXMgcGFzc2VkLlxuICpcbiAqIEBzZWUgW0Zvcm0gVmFsaWRhdGlvbl0oL2d1aWRlL2Zvcm0tdmFsaWRhdGlvbilcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjbGFzcyBWYWxpZGF0b3JzIHtcbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBWYWxpZGF0b3IgdGhhdCByZXF1aXJlcyB0aGUgY29udHJvbCdzIHZhbHVlIHRvIGJlIGdyZWF0ZXIgdGhhbiBvciBlcXVhbCB0byB0aGUgcHJvdmlkZWQgbnVtYmVyLlxuICAgKlxuICAgKiBAdXNhZ2VOb3Rlc1xuICAgKlxuICAgKiAjIyMgVmFsaWRhdGUgYWdhaW5zdCBhIG1pbmltdW0gb2YgM1xuICAgKlxuICAgKiBgYGB0eXBlc2NyaXB0XG4gICAqIGNvbnN0IGNvbnRyb2wgPSBuZXcgRm9ybUNvbnRyb2woMiwgVmFsaWRhdG9ycy5taW4oMykpO1xuICAgKlxuICAgKiBjb25zb2xlLmxvZyhjb250cm9sLmVycm9ycyk7IC8vIHttaW46IHttaW46IDMsIGFjdHVhbDogMn19XG4gICAqIGBgYFxuICAgKlxuICAgKiBAcmV0dXJucyBBIHZhbGlkYXRvciBmdW5jdGlvbiB0aGF0IHJldHVybnMgYW4gZXJyb3IgbWFwIHdpdGggdGhlXG4gICAqIGBtaW5gIHByb3BlcnR5IGlmIHRoZSB2YWxpZGF0aW9uIGNoZWNrIGZhaWxzLCBvdGhlcndpc2UgYG51bGxgLlxuICAgKlxuICAgKiBAc2VlIGB1cGRhdGVWYWx1ZUFuZFZhbGlkaXR5KClgXG4gICAqXG4gICAqL1xuICBzdGF0aWMgbWluKG1pbjogbnVtYmVyKTogVmFsaWRhdG9yRm4ge1xuICAgIHJldHVybiBtaW5WYWxpZGF0b3IobWluKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogVmFsaWRhdG9yIHRoYXQgcmVxdWlyZXMgdGhlIGNvbnRyb2wncyB2YWx1ZSB0byBiZSBsZXNzIHRoYW4gb3IgZXF1YWwgdG8gdGhlIHByb3ZpZGVkIG51bWJlci5cbiAgICpcbiAgICogQHVzYWdlTm90ZXNcbiAgICpcbiAgICogIyMjIFZhbGlkYXRlIGFnYWluc3QgYSBtYXhpbXVtIG9mIDE1XG4gICAqXG4gICAqIGBgYHR5cGVzY3JpcHRcbiAgICogY29uc3QgY29udHJvbCA9IG5ldyBGb3JtQ29udHJvbCgxNiwgVmFsaWRhdG9ycy5tYXgoMTUpKTtcbiAgICpcbiAgICogY29uc29sZS5sb2coY29udHJvbC5lcnJvcnMpOyAvLyB7bWF4OiB7bWF4OiAxNSwgYWN0dWFsOiAxNn19XG4gICAqIGBgYFxuICAgKlxuICAgKiBAcmV0dXJucyBBIHZhbGlkYXRvciBmdW5jdGlvbiB0aGF0IHJldHVybnMgYW4gZXJyb3IgbWFwIHdpdGggdGhlXG4gICAqIGBtYXhgIHByb3BlcnR5IGlmIHRoZSB2YWxpZGF0aW9uIGNoZWNrIGZhaWxzLCBvdGhlcndpc2UgYG51bGxgLlxuICAgKlxuICAgKiBAc2VlIGB1cGRhdGVWYWx1ZUFuZFZhbGlkaXR5KClgXG4gICAqXG4gICAqL1xuICBzdGF0aWMgbWF4KG1heDogbnVtYmVyKTogVmFsaWRhdG9yRm4ge1xuICAgIHJldHVybiBtYXhWYWxpZGF0b3IobWF4KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogVmFsaWRhdG9yIHRoYXQgcmVxdWlyZXMgdGhlIGNvbnRyb2wgaGF2ZSBhIG5vbi1lbXB0eSB2YWx1ZS5cbiAgICpcbiAgICogQHVzYWdlTm90ZXNcbiAgICpcbiAgICogIyMjIFZhbGlkYXRlIHRoYXQgdGhlIGZpZWxkIGlzIG5vbi1lbXB0eVxuICAgKlxuICAgKiBgYGB0eXBlc2NyaXB0XG4gICAqIGNvbnN0IGNvbnRyb2wgPSBuZXcgRm9ybUNvbnRyb2woJycsIFZhbGlkYXRvcnMucmVxdWlyZWQpO1xuICAgKlxuICAgKiBjb25zb2xlLmxvZyhjb250cm9sLmVycm9ycyk7IC8vIHtyZXF1aXJlZDogdHJ1ZX1cbiAgICogYGBgXG4gICAqXG4gICAqIEByZXR1cm5zIEFuIGVycm9yIG1hcCB3aXRoIHRoZSBgcmVxdWlyZWRgIHByb3BlcnR5XG4gICAqIGlmIHRoZSB2YWxpZGF0aW9uIGNoZWNrIGZhaWxzLCBvdGhlcndpc2UgYG51bGxgLlxuICAgKlxuICAgKiBAc2VlIGB1cGRhdGVWYWx1ZUFuZFZhbGlkaXR5KClgXG4gICAqXG4gICAqL1xuICBzdGF0aWMgcmVxdWlyZWQoY29udHJvbDogQWJzdHJhY3RDb250cm9sKTogVmFsaWRhdGlvbkVycm9yc3xudWxsIHtcbiAgICByZXR1cm4gcmVxdWlyZWRWYWxpZGF0b3IoY29udHJvbCk7XG4gIH1cblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIFZhbGlkYXRvciB0aGF0IHJlcXVpcmVzIHRoZSBjb250cm9sJ3MgdmFsdWUgYmUgdHJ1ZS4gVGhpcyB2YWxpZGF0b3IgaXMgY29tbW9ubHlcbiAgICogdXNlZCBmb3IgcmVxdWlyZWQgY2hlY2tib3hlcy5cbiAgICpcbiAgICogQHVzYWdlTm90ZXNcbiAgICpcbiAgICogIyMjIFZhbGlkYXRlIHRoYXQgdGhlIGZpZWxkIHZhbHVlIGlzIHRydWVcbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiBjb25zdCBjb250cm9sID0gbmV3IEZvcm1Db250cm9sKCdzb21lIHZhbHVlJywgVmFsaWRhdG9ycy5yZXF1aXJlZFRydWUpO1xuICAgKlxuICAgKiBjb25zb2xlLmxvZyhjb250cm9sLmVycm9ycyk7IC8vIHtyZXF1aXJlZDogdHJ1ZX1cbiAgICogYGBgXG4gICAqXG4gICAqIEByZXR1cm5zIEFuIGVycm9yIG1hcCB0aGF0IGNvbnRhaW5zIHRoZSBgcmVxdWlyZWRgIHByb3BlcnR5XG4gICAqIHNldCB0byBgdHJ1ZWAgaWYgdGhlIHZhbGlkYXRpb24gY2hlY2sgZmFpbHMsIG90aGVyd2lzZSBgbnVsbGAuXG4gICAqXG4gICAqIEBzZWUgYHVwZGF0ZVZhbHVlQW5kVmFsaWRpdHkoKWBcbiAgICpcbiAgICovXG4gIHN0YXRpYyByZXF1aXJlZFRydWUoY29udHJvbDogQWJzdHJhY3RDb250cm9sKTogVmFsaWRhdGlvbkVycm9yc3xudWxsIHtcbiAgICByZXR1cm4gcmVxdWlyZWRUcnVlVmFsaWRhdG9yKGNvbnRyb2wpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBWYWxpZGF0b3IgdGhhdCByZXF1aXJlcyB0aGUgY29udHJvbCdzIHZhbHVlIHBhc3MgYW4gZW1haWwgdmFsaWRhdGlvbiB0ZXN0LlxuICAgKlxuICAgKiBUZXN0cyB0aGUgdmFsdWUgdXNpbmcgYSBbcmVndWxhclxuICAgKiBleHByZXNzaW9uXShodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L0d1aWRlL1JlZ3VsYXJfRXhwcmVzc2lvbnMpXG4gICAqIHBhdHRlcm4gc3VpdGFibGUgZm9yIGNvbW1vbiB1c2UgY2FzZXMuIFRoZSBwYXR0ZXJuIGlzIGJhc2VkIG9uIHRoZSBkZWZpbml0aW9uIG9mIGEgdmFsaWQgZW1haWxcbiAgICogYWRkcmVzcyBpbiB0aGUgW1dIQVRXRyBIVE1MXG4gICAqIHNwZWNpZmljYXRpb25dKGh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL2lucHV0Lmh0bWwjdmFsaWQtZS1tYWlsLWFkZHJlc3MpIHdpdGhcbiAgICogc29tZSBlbmhhbmNlbWVudHMgdG8gaW5jb3Jwb3JhdGUgbW9yZSBSRkMgcnVsZXMgKHN1Y2ggYXMgcnVsZXMgcmVsYXRlZCB0byBkb21haW4gbmFtZXMgYW5kIHRoZVxuICAgKiBsZW5ndGhzIG9mIGRpZmZlcmVudCBwYXJ0cyBvZiB0aGUgYWRkcmVzcykuXG4gICAqXG4gICAqIFRoZSBkaWZmZXJlbmNlcyBmcm9tIHRoZSBXSEFUV0cgdmVyc2lvbiBpbmNsdWRlOlxuICAgKiAtIERpc2FsbG93IGBsb2NhbC1wYXJ0YCAodGhlIHBhcnQgYmVmb3JlIHRoZSBgQGAgc3ltYm9sKSB0byBiZWdpbiBvciBlbmQgd2l0aCBhIHBlcmlvZCAoYC5gKS5cbiAgICogLSBEaXNhbGxvdyBgbG9jYWwtcGFydGAgdG8gYmUgbG9uZ2VyIHRoYW4gNjQgY2hhcmFjdGVycy5cbiAgICogLSBEaXNhbGxvdyB0aGUgd2hvbGUgYWRkcmVzcyB0byBiZSBsb25nZXIgdGhhbiAyNTQgY2hhcmFjdGVycy5cbiAgICpcbiAgICogSWYgdGhpcyBwYXR0ZXJuIGRvZXMgbm90IHNhdGlzZnkgeW91ciBidXNpbmVzcyBuZWVkcywgeW91IGNhbiB1c2UgYFZhbGlkYXRvcnMucGF0dGVybigpYCB0b1xuICAgKiB2YWxpZGF0ZSB0aGUgdmFsdWUgYWdhaW5zdCBhIGRpZmZlcmVudCBwYXR0ZXJuLlxuICAgKlxuICAgKiBAdXNhZ2VOb3Rlc1xuICAgKlxuICAgKiAjIyMgVmFsaWRhdGUgdGhhdCB0aGUgZmllbGQgbWF0Y2hlcyBhIHZhbGlkIGVtYWlsIHBhdHRlcm5cbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiBjb25zdCBjb250cm9sID0gbmV3IEZvcm1Db250cm9sKCdiYWRAJywgVmFsaWRhdG9ycy5lbWFpbCk7XG4gICAqXG4gICAqIGNvbnNvbGUubG9nKGNvbnRyb2wuZXJyb3JzKTsgLy8ge2VtYWlsOiB0cnVlfVxuICAgKiBgYGBcbiAgICpcbiAgICogQHJldHVybnMgQW4gZXJyb3IgbWFwIHdpdGggdGhlIGBlbWFpbGAgcHJvcGVydHlcbiAgICogaWYgdGhlIHZhbGlkYXRpb24gY2hlY2sgZmFpbHMsIG90aGVyd2lzZSBgbnVsbGAuXG4gICAqXG4gICAqIEBzZWUgYHVwZGF0ZVZhbHVlQW5kVmFsaWRpdHkoKWBcbiAgICpcbiAgICovXG4gIHN0YXRpYyBlbWFpbChjb250cm9sOiBBYnN0cmFjdENvbnRyb2wpOiBWYWxpZGF0aW9uRXJyb3JzfG51bGwge1xuICAgIHJldHVybiBlbWFpbFZhbGlkYXRvcihjb250cm9sKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogVmFsaWRhdG9yIHRoYXQgcmVxdWlyZXMgdGhlIGxlbmd0aCBvZiB0aGUgY29udHJvbCdzIHZhbHVlIHRvIGJlIGdyZWF0ZXIgdGhhbiBvciBlcXVhbFxuICAgKiB0byB0aGUgcHJvdmlkZWQgbWluaW11bSBsZW5ndGguIFRoaXMgdmFsaWRhdG9yIGlzIGFsc28gcHJvdmlkZWQgYnkgZGVmYXVsdCBpZiB5b3UgdXNlIHRoZVxuICAgKiB0aGUgSFRNTDUgYG1pbmxlbmd0aGAgYXR0cmlidXRlLiBOb3RlIHRoYXQgdGhlIGBtaW5MZW5ndGhgIHZhbGlkYXRvciBpcyBpbnRlbmRlZCB0byBiZSB1c2VkXG4gICAqIG9ubHkgZm9yIHR5cGVzIHRoYXQgaGF2ZSBhIG51bWVyaWMgYGxlbmd0aGAgcHJvcGVydHksIHN1Y2ggYXMgc3RyaW5ncyBvciBhcnJheXMuIFRoZVxuICAgKiBgbWluTGVuZ3RoYCB2YWxpZGF0b3IgbG9naWMgaXMgYWxzbyBub3QgaW52b2tlZCBmb3IgdmFsdWVzIHdoZW4gdGhlaXIgYGxlbmd0aGAgcHJvcGVydHkgaXMgMFxuICAgKiAoZm9yIGV4YW1wbGUgaW4gY2FzZSBvZiBhbiBlbXB0eSBzdHJpbmcgb3IgYW4gZW1wdHkgYXJyYXkpLCB0byBzdXBwb3J0IG9wdGlvbmFsIGNvbnRyb2xzLiBZb3VcbiAgICogY2FuIHVzZSB0aGUgc3RhbmRhcmQgYHJlcXVpcmVkYCB2YWxpZGF0b3IgaWYgZW1wdHkgdmFsdWVzIHNob3VsZCBub3QgYmUgY29uc2lkZXJlZCB2YWxpZC5cbiAgICpcbiAgICogQHVzYWdlTm90ZXNcbiAgICpcbiAgICogIyMjIFZhbGlkYXRlIHRoYXQgdGhlIGZpZWxkIGhhcyBhIG1pbmltdW0gb2YgMyBjaGFyYWN0ZXJzXG4gICAqXG4gICAqIGBgYHR5cGVzY3JpcHRcbiAgICogY29uc3QgY29udHJvbCA9IG5ldyBGb3JtQ29udHJvbCgnbmcnLCBWYWxpZGF0b3JzLm1pbkxlbmd0aCgzKSk7XG4gICAqXG4gICAqIGNvbnNvbGUubG9nKGNvbnRyb2wuZXJyb3JzKTsgLy8ge21pbmxlbmd0aDoge3JlcXVpcmVkTGVuZ3RoOiAzLCBhY3R1YWxMZW5ndGg6IDJ9fVxuICAgKiBgYGBcbiAgICpcbiAgICogYGBgaHRtbFxuICAgKiA8aW5wdXQgbWlubGVuZ3RoPVwiNVwiPlxuICAgKiBgYGBcbiAgICpcbiAgICogQHJldHVybnMgQSB2YWxpZGF0b3IgZnVuY3Rpb24gdGhhdCByZXR1cm5zIGFuIGVycm9yIG1hcCB3aXRoIHRoZVxuICAgKiBgbWlubGVuZ3RoYCBwcm9wZXJ0eSBpZiB0aGUgdmFsaWRhdGlvbiBjaGVjayBmYWlscywgb3RoZXJ3aXNlIGBudWxsYC5cbiAgICpcbiAgICogQHNlZSBgdXBkYXRlVmFsdWVBbmRWYWxpZGl0eSgpYFxuICAgKlxuICAgKi9cbiAgc3RhdGljIG1pbkxlbmd0aChtaW5MZW5ndGg6IG51bWJlcik6IFZhbGlkYXRvckZuIHtcbiAgICByZXR1cm4gbWluTGVuZ3RoVmFsaWRhdG9yKG1pbkxlbmd0aCk7XG4gIH1cblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIFZhbGlkYXRvciB0aGF0IHJlcXVpcmVzIHRoZSBsZW5ndGggb2YgdGhlIGNvbnRyb2wncyB2YWx1ZSB0byBiZSBsZXNzIHRoYW4gb3IgZXF1YWxcbiAgICogdG8gdGhlIHByb3ZpZGVkIG1heGltdW0gbGVuZ3RoLiBUaGlzIHZhbGlkYXRvciBpcyBhbHNvIHByb3ZpZGVkIGJ5IGRlZmF1bHQgaWYgeW91IHVzZSB0aGVcbiAgICogdGhlIEhUTUw1IGBtYXhsZW5ndGhgIGF0dHJpYnV0ZS4gTm90ZSB0aGF0IHRoZSBgbWF4TGVuZ3RoYCB2YWxpZGF0b3IgaXMgaW50ZW5kZWQgdG8gYmUgdXNlZFxuICAgKiBvbmx5IGZvciB0eXBlcyB0aGF0IGhhdmUgYSBudW1lcmljIGBsZW5ndGhgIHByb3BlcnR5LCBzdWNoIGFzIHN0cmluZ3Mgb3IgYXJyYXlzLlxuICAgKlxuICAgKiBAdXNhZ2VOb3Rlc1xuICAgKlxuICAgKiAjIyMgVmFsaWRhdGUgdGhhdCB0aGUgZmllbGQgaGFzIG1heGltdW0gb2YgNSBjaGFyYWN0ZXJzXG4gICAqXG4gICAqIGBgYHR5cGVzY3JpcHRcbiAgICogY29uc3QgY29udHJvbCA9IG5ldyBGb3JtQ29udHJvbCgnQW5ndWxhcicsIFZhbGlkYXRvcnMubWF4TGVuZ3RoKDUpKTtcbiAgICpcbiAgICogY29uc29sZS5sb2coY29udHJvbC5lcnJvcnMpOyAvLyB7bWF4bGVuZ3RoOiB7cmVxdWlyZWRMZW5ndGg6IDUsIGFjdHVhbExlbmd0aDogN319XG4gICAqIGBgYFxuICAgKlxuICAgKiBgYGBodG1sXG4gICAqIDxpbnB1dCBtYXhsZW5ndGg9XCI1XCI+XG4gICAqIGBgYFxuICAgKlxuICAgKiBAcmV0dXJucyBBIHZhbGlkYXRvciBmdW5jdGlvbiB0aGF0IHJldHVybnMgYW4gZXJyb3IgbWFwIHdpdGggdGhlXG4gICAqIGBtYXhsZW5ndGhgIHByb3BlcnR5IGlmIHRoZSB2YWxpZGF0aW9uIGNoZWNrIGZhaWxzLCBvdGhlcndpc2UgYG51bGxgLlxuICAgKlxuICAgKiBAc2VlIGB1cGRhdGVWYWx1ZUFuZFZhbGlkaXR5KClgXG4gICAqXG4gICAqL1xuICBzdGF0aWMgbWF4TGVuZ3RoKG1heExlbmd0aDogbnVtYmVyKTogVmFsaWRhdG9yRm4ge1xuICAgIHJldHVybiBtYXhMZW5ndGhWYWxpZGF0b3IobWF4TGVuZ3RoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogVmFsaWRhdG9yIHRoYXQgcmVxdWlyZXMgdGhlIGNvbnRyb2wncyB2YWx1ZSB0byBtYXRjaCBhIHJlZ2V4IHBhdHRlcm4uIFRoaXMgdmFsaWRhdG9yIGlzIGFsc29cbiAgICogcHJvdmlkZWQgYnkgZGVmYXVsdCBpZiB5b3UgdXNlIHRoZSBIVE1MNSBgcGF0dGVybmAgYXR0cmlidXRlLlxuICAgKlxuICAgKiBAdXNhZ2VOb3Rlc1xuICAgKlxuICAgKiAjIyMgVmFsaWRhdGUgdGhhdCB0aGUgZmllbGQgb25seSBjb250YWlucyBsZXR0ZXJzIG9yIHNwYWNlc1xuICAgKlxuICAgKiBgYGB0eXBlc2NyaXB0XG4gICAqIGNvbnN0IGNvbnRyb2wgPSBuZXcgRm9ybUNvbnRyb2woJzEnLCBWYWxpZGF0b3JzLnBhdHRlcm4oJ1thLXpBLVogXSonKSk7XG4gICAqXG4gICAqIGNvbnNvbGUubG9nKGNvbnRyb2wuZXJyb3JzKTsgLy8ge3BhdHRlcm46IHtyZXF1aXJlZFBhdHRlcm46ICdeW2EtekEtWiBdKiQnLCBhY3R1YWxWYWx1ZTogJzEnfX1cbiAgICogYGBgXG4gICAqXG4gICAqIGBgYGh0bWxcbiAgICogPGlucHV0IHBhdHRlcm49XCJbYS16QS1aIF0qXCI+XG4gICAqIGBgYFxuICAgKlxuICAgKiAjIyMgUGF0dGVybiBtYXRjaGluZyB3aXRoIHRoZSBnbG9iYWwgb3Igc3RpY2t5IGZsYWdcbiAgICpcbiAgICogYFJlZ0V4cGAgb2JqZWN0cyBjcmVhdGVkIHdpdGggdGhlIGBnYCBvciBgeWAgZmxhZ3MgdGhhdCBhcmUgcGFzc2VkIGludG8gYFZhbGlkYXRvcnMucGF0dGVybmBcbiAgICogY2FuIHByb2R1Y2UgZGlmZmVyZW50IHJlc3VsdHMgb24gdGhlIHNhbWUgaW5wdXQgd2hlbiB2YWxpZGF0aW9ucyBhcmUgcnVuIGNvbnNlY3V0aXZlbHkuIFRoaXMgaXNcbiAgICogZHVlIHRvIGhvdyB0aGUgYmVoYXZpb3Igb2YgYFJlZ0V4cC5wcm90b3R5cGUudGVzdGAgaXNcbiAgICogc3BlY2lmaWVkIGluIFtFQ01BLTI2Ml0oaHR0cHM6Ly90YzM5LmVzL2VjbWEyNjIvI3NlYy1yZWdleHBidWlsdGluZXhlYylcbiAgICogKGBSZWdFeHBgIHByZXNlcnZlcyB0aGUgaW5kZXggb2YgdGhlIGxhc3QgbWF0Y2ggd2hlbiB0aGUgZ2xvYmFsIG9yIHN0aWNreSBmbGFnIGlzIHVzZWQpLlxuICAgKiBEdWUgdG8gdGhpcyBiZWhhdmlvciwgaXQgaXMgcmVjb21tZW5kZWQgdGhhdCB3aGVuIHVzaW5nXG4gICAqIGBWYWxpZGF0b3JzLnBhdHRlcm5gIHlvdSAqKmRvIG5vdCoqIHBhc3MgaW4gYSBgUmVnRXhwYCBvYmplY3Qgd2l0aCBlaXRoZXIgdGhlIGdsb2JhbCBvciBzdGlja3lcbiAgICogZmxhZyBlbmFibGVkLlxuICAgKlxuICAgKiBgYGB0eXBlc2NyaXB0XG4gICAqIC8vIE5vdCByZWNvbW1lbmRlZCAoc2luY2UgdGhlIGBnYCBmbGFnIGlzIHVzZWQpXG4gICAqIGNvbnN0IGNvbnRyb2xPbmUgPSBuZXcgRm9ybUNvbnRyb2woJzEnLCBWYWxpZGF0b3JzLnBhdHRlcm4oL2Zvby9nKSk7XG4gICAqXG4gICAqIC8vIEdvb2RcbiAgICogY29uc3QgY29udHJvbFR3byA9IG5ldyBGb3JtQ29udHJvbCgnMScsIFZhbGlkYXRvcnMucGF0dGVybigvZm9vLykpO1xuICAgKiBgYGBcbiAgICpcbiAgICogQHBhcmFtIHBhdHRlcm4gQSByZWd1bGFyIGV4cHJlc3Npb24gdG8gYmUgdXNlZCBhcyBpcyB0byB0ZXN0IHRoZSB2YWx1ZXMsIG9yIGEgc3RyaW5nLlxuICAgKiBJZiBhIHN0cmluZyBpcyBwYXNzZWQsIHRoZSBgXmAgY2hhcmFjdGVyIGlzIHByZXBlbmRlZCBhbmQgdGhlIGAkYCBjaGFyYWN0ZXIgaXNcbiAgICogYXBwZW5kZWQgdG8gdGhlIHByb3ZpZGVkIHN0cmluZyAoaWYgbm90IGFscmVhZHkgcHJlc2VudCksIGFuZCB0aGUgcmVzdWx0aW5nIHJlZ3VsYXJcbiAgICogZXhwcmVzc2lvbiBpcyB1c2VkIHRvIHRlc3QgdGhlIHZhbHVlcy5cbiAgICpcbiAgICogQHJldHVybnMgQSB2YWxpZGF0b3IgZnVuY3Rpb24gdGhhdCByZXR1cm5zIGFuIGVycm9yIG1hcCB3aXRoIHRoZVxuICAgKiBgcGF0dGVybmAgcHJvcGVydHkgaWYgdGhlIHZhbGlkYXRpb24gY2hlY2sgZmFpbHMsIG90aGVyd2lzZSBgbnVsbGAuXG4gICAqXG4gICAqIEBzZWUgYHVwZGF0ZVZhbHVlQW5kVmFsaWRpdHkoKWBcbiAgICpcbiAgICovXG4gIHN0YXRpYyBwYXR0ZXJuKHBhdHRlcm46IHN0cmluZ3xSZWdFeHApOiBWYWxpZGF0b3JGbiB7XG4gICAgcmV0dXJuIHBhdHRlcm5WYWxpZGF0b3IocGF0dGVybik7XG4gIH1cblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIFZhbGlkYXRvciB0aGF0IHBlcmZvcm1zIG5vIG9wZXJhdGlvbi5cbiAgICpcbiAgICogQHNlZSBgdXBkYXRlVmFsdWVBbmRWYWxpZGl0eSgpYFxuICAgKlxuICAgKi9cbiAgc3RhdGljIG51bGxWYWxpZGF0b3IoY29udHJvbDogQWJzdHJhY3RDb250cm9sKTogVmFsaWRhdGlvbkVycm9yc3xudWxsIHtcbiAgICByZXR1cm4gbnVsbFZhbGlkYXRvcihjb250cm9sKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogQ29tcG9zZSBtdWx0aXBsZSB2YWxpZGF0b3JzIGludG8gYSBzaW5nbGUgZnVuY3Rpb24gdGhhdCByZXR1cm5zIHRoZSB1bmlvblxuICAgKiBvZiB0aGUgaW5kaXZpZHVhbCBlcnJvciBtYXBzIGZvciB0aGUgcHJvdmlkZWQgY29udHJvbC5cbiAgICpcbiAgICogQHJldHVybnMgQSB2YWxpZGF0b3IgZnVuY3Rpb24gdGhhdCByZXR1cm5zIGFuIGVycm9yIG1hcCB3aXRoIHRoZVxuICAgKiBtZXJnZWQgZXJyb3IgbWFwcyBvZiB0aGUgdmFsaWRhdG9ycyBpZiB0aGUgdmFsaWRhdGlvbiBjaGVjayBmYWlscywgb3RoZXJ3aXNlIGBudWxsYC5cbiAgICpcbiAgICogQHNlZSBgdXBkYXRlVmFsdWVBbmRWYWxpZGl0eSgpYFxuICAgKlxuICAgKi9cbiAgc3RhdGljIGNvbXBvc2UodmFsaWRhdG9yczogbnVsbCk6IG51bGw7XG4gIHN0YXRpYyBjb21wb3NlKHZhbGlkYXRvcnM6IChWYWxpZGF0b3JGbnxudWxsfHVuZGVmaW5lZClbXSk6IFZhbGlkYXRvckZufG51bGw7XG4gIHN0YXRpYyBjb21wb3NlKHZhbGlkYXRvcnM6IChWYWxpZGF0b3JGbnxudWxsfHVuZGVmaW5lZClbXXxudWxsKTogVmFsaWRhdG9yRm58bnVsbCB7XG4gICAgcmV0dXJuIGNvbXBvc2UodmFsaWRhdG9ycyk7XG4gIH1cblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIENvbXBvc2UgbXVsdGlwbGUgYXN5bmMgdmFsaWRhdG9ycyBpbnRvIGEgc2luZ2xlIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0aGUgdW5pb25cbiAgICogb2YgdGhlIGluZGl2aWR1YWwgZXJyb3Igb2JqZWN0cyBmb3IgdGhlIHByb3ZpZGVkIGNvbnRyb2wuXG4gICAqXG4gICAqIEByZXR1cm5zIEEgdmFsaWRhdG9yIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhbiBlcnJvciBtYXAgd2l0aCB0aGVcbiAgICogbWVyZ2VkIGVycm9yIG9iamVjdHMgb2YgdGhlIGFzeW5jIHZhbGlkYXRvcnMgaWYgdGhlIHZhbGlkYXRpb24gY2hlY2sgZmFpbHMsIG90aGVyd2lzZSBgbnVsbGAuXG4gICAqXG4gICAqIEBzZWUgYHVwZGF0ZVZhbHVlQW5kVmFsaWRpdHkoKWBcbiAgICpcbiAgICovXG4gIHN0YXRpYyBjb21wb3NlQXN5bmModmFsaWRhdG9yczogKEFzeW5jVmFsaWRhdG9yRm58bnVsbClbXSk6IEFzeW5jVmFsaWRhdG9yRm58bnVsbCB7XG4gICAgcmV0dXJuIGNvbXBvc2VBc3luYyh2YWxpZGF0b3JzKTtcbiAgfVxufVxuXG4vKipcbiAqIFZhbGlkYXRvciB0aGF0IHJlcXVpcmVzIHRoZSBjb250cm9sJ3MgdmFsdWUgdG8gYmUgZ3JlYXRlciB0aGFuIG9yIGVxdWFsIHRvIHRoZSBwcm92aWRlZCBudW1iZXIuXG4gKiBTZWUgYFZhbGlkYXRvcnMubWluYCBmb3IgYWRkaXRpb25hbCBpbmZvcm1hdGlvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1pblZhbGlkYXRvcihtaW46IG51bWJlcik6IFZhbGlkYXRvckZuIHtcbiAgcmV0dXJuIChjb250cm9sOiBBYnN0cmFjdENvbnRyb2wpOiBWYWxpZGF0aW9uRXJyb3JzfG51bGwgPT4ge1xuICAgIGlmIChpc0VtcHR5SW5wdXRWYWx1ZShjb250cm9sLnZhbHVlKSB8fCBpc0VtcHR5SW5wdXRWYWx1ZShtaW4pKSB7XG4gICAgICByZXR1cm4gbnVsbDsgIC8vIGRvbid0IHZhbGlkYXRlIGVtcHR5IHZhbHVlcyB0byBhbGxvdyBvcHRpb25hbCBjb250cm9sc1xuICAgIH1cbiAgICBjb25zdCB2YWx1ZSA9IHBhcnNlRmxvYXQoY29udHJvbC52YWx1ZSk7XG4gICAgLy8gQ29udHJvbHMgd2l0aCBOYU4gdmFsdWVzIGFmdGVyIHBhcnNpbmcgc2hvdWxkIGJlIHRyZWF0ZWQgYXMgbm90IGhhdmluZyBhXG4gICAgLy8gbWluaW11bSwgcGVyIHRoZSBIVE1MIGZvcm1zIHNwZWM6IGh0dHBzOi8vd3d3LnczLm9yZy9UUi9odG1sNS9mb3Jtcy5odG1sI2F0dHItaW5wdXQtbWluXG4gICAgcmV0dXJuICFpc05hTih2YWx1ZSkgJiYgdmFsdWUgPCBtaW4gPyB7J21pbic6IHsnbWluJzogbWluLCAnYWN0dWFsJzogY29udHJvbC52YWx1ZX19IDogbnVsbDtcbiAgfTtcbn1cblxuLyoqXG4gKiBWYWxpZGF0b3IgdGhhdCByZXF1aXJlcyB0aGUgY29udHJvbCdzIHZhbHVlIHRvIGJlIGxlc3MgdGhhbiBvciBlcXVhbCB0byB0aGUgcHJvdmlkZWQgbnVtYmVyLlxuICogU2VlIGBWYWxpZGF0b3JzLm1heGAgZm9yIGFkZGl0aW9uYWwgaW5mb3JtYXRpb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtYXhWYWxpZGF0b3IobWF4OiBudW1iZXIpOiBWYWxpZGF0b3JGbiB7XG4gIHJldHVybiAoY29udHJvbDogQWJzdHJhY3RDb250cm9sKTogVmFsaWRhdGlvbkVycm9yc3xudWxsID0+IHtcbiAgICBpZiAoaXNFbXB0eUlucHV0VmFsdWUoY29udHJvbC52YWx1ZSkgfHwgaXNFbXB0eUlucHV0VmFsdWUobWF4KSkge1xuICAgICAgcmV0dXJuIG51bGw7ICAvLyBkb24ndCB2YWxpZGF0ZSBlbXB0eSB2YWx1ZXMgdG8gYWxsb3cgb3B0aW9uYWwgY29udHJvbHNcbiAgICB9XG4gICAgY29uc3QgdmFsdWUgPSBwYXJzZUZsb2F0KGNvbnRyb2wudmFsdWUpO1xuICAgIC8vIENvbnRyb2xzIHdpdGggTmFOIHZhbHVlcyBhZnRlciBwYXJzaW5nIHNob3VsZCBiZSB0cmVhdGVkIGFzIG5vdCBoYXZpbmcgYVxuICAgIC8vIG1heGltdW0sIHBlciB0aGUgSFRNTCBmb3JtcyBzcGVjOiBodHRwczovL3d3dy53My5vcmcvVFIvaHRtbDUvZm9ybXMuaHRtbCNhdHRyLWlucHV0LW1heFxuICAgIHJldHVybiAhaXNOYU4odmFsdWUpICYmIHZhbHVlID4gbWF4ID8geydtYXgnOiB7J21heCc6IG1heCwgJ2FjdHVhbCc6IGNvbnRyb2wudmFsdWV9fSA6IG51bGw7XG4gIH07XG59XG5cbi8qKlxuICogVmFsaWRhdG9yIHRoYXQgcmVxdWlyZXMgdGhlIGNvbnRyb2wgaGF2ZSBhIG5vbi1lbXB0eSB2YWx1ZS5cbiAqIFNlZSBgVmFsaWRhdG9ycy5yZXF1aXJlZGAgZm9yIGFkZGl0aW9uYWwgaW5mb3JtYXRpb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXF1aXJlZFZhbGlkYXRvcihjb250cm9sOiBBYnN0cmFjdENvbnRyb2wpOiBWYWxpZGF0aW9uRXJyb3JzfG51bGwge1xuICByZXR1cm4gaXNFbXB0eUlucHV0VmFsdWUoY29udHJvbC52YWx1ZSkgPyB7J3JlcXVpcmVkJzogdHJ1ZX0gOiBudWxsO1xufVxuXG4vKipcbiAqIFZhbGlkYXRvciB0aGF0IHJlcXVpcmVzIHRoZSBjb250cm9sJ3MgdmFsdWUgYmUgdHJ1ZS4gVGhpcyB2YWxpZGF0b3IgaXMgY29tbW9ubHlcbiAqIHVzZWQgZm9yIHJlcXVpcmVkIGNoZWNrYm94ZXMuXG4gKiBTZWUgYFZhbGlkYXRvcnMucmVxdWlyZWRUcnVlYCBmb3IgYWRkaXRpb25hbCBpbmZvcm1hdGlvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlcXVpcmVkVHJ1ZVZhbGlkYXRvcihjb250cm9sOiBBYnN0cmFjdENvbnRyb2wpOiBWYWxpZGF0aW9uRXJyb3JzfG51bGwge1xuICByZXR1cm4gY29udHJvbC52YWx1ZSA9PT0gdHJ1ZSA/IG51bGwgOiB7J3JlcXVpcmVkJzogdHJ1ZX07XG59XG5cbi8qKlxuICogVmFsaWRhdG9yIHRoYXQgcmVxdWlyZXMgdGhlIGNvbnRyb2wncyB2YWx1ZSBwYXNzIGFuIGVtYWlsIHZhbGlkYXRpb24gdGVzdC5cbiAqIFNlZSBgVmFsaWRhdG9ycy5lbWFpbGAgZm9yIGFkZGl0aW9uYWwgaW5mb3JtYXRpb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlbWFpbFZhbGlkYXRvcihjb250cm9sOiBBYnN0cmFjdENvbnRyb2wpOiBWYWxpZGF0aW9uRXJyb3JzfG51bGwge1xuICBpZiAoaXNFbXB0eUlucHV0VmFsdWUoY29udHJvbC52YWx1ZSkpIHtcbiAgICByZXR1cm4gbnVsbDsgIC8vIGRvbid0IHZhbGlkYXRlIGVtcHR5IHZhbHVlcyB0byBhbGxvdyBvcHRpb25hbCBjb250cm9sc1xuICB9XG4gIHJldHVybiBFTUFJTF9SRUdFWFAudGVzdChjb250cm9sLnZhbHVlKSA/IG51bGwgOiB7J2VtYWlsJzogdHJ1ZX07XG59XG5cbi8qKlxuICogVmFsaWRhdG9yIHRoYXQgcmVxdWlyZXMgdGhlIGxlbmd0aCBvZiB0aGUgY29udHJvbCdzIHZhbHVlIHRvIGJlIGdyZWF0ZXIgdGhhbiBvciBlcXVhbFxuICogdG8gdGhlIHByb3ZpZGVkIG1pbmltdW0gbGVuZ3RoLiBTZWUgYFZhbGlkYXRvcnMubWluTGVuZ3RoYCBmb3IgYWRkaXRpb25hbCBpbmZvcm1hdGlvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1pbkxlbmd0aFZhbGlkYXRvcihtaW5MZW5ndGg6IG51bWJlcik6IFZhbGlkYXRvckZuIHtcbiAgcmV0dXJuIChjb250cm9sOiBBYnN0cmFjdENvbnRyb2wpOiBWYWxpZGF0aW9uRXJyb3JzfG51bGwgPT4ge1xuICAgIGlmIChpc0VtcHR5SW5wdXRWYWx1ZShjb250cm9sLnZhbHVlKSB8fCAhaGFzVmFsaWRMZW5ndGgoY29udHJvbC52YWx1ZSkpIHtcbiAgICAgIC8vIGRvbid0IHZhbGlkYXRlIGVtcHR5IHZhbHVlcyB0byBhbGxvdyBvcHRpb25hbCBjb250cm9sc1xuICAgICAgLy8gZG9uJ3QgdmFsaWRhdGUgdmFsdWVzIHdpdGhvdXQgYGxlbmd0aGAgcHJvcGVydHlcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHJldHVybiBjb250cm9sLnZhbHVlLmxlbmd0aCA8IG1pbkxlbmd0aCA/XG4gICAgICAgIHsnbWlubGVuZ3RoJzogeydyZXF1aXJlZExlbmd0aCc6IG1pbkxlbmd0aCwgJ2FjdHVhbExlbmd0aCc6IGNvbnRyb2wudmFsdWUubGVuZ3RofX0gOlxuICAgICAgICBudWxsO1xuICB9O1xufVxuXG4vKipcbiAqIFZhbGlkYXRvciB0aGF0IHJlcXVpcmVzIHRoZSBsZW5ndGggb2YgdGhlIGNvbnRyb2wncyB2YWx1ZSB0byBiZSBsZXNzIHRoYW4gb3IgZXF1YWxcbiAqIHRvIHRoZSBwcm92aWRlZCBtYXhpbXVtIGxlbmd0aC4gU2VlIGBWYWxpZGF0b3JzLm1heExlbmd0aGAgZm9yIGFkZGl0aW9uYWwgaW5mb3JtYXRpb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtYXhMZW5ndGhWYWxpZGF0b3IobWF4TGVuZ3RoOiBudW1iZXIpOiBWYWxpZGF0b3JGbiB7XG4gIHJldHVybiAoY29udHJvbDogQWJzdHJhY3RDb250cm9sKTogVmFsaWRhdGlvbkVycm9yc3xudWxsID0+IHtcbiAgICByZXR1cm4gaGFzVmFsaWRMZW5ndGgoY29udHJvbC52YWx1ZSkgJiYgY29udHJvbC52YWx1ZS5sZW5ndGggPiBtYXhMZW5ndGggP1xuICAgICAgICB7J21heGxlbmd0aCc6IHsncmVxdWlyZWRMZW5ndGgnOiBtYXhMZW5ndGgsICdhY3R1YWxMZW5ndGgnOiBjb250cm9sLnZhbHVlLmxlbmd0aH19IDpcbiAgICAgICAgbnVsbDtcbiAgfTtcbn1cblxuLyoqXG4gKiBWYWxpZGF0b3IgdGhhdCByZXF1aXJlcyB0aGUgY29udHJvbCdzIHZhbHVlIHRvIG1hdGNoIGEgcmVnZXggcGF0dGVybi5cbiAqIFNlZSBgVmFsaWRhdG9ycy5wYXR0ZXJuYCBmb3IgYWRkaXRpb25hbCBpbmZvcm1hdGlvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhdHRlcm5WYWxpZGF0b3IocGF0dGVybjogc3RyaW5nfFJlZ0V4cCk6IFZhbGlkYXRvckZuIHtcbiAgaWYgKCFwYXR0ZXJuKSByZXR1cm4gbnVsbFZhbGlkYXRvcjtcbiAgbGV0IHJlZ2V4OiBSZWdFeHA7XG4gIGxldCByZWdleFN0cjogc3RyaW5nO1xuICBpZiAodHlwZW9mIHBhdHRlcm4gPT09ICdzdHJpbmcnKSB7XG4gICAgcmVnZXhTdHIgPSAnJztcblxuICAgIGlmIChwYXR0ZXJuLmNoYXJBdCgwKSAhPT0gJ14nKSByZWdleFN0ciArPSAnXic7XG5cbiAgICByZWdleFN0ciArPSBwYXR0ZXJuO1xuXG4gICAgaWYgKHBhdHRlcm4uY2hhckF0KHBhdHRlcm4ubGVuZ3RoIC0gMSkgIT09ICckJykgcmVnZXhTdHIgKz0gJyQnO1xuXG4gICAgcmVnZXggPSBuZXcgUmVnRXhwKHJlZ2V4U3RyKTtcbiAgfSBlbHNlIHtcbiAgICByZWdleFN0ciA9IHBhdHRlcm4udG9TdHJpbmcoKTtcbiAgICByZWdleCA9IHBhdHRlcm47XG4gIH1cbiAgcmV0dXJuIChjb250cm9sOiBBYnN0cmFjdENvbnRyb2wpOiBWYWxpZGF0aW9uRXJyb3JzfG51bGwgPT4ge1xuICAgIGlmIChpc0VtcHR5SW5wdXRWYWx1ZShjb250cm9sLnZhbHVlKSkge1xuICAgICAgcmV0dXJuIG51bGw7ICAvLyBkb24ndCB2YWxpZGF0ZSBlbXB0eSB2YWx1ZXMgdG8gYWxsb3cgb3B0aW9uYWwgY29udHJvbHNcbiAgICB9XG4gICAgY29uc3QgdmFsdWU6IHN0cmluZyA9IGNvbnRyb2wudmFsdWU7XG4gICAgcmV0dXJuIHJlZ2V4LnRlc3QodmFsdWUpID8gbnVsbCA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeydwYXR0ZXJuJzogeydyZXF1aXJlZFBhdHRlcm4nOiByZWdleFN0ciwgJ2FjdHVhbFZhbHVlJzogdmFsdWV9fTtcbiAgfTtcbn1cblxuLyoqXG4gKiBGdW5jdGlvbiB0aGF0IGhhcyBgVmFsaWRhdG9yRm5gIHNoYXBlLCBidXQgcGVyZm9ybXMgbm8gb3BlcmF0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gbnVsbFZhbGlkYXRvcihjb250cm9sOiBBYnN0cmFjdENvbnRyb2wpOiBWYWxpZGF0aW9uRXJyb3JzfG51bGwge1xuICByZXR1cm4gbnVsbDtcbn1cblxuZnVuY3Rpb24gaXNQcmVzZW50KG86IGFueSk6IGJvb2xlYW4ge1xuICByZXR1cm4gbyAhPSBudWxsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdG9PYnNlcnZhYmxlKHZhbHVlOiBhbnkpOiBPYnNlcnZhYmxlPGFueT4ge1xuICBjb25zdCBvYnMgPSBpc1Byb21pc2UodmFsdWUpID8gZnJvbSh2YWx1ZSkgOiB2YWx1ZTtcbiAgaWYgKE5HX0RFVl9NT0RFICYmICEoaXNPYnNlcnZhYmxlKG9icykpKSB7XG4gICAgbGV0IGVycm9yTWVzc2FnZSA9IGBFeHBlY3RlZCBhc3luYyB2YWxpZGF0b3IgdG8gcmV0dXJuIFByb21pc2Ugb3IgT2JzZXJ2YWJsZS5gO1xuICAgIC8vIEEgc3luY2hyb25vdXMgdmFsaWRhdG9yIHdpbGwgcmV0dXJuIG9iamVjdCBvciBudWxsLlxuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XG4gICAgICBlcnJvck1lc3NhZ2UgKz1cbiAgICAgICAgICAnIEFyZSB5b3UgdXNpbmcgYSBzeW5jaHJvbm91cyB2YWxpZGF0b3Igd2hlcmUgYW4gYXN5bmMgdmFsaWRhdG9yIGlzIGV4cGVjdGVkPyc7XG4gICAgfVxuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoUnVudGltZUVycm9yQ29kZS5XUk9OR19WQUxJREFUT1JfUkVUVVJOX1RZUEUsIGVycm9yTWVzc2FnZSk7XG4gIH1cbiAgcmV0dXJuIG9icztcbn1cblxuZnVuY3Rpb24gbWVyZ2VFcnJvcnMoYXJyYXlPZkVycm9yczogKFZhbGlkYXRpb25FcnJvcnN8bnVsbClbXSk6IFZhbGlkYXRpb25FcnJvcnN8bnVsbCB7XG4gIGxldCByZXM6IHtba2V5OiBzdHJpbmddOiBhbnl9ID0ge307XG4gIGFycmF5T2ZFcnJvcnMuZm9yRWFjaCgoZXJyb3JzOiBWYWxpZGF0aW9uRXJyb3JzfG51bGwpID0+IHtcbiAgICByZXMgPSBlcnJvcnMgIT0gbnVsbCA/IHsuLi5yZXMhLCAuLi5lcnJvcnN9IDogcmVzITtcbiAgfSk7XG5cbiAgcmV0dXJuIE9iamVjdC5rZXlzKHJlcykubGVuZ3RoID09PSAwID8gbnVsbCA6IHJlcztcbn1cblxudHlwZSBHZW5lcmljVmFsaWRhdG9yRm4gPSAoY29udHJvbDogQWJzdHJhY3RDb250cm9sKSA9PiBhbnk7XG5cbmZ1bmN0aW9uIGV4ZWN1dGVWYWxpZGF0b3JzPFYgZXh0ZW5kcyBHZW5lcmljVmFsaWRhdG9yRm4+KFxuICAgIGNvbnRyb2w6IEFic3RyYWN0Q29udHJvbCwgdmFsaWRhdG9yczogVltdKTogUmV0dXJuVHlwZTxWPltdIHtcbiAgcmV0dXJuIHZhbGlkYXRvcnMubWFwKHZhbGlkYXRvciA9PiB2YWxpZGF0b3IoY29udHJvbCkpO1xufVxuXG5mdW5jdGlvbiBpc1ZhbGlkYXRvckZuPFY+KHZhbGlkYXRvcjogVnxWYWxpZGF0b3J8QXN5bmNWYWxpZGF0b3IpOiB2YWxpZGF0b3IgaXMgViB7XG4gIHJldHVybiAhKHZhbGlkYXRvciBhcyBWYWxpZGF0b3IpLnZhbGlkYXRlO1xufVxuXG4vKipcbiAqIEdpdmVuIHRoZSBsaXN0IG9mIHZhbGlkYXRvcnMgdGhhdCBtYXkgY29udGFpbiBib3RoIGZ1bmN0aW9ucyBhcyB3ZWxsIGFzIGNsYXNzZXMsIHJldHVybiB0aGUgbGlzdFxuICogb2YgdmFsaWRhdG9yIGZ1bmN0aW9ucyAoY29udmVydCB2YWxpZGF0b3IgY2xhc3NlcyBpbnRvIHZhbGlkYXRvciBmdW5jdGlvbnMpLiBUaGlzIGlzIG5lZWRlZCB0b1xuICogaGF2ZSBjb25zaXN0ZW50IHN0cnVjdHVyZSBpbiB2YWxpZGF0b3JzIGxpc3QgYmVmb3JlIGNvbXBvc2luZyB0aGVtLlxuICpcbiAqIEBwYXJhbSB2YWxpZGF0b3JzIFRoZSBzZXQgb2YgdmFsaWRhdG9ycyB0aGF0IG1heSBjb250YWluIHZhbGlkYXRvcnMgYm90aCBpbiBwbGFpbiBmdW5jdGlvbiBmb3JtXG4gKiAgICAgYXMgd2VsbCBhcyByZXByZXNlbnRlZCBhcyBhIHZhbGlkYXRvciBjbGFzcy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZVZhbGlkYXRvcnM8Vj4odmFsaWRhdG9yczogKFZ8VmFsaWRhdG9yfEFzeW5jVmFsaWRhdG9yKVtdKTogVltdIHtcbiAgcmV0dXJuIHZhbGlkYXRvcnMubWFwKHZhbGlkYXRvciA9PiB7XG4gICAgcmV0dXJuIGlzVmFsaWRhdG9yRm48Vj4odmFsaWRhdG9yKSA/XG4gICAgICAgIHZhbGlkYXRvciA6XG4gICAgICAgICgoYzogQWJzdHJhY3RDb250cm9sKSA9PiB2YWxpZGF0b3IudmFsaWRhdGUoYykpIGFzIHVua25vd24gYXMgVjtcbiAgfSk7XG59XG5cbi8qKlxuICogTWVyZ2VzIHN5bmNocm9ub3VzIHZhbGlkYXRvcnMgaW50byBhIHNpbmdsZSB2YWxpZGF0b3IgZnVuY3Rpb24uXG4gKiBTZWUgYFZhbGlkYXRvcnMuY29tcG9zZWAgZm9yIGFkZGl0aW9uYWwgaW5mb3JtYXRpb24uXG4gKi9cbmZ1bmN0aW9uIGNvbXBvc2UodmFsaWRhdG9yczogKFZhbGlkYXRvckZufG51bGx8dW5kZWZpbmVkKVtdfG51bGwpOiBWYWxpZGF0b3JGbnxudWxsIHtcbiAgaWYgKCF2YWxpZGF0b3JzKSByZXR1cm4gbnVsbDtcbiAgY29uc3QgcHJlc2VudFZhbGlkYXRvcnM6IFZhbGlkYXRvckZuW10gPSB2YWxpZGF0b3JzLmZpbHRlcihpc1ByZXNlbnQpIGFzIGFueTtcbiAgaWYgKHByZXNlbnRWYWxpZGF0b3JzLmxlbmd0aCA9PSAwKSByZXR1cm4gbnVsbDtcblxuICByZXR1cm4gZnVuY3Rpb24oY29udHJvbDogQWJzdHJhY3RDb250cm9sKSB7XG4gICAgcmV0dXJuIG1lcmdlRXJyb3JzKGV4ZWN1dGVWYWxpZGF0b3JzPFZhbGlkYXRvckZuPihjb250cm9sLCBwcmVzZW50VmFsaWRhdG9ycykpO1xuICB9O1xufVxuXG4vKipcbiAqIEFjY2VwdHMgYSBsaXN0IG9mIHZhbGlkYXRvcnMgb2YgZGlmZmVyZW50IHBvc3NpYmxlIHNoYXBlcyAoYFZhbGlkYXRvcmAgYW5kIGBWYWxpZGF0b3JGbmApLFxuICogbm9ybWFsaXplcyB0aGUgbGlzdCAoY29udmVydHMgZXZlcnl0aGluZyB0byBgVmFsaWRhdG9yRm5gKSBhbmQgbWVyZ2VzIHRoZW0gaW50byBhIHNpbmdsZVxuICogdmFsaWRhdG9yIGZ1bmN0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY29tcG9zZVZhbGlkYXRvcnModmFsaWRhdG9yczogQXJyYXk8VmFsaWRhdG9yfFZhbGlkYXRvckZuPik6IFZhbGlkYXRvckZufG51bGwge1xuICByZXR1cm4gdmFsaWRhdG9ycyAhPSBudWxsID8gY29tcG9zZShub3JtYWxpemVWYWxpZGF0b3JzPFZhbGlkYXRvckZuPih2YWxpZGF0b3JzKSkgOiBudWxsO1xufVxuXG4vKipcbiAqIE1lcmdlcyBhc3luY2hyb25vdXMgdmFsaWRhdG9ycyBpbnRvIGEgc2luZ2xlIHZhbGlkYXRvciBmdW5jdGlvbi5cbiAqIFNlZSBgVmFsaWRhdG9ycy5jb21wb3NlQXN5bmNgIGZvciBhZGRpdGlvbmFsIGluZm9ybWF0aW9uLlxuICovXG5mdW5jdGlvbiBjb21wb3NlQXN5bmModmFsaWRhdG9yczogKEFzeW5jVmFsaWRhdG9yRm58bnVsbClbXSk6IEFzeW5jVmFsaWRhdG9yRm58bnVsbCB7XG4gIGlmICghdmFsaWRhdG9ycykgcmV0dXJuIG51bGw7XG4gIGNvbnN0IHByZXNlbnRWYWxpZGF0b3JzOiBBc3luY1ZhbGlkYXRvckZuW10gPSB2YWxpZGF0b3JzLmZpbHRlcihpc1ByZXNlbnQpIGFzIGFueTtcbiAgaWYgKHByZXNlbnRWYWxpZGF0b3JzLmxlbmd0aCA9PSAwKSByZXR1cm4gbnVsbDtcblxuICByZXR1cm4gZnVuY3Rpb24oY29udHJvbDogQWJzdHJhY3RDb250cm9sKSB7XG4gICAgY29uc3Qgb2JzZXJ2YWJsZXMgPVxuICAgICAgICBleGVjdXRlVmFsaWRhdG9yczxBc3luY1ZhbGlkYXRvckZuPihjb250cm9sLCBwcmVzZW50VmFsaWRhdG9ycykubWFwKHRvT2JzZXJ2YWJsZSk7XG4gICAgcmV0dXJuIGZvcmtKb2luKG9ic2VydmFibGVzKS5waXBlKG1hcChtZXJnZUVycm9ycykpO1xuICB9O1xufVxuXG4vKipcbiAqIEFjY2VwdHMgYSBsaXN0IG9mIGFzeW5jIHZhbGlkYXRvcnMgb2YgZGlmZmVyZW50IHBvc3NpYmxlIHNoYXBlcyAoYEFzeW5jVmFsaWRhdG9yYCBhbmRcbiAqIGBBc3luY1ZhbGlkYXRvckZuYCksIG5vcm1hbGl6ZXMgdGhlIGxpc3QgKGNvbnZlcnRzIGV2ZXJ5dGhpbmcgdG8gYEFzeW5jVmFsaWRhdG9yRm5gKSBhbmQgbWVyZ2VzXG4gKiB0aGVtIGludG8gYSBzaW5nbGUgdmFsaWRhdG9yIGZ1bmN0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY29tcG9zZUFzeW5jVmFsaWRhdG9ycyh2YWxpZGF0b3JzOiBBcnJheTxBc3luY1ZhbGlkYXRvcnxBc3luY1ZhbGlkYXRvckZuPik6XG4gICAgQXN5bmNWYWxpZGF0b3JGbnxudWxsIHtcbiAgcmV0dXJuIHZhbGlkYXRvcnMgIT0gbnVsbCA/IGNvbXBvc2VBc3luYyhub3JtYWxpemVWYWxpZGF0b3JzPEFzeW5jVmFsaWRhdG9yRm4+KHZhbGlkYXRvcnMpKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBudWxsO1xufVxuXG4vKipcbiAqIE1lcmdlcyByYXcgY29udHJvbCB2YWxpZGF0b3JzIHdpdGggYSBnaXZlbiBkaXJlY3RpdmUgdmFsaWRhdG9yIGFuZCByZXR1cm5zIHRoZSBjb21iaW5lZCBsaXN0IG9mXG4gKiB2YWxpZGF0b3JzIGFzIGFuIGFycmF5LlxuICovXG5leHBvcnQgZnVuY3Rpb24gbWVyZ2VWYWxpZGF0b3JzPFY+KGNvbnRyb2xWYWxpZGF0b3JzOiBWfFZbXXxudWxsLCBkaXJWYWxpZGF0b3I6IFYpOiBWW10ge1xuICBpZiAoY29udHJvbFZhbGlkYXRvcnMgPT09IG51bGwpIHJldHVybiBbZGlyVmFsaWRhdG9yXTtcbiAgcmV0dXJuIEFycmF5LmlzQXJyYXkoY29udHJvbFZhbGlkYXRvcnMpID8gWy4uLmNvbnRyb2xWYWxpZGF0b3JzLCBkaXJWYWxpZGF0b3JdIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW2NvbnRyb2xWYWxpZGF0b3JzLCBkaXJWYWxpZGF0b3JdO1xufVxuXG4vKipcbiAqIFJldHJpZXZlcyB0aGUgbGlzdCBvZiByYXcgc3luY2hyb25vdXMgdmFsaWRhdG9ycyBhdHRhY2hlZCB0byBhIGdpdmVuIGNvbnRyb2wuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRDb250cm9sVmFsaWRhdG9ycyhjb250cm9sOiBBYnN0cmFjdENvbnRyb2wpOiBWYWxpZGF0b3JGbnxWYWxpZGF0b3JGbltdfG51bGwge1xuICByZXR1cm4gKGNvbnRyb2wgYXMgYW55KS5fcmF3VmFsaWRhdG9ycyBhcyBWYWxpZGF0b3JGbiB8IFZhbGlkYXRvckZuW10gfCBudWxsO1xufVxuXG4vKipcbiAqIFJldHJpZXZlcyB0aGUgbGlzdCBvZiByYXcgYXN5bmNocm9ub3VzIHZhbGlkYXRvcnMgYXR0YWNoZWQgdG8gYSBnaXZlbiBjb250cm9sLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29udHJvbEFzeW5jVmFsaWRhdG9ycyhjb250cm9sOiBBYnN0cmFjdENvbnRyb2wpOiBBc3luY1ZhbGlkYXRvckZufFxuICAgIEFzeW5jVmFsaWRhdG9yRm5bXXxudWxsIHtcbiAgcmV0dXJuIChjb250cm9sIGFzIGFueSkuX3Jhd0FzeW5jVmFsaWRhdG9ycyBhcyBBc3luY1ZhbGlkYXRvckZuIHwgQXN5bmNWYWxpZGF0b3JGbltdIHwgbnVsbDtcbn1cblxuLyoqXG4gKiBBY2NlcHRzIGEgc2luZ2xldG9uIHZhbGlkYXRvciwgYW4gYXJyYXksIG9yIG51bGwsIGFuZCByZXR1cm5zIGFuIGFycmF5IHR5cGUgd2l0aCB0aGUgcHJvdmlkZWRcbiAqIHZhbGlkYXRvcnMuXG4gKlxuICogQHBhcmFtIHZhbGlkYXRvcnMgQSB2YWxpZGF0b3IsIHZhbGlkYXRvcnMsIG9yIG51bGwuXG4gKiBAcmV0dXJucyBBIHZhbGlkYXRvcnMgYXJyYXkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtYWtlVmFsaWRhdG9yc0FycmF5PFQgZXh0ZW5kcyBWYWxpZGF0b3JGbnxBc3luY1ZhbGlkYXRvckZuPih2YWxpZGF0b3JzOiBUfFRbXXxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBudWxsKTogVFtdIHtcbiAgaWYgKCF2YWxpZGF0b3JzKSByZXR1cm4gW107XG4gIHJldHVybiBBcnJheS5pc0FycmF5KHZhbGlkYXRvcnMpID8gdmFsaWRhdG9ycyA6IFt2YWxpZGF0b3JzXTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmVzIHdoZXRoZXIgYSB2YWxpZGF0b3Igb3IgdmFsaWRhdG9ycyBhcnJheSBoYXMgYSBnaXZlbiB2YWxpZGF0b3IuXG4gKlxuICogQHBhcmFtIHZhbGlkYXRvcnMgVGhlIHZhbGlkYXRvciBvciB2YWxpZGF0b3JzIHRvIGNvbXBhcmUgYWdhaW5zdC5cbiAqIEBwYXJhbSB2YWxpZGF0b3IgVGhlIHZhbGlkYXRvciB0byBjaGVjay5cbiAqIEByZXR1cm5zIFdoZXRoZXIgdGhlIHZhbGlkYXRvciBpcyBwcmVzZW50LlxuICovXG5leHBvcnQgZnVuY3Rpb24gaGFzVmFsaWRhdG9yPFQgZXh0ZW5kcyBWYWxpZGF0b3JGbnxBc3luY1ZhbGlkYXRvckZuPihcbiAgICB2YWxpZGF0b3JzOiBUfFRbXXxudWxsLCB2YWxpZGF0b3I6IFQpOiBib29sZWFuIHtcbiAgcmV0dXJuIEFycmF5LmlzQXJyYXkodmFsaWRhdG9ycykgPyB2YWxpZGF0b3JzLmluY2x1ZGVzKHZhbGlkYXRvcikgOiB2YWxpZGF0b3JzID09PSB2YWxpZGF0b3I7XG59XG5cbi8qKlxuICogQ29tYmluZXMgdHdvIGFycmF5cyBvZiB2YWxpZGF0b3JzIGludG8gb25lLiBJZiBkdXBsaWNhdGVzIGFyZSBwcm92aWRlZCwgb25seSBvbmUgd2lsbCBiZSBhZGRlZC5cbiAqXG4gKiBAcGFyYW0gdmFsaWRhdG9ycyBUaGUgbmV3IHZhbGlkYXRvcnMuXG4gKiBAcGFyYW0gY3VycmVudFZhbGlkYXRvcnMgVGhlIGJhc2UgYXJyYXkgb2YgY3VycmVudCB2YWxpZGF0b3JzLlxuICogQHJldHVybnMgQW4gYXJyYXkgb2YgdmFsaWRhdG9ycy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFkZFZhbGlkYXRvcnM8VCBleHRlbmRzIFZhbGlkYXRvckZufEFzeW5jVmFsaWRhdG9yRm4+KFxuICAgIHZhbGlkYXRvcnM6IFR8VFtdLCBjdXJyZW50VmFsaWRhdG9yczogVHxUW118bnVsbCk6IFRbXSB7XG4gIGNvbnN0IGN1cnJlbnQgPSBtYWtlVmFsaWRhdG9yc0FycmF5KGN1cnJlbnRWYWxpZGF0b3JzKTtcbiAgY29uc3QgdmFsaWRhdG9yc1RvQWRkID0gbWFrZVZhbGlkYXRvcnNBcnJheSh2YWxpZGF0b3JzKTtcbiAgdmFsaWRhdG9yc1RvQWRkLmZvckVhY2goKHY6IFQpID0+IHtcbiAgICAvLyBOb3RlOiBpZiB0aGVyZSBhcmUgZHVwbGljYXRlIGVudHJpZXMgaW4gdGhlIG5ldyB2YWxpZGF0b3JzIGFycmF5LFxuICAgIC8vIG9ubHkgdGhlIGZpcnN0IG9uZSB3b3VsZCBiZSBhZGRlZCB0byB0aGUgY3VycmVudCBsaXN0IG9mIHZhbGlkYXRvcnMuXG4gICAgLy8gRHVwbGljYXRlIG9uZXMgd291bGQgYmUgaWdub3JlZCBzaW5jZSBgaGFzVmFsaWRhdG9yYCB3b3VsZCBkZXRlY3RcbiAgICAvLyB0aGUgcHJlc2VuY2Ugb2YgYSB2YWxpZGF0b3IgZnVuY3Rpb24gYW5kIHdlIHVwZGF0ZSB0aGUgY3VycmVudCBsaXN0IGluIHBsYWNlLlxuICAgIGlmICghaGFzVmFsaWRhdG9yKGN1cnJlbnQsIHYpKSB7XG4gICAgICBjdXJyZW50LnB1c2godik7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIGN1cnJlbnQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW1vdmVWYWxpZGF0b3JzPFQgZXh0ZW5kcyBWYWxpZGF0b3JGbnxBc3luY1ZhbGlkYXRvckZuPihcbiAgICB2YWxpZGF0b3JzOiBUfFRbXSwgY3VycmVudFZhbGlkYXRvcnM6IFR8VFtdfG51bGwpOiBUW10ge1xuICByZXR1cm4gbWFrZVZhbGlkYXRvcnNBcnJheShjdXJyZW50VmFsaWRhdG9ycykuZmlsdGVyKHYgPT4gIWhhc1ZhbGlkYXRvcih2YWxpZGF0b3JzLCB2KSk7XG59XG4iXX0=