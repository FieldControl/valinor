/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { HarnessPredicate, ComponentHarness } from '@angular/cdk/testing';
import { MatCalendarCellHarness } from './calendar-cell-harness';
/** Harness for interacting with a standard Material calendar in tests. */
export class MatCalendarHarness extends ComponentHarness {
    constructor() {
        super(...arguments);
        /** Queries for the calendar's period toggle button. */
        this._periodButton = this.locatorFor('.mat-calendar-period-button');
    }
    /**
     * Gets a `HarnessPredicate` that can be used to search for a `MatCalendarHarness`
     * that meets certain criteria.
     * @param options Options for filtering which calendar instances are considered a match.
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return new HarnessPredicate(MatCalendarHarness, options);
    }
    /**
     * Gets a list of cells inside the calendar.
     * @param filter Optionally filters which cells are included.
     */
    getCells(filter = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.locatorForAll(MatCalendarCellHarness.with(filter))();
        });
    }
    /** Gets the current view that is being shown inside the calendar. */
    getCurrentView() {
        return __awaiter(this, void 0, void 0, function* () {
            if (yield this.locatorForOptional('mat-multi-year-view')()) {
                return 2 /* MULTI_YEAR */;
            }
            if (yield this.locatorForOptional('mat-year-view')()) {
                return 1 /* YEAR */;
            }
            return 0 /* MONTH */;
        });
    }
    /** Gets the label of the current calendar view. */
    getCurrentViewLabel() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this._periodButton()).text();
        });
    }
    /** Changes the calendar view by clicking on the view toggle button. */
    changeView() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this._periodButton()).click();
        });
    }
    /** Goes to the next page of the current view (e.g. next month when inside the month view). */
    next() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.locatorFor('.mat-calendar-next-button')()).click();
        });
    }
    /**
     * Goes to the previous page of the current view
     * (e.g. previous month when inside the month view).
     */
    previous() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.locatorFor('.mat-calendar-previous-button')()).click();
        });
    }
    /**
     * Selects a cell in the current calendar view.
     * @param filter An optional filter to apply to the cells. The first cell matching the filter
     *     will be selected.
     */
    selectCell(filter = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const cells = yield this.getCells(filter);
            if (!cells.length) {
                throw Error(`Cannot find calendar cell matching filter ${JSON.stringify(filter)}`);
            }
            yield cells[0].select();
        });
    }
}
MatCalendarHarness.hostSelector = '.mat-calendar';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FsZW5kYXItaGFybmVzcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9kYXRlcGlja2VyL3Rlc3RpbmcvY2FsZW5kYXItaGFybmVzcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBRUgsT0FBTyxFQUFDLGdCQUFnQixFQUFFLGdCQUFnQixFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFFeEUsT0FBTyxFQUFDLHNCQUFzQixFQUFDLE1BQU0seUJBQXlCLENBQUM7QUFLL0QsMEVBQTBFO0FBQzFFLE1BQU0sT0FBTyxrQkFBbUIsU0FBUSxnQkFBZ0I7SUFBeEQ7O1FBR0UsdURBQXVEO1FBQy9DLGtCQUFhLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO0lBb0V6RSxDQUFDO0lBbEVDOzs7OztPQUtHO0lBQ0gsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFrQyxFQUFFO1FBQzlDLE9BQU8sSUFBSSxnQkFBZ0IsQ0FBQyxrQkFBa0IsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUMzRCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0csUUFBUSxDQUFDLFNBQXFDLEVBQUU7O1lBQ3BELE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQ25FLENBQUM7S0FBQTtJQUVELHFFQUFxRTtJQUMvRCxjQUFjOztZQUNsQixJQUFJLE1BQU0sSUFBSSxDQUFDLGtCQUFrQixDQUFDLHFCQUFxQixDQUFDLEVBQUUsRUFBRTtnQkFDMUQsMEJBQStCO2FBQ2hDO1lBRUQsSUFBSSxNQUFNLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxlQUFlLENBQUMsRUFBRSxFQUFFO2dCQUNwRCxvQkFBeUI7YUFDMUI7WUFFRCxxQkFBMEI7UUFDNUIsQ0FBQztLQUFBO0lBRUQsbURBQW1EO0lBQzdDLG1CQUFtQjs7WUFDdkIsT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDN0MsQ0FBQztLQUFBO0lBRUQsdUVBQXVFO0lBQ2pFLFVBQVU7O1lBQ2QsT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDOUMsQ0FBQztLQUFBO0lBRUQsOEZBQThGO0lBQ3hGLElBQUk7O1lBQ1IsT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQywyQkFBMkIsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUN4RSxDQUFDO0tBQUE7SUFFRDs7O09BR0c7SUFDRyxRQUFROztZQUNaLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsK0JBQStCLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDNUUsQ0FBQztLQUFBO0lBRUQ7Ozs7T0FJRztJQUNHLFVBQVUsQ0FBQyxTQUFxQyxFQUFFOztZQUN0RCxNQUFNLEtBQUssR0FBRyxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDMUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUU7Z0JBQ2pCLE1BQU0sS0FBSyxDQUFDLDZDQUE2QyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQzthQUNwRjtZQUNELE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQzFCLENBQUM7S0FBQTs7QUF0RU0sK0JBQVksR0FBRyxlQUFlLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtIYXJuZXNzUHJlZGljYXRlLCBDb21wb25lbnRIYXJuZXNzfSBmcm9tICdAYW5ndWxhci9jZGsvdGVzdGluZyc7XG5pbXBvcnQge0NhbGVuZGFySGFybmVzc0ZpbHRlcnMsIENhbGVuZGFyQ2VsbEhhcm5lc3NGaWx0ZXJzfSBmcm9tICcuL2RhdGVwaWNrZXItaGFybmVzcy1maWx0ZXJzJztcbmltcG9ydCB7TWF0Q2FsZW5kYXJDZWxsSGFybmVzc30gZnJvbSAnLi9jYWxlbmRhci1jZWxsLWhhcm5lc3MnO1xuXG4vKiogUG9zc2libGUgdmlld3Mgb2YgYSBgTWF0Q2FsZW5kYXJIYXJuZXNzYC4gKi9cbmV4cG9ydCBjb25zdCBlbnVtIENhbGVuZGFyVmlldyB7TU9OVEgsIFlFQVIsIE1VTFRJX1lFQVJ9XG5cbi8qKiBIYXJuZXNzIGZvciBpbnRlcmFjdGluZyB3aXRoIGEgc3RhbmRhcmQgTWF0ZXJpYWwgY2FsZW5kYXIgaW4gdGVzdHMuICovXG5leHBvcnQgY2xhc3MgTWF0Q2FsZW5kYXJIYXJuZXNzIGV4dGVuZHMgQ29tcG9uZW50SGFybmVzcyB7XG4gIHN0YXRpYyBob3N0U2VsZWN0b3IgPSAnLm1hdC1jYWxlbmRhcic7XG5cbiAgLyoqIFF1ZXJpZXMgZm9yIHRoZSBjYWxlbmRhcidzIHBlcmlvZCB0b2dnbGUgYnV0dG9uLiAqL1xuICBwcml2YXRlIF9wZXJpb2RCdXR0b24gPSB0aGlzLmxvY2F0b3JGb3IoJy5tYXQtY2FsZW5kYXItcGVyaW9kLWJ1dHRvbicpO1xuXG4gIC8qKlxuICAgKiBHZXRzIGEgYEhhcm5lc3NQcmVkaWNhdGVgIHRoYXQgY2FuIGJlIHVzZWQgdG8gc2VhcmNoIGZvciBhIGBNYXRDYWxlbmRhckhhcm5lc3NgXG4gICAqIHRoYXQgbWVldHMgY2VydGFpbiBjcml0ZXJpYS5cbiAgICogQHBhcmFtIG9wdGlvbnMgT3B0aW9ucyBmb3IgZmlsdGVyaW5nIHdoaWNoIGNhbGVuZGFyIGluc3RhbmNlcyBhcmUgY29uc2lkZXJlZCBhIG1hdGNoLlxuICAgKiBAcmV0dXJuIGEgYEhhcm5lc3NQcmVkaWNhdGVgIGNvbmZpZ3VyZWQgd2l0aCB0aGUgZ2l2ZW4gb3B0aW9ucy5cbiAgICovXG4gIHN0YXRpYyB3aXRoKG9wdGlvbnM6IENhbGVuZGFySGFybmVzc0ZpbHRlcnMgPSB7fSk6IEhhcm5lc3NQcmVkaWNhdGU8TWF0Q2FsZW5kYXJIYXJuZXNzPiB7XG4gICAgcmV0dXJuIG5ldyBIYXJuZXNzUHJlZGljYXRlKE1hdENhbGVuZGFySGFybmVzcywgb3B0aW9ucyk7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyBhIGxpc3Qgb2YgY2VsbHMgaW5zaWRlIHRoZSBjYWxlbmRhci5cbiAgICogQHBhcmFtIGZpbHRlciBPcHRpb25hbGx5IGZpbHRlcnMgd2hpY2ggY2VsbHMgYXJlIGluY2x1ZGVkLlxuICAgKi9cbiAgYXN5bmMgZ2V0Q2VsbHMoZmlsdGVyOiBDYWxlbmRhckNlbGxIYXJuZXNzRmlsdGVycyA9IHt9KTogUHJvbWlzZTxNYXRDYWxlbmRhckNlbGxIYXJuZXNzW10+IHtcbiAgICByZXR1cm4gdGhpcy5sb2NhdG9yRm9yQWxsKE1hdENhbGVuZGFyQ2VsbEhhcm5lc3Mud2l0aChmaWx0ZXIpKSgpO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIGN1cnJlbnQgdmlldyB0aGF0IGlzIGJlaW5nIHNob3duIGluc2lkZSB0aGUgY2FsZW5kYXIuICovXG4gIGFzeW5jIGdldEN1cnJlbnRWaWV3KCk6IFByb21pc2U8Q2FsZW5kYXJWaWV3PiB7XG4gICAgaWYgKGF3YWl0IHRoaXMubG9jYXRvckZvck9wdGlvbmFsKCdtYXQtbXVsdGkteWVhci12aWV3JykoKSkge1xuICAgICAgcmV0dXJuIENhbGVuZGFyVmlldy5NVUxUSV9ZRUFSO1xuICAgIH1cblxuICAgIGlmIChhd2FpdCB0aGlzLmxvY2F0b3JGb3JPcHRpb25hbCgnbWF0LXllYXItdmlldycpKCkpIHtcbiAgICAgIHJldHVybiBDYWxlbmRhclZpZXcuWUVBUjtcbiAgICB9XG5cbiAgICByZXR1cm4gQ2FsZW5kYXJWaWV3Lk1PTlRIO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIGxhYmVsIG9mIHRoZSBjdXJyZW50IGNhbGVuZGFyIHZpZXcuICovXG4gIGFzeW5jIGdldEN1cnJlbnRWaWV3TGFiZWwoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuX3BlcmlvZEJ1dHRvbigpKS50ZXh0KCk7XG4gIH1cblxuICAvKiogQ2hhbmdlcyB0aGUgY2FsZW5kYXIgdmlldyBieSBjbGlja2luZyBvbiB0aGUgdmlldyB0b2dnbGUgYnV0dG9uLiAqL1xuICBhc3luYyBjaGFuZ2VWaWV3KCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5fcGVyaW9kQnV0dG9uKCkpLmNsaWNrKCk7XG4gIH1cblxuICAvKiogR29lcyB0byB0aGUgbmV4dCBwYWdlIG9mIHRoZSBjdXJyZW50IHZpZXcgKGUuZy4gbmV4dCBtb250aCB3aGVuIGluc2lkZSB0aGUgbW9udGggdmlldykuICovXG4gIGFzeW5jIG5leHQoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLmxvY2F0b3JGb3IoJy5tYXQtY2FsZW5kYXItbmV4dC1idXR0b24nKSgpKS5jbGljaygpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdvZXMgdG8gdGhlIHByZXZpb3VzIHBhZ2Ugb2YgdGhlIGN1cnJlbnQgdmlld1xuICAgKiAoZS5nLiBwcmV2aW91cyBtb250aCB3aGVuIGluc2lkZSB0aGUgbW9udGggdmlldykuXG4gICAqL1xuICBhc3luYyBwcmV2aW91cygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMubG9jYXRvckZvcignLm1hdC1jYWxlbmRhci1wcmV2aW91cy1idXR0b24nKSgpKS5jbGljaygpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlbGVjdHMgYSBjZWxsIGluIHRoZSBjdXJyZW50IGNhbGVuZGFyIHZpZXcuXG4gICAqIEBwYXJhbSBmaWx0ZXIgQW4gb3B0aW9uYWwgZmlsdGVyIHRvIGFwcGx5IHRvIHRoZSBjZWxscy4gVGhlIGZpcnN0IGNlbGwgbWF0Y2hpbmcgdGhlIGZpbHRlclxuICAgKiAgICAgd2lsbCBiZSBzZWxlY3RlZC5cbiAgICovXG4gIGFzeW5jIHNlbGVjdENlbGwoZmlsdGVyOiBDYWxlbmRhckNlbGxIYXJuZXNzRmlsdGVycyA9IHt9KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgY2VsbHMgPSBhd2FpdCB0aGlzLmdldENlbGxzKGZpbHRlcik7XG4gICAgaWYgKCFjZWxscy5sZW5ndGgpIHtcbiAgICAgIHRocm93IEVycm9yKGBDYW5ub3QgZmluZCBjYWxlbmRhciBjZWxsIG1hdGNoaW5nIGZpbHRlciAke0pTT04uc3RyaW5naWZ5KGZpbHRlcil9YCk7XG4gICAgfVxuICAgIGF3YWl0IGNlbGxzWzBdLnNlbGVjdCgpO1xuICB9XG59XG4iXX0=