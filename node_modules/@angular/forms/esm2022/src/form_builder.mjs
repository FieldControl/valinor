/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { inject, Injectable } from '@angular/core';
import { AbstractControl } from './model/abstract_model';
import { FormArray } from './model/form_array';
import { FormControl, } from './model/form_control';
import { FormGroup, FormRecord } from './model/form_group';
import * as i0 from "@angular/core";
function isAbstractControlOptions(options) {
    return (!!options &&
        (options.asyncValidators !== undefined ||
            options.validators !== undefined ||
            options.updateOn !== undefined));
}
/**
 * @description
 * Creates an `AbstractControl` from a user-specified configuration.
 *
 * The `FormBuilder` provides syntactic sugar that shortens creating instances of a
 * `FormControl`, `FormGroup`, or `FormArray`. It reduces the amount of boilerplate needed to
 * build complex forms.
 *
 * @see [Reactive Forms Guide](guide/forms/reactive-forms)
 *
 * @publicApi
 */
export class FormBuilder {
    constructor() {
        this.useNonNullable = false;
    }
    /**
     * @description
     * Returns a FormBuilder in which automatically constructed `FormControl` elements
     * have `{nonNullable: true}` and are non-nullable.
     *
     * **Constructing non-nullable controls**
     *
     * When constructing a control, it will be non-nullable, and will reset to its initial value.
     *
     * ```ts
     * let nnfb = new FormBuilder().nonNullable;
     * let name = nnfb.control('Alex'); // FormControl<string>
     * name.reset();
     * console.log(name); // 'Alex'
     * ```
     *
     * **Constructing non-nullable groups or arrays**
     *
     * When constructing a group or array, all automatically created inner controls will be
     * non-nullable, and will reset to their initial values.
     *
     * ```ts
     * let nnfb = new FormBuilder().nonNullable;
     * let name = nnfb.group({who: 'Alex'}); // FormGroup<{who: FormControl<string>}>
     * name.reset();
     * console.log(name); // {who: 'Alex'}
     * ```
     * **Constructing *nullable* fields on groups or arrays**
     *
     * It is still possible to have a nullable field. In particular, any `FormControl` which is
     * *already* constructed will not be altered. For example:
     *
     * ```ts
     * let nnfb = new FormBuilder().nonNullable;
     * // FormGroup<{who: FormControl<string|null>}>
     * let name = nnfb.group({who: new FormControl('Alex')});
     * name.reset(); console.log(name); // {who: null}
     * ```
     *
     * Because the inner control is constructed explicitly by the caller, the builder has
     * no control over how it is created, and cannot exclude the `null`.
     */
    get nonNullable() {
        const nnfb = new FormBuilder();
        nnfb.useNonNullable = true;
        return nnfb;
    }
    group(controls, options = null) {
        const reducedControls = this._reduceControls(controls);
        let newOptions = {};
        if (isAbstractControlOptions(options)) {
            // `options` are `AbstractControlOptions`
            newOptions = options;
        }
        else if (options !== null) {
            // `options` are legacy form group options
            newOptions.validators = options.validator;
            newOptions.asyncValidators = options.asyncValidator;
        }
        return new FormGroup(reducedControls, newOptions);
    }
    /**
     * @description
     * Constructs a new `FormRecord` instance. Accepts a single generic argument, which is an object
     * containing all the keys and corresponding inner control types.
     *
     * @param controls A collection of child controls. The key for each child is the name
     * under which it is registered.
     *
     * @param options Configuration options object for the `FormRecord`. The object should have the
     * `AbstractControlOptions` type and might contain the following fields:
     * * `validators`: A synchronous validator function, or an array of validator functions.
     * * `asyncValidators`: A single async validator or array of async validator functions.
     * * `updateOn`: The event upon which the control should be updated (options: 'change' | 'blur'
     * | submit').
     */
    record(controls, options = null) {
        const reducedControls = this._reduceControls(controls);
        // Cast to `any` because the inferred types are not as specific as Element.
        return new FormRecord(reducedControls, options);
    }
    /**
     * @description
     * Constructs a new `FormControl` with the given state, validators and options. Sets
     * `{nonNullable: true}` in the options to get a non-nullable control. Otherwise, the
     * control will be nullable. Accepts a single generic argument, which is the type  of the
     * control's value.
     *
     * @param formState Initializes the control with an initial state value, or
     * with an object that contains both a value and a disabled status.
     *
     * @param validatorOrOpts A synchronous validator function, or an array of
     * such functions, or a `FormControlOptions` object that contains
     * validation functions and a validation trigger.
     *
     * @param asyncValidator A single async validator or array of async validator
     * functions.
     *
     * @usageNotes
     *
     * ### Initialize a control as disabled
     *
     * The following example returns a control with an initial value in a disabled state.
     *
     * <code-example path="forms/ts/formBuilder/form_builder_example.ts" region="disabled-control">
     * </code-example>
     */
    control(formState, validatorOrOpts, asyncValidator) {
        let newOptions = {};
        if (!this.useNonNullable) {
            return new FormControl(formState, validatorOrOpts, asyncValidator);
        }
        if (isAbstractControlOptions(validatorOrOpts)) {
            // If the second argument is options, then they are copied.
            newOptions = validatorOrOpts;
        }
        else {
            // If the other arguments are validators, they are copied into an options object.
            newOptions.validators = validatorOrOpts;
            newOptions.asyncValidators = asyncValidator;
        }
        return new FormControl(formState, { ...newOptions, nonNullable: true });
    }
    /**
     * Constructs a new `FormArray` from the given array of configurations,
     * validators and options. Accepts a single generic argument, which is the type of each control
     * inside the array.
     *
     * @param controls An array of child controls or control configs. Each child control is given an
     *     index when it is registered.
     *
     * @param validatorOrOpts A synchronous validator function, or an array of such functions, or an
     *     `AbstractControlOptions` object that contains
     * validation functions and a validation trigger.
     *
     * @param asyncValidator A single async validator or array of async validator functions.
     */
    array(controls, validatorOrOpts, asyncValidator) {
        const createdControls = controls.map((c) => this._createControl(c));
        // Cast to `any` because the inferred types are not as specific as Element.
        return new FormArray(createdControls, validatorOrOpts, asyncValidator);
    }
    /** @internal */
    _reduceControls(controls) {
        const createdControls = {};
        Object.keys(controls).forEach((controlName) => {
            createdControls[controlName] = this._createControl(controls[controlName]);
        });
        return createdControls;
    }
    /** @internal */
    _createControl(controls) {
        if (controls instanceof FormControl) {
            return controls;
        }
        else if (controls instanceof AbstractControl) {
            // A control; just return it
            return controls;
        }
        else if (Array.isArray(controls)) {
            // ControlConfig Tuple
            const value = controls[0];
            const validator = controls.length > 1 ? controls[1] : null;
            const asyncValidator = controls.length > 2 ? controls[2] : null;
            return this.control(value, validator, asyncValidator);
        }
        else {
            // T or FormControlState<T>
            return this.control(controls);
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: FormBuilder, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: FormBuilder, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: FormBuilder, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });
/**
 * @description
 * `NonNullableFormBuilder` is similar to {@link FormBuilder}, but automatically constructed
 * {@link FormControl} elements have `{nonNullable: true}` and are non-nullable.
 *
 * @publicApi
 */
export class NonNullableFormBuilder {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: NonNullableFormBuilder, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: NonNullableFormBuilder, providedIn: 'root', useFactory: () => inject(FormBuilder).nonNullable }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: NonNullableFormBuilder, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root',
                    useFactory: () => inject(FormBuilder).nonNullable,
                }]
        }] });
/**
 * UntypedFormBuilder is the same as `FormBuilder`, but it provides untyped controls.
 */
export class UntypedFormBuilder extends FormBuilder {
    group(controlsConfig, options = null) {
        return super.group(controlsConfig, options);
    }
    /**
     * Like `FormBuilder#control`, except the resulting control is untyped.
     */
    control(formState, validatorOrOpts, asyncValidator) {
        return super.control(formState, validatorOrOpts, asyncValidator);
    }
    /**
     * Like `FormBuilder#array`, except the resulting array is untyped.
     */
    array(controlsConfig, validatorOrOpts, asyncValidator) {
        return super.array(controlsConfig, validatorOrOpts, asyncValidator);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: UntypedFormBuilder, deps: null, target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: UntypedFormBuilder, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: UntypedFormBuilder, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybV9idWlsZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvZm9ybXMvc3JjL2Zvcm1fYnVpbGRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsTUFBTSxFQUFFLFVBQVUsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUdqRCxPQUFPLEVBQUMsZUFBZSxFQUFvQyxNQUFNLHdCQUF3QixDQUFDO0FBQzFGLE9BQU8sRUFBQyxTQUFTLEVBQW1CLE1BQU0sb0JBQW9CLENBQUM7QUFDL0QsT0FBTyxFQUNMLFdBQVcsR0FJWixNQUFNLHNCQUFzQixDQUFDO0FBQzlCLE9BQU8sRUFBQyxTQUFTLEVBQUUsVUFBVSxFQUFtQixNQUFNLG9CQUFvQixDQUFDOztBQUUzRSxTQUFTLHdCQUF3QixDQUMvQixPQUF5RTtJQUV6RSxPQUFPLENBQ0wsQ0FBQyxDQUFDLE9BQU87UUFDVCxDQUFFLE9BQWtDLENBQUMsZUFBZSxLQUFLLFNBQVM7WUFDL0QsT0FBa0MsQ0FBQyxVQUFVLEtBQUssU0FBUztZQUMzRCxPQUFrQyxDQUFDLFFBQVEsS0FBSyxTQUFTLENBQUMsQ0FDOUQsQ0FBQztBQUNKLENBQUM7QUF1RkQ7Ozs7Ozs7Ozs7O0dBV0c7QUFFSCxNQUFNLE9BQU8sV0FBVztJQUR4QjtRQUVVLG1CQUFjLEdBQVksS0FBSyxDQUFDO0tBMlF6QztJQXpRQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7T0F5Q0c7SUFDSCxJQUFJLFdBQVc7UUFDYixNQUFNLElBQUksR0FBRyxJQUFJLFdBQVcsRUFBRSxDQUFDO1FBQy9CLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDO1FBQzNCLE9BQU8sSUFBOEIsQ0FBQztJQUN4QyxDQUFDO0lBK0NELEtBQUssQ0FDSCxRQUE4QixFQUM5QixVQUFnRSxJQUFJO1FBRXBFLE1BQU0sZUFBZSxHQUFHLElB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RSxJQUFJO1FBRXBFLE9BQU8sS0FBSyxDQUFDLEtBQUssQ0FBQyxjQUFjLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDOUMsQ0FBQztJQUVEOztPQUVHO0lBQ00sT0FBTyxDQUNkLFNBQWMsRUFDZCxlQUF5RSxFQUN6RSxjQUE2RDtRQUU3RCxPQUFPLEtBQUssQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLGVBQWUsRUFBRSxjQUFjLENBQUMsQ0FBQztJQUNuRSxDQUFDO0lBRUQ7O09BRUc7SUFDTSxLQUFLLENBQ1osY0FBcUIsRUFDckIsZUFBNkUsRUFDN0UsY0FBNkQ7UUFFN0QsT0FBTyxLQUFLLENBQUMsS0FBSyxDQUFDLGNBQWMsRUFBRSxlQUFlLEVBQUUsY0FBYyxDQUFDLENBQUM7SUFDdEUsQ0FBQzt5SEE3Q1Usa0JBQWtCOzZIQUFsQixrQkFBa0IsY0FETixNQUFNOztzR0FDbEIsa0JBQWtCO2tCQUQ5QixVQUFVO21CQUFDLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtpbmplY3QsIEluamVjdGFibGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge0FzeW5jVmFsaWRhdG9yRm4sIFZhbGlkYXRvckZufSBmcm9tICcuL2RpcmVjdGl2ZXMvdmFsaWRhdG9ycyc7XG5pbXBvcnQge0Fic3RyYWN0Q29udHJvbCwgQWJzdHJhY3RDb250cm9sT3B0aW9ucywgRm9ybUhvb2tzfSBmcm9tICcuL21vZGVsL2Fic3RyYWN0X21vZGVsJztcbmltcG9ydCB7Rm9ybUFycmF5LCBVbnR5cGVkRm9ybUFycmF5fSBmcm9tICcuL21vZGVsL2Zvcm1fYXJyYXknO1xuaW1wb3J0IHtcbiAgRm9ybUNvbnRyb2wsXG4gIEZvcm1Db250cm9sT3B0aW9ucyxcbiAgRm9ybUNvbnRyb2xTdGF0ZSxcbiAgVW50eXBlZEZvcm1Db250cm9sLFxufSBmcm9tICcuL21vZGVsL2Zvcm1fY29udHJvbCc7XG5pbXBvcnQge0Zvcm1Hcm91cCwgRm9ybVJlY29yZCwgVW50eXBlZEZvcm1Hcm91cH0gZnJvbSAnLi9tb2RlbC9mb3JtX2dyb3VwJztcblxuZnVuY3Rpb24gaXNBYnN0cmFjdENvbnRyb2xPcHRpb25zKFxuICBvcHRpb25zOiBBYnN0cmFjdENvbnRyb2xPcHRpb25zIHwge1trZXk6IHN0cmluZ106IGFueX0gfCBudWxsIHwgdW5kZWZpbmVkLFxuKTogb3B0aW9ucyBpcyBBYnN0cmFjdENvbnRyb2xPcHRpb25zIHtcbiAgcmV0dXJuIChcbiAgICAhIW9wdGlvbnMgJiZcbiAgICAoKG9wdGlvbnMgYXMgQWJzdHJhY3RDb250cm9sT3B0aW9ucykuYXN5bmNWYWxpZGF0b3JzICE9PSB1bmRlZmluZWQgfHxcbiAgICAgIChvcHRpb25zIGFzIEFic3RyYWN0Q29udHJvbE9wdGlvbnMpLnZhbGlkYXRvcnMgIT09IHVuZGVmaW5lZCB8fFxuICAgICAgKG9wdGlvbnMgYXMgQWJzdHJhY3RDb250cm9sT3B0aW9ucykudXBkYXRlT24gIT09IHVuZGVmaW5lZClcbiAgKTtcbn1cblxuLyoqXG4gKiBUaGUgdW5pb24gb2YgYWxsIHZhbGlkYXRvciB0eXBlcyB0aGF0IGNhbiBiZSBhY2NlcHRlZCBieSBhIENvbnRyb2xDb25maWcuXG4gKi9cbnR5cGUgVmFsaWRhdG9yQ29uZmlnID0gVmFsaWRhdG9yRm4gfCBBc3luY1ZhbGlkYXRvckZuIHwgVmFsaWRhdG9yRm5bXSB8IEFzeW5jVmFsaWRhdG9yRm5bXTtcblxuLyoqXG4gKiBUaGUgY29tcGlsZXIgbWF5IG5vdCBhbHdheXMgYmUgYWJsZSB0byBwcm92ZSB0aGF0IHRoZSBlbGVtZW50cyBvZiB0aGUgY29udHJvbCBjb25maWcgYXJlIGEgdHVwbGVcbiAqIChpLmUuIG9jY3VyIGluIGEgZml4ZWQgb3JkZXIpLiBUaGlzIHNsaWdodGx5IGxvb3NlciB0eXBlIGlzIHVzZWQgZm9yIGluZmVyZW5jZSwgdG8gY2F0Y2ggY2FzZXNcbiAqIHdoZXJlIHRoZSBjb21waWxlciBjYW5ub3QgcHJvdmUgb3JkZXIgYW5kIHBvc2l0aW9uLlxuICpcbiAqIEZvciBleGFtcGxlLCBjb25zaWRlciB0aGUgc2ltcGxlIGNhc2UgYGZiLmdyb3VwKHtmb286IFsnYmFyJywgVmFsaWRhdG9ycy5yZXF1aXJlZF19KWAuIFRoZVxuICogY29tcGlsZXIgd2lsbCBpbmZlciB0aGlzIGFzIGFuIGFycmF5LCBub3QgYXMgYSB0dXBsZS5cbiAqL1xudHlwZSBQZXJtaXNzaXZlQ29udHJvbENvbmZpZzxUPiA9IEFycmF5PFQgfCBGb3JtQ29udHJvbFN0YXRlPFQ+IHwgVmFsaWRhdG9yQ29uZmlnPjtcblxuLyoqXG4gKiBIZWxwZXIgdHlwZSB0byBhbGxvdyB0aGUgY29tcGlsZXIgdG8gYWNjZXB0IFtYWFhYLCB7IHVwZGF0ZU9uOiBzdHJpbmcgfV0gYXMgYSB2YWxpZCBzaG9ydGhhbmRcbiAqIGFyZ3VtZW50IGZvciAuZ3JvdXAoKVxuICovXG5pbnRlcmZhY2UgUGVybWlzc2l2ZUFic3RyYWN0Q29udHJvbE9wdGlvbnMgZXh0ZW5kcyBPbWl0PEFic3RyYWN0Q29udHJvbE9wdGlvbnMsICd1cGRhdGVPbic+IHtcbiAgdXBkYXRlT24/OiBzdHJpbmc7XG59XG5cbi8qKlxuICogQ29udHJvbENvbmZpZzxUPiBpcyBhIHR1cGxlIGNvbnRhaW5pbmcgYSB2YWx1ZSBvZiB0eXBlIFQsIHBsdXMgb3B0aW9uYWwgdmFsaWRhdG9ycyBhbmQgYXN5bmNcbiAqIHZhbGlkYXRvcnMuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgdHlwZSBDb250cm9sQ29uZmlnPFQ+ID0gW1xuICBUIHwgRm9ybUNvbnRyb2xTdGF0ZTxUPixcbiAgKFZhbGlkYXRvckZuIHwgVmFsaWRhdG9yRm5bXSk/LFxuICAoQXN5bmNWYWxpZGF0b3JGbiB8IEFzeW5jVmFsaWRhdG9yRm5bXSk/LFxuXTtcblxuLyoqXG4gKiBGb3JtQnVpbGRlciBhY2NlcHRzIHZhbHVlcyBpbiB2YXJpb3VzIGNvbnRhaW5lciBzaGFwZXMsIGFzIHdlbGwgYXMgcmF3IHZhbHVlcy5cbiAqIEVsZW1lbnQgcmV0dXJucyB0aGUgYXBwcm9wcmlhdGUgY29ycmVzcG9uZGluZyBtb2RlbCBjbGFzcywgZ2l2ZW4gdGhlIGNvbnRhaW5lciBULlxuICogVGhlIGZsYWcgTiwgaWYgbm90IG5ldmVyLCBtYWtlcyB0aGUgcmVzdWx0aW5nIGBGb3JtQ29udHJvbGAgaGF2ZSBOIGluIGl0cyB0eXBlLlxuICovXG5leHBvcnQgdHlwZSDJtUVsZW1lbnQ8VCwgTiBleHRlbmRzIG51bGw+ID1cbiAgLy8gVGhlIGBleHRlbmRzYCBjaGVja3MgYXJlIHdyYXBwZWQgaW4gYXJyYXlzIGluIG9yZGVyIHRvIHByZXZlbnQgVHlwZVNjcmlwdCBmcm9tIGFwcGx5aW5nIHR5cGUgdW5pb25zXG4gIC8vIHRocm91Z2ggdGhlIGRpc3RyaWJ1dGl2ZSBjb25kaXRpb25hbCB0eXBlLiBUaGlzIGlzIHRoZSBvZmZpY2lhbGx5IHJlY29tbWVuZGVkIHNvbHV0aW9uOlxuICAvLyBodHRwczovL3d3dy50eXBlc2NyaXB0bGFuZy5vcmcvZG9jcy9oYW5kYm9vay8yL2NvbmRpdGlvbmFsLXR5cGVzLmh0bWwjZGlzdHJpYnV0aXZlLWNvbmRpdGlvbmFsLXR5cGVzXG4gIC8vXG4gIC8vIElkZW50aWZ5IEZvcm1Db250cm9sIGNvbnRhaW5lciB0eXBlcy5cbiAgW1RdIGV4dGVuZHMgW0Zvcm1Db250cm9sPGluZmVyIFU+XVxuICAgID8gRm9ybUNvbnRyb2w8VT5cbiAgICA6IC8vIE9yIEZvcm1Db250cm9sIGNvbnRhaW5lcnMgdGhhdCBhcmUgb3B0aW9uYWwgaW4gdGhlaXIgcGFyZW50IGdyb3VwLlxuICAgICAgW1RdIGV4dGVuZHMgW0Zvcm1Db250cm9sPGluZmVyIFU+IHwgdW5kZWZpbmVkXVxuICAgICAgPyBGb3JtQ29udHJvbDxVPlxuICAgICAgOiAvLyBGb3JtR3JvdXAgY29udGFpbmVycy5cbiAgICAgICAgW1RdIGV4dGVuZHMgW0Zvcm1Hcm91cDxpbmZlciBVPl1cbiAgICAgICAgPyBGb3JtR3JvdXA8VT5cbiAgICAgICAgOiAvLyBPcHRpb25hbCBGb3JtR3JvdXAgY29udGFpbmVycy5cbiAgICAgICAgICBbVF0gZXh0ZW5kcyBbRm9ybUdyb3VwPGluZmVyIFU+IHwgdW5kZWZpbmVkXVxuICAgICAgICAgID8gRm9ybUdyb3VwPFU+XG4gICAgICAgICAgOiAvLyBGb3JtUmVjb3JkIGNvbnRhaW5lcnMuXG4gICAgICAgICAgICBbVF0gZXh0ZW5kcyBbRm9ybVJlY29yZDxpbmZlciBVPl1cbiAgICAgICAgICAgID8gRm9ybVJlY29yZDxVPlxuICAgICAgICAgICAgOiAvLyBPcHRpb25hbCBGb3JtUmVjb3JkIGNvbnRhaW5lcnMuXG4gICAgICAgICAgICAgIFtUXSBleHRlbmRzIFtGb3JtUmVjb3JkPGluZmVyIFU+IHwgdW5kZWZpbmVkXVxuICAgICAgICAgICAgICA/IEZvcm1SZWNvcmQ8VT5cbiAgICAgICAgICAgICAgOiAvLyBGb3JtQXJyYXkgY29udGFpbmVycy5cbiAgICAgICAgICAgICAgICBbVF0gZXh0ZW5kcyBbRm9ybUFycmF5PGluZmVyIFU+XVxuICAgICAgICAgICAgICAgID8gRm9ybUFycmF5PFU+XG4gICAgICAgICAgICAgICAgOiAvLyBPcHRpb25hbCBGb3JtQXJyYXkgY29udGFpbmVycy5cbiAgICAgICAgICAgICAgICAgIFtUXSBleHRlbmRzIFtGb3JtQXJyYXk8aW5mZXIgVT4gfCB1bmRlZmluZWRdXG4gICAgICAgICAgICAgICAgICA/IEZvcm1BcnJheTxVPlxuICAgICAgICAgICAgICAgICAgOiAvLyBPdGhlcndpc2UgdW5rbm93biBBYnN0cmFjdENvbnRyb2wgY29udGFpbmVycy5cbiAgICAgICAgICAgICAgICAgICAgW1RdIGV4dGVuZHMgW0Fic3RyYWN0Q29udHJvbDxpbmZlciBVPl1cbiAgICAgICAgICAgICAgICAgICAgPyBBYnN0cmFjdENvbnRyb2w8VT5cbiAgICAgICAgICAgICAgICAgICAgOiAvLyBPcHRpb25hbCBBYnN0cmFjdENvbnRyb2wgY29udGFpbmVycy5cbiAgICAgICAgICAgICAgICAgICAgICBbVF0gZXh0ZW5kcyBbQWJzdHJhY3RDb250cm9sPGluZmVyIFU+IHwgdW5kZWZpbmVkXVxuICAgICAgICAgICAgICAgICAgICAgID8gQWJzdHJhY3RDb250cm9sPFU+XG4gICAgICAgICAgICAgICAgICAgICAgOiAvLyBGb3JtQ29udHJvbFN0YXRlIG9iamVjdCBjb250YWluZXIsIHdoaWNoIHByb2R1Y2VzIGEgbnVsbGFibGUgY29udHJvbC5cbiAgICAgICAgICAgICAgICAgICAgICAgIFtUXSBleHRlbmRzIFtGb3JtQ29udHJvbFN0YXRlPGluZmVyIFU+XVxuICAgICAgICAgICAgICAgICAgICAgICAgPyBGb3JtQ29udHJvbDxVIHwgTj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDogLy8gQSBDb250cm9sQ29uZmlnIHR1cGxlLCB3aGljaCBwcm9kdWNlcyBhIG51bGxhYmxlIGNvbnRyb2wuXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFtUXSBleHRlbmRzIFtQZXJtaXNzaXZlQ29udHJvbENvbmZpZzxpbmZlciBVPl1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPyBGb3JtQ29udHJvbDxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEV4Y2x1ZGU8VSwgVmFsaWRhdG9yQ29uZmlnIHwgUGVybWlzc2l2ZUFic3RyYWN0Q29udHJvbE9wdGlvbnM+IHwgTlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgOiBGb3JtQ29udHJvbDxUIHwgTj47XG5cbi8qKlxuICogQGRlc2NyaXB0aW9uXG4gKiBDcmVhdGVzIGFuIGBBYnN0cmFjdENvbnRyb2xgIGZyb20gYSB1c2VyLXNwZWNpZmllZCBjb25maWd1cmF0aW9uLlxuICpcbiAqIFRoZSBgRm9ybUJ1aWxkZXJgIHByb3ZpZGVzIHN5bnRhY3RpYyBzdWdhciB0aGF0IHNob3J0ZW5zIGNyZWF0aW5nIGluc3RhbmNlcyBvZiBhXG4gKiBgRm9ybUNvbnRyb2xgLCBgRm9ybUdyb3VwYCwgb3IgYEZvcm1BcnJheWAuIEl0IHJlZHVjZXMgdGhlIGFtb3VudCBvZiBib2lsZXJwbGF0ZSBuZWVkZWQgdG9cbiAqIGJ1aWxkIGNvbXBsZXggZm9ybXMuXG4gKlxuICogQHNlZSBbUmVhY3RpdmUgRm9ybXMgR3VpZGVdKGd1aWRlL2Zvcm1zL3JlYWN0aXZlLWZvcm1zKVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQEluamVjdGFibGUoe3Byb3ZpZGVkSW46ICdyb290J30pXG5leHBvcnQgY2xhc3MgRm9ybUJ1aWxkZXIge1xuICBwcml2YXRlIHVzZU5vbk51bGxhYmxlOiBib29sZWFuID0gZmFsc2U7XG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBSZXR1cm5zIGEgRm9ybUJ1aWxkZXIgaW4gd2hpY2ggYXV0b21hdGljYWxseSBjb25zdHJ1Y3RlZCBgRm9ybUNvbnRyb2xgIGVsZW1lbnRzXG4gICAqIGhhdmUgYHtub25OdWxsYWJsZTogdHJ1ZX1gIGFuZCBhcmUgbm9uLW51bGxhYmxlLlxuICAgKlxuICAgKiAqKkNvbnN0cnVjdGluZyBub24tbnVsbGFibGUgY29udHJvbHMqKlxuICAgKlxuICAgKiBXaGVuIGNvbnN0cnVjdGluZyBhIGNvbnRyb2wsIGl0IHdpbGwgYmUgbm9uLW51bGxhYmxlLCBhbmQgd2lsbCByZXNldCB0byBpdHMgaW5pdGlhbCB2YWx1ZS5cbiAgICpcbiAgICogYGBgdHNcbiAgICogbGV0IG5uZmIgPSBuZXcgRm9ybUJ1aWxkZXIoKS5ub25OdWxsYWJsZTtcbiAgICogbGV0IG5hbWUgPSBubmZiLmNvbnRyb2woJ0FsZXgnKTsgLy8gRm9ybUNvbnRyb2w8c3RyaW5nPlxuICAgKiBuYW1lLnJlc2V0KCk7XG4gICAqIGNvbnNvbGUubG9nKG5hbWUpOyAvLyAnQWxleCdcbiAgICogYGBgXG4gICAqXG4gICAqICoqQ29uc3RydWN0aW5nIG5vbi1udWxsYWJsZSBncm91cHMgb3IgYXJyYXlzKipcbiAgICpcbiAgICogV2hlbiBjb25zdHJ1Y3RpbmcgYSBncm91cCBvciBhcnJheSwgYWxsIGF1dG9tYXRpY2FsbHkgY3JlYXRlZCBpbm5lciBjb250cm9scyB3aWxsIGJlXG4gICAqIG5vbi1udWxsYWJsZSwgYW5kIHdpbGwgcmVzZXQgdG8gdGhlaXIgaW5pdGlhbCB2YWx1ZXMuXG4gICAqXG4gICAqIGBgYHRzXG4gICAqIGxldCBubmZiID0gbmV3IEZvcm1CdWlsZGVyKCkubm9uTnVsbGFibGU7XG4gICAqIGxldCBuYW1lID0gbm5mYi5ncm91cCh7d2hvOiAnQWxleCd9KTsgLy8gRm9ybUdyb3VwPHt3aG86IEZvcm1Db250cm9sPHN0cmluZz59PlxuICAgKiBuYW1lLnJlc2V0KCk7XG4gICAqIGNvbnNvbGUubG9nKG5hbWUpOyAvLyB7d2hvOiAnQWxleCd9XG4gICAqIGBgYFxuICAgKiAqKkNvbnN0cnVjdGluZyAqbnVsbGFibGUqIGZpZWxkcyBvbiBncm91cHMgb3IgYXJyYXlzKipcbiAgICpcbiAgICogSXQgaXMgc3RpbGwgcG9zc2libGUgdG8gaGF2ZSBhIG51bGxhYmxlIGZpZWxkLiBJbiBwYXJ0aWN1bGFyLCBhbnkgYEZvcm1Db250cm9sYCB3aGljaCBpc1xuICAgKiAqYWxyZWFkeSogY29uc3RydWN0ZWQgd2lsbCBub3QgYmUgYWx0ZXJlZC4gRm9yIGV4YW1wbGU6XG4gICAqXG4gICAqIGBgYHRzXG4gICAqIGxldCBubmZiID0gbmV3IEZvcm1CdWlsZGVyKCkubm9uTnVsbGFibGU7XG4gICAqIC8vIEZvcm1Hcm91cDx7d2hvOiBGb3JtQ29udHJvbDxzdHJpbmd8bnVsbD59PlxuICAgKiBsZXQgbmFtZSA9IG5uZmIuZ3JvdXAoe3dobzogbmV3IEZvcm1Db250cm9sKCdBbGV4Jyl9KTtcbiAgICogbmFtZS5yZXNldCgpOyBjb25zb2xlLmxvZyhuYW1lKTsgLy8ge3dobzogbnVsbH1cbiAgICogYGBgXG4gICAqXG4gICAqIEJlY2F1c2UgdGhlIGlubmVyIGNvbnRyb2wgaXMgY29uc3RydWN0ZWQgZXhwbGljaXRseSBieSB0aGUgY2FsbGVyLCB0aGUgYnVpbGRlciBoYXNcbiAgICogbm8gY29udHJvbCBvdmVyIGhvdyBpdCBpcyBjcmVhdGVkLCBhbmQgY2Fubm90IGV4Y2x1ZGUgdGhlIGBudWxsYC5cbiAgICovXG4gIGdldCBub25OdWxsYWJsZSgpOiBOb25OdWxsYWJsZUZvcm1CdWlsZGVyIHtcbiAgICBjb25zdCBubmZiID0gbmV3IEZvcm1CdWlsZGVyKCk7XG4gICAgbm5mYi51c2VOb25OdWxsYWJsZSA9IHRydWU7XG4gICAgcmV0dXJuIG5uZmIgYXMgTm9uTnVsbGFibGVGb3JtQnVpbGRlcjtcbiAgfVxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogQ29uc3RydWN0cyBhIG5ldyBgRm9ybUdyb3VwYCBpbnN0YW5jZS4gQWNjZXB0cyBhIHNpbmdsZSBnZW5lcmljIGFyZ3VtZW50LCB3aGljaCBpcyBhbiBvYmplY3RcbiAgICogY29udGFpbmluZyBhbGwgdGhlIGtleXMgYW5kIGNvcnJlc3BvbmRpbmcgaW5uZXIgY29udHJvbCB0eXBlcy5cbiAgICpcbiAgICogQHBhcmFtIGNvbnRyb2xzIEEgY29sbGVjdGlvbiBvZiBjaGlsZCBjb250cm9scy4gVGhlIGtleSBmb3IgZWFjaCBjaGlsZCBpcyB0aGUgbmFtZVxuICAgKiB1bmRlciB3aGljaCBpdCBpcyByZWdpc3RlcmVkLlxuICAgKlxuICAgKiBAcGFyYW0gb3B0aW9ucyBDb25maWd1cmF0aW9uIG9wdGlvbnMgb2JqZWN0IGZvciB0aGUgYEZvcm1Hcm91cGAuIFRoZSBvYmplY3Qgc2hvdWxkIGhhdmUgdGhlXG4gICAqIGBBYnN0cmFjdENvbnRyb2xPcHRpb25zYCB0eXBlIGFuZCBtaWdodCBjb250YWluIHRoZSBmb2xsb3dpbmcgZmllbGRzOlxuICAgKiAqIGB2YWxpZGF0b3JzYDogQSBzeW5jaHJvbm91cyB2YWxpZGF0b3IgZnVuY3Rpb24sIG9yIGFuIGFycmF5IG9mIHZhbGlkYXRvciBmdW5jdGlvbnMuXG4gICAqICogYGFzeW5jVmFsaWRhdG9yc2A6IEEgc2luZ2xlIGFzeW5jIHZhbGlkYXRvciBvciBhcnJheSBvZiBhc3luYyB2YWxpZGF0b3IgZnVuY3Rpb25zLlxuICAgKiAqIGB1cGRhdGVPbmA6IFRoZSBldmVudCB1cG9uIHdoaWNoIHRoZSBjb250cm9sIHNob3VsZCBiZSB1cGRhdGVkIChvcHRpb25zOiAnY2hhbmdlJyB8ICdibHVyJ1xuICAgKiB8IHN1Ym1pdCcpLlxuICAgKi9cbiAgZ3JvdXA8VCBleHRlbmRzIHt9PihcbiAgICBjb250cm9sczogVCxcbiAgICBvcHRpb25zPzogQWJzdHJhY3RDb250cm9sT3B0aW9ucyB8IG51bGwsXG4gICk6IEZvcm1Hcm91cDx7W0sgaW4ga2V5b2YgVF06IMm1RWxlbWVudDxUW0tdLCBudWxsPn0+O1xuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogQ29uc3RydWN0cyBhIG5ldyBgRm9ybUdyb3VwYCBpbnN0YW5jZS5cbiAgICpcbiAgICogQGRlcHJlY2F0ZWQgVGhpcyBBUEkgaXMgbm90IHR5cGVzYWZlIGFuZCBjYW4gcmVzdWx0IGluIGlzc3VlcyB3aXRoIENsb3N1cmUgQ29tcGlsZXIgcmVuYW1pbmcuXG4gICAqIFVzZSB0aGUgYEZvcm1CdWlsZGVyI2dyb3VwYCBvdmVybG9hZCB3aXRoIGBBYnN0cmFjdENvbnRyb2xPcHRpb25zYCBpbnN0ZWFkLlxuICAgKiBOb3RlIHRoYXQgYEFic3RyYWN0Q29udHJvbE9wdGlvbnNgIGV4cGVjdHMgYHZhbGlkYXRvcnNgIGFuZCBgYXN5bmNWYWxpZGF0b3JzYCB0byBiZSB2YWxpZFxuICAgKiB2YWxpZGF0b3JzLiBJZiB5b3UgaGF2ZSBjdXN0b20gdmFsaWRhdG9ycywgbWFrZSBzdXJlIHRoZWlyIHZhbGlkYXRpb24gZnVuY3Rpb24gcGFyYW1ldGVyIGlzXG4gICAqIGBBYnN0cmFjdENvbnRyb2xgIGFuZCBub3QgYSBzdWItY2xhc3MsIHN1Y2ggYXMgYEZvcm1Hcm91cGAuIFRoZXNlIGZ1bmN0aW9ucyB3aWxsIGJlIGNhbGxlZFxuICAgKiB3aXRoIGFuIG9iamVjdCBvZiB0eXBlIGBBYnN0cmFjdENvbnRyb2xgIGFuZCB0aGF0IGNhbm5vdCBiZSBhdXRvbWF0aWNhbGx5IGRvd25jYXN0IHRvIGFcbiAgICogc3ViY2xhc3MsIHNvIFR5cGVTY3JpcHQgc2VlcyB0aGlzIGFzIGFuIGVycm9yLiBGb3IgZXhhbXBsZSwgY2hhbmdlIHRoZSBgKGdyb3VwOiBGb3JtR3JvdXApID0+XG4gICAqIFZhbGlkYXRpb25FcnJvcnN8bnVsbGAgc2lnbmF0dXJlIHRvIGJlIGAoZ3JvdXA6IEFic3RyYWN0Q29udHJvbCkgPT4gVmFsaWRhdGlvbkVycm9yc3xudWxsYC5cbiAgICpcbiAgICogQHBhcmFtIGNvbnRyb2xzIEEgcmVjb3JkIG9mIGNoaWxkIGNvbnRyb2xzLiBUaGUga2V5IGZvciBlYWNoIGNoaWxkIGlzIHRoZSBuYW1lXG4gICAqIHVuZGVyIHdoaWNoIHRoZSBjb250cm9sIGlzIHJlZ2lzdGVyZWQuXG4gICAqXG4gICAqIEBwYXJhbSBvcHRpb25zIENvbmZpZ3VyYXRpb24gb3B0aW9ucyBvYmplY3QgZm9yIHRoZSBgRm9ybUdyb3VwYC4gVGhlIGxlZ2FjeSBjb25maWd1cmF0aW9uXG4gICAqIG9iamVjdCBjb25zaXN0cyBvZjpcbiAgICogKiBgdmFsaWRhdG9yYDogQSBzeW5jaHJvbm91cyB2YWxpZGF0b3IgZnVuY3Rpb24sIG9yIGFuIGFycmF5IG9mIHZhbGlkYXRvciBmdW5jdGlvbnMuXG4gICAqICogYGFzeW5jVmFsaWRhdG9yYDogQSBzaW5nbGUgYXN5bmMgdmFsaWRhdG9yIG9yIGFycmF5IG9mIGFzeW5jIHZhbGlkYXRvciBmdW5jdGlvbnNcbiAgICogTm90ZTogdGhlIGxlZ2FjeSBmb3JtYXQgaXMgZGVwcmVjYXRlZCBhbmQgbWlnaHQgYmUgcmVtb3ZlZCBpbiBvbmUgb2YgdGhlIG5leHQgbWFqb3IgdmVyc2lvbnNcbiAgICogb2YgQW5ndWxhci5cbiAgICovXG4gIGdyb3VwKGNvbnRyb2xzOiB7W2tleTogc3RyaW5nXTogYW55fSwgb3B0aW9uczoge1trZXk6IHN0cmluZ106IGFueX0pOiBGb3JtR3JvdXA7XG5cbiAgZ3JvdXAoXG4gICAgY29udHJvbHM6IHtba2V5OiBzdHJpbmddOiBhbnl9LFxuICAgIG9wdGlvbnM6IEFic3RyYWN0Q29udHJvbE9wdGlvbnMgfCB7W2tleTogc3RyaW5nXTogYW55fSB8IG51bGwgPSBudWxsLFxuICApOiBGb3JtR3JvdXAge1xuICAgIGNvbnN0IHJlZHVjZWRDb250cm9scyA9IHRoaXMuX3JlZHVjZUNvbnRyb2xzKGNvbnRyb2xzKTtcbiAgICBsZXQgbmV3T3B0aW9uczogRm9ybUNvbnRyb2xPcHRpb25zID0ge307XG4gICAgaWYgKGlzQWJzdHJhY3RDb250cm9sT3B0aW9ucyhvcHRpb25zKSkge1xuICAgICAgLy8gYG9wdGlvbnNgIGFyZSBgQWJzdHJhY3RDb250cm9sT3B0aW9uc2BcbiAgICAgIG5ld09wdGlvbnMgPSBvcHRpb25zO1xuICAgIH0gZWxzZSBpZiAob3B0aW9ucyAhPT0gbnVsbCkge1xuICAgICAgLy8gYG9wdGlvbnNgIGFyZSBsZWdhY3kgZm9ybSBncm91cCBvcHRpb25zXG4gICAgICBuZXdPcHRpb25zLnZhbGlkYXRvcnMgPSAob3B0aW9ucyBhcyBhbnkpLnZhbGlkYXRvcjtcbiAgICAgIG5ld09wdGlvbnMuYXN5bmNWYWxpZGF0b3JzID0gKG9wdGlvbnMgYXMgYW55KS5hc3luY1ZhbGlkYXRvcjtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBGb3JtR3JvdXAocmVkdWNlZENvbnRyb2xzLCBuZXdPcHRpb25zKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogQ29uc3RydWN0cyBhIG5ldyBgRm9ybVJlY29yZGAgaW5zdGFuY2UuIEFjY2VwdHMgYSBzaW5nbGUgZ2VuZXJpYyBhcmd1bWVudCwgd2hpY2ggaXMgYW4gb2JqZWN0XG4gICAqIGNvbnRhaW5pbmcgYWxsIHRoZSBrZXlzIGFuZCBjb3JyZXNwb25kaW5nIGlubmVyIGNvbnRyb2wgdHlwZXMuXG4gICAqXG4gICAqIEBwYXJhbSBjb250cm9scyBBIGNvbGxlY3Rpb24gb2YgY2hpbGQgY29udHJvbHMuIFRoZSBrZXkgZm9yIGVhY2ggY2hpbGQgaXMgdGhlIG5hbWVcbiAgICogdW5kZXIgd2hpY2ggaXQgaXMgcmVnaXN0ZXJlZC5cbiAgICpcbiAgICogQHBhcmFtIG9wdGlvbnMgQ29uZmlndXJhdGlvbiBvcHRpb25zIG9iamVjdCBmb3IgdGhlIGBGb3JtUmVjb3JkYC4gVGhlIG9iamVjdCBzaG91bGQgaGF2ZSB0aGVcbiAgICogYEFic3RyYWN0Q29udHJvbE9wdGlvbnNgIHR5cGUgYW5kIG1pZ2h0IGNvbnRhaW4gdGhlIGZvbGxvd2luZyBmaWVsZHM6XG4gICAqICogYHZhbGlkYXRvcnNgOiBBIHN5bmNocm9ub3VzIHZhbGlkYXRvciBmdW5jdGlvbiwgb3IgYW4gYXJyYXkgb2YgdmFsaWRhdG9yIGZ1bmN0aW9ucy5cbiAgICogKiBgYXN5bmNWYWxpZGF0b3JzYDogQSBzaW5nbGUgYXN5bmMgdmFsaWRhdG9yIG9yIGFycmF5IG9mIGFzeW5jIHZhbGlkYXRvciBmdW5jdGlvbnMuXG4gICAqICogYHVwZGF0ZU9uYDogVGhlIGV2ZW50IHVwb24gd2hpY2ggdGhlIGNvbnRyb2wgc2hvdWxkIGJlIHVwZGF0ZWQgKG9wdGlvbnM6ICdjaGFuZ2UnIHwgJ2JsdXInXG4gICAqIHwgc3VibWl0JykuXG4gICAqL1xuICByZWNvcmQ8VD4oXG4gICAgY29udHJvbHM6IHtba2V5OiBzdHJpbmddOiBUfSxcbiAgICBvcHRpb25zOiBBYnN0cmFjdENvbnRyb2xPcHRpb25zIHwgbnVsbCA9IG51bGwsXG4gICk6IEZvcm1SZWNvcmQ8ybVFbGVtZW50PFQsIG51bGw+PiB7XG4gICAgY29uc3QgcmVkdWNlZENvbnRyb2xzID0gdGhpcy5fcmVkdWNlQ29udHJvbHMoY29udHJvbHMpO1xuICAgIC8vIENhc3QgdG8gYGFueWAgYmVjYXVzZSB0aGUgaW5mZXJyZWQgdHlwZXMgYXJlIG5vdCBhcyBzcGVjaWZpYyBhcyBFbGVtZW50LlxuICAgIHJldHVybiBuZXcgRm9ybVJlY29yZChyZWR1Y2VkQ29udHJvbHMsIG9wdGlvbnMpIGFzIGFueTtcbiAgfVxuXG4gIC8qKiBAZGVwcmVjYXRlZCBVc2UgYG5vbk51bGxhYmxlYCBpbnN0ZWFkLiAqL1xuICBjb250cm9sPFQ+KFxuICAgIGZvcm1TdGF0ZTogVCB8IEZvcm1Db250cm9sU3RhdGU8VD4sXG4gICAgb3B0czogRm9ybUNvbnRyb2xPcHRpb25zICYge1xuICAgICAgaW5pdGlhbFZhbHVlSXNEZWZhdWx0OiB0cnVlO1xuICAgIH0sXG4gICk6IEZvcm1Db250cm9sPFQ+O1xuXG4gIGNvbnRyb2w8VD4oXG4gICAgZm9ybVN0YXRlOiBUIHwgRm9ybUNvbnRyb2xTdGF0ZTxUPixcbiAgICBvcHRzOiBGb3JtQ29udHJvbE9wdGlvbnMgJiB7bm9uTnVsbGFibGU6IHRydWV9LFxuICApOiBGb3JtQ29udHJvbDxUPjtcblxuICAvKipcbiAgICogQGRlcHJlY2F0ZWQgV2hlbiBwYXNzaW5nIGFuIGBvcHRpb25zYCBhcmd1bWVudCwgdGhlIGBhc3luY1ZhbGlkYXRvcmAgYXJndW1lbnQgaGFzIG5vIGVmZmVjdC5cbiAgICovXG4gIGNvbnRyb2w8VD4oXG4gICAgZm9ybVN0YXRlOiBUIHwgRm9ybUNvbnRyb2xTdGF0ZTxUPixcbiAgICBvcHRzOiBGb3JtQ29udHJvbE9wdGlvbnMsXG4gICAgYXN5bmNWYWxpZGF0b3I6IEFzeW5jVmFsaWRhdG9yRm4gfCBBc3luY1ZhbGlkYXRvckZuW10sXG4gICk6IEZvcm1Db250cm9sPFQgfCBudWxsPjtcblxuICBjb250cm9sPFQ+KFxuICAgIGZvcm1TdGF0ZTogVCB8IEZvcm1Db250cm9sU3RhdGU8VD4sXG4gICAgdmFsaWRhdG9yT3JPcHRzPzogVmFsaWRhdG9yRm4gfCBWYWxpZGF0b3JGbltdIHwgRm9ybUNvbnRyb2xPcHRpb25zIHwgbnVsbCxcbiAgICBhc3luY1ZhbGlkYXRvcj86IEFzeW5jVmFsaWRhdG9yRm4gfCBBc3luY1ZhbGlkYXRvckZuW10gfCBudWxsLFxuICApOiBGb3JtQ29udHJvbDxUIHwgbnVsbD47XG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBDb25zdHJ1Y3RzIGEgbmV3IGBGb3JtQ29udHJvbGAgd2l0aCB0aGUgZ2l2ZW4gc3RhdGUsIHZhbGlkYXRvcnMgYW5kIG9wdGlvbnMuIFNldHNcbiAgICogYHtub25OdWxsYWJsZTogdHJ1ZX1gIGluIHRoZSBvcHRpb25zIHRvIGdldCBhIG5vbi1udWxsYWJsZSBjb250cm9sLiBPdGhlcndpc2UsIHRoZVxuICAgKiBjb250cm9sIHdpbGwgYmUgbnVsbGFibGUuIEFjY2VwdHMgYSBzaW5nbGUgZ2VuZXJpYyBhcmd1bWVudCwgd2hpY2ggaXMgdGhlIHR5cGUgIG9mIHRoZVxuICAgKiBjb250cm9sJ3MgdmFsdWUuXG4gICAqXG4gICAqIEBwYXJhbSBmb3JtU3RhdGUgSW5pdGlhbGl6ZXMgdGhlIGNvbnRyb2wgd2l0aCBhbiBpbml0aWFsIHN0YXRlIHZhbHVlLCBvclxuICAgKiB3aXRoIGFuIG9iamVjdCB0aGF0IGNvbnRhaW5zIGJvdGggYSB2YWx1ZSBhbmQgYSBkaXNhYmxlZCBzdGF0dXMuXG4gICAqXG4gICAqIEBwYXJhbSB2YWxpZGF0b3JPck9wdHMgQSBzeW5jaHJvbm91cyB2YWxpZGF0b3IgZnVuY3Rpb24sIG9yIGFuIGFycmF5IG9mXG4gICAqIHN1Y2ggZnVuY3Rpb25zLCBvciBhIGBGb3JtQ29udHJvbE9wdGlvbnNgIG9iamVjdCB0aGF0IGNvbnRhaW5zXG4gICAqIHZhbGlkYXRpb24gZnVuY3Rpb25zIGFuZCBhIHZhbGlkYXRpb24gdHJpZ2dlci5cbiAgICpcbiAgICogQHBhcmFtIGFzeW5jVmFsaWRhdG9yIEEgc2luZ2xlIGFzeW5jIHZhbGlkYXRvciBvciBhcnJheSBvZiBhc3luYyB2YWxpZGF0b3JcbiAgICogZnVuY3Rpb25zLlxuICAgKlxuICAgKiBAdXNhZ2VOb3Rlc1xuICAgKlxuICAgKiAjIyMgSW5pdGlhbGl6ZSBhIGNvbnRyb2wgYXMgZGlzYWJsZWRcbiAgICpcbiAgICogVGhlIGZvbGxvd2luZyBleGFtcGxlIHJldHVybnMgYSBjb250cm9sIHdpdGggYW4gaW5pdGlhbCB2YWx1ZSBpbiBhIGRpc2FibGVkIHN0YXRlLlxuICAgKlxuICAgKiA8Y29kZS1leGFtcGxlIHBhdGg9XCJmb3Jtcy90cy9mb3JtQnVpbGRlci9mb3JtX2J1aWxkZXJfZXhhbXBsZS50c1wiIHJlZ2lvbj1cImRpc2FibGVkLWNvbnRyb2xcIj5cbiAgICogPC9jb2RlLWV4YW1wbGU+XG4gICAqL1xuICBjb250cm9sPFQ+KFxuICAgIGZvcm1TdGF0ZTogVCB8IEZvcm1Db250cm9sU3RhdGU8VD4sXG4gICAgdmFsaWRhdG9yT3JPcHRzPzogVmFsaWRhdG9yRm4gfCBWYWxpZGF0b3JGbltdIHwgRm9ybUNvbnRyb2xPcHRpb25zIHwgbnVsbCxcbiAgICBhc3luY1ZhbGlkYXRvcj86IEFzeW5jVmFsaWRhdG9yRm4gfCBBc3luY1ZhbGlkYXRvckZuW10gfCBudWxsLFxuICApOiBGb3JtQ29udHJvbCB7XG4gICAgbGV0IG5ld09wdGlvbnM6IEZvcm1Db250cm9sT3B0aW9ucyA9IHt9O1xuICAgIGlmICghdGhpcy51c2VOb25OdWxsYWJsZSkge1xuICAgICAgcmV0dXJuIG5ldyBGb3JtQ29udHJvbChmb3JtU3RhdGUsIHZhbGlkYXRvck9yT3B0cywgYXN5bmNWYWxpZGF0b3IpO1xuICAgIH1cbiAgICBpZiAoaXNBYnN0cmFjdENvbnRyb2xPcHRpb25zKHZhbGlkYXRvck9yT3B0cykpIHtcbiAgICAgIC8vIElmIHRoZSBzZWNvbmQgYXJndW1lbnQgaXMgb3B0aW9ucywgdGhlbiB0aGV5IGFyZSBjb3BpZWQuXG4gICAgICBuZXdPcHRpb25zID0gdmFsaWRhdG9yT3JPcHRzO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBJZiB0aGUgb3RoZXIgYXJndW1lbnRzIGFyZSB2YWxpZGF0b3JzLCB0aGV5IGFyZSBjb3BpZWQgaW50byBhbiBvcHRpb25zIG9iamVjdC5cbiAgICAgIG5ld09wdGlvbnMudmFsaWRhdG9ycyA9IHZhbGlkYXRvck9yT3B0cztcbiAgICAgIG5ld09wdGlvbnMuYXN5bmNWYWxpZGF0b3JzID0gYXN5bmNWYWxpZGF0b3I7XG4gICAgfVxuICAgIHJldHVybiBuZXcgRm9ybUNvbnRyb2w8VD4oZm9ybVN0YXRlLCB7Li4ubmV3T3B0aW9ucywgbm9uTnVsbGFibGU6IHRydWV9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb25zdHJ1Y3RzIGEgbmV3IGBGb3JtQXJyYXlgIGZyb20gdGhlIGdpdmVuIGFycmF5IG9mIGNvbmZpZ3VyYXRpb25zLFxuICAgKiB2YWxpZGF0b3JzIGFuZCBvcHRpb25zLiBBY2NlcHRzIGEgc2luZ2xlIGdlbmVyaWMgYXJndW1lbnQsIHdoaWNoIGlzIHRoZSB0eXBlIG9mIGVhY2ggY29udHJvbFxuICAgKiBpbnNpZGUgdGhlIGFycmF5LlxuICAgKlxuICAgKiBAcGFyYW0gY29udHJvbHMgQW4gYXJyYXkgb2YgY2hpbGQgY29udHJvbHMgb3IgY29udHJvbCBjb25maWdzLiBFYWNoIGNoaWxkIGNvbnRyb2wgaXMgZ2l2ZW4gYW5cbiAgICogICAgIGluZGV4IHdoZW4gaXQgaXMgcmVnaXN0ZXJlZC5cbiAgICpcbiAgICogQHBhcmFtIHZhbGlkYXRvck9yT3B0cyBBIHN5bmNocm9ub3VzIHZhbGlkYXRvciBmdW5jdGlvbiwgb3IgYW4gYXJyYXkgb2Ygc3VjaCBmdW5jdGlvbnMsIG9yIGFuXG4gICAqICAgICBgQWJzdHJhY3RDb250cm9sT3B0aW9uc2Agb2JqZWN0IHRoYXQgY29udGFpbnNcbiAgICogdmFsaWRhdGlvbiBmdW5jdGlvbnMgYW5kIGEgdmFsaWRhdGlvbiB0cmlnZ2VyLlxuICAgKlxuICAgKiBAcGFyYW0gYXN5bmNWYWxpZGF0b3IgQSBzaW5nbGUgYXN5bmMgdmFsaWRhdG9yIG9yIGFycmF5IG9mIGFzeW5jIHZhbGlkYXRvciBmdW5jdGlvbnMuXG4gICAqL1xuICBhcnJheTxUPihcbiAgICBjb250cm9sczogQXJyYXk8VD4sXG4gICAgdmFsaWRhdG9yT3JPcHRzPzogVmFsaWRhdG9yRm4gfCBWYWxpZGF0b3JGbltdIHwgQWJzdHJhY3RDb250cm9sT3B0aW9ucyB8IG51bGwsXG4gICAgYXN5bmNWYWxpZGF0b3I/OiBBc3luY1ZhbGlkYXRvckZuIHwgQXN5bmNWYWxpZGF0b3JGbltdIHwgbnVsbCxcbiAgKTogRm9ybUFycmF5PMm1RWxlbWVudDxULCBudWxsPj4ge1xuICAgIGNvbnN0IGNyZWF0ZWRDb250cm9scyA9IGNvbnRyb2xzLm1hcCgoYykgPT4gdGhpcy5fY3JlYXRlQ29udHJvbChjKSk7XG4gICAgLy8gQ2FzdCB0byBgYW55YCBiZWNhdXNlIHRoZSBpbmZlcnJlZCB0eXBlcyBhcmUgbm90IGFzIHNwZWNpZmljIGFzIEVsZW1lbnQuXG4gICAgcmV0dXJuIG5ldyBGb3JtQXJyYXkoY3JlYXRlZENvbnRyb2xzLCB2YWxpZGF0b3JPck9wdHMsIGFzeW5jVmFsaWRhdG9yKSBhcyBhbnk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9yZWR1Y2VDb250cm9sczxUPihjb250cm9sczoge1xuICAgIFtrOiBzdHJpbmddOiBUIHwgQ29udHJvbENvbmZpZzxUPiB8IEZvcm1Db250cm9sU3RhdGU8VD4gfCBBYnN0cmFjdENvbnRyb2w8VD47XG4gIH0pOiB7W2tleTogc3RyaW5nXTogQWJzdHJhY3RDb250cm9sfSB7XG4gICAgY29uc3QgY3JlYXRlZENvbnRyb2xzOiB7W2tleTogc3RyaW5nXTogQWJzdHJhY3RDb250cm9sfSA9IHt9O1xuICAgIE9iamVjdC5rZXlzKGNvbnRyb2xzKS5mb3JFYWNoKChjb250cm9sTmFtZSkgPT4ge1xuICAgICAgY3JlYXRlZENvbnRyb2xzW2NvbnRyb2xOYW1lXSA9IHRoaXMuX2NyZWF0ZUNvbnRyb2woY29udHJvbHNbY29udHJvbE5hbWVdKTtcbiAgICB9KTtcbiAgICByZXR1cm4gY3JlYXRlZENvbnRyb2xzO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfY3JlYXRlQ29udHJvbDxUPihcbiAgICBjb250cm9sczogVCB8IEZvcm1Db250cm9sU3RhdGU8VD4gfCBDb250cm9sQ29uZmlnPFQ+IHwgRm9ybUNvbnRyb2w8VD4gfCBBYnN0cmFjdENvbnRyb2w8VD4sXG4gICk6IEZvcm1Db250cm9sPFQ+IHwgRm9ybUNvbnRyb2w8VCB8IG51bGw+IHwgQWJzdHJhY3RDb250cm9sPFQ+IHtcbiAgICBpZiAoY29udHJvbHMgaW5zdGFuY2VvZiBGb3JtQ29udHJvbCkge1xuICAgICAgcmV0dXJuIGNvbnRyb2xzIGFzIEZvcm1Db250cm9sPFQ+O1xuICAgIH0gZWxzZSBpZiAoY29udHJvbHMgaW5zdGFuY2VvZiBBYnN0cmFjdENvbnRyb2wpIHtcbiAgICAgIC8vIEEgY29udHJvbDsganVzdCByZXR1cm4gaXRcbiAgICAgIHJldHVybiBjb250cm9scztcbiAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoY29udHJvbHMpKSB7XG4gICAgICAvLyBDb250cm9sQ29uZmlnIFR1cGxlXG4gICAgICBjb25zdCB2YWx1ZTogVCB8IEZvcm1Db250cm9sU3RhdGU8VD4gPSBjb250cm9sc1swXTtcbiAgICAgIGNvbnN0IHZhbGlkYXRvcjogVmFsaWRhdG9yRm4gfCBWYWxpZGF0b3JGbltdIHwgbnVsbCA9XG4gICAgICAgIGNvbnRyb2xzLmxlbmd0aCA+IDEgPyBjb250cm9sc1sxXSEgOiBudWxsO1xuICAgICAgY29uc3QgYXN5bmNWYWxpZGF0b3I6IEFzeW5jVmFsaWRhdG9yRm4gfCBBc3luY1ZhbGlkYXRvckZuW10gfCBudWxsID1cbiAgICAgICAgY29udHJvbHMubGVuZ3RoID4gMiA/IGNvbnRyb2xzWzJdISA6IG51bGw7XG4gICAgICByZXR1cm4gdGhpcy5jb250cm9sPFQ+KHZhbHVlLCB2YWxpZGF0b3IsIGFzeW5jVmFsaWRhdG9yKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVCBvciBGb3JtQ29udHJvbFN0YXRlPFQ+XG4gICAgICByZXR1cm4gdGhpcy5jb250cm9sPFQ+KGNvbnRyb2xzKTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBAZGVzY3JpcHRpb25cbiAqIGBOb25OdWxsYWJsZUZvcm1CdWlsZGVyYCBpcyBzaW1pbGFyIHRvIHtAbGluayBGb3JtQnVpbGRlcn0sIGJ1dCBhdXRvbWF0aWNhbGx5IGNvbnN0cnVjdGVkXG4gKiB7QGxpbmsgRm9ybUNvbnRyb2x9IGVsZW1lbnRzIGhhdmUgYHtub25OdWxsYWJsZTogdHJ1ZX1gIGFuZCBhcmUgbm9uLW51bGxhYmxlLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQEluamVjdGFibGUoe1xuICBwcm92aWRlZEluOiAncm9vdCcsXG4gIHVzZUZhY3Rvcnk6ICgpID0+IGluamVjdChGb3JtQnVpbGRlcikubm9uTnVsbGFibGUsXG59KVxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIE5vbk51bGxhYmxlRm9ybUJ1aWxkZXIge1xuICAvKipcbiAgICogU2ltaWxhciB0byBgRm9ybUJ1aWxkZXIjZ3JvdXBgLCBleGNlcHQgYW55IGltcGxpY2l0bHkgY29uc3RydWN0ZWQgYEZvcm1Db250cm9sYFxuICAgKiB3aWxsIGJlIG5vbi1udWxsYWJsZSAoaS5lLiBpdCB3aWxsIGhhdmUgYG5vbk51bGxhYmxlYCBzZXQgdG8gdHJ1ZSkuIE5vdGVcbiAgICogdGhhdCBhbHJlYWR5LWNvbnN0cnVjdGVkIGNvbnRyb2xzIHdpbGwgbm90IGJlIGFsdGVyZWQuXG4gICAqL1xuICBhYnN0cmFjdCBncm91cDxUIGV4dGVuZHMge30+KFxuICAgIGNvbnRyb2xzOiBULFxuICAgIG9wdGlvbnM/OiBBYnN0cmFjdENvbnRyb2xPcHRpb25zIHwgbnVsbCxcbiAgKTogRm9ybUdyb3VwPHtbSyBpbiBrZXlvZiBUXTogybVFbGVtZW50PFRbS10sIG5ldmVyPn0+O1xuXG4gIC8qKlxuICAgKiBTaW1pbGFyIHRvIGBGb3JtQnVpbGRlciNyZWNvcmRgLCBleGNlcHQgYW55IGltcGxpY2l0bHkgY29uc3RydWN0ZWQgYEZvcm1Db250cm9sYFxuICAgKiB3aWxsIGJlIG5vbi1udWxsYWJsZSAoaS5lLiBpdCB3aWxsIGhhdmUgYG5vbk51bGxhYmxlYCBzZXQgdG8gdHJ1ZSkuIE5vdGVcbiAgICogdGhhdCBhbHJlYWR5LWNvbnN0cnVjdGVkIGNvbnRyb2xzIHdpbGwgbm90IGJlIGFsdGVyZWQuXG4gICAqL1xuICBhYnN0cmFjdCByZWNvcmQ8VD4oXG4gICAgY29udHJvbHM6IHtba2V5OiBzdHJpbmddOiBUfSxcbiAgICBvcHRpb25zPzogQWJzdHJhY3RDb250cm9sT3B0aW9ucyB8IG51bGwsXG4gICk6IEZvcm1SZWNvcmQ8ybVFbGVtZW50PFQsIG5ldmVyPj47XG5cbiAgLyoqXG4gICAqIFNpbWlsYXIgdG8gYEZvcm1CdWlsZGVyI2FycmF5YCwgZXhjZXB0IGFueSBpbXBsaWNpdGx5IGNvbnN0cnVjdGVkIGBGb3JtQ29udHJvbGBcbiAgICogd2lsbCBiZSBub24tbnVsbGFibGUgKGkuZS4gaXQgd2lsbCBoYXZlIGBub25OdWxsYWJsZWAgc2V0IHRvIHRydWUpLiBOb3RlXG4gICAqIHRoYXQgYWxyZWFkeS1jb25zdHJ1Y3RlZCBjb250cm9scyB3aWxsIG5vdCBiZSBhbHRlcmVkLlxuICAgKi9cbiAgYWJzdHJhY3QgYXJyYXk8VD4oXG4gICAgY29udHJvbHM6IEFycmF5PFQ+LFxuICAgIHZhbGlkYXRvck9yT3B0cz86IFZhbGlkYXRvckZuIHwgVmFsaWRhdG9yRm5bXSB8IEFic3RyYWN0Q29udHJvbE9wdGlvbnMgfCBudWxsLFxuICAgIGFzeW5jVmFsaWRhdG9yPzogQXN5bmNWYWxpZGF0b3JGbiB8IEFzeW5jVmFsaWRhdG9yRm5bXSB8IG51bGwsXG4gICk6IEZvcm1BcnJheTzJtUVsZW1lbnQ8VCwgbmV2ZXI+PjtcblxuICAvKipcbiAgICogU2ltaWxhciB0byBgRm9ybUJ1aWxkZXIjY29udHJvbGAsIGV4Y2VwdCB0aGlzIG92ZXJyaWRkZW4gdmVyc2lvbiBvZiBgY29udHJvbGAgZm9yY2VzXG4gICAqIGBub25OdWxsYWJsZWAgdG8gYmUgYHRydWVgLCByZXN1bHRpbmcgaW4gdGhlIGNvbnRyb2wgYWx3YXlzIGJlaW5nIG5vbi1udWxsYWJsZS5cbiAgICovXG4gIGFic3RyYWN0IGNvbnRyb2w8VD4oXG4gICAgZm9ybVN0YXRlOiBUIHwgRm9ybUNvbnRyb2xTdGF0ZTxUPixcbiAgICB2YWxpZGF0b3JPck9wdHM/OiBWYWxpZGF0b3JGbiB8IFZhbGlkYXRvckZuW10gfCBBYnN0cmFjdENvbnRyb2xPcHRpb25zIHwgbnVsbCxcbiAgICBhc3luY1ZhbGlkYXRvcj86IEFzeW5jVmFsaWRhdG9yRm4gfCBBc3luY1ZhbGlkYXRvckZuW10gfCBudWxsLFxuICApOiBGb3JtQ29udHJvbDxUPjtcbn1cblxuLyoqXG4gKiBVbnR5cGVkRm9ybUJ1aWxkZXIgaXMgdGhlIHNhbWUgYXMgYEZvcm1CdWlsZGVyYCwgYnV0IGl0IHByb3ZpZGVzIHVudHlwZWQgY29udHJvbHMuXG4gKi9cbkBJbmplY3RhYmxlKHtwcm92aWRlZEluOiAncm9vdCd9KVxuZXhwb3J0IGNsYXNzIFVudHlwZWRGb3JtQnVpbGRlciBleHRlbmRzIEZvcm1CdWlsZGVyIHtcbiAgLyoqXG4gICAqIExpa2UgYEZvcm1CdWlsZGVyI2dyb3VwYCwgZXhjZXB0IHRoZSByZXN1bHRpbmcgZ3JvdXAgaXMgdW50eXBlZC5cbiAgICovXG4gIG92ZXJyaWRlIGdyb3VwKFxuICAgIGNvbnRyb2xzQ29uZmlnOiB7W2tleTogc3RyaW5nXTogYW55fSxcbiAgICBvcHRpb25zPzogQWJzdHJhY3RDb250cm9sT3B0aW9ucyB8IG51bGwsXG4gICk6IFVudHlwZWRGb3JtR3JvdXA7XG5cbiAgLyoqXG4gICAqIEBkZXByZWNhdGVkIFRoaXMgQVBJIGlzIG5vdCB0eXBlc2FmZSBhbmQgY2FuIHJlc3VsdCBpbiBpc3N1ZXMgd2l0aCBDbG9zdXJlIENvbXBpbGVyIHJlbmFtaW5nLlxuICAgKiBVc2UgdGhlIGBGb3JtQnVpbGRlciNncm91cGAgb3ZlcmxvYWQgd2l0aCBgQWJzdHJhY3RDb250cm9sT3B0aW9uc2AgaW5zdGVhZC5cbiAgICovXG4gIG92ZXJyaWRlIGdyb3VwKFxuICAgIGNvbnRyb2xzQ29uZmlnOiB7W2tleTogc3RyaW5nXTogYW55fSxcbiAgICBvcHRpb25zOiB7W2tleTogc3RyaW5nXTogYW55fSxcbiAgKTogVW50eXBlZEZvcm1Hcm91cDtcblxuICBvdmVycmlkZSBncm91cChcbiAgICBjb250cm9sc0NvbmZpZzoge1trZXk6IHN0cmluZ106IGFueX0sXG4gICAgb3B0aW9uczogQWJzdHJhY3RDb250cm9sT3B0aW9ucyB8IHtba2V5OiBzdHJpbmddOiBhbnl9IHwgbnVsbCA9IG51bGwsXG4gICk6IFVudHlwZWRGb3JtR3JvdXAge1xuICAgIHJldHVybiBzdXBlci5ncm91cChjb250cm9sc0NvbmZpZywgb3B0aW9ucyk7XG4gIH1cblxuICAvKipcbiAgICogTGlrZSBgRm9ybUJ1aWxkZXIjY29udHJvbGAsIGV4Y2VwdCB0aGUgcmVzdWx0aW5nIGNvbnRyb2wgaXMgdW50eXBlZC5cbiAgICovXG4gIG92ZXJyaWRlIGNvbnRyb2woXG4gICAgZm9ybVN0YXRlOiBhbnksXG4gICAgdmFsaWRhdG9yT3JPcHRzPzogVmFsaWRhdG9yRm4gfCBWYWxpZGF0b3JGbltdIHwgRm9ybUNvbnRyb2xPcHRpb25zIHwgbnVsbCxcbiAgICBhc3luY1ZhbGlkYXRvcj86IEFzeW5jVmFsaWRhdG9yRm4gfCBBc3luY1ZhbGlkYXRvckZuW10gfCBudWxsLFxuICApOiBVbnR5cGVkRm9ybUNvbnRyb2wge1xuICAgIHJldHVybiBzdXBlci5jb250cm9sKGZvcm1TdGF0ZSwgdmFsaWRhdG9yT3JPcHRzLCBhc3luY1ZhbGlkYXRvcik7XG4gIH1cblxuICAvKipcbiAgICogTGlrZSBgRm9ybUJ1aWxkZXIjYXJyYXlgLCBleGNlcHQgdGhlIHJlc3VsdGluZyBhcnJheSBpcyB1bnR5cGVkLlxuICAgKi9cbiAgb3ZlcnJpZGUgYXJyYXkoXG4gICAgY29udHJvbHNDb25maWc6IGFueVtdLFxuICAgIHZhbGlkYXRvck9yT3B0cz86IFZhbGlkYXRvckZuIHwgVmFsaWRhdG9yRm5bXSB8IEFic3RyYWN0Q29udHJvbE9wdGlvbnMgfCBudWxsLFxuICAgIGFzeW5jVmFsaWRhdG9yPzogQXN5bmNWYWxpZGF0b3JGbiB8IEFzeW5jVmFsaWRhdG9yRm5bXSB8IG51bGwsXG4gICk6IFVudHlwZWRGb3JtQXJyYXkge1xuICAgIHJldHVybiBzdXBlci5hcnJheShjb250cm9sc0NvbmZpZywgdmFsaWRhdG9yT3JPcHRzLCBhc3luY1ZhbGlkYXRvcik7XG4gIH1cbn1cbiJdfQ==