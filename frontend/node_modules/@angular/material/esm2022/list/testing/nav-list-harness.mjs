/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { HarnessPredicate } from '@angular/cdk/testing';
import { MatListHarnessBase } from './list-harness-base';
import { getListItemPredicate, MatListItemHarnessBase } from './list-item-harness-base';
/** Harness for interacting with a MDC-based mat-nav-list in tests. */
export class MatNavListHarness extends MatListHarnessBase {
    constructor() {
        super(...arguments);
        this._itemHarness = MatNavListItemHarness;
    }
    /** The selector for the host element of a `MatNavList` instance. */
    static { this.hostSelector = '.mat-mdc-nav-list'; }
    /**
     * Gets a `HarnessPredicate` that can be used to search for a nav list with specific
     * attributes.
     * @param options Options for filtering which nav list instances are considered a match.
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return new HarnessPredicate(this, options);
    }
}
/** Harness for interacting with a MDC-based nav-list item. */
export class MatNavListItemHarness extends MatListItemHarnessBase {
    /** The selector for the host element of a `MatListItem` instance. */
    static { this.hostSelector = `${MatNavListHarness.hostSelector} .mat-mdc-list-item`; }
    /**
     * Gets a `HarnessPredicate` that can be used to search for a nav list item with specific
     * attributes.
     * @param options Options for filtering which nav list item instances are considered a match.
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return getListItemPredicate(this, options)
            .addOption('href', options.href, async (harness, href) => HarnessPredicate.stringMatches(harness.getHref(), href))
            .addOption('activated', options.activated, async (harness, activated) => (await harness.isActivated()) === activated);
    }
    /** Gets the href for this nav list item. */
    async getHref() {
        return (await this.host()).getAttribute('href');
    }
    /** Clicks on the nav list item. */
    async click() {
        return (await this.host()).click();
    }
    /** Focuses the nav list item. */
    async focus() {
        return (await this.host()).focus();
    }
    /** Blurs the nav list item. */
    async blur() {
        return (await this.host()).blur();
    }
    /** Whether the nav list item is focused. */
    async isFocused() {
        return (await this.host()).isFocused();
    }
    /** Whether the list item is activated. Should only be used for nav list items. */
    async isActivated() {
        return (await this.host()).hasClass('mdc-list-item--activated');
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmF2LWxpc3QtaGFybmVzcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9saXN0L3Rlc3RpbmcvbmF2LWxpc3QtaGFybmVzcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQThCLGdCQUFnQixFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFDbkYsT0FBTyxFQUFDLGtCQUFrQixFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFFdkQsT0FBTyxFQUFDLG9CQUFvQixFQUFFLHNCQUFzQixFQUFDLE1BQU0sMEJBQTBCLENBQUM7QUFFdEYsc0VBQXNFO0FBQ3RFLE1BQU0sT0FBTyxpQkFBa0IsU0FBUSxrQkFJdEM7SUFKRDs7UUFxQlcsaUJBQVksR0FBRyxxQkFBcUIsQ0FBQztJQUNoRCxDQUFDO0lBakJDLG9FQUFvRTthQUM3RCxpQkFBWSxHQUFHLG1CQUFtQixBQUF0QixDQUF1QjtJQUUxQzs7Ozs7T0FLRztJQUNILE1BQU0sQ0FBQyxJQUFJLENBRVQsVUFBaUMsRUFBRTtRQUVuQyxPQUFPLElBQUksZ0JBQWdCLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzdDLENBQUM7O0FBS0gsOERBQThEO0FBQzlELE1BQU0sT0FBTyxxQkFBc0IsU0FBUSxzQkFBc0I7SUFDL0QscUVBQXFFO2FBQzlELGlCQUFZLEdBQUcsR0FBRyxpQkFBaUIsQ0FBQyxZQUFZLHFCQUFxQixDQUFDO0lBRTdFOzs7OztPQUtHO0lBQ0gsTUFBTSxDQUFDLElBQUksQ0FFVCxVQUFxQyxFQUFFO1FBRXZDLE9BQU8sb0JBQW9CLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQzthQUN2QyxTQUFTLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUN2RCxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxFQUFFLElBQUksQ0FBQyxDQUN4RDthQUNBLFNBQVMsQ0FDUixXQUFXLEVBQ1gsT0FBTyxDQUFDLFNBQVMsRUFDakIsS0FBSyxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsRUFBRSxDQUFDLENBQUMsTUFBTSxPQUFPLENBQUMsV0FBVyxFQUFFLENBQUMsS0FBSyxTQUFTLENBQzFFLENBQUM7SUFDTixDQUFDO0lBRUQsNENBQTRDO0lBQzVDLEtBQUssQ0FBQyxPQUFPO1FBQ1gsT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ2xELENBQUM7SUFFRCxtQ0FBbUM7SUFDbkMsS0FBSyxDQUFDLEtBQUs7UUFDVCxPQUFPLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNyQyxDQUFDO0lBRUQsaUNBQWlDO0lBQ2pDLEtBQUssQ0FBQyxLQUFLO1FBQ1QsT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDckMsQ0FBQztJQUVELCtCQUErQjtJQUMvQixLQUFLLENBQUMsSUFBSTtRQUNSLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ3BDLENBQUM7SUFFRCw0Q0FBNEM7SUFDNUMsS0FBSyxDQUFDLFNBQVM7UUFDYixPQUFPLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUN6QyxDQUFDO0lBRUQsa0ZBQWtGO0lBQ2xGLEtBQUssQ0FBQyxXQUFXO1FBQ2YsT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLDBCQUEwQixDQUFDLENBQUM7SUFDbEUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NvbXBvbmVudEhhcm5lc3NDb25zdHJ1Y3RvciwgSGFybmVzc1ByZWRpY2F0ZX0gZnJvbSAnQGFuZ3VsYXIvY2RrL3Rlc3RpbmcnO1xuaW1wb3J0IHtNYXRMaXN0SGFybmVzc0Jhc2V9IGZyb20gJy4vbGlzdC1oYXJuZXNzLWJhc2UnO1xuaW1wb3J0IHtOYXZMaXN0SGFybmVzc0ZpbHRlcnMsIE5hdkxpc3RJdGVtSGFybmVzc0ZpbHRlcnN9IGZyb20gJy4vbGlzdC1oYXJuZXNzLWZpbHRlcnMnO1xuaW1wb3J0IHtnZXRMaXN0SXRlbVByZWRpY2F0ZSwgTWF0TGlzdEl0ZW1IYXJuZXNzQmFzZX0gZnJvbSAnLi9saXN0LWl0ZW0taGFybmVzcy1iYXNlJztcblxuLyoqIEhhcm5lc3MgZm9yIGludGVyYWN0aW5nIHdpdGggYSBNREMtYmFzZWQgbWF0LW5hdi1saXN0IGluIHRlc3RzLiAqL1xuZXhwb3J0IGNsYXNzIE1hdE5hdkxpc3RIYXJuZXNzIGV4dGVuZHMgTWF0TGlzdEhhcm5lc3NCYXNlPFxuICB0eXBlb2YgTWF0TmF2TGlzdEl0ZW1IYXJuZXNzLFxuICBNYXROYXZMaXN0SXRlbUhhcm5lc3MsXG4gIE5hdkxpc3RJdGVtSGFybmVzc0ZpbHRlcnNcbj4ge1xuICAvKiogVGhlIHNlbGVjdG9yIGZvciB0aGUgaG9zdCBlbGVtZW50IG9mIGEgYE1hdE5hdkxpc3RgIGluc3RhbmNlLiAqL1xuICBzdGF0aWMgaG9zdFNlbGVjdG9yID0gJy5tYXQtbWRjLW5hdi1saXN0JztcblxuICAvKipcbiAgICogR2V0cyBhIGBIYXJuZXNzUHJlZGljYXRlYCB0aGF0IGNhbiBiZSB1c2VkIHRvIHNlYXJjaCBmb3IgYSBuYXYgbGlzdCB3aXRoIHNwZWNpZmljXG4gICAqIGF0dHJpYnV0ZXMuXG4gICAqIEBwYXJhbSBvcHRpb25zIE9wdGlvbnMgZm9yIGZpbHRlcmluZyB3aGljaCBuYXYgbGlzdCBpbnN0YW5jZXMgYXJlIGNvbnNpZGVyZWQgYSBtYXRjaC5cbiAgICogQHJldHVybiBhIGBIYXJuZXNzUHJlZGljYXRlYCBjb25maWd1cmVkIHdpdGggdGhlIGdpdmVuIG9wdGlvbnMuXG4gICAqL1xuICBzdGF0aWMgd2l0aDxUIGV4dGVuZHMgTWF0TmF2TGlzdEhhcm5lc3M+KFxuICAgIHRoaXM6IENvbXBvbmVudEhhcm5lc3NDb25zdHJ1Y3RvcjxUPixcbiAgICBvcHRpb25zOiBOYXZMaXN0SGFybmVzc0ZpbHRlcnMgPSB7fSxcbiAgKTogSGFybmVzc1ByZWRpY2F0ZTxUPiB7XG4gICAgcmV0dXJuIG5ldyBIYXJuZXNzUHJlZGljYXRlKHRoaXMsIG9wdGlvbnMpO1xuICB9XG5cbiAgb3ZlcnJpZGUgX2l0ZW1IYXJuZXNzID0gTWF0TmF2TGlzdEl0ZW1IYXJuZXNzO1xufVxuXG4vKiogSGFybmVzcyBmb3IgaW50ZXJhY3Rpbmcgd2l0aCBhIE1EQy1iYXNlZCBuYXYtbGlzdCBpdGVtLiAqL1xuZXhwb3J0IGNsYXNzIE1hdE5hdkxpc3RJdGVtSGFybmVzcyBleHRlbmRzIE1hdExpc3RJdGVtSGFybmVzc0Jhc2Uge1xuICAvKiogVGhlIHNlbGVjdG9yIGZvciB0aGUgaG9zdCBlbGVtZW50IG9mIGEgYE1hdExpc3RJdGVtYCBpbnN0YW5jZS4gKi9cbiAgc3RhdGljIGhvc3RTZWxlY3RvciA9IGAke01hdE5hdkxpc3RIYXJuZXNzLmhvc3RTZWxlY3Rvcn0gLm1hdC1tZGMtbGlzdC1pdGVtYDtcblxuICAvKipcbiAgICogR2V0cyBhIGBIYXJuZXNzUHJlZGljYXRlYCB0aGF0IGNhbiBiZSB1c2VkIHRvIHNlYXJjaCBmb3IgYSBuYXYgbGlzdCBpdGVtIHdpdGggc3BlY2lmaWNcbiAgICogYXR0cmlidXRlcy5cbiAgICogQHBhcmFtIG9wdGlvbnMgT3B0aW9ucyBmb3IgZmlsdGVyaW5nIHdoaWNoIG5hdiBsaXN0IGl0ZW0gaW5zdGFuY2VzIGFyZSBjb25zaWRlcmVkIGEgbWF0Y2guXG4gICAqIEByZXR1cm4gYSBgSGFybmVzc1ByZWRpY2F0ZWAgY29uZmlndXJlZCB3aXRoIHRoZSBnaXZlbiBvcHRpb25zLlxuICAgKi9cbiAgc3RhdGljIHdpdGg8VCBleHRlbmRzIE1hdE5hdkxpc3RJdGVtSGFybmVzcz4oXG4gICAgdGhpczogQ29tcG9uZW50SGFybmVzc0NvbnN0cnVjdG9yPFQ+LFxuICAgIG9wdGlvbnM6IE5hdkxpc3RJdGVtSGFybmVzc0ZpbHRlcnMgPSB7fSxcbiAgKTogSGFybmVzc1ByZWRpY2F0ZTxUPiB7XG4gICAgcmV0dXJuIGdldExpc3RJdGVtUHJlZGljYXRlKHRoaXMsIG9wdGlvbnMpXG4gICAgICAuYWRkT3B0aW9uKCdocmVmJywgb3B0aW9ucy5ocmVmLCBhc3luYyAoaGFybmVzcywgaHJlZikgPT5cbiAgICAgICAgSGFybmVzc1ByZWRpY2F0ZS5zdHJpbmdNYXRjaGVzKGhhcm5lc3MuZ2V0SHJlZigpLCBocmVmKSxcbiAgICAgIClcbiAgICAgIC5hZGRPcHRpb24oXG4gICAgICAgICdhY3RpdmF0ZWQnLFxuICAgICAgICBvcHRpb25zLmFjdGl2YXRlZCxcbiAgICAgICAgYXN5bmMgKGhhcm5lc3MsIGFjdGl2YXRlZCkgPT4gKGF3YWl0IGhhcm5lc3MuaXNBY3RpdmF0ZWQoKSkgPT09IGFjdGl2YXRlZCxcbiAgICAgICk7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgaHJlZiBmb3IgdGhpcyBuYXYgbGlzdCBpdGVtLiAqL1xuICBhc3luYyBnZXRIcmVmKCk6IFByb21pc2U8c3RyaW5nIHwgbnVsbD4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5ob3N0KCkpLmdldEF0dHJpYnV0ZSgnaHJlZicpO1xuICB9XG5cbiAgLyoqIENsaWNrcyBvbiB0aGUgbmF2IGxpc3QgaXRlbS4gKi9cbiAgYXN5bmMgY2xpY2soKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLmhvc3QoKSkuY2xpY2soKTtcbiAgfVxuXG4gIC8qKiBGb2N1c2VzIHRoZSBuYXYgbGlzdCBpdGVtLiAqL1xuICBhc3luYyBmb2N1cygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuaG9zdCgpKS5mb2N1cygpO1xuICB9XG5cbiAgLyoqIEJsdXJzIHRoZSBuYXYgbGlzdCBpdGVtLiAqL1xuICBhc3luYyBibHVyKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5ob3N0KCkpLmJsdXIoKTtcbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZSBuYXYgbGlzdCBpdGVtIGlzIGZvY3VzZWQuICovXG4gIGFzeW5jIGlzRm9jdXNlZCgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuaG9zdCgpKS5pc0ZvY3VzZWQoKTtcbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZSBsaXN0IGl0ZW0gaXMgYWN0aXZhdGVkLiBTaG91bGQgb25seSBiZSB1c2VkIGZvciBuYXYgbGlzdCBpdGVtcy4gKi9cbiAgYXN5bmMgaXNBY3RpdmF0ZWQoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLmhvc3QoKSkuaGFzQ2xhc3MoJ21kYy1saXN0LWl0ZW0tLWFjdGl2YXRlZCcpO1xuICB9XG59XG4iXX0=