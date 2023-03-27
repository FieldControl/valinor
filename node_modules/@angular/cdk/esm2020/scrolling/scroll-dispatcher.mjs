/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { coerceElement } from '@angular/cdk/coercion';
import { Platform } from '@angular/cdk/platform';
import { Injectable, NgZone, Optional, Inject } from '@angular/core';
import { fromEvent, of as observableOf, Subject, Observable } from 'rxjs';
import { auditTime, filter } from 'rxjs/operators';
import { DOCUMENT } from '@angular/common';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/platform";
/** Time in ms to throttle the scrolling events by default. */
export const DEFAULT_SCROLL_TIME = 20;
/**
 * Service contained all registered Scrollable references and emits an event when any one of the
 * Scrollable references emit a scrolled event.
 */
export class ScrollDispatcher {
    constructor(_ngZone, _platform, document) {
        this._ngZone = _ngZone;
        this._platform = _platform;
        /** Subject for notifying that a registered scrollable reference element has been scrolled. */
        this._scrolled = new Subject();
        /** Keeps track of the global `scroll` and `resize` subscriptions. */
        this._globalSubscription = null;
        /** Keeps track of the amount of subscriptions to `scrolled`. Used for cleaning up afterwards. */
        this._scrolledCount = 0;
        /**
         * Map of all the scrollable references that are registered with the service and their
         * scroll event subscriptions.
         */
        this.scrollContainers = new Map();
        this._document = document;
    }
    /**
     * Registers a scrollable instance with the service and listens for its scrolled events. When the
     * scrollable is scrolled, the service emits the event to its scrolled observable.
     * @param scrollable Scrollable instance to be registered.
     */
    register(scrollable) {
        if (!this.scrollContainers.has(scrollable)) {
            this.scrollContainers.set(scrollable, scrollable.elementScrolled().subscribe(() => this._scrolled.next(scrollable)));
        }
    }
    /**
     * De-registers a Scrollable reference and unsubscribes from its scroll event observable.
     * @param scrollable Scrollable instance to be deregistered.
     */
    deregister(scrollable) {
        const scrollableReference = this.scrollContainers.get(scrollable);
        if (scrollableReference) {
            scrollableReference.unsubscribe();
            this.scrollContainers.delete(scrollable);
        }
    }
    /**
     * Returns an observable that emits an event whenever any of the registered Scrollable
     * references (or window, document, or body) fire a scrolled event. Can provide a time in ms
     * to override the default "throttle" time.
     *
     * **Note:** in order to avoid hitting change detection for every scroll event,
     * all of the events emitted from this stream will be run outside the Angular zone.
     * If you need to update any data bindings as a result of a scroll event, you have
     * to run the callback using `NgZone.run`.
     */
    scrolled(auditTimeInMs = DEFAULT_SCROLL_TIME) {
        if (!this._platform.isBrowser) {
            return observableOf();
        }
        return new Observable((observer) => {
            if (!this._globalSubscription) {
                this._addGlobalListener();
            }
            // In the case of a 0ms delay, use an observable without auditTime
            // since it does add a perceptible delay in processing overhead.
            const subscription = auditTimeInMs > 0
                ? this._scrolled.pipe(auditTime(auditTimeInMs)).subscribe(observer)
                : this._scrolled.subscribe(observer);
            this._scrolledCount++;
            return () => {
                subscription.unsubscribe();
                this._scrolledCount--;
                if (!this._scrolledCount) {
                    this._removeGlobalListener();
                }
            };
        });
    }
    ngOnDestroy() {
        this._removeGlobalListener();
        this.scrollContainers.forEach((_, container) => this.deregister(container));
        this._scrolled.complete();
    }
    /**
     * Returns an observable that emits whenever any of the
     * scrollable ancestors of an element are scrolled.
     * @param elementOrElementRef Element whose ancestors to listen for.
     * @param auditTimeInMs Time to throttle the scroll events.
     */
    ancestorScrolled(elementOrElementRef, auditTimeInMs) {
        const ancestors = this.getAncestorScrollContainers(elementOrElementRef);
        return this.scrolled(auditTimeInMs).pipe(filter(target => {
            return !target || ancestors.indexOf(target) > -1;
        }));
    }
    /** Returns all registered Scrollables that contain the provided element. */
    getAncestorScrollContainers(elementOrElementRef) {
        const scrollingContainers = [];
        this.scrollContainers.forEach((_subscription, scrollable) => {
            if (this._scrollableContainsElement(scrollable, elementOrElementRef)) {
                scrollingContainers.push(scrollable);
            }
        });
        return scrollingContainers;
    }
    /** Use defaultView of injected document if available or fallback to global window reference */
    _getWindow() {
        return this._document.defaultView || window;
    }
    /** Returns true if the element is contained within the provided Scrollable. */
    _scrollableContainsElement(scrollable, elementOrElementRef) {
        let element = coerceElement(elementOrElementRef);
        let scrollableElement = scrollable.getElementRef().nativeElement;
        // Traverse through the element parents until we reach null, checking if any of the elements
        // are the scrollable's element.
        do {
            if (element == scrollableElement) {
                return true;
            }
        } while ((element = element.parentElement));
        return false;
    }
    /** Sets up the global scroll listeners. */
    _addGlobalListener() {
        this._globalSubscription = this._ngZone.runOutsideAngular(() => {
            const window = this._getWindow();
            return fromEvent(window.document, 'scroll').subscribe(() => this._scrolled.next());
        });
    }
    /** Cleans up the global scroll listener. */
    _removeGlobalListener() {
        if (this._globalSubscription) {
            this._globalSubscription.unsubscribe();
            this._globalSubscription = null;
        }
    }
}
ScrollDispatcher.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: ScrollDispatcher, deps: [{ token: i0.NgZone }, { token: i1.Platform }, { token: DOCUMENT, optional: true }], target: i0.ɵɵFactoryTarget.Injectable });
ScrollDispatcher.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: ScrollDispatcher, providedIn: 'root' });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: ScrollDispatcher, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: function () { return [{ type: i0.NgZone }, { type: i1.Platform }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [DOCUMENT]
                }] }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2Nyb2xsLWRpc3BhdGNoZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL3Njcm9sbGluZy9zY3JvbGwtZGlzcGF0Y2hlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsYUFBYSxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDcEQsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQy9DLE9BQU8sRUFBYSxVQUFVLEVBQUUsTUFBTSxFQUFhLFFBQVEsRUFBRSxNQUFNLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDMUYsT0FBTyxFQUFDLFNBQVMsRUFBRSxFQUFFLElBQUksWUFBWSxFQUFFLE9BQU8sRUFBZ0IsVUFBVSxFQUFXLE1BQU0sTUFBTSxDQUFDO0FBQ2hHLE9BQU8sRUFBQyxTQUFTLEVBQUUsTUFBTSxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFFakQsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGlCQUFpQixDQUFDOzs7QUFFekMsOERBQThEO0FBQzlELE1BQU0sQ0FBQyxNQUFNLG1CQUFtQixHQUFHLEVBQUUsQ0FBQztBQUV0Qzs7O0dBR0c7QUFFSCxNQUFNLE9BQU8sZ0JBQWdCO0lBSTNCLFlBQ1UsT0FBZSxFQUNmLFNBQW1CLEVBQ0csUUFBYTtRQUZuQyxZQUFPLEdBQVAsT0FBTyxDQUFRO1FBQ2YsY0FBUyxHQUFULFNBQVMsQ0FBVTtRQU03Qiw4RkFBOEY7UUFDN0UsY0FBUyxHQUFHLElBQUksT0FBTyxFQUF3QixDQUFDO1FBRWpFLHFFQUFxRTtRQUNyRSx3QkFBbUIsR0FBd0IsSUFBSSxDQUFDO1FBRWhELGlHQUFpRztRQUN6RixtQkFBYyxHQUFHLENBQUMsQ0FBQztRQUUzQjs7O1dBR0c7UUFDSCxxQkFBZ0IsR0FBcUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQWhCN0QsSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENB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RSxDQUFDLENBQUM7UUFDckYsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQsNENBQTRDO0lBQ3BDLHFCQUFxQjtRQUMzQixJQUFJLElBQUksQ0FBQyxtQkFBbUIsRUFBRTtZQUM1QixJQUFJLENBQUMsbUJBQW1CLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDdkMsSUFBSSxDQUFDLG1CQUFtQixHQUFHLElBQUksQ0FBQztTQUNqQztJQUNILENBQUM7O2tIQTFLVSxnQkFBZ0IsZ0VBT0wsUUFBUTtzSEFQbkIsZ0JBQWdCLGNBREosTUFBTTtnR0FDbEIsZ0JBQWdCO2tCQUQ1QixVQUFVO21CQUFDLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBQzs7MEJBUTNCLFFBQVE7OzBCQUFJLE1BQU07MkJBQUMsUUFBUSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2NvZXJjZUVsZW1lbnR9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2VyY2lvbic7XG5pbXBvcnQge1BsYXRmb3JtfSBmcm9tICdAYW5ndWxhci9jZGsvcGxhdGZvcm0nO1xuaW1wb3J0IHtFbGVtZW50UmVmLCBJbmplY3RhYmxlLCBOZ1pvbmUsIE9uRGVzdHJveSwgT3B0aW9uYWwsIEluamVjdH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge2Zyb21FdmVudCwgb2YgYXMgb2JzZXJ2YWJsZU9mLCBTdWJqZWN0LCBTdWJzY3JpcHRpb24sIE9ic2VydmFibGUsIE9ic2VydmVyfSBmcm9tICdyeGpzJztcbmltcG9ydCB7YXVkaXRUaW1lLCBmaWx0ZXJ9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7Q2RrU2Nyb2xsYWJsZX0gZnJvbSAnLi9zY3JvbGxhYmxlJztcbmltcG9ydCB7RE9DVU1FTlR9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5cbi8qKiBUaW1lIGluIG1zIHRvIHRocm90dGxlIHRoZSBzY3JvbGxpbmcgZXZlbnRzIGJ5IGRlZmF1bHQuICovXG5leHBvcnQgY29uc3QgREVGQVVMVF9TQ1JPTExfVElNRSA9IDIwO1xuXG4vKipcbiAqIFNlcnZpY2UgY29udGFpbmVkIGFsbCByZWdpc3RlcmVkIFNjcm9sbGFibGUgcmVmZXJlbmNlcyBhbmQgZW1pdHMgYW4gZXZlbnQgd2hlbiBhbnkgb25lIG9mIHRoZVxuICogU2Nyb2xsYWJsZSByZWZlcmVuY2VzIGVtaXQgYSBzY3JvbGxlZCBldmVudC5cbiAqL1xuQEluamVjdGFibGUoe3Byb3ZpZGVkSW46ICdyb290J30pXG5leHBvcnQgY2xhc3MgU2Nyb2xsRGlzcGF0Y2hlciBpbXBsZW1lbnRzIE9uRGVzdHJveSB7XG4gIC8qKiBVc2VkIHRvIHJlZmVyZW5jZSBjb3JyZWN0IGRvY3VtZW50L3dpbmRvdyAqL1xuICBwcm90ZWN0ZWQgX2RvY3VtZW50OiBEb2N1bWVudDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIF9uZ1pvbmU6IE5nWm9uZSxcbiAgICBwcml2YXRlIF9wbGF0Zm9ybTogUGxhdGZvcm0sXG4gICAgQE9wdGlvbmFsKCkgQEluamVjdChET0NVTUVOVCkgZG9jdW1lbnQ6IGFueSxcbiAgKSB7XG4gICAgdGhpcy5fZG9jdW1lbnQgPSBkb2N1bWVudDtcbiAgfVxuXG4gIC8qKiBTdWJqZWN0IGZvciBub3RpZnlpbmcgdGhhdCBhIHJlZ2lzdGVyZWQgc2Nyb2xsYWJsZSByZWZlcmVuY2UgZWxlbWVudCBoYXMgYmVlbiBzY3JvbGxlZC4gKi9cbiAgcHJpdmF0ZSByZWFkb25seSBfc2Nyb2xsZWQgPSBuZXcgU3ViamVjdDxDZGtTY3JvbGxhYmxlIHwgdm9pZD4oKTtcblxuICAvKiogS2VlcHMgdHJhY2sgb2YgdGhlIGdsb2JhbCBgc2Nyb2xsYCBhbmQgYHJlc2l6ZWAgc3Vic2NyaXB0aW9ucy4gKi9cbiAgX2dsb2JhbFN1YnNjcmlwdGlvbjogU3Vic2NyaXB0aW9uIHwgbnVsbCA9IG51bGw7XG5cbiAgLyoqIEtlZXBzIHRyYWNrIG9mIHRoZSBhbW91bnQgb2Ygc3Vic2NyaXB0aW9ucyB0byBgc2Nyb2xsZWRgLiBVc2VkIGZvciBjbGVhbmluZyB1cCBhZnRlcndhcmRzLiAqL1xuICBwcml2YXRlIF9zY3JvbGxlZENvdW50ID0gMDtcblxuICAvKipcbiAgICogTWFwIG9mIGFsbCB0aGUgc2Nyb2xsYWJsZSByZWZlcmVuY2VzIHRoYXQgYXJlIHJlZ2lzdGVyZWQgd2l0aCB0aGUgc2VydmljZSBhbmQgdGhlaXJcbiAgICogc2Nyb2xsIGV2ZW50IHN1YnNjcmlwdGlvbnMuXG4gICAqL1xuICBzY3JvbGxDb250YWluZXJzOiBNYXA8Q2RrU2Nyb2xsYWJsZSwgU3Vic2NyaXB0aW9uPiA9IG5ldyBNYXAoKTtcblxuICAvKipcbiAgICogUmVnaXN0ZXJzIGEgc2Nyb2xsYWJsZSBpbnN0YW5jZSB3aXRoIHRoZSBzZXJ2aWNlIGFuZCBsaXN0ZW5zIGZvciBpdHMgc2Nyb2xsZWQgZXZlbnRzLiBXaGVuIHRoZVxuICAgKiBzY3JvbGxhYmxlIGlzIHNjcm9sbGVkLCB0aGUgc2VydmljZSBlbWl0cyB0aGUgZXZlbnQgdG8gaXRzIHNjcm9sbGVkIG9ic2VydmFibGUuXG4gICAqIEBwYXJhbSBzY3JvbGxhYmxlIFNjcm9sbGFibGUgaW5zdGFuY2UgdG8gYmUgcmVnaXN0ZXJlZC5cbiAgICovXG4gIHJlZ2lzdGVyKHNjcm9sbGFibGU6IENka1Njcm9sbGFibGUpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuc2Nyb2xsQ29udGFpbmVycy5oYXMoc2Nyb2xsYWJsZSkpIHtcbiAgICAgIHRoaXMuc2Nyb2xsQ29udGFpbmVycy5zZXQoXG4gICAgICAgIHNjcm9sbGFibGUsXG4gICAgICAgIHNjcm9sbGFibGUuZWxlbWVudFNjcm9sbGVkKCkuc3Vic2NyaWJlKCgpID0+IHRoaXMuX3Njcm9sbGVkLm5leHQoc2Nyb2xsYWJsZSkpLFxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRGUtcmVnaXN0ZXJzIGEgU2Nyb2xsYWJsZSByZWZlcmVuY2UgYW5kIHVuc3Vic2NyaWJlcyBmcm9tIGl0cyBzY3JvbGwgZXZlbnQgb2JzZXJ2YWJsZS5cbiAgICogQHBhcmFtIHNjcm9sbGFibGUgU2Nyb2xsYWJsZSBpbnN0YW5jZSB0byBiZSBkZXJlZ2lzdGVyZWQuXG4gICAqL1xuICBkZXJlZ2lzdGVyKHNjcm9sbGFibGU6IENka1Njcm9sbGFibGUpOiB2b2lkIHtcbiAgICBjb25zdCBzY3JvbGxhYmxlUmVmZXJlbmNlID0gdGhpcy5zY3JvbGxDb250YWluZXJzLmdldChzY3JvbGxhYmxlKTtcblxuICAgIGlmIChzY3JvbGxhYmxlUmVmZXJlbmNlKSB7XG4gICAgICBzY3JvbGxhYmxlUmVmZXJlbmNlLnVuc3Vic2NyaWJlKCk7XG4gICAgICB0aGlzLnNjcm9sbENvbnRhaW5lcnMuZGVsZXRlKHNjcm9sbGFibGUpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIG9ic2VydmFibGUgdGhhdCBlbWl0cyBhbiBldmVudCB3aGVuZXZlciBhbnkgb2YgdGhlIHJlZ2lzdGVyZWQgU2Nyb2xsYWJsZVxuICAgKiByZWZlcmVuY2VzIChvciB3aW5kb3csIGRvY3VtZW50LCBvciBib2R5KSBmaXJlIGEgc2Nyb2xsZWQgZXZlbnQuIENhbiBwcm92aWRlIGEgdGltZSBpbiBtc1xuICAgKiB0byBvdmVycmlkZSB0aGUgZGVmYXVsdCBcInRocm90dGxlXCIgdGltZS5cbiAgICpcbiAgICogKipOb3RlOioqIGluIG9yZGVyIHRvIGF2b2lkIGhpdHRpbmcgY2hhbmdlIGRldGVjdGlvbiBmb3IgZXZlcnkgc2Nyb2xsIGV2ZW50LFxuICAgKiBhbGwgb2YgdGhlIGV2ZW50cyBlbWl0dGVkIGZyb20gdGhpcyBzdHJlYW0gd2lsbCBiZSBydW4gb3V0c2lkZSB0aGUgQW5ndWxhciB6b25lLlxuICAgKiBJZiB5b3UgbmVlZCB0byB1cGRhdGUgYW55IGRhdGEgYmluZGluZ3MgYXMgYSByZXN1bHQgb2YgYSBzY3JvbGwgZXZlbnQsIHlvdSBoYXZlXG4gICAqIHRvIHJ1biB0aGUgY2FsbGJhY2sgdXNpbmcgYE5nWm9uZS5ydW5gLlxuICAgKi9cbiAgc2Nyb2xsZWQoYXVkaXRUaW1lSW5NczogbnVtYmVyID0gREVGQVVMVF9TQ1JPTExfVElNRSk6IE9ic2VydmFibGU8Q2RrU2Nyb2xsYWJsZSB8IHZvaWQ+IHtcbiAgICBpZiAoIXRoaXMuX3BsYXRmb3JtLmlzQnJvd3Nlcikge1xuICAgICAgcmV0dXJuIG9ic2VydmFibGVPZjx2b2lkPigpO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgT2JzZXJ2YWJsZSgob2JzZXJ2ZXI6IE9ic2VydmVyPENka1Njcm9sbGFibGUgfCB2b2lkPikgPT4ge1xuICAgICAgaWYgKCF0aGlzLl9nbG9iYWxTdWJzY3JpcHRpb24pIHtcbiAgICAgICAgdGhpcy5fYWRkR2xvYmFsTGlzdGVuZXIoKTtcbiAgICAgIH1cblxuICAgICAgLy8gSW4gdGhlIGNhc2Ugb2YgYSAwbXMgZGVsYXksIHVzZSBhbiBvYnNlcnZhYmxlIHdpdGhvdXQgYXVkaXRUaW1lXG4gICAgICAvLyBzaW5jZSBpdCBkb2VzIGFkZCBhIHBlcmNlcHRpYmxlIGRlbGF5IGluIHByb2Nlc3Npbmcgb3ZlcmhlYWQuXG4gICAgICBjb25zdCBzdWJzY3JpcHRpb24gPVxuICAgICAgICBhdWRpdFRpbWVJbk1zID4gMFxuICAgICAgICAgID8gdGhpcy5fc2Nyb2xsZWQucGlwZShhdWRpdFRpbWUoYXVkaXRUaW1lSW5NcykpLnN1YnNjcmliZShvYnNlcnZlcilcbiAgICAgICAgICA6IHRoaXMuX3Njcm9sbGVkLnN1YnNjcmliZShvYnNlcnZlcik7XG5cbiAgICAgIHRoaXMuX3Njcm9sbGVkQ291bnQrKztcblxuICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgc3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG4gICAgICAgIHRoaXMuX3Njcm9sbGVkQ291bnQtLTtcblxuICAgICAgICBpZiAoIXRoaXMuX3Njcm9sbGVkQ291bnQpIHtcbiAgICAgICAgICB0aGlzLl9yZW1vdmVHbG9iYWxMaXN0ZW5lcigpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH0pO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdGhpcy5fcmVtb3ZlR2xvYmFsTGlzdGVuZXIoKTtcbiAgICB0aGlzLnNjcm9sbENvbnRhaW5lcnMuZm9yRWFjaCgoXywgY29udGFpbmVyKSA9PiB0aGlzLmRlcmVnaXN0ZXIoY29udGFpbmVyKSk7XG4gICAgdGhpcy5fc2Nyb2xsZWQuY29tcGxldGUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIG9ic2VydmFibGUgdGhhdCBlbWl0cyB3aGVuZXZlciBhbnkgb2YgdGhlXG4gICAqIHNjcm9sbGFibGUgYW5jZXN0b3JzIG9mIGFuIGVsZW1lbnQgYXJlIHNjcm9sbGVkLlxuICAgKiBAcGFyYW0gZWxlbWVudE9yRWxlbWVudFJlZiBFbGVtZW50IHdob3NlIGFuY2VzdG9ycyB0byBsaXN0ZW4gZm9yLlxuICAgKiBAcGFyYW0gYXVkaXRUaW1lSW5NcyBUaW1lIHRvIHRocm90dGxlIHRoZSBzY3JvbGwgZXZlbnRzLlxuICAgKi9cbiAgYW5jZXN0b3JTY3JvbGxlZChcbiAgICBlbGVtZW50T3JFbGVtZW50UmVmOiBFbGVtZW50UmVmIHwgSFRNTEVsZW1lbnQsXG4gICAgYXVkaXRUaW1lSW5Ncz86IG51bWJlcixcbiAgKTogT2JzZXJ2YWJsZTxDZGtTY3JvbGxhYmxlIHwgdm9pZD4ge1xuICAgIGNvbnN0IGFuY2VzdG9ycyA9IHRoaXMuZ2V0QW5jZXN0b3JTY3JvbGxDb250YWluZXJzKGVsZW1lbnRPckVsZW1lbnRSZWYpO1xuXG4gICAgcmV0dXJuIHRoaXMuc2Nyb2xsZWQoYXVkaXRUaW1lSW5NcykucGlwZShcbiAgICAgIGZpbHRlcih0YXJnZXQgPT4ge1xuICAgICAgICByZXR1cm4gIXRhcmdldCB8fCBhbmNlc3RvcnMuaW5kZXhPZih0YXJnZXQpID4gLTE7XG4gICAgICB9KSxcbiAgICApO1xuICB9XG5cbiAgLyoqIFJldHVybnMgYWxsIHJlZ2lzdGVyZWQgU2Nyb2xsYWJsZXMgdGhhdCBjb250YWluIHRoZSBwcm92aWRlZCBlbGVtZW50LiAqL1xuICBnZXRBbmNlc3RvclNjcm9sbENvbnRhaW5lcnMoZWxlbWVudE9yRWxlbWVudFJlZjogRWxlbWVudFJlZiB8IEhUTUxFbGVtZW50KTogQ2RrU2Nyb2xsYWJsZVtdIHtcbiAgICBjb25zdCBzY3JvbGxpbmdDb250YWluZXJzOiBDZGtTY3JvbGxhYmxlW10gPSBbXTtcblxuICAgIHRoaXMuc2Nyb2xsQ29udGFpbmVycy5mb3JFYWNoKChfc3Vic2NyaXB0aW9uOiBTdWJzY3JpcHRpb24sIHNjcm9sbGFibGU6IENka1Njcm9sbGFibGUpID0+IHtcbiAgICAgIGlmICh0aGlzLl9zY3JvbGxhYmxlQ29udGFpbnNFbGVtZW50KHNjcm9sbGFibGUsIGVsZW1lbnRPckVsZW1lbnRSZWYpKSB7XG4gICAgICAgIHNjcm9sbGluZ0NvbnRhaW5lcnMucHVzaChzY3JvbGxhYmxlKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBzY3JvbGxpbmdDb250YWluZXJzO1xuICB9XG5cbiAgLyoqIFVzZSBkZWZhdWx0VmlldyBvZiBpbmplY3RlZCBkb2N1bWVudCBpZiBhdmFpbGFibGUgb3IgZmFsbGJhY2sgdG8gZ2xvYmFsIHdpbmRvdyByZWZlcmVuY2UgKi9cbiAgcHJpdmF0ZSBfZ2V0V2luZG93KCk6IFdpbmRvdyB7XG4gICAgcmV0dXJuIHRoaXMuX2RvY3VtZW50LmRlZmF1bHRWaWV3IHx8IHdpbmRvdztcbiAgfVxuXG4gIC8qKiBSZXR1cm5zIHRydWUgaWYgdGhlIGVsZW1lbnQgaXMgY29udGFpbmVkIHdpdGhpbiB0aGUgcHJvdmlkZWQgU2Nyb2xsYWJsZS4gKi9cbiAgcHJpdmF0ZSBfc2Nyb2xsYWJsZUNvbnRhaW5zRWxlbWVudChcbiAgICBzY3JvbGxhYmxlOiBDZGtTY3JvbGxhYmxlLFxuICAgIGVsZW1lbnRPckVsZW1lbnRSZWY6IEVsZW1lbnRSZWYgfCBIVE1MRWxlbWVudCxcbiAgKTogYm9vbGVhbiB7XG4gICAgbGV0IGVsZW1lbnQ6IEhUTUxFbGVtZW50IHwgbnVsbCA9IGNvZXJjZUVsZW1lbnQoZWxlbWVudE9yRWxlbWVudFJlZik7XG4gICAgbGV0IHNjcm9sbGFibGVFbGVtZW50ID0gc2Nyb2xsYWJsZS5nZXRFbGVtZW50UmVmKCkubmF0aXZlRWxlbWVudDtcblxuICAgIC8vIFRyYXZlcnNlIHRocm91Z2ggdGhlIGVsZW1lbnQgcGFyZW50cyB1bnRpbCB3ZSByZWFjaCBudWxsLCBjaGVja2luZyBpZiBhbnkgb2YgdGhlIGVsZW1lbnRzXG4gICAgLy8gYXJlIHRoZSBzY3JvbGxhYmxlJ3MgZWxlbWVudC5cbiAgICBkbyB7XG4gICAgICBpZiAoZWxlbWVudCA9PSBzY3JvbGxhYmxlRWxlbWVudCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9IHdoaWxlICgoZWxlbWVudCA9IGVsZW1lbnQhLnBhcmVudEVsZW1lbnQpKTtcblxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKiBTZXRzIHVwIHRoZSBnbG9iYWwgc2Nyb2xsIGxpc3RlbmVycy4gKi9cbiAgcHJpdmF0ZSBfYWRkR2xvYmFsTGlzdGVuZXIoKSB7XG4gICAgdGhpcy5fZ2xvYmFsU3Vic2NyaXB0aW9uID0gdGhpcy5fbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgIGNvbnN0IHdpbmRvdyA9IHRoaXMuX2dldFdpbmRvdygpO1xuICAgICAgcmV0dXJuIGZyb21FdmVudCh3aW5kb3cuZG9jdW1lbnQsICdzY3JvbGwnKS5zdWJzY3JpYmUoKCkgPT4gdGhpcy5fc2Nyb2xsZWQubmV4dCgpKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBDbGVhbnMgdXAgdGhlIGdsb2JhbCBzY3JvbGwgbGlzdGVuZXIuICovXG4gIHByaXZhdGUgX3JlbW92ZUdsb2JhbExpc3RlbmVyKCkge1xuICAgIGlmICh0aGlzLl9nbG9iYWxTdWJzY3JpcHRpb24pIHtcbiAgICAgIHRoaXMuX2dsb2JhbFN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICAgICAgdGhpcy5fZ2xvYmFsU3Vic2NyaXB0aW9uID0gbnVsbDtcbiAgICB9XG4gIH1cbn1cbiJdfQ==