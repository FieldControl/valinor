/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { HarnessPredicate, parallel } from '@angular/cdk/testing';
import { MatChipOptionHarness } from './chip-option-harness';
import { _MatChipListHarnessBase } from './chip-list-harness';
/** Harness for interacting with a standard selectable chip list in tests. */
export class MatChipListboxHarness extends _MatChipListHarnessBase {
    /**
     * Gets a `HarnessPredicate` that can be used to search for a `MatChipListHarness` that meets
     * certain criteria.
     * @param options Options for filtering which chip list instances are considered a match.
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return new HarnessPredicate(MatChipListboxHarness, options);
    }
    /**
     * Gets the list of chips inside the chip list.
     * @param filter Optionally filters which chips are included.
     */
    getChips(filter = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.locatorForAll(MatChipOptionHarness.with(filter))();
        });
    }
    /**
     * Selects a chip inside the chip list.
     * @param filter An optional filter to apply to the child chips.
     *    All the chips matching the filter will be selected.
     */
    selectChips(filter = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const chips = yield this.getChips(filter);
            if (!chips.length) {
                throw Error(`Cannot find chip matching filter ${JSON.stringify(filter)}`);
            }
            yield parallel(() => chips.map(chip => chip.select()));
        });
    }
}
/** The selector for the host element of a `MatChipList` instance. */
MatChipListboxHarness.hostSelector = '.mat-chip-list';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hpcC1saXN0Ym94LWhhcm5lc3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvY2hpcHMvdGVzdGluZy9jaGlwLWxpc3Rib3gtaGFybmVzcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBRUgsT0FBTyxFQUFDLGdCQUFnQixFQUFFLFFBQVEsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBQ2hFLE9BQU8sRUFBQyxvQkFBb0IsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBSzNELE9BQU8sRUFBQyx1QkFBdUIsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBRTVELDZFQUE2RTtBQUM3RSxNQUFNLE9BQU8scUJBQXNCLFNBQVEsdUJBQXVCO0lBSWhFOzs7OztPQUtHO0lBQ0gsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFxQyxFQUFFO1FBRWpELE9BQU8sSUFBSSxnQkFBZ0IsQ0FBQyxxQkFBcUIsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUM5RCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0csUUFBUSxDQUFDLFNBQW1DLEVBQUU7O1lBQ2xELE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQ2pFLENBQUM7S0FBQTtJQUVEOzs7O09BSUc7SUFDRyxXQUFXLENBQUMsU0FBbUMsRUFBRTs7WUFDckQsTUFBTSxLQUFLLEdBQUcsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFO2dCQUNqQixNQUFNLEtBQUssQ0FBQyxvQ0FBb0MsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7YUFDM0U7WUFDRCxNQUFNLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztRQUN6RCxDQUFDO0tBQUE7O0FBakNELHFFQUFxRTtBQUM5RCxrQ0FBWSxHQUFHLGdCQUFnQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SGFybmVzc1ByZWRpY2F0ZSwgcGFyYWxsZWx9IGZyb20gJ0Bhbmd1bGFyL2Nkay90ZXN0aW5nJztcbmltcG9ydCB7TWF0Q2hpcE9wdGlvbkhhcm5lc3N9IGZyb20gJy4vY2hpcC1vcHRpb24taGFybmVzcyc7XG5pbXBvcnQge1xuICBDaGlwTGlzdGJveEhhcm5lc3NGaWx0ZXJzLFxuICBDaGlwT3B0aW9uSGFybmVzc0ZpbHRlcnMsXG59IGZyb20gJy4vY2hpcC1oYXJuZXNzLWZpbHRlcnMnO1xuaW1wb3J0IHtfTWF0Q2hpcExpc3RIYXJuZXNzQmFzZX0gZnJvbSAnLi9jaGlwLWxpc3QtaGFybmVzcyc7XG5cbi8qKiBIYXJuZXNzIGZvciBpbnRlcmFjdGluZyB3aXRoIGEgc3RhbmRhcmQgc2VsZWN0YWJsZSBjaGlwIGxpc3QgaW4gdGVzdHMuICovXG5leHBvcnQgY2xhc3MgTWF0Q2hpcExpc3Rib3hIYXJuZXNzIGV4dGVuZHMgX01hdENoaXBMaXN0SGFybmVzc0Jhc2Uge1xuICAvKiogVGhlIHNlbGVjdG9yIGZvciB0aGUgaG9zdCBlbGVtZW50IG9mIGEgYE1hdENoaXBMaXN0YCBpbnN0YW5jZS4gKi9cbiAgc3RhdGljIGhvc3RTZWxlY3RvciA9ICcubWF0LWNoaXAtbGlzdCc7XG5cbiAgLyoqXG4gICAqIEdldHMgYSBgSGFybmVzc1ByZWRpY2F0ZWAgdGhhdCBjYW4gYmUgdXNlZCB0byBzZWFyY2ggZm9yIGEgYE1hdENoaXBMaXN0SGFybmVzc2AgdGhhdCBtZWV0c1xuICAgKiBjZXJ0YWluIGNyaXRlcmlhLlxuICAgKiBAcGFyYW0gb3B0aW9ucyBPcHRpb25zIGZvciBmaWx0ZXJpbmcgd2hpY2ggY2hpcCBsaXN0IGluc3RhbmNlcyBhcmUgY29uc2lkZXJlZCBhIG1hdGNoLlxuICAgKiBAcmV0dXJuIGEgYEhhcm5lc3NQcmVkaWNhdGVgIGNvbmZpZ3VyZWQgd2l0aCB0aGUgZ2l2ZW4gb3B0aW9ucy5cbiAgICovXG4gIHN0YXRpYyB3aXRoKG9wdGlvbnM6IENoaXBMaXN0Ym94SGFybmVzc0ZpbHRlcnMgPSB7fSk6XG4gICAgSGFybmVzc1ByZWRpY2F0ZTxNYXRDaGlwTGlzdGJveEhhcm5lc3M+IHtcbiAgICByZXR1cm4gbmV3IEhhcm5lc3NQcmVkaWNhdGUoTWF0Q2hpcExpc3Rib3hIYXJuZXNzLCBvcHRpb25zKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBsaXN0IG9mIGNoaXBzIGluc2lkZSB0aGUgY2hpcCBsaXN0LlxuICAgKiBAcGFyYW0gZmlsdGVyIE9wdGlvbmFsbHkgZmlsdGVycyB3aGljaCBjaGlwcyBhcmUgaW5jbHVkZWQuXG4gICAqL1xuICBhc3luYyBnZXRDaGlwcyhmaWx0ZXI6IENoaXBPcHRpb25IYXJuZXNzRmlsdGVycyA9IHt9KTogUHJvbWlzZTxNYXRDaGlwT3B0aW9uSGFybmVzc1tdPiB7XG4gICAgcmV0dXJuIHRoaXMubG9jYXRvckZvckFsbChNYXRDaGlwT3B0aW9uSGFybmVzcy53aXRoKGZpbHRlcikpKCk7XG4gIH1cblxuICAvKipcbiAgICogU2VsZWN0cyBhIGNoaXAgaW5zaWRlIHRoZSBjaGlwIGxpc3QuXG4gICAqIEBwYXJhbSBmaWx0ZXIgQW4gb3B0aW9uYWwgZmlsdGVyIHRvIGFwcGx5IHRvIHRoZSBjaGlsZCBjaGlwcy5cbiAgICogICAgQWxsIHRoZSBjaGlwcyBtYXRjaGluZyB0aGUgZmlsdGVyIHdpbGwgYmUgc2VsZWN0ZWQuXG4gICAqL1xuICBhc3luYyBzZWxlY3RDaGlwcyhmaWx0ZXI6IENoaXBPcHRpb25IYXJuZXNzRmlsdGVycyA9IHt9KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgY2hpcHMgPSBhd2FpdCB0aGlzLmdldENoaXBzKGZpbHRlcik7XG4gICAgaWYgKCFjaGlwcy5sZW5ndGgpIHtcbiAgICAgIHRocm93IEVycm9yKGBDYW5ub3QgZmluZCBjaGlwIG1hdGNoaW5nIGZpbHRlciAke0pTT04uc3RyaW5naWZ5KGZpbHRlcil9YCk7XG4gICAgfVxuICAgIGF3YWl0IHBhcmFsbGVsKCgpID0+IGNoaXBzLm1hcChjaGlwID0+IGNoaXAuc2VsZWN0KCkpKTtcbiAgfVxufVxuIl19