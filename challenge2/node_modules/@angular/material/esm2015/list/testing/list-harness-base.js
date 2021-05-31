/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { ComponentHarness, parallel } from '@angular/cdk/testing';
import { MatDividerHarness } from '@angular/material/divider/testing';
import { MatSubheaderHarness } from './list-item-harness-base';
/**
 * Shared behavior among the harnesses for the various `MatList` flavors.
 * @template T A constructor type for a list item harness type used by this list harness.
 * @template C The list item harness type that `T` constructs.
 * @template F The filter type used filter list item harness of type `C`.
 * @docs-private
 */
export class MatListHarnessBase extends ComponentHarness {
    /**
     * Gets a list of harnesses representing the items in this list.
     * @param filters Optional filters used to narrow which harnesses are included
     * @return The list of items matching the given filters.
     */
    getItems(filters) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.locatorForAll(this._itemHarness.with(filters))();
        });
    }
    /**
     * Gets a list of `ListSection` representing the list items grouped by subheaders. If the list has
     * no subheaders it is represented as a single `ListSection` with an undefined `heading` property.
     * @param filters Optional filters used to narrow which list item harnesses are included
     * @return The list of items matching the given filters, grouped into sections by subheader.
     */
    getItemsGroupedBySubheader(filters) {
        return __awaiter(this, void 0, void 0, function* () {
            const listSections = [];
            let currentSection = { items: [] };
            const itemsAndSubheaders = yield this.getItemsWithSubheadersAndDividers({ item: filters, divider: false });
            for (const itemOrSubheader of itemsAndSubheaders) {
                if (itemOrSubheader instanceof MatSubheaderHarness) {
                    if (currentSection.heading !== undefined || currentSection.items.length) {
                        listSections.push(currentSection);
                    }
                    currentSection = { heading: itemOrSubheader.getText(), items: [] };
                }
                else {
                    currentSection.items.push(itemOrSubheader);
                }
            }
            if (currentSection.heading !== undefined || currentSection.items.length ||
                !listSections.length) {
                listSections.push(currentSection);
            }
            // Concurrently wait for all sections to resolve their heading if present.
            return parallel(() => listSections.map((s) => __awaiter(this, void 0, void 0, function* () { return ({ items: s.items, heading: yield s.heading }); })));
        });
    }
    /**
     * Gets a list of sub-lists representing the list items grouped by dividers. If the list has no
     * dividers it is represented as a list with a single sub-list.
     * @param filters Optional filters used to narrow which list item harnesses are included
     * @return The list of items matching the given filters, grouped into sub-lists by divider.
     */
    getItemsGroupedByDividers(filters) {
        return __awaiter(this, void 0, void 0, function* () {
            const listSections = [[]];
            const itemsAndDividers = yield this.getItemsWithSubheadersAndDividers({ item: filters, subheader: false });
            for (const itemOrDivider of itemsAndDividers) {
                if (itemOrDivider instanceof MatDividerHarness) {
                    listSections.push([]);
                }
                else {
                    listSections[listSections.length - 1].push(itemOrDivider);
                }
            }
            return listSections;
        });
    }
    getItemsWithSubheadersAndDividers(filters = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = [];
            if (filters.item !== false) {
                query.push(this._itemHarness.with(filters.item || {}));
            }
            if (filters.subheader !== false) {
                query.push(MatSubheaderHarness.with(filters.subheader));
            }
            if (filters.divider !== false) {
                query.push(MatDividerHarness.with(filters.divider));
            }
            return this.locatorForAll(...query)();
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdC1oYXJuZXNzLWJhc2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvbGlzdC90ZXN0aW5nL2xpc3QtaGFybmVzcy1iYXNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFFSCxPQUFPLEVBQ0wsZ0JBQWdCLEVBR2hCLFFBQVEsRUFDVCxNQUFNLHNCQUFzQixDQUFDO0FBQzlCLE9BQU8sRUFBd0IsaUJBQWlCLEVBQUMsTUFBTSxtQ0FBbUMsQ0FBQztBQUUzRixPQUFPLEVBQUMsbUJBQW1CLEVBQUMsTUFBTSwwQkFBMEIsQ0FBQztBQVc3RDs7Ozs7O0dBTUc7QUFDSCxNQUFNLE9BQWdCLGtCQUtoQixTQUFRLGdCQUFnQjtJQUc1Qjs7OztPQUlHO0lBQ0csUUFBUSxDQUFDLE9BQVc7O1lBQ3hCLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDL0QsQ0FBQztLQUFBO0lBRUQ7Ozs7O09BS0c7SUFDRywwQkFBMEIsQ0FBQyxPQUFXOztZQUUxQyxNQUFNLFlBQVksR0FBYyxFQUFFLENBQUM7WUFDbkMsSUFBSSxjQUFjLEdBQVksRUFBQyxLQUFLLEVBQUUsRUFBRSxFQUFDLENBQUM7WUFDMUMsTUFBTSxrQkFBa0IsR0FDcEIsTUFBTSxJQUFJLENBQUMsaUNBQWlDLENBQUMsRUFBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUMsQ0FBQyxDQUFDO1lBQ2xGLEtBQUssTUFBTSxlQUFlLElBQUksa0JBQWtCLEVBQUU7Z0JBQ2hELElBQUksZUFBZSxZQUFZLG1CQUFtQixFQUFFO29CQUNsRCxJQUFJLGNBQWMsQ0FBQyxPQUFPLEtBQUssU0FBUyxJQUFJLGNBQWMsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFO3dCQUN2RSxZQUFZLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO3FCQUNuQztvQkFDRCxjQUFjLEdBQUcsRUFBQyxPQUFPLEVBQUUsZUFBZSxDQUFDLE9BQU8sRUFBRSxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUMsQ0FBQztpQkFDbEU7cUJBQU07b0JBQ0wsY0FBYyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7aUJBQzVDO2FBQ0Y7WUFDRCxJQUFJLGNBQWMsQ0FBQyxPQUFPLEtBQUssU0FBUyxJQUFJLGNBQWMsQ0FBQyxLQUFLLENBQUMsTUFBTTtnQkFDbkUsQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFO2dCQUN4QixZQUFZLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO2FBQ25DO1lBRUQsMEVBQTBFO1lBQzFFLE9BQU8sUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBTyxDQUFDLEVBQUUsRUFBRSxnREFDakQsT0FBQSxDQUFDLEVBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDLE9BQU8sRUFBQyxDQUFDLENBQUEsR0FBQSxDQUFDLENBQUMsQ0FBQztRQUNuRCxDQUFDO0tBQUE7SUFFRDs7Ozs7T0FLRztJQUNHLHlCQUF5QixDQUFDLE9BQVc7O1lBQ3pDLE1BQU0sWUFBWSxHQUFVLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDakMsTUFBTSxnQkFBZ0IsR0FDbEIsTUFBTSxJQUFJLENBQUMsaUNBQWlDLENBQUMsRUFBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUMsQ0FBQyxDQUFDO1lBQ3BGLEtBQUssTUFBTSxhQUFhLElBQUksZ0JBQWdCLEVBQUU7Z0JBQzVDLElBQUksYUFBYSxZQUFZLGlCQUFpQixFQUFFO29CQUM5QyxZQUFZLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2lCQUN2QjtxQkFBTTtvQkFDTCxZQUFZLENBQUMsWUFBWSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7aUJBQzNEO2FBQ0Y7WUFDRCxPQUFPLFlBQVksQ0FBQztRQUN0QixDQUFDO0tBQUE7SUFvREssaUNBQWlDLENBQUMsVUFJcEMsRUFBRTs7WUFDSixNQUFNLEtBQUssR0FBRyxFQUFFLENBQUM7WUFDakIsSUFBSSxPQUFPLENBQUMsSUFBSSxLQUFLLEtBQUssRUFBRTtnQkFDMUIsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxJQUFJLEVBQU8sQ0FBQyxDQUFDLENBQUM7YUFDN0Q7WUFDRCxJQUFJLE9BQU8sQ0FBQyxTQUFTLEtBQUssS0FBSyxFQUFFO2dCQUMvQixLQUFLLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQzthQUN6RDtZQUNELElBQUksT0FBTyxDQUFDLE9BQU8sS0FBSyxLQUFLLEVBQUU7Z0JBQzdCLEtBQUssQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO2FBQ3JEO1lBQ0QsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsS0FBSyxDQUFDLEVBQUUsQ0FBQztRQUN4QyxDQUFDO0tBQUE7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1xuICBDb21wb25lbnRIYXJuZXNzLFxuICBDb21wb25lbnRIYXJuZXNzQ29uc3RydWN0b3IsXG4gIEhhcm5lc3NQcmVkaWNhdGUsXG4gIHBhcmFsbGVsXG59IGZyb20gJ0Bhbmd1bGFyL2Nkay90ZXN0aW5nJztcbmltcG9ydCB7RGl2aWRlckhhcm5lc3NGaWx0ZXJzLCBNYXREaXZpZGVySGFybmVzc30gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvZGl2aWRlci90ZXN0aW5nJztcbmltcG9ydCB7QmFzZUxpc3RJdGVtSGFybmVzc0ZpbHRlcnMsIFN1YmhlYWRlckhhcm5lc3NGaWx0ZXJzfSBmcm9tICcuL2xpc3QtaGFybmVzcy1maWx0ZXJzJztcbmltcG9ydCB7TWF0U3ViaGVhZGVySGFybmVzc30gZnJvbSAnLi9saXN0LWl0ZW0taGFybmVzcy1iYXNlJztcblxuLyoqIFJlcHJlc2VudHMgYSBzZWN0aW9uIG9mIGEgbGlzdCBmYWxsaW5nIHVuZGVyIGEgc3BlY2lmaWMgaGVhZGVyLiAqL1xuZXhwb3J0IGludGVyZmFjZSBMaXN0U2VjdGlvbjxJPiB7XG4gIC8qKiBUaGUgaGVhZGluZyBmb3IgdGhpcyBsaXN0IHNlY3Rpb24uIGB1bmRlZmluZWRgIGlmIHRoZXJlIGlzIG5vIGhlYWRpbmcuICovXG4gIGhlYWRpbmc/OiBzdHJpbmc7XG5cbiAgLyoqIFRoZSBpdGVtcyBpbiB0aGlzIGxpc3Qgc2VjdGlvbi4gKi9cbiAgaXRlbXM6IElbXTtcbn1cblxuLyoqXG4gKiBTaGFyZWQgYmVoYXZpb3IgYW1vbmcgdGhlIGhhcm5lc3NlcyBmb3IgdGhlIHZhcmlvdXMgYE1hdExpc3RgIGZsYXZvcnMuXG4gKiBAdGVtcGxhdGUgVCBBIGNvbnN0cnVjdG9yIHR5cGUgZm9yIGEgbGlzdCBpdGVtIGhhcm5lc3MgdHlwZSB1c2VkIGJ5IHRoaXMgbGlzdCBoYXJuZXNzLlxuICogQHRlbXBsYXRlIEMgVGhlIGxpc3QgaXRlbSBoYXJuZXNzIHR5cGUgdGhhdCBgVGAgY29uc3RydWN0cy5cbiAqIEB0ZW1wbGF0ZSBGIFRoZSBmaWx0ZXIgdHlwZSB1c2VkIGZpbHRlciBsaXN0IGl0ZW0gaGFybmVzcyBvZiB0eXBlIGBDYC5cbiAqIEBkb2NzLXByaXZhdGVcbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIE1hdExpc3RIYXJuZXNzQmFzZVxuICAgIDxcbiAgICAgIFQgZXh0ZW5kcyAoQ29tcG9uZW50SGFybmVzc0NvbnN0cnVjdG9yPEM+ICYge3dpdGg6IChvcHRpb25zPzogRikgPT4gSGFybmVzc1ByZWRpY2F0ZTxDPn0pLFxuICAgICAgQyBleHRlbmRzIENvbXBvbmVudEhhcm5lc3MsXG4gICAgICBGIGV4dGVuZHMgQmFzZUxpc3RJdGVtSGFybmVzc0ZpbHRlcnNcbiAgICA+IGV4dGVuZHMgQ29tcG9uZW50SGFybmVzcyB7XG4gIHByb3RlY3RlZCBfaXRlbUhhcm5lc3M6IFQ7XG5cbiAgLyoqXG4gICAqIEdldHMgYSBsaXN0IG9mIGhhcm5lc3NlcyByZXByZXNlbnRpbmcgdGhlIGl0ZW1zIGluIHRoaXMgbGlzdC5cbiAgICogQHBhcmFtIGZpbHRlcnMgT3B0aW9uYWwgZmlsdGVycyB1c2VkIHRvIG5hcnJvdyB3aGljaCBoYXJuZXNzZXMgYXJlIGluY2x1ZGVkXG4gICAqIEByZXR1cm4gVGhlIGxpc3Qgb2YgaXRlbXMgbWF0Y2hpbmcgdGhlIGdpdmVuIGZpbHRlcnMuXG4gICAqL1xuICBhc3luYyBnZXRJdGVtcyhmaWx0ZXJzPzogRik6IFByb21pc2U8Q1tdPiB7XG4gICAgcmV0dXJuIHRoaXMubG9jYXRvckZvckFsbCh0aGlzLl9pdGVtSGFybmVzcy53aXRoKGZpbHRlcnMpKSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgYSBsaXN0IG9mIGBMaXN0U2VjdGlvbmAgcmVwcmVzZW50aW5nIHRoZSBsaXN0IGl0ZW1zIGdyb3VwZWQgYnkgc3ViaGVhZGVycy4gSWYgdGhlIGxpc3QgaGFzXG4gICAqIG5vIHN1YmhlYWRlcnMgaXQgaXMgcmVwcmVzZW50ZWQgYXMgYSBzaW5nbGUgYExpc3RTZWN0aW9uYCB3aXRoIGFuIHVuZGVmaW5lZCBgaGVhZGluZ2AgcHJvcGVydHkuXG4gICAqIEBwYXJhbSBmaWx0ZXJzIE9wdGlvbmFsIGZpbHRlcnMgdXNlZCB0byBuYXJyb3cgd2hpY2ggbGlzdCBpdGVtIGhhcm5lc3NlcyBhcmUgaW5jbHVkZWRcbiAgICogQHJldHVybiBUaGUgbGlzdCBvZiBpdGVtcyBtYXRjaGluZyB0aGUgZ2l2ZW4gZmlsdGVycywgZ3JvdXBlZCBpbnRvIHNlY3Rpb25zIGJ5IHN1YmhlYWRlci5cbiAgICovXG4gIGFzeW5jIGdldEl0ZW1zR3JvdXBlZEJ5U3ViaGVhZGVyKGZpbHRlcnM/OiBGKTogUHJvbWlzZTxMaXN0U2VjdGlvbjxDPltdPiB7XG4gICAgdHlwZSBTZWN0aW9uID0ge2l0ZW1zOiBDW10sIGhlYWRpbmc/OiBQcm9taXNlPHN0cmluZz59O1xuICAgIGNvbnN0IGxpc3RTZWN0aW9uczogU2VjdGlvbltdID0gW107XG4gICAgbGV0IGN1cnJlbnRTZWN0aW9uOiBTZWN0aW9uID0ge2l0ZW1zOiBbXX07XG4gICAgY29uc3QgaXRlbXNBbmRTdWJoZWFkZXJzID1cbiAgICAgICAgYXdhaXQgdGhpcy5nZXRJdGVtc1dpdGhTdWJoZWFkZXJzQW5kRGl2aWRlcnMoe2l0ZW06IGZpbHRlcnMsIGRpdmlkZXI6IGZhbHNlfSk7XG4gICAgZm9yIChjb25zdCBpdGVtT3JTdWJoZWFkZXIgb2YgaXRlbXNBbmRTdWJoZWFkZXJzKSB7XG4gICAgICBpZiAoaXRlbU9yU3ViaGVhZGVyIGluc3RhbmNlb2YgTWF0U3ViaGVhZGVySGFybmVzcykge1xuICAgICAgICBpZiAoY3VycmVudFNlY3Rpb24uaGVhZGluZyAhPT0gdW5kZWZpbmVkIHx8IGN1cnJlbnRTZWN0aW9uLml0ZW1zLmxlbmd0aCkge1xuICAgICAgICAgIGxpc3RTZWN0aW9ucy5wdXNoKGN1cnJlbnRTZWN0aW9uKTtcbiAgICAgICAgfVxuICAgICAgICBjdXJyZW50U2VjdGlvbiA9IHtoZWFkaW5nOiBpdGVtT3JTdWJoZWFkZXIuZ2V0VGV4dCgpLCBpdGVtczogW119O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY3VycmVudFNlY3Rpb24uaXRlbXMucHVzaChpdGVtT3JTdWJoZWFkZXIpO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoY3VycmVudFNlY3Rpb24uaGVhZGluZyAhPT0gdW5kZWZpbmVkIHx8IGN1cnJlbnRTZWN0aW9uLml0ZW1zLmxlbmd0aCB8fFxuICAgICAgICAhbGlzdFNlY3Rpb25zLmxlbmd0aCkge1xuICAgICAgbGlzdFNlY3Rpb25zLnB1c2goY3VycmVudFNlY3Rpb24pO1xuICAgIH1cblxuICAgIC8vIENvbmN1cnJlbnRseSB3YWl0IGZvciBhbGwgc2VjdGlvbnMgdG8gcmVzb2x2ZSB0aGVpciBoZWFkaW5nIGlmIHByZXNlbnQuXG4gICAgcmV0dXJuIHBhcmFsbGVsKCgpID0+IGxpc3RTZWN0aW9ucy5tYXAoYXN5bmMgKHMpID0+XG4gICAgICAoe2l0ZW1zOiBzLml0ZW1zLCBoZWFkaW5nOiBhd2FpdCBzLmhlYWRpbmd9KSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgYSBsaXN0IG9mIHN1Yi1saXN0cyByZXByZXNlbnRpbmcgdGhlIGxpc3QgaXRlbXMgZ3JvdXBlZCBieSBkaXZpZGVycy4gSWYgdGhlIGxpc3QgaGFzIG5vXG4gICAqIGRpdmlkZXJzIGl0IGlzIHJlcHJlc2VudGVkIGFzIGEgbGlzdCB3aXRoIGEgc2luZ2xlIHN1Yi1saXN0LlxuICAgKiBAcGFyYW0gZmlsdGVycyBPcHRpb25hbCBmaWx0ZXJzIHVzZWQgdG8gbmFycm93IHdoaWNoIGxpc3QgaXRlbSBoYXJuZXNzZXMgYXJlIGluY2x1ZGVkXG4gICAqIEByZXR1cm4gVGhlIGxpc3Qgb2YgaXRlbXMgbWF0Y2hpbmcgdGhlIGdpdmVuIGZpbHRlcnMsIGdyb3VwZWQgaW50byBzdWItbGlzdHMgYnkgZGl2aWRlci5cbiAgICovXG4gIGFzeW5jIGdldEl0ZW1zR3JvdXBlZEJ5RGl2aWRlcnMoZmlsdGVycz86IEYpOiBQcm9taXNlPENbXVtdPiB7XG4gICAgY29uc3QgbGlzdFNlY3Rpb25zOiBDW11bXSA9IFtbXV07XG4gICAgY29uc3QgaXRlbXNBbmREaXZpZGVycyA9XG4gICAgICAgIGF3YWl0IHRoaXMuZ2V0SXRlbXNXaXRoU3ViaGVhZGVyc0FuZERpdmlkZXJzKHtpdGVtOiBmaWx0ZXJzLCBzdWJoZWFkZXI6IGZhbHNlfSk7XG4gICAgZm9yIChjb25zdCBpdGVtT3JEaXZpZGVyIG9mIGl0ZW1zQW5kRGl2aWRlcnMpIHtcbiAgICAgIGlmIChpdGVtT3JEaXZpZGVyIGluc3RhbmNlb2YgTWF0RGl2aWRlckhhcm5lc3MpIHtcbiAgICAgICAgbGlzdFNlY3Rpb25zLnB1c2goW10pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGlzdFNlY3Rpb25zW2xpc3RTZWN0aW9ucy5sZW5ndGggLSAxXS5wdXNoKGl0ZW1PckRpdmlkZXIpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbGlzdFNlY3Rpb25zO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgYSBsaXN0IG9mIGhhcm5lc3NlcyByZXByZXNlbnRpbmcgYWxsIG9mIHRoZSBpdGVtcywgc3ViaGVhZGVycywgYW5kIGRpdmlkZXJzXG4gICAqIChpbiB0aGUgb3JkZXIgdGhleSBhcHBlYXIgaW4gdGhlIGxpc3QpLiBVc2UgYGluc3RhbmNlb2ZgIHRvIGNoZWNrIHdoaWNoIHR5cGUgb2YgaGFybmVzcyBhIGdpdmVuXG4gICAqIGl0ZW0gaXMuXG4gICAqIEBwYXJhbSBmaWx0ZXJzIE9wdGlvbmFsIGZpbHRlcnMgdXNlZCB0byBuYXJyb3cgd2hpY2ggbGlzdCBpdGVtcywgc3ViaGVhZGVycywgYW5kIGRpdmlkZXJzIGFyZVxuICAgKiAgICAgaW5jbHVkZWQuIEEgdmFsdWUgb2YgYGZhbHNlYCBmb3IgdGhlIGBpdGVtYCwgYHN1YmhlYWRlcmAsIG9yIGBkaXZpZGVyYCBwcm9wZXJ0aWVzIGluZGljYXRlc1xuICAgKiAgICAgdGhhdCB0aGUgcmVzcGVjdGl2ZSBoYXJuZXNzIHR5cGUgc2hvdWxkIGJlIG9taXR0ZWQgY29tcGxldGVseS5cbiAgICogQHJldHVybiBUaGUgbGlzdCBvZiBoYXJuZXNzZXMgcmVwcmVzZW50aW5nIHRoZSBpdGVtcywgc3ViaGVhZGVycywgYW5kIGRpdmlkZXJzIG1hdGNoaW5nIHRoZVxuICAgKiAgICAgZ2l2ZW4gZmlsdGVycy5cbiAgICovXG4gIGdldEl0ZW1zV2l0aFN1YmhlYWRlcnNBbmREaXZpZGVycyhmaWx0ZXJzOiB7XG4gICAgaXRlbTogZmFsc2UsXG4gICAgc3ViaGVhZGVyOiBmYWxzZSxcbiAgICBkaXZpZGVyOiBmYWxzZVxuICB9KTogUHJvbWlzZTxbXT47XG4gIGdldEl0ZW1zV2l0aFN1YmhlYWRlcnNBbmREaXZpZGVycyhmaWx0ZXJzOiB7XG4gICAgaXRlbT86IEYgfCBmYWxzZSxcbiAgICBzdWJoZWFkZXI6IGZhbHNlLFxuICAgIGRpdmlkZXI6IGZhbHNlXG4gIH0pOiBQcm9taXNlPENbXT47XG4gIGdldEl0ZW1zV2l0aFN1YmhlYWRlcnNBbmREaXZpZGVycyhmaWx0ZXJzOiB7XG4gICAgaXRlbTogZmFsc2UsXG4gICAgc3ViaGVhZGVyPzogU3ViaGVhZGVySGFybmVzc0ZpbHRlcnMgfCBmYWxzZSxcbiAgICBkaXZpZGVyOiBmYWxzZVxuICB9KTogUHJvbWlzZTxNYXRTdWJoZWFkZXJIYXJuZXNzW10+O1xuICBnZXRJdGVtc1dpdGhTdWJoZWFkZXJzQW5kRGl2aWRlcnMoZmlsdGVyczoge1xuICAgIGl0ZW06IGZhbHNlLFxuICAgIHN1YmhlYWRlcjogZmFsc2UsXG4gICAgZGl2aWRlcj86IERpdmlkZXJIYXJuZXNzRmlsdGVycyB8IGZhbHNlXG4gIH0pOiBQcm9taXNlPE1hdERpdmlkZXJIYXJuZXNzW10+O1xuICBnZXRJdGVtc1dpdGhTdWJoZWFkZXJzQW5kRGl2aWRlcnMoZmlsdGVyczoge1xuICAgIGl0ZW0/OiBGIHwgZmFsc2UsXG4gICAgc3ViaGVhZGVyPzogU3ViaGVhZGVySGFybmVzc0ZpbHRlcnMgfCBmYWxzZSxcbiAgICBkaXZpZGVyOiBmYWxzZVxuICB9KTogUHJvbWlzZTwoQyB8IE1hdFN1YmhlYWRlckhhcm5lc3MpW10+O1xuICBnZXRJdGVtc1dpdGhTdWJoZWFkZXJzQW5kRGl2aWRlcnMoZmlsdGVyczoge1xuICAgIGl0ZW0/OiBGIHwgZmFsc2UsXG4gICAgc3ViaGVhZGVyOiBmYWxzZSxcbiAgICBkaXZpZGVyPzogZmFsc2UgfCBEaXZpZGVySGFybmVzc0ZpbHRlcnNcbiAgfSk6IFByb21pc2U8KEMgfCBNYXREaXZpZGVySGFybmVzcylbXT47XG4gIGdldEl0ZW1zV2l0aFN1YmhlYWRlcnNBbmREaXZpZGVycyhmaWx0ZXJzOiB7XG4gICAgaXRlbTogZmFsc2UsXG4gICAgc3ViaGVhZGVyPzogZmFsc2UgfCBTdWJoZWFkZXJIYXJuZXNzRmlsdGVycyxcbiAgICBkaXZpZGVyPzogZmFsc2UgfCBEaXZpZGVySGFybmVzc0ZpbHRlcnNcbiAgfSk6IFByb21pc2U8KE1hdFN1YmhlYWRlckhhcm5lc3MgfCBNYXREaXZpZGVySGFybmVzcylbXT47XG4gIGdldEl0ZW1zV2l0aFN1YmhlYWRlcnNBbmREaXZpZGVycyhmaWx0ZXJzPzoge1xuICAgIGl0ZW0/OiBGIHwgZmFsc2UsXG4gICAgc3ViaGVhZGVyPzogU3ViaGVhZGVySGFybmVzc0ZpbHRlcnMgfCBmYWxzZSxcbiAgICBkaXZpZGVyPzogRGl2aWRlckhhcm5lc3NGaWx0ZXJzIHwgZmFsc2VcbiAgfSk6IFByb21pc2U8KEMgfCBNYXRTdWJoZWFkZXJIYXJuZXNzIHwgTWF0RGl2aWRlckhhcm5lc3MpW10+O1xuICBhc3luYyBnZXRJdGVtc1dpdGhTdWJoZWFkZXJzQW5kRGl2aWRlcnMoZmlsdGVyczoge1xuICAgIGl0ZW0/OiBGIHwgZmFsc2UsXG4gICAgc3ViaGVhZGVyPzogU3ViaGVhZGVySGFybmVzc0ZpbHRlcnMgfCBmYWxzZSxcbiAgICBkaXZpZGVyPzogRGl2aWRlckhhcm5lc3NGaWx0ZXJzIHwgZmFsc2VcbiAgfSA9IHt9KTogUHJvbWlzZTwoQyB8IE1hdFN1YmhlYWRlckhhcm5lc3MgfCBNYXREaXZpZGVySGFybmVzcylbXT4ge1xuICAgIGNvbnN0IHF1ZXJ5ID0gW107XG4gICAgaWYgKGZpbHRlcnMuaXRlbSAhPT0gZmFsc2UpIHtcbiAgICAgIHF1ZXJ5LnB1c2godGhpcy5faXRlbUhhcm5lc3Mud2l0aChmaWx0ZXJzLml0ZW0gfHwge30gYXMgRikpO1xuICAgIH1cbiAgICBpZiAoZmlsdGVycy5zdWJoZWFkZXIgIT09IGZhbHNlKSB7XG4gICAgICBxdWVyeS5wdXNoKE1hdFN1YmhlYWRlckhhcm5lc3Mud2l0aChmaWx0ZXJzLnN1YmhlYWRlcikpO1xuICAgIH1cbiAgICBpZiAoZmlsdGVycy5kaXZpZGVyICE9PSBmYWxzZSkge1xuICAgICAgcXVlcnkucHVzaChNYXREaXZpZGVySGFybmVzcy53aXRoKGZpbHRlcnMuZGl2aWRlcikpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5sb2NhdG9yRm9yQWxsKC4uLnF1ZXJ5KSgpO1xuICB9XG59XG4iXX0=