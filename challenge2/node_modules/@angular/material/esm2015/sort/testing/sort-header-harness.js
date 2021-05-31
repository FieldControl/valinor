/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';
/** Harness for interacting with a standard Angular Material sort header in tests. */
export class MatSortHeaderHarness extends ComponentHarness {
    constructor() {
        super(...arguments);
        this._container = this.locatorFor('.mat-sort-header-container');
    }
    /**
     * Gets a `HarnessPredicate` that can be used to
     * search for a sort header with specific attributes.
     */
    static with(options = {}) {
        return new HarnessPredicate(MatSortHeaderHarness, options)
            .addOption('label', options.label, (harness, label) => HarnessPredicate.stringMatches(harness.getLabel(), label))
            .addOption('sortDirection', options.sortDirection, (harness, sortDirection) => {
            return HarnessPredicate.stringMatches(harness.getSortDirection(), sortDirection);
        });
    }
    /** Gets the label of the sort header. */
    getLabel() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this._container()).text();
        });
    }
    /** Gets the sorting direction of the header. */
    getSortDirection() {
        return __awaiter(this, void 0, void 0, function* () {
            const host = yield this.host();
            const ariaSort = yield host.getAttribute('aria-sort');
            if (ariaSort === 'ascending') {
                return 'asc';
            }
            else if (ariaSort === 'descending') {
                return 'desc';
            }
            return '';
        });
    }
    /** Gets whether the sort header is currently being sorted by. */
    isActive() {
        return __awaiter(this, void 0, void 0, function* () {
            return !!(yield this.getSortDirection());
        });
    }
    /** Whether the sort header is disabled. */
    isDisabled() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).hasClass('mat-sort-header-disabled');
        });
    }
    /** Clicks the header to change its sorting direction. Only works if the header is enabled. */
    click() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).click();
        });
    }
}
MatSortHeaderHarness.hostSelector = '.mat-sort-header';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic29ydC1oZWFkZXItaGFybmVzcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9zb3J0L3Rlc3Rpbmcvc29ydC1oZWFkZXItaGFybmVzcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBRUgsT0FBTyxFQUFDLGdCQUFnQixFQUFFLGdCQUFnQixFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFJeEUscUZBQXFGO0FBQ3JGLE1BQU0sT0FBTyxvQkFBcUIsU0FBUSxnQkFBZ0I7SUFBMUQ7O1FBRVUsZUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsNEJBQTRCLENBQUMsQ0FBQztJQWdEckUsQ0FBQztJQTlDQzs7O09BR0c7SUFDSCxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQW9DLEVBQUU7UUFDaEQsT0FBTyxJQUFJLGdCQUFnQixDQUFDLG9CQUFvQixFQUFFLE9BQU8sQ0FBQzthQUNyRCxTQUFTLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxLQUFLLEVBQzdCLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQzthQUNqRixTQUFTLENBQUMsZUFBZSxFQUFFLE9BQU8sQ0FBQyxhQUFhLEVBQUUsQ0FBQyxPQUFPLEVBQUUsYUFBYSxFQUFFLEVBQUU7WUFDNUUsT0FBTyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLGdCQUFnQixFQUFFLEVBQUUsYUFBYSxDQUFDLENBQUM7UUFDbkYsQ0FBQyxDQUFDLENBQUM7SUFDVCxDQUFDO0lBRUQseUNBQXlDO0lBQ25DLFFBQVE7O1lBQ1osT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDMUMsQ0FBQztLQUFBO0lBRUQsZ0RBQWdEO0lBQzFDLGdCQUFnQjs7WUFDcEIsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDL0IsTUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBRXRELElBQUksUUFBUSxLQUFLLFdBQVcsRUFBRTtnQkFDNUIsT0FBTyxLQUFLLENBQUM7YUFDZDtpQkFBTSxJQUFJLFFBQVEsS0FBSyxZQUFZLEVBQUU7Z0JBQ3BDLE9BQU8sTUFBTSxDQUFDO2FBQ2Y7WUFFRCxPQUFPLEVBQUUsQ0FBQztRQUNaLENBQUM7S0FBQTtJQUVELGlFQUFpRTtJQUMzRCxRQUFROztZQUNaLE9BQU8sQ0FBQyxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDO1FBQzNDLENBQUM7S0FBQTtJQUVELDJDQUEyQztJQUNyQyxVQUFVOztZQUNkLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO1FBQ2xFLENBQUM7S0FBQTtJQUVELDhGQUE4RjtJQUN4RixLQUFLOztZQUNULE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3JDLENBQUM7S0FBQTs7QUFoRE0saUNBQVksR0FBRyxrQkFBa0IsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NvbXBvbmVudEhhcm5lc3MsIEhhcm5lc3NQcmVkaWNhdGV9IGZyb20gJ0Bhbmd1bGFyL2Nkay90ZXN0aW5nJztcbmltcG9ydCB7U29ydERpcmVjdGlvbn0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvc29ydCc7XG5pbXBvcnQge1NvcnRIZWFkZXJIYXJuZXNzRmlsdGVyc30gZnJvbSAnLi9zb3J0LWhhcm5lc3MtZmlsdGVycyc7XG5cbi8qKiBIYXJuZXNzIGZvciBpbnRlcmFjdGluZyB3aXRoIGEgc3RhbmRhcmQgQW5ndWxhciBNYXRlcmlhbCBzb3J0IGhlYWRlciBpbiB0ZXN0cy4gKi9cbmV4cG9ydCBjbGFzcyBNYXRTb3J0SGVhZGVySGFybmVzcyBleHRlbmRzIENvbXBvbmVudEhhcm5lc3Mge1xuICBzdGF0aWMgaG9zdFNlbGVjdG9yID0gJy5tYXQtc29ydC1oZWFkZXInO1xuICBwcml2YXRlIF9jb250YWluZXIgPSB0aGlzLmxvY2F0b3JGb3IoJy5tYXQtc29ydC1oZWFkZXItY29udGFpbmVyJyk7XG5cbiAgLyoqXG4gICAqIEdldHMgYSBgSGFybmVzc1ByZWRpY2F0ZWAgdGhhdCBjYW4gYmUgdXNlZCB0b1xuICAgKiBzZWFyY2ggZm9yIGEgc29ydCBoZWFkZXIgd2l0aCBzcGVjaWZpYyBhdHRyaWJ1dGVzLlxuICAgKi9cbiAgc3RhdGljIHdpdGgob3B0aW9uczogU29ydEhlYWRlckhhcm5lc3NGaWx0ZXJzID0ge30pOiBIYXJuZXNzUHJlZGljYXRlPE1hdFNvcnRIZWFkZXJIYXJuZXNzPiB7XG4gICAgcmV0dXJuIG5ldyBIYXJuZXNzUHJlZGljYXRlKE1hdFNvcnRIZWFkZXJIYXJuZXNzLCBvcHRpb25zKVxuICAgICAgICAuYWRkT3B0aW9uKCdsYWJlbCcsIG9wdGlvbnMubGFiZWwsXG4gICAgICAgICAgICAoaGFybmVzcywgbGFiZWwpID0+IEhhcm5lc3NQcmVkaWNhdGUuc3RyaW5nTWF0Y2hlcyhoYXJuZXNzLmdldExhYmVsKCksIGxhYmVsKSlcbiAgICAgICAgLmFkZE9wdGlvbignc29ydERpcmVjdGlvbicsIG9wdGlvbnMuc29ydERpcmVjdGlvbiwgKGhhcm5lc3MsIHNvcnREaXJlY3Rpb24pID0+IHtcbiAgICAgICAgICByZXR1cm4gSGFybmVzc1ByZWRpY2F0ZS5zdHJpbmdNYXRjaGVzKGhhcm5lc3MuZ2V0U29ydERpcmVjdGlvbigpLCBzb3J0RGlyZWN0aW9uKTtcbiAgICAgICAgfSk7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgbGFiZWwgb2YgdGhlIHNvcnQgaGVhZGVyLiAqL1xuICBhc3luYyBnZXRMYWJlbCgpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5fY29udGFpbmVyKCkpLnRleHQoKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBzb3J0aW5nIGRpcmVjdGlvbiBvZiB0aGUgaGVhZGVyLiAqL1xuICBhc3luYyBnZXRTb3J0RGlyZWN0aW9uKCk6IFByb21pc2U8U29ydERpcmVjdGlvbj4ge1xuICAgIGNvbnN0IGhvc3QgPSBhd2FpdCB0aGlzLmhvc3QoKTtcbiAgICBjb25zdCBhcmlhU29ydCA9IGF3YWl0IGhvc3QuZ2V0QXR0cmlidXRlKCdhcmlhLXNvcnQnKTtcblxuICAgIGlmIChhcmlhU29ydCA9PT0gJ2FzY2VuZGluZycpIHtcbiAgICAgIHJldHVybiAnYXNjJztcbiAgICB9IGVsc2UgaWYgKGFyaWFTb3J0ID09PSAnZGVzY2VuZGluZycpIHtcbiAgICAgIHJldHVybiAnZGVzYyc7XG4gICAgfVxuXG4gICAgcmV0dXJuICcnO1xuICB9XG5cbiAgLyoqIEdldHMgd2hldGhlciB0aGUgc29ydCBoZWFkZXIgaXMgY3VycmVudGx5IGJlaW5nIHNvcnRlZCBieS4gKi9cbiAgYXN5bmMgaXNBY3RpdmUoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuICEhKGF3YWl0IHRoaXMuZ2V0U29ydERpcmVjdGlvbigpKTtcbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZSBzb3J0IGhlYWRlciBpcyBkaXNhYmxlZC4gKi9cbiAgYXN5bmMgaXNEaXNhYmxlZCgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuaG9zdCgpKS5oYXNDbGFzcygnbWF0LXNvcnQtaGVhZGVyLWRpc2FibGVkJyk7XG4gIH1cblxuICAvKiogQ2xpY2tzIHRoZSBoZWFkZXIgdG8gY2hhbmdlIGl0cyBzb3J0aW5nIGRpcmVjdGlvbi4gT25seSB3b3JrcyBpZiB0aGUgaGVhZGVyIGlzIGVuYWJsZWQuICovXG4gIGFzeW5jIGNsaWNrKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5ob3N0KCkpLmNsaWNrKCk7XG4gIH1cbn1cbiJdfQ==