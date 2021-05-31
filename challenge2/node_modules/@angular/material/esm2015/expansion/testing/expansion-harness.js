/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { ContentContainerComponentHarness, HarnessPredicate, } from '@angular/cdk/testing';
/** Harness for interacting with a standard mat-expansion-panel in tests. */
export class MatExpansionPanelHarness extends ContentContainerComponentHarness {
    constructor() {
        super(...arguments);
        this._header = this.locatorFor(".mat-expansion-panel-header" /* HEADER */);
        this._title = this.locatorForOptional(".mat-expansion-panel-header-title" /* TITLE */);
        this._description = this.locatorForOptional(".mat-expansion-panel-header-description" /* DESCRIPTION */);
        this._expansionIndicator = this.locatorForOptional('.mat-expansion-indicator');
        this._content = this.locatorFor(".mat-expansion-panel-content" /* CONTENT */);
    }
    /**
     * Gets a `HarnessPredicate` that can be used to search for an expansion-panel
     * with specific attributes.
     * @param options Options for narrowing the search:
     *   - `title` finds an expansion-panel with a specific title text.
     *   - `description` finds an expansion-panel with a specific description text.
     *   - `expanded` finds an expansion-panel that is currently expanded.
     *   - `disabled` finds an expansion-panel that is disabled.
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return new HarnessPredicate(MatExpansionPanelHarness, options)
            .addOption('title', options.title, (harness, title) => HarnessPredicate.stringMatches(harness.getTitle(), title))
            .addOption('description', options.description, (harness, description) => HarnessPredicate.stringMatches(harness.getDescription(), description))
            .addOption('content', options.content, (harness, content) => HarnessPredicate.stringMatches(harness.getTextContent(), content))
            .addOption('expanded', options.expanded, (harness, expanded) => __awaiter(this, void 0, void 0, function* () { return (yield harness.isExpanded()) === expanded; }))
            .addOption('disabled', options.disabled, (harness, disabled) => __awaiter(this, void 0, void 0, function* () { return (yield harness.isDisabled()) === disabled; }));
    }
    /** Whether the panel is expanded. */
    isExpanded() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).hasClass('mat-expanded');
        });
    }
    /**
     * Gets the title text of the panel.
     * @returns Title text or `null` if no title is set up.
     */
    getTitle() {
        return __awaiter(this, void 0, void 0, function* () {
            const titleEl = yield this._title();
            return titleEl ? titleEl.text() : null;
        });
    }
    /**
     * Gets the description text of the panel.
     * @returns Description text or `null` if no description is set up.
     */
    getDescription() {
        return __awaiter(this, void 0, void 0, function* () {
            const descriptionEl = yield this._description();
            return descriptionEl ? descriptionEl.text() : null;
        });
    }
    /** Whether the panel is disabled. */
    isDisabled() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield (yield this._header()).getAttribute('aria-disabled')) === 'true';
        });
    }
    /**
     * Toggles the expanded state of the panel by clicking on the panel
     * header. This method will not work if the panel is disabled.
     */
    toggle() {
        return __awaiter(this, void 0, void 0, function* () {
            yield (yield this._header()).click();
        });
    }
    /** Expands the expansion panel if collapsed. */
    expand() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(yield this.isExpanded())) {
                yield this.toggle();
            }
        });
    }
    /** Collapses the expansion panel if expanded. */
    collapse() {
        return __awaiter(this, void 0, void 0, function* () {
            if (yield this.isExpanded()) {
                yield this.toggle();
            }
        });
    }
    /** Gets the text content of the panel. */
    getTextContent() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this._content()).text();
        });
    }
    /**
     * Gets a `HarnessLoader` that can be used to load harnesses for
     * components within the panel's content area.
     * @deprecated Use either `getChildLoader(MatExpansionPanelSection.CONTENT)`, `getHarness` or
     *    `getAllHarnesses` instead.
     * @breaking-change 12.0.0
     */
    getHarnessLoaderForContent() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.getChildLoader(".mat-expansion-panel-content" /* CONTENT */);
        });
    }
    /** Focuses the panel. */
    focus() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this._header()).focus();
        });
    }
    /** Blurs the panel. */
    blur() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this._header()).blur();
        });
    }
    /** Whether the panel is focused. */
    isFocused() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this._header()).isFocused();
        });
    }
    /** Whether the panel has a toggle indicator displayed. */
    hasToggleIndicator() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this._expansionIndicator()) !== null;
        });
    }
    /** Gets the position of the toggle indicator. */
    getToggleIndicatorPosition() {
        return __awaiter(this, void 0, void 0, function* () {
            // By default the expansion indicator will show "after" the panel header content.
            if (yield (yield this._header()).hasClass('mat-expansion-toggle-indicator-before')) {
                return 'before';
            }
            return 'after';
        });
    }
}
MatExpansionPanelHarness.hostSelector = '.mat-expansion-panel';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwYW5zaW9uLWhhcm5lc3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvZXhwYW5zaW9uL3Rlc3RpbmcvZXhwYW5zaW9uLWhhcm5lc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUVILE9BQU8sRUFDTCxnQ0FBZ0MsRUFFaEMsZ0JBQWdCLEdBQ2pCLE1BQU0sc0JBQXNCLENBQUM7QUFXOUIsNEVBQTRFO0FBQzVFLE1BQU0sT0FBTyx3QkFBeUIsU0FDcEMsZ0NBQTBEO0lBRDVEOztRQUlVLFlBQU8sR0FBRyxJQUFJLENBQUMsVUFBVSw0Q0FBaUMsQ0FBQztRQUMzRCxXQUFNLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixpREFBZ0MsQ0FBQztRQUNqRSxpQkFBWSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsNkRBQXNDLENBQUM7UUFDN0Usd0JBQW1CLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLDBCQUEwQixDQUFDLENBQUM7UUFDMUUsYUFBUSxHQUFHLElBQUksQ0FBQyxVQUFVLDhDQUFrQyxDQUFDO0lBK0h2RSxDQUFDO0lBN0hDOzs7Ozs7Ozs7T0FTRztJQUNILE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBd0MsRUFBRTtRQUVwRCxPQUFPLElBQUksZ0JBQWdCLENBQUMsd0JBQXdCLEVBQUUsT0FBTyxDQUFDO2FBQ3pELFNBQVMsQ0FDTixPQUFPLEVBQUUsT0FBTyxDQUFDLEtBQUssRUFDdEIsQ0FBQyxPQUFPLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO2FBQ2pGLFNBQVMsQ0FDTixhQUFhLEVBQUUsT0FBTyxDQUFDLFdBQVcsRUFDbEMsQ0FBQyxPQUFPLEVBQUUsV0FBVyxFQUFFLEVBQUUsQ0FDckIsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUUsRUFBRSxXQUFXLENBQUMsQ0FBQzthQUM3RSxTQUFTLENBQ04sU0FBUyxFQUFFLE9BQU8sQ0FBQyxPQUFPLEVBQzFCLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxFQUFFLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQzthQUMzRixTQUFTLENBQ04sVUFBVSxFQUFFLE9BQU8sQ0FBQyxRQUFRLEVBQzVCLENBQU8sT0FBTyxFQUFFLFFBQVEsRUFBRSxFQUFFLGdEQUFDLE9BQUEsQ0FBQyxNQUFNLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxLQUFLLFFBQVEsQ0FBQSxHQUFBLENBQUM7YUFDMUUsU0FBUyxDQUNOLFVBQVUsRUFBRSxPQUFPLENBQUMsUUFBUSxFQUM1QixDQUFPLE9BQU8sRUFBRSxRQUFRLEVBQUUsRUFBRSxnREFBQyxPQUFBLENBQUMsTUFBTSxPQUFPLENBQUMsVUFBVSxFQUFFLENBQUMsS0FBSyxRQUFRLENBQUEsR0FBQSxDQUFDLENBQUM7SUFDbEYsQ0FBQztJQUVELHFDQUFxQztJQUMvQixVQUFVOztZQUNkLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUN0RCxDQUFDO0tBQUE7SUFFRDs7O09BR0c7SUFDRyxRQUFROztZQUNaLE1BQU0sT0FBTyxHQUFHLE1BQU0sSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ3BDLE9BQU8sT0FBTyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUN6QyxDQUFDO0tBQUE7SUFFRDs7O09BR0c7SUFDRyxjQUFjOztZQUNsQixNQUFNLGFBQWEsR0FBRyxNQUFNLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUNoRCxPQUFPLGFBQWEsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDckQsQ0FBQztLQUFBO0lBRUQscUNBQXFDO0lBQy9CLFVBQVU7O1lBQ2QsT0FBTyxDQUFBLE1BQU0sQ0FBQyxNQUFNLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLFlBQVksQ0FBQyxlQUFlLENBQUMsTUFBSyxNQUFNLENBQUM7UUFDL0UsQ0FBQztLQUFBO0lBRUQ7OztPQUdHO0lBQ0csTUFBTTs7WUFDVixNQUFNLENBQUMsTUFBTSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUN2QyxDQUFDO0tBQUE7SUFFRCxnREFBZ0Q7SUFDMUMsTUFBTTs7WUFDVixJQUFJLENBQUMsQ0FBQSxNQUFNLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQSxFQUFFO2dCQUM1QixNQUFNLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQzthQUNyQjtRQUNILENBQUM7S0FBQTtJQUVELGlEQUFpRDtJQUMzQyxRQUFROztZQUNaLElBQUksTUFBTSxJQUFJLENBQUMsVUFBVSxFQUFFLEVBQUU7Z0JBQzNCLE1BQU0sSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO2FBQ3JCO1FBQ0gsQ0FBQztLQUFBO0lBRUQsMENBQTBDO0lBQ3BDLGNBQWM7O1lBQ2xCLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3hDLENBQUM7S0FBQTtJQUVEOzs7Ozs7T0FNRztJQUNHLDBCQUEwQjs7WUFDOUIsT0FBTyxJQUFJLENBQUMsY0FBYyw4Q0FBa0MsQ0FBQztRQUMvRCxDQUFDO0tBQUE7SUFFRCx5QkFBeUI7SUFDbkIsS0FBSzs7WUFDVCxPQUFPLENBQUMsTUFBTSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUN4QyxDQUFDO0tBQUE7SUFFRCx1QkFBdUI7SUFDakIsSUFBSTs7WUFDUixPQUFPLENBQUMsTUFBTSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUN2QyxDQUFDO0tBQUE7SUFFRCxvQ0FBb0M7SUFDOUIsU0FBUzs7WUFDYixPQUFPLENBQUMsTUFBTSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUM1QyxDQUFDO0tBQUE7SUFFRCwwREFBMEQ7SUFDcEQsa0JBQWtCOztZQUN0QixPQUFPLENBQUMsTUFBTSxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxLQUFLLElBQUksQ0FBQztRQUNyRCxDQUFDO0tBQUE7SUFFRCxpREFBaUQ7SUFDM0MsMEJBQTBCOztZQUM5QixpRkFBaUY7WUFDakYsSUFBSSxNQUFNLENBQUMsTUFBTSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsdUNBQXVDLENBQUMsRUFBRTtnQkFDbEYsT0FBTyxRQUFRLENBQUM7YUFDakI7WUFDRCxPQUFPLE9BQU8sQ0FBQztRQUNqQixDQUFDO0tBQUE7O0FBcElNLHFDQUFZLEdBQUcsc0JBQXNCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtcbiAgQ29udGVudENvbnRhaW5lckNvbXBvbmVudEhhcm5lc3MsXG4gIEhhcm5lc3NMb2FkZXIsXG4gIEhhcm5lc3NQcmVkaWNhdGUsXG59IGZyb20gJ0Bhbmd1bGFyL2Nkay90ZXN0aW5nJztcbmltcG9ydCB7RXhwYW5zaW9uUGFuZWxIYXJuZXNzRmlsdGVyc30gZnJvbSAnLi9leHBhbnNpb24taGFybmVzcy1maWx0ZXJzJztcblxuLyoqIFNlbGVjdG9ycyBmb3IgdGhlIHZhcmlvdXMgYG1hdC1leHBhbnNpb24tcGFuZWxgIHNlY3Rpb25zIHRoYXQgbWF5IGNvbnRhaW4gdXNlciBjb250ZW50LiAqL1xuZXhwb3J0IGNvbnN0IGVudW0gTWF0RXhwYW5zaW9uUGFuZWxTZWN0aW9uIHtcbiAgSEVBREVSID0gJy5tYXQtZXhwYW5zaW9uLXBhbmVsLWhlYWRlcicsXG4gIFRJVExFID0gJy5tYXQtZXhwYW5zaW9uLXBhbmVsLWhlYWRlci10aXRsZScsXG4gIERFU0NSSVBUSU9OID0gJy5tYXQtZXhwYW5zaW9uLXBhbmVsLWhlYWRlci1kZXNjcmlwdGlvbicsXG4gIENPTlRFTlQgPSAnLm1hdC1leHBhbnNpb24tcGFuZWwtY29udGVudCdcbn1cblxuLyoqIEhhcm5lc3MgZm9yIGludGVyYWN0aW5nIHdpdGggYSBzdGFuZGFyZCBtYXQtZXhwYW5zaW9uLXBhbmVsIGluIHRlc3RzLiAqL1xuZXhwb3J0IGNsYXNzIE1hdEV4cGFuc2lvblBhbmVsSGFybmVzcyBleHRlbmRzXG4gIENvbnRlbnRDb250YWluZXJDb21wb25lbnRIYXJuZXNzPE1hdEV4cGFuc2lvblBhbmVsU2VjdGlvbj4ge1xuICBzdGF0aWMgaG9zdFNlbGVjdG9yID0gJy5tYXQtZXhwYW5zaW9uLXBhbmVsJztcblxuICBwcml2YXRlIF9oZWFkZXIgPSB0aGlzLmxvY2F0b3JGb3IoTWF0RXhwYW5zaW9uUGFuZWxTZWN0aW9uLkhFQURFUik7XG4gIHByaXZhdGUgX3RpdGxlID0gdGhpcy5sb2NhdG9yRm9yT3B0aW9uYWwoTWF0RXhwYW5zaW9uUGFuZWxTZWN0aW9uLlRJVExFKTtcbiAgcHJpdmF0ZSBfZGVzY3JpcHRpb24gPSB0aGlzLmxvY2F0b3JGb3JPcHRpb25hbChNYXRFeHBhbnNpb25QYW5lbFNlY3Rpb24uREVTQ1JJUFRJT04pO1xuICBwcml2YXRlIF9leHBhbnNpb25JbmRpY2F0b3IgPSB0aGlzLmxvY2F0b3JGb3JPcHRpb25hbCgnLm1hdC1leHBhbnNpb24taW5kaWNhdG9yJyk7XG4gIHByaXZhdGUgX2NvbnRlbnQgPSB0aGlzLmxvY2F0b3JGb3IoTWF0RXhwYW5zaW9uUGFuZWxTZWN0aW9uLkNPTlRFTlQpO1xuXG4gIC8qKlxuICAgKiBHZXRzIGEgYEhhcm5lc3NQcmVkaWNhdGVgIHRoYXQgY2FuIGJlIHVzZWQgdG8gc2VhcmNoIGZvciBhbiBleHBhbnNpb24tcGFuZWxcbiAgICogd2l0aCBzcGVjaWZpYyBhdHRyaWJ1dGVzLlxuICAgKiBAcGFyYW0gb3B0aW9ucyBPcHRpb25zIGZvciBuYXJyb3dpbmcgdGhlIHNlYXJjaDpcbiAgICogICAtIGB0aXRsZWAgZmluZHMgYW4gZXhwYW5zaW9uLXBhbmVsIHdpdGggYSBzcGVjaWZpYyB0aXRsZSB0ZXh0LlxuICAgKiAgIC0gYGRlc2NyaXB0aW9uYCBmaW5kcyBhbiBleHBhbnNpb24tcGFuZWwgd2l0aCBhIHNwZWNpZmljIGRlc2NyaXB0aW9uIHRleHQuXG4gICAqICAgLSBgZXhwYW5kZWRgIGZpbmRzIGFuIGV4cGFuc2lvbi1wYW5lbCB0aGF0IGlzIGN1cnJlbnRseSBleHBhbmRlZC5cbiAgICogICAtIGBkaXNhYmxlZGAgZmluZHMgYW4gZXhwYW5zaW9uLXBhbmVsIHRoYXQgaXMgZGlzYWJsZWQuXG4gICAqIEByZXR1cm4gYSBgSGFybmVzc1ByZWRpY2F0ZWAgY29uZmlndXJlZCB3aXRoIHRoZSBnaXZlbiBvcHRpb25zLlxuICAgKi9cbiAgc3RhdGljIHdpdGgob3B0aW9uczogRXhwYW5zaW9uUGFuZWxIYXJuZXNzRmlsdGVycyA9IHt9KTpcbiAgICAgIEhhcm5lc3NQcmVkaWNhdGU8TWF0RXhwYW5zaW9uUGFuZWxIYXJuZXNzPiB7XG4gICAgcmV0dXJuIG5ldyBIYXJuZXNzUHJlZGljYXRlKE1hdEV4cGFuc2lvblBhbmVsSGFybmVzcywgb3B0aW9ucylcbiAgICAgICAgLmFkZE9wdGlvbihcbiAgICAgICAgICAgICd0aXRsZScsIG9wdGlvbnMudGl0bGUsXG4gICAgICAgICAgICAoaGFybmVzcywgdGl0bGUpID0+IEhhcm5lc3NQcmVkaWNhdGUuc3RyaW5nTWF0Y2hlcyhoYXJuZXNzLmdldFRpdGxlKCksIHRpdGxlKSlcbiAgICAgICAgLmFkZE9wdGlvbihcbiAgICAgICAgICAgICdkZXNjcmlwdGlvbicsIG9wdGlvbnMuZGVzY3JpcHRpb24sXG4gICAgICAgICAgICAoaGFybmVzcywgZGVzY3JpcHRpb24pID0+XG4gICAgICAgICAgICAgICAgSGFybmVzc1ByZWRpY2F0ZS5zdHJpbmdNYXRjaGVzKGhhcm5lc3MuZ2V0RGVzY3JpcHRpb24oKSwgZGVzY3JpcHRpb24pKVxuICAgICAgICAuYWRkT3B0aW9uKFxuICAgICAgICAgICAgJ2NvbnRlbnQnLCBvcHRpb25zLmNvbnRlbnQsXG4gICAgICAgICAgICAoaGFybmVzcywgY29udGVudCkgPT4gSGFybmVzc1ByZWRpY2F0ZS5zdHJpbmdNYXRjaGVzKGhhcm5lc3MuZ2V0VGV4dENvbnRlbnQoKSwgY29udGVudCkpXG4gICAgICAgIC5hZGRPcHRpb24oXG4gICAgICAgICAgICAnZXhwYW5kZWQnLCBvcHRpb25zLmV4cGFuZGVkLFxuICAgICAgICAgICAgYXN5bmMgKGhhcm5lc3MsIGV4cGFuZGVkKSA9PiAoYXdhaXQgaGFybmVzcy5pc0V4cGFuZGVkKCkpID09PSBleHBhbmRlZClcbiAgICAgICAgLmFkZE9wdGlvbihcbiAgICAgICAgICAgICdkaXNhYmxlZCcsIG9wdGlvbnMuZGlzYWJsZWQsXG4gICAgICAgICAgICBhc3luYyAoaGFybmVzcywgZGlzYWJsZWQpID0+IChhd2FpdCBoYXJuZXNzLmlzRGlzYWJsZWQoKSkgPT09IGRpc2FibGVkKTtcbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZSBwYW5lbCBpcyBleHBhbmRlZC4gKi9cbiAgYXN5bmMgaXNFeHBhbmRlZCgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuaG9zdCgpKS5oYXNDbGFzcygnbWF0LWV4cGFuZGVkJyk7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgdGl0bGUgdGV4dCBvZiB0aGUgcGFuZWwuXG4gICAqIEByZXR1cm5zIFRpdGxlIHRleHQgb3IgYG51bGxgIGlmIG5vIHRpdGxlIGlzIHNldCB1cC5cbiAgICovXG4gIGFzeW5jIGdldFRpdGxlKCk6IFByb21pc2U8c3RyaW5nfG51bGw+IHtcbiAgICBjb25zdCB0aXRsZUVsID0gYXdhaXQgdGhpcy5fdGl0bGUoKTtcbiAgICByZXR1cm4gdGl0bGVFbCA/IHRpdGxlRWwudGV4dCgpIDogbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBkZXNjcmlwdGlvbiB0ZXh0IG9mIHRoZSBwYW5lbC5cbiAgICogQHJldHVybnMgRGVzY3JpcHRpb24gdGV4dCBvciBgbnVsbGAgaWYgbm8gZGVzY3JpcHRpb24gaXMgc2V0IHVwLlxuICAgKi9cbiAgYXN5bmMgZ2V0RGVzY3JpcHRpb24oKTogUHJvbWlzZTxzdHJpbmd8bnVsbD4ge1xuICAgIGNvbnN0IGRlc2NyaXB0aW9uRWwgPSBhd2FpdCB0aGlzLl9kZXNjcmlwdGlvbigpO1xuICAgIHJldHVybiBkZXNjcmlwdGlvbkVsID8gZGVzY3JpcHRpb25FbC50ZXh0KCkgOiBudWxsO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhlIHBhbmVsIGlzIGRpc2FibGVkLiAqL1xuICBhc3luYyBpc0Rpc2FibGVkKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiBhd2FpdCAoYXdhaXQgdGhpcy5faGVhZGVyKCkpLmdldEF0dHJpYnV0ZSgnYXJpYS1kaXNhYmxlZCcpID09PSAndHJ1ZSc7XG4gIH1cblxuICAvKipcbiAgICogVG9nZ2xlcyB0aGUgZXhwYW5kZWQgc3RhdGUgb2YgdGhlIHBhbmVsIGJ5IGNsaWNraW5nIG9uIHRoZSBwYW5lbFxuICAgKiBoZWFkZXIuIFRoaXMgbWV0aG9kIHdpbGwgbm90IHdvcmsgaWYgdGhlIHBhbmVsIGlzIGRpc2FibGVkLlxuICAgKi9cbiAgYXN5bmMgdG9nZ2xlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IChhd2FpdCB0aGlzLl9oZWFkZXIoKSkuY2xpY2soKTtcbiAgfVxuXG4gIC8qKiBFeHBhbmRzIHRoZSBleHBhbnNpb24gcGFuZWwgaWYgY29sbGFwc2VkLiAqL1xuICBhc3luYyBleHBhbmQoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKCFhd2FpdCB0aGlzLmlzRXhwYW5kZWQoKSkge1xuICAgICAgYXdhaXQgdGhpcy50b2dnbGUoKTtcbiAgICB9XG4gIH1cblxuICAvKiogQ29sbGFwc2VzIHRoZSBleHBhbnNpb24gcGFuZWwgaWYgZXhwYW5kZWQuICovXG4gIGFzeW5jIGNvbGxhcHNlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmIChhd2FpdCB0aGlzLmlzRXhwYW5kZWQoKSkge1xuICAgICAgYXdhaXQgdGhpcy50b2dnbGUoKTtcbiAgICB9XG4gIH1cblxuICAvKiogR2V0cyB0aGUgdGV4dCBjb250ZW50IG9mIHRoZSBwYW5lbC4gKi9cbiAgYXN5bmMgZ2V0VGV4dENvbnRlbnQoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuX2NvbnRlbnQoKSkudGV4dCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgYSBgSGFybmVzc0xvYWRlcmAgdGhhdCBjYW4gYmUgdXNlZCB0byBsb2FkIGhhcm5lc3NlcyBmb3JcbiAgICogY29tcG9uZW50cyB3aXRoaW4gdGhlIHBhbmVsJ3MgY29udGVudCBhcmVhLlxuICAgKiBAZGVwcmVjYXRlZCBVc2UgZWl0aGVyIGBnZXRDaGlsZExvYWRlcihNYXRFeHBhbnNpb25QYW5lbFNlY3Rpb24uQ09OVEVOVClgLCBgZ2V0SGFybmVzc2Agb3JcbiAgICogICAgYGdldEFsbEhhcm5lc3Nlc2AgaW5zdGVhZC5cbiAgICogQGJyZWFraW5nLWNoYW5nZSAxMi4wLjBcbiAgICovXG4gIGFzeW5jIGdldEhhcm5lc3NMb2FkZXJGb3JDb250ZW50KCk6IFByb21pc2U8SGFybmVzc0xvYWRlcj4ge1xuICAgIHJldHVybiB0aGlzLmdldENoaWxkTG9hZGVyKE1hdEV4cGFuc2lvblBhbmVsU2VjdGlvbi5DT05URU5UKTtcbiAgfVxuXG4gIC8qKiBGb2N1c2VzIHRoZSBwYW5lbC4gKi9cbiAgYXN5bmMgZm9jdXMoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLl9oZWFkZXIoKSkuZm9jdXMoKTtcbiAgfVxuXG4gIC8qKiBCbHVycyB0aGUgcGFuZWwuICovXG4gIGFzeW5jIGJsdXIoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLl9oZWFkZXIoKSkuYmx1cigpO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhlIHBhbmVsIGlzIGZvY3VzZWQuICovXG4gIGFzeW5jIGlzRm9jdXNlZCgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuX2hlYWRlcigpKS5pc0ZvY3VzZWQoKTtcbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZSBwYW5lbCBoYXMgYSB0b2dnbGUgaW5kaWNhdG9yIGRpc3BsYXllZC4gKi9cbiAgYXN5bmMgaGFzVG9nZ2xlSW5kaWNhdG9yKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5fZXhwYW5zaW9uSW5kaWNhdG9yKCkpICE9PSBudWxsO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIHBvc2l0aW9uIG9mIHRoZSB0b2dnbGUgaW5kaWNhdG9yLiAqL1xuICBhc3luYyBnZXRUb2dnbGVJbmRpY2F0b3JQb3NpdGlvbigpOiBQcm9taXNlPCdiZWZvcmUnfCdhZnRlcic+IHtcbiAgICAvLyBCeSBkZWZhdWx0IHRoZSBleHBhbnNpb24gaW5kaWNhdG9yIHdpbGwgc2hvdyBcImFmdGVyXCIgdGhlIHBhbmVsIGhlYWRlciBjb250ZW50LlxuICAgIGlmIChhd2FpdCAoYXdhaXQgdGhpcy5faGVhZGVyKCkpLmhhc0NsYXNzKCdtYXQtZXhwYW5zaW9uLXRvZ2dsZS1pbmRpY2F0b3ItYmVmb3JlJykpIHtcbiAgICAgIHJldHVybiAnYmVmb3JlJztcbiAgICB9XG4gICAgcmV0dXJuICdhZnRlcic7XG4gIH1cbn1cbiJdfQ==