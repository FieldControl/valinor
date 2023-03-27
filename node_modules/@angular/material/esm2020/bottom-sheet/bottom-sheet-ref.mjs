/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ESCAPE, hasModifierKey } from '@angular/cdk/keycodes';
import { merge, Subject } from 'rxjs';
import { filter, take } from 'rxjs/operators';
/**
 * Reference to a bottom sheet dispatched from the bottom sheet service.
 */
export class MatBottomSheetRef {
    /** Instance of the component making up the content of the bottom sheet. */
    get instance() {
        return this._ref.componentInstance;
    }
    constructor(_ref, config, containerInstance) {
        this._ref = _ref;
        /** Subject for notifying the user that the bottom sheet has opened and appeared. */
        this._afterOpened = new Subject();
        this.containerInstance = containerInstance;
        this.disableClose = config.disableClose;
        // Emit when opening animation completes
        containerInstance._animationStateChanged
            .pipe(filter(event => event.phaseName === 'done' && event.toState === 'visible'), take(1))
            .subscribe(() => {
            this._afterOpened.next();
            this._afterOpened.complete();
        });
        // Dispose overlay when closing animation is complete
        containerInstance._animationStateChanged
            .pipe(filter(event => event.phaseName === 'done' && event.toState === 'hidden'), take(1))
            .subscribe(() => {
            clearTimeout(this._closeFallbackTimeout);
            this._ref.close(this._result);
        });
        _ref.overlayRef.detachments().subscribe(() => {
            this._ref.close(this._result);
        });
        merge(this.backdropClick(), this.keydownEvents().pipe(filter(event => event.keyCode === ESCAPE))).subscribe(event => {
            if (!this.disableClose &&
                (event.type !== 'keydown' || !hasModifierKey(event))) {
                event.preventDefault();
                this.dismiss();
            }
        });
    }
    /**
     * Dismisses the bottom sheet.
     * @param result Data to be passed back to the bottom sheet opener.
     */
    dismiss(result) {
        if (!this.containerInstance) {
            return;
        }
        // Transition the backdrop in parallel to the bottom sheet.
        this.containerInstance._animationStateChanged
            .pipe(filter(event => event.phaseName === 'start'), take(1))
            .subscribe(event => {
            // The logic that disposes of the overlay depends on the exit animation completing, however
            // it isn't guaranteed if the parent view is destroyed while it's running. Add a fallback
            // timeout which will clean everything up if the animation hasn't fired within the specified
            // amount of time plus 100ms. We don't need to run this outside the NgZone, because for the
            // vast majority of cases the timeout will have been cleared before it has fired.
            this._closeFallbackTimeout = setTimeout(() => {
                this._ref.close(this._result);
            }, event.totalTime + 100);
            this._ref.overlayRef.detachBackdrop();
        });
        this._result = result;
        this.containerInstance.exit();
        this.containerInstance = null;
    }
    /** Gets an observable that is notified when the bottom sheet is finished closing. */
    afterDismissed() {
        return this._ref.closed;
    }
    /** Gets an observable that is notified when the bottom sheet has opened and appeared. */
    afterOpened() {
        return this._afterOpened;
    }
    /**
     * Gets an observable that emits when the overlay's backdrop has been clicked.
     */
    backdropClick() {
        return this._ref.backdropClick;
    }
    /**
     * Gets an observable that emits when keydown events are targeted on the overlay.
     */
    keydownEvents() {
        return this._ref.keydownEvents;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm90dG9tLXNoZWV0LXJlZi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9ib3R0b20tc2hlZXQvYm90dG9tLXNoZWV0LXJlZi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFHSCxPQUFPLEVBQUMsTUFBTSxFQUFFLGNBQWMsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQzdELE9BQU8sRUFBQyxLQUFLLEVBQWMsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQ2hELE9BQU8sRUFBQyxNQUFNLEVBQUUsSUFBSSxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFJNUM7O0dBRUc7QUFDSCxNQUFNLE9BQU8saUJBQWlCO0lBQzVCLDJFQUEyRTtJQUMzRSxJQUFJLFFBQVE7UUFDVixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsaUJBQWtCLENBQUM7SUFDdEMsQ0FBQztJQW9CRCxZQUNVLElBQXFCLEVBQzdCLE1BQTRCLEVBQzVCLGlCQUEwQztRQUZsQyxTQUFJLEdBQUosSUFBSSxDQUFpQjtRQVYvQixvRkFBb0Y7UUFDbkUsaUJBQVksR0FBRyxJQUFJLE9BQU8sRUFBUSxDQUFDO1FBYWxELElBQUksQ0FBQyxpQkFBaUIsR0FBRyxpQkFBaUIsQ0FBQztRQUMzQyxJQUFJLENBQUMsWUFBWSxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUM7UUFFeEMsd0NBQXdDO1FBQ3hDLGlCQUFpQixDQUFDLHNCQUFzQjthQUNyQyxJQUFJLENBQ0gsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLFNBQVMsS0FBSyxNQUFNLElBQUksS0FBSyxDQUFDLE9BQU8sS0FBSyxTQUFTLENBQUMsRUFDMUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUNSO2FBQ0EsU0FBUyxDQUFDLEdBQUcsRUFBRTtZQUNkLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDekIsSUFB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Q2pDLENBQUM7SUFFRDs7T0FFRztJQUNILGFBQWE7UUFDWCxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDO0lBQ2pDLENBQUM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0RpYWxvZ1JlZn0gZnJvbSAnQGFuZ3VsYXIvY2RrL2RpYWxvZyc7XG5pbXBvcnQge0VTQ0FQRSwgaGFzTW9kaWZpZXJLZXl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9rZXljb2Rlcyc7XG5pbXBvcnQge21lcmdlLCBPYnNlcnZhYmxlLCBTdWJqZWN0fSBmcm9tICdyeGpzJztcbmltcG9ydCB7ZmlsdGVyLCB0YWtlfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5pbXBvcnQge01hdEJvdHRvbVNoZWV0Q29uZmlnfSBmcm9tICcuL2JvdHRvbS1zaGVldC1jb25maWcnO1xuaW1wb3J0IHtNYXRCb3R0b21TaGVldENvbnRhaW5lcn0gZnJvbSAnLi9ib3R0b20tc2hlZXQtY29udGFpbmVyJztcblxuLyoqXG4gKiBSZWZlcmVuY2UgdG8gYSBib3R0b20gc2hlZXQgZGlzcGF0Y2hlZCBmcm9tIHRoZSBib3R0b20gc2hlZXQgc2VydmljZS5cbiAqL1xuZXhwb3J0IGNsYXNzIE1hdEJvdHRvbVNoZWV0UmVmPFQgPSBhbnksIFIgPSBhbnk+IHtcbiAgLyoqIEluc3RhbmNlIG9mIHRoZSBjb21wb25lbnQgbWFraW5nIHVwIHRoZSBjb250ZW50IG9mIHRoZSBib3R0b20gc2hlZXQuICovXG4gIGdldCBpbnN0YW5jZSgpOiBUIHtcbiAgICByZXR1cm4gdGhpcy5fcmVmLmNvbXBvbmVudEluc3RhbmNlITtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbnN0YW5jZSBvZiB0aGUgY29tcG9uZW50IGludG8gd2hpY2ggdGhlIGJvdHRvbSBzaGVldCBjb250ZW50IGlzIHByb2plY3RlZC5cbiAgICogQGRvY3MtcHJpdmF0ZVxuICAgKi9cbiAgY29udGFpbmVySW5zdGFuY2U6IE1hdEJvdHRvbVNoZWV0Q29udGFpbmVyO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSB1c2VyIGlzIGFsbG93ZWQgdG8gY2xvc2UgdGhlIGJvdHRvbSBzaGVldC4gKi9cbiAgZGlzYWJsZUNsb3NlOiBib29sZWFuIHwgdW5kZWZpbmVkO1xuXG4gIC8qKiBTdWJqZWN0IGZvciBub3RpZnlpbmcgdGhlIHVzZXIgdGhhdCB0aGUgYm90dG9tIHNoZWV0IGhhcyBvcGVuZWQgYW5kIGFwcGVhcmVkLiAqL1xuICBwcml2YXRlIHJlYWRvbmx5IF9hZnRlck9wZW5lZCA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XG5cbiAgLyoqIFJlc3VsdCB0byBiZSBwYXNzZWQgZG93biB0byB0aGUgYGFmdGVyRGlzbWlzc2VkYCBzdHJlYW0uICovXG4gIHByaXZhdGUgX3Jlc3VsdDogUiB8IHVuZGVmaW5lZDtcblxuICAvKiogSGFuZGxlIHRvIHRoZSB0aW1lb3V0IHRoYXQncyBydW5uaW5nIGFzIGEgZmFsbGJhY2sgaW4gY2FzZSB0aGUgZXhpdCBhbmltYXRpb24gZG9lc24ndCBmaXJlLiAqL1xuICBwcml2YXRlIF9jbG9zZUZhbGxiYWNrVGltZW91dDogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgX3JlZjogRGlhbG9nUmVmPFIsIFQ+LFxuICAgIGNvbmZpZzogTWF0Qm90dG9tU2hlZXRDb25maWcsXG4gICAgY29udGFpbmVySW5zdGFuY2U6IE1hdEJvdHRvbVNoZWV0Q29udGFpbmVyLFxuICApIHtcbiAgICB0aGlzLmNvbnRhaW5lckluc3RhbmNlID0gY29udGFpbmVySW5zdGFuY2U7XG4gICAgdGhpcy5kaXNhYmxlQ2xvc2UgPSBjb25maWcuZGlzYWJsZUNsb3NlO1xuXG4gICAgLy8gRW1pdCB3aGVuIG9wZW5pbmcgYW5pbWF0aW9uIGNvbXBsZXRlc1xuICAgIGNvbnRhaW5lckluc3RhbmNlLl9hbmltYXRpb25TdGF0ZUNoYW5nZWRcbiAgICAgIC5waXBlKFxuICAgICAgICBmaWx0ZXIoZXZlbnQgPT4gZXZlbnQucGhhc2VOYW1lID09PSAnZG9uZScgJiYgZXZlbnQudG9TdGF0ZSA9PT0gJ3Zpc2libGUnKSxcbiAgICAgICAgdGFrZSgxKSxcbiAgICAgIClcbiAgICAgIC5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICB0aGlzLl9hZnRlck9wZW5lZC5uZXh0KCk7XG4gICAgICAgIHRoaXMuX2FmdGVyT3BlbmVkLmNvbXBsZXRlKCk7XG4gICAgICB9KTtcblxuICAgIC8vIERpc3Bvc2Ugb3ZlcmxheSB3aGVuIGNsb3NpbmcgYW5pbWF0aW9uIGlzIGNvbXBsZXRlXG4gICAgY29udGFpbmVySW5zdGFuY2UuX2FuaW1hdGlvblN0YXRlQ2hhbmdlZFxuICAgICAgLnBpcGUoXG4gICAgICAgIGZpbHRlcihldmVudCA9PiBldmVudC5waGFzZU5hbWUgPT09ICdkb25lJyAmJiBldmVudC50b1N0YXRlID09PSAnaGlkZGVuJyksXG4gICAgICAgIHRha2UoMSksXG4gICAgICApXG4gICAgICAuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX2Nsb3NlRmFsbGJhY2tUaW1lb3V0KTtcbiAgICAgICAgdGhpcy5fcmVmLmNsb3NlKHRoaXMuX3Jlc3VsdCk7XG4gICAgICB9KTtcblxuICAgIF9yZWYub3ZlcmxheVJlZi5kZXRhY2htZW50cygpLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICB0aGlzLl9yZWYuY2xvc2UodGhpcy5fcmVzdWx0KTtcbiAgICB9KTtcblxuICAgIG1lcmdlKFxuICAgICAgdGhpcy5iYWNrZHJvcENsaWNrKCksXG4gICAgICB0aGlzLmtleWRvd25FdmVudHMoKS5waXBlKGZpbHRlcihldmVudCA9PiBldmVudC5rZXlDb2RlID09PSBFU0NBUEUpKSxcbiAgICApLnN1YnNjcmliZShldmVudCA9PiB7XG4gICAgICBpZiAoXG4gICAgICAgICF0aGlzLmRpc2FibGVDbG9zZSAmJlxuICAgICAgICAoZXZlbnQudHlwZSAhPT0gJ2tleWRvd24nIHx8ICFoYXNNb2RpZmllcktleShldmVudCBhcyBLZXlib2FyZEV2ZW50KSlcbiAgICAgICkge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB0aGlzLmRpc21pc3MoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEaXNtaXNzZXMgdGhlIGJvdHRvbSBzaGVldC5cbiAgICogQHBhcmFtIHJlc3VsdCBEYXRhIHRvIGJlIHBhc3NlZCBiYWNrIHRvIHRoZSBib3R0b20gc2hlZXQgb3BlbmVyLlxuICAgKi9cbiAgZGlzbWlzcyhyZXN1bHQ/OiBSKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLmNvbnRhaW5lckluc3RhbmNlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gVHJhbnNpdGlvbiB0aGUgYmFja2Ryb3AgaW4gcGFyYWxsZWwgdG8gdGhlIGJvdHRvbSBzaGVldC5cbiAgICB0aGlzLmNvbnRhaW5lckluc3RhbmNlLl9hbmltYXRpb25TdGF0ZUNoYW5nZWRcbiAgICAgIC5waXBlKFxuICAgICAgICBmaWx0ZXIoZXZlbnQgPT4gZXZlbnQucGhhc2VOYW1lID09PSAnc3RhcnQnKSxcbiAgICAgICAgdGFrZSgxKSxcbiAgICAgIClcbiAgICAgIC5zdWJzY3JpYmUoZXZlbnQgPT4ge1xuICAgICAgICAvLyBUaGUgbG9naWMgdGhhdCBkaXNwb3NlcyBvZiB0aGUgb3ZlcmxheSBkZXBlbmRzIG9uIHRoZSBleGl0IGFuaW1hdGlvbiBjb21wbGV0aW5nLCBob3dldmVyXG4gICAgICAgIC8vIGl0IGlzbid0IGd1YXJhbnRlZWQgaWYgdGhlIHBhcmVudCB2aWV3IGlzIGRlc3Ryb3llZCB3aGlsZSBpdCdzIHJ1bm5pbmcuIEFkZCBhIGZhbGxiYWNrXG4gICAgICAgIC8vIHRpbWVvdXQgd2hpY2ggd2lsbCBjbGVhbiBldmVyeXRoaW5nIHVwIGlmIHRoZSBhbmltYXRpb24gaGFzbid0IGZpcmVkIHdpdGhpbiB0aGUgc3BlY2lmaWVkXG4gICAgICAgIC8vIGFtb3VudCBvZiB0aW1lIHBsdXMgMTAwbXMuIFdlIGRvbid0IG5lZWQgdG8gcnVuIHRoaXMgb3V0c2lkZSB0aGUgTmdab25lLCBiZWNhdXNlIGZvciB0aGVcbiAgICAgICAgLy8gdmFzdCBtYWpvcml0eSBvZiBjYXNlcyB0aGUgdGltZW91dCB3aWxsIGhhdmUgYmVlbiBjbGVhcmVkIGJlZm9yZSBpdCBoYXMgZmlyZWQuXG4gICAgICAgIHRoaXMuX2Nsb3NlRmFsbGJhY2tUaW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgdGhpcy5fcmVmLmNsb3NlKHRoaXMuX3Jlc3VsdCk7XG4gICAgICAgIH0sIGV2ZW50LnRvdGFsVGltZSArIDEwMCk7XG5cbiAgICAgICAgdGhpcy5fcmVmLm92ZXJsYXlSZWYuZGV0YWNoQmFja2Ryb3AoKTtcbiAgICAgIH0pO1xuXG4gICAgdGhpcy5fcmVzdWx0ID0gcmVzdWx0O1xuICAgIHRoaXMuY29udGFpbmVySW5zdGFuY2UuZXhpdCgpO1xuICAgIHRoaXMuY29udGFpbmVySW5zdGFuY2UgPSBudWxsITtcbiAgfVxuXG4gIC8qKiBHZXRzIGFuIG9ic2VydmFibGUgdGhhdCBpcyBub3RpZmllZCB3aGVuIHRoZSBib3R0b20gc2hlZXQgaXMgZmluaXNoZWQgY2xvc2luZy4gKi9cbiAgYWZ0ZXJEaXNtaXNzZWQoKTogT2JzZXJ2YWJsZTxSIHwgdW5kZWZpbmVkPiB7XG4gICAgcmV0dXJuIHRoaXMuX3JlZi5jbG9zZWQ7XG4gIH1cblxuICAvKiogR2V0cyBhbiBvYnNlcnZhYmxlIHRoYXQgaXMgbm90aWZpZWQgd2hlbiB0aGUgYm90dG9tIHNoZWV0IGhhcyBvcGVuZWQgYW5kIGFwcGVhcmVkLiAqL1xuICBhZnRlck9wZW5lZCgpOiBPYnNlcnZhYmxlPHZvaWQ+IHtcbiAgICByZXR1cm4gdGhpcy5fYWZ0ZXJPcGVuZWQ7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyBhbiBvYnNlcnZhYmxlIHRoYXQgZW1pdHMgd2hlbiB0aGUgb3ZlcmxheSdzIGJhY2tkcm9wIGhhcyBiZWVuIGNsaWNrZWQuXG4gICAqL1xuICBiYWNrZHJvcENsaWNrKCk6IE9ic2VydmFibGU8TW91c2VFdmVudD4ge1xuICAgIHJldHVybiB0aGlzLl9yZWYuYmFja2Ryb3BDbGljaztcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIGFuIG9ic2VydmFibGUgdGhhdCBlbWl0cyB3aGVuIGtleWRvd24gZXZlbnRzIGFyZSB0YXJnZXRlZCBvbiB0aGUgb3ZlcmxheS5cbiAgICovXG4gIGtleWRvd25FdmVudHMoKTogT2JzZXJ2YWJsZTxLZXlib2FyZEV2ZW50PiB7XG4gICAgcmV0dXJuIHRoaXMuX3JlZi5rZXlkb3duRXZlbnRzO1xuICB9XG59XG4iXX0=