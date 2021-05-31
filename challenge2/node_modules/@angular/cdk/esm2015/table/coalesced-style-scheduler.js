/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Injectable, NgZone, InjectionToken } from '@angular/core';
import { from, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
/**
 * @docs-private
 */
export class _Schedule {
    constructor() {
        this.tasks = [];
        this.endTasks = [];
    }
}
/** Injection token used to provide a coalesced style scheduler. */
export const _COALESCED_STYLE_SCHEDULER = new InjectionToken('_COALESCED_STYLE_SCHEDULER');
/**
 * Allows grouping up CSSDom mutations after the current execution context.
 * This can significantly improve performance when separate consecutive functions are
 * reading from the CSSDom and then mutating it.
 *
 * @docs-private
 */
export class _CoalescedStyleScheduler {
    constructor(_ngZone) {
        this._ngZone = _ngZone;
        this._currentSchedule = null;
        this._destroyed = new Subject();
    }
    /**
     * Schedules the specified task to run at the end of the current VM turn.
     */
    schedule(task) {
        this._createScheduleIfNeeded();
        this._currentSchedule.tasks.push(task);
    }
    /**
     * Schedules the specified task to run after other scheduled tasks at the end of the current
     * VM turn.
     */
    scheduleEnd(task) {
        this._createScheduleIfNeeded();
        this._currentSchedule.endTasks.push(task);
    }
    /** Prevent any further tasks from running. */
    ngOnDestroy() {
        this._destroyed.next();
        this._destroyed.complete();
    }
    _createScheduleIfNeeded() {
        if (this._currentSchedule) {
            return;
        }
        this._currentSchedule = new _Schedule();
        this._getScheduleObservable().pipe(takeUntil(this._destroyed)).subscribe(() => {
            while (this._currentSchedule.tasks.length || this._currentSchedule.endTasks.length) {
                const schedule = this._currentSchedule;
                // Capture new tasks scheduled by the current set of tasks.
                this._currentSchedule = new _Schedule();
                for (const task of schedule.tasks) {
                    task();
                }
                for (const task of schedule.endTasks) {
                    task();
                }
            }
            this._currentSchedule = null;
        });
    }
    _getScheduleObservable() {
        // Use onStable when in the context of an ongoing change detection cycle so that we
        // do not accidentally trigger additional cycles.
        return this._ngZone.isStable ?
            from(Promise.resolve(undefined)) :
            this._ngZone.onStable.pipe(take(1));
    }
}
_CoalescedStyleScheduler.decorators = [
    { type: Injectable }
];
_CoalescedStyleScheduler.ctorParameters = () => [
    { type: NgZone }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29hbGVzY2VkLXN0eWxlLXNjaGVkdWxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvdGFibGUvY29hbGVzY2VkLXN0eWxlLXNjaGVkdWxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBYSxjQUFjLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDNUUsT0FBTyxFQUFDLElBQUksRUFBRSxPQUFPLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDbkMsT0FBTyxFQUFDLElBQUksRUFBRSxTQUFTLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUUvQzs7R0FFRztBQUNILE1BQU0sT0FBTyxTQUFTO0lBQXRCO1FBQ0UsVUFBSyxHQUFzQixFQUFFLENBQUM7UUFDOUIsYUFBUSxHQUFzQixFQUFFLENBQUM7SUFDbkMsQ0FBQztDQUFBO0FBRUQsbUVBQW1FO0FBQ25FLE1BQU0sQ0FBQyxNQUFNLDBCQUEwQixHQUNuQyxJQUFJLGNBQWMsQ0FBMkIsNEJBQTRCLENBQUMsQ0FBQztBQUUvRTs7Ozs7O0dBTUc7QUFFSCxNQUFNLE9BQU8sd0JBQXdCO0lBSW5DLFlBQTZCLE9BQWU7UUFBZixZQUFPLEdBQVAsT0FBTyxDQUFRO1FBSHBDLHFCQUFnQixHQUFtQixJQUFJLENBQUM7UUFDL0IsZUFBVSxHQUFHLElBQUksT0FBTyxFQUFRLENBQUM7SUFFSCxDQUFDO0lBRWhEOztPQUVHO0lBQ0gsUUFBUSxDQUFDLElBQW1CO1FBQzFCLElBQUksQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO1FBRS9CLElBQUksQ0FBQyxnQkFBaUIsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFFRDs7O09BR0c7SUFDSCxXQUFXLENBQUMsSUFBbUI7UUFDN0IsSUFBSSxDQUFDLHVCQUF1QixFQUFFLENBQUM7UUFFL0IsSUFBSSxDQUFDLGdCQUFpQixDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDN0MsQ0FBQztJQUVELDhDQUE4QztJQUM5QyxXQUFXO1FBQ1QsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUN2QixJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQzdCLENBQUM7SUFFTyx1QkFBdUI7UUFDN0IsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLEVBQUU7WUFBRSxPQUFPO1NBQUU7UUFFdEMsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksU0FBUyxFQUFFLENBQUM7UUFFeEMsSUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUMsSUFBSSxDQUM5QixTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUM3QixDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUU7WUFDZixPQUFPLElBQUksQ0FBQyxnQkFBaUIsQ0FBQyxLQUFLLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxnQkFBaUIsQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFO2dCQUNwRixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsZ0JBQWlCLENBQUM7Z0JBRXhDLDJEQUEyRDtnQkFDM0QsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksU0FBUyxFQUFFLENBQUM7Z0JBRXhDLEtBQUssTUFBTSxJQUFJLElBQUksUUFBUSxDQUFDLEtBQUssRUFBRTtvQkFDakMsSUFBSSxFQUFFLENBQUM7aUJBQ1I7Z0JBRUQsS0FBSyxNQUFNLElBQUksSUFBSSxRQUFRLENBQUMsUUFBUSxFQUFFO29CQUNwQyxJQUFJLEVBQUUsQ0FBQztpQkFDUjthQUNGO1lBRUQsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQztRQUMvQixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFTyxzQkFBc0I7UUFDNUIsbUZBQW1GO1FBQ25GLGlEQUFpRDtRQUNqRCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDMUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2xDLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMxQyxDQUFDOzs7WUFqRUYsVUFBVTs7O1lBdkJTLE1BQU0iLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtJbmplY3RhYmxlLCBOZ1pvbmUsIE9uRGVzdHJveSwgSW5qZWN0aW9uVG9rZW59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtmcm9tLCBTdWJqZWN0fSBmcm9tICdyeGpzJztcbmltcG9ydCB7dGFrZSwgdGFrZVVudGlsfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbi8qKlxuICogQGRvY3MtcHJpdmF0ZVxuICovXG5leHBvcnQgY2xhc3MgX1NjaGVkdWxlIHtcbiAgdGFza3M6ICgoKSA9PiB1bmtub3duKVtdID0gW107XG4gIGVuZFRhc2tzOiAoKCkgPT4gdW5rbm93bilbXSA9IFtdO1xufVxuXG4vKiogSW5qZWN0aW9uIHRva2VuIHVzZWQgdG8gcHJvdmlkZSBhIGNvYWxlc2NlZCBzdHlsZSBzY2hlZHVsZXIuICovXG5leHBvcnQgY29uc3QgX0NPQUxFU0NFRF9TVFlMRV9TQ0hFRFVMRVIgPVxuICAgIG5ldyBJbmplY3Rpb25Ub2tlbjxfQ29hbGVzY2VkU3R5bGVTY2hlZHVsZXI+KCdfQ09BTEVTQ0VEX1NUWUxFX1NDSEVEVUxFUicpO1xuXG4vKipcbiAqIEFsbG93cyBncm91cGluZyB1cCBDU1NEb20gbXV0YXRpb25zIGFmdGVyIHRoZSBjdXJyZW50IGV4ZWN1dGlvbiBjb250ZXh0LlxuICogVGhpcyBjYW4gc2lnbmlmaWNhbnRseSBpbXByb3ZlIHBlcmZvcm1hbmNlIHdoZW4gc2VwYXJhdGUgY29uc2VjdXRpdmUgZnVuY3Rpb25zIGFyZVxuICogcmVhZGluZyBmcm9tIHRoZSBDU1NEb20gYW5kIHRoZW4gbXV0YXRpbmcgaXQuXG4gKlxuICogQGRvY3MtcHJpdmF0ZVxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgX0NvYWxlc2NlZFN0eWxlU2NoZWR1bGVyIGltcGxlbWVudHMgT25EZXN0cm95IHtcbiAgcHJpdmF0ZSBfY3VycmVudFNjaGVkdWxlOiBfU2NoZWR1bGV8bnVsbCA9IG51bGw7XG4gIHByaXZhdGUgcmVhZG9ubHkgX2Rlc3Ryb3llZCA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSByZWFkb25seSBfbmdab25lOiBOZ1pvbmUpIHt9XG5cbiAgLyoqXG4gICAqIFNjaGVkdWxlcyB0aGUgc3BlY2lmaWVkIHRhc2sgdG8gcnVuIGF0IHRoZSBlbmQgb2YgdGhlIGN1cnJlbnQgVk0gdHVybi5cbiAgICovXG4gIHNjaGVkdWxlKHRhc2s6ICgpID0+IHVua25vd24pOiB2b2lkIHtcbiAgICB0aGlzLl9jcmVhdGVTY2hlZHVsZUlmTmVlZGVkKCk7XG5cbiAgICB0aGlzLl9jdXJyZW50U2NoZWR1bGUhLnRhc2tzLnB1c2godGFzayk7XG4gIH1cblxuICAvKipcbiAgICogU2NoZWR1bGVzIHRoZSBzcGVjaWZpZWQgdGFzayB0byBydW4gYWZ0ZXIgb3RoZXIgc2NoZWR1bGVkIHRhc2tzIGF0IHRoZSBlbmQgb2YgdGhlIGN1cnJlbnRcbiAgICogVk0gdHVybi5cbiAgICovXG4gIHNjaGVkdWxlRW5kKHRhc2s6ICgpID0+IHVua25vd24pOiB2b2lkIHtcbiAgICB0aGlzLl9jcmVhdGVTY2hlZHVsZUlmTmVlZGVkKCk7XG5cbiAgICB0aGlzLl9jdXJyZW50U2NoZWR1bGUhLmVuZFRhc2tzLnB1c2godGFzayk7XG4gIH1cblxuICAvKiogUHJldmVudCBhbnkgZnVydGhlciB0YXNrcyBmcm9tIHJ1bm5pbmcuICovXG4gIG5nT25EZXN0cm95KCkge1xuICAgIHRoaXMuX2Rlc3Ryb3llZC5uZXh0KCk7XG4gICAgdGhpcy5fZGVzdHJveWVkLmNvbXBsZXRlKCk7XG4gIH1cblxuICBwcml2YXRlIF9jcmVhdGVTY2hlZHVsZUlmTmVlZGVkKCkge1xuICAgIGlmICh0aGlzLl9jdXJyZW50U2NoZWR1bGUpIHsgcmV0dXJuOyB9XG5cbiAgICB0aGlzLl9jdXJyZW50U2NoZWR1bGUgPSBuZXcgX1NjaGVkdWxlKCk7XG5cbiAgICB0aGlzLl9nZXRTY2hlZHVsZU9ic2VydmFibGUoKS5waXBlKFxuICAgICAgICB0YWtlVW50aWwodGhpcy5fZGVzdHJveWVkKSxcbiAgICApLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICB3aGlsZSAodGhpcy5fY3VycmVudFNjaGVkdWxlIS50YXNrcy5sZW5ndGggfHwgdGhpcy5fY3VycmVudFNjaGVkdWxlIS5lbmRUYXNrcy5sZW5ndGgpIHtcbiAgICAgICAgY29uc3Qgc2NoZWR1bGUgPSB0aGlzLl9jdXJyZW50U2NoZWR1bGUhO1xuXG4gICAgICAgIC8vIENhcHR1cmUgbmV3IHRhc2tzIHNjaGVkdWxlZCBieSB0aGUgY3VycmVudCBzZXQgb2YgdGFza3MuXG4gICAgICAgIHRoaXMuX2N1cnJlbnRTY2hlZHVsZSA9IG5ldyBfU2NoZWR1bGUoKTtcblxuICAgICAgICBmb3IgKGNvbnN0IHRhc2sgb2Ygc2NoZWR1bGUudGFza3MpIHtcbiAgICAgICAgICB0YXNrKCk7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGNvbnN0IHRhc2sgb2Ygc2NoZWR1bGUuZW5kVGFza3MpIHtcbiAgICAgICAgICB0YXNrKCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5fY3VycmVudFNjaGVkdWxlID0gbnVsbDtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX2dldFNjaGVkdWxlT2JzZXJ2YWJsZSgpIHtcbiAgICAvLyBVc2Ugb25TdGFibGUgd2hlbiBpbiB0aGUgY29udGV4dCBvZiBhbiBvbmdvaW5nIGNoYW5nZSBkZXRlY3Rpb24gY3ljbGUgc28gdGhhdCB3ZVxuICAgIC8vIGRvIG5vdCBhY2NpZGVudGFsbHkgdHJpZ2dlciBhZGRpdGlvbmFsIGN5Y2xlcy5cbiAgICByZXR1cm4gdGhpcy5fbmdab25lLmlzU3RhYmxlID9cbiAgICAgICAgZnJvbShQcm9taXNlLnJlc29sdmUodW5kZWZpbmVkKSkgOlxuICAgICAgICB0aGlzLl9uZ1pvbmUub25TdGFibGUucGlwZSh0YWtlKDEpKTtcbiAgfVxufVxuIl19