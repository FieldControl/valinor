/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { BehaviorSubject } from 'rxjs';
import { inject } from './di';
import { Injectable } from './di/injectable';
import * as i0 from "./r3_symbols";
/**
 * Internal implementation of the pending tasks service.
 */
export class PendingTasks {
    constructor() {
        this.taskId = 0;
        this.pendingTasks = new Set();
        this.hasPendingTasks = new BehaviorSubject(false);
    }
    get _hasPendingTasks() {
        return this.hasPendingTasks.value;
    }
    add() {
        if (!this._hasPendingTasks) {
            this.hasPendingTasks.next(true);
        }
        const taskId = this.taskId++;
        this.pendingTasks.add(taskId);
        return taskId;
    }
    remove(taskId) {
        this.pendingTasks.delete(taskId);
        if (this.pendingTasks.size === 0 && this._hasPendingTasks) {
            this.hasPendingTasks.next(false);
        }
    }
    ngOnDestroy() {
        this.pendingTasks.clear();
        if (this._hasPendingTasks) {
            this.hasPendingTasks.next(false);
        }
    }
    static { this.ɵfac = function PendingTasks_Factory(t) { return new (t || PendingTasks)(); }; }
    static { this.ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: PendingTasks, factory: PendingTasks.ɵfac, providedIn: 'root' }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.setClassMetadata(PendingTasks, [{
        type: Injectable,
        args: [{
                providedIn: 'root',
            }]
    }], null, null); })();
/**
 * Experimental service that keeps track of pending tasks contributing to the stableness of Angular
 * application. While several existing Angular services (ex.: `HttpClient`) will internally manage
 * tasks influencing stability, this API gives control over stability to library and application
 * developers for specific cases not covered by Angular internals.
 *
 * The concept of stability comes into play in several important scenarios:
 * - SSR process needs to wait for the application stability before serializing and sending rendered
 * HTML;
 * - tests might want to delay assertions until the application becomes stable;
 *
 * @usageNotes
 * ```typescript
 * const pendingTasks = inject(ExperimentalPendingTasks);
 * const taskCleanup = pendingTasks.add();
 * // do work that should block application's stability and then:
 * taskCleanup();
 * ```
 *
 * This API is experimental. Neither the shape, nor the underlying behavior is stable and can change
 * in patch versions. We will iterate on the exact API based on the feedback and our understanding
 * of the problem and solution space.
 *
 * @publicApi
 * @experimental
 */
export class ExperimentalPendingTasks {
    constructor() {
        this.internalPendingTasks = inject(PendingTasks);
    }
    /**
     * Adds a new task that should block application's stability.
     * @returns A cleanup function that removes a task when called.
     */
    add() {
        const taskId = this.internalPendingTasks.add();
        return () => this.internalPendingTasks.remove(taskId);
    }
    static { this.ɵfac = function ExperimentalPendingTasks_Factory(t) { return new (t || ExperimentalPendingTasks)(); }; }
    static { this.ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: ExperimentalPendingTasks, factory: ExperimentalPendingTasks.ɵfac, providedIn: 'root' }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.setClassMetadata(ExperimentalPendingTasks, [{
        type: Injectable,
        args: [{
                providedIn: 'root',
            }]
    }], null, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGVuZGluZ190YXNrcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc3JjL3BlbmRpbmdfdGFza3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUVyQyxPQUFPLEVBQUMsTUFBTSxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQzVCLE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQzs7QUFHM0M7O0dBRUc7QUFJSCxNQUFNLE9BQU8sWUFBWTtJQUh6QjtRQUlVLFdBQU0sR0FBRyxDQUFDLENBQUM7UUFDWCxpQkFBWSxHQUFHLElBQUksR0FBRyxFQUFVLENBQUM7UUFJekMsb0JBQWUsR0FBRyxJQUFJLGVBQWUsQ0FBVSxLQUFLLENBQUMsQ0FBQztLQXdCdkQ7SUEzQkMsSUFBWSxnQkFBZ0I7UUFDMUIsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQztJQUNwQyxDQUFDO0lBR0QsR0FBRztRQUNELElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztZQUMzQixJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNsQyxDQUFDO1FBQ0QsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQzdCLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzlCLE9BQU8sTUFBTSxDQUFDO0lBQ2hCLENBQUM7SUFFRCxNQUFNLENBQUMsTUFBYztRQUNuQixJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNqQyxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztZQUMxRCxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNuQyxDQUFDO0lBQ0gsQ0FBQztJQUVELFdBQVc7UUFDVCxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQzFCLElBQUksSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7WUFDMUIsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDbkMsQ0FBQztJQUNILENBQUM7NkVBN0JVLFlBQVk7dUVBQVosWUFBWSxXQUFaLFlBQVksbUJBRlgsTUFBTTs7Z0ZBRVAsWUFBWTtjQUh4QixVQUFVO2VBQUM7Z0JBQ1YsVUFBVSxFQUFFLE1BQU07YUFDbkI7O0FBaUNEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBeUJHO0FBSUgsTUFBTSxPQUFPLHdCQUF3QjtJQUhyQztRQUlVLHlCQUFvQixHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQztLQVNyRDtJQVJDOzs7T0FHRztJQUNILEdBQUc7UUFDRCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDL0MsT0FBTyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3hELENBQUM7eUZBVFUsd0JBQXdCO3VFQUF4Qix3QkFBd0IsV0FBeEIsd0JBQXdCLG1CQUZ2QixNQUFNOztnRkFFUCx3QkFBd0I7Y0FIcEMsVUFBVTtlQUFDO2dCQUNWLFVBQVUsRUFBRSxNQUFNO2FBQ25CIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7QmVoYXZpb3JTdWJqZWN0fSBmcm9tICdyeGpzJztcblxuaW1wb3J0IHtpbmplY3R9IGZyb20gJy4vZGknO1xuaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICcuL2RpL2luamVjdGFibGUnO1xuaW1wb3J0IHtPbkRlc3Ryb3l9IGZyb20gJy4vaW50ZXJmYWNlL2xpZmVjeWNsZV9ob29rcyc7XG5cbi8qKlxuICogSW50ZXJuYWwgaW1wbGVtZW50YXRpb24gb2YgdGhlIHBlbmRpbmcgdGFza3Mgc2VydmljZS5cbiAqL1xuQEluamVjdGFibGUoe1xuICBwcm92aWRlZEluOiAncm9vdCcsXG59KVxuZXhwb3J0IGNsYXNzIFBlbmRpbmdUYXNrcyBpbXBsZW1lbnRzIE9uRGVzdHJveSB7XG4gIHByaXZhdGUgdGFza0lkID0gMDtcbiAgcHJpdmF0ZSBwZW5kaW5nVGFza3MgPSBuZXcgU2V0PG51bWJlcj4oKTtcbiAgcHJpdmF0ZSBnZXQgX2hhc1BlbmRpbmdUYXNrcygpIHtcbiAgICByZXR1cm4gdGhpcy5oYXNQZW5kaW5nVGFza3MudmFsdWU7XG4gIH1cbiAgaGFzUGVuZGluZ1Rhc2tzID0gbmV3IEJlaGF2aW9yU3ViamVjdDxib29sZWFuPihmYWxzZSk7XG5cbiAgYWRkKCk6IG51bWJlciB7XG4gICAgaWYgKCF0aGlzLl9oYXNQZW5kaW5nVGFza3MpIHtcbiAgICAgIHRoaXMuaGFzUGVuZGluZ1Rhc2tzLm5leHQodHJ1ZSk7XG4gICAgfVxuICAgIGNvbnN0IHRhc2tJZCA9IHRoaXMudGFza0lkKys7XG4gICAgdGhpcy5wZW5kaW5nVGFza3MuYWRkKHRhc2tJZCk7XG4gICAgcmV0dXJuIHRhc2tJZDtcbiAgfVxuXG4gIHJlbW92ZSh0YXNrSWQ6IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMucGVuZGluZ1Rhc2tzLmRlbGV0ZSh0YXNrSWQpO1xuICAgIGlmICh0aGlzLnBlbmRpbmdUYXNrcy5zaXplID09PSAwICYmIHRoaXMuX2hhc1BlbmRpbmdUYXNrcykge1xuICAgICAgdGhpcy5oYXNQZW5kaW5nVGFza3MubmV4dChmYWxzZSk7XG4gICAgfVxuICB9XG5cbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgdGhpcy5wZW5kaW5nVGFza3MuY2xlYXIoKTtcbiAgICBpZiAodGhpcy5faGFzUGVuZGluZ1Rhc2tzKSB7XG4gICAgICB0aGlzLmhhc1BlbmRpbmdUYXNrcy5uZXh0KGZhbHNlKTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBFeHBlcmltZW50YWwgc2VydmljZSB0aGF0IGtlZXBzIHRyYWNrIG9mIHBlbmRpbmcgdGFza3MgY29udHJpYnV0aW5nIHRvIHRoZSBzdGFibGVuZXNzIG9mIEFuZ3VsYXJcbiAqIGFwcGxpY2F0aW9uLiBXaGlsZSBzZXZlcmFsIGV4aXN0aW5nIEFuZ3VsYXIgc2VydmljZXMgKGV4LjogYEh0dHBDbGllbnRgKSB3aWxsIGludGVybmFsbHkgbWFuYWdlXG4gKiB0YXNrcyBpbmZsdWVuY2luZyBzdGFiaWxpdHksIHRoaXMgQVBJIGdpdmVzIGNvbnRyb2wgb3ZlciBzdGFiaWxpdHkgdG8gbGlicmFyeSBhbmQgYXBwbGljYXRpb25cbiAqIGRldmVsb3BlcnMgZm9yIHNwZWNpZmljIGNhc2VzIG5vdCBjb3ZlcmVkIGJ5IEFuZ3VsYXIgaW50ZXJuYWxzLlxuICpcbiAqIFRoZSBjb25jZXB0IG9mIHN0YWJpbGl0eSBjb21lcyBpbnRvIHBsYXkgaW4gc2V2ZXJhbCBpbXBvcnRhbnQgc2NlbmFyaW9zOlxuICogLSBTU1IgcHJvY2VzcyBuZWVkcyB0byB3YWl0IGZvciB0aGUgYXBwbGljYXRpb24gc3RhYmlsaXR5IGJlZm9yZSBzZXJpYWxpemluZyBhbmQgc2VuZGluZyByZW5kZXJlZFxuICogSFRNTDtcbiAqIC0gdGVzdHMgbWlnaHQgd2FudCB0byBkZWxheSBhc3NlcnRpb25zIHVudGlsIHRoZSBhcHBsaWNhdGlvbiBiZWNvbWVzIHN0YWJsZTtcbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogYGBgdHlwZXNjcmlwdFxuICogY29uc3QgcGVuZGluZ1Rhc2tzID0gaW5qZWN0KEV4cGVyaW1lbnRhbFBlbmRpbmdUYXNrcyk7XG4gKiBjb25zdCB0YXNrQ2xlYW51cCA9IHBlbmRpbmdUYXNrcy5hZGQoKTtcbiAqIC8vIGRvIHdvcmsgdGhhdCBzaG91bGQgYmxvY2sgYXBwbGljYXRpb24ncyBzdGFiaWxpdHkgYW5kIHRoZW46XG4gKiB0YXNrQ2xlYW51cCgpO1xuICogYGBgXG4gKlxuICogVGhpcyBBUEkgaXMgZXhwZXJpbWVudGFsLiBOZWl0aGVyIHRoZSBzaGFwZSwgbm9yIHRoZSB1bmRlcmx5aW5nIGJlaGF2aW9yIGlzIHN0YWJsZSBhbmQgY2FuIGNoYW5nZVxuICogaW4gcGF0Y2ggdmVyc2lvbnMuIFdlIHdpbGwgaXRlcmF0ZSBvbiB0aGUgZXhhY3QgQVBJIGJhc2VkIG9uIHRoZSBmZWVkYmFjayBhbmQgb3VyIHVuZGVyc3RhbmRpbmdcbiAqIG9mIHRoZSBwcm9ibGVtIGFuZCBzb2x1dGlvbiBzcGFjZS5cbiAqXG4gKiBAcHVibGljQXBpXG4gKiBAZXhwZXJpbWVudGFsXG4gKi9cbkBJbmplY3RhYmxlKHtcbiAgcHJvdmlkZWRJbjogJ3Jvb3QnLFxufSlcbmV4cG9ydCBjbGFzcyBFeHBlcmltZW50YWxQZW5kaW5nVGFza3Mge1xuICBwcml2YXRlIGludGVybmFsUGVuZGluZ1Rhc2tzID0gaW5qZWN0KFBlbmRpbmdUYXNrcyk7XG4gIC8qKlxuICAgKiBBZGRzIGEgbmV3IHRhc2sgdGhhdCBzaG91bGQgYmxvY2sgYXBwbGljYXRpb24ncyBzdGFiaWxpdHkuXG4gICAqIEByZXR1cm5zIEEgY2xlYW51cCBmdW5jdGlvbiB0aGF0IHJlbW92ZXMgYSB0YXNrIHdoZW4gY2FsbGVkLlxuICAgKi9cbiAgYWRkKCk6ICgpID0+IHZvaWQge1xuICAgIGNvbnN0IHRhc2tJZCA9IHRoaXMuaW50ZXJuYWxQZW5kaW5nVGFza3MuYWRkKCk7XG4gICAgcmV0dXJuICgpID0+IHRoaXMuaW50ZXJuYWxQZW5kaW5nVGFza3MucmVtb3ZlKHRhc2tJZCk7XG4gIH1cbn1cbiJdfQ==