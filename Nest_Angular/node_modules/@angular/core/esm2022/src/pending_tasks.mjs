/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { BehaviorSubject } from 'rxjs';
import { inject } from './di/injector_compatibility';
import { ɵɵdefineInjectable } from './di/interface/defs';
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
    /** @nocollapse */
    static { this.ɵprov = ɵɵdefineInjectable({
        token: PendingTasks,
        providedIn: 'root',
        factory: () => new PendingTasks(),
    }); }
}
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
    /** @nocollapse */
    static { this.ɵprov = ɵɵdefineInjectable({
        token: ExperimentalPendingTasks,
        providedIn: 'root',
        factory: () => new ExperimentalPendingTasks(),
    }); }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGVuZGluZ190YXNrcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc3JjL3BlbmRpbmdfdGFza3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUVyQyxPQUFPLEVBQUMsTUFBTSxFQUFDLE1BQU0sNkJBQTZCLENBQUM7QUFDbkQsT0FBTyxFQUFDLGtCQUFrQixFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFHdkQ7O0dBRUc7QUFDSCxNQUFNLE9BQU8sWUFBWTtJQUF6QjtRQUNVLFdBQU0sR0FBRyxDQUFDLENBQUM7UUFDWCxpQkFBWSxHQUFHLElBQUksR0FBRyxFQUFVLENBQUM7UUFJekMsb0JBQWUsR0FBRyxJQUFJLGVBQWUsQ0FBVSxLQUFLLENBQUMsQ0FBQztJQStCeEQsQ0FBQztJQWxDQyxJQUFZLGdCQUFnQjtRQUMxQixPQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDO0lBQ3BDLENBQUM7SUFHRCxHQUFHO1FBQ0QsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBQzNCLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2xDLENBQUM7UUFDRCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDN0IsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDOUIsT0FBTyxNQUFNLENBQUM7SUFDaEIsQ0FBQztJQUVELE1BQU0sQ0FBQyxNQUFjO1FBQ25CLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2pDLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBQzFELElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ25DLENBQUM7SUFDSCxDQUFDO0lBRUQsV0FBVztRQUNULElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDMUIsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztZQUMxQixJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNuQyxDQUFDO0lBQ0gsQ0FBQztJQUVELGtCQUFrQjthQUNYLFVBQUssR0FBNkIsa0JBQWtCLENBQUM7UUFDMUQsS0FBSyxFQUFFLFlBQVk7UUFDbkIsVUFBVSxFQUFFLE1BQU07UUFDbEIsT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksWUFBWSxFQUFFO0tBQ2xDLENBQUMsQUFKVSxDQUlUOztBQUdMOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBeUJHO0FBQ0gsTUFBTSxPQUFPLHdCQUF3QjtJQUFyQztRQUNVLHlCQUFvQixHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQztJQWdCdEQsQ0FBQztJQWZDOzs7T0FHRztJQUNILEdBQUc7UUFDRCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDL0MsT0FBTyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3hELENBQUM7SUFFRCxrQkFBa0I7YUFDWCxVQUFLLEdBQTZCLGtCQUFrQixDQUFDO1FBQzFELEtBQUssRUFBRSx3QkFBd0I7UUFDL0IsVUFBVSxFQUFFLE1BQU07UUFDbEIsT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksd0JBQXdCLEVBQUU7S0FDOUMsQ0FBQyxBQUpVLENBSVQiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbmltcG9ydCB7QmVoYXZpb3JTdWJqZWN0fSBmcm9tICdyeGpzJztcblxuaW1wb3J0IHtpbmplY3R9IGZyb20gJy4vZGkvaW5qZWN0b3JfY29tcGF0aWJpbGl0eSc7XG5pbXBvcnQge8m1ybVkZWZpbmVJbmplY3RhYmxlfSBmcm9tICcuL2RpL2ludGVyZmFjZS9kZWZzJztcbmltcG9ydCB7T25EZXN0cm95fSBmcm9tICcuL2ludGVyZmFjZS9saWZlY3ljbGVfaG9va3MnO1xuXG4vKipcbiAqIEludGVybmFsIGltcGxlbWVudGF0aW9uIG9mIHRoZSBwZW5kaW5nIHRhc2tzIHNlcnZpY2UuXG4gKi9cbmV4cG9ydCBjbGFzcyBQZW5kaW5nVGFza3MgaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xuICBwcml2YXRlIHRhc2tJZCA9IDA7XG4gIHByaXZhdGUgcGVuZGluZ1Rhc2tzID0gbmV3IFNldDxudW1iZXI+KCk7XG4gIHByaXZhdGUgZ2V0IF9oYXNQZW5kaW5nVGFza3MoKSB7XG4gICAgcmV0dXJuIHRoaXMuaGFzUGVuZGluZ1Rhc2tzLnZhbHVlO1xuICB9XG4gIGhhc1BlbmRpbmdUYXNrcyA9IG5ldyBCZWhhdmlvclN1YmplY3Q8Ym9vbGVhbj4oZmFsc2UpO1xuXG4gIGFkZCgpOiBudW1iZXIge1xuICAgIGlmICghdGhpcy5faGFzUGVuZGluZ1Rhc2tzKSB7XG4gICAgICB0aGlzLmhhc1BlbmRpbmdUYXNrcy5uZXh0KHRydWUpO1xuICAgIH1cbiAgICBjb25zdCB0YXNrSWQgPSB0aGlzLnRhc2tJZCsrO1xuICAgIHRoaXMucGVuZGluZ1Rhc2tzLmFkZCh0YXNrSWQpO1xuICAgIHJldHVybiB0YXNrSWQ7XG4gIH1cblxuICByZW1vdmUodGFza0lkOiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLnBlbmRpbmdUYXNrcy5kZWxldGUodGFza0lkKTtcbiAgICBpZiAodGhpcy5wZW5kaW5nVGFza3Muc2l6ZSA9PT0gMCAmJiB0aGlzLl9oYXNQZW5kaW5nVGFza3MpIHtcbiAgICAgIHRoaXMuaGFzUGVuZGluZ1Rhc2tzLm5leHQoZmFsc2UpO1xuICAgIH1cbiAgfVxuXG4gIG5nT25EZXN0cm95KCk6IHZvaWQge1xuICAgIHRoaXMucGVuZGluZ1Rhc2tzLmNsZWFyKCk7XG4gICAgaWYgKHRoaXMuX2hhc1BlbmRpbmdUYXNrcykge1xuICAgICAgdGhpcy5oYXNQZW5kaW5nVGFza3MubmV4dChmYWxzZSk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBub2NvbGxhcHNlICovXG4gIHN0YXRpYyDJtXByb3YgPSAvKiogQHB1cmVPckJyZWFrTXlDb2RlICovIMm1ybVkZWZpbmVJbmplY3RhYmxlKHtcbiAgICB0b2tlbjogUGVuZGluZ1Rhc2tzLFxuICAgIHByb3ZpZGVkSW46ICdyb290JyxcbiAgICBmYWN0b3J5OiAoKSA9PiBuZXcgUGVuZGluZ1Rhc2tzKCksXG4gIH0pO1xufVxuXG4vKipcbiAqIEV4cGVyaW1lbnRhbCBzZXJ2aWNlIHRoYXQga2VlcHMgdHJhY2sgb2YgcGVuZGluZyB0YXNrcyBjb250cmlidXRpbmcgdG8gdGhlIHN0YWJsZW5lc3Mgb2YgQW5ndWxhclxuICogYXBwbGljYXRpb24uIFdoaWxlIHNldmVyYWwgZXhpc3RpbmcgQW5ndWxhciBzZXJ2aWNlcyAoZXguOiBgSHR0cENsaWVudGApIHdpbGwgaW50ZXJuYWxseSBtYW5hZ2VcbiAqIHRhc2tzIGluZmx1ZW5jaW5nIHN0YWJpbGl0eSwgdGhpcyBBUEkgZ2l2ZXMgY29udHJvbCBvdmVyIHN0YWJpbGl0eSB0byBsaWJyYXJ5IGFuZCBhcHBsaWNhdGlvblxuICogZGV2ZWxvcGVycyBmb3Igc3BlY2lmaWMgY2FzZXMgbm90IGNvdmVyZWQgYnkgQW5ndWxhciBpbnRlcm5hbHMuXG4gKlxuICogVGhlIGNvbmNlcHQgb2Ygc3RhYmlsaXR5IGNvbWVzIGludG8gcGxheSBpbiBzZXZlcmFsIGltcG9ydGFudCBzY2VuYXJpb3M6XG4gKiAtIFNTUiBwcm9jZXNzIG5lZWRzIHRvIHdhaXQgZm9yIHRoZSBhcHBsaWNhdGlvbiBzdGFiaWxpdHkgYmVmb3JlIHNlcmlhbGl6aW5nIGFuZCBzZW5kaW5nIHJlbmRlcmVkXG4gKiBIVE1MO1xuICogLSB0ZXN0cyBtaWdodCB3YW50IHRvIGRlbGF5IGFzc2VydGlvbnMgdW50aWwgdGhlIGFwcGxpY2F0aW9uIGJlY29tZXMgc3RhYmxlO1xuICpcbiAqIEB1c2FnZU5vdGVzXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBjb25zdCBwZW5kaW5nVGFza3MgPSBpbmplY3QoRXhwZXJpbWVudGFsUGVuZGluZ1Rhc2tzKTtcbiAqIGNvbnN0IHRhc2tDbGVhbnVwID0gcGVuZGluZ1Rhc2tzLmFkZCgpO1xuICogLy8gZG8gd29yayB0aGF0IHNob3VsZCBibG9jayBhcHBsaWNhdGlvbidzIHN0YWJpbGl0eSBhbmQgdGhlbjpcbiAqIHRhc2tDbGVhbnVwKCk7XG4gKiBgYGBcbiAqXG4gKiBUaGlzIEFQSSBpcyBleHBlcmltZW50YWwuIE5laXRoZXIgdGhlIHNoYXBlLCBub3IgdGhlIHVuZGVybHlpbmcgYmVoYXZpb3IgaXMgc3RhYmxlIGFuZCBjYW4gY2hhbmdlXG4gKiBpbiBwYXRjaCB2ZXJzaW9ucy4gV2Ugd2lsbCBpdGVyYXRlIG9uIHRoZSBleGFjdCBBUEkgYmFzZWQgb24gdGhlIGZlZWRiYWNrIGFuZCBvdXIgdW5kZXJzdGFuZGluZ1xuICogb2YgdGhlIHByb2JsZW0gYW5kIHNvbHV0aW9uIHNwYWNlLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqIEBleHBlcmltZW50YWxcbiAqL1xuZXhwb3J0IGNsYXNzIEV4cGVyaW1lbnRhbFBlbmRpbmdUYXNrcyB7XG4gIHByaXZhdGUgaW50ZXJuYWxQZW5kaW5nVGFza3MgPSBpbmplY3QoUGVuZGluZ1Rhc2tzKTtcbiAgLyoqXG4gICAqIEFkZHMgYSBuZXcgdGFzayB0aGF0IHNob3VsZCBibG9jayBhcHBsaWNhdGlvbidzIHN0YWJpbGl0eS5cbiAgICogQHJldHVybnMgQSBjbGVhbnVwIGZ1bmN0aW9uIHRoYXQgcmVtb3ZlcyBhIHRhc2sgd2hlbiBjYWxsZWQuXG4gICAqL1xuICBhZGQoKTogKCkgPT4gdm9pZCB7XG4gICAgY29uc3QgdGFza0lkID0gdGhpcy5pbnRlcm5hbFBlbmRpbmdUYXNrcy5hZGQoKTtcbiAgICByZXR1cm4gKCkgPT4gdGhpcy5pbnRlcm5hbFBlbmRpbmdUYXNrcy5yZW1vdmUodGFza0lkKTtcbiAgfVxuXG4gIC8qKiBAbm9jb2xsYXBzZSAqL1xuICBzdGF0aWMgybVwcm92ID0gLyoqIEBwdXJlT3JCcmVha015Q29kZSAqLyDJtcm1ZGVmaW5lSW5qZWN0YWJsZSh7XG4gICAgdG9rZW46IEV4cGVyaW1lbnRhbFBlbmRpbmdUYXNrcyxcbiAgICBwcm92aWRlZEluOiAncm9vdCcsXG4gICAgZmFjdG9yeTogKCkgPT4gbmV3IEV4cGVyaW1lbnRhbFBlbmRpbmdUYXNrcygpLFxuICB9KTtcbn1cbiJdfQ==