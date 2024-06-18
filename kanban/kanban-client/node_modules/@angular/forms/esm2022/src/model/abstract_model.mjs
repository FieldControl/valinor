/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { EventEmitter, ɵRuntimeError as RuntimeError } from '@angular/core';
import { Subject } from 'rxjs';
import { asyncValidatorsDroppedWithOptsWarning, missingControlError, missingControlValueError, noControlsError, } from '../directives/reactive_errors';
import { addValidators, composeAsyncValidators, composeValidators, hasValidator, removeValidators, toObservable, } from '../validators';
/**
 * Reports that a control is valid, meaning that no errors exist in the input value.
 *
 * @see {@link status}
 */
export const VALID = 'VALID';
/**
 * Reports that a control is invalid, meaning that an error exists in the input value.
 *
 * @see {@link status}
 */
export const INVALID = 'INVALID';
/**
 * Reports that a control is pending, meaning that async validation is occurring and
 * errors are not yet available for the input value.
 *
 * @see {@link markAsPending}
 * @see {@link status}
 */
export const PENDING = 'PENDING';
/**
 * Reports that a control is disabled, meaning that the control is exempt from ancestor
 * calculations of validity or value.
 *
 * @see {@link markAsDisabled}
 * @see {@link status}
 */
export const DISABLED = 'DISABLED';
/**
 * Base class for every event sent by `AbstractControl.events()`
 *
 * @publicApi
 */
export class ControlEvent {
}
/**
 * Event fired when the value of a control changes.
 *
 * @publicApi
 */
export class ValueChangeEvent extends ControlEvent {
    constructor(value, source) {
        super();
        this.value = value;
        this.source = source;
    }
}
/**
 * Event fired when the control's pristine state changes (pristine <=> dirty).
 *
 * @publicApi */
export class PristineChangeEvent extends ControlEvent {
    constructor(pristine, source) {
        super();
        this.pristine = pristine;
        this.source = source;
    }
}
/**
 * Event fired when the control's touched status changes (touched <=> untouched).
 *
 * @publicApi
 */
export class TouchedChangeEvent extends ControlEvent {
    constructor(touched, source) {
        super();
        this.touched = touched;
        this.source = source;
    }
}
/**
 * Event fired when the control's status changes.
 *
 * @publicApi
 */
export class StatusChangeEvent extends ControlEvent {
    constructor(status, source) {
        super();
        this.status = status;
        this.source = source;
    }
}
/**
 * Event fired when a form is submitted
 *
 * @publicApi
 */
export class FormSubmittedEvent extends ControlEvent {
    constructor(source) {
        super();
        this.source = source;
    }
}
/**
 * Event fired when a form is reset.
 *
 * @publicApi
 */
export class FormResetEvent extends ControlEvent {
    constructor(source) {
        super();
        this.source = source;
    }
}
/**
 * Gets validators from either an options object or given validators.
 */
export function pickValidators(validatorOrOpts) {
    return (isOptionsObj(validatorOrOpts) ? validatorOrOpts.validators : validatorOrOpts) || null;
}
/**
 * Creates validator function by combining provided validators.
 */
function coerceToValidator(validator) {
    return Array.isArray(validator) ? composeValidators(validator) : validator || null;
}
/**
 * Gets async validators from either an options object or given validators.
 */
export function pickAsyncValidators(asyncValidator, validatorOrOpts) {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
        if (isOptionsObj(validatorOrOpts) && asyncValidator) {
            console.warn(asyncValidatorsDroppedWithOptsWarning);
        }
    }
    return (isOptionsObj(validatorOrOpts) ? validatorOrOpts.asyncValidators : asyncValidator) || null;
}
/**
 * Creates async validator function by combining provided async validators.
 */
function coerceToAsyncValidator(asyncValidator) {
    return Array.isArray(asyncValidator)
        ? composeAsyncValidators(asyncValidator)
        : asyncValidator || null;
}
export function isOptionsObj(validatorOrOpts) {
    return (validatorOrOpts != null &&
        !Array.isArray(validatorOrOpts) &&
        typeof validatorOrOpts === 'object');
}
export function assertControlPresent(parent, isGroup, key) {
    const controls = parent.controls;
    const collection = isGroup ? Object.keys(controls) : controls;
    if (!collection.length) {
        throw new RuntimeError(1000 /* RuntimeErrorCode.NO_CONTROLS */, typeof ngDevMode === 'undefined' || ngDevMode ? noControlsError(isGroup) : '');
    }
    if (!controls[key]) {
        throw new RuntimeError(1001 /* RuntimeErrorCode.MISSING_CONTROL */, typeof ngDevMode === 'undefined' || ngDevMode ? missingControlError(isGroup, key) : '');
    }
}
export function assertAllValuesPresent(control, isGroup, value) {
    control._forEachChild((_, key) => {
        if (value[key] === undefined) {
            throw new RuntimeError(1002 /* RuntimeErrorCode.MISSING_CONTROL_VALUE */, typeof ngDevMode === 'undefined' || ngDevMode ? missingControlValueError(isGroup, key) : '');
        }
    });
}
/**
 * This is the base class for `FormControl`, `FormGroup`, and `FormArray`.
 *
 * It provides some of the shared behavior that all controls and groups of controls have, like
 * running validators, calculating status, and resetting state. It also defines the properties
 * that are shared between all sub-classes, like `value`, `valid`, and `dirty`. It shouldn't be
 * instantiated directly.
 *
 * The first type parameter TValue represents the value type of the control (`control.value`).
 * The optional type parameter TRawValue  represents the raw value type (`control.getRawValue()`).
 *
 * @see [Forms Guide](guide/forms)
 * @see [Reactive Forms Guide](guide/forms/reactive-forms)
 * @see [Dynamic Forms Guide](guide/forms/dynamic-forms)
 *
 * @publicApi
 */
export class AbstractControl {
    /**
     * Initialize the AbstractControl instance.
     *
     * @param validators The function or array of functions that is used to determine the validity of
     *     this control synchronously.
     * @param asyncValidators The function or array of functions that is used to determine validity of
     *     this control asynchronously.
     */
    constructor(validators, asyncValidators) {
        /** @internal */
        this._pendingDirty = false;
        /**
         * Indicates that a control has its own pending asynchronous validation in progress.
         * It also stores if the control should emit events when the validation status changes.
         *
         * @internal
         */
        this._hasOwnPendingAsyncValidator = null;
        /** @internal */
        this._pendingTouched = false;
        /** @internal */
        this._onCollectionChange = () => { };
        this._parent = null;
        /**
         * A control is `pristine` if the user has not yet changed
         * the value in the UI.
         *
         * @returns True if the user has not yet changed the value in the UI; compare `dirty`.
         * Programmatic changes to a control's value do not mark it dirty.
         */
        this.pristine = true;
        /**
         * True if the control is marked as `touched`.
         *
         * A control is marked `touched` once the user has triggered
         * a `blur` event on it.
         */
        this.touched = false;
        /**
         * Exposed as observable, see below.
         *
         * @internal
         */
        this._events = new Subject();
        /**
         * A multicasting observable that emits an event every time the state of the control changes.
         * It emits for value, status, pristine or touched changes.
         *
         * **Note**: On value change, the emit happens right after a value of this control is updated. The
         * value of a parent control (for example if this FormControl is a part of a FormGroup) is updated
         * later, so accessing a value of a parent control (using the `value` property) from the callback
         * of this event might result in getting a value that has not been updated yet. Subscribe to the
         * `events` of the parent control instead.
         * For other event types, the events are emitted after the parent control has been updated.
         *
         */
        this.events = this._events.asObservable();
        /** @internal */
        this._onDisabledChange = [];
        this._assignValidators(validators);
        this._assignAsyncValidators(asyncValidators);
    }
    /**
     * Returns the function that is used to determine the validity of this control synchronously.
     * If multiple validators have been added, this will be a single composed function.
     * See `Validators.compose()` for additional information.
     */
    get validator() {
        return this._composedValidatorFn;
    }
    set validator(validatorFn) {
        this._rawValidators = this._composedValidatorFn = validatorFn;
    }
    /**
     * Returns the function that is used to determine the validity of this control asynchronously.
     * If multiple validators have been added, this will be a single composed function.
     * See `Validators.compose()` for additional information.
     */
    get asyncValidator() {
        return this._composedAsyncValidatorFn;
    }
    set asyncValidator(asyncValidatorFn) {
        this._rawAsyncValidators = this._composedAsyncValidatorFn = asyncValidatorFn;
    }
    /**
     * The parent control.
     */
    get parent() {
        return this._parent;
    }
    /**
     * A control is `valid` when its `status` is `VALID`.
     *
     * @see {@link AbstractControl.status}
     *
     * @returns True if the control has passed all of its validation tests,
     * false otherwise.
     */
    get valid() {
        return this.status === VALID;
    }
    /**
     * A control is `invalid` when its `status` is `INVALID`.
     *
     * @see {@link AbstractControl.status}
     *
     * @returns True if this control has failed one or more of its validation checks,
     * false otherwise.
     */
    get invalid() {
        return this.status === INVALID;
    }
    /**
     * A control is `pending` when its `status` is `PENDING`.
     *
     * @see {@link AbstractControl.status}
     *
     * @returns True if this control is in the process of conducting a validation check,
     * false otherwise.
     */
    get pending() {
        return this.status == PENDING;
    }
    /**
     * A control is `disabled` when its `status` is `DISABLED`.
     *
     * Disabled controls are exempt from validation checks and
     * are not included in the aggregate value of their ancestor
     * controls.
     *
     * @see {@link AbstractControl.status}
     *
     * @returns True if the control is disabled, false otherwise.
     */
    get disabled() {
        return this.status === DISABLED;
    }
    /**
     * A control is `enabled` as long as its `status` is not `DISABLED`.
     *
     * @returns True if the control has any status other than 'DISABLED',
     * false if the status is 'DISABLED'.
     *
     * @see {@link AbstractControl.status}
     *
     */
    get enabled() {
        return this.status !== DISABLED;
    }
    /**
     * A control is `dirty` if the user has changed the value
     * in the UI.
     *
     * @returns True if the user has changed the value of this control in the UI; compare `pristine`.
     * Programmatic changes to a control's value do not mark it dirty.
     */
    get dirty() {
        return !this.pristine;
    }
    /**
     * True if the control has not been marked as touched
     *
     * A control is `untouched` if the user has not yet triggered
     * a `blur` event on it.
     */
    get untouched() {
        return !this.touched;
    }
    /**
     * Reports the update strategy of the `AbstractControl` (meaning
     * the event on which the control updates itself).
     * Possible values: `'change'` | `'blur'` | `'submit'`
     * Default value: `'change'`
     */
    get updateOn() {
        return this._updateOn ? this._updateOn : this.parent ? this.parent.updateOn : 'change';
    }
    /**
     * Sets the synchronous validators that are active on this control.  Calling
     * this overwrites any existing synchronous validators.
     *
     * When you add or remove a validator at run time, you must call
     * `updateValueAndValidity()` for the new validation to take effect.
     *
     * If you want to add a new validator without affecting existing ones, consider
     * using `addValidators()` method instead.
     */
    setValidators(validators) {
        this._assignValidators(validators);
    }
    /**
     * Sets the asynchronous validators that are active on this control. Calling this
     * overwrites any existing asynchronous validators.
     *
     * When you add or remove a validator at run time, you must call
     * `updateValueAndValidity()` for the new validation to take effect.
     *
     * If you want to add a new validator without affecting existing ones, consider
     * using `addAsyncValidators()` method instead.
     */
    setAsyncValidators(validators) {
        this._assignAsyncValidators(validators);
    }
    /**
     * Add a synchronous validator or validators to this control, without affecting other validators.
     *
     * When you add or remove a validator at run time, you must call
     * `updateValueAndValidity()` for the new validation to take effect.
     *
     * Adding a validator that already exists will have no effect. If duplicate validator functions
     * are present in the `validators` array, only the first instance would be added to a form
     * control.
     *
     * @param validators The new validator function or functions to add to this control.
     */
    addValidators(validators) {
        this.setValidators(addValidators(validators, this._rawValidators));
    }
    /**
     * Add an asynchronous validator or validators to this control, without affecting other
     * validators.
     *
     * When you add or remove a validator at run time, you must call
     * `updateValueAndValidity()` for the new validation to take effect.
     *
     * Adding a validator that already exists will have no effect.
     *
     * @param validators The new asynchronous validator function or functions to add to this control.
     */
    addAsyncValidators(validators) {
        this.setAsyncValidators(addValidators(validators, this._rawAsyncValidators));
    }
    /**
     * Remove a synchronous validator from this control, without affecting other validators.
     * Validators are compared by function reference; you must pass a reference to the exact same
     * validator function as the one that was originally set. If a provided validator is not found,
     * it is ignored.
     *
     * @usageNotes
     *
     * ### Reference to a ValidatorFn
     *
     * ```
     * // Reference to the RequiredValidator
     * const ctrl = new FormControl<string | null>('', Validators.required);
     * ctrl.removeValidators(Validators.required);
     *
     * // Reference to anonymous function inside MinValidator
     * const minValidator = Validators.min(3);
     * const ctrl = new FormControl<string | null>('', minValidator);
     * expect(ctrl.hasValidator(minValidator)).toEqual(true)
     * expect(ctrl.hasValidator(Validators.min(3))).toEqual(false)
     *
     * ctrl.removeValidators(minValidator);
     * ```
     *
     * When you add or remove a validator at run time, you must call
     * `updateValueAndValidity()` for the new validation to take effect.
     *
     * @param validators The validator or validators to remove.
     */
    removeValidators(validators) {
        this.setValidators(removeValidators(validators, this._rawValidators));
    }
    /**
     * Remove an asynchronous validator from this control, without affecting other validators.
     * Validators are compared by function reference; you must pass a reference to the exact same
     * validator function as the one that was originally set. If a provided validator is not found, it
     * is ignored.
     *
     * When you add or remove a validator at run time, you must call
     * `updateValueAndValidity()` for the new validation to take effect.
     *
     * @param validators The asynchronous validator or validators to remove.
     */
    removeAsyncValidators(validators) {
        this.setAsyncValidators(removeValidators(validators, this._rawAsyncValidators));
    }
    /**
     * Check whether a synchronous validator function is present on this control. The provided
     * validator must be a reference to the exact same function that was provided.
     *
     * @usageNotes
     *
     * ### Reference to a ValidatorFn
     *
     * ```
     * // Reference to the RequiredValidator
     * const ctrl = new FormControl<number | null>(0, Validators.required);
     * expect(ctrl.hasValidator(Validators.required)).toEqual(true)
     *
     * // Reference to anonymous function inside MinValidator
     * const minValidator = Validators.min(3);
     * const ctrl = new FormControl<number | null>(0, minValidator);
     * expect(ctrl.hasValidator(minValidator)).toEqual(true)
     * expect(ctrl.hasValidator(Validators.min(3))).toEqual(false)
     * ```
     *
     * @param validator The validator to check for presence. Compared by function reference.
     * @returns Whether the provided validator was found on this control.
     */
    hasValidator(validator) {
        return hasValidator(this._rawValidators, validator);
    }
    /**
     * Check whether an asynchronous validator function is present on this control. The provided
     * validator must be a reference to the exact same function that was provided.
     *
     * @param validator The asynchronous validator to check for presence. Compared by function
     *     reference.
     * @returns Whether the provided asynchronous validator was found on this control.
     */
    hasAsyncValidator(validator) {
        return hasValidator(this._rawAsyncValidators, validator);
    }
    /**
     * Empties out the synchronous validator list.
     *
     * When you add or remove a validator at run time, you must call
     * `updateValueAndValidity()` for the new validation to take effect.
     *
     */
    clearValidators() {
        this.validator = null;
    }
    /**
     * Empties out the async validator list.
     *
     * When you add or remove a validator at run time, you must call
     * `updateValueAndValidity()` for the new validation to take effect.
     *
     */
    clearAsyncValidators() {
        this.asyncValidator = null;
    }
    markAsTouched(opts = {}) {
        const changed = this.touched === false;
        this.touched = true;
        const sourceControl = opts.sourceControl ?? this;
        if (this._parent && !opts.onlySelf) {
            this._parent.markAsTouched({ ...opts, sourceControl });
        }
        if (changed && opts.emitEvent !== false) {
            this._events.next(new TouchedChangeEvent(true, sourceControl));
        }
    }
    /**
     * Marks the control and all its descendant controls as `touched`.
     * @see {@link markAsTouched()}
     *
     * @param opts Configuration options that determine how the control propagates changes
     * and emits events after marking is applied.
     * * `emitEvent`: When true or not supplied (the default), the `events`
     * observable emits a `TouchedChangeEvent` with the `touched` property being `true`.
     * When false, no events are emitted.
     */
    markAllAsTouched(opts = {}) {
        this.markAsTouched({ onlySelf: true, emitEvent: opts.emitEvent, sourceControl: this });
        this._forEachChild((control) => control.markAllAsTouched(opts));
    }
    markAsUntouched(opts = {}) {
        const changed = this.touched === true;
        this.touched = false;
        this._pendingTouched = false;
        const sourceControl = opts.sourceControl ?? this;
        this._forEachChild((control) => {
            control.markAsUntouched({ onlySelf: true, emitEvent: opts.emitEvent, sourceControl });
        });
        if (this._parent && !opts.onlySelf) {
            this._parent._updateTouched(opts, sourceControl);
        }
        if (changed && opts.emitEvent !== false) {
            this._events.next(new TouchedChangeEvent(false, sourceControl));
        }
    }
    markAsDirty(opts = {}) {
        const changed = this.pristine === true;
        this.pristine = false;
        const sourceControl = opts.sourceControl ?? this;
        if (this._parent && !opts.onlySelf) {
            this._parent.markAsDirty({ ...opts, sourceControl });
        }
        if (changed && opts.emitEvent !== false) {
            this._events.next(new PristineChangeEvent(false, sourceControl));
        }
    }
    markAsPristine(opts = {}) {
        const changed = this.pristine === false;
        this.pristine = true;
        this._pendingDirty = false;
        const sourceControl = opts.sourceControl ?? this;
        this._forEachChild((control) => {
            /** We don't propagate the source control downwards */
            control.markAsPristine({ onlySelf: true, emitEvent: opts.emitEvent });
        });
        if (this._parent && !opts.onlySelf) {
            this._parent._updatePristine(opts, sourceControl);
        }
        if (changed && opts.emitEvent !== false) {
            this._events.next(new PristineChangeEvent(true, sourceControl));
        }
    }
    markAsPending(opts = {}) {
        this.status = PENDING;
        const sourceControl = opts.sourceControl ?? this;
        if (opts.emitEvent !== false) {
            this._events.next(new StatusChangeEvent(this.status, sourceControl));
            this.statusChanges.emit(this.status);
        }
        if (this._parent && !opts.onlySelf) {
            this._parent.markAsPending({ ...opts, sourceControl });
        }
    }
    disable(opts = {}) {
        // If parent has been marked artificially dirty we don't want to re-calculate the
        // parent's dirtiness based on the children.
        const skipPristineCheck = this._parentMarkedDirty(opts.onlySelf);
        this.status = DISABLED;
        this.errors = null;
        this._forEachChild((control) => {
            /** We don't propagate the source control downwards */
            control.disable({ ...opts, onlySelf: true });
        });
        this._updateValue();
        const sourceControl = opts.sourceControl ?? this;
        if (opts.emitEvent !== false) {
            this._events.next(new ValueChangeEvent(this.value, sourceControl));
            this._events.next(new StatusChangeEvent(this.status, sourceControl));
            this.valueChanges.emit(this.value);
            this.statusChanges.emit(this.status);
        }
        this._updateAncestors({ ...opts, skipPristineCheck }, this);
        this._onDisabledChange.forEach((changeFn) => changeFn(true));
    }
    /**
     * Enables the control. This means the control is included in validation checks and
     * the aggregate value of its parent. Its status recalculates based on its value and
     * its validators.
     *
     * By default, if the control has children, all children are enabled.
     *
     * @see {@link AbstractControl.status}
     *
     * @param opts Configure options that control how the control propagates changes and
     * emits events when marked as untouched
     * * `onlySelf`: When true, mark only this control. When false or not supplied,
     * marks all direct ancestors. Default is false.
     * * `emitEvent`: When true or not supplied (the default), the `statusChanges`,
     * `valueChanges` and `events`
     * observables emit events with the latest status and value when the control is enabled.
     * When false, no events are emitted.
     */
    enable(opts = {}) {
        // If parent has been marked artificially dirty we don't want to re-calculate the
        // parent's dirtiness based on the children.
        const skipPristineCheck = this._parentMarkedDirty(opts.onlySelf);
        this.status = VALID;
        this._forEachChild((control) => {
            control.enable({ ...opts, onlySelf: true });
        });
        this.updateValueAndValidity({ onlySelf: true, emitEvent: opts.emitEvent });
        this._updateAncestors({ ...opts, skipPristineCheck }, this);
        this._onDisabledChange.forEach((changeFn) => changeFn(false));
    }
    _updateAncestors(opts, sourceControl) {
        if (this._parent && !opts.onlySelf) {
            this._parent.updateValueAndValidity(opts);
            if (!opts.skipPristineCheck) {
                this._parent._updatePristine({}, sourceControl);
            }
            this._parent._updateTouched({}, sourceControl);
        }
    }
    /**
     * Sets the parent of the control
     *
     * @param parent The new parent.
     */
    setParent(parent) {
        this._parent = parent;
    }
    /**
     * The raw value of this control. For most control implementations, the raw value will include
     * disabled children.
     */
    getRawValue() {
        return this.value;
    }
    updateValueAndValidity(opts = {}) {
        this._setInitialStatus();
        this._updateValue();
        if (this.enabled) {
            const shouldHaveEmitted = this._cancelExistingSubscription();
            this.errors = this._runValidator();
            this.status = this._calculateStatus();
            if (this.status === VALID || this.status === PENDING) {
                // If the canceled subscription should have emitted
                // we make sure the async validator emits the status change on completion
                this._runAsyncValidator(shouldHaveEmitted, opts.emitEvent);
            }
        }
        const sourceControl = opts.sourceControl ?? this;
        if (opts.emitEvent !== false) {
            this._events.next(new ValueChangeEvent(this.value, sourceControl));
            this._events.next(new StatusChangeEvent(this.status, sourceControl));
            this.valueChanges.emit(this.value);
            this.statusChanges.emit(this.status);
        }
        if (this._parent && !opts.onlySelf) {
            this._parent.updateValueAndValidity({ ...opts, sourceControl });
        }
    }
    /** @internal */
    _updateTreeValidity(opts = { emitEvent: true }) {
        this._forEachChild((ctrl) => ctrl._updateTreeValidity(opts));
        this.updateValueAndValidity({ onlySelf: true, emitEvent: opts.emitEvent });
    }
    _setInitialStatus() {
        this.status = this._allControlsDisabled() ? DISABLED : VALID;
    }
    _runValidator() {
        return this.validator ? this.validator(this) : null;
    }
    _runAsyncValidator(shouldHaveEmitted, emitEvent) {
        if (this.asyncValidator) {
            this.status = PENDING;
            this._hasOwnPendingAsyncValidator = { emitEvent: emitEvent !== false };
            const obs = toObservable(this.asyncValidator(this));
            this._asyncValidationSubscription = obs.subscribe((errors) => {
                this._hasOwnPendingAsyncValidator = null;
                // This will trigger the recalculation of the validation status, which depends on
                // the state of the asynchronous validation (whether it is in progress or not). So, it is
                // necessary that we have updated the `_hasOwnPendingAsyncValidator` boolean flag first.
                this.setErrors(errors, { emitEvent, shouldHaveEmitted });
            });
        }
    }
    _cancelExistingSubscription() {
        if (this._asyncValidationSubscription) {
            this._asyncValidationSubscription.unsubscribe();
            // we're cancelling the validator subscribtion, we keep if it should have emitted
            // because we want to emit eventually if it was required at least once.
            const shouldHaveEmitted = this._hasOwnPendingAsyncValidator?.emitEvent ?? false;
            this._hasOwnPendingAsyncValidator = null;
            return shouldHaveEmitted;
        }
        return false;
    }
    setErrors(errors, opts = {}) {
        this.errors = errors;
        this._updateControlsErrors(opts.emitEvent !== false, this, opts.shouldHaveEmitted);
    }
    /**
     * Retrieves a child control given the control's name or path.
     *
     * @param path A dot-delimited string or array of string/number values that define the path to the
     * control. If a string is provided, passing it as a string literal will result in improved type
     * information. Likewise, if an array is provided, passing it `as const` will cause improved type
     * information to be available.
     *
     * @usageNotes
     * ### Retrieve a nested control
     *
     * For example, to get a `name` control nested within a `person` sub-group:
     *
     * * `this.form.get('person.name');`
     *
     * -OR-
     *
     * * `this.form.get(['person', 'name'] as const);` // `as const` gives improved typings
     *
     * ### Retrieve a control in a FormArray
     *
     * When accessing an element inside a FormArray, you can use an element index.
     * For example, to get a `price` control from the first element in an `items` array you can use:
     *
     * * `this.form.get('items.0.price');`
     *
     * -OR-
     *
     * * `this.form.get(['items', 0, 'price']);`
     */
    get(path) {
        let currPath = path;
        if (currPath == null)
            return null;
        if (!Array.isArray(currPath))
            currPath = currPath.split('.');
        if (currPath.length === 0)
            return null;
        return currPath.reduce((control, name) => control && control._find(name), this);
    }
    /**
     * @description
     * Reports error data for the control with the given path.
     *
     * @param errorCode The code of the error to check
     * @param path A list of control names that designates how to move from the current control
     * to the control that should be queried for errors.
     *
     * @usageNotes
     * For example, for the following `FormGroup`:
     *
     * ```
     * form = new FormGroup({
     *   address: new FormGroup({ street: new FormControl() })
     * });
     * ```
     *
     * The path to the 'street' control from the root form would be 'address' -> 'street'.
     *
     * It can be provided to this method in one of two formats:
     *
     * 1. An array of string control names, e.g. `['address', 'street']`
     * 1. A period-delimited list of control names in one string, e.g. `'address.street'`
     *
     * @returns error data for that particular error. If the control or error is not present,
     * null is returned.
     */
    getError(errorCode, path) {
        const control = path ? this.get(path) : this;
        return control && control.errors ? control.errors[errorCode] : null;
    }
    /**
     * @description
     * Reports whether the control with the given path has the error specified.
     *
     * @param errorCode The code of the error to check
     * @param path A list of control names that designates how to move from the current control
     * to the control that should be queried for errors.
     *
     * @usageNotes
     * For example, for the following `FormGroup`:
     *
     * ```
     * form = new FormGroup({
     *   address: new FormGroup({ street: new FormControl() })
     * });
     * ```
     *
     * The path to the 'street' control from the root form would be 'address' -> 'street'.
     *
     * It can be provided to this method in one of two formats:
     *
     * 1. An array of string control names, e.g. `['address', 'street']`
     * 1. A period-delimited list of control names in one string, e.g. `'address.street'`
     *
     * If no path is given, this method checks for the error on the current control.
     *
     * @returns whether the given error is present in the control at the given path.
     *
     * If the control is not present, false is returned.
     */
    hasError(errorCode, path) {
        return !!this.getError(errorCode, path);
    }
    /**
     * Retrieves the top-level ancestor of this control.
     */
    get root() {
        let x = this;
        while (x._parent) {
            x = x._parent;
        }
        return x;
    }
    /** @internal */
    _updateControlsErrors(emitEvent, changedControl, shouldHaveEmitted) {
        this.status = this._calculateStatus();
        if (emitEvent) {
            this.statusChanges.emit(this.status);
        }
        // The Events Observable expose a slight different bevahior than the statusChanges obs
        // An async validator will still emit a StatusChangeEvent is a previously cancelled
        // async validator has emitEvent set to true
        if (emitEvent || shouldHaveEmitted) {
            this._events.next(new StatusChangeEvent(this.status, changedControl));
        }
        if (this._parent) {
            this._parent._updateControlsErrors(emitEvent, changedControl, shouldHaveEmitted);
        }
    }
    /** @internal */
    _initObservables() {
        this.valueChanges = new EventEmitter();
        this.statusChanges = new EventEmitter();
    }
    _calculateStatus() {
        if (this._allControlsDisabled())
            return DISABLED;
        if (this.errors)
            return INVALID;
        if (this._hasOwnPendingAsyncValidator || this._anyControlsHaveStatus(PENDING))
            return PENDING;
        if (this._anyControlsHaveStatus(INVALID))
            return INVALID;
        return VALID;
    }
    /** @internal */
    _anyControlsHaveStatus(status) {
        return this._anyControls((control) => control.status === status);
    }
    /** @internal */
    _anyControlsDirty() {
        return this._anyControls((control) => control.dirty);
    }
    /** @internal */
    _anyControlsTouched() {
        return this._anyControls((control) => control.touched);
    }
    /** @internal */
    _updatePristine(opts, changedControl) {
        const newPristine = !this._anyControlsDirty();
        const changed = this.pristine !== newPristine;
        this.pristine = newPristine;
        if (this._parent && !opts.onlySelf) {
            this._parent._updatePristine(opts, changedControl);
        }
        if (changed) {
            this._events.next(new PristineChangeEvent(this.pristine, changedControl));
        }
    }
    /** @internal */
    _updateTouched(opts = {}, changedControl) {
        this.touched = this._anyControlsTouched();
        this._events.next(new TouchedChangeEvent(this.touched, changedControl));
        if (this._parent && !opts.onlySelf) {
            this._parent._updateTouched(opts, changedControl);
        }
    }
    /** @internal */
    _registerOnCollectionChange(fn) {
        this._onCollectionChange = fn;
    }
    /** @internal */
    _setUpdateStrategy(opts) {
        if (isOptionsObj(opts) && opts.updateOn != null) {
            this._updateOn = opts.updateOn;
        }
    }
    /**
     * Check to see if parent has been marked artificially dirty.
     *
     * @internal
     */
    _parentMarkedDirty(onlySelf) {
        const parentDirty = this._parent && this._parent.dirty;
        return !onlySelf && !!parentDirty && !this._parent._anyControlsDirty();
    }
    /** @internal */
    _find(name) {
        return null;
    }
    /**
     * Internal implementation of the `setValidators` method. Needs to be separated out into a
     * different method, because it is called in the constructor and it can break cases where
     * a control is extended.
     */
    _assignValidators(validators) {
        this._rawValidators = Array.isArray(validators) ? validators.slice() : validators;
        this._composedValidatorFn = coerceToValidator(this._rawValidators);
    }
    /**
     * Internal implementation of the `setAsyncValidators` method. Needs to be separated out into a
     * different method, because it is called in the constructor and it can break cases where
     * a control is extended.
     */
    _assignAsyncValidators(validators) {
        this._rawAsyncValidators = Array.isArray(validators) ? validators.slice() : validators;
        this._composedAsyncValidatorFn = coerceToAsyncValidator(this._rawAsyncValidators);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWJzdHJhY3RfbW9kZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9mb3Jtcy9zcmMvbW9kZWwvYWJzdHJhY3RfbW9kZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFlBQVksRUFBRSxhQUFhLElBQUksWUFBWSxFQUF3QixNQUFNLGVBQWUsQ0FBQztBQUNqRyxPQUFPLEVBQWEsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBRXpDLE9BQU8sRUFDTCxxQ0FBcUMsRUFDckMsbUJBQW1CLEVBQ25CLHdCQUF3QixFQUN4QixlQUFlLEdBQ2hCLE1BQU0sK0JBQStCLENBQUM7QUFJdkMsT0FBTyxFQUNMLGFBQWEsRUFDYixzQkFBc0IsRUFDdEIsaUJBQWlCLEVBQ2pCLFlBQVksRUFDWixnQkFBZ0IsRUFDaEIsWUFBWSxHQUNiLE1BQU0sZUFBZSxDQUFDO0FBRXZCOzs7O0dBSUc7QUFDSCxNQUFNLENBQUMsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDO0FBRTdCOzs7O0dBSUc7QUFDSCxNQUFNLENBQUMsTUFBTSxPQUFPLEdBQUcsU0FBUyxDQUFDO0FBRWpDOzs7Ozs7R0FNRztBQUNILE1BQU0sQ0FBQyxNQUFNLE9BQU8sR0FBRyxTQUFTLENBQUM7QUFFakM7Ozs7OztHQU1HO0FBQ0gsTUFBTSxDQUFDLE1BQU0sUUFBUSxHQUFHLFVBQVUsQ0FBQztBQW1CbkM7Ozs7R0FJRztBQUNILE1BQU0sT0FBZ0IsWUFBWTtDQUtqQztBQUVEOzs7O0dBSUc7QUFDSCxNQUFNLE9BQU8sZ0JBQW9CLFNBQVEsWUFBZTtJQUN0RCxZQUNrQixLQUFRLEVBQ1IsTUFBdUI7UUFFdkMsS0FBSyxFQUFFLENBQUM7UUFIUSxVQUFLLEdBQUwsS0FBSyxDQUFHO1FBQ1IsV0FBTSxHQUFOLE1BQU0sQ0FBaUI7SUFHekMsQ0FBQztDQUNGO0FBRUQ7OztnQkFHZ0I7QUFDaEIs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QUksQ0FBQyxtQkFBbUIsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQztRQUN2RixJQUFJLENBQUMseUJBQXlCLEdBQUcsc0JBQXNCLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUM7SUFDcEYsQ0FBQztDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RXZlbnRFbWl0dGVyLCDJtVJ1bnRpbWVFcnJvciBhcyBSdW50aW1lRXJyb3IsIMm1V3JpdGFibGUgYXMgV3JpdGFibGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtPYnNlcnZhYmxlLCBTdWJqZWN0fSBmcm9tICdyeGpzJztcblxuaW1wb3J0IHtcbiAgYXN5bmNWYWxpZGF0b3JzRHJvcHBlZFdpdGhPcHRzV2FybmluZyxcbiAgbWlzc2luZ0NvbnRyb2xFcnJvcixcbiAgbWlzc2luZ0NvbnRyb2xWYWx1ZUVycm9yLFxuICBub0NvbnRyb2xzRXJyb3IsXG59IGZyb20gJy4uL2RpcmVjdGl2ZXMvcmVhY3RpdmVfZXJyb3JzJztcbmltcG9ydCB7QXN5bmNWYWxpZGF0b3JGbiwgVmFsaWRhdGlvbkVycm9ycywgVmFsaWRhdG9yRm59IGZyb20gJy4uL2RpcmVjdGl2ZXMvdmFsaWRhdG9ycyc7XG5pbXBvcnQge1J1bnRpbWVFcnJvckNvZGV9IGZyb20gJy4uL2Vycm9ycyc7XG5pbXBvcnQge0Zvcm1BcnJheSwgRm9ybUdyb3VwfSBmcm9tICcuLi9mb3Jtcyc7XG5pbXBvcnQge1xuICBhZGRWYWxpZGF0b3JzLFxuICBjb21wb3NlQXN5bmNWYWxpZGF0b3JzLFxuICBjb21wb3NlVmFsaWRhdG9ycyxcbiAgaGFzVmFsaWRhdG9yLFxuICByZW1vdmVWYWxpZGF0b3JzLFxuICB0b09ic2VydmFibGUsXG59IGZyb20gJy4uL3ZhbGlkYXRvcnMnO1xuXG4vKipcbiAqIFJlcG9ydHMgdGhhdCBhIGNvbnRyb2wgaXMgdmFsaWQsIG1lYW5pbmcgdGhhdCBubyBlcnJvcnMgZXhpc3QgaW4gdGhlIGlucHV0IHZhbHVlLlxuICpcbiAqIEBzZWUge0BsaW5rIHN0YXR1c31cbiAqL1xuZXhwb3J0IGNvbnN0IFZBTElEID0gJ1ZBTElEJztcblxuLyoqXG4gKiBSZXBvcnRzIHRoYXQgYSBjb250cm9sIGlzIGludmFsaWQsIG1lYW5pbmcgdGhhdCBhbiBlcnJvciBleGlzdHMgaW4gdGhlIGlucHV0IHZhbHVlLlxuICpcbiAqIEBzZWUge0BsaW5rIHN0YXR1c31cbiAqL1xuZXhwb3J0IGNvbnN0IElOVkFMSUQgPSAnSU5WQUxJRCc7XG5cbi8qKlxuICogUmVwb3J0cyB0aGF0IGEgY29udHJvbCBpcyBwZW5kaW5nLCBtZWFuaW5nIHRoYXQgYXN5bmMgdmFsaWRhdGlvbiBpcyBvY2N1cnJpbmcgYW5kXG4gKiBlcnJvcnMgYXJlIG5vdCB5ZXQgYXZhaWxhYmxlIGZvciB0aGUgaW5wdXQgdmFsdWUuXG4gKlxuICogQHNlZSB7QGxpbmsgbWFya0FzUGVuZGluZ31cbiAqIEBzZWUge0BsaW5rIHN0YXR1c31cbiAqL1xuZXhwb3J0IGNvbnN0IFBFTkRJTkcgPSAnUEVORElORyc7XG5cbi8qKlxuICogUmVwb3J0cyB0aGF0IGEgY29udHJvbCBpcyBkaXNhYmxlZCwgbWVhbmluZyB0aGF0IHRoZSBjb250cm9sIGlzIGV4ZW1wdCBmcm9tIGFuY2VzdG9yXG4gKiBjYWxjdWxhdGlvbnMgb2YgdmFsaWRpdHkgb3IgdmFsdWUuXG4gKlxuICogQHNlZSB7QGxpbmsgbWFya0FzRGlzYWJsZWR9XG4gKiBAc2VlIHtAbGluayBzdGF0dXN9XG4gKi9cbmV4cG9ydCBjb25zdCBESVNBQkxFRCA9ICdESVNBQkxFRCc7XG5cbi8qKlxuICogQSBmb3JtIGNhbiBoYXZlIHNldmVyYWwgZGlmZmVyZW50IHN0YXR1c2VzLiBFYWNoXG4gKiBwb3NzaWJsZSBzdGF0dXMgaXMgcmV0dXJuZWQgYXMgYSBzdHJpbmcgbGl0ZXJhbC5cbiAqXG4gKiAqICoqVkFMSUQqKjogUmVwb3J0cyB0aGF0IGEgY29udHJvbCBpcyB2YWxpZCwgbWVhbmluZyB0aGF0IG5vIGVycm9ycyBleGlzdCBpbiB0aGUgaW5wdXRcbiAqIHZhbHVlLlxuICogKiAqKklOVkFMSUQqKjogUmVwb3J0cyB0aGF0IGEgY29udHJvbCBpcyBpbnZhbGlkLCBtZWFuaW5nIHRoYXQgYW4gZXJyb3IgZXhpc3RzIGluIHRoZSBpbnB1dFxuICogdmFsdWUuXG4gKiAqICoqUEVORElORyoqOiBSZXBvcnRzIHRoYXQgYSBjb250cm9sIGlzIHBlbmRpbmcsIG1lYW5pbmcgdGhhdCBhc3luYyB2YWxpZGF0aW9uIGlzXG4gKiBvY2N1cnJpbmcgYW5kIGVycm9ycyBhcmUgbm90IHlldCBhdmFpbGFibGUgZm9yIHRoZSBpbnB1dCB2YWx1ZS5cbiAqICogKipESVNBQkxFRCoqOiBSZXBvcnRzIHRoYXQgYSBjb250cm9sIGlzXG4gKiBkaXNhYmxlZCwgbWVhbmluZyB0aGF0IHRoZSBjb250cm9sIGlzIGV4ZW1wdCBmcm9tIGFuY2VzdG9yIGNhbGN1bGF0aW9ucyBvZiB2YWxpZGl0eSBvciB2YWx1ZS5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCB0eXBlIEZvcm1Db250cm9sU3RhdHVzID0gJ1ZBTElEJyB8ICdJTlZBTElEJyB8ICdQRU5ESU5HJyB8ICdESVNBQkxFRCc7XG5cbi8qKlxuICogQmFzZSBjbGFzcyBmb3IgZXZlcnkgZXZlbnQgc2VudCBieSBgQWJzdHJhY3RDb250cm9sLmV2ZW50cygpYFxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIENvbnRyb2xFdmVudDxUID0gYW55PiB7XG4gIC8qKlxuICAgKiBGb3JtIGNvbnRyb2wgZnJvbSB3aGljaCB0aGlzIGV2ZW50IGlzIG9yaWdpbmF0ZWQuXG4gICAqL1xuICBwdWJsaWMgYWJzdHJhY3QgcmVhZG9ubHkgc291cmNlOiBBYnN0cmFjdENvbnRyb2w8dW5rbm93bj47XG59XG5cbi8qKlxuICogRXZlbnQgZmlyZWQgd2hlbiB0aGUgdmFsdWUgb2YgYSBjb250cm9sIGNoYW5nZXMuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY2xhc3MgVmFsdWVDaGFuZ2VFdmVudDxUPiBleHRlbmRzIENvbnRyb2xFdmVudDxUPiB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyByZWFkb25seSB2YWx1ZTogVCxcbiAgICBwdWJsaWMgcmVhZG9ubHkgc291cmNlOiBBYnN0cmFjdENvbnRyb2wsXG4gICkge1xuICAgIHN1cGVyKCk7XG4gIH1cbn1cblxuLyoqXG4gKiBFdmVudCBmaXJlZCB3aGVuIHRoZSBjb250cm9sJ3MgcHJpc3RpbmUgc3RhdGUgY2hhbmdlcyAocHJpc3RpbmUgPD0+IGRpcnR5KS5cbiAqXG4gKiBAcHVibGljQXBpICovXG5leHBvcnQgY2xhc3MgUHJpc3RpbmVDaGFuZ2VFdmVudCBleHRlbmRzIENvbnRyb2xFdmVudCB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyByZWFkb25seSBwcmlzdGluZTogYm9vbGVhbixcbiAgICBwdWJsaWMgcmVhZG9ubHkgc291cmNlOiBBYnN0cmFjdENvbnRyb2wsXG4gICkge1xuICAgIHN1cGVyKCk7XG4gIH1cbn1cblxuLyoqXG4gKiBFdmVudCBmaXJlZCB3aGVuIHRoZSBjb250cm9sJ3MgdG91Y2hlZCBzdGF0dXMgY2hhbmdlcyAodG91Y2hlZCA8PT4gdW50b3VjaGVkKS5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjbGFzcyBUb3VjaGVkQ2hhbmdlRXZlbnQgZXh0ZW5kcyBDb250cm9sRXZlbnQge1xuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgcmVhZG9ubHkgdG91Y2hlZDogYm9vbGVhbixcbiAgICBwdWJsaWMgcmVhZG9ubHkgc291cmNlOiBBYnN0cmFjdENvbnRyb2wsXG4gICkge1xuICAgIHN1cGVyKCk7XG4gIH1cbn1cblxuLyoqXG4gKiBFdmVudCBmaXJlZCB3aGVuIHRoZSBjb250cm9sJ3Mgc3RhdHVzIGNoYW5nZXMuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY2xhc3MgU3RhdHVzQ2hhbmdlRXZlbnQgZXh0ZW5kcyBDb250cm9sRXZlbnQge1xuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgcmVhZG9ubHkgc3RhdHVzOiBGb3JtQ29udHJvbFN0YXR1cyxcbiAgICBwdWJsaWMgcmVhZG9ubHkgc291cmNlOiBBYnN0cmFjdENvbnRyb2wsXG4gICkge1xuICAgIHN1cGVyKCk7XG4gIH1cbn1cblxuLyoqXG4gKiBFdmVudCBmaXJlZCB3aGVuIGEgZm9ybSBpcyBzdWJtaXR0ZWRcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjbGFzcyBGb3JtU3VibWl0dGVkRXZlbnQgZXh0ZW5kcyBDb250cm9sRXZlbnQge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgcmVhZG9ubHkgc291cmNlOiBBYnN0cmFjdENvbnRyb2wpIHtcbiAgICBzdXBlcigpO1xuICB9XG59XG4vKipcbiAqIEV2ZW50IGZpcmVkIHdoZW4gYSBmb3JtIGlzIHJlc2V0LlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNsYXNzIEZvcm1SZXNldEV2ZW50IGV4dGVuZHMgQ29udHJvbEV2ZW50IHtcbiAgY29uc3RydWN0b3IocHVibGljIHJlYWRvbmx5IHNvdXJjZTogQWJzdHJhY3RDb250cm9sKSB7XG4gICAgc3VwZXIoKTtcbiAgfVxufVxuXG4vKipcbiAqIEdldHMgdmFsaWRhdG9ycyBmcm9tIGVpdGhlciBhbiBvcHRpb25zIG9iamVjdCBvciBnaXZlbiB2YWxpZGF0b3JzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcGlja1ZhbGlkYXRvcnMoXG4gIHZhbGlkYXRvck9yT3B0cz86IFZhbGlkYXRvckZuIHwgVmFsaWRhdG9yRm5bXSB8IEFic3RyYWN0Q29udHJvbE9wdGlvbnMgfCBudWxsLFxuKTogVmFsaWRhdG9yRm4gfCBWYWxpZGF0b3JGbltdIHwgbnVsbCB7XG4gIHJldHVybiAoaXNPcHRpb25zT2JqKHZhbGlkYXRvck9yT3B0cykgPyB2YWxpZGF0b3JPck9wdHMudmFsaWRhdG9ycyA6IHZhbGlkYXRvck9yT3B0cykgfHwgbnVsbDtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIHZhbGlkYXRvciBmdW5jdGlvbiBieSBjb21iaW5pbmcgcHJvdmlkZWQgdmFsaWRhdG9ycy5cbiAqL1xuZnVuY3Rpb24gY29lcmNlVG9WYWxpZGF0b3IodmFsaWRhdG9yOiBWYWxpZGF0b3JGbiB8IFZhbGlkYXRvckZuW10gfCBudWxsKTogVmFsaWRhdG9yRm4gfCBudWxsIHtcbiAgcmV0dXJuIEFycmF5LmlzQXJyYXkodmFsaWRhdG9yKSA/IGNvbXBvc2VWYWxpZGF0b3JzKHZhbGlkYXRvcikgOiB2YWxpZGF0b3IgfHwgbnVsbDtcbn1cblxuLyoqXG4gKiBHZXRzIGFzeW5jIHZhbGlkYXRvcnMgZnJvbSBlaXRoZXIgYW4gb3B0aW9ucyBvYmplY3Qgb3IgZ2l2ZW4gdmFsaWRhdG9ycy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBpY2tBc3luY1ZhbGlkYXRvcnMoXG4gIGFzeW5jVmFsaWRhdG9yPzogQXN5bmNWYWxpZGF0b3JGbiB8IEFzeW5jVmFsaWRhdG9yRm5bXSB8IG51bGwsXG4gIHZhbGlkYXRvck9yT3B0cz86IFZhbGlkYXRvckZuIHwgVmFsaWRhdG9yRm5bXSB8IEFic3RyYWN0Q29udHJvbE9wdGlvbnMgfCBudWxsLFxuKTogQXN5bmNWYWxpZGF0b3JGbiB8IEFzeW5jVmFsaWRhdG9yRm5bXSB8IG51bGwge1xuICBpZiAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSB7XG4gICAgaWYgKGlzT3B0aW9uc09iaih2YWxpZGF0b3JPck9wdHMpICYmIGFzeW5jVmFsaWRhdG9yKSB7XG4gICAgICBjb25zb2xlLndhcm4oYXN5bmNWYWxpZGF0b3JzRHJvcHBlZFdpdGhPcHRzV2FybmluZyk7XG4gICAgfVxuICB9XG4gIHJldHVybiAoaXNPcHRpb25zT2JqKHZhbGlkYXRvck9yT3B0cykgPyB2YWxpZGF0b3JPck9wdHMuYXN5bmNWYWxpZGF0b3JzIDogYXN5bmNWYWxpZGF0b3IpIHx8IG51bGw7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhc3luYyB2YWxpZGF0b3IgZnVuY3Rpb24gYnkgY29tYmluaW5nIHByb3ZpZGVkIGFzeW5jIHZhbGlkYXRvcnMuXG4gKi9cbmZ1bmN0aW9uIGNvZXJjZVRvQXN5bmNWYWxpZGF0b3IoXG4gIGFzeW5jVmFsaWRhdG9yPzogQXN5bmNWYWxpZGF0b3JGbiB8IEFzeW5jVmFsaWRhdG9yRm5bXSB8IG51bGwsXG4pOiBBc3luY1ZhbGlkYXRvckZuIHwgbnVsbCB7XG4gIHJldHVybiBBcnJheS5pc0FycmF5KGFzeW5jVmFsaWRhdG9yKVxuICAgID8gY29tcG9zZUFzeW5jVmFsaWRhdG9ycyhhc3luY1ZhbGlkYXRvcilcbiAgICA6IGFzeW5jVmFsaWRhdG9yIHx8IG51bGw7XG59XG5cbmV4cG9ydCB0eXBlIEZvcm1Ib29rcyA9ICdjaGFuZ2UnIHwgJ2JsdXInIHwgJ3N1Ym1pdCc7XG5cbi8qKlxuICogSW50ZXJmYWNlIGZvciBvcHRpb25zIHByb3ZpZGVkIHRvIGFuIGBBYnN0cmFjdENvbnRyb2xgLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBYnN0cmFjdENvbnRyb2xPcHRpb25zIHtcbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBUaGUgbGlzdCBvZiB2YWxpZGF0b3JzIGFwcGxpZWQgdG8gYSBjb250cm9sLlxuICAgKi9cbiAgdmFsaWRhdG9ycz86IFZhbGlkYXRvckZuIHwgVmFsaWRhdG9yRm5bXSB8IG51bGw7XG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogVGhlIGxpc3Qgb2YgYXN5bmMgdmFsaWRhdG9ycyBhcHBsaWVkIHRvIGNvbnRyb2wuXG4gICAqL1xuICBhc3luY1ZhbGlkYXRvcnM/OiBBc3luY1ZhbGlkYXRvckZuIHwgQXN5bmNWYWxpZGF0b3JGbltdIHwgbnVsbDtcbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBUaGUgZXZlbnQgbmFtZSBmb3IgY29udHJvbCB0byB1cGRhdGUgdXBvbi5cbiAgICovXG4gIHVwZGF0ZU9uPzogJ2NoYW5nZScgfCAnYmx1cicgfCAnc3VibWl0Jztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzT3B0aW9uc09iaihcbiAgdmFsaWRhdG9yT3JPcHRzPzogVmFsaWRhdG9yRm4gfCBWYWxpZGF0b3JGbltdIHwgQWJzdHJhY3RDb250cm9sT3B0aW9ucyB8IG51bGwsXG4pOiB2YWxpZGF0b3JPck9wdHMgaXMgQWJzdHJhY3RDb250cm9sT3B0aW9ucyB7XG4gIHJldHVybiAoXG4gICAgdmFsaWRhdG9yT3JPcHRzICE9IG51bGwgJiZcbiAgICAhQXJyYXkuaXNBcnJheSh2YWxpZGF0b3JPck9wdHMpICYmXG4gICAgdHlwZW9mIHZhbGlkYXRvck9yT3B0cyA9PT0gJ29iamVjdCdcbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydENvbnRyb2xQcmVzZW50KHBhcmVudDogYW55LCBpc0dyb3VwOiBib29sZWFuLCBrZXk6IHN0cmluZyB8IG51bWJlcik6IHZvaWQge1xuICBjb25zdCBjb250cm9scyA9IHBhcmVudC5jb250cm9scyBhcyB7W2tleTogc3RyaW5nIHwgbnVtYmVyXTogdW5rbm93bn07XG4gIGNvbnN0IGNvbGxlY3Rpb24gPSBpc0dyb3VwID8gT2JqZWN0LmtleXMoY29udHJvbHMpIDogY29udHJvbHM7XG4gIGlmICghY29sbGVjdGlvbi5sZW5ndGgpIHtcbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgUnVudGltZUVycm9yQ29kZS5OT19DT05UUk9MUyxcbiAgICAgIHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSA/IG5vQ29udHJvbHNFcnJvcihpc0dyb3VwKSA6ICcnLFxuICAgICk7XG4gIH1cbiAgaWYgKCFjb250cm9sc1trZXldKSB7XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgIFJ1bnRpbWVFcnJvckNvZGUuTUlTU0lOR19DT05UUk9MLFxuICAgICAgdHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlID8gbWlzc2luZ0NvbnRyb2xFcnJvcihpc0dyb3VwLCBrZXkpIDogJycsXG4gICAgKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gYXNzZXJ0QWxsVmFsdWVzUHJlc2VudChjb250cm9sOiBhbnksIGlzR3JvdXA6IGJvb2xlYW4sIHZhbHVlOiBhbnkpOiB2b2lkIHtcbiAgY29udHJvbC5fZm9yRWFjaENoaWxkKChfOiB1bmtub3duLCBrZXk6IHN0cmluZyB8IG51bWJlcikgPT4ge1xuICAgIGlmICh2YWx1ZVtrZXldID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuTUlTU0lOR19DT05UUk9MX1ZBTFVFLFxuICAgICAgICB0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUgPyBtaXNzaW5nQ29udHJvbFZhbHVlRXJyb3IoaXNHcm91cCwga2V5KSA6ICcnLFxuICAgICAgKTtcbiAgICB9XG4gIH0pO1xufVxuXG4vLyBJc0FueSBjaGVja3MgaWYgVCBpcyBgYW55YCwgYnkgY2hlY2tpbmcgYSBjb25kaXRpb24gdGhhdCBjb3VsZG4ndCBwb3NzaWJseSBiZSB0cnVlIG90aGVyd2lzZS5cbmV4cG9ydCB0eXBlIMm1SXNBbnk8VCwgWSwgTj4gPSAwIGV4dGVuZHMgMSAmIFQgPyBZIDogTjtcblxuLyoqXG4gKiBgVHlwZWRPclVudHlwZWRgIGFsbG93cyBvbmUgb2YgdHdvIGRpZmZlcmVudCB0eXBlcyB0byBiZSBzZWxlY3RlZCwgZGVwZW5kaW5nIG9uIHdoZXRoZXIgdGhlIEZvcm1zXG4gKiBjbGFzcyBpdCdzIGFwcGxpZWQgdG8gaXMgdHlwZWQgb3Igbm90LlxuICpcbiAqIFRoaXMgaXMgZm9yIGludGVybmFsIEFuZ3VsYXIgdXNhZ2UgdG8gc3VwcG9ydCB0eXBlZCBmb3JtczsgZG8gbm90IGRpcmVjdGx5IHVzZSBpdC5cbiAqL1xuZXhwb3J0IHR5cGUgybVUeXBlZE9yVW50eXBlZDxULCBUeXBlZCwgVW50eXBlZD4gPSDJtUlzQW55PFQsIFVudHlwZWQsIFR5cGVkPjtcblxuLyoqXG4gKiBWYWx1ZSBnaXZlcyB0aGUgdmFsdWUgdHlwZSBjb3JyZXNwb25kaW5nIHRvIGEgY29udHJvbCB0eXBlLlxuICpcbiAqIE5vdGUgdGhhdCB0aGUgcmVzdWx0aW5nIHR5cGUgd2lsbCBmb2xsb3cgdGhlIHNhbWUgcnVsZXMgYXMgYC52YWx1ZWAgb24geW91ciBjb250cm9sLCBncm91cCwgb3JcbiAqIGFycmF5LCBpbmNsdWRpbmcgYHVuZGVmaW5lZGAgZm9yIGVhY2ggZ3JvdXAgZWxlbWVudCB3aGljaCBtaWdodCBiZSBkaXNhYmxlZC5cbiAqXG4gKiBJZiB5b3UgYXJlIHRyeWluZyB0byBleHRyYWN0IGEgdmFsdWUgdHlwZSBmb3IgYSBkYXRhIG1vZGVsLCB5b3UgcHJvYmFibHkgd2FudCB7QGxpbmsgUmF3VmFsdWV9LFxuICogd2hpY2ggd2lsbCBub3QgaGF2ZSBgdW5kZWZpbmVkYCBpbiBncm91cCBrZXlzLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKlxuICogIyMjIGBGb3JtQ29udHJvbGAgdmFsdWUgdHlwZVxuICpcbiAqIFlvdSBjYW4gZXh0cmFjdCB0aGUgdmFsdWUgdHlwZSBvZiBhIHNpbmdsZSBjb250cm9sOlxuICpcbiAqIGBgYHRzXG4gKiB0eXBlIE5hbWVDb250cm9sID0gRm9ybUNvbnRyb2w8c3RyaW5nPjtcbiAqIHR5cGUgTmFtZVZhbHVlID0gVmFsdWU8TmFtZUNvbnRyb2w+O1xuICogYGBgXG4gKlxuICogVGhlIHJlc3VsdGluZyB0eXBlIGlzIGBzdHJpbmdgLlxuICpcbiAqICMjIyBgRm9ybUdyb3VwYCB2YWx1ZSB0eXBlXG4gKlxuICogSW1hZ2luZSB5b3UgaGF2ZSBhbiBpbnRlcmZhY2UgZGVmaW5pbmcgdGhlIGNvbnRyb2xzIGluIHlvdXIgZ3JvdXAuIFlvdSBjYW4gZXh0cmFjdCB0aGUgc2hhcGUgb2ZcbiAqIHRoZSB2YWx1ZXMgYXMgZm9sbG93czpcbiAqXG4gKiBgYGB0c1xuICogaW50ZXJmYWNlIFBhcnR5Rm9ybUNvbnRyb2xzIHtcbiAqICAgYWRkcmVzczogRm9ybUNvbnRyb2w8c3RyaW5nPjtcbiAqIH1cbiAqXG4gKiAvLyBWYWx1ZSBvcGVyYXRlcyBvbiBjb250cm9sczsgdGhlIG9iamVjdCBtdXN0IGJlIHdyYXBwZWQgaW4gYSBGb3JtR3JvdXAuXG4gKiB0eXBlIFBhcnR5Rm9ybVZhbHVlcyA9IFZhbHVlPEZvcm1Hcm91cDxQYXJ0eUZvcm1Db250cm9scz4+O1xuICogYGBgXG4gKlxuICogVGhlIHJlc3VsdGluZyB0eXBlIGlzIGB7YWRkcmVzczogc3RyaW5nfHVuZGVmaW5lZH1gLlxuICpcbiAqICMjIyBgRm9ybUFycmF5YCB2YWx1ZSB0eXBlXG4gKlxuICogWW91IGNhbiBleHRyYWN0IHZhbHVlcyBmcm9tIEZvcm1BcnJheXMgYXMgd2VsbDpcbiAqXG4gKiBgYGB0c1xuICogdHlwZSBHdWVzdE5hbWVzQ29udHJvbHMgPSBGb3JtQXJyYXk8Rm9ybUNvbnRyb2w8c3RyaW5nPj47XG4gKlxuICogdHlwZSBOYW1lc1ZhbHVlcyA9IFZhbHVlPEd1ZXN0TmFtZXNDb250cm9scz47XG4gKiBgYGBcbiAqXG4gKiBUaGUgcmVzdWx0aW5nIHR5cGUgaXMgYHN0cmluZ1tdYC5cbiAqXG4gKiAqKkludGVybmFsOiBub3QgZm9yIHB1YmxpYyB1c2UuKipcbiAqL1xuZXhwb3J0IHR5cGUgybVWYWx1ZTxUIGV4dGVuZHMgQWJzdHJhY3RDb250cm9sIHwgdW5kZWZpbmVkPiA9XG4gIFQgZXh0ZW5kcyBBYnN0cmFjdENvbnRyb2w8YW55LCBhbnk+ID8gVFsndmFsdWUnXSA6IG5ldmVyO1xuXG4vKipcbiAqIFJhd1ZhbHVlIGdpdmVzIHRoZSByYXcgdmFsdWUgdHlwZSBjb3JyZXNwb25kaW5nIHRvIGEgY29udHJvbCB0eXBlLlxuICpcbiAqIE5vdGUgdGhhdCB0aGUgcmVzdWx0aW5nIHR5cGUgd2lsbCBmb2xsb3cgdGhlIHNhbWUgcnVsZXMgYXMgYC5nZXRSYXdWYWx1ZSgpYCBvbiB5b3VyIGNvbnRyb2wsXG4gKiBncm91cCwgb3IgYXJyYXkuIFRoaXMgbWVhbnMgdGhhdCBhbGwgY29udHJvbHMgaW5zaWRlIGEgZ3JvdXAgd2lsbCBiZSByZXF1aXJlZCwgbm90IG9wdGlvbmFsLFxuICogcmVnYXJkbGVzcyBvZiB0aGVpciBkaXNhYmxlZCBzdGF0ZS5cbiAqXG4gKiBZb3UgbWF5IGFsc28gd2lzaCB0byB1c2Uge0BsaW5rIMm1VmFsdWV9LCB3aGljaCB3aWxsIGhhdmUgYHVuZGVmaW5lZGAgaW4gZ3JvdXAga2V5cyAod2hpY2ggY2FuIGJlXG4gKiBkaXNhYmxlZCkuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqXG4gKiAjIyMgYEZvcm1Hcm91cGAgcmF3IHZhbHVlIHR5cGVcbiAqXG4gKiBJbWFnaW5lIHlvdSBoYXZlIGFuIGludGVyZmFjZSBkZWZpbmluZyB0aGUgY29udHJvbHMgaW4geW91ciBncm91cC4gWW91IGNhbiBleHRyYWN0IHRoZSBzaGFwZSBvZlxuICogdGhlIHJhdyB2YWx1ZXMgYXMgZm9sbG93czpcbiAqXG4gKiBgYGB0c1xuICogaW50ZXJmYWNlIFBhcnR5Rm9ybUNvbnRyb2xzIHtcbiAqICAgYWRkcmVzczogRm9ybUNvbnRyb2w8c3RyaW5nPjtcbiAqIH1cbiAqXG4gKiAvLyBSYXdWYWx1ZSBvcGVyYXRlcyBvbiBjb250cm9sczsgdGhlIG9iamVjdCBtdXN0IGJlIHdyYXBwZWQgaW4gYSBGb3JtR3JvdXAuXG4gKiB0eXBlIFBhcnR5Rm9ybVZhbHVlcyA9IFJhd1ZhbHVlPEZvcm1Hcm91cDxQYXJ0eUZvcm1Db250cm9scz4+O1xuICogYGBgXG4gKlxuICogVGhlIHJlc3VsdGluZyB0eXBlIGlzIGB7YWRkcmVzczogc3RyaW5nfWAuIChOb3RlIHRoZSBhYnNlbmNlIG9mIGB1bmRlZmluZWRgLilcbiAqXG4gKiAgKipJbnRlcm5hbDogbm90IGZvciBwdWJsaWMgdXNlLioqXG4gKi9cbmV4cG9ydCB0eXBlIMm1UmF3VmFsdWU8VCBleHRlbmRzIEFic3RyYWN0Q29udHJvbCB8IHVuZGVmaW5lZD4gPVxuICBUIGV4dGVuZHMgQWJzdHJhY3RDb250cm9sPGFueSwgYW55PlxuICAgID8gVFsnc2V0VmFsdWUnXSBleHRlbmRzICh2OiBpbmZlciBSKSA9PiB2b2lkXG4gICAgICA/IFJcbiAgICAgIDogbmV2ZXJcbiAgICA6IG5ldmVyO1xuXG4vKipcbiAqIFRva2VuaXplIHNwbGl0cyBhIHN0cmluZyBsaXRlcmFsIFMgYnkgYSBkZWxpbWl0ZXIgRC5cbiAqL1xuZXhwb3J0IHR5cGUgybVUb2tlbml6ZTxTIGV4dGVuZHMgc3RyaW5nLCBEIGV4dGVuZHMgc3RyaW5nPiA9IHN0cmluZyBleHRlbmRzIFNcbiAgPyBzdHJpbmdbXSAvKiBTIG11c3QgYmUgYSBsaXRlcmFsICovXG4gIDogUyBleHRlbmRzIGAke2luZmVyIFR9JHtEfSR7aW5mZXIgVX1gXG4gICAgPyBbVCwgLi4uybVUb2tlbml6ZTxVLCBEPl1cbiAgICA6IFtTXSAvKiBCYXNlIGNhc2UgKi87XG5cbi8qKlxuICogQ29lcmNlU3RyQXJyVG9OdW1BcnIgYWNjZXB0cyBhbiBhcnJheSBvZiBzdHJpbmdzLCBhbmQgY29udmVydHMgYW55IG51bWVyaWMgc3RyaW5nIHRvIGEgbnVtYmVyLlxuICovXG5leHBvcnQgdHlwZSDJtUNvZXJjZVN0ckFyclRvTnVtQXJyPFM+ID1cbiAgLy8gRXh0cmFjdCB0aGUgaGVhZCBvZiB0aGUgYXJyYXkuXG4gIFMgZXh0ZW5kcyBbaW5mZXIgSGVhZCwgLi4uaW5mZXIgVGFpbF1cbiAgICA/IC8vIFVzaW5nIGEgdGVtcGxhdGUgbGl0ZXJhbCB0eXBlLCBjb2VyY2UgdGhlIGhlYWQgdG8gYG51bWJlcmAgaWYgcG9zc2libGUuXG4gICAgICAvLyBUaGVuLCByZWN1cnNlIG9uIHRoZSB0YWlsLlxuICAgICAgSGVhZCBleHRlbmRzIGAke251bWJlcn1gXG4gICAgICA/IFtudW1iZXIsIC4uLsm1Q29lcmNlU3RyQXJyVG9OdW1BcnI8VGFpbD5dXG4gICAgICA6IFtIZWFkLCAuLi7JtUNvZXJjZVN0ckFyclRvTnVtQXJyPFRhaWw+XVxuICAgIDogW107XG5cbi8qKlxuICogTmF2aWdhdGUgdGFrZXMgYSB0eXBlIFQgYW5kIGFuIGFycmF5IEssIGFuZCByZXR1cm5zIHRoZSB0eXBlIG9mIFRbS1swXV1bS1sxXV1bS1syXV0uLi5cbiAqL1xuZXhwb3J0IHR5cGUgybVOYXZpZ2F0ZTxcbiAgVCxcbiAgSyBleHRlbmRzIEFycmF5PHN0cmluZyB8IG51bWJlcj4sXG4+ID0gVCBleHRlbmRzIG9iamVjdCAvKiBUIG11c3QgYmUgaW5kZXhhYmxlIChvYmplY3Qgb3IgYXJyYXkpICovXG4gID8gSyBleHRlbmRzIFtpbmZlciBIZWFkLCAuLi5pbmZlciBUYWlsXSAvKiBTcGxpdCBLIGludG8gaGVhZCBhbmQgdGFpbCAqL1xuICAgID8gSGVhZCBleHRlbmRzIGtleW9mIFQgLyogaGVhZChLKSBtdXN0IGluZGV4IFQgKi9cbiAgICAgID8gVGFpbCBleHRlbmRzIChzdHJpbmcgfCBudW1iZXIpW10gLyogdGFpbChLKSBtdXN0IGJlIGFuIGFycmF5ICovXG4gICAgICAgID8gW10gZXh0ZW5kcyBUYWlsXG4gICAgICAgICAgPyBUW0hlYWRdIC8qIGJhc2UgY2FzZTogSyBjYW4gYmUgc3BsaXQsIGJ1dCBUYWlsIGlzIGVtcHR5ICovXG4gICAgICAgICAgOiDJtU5hdmlnYXRlPFRbSGVhZF0sIFRhaWw+IC8qIGV4cGxvcmUgVFtoZWFkKEspXSBieSB0YWlsKEspICovXG4gICAgICAgIDogYW55IC8qIHRhaWwoSykgd2FzIG5vdCBhbiBhcnJheSwgZ2l2ZSB1cCAqL1xuICAgICAgOiBuZXZlciAvKiBoZWFkKEspIGRvZXMgbm90IGluZGV4IFQsIGdpdmUgdXAgKi9cbiAgICA6IGFueSAvKiBLIGNhbm5vdCBiZSBzcGxpdCwgZ2l2ZSB1cCAqL1xuICA6IGFueSAvKiBUIGlzIG5vdCBpbmRleGFibGUsIGdpdmUgdXAgKi87XG5cbi8qKlxuICogybVXcml0ZWFibGUgcmVtb3ZlcyByZWFkb25seSBmcm9tIGFsbCBrZXlzLlxuICovXG5leHBvcnQgdHlwZSDJtVdyaXRlYWJsZTxUPiA9IHtcbiAgLXJlYWRvbmx5IFtQIGluIGtleW9mIFRdOiBUW1BdO1xufTtcblxuLyoqXG4gKiBHZXRQcm9wZXJ0eSB0YWtlcyBhIHR5cGUgVCBhbmQgc29tZSBwcm9wZXJ0eSBuYW1lcyBvciBpbmRpY2VzIEsuXG4gKiBJZiBLIGlzIGEgZG90LXNlcGFyYXRlZCBzdHJpbmcsIGl0IGlzIHRva2VuaXplZCBpbnRvIGFuIGFycmF5IGJlZm9yZSBwcm9jZWVkaW5nLlxuICogVGhlbiwgdGhlIHR5cGUgb2YgdGhlIG5lc3RlZCBwcm9wZXJ0eSBhdCBLIGlzIGNvbXB1dGVkOiBUW0tbMF1dW0tbMV1dW0tbMl1dLi4uXG4gKiBUaGlzIHdvcmtzIHdpdGggYm90aCBvYmplY3RzLCB3aGljaCBhcmUgaW5kZXhlZCBieSBwcm9wZXJ0eSBuYW1lLCBhbmQgYXJyYXlzLCB3aGljaCBhcmUgaW5kZXhlZFxuICogbnVtZXJpY2FsbHkuXG4gKlxuICogRm9yIGludGVybmFsIHVzZSBvbmx5LlxuICovXG5leHBvcnQgdHlwZSDJtUdldFByb3BlcnR5PFQsIEs+ID1cbiAgLy8gSyBpcyBhIHN0cmluZ1xuICBLIGV4dGVuZHMgc3RyaW5nXG4gICAgPyDJtUdldFByb3BlcnR5PFQsIMm1Q29lcmNlU3RyQXJyVG9OdW1BcnI8ybVUb2tlbml6ZTxLLCAnLic+Pj5cbiAgICA6IC8vIElzIGl0IGFuIGFycmF5XG4gICAgICDJtVdyaXRlYWJsZTxLPiBleHRlbmRzIEFycmF5PHN0cmluZyB8IG51bWJlcj5cbiAgICAgID8gybVOYXZpZ2F0ZTxULCDJtVdyaXRlYWJsZTxLPj5cbiAgICAgIDogLy8gRmFsbCB0aHJvdWdoIHBlcm1pc3NpdmVseSBpZiB3ZSBjYW4ndCBjYWxjdWxhdGUgdGhlIHR5cGUgb2YgSy5cbiAgICAgICAgYW55O1xuXG4vKipcbiAqIFRoaXMgaXMgdGhlIGJhc2UgY2xhc3MgZm9yIGBGb3JtQ29udHJvbGAsIGBGb3JtR3JvdXBgLCBhbmQgYEZvcm1BcnJheWAuXG4gKlxuICogSXQgcHJvdmlkZXMgc29tZSBvZiB0aGUgc2hhcmVkIGJlaGF2aW9yIHRoYXQgYWxsIGNvbnRyb2xzIGFuZCBncm91cHMgb2YgY29udHJvbHMgaGF2ZSwgbGlrZVxuICogcnVubmluZyB2YWxpZGF0b3JzLCBjYWxjdWxhdGluZyBzdGF0dXMsIGFuZCByZXNldHRpbmcgc3RhdGUuIEl0IGFsc28gZGVmaW5lcyB0aGUgcHJvcGVydGllc1xuICogdGhhdCBhcmUgc2hhcmVkIGJldHdlZW4gYWxsIHN1Yi1jbGFzc2VzLCBsaWtlIGB2YWx1ZWAsIGB2YWxpZGAsIGFuZCBgZGlydHlgLiBJdCBzaG91bGRuJ3QgYmVcbiAqIGluc3RhbnRpYXRlZCBkaXJlY3RseS5cbiAqXG4gKiBUaGUgZmlyc3QgdHlwZSBwYXJhbWV0ZXIgVFZhbHVlIHJlcHJlc2VudHMgdGhlIHZhbHVlIHR5cGUgb2YgdGhlIGNvbnRyb2wgKGBjb250cm9sLnZhbHVlYCkuXG4gKiBUaGUgb3B0aW9uYWwgdHlwZSBwYXJhbWV0ZXIgVFJhd1ZhbHVlICByZXByZXNlbnRzIHRoZSByYXcgdmFsdWUgdHlwZSAoYGNvbnRyb2wuZ2V0UmF3VmFsdWUoKWApLlxuICpcbiAqIEBzZWUgW0Zvcm1zIEd1aWRlXShndWlkZS9mb3JtcylcbiAqIEBzZWUgW1JlYWN0aXZlIEZvcm1zIEd1aWRlXShndWlkZS9mb3Jtcy9yZWFjdGl2ZS1mb3JtcylcbiAqIEBzZWUgW0R5bmFtaWMgRm9ybXMgR3VpZGVdKGd1aWRlL2Zvcm1zL2R5bmFtaWMtZm9ybXMpXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQWJzdHJhY3RDb250cm9sPFRWYWx1ZSA9IGFueSwgVFJhd1ZhbHVlIGV4dGVuZHMgVFZhbHVlID0gVFZhbHVlPiB7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3BlbmRpbmdEaXJ0eSA9IGZhbHNlO1xuXG4gIC8qKlxuICAgKiBJbmRpY2F0ZXMgdGhhdCBhIGNvbnRyb2wgaGFzIGl0cyBvd24gcGVuZGluZyBhc3luY2hyb25vdXMgdmFsaWRhdGlvbiBpbiBwcm9ncmVzcy5cbiAgICogSXQgYWxzbyBzdG9yZXMgaWYgdGhlIGNvbnRyb2wgc2hvdWxkIGVtaXQgZXZlbnRzIHdoZW4gdGhlIHZhbGlkYXRpb24gc3RhdHVzIGNoYW5nZXMuXG4gICAqXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgX2hhc093blBlbmRpbmdBc3luY1ZhbGlkYXRvcjogbnVsbCB8IHtlbWl0RXZlbnQ6IGJvb2xlYW59ID0gbnVsbDtcblxuICAvKiogQGludGVybmFsICovXG4gIF9wZW5kaW5nVG91Y2hlZCA9IGZhbHNlO1xuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX29uQ29sbGVjdGlvbkNoYW5nZSA9ICgpID0+IHt9O1xuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3VwZGF0ZU9uPzogRm9ybUhvb2tzO1xuXG4gIHByaXZhdGUgX3BhcmVudDogRm9ybUdyb3VwIHwgRm9ybUFycmF5IHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgX2FzeW5jVmFsaWRhdGlvblN1YnNjcmlwdGlvbjogYW55O1xuXG4gIC8qKlxuICAgKiBDb250YWlucyB0aGUgcmVzdWx0IG9mIG1lcmdpbmcgc3luY2hyb25vdXMgdmFsaWRhdG9ycyBpbnRvIGEgc2luZ2xlIHZhbGlkYXRvciBmdW5jdGlvblxuICAgKiAoY29tYmluZWQgdXNpbmcgYFZhbGlkYXRvcnMuY29tcG9zZWApLlxuICAgKlxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIHByaXZhdGUgX2NvbXBvc2VkVmFsaWRhdG9yRm4hOiBWYWxpZGF0b3JGbiB8IG51bGw7XG5cbiAgLyoqXG4gICAqIENvbnRhaW5zIHRoZSByZXN1bHQgb2YgbWVyZ2luZyBhc3luY2hyb25vdXMgdmFsaWRhdG9ycyBpbnRvIGEgc2luZ2xlIHZhbGlkYXRvciBmdW5jdGlvblxuICAgKiAoY29tYmluZWQgdXNpbmcgYFZhbGlkYXRvcnMuY29tcG9zZUFzeW5jYCkuXG4gICAqXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgcHJpdmF0ZSBfY29tcG9zZWRBc3luY1ZhbGlkYXRvckZuITogQXN5bmNWYWxpZGF0b3JGbiB8IG51bGw7XG5cbiAgLyoqXG4gICAqIFN5bmNocm9ub3VzIHZhbGlkYXRvcnMgYXMgdGhleSB3ZXJlIHByb3ZpZGVkOlxuICAgKiAgLSBpbiBgQWJzdHJhY3RDb250cm9sYCBjb25zdHJ1Y3RvclxuICAgKiAgLSBhcyBhbiBhcmd1bWVudCB3aGlsZSBjYWxsaW5nIGBzZXRWYWxpZGF0b3JzYCBmdW5jdGlvblxuICAgKiAgLSB3aGlsZSBjYWxsaW5nIHRoZSBzZXR0ZXIgb24gdGhlIGB2YWxpZGF0b3JgIGZpZWxkIChlLmcuIGBjb250cm9sLnZhbGlkYXRvciA9IHZhbGlkYXRvckZuYClcbiAgICpcbiAgICogQGludGVybmFsXG4gICAqL1xuICBwcml2YXRlIF9yYXdWYWxpZGF0b3JzITogVmFsaWRhdG9yRm4gfCBWYWxpZGF0b3JGbltdIHwgbnVsbDtcblxuICAvKipcbiAgICogQXN5bmNocm9ub3VzIHZhbGlkYXRvcnMgYXMgdGhleSB3ZXJlIHByb3ZpZGVkOlxuICAgKiAgLSBpbiBgQWJzdHJhY3RDb250cm9sYCBjb25zdHJ1Y3RvclxuICAgKiAgLSBhcyBhbiBhcmd1bWVudCB3aGlsZSBjYWxsaW5nIGBzZXRBc3luY1ZhbGlkYXRvcnNgIGZ1bmN0aW9uXG4gICAqICAtIHdoaWxlIGNhbGxpbmcgdGhlIHNldHRlciBvbiB0aGUgYGFzeW5jVmFsaWRhdG9yYCBmaWVsZCAoZS5nLiBgY29udHJvbC5hc3luY1ZhbGlkYXRvciA9XG4gICAqIGFzeW5jVmFsaWRhdG9yRm5gKVxuICAgKlxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIHByaXZhdGUgX3Jhd0FzeW5jVmFsaWRhdG9ycyE6IEFzeW5jVmFsaWRhdG9yRm4gfCBBc3luY1ZhbGlkYXRvckZuW10gfCBudWxsO1xuXG4gIC8qKlxuICAgKiBUaGUgY3VycmVudCB2YWx1ZSBvZiB0aGUgY29udHJvbC5cbiAgICpcbiAgICogKiBGb3IgYSBgRm9ybUNvbnRyb2xgLCB0aGUgY3VycmVudCB2YWx1ZS5cbiAgICogKiBGb3IgYW4gZW5hYmxlZCBgRm9ybUdyb3VwYCwgdGhlIHZhbHVlcyBvZiBlbmFibGVkIGNvbnRyb2xzIGFzIGFuIG9iamVjdFxuICAgKiB3aXRoIGEga2V5LXZhbHVlIHBhaXIgZm9yIGVhY2ggbWVtYmVyIG9mIHRoZSBncm91cC5cbiAgICogKiBGb3IgYSBkaXNhYmxlZCBgRm9ybUdyb3VwYCwgdGhlIHZhbHVlcyBvZiBhbGwgY29udHJvbHMgYXMgYW4gb2JqZWN0XG4gICAqIHdpdGggYSBrZXktdmFsdWUgcGFpciBmb3IgZWFjaCBtZW1iZXIgb2YgdGhlIGdyb3VwLlxuICAgKiAqIEZvciBhIGBGb3JtQXJyYXlgLCB0aGUgdmFsdWVzIG9mIGVuYWJsZWQgY29udHJvbHMgYXMgYW4gYXJyYXkuXG4gICAqXG4gICAqL1xuICBwdWJsaWMgcmVhZG9ubHkgdmFsdWUhOiBUVmFsdWU7XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemUgdGhlIEFic3RyYWN0Q29udHJvbCBpbnN0YW5jZS5cbiAgICpcbiAgICogQHBhcmFtIHZhbGlkYXRvcnMgVGhlIGZ1bmN0aW9uIG9yIGFycmF5IG9mIGZ1bmN0aW9ucyB0aGF0IGlzIHVzZWQgdG8gZGV0ZXJtaW5lIHRoZSB2YWxpZGl0eSBvZlxuICAgKiAgICAgdGhpcyBjb250cm9sIHN5bmNocm9ub3VzbHkuXG4gICAqIEBwYXJhbSBhc3luY1ZhbGlkYXRvcnMgVGhlIGZ1bmN0aW9uIG9yIGFycmF5IG9mIGZ1bmN0aW9ucyB0aGF0IGlzIHVzZWQgdG8gZGV0ZXJtaW5lIHZhbGlkaXR5IG9mXG4gICAqICAgICB0aGlzIGNvbnRyb2wgYXN5bmNocm9ub3VzbHkuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihcbiAgICB2YWxpZGF0b3JzOiBWYWxpZGF0b3JGbiB8IFZhbGlkYXRvckZuW10gfCBudWxsLFxuICAgIGFzeW5jVmFsaWRhdG9yczogQXN5bmNWYWxpZGF0b3JGbiB8IEFzeW5jVmFsaWRhdG9yRm5bXSB8IG51bGwsXG4gICkge1xuICAgIHRoaXMuX2Fzc2lnblZhbGlkYXRvcnModmFsaWRhdG9ycyk7XG4gICAgdGhpcy5fYXNzaWduQXN5bmNWYWxpZGF0b3JzKGFzeW5jVmFsaWRhdG9ycyk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgZnVuY3Rpb24gdGhhdCBpcyB1c2VkIHRvIGRldGVybWluZSB0aGUgdmFsaWRpdHkgb2YgdGhpcyBjb250cm9sIHN5bmNocm9ub3VzbHkuXG4gICAqIElmIG11bHRpcGxlIHZhbGlkYXRvcnMgaGF2ZSBiZWVuIGFkZGVkLCB0aGlzIHdpbGwgYmUgYSBzaW5nbGUgY29tcG9zZWQgZnVuY3Rpb24uXG4gICAqIFNlZSBgVmFsaWRhdG9ycy5jb21wb3NlKClgIGZvciBhZGRpdGlvbmFsIGluZm9ybWF0aW9uLlxuICAgKi9cbiAgZ2V0IHZhbGlkYXRvcigpOiBWYWxpZGF0b3JGbiB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLl9jb21wb3NlZFZhbGlkYXRvckZuO1xuICB9XG4gIHNldCB2YWxpZGF0b3IodmFsaWRhdG9yRm46IFZhbGlkYXRvckZuIHwgbnVsbCkge1xuICAgIHRoaXMuX3Jhd1ZhbGlkYXRvcnMgPSB0aGlzLl9jb21wb3NlZFZhbGlkYXRvckZuID0gdmFsaWRhdG9yRm47XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgZnVuY3Rpb24gdGhhdCBpcyB1c2VkIHRvIGRldGVybWluZSB0aGUgdmFsaWRpdHkgb2YgdGhpcyBjb250cm9sIGFzeW5jaHJvbm91c2x5LlxuICAgKiBJZiBtdWx0aXBsZSB2YWxpZGF0b3JzIGhhdmUgYmVlbiBhZGRlZCwgdGhpcyB3aWxsIGJlIGEgc2luZ2xlIGNvbXBvc2VkIGZ1bmN0aW9uLlxuICAgKiBTZWUgYFZhbGlkYXRvcnMuY29tcG9zZSgpYCBmb3IgYWRkaXRpb25hbCBpbmZvcm1hdGlvbi5cbiAgICovXG4gIGdldCBhc3luY1ZhbGlkYXRvcigpOiBBc3luY1ZhbGlkYXRvckZuIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbXBvc2VkQXN5bmNWYWxpZGF0b3JGbjtcbiAgfVxuICBzZXQgYXN5bmNWYWxpZGF0b3IoYXN5bmNWYWxpZGF0b3JGbjogQXN5bmNWYWxpZGF0b3JGbiB8IG51bGwpIHtcbiAgICB0aGlzLl9yYXdBc3luY1ZhbGlkYXRvcnMgPSB0aGlzLl9jb21wb3NlZEFzeW5jVmFsaWRhdG9yRm4gPSBhc3luY1ZhbGlkYXRvckZuO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBwYXJlbnQgY29udHJvbC5cbiAgICovXG4gIGdldCBwYXJlbnQoKTogRm9ybUdyb3VwIHwgRm9ybUFycmF5IHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuX3BhcmVudDtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgdmFsaWRhdGlvbiBzdGF0dXMgb2YgdGhlIGNvbnRyb2wuXG4gICAqXG4gICAqIEBzZWUge0BsaW5rIEZvcm1Db250cm9sU3RhdHVzfVxuICAgKlxuICAgKiBUaGVzZSBzdGF0dXMgdmFsdWVzIGFyZSBtdXR1YWxseSBleGNsdXNpdmUsIHNvIGEgY29udHJvbCBjYW5ub3QgYmVcbiAgICogYm90aCB2YWxpZCBBTkQgaW52YWxpZCBvciBpbnZhbGlkIEFORCBkaXNhYmxlZC5cbiAgICovXG4gIHB1YmxpYyByZWFkb25seSBzdGF0dXMhOiBGb3JtQ29udHJvbFN0YXR1cztcblxuICAvKipcbiAgICogQSBjb250cm9sIGlzIGB2YWxpZGAgd2hlbiBpdHMgYHN0YXR1c2AgaXMgYFZBTElEYC5cbiAgICpcbiAgICogQHNlZSB7QGxpbmsgQWJzdHJhY3RDb250cm9sLnN0YXR1c31cbiAgICpcbiAgICogQHJldHVybnMgVHJ1ZSBpZiB0aGUgY29udHJvbCBoYXMgcGFzc2VkIGFsbCBvZiBpdHMgdmFsaWRhdGlvbiB0ZXN0cyxcbiAgICogZmFsc2Ugb3RoZXJ3aXNlLlxuICAgKi9cbiAgZ2V0IHZhbGlkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnN0YXR1cyA9PT0gVkFMSUQ7XG4gIH1cblxuICAvKipcbiAgICogQSBjb250cm9sIGlzIGBpbnZhbGlkYCB3aGVuIGl0cyBgc3RhdHVzYCBpcyBgSU5WQUxJRGAuXG4gICAqXG4gICAqIEBzZWUge0BsaW5rIEFic3RyYWN0Q29udHJvbC5zdGF0dXN9XG4gICAqXG4gICAqIEByZXR1cm5zIFRydWUgaWYgdGhpcyBjb250cm9sIGhhcyBmYWlsZWQgb25lIG9yIG1vcmUgb2YgaXRzIHZhbGlkYXRpb24gY2hlY2tzLFxuICAgKiBmYWxzZSBvdGhlcndpc2UuXG4gICAqL1xuICBnZXQgaW52YWxpZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5zdGF0dXMgPT09IElOVkFMSUQ7XG4gIH1cblxuICAvKipcbiAgICogQSBjb250cm9sIGlzIGBwZW5kaW5nYCB3aGVuIGl0cyBgc3RhdHVzYCBpcyBgUEVORElOR2AuXG4gICAqXG4gICAqIEBzZWUge0BsaW5rIEFic3RyYWN0Q29udHJvbC5zdGF0dXN9XG4gICAqXG4gICAqIEByZXR1cm5zIFRydWUgaWYgdGhpcyBjb250cm9sIGlzIGluIHRoZSBwcm9jZXNzIG9mIGNvbmR1Y3RpbmcgYSB2YWxpZGF0aW9uIGNoZWNrLFxuICAgKiBmYWxzZSBvdGhlcndpc2UuXG4gICAqL1xuICBnZXQgcGVuZGluZygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5zdGF0dXMgPT0gUEVORElORztcbiAgfVxuXG4gIC8qKlxuICAgKiBBIGNvbnRyb2wgaXMgYGRpc2FibGVkYCB3aGVuIGl0cyBgc3RhdHVzYCBpcyBgRElTQUJMRURgLlxuICAgKlxuICAgKiBEaXNhYmxlZCBjb250cm9scyBhcmUgZXhlbXB0IGZyb20gdmFsaWRhdGlvbiBjaGVja3MgYW5kXG4gICAqIGFyZSBub3QgaW5jbHVkZWQgaW4gdGhlIGFnZ3JlZ2F0ZSB2YWx1ZSBvZiB0aGVpciBhbmNlc3RvclxuICAgKiBjb250cm9scy5cbiAgICpcbiAgICogQHNlZSB7QGxpbmsgQWJzdHJhY3RDb250cm9sLnN0YXR1c31cbiAgICpcbiAgICogQHJldHVybnMgVHJ1ZSBpZiB0aGUgY29udHJvbCBpcyBkaXNhYmxlZCwgZmFsc2Ugb3RoZXJ3aXNlLlxuICAgKi9cbiAgZ2V0IGRpc2FibGVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnN0YXR1cyA9PT0gRElTQUJMRUQ7XG4gIH1cblxuICAvKipcbiAgICogQSBjb250cm9sIGlzIGBlbmFibGVkYCBhcyBsb25nIGFzIGl0cyBgc3RhdHVzYCBpcyBub3QgYERJU0FCTEVEYC5cbiAgICpcbiAgICogQHJldHVybnMgVHJ1ZSBpZiB0aGUgY29udHJvbCBoYXMgYW55IHN0YXR1cyBvdGhlciB0aGFuICdESVNBQkxFRCcsXG4gICAqIGZhbHNlIGlmIHRoZSBzdGF0dXMgaXMgJ0RJU0FCTEVEJy5cbiAgICpcbiAgICogQHNlZSB7QGxpbmsgQWJzdHJhY3RDb250cm9sLnN0YXR1c31cbiAgICpcbiAgICovXG4gIGdldCBlbmFibGVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnN0YXR1cyAhPT0gRElTQUJMRUQ7XG4gIH1cblxuICAvKipcbiAgICogQW4gb2JqZWN0IGNvbnRhaW5pbmcgYW55IGVycm9ycyBnZW5lcmF0ZWQgYnkgZmFpbGluZyB2YWxpZGF0aW9uLFxuICAgKiBvciBudWxsIGlmIHRoZXJlIGFyZSBubyBlcnJvcnMuXG4gICAqL1xuICBwdWJsaWMgcmVhZG9ubHkgZXJyb3JzITogVmFsaWRhdGlvbkVycm9ycyB8IG51bGw7XG5cbiAgLyoqXG4gICAqIEEgY29udHJvbCBpcyBgcHJpc3RpbmVgIGlmIHRoZSB1c2VyIGhhcyBub3QgeWV0IGNoYW5nZWRcbiAgICogdGhlIHZhbHVlIGluIHRoZSBVSS5cbiAgICpcbiAgICogQHJldHVybnMgVHJ1ZSBpZiB0aGUgdXNlciBoYXMgbm90IHlldCBjaGFuZ2VkIHRoZSB2YWx1ZSBpbiB0aGUgVUk7IGNvbXBhcmUgYGRpcnR5YC5cbiAgICogUHJvZ3JhbW1hdGljIGNoYW5nZXMgdG8gYSBjb250cm9sJ3MgdmFsdWUgZG8gbm90IG1hcmsgaXQgZGlydHkuXG4gICAqL1xuICBwdWJsaWMgcmVhZG9ubHkgcHJpc3RpbmU6IGJvb2xlYW4gPSB0cnVlO1xuXG4gIC8qKlxuICAgKiBBIGNvbnRyb2wgaXMgYGRpcnR5YCBpZiB0aGUgdXNlciBoYXMgY2hhbmdlZCB0aGUgdmFsdWVcbiAgICogaW4gdGhlIFVJLlxuICAgKlxuICAgKiBAcmV0dXJucyBUcnVlIGlmIHRoZSB1c2VyIGhhcyBjaGFuZ2VkIHRoZSB2YWx1ZSBvZiB0aGlzIGNvbnRyb2wgaW4gdGhlIFVJOyBjb21wYXJlIGBwcmlzdGluZWAuXG4gICAqIFByb2dyYW1tYXRpYyBjaGFuZ2VzIHRvIGEgY29udHJvbCdzIHZhbHVlIGRvIG5vdCBtYXJrIGl0IGRpcnR5LlxuICAgKi9cbiAgZ2V0IGRpcnR5KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAhdGhpcy5wcmlzdGluZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUcnVlIGlmIHRoZSBjb250cm9sIGlzIG1hcmtlZCBhcyBgdG91Y2hlZGAuXG4gICAqXG4gICAqIEEgY29udHJvbCBpcyBtYXJrZWQgYHRvdWNoZWRgIG9uY2UgdGhlIHVzZXIgaGFzIHRyaWdnZXJlZFxuICAgKiBhIGBibHVyYCBldmVudCBvbiBpdC5cbiAgICovXG4gIHB1YmxpYyByZWFkb25seSB0b3VjaGVkOiBib29sZWFuID0gZmFsc2U7XG5cbiAgLyoqXG4gICAqIFRydWUgaWYgdGhlIGNvbnRyb2wgaGFzIG5vdCBiZWVuIG1hcmtlZCBhcyB0b3VjaGVkXG4gICAqXG4gICAqIEEgY29udHJvbCBpcyBgdW50b3VjaGVkYCBpZiB0aGUgdXNlciBoYXMgbm90IHlldCB0cmlnZ2VyZWRcbiAgICogYSBgYmx1cmAgZXZlbnQgb24gaXQuXG4gICAqL1xuICBnZXQgdW50b3VjaGVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAhdGhpcy50b3VjaGVkO1xuICB9XG5cbiAgLyoqXG4gICAqIEV4cG9zZWQgYXMgb2JzZXJ2YWJsZSwgc2VlIGJlbG93LlxuICAgKlxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIHJlYWRvbmx5IF9ldmVudHMgPSBuZXcgU3ViamVjdDxDb250cm9sRXZlbnQ8VFZhbHVlPj4oKTtcblxuICAvKipcbiAgICogQSBtdWx0aWNhc3Rpbmcgb2JzZXJ2YWJsZSB0aGF0IGVtaXRzIGFuIGV2ZW50IGV2ZXJ5IHRpbWUgdGhlIHN0YXRlIG9mIHRoZSBjb250cm9sIGNoYW5nZXMuXG4gICAqIEl0IGVtaXRzIGZvciB2YWx1ZSwgc3RhdHVzLCBwcmlzdGluZSBvciB0b3VjaGVkIGNoYW5nZXMuXG4gICAqXG4gICAqICoqTm90ZSoqOiBPbiB2YWx1ZSBjaGFuZ2UsIHRoZSBlbWl0IGhhcHBlbnMgcmlnaHQgYWZ0ZXIgYSB2YWx1ZSBvZiB0aGlzIGNvbnRyb2wgaXMgdXBkYXRlZC4gVGhlXG4gICAqIHZhbHVlIG9mIGEgcGFyZW50IGNvbnRyb2wgKGZvciBleGFtcGxlIGlmIHRoaXMgRm9ybUNvbnRyb2wgaXMgYSBwYXJ0IG9mIGEgRm9ybUdyb3VwKSBpcyB1cGRhdGVkXG4gICAqIGxhdGVyLCBzbyBhY2Nlc3NpbmcgYSB2YWx1ZSBvZiBhIHBhcmVudCBjb250cm9sICh1c2luZyB0aGUgYHZhbHVlYCBwcm9wZXJ0eSkgZnJvbSB0aGUgY2FsbGJhY2tcbiAgICogb2YgdGhpcyBldmVudCBtaWdodCByZXN1bHQgaW4gZ2V0dGluZyBhIHZhbHVlIHRoYXQgaGFzIG5vdCBiZWVuIHVwZGF0ZWQgeWV0LiBTdWJzY3JpYmUgdG8gdGhlXG4gICAqIGBldmVudHNgIG9mIHRoZSBwYXJlbnQgY29udHJvbCBpbnN0ZWFkLlxuICAgKiBGb3Igb3RoZXIgZXZlbnQgdHlwZXMsIHRoZSBldmVudHMgYXJlIGVtaXR0ZWQgYWZ0ZXIgdGhlIHBhcmVudCBjb250cm9sIGhhcyBiZWVuIHVwZGF0ZWQuXG4gICAqXG4gICAqL1xuICBwdWJsaWMgcmVhZG9ubHkgZXZlbnRzID0gdGhpcy5fZXZlbnRzLmFzT2JzZXJ2YWJsZSgpO1xuXG4gIC8qKlxuICAgKiBBIG11bHRpY2FzdGluZyBvYnNlcnZhYmxlIHRoYXQgZW1pdHMgYW4gZXZlbnQgZXZlcnkgdGltZSB0aGUgdmFsdWUgb2YgdGhlIGNvbnRyb2wgY2hhbmdlcywgaW5cbiAgICogdGhlIFVJIG9yIHByb2dyYW1tYXRpY2FsbHkuIEl0IGFsc28gZW1pdHMgYW4gZXZlbnQgZWFjaCB0aW1lIHlvdSBjYWxsIGVuYWJsZSgpIG9yIGRpc2FibGUoKVxuICAgKiB3aXRob3V0IHBhc3NpbmcgYWxvbmcge2VtaXRFdmVudDogZmFsc2V9IGFzIGEgZnVuY3Rpb24gYXJndW1lbnQuXG4gICAqXG4gICAqICoqTm90ZSoqOiB0aGUgZW1pdCBoYXBwZW5zIHJpZ2h0IGFmdGVyIGEgdmFsdWUgb2YgdGhpcyBjb250cm9sIGlzIHVwZGF0ZWQuIFRoZSB2YWx1ZSBvZiBhXG4gICAqIHBhcmVudCBjb250cm9sIChmb3IgZXhhbXBsZSBpZiB0aGlzIEZvcm1Db250cm9sIGlzIGEgcGFydCBvZiBhIEZvcm1Hcm91cCkgaXMgdXBkYXRlZCBsYXRlciwgc29cbiAgICogYWNjZXNzaW5nIGEgdmFsdWUgb2YgYSBwYXJlbnQgY29udHJvbCAodXNpbmcgdGhlIGB2YWx1ZWAgcHJvcGVydHkpIGZyb20gdGhlIGNhbGxiYWNrIG9mIHRoaXNcbiAgICogZXZlbnQgbWlnaHQgcmVzdWx0IGluIGdldHRpbmcgYSB2YWx1ZSB0aGF0IGhhcyBub3QgYmVlbiB1cGRhdGVkIHlldC4gU3Vic2NyaWJlIHRvIHRoZVxuICAgKiBgdmFsdWVDaGFuZ2VzYCBldmVudCBvZiB0aGUgcGFyZW50IGNvbnRyb2wgaW5zdGVhZC5cbiAgICpcbiAgICogVE9ETzogdGhpcyBzaG91bGQgYmUgcGlwZWQgZnJvbSBldmVudHMoKSBidXQgaXMgYnJlYWtpbmcgaW4gRzNcbiAgICovXG4gIHB1YmxpYyByZWFkb25seSB2YWx1ZUNoYW5nZXMhOiBPYnNlcnZhYmxlPFRWYWx1ZT47XG5cbiAgLyoqXG4gICAqIEEgbXVsdGljYXN0aW5nIG9ic2VydmFibGUgdGhhdCBlbWl0cyBhbiBldmVudCBldmVyeSB0aW1lIHRoZSB2YWxpZGF0aW9uIGBzdGF0dXNgIG9mIHRoZSBjb250cm9sXG4gICAqIHJlY2FsY3VsYXRlcy5cbiAgICpcbiAgICogQHNlZSB7QGxpbmsgRm9ybUNvbnRyb2xTdGF0dXN9XG4gICAqIEBzZWUge0BsaW5rIEFic3RyYWN0Q29udHJvbC5zdGF0dXN9XG4gICAqXG4gICAqIFRPRE86IHRoaXMgc2hvdWxkIGJlIHBpcGVkIGZyb20gZXZlbnRzKCkgYnV0IGlzIGJyZWFraW5nIGluIEczXG4gICAqL1xuICBwdWJsaWMgcmVhZG9ubHkgc3RhdHVzQ2hhbmdlcyE6IE9ic2VydmFibGU8Rm9ybUNvbnRyb2xTdGF0dXM+O1xuXG4gIC8qKlxuICAgKiBSZXBvcnRzIHRoZSB1cGRhdGUgc3RyYXRlZ3kgb2YgdGhlIGBBYnN0cmFjdENvbnRyb2xgIChtZWFuaW5nXG4gICAqIHRoZSBldmVudCBvbiB3aGljaCB0aGUgY29udHJvbCB1cGRhdGVzIGl0c2VsZikuXG4gICAqIFBvc3NpYmxlIHZhbHVlczogYCdjaGFuZ2UnYCB8IGAnYmx1cidgIHwgYCdzdWJtaXQnYFxuICAgKiBEZWZhdWx0IHZhbHVlOiBgJ2NoYW5nZSdgXG4gICAqL1xuICBnZXQgdXBkYXRlT24oKTogRm9ybUhvb2tzIHtcbiAgICByZXR1cm4gdGhpcy5fdXBkYXRlT24gPyB0aGlzLl91cGRhdGVPbiA6IHRoaXMucGFyZW50ID8gdGhpcy5wYXJlbnQudXBkYXRlT24gOiAnY2hhbmdlJztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBzeW5jaHJvbm91cyB2YWxpZGF0b3JzIHRoYXQgYXJlIGFjdGl2ZSBvbiB0aGlzIGNvbnRyb2wuICBDYWxsaW5nXG4gICAqIHRoaXMgb3ZlcndyaXRlcyBhbnkgZXhpc3Rpbmcgc3luY2hyb25vdXMgdmFsaWRhdG9ycy5cbiAgICpcbiAgICogV2hlbiB5b3UgYWRkIG9yIHJlbW92ZSBhIHZhbGlkYXRvciBhdCBydW4gdGltZSwgeW91IG11c3QgY2FsbFxuICAgKiBgdXBkYXRlVmFsdWVBbmRWYWxpZGl0eSgpYCBmb3IgdGhlIG5ldyB2YWxpZGF0aW9uIHRvIHRha2UgZWZmZWN0LlxuICAgKlxuICAgKiBJZiB5b3Ugd2FudCB0byBhZGQgYSBuZXcgdmFsaWRhdG9yIHdpdGhvdXQgYWZmZWN0aW5nIGV4aXN0aW5nIG9uZXMsIGNvbnNpZGVyXG4gICAqIHVzaW5nIGBhZGRWYWxpZGF0b3JzKClgIG1ldGhvZCBpbnN0ZWFkLlxuICAgKi9cbiAgc2V0VmFsaWRhdG9ycyh2YWxpZGF0b3JzOiBWYWxpZGF0b3JGbiB8IFZhbGlkYXRvckZuW10gfCBudWxsKTogdm9pZCB7XG4gICAgdGhpcy5fYXNzaWduVmFsaWRhdG9ycyh2YWxpZGF0b3JzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBhc3luY2hyb25vdXMgdmFsaWRhdG9ycyB0aGF0IGFyZSBhY3RpdmUgb24gdGhpcyBjb250cm9sLiBDYWxsaW5nIHRoaXNcbiAgICogb3ZlcndyaXRlcyBhbnkgZXhpc3RpbmcgYXN5bmNocm9ub3VzIHZhbGlkYXRvcnMuXG4gICAqXG4gICAqIFdoZW4geW91IGFkZCBvciByZW1vdmUgYSB2YWxpZGF0b3IgYXQgcnVuIHRpbWUsIHlvdSBtdXN0IGNhbGxcbiAgICogYHVwZGF0ZVZhbHVlQW5kVmFsaWRpdHkoKWAgZm9yIHRoZSBuZXcgdmFsaWRhdGlvbiB0byB0YWtlIGVmZmVjdC5cbiAgICpcbiAgICogSWYgeW91IHdhbnQgdG8gYWRkIGEgbmV3IHZhbGlkYXRvciB3aXRob3V0IGFmZmVjdGluZyBleGlzdGluZyBvbmVzLCBjb25zaWRlclxuICAgKiB1c2luZyBgYWRkQXN5bmNWYWxpZGF0b3JzKClgIG1ldGhvZCBpbnN0ZWFkLlxuICAgKi9cbiAgc2V0QXN5bmNWYWxpZGF0b3JzKHZhbGlkYXRvcnM6IEFzeW5jVmFsaWRhdG9yRm4gfCBBc3luY1ZhbGlkYXRvckZuW10gfCBudWxsKTogdm9pZCB7XG4gICAgdGhpcy5fYXNzaWduQXN5bmNWYWxpZGF0b3JzKHZhbGlkYXRvcnMpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhIHN5bmNocm9ub3VzIHZhbGlkYXRvciBvciB2YWxpZGF0b3JzIHRvIHRoaXMgY29udHJvbCwgd2l0aG91dCBhZmZlY3Rpbmcgb3RoZXIgdmFsaWRhdG9ycy5cbiAgICpcbiAgICogV2hlbiB5b3UgYWRkIG9yIHJlbW92ZSBhIHZhbGlkYXRvciBhdCBydW4gdGltZSwgeW91IG11c3QgY2FsbFxuICAgKiBgdXBkYXRlVmFsdWVBbmRWYWxpZGl0eSgpYCBmb3IgdGhlIG5ldyB2YWxpZGF0aW9uIHRvIHRha2UgZWZmZWN0LlxuICAgKlxuICAgKiBBZGRpbmcgYSB2YWxpZGF0b3IgdGhhdCBhbHJlYWR5IGV4aXN0cyB3aWxsIGhhdmUgbm8gZWZmZWN0LiBJZiBkdXBsaWNhdGUgdmFsaWRhdG9yIGZ1bmN0aW9uc1xuICAgKiBhcmUgcHJlc2VudCBpbiB0aGUgYHZhbGlkYXRvcnNgIGFycmF5LCBvbmx5IHRoZSBmaXJzdCBpbnN0YW5jZSB3b3VsZCBiZSBhZGRlZCB0byBhIGZvcm1cbiAgICogY29udHJvbC5cbiAgICpcbiAgICogQHBhcmFtIHZhbGlkYXRvcnMgVGhlIG5ldyB2YWxpZGF0b3IgZnVuY3Rpb24gb3IgZnVuY3Rpb25zIHRvIGFkZCB0byB0aGlzIGNvbnRyb2wuXG4gICAqL1xuICBhZGRWYWxpZGF0b3JzKHZhbGlkYXRvcnM6IFZhbGlkYXRvckZuIHwgVmFsaWRhdG9yRm5bXSk6IHZvaWQge1xuICAgIHRoaXMuc2V0VmFsaWRhdG9ycyhhZGRWYWxpZGF0b3JzKHZhbGlkYXRvcnMsIHRoaXMuX3Jhd1ZhbGlkYXRvcnMpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgYW4gYXN5bmNocm9ub3VzIHZhbGlkYXRvciBvciB2YWxpZGF0b3JzIHRvIHRoaXMgY29udHJvbCwgd2l0aG91dCBhZmZlY3Rpbmcgb3RoZXJcbiAgICogdmFsaWRhdG9ycy5cbiAgICpcbiAgICogV2hlbiB5b3UgYWRkIG9yIHJlbW92ZSBhIHZhbGlkYXRvciBhdCBydW4gdGltZSwgeW91IG11c3QgY2FsbFxuICAgKiBgdXBkYXRlVmFsdWVBbmRWYWxpZGl0eSgpYCBmb3IgdGhlIG5ldyB2YWxpZGF0aW9uIHRvIHRha2UgZWZmZWN0LlxuICAgKlxuICAgKiBBZGRpbmcgYSB2YWxpZGF0b3IgdGhhdCBhbHJlYWR5IGV4aXN0cyB3aWxsIGhhdmUgbm8gZWZmZWN0LlxuICAgKlxuICAgKiBAcGFyYW0gdmFsaWRhdG9ycyBUaGUgbmV3IGFzeW5jaHJvbm91cyB2YWxpZGF0b3IgZnVuY3Rpb24gb3IgZnVuY3Rpb25zIHRvIGFkZCB0byB0aGlzIGNvbnRyb2wuXG4gICAqL1xuICBhZGRBc3luY1ZhbGlkYXRvcnModmFsaWRhdG9yczogQXN5bmNWYWxpZGF0b3JGbiB8IEFzeW5jVmFsaWRhdG9yRm5bXSk6IHZvaWQge1xuICAgIHRoaXMuc2V0QXN5bmNWYWxpZGF0b3JzKGFkZFZhbGlkYXRvcnModmFsaWRhdG9ycywgdGhpcy5fcmF3QXN5bmNWYWxpZGF0b3JzKSk7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGEgc3luY2hyb25vdXMgdmFsaWRhdG9yIGZyb20gdGhpcyBjb250cm9sLCB3aXRob3V0IGFmZmVjdGluZyBvdGhlciB2YWxpZGF0b3JzLlxuICAgKiBWYWxpZGF0b3JzIGFyZSBjb21wYXJlZCBieSBmdW5jdGlvbiByZWZlcmVuY2U7IHlvdSBtdXN0IHBhc3MgYSByZWZlcmVuY2UgdG8gdGhlIGV4YWN0IHNhbWVcbiAgICogdmFsaWRhdG9yIGZ1bmN0aW9uIGFzIHRoZSBvbmUgdGhhdCB3YXMgb3JpZ2luYWxseSBzZXQuIElmIGEgcHJvdmlkZWQgdmFsaWRhdG9yIGlzIG5vdCBmb3VuZCxcbiAgICogaXQgaXMgaWdub3JlZC5cbiAgICpcbiAgICogQHVzYWdlTm90ZXNcbiAgICpcbiAgICogIyMjIFJlZmVyZW5jZSB0byBhIFZhbGlkYXRvckZuXG4gICAqXG4gICAqIGBgYFxuICAgKiAvLyBSZWZlcmVuY2UgdG8gdGhlIFJlcXVpcmVkVmFsaWRhdG9yXG4gICAqIGNvbnN0IGN0cmwgPSBuZXcgRm9ybUNvbnRyb2w8c3RyaW5nIHwgbnVsbD4oJycsIFZhbGlkYXRvcnMucmVxdWlyZWQpO1xuICAgKiBjdHJsLnJlbW92ZVZhbGlkYXRvcnMoVmFsaWRhdG9ycy5yZXF1aXJlZCk7XG4gICAqXG4gICAqIC8vIFJlZmVyZW5jZSB0byBhbm9ueW1vdXMgZnVuY3Rpb24gaW5zaWRlIE1pblZhbGlkYXRvclxuICAgKiBjb25zdCBtaW5WYWxpZGF0b3IgPSBWYWxpZGF0b3JzLm1pbigzKTtcbiAgICogY29uc3QgY3RybCA9IG5ldyBGb3JtQ29udHJvbDxzdHJpbmcgfCBudWxsPignJywgbWluVmFsaWRhdG9yKTtcbiAgICogZXhwZWN0KGN0cmwuaGFzVmFsaWRhdG9yKG1pblZhbGlkYXRvcikpLnRvRXF1YWwodHJ1ZSlcbiAgICogZXhwZWN0KGN0cmwuaGFzVmFsaWRhdG9yKFZhbGlkYXRvcnMubWluKDMpKSkudG9FcXVhbChmYWxzZSlcbiAgICpcbiAgICogY3RybC5yZW1vdmVWYWxpZGF0b3JzKG1pblZhbGlkYXRvcik7XG4gICAqIGBgYFxuICAgKlxuICAgKiBXaGVuIHlvdSBhZGQgb3IgcmVtb3ZlIGEgdmFsaWRhdG9yIGF0IHJ1biB0aW1lLCB5b3UgbXVzdCBjYWxsXG4gICAqIGB1cGRhdGVWYWx1ZUFuZFZhbGlkaXR5KClgIGZvciB0aGUgbmV3IHZhbGlkYXRpb24gdG8gdGFrZSBlZmZlY3QuXG4gICAqXG4gICAqIEBwYXJhbSB2YWxpZGF0b3JzIFRoZSB2YWxpZGF0b3Igb3IgdmFsaWRhdG9ycyB0byByZW1vdmUuXG4gICAqL1xuICByZW1vdmVWYWxpZGF0b3JzKHZhbGlkYXRvcnM6IFZhbGlkYXRvckZuIHwgVmFsaWRhdG9yRm5bXSk6IHZvaWQge1xuICAgIHRoaXMuc2V0VmFsaWRhdG9ycyhyZW1vdmVWYWxpZGF0b3JzKHZhbGlkYXRvcnMsIHRoaXMuX3Jhd1ZhbGlkYXRvcnMpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgYW4gYXN5bmNocm9ub3VzIHZhbGlkYXRvciBmcm9tIHRoaXMgY29udHJvbCwgd2l0aG91dCBhZmZlY3Rpbmcgb3RoZXIgdmFsaWRhdG9ycy5cbiAgICogVmFsaWRhdG9ycyBhcmUgY29tcGFyZWQgYnkgZnVuY3Rpb24gcmVmZXJlbmNlOyB5b3UgbXVzdCBwYXNzIGEgcmVmZXJlbmNlIHRvIHRoZSBleGFjdCBzYW1lXG4gICAqIHZhbGlkYXRvciBmdW5jdGlvbiBhcyB0aGUgb25lIHRoYXQgd2FzIG9yaWdpbmFsbHkgc2V0LiBJZiBhIHByb3ZpZGVkIHZhbGlkYXRvciBpcyBub3QgZm91bmQsIGl0XG4gICAqIGlzIGlnbm9yZWQuXG4gICAqXG4gICAqIFdoZW4geW91IGFkZCBvciByZW1vdmUgYSB2YWxpZGF0b3IgYXQgcnVuIHRpbWUsIHlvdSBtdXN0IGNhbGxcbiAgICogYHVwZGF0ZVZhbHVlQW5kVmFsaWRpdHkoKWAgZm9yIHRoZSBuZXcgdmFsaWRhdGlvbiB0byB0YWtlIGVmZmVjdC5cbiAgICpcbiAgICogQHBhcmFtIHZhbGlkYXRvcnMgVGhlIGFzeW5jaHJvbm91cyB2YWxpZGF0b3Igb3IgdmFsaWRhdG9ycyB0byByZW1vdmUuXG4gICAqL1xuICByZW1vdmVBc3luY1ZhbGlkYXRvcnModmFsaWRhdG9yczogQXN5bmNWYWxpZGF0b3JGbiB8IEFzeW5jVmFsaWRhdG9yRm5bXSk6IHZvaWQge1xuICAgIHRoaXMuc2V0QXN5bmNWYWxpZGF0b3JzKHJlbW92ZVZhbGlkYXRvcnModmFsaWRhdG9ycywgdGhpcy5fcmF3QXN5bmNWYWxpZGF0b3JzKSk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgd2hldGhlciBhIHN5bmNocm9ub3VzIHZhbGlkYXRvciBmdW5jdGlvbiBpcyBwcmVzZW50IG9uIHRoaXMgY29udHJvbC4gVGhlIHByb3ZpZGVkXG4gICAqIHZhbGlkYXRvciBtdXN0IGJlIGEgcmVmZXJlbmNlIHRvIHRoZSBleGFjdCBzYW1lIGZ1bmN0aW9uIHRoYXQgd2FzIHByb3ZpZGVkLlxuICAgKlxuICAgKiBAdXNhZ2VOb3Rlc1xuICAgKlxuICAgKiAjIyMgUmVmZXJlbmNlIHRvIGEgVmFsaWRhdG9yRm5cbiAgICpcbiAgICogYGBgXG4gICAqIC8vIFJlZmVyZW5jZSB0byB0aGUgUmVxdWlyZWRWYWxpZGF0b3JcbiAgICogY29uc3QgY3RybCA9IG5ldyBGb3JtQ29udHJvbDxudW1iZXIgfCBudWxsPigwLCBWYWxpZGF0b3JzLnJlcXVpcmVkKTtcbiAgICogZXhwZWN0KGN0cmwuaGFzVmFsaWRhdG9yKFZhbGlkYXRvcnMucmVxdWlyZWQpKS50b0VxdWFsKHRydWUpXG4gICAqXG4gICAqIC8vIFJlZmVyZW5jZSB0byBhbm9ueW1vdXMgZnVuY3Rpb24gaW5zaWRlIE1pblZhbGlkYXRvclxuICAgKiBjb25zdCBtaW5WYWxpZGF0b3IgPSBWYWxpZGF0b3JzLm1pbigzKTtcbiAgICogY29uc3QgY3RybCA9IG5ldyBGb3JtQ29udHJvbDxudW1iZXIgfCBudWxsPigwLCBtaW5WYWxpZGF0b3IpO1xuICAgKiBleHBlY3QoY3RybC5oYXNWYWxpZGF0b3IobWluVmFsaWRhdG9yKSkudG9FcXVhbCh0cnVlKVxuICAgKiBleHBlY3QoY3RybC5oYXNWYWxpZGF0b3IoVmFsaWRhdG9ycy5taW4oMykpKS50b0VxdWFsKGZhbHNlKVxuICAgKiBgYGBcbiAgICpcbiAgICogQHBhcmFtIHZhbGlkYXRvciBUaGUgdmFsaWRhdG9yIHRvIGNoZWNrIGZvciBwcmVzZW5jZS4gQ29tcGFyZWQgYnkgZnVuY3Rpb24gcmVmZXJlbmNlLlxuICAgKiBAcmV0dXJucyBXaGV0aGVyIHRoZSBwcm92aWRlZCB2YWxpZGF0b3Igd2FzIGZvdW5kIG9uIHRoaXMgY29udHJvbC5cbiAgICovXG4gIGhhc1ZhbGlkYXRvcih2YWxpZGF0b3I6IFZhbGlkYXRvckZuKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGhhc1ZhbGlkYXRvcih0aGlzLl9yYXdWYWxpZGF0b3JzLCB2YWxpZGF0b3IpO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIHdoZXRoZXIgYW4gYXN5bmNocm9ub3VzIHZhbGlkYXRvciBmdW5jdGlvbiBpcyBwcmVzZW50IG9uIHRoaXMgY29udHJvbC4gVGhlIHByb3ZpZGVkXG4gICAqIHZhbGlkYXRvciBtdXN0IGJlIGEgcmVmZXJlbmNlIHRvIHRoZSBleGFjdCBzYW1lIGZ1bmN0aW9uIHRoYXQgd2FzIHByb3ZpZGVkLlxuICAgKlxuICAgKiBAcGFyYW0gdmFsaWRhdG9yIFRoZSBhc3luY2hyb25vdXMgdmFsaWRhdG9yIHRvIGNoZWNrIGZvciBwcmVzZW5jZS4gQ29tcGFyZWQgYnkgZnVuY3Rpb25cbiAgICogICAgIHJlZmVyZW5jZS5cbiAgICogQHJldHVybnMgV2hldGhlciB0aGUgcHJvdmlkZWQgYXN5bmNocm9ub3VzIHZhbGlkYXRvciB3YXMgZm91bmQgb24gdGhpcyBjb250cm9sLlxuICAgKi9cbiAgaGFzQXN5bmNWYWxpZGF0b3IodmFsaWRhdG9yOiBBc3luY1ZhbGlkYXRvckZuKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGhhc1ZhbGlkYXRvcih0aGlzLl9yYXdBc3luY1ZhbGlkYXRvcnMsIHZhbGlkYXRvcik7XG4gIH1cblxuICAvKipcbiAgICogRW1wdGllcyBvdXQgdGhlIHN5bmNocm9ub3VzIHZhbGlkYXRvciBsaXN0LlxuICAgKlxuICAgKiBXaGVuIHlvdSBhZGQgb3IgcmVtb3ZlIGEgdmFsaWRhdG9yIGF0IHJ1biB0aW1lLCB5b3UgbXVzdCBjYWxsXG4gICAqIGB1cGRhdGVWYWx1ZUFuZFZhbGlkaXR5KClgIGZvciB0aGUgbmV3IHZhbGlkYXRpb24gdG8gdGFrZSBlZmZlY3QuXG4gICAqXG4gICAqL1xuICBjbGVhclZhbGlkYXRvcnMoKTogdm9pZCB7XG4gICAgdGhpcy52YWxpZGF0b3IgPSBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIEVtcHRpZXMgb3V0IHRoZSBhc3luYyB2YWxpZGF0b3IgbGlzdC5cbiAgICpcbiAgICogV2hlbiB5b3UgYWRkIG9yIHJlbW92ZSBhIHZhbGlkYXRvciBhdCBydW4gdGltZSwgeW91IG11c3QgY2FsbFxuICAgKiBgdXBkYXRlVmFsdWVBbmRWYWxpZGl0eSgpYCBmb3IgdGhlIG5ldyB2YWxpZGF0aW9uIHRvIHRha2UgZWZmZWN0LlxuICAgKlxuICAgKi9cbiAgY2xlYXJBc3luY1ZhbGlkYXRvcnMoKTogdm9pZCB7XG4gICAgdGhpcy5hc3luY1ZhbGlkYXRvciA9IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogTWFya3MgdGhlIGNvbnRyb2wgYXMgYHRvdWNoZWRgLiBBIGNvbnRyb2wgaXMgdG91Y2hlZCBieSBmb2N1cyBhbmRcbiAgICogYmx1ciBldmVudHMgdGhhdCBkbyBub3QgY2hhbmdlIHRoZSB2YWx1ZS5cbiAgICpcbiAgICogQHNlZSB7QGxpbmsgbWFya0FzVW50b3VjaGVkKCl9XG4gICAqIEBzZWUge0BsaW5rIG1hcmtBc0RpcnR5KCl9XG4gICAqIEBzZWUge0BsaW5rIG1hcmtBc1ByaXN0aW5lKCl9XG4gICAqXG4gICAqIEBwYXJhbSBvcHRzIENvbmZpZ3VyYXRpb24gb3B0aW9ucyB0aGF0IGRldGVybWluZSBob3cgdGhlIGNvbnRyb2wgcHJvcGFnYXRlcyBjaGFuZ2VzXG4gICAqIGFuZCBlbWl0cyBldmVudHMgYWZ0ZXIgbWFya2luZyBpcyBhcHBsaWVkLlxuICAgKiAqIGBvbmx5U2VsZmA6IFdoZW4gdHJ1ZSwgbWFyayBvbmx5IHRoaXMgY29udHJvbC4gV2hlbiBmYWxzZSBvciBub3Qgc3VwcGxpZWQsXG4gICAqIG1hcmtzIGFsbCBkaXJlY3QgYW5jZXN0b3JzLiBEZWZhdWx0IGlzIGZhbHNlLlxuICAgKiAqIGBlbWl0RXZlbnRgOiBXaGVuIHRydWUgb3Igbm90IHN1cHBsaWVkICh0aGUgZGVmYXVsdCksIHRoZSBgZXZlbnRzYFxuICAgKiBvYnNlcnZhYmxlIGVtaXRzIGEgYFRvdWNoZWRDaGFuZ2VFdmVudGAgd2l0aCB0aGUgYHRvdWNoZWRgIHByb3BlcnR5IGJlaW5nIGB0cnVlYC5cbiAgICogV2hlbiBmYWxzZSwgbm8gZXZlbnRzIGFyZSBlbWl0dGVkLlxuICAgKi9cbiAgbWFya0FzVG91Y2hlZChvcHRzPzoge29ubHlTZWxmPzogYm9vbGVhbjsgZW1pdEV2ZW50PzogYm9vbGVhbn0pOiB2b2lkO1xuICAvKipcbiAgICogQGludGVybmFsIFVzZWQgdG8gcHJvcGFnYXRlIHRoZSBzb3VyY2UgY29udHJvbCBkb3dud2FyZHNcbiAgICovXG4gIG1hcmtBc1RvdWNoZWQob3B0cz86IHtcbiAgICBvbmx5U2VsZj86IGJvb2xlYW47XG4gICAgZW1pdEV2ZW50PzogYm9vbGVhbjtcbiAgICBzb3VyY2VDb250cm9sPzogQWJzdHJhY3RDb250cm9sO1xuICB9KTogdm9pZDtcbiAgbWFya0FzVG91Y2hlZChcbiAgICBvcHRzOiB7b25seVNlbGY/OiBib29sZWFuOyBlbWl0RXZlbnQ/OiBib29sZWFuOyBzb3VyY2VDb250cm9sPzogQWJzdHJhY3RDb250cm9sfSA9IHt9LFxuICApOiB2b2lkIHtcbiAgICBjb25zdCBjaGFuZ2VkID0gdGhpcy50b3VjaGVkID09PSBmYWxzZTtcbiAgICAodGhpcyBhcyBXcml0YWJsZTx0aGlzPikudG91Y2hlZCA9IHRydWU7XG5cbiAgICBjb25zdCBzb3VyY2VDb250cm9sID0gb3B0cy5zb3VyY2VDb250cm9sID8/IHRoaXM7XG4gICAgaWYgKHRoaXMuX3BhcmVudCAmJiAhb3B0cy5vbmx5U2VsZikge1xuICAgICAgdGhpcy5fcGFyZW50Lm1hcmtBc1RvdWNoZWQoey4uLm9wdHMsIHNvdXJjZUNvbnRyb2x9KTtcbiAgICB9XG5cbiAgICBpZiAoY2hhbmdlZCAmJiBvcHRzLmVtaXRFdmVudCAhPT0gZmFsc2UpIHtcbiAgICAgIHRoaXMuX2V2ZW50cy5uZXh0KG5ldyBUb3VjaGVkQ2hhbmdlRXZlbnQodHJ1ZSwgc291cmNlQ29udHJvbCkpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBNYXJrcyB0aGUgY29udHJvbCBhbmQgYWxsIGl0cyBkZXNjZW5kYW50IGNvbnRyb2xzIGFzIGB0b3VjaGVkYC5cbiAgICogQHNlZSB7QGxpbmsgbWFya0FzVG91Y2hlZCgpfVxuICAgKlxuICAgKiBAcGFyYW0gb3B0cyBDb25maWd1cmF0aW9uIG9wdGlvbnMgdGhhdCBkZXRlcm1pbmUgaG93IHRoZSBjb250cm9sIHByb3BhZ2F0ZXMgY2hhbmdlc1xuICAgKiBhbmQgZW1pdHMgZXZlbnRzIGFmdGVyIG1hcmtpbmcgaXMgYXBwbGllZC5cbiAgICogKiBgZW1pdEV2ZW50YDogV2hlbiB0cnVlIG9yIG5vdCBzdXBwbGllZCAodGhlIGRlZmF1bHQpLCB0aGUgYGV2ZW50c2BcbiAgICogb2JzZXJ2YWJsZSBlbWl0cyBhIGBUb3VjaGVkQ2hhbmdlRXZlbnRgIHdpdGggdGhlIGB0b3VjaGVkYCBwcm9wZXJ0eSBiZWluZyBgdHJ1ZWAuXG4gICAqIFdoZW4gZmFsc2UsIG5vIGV2ZW50cyBhcmUgZW1pdHRlZC5cbiAgICovXG4gIG1hcmtBbGxBc1RvdWNoZWQob3B0czoge2VtaXRFdmVudD86IGJvb2xlYW59ID0ge30pOiB2b2lkIHtcbiAgICB0aGlzLm1hcmtBc1RvdWNoZWQoe29ubHlTZWxmOiB0cnVlLCBlbWl0RXZlbnQ6IG9wdHMuZW1pdEV2ZW50LCBzb3VyY2VDb250cm9sOiB0aGlzfSk7XG5cbiAgICB0aGlzLl9mb3JFYWNoQ2hpbGQoKGNvbnRyb2w6IEFic3RyYWN0Q29udHJvbCkgPT4gY29udHJvbC5tYXJrQWxsQXNUb3VjaGVkKG9wdHMpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNYXJrcyB0aGUgY29udHJvbCBhcyBgdW50b3VjaGVkYC5cbiAgICpcbiAgICogSWYgdGhlIGNvbnRyb2wgaGFzIGFueSBjaGlsZHJlbiwgYWxzbyBtYXJrcyBhbGwgY2hpbGRyZW4gYXMgYHVudG91Y2hlZGBcbiAgICogYW5kIHJlY2FsY3VsYXRlcyB0aGUgYHRvdWNoZWRgIHN0YXR1cyBvZiBhbGwgcGFyZW50IGNvbnRyb2xzLlxuICAgKlxuICAgKiBAc2VlIHtAbGluayBtYXJrQXNUb3VjaGVkKCl9XG4gICAqIEBzZWUge0BsaW5rIG1hcmtBc0RpcnR5KCl9XG4gICAqIEBzZWUge0BsaW5rIG1hcmtBc1ByaXN0aW5lKCl9XG4gICAqXG4gICAqIEBwYXJhbSBvcHRzIENvbmZpZ3VyYXRpb24gb3B0aW9ucyB0aGF0IGRldGVybWluZSBob3cgdGhlIGNvbnRyb2wgcHJvcGFnYXRlcyBjaGFuZ2VzXG4gICAqIGFuZCBlbWl0cyBldmVudHMgYWZ0ZXIgdGhlIG1hcmtpbmcgaXMgYXBwbGllZC5cbiAgICogKiBgb25seVNlbGZgOiBXaGVuIHRydWUsIG1hcmsgb25seSB0aGlzIGNvbnRyb2wuIFdoZW4gZmFsc2Ugb3Igbm90IHN1cHBsaWVkLFxuICAgKiBtYXJrcyBhbGwgZGlyZWN0IGFuY2VzdG9ycy4gRGVmYXVsdCBpcyBmYWxzZS5cbiAgICogKiBgZW1pdEV2ZW50YDogV2hlbiB0cnVlIG9yIG5vdCBzdXBwbGllZCAodGhlIGRlZmF1bHQpLCB0aGUgYGV2ZW50c2BcbiAgICogb2JzZXJ2YWJsZSBlbWl0cyBhIGBUb3VjaGVkQ2hhbmdlRXZlbnRgIHdpdGggdGhlIGB0b3VjaGVkYCBwcm9wZXJ0eSBiZWluZyBgZmFsc2VgLlxuICAgKiBXaGVuIGZhbHNlLCBubyBldmVudHMgYXJlIGVtaXR0ZWQuXG4gICAqL1xuICBtYXJrQXNVbnRvdWNoZWQob3B0cz86IHtvbmx5U2VsZj86IGJvb2xlYW47IGVtaXRFdmVudD86IGJvb2xlYW59KTogdm9pZDtcbiAgLyoqXG4gICAqXG4gICAqIEBpbnRlcm5hbCBVc2VkIHRvIHByb3BhZ2F0ZSB0aGUgc291cmNlIGNvbnRyb2wgZG93bndhcmRzXG4gICAqL1xuICBtYXJrQXNVbnRvdWNoZWQob3B0czoge1xuICAgIG9ubHlTZWxmPzogYm9vbGVhbjtcbiAgICBlbWl0RXZlbnQ/OiBib29sZWFuO1xuICAgIHNvdXJjZUNvbnRyb2w/OiBBYnN0cmFjdENvbnRyb2w7XG4gIH0pOiB2b2lkO1xuICBtYXJrQXNVbnRvdWNoZWQoXG4gICAgb3B0czoge29ubHlTZWxmPzogYm9vbGVhbjsgZW1pdEV2ZW50PzogYm9vbGVhbjsgc291cmNlQ29udHJvbD86IEFic3RyYWN0Q29udHJvbH0gPSB7fSxcbiAgKTogdm9pZCB7XG4gICAgY29uc3QgY2hhbmdlZCA9IHRoaXMudG91Y2hlZCA9PT0gdHJ1ZTtcbiAgICAodGhpcyBhcyBXcml0YWJsZTx0aGlzPikudG91Y2hlZCA9IGZhbHNlO1xuICAgIHRoaXMuX3BlbmRpbmdUb3VjaGVkID0gZmFsc2U7XG5cbiAgICBjb25zdCBzb3VyY2VDb250cm9sID0gb3B0cy5zb3VyY2VDb250cm9sID8/IHRoaXM7XG4gICAgdGhpcy5fZm9yRWFjaENoaWxkKChjb250cm9sOiBBYnN0cmFjdENvbnRyb2wpID0+IHtcbiAgICAgIGNvbnRyb2wubWFya0FzVW50b3VjaGVkKHtvbmx5U2VsZjogdHJ1ZSwgZW1pdEV2ZW50OiBvcHRzLmVtaXRFdmVudCwgc291cmNlQ29udHJvbH0pO1xuICAgIH0pO1xuXG4gICAgaWYgKHRoaXMuX3BhcmVudCAmJiAhb3B0cy5vbmx5U2VsZikge1xuICAgICAgdGhpcy5fcGFyZW50Ll91cGRhdGVUb3VjaGVkKG9wdHMsIHNvdXJjZUNvbnRyb2wpO1xuICAgIH1cblxuICAgIGlmIChjaGFuZ2VkICYmIG9wdHMuZW1pdEV2ZW50ICE9PSBmYWxzZSkge1xuICAgICAgdGhpcy5fZXZlbnRzLm5leHQobmV3IFRvdWNoZWRDaGFuZ2VFdmVudChmYWxzZSwgc291cmNlQ29udHJvbCkpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBNYXJrcyB0aGUgY29udHJvbCBhcyBgZGlydHlgLiBBIGNvbnRyb2wgYmVjb21lcyBkaXJ0eSB3aGVuXG4gICAqIHRoZSBjb250cm9sJ3MgdmFsdWUgaXMgY2hhbmdlZCB0aHJvdWdoIHRoZSBVSTsgY29tcGFyZSBgbWFya0FzVG91Y2hlZGAuXG4gICAqXG4gICAqIEBzZWUge0BsaW5rIG1hcmtBc1RvdWNoZWQoKX1cbiAgICogQHNlZSB7QGxpbmsgbWFya0FzVW50b3VjaGVkKCl9XG4gICAqIEBzZWUge0BsaW5rIG1hcmtBc1ByaXN0aW5lKCl9XG4gICAqXG4gICAqIEBwYXJhbSBvcHRzIENvbmZpZ3VyYXRpb24gb3B0aW9ucyB0aGF0IGRldGVybWluZSBob3cgdGhlIGNvbnRyb2wgcHJvcGFnYXRlcyBjaGFuZ2VzXG4gICAqIGFuZCBlbWl0cyBldmVudHMgYWZ0ZXIgbWFya2luZyBpcyBhcHBsaWVkLlxuICAgKiAqIGBvbmx5U2VsZmA6IFdoZW4gdHJ1ZSwgbWFyayBvbmx5IHRoaXMgY29udHJvbC4gV2hlbiBmYWxzZSBvciBub3Qgc3VwcGxpZWQsXG4gICAqIG1hcmtzIGFsbCBkaXJlY3QgYW5jZXN0b3JzLiBEZWZhdWx0IGlzIGZhbHNlLlxuICAgKiAqIGBlbWl0RXZlbnRgOiBXaGVuIHRydWUgb3Igbm90IHN1cHBsaWVkICh0aGUgZGVmYXVsdCksIHRoZSBgZXZlbnRzYFxuICAgKiBvYnNlcnZhYmxlIGVtaXRzIGEgYFByaXN0aW5lQ2hhbmdlRXZlbnRgIHdpdGggdGhlIGBwcmlzdGluZWAgcHJvcGVydHkgYmVpbmcgYGZhbHNlYC5cbiAgICogV2hlbiBmYWxzZSwgbm8gZXZlbnRzIGFyZSBlbWl0dGVkLlxuICAgKi9cbiAgbWFya0FzRGlydHkob3B0cz86IHtvbmx5U2VsZj86IGJvb2xlYW47IGVtaXRFdmVudD86IGJvb2xlYW59KTogdm9pZDtcbiAgLyoqXG4gICAqIEBpbnRlcm5hbCBVc2VkIHRvIHByb3BhZ2F0ZSB0aGUgc291cmNlIGNvbnRyb2wgZG93bndhcmRzXG4gICAqL1xuICBtYXJrQXNEaXJ0eShvcHRzOiB7XG4gICAgb25seVNlbGY/OiBib29sZWFuO1xuICAgIGVtaXRFdmVudD86IGJvb2xlYW47XG4gICAgc291cmNlQ29udHJvbD86IEFic3RyYWN0Q29udHJvbDtcbiAgfSk6IHZvaWQ7XG4gIG1hcmtBc0RpcnR5KFxuICAgIG9wdHM6IHtvbmx5U2VsZj86IGJvb2xlYW47IGVtaXRFdmVudD86IGJvb2xlYW47IHNvdXJjZUNvbnRyb2w/OiBBYnN0cmFjdENvbnRyb2x9ID0ge30sXG4gICk6IHZvaWQge1xuICAgIGNvbnN0IGNoYW5nZWQgPSB0aGlzLnByaXN0aW5lID09PSB0cnVlO1xuICAgICh0aGlzIGFzIFdyaXRhYmxlPHRoaXM+KS5wcmlzdGluZSA9IGZhbHNlO1xuXG4gICAgY29uc3Qgc291cmNlQ29udHJvbCA9IG9wdHMuc291cmNlQ29udHJvbCA/PyB0aGlzO1xuICAgIGlmICh0aGlzLl9wYXJlbnQgJiYgIW9wdHMub25seVNlbGYpIHtcbiAgICAgIHRoaXMuX3BhcmVudC5tYXJrQXNEaXJ0eSh7Li4ub3B0cywgc291cmNlQ29udHJvbH0pO1xuICAgIH1cblxuICAgIGlmIChjaGFuZ2VkICYmIG9wdHMuZW1pdEV2ZW50ICE9PSBmYWxzZSkge1xuICAgICAgdGhpcy5fZXZlbnRzLm5leHQobmV3IFByaXN0aW5lQ2hhbmdlRXZlbnQoZmFsc2UsIHNvdXJjZUNvbnRyb2wpKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogTWFya3MgdGhlIGNvbnRyb2wgYXMgYHByaXN0aW5lYC5cbiAgICpcbiAgICogSWYgdGhlIGNvbnRyb2wgaGFzIGFueSBjaGlsZHJlbiwgbWFya3MgYWxsIGNoaWxkcmVuIGFzIGBwcmlzdGluZWAsXG4gICAqIGFuZCByZWNhbGN1bGF0ZXMgdGhlIGBwcmlzdGluZWAgc3RhdHVzIG9mIGFsbCBwYXJlbnRcbiAgICogY29udHJvbHMuXG4gICAqXG4gICAqIEBzZWUge0BsaW5rIG1hcmtBc1RvdWNoZWQoKX1cbiAgICogQHNlZSB7QGxpbmsgbWFya0FzVW50b3VjaGVkKCl9XG4gICAqIEBzZWUge0BsaW5rIG1hcmtBc0RpcnR5KCl9XG4gICAqXG4gICAqIEBwYXJhbSBvcHRzIENvbmZpZ3VyYXRpb24gb3B0aW9ucyB0aGF0IGRldGVybWluZSBob3cgdGhlIGNvbnRyb2wgZW1pdHMgZXZlbnRzIGFmdGVyXG4gICAqIG1hcmtpbmcgaXMgYXBwbGllZC5cbiAgICogKiBgb25seVNlbGZgOiBXaGVuIHRydWUsIG1hcmsgb25seSB0aGlzIGNvbnRyb2wuIFdoZW4gZmFsc2Ugb3Igbm90IHN1cHBsaWVkLFxuICAgKiBtYXJrcyBhbGwgZGlyZWN0IGFuY2VzdG9ycy4gRGVmYXVsdCBpcyBmYWxzZS5cbiAgICogKiBgZW1pdEV2ZW50YDogV2hlbiB0cnVlIG9yIG5vdCBzdXBwbGllZCAodGhlIGRlZmF1bHQpLCB0aGUgYGV2ZW50c2BcbiAgICogb2JzZXJ2YWJsZSBlbWl0cyBhIGBQcmlzdGluZUNoYW5nZUV2ZW50YCB3aXRoIHRoZSBgcHJpc3RpbmVgIHByb3BlcnR5IGJlaW5nIGB0cnVlYC5cbiAgICogV2hlbiBmYWxzZSwgbm8gZXZlbnRzIGFyZSBlbWl0dGVkLlxuICAgKi9cbiAgbWFya0FzUHJpc3RpbmUob3B0cz86IHtvbmx5U2VsZj86IGJvb2xlYW47IGVtaXRFdmVudD86IGJvb2xlYW59KTogdm9pZDtcbiAgLyoqXG4gICAqIEBpbnRlcm5hbCBVc2VkIHRvIHByb3BhZ2F0ZSB0aGUgc291cmNlIGNvbnRyb2wgZG93bndhcmRzXG4gICAqL1xuICBtYXJrQXNQcmlzdGluZShvcHRzOiB7XG4gICAgb25seVNlbGY/OiBib29sZWFuO1xuICAgIGVtaXRFdmVudD86IGJvb2xlYW47XG4gICAgc291cmNlQ29udHJvbD86IEFic3RyYWN0Q29udHJvbDtcbiAgfSk6IHZvaWQ7XG4gIG1hcmtBc1ByaXN0aW5lKFxuICAgIG9wdHM6IHtvbmx5U2VsZj86IGJvb2xlYW47IGVtaXRFdmVudD86IGJvb2xlYW47IHNvdXJjZUNvbnRyb2w/OiBBYnN0cmFjdENvbnRyb2x9ID0ge30sXG4gICk6IHZvaWQge1xuICAgIGNvbnN0IGNoYW5nZWQgPSB0aGlzLnByaXN0aW5lID09PSBmYWxzZTtcbiAgICAodGhpcyBhcyBXcml0YWJsZTx0aGlzPikucHJpc3RpbmUgPSB0cnVlO1xuICAgIHRoaXMuX3BlbmRpbmdEaXJ0eSA9IGZhbHNlO1xuXG4gICAgY29uc3Qgc291cmNlQ29udHJvbCA9IG9wdHMuc291cmNlQ29udHJvbCA/PyB0aGlzO1xuICAgIHRoaXMuX2ZvckVhY2hDaGlsZCgoY29udHJvbDogQWJzdHJhY3RDb250cm9sKSA9PiB7XG4gICAgICAvKiogV2UgZG9uJ3QgcHJvcGFnYXRlIHRoZSBzb3VyY2UgY29udHJvbCBkb3dud2FyZHMgKi9cbiAgICAgIGNvbnRyb2wubWFya0FzUHJpc3RpbmUoe29ubHlTZWxmOiB0cnVlLCBlbWl0RXZlbnQ6IG9wdHMuZW1pdEV2ZW50fSk7XG4gICAgfSk7XG5cbiAgICBpZiAodGhpcy5fcGFyZW50ICYmICFvcHRzLm9ubHlTZWxmKSB7XG4gICAgICB0aGlzLl9wYXJlbnQuX3VwZGF0ZVByaXN0aW5lKG9wdHMsIHNvdXJjZUNvbnRyb2wpO1xuICAgIH1cblxuICAgIGlmIChjaGFuZ2VkICYmIG9wdHMuZW1pdEV2ZW50ICE9PSBmYWxzZSkge1xuICAgICAgdGhpcy5fZXZlbnRzLm5leHQobmV3IFByaXN0aW5lQ2hhbmdlRXZlbnQodHJ1ZSwgc291cmNlQ29udHJvbCkpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBNYXJrcyB0aGUgY29udHJvbCBhcyBgcGVuZGluZ2AuXG4gICAqXG4gICAqIEEgY29udHJvbCBpcyBwZW5kaW5nIHdoaWxlIHRoZSBjb250cm9sIHBlcmZvcm1zIGFzeW5jIHZhbGlkYXRpb24uXG4gICAqXG4gICAqIEBzZWUge0BsaW5rIEFic3RyYWN0Q29udHJvbC5zdGF0dXN9XG4gICAqXG4gICAqIEBwYXJhbSBvcHRzIENvbmZpZ3VyYXRpb24gb3B0aW9ucyB0aGF0IGRldGVybWluZSBob3cgdGhlIGNvbnRyb2wgcHJvcGFnYXRlcyBjaGFuZ2VzIGFuZFxuICAgKiBlbWl0cyBldmVudHMgYWZ0ZXIgbWFya2luZyBpcyBhcHBsaWVkLlxuICAgKiAqIGBvbmx5U2VsZmA6IFdoZW4gdHJ1ZSwgbWFyayBvbmx5IHRoaXMgY29udHJvbC4gV2hlbiBmYWxzZSBvciBub3Qgc3VwcGxpZWQsXG4gICAqIG1hcmtzIGFsbCBkaXJlY3QgYW5jZXN0b3JzLiBEZWZhdWx0IGlzIGZhbHNlLlxuICAgKiAqIGBlbWl0RXZlbnRgOiBXaGVuIHRydWUgb3Igbm90IHN1cHBsaWVkICh0aGUgZGVmYXVsdCksIHRoZSBgc3RhdHVzQ2hhbmdlc2BcbiAgICogb2JzZXJ2YWJsZSBlbWl0cyBhbiBldmVudCB3aXRoIHRoZSBsYXRlc3Qgc3RhdHVzIHRoZSBjb250cm9sIGlzIG1hcmtlZCBwZW5kaW5nXG4gICAqIGFuZCB0aGUgYGV2ZW50c2Agb2JzZXJ2YWJsZSBlbWl0cyBhIGBTdGF0dXNDaGFuZ2VFdmVudGAgd2l0aCB0aGUgYHN0YXR1c2AgcHJvcGVydHkgYmVpbmdcbiAgICogYFBFTkRJTkdgIFdoZW4gZmFsc2UsIG5vIGV2ZW50cyBhcmUgZW1pdHRlZC5cbiAgICpcbiAgICovXG4gIG1hcmtBc1BlbmRpbmcob3B0cz86IHtvbmx5U2VsZj86IGJvb2xlYW47IGVtaXRFdmVudD86IGJvb2xlYW59KTogdm9pZDtcbiAgLyoqXG4gICAqIEBpbnRlcm5hbCBVc2VkIHRvIHByb3BhZ2F0ZSB0aGUgc291cmNlIGNvbnRyb2wgZG93bndhcmRzXG4gICAqL1xuICBtYXJrQXNQZW5kaW5nKG9wdHM6IHtcbiAgICBvbmx5U2VsZj86IGJvb2xlYW47XG4gICAgZW1pdEV2ZW50PzogYm9vbGVhbjtcbiAgICBzb3VyY2VDb250cm9sPzogQWJzdHJhY3RDb250cm9sO1xuICB9KTogdm9pZDtcbiAgbWFya0FzUGVuZGluZyhcbiAgICBvcHRzOiB7b25seVNlbGY/OiBib29sZWFuOyBlbWl0RXZlbnQ/OiBib29sZWFuOyBzb3VyY2VDb250cm9sPzogQWJzdHJhY3RDb250cm9sfSA9IHt9LFxuICApOiB2b2lkIHtcbiAgICAodGhpcyBhcyBXcml0YWJsZTx0aGlzPikuc3RhdHVzID0gUEVORElORztcblxuICAgIGNvbnN0IHNvdXJjZUNvbnRyb2wgPSBvcHRzLnNvdXJjZUNvbnRyb2wgPz8gdGhpcztcbiAgICBpZiAob3B0cy5lbWl0RXZlbnQgIT09IGZhbHNlKSB7XG4gICAgICB0aGlzLl9ldmVudHMubmV4dChuZXcgU3RhdHVzQ2hhbmdlRXZlbnQodGhpcy5zdGF0dXMsIHNvdXJjZUNvbnRyb2wpKTtcbiAgICAgICh0aGlzLnN0YXR1c0NoYW5nZXMgYXMgRXZlbnRFbWl0dGVyPEZvcm1Db250cm9sU3RhdHVzPikuZW1pdCh0aGlzLnN0YXR1cyk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX3BhcmVudCAmJiAhb3B0cy5vbmx5U2VsZikge1xuICAgICAgdGhpcy5fcGFyZW50Lm1hcmtBc1BlbmRpbmcoey4uLm9wdHMsIHNvdXJjZUNvbnRyb2x9KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRGlzYWJsZXMgdGhlIGNvbnRyb2wuIFRoaXMgbWVhbnMgdGhlIGNvbnRyb2wgaXMgZXhlbXB0IGZyb20gdmFsaWRhdGlvbiBjaGVja3MgYW5kXG4gICAqIGV4Y2x1ZGVkIGZyb20gdGhlIGFnZ3JlZ2F0ZSB2YWx1ZSBvZiBhbnkgcGFyZW50LiBJdHMgc3RhdHVzIGlzIGBESVNBQkxFRGAuXG4gICAqXG4gICAqIElmIHRoZSBjb250cm9sIGhhcyBjaGlsZHJlbiwgYWxsIGNoaWxkcmVuIGFyZSBhbHNvIGRpc2FibGVkLlxuICAgKlxuICAgKiBAc2VlIHtAbGluayBBYnN0cmFjdENvbnRyb2wuc3RhdHVzfVxuICAgKlxuICAgKiBAcGFyYW0gb3B0cyBDb25maWd1cmF0aW9uIG9wdGlvbnMgdGhhdCBkZXRlcm1pbmUgaG93IHRoZSBjb250cm9sIHByb3BhZ2F0ZXNcbiAgICogY2hhbmdlcyBhbmQgZW1pdHMgZXZlbnRzIGFmdGVyIHRoZSBjb250cm9sIGlzIGRpc2FibGVkLlxuICAgKiAqIGBvbmx5U2VsZmA6IFdoZW4gdHJ1ZSwgbWFyayBvbmx5IHRoaXMgY29udHJvbC4gV2hlbiBmYWxzZSBvciBub3Qgc3VwcGxpZWQsXG4gICAqIG1hcmtzIGFsbCBkaXJlY3QgYW5jZXN0b3JzLiBEZWZhdWx0IGlzIGZhbHNlLlxuICAgKiAqIGBlbWl0RXZlbnRgOiBXaGVuIHRydWUgb3Igbm90IHN1cHBsaWVkICh0aGUgZGVmYXVsdCksIHRoZSBgc3RhdHVzQ2hhbmdlc2AsXG4gICAqIGB2YWx1ZUNoYW5nZXNgIGFuZCBgZXZlbnRzYFxuICAgKiBvYnNlcnZhYmxlcyBlbWl0IGV2ZW50cyB3aXRoIHRoZSBsYXRlc3Qgc3RhdHVzIGFuZCB2YWx1ZSB3aGVuIHRoZSBjb250cm9sIGlzIGRpc2FibGVkLlxuICAgKiBXaGVuIGZhbHNlLCBubyBldmVudHMgYXJlIGVtaXR0ZWQuXG4gICAqL1xuICBkaXNhYmxlKG9wdHM/OiB7b25seVNlbGY/OiBib29sZWFuOyBlbWl0RXZlbnQ/OiBib29sZWFufSk6IHZvaWQ7XG4gIC8qKlxuICAgKiBAaW50ZXJuYWwgVXNlZCB0byBwcm9wYWdhdGUgdGhlIHNvdXJjZSBjb250cm9sIGRvd253YXJkc1xuICAgKi9cbiAgZGlzYWJsZShvcHRzOiB7b25seVNlbGY/OiBib29sZWFuOyBlbWl0RXZlbnQ/OiBib29sZWFuOyBzb3VyY2VDb250cm9sPzogQWJzdHJhY3RDb250cm9sfSk6IHZvaWQ7XG4gIGRpc2FibGUoXG4gICAgb3B0czoge29ubHlTZWxmPzogYm9vbGVhbjsgZW1pdEV2ZW50PzogYm9vbGVhbjsgc291cmNlQ29udHJvbD86IEFic3RyYWN0Q29udHJvbH0gPSB7fSxcbiAgKTogdm9pZCB7XG4gICAgLy8gSWYgcGFyZW50IGhhcyBiZWVuIG1hcmtlZCBhcnRpZmljaWFsbHkgZGlydHkgd2UgZG9uJ3Qgd2FudCB0byByZS1jYWxjdWxhdGUgdGhlXG4gICAgLy8gcGFyZW50J3MgZGlydGluZXNzIGJhc2VkIG9uIHRoZSBjaGlsZHJlbi5cbiAgICBjb25zdCBza2lwUHJpc3RpbmVDaGVjayA9IHRoaXMuX3BhcmVudE1hcmtlZERpcnR5KG9wdHMub25seVNlbGYpO1xuXG4gICAgKHRoaXMgYXMgV3JpdGFibGU8dGhpcz4pLnN0YXR1cyA9IERJU0FCTEVEO1xuICAgICh0aGlzIGFzIFdyaXRhYmxlPHRoaXM+KS5lcnJvcnMgPSBudWxsO1xuICAgIHRoaXMuX2ZvckVhY2hDaGlsZCgoY29udHJvbDogQWJzdHJhY3RDb250cm9sKSA9PiB7XG4gICAgICAvKiogV2UgZG9uJ3QgcHJvcGFnYXRlIHRoZSBzb3VyY2UgY29udHJvbCBkb3dud2FyZHMgKi9cbiAgICAgIGNvbnRyb2wuZGlzYWJsZSh7Li4ub3B0cywgb25seVNlbGY6IHRydWV9KTtcbiAgICB9KTtcbiAgICB0aGlzLl91cGRhdGVWYWx1ZSgpO1xuXG4gICAgY29uc3Qgc291cmNlQ29udHJvbCA9IG9wdHMuc291cmNlQ29udHJvbCA/PyB0aGlzO1xuICAgIGlmIChvcHRzLmVtaXRFdmVudCAhPT0gZmFsc2UpIHtcbiAgICAgIHRoaXMuX2V2ZW50cy5uZXh0KG5ldyBWYWx1ZUNoYW5nZUV2ZW50KHRoaXMudmFsdWUsIHNvdXJjZUNvbnRyb2wpKTtcbiAgICAgIHRoaXMuX2V2ZW50cy5uZXh0KG5ldyBTdGF0dXNDaGFuZ2VFdmVudCh0aGlzLnN0YXR1cywgc291cmNlQ29udHJvbCkpO1xuICAgICAgKHRoaXMudmFsdWVDaGFuZ2VzIGFzIEV2ZW50RW1pdHRlcjxUVmFsdWU+KS5lbWl0KHRoaXMudmFsdWUpO1xuICAgICAgKHRoaXMuc3RhdHVzQ2hhbmdlcyBhcyBFdmVudEVtaXR0ZXI8Rm9ybUNvbnRyb2xTdGF0dXM+KS5lbWl0KHRoaXMuc3RhdHVzKTtcbiAgICB9XG5cbiAgICB0aGlzLl91cGRhdGVBbmNlc3RvcnMoey4uLm9wdHMsIHNraXBQcmlzdGluZUNoZWNrfSwgdGhpcyk7XG4gICAgdGhpcy5fb25EaXNhYmxlZENoYW5nZS5mb3JFYWNoKChjaGFuZ2VGbikgPT4gY2hhbmdlRm4odHJ1ZSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEVuYWJsZXMgdGhlIGNvbnRyb2wuIFRoaXMgbWVhbnMgdGhlIGNvbnRyb2wgaXMgaW5jbHVkZWQgaW4gdmFsaWRhdGlvbiBjaGVja3MgYW5kXG4gICAqIHRoZSBhZ2dyZWdhdGUgdmFsdWUgb2YgaXRzIHBhcmVudC4gSXRzIHN0YXR1cyByZWNhbGN1bGF0ZXMgYmFzZWQgb24gaXRzIHZhbHVlIGFuZFxuICAgKiBpdHMgdmFsaWRhdG9ycy5cbiAgICpcbiAgICogQnkgZGVmYXVsdCwgaWYgdGhlIGNvbnRyb2wgaGFzIGNoaWxkcmVuLCBhbGwgY2hpbGRyZW4gYXJlIGVuYWJsZWQuXG4gICAqXG4gICAqIEBzZWUge0BsaW5rIEFic3RyYWN0Q29udHJvbC5zdGF0dXN9XG4gICAqXG4gICAqIEBwYXJhbSBvcHRzIENvbmZpZ3VyZSBvcHRpb25zIHRoYXQgY29udHJvbCBob3cgdGhlIGNvbnRyb2wgcHJvcGFnYXRlcyBjaGFuZ2VzIGFuZFxuICAgKiBlbWl0cyBldmVudHMgd2hlbiBtYXJrZWQgYXMgdW50b3VjaGVkXG4gICAqICogYG9ubHlTZWxmYDogV2hlbiB0cnVlLCBtYXJrIG9ubHkgdGhpcyBjb250cm9sLiBXaGVuIGZhbHNlIG9yIG5vdCBzdXBwbGllZCxcbiAgICogbWFya3MgYWxsIGRpcmVjdCBhbmNlc3RvcnMuIERlZmF1bHQgaXMgZmFsc2UuXG4gICAqICogYGVtaXRFdmVudGA6IFdoZW4gdHJ1ZSBvciBub3Qgc3VwcGxpZWQgKHRoZSBkZWZhdWx0KSwgdGhlIGBzdGF0dXNDaGFuZ2VzYCxcbiAgICogYHZhbHVlQ2hhbmdlc2AgYW5kIGBldmVudHNgXG4gICAqIG9ic2VydmFibGVzIGVtaXQgZXZlbnRzIHdpdGggdGhlIGxhdGVzdCBzdGF0dXMgYW5kIHZhbHVlIHdoZW4gdGhlIGNvbnRyb2wgaXMgZW5hYmxlZC5cbiAgICogV2hlbiBmYWxzZSwgbm8gZXZlbnRzIGFyZSBlbWl0dGVkLlxuICAgKi9cbiAgZW5hYmxlKG9wdHM6IHtvbmx5U2VsZj86IGJvb2xlYW47IGVtaXRFdmVudD86IGJvb2xlYW59ID0ge30pOiB2b2lkIHtcbiAgICAvLyBJZiBwYXJlbnQgaGFzIGJlZW4gbWFya2VkIGFydGlmaWNpYWxseSBkaXJ0eSB3ZSBkb24ndCB3YW50IHRvIHJlLWNhbGN1bGF0ZSB0aGVcbiAgICAvLyBwYXJlbnQncyBkaXJ0aW5lc3MgYmFzZWQgb24gdGhlIGNoaWxkcmVuLlxuICAgIGNvbnN0IHNraXBQcmlzdGluZUNoZWNrID0gdGhpcy5fcGFyZW50TWFya2VkRGlydHkob3B0cy5vbmx5U2VsZik7XG5cbiAgICAodGhpcyBhcyBXcml0YWJsZTx0aGlzPikuc3RhdHVzID0gVkFMSUQ7XG4gICAgdGhpcy5fZm9yRWFjaENoaWxkKChjb250cm9sOiBBYnN0cmFjdENvbnRyb2wpID0+IHtcbiAgICAgIGNvbnRyb2wuZW5hYmxlKHsuLi5vcHRzLCBvbmx5U2VsZjogdHJ1ZX0pO1xuICAgIH0pO1xuICAgIHRoaXMudXBkYXRlVmFsdWVBbmRWYWxpZGl0eSh7b25seVNlbGY6IHRydWUsIGVtaXRFdmVudDogb3B0cy5lbWl0RXZlbnR9KTtcblxuICAgIHRoaXMuX3VwZGF0ZUFuY2VzdG9ycyh7Li4ub3B0cywgc2tpcFByaXN0aW5lQ2hlY2t9LCB0aGlzKTtcbiAgICB0aGlzLl9vbkRpc2FibGVkQ2hhbmdlLmZvckVhY2goKGNoYW5nZUZuKSA9PiBjaGFuZ2VGbihmYWxzZSkpO1xuICB9XG5cbiAgcHJpdmF0ZSBfdXBkYXRlQW5jZXN0b3JzKFxuICAgIG9wdHM6IHtvbmx5U2VsZj86IGJvb2xlYW47IGVtaXRFdmVudD86IGJvb2xlYW47IHNraXBQcmlzdGluZUNoZWNrPzogYm9vbGVhbn0sXG4gICAgc291cmNlQ29udHJvbDogQWJzdHJhY3RDb250cm9sLFxuICApOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fcGFyZW50ICYmICFvcHRzLm9ubHlTZWxmKSB7XG4gICAgICB0aGlzLl9wYXJlbnQudXBkYXRlVmFsdWVBbmRWYWxpZGl0eShvcHRzKTtcbiAgICAgIGlmICghb3B0cy5za2lwUHJpc3RpbmVDaGVjaykge1xuICAgICAgICB0aGlzLl9wYXJlbnQuX3VwZGF0ZVByaXN0aW5lKHt9LCBzb3VyY2VDb250cm9sKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX3BhcmVudC5fdXBkYXRlVG91Y2hlZCh7fSwgc291cmNlQ29udHJvbCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHBhcmVudCBvZiB0aGUgY29udHJvbFxuICAgKlxuICAgKiBAcGFyYW0gcGFyZW50IFRoZSBuZXcgcGFyZW50LlxuICAgKi9cbiAgc2V0UGFyZW50KHBhcmVudDogRm9ybUdyb3VwIHwgRm9ybUFycmF5IHwgbnVsbCk6IHZvaWQge1xuICAgIHRoaXMuX3BhcmVudCA9IHBhcmVudDtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSB2YWx1ZSBvZiB0aGUgY29udHJvbC4gQWJzdHJhY3QgbWV0aG9kIChpbXBsZW1lbnRlZCBpbiBzdWItY2xhc3NlcykuXG4gICAqL1xuICBhYnN0cmFjdCBzZXRWYWx1ZSh2YWx1ZTogVFJhd1ZhbHVlLCBvcHRpb25zPzogT2JqZWN0KTogdm9pZDtcblxuICAvKipcbiAgICogUGF0Y2hlcyB0aGUgdmFsdWUgb2YgdGhlIGNvbnRyb2wuIEFic3RyYWN0IG1ldGhvZCAoaW1wbGVtZW50ZWQgaW4gc3ViLWNsYXNzZXMpLlxuICAgKi9cbiAgYWJzdHJhY3QgcGF0Y2hWYWx1ZSh2YWx1ZTogVFZhbHVlLCBvcHRpb25zPzogT2JqZWN0KTogdm9pZDtcblxuICAvKipcbiAgICogUmVzZXRzIHRoZSBjb250cm9sLiBBYnN0cmFjdCBtZXRob2QgKGltcGxlbWVudGVkIGluIHN1Yi1jbGFzc2VzKS5cbiAgICovXG4gIGFic3RyYWN0IHJlc2V0KHZhbHVlPzogVFZhbHVlLCBvcHRpb25zPzogT2JqZWN0KTogdm9pZDtcblxuICAvKipcbiAgICogVGhlIHJhdyB2YWx1ZSBvZiB0aGlzIGNvbnRyb2wuIEZvciBtb3N0IGNvbnRyb2wgaW1wbGVtZW50YXRpb25zLCB0aGUgcmF3IHZhbHVlIHdpbGwgaW5jbHVkZVxuICAgKiBkaXNhYmxlZCBjaGlsZHJlbi5cbiAgICovXG4gIGdldFJhd1ZhbHVlKCk6IGFueSB7XG4gICAgcmV0dXJuIHRoaXMudmFsdWU7XG4gIH1cblxuICAvKipcbiAgICogUmVjYWxjdWxhdGVzIHRoZSB2YWx1ZSBhbmQgdmFsaWRhdGlvbiBzdGF0dXMgb2YgdGhlIGNvbnRyb2wuXG4gICAqXG4gICAqIEJ5IGRlZmF1bHQsIGl0IGFsc28gdXBkYXRlcyB0aGUgdmFsdWUgYW5kIHZhbGlkaXR5IG9mIGl0cyBhbmNlc3RvcnMuXG4gICAqXG4gICAqIEBwYXJhbSBvcHRzIENvbmZpZ3VyYXRpb24gb3B0aW9ucyBkZXRlcm1pbmUgaG93IHRoZSBjb250cm9sIHByb3BhZ2F0ZXMgY2hhbmdlcyBhbmQgZW1pdHMgZXZlbnRzXG4gICAqIGFmdGVyIHVwZGF0ZXMgYW5kIHZhbGlkaXR5IGNoZWNrcyBhcmUgYXBwbGllZC5cbiAgICogKiBgb25seVNlbGZgOiBXaGVuIHRydWUsIG9ubHkgdXBkYXRlIHRoaXMgY29udHJvbC4gV2hlbiBmYWxzZSBvciBub3Qgc3VwcGxpZWQsXG4gICAqIHVwZGF0ZSBhbGwgZGlyZWN0IGFuY2VzdG9ycy4gRGVmYXVsdCBpcyBmYWxzZS5cbiAgICogKiBgZW1pdEV2ZW50YDogV2hlbiB0cnVlIG9yIG5vdCBzdXBwbGllZCAodGhlIGRlZmF1bHQpLCB0aGUgYHN0YXR1c0NoYW5nZXNgLFxuICAgKiBgdmFsdWVDaGFuZ2VzYCBhbmQgYGV2ZW50c2BcbiAgICogb2JzZXJ2YWJsZXMgZW1pdCBldmVudHMgd2l0aCB0aGUgbGF0ZXN0IHN0YXR1cyBhbmQgdmFsdWUgd2hlbiB0aGUgY29udHJvbCBpcyB1cGRhdGVkLlxuICAgKiBXaGVuIGZhbHNlLCBubyBldmVudHMgYXJlIGVtaXR0ZWQuXG4gICAqL1xuICB1cGRhdGVWYWx1ZUFuZFZhbGlkaXR5KG9wdHM/OiB7b25seVNlbGY/OiBib29sZWFuOyBlbWl0RXZlbnQ/OiBib29sZWFufSk6IHZvaWQ7XG4gIC8qKlxuICAgKiBAaW50ZXJuYWwgVXNlZCB0byBwcm9wYWdhdGUgdGhlIHNvdXJjZSBjb250cm9sIGRvd253YXJkc1xuICAgKi9cbiAgdXBkYXRlVmFsdWVBbmRWYWxpZGl0eShvcHRzOiB7XG4gICAgb25seVNlbGY/OiBib29sZWFuO1xuICAgIGVtaXRFdmVudD86IGJvb2xlYW47XG4gICAgc291cmNlQ29udHJvbD86IEFic3RyYWN0Q29udHJvbDtcbiAgfSk6IHZvaWQ7XG4gIHVwZGF0ZVZhbHVlQW5kVmFsaWRpdHkoXG4gICAgb3B0czoge29ubHlTZWxmPzogYm9vbGVhbjsgZW1pdEV2ZW50PzogYm9vbGVhbjsgc291cmNlQ29udHJvbD86IEFic3RyYWN0Q29udHJvbH0gPSB7fSxcbiAgKTogdm9pZCB7XG4gICAgdGhpcy5fc2V0SW5pdGlhbFN0YXR1cygpO1xuICAgIHRoaXMuX3VwZGF0ZVZhbHVlKCk7XG5cbiAgICBpZiAodGhpcy5lbmFibGVkKSB7XG4gICAgICBjb25zdCBzaG91bGRIYXZlRW1pdHRlZCA9IHRoaXMuX2NhbmNlbEV4aXN0aW5nU3Vic2NyaXB0aW9uKCk7XG5cbiAgICAgICh0aGlzIGFzIFdyaXRhYmxlPHRoaXM+KS5lcnJvcnMgPSB0aGlzLl9ydW5WYWxpZGF0b3IoKTtcbiAgICAgICh0aGlzIGFzIFdyaXRhYmxlPHRoaXM+KS5zdGF0dXMgPSB0aGlzLl9jYWxjdWxhdGVTdGF0dXMoKTtcblxuICAgICAgaWYgKHRoaXMuc3RhdHVzID09PSBWQUxJRCB8fCB0aGlzLnN0YXR1cyA9PT0gUEVORElORykge1xuICAgICAgICAvLyBJZiB0aGUgY2FuY2VsZWQgc3Vic2NyaXB0aW9uIHNob3VsZCBoYXZlIGVtaXR0ZWRcbiAgICAgICAgLy8gd2UgbWFrZSBzdXJlIHRoZSBhc3luYyB2YWxpZGF0b3IgZW1pdHMgdGhlIHN0YXR1cyBjaGFuZ2Ugb24gY29tcGxldGlvblxuICAgICAgICB0aGlzLl9ydW5Bc3luY1ZhbGlkYXRvcihzaG91bGRIYXZlRW1pdHRlZCwgb3B0cy5lbWl0RXZlbnQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHNvdXJjZUNvbnRyb2wgPSBvcHRzLnNvdXJjZUNvbnRyb2wgPz8gdGhpcztcbiAgICBpZiAob3B0cy5lbWl0RXZlbnQgIT09IGZhbHNlKSB7XG4gICAgICB0aGlzLl9ldmVudHMubmV4dChuZXcgVmFsdWVDaGFuZ2VFdmVudDxUVmFsdWU+KHRoaXMudmFsdWUsIHNvdXJjZUNvbnRyb2wpKTtcbiAgICAgIHRoaXMuX2V2ZW50cy5uZXh0KG5ldyBTdGF0dXNDaGFuZ2VFdmVudCh0aGlzLnN0YXR1cywgc291cmNlQ29udHJvbCkpO1xuICAgICAgKHRoaXMudmFsdWVDaGFuZ2VzIGFzIEV2ZW50RW1pdHRlcjxUVmFsdWU+KS5lbWl0KHRoaXMudmFsdWUpO1xuICAgICAgKHRoaXMuc3RhdHVzQ2hhbmdlcyBhcyBFdmVudEVtaXR0ZXI8Rm9ybUNvbnRyb2xTdGF0dXM+KS5lbWl0KHRoaXMuc3RhdHVzKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fcGFyZW50ICYmICFvcHRzLm9ubHlTZWxmKSB7XG4gICAgICB0aGlzLl9wYXJlbnQudXBkYXRlVmFsdWVBbmRWYWxpZGl0eSh7Li4ub3B0cywgc291cmNlQ29udHJvbH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3VwZGF0ZVRyZWVWYWxpZGl0eShvcHRzOiB7ZW1pdEV2ZW50PzogYm9vbGVhbn0gPSB7ZW1pdEV2ZW50OiB0cnVlfSk6IHZvaWQge1xuICAgIHRoaXMuX2ZvckVhY2hDaGlsZCgoY3RybDogQWJzdHJhY3RDb250cm9sKSA9PiBjdHJsLl91cGRhdGVUcmVlVmFsaWRpdHkob3B0cykpO1xuICAgIHRoaXMudXBkYXRlVmFsdWVBbmRWYWxpZGl0eSh7b25seVNlbGY6IHRydWUsIGVtaXRFdmVudDogb3B0cy5lbWl0RXZlbnR9KTtcbiAgfVxuXG4gIHByaXZhdGUgX3NldEluaXRpYWxTdGF0dXMoKSB7XG4gICAgKHRoaXMgYXMgV3JpdGFibGU8dGhpcz4pLnN0YXR1cyA9IHRoaXMuX2FsbENvbnRyb2xzRGlzYWJsZWQoKSA/IERJU0FCTEVEIDogVkFMSUQ7XG4gIH1cblxuICBwcml2YXRlIF9ydW5WYWxpZGF0b3IoKTogVmFsaWRhdGlvbkVycm9ycyB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLnZhbGlkYXRvciA/IHRoaXMudmFsaWRhdG9yKHRoaXMpIDogbnVsbDtcbiAgfVxuXG4gIHByaXZhdGUgX3J1bkFzeW5jVmFsaWRhdG9yKHNob3VsZEhhdmVFbWl0dGVkOiBib29sZWFuLCBlbWl0RXZlbnQ/OiBib29sZWFuKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuYXN5bmNWYWxpZGF0b3IpIHtcbiAgICAgICh0aGlzIGFzIFdyaXRhYmxlPHRoaXM+KS5zdGF0dXMgPSBQRU5ESU5HO1xuICAgICAgdGhpcy5faGFzT3duUGVuZGluZ0FzeW5jVmFsaWRhdG9yID0ge2VtaXRFdmVudDogZW1pdEV2ZW50ICE9PSBmYWxzZX07XG4gICAgICBjb25zdCBvYnMgPSB0b09ic2VydmFibGUodGhpcy5hc3luY1ZhbGlkYXRvcih0aGlzKSk7XG4gICAgICB0aGlzLl9hc3luY1ZhbGlkYXRpb25TdWJzY3JpcHRpb24gPSBvYnMuc3Vic2NyaWJlKChlcnJvcnM6IFZhbGlkYXRpb25FcnJvcnMgfCBudWxsKSA9PiB7XG4gICAgICAgIHRoaXMuX2hhc093blBlbmRpbmdBc3luY1ZhbGlkYXRvciA9IG51bGw7XG4gICAgICAgIC8vIFRoaXMgd2lsbCB0cmlnZ2VyIHRoZSByZWNhbGN1bGF0aW9uIG9mIHRoZSB2YWxpZGF0aW9uIHN0YXR1cywgd2hpY2ggZGVwZW5kcyBvblxuICAgICAgICAvLyB0aGUgc3RhdGUgb2YgdGhlIGFzeW5jaHJvbm91cyB2YWxpZGF0aW9uICh3aGV0aGVyIGl0IGlzIGluIHByb2dyZXNzIG9yIG5vdCkuIFNvLCBpdCBpc1xuICAgICAgICAvLyBuZWNlc3NhcnkgdGhhdCB3ZSBoYXZlIHVwZGF0ZWQgdGhlIGBfaGFzT3duUGVuZGluZ0FzeW5jVmFsaWRhdG9yYCBib29sZWFuIGZsYWcgZmlyc3QuXG4gICAgICAgIHRoaXMuc2V0RXJyb3JzKGVycm9ycywge2VtaXRFdmVudCwgc2hvdWxkSGF2ZUVtaXR0ZWR9KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2NhbmNlbEV4aXN0aW5nU3Vic2NyaXB0aW9uKCk6IGJvb2xlYW4ge1xuICAgIGlmICh0aGlzLl9hc3luY1ZhbGlkYXRpb25TdWJzY3JpcHRpb24pIHtcbiAgICAgIHRoaXMuX2FzeW5jVmFsaWRhdGlvblN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuXG4gICAgICAvLyB3ZSdyZSBjYW5jZWxsaW5nIHRoZSB2YWxpZGF0b3Igc3Vic2NyaWJ0aW9uLCB3ZSBrZWVwIGlmIGl0IHNob3VsZCBoYXZlIGVtaXR0ZWRcbiAgICAgIC8vIGJlY2F1c2Ugd2Ugd2FudCB0byBlbWl0IGV2ZW50dWFsbHkgaWYgaXQgd2FzIHJlcXVpcmVkIGF0IGxlYXN0IG9uY2UuXG4gICAgICBjb25zdCBzaG91bGRIYXZlRW1pdHRlZCA9IHRoaXMuX2hhc093blBlbmRpbmdBc3luY1ZhbGlkYXRvcj8uZW1pdEV2ZW50ID8/IGZhbHNlO1xuICAgICAgdGhpcy5faGFzT3duUGVuZGluZ0FzeW5jVmFsaWRhdG9yID0gbnVsbDtcbiAgICAgIHJldHVybiBzaG91bGRIYXZlRW1pdHRlZDtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgZXJyb3JzIG9uIGEgZm9ybSBjb250cm9sIHdoZW4gcnVubmluZyB2YWxpZGF0aW9ucyBtYW51YWxseSwgcmF0aGVyIHRoYW4gYXV0b21hdGljYWxseS5cbiAgICpcbiAgICogQ2FsbGluZyBgc2V0RXJyb3JzYCBhbHNvIHVwZGF0ZXMgdGhlIHZhbGlkaXR5IG9mIHRoZSBwYXJlbnQgY29udHJvbC5cbiAgICpcbiAgICogQHBhcmFtIG9wdHMgQ29uZmlndXJhdGlvbiBvcHRpb25zIHRoYXQgZGV0ZXJtaW5lIGhvdyB0aGUgY29udHJvbCBwcm9wYWdhdGVzXG4gICAqIGNoYW5nZXMgYW5kIGVtaXRzIGV2ZW50cyBhZnRlciB0aGUgY29udHJvbCBlcnJvcnMgYXJlIHNldC5cbiAgICogKiBgZW1pdEV2ZW50YDogV2hlbiB0cnVlIG9yIG5vdCBzdXBwbGllZCAodGhlIGRlZmF1bHQpLCB0aGUgYHN0YXR1c0NoYW5nZXNgXG4gICAqIG9ic2VydmFibGUgZW1pdHMgYW4gZXZlbnQgYWZ0ZXIgdGhlIGVycm9ycyBhcmUgc2V0LlxuICAgKlxuICAgKiBAdXNhZ2VOb3Rlc1xuICAgKlxuICAgKiAjIyMgTWFudWFsbHkgc2V0IHRoZSBlcnJvcnMgZm9yIGEgY29udHJvbFxuICAgKlxuICAgKiBgYGBcbiAgICogY29uc3QgbG9naW4gPSBuZXcgRm9ybUNvbnRyb2woJ3NvbWVMb2dpbicpO1xuICAgKiBsb2dpbi5zZXRFcnJvcnMoe1xuICAgKiAgIG5vdFVuaXF1ZTogdHJ1ZVxuICAgKiB9KTtcbiAgICpcbiAgICogZXhwZWN0KGxvZ2luLnZhbGlkKS50b0VxdWFsKGZhbHNlKTtcbiAgICogZXhwZWN0KGxvZ2luLmVycm9ycykudG9FcXVhbCh7IG5vdFVuaXF1ZTogdHJ1ZSB9KTtcbiAgICpcbiAgICogbG9naW4uc2V0VmFsdWUoJ3NvbWVPdGhlckxvZ2luJyk7XG4gICAqXG4gICAqIGV4cGVjdChsb2dpbi52YWxpZCkudG9FcXVhbCh0cnVlKTtcbiAgICogYGBgXG4gICAqL1xuICBzZXRFcnJvcnMoZXJyb3JzOiBWYWxpZGF0aW9uRXJyb3JzIHwgbnVsbCwgb3B0cz86IHtlbWl0RXZlbnQ/OiBib29sZWFufSk6IHZvaWQ7XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBzZXRFcnJvcnMoXG4gICAgZXJyb3JzOiBWYWxpZGF0aW9uRXJyb3JzIHwgbnVsbCxcbiAgICBvcHRzPzoge2VtaXRFdmVudD86IGJvb2xlYW47IHNob3VsZEhhdmVFbWl0dGVkPzogYm9vbGVhbn0sXG4gICk6IHZvaWQ7XG4gIHNldEVycm9ycyhcbiAgICBlcnJvcnM6IFZhbGlkYXRpb25FcnJvcnMgfCBudWxsLFxuICAgIG9wdHM6IHtlbWl0RXZlbnQ/OiBib29sZWFuOyBzaG91bGRIYXZlRW1pdHRlZD86IGJvb2xlYW59ID0ge30sXG4gICk6IHZvaWQge1xuICAgICh0aGlzIGFzIFdyaXRhYmxlPHRoaXM+KS5lcnJvcnMgPSBlcnJvcnM7XG4gICAgdGhpcy5fdXBkYXRlQ29udHJvbHNFcnJvcnMob3B0cy5lbWl0RXZlbnQgIT09IGZhbHNlLCB0aGlzLCBvcHRzLnNob3VsZEhhdmVFbWl0dGVkKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZXMgYSBjaGlsZCBjb250cm9sIGdpdmVuIHRoZSBjb250cm9sJ3MgbmFtZSBvciBwYXRoLlxuICAgKlxuICAgKiBUaGlzIHNpZ25hdHVyZSBmb3IgZ2V0IHN1cHBvcnRzIHN0cmluZ3MgYW5kIGBjb25zdGAgYXJyYXlzIChgLmdldChbJ2ZvbycsICdiYXInXSBhcyBjb25zdClgKS5cbiAgICovXG4gIGdldDxQIGV4dGVuZHMgc3RyaW5nIHwgcmVhZG9ubHkgKHN0cmluZyB8IG51bWJlcilbXT4oXG4gICAgcGF0aDogUCxcbiAgKTogQWJzdHJhY3RDb250cm9sPMm1R2V0UHJvcGVydHk8VFJhd1ZhbHVlLCBQPj4gfCBudWxsO1xuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZXMgYSBjaGlsZCBjb250cm9sIGdpdmVuIHRoZSBjb250cm9sJ3MgbmFtZSBvciBwYXRoLlxuICAgKlxuICAgKiBUaGlzIHNpZ25hdHVyZSBmb3IgYGdldGAgc3VwcG9ydHMgbm9uLWNvbnN0IChtdXRhYmxlKSBhcnJheXMuIEluZmVycmVkIHR5cGVcbiAgICogaW5mb3JtYXRpb24gd2lsbCBub3QgYmUgYXMgcm9idXN0LCBzbyBwcmVmZXIgdG8gcGFzcyBhIGByZWFkb25seWAgYXJyYXkgaWYgcG9zc2libGUuXG4gICAqL1xuICBnZXQ8UCBleHRlbmRzIHN0cmluZyB8IEFycmF5PHN0cmluZyB8IG51bWJlcj4+KFxuICAgIHBhdGg6IFAsXG4gICk6IEFic3RyYWN0Q29udHJvbDzJtUdldFByb3BlcnR5PFRSYXdWYWx1ZSwgUD4+IHwgbnVsbDtcblxuICAvKipcbiAgICogUmV0cmlldmVzIGEgY2hpbGQgY29udHJvbCBnaXZlbiB0aGUgY29udHJvbCdzIG5hbWUgb3IgcGF0aC5cbiAgICpcbiAgICogQHBhcmFtIHBhdGggQSBkb3QtZGVsaW1pdGVkIHN0cmluZyBvciBhcnJheSBvZiBzdHJpbmcvbnVtYmVyIHZhbHVlcyB0aGF0IGRlZmluZSB0aGUgcGF0aCB0byB0aGVcbiAgICogY29udHJvbC4gSWYgYSBzdHJpbmcgaXMgcHJvdmlkZWQsIHBhc3NpbmcgaXQgYXMgYSBzdHJpbmcgbGl0ZXJhbCB3aWxsIHJlc3VsdCBpbiBpbXByb3ZlZCB0eXBlXG4gICAqIGluZm9ybWF0aW9uLiBMaWtld2lzZSwgaWYgYW4gYXJyYXkgaXMgcHJvdmlkZWQsIHBhc3NpbmcgaXQgYGFzIGNvbnN0YCB3aWxsIGNhdXNlIGltcHJvdmVkIHR5cGVcbiAgICogaW5mb3JtYXRpb24gdG8gYmUgYXZhaWxhYmxlLlxuICAgKlxuICAgKiBAdXNhZ2VOb3Rlc1xuICAgKiAjIyMgUmV0cmlldmUgYSBuZXN0ZWQgY29udHJvbFxuICAgKlxuICAgKiBGb3IgZXhhbXBsZSwgdG8gZ2V0IGEgYG5hbWVgIGNvbnRyb2wgbmVzdGVkIHdpdGhpbiBhIGBwZXJzb25gIHN1Yi1ncm91cDpcbiAgICpcbiAgICogKiBgdGhpcy5mb3JtLmdldCgncGVyc29uLm5hbWUnKTtgXG4gICAqXG4gICAqIC1PUi1cbiAgICpcbiAgICogKiBgdGhpcy5mb3JtLmdldChbJ3BlcnNvbicsICduYW1lJ10gYXMgY29uc3QpO2AgLy8gYGFzIGNvbnN0YCBnaXZlcyBpbXByb3ZlZCB0eXBpbmdzXG4gICAqXG4gICAqICMjIyBSZXRyaWV2ZSBhIGNvbnRyb2wgaW4gYSBGb3JtQXJyYXlcbiAgICpcbiAgICogV2hlbiBhY2Nlc3NpbmcgYW4gZWxlbWVudCBpbnNpZGUgYSBGb3JtQXJyYXksIHlvdSBjYW4gdXNlIGFuIGVsZW1lbnQgaW5kZXguXG4gICAqIEZvciBleGFtcGxlLCB0byBnZXQgYSBgcHJpY2VgIGNvbnRyb2wgZnJvbSB0aGUgZmlyc3QgZWxlbWVudCBpbiBhbiBgaXRlbXNgIGFycmF5IHlvdSBjYW4gdXNlOlxuICAgKlxuICAgKiAqIGB0aGlzLmZvcm0uZ2V0KCdpdGVtcy4wLnByaWNlJyk7YFxuICAgKlxuICAgKiAtT1ItXG4gICAqXG4gICAqICogYHRoaXMuZm9ybS5nZXQoWydpdGVtcycsIDAsICdwcmljZSddKTtgXG4gICAqL1xuICBnZXQ8UCBleHRlbmRzIHN0cmluZyB8IChzdHJpbmcgfCBudW1iZXIpW10+KFxuICAgIHBhdGg6IFAsXG4gICk6IEFic3RyYWN0Q29udHJvbDzJtUdldFByb3BlcnR5PFRSYXdWYWx1ZSwgUD4+IHwgbnVsbCB7XG4gICAgbGV0IGN1cnJQYXRoOiBBcnJheTxzdHJpbmcgfCBudW1iZXI+IHwgc3RyaW5nID0gcGF0aDtcbiAgICBpZiAoY3VyclBhdGggPT0gbnVsbCkgcmV0dXJuIG51bGw7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGN1cnJQYXRoKSkgY3VyclBhdGggPSBjdXJyUGF0aC5zcGxpdCgnLicpO1xuICAgIGlmIChjdXJyUGF0aC5sZW5ndGggPT09IDApIHJldHVybiBudWxsO1xuICAgIHJldHVybiBjdXJyUGF0aC5yZWR1Y2UoXG4gICAgICAoY29udHJvbDogQWJzdHJhY3RDb250cm9sIHwgbnVsbCwgbmFtZSkgPT4gY29udHJvbCAmJiBjb250cm9sLl9maW5kKG5hbWUpLFxuICAgICAgdGhpcyxcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBSZXBvcnRzIGVycm9yIGRhdGEgZm9yIHRoZSBjb250cm9sIHdpdGggdGhlIGdpdmVuIHBhdGguXG4gICAqXG4gICAqIEBwYXJhbSBlcnJvckNvZGUgVGhlIGNvZGUgb2YgdGhlIGVycm9yIHRvIGNoZWNrXG4gICAqIEBwYXJhbSBwYXRoIEEgbGlzdCBvZiBjb250cm9sIG5hbWVzIHRoYXQgZGVzaWduYXRlcyBob3cgdG8gbW92ZSBmcm9tIHRoZSBjdXJyZW50IGNvbnRyb2xcbiAgICogdG8gdGhlIGNvbnRyb2wgdGhhdCBzaG91bGQgYmUgcXVlcmllZCBmb3IgZXJyb3JzLlxuICAgKlxuICAgKiBAdXNhZ2VOb3Rlc1xuICAgKiBGb3IgZXhhbXBsZSwgZm9yIHRoZSBmb2xsb3dpbmcgYEZvcm1Hcm91cGA6XG4gICAqXG4gICAqIGBgYFxuICAgKiBmb3JtID0gbmV3IEZvcm1Hcm91cCh7XG4gICAqICAgYWRkcmVzczogbmV3IEZvcm1Hcm91cCh7IHN0cmVldDogbmV3IEZvcm1Db250cm9sKCkgfSlcbiAgICogfSk7XG4gICAqIGBgYFxuICAgKlxuICAgKiBUaGUgcGF0aCB0byB0aGUgJ3N0cmVldCcgY29udHJvbCBmcm9tIHRoZSByb290IGZvcm0gd291bGQgYmUgJ2FkZHJlc3MnIC0+ICdzdHJlZXQnLlxuICAgKlxuICAgKiBJdCBjYW4gYmUgcHJvdmlkZWQgdG8gdGhpcyBtZXRob2QgaW4gb25lIG9mIHR3byBmb3JtYXRzOlxuICAgKlxuICAgKiAxLiBBbiBhcnJheSBvZiBzdHJpbmcgY29udHJvbCBuYW1lcywgZS5nLiBgWydhZGRyZXNzJywgJ3N0cmVldCddYFxuICAgKiAxLiBBIHBlcmlvZC1kZWxpbWl0ZWQgbGlzdCBvZiBjb250cm9sIG5hbWVzIGluIG9uZSBzdHJpbmcsIGUuZy4gYCdhZGRyZXNzLnN0cmVldCdgXG4gICAqXG4gICAqIEByZXR1cm5zIGVycm9yIGRhdGEgZm9yIHRoYXQgcGFydGljdWxhciBlcnJvci4gSWYgdGhlIGNvbnRyb2wgb3IgZXJyb3IgaXMgbm90IHByZXNlbnQsXG4gICAqIG51bGwgaXMgcmV0dXJuZWQuXG4gICAqL1xuICBnZXRFcnJvcihlcnJvckNvZGU6IHN0cmluZywgcGF0aD86IEFycmF5PHN0cmluZyB8IG51bWJlcj4gfCBzdHJpbmcpOiBhbnkge1xuICAgIGNvbnN0IGNvbnRyb2wgPSBwYXRoID8gdGhpcy5nZXQocGF0aCkgOiB0aGlzO1xuICAgIHJldHVybiBjb250cm9sICYmIGNvbnRyb2wuZXJyb3JzID8gY29udHJvbC5lcnJvcnNbZXJyb3JDb2RlXSA6IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIFJlcG9ydHMgd2hldGhlciB0aGUgY29udHJvbCB3aXRoIHRoZSBnaXZlbiBwYXRoIGhhcyB0aGUgZXJyb3Igc3BlY2lmaWVkLlxuICAgKlxuICAgKiBAcGFyYW0gZXJyb3JDb2RlIFRoZSBjb2RlIG9mIHRoZSBlcnJvciB0byBjaGVja1xuICAgKiBAcGFyYW0gcGF0aCBBIGxpc3Qgb2YgY29udHJvbCBuYW1lcyB0aGF0IGRlc2lnbmF0ZXMgaG93IHRvIG1vdmUgZnJvbSB0aGUgY3VycmVudCBjb250cm9sXG4gICAqIHRvIHRoZSBjb250cm9sIHRoYXQgc2hvdWxkIGJlIHF1ZXJpZWQgZm9yIGVycm9ycy5cbiAgICpcbiAgICogQHVzYWdlTm90ZXNcbiAgICogRm9yIGV4YW1wbGUsIGZvciB0aGUgZm9sbG93aW5nIGBGb3JtR3JvdXBgOlxuICAgKlxuICAgKiBgYGBcbiAgICogZm9ybSA9IG5ldyBGb3JtR3JvdXAoe1xuICAgKiAgIGFkZHJlc3M6IG5ldyBGb3JtR3JvdXAoeyBzdHJlZXQ6IG5ldyBGb3JtQ29udHJvbCgpIH0pXG4gICAqIH0pO1xuICAgKiBgYGBcbiAgICpcbiAgICogVGhlIHBhdGggdG8gdGhlICdzdHJlZXQnIGNvbnRyb2wgZnJvbSB0aGUgcm9vdCBmb3JtIHdvdWxkIGJlICdhZGRyZXNzJyAtPiAnc3RyZWV0Jy5cbiAgICpcbiAgICogSXQgY2FuIGJlIHByb3ZpZGVkIHRvIHRoaXMgbWV0aG9kIGluIG9uZSBvZiB0d28gZm9ybWF0czpcbiAgICpcbiAgICogMS4gQW4gYXJyYXkgb2Ygc3RyaW5nIGNvbnRyb2wgbmFtZXMsIGUuZy4gYFsnYWRkcmVzcycsICdzdHJlZXQnXWBcbiAgICogMS4gQSBwZXJpb2QtZGVsaW1pdGVkIGxpc3Qgb2YgY29udHJvbCBuYW1lcyBpbiBvbmUgc3RyaW5nLCBlLmcuIGAnYWRkcmVzcy5zdHJlZXQnYFxuICAgKlxuICAgKiBJZiBubyBwYXRoIGlzIGdpdmVuLCB0aGlzIG1ldGhvZCBjaGVja3MgZm9yIHRoZSBlcnJvciBvbiB0aGUgY3VycmVudCBjb250cm9sLlxuICAgKlxuICAgKiBAcmV0dXJucyB3aGV0aGVyIHRoZSBnaXZlbiBlcnJvciBpcyBwcmVzZW50IGluIHRoZSBjb250cm9sIGF0IHRoZSBnaXZlbiBwYXRoLlxuICAgKlxuICAgKiBJZiB0aGUgY29udHJvbCBpcyBub3QgcHJlc2VudCwgZmFsc2UgaXMgcmV0dXJuZWQuXG4gICAqL1xuICBoYXNFcnJvcihlcnJvckNvZGU6IHN0cmluZywgcGF0aD86IEFycmF5PHN0cmluZyB8IG51bWJlcj4gfCBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gISF0aGlzLmdldEVycm9yKGVycm9yQ29kZSwgcGF0aCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0cmlldmVzIHRoZSB0b3AtbGV2ZWwgYW5jZXN0b3Igb2YgdGhpcyBjb250cm9sLlxuICAgKi9cbiAgZ2V0IHJvb3QoKTogQWJzdHJhY3RDb250cm9sIHtcbiAgICBsZXQgeDogQWJzdHJhY3RDb250cm9sID0gdGhpcztcblxuICAgIHdoaWxlICh4Ll9wYXJlbnQpIHtcbiAgICAgIHggPSB4Ll9wYXJlbnQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIHg7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF91cGRhdGVDb250cm9sc0Vycm9ycyhcbiAgICBlbWl0RXZlbnQ6IGJvb2xlYW4sXG4gICAgY2hhbmdlZENvbnRyb2w6IEFic3RyYWN0Q29udHJvbCxcbiAgICBzaG91bGRIYXZlRW1pdHRlZD86IGJvb2xlYW4sXG4gICk6IHZvaWQge1xuICAgICh0aGlzIGFzIFdyaXRhYmxlPHRoaXM+KS5zdGF0dXMgPSB0aGlzLl9jYWxjdWxhdGVTdGF0dXMoKTtcblxuICAgIGlmIChlbWl0RXZlbnQpIHtcbiAgICAgICh0aGlzLnN0YXR1c0NoYW5nZXMgYXMgRXZlbnRFbWl0dGVyPEZvcm1Db250cm9sU3RhdHVzPikuZW1pdCh0aGlzLnN0YXR1cyk7XG4gICAgfVxuXG4gICAgLy8gVGhlIEV2ZW50cyBPYnNlcnZhYmxlIGV4cG9zZSBhIHNsaWdodCBkaWZmZXJlbnQgYmV2YWhpb3IgdGhhbiB0aGUgc3RhdHVzQ2hhbmdlcyBvYnNcbiAgICAvLyBBbiBhc3luYyB2YWxpZGF0b3Igd2lsbCBzdGlsbCBlbWl0IGEgU3RhdHVzQ2hhbmdlRXZlbnQgaXMgYSBwcmV2aW91c2x5IGNhbmNlbGxlZFxuICAgIC8vIGFzeW5jIHZhbGlkYXRvciBoYXMgZW1pdEV2ZW50IHNldCB0byB0cnVlXG4gICAgaWYgKGVtaXRFdmVudCB8fCBzaG91bGRIYXZlRW1pdHRlZCkge1xuICAgICAgdGhpcy5fZXZlbnRzLm5leHQobmV3IFN0YXR1c0NoYW5nZUV2ZW50KHRoaXMuc3RhdHVzLCBjaGFuZ2VkQ29udHJvbCkpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9wYXJlbnQpIHtcbiAgICAgIHRoaXMuX3BhcmVudC5fdXBkYXRlQ29udHJvbHNFcnJvcnMoZW1pdEV2ZW50LCBjaGFuZ2VkQ29udHJvbCwgc2hvdWxkSGF2ZUVtaXR0ZWQpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2luaXRPYnNlcnZhYmxlcygpIHtcbiAgICAodGhpcyBhcyBXcml0YWJsZTx0aGlzPikudmFsdWVDaGFuZ2VzID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICAgICh0aGlzIGFzIFdyaXRhYmxlPHRoaXM+KS5zdGF0dXNDaGFuZ2VzID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICB9XG5cbiAgcHJpdmF0ZSBfY2FsY3VsYXRlU3RhdHVzKCk6IEZvcm1Db250cm9sU3RhdHVzIHtcbiAgICBpZiAodGhpcy5fYWxsQ29udHJvbHNEaXNhYmxlZCgpKSByZXR1cm4gRElTQUJMRUQ7XG4gICAgaWYgKHRoaXMuZXJyb3JzKSByZXR1cm4gSU5WQUxJRDtcbiAgICBpZiAodGhpcy5faGFzT3duUGVuZGluZ0FzeW5jVmFsaWRhdG9yIHx8IHRoaXMuX2FueUNvbnRyb2xzSGF2ZVN0YXR1cyhQRU5ESU5HKSkgcmV0dXJuIFBFTkRJTkc7XG4gICAgaWYgKHRoaXMuX2FueUNvbnRyb2xzSGF2ZVN0YXR1cyhJTlZBTElEKSkgcmV0dXJuIElOVkFMSUQ7XG4gICAgcmV0dXJuIFZBTElEO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBhYnN0cmFjdCBfdXBkYXRlVmFsdWUoKTogdm9pZDtcblxuICAvKiogQGludGVybmFsICovXG4gIGFic3RyYWN0IF9mb3JFYWNoQ2hpbGQoY2I6IChjOiBBYnN0cmFjdENvbnRyb2wpID0+IHZvaWQpOiB2b2lkO1xuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgYWJzdHJhY3QgX2FueUNvbnRyb2xzKGNvbmRpdGlvbjogKGM6IEFic3RyYWN0Q29udHJvbCkgPT4gYm9vbGVhbik6IGJvb2xlYW47XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBhYnN0cmFjdCBfYWxsQ29udHJvbHNEaXNhYmxlZCgpOiBib29sZWFuO1xuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgYWJzdHJhY3QgX3N5bmNQZW5kaW5nQ29udHJvbHMoKTogYm9vbGVhbjtcblxuICAvKiogQGludGVybmFsICovXG4gIF9hbnlDb250cm9sc0hhdmVTdGF0dXMoc3RhdHVzOiBGb3JtQ29udHJvbFN0YXR1cyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9hbnlDb250cm9scygoY29udHJvbDogQWJzdHJhY3RDb250cm9sKSA9PiBjb250cm9sLnN0YXR1cyA9PT0gc3RhdHVzKTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2FueUNvbnRyb2xzRGlydHkoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2FueUNvbnRyb2xzKChjb250cm9sOiBBYnN0cmFjdENvbnRyb2wpID0+IGNvbnRyb2wuZGlydHkpO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfYW55Q29udHJvbHNUb3VjaGVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9hbnlDb250cm9scygoY29udHJvbDogQWJzdHJhY3RDb250cm9sKSA9PiBjb250cm9sLnRvdWNoZWQpO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfdXBkYXRlUHJpc3RpbmUob3B0czoge29ubHlTZWxmPzogYm9vbGVhbn0sIGNoYW5nZWRDb250cm9sOiBBYnN0cmFjdENvbnRyb2wpOiB2b2lkIHtcbiAgICBjb25zdCBuZXdQcmlzdGluZSA9ICF0aGlzLl9hbnlDb250cm9sc0RpcnR5KCk7XG4gICAgY29uc3QgY2hhbmdlZCA9IHRoaXMucHJpc3RpbmUgIT09IG5ld1ByaXN0aW5lO1xuICAgICh0aGlzIGFzIFdyaXRhYmxlPHRoaXM+KS5wcmlzdGluZSA9IG5ld1ByaXN0aW5lO1xuXG4gICAgaWYgKHRoaXMuX3BhcmVudCAmJiAhb3B0cy5vbmx5U2VsZikge1xuICAgICAgdGhpcy5fcGFyZW50Ll91cGRhdGVQcmlzdGluZShvcHRzLCBjaGFuZ2VkQ29udHJvbCk7XG4gICAgfVxuXG4gICAgaWYgKGNoYW5nZWQpIHtcbiAgICAgIHRoaXMuX2V2ZW50cy5uZXh0KG5ldyBQcmlzdGluZUNoYW5nZUV2ZW50KHRoaXMucHJpc3RpbmUsIGNoYW5nZWRDb250cm9sKSk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfdXBkYXRlVG91Y2hlZChvcHRzOiB7b25seVNlbGY/OiBib29sZWFufSA9IHt9LCBjaGFuZ2VkQ29udHJvbDogQWJzdHJhY3RDb250cm9sKTogdm9pZCB7XG4gICAgKHRoaXMgYXMgV3JpdGFibGU8dGhpcz4pLnRvdWNoZWQgPSB0aGlzLl9hbnlDb250cm9sc1RvdWNoZWQoKTtcbiAgICB0aGlzLl9ldmVudHMubmV4dChuZXcgVG91Y2hlZENoYW5nZUV2ZW50KHRoaXMudG91Y2hlZCwgY2hhbmdlZENvbnRyb2wpKTtcblxuICAgIGlmICh0aGlzLl9wYXJlbnQgJiYgIW9wdHMub25seVNlbGYpIHtcbiAgICAgIHRoaXMuX3BhcmVudC5fdXBkYXRlVG91Y2hlZChvcHRzLCBjaGFuZ2VkQ29udHJvbCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfb25EaXNhYmxlZENoYW5nZTogQXJyYXk8KGlzRGlzYWJsZWQ6IGJvb2xlYW4pID0+IHZvaWQ+ID0gW107XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcmVnaXN0ZXJPbkNvbGxlY3Rpb25DaGFuZ2UoZm46ICgpID0+IHZvaWQpOiB2b2lkIHtcbiAgICB0aGlzLl9vbkNvbGxlY3Rpb25DaGFuZ2UgPSBmbjtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3NldFVwZGF0ZVN0cmF0ZWd5KG9wdHM/OiBWYWxpZGF0b3JGbiB8IFZhbGlkYXRvckZuW10gfCBBYnN0cmFjdENvbnRyb2xPcHRpb25zIHwgbnVsbCk6IHZvaWQge1xuICAgIGlmIChpc09wdGlvbnNPYmoob3B0cykgJiYgb3B0cy51cGRhdGVPbiAhPSBudWxsKSB7XG4gICAgICB0aGlzLl91cGRhdGVPbiA9IG9wdHMudXBkYXRlT24hO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICogQ2hlY2sgdG8gc2VlIGlmIHBhcmVudCBoYXMgYmVlbiBtYXJrZWQgYXJ0aWZpY2lhbGx5IGRpcnR5LlxuICAgKlxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIHByaXZhdGUgX3BhcmVudE1hcmtlZERpcnR5KG9ubHlTZWxmPzogYm9vbGVhbik6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHBhcmVudERpcnR5ID0gdGhpcy5fcGFyZW50ICYmIHRoaXMuX3BhcmVudC5kaXJ0eTtcbiAgICByZXR1cm4gIW9ubHlTZWxmICYmICEhcGFyZW50RGlydHkgJiYgIXRoaXMuX3BhcmVudCEuX2FueUNvbnRyb2xzRGlydHkoKTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2ZpbmQobmFtZTogc3RyaW5nIHwgbnVtYmVyKTogQWJzdHJhY3RDb250cm9sIHwgbnVsbCB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvKipcbiAgICogSW50ZXJuYWwgaW1wbGVtZW50YXRpb24gb2YgdGhlIGBzZXRWYWxpZGF0b3JzYCBtZXRob2QuIE5lZWRzIHRvIGJlIHNlcGFyYXRlZCBvdXQgaW50byBhXG4gICAqIGRpZmZlcmVudCBtZXRob2QsIGJlY2F1c2UgaXQgaXMgY2FsbGVkIGluIHRoZSBjb25zdHJ1Y3RvciBhbmQgaXQgY2FuIGJyZWFrIGNhc2VzIHdoZXJlXG4gICAqIGEgY29udHJvbCBpcyBleHRlbmRlZC5cbiAgICovXG4gIHByaXZhdGUgX2Fzc2lnblZhbGlkYXRvcnModmFsaWRhdG9yczogVmFsaWRhdG9yRm4gfCBWYWxpZGF0b3JGbltdIHwgbnVsbCk6IHZvaWQge1xuICAgIHRoaXMuX3Jhd1ZhbGlkYXRvcnMgPSBBcnJheS5pc0FycmF5KHZhbGlkYXRvcnMpID8gdmFsaWRhdG9ycy5zbGljZSgpIDogdmFsaWRhdG9ycztcbiAgICB0aGlzLl9jb21wb3NlZFZhbGlkYXRvckZuID0gY29lcmNlVG9WYWxpZGF0b3IodGhpcy5fcmF3VmFsaWRhdG9ycyk7XG4gIH1cblxuICAvKipcbiAgICogSW50ZXJuYWwgaW1wbGVtZW50YXRpb24gb2YgdGhlIGBzZXRBc3luY1ZhbGlkYXRvcnNgIG1ldGhvZC4gTmVlZHMgdG8gYmUgc2VwYXJhdGVkIG91dCBpbnRvIGFcbiAgICogZGlmZmVyZW50IG1ldGhvZCwgYmVjYXVzZSBpdCBpcyBjYWxsZWQgaW4gdGhlIGNvbnN0cnVjdG9yIGFuZCBpdCBjYW4gYnJlYWsgY2FzZXMgd2hlcmVcbiAgICogYSBjb250cm9sIGlzIGV4dGVuZGVkLlxuICAgKi9cbiAgcHJpdmF0ZSBfYXNzaWduQXN5bmNWYWxpZGF0b3JzKHZhbGlkYXRvcnM6IEFzeW5jVmFsaWRhdG9yRm4gfCBBc3luY1ZhbGlkYXRvckZuW10gfCBudWxsKTogdm9pZCB7XG4gICAgdGhpcy5fcmF3QXN5bmNWYWxpZGF0b3JzID0gQXJyYXkuaXNBcnJheSh2YWxpZGF0b3JzKSA/IHZhbGlkYXRvcnMuc2xpY2UoKSA6IHZhbGlkYXRvcnM7XG4gICAgdGhpcy5fY29tcG9zZWRBc3luY1ZhbGlkYXRvckZuID0gY29lcmNlVG9Bc3luY1ZhbGlkYXRvcih0aGlzLl9yYXdBc3luY1ZhbGlkYXRvcnMpO1xuICB9XG59XG4iXX0=