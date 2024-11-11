/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hhcmVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvZm9ybXMvc3JjL2RpcmVjdGl2ZXMvc2hhcmVkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBUyxjQUFjLEVBQUUsYUFBYSxJQUFJLFlBQVksRUFBQyxNQUFNLGVBQWUsQ0FBQztBQU9wRixPQUFPLEVBQUMseUJBQXlCLEVBQUUsb0JBQW9CLEVBQUUsZUFBZSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBSy9GLE9BQU8sRUFBQywyQkFBMkIsRUFBdUIsTUFBTSwwQkFBMEIsQ0FBQztBQUMzRixPQUFPLEVBQUMsb0JBQW9CLEVBQUMsTUFBTSwwQkFBMEIsQ0FBQztBQUc5RCxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFHakQ7Ozs7O0dBS0c7QUFDSCxNQUFNLENBQUMsTUFBTSx1QkFBdUIsR0FBRyxJQUFJLGNBQWMsQ0FBQyxzQkFBc0IsRUFBRTtJQUNoRixVQUFVLEVBQUUsTUFBTTtJQUNsQixPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsdUJBQXVCO0NBQ3ZDLENBQUMsQ0FBQztBQVlIOztHQUVHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sdUJBQXVCLEdBQTJCLFFBQVEsQ0FBQztBQUV4RSxNQUFNLFVBQVUsV0FBVyxDQUFDLElBQW1CLEVBQUUsTUFBd0I7SUFDdkUsT0FBTyxDQUFDLEdBQUcsTUFBTSxDQUFDLElBQUssRUFBRSxJQUFLLENBQUMsQ0FBQztBQUNsQyxDQUFDO0FBRUQ7Ozs7OztHQU1HO0FBQ0gsTUFBTSxVQUFVLFlBQVksQ0FDMUIsT0FBb0IsRUFDcEIsR0FBYyxFQUNkLHVCQUErQyx1QkFBdUI7SUFFdEUsSUFBSSxPQUFPLFNBQVMsS0FBSyxXQUFXLElBQUksU0FBUyxFQUFFLENBQUM7UUFDbEQsSUFBSSxDQUFDLE9BQU87WUFBRSxXQUFXLENBQUMsR0FB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QU8sZUFBZSxDQUFDO0lBQzVDLElBQUksZUFBZTtRQUFFLE9BQU8sZUFBZSxDQUFDO0lBRTVDLElBQUksT0FBTyxTQUFTLEtBQUssV0FBVyxJQUFJLFNBQVMsRUFBRSxDQUFDO1FBQ2xELFdBQVcsQ0FBQyxHQUFHLEVBQUUsK0NBQStDLENBQUMsQ0FBQztJQUNwRSxDQUFDO0lBQ0QsT0FBTyxJQUFJLENBQUM7QUFDZCxDQUFDO0FBRUQsTUFBTSxVQUFVLGNBQWMsQ0FBSSxJQUFTLEVBQUUsRUFBSztJQUNoRCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQy9CLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQztRQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3hDLENBQUM7QUFFRCw4Q0FBOEM7QUFDOUMsTUFBTSxVQUFVLGVBQWUsQ0FDN0IsSUFBWSxFQUNaLElBQXdDLEVBQ3hDLFFBQXdDLEVBQ3hDLGFBQTRCO0lBRTVCLElBQUksYUFBYSxLQUFLLE9BQU87UUFBRSxPQUFPO0lBRXRDLElBQ0UsQ0FBQyxDQUFDLGFBQWEsS0FBSyxJQUFJLElBQUksYUFBYSxLQUFLLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDO1FBQ3ZGLENBQUMsYUFBYSxLQUFLLFFBQVEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxFQUM3RCxDQUFDO1FBQ0QsT0FBTyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNuQyxJQUFJLENBQUMsdUJBQXVCLEdBQUcsSUFBSSxDQUFDO1FBQ3BDLFFBQVEsQ0FBQyxtQkFBbUIsR0FBRyxJQUFJLENBQUM7SUFDdEMsQ0FBQztBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbmltcG9ydCB7SW5qZWN0LCBJbmplY3Rpb25Ub2tlbiwgybVSdW50aW1lRXJyb3IgYXMgUnVudGltZUVycm9yfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtSdW50aW1lRXJyb3JDb2RlfSBmcm9tICcuLi9lcnJvcnMnO1xuaW1wb3J0IHtBYnN0cmFjdENvbnRyb2x9IGZyb20gJy4uL21vZGVsL2Fic3RyYWN0X21vZGVsJztcbmltcG9ydCB7Rm9ybUFycmF5fSBmcm9tICcuLi9tb2RlbC9mb3JtX2FycmF5JztcbmltcG9ydCB7Rm9ybUNvbnRyb2x9IGZyb20gJy4uL21vZGVsL2Zvcm1fY29udHJvbCc7XG5pbXBvcnQge0Zvcm1Hcm91cH0gZnJvbSAnLi4vbW9kZWwvZm9ybV9ncm91cCc7XG5pbXBvcnQge2dldENvbnRyb2xBc3luY1ZhbGlkYXRvcnMsIGdldENvbnRyb2xWYWxpZGF0b3JzLCBtZXJnZVZhbGlkYXRvcnN9IGZyb20gJy4uL3ZhbGlkYXRvcnMnO1xuXG5pbXBvcnQge0Fic3RyYWN0Q29udHJvbERpcmVjdGl2ZX0gZnJvbSAnLi9hYnN0cmFjdF9jb250cm9sX2RpcmVjdGl2ZSc7XG5pbXBvcnQge0Fic3RyYWN0Rm9ybUdyb3VwRGlyZWN0aXZlfSBmcm9tICcuL2Fic3RyYWN0X2Zvcm1fZ3JvdXBfZGlyZWN0aXZlJztcbmltcG9ydCB7Q29udHJvbENvbnRhaW5lcn0gZnJvbSAnLi9jb250cm9sX2NvbnRhaW5lcic7XG5pbXBvcnQge0J1aWx0SW5Db250cm9sVmFsdWVBY2Nlc3NvciwgQ29udHJvbFZhbHVlQWNjZXNzb3J9IGZyb20gJy4vY29udHJvbF92YWx1ZV9hY2Nlc3Nvcic7XG5pbXBvcnQge0RlZmF1bHRWYWx1ZUFjY2Vzc29yfSBmcm9tICcuL2RlZmF1bHRfdmFsdWVfYWNjZXNzb3InO1xuaW1wb3J0IHtOZ0NvbnRyb2x9IGZyb20gJy4vbmdfY29udHJvbCc7XG5pbXBvcnQge0Zvcm1BcnJheU5hbWV9IGZyb20gJy4vcmVhY3RpdmVfZGlyZWN0aXZlcy9mb3JtX2dyb3VwX25hbWUnO1xuaW1wb3J0IHtuZ01vZGVsV2FybmluZ30gZnJvbSAnLi9yZWFjdGl2ZV9lcnJvcnMnO1xuaW1wb3J0IHtBc3luY1ZhbGlkYXRvckZuLCBWYWxpZGF0b3IsIFZhbGlkYXRvckZufSBmcm9tICcuL3ZhbGlkYXRvcnMnO1xuXG4vKipcbiAqIFRva2VuIHRvIHByb3ZpZGUgdG8gYWxsb3cgU2V0RGlzYWJsZWRTdGF0ZSB0byBhbHdheXMgYmUgY2FsbGVkIHdoZW4gYSBDVkEgaXMgYWRkZWQsIHJlZ2FyZGxlc3Mgb2ZcbiAqIHdoZXRoZXIgdGhlIGNvbnRyb2wgaXMgZGlzYWJsZWQgb3IgZW5hYmxlZC5cbiAqXG4gKiBAc2VlIHtAbGluayBGb3Jtc01vZHVsZSN3aXRoY29uZmlnfVxuICovXG5leHBvcnQgY29uc3QgQ0FMTF9TRVRfRElTQUJMRURfU1RBVEUgPSBuZXcgSW5qZWN0aW9uVG9rZW4oJ0NhbGxTZXREaXNhYmxlZFN0YXRlJywge1xuICBwcm92aWRlZEluOiAncm9vdCcsXG4gIGZhY3Rvcnk6ICgpID0+IHNldERpc2FibGVkU3RhdGVEZWZhdWx0LFxufSk7XG5cbi8qKlxuICogVGhlIHR5cGUgZm9yIENBTExfU0VUX0RJU0FCTEVEX1NUQVRFLiBJZiBgYWx3YXlzYCwgdGhlbiBDb250cm9sVmFsdWVBY2Nlc3NvciB3aWxsIGFsd2F5cyBjYWxsXG4gKiBgc2V0RGlzYWJsZWRTdGF0ZWAgd2hlbiBhdHRhY2hlZCwgd2hpY2ggaXMgdGhlIG1vc3QgY29ycmVjdCBiZWhhdmlvci4gT3RoZXJ3aXNlLCBpdCB3aWxsIG9ubHkgYmVcbiAqIGNhbGxlZCB3aGVuIGRpc2FibGVkLCB3aGljaCBpcyB0aGUgbGVnYWN5IGJlaGF2aW9yIGZvciBjb21wYXRpYmlsaXR5LlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqIEBzZWUge0BsaW5rIEZvcm1zTW9kdWxlI3dpdGhjb25maWd9XG4gKi9cbmV4cG9ydCB0eXBlIFNldERpc2FibGVkU3RhdGVPcHRpb24gPSAnd2hlbkRpc2FibGVkRm9yTGVnYWN5Q29kZScgfCAnYWx3YXlzJztcblxuLyoqXG4gKiBXaGV0aGVyIHRvIHVzZSB0aGUgZml4ZWQgc2V0RGlzYWJsZWRTdGF0ZSBiZWhhdmlvciBieSBkZWZhdWx0LlxuICovXG5leHBvcnQgY29uc3Qgc2V0RGlzYWJsZWRTdGF0ZURlZmF1bHQ6IFNldERpc2FibGVkU3RhdGVPcHRpb24gPSAnYWx3YXlzJztcblxuZXhwb3J0IGZ1bmN0aW9uIGNvbnRyb2xQYXRoKG5hbWU6IHN0cmluZyB8IG51bGwsIHBhcmVudDogQ29udHJvbENvbnRhaW5lcik6IHN0cmluZ1tdIHtcbiAgcmV0dXJuIFsuLi5wYXJlbnQucGF0aCEsIG5hbWUhXTtcbn1cblxuLyoqXG4gKiBMaW5rcyBhIEZvcm0gY29udHJvbCBhbmQgYSBGb3JtIGRpcmVjdGl2ZSBieSBzZXR0aW5nIHVwIGNhbGxiYWNrcyAoc3VjaCBhcyBgb25DaGFuZ2VgKSBvbiBib3RoXG4gKiBpbnN0YW5jZXMuIFRoaXMgZnVuY3Rpb24gaXMgdHlwaWNhbGx5IGludm9rZWQgd2hlbiBmb3JtIGRpcmVjdGl2ZSBpcyBiZWluZyBpbml0aWFsaXplZC5cbiAqXG4gKiBAcGFyYW0gY29udHJvbCBGb3JtIGNvbnRyb2wgaW5zdGFuY2UgdGhhdCBzaG91bGQgYmUgbGlua2VkLlxuICogQHBhcmFtIGRpciBEaXJlY3RpdmUgdGhhdCBzaG91bGQgYmUgbGlua2VkIHdpdGggYSBnaXZlbiBjb250cm9sLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0VXBDb250cm9sKFxuICBjb250cm9sOiBGb3JtQ29udHJvbCxcbiAgZGlyOiBOZ0NvbnRyb2wsXG4gIGNhbGxTZXREaXNhYmxlZFN0YXRlOiBTZXREaXNhYmxlZFN0YXRlT3B0aW9uID0gc2V0RGlzYWJsZWRTdGF0ZURlZmF1bHQsXG4pOiB2b2lkIHtcbiAgaWYgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkge1xuICAgIGlmICghY29udHJvbCkgX3Rocm93RXJyb3IoZGlyLCAnQ2Fubm90IGZpbmQgY29udHJvbCB3aXRoJyk7XG4gICAgaWYgKCFkaXIudmFsdWVBY2Nlc3NvcikgX3Rocm93TWlzc2luZ1ZhbHVlQWNjZXNzb3JFcnJvcihkaXIpO1xuICB9XG5cbiAgc2V0VXBWYWxpZGF0b3JzKGNvbnRyb2wsIGRpcik7XG5cbiAgZGlyLnZhbHVlQWNjZXNzb3IhLndyaXRlVmFsdWUoY29udHJvbC52YWx1ZSk7XG5cbiAgLy8gVGhlIGxlZ2FjeSBiZWhhdmlvciBvbmx5IGNhbGxzIHRoZSBDVkEncyBgc2V0RGlzYWJsZWRTdGF0ZWAgaWYgdGhlIGNvbnRyb2wgaXMgZGlzYWJsZWQuXG4gIC8vIElmIHRoZSBgY2FsbFNldERpc2FibGVkU3RhdGVgIG9wdGlvbiBpcyBzZXQgdG8gYGFsd2F5c2AsIHRoZW4gdGhpcyBidWcgaXMgZml4ZWQgYW5kXG4gIC8vIHRoZSBtZXRob2QgaXMgYWx3YXlzIGNhbGxlZC5cbiAgaWYgKGNvbnRyb2wuZGlzYWJsZWQgfHwgY2FsbFNldERpc2FibGVkU3RhdGUgPT09ICdhbHdheXMnKSB7XG4gICAgZGlyLnZhbHVlQWNjZXNzb3IhLnNldERpc2FibGVkU3RhdGU/Lihjb250cm9sLmRpc2FibGVkKTtcbiAgfVxuXG4gIHNldFVwVmlld0NoYW5nZVBpcGVsaW5lKGNvbnRyb2wsIGRpcik7XG4gIHNldFVwTW9kZWxDaGFuZ2VQaXBlbGluZShjb250cm9sLCBkaXIpO1xuXG4gIHNldFVwQmx1clBpcGVsaW5lKGNvbnRyb2wsIGRpcik7XG5cbiAgc2V0VXBEaXNhYmxlZENoYW5nZUhhbmRsZXIoY29udHJvbCwgZGlyKTtcbn1cblxuLyoqXG4gKiBSZXZlcnRzIGNvbmZpZ3VyYXRpb24gcGVyZm9ybWVkIGJ5IHRoZSBgc2V0VXBDb250cm9sYCBjb250cm9sIGZ1bmN0aW9uLlxuICogRWZmZWN0aXZlbHkgZGlzY29ubmVjdHMgZm9ybSBjb250cm9sIHdpdGggYSBnaXZlbiBmb3JtIGRpcmVjdGl2ZS5cbiAqIFRoaXMgZnVuY3Rpb24gaXMgdHlwaWNhbGx5IGludm9rZWQgd2hlbiBjb3JyZXNwb25kaW5nIGZvcm0gZGlyZWN0aXZlIGlzIGJlaW5nIGRlc3Ryb3llZC5cbiAqXG4gKiBAcGFyYW0gY29udHJvbCBGb3JtIGNvbnRyb2wgd2hpY2ggc2hvdWxkIGJlIGNsZWFuZWQgdXAuXG4gKiBAcGFyYW0gZGlyIERpcmVjdGl2ZSB0aGF0IHNob3VsZCBiZSBkaXNjb25uZWN0ZWQgZnJvbSBhIGdpdmVuIGNvbnRyb2wuXG4gKiBAcGFyYW0gdmFsaWRhdGVDb250cm9sUHJlc2VuY2VPbkNoYW5nZSBGbGFnIHRoYXQgaW5kaWNhdGVzIHdoZXRoZXIgb25DaGFuZ2UgaGFuZGxlciBzaG91bGRcbiAqICAgICBjb250YWluIGFzc2VydHMgdG8gdmVyaWZ5IHRoYXQgaXQncyBub3QgY2FsbGVkIG9uY2UgZGlyZWN0aXZlIGlzIGRlc3Ryb3llZC4gV2UgbmVlZCB0aGlzIGZsYWdcbiAqICAgICB0byBhdm9pZCBwb3RlbnRpYWxseSBicmVha2luZyBjaGFuZ2VzIGNhdXNlZCBieSBiZXR0ZXIgY29udHJvbCBjbGVhbnVwIGludHJvZHVjZWQgaW4gIzM5MjM1LlxuICovXG5leHBvcnQgZnVuY3Rpb24gY2xlYW5VcENvbnRyb2woXG4gIGNvbnRyb2w6IEZvcm1Db250cm9sIHwgbnVsbCxcbiAgZGlyOiBOZ0NvbnRyb2wsXG4gIHZhbGlkYXRlQ29udHJvbFByZXNlbmNlT25DaGFuZ2U6IGJvb2xlYW4gPSB0cnVlLFxuKTogdm9pZCB7XG4gIGNvbnN0IG5vb3AgPSAoKSA9PiB7XG4gICAgaWYgKHZhbGlkYXRlQ29udHJvbFByZXNlbmNlT25DaGFuZ2UgJiYgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkpIHtcbiAgICAgIF9ub0NvbnRyb2xFcnJvcihkaXIpO1xuICAgIH1cbiAgfTtcblxuICAvLyBUaGUgYHZhbHVlQWNjZXNzb3JgIGZpZWxkIGlzIHR5cGljYWxseSBkZWZpbmVkIG9uIEZyb21Db250cm9sIGFuZCBGb3JtQ29udHJvbE5hbWUgZGlyZWN0aXZlXG4gIC8vIGluc3RhbmNlcyBhbmQgdGhlcmUgaXMgYSBsb2dpYyBpbiBgc2VsZWN0VmFsdWVBY2Nlc3NvcmAgZnVuY3Rpb24gdGhhdCB0aHJvd3MgaWYgaXQncyBub3QgdGhlXG4gIC8vIGNhc2UuIFdlIHN0aWxsIGNoZWNrIHRoZSBwcmVzZW5jZSBvZiBgdmFsdWVBY2Nlc3NvcmAgYmVmb3JlIGludm9raW5nIGl0cyBtZXRob2RzIHRvIG1ha2Ugc3VyZVxuICAvLyB0aGF0IGNsZWFudXAgd29ya3MgY29ycmVjdGx5IGlmIGFwcCBjb2RlIG9yIHRlc3RzIGFyZSBzZXR1cCB0byBpZ25vcmUgdGhlIGVycm9yIHRocm93biBmcm9tXG4gIC8vIGBzZWxlY3RWYWx1ZUFjY2Vzc29yYC4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIvaXNzdWVzLzQwNTIxLlxuICBpZiAoZGlyLnZhbHVlQWNjZXNzb3IpIHtcbiAgICBkaXIudmFsdWVBY2Nlc3Nvci5yZWdpc3Rlck9uQ2hhbmdlKG5vb3ApO1xuICAgIGRpci52YWx1ZUFjY2Vzc29yLnJlZ2lzdGVyT25Ub3VjaGVkKG5vb3ApO1xuICB9XG5cbiAgY2xlYW5VcFZhbGlkYXRvcnMoY29udHJvbCwgZGlyKTtcblxuICBpZiAoY29udHJvbCkge1xuICAgIGRpci5faW52b2tlT25EZXN0cm95Q2FsbGJhY2tzKCk7XG4gICAgY29udHJvbC5fcmVnaXN0ZXJPbkNvbGxlY3Rpb25DaGFuZ2UoKCkgPT4ge30pO1xuICB9XG59XG5cbmZ1bmN0aW9uIHJlZ2lzdGVyT25WYWxpZGF0b3JDaGFuZ2U8Vj4odmFsaWRhdG9yczogKFYgfCBWYWxpZGF0b3IpW10sIG9uQ2hhbmdlOiAoKSA9PiB2b2lkKTogdm9pZCB7XG4gIHZhbGlkYXRvcnMuZm9yRWFjaCgodmFsaWRhdG9yOiBWIHwgVmFsaWRhdG9yKSA9PiB7XG4gICAgaWYgKCg8VmFsaWRhdG9yPnZhbGlkYXRvcikucmVnaXN0ZXJPblZhbGlkYXRvckNoYW5nZSlcbiAgICAgICg8VmFsaWRhdG9yPnZhbGlkYXRvcikucmVnaXN0ZXJPblZhbGlkYXRvckNoYW5nZSEob25DaGFuZ2UpO1xuICB9KTtcbn1cblxuLyoqXG4gKiBTZXRzIHVwIGRpc2FibGVkIGNoYW5nZSBoYW5kbGVyIGZ1bmN0aW9uIG9uIGEgZ2l2ZW4gZm9ybSBjb250cm9sIGlmIENvbnRyb2xWYWx1ZUFjY2Vzc29yXG4gKiBhc3NvY2lhdGVkIHdpdGggYSBnaXZlbiBkaXJlY3RpdmUgaW5zdGFuY2Ugc3VwcG9ydHMgdGhlIGBzZXREaXNhYmxlZFN0YXRlYCBjYWxsLlxuICpcbiAqIEBwYXJhbSBjb250cm9sIEZvcm0gY29udHJvbCB3aGVyZSBkaXNhYmxlZCBjaGFuZ2UgaGFuZGxlciBzaG91bGQgYmUgc2V0dXAuXG4gKiBAcGFyYW0gZGlyIENvcnJlc3BvbmRpbmcgZGlyZWN0aXZlIGluc3RhbmNlIGFzc29jaWF0ZWQgd2l0aCB0aGlzIGNvbnRyb2wuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXRVcERpc2FibGVkQ2hhbmdlSGFuZGxlcihjb250cm9sOiBGb3JtQ29udHJvbCwgZGlyOiBOZ0NvbnRyb2wpOiB2b2lkIHtcbiAgaWYgKGRpci52YWx1ZUFjY2Vzc29yIS5zZXREaXNhYmxlZFN0YXRlKSB7XG4gICAgY29uc3Qgb25EaXNhYmxlZENoYW5nZSA9IChpc0Rpc2FibGVkOiBib29sZWFuKSA9PiB7XG4gICAgICBkaXIudmFsdWVBY2Nlc3NvciEuc2V0RGlzYWJsZWRTdGF0ZSEoaXNEaXNhYmxlZCk7XG4gICAgfTtcbiAgICBjb250cm9sLnJlZ2lzdGVyT25EaXNhYmxlZENoYW5nZShvbkRpc2FibGVkQ2hhbmdlKTtcblxuICAgIC8vIFJlZ2lzdGVyIGEgY2FsbGJhY2sgZnVuY3Rpb24gdG8gY2xlYW51cCBkaXNhYmxlZCBjaGFuZ2UgaGFuZGxlclxuICAgIC8vIGZyb20gYSBjb250cm9sIGluc3RhbmNlIHdoZW4gYSBkaXJlY3RpdmUgaXMgZGVzdHJveWVkLlxuICAgIGRpci5fcmVnaXN0ZXJPbkRlc3Ryb3koKCkgPT4ge1xuICAgICAgY29udHJvbC5fdW5yZWdpc3Rlck9uRGlzYWJsZWRDaGFuZ2Uob25EaXNhYmxlZENoYW5nZSk7XG4gICAgfSk7XG4gIH1cbn1cblxuLyoqXG4gKiBTZXRzIHVwIHN5bmMgYW5kIGFzeW5jIGRpcmVjdGl2ZSB2YWxpZGF0b3JzIG9uIHByb3ZpZGVkIGZvcm0gY29udHJvbC5cbiAqIFRoaXMgZnVuY3Rpb24gbWVyZ2VzIHZhbGlkYXRvcnMgZnJvbSB0aGUgZGlyZWN0aXZlIGludG8gdGhlIHZhbGlkYXRvcnMgb2YgdGhlIGNvbnRyb2wuXG4gKlxuICogQHBhcmFtIGNvbnRyb2wgRm9ybSBjb250cm9sIHdoZXJlIGRpcmVjdGl2ZSB2YWxpZGF0b3JzIHNob3VsZCBiZSBzZXR1cC5cbiAqIEBwYXJhbSBkaXIgRGlyZWN0aXZlIGluc3RhbmNlIHRoYXQgY29udGFpbnMgdmFsaWRhdG9ycyB0byBiZSBzZXR1cC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldFVwVmFsaWRhdG9ycyhjb250cm9sOiBBYnN0cmFjdENvbnRyb2wsIGRpcjogQWJzdHJhY3RDb250cm9sRGlyZWN0aXZlKTogdm9pZCB7XG4gIGNvbnN0IHZhbGlkYXRvcnMgPSBnZXRDb250cm9sVmFsaWRhdG9ycyhjb250cm9sKTtcbiAgaWYgKGRpci52YWxpZGF0b3IgIT09IG51bGwpIHtcbiAgICBjb250cm9sLnNldFZhbGlkYXRvcnMobWVyZ2VWYWxpZGF0b3JzPFZhbGlkYXRvckZuPih2YWxpZGF0b3JzLCBkaXIudmFsaWRhdG9yKSk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIHZhbGlkYXRvcnMgPT09ICdmdW5jdGlvbicpIHtcbiAgICAvLyBJZiBzeW5jIHZhbGlkYXRvcnMgYXJlIHJlcHJlc2VudGVkIGJ5IGEgc2luZ2xlIHZhbGlkYXRvciBmdW5jdGlvbiwgd2UgZm9yY2UgdGhlXG4gICAgLy8gYFZhbGlkYXRvcnMuY29tcG9zZWAgY2FsbCB0byBoYXBwZW4gYnkgZXhlY3V0aW5nIHRoZSBgc2V0VmFsaWRhdG9yc2AgZnVuY3Rpb24gd2l0aFxuICAgIC8vIGFuIGFycmF5IHRoYXQgY29udGFpbnMgdGhhdCBmdW5jdGlvbi4gV2UgbmVlZCB0aGlzIHRvIGF2b2lkIHBvc3NpYmxlIGRpc2NyZXBhbmNpZXMgaW5cbiAgICAvLyB2YWxpZGF0b3JzIGJlaGF2aW9yLCBzbyBzeW5jIHZhbGlkYXRvcnMgYXJlIGFsd2F5cyBwcm9jZXNzZWQgYnkgdGhlIGBWYWxpZGF0b3JzLmNvbXBvc2VgLlxuICAgIC8vIE5vdGU6IHdlIHNob3VsZCBjb25zaWRlciBtb3ZpbmcgdGhpcyBsb2dpYyBpbnNpZGUgdGhlIGBzZXRWYWxpZGF0b3JzYCBmdW5jdGlvbiBpdHNlbGYsIHNvIHdlXG4gICAgLy8gaGF2ZSBjb25zaXN0ZW50IGJlaGF2aW9yIG9uIEFic3RyYWN0Q29udHJvbCBBUEkgbGV2ZWwuIFRoZSBzYW1lIGFwcGxpZXMgdG8gdGhlIGFzeW5jXG4gICAgLy8gdmFsaWRhdG9ycyBsb2dpYyBiZWxvdy5cbiAgICBjb250cm9sLnNldFZhbGlkYXRvcnMoW3ZhbGlkYXRvcnNdKTtcbiAgfVxuXG4gIGNvbnN0IGFzeW5jVmFsaWRhdG9ycyA9IGdldENvbnRyb2xBc3luY1ZhbGlkYXRvcnMoY29udHJvbCk7XG4gIGlmIChkaXIuYXN5bmNWYWxpZGF0b3IgIT09IG51bGwpIHtcbiAgICBjb250cm9sLnNldEFzeW5jVmFsaWRhdG9ycyhcbiAgICAgIG1lcmdlVmFsaWRhdG9yczxBc3luY1ZhbGlkYXRvckZuPihhc3luY1ZhbGlkYXRvcnMsIGRpci5hc3luY1ZhbGlkYXRvciksXG4gICAgKTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgYXN5bmNWYWxpZGF0b3JzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgY29udHJvbC5zZXRBc3luY1ZhbGlkYXRvcnMoW2FzeW5jVmFsaWRhdG9yc10pO1xuICB9XG5cbiAgLy8gUmUtcnVuIHZhbGlkYXRpb24gd2hlbiB2YWxpZGF0b3IgYmluZGluZyBjaGFuZ2VzLCBlLmcuIG1pbmxlbmd0aD0zIC0+IG1pbmxlbmd0aD00XG4gIGNvbnN0IG9uVmFsaWRhdG9yQ2hhbmdlID0gKCkgPT4gY29udHJvbC51cGRhdGVWYWx1ZUFuZFZhbGlkaXR5KCk7XG4gIHJlZ2lzdGVyT25WYWxpZGF0b3JDaGFuZ2U8VmFsaWRhdG9yRm4+KGRpci5fcmF3VmFsaWRhdG9ycywgb25WYWxpZGF0b3JDaGFuZ2UpO1xuICByZWdpc3Rlck9uVmFsaWRhdG9yQ2hhbmdlPEFzeW5jVmFsaWRhdG9yRm4+KGRpci5fcmF3QXN5bmNWYWxpZGF0b3JzLCBvblZhbGlkYXRvckNoYW5nZSk7XG59XG5cbi8qKlxuICogQ2xlYW5zIHVwIHN5bmMgYW5kIGFzeW5jIGRpcmVjdGl2ZSB2YWxpZGF0b3JzIG9uIHByb3ZpZGVkIGZvcm0gY29udHJvbC5cbiAqIFRoaXMgZnVuY3Rpb24gcmV2ZXJ0cyB0aGUgc2V0dXAgcGVyZm9ybWVkIGJ5IHRoZSBgc2V0VXBWYWxpZGF0b3JzYCBmdW5jdGlvbiwgaS5lLlxuICogcmVtb3ZlcyBkaXJlY3RpdmUtc3BlY2lmaWMgdmFsaWRhdG9ycyBmcm9tIGEgZ2l2ZW4gY29udHJvbCBpbnN0YW5jZS5cbiAqXG4gKiBAcGFyYW0gY29udHJvbCBGb3JtIGNvbnRyb2wgZnJvbSB3aGVyZSBkaXJlY3RpdmUgdmFsaWRhdG9ycyBzaG91bGQgYmUgcmVtb3ZlZC5cbiAqIEBwYXJhbSBkaXIgRGlyZWN0aXZlIGluc3RhbmNlIHRoYXQgY29udGFpbnMgdmFsaWRhdG9ycyB0byBiZSByZW1vdmVkLlxuICogQHJldHVybnMgdHJ1ZSBpZiBhIGNvbnRyb2wgd2FzIHVwZGF0ZWQgYXMgYSByZXN1bHQgb2YgdGhpcyBhY3Rpb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjbGVhblVwVmFsaWRhdG9ycyhcbiAgY29udHJvbDogQWJzdHJhY3RDb250cm9sIHwgbnVsbCxcbiAgZGlyOiBBYnN0cmFjdENvbnRyb2xEaXJlY3RpdmUsXG4pOiBib29sZWFuIHtcbiAgbGV0IGlzQ29udHJvbFVwZGF0ZWQgPSBmYWxzZTtcbiAgaWYgKGNvbnRyb2wgIT09IG51bGwpIHtcbiAgICBpZiAoZGlyLnZhbGlkYXRvciAhPT0gbnVsbCkge1xuICAgICAgY29uc3QgdmFsaWRhdG9ycyA9IGdldENvbnRyb2xWYWxpZGF0b3JzKGNvbnRyb2wpO1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkodmFsaWRhdG9ycykgJiYgdmFsaWRhdG9ycy5sZW5ndGggPiAwKSB7XG4gICAgICAgIC8vIEZpbHRlciBvdXQgZGlyZWN0aXZlIHZhbGlkYXRvciBmdW5jdGlvbi5cbiAgICAgICAgY29uc3QgdXBkYXRlZFZhbGlkYXRvcnMgPSB2YWxpZGF0b3JzLmZpbHRlcigodmFsaWRhdG9yKSA9PiB2YWxpZGF0b3IgIT09IGRpci52YWxpZGF0b3IpO1xuICAgICAgICBpZiAodXBkYXRlZFZhbGlkYXRvcnMubGVuZ3RoICE9PSB2YWxpZGF0b3JzLmxlbmd0aCkge1xuICAgICAgICAgIGlzQ29udHJvbFVwZGF0ZWQgPSB0cnVlO1xuICAgICAgICAgIGNvbnRyb2wuc2V0VmFsaWRhdG9ycyh1cGRhdGVkVmFsaWRhdG9ycyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoZGlyLmFzeW5jVmFsaWRhdG9yICE9PSBudWxsKSB7XG4gICAgICBjb25zdCBhc3luY1ZhbGlkYXRvcnMgPSBnZXRDb250cm9sQXN5bmNWYWxpZGF0b3JzKGNvbnRyb2wpO1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoYXN5bmNWYWxpZGF0b3JzKSAmJiBhc3luY1ZhbGlkYXRvcnMubGVuZ3RoID4gMCkge1xuICAgICAgICAvLyBGaWx0ZXIgb3V0IGRpcmVjdGl2ZSBhc3luYyB2YWxpZGF0b3IgZnVuY3Rpb24uXG4gICAgICAgIGNvbnN0IHVwZGF0ZWRBc3luY1ZhbGlkYXRvcnMgPSBhc3luY1ZhbGlkYXRvcnMuZmlsdGVyKFxuICAgICAgICAgIChhc3luY1ZhbGlkYXRvcikgPT4gYXN5bmNWYWxpZGF0b3IgIT09IGRpci5hc3luY1ZhbGlkYXRvcixcbiAgICAgICAgKTtcbiAgICAgICAgaWYgKHVwZGF0ZWRBc3luY1ZhbGlkYXRvcnMubGVuZ3RoICE9PSBhc3luY1ZhbGlkYXRvcnMubGVuZ3RoKSB7XG4gICAgICAgICAgaXNDb250cm9sVXBkYXRlZCA9IHRydWU7XG4gICAgICAgICAgY29udHJvbC5zZXRBc3luY1ZhbGlkYXRvcnModXBkYXRlZEFzeW5jVmFsaWRhdG9ycyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBDbGVhciBvblZhbGlkYXRvckNoYW5nZSBjYWxsYmFja3MgYnkgcHJvdmlkaW5nIGEgbm9vcCBmdW5jdGlvbi5cbiAgY29uc3Qgbm9vcCA9ICgpID0+IHt9O1xuICByZWdpc3Rlck9uVmFsaWRhdG9yQ2hhbmdlPFZhbGlkYXRvckZuPihkaXIuX3Jhd1ZhbGlkYXRvcnMsIG5vb3ApO1xuICByZWdpc3Rlck9uVmFsaWRhdG9yQ2hhbmdlPEFzeW5jVmFsaWRhdG9yRm4+KGRpci5fcmF3QXN5bmNWYWxpZGF0b3JzLCBub29wKTtcblxuICByZXR1cm4gaXNDb250cm9sVXBkYXRlZDtcbn1cblxuZnVuY3Rpb24gc2V0VXBWaWV3Q2hhbmdlUGlwZWxpbmUoY29udHJvbDogRm9ybUNvbnRyb2wsIGRpcjogTmdDb250cm9sKTogdm9pZCB7XG4gIGRpci52YWx1ZUFjY2Vzc29yIS5yZWdpc3Rlck9uQ2hhbmdlKChuZXdWYWx1ZTogYW55KSA9PiB7XG4gICAgY29udHJvbC5fcGVuZGluZ1ZhbHVlID0gbmV3VmFsdWU7XG4gICAgY29udHJvbC5fcGVuZGluZ0NoYW5nZSA9IHRydWU7XG4gICAgY29udHJvbC5fcGVuZGluZ0RpcnR5ID0gdHJ1ZTtcblxuICAgIGlmIChjb250cm9sLnVwZGF0ZU9uID09PSAnY2hhbmdlJykgdXBkYXRlQ29udHJvbChjb250cm9sLCBkaXIpO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gc2V0VXBCbHVyUGlwZWxpbmUoY29udHJvbDogRm9ybUNvbnRyb2wsIGRpcjogTmdDb250cm9sKTogdm9pZCB7XG4gIGRpci52YWx1ZUFjY2Vzc29yIS5yZWdpc3Rlck9uVG91Y2hlZCgoKSA9PiB7XG4gICAgY29udHJvbC5fcGVuZGluZ1RvdWNoZWQgPSB0cnVlO1xuXG4gICAgaWYgKGNvbnRyb2wudXBkYXRlT24gPT09ICdibHVyJyAmJiBjb250cm9sLl9wZW5kaW5nQ2hhbmdlKSB1cGRhdGVDb250cm9sKGNvbnRyb2wsIGRpcik7XG4gICAgaWYgKGNvbnRyb2wudXBkYXRlT24gIT09ICdzdWJtaXQnKSBjb250cm9sLm1hcmtBc1RvdWNoZWQoKTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZUNvbnRyb2woY29udHJvbDogRm9ybUNvbnRyb2wsIGRpcjogTmdDb250cm9sKTogdm9pZCB7XG4gIGlmIChjb250cm9sLl9wZW5kaW5nRGlydHkpIGNvbnRyb2wubWFya0FzRGlydHkoKTtcbiAgY29udHJvbC5zZXRWYWx1ZShjb250cm9sLl9wZW5kaW5nVmFsdWUsIHtlbWl0TW9kZWxUb1ZpZXdDaGFuZ2U6IGZhbHNlfSk7XG4gIGRpci52aWV3VG9Nb2RlbFVwZGF0ZShjb250cm9sLl9wZW5kaW5nVmFsdWUpO1xuICBjb250cm9sLl9wZW5kaW5nQ2hhbmdlID0gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIHNldFVwTW9kZWxDaGFuZ2VQaXBlbGluZShjb250cm9sOiBGb3JtQ29udHJvbCwgZGlyOiBOZ0NvbnRyb2wpOiB2b2lkIHtcbiAgY29uc3Qgb25DaGFuZ2UgPSAobmV3VmFsdWU/OiBhbnksIGVtaXRNb2RlbEV2ZW50PzogYm9vbGVhbikgPT4ge1xuICAgIC8vIGNvbnRyb2wgLT4gdmlld1xuICAgIGRpci52YWx1ZUFjY2Vzc29yIS53cml0ZVZhbHVlKG5ld1ZhbHVlKTtcblxuICAgIC8vIGNvbnRyb2wgLT4gbmdNb2RlbFxuICAgIGlmIChlbWl0TW9kZWxFdmVudCkgZGlyLnZpZXdUb01vZGVsVXBkYXRlKG5ld1ZhbHVlKTtcbiAgfTtcbiAgY29udHJvbC5yZWdpc3Rlck9uQ2hhbmdlKG9uQ2hhbmdlKTtcblxuICAvLyBSZWdpc3RlciBhIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGNsZWFudXAgb25DaGFuZ2UgaGFuZGxlclxuICAvLyBmcm9tIGEgY29udHJvbCBpbnN0YW5jZSB3aGVuIGEgZGlyZWN0aXZlIGlzIGRlc3Ryb3llZC5cbiAgZGlyLl9yZWdpc3Rlck9uRGVzdHJveSgoKSA9PiB7XG4gICAgY29udHJvbC5fdW5yZWdpc3Rlck9uQ2hhbmdlKG9uQ2hhbmdlKTtcbiAgfSk7XG59XG5cbi8qKlxuICogTGlua3MgYSBGb3JtR3JvdXAgb3IgRm9ybUFycmF5IGluc3RhbmNlIGFuZCBjb3JyZXNwb25kaW5nIEZvcm0gZGlyZWN0aXZlIGJ5IHNldHRpbmcgdXAgdmFsaWRhdG9yc1xuICogcHJlc2VudCBpbiB0aGUgdmlldy5cbiAqXG4gKiBAcGFyYW0gY29udHJvbCBGb3JtR3JvdXAgb3IgRm9ybUFycmF5IGluc3RhbmNlIHRoYXQgc2hvdWxkIGJlIGxpbmtlZC5cbiAqIEBwYXJhbSBkaXIgRGlyZWN0aXZlIHRoYXQgcHJvdmlkZXMgdmlldyB2YWxpZGF0b3JzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0VXBGb3JtQ29udGFpbmVyKFxuICBjb250cm9sOiBGb3JtR3JvdXAgfCBGb3JtQXJyYXksXG4gIGRpcjogQWJzdHJhY3RGb3JtR3JvdXBEaXJlY3RpdmUgfCBGb3JtQXJyYXlOYW1lLFxuKSB7XG4gIGlmIChjb250cm9sID09IG51bGwgJiYgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkpXG4gICAgX3Rocm93RXJyb3IoZGlyLCAnQ2Fubm90IGZpbmQgY29udHJvbCB3aXRoJyk7XG4gIHNldFVwVmFsaWRhdG9ycyhjb250cm9sLCBkaXIpO1xufVxuXG4vKipcbiAqIFJldmVydHMgdGhlIHNldHVwIHBlcmZvcm1lZCBieSB0aGUgYHNldFVwRm9ybUNvbnRhaW5lcmAgZnVuY3Rpb24uXG4gKlxuICogQHBhcmFtIGNvbnRyb2wgRm9ybUdyb3VwIG9yIEZvcm1BcnJheSBpbnN0YW5jZSB0aGF0IHNob3VsZCBiZSBjbGVhbmVkIHVwLlxuICogQHBhcmFtIGRpciBEaXJlY3RpdmUgdGhhdCBwcm92aWRlZCB2aWV3IHZhbGlkYXRvcnMuXG4gKiBAcmV0dXJucyB0cnVlIGlmIGEgY29udHJvbCB3YXMgdXBkYXRlZCBhcyBhIHJlc3VsdCBvZiB0aGlzIGFjdGlvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNsZWFuVXBGb3JtQ29udGFpbmVyKFxuICBjb250cm9sOiBGb3JtR3JvdXAgfCBGb3JtQXJyYXksXG4gIGRpcjogQWJzdHJhY3RGb3JtR3JvdXBEaXJlY3RpdmUgfCBGb3JtQXJyYXlOYW1lLFxuKTogYm9vbGVhbiB7XG4gIHJldHVybiBjbGVhblVwVmFsaWRhdG9ycyhjb250cm9sLCBkaXIpO1xufVxuXG5mdW5jdGlvbiBfbm9Db250cm9sRXJyb3IoZGlyOiBOZ0NvbnRyb2wpIHtcbiAgcmV0dXJuIF90aHJvd0Vycm9yKGRpciwgJ1RoZXJlIGlzIG5vIEZvcm1Db250cm9sIGluc3RhbmNlIGF0dGFjaGVkIHRvIGZvcm0gY29udHJvbCBlbGVtZW50IHdpdGgnKTtcbn1cblxuZnVuY3Rpb24gX3Rocm93RXJyb3IoZGlyOiBBYnN0cmFjdENvbnRyb2xEaXJlY3RpdmUsIG1lc3NhZ2U6IHN0cmluZyk6IHZvaWQge1xuICBjb25zdCBtZXNzYWdlRW5kID0gX2Rlc2NyaWJlQ29udHJvbExvY2F0aW9uKGRpcik7XG4gIHRocm93IG5ldyBFcnJvcihgJHttZXNzYWdlfSAke21lc3NhZ2VFbmR9YCk7XG59XG5cbmZ1bmN0aW9uIF9kZXNjcmliZUNvbnRyb2xMb2NhdGlvbihkaXI6IEFic3RyYWN0Q29udHJvbERpcmVjdGl2ZSk6IHN0cmluZyB7XG4gIGNvbnN0IHBhdGggPSBkaXIucGF0aDtcbiAgaWYgKHBhdGggJiYgcGF0aC5sZW5ndGggPiAxKSByZXR1cm4gYHBhdGg6ICcke3BhdGguam9pbignIC0+ICcpfSdgO1xuICBpZiAocGF0aD8uWzBdKSByZXR1cm4gYG5hbWU6ICcke3BhdGh9J2A7XG4gIHJldHVybiAndW5zcGVjaWZpZWQgbmFtZSBhdHRyaWJ1dGUnO1xufVxuXG5mdW5jdGlvbiBfdGhyb3dNaXNzaW5nVmFsdWVBY2Nlc3NvckVycm9yKGRpcjogQWJzdHJhY3RDb250cm9sRGlyZWN0aXZlKSB7XG4gIGNvbnN0IGxvYyA9IF9kZXNjcmliZUNvbnRyb2xMb2NhdGlvbihkaXIpO1xuICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgIFJ1bnRpbWVFcnJvckNvZGUuTkdfTUlTU0lOR19WQUxVRV9BQ0NFU1NPUixcbiAgICBgTm8gdmFsdWUgYWNjZXNzb3IgZm9yIGZvcm0gY29udHJvbCAke2xvY30uYCxcbiAgKTtcbn1cblxuZnVuY3Rpb24gX3Rocm93SW52YWxpZFZhbHVlQWNjZXNzb3JFcnJvcihkaXI6IEFic3RyYWN0Q29udHJvbERpcmVjdGl2ZSkge1xuICBjb25zdCBsb2MgPSBfZGVzY3JpYmVDb250cm9sTG9jYXRpb24oZGlyKTtcbiAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICBSdW50aW1lRXJyb3JDb2RlLk5HX1ZBTFVFX0FDQ0VTU09SX05PVF9QUk9WSURFRCxcbiAgICBgVmFsdWUgYWNjZXNzb3Igd2FzIG5vdCBwcm92aWRlZCBhcyBhbiBhcnJheSBmb3IgZm9ybSBjb250cm9sIHdpdGggJHtsb2N9LiBgICtcbiAgICAgIGBDaGVjayB0aGF0IHRoZSBcXGBOR19WQUxVRV9BQ0NFU1NPUlxcYCB0b2tlbiBpcyBjb25maWd1cmVkIGFzIGEgXFxgbXVsdGk6IHRydWVcXGAgcHJvdmlkZXIuYCxcbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzUHJvcGVydHlVcGRhdGVkKGNoYW5nZXM6IHtba2V5OiBzdHJpbmddOiBhbnl9LCB2aWV3TW9kZWw6IGFueSk6IGJvb2xlYW4ge1xuICBpZiAoIWNoYW5nZXMuaGFzT3duUHJvcGVydHkoJ21vZGVsJykpIHJldHVybiBmYWxzZTtcbiAgY29uc3QgY2hhbmdlID0gY2hhbmdlc1snbW9kZWwnXTtcblxuICBpZiAoY2hhbmdlLmlzRmlyc3RDaGFuZ2UoKSkgcmV0dXJuIHRydWU7XG4gIHJldHVybiAhT2JqZWN0LmlzKHZpZXdNb2RlbCwgY2hhbmdlLmN1cnJlbnRWYWx1ZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0J1aWx0SW5BY2Nlc3Nvcih2YWx1ZUFjY2Vzc29yOiBDb250cm9sVmFsdWVBY2Nlc3Nvcik6IGJvb2xlYW4ge1xuICAvLyBDaGVjayBpZiBhIGdpdmVuIHZhbHVlIGFjY2Vzc29yIGlzIGFuIGluc3RhbmNlIG9mIGEgY2xhc3MgdGhhdCBkaXJlY3RseSBleHRlbmRzXG4gIC8vIGBCdWlsdEluQ29udHJvbFZhbHVlQWNjZXNzb3JgIG9uZS5cbiAgcmV0dXJuIE9iamVjdC5nZXRQcm90b3R5cGVPZih2YWx1ZUFjY2Vzc29yLmNvbnN0cnVjdG9yKSA9PT0gQnVpbHRJbkNvbnRyb2xWYWx1ZUFjY2Vzc29yO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3luY1BlbmRpbmdDb250cm9scyhcbiAgZm9ybTogRm9ybUdyb3VwLFxuICBkaXJlY3RpdmVzOiBTZXQ8TmdDb250cm9sPiB8IE5nQ29udHJvbFtdLFxuKTogdm9pZCB7XG4gIGZvcm0uX3N5bmNQZW5kaW5nQ29udHJvbHMoKTtcbiAgZGlyZWN0aXZlcy5mb3JFYWNoKChkaXI6IE5nQ29udHJvbCkgPT4ge1xuICAgIGNvbnN0IGNvbnRyb2wgPSBkaXIuY29udHJvbCBhcyBGb3JtQ29udHJvbDtcbiAgICBpZiAoY29udHJvbC51cGRhdGVPbiA9PT0gJ3N1Ym1pdCcgJiYgY29udHJvbC5fcGVuZGluZ0NoYW5nZSkge1xuICAgICAgZGlyLnZpZXdUb01vZGVsVXBkYXRlKGNvbnRyb2wuX3BlbmRpbmdWYWx1ZSk7XG4gICAgICBjb250cm9sLl9wZW5kaW5nQ2hhbmdlID0gZmFsc2U7XG4gICAgfVxuICB9KTtcbn1cblxuLy8gVE9ETzogdnNhdmtpbiByZW1vdmUgaXQgb25jZSBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyL2lzc3Vlcy8zMDExIGlzIGltcGxlbWVudGVkXG5leHBvcnQgZnVuY3Rpb24gc2VsZWN0VmFsdWVBY2Nlc3NvcihcbiAgZGlyOiBOZ0NvbnRyb2wsXG4gIHZhbHVlQWNjZXNzb3JzOiBDb250cm9sVmFsdWVBY2Nlc3NvcltdLFxuKTogQ29udHJvbFZhbHVlQWNjZXNzb3IgfCBudWxsIHtcbiAgaWYgKCF2YWx1ZUFjY2Vzc29ycykgcmV0dXJuIG51bGw7XG5cbiAgaWYgKCFBcnJheS5pc0FycmF5KHZhbHVlQWNjZXNzb3JzKSAmJiAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSlcbiAgICBfdGhyb3dJbnZhbGlkVmFsdWVBY2Nlc3NvckVycm9yKGRpcik7XG5cbiAgbGV0IGRlZmF1bHRBY2Nlc3NvcjogQ29udHJvbFZhbHVlQWNjZXNzb3IgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gIGxldCBidWlsdGluQWNjZXNzb3I6IENvbnRyb2xWYWx1ZUFjY2Vzc29yIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICBsZXQgY3VzdG9tQWNjZXNzb3I6IENvbnRyb2xWYWx1ZUFjY2Vzc29yIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuXG4gIHZhbHVlQWNjZXNzb3JzLmZvckVhY2goKHY6IENvbnRyb2xWYWx1ZUFjY2Vzc29yKSA9PiB7XG4gICAgaWYgKHYuY29uc3RydWN0b3IgPT09IERlZmF1bHRWYWx1ZUFjY2Vzc29yKSB7XG4gICAgICBkZWZhdWx0QWNjZXNzb3IgPSB2O1xuICAgIH0gZWxzZSBpZiAoaXNCdWlsdEluQWNjZXNzb3IodikpIHtcbiAgICAgIGlmIChidWlsdGluQWNjZXNzb3IgJiYgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkpXG4gICAgICAgIF90aHJvd0Vycm9yKGRpciwgJ01vcmUgdGhhbiBvbmUgYnVpbHQtaW4gdmFsdWUgYWNjZXNzb3IgbWF0Y2hlcyBmb3JtIGNvbnRyb2wgd2l0aCcpO1xuICAgICAgYnVpbHRpbkFjY2Vzc29yID0gdjtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGN1c3RvbUFjY2Vzc29yICYmICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpKVxuICAgICAgICBfdGhyb3dFcnJvcihkaXIsICdNb3JlIHRoYW4gb25lIGN1c3RvbSB2YWx1ZSBhY2Nlc3NvciBtYXRjaGVzIGZvcm0gY29udHJvbCB3aXRoJyk7XG4gICAgICBjdXN0b21BY2Nlc3NvciA9IHY7XG4gICAgfVxuICB9KTtcblxuICBpZiAoY3VzdG9tQWNjZXNzb3IpIHJldHVybiBjdXN0b21BY2Nlc3NvcjtcbiAgaWYgKGJ1aWx0aW5BY2Nlc3NvcikgcmV0dXJuIGJ1aWx0aW5BY2Nlc3NvcjtcbiAgaWYgKGRlZmF1bHRBY2Nlc3NvcikgcmV0dXJuIGRlZmF1bHRBY2Nlc3NvcjtcblxuICBpZiAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSB7XG4gICAgX3Rocm93RXJyb3IoZGlyLCAnTm8gdmFsaWQgdmFsdWUgYWNjZXNzb3IgZm9yIGZvcm0gY29udHJvbCB3aXRoJyk7XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW1vdmVMaXN0SXRlbTxUPihsaXN0OiBUW10sIGVsOiBUKTogdm9pZCB7XG4gIGNvbnN0IGluZGV4ID0gbGlzdC5pbmRleE9mKGVsKTtcbiAgaWYgKGluZGV4ID4gLTEpIGxpc3Quc3BsaWNlKGluZGV4LCAxKTtcbn1cblxuLy8gVE9ETyhrYXJhKTogcmVtb3ZlIGFmdGVyIGRlcHJlY2F0aW9uIHBlcmlvZFxuZXhwb3J0IGZ1bmN0aW9uIF9uZ01vZGVsV2FybmluZyhcbiAgbmFtZTogc3RyaW5nLFxuICB0eXBlOiB7X25nTW9kZWxXYXJuaW5nU2VudE9uY2U6IGJvb2xlYW59LFxuICBpbnN0YW5jZToge19uZ01vZGVsV2FybmluZ1NlbnQ6IGJvb2xlYW59LFxuICB3YXJuaW5nQ29uZmlnOiBzdHJpbmcgfCBudWxsLFxuKSB7XG4gIGlmICh3YXJuaW5nQ29uZmlnID09PSAnbmV2ZXInKSByZXR1cm47XG5cbiAgaWYgKFxuICAgICgod2FybmluZ0NvbmZpZyA9PT0gbnVsbCB8fCB3YXJuaW5nQ29uZmlnID09PSAnb25jZScpICYmICF0eXBlLl9uZ01vZGVsV2FybmluZ1NlbnRPbmNlKSB8fFxuICAgICh3YXJuaW5nQ29uZmlnID09PSAnYWx3YXlzJyAmJiAhaW5zdGFuY2UuX25nTW9kZWxXYXJuaW5nU2VudClcbiAgKSB7XG4gICAgY29uc29sZS53YXJuKG5nTW9kZWxXYXJuaW5nKG5hbWUpKTtcbiAgICB0eXBlLl9uZ01vZGVsV2FybmluZ1NlbnRPbmNlID0gdHJ1ZTtcbiAgICBpbnN0YW5jZS5fbmdNb2RlbFdhcm5pbmdTZW50ID0gdHJ1ZTtcbiAgfVxufVxuIl19