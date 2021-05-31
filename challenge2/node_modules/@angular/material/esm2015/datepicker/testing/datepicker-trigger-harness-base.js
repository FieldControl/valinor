/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { ComponentHarness, parallel } from '@angular/cdk/testing';
import { MatCalendarHarness } from './calendar-harness';
/** Base class for harnesses that can trigger a calendar. */
export class DatepickerTriggerHarnessBase extends ComponentHarness {
    /** Opens the calendar if the trigger is enabled and it has a calendar. */
    openCalendar() {
        return __awaiter(this, void 0, void 0, function* () {
            const [isDisabled, hasCalendar] = yield parallel(() => [this.isDisabled(), this.hasCalendar()]);
            if (!isDisabled && hasCalendar) {
                return this._openCalendar();
            }
        });
    }
    /** Closes the calendar if it is open. */
    closeCalendar() {
        return __awaiter(this, void 0, void 0, function* () {
            if (yield this.isCalendarOpen()) {
                yield closeCalendar(getCalendarId(this.host()), this.documentRootLocatorFactory());
                // This is necessary so that we wait for the closing animation to finish in touch UI mode.
                yield this.forceStabilize();
            }
        });
    }
    /** Gets whether there is a calendar associated with the trigger. */
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
/** Gets the ID of the calendar that a particular test element can trigger. */
export function getCalendarId(host) {
    return __awaiter(this, void 0, void 0, function* () {
        return (yield host).getAttribute('data-mat-calendar');
    });
}
/** Closes the calendar with a specific ID. */
export function closeCalendar(calendarId, documentLocator) {
    return __awaiter(this, void 0, void 0, function* () {
        // We close the calendar by clicking on the backdrop, even though all datepicker variants
        // have the ability to close by pressing escape. The backdrop is preferrable, because the
        // escape key has multiple functions inside a range picker (either cancel the current range
        // or close the calendar). Since we don't have access to set the ID on the backdrop in all
        // cases, we set a unique class instead which is the same as the calendar's ID and suffixed
        // with `-backdrop`.
        const backdropSelector = `.${yield calendarId}-backdrop`;
        return (yield documentLocator.locatorFor(backdropSelector)()).click();
    });
}
/** Gets the test harness for a calendar associated with a particular host. */
export function getCalendar(filter, host, documentLocator) {
    return __awaiter(this, void 0, void 0, function* () {
        const calendarId = yield getCalendarId(host);
        if (!calendarId) {
            throw Error(`Element is not associated with a calendar`);
        }
        return documentLocator.locatorFor(MatCalendarHarness.with(Object.assign(Object.assign({}, filter), { selector: `#${calendarId}` })))();
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZXBpY2tlci10cmlnZ2VyLWhhcm5lc3MtYmFzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9kYXRlcGlja2VyL3Rlc3RpbmcvZGF0ZXBpY2tlci10cmlnZ2VyLWhhcm5lc3MtYmFzZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBRUgsT0FBTyxFQUFDLGdCQUFnQixFQUFrQixRQUFRLEVBQWMsTUFBTSxzQkFBc0IsQ0FBQztBQUU3RixPQUFPLEVBQUMsa0JBQWtCLEVBQUMsTUFBTSxvQkFBb0IsQ0FBQztBQVd0RCw0REFBNEQ7QUFDNUQsTUFBTSxPQUFnQiw0QkFBNkIsU0FBUSxnQkFBZ0I7SUFXekUsMEVBQTBFO0lBQ3BFLFlBQVk7O1lBQ2hCLE1BQU0sQ0FBQyxVQUFVLEVBQUUsV0FBVyxDQUFDLEdBQUcsTUFBTSxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUVoRyxJQUFJLENBQUMsVUFBVSxJQUFJLFdBQVcsRUFBRTtnQkFDOUIsT0FBTyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7YUFDN0I7UUFDSCxDQUFDO0tBQUE7SUFFRCx5Q0FBeUM7SUFDbkMsYUFBYTs7WUFDakIsSUFBSSxNQUFNLElBQUksQ0FBQyxjQUFjLEVBQUUsRUFBRTtnQkFDL0IsTUFBTSxhQUFhLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQywwQkFBMEIsRUFBRSxDQUFDLENBQUM7Z0JBQ25GLDBGQUEwRjtnQkFDMUYsTUFBTSxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7YUFDN0I7UUFDSCxDQUFDO0tBQUE7SUFFRCxvRUFBb0U7SUFDOUQsV0FBVzs7WUFDZixPQUFPLENBQUMsTUFBTSxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUM7UUFDcEQsQ0FBQztLQUFBO0lBRUQ7OztPQUdHO0lBQ0csV0FBVyxDQUFDLFNBQWlDLEVBQUU7O1lBQ25ELE9BQU8sV0FBVyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLEVBQUUsSUFBSSxDQUFDLDBCQUEwQixFQUFFLENBQUMsQ0FBQztRQUM3RSxDQUFDO0tBQUE7Q0FDRjtBQUVELDhFQUE4RTtBQUM5RSxNQUFNLFVBQWdCLGFBQWEsQ0FBQyxJQUEwQjs7UUFDNUQsT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUMsWUFBWSxDQUFDLG1CQUFtQixDQUFDLENBQUM7SUFDeEQsQ0FBQztDQUFBO0FBRUQsOENBQThDO0FBQzlDLE1BQU0sVUFBZ0IsYUFBYSxDQUNqQyxVQUFrQyxFQUNsQyxlQUErQjs7UUFDL0IseUZBQXlGO1FBQ3pGLHlGQUF5RjtRQUN6RiwyRkFBMkY7UUFDM0YsMEZBQTBGO1FBQzFGLDJGQUEyRjtRQUMzRixvQkFBb0I7UUFDcEIsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLE1BQU0sVUFBVSxXQUFXLENBQUM7UUFDekQsT0FBTyxDQUFDLE1BQU0sZUFBZSxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUN4RSxDQUFDO0NBQUE7QUFFRCw4RUFBOEU7QUFDOUUsTUFBTSxVQUFnQixXQUFXLENBQy9CLE1BQThCLEVBQzlCLElBQTBCLEVBQzFCLGVBQStCOztRQUMvQixNQUFNLFVBQVUsR0FBRyxNQUFNLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUU3QyxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ2YsTUFBTSxLQUFLLENBQUMsMkNBQTJDLENBQUMsQ0FBQztTQUMxRDtRQUVELE9BQU8sZUFBZSxDQUFDLFVBQVUsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLGlDQUNwRCxNQUFNLEtBQ1QsUUFBUSxFQUFFLElBQUksVUFBVSxFQUFFLElBQzFCLENBQUMsRUFBRSxDQUFDO0lBQ1IsQ0FBQztDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Q29tcG9uZW50SGFybmVzcywgTG9jYXRvckZhY3RvcnksIHBhcmFsbGVsLCBUZXN0RWxlbWVudH0gZnJvbSAnQGFuZ3VsYXIvY2RrL3Rlc3RpbmcnO1xuaW1wb3J0IHtDYWxlbmRhckhhcm5lc3NGaWx0ZXJzfSBmcm9tICcuL2RhdGVwaWNrZXItaGFybmVzcy1maWx0ZXJzJztcbmltcG9ydCB7TWF0Q2FsZW5kYXJIYXJuZXNzfSBmcm9tICcuL2NhbGVuZGFyLWhhcm5lc3MnO1xuXG4vKiogSW50ZXJmYWNlIGZvciBhIHRlc3QgaGFybmVzcyB0aGF0IGNhbiBvcGVuIGFuZCBjbG9zZSBhIGNhbGVuZGFyLiAqL1xuZXhwb3J0IGludGVyZmFjZSBEYXRlcGlja2VyVHJpZ2dlciB7XG4gIGlzQ2FsZW5kYXJPcGVuKCk6IFByb21pc2U8Ym9vbGVhbj47XG4gIG9wZW5DYWxlbmRhcigpOiBQcm9taXNlPHZvaWQ+O1xuICBjbG9zZUNhbGVuZGFyKCk6IFByb21pc2U8dm9pZD47XG4gIGhhc0NhbGVuZGFyKCk6IFByb21pc2U8Ym9vbGVhbj47XG4gIGdldENhbGVuZGFyKGZpbHRlcj86IENhbGVuZGFySGFybmVzc0ZpbHRlcnMpOiBQcm9taXNlPE1hdENhbGVuZGFySGFybmVzcz47XG59XG5cbi8qKiBCYXNlIGNsYXNzIGZvciBoYXJuZXNzZXMgdGhhdCBjYW4gdHJpZ2dlciBhIGNhbGVuZGFyLiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIERhdGVwaWNrZXJUcmlnZ2VySGFybmVzc0Jhc2UgZXh0ZW5kcyBDb21wb25lbnRIYXJuZXNzIGltcGxlbWVudHNcbiAgRGF0ZXBpY2tlclRyaWdnZXIge1xuICAvKiogV2hldGhlciB0aGUgdHJpZ2dlciBpcyBkaXNhYmxlZC4gKi9cbiAgYWJzdHJhY3QgaXNEaXNhYmxlZCgpOiBQcm9taXNlPGJvb2xlYW4+O1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBjYWxlbmRhciBhc3NvY2lhdGVkIHdpdGggdGhlIHRyaWdnZXIgaXMgb3Blbi4gKi9cbiAgYWJzdHJhY3QgaXNDYWxlbmRhck9wZW4oKTogUHJvbWlzZTxib29sZWFuPjtcblxuICAvKiogT3BlbnMgdGhlIGNhbGVuZGFyIGFzc29jaWF0ZWQgd2l0aCB0aGUgdHJpZ2dlci4gKi9cbiAgcHJvdGVjdGVkIGFic3RyYWN0IF9vcGVuQ2FsZW5kYXIoKTogUHJvbWlzZTx2b2lkPjtcblxuICAvKiogT3BlbnMgdGhlIGNhbGVuZGFyIGlmIHRoZSB0cmlnZ2VyIGlzIGVuYWJsZWQgYW5kIGl0IGhhcyBhIGNhbGVuZGFyLiAqL1xuICBhc3luYyBvcGVuQ2FsZW5kYXIoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgW2lzRGlzYWJsZWQsIGhhc0NhbGVuZGFyXSA9IGF3YWl0IHBhcmFsbGVsKCgpID0+IFt0aGlzLmlzRGlzYWJsZWQoKSwgdGhpcy5oYXNDYWxlbmRhcigpXSk7XG5cbiAgICBpZiAoIWlzRGlzYWJsZWQgJiYgaGFzQ2FsZW5kYXIpIHtcbiAgICAgIHJldHVybiB0aGlzLl9vcGVuQ2FsZW5kYXIoKTtcbiAgICB9XG4gIH1cblxuICAvKiogQ2xvc2VzIHRoZSBjYWxlbmRhciBpZiBpdCBpcyBvcGVuLiAqL1xuICBhc3luYyBjbG9zZUNhbGVuZGFyKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmIChhd2FpdCB0aGlzLmlzQ2FsZW5kYXJPcGVuKCkpIHtcbiAgICAgIGF3YWl0IGNsb3NlQ2FsZW5kYXIoZ2V0Q2FsZW5kYXJJZCh0aGlzLmhvc3QoKSksIHRoaXMuZG9jdW1lbnRSb290TG9jYXRvckZhY3RvcnkoKSk7XG4gICAgICAvLyBUaGlzIGlzIG5lY2Vzc2FyeSBzbyB0aGF0IHdlIHdhaXQgZm9yIHRoZSBjbG9zaW5nIGFuaW1hdGlvbiB0byBmaW5pc2ggaW4gdG91Y2ggVUkgbW9kZS5cbiAgICAgIGF3YWl0IHRoaXMuZm9yY2VTdGFiaWxpemUoKTtcbiAgICB9XG4gIH1cblxuICAvKiogR2V0cyB3aGV0aGVyIHRoZXJlIGlzIGEgY2FsZW5kYXIgYXNzb2NpYXRlZCB3aXRoIHRoZSB0cmlnZ2VyLiAqL1xuICBhc3luYyBoYXNDYWxlbmRhcigpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gKGF3YWl0IGdldENhbGVuZGFySWQodGhpcy5ob3N0KCkpKSAhPSBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIGBNYXRDYWxlbmRhckhhcm5lc3NgIHRoYXQgaXMgYXNzb2NpYXRlZCB3aXRoIHRoZSB0cmlnZ2VyLlxuICAgKiBAcGFyYW0gZmlsdGVyIE9wdGlvbmFsbHkgZmlsdGVycyB3aGljaCBjYWxlbmRhciBpcyBpbmNsdWRlZC5cbiAgICovXG4gIGFzeW5jIGdldENhbGVuZGFyKGZpbHRlcjogQ2FsZW5kYXJIYXJuZXNzRmlsdGVycyA9IHt9KTogUHJvbWlzZTxNYXRDYWxlbmRhckhhcm5lc3M+IHtcbiAgICByZXR1cm4gZ2V0Q2FsZW5kYXIoZmlsdGVyLCB0aGlzLmhvc3QoKSwgdGhpcy5kb2N1bWVudFJvb3RMb2NhdG9yRmFjdG9yeSgpKTtcbiAgfVxufVxuXG4vKiogR2V0cyB0aGUgSUQgb2YgdGhlIGNhbGVuZGFyIHRoYXQgYSBwYXJ0aWN1bGFyIHRlc3QgZWxlbWVudCBjYW4gdHJpZ2dlci4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRDYWxlbmRhcklkKGhvc3Q6IFByb21pc2U8VGVzdEVsZW1lbnQ+KTogUHJvbWlzZTxzdHJpbmcgfCBudWxsPiB7XG4gIHJldHVybiAoYXdhaXQgaG9zdCkuZ2V0QXR0cmlidXRlKCdkYXRhLW1hdC1jYWxlbmRhcicpO1xufVxuXG4vKiogQ2xvc2VzIHRoZSBjYWxlbmRhciB3aXRoIGEgc3BlY2lmaWMgSUQuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2xvc2VDYWxlbmRhcihcbiAgY2FsZW5kYXJJZDogUHJvbWlzZTxzdHJpbmcgfCBudWxsPixcbiAgZG9jdW1lbnRMb2NhdG9yOiBMb2NhdG9yRmFjdG9yeSkge1xuICAvLyBXZSBjbG9zZSB0aGUgY2FsZW5kYXIgYnkgY2xpY2tpbmcgb24gdGhlIGJhY2tkcm9wLCBldmVuIHRob3VnaCBhbGwgZGF0ZXBpY2tlciB2YXJpYW50c1xuICAvLyBoYXZlIHRoZSBhYmlsaXR5IHRvIGNsb3NlIGJ5IHByZXNzaW5nIGVzY2FwZS4gVGhlIGJhY2tkcm9wIGlzIHByZWZlcnJhYmxlLCBiZWNhdXNlIHRoZVxuICAvLyBlc2NhcGUga2V5IGhhcyBtdWx0aXBsZSBmdW5jdGlvbnMgaW5zaWRlIGEgcmFuZ2UgcGlja2VyIChlaXRoZXIgY2FuY2VsIHRoZSBjdXJyZW50IHJhbmdlXG4gIC8vIG9yIGNsb3NlIHRoZSBjYWxlbmRhcikuIFNpbmNlIHdlIGRvbid0IGhhdmUgYWNjZXNzIHRvIHNldCB0aGUgSUQgb24gdGhlIGJhY2tkcm9wIGluIGFsbFxuICAvLyBjYXNlcywgd2Ugc2V0IGEgdW5pcXVlIGNsYXNzIGluc3RlYWQgd2hpY2ggaXMgdGhlIHNhbWUgYXMgdGhlIGNhbGVuZGFyJ3MgSUQgYW5kIHN1ZmZpeGVkXG4gIC8vIHdpdGggYC1iYWNrZHJvcGAuXG4gIGNvbnN0IGJhY2tkcm9wU2VsZWN0b3IgPSBgLiR7YXdhaXQgY2FsZW5kYXJJZH0tYmFja2Ryb3BgO1xuICByZXR1cm4gKGF3YWl0IGRvY3VtZW50TG9jYXRvci5sb2NhdG9yRm9yKGJhY2tkcm9wU2VsZWN0b3IpKCkpLmNsaWNrKCk7XG59XG5cbi8qKiBHZXRzIHRoZSB0ZXN0IGhhcm5lc3MgZm9yIGEgY2FsZW5kYXIgYXNzb2NpYXRlZCB3aXRoIGEgcGFydGljdWxhciBob3N0LiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldENhbGVuZGFyKFxuICBmaWx0ZXI6IENhbGVuZGFySGFybmVzc0ZpbHRlcnMsXG4gIGhvc3Q6IFByb21pc2U8VGVzdEVsZW1lbnQ+LFxuICBkb2N1bWVudExvY2F0b3I6IExvY2F0b3JGYWN0b3J5KTogUHJvbWlzZTxNYXRDYWxlbmRhckhhcm5lc3M+IHtcbiAgY29uc3QgY2FsZW5kYXJJZCA9IGF3YWl0IGdldENhbGVuZGFySWQoaG9zdCk7XG5cbiAgaWYgKCFjYWxlbmRhcklkKSB7XG4gICAgdGhyb3cgRXJyb3IoYEVsZW1lbnQgaXMgbm90IGFzc29jaWF0ZWQgd2l0aCBhIGNhbGVuZGFyYCk7XG4gIH1cblxuICByZXR1cm4gZG9jdW1lbnRMb2NhdG9yLmxvY2F0b3JGb3IoTWF0Q2FsZW5kYXJIYXJuZXNzLndpdGgoe1xuICAgIC4uLmZpbHRlcixcbiAgICBzZWxlY3RvcjogYCMke2NhbGVuZGFySWR9YFxuICB9KSkoKTtcbn1cbiJdfQ==