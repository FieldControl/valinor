/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { assertInInjectionContext, DestroyRef, inject, ɵRuntimeError, } from '@angular/core';
import { takeUntilDestroyed } from './take_until_destroyed';
/**
 * Implementation of `OutputRef` that emits values from
 * an RxJS observable source.
 *
 * @internal
 */
class OutputFromObservableRef {
    constructor(source) {
        this.source = source;
        this.destroyed = false;
        this.destroyRef = inject(DestroyRef);
        this.destroyRef.onDestroy(() => {
            this.destroyed = true;
        });
    }
    subscribe(callbackFn) {
        if (this.destroyed) {
            throw new ɵRuntimeError(953 /* ɵRuntimeErrorCode.OUTPUT_REF_DESTROYED */, ngDevMode &&
                'Unexpected subscription to destroyed `OutputRef`. ' +
                    'The owning directive/component is destroyed.');
        }
        // Stop yielding more values when the directive/component is already destroyed.
        const subscription = this.source.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: (value) => callbackFn(value),
        });
        return {
            unsubscribe: () => subscription.unsubscribe(),
        };
    }
}
/**
 * Declares an Angular output that is using an RxJS observable as a source
 * for events dispatched to parent subscribers.
 *
 * The behavior for an observable as source is defined as followed:
 *    1. New values are forwarded to the Angular output (next notifications).
 *    2. Errors notifications are not handled by Angular. You need to handle these manually.
 *       For example by using `catchError`.
 *    3. Completion notifications stop the output from emitting new values.
 *
 * @usageNotes
 * Initialize an output in your directive by declaring a
 * class field and initializing it with the `outputFromObservable()` function.
 *
 * ```ts
 * @Directive({..})
 * export class MyDir {
 *   nameChange$ = <some-observable>;
 *   nameChange = outputFromObservable(this.nameChange$);
 * }
 * ```
 *
 * @developerPreview
 */
export function outputFromObservable(observable, opts) {
    ngDevMode && assertInInjectionContext(outputFromObservable);
    return new OutputFromObservableRef(observable);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3V0cHV0X2Zyb21fb2JzZXJ2YWJsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvcnhqcy1pbnRlcm9wL3NyYy9vdXRwdXRfZnJvbV9vYnNlcnZhYmxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFDTCx3QkFBd0IsRUFDeEIsVUFBVSxFQUNWLE1BQU0sRUFJTixhQUFhLEdBRWQsTUFBTSxlQUFlLENBQUM7QUFHdkIsT0FBTyxFQUFDLGtCQUFrQixFQUFDLE1BQU0sd0JBQXdCLENBQUM7QUFFMUQ7Ozs7O0dBS0c7QUFDSCxNQUFNLHVCQUF1QjtJQUszQixZQUFvQixNQUFxQjtRQUFyQixXQUFNLEdBQU4sTUFBTSxDQUFlO1FBSmpDLGNBQVMsR0FBRyxLQUFLLENBQUM7UUFFMUIsZUFBVSxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUc5QixJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUU7WUFDN0IsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7UUFDeEIsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQsU0FBUyxDQUFDLFVBQThCO1FBQ3RDLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ25CLE1BQU0sSUFBSSxhQUFhLG1EQUVyQixTQUFTO2dCQUNQLG9EQUFvRDtvQkFDbEQsOENBQThDLENBQ25ELENBQUM7UUFDSixDQUFDO1FBRUQsK0VBQStFO1FBQy9FLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztZQUNuRixJQUFJLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUM7U0FDbkMsQ0FBQyxDQUFDO1FBRUgsT0FBTztZQUNMLFdBQVcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsV0FBVyxFQUFFO1NBQzlDLENBQUM7SUFDSixDQUFDO0NBQ0Y7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0F1Qkc7QUFDSCxNQUFNLFVBQVUsb0JBQW9CLENBQ2xDLFVBQXlCLEVBQ3pCLElBQW9CO0lBRXBCLFNBQVMsSUFBSSx3QkFBd0IsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0lBQzVELE9BQU8sSUFBSSx1QkFBdUIsQ0FBSSxVQUFVLENBQUMsQ0FBQztBQUNwRCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuZGV2L2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1xuICBhc3NlcnRJbkluamVjdGlvbkNvbnRleHQsXG4gIERlc3Ryb3lSZWYsXG4gIGluamVjdCxcbiAgT3V0cHV0T3B0aW9ucyxcbiAgT3V0cHV0UmVmLFxuICBPdXRwdXRSZWZTdWJzY3JpcHRpb24sXG4gIMm1UnVudGltZUVycm9yLFxuICDJtVJ1bnRpbWVFcnJvckNvZGUsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtPYnNlcnZhYmxlfSBmcm9tICdyeGpzJztcblxuaW1wb3J0IHt0YWtlVW50aWxEZXN0cm95ZWR9IGZyb20gJy4vdGFrZV91bnRpbF9kZXN0cm95ZWQnO1xuXG4vKipcbiAqIEltcGxlbWVudGF0aW9uIG9mIGBPdXRwdXRSZWZgIHRoYXQgZW1pdHMgdmFsdWVzIGZyb21cbiAqIGFuIFJ4SlMgb2JzZXJ2YWJsZSBzb3VyY2UuXG4gKlxuICogQGludGVybmFsXG4gKi9cbmNsYXNzIE91dHB1dEZyb21PYnNlcnZhYmxlUmVmPFQ+IGltcGxlbWVudHMgT3V0cHV0UmVmPFQ+IHtcbiAgcHJpdmF0ZSBkZXN0cm95ZWQgPSBmYWxzZTtcblxuICBkZXN0cm95UmVmID0gaW5qZWN0KERlc3Ryb3lSZWYpO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgc291cmNlOiBPYnNlcnZhYmxlPFQ+KSB7XG4gICAgdGhpcy5kZXN0cm95UmVmLm9uRGVzdHJveSgoKSA9PiB7XG4gICAgICB0aGlzLmRlc3Ryb3llZCA9IHRydWU7XG4gICAgfSk7XG4gIH1cblxuICBzdWJzY3JpYmUoY2FsbGJhY2tGbjogKHZhbHVlOiBUKSA9PiB2b2lkKTogT3V0cHV0UmVmU3Vic2NyaXB0aW9uIHtcbiAgICBpZiAodGhpcy5kZXN0cm95ZWQpIHtcbiAgICAgIHRocm93IG5ldyDJtVJ1bnRpbWVFcnJvcihcbiAgICAgICAgybVSdW50aW1lRXJyb3JDb2RlLk9VVFBVVF9SRUZfREVTVFJPWUVELFxuICAgICAgICBuZ0Rldk1vZGUgJiZcbiAgICAgICAgICAnVW5leHBlY3RlZCBzdWJzY3JpcHRpb24gdG8gZGVzdHJveWVkIGBPdXRwdXRSZWZgLiAnICtcbiAgICAgICAgICAgICdUaGUgb3duaW5nIGRpcmVjdGl2ZS9jb21wb25lbnQgaXMgZGVzdHJveWVkLicsXG4gICAgICApO1xuICAgIH1cblxuICAgIC8vIFN0b3AgeWllbGRpbmcgbW9yZSB2YWx1ZXMgd2hlbiB0aGUgZGlyZWN0aXZlL2NvbXBvbmVudCBpcyBhbHJlYWR5IGRlc3Ryb3llZC5cbiAgICBjb25zdCBzdWJzY3JpcHRpb24gPSB0aGlzLnNvdXJjZS5waXBlKHRha2VVbnRpbERlc3Ryb3llZCh0aGlzLmRlc3Ryb3lSZWYpKS5zdWJzY3JpYmUoe1xuICAgICAgbmV4dDogKHZhbHVlKSA9PiBjYWxsYmFja0ZuKHZhbHVlKSxcbiAgICB9KTtcblxuICAgIHJldHVybiB7XG4gICAgICB1bnN1YnNjcmliZTogKCkgPT4gc3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCksXG4gICAgfTtcbiAgfVxufVxuXG4vKipcbiAqIERlY2xhcmVzIGFuIEFuZ3VsYXIgb3V0cHV0IHRoYXQgaXMgdXNpbmcgYW4gUnhKUyBvYnNlcnZhYmxlIGFzIGEgc291cmNlXG4gKiBmb3IgZXZlbnRzIGRpc3BhdGNoZWQgdG8gcGFyZW50IHN1YnNjcmliZXJzLlxuICpcbiAqIFRoZSBiZWhhdmlvciBmb3IgYW4gb2JzZXJ2YWJsZSBhcyBzb3VyY2UgaXMgZGVmaW5lZCBhcyBmb2xsb3dlZDpcbiAqICAgIDEuIE5ldyB2YWx1ZXMgYXJlIGZvcndhcmRlZCB0byB0aGUgQW5ndWxhciBvdXRwdXQgKG5leHQgbm90aWZpY2F0aW9ucykuXG4gKiAgICAyLiBFcnJvcnMgbm90aWZpY2F0aW9ucyBhcmUgbm90IGhhbmRsZWQgYnkgQW5ndWxhci4gWW91IG5lZWQgdG8gaGFuZGxlIHRoZXNlIG1hbnVhbGx5LlxuICogICAgICAgRm9yIGV4YW1wbGUgYnkgdXNpbmcgYGNhdGNoRXJyb3JgLlxuICogICAgMy4gQ29tcGxldGlvbiBub3RpZmljYXRpb25zIHN0b3AgdGhlIG91dHB1dCBmcm9tIGVtaXR0aW5nIG5ldyB2YWx1ZXMuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqIEluaXRpYWxpemUgYW4gb3V0cHV0IGluIHlvdXIgZGlyZWN0aXZlIGJ5IGRlY2xhcmluZyBhXG4gKiBjbGFzcyBmaWVsZCBhbmQgaW5pdGlhbGl6aW5nIGl0IHdpdGggdGhlIGBvdXRwdXRGcm9tT2JzZXJ2YWJsZSgpYCBmdW5jdGlvbi5cbiAqXG4gKiBgYGB0c1xuICogQERpcmVjdGl2ZSh7Li59KVxuICogZXhwb3J0IGNsYXNzIE15RGlyIHtcbiAqICAgbmFtZUNoYW5nZSQgPSA8c29tZS1vYnNlcnZhYmxlPjtcbiAqICAgbmFtZUNoYW5nZSA9IG91dHB1dEZyb21PYnNlcnZhYmxlKHRoaXMubmFtZUNoYW5nZSQpO1xuICogfVxuICogYGBgXG4gKlxuICogQGRldmVsb3BlclByZXZpZXdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG91dHB1dEZyb21PYnNlcnZhYmxlPFQ+KFxuICBvYnNlcnZhYmxlOiBPYnNlcnZhYmxlPFQ+LFxuICBvcHRzPzogT3V0cHV0T3B0aW9ucyxcbik6IE91dHB1dFJlZjxUPiB7XG4gIG5nRGV2TW9kZSAmJiBhc3NlcnRJbkluamVjdGlvbkNvbnRleHQob3V0cHV0RnJvbU9ic2VydmFibGUpO1xuICByZXR1cm4gbmV3IE91dHB1dEZyb21PYnNlcnZhYmxlUmVmPFQ+KG9ic2VydmFibGUpO1xufVxuIl19