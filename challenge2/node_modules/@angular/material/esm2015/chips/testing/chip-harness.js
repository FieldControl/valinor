/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { ComponentHarness, HarnessPredicate, TestKey } from '@angular/cdk/testing';
import { MatChipRemoveHarness } from './chip-remove-harness';
/** Harness for interacting with a standard selectable Angular Material chip in tests. */
export class MatChipHarness extends ComponentHarness {
    /**
     * Gets a `HarnessPredicate` that can be used to search for a `MatChipHarness` that meets
     * certain criteria.
     * @param options Options for filtering which chip instances are considered a match.
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return new HarnessPredicate(MatChipHarness, options)
            .addOption('text', options.text, (harness, label) => HarnessPredicate.stringMatches(harness.getText(), label))
            .addOption('selected', options.selected, (harness, selected) => __awaiter(this, void 0, void 0, function* () { return (yield harness.isSelected()) === selected; }));
    }
    /** Gets the text of the chip. */
    getText() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).text({
                exclude: '.mat-chip-avatar, .mat-chip-trailing-icon, .mat-icon'
            });
        });
    }
    /**
     * Whether the chip is selected.
     * @deprecated Use `MatChipOptionHarness.isSelected` instead.
     * @breaking-change 12.0.0
     */
    isSelected() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).hasClass('mat-chip-selected');
        });
    }
    /** Whether the chip is disabled. */
    isDisabled() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).hasClass('mat-chip-disabled');
        });
    }
    /**
     * Selects the given chip. Only applies if it's selectable.
     * @deprecated Use `MatChipOptionHarness.select` instead.
     * @breaking-change 12.0.0
     */
    select() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(yield this.isSelected())) {
                yield this.toggle();
            }
        });
    }
    /**
     * Deselects the given chip. Only applies if it's selectable.
     * @deprecated Use `MatChipOptionHarness.deselect` instead.
     * @breaking-change 12.0.0
     */
    deselect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (yield this.isSelected()) {
                yield this.toggle();
            }
        });
    }
    /**
     * Toggles the selected state of the given chip. Only applies if it's selectable.
     * @deprecated Use `MatChipOptionHarness.toggle` instead.
     * @breaking-change 12.0.0
     */
    toggle() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).sendKeys(' ');
        });
    }
    /** Removes the given chip. Only applies if it's removable. */
    remove() {
        return __awaiter(this, void 0, void 0, function* () {
            yield (yield this.host()).sendKeys(TestKey.DELETE);
        });
    }
    /**
     * Gets the remove button inside of a chip.
     * @param filter Optionally filters which chips are included.
     */
    getRemoveButton(filter = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.locatorFor(MatChipRemoveHarness.with(filter))();
        });
    }
}
/** The selector for the host element of a `MatChip` instance. */
MatChipHarness.hostSelector = '.mat-chip';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hpcC1oYXJuZXNzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL2NoaXBzL3Rlc3RpbmcvY2hpcC1oYXJuZXNzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFFSCxPQUFPLEVBQUMsZ0JBQWdCLEVBQUUsZ0JBQWdCLEVBQUUsT0FBTyxFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFFakYsT0FBTyxFQUFDLG9CQUFvQixFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFFM0QseUZBQXlGO0FBQ3pGLE1BQU0sT0FBTyxjQUFlLFNBQVEsZ0JBQWdCO0lBSWxEOzs7OztPQUtHO0lBQ0gsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUE4QixFQUFFO1FBQzFDLE9BQU8sSUFBSSxnQkFBZ0IsQ0FBQyxjQUFjLEVBQUUsT0FBTyxDQUFDO2FBQy9DLFNBQVMsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLElBQUksRUFDM0IsQ0FBQyxPQUFPLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO2FBQ2hGLFNBQVMsQ0FBQyxVQUFVLEVBQUUsT0FBTyxDQUFDLFFBQVEsRUFDbkMsQ0FBTyxPQUFPLEVBQUUsUUFBUSxFQUFFLEVBQUUsZ0RBQUMsT0FBQSxDQUFDLE1BQU0sT0FBTyxDQUFDLFVBQVUsRUFBRSxDQUFDLEtBQUssUUFBUSxDQUFBLEdBQUEsQ0FBQyxDQUFDO0lBQ2xGLENBQUM7SUFFRCxpQ0FBaUM7SUFDM0IsT0FBTzs7WUFDWCxPQUFPLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUM7Z0JBQzlCLE9BQU8sRUFBRSxzREFBc0Q7YUFDaEUsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztLQUFBO0lBRUQ7Ozs7T0FJRztJQUNHLFVBQVU7O1lBQ2QsT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLG1CQUFtQixDQUFDLENBQUM7UUFDM0QsQ0FBQztLQUFBO0lBRUQsb0NBQW9DO0lBQzlCLFVBQVU7O1lBQ2QsT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLG1CQUFtQixDQUFDLENBQUM7UUFDM0QsQ0FBQztLQUFBO0lBRUQ7Ozs7T0FJRztJQUNHLE1BQU07O1lBQ1YsSUFBSSxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsRUFBRTtnQkFDOUIsTUFBTSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7YUFDckI7UUFDSCxDQUFDO0tBQUE7SUFFRDs7OztPQUlHO0lBQ0csUUFBUTs7WUFDWixJQUFJLE1BQU0sSUFBSSxDQUFDLFVBQVUsRUFBRSxFQUFFO2dCQUMzQixNQUFNLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQzthQUNyQjtRQUNILENBQUM7S0FBQTtJQUVEOzs7O09BSUc7SUFDRyxNQUFNOztZQUNWLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUMzQyxDQUFDO0tBQUE7SUFFRCw4REFBOEQ7SUFDeEQsTUFBTTs7WUFDVixNQUFNLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3JELENBQUM7S0FBQTtJQUVEOzs7T0FHRztJQUNHLGVBQWUsQ0FBQyxTQUFtQyxFQUFFOztZQUN6RCxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUM5RCxDQUFDO0tBQUE7O0FBaEZELGlFQUFpRTtBQUMxRCwyQkFBWSxHQUFHLFdBQVcsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NvbXBvbmVudEhhcm5lc3MsIEhhcm5lc3NQcmVkaWNhdGUsIFRlc3RLZXl9IGZyb20gJ0Bhbmd1bGFyL2Nkay90ZXN0aW5nJztcbmltcG9ydCB7Q2hpcEhhcm5lc3NGaWx0ZXJzLCBDaGlwUmVtb3ZlSGFybmVzc0ZpbHRlcnN9IGZyb20gJy4vY2hpcC1oYXJuZXNzLWZpbHRlcnMnO1xuaW1wb3J0IHtNYXRDaGlwUmVtb3ZlSGFybmVzc30gZnJvbSAnLi9jaGlwLXJlbW92ZS1oYXJuZXNzJztcblxuLyoqIEhhcm5lc3MgZm9yIGludGVyYWN0aW5nIHdpdGggYSBzdGFuZGFyZCBzZWxlY3RhYmxlIEFuZ3VsYXIgTWF0ZXJpYWwgY2hpcCBpbiB0ZXN0cy4gKi9cbmV4cG9ydCBjbGFzcyBNYXRDaGlwSGFybmVzcyBleHRlbmRzIENvbXBvbmVudEhhcm5lc3Mge1xuICAvKiogVGhlIHNlbGVjdG9yIGZvciB0aGUgaG9zdCBlbGVtZW50IG9mIGEgYE1hdENoaXBgIGluc3RhbmNlLiAqL1xuICBzdGF0aWMgaG9zdFNlbGVjdG9yID0gJy5tYXQtY2hpcCc7XG5cbiAgLyoqXG4gICAqIEdldHMgYSBgSGFybmVzc1ByZWRpY2F0ZWAgdGhhdCBjYW4gYmUgdXNlZCB0byBzZWFyY2ggZm9yIGEgYE1hdENoaXBIYXJuZXNzYCB0aGF0IG1lZXRzXG4gICAqIGNlcnRhaW4gY3JpdGVyaWEuXG4gICAqIEBwYXJhbSBvcHRpb25zIE9wdGlvbnMgZm9yIGZpbHRlcmluZyB3aGljaCBjaGlwIGluc3RhbmNlcyBhcmUgY29uc2lkZXJlZCBhIG1hdGNoLlxuICAgKiBAcmV0dXJuIGEgYEhhcm5lc3NQcmVkaWNhdGVgIGNvbmZpZ3VyZWQgd2l0aCB0aGUgZ2l2ZW4gb3B0aW9ucy5cbiAgICovXG4gIHN0YXRpYyB3aXRoKG9wdGlvbnM6IENoaXBIYXJuZXNzRmlsdGVycyA9IHt9KTogSGFybmVzc1ByZWRpY2F0ZTxNYXRDaGlwSGFybmVzcz4ge1xuICAgIHJldHVybiBuZXcgSGFybmVzc1ByZWRpY2F0ZShNYXRDaGlwSGFybmVzcywgb3B0aW9ucylcbiAgICAgICAgLmFkZE9wdGlvbigndGV4dCcsIG9wdGlvbnMudGV4dCxcbiAgICAgICAgICAgIChoYXJuZXNzLCBsYWJlbCkgPT4gSGFybmVzc1ByZWRpY2F0ZS5zdHJpbmdNYXRjaGVzKGhhcm5lc3MuZ2V0VGV4dCgpLCBsYWJlbCkpXG4gICAgICAgIC5hZGRPcHRpb24oJ3NlbGVjdGVkJywgb3B0aW9ucy5zZWxlY3RlZCxcbiAgICAgICAgICAgIGFzeW5jIChoYXJuZXNzLCBzZWxlY3RlZCkgPT4gKGF3YWl0IGhhcm5lc3MuaXNTZWxlY3RlZCgpKSA9PT0gc2VsZWN0ZWQpO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIHRleHQgb2YgdGhlIGNoaXAuICovXG4gIGFzeW5jIGdldFRleHQoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuaG9zdCgpKS50ZXh0KHtcbiAgICAgIGV4Y2x1ZGU6ICcubWF0LWNoaXAtYXZhdGFyLCAubWF0LWNoaXAtdHJhaWxpbmctaWNvbiwgLm1hdC1pY29uJ1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlIGNoaXAgaXMgc2VsZWN0ZWQuXG4gICAqIEBkZXByZWNhdGVkIFVzZSBgTWF0Q2hpcE9wdGlvbkhhcm5lc3MuaXNTZWxlY3RlZGAgaW5zdGVhZC5cbiAgICogQGJyZWFraW5nLWNoYW5nZSAxMi4wLjBcbiAgICovXG4gIGFzeW5jIGlzU2VsZWN0ZWQoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLmhvc3QoKSkuaGFzQ2xhc3MoJ21hdC1jaGlwLXNlbGVjdGVkJyk7XG4gIH1cblxuICAvKiogV2hldGhlciB0aGUgY2hpcCBpcyBkaXNhYmxlZC4gKi9cbiAgYXN5bmMgaXNEaXNhYmxlZCgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuaG9zdCgpKS5oYXNDbGFzcygnbWF0LWNoaXAtZGlzYWJsZWQnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWxlY3RzIHRoZSBnaXZlbiBjaGlwLiBPbmx5IGFwcGxpZXMgaWYgaXQncyBzZWxlY3RhYmxlLlxuICAgKiBAZGVwcmVjYXRlZCBVc2UgYE1hdENoaXBPcHRpb25IYXJuZXNzLnNlbGVjdGAgaW5zdGVhZC5cbiAgICogQGJyZWFraW5nLWNoYW5nZSAxMi4wLjBcbiAgICovXG4gIGFzeW5jIHNlbGVjdCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoIShhd2FpdCB0aGlzLmlzU2VsZWN0ZWQoKSkpIHtcbiAgICAgIGF3YWl0IHRoaXMudG9nZ2xlKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIERlc2VsZWN0cyB0aGUgZ2l2ZW4gY2hpcC4gT25seSBhcHBsaWVzIGlmIGl0J3Mgc2VsZWN0YWJsZS5cbiAgICogQGRlcHJlY2F0ZWQgVXNlIGBNYXRDaGlwT3B0aW9uSGFybmVzcy5kZXNlbGVjdGAgaW5zdGVhZC5cbiAgICogQGJyZWFraW5nLWNoYW5nZSAxMi4wLjBcbiAgICovXG4gIGFzeW5jIGRlc2VsZWN0KCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmIChhd2FpdCB0aGlzLmlzU2VsZWN0ZWQoKSkge1xuICAgICAgYXdhaXQgdGhpcy50b2dnbGUoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVG9nZ2xlcyB0aGUgc2VsZWN0ZWQgc3RhdGUgb2YgdGhlIGdpdmVuIGNoaXAuIE9ubHkgYXBwbGllcyBpZiBpdCdzIHNlbGVjdGFibGUuXG4gICAqIEBkZXByZWNhdGVkIFVzZSBgTWF0Q2hpcE9wdGlvbkhhcm5lc3MudG9nZ2xlYCBpbnN0ZWFkLlxuICAgKiBAYnJlYWtpbmctY2hhbmdlIDEyLjAuMFxuICAgKi9cbiAgYXN5bmMgdG9nZ2xlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5ob3N0KCkpLnNlbmRLZXlzKCcgJyk7XG4gIH1cblxuICAvKiogUmVtb3ZlcyB0aGUgZ2l2ZW4gY2hpcC4gT25seSBhcHBsaWVzIGlmIGl0J3MgcmVtb3ZhYmxlLiAqL1xuICBhc3luYyByZW1vdmUoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgKGF3YWl0IHRoaXMuaG9zdCgpKS5zZW5kS2V5cyhUZXN0S2V5LkRFTEVURSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgcmVtb3ZlIGJ1dHRvbiBpbnNpZGUgb2YgYSBjaGlwLlxuICAgKiBAcGFyYW0gZmlsdGVyIE9wdGlvbmFsbHkgZmlsdGVycyB3aGljaCBjaGlwcyBhcmUgaW5jbHVkZWQuXG4gICAqL1xuICBhc3luYyBnZXRSZW1vdmVCdXR0b24oZmlsdGVyOiBDaGlwUmVtb3ZlSGFybmVzc0ZpbHRlcnMgPSB7fSk6IFByb21pc2U8TWF0Q2hpcFJlbW92ZUhhcm5lc3M+IHtcbiAgICByZXR1cm4gdGhpcy5sb2NhdG9yRm9yKE1hdENoaXBSZW1vdmVIYXJuZXNzLndpdGgoZmlsdGVyKSkoKTtcbiAgfVxufVxuIl19