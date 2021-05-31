/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import * as i0 from "@angular/core";
/** Datepicker data that requires internationalization. */
export class MatDatepickerIntl {
    constructor() {
        /**
         * Stream that emits whenever the labels here are changed. Use this to notify
         * components if the labels have changed after initialization.
         */
        this.changes = new Subject();
        /** A label for the calendar popup (used by screen readers). */
        this.calendarLabel = 'Calendar';
        /** A label for the button used to open the calendar popup (used by screen readers). */
        this.openCalendarLabel = 'Open calendar';
        /** Label for the button used to close the calendar popup. */
        this.closeCalendarLabel = 'Close calendar';
        /** A label for the previous month button (used by screen readers). */
        this.prevMonthLabel = 'Previous month';
        /** A label for the next month button (used by screen readers). */
        this.nextMonthLabel = 'Next month';
        /** A label for the previous year button (used by screen readers). */
        this.prevYearLabel = 'Previous year';
        /** A label for the next year button (used by screen readers). */
        this.nextYearLabel = 'Next year';
        /** A label for the previous multi-year button (used by screen readers). */
        this.prevMultiYearLabel = 'Previous 24 years';
        /** A label for the next multi-year button (used by screen readers). */
        this.nextMultiYearLabel = 'Next 24 years';
        /** A label for the 'switch to month view' button (used by screen readers). */
        this.switchToMonthViewLabel = 'Choose date';
        /** A label for the 'switch to year view' button (used by screen readers). */
        this.switchToMultiYearViewLabel = 'Choose month and year';
    }
    /** Formats a range of years. */
    formatYearRange(start, end) {
        return `${start} \u2013 ${end}`;
    }
}
MatDatepickerIntl.ɵprov = i0.ɵɵdefineInjectable({ factory: function MatDatepickerIntl_Factory() { return new MatDatepickerIntl(); }, token: MatDatepickerIntl, providedIn: "root" });
MatDatepickerIntl.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZXBpY2tlci1pbnRsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL2RhdGVwaWNrZXIvZGF0ZXBpY2tlci1pbnRsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDekMsT0FBTyxFQUFDLE9BQU8sRUFBQyxNQUFNLE1BQU0sQ0FBQzs7QUFHN0IsMERBQTBEO0FBRTFELE1BQU0sT0FBTyxpQkFBaUI7SUFEOUI7UUFFRTs7O1dBR0c7UUFDTSxZQUFPLEdBQWtCLElBQUksT0FBTyxFQUFRLENBQUM7UUFFdEQsK0RBQStEO1FBQy9ELGtCQUFhLEdBQVcsVUFBVSxDQUFDO1FBRW5DLHVGQUF1RjtRQUN2RixzQkFBaUIsR0FBVyxlQUFlLENBQUM7UUFFNUMsNkRBQTZEO1FBQzdELHVCQUFrQixHQUFXLGdCQUFnQixDQUFDO1FBRTlDLHNFQUFzRTtRQUN0RSxtQkFBYyxHQUFXLGdCQUFnQixDQUFDO1FBRTFDLGtFQUFrRTtRQUNsRSxtQkFBYyxHQUFXLFlBQVksQ0FBQztRQUV0QyxxRUFBcUU7UUFDckUsa0JBQWEsR0FBVyxlQUFlLENBQUM7UUFFeEMsaUVBQWlFO1FBQ2pFLGtCQUFhLEdBQVcsV0FBVyxDQUFDO1FBRXBDLDJFQUEyRTtRQUMzRSx1QkFBa0IsR0FBVyxtQkFBbUIsQ0FBQztRQUVqRCx1RUFBdUU7UUFDdkUsdUJBQWtCLEdBQVcsZUFBZSxDQUFDO1FBRTdDLDhFQUE4RTtRQUM5RSwyQkFBc0IsR0FBVyxhQUFhLENBQUM7UUFFL0MsNkVBQTZFO1FBQzdFLCtCQUEwQixHQUFXLHVCQUF1QixDQUFDO0tBTTlEO0lBSkMsZ0NBQWdDO0lBQ2hDLGVBQWUsQ0FBQyxLQUFhLEVBQUUsR0FBVztRQUN4QyxPQUFPLEdBQUcsS0FBSyxXQUFXLEdBQUcsRUFBRSxDQUFDO0lBQ2xDLENBQUM7Ozs7WUE1Q0YsVUFBVSxTQUFDLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdGFibGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtTdWJqZWN0fSBmcm9tICdyeGpzJztcblxuXG4vKiogRGF0ZXBpY2tlciBkYXRhIHRoYXQgcmVxdWlyZXMgaW50ZXJuYXRpb25hbGl6YXRpb24uICovXG5ASW5qZWN0YWJsZSh7cHJvdmlkZWRJbjogJ3Jvb3QnfSlcbmV4cG9ydCBjbGFzcyBNYXREYXRlcGlja2VySW50bCB7XG4gIC8qKlxuICAgKiBTdHJlYW0gdGhhdCBlbWl0cyB3aGVuZXZlciB0aGUgbGFiZWxzIGhlcmUgYXJlIGNoYW5nZWQuIFVzZSB0aGlzIHRvIG5vdGlmeVxuICAgKiBjb21wb25lbnRzIGlmIHRoZSBsYWJlbHMgaGF2ZSBjaGFuZ2VkIGFmdGVyIGluaXRpYWxpemF0aW9uLlxuICAgKi9cbiAgcmVhZG9ubHkgY2hhbmdlczogU3ViamVjdDx2b2lkPiA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XG5cbiAgLyoqIEEgbGFiZWwgZm9yIHRoZSBjYWxlbmRhciBwb3B1cCAodXNlZCBieSBzY3JlZW4gcmVhZGVycykuICovXG4gIGNhbGVuZGFyTGFiZWw6IHN0cmluZyA9ICdDYWxlbmRhcic7XG5cbiAgLyoqIEEgbGFiZWwgZm9yIHRoZSBidXR0b24gdXNlZCB0byBvcGVuIHRoZSBjYWxlbmRhciBwb3B1cCAodXNlZCBieSBzY3JlZW4gcmVhZGVycykuICovXG4gIG9wZW5DYWxlbmRhckxhYmVsOiBzdHJpbmcgPSAnT3BlbiBjYWxlbmRhcic7XG5cbiAgLyoqIExhYmVsIGZvciB0aGUgYnV0dG9uIHVzZWQgdG8gY2xvc2UgdGhlIGNhbGVuZGFyIHBvcHVwLiAqL1xuICBjbG9zZUNhbGVuZGFyTGFiZWw6IHN0cmluZyA9ICdDbG9zZSBjYWxlbmRhcic7XG5cbiAgLyoqIEEgbGFiZWwgZm9yIHRoZSBwcmV2aW91cyBtb250aCBidXR0b24gKHVzZWQgYnkgc2NyZWVuIHJlYWRlcnMpLiAqL1xuICBwcmV2TW9udGhMYWJlbDogc3RyaW5nID0gJ1ByZXZpb3VzIG1vbnRoJztcblxuICAvKiogQSBsYWJlbCBmb3IgdGhlIG5leHQgbW9udGggYnV0dG9uICh1c2VkIGJ5IHNjcmVlbiByZWFkZXJzKS4gKi9cbiAgbmV4dE1vbnRoTGFiZWw6IHN0cmluZyA9ICdOZXh0IG1vbnRoJztcblxuICAvKiogQSBsYWJlbCBmb3IgdGhlIHByZXZpb3VzIHllYXIgYnV0dG9uICh1c2VkIGJ5IHNjcmVlbiByZWFkZXJzKS4gKi9cbiAgcHJldlllYXJMYWJlbDogc3RyaW5nID0gJ1ByZXZpb3VzIHllYXInO1xuXG4gIC8qKiBBIGxhYmVsIGZvciB0aGUgbmV4dCB5ZWFyIGJ1dHRvbiAodXNlZCBieSBzY3JlZW4gcmVhZGVycykuICovXG4gIG5leHRZZWFyTGFiZWw6IHN0cmluZyA9ICdOZXh0IHllYXInO1xuXG4gIC8qKiBBIGxhYmVsIGZvciB0aGUgcHJldmlvdXMgbXVsdGkteWVhciBidXR0b24gKHVzZWQgYnkgc2NyZWVuIHJlYWRlcnMpLiAqL1xuICBwcmV2TXVsdGlZZWFyTGFiZWw6IHN0cmluZyA9ICdQcmV2aW91cyAyNCB5ZWFycyc7XG5cbiAgLyoqIEEgbGFiZWwgZm9yIHRoZSBuZXh0IG11bHRpLXllYXIgYnV0dG9uICh1c2VkIGJ5IHNjcmVlbiByZWFkZXJzKS4gKi9cbiAgbmV4dE11bHRpWWVhckxhYmVsOiBzdHJpbmcgPSAnTmV4dCAyNCB5ZWFycyc7XG5cbiAgLyoqIEEgbGFiZWwgZm9yIHRoZSAnc3dpdGNoIHRvIG1vbnRoIHZpZXcnIGJ1dHRvbiAodXNlZCBieSBzY3JlZW4gcmVhZGVycykuICovXG4gIHN3aXRjaFRvTW9udGhWaWV3TGFiZWw6IHN0cmluZyA9ICdDaG9vc2UgZGF0ZSc7XG5cbiAgLyoqIEEgbGFiZWwgZm9yIHRoZSAnc3dpdGNoIHRvIHllYXIgdmlldycgYnV0dG9uICh1c2VkIGJ5IHNjcmVlbiByZWFkZXJzKS4gKi9cbiAgc3dpdGNoVG9NdWx0aVllYXJWaWV3TGFiZWw6IHN0cmluZyA9ICdDaG9vc2UgbW9udGggYW5kIHllYXInO1xuXG4gIC8qKiBGb3JtYXRzIGEgcmFuZ2Ugb2YgeWVhcnMuICovXG4gIGZvcm1hdFllYXJSYW5nZShzdGFydDogc3RyaW5nLCBlbmQ6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGAke3N0YXJ0fSBcXHUyMDEzICR7ZW5kfWA7XG4gIH1cbn1cbiJdfQ==