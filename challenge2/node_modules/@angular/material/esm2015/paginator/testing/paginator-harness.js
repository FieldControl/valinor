/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { ComponentHarness, HarnessPredicate, } from '@angular/cdk/testing';
import { MatSelectHarness } from '@angular/material/select/testing';
import { coerceNumberProperty } from '@angular/cdk/coercion';
export class _MatPaginatorHarnessBase extends ComponentHarness {
    /** Goes to the next page in the paginator. */
    goToNextPage() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this._nextButton()).click();
        });
    }
    /** Goes to the previous page in the paginator. */
    goToPreviousPage() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this._previousButton()).click();
        });
    }
    /** Goes to the first page in the paginator. */
    goToFirstPage() {
        return __awaiter(this, void 0, void 0, function* () {
            const button = yield this._firstPageButton();
            // The first page button isn't enabled by default so we need to check for it.
            if (!button) {
                throw Error('Could not find first page button inside paginator. ' +
                    'Make sure that `showFirstLastButtons` is enabled.');
            }
            return button.click();
        });
    }
    /** Goes to the last page in the paginator. */
    goToLastPage() {
        return __awaiter(this, void 0, void 0, function* () {
            const button = yield this._lastPageButton();
            // The last page button isn't enabled by default so we need to check for it.
            if (!button) {
                throw Error('Could not find last page button inside paginator. ' +
                    'Make sure that `showFirstLastButtons` is enabled.');
            }
            return button.click();
        });
    }
    /**
     * Sets the page size of the paginator.
     * @param size Page size that should be select.
     */
    setPageSize(size) {
        return __awaiter(this, void 0, void 0, function* () {
            const select = yield this._select();
            // The select is only available if the `pageSizeOptions` are
            // set to an array with more than one item.
            if (!select) {
                throw Error('Cannot find page size selector in paginator. ' +
                    'Make sure that the `pageSizeOptions` have been configured.');
            }
            return select.clickOptions({ text: `${size}` });
        });
    }
    /** Gets the page size of the paginator. */
    getPageSize() {
        return __awaiter(this, void 0, void 0, function* () {
            const select = yield this._select();
            const value = select ? select.getValueText() : (yield this._pageSizeFallback()).text();
            return coerceNumberProperty(yield value);
        });
    }
    /** Gets the text of the range labe of the paginator. */
    getRangeLabel() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this._rangeLabel()).text();
        });
    }
}
/** Harness for interacting with a standard mat-paginator in tests. */
export class MatPaginatorHarness extends _MatPaginatorHarnessBase {
    constructor() {
        super(...arguments);
        this._nextButton = this.locatorFor('.mat-paginator-navigation-next');
        this._previousButton = this.locatorFor('.mat-paginator-navigation-previous');
        this._firstPageButton = this.locatorForOptional('.mat-paginator-navigation-first');
        this._lastPageButton = this.locatorForOptional('.mat-paginator-navigation-last');
        this._select = this.locatorForOptional(MatSelectHarness.with({
            ancestor: '.mat-paginator-page-size'
        }));
        this._pageSizeFallback = this.locatorFor('.mat-paginator-page-size-value');
        this._rangeLabel = this.locatorFor('.mat-paginator-range-label');
    }
    /**
     * Gets a `HarnessPredicate` that can be used to search for a `MatPaginatorHarness` that meets
     * certain criteria.
     * @param options Options for filtering which paginator instances are considered a match.
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return new HarnessPredicate(MatPaginatorHarness, options);
    }
}
/** Selector used to find paginator instances. */
MatPaginatorHarness.hostSelector = '.mat-paginator';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFnaW5hdG9yLWhhcm5lc3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvcGFnaW5hdG9yL3Rlc3RpbmcvcGFnaW5hdG9yLWhhcm5lc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUVILE9BQU8sRUFFTCxnQkFBZ0IsRUFDaEIsZ0JBQWdCLEdBRWpCLE1BQU0sc0JBQXNCLENBQUM7QUFDOUIsT0FBTyxFQUFDLGdCQUFnQixFQUFDLE1BQU0sa0NBQWtDLENBQUM7QUFDbEUsT0FBTyxFQUFDLG9CQUFvQixFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFHM0QsTUFBTSxPQUFnQix3QkFBeUIsU0FBUSxnQkFBZ0I7SUFZckUsOENBQThDO0lBQ3hDLFlBQVk7O1lBQ2hCLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQzVDLENBQUM7S0FBQTtJQUVELGtEQUFrRDtJQUM1QyxnQkFBZ0I7O1lBQ3BCLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ2hELENBQUM7S0FBQTtJQUVELCtDQUErQztJQUN6QyxhQUFhOztZQUNqQixNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBRTdDLDZFQUE2RTtZQUM3RSxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUNYLE1BQU0sS0FBSyxDQUFDLHFEQUFxRDtvQkFDckQsbURBQW1ELENBQUMsQ0FBQzthQUNsRTtZQUVELE9BQU8sTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3hCLENBQUM7S0FBQTtJQUVELDhDQUE4QztJQUN4QyxZQUFZOztZQUNoQixNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztZQUU1Qyw0RUFBNEU7WUFDNUUsSUFBSSxDQUFDLE1BQU0sRUFBRTtnQkFDWCxNQUFNLEtBQUssQ0FBQyxvREFBb0Q7b0JBQ3BELG1EQUFtRCxDQUFDLENBQUM7YUFDbEU7WUFFRCxPQUFPLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUN4QixDQUFDO0tBQUE7SUFFRDs7O09BR0c7SUFDRyxXQUFXLENBQUMsSUFBWTs7WUFDNUIsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7WUFFcEMsNERBQTREO1lBQzVELDJDQUEyQztZQUMzQyxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUNYLE1BQU0sS0FBSyxDQUFDLCtDQUErQztvQkFDL0MsNERBQTRELENBQUMsQ0FBQzthQUMzRTtZQUVELE9BQU8sTUFBTSxDQUFDLFlBQVksQ0FBQyxFQUFDLElBQUksRUFBRSxHQUFHLElBQUksRUFBRSxFQUFDLENBQUMsQ0FBQztRQUNoRCxDQUFDO0tBQUE7SUFFRCwyQ0FBMkM7SUFDckMsV0FBVzs7WUFDZixNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNwQyxNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDdkYsT0FBTyxvQkFBb0IsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDO1FBQzNDLENBQUM7S0FBQTtJQUVELHdEQUF3RDtJQUNsRCxhQUFhOztZQUNqQixPQUFPLENBQUMsTUFBTSxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUMzQyxDQUFDO0tBQUE7Q0FDRjtBQUVELHNFQUFzRTtBQUN0RSxNQUFNLE9BQU8sbUJBQW9CLFNBQVEsd0JBQXdCO0lBQWpFOztRQUdZLGdCQUFXLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDO1FBQ2hFLG9CQUFlLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFDO1FBQ3hFLHFCQUFnQixHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDO1FBQzlFLG9CQUFlLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLGdDQUFnQyxDQUFDLENBQUM7UUFDNUUsWUFBTyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUM7WUFDaEUsUUFBUSxFQUFFLDBCQUEwQjtTQUNyQyxDQUFDLENBQUMsQ0FBQztRQUNNLHNCQUFpQixHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsZ0NBQWdDLENBQUMsQ0FBQztRQUN0RSxnQkFBVyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsNEJBQTRCLENBQUMsQ0FBQztJQVd4RSxDQUFDO0lBVEM7Ozs7O09BS0c7SUFDSCxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQW1DLEVBQUU7UUFDL0MsT0FBTyxJQUFJLGdCQUFnQixDQUFDLG1CQUFtQixFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzVELENBQUM7O0FBcEJELGlEQUFpRDtBQUMxQyxnQ0FBWSxHQUFHLGdCQUFnQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7XG4gIEFzeW5jRmFjdG9yeUZuLFxuICBDb21wb25lbnRIYXJuZXNzLFxuICBIYXJuZXNzUHJlZGljYXRlLFxuICBUZXN0RWxlbWVudCxcbn0gZnJvbSAnQGFuZ3VsYXIvY2RrL3Rlc3RpbmcnO1xuaW1wb3J0IHtNYXRTZWxlY3RIYXJuZXNzfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9zZWxlY3QvdGVzdGluZyc7XG5pbXBvcnQge2NvZXJjZU51bWJlclByb3BlcnR5fSBmcm9tICdAYW5ndWxhci9jZGsvY29lcmNpb24nO1xuaW1wb3J0IHtQYWdpbmF0b3JIYXJuZXNzRmlsdGVyc30gZnJvbSAnLi9wYWdpbmF0b3ItaGFybmVzcy1maWx0ZXJzJztcblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIF9NYXRQYWdpbmF0b3JIYXJuZXNzQmFzZSBleHRlbmRzIENvbXBvbmVudEhhcm5lc3Mge1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgX25leHRCdXR0b246IEFzeW5jRmFjdG9yeUZuPFRlc3RFbGVtZW50PjtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IF9wcmV2aW91c0J1dHRvbjogQXN5bmNGYWN0b3J5Rm48VGVzdEVsZW1lbnQ+O1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgX2ZpcnN0UGFnZUJ1dHRvbjogQXN5bmNGYWN0b3J5Rm48VGVzdEVsZW1lbnQgfCBudWxsPjtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IF9sYXN0UGFnZUJ1dHRvbjogQXN5bmNGYWN0b3J5Rm48VGVzdEVsZW1lbnQgfCBudWxsPjtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IF9zZWxlY3Q6IEFzeW5jRmFjdG9yeUZuPENvbXBvbmVudEhhcm5lc3MgJiB7XG4gICAgZ2V0VmFsdWVUZXh0KCk6IFByb21pc2U8c3RyaW5nPjtcbiAgICBjbGlja09wdGlvbnMoLi4uZmlsdGVyczogdW5rbm93bltdKTogUHJvbWlzZTx2b2lkPjtcbiAgfSB8IG51bGw+O1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgX3BhZ2VTaXplRmFsbGJhY2s6IEFzeW5jRmFjdG9yeUZuPFRlc3RFbGVtZW50PjtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IF9yYW5nZUxhYmVsOiBBc3luY0ZhY3RvcnlGbjxUZXN0RWxlbWVudD47XG5cbiAgLyoqIEdvZXMgdG8gdGhlIG5leHQgcGFnZSBpbiB0aGUgcGFnaW5hdG9yLiAqL1xuICBhc3luYyBnb1RvTmV4dFBhZ2UoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLl9uZXh0QnV0dG9uKCkpLmNsaWNrKCk7XG4gIH1cblxuICAvKiogR29lcyB0byB0aGUgcHJldmlvdXMgcGFnZSBpbiB0aGUgcGFnaW5hdG9yLiAqL1xuICBhc3luYyBnb1RvUHJldmlvdXNQYWdlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5fcHJldmlvdXNCdXR0b24oKSkuY2xpY2soKTtcbiAgfVxuXG4gIC8qKiBHb2VzIHRvIHRoZSBmaXJzdCBwYWdlIGluIHRoZSBwYWdpbmF0b3IuICovXG4gIGFzeW5jIGdvVG9GaXJzdFBhZ2UoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgYnV0dG9uID0gYXdhaXQgdGhpcy5fZmlyc3RQYWdlQnV0dG9uKCk7XG5cbiAgICAvLyBUaGUgZmlyc3QgcGFnZSBidXR0b24gaXNuJ3QgZW5hYmxlZCBieSBkZWZhdWx0IHNvIHdlIG5lZWQgdG8gY2hlY2sgZm9yIGl0LlxuICAgIGlmICghYnV0dG9uKSB7XG4gICAgICB0aHJvdyBFcnJvcignQ291bGQgbm90IGZpbmQgZmlyc3QgcGFnZSBidXR0b24gaW5zaWRlIHBhZ2luYXRvci4gJyArXG4gICAgICAgICAgICAgICAgICAnTWFrZSBzdXJlIHRoYXQgYHNob3dGaXJzdExhc3RCdXR0b25zYCBpcyBlbmFibGVkLicpO1xuICAgIH1cblxuICAgIHJldHVybiBidXR0b24uY2xpY2soKTtcbiAgfVxuXG4gIC8qKiBHb2VzIHRvIHRoZSBsYXN0IHBhZ2UgaW4gdGhlIHBhZ2luYXRvci4gKi9cbiAgYXN5bmMgZ29Ub0xhc3RQYWdlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGJ1dHRvbiA9IGF3YWl0IHRoaXMuX2xhc3RQYWdlQnV0dG9uKCk7XG5cbiAgICAvLyBUaGUgbGFzdCBwYWdlIGJ1dHRvbiBpc24ndCBlbmFibGVkIGJ5IGRlZmF1bHQgc28gd2UgbmVlZCB0byBjaGVjayBmb3IgaXQuXG4gICAgaWYgKCFidXR0b24pIHtcbiAgICAgIHRocm93IEVycm9yKCdDb3VsZCBub3QgZmluZCBsYXN0IHBhZ2UgYnV0dG9uIGluc2lkZSBwYWdpbmF0b3IuICcgK1xuICAgICAgICAgICAgICAgICAgJ01ha2Ugc3VyZSB0aGF0IGBzaG93Rmlyc3RMYXN0QnV0dG9uc2AgaXMgZW5hYmxlZC4nKTtcbiAgICB9XG5cbiAgICByZXR1cm4gYnV0dG9uLmNsaWNrKCk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgcGFnZSBzaXplIG9mIHRoZSBwYWdpbmF0b3IuXG4gICAqIEBwYXJhbSBzaXplIFBhZ2Ugc2l6ZSB0aGF0IHNob3VsZCBiZSBzZWxlY3QuXG4gICAqL1xuICBhc3luYyBzZXRQYWdlU2l6ZShzaXplOiBudW1iZXIpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBzZWxlY3QgPSBhd2FpdCB0aGlzLl9zZWxlY3QoKTtcblxuICAgIC8vIFRoZSBzZWxlY3QgaXMgb25seSBhdmFpbGFibGUgaWYgdGhlIGBwYWdlU2l6ZU9wdGlvbnNgIGFyZVxuICAgIC8vIHNldCB0byBhbiBhcnJheSB3aXRoIG1vcmUgdGhhbiBvbmUgaXRlbS5cbiAgICBpZiAoIXNlbGVjdCkge1xuICAgICAgdGhyb3cgRXJyb3IoJ0Nhbm5vdCBmaW5kIHBhZ2Ugc2l6ZSBzZWxlY3RvciBpbiBwYWdpbmF0b3IuICcgK1xuICAgICAgICAgICAgICAgICAgJ01ha2Ugc3VyZSB0aGF0IHRoZSBgcGFnZVNpemVPcHRpb25zYCBoYXZlIGJlZW4gY29uZmlndXJlZC4nKTtcbiAgICB9XG5cbiAgICByZXR1cm4gc2VsZWN0LmNsaWNrT3B0aW9ucyh7dGV4dDogYCR7c2l6ZX1gfSk7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgcGFnZSBzaXplIG9mIHRoZSBwYWdpbmF0b3IuICovXG4gIGFzeW5jIGdldFBhZ2VTaXplKCk6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgY29uc3Qgc2VsZWN0ID0gYXdhaXQgdGhpcy5fc2VsZWN0KCk7XG4gICAgY29uc3QgdmFsdWUgPSBzZWxlY3QgPyBzZWxlY3QuZ2V0VmFsdWVUZXh0KCkgOiAoYXdhaXQgdGhpcy5fcGFnZVNpemVGYWxsYmFjaygpKS50ZXh0KCk7XG4gICAgcmV0dXJuIGNvZXJjZU51bWJlclByb3BlcnR5KGF3YWl0IHZhbHVlKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSB0ZXh0IG9mIHRoZSByYW5nZSBsYWJlIG9mIHRoZSBwYWdpbmF0b3IuICovXG4gIGFzeW5jIGdldFJhbmdlTGFiZWwoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuX3JhbmdlTGFiZWwoKSkudGV4dCgpO1xuICB9XG59XG5cbi8qKiBIYXJuZXNzIGZvciBpbnRlcmFjdGluZyB3aXRoIGEgc3RhbmRhcmQgbWF0LXBhZ2luYXRvciBpbiB0ZXN0cy4gKi9cbmV4cG9ydCBjbGFzcyBNYXRQYWdpbmF0b3JIYXJuZXNzIGV4dGVuZHMgX01hdFBhZ2luYXRvckhhcm5lc3NCYXNlIHtcbiAgLyoqIFNlbGVjdG9yIHVzZWQgdG8gZmluZCBwYWdpbmF0b3IgaW5zdGFuY2VzLiAqL1xuICBzdGF0aWMgaG9zdFNlbGVjdG9yID0gJy5tYXQtcGFnaW5hdG9yJztcbiAgcHJvdGVjdGVkIF9uZXh0QnV0dG9uID0gdGhpcy5sb2NhdG9yRm9yKCcubWF0LXBhZ2luYXRvci1uYXZpZ2F0aW9uLW5leHQnKTtcbiAgcHJvdGVjdGVkIF9wcmV2aW91c0J1dHRvbiA9IHRoaXMubG9jYXRvckZvcignLm1hdC1wYWdpbmF0b3ItbmF2aWdhdGlvbi1wcmV2aW91cycpO1xuICBwcm90ZWN0ZWQgX2ZpcnN0UGFnZUJ1dHRvbiA9IHRoaXMubG9jYXRvckZvck9wdGlvbmFsKCcubWF0LXBhZ2luYXRvci1uYXZpZ2F0aW9uLWZpcnN0Jyk7XG4gIHByb3RlY3RlZCBfbGFzdFBhZ2VCdXR0b24gPSB0aGlzLmxvY2F0b3JGb3JPcHRpb25hbCgnLm1hdC1wYWdpbmF0b3ItbmF2aWdhdGlvbi1sYXN0Jyk7XG4gIHByb3RlY3RlZCBfc2VsZWN0ID0gdGhpcy5sb2NhdG9yRm9yT3B0aW9uYWwoTWF0U2VsZWN0SGFybmVzcy53aXRoKHtcbiAgICBhbmNlc3RvcjogJy5tYXQtcGFnaW5hdG9yLXBhZ2Utc2l6ZSdcbiAgfSkpO1xuICBwcm90ZWN0ZWQgX3BhZ2VTaXplRmFsbGJhY2sgPSB0aGlzLmxvY2F0b3JGb3IoJy5tYXQtcGFnaW5hdG9yLXBhZ2Utc2l6ZS12YWx1ZScpO1xuICBwcm90ZWN0ZWQgX3JhbmdlTGFiZWwgPSB0aGlzLmxvY2F0b3JGb3IoJy5tYXQtcGFnaW5hdG9yLXJhbmdlLWxhYmVsJyk7XG5cbiAgLyoqXG4gICAqIEdldHMgYSBgSGFybmVzc1ByZWRpY2F0ZWAgdGhhdCBjYW4gYmUgdXNlZCB0byBzZWFyY2ggZm9yIGEgYE1hdFBhZ2luYXRvckhhcm5lc3NgIHRoYXQgbWVldHNcbiAgICogY2VydGFpbiBjcml0ZXJpYS5cbiAgICogQHBhcmFtIG9wdGlvbnMgT3B0aW9ucyBmb3IgZmlsdGVyaW5nIHdoaWNoIHBhZ2luYXRvciBpbnN0YW5jZXMgYXJlIGNvbnNpZGVyZWQgYSBtYXRjaC5cbiAgICogQHJldHVybiBhIGBIYXJuZXNzUHJlZGljYXRlYCBjb25maWd1cmVkIHdpdGggdGhlIGdpdmVuIG9wdGlvbnMuXG4gICAqL1xuICBzdGF0aWMgd2l0aChvcHRpb25zOiBQYWdpbmF0b3JIYXJuZXNzRmlsdGVycyA9IHt9KTogSGFybmVzc1ByZWRpY2F0ZTxNYXRQYWdpbmF0b3JIYXJuZXNzPiB7XG4gICAgcmV0dXJuIG5ldyBIYXJuZXNzUHJlZGljYXRlKE1hdFBhZ2luYXRvckhhcm5lc3MsIG9wdGlvbnMpO1xuICB9XG59XG4iXX0=