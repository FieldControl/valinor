/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { ComponentHarness, HarnessPredicate, parallel } from '@angular/cdk/testing';
import { MatDatepickerInputHarness, MatDateRangeInputHarness, } from '@angular/material/datepicker/testing';
import { MatInputHarness } from '@angular/material/input/testing';
import { MatSelectHarness } from '@angular/material/select/testing';
export class _MatFormFieldHarnessBase extends ComponentHarness {
    /** Gets the label of the form-field. */
    getLabel() {
        return __awaiter(this, void 0, void 0, function* () {
            const labelEl = yield this._label();
            return labelEl ? labelEl.text() : null;
        });
    }
    /** Whether the form-field has errors. */
    hasErrors() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.getTextErrors()).length > 0;
        });
    }
    /** Whether the form-field is disabled. */
    isDisabled() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).hasClass('mat-form-field-disabled');
        });
    }
    /** Whether the form-field is currently autofilled. */
    isAutofilled() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).hasClass('mat-form-field-autofilled');
        });
    }
    // Implementation of the "getControl" method overload signatures.
    getControl(type) {
        return __awaiter(this, void 0, void 0, function* () {
            if (type) {
                return this.locatorForOptional(type)();
            }
            const [select, input, datepickerInput, dateRangeInput] = yield parallel(() => [
                this._selectControl(),
                this._inputControl(),
                this._datepickerInputControl(),
                this._dateRangeInputControl()
            ]);
            // Match the datepicker inputs first since they can also have a `MatInput`.
            return datepickerInput || dateRangeInput || select || input;
        });
    }
    /** Gets the theme color of the form-field. */
    getThemeColor() {
        return __awaiter(this, void 0, void 0, function* () {
            const hostEl = yield this.host();
            const [isAccent, isWarn] = yield parallel(() => {
                return [hostEl.hasClass('mat-accent'), hostEl.hasClass('mat-warn')];
            });
            if (isAccent) {
                return 'accent';
            }
            else if (isWarn) {
                return 'warn';
            }
            return 'primary';
        });
    }
    /** Gets error messages which are currently displayed in the form-field. */
    getTextErrors() {
        return __awaiter(this, void 0, void 0, function* () {
            const errors = yield this._errors();
            return parallel(() => errors.map(e => e.text()));
        });
    }
    /** Gets hint messages which are currently displayed in the form-field. */
    getTextHints() {
        return __awaiter(this, void 0, void 0, function* () {
            const hints = yield this._hints();
            return parallel(() => hints.map(e => e.text()));
        });
    }
    /**
     * Gets a reference to the container element which contains all projected
     * prefixes of the form-field.
     * @deprecated Use `getPrefixText` instead.
     * @breaking-change 11.0.0
     */
    getHarnessLoaderForPrefix() {
        return __awaiter(this, void 0, void 0, function* () {
            return this._prefixContainer();
        });
    }
    /** Gets the text inside the prefix element. */
    getPrefixText() {
        return __awaiter(this, void 0, void 0, function* () {
            const prefix = yield this._prefixContainer();
            return prefix ? prefix.text() : '';
        });
    }
    /**
     * Gets a reference to the container element which contains all projected
     * suffixes of the form-field.
     * @deprecated Use `getSuffixText` instead.
     * @breaking-change 11.0.0
     */
    getHarnessLoaderForSuffix() {
        return __awaiter(this, void 0, void 0, function* () {
            return this._suffixContainer();
        });
    }
    /** Gets the text inside the suffix element. */
    getSuffixText() {
        return __awaiter(this, void 0, void 0, function* () {
            const suffix = yield this._suffixContainer();
            return suffix ? suffix.text() : '';
        });
    }
    /**
     * Whether the form control has been touched. Returns "null"
     * if no form control is set up.
     */
    isControlTouched() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(yield this._hasFormControl())) {
                return null;
            }
            return (yield this.host()).hasClass('ng-touched');
        });
    }
    /**
     * Whether the form control is dirty. Returns "null"
     * if no form control is set up.
     */
    isControlDirty() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(yield this._hasFormControl())) {
                return null;
            }
            return (yield this.host()).hasClass('ng-dirty');
        });
    }
    /**
     * Whether the form control is valid. Returns "null"
     * if no form control is set up.
     */
    isControlValid() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(yield this._hasFormControl())) {
                return null;
            }
            return (yield this.host()).hasClass('ng-valid');
        });
    }
    /**
     * Whether the form control is pending validation. Returns "null"
     * if no form control is set up.
     */
    isControlPending() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(yield this._hasFormControl())) {
                return null;
            }
            return (yield this.host()).hasClass('ng-pending');
        });
    }
    /** Checks whether the form-field control has set up a form control. */
    _hasFormControl() {
        return __awaiter(this, void 0, void 0, function* () {
            const hostEl = yield this.host();
            // If no form "NgControl" is bound to the form-field control, the form-field
            // is not able to forward any control status classes. Therefore if either the
            // "ng-touched" or "ng-untouched" class is set, we know that it has a form control
            const [isTouched, isUntouched] = yield parallel(() => [hostEl.hasClass('ng-touched'), hostEl.hasClass('ng-untouched')]);
            return isTouched || isUntouched;
        });
    }
}
/** Harness for interacting with a standard Material form-field's in tests. */
export class MatFormFieldHarness extends _MatFormFieldHarnessBase {
    constructor() {
        super(...arguments);
        this._prefixContainer = this.locatorForOptional('.mat-form-field-prefix');
        this._suffixContainer = this.locatorForOptional('.mat-form-field-suffix');
        this._label = this.locatorForOptional('.mat-form-field-label');
        this._errors = this.locatorForAll('.mat-error');
        this._hints = this.locatorForAll('mat-hint, .mat-hint');
        this._inputControl = this.locatorForOptional(MatInputHarness);
        this._selectControl = this.locatorForOptional(MatSelectHarness);
        this._datepickerInputControl = this.locatorForOptional(MatDatepickerInputHarness);
        this._dateRangeInputControl = this.locatorForOptional(MatDateRangeInputHarness);
    }
    /**
     * Gets a `HarnessPredicate` that can be used to search for a `MatFormFieldHarness` that meets
     * certain criteria.
     * @param options Options for filtering which form field instances are considered a match.
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return new HarnessPredicate(MatFormFieldHarness, options)
            .addOption('floatingLabelText', options.floatingLabelText, (harness, text) => __awaiter(this, void 0, void 0, function* () { return HarnessPredicate.stringMatches(yield harness.getLabel(), text); }))
            .addOption('hasErrors', options.hasErrors, (harness, hasErrors) => __awaiter(this, void 0, void 0, function* () { return (yield harness.hasErrors()) === hasErrors; }));
    }
    /** Gets the appearance of the form-field. */
    getAppearance() {
        return __awaiter(this, void 0, void 0, function* () {
            const hostClasses = yield (yield this.host()).getAttribute('class');
            if (hostClasses !== null) {
                const appearanceMatch = hostClasses.match(/mat-form-field-appearance-(legacy|standard|fill|outline)(?:$| )/);
                if (appearanceMatch) {
                    return appearanceMatch[1];
                }
            }
            throw Error('Could not determine appearance of form-field.');
        });
    }
    /** Whether the form-field has a label. */
    hasLabel() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).hasClass('mat-form-field-has-label');
        });
    }
    /** Whether the label is currently floating. */
    isLabelFloating() {
        return __awaiter(this, void 0, void 0, function* () {
            const host = yield this.host();
            const [hasLabel, shouldFloat] = yield parallel(() => [
                this.hasLabel(),
                host.hasClass('mat-form-field-should-float'),
            ]);
            // If there is no label, the label conceptually can never float. The `should-float` class
            // is just always set regardless of whether the label is displayed or not.
            return hasLabel && shouldFloat;
        });
    }
}
MatFormFieldHarness.hostSelector = '.mat-form-field';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybS1maWVsZC1oYXJuZXNzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL2Zvcm0tZmllbGQvdGVzdGluZy9mb3JtLWZpZWxkLWhhcm5lc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUVILE9BQU8sRUFFTCxnQkFBZ0IsRUFFaEIsZ0JBQWdCLEVBRWhCLFFBQVEsRUFFVCxNQUFNLHNCQUFzQixDQUFDO0FBQzlCLE9BQU8sRUFDTCx5QkFBeUIsRUFDekIsd0JBQXdCLEdBQ3pCLE1BQU0sc0NBQXNDLENBQUM7QUFFOUMsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLGlDQUFpQyxDQUFDO0FBQ2hFLE9BQU8sRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLGtDQUFrQyxDQUFDO0FBUWxFLE1BQU0sT0FBZ0Isd0JBQ3BCLFNBQVEsZ0JBQWdCO0lBb0J4Qix3Q0FBd0M7SUFDbEMsUUFBUTs7WUFDWixNQUFNLE9BQU8sR0FBRyxNQUFNLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNwQyxPQUFPLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDekMsQ0FBQztLQUFBO0lBRUQseUNBQXlDO0lBQ25DLFNBQVM7O1lBQ2IsT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztRQUNqRCxDQUFDO0tBQUE7SUFFRCwwQ0FBMEM7SUFDcEMsVUFBVTs7WUFDZCxPQUFPLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMseUJBQXlCLENBQUMsQ0FBQztRQUNqRSxDQUFDO0tBQUE7SUFFRCxzREFBc0Q7SUFDaEQsWUFBWTs7WUFDaEIsT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxD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QUFRLENBQUMsNkJBQTZCLENBQUM7YUFDN0MsQ0FBQyxDQUFDO1lBQ0gseUZBQXlGO1lBQ3pGLDBFQUEwRTtZQUMxRSxPQUFPLFFBQVEsSUFBSSxXQUFXLENBQUM7UUFDakMsQ0FBQztLQUFBOztBQXRETSxnQ0FBWSxHQUFHLGlCQUFpQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7XG4gIEFzeW5jRmFjdG9yeUZuLFxuICBDb21wb25lbnRIYXJuZXNzLFxuICBDb21wb25lbnRIYXJuZXNzQ29uc3RydWN0b3IsXG4gIEhhcm5lc3NQcmVkaWNhdGUsXG4gIEhhcm5lc3NRdWVyeSxcbiAgcGFyYWxsZWwsXG4gIFRlc3RFbGVtZW50XG59IGZyb20gJ0Bhbmd1bGFyL2Nkay90ZXN0aW5nJztcbmltcG9ydCB7XG4gIE1hdERhdGVwaWNrZXJJbnB1dEhhcm5lc3MsXG4gIE1hdERhdGVSYW5nZUlucHV0SGFybmVzcyxcbn0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvZGF0ZXBpY2tlci90ZXN0aW5nJztcbmltcG9ydCB7TWF0Rm9ybUZpZWxkQ29udHJvbEhhcm5lc3N9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL2Zvcm0tZmllbGQvdGVzdGluZy9jb250cm9sJztcbmltcG9ydCB7TWF0SW5wdXRIYXJuZXNzfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9pbnB1dC90ZXN0aW5nJztcbmltcG9ydCB7TWF0U2VsZWN0SGFybmVzc30gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvc2VsZWN0L3Rlc3RpbmcnO1xuaW1wb3J0IHtGb3JtRmllbGRIYXJuZXNzRmlsdGVyc30gZnJvbSAnLi9mb3JtLWZpZWxkLWhhcm5lc3MtZmlsdGVycyc7XG5cbi8vIFRPRE8oZGV2dmVyc2lvbik6IHN1cHBvcnQgc3VwcG9ydCBjaGlwIGxpc3QgaGFybmVzc1xuLyoqIFBvc3NpYmxlIGhhcm5lc3NlcyBvZiBjb250cm9scyB3aGljaCBjYW4gYmUgYm91bmQgdG8gYSBmb3JtLWZpZWxkLiAqL1xuZXhwb3J0IHR5cGUgRm9ybUZpZWxkQ29udHJvbEhhcm5lc3MgPVxuICBNYXRJbnB1dEhhcm5lc3N8TWF0U2VsZWN0SGFybmVzc3xNYXREYXRlcGlja2VySW5wdXRIYXJuZXNzfE1hdERhdGVSYW5nZUlucHV0SGFybmVzcztcblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIF9NYXRGb3JtRmllbGRIYXJuZXNzQmFzZTxDb250cm9sSGFybmVzcyBleHRlbmRzIE1hdEZvcm1GaWVsZENvbnRyb2xIYXJuZXNzPlxuICBleHRlbmRzIENvbXBvbmVudEhhcm5lc3Mge1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgX3ByZWZpeENvbnRhaW5lcjogQXN5bmNGYWN0b3J5Rm48VGVzdEVsZW1lbnR8bnVsbD47XG4gIHByb3RlY3RlZCBhYnN0cmFjdCBfc3VmZml4Q29udGFpbmVyOiBBc3luY0ZhY3RvcnlGbjxUZXN0RWxlbWVudHxudWxsPjtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IF9sYWJlbDogQXN5bmNGYWN0b3J5Rm48VGVzdEVsZW1lbnR8bnVsbD47XG4gIHByb3RlY3RlZCBhYnN0cmFjdCBfZXJyb3JzOiBBc3luY0ZhY3RvcnlGbjxUZXN0RWxlbWVudFtdPjtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IF9oaW50czogQXN5bmNGYWN0b3J5Rm48VGVzdEVsZW1lbnRbXT47XG4gIHByb3RlY3RlZCBhYnN0cmFjdCBfaW5wdXRDb250cm9sOiBBc3luY0ZhY3RvcnlGbjxDb250cm9sSGFybmVzc3xudWxsPjtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IF9zZWxlY3RDb250cm9sOiBBc3luY0ZhY3RvcnlGbjxDb250cm9sSGFybmVzc3xudWxsPjtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IF9kYXRlcGlja2VySW5wdXRDb250cm9sOiBBc3luY0ZhY3RvcnlGbjxDb250cm9sSGFybmVzc3xudWxsPjtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IF9kYXRlUmFuZ2VJbnB1dENvbnRyb2w6IEFzeW5jRmFjdG9yeUZuPENvbnRyb2xIYXJuZXNzfG51bGw+O1xuXG4gIC8qKiBHZXRzIHRoZSBhcHBlYXJhbmNlIG9mIHRoZSBmb3JtLWZpZWxkLiAqL1xuICBhYnN0cmFjdCBnZXRBcHBlYXJhbmNlKCk6IFByb21pc2U8c3RyaW5nPjtcblxuICAvKiogV2hldGhlciB0aGUgbGFiZWwgaXMgY3VycmVudGx5IGZsb2F0aW5nLiAqL1xuICBhYnN0cmFjdCBpc0xhYmVsRmxvYXRpbmcoKTogUHJvbWlzZTxib29sZWFuPjtcblxuICAvKiogV2hldGhlciB0aGUgZm9ybS1maWVsZCBoYXMgYSBsYWJlbC4gKi9cbiAgYWJzdHJhY3QgaGFzTGFiZWwoKTogUHJvbWlzZTxib29sZWFuPjtcblxuICAvKiogR2V0cyB0aGUgbGFiZWwgb2YgdGhlIGZvcm0tZmllbGQuICovXG4gIGFzeW5jIGdldExhYmVsKCk6IFByb21pc2U8c3RyaW5nfG51bGw+IHtcbiAgICBjb25zdCBsYWJlbEVsID0gYXdhaXQgdGhpcy5fbGFiZWwoKTtcbiAgICByZXR1cm4gbGFiZWxFbCA/IGxhYmVsRWwudGV4dCgpIDogbnVsbDtcbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZSBmb3JtLWZpZWxkIGhhcyBlcnJvcnMuICovXG4gIGFzeW5jIGhhc0Vycm9ycygpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuZ2V0VGV4dEVycm9ycygpKS5sZW5ndGggPiAwO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGZvcm0tZmllbGQgaXMgZGlzYWJsZWQuICovXG4gIGFzeW5jIGlzRGlzYWJsZWQoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLmhvc3QoKSkuaGFzQ2xhc3MoJ21hdC1mb3JtLWZpZWxkLWRpc2FibGVkJyk7XG4gIH1cblxuICAvKiogV2hldGhlciB0aGUgZm9ybS1maWVsZCBpcyBjdXJyZW50bHkgYXV0b2ZpbGxlZC4gKi9cbiAgYXN5bmMgaXNBdXRvZmlsbGVkKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5ob3N0KCkpLmhhc0NsYXNzKCdtYXQtZm9ybS1maWVsZC1hdXRvZmlsbGVkJyk7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgaGFybmVzcyBvZiB0aGUgY29udHJvbCB0aGF0IGlzIGJvdW5kIHRvIHRoZSBmb3JtLWZpZWxkLiBPbmx5XG4gICAqIGRlZmF1bHQgY29udHJvbHMgc3VjaCBhcyBcIk1hdElucHV0SGFybmVzc1wiIGFuZCBcIk1hdFNlbGVjdEhhcm5lc3NcIiBhcmVcbiAgICogc3VwcG9ydGVkLlxuICAgKi9cbiAgYXN5bmMgZ2V0Q29udHJvbCgpOiBQcm9taXNlPENvbnRyb2xIYXJuZXNzfG51bGw+O1xuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBoYXJuZXNzIG9mIHRoZSBjb250cm9sIHRoYXQgaXMgYm91bmQgdG8gdGhlIGZvcm0tZmllbGQuIFNlYXJjaGVzXG4gICAqIGZvciBhIGNvbnRyb2wgdGhhdCBtYXRjaGVzIHRoZSBzcGVjaWZpZWQgaGFybmVzcyB0eXBlLlxuICAgKi9cbiAgYXN5bmMgZ2V0Q29udHJvbDxYIGV4dGVuZHMgTWF0Rm9ybUZpZWxkQ29udHJvbEhhcm5lc3M+KHR5cGU6IENvbXBvbmVudEhhcm5lc3NDb25zdHJ1Y3RvcjxYPik6XG4gICAgICBQcm9taXNlPFh8bnVsbD47XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIGhhcm5lc3Mgb2YgdGhlIGNvbnRyb2wgdGhhdCBpcyBib3VuZCB0byB0aGUgZm9ybS1maWVsZC4gU2VhcmNoZXNcbiAgICogZm9yIGEgY29udHJvbCB0aGF0IG1hdGNoZXMgdGhlIHNwZWNpZmllZCBoYXJuZXNzIHByZWRpY2F0ZS5cbiAgICovXG4gIGFzeW5jIGdldENvbnRyb2w8WCBleHRlbmRzIE1hdEZvcm1GaWVsZENvbnRyb2xIYXJuZXNzPih0eXBlOiBIYXJuZXNzUHJlZGljYXRlPFg+KTpcbiAgICAgIFByb21pc2U8WHxudWxsPjtcblxuICAvLyBJbXBsZW1lbnRhdGlvbiBvZiB0aGUgXCJnZXRDb250cm9sXCIgbWV0aG9kIG92ZXJsb2FkIHNpZ25hdHVyZXMuXG4gIGFzeW5jIGdldENvbnRyb2w8WCBleHRlbmRzIE1hdEZvcm1GaWVsZENvbnRyb2xIYXJuZXNzPih0eXBlPzogSGFybmVzc1F1ZXJ5PFg+KSB7XG4gICAgaWYgKHR5cGUpIHtcbiAgICAgIHJldHVybiB0aGlzLmxvY2F0b3JGb3JPcHRpb25hbCh0eXBlKSgpO1xuICAgIH1cbiAgICBjb25zdCBbc2VsZWN0LCBpbnB1dCwgZGF0ZXBpY2tlcklucHV0LCBkYXRlUmFuZ2VJbnB1dF0gPSBhd2FpdCBwYXJhbGxlbCgoKSA9PiBbXG4gICAgICB0aGlzLl9zZWxlY3RDb250cm9sKCksXG4gICAgICB0aGlzLl9pbnB1dENvbnRyb2woKSxcbiAgICAgIHRoaXMuX2RhdGVwaWNrZXJJbnB1dENvbnRyb2woKSxcbiAgICAgIHRoaXMuX2RhdGVSYW5nZUlucHV0Q29udHJvbCgpXG4gICAgXSk7XG5cbiAgICAvLyBNYXRjaCB0aGUgZGF0ZXBpY2tlciBpbnB1dHMgZmlyc3Qgc2luY2UgdGhleSBjYW4gYWxzbyBoYXZlIGEgYE1hdElucHV0YC5cbiAgICByZXR1cm4gZGF0ZXBpY2tlcklucHV0IHx8IGRhdGVSYW5nZUlucHV0IHx8IHNlbGVjdCB8fCBpbnB1dDtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSB0aGVtZSBjb2xvciBvZiB0aGUgZm9ybS1maWVsZC4gKi9cbiAgYXN5bmMgZ2V0VGhlbWVDb2xvcigpOiBQcm9taXNlPCdwcmltYXJ5J3wnYWNjZW50J3wnd2Fybic+IHtcbiAgICBjb25zdCBob3N0RWwgPSBhd2FpdCB0aGlzLmhvc3QoKTtcbiAgICBjb25zdCBbaXNBY2NlbnQsIGlzV2Fybl0gPSBhd2FpdCBwYXJhbGxlbCgoKSA9PiB7XG4gICAgICByZXR1cm4gW2hvc3RFbC5oYXNDbGFzcygnbWF0LWFjY2VudCcpLCBob3N0RWwuaGFzQ2xhc3MoJ21hdC13YXJuJyldO1xuICAgIH0pO1xuICAgIGlmIChpc0FjY2VudCkge1xuICAgICAgcmV0dXJuICdhY2NlbnQnO1xuICAgIH0gZWxzZSBpZiAoaXNXYXJuKSB7XG4gICAgICByZXR1cm4gJ3dhcm4nO1xuICAgIH1cbiAgICByZXR1cm4gJ3ByaW1hcnknO1xuICB9XG5cbiAgLyoqIEdldHMgZXJyb3IgbWVzc2FnZXMgd2hpY2ggYXJlIGN1cnJlbnRseSBkaXNwbGF5ZWQgaW4gdGhlIGZvcm0tZmllbGQuICovXG4gIGFzeW5jIGdldFRleHRFcnJvcnMoKTogUHJvbWlzZTxzdHJpbmdbXT4ge1xuICAgIGNvbnN0IGVycm9ycyA9IGF3YWl0IHRoaXMuX2Vycm9ycygpO1xuICAgIHJldHVybiBwYXJhbGxlbCgoKSA9PiBlcnJvcnMubWFwKGUgPT4gZS50ZXh0KCkpKTtcbiAgfVxuXG4gIC8qKiBHZXRzIGhpbnQgbWVzc2FnZXMgd2hpY2ggYXJlIGN1cnJlbnRseSBkaXNwbGF5ZWQgaW4gdGhlIGZvcm0tZmllbGQuICovXG4gIGFzeW5jIGdldFRleHRIaW50cygpOiBQcm9taXNlPHN0cmluZ1tdPiB7XG4gICAgY29uc3QgaGludHMgPSBhd2FpdCB0aGlzLl9oaW50cygpO1xuICAgIHJldHVybiBwYXJhbGxlbCgoKSA9PiBoaW50cy5tYXAoZSA9PiBlLnRleHQoKSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgYSByZWZlcmVuY2UgdG8gdGhlIGNvbnRhaW5lciBlbGVtZW50IHdoaWNoIGNvbnRhaW5zIGFsbCBwcm9qZWN0ZWRcbiAgICogcHJlZml4ZXMgb2YgdGhlIGZvcm0tZmllbGQuXG4gICAqIEBkZXByZWNhdGVkIFVzZSBgZ2V0UHJlZml4VGV4dGAgaW5zdGVhZC5cbiAgICogQGJyZWFraW5nLWNoYW5nZSAxMS4wLjBcbiAgICovXG4gIGFzeW5jIGdldEhhcm5lc3NMb2FkZXJGb3JQcmVmaXgoKTogUHJvbWlzZTxUZXN0RWxlbWVudHxudWxsPiB7XG4gICAgcmV0dXJuIHRoaXMuX3ByZWZpeENvbnRhaW5lcigpO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIHRleHQgaW5zaWRlIHRoZSBwcmVmaXggZWxlbWVudC4gKi9cbiAgYXN5bmMgZ2V0UHJlZml4VGV4dCgpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGNvbnN0IHByZWZpeCA9IGF3YWl0IHRoaXMuX3ByZWZpeENvbnRhaW5lcigpO1xuICAgIHJldHVybiBwcmVmaXggPyBwcmVmaXgudGV4dCgpIDogJyc7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyBhIHJlZmVyZW5jZSB0byB0aGUgY29udGFpbmVyIGVsZW1lbnQgd2hpY2ggY29udGFpbnMgYWxsIHByb2plY3RlZFxuICAgKiBzdWZmaXhlcyBvZiB0aGUgZm9ybS1maWVsZC5cbiAgICogQGRlcHJlY2F0ZWQgVXNlIGBnZXRTdWZmaXhUZXh0YCBpbnN0ZWFkLlxuICAgKiBAYnJlYWtpbmctY2hhbmdlIDExLjAuMFxuICAgKi9cbiAgYXN5bmMgZ2V0SGFybmVzc0xvYWRlckZvclN1ZmZpeCgpOiBQcm9taXNlPFRlc3RFbGVtZW50fG51bGw+IHtcbiAgICByZXR1cm4gdGhpcy5fc3VmZml4Q29udGFpbmVyKCk7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgdGV4dCBpbnNpZGUgdGhlIHN1ZmZpeCBlbGVtZW50LiAqL1xuICBhc3luYyBnZXRTdWZmaXhUZXh0KCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgY29uc3Qgc3VmZml4ID0gYXdhaXQgdGhpcy5fc3VmZml4Q29udGFpbmVyKCk7XG4gICAgcmV0dXJuIHN1ZmZpeCA/IHN1ZmZpeC50ZXh0KCkgOiAnJztcbiAgfVxuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoZSBmb3JtIGNvbnRyb2wgaGFzIGJlZW4gdG91Y2hlZC4gUmV0dXJucyBcIm51bGxcIlxuICAgKiBpZiBubyBmb3JtIGNvbnRyb2wgaXMgc2V0IHVwLlxuICAgKi9cbiAgYXN5bmMgaXNDb250cm9sVG91Y2hlZCgpOiBQcm9taXNlPGJvb2xlYW58bnVsbD4ge1xuICAgIGlmICghYXdhaXQgdGhpcy5faGFzRm9ybUNvbnRyb2woKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiAoYXdhaXQgdGhpcy5ob3N0KCkpLmhhc0NsYXNzKCduZy10b3VjaGVkJyk7XG4gIH1cblxuICAvKipcbiAgICogV2hldGhlciB0aGUgZm9ybSBjb250cm9sIGlzIGRpcnR5LiBSZXR1cm5zIFwibnVsbFwiXG4gICAqIGlmIG5vIGZvcm0gY29udHJvbCBpcyBzZXQgdXAuXG4gICAqL1xuICBhc3luYyBpc0NvbnRyb2xEaXJ0eSgpOiBQcm9taXNlPGJvb2xlYW58bnVsbD4ge1xuICAgIGlmICghYXdhaXQgdGhpcy5faGFzRm9ybUNvbnRyb2woKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiAoYXdhaXQgdGhpcy5ob3N0KCkpLmhhc0NsYXNzKCduZy1kaXJ0eScpO1xuICB9XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlIGZvcm0gY29udHJvbCBpcyB2YWxpZC4gUmV0dXJucyBcIm51bGxcIlxuICAgKiBpZiBubyBmb3JtIGNvbnRyb2wgaXMgc2V0IHVwLlxuICAgKi9cbiAgYXN5bmMgaXNDb250cm9sVmFsaWQoKTogUHJvbWlzZTxib29sZWFufG51bGw+IHtcbiAgICBpZiAoIWF3YWl0IHRoaXMuX2hhc0Zvcm1Db250cm9sKCkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuaG9zdCgpKS5oYXNDbGFzcygnbmctdmFsaWQnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoZSBmb3JtIGNvbnRyb2wgaXMgcGVuZGluZyB2YWxpZGF0aW9uLiBSZXR1cm5zIFwibnVsbFwiXG4gICAqIGlmIG5vIGZvcm0gY29udHJvbCBpcyBzZXQgdXAuXG4gICAqL1xuICBhc3luYyBpc0NvbnRyb2xQZW5kaW5nKCk6IFByb21pc2U8Ym9vbGVhbnxudWxsPiB7XG4gICAgaWYgKCFhd2FpdCB0aGlzLl9oYXNGb3JtQ29udHJvbCgpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLmhvc3QoKSkuaGFzQ2xhc3MoJ25nLXBlbmRpbmcnKTtcbiAgfVxuXG4gIC8qKiBDaGVja3Mgd2hldGhlciB0aGUgZm9ybS1maWVsZCBjb250cm9sIGhhcyBzZXQgdXAgYSBmb3JtIGNvbnRyb2wuICovXG4gIHByaXZhdGUgYXN5bmMgX2hhc0Zvcm1Db250cm9sKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IGhvc3RFbCA9IGF3YWl0IHRoaXMuaG9zdCgpO1xuICAgIC8vIElmIG5vIGZvcm0gXCJOZ0NvbnRyb2xcIiBpcyBib3VuZCB0byB0aGUgZm9ybS1maWVsZCBjb250cm9sLCB0aGUgZm9ybS1maWVsZFxuICAgIC8vIGlzIG5vdCBhYmxlIHRvIGZvcndhcmQgYW55IGNvbnRyb2wgc3RhdHVzIGNsYXNzZXMuIFRoZXJlZm9yZSBpZiBlaXRoZXIgdGhlXG4gICAgLy8gXCJuZy10b3VjaGVkXCIgb3IgXCJuZy11bnRvdWNoZWRcIiBjbGFzcyBpcyBzZXQsIHdlIGtub3cgdGhhdCBpdCBoYXMgYSBmb3JtIGNvbnRyb2xcbiAgICBjb25zdCBbaXNUb3VjaGVkLCBpc1VudG91Y2hlZF0gPVxuICAgICAgICBhd2FpdCBwYXJhbGxlbCgoKSA9PiBbaG9zdEVsLmhhc0NsYXNzKCduZy10b3VjaGVkJyksIGhvc3RFbC5oYXNDbGFzcygnbmctdW50b3VjaGVkJyldKTtcbiAgICByZXR1cm4gaXNUb3VjaGVkIHx8IGlzVW50b3VjaGVkO1xuICB9XG59XG5cbi8qKiBIYXJuZXNzIGZvciBpbnRlcmFjdGluZyB3aXRoIGEgc3RhbmRhcmQgTWF0ZXJpYWwgZm9ybS1maWVsZCdzIGluIHRlc3RzLiAqL1xuZXhwb3J0IGNsYXNzIE1hdEZvcm1GaWVsZEhhcm5lc3MgZXh0ZW5kcyBfTWF0Rm9ybUZpZWxkSGFybmVzc0Jhc2U8Rm9ybUZpZWxkQ29udHJvbEhhcm5lc3M+IHtcbiAgc3RhdGljIGhvc3RTZWxlY3RvciA9ICcubWF0LWZvcm0tZmllbGQnO1xuXG4gIC8qKlxuICAgKiBHZXRzIGEgYEhhcm5lc3NQcmVkaWNhdGVgIHRoYXQgY2FuIGJlIHVzZWQgdG8gc2VhcmNoIGZvciBhIGBNYXRGb3JtRmllbGRIYXJuZXNzYCB0aGF0IG1lZXRzXG4gICAqIGNlcnRhaW4gY3JpdGVyaWEuXG4gICAqIEBwYXJhbSBvcHRpb25zIE9wdGlvbnMgZm9yIGZpbHRlcmluZyB3aGljaCBmb3JtIGZpZWxkIGluc3RhbmNlcyBhcmUgY29uc2lkZXJlZCBhIG1hdGNoLlxuICAgKiBAcmV0dXJuIGEgYEhhcm5lc3NQcmVkaWNhdGVgIGNvbmZpZ3VyZWQgd2l0aCB0aGUgZ2l2ZW4gb3B0aW9ucy5cbiAgICovXG4gIHN0YXRpYyB3aXRoKG9wdGlvbnM6IEZvcm1GaWVsZEhhcm5lc3NGaWx0ZXJzID0ge30pOiBIYXJuZXNzUHJlZGljYXRlPE1hdEZvcm1GaWVsZEhhcm5lc3M+IHtcbiAgICByZXR1cm4gbmV3IEhhcm5lc3NQcmVkaWNhdGUoTWF0Rm9ybUZpZWxkSGFybmVzcywgb3B0aW9ucylcbiAgICAgIC5hZGRPcHRpb24oJ2Zsb2F0aW5nTGFiZWxUZXh0Jywgb3B0aW9ucy5mbG9hdGluZ0xhYmVsVGV4dCwgYXN5bmMgKGhhcm5lc3MsIHRleHQpID0+XG4gICAgICAgICAgSGFybmVzc1ByZWRpY2F0ZS5zdHJpbmdNYXRjaGVzKGF3YWl0IGhhcm5lc3MuZ2V0TGFiZWwoKSwgdGV4dCkpXG4gICAgICAuYWRkT3B0aW9uKCdoYXNFcnJvcnMnLCBvcHRpb25zLmhhc0Vycm9ycywgYXN5bmMgKGhhcm5lc3MsIGhhc0Vycm9ycykgPT5cbiAgICAgICAgICBhd2FpdCBoYXJuZXNzLmhhc0Vycm9ycygpID09PSBoYXNFcnJvcnMpO1xuICB9XG5cbiAgcHJvdGVjdGVkIF9wcmVmaXhDb250YWluZXIgPSB0aGlzLmxvY2F0b3JGb3JPcHRpb25hbCgnLm1hdC1mb3JtLWZpZWxkLXByZWZpeCcpO1xuICBwcm90ZWN0ZWQgX3N1ZmZpeENvbnRhaW5lciA9IHRoaXMubG9jYXRvckZvck9wdGlvbmFsKCcubWF0LWZvcm0tZmllbGQtc3VmZml4Jyk7XG4gIHByb3RlY3RlZCBfbGFiZWwgPSB0aGlzLmxvY2F0b3JGb3JPcHRpb25hbCgnLm1hdC1mb3JtLWZpZWxkLWxhYmVsJyk7XG4gIHByb3RlY3RlZCBfZXJyb3JzID0gdGhpcy5sb2NhdG9yRm9yQWxsKCcubWF0LWVycm9yJyk7XG4gIHByb3RlY3RlZCBfaGludHMgPSB0aGlzLmxvY2F0b3JGb3JBbGwoJ21hdC1oaW50LCAubWF0LWhpbnQnKTtcbiAgcHJvdGVjdGVkIF9pbnB1dENvbnRyb2wgPSB0aGlzLmxvY2F0b3JGb3JPcHRpb25hbChNYXRJbnB1dEhhcm5lc3MpO1xuICBwcm90ZWN0ZWQgX3NlbGVjdENvbnRyb2wgPSB0aGlzLmxvY2F0b3JGb3JPcHRpb25hbChNYXRTZWxlY3RIYXJuZXNzKTtcbiAgcHJvdGVjdGVkIF9kYXRlcGlja2VySW5wdXRDb250cm9sID0gdGhpcy5sb2NhdG9yRm9yT3B0aW9uYWwoTWF0RGF0ZXBpY2tlcklucHV0SGFybmVzcyk7XG4gIHByb3RlY3RlZCBfZGF0ZVJhbmdlSW5wdXRDb250cm9sID0gdGhpcy5sb2NhdG9yRm9yT3B0aW9uYWwoTWF0RGF0ZVJhbmdlSW5wdXRIYXJuZXNzKTtcblxuICAvKiogR2V0cyB0aGUgYXBwZWFyYW5jZSBvZiB0aGUgZm9ybS1maWVsZC4gKi9cbiAgYXN5bmMgZ2V0QXBwZWFyYW5jZSgpOiBQcm9taXNlPCdsZWdhY3knfCdzdGFuZGFyZCd8J2ZpbGwnfCdvdXRsaW5lJz4ge1xuICAgIGNvbnN0IGhvc3RDbGFzc2VzID0gYXdhaXQgKGF3YWl0IHRoaXMuaG9zdCgpKS5nZXRBdHRyaWJ1dGUoJ2NsYXNzJyk7XG4gICAgaWYgKGhvc3RDbGFzc2VzICE9PSBudWxsKSB7XG4gICAgICBjb25zdCBhcHBlYXJhbmNlTWF0Y2ggPVxuICAgICAgICAgIGhvc3RDbGFzc2VzLm1hdGNoKC9tYXQtZm9ybS1maWVsZC1hcHBlYXJhbmNlLShsZWdhY3l8c3RhbmRhcmR8ZmlsbHxvdXRsaW5lKSg/OiR8ICkvKTtcbiAgICAgIGlmIChhcHBlYXJhbmNlTWF0Y2gpIHtcbiAgICAgICAgcmV0dXJuIGFwcGVhcmFuY2VNYXRjaFsxXSBhcyAnbGVnYWN5JyB8ICdzdGFuZGFyZCcgfCAnZmlsbCcgfCAnb3V0bGluZSc7XG4gICAgICB9XG4gICAgfVxuICAgIHRocm93IEVycm9yKCdDb3VsZCBub3QgZGV0ZXJtaW5lIGFwcGVhcmFuY2Ugb2YgZm9ybS1maWVsZC4nKTtcbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZSBmb3JtLWZpZWxkIGhhcyBhIGxhYmVsLiAqL1xuICBhc3luYyBoYXNMYWJlbCgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuaG9zdCgpKS5oYXNDbGFzcygnbWF0LWZvcm0tZmllbGQtaGFzLWxhYmVsJyk7XG4gIH1cblxuICAvKiogV2hldGhlciB0aGUgbGFiZWwgaXMgY3VycmVudGx5IGZsb2F0aW5nLiAqL1xuICBhc3luYyBpc0xhYmVsRmxvYXRpbmcoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3QgaG9zdCA9IGF3YWl0IHRoaXMuaG9zdCgpO1xuICAgIGNvbnN0IFtoYXNMYWJlbCwgc2hvdWxkRmxvYXRdID0gYXdhaXQgcGFyYWxsZWwoKCkgPT4gW1xuICAgICAgdGhpcy5oYXNMYWJlbCgpLFxuICAgICAgaG9zdC5oYXNDbGFzcygnbWF0LWZvcm0tZmllbGQtc2hvdWxkLWZsb2F0JyksXG4gICAgXSk7XG4gICAgLy8gSWYgdGhlcmUgaXMgbm8gbGFiZWwsIHRoZSBsYWJlbCBjb25jZXB0dWFsbHkgY2FuIG5ldmVyIGZsb2F0LiBUaGUgYHNob3VsZC1mbG9hdGAgY2xhc3NcbiAgICAvLyBpcyBqdXN0IGFsd2F5cyBzZXQgcmVnYXJkbGVzcyBvZiB3aGV0aGVyIHRoZSBsYWJlbCBpcyBkaXNwbGF5ZWQgb3Igbm90LlxuICAgIHJldHVybiBoYXNMYWJlbCAmJiBzaG91bGRGbG9hdDtcbiAgfVxufVxuIl19