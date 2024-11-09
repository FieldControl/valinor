/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { inject, Injectable, NgZone } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { filter, shareReplay, takeUntil } from 'rxjs/operators';
import * as i0 from "@angular/core";
/**
 * Handler that logs "ResizeObserver loop limit exceeded" errors.
 * These errors are not shown in the Chrome console, so we log them to ensure developers are aware.
 * @param e The error
 */
const loopLimitExceededErrorHandler = (e) => {
    if (e instanceof Error && e.message === 'ResizeObserver loop limit exceeded') {
        console.error(`${e.message}. This could indicate a performance issue with your app. See https://github.com/WICG/resize-observer/blob/master/explainer.md#error-handling`);
    }
};
/**
 * A shared ResizeObserver to be used for a particular box type (content-box, border-box, or
 * device-pixel-content-box)
 */
class SingleBoxSharedResizeObserver {
    constructor(
    /** The box type to observe for resizes. */
    _box) {
        this._box = _box;
        /** Stream that emits when the shared observer is destroyed. */
        this._destroyed = new Subject();
        /** Stream of all events from the ResizeObserver. */
        this._resizeSubject = new Subject();
        /** A map of elements to streams of their resize events. */
        this._elementObservables = new Map();
        if (typeof ResizeObserver !== 'undefined') {
            this._resizeObserver = new ResizeObserver(entries => this._resizeSubject.next(entries));
        }
    }
    /**
     * Gets a stream of resize events for the given element.
     * @param target The element to observe.
     * @return The stream of resize events for the element.
     */
    observe(target) {
        if (!this._elementObservables.has(target)) {
            this._elementObservables.set(target, new Observable(observer => {
                const subscription = this._resizeSubject.subscribe(observer);
                this._resizeObserver?.observe(target, { box: this._box });
                return () => {
                    this._resizeObserver?.unobserve(target);
                    subscription.unsubscribe();
                    this._elementObservables.delete(target);
                };
            }).pipe(filter(entries => entries.some(entry => entry.target === target)), 
            // Share a replay of the last event so that subsequent calls to observe the same element
            // receive initial sizing info like the first one. Also enable ref counting so the
            // element will be automatically unobserved when there are no more subscriptions.
            shareReplay({ bufferSize: 1, refCount: true }), takeUntil(this._destroyed)));
        }
        return this._elementObservables.get(target);
    }
    /** Destroys this instance. */
    destroy() {
        this._destroyed.next();
        this._destroyed.complete();
        this._resizeSubject.complete();
        this._elementObservables.clear();
    }
}
/**
 * Allows observing resize events on multiple elements using a shared set of ResizeObserver.
 * Sharing a ResizeObserver instance is recommended for better performance (see
 * https://github.com/WICG/resize-observer/issues/59).
 *
 * Rather than share a single `ResizeObserver`, this class creates one `ResizeObserver` per type
 * of observed box ('content-box', 'border-box', and 'device-pixel-content-box'). This avoids
 * later calls to `observe` with a different box type from influencing the events dispatched to
 * earlier calls.
 */
export class SharedResizeObserver {
    constructor() {
        /** Map of box type to shared resize observer. */
        this._observers = new Map();
        /** The Angular zone. */
        this._ngZone = inject(NgZone);
        if (typeof ResizeObserver !== 'undefined' && (typeof ngDevMode === 'undefined' || ngDevMode)) {
            this._ngZone.runOutsideAngular(() => {
                window.addEventListener('error', loopLimitExceededErrorHandler);
            });
        }
    }
    ngOnDestroy() {
        for (const [, observer] of this._observers) {
            observer.destroy();
        }
        this._observers.clear();
        if (typeof ResizeObserver !== 'undefined' && (typeof ngDevMode === 'undefined' || ngDevMode)) {
            window.removeEventListener('error', loopLimitExceededErrorHandler);
        }
    }
    /**
     * Gets a stream of resize events for the given target element and box type.
     * @param target The element to observe for resizes.
     * @param options Options to pass to the `ResizeObserver`
     * @return The stream of resize events for the element.
     */
    observe(target, options) {
        const box = options?.box || 'content-box';
        if (!this._observers.has(box)) {
            this._observers.set(box, new SingleBoxSharedResizeObserver(box));
        }
        return this._observers.get(box).observe(target);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.2.0", ngImport: i0, type: SharedResizeObserver, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "17.2.0", ngImport: i0, type: SharedResizeObserver, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.2.0", ngImport: i0, type: SharedResizeObserver, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root',
                }]
        }], ctorParameters: () => [] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hhcmVkLXJlc2l6ZS1vYnNlcnZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvb2JzZXJ2ZXJzL3ByaXZhdGUvc2hhcmVkLXJlc2l6ZS1vYnNlcnZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFDSCxPQUFPLEVBQUMsTUFBTSxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQVksTUFBTSxlQUFlLENBQUM7QUFDcEUsT0FBTyxFQUFDLFVBQVUsRUFBRSxPQUFPLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDekMsT0FBTyxFQUFDLE1BQU0sRUFBRSxXQUFXLEVBQUUsU0FBUyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7O0FBRTlEOzs7O0dBSUc7QUFDSCxNQUFNLDZCQUE2QixHQUFHLENBQUMsQ0FBVSxFQUFFLEVBQUU7SUFDbkQsSUFBSSxDQUFDLFlBQVksS0FBSyxJQUFJLENBQUMsQ0FBQyxPQUFPLEtBQUssb0NBQW9DLEVBQUUsQ0FBQztRQUM3RSxPQUFPLENBQUMsS0FBSyxDQUNYLEdBQUcsQ0FBQyxDQUFDLE9BQU8sOElBQThJLENBQzNKLENBQUM7SUFDSixDQUFDO0FBQ0gsQ0FBQyxDQUFDO0FBRUY7OztHQUdHO0FBQ0gsTUFBTSw2QkFBNkI7SUFVakM7SUFDRSwyQ0FBMkM7SUFDbkMsSUFBOEI7UUFBOUIsU0FBSSxHQUFKLElBQUksQ0FBMEI7UUFYeEMsK0RBQStEO1FBQ3ZELGVBQVUsR0FBRyxJQUFJLE9BQU8sRUFBUSxDQUFDO1FBQ3pDLG9EQUFvRDtRQUM1QyxtQkFBYyxHQUFHLElBQUksT0FBTyxFQUF5QixDQUFDO1FBRzlELDJEQUEyRDtRQUNuRCx3QkFBbUIsR0FBRyxJQUFJLEdBQUcsRUFBOEMsQ0FBQztRQU1sRixJQUFJLE9BQU8sY0FBYyxLQUFLLFdBQVcsRUFBRSxDQUFDO1lBQzFDLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxjQUFjLENBQUMsT0FB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O1lBQzdGLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLEVBQUUsNkJBQTZCLENBQUMsQ0FBQztRQUNyRSxDQUFDO0lBQ0gsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsT0FBTyxDQUFDLE1BQWUsRUFBRSxPQUErQjtRQUN0RCxNQUFNLEdBQUcsR0FBRyxPQUFPLEVBQUUsR0FBRyxJQUFJLGFBQWEsQ0FBQztRQUMxQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztZQUM5QixJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSw2QkFBNkIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ25FLENBQUM7UUFDRCxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBRSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNuRCxDQUFDOzhHQXJDVSxvQkFBb0I7a0hBQXBCLG9CQUFvQixjQUZuQixNQUFNOzsyRkFFUCxvQkFBb0I7a0JBSGhDLFVBQVU7bUJBQUM7b0JBQ1YsVUFBVSxFQUFFLE1BQU07aUJBQ25CIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge2luamVjdCwgSW5qZWN0YWJsZSwgTmdab25lLCBPbkRlc3Ryb3l9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtPYnNlcnZhYmxlLCBTdWJqZWN0fSBmcm9tICdyeGpzJztcbmltcG9ydCB7ZmlsdGVyLCBzaGFyZVJlcGxheSwgdGFrZVVudGlsfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbi8qKlxuICogSGFuZGxlciB0aGF0IGxvZ3MgXCJSZXNpemVPYnNlcnZlciBsb29wIGxpbWl0IGV4Y2VlZGVkXCIgZXJyb3JzLlxuICogVGhlc2UgZXJyb3JzIGFyZSBub3Qgc2hvd24gaW4gdGhlIENocm9tZSBjb25zb2xlLCBzbyB3ZSBsb2cgdGhlbSB0byBlbnN1cmUgZGV2ZWxvcGVycyBhcmUgYXdhcmUuXG4gKiBAcGFyYW0gZSBUaGUgZXJyb3JcbiAqL1xuY29uc3QgbG9vcExpbWl0RXhjZWVkZWRFcnJvckhhbmRsZXIgPSAoZTogdW5rbm93bikgPT4ge1xuICBpZiAoZSBpbnN0YW5jZW9mIEVycm9yICYmIGUubWVzc2FnZSA9PT0gJ1Jlc2l6ZU9ic2VydmVyIGxvb3AgbGltaXQgZXhjZWVkZWQnKSB7XG4gICAgY29uc29sZS5lcnJvcihcbiAgICAgIGAke2UubWVzc2FnZX0uIFRoaXMgY291bGQgaW5kaWNhdGUgYSBwZXJmb3JtYW5jZSBpc3N1ZSB3aXRoIHlvdXIgYXBwLiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL1dJQ0cvcmVzaXplLW9ic2VydmVyL2Jsb2IvbWFzdGVyL2V4cGxhaW5lci5tZCNlcnJvci1oYW5kbGluZ2AsXG4gICAgKTtcbiAgfVxufTtcblxuLyoqXG4gKiBBIHNoYXJlZCBSZXNpemVPYnNlcnZlciB0byBiZSB1c2VkIGZvciBhIHBhcnRpY3VsYXIgYm94IHR5cGUgKGNvbnRlbnQtYm94LCBib3JkZXItYm94LCBvclxuICogZGV2aWNlLXBpeGVsLWNvbnRlbnQtYm94KVxuICovXG5jbGFzcyBTaW5nbGVCb3hTaGFyZWRSZXNpemVPYnNlcnZlciB7XG4gIC8qKiBTdHJlYW0gdGhhdCBlbWl0cyB3aGVuIHRoZSBzaGFyZWQgb2JzZXJ2ZXIgaXMgZGVzdHJveWVkLiAqL1xuICBwcml2YXRlIF9kZXN0cm95ZWQgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xuICAvKiogU3RyZWFtIG9mIGFsbCBldmVudHMgZnJvbSB0aGUgUmVzaXplT2JzZXJ2ZXIuICovXG4gIHByaXZhdGUgX3Jlc2l6ZVN1YmplY3QgPSBuZXcgU3ViamVjdDxSZXNpemVPYnNlcnZlckVudHJ5W10+KCk7XG4gIC8qKiBSZXNpemVPYnNlcnZlciB1c2VkIHRvIG9ic2VydmUgZWxlbWVudCByZXNpemUgZXZlbnRzLiAqL1xuICBwcml2YXRlIF9yZXNpemVPYnNlcnZlcj86IFJlc2l6ZU9ic2VydmVyO1xuICAvKiogQSBtYXAgb2YgZWxlbWVudHMgdG8gc3RyZWFtcyBvZiB0aGVpciByZXNpemUgZXZlbnRzLiAqL1xuICBwcml2YXRlIF9lbGVtZW50T2JzZXJ2YWJsZXMgPSBuZXcgTWFwPEVsZW1lbnQsIE9ic2VydmFibGU8UmVzaXplT2JzZXJ2ZXJFbnRyeVtdPj4oKTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAvKiogVGhlIGJveCB0eXBlIHRvIG9ic2VydmUgZm9yIHJlc2l6ZXMuICovXG4gICAgcHJpdmF0ZSBfYm94OiBSZXNpemVPYnNlcnZlckJveE9wdGlvbnMsXG4gICkge1xuICAgIGlmICh0eXBlb2YgUmVzaXplT2JzZXJ2ZXIgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aGlzLl9yZXNpemVPYnNlcnZlciA9IG5ldyBSZXNpemVPYnNlcnZlcihlbnRyaWVzID0+IHRoaXMuX3Jlc2l6ZVN1YmplY3QubmV4dChlbnRyaWVzKSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgYSBzdHJlYW0gb2YgcmVzaXplIGV2ZW50cyBmb3IgdGhlIGdpdmVuIGVsZW1lbnQuXG4gICAqIEBwYXJhbSB0YXJnZXQgVGhlIGVsZW1lbnQgdG8gb2JzZXJ2ZS5cbiAgICogQHJldHVybiBUaGUgc3RyZWFtIG9mIHJlc2l6ZSBldmVudHMgZm9yIHRoZSBlbGVtZW50LlxuICAgKi9cbiAgb2JzZXJ2ZSh0YXJnZXQ6IEVsZW1lbnQpOiBPYnNlcnZhYmxlPFJlc2l6ZU9ic2VydmVyRW50cnlbXT4ge1xuICAgIGlmICghdGhpcy5fZWxlbWVudE9ic2VydmFibGVzLmhhcyh0YXJnZXQpKSB7XG4gICAgICB0aGlzLl9lbGVtZW50T2JzZXJ2YWJsZXMuc2V0KFxuICAgICAgICB0YXJnZXQsXG4gICAgICAgIG5ldyBPYnNlcnZhYmxlPFJlc2l6ZU9ic2VydmVyRW50cnlbXT4ob2JzZXJ2ZXIgPT4ge1xuICAgICAgICAgIGNvbnN0IHN1YnNjcmlwdGlvbiA9IHRoaXMuX3Jlc2l6ZVN1YmplY3Quc3Vic2NyaWJlKG9ic2VydmVyKTtcbiAgICAgICAgICB0aGlzLl9yZXNpemVPYnNlcnZlcj8ub2JzZXJ2ZSh0YXJnZXQsIHtib3g6IHRoaXMuX2JveH0pO1xuICAgICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLl9yZXNpemVPYnNlcnZlcj8udW5vYnNlcnZlKHRhcmdldCk7XG4gICAgICAgICAgICBzdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcbiAgICAgICAgICAgIHRoaXMuX2VsZW1lbnRPYnNlcnZhYmxlcy5kZWxldGUodGFyZ2V0KTtcbiAgICAgICAgICB9O1xuICAgICAgICB9KS5waXBlKFxuICAgICAgICAgIGZpbHRlcihlbnRyaWVzID0+IGVudHJpZXMuc29tZShlbnRyeSA9PiBlbnRyeS50YXJnZXQgPT09IHRhcmdldCkpLFxuICAgICAgICAgIC8vIFNoYXJlIGEgcmVwbGF5IG9mIHRoZSBsYXN0IGV2ZW50IHNvIHRoYXQgc3Vic2VxdWVudCBjYWxscyB0byBvYnNlcnZlIHRoZSBzYW1lIGVsZW1lbnRcbiAgICAgICAgICAvLyByZWNlaXZlIGluaXRpYWwgc2l6aW5nIGluZm8gbGlrZSB0aGUgZmlyc3Qgb25lLiBBbHNvIGVuYWJsZSByZWYgY291bnRpbmcgc28gdGhlXG4gICAgICAgICAgLy8gZWxlbWVudCB3aWxsIGJlIGF1dG9tYXRpY2FsbHkgdW5vYnNlcnZlZCB3aGVuIHRoZXJlIGFyZSBubyBtb3JlIHN1YnNjcmlwdGlvbnMuXG4gICAgICAgICAgc2hhcmVSZXBsYXkoe2J1ZmZlclNpemU6IDEsIHJlZkNvdW50OiB0cnVlfSksXG4gICAgICAgICAgdGFrZVVudGlsKHRoaXMuX2Rlc3Ryb3llZCksXG4gICAgICAgICksXG4gICAgICApO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fZWxlbWVudE9ic2VydmFibGVzLmdldCh0YXJnZXQpITtcbiAgfVxuXG4gIC8qKiBEZXN0cm95cyB0aGlzIGluc3RhbmNlLiAqL1xuICBkZXN0cm95KCkge1xuICAgIHRoaXMuX2Rlc3Ryb3llZC5uZXh0KCk7XG4gICAgdGhpcy5fZGVzdHJveWVkLmNvbXBsZXRlKCk7XG4gICAgdGhpcy5fcmVzaXplU3ViamVjdC5jb21wbGV0ZSgpO1xuICAgIHRoaXMuX2VsZW1lbnRPYnNlcnZhYmxlcy5jbGVhcigpO1xuICB9XG59XG5cbi8qKlxuICogQWxsb3dzIG9ic2VydmluZyByZXNpemUgZXZlbnRzIG9uIG11bHRpcGxlIGVsZW1lbnRzIHVzaW5nIGEgc2hhcmVkIHNldCBvZiBSZXNpemVPYnNlcnZlci5cbiAqIFNoYXJpbmcgYSBSZXNpemVPYnNlcnZlciBpbnN0YW5jZSBpcyByZWNvbW1lbmRlZCBmb3IgYmV0dGVyIHBlcmZvcm1hbmNlIChzZWVcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9XSUNHL3Jlc2l6ZS1vYnNlcnZlci9pc3N1ZXMvNTkpLlxuICpcbiAqIFJhdGhlciB0aGFuIHNoYXJlIGEgc2luZ2xlIGBSZXNpemVPYnNlcnZlcmAsIHRoaXMgY2xhc3MgY3JlYXRlcyBvbmUgYFJlc2l6ZU9ic2VydmVyYCBwZXIgdHlwZVxuICogb2Ygb2JzZXJ2ZWQgYm94ICgnY29udGVudC1ib3gnLCAnYm9yZGVyLWJveCcsIGFuZCAnZGV2aWNlLXBpeGVsLWNvbnRlbnQtYm94JykuIFRoaXMgYXZvaWRzXG4gKiBsYXRlciBjYWxscyB0byBgb2JzZXJ2ZWAgd2l0aCBhIGRpZmZlcmVudCBib3ggdHlwZSBmcm9tIGluZmx1ZW5jaW5nIHRoZSBldmVudHMgZGlzcGF0Y2hlZCB0b1xuICogZWFybGllciBjYWxscy5cbiAqL1xuQEluamVjdGFibGUoe1xuICBwcm92aWRlZEluOiAncm9vdCcsXG59KVxuZXhwb3J0IGNsYXNzIFNoYXJlZFJlc2l6ZU9ic2VydmVyIGltcGxlbWVudHMgT25EZXN0cm95IHtcbiAgLyoqIE1hcCBvZiBib3ggdHlwZSB0byBzaGFyZWQgcmVzaXplIG9ic2VydmVyLiAqL1xuICBwcml2YXRlIF9vYnNlcnZlcnMgPSBuZXcgTWFwPFJlc2l6ZU9ic2VydmVyQm94T3B0aW9ucywgU2luZ2xlQm94U2hhcmVkUmVzaXplT2JzZXJ2ZXI+KCk7XG5cbiAgLyoqIFRoZSBBbmd1bGFyIHpvbmUuICovXG4gIHByaXZhdGUgX25nWm9uZSA9IGluamVjdChOZ1pvbmUpO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIGlmICh0eXBlb2YgUmVzaXplT2JzZXJ2ZXIgIT09ICd1bmRlZmluZWQnICYmICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpKSB7XG4gICAgICB0aGlzLl9uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCBsb29wTGltaXRFeGNlZWRlZEVycm9ySGFuZGxlcik7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICBmb3IgKGNvbnN0IFssIG9ic2VydmVyXSBvZiB0aGlzLl9vYnNlcnZlcnMpIHtcbiAgICAgIG9ic2VydmVyLmRlc3Ryb3koKTtcbiAgICB9XG4gICAgdGhpcy5fb2JzZXJ2ZXJzLmNsZWFyKCk7XG4gICAgaWYgKHR5cGVvZiBSZXNpemVPYnNlcnZlciAhPT0gJ3VuZGVmaW5lZCcgJiYgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkpIHtcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdlcnJvcicsIGxvb3BMaW1pdEV4Y2VlZGVkRXJyb3JIYW5kbGVyKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2V0cyBhIHN0cmVhbSBvZiByZXNpemUgZXZlbnRzIGZvciB0aGUgZ2l2ZW4gdGFyZ2V0IGVsZW1lbnQgYW5kIGJveCB0eXBlLlxuICAgKiBAcGFyYW0gdGFyZ2V0IFRoZSBlbGVtZW50IHRvIG9ic2VydmUgZm9yIHJlc2l6ZXMuXG4gICAqIEBwYXJhbSBvcHRpb25zIE9wdGlvbnMgdG8gcGFzcyB0byB0aGUgYFJlc2l6ZU9ic2VydmVyYFxuICAgKiBAcmV0dXJuIFRoZSBzdHJlYW0gb2YgcmVzaXplIGV2ZW50cyBmb3IgdGhlIGVsZW1lbnQuXG4gICAqL1xuICBvYnNlcnZlKHRhcmdldDogRWxlbWVudCwgb3B0aW9ucz86IFJlc2l6ZU9ic2VydmVyT3B0aW9ucyk6IE9ic2VydmFibGU8UmVzaXplT2JzZXJ2ZXJFbnRyeVtdPiB7XG4gICAgY29uc3QgYm94ID0gb3B0aW9ucz8uYm94IHx8ICdjb250ZW50LWJveCc7XG4gICAgaWYgKCF0aGlzLl9vYnNlcnZlcnMuaGFzKGJveCkpIHtcbiAgICAgIHRoaXMuX29ic2VydmVycy5zZXQoYm94LCBuZXcgU2luZ2xlQm94U2hhcmVkUmVzaXplT2JzZXJ2ZXIoYm94KSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9vYnNlcnZlcnMuZ2V0KGJveCkhLm9ic2VydmUodGFyZ2V0KTtcbiAgfVxufVxuIl19