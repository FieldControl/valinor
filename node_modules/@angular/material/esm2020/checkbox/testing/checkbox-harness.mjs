/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ComponentHarness, HarnessPredicate, } from '@angular/cdk/testing';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
export class _MatCheckboxHarnessBase extends ComponentHarness {
    /** Whether the checkbox is checked. */
    async isChecked() {
        const checked = (await this._input()).getProperty('checked');
        return coerceBooleanProperty(await checked);
    }
    /** Whether the checkbox is in an indeterminate state. */
    async isIndeterminate() {
        const indeterminate = (await this._input()).getProperty('indeterminate');
        return coerceBooleanProperty(await indeterminate);
    }
    /** Whether the checkbox is disabled. */
    async isDisabled() {
        const disabled = (await this._input()).getAttribute('disabled');
        return coerceBooleanProperty(await disabled);
    }
    /** Whether the checkbox is required. */
    async isRequired() {
        const required = (await this._input()).getProperty('required');
        return coerceBooleanProperty(await required);
    }
    /** Whether the checkbox is valid. */
    async isValid() {
        const invalid = (await this.host()).hasClass('ng-invalid');
        return !(await invalid);
    }
    /** Gets the checkbox's name. */
    async getName() {
        return (await this._input()).getAttribute('name');
    }
    /** Gets the checkbox's value. */
    async getValue() {
        return (await this._input()).getProperty('value');
    }
    /** Gets the checkbox's aria-label. */
    async getAriaLabel() {
        return (await this._input()).getAttribute('aria-label');
    }
    /** Gets the checkbox's aria-labelledby. */
    async getAriaLabelledby() {
        return (await this._input()).getAttribute('aria-labelledby');
    }
    /** Gets the checkbox's label text. */
    async getLabelText() {
        return (await this._label()).text();
    }
    /** Focuses the checkbox. */
    async focus() {
        return (await this._input()).focus();
    }
    /** Blurs the checkbox. */
    async blur() {
        return (await this._input()).blur();
    }
    /** Whether the checkbox is focused. */
    async isFocused() {
        return (await this._input()).isFocused();
    }
    /**
     * Puts the checkbox in a checked state by toggling it if it is currently unchecked, or doing
     * nothing if it is already checked.
     *
     * Note: This attempts to check the checkbox as a user would, by clicking it. Therefore if you
     * are using `MAT_CHECKBOX_DEFAULT_OPTIONS` to change the behavior on click, calling this method
     * might not have the expected result.
     */
    async check() {
        if (!(await this.isChecked())) {
            await this.toggle();
        }
    }
    /**
     * Puts the checkbox in an unchecked state by toggling it if it is currently checked, or doing
     * nothing if it is already unchecked.
     *
     * Note: This attempts to uncheck the checkbox as a user would, by clicking it. Therefore if you
     * are using `MAT_CHECKBOX_DEFAULT_OPTIONS` to change the behavior on click, calling this method
     * might not have the expected result.
     */
    async uncheck() {
        if (await this.isChecked()) {
            await this.toggle();
        }
    }
}
/** Harness for interacting with a MDC-based mat-checkbox in tests. */
export class MatCheckboxHarness extends _MatCheckboxHarnessBase {
    constructor() {
        super(...arguments);
        this._input = this.locatorFor('input');
        this._label = this.locatorFor('label');
        this._inputContainer = this.locatorFor('.mdc-checkbox');
    }
    /**
     * Gets a `HarnessPredicate` that can be used to search for a checkbox with specific attributes.
     * @param options Options for narrowing the search:
     *   - `selector` finds a checkbox whose host element matches the given selector.
     *   - `label` finds a checkbox with specific label text.
     *   - `name` finds a checkbox with specific name.
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return (new HarnessPredicate(this, options)
            .addOption('label', options.label, (harness, label) => HarnessPredicate.stringMatches(harness.getLabelText(), label))
            // We want to provide a filter option for "name" because the name of the checkbox is
            // only set on the underlying input. This means that it's not possible for developers
            // to retrieve the harness of a specific checkbox with name through a CSS selector.
            .addOption('name', options.name, async (harness, name) => (await harness.getName()) === name)
            .addOption('checked', options.checked, async (harness, checked) => (await harness.isChecked()) == checked)
            .addOption('disabled', options.disabled, async (harness, disabled) => {
            return (await harness.isDisabled()) === disabled;
        }));
    }
    async toggle() {
        const elToClick = (await this.isDisabled()) ? this._inputContainer() : this._input();
        return (await elToClick).click();
    }
}
MatCheckboxHarness.hostSelector = '.mat-mdc-checkbox';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hlY2tib3gtaGFybmVzcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9jaGVja2JveC90ZXN0aW5nL2NoZWNrYm94LWhhcm5lc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUVMLGdCQUFnQixFQUVoQixnQkFBZ0IsR0FFakIsTUFBTSxzQkFBc0IsQ0FBQztBQUU5QixPQUFPLEVBQUMscUJBQXFCLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUU1RCxNQUFNLE9BQWdCLHVCQUF3QixTQUFRLGdCQUFnQjtJQUlwRSx1Q0FBdUM7SUFDdkMsS0FBSyxDQUFDLFNBQVM7UUFDYixNQUFNLE9BQU8sR0FBRyxDQUFDLE1BQU0sSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsV0FBVyxDQUFVLFNBQVMsQ0FBQyxDQUFDO1FBQ3RFLE9BQU8scUJBQXFCLENBQUMsTUFBTSxPQUFPLENBQUMsQ0FBQztJQUM5QyxDQUFDO0lBRUQseURBQXlEO0lBQ3pELEtBQUssQ0FBQyxlQUFlO1FBQ25CLE1BQU0sYUFBYSxHQUFHLENBQUMsTUFBTSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxXQUFXLENBQVMsZUFBZSxDQUFDLENBQUM7UUFDakYsT0FBTyxxQkFBcUIsQ0FBQyxNQUFNLGFBQWEsQ0FBQyxDQUFDO0lBQ3BELENBQUM7SUFFRCx3Q0FBd0M7SUFDeEMsS0FBSyxDQUFDLFVBQVU7UUFDZCxNQUFNLFFBQVEsR0FBRyxDQUFDLE1BQU0sSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ2hFLE9BQU8scUJBQXFCLENBQUMsTUFBTSxRQUFRLENBQUMsQ0FBQztJQUMvQyxDQUFDO0lBRUQsd0NBQXdDO0lBQ3hDLEtBQUssQ0FBQyxVQUFVO1FBQ2QsTUFBTSxRQUFRLEdBQUcsQ0FBQyxNQUFN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biAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtcbiAgQXN5bmNGYWN0b3J5Rm4sXG4gIENvbXBvbmVudEhhcm5lc3MsXG4gIENvbXBvbmVudEhhcm5lc3NDb25zdHJ1Y3RvcixcbiAgSGFybmVzc1ByZWRpY2F0ZSxcbiAgVGVzdEVsZW1lbnQsXG59IGZyb20gJ0Bhbmd1bGFyL2Nkay90ZXN0aW5nJztcbmltcG9ydCB7Q2hlY2tib3hIYXJuZXNzRmlsdGVyc30gZnJvbSAnLi9jaGVja2JveC1oYXJuZXNzLWZpbHRlcnMnO1xuaW1wb3J0IHtjb2VyY2VCb29sZWFuUHJvcGVydHl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2VyY2lvbic7XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBfTWF0Q2hlY2tib3hIYXJuZXNzQmFzZSBleHRlbmRzIENvbXBvbmVudEhhcm5lc3Mge1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgX2lucHV0OiBBc3luY0ZhY3RvcnlGbjxUZXN0RWxlbWVudD47XG4gIHByb3RlY3RlZCBhYnN0cmFjdCBfbGFiZWw6IEFzeW5jRmFjdG9yeUZuPFRlc3RFbGVtZW50PjtcblxuICAvKiogV2hldGhlciB0aGUgY2hlY2tib3ggaXMgY2hlY2tlZC4gKi9cbiAgYXN5bmMgaXNDaGVja2VkKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IGNoZWNrZWQgPSAoYXdhaXQgdGhpcy5faW5wdXQoKSkuZ2V0UHJvcGVydHk8Ym9vbGVhbj4oJ2NoZWNrZWQnKTtcbiAgICByZXR1cm4gY29lcmNlQm9vbGVhblByb3BlcnR5KGF3YWl0IGNoZWNrZWQpO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGNoZWNrYm94IGlzIGluIGFuIGluZGV0ZXJtaW5hdGUgc3RhdGUuICovXG4gIGFzeW5jIGlzSW5kZXRlcm1pbmF0ZSgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCBpbmRldGVybWluYXRlID0gKGF3YWl0IHRoaXMuX2lucHV0KCkpLmdldFByb3BlcnR5PHN0cmluZz4oJ2luZGV0ZXJtaW5hdGUnKTtcbiAgICByZXR1cm4gY29lcmNlQm9vbGVhblByb3BlcnR5KGF3YWl0IGluZGV0ZXJtaW5hdGUpO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGNoZWNrYm94IGlzIGRpc2FibGVkLiAqL1xuICBhc3luYyBpc0Rpc2FibGVkKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IGRpc2FibGVkID0gKGF3YWl0IHRoaXMuX2lucHV0KCkpLmdldEF0dHJpYnV0ZSgnZGlzYWJsZWQnKTtcbiAgICByZXR1cm4gY29lcmNlQm9vbGVhblByb3BlcnR5KGF3YWl0IGRpc2FibGVkKTtcbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZSBjaGVja2JveCBpcyByZXF1aXJlZC4gKi9cbiAgYXN5bmMgaXNSZXF1aXJlZCgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCByZXF1aXJlZCA9IChhd2FpdCB0aGlzLl9pbnB1dCgpKS5nZXRQcm9wZXJ0eTxib29sZWFuPigncmVxdWlyZWQnKTtcbiAgICByZXR1cm4gY29lcmNlQm9vbGVhblByb3BlcnR5KGF3YWl0IHJlcXVpcmVkKTtcbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZSBjaGVja2JveCBpcyB2YWxpZC4gKi9cbiAgYXN5bmMgaXNWYWxpZCgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCBpbnZhbGlkID0gKGF3YWl0IHRoaXMuaG9zdCgpKS5oYXNDbGFzcygnbmctaW52YWxpZCcpO1xuICAgIHJldHVybiAhKGF3YWl0IGludmFsaWQpO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIGNoZWNrYm94J3MgbmFtZS4gKi9cbiAgYXN5bmMgZ2V0TmFtZSgpOiBQcm9taXNlPHN0cmluZyB8IG51bGw+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuX2lucHV0KCkpLmdldEF0dHJpYnV0ZSgnbmFtZScpO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIGNoZWNrYm94J3MgdmFsdWUuICovXG4gIGFzeW5jIGdldFZhbHVlKCk6IFByb21pc2U8c3RyaW5nIHwgbnVsbD4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5faW5wdXQoKSkuZ2V0UHJvcGVydHk8c3RyaW5nIHwgbnVsbD4oJ3ZhbHVlJyk7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgY2hlY2tib3gncyBhcmlhLWxhYmVsLiAqL1xuICBhc3luYyBnZXRBcmlhTGFiZWwoKTogUHJvbWlzZTxzdHJpbmcgfCBudWxsPiB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLl9pbnB1dCgpKS5nZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWwnKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBjaGVja2JveCdzIGFyaWEtbGFiZWxsZWRieS4gKi9cbiAgYXN5bmMgZ2V0QXJpYUxhYmVsbGVkYnkoKTogUHJvbWlzZTxzdHJpbmcgfCBudWxsPiB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLl9pbnB1dCgpKS5nZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWxsZWRieScpO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIGNoZWNrYm94J3MgbGFiZWwgdGV4dC4gKi9cbiAgYXN5bmMgZ2V0TGFiZWxUZXh0KCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLl9sYWJlbCgpKS50ZXh0KCk7XG4gIH1cblxuICAvKiogRm9jdXNlcyB0aGUgY2hlY2tib3guICovXG4gIGFzeW5jIGZvY3VzKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5faW5wdXQoKSkuZm9jdXMoKTtcbiAgfVxuXG4gIC8qKiBCbHVycyB0aGUgY2hlY2tib3guICovXG4gIGFzeW5jIGJsdXIoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLl9pbnB1dCgpKS5ibHVyKCk7XG4gIH1cblxuICAvKiogV2hldGhlciB0aGUgY2hlY2tib3ggaXMgZm9jdXNlZC4gKi9cbiAgYXN5bmMgaXNGb2N1c2VkKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5faW5wdXQoKSkuaXNGb2N1c2VkKCk7XG4gIH1cblxuICAvKipcbiAgICogVG9nZ2xlcyB0aGUgY2hlY2tlZCBzdGF0ZSBvZiB0aGUgY2hlY2tib3guXG4gICAqXG4gICAqIE5vdGU6IFRoaXMgYXR0ZW1wdHMgdG8gdG9nZ2xlIHRoZSBjaGVja2JveCBhcyBhIHVzZXIgd291bGQsIGJ5IGNsaWNraW5nIGl0LiBUaGVyZWZvcmUgaWYgeW91XG4gICAqIGFyZSB1c2luZyBgTUFUX0NIRUNLQk9YX0RFRkFVTFRfT1BUSU9OU2AgdG8gY2hhbmdlIHRoZSBiZWhhdmlvciBvbiBjbGljaywgY2FsbGluZyB0aGlzIG1ldGhvZFxuICAgKiBtaWdodCBub3QgaGF2ZSB0aGUgZXhwZWN0ZWQgcmVzdWx0LlxuICAgKi9cbiAgYWJzdHJhY3QgdG9nZ2xlKCk6IFByb21pc2U8dm9pZD47XG5cbiAgLyoqXG4gICAqIFB1dHMgdGhlIGNoZWNrYm94IGluIGEgY2hlY2tlZCBzdGF0ZSBieSB0b2dnbGluZyBpdCBpZiBpdCBpcyBjdXJyZW50bHkgdW5jaGVja2VkLCBvciBkb2luZ1xuICAgKiBub3RoaW5nIGlmIGl0IGlzIGFscmVhZHkgY2hlY2tlZC5cbiAgICpcbiAgICogTm90ZTogVGhpcyBhdHRlbXB0cyB0byBjaGVjayB0aGUgY2hlY2tib3ggYXMgYSB1c2VyIHdvdWxkLCBieSBjbGlja2luZyBpdC4gVGhlcmVmb3JlIGlmIHlvdVxuICAgKiBhcmUgdXNpbmcgYE1BVF9DSEVDS0JPWF9ERUZBVUxUX09QVElPTlNgIHRvIGNoYW5nZSB0aGUgYmVoYXZpb3Igb24gY2xpY2ssIGNhbGxpbmcgdGhpcyBtZXRob2RcbiAgICogbWlnaHQgbm90IGhhdmUgdGhlIGV4cGVjdGVkIHJlc3VsdC5cbiAgICovXG4gIGFzeW5jIGNoZWNrKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICghKGF3YWl0IHRoaXMuaXNDaGVja2VkKCkpKSB7XG4gICAgICBhd2FpdCB0aGlzLnRvZ2dsZSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBQdXRzIHRoZSBjaGVja2JveCBpbiBhbiB1bmNoZWNrZWQgc3RhdGUgYnkgdG9nZ2xpbmcgaXQgaWYgaXQgaXMgY3VycmVudGx5IGNoZWNrZWQsIG9yIGRvaW5nXG4gICAqIG5vdGhpbmcgaWYgaXQgaXMgYWxyZWFkeSB1bmNoZWNrZWQuXG4gICAqXG4gICAqIE5vdGU6IFRoaXMgYXR0ZW1wdHMgdG8gdW5jaGVjayB0aGUgY2hlY2tib3ggYXMgYSB1c2VyIHdvdWxkLCBieSBjbGlja2luZyBpdC4gVGhlcmVmb3JlIGlmIHlvdVxuICAgKiBhcmUgdXNpbmcgYE1BVF9DSEVDS0JPWF9ERUZBVUxUX09QVElPTlNgIHRvIGNoYW5nZSB0aGUgYmVoYXZpb3Igb24gY2xpY2ssIGNhbGxpbmcgdGhpcyBtZXRob2RcbiAgICogbWlnaHQgbm90IGhhdmUgdGhlIGV4cGVjdGVkIHJlc3VsdC5cbiAgICovXG4gIGFzeW5jIHVuY2hlY2soKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKGF3YWl0IHRoaXMuaXNDaGVja2VkKCkpIHtcbiAgICAgIGF3YWl0IHRoaXMudG9nZ2xlKCk7XG4gICAgfVxuICB9XG59XG5cbi8qKiBIYXJuZXNzIGZvciBpbnRlcmFjdGluZyB3aXRoIGEgTURDLWJhc2VkIG1hdC1jaGVja2JveCBpbiB0ZXN0cy4gKi9cbmV4cG9ydCBjbGFzcyBNYXRDaGVja2JveEhhcm5lc3MgZXh0ZW5kcyBfTWF0Q2hlY2tib3hIYXJuZXNzQmFzZSB7XG4gIHN0YXRpYyBob3N0U2VsZWN0b3IgPSAnLm1hdC1tZGMtY2hlY2tib3gnO1xuXG4gIC8qKlxuICAgKiBHZXRzIGEgYEhhcm5lc3NQcmVkaWNhdGVgIHRoYXQgY2FuIGJlIHVzZWQgdG8gc2VhcmNoIGZvciBhIGNoZWNrYm94IHdpdGggc3BlY2lmaWMgYXR0cmlidXRlcy5cbiAgICogQHBhcmFtIG9wdGlvbnMgT3B0aW9ucyBmb3IgbmFycm93aW5nIHRoZSBzZWFyY2g6XG4gICAqICAgLSBgc2VsZWN0b3JgIGZpbmRzIGEgY2hlY2tib3ggd2hvc2UgaG9zdCBlbGVtZW50IG1hdGNoZXMgdGhlIGdpdmVuIHNlbGVjdG9yLlxuICAgKiAgIC0gYGxhYmVsYCBmaW5kcyBhIGNoZWNrYm94IHdpdGggc3BlY2lmaWMgbGFiZWwgdGV4dC5cbiAgICogICAtIGBuYW1lYCBmaW5kcyBhIGNoZWNrYm94IHdpdGggc3BlY2lmaWMgbmFtZS5cbiAgICogQHJldHVybiBhIGBIYXJuZXNzUHJlZGljYXRlYCBjb25maWd1cmVkIHdpdGggdGhlIGdpdmVuIG9wdGlvbnMuXG4gICAqL1xuICBzdGF0aWMgd2l0aDxUIGV4dGVuZHMgTWF0Q2hlY2tib3hIYXJuZXNzPihcbiAgICB0aGlzOiBDb21wb25lbnRIYXJuZXNzQ29uc3RydWN0b3I8VD4sXG4gICAgb3B0aW9uczogQ2hlY2tib3hIYXJuZXNzRmlsdGVycyA9IHt9LFxuICApOiBIYXJuZXNzUHJlZGljYXRlPFQ+IHtcbiAgICByZXR1cm4gKFxuICAgICAgbmV3IEhhcm5lc3NQcmVkaWNhdGUodGhpcywgb3B0aW9ucylcbiAgICAgICAgLmFkZE9wdGlvbignbGFiZWwnLCBvcHRpb25zLmxhYmVsLCAoaGFybmVzcywgbGFiZWwpID0+XG4gICAgICAgICAgSGFybmVzc1ByZWRpY2F0ZS5zdHJpbmdNYXRjaGVzKGhhcm5lc3MuZ2V0TGFiZWxUZXh0KCksIGxhYmVsKSxcbiAgICAgICAgKVxuICAgICAgICAvLyBXZSB3YW50IHRvIHByb3ZpZGUgYSBmaWx0ZXIgb3B0aW9uIGZvciBcIm5hbWVcIiBiZWNhdXNlIHRoZSBuYW1lIG9mIHRoZSBjaGVja2JveCBpc1xuICAgICAgICAvLyBvbmx5IHNldCBvbiB0aGUgdW5kZXJseWluZyBpbnB1dC4gVGhpcyBtZWFucyB0aGF0IGl0J3Mgbm90IHBvc3NpYmxlIGZvciBkZXZlbG9wZXJzXG4gICAgICAgIC8vIHRvIHJldHJpZXZlIHRoZSBoYXJuZXNzIG9mIGEgc3BlY2lmaWMgY2hlY2tib3ggd2l0aCBuYW1lIHRocm91Z2ggYSBDU1Mgc2VsZWN0b3IuXG4gICAgICAgIC5hZGRPcHRpb24oXG4gICAgICAgICAgJ25hbWUnLFxuICAgICAgICAgIG9wdGlvbnMubmFtZSxcbiAgICAgICAgICBhc3luYyAoaGFybmVzcywgbmFtZSkgPT4gKGF3YWl0IGhhcm5lc3MuZ2V0TmFtZSgpKSA9PT0gbmFtZSxcbiAgICAgICAgKVxuICAgICAgICAuYWRkT3B0aW9uKFxuICAgICAgICAgICdjaGVja2VkJyxcbiAgICAgICAgICBvcHRpb25zLmNoZWNrZWQsXG4gICAgICAgICAgYXN5bmMgKGhhcm5lc3MsIGNoZWNrZWQpID0+IChhd2FpdCBoYXJuZXNzLmlzQ2hlY2tlZCgpKSA9PSBjaGVja2VkLFxuICAgICAgICApXG4gICAgICAgIC5hZGRPcHRpb24oJ2Rpc2FibGVkJywgb3B0aW9ucy5kaXNhYmxlZCwgYXN5bmMgKGhhcm5lc3MsIGRpc2FibGVkKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIChhd2FpdCBoYXJuZXNzLmlzRGlzYWJsZWQoKSkgPT09IGRpc2FibGVkO1xuICAgICAgICB9KVxuICAgICk7XG4gIH1cblxuICBwcm90ZWN0ZWQgX2lucHV0ID0gdGhpcy5sb2NhdG9yRm9yKCdpbnB1dCcpO1xuICBwcm90ZWN0ZWQgX2xhYmVsID0gdGhpcy5sb2NhdG9yRm9yKCdsYWJlbCcpO1xuICBwcml2YXRlIF9pbnB1dENvbnRhaW5lciA9IHRoaXMubG9jYXRvckZvcignLm1kYy1jaGVja2JveCcpO1xuXG4gIGFzeW5jIHRvZ2dsZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBlbFRvQ2xpY2sgPSAoYXdhaXQgdGhpcy5pc0Rpc2FibGVkKCkpID8gdGhpcy5faW5wdXRDb250YWluZXIoKSA6IHRoaXMuX2lucHV0KCk7XG4gICAgcmV0dXJuIChhd2FpdCBlbFRvQ2xpY2spLmNsaWNrKCk7XG4gIH1cbn1cbiJdfQ==