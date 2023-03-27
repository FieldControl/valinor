/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ContentContainerComponentHarness, HarnessPredicate } from '@angular/cdk/testing';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
/**
 * Harness for interacting with a standard mat-button in tests.
 * @deprecated Use `MatButtonHarness` from `@angular/material/button/testing` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
 * @breaking-change 17.0.0
 */
export class MatLegacyButtonHarness extends ContentContainerComponentHarness {
    /**
     * Gets a `HarnessPredicate` that can be used to search for a button harness that meets
     * certain criteria.
     * @param options Options for filtering which button instances are considered a match.
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return new HarnessPredicate(MatLegacyButtonHarness, options)
            .addOption('text', options.text, (harness, text) => HarnessPredicate.stringMatches(harness.getText(), text))
            .addOption('variant', options.variant, (harness, variant) => HarnessPredicate.stringMatches(harness.getVariant(), variant))
            .addOption('disabled', options.disabled, async (harness, disabled) => {
            return (await harness.isDisabled()) === disabled;
        });
    }
    async click(...args) {
        return (await this.host()).click(...args);
    }
    /** Whether the button is disabled. */
    async isDisabled() {
        const disabled = (await this.host()).getAttribute('disabled');
        return coerceBooleanProperty(await disabled);
    }
    /** Gets the button's label text. */
    async getText() {
        return (await this.host()).text();
    }
    /** Focuses the button. */
    async focus() {
        return (await this.host()).focus();
    }
    /** Blurs the button. */
    async blur() {
        return (await this.host()).blur();
    }
    /** Whether the button is focused. */
    async isFocused() {
        return (await this.host()).isFocused();
    }
    /** Gets the variant of the button. */
    async getVariant() {
        const host = await this.host();
        if ((await host.getAttribute('mat-raised-button')) != null) {
            return 'raised';
        }
        else if ((await host.getAttribute('mat-flat-button')) != null) {
            return 'flat';
        }
        else if ((await host.getAttribute('mat-icon-button')) != null) {
            return 'icon';
        }
        else if ((await host.getAttribute('mat-stroked-button')) != null) {
            return 'stroked';
        }
        else if ((await host.getAttribute('mat-fab')) != null) {
            return 'fab';
        }
        else if ((await host.getAttribute('mat-mini-fab')) != null) {
            return 'mini-fab';
        }
        return 'basic';
    }
}
// TODO(jelbourn) use a single class, like `.mat-button-base`
/** The selector for the host element of a button instance. */
MatLegacyButtonHarness.hostSelector = `[mat-button], [mat-raised-button], [mat-flat-button], [mat-icon-button],
                         [mat-stroked-button], [mat-fab], [mat-mini-fab]`;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnV0dG9uLWhhcm5lc3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvbGVnYWN5LWJ1dHRvbi90ZXN0aW5nL2J1dHRvbi1oYXJuZXNzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxnQ0FBZ0MsRUFBRSxnQkFBZ0IsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBQ3hGLE9BQU8sRUFBQyxxQkFBcUIsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBRzVEOzs7O0dBSUc7QUFDSCxNQUFNLE9BQU8sc0JBQXVCLFNBQVEsZ0NBQWdDO0lBTTFFOzs7OztPQUtHO0lBQ0gsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFnQyxFQUFFO1FBQzVDLE9BQU8sSUFBSSxnQkFBZ0IsQ0FBQyxzQkFBc0IsRUFBRSxPQUFPLENBQUM7YUFDekQsU0FBUyxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxFQUFFLENBQ2pELGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQ3hEO2FBQ0EsU0FBUyxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxFQUFFLENBQzFELGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQzlEO2FBQ0EsU0FBUyxDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsUUFBUSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLEVBQUU7WUFDbkUsT0FBTyxDQUFDLE1BQU0sT0FBTyxDQUFDLFVBQVUsRUFBRSxDQUFDLEtBQUssUUFBUSxDQUFDO1FBQ25ELENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQVlELEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUF3QztRQUNyRCxPQUFPLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBSSxJQUFXLENBQUMsQ0FBQztJQUNwRCxDQUFDO0lBRUQsc0NBQXNDO0lBQ3RDLEtBQUssQ0FBQyxVQUFVO1FBQ2QsTUFBTSxRQUFRLEdBQUcsQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUM5RCxPQUFPLHFCQUFxQixDQUFDLE1BQU0sUUFBUSxDQUFDLENBQUM7SUFDL0MsQ0FBQztJQUVELG9DQUFvQztJQUNwQyxLQUFLLENBQUMsT0FBTztRQUNYLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ3BDLENBQUM7SUFFRCwwQkFBMEI7SUFDMUIsS0FBSyxDQUFDLEtBQUs7UUFDVCxPQUFPLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNyQyxDQUFDO0lBRUQsd0JBQXdCO0lBQ3hCLEtBQUssQ0FBQyxJQUFJO1FBQ1IsT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDcEMsQ0FBQztJQUVELHFDQUFxQztJQUNyQyxLQUFLLENBQUMsU0FBUztRQUNiLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDO0lBQ3pDLENBQUM7SUFFRCxzQ0FBc0M7SUFDdEMsS0FBSyxDQUFDLFVBQVU7UUFDZCxNQUFNLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUUvQixJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDLG1CQUFtQixDQUFDLENBQUMsSUFBSSxJQUFJLEVBQUU7WUFDMUQsT0FBTyxRQUFRLENBQUM7U0FDakI7YUFBTSxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDLGlCQUFpQixDQUFDLENBQUMsSUFBSSxJQUFJLEVBQUU7WUFDL0QsT0FBTyxNQUFNLENBQUM7U0FDZjthQUFNLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxZQUFZLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxJQUFJLElBQUksRUFBRTtZQUMvRCxPQUFPLE1BQU0sQ0FBQztTQUNmO2FBQU0sSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLElBQUksSUFBSSxFQUFFO1lBQ2xFLE9BQU8sU0FBUyxDQUFDO1NBQ2xCO2FBQU0sSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLElBQUksRUFBRTtZQUN2RCxPQUFPLEtBQUssQ0FBQztTQUNkO2FBQU0sSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyxjQUFjLENBQUMsQ0FBQyxJQUFJLElBQUksRUFBRTtZQUM1RCxPQUFPLFVBQVUsQ0FBQztTQUNuQjtRQUVELE9BQU8sT0FBTyxDQUFDO0lBQ2pCLENBQUM7O0FBbkZELDZEQUE2RDtBQUM3RCw4REFBOEQ7QUFDdkQsbUNBQVksR0FBRzt5RUFDaUQsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NvbnRlbnRDb250YWluZXJDb21wb25lbnRIYXJuZXNzLCBIYXJuZXNzUHJlZGljYXRlfSBmcm9tICdAYW5ndWxhci9jZGsvdGVzdGluZyc7XG5pbXBvcnQge2NvZXJjZUJvb2xlYW5Qcm9wZXJ0eX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvZXJjaW9uJztcbmltcG9ydCB7QnV0dG9uSGFybmVzc0ZpbHRlcnMsIEJ1dHRvblZhcmlhbnR9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL2J1dHRvbi90ZXN0aW5nJztcblxuLyoqXG4gKiBIYXJuZXNzIGZvciBpbnRlcmFjdGluZyB3aXRoIGEgc3RhbmRhcmQgbWF0LWJ1dHRvbiBpbiB0ZXN0cy5cbiAqIEBkZXByZWNhdGVkIFVzZSBgTWF0QnV0dG9uSGFybmVzc2AgZnJvbSBgQGFuZ3VsYXIvbWF0ZXJpYWwvYnV0dG9uL3Rlc3RpbmdgIGluc3RlYWQuIFNlZSBodHRwczovL21hdGVyaWFsLmFuZ3VsYXIuaW8vZ3VpZGUvbWRjLW1pZ3JhdGlvbiBmb3IgaW5mb3JtYXRpb24gYWJvdXQgbWlncmF0aW5nLlxuICogQGJyZWFraW5nLWNoYW5nZSAxNy4wLjBcbiAqL1xuZXhwb3J0IGNsYXNzIE1hdExlZ2FjeUJ1dHRvbkhhcm5lc3MgZXh0ZW5kcyBDb250ZW50Q29udGFpbmVyQ29tcG9uZW50SGFybmVzcyB7XG4gIC8vIFRPRE8oamVsYm91cm4pIHVzZSBhIHNpbmdsZSBjbGFzcywgbGlrZSBgLm1hdC1idXR0b24tYmFzZWBcbiAgLyoqIFRoZSBzZWxlY3RvciBmb3IgdGhlIGhvc3QgZWxlbWVudCBvZiBhIGJ1dHRvbiBpbnN0YW5jZS4gKi9cbiAgc3RhdGljIGhvc3RTZWxlY3RvciA9IGBbbWF0LWJ1dHRvbl0sIFttYXQtcmFpc2VkLWJ1dHRvbl0sIFttYXQtZmxhdC1idXR0b25dLCBbbWF0LWljb24tYnV0dG9uXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICBbbWF0LXN0cm9rZWQtYnV0dG9uXSwgW21hdC1mYWJdLCBbbWF0LW1pbmktZmFiXWA7XG5cbiAgLyoqXG4gICAqIEdldHMgYSBgSGFybmVzc1ByZWRpY2F0ZWAgdGhhdCBjYW4gYmUgdXNlZCB0byBzZWFyY2ggZm9yIGEgYnV0dG9uIGhhcm5lc3MgdGhhdCBtZWV0c1xuICAgKiBjZXJ0YWluIGNyaXRlcmlhLlxuICAgKiBAcGFyYW0gb3B0aW9ucyBPcHRpb25zIGZvciBmaWx0ZXJpbmcgd2hpY2ggYnV0dG9uIGluc3RhbmNlcyBhcmUgY29uc2lkZXJlZCBhIG1hdGNoLlxuICAgKiBAcmV0dXJuIGEgYEhhcm5lc3NQcmVkaWNhdGVgIGNvbmZpZ3VyZWQgd2l0aCB0aGUgZ2l2ZW4gb3B0aW9ucy5cbiAgICovXG4gIHN0YXRpYyB3aXRoKG9wdGlvbnM6IEJ1dHRvbkhhcm5lc3NGaWx0ZXJzID0ge30pOiBIYXJuZXNzUHJlZGljYXRlPE1hdExlZ2FjeUJ1dHRvbkhhcm5lc3M+IHtcbiAgICByZXR1cm4gbmV3IEhhcm5lc3NQcmVkaWNhdGUoTWF0TGVnYWN5QnV0dG9uSGFybmVzcywgb3B0aW9ucylcbiAgICAgIC5hZGRPcHRpb24oJ3RleHQnLCBvcHRpb25zLnRleHQsIChoYXJuZXNzLCB0ZXh0KSA9PlxuICAgICAgICBIYXJuZXNzUHJlZGljYXRlLnN0cmluZ01hdGNoZXMoaGFybmVzcy5nZXRUZXh0KCksIHRleHQpLFxuICAgICAgKVxuICAgICAgLmFkZE9wdGlvbigndmFyaWFudCcsIG9wdGlvbnMudmFyaWFudCwgKGhhcm5lc3MsIHZhcmlhbnQpID0+XG4gICAgICAgIEhhcm5lc3NQcmVkaWNhdGUuc3RyaW5nTWF0Y2hlcyhoYXJuZXNzLmdldFZhcmlhbnQoKSwgdmFyaWFudCksXG4gICAgICApXG4gICAgICAuYWRkT3B0aW9uKCdkaXNhYmxlZCcsIG9wdGlvbnMuZGlzYWJsZWQsIGFzeW5jIChoYXJuZXNzLCBkaXNhYmxlZCkgPT4ge1xuICAgICAgICByZXR1cm4gKGF3YWl0IGhhcm5lc3MuaXNEaXNhYmxlZCgpKSA9PT0gZGlzYWJsZWQ7XG4gICAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbGlja3MgdGhlIGJ1dHRvbiBhdCB0aGUgZ2l2ZW4gcG9zaXRpb24gcmVsYXRpdmUgdG8gaXRzIHRvcC1sZWZ0LlxuICAgKiBAcGFyYW0gcmVsYXRpdmVYIFRoZSByZWxhdGl2ZSB4IHBvc2l0aW9uIG9mIHRoZSBjbGljay5cbiAgICogQHBhcmFtIHJlbGF0aXZlWSBUaGUgcmVsYXRpdmUgeSBwb3NpdGlvbiBvZiB0aGUgY2xpY2suXG4gICAqL1xuICBjbGljayhyZWxhdGl2ZVg6IG51bWJlciwgcmVsYXRpdmVZOiBudW1iZXIpOiBQcm9taXNlPHZvaWQ+O1xuICAvKiogQ2xpY2tzIHRoZSBidXR0b24gYXQgaXRzIGNlbnRlci4gKi9cbiAgY2xpY2sobG9jYXRpb246ICdjZW50ZXInKTogUHJvbWlzZTx2b2lkPjtcbiAgLyoqIENsaWNrcyB0aGUgYnV0dG9uLiAqL1xuICBjbGljaygpOiBQcm9taXNlPHZvaWQ+O1xuICBhc3luYyBjbGljayguLi5hcmdzOiBbXSB8IFsnY2VudGVyJ10gfCBbbnVtYmVyLCBudW1iZXJdKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLmhvc3QoKSkuY2xpY2soLi4uKGFyZ3MgYXMgW10pKTtcbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZSBidXR0b24gaXMgZGlzYWJsZWQuICovXG4gIGFzeW5jIGlzRGlzYWJsZWQoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3QgZGlzYWJsZWQgPSAoYXdhaXQgdGhpcy5ob3N0KCkpLmdldEF0dHJpYnV0ZSgnZGlzYWJsZWQnKTtcbiAgICByZXR1cm4gY29lcmNlQm9vbGVhblByb3BlcnR5KGF3YWl0IGRpc2FibGVkKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBidXR0b24ncyBsYWJlbCB0ZXh0LiAqL1xuICBhc3luYyBnZXRUZXh0KCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLmhvc3QoKSkudGV4dCgpO1xuICB9XG5cbiAgLyoqIEZvY3VzZXMgdGhlIGJ1dHRvbi4gKi9cbiAgYXN5bmMgZm9jdXMoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLmhvc3QoKSkuZm9jdXMoKTtcbiAgfVxuXG4gIC8qKiBCbHVycyB0aGUgYnV0dG9uLiAqL1xuICBhc3luYyBibHVyKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5ob3N0KCkpLmJsdXIoKTtcbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZSBidXR0b24gaXMgZm9jdXNlZC4gKi9cbiAgYXN5bmMgaXNGb2N1c2VkKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5ob3N0KCkpLmlzRm9jdXNlZCgpO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIHZhcmlhbnQgb2YgdGhlIGJ1dHRvbi4gKi9cbiAgYXN5bmMgZ2V0VmFyaWFudCgpOiBQcm9taXNlPEJ1dHRvblZhcmlhbnQ+IHtcbiAgICBjb25zdCBob3N0ID0gYXdhaXQgdGhpcy5ob3N0KCk7XG5cbiAgICBpZiAoKGF3YWl0IGhvc3QuZ2V0QXR0cmlidXRlKCdtYXQtcmFpc2VkLWJ1dHRvbicpKSAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gJ3JhaXNlZCc7XG4gICAgfSBlbHNlIGlmICgoYXdhaXQgaG9zdC5nZXRBdHRyaWJ1dGUoJ21hdC1mbGF0LWJ1dHRvbicpKSAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gJ2ZsYXQnO1xuICAgIH0gZWxzZSBpZiAoKGF3YWl0IGhvc3QuZ2V0QXR0cmlidXRlKCdtYXQtaWNvbi1idXR0b24nKSkgIT0gbnVsbCkge1xuICAgICAgcmV0dXJuICdpY29uJztcbiAgICB9IGVsc2UgaWYgKChhd2FpdCBob3N0LmdldEF0dHJpYnV0ZSgnbWF0LXN0cm9rZWQtYnV0dG9uJykpICE9IG51bGwpIHtcbiAgICAgIHJldHVybiAnc3Ryb2tlZCc7XG4gICAgfSBlbHNlIGlmICgoYXdhaXQgaG9zdC5nZXRBdHRyaWJ1dGUoJ21hdC1mYWInKSkgIT0gbnVsbCkge1xuICAgICAgcmV0dXJuICdmYWInO1xuICAgIH0gZWxzZSBpZiAoKGF3YWl0IGhvc3QuZ2V0QXR0cmlidXRlKCdtYXQtbWluaS1mYWInKSkgIT0gbnVsbCkge1xuICAgICAgcmV0dXJuICdtaW5pLWZhYic7XG4gICAgfVxuXG4gICAgcmV0dXJuICdiYXNpYyc7XG4gIH1cbn1cbiJdfQ==