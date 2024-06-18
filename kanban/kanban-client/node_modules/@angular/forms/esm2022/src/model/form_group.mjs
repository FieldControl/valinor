/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { AbstractControl, assertAllValuesPresent, assertControlPresent, pickAsyncValidators, pickValidators, } from './abstract_model';
/**
 * Tracks the value and validity state of a group of `FormControl` instances.
 *
 * A `FormGroup` aggregates the values of each child `FormControl` into one object,
 * with each control name as the key.  It calculates its status by reducing the status values
 * of its children. For example, if one of the controls in a group is invalid, the entire
 * group becomes invalid.
 *
 * `FormGroup` is one of the four fundamental building blocks used to define forms in Angular,
 * along with `FormControl`, `FormArray`, and `FormRecord`.
 *
 * When instantiating a `FormGroup`, pass in a collection of child controls as the first
 * argument. The key for each child registers the name for the control.
 *
 * `FormGroup` is intended for use cases where the keys are known ahead of time.
 * If you need to dynamically add and remove controls, use {@link FormRecord} instead.
 *
 * `FormGroup` accepts an optional type parameter `TControl`, which is an object type with inner
 * control types as values.
 *
 * @usageNotes
 *
 * ### Create a form group with 2 controls
 *
 * ```
 * const form = new FormGroup({
 *   first: new FormControl('Nancy', Validators.minLength(2)),
 *   last: new FormControl('Drew'),
 * });
 *
 * console.log(form.value);   // {first: 'Nancy', last; 'Drew'}
 * console.log(form.status);  // 'VALID'
 * ```
 *
 * ### The type argument, and optional controls
 *
 * `FormGroup` accepts one generic argument, which is an object containing its inner controls.
 * This type will usually be inferred automatically, but you can always specify it explicitly if you
 * wish.
 *
 * If you have controls that are optional (i.e. they can be removed, you can use the `?` in the
 * type):
 *
 * ```
 * const form = new FormGroup<{
 *   first: FormControl<string|null>,
 *   middle?: FormControl<string|null>, // Middle name is optional.
 *   last: FormControl<string|null>,
 * }>({
 *   first: new FormControl('Nancy'),
 *   last: new FormControl('Drew'),
 * });
 * ```
 *
 * ### Create a form group with a group-level validator
 *
 * You include group-level validators as the second arg, or group-level async
 * validators as the third arg. These come in handy when you want to perform validation
 * that considers the value of more than one child control.
 *
 * ```
 * const form = new FormGroup({
 *   password: new FormControl('', Validators.minLength(2)),
 *   passwordConfirm: new FormControl('', Validators.minLength(2)),
 * }, passwordMatchValidator);
 *
 *
 * function passwordMatchValidator(g: FormGroup) {
 *    return g.get('password').value === g.get('passwordConfirm').value
 *       ? null : {'mismatch': true};
 * }
 * ```
 *
 * Like `FormControl` instances, you choose to pass in
 * validators and async validators as part of an options object.
 *
 * ```
 * const form = new FormGroup({
 *   password: new FormControl('')
 *   passwordConfirm: new FormControl('')
 * }, { validators: passwordMatchValidator, asyncValidators: otherValidator });
 * ```
 *
 * ### Set the updateOn property for all controls in a form group
 *
 * The options object is used to set a default value for each child
 * control's `updateOn` property. If you set `updateOn` to `'blur'` at the
 * group level, all child controls default to 'blur', unless the child
 * has explicitly specified a different `updateOn` value.
 *
 * ```ts
 * const c = new FormGroup({
 *   one: new FormControl()
 * }, { updateOn: 'blur' });
 * ```
 *
 * ### Using a FormGroup with optional controls
 *
 * It is possible to have optional controls in a FormGroup. An optional control can be removed later
 * using `removeControl`, and can be omitted when calling `reset`. Optional controls must be
 * declared optional in the group's type.
 *
 * ```ts
 * const c = new FormGroup<{one?: FormControl<string>}>({
 *   one: new FormControl('')
 * });
 * ```
 *
 * Notice that `c.value.one` has type `string|null|undefined`. This is because calling `c.reset({})`
 * without providing the optional key `one` will cause it to become `null`.
 *
 * @publicApi
 */
export class FormGroup extends AbstractControl {
    /**
     * Creates a new `FormGroup` instance.
     *
     * @param controls A collection of child controls. The key for each child is the name
     * under which it is registered.
     *
     * @param validatorOrOpts A synchronous validator function, or an array of
     * such functions, or an `AbstractControlOptions` object that contains validation functions
     * and a validation trigger.
     *
     * @param asyncValidator A single async validator or array of async validator functions
     *
     */
    constructor(controls, validatorOrOpts, asyncValidator) {
        super(pickValidators(validatorOrOpts), pickAsyncValidators(asyncValidator, validatorOrOpts));
        (typeof ngDevMode === 'undefined' || ngDevMode) && validateFormGroupControls(controls);
        this.controls = controls;
        this._initObservables();
        this._setUpdateStrategy(validatorOrOpts);
        this._setUpControls();
        this.updateValueAndValidity({
            onlySelf: true,
            // If `asyncValidator` is present, it will trigger control status change from `PENDING` to
            // `VALID` or `INVALID`. The status should be broadcasted via the `statusChanges` observable,
            // so we set `emitEvent` to `true` to allow that during the control creation process.
            emitEvent: !!this.asyncValidator,
        });
    }
    registerControl(name, control) {
        if (this.controls[name])
            return this.controls[name];
        this.controls[name] = control;
        control.setParent(this);
        control._registerOnCollectionChange(this._onCollectionChange);
        return control;
    }
    addControl(name, control, options = {}) {
        this.registerControl(name, control);
        this.updateValueAndValidity({ emitEvent: options.emitEvent });
        this._onCollectionChange();
    }
    /**
     * Remove a control from this group. In a strongly-typed group, required controls cannot be
     * removed.
     *
     * This method also updates the value and validity of the control.
     *
     * @param name The control name to remove from the collection
     * @param options Specifies whether this FormGroup instance should emit events after a
     *     control is removed.
     * * `emitEvent`: When true or not supplied (the default), both the `statusChanges` and
     * `valueChanges` observables emit events with the latest status and value when the control is
     * removed. When false, no events are emitted.
     */
    removeControl(name, options = {}) {
        if (this.controls[name])
            this.controls[name]._registerOnCollectionChange(() => { });
        delete this.controls[name];
        this.updateValueAndValidity({ emitEvent: options.emitEvent });
        this._onCollectionChange();
    }
    setControl(name, control, options = {}) {
        if (this.controls[name])
            this.controls[name]._registerOnCollectionChange(() => { });
        delete this.controls[name];
        if (control)
            this.registerControl(name, control);
        this.updateValueAndValidity({ emitEvent: options.emitEvent });
        this._onCollectionChange();
    }
    contains(controlName) {
        return this.controls.hasOwnProperty(controlName) && this.controls[controlName].enabled;
    }
    /**
     * Sets the value of the `FormGroup`. It accepts an object that matches
     * the structure of the group, with control names as keys.
     *
     * @usageNotes
     * ### Set the complete value for the form group
     *
     * ```
     * const form = new FormGroup({
     *   first: new FormControl(),
     *   last: new FormControl()
     * });
     *
     * console.log(form.value);   // {first: null, last: null}
     *
     * form.setValue({first: 'Nancy', last: 'Drew'});
     * console.log(form.value);   // {first: 'Nancy', last: 'Drew'}
     * ```
     *
     * @throws When strict checks fail, such as setting the value of a control
     * that doesn't exist or if you exclude a value of a control that does exist.
     *
     * @param value The new value for the control that matches the structure of the group.
     * @param options Configuration options that determine how the control propagates changes
     * and emits events after the value changes.
     * The configuration options are passed to the {@link AbstractControl#updateValueAndValidity
     * updateValueAndValidity} method.
     *
     * * `onlySelf`: When true, each change only affects this control, and not its parent. Default is
     * false.
     * * `emitEvent`: When true or not supplied (the default), both the `statusChanges` and
     * `valueChanges`
     * observables emit events with the latest status and value when the control value is updated.
     * When false, no events are emitted.
     */
    setValue(value, options = {}) {
        assertAllValuesPresent(this, true, value);
        Object.keys(value).forEach((name) => {
            assertControlPresent(this, true, name);
            this.controls[name].setValue(value[name], {
                onlySelf: true,
                emitEvent: options.emitEvent,
            });
        });
        this.updateValueAndValidity(options);
    }
    /**
     * Patches the value of the `FormGroup`. It accepts an object with control
     * names as keys, and does its best to match the values to the correct controls
     * in the group.
     *
     * It accepts both super-sets and sub-sets of the group without throwing an error.
     *
     * @usageNotes
     * ### Patch the value for a form group
     *
     * ```
     * const form = new FormGroup({
     *    first: new FormControl(),
     *    last: new FormControl()
     * });
     * console.log(form.value);   // {first: null, last: null}
     *
     * form.patchValue({first: 'Nancy'});
     * console.log(form.value);   // {first: 'Nancy', last: null}
     * ```
     *
     * @param value The object that matches the structure of the group.
     * @param options Configuration options that determine how the control propagates changes and
     * emits events after the value is patched.
     * * `onlySelf`: When true, each change only affects this control and not its parent. Default is
     * true.
     * * `emitEvent`: When true or not supplied (the default), both the `statusChanges` and
     * `valueChanges` observables emit events with the latest status and value when the control value
     * is updated. When false, no events are emitted. The configuration options are passed to
     * the {@link AbstractControl#updateValueAndValidity updateValueAndValidity} method.
     */
    patchValue(value, options = {}) {
        // Even though the `value` argument type doesn't allow `null` and `undefined` values, the
        // `patchValue` can be called recursively and inner data structures might have these values, so
        // we just ignore such cases when a field containing FormGroup instance receives `null` or
        // `undefined` as a value.
        if (value == null /* both `null` and `undefined` */)
            return;
        Object.keys(value).forEach((name) => {
            // The compiler cannot see through the uninstantiated conditional type of `this.controls`, so
            // `as any` is required.
            const control = this.controls[name];
            if (control) {
                control.patchValue(
                /* Guaranteed to be present, due to the outer forEach. */ value[name], { onlySelf: true, emitEvent: options.emitEvent });
            }
        });
        this.updateValueAndValidity(options);
    }
    /**
     * Resets the `FormGroup`, marks all descendants `pristine` and `untouched` and sets
     * the value of all descendants to their default values, or null if no defaults were provided.
     *
     * You reset to a specific form state by passing in a map of states
     * that matches the structure of your form, with control names as keys. The state
     * is a standalone value or a form state object with both a value and a disabled
     * status.
     *
     * @param value Resets the control with an initial value,
     * or an object that defines the initial value and disabled state.
     *
     * @param options Configuration options that determine how the control propagates changes
     * and emits events when the group is reset.
     * * `onlySelf`: When true, each change only affects this control, and not its parent. Default is
     * false.
     * * `emitEvent`: When true or not supplied (the default), both the `statusChanges` and
     * `valueChanges`
     * observables emit events with the latest status and value when the control is reset.
     * When false, no events are emitted.
     * The configuration options are passed to the {@link AbstractControl#updateValueAndValidity
     * updateValueAndValidity} method.
     *
     * @usageNotes
     *
     * ### Reset the form group values
     *
     * ```ts
     * const form = new FormGroup({
     *   first: new FormControl('first name'),
     *   last: new FormControl('last name')
     * });
     *
     * console.log(form.value);  // {first: 'first name', last: 'last name'}
     *
     * form.reset({ first: 'name', last: 'last name' });
     *
     * console.log(form.value);  // {first: 'name', last: 'last name'}
     * ```
     *
     * ### Reset the form group values and disabled status
     *
     * ```
     * const form = new FormGroup({
     *   first: new FormControl('first name'),
     *   last: new FormControl('last name')
     * });
     *
     * form.reset({
     *   first: {value: 'name', disabled: true},
     *   last: 'last'
     * });
     *
     * console.log(form.value);  // {last: 'last'}
     * console.log(form.get('first').status);  // 'DISABLED'
     * ```
     */
    reset(value = {}, options = {}) {
        this._forEachChild((control, name) => {
            control.reset(value ? value[name] : null, {
                onlySelf: true,
                emitEvent: options.emitEvent,
            });
        });
        this._updatePristine(options, this);
        this._updateTouched(options, this);
        this.updateValueAndValidity(options);
    }
    /**
     * The aggregate value of the `FormGroup`, including any disabled controls.
     *
     * Retrieves all values regardless of disabled status.
     */
    getRawValue() {
        return this._reduceChildren({}, (acc, control, name) => {
            acc[name] = control.getRawValue();
            return acc;
        });
    }
    /** @internal */
    _syncPendingControls() {
        let subtreeUpdated = this._reduceChildren(false, (updated, child) => {
            return child._syncPendingControls() ? true : updated;
        });
        if (subtreeUpdated)
            this.updateValueAndValidity({ onlySelf: true });
        return subtreeUpdated;
    }
    /** @internal */
    _forEachChild(cb) {
        Object.keys(this.controls).forEach((key) => {
            // The list of controls can change (for ex. controls might be removed) while the loop
            // is running (as a result of invoking Forms API in `valueChanges` subscription), so we
            // have to null check before invoking the callback.
            const control = this.controls[key];
            control && cb(control, key);
        });
    }
    /** @internal */
    _setUpControls() {
        this._forEachChild((control) => {
            control.setParent(this);
            control._registerOnCollectionChange(this._onCollectionChange);
        });
    }
    /** @internal */
    _updateValue() {
        this.value = this._reduceValue();
    }
    /** @internal */
    _anyControls(condition) {
        for (const [controlName, control] of Object.entries(this.controls)) {
            if (this.contains(controlName) && condition(control)) {
                return true;
            }
        }
        return false;
    }
    /** @internal */
    _reduceValue() {
        let acc = {};
        return this._reduceChildren(acc, (acc, control, name) => {
            if (control.enabled || this.disabled) {
                acc[name] = control.value;
            }
            return acc;
        });
    }
    /** @internal */
    _reduceChildren(initValue, fn) {
        let res = initValue;
        this._forEachChild((control, name) => {
            res = fn(res, control, name);
        });
        return res;
    }
    /** @internal */
    _allControlsDisabled() {
        for (const controlName of Object.keys(this.controls)) {
            if (this.controls[controlName].enabled) {
                return false;
            }
        }
        return Object.keys(this.controls).length > 0 || this.disabled;
    }
    /** @internal */
    _find(name) {
        return this.controls.hasOwnProperty(name)
            ? this.controls[name]
            : null;
    }
}
/**
 * Will validate that none of the controls has a key with a dot
 * Throws other wise
 */
function validateFormGroupControls(controls) {
    const invalidKeys = Object.keys(controls).filter((key) => key.includes('.'));
    if (invalidKeys.length > 0) {
        // TODO: make this an error once there are no more uses in G3
        console.warn(`FormGroup keys cannot include \`.\`, please replace the keys for: ${invalidKeys.join(',')}.`);
    }
}
export const UntypedFormGroup = FormGroup;
/**
 * @description
 * Asserts that the given control is an instance of `FormGroup`
 *
 * @publicApi
 */
export const isFormGroup = (control) => control instanceof FormGroup;
/**
 * Tracks the value and validity state of a collection of `FormControl` instances, each of which has
 * the same value type.
 *
 * `FormRecord` is very similar to {@link FormGroup}, except it can be used with a dynamic keys,
 * with controls added and removed as needed.
 *
 * `FormRecord` accepts one generic argument, which describes the type of the controls it contains.
 *
 * @usageNotes
 *
 * ```
 * let numbers = new FormRecord({bill: new FormControl('415-123-456')});
 * numbers.addControl('bob', new FormControl('415-234-567'));
 * numbers.removeControl('bill');
 * ```
 *
 * @publicApi
 */
export class FormRecord extends FormGroup {
}
/**
 * @description
 * Asserts that the given control is an instance of `FormRecord`
 *
 * @publicApi
 */
export const isFormRecord = (control) => control instanceof FormRecord;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybV9ncm91cC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2Zvcm1zL3NyYy9tb2RlbC9mb3JtX2dyb3VwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQU1ILE9BQU8sRUFDTCxlQUFlLEVBRWYsc0JBQXNCLEVBQ3RCLG9CQUFvQixFQUNwQixtQkFBbUIsRUFDbkIsY0FBYyxHQUlmLE1BQU0sa0JBQWtCLENBQUM7QUF1QzFCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBZ0hHO0FBQ0gsTUFBTSxPQUFPLFNBRVgsU0FBUSxlQUdUO0lBQ0M7Ozs7Ozs7Ozs7OztPQVlHO0lBQ0gsWUFDRSxRQUFrQixFQUNsQixlQUE2RSxFQUM3RSxjQUE2RDtRQUU3RCxLQUFLLENBQUMsY0FBYyxDQUFDLGVBQWUsQ0FBQyxFQUFFLG1CQUFtQixDQUFDLGNBQWMsRUFBRSxlQUFlLENBQUMsQ0FBQyxDQUFDO1FBQzdGLENBQUMsT0FBTyxTQUFTLEtBQUssV0FBVyxJQUFJLFNBQVMsQ0FBQyxJQUFJLHlCQUF5QixDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3ZGLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBQ3hCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUN6QyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDdEIsSUFBSSxDQUFDLHNCQUFzQixDQUFDO1lBQzFCLFFBQVEsRUFBRSxJQUFJO1lBQ2QsMEZBQTBGO1lBQzFGLDZGQUE2RjtZQUM3RixxRkFBcUY7WUFDckYsU0FBUyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FB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U0FBUyx5QkFBeUIsQ0FBVyxRQUU1QztJQUNDLE1BQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDN0UsSUFBSSxXQUFXLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO1FBQzNCLDZEQUE2RDtRQUM3RCxPQUFPLENBQUMsSUFBSSxDQUNWLHFFQUFxRSxXQUFXLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQzlGLENBQUM7SUFDSixDQUFDO0FBQ0gsQ0FBQztBQXFCRCxNQUFNLENBQUMsTUFBTSxnQkFBZ0IsR0FBeUIsU0FBUyxDQUFDO0FBRWhFOzs7OztHQUtHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sV0FBVyxHQUFHLENBQUMsT0FBZ0IsRUFBd0IsRUFBRSxDQUFDLE9BQU8sWUFBWSxTQUFTLENBQUM7QUFFcEc7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQWtCRztBQUNILE1BQU0sT0FBTyxVQUErRCxTQUFRLFNBRWxGO0NBQUc7QUF5Rkw7Ozs7O0dBS0c7QUFDSCxNQUFNLENBQUMsTUFBTSxZQUFZLEdBQUcsQ0FBQyxPQUFnQixFQUF5QixFQUFFLENBQ3RFLE9BQU8sWUFBWSxVQUFVLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHvJtVdyaXRhYmxlIGFzIFdyaXRhYmxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtBc3luY1ZhbGlkYXRvckZuLCBWYWxpZGF0b3JGbn0gZnJvbSAnLi4vZGlyZWN0aXZlcy92YWxpZGF0b3JzJztcblxuaW1wb3J0IHtcbiAgQWJzdHJhY3RDb250cm9sLFxuICBBYnN0cmFjdENvbnRyb2xPcHRpb25zLFxuICBhc3NlcnRBbGxWYWx1ZXNQcmVzZW50LFxuICBhc3NlcnRDb250cm9sUHJlc2VudCxcbiAgcGlja0FzeW5jVmFsaWRhdG9ycyxcbiAgcGlja1ZhbGlkYXRvcnMsXG4gIMm1UmF3VmFsdWUsXG4gIMm1VHlwZWRPclVudHlwZWQsXG4gIMm1VmFsdWUsXG59IGZyb20gJy4vYWJzdHJhY3RfbW9kZWwnO1xuXG4vKipcbiAqIEZvcm1Hcm91cFZhbHVlIGV4dHJhY3RzIHRoZSB0eXBlIG9mIGAudmFsdWVgIGZyb20gYSBGb3JtR3JvdXAncyBpbm5lciBvYmplY3QgdHlwZS4gVGhlIHVudHlwZWRcbiAqIGNhc2UgZmFsbHMgYmFjayB0byB7W2tleTogc3RyaW5nXTogYW55fS5cbiAqXG4gKiBBbmd1bGFyIHVzZXMgdGhpcyB0eXBlIGludGVybmFsbHkgdG8gc3VwcG9ydCBUeXBlZCBGb3JtczsgZG8gbm90IHVzZSBpdCBkaXJlY3RseS5cbiAqXG4gKiBGb3IgaW50ZXJuYWwgdXNlIG9ubHkuXG4gKi9cbmV4cG9ydCB0eXBlIMm1Rm9ybUdyb3VwVmFsdWU8VCBleHRlbmRzIHtbSyBpbiBrZXlvZiBUXT86IEFic3RyYWN0Q29udHJvbDxhbnk+fT4gPSDJtVR5cGVkT3JVbnR5cGVkPFxuICBULFxuICBQYXJ0aWFsPHtbSyBpbiBrZXlvZiBUXTogybVWYWx1ZTxUW0tdPn0+LFxuICB7W2tleTogc3RyaW5nXTogYW55fVxuPjtcblxuLyoqXG4gKiBGb3JtR3JvdXBSYXdWYWx1ZSBleHRyYWN0cyB0aGUgdHlwZSBvZiBgLmdldFJhd1ZhbHVlKClgIGZyb20gYSBGb3JtR3JvdXAncyBpbm5lciBvYmplY3QgdHlwZS4gVGhlXG4gKiB1bnR5cGVkIGNhc2UgZmFsbHMgYmFjayB0byB7W2tleTogc3RyaW5nXTogYW55fS5cbiAqXG4gKiBBbmd1bGFyIHVzZXMgdGhpcyB0eXBlIGludGVybmFsbHkgdG8gc3VwcG9ydCBUeXBlZCBGb3JtczsgZG8gbm90IHVzZSBpdCBkaXJlY3RseS5cbiAqXG4gKiBGb3IgaW50ZXJuYWwgdXNlIG9ubHkuXG4gKi9cbmV4cG9ydCB0eXBlIMm1Rm9ybUdyb3VwUmF3VmFsdWU8VCBleHRlbmRzIHtbSyBpbiBrZXlvZiBUXT86IEFic3RyYWN0Q29udHJvbDxhbnk+fT4gPSDJtVR5cGVkT3JVbnR5cGVkPFxuICBULFxuICB7W0sgaW4ga2V5b2YgVF06IMm1UmF3VmFsdWU8VFtLXT59LFxuICB7W2tleTogc3RyaW5nXTogYW55fVxuPjtcblxuLyoqXG4gKiBPcHRpb25hbEtleXMgcmV0dXJucyB0aGUgdW5pb24gb2YgYWxsIG9wdGlvbmFsIGtleXMgaW4gdGhlIG9iamVjdC5cbiAqXG4gKiBBbmd1bGFyIHVzZXMgdGhpcyB0eXBlIGludGVybmFsbHkgdG8gc3VwcG9ydCBUeXBlZCBGb3JtczsgZG8gbm90IHVzZSBpdCBkaXJlY3RseS5cbiAqL1xuZXhwb3J0IHR5cGUgybVPcHRpb25hbEtleXM8VD4gPSB7XG4gIFtLIGluIGtleW9mIFRdLT86IHVuZGVmaW5lZCBleHRlbmRzIFRbS10gPyBLIDogbmV2ZXI7XG59W2tleW9mIFRdO1xuXG4vKipcbiAqIFRyYWNrcyB0aGUgdmFsdWUgYW5kIHZhbGlkaXR5IHN0YXRlIG9mIGEgZ3JvdXAgb2YgYEZvcm1Db250cm9sYCBpbnN0YW5jZXMuXG4gKlxuICogQSBgRm9ybUdyb3VwYCBhZ2dyZWdhdGVzIHRoZSB2YWx1ZXMgb2YgZWFjaCBjaGlsZCBgRm9ybUNvbnRyb2xgIGludG8gb25lIG9iamVjdCxcbiAqIHdpdGggZWFjaCBjb250cm9sIG5hbWUgYXMgdGhlIGtleS4gIEl0IGNhbGN1bGF0ZXMgaXRzIHN0YXR1cyBieSByZWR1Y2luZyB0aGUgc3RhdHVzIHZhbHVlc1xuICogb2YgaXRzIGNoaWxkcmVuLiBGb3IgZXhhbXBsZSwgaWYgb25lIG9mIHRoZSBjb250cm9scyBpbiBhIGdyb3VwIGlzIGludmFsaWQsIHRoZSBlbnRpcmVcbiAqIGdyb3VwIGJlY29tZXMgaW52YWxpZC5cbiAqXG4gKiBgRm9ybUdyb3VwYCBpcyBvbmUgb2YgdGhlIGZvdXIgZnVuZGFtZW50YWwgYnVpbGRpbmcgYmxvY2tzIHVzZWQgdG8gZGVmaW5lIGZvcm1zIGluIEFuZ3VsYXIsXG4gKiBhbG9uZyB3aXRoIGBGb3JtQ29udHJvbGAsIGBGb3JtQXJyYXlgLCBhbmQgYEZvcm1SZWNvcmRgLlxuICpcbiAqIFdoZW4gaW5zdGFudGlhdGluZyBhIGBGb3JtR3JvdXBgLCBwYXNzIGluIGEgY29sbGVjdGlvbiBvZiBjaGlsZCBjb250cm9scyBhcyB0aGUgZmlyc3RcbiAqIGFyZ3VtZW50LiBUaGUga2V5IGZvciBlYWNoIGNoaWxkIHJlZ2lzdGVycyB0aGUgbmFtZSBmb3IgdGhlIGNvbnRyb2wuXG4gKlxuICogYEZvcm1Hcm91cGAgaXMgaW50ZW5kZWQgZm9yIHVzZSBjYXNlcyB3aGVyZSB0aGUga2V5cyBhcmUga25vd24gYWhlYWQgb2YgdGltZS5cbiAqIElmIHlvdSBuZWVkIHRvIGR5bmFtaWNhbGx5IGFkZCBhbmQgcmVtb3ZlIGNvbnRyb2xzLCB1c2Uge0BsaW5rIEZvcm1SZWNvcmR9IGluc3RlYWQuXG4gKlxuICogYEZvcm1Hcm91cGAgYWNjZXB0cyBhbiBvcHRpb25hbCB0eXBlIHBhcmFtZXRlciBgVENvbnRyb2xgLCB3aGljaCBpcyBhbiBvYmplY3QgdHlwZSB3aXRoIGlubmVyXG4gKiBjb250cm9sIHR5cGVzIGFzIHZhbHVlcy5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICpcbiAqICMjIyBDcmVhdGUgYSBmb3JtIGdyb3VwIHdpdGggMiBjb250cm9sc1xuICpcbiAqIGBgYFxuICogY29uc3QgZm9ybSA9IG5ldyBGb3JtR3JvdXAoe1xuICogICBmaXJzdDogbmV3IEZvcm1Db250cm9sKCdOYW5jeScsIFZhbGlkYXRvcnMubWluTGVuZ3RoKDIpKSxcbiAqICAgbGFzdDogbmV3IEZvcm1Db250cm9sKCdEcmV3JyksXG4gKiB9KTtcbiAqXG4gKiBjb25zb2xlLmxvZyhmb3JtLnZhbHVlKTsgICAvLyB7Zmlyc3Q6ICdOYW5jeScsIGxhc3Q7ICdEcmV3J31cbiAqIGNvbnNvbGUubG9nKGZvcm0uc3RhdHVzKTsgIC8vICdWQUxJRCdcbiAqIGBgYFxuICpcbiAqICMjIyBUaGUgdHlwZSBhcmd1bWVudCwgYW5kIG9wdGlvbmFsIGNvbnRyb2xzXG4gKlxuICogYEZvcm1Hcm91cGAgYWNjZXB0cyBvbmUgZ2VuZXJpYyBhcmd1bWVudCwgd2hpY2ggaXMgYW4gb2JqZWN0IGNvbnRhaW5pbmcgaXRzIGlubmVyIGNvbnRyb2xzLlxuICogVGhpcyB0eXBlIHdpbGwgdXN1YWxseSBiZSBpbmZlcnJlZCBhdXRvbWF0aWNhbGx5LCBidXQgeW91IGNhbiBhbHdheXMgc3BlY2lmeSBpdCBleHBsaWNpdGx5IGlmIHlvdVxuICogd2lzaC5cbiAqXG4gKiBJZiB5b3UgaGF2ZSBjb250cm9scyB0aGF0IGFyZSBvcHRpb25hbCAoaS5lLiB0aGV5IGNhbiBiZSByZW1vdmVkLCB5b3UgY2FuIHVzZSB0aGUgYD9gIGluIHRoZVxuICogdHlwZSk6XG4gKlxuICogYGBgXG4gKiBjb25zdCBmb3JtID0gbmV3IEZvcm1Hcm91cDx7XG4gKiAgIGZpcnN0OiBGb3JtQ29udHJvbDxzdHJpbmd8bnVsbD4sXG4gKiAgIG1pZGRsZT86IEZvcm1Db250cm9sPHN0cmluZ3xudWxsPiwgLy8gTWlkZGxlIG5hbWUgaXMgb3B0aW9uYWwuXG4gKiAgIGxhc3Q6IEZvcm1Db250cm9sPHN0cmluZ3xudWxsPixcbiAqIH0+KHtcbiAqICAgZmlyc3Q6IG5ldyBGb3JtQ29udHJvbCgnTmFuY3knKSxcbiAqICAgbGFzdDogbmV3IEZvcm1Db250cm9sKCdEcmV3JyksXG4gKiB9KTtcbiAqIGBgYFxuICpcbiAqICMjIyBDcmVhdGUgYSBmb3JtIGdyb3VwIHdpdGggYSBncm91cC1sZXZlbCB2YWxpZGF0b3JcbiAqXG4gKiBZb3UgaW5jbHVkZSBncm91cC1sZXZlbCB2YWxpZGF0b3JzIGFzIHRoZSBzZWNvbmQgYXJnLCBvciBncm91cC1sZXZlbCBhc3luY1xuICogdmFsaWRhdG9ycyBhcyB0aGUgdGhpcmQgYXJnLiBUaGVzZSBjb21lIGluIGhhbmR5IHdoZW4geW91IHdhbnQgdG8gcGVyZm9ybSB2YWxpZGF0aW9uXG4gKiB0aGF0IGNvbnNpZGVycyB0aGUgdmFsdWUgb2YgbW9yZSB0aGFuIG9uZSBjaGlsZCBjb250cm9sLlxuICpcbiAqIGBgYFxuICogY29uc3QgZm9ybSA9IG5ldyBGb3JtR3JvdXAoe1xuICogICBwYXNzd29yZDogbmV3IEZvcm1Db250cm9sKCcnLCBWYWxpZGF0b3JzLm1pbkxlbmd0aCgyKSksXG4gKiAgIHBhc3N3b3JkQ29uZmlybTogbmV3IEZvcm1Db250cm9sKCcnLCBWYWxpZGF0b3JzLm1pbkxlbmd0aCgyKSksXG4gKiB9LCBwYXNzd29yZE1hdGNoVmFsaWRhdG9yKTtcbiAqXG4gKlxuICogZnVuY3Rpb24gcGFzc3dvcmRNYXRjaFZhbGlkYXRvcihnOiBGb3JtR3JvdXApIHtcbiAqICAgIHJldHVybiBnLmdldCgncGFzc3dvcmQnKS52YWx1ZSA9PT0gZy5nZXQoJ3Bhc3N3b3JkQ29uZmlybScpLnZhbHVlXG4gKiAgICAgICA/IG51bGwgOiB7J21pc21hdGNoJzogdHJ1ZX07XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBMaWtlIGBGb3JtQ29udHJvbGAgaW5zdGFuY2VzLCB5b3UgY2hvb3NlIHRvIHBhc3MgaW5cbiAqIHZhbGlkYXRvcnMgYW5kIGFzeW5jIHZhbGlkYXRvcnMgYXMgcGFydCBvZiBhbiBvcHRpb25zIG9iamVjdC5cbiAqXG4gKiBgYGBcbiAqIGNvbnN0IGZvcm0gPSBuZXcgRm9ybUdyb3VwKHtcbiAqICAgcGFzc3dvcmQ6IG5ldyBGb3JtQ29udHJvbCgnJylcbiAqICAgcGFzc3dvcmRDb25maXJtOiBuZXcgRm9ybUNvbnRyb2woJycpXG4gKiB9LCB7IHZhbGlkYXRvcnM6IHBhc3N3b3JkTWF0Y2hWYWxpZGF0b3IsIGFzeW5jVmFsaWRhdG9yczogb3RoZXJWYWxpZGF0b3IgfSk7XG4gKiBgYGBcbiAqXG4gKiAjIyMgU2V0IHRoZSB1cGRhdGVPbiBwcm9wZXJ0eSBmb3IgYWxsIGNvbnRyb2xzIGluIGEgZm9ybSBncm91cFxuICpcbiAqIFRoZSBvcHRpb25zIG9iamVjdCBpcyB1c2VkIHRvIHNldCBhIGRlZmF1bHQgdmFsdWUgZm9yIGVhY2ggY2hpbGRcbiAqIGNvbnRyb2wncyBgdXBkYXRlT25gIHByb3BlcnR5LiBJZiB5b3Ugc2V0IGB1cGRhdGVPbmAgdG8gYCdibHVyJ2AgYXQgdGhlXG4gKiBncm91cCBsZXZlbCwgYWxsIGNoaWxkIGNvbnRyb2xzIGRlZmF1bHQgdG8gJ2JsdXInLCB1bmxlc3MgdGhlIGNoaWxkXG4gKiBoYXMgZXhwbGljaXRseSBzcGVjaWZpZWQgYSBkaWZmZXJlbnQgYHVwZGF0ZU9uYCB2YWx1ZS5cbiAqXG4gKiBgYGB0c1xuICogY29uc3QgYyA9IG5ldyBGb3JtR3JvdXAoe1xuICogICBvbmU6IG5ldyBGb3JtQ29udHJvbCgpXG4gKiB9LCB7IHVwZGF0ZU9uOiAnYmx1cicgfSk7XG4gKiBgYGBcbiAqXG4gKiAjIyMgVXNpbmcgYSBGb3JtR3JvdXAgd2l0aCBvcHRpb25hbCBjb250cm9sc1xuICpcbiAqIEl0IGlzIHBvc3NpYmxlIHRvIGhhdmUgb3B0aW9uYWwgY29udHJvbHMgaW4gYSBGb3JtR3JvdXAuIEFuIG9wdGlvbmFsIGNvbnRyb2wgY2FuIGJlIHJlbW92ZWQgbGF0ZXJcbiAqIHVzaW5nIGByZW1vdmVDb250cm9sYCwgYW5kIGNhbiBiZSBvbWl0dGVkIHdoZW4gY2FsbGluZyBgcmVzZXRgLiBPcHRpb25hbCBjb250cm9scyBtdXN0IGJlXG4gKiBkZWNsYXJlZCBvcHRpb25hbCBpbiB0aGUgZ3JvdXAncyB0eXBlLlxuICpcbiAqIGBgYHRzXG4gKiBjb25zdCBjID0gbmV3IEZvcm1Hcm91cDx7b25lPzogRm9ybUNvbnRyb2w8c3RyaW5nPn0+KHtcbiAqICAgb25lOiBuZXcgRm9ybUNvbnRyb2woJycpXG4gKiB9KTtcbiAqIGBgYFxuICpcbiAqIE5vdGljZSB0aGF0IGBjLnZhbHVlLm9uZWAgaGFzIHR5cGUgYHN0cmluZ3xudWxsfHVuZGVmaW5lZGAuIFRoaXMgaXMgYmVjYXVzZSBjYWxsaW5nIGBjLnJlc2V0KHt9KWBcbiAqIHdpdGhvdXQgcHJvdmlkaW5nIHRoZSBvcHRpb25hbCBrZXkgYG9uZWAgd2lsbCBjYXVzZSBpdCB0byBiZWNvbWUgYG51bGxgLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNsYXNzIEZvcm1Hcm91cDxcbiAgVENvbnRyb2wgZXh0ZW5kcyB7W0sgaW4ga2V5b2YgVENvbnRyb2xdOiBBYnN0cmFjdENvbnRyb2w8YW55Pn0gPSBhbnksXG4+IGV4dGVuZHMgQWJzdHJhY3RDb250cm9sPFxuICDJtVR5cGVkT3JVbnR5cGVkPFRDb250cm9sLCDJtUZvcm1Hcm91cFZhbHVlPFRDb250cm9sPiwgYW55PixcbiAgybVUeXBlZE9yVW50eXBlZDxUQ29udHJvbCwgybVGb3JtR3JvdXBSYXdWYWx1ZTxUQ29udHJvbD4sIGFueT5cbj4ge1xuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBgRm9ybUdyb3VwYCBpbnN0YW5jZS5cbiAgICpcbiAgICogQHBhcmFtIGNvbnRyb2xzIEEgY29sbGVjdGlvbiBvZiBjaGlsZCBjb250cm9scy4gVGhlIGtleSBmb3IgZWFjaCBjaGlsZCBpcyB0aGUgbmFtZVxuICAgKiB1bmRlciB3aGljaCBpdCBpcyByZWdpc3RlcmVkLlxuICAgKlxuICAgKiBAcGFyYW0gdmFsaWRhdG9yT3JPcHRzIEEgc3luY2hyb25vdXMgdmFsaWRhdG9yIGZ1bmN0aW9uLCBvciBhbiBhcnJheSBvZlxuICAgKiBzdWNoIGZ1bmN0aW9ucywgb3IgYW4gYEFic3RyYWN0Q29udHJvbE9wdGlvbnNgIG9iamVjdCB0aGF0IGNvbnRhaW5zIHZhbGlkYXRpb24gZnVuY3Rpb25zXG4gICAqIGFuZCBhIHZhbGlkYXRpb24gdHJpZ2dlci5cbiAgICpcbiAgICogQHBhcmFtIGFzeW5jVmFsaWRhdG9yIEEgc2luZ2xlIGFzeW5jIHZhbGlkYXRvciBvciBhcnJheSBvZiBhc3luYyB2YWxpZGF0b3IgZnVuY3Rpb25zXG4gICAqXG4gICAqL1xuICBjb25zdHJ1Y3RvcihcbiAgICBjb250cm9sczogVENvbnRyb2wsXG4gICAgdmFsaWRhdG9yT3JPcHRzPzogVmFsaWRhdG9yRm4gfCBWYWxpZGF0b3JGbltdIHwgQWJzdHJhY3RDb250cm9sT3B0aW9ucyB8IG51bGwsXG4gICAgYXN5bmNWYWxpZGF0b3I/OiBBc3luY1ZhbGlkYXRvckZuIHwgQXN5bmNWYWxpZGF0b3JGbltdIHwgbnVsbCxcbiAgKSB7XG4gICAgc3VwZXIocGlja1ZhbGlkYXRvcnModmFsaWRhdG9yT3JPcHRzKSwgcGlja0FzeW5jVmFsaWRhdG9ycyhhc3luY1ZhbGlkYXRvciwgdmFsaWRhdG9yT3JPcHRzKSk7XG4gICAgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkgJiYgdmFsaWRhdGVGb3JtR3JvdXBDb250cm9scyhjb250cm9scyk7XG4gICAgdGhpcy5jb250cm9scyA9IGNvbnRyb2xzO1xuICAgIHRoaXMuX2luaXRPYnNlcnZhYmxlcygpO1xuICAgIHRoaXMuX3NldFVwZGF0ZVN0cmF0ZWd5KHZhbGlkYXRvck9yT3B0cyk7XG4gICAgdGhpcy5fc2V0VXBDb250cm9scygpO1xuICAgIHRoaXMudXBkYXRlVmFsdWVBbmRWYWxpZGl0eSh7XG4gICAgICBvbmx5U2VsZjogdHJ1ZSxcbiAgICAgIC8vIElmIGBhc3luY1ZhbGlkYXRvcmAgaXMgcHJlc2VudCwgaXQgd2lsbCB0cmlnZ2VyIGNvbnRyb2wgc3RhdHVzIGNoYW5nZSBmcm9tIGBQRU5ESU5HYCB0b1xuICAgICAgLy8gYFZBTElEYCBvciBgSU5WQUxJRGAuIFRoZSBzdGF0dXMgc2hvdWxkIGJlIGJyb2FkY2FzdGVkIHZpYSB0aGUgYHN0YXR1c0NoYW5nZXNgIG9ic2VydmFibGUsXG4gICAgICAvLyBzbyB3ZSBzZXQgYGVtaXRFdmVudGAgdG8gYHRydWVgIHRvIGFsbG93IHRoYXQgZHVyaW5nIHRoZSBjb250cm9sIGNyZWF0aW9uIHByb2Nlc3MuXG4gICAgICBlbWl0RXZlbnQ6ICEhdGhpcy5hc3luY1ZhbGlkYXRvcixcbiAgICB9KTtcbiAgfVxuXG4gIHB1YmxpYyBjb250cm9sczogybVUeXBlZE9yVW50eXBlZDxUQ29udHJvbCwgVENvbnRyb2wsIHtba2V5OiBzdHJpbmddOiBBYnN0cmFjdENvbnRyb2w8YW55Pn0+O1xuXG4gIC8qKlxuICAgKiBSZWdpc3RlcnMgYSBjb250cm9sIHdpdGggdGhlIGdyb3VwJ3MgbGlzdCBvZiBjb250cm9scy4gSW4gYSBzdHJvbmdseS10eXBlZCBncm91cCwgdGhlIGNvbnRyb2xcbiAgICogbXVzdCBiZSBpbiB0aGUgZ3JvdXAncyB0eXBlIChwb3NzaWJseSBhcyBhbiBvcHRpb25hbCBrZXkpLlxuICAgKlxuICAgKiBUaGlzIG1ldGhvZCBkb2VzIG5vdCB1cGRhdGUgdGhlIHZhbHVlIG9yIHZhbGlkaXR5IG9mIHRoZSBjb250cm9sLlxuICAgKiBVc2Uge0BsaW5rIEZvcm1Hcm91cCNhZGRDb250cm9sIGFkZENvbnRyb2x9IGluc3RlYWQuXG4gICAqXG4gICAqIEBwYXJhbSBuYW1lIFRoZSBjb250cm9sIG5hbWUgdG8gcmVnaXN0ZXIgaW4gdGhlIGNvbGxlY3Rpb25cbiAgICogQHBhcmFtIGNvbnRyb2wgUHJvdmlkZXMgdGhlIGNvbnRyb2wgZm9yIHRoZSBnaXZlbiBuYW1lXG4gICAqL1xuICByZWdpc3RlckNvbnRyb2w8SyBleHRlbmRzIHN0cmluZyAmIGtleW9mIFRDb250cm9sPihuYW1lOiBLLCBjb250cm9sOiBUQ29udHJvbFtLXSk6IFRDb250cm9sW0tdO1xuICByZWdpc3RlckNvbnRyb2woXG4gICAgdGhpczogRm9ybUdyb3VwPHtba2V5OiBzdHJpbmddOiBBYnN0cmFjdENvbnRyb2w8YW55Pn0+LFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICBjb250cm9sOiBBYnN0cmFjdENvbnRyb2w8YW55PixcbiAgKTogQWJzdHJhY3RDb250cm9sPGFueT47XG5cbiAgcmVnaXN0ZXJDb250cm9sPEsgZXh0ZW5kcyBzdHJpbmcgJiBrZXlvZiBUQ29udHJvbD4obmFtZTogSywgY29udHJvbDogVENvbnRyb2xbS10pOiBUQ29udHJvbFtLXSB7XG4gICAgaWYgKHRoaXMuY29udHJvbHNbbmFtZV0pIHJldHVybiAodGhpcy5jb250cm9scyBhcyBhbnkpW25hbWVdO1xuICAgIHRoaXMuY29udHJvbHNbbmFtZV0gPSBjb250cm9sO1xuICAgIGNvbnRyb2wuc2V0UGFyZW50KHRoaXMgYXMgRm9ybUdyb3VwKTtcbiAgICBjb250cm9sLl9yZWdpc3Rlck9uQ29sbGVjdGlvbkNoYW5nZSh0aGlzLl9vbkNvbGxlY3Rpb25DaGFuZ2UpO1xuICAgIHJldHVybiBjb250cm9sO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhIGNvbnRyb2wgdG8gdGhpcyBncm91cC4gSW4gYSBzdHJvbmdseS10eXBlZCBncm91cCwgdGhlIGNvbnRyb2wgbXVzdCBiZSBpbiB0aGUgZ3JvdXAncyB0eXBlXG4gICAqIChwb3NzaWJseSBhcyBhbiBvcHRpb25hbCBrZXkpLlxuICAgKlxuICAgKiBJZiBhIGNvbnRyb2wgd2l0aCBhIGdpdmVuIG5hbWUgYWxyZWFkeSBleGlzdHMsIGl0IHdvdWxkICpub3QqIGJlIHJlcGxhY2VkIHdpdGggYSBuZXcgb25lLlxuICAgKiBJZiB5b3Ugd2FudCB0byByZXBsYWNlIGFuIGV4aXN0aW5nIGNvbnRyb2wsIHVzZSB0aGUge0BsaW5rIEZvcm1Hcm91cCNzZXRDb250cm9sIHNldENvbnRyb2x9XG4gICAqIG1ldGhvZCBpbnN0ZWFkLiBUaGlzIG1ldGhvZCBhbHNvIHVwZGF0ZXMgdGhlIHZhbHVlIGFuZCB2YWxpZGl0eSBvZiB0aGUgY29udHJvbC5cbiAgICpcbiAgICogQHBhcmFtIG5hbWUgVGhlIGNvbnRyb2wgbmFtZSB0byBhZGQgdG8gdGhlIGNvbGxlY3Rpb25cbiAgICogQHBhcmFtIGNvbnRyb2wgUHJvdmlkZXMgdGhlIGNvbnRyb2wgZm9yIHRoZSBnaXZlbiBuYW1lXG4gICAqIEBwYXJhbSBvcHRpb25zIFNwZWNpZmllcyB3aGV0aGVyIHRoaXMgRm9ybUdyb3VwIGluc3RhbmNlIHNob3VsZCBlbWl0IGV2ZW50cyBhZnRlciBhIG5ld1xuICAgKiAgICAgY29udHJvbCBpcyBhZGRlZC5cbiAgICogKiBgZW1pdEV2ZW50YDogV2hlbiB0cnVlIG9yIG5vdCBzdXBwbGllZCAodGhlIGRlZmF1bHQpLCBib3RoIHRoZSBgc3RhdHVzQ2hhbmdlc2AgYW5kXG4gICAqIGB2YWx1ZUNoYW5nZXNgIG9ic2VydmFibGVzIGVtaXQgZXZlbnRzIHdpdGggdGhlIGxhdGVzdCBzdGF0dXMgYW5kIHZhbHVlIHdoZW4gdGhlIGNvbnRyb2wgaXNcbiAgICogYWRkZWQuIFdoZW4gZmFsc2UsIG5vIGV2ZW50cyBhcmUgZW1pdHRlZC5cbiAgICovXG4gIGFkZENvbnRyb2woXG4gICAgdGhpczogRm9ybUdyb3VwPHtba2V5OiBzdHJpbmddOiBBYnN0cmFjdENvbnRyb2w8YW55Pn0+LFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICBjb250cm9sOiBBYnN0cmFjdENvbnRyb2wsXG4gICAgb3B0aW9ucz86IHtlbWl0RXZlbnQ/OiBib29sZWFufSxcbiAgKTogdm9pZDtcbiAgYWRkQ29udHJvbDxLIGV4dGVuZHMgc3RyaW5nICYga2V5b2YgVENvbnRyb2w+KFxuICAgIG5hbWU6IEssXG4gICAgY29udHJvbDogUmVxdWlyZWQ8VENvbnRyb2w+W0tdLFxuICAgIG9wdGlvbnM/OiB7XG4gICAgICBlbWl0RXZlbnQ/OiBib29sZWFuO1xuICAgIH0sXG4gICk6IHZvaWQ7XG5cbiAgYWRkQ29udHJvbDxLIGV4dGVuZHMgc3RyaW5nICYga2V5b2YgVENvbnRyb2w+KFxuICAgIG5hbWU6IEssXG4gICAgY29udHJvbDogUmVxdWlyZWQ8VENvbnRyb2w+W0tdLFxuICAgIG9wdGlvbnM6IHtcbiAgICAgIGVtaXRFdmVudD86IGJvb2xlYW47XG4gICAgfSA9IHt9LFxuICApOiB2b2lkIHtcbiAgICB0aGlzLnJlZ2lzdGVyQ29udHJvbChuYW1lLCBjb250cm9sKTtcbiAgICB0aGlzLnVwZGF0ZVZhbHVlQW5kVmFsaWRpdHkoe2VtaXRFdmVudDogb3B0aW9ucy5lbWl0RXZlbnR9KTtcbiAgICB0aGlzLl9vbkNvbGxlY3Rpb25DaGFuZ2UoKTtcbiAgfVxuXG4gIHJlbW92ZUNvbnRyb2woXG4gICAgdGhpczogRm9ybUdyb3VwPHtba2V5OiBzdHJpbmddOiBBYnN0cmFjdENvbnRyb2w8YW55Pn0+LFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICBvcHRpb25zPzoge1xuICAgICAgZW1pdEV2ZW50PzogYm9vbGVhbjtcbiAgICB9LFxuICApOiB2b2lkO1xuICByZW1vdmVDb250cm9sPFMgZXh0ZW5kcyBzdHJpbmc+KFxuICAgIG5hbWU6IMm1T3B0aW9uYWxLZXlzPFRDb250cm9sPiAmIFMsXG4gICAgb3B0aW9ucz86IHtcbiAgICAgIGVtaXRFdmVudD86IGJvb2xlYW47XG4gICAgfSxcbiAgKTogdm9pZDtcblxuICAvKipcbiAgICogUmVtb3ZlIGEgY29udHJvbCBmcm9tIHRoaXMgZ3JvdXAuIEluIGEgc3Ryb25nbHktdHlwZWQgZ3JvdXAsIHJlcXVpcmVkIGNvbnRyb2xzIGNhbm5vdCBiZVxuICAgKiByZW1vdmVkLlxuICAgKlxuICAgKiBUaGlzIG1ldGhvZCBhbHNvIHVwZGF0ZXMgdGhlIHZhbHVlIGFuZCB2YWxpZGl0eSBvZiB0aGUgY29udHJvbC5cbiAgICpcbiAgICogQHBhcmFtIG5hbWUgVGhlIGNvbnRyb2wgbmFtZSB0byByZW1vdmUgZnJvbSB0aGUgY29sbGVjdGlvblxuICAgKiBAcGFyYW0gb3B0aW9ucyBTcGVjaWZpZXMgd2hldGhlciB0aGlzIEZvcm1Hcm91cCBpbnN0YW5jZSBzaG91bGQgZW1pdCBldmVudHMgYWZ0ZXIgYVxuICAgKiAgICAgY29udHJvbCBpcyByZW1vdmVkLlxuICAgKiAqIGBlbWl0RXZlbnRgOiBXaGVuIHRydWUgb3Igbm90IHN1cHBsaWVkICh0aGUgZGVmYXVsdCksIGJvdGggdGhlIGBzdGF0dXNDaGFuZ2VzYCBhbmRcbiAgICogYHZhbHVlQ2hhbmdlc2Agb2JzZXJ2YWJsZXMgZW1pdCBldmVudHMgd2l0aCB0aGUgbGF0ZXN0IHN0YXR1cyBhbmQgdmFsdWUgd2hlbiB0aGUgY29udHJvbCBpc1xuICAgKiByZW1vdmVkLiBXaGVuIGZhbHNlLCBubyBldmVudHMgYXJlIGVtaXR0ZWQuXG4gICAqL1xuICByZW1vdmVDb250cm9sKG5hbWU6IHN0cmluZywgb3B0aW9uczoge2VtaXRFdmVudD86IGJvb2xlYW59ID0ge30pOiB2b2lkIHtcbiAgICBpZiAoKHRoaXMuY29udHJvbHMgYXMgYW55KVtuYW1lXSlcbiAgICAgICh0aGlzLmNvbnRyb2xzIGFzIGFueSlbbmFtZV0uX3JlZ2lzdGVyT25Db2xsZWN0aW9uQ2hhbmdlKCgpID0+IHt9KTtcbiAgICBkZWxldGUgKHRoaXMuY29udHJvbHMgYXMgYW55KVtuYW1lXTtcbiAgICB0aGlzLnVwZGF0ZVZhbHVlQW5kVmFsaWRpdHkoe2VtaXRFdmVudDogb3B0aW9ucy5lbWl0RXZlbnR9KTtcbiAgICB0aGlzLl9vbkNvbGxlY3Rpb25DaGFuZ2UoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXBsYWNlIGFuIGV4aXN0aW5nIGNvbnRyb2wuIEluIGEgc3Ryb25nbHktdHlwZWQgZ3JvdXAsIHRoZSBjb250cm9sIG11c3QgYmUgaW4gdGhlIGdyb3VwJ3MgdHlwZVxuICAgKiAocG9zc2libHkgYXMgYW4gb3B0aW9uYWwga2V5KS5cbiAgICpcbiAgICogSWYgYSBjb250cm9sIHdpdGggYSBnaXZlbiBuYW1lIGRvZXMgbm90IGV4aXN0IGluIHRoaXMgYEZvcm1Hcm91cGAsIGl0IHdpbGwgYmUgYWRkZWQuXG4gICAqXG4gICAqIEBwYXJhbSBuYW1lIFRoZSBjb250cm9sIG5hbWUgdG8gcmVwbGFjZSBpbiB0aGUgY29sbGVjdGlvblxuICAgKiBAcGFyYW0gY29udHJvbCBQcm92aWRlcyB0aGUgY29udHJvbCBmb3IgdGhlIGdpdmVuIG5hbWVcbiAgICogQHBhcmFtIG9wdGlvbnMgU3BlY2lmaWVzIHdoZXRoZXIgdGhpcyBGb3JtR3JvdXAgaW5zdGFuY2Ugc2hvdWxkIGVtaXQgZXZlbnRzIGFmdGVyIGFuXG4gICAqICAgICBleGlzdGluZyBjb250cm9sIGlzIHJlcGxhY2VkLlxuICAgKiAqIGBlbWl0RXZlbnRgOiBXaGVuIHRydWUgb3Igbm90IHN1cHBsaWVkICh0aGUgZGVmYXVsdCksIGJvdGggdGhlIGBzdGF0dXNDaGFuZ2VzYCBhbmRcbiAgICogYHZhbHVlQ2hhbmdlc2Agb2JzZXJ2YWJsZXMgZW1pdCBldmVudHMgd2l0aCB0aGUgbGF0ZXN0IHN0YXR1cyBhbmQgdmFsdWUgd2hlbiB0aGUgY29udHJvbCBpc1xuICAgKiByZXBsYWNlZCB3aXRoIGEgbmV3IG9uZS4gV2hlbiBmYWxzZSwgbm8gZXZlbnRzIGFyZSBlbWl0dGVkLlxuICAgKi9cbiAgc2V0Q29udHJvbDxLIGV4dGVuZHMgc3RyaW5nICYga2V5b2YgVENvbnRyb2w+KFxuICAgIG5hbWU6IEssXG4gICAgY29udHJvbDogVENvbnRyb2xbS10sXG4gICAgb3B0aW9ucz86IHtcbiAgICAgIGVtaXRFdmVudD86IGJvb2xlYW47XG4gICAgfSxcbiAgKTogdm9pZDtcbiAgc2V0Q29udHJvbChcbiAgICB0aGlzOiBGb3JtR3JvdXA8e1trZXk6IHN0cmluZ106IEFic3RyYWN0Q29udHJvbDxhbnk+fT4sXG4gICAgbmFtZTogc3RyaW5nLFxuICAgIGNvbnRyb2w6IEFic3RyYWN0Q29udHJvbCxcbiAgICBvcHRpb25zPzoge2VtaXRFdmVudD86IGJvb2xlYW59LFxuICApOiB2b2lkO1xuXG4gIHNldENvbnRyb2w8SyBleHRlbmRzIHN0cmluZyAmIGtleW9mIFRDb250cm9sPihcbiAgICBuYW1lOiBLLFxuICAgIGNvbnRyb2w6IFRDb250cm9sW0tdLFxuICAgIG9wdGlvbnM6IHtcbiAgICAgIGVtaXRFdmVudD86IGJvb2xlYW47XG4gICAgfSA9IHt9LFxuICApOiB2b2lkIHtcbiAgICBpZiAodGhpcy5jb250cm9sc1tuYW1lXSkgdGhpcy5jb250cm9sc1tuYW1lXS5fcmVnaXN0ZXJPbkNvbGxlY3Rpb25DaGFuZ2UoKCkgPT4ge30pO1xuICAgIGRlbGV0ZSB0aGlzLmNvbnRyb2xzW25hbWVdO1xuICAgIGlmIChjb250cm9sKSB0aGlzLnJlZ2lzdGVyQ29udHJvbChuYW1lLCBjb250cm9sKTtcbiAgICB0aGlzLnVwZGF0ZVZhbHVlQW5kVmFsaWRpdHkoe2VtaXRFdmVudDogb3B0aW9ucy5lbWl0RXZlbnR9KTtcbiAgICB0aGlzLl9vbkNvbGxlY3Rpb25DaGFuZ2UoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayB3aGV0aGVyIHRoZXJlIGlzIGFuIGVuYWJsZWQgY29udHJvbCB3aXRoIHRoZSBnaXZlbiBuYW1lIGluIHRoZSBncm91cC5cbiAgICpcbiAgICogUmVwb3J0cyBmYWxzZSBmb3IgZGlzYWJsZWQgY29udHJvbHMuIElmIHlvdSdkIGxpa2UgdG8gY2hlY2sgZm9yIGV4aXN0ZW5jZSBpbiB0aGUgZ3JvdXBcbiAgICogb25seSwgdXNlIHtAbGluayBBYnN0cmFjdENvbnRyb2wjZ2V0IGdldH0gaW5zdGVhZC5cbiAgICpcbiAgICogQHBhcmFtIGNvbnRyb2xOYW1lIFRoZSBjb250cm9sIG5hbWUgdG8gY2hlY2sgZm9yIGV4aXN0ZW5jZSBpbiB0aGUgY29sbGVjdGlvblxuICAgKlxuICAgKiBAcmV0dXJucyBmYWxzZSBmb3IgZGlzYWJsZWQgY29udHJvbHMsIHRydWUgb3RoZXJ3aXNlLlxuICAgKi9cbiAgY29udGFpbnM8SyBleHRlbmRzIHN0cmluZz4oY29udHJvbE5hbWU6IEspOiBib29sZWFuO1xuICBjb250YWlucyh0aGlzOiBGb3JtR3JvdXA8e1trZXk6IHN0cmluZ106IEFic3RyYWN0Q29udHJvbDxhbnk+fT4sIGNvbnRyb2xOYW1lOiBzdHJpbmcpOiBib29sZWFuO1xuXG4gIGNvbnRhaW5zPEsgZXh0ZW5kcyBzdHJpbmcgJiBrZXlvZiBUQ29udHJvbD4oY29udHJvbE5hbWU6IEspOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5jb250cm9scy5oYXNPd25Qcm9wZXJ0eShjb250cm9sTmFtZSkgJiYgdGhpcy5jb250cm9sc1tjb250cm9sTmFtZV0uZW5hYmxlZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSB2YWx1ZSBvZiB0aGUgYEZvcm1Hcm91cGAuIEl0IGFjY2VwdHMgYW4gb2JqZWN0IHRoYXQgbWF0Y2hlc1xuICAgKiB0aGUgc3RydWN0dXJlIG9mIHRoZSBncm91cCwgd2l0aCBjb250cm9sIG5hbWVzIGFzIGtleXMuXG4gICAqXG4gICAqIEB1c2FnZU5vdGVzXG4gICAqICMjIyBTZXQgdGhlIGNvbXBsZXRlIHZhbHVlIGZvciB0aGUgZm9ybSBncm91cFxuICAgKlxuICAgKiBgYGBcbiAgICogY29uc3QgZm9ybSA9IG5ldyBGb3JtR3JvdXAoe1xuICAgKiAgIGZpcnN0OiBuZXcgRm9ybUNvbnRyb2woKSxcbiAgICogICBsYXN0OiBuZXcgRm9ybUNvbnRyb2woKVxuICAgKiB9KTtcbiAgICpcbiAgICogY29uc29sZS5sb2coZm9ybS52YWx1ZSk7ICAgLy8ge2ZpcnN0OiBudWxsLCBsYXN0OiBudWxsfVxuICAgKlxuICAgKiBmb3JtLnNldFZhbHVlKHtmaXJzdDogJ05hbmN5JywgbGFzdDogJ0RyZXcnfSk7XG4gICAqIGNvbnNvbGUubG9nKGZvcm0udmFsdWUpOyAgIC8vIHtmaXJzdDogJ05hbmN5JywgbGFzdDogJ0RyZXcnfVxuICAgKiBgYGBcbiAgICpcbiAgICogQHRocm93cyBXaGVuIHN0cmljdCBjaGVja3MgZmFpbCwgc3VjaCBhcyBzZXR0aW5nIHRoZSB2YWx1ZSBvZiBhIGNvbnRyb2xcbiAgICogdGhhdCBkb2Vzbid0IGV4aXN0IG9yIGlmIHlvdSBleGNsdWRlIGEgdmFsdWUgb2YgYSBjb250cm9sIHRoYXQgZG9lcyBleGlzdC5cbiAgICpcbiAgICogQHBhcmFtIHZhbHVlIFRoZSBuZXcgdmFsdWUgZm9yIHRoZSBjb250cm9sIHRoYXQgbWF0Y2hlcyB0aGUgc3RydWN0dXJlIG9mIHRoZSBncm91cC5cbiAgICogQHBhcmFtIG9wdGlvbnMgQ29uZmlndXJhdGlvbiBvcHRpb25zIHRoYXQgZGV0ZXJtaW5lIGhvdyB0aGUgY29udHJvbCBwcm9wYWdhdGVzIGNoYW5nZXNcbiAgICogYW5kIGVtaXRzIGV2ZW50cyBhZnRlciB0aGUgdmFsdWUgY2hhbmdlcy5cbiAgICogVGhlIGNvbmZpZ3VyYXRpb24gb3B0aW9ucyBhcmUgcGFzc2VkIHRvIHRoZSB7QGxpbmsgQWJzdHJhY3RDb250cm9sI3VwZGF0ZVZhbHVlQW5kVmFsaWRpdHlcbiAgICogdXBkYXRlVmFsdWVBbmRWYWxpZGl0eX0gbWV0aG9kLlxuICAgKlxuICAgKiAqIGBvbmx5U2VsZmA6IFdoZW4gdHJ1ZSwgZWFjaCBjaGFuZ2Ugb25seSBhZmZlY3RzIHRoaXMgY29udHJvbCwgYW5kIG5vdCBpdHMgcGFyZW50LiBEZWZhdWx0IGlzXG4gICAqIGZhbHNlLlxuICAgKiAqIGBlbWl0RXZlbnRgOiBXaGVuIHRydWUgb3Igbm90IHN1cHBsaWVkICh0aGUgZGVmYXVsdCksIGJvdGggdGhlIGBzdGF0dXNDaGFuZ2VzYCBhbmRcbiAgICogYHZhbHVlQ2hhbmdlc2BcbiAgICogb2JzZXJ2YWJsZXMgZW1pdCBldmVudHMgd2l0aCB0aGUgbGF0ZXN0IHN0YXR1cyBhbmQgdmFsdWUgd2hlbiB0aGUgY29udHJvbCB2YWx1ZSBpcyB1cGRhdGVkLlxuICAgKiBXaGVuIGZhbHNlLCBubyBldmVudHMgYXJlIGVtaXR0ZWQuXG4gICAqL1xuICBvdmVycmlkZSBzZXRWYWx1ZShcbiAgICB2YWx1ZTogybVGb3JtR3JvdXBSYXdWYWx1ZTxUQ29udHJvbD4sXG4gICAgb3B0aW9uczoge1xuICAgICAgb25seVNlbGY/OiBib29sZWFuO1xuICAgICAgZW1pdEV2ZW50PzogYm9vbGVhbjtcbiAgICB9ID0ge30sXG4gICk6IHZvaWQge1xuICAgIGFzc2VydEFsbFZhbHVlc1ByZXNlbnQodGhpcywgdHJ1ZSwgdmFsdWUpO1xuICAgIChPYmplY3Qua2V5cyh2YWx1ZSkgYXMgQXJyYXk8a2V5b2YgVENvbnRyb2w+KS5mb3JFYWNoKChuYW1lKSA9PiB7XG4gICAgICBhc3NlcnRDb250cm9sUHJlc2VudCh0aGlzLCB0cnVlLCBuYW1lIGFzIGFueSk7XG4gICAgICAodGhpcy5jb250cm9scyBhcyBhbnkpW25hbWVdLnNldFZhbHVlKCh2YWx1ZSBhcyBhbnkpW25hbWVdLCB7XG4gICAgICAgIG9ubHlTZWxmOiB0cnVlLFxuICAgICAgICBlbWl0RXZlbnQ6IG9wdGlvbnMuZW1pdEV2ZW50LFxuICAgICAgfSk7XG4gICAgfSk7XG4gICAgdGhpcy51cGRhdGVWYWx1ZUFuZFZhbGlkaXR5KG9wdGlvbnMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFBhdGNoZXMgdGhlIHZhbHVlIG9mIHRoZSBgRm9ybUdyb3VwYC4gSXQgYWNjZXB0cyBhbiBvYmplY3Qgd2l0aCBjb250cm9sXG4gICAqIG5hbWVzIGFzIGtleXMsIGFuZCBkb2VzIGl0cyBiZXN0IHRvIG1hdGNoIHRoZSB2YWx1ZXMgdG8gdGhlIGNvcnJlY3QgY29udHJvbHNcbiAgICogaW4gdGhlIGdyb3VwLlxuICAgKlxuICAgKiBJdCBhY2NlcHRzIGJvdGggc3VwZXItc2V0cyBhbmQgc3ViLXNldHMgb2YgdGhlIGdyb3VwIHdpdGhvdXQgdGhyb3dpbmcgYW4gZXJyb3IuXG4gICAqXG4gICAqIEB1c2FnZU5vdGVzXG4gICAqICMjIyBQYXRjaCB0aGUgdmFsdWUgZm9yIGEgZm9ybSBncm91cFxuICAgKlxuICAgKiBgYGBcbiAgICogY29uc3QgZm9ybSA9IG5ldyBGb3JtR3JvdXAoe1xuICAgKiAgICBmaXJzdDogbmV3IEZvcm1Db250cm9sKCksXG4gICAqICAgIGxhc3Q6IG5ldyBGb3JtQ29udHJvbCgpXG4gICAqIH0pO1xuICAgKiBjb25zb2xlLmxvZyhmb3JtLnZhbHVlKTsgICAvLyB7Zmlyc3Q6IG51bGwsIGxhc3Q6IG51bGx9XG4gICAqXG4gICAqIGZvcm0ucGF0Y2hWYWx1ZSh7Zmlyc3Q6ICdOYW5jeSd9KTtcbiAgICogY29uc29sZS5sb2coZm9ybS52YWx1ZSk7ICAgLy8ge2ZpcnN0OiAnTmFuY3knLCBsYXN0OiBudWxsfVxuICAgKiBgYGBcbiAgICpcbiAgICogQHBhcmFtIHZhbHVlIFRoZSBvYmplY3QgdGhhdCBtYXRjaGVzIHRoZSBzdHJ1Y3R1cmUgb2YgdGhlIGdyb3VwLlxuICAgKiBAcGFyYW0gb3B0aW9ucyBDb25maWd1cmF0aW9uIG9wdGlvbnMgdGhhdCBkZXRlcm1pbmUgaG93IHRoZSBjb250cm9sIHByb3BhZ2F0ZXMgY2hhbmdlcyBhbmRcbiAgICogZW1pdHMgZXZlbnRzIGFmdGVyIHRoZSB2YWx1ZSBpcyBwYXRjaGVkLlxuICAgKiAqIGBvbmx5U2VsZmA6IFdoZW4gdHJ1ZSwgZWFjaCBjaGFuZ2Ugb25seSBhZmZlY3RzIHRoaXMgY29udHJvbCBhbmQgbm90IGl0cyBwYXJlbnQuIERlZmF1bHQgaXNcbiAgICogdHJ1ZS5cbiAgICogKiBgZW1pdEV2ZW50YDogV2hlbiB0cnVlIG9yIG5vdCBzdXBwbGllZCAodGhlIGRlZmF1bHQpLCBib3RoIHRoZSBgc3RhdHVzQ2hhbmdlc2AgYW5kXG4gICAqIGB2YWx1ZUNoYW5nZXNgIG9ic2VydmFibGVzIGVtaXQgZXZlbnRzIHdpdGggdGhlIGxhdGVzdCBzdGF0dXMgYW5kIHZhbHVlIHdoZW4gdGhlIGNvbnRyb2wgdmFsdWVcbiAgICogaXMgdXBkYXRlZC4gV2hlbiBmYWxzZSwgbm8gZXZlbnRzIGFyZSBlbWl0dGVkLiBUaGUgY29uZmlndXJhdGlvbiBvcHRpb25zIGFyZSBwYXNzZWQgdG9cbiAgICogdGhlIHtAbGluayBBYnN0cmFjdENvbnRyb2wjdXBkYXRlVmFsdWVBbmRWYWxpZGl0eSB1cGRhdGVWYWx1ZUFuZFZhbGlkaXR5fSBtZXRob2QuXG4gICAqL1xuICBvdmVycmlkZSBwYXRjaFZhbHVlKFxuICAgIHZhbHVlOiDJtUZvcm1Hcm91cFZhbHVlPFRDb250cm9sPixcbiAgICBvcHRpb25zOiB7XG4gICAgICBvbmx5U2VsZj86IGJvb2xlYW47XG4gICAgICBlbWl0RXZlbnQ/OiBib29sZWFuO1xuICAgIH0gPSB7fSxcbiAgKTogdm9pZCB7XG4gICAgLy8gRXZlbiB0aG91Z2ggdGhlIGB2YWx1ZWAgYXJndW1lbnQgdHlwZSBkb2Vzbid0IGFsbG93IGBudWxsYCBhbmQgYHVuZGVmaW5lZGAgdmFsdWVzLCB0aGVcbiAgICAvLyBgcGF0Y2hWYWx1ZWAgY2FuIGJlIGNhbGxlZCByZWN1cnNpdmVseSBhbmQgaW5uZXIgZGF0YSBzdHJ1Y3R1cmVzIG1pZ2h0IGhhdmUgdGhlc2UgdmFsdWVzLCBzb1xuICAgIC8vIHdlIGp1c3QgaWdub3JlIHN1Y2ggY2FzZXMgd2hlbiBhIGZpZWxkIGNvbnRhaW5pbmcgRm9ybUdyb3VwIGluc3RhbmNlIHJlY2VpdmVzIGBudWxsYCBvclxuICAgIC8vIGB1bmRlZmluZWRgIGFzIGEgdmFsdWUuXG4gICAgaWYgKHZhbHVlID09IG51bGwgLyogYm90aCBgbnVsbGAgYW5kIGB1bmRlZmluZWRgICovKSByZXR1cm47XG4gICAgKE9iamVjdC5rZXlzKHZhbHVlKSBhcyBBcnJheTxrZXlvZiBUQ29udHJvbD4pLmZvckVhY2goKG5hbWUpID0+IHtcbiAgICAgIC8vIFRoZSBjb21waWxlciBjYW5ub3Qgc2VlIHRocm91Z2ggdGhlIHVuaW5zdGFudGlhdGVkIGNvbmRpdGlvbmFsIHR5cGUgb2YgYHRoaXMuY29udHJvbHNgLCBzb1xuICAgICAgLy8gYGFzIGFueWAgaXMgcmVxdWlyZWQuXG4gICAgICBjb25zdCBjb250cm9sID0gKHRoaXMuY29udHJvbHMgYXMgYW55KVtuYW1lXTtcbiAgICAgIGlmIChjb250cm9sKSB7XG4gICAgICAgIGNvbnRyb2wucGF0Y2hWYWx1ZShcbiAgICAgICAgICAvKiBHdWFyYW50ZWVkIHRvIGJlIHByZXNlbnQsIGR1ZSB0byB0aGUgb3V0ZXIgZm9yRWFjaC4gKi8gdmFsdWVbXG4gICAgICAgICAgICBuYW1lIGFzIGtleW9mIMm1Rm9ybUdyb3VwVmFsdWU8VENvbnRyb2w+XG4gICAgICAgICAgXSEsXG4gICAgICAgICAge29ubHlTZWxmOiB0cnVlLCBlbWl0RXZlbnQ6IG9wdGlvbnMuZW1pdEV2ZW50fSxcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICB0aGlzLnVwZGF0ZVZhbHVlQW5kVmFsaWRpdHkob3B0aW9ucyk7XG4gIH1cblxuICAvKipcbiAgICogUmVzZXRzIHRoZSBgRm9ybUdyb3VwYCwgbWFya3MgYWxsIGRlc2NlbmRhbnRzIGBwcmlzdGluZWAgYW5kIGB1bnRvdWNoZWRgIGFuZCBzZXRzXG4gICAqIHRoZSB2YWx1ZSBvZiBhbGwgZGVzY2VuZGFudHMgdG8gdGhlaXIgZGVmYXVsdCB2YWx1ZXMsIG9yIG51bGwgaWYgbm8gZGVmYXVsdHMgd2VyZSBwcm92aWRlZC5cbiAgICpcbiAgICogWW91IHJlc2V0IHRvIGEgc3BlY2lmaWMgZm9ybSBzdGF0ZSBieSBwYXNzaW5nIGluIGEgbWFwIG9mIHN0YXRlc1xuICAgKiB0aGF0IG1hdGNoZXMgdGhlIHN0cnVjdHVyZSBvZiB5b3VyIGZvcm0sIHdpdGggY29udHJvbCBuYW1lcyBhcyBrZXlzLiBUaGUgc3RhdGVcbiAgICogaXMgYSBzdGFuZGFsb25lIHZhbHVlIG9yIGEgZm9ybSBzdGF0ZSBvYmplY3Qgd2l0aCBib3RoIGEgdmFsdWUgYW5kIGEgZGlzYWJsZWRcbiAgICogc3RhdHVzLlxuICAgKlxuICAgKiBAcGFyYW0gdmFsdWUgUmVzZXRzIHRoZSBjb250cm9sIHdpdGggYW4gaW5pdGlhbCB2YWx1ZSxcbiAgICogb3IgYW4gb2JqZWN0IHRoYXQgZGVmaW5lcyB0aGUgaW5pdGlhbCB2YWx1ZSBhbmQgZGlzYWJsZWQgc3RhdGUuXG4gICAqXG4gICAqIEBwYXJhbSBvcHRpb25zIENvbmZpZ3VyYXRpb24gb3B0aW9ucyB0aGF0IGRldGVybWluZSBob3cgdGhlIGNvbnRyb2wgcHJvcGFnYXRlcyBjaGFuZ2VzXG4gICAqIGFuZCBlbWl0cyBldmVudHMgd2hlbiB0aGUgZ3JvdXAgaXMgcmVzZXQuXG4gICAqICogYG9ubHlTZWxmYDogV2hlbiB0cnVlLCBlYWNoIGNoYW5nZSBvbmx5IGFmZmVjdHMgdGhpcyBjb250cm9sLCBhbmQgbm90IGl0cyBwYXJlbnQuIERlZmF1bHQgaXNcbiAgICogZmFsc2UuXG4gICAqICogYGVtaXRFdmVudGA6IFdoZW4gdHJ1ZSBvciBub3Qgc3VwcGxpZWQgKHRoZSBkZWZhdWx0KSwgYm90aCB0aGUgYHN0YXR1c0NoYW5nZXNgIGFuZFxuICAgKiBgdmFsdWVDaGFuZ2VzYFxuICAgKiBvYnNlcnZhYmxlcyBlbWl0IGV2ZW50cyB3aXRoIHRoZSBsYXRlc3Qgc3RhdHVzIGFuZCB2YWx1ZSB3aGVuIHRoZSBjb250cm9sIGlzIHJlc2V0LlxuICAgKiBXaGVuIGZhbHNlLCBubyBldmVudHMgYXJlIGVtaXR0ZWQuXG4gICAqIFRoZSBjb25maWd1cmF0aW9uIG9wdGlvbnMgYXJlIHBhc3NlZCB0byB0aGUge0BsaW5rIEFic3RyYWN0Q29udHJvbCN1cGRhdGVWYWx1ZUFuZFZhbGlkaXR5XG4gICAqIHVwZGF0ZVZhbHVlQW5kVmFsaWRpdHl9IG1ldGhvZC5cbiAgICpcbiAgICogQHVzYWdlTm90ZXNcbiAgICpcbiAgICogIyMjIFJlc2V0IHRoZSBmb3JtIGdyb3VwIHZhbHVlc1xuICAgKlxuICAgKiBgYGB0c1xuICAgKiBjb25zdCBmb3JtID0gbmV3IEZvcm1Hcm91cCh7XG4gICAqICAgZmlyc3Q6IG5ldyBGb3JtQ29udHJvbCgnZmlyc3QgbmFtZScpLFxuICAgKiAgIGxhc3Q6IG5ldyBGb3JtQ29udHJvbCgnbGFzdCBuYW1lJylcbiAgICogfSk7XG4gICAqXG4gICAqIGNvbnNvbGUubG9nKGZvcm0udmFsdWUpOyAgLy8ge2ZpcnN0OiAnZmlyc3QgbmFtZScsIGxhc3Q6ICdsYXN0IG5hbWUnfVxuICAgKlxuICAgKiBmb3JtLnJlc2V0KHsgZmlyc3Q6ICduYW1lJywgbGFzdDogJ2xhc3QgbmFtZScgfSk7XG4gICAqXG4gICAqIGNvbnNvbGUubG9nKGZvcm0udmFsdWUpOyAgLy8ge2ZpcnN0OiAnbmFtZScsIGxhc3Q6ICdsYXN0IG5hbWUnfVxuICAgKiBgYGBcbiAgICpcbiAgICogIyMjIFJlc2V0IHRoZSBmb3JtIGdyb3VwIHZhbHVlcyBhbmQgZGlzYWJsZWQgc3RhdHVzXG4gICAqXG4gICAqIGBgYFxuICAgKiBjb25zdCBmb3JtID0gbmV3IEZvcm1Hcm91cCh7XG4gICAqICAgZmlyc3Q6IG5ldyBGb3JtQ29udHJvbCgnZmlyc3QgbmFtZScpLFxuICAgKiAgIGxhc3Q6IG5ldyBGb3JtQ29udHJvbCgnbGFzdCBuYW1lJylcbiAgICogfSk7XG4gICAqXG4gICAqIGZvcm0ucmVzZXQoe1xuICAgKiAgIGZpcnN0OiB7dmFsdWU6ICduYW1lJywgZGlzYWJsZWQ6IHRydWV9LFxuICAgKiAgIGxhc3Q6ICdsYXN0J1xuICAgKiB9KTtcbiAgICpcbiAgICogY29uc29sZS5sb2coZm9ybS52YWx1ZSk7ICAvLyB7bGFzdDogJ2xhc3QnfVxuICAgKiBjb25zb2xlLmxvZyhmb3JtLmdldCgnZmlyc3QnKS5zdGF0dXMpOyAgLy8gJ0RJU0FCTEVEJ1xuICAgKiBgYGBcbiAgICovXG4gIG92ZXJyaWRlIHJlc2V0KFxuICAgIHZhbHVlOiDJtVR5cGVkT3JVbnR5cGVkPFxuICAgICAgVENvbnRyb2wsXG4gICAgICDJtUZvcm1Hcm91cFZhbHVlPFRDb250cm9sPixcbiAgICAgIGFueVxuICAgID4gPSB7fSBhcyB1bmtub3duIGFzIMm1Rm9ybUdyb3VwVmFsdWU8VENvbnRyb2w+LFxuICAgIG9wdGlvbnM6IHtvbmx5U2VsZj86IGJvb2xlYW47IGVtaXRFdmVudD86IGJvb2xlYW59ID0ge30sXG4gICk6IHZvaWQge1xuICAgIHRoaXMuX2ZvckVhY2hDaGlsZCgoY29udHJvbDogQWJzdHJhY3RDb250cm9sLCBuYW1lKSA9PiB7XG4gICAgICBjb250cm9sLnJlc2V0KHZhbHVlID8gKHZhbHVlIGFzIGFueSlbbmFtZV0gOiBudWxsLCB7XG4gICAgICAgIG9ubHlTZWxmOiB0cnVlLFxuICAgICAgICBlbWl0RXZlbnQ6IG9wdGlvbnMuZW1pdEV2ZW50LFxuICAgICAgfSk7XG4gICAgfSk7XG4gICAgdGhpcy5fdXBkYXRlUHJpc3RpbmUob3B0aW9ucywgdGhpcyk7XG4gICAgdGhpcy5fdXBkYXRlVG91Y2hlZChvcHRpb25zLCB0aGlzKTtcbiAgICB0aGlzLnVwZGF0ZVZhbHVlQW5kVmFsaWRpdHkob3B0aW9ucyk7XG4gIH1cblxuICAvKipcbiAgICogVGhlIGFnZ3JlZ2F0ZSB2YWx1ZSBvZiB0aGUgYEZvcm1Hcm91cGAsIGluY2x1ZGluZyBhbnkgZGlzYWJsZWQgY29udHJvbHMuXG4gICAqXG4gICAqIFJldHJpZXZlcyBhbGwgdmFsdWVzIHJlZ2FyZGxlc3Mgb2YgZGlzYWJsZWQgc3RhdHVzLlxuICAgKi9cbiAgb3ZlcnJpZGUgZ2V0UmF3VmFsdWUoKTogybVUeXBlZE9yVW50eXBlZDxUQ29udHJvbCwgybVGb3JtR3JvdXBSYXdWYWx1ZTxUQ29udHJvbD4sIGFueT4ge1xuICAgIHJldHVybiB0aGlzLl9yZWR1Y2VDaGlsZHJlbih7fSwgKGFjYywgY29udHJvbCwgbmFtZSkgPT4ge1xuICAgICAgKGFjYyBhcyBhbnkpW25hbWVdID0gKGNvbnRyb2wgYXMgYW55KS5nZXRSYXdWYWx1ZSgpO1xuICAgICAgcmV0dXJuIGFjYztcbiAgICB9KSBhcyBhbnk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIG92ZXJyaWRlIF9zeW5jUGVuZGluZ0NvbnRyb2xzKCk6IGJvb2xlYW4ge1xuICAgIGxldCBzdWJ0cmVlVXBkYXRlZCA9IHRoaXMuX3JlZHVjZUNoaWxkcmVuKGZhbHNlLCAodXBkYXRlZDogYm9vbGVhbiwgY2hpbGQpID0+IHtcbiAgICAgIHJldHVybiBjaGlsZC5fc3luY1BlbmRpbmdDb250cm9scygpID8gdHJ1ZSA6IHVwZGF0ZWQ7XG4gICAgfSk7XG4gICAgaWYgKHN1YnRyZWVVcGRhdGVkKSB0aGlzLnVwZGF0ZVZhbHVlQW5kVmFsaWRpdHkoe29ubHlTZWxmOiB0cnVlfSk7XG4gICAgcmV0dXJuIHN1YnRyZWVVcGRhdGVkO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBvdmVycmlkZSBfZm9yRWFjaENoaWxkKGNiOiAodjogYW55LCBrOiBhbnkpID0+IHZvaWQpOiB2b2lkIHtcbiAgICBPYmplY3Qua2V5cyh0aGlzLmNvbnRyb2xzKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgIC8vIFRoZSBsaXN0IG9mIGNvbnRyb2xzIGNhbiBjaGFuZ2UgKGZvciBleC4gY29udHJvbHMgbWlnaHQgYmUgcmVtb3ZlZCkgd2hpbGUgdGhlIGxvb3BcbiAgICAgIC8vIGlzIHJ1bm5pbmcgKGFzIGEgcmVzdWx0IG9mIGludm9raW5nIEZvcm1zIEFQSSBpbiBgdmFsdWVDaGFuZ2VzYCBzdWJzY3JpcHRpb24pLCBzbyB3ZVxuICAgICAgLy8gaGF2ZSB0byBudWxsIGNoZWNrIGJlZm9yZSBpbnZva2luZyB0aGUgY2FsbGJhY2suXG4gICAgICBjb25zdCBjb250cm9sID0gKHRoaXMuY29udHJvbHMgYXMgYW55KVtrZXldO1xuICAgICAgY29udHJvbCAmJiBjYihjb250cm9sLCBrZXkpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfc2V0VXBDb250cm9scygpOiB2b2lkIHtcbiAgICB0aGlzLl9mb3JFYWNoQ2hpbGQoKGNvbnRyb2wpID0+IHtcbiAgICAgIGNvbnRyb2wuc2V0UGFyZW50KHRoaXMpO1xuICAgICAgY29udHJvbC5fcmVnaXN0ZXJPbkNvbGxlY3Rpb25DaGFuZ2UodGhpcy5fb25Db2xsZWN0aW9uQ2hhbmdlKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgb3ZlcnJpZGUgX3VwZGF0ZVZhbHVlKCk6IHZvaWQge1xuICAgICh0aGlzIGFzIFdyaXRhYmxlPHRoaXM+KS52YWx1ZSA9IHRoaXMuX3JlZHVjZVZhbHVlKCkgYXMgYW55O1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBvdmVycmlkZSBfYW55Q29udHJvbHMoY29uZGl0aW9uOiAoYzogQWJzdHJhY3RDb250cm9sKSA9PiBib29sZWFuKTogYm9vbGVhbiB7XG4gICAgZm9yIChjb25zdCBbY29udHJvbE5hbWUsIGNvbnRyb2xdIG9mIE9iamVjdC5lbnRyaWVzKHRoaXMuY29udHJvbHMpKSB7XG4gICAgICBpZiAodGhpcy5jb250YWlucyhjb250cm9sTmFtZSBhcyBhbnkpICYmIGNvbmRpdGlvbihjb250cm9sIGFzIGFueSkpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3JlZHVjZVZhbHVlKCk6IFBhcnRpYWw8VENvbnRyb2w+IHtcbiAgICBsZXQgYWNjOiBQYXJ0aWFsPFRDb250cm9sPiA9IHt9O1xuICAgIHJldHVybiB0aGlzLl9yZWR1Y2VDaGlsZHJlbihhY2MsIChhY2MsIGNvbnRyb2wsIG5hbWUpID0+IHtcbiAgICAgIGlmIChjb250cm9sLmVuYWJsZWQgfHwgdGhpcy5kaXNhYmxlZCkge1xuICAgICAgICBhY2NbbmFtZV0gPSBjb250cm9sLnZhbHVlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGFjYztcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3JlZHVjZUNoaWxkcmVuPFQsIEsgZXh0ZW5kcyBrZXlvZiBUQ29udHJvbD4oXG4gICAgaW5pdFZhbHVlOiBULFxuICAgIGZuOiAoYWNjOiBULCBjb250cm9sOiBUQ29udHJvbFtLXSwgbmFtZTogSykgPT4gVCxcbiAgKTogVCB7XG4gICAgbGV0IHJlcyA9IGluaXRWYWx1ZTtcbiAgICB0aGlzLl9mb3JFYWNoQ2hpbGQoKGNvbnRyb2w6IFRDb250cm9sW0tdLCBuYW1lOiBLKSA9PiB7XG4gICAgICByZXMgPSBmbihyZXMsIGNvbnRyb2wsIG5hbWUpO1xuICAgIH0pO1xuICAgIHJldHVybiByZXM7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIG92ZXJyaWRlIF9hbGxDb250cm9sc0Rpc2FibGVkKCk6IGJvb2xlYW4ge1xuICAgIGZvciAoY29uc3QgY29udHJvbE5hbWUgb2YgT2JqZWN0LmtleXModGhpcy5jb250cm9scykgYXMgQXJyYXk8a2V5b2YgVENvbnRyb2w+KSB7XG4gICAgICBpZiAoKHRoaXMuY29udHJvbHMgYXMgYW55KVtjb250cm9sTmFtZV0uZW5hYmxlZCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBPYmplY3Qua2V5cyh0aGlzLmNvbnRyb2xzKS5sZW5ndGggPiAwIHx8IHRoaXMuZGlzYWJsZWQ7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIG92ZXJyaWRlIF9maW5kKG5hbWU6IHN0cmluZyB8IG51bWJlcik6IEFic3RyYWN0Q29udHJvbCB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLmNvbnRyb2xzLmhhc093blByb3BlcnR5KG5hbWUgYXMgc3RyaW5nKVxuICAgICAgPyAodGhpcy5jb250cm9scyBhcyBhbnkpW25hbWUgYXMga2V5b2YgVENvbnRyb2xdXG4gICAgICA6IG51bGw7XG4gIH1cbn1cblxuLyoqXG4gKiBXaWxsIHZhbGlkYXRlIHRoYXQgbm9uZSBvZiB0aGUgY29udHJvbHMgaGFzIGEga2V5IHdpdGggYSBkb3RcbiAqIFRocm93cyBvdGhlciB3aXNlXG4gKi9cbmZ1bmN0aW9uIHZhbGlkYXRlRm9ybUdyb3VwQ29udHJvbHM8VENvbnRyb2w+KGNvbnRyb2xzOiB7XG4gIFtLIGluIGtleW9mIFRDb250cm9sXTogQWJzdHJhY3RDb250cm9sPGFueSwgYW55Pjtcbn0pIHtcbiAgY29uc3QgaW52YWxpZEtleXMgPSBPYmplY3Qua2V5cyhjb250cm9scykuZmlsdGVyKChrZXkpID0+IGtleS5pbmNsdWRlcygnLicpKTtcbiAgaWYgKGludmFsaWRLZXlzLmxlbmd0aCA+IDApIHtcbiAgICAvLyBUT0RPOiBtYWtlIHRoaXMgYW4gZXJyb3Igb25jZSB0aGVyZSBhcmUgbm8gbW9yZSB1c2VzIGluIEczXG4gICAgY29uc29sZS53YXJuKFxuICAgICAgYEZvcm1Hcm91cCBrZXlzIGNhbm5vdCBpbmNsdWRlIFxcYC5cXGAsIHBsZWFzZSByZXBsYWNlIHRoZSBrZXlzIGZvcjogJHtpbnZhbGlkS2V5cy5qb2luKCcsJyl9LmAsXG4gICAgKTtcbiAgfVxufVxuXG5pbnRlcmZhY2UgVW50eXBlZEZvcm1Hcm91cEN0b3Ige1xuICBuZXcgKFxuICAgIGNvbnRyb2xzOiB7W2tleTogc3RyaW5nXTogQWJzdHJhY3RDb250cm9sfSxcbiAgICB2YWxpZGF0b3JPck9wdHM/OiBWYWxpZGF0b3JGbiB8IFZhbGlkYXRvckZuW10gfCBBYnN0cmFjdENvbnRyb2xPcHRpb25zIHwgbnVsbCxcbiAgICBhc3luY1ZhbGlkYXRvcj86IEFzeW5jVmFsaWRhdG9yRm4gfCBBc3luY1ZhbGlkYXRvckZuW10gfCBudWxsLFxuICApOiBVbnR5cGVkRm9ybUdyb3VwO1xuXG4gIC8qKlxuICAgKiBUaGUgcHJlc2VuY2Ugb2YgYW4gZXhwbGljaXQgYHByb3RvdHlwZWAgcHJvcGVydHkgcHJvdmlkZXMgYmFja3dhcmRzLWNvbXBhdGliaWxpdHkgZm9yIGFwcHMgdGhhdFxuICAgKiBtYW51YWxseSBpbnNwZWN0IHRoZSBwcm90b3R5cGUgY2hhaW4uXG4gICAqL1xuICBwcm90b3R5cGU6IEZvcm1Hcm91cDxhbnk+O1xufVxuXG4vKipcbiAqIFVudHlwZWRGb3JtR3JvdXAgaXMgYSBub24tc3Ryb25nbHktdHlwZWQgdmVyc2lvbiBvZiBgRm9ybUdyb3VwYC5cbiAqL1xuZXhwb3J0IHR5cGUgVW50eXBlZEZvcm1Hcm91cCA9IEZvcm1Hcm91cDxhbnk+O1xuXG5leHBvcnQgY29uc3QgVW50eXBlZEZvcm1Hcm91cDogVW50eXBlZEZvcm1Hcm91cEN0b3IgPSBGb3JtR3JvdXA7XG5cbi8qKlxuICogQGRlc2NyaXB0aW9uXG4gKiBBc3NlcnRzIHRoYXQgdGhlIGdpdmVuIGNvbnRyb2wgaXMgYW4gaW5zdGFuY2Ugb2YgYEZvcm1Hcm91cGBcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjb25zdCBpc0Zvcm1Hcm91cCA9IChjb250cm9sOiB1bmtub3duKTogY29udHJvbCBpcyBGb3JtR3JvdXAgPT4gY29udHJvbCBpbnN0YW5jZW9mIEZvcm1Hcm91cDtcblxuLyoqXG4gKiBUcmFja3MgdGhlIHZhbHVlIGFuZCB2YWxpZGl0eSBzdGF0ZSBvZiBhIGNvbGxlY3Rpb24gb2YgYEZvcm1Db250cm9sYCBpbnN0YW5jZXMsIGVhY2ggb2Ygd2hpY2ggaGFzXG4gKiB0aGUgc2FtZSB2YWx1ZSB0eXBlLlxuICpcbiAqIGBGb3JtUmVjb3JkYCBpcyB2ZXJ5IHNpbWlsYXIgdG8ge0BsaW5rIEZvcm1Hcm91cH0sIGV4Y2VwdCBpdCBjYW4gYmUgdXNlZCB3aXRoIGEgZHluYW1pYyBrZXlzLFxuICogd2l0aCBjb250cm9scyBhZGRlZCBhbmQgcmVtb3ZlZCBhcyBuZWVkZWQuXG4gKlxuICogYEZvcm1SZWNvcmRgIGFjY2VwdHMgb25lIGdlbmVyaWMgYXJndW1lbnQsIHdoaWNoIGRlc2NyaWJlcyB0aGUgdHlwZSBvZiB0aGUgY29udHJvbHMgaXQgY29udGFpbnMuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqXG4gKiBgYGBcbiAqIGxldCBudW1iZXJzID0gbmV3IEZvcm1SZWNvcmQoe2JpbGw6IG5ldyBGb3JtQ29udHJvbCgnNDE1LTEyMy00NTYnKX0pO1xuICogbnVtYmVycy5hZGRDb250cm9sKCdib2InLCBuZXcgRm9ybUNvbnRyb2woJzQxNS0yMzQtNTY3JykpO1xuICogbnVtYmVycy5yZW1vdmVDb250cm9sKCdiaWxsJyk7XG4gKiBgYGBcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjbGFzcyBGb3JtUmVjb3JkPFRDb250cm9sIGV4dGVuZHMgQWJzdHJhY3RDb250cm9sID0gQWJzdHJhY3RDb250cm9sPiBleHRlbmRzIEZvcm1Hcm91cDx7XG4gIFtrZXk6IHN0cmluZ106IFRDb250cm9sO1xufT4ge31cblxuZXhwb3J0IGludGVyZmFjZSBGb3JtUmVjb3JkPFRDb250cm9sPiB7XG4gIC8qKlxuICAgKiBSZWdpc3RlcnMgYSBjb250cm9sIHdpdGggdGhlIHJlY29yZHMncyBsaXN0IG9mIGNvbnRyb2xzLlxuICAgKlxuICAgKiBTZWUgYEZvcm1Hcm91cCNyZWdpc3RlckNvbnRyb2xgIGZvciBhZGRpdGlvbmFsIGluZm9ybWF0aW9uLlxuICAgKi9cbiAgcmVnaXN0ZXJDb250cm9sKG5hbWU6IHN0cmluZywgY29udHJvbDogVENvbnRyb2wpOiBUQ29udHJvbDtcblxuICAvKipcbiAgICogQWRkIGEgY29udHJvbCB0byB0aGlzIGdyb3VwLlxuICAgKlxuICAgKiBTZWUgYEZvcm1Hcm91cCNhZGRDb250cm9sYCBmb3IgYWRkaXRpb25hbCBpbmZvcm1hdGlvbi5cbiAgICovXG4gIGFkZENvbnRyb2wobmFtZTogc3RyaW5nLCBjb250cm9sOiBUQ29udHJvbCwgb3B0aW9ucz86IHtlbWl0RXZlbnQ/OiBib29sZWFufSk6IHZvaWQ7XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBhIGNvbnRyb2wgZnJvbSB0aGlzIGdyb3VwLlxuICAgKlxuICAgKiBTZWUgYEZvcm1Hcm91cCNyZW1vdmVDb250cm9sYCBmb3IgYWRkaXRpb25hbCBpbmZvcm1hdGlvbi5cbiAgICovXG4gIHJlbW92ZUNvbnRyb2wobmFtZTogc3RyaW5nLCBvcHRpb25zPzoge2VtaXRFdmVudD86IGJvb2xlYW59KTogdm9pZDtcblxuICAvKipcbiAgICogUmVwbGFjZSBhbiBleGlzdGluZyBjb250cm9sLlxuICAgKlxuICAgKiBTZWUgYEZvcm1Hcm91cCNzZXRDb250cm9sYCBmb3IgYWRkaXRpb25hbCBpbmZvcm1hdGlvbi5cbiAgICovXG4gIHNldENvbnRyb2wobmFtZTogc3RyaW5nLCBjb250cm9sOiBUQ29udHJvbCwgb3B0aW9ucz86IHtlbWl0RXZlbnQ/OiBib29sZWFufSk6IHZvaWQ7XG5cbiAgLyoqXG4gICAqIENoZWNrIHdoZXRoZXIgdGhlcmUgaXMgYW4gZW5hYmxlZCBjb250cm9sIHdpdGggdGhlIGdpdmVuIG5hbWUgaW4gdGhlIGdyb3VwLlxuICAgKlxuICAgKiBTZWUgYEZvcm1Hcm91cCNjb250YWluc2AgZm9yIGFkZGl0aW9uYWwgaW5mb3JtYXRpb24uXG4gICAqL1xuICBjb250YWlucyhjb250cm9sTmFtZTogc3RyaW5nKTogYm9vbGVhbjtcblxuICAvKipcbiAgICogU2V0cyB0aGUgdmFsdWUgb2YgdGhlIGBGb3JtUmVjb3JkYC4gSXQgYWNjZXB0cyBhbiBvYmplY3QgdGhhdCBtYXRjaGVzXG4gICAqIHRoZSBzdHJ1Y3R1cmUgb2YgdGhlIGdyb3VwLCB3aXRoIGNvbnRyb2wgbmFtZXMgYXMga2V5cy5cbiAgICpcbiAgICogU2VlIGBGb3JtR3JvdXAjc2V0VmFsdWVgIGZvciBhZGRpdGlvbmFsIGluZm9ybWF0aW9uLlxuICAgKi9cbiAgc2V0VmFsdWUoXG4gICAgdmFsdWU6IHtba2V5OiBzdHJpbmddOiDJtVZhbHVlPFRDb250cm9sPn0sXG4gICAgb3B0aW9ucz86IHtcbiAgICAgIG9ubHlTZWxmPzogYm9vbGVhbjtcbiAgICAgIGVtaXRFdmVudD86IGJvb2xlYW47XG4gICAgfSxcbiAgKTogdm9pZDtcblxuICAvKipcbiAgICogUGF0Y2hlcyB0aGUgdmFsdWUgb2YgdGhlIGBGb3JtUmVjb3JkYC4gSXQgYWNjZXB0cyBhbiBvYmplY3Qgd2l0aCBjb250cm9sXG4gICAqIG5hbWVzIGFzIGtleXMsIGFuZCBkb2VzIGl0cyBiZXN0IHRvIG1hdGNoIHRoZSB2YWx1ZXMgdG8gdGhlIGNvcnJlY3QgY29udHJvbHNcbiAgICogaW4gdGhlIGdyb3VwLlxuICAgKlxuICAgKiBTZWUgYEZvcm1Hcm91cCNwYXRjaFZhbHVlYCBmb3IgYWRkaXRpb25hbCBpbmZvcm1hdGlvbi5cbiAgICovXG4gIHBhdGNoVmFsdWUoXG4gICAgdmFsdWU6IHtba2V5OiBzdHJpbmddOiDJtVZhbHVlPFRDb250cm9sPn0sXG4gICAgb3B0aW9ucz86IHtcbiAgICAgIG9ubHlTZWxmPzogYm9vbGVhbjtcbiAgICAgIGVtaXRFdmVudD86IGJvb2xlYW47XG4gICAgfSxcbiAgKTogdm9pZDtcblxuICAvKipcbiAgICogUmVzZXRzIHRoZSBgRm9ybVJlY29yZGAsIG1hcmtzIGFsbCBkZXNjZW5kYW50cyBgcHJpc3RpbmVgIGFuZCBgdW50b3VjaGVkYCBhbmQgc2V0c1xuICAgKiB0aGUgdmFsdWUgb2YgYWxsIGRlc2NlbmRhbnRzIHRvIG51bGwuXG4gICAqXG4gICAqIFNlZSBgRm9ybUdyb3VwI3Jlc2V0YCBmb3IgYWRkaXRpb25hbCBpbmZvcm1hdGlvbi5cbiAgICovXG4gIHJlc2V0KFxuICAgIHZhbHVlPzoge1trZXk6IHN0cmluZ106IMm1VmFsdWU8VENvbnRyb2w+fSxcbiAgICBvcHRpb25zPzoge1xuICAgICAgb25seVNlbGY/OiBib29sZWFuO1xuICAgICAgZW1pdEV2ZW50PzogYm9vbGVhbjtcbiAgICB9LFxuICApOiB2b2lkO1xuXG4gIC8qKlxuICAgKiBUaGUgYWdncmVnYXRlIHZhbHVlIG9mIHRoZSBgRm9ybVJlY29yZGAsIGluY2x1ZGluZyBhbnkgZGlzYWJsZWQgY29udHJvbHMuXG4gICAqXG4gICAqIFNlZSBgRm9ybUdyb3VwI2dldFJhd1ZhbHVlYCBmb3IgYWRkaXRpb25hbCBpbmZvcm1hdGlvbi5cbiAgICovXG4gIGdldFJhd1ZhbHVlKCk6IHtba2V5OiBzdHJpbmddOiDJtVJhd1ZhbHVlPFRDb250cm9sPn07XG59XG5cbi8qKlxuICogQGRlc2NyaXB0aW9uXG4gKiBBc3NlcnRzIHRoYXQgdGhlIGdpdmVuIGNvbnRyb2wgaXMgYW4gaW5zdGFuY2Ugb2YgYEZvcm1SZWNvcmRgXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY29uc3QgaXNGb3JtUmVjb3JkID0gKGNvbnRyb2w6IHVua25vd24pOiBjb250cm9sIGlzIEZvcm1SZWNvcmQgPT5cbiAgY29udHJvbCBpbnN0YW5jZW9mIEZvcm1SZWNvcmQ7XG4iXX0=