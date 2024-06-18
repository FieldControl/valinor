/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { InjectionToken, ɵRuntimeError as RuntimeError } from '@angular/core';
import { getControlAsyncValidators, getControlValidators, mergeValidators } from '../validators';
import { BuiltInControlValueAccessor } from './control_value_accessor';
import { DefaultValueAccessor } from './default_value_accessor';
import { ngModelWarning } from './reactive_errors';
/**
 * Token to provide to allow SetDisabledState to always be called when a CVA is added, regardless of
 * whether the control is disabled or enabled.
 *
 * @see {@link FormsModule#withconfig}
 */
export const CALL_SET_DISABLED_STATE = new InjectionToken('CallSetDisabledState', {
    providedIn: 'root',
    factory: () => setDisabledStateDefault,
});
/**
 * Whether to use the fixed setDisabledState behavior by default.
 */
export const setDisabledStateDefault = 'always';
export function controlPath(name, parent) {
    return [...parent.path, name];
}
/**
 * Links a Form control and a Form directive by setting up callbacks (such as `onChange`) on both
 * instances. This function is typically invoked when form directive is being initialized.
 *
 * @param control Form control instance that should be linked.
 * @param dir Directive that should be linked with a given control.
 */
export function setUpControl(control, dir, callSetDisabledState = setDisabledStateDefault) {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
        if (!control)
            _throwError(dir, 'Cannot find control with');
        if (!dir.valueAccessor)
            _throwMissingValueAccessorError(dir);
    }
    setUpValidators(control, dir);
    dir.valueAccessor.writeValue(control.value);
    // The legacy behavior only calls the CVA's `setDisabledState` if the control is disabled.
    // If the `callSetDisabledState` option is set to `always`, then this bug is fixed and
    // the method is always called.
    if (control.disabled || callSetDisabledState === 'always') {
        dir.valueAccessor.setDisabledState?.(control.disabled);
    }
    setUpViewChangePipeline(control, dir);
    setUpModelChangePipeline(control, dir);
    setUpBlurPipeline(control, dir);
    setUpDisabledChangeHandler(control, dir);
}
/**
 * Reverts configuration performed by the `setUpControl` control function.
 * Effectively disconnects form control with a given form directive.
 * This function is typically invoked when corresponding form directive is being destroyed.
 *
 * @param control Form control which should be cleaned up.
 * @param dir Directive that should be disconnected from a given control.
 * @param validateControlPresenceOnChange Flag that indicates whether onChange handler should
 *     contain asserts to verify that it's not called once directive is destroyed. We need this flag
 *     to avoid potentially breaking changes caused by better control cleanup introduced in #39235.
 */
export function cleanUpControl(control, dir, validateControlPresenceOnChange = true) {
    const noop = () => {
        if (validateControlPresenceOnChange && (typeof ngDevMode === 'undefined' || ngDevMode)) {
            _noControlError(dir);
        }
    };
    // The `valueAccessor` field is typically defined on FromControl and FormControlName directive
    // instances and there is a logic in `selectValueAccessor` function that throws if it's not the
    // case. We still check the presence of `valueAccessor` before invoking its methods to make sure
    // that cleanup works correctly if app code or tests are setup to ignore the error thrown from
    // `selectValueAccessor`. See https://github.com/angular/angular/issues/40521.
    if (dir.valueAccessor) {
        dir.valueAccessor.registerOnChange(noop);
        dir.valueAccessor.registerOnTouched(noop);
    }
    cleanUpValidators(control, dir);
    if (control) {
        dir._invokeOnDestroyCallbacks();
        control._registerOnCollectionChange(() => { });
    }
}
function registerOnValidatorChange(validators, onChange) {
    validators.forEach((validator) => {
        if (validator.registerOnValidatorChange)
            validator.registerOnValidatorChange(onChange);
    });
}
/**
 * Sets up disabled change handler function on a given form control if ControlValueAccessor
 * associated with a given directive instance supports the `setDisabledState` call.
 *
 * @param control Form control where disabled change handler should be setup.
 * @param dir Corresponding directive instance associated with this control.
 */
export function setUpDisabledChangeHandler(control, dir) {
    if (dir.valueAccessor.setDisabledState) {
        const onDisabledChange = (isDisabled) => {
            dir.valueAccessor.setDisabledState(isDisabled);
        };
        control.registerOnDisabledChange(onDisabledChange);
        // Register a callback function to cleanup disabled change handler
        // from a control instance when a directive is destroyed.
        dir._registerOnDestroy(() => {
            control._unregisterOnDisabledChange(onDisabledChange);
        });
    }
}
/**
 * Sets up sync and async directive validators on provided form control.
 * This function merges validators from the directive into the validators of the control.
 *
 * @param control Form control where directive validators should be setup.
 * @param dir Directive instance that contains validators to be setup.
 */
export function setUpValidators(control, dir) {
    const validators = getControlValidators(control);
    if (dir.validator !== null) {
        control.setValidators(mergeValidators(validators, dir.validator));
    }
    else if (typeof validators === 'function') {
        // If sync validators are represented by a single validator function, we force the
        // `Validators.compose` call to happen by executing the `setValidators` function with
        // an array that contains that function. We need this to avoid possible discrepancies in
        // validators behavior, so sync validators are always processed by the `Validators.compose`.
        // Note: we should consider moving this logic inside the `setValidators` function itself, so we
        // have consistent behavior on AbstractControl API level. The same applies to the async
        // validators logic below.
        control.setValidators([validators]);
    }
    const asyncValidators = getControlAsyncValidators(control);
    if (dir.asyncValidator !== null) {
        control.setAsyncValidators(mergeValidators(asyncValidators, dir.asyncValidator));
    }
    else if (typeof asyncValidators === 'function') {
        control.setAsyncValidators([asyncValidators]);
    }
    // Re-run validation when validator binding changes, e.g. minlength=3 -> minlength=4
    const onValidatorChange = () => control.updateValueAndValidity();
    registerOnValidatorChange(dir._rawValidators, onValidatorChange);
    registerOnValidatorChange(dir._rawAsyncValidators, onValidatorChange);
}
/**
 * Cleans up sync and async directive validators on provided form control.
 * This function reverts the setup performed by the `setUpValidators` function, i.e.
 * removes directive-specific validators from a given control instance.
 *
 * @param control Form control from where directive validators should be removed.
 * @param dir Directive instance that contains validators to be removed.
 * @returns true if a control was updated as a result of this action.
 */
export function cleanUpValidators(control, dir) {
    let isControlUpdated = false;
    if (control !== null) {
        if (dir.validator !== null) {
            const validators = getControlValidators(control);
            if (Array.isArray(validators) && validators.length > 0) {
                // Filter out directive validator function.
                const updatedValidators = validators.filter((validator) => validator !== dir.validator);
                if (updatedValidators.length !== validators.length) {
                    isControlUpdated = true;
                    control.setValidators(updatedValidators);
                }
            }
        }
        if (dir.asyncValidator !== null) {
            const asyncValidators = getControlAsyncValidators(control);
            if (Array.isArray(asyncValidators) && asyncValidators.length > 0) {
                // Filter out directive async validator function.
                const updatedAsyncValidators = asyncValidators.filter((asyncValidator) => asyncValidator !== dir.asyncValidator);
                if (updatedAsyncValidators.length !== asyncValidators.length) {
                    isControlUpdated = true;
                    control.setAsyncValidators(updatedAsyncValidators);
                }
            }
        }
    }
    // Clear onValidatorChange callbacks by providing a noop function.
    const noop = () => { };
    registerOnValidatorChange(dir._rawValidators, noop);
    registerOnValidatorChange(dir._rawAsyncValidators, noop);
    return isControlUpdated;
}
function setUpViewChangePipeline(control, dir) {
    dir.valueAccessor.registerOnChange((newValue) => {
        control._pendingValue = newValue;
        control._pendingChange = true;
        control._pendingDirty = true;
        if (control.updateOn === 'change')
            updateControl(control, dir);
    });
}
function setUpBlurPipeline(control, dir) {
    dir.valueAccessor.registerOnTouched(() => {
        control._pendingTouched = true;
        if (control.updateOn === 'blur' && control._pendingChange)
            updateControl(control, dir);
        if (control.updateOn !== 'submit')
            control.markAsTouched();
    });
}
function updateControl(control, dir) {
    if (control._pendingDirty)
        control.markAsDirty();
    control.setValue(control._pendingValue, { emitModelToViewChange: false });
    dir.viewToModelUpdate(control._pendingValue);
    control._pendingChange = false;
}
function setUpModelChangePipeline(control, dir) {
    const onChange = (newValue, emitModelEvent) => {
        // control -> view
        dir.valueAccessor.writeValue(newValue);
        // control -> ngModel
        if (emitModelEvent)
            dir.viewToModelUpdate(newValue);
    };
    control.registerOnChange(onChange);
    // Register a callback function to cleanup onChange handler
    // from a control instance when a directive is destroyed.
    dir._registerOnDestroy(() => {
        control._unregisterOnChange(onChange);
    });
}
/**
 * Links a FormGroup or FormArray instance and corresponding Form directive by setting up validators
 * present in the view.
 *
 * @param control FormGroup or FormArray instance that should be linked.
 * @param dir Directive that provides view validators.
 */
export function setUpFormContainer(control, dir) {
    if (control == null && (typeof ngDevMode === 'undefined' || ngDevMode))
        _throwError(dir, 'Cannot find control with');
    setUpValidators(control, dir);
}
/**
 * Reverts the setup performed by the `setUpFormContainer` function.
 *
 * @param control FormGroup or FormArray instance that should be cleaned up.
 * @param dir Directive that provided view validators.
 * @returns true if a control was updated as a result of this action.
 */
export function cleanUpFormContainer(control, dir) {
    return cleanUpValidators(control, dir);
}
function _noControlError(dir) {
    return _throwError(dir, 'There is no FormControl instance attached to form control element with');
}
function _throwError(dir, message) {
    const messageEnd = _describeControlLocation(dir);
    throw new Error(`${message} ${messageEnd}`);
}
function _describeControlLocation(dir) {
    const path = dir.path;
    if (path && path.length > 1)
        return `path: '${path.join(' -> ')}'`;
    if (path?.[0])
        return `name: '${path}'`;
    return 'unspecified name attribute';
}
function _throwMissingValueAccessorError(dir) {
    const loc = _describeControlLocation(dir);
    throw new RuntimeError(-1203 /* RuntimeErrorCode.NG_MISSING_VALUE_ACCESSOR */, `No value accessor for form control ${loc}.`);
}
function _throwInvalidValueAccessorError(dir) {
    const loc = _describeControlLocation(dir);
    throw new RuntimeError(1200 /* RuntimeErrorCode.NG_VALUE_ACCESSOR_NOT_PROVIDED */, `Value accessor was not provided as an array for form control with ${loc}. ` +
        `Check that the \`NG_VALUE_ACCESSOR\` token is configured as a \`multi: true\` provider.`);
}
export function isPropertyUpdated(changes, viewModel) {
    if (!changes.hasOwnProperty('model'))
        return false;
    const change = changes['model'];
    if (change.isFirstChange())
        return true;
    return !Object.is(viewModel, change.currentValue);
}
export function isBuiltInAccessor(valueAccessor) {
    // Check if a given value accessor is an instance of a class that directly extends
    // `BuiltInControlValueAccessor` one.
    return Object.getPrototypeOf(valueAccessor.constructor) === BuiltInControlValueAccessor;
}
export function syncPendingControls(form, directives) {
    form._syncPendingControls();
    directives.forEach((dir) => {
        const control = dir.control;
        if (control.updateOn === 'submit' && control._pendingChange) {
            dir.viewToModelUpdate(control._pendingValue);
            control._pendingChange = false;
        }
    });
}
// TODO: vsavkin remove it once https://github.com/angular/angular/issues/3011 is implemented
export function selectValueAccessor(dir, valueAccessors) {
    if (!valueAccessors)
        return null;
    if (!Array.isArray(valueAccessors) && (typeof ngDevMode === 'undefined' || ngDevMode))
        _throwInvalidValueAccessorError(dir);
    let defaultAccessor = undefined;
    let builtinAccessor = undefined;
    let customAccessor = undefined;
    valueAccessors.forEach((v) => {
        if (v.constructor === DefaultValueAccessor) {
            defaultAccessor = v;
        }
        else if (isBuiltInAccessor(v)) {
            if (builtinAccessor && (typeof ngDevMode === 'undefined' || ngDevMode))
                _throwError(dir, 'More than one built-in value accessor matches form control with');
            builtinAccessor = v;
        }
        else {
            if (customAccessor && (typeof ngDevMode === 'undefined' || ngDevMode))
                _throwError(dir, 'More than one custom value accessor matches form control with');
            customAccessor = v;
        }
    });
    if (customAccessor)
        return customAccessor;
    if (builtinAccessor)
        return builtinAccessor;
    if (defaultAccessor)
        return defaultAccessor;
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
        _throwError(dir, 'No valid value accessor for form control with');
    }
    return null;
}
export function removeListItem(list, el) {
    const index = list.indexOf(el);
    if (index > -1)
        list.splice(index, 1);
}
// TODO(kara): remove after deprecation period
export function _ngModelWarning(name, type, instance, warningConfig) {
    if (warningConfig === 'never')
        return;
    if (((warningConfig === null || warningConfig === 'once') && !type._ngModelWarningSentOnce) ||
        (warningConfig === 'always' && !instance._ngModelWarningSent)) {
        console.warn(ngModelWarning(name));
        type._ngModelWarningSentOnce = true;
        instance._ngModelWarningSent = true;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hhcmVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvZm9ybXMvc3JjL2RpcmVjdGl2ZXMvc2hhcmVkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBUyxjQUFjLEVBQUUsYUFBYSxJQUFJLFlBQVksRUFBQyxNQUFNLGVBQWUsQ0FBQztBQU9wRixPQUFPLEVBQUMseUJBQXlCLEVBQUUsb0JBQW9CLEVBQUUsZUFBZSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBSy9GLE9BQU8sRUFBQywyQkFBMkIsRUFBdUIsTUFBTSwwQkFBMEIsQ0FBQztBQUMzRixPQUFPLEVBQUMsb0JBQW9CLEVBQUMsTUFBTSwwQkFBMEIsQ0FBQztBQUc5RCxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFHakQ7Ozs7O0dBS0c7QUFDSCxNQUFNLENBQUMsTUFBTSx1QkFBdUIsR0FBRyxJQUFJLGNBQWMsQ0FBQyxzQkFBc0IsRUFBRTtJQUNoRixVQUFVLEVBQUUsTUFBTTtJQUNsQixPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsdUJBQXVCO0NBQ3ZDLENBQUMsQ0FBQztBQVlIOztHQUVHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sdUJBQXVCLEdBQTJCLFFBQVEsQ0FBQztBQUV4RSxNQUFNLFVBQVUsV0FBVyxDQUFDLElBQW1CLEVBQUUsTUFBd0I7SUFDdkUsT0FBTyxDQUFDLEdBQUcsTUFBTSxDQUFDLElBQUssRUFBRSxJQUFLLENBQUMsQ0FBQztBQUNsQyxDQUFDO0FBRUQ7Ozs7OztHQU1HO0FBQ0gsTUFBTSxVQUFVLFlBQVksQ0FDMUIsT0FBb0IsRUFDcEIsR0FBYyxFQUNkLHVCQUErQyx1QkFBdUI7SUFFdEUsSUFBSSxPQUFPLFNBQVMsS0FBSyxXQUFXLElBQUksU0FBUyxFQUFFLENBQUM7UUFDbEQsSUFBSSxDQUFDLE9BQU87WUFBRSxXQUFXLENBQUMsR0FB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QU8sZUFBZSxDQUFDO0lBQzVDLElBQUksZUFBZTtRQUFFLE9BQU8sZUFBZSxDQUFDO0lBRTVDLElBQUksT0FBTyxTQUFTLEtBQUssV0FBVyxJQUFJLFNBQVMsRUFBRSxDQUFDO1FBQ2xELFdBQVcsQ0FBQyxHQUFHLEVBQUUsK0NBQStDLENBQUMsQ0FBQztJQUNwRSxDQUFDO0lBQ0QsT0FBTyxJQUFJLENBQUM7QUFDZCxDQUFDO0FBRUQsTUFBTSxVQUFVLGNBQWMsQ0FBSSxJQUFTLEVBQUUsRUFBSztJQUNoRCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQy9CLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQztRQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3hDLENBQUM7QUFFRCw4Q0FBOEM7QUFDOUMsTUFBTSxVQUFVLGVBQWUsQ0FDN0IsSUFBWSxFQUNaLElBQXdDLEVBQ3hDLFFBQXdDLEVBQ3hDLGFBQTRCO0lBRTVCLElBQUksYUFBYSxLQUFLLE9BQU87UUFBRSxPQUFPO0lBRXRDLElBQ0UsQ0FBQyxDQUFDLGFBQWEsS0FBSyxJQUFJLElBQUksYUFBYSxLQUFLLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDO1FBQ3ZGLENBQUMsYUFBYSxLQUFLLFFBQVEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxFQUM3RCxDQUFDO1FBQ0QsT0FBTyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNuQyxJQUFJLENBQUMsdUJBQXVCLEdBQUcsSUFBSSxDQUFDO1FBQ3BDLFFBQVEsQ0FBQyxtQkFBbUIsR0FBRyxJQUFJLENBQUM7SUFDdEMsQ0FBQztBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtJbmplY3QsIEluamVjdGlvblRva2VuLCDJtVJ1bnRpbWVFcnJvciBhcyBSdW50aW1lRXJyb3J9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge1J1bnRpbWVFcnJvckNvZGV9IGZyb20gJy4uL2Vycm9ycyc7XG5pbXBvcnQge0Fic3RyYWN0Q29udHJvbH0gZnJvbSAnLi4vbW9kZWwvYWJzdHJhY3RfbW9kZWwnO1xuaW1wb3J0IHtGb3JtQXJyYXl9IGZyb20gJy4uL21vZGVsL2Zvcm1fYXJyYXknO1xuaW1wb3J0IHtGb3JtQ29udHJvbH0gZnJvbSAnLi4vbW9kZWwvZm9ybV9jb250cm9sJztcbmltcG9ydCB7Rm9ybUdyb3VwfSBmcm9tICcuLi9tb2RlbC9mb3JtX2dyb3VwJztcbmltcG9ydCB7Z2V0Q29udHJvbEFzeW5jVmFsaWRhdG9ycywgZ2V0Q29udHJvbFZhbGlkYXRvcnMsIG1lcmdlVmFsaWRhdG9yc30gZnJvbSAnLi4vdmFsaWRhdG9ycyc7XG5cbmltcG9ydCB7QWJzdHJhY3RDb250cm9sRGlyZWN0aXZlfSBmcm9tICcuL2Fic3RyYWN0X2NvbnRyb2xfZGlyZWN0aXZlJztcbmltcG9ydCB7QWJzdHJhY3RGb3JtR3JvdXBEaXJlY3RpdmV9IGZyb20gJy4vYWJzdHJhY3RfZm9ybV9ncm91cF9kaXJlY3RpdmUnO1xuaW1wb3J0IHtDb250cm9sQ29udGFpbmVyfSBmcm9tICcuL2NvbnRyb2xfY29udGFpbmVyJztcbmltcG9ydCB7QnVpbHRJbkNvbnRyb2xWYWx1ZUFjY2Vzc29yLCBDb250cm9sVmFsdWVBY2Nlc3Nvcn0gZnJvbSAnLi9jb250cm9sX3ZhbHVlX2FjY2Vzc29yJztcbmltcG9ydCB7RGVmYXVsdFZhbHVlQWNjZXNzb3J9IGZyb20gJy4vZGVmYXVsdF92YWx1ZV9hY2Nlc3Nvcic7XG5pbXBvcnQge05nQ29udHJvbH0gZnJvbSAnLi9uZ19jb250cm9sJztcbmltcG9ydCB7Rm9ybUFycmF5TmFtZX0gZnJvbSAnLi9yZWFjdGl2ZV9kaXJlY3RpdmVzL2Zvcm1fZ3JvdXBfbmFtZSc7XG5pbXBvcnQge25nTW9kZWxXYXJuaW5nfSBmcm9tICcuL3JlYWN0aXZlX2Vycm9ycyc7XG5pbXBvcnQge0FzeW5jVmFsaWRhdG9yRm4sIFZhbGlkYXRvciwgVmFsaWRhdG9yRm59IGZyb20gJy4vdmFsaWRhdG9ycyc7XG5cbi8qKlxuICogVG9rZW4gdG8gcHJvdmlkZSB0byBhbGxvdyBTZXREaXNhYmxlZFN0YXRlIHRvIGFsd2F5cyBiZSBjYWxsZWQgd2hlbiBhIENWQSBpcyBhZGRlZCwgcmVnYXJkbGVzcyBvZlxuICogd2hldGhlciB0aGUgY29udHJvbCBpcyBkaXNhYmxlZCBvciBlbmFibGVkLlxuICpcbiAqIEBzZWUge0BsaW5rIEZvcm1zTW9kdWxlI3dpdGhjb25maWd9XG4gKi9cbmV4cG9ydCBjb25zdCBDQUxMX1NFVF9ESVNBQkxFRF9TVEFURSA9IG5ldyBJbmplY3Rpb25Ub2tlbignQ2FsbFNldERpc2FibGVkU3RhdGUnLCB7XG4gIHByb3ZpZGVkSW46ICdyb290JyxcbiAgZmFjdG9yeTogKCkgPT4gc2V0RGlzYWJsZWRTdGF0ZURlZmF1bHQsXG59KTtcblxuLyoqXG4gKiBUaGUgdHlwZSBmb3IgQ0FMTF9TRVRfRElTQUJMRURfU1RBVEUuIElmIGBhbHdheXNgLCB0aGVuIENvbnRyb2xWYWx1ZUFjY2Vzc29yIHdpbGwgYWx3YXlzIGNhbGxcbiAqIGBzZXREaXNhYmxlZFN0YXRlYCB3aGVuIGF0dGFjaGVkLCB3aGljaCBpcyB0aGUgbW9zdCBjb3JyZWN0IGJlaGF2aW9yLiBPdGhlcndpc2UsIGl0IHdpbGwgb25seSBiZVxuICogY2FsbGVkIHdoZW4gZGlzYWJsZWQsIHdoaWNoIGlzIHRoZSBsZWdhY3kgYmVoYXZpb3IgZm9yIGNvbXBhdGliaWxpdHkuXG4gKlxuICogQHB1YmxpY0FwaVxuICogQHNlZSB7QGxpbmsgRm9ybXNNb2R1bGUjd2l0aGNvbmZpZ31cbiAqL1xuZXhwb3J0IHR5cGUgU2V0RGlzYWJsZWRTdGF0ZU9wdGlvbiA9ICd3aGVuRGlzYWJsZWRGb3JMZWdhY3lDb2RlJyB8ICdhbHdheXMnO1xuXG4vKipcbiAqIFdoZXRoZXIgdG8gdXNlIHRoZSBmaXhlZCBzZXREaXNhYmxlZFN0YXRlIGJlaGF2aW9yIGJ5IGRlZmF1bHQuXG4gKi9cbmV4cG9ydCBjb25zdCBzZXREaXNhYmxlZFN0YXRlRGVmYXVsdDogU2V0RGlzYWJsZWRTdGF0ZU9wdGlvbiA9ICdhbHdheXMnO1xuXG5leHBvcnQgZnVuY3Rpb24gY29udHJvbFBhdGgobmFtZTogc3RyaW5nIHwgbnVsbCwgcGFyZW50OiBDb250cm9sQ29udGFpbmVyKTogc3RyaW5nW10ge1xuICByZXR1cm4gWy4uLnBhcmVudC5wYXRoISwgbmFtZSFdO1xufVxuXG4vKipcbiAqIExpbmtzIGEgRm9ybSBjb250cm9sIGFuZCBhIEZvcm0gZGlyZWN0aXZlIGJ5IHNldHRpbmcgdXAgY2FsbGJhY2tzIChzdWNoIGFzIGBvbkNoYW5nZWApIG9uIGJvdGhcbiAqIGluc3RhbmNlcy4gVGhpcyBmdW5jdGlvbiBpcyB0eXBpY2FsbHkgaW52b2tlZCB3aGVuIGZvcm0gZGlyZWN0aXZlIGlzIGJlaW5nIGluaXRpYWxpemVkLlxuICpcbiAqIEBwYXJhbSBjb250cm9sIEZvcm0gY29udHJvbCBpbnN0YW5jZSB0aGF0IHNob3VsZCBiZSBsaW5rZWQuXG4gKiBAcGFyYW0gZGlyIERpcmVjdGl2ZSB0aGF0IHNob3VsZCBiZSBsaW5rZWQgd2l0aCBhIGdpdmVuIGNvbnRyb2wuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXRVcENvbnRyb2woXG4gIGNvbnRyb2w6IEZvcm1Db250cm9sLFxuICBkaXI6IE5nQ29udHJvbCxcbiAgY2FsbFNldERpc2FibGVkU3RhdGU6IFNldERpc2FibGVkU3RhdGVPcHRpb24gPSBzZXREaXNhYmxlZFN0YXRlRGVmYXVsdCxcbik6IHZvaWQge1xuICBpZiAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSB7XG4gICAgaWYgKCFjb250cm9sKSBfdGhyb3dFcnJvcihkaXIsICdDYW5ub3QgZmluZCBjb250cm9sIHdpdGgnKTtcbiAgICBpZiAoIWRpci52YWx1ZUFjY2Vzc29yKSBfdGhyb3dNaXNzaW5nVmFsdWVBY2Nlc3NvckVycm9yKGRpcik7XG4gIH1cblxuICBzZXRVcFZhbGlkYXRvcnMoY29udHJvbCwgZGlyKTtcblxuICBkaXIudmFsdWVBY2Nlc3NvciEud3JpdGVWYWx1ZShjb250cm9sLnZhbHVlKTtcblxuICAvLyBUaGUgbGVnYWN5IGJlaGF2aW9yIG9ubHkgY2FsbHMgdGhlIENWQSdzIGBzZXREaXNhYmxlZFN0YXRlYCBpZiB0aGUgY29udHJvbCBpcyBkaXNhYmxlZC5cbiAgLy8gSWYgdGhlIGBjYWxsU2V0RGlzYWJsZWRTdGF0ZWAgb3B0aW9uIGlzIHNldCB0byBgYWx3YXlzYCwgdGhlbiB0aGlzIGJ1ZyBpcyBmaXhlZCBhbmRcbiAgLy8gdGhlIG1ldGhvZCBpcyBhbHdheXMgY2FsbGVkLlxuICBpZiAoY29udHJvbC5kaXNhYmxlZCB8fCBjYWxsU2V0RGlzYWJsZWRTdGF0ZSA9PT0gJ2Fsd2F5cycpIHtcbiAgICBkaXIudmFsdWVBY2Nlc3NvciEuc2V0RGlzYWJsZWRTdGF0ZT8uKGNvbnRyb2wuZGlzYWJsZWQpO1xuICB9XG5cbiAgc2V0VXBWaWV3Q2hhbmdlUGlwZWxpbmUoY29udHJvbCwgZGlyKTtcbiAgc2V0VXBNb2RlbENoYW5nZVBpcGVsaW5lKGNvbnRyb2wsIGRpcik7XG5cbiAgc2V0VXBCbHVyUGlwZWxpbmUoY29udHJvbCwgZGlyKTtcblxuICBzZXRVcERpc2FibGVkQ2hhbmdlSGFuZGxlcihjb250cm9sLCBkaXIpO1xufVxuXG4vKipcbiAqIFJldmVydHMgY29uZmlndXJhdGlvbiBwZXJmb3JtZWQgYnkgdGhlIGBzZXRVcENvbnRyb2xgIGNvbnRyb2wgZnVuY3Rpb24uXG4gKiBFZmZlY3RpdmVseSBkaXNjb25uZWN0cyBmb3JtIGNvbnRyb2wgd2l0aCBhIGdpdmVuIGZvcm0gZGlyZWN0aXZlLlxuICogVGhpcyBmdW5jdGlvbiBpcyB0eXBpY2FsbHkgaW52b2tlZCB3aGVuIGNvcnJlc3BvbmRpbmcgZm9ybSBkaXJlY3RpdmUgaXMgYmVpbmcgZGVzdHJveWVkLlxuICpcbiAqIEBwYXJhbSBjb250cm9sIEZvcm0gY29udHJvbCB3aGljaCBzaG91bGQgYmUgY2xlYW5lZCB1cC5cbiAqIEBwYXJhbSBkaXIgRGlyZWN0aXZlIHRoYXQgc2hvdWxkIGJlIGRpc2Nvbm5lY3RlZCBmcm9tIGEgZ2l2ZW4gY29udHJvbC5cbiAqIEBwYXJhbSB2YWxpZGF0ZUNvbnRyb2xQcmVzZW5jZU9uQ2hhbmdlIEZsYWcgdGhhdCBpbmRpY2F0ZXMgd2hldGhlciBvbkNoYW5nZSBoYW5kbGVyIHNob3VsZFxuICogICAgIGNvbnRhaW4gYXNzZXJ0cyB0byB2ZXJpZnkgdGhhdCBpdCdzIG5vdCBjYWxsZWQgb25jZSBkaXJlY3RpdmUgaXMgZGVzdHJveWVkLiBXZSBuZWVkIHRoaXMgZmxhZ1xuICogICAgIHRvIGF2b2lkIHBvdGVudGlhbGx5IGJyZWFraW5nIGNoYW5nZXMgY2F1c2VkIGJ5IGJldHRlciBjb250cm9sIGNsZWFudXAgaW50cm9kdWNlZCBpbiAjMzkyMzUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjbGVhblVwQ29udHJvbChcbiAgY29udHJvbDogRm9ybUNvbnRyb2wgfCBudWxsLFxuICBkaXI6IE5nQ29udHJvbCxcbiAgdmFsaWRhdGVDb250cm9sUHJlc2VuY2VPbkNoYW5nZTogYm9vbGVhbiA9IHRydWUsXG4pOiB2b2lkIHtcbiAgY29uc3Qgbm9vcCA9ICgpID0+IHtcbiAgICBpZiAodmFsaWRhdGVDb250cm9sUHJlc2VuY2VPbkNoYW5nZSAmJiAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSkge1xuICAgICAgX25vQ29udHJvbEVycm9yKGRpcik7XG4gICAgfVxuICB9O1xuXG4gIC8vIFRoZSBgdmFsdWVBY2Nlc3NvcmAgZmllbGQgaXMgdHlwaWNhbGx5IGRlZmluZWQgb24gRnJvbUNvbnRyb2wgYW5kIEZvcm1Db250cm9sTmFtZSBkaXJlY3RpdmVcbiAgLy8gaW5zdGFuY2VzIGFuZCB0aGVyZSBpcyBhIGxvZ2ljIGluIGBzZWxlY3RWYWx1ZUFjY2Vzc29yYCBmdW5jdGlvbiB0aGF0IHRocm93cyBpZiBpdCdzIG5vdCB0aGVcbiAgLy8gY2FzZS4gV2Ugc3RpbGwgY2hlY2sgdGhlIHByZXNlbmNlIG9mIGB2YWx1ZUFjY2Vzc29yYCBiZWZvcmUgaW52b2tpbmcgaXRzIG1ldGhvZHMgdG8gbWFrZSBzdXJlXG4gIC8vIHRoYXQgY2xlYW51cCB3b3JrcyBjb3JyZWN0bHkgaWYgYXBwIGNvZGUgb3IgdGVzdHMgYXJlIHNldHVwIHRvIGlnbm9yZSB0aGUgZXJyb3IgdGhyb3duIGZyb21cbiAgLy8gYHNlbGVjdFZhbHVlQWNjZXNzb3JgLiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci9pc3N1ZXMvNDA1MjEuXG4gIGlmIChkaXIudmFsdWVBY2Nlc3Nvcikge1xuICAgIGRpci52YWx1ZUFjY2Vzc29yLnJlZ2lzdGVyT25DaGFuZ2Uobm9vcCk7XG4gICAgZGlyLnZhbHVlQWNjZXNzb3IucmVnaXN0ZXJPblRvdWNoZWQobm9vcCk7XG4gIH1cblxuICBjbGVhblVwVmFsaWRhdG9ycyhjb250cm9sLCBkaXIpO1xuXG4gIGlmIChjb250cm9sKSB7XG4gICAgZGlyLl9pbnZva2VPbkRlc3Ryb3lDYWxsYmFja3MoKTtcbiAgICBjb250cm9sLl9yZWdpc3Rlck9uQ29sbGVjdGlvbkNoYW5nZSgoKSA9PiB7fSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gcmVnaXN0ZXJPblZhbGlkYXRvckNoYW5nZTxWPih2YWxpZGF0b3JzOiAoViB8IFZhbGlkYXRvcilbXSwgb25DaGFuZ2U6ICgpID0+IHZvaWQpOiB2b2lkIHtcbiAgdmFsaWRhdG9ycy5mb3JFYWNoKCh2YWxpZGF0b3I6IFYgfCBWYWxpZGF0b3IpID0+IHtcbiAgICBpZiAoKDxWYWxpZGF0b3I+dmFsaWRhdG9yKS5yZWdpc3Rlck9uVmFsaWRhdG9yQ2hhbmdlKVxuICAgICAgKDxWYWxpZGF0b3I+dmFsaWRhdG9yKS5yZWdpc3Rlck9uVmFsaWRhdG9yQ2hhbmdlIShvbkNoYW5nZSk7XG4gIH0pO1xufVxuXG4vKipcbiAqIFNldHMgdXAgZGlzYWJsZWQgY2hhbmdlIGhhbmRsZXIgZnVuY3Rpb24gb24gYSBnaXZlbiBmb3JtIGNvbnRyb2wgaWYgQ29udHJvbFZhbHVlQWNjZXNzb3JcbiAqIGFzc29jaWF0ZWQgd2l0aCBhIGdpdmVuIGRpcmVjdGl2ZSBpbnN0YW5jZSBzdXBwb3J0cyB0aGUgYHNldERpc2FibGVkU3RhdGVgIGNhbGwuXG4gKlxuICogQHBhcmFtIGNvbnRyb2wgRm9ybSBjb250cm9sIHdoZXJlIGRpc2FibGVkIGNoYW5nZSBoYW5kbGVyIHNob3VsZCBiZSBzZXR1cC5cbiAqIEBwYXJhbSBkaXIgQ29ycmVzcG9uZGluZyBkaXJlY3RpdmUgaW5zdGFuY2UgYXNzb2NpYXRlZCB3aXRoIHRoaXMgY29udHJvbC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldFVwRGlzYWJsZWRDaGFuZ2VIYW5kbGVyKGNvbnRyb2w6IEZvcm1Db250cm9sLCBkaXI6IE5nQ29udHJvbCk6IHZvaWQge1xuICBpZiAoZGlyLnZhbHVlQWNjZXNzb3IhLnNldERpc2FibGVkU3RhdGUpIHtcbiAgICBjb25zdCBvbkRpc2FibGVkQ2hhbmdlID0gKGlzRGlzYWJsZWQ6IGJvb2xlYW4pID0+IHtcbiAgICAgIGRpci52YWx1ZUFjY2Vzc29yIS5zZXREaXNhYmxlZFN0YXRlIShpc0Rpc2FibGVkKTtcbiAgICB9O1xuICAgIGNvbnRyb2wucmVnaXN0ZXJPbkRpc2FibGVkQ2hhbmdlKG9uRGlzYWJsZWRDaGFuZ2UpO1xuXG4gICAgLy8gUmVnaXN0ZXIgYSBjYWxsYmFjayBmdW5jdGlvbiB0byBjbGVhbnVwIGRpc2FibGVkIGNoYW5nZSBoYW5kbGVyXG4gICAgLy8gZnJvbSBhIGNvbnRyb2wgaW5zdGFuY2Ugd2hlbiBhIGRpcmVjdGl2ZSBpcyBkZXN0cm95ZWQuXG4gICAgZGlyLl9yZWdpc3Rlck9uRGVzdHJveSgoKSA9PiB7XG4gICAgICBjb250cm9sLl91bnJlZ2lzdGVyT25EaXNhYmxlZENoYW5nZShvbkRpc2FibGVkQ2hhbmdlKTtcbiAgICB9KTtcbiAgfVxufVxuXG4vKipcbiAqIFNldHMgdXAgc3luYyBhbmQgYXN5bmMgZGlyZWN0aXZlIHZhbGlkYXRvcnMgb24gcHJvdmlkZWQgZm9ybSBjb250cm9sLlxuICogVGhpcyBmdW5jdGlvbiBtZXJnZXMgdmFsaWRhdG9ycyBmcm9tIHRoZSBkaXJlY3RpdmUgaW50byB0aGUgdmFsaWRhdG9ycyBvZiB0aGUgY29udHJvbC5cbiAqXG4gKiBAcGFyYW0gY29udHJvbCBGb3JtIGNvbnRyb2wgd2hlcmUgZGlyZWN0aXZlIHZhbGlkYXRvcnMgc2hvdWxkIGJlIHNldHVwLlxuICogQHBhcmFtIGRpciBEaXJlY3RpdmUgaW5zdGFuY2UgdGhhdCBjb250YWlucyB2YWxpZGF0b3JzIHRvIGJlIHNldHVwLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0VXBWYWxpZGF0b3JzKGNvbnRyb2w6IEFic3RyYWN0Q29udHJvbCwgZGlyOiBBYnN0cmFjdENvbnRyb2xEaXJlY3RpdmUpOiB2b2lkIHtcbiAgY29uc3QgdmFsaWRhdG9ycyA9IGdldENvbnRyb2xWYWxpZGF0b3JzKGNvbnRyb2wpO1xuICBpZiAoZGlyLnZhbGlkYXRvciAhPT0gbnVsbCkge1xuICAgIGNvbnRyb2wuc2V0VmFsaWRhdG9ycyhtZXJnZVZhbGlkYXRvcnM8VmFsaWRhdG9yRm4+KHZhbGlkYXRvcnMsIGRpci52YWxpZGF0b3IpKTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgdmFsaWRhdG9ycyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIC8vIElmIHN5bmMgdmFsaWRhdG9ycyBhcmUgcmVwcmVzZW50ZWQgYnkgYSBzaW5nbGUgdmFsaWRhdG9yIGZ1bmN0aW9uLCB3ZSBmb3JjZSB0aGVcbiAgICAvLyBgVmFsaWRhdG9ycy5jb21wb3NlYCBjYWxsIHRvIGhhcHBlbiBieSBleGVjdXRpbmcgdGhlIGBzZXRWYWxpZGF0b3JzYCBmdW5jdGlvbiB3aXRoXG4gICAgLy8gYW4gYXJyYXkgdGhhdCBjb250YWlucyB0aGF0IGZ1bmN0aW9uLiBXZSBuZWVkIHRoaXMgdG8gYXZvaWQgcG9zc2libGUgZGlzY3JlcGFuY2llcyBpblxuICAgIC8vIHZhbGlkYXRvcnMgYmVoYXZpb3IsIHNvIHN5bmMgdmFsaWRhdG9ycyBhcmUgYWx3YXlzIHByb2Nlc3NlZCBieSB0aGUgYFZhbGlkYXRvcnMuY29tcG9zZWAuXG4gICAgLy8gTm90ZTogd2Ugc2hvdWxkIGNvbnNpZGVyIG1vdmluZyB0aGlzIGxvZ2ljIGluc2lkZSB0aGUgYHNldFZhbGlkYXRvcnNgIGZ1bmN0aW9uIGl0c2VsZiwgc28gd2VcbiAgICAvLyBoYXZlIGNvbnNpc3RlbnQgYmVoYXZpb3Igb24gQWJzdHJhY3RDb250cm9sIEFQSSBsZXZlbC4gVGhlIHNhbWUgYXBwbGllcyB0byB0aGUgYXN5bmNcbiAgICAvLyB2YWxpZGF0b3JzIGxvZ2ljIGJlbG93LlxuICAgIGNvbnRyb2wuc2V0VmFsaWRhdG9ycyhbdmFsaWRhdG9yc10pO1xuICB9XG5cbiAgY29uc3QgYXN5bmNWYWxpZGF0b3JzID0gZ2V0Q29udHJvbEFzeW5jVmFsaWRhdG9ycyhjb250cm9sKTtcbiAgaWYgKGRpci5hc3luY1ZhbGlkYXRvciAhPT0gbnVsbCkge1xuICAgIGNvbnRyb2wuc2V0QXN5bmNWYWxpZGF0b3JzKFxuICAgICAgbWVyZ2VWYWxpZGF0b3JzPEFzeW5jVmFsaWRhdG9yRm4+KGFzeW5jVmFsaWRhdG9ycywgZGlyLmFzeW5jVmFsaWRhdG9yKSxcbiAgICApO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBhc3luY1ZhbGlkYXRvcnMgPT09ICdmdW5jdGlvbicpIHtcbiAgICBjb250cm9sLnNldEFzeW5jVmFsaWRhdG9ycyhbYXN5bmNWYWxpZGF0b3JzXSk7XG4gIH1cblxuICAvLyBSZS1ydW4gdmFsaWRhdGlvbiB3aGVuIHZhbGlkYXRvciBiaW5kaW5nIGNoYW5nZXMsIGUuZy4gbWlubGVuZ3RoPTMgLT4gbWlubGVuZ3RoPTRcbiAgY29uc3Qgb25WYWxpZGF0b3JDaGFuZ2UgPSAoKSA9PiBjb250cm9sLnVwZGF0ZVZhbHVlQW5kVmFsaWRpdHkoKTtcbiAgcmVnaXN0ZXJPblZhbGlkYXRvckNoYW5nZTxWYWxpZGF0b3JGbj4oZGlyLl9yYXdWYWxpZGF0b3JzLCBvblZhbGlkYXRvckNoYW5nZSk7XG4gIHJlZ2lzdGVyT25WYWxpZGF0b3JDaGFuZ2U8QXN5bmNWYWxpZGF0b3JGbj4oZGlyLl9yYXdBc3luY1ZhbGlkYXRvcnMsIG9uVmFsaWRhdG9yQ2hhbmdlKTtcbn1cblxuLyoqXG4gKiBDbGVhbnMgdXAgc3luYyBhbmQgYXN5bmMgZGlyZWN0aXZlIHZhbGlkYXRvcnMgb24gcHJvdmlkZWQgZm9ybSBjb250cm9sLlxuICogVGhpcyBmdW5jdGlvbiByZXZlcnRzIHRoZSBzZXR1cCBwZXJmb3JtZWQgYnkgdGhlIGBzZXRVcFZhbGlkYXRvcnNgIGZ1bmN0aW9uLCBpLmUuXG4gKiByZW1vdmVzIGRpcmVjdGl2ZS1zcGVjaWZpYyB2YWxpZGF0b3JzIGZyb20gYSBnaXZlbiBjb250cm9sIGluc3RhbmNlLlxuICpcbiAqIEBwYXJhbSBjb250cm9sIEZvcm0gY29udHJvbCBmcm9tIHdoZXJlIGRpcmVjdGl2ZSB2YWxpZGF0b3JzIHNob3VsZCBiZSByZW1vdmVkLlxuICogQHBhcmFtIGRpciBEaXJlY3RpdmUgaW5zdGFuY2UgdGhhdCBjb250YWlucyB2YWxpZGF0b3JzIHRvIGJlIHJlbW92ZWQuXG4gKiBAcmV0dXJucyB0cnVlIGlmIGEgY29udHJvbCB3YXMgdXBkYXRlZCBhcyBhIHJlc3VsdCBvZiB0aGlzIGFjdGlvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNsZWFuVXBWYWxpZGF0b3JzKFxuICBjb250cm9sOiBBYnN0cmFjdENvbnRyb2wgfCBudWxsLFxuICBkaXI6IEFic3RyYWN0Q29udHJvbERpcmVjdGl2ZSxcbik6IGJvb2xlYW4ge1xuICBsZXQgaXNDb250cm9sVXBkYXRlZCA9IGZhbHNlO1xuICBpZiAoY29udHJvbCAhPT0gbnVsbCkge1xuICAgIGlmIChkaXIudmFsaWRhdG9yICE9PSBudWxsKSB7XG4gICAgICBjb25zdCB2YWxpZGF0b3JzID0gZ2V0Q29udHJvbFZhbGlkYXRvcnMoY29udHJvbCk7XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWxpZGF0b3JzKSAmJiB2YWxpZGF0b3JzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgLy8gRmlsdGVyIG91dCBkaXJlY3RpdmUgdmFsaWRhdG9yIGZ1bmN0aW9uLlxuICAgICAgICBjb25zdCB1cGRhdGVkVmFsaWRhdG9ycyA9IHZhbGlkYXRvcnMuZmlsdGVyKCh2YWxpZGF0b3IpID0+IHZhbGlkYXRvciAhPT0gZGlyLnZhbGlkYXRvcik7XG4gICAgICAgIGlmICh1cGRhdGVkVmFsaWRhdG9ycy5sZW5ndGggIT09IHZhbGlkYXRvcnMubGVuZ3RoKSB7XG4gICAgICAgICAgaXNDb250cm9sVXBkYXRlZCA9IHRydWU7XG4gICAgICAgICAgY29udHJvbC5zZXRWYWxpZGF0b3JzKHVwZGF0ZWRWYWxpZGF0b3JzKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChkaXIuYXN5bmNWYWxpZGF0b3IgIT09IG51bGwpIHtcbiAgICAgIGNvbnN0IGFzeW5jVmFsaWRhdG9ycyA9IGdldENvbnRyb2xBc3luY1ZhbGlkYXRvcnMoY29udHJvbCk7XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShhc3luY1ZhbGlkYXRvcnMpICYmIGFzeW5jVmFsaWRhdG9ycy5sZW5ndGggPiAwKSB7XG4gICAgICAgIC8vIEZpbHRlciBvdXQgZGlyZWN0aXZlIGFzeW5jIHZhbGlkYXRvciBmdW5jdGlvbi5cbiAgICAgICAgY29uc3QgdXBkYXRlZEFzeW5jVmFsaWRhdG9ycyA9IGFzeW5jVmFsaWRhdG9ycy5maWx0ZXIoXG4gICAgICAgICAgKGFzeW5jVmFsaWRhdG9yKSA9PiBhc3luY1ZhbGlkYXRvciAhPT0gZGlyLmFzeW5jVmFsaWRhdG9yLFxuICAgICAgICApO1xuICAgICAgICBpZiAodXBkYXRlZEFzeW5jVmFsaWRhdG9ycy5sZW5ndGggIT09IGFzeW5jVmFsaWRhdG9ycy5sZW5ndGgpIHtcbiAgICAgICAgICBpc0NvbnRyb2xVcGRhdGVkID0gdHJ1ZTtcbiAgICAgICAgICBjb250cm9sLnNldEFzeW5jVmFsaWRhdG9ycyh1cGRhdGVkQXN5bmNWYWxpZGF0b3JzKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIENsZWFyIG9uVmFsaWRhdG9yQ2hhbmdlIGNhbGxiYWNrcyBieSBwcm92aWRpbmcgYSBub29wIGZ1bmN0aW9uLlxuICBjb25zdCBub29wID0gKCkgPT4ge307XG4gIHJlZ2lzdGVyT25WYWxpZGF0b3JDaGFuZ2U8VmFsaWRhdG9yRm4+KGRpci5fcmF3VmFsaWRhdG9ycywgbm9vcCk7XG4gIHJlZ2lzdGVyT25WYWxpZGF0b3JDaGFuZ2U8QXN5bmNWYWxpZGF0b3JGbj4oZGlyLl9yYXdBc3luY1ZhbGlkYXRvcnMsIG5vb3ApO1xuXG4gIHJldHVybiBpc0NvbnRyb2xVcGRhdGVkO1xufVxuXG5mdW5jdGlvbiBzZXRVcFZpZXdDaGFuZ2VQaXBlbGluZShjb250cm9sOiBGb3JtQ29udHJvbCwgZGlyOiBOZ0NvbnRyb2wpOiB2b2lkIHtcbiAgZGlyLnZhbHVlQWNjZXNzb3IhLnJlZ2lzdGVyT25DaGFuZ2UoKG5ld1ZhbHVlOiBhbnkpID0+IHtcbiAgICBjb250cm9sLl9wZW5kaW5nVmFsdWUgPSBuZXdWYWx1ZTtcbiAgICBjb250cm9sLl9wZW5kaW5nQ2hhbmdlID0gdHJ1ZTtcbiAgICBjb250cm9sLl9wZW5kaW5nRGlydHkgPSB0cnVlO1xuXG4gICAgaWYgKGNvbnRyb2wudXBkYXRlT24gPT09ICdjaGFuZ2UnKSB1cGRhdGVDb250cm9sKGNvbnRyb2wsIGRpcik7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBzZXRVcEJsdXJQaXBlbGluZShjb250cm9sOiBGb3JtQ29udHJvbCwgZGlyOiBOZ0NvbnRyb2wpOiB2b2lkIHtcbiAgZGlyLnZhbHVlQWNjZXNzb3IhLnJlZ2lzdGVyT25Ub3VjaGVkKCgpID0+IHtcbiAgICBjb250cm9sLl9wZW5kaW5nVG91Y2hlZCA9IHRydWU7XG5cbiAgICBpZiAoY29udHJvbC51cGRhdGVPbiA9PT0gJ2JsdXInICYmIGNvbnRyb2wuX3BlbmRpbmdDaGFuZ2UpIHVwZGF0ZUNvbnRyb2woY29udHJvbCwgZGlyKTtcbiAgICBpZiAoY29udHJvbC51cGRhdGVPbiAhPT0gJ3N1Ym1pdCcpIGNvbnRyb2wubWFya0FzVG91Y2hlZCgpO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlQ29udHJvbChjb250cm9sOiBGb3JtQ29udHJvbCwgZGlyOiBOZ0NvbnRyb2wpOiB2b2lkIHtcbiAgaWYgKGNvbnRyb2wuX3BlbmRpbmdEaXJ0eSkgY29udHJvbC5tYXJrQXNEaXJ0eSgpO1xuICBjb250cm9sLnNldFZhbHVlKGNvbnRyb2wuX3BlbmRpbmdWYWx1ZSwge2VtaXRNb2RlbFRvVmlld0NoYW5nZTogZmFsc2V9KTtcbiAgZGlyLnZpZXdUb01vZGVsVXBkYXRlKGNvbnRyb2wuX3BlbmRpbmdWYWx1ZSk7XG4gIGNvbnRyb2wuX3BlbmRpbmdDaGFuZ2UgPSBmYWxzZTtcbn1cblxuZnVuY3Rpb24gc2V0VXBNb2RlbENoYW5nZVBpcGVsaW5lKGNvbnRyb2w6IEZvcm1Db250cm9sLCBkaXI6IE5nQ29udHJvbCk6IHZvaWQge1xuICBjb25zdCBvbkNoYW5nZSA9IChuZXdWYWx1ZT86IGFueSwgZW1pdE1vZGVsRXZlbnQ/OiBib29sZWFuKSA9PiB7XG4gICAgLy8gY29udHJvbCAtPiB2aWV3XG4gICAgZGlyLnZhbHVlQWNjZXNzb3IhLndyaXRlVmFsdWUobmV3VmFsdWUpO1xuXG4gICAgLy8gY29udHJvbCAtPiBuZ01vZGVsXG4gICAgaWYgKGVtaXRNb2RlbEV2ZW50KSBkaXIudmlld1RvTW9kZWxVcGRhdGUobmV3VmFsdWUpO1xuICB9O1xuICBjb250cm9sLnJlZ2lzdGVyT25DaGFuZ2Uob25DaGFuZ2UpO1xuXG4gIC8vIFJlZ2lzdGVyIGEgY2FsbGJhY2sgZnVuY3Rpb24gdG8gY2xlYW51cCBvbkNoYW5nZSBoYW5kbGVyXG4gIC8vIGZyb20gYSBjb250cm9sIGluc3RhbmNlIHdoZW4gYSBkaXJlY3RpdmUgaXMgZGVzdHJveWVkLlxuICBkaXIuX3JlZ2lzdGVyT25EZXN0cm95KCgpID0+IHtcbiAgICBjb250cm9sLl91bnJlZ2lzdGVyT25DaGFuZ2Uob25DaGFuZ2UpO1xuICB9KTtcbn1cblxuLyoqXG4gKiBMaW5rcyBhIEZvcm1Hcm91cCBvciBGb3JtQXJyYXkgaW5zdGFuY2UgYW5kIGNvcnJlc3BvbmRpbmcgRm9ybSBkaXJlY3RpdmUgYnkgc2V0dGluZyB1cCB2YWxpZGF0b3JzXG4gKiBwcmVzZW50IGluIHRoZSB2aWV3LlxuICpcbiAqIEBwYXJhbSBjb250cm9sIEZvcm1Hcm91cCBvciBGb3JtQXJyYXkgaW5zdGFuY2UgdGhhdCBzaG91bGQgYmUgbGlua2VkLlxuICogQHBhcmFtIGRpciBEaXJlY3RpdmUgdGhhdCBwcm92aWRlcyB2aWV3IHZhbGlkYXRvcnMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXRVcEZvcm1Db250YWluZXIoXG4gIGNvbnRyb2w6IEZvcm1Hcm91cCB8IEZvcm1BcnJheSxcbiAgZGlyOiBBYnN0cmFjdEZvcm1Hcm91cERpcmVjdGl2ZSB8IEZvcm1BcnJheU5hbWUsXG4pIHtcbiAgaWYgKGNvbnRyb2wgPT0gbnVsbCAmJiAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSlcbiAgICBfdGhyb3dFcnJvcihkaXIsICdDYW5ub3QgZmluZCBjb250cm9sIHdpdGgnKTtcbiAgc2V0VXBWYWxpZGF0b3JzKGNvbnRyb2wsIGRpcik7XG59XG5cbi8qKlxuICogUmV2ZXJ0cyB0aGUgc2V0dXAgcGVyZm9ybWVkIGJ5IHRoZSBgc2V0VXBGb3JtQ29udGFpbmVyYCBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0gY29udHJvbCBGb3JtR3JvdXAgb3IgRm9ybUFycmF5IGluc3RhbmNlIHRoYXQgc2hvdWxkIGJlIGNsZWFuZWQgdXAuXG4gKiBAcGFyYW0gZGlyIERpcmVjdGl2ZSB0aGF0IHByb3ZpZGVkIHZpZXcgdmFsaWRhdG9ycy5cbiAqIEByZXR1cm5zIHRydWUgaWYgYSBjb250cm9sIHdhcyB1cGRhdGVkIGFzIGEgcmVzdWx0IG9mIHRoaXMgYWN0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY2xlYW5VcEZvcm1Db250YWluZXIoXG4gIGNvbnRyb2w6IEZvcm1Hcm91cCB8IEZvcm1BcnJheSxcbiAgZGlyOiBBYnN0cmFjdEZvcm1Hcm91cERpcmVjdGl2ZSB8IEZvcm1BcnJheU5hbWUsXG4pOiBib29sZWFuIHtcbiAgcmV0dXJuIGNsZWFuVXBWYWxpZGF0b3JzKGNvbnRyb2wsIGRpcik7XG59XG5cbmZ1bmN0aW9uIF9ub0NvbnRyb2xFcnJvcihkaXI6IE5nQ29udHJvbCkge1xuICByZXR1cm4gX3Rocm93RXJyb3IoZGlyLCAnVGhlcmUgaXMgbm8gRm9ybUNvbnRyb2wgaW5zdGFuY2UgYXR0YWNoZWQgdG8gZm9ybSBjb250cm9sIGVsZW1lbnQgd2l0aCcpO1xufVxuXG5mdW5jdGlvbiBfdGhyb3dFcnJvcihkaXI6IEFic3RyYWN0Q29udHJvbERpcmVjdGl2ZSwgbWVzc2FnZTogc3RyaW5nKTogdm9pZCB7XG4gIGNvbnN0IG1lc3NhZ2VFbmQgPSBfZGVzY3JpYmVDb250cm9sTG9jYXRpb24oZGlyKTtcbiAgdGhyb3cgbmV3IEVycm9yKGAke21lc3NhZ2V9ICR7bWVzc2FnZUVuZH1gKTtcbn1cblxuZnVuY3Rpb24gX2Rlc2NyaWJlQ29udHJvbExvY2F0aW9uKGRpcjogQWJzdHJhY3RDb250cm9sRGlyZWN0aXZlKTogc3RyaW5nIHtcbiAgY29uc3QgcGF0aCA9IGRpci5wYXRoO1xuICBpZiAocGF0aCAmJiBwYXRoLmxlbmd0aCA+IDEpIHJldHVybiBgcGF0aDogJyR7cGF0aC5qb2luKCcgLT4gJyl9J2A7XG4gIGlmIChwYXRoPy5bMF0pIHJldHVybiBgbmFtZTogJyR7cGF0aH0nYDtcbiAgcmV0dXJuICd1bnNwZWNpZmllZCBuYW1lIGF0dHJpYnV0ZSc7XG59XG5cbmZ1bmN0aW9uIF90aHJvd01pc3NpbmdWYWx1ZUFjY2Vzc29yRXJyb3IoZGlyOiBBYnN0cmFjdENvbnRyb2xEaXJlY3RpdmUpIHtcbiAgY29uc3QgbG9jID0gX2Rlc2NyaWJlQ29udHJvbExvY2F0aW9uKGRpcik7XG4gIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgUnVudGltZUVycm9yQ29kZS5OR19NSVNTSU5HX1ZBTFVFX0FDQ0VTU09SLFxuICAgIGBObyB2YWx1ZSBhY2Nlc3NvciBmb3IgZm9ybSBjb250cm9sICR7bG9jfS5gLFxuICApO1xufVxuXG5mdW5jdGlvbiBfdGhyb3dJbnZhbGlkVmFsdWVBY2Nlc3NvckVycm9yKGRpcjogQWJzdHJhY3RDb250cm9sRGlyZWN0aXZlKSB7XG4gIGNvbnN0IGxvYyA9IF9kZXNjcmliZUNvbnRyb2xMb2NhdGlvbihkaXIpO1xuICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgIFJ1bnRpbWVFcnJvckNvZGUuTkdfVkFMVUVfQUNDRVNTT1JfTk9UX1BST1ZJREVELFxuICAgIGBWYWx1ZSBhY2Nlc3NvciB3YXMgbm90IHByb3ZpZGVkIGFzIGFuIGFycmF5IGZvciBmb3JtIGNvbnRyb2wgd2l0aCAke2xvY30uIGAgK1xuICAgICAgYENoZWNrIHRoYXQgdGhlIFxcYE5HX1ZBTFVFX0FDQ0VTU09SXFxgIHRva2VuIGlzIGNvbmZpZ3VyZWQgYXMgYSBcXGBtdWx0aTogdHJ1ZVxcYCBwcm92aWRlci5gLFxuICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNQcm9wZXJ0eVVwZGF0ZWQoY2hhbmdlczoge1trZXk6IHN0cmluZ106IGFueX0sIHZpZXdNb2RlbDogYW55KTogYm9vbGVhbiB7XG4gIGlmICghY2hhbmdlcy5oYXNPd25Qcm9wZXJ0eSgnbW9kZWwnKSkgcmV0dXJuIGZhbHNlO1xuICBjb25zdCBjaGFuZ2UgPSBjaGFuZ2VzWydtb2RlbCddO1xuXG4gIGlmIChjaGFuZ2UuaXNGaXJzdENoYW5nZSgpKSByZXR1cm4gdHJ1ZTtcbiAgcmV0dXJuICFPYmplY3QuaXModmlld01vZGVsLCBjaGFuZ2UuY3VycmVudFZhbHVlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzQnVpbHRJbkFjY2Vzc29yKHZhbHVlQWNjZXNzb3I6IENvbnRyb2xWYWx1ZUFjY2Vzc29yKTogYm9vbGVhbiB7XG4gIC8vIENoZWNrIGlmIGEgZ2l2ZW4gdmFsdWUgYWNjZXNzb3IgaXMgYW4gaW5zdGFuY2Ugb2YgYSBjbGFzcyB0aGF0IGRpcmVjdGx5IGV4dGVuZHNcbiAgLy8gYEJ1aWx0SW5Db250cm9sVmFsdWVBY2Nlc3NvcmAgb25lLlxuICByZXR1cm4gT2JqZWN0LmdldFByb3RvdHlwZU9mKHZhbHVlQWNjZXNzb3IuY29uc3RydWN0b3IpID09PSBCdWlsdEluQ29udHJvbFZhbHVlQWNjZXNzb3I7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzeW5jUGVuZGluZ0NvbnRyb2xzKFxuICBmb3JtOiBGb3JtR3JvdXAsXG4gIGRpcmVjdGl2ZXM6IFNldDxOZ0NvbnRyb2w+IHwgTmdDb250cm9sW10sXG4pOiB2b2lkIHtcbiAgZm9ybS5fc3luY1BlbmRpbmdDb250cm9scygpO1xuICBkaXJlY3RpdmVzLmZvckVhY2goKGRpcjogTmdDb250cm9sKSA9PiB7XG4gICAgY29uc3QgY29udHJvbCA9IGRpci5jb250cm9sIGFzIEZvcm1Db250cm9sO1xuICAgIGlmIChjb250cm9sLnVwZGF0ZU9uID09PSAnc3VibWl0JyAmJiBjb250cm9sLl9wZW5kaW5nQ2hhbmdlKSB7XG4gICAgICBkaXIudmlld1RvTW9kZWxVcGRhdGUoY29udHJvbC5fcGVuZGluZ1ZhbHVlKTtcbiAgICAgIGNvbnRyb2wuX3BlbmRpbmdDaGFuZ2UgPSBmYWxzZTtcbiAgICB9XG4gIH0pO1xufVxuXG4vLyBUT0RPOiB2c2F2a2luIHJlbW92ZSBpdCBvbmNlIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIvaXNzdWVzLzMwMTEgaXMgaW1wbGVtZW50ZWRcbmV4cG9ydCBmdW5jdGlvbiBzZWxlY3RWYWx1ZUFjY2Vzc29yKFxuICBkaXI6IE5nQ29udHJvbCxcbiAgdmFsdWVBY2Nlc3NvcnM6IENvbnRyb2xWYWx1ZUFjY2Vzc29yW10sXG4pOiBDb250cm9sVmFsdWVBY2Nlc3NvciB8IG51bGwge1xuICBpZiAoIXZhbHVlQWNjZXNzb3JzKSByZXR1cm4gbnVsbDtcblxuICBpZiAoIUFycmF5LmlzQXJyYXkodmFsdWVBY2Nlc3NvcnMpICYmICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpKVxuICAgIF90aHJvd0ludmFsaWRWYWx1ZUFjY2Vzc29yRXJyb3IoZGlyKTtcblxuICBsZXQgZGVmYXVsdEFjY2Vzc29yOiBDb250cm9sVmFsdWVBY2Nlc3NvciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgbGV0IGJ1aWx0aW5BY2Nlc3NvcjogQ29udHJvbFZhbHVlQWNjZXNzb3IgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gIGxldCBjdXN0b21BY2Nlc3NvcjogQ29udHJvbFZhbHVlQWNjZXNzb3IgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG5cbiAgdmFsdWVBY2Nlc3NvcnMuZm9yRWFjaCgodjogQ29udHJvbFZhbHVlQWNjZXNzb3IpID0+IHtcbiAgICBpZiAodi5jb25zdHJ1Y3RvciA9PT0gRGVmYXVsdFZhbHVlQWNjZXNzb3IpIHtcbiAgICAgIGRlZmF1bHRBY2Nlc3NvciA9IHY7XG4gICAgfSBlbHNlIGlmIChpc0J1aWx0SW5BY2Nlc3Nvcih2KSkge1xuICAgICAgaWYgKGJ1aWx0aW5BY2Nlc3NvciAmJiAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSlcbiAgICAgICAgX3Rocm93RXJyb3IoZGlyLCAnTW9yZSB0aGFuIG9uZSBidWlsdC1pbiB2YWx1ZSBhY2Nlc3NvciBtYXRjaGVzIGZvcm0gY29udHJvbCB3aXRoJyk7XG4gICAgICBidWlsdGluQWNjZXNzb3IgPSB2O1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoY3VzdG9tQWNjZXNzb3IgJiYgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkpXG4gICAgICAgIF90aHJvd0Vycm9yKGRpciwgJ01vcmUgdGhhbiBvbmUgY3VzdG9tIHZhbHVlIGFjY2Vzc29yIG1hdGNoZXMgZm9ybSBjb250cm9sIHdpdGgnKTtcbiAgICAgIGN1c3RvbUFjY2Vzc29yID0gdjtcbiAgICB9XG4gIH0pO1xuXG4gIGlmIChjdXN0b21BY2Nlc3NvcikgcmV0dXJuIGN1c3RvbUFjY2Vzc29yO1xuICBpZiAoYnVpbHRpbkFjY2Vzc29yKSByZXR1cm4gYnVpbHRpbkFjY2Vzc29yO1xuICBpZiAoZGVmYXVsdEFjY2Vzc29yKSByZXR1cm4gZGVmYXVsdEFjY2Vzc29yO1xuXG4gIGlmICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpIHtcbiAgICBfdGhyb3dFcnJvcihkaXIsICdObyB2YWxpZCB2YWx1ZSBhY2Nlc3NvciBmb3IgZm9ybSBjb250cm9sIHdpdGgnKTtcbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZUxpc3RJdGVtPFQ+KGxpc3Q6IFRbXSwgZWw6IFQpOiB2b2lkIHtcbiAgY29uc3QgaW5kZXggPSBsaXN0LmluZGV4T2YoZWwpO1xuICBpZiAoaW5kZXggPiAtMSkgbGlzdC5zcGxpY2UoaW5kZXgsIDEpO1xufVxuXG4vLyBUT0RPKGthcmEpOiByZW1vdmUgYWZ0ZXIgZGVwcmVjYXRpb24gcGVyaW9kXG5leHBvcnQgZnVuY3Rpb24gX25nTW9kZWxXYXJuaW5nKFxuICBuYW1lOiBzdHJpbmcsXG4gIHR5cGU6IHtfbmdNb2RlbFdhcm5pbmdTZW50T25jZTogYm9vbGVhbn0sXG4gIGluc3RhbmNlOiB7X25nTW9kZWxXYXJuaW5nU2VudDogYm9vbGVhbn0sXG4gIHdhcm5pbmdDb25maWc6IHN0cmluZyB8IG51bGwsXG4pIHtcbiAgaWYgKHdhcm5pbmdDb25maWcgPT09ICduZXZlcicpIHJldHVybjtcblxuICBpZiAoXG4gICAgKCh3YXJuaW5nQ29uZmlnID09PSBudWxsIHx8IHdhcm5pbmdDb25maWcgPT09ICdvbmNlJykgJiYgIXR5cGUuX25nTW9kZWxXYXJuaW5nU2VudE9uY2UpIHx8XG4gICAgKHdhcm5pbmdDb25maWcgPT09ICdhbHdheXMnICYmICFpbnN0YW5jZS5fbmdNb2RlbFdhcm5pbmdTZW50KVxuICApIHtcbiAgICBjb25zb2xlLndhcm4obmdNb2RlbFdhcm5pbmcobmFtZSkpO1xuICAgIHR5cGUuX25nTW9kZWxXYXJuaW5nU2VudE9uY2UgPSB0cnVlO1xuICAgIGluc3RhbmNlLl9uZ01vZGVsV2FybmluZ1NlbnQgPSB0cnVlO1xuICB9XG59XG4iXX0=