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
import { MatOptgroupHarness, MatOptionHarness } from '@angular/material/core/testing';
export class _MatAutocompleteHarnessBase extends ComponentHarness {
    constructor() {
        super(...arguments);
        this._documentRootLocator = this.documentRootLocatorFactory();
    }
    /** Gets the value of the autocomplete input. */
    getValue() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).getProperty('value');
        });
    }
    /** Whether the autocomplete input is disabled. */
    isDisabled() {
        return __awaiter(this, void 0, void 0, function* () {
            const disabled = (yield this.host()).getAttribute('disabled');
            return coerceBooleanProperty(yield disabled);
        });
    }
    /** Focuses the autocomplete input. */
    focus() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).focus();
        });
    }
    /** Blurs the autocomplete input. */
    blur() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).blur();
        });
    }
    /** Whether the autocomplete input is focused. */
    isFocused() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).isFocused();
        });
    }
    /** Enters text into the autocomplete. */
    enterText(value) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).sendKeys(value);
        });
    }
    /** Gets the options inside the autocomplete panel. */
    getOptions(filters) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._documentRootLocator.locatorForAll(this._optionClass.with(Object.assign(Object.assign({}, (filters || {})), { ancestor: yield this._getPanelSelector() })))();
        });
    }
    /** Gets the option groups inside the autocomplete panel. */
    getOptionGroups(filters) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._documentRootLocator.locatorForAll(this._optionGroupClass.with(Object.assign(Object.assign({}, (filters || {})), { ancestor: yield this._getPanelSelector() })))();
        });
    }
    /** Selects the first option matching the given filters. */
    selectOption(filters) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.focus(); // Focus the input to make sure the autocomplete panel is shown.
            const options = yield this.getOptions(filters);
            if (!options.length) {
                throw Error(`Could not find a mat-option matching ${JSON.stringify(filters)}`);
            }
            yield options[0].click();
        });
    }
    /** Whether the autocomplete is open. */
    isOpen() {
        return __awaiter(this, void 0, void 0, function* () {
            const panel = yield this._getPanel();
            return !!panel && (yield panel.hasClass(`${this._prefix}-autocomplete-visible`));
        });
    }
    /** Gets the panel associated with this autocomplete trigger. */
    _getPanel() {
        return __awaiter(this, void 0, void 0, function* () {
            // Technically this is static, but it needs to be in a
            // function, because the autocomplete's panel ID can changed.
            return this._documentRootLocator.locatorForOptional(yield this._getPanelSelector())();
        });
    }
    /** Gets the selector that can be used to find the autocomplete trigger's panel. */
    _getPanelSelector() {
        return __awaiter(this, void 0, void 0, function* () {
            return `#${(yield (yield this.host()).getAttribute('aria-owns'))}`;
        });
    }
}
/** Harness for interacting with a standard mat-autocomplete in tests. */
export class MatAutocompleteHarness extends _MatAutocompleteHarnessBase {
    constructor() {
        super(...arguments);
        this._prefix = 'mat';
        this._optionClass = MatOptionHarness;
        this._optionGroupClass = MatOptgroupHarness;
    }
    /**
     * Gets a `HarnessPredicate` that can be used to search for a `MatAutocompleteHarness` that meets
     * certain criteria.
     * @param options Options for filtering which autocomplete instances are considered a match.
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return new HarnessPredicate(MatAutocompleteHarness, options)
            .addOption('value', options.value, (harness, value) => HarnessPredicate.stringMatches(harness.getValue(), value));
    }
}
/** The selector for the host element of a `MatAutocomplete` instance. */
MatAutocompleteHarness.hostSelector = '.mat-autocomplete-trigger';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0b2NvbXBsZXRlLWhhcm5lc3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvYXV0b2NvbXBsZXRlL3Rlc3RpbmcvYXV0b2NvbXBsZXRlLWhhcm5lc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUVILE9BQU8sRUFBQyxxQkFBcUIsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQzVELE9BQU8sRUFFTCxnQkFBZ0IsRUFFaEIsZ0JBQWdCLEdBQ2pCLE1BQU0sc0JBQXNCLENBQUM7QUFDOUIsT0FBTyxFQUNMLGtCQUFrQixFQUNsQixnQkFBZ0IsRUFHakIsTUFBTSxnQ0FBZ0MsQ0FBQztBQUd4QyxNQUFNLE9BQWdCLDJCQVNwQixTQUFRLGdCQUFnQjtJQVQxQjs7UUFVVSx5QkFBb0IsR0FBRyxJQUFJLENBQUMsMEJBQTBCLEVBQUUsQ0FBQztJQStFbkUsQ0FBQztJQTFFQyxnREFBZ0Q7SUFDMUMsUUFBUTs7WUFDWixPQUFPLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDbEQsQ0FBQztLQUFBO0lBRUQsa0RBQWtEO0lBQzVDLFVBQVU7O1lBQ2QsTUFBTSxRQUFRLEdBQUcsQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUM5RCxPQUFPLHFCQUFxQixDQUFDLE1BQU0sUUFBUSxDQUFDLENBQUM7UUFDL0MsQ0FBQztLQUFBO0lBRUQsc0NBQXNDO0lBQ2hDLEtBQUs7O1lBQ1QsT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDckMsQ0FBQztLQUFBO0lBRUQsb0NBQW9DO0lBQzlCLElBQUk7O1lBQ1IsT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDcEMsQ0FBQztLQUFBO0lBRUQsaURBQWlEO0lBQzNDLFNBQVM7O1lBQ2IsT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDekMsQ0FBQztLQUFBO0lBRUQseUNBQXlDO0lBQ25DLFNBQVMsQ0FBQyxLQUFhOztZQUMzQixPQUFPLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDN0MsQ0FBQztLQUFBO0lBRUQsc0RBQXNEO0lBQ2hELFVBQVUsQ0FBQyxPQUF5Qzs7WUFDeEQsT0FBTyxJQUFJLENBQUMsb0JBQW9CLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLGdDQUNqRSxDQUFDLE9BQU8sSUFBSSxFQUFFLENBQUMsS0FDbEIsUUFBUSxFQUFFLE1BQU0sSUFBSSxDQUFDLGlCQUFpQixFQUFFLEdBQ3hCLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDekIsQ0FBQztLQUFBO0lBRUQsNERBQTREO0lBQ3RELGVBQWUsQ0FBQyxPQUE4Qzs7WUFDbEUsT0FBTyxJQUFJLENBQUMsb0JBQW9CLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsZ0NBQ3RFLENBQUMsT0FBTyxJQUFJLEVBQUUsQ0FBQyxLQUNsQixRQUFRLEVBQUUsTUFBTSxJQUFJLENBQUMsaUJBQWlCLEVBQUUsR0FDbkIsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUM5QixDQUFDO0tBQUE7SUFFRCwyREFBMkQ7SUFDckQsWUFBWSxDQUFDLE9BQXNCOztZQUN2QyxNQUFNLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLGdFQUFnRTtZQUNwRixNQUFNLE9BQU8sR0FBRyxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDL0MsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUU7Z0JBQ25CLE1BQU0sS0FBSyxDQUFDLHdDQUF3QyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQzthQUNoRjtZQUNELE1BQU0sT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQzNCLENBQUM7S0FBQTtJQUVELHdDQUF3QztJQUNsQyxNQUFNOztZQUNWLE1BQU0sS0FBSyxHQUFHLE1BQU0sSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ3JDLE9BQU8sQ0FBQyxDQUFDLEtBQUssS0FBSSxNQUFNLEtBQUssQ0FBQyxRQUFRLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyx1QkFBdUIsQ0FBQyxDQUFBLENBQUM7UUFDakYsQ0FBQztLQUFBO0lBRUQsZ0VBQWdFO0lBQ2xELFNBQVM7O1lBQ3JCLHNEQUFzRDtZQUN0RCw2REFBNkQ7WUFDN0QsT0FBTyxJQUFJLENBQUMsb0JBQW9CLENBQUMsa0JBQWtCLENBQUMsTUFBTSxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDeEYsQ0FBQztLQUFBO0lBRUQsbUZBQW1GO0lBQ3JFLGlCQUFpQjs7WUFDN0IsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUNyRSxDQUFDO0tBQUE7Q0FDRjtBQUVELHlFQUF5RTtBQUN6RSxNQUFNLE9BQU8sc0JBQXVCLFNBQVEsMkJBRzNDO0lBSEQ7O1FBSVksWUFBTyxHQUFHLEtBQUssQ0FBQztRQUNoQixpQkFBWSxHQUFHLGdCQUFnQixDQUFDO1FBQ2hDLHNCQUFpQixHQUFHLGtCQUFrQixDQUFDO0lBZ0JuRCxDQUFDO0lBWEM7Ozs7O09BS0c7SUFDSCxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQXNDLEVBQUU7UUFDbEQsT0FBTyxJQUFJLGdCQUFnQixDQUFDLHNCQUFzQixFQUFFLE9BQU8sQ0FBQzthQUN2RCxTQUFTLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxLQUFLLEVBQzdCLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3pGLENBQUM7O0FBYkQseUVBQXlFO0FBQ2xFLG1DQUFZLEdBQUcsMkJBQTJCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtjb2VyY2VCb29sZWFuUHJvcGVydHl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2VyY2lvbic7XG5pbXBvcnQge1xuICBCYXNlSGFybmVzc0ZpbHRlcnMsXG4gIENvbXBvbmVudEhhcm5lc3MsXG4gIENvbXBvbmVudEhhcm5lc3NDb25zdHJ1Y3RvcixcbiAgSGFybmVzc1ByZWRpY2F0ZSxcbn0gZnJvbSAnQGFuZ3VsYXIvY2RrL3Rlc3RpbmcnO1xuaW1wb3J0IHtcbiAgTWF0T3B0Z3JvdXBIYXJuZXNzLFxuICBNYXRPcHRpb25IYXJuZXNzLFxuICBPcHRncm91cEhhcm5lc3NGaWx0ZXJzLFxuICBPcHRpb25IYXJuZXNzRmlsdGVyc1xufSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9jb3JlL3Rlc3RpbmcnO1xuaW1wb3J0IHtBdXRvY29tcGxldGVIYXJuZXNzRmlsdGVyc30gZnJvbSAnLi9hdXRvY29tcGxldGUtaGFybmVzcy1maWx0ZXJzJztcblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIF9NYXRBdXRvY29tcGxldGVIYXJuZXNzQmFzZTxcbiAgT3B0aW9uVHlwZSBleHRlbmRzIChDb21wb25lbnRIYXJuZXNzQ29uc3RydWN0b3I8T3B0aW9uPiAmIHtcbiAgICB3aXRoOiAob3B0aW9ucz86IE9wdGlvbkZpbHRlcnMpID0+IEhhcm5lc3NQcmVkaWNhdGU8T3B0aW9uPn0pLFxuICBPcHRpb24gZXh0ZW5kcyBDb21wb25lbnRIYXJuZXNzICYge2NsaWNrKCk6IFByb21pc2U8dm9pZD59LFxuICBPcHRpb25GaWx0ZXJzIGV4dGVuZHMgQmFzZUhhcm5lc3NGaWx0ZXJzLFxuICBPcHRpb25Hcm91cFR5cGUgZXh0ZW5kcyAoQ29tcG9uZW50SGFybmVzc0NvbnN0cnVjdG9yPE9wdGlvbkdyb3VwPiAmIHtcbiAgICB3aXRoOiAob3B0aW9ucz86IE9wdGlvbkdyb3VwRmlsdGVycykgPT4gSGFybmVzc1ByZWRpY2F0ZTxPcHRpb25Hcm91cD59KSxcbiAgT3B0aW9uR3JvdXAgZXh0ZW5kcyBDb21wb25lbnRIYXJuZXNzLFxuICBPcHRpb25Hcm91cEZpbHRlcnMgZXh0ZW5kcyBCYXNlSGFybmVzc0ZpbHRlcnNcbj4gZXh0ZW5kcyBDb21wb25lbnRIYXJuZXNzIHtcbiAgcHJpdmF0ZSBfZG9jdW1lbnRSb290TG9jYXRvciA9IHRoaXMuZG9jdW1lbnRSb290TG9jYXRvckZhY3RvcnkoKTtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IF9wcmVmaXg6IHN0cmluZztcbiAgcHJvdGVjdGVkIGFic3RyYWN0IF9vcHRpb25DbGFzczogT3B0aW9uVHlwZTtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IF9vcHRpb25Hcm91cENsYXNzOiBPcHRpb25Hcm91cFR5cGU7XG5cbiAgLyoqIEdldHMgdGhlIHZhbHVlIG9mIHRoZSBhdXRvY29tcGxldGUgaW5wdXQuICovXG4gIGFzeW5jIGdldFZhbHVlKCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLmhvc3QoKSkuZ2V0UHJvcGVydHkoJ3ZhbHVlJyk7XG4gIH1cblxuICAvKiogV2hldGhlciB0aGUgYXV0b2NvbXBsZXRlIGlucHV0IGlzIGRpc2FibGVkLiAqL1xuICBhc3luYyBpc0Rpc2FibGVkKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IGRpc2FibGVkID0gKGF3YWl0IHRoaXMuaG9zdCgpKS5nZXRBdHRyaWJ1dGUoJ2Rpc2FibGVkJyk7XG4gICAgcmV0dXJuIGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eShhd2FpdCBkaXNhYmxlZCk7XG4gIH1cblxuICAvKiogRm9jdXNlcyB0aGUgYXV0b2NvbXBsZXRlIGlucHV0LiAqL1xuICBhc3luYyBmb2N1cygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuaG9zdCgpKS5mb2N1cygpO1xuICB9XG5cbiAgLyoqIEJsdXJzIHRoZSBhdXRvY29tcGxldGUgaW5wdXQuICovXG4gIGFzeW5jIGJsdXIoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLmhvc3QoKSkuYmx1cigpO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGF1dG9jb21wbGV0ZSBpbnB1dCBpcyBmb2N1c2VkLiAqL1xuICBhc3luYyBpc0ZvY3VzZWQoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLmhvc3QoKSkuaXNGb2N1c2VkKCk7XG4gIH1cblxuICAvKiogRW50ZXJzIHRleHQgaW50byB0aGUgYXV0b2NvbXBsZXRlLiAqL1xuICBhc3luYyBlbnRlclRleHQodmFsdWU6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5ob3N0KCkpLnNlbmRLZXlzKHZhbHVlKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBvcHRpb25zIGluc2lkZSB0aGUgYXV0b2NvbXBsZXRlIHBhbmVsLiAqL1xuICBhc3luYyBnZXRPcHRpb25zKGZpbHRlcnM/OiBPbWl0PE9wdGlvbkZpbHRlcnMsICdhbmNlc3Rvcic+KTogUHJvbWlzZTxPcHRpb25bXT4ge1xuICAgIHJldHVybiB0aGlzLl9kb2N1bWVudFJvb3RMb2NhdG9yLmxvY2F0b3JGb3JBbGwodGhpcy5fb3B0aW9uQ2xhc3Mud2l0aCh7XG4gICAgICAuLi4oZmlsdGVycyB8fCB7fSksXG4gICAgICBhbmNlc3RvcjogYXdhaXQgdGhpcy5fZ2V0UGFuZWxTZWxlY3RvcigpXG4gICAgfSBhcyBPcHRpb25GaWx0ZXJzKSkoKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBvcHRpb24gZ3JvdXBzIGluc2lkZSB0aGUgYXV0b2NvbXBsZXRlIHBhbmVsLiAqL1xuICBhc3luYyBnZXRPcHRpb25Hcm91cHMoZmlsdGVycz86IE9taXQ8T3B0aW9uR3JvdXBGaWx0ZXJzLCAnYW5jZXN0b3InPik6IFByb21pc2U8T3B0aW9uR3JvdXBbXT4ge1xuICAgIHJldHVybiB0aGlzLl9kb2N1bWVudFJvb3RMb2NhdG9yLmxvY2F0b3JGb3JBbGwodGhpcy5fb3B0aW9uR3JvdXBDbGFzcy53aXRoKHtcbiAgICAgIC4uLihmaWx0ZXJzIHx8IHt9KSxcbiAgICAgIGFuY2VzdG9yOiBhd2FpdCB0aGlzLl9nZXRQYW5lbFNlbGVjdG9yKClcbiAgICB9IGFzIE9wdGlvbkdyb3VwRmlsdGVycykpKCk7XG4gIH1cblxuICAvKiogU2VsZWN0cyB0aGUgZmlyc3Qgb3B0aW9uIG1hdGNoaW5nIHRoZSBnaXZlbiBmaWx0ZXJzLiAqL1xuICBhc3luYyBzZWxlY3RPcHRpb24oZmlsdGVyczogT3B0aW9uRmlsdGVycyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMuZm9jdXMoKTsgLy8gRm9jdXMgdGhlIGlucHV0IHRvIG1ha2Ugc3VyZSB0aGUgYXV0b2NvbXBsZXRlIHBhbmVsIGlzIHNob3duLlxuICAgIGNvbnN0IG9wdGlvbnMgPSBhd2FpdCB0aGlzLmdldE9wdGlvbnMoZmlsdGVycyk7XG4gICAgaWYgKCFvcHRpb25zLmxlbmd0aCkge1xuICAgICAgdGhyb3cgRXJyb3IoYENvdWxkIG5vdCBmaW5kIGEgbWF0LW9wdGlvbiBtYXRjaGluZyAke0pTT04uc3RyaW5naWZ5KGZpbHRlcnMpfWApO1xuICAgIH1cbiAgICBhd2FpdCBvcHRpb25zWzBdLmNsaWNrKCk7XG4gIH1cblxuICAvKiogV2hldGhlciB0aGUgYXV0b2NvbXBsZXRlIGlzIG9wZW4uICovXG4gIGFzeW5jIGlzT3BlbigpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCBwYW5lbCA9IGF3YWl0IHRoaXMuX2dldFBhbmVsKCk7XG4gICAgcmV0dXJuICEhcGFuZWwgJiYgYXdhaXQgcGFuZWwuaGFzQ2xhc3MoYCR7dGhpcy5fcHJlZml4fS1hdXRvY29tcGxldGUtdmlzaWJsZWApO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIHBhbmVsIGFzc29jaWF0ZWQgd2l0aCB0aGlzIGF1dG9jb21wbGV0ZSB0cmlnZ2VyLiAqL1xuICBwcml2YXRlIGFzeW5jIF9nZXRQYW5lbCgpIHtcbiAgICAvLyBUZWNobmljYWxseSB0aGlzIGlzIHN0YXRpYywgYnV0IGl0IG5lZWRzIHRvIGJlIGluIGFcbiAgICAvLyBmdW5jdGlvbiwgYmVjYXVzZSB0aGUgYXV0b2NvbXBsZXRlJ3MgcGFuZWwgSUQgY2FuIGNoYW5nZWQuXG4gICAgcmV0dXJuIHRoaXMuX2RvY3VtZW50Um9vdExvY2F0b3IubG9jYXRvckZvck9wdGlvbmFsKGF3YWl0IHRoaXMuX2dldFBhbmVsU2VsZWN0b3IoKSkoKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBzZWxlY3RvciB0aGF0IGNhbiBiZSB1c2VkIHRvIGZpbmQgdGhlIGF1dG9jb21wbGV0ZSB0cmlnZ2VyJ3MgcGFuZWwuICovXG4gIHByaXZhdGUgYXN5bmMgX2dldFBhbmVsU2VsZWN0b3IoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICByZXR1cm4gYCMkeyhhd2FpdCAoYXdhaXQgdGhpcy5ob3N0KCkpLmdldEF0dHJpYnV0ZSgnYXJpYS1vd25zJykpfWA7XG4gIH1cbn1cblxuLyoqIEhhcm5lc3MgZm9yIGludGVyYWN0aW5nIHdpdGggYSBzdGFuZGFyZCBtYXQtYXV0b2NvbXBsZXRlIGluIHRlc3RzLiAqL1xuZXhwb3J0IGNsYXNzIE1hdEF1dG9jb21wbGV0ZUhhcm5lc3MgZXh0ZW5kcyBfTWF0QXV0b2NvbXBsZXRlSGFybmVzc0Jhc2U8XG4gIHR5cGVvZiBNYXRPcHRpb25IYXJuZXNzLCBNYXRPcHRpb25IYXJuZXNzLCBPcHRpb25IYXJuZXNzRmlsdGVycyxcbiAgdHlwZW9mIE1hdE9wdGdyb3VwSGFybmVzcywgTWF0T3B0Z3JvdXBIYXJuZXNzLCBPcHRncm91cEhhcm5lc3NGaWx0ZXJzXG4+IHtcbiAgcHJvdGVjdGVkIF9wcmVmaXggPSAnbWF0JztcbiAgcHJvdGVjdGVkIF9vcHRpb25DbGFzcyA9IE1hdE9wdGlvbkhhcm5lc3M7XG4gIHByb3RlY3RlZCBfb3B0aW9uR3JvdXBDbGFzcyA9IE1hdE9wdGdyb3VwSGFybmVzcztcblxuICAvKiogVGhlIHNlbGVjdG9yIGZvciB0aGUgaG9zdCBlbGVtZW50IG9mIGEgYE1hdEF1dG9jb21wbGV0ZWAgaW5zdGFuY2UuICovXG4gIHN0YXRpYyBob3N0U2VsZWN0b3IgPSAnLm1hdC1hdXRvY29tcGxldGUtdHJpZ2dlcic7XG5cbiAgLyoqXG4gICAqIEdldHMgYSBgSGFybmVzc1ByZWRpY2F0ZWAgdGhhdCBjYW4gYmUgdXNlZCB0byBzZWFyY2ggZm9yIGEgYE1hdEF1dG9jb21wbGV0ZUhhcm5lc3NgIHRoYXQgbWVldHNcbiAgICogY2VydGFpbiBjcml0ZXJpYS5cbiAgICogQHBhcmFtIG9wdGlvbnMgT3B0aW9ucyBmb3IgZmlsdGVyaW5nIHdoaWNoIGF1dG9jb21wbGV0ZSBpbnN0YW5jZXMgYXJlIGNvbnNpZGVyZWQgYSBtYXRjaC5cbiAgICogQHJldHVybiBhIGBIYXJuZXNzUHJlZGljYXRlYCBjb25maWd1cmVkIHdpdGggdGhlIGdpdmVuIG9wdGlvbnMuXG4gICAqL1xuICBzdGF0aWMgd2l0aChvcHRpb25zOiBBdXRvY29tcGxldGVIYXJuZXNzRmlsdGVycyA9IHt9KTogSGFybmVzc1ByZWRpY2F0ZTxNYXRBdXRvY29tcGxldGVIYXJuZXNzPiB7XG4gICAgcmV0dXJuIG5ldyBIYXJuZXNzUHJlZGljYXRlKE1hdEF1dG9jb21wbGV0ZUhhcm5lc3MsIG9wdGlvbnMpXG4gICAgICAgIC5hZGRPcHRpb24oJ3ZhbHVlJywgb3B0aW9ucy52YWx1ZSxcbiAgICAgICAgICAgIChoYXJuZXNzLCB2YWx1ZSkgPT4gSGFybmVzc1ByZWRpY2F0ZS5zdHJpbmdNYXRjaGVzKGhhcm5lc3MuZ2V0VmFsdWUoKSwgdmFsdWUpKTtcbiAgfVxufVxuIl19