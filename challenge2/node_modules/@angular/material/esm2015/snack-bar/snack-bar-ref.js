/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Subject } from 'rxjs';
/** Maximum amount of milliseconds that can be passed into setTimeout. */
const MAX_TIMEOUT = Math.pow(2, 31) - 1;
/**
 * Reference to a snack bar dispatched from the snack bar service.
 */
export class MatSnackBarRef {
    constructor(containerInstance, _overlayRef) {
        this._overlayRef = _overlayRef;
        /** Subject for notifying the user that the snack bar has been dismissed. */
        this._afterDismissed = new Subject();
        /** Subject for notifying the user that the snack bar has opened and appeared. */
        this._afterOpened = new Subject();
        /** Subject for notifying the user that the snack bar action was called. */
        this._onAction = new Subject();
        /** Whether the snack bar was dismissed using the action button. */
        this._dismissedByAction = false;
        this.containerInstance = containerInstance;
        // Dismiss snackbar on action.
        this.onAction().subscribe(() => this.dismiss());
        containerInstance._onExit.subscribe(() => this._finishDismiss());
    }
    /** Dismisses the snack bar. */
    dismiss() {
        if (!this._afterDismissed.closed) {
            this.containerInstance.exit();
        }
        clearTimeout(this._durationTimeoutId);
    }
    /** Marks the snackbar action clicked. */
    dismissWithAction() {
        if (!this._onAction.closed) {
            this._dismissedByAction = true;
            this._onAction.next();
            this._onAction.complete();
        }
        clearTimeout(this._durationTimeoutId);
    }
    /**
     * Marks the snackbar action clicked.
     * @deprecated Use `dismissWithAction` instead.
     * @breaking-change 8.0.0
     */
    closeWithAction() {
        this.dismissWithAction();
    }
    /** Dismisses the snack bar after some duration */
    _dismissAfter(duration) {
        // Note that we need to cap the duration to the maximum value for setTimeout, because
        // it'll revert to 1 if somebody passes in something greater (e.g. `Infinity`). See #17234.
        this._durationTimeoutId = setTimeout(() => this.dismiss(), Math.min(duration, MAX_TIMEOUT));
    }
    /** Marks the snackbar as opened */
    _open() {
        if (!this._afterOpened.closed) {
            this._afterOpened.next();
            this._afterOpened.complete();
        }
    }
    /** Cleans up the DOM after closing. */
    _finishDismiss() {
        this._overlayRef.dispose();
        if (!this._onAction.closed) {
            this._onAction.complete();
        }
        this._afterDismissed.next({ dismissedByAction: this._dismissedByAction });
        this._afterDismissed.complete();
        this._dismissedByAction = false;
    }
    /** Gets an observable that is notified when the snack bar is finished closing. */
    afterDismissed() {
        return this._afterDismissed;
    }
    /** Gets an observable that is notified when the snack bar has opened and appeared. */
    afterOpened() {
        return this.containerInstance._onEnter;
    }
    /** Gets an observable that is notified when the snack bar action is called. */
    onAction() {
        return this._onAction;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic25hY2stYmFyLXJlZi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9zbmFjay1iYXIvc25hY2stYmFyLXJlZi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFHSCxPQUFPLEVBQWEsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBVXpDLHlFQUF5RTtBQUN6RSxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7QUFFeEM7O0dBRUc7QUFDSCxNQUFNLE9BQU8sY0FBYztJQTRCekIsWUFBWSxpQkFBcUMsRUFDN0IsV0FBdUI7UUFBdkIsZ0JBQVcsR0FBWCxXQUFXLENBQVk7UUFuQjNDLDRFQUE0RTtRQUMzRCxvQkFBZSxHQUFHLElBQUksT0FBTyxFQUFzQixDQUFDO1FBRXJFLGlGQUFpRjtRQUNoRSxpQkFBWSxHQUFHLElBQUksT0FBTyxFQUFRLENBQUM7UUFFcEQsMkVBQTJFO1FBQzFELGNBQVMsR0FBRyxJQUFJLE9BQU8sRUFBUSxDQUFDO1FBUWpELG1FQUFtRTtRQUMzRCx1QkFBa0IsR0FBRyxLQUFLLENBQUM7UUFJakMsSUFBSSxDQUFDLGlCQUFpQixHQUFHLGlCQUFpQixDQUFDO1FBQzNDLDhCQUE4QjtRQUM5QixJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBQ2hELGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUM7SUFDbkUsQ0FBQztJQUVELCtCQUErQjtJQUMvQixPQUFPO1FBQ0wsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFFO1lBQ2hDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsQ0FBQztTQUMvQjtRQUNELFlBQVksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQztJQUN4QyxDQUFDO0lBRUQseUNBQXlDO0lBQ3pDLGlCQUFpQjtRQUNmLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRTtZQUMxQixJQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDO1lBQy9CLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDdEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztTQUMzQjtRQUNELFlBQVksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQztJQUN4QyxDQUFDO0lBR0Q7Ozs7T0FJRztJQUNILGVBQWU7UUFDYixJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztJQUMzQixDQUFDO0lBRUQsa0RBQWtEO0lBQ2xELGFBQWEsQ0FBQyxRQUFnQjtRQUM1QixxRkFBcUY7UUFDckYsMkZBQTJGO1FBQzNGLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUM7SUFDOUYsQ0FBQztJQUVELG1DQUFtQztJQUNuQyxLQUFLO1FBQ0gsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFO1lBQzdCLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDekIsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsQ0FBQztTQUM5QjtJQUNILENBQUM7SUFFRCx1Q0FBdUM7SUFDL0IsY0FBYztRQUNwQixJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBRTNCLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRTtZQUMxQixJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxDQUFDO1NBQzNCO1FBRUQsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsRUFBQyxpQkFBaUIsRUFBRSxJQUFJLENBQUMsa0JBQWtCLEVBQUMsQ0FBQyxDQUFDO1FBQ3hFLElBQUksQ0FBQyxlQUFlLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDaEMsSUFBSSxDQUFDLGtCQUFrQixHQUFHLEtBQUssQ0FBQztJQUNsQyxDQUFDO0lBRUQsa0ZBQWtGO0lBQ2xGLGNBQWM7UUFDWixPQUFPLElBQUksQ0FBQyxlQUFlLENBQUM7SUFDOUIsQ0FBQztJQUVELHNGQUFzRjtJQUN0RixXQUFXO1FBQ1QsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDO0lBQ3pDLENBQUM7SUFFRCwrRUFBK0U7SUFDL0UsUUFBUTtRQUNOLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztJQUN4QixDQUFDO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtPdmVybGF5UmVmfSBmcm9tICdAYW5ndWxhci9jZGsvb3ZlcmxheSc7XG5pbXBvcnQge09ic2VydmFibGUsIFN1YmplY3R9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtfU25hY2tCYXJDb250YWluZXJ9IGZyb20gJy4vc25hY2stYmFyLWNvbnRhaW5lcic7XG5cblxuLyoqIEV2ZW50IHRoYXQgaXMgZW1pdHRlZCB3aGVuIGEgc25hY2sgYmFyIGlzIGRpc21pc3NlZC4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTWF0U25hY2tCYXJEaXNtaXNzIHtcbiAgLyoqIFdoZXRoZXIgdGhlIHNuYWNrIGJhciB3YXMgZGlzbWlzc2VkIHVzaW5nIHRoZSBhY3Rpb24gYnV0dG9uLiAqL1xuICBkaXNtaXNzZWRCeUFjdGlvbjogYm9vbGVhbjtcbn1cblxuLyoqIE1heGltdW0gYW1vdW50IG9mIG1pbGxpc2Vjb25kcyB0aGF0IGNhbiBiZSBwYXNzZWQgaW50byBzZXRUaW1lb3V0LiAqL1xuY29uc3QgTUFYX1RJTUVPVVQgPSBNYXRoLnBvdygyLCAzMSkgLSAxO1xuXG4vKipcbiAqIFJlZmVyZW5jZSB0byBhIHNuYWNrIGJhciBkaXNwYXRjaGVkIGZyb20gdGhlIHNuYWNrIGJhciBzZXJ2aWNlLlxuICovXG5leHBvcnQgY2xhc3MgTWF0U25hY2tCYXJSZWY8VD4ge1xuICAvKiogVGhlIGluc3RhbmNlIG9mIHRoZSBjb21wb25lbnQgbWFraW5nIHVwIHRoZSBjb250ZW50IG9mIHRoZSBzbmFjayBiYXIuICovXG4gIGluc3RhbmNlOiBUO1xuXG4gIC8qKlxuICAgKiBUaGUgaW5zdGFuY2Ugb2YgdGhlIGNvbXBvbmVudCBtYWtpbmcgdXAgdGhlIGNvbnRlbnQgb2YgdGhlIHNuYWNrIGJhci5cbiAgICogQGRvY3MtcHJpdmF0ZVxuICAgKi9cbiAgY29udGFpbmVySW5zdGFuY2U6IF9TbmFja0JhckNvbnRhaW5lcjtcblxuICAvKiogU3ViamVjdCBmb3Igbm90aWZ5aW5nIHRoZSB1c2VyIHRoYXQgdGhlIHNuYWNrIGJhciBoYXMgYmVlbiBkaXNtaXNzZWQuICovXG4gIHByaXZhdGUgcmVhZG9ubHkgX2FmdGVyRGlzbWlzc2VkID0gbmV3IFN1YmplY3Q8TWF0U25hY2tCYXJEaXNtaXNzPigpO1xuXG4gIC8qKiBTdWJqZWN0IGZvciBub3RpZnlpbmcgdGhlIHVzZXIgdGhhdCB0aGUgc25hY2sgYmFyIGhhcyBvcGVuZWQgYW5kIGFwcGVhcmVkLiAqL1xuICBwcml2YXRlIHJlYWRvbmx5IF9hZnRlck9wZW5lZCA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XG5cbiAgLyoqIFN1YmplY3QgZm9yIG5vdGlmeWluZyB0aGUgdXNlciB0aGF0IHRoZSBzbmFjayBiYXIgYWN0aW9uIHdhcyBjYWxsZWQuICovXG4gIHByaXZhdGUgcmVhZG9ubHkgX29uQWN0aW9uID0gbmV3IFN1YmplY3Q8dm9pZD4oKTtcblxuICAvKipcbiAgICogVGltZW91dCBJRCBmb3IgdGhlIGR1cmF0aW9uIHNldFRpbWVvdXQgY2FsbC4gVXNlZCB0byBjbGVhciB0aGUgdGltZW91dCBpZiB0aGUgc25hY2tiYXIgaXNcbiAgICogZGlzbWlzc2VkIGJlZm9yZSB0aGUgZHVyYXRpb24gcGFzc2VzLlxuICAgKi9cbiAgcHJpdmF0ZSBfZHVyYXRpb25UaW1lb3V0SWQ6IG51bWJlcjtcblxuICAvKiogV2hldGhlciB0aGUgc25hY2sgYmFyIHdhcyBkaXNtaXNzZWQgdXNpbmcgdGhlIGFjdGlvbiBidXR0b24uICovXG4gIHByaXZhdGUgX2Rpc21pc3NlZEJ5QWN0aW9uID0gZmFsc2U7XG5cbiAgY29uc3RydWN0b3IoY29udGFpbmVySW5zdGFuY2U6IF9TbmFja0JhckNvbnRhaW5lcixcbiAgICAgICAgICAgICAgcHJpdmF0ZSBfb3ZlcmxheVJlZjogT3ZlcmxheVJlZikge1xuICAgIHRoaXMuY29udGFpbmVySW5zdGFuY2UgPSBjb250YWluZXJJbnN0YW5jZTtcbiAgICAvLyBEaXNtaXNzIHNuYWNrYmFyIG9uIGFjdGlvbi5cbiAgICB0aGlzLm9uQWN0aW9uKCkuc3Vic2NyaWJlKCgpID0+IHRoaXMuZGlzbWlzcygpKTtcbiAgICBjb250YWluZXJJbnN0YW5jZS5fb25FeGl0LnN1YnNjcmliZSgoKSA9PiB0aGlzLl9maW5pc2hEaXNtaXNzKCkpO1xuICB9XG5cbiAgLyoqIERpc21pc3NlcyB0aGUgc25hY2sgYmFyLiAqL1xuICBkaXNtaXNzKCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5fYWZ0ZXJEaXNtaXNzZWQuY2xvc2VkKSB7XG4gICAgICB0aGlzLmNvbnRhaW5lckluc3RhbmNlLmV4aXQoKTtcbiAgICB9XG4gICAgY2xlYXJUaW1lb3V0KHRoaXMuX2R1cmF0aW9uVGltZW91dElkKTtcbiAgfVxuXG4gIC8qKiBNYXJrcyB0aGUgc25hY2tiYXIgYWN0aW9uIGNsaWNrZWQuICovXG4gIGRpc21pc3NXaXRoQWN0aW9uKCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5fb25BY3Rpb24uY2xvc2VkKSB7XG4gICAgICB0aGlzLl9kaXNtaXNzZWRCeUFjdGlvbiA9IHRydWU7XG4gICAgICB0aGlzLl9vbkFjdGlvbi5uZXh0KCk7XG4gICAgICB0aGlzLl9vbkFjdGlvbi5jb21wbGV0ZSgpO1xuICAgIH1cbiAgICBjbGVhclRpbWVvdXQodGhpcy5fZHVyYXRpb25UaW1lb3V0SWQpO1xuICB9XG5cblxuICAvKipcbiAgICogTWFya3MgdGhlIHNuYWNrYmFyIGFjdGlvbiBjbGlja2VkLlxuICAgKiBAZGVwcmVjYXRlZCBVc2UgYGRpc21pc3NXaXRoQWN0aW9uYCBpbnN0ZWFkLlxuICAgKiBAYnJlYWtpbmctY2hhbmdlIDguMC4wXG4gICAqL1xuICBjbG9zZVdpdGhBY3Rpb24oKTogdm9pZCB7XG4gICAgdGhpcy5kaXNtaXNzV2l0aEFjdGlvbigpO1xuICB9XG5cbiAgLyoqIERpc21pc3NlcyB0aGUgc25hY2sgYmFyIGFmdGVyIHNvbWUgZHVyYXRpb24gKi9cbiAgX2Rpc21pc3NBZnRlcihkdXJhdGlvbjogbnVtYmVyKTogdm9pZCB7XG4gICAgLy8gTm90ZSB0aGF0IHdlIG5lZWQgdG8gY2FwIHRoZSBkdXJhdGlvbiB0byB0aGUgbWF4aW11bSB2YWx1ZSBmb3Igc2V0VGltZW91dCwgYmVjYXVzZVxuICAgIC8vIGl0J2xsIHJldmVydCB0byAxIGlmIHNvbWVib2R5IHBhc3NlcyBpbiBzb21ldGhpbmcgZ3JlYXRlciAoZS5nLiBgSW5maW5pdHlgKS4gU2VlICMxNzIzNC5cbiAgICB0aGlzLl9kdXJhdGlvblRpbWVvdXRJZCA9IHNldFRpbWVvdXQoKCkgPT4gdGhpcy5kaXNtaXNzKCksIE1hdGgubWluKGR1cmF0aW9uLCBNQVhfVElNRU9VVCkpO1xuICB9XG5cbiAgLyoqIE1hcmtzIHRoZSBzbmFja2JhciBhcyBvcGVuZWQgKi9cbiAgX29wZW4oKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLl9hZnRlck9wZW5lZC5jbG9zZWQpIHtcbiAgICAgIHRoaXMuX2FmdGVyT3BlbmVkLm5leHQoKTtcbiAgICAgIHRoaXMuX2FmdGVyT3BlbmVkLmNvbXBsZXRlKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIENsZWFucyB1cCB0aGUgRE9NIGFmdGVyIGNsb3NpbmcuICovXG4gIHByaXZhdGUgX2ZpbmlzaERpc21pc3MoKTogdm9pZCB7XG4gICAgdGhpcy5fb3ZlcmxheVJlZi5kaXNwb3NlKCk7XG5cbiAgICBpZiAoIXRoaXMuX29uQWN0aW9uLmNsb3NlZCkge1xuICAgICAgdGhpcy5fb25BY3Rpb24uY29tcGxldGUoKTtcbiAgICB9XG5cbiAgICB0aGlzLl9hZnRlckRpc21pc3NlZC5uZXh0KHtkaXNtaXNzZWRCeUFjdGlvbjogdGhpcy5fZGlzbWlzc2VkQnlBY3Rpb259KTtcbiAgICB0aGlzLl9hZnRlckRpc21pc3NlZC5jb21wbGV0ZSgpO1xuICAgIHRoaXMuX2Rpc21pc3NlZEJ5QWN0aW9uID0gZmFsc2U7XG4gIH1cblxuICAvKiogR2V0cyBhbiBvYnNlcnZhYmxlIHRoYXQgaXMgbm90aWZpZWQgd2hlbiB0aGUgc25hY2sgYmFyIGlzIGZpbmlzaGVkIGNsb3NpbmcuICovXG4gIGFmdGVyRGlzbWlzc2VkKCk6IE9ic2VydmFibGU8TWF0U25hY2tCYXJEaXNtaXNzPiB7XG4gICAgcmV0dXJuIHRoaXMuX2FmdGVyRGlzbWlzc2VkO1xuICB9XG5cbiAgLyoqIEdldHMgYW4gb2JzZXJ2YWJsZSB0aGF0IGlzIG5vdGlmaWVkIHdoZW4gdGhlIHNuYWNrIGJhciBoYXMgb3BlbmVkIGFuZCBhcHBlYXJlZC4gKi9cbiAgYWZ0ZXJPcGVuZWQoKTogT2JzZXJ2YWJsZTx2b2lkPiB7XG4gICAgcmV0dXJuIHRoaXMuY29udGFpbmVySW5zdGFuY2UuX29uRW50ZXI7XG4gIH1cblxuICAvKiogR2V0cyBhbiBvYnNlcnZhYmxlIHRoYXQgaXMgbm90aWZpZWQgd2hlbiB0aGUgc25hY2sgYmFyIGFjdGlvbiBpcyBjYWxsZWQuICovXG4gIG9uQWN0aW9uKCk6IE9ic2VydmFibGU8dm9pZD4ge1xuICAgIHJldHVybiB0aGlzLl9vbkFjdGlvbjtcbiAgfVxufVxuIl19