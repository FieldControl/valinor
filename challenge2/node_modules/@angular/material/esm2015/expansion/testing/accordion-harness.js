/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';
import { MatExpansionPanelHarness } from './expansion-harness';
/** Harness for interacting with a standard mat-accordion in tests. */
export class MatAccordionHarness extends ComponentHarness {
    /**
     * Gets a `HarnessPredicate` that can be used to search for an accordion
     * with specific attributes.
     * @param options Options for narrowing the search.
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return new HarnessPredicate(MatAccordionHarness, options);
    }
    /** Gets all expansion panels which are part of the accordion. */
    getExpansionPanels(filter = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.locatorForAll(MatExpansionPanelHarness.with(filter))();
        });
    }
    /** Whether the accordion allows multiple expanded panels simultaneously. */
    isMulti() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).hasClass('mat-accordion-multi');
        });
    }
}
MatAccordionHarness.hostSelector = '.mat-accordion';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNjb3JkaW9uLWhhcm5lc3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvZXhwYW5zaW9uL3Rlc3RpbmcvYWNjb3JkaW9uLWhhcm5lc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUVILE9BQU8sRUFBQyxnQkFBZ0IsRUFBRSxnQkFBZ0IsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBQ3hFLE9BQU8sRUFBQyx3QkFBd0IsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBRzdELHNFQUFzRTtBQUN0RSxNQUFNLE9BQU8sbUJBQW9CLFNBQVEsZ0JBQWdCO0lBR3ZEOzs7OztPQUtHO0lBQ0gsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFtQyxFQUFFO1FBQy9DLE9BQU8sSUFBSSxnQkFBZ0IsQ0FBQyxtQkFBbUIsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUM1RCxDQUFDO0lBRUQsaUVBQWlFO0lBQzNELGtCQUFrQixDQUFDLFNBQXVDLEVBQUU7O1lBRWhFLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQ3JFLENBQUM7S0FBQTtJQUVELDRFQUE0RTtJQUN0RSxPQUFPOztZQUNYLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1FBQzdELENBQUM7S0FBQTs7QUFyQk0sZ0NBQVksR0FBRyxnQkFBZ0IsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NvbXBvbmVudEhhcm5lc3MsIEhhcm5lc3NQcmVkaWNhdGV9IGZyb20gJ0Bhbmd1bGFyL2Nkay90ZXN0aW5nJztcbmltcG9ydCB7TWF0RXhwYW5zaW9uUGFuZWxIYXJuZXNzfSBmcm9tICcuL2V4cGFuc2lvbi1oYXJuZXNzJztcbmltcG9ydCB7QWNjb3JkaW9uSGFybmVzc0ZpbHRlcnMsIEV4cGFuc2lvblBhbmVsSGFybmVzc0ZpbHRlcnN9IGZyb20gJy4vZXhwYW5zaW9uLWhhcm5lc3MtZmlsdGVycyc7XG5cbi8qKiBIYXJuZXNzIGZvciBpbnRlcmFjdGluZyB3aXRoIGEgc3RhbmRhcmQgbWF0LWFjY29yZGlvbiBpbiB0ZXN0cy4gKi9cbmV4cG9ydCBjbGFzcyBNYXRBY2NvcmRpb25IYXJuZXNzIGV4dGVuZHMgQ29tcG9uZW50SGFybmVzcyB7XG4gIHN0YXRpYyBob3N0U2VsZWN0b3IgPSAnLm1hdC1hY2NvcmRpb24nO1xuXG4gIC8qKlxuICAgKiBHZXRzIGEgYEhhcm5lc3NQcmVkaWNhdGVgIHRoYXQgY2FuIGJlIHVzZWQgdG8gc2VhcmNoIGZvciBhbiBhY2NvcmRpb25cbiAgICogd2l0aCBzcGVjaWZpYyBhdHRyaWJ1dGVzLlxuICAgKiBAcGFyYW0gb3B0aW9ucyBPcHRpb25zIGZvciBuYXJyb3dpbmcgdGhlIHNlYXJjaC5cbiAgICogQHJldHVybiBhIGBIYXJuZXNzUHJlZGljYXRlYCBjb25maWd1cmVkIHdpdGggdGhlIGdpdmVuIG9wdGlvbnMuXG4gICAqL1xuICBzdGF0aWMgd2l0aChvcHRpb25zOiBBY2NvcmRpb25IYXJuZXNzRmlsdGVycyA9IHt9KTogSGFybmVzc1ByZWRpY2F0ZTxNYXRBY2NvcmRpb25IYXJuZXNzPiB7XG4gICAgcmV0dXJuIG5ldyBIYXJuZXNzUHJlZGljYXRlKE1hdEFjY29yZGlvbkhhcm5lc3MsIG9wdGlvbnMpO1xuICB9XG5cbiAgLyoqIEdldHMgYWxsIGV4cGFuc2lvbiBwYW5lbHMgd2hpY2ggYXJlIHBhcnQgb2YgdGhlIGFjY29yZGlvbi4gKi9cbiAgYXN5bmMgZ2V0RXhwYW5zaW9uUGFuZWxzKGZpbHRlcjogRXhwYW5zaW9uUGFuZWxIYXJuZXNzRmlsdGVycyA9IHt9KTpcbiAgICAgIFByb21pc2U8TWF0RXhwYW5zaW9uUGFuZWxIYXJuZXNzW10+IHtcbiAgICByZXR1cm4gdGhpcy5sb2NhdG9yRm9yQWxsKE1hdEV4cGFuc2lvblBhbmVsSGFybmVzcy53aXRoKGZpbHRlcikpKCk7XG4gIH1cblxuICAvKiogV2hldGhlciB0aGUgYWNjb3JkaW9uIGFsbG93cyBtdWx0aXBsZSBleHBhbmRlZCBwYW5lbHMgc2ltdWx0YW5lb3VzbHkuICovXG4gIGFzeW5jIGlzTXVsdGkoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLmhvc3QoKSkuaGFzQ2xhc3MoJ21hdC1hY2NvcmRpb24tbXVsdGknKTtcbiAgfVxufVxuIl19