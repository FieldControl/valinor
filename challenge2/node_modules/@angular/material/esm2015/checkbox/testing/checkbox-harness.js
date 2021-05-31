/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { ComponentHarness, HarnessPredicate, } from '@angular/cdk/testing';
export class _MatCheckboxHarnessBase extends ComponentHarness {
    /** Whether the checkbox is checked. */
    isChecked() {
        return __awaiter(this, void 0, void 0, function* () {
            const checked = (yield this._input()).getProperty('checked');
            return coerceBooleanProperty(yield checked);
        });
    }
    /** Whether the checkbox is in an indeterminate state. */
    isIndeterminate() {
        return __awaiter(this, void 0, void 0, function* () {
            const indeterminate = (yield this._input()).getProperty('indeterminate');
            return coerceBooleanProperty(yield indeterminate);
        });
    }
    /** Whether the checkbox is disabled. */
    isDisabled() {
        return __awaiter(this, void 0, void 0, function* () {
            const disabled = (yield this._input()).getAttribute('disabled');
            return coerceBooleanProperty(yield disabled);
        });
    }
    /** Whether the checkbox is required. */
    isRequired() {
        return __awaiter(this, void 0, void 0, function* () {
            const required = (yield this._input()).getProperty('required');
            return coerceBooleanProperty(yield required);
        });
    }
    /** Whether the checkbox is valid. */
    isValid() {
        return __awaiter(this, void 0, void 0, function* () {
            const invalid = (yield this.host()).hasClass('ng-invalid');
            return !(yield invalid);
        });
    }
    /** Gets the checkbox's name. */
    getName() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this._input()).getAttribute('name');
        });
    }
    /** Gets the checkbox's value. */
    getValue() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this._input()).getProperty('value');
        });
    }
    /** Gets the checkbox's aria-label. */
    getAriaLabel() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this._input()).getAttribute('aria-label');
        });
    }
    /** Gets the checkbox's aria-labelledby. */
    getAriaLabelledby() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this._input()).getAttribute('aria-labelledby');
        });
    }
    /** Gets the checkbox's label text. */
    getLabelText() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this._label()).text();
        });
    }
    /** Focuses the checkbox. */
    focus() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this._input()).focus();
        });
    }
    /** Blurs the checkbox. */
    blur() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this._input()).blur();
        });
    }
    /** Whether the checkbox is focused. */
    isFocused() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this._input()).isFocused();
        });
    }
    /**
     * Puts the checkbox in a checked state by toggling it if it is currently unchecked, or doing
     * nothing if it is already checked.
     *
     * Note: This attempts to check the checkbox as a user would, by clicking it. Therefore if you
     * are using `MAT_CHECKBOX_DEFAULT_OPTIONS` to change the behavior on click, calling this method
     * might not have the expected result.
     */
    check() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(yield this.isChecked())) {
                yield this.toggle();
            }
        });
    }
    /**
     * Puts the checkbox in an unchecked state by toggling it if it is currently checked, or doing
     * nothing if it is already unchecked.
     *
     * Note: This attempts to uncheck the checkbox as a user would, by clicking it. Therefore if you
     * are using `MAT_CHECKBOX_DEFAULT_OPTIONS` to change the behavior on click, calling this method
     * might not have the expected result.
     */
    uncheck() {
        return __awaiter(this, void 0, void 0, function* () {
            if (yield this.isChecked()) {
                yield this.toggle();
            }
        });
    }
}
/** Harness for interacting with a standard mat-checkbox in tests. */
export class MatCheckboxHarness extends _MatCheckboxHarnessBase {
    constructor() {
        super(...arguments);
        this._input = this.locatorFor('input');
        this._label = this.locatorFor('.mat-checkbox-label');
        this._inputContainer = this.locatorFor('.mat-checkbox-inner-container');
    }
    /**
     * Gets a `HarnessPredicate` that can be used to search for a `MatCheckboxHarness` that meets
     * certain criteria.
     * @param options Options for filtering which checkbox instances are considered a match.
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return new HarnessPredicate(MatCheckboxHarness, options)
            .addOption('label', options.label, (harness, label) => HarnessPredicate.stringMatches(harness.getLabelText(), label))
            // We want to provide a filter option for "name" because the name of the checkbox is
            // only set on the underlying input. This means that it's not possible for developers
            // to retrieve the harness of a specific checkbox with name through a CSS selector.
            .addOption('name', options.name, (harness, name) => __awaiter(this, void 0, void 0, function* () { return (yield harness.getName()) === name; }));
    }
    toggle() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this._inputContainer()).click();
        });
    }
}
/** The selector for the host element of a `MatCheckbox` instance. */
MatCheckboxHarness.hostSelector = '.mat-checkbox';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hlY2tib3gtaGFybmVzcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9jaGVja2JveC90ZXN0aW5nL2NoZWNrYm94LWhhcm5lc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUVILE9BQU8sRUFBQyxxQkFBcUIsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQzVELE9BQU8sRUFFTCxnQkFBZ0IsRUFDaEIsZ0JBQWdCLEdBRWpCLE1BQU0sc0JBQXNCLENBQUM7QUFHOUIsTUFBTSxPQUFnQix1QkFBd0IsU0FBUSxnQkFBZ0I7SUFJcEUsdUNBQXVDO0lBQ2pDLFNBQVM7O1lBQ2IsTUFBTSxPQUFPLEdBQUcsQ0FBQyxNQUFNLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUM3RCxPQUFPLHFCQUFxQixDQUFDLE1BQU0sT0FBTyxDQUFDLENBQUM7UUFDOUMsQ0FBQztLQUFBO0lBRUQseURBQXlEO0lBQ25ELGVBQWU7O1lBQ25CLE1BQU0sYUFBYSxHQUFHLENBQUMsTUFBTSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUMsZUFBZSxDQUFDLENBQUM7WUFDekUsT0FBTyxxQkFBcUIsQ0FBQyxNQUFNLGFBQWEsQ0FBQyxDQUFDO1FBQ3BELENBQUM7S0FBQTtJQUVELHdDQUF3QztJQUNsQyxVQUFVOztZQUNkLE1BQU0sUUFBUSxHQUFHLENBQUMsTUFBTSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDaEUsT0FBTyxxQkFBcUIsQ0FBQyxNQUFNLFFBQVEsQ0FBQyxDQUFDO1FBQy9DLENBQUM7S0FBQTtJQUVELHdDQUF3QztJQUNsQyxVQUFVOztZQUNkLE1BQU0sUUFBUSxHQUFHLENBQUMsTUFBTSxJQUFJLENBQUMsTUFBTSxFQUFF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QUFFLEtBQUssRUFBRSxFQUFFLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUN0RixvRkFBb0Y7WUFDcEYscUZBQXFGO1lBQ3JGLG1GQUFtRjthQUNsRixTQUFTLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBTyxPQUFPLEVBQUUsSUFBSSxFQUFFLEVBQUUsZ0RBQUMsT0FBQSxDQUFBLE1BQU0sT0FBTyxDQUFDLE9BQU8sRUFBRSxNQUFLLElBQUksQ0FBQSxHQUFBLENBQUMsQ0FBQztJQUNsRyxDQUFDO0lBTUssTUFBTTs7WUFDVixPQUFPLENBQUMsTUFBTSxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNoRCxDQUFDO0tBQUE7O0FBMUJELHFFQUFxRTtBQUM5RCwrQkFBWSxHQUFHLGVBQWUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2NvZXJjZUJvb2xlYW5Qcm9wZXJ0eX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvZXJjaW9uJztcbmltcG9ydCB7XG4gIEFzeW5jRmFjdG9yeUZuLFxuICBDb21wb25lbnRIYXJuZXNzLFxuICBIYXJuZXNzUHJlZGljYXRlLFxuICBUZXN0RWxlbWVudCxcbn0gZnJvbSAnQGFuZ3VsYXIvY2RrL3Rlc3RpbmcnO1xuaW1wb3J0IHtDaGVja2JveEhhcm5lc3NGaWx0ZXJzfSBmcm9tICcuL2NoZWNrYm94LWhhcm5lc3MtZmlsdGVycyc7XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBfTWF0Q2hlY2tib3hIYXJuZXNzQmFzZSBleHRlbmRzIENvbXBvbmVudEhhcm5lc3Mge1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgX2lucHV0OiBBc3luY0ZhY3RvcnlGbjxUZXN0RWxlbWVudD47XG4gIHByb3RlY3RlZCBhYnN0cmFjdCBfbGFiZWw6IEFzeW5jRmFjdG9yeUZuPFRlc3RFbGVtZW50PjtcblxuICAvKiogV2hldGhlciB0aGUgY2hlY2tib3ggaXMgY2hlY2tlZC4gKi9cbiAgYXN5bmMgaXNDaGVja2VkKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IGNoZWNrZWQgPSAoYXdhaXQgdGhpcy5faW5wdXQoKSkuZ2V0UHJvcGVydHkoJ2NoZWNrZWQnKTtcbiAgICByZXR1cm4gY29lcmNlQm9vbGVhblByb3BlcnR5KGF3YWl0IGNoZWNrZWQpO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGNoZWNrYm94IGlzIGluIGFuIGluZGV0ZXJtaW5hdGUgc3RhdGUuICovXG4gIGFzeW5jIGlzSW5kZXRlcm1pbmF0ZSgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCBpbmRldGVybWluYXRlID0gKGF3YWl0IHRoaXMuX2lucHV0KCkpLmdldFByb3BlcnR5KCdpbmRldGVybWluYXRlJyk7XG4gICAgcmV0dXJuIGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eShhd2FpdCBpbmRldGVybWluYXRlKTtcbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZSBjaGVja2JveCBpcyBkaXNhYmxlZC4gKi9cbiAgYXN5bmMgaXNEaXNhYmxlZCgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCBkaXNhYmxlZCA9IChhd2FpdCB0aGlzLl9pbnB1dCgpKS5nZXRBdHRyaWJ1dGUoJ2Rpc2FibGVkJyk7XG4gICAgcmV0dXJuIGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eShhd2FpdCBkaXNhYmxlZCk7XG4gIH1cblxuICAvKiogV2hldGhlciB0aGUgY2hlY2tib3ggaXMgcmVxdWlyZWQuICovXG4gIGFzeW5jIGlzUmVxdWlyZWQoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3QgcmVxdWlyZWQgPSAoYXdhaXQgdGhpcy5faW5wdXQoKSkuZ2V0UHJvcGVydHkoJ3JlcXVpcmVkJyk7XG4gICAgcmV0dXJuIGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eShhd2FpdCByZXF1aXJlZCk7XG4gIH1cblxuICAvKiogV2hldGhlciB0aGUgY2hlY2tib3ggaXMgdmFsaWQuICovXG4gIGFzeW5jIGlzVmFsaWQoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3QgaW52YWxpZCA9IChhd2FpdCB0aGlzLmhvc3QoKSkuaGFzQ2xhc3MoJ25nLWludmFsaWQnKTtcbiAgICByZXR1cm4gIShhd2FpdCBpbnZhbGlkKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBjaGVja2JveCdzIG5hbWUuICovXG4gIGFzeW5jIGdldE5hbWUoKTogUHJvbWlzZTxzdHJpbmd8bnVsbD4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5faW5wdXQoKSkuZ2V0QXR0cmlidXRlKCduYW1lJyk7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgY2hlY2tib3gncyB2YWx1ZS4gKi9cbiAgYXN5bmMgZ2V0VmFsdWUoKTogUHJvbWlzZTxzdHJpbmd8bnVsbD4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5faW5wdXQoKSkuZ2V0UHJvcGVydHkoJ3ZhbHVlJyk7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgY2hlY2tib3gncyBhcmlhLWxhYmVsLiAqL1xuICBhc3luYyBnZXRBcmlhTGFiZWwoKTogUHJvbWlzZTxzdHJpbmd8bnVsbD4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5faW5wdXQoKSkuZ2V0QXR0cmlidXRlKCdhcmlhLWxhYmVsJyk7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgY2hlY2tib3gncyBhcmlhLWxhYmVsbGVkYnkuICovXG4gIGFzeW5jIGdldEFyaWFMYWJlbGxlZGJ5KCk6IFByb21pc2U8c3RyaW5nfG51bGw+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuX2lucHV0KCkpLmdldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbGxlZGJ5Jyk7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgY2hlY2tib3gncyBsYWJlbCB0ZXh0LiAqL1xuICBhc3luYyBnZXRMYWJlbFRleHQoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuX2xhYmVsKCkpLnRleHQoKTtcbiAgfVxuXG4gIC8qKiBGb2N1c2VzIHRoZSBjaGVja2JveC4gKi9cbiAgYXN5bmMgZm9jdXMoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLl9pbnB1dCgpKS5mb2N1cygpO1xuICB9XG5cbiAgLyoqIEJsdXJzIHRoZSBjaGVja2JveC4gKi9cbiAgYXN5bmMgYmx1cigpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuX2lucHV0KCkpLmJsdXIoKTtcbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZSBjaGVja2JveCBpcyBmb2N1c2VkLiAqL1xuICBhc3luYyBpc0ZvY3VzZWQoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLl9pbnB1dCgpKS5pc0ZvY3VzZWQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUb2dnbGVzIHRoZSBjaGVja2VkIHN0YXRlIG9mIHRoZSBjaGVja2JveC5cbiAgICpcbiAgICogTm90ZTogVGhpcyBhdHRlbXB0cyB0byB0b2dnbGUgdGhlIGNoZWNrYm94IGFzIGEgdXNlciB3b3VsZCwgYnkgY2xpY2tpbmcgaXQuIFRoZXJlZm9yZSBpZiB5b3VcbiAgICogYXJlIHVzaW5nIGBNQVRfQ0hFQ0tCT1hfREVGQVVMVF9PUFRJT05TYCB0byBjaGFuZ2UgdGhlIGJlaGF2aW9yIG9uIGNsaWNrLCBjYWxsaW5nIHRoaXMgbWV0aG9kXG4gICAqIG1pZ2h0IG5vdCBoYXZlIHRoZSBleHBlY3RlZCByZXN1bHQuXG4gICAqL1xuICBhYnN0cmFjdCB0b2dnbGUoKTogUHJvbWlzZTx2b2lkPjtcblxuICAvKipcbiAgICogUHV0cyB0aGUgY2hlY2tib3ggaW4gYSBjaGVja2VkIHN0YXRlIGJ5IHRvZ2dsaW5nIGl0IGlmIGl0IGlzIGN1cnJlbnRseSB1bmNoZWNrZWQsIG9yIGRvaW5nXG4gICAqIG5vdGhpbmcgaWYgaXQgaXMgYWxyZWFkeSBjaGVja2VkLlxuICAgKlxuICAgKiBOb3RlOiBUaGlzIGF0dGVtcHRzIHRvIGNoZWNrIHRoZSBjaGVja2JveCBhcyBhIHVzZXIgd291bGQsIGJ5IGNsaWNraW5nIGl0LiBUaGVyZWZvcmUgaWYgeW91XG4gICAqIGFyZSB1c2luZyBgTUFUX0NIRUNLQk9YX0RFRkFVTFRfT1BUSU9OU2AgdG8gY2hhbmdlIHRoZSBiZWhhdmlvciBvbiBjbGljaywgY2FsbGluZyB0aGlzIG1ldGhvZFxuICAgKiBtaWdodCBub3QgaGF2ZSB0aGUgZXhwZWN0ZWQgcmVzdWx0LlxuICAgKi9cbiAgYXN5bmMgY2hlY2soKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKCEoYXdhaXQgdGhpcy5pc0NoZWNrZWQoKSkpIHtcbiAgICAgIGF3YWl0IHRoaXMudG9nZ2xlKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFB1dHMgdGhlIGNoZWNrYm94IGluIGFuIHVuY2hlY2tlZCBzdGF0ZSBieSB0b2dnbGluZyBpdCBpZiBpdCBpcyBjdXJyZW50bHkgY2hlY2tlZCwgb3IgZG9pbmdcbiAgICogbm90aGluZyBpZiBpdCBpcyBhbHJlYWR5IHVuY2hlY2tlZC5cbiAgICpcbiAgICogTm90ZTogVGhpcyBhdHRlbXB0cyB0byB1bmNoZWNrIHRoZSBjaGVja2JveCBhcyBhIHVzZXIgd291bGQsIGJ5IGNsaWNraW5nIGl0LiBUaGVyZWZvcmUgaWYgeW91XG4gICAqIGFyZSB1c2luZyBgTUFUX0NIRUNLQk9YX0RFRkFVTFRfT1BUSU9OU2AgdG8gY2hhbmdlIHRoZSBiZWhhdmlvciBvbiBjbGljaywgY2FsbGluZyB0aGlzIG1ldGhvZFxuICAgKiBtaWdodCBub3QgaGF2ZSB0aGUgZXhwZWN0ZWQgcmVzdWx0LlxuICAgKi9cbiAgYXN5bmMgdW5jaGVjaygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoYXdhaXQgdGhpcy5pc0NoZWNrZWQoKSkge1xuICAgICAgYXdhaXQgdGhpcy50b2dnbGUoKTtcbiAgICB9XG4gIH1cbn1cblxuLyoqIEhhcm5lc3MgZm9yIGludGVyYWN0aW5nIHdpdGggYSBzdGFuZGFyZCBtYXQtY2hlY2tib3ggaW4gdGVzdHMuICovXG5leHBvcnQgY2xhc3MgTWF0Q2hlY2tib3hIYXJuZXNzIGV4dGVuZHMgX01hdENoZWNrYm94SGFybmVzc0Jhc2Uge1xuICAvKiogVGhlIHNlbGVjdG9yIGZvciB0aGUgaG9zdCBlbGVtZW50IG9mIGEgYE1hdENoZWNrYm94YCBpbnN0YW5jZS4gKi9cbiAgc3RhdGljIGhvc3RTZWxlY3RvciA9ICcubWF0LWNoZWNrYm94JztcblxuICAvKipcbiAgICogR2V0cyBhIGBIYXJuZXNzUHJlZGljYXRlYCB0aGF0IGNhbiBiZSB1c2VkIHRvIHNlYXJjaCBmb3IgYSBgTWF0Q2hlY2tib3hIYXJuZXNzYCB0aGF0IG1lZXRzXG4gICAqIGNlcnRhaW4gY3JpdGVyaWEuXG4gICAqIEBwYXJhbSBvcHRpb25zIE9wdGlvbnMgZm9yIGZpbHRlcmluZyB3aGljaCBjaGVja2JveCBpbnN0YW5jZXMgYXJlIGNvbnNpZGVyZWQgYSBtYXRjaC5cbiAgICogQHJldHVybiBhIGBIYXJuZXNzUHJlZGljYXRlYCBjb25maWd1cmVkIHdpdGggdGhlIGdpdmVuIG9wdGlvbnMuXG4gICAqL1xuICBzdGF0aWMgd2l0aChvcHRpb25zOiBDaGVja2JveEhhcm5lc3NGaWx0ZXJzID0ge30pOiBIYXJuZXNzUHJlZGljYXRlPE1hdENoZWNrYm94SGFybmVzcz4ge1xuICAgIHJldHVybiBuZXcgSGFybmVzc1ByZWRpY2F0ZShNYXRDaGVja2JveEhhcm5lc3MsIG9wdGlvbnMpXG4gICAgICAgIC5hZGRPcHRpb24oXG4gICAgICAgICAgICAnbGFiZWwnLCBvcHRpb25zLmxhYmVsLFxuICAgICAgICAgICAgKGhhcm5lc3MsIGxhYmVsKSA9PiBIYXJuZXNzUHJlZGljYXRlLnN0cmluZ01hdGNoZXMoaGFybmVzcy5nZXRMYWJlbFRleHQoKSwgbGFiZWwpKVxuICAgICAgICAvLyBXZSB3YW50IHRvIHByb3ZpZGUgYSBmaWx0ZXIgb3B0aW9uIGZvciBcIm5hbWVcIiBiZWNhdXNlIHRoZSBuYW1lIG9mIHRoZSBjaGVja2JveCBpc1xuICAgICAgICAvLyBvbmx5IHNldCBvbiB0aGUgdW5kZXJseWluZyBpbnB1dC4gVGhpcyBtZWFucyB0aGF0IGl0J3Mgbm90IHBvc3NpYmxlIGZvciBkZXZlbG9wZXJzXG4gICAgICAgIC8vIHRvIHJldHJpZXZlIHRoZSBoYXJuZXNzIG9mIGEgc3BlY2lmaWMgY2hlY2tib3ggd2l0aCBuYW1lIHRocm91Z2ggYSBDU1Mgc2VsZWN0b3IuXG4gICAgICAgIC5hZGRPcHRpb24oJ25hbWUnLCBvcHRpb25zLm5hbWUsIGFzeW5jIChoYXJuZXNzLCBuYW1lKSA9PiBhd2FpdCBoYXJuZXNzLmdldE5hbWUoKSA9PT0gbmFtZSk7XG4gIH1cblxuICBwcm90ZWN0ZWQgX2lucHV0ID0gdGhpcy5sb2NhdG9yRm9yKCdpbnB1dCcpO1xuICBwcm90ZWN0ZWQgX2xhYmVsID0gdGhpcy5sb2NhdG9yRm9yKCcubWF0LWNoZWNrYm94LWxhYmVsJyk7XG4gIHByaXZhdGUgX2lucHV0Q29udGFpbmVyID0gdGhpcy5sb2NhdG9yRm9yKCcubWF0LWNoZWNrYm94LWlubmVyLWNvbnRhaW5lcicpO1xuXG4gIGFzeW5jIHRvZ2dsZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuX2lucHV0Q29udGFpbmVyKCkpLmNsaWNrKCk7XG4gIH1cbn1cbiJdfQ==