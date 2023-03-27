/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
/** Harness for interacting with a standard mat-button-toggle in tests. */
export class MatButtonToggleHarness extends ComponentHarness {
    constructor() {
        super(...arguments);
        this._label = this.locatorFor('.mat-button-toggle-label-content');
        this._button = this.locatorFor('.mat-button-toggle-button');
    }
    /**
     * Gets a `HarnessPredicate` that can be used to search for a `MatButtonToggleHarness` that meets
     * certain criteria.
     * @param options Options for filtering which button toggle instances are considered a match.
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return new HarnessPredicate(MatButtonToggleHarness, options)
            .addOption('text', options.text, (harness, text) => HarnessPredicate.stringMatches(harness.getText(), text))
            .addOption('name', options.name, (harness, name) => HarnessPredicate.stringMatches(harness.getName(), name))
            .addOption('checked', options.checked, async (harness, checked) => (await harness.isChecked()) === checked)
            .addOption('disabled', options.disabled, async (harness, disabled) => {
            return (await harness.isDisabled()) === disabled;
        });
    }
    /** Gets a boolean promise indicating if the button toggle is checked. */
    async isChecked() {
        const checked = (await this._button()).getAttribute('aria-pressed');
        return coerceBooleanProperty(await checked);
    }
    /** Gets a boolean promise indicating if the button toggle is disabled. */
    async isDisabled() {
        const disabled = (await this._button()).getAttribute('disabled');
        return coerceBooleanProperty(await disabled);
    }
    /** Gets a promise for the button toggle's name. */
    async getName() {
        return (await this._button()).getAttribute('name');
    }
    /** Gets a promise for the button toggle's aria-label. */
    async getAriaLabel() {
        return (await this._button()).getAttribute('aria-label');
    }
    /** Gets a promise for the button toggles's aria-labelledby. */
    async getAriaLabelledby() {
        return (await this._button()).getAttribute('aria-labelledby');
    }
    /** Gets a promise for the button toggle's text. */
    async getText() {
        return (await this._label()).text();
    }
    /** Gets the appearance that the button toggle is using. */
    async getAppearance() {
        const host = await this.host();
        const className = 'mat-button-toggle-appearance-standard';
        return (await host.hasClass(className)) ? 'standard' : 'legacy';
    }
    /** Focuses the toggle. */
    async focus() {
        return (await this._button()).focus();
    }
    /** Blurs the toggle. */
    async blur() {
        return (await this._button()).blur();
    }
    /** Whether the toggle is focused. */
    async isFocused() {
        return (await this._button()).isFocused();
    }
    /** Toggle the checked state of the buttons toggle. */
    async toggle() {
        return (await this._button()).click();
    }
    /**
     * Puts the button toggle in a checked state by toggling it if it's
     * currently unchecked, or doing nothing if it is already checked.
     */
    async check() {
        if (!(await this.isChecked())) {
            await this.toggle();
        }
    }
    /**
     * Puts the button toggle in an unchecked state by toggling it if it's
     * currently checked, or doing nothing if it's already unchecked.
     */
    async uncheck() {
        if (await this.isChecked()) {
            await this.toggle();
        }
    }
}
/** The selector for the host element of a `MatButton` instance. */
MatButtonToggleHarness.hostSelector = '.mat-button-toggle';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnV0dG9uLXRvZ2dsZS1oYXJuZXNzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL2J1dHRvbi10b2dnbGUvdGVzdGluZy9idXR0b24tdG9nZ2xlLWhhcm5lc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLGdCQUFnQixFQUFFLGdCQUFnQixFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFDeEUsT0FBTyxFQUFDLHFCQUFxQixFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFJNUQsMEVBQTBFO0FBQzFFLE1BQU0sT0FBTyxzQkFBdUIsU0FBUSxnQkFBZ0I7SUFBNUQ7O1FBSVUsV0FBTSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsa0NBQWtDLENBQUMsQ0FBQztRQUM3RCxZQUFPLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO0lBd0dqRSxDQUFDO0lBdEdDOzs7OztPQUtHO0lBQ0gsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFzQyxFQUFFO1FBQ2xELE9BQU8sSUFBSSxnQkFBZ0IsQ0FBQyxzQkFBc0IsRUFBRSxPQUFPLENBQUM7YUFDekQsU0FBUyxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxFQUFFLENBQ2pELGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQ3hEO2FBQ0EsU0FBUyxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxFQUFFLENBQ2pELGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQ3hEO2FBQ0EsU0FBUyxDQUNSLFNBQVMsRUFDVCxPQUFPLENBQUMsT0FBTyxFQUNmLEtBQUssRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDLE1BQU0sT0FBTyxDQUFDLFNBQVMsRUFBRSxDQUFDLEtBQUssT0FBTyxDQUNwRTthQUNBLFNBQVMsQ0FBQyxVQUFVLEVBQUUsT0FBTyxDQUFDLFFBQVEsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxFQUFFO1lBQ25FLE9BQU8sQ0FBQyxNQUFNLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxLQUFLLFFBQVEsQ0FBQztRQUNuRCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCx5RUFBeUU7SUFDekUsS0FBSyxDQUFDLFNBQVM7UUFDYixNQUFNLE9BQU8sR0FBRyxDQUFDLE1BQU0sSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsWUFBWSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ3BFLE9BQU8scUJBQXFCLENBQUMsTUFBTSxPQUFPLENBQUMsQ0FBQztJQUM5QyxDQUFDO0lBRUQsMEVBQTBFO0lBQzFFLEtBQUssQ0FBQyxVQUFVO1FBQ2QsTUFBTSxRQUFRLEdBQUcsQ0FBQyxNQUFNLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNqRSxPQUFPLHFCQUFxQixDQUFDLE1BQU0sUUFBUSxDQUFDLENBQUM7SUFDL0MsQ0FBQztJQUVELG1EQUFtRDtJQUNuRCxLQUFLLENBQUMsT0FBTztRQUNYLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNyRCxDQUFDO0lBRUQseURBQXlEO0lBQ3pELEtBQUssQ0FBQyxZQUFZO1FBQ2hCLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLFlBQVksQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUMzRCxDQUFDO0lBRUQsK0RBQStEO0lBQy9ELEtBQUssQ0FBQyxpQkFBaUI7UUFDckIsT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsWUFBWSxDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFDaEUsQ0FBQztJQUVELG1EQUFtRDtJQUNuRCxLQUFLLENBQUMsT0FBTztRQUNYLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ3RDLENBQUM7SUFFRCwyREFBMkQ7SUFDM0QsS0FBSyxDQUFDLGFBQWE7UUFDakIsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDL0IsTUFBTSxTQUFTLEdBQUcsdUNBQXVDLENBQUM7UUFDMUQsT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQztJQUNsRSxDQUFDO0lBRUQsMEJBQTBCO0lBQzFCLEtBQUssQ0FBQyxLQUFLO1FBQ1QsT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDeEMsQ0FBQztJQUVELHdCQUF3QjtJQUN4QixLQUFLLENBQUMsSUFBSTtRQUNSLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ3ZDLENBQUM7SUFFRCxxQ0FBcUM7SUFDckMsS0FBSyxDQUFDLFNBQVM7UUFDYixPQUFPLENBQUMsTUFBTSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUM1QyxDQUFDO0lBRUQsc0RBQXNEO0lBQ3RELEtBQUssQ0FBQyxNQUFNO1FBQ1YsT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDeEMsQ0FBQztJQUVEOzs7T0FHRztJQUNILEtBQUssQ0FBQyxLQUFLO1FBQ1QsSUFBSSxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsRUFBRTtZQUM3QixNQUFNLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztTQUNyQjtJQUNILENBQUM7SUFFRDs7O09BR0c7SUFDSCxLQUFLLENBQUMsT0FBTztRQUNYLElBQUksTUFBTSxJQUFJLENBQUMsU0FBUyxFQUFFLEVBQUU7WUFDMUIsTUFBTSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7U0FDckI7SUFDSCxDQUFDOztBQTNHRCxtRUFBbUU7QUFDNUQsbUNBQVksR0FBRyxvQkFBb0IsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NvbXBvbmVudEhhcm5lc3MsIEhhcm5lc3NQcmVkaWNhdGV9IGZyb20gJ0Bhbmd1bGFyL2Nkay90ZXN0aW5nJztcbmltcG9ydCB7Y29lcmNlQm9vbGVhblByb3BlcnR5fSBmcm9tICdAYW5ndWxhci9jZGsvY29lcmNpb24nO1xuaW1wb3J0IHtNYXRCdXR0b25Ub2dnbGVBcHBlYXJhbmNlfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9idXR0b24tdG9nZ2xlJztcbmltcG9ydCB7QnV0dG9uVG9nZ2xlSGFybmVzc0ZpbHRlcnN9IGZyb20gJy4vYnV0dG9uLXRvZ2dsZS1oYXJuZXNzLWZpbHRlcnMnO1xuXG4vKiogSGFybmVzcyBmb3IgaW50ZXJhY3Rpbmcgd2l0aCBhIHN0YW5kYXJkIG1hdC1idXR0b24tdG9nZ2xlIGluIHRlc3RzLiAqL1xuZXhwb3J0IGNsYXNzIE1hdEJ1dHRvblRvZ2dsZUhhcm5lc3MgZXh0ZW5kcyBDb21wb25lbnRIYXJuZXNzIHtcbiAgLyoqIFRoZSBzZWxlY3RvciBmb3IgdGhlIGhvc3QgZWxlbWVudCBvZiBhIGBNYXRCdXR0b25gIGluc3RhbmNlLiAqL1xuICBzdGF0aWMgaG9zdFNlbGVjdG9yID0gJy5tYXQtYnV0dG9uLXRvZ2dsZSc7XG5cbiAgcHJpdmF0ZSBfbGFiZWwgPSB0aGlzLmxvY2F0b3JGb3IoJy5tYXQtYnV0dG9uLXRvZ2dsZS1sYWJlbC1jb250ZW50Jyk7XG4gIHByaXZhdGUgX2J1dHRvbiA9IHRoaXMubG9jYXRvckZvcignLm1hdC1idXR0b24tdG9nZ2xlLWJ1dHRvbicpO1xuXG4gIC8qKlxuICAgKiBHZXRzIGEgYEhhcm5lc3NQcmVkaWNhdGVgIHRoYXQgY2FuIGJlIHVzZWQgdG8gc2VhcmNoIGZvciBhIGBNYXRCdXR0b25Ub2dnbGVIYXJuZXNzYCB0aGF0IG1lZXRzXG4gICAqIGNlcnRhaW4gY3JpdGVyaWEuXG4gICAqIEBwYXJhbSBvcHRpb25zIE9wdGlvbnMgZm9yIGZpbHRlcmluZyB3aGljaCBidXR0b24gdG9nZ2xlIGluc3RhbmNlcyBhcmUgY29uc2lkZXJlZCBhIG1hdGNoLlxuICAgKiBAcmV0dXJuIGEgYEhhcm5lc3NQcmVkaWNhdGVgIGNvbmZpZ3VyZWQgd2l0aCB0aGUgZ2l2ZW4gb3B0aW9ucy5cbiAgICovXG4gIHN0YXRpYyB3aXRoKG9wdGlvbnM6IEJ1dHRvblRvZ2dsZUhhcm5lc3NGaWx0ZXJzID0ge30pOiBIYXJuZXNzUHJlZGljYXRlPE1hdEJ1dHRvblRvZ2dsZUhhcm5lc3M+IHtcbiAgICByZXR1cm4gbmV3IEhhcm5lc3NQcmVkaWNhdGUoTWF0QnV0dG9uVG9nZ2xlSGFybmVzcywgb3B0aW9ucylcbiAgICAgIC5hZGRPcHRpb24oJ3RleHQnLCBvcHRpb25zLnRleHQsIChoYXJuZXNzLCB0ZXh0KSA9PlxuICAgICAgICBIYXJuZXNzUHJlZGljYXRlLnN0cmluZ01hdGNoZXMoaGFybmVzcy5nZXRUZXh0KCksIHRleHQpLFxuICAgICAgKVxuICAgICAgLmFkZE9wdGlvbignbmFtZScsIG9wdGlvbnMubmFtZSwgKGhhcm5lc3MsIG5hbWUpID0+XG4gICAgICAgIEhhcm5lc3NQcmVkaWNhdGUuc3RyaW5nTWF0Y2hlcyhoYXJuZXNzLmdldE5hbWUoKSwgbmFtZSksXG4gICAgICApXG4gICAgICAuYWRkT3B0aW9uKFxuICAgICAgICAnY2hlY2tlZCcsXG4gICAgICAgIG9wdGlvbnMuY2hlY2tlZCxcbiAgICAgICAgYXN5bmMgKGhhcm5lc3MsIGNoZWNrZWQpID0+IChhd2FpdCBoYXJuZXNzLmlzQ2hlY2tlZCgpKSA9PT0gY2hlY2tlZCxcbiAgICAgIClcbiAgICAgIC5hZGRPcHRpb24oJ2Rpc2FibGVkJywgb3B0aW9ucy5kaXNhYmxlZCwgYXN5bmMgKGhhcm5lc3MsIGRpc2FibGVkKSA9PiB7XG4gICAgICAgIHJldHVybiAoYXdhaXQgaGFybmVzcy5pc0Rpc2FibGVkKCkpID09PSBkaXNhYmxlZDtcbiAgICAgIH0pO1xuICB9XG5cbiAgLyoqIEdldHMgYSBib29sZWFuIHByb21pc2UgaW5kaWNhdGluZyBpZiB0aGUgYnV0dG9uIHRvZ2dsZSBpcyBjaGVja2VkLiAqL1xuICBhc3luYyBpc0NoZWNrZWQoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3QgY2hlY2tlZCA9IChhd2FpdCB0aGlzLl9idXR0b24oKSkuZ2V0QXR0cmlidXRlKCdhcmlhLXByZXNzZWQnKTtcbiAgICByZXR1cm4gY29lcmNlQm9vbGVhblByb3BlcnR5KGF3YWl0IGNoZWNrZWQpO1xuICB9XG5cbiAgLyoqIEdldHMgYSBib29sZWFuIHByb21pc2UgaW5kaWNhdGluZyBpZiB0aGUgYnV0dG9uIHRvZ2dsZSBpcyBkaXNhYmxlZC4gKi9cbiAgYXN5bmMgaXNEaXNhYmxlZCgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCBkaXNhYmxlZCA9IChhd2FpdCB0aGlzLl9idXR0b24oKSkuZ2V0QXR0cmlidXRlKCdkaXNhYmxlZCcpO1xuICAgIHJldHVybiBjb2VyY2VCb29sZWFuUHJvcGVydHkoYXdhaXQgZGlzYWJsZWQpO1xuICB9XG5cbiAgLyoqIEdldHMgYSBwcm9taXNlIGZvciB0aGUgYnV0dG9uIHRvZ2dsZSdzIG5hbWUuICovXG4gIGFzeW5jIGdldE5hbWUoKTogUHJvbWlzZTxzdHJpbmcgfCBudWxsPiB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLl9idXR0b24oKSkuZ2V0QXR0cmlidXRlKCduYW1lJyk7XG4gIH1cblxuICAvKiogR2V0cyBhIHByb21pc2UgZm9yIHRoZSBidXR0b24gdG9nZ2xlJ3MgYXJpYS1sYWJlbC4gKi9cbiAgYXN5bmMgZ2V0QXJpYUxhYmVsKCk6IFByb21pc2U8c3RyaW5nIHwgbnVsbD4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5fYnV0dG9uKCkpLmdldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbCcpO1xuICB9XG5cbiAgLyoqIEdldHMgYSBwcm9taXNlIGZvciB0aGUgYnV0dG9uIHRvZ2dsZXMncyBhcmlhLWxhYmVsbGVkYnkuICovXG4gIGFzeW5jIGdldEFyaWFMYWJlbGxlZGJ5KCk6IFByb21pc2U8c3RyaW5nIHwgbnVsbD4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5fYnV0dG9uKCkpLmdldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbGxlZGJ5Jyk7XG4gIH1cblxuICAvKiogR2V0cyBhIHByb21pc2UgZm9yIHRoZSBidXR0b24gdG9nZ2xlJ3MgdGV4dC4gKi9cbiAgYXN5bmMgZ2V0VGV4dCgpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5fbGFiZWwoKSkudGV4dCgpO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIGFwcGVhcmFuY2UgdGhhdCB0aGUgYnV0dG9uIHRvZ2dsZSBpcyB1c2luZy4gKi9cbiAgYXN5bmMgZ2V0QXBwZWFyYW5jZSgpOiBQcm9taXNlPE1hdEJ1dHRvblRvZ2dsZUFwcGVhcmFuY2U+IHtcbiAgICBjb25zdCBob3N0ID0gYXdhaXQgdGhpcy5ob3N0KCk7XG4gICAgY29uc3QgY2xhc3NOYW1lID0gJ21hdC1idXR0b24tdG9nZ2xlLWFwcGVhcmFuY2Utc3RhbmRhcmQnO1xuICAgIHJldHVybiAoYXdhaXQgaG9zdC5oYXNDbGFzcyhjbGFzc05hbWUpKSA/ICdzdGFuZGFyZCcgOiAnbGVnYWN5JztcbiAgfVxuXG4gIC8qKiBGb2N1c2VzIHRoZSB0b2dnbGUuICovXG4gIGFzeW5jIGZvY3VzKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5fYnV0dG9uKCkpLmZvY3VzKCk7XG4gIH1cblxuICAvKiogQmx1cnMgdGhlIHRvZ2dsZS4gKi9cbiAgYXN5bmMgYmx1cigpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuX2J1dHRvbigpKS5ibHVyKCk7XG4gIH1cblxuICAvKiogV2hldGhlciB0aGUgdG9nZ2xlIGlzIGZvY3VzZWQuICovXG4gIGFzeW5jIGlzRm9jdXNlZCgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuX2J1dHRvbigpKS5pc0ZvY3VzZWQoKTtcbiAgfVxuXG4gIC8qKiBUb2dnbGUgdGhlIGNoZWNrZWQgc3RhdGUgb2YgdGhlIGJ1dHRvbnMgdG9nZ2xlLiAqL1xuICBhc3luYyB0b2dnbGUoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLl9idXR0b24oKSkuY2xpY2soKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQdXRzIHRoZSBidXR0b24gdG9nZ2xlIGluIGEgY2hlY2tlZCBzdGF0ZSBieSB0b2dnbGluZyBpdCBpZiBpdCdzXG4gICAqIGN1cnJlbnRseSB1bmNoZWNrZWQsIG9yIGRvaW5nIG5vdGhpbmcgaWYgaXQgaXMgYWxyZWFkeSBjaGVja2VkLlxuICAgKi9cbiAgYXN5bmMgY2hlY2soKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKCEoYXdhaXQgdGhpcy5pc0NoZWNrZWQoKSkpIHtcbiAgICAgIGF3YWl0IHRoaXMudG9nZ2xlKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFB1dHMgdGhlIGJ1dHRvbiB0b2dnbGUgaW4gYW4gdW5jaGVja2VkIHN0YXRlIGJ5IHRvZ2dsaW5nIGl0IGlmIGl0J3NcbiAgICogY3VycmVudGx5IGNoZWNrZWQsIG9yIGRvaW5nIG5vdGhpbmcgaWYgaXQncyBhbHJlYWR5IHVuY2hlY2tlZC5cbiAgICovXG4gIGFzeW5jIHVuY2hlY2soKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKGF3YWl0IHRoaXMuaXNDaGVja2VkKCkpIHtcbiAgICAgIGF3YWl0IHRoaXMudG9nZ2xlKCk7XG4gICAgfVxuICB9XG59XG4iXX0=