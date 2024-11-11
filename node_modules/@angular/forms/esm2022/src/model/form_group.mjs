/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybV9ncm91cC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2Zvcm1zL3NyYy9tb2RlbC9mb3JtX2dyb3VwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQU1ILE9BQU8sRUFDTCxlQUFlLEVBRWYsc0JBQXNCLEVBQ3RCLG9CQUFvQixFQUNwQixtQkFBbUIsRUFDbkIsY0FBYyxHQUlmLE1BQU0sa0JBQWtCLENBQUM7QUF1QzFCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBZ0hHO0FBQ0gsTUFBTSxPQUFPLFNBRVgsU0FBUSxlQUdUO0lBQ0M7Ozs7Ozs7Ozs7OztPQVlHO0lBQ0gsWUFDRSxRQUFrQixFQUNsQixlQUE2RSxFQUM3RSxjQUE2RDtRQUU3RCxLQUFLLENBQUMsY0FBYyxDQUFDLGVBQWUsQ0FBQyxFQUFFLG1CQUFtQixDQUFDLGNBQWMsRUFBRSxlQUFlLENBQUMsQ0FBQyxDQUFDO1FBQzdGLENBQUMsT0FBTyxTQUFTLEtBQUssV0FBVyxJQUFJLFNBQVMsQ0FBQyxJQUFJLHlCQUF5QixDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3ZGLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBQ3hCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUN6QyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDdEIsSUFBSSxDQUFDLHNCQUFzQixDQUFDO1lBQzFCLFFBQVEsRUFBRSxJQUFJO1lBQ2QsMEZBQTBGO1lBQzFGLDZGQUE2RjtZQUM3RixxRkFBcUY7WUFDckYsU0FBUyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FB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U0FBUyx5QkFBeUIsQ0FBVyxRQUU1QztJQUNDLE1BQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDN0UsSUFBSSxXQUFXLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO1FBQzNCLDZEQUE2RDtRQUM3RCxPQUFPLENBQUMsSUFBSSxDQUNWLHFFQUFxRSxXQUFXLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQzlGLENBQUM7SUFDSixDQUFDO0FBQ0gsQ0FBQztBQXFCRCxNQUFNLENBQUMsTUFBTSxnQkFBZ0IsR0FBeUIsU0FBUyxDQUFDO0FBRWhFOzs7OztHQUtHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sV0FBVyxHQUFHLENBQUMsT0FBZ0IsRUFBd0IsRUFBRSxDQUFDLE9BQU8sWUFBWSxTQUFTLENBQUM7QUFFcEc7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQWtCRztBQUNILE1BQU0sT0FBTyxVQUErRCxTQUFRLFNBRWxGO0NBQUc7QUF5Rkw7Ozs7O0dBS0c7QUFDSCxNQUFNLENBQUMsTUFBTSxZQUFZLEdBQUcsQ0FBQyxPQUFnQixFQUF5QixFQUFFLENBQ3RFLE9BQU8sWUFBWSxVQUFVLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbmltcG9ydCB7ybVXcml0YWJsZSBhcyBXcml0YWJsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7QXN5bmNWYWxpZGF0b3JGbiwgVmFsaWRhdG9yRm59IGZyb20gJy4uL2RpcmVjdGl2ZXMvdmFsaWRhdG9ycyc7XG5cbmltcG9ydCB7XG4gIEFic3RyYWN0Q29udHJvbCxcbiAgQWJzdHJhY3RDb250cm9sT3B0aW9ucyxcbiAgYXNzZXJ0QWxsVmFsdWVzUHJlc2VudCxcbiAgYXNzZXJ0Q29udHJvbFByZXNlbnQsXG4gIHBpY2tBc3luY1ZhbGlkYXRvcnMsXG4gIHBpY2tWYWxpZGF0b3JzLFxuICDJtVJhd1ZhbHVlLFxuICDJtVR5cGVkT3JVbnR5cGVkLFxuICDJtVZhbHVlLFxufSBmcm9tICcuL2Fic3RyYWN0X21vZGVsJztcblxuLyoqXG4gKiBGb3JtR3JvdXBWYWx1ZSBleHRyYWN0cyB0aGUgdHlwZSBvZiBgLnZhbHVlYCBmcm9tIGEgRm9ybUdyb3VwJ3MgaW5uZXIgb2JqZWN0IHR5cGUuIFRoZSB1bnR5cGVkXG4gKiBjYXNlIGZhbGxzIGJhY2sgdG8ge1trZXk6IHN0cmluZ106IGFueX0uXG4gKlxuICogQW5ndWxhciB1c2VzIHRoaXMgdHlwZSBpbnRlcm5hbGx5IHRvIHN1cHBvcnQgVHlwZWQgRm9ybXM7IGRvIG5vdCB1c2UgaXQgZGlyZWN0bHkuXG4gKlxuICogRm9yIGludGVybmFsIHVzZSBvbmx5LlxuICovXG5leHBvcnQgdHlwZSDJtUZvcm1Hcm91cFZhbHVlPFQgZXh0ZW5kcyB7W0sgaW4ga2V5b2YgVF0/OiBBYnN0cmFjdENvbnRyb2w8YW55Pn0+ID0gybVUeXBlZE9yVW50eXBlZDxcbiAgVCxcbiAgUGFydGlhbDx7W0sgaW4ga2V5b2YgVF06IMm1VmFsdWU8VFtLXT59PixcbiAge1trZXk6IHN0cmluZ106IGFueX1cbj47XG5cbi8qKlxuICogRm9ybUdyb3VwUmF3VmFsdWUgZXh0cmFjdHMgdGhlIHR5cGUgb2YgYC5nZXRSYXdWYWx1ZSgpYCBmcm9tIGEgRm9ybUdyb3VwJ3MgaW5uZXIgb2JqZWN0IHR5cGUuIFRoZVxuICogdW50eXBlZCBjYXNlIGZhbGxzIGJhY2sgdG8ge1trZXk6IHN0cmluZ106IGFueX0uXG4gKlxuICogQW5ndWxhciB1c2VzIHRoaXMgdHlwZSBpbnRlcm5hbGx5IHRvIHN1cHBvcnQgVHlwZWQgRm9ybXM7IGRvIG5vdCB1c2UgaXQgZGlyZWN0bHkuXG4gKlxuICogRm9yIGludGVybmFsIHVzZSBvbmx5LlxuICovXG5leHBvcnQgdHlwZSDJtUZvcm1Hcm91cFJhd1ZhbHVlPFQgZXh0ZW5kcyB7W0sgaW4ga2V5b2YgVF0/OiBBYnN0cmFjdENvbnRyb2w8YW55Pn0+ID0gybVUeXBlZE9yVW50eXBlZDxcbiAgVCxcbiAge1tLIGluIGtleW9mIFRdOiDJtVJhd1ZhbHVlPFRbS10+fSxcbiAge1trZXk6IHN0cmluZ106IGFueX1cbj47XG5cbi8qKlxuICogT3B0aW9uYWxLZXlzIHJldHVybnMgdGhlIHVuaW9uIG9mIGFsbCBvcHRpb25hbCBrZXlzIGluIHRoZSBvYmplY3QuXG4gKlxuICogQW5ndWxhciB1c2VzIHRoaXMgdHlwZSBpbnRlcm5hbGx5IHRvIHN1cHBvcnQgVHlwZWQgRm9ybXM7IGRvIG5vdCB1c2UgaXQgZGlyZWN0bHkuXG4gKi9cbmV4cG9ydCB0eXBlIMm1T3B0aW9uYWxLZXlzPFQ+ID0ge1xuICBbSyBpbiBrZXlvZiBUXS0/OiB1bmRlZmluZWQgZXh0ZW5kcyBUW0tdID8gSyA6IG5ldmVyO1xufVtrZXlvZiBUXTtcblxuLyoqXG4gKiBUcmFja3MgdGhlIHZhbHVlIGFuZCB2YWxpZGl0eSBzdGF0ZSBvZiBhIGdyb3VwIG9mIGBGb3JtQ29udHJvbGAgaW5zdGFuY2VzLlxuICpcbiAqIEEgYEZvcm1Hcm91cGAgYWdncmVnYXRlcyB0aGUgdmFsdWVzIG9mIGVhY2ggY2hpbGQgYEZvcm1Db250cm9sYCBpbnRvIG9uZSBvYmplY3QsXG4gKiB3aXRoIGVhY2ggY29udHJvbCBuYW1lIGFzIHRoZSBrZXkuICBJdCBjYWxjdWxhdGVzIGl0cyBzdGF0dXMgYnkgcmVkdWNpbmcgdGhlIHN0YXR1cyB2YWx1ZXNcbiAqIG9mIGl0cyBjaGlsZHJlbi4gRm9yIGV4YW1wbGUsIGlmIG9uZSBvZiB0aGUgY29udHJvbHMgaW4gYSBncm91cCBpcyBpbnZhbGlkLCB0aGUgZW50aXJlXG4gKiBncm91cCBiZWNvbWVzIGludmFsaWQuXG4gKlxuICogYEZvcm1Hcm91cGAgaXMgb25lIG9mIHRoZSBmb3VyIGZ1bmRhbWVudGFsIGJ1aWxkaW5nIGJsb2NrcyB1c2VkIHRvIGRlZmluZSBmb3JtcyBpbiBBbmd1bGFyLFxuICogYWxvbmcgd2l0aCBgRm9ybUNvbnRyb2xgLCBgRm9ybUFycmF5YCwgYW5kIGBGb3JtUmVjb3JkYC5cbiAqXG4gKiBXaGVuIGluc3RhbnRpYXRpbmcgYSBgRm9ybUdyb3VwYCwgcGFzcyBpbiBhIGNvbGxlY3Rpb24gb2YgY2hpbGQgY29udHJvbHMgYXMgdGhlIGZpcnN0XG4gKiBhcmd1bWVudC4gVGhlIGtleSBmb3IgZWFjaCBjaGlsZCByZWdpc3RlcnMgdGhlIG5hbWUgZm9yIHRoZSBjb250cm9sLlxuICpcbiAqIGBGb3JtR3JvdXBgIGlzIGludGVuZGVkIGZvciB1c2UgY2FzZXMgd2hlcmUgdGhlIGtleXMgYXJlIGtub3duIGFoZWFkIG9mIHRpbWUuXG4gKiBJZiB5b3UgbmVlZCB0byBkeW5hbWljYWxseSBhZGQgYW5kIHJlbW92ZSBjb250cm9scywgdXNlIHtAbGluayBGb3JtUmVjb3JkfSBpbnN0ZWFkLlxuICpcbiAqIGBGb3JtR3JvdXBgIGFjY2VwdHMgYW4gb3B0aW9uYWwgdHlwZSBwYXJhbWV0ZXIgYFRDb250cm9sYCwgd2hpY2ggaXMgYW4gb2JqZWN0IHR5cGUgd2l0aCBpbm5lclxuICogY29udHJvbCB0eXBlcyBhcyB2YWx1ZXMuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqXG4gKiAjIyMgQ3JlYXRlIGEgZm9ybSBncm91cCB3aXRoIDIgY29udHJvbHNcbiAqXG4gKiBgYGBcbiAqIGNvbnN0IGZvcm0gPSBuZXcgRm9ybUdyb3VwKHtcbiAqICAgZmlyc3Q6IG5ldyBGb3JtQ29udHJvbCgnTmFuY3knLCBWYWxpZGF0b3JzLm1pbkxlbmd0aCgyKSksXG4gKiAgIGxhc3Q6IG5ldyBGb3JtQ29udHJvbCgnRHJldycpLFxuICogfSk7XG4gKlxuICogY29uc29sZS5sb2coZm9ybS52YWx1ZSk7ICAgLy8ge2ZpcnN0OiAnTmFuY3knLCBsYXN0OyAnRHJldyd9XG4gKiBjb25zb2xlLmxvZyhmb3JtLnN0YXR1cyk7ICAvLyAnVkFMSUQnXG4gKiBgYGBcbiAqXG4gKiAjIyMgVGhlIHR5cGUgYXJndW1lbnQsIGFuZCBvcHRpb25hbCBjb250cm9sc1xuICpcbiAqIGBGb3JtR3JvdXBgIGFjY2VwdHMgb25lIGdlbmVyaWMgYXJndW1lbnQsIHdoaWNoIGlzIGFuIG9iamVjdCBjb250YWluaW5nIGl0cyBpbm5lciBjb250cm9scy5cbiAqIFRoaXMgdHlwZSB3aWxsIHVzdWFsbHkgYmUgaW5mZXJyZWQgYXV0b21hdGljYWxseSwgYnV0IHlvdSBjYW4gYWx3YXlzIHNwZWNpZnkgaXQgZXhwbGljaXRseSBpZiB5b3VcbiAqIHdpc2guXG4gKlxuICogSWYgeW91IGhhdmUgY29udHJvbHMgdGhhdCBhcmUgb3B0aW9uYWwgKGkuZS4gdGhleSBjYW4gYmUgcmVtb3ZlZCwgeW91IGNhbiB1c2UgdGhlIGA/YCBpbiB0aGVcbiAqIHR5cGUpOlxuICpcbiAqIGBgYFxuICogY29uc3QgZm9ybSA9IG5ldyBGb3JtR3JvdXA8e1xuICogICBmaXJzdDogRm9ybUNvbnRyb2w8c3RyaW5nfG51bGw+LFxuICogICBtaWRkbGU/OiBGb3JtQ29udHJvbDxzdHJpbmd8bnVsbD4sIC8vIE1pZGRsZSBuYW1lIGlzIG9wdGlvbmFsLlxuICogICBsYXN0OiBGb3JtQ29udHJvbDxzdHJpbmd8bnVsbD4sXG4gKiB9Pih7XG4gKiAgIGZpcnN0OiBuZXcgRm9ybUNvbnRyb2woJ05hbmN5JyksXG4gKiAgIGxhc3Q6IG5ldyBGb3JtQ29udHJvbCgnRHJldycpLFxuICogfSk7XG4gKiBgYGBcbiAqXG4gKiAjIyMgQ3JlYXRlIGEgZm9ybSBncm91cCB3aXRoIGEgZ3JvdXAtbGV2ZWwgdmFsaWRhdG9yXG4gKlxuICogWW91IGluY2x1ZGUgZ3JvdXAtbGV2ZWwgdmFsaWRhdG9ycyBhcyB0aGUgc2Vjb25kIGFyZywgb3IgZ3JvdXAtbGV2ZWwgYXN5bmNcbiAqIHZhbGlkYXRvcnMgYXMgdGhlIHRoaXJkIGFyZy4gVGhlc2UgY29tZSBpbiBoYW5keSB3aGVuIHlvdSB3YW50IHRvIHBlcmZvcm0gdmFsaWRhdGlvblxuICogdGhhdCBjb25zaWRlcnMgdGhlIHZhbHVlIG9mIG1vcmUgdGhhbiBvbmUgY2hpbGQgY29udHJvbC5cbiAqXG4gKiBgYGBcbiAqIGNvbnN0IGZvcm0gPSBuZXcgRm9ybUdyb3VwKHtcbiAqICAgcGFzc3dvcmQ6IG5ldyBGb3JtQ29udHJvbCgnJywgVmFsaWRhdG9ycy5taW5MZW5ndGgoMikpLFxuICogICBwYXNzd29yZENvbmZpcm06IG5ldyBGb3JtQ29udHJvbCgnJywgVmFsaWRhdG9ycy5taW5MZW5ndGgoMikpLFxuICogfSwgcGFzc3dvcmRNYXRjaFZhbGlkYXRvcik7XG4gKlxuICpcbiAqIGZ1bmN0aW9uIHBhc3N3b3JkTWF0Y2hWYWxpZGF0b3IoZzogRm9ybUdyb3VwKSB7XG4gKiAgICByZXR1cm4gZy5nZXQoJ3Bhc3N3b3JkJykudmFsdWUgPT09IGcuZ2V0KCdwYXNzd29yZENvbmZpcm0nKS52YWx1ZVxuICogICAgICAgPyBudWxsIDogeydtaXNtYXRjaCc6IHRydWV9O1xuICogfVxuICogYGBgXG4gKlxuICogTGlrZSBgRm9ybUNvbnRyb2xgIGluc3RhbmNlcywgeW91IGNob29zZSB0byBwYXNzIGluXG4gKiB2YWxpZGF0b3JzIGFuZCBhc3luYyB2YWxpZGF0b3JzIGFzIHBhcnQgb2YgYW4gb3B0aW9ucyBvYmplY3QuXG4gKlxuICogYGBgXG4gKiBjb25zdCBmb3JtID0gbmV3IEZvcm1Hcm91cCh7XG4gKiAgIHBhc3N3b3JkOiBuZXcgRm9ybUNvbnRyb2woJycpXG4gKiAgIHBhc3N3b3JkQ29uZmlybTogbmV3IEZvcm1Db250cm9sKCcnKVxuICogfSwgeyB2YWxpZGF0b3JzOiBwYXNzd29yZE1hdGNoVmFsaWRhdG9yLCBhc3luY1ZhbGlkYXRvcnM6IG90aGVyVmFsaWRhdG9yIH0pO1xuICogYGBgXG4gKlxuICogIyMjIFNldCB0aGUgdXBkYXRlT24gcHJvcGVydHkgZm9yIGFsbCBjb250cm9scyBpbiBhIGZvcm0gZ3JvdXBcbiAqXG4gKiBUaGUgb3B0aW9ucyBvYmplY3QgaXMgdXNlZCB0byBzZXQgYSBkZWZhdWx0IHZhbHVlIGZvciBlYWNoIGNoaWxkXG4gKiBjb250cm9sJ3MgYHVwZGF0ZU9uYCBwcm9wZXJ0eS4gSWYgeW91IHNldCBgdXBkYXRlT25gIHRvIGAnYmx1cidgIGF0IHRoZVxuICogZ3JvdXAgbGV2ZWwsIGFsbCBjaGlsZCBjb250cm9scyBkZWZhdWx0IHRvICdibHVyJywgdW5sZXNzIHRoZSBjaGlsZFxuICogaGFzIGV4cGxpY2l0bHkgc3BlY2lmaWVkIGEgZGlmZmVyZW50IGB1cGRhdGVPbmAgdmFsdWUuXG4gKlxuICogYGBgdHNcbiAqIGNvbnN0IGMgPSBuZXcgRm9ybUdyb3VwKHtcbiAqICAgb25lOiBuZXcgRm9ybUNvbnRyb2woKVxuICogfSwgeyB1cGRhdGVPbjogJ2JsdXInIH0pO1xuICogYGBgXG4gKlxuICogIyMjIFVzaW5nIGEgRm9ybUdyb3VwIHdpdGggb3B0aW9uYWwgY29udHJvbHNcbiAqXG4gKiBJdCBpcyBwb3NzaWJsZSB0byBoYXZlIG9wdGlvbmFsIGNvbnRyb2xzIGluIGEgRm9ybUdyb3VwLiBBbiBvcHRpb25hbCBjb250cm9sIGNhbiBiZSByZW1vdmVkIGxhdGVyXG4gKiB1c2luZyBgcmVtb3ZlQ29udHJvbGAsIGFuZCBjYW4gYmUgb21pdHRlZCB3aGVuIGNhbGxpbmcgYHJlc2V0YC4gT3B0aW9uYWwgY29udHJvbHMgbXVzdCBiZVxuICogZGVjbGFyZWQgb3B0aW9uYWwgaW4gdGhlIGdyb3VwJ3MgdHlwZS5cbiAqXG4gKiBgYGB0c1xuICogY29uc3QgYyA9IG5ldyBGb3JtR3JvdXA8e29uZT86IEZvcm1Db250cm9sPHN0cmluZz59Pih7XG4gKiAgIG9uZTogbmV3IEZvcm1Db250cm9sKCcnKVxuICogfSk7XG4gKiBgYGBcbiAqXG4gKiBOb3RpY2UgdGhhdCBgYy52YWx1ZS5vbmVgIGhhcyB0eXBlIGBzdHJpbmd8bnVsbHx1bmRlZmluZWRgLiBUaGlzIGlzIGJlY2F1c2UgY2FsbGluZyBgYy5yZXNldCh7fSlgXG4gKiB3aXRob3V0IHByb3ZpZGluZyB0aGUgb3B0aW9uYWwga2V5IGBvbmVgIHdpbGwgY2F1c2UgaXQgdG8gYmVjb21lIGBudWxsYC5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjbGFzcyBGb3JtR3JvdXA8XG4gIFRDb250cm9sIGV4dGVuZHMge1tLIGluIGtleW9mIFRDb250cm9sXTogQWJzdHJhY3RDb250cm9sPGFueT59ID0gYW55LFxuPiBleHRlbmRzIEFic3RyYWN0Q29udHJvbDxcbiAgybVUeXBlZE9yVW50eXBlZDxUQ29udHJvbCwgybVGb3JtR3JvdXBWYWx1ZTxUQ29udHJvbD4sIGFueT4sXG4gIMm1VHlwZWRPclVudHlwZWQ8VENvbnRyb2wsIMm1Rm9ybUdyb3VwUmF3VmFsdWU8VENvbnRyb2w+LCBhbnk+XG4+IHtcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgYEZvcm1Hcm91cGAgaW5zdGFuY2UuXG4gICAqXG4gICAqIEBwYXJhbSBjb250cm9scyBBIGNvbGxlY3Rpb24gb2YgY2hpbGQgY29udHJvbHMuIFRoZSBrZXkgZm9yIGVhY2ggY2hpbGQgaXMgdGhlIG5hbWVcbiAgICogdW5kZXIgd2hpY2ggaXQgaXMgcmVnaXN0ZXJlZC5cbiAgICpcbiAgICogQHBhcmFtIHZhbGlkYXRvck9yT3B0cyBBIHN5bmNocm9ub3VzIHZhbGlkYXRvciBmdW5jdGlvbiwgb3IgYW4gYXJyYXkgb2ZcbiAgICogc3VjaCBmdW5jdGlvbnMsIG9yIGFuIGBBYnN0cmFjdENvbnRyb2xPcHRpb25zYCBvYmplY3QgdGhhdCBjb250YWlucyB2YWxpZGF0aW9uIGZ1bmN0aW9uc1xuICAgKiBhbmQgYSB2YWxpZGF0aW9uIHRyaWdnZXIuXG4gICAqXG4gICAqIEBwYXJhbSBhc3luY1ZhbGlkYXRvciBBIHNpbmdsZSBhc3luYyB2YWxpZGF0b3Igb3IgYXJyYXkgb2YgYXN5bmMgdmFsaWRhdG9yIGZ1bmN0aW9uc1xuICAgKlxuICAgKi9cbiAgY29uc3RydWN0b3IoXG4gICAgY29udHJvbHM6IFRDb250cm9sLFxuICAgIHZhbGlkYXRvck9yT3B0cz86IFZhbGlkYXRvckZuIHwgVmFsaWRhdG9yRm5bXSB8IEFic3RyYWN0Q29udHJvbE9wdGlvbnMgfCBudWxsLFxuICAgIGFzeW5jVmFsaWRhdG9yPzogQXN5bmNWYWxpZGF0b3JGbiB8IEFzeW5jVmFsaWRhdG9yRm5bXSB8IG51bGwsXG4gICkge1xuICAgIHN1cGVyKHBpY2tWYWxpZGF0b3JzKHZhbGlkYXRvck9yT3B0cyksIHBpY2tBc3luY1ZhbGlkYXRvcnMoYXN5bmNWYWxpZGF0b3IsIHZhbGlkYXRvck9yT3B0cykpO1xuICAgICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpICYmIHZhbGlkYXRlRm9ybUdyb3VwQ29udHJvbHMoY29udHJvbHMpO1xuICAgIHRoaXMuY29udHJvbHMgPSBjb250cm9scztcbiAgICB0aGlzLl9pbml0T2JzZXJ2YWJsZXMoKTtcbiAgICB0aGlzLl9zZXRVcGRhdGVTdHJhdGVneSh2YWxpZGF0b3JPck9wdHMpO1xuICAgIHRoaXMuX3NldFVwQ29udHJvbHMoKTtcbiAgICB0aGlzLnVwZGF0ZVZhbHVlQW5kVmFsaWRpdHkoe1xuICAgICAgb25seVNlbGY6IHRydWUsXG4gICAgICAvLyBJZiBgYXN5bmNWYWxpZGF0b3JgIGlzIHByZXNlbnQsIGl0IHdpbGwgdHJpZ2dlciBjb250cm9sIHN0YXR1cyBjaGFuZ2UgZnJvbSBgUEVORElOR2AgdG9cbiAgICAgIC8vIGBWQUxJRGAgb3IgYElOVkFMSURgLiBUaGUgc3RhdHVzIHNob3VsZCBiZSBicm9hZGNhc3RlZCB2aWEgdGhlIGBzdGF0dXNDaGFuZ2VzYCBvYnNlcnZhYmxlLFxuICAgICAgLy8gc28gd2Ugc2V0IGBlbWl0RXZlbnRgIHRvIGB0cnVlYCB0byBhbGxvdyB0aGF0IGR1cmluZyB0aGUgY29udHJvbCBjcmVhdGlvbiBwcm9jZXNzLlxuICAgICAgZW1pdEV2ZW50OiAhIXRoaXMuYXN5bmNWYWxpZGF0b3IsXG4gICAgfSk7XG4gIH1cblxuICBwdWJsaWMgY29udHJvbHM6IMm1VHlwZWRPclVudHlwZWQ8VENvbnRyb2wsIFRDb250cm9sLCB7W2tleTogc3RyaW5nXTogQWJzdHJhY3RDb250cm9sPGFueT59PjtcblxuICAvKipcbiAgICogUmVnaXN0ZXJzIGEgY29udHJvbCB3aXRoIHRoZSBncm91cCdzIGxpc3Qgb2YgY29udHJvbHMuIEluIGEgc3Ryb25nbHktdHlwZWQgZ3JvdXAsIHRoZSBjb250cm9sXG4gICAqIG11c3QgYmUgaW4gdGhlIGdyb3VwJ3MgdHlwZSAocG9zc2libHkgYXMgYW4gb3B0aW9uYWwga2V5KS5cbiAgICpcbiAgICogVGhpcyBtZXRob2QgZG9lcyBub3QgdXBkYXRlIHRoZSB2YWx1ZSBvciB2YWxpZGl0eSBvZiB0aGUgY29udHJvbC5cbiAgICogVXNlIHtAbGluayBGb3JtR3JvdXAjYWRkQ29udHJvbCBhZGRDb250cm9sfSBpbnN0ZWFkLlxuICAgKlxuICAgKiBAcGFyYW0gbmFtZSBUaGUgY29udHJvbCBuYW1lIHRvIHJlZ2lzdGVyIGluIHRoZSBjb2xsZWN0aW9uXG4gICAqIEBwYXJhbSBjb250cm9sIFByb3ZpZGVzIHRoZSBjb250cm9sIGZvciB0aGUgZ2l2ZW4gbmFtZVxuICAgKi9cbiAgcmVnaXN0ZXJDb250cm9sPEsgZXh0ZW5kcyBzdHJpbmcgJiBrZXlvZiBUQ29udHJvbD4obmFtZTogSywgY29udHJvbDogVENvbnRyb2xbS10pOiBUQ29udHJvbFtLXTtcbiAgcmVnaXN0ZXJDb250cm9sKFxuICAgIHRoaXM6IEZvcm1Hcm91cDx7W2tleTogc3RyaW5nXTogQWJzdHJhY3RDb250cm9sPGFueT59PixcbiAgICBuYW1lOiBzdHJpbmcsXG4gICAgY29udHJvbDogQWJzdHJhY3RDb250cm9sPGFueT4sXG4gICk6IEFic3RyYWN0Q29udHJvbDxhbnk+O1xuXG4gIHJlZ2lzdGVyQ29udHJvbDxLIGV4dGVuZHMgc3RyaW5nICYga2V5b2YgVENvbnRyb2w+KG5hbWU6IEssIGNvbnRyb2w6IFRDb250cm9sW0tdKTogVENvbnRyb2xbS10ge1xuICAgIGlmICh0aGlzLmNvbnRyb2xzW25hbWVdKSByZXR1cm4gKHRoaXMuY29udHJvbHMgYXMgYW55KVtuYW1lXTtcbiAgICB0aGlzLmNvbnRyb2xzW25hbWVdID0gY29udHJvbDtcbiAgICBjb250cm9sLnNldFBhcmVudCh0aGlzIGFzIEZvcm1Hcm91cCk7XG4gICAgY29udHJvbC5fcmVnaXN0ZXJPbkNvbGxlY3Rpb25DaGFuZ2UodGhpcy5fb25Db2xsZWN0aW9uQ2hhbmdlKTtcbiAgICByZXR1cm4gY29udHJvbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgYSBjb250cm9sIHRvIHRoaXMgZ3JvdXAuIEluIGEgc3Ryb25nbHktdHlwZWQgZ3JvdXAsIHRoZSBjb250cm9sIG11c3QgYmUgaW4gdGhlIGdyb3VwJ3MgdHlwZVxuICAgKiAocG9zc2libHkgYXMgYW4gb3B0aW9uYWwga2V5KS5cbiAgICpcbiAgICogSWYgYSBjb250cm9sIHdpdGggYSBnaXZlbiBuYW1lIGFscmVhZHkgZXhpc3RzLCBpdCB3b3VsZCAqbm90KiBiZSByZXBsYWNlZCB3aXRoIGEgbmV3IG9uZS5cbiAgICogSWYgeW91IHdhbnQgdG8gcmVwbGFjZSBhbiBleGlzdGluZyBjb250cm9sLCB1c2UgdGhlIHtAbGluayBGb3JtR3JvdXAjc2V0Q29udHJvbCBzZXRDb250cm9sfVxuICAgKiBtZXRob2QgaW5zdGVhZC4gVGhpcyBtZXRob2QgYWxzbyB1cGRhdGVzIHRoZSB2YWx1ZSBhbmQgdmFsaWRpdHkgb2YgdGhlIGNvbnRyb2wuXG4gICAqXG4gICAqIEBwYXJhbSBuYW1lIFRoZSBjb250cm9sIG5hbWUgdG8gYWRkIHRvIHRoZSBjb2xsZWN0aW9uXG4gICAqIEBwYXJhbSBjb250cm9sIFByb3ZpZGVzIHRoZSBjb250cm9sIGZvciB0aGUgZ2l2ZW4gbmFtZVxuICAgKiBAcGFyYW0gb3B0aW9ucyBTcGVjaWZpZXMgd2hldGhlciB0aGlzIEZvcm1Hcm91cCBpbnN0YW5jZSBzaG91bGQgZW1pdCBldmVudHMgYWZ0ZXIgYSBuZXdcbiAgICogICAgIGNvbnRyb2wgaXMgYWRkZWQuXG4gICAqICogYGVtaXRFdmVudGA6IFdoZW4gdHJ1ZSBvciBub3Qgc3VwcGxpZWQgKHRoZSBkZWZhdWx0KSwgYm90aCB0aGUgYHN0YXR1c0NoYW5nZXNgIGFuZFxuICAgKiBgdmFsdWVDaGFuZ2VzYCBvYnNlcnZhYmxlcyBlbWl0IGV2ZW50cyB3aXRoIHRoZSBsYXRlc3Qgc3RhdHVzIGFuZCB2YWx1ZSB3aGVuIHRoZSBjb250cm9sIGlzXG4gICAqIGFkZGVkLiBXaGVuIGZhbHNlLCBubyBldmVudHMgYXJlIGVtaXR0ZWQuXG4gICAqL1xuICBhZGRDb250cm9sKFxuICAgIHRoaXM6IEZvcm1Hcm91cDx7W2tleTogc3RyaW5nXTogQWJzdHJhY3RDb250cm9sPGFueT59PixcbiAgICBuYW1lOiBzdHJpbmcsXG4gICAgY29udHJvbDogQWJzdHJhY3RDb250cm9sLFxuICAgIG9wdGlvbnM/OiB7ZW1pdEV2ZW50PzogYm9vbGVhbn0sXG4gICk6IHZvaWQ7XG4gIGFkZENvbnRyb2w8SyBleHRlbmRzIHN0cmluZyAmIGtleW9mIFRDb250cm9sPihcbiAgICBuYW1lOiBLLFxuICAgIGNvbnRyb2w6IFJlcXVpcmVkPFRDb250cm9sPltLXSxcbiAgICBvcHRpb25zPzoge1xuICAgICAgZW1pdEV2ZW50PzogYm9vbGVhbjtcbiAgICB9LFxuICApOiB2b2lkO1xuXG4gIGFkZENvbnRyb2w8SyBleHRlbmRzIHN0cmluZyAmIGtleW9mIFRDb250cm9sPihcbiAgICBuYW1lOiBLLFxuICAgIGNvbnRyb2w6IFJlcXVpcmVkPFRDb250cm9sPltLXSxcbiAgICBvcHRpb25zOiB7XG4gICAgICBlbWl0RXZlbnQ/OiBib29sZWFuO1xuICAgIH0gPSB7fSxcbiAgKTogdm9pZCB7XG4gICAgdGhpcy5yZWdpc3RlckNvbnRyb2wobmFtZSwgY29udHJvbCk7XG4gICAgdGhpcy51cGRhdGVWYWx1ZUFuZFZhbGlkaXR5KHtlbWl0RXZlbnQ6IG9wdGlvbnMuZW1pdEV2ZW50fSk7XG4gICAgdGhpcy5fb25Db2xsZWN0aW9uQ2hhbmdlKCk7XG4gIH1cblxuICByZW1vdmVDb250cm9sKFxuICAgIHRoaXM6IEZvcm1Hcm91cDx7W2tleTogc3RyaW5nXTogQWJzdHJhY3RDb250cm9sPGFueT59PixcbiAgICBuYW1lOiBzdHJpbmcsXG4gICAgb3B0aW9ucz86IHtcbiAgICAgIGVtaXRFdmVudD86IGJvb2xlYW47XG4gICAgfSxcbiAgKTogdm9pZDtcbiAgcmVtb3ZlQ29udHJvbDxTIGV4dGVuZHMgc3RyaW5nPihcbiAgICBuYW1lOiDJtU9wdGlvbmFsS2V5czxUQ29udHJvbD4gJiBTLFxuICAgIG9wdGlvbnM/OiB7XG4gICAgICBlbWl0RXZlbnQ/OiBib29sZWFuO1xuICAgIH0sXG4gICk6IHZvaWQ7XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBhIGNvbnRyb2wgZnJvbSB0aGlzIGdyb3VwLiBJbiBhIHN0cm9uZ2x5LXR5cGVkIGdyb3VwLCByZXF1aXJlZCBjb250cm9scyBjYW5ub3QgYmVcbiAgICogcmVtb3ZlZC5cbiAgICpcbiAgICogVGhpcyBtZXRob2QgYWxzbyB1cGRhdGVzIHRoZSB2YWx1ZSBhbmQgdmFsaWRpdHkgb2YgdGhlIGNvbnRyb2wuXG4gICAqXG4gICAqIEBwYXJhbSBuYW1lIFRoZSBjb250cm9sIG5hbWUgdG8gcmVtb3ZlIGZyb20gdGhlIGNvbGxlY3Rpb25cbiAgICogQHBhcmFtIG9wdGlvbnMgU3BlY2lmaWVzIHdoZXRoZXIgdGhpcyBGb3JtR3JvdXAgaW5zdGFuY2Ugc2hvdWxkIGVtaXQgZXZlbnRzIGFmdGVyIGFcbiAgICogICAgIGNvbnRyb2wgaXMgcmVtb3ZlZC5cbiAgICogKiBgZW1pdEV2ZW50YDogV2hlbiB0cnVlIG9yIG5vdCBzdXBwbGllZCAodGhlIGRlZmF1bHQpLCBib3RoIHRoZSBgc3RhdHVzQ2hhbmdlc2AgYW5kXG4gICAqIGB2YWx1ZUNoYW5nZXNgIG9ic2VydmFibGVzIGVtaXQgZXZlbnRzIHdpdGggdGhlIGxhdGVzdCBzdGF0dXMgYW5kIHZhbHVlIHdoZW4gdGhlIGNvbnRyb2wgaXNcbiAgICogcmVtb3ZlZC4gV2hlbiBmYWxzZSwgbm8gZXZlbnRzIGFyZSBlbWl0dGVkLlxuICAgKi9cbiAgcmVtb3ZlQ29udHJvbChuYW1lOiBzdHJpbmcsIG9wdGlvbnM6IHtlbWl0RXZlbnQ/OiBib29sZWFufSA9IHt9KTogdm9pZCB7XG4gICAgaWYgKCh0aGlzLmNvbnRyb2xzIGFzIGFueSlbbmFtZV0pXG4gICAgICAodGhpcy5jb250cm9scyBhcyBhbnkpW25hbWVdLl9yZWdpc3Rlck9uQ29sbGVjdGlvbkNoYW5nZSgoKSA9PiB7fSk7XG4gICAgZGVsZXRlICh0aGlzLmNvbnRyb2xzIGFzIGFueSlbbmFtZV07XG4gICAgdGhpcy51cGRhdGVWYWx1ZUFuZFZhbGlkaXR5KHtlbWl0RXZlbnQ6IG9wdGlvbnMuZW1pdEV2ZW50fSk7XG4gICAgdGhpcy5fb25Db2xsZWN0aW9uQ2hhbmdlKCk7XG4gIH1cblxuICAvKipcbiAgICogUmVwbGFjZSBhbiBleGlzdGluZyBjb250cm9sLiBJbiBhIHN0cm9uZ2x5LXR5cGVkIGdyb3VwLCB0aGUgY29udHJvbCBtdXN0IGJlIGluIHRoZSBncm91cCdzIHR5cGVcbiAgICogKHBvc3NpYmx5IGFzIGFuIG9wdGlvbmFsIGtleSkuXG4gICAqXG4gICAqIElmIGEgY29udHJvbCB3aXRoIGEgZ2l2ZW4gbmFtZSBkb2VzIG5vdCBleGlzdCBpbiB0aGlzIGBGb3JtR3JvdXBgLCBpdCB3aWxsIGJlIGFkZGVkLlxuICAgKlxuICAgKiBAcGFyYW0gbmFtZSBUaGUgY29udHJvbCBuYW1lIHRvIHJlcGxhY2UgaW4gdGhlIGNvbGxlY3Rpb25cbiAgICogQHBhcmFtIGNvbnRyb2wgUHJvdmlkZXMgdGhlIGNvbnRyb2wgZm9yIHRoZSBnaXZlbiBuYW1lXG4gICAqIEBwYXJhbSBvcHRpb25zIFNwZWNpZmllcyB3aGV0aGVyIHRoaXMgRm9ybUdyb3VwIGluc3RhbmNlIHNob3VsZCBlbWl0IGV2ZW50cyBhZnRlciBhblxuICAgKiAgICAgZXhpc3RpbmcgY29udHJvbCBpcyByZXBsYWNlZC5cbiAgICogKiBgZW1pdEV2ZW50YDogV2hlbiB0cnVlIG9yIG5vdCBzdXBwbGllZCAodGhlIGRlZmF1bHQpLCBib3RoIHRoZSBgc3RhdHVzQ2hhbmdlc2AgYW5kXG4gICAqIGB2YWx1ZUNoYW5nZXNgIG9ic2VydmFibGVzIGVtaXQgZXZlbnRzIHdpdGggdGhlIGxhdGVzdCBzdGF0dXMgYW5kIHZhbHVlIHdoZW4gdGhlIGNvbnRyb2wgaXNcbiAgICogcmVwbGFjZWQgd2l0aCBhIG5ldyBvbmUuIFdoZW4gZmFsc2UsIG5vIGV2ZW50cyBhcmUgZW1pdHRlZC5cbiAgICovXG4gIHNldENvbnRyb2w8SyBleHRlbmRzIHN0cmluZyAmIGtleW9mIFRDb250cm9sPihcbiAgICBuYW1lOiBLLFxuICAgIGNvbnRyb2w6IFRDb250cm9sW0tdLFxuICAgIG9wdGlvbnM/OiB7XG4gICAgICBlbWl0RXZlbnQ/OiBib29sZWFuO1xuICAgIH0sXG4gICk6IHZvaWQ7XG4gIHNldENvbnRyb2woXG4gICAgdGhpczogRm9ybUdyb3VwPHtba2V5OiBzdHJpbmddOiBBYnN0cmFjdENvbnRyb2w8YW55Pn0+LFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICBjb250cm9sOiBBYnN0cmFjdENvbnRyb2wsXG4gICAgb3B0aW9ucz86IHtlbWl0RXZlbnQ/OiBib29sZWFufSxcbiAgKTogdm9pZDtcblxuICBzZXRDb250cm9sPEsgZXh0ZW5kcyBzdHJpbmcgJiBrZXlvZiBUQ29udHJvbD4oXG4gICAgbmFtZTogSyxcbiAgICBjb250cm9sOiBUQ29udHJvbFtLXSxcbiAgICBvcHRpb25zOiB7XG4gICAgICBlbWl0RXZlbnQ/OiBib29sZWFuO1xuICAgIH0gPSB7fSxcbiAgKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuY29udHJvbHNbbmFtZV0pIHRoaXMuY29udHJvbHNbbmFtZV0uX3JlZ2lzdGVyT25Db2xsZWN0aW9uQ2hhbmdlKCgpID0+IHt9KTtcbiAgICBkZWxldGUgdGhpcy5jb250cm9sc1tuYW1lXTtcbiAgICBpZiAoY29udHJvbCkgdGhpcy5yZWdpc3RlckNvbnRyb2wobmFtZSwgY29udHJvbCk7XG4gICAgdGhpcy51cGRhdGVWYWx1ZUFuZFZhbGlkaXR5KHtlbWl0RXZlbnQ6IG9wdGlvbnMuZW1pdEV2ZW50fSk7XG4gICAgdGhpcy5fb25Db2xsZWN0aW9uQ2hhbmdlKCk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgd2hldGhlciB0aGVyZSBpcyBhbiBlbmFibGVkIGNvbnRyb2wgd2l0aCB0aGUgZ2l2ZW4gbmFtZSBpbiB0aGUgZ3JvdXAuXG4gICAqXG4gICAqIFJlcG9ydHMgZmFsc2UgZm9yIGRpc2FibGVkIGNvbnRyb2xzLiBJZiB5b3UnZCBsaWtlIHRvIGNoZWNrIGZvciBleGlzdGVuY2UgaW4gdGhlIGdyb3VwXG4gICAqIG9ubHksIHVzZSB7QGxpbmsgQWJzdHJhY3RDb250cm9sI2dldCBnZXR9IGluc3RlYWQuXG4gICAqXG4gICAqIEBwYXJhbSBjb250cm9sTmFtZSBUaGUgY29udHJvbCBuYW1lIHRvIGNoZWNrIGZvciBleGlzdGVuY2UgaW4gdGhlIGNvbGxlY3Rpb25cbiAgICpcbiAgICogQHJldHVybnMgZmFsc2UgZm9yIGRpc2FibGVkIGNvbnRyb2xzLCB0cnVlIG90aGVyd2lzZS5cbiAgICovXG4gIGNvbnRhaW5zPEsgZXh0ZW5kcyBzdHJpbmc+KGNvbnRyb2xOYW1lOiBLKTogYm9vbGVhbjtcbiAgY29udGFpbnModGhpczogRm9ybUdyb3VwPHtba2V5OiBzdHJpbmddOiBBYnN0cmFjdENvbnRyb2w8YW55Pn0+LCBjb250cm9sTmFtZTogc3RyaW5nKTogYm9vbGVhbjtcblxuICBjb250YWluczxLIGV4dGVuZHMgc3RyaW5nICYga2V5b2YgVENvbnRyb2w+KGNvbnRyb2xOYW1lOiBLKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuY29udHJvbHMuaGFzT3duUHJvcGVydHkoY29udHJvbE5hbWUpICYmIHRoaXMuY29udHJvbHNbY29udHJvbE5hbWVdLmVuYWJsZWQ7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgdmFsdWUgb2YgdGhlIGBGb3JtR3JvdXBgLiBJdCBhY2NlcHRzIGFuIG9iamVjdCB0aGF0IG1hdGNoZXNcbiAgICogdGhlIHN0cnVjdHVyZSBvZiB0aGUgZ3JvdXAsIHdpdGggY29udHJvbCBuYW1lcyBhcyBrZXlzLlxuICAgKlxuICAgKiBAdXNhZ2VOb3Rlc1xuICAgKiAjIyMgU2V0IHRoZSBjb21wbGV0ZSB2YWx1ZSBmb3IgdGhlIGZvcm0gZ3JvdXBcbiAgICpcbiAgICogYGBgXG4gICAqIGNvbnN0IGZvcm0gPSBuZXcgRm9ybUdyb3VwKHtcbiAgICogICBmaXJzdDogbmV3IEZvcm1Db250cm9sKCksXG4gICAqICAgbGFzdDogbmV3IEZvcm1Db250cm9sKClcbiAgICogfSk7XG4gICAqXG4gICAqIGNvbnNvbGUubG9nKGZvcm0udmFsdWUpOyAgIC8vIHtmaXJzdDogbnVsbCwgbGFzdDogbnVsbH1cbiAgICpcbiAgICogZm9ybS5zZXRWYWx1ZSh7Zmlyc3Q6ICdOYW5jeScsIGxhc3Q6ICdEcmV3J30pO1xuICAgKiBjb25zb2xlLmxvZyhmb3JtLnZhbHVlKTsgICAvLyB7Zmlyc3Q6ICdOYW5jeScsIGxhc3Q6ICdEcmV3J31cbiAgICogYGBgXG4gICAqXG4gICAqIEB0aHJvd3MgV2hlbiBzdHJpY3QgY2hlY2tzIGZhaWwsIHN1Y2ggYXMgc2V0dGluZyB0aGUgdmFsdWUgb2YgYSBjb250cm9sXG4gICAqIHRoYXQgZG9lc24ndCBleGlzdCBvciBpZiB5b3UgZXhjbHVkZSBhIHZhbHVlIG9mIGEgY29udHJvbCB0aGF0IGRvZXMgZXhpc3QuXG4gICAqXG4gICAqIEBwYXJhbSB2YWx1ZSBUaGUgbmV3IHZhbHVlIGZvciB0aGUgY29udHJvbCB0aGF0IG1hdGNoZXMgdGhlIHN0cnVjdHVyZSBvZiB0aGUgZ3JvdXAuXG4gICAqIEBwYXJhbSBvcHRpb25zIENvbmZpZ3VyYXRpb24gb3B0aW9ucyB0aGF0IGRldGVybWluZSBob3cgdGhlIGNvbnRyb2wgcHJvcGFnYXRlcyBjaGFuZ2VzXG4gICAqIGFuZCBlbWl0cyBldmVudHMgYWZ0ZXIgdGhlIHZhbHVlIGNoYW5nZXMuXG4gICAqIFRoZSBjb25maWd1cmF0aW9uIG9wdGlvbnMgYXJlIHBhc3NlZCB0byB0aGUge0BsaW5rIEFic3RyYWN0Q29udHJvbCN1cGRhdGVWYWx1ZUFuZFZhbGlkaXR5XG4gICAqIHVwZGF0ZVZhbHVlQW5kVmFsaWRpdHl9IG1ldGhvZC5cbiAgICpcbiAgICogKiBgb25seVNlbGZgOiBXaGVuIHRydWUsIGVhY2ggY2hhbmdlIG9ubHkgYWZmZWN0cyB0aGlzIGNvbnRyb2wsIGFuZCBub3QgaXRzIHBhcmVudC4gRGVmYXVsdCBpc1xuICAgKiBmYWxzZS5cbiAgICogKiBgZW1pdEV2ZW50YDogV2hlbiB0cnVlIG9yIG5vdCBzdXBwbGllZCAodGhlIGRlZmF1bHQpLCBib3RoIHRoZSBgc3RhdHVzQ2hhbmdlc2AgYW5kXG4gICAqIGB2YWx1ZUNoYW5nZXNgXG4gICAqIG9ic2VydmFibGVzIGVtaXQgZXZlbnRzIHdpdGggdGhlIGxhdGVzdCBzdGF0dXMgYW5kIHZhbHVlIHdoZW4gdGhlIGNvbnRyb2wgdmFsdWUgaXMgdXBkYXRlZC5cbiAgICogV2hlbiBmYWxzZSwgbm8gZXZlbnRzIGFyZSBlbWl0dGVkLlxuICAgKi9cbiAgb3ZlcnJpZGUgc2V0VmFsdWUoXG4gICAgdmFsdWU6IMm1Rm9ybUdyb3VwUmF3VmFsdWU8VENvbnRyb2w+LFxuICAgIG9wdGlvbnM6IHtcbiAgICAgIG9ubHlTZWxmPzogYm9vbGVhbjtcbiAgICAgIGVtaXRFdmVudD86IGJvb2xlYW47XG4gICAgfSA9IHt9LFxuICApOiB2b2lkIHtcbiAgICBhc3NlcnRBbGxWYWx1ZXNQcmVzZW50KHRoaXMsIHRydWUsIHZhbHVlKTtcbiAgICAoT2JqZWN0LmtleXModmFsdWUpIGFzIEFycmF5PGtleW9mIFRDb250cm9sPikuZm9yRWFjaCgobmFtZSkgPT4ge1xuICAgICAgYXNzZXJ0Q29udHJvbFByZXNlbnQodGhpcywgdHJ1ZSwgbmFtZSBhcyBhbnkpO1xuICAgICAgKHRoaXMuY29udHJvbHMgYXMgYW55KVtuYW1lXS5zZXRWYWx1ZSgodmFsdWUgYXMgYW55KVtuYW1lXSwge1xuICAgICAgICBvbmx5U2VsZjogdHJ1ZSxcbiAgICAgICAgZW1pdEV2ZW50OiBvcHRpb25zLmVtaXRFdmVudCxcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIHRoaXMudXBkYXRlVmFsdWVBbmRWYWxpZGl0eShvcHRpb25zKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQYXRjaGVzIHRoZSB2YWx1ZSBvZiB0aGUgYEZvcm1Hcm91cGAuIEl0IGFjY2VwdHMgYW4gb2JqZWN0IHdpdGggY29udHJvbFxuICAgKiBuYW1lcyBhcyBrZXlzLCBhbmQgZG9lcyBpdHMgYmVzdCB0byBtYXRjaCB0aGUgdmFsdWVzIHRvIHRoZSBjb3JyZWN0IGNvbnRyb2xzXG4gICAqIGluIHRoZSBncm91cC5cbiAgICpcbiAgICogSXQgYWNjZXB0cyBib3RoIHN1cGVyLXNldHMgYW5kIHN1Yi1zZXRzIG9mIHRoZSBncm91cCB3aXRob3V0IHRocm93aW5nIGFuIGVycm9yLlxuICAgKlxuICAgKiBAdXNhZ2VOb3Rlc1xuICAgKiAjIyMgUGF0Y2ggdGhlIHZhbHVlIGZvciBhIGZvcm0gZ3JvdXBcbiAgICpcbiAgICogYGBgXG4gICAqIGNvbnN0IGZvcm0gPSBuZXcgRm9ybUdyb3VwKHtcbiAgICogICAgZmlyc3Q6IG5ldyBGb3JtQ29udHJvbCgpLFxuICAgKiAgICBsYXN0OiBuZXcgRm9ybUNvbnRyb2woKVxuICAgKiB9KTtcbiAgICogY29uc29sZS5sb2coZm9ybS52YWx1ZSk7ICAgLy8ge2ZpcnN0OiBudWxsLCBsYXN0OiBudWxsfVxuICAgKlxuICAgKiBmb3JtLnBhdGNoVmFsdWUoe2ZpcnN0OiAnTmFuY3knfSk7XG4gICAqIGNvbnNvbGUubG9nKGZvcm0udmFsdWUpOyAgIC8vIHtmaXJzdDogJ05hbmN5JywgbGFzdDogbnVsbH1cbiAgICogYGBgXG4gICAqXG4gICAqIEBwYXJhbSB2YWx1ZSBUaGUgb2JqZWN0IHRoYXQgbWF0Y2hlcyB0aGUgc3RydWN0dXJlIG9mIHRoZSBncm91cC5cbiAgICogQHBhcmFtIG9wdGlvbnMgQ29uZmlndXJhdGlvbiBvcHRpb25zIHRoYXQgZGV0ZXJtaW5lIGhvdyB0aGUgY29udHJvbCBwcm9wYWdhdGVzIGNoYW5nZXMgYW5kXG4gICAqIGVtaXRzIGV2ZW50cyBhZnRlciB0aGUgdmFsdWUgaXMgcGF0Y2hlZC5cbiAgICogKiBgb25seVNlbGZgOiBXaGVuIHRydWUsIGVhY2ggY2hhbmdlIG9ubHkgYWZmZWN0cyB0aGlzIGNvbnRyb2wgYW5kIG5vdCBpdHMgcGFyZW50LiBEZWZhdWx0IGlzXG4gICAqIHRydWUuXG4gICAqICogYGVtaXRFdmVudGA6IFdoZW4gdHJ1ZSBvciBub3Qgc3VwcGxpZWQgKHRoZSBkZWZhdWx0KSwgYm90aCB0aGUgYHN0YXR1c0NoYW5nZXNgIGFuZFxuICAgKiBgdmFsdWVDaGFuZ2VzYCBvYnNlcnZhYmxlcyBlbWl0IGV2ZW50cyB3aXRoIHRoZSBsYXRlc3Qgc3RhdHVzIGFuZCB2YWx1ZSB3aGVuIHRoZSBjb250cm9sIHZhbHVlXG4gICAqIGlzIHVwZGF0ZWQuIFdoZW4gZmFsc2UsIG5vIGV2ZW50cyBhcmUgZW1pdHRlZC4gVGhlIGNvbmZpZ3VyYXRpb24gb3B0aW9ucyBhcmUgcGFzc2VkIHRvXG4gICAqIHRoZSB7QGxpbmsgQWJzdHJhY3RDb250cm9sI3VwZGF0ZVZhbHVlQW5kVmFsaWRpdHkgdXBkYXRlVmFsdWVBbmRWYWxpZGl0eX0gbWV0aG9kLlxuICAgKi9cbiAgb3ZlcnJpZGUgcGF0Y2hWYWx1ZShcbiAgICB2YWx1ZTogybVGb3JtR3JvdXBWYWx1ZTxUQ29udHJvbD4sXG4gICAgb3B0aW9uczoge1xuICAgICAgb25seVNlbGY/OiBib29sZWFuO1xuICAgICAgZW1pdEV2ZW50PzogYm9vbGVhbjtcbiAgICB9ID0ge30sXG4gICk6IHZvaWQge1xuICAgIC8vIEV2ZW4gdGhvdWdoIHRoZSBgdmFsdWVgIGFyZ3VtZW50IHR5cGUgZG9lc24ndCBhbGxvdyBgbnVsbGAgYW5kIGB1bmRlZmluZWRgIHZhbHVlcywgdGhlXG4gICAgLy8gYHBhdGNoVmFsdWVgIGNhbiBiZSBjYWxsZWQgcmVjdXJzaXZlbHkgYW5kIGlubmVyIGRhdGEgc3RydWN0dXJlcyBtaWdodCBoYXZlIHRoZXNlIHZhbHVlcywgc29cbiAgICAvLyB3ZSBqdXN0IGlnbm9yZSBzdWNoIGNhc2VzIHdoZW4gYSBmaWVsZCBjb250YWluaW5nIEZvcm1Hcm91cCBpbnN0YW5jZSByZWNlaXZlcyBgbnVsbGAgb3JcbiAgICAvLyBgdW5kZWZpbmVkYCBhcyBhIHZhbHVlLlxuICAgIGlmICh2YWx1ZSA9PSBudWxsIC8qIGJvdGggYG51bGxgIGFuZCBgdW5kZWZpbmVkYCAqLykgcmV0dXJuO1xuICAgIChPYmplY3Qua2V5cyh2YWx1ZSkgYXMgQXJyYXk8a2V5b2YgVENvbnRyb2w+KS5mb3JFYWNoKChuYW1lKSA9PiB7XG4gICAgICAvLyBUaGUgY29tcGlsZXIgY2Fubm90IHNlZSB0aHJvdWdoIHRoZSB1bmluc3RhbnRpYXRlZCBjb25kaXRpb25hbCB0eXBlIG9mIGB0aGlzLmNvbnRyb2xzYCwgc29cbiAgICAgIC8vIGBhcyBhbnlgIGlzIHJlcXVpcmVkLlxuICAgICAgY29uc3QgY29udHJvbCA9ICh0aGlzLmNvbnRyb2xzIGFzIGFueSlbbmFtZV07XG4gICAgICBpZiAoY29udHJvbCkge1xuICAgICAgICBjb250cm9sLnBhdGNoVmFsdWUoXG4gICAgICAgICAgLyogR3VhcmFudGVlZCB0byBiZSBwcmVzZW50LCBkdWUgdG8gdGhlIG91dGVyIGZvckVhY2guICovIHZhbHVlW1xuICAgICAgICAgICAgbmFtZSBhcyBrZXlvZiDJtUZvcm1Hcm91cFZhbHVlPFRDb250cm9sPlxuICAgICAgICAgIF0hLFxuICAgICAgICAgIHtvbmx5U2VsZjogdHJ1ZSwgZW1pdEV2ZW50OiBvcHRpb25zLmVtaXRFdmVudH0sXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgdGhpcy51cGRhdGVWYWx1ZUFuZFZhbGlkaXR5KG9wdGlvbnMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlc2V0cyB0aGUgYEZvcm1Hcm91cGAsIG1hcmtzIGFsbCBkZXNjZW5kYW50cyBgcHJpc3RpbmVgIGFuZCBgdW50b3VjaGVkYCBhbmQgc2V0c1xuICAgKiB0aGUgdmFsdWUgb2YgYWxsIGRlc2NlbmRhbnRzIHRvIHRoZWlyIGRlZmF1bHQgdmFsdWVzLCBvciBudWxsIGlmIG5vIGRlZmF1bHRzIHdlcmUgcHJvdmlkZWQuXG4gICAqXG4gICAqIFlvdSByZXNldCB0byBhIHNwZWNpZmljIGZvcm0gc3RhdGUgYnkgcGFzc2luZyBpbiBhIG1hcCBvZiBzdGF0ZXNcbiAgICogdGhhdCBtYXRjaGVzIHRoZSBzdHJ1Y3R1cmUgb2YgeW91ciBmb3JtLCB3aXRoIGNvbnRyb2wgbmFtZXMgYXMga2V5cy4gVGhlIHN0YXRlXG4gICAqIGlzIGEgc3RhbmRhbG9uZSB2YWx1ZSBvciBhIGZvcm0gc3RhdGUgb2JqZWN0IHdpdGggYm90aCBhIHZhbHVlIGFuZCBhIGRpc2FibGVkXG4gICAqIHN0YXR1cy5cbiAgICpcbiAgICogQHBhcmFtIHZhbHVlIFJlc2V0cyB0aGUgY29udHJvbCB3aXRoIGFuIGluaXRpYWwgdmFsdWUsXG4gICAqIG9yIGFuIG9iamVjdCB0aGF0IGRlZmluZXMgdGhlIGluaXRpYWwgdmFsdWUgYW5kIGRpc2FibGVkIHN0YXRlLlxuICAgKlxuICAgKiBAcGFyYW0gb3B0aW9ucyBDb25maWd1cmF0aW9uIG9wdGlvbnMgdGhhdCBkZXRlcm1pbmUgaG93IHRoZSBjb250cm9sIHByb3BhZ2F0ZXMgY2hhbmdlc1xuICAgKiBhbmQgZW1pdHMgZXZlbnRzIHdoZW4gdGhlIGdyb3VwIGlzIHJlc2V0LlxuICAgKiAqIGBvbmx5U2VsZmA6IFdoZW4gdHJ1ZSwgZWFjaCBjaGFuZ2Ugb25seSBhZmZlY3RzIHRoaXMgY29udHJvbCwgYW5kIG5vdCBpdHMgcGFyZW50LiBEZWZhdWx0IGlzXG4gICAqIGZhbHNlLlxuICAgKiAqIGBlbWl0RXZlbnRgOiBXaGVuIHRydWUgb3Igbm90IHN1cHBsaWVkICh0aGUgZGVmYXVsdCksIGJvdGggdGhlIGBzdGF0dXNDaGFuZ2VzYCBhbmRcbiAgICogYHZhbHVlQ2hhbmdlc2BcbiAgICogb2JzZXJ2YWJsZXMgZW1pdCBldmVudHMgd2l0aCB0aGUgbGF0ZXN0IHN0YXR1cyBhbmQgdmFsdWUgd2hlbiB0aGUgY29udHJvbCBpcyByZXNldC5cbiAgICogV2hlbiBmYWxzZSwgbm8gZXZlbnRzIGFyZSBlbWl0dGVkLlxuICAgKiBUaGUgY29uZmlndXJhdGlvbiBvcHRpb25zIGFyZSBwYXNzZWQgdG8gdGhlIHtAbGluayBBYnN0cmFjdENvbnRyb2wjdXBkYXRlVmFsdWVBbmRWYWxpZGl0eVxuICAgKiB1cGRhdGVWYWx1ZUFuZFZhbGlkaXR5fSBtZXRob2QuXG4gICAqXG4gICAqIEB1c2FnZU5vdGVzXG4gICAqXG4gICAqICMjIyBSZXNldCB0aGUgZm9ybSBncm91cCB2YWx1ZXNcbiAgICpcbiAgICogYGBgdHNcbiAgICogY29uc3QgZm9ybSA9IG5ldyBGb3JtR3JvdXAoe1xuICAgKiAgIGZpcnN0OiBuZXcgRm9ybUNvbnRyb2woJ2ZpcnN0IG5hbWUnKSxcbiAgICogICBsYXN0OiBuZXcgRm9ybUNvbnRyb2woJ2xhc3QgbmFtZScpXG4gICAqIH0pO1xuICAgKlxuICAgKiBjb25zb2xlLmxvZyhmb3JtLnZhbHVlKTsgIC8vIHtmaXJzdDogJ2ZpcnN0IG5hbWUnLCBsYXN0OiAnbGFzdCBuYW1lJ31cbiAgICpcbiAgICogZm9ybS5yZXNldCh7IGZpcnN0OiAnbmFtZScsIGxhc3Q6ICdsYXN0IG5hbWUnIH0pO1xuICAgKlxuICAgKiBjb25zb2xlLmxvZyhmb3JtLnZhbHVlKTsgIC8vIHtmaXJzdDogJ25hbWUnLCBsYXN0OiAnbGFzdCBuYW1lJ31cbiAgICogYGBgXG4gICAqXG4gICAqICMjIyBSZXNldCB0aGUgZm9ybSBncm91cCB2YWx1ZXMgYW5kIGRpc2FibGVkIHN0YXR1c1xuICAgKlxuICAgKiBgYGBcbiAgICogY29uc3QgZm9ybSA9IG5ldyBGb3JtR3JvdXAoe1xuICAgKiAgIGZpcnN0OiBuZXcgRm9ybUNvbnRyb2woJ2ZpcnN0IG5hbWUnKSxcbiAgICogICBsYXN0OiBuZXcgRm9ybUNvbnRyb2woJ2xhc3QgbmFtZScpXG4gICAqIH0pO1xuICAgKlxuICAgKiBmb3JtLnJlc2V0KHtcbiAgICogICBmaXJzdDoge3ZhbHVlOiAnbmFtZScsIGRpc2FibGVkOiB0cnVlfSxcbiAgICogICBsYXN0OiAnbGFzdCdcbiAgICogfSk7XG4gICAqXG4gICAqIGNvbnNvbGUubG9nKGZvcm0udmFsdWUpOyAgLy8ge2xhc3Q6ICdsYXN0J31cbiAgICogY29uc29sZS5sb2coZm9ybS5nZXQoJ2ZpcnN0Jykuc3RhdHVzKTsgIC8vICdESVNBQkxFRCdcbiAgICogYGBgXG4gICAqL1xuICBvdmVycmlkZSByZXNldChcbiAgICB2YWx1ZTogybVUeXBlZE9yVW50eXBlZDxcbiAgICAgIFRDb250cm9sLFxuICAgICAgybVGb3JtR3JvdXBWYWx1ZTxUQ29udHJvbD4sXG4gICAgICBhbnlcbiAgICA+ID0ge30gYXMgdW5rbm93biBhcyDJtUZvcm1Hcm91cFZhbHVlPFRDb250cm9sPixcbiAgICBvcHRpb25zOiB7b25seVNlbGY/OiBib29sZWFuOyBlbWl0RXZlbnQ/OiBib29sZWFufSA9IHt9LFxuICApOiB2b2lkIHtcbiAgICB0aGlzLl9mb3JFYWNoQ2hpbGQoKGNvbnRyb2w6IEFic3RyYWN0Q29udHJvbCwgbmFtZSkgPT4ge1xuICAgICAgY29udHJvbC5yZXNldCh2YWx1ZSA/ICh2YWx1ZSBhcyBhbnkpW25hbWVdIDogbnVsbCwge1xuICAgICAgICBvbmx5U2VsZjogdHJ1ZSxcbiAgICAgICAgZW1pdEV2ZW50OiBvcHRpb25zLmVtaXRFdmVudCxcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIHRoaXMuX3VwZGF0ZVByaXN0aW5lKG9wdGlvbnMsIHRoaXMpO1xuICAgIHRoaXMuX3VwZGF0ZVRvdWNoZWQob3B0aW9ucywgdGhpcyk7XG4gICAgdGhpcy51cGRhdGVWYWx1ZUFuZFZhbGlkaXR5KG9wdGlvbnMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBhZ2dyZWdhdGUgdmFsdWUgb2YgdGhlIGBGb3JtR3JvdXBgLCBpbmNsdWRpbmcgYW55IGRpc2FibGVkIGNvbnRyb2xzLlxuICAgKlxuICAgKiBSZXRyaWV2ZXMgYWxsIHZhbHVlcyByZWdhcmRsZXNzIG9mIGRpc2FibGVkIHN0YXR1cy5cbiAgICovXG4gIG92ZXJyaWRlIGdldFJhd1ZhbHVlKCk6IMm1VHlwZWRPclVudHlwZWQ8VENvbnRyb2wsIMm1Rm9ybUdyb3VwUmF3VmFsdWU8VENvbnRyb2w+LCBhbnk+IHtcbiAgICByZXR1cm4gdGhpcy5fcmVkdWNlQ2hpbGRyZW4oe30sIChhY2MsIGNvbnRyb2wsIG5hbWUpID0+IHtcbiAgICAgIChhY2MgYXMgYW55KVtuYW1lXSA9IChjb250cm9sIGFzIGFueSkuZ2V0UmF3VmFsdWUoKTtcbiAgICAgIHJldHVybiBhY2M7XG4gICAgfSkgYXMgYW55O1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBvdmVycmlkZSBfc3luY1BlbmRpbmdDb250cm9scygpOiBib29sZWFuIHtcbiAgICBsZXQgc3VidHJlZVVwZGF0ZWQgPSB0aGlzLl9yZWR1Y2VDaGlsZHJlbihmYWxzZSwgKHVwZGF0ZWQ6IGJvb2xlYW4sIGNoaWxkKSA9PiB7XG4gICAgICByZXR1cm4gY2hpbGQuX3N5bmNQZW5kaW5nQ29udHJvbHMoKSA/IHRydWUgOiB1cGRhdGVkO1xuICAgIH0pO1xuICAgIGlmIChzdWJ0cmVlVXBkYXRlZCkgdGhpcy51cGRhdGVWYWx1ZUFuZFZhbGlkaXR5KHtvbmx5U2VsZjogdHJ1ZX0pO1xuICAgIHJldHVybiBzdWJ0cmVlVXBkYXRlZDtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgb3ZlcnJpZGUgX2ZvckVhY2hDaGlsZChjYjogKHY6IGFueSwgazogYW55KSA9PiB2b2lkKTogdm9pZCB7XG4gICAgT2JqZWN0LmtleXModGhpcy5jb250cm9scykuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICAvLyBUaGUgbGlzdCBvZiBjb250cm9scyBjYW4gY2hhbmdlIChmb3IgZXguIGNvbnRyb2xzIG1pZ2h0IGJlIHJlbW92ZWQpIHdoaWxlIHRoZSBsb29wXG4gICAgICAvLyBpcyBydW5uaW5nIChhcyBhIHJlc3VsdCBvZiBpbnZva2luZyBGb3JtcyBBUEkgaW4gYHZhbHVlQ2hhbmdlc2Agc3Vic2NyaXB0aW9uKSwgc28gd2VcbiAgICAgIC8vIGhhdmUgdG8gbnVsbCBjaGVjayBiZWZvcmUgaW52b2tpbmcgdGhlIGNhbGxiYWNrLlxuICAgICAgY29uc3QgY29udHJvbCA9ICh0aGlzLmNvbnRyb2xzIGFzIGFueSlba2V5XTtcbiAgICAgIGNvbnRyb2wgJiYgY2IoY29udHJvbCwga2V5KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3NldFVwQ29udHJvbHMoKTogdm9pZCB7XG4gICAgdGhpcy5fZm9yRWFjaENoaWxkKChjb250cm9sKSA9PiB7XG4gICAgICBjb250cm9sLnNldFBhcmVudCh0aGlzKTtcbiAgICAgIGNvbnRyb2wuX3JlZ2lzdGVyT25Db2xsZWN0aW9uQ2hhbmdlKHRoaXMuX29uQ29sbGVjdGlvbkNoYW5nZSk7XG4gICAgfSk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIG92ZXJyaWRlIF91cGRhdGVWYWx1ZSgpOiB2b2lkIHtcbiAgICAodGhpcyBhcyBXcml0YWJsZTx0aGlzPikudmFsdWUgPSB0aGlzLl9yZWR1Y2VWYWx1ZSgpIGFzIGFueTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgb3ZlcnJpZGUgX2FueUNvbnRyb2xzKGNvbmRpdGlvbjogKGM6IEFic3RyYWN0Q29udHJvbCkgPT4gYm9vbGVhbik6IGJvb2xlYW4ge1xuICAgIGZvciAoY29uc3QgW2NvbnRyb2xOYW1lLCBjb250cm9sXSBvZiBPYmplY3QuZW50cmllcyh0aGlzLmNvbnRyb2xzKSkge1xuICAgICAgaWYgKHRoaXMuY29udGFpbnMoY29udHJvbE5hbWUgYXMgYW55KSAmJiBjb25kaXRpb24oY29udHJvbCBhcyBhbnkpKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9yZWR1Y2VWYWx1ZSgpOiBQYXJ0aWFsPFRDb250cm9sPiB7XG4gICAgbGV0IGFjYzogUGFydGlhbDxUQ29udHJvbD4gPSB7fTtcbiAgICByZXR1cm4gdGhpcy5fcmVkdWNlQ2hpbGRyZW4oYWNjLCAoYWNjLCBjb250cm9sLCBuYW1lKSA9PiB7XG4gICAgICBpZiAoY29udHJvbC5lbmFibGVkIHx8IHRoaXMuZGlzYWJsZWQpIHtcbiAgICAgICAgYWNjW25hbWVdID0gY29udHJvbC52YWx1ZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBhY2M7XG4gICAgfSk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9yZWR1Y2VDaGlsZHJlbjxULCBLIGV4dGVuZHMga2V5b2YgVENvbnRyb2w+KFxuICAgIGluaXRWYWx1ZTogVCxcbiAgICBmbjogKGFjYzogVCwgY29udHJvbDogVENvbnRyb2xbS10sIG5hbWU6IEspID0+IFQsXG4gICk6IFQge1xuICAgIGxldCByZXMgPSBpbml0VmFsdWU7XG4gICAgdGhpcy5fZm9yRWFjaENoaWxkKChjb250cm9sOiBUQ29udHJvbFtLXSwgbmFtZTogSykgPT4ge1xuICAgICAgcmVzID0gZm4ocmVzLCBjb250cm9sLCBuYW1lKTtcbiAgICB9KTtcbiAgICByZXR1cm4gcmVzO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBvdmVycmlkZSBfYWxsQ29udHJvbHNEaXNhYmxlZCgpOiBib29sZWFuIHtcbiAgICBmb3IgKGNvbnN0IGNvbnRyb2xOYW1lIG9mIE9iamVjdC5rZXlzKHRoaXMuY29udHJvbHMpIGFzIEFycmF5PGtleW9mIFRDb250cm9sPikge1xuICAgICAgaWYgKCh0aGlzLmNvbnRyb2xzIGFzIGFueSlbY29udHJvbE5hbWVdLmVuYWJsZWQpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gT2JqZWN0LmtleXModGhpcy5jb250cm9scykubGVuZ3RoID4gMCB8fCB0aGlzLmRpc2FibGVkO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBvdmVycmlkZSBfZmluZChuYW1lOiBzdHJpbmcgfCBudW1iZXIpOiBBYnN0cmFjdENvbnRyb2wgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5jb250cm9scy5oYXNPd25Qcm9wZXJ0eShuYW1lIGFzIHN0cmluZylcbiAgICAgID8gKHRoaXMuY29udHJvbHMgYXMgYW55KVtuYW1lIGFzIGtleW9mIFRDb250cm9sXVxuICAgICAgOiBudWxsO1xuICB9XG59XG5cbi8qKlxuICogV2lsbCB2YWxpZGF0ZSB0aGF0IG5vbmUgb2YgdGhlIGNvbnRyb2xzIGhhcyBhIGtleSB3aXRoIGEgZG90XG4gKiBUaHJvd3Mgb3RoZXIgd2lzZVxuICovXG5mdW5jdGlvbiB2YWxpZGF0ZUZvcm1Hcm91cENvbnRyb2xzPFRDb250cm9sPihjb250cm9sczoge1xuICBbSyBpbiBrZXlvZiBUQ29udHJvbF06IEFic3RyYWN0Q29udHJvbDxhbnksIGFueT47XG59KSB7XG4gIGNvbnN0IGludmFsaWRLZXlzID0gT2JqZWN0LmtleXMoY29udHJvbHMpLmZpbHRlcigoa2V5KSA9PiBrZXkuaW5jbHVkZXMoJy4nKSk7XG4gIGlmIChpbnZhbGlkS2V5cy5sZW5ndGggPiAwKSB7XG4gICAgLy8gVE9ETzogbWFrZSB0aGlzIGFuIGVycm9yIG9uY2UgdGhlcmUgYXJlIG5vIG1vcmUgdXNlcyBpbiBHM1xuICAgIGNvbnNvbGUud2FybihcbiAgICAgIGBGb3JtR3JvdXAga2V5cyBjYW5ub3QgaW5jbHVkZSBcXGAuXFxgLCBwbGVhc2UgcmVwbGFjZSB0aGUga2V5cyBmb3I6ICR7aW52YWxpZEtleXMuam9pbignLCcpfS5gLFxuICAgICk7XG4gIH1cbn1cblxuaW50ZXJmYWNlIFVudHlwZWRGb3JtR3JvdXBDdG9yIHtcbiAgbmV3IChcbiAgICBjb250cm9sczoge1trZXk6IHN0cmluZ106IEFic3RyYWN0Q29udHJvbH0sXG4gICAgdmFsaWRhdG9yT3JPcHRzPzogVmFsaWRhdG9yRm4gfCBWYWxpZGF0b3JGbltdIHwgQWJzdHJhY3RDb250cm9sT3B0aW9ucyB8IG51bGwsXG4gICAgYXN5bmNWYWxpZGF0b3I/OiBBc3luY1ZhbGlkYXRvckZuIHwgQXN5bmNWYWxpZGF0b3JGbltdIHwgbnVsbCxcbiAgKTogVW50eXBlZEZvcm1Hcm91cDtcblxuICAvKipcbiAgICogVGhlIHByZXNlbmNlIG9mIGFuIGV4cGxpY2l0IGBwcm90b3R5cGVgIHByb3BlcnR5IHByb3ZpZGVzIGJhY2t3YXJkcy1jb21wYXRpYmlsaXR5IGZvciBhcHBzIHRoYXRcbiAgICogbWFudWFsbHkgaW5zcGVjdCB0aGUgcHJvdG90eXBlIGNoYWluLlxuICAgKi9cbiAgcHJvdG90eXBlOiBGb3JtR3JvdXA8YW55Pjtcbn1cblxuLyoqXG4gKiBVbnR5cGVkRm9ybUdyb3VwIGlzIGEgbm9uLXN0cm9uZ2x5LXR5cGVkIHZlcnNpb24gb2YgYEZvcm1Hcm91cGAuXG4gKi9cbmV4cG9ydCB0eXBlIFVudHlwZWRGb3JtR3JvdXAgPSBGb3JtR3JvdXA8YW55PjtcblxuZXhwb3J0IGNvbnN0IFVudHlwZWRGb3JtR3JvdXA6IFVudHlwZWRGb3JtR3JvdXBDdG9yID0gRm9ybUdyb3VwO1xuXG4vKipcbiAqIEBkZXNjcmlwdGlvblxuICogQXNzZXJ0cyB0aGF0IHRoZSBnaXZlbiBjb250cm9sIGlzIGFuIGluc3RhbmNlIG9mIGBGb3JtR3JvdXBgXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY29uc3QgaXNGb3JtR3JvdXAgPSAoY29udHJvbDogdW5rbm93bik6IGNvbnRyb2wgaXMgRm9ybUdyb3VwID0+IGNvbnRyb2wgaW5zdGFuY2VvZiBGb3JtR3JvdXA7XG5cbi8qKlxuICogVHJhY2tzIHRoZSB2YWx1ZSBhbmQgdmFsaWRpdHkgc3RhdGUgb2YgYSBjb2xsZWN0aW9uIG9mIGBGb3JtQ29udHJvbGAgaW5zdGFuY2VzLCBlYWNoIG9mIHdoaWNoIGhhc1xuICogdGhlIHNhbWUgdmFsdWUgdHlwZS5cbiAqXG4gKiBgRm9ybVJlY29yZGAgaXMgdmVyeSBzaW1pbGFyIHRvIHtAbGluayBGb3JtR3JvdXB9LCBleGNlcHQgaXQgY2FuIGJlIHVzZWQgd2l0aCBhIGR5bmFtaWMga2V5cyxcbiAqIHdpdGggY29udHJvbHMgYWRkZWQgYW5kIHJlbW92ZWQgYXMgbmVlZGVkLlxuICpcbiAqIGBGb3JtUmVjb3JkYCBhY2NlcHRzIG9uZSBnZW5lcmljIGFyZ3VtZW50LCB3aGljaCBkZXNjcmliZXMgdGhlIHR5cGUgb2YgdGhlIGNvbnRyb2xzIGl0IGNvbnRhaW5zLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKlxuICogYGBgXG4gKiBsZXQgbnVtYmVycyA9IG5ldyBGb3JtUmVjb3JkKHtiaWxsOiBuZXcgRm9ybUNvbnRyb2woJzQxNS0xMjMtNDU2Jyl9KTtcbiAqIG51bWJlcnMuYWRkQ29udHJvbCgnYm9iJywgbmV3IEZvcm1Db250cm9sKCc0MTUtMjM0LTU2NycpKTtcbiAqIG51bWJlcnMucmVtb3ZlQ29udHJvbCgnYmlsbCcpO1xuICogYGBgXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY2xhc3MgRm9ybVJlY29yZDxUQ29udHJvbCBleHRlbmRzIEFic3RyYWN0Q29udHJvbCA9IEFic3RyYWN0Q29udHJvbD4gZXh0ZW5kcyBGb3JtR3JvdXA8e1xuICBba2V5OiBzdHJpbmddOiBUQ29udHJvbDtcbn0+IHt9XG5cbmV4cG9ydCBpbnRlcmZhY2UgRm9ybVJlY29yZDxUQ29udHJvbD4ge1xuICAvKipcbiAgICogUmVnaXN0ZXJzIGEgY29udHJvbCB3aXRoIHRoZSByZWNvcmRzJ3MgbGlzdCBvZiBjb250cm9scy5cbiAgICpcbiAgICogU2VlIGBGb3JtR3JvdXAjcmVnaXN0ZXJDb250cm9sYCBmb3IgYWRkaXRpb25hbCBpbmZvcm1hdGlvbi5cbiAgICovXG4gIHJlZ2lzdGVyQ29udHJvbChuYW1lOiBzdHJpbmcsIGNvbnRyb2w6IFRDb250cm9sKTogVENvbnRyb2w7XG5cbiAgLyoqXG4gICAqIEFkZCBhIGNvbnRyb2wgdG8gdGhpcyBncm91cC5cbiAgICpcbiAgICogU2VlIGBGb3JtR3JvdXAjYWRkQ29udHJvbGAgZm9yIGFkZGl0aW9uYWwgaW5mb3JtYXRpb24uXG4gICAqL1xuICBhZGRDb250cm9sKG5hbWU6IHN0cmluZywgY29udHJvbDogVENvbnRyb2wsIG9wdGlvbnM/OiB7ZW1pdEV2ZW50PzogYm9vbGVhbn0pOiB2b2lkO1xuXG4gIC8qKlxuICAgKiBSZW1vdmUgYSBjb250cm9sIGZyb20gdGhpcyBncm91cC5cbiAgICpcbiAgICogU2VlIGBGb3JtR3JvdXAjcmVtb3ZlQ29udHJvbGAgZm9yIGFkZGl0aW9uYWwgaW5mb3JtYXRpb24uXG4gICAqL1xuICByZW1vdmVDb250cm9sKG5hbWU6IHN0cmluZywgb3B0aW9ucz86IHtlbWl0RXZlbnQ/OiBib29sZWFufSk6IHZvaWQ7XG5cbiAgLyoqXG4gICAqIFJlcGxhY2UgYW4gZXhpc3RpbmcgY29udHJvbC5cbiAgICpcbiAgICogU2VlIGBGb3JtR3JvdXAjc2V0Q29udHJvbGAgZm9yIGFkZGl0aW9uYWwgaW5mb3JtYXRpb24uXG4gICAqL1xuICBzZXRDb250cm9sKG5hbWU6IHN0cmluZywgY29udHJvbDogVENvbnRyb2wsIG9wdGlvbnM/OiB7ZW1pdEV2ZW50PzogYm9vbGVhbn0pOiB2b2lkO1xuXG4gIC8qKlxuICAgKiBDaGVjayB3aGV0aGVyIHRoZXJlIGlzIGFuIGVuYWJsZWQgY29udHJvbCB3aXRoIHRoZSBnaXZlbiBuYW1lIGluIHRoZSBncm91cC5cbiAgICpcbiAgICogU2VlIGBGb3JtR3JvdXAjY29udGFpbnNgIGZvciBhZGRpdGlvbmFsIGluZm9ybWF0aW9uLlxuICAgKi9cbiAgY29udGFpbnMoY29udHJvbE5hbWU6IHN0cmluZyk6IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHZhbHVlIG9mIHRoZSBgRm9ybVJlY29yZGAuIEl0IGFjY2VwdHMgYW4gb2JqZWN0IHRoYXQgbWF0Y2hlc1xuICAgKiB0aGUgc3RydWN0dXJlIG9mIHRoZSBncm91cCwgd2l0aCBjb250cm9sIG5hbWVzIGFzIGtleXMuXG4gICAqXG4gICAqIFNlZSBgRm9ybUdyb3VwI3NldFZhbHVlYCBmb3IgYWRkaXRpb25hbCBpbmZvcm1hdGlvbi5cbiAgICovXG4gIHNldFZhbHVlKFxuICAgIHZhbHVlOiB7W2tleTogc3RyaW5nXTogybVWYWx1ZTxUQ29udHJvbD59LFxuICAgIG9wdGlvbnM/OiB7XG4gICAgICBvbmx5U2VsZj86IGJvb2xlYW47XG4gICAgICBlbWl0RXZlbnQ/OiBib29sZWFuO1xuICAgIH0sXG4gICk6IHZvaWQ7XG5cbiAgLyoqXG4gICAqIFBhdGNoZXMgdGhlIHZhbHVlIG9mIHRoZSBgRm9ybVJlY29yZGAuIEl0IGFjY2VwdHMgYW4gb2JqZWN0IHdpdGggY29udHJvbFxuICAgKiBuYW1lcyBhcyBrZXlzLCBhbmQgZG9lcyBpdHMgYmVzdCB0byBtYXRjaCB0aGUgdmFsdWVzIHRvIHRoZSBjb3JyZWN0IGNvbnRyb2xzXG4gICAqIGluIHRoZSBncm91cC5cbiAgICpcbiAgICogU2VlIGBGb3JtR3JvdXAjcGF0Y2hWYWx1ZWAgZm9yIGFkZGl0aW9uYWwgaW5mb3JtYXRpb24uXG4gICAqL1xuICBwYXRjaFZhbHVlKFxuICAgIHZhbHVlOiB7W2tleTogc3RyaW5nXTogybVWYWx1ZTxUQ29udHJvbD59LFxuICAgIG9wdGlvbnM/OiB7XG4gICAgICBvbmx5U2VsZj86IGJvb2xlYW47XG4gICAgICBlbWl0RXZlbnQ/OiBib29sZWFuO1xuICAgIH0sXG4gICk6IHZvaWQ7XG5cbiAgLyoqXG4gICAqIFJlc2V0cyB0aGUgYEZvcm1SZWNvcmRgLCBtYXJrcyBhbGwgZGVzY2VuZGFudHMgYHByaXN0aW5lYCBhbmQgYHVudG91Y2hlZGAgYW5kIHNldHNcbiAgICogdGhlIHZhbHVlIG9mIGFsbCBkZXNjZW5kYW50cyB0byBudWxsLlxuICAgKlxuICAgKiBTZWUgYEZvcm1Hcm91cCNyZXNldGAgZm9yIGFkZGl0aW9uYWwgaW5mb3JtYXRpb24uXG4gICAqL1xuICByZXNldChcbiAgICB2YWx1ZT86IHtba2V5OiBzdHJpbmddOiDJtVZhbHVlPFRDb250cm9sPn0sXG4gICAgb3B0aW9ucz86IHtcbiAgICAgIG9ubHlTZWxmPzogYm9vbGVhbjtcbiAgICAgIGVtaXRFdmVudD86IGJvb2xlYW47XG4gICAgfSxcbiAgKTogdm9pZDtcblxuICAvKipcbiAgICogVGhlIGFnZ3JlZ2F0ZSB2YWx1ZSBvZiB0aGUgYEZvcm1SZWNvcmRgLCBpbmNsdWRpbmcgYW55IGRpc2FibGVkIGNvbnRyb2xzLlxuICAgKlxuICAgKiBTZWUgYEZvcm1Hcm91cCNnZXRSYXdWYWx1ZWAgZm9yIGFkZGl0aW9uYWwgaW5mb3JtYXRpb24uXG4gICAqL1xuICBnZXRSYXdWYWx1ZSgpOiB7W2tleTogc3RyaW5nXTogybVSYXdWYWx1ZTxUQ29udHJvbD59O1xufVxuXG4vKipcbiAqIEBkZXNjcmlwdGlvblxuICogQXNzZXJ0cyB0aGF0IHRoZSBnaXZlbiBjb250cm9sIGlzIGFuIGluc3RhbmNlIG9mIGBGb3JtUmVjb3JkYFxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNvbnN0IGlzRm9ybVJlY29yZCA9IChjb250cm9sOiB1bmtub3duKTogY29udHJvbCBpcyBGb3JtUmVjb3JkID0+XG4gIGNvbnRyb2wgaW5zdGFuY2VvZiBGb3JtUmVjb3JkO1xuIl19