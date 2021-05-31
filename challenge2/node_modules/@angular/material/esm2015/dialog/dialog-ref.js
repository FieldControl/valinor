/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ESCAPE, hasModifierKey } from '@angular/cdk/keycodes';
import { Subject } from 'rxjs';
import { filter, take } from 'rxjs/operators';
// TODO(jelbourn): resizing
// Counter for unique dialog ids.
let uniqueId = 0;
/**
 * Reference to a dialog opened via the MatDialog service.
 */
export class MatDialogRef {
    constructor(_overlayRef, _containerInstance, id = `mat-dialog-${uniqueId++}`) {
        this._overlayRef = _overlayRef;
        this._containerInstance = _containerInstance;
        this.id = id;
        /** Whether the user is allowed to close the dialog. */
        this.disableClose = this._containerInstance._config.disableClose;
        /** Subject for notifying the user that the dialog has finished opening. */
        this._afterOpened = new Subject();
        /** Subject for notifying the user that the dialog has finished closing. */
        this._afterClosed = new Subject();
        /** Subject for notifying the user that the dialog has started closing. */
        this._beforeClosed = new Subject();
        /** Current state of the dialog. */
        this._state = 0 /* OPEN */;
        // Pass the id along to the container.
        _containerInstance._id = id;
        // Emit when opening animation completes
        _containerInstance._animationStateChanged.pipe(filter(event => event.state === 'opened'), take(1))
            .subscribe(() => {
            this._afterOpened.next();
            this._afterOpened.complete();
        });
        // Dispose overlay when closing animation is complete
        _containerInstance._animationStateChanged.pipe(filter(event => event.state === 'closed'), take(1)).subscribe(() => {
            clearTimeout(this._closeFallbackTimeout);
            this._finishDialogClose();
        });
        _overlayRef.detachments().subscribe(() => {
            this._beforeClosed.next(this._result);
            this._beforeClosed.complete();
            this._afterClosed.next(this._result);
            this._afterClosed.complete();
            this.componentInstance = null;
            this._overlayRef.dispose();
        });
        _overlayRef.keydownEvents()
            .pipe(filter(event => {
            return event.keyCode === ESCAPE && !this.disableClose && !hasModifierKey(event);
        }))
            .subscribe(event => {
            event.preventDefault();
            _closeDialogVia(this, 'keyboard');
        });
        _overlayRef.backdropClick().subscribe(() => {
            if (this.disableClose) {
                this._containerInstance._recaptureFocus();
            }
            else {
                _closeDialogVia(this, 'mouse');
            }
        });
    }
    /**
     * Close the dialog.
     * @param dialogResult Optional result to return to the dialog opener.
     */
    close(dialogResult) {
        this._result = dialogResult;
        // Transition the backdrop in parallel to the dialog.
        this._containerInstance._animationStateChanged.pipe(filter(event => event.state === 'closing'), take(1))
            .subscribe(event => {
            this._beforeClosed.next(dialogResult);
            this._beforeClosed.complete();
            this._overlayRef.detachBackdrop();
            // The logic that disposes of the overlay depends on the exit animation completing, however
            // it isn't guaranteed if the parent view is destroyed while it's running. Add a fallback
            // timeout which will clean everything up if the animation hasn't fired within the specified
            // amount of time plus 100ms. We don't need to run this outside the NgZone, because for the
            // vast majority of cases the timeout will have been cleared before it has the chance to fire.
            this._closeFallbackTimeout = setTimeout(() => this._finishDialogClose(), event.totalTime + 100);
        });
        this._state = 1 /* CLOSING */;
        this._containerInstance._startExitAnimation();
    }
    /**
     * Gets an observable that is notified when the dialog is finished opening.
     */
    afterOpened() {
        return this._afterOpened;
    }
    /**
     * Gets an observable that is notified when the dialog is finished closing.
     */
    afterClosed() {
        return this._afterClosed;
    }
    /**
     * Gets an observable that is notified when the dialog has started closing.
     */
    beforeClosed() {
        return this._beforeClosed;
    }
    /**
     * Gets an observable that emits when the overlay's backdrop has been clicked.
     */
    backdropClick() {
        return this._overlayRef.backdropClick();
    }
    /**
     * Gets an observable that emits when keydown events are targeted on the overlay.
     */
    keydownEvents() {
        return this._overlayRef.keydownEvents();
    }
    /**
     * Updates the dialog's position.
     * @param position New dialog position.
     */
    updatePosition(position) {
        let strategy = this._getPositionStrategy();
        if (position && (position.left || position.right)) {
            position.left ? strategy.left(position.left) : strategy.right(position.right);
        }
        else {
            strategy.centerHorizontally();
        }
        if (position && (position.top || position.bottom)) {
            position.top ? strategy.top(position.top) : strategy.bottom(position.bottom);
        }
        else {
            strategy.centerVertically();
        }
        this._overlayRef.updatePosition();
        return this;
    }
    /**
     * Updates the dialog's width and height.
     * @param width New width of the dialog.
     * @param height New height of the dialog.
     */
    updateSize(width = '', height = '') {
        this._overlayRef.updateSize({ width, height });
        this._overlayRef.updatePosition();
        return this;
    }
    /** Add a CSS class or an array of classes to the overlay pane. */
    addPanelClass(classes) {
        this._overlayRef.addPanelClass(classes);
        return this;
    }
    /** Remove a CSS class or an array of classes from the overlay pane. */
    removePanelClass(classes) {
        this._overlayRef.removePanelClass(classes);
        return this;
    }
    /** Gets the current state of the dialog's lifecycle. */
    getState() {
        return this._state;
    }
    /**
     * Finishes the dialog close by updating the state of the dialog
     * and disposing the overlay.
     */
    _finishDialogClose() {
        this._state = 2 /* CLOSED */;
        this._overlayRef.dispose();
    }
    /** Fetches the position strategy object from the overlay ref. */
    _getPositionStrategy() {
        return this._overlayRef.getConfig().positionStrategy;
    }
}
/**
 * Closes the dialog with the specified interaction type. This is currently not part of
 * `MatDialogRef` as that would conflict with custom dialog ref mocks provided in tests.
 * More details. See: https://github.com/angular/components/pull/9257#issuecomment-651342226.
 */
// TODO: TODO: Move this back into `MatDialogRef` when we provide an official mock dialog ref.
export function _closeDialogVia(ref, interactionType, result) {
    // Some mock dialog ref instances in tests do not have the `_containerInstance` property.
    // For those, we keep the behavior as is and do not deal with the interaction type.
    if (ref._containerInstance !== undefined) {
        ref._containerInstance._closeInteractionType = interactionType;
    }
    return ref.close(result);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhbG9nLXJlZi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9kaWFsb2cvZGlhbG9nLXJlZi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFHSCxPQUFPLEVBQUMsTUFBTSxFQUFFLGNBQWMsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBRTdELE9BQU8sRUFBYSxPQUFPLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDekMsT0FBTyxFQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUs1QywyQkFBMkI7QUFFM0IsaUNBQWlDO0FBQ2pDLElBQUksUUFBUSxHQUFHLENBQUMsQ0FBQztBQUtqQjs7R0FFRztBQUNILE1BQU0sT0FBTyxZQUFZO0lBeUJ2QixZQUNVLFdBQXVCLEVBQ3hCLGtCQUEyQyxFQUN6QyxLQUFhLGNBQWMsUUFBUSxFQUFFLEVBQUU7UUFGeEMsZ0JBQVcsR0FBWCxXQUFXLENBQVk7UUFDeEIsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUF5QjtRQUN6QyxPQUFFLEdBQUYsRUFBRSxDQUFxQztRQXhCbEQsdURBQXVEO1FBQ3ZELGlCQUFZLEdBQXdCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDO1FBRWpGLDJFQUEyRTtRQUMxRCxpQkFBWSxHQUFHLElBQUksT0FBTyxFQUFRLENBQUM7UUFFcEQsMkVBQTJFO1FBQzFELGlCQUFZLEdBQUcsSUFBSSxPQUFPLEVBQWlCLENBQUM7UUFFN0QsMEVBQTBFO1FBQ3pELGtCQUFhLEdBQUcsSUFBSSxPQUFPLEVBQWlCLENBQUM7UUFROUQsbUNBQW1DO1FBQzNCLFdBQU0sZ0JBQXVCO1FBT25DLHNDQUFzQztRQUN0QyxrQkFBa0IsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDO1FBRTVCLHdDQUF3QztRQUN4QyxrQkFBa0IsQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQzVD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QUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQzdCLENBQUM7SUFFRCxpRUFBaUU7SUFDekQsb0JBQW9CO1FBQzFCLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxnQkFBMEMsQ0FBQztJQUNqRixDQUFDO0NBQ0Y7QUFFRDs7OztHQUlHO0FBQ0gsOEZBQThGO0FBQzlGLE1BQU0sVUFBVSxlQUFlLENBQUksR0FBb0IsRUFBRSxlQUE0QixFQUFFLE1BQVU7SUFDL0YseUZBQXlGO0lBQ3pGLG1GQUFtRjtJQUNuRixJQUFJLEdBQUcsQ0FBQyxrQkFBa0IsS0FBSyxTQUFTLEVBQUU7UUFDeEMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLHFCQUFxQixHQUFHLGVBQWUsQ0FBQztLQUNoRTtJQUNELE9BQU8sR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUMzQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Rm9jdXNPcmlnaW59IGZyb20gJ0Bhbmd1bGFyL2Nkay9hMTF5JztcbmltcG9ydCB7RVNDQVBFLCBoYXNNb2RpZmllcktleX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2tleWNvZGVzJztcbmltcG9ydCB7R2xvYmFsUG9zaXRpb25TdHJhdGVneSwgT3ZlcmxheVJlZn0gZnJvbSAnQGFuZ3VsYXIvY2RrL292ZXJsYXknO1xuaW1wb3J0IHtPYnNlcnZhYmxlLCBTdWJqZWN0fSBmcm9tICdyeGpzJztcbmltcG9ydCB7ZmlsdGVyLCB0YWtlfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5pbXBvcnQge0RpYWxvZ1Bvc2l0aW9ufSBmcm9tICcuL2RpYWxvZy1jb25maWcnO1xuaW1wb3J0IHtfTWF0RGlhbG9nQ29udGFpbmVyQmFzZX0gZnJvbSAnLi9kaWFsb2ctY29udGFpbmVyJztcblxuXG4vLyBUT0RPKGplbGJvdXJuKTogcmVzaXppbmdcblxuLy8gQ291bnRlciBmb3IgdW5pcXVlIGRpYWxvZyBpZHMuXG5sZXQgdW5pcXVlSWQgPSAwO1xuXG4vKiogUG9zc2libGUgc3RhdGVzIG9mIHRoZSBsaWZlY3ljbGUgb2YgYSBkaWFsb2cuICovXG5leHBvcnQgY29uc3QgZW51bSBNYXREaWFsb2dTdGF0ZSB7T1BFTiwgQ0xPU0lORywgQ0xPU0VEfVxuXG4vKipcbiAqIFJlZmVyZW5jZSB0byBhIGRpYWxvZyBvcGVuZWQgdmlhIHRoZSBNYXREaWFsb2cgc2VydmljZS5cbiAqL1xuZXhwb3J0IGNsYXNzIE1hdERpYWxvZ1JlZjxULCBSID0gYW55PiB7XG4gIC8qKiBUaGUgaW5zdGFuY2Ugb2YgY29tcG9uZW50IG9wZW5lZCBpbnRvIHRoZSBkaWFsb2cuICovXG4gIGNvbXBvbmVudEluc3RhbmNlOiBUO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSB1c2VyIGlzIGFsbG93ZWQgdG8gY2xvc2UgdGhlIGRpYWxvZy4gKi9cbiAgZGlzYWJsZUNsb3NlOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdGhpcy5fY29udGFpbmVySW5zdGFuY2UuX2NvbmZpZy5kaXNhYmxlQ2xvc2U7XG5cbiAgLyoqIFN1YmplY3QgZm9yIG5vdGlmeWluZyB0aGUgdXNlciB0aGF0IHRoZSBkaWFsb2cgaGFzIGZpbmlzaGVkIG9wZW5pbmcuICovXG4gIHByaXZhdGUgcmVhZG9ubHkgX2FmdGVyT3BlbmVkID0gbmV3IFN1YmplY3Q8dm9pZD4oKTtcblxuICAvKiogU3ViamVjdCBmb3Igbm90aWZ5aW5nIHRoZSB1c2VyIHRoYXQgdGhlIGRpYWxvZyBoYXMgZmluaXNoZWQgY2xvc2luZy4gKi9cbiAgcHJpdmF0ZSByZWFkb25seSBfYWZ0ZXJDbG9zZWQgPSBuZXcgU3ViamVjdDxSIHwgdW5kZWZpbmVkPigpO1xuXG4gIC8qKiBTdWJqZWN0IGZvciBub3RpZnlpbmcgdGhlIHVzZXIgdGhhdCB0aGUgZGlhbG9nIGhhcyBzdGFydGVkIGNsb3NpbmcuICovXG4gIHByaXZhdGUgcmVhZG9ubHkgX2JlZm9yZUNsb3NlZCA9IG5ldyBTdWJqZWN0PFIgfCB1bmRlZmluZWQ+KCk7XG5cbiAgLyoqIFJlc3VsdCB0byBiZSBwYXNzZWQgdG8gYWZ0ZXJDbG9zZWQuICovXG4gIHByaXZhdGUgX3Jlc3VsdDogUiB8IHVuZGVmaW5lZDtcblxuICAvKiogSGFuZGxlIHRvIHRoZSB0aW1lb3V0IHRoYXQncyBydW5uaW5nIGFzIGEgZmFsbGJhY2sgaW4gY2FzZSB0aGUgZXhpdCBhbmltYXRpb24gZG9lc24ndCBmaXJlLiAqL1xuICBwcml2YXRlIF9jbG9zZUZhbGxiYWNrVGltZW91dDogbnVtYmVyO1xuXG4gIC8qKiBDdXJyZW50IHN0YXRlIG9mIHRoZSBkaWFsb2cuICovXG4gIHByaXZhdGUgX3N0YXRlID0gTWF0RGlhbG9nU3RhdGUuT1BFTjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIF9vdmVybGF5UmVmOiBPdmVybGF5UmVmLFxuICAgIHB1YmxpYyBfY29udGFpbmVySW5zdGFuY2U6IF9NYXREaWFsb2dDb250YWluZXJCYXNlLFxuICAgIHJlYWRvbmx5IGlkOiBzdHJpbmcgPSBgbWF0LWRpYWxvZy0ke3VuaXF1ZUlkKyt9YCkge1xuXG4gICAgLy8gUGFzcyB0aGUgaWQgYWxvbmcgdG8gdGhlIGNvbnRhaW5lci5cbiAgICBfY29udGFpbmVySW5zdGFuY2UuX2lkID0gaWQ7XG5cbiAgICAvLyBFbWl0IHdoZW4gb3BlbmluZyBhbmltYXRpb24gY29tcGxldGVzXG4gICAgX2NvbnRhaW5lckluc3RhbmNlLl9hbmltYXRpb25TdGF0ZUNoYW5nZWQucGlwZShcbiAgICAgIGZpbHRlcihldmVudCA9PiBldmVudC5zdGF0ZSA9PT0gJ29wZW5lZCcpLFxuICAgICAgdGFrZSgxKVxuICAgIClcbiAgICAuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgIHRoaXMuX2FmdGVyT3BlbmVkLm5leHQoKTtcbiAgICAgIHRoaXMuX2FmdGVyT3BlbmVkLmNvbXBsZXRlKCk7XG4gICAgfSk7XG5cbiAgICAvLyBEaXNwb3NlIG92ZXJsYXkgd2hlbiBjbG9zaW5nIGFuaW1hdGlvbiBpcyBjb21wbGV0ZVxuICAgIF9jb250YWluZXJJbnN0YW5jZS5fYW5pbWF0aW9uU3RhdGVDaGFuZ2VkLnBpcGUoXG4gICAgICBmaWx0ZXIoZXZlbnQgPT4gZXZlbnQuc3RhdGUgPT09ICdjbG9zZWQnKSxcbiAgICAgIHRha2UoMSlcbiAgICApLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5fY2xvc2VGYWxsYmFja1RpbWVvdXQpO1xuICAgICAgdGhpcy5fZmluaXNoRGlhbG9nQ2xvc2UoKTtcbiAgICB9KTtcblxuICAgIF9vdmVybGF5UmVmLmRldGFjaG1lbnRzKCkuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgIHRoaXMuX2JlZm9yZUNsb3NlZC5uZXh0KHRoaXMuX3Jlc3VsdCk7XG4gICAgICB0aGlzLl9iZWZvcmVDbG9zZWQuY29tcGxldGUoKTtcbiAgICAgIHRoaXMuX2FmdGVyQ2xvc2VkLm5leHQodGhpcy5fcmVzdWx0KTtcbiAgICAgIHRoaXMuX2FmdGVyQ2xvc2VkLmNvbXBsZXRlKCk7XG4gICAgICB0aGlzLmNvbXBvbmVudEluc3RhbmNlID0gbnVsbCE7XG4gICAgICB0aGlzLl9vdmVybGF5UmVmLmRpc3Bvc2UoKTtcbiAgICB9KTtcblxuICAgIF9vdmVybGF5UmVmLmtleWRvd25FdmVudHMoKVxuICAgICAgLnBpcGUoZmlsdGVyKGV2ZW50ID0+IHtcbiAgICAgICAgcmV0dXJuIGV2ZW50LmtleUNvZGUgPT09IEVTQ0FQRSAmJiAhdGhpcy5kaXNhYmxlQ2xvc2UgJiYgIWhhc01vZGlmaWVyS2V5KGV2ZW50KTtcbiAgICAgIH0pKVxuICAgICAgLnN1YnNjcmliZShldmVudCA9PiB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIF9jbG9zZURpYWxvZ1ZpYSh0aGlzLCAna2V5Ym9hcmQnKTtcbiAgICAgIH0pO1xuXG4gICAgX292ZXJsYXlSZWYuYmFja2Ryb3BDbGljaygpLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICBpZiAodGhpcy5kaXNhYmxlQ2xvc2UpIHtcbiAgICAgICAgdGhpcy5fY29udGFpbmVySW5zdGFuY2UuX3JlY2FwdHVyZUZvY3VzKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBfY2xvc2VEaWFsb2dWaWEodGhpcywgJ21vdXNlJyk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQ2xvc2UgdGhlIGRpYWxvZy5cbiAgICogQHBhcmFtIGRpYWxvZ1Jlc3VsdCBPcHRpb25hbCByZXN1bHQgdG8gcmV0dXJuIHRvIHRoZSBkaWFsb2cgb3BlbmVyLlxuICAgKi9cbiAgY2xvc2UoZGlhbG9nUmVzdWx0PzogUik6IHZvaWQge1xuICAgIHRoaXMuX3Jlc3VsdCA9IGRpYWxvZ1Jlc3VsdDtcblxuICAgIC8vIFRyYW5zaXRpb24gdGhlIGJhY2tkcm9wIGluIHBhcmFsbGVsIHRvIHRoZSBkaWFsb2cuXG4gICAgdGhpcy5fY29udGFpbmVySW5zdGFuY2UuX2FuaW1hdGlvblN0YXRlQ2hhbmdlZC5waXBlKFxuICAgICAgZmlsdGVyKGV2ZW50ID0+IGV2ZW50LnN0YXRlID09PSAnY2xvc2luZycpLFxuICAgICAgdGFrZSgxKVxuICAgIClcbiAgICAuc3Vic2NyaWJlKGV2ZW50ID0+IHtcbiAgICAgIHRoaXMuX2JlZm9yZUNsb3NlZC5uZXh0KGRpYWxvZ1Jlc3VsdCk7XG4gICAgICB0aGlzLl9iZWZvcmVDbG9zZWQuY29tcGxldGUoKTtcbiAgICAgIHRoaXMuX292ZXJsYXlSZWYuZGV0YWNoQmFja2Ryb3AoKTtcblxuICAgICAgLy8gVGhlIGxvZ2ljIHRoYXQgZGlzcG9zZXMgb2YgdGhlIG92ZXJsYXkgZGVwZW5kcyBvbiB0aGUgZXhpdCBhbmltYXRpb24gY29tcGxldGluZywgaG93ZXZlclxuICAgICAgLy8gaXQgaXNuJ3QgZ3VhcmFudGVlZCBpZiB0aGUgcGFyZW50IHZpZXcgaXMgZGVzdHJveWVkIHdoaWxlIGl0J3MgcnVubmluZy4gQWRkIGEgZmFsbGJhY2tcbiAgICAgIC8vIHRpbWVvdXQgd2hpY2ggd2lsbCBjbGVhbiBldmVyeXRoaW5nIHVwIGlmIHRoZSBhbmltYXRpb24gaGFzbid0IGZpcmVkIHdpdGhpbiB0aGUgc3BlY2lmaWVkXG4gICAgICAvLyBhbW91bnQgb2YgdGltZSBwbHVzIDEwMG1zLiBXZSBkb24ndCBuZWVkIHRvIHJ1biB0aGlzIG91dHNpZGUgdGhlIE5nWm9uZSwgYmVjYXVzZSBmb3IgdGhlXG4gICAgICAvLyB2YXN0IG1ham9yaXR5IG9mIGNhc2VzIHRoZSB0aW1lb3V0IHdpbGwgaGF2ZSBiZWVuIGNsZWFyZWQgYmVmb3JlIGl0IGhhcyB0aGUgY2hhbmNlIHRvIGZpcmUuXG4gICAgICB0aGlzLl9jbG9zZUZhbGxiYWNrVGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4gdGhpcy5fZmluaXNoRGlhbG9nQ2xvc2UoKSxcbiAgICAgICAgICBldmVudC50b3RhbFRpbWUgKyAxMDApO1xuICAgIH0pO1xuXG4gICAgdGhpcy5fc3RhdGUgPSBNYXREaWFsb2dTdGF0ZS5DTE9TSU5HO1xuICAgIHRoaXMuX2NvbnRhaW5lckluc3RhbmNlLl9zdGFydEV4aXRBbmltYXRpb24oKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIGFuIG9ic2VydmFibGUgdGhhdCBpcyBub3RpZmllZCB3aGVuIHRoZSBkaWFsb2cgaXMgZmluaXNoZWQgb3BlbmluZy5cbiAgICovXG4gIGFmdGVyT3BlbmVkKCk6IE9ic2VydmFibGU8dm9pZD4ge1xuICAgIHJldHVybiB0aGlzLl9hZnRlck9wZW5lZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIGFuIG9ic2VydmFibGUgdGhhdCBpcyBub3RpZmllZCB3aGVuIHRoZSBkaWFsb2cgaXMgZmluaXNoZWQgY2xvc2luZy5cbiAgICovXG4gIGFmdGVyQ2xvc2VkKCk6IE9ic2VydmFibGU8UiB8IHVuZGVmaW5lZD4ge1xuICAgIHJldHVybiB0aGlzLl9hZnRlckNsb3NlZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIGFuIG9ic2VydmFibGUgdGhhdCBpcyBub3RpZmllZCB3aGVuIHRoZSBkaWFsb2cgaGFzIHN0YXJ0ZWQgY2xvc2luZy5cbiAgICovXG4gIGJlZm9yZUNsb3NlZCgpOiBPYnNlcnZhYmxlPFIgfCB1bmRlZmluZWQ+IHtcbiAgICByZXR1cm4gdGhpcy5fYmVmb3JlQ2xvc2VkO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgYW4gb2JzZXJ2YWJsZSB0aGF0IGVtaXRzIHdoZW4gdGhlIG92ZXJsYXkncyBiYWNrZHJvcCBoYXMgYmVlbiBjbGlja2VkLlxuICAgKi9cbiAgYmFja2Ryb3BDbGljaygpOiBPYnNlcnZhYmxlPE1vdXNlRXZlbnQ+IHtcbiAgICByZXR1cm4gdGhpcy5fb3ZlcmxheVJlZi5iYWNrZHJvcENsaWNrKCk7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyBhbiBvYnNlcnZhYmxlIHRoYXQgZW1pdHMgd2hlbiBrZXlkb3duIGV2ZW50cyBhcmUgdGFyZ2V0ZWQgb24gdGhlIG92ZXJsYXkuXG4gICAqL1xuICBrZXlkb3duRXZlbnRzKCk6IE9ic2VydmFibGU8S2V5Ym9hcmRFdmVudD4ge1xuICAgIHJldHVybiB0aGlzLl9vdmVybGF5UmVmLmtleWRvd25FdmVudHMoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGVzIHRoZSBkaWFsb2cncyBwb3NpdGlvbi5cbiAgICogQHBhcmFtIHBvc2l0aW9uIE5ldyBkaWFsb2cgcG9zaXRpb24uXG4gICAqL1xuICB1cGRhdGVQb3NpdGlvbihwb3NpdGlvbj86IERpYWxvZ1Bvc2l0aW9uKTogdGhpcyB7XG4gICAgbGV0IHN0cmF0ZWd5ID0gdGhpcy5fZ2V0UG9zaXRpb25TdHJhdGVneSgpO1xuXG4gICAgaWYgKHBvc2l0aW9uICYmIChwb3NpdGlvbi5sZWZ0IHx8IHBvc2l0aW9uLnJpZ2h0KSkge1xuICAgICAgcG9zaXRpb24ubGVmdCA/IHN0cmF0ZWd5LmxlZnQocG9zaXRpb24ubGVmdCkgOiBzdHJhdGVneS5yaWdodChwb3NpdGlvbi5yaWdodCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0cmF0ZWd5LmNlbnRlckhvcml6b250YWxseSgpO1xuICAgIH1cblxuICAgIGlmIChwb3NpdGlvbiAmJiAocG9zaXRpb24udG9wIHx8IHBvc2l0aW9uLmJvdHRvbSkpIHtcbiAgICAgIHBvc2l0aW9uLnRvcCA/IHN0cmF0ZWd5LnRvcChwb3NpdGlvbi50b3ApIDogc3RyYXRlZ3kuYm90dG9tKHBvc2l0aW9uLmJvdHRvbSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0cmF0ZWd5LmNlbnRlclZlcnRpY2FsbHkoKTtcbiAgICB9XG5cbiAgICB0aGlzLl9vdmVybGF5UmVmLnVwZGF0ZVBvc2l0aW9uKCk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGVzIHRoZSBkaWFsb2cncyB3aWR0aCBhbmQgaGVpZ2h0LlxuICAgKiBAcGFyYW0gd2lkdGggTmV3IHdpZHRoIG9mIHRoZSBkaWFsb2cuXG4gICAqIEBwYXJhbSBoZWlnaHQgTmV3IGhlaWdodCBvZiB0aGUgZGlhbG9nLlxuICAgKi9cbiAgdXBkYXRlU2l6ZSh3aWR0aDogc3RyaW5nID0gJycsIGhlaWdodDogc3RyaW5nID0gJycpOiB0aGlzIHtcbiAgICB0aGlzLl9vdmVybGF5UmVmLnVwZGF0ZVNpemUoe3dpZHRoLCBoZWlnaHR9KTtcbiAgICB0aGlzLl9vdmVybGF5UmVmLnVwZGF0ZVBvc2l0aW9uKCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKiogQWRkIGEgQ1NTIGNsYXNzIG9yIGFuIGFycmF5IG9mIGNsYXNzZXMgdG8gdGhlIG92ZXJsYXkgcGFuZS4gKi9cbiAgYWRkUGFuZWxDbGFzcyhjbGFzc2VzOiBzdHJpbmcgfCBzdHJpbmdbXSk6IHRoaXMge1xuICAgIHRoaXMuX292ZXJsYXlSZWYuYWRkUGFuZWxDbGFzcyhjbGFzc2VzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKiBSZW1vdmUgYSBDU1MgY2xhc3Mgb3IgYW4gYXJyYXkgb2YgY2xhc3NlcyBmcm9tIHRoZSBvdmVybGF5IHBhbmUuICovXG4gIHJlbW92ZVBhbmVsQ2xhc3MoY2xhc3Nlczogc3RyaW5nIHwgc3RyaW5nW10pOiB0aGlzIHtcbiAgICB0aGlzLl9vdmVybGF5UmVmLnJlbW92ZVBhbmVsQ2xhc3MoY2xhc3Nlcyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgY3VycmVudCBzdGF0ZSBvZiB0aGUgZGlhbG9nJ3MgbGlmZWN5Y2xlLiAqL1xuICBnZXRTdGF0ZSgpOiBNYXREaWFsb2dTdGF0ZSB7XG4gICAgcmV0dXJuIHRoaXMuX3N0YXRlO1xuICB9XG5cbiAgLyoqXG4gICAqIEZpbmlzaGVzIHRoZSBkaWFsb2cgY2xvc2UgYnkgdXBkYXRpbmcgdGhlIHN0YXRlIG9mIHRoZSBkaWFsb2dcbiAgICogYW5kIGRpc3Bvc2luZyB0aGUgb3ZlcmxheS5cbiAgICovXG4gIHByaXZhdGUgX2ZpbmlzaERpYWxvZ0Nsb3NlKCkge1xuICAgIHRoaXMuX3N0YXRlID0gTWF0RGlhbG9nU3RhdGUuQ0xPU0VEO1xuICAgIHRoaXMuX292ZXJsYXlSZWYuZGlzcG9zZSgpO1xuICB9XG5cbiAgLyoqIEZldGNoZXMgdGhlIHBvc2l0aW9uIHN0cmF0ZWd5IG9iamVjdCBmcm9tIHRoZSBvdmVybGF5IHJlZi4gKi9cbiAgcHJpdmF0ZSBfZ2V0UG9zaXRpb25TdHJhdGVneSgpOiBHbG9iYWxQb3NpdGlvblN0cmF0ZWd5IHtcbiAgICByZXR1cm4gdGhpcy5fb3ZlcmxheVJlZi5nZXRDb25maWcoKS5wb3NpdGlvblN0cmF0ZWd5IGFzIEdsb2JhbFBvc2l0aW9uU3RyYXRlZ3k7XG4gIH1cbn1cblxuLyoqXG4gKiBDbG9zZXMgdGhlIGRpYWxvZyB3aXRoIHRoZSBzcGVjaWZpZWQgaW50ZXJhY3Rpb24gdHlwZS4gVGhpcyBpcyBjdXJyZW50bHkgbm90IHBhcnQgb2ZcbiAqIGBNYXREaWFsb2dSZWZgIGFzIHRoYXQgd291bGQgY29uZmxpY3Qgd2l0aCBjdXN0b20gZGlhbG9nIHJlZiBtb2NrcyBwcm92aWRlZCBpbiB0ZXN0cy5cbiAqIE1vcmUgZGV0YWlscy4gU2VlOiBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9jb21wb25lbnRzL3B1bGwvOTI1NyNpc3N1ZWNvbW1lbnQtNjUxMzQyMjI2LlxuICovXG4vLyBUT0RPOiBUT0RPOiBNb3ZlIHRoaXMgYmFjayBpbnRvIGBNYXREaWFsb2dSZWZgIHdoZW4gd2UgcHJvdmlkZSBhbiBvZmZpY2lhbCBtb2NrIGRpYWxvZyByZWYuXG5leHBvcnQgZnVuY3Rpb24gX2Nsb3NlRGlhbG9nVmlhPFI+KHJlZjogTWF0RGlhbG9nUmVmPFI+LCBpbnRlcmFjdGlvblR5cGU6IEZvY3VzT3JpZ2luLCByZXN1bHQ/OiBSKSB7XG4gIC8vIFNvbWUgbW9jayBkaWFsb2cgcmVmIGluc3RhbmNlcyBpbiB0ZXN0cyBkbyBub3QgaGF2ZSB0aGUgYF9jb250YWluZXJJbnN0YW5jZWAgcHJvcGVydHkuXG4gIC8vIEZvciB0aG9zZSwgd2Uga2VlcCB0aGUgYmVoYXZpb3IgYXMgaXMgYW5kIGRvIG5vdCBkZWFsIHdpdGggdGhlIGludGVyYWN0aW9uIHR5cGUuXG4gIGlmIChyZWYuX2NvbnRhaW5lckluc3RhbmNlICE9PSB1bmRlZmluZWQpIHtcbiAgICByZWYuX2NvbnRhaW5lckluc3RhbmNlLl9jbG9zZUludGVyYWN0aW9uVHlwZSA9IGludGVyYWN0aW9uVHlwZTtcbiAgfVxuICByZXR1cm4gcmVmLmNsb3NlKHJlc3VsdCk7XG59XG4iXX0=