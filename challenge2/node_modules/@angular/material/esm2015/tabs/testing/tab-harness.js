/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { ContentContainerComponentHarness, HarnessPredicate, } from '@angular/cdk/testing';
/** Harness for interacting with a standard Angular Material tab-label in tests. */
export class MatTabHarness extends ContentContainerComponentHarness {
    /**
     * Gets a `HarnessPredicate` that can be used to search for a `MatTabHarness` that meets
     * certain criteria.
     * @param options Options for filtering which tab instances are considered a match.
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return new HarnessPredicate(MatTabHarness, options)
            .addOption('label', options.label, (harness, label) => HarnessPredicate.stringMatches(harness.getLabel(), label));
    }
    /** Gets the label of the tab. */
    getLabel() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).text();
        });
    }
    /** Gets the aria-label of the tab. */
    getAriaLabel() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).getAttribute('aria-label');
        });
    }
    /** Gets the value of the "aria-labelledby" attribute. */
    getAriaLabelledby() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).getAttribute('aria-labelledby');
        });
    }
    /** Whether the tab is selected. */
    isSelected() {
        return __awaiter(this, void 0, void 0, function* () {
            const hostEl = yield this.host();
            return (yield hostEl.getAttribute('aria-selected')) === 'true';
        });
    }
    /** Whether the tab is disabled. */
    isDisabled() {
        return __awaiter(this, void 0, void 0, function* () {
            const hostEl = yield this.host();
            return (yield hostEl.getAttribute('aria-disabled')) === 'true';
        });
    }
    /** Selects the given tab by clicking on the label. Tab cannot be selected if disabled. */
    select() {
        return __awaiter(this, void 0, void 0, function* () {
            yield (yield this.host()).click();
        });
    }
    /** Gets the text content of the tab. */
    getTextContent() {
        return __awaiter(this, void 0, void 0, function* () {
            const contentId = yield this._getContentId();
            const contentEl = yield this.documentRootLocatorFactory().locatorFor(`#${contentId}`)();
            return contentEl.text();
        });
    }
    /**
     * Gets a `HarnessLoader` that can be used to load harnesses for components within the tab's
     * content area.
     * @deprecated Use `getHarness` or `getChildLoader` instead.
     * @breaking-change 12.0.0
     */
    getHarnessLoaderForContent() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.getRootHarnessLoader();
        });
    }
    getRootHarnessLoader() {
        return __awaiter(this, void 0, void 0, function* () {
            const contentId = yield this._getContentId();
            return this.documentRootLocatorFactory().harnessLoaderFor(`#${contentId}`);
        });
    }
    /** Gets the element id for the content of the current tab. */
    _getContentId() {
        return __awaiter(this, void 0, void 0, function* () {
            const hostEl = yield this.host();
            // Tabs never have an empty "aria-controls" attribute.
            return (yield hostEl.getAttribute('aria-controls'));
        });
    }
}
/** The selector for the host element of a `MatTab` instance. */
MatTabHarness.hostSelector = '.mat-tab-label';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFiLWhhcm5lc3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvdGFicy90ZXN0aW5nL3RhYi1oYXJuZXNzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFFSCxPQUFPLEVBQ0wsZ0NBQWdDLEVBRWhDLGdCQUFnQixHQUNqQixNQUFNLHNCQUFzQixDQUFDO0FBRzlCLG1GQUFtRjtBQUNuRixNQUFNLE9BQU8sYUFBYyxTQUFRLGdDQUF3QztJQUl6RTs7Ozs7T0FLRztJQUNILE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBNkIsRUFBRTtRQUN6QyxPQUFPLElBQUksZ0JBQWdCLENBQUMsYUFBYSxFQUFFLE9BQU8sQ0FBQzthQUM5QyxTQUFTLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxLQUFLLEVBQzdCLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3pGLENBQUM7SUFFRCxpQ0FBaUM7SUFDM0IsUUFBUTs7WUFDWixPQUFPLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNwQyxDQUFDO0tBQUE7SUFFRCxzQ0FBc0M7SUFDaEMsWUFBWTs7WUFDaEIsT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsWUFBWSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ3hELENBQUM7S0FBQTtJQUVELHlEQUF5RDtJQUNuRCxpQkFBaUI7O1lBQ3JCLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBQzdELENBQUM7S0FBQTtJQUVELG1DQUFtQztJQUM3QixVQUFVOztZQUNkLE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ2pDLE9BQU8sQ0FBQyxNQUFNLE1BQU0sQ0FBQyxZQUFZLENBQUMsZUFBZSxDQUFDLENBQUMsS0FBSyxNQUFNLENBQUM7UUFDakUsQ0FBQztLQUFBO0lBRUQsbUNBQW1DO0lBQzdCLFVBQVU7O1lBQ2QsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDakMsT0FBTyxDQUFDLE1BQU0sTUFBTSxDQUFDLFlBQVksQ0FBQyxlQUFlLENBQUMsQ0FBQyxLQUFLLE1BQU0sQ0FBQztRQUNqRSxDQUFDO0tBQUE7SUFFRCwwRkFBMEY7SUFDcEYsTUFBTTs7WUFDVixNQUFNLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNwQyxDQUFDO0tBQUE7SUFFRCx3Q0FBd0M7SUFDbEMsY0FBYzs7WUFDbEIsTUFBTSxTQUFTLEdBQUcsTUFBTSxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDN0MsTUFBTSxTQUFTLEdBQUcsTUFBTSxJQUFJLENBQUMsMEJBQTBCLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBSSxTQUFTLEVBQUUsQ0FBQyxFQUFFLENBQUM7WUFDeEYsT0FBTyxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDMUIsQ0FBQztLQUFBO0lBRUQ7Ozs7O09BS0c7SUFDRywwQkFBMEI7O1lBQzlCLE9BQU8sSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUM7UUFDckMsQ0FBQztLQUFBO0lBRWUsb0JBQW9COztZQUNsQyxNQUFNLFNBQVMsR0FBRyxNQUFNLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUM3QyxPQUFPLElBQUksQ0FBQywwQkFBMEIsRUFBRSxDQUFDLGdCQUFnQixDQUFDLElBQUksU0FBUyxFQUFFLENBQUMsQ0FBQztRQUM3RSxDQUFDO0tBQUE7SUFFRCw4REFBOEQ7SUFDaEQsYUFBYTs7WUFDekIsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDakMsc0RBQXNEO1lBQ3RELE9BQU8sQ0FBQyxNQUFNLE1BQU0sQ0FBQyxZQUFZLENBQUMsZUFBZSxDQUFDLENBQUUsQ0FBQztRQUN2RCxDQUFDO0tBQUE7O0FBMUVELGdFQUFnRTtBQUN6RCwwQkFBWSxHQUFHLGdCQUFnQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7XG4gIENvbnRlbnRDb250YWluZXJDb21wb25lbnRIYXJuZXNzLFxuICBIYXJuZXNzTG9hZGVyLFxuICBIYXJuZXNzUHJlZGljYXRlLFxufSBmcm9tICdAYW5ndWxhci9jZGsvdGVzdGluZyc7XG5pbXBvcnQge1RhYkhhcm5lc3NGaWx0ZXJzfSBmcm9tICcuL3RhYi1oYXJuZXNzLWZpbHRlcnMnO1xuXG4vKiogSGFybmVzcyBmb3IgaW50ZXJhY3Rpbmcgd2l0aCBhIHN0YW5kYXJkIEFuZ3VsYXIgTWF0ZXJpYWwgdGFiLWxhYmVsIGluIHRlc3RzLiAqL1xuZXhwb3J0IGNsYXNzIE1hdFRhYkhhcm5lc3MgZXh0ZW5kcyBDb250ZW50Q29udGFpbmVyQ29tcG9uZW50SGFybmVzczxzdHJpbmc+IHtcbiAgLyoqIFRoZSBzZWxlY3RvciBmb3IgdGhlIGhvc3QgZWxlbWVudCBvZiBhIGBNYXRUYWJgIGluc3RhbmNlLiAqL1xuICBzdGF0aWMgaG9zdFNlbGVjdG9yID0gJy5tYXQtdGFiLWxhYmVsJztcblxuICAvKipcbiAgICogR2V0cyBhIGBIYXJuZXNzUHJlZGljYXRlYCB0aGF0IGNhbiBiZSB1c2VkIHRvIHNlYXJjaCBmb3IgYSBgTWF0VGFiSGFybmVzc2AgdGhhdCBtZWV0c1xuICAgKiBjZXJ0YWluIGNyaXRlcmlhLlxuICAgKiBAcGFyYW0gb3B0aW9ucyBPcHRpb25zIGZvciBmaWx0ZXJpbmcgd2hpY2ggdGFiIGluc3RhbmNlcyBhcmUgY29uc2lkZXJlZCBhIG1hdGNoLlxuICAgKiBAcmV0dXJuIGEgYEhhcm5lc3NQcmVkaWNhdGVgIGNvbmZpZ3VyZWQgd2l0aCB0aGUgZ2l2ZW4gb3B0aW9ucy5cbiAgICovXG4gIHN0YXRpYyB3aXRoKG9wdGlvbnM6IFRhYkhhcm5lc3NGaWx0ZXJzID0ge30pOiBIYXJuZXNzUHJlZGljYXRlPE1hdFRhYkhhcm5lc3M+IHtcbiAgICByZXR1cm4gbmV3IEhhcm5lc3NQcmVkaWNhdGUoTWF0VGFiSGFybmVzcywgb3B0aW9ucylcbiAgICAgICAgLmFkZE9wdGlvbignbGFiZWwnLCBvcHRpb25zLmxhYmVsLFxuICAgICAgICAgICAgKGhhcm5lc3MsIGxhYmVsKSA9PiBIYXJuZXNzUHJlZGljYXRlLnN0cmluZ01hdGNoZXMoaGFybmVzcy5nZXRMYWJlbCgpLCBsYWJlbCkpO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIGxhYmVsIG9mIHRoZSB0YWIuICovXG4gIGFzeW5jIGdldExhYmVsKCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLmhvc3QoKSkudGV4dCgpO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIGFyaWEtbGFiZWwgb2YgdGhlIHRhYi4gKi9cbiAgYXN5bmMgZ2V0QXJpYUxhYmVsKCk6IFByb21pc2U8c3RyaW5nfG51bGw+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuaG9zdCgpKS5nZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWwnKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSB2YWx1ZSBvZiB0aGUgXCJhcmlhLWxhYmVsbGVkYnlcIiBhdHRyaWJ1dGUuICovXG4gIGFzeW5jIGdldEFyaWFMYWJlbGxlZGJ5KCk6IFByb21pc2U8c3RyaW5nfG51bGw+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuaG9zdCgpKS5nZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWxsZWRieScpO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhlIHRhYiBpcyBzZWxlY3RlZC4gKi9cbiAgYXN5bmMgaXNTZWxlY3RlZCgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCBob3N0RWwgPSBhd2FpdCB0aGlzLmhvc3QoKTtcbiAgICByZXR1cm4gKGF3YWl0IGhvc3RFbC5nZXRBdHRyaWJ1dGUoJ2FyaWEtc2VsZWN0ZWQnKSkgPT09ICd0cnVlJztcbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZSB0YWIgaXMgZGlzYWJsZWQuICovXG4gIGFzeW5jIGlzRGlzYWJsZWQoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3QgaG9zdEVsID0gYXdhaXQgdGhpcy5ob3N0KCk7XG4gICAgcmV0dXJuIChhd2FpdCBob3N0RWwuZ2V0QXR0cmlidXRlKCdhcmlhLWRpc2FibGVkJykpID09PSAndHJ1ZSc7XG4gIH1cblxuICAvKiogU2VsZWN0cyB0aGUgZ2l2ZW4gdGFiIGJ5IGNsaWNraW5nIG9uIHRoZSBsYWJlbC4gVGFiIGNhbm5vdCBiZSBzZWxlY3RlZCBpZiBkaXNhYmxlZC4gKi9cbiAgYXN5bmMgc2VsZWN0KCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IChhd2FpdCB0aGlzLmhvc3QoKSkuY2xpY2soKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSB0ZXh0IGNvbnRlbnQgb2YgdGhlIHRhYi4gKi9cbiAgYXN5bmMgZ2V0VGV4dENvbnRlbnQoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBjb25zdCBjb250ZW50SWQgPSBhd2FpdCB0aGlzLl9nZXRDb250ZW50SWQoKTtcbiAgICBjb25zdCBjb250ZW50RWwgPSBhd2FpdCB0aGlzLmRvY3VtZW50Um9vdExvY2F0b3JGYWN0b3J5KCkubG9jYXRvckZvcihgIyR7Y29udGVudElkfWApKCk7XG4gICAgcmV0dXJuIGNvbnRlbnRFbC50ZXh0KCk7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyBhIGBIYXJuZXNzTG9hZGVyYCB0aGF0IGNhbiBiZSB1c2VkIHRvIGxvYWQgaGFybmVzc2VzIGZvciBjb21wb25lbnRzIHdpdGhpbiB0aGUgdGFiJ3NcbiAgICogY29udGVudCBhcmVhLlxuICAgKiBAZGVwcmVjYXRlZCBVc2UgYGdldEhhcm5lc3NgIG9yIGBnZXRDaGlsZExvYWRlcmAgaW5zdGVhZC5cbiAgICogQGJyZWFraW5nLWNoYW5nZSAxMi4wLjBcbiAgICovXG4gIGFzeW5jIGdldEhhcm5lc3NMb2FkZXJGb3JDb250ZW50KCk6IFByb21pc2U8SGFybmVzc0xvYWRlcj4ge1xuICAgIHJldHVybiB0aGlzLmdldFJvb3RIYXJuZXNzTG9hZGVyKCk7XG4gIH1cblxuICBwcm90ZWN0ZWQgYXN5bmMgZ2V0Um9vdEhhcm5lc3NMb2FkZXIoKTogUHJvbWlzZTxIYXJuZXNzTG9hZGVyPiB7XG4gICAgY29uc3QgY29udGVudElkID0gYXdhaXQgdGhpcy5fZ2V0Q29udGVudElkKCk7XG4gICAgcmV0dXJuIHRoaXMuZG9jdW1lbnRSb290TG9jYXRvckZhY3RvcnkoKS5oYXJuZXNzTG9hZGVyRm9yKGAjJHtjb250ZW50SWR9YCk7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgZWxlbWVudCBpZCBmb3IgdGhlIGNvbnRlbnQgb2YgdGhlIGN1cnJlbnQgdGFiLiAqL1xuICBwcml2YXRlIGFzeW5jIF9nZXRDb250ZW50SWQoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBjb25zdCBob3N0RWwgPSBhd2FpdCB0aGlzLmhvc3QoKTtcbiAgICAvLyBUYWJzIG5ldmVyIGhhdmUgYW4gZW1wdHkgXCJhcmlhLWNvbnRyb2xzXCIgYXR0cmlidXRlLlxuICAgIHJldHVybiAoYXdhaXQgaG9zdEVsLmdldEF0dHJpYnV0ZSgnYXJpYS1jb250cm9scycpKSE7XG4gIH1cbn1cbiJdfQ==