/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { parallel, TestKey } from '@angular/cdk/testing';
import { MatDatepickerInputHarnessBase, getInputPredicate } from './datepicker-input-harness-base';
import { closeCalendar, getCalendarId, getCalendar, } from './datepicker-trigger-harness-base';
/** Harness for interacting with a standard Material datepicker inputs in tests. */
export class MatDatepickerInputHarness extends MatDatepickerInputHarnessBase {
    /**
     * Gets a `HarnessPredicate` that can be used to search for a `MatDatepickerInputHarness`
     * that meets certain criteria.
     * @param options Options for filtering which input instances are considered a match.
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return getInputPredicate(MatDatepickerInputHarness, options);
    }
    /** Gets whether the calendar associated with the input is open. */
    isCalendarOpen() {
        return __awaiter(this, void 0, void 0, function* () {
            // `aria-owns` is set only if there's an open datepicker so we can use it as an indicator.
            const host = yield this.host();
            return (yield host.getAttribute('aria-owns')) != null;
        });
    }
    /** Opens the calendar associated with the input. */
    openCalendar() {
        return __awaiter(this, void 0, void 0, function* () {
            const [isDisabled, hasCalendar] = yield parallel(() => [this.isDisabled(), this.hasCalendar()]);
            if (!isDisabled && hasCalendar) {
                // Alt + down arrow is the combination for opening the calendar with the keyboard.
                const host = yield this.host();
                return host.sendKeys({ alt: true }, TestKey.DOWN_ARROW);
            }
        });
    }
    /** Closes the calendar associated with the input. */
    closeCalendar() {
        return __awaiter(this, void 0, void 0, function* () {
            if (yield this.isCalendarOpen()) {
                yield closeCalendar(getCalendarId(this.host()), this.documentRootLocatorFactory());
                // This is necessary so that we wait for the closing animation to finish in touch UI mode.
                yield this.forceStabilize();
            }
        });
    }
    /** Whether a calendar is associated with the input. */
    hasCalendar() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield getCalendarId(this.host())) != null;
        });
    }
    /**
     * Gets the `MatCalendarHarness` that is associated with the trigger.
     * @param filter Optionally filters which calendar is included.
     */
    getCalendar(filter = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            return getCalendar(filter, this.host(), this.documentRootLocatorFactory());
        });
    }
}
MatDatepickerInputHarness.hostSelector = '.mat-datepicker-input';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZXBpY2tlci1pbnB1dC1oYXJuZXNzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL2RhdGVwaWNrZXIvdGVzdGluZy9kYXRlcGlja2VyLWlucHV0LWhhcm5lc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUVILE9BQU8sRUFBbUIsUUFBUSxFQUFFLE9BQU8sRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBRXpFLE9BQU8sRUFBQyw2QkFBNkIsRUFBRSxpQkFBaUIsRUFBQyxNQUFNLGlDQUFpQyxDQUFDO0FBRWpHLE9BQU8sRUFFTCxhQUFhLEVBQ2IsYUFBYSxFQUNiLFdBQVcsR0FDWixNQUFNLG1DQUFtQyxDQUFDO0FBRTNDLG1GQUFtRjtBQUNuRixNQUFNLE9BQU8seUJBQTBCLFNBQVEsNkJBQTZCO0lBSTFFOzs7OztPQUtHO0lBQ0gsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUF5QyxFQUFFO1FBRXJELE9BQU8saUJBQWlCLENBQUMseUJBQXlCLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDL0QsQ0FBQztJQUVELG1FQUFtRTtJQUM3RCxjQUFjOztZQUNsQiwwRkFBMEY7WUFDMUYsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDL0IsT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQztRQUN4RCxDQUFDO0tBQUE7SUFFRCxvREFBb0Q7SUFDOUMsWUFBWTs7WUFDaEIsTUFBTSxDQUFDLFVBQVUsRUFBRSxXQUFXLENBQUMsR0FBRyxNQUFNLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRWhHLElBQUksQ0FBQyxVQUFVLElBQUksV0FBVyxFQUFFO2dCQUM5QixrRkFBa0Y7Z0JBQ2xGLE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUMvQixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBQyxHQUFHLEVBQUUsSUFBSSxFQUFDLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO2FBQ3ZEO1FBQ0gsQ0FBQztLQUFBO0lBRUQscURBQXFEO0lBQy9DLGFBQWE7O1lBQ2pCLElBQUksTUFBTSxJQUFJLENBQUMsY0FBYyxFQUFFLEVBQUU7Z0JBQy9CLE1BQU0sYUFBYSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsMEJBQTBCLEVBQUUsQ0FBQyxDQUFDO2dCQUNuRiwwRkFBMEY7Z0JBQzFGLE1BQU0sSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO2FBQzdCO1FBQ0gsQ0FBQztLQUFBO0lBRUQsdURBQXVEO0lBQ2pELFdBQVc7O1lBQ2YsT0FBTyxDQUFDLE1BQU0sYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDO1FBQ3BELENBQUM7S0FBQTtJQUVEOzs7T0FHRztJQUNHLFdBQVcsQ0FBQyxTQUFpQyxFQUFFOztZQUNuRCxPQUFPLFdBQVcsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxFQUFFLElBQUksQ0FBQywwQkFBMEIsRUFBRSxDQUFDLENBQUM7UUFDN0UsQ0FBQztLQUFBOztBQW5ETSxzQ0FBWSxHQUFHLHVCQUF1QixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SGFybmVzc1ByZWRpY2F0ZSwgcGFyYWxsZWwsIFRlc3RLZXl9IGZyb20gJ0Bhbmd1bGFyL2Nkay90ZXN0aW5nJztcbmltcG9ydCB7RGF0ZXBpY2tlcklucHV0SGFybmVzc0ZpbHRlcnMsIENhbGVuZGFySGFybmVzc0ZpbHRlcnN9IGZyb20gJy4vZGF0ZXBpY2tlci1oYXJuZXNzLWZpbHRlcnMnO1xuaW1wb3J0IHtNYXREYXRlcGlja2VySW5wdXRIYXJuZXNzQmFzZSwgZ2V0SW5wdXRQcmVkaWNhdGV9IGZyb20gJy4vZGF0ZXBpY2tlci1pbnB1dC1oYXJuZXNzLWJhc2UnO1xuaW1wb3J0IHtNYXRDYWxlbmRhckhhcm5lc3N9IGZyb20gJy4vY2FsZW5kYXItaGFybmVzcyc7XG5pbXBvcnQge1xuICBEYXRlcGlja2VyVHJpZ2dlcixcbiAgY2xvc2VDYWxlbmRhcixcbiAgZ2V0Q2FsZW5kYXJJZCxcbiAgZ2V0Q2FsZW5kYXIsXG59IGZyb20gJy4vZGF0ZXBpY2tlci10cmlnZ2VyLWhhcm5lc3MtYmFzZSc7XG5cbi8qKiBIYXJuZXNzIGZvciBpbnRlcmFjdGluZyB3aXRoIGEgc3RhbmRhcmQgTWF0ZXJpYWwgZGF0ZXBpY2tlciBpbnB1dHMgaW4gdGVzdHMuICovXG5leHBvcnQgY2xhc3MgTWF0RGF0ZXBpY2tlcklucHV0SGFybmVzcyBleHRlbmRzIE1hdERhdGVwaWNrZXJJbnB1dEhhcm5lc3NCYXNlIGltcGxlbWVudHNcbiAgRGF0ZXBpY2tlclRyaWdnZXIge1xuICBzdGF0aWMgaG9zdFNlbGVjdG9yID0gJy5tYXQtZGF0ZXBpY2tlci1pbnB1dCc7XG5cbiAgLyoqXG4gICAqIEdldHMgYSBgSGFybmVzc1ByZWRpY2F0ZWAgdGhhdCBjYW4gYmUgdXNlZCB0byBzZWFyY2ggZm9yIGEgYE1hdERhdGVwaWNrZXJJbnB1dEhhcm5lc3NgXG4gICAqIHRoYXQgbWVldHMgY2VydGFpbiBjcml0ZXJpYS5cbiAgICogQHBhcmFtIG9wdGlvbnMgT3B0aW9ucyBmb3IgZmlsdGVyaW5nIHdoaWNoIGlucHV0IGluc3RhbmNlcyBhcmUgY29uc2lkZXJlZCBhIG1hdGNoLlxuICAgKiBAcmV0dXJuIGEgYEhhcm5lc3NQcmVkaWNhdGVgIGNvbmZpZ3VyZWQgd2l0aCB0aGUgZ2l2ZW4gb3B0aW9ucy5cbiAgICovXG4gIHN0YXRpYyB3aXRoKG9wdGlvbnM6IERhdGVwaWNrZXJJbnB1dEhhcm5lc3NGaWx0ZXJzID0ge30pOlxuICAgIEhhcm5lc3NQcmVkaWNhdGU8TWF0RGF0ZXBpY2tlcklucHV0SGFybmVzcz4ge1xuICAgIHJldHVybiBnZXRJbnB1dFByZWRpY2F0ZShNYXREYXRlcGlja2VySW5wdXRIYXJuZXNzLCBvcHRpb25zKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHdoZXRoZXIgdGhlIGNhbGVuZGFyIGFzc29jaWF0ZWQgd2l0aCB0aGUgaW5wdXQgaXMgb3Blbi4gKi9cbiAgYXN5bmMgaXNDYWxlbmRhck9wZW4oKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgLy8gYGFyaWEtb3duc2AgaXMgc2V0IG9ubHkgaWYgdGhlcmUncyBhbiBvcGVuIGRhdGVwaWNrZXIgc28gd2UgY2FuIHVzZSBpdCBhcyBhbiBpbmRpY2F0b3IuXG4gICAgY29uc3QgaG9zdCA9IGF3YWl0IHRoaXMuaG9zdCgpO1xuICAgIHJldHVybiAoYXdhaXQgaG9zdC5nZXRBdHRyaWJ1dGUoJ2FyaWEtb3ducycpKSAhPSBudWxsO1xuICB9XG5cbiAgLyoqIE9wZW5zIHRoZSBjYWxlbmRhciBhc3NvY2lhdGVkIHdpdGggdGhlIGlucHV0LiAqL1xuICBhc3luYyBvcGVuQ2FsZW5kYXIoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgW2lzRGlzYWJsZWQsIGhhc0NhbGVuZGFyXSA9IGF3YWl0IHBhcmFsbGVsKCgpID0+IFt0aGlzLmlzRGlzYWJsZWQoKSwgdGhpcy5oYXNDYWxlbmRhcigpXSk7XG5cbiAgICBpZiAoIWlzRGlzYWJsZWQgJiYgaGFzQ2FsZW5kYXIpIHtcbiAgICAgIC8vIEFsdCArIGRvd24gYXJyb3cgaXMgdGhlIGNvbWJpbmF0aW9uIGZvciBvcGVuaW5nIHRoZSBjYWxlbmRhciB3aXRoIHRoZSBrZXlib2FyZC5cbiAgICAgIGNvbnN0IGhvc3QgPSBhd2FpdCB0aGlzLmhvc3QoKTtcbiAgICAgIHJldHVybiBob3N0LnNlbmRLZXlzKHthbHQ6IHRydWV9LCBUZXN0S2V5LkRPV05fQVJST1cpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBDbG9zZXMgdGhlIGNhbGVuZGFyIGFzc29jaWF0ZWQgd2l0aCB0aGUgaW5wdXQuICovXG4gIGFzeW5jIGNsb3NlQ2FsZW5kYXIoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKGF3YWl0IHRoaXMuaXNDYWxlbmRhck9wZW4oKSkge1xuICAgICAgYXdhaXQgY2xvc2VDYWxlbmRhcihnZXRDYWxlbmRhcklkKHRoaXMuaG9zdCgpKSwgdGhpcy5kb2N1bWVudFJvb3RMb2NhdG9yRmFjdG9yeSgpKTtcbiAgICAgIC8vIFRoaXMgaXMgbmVjZXNzYXJ5IHNvIHRoYXQgd2Ugd2FpdCBmb3IgdGhlIGNsb3NpbmcgYW5pbWF0aW9uIHRvIGZpbmlzaCBpbiB0b3VjaCBVSSBtb2RlLlxuICAgICAgYXdhaXQgdGhpcy5mb3JjZVN0YWJpbGl6ZSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBXaGV0aGVyIGEgY2FsZW5kYXIgaXMgYXNzb2NpYXRlZCB3aXRoIHRoZSBpbnB1dC4gKi9cbiAgYXN5bmMgaGFzQ2FsZW5kYXIoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIChhd2FpdCBnZXRDYWxlbmRhcklkKHRoaXMuaG9zdCgpKSkgIT0gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBgTWF0Q2FsZW5kYXJIYXJuZXNzYCB0aGF0IGlzIGFzc29jaWF0ZWQgd2l0aCB0aGUgdHJpZ2dlci5cbiAgICogQHBhcmFtIGZpbHRlciBPcHRpb25hbGx5IGZpbHRlcnMgd2hpY2ggY2FsZW5kYXIgaXMgaW5jbHVkZWQuXG4gICAqL1xuICBhc3luYyBnZXRDYWxlbmRhcihmaWx0ZXI6IENhbGVuZGFySGFybmVzc0ZpbHRlcnMgPSB7fSk6IFByb21pc2U8TWF0Q2FsZW5kYXJIYXJuZXNzPiB7XG4gICAgcmV0dXJuIGdldENhbGVuZGFyKGZpbHRlciwgdGhpcy5ob3N0KCksIHRoaXMuZG9jdW1lbnRSb290TG9jYXRvckZhY3RvcnkoKSk7XG4gIH1cbn1cbiJdfQ==