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
import * as i0 from "@angular/core";
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
        this._getScheduleObservable()
            .pipe(takeUntil(this._destroyed))
            .subscribe(() => {
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
        return this._ngZone.isStable
            ? from(Promise.resolve(undefined))
            : this._ngZone.onStable.pipe(take(1));
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.2.0", ngImport: i0, type: _CoalescedStyleScheduler, deps: [{ token: i0.NgZone }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "17.2.0", ngImport: i0, type: _CoalescedStyleScheduler }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.2.0", ngImport: i0, type: _CoalescedStyleScheduler, decorators: [{
            type: Injectable
        }], ctorParameters: () => [{ type: i0.NgZone }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29hbGVzY2VkLXN0eWxlLXNjaGVkdWxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvdGFibGUvY29hbGVzY2VkLXN0eWxlLXNjaGVkdWxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBYSxjQUFjLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDNUUsT0FBTyxFQUFDLElBQUksRUFBRSxPQUFPLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDbkMsT0FBTyxFQUFDLElBQUksRUFBRSxTQUFTLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQzs7QUFFL0M7O0dBRUc7QUFDSCxNQUFNLE9BQU8sU0FBUztJQUF0QjtRQUNFLFVBQUssR0FBc0IsRUFBRSxDQUFDO1FBQzlCLGFBQVEsR0FBc0IsRUFBRSxDQUFDO0lBQ25DLENBQUM7Q0FBQTtBQUVELG1FQUFtRTtBQUNuRSxNQUFNLENBQUMsTUFBTSwwQkFBMEIsR0FBRyxJQUFJLGNBQWMsQ0FDMUQsNEJBQTRCLENBQzdCLENBQUM7QUFFRjs7Ozs7O0dBTUc7QUFFSCxNQUFNLE9BQU8sd0JBQXdCO0lBSW5DLFlBQTZCLE9BQWU7UUFBZixZQUFPLEdBQVAsT0FBTyxDQUFRO1FBSHBDLHFCQUFnQixHQUFxQixJQUFJLENBQUM7UUFDakMsZUFBVSxHQUFHLElBQUksT0FBTyxFQUFRLENBQUM7SUFFSCxDQUFDO0lBRWhEOztPQUVHO0lBQ0gsUUFBUSxDQUFDLElBQW1CO1FBQzFCLElBQUksQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO1FBRS9CLElBQUksQ0FBQyxnQkFBaUIsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFFRDs7O09BR0c7SUFDSCxXQUFXLENBQUMsSUFBbUI7UUFDN0IsSUFBSSxDQUFDLHVCQUF1QixFQUFFLENBQUM7UUFFL0IsSUFBSSxDQUFDLGdCQUFpQixDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDN0MsQ0FBQztJQUVELDhDQUE4QztJQUM5QyxXQUFXO1FBQ1QsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUN2QixJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQzdCLENBQUM7SUFFTyx1QkFBdUI7UUFDN0IsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztZQUMxQixPQUFPO1FBQ1QsQ0FBQztRQUVELElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLFNBQVMsRUFBRSxDQUFDO1FBRXhDLElBQUksQ0FBQyxzQkFBc0IsRUFBRTthQUMxQixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQzthQUNoQyxTQUFTLENBQUMsR0FBRyxFQUFFO1lBQ2QsT0FBTyxJQUFJLENBQUMsZ0JBQWlCLENBQUMsS0FBSyxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsZ0JBQWlCLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUNyRixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsZ0JBQWlCLENBQUM7Z0JBRXhDLDJEQUEyRDtnQkFDM0QsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksU0FBUyxFQUFFLENBQUM7Z0JBRXhDLEtBQUssTUFBTSxJQUFJLElBQUksUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDO29CQUNsQyxJQUFJLEVBQUUsQ0FBQztnQkFDVCxDQUFDO2dCQUVELEtBQUssTUFBTSxJQUFJLElBQUksUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDO29CQUNyQyxJQUFJLEVBQUUsQ0FBQztnQkFDVCxDQUFDO1lBQ0gsQ0FBQztZQUVELElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUM7UUFDL0IsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU8sc0JBQXNCO1FBQzVCLG1GQUFtRjtRQUNuRixpREFBaUQ7UUFDakQsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVE7WUFDMUIsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ2xDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDMUMsQ0FBQzs4R0FsRVUsd0JBQXdCO2tIQUF4Qix3QkFBd0I7OzJGQUF4Qix3QkFBd0I7a0JBRHBDLFVBQVUiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtJbmplY3RhYmxlLCBOZ1pvbmUsIE9uRGVzdHJveSwgSW5qZWN0aW9uVG9rZW59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtmcm9tLCBTdWJqZWN0fSBmcm9tICdyeGpzJztcbmltcG9ydCB7dGFrZSwgdGFrZVVudGlsfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbi8qKlxuICogQGRvY3MtcHJpdmF0ZVxuICovXG5leHBvcnQgY2xhc3MgX1NjaGVkdWxlIHtcbiAgdGFza3M6ICgoKSA9PiB1bmtub3duKVtdID0gW107XG4gIGVuZFRhc2tzOiAoKCkgPT4gdW5rbm93bilbXSA9IFtdO1xufVxuXG4vKiogSW5qZWN0aW9uIHRva2VuIHVzZWQgdG8gcHJvdmlkZSBhIGNvYWxlc2NlZCBzdHlsZSBzY2hlZHVsZXIuICovXG5leHBvcnQgY29uc3QgX0NPQUxFU0NFRF9TVFlMRV9TQ0hFRFVMRVIgPSBuZXcgSW5qZWN0aW9uVG9rZW48X0NvYWxlc2NlZFN0eWxlU2NoZWR1bGVyPihcbiAgJ19DT0FMRVNDRURfU1RZTEVfU0NIRURVTEVSJyxcbik7XG5cbi8qKlxuICogQWxsb3dzIGdyb3VwaW5nIHVwIENTU0RvbSBtdXRhdGlvbnMgYWZ0ZXIgdGhlIGN1cnJlbnQgZXhlY3V0aW9uIGNvbnRleHQuXG4gKiBUaGlzIGNhbiBzaWduaWZpY2FudGx5IGltcHJvdmUgcGVyZm9ybWFuY2Ugd2hlbiBzZXBhcmF0ZSBjb25zZWN1dGl2ZSBmdW5jdGlvbnMgYXJlXG4gKiByZWFkaW5nIGZyb20gdGhlIENTU0RvbSBhbmQgdGhlbiBtdXRhdGluZyBpdC5cbiAqXG4gKiBAZG9jcy1wcml2YXRlXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBfQ29hbGVzY2VkU3R5bGVTY2hlZHVsZXIgaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xuICBwcml2YXRlIF9jdXJyZW50U2NoZWR1bGU6IF9TY2hlZHVsZSB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIHJlYWRvbmx5IF9kZXN0cm95ZWQgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgX25nWm9uZTogTmdab25lKSB7fVxuXG4gIC8qKlxuICAgKiBTY2hlZHVsZXMgdGhlIHNwZWNpZmllZCB0YXNrIHRvIHJ1biBhdCB0aGUgZW5kIG9mIHRoZSBjdXJyZW50IFZNIHR1cm4uXG4gICAqL1xuICBzY2hlZHVsZSh0YXNrOiAoKSA9PiB1bmtub3duKTogdm9pZCB7XG4gICAgdGhpcy5fY3JlYXRlU2NoZWR1bGVJZk5lZWRlZCgpO1xuXG4gICAgdGhpcy5fY3VycmVudFNjaGVkdWxlIS50YXNrcy5wdXNoKHRhc2spO1xuICB9XG5cbiAgLyoqXG4gICAqIFNjaGVkdWxlcyB0aGUgc3BlY2lmaWVkIHRhc2sgdG8gcnVuIGFmdGVyIG90aGVyIHNjaGVkdWxlZCB0YXNrcyBhdCB0aGUgZW5kIG9mIHRoZSBjdXJyZW50XG4gICAqIFZNIHR1cm4uXG4gICAqL1xuICBzY2hlZHVsZUVuZCh0YXNrOiAoKSA9PiB1bmtub3duKTogdm9pZCB7XG4gICAgdGhpcy5fY3JlYXRlU2NoZWR1bGVJZk5lZWRlZCgpO1xuXG4gICAgdGhpcy5fY3VycmVudFNjaGVkdWxlIS5lbmRUYXNrcy5wdXNoKHRhc2spO1xuICB9XG5cbiAgLyoqIFByZXZlbnQgYW55IGZ1cnRoZXIgdGFza3MgZnJvbSBydW5uaW5nLiAqL1xuICBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLl9kZXN0cm95ZWQubmV4dCgpO1xuICAgIHRoaXMuX2Rlc3Ryb3llZC5jb21wbGV0ZSgpO1xuICB9XG5cbiAgcHJpdmF0ZSBfY3JlYXRlU2NoZWR1bGVJZk5lZWRlZCgpIHtcbiAgICBpZiAodGhpcy5fY3VycmVudFNjaGVkdWxlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5fY3VycmVudFNjaGVkdWxlID0gbmV3IF9TY2hlZHVsZSgpO1xuXG4gICAgdGhpcy5fZ2V0U2NoZWR1bGVPYnNlcnZhYmxlKClcbiAgICAgIC5waXBlKHRha2VVbnRpbCh0aGlzLl9kZXN0cm95ZWQpKVxuICAgICAgLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgIHdoaWxlICh0aGlzLl9jdXJyZW50U2NoZWR1bGUhLnRhc2tzLmxlbmd0aCB8fCB0aGlzLl9jdXJyZW50U2NoZWR1bGUhLmVuZFRhc2tzLmxlbmd0aCkge1xuICAgICAgICAgIGNvbnN0IHNjaGVkdWxlID0gdGhpcy5fY3VycmVudFNjaGVkdWxlITtcblxuICAgICAgICAgIC8vIENhcHR1cmUgbmV3IHRhc2tzIHNjaGVkdWxlZCBieSB0aGUgY3VycmVudCBzZXQgb2YgdGFza3MuXG4gICAgICAgICAgdGhpcy5fY3VycmVudFNjaGVkdWxlID0gbmV3IF9TY2hlZHVsZSgpO1xuXG4gICAgICAgICAgZm9yIChjb25zdCB0YXNrIG9mIHNjaGVkdWxlLnRhc2tzKSB7XG4gICAgICAgICAgICB0YXNrKCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgZm9yIChjb25zdCB0YXNrIG9mIHNjaGVkdWxlLmVuZFRhc2tzKSB7XG4gICAgICAgICAgICB0YXNrKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fY3VycmVudFNjaGVkdWxlID0gbnVsbDtcbiAgICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0U2NoZWR1bGVPYnNlcnZhYmxlKCkge1xuICAgIC8vIFVzZSBvblN0YWJsZSB3aGVuIGluIHRoZSBjb250ZXh0IG9mIGFuIG9uZ29pbmcgY2hhbmdlIGRldGVjdGlvbiBjeWNsZSBzbyB0aGF0IHdlXG4gICAgLy8gZG8gbm90IGFjY2lkZW50YWxseSB0cmlnZ2VyIGFkZGl0aW9uYWwgY3ljbGVzLlxuICAgIHJldHVybiB0aGlzLl9uZ1pvbmUuaXNTdGFibGVcbiAgICAgID8gZnJvbShQcm9taXNlLnJlc29sdmUodW5kZWZpbmVkKSlcbiAgICAgIDogdGhpcy5fbmdab25lLm9uU3RhYmxlLnBpcGUodGFrZSgxKSk7XG4gIH1cbn1cbiJdfQ==