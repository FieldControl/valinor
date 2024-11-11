/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { computed, Directive, EventEmitter, forwardRef, Inject, Input, Optional, Output, Self, signal, untracked, } from '@angular/core';
import { isFormControl } from '../../model/form_control';
import { FormGroup } from '../../model/form_group';
import { NG_ASYNC_VALIDATORS, NG_VALIDATORS } from '../../validators';
import { ControlContainer } from '../control_container';
import { missingFormException } from '../reactive_errors';
import { CALL_SET_DISABLED_STATE, cleanUpControl, cleanUpFormContainer, cleanUpValidators, removeListItem, setUpControl, setUpFormContainer, setUpValidators, syncPendingControls, } from '../shared';
import { FormResetEvent, FormSubmittedEvent } from '../../model/abstract_model';
import * as i0 from "@angular/core";
const formDirectiveProvider = {
    provide: ControlContainer,
    useExisting: forwardRef(() => FormGroupDirective),
};
/**
 * @description
 *
 * Binds an existing `FormGroup` or `FormRecord` to a DOM element.
 *
 * This directive accepts an existing `FormGroup` instance. It will then use this
 * `FormGroup` instance to match any child `FormControl`, `FormGroup`/`FormRecord`,
 * and `FormArray` instances to child `FormControlName`, `FormGroupName`,
 * and `FormArrayName` directives.
 *
 * @see [Reactive Forms Guide](guide/forms/reactive-forms)
 * @see {@link AbstractControl}
 *
 * @usageNotes
 * ### Register Form Group
 *
 * The following example registers a `FormGroup` with first name and last name controls,
 * and listens for the *ngSubmit* event when the button is clicked.
 *
 * {@example forms/ts/simpleFormGroup/simple_form_group_example.ts region='Component'}
 *
 * @ngModule ReactiveFormsModule
 * @publicApi
 */
export class FormGroupDirective extends ControlContainer {
    /**
     * @description
     * Reports whether the form submission has been triggered.
     */
    get submitted() {
        return untracked(this._submittedReactive);
    }
    // TODO(atscott): Remove once invalid API usage is cleaned up internally
    set submitted(value) {
        this._submittedReactive.set(value);
    }
    constructor(validators, asyncValidators, callSetDisabledState) {
        super();
        this.callSetDisabledState = callSetDisabledState;
        /** @internal */
        this._submitted = computed(() => this._submittedReactive());
        this._submittedReactive = signal(false);
        /**
         * Callback that should be invoked when controls in FormGroup or FormArray collection change
         * (added or removed). This callback triggers corresponding DOM updates.
         */
        this._onCollectionChange = () => this._updateDomValue();
        /**
         * @description
         * Tracks the list of added `FormControlName` instances
         */
        this.directives = [];
        /**
         * @description
         * Tracks the `FormGroup` bound to this directive.
         */
        this.form = null;
        /**
         * @description
         * Emits an event when the form submission has been triggered.
         */
        this.ngSubmit = new EventEmitter();
        this._setValidators(validators);
        this._setAsyncValidators(asyncValidators);
    }
    /** @nodoc */
    ngOnChanges(changes) {
        this._checkFormPresent();
        if (changes.hasOwnProperty('form')) {
            this._updateValidators();
            this._updateDomValue();
            this._updateRegistrations();
            this._oldForm = this.form;
        }
    }
    /** @nodoc */
    ngOnDestroy() {
        if (this.form) {
            cleanUpValidators(this.form, this);
            // Currently the `onCollectionChange` callback is rewritten each time the
            // `_registerOnCollectionChange` function is invoked. The implication is that cleanup should
            // happen *only* when the `onCollectionChange` callback was set by this directive instance.
            // Otherwise it might cause overriding a callback of some other directive instances. We should
            // consider updating this logic later to make it similar to how `onChange` callbacks are
            // handled, see https://github.com/angular/angular/issues/39732 for additional info.
            if (this.form._onCollectionChange === this._onCollectionChange) {
                this.form._registerOnCollectionChange(() => { });
            }
        }
    }
    /**
     * @description
     * Returns this directive's instance.
     */
    get formDirective() {
        return this;
    }
    /**
     * @description
     * Returns the `FormGroup` bound to this directive.
     */
    get control() {
        return this.form;
    }
    /**
     * @description
     * Returns an array representing the path to this group. Because this directive
     * always lives at the top level of a form, it always an empty array.
     */
    get path() {
        return [];
    }
    /**
     * @description
     * Method that sets up the control directive in this group, re-calculates its value
     * and validity, and adds the instance to the internal list of directives.
     *
     * @param dir The `FormControlName` directive instance.
     */
    addControl(dir) {
        const ctrl = this.form.get(dir.path);
        setUpControl(ctrl, dir, this.callSetDisabledState);
        ctrl.updateValueAndValidity({ emitEvent: false });
        this.directives.push(dir);
        return ctrl;
    }
    /**
     * @description
     * Retrieves the `FormControl` instance from the provided `FormControlName` directive
     *
     * @param dir The `FormControlName` directive instance.
     */
    getControl(dir) {
        return this.form.get(dir.path);
    }
    /**
     * @description
     * Removes the `FormControlName` instance from the internal list of directives
     *
     * @param dir The `FormControlName` directive instance.
     */
    removeControl(dir) {
        cleanUpControl(dir.control || null, dir, /* validateControlPresenceOnChange */ false);
        removeListItem(this.directives, dir);
    }
    /**
     * Adds a new `FormGroupName` directive instance to the form.
     *
     * @param dir The `FormGroupName` directive instance.
     */
    addFormGroup(dir) {
        this._setUpFormContainer(dir);
    }
    /**
     * Performs the necessary cleanup when a `FormGroupName` directive instance is removed from the
     * view.
     *
     * @param dir The `FormGroupName` directive instance.
     */
    removeFormGroup(dir) {
        this._cleanUpFormContainer(dir);
    }
    /**
     * @description
     * Retrieves the `FormGroup` for a provided `FormGroupName` directive instance
     *
     * @param dir The `FormGroupName` directive instance.
     */
    getFormGroup(dir) {
        return this.form.get(dir.path);
    }
    /**
     * Performs the necessary setup when a `FormArrayName` directive instance is added to the view.
     *
     * @param dir The `FormArrayName` directive instance.
     */
    addFormArray(dir) {
        this._setUpFormContainer(dir);
    }
    /**
     * Performs the necessary cleanup when a `FormArrayName` directive instance is removed from the
     * view.
     *
     * @param dir The `FormArrayName` directive instance.
     */
    removeFormArray(dir) {
        this._cleanUpFormContainer(dir);
    }
    /**
     * @description
     * Retrieves the `FormArray` for a provided `FormArrayName` directive instance.
     *
     * @param dir The `FormArrayName` directive instance.
     */
    getFormArray(dir) {
        return this.form.get(dir.path);
    }
    /**
     * Sets the new value for the provided `FormControlName` directive.
     *
     * @param dir The `FormControlName` directive instance.
     * @param value The new value for the directive's control.
     */
    updateModel(dir, value) {
        const ctrl = this.form.get(dir.path);
        ctrl.setValue(value);
    }
    /**
     * @description
     * Method called with the "submit" event is triggered on the form.
     * Triggers the `ngSubmit` emitter to emit the "submit" event as its payload.
     *
     * @param $event The "submit" event object
     */
    onSubmit($event) {
        this._submittedReactive.set(true);
        syncPendingControls(this.form, this.directives);
        this.ngSubmit.emit($event);
        this.form._events.next(new FormSubmittedEvent(this.control));
        // Forms with `method="dialog"` have some special behavior that won't reload the page and that
        // shouldn't be prevented. Note that we need to null check the `event` and the `target`, because
        // some internal apps call this method directly with the wrong arguments.
        return $event?.target?.method === 'dialog';
    }
    /**
     * @description
     * Method called when the "reset" event is triggered on the form.
     */
    onReset() {
        this.resetForm();
    }
    /**
     * @description
     * Resets the form to an initial value and resets its submitted status.
     *
     * @param value The new value for the form.
     */
    resetForm(value = undefined) {
        this.form.reset(value);
        this._submittedReactive.set(false);
        this.form._events.next(new FormResetEvent(this.form));
    }
    /** @internal */
    _updateDomValue() {
        this.directives.forEach((dir) => {
            const oldCtrl = dir.control;
            const newCtrl = this.form.get(dir.path);
            if (oldCtrl !== newCtrl) {
                // Note: the value of the `dir.control` may not be defined, for example when it's a first
                // `FormControl` that is added to a `FormGroup` instance (via `addControl` call).
                cleanUpControl(oldCtrl || null, dir);
                // Check whether new control at the same location inside the corresponding `FormGroup` is an
                // instance of `FormControl` and perform control setup only if that's the case.
                // Note: we don't need to clear the list of directives (`this.directives`) here, it would be
                // taken care of in the `removeControl` method invoked when corresponding `formControlName`
                // directive instance is being removed (invoked from `FormControlName.ngOnDestroy`).
                if (isFormControl(newCtrl)) {
                    setUpControl(newCtrl, dir, this.callSetDisabledState);
                    dir.control = newCtrl;
                }
            }
        });
        this.form._updateTreeValidity({ emitEvent: false });
    }
    _setUpFormContainer(dir) {
        const ctrl = this.form.get(dir.path);
        setUpFormContainer(ctrl, dir);
        // NOTE: this operation looks unnecessary in case no new validators were added in
        // `setUpFormContainer` call. Consider updating this code to match the logic in
        // `_cleanUpFormContainer` function.
        ctrl.updateValueAndValidity({ emitEvent: false });
    }
    _cleanUpFormContainer(dir) {
        if (this.form) {
            const ctrl = this.form.get(dir.path);
            if (ctrl) {
                const isControlUpdated = cleanUpFormContainer(ctrl, dir);
                if (isControlUpdated) {
                    // Run validity check only in case a control was updated (i.e. view validators were
                    // removed) as removing view validators might cause validity to change.
                    ctrl.updateValueAndValidity({ emitEvent: false });
                }
            }
        }
    }
    _updateRegistrations() {
        this.form._registerOnCollectionChange(this._onCollectionChange);
        if (this._oldForm) {
            this._oldForm._registerOnCollectionChange(() => { });
        }
    }
    _updateValidators() {
        setUpValidators(this.form, this);
        if (this._oldForm) {
            cleanUpValidators(this._oldForm, this);
        }
    }
    _checkFormPresent() {
        if (!this.form && (typeof ngDevMode === 'undefined' || ngDevMode)) {
            throw missingFormException();
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: FormGroupDirective, deps: [{ token: NG_VALIDATORS, optional: true, self: true }, { token: NG_ASYNC_VALIDATORS, optional: true, self: true }, { token: CALL_SET_DISABLED_STATE, optional: true }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.7", type: FormGroupDirective, selector: "[formGroup]", inputs: { form: ["formGroup", "form"] }, outputs: { ngSubmit: "ngSubmit" }, host: { listeners: { "submit": "onSubmit($event)", "reset": "onReset()" } }, providers: [formDirectiveProvider], exportAs: ["ngForm"], usesInheritance: true, usesOnChanges: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: FormGroupDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[formGroup]',
                    providers: [formDirectiveProvider],
                    host: { '(submit)': 'onSubmit($event)', '(reset)': 'onReset()' },
                    exportAs: 'ngForm',
                }]
        }], ctorParameters: () => [{ type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Self
                }, {
                    type: Inject,
                    args: [NG_VALIDATORS]
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Self
                }, {
                    type: Inject,
                    args: [NG_ASYNC_VALIDATORS]
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [CALL_SET_DISABLED_STATE]
                }] }], propDecorators: { form: [{
                type: Input,
                args: ['formGroup']
            }], ngSubmit: [{
                type: Output
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybV9ncm91cF9kaXJlY3RpdmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9mb3Jtcy9zcmMvZGlyZWN0aXZlcy9yZWFjdGl2ZV9kaXJlY3RpdmVzL2Zvcm1fZ3JvdXBfZGlyZWN0aXZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFDTCxRQUFRLEVBQ1IsU0FBUyxFQUNULFlBQVksRUFDWixVQUFVLEVBQ1YsTUFBTSxFQUNOLEtBQUssRUFHTCxRQUFRLEVBQ1IsTUFBTSxFQUVOLElBQUksRUFDSixNQUFNLEVBRU4sU0FBUyxHQUVWLE1BQU0sZUFBZSxDQUFDO0FBR3ZCLE9BQU8sRUFBYyxhQUFhLEVBQUMsTUFBTSwwQkFBMEIsQ0FBQztBQUNwRSxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sd0JBQXdCLENBQUM7QUFDakQsT0FBTyxFQUFDLG1CQUFtQixFQUFFLGFBQWEsRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBQ3BFLE9BQU8sRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBRXRELE9BQU8sRUFBQyxvQkFBb0IsRUFBQyxNQUFNLG9CQUFvQixDQUFDO0FBQ3hELE9BQU8sRUFDTCx1QkFBdUIsRUFDdkIsY0FBYyxFQUNkLG9CQUFvQixFQUNwQixpQkFBaUIsRUFDakIsY0FBYyxFQUVkLFlBQVksRUFDWixrQkFBa0IsRUFDbEIsZUFBZSxFQUNmLG1CQUFtQixHQUNwQixNQUFNLFdBQVcsQ0FBQztBQUtuQixPQUFPLEVBQUMsY0FBYyxFQUFFLGtCQUFrQixFQUFDLE1BQU0sNEJBQTRCLENBQUM7O0FBRTlFLE1BQU0scUJBQXFCLEdBQWE7SUFDdEMsT0FBTyxFQUFFLGdCQUFnQjtJQUN6QixXQUFXLEVBQUUsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDLGtCQUFrQixDQUFDO0NBQ2xELENBQUM7QUFFRjs7Ozs7Ozs7Ozs7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RSxDQUFDO1lBQ2xFLE1BQU0sb0JBQW9CLEVBQUUsQ0FBQztRQUMvQixDQUFDO0lBQ0gsQ0FBQzt5SEFwVVUsa0JBQWtCLGtCQStDQyxhQUFhLHlDQUdqQyxtQkFBbUIseUNBR25CLHVCQUF1Qjs2R0FyRHRCLGtCQUFrQiwrTEFKbEIsQ0FBQyxxQkFBcUIsQ0FBQzs7c0dBSXZCLGtCQUFrQjtrQkFOOUIsU0FBUzttQkFBQztvQkFDVCxRQUFRLEVBQUUsYUFBYTtvQkFDdkIsU0FBUyxFQUFFLENBQUMscUJBQXFCLENBQUM7b0JBQ2xDLElBQUksRUFBRSxFQUFDLFVBQVUsRUFBRSxrQkFBa0IsRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFDO29CQUM5RCxRQUFRLEVBQUUsUUFBUTtpQkFDbkI7OzBCQWdESSxRQUFROzswQkFBSSxJQUFJOzswQkFBSSxNQUFNOzJCQUFDLGFBQWE7OzBCQUN4QyxRQUFROzswQkFDUixJQUFJOzswQkFDSixNQUFNOzJCQUFDLG1CQUFtQjs7MEJBRTFCLFFBQVE7OzBCQUNSLE1BQU07MkJBQUMsdUJBQXVCO3lDQWZiLElBQUk7c0JBQXZCLEtBQUs7dUJBQUMsV0FBVztnQkFNUixRQUFRO3NCQUFqQixNQUFNIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuZGV2L2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1xuICBjb21wdXRlZCxcbiAgRGlyZWN0aXZlLFxuICBFdmVudEVtaXR0ZXIsXG4gIGZvcndhcmRSZWYsXG4gIEluamVjdCxcbiAgSW5wdXQsXG4gIE9uQ2hhbmdlcyxcbiAgT25EZXN0cm95LFxuICBPcHRpb25hbCxcbiAgT3V0cHV0LFxuICBQcm92aWRlcixcbiAgU2VsZixcbiAgc2lnbmFsLFxuICBTaW1wbGVDaGFuZ2VzLFxuICB1bnRyYWNrZWQsXG4gIMm1V3JpdGFibGUgYXMgV3JpdGFibGUsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge0Zvcm1BcnJheX0gZnJvbSAnLi4vLi4vbW9kZWwvZm9ybV9hcnJheSc7XG5pbXBvcnQge0Zvcm1Db250cm9sLCBpc0Zvcm1Db250cm9sfSBmcm9tICcuLi8uLi9tb2RlbC9mb3JtX2NvbnRyb2wnO1xuaW1wb3J0IHtGb3JtR3JvdXB9IGZyb20gJy4uLy4uL21vZGVsL2Zvcm1fZ3JvdXAnO1xuaW1wb3J0IHtOR19BU1lOQ19WQUxJREFUT1JTLCBOR19WQUxJREFUT1JTfSBmcm9tICcuLi8uLi92YWxpZGF0b3JzJztcbmltcG9ydCB7Q29udHJvbENvbnRhaW5lcn0gZnJvbSAnLi4vY29udHJvbF9jb250YWluZXInO1xuaW1wb3J0IHtGb3JtfSBmcm9tICcuLi9mb3JtX2ludGVyZmFjZSc7XG5pbXBvcnQge21pc3NpbmdGb3JtRXhjZXB0aW9ufSBmcm9tICcuLi9yZWFjdGl2ZV9lcnJvcnMnO1xuaW1wb3J0IHtcbiAgQ0FMTF9TRVRfRElTQUJMRURfU1RBVEUsXG4gIGNsZWFuVXBDb250cm9sLFxuICBjbGVhblVwRm9ybUNvbnRhaW5lcixcbiAgY2xlYW5VcFZhbGlkYXRvcnMsXG4gIHJlbW92ZUxpc3RJdGVtLFxuICBTZXREaXNhYmxlZFN0YXRlT3B0aW9uLFxuICBzZXRVcENvbnRyb2wsXG4gIHNldFVwRm9ybUNvbnRhaW5lcixcbiAgc2V0VXBWYWxpZGF0b3JzLFxuICBzeW5jUGVuZGluZ0NvbnRyb2xzLFxufSBmcm9tICcuLi9zaGFyZWQnO1xuaW1wb3J0IHtBc3luY1ZhbGlkYXRvciwgQXN5bmNWYWxpZGF0b3JGbiwgVmFsaWRhdG9yLCBWYWxpZGF0b3JGbn0gZnJvbSAnLi4vdmFsaWRhdG9ycyc7XG5cbmltcG9ydCB7Rm9ybUNvbnRyb2xOYW1lfSBmcm9tICcuL2Zvcm1fY29udHJvbF9uYW1lJztcbmltcG9ydCB7Rm9ybUFycmF5TmFtZSwgRm9ybUdyb3VwTmFtZX0gZnJvbSAnLi9mb3JtX2dyb3VwX25hbWUnO1xuaW1wb3J0IHtGb3JtUmVzZXRFdmVudCwgRm9ybVN1Ym1pdHRlZEV2ZW50fSBmcm9tICcuLi8uLi9tb2RlbC9hYnN0cmFjdF9tb2RlbCc7XG5cbmNvbnN0IGZvcm1EaXJlY3RpdmVQcm92aWRlcjogUHJvdmlkZXIgPSB7XG4gIHByb3ZpZGU6IENvbnRyb2xDb250YWluZXIsXG4gIHVzZUV4aXN0aW5nOiBmb3J3YXJkUmVmKCgpID0+IEZvcm1Hcm91cERpcmVjdGl2ZSksXG59O1xuXG4vKipcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIEJpbmRzIGFuIGV4aXN0aW5nIGBGb3JtR3JvdXBgIG9yIGBGb3JtUmVjb3JkYCB0byBhIERPTSBlbGVtZW50LlxuICpcbiAqIFRoaXMgZGlyZWN0aXZlIGFjY2VwdHMgYW4gZXhpc3RpbmcgYEZvcm1Hcm91cGAgaW5zdGFuY2UuIEl0IHdpbGwgdGhlbiB1c2UgdGhpc1xuICogYEZvcm1Hcm91cGAgaW5zdGFuY2UgdG8gbWF0Y2ggYW55IGNoaWxkIGBGb3JtQ29udHJvbGAsIGBGb3JtR3JvdXBgL2BGb3JtUmVjb3JkYCxcbiAqIGFuZCBgRm9ybUFycmF5YCBpbnN0YW5jZXMgdG8gY2hpbGQgYEZvcm1Db250cm9sTmFtZWAsIGBGb3JtR3JvdXBOYW1lYCxcbiAqIGFuZCBgRm9ybUFycmF5TmFtZWAgZGlyZWN0aXZlcy5cbiAqXG4gKiBAc2VlIFtSZWFjdGl2ZSBGb3JtcyBHdWlkZV0oZ3VpZGUvZm9ybXMvcmVhY3RpdmUtZm9ybXMpXG4gKiBAc2VlIHtAbGluayBBYnN0cmFjdENvbnRyb2x9XG4gKlxuICogQHVzYWdlTm90ZXNcbiAqICMjIyBSZWdpc3RlciBGb3JtIEdyb3VwXG4gKlxuICogVGhlIGZvbGxvd2luZyBleGFtcGxlIHJlZ2lzdGVycyBhIGBGb3JtR3JvdXBgIHdpdGggZmlyc3QgbmFtZSBhbmQgbGFzdCBuYW1lIGNvbnRyb2xzLFxuICogYW5kIGxpc3RlbnMgZm9yIHRoZSAqbmdTdWJtaXQqIGV2ZW50IHdoZW4gdGhlIGJ1dHRvbiBpcyBjbGlja2VkLlxuICpcbiAqIHtAZXhhbXBsZSBmb3Jtcy90cy9zaW1wbGVGb3JtR3JvdXAvc2ltcGxlX2Zvcm1fZ3JvdXBfZXhhbXBsZS50cyByZWdpb249J0NvbXBvbmVudCd9XG4gKlxuICogQG5nTW9kdWxlIFJlYWN0aXZlRm9ybXNNb2R1bGVcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW2Zvcm1Hcm91cF0nLFxuICBwcm92aWRlcnM6IFtmb3JtRGlyZWN0aXZlUHJvdmlkZXJdLFxuICBob3N0OiB7JyhzdWJtaXQpJzogJ29uU3VibWl0KCRldmVudCknLCAnKHJlc2V0KSc6ICdvblJlc2V0KCknfSxcbiAgZXhwb3J0QXM6ICduZ0Zvcm0nLFxufSlcbmV4cG9ydCBjbGFzcyBGb3JtR3JvdXBEaXJlY3RpdmUgZXh0ZW5kcyBDb250cm9sQ29udGFpbmVyIGltcGxlbWVudHMgRm9ybSwgT25DaGFuZ2VzLCBPbkRlc3Ryb3kge1xuICAvKipcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIFJlcG9ydHMgd2hldGhlciB0aGUgZm9ybSBzdWJtaXNzaW9uIGhhcyBiZWVuIHRyaWdnZXJlZC5cbiAgICovXG4gIGdldCBzdWJtaXR0ZWQoKSB7XG4gICAgcmV0dXJuIHVudHJhY2tlZCh0aGlzLl9zdWJtaXR0ZWRSZWFjdGl2ZSk7XG4gIH1cbiAgLy8gVE9ETyhhdHNjb3R0KTogUmVtb3ZlIG9uY2UgaW52YWxpZCBBUEkgdXNhZ2UgaXMgY2xlYW5lZCB1cCBpbnRlcm5hbGx5XG4gIHByaXZhdGUgc2V0IHN1Ym1pdHRlZCh2YWx1ZTogYm9vbGVhbikge1xuICAgIHRoaXMuX3N1Ym1pdHRlZFJlYWN0aXZlLnNldCh2YWx1ZSk7XG4gIH1cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICByZWFkb25seSBfc3VibWl0dGVkID0gY29tcHV0ZWQoKCkgPT4gdGhpcy5fc3VibWl0dGVkUmVhY3RpdmUoKSk7XG4gIHByaXZhdGUgcmVhZG9ubHkgX3N1Ym1pdHRlZFJlYWN0aXZlID0gc2lnbmFsKGZhbHNlKTtcblxuICAvKipcbiAgICogUmVmZXJlbmNlIHRvIGFuIG9sZCBmb3JtIGdyb3VwIGlucHV0IHZhbHVlLCB3aGljaCBpcyBuZWVkZWQgdG8gY2xlYW51cFxuICAgKiBvbGQgaW5zdGFuY2UgaW4gY2FzZSBpdCB3YXMgcmVwbGFjZWQgd2l0aCBhIG5ldyBvbmUuXG4gICAqL1xuICBwcml2YXRlIF9vbGRGb3JtOiBGb3JtR3JvdXAgfCB1bmRlZmluZWQ7XG5cbiAgLyoqXG4gICAqIENhbGxiYWNrIHRoYXQgc2hvdWxkIGJlIGludm9rZWQgd2hlbiBjb250cm9scyBpbiBGb3JtR3JvdXAgb3IgRm9ybUFycmF5IGNvbGxlY3Rpb24gY2hhbmdlXG4gICAqIChhZGRlZCBvciByZW1vdmVkKS4gVGhpcyBjYWxsYmFjayB0cmlnZ2VycyBjb3JyZXNwb25kaW5nIERPTSB1cGRhdGVzLlxuICAgKi9cbiAgcHJpdmF0ZSByZWFkb25seSBfb25Db2xsZWN0aW9uQ2hhbmdlID0gKCkgPT4gdGhpcy5fdXBkYXRlRG9tVmFsdWUoKTtcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIFRyYWNrcyB0aGUgbGlzdCBvZiBhZGRlZCBgRm9ybUNvbnRyb2xOYW1lYCBpbnN0YW5jZXNcbiAgICovXG4gIGRpcmVjdGl2ZXM6IEZvcm1Db250cm9sTmFtZVtdID0gW107XG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBUcmFja3MgdGhlIGBGb3JtR3JvdXBgIGJvdW5kIHRvIHRoaXMgZGlyZWN0aXZlLlxuICAgKi9cbiAgQElucHV0KCdmb3JtR3JvdXAnKSBmb3JtOiBGb3JtR3JvdXAgPSBudWxsITtcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIEVtaXRzIGFuIGV2ZW50IHdoZW4gdGhlIGZvcm0gc3VibWlzc2lvbiBoYXMgYmVlbiB0cmlnZ2VyZWQuXG4gICAqL1xuICBAT3V0cHV0KCkgbmdTdWJtaXQgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgQE9wdGlvbmFsKCkgQFNlbGYoKSBASW5qZWN0KE5HX1ZBTElEQVRPUlMpIHZhbGlkYXRvcnM6IChWYWxpZGF0b3IgfCBWYWxpZGF0b3JGbilbXSxcbiAgICBAT3B0aW9uYWwoKVxuICAgIEBTZWxmKClcbiAgICBASW5qZWN0KE5HX0FTWU5DX1ZBTElEQVRPUlMpXG4gICAgYXN5bmNWYWxpZGF0b3JzOiAoQXN5bmNWYWxpZGF0b3IgfCBBc3luY1ZhbGlkYXRvckZuKVtdLFxuICAgIEBPcHRpb25hbCgpXG4gICAgQEluamVjdChDQUxMX1NFVF9ESVNBQkxFRF9TVEFURSlcbiAgICBwcml2YXRlIGNhbGxTZXREaXNhYmxlZFN0YXRlPzogU2V0RGlzYWJsZWRTdGF0ZU9wdGlvbixcbiAgKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLl9zZXRWYWxpZGF0b3JzKHZhbGlkYXRvcnMpO1xuICAgIHRoaXMuX3NldEFzeW5jVmFsaWRhdG9ycyhhc3luY1ZhbGlkYXRvcnMpO1xuICB9XG5cbiAgLyoqIEBub2RvYyAqL1xuICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKTogdm9pZCB7XG4gICAgdGhpcy5fY2hlY2tGb3JtUHJlc2VudCgpO1xuICAgIGlmIChjaGFuZ2VzLmhhc093blByb3BlcnR5KCdmb3JtJykpIHtcbiAgICAgIHRoaXMuX3VwZGF0ZVZhbGlkYXRvcnMoKTtcbiAgICAgIHRoaXMuX3VwZGF0ZURvbVZhbHVlKCk7XG4gICAgICB0aGlzLl91cGRhdGVSZWdpc3RyYXRpb25zKCk7XG4gICAgICB0aGlzLl9vbGRGb3JtID0gdGhpcy5mb3JtO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAbm9kb2MgKi9cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgaWYgKHRoaXMuZm9ybSkge1xuICAgICAgY2xlYW5VcFZhbGlkYXRvcnModGhpcy5mb3JtLCB0aGlzKTtcblxuICAgICAgLy8gQ3VycmVudGx5IHRoZSBgb25Db2xsZWN0aW9uQ2hhbmdlYCBjYWxsYmFjayBpcyByZXdyaXR0ZW4gZWFjaCB0aW1lIHRoZVxuICAgICAgLy8gYF9yZWdpc3Rlck9uQ29sbGVjdGlvbkNoYW5nZWAgZnVuY3Rpb24gaXMgaW52b2tlZC4gVGhlIGltcGxpY2F0aW9uIGlzIHRoYXQgY2xlYW51cCBzaG91bGRcbiAgICAgIC8vIGhhcHBlbiAqb25seSogd2hlbiB0aGUgYG9uQ29sbGVjdGlvbkNoYW5nZWAgY2FsbGJhY2sgd2FzIHNldCBieSB0aGlzIGRpcmVjdGl2ZSBpbnN0YW5jZS5cbiAgICAgIC8vIE90aGVyd2lzZSBpdCBtaWdodCBjYXVzZSBvdmVycmlkaW5nIGEgY2FsbGJhY2sgb2Ygc29tZSBvdGhlciBkaXJlY3RpdmUgaW5zdGFuY2VzLiBXZSBzaG91bGRcbiAgICAgIC8vIGNvbnNpZGVyIHVwZGF0aW5nIHRoaXMgbG9naWMgbGF0ZXIgdG8gbWFrZSBpdCBzaW1pbGFyIHRvIGhvdyBgb25DaGFuZ2VgIGNhbGxiYWNrcyBhcmVcbiAgICAgIC8vIGhhbmRsZWQsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyL2lzc3Vlcy8zOTczMiBmb3IgYWRkaXRpb25hbCBpbmZvLlxuICAgICAgaWYgKHRoaXMuZm9ybS5fb25Db2xsZWN0aW9uQ2hhbmdlID09PSB0aGlzLl9vbkNvbGxlY3Rpb25DaGFuZ2UpIHtcbiAgICAgICAgdGhpcy5mb3JtLl9yZWdpc3Rlck9uQ29sbGVjdGlvbkNoYW5nZSgoKSA9PiB7fSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBSZXR1cm5zIHRoaXMgZGlyZWN0aXZlJ3MgaW5zdGFuY2UuXG4gICAqL1xuICBvdmVycmlkZSBnZXQgZm9ybURpcmVjdGl2ZSgpOiBGb3JtIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogUmV0dXJucyB0aGUgYEZvcm1Hcm91cGAgYm91bmQgdG8gdGhpcyBkaXJlY3RpdmUuXG4gICAqL1xuICBvdmVycmlkZSBnZXQgY29udHJvbCgpOiBGb3JtR3JvdXAge1xuICAgIHJldHVybiB0aGlzLmZvcm07XG4gIH1cblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIFJldHVybnMgYW4gYXJyYXkgcmVwcmVzZW50aW5nIHRoZSBwYXRoIHRvIHRoaXMgZ3JvdXAuIEJlY2F1c2UgdGhpcyBkaXJlY3RpdmVcbiAgICogYWx3YXlzIGxpdmVzIGF0IHRoZSB0b3AgbGV2ZWwgb2YgYSBmb3JtLCBpdCBhbHdheXMgYW4gZW1wdHkgYXJyYXkuXG4gICAqL1xuICBvdmVycmlkZSBnZXQgcGF0aCgpOiBzdHJpbmdbXSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBNZXRob2QgdGhhdCBzZXRzIHVwIHRoZSBjb250cm9sIGRpcmVjdGl2ZSBpbiB0aGlzIGdyb3VwLCByZS1jYWxjdWxhdGVzIGl0cyB2YWx1ZVxuICAgKiBhbmQgdmFsaWRpdHksIGFuZCBhZGRzIHRoZSBpbnN0YW5jZSB0byB0aGUgaW50ZXJuYWwgbGlzdCBvZiBkaXJlY3RpdmVzLlxuICAgKlxuICAgKiBAcGFyYW0gZGlyIFRoZSBgRm9ybUNvbnRyb2xOYW1lYCBkaXJlY3RpdmUgaW5zdGFuY2UuXG4gICAqL1xuICBhZGRDb250cm9sKGRpcjogRm9ybUNvbnRyb2xOYW1lKTogRm9ybUNvbnRyb2wge1xuICAgIGNvbnN0IGN0cmw6IGFueSA9IHRoaXMuZm9ybS5nZXQoZGlyLnBhdGgpO1xuICAgIHNldFVwQ29udHJvbChjdHJsLCBkaXIsIHRoaXMuY2FsbFNldERpc2FibGVkU3RhdGUpO1xuICAgIGN0cmwudXBkYXRlVmFsdWVBbmRWYWxpZGl0eSh7ZW1pdEV2ZW50OiBmYWxzZX0pO1xuICAgIHRoaXMuZGlyZWN0aXZlcy5wdXNoKGRpcik7XG4gICAgcmV0dXJuIGN0cmw7XG4gIH1cblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIFJldHJpZXZlcyB0aGUgYEZvcm1Db250cm9sYCBpbnN0YW5jZSBmcm9tIHRoZSBwcm92aWRlZCBgRm9ybUNvbnRyb2xOYW1lYCBkaXJlY3RpdmVcbiAgICpcbiAgICogQHBhcmFtIGRpciBUaGUgYEZvcm1Db250cm9sTmFtZWAgZGlyZWN0aXZlIGluc3RhbmNlLlxuICAgKi9cbiAgZ2V0Q29udHJvbChkaXI6IEZvcm1Db250cm9sTmFtZSk6IEZvcm1Db250cm9sIHtcbiAgICByZXR1cm4gPEZvcm1Db250cm9sPnRoaXMuZm9ybS5nZXQoZGlyLnBhdGgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBSZW1vdmVzIHRoZSBgRm9ybUNvbnRyb2xOYW1lYCBpbnN0YW5jZSBmcm9tIHRoZSBpbnRlcm5hbCBsaXN0IG9mIGRpcmVjdGl2ZXNcbiAgICpcbiAgICogQHBhcmFtIGRpciBUaGUgYEZvcm1Db250cm9sTmFtZWAgZGlyZWN0aXZlIGluc3RhbmNlLlxuICAgKi9cbiAgcmVtb3ZlQ29udHJvbChkaXI6IEZvcm1Db250cm9sTmFtZSk6IHZvaWQge1xuICAgIGNsZWFuVXBDb250cm9sKGRpci5jb250cm9sIHx8IG51bGwsIGRpciwgLyogdmFsaWRhdGVDb250cm9sUHJlc2VuY2VPbkNoYW5nZSAqLyBmYWxzZSk7XG4gICAgcmVtb3ZlTGlzdEl0ZW0odGhpcy5kaXJlY3RpdmVzLCBkaXIpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgYSBuZXcgYEZvcm1Hcm91cE5hbWVgIGRpcmVjdGl2ZSBpbnN0YW5jZSB0byB0aGUgZm9ybS5cbiAgICpcbiAgICogQHBhcmFtIGRpciBUaGUgYEZvcm1Hcm91cE5hbWVgIGRpcmVjdGl2ZSBpbnN0YW5jZS5cbiAgICovXG4gIGFkZEZvcm1Hcm91cChkaXI6IEZvcm1Hcm91cE5hbWUpOiB2b2lkIHtcbiAgICB0aGlzLl9zZXRVcEZvcm1Db250YWluZXIoZGlyKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQZXJmb3JtcyB0aGUgbmVjZXNzYXJ5IGNsZWFudXAgd2hlbiBhIGBGb3JtR3JvdXBOYW1lYCBkaXJlY3RpdmUgaW5zdGFuY2UgaXMgcmVtb3ZlZCBmcm9tIHRoZVxuICAgKiB2aWV3LlxuICAgKlxuICAgKiBAcGFyYW0gZGlyIFRoZSBgRm9ybUdyb3VwTmFtZWAgZGlyZWN0aXZlIGluc3RhbmNlLlxuICAgKi9cbiAgcmVtb3ZlRm9ybUdyb3VwKGRpcjogRm9ybUdyb3VwTmFtZSk6IHZvaWQge1xuICAgIHRoaXMuX2NsZWFuVXBGb3JtQ29udGFpbmVyKGRpcik7XG4gIH1cblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIFJldHJpZXZlcyB0aGUgYEZvcm1Hcm91cGAgZm9yIGEgcHJvdmlkZWQgYEZvcm1Hcm91cE5hbWVgIGRpcmVjdGl2ZSBpbnN0YW5jZVxuICAgKlxuICAgKiBAcGFyYW0gZGlyIFRoZSBgRm9ybUdyb3VwTmFtZWAgZGlyZWN0aXZlIGluc3RhbmNlLlxuICAgKi9cbiAgZ2V0Rm9ybUdyb3VwKGRpcjogRm9ybUdyb3VwTmFtZSk6IEZvcm1Hcm91cCB7XG4gICAgcmV0dXJuIDxGb3JtR3JvdXA+dGhpcy5mb3JtLmdldChkaXIucGF0aCk7XG4gIH1cblxuICAvKipcbiAgICogUGVyZm9ybXMgdGhlIG5lY2Vzc2FyeSBzZXR1cCB3aGVuIGEgYEZvcm1BcnJheU5hbWVgIGRpcmVjdGl2ZSBpbnN0YW5jZSBpcyBhZGRlZCB0byB0aGUgdmlldy5cbiAgICpcbiAgICogQHBhcmFtIGRpciBUaGUgYEZvcm1BcnJheU5hbWVgIGRpcmVjdGl2ZSBpbnN0YW5jZS5cbiAgICovXG4gIGFkZEZvcm1BcnJheShkaXI6IEZvcm1BcnJheU5hbWUpOiB2b2lkIHtcbiAgICB0aGlzLl9zZXRVcEZvcm1Db250YWluZXIoZGlyKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQZXJmb3JtcyB0aGUgbmVjZXNzYXJ5IGNsZWFudXAgd2hlbiBhIGBGb3JtQXJyYXlOYW1lYCBkaXJlY3RpdmUgaW5zdGFuY2UgaXMgcmVtb3ZlZCBmcm9tIHRoZVxuICAgKiB2aWV3LlxuICAgKlxuICAgKiBAcGFyYW0gZGlyIFRoZSBgRm9ybUFycmF5TmFtZWAgZGlyZWN0aXZlIGluc3RhbmNlLlxuICAgKi9cbiAgcmVtb3ZlRm9ybUFycmF5KGRpcjogRm9ybUFycmF5TmFtZSk6IHZvaWQge1xuICAgIHRoaXMuX2NsZWFuVXBGb3JtQ29udGFpbmVyKGRpcik7XG4gIH1cblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIFJldHJpZXZlcyB0aGUgYEZvcm1BcnJheWAgZm9yIGEgcHJvdmlkZWQgYEZvcm1BcnJheU5hbWVgIGRpcmVjdGl2ZSBpbnN0YW5jZS5cbiAgICpcbiAgICogQHBhcmFtIGRpciBUaGUgYEZvcm1BcnJheU5hbWVgIGRpcmVjdGl2ZSBpbnN0YW5jZS5cbiAgICovXG4gIGdldEZvcm1BcnJheShkaXI6IEZvcm1BcnJheU5hbWUpOiBGb3JtQXJyYXkge1xuICAgIHJldHVybiA8Rm9ybUFycmF5PnRoaXMuZm9ybS5nZXQoZGlyLnBhdGgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIG5ldyB2YWx1ZSBmb3IgdGhlIHByb3ZpZGVkIGBGb3JtQ29udHJvbE5hbWVgIGRpcmVjdGl2ZS5cbiAgICpcbiAgICogQHBhcmFtIGRpciBUaGUgYEZvcm1Db250cm9sTmFtZWAgZGlyZWN0aXZlIGluc3RhbmNlLlxuICAgKiBAcGFyYW0gdmFsdWUgVGhlIG5ldyB2YWx1ZSBmb3IgdGhlIGRpcmVjdGl2ZSdzIGNvbnRyb2wuXG4gICAqL1xuICB1cGRhdGVNb2RlbChkaXI6IEZvcm1Db250cm9sTmFtZSwgdmFsdWU6IGFueSk6IHZvaWQge1xuICAgIGNvbnN0IGN0cmwgPSA8Rm9ybUNvbnRyb2w+dGhpcy5mb3JtLmdldChkaXIucGF0aCk7XG4gICAgY3RybC5zZXRWYWx1ZSh2YWx1ZSk7XG4gIH1cblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIE1ldGhvZCBjYWxsZWQgd2l0aCB0aGUgXCJzdWJtaXRcIiBldmVudCBpcyB0cmlnZ2VyZWQgb24gdGhlIGZvcm0uXG4gICAqIFRyaWdnZXJzIHRoZSBgbmdTdWJtaXRgIGVtaXR0ZXIgdG8gZW1pdCB0aGUgXCJzdWJtaXRcIiBldmVudCBhcyBpdHMgcGF5bG9hZC5cbiAgICpcbiAgICogQHBhcmFtICRldmVudCBUaGUgXCJzdWJtaXRcIiBldmVudCBvYmplY3RcbiAgICovXG4gIG9uU3VibWl0KCRldmVudDogRXZlbnQpOiBib29sZWFuIHtcbiAgICB0aGlzLl9zdWJtaXR0ZWRSZWFjdGl2ZS5zZXQodHJ1ZSk7XG4gICAgc3luY1BlbmRpbmdDb250cm9scyh0aGlzLmZvcm0sIHRoaXMuZGlyZWN0aXZlcyk7XG4gICAgdGhpcy5uZ1N1Ym1pdC5lbWl0KCRldmVudCk7XG4gICAgdGhpcy5mb3JtLl9ldmVudHMubmV4dChuZXcgRm9ybVN1Ym1pdHRlZEV2ZW50KHRoaXMuY29udHJvbCkpO1xuXG4gICAgLy8gRm9ybXMgd2l0aCBgbWV0aG9kPVwiZGlhbG9nXCJgIGhhdmUgc29tZSBzcGVjaWFsIGJlaGF2aW9yIHRoYXQgd29uJ3QgcmVsb2FkIHRoZSBwYWdlIGFuZCB0aGF0XG4gICAgLy8gc2hvdWxkbid0IGJlIHByZXZlbnRlZC4gTm90ZSB0aGF0IHdlIG5lZWQgdG8gbnVsbCBjaGVjayB0aGUgYGV2ZW50YCBhbmQgdGhlIGB0YXJnZXRgLCBiZWNhdXNlXG4gICAgLy8gc29tZSBpbnRlcm5hbCBhcHBzIGNhbGwgdGhpcyBtZXRob2QgZGlyZWN0bHkgd2l0aCB0aGUgd3JvbmcgYXJndW1lbnRzLlxuICAgIHJldHVybiAoJGV2ZW50Py50YXJnZXQgYXMgSFRNTEZvcm1FbGVtZW50IHwgbnVsbCk/Lm1ldGhvZCA9PT0gJ2RpYWxvZyc7XG4gIH1cblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIE1ldGhvZCBjYWxsZWQgd2hlbiB0aGUgXCJyZXNldFwiIGV2ZW50IGlzIHRyaWdnZXJlZCBvbiB0aGUgZm9ybS5cbiAgICovXG4gIG9uUmVzZXQoKTogdm9pZCB7XG4gICAgdGhpcy5yZXNldEZvcm0oKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogUmVzZXRzIHRoZSBmb3JtIHRvIGFuIGluaXRpYWwgdmFsdWUgYW5kIHJlc2V0cyBpdHMgc3VibWl0dGVkIHN0YXR1cy5cbiAgICpcbiAgICogQHBhcmFtIHZhbHVlIFRoZSBuZXcgdmFsdWUgZm9yIHRoZSBmb3JtLlxuICAgKi9cbiAgcmVzZXRGb3JtKHZhbHVlOiBhbnkgPSB1bmRlZmluZWQpOiB2b2lkIHtcbiAgICB0aGlzLmZvcm0ucmVzZXQodmFsdWUpO1xuICAgIHRoaXMuX3N1Ym1pdHRlZFJlYWN0aXZlLnNldChmYWxzZSk7XG4gICAgdGhpcy5mb3JtLl9ldmVudHMubmV4dChuZXcgRm9ybVJlc2V0RXZlbnQodGhpcy5mb3JtKSk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF91cGRhdGVEb21WYWx1ZSgpIHtcbiAgICB0aGlzLmRpcmVjdGl2ZXMuZm9yRWFjaCgoZGlyKSA9PiB7XG4gICAgICBjb25zdCBvbGRDdHJsID0gZGlyLmNvbnRyb2w7XG4gICAgICBjb25zdCBuZXdDdHJsID0gdGhpcy5mb3JtLmdldChkaXIucGF0aCk7XG4gICAgICBpZiAob2xkQ3RybCAhPT0gbmV3Q3RybCkge1xuICAgICAgICAvLyBOb3RlOiB0aGUgdmFsdWUgb2YgdGhlIGBkaXIuY29udHJvbGAgbWF5IG5vdCBiZSBkZWZpbmVkLCBmb3IgZXhhbXBsZSB3aGVuIGl0J3MgYSBmaXJzdFxuICAgICAgICAvLyBgRm9ybUNvbnRyb2xgIHRoYXQgaXMgYWRkZWQgdG8gYSBgRm9ybUdyb3VwYCBpbnN0YW5jZSAodmlhIGBhZGRDb250cm9sYCBjYWxsKS5cbiAgICAgICAgY2xlYW5VcENvbnRyb2wob2xkQ3RybCB8fCBudWxsLCBkaXIpO1xuXG4gICAgICAgIC8vIENoZWNrIHdoZXRoZXIgbmV3IGNvbnRyb2wgYXQgdGhlIHNhbWUgbG9jYXRpb24gaW5zaWRlIHRoZSBjb3JyZXNwb25kaW5nIGBGb3JtR3JvdXBgIGlzIGFuXG4gICAgICAgIC8vIGluc3RhbmNlIG9mIGBGb3JtQ29udHJvbGAgYW5kIHBlcmZvcm0gY29udHJvbCBzZXR1cCBvbmx5IGlmIHRoYXQncyB0aGUgY2FzZS5cbiAgICAgICAgLy8gTm90ZTogd2UgZG9uJ3QgbmVlZCB0byBjbGVhciB0aGUgbGlzdCBvZiBkaXJlY3RpdmVzIChgdGhpcy5kaXJlY3RpdmVzYCkgaGVyZSwgaXQgd291bGQgYmVcbiAgICAgICAgLy8gdGFrZW4gY2FyZSBvZiBpbiB0aGUgYHJlbW92ZUNvbnRyb2xgIG1ldGhvZCBpbnZva2VkIHdoZW4gY29ycmVzcG9uZGluZyBgZm9ybUNvbnRyb2xOYW1lYFxuICAgICAgICAvLyBkaXJlY3RpdmUgaW5zdGFuY2UgaXMgYmVpbmcgcmVtb3ZlZCAoaW52b2tlZCBmcm9tIGBGb3JtQ29udHJvbE5hbWUubmdPbkRlc3Ryb3lgKS5cbiAgICAgICAgaWYgKGlzRm9ybUNvbnRyb2wobmV3Q3RybCkpIHtcbiAgICAgICAgICBzZXRVcENvbnRyb2wobmV3Q3RybCwgZGlyLCB0aGlzLmNhbGxTZXREaXNhYmxlZFN0YXRlKTtcbiAgICAgICAgICAoZGlyIGFzIFdyaXRhYmxlPEZvcm1Db250cm9sTmFtZT4pLmNvbnRyb2wgPSBuZXdDdHJsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLmZvcm0uX3VwZGF0ZVRyZWVWYWxpZGl0eSh7ZW1pdEV2ZW50OiBmYWxzZX0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfc2V0VXBGb3JtQ29udGFpbmVyKGRpcjogRm9ybUFycmF5TmFtZSB8IEZvcm1Hcm91cE5hbWUpOiB2b2lkIHtcbiAgICBjb25zdCBjdHJsOiBhbnkgPSB0aGlzLmZvcm0uZ2V0KGRpci5wYXRoKTtcbiAgICBzZXRVcEZvcm1Db250YWluZXIoY3RybCwgZGlyKTtcbiAgICAvLyBOT1RFOiB0aGlzIG9wZXJhdGlvbiBsb29rcyB1bm5lY2Vzc2FyeSBpbiBjYXNlIG5vIG5ldyB2YWxpZGF0b3JzIHdlcmUgYWRkZWQgaW5cbiAgICAvLyBgc2V0VXBGb3JtQ29udGFpbmVyYCBjYWxsLiBDb25zaWRlciB1cGRhdGluZyB0aGlzIGNvZGUgdG8gbWF0Y2ggdGhlIGxvZ2ljIGluXG4gICAgLy8gYF9jbGVhblVwRm9ybUNvbnRhaW5lcmAgZnVuY3Rpb24uXG4gICAgY3RybC51cGRhdGVWYWx1ZUFuZFZhbGlkaXR5KHtlbWl0RXZlbnQ6IGZhbHNlfSk7XG4gIH1cblxuICBwcml2YXRlIF9jbGVhblVwRm9ybUNvbnRhaW5lcihkaXI6IEZvcm1BcnJheU5hbWUgfCBGb3JtR3JvdXBOYW1lKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuZm9ybSkge1xuICAgICAgY29uc3QgY3RybDogYW55ID0gdGhpcy5mb3JtLmdldChkaXIucGF0aCk7XG4gICAgICBpZiAoY3RybCkge1xuICAgICAgICBjb25zdCBpc0NvbnRyb2xVcGRhdGVkID0gY2xlYW5VcEZvcm1Db250YWluZXIoY3RybCwgZGlyKTtcbiAgICAgICAgaWYgKGlzQ29udHJvbFVwZGF0ZWQpIHtcbiAgICAgICAgICAvLyBSdW4gdmFsaWRpdHkgY2hlY2sgb25seSBpbiBjYXNlIGEgY29udHJvbCB3YXMgdXBkYXRlZCAoaS5lLiB2aWV3IHZhbGlkYXRvcnMgd2VyZVxuICAgICAgICAgIC8vIHJlbW92ZWQpIGFzIHJlbW92aW5nIHZpZXcgdmFsaWRhdG9ycyBtaWdodCBjYXVzZSB2YWxpZGl0eSB0byBjaGFuZ2UuXG4gICAgICAgICAgY3RybC51cGRhdGVWYWx1ZUFuZFZhbGlkaXR5KHtlbWl0RXZlbnQ6IGZhbHNlfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF91cGRhdGVSZWdpc3RyYXRpb25zKCkge1xuICAgIHRoaXMuZm9ybS5fcmVnaXN0ZXJPbkNvbGxlY3Rpb25DaGFuZ2UodGhpcy5fb25Db2xsZWN0aW9uQ2hhbmdlKTtcbiAgICBpZiAodGhpcy5fb2xkRm9ybSkge1xuICAgICAgdGhpcy5fb2xkRm9ybS5fcmVnaXN0ZXJPbkNvbGxlY3Rpb25DaGFuZ2UoKCkgPT4ge30pO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3VwZGF0ZVZhbGlkYXRvcnMoKSB7XG4gICAgc2V0VXBWYWxpZGF0b3JzKHRoaXMuZm9ybSwgdGhpcyk7XG4gICAgaWYgKHRoaXMuX29sZEZvcm0pIHtcbiAgICAgIGNsZWFuVXBWYWxpZGF0b3JzKHRoaXMuX29sZEZvcm0sIHRoaXMpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2NoZWNrRm9ybVByZXNlbnQoKSB7XG4gICAgaWYgKCF0aGlzLmZvcm0gJiYgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkpIHtcbiAgICAgIHRocm93IG1pc3NpbmdGb3JtRXhjZXB0aW9uKCk7XG4gICAgfVxuICB9XG59XG4iXX0=