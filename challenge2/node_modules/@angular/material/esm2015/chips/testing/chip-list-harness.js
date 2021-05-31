/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { ComponentHarness, HarnessPredicate, parallel } from '@angular/cdk/testing';
import { MatChipHarness } from './chip-harness';
import { MatChipInputHarness } from './chip-input-harness';
/** Base class for chip list harnesses. */
export class _MatChipListHarnessBase extends ComponentHarness {
    /** Gets whether the chip list is disabled. */
    isDisabled() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield (yield this.host()).getAttribute('aria-disabled')) === 'true';
        });
    }
    /** Gets whether the chip list is required. */
    isRequired() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield (yield this.host()).getAttribute('aria-required')) === 'true';
        });
    }
    /** Gets whether the chip list is invalid. */
    isInvalid() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield (yield this.host()).getAttribute('aria-invalid')) === 'true';
        });
    }
    /** Gets whether the chip list is in multi selection mode. */
    isMultiple() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield (yield this.host()).getAttribute('aria-multiselectable')) === 'true';
        });
    }
    /** Gets whether the orientation of the chip list. */
    getOrientation() {
        return __awaiter(this, void 0, void 0, function* () {
            const orientation = yield (yield this.host()).getAttribute('aria-orientation');
            return orientation === 'vertical' ? 'vertical' : 'horizontal';
        });
    }
}
/** Harness for interacting with a standard chip list in tests. */
export class MatChipListHarness extends _MatChipListHarnessBase {
    /**
     * Gets a `HarnessPredicate` that can be used to search for a `MatChipListHarness` that meets
     * certain criteria.
     * @param options Options for filtering which chip list instances are considered a match.
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return new HarnessPredicate(MatChipListHarness, options);
    }
    /**
     * Gets the list of chips inside the chip list.
     * @param filter Optionally filters which chips are included.
     */
    getChips(filter = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.locatorForAll(MatChipHarness.with(filter))();
        });
    }
    /**
     * Selects a chip inside the chip list.
     * @param filter An optional filter to apply to the child chips.
     *    All the chips matching the filter will be selected.
     * @deprecated Use `MatChipListboxHarness.selectChips` instead.
     * @breaking-change 12.0.0
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
    /**
     * Gets the `MatChipInput` inside the chip list.
     * @param filter Optionally filters which chip input is included.
     */
    getInput(filter = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            // The input isn't required to be a descendant of the chip list so we have to look it up by id.
            const inputId = yield (yield this.host()).getAttribute('data-mat-chip-input');
            if (!inputId) {
                throw Error(`Chip list is not associated with an input`);
            }
            return this.documentRootLocatorFactory().locatorFor(MatChipInputHarness.with(Object.assign(Object.assign({}, filter), { selector: `#${inputId}` })))();
        });
    }
}
/** The selector for the host element of a `MatChipList` instance. */
MatChipListHarness.hostSelector = '.mat-chip-list';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hpcC1saXN0LWhhcm5lc3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvY2hpcHMvdGVzdGluZy9jaGlwLWxpc3QtaGFybmVzcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBRUgsT0FBTyxFQUFDLGdCQUFnQixFQUFFLGdCQUFnQixFQUFFLFFBQVEsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBQ2xGLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUM5QyxPQUFPLEVBQUMsbUJBQW1CLEVBQUMsTUFBTSxzQkFBc0IsQ0FBQztBQU96RCwwQ0FBMEM7QUFDMUMsTUFBTSxPQUFnQix1QkFBd0IsU0FBUSxnQkFBZ0I7SUFDcEUsOENBQThDO0lBQ3hDLFVBQVU7O1lBQ2QsT0FBTyxDQUFBLE1BQU0sQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLFlBQVksQ0FBQyxlQUFlLENBQUMsTUFBSyxNQUFNLENBQUM7UUFDNUUsQ0FBQztLQUFBO0lBRUQsOENBQThDO0lBQ3hDLFVBQVU7O1lBQ2QsT0FBTyxDQUFBLE1BQU0sQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLFlBQVksQ0FBQyxlQUFlLENBQUMsTUFBSyxNQUFNLENBQUM7UUFDNUUsQ0FBQztLQUFBO0lBRUQsNkNBQTZDO0lBQ3ZDLFNBQVM7O1lBQ2IsT0FBTyxDQUFBLE1BQU0sQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLFlBQVksQ0FBQyxjQUFjLENBQUMsTUFBSyxNQUFNLENBQUM7UUFDM0UsQ0FBQztLQUFBO0lBRUQsNkRBQTZEO0lBQ3ZELFVBQVU7O1lBQ2QsT0FBTyxDQUFBLE1BQU0sQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLFlBQVksQ0FBQyxzQkFBc0IsQ0FBQyxNQUFLLE1BQU0sQ0FBQztRQUNuRixDQUFDO0tBQUE7SUFFRCxxREFBcUQ7SUFDL0MsY0FBYzs7WUFDbEIsTUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsWUFBWSxDQUFDLGtCQUFrQixDQUFDLENBQUM7WUFDL0UsT0FBTyxXQUFXLEtBQUssVUFBVSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQztRQUNoRSxDQUFDO0tBQUE7Q0FDRjtBQUVELGtFQUFrRTtBQUNsRSxNQUFNLE9BQU8sa0JBQW1CLFNBQVEsdUJBQXVCO0lBSTdEOzs7OztPQUtHO0lBQ0gsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFrQyxFQUFFO1FBQzlDLE9BQU8sSUFBSSxnQkFBZ0IsQ0FBQyxrQkFBa0IsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUMzRCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0csUUFBUSxDQUFDLFNBQTZCLEVBQUU7O1lBQzVDLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUMzRCxDQUFDO0tBQUE7SUFFRDs7Ozs7O09BTUc7SUFDRyxXQUFXLENBQUMsU0FBNkIsRUFBRTs7WUFDL0MsTUFBTSxLQUFLLEdBQUcsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFO2dCQUNqQixNQUFNLEtBQUssQ0FBQyxvQ0FBb0MsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7YUFDM0U7WUFDRCxNQUFNLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztRQUN6RCxDQUFDO0tBQUE7SUFFRDs7O09BR0c7SUFDRyxRQUFRLENBQUMsU0FBa0MsRUFBRTs7WUFDakQsK0ZBQStGO1lBQy9GLE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLFlBQVksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1lBRTlFLElBQUksQ0FBQyxPQUFPLEVBQUU7Z0JBQ1osTUFBTSxLQUFLLENBQUMsMkNBQTJDLENBQUMsQ0FBQzthQUMxRDtZQUVELE9BQU8sSUFBSSxDQUFDLDBCQUEwQixFQUFFLENBQUMsVUFBVSxDQUNqRCxtQkFBbUIsQ0FBQyxJQUFJLGlDQUFLLE1BQU0sS0FBRSxRQUFRLEVBQUUsSUFBSSxPQUFPLEVBQUUsSUFBRSxDQUFDLEVBQUUsQ0FBQztRQUN0RSxDQUFDO0tBQUE7O0FBbERELHFFQUFxRTtBQUM5RCwrQkFBWSxHQUFHLGdCQUFnQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Q29tcG9uZW50SGFybmVzcywgSGFybmVzc1ByZWRpY2F0ZSwgcGFyYWxsZWx9IGZyb20gJ0Bhbmd1bGFyL2Nkay90ZXN0aW5nJztcbmltcG9ydCB7TWF0Q2hpcEhhcm5lc3N9IGZyb20gJy4vY2hpcC1oYXJuZXNzJztcbmltcG9ydCB7TWF0Q2hpcElucHV0SGFybmVzc30gZnJvbSAnLi9jaGlwLWlucHV0LWhhcm5lc3MnO1xuaW1wb3J0IHtcbiAgQ2hpcExpc3RIYXJuZXNzRmlsdGVycyxcbiAgQ2hpcEhhcm5lc3NGaWx0ZXJzLFxuICBDaGlwSW5wdXRIYXJuZXNzRmlsdGVycyxcbn0gZnJvbSAnLi9jaGlwLWhhcm5lc3MtZmlsdGVycyc7XG5cbi8qKiBCYXNlIGNsYXNzIGZvciBjaGlwIGxpc3QgaGFybmVzc2VzLiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIF9NYXRDaGlwTGlzdEhhcm5lc3NCYXNlIGV4dGVuZHMgQ29tcG9uZW50SGFybmVzcyB7XG4gIC8qKiBHZXRzIHdoZXRoZXIgdGhlIGNoaXAgbGlzdCBpcyBkaXNhYmxlZC4gKi9cbiAgYXN5bmMgaXNEaXNhYmxlZCgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gYXdhaXQgKGF3YWl0IHRoaXMuaG9zdCgpKS5nZXRBdHRyaWJ1dGUoJ2FyaWEtZGlzYWJsZWQnKSA9PT0gJ3RydWUnO1xuICB9XG5cbiAgLyoqIEdldHMgd2hldGhlciB0aGUgY2hpcCBsaXN0IGlzIHJlcXVpcmVkLiAqL1xuICBhc3luYyBpc1JlcXVpcmVkKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiBhd2FpdCAoYXdhaXQgdGhpcy5ob3N0KCkpLmdldEF0dHJpYnV0ZSgnYXJpYS1yZXF1aXJlZCcpID09PSAndHJ1ZSc7XG4gIH1cblxuICAvKiogR2V0cyB3aGV0aGVyIHRoZSBjaGlwIGxpc3QgaXMgaW52YWxpZC4gKi9cbiAgYXN5bmMgaXNJbnZhbGlkKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiBhd2FpdCAoYXdhaXQgdGhpcy5ob3N0KCkpLmdldEF0dHJpYnV0ZSgnYXJpYS1pbnZhbGlkJykgPT09ICd0cnVlJztcbiAgfVxuXG4gIC8qKiBHZXRzIHdoZXRoZXIgdGhlIGNoaXAgbGlzdCBpcyBpbiBtdWx0aSBzZWxlY3Rpb24gbW9kZS4gKi9cbiAgYXN5bmMgaXNNdWx0aXBsZSgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gYXdhaXQgKGF3YWl0IHRoaXMuaG9zdCgpKS5nZXRBdHRyaWJ1dGUoJ2FyaWEtbXVsdGlzZWxlY3RhYmxlJykgPT09ICd0cnVlJztcbiAgfVxuXG4gIC8qKiBHZXRzIHdoZXRoZXIgdGhlIG9yaWVudGF0aW9uIG9mIHRoZSBjaGlwIGxpc3QuICovXG4gIGFzeW5jIGdldE9yaWVudGF0aW9uKCk6IFByb21pc2U8J2hvcml6b250YWwnIHwgJ3ZlcnRpY2FsJz4ge1xuICAgIGNvbnN0IG9yaWVudGF0aW9uID0gYXdhaXQgKGF3YWl0IHRoaXMuaG9zdCgpKS5nZXRBdHRyaWJ1dGUoJ2FyaWEtb3JpZW50YXRpb24nKTtcbiAgICByZXR1cm4gb3JpZW50YXRpb24gPT09ICd2ZXJ0aWNhbCcgPyAndmVydGljYWwnIDogJ2hvcml6b250YWwnO1xuICB9XG59XG5cbi8qKiBIYXJuZXNzIGZvciBpbnRlcmFjdGluZyB3aXRoIGEgc3RhbmRhcmQgY2hpcCBsaXN0IGluIHRlc3RzLiAqL1xuZXhwb3J0IGNsYXNzIE1hdENoaXBMaXN0SGFybmVzcyBleHRlbmRzIF9NYXRDaGlwTGlzdEhhcm5lc3NCYXNlIHtcbiAgLyoqIFRoZSBzZWxlY3RvciBmb3IgdGhlIGhvc3QgZWxlbWVudCBvZiBhIGBNYXRDaGlwTGlzdGAgaW5zdGFuY2UuICovXG4gIHN0YXRpYyBob3N0U2VsZWN0b3IgPSAnLm1hdC1jaGlwLWxpc3QnO1xuXG4gIC8qKlxuICAgKiBHZXRzIGEgYEhhcm5lc3NQcmVkaWNhdGVgIHRoYXQgY2FuIGJlIHVzZWQgdG8gc2VhcmNoIGZvciBhIGBNYXRDaGlwTGlzdEhhcm5lc3NgIHRoYXQgbWVldHNcbiAgICogY2VydGFpbiBjcml0ZXJpYS5cbiAgICogQHBhcmFtIG9wdGlvbnMgT3B0aW9ucyBmb3IgZmlsdGVyaW5nIHdoaWNoIGNoaXAgbGlzdCBpbnN0YW5jZXMgYXJlIGNvbnNpZGVyZWQgYSBtYXRjaC5cbiAgICogQHJldHVybiBhIGBIYXJuZXNzUHJlZGljYXRlYCBjb25maWd1cmVkIHdpdGggdGhlIGdpdmVuIG9wdGlvbnMuXG4gICAqL1xuICBzdGF0aWMgd2l0aChvcHRpb25zOiBDaGlwTGlzdEhhcm5lc3NGaWx0ZXJzID0ge30pOiBIYXJuZXNzUHJlZGljYXRlPE1hdENoaXBMaXN0SGFybmVzcz4ge1xuICAgIHJldHVybiBuZXcgSGFybmVzc1ByZWRpY2F0ZShNYXRDaGlwTGlzdEhhcm5lc3MsIG9wdGlvbnMpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIGxpc3Qgb2YgY2hpcHMgaW5zaWRlIHRoZSBjaGlwIGxpc3QuXG4gICAqIEBwYXJhbSBmaWx0ZXIgT3B0aW9uYWxseSBmaWx0ZXJzIHdoaWNoIGNoaXBzIGFyZSBpbmNsdWRlZC5cbiAgICovXG4gIGFzeW5jIGdldENoaXBzKGZpbHRlcjogQ2hpcEhhcm5lc3NGaWx0ZXJzID0ge30pOiBQcm9taXNlPE1hdENoaXBIYXJuZXNzW10+IHtcbiAgICByZXR1cm4gdGhpcy5sb2NhdG9yRm9yQWxsKE1hdENoaXBIYXJuZXNzLndpdGgoZmlsdGVyKSkoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWxlY3RzIGEgY2hpcCBpbnNpZGUgdGhlIGNoaXAgbGlzdC5cbiAgICogQHBhcmFtIGZpbHRlciBBbiBvcHRpb25hbCBmaWx0ZXIgdG8gYXBwbHkgdG8gdGhlIGNoaWxkIGNoaXBzLlxuICAgKiAgICBBbGwgdGhlIGNoaXBzIG1hdGNoaW5nIHRoZSBmaWx0ZXIgd2lsbCBiZSBzZWxlY3RlZC5cbiAgICogQGRlcHJlY2F0ZWQgVXNlIGBNYXRDaGlwTGlzdGJveEhhcm5lc3Muc2VsZWN0Q2hpcHNgIGluc3RlYWQuXG4gICAqIEBicmVha2luZy1jaGFuZ2UgMTIuMC4wXG4gICAqL1xuICBhc3luYyBzZWxlY3RDaGlwcyhmaWx0ZXI6IENoaXBIYXJuZXNzRmlsdGVycyA9IHt9KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgY2hpcHMgPSBhd2FpdCB0aGlzLmdldENoaXBzKGZpbHRlcik7XG4gICAgaWYgKCFjaGlwcy5sZW5ndGgpIHtcbiAgICAgIHRocm93IEVycm9yKGBDYW5ub3QgZmluZCBjaGlwIG1hdGNoaW5nIGZpbHRlciAke0pTT04uc3RyaW5naWZ5KGZpbHRlcil9YCk7XG4gICAgfVxuICAgIGF3YWl0IHBhcmFsbGVsKCgpID0+IGNoaXBzLm1hcChjaGlwID0+IGNoaXAuc2VsZWN0KCkpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBgTWF0Q2hpcElucHV0YCBpbnNpZGUgdGhlIGNoaXAgbGlzdC5cbiAgICogQHBhcmFtIGZpbHRlciBPcHRpb25hbGx5IGZpbHRlcnMgd2hpY2ggY2hpcCBpbnB1dCBpcyBpbmNsdWRlZC5cbiAgICovXG4gIGFzeW5jIGdldElucHV0KGZpbHRlcjogQ2hpcElucHV0SGFybmVzc0ZpbHRlcnMgPSB7fSk6IFByb21pc2U8TWF0Q2hpcElucHV0SGFybmVzcz4ge1xuICAgIC8vIFRoZSBpbnB1dCBpc24ndCByZXF1aXJlZCB0byBiZSBhIGRlc2NlbmRhbnQgb2YgdGhlIGNoaXAgbGlzdCBzbyB3ZSBoYXZlIHRvIGxvb2sgaXQgdXAgYnkgaWQuXG4gICAgY29uc3QgaW5wdXRJZCA9IGF3YWl0IChhd2FpdCB0aGlzLmhvc3QoKSkuZ2V0QXR0cmlidXRlKCdkYXRhLW1hdC1jaGlwLWlucHV0Jyk7XG5cbiAgICBpZiAoIWlucHV0SWQpIHtcbiAgICAgIHRocm93IEVycm9yKGBDaGlwIGxpc3QgaXMgbm90IGFzc29jaWF0ZWQgd2l0aCBhbiBpbnB1dGApO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmRvY3VtZW50Um9vdExvY2F0b3JGYWN0b3J5KCkubG9jYXRvckZvcihcbiAgICAgIE1hdENoaXBJbnB1dEhhcm5lc3Mud2l0aCh7Li4uZmlsdGVyLCBzZWxlY3RvcjogYCMke2lucHV0SWR9YH0pKSgpO1xuICB9XG59XG4iXX0=