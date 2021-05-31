/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { ComponentHarness, HarnessPredicate, parallel } from '@angular/cdk/testing';
import { MatTabHarness } from './tab-harness';
/** Harness for interacting with a standard mat-tab-group in tests. */
export class MatTabGroupHarness extends ComponentHarness {
    /**
     * Gets a `HarnessPredicate` that can be used to search for a `MatTabGroupHarness` that meets
     * certain criteria.
     * @param options Options for filtering which tab group instances are considered a match.
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return new HarnessPredicate(MatTabGroupHarness, options)
            .addOption('selectedTabLabel', options.selectedTabLabel, (harness, label) => __awaiter(this, void 0, void 0, function* () {
            const selectedTab = yield harness.getSelectedTab();
            return HarnessPredicate.stringMatches(yield selectedTab.getLabel(), label);
        }));
    }
    /**
     * Gets the list of tabs in the tab group.
     * @param filter Optionally filters which tabs are included.
     */
    getTabs(filter = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.locatorForAll(MatTabHarness.with(filter))();
        });
    }
    /** Gets the selected tab of the tab group. */
    getSelectedTab() {
        return __awaiter(this, void 0, void 0, function* () {
            const tabs = yield this.getTabs();
            const isSelected = yield parallel(() => tabs.map(t => t.isSelected()));
            for (let i = 0; i < tabs.length; i++) {
                if (isSelected[i]) {
                    return tabs[i];
                }
            }
            throw new Error('No selected tab could be found.');
        });
    }
    /**
     * Selects a tab in this tab group.
     * @param filter An optional filter to apply to the child tabs. The first tab matching the filter
     *     will be selected.
     */
    selectTab(filter = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const tabs = yield this.getTabs(filter);
            if (!tabs.length) {
                throw Error(`Cannot find mat-tab matching filter ${JSON.stringify(filter)}`);
            }
            yield tabs[0].select();
        });
    }
}
/** The selector for the host element of a `MatTabGroup` instance. */
MatTabGroupHarness.hostSelector = '.mat-tab-group';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFiLWdyb3VwLWhhcm5lc3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvdGFicy90ZXN0aW5nL3RhYi1ncm91cC1oYXJuZXNzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFFSCxPQUFPLEVBQUMsZ0JBQWdCLEVBQUUsZ0JBQWdCLEVBQUUsUUFBUSxFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFFbEYsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUU1QyxzRUFBc0U7QUFDdEUsTUFBTSxPQUFPLGtCQUFtQixTQUFRLGdCQUFnQjtJQUl0RDs7Ozs7T0FLRztJQUNILE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBa0MsRUFBRTtRQUM5QyxPQUFPLElBQUksZ0JBQWdCLENBQUMsa0JBQWtCLEVBQUUsT0FBTyxDQUFDO2FBQ25ELFNBQVMsQ0FBQyxrQkFBa0IsRUFBRSxPQUFPLENBQUMsZ0JBQWdCLEVBQUUsQ0FBTyxPQUFPLEVBQUUsS0FBSyxFQUFFLEVBQUU7WUFDaEYsTUFBTSxXQUFXLEdBQUcsTUFBTSxPQUFPLENBQUMsY0FBYyxFQUFFLENBQUM7WUFDbkQsT0FBTyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsTUFBTSxXQUFXLENBQUMsUUFBUSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDN0UsQ0FBQyxDQUFBLENBQUMsQ0FBQztJQUNULENBQUM7SUFFRDs7O09BR0c7SUFDRyxPQUFPLENBQUMsU0FBNEIsRUFBRTs7WUFDMUMsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQzFELENBQUM7S0FBQTtJQUVELDhDQUE4QztJQUN4QyxjQUFjOztZQUNsQixNQUFNLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNsQyxNQUFNLFVBQVUsR0FBRyxNQUFNLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN2RSxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDcEMsSUFBSSxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUU7b0JBQ2pCLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUNoQjthQUNGO1lBQ0QsTUFBTSxJQUFJLEtBQUssQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDO1FBQ3JELENBQUM7S0FBQTtJQUVEOzs7O09BSUc7SUFDRyxTQUFTLENBQUMsU0FBNEIsRUFBRTs7WUFDNUMsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3hDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUNoQixNQUFNLEtBQUssQ0FBQyx1Q0FBdUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7YUFDOUU7WUFDRCxNQUFNLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUN6QixDQUFDO0tBQUE7O0FBaERELHFFQUFxRTtBQUM5RCwrQkFBWSxHQUFHLGdCQUFnQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Q29tcG9uZW50SGFybmVzcywgSGFybmVzc1ByZWRpY2F0ZSwgcGFyYWxsZWx9IGZyb20gJ0Bhbmd1bGFyL2Nkay90ZXN0aW5nJztcbmltcG9ydCB7VGFiR3JvdXBIYXJuZXNzRmlsdGVycywgVGFiSGFybmVzc0ZpbHRlcnN9IGZyb20gJy4vdGFiLWhhcm5lc3MtZmlsdGVycyc7XG5pbXBvcnQge01hdFRhYkhhcm5lc3N9IGZyb20gJy4vdGFiLWhhcm5lc3MnO1xuXG4vKiogSGFybmVzcyBmb3IgaW50ZXJhY3Rpbmcgd2l0aCBhIHN0YW5kYXJkIG1hdC10YWItZ3JvdXAgaW4gdGVzdHMuICovXG5leHBvcnQgY2xhc3MgTWF0VGFiR3JvdXBIYXJuZXNzIGV4dGVuZHMgQ29tcG9uZW50SGFybmVzcyB7XG4gIC8qKiBUaGUgc2VsZWN0b3IgZm9yIHRoZSBob3N0IGVsZW1lbnQgb2YgYSBgTWF0VGFiR3JvdXBgIGluc3RhbmNlLiAqL1xuICBzdGF0aWMgaG9zdFNlbGVjdG9yID0gJy5tYXQtdGFiLWdyb3VwJztcblxuICAvKipcbiAgICogR2V0cyBhIGBIYXJuZXNzUHJlZGljYXRlYCB0aGF0IGNhbiBiZSB1c2VkIHRvIHNlYXJjaCBmb3IgYSBgTWF0VGFiR3JvdXBIYXJuZXNzYCB0aGF0IG1lZXRzXG4gICAqIGNlcnRhaW4gY3JpdGVyaWEuXG4gICAqIEBwYXJhbSBvcHRpb25zIE9wdGlvbnMgZm9yIGZpbHRlcmluZyB3aGljaCB0YWIgZ3JvdXAgaW5zdGFuY2VzIGFyZSBjb25zaWRlcmVkIGEgbWF0Y2guXG4gICAqIEByZXR1cm4gYSBgSGFybmVzc1ByZWRpY2F0ZWAgY29uZmlndXJlZCB3aXRoIHRoZSBnaXZlbiBvcHRpb25zLlxuICAgKi9cbiAgc3RhdGljIHdpdGgob3B0aW9uczogVGFiR3JvdXBIYXJuZXNzRmlsdGVycyA9IHt9KTogSGFybmVzc1ByZWRpY2F0ZTxNYXRUYWJHcm91cEhhcm5lc3M+IHtcbiAgICByZXR1cm4gbmV3IEhhcm5lc3NQcmVkaWNhdGUoTWF0VGFiR3JvdXBIYXJuZXNzLCBvcHRpb25zKVxuICAgICAgICAuYWRkT3B0aW9uKCdzZWxlY3RlZFRhYkxhYmVsJywgb3B0aW9ucy5zZWxlY3RlZFRhYkxhYmVsLCBhc3luYyAoaGFybmVzcywgbGFiZWwpID0+IHtcbiAgICAgICAgICBjb25zdCBzZWxlY3RlZFRhYiA9IGF3YWl0IGhhcm5lc3MuZ2V0U2VsZWN0ZWRUYWIoKTtcbiAgICAgICAgICByZXR1cm4gSGFybmVzc1ByZWRpY2F0ZS5zdHJpbmdNYXRjaGVzKGF3YWl0IHNlbGVjdGVkVGFiLmdldExhYmVsKCksIGxhYmVsKTtcbiAgICAgICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgbGlzdCBvZiB0YWJzIGluIHRoZSB0YWIgZ3JvdXAuXG4gICAqIEBwYXJhbSBmaWx0ZXIgT3B0aW9uYWxseSBmaWx0ZXJzIHdoaWNoIHRhYnMgYXJlIGluY2x1ZGVkLlxuICAgKi9cbiAgYXN5bmMgZ2V0VGFicyhmaWx0ZXI6IFRhYkhhcm5lc3NGaWx0ZXJzID0ge30pOiBQcm9taXNlPE1hdFRhYkhhcm5lc3NbXT4ge1xuICAgIHJldHVybiB0aGlzLmxvY2F0b3JGb3JBbGwoTWF0VGFiSGFybmVzcy53aXRoKGZpbHRlcikpKCk7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgc2VsZWN0ZWQgdGFiIG9mIHRoZSB0YWIgZ3JvdXAuICovXG4gIGFzeW5jIGdldFNlbGVjdGVkVGFiKCk6IFByb21pc2U8TWF0VGFiSGFybmVzcz4ge1xuICAgIGNvbnN0IHRhYnMgPSBhd2FpdCB0aGlzLmdldFRhYnMoKTtcbiAgICBjb25zdCBpc1NlbGVjdGVkID0gYXdhaXQgcGFyYWxsZWwoKCkgPT4gdGFicy5tYXAodCA9PiB0LmlzU2VsZWN0ZWQoKSkpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGFicy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKGlzU2VsZWN0ZWRbaV0pIHtcbiAgICAgICAgcmV0dXJuIHRhYnNbaV07XG4gICAgICB9XG4gICAgfVxuICAgIHRocm93IG5ldyBFcnJvcignTm8gc2VsZWN0ZWQgdGFiIGNvdWxkIGJlIGZvdW5kLicpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlbGVjdHMgYSB0YWIgaW4gdGhpcyB0YWIgZ3JvdXAuXG4gICAqIEBwYXJhbSBmaWx0ZXIgQW4gb3B0aW9uYWwgZmlsdGVyIHRvIGFwcGx5IHRvIHRoZSBjaGlsZCB0YWJzLiBUaGUgZmlyc3QgdGFiIG1hdGNoaW5nIHRoZSBmaWx0ZXJcbiAgICogICAgIHdpbGwgYmUgc2VsZWN0ZWQuXG4gICAqL1xuICBhc3luYyBzZWxlY3RUYWIoZmlsdGVyOiBUYWJIYXJuZXNzRmlsdGVycyA9IHt9KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgdGFicyA9IGF3YWl0IHRoaXMuZ2V0VGFicyhmaWx0ZXIpO1xuICAgIGlmICghdGFicy5sZW5ndGgpIHtcbiAgICAgIHRocm93IEVycm9yKGBDYW5ub3QgZmluZCBtYXQtdGFiIG1hdGNoaW5nIGZpbHRlciAke0pTT04uc3RyaW5naWZ5KGZpbHRlcil9YCk7XG4gICAgfVxuICAgIGF3YWl0IHRhYnNbMF0uc2VsZWN0KCk7XG4gIH1cbn1cbiJdfQ==