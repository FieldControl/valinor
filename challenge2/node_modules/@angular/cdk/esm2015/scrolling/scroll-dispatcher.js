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
import * as i2 from "@angular/common";
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
            this.scrollContainers.set(scrollable, scrollable.elementScrolled()
                .subscribe(() => this._scrolled.next(scrollable)));
        }
    }
    /**
     * Deregisters a Scrollable reference and unsubscribes from its scroll event observable.
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
            const subscription = auditTimeInMs > 0 ?
                this._scrolled.pipe(auditTime(auditTimeInMs)).subscribe(observer) :
                this._scrolled.subscribe(observer);
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
        } while (element = element.parentElement);
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
ScrollDispatcher.ɵprov = i0.ɵɵdefineInjectable({ factory: function ScrollDispatcher_Factory() { return new ScrollDispatcher(i0.ɵɵinject(i0.NgZone), i0.ɵɵinject(i1.Platform), i0.ɵɵinject(i2.DOCUMENT, 8)); }, token: ScrollDispatcher, providedIn: "root" });
ScrollDispatcher.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] }
];
ScrollDispatcher.ctorParameters = () => [
    { type: NgZone },
    { type: Platform },
    { type: undefined, decorators: [{ type: Optional }, { type: Inject, args: [DOCUMENT,] }] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2Nyb2xsLWRpc3BhdGNoZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL3Njcm9sbGluZy9zY3JvbGwtZGlzcGF0Y2hlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsYUFBYSxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDcEQsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQy9DLE9BQU8sRUFBYSxVQUFVLEVBQUUsTUFBTSxFQUFhLFFBQVEsRUFBRSxNQUFNLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDMUYsT0FBTyxFQUFDLFNBQVMsRUFBRSxFQUFFLElBQUksWUFBWSxFQUFFLE9BQU8sRUFBZ0IsVUFBVSxFQUFXLE1BQU0sTUFBTSxDQUFDO0FBQ2hHLE9BQU8sRUFBQyxTQUFTLEVBQUUsTUFBTSxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFFakQsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGlCQUFpQixDQUFDOzs7O0FBRXpDLDhEQUE4RDtBQUM5RCxNQUFNLENBQUMsTUFBTSxtQkFBbUIsR0FBRyxFQUFFLENBQUM7QUFFdEM7OztHQUdHO0FBRUgsTUFBTSxPQUFPLGdCQUFnQjtJQUkzQixZQUFvQixPQUFlLEVBQ2YsU0FBbUIsRUFDRyxRQUFhO1FBRm5DLFlBQU8sR0FBUCxPQUFPLENBQVE7UUFDZixjQUFTLEdBQVQsU0FBUyxDQUFVO1FBS3ZDLDhGQUE4RjtRQUM3RSxjQUFTLEdBQUcsSUFBSSxPQUFPLEVBQXNCLENBQUM7UUFFL0QscUVBQXFFO1FBQ3JFLHdCQUFtQixHQUF3QixJQUFJLENBQUM7UUFFaEQsaUdBQWlHO1FBQ3pGLG1CQUFjLEdBQUcsQ0FBQyxDQUFDO1FBRTNCOzs7V0FHRztRQUNILHFCQUFnQixHQUFxQyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBaEI3RCxJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEs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Q0FBQztRQUNyRixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCw0Q0FBNEM7SUFDcEMscUJBQXFCO1FBQzNCLElBQUksSUFBSSxDQUFDLG1CQUFtQixFQUFFO1lBQzVCLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUN2QyxJQUFJLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxDQUFDO1NBQ2pDO0lBQ0gsQ0FBQzs7OztZQWhLRixVQUFVLFNBQUMsRUFBQyxVQUFVLEVBQUUsTUFBTSxFQUFDOzs7WUFiQSxNQUFNO1lBRDlCLFFBQVE7NENBcUJELFFBQVEsWUFBSSxNQUFNLFNBQUMsUUFBUSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2NvZXJjZUVsZW1lbnR9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2VyY2lvbic7XG5pbXBvcnQge1BsYXRmb3JtfSBmcm9tICdAYW5ndWxhci9jZGsvcGxhdGZvcm0nO1xuaW1wb3J0IHtFbGVtZW50UmVmLCBJbmplY3RhYmxlLCBOZ1pvbmUsIE9uRGVzdHJveSwgT3B0aW9uYWwsIEluamVjdH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge2Zyb21FdmVudCwgb2YgYXMgb2JzZXJ2YWJsZU9mLCBTdWJqZWN0LCBTdWJzY3JpcHRpb24sIE9ic2VydmFibGUsIE9ic2VydmVyfSBmcm9tICdyeGpzJztcbmltcG9ydCB7YXVkaXRUaW1lLCBmaWx0ZXJ9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7Q2RrU2Nyb2xsYWJsZX0gZnJvbSAnLi9zY3JvbGxhYmxlJztcbmltcG9ydCB7RE9DVU1FTlR9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5cbi8qKiBUaW1lIGluIG1zIHRvIHRocm90dGxlIHRoZSBzY3JvbGxpbmcgZXZlbnRzIGJ5IGRlZmF1bHQuICovXG5leHBvcnQgY29uc3QgREVGQVVMVF9TQ1JPTExfVElNRSA9IDIwO1xuXG4vKipcbiAqIFNlcnZpY2UgY29udGFpbmVkIGFsbCByZWdpc3RlcmVkIFNjcm9sbGFibGUgcmVmZXJlbmNlcyBhbmQgZW1pdHMgYW4gZXZlbnQgd2hlbiBhbnkgb25lIG9mIHRoZVxuICogU2Nyb2xsYWJsZSByZWZlcmVuY2VzIGVtaXQgYSBzY3JvbGxlZCBldmVudC5cbiAqL1xuQEluamVjdGFibGUoe3Byb3ZpZGVkSW46ICdyb290J30pXG5leHBvcnQgY2xhc3MgU2Nyb2xsRGlzcGF0Y2hlciBpbXBsZW1lbnRzIE9uRGVzdHJveSB7XG4gIC8qKiBVc2VkIHRvIHJlZmVyZW5jZSBjb3JyZWN0IGRvY3VtZW50L3dpbmRvdyAqL1xuICBwcm90ZWN0ZWQgX2RvY3VtZW50OiBEb2N1bWVudDtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9uZ1pvbmU6IE5nWm9uZSxcbiAgICAgICAgICAgICAgcHJpdmF0ZSBfcGxhdGZvcm06IFBsYXRmb3JtLFxuICAgICAgICAgICAgICBAT3B0aW9uYWwoKSBASW5qZWN0KERPQ1VNRU5UKSBkb2N1bWVudDogYW55KSB7XG4gICAgdGhpcy5fZG9jdW1lbnQgPSBkb2N1bWVudDtcbiAgfVxuXG4gIC8qKiBTdWJqZWN0IGZvciBub3RpZnlpbmcgdGhhdCBhIHJlZ2lzdGVyZWQgc2Nyb2xsYWJsZSByZWZlcmVuY2UgZWxlbWVudCBoYXMgYmVlbiBzY3JvbGxlZC4gKi9cbiAgcHJpdmF0ZSByZWFkb25seSBfc2Nyb2xsZWQgPSBuZXcgU3ViamVjdDxDZGtTY3JvbGxhYmxlfHZvaWQ+KCk7XG5cbiAgLyoqIEtlZXBzIHRyYWNrIG9mIHRoZSBnbG9iYWwgYHNjcm9sbGAgYW5kIGByZXNpemVgIHN1YnNjcmlwdGlvbnMuICovXG4gIF9nbG9iYWxTdWJzY3JpcHRpb246IFN1YnNjcmlwdGlvbiB8IG51bGwgPSBudWxsO1xuXG4gIC8qKiBLZWVwcyB0cmFjayBvZiB0aGUgYW1vdW50IG9mIHN1YnNjcmlwdGlvbnMgdG8gYHNjcm9sbGVkYC4gVXNlZCBmb3IgY2xlYW5pbmcgdXAgYWZ0ZXJ3YXJkcy4gKi9cbiAgcHJpdmF0ZSBfc2Nyb2xsZWRDb3VudCA9IDA7XG5cbiAgLyoqXG4gICAqIE1hcCBvZiBhbGwgdGhlIHNjcm9sbGFibGUgcmVmZXJlbmNlcyB0aGF0IGFyZSByZWdpc3RlcmVkIHdpdGggdGhlIHNlcnZpY2UgYW5kIHRoZWlyXG4gICAqIHNjcm9sbCBldmVudCBzdWJzY3JpcHRpb25zLlxuICAgKi9cbiAgc2Nyb2xsQ29udGFpbmVyczogTWFwPENka1Njcm9sbGFibGUsIFN1YnNjcmlwdGlvbj4gPSBuZXcgTWFwKCk7XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVycyBhIHNjcm9sbGFibGUgaW5zdGFuY2Ugd2l0aCB0aGUgc2VydmljZSBhbmQgbGlzdGVucyBmb3IgaXRzIHNjcm9sbGVkIGV2ZW50cy4gV2hlbiB0aGVcbiAgICogc2Nyb2xsYWJsZSBpcyBzY3JvbGxlZCwgdGhlIHNlcnZpY2UgZW1pdHMgdGhlIGV2ZW50IHRvIGl0cyBzY3JvbGxlZCBvYnNlcnZhYmxlLlxuICAgKiBAcGFyYW0gc2Nyb2xsYWJsZSBTY3JvbGxhYmxlIGluc3RhbmNlIHRvIGJlIHJlZ2lzdGVyZWQuXG4gICAqL1xuICByZWdpc3RlcihzY3JvbGxhYmxlOiBDZGtTY3JvbGxhYmxlKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLnNjcm9sbENvbnRhaW5lcnMuaGFzKHNjcm9sbGFibGUpKSB7XG4gICAgICB0aGlzLnNjcm9sbENvbnRhaW5lcnMuc2V0KHNjcm9sbGFibGUsIHNjcm9sbGFibGUuZWxlbWVudFNjcm9sbGVkKClcbiAgICAgICAgICAuc3Vic2NyaWJlKCgpID0+IHRoaXMuX3Njcm9sbGVkLm5leHQoc2Nyb2xsYWJsZSkpKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRGVyZWdpc3RlcnMgYSBTY3JvbGxhYmxlIHJlZmVyZW5jZSBhbmQgdW5zdWJzY3JpYmVzIGZyb20gaXRzIHNjcm9sbCBldmVudCBvYnNlcnZhYmxlLlxuICAgKiBAcGFyYW0gc2Nyb2xsYWJsZSBTY3JvbGxhYmxlIGluc3RhbmNlIHRvIGJlIGRlcmVnaXN0ZXJlZC5cbiAgICovXG4gIGRlcmVnaXN0ZXIoc2Nyb2xsYWJsZTogQ2RrU2Nyb2xsYWJsZSk6IHZvaWQge1xuICAgIGNvbnN0IHNjcm9sbGFibGVSZWZlcmVuY2UgPSB0aGlzLnNjcm9sbENvbnRhaW5lcnMuZ2V0KHNjcm9sbGFibGUpO1xuXG4gICAgaWYgKHNjcm9sbGFibGVSZWZlcmVuY2UpIHtcbiAgICAgIHNjcm9sbGFibGVSZWZlcmVuY2UudW5zdWJzY3JpYmUoKTtcbiAgICAgIHRoaXMuc2Nyb2xsQ29udGFpbmVycy5kZWxldGUoc2Nyb2xsYWJsZSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYW4gb2JzZXJ2YWJsZSB0aGF0IGVtaXRzIGFuIGV2ZW50IHdoZW5ldmVyIGFueSBvZiB0aGUgcmVnaXN0ZXJlZCBTY3JvbGxhYmxlXG4gICAqIHJlZmVyZW5jZXMgKG9yIHdpbmRvdywgZG9jdW1lbnQsIG9yIGJvZHkpIGZpcmUgYSBzY3JvbGxlZCBldmVudC4gQ2FuIHByb3ZpZGUgYSB0aW1lIGluIG1zXG4gICAqIHRvIG92ZXJyaWRlIHRoZSBkZWZhdWx0IFwidGhyb3R0bGVcIiB0aW1lLlxuICAgKlxuICAgKiAqKk5vdGU6KiogaW4gb3JkZXIgdG8gYXZvaWQgaGl0dGluZyBjaGFuZ2UgZGV0ZWN0aW9uIGZvciBldmVyeSBzY3JvbGwgZXZlbnQsXG4gICAqIGFsbCBvZiB0aGUgZXZlbnRzIGVtaXR0ZWQgZnJvbSB0aGlzIHN0cmVhbSB3aWxsIGJlIHJ1biBvdXRzaWRlIHRoZSBBbmd1bGFyIHpvbmUuXG4gICAqIElmIHlvdSBuZWVkIHRvIHVwZGF0ZSBhbnkgZGF0YSBiaW5kaW5ncyBhcyBhIHJlc3VsdCBvZiBhIHNjcm9sbCBldmVudCwgeW91IGhhdmVcbiAgICogdG8gcnVuIHRoZSBjYWxsYmFjayB1c2luZyBgTmdab25lLnJ1bmAuXG4gICAqL1xuICBzY3JvbGxlZChhdWRpdFRpbWVJbk1zOiBudW1iZXIgPSBERUZBVUxUX1NDUk9MTF9USU1FKTogT2JzZXJ2YWJsZTxDZGtTY3JvbGxhYmxlfHZvaWQ+IHtcbiAgICBpZiAoIXRoaXMuX3BsYXRmb3JtLmlzQnJvd3Nlcikge1xuICAgICAgcmV0dXJuIG9ic2VydmFibGVPZjx2b2lkPigpO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgT2JzZXJ2YWJsZSgob2JzZXJ2ZXI6IE9ic2VydmVyPENka1Njcm9sbGFibGV8dm9pZD4pID0+IHtcbiAgICAgIGlmICghdGhpcy5fZ2xvYmFsU3Vic2NyaXB0aW9uKSB7XG4gICAgICAgIHRoaXMuX2FkZEdsb2JhbExpc3RlbmVyKCk7XG4gICAgICB9XG5cbiAgICAgIC8vIEluIHRoZSBjYXNlIG9mIGEgMG1zIGRlbGF5LCB1c2UgYW4gb2JzZXJ2YWJsZSB3aXRob3V0IGF1ZGl0VGltZVxuICAgICAgLy8gc2luY2UgaXQgZG9lcyBhZGQgYSBwZXJjZXB0aWJsZSBkZWxheSBpbiBwcm9jZXNzaW5nIG92ZXJoZWFkLlxuICAgICAgY29uc3Qgc3Vic2NyaXB0aW9uID0gYXVkaXRUaW1lSW5NcyA+IDAgP1xuICAgICAgICB0aGlzLl9zY3JvbGxlZC5waXBlKGF1ZGl0VGltZShhdWRpdFRpbWVJbk1zKSkuc3Vic2NyaWJlKG9ic2VydmVyKSA6XG4gICAgICAgIHRoaXMuX3Njcm9sbGVkLnN1YnNjcmliZShvYnNlcnZlcik7XG5cbiAgICAgIHRoaXMuX3Njcm9sbGVkQ291bnQrKztcblxuICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgc3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG4gICAgICAgIHRoaXMuX3Njcm9sbGVkQ291bnQtLTtcblxuICAgICAgICBpZiAoIXRoaXMuX3Njcm9sbGVkQ291bnQpIHtcbiAgICAgICAgICB0aGlzLl9yZW1vdmVHbG9iYWxMaXN0ZW5lcigpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH0pO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdGhpcy5fcmVtb3ZlR2xvYmFsTGlzdGVuZXIoKTtcbiAgICB0aGlzLnNjcm9sbENvbnRhaW5lcnMuZm9yRWFjaCgoXywgY29udGFpbmVyKSA9PiB0aGlzLmRlcmVnaXN0ZXIoY29udGFpbmVyKSk7XG4gICAgdGhpcy5fc2Nyb2xsZWQuY29tcGxldGUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIG9ic2VydmFibGUgdGhhdCBlbWl0cyB3aGVuZXZlciBhbnkgb2YgdGhlXG4gICAqIHNjcm9sbGFibGUgYW5jZXN0b3JzIG9mIGFuIGVsZW1lbnQgYXJlIHNjcm9sbGVkLlxuICAgKiBAcGFyYW0gZWxlbWVudE9yRWxlbWVudFJlZiBFbGVtZW50IHdob3NlIGFuY2VzdG9ycyB0byBsaXN0ZW4gZm9yLlxuICAgKiBAcGFyYW0gYXVkaXRUaW1lSW5NcyBUaW1lIHRvIHRocm90dGxlIHRoZSBzY3JvbGwgZXZlbnRzLlxuICAgKi9cbiAgYW5jZXN0b3JTY3JvbGxlZChcbiAgICAgIGVsZW1lbnRPckVsZW1lbnRSZWY6IEVsZW1lbnRSZWZ8SFRNTEVsZW1lbnQsXG4gICAgICBhdWRpdFRpbWVJbk1zPzogbnVtYmVyKTogT2JzZXJ2YWJsZTxDZGtTY3JvbGxhYmxlfHZvaWQ+IHtcbiAgICBjb25zdCBhbmNlc3RvcnMgPSB0aGlzLmdldEFuY2VzdG9yU2Nyb2xsQ29udGFpbmVycyhlbGVtZW50T3JFbGVtZW50UmVmKTtcblxuICAgIHJldHVybiB0aGlzLnNjcm9sbGVkKGF1ZGl0VGltZUluTXMpLnBpcGUoZmlsdGVyKHRhcmdldCA9PiB7XG4gICAgICByZXR1cm4gIXRhcmdldCB8fCBhbmNlc3RvcnMuaW5kZXhPZih0YXJnZXQpID4gLTE7XG4gICAgfSkpO1xuICB9XG5cbiAgLyoqIFJldHVybnMgYWxsIHJlZ2lzdGVyZWQgU2Nyb2xsYWJsZXMgdGhhdCBjb250YWluIHRoZSBwcm92aWRlZCBlbGVtZW50LiAqL1xuICBnZXRBbmNlc3RvclNjcm9sbENvbnRhaW5lcnMoZWxlbWVudE9yRWxlbWVudFJlZjogRWxlbWVudFJlZnxIVE1MRWxlbWVudCk6IENka1Njcm9sbGFibGVbXSB7XG4gICAgY29uc3Qgc2Nyb2xsaW5nQ29udGFpbmVyczogQ2RrU2Nyb2xsYWJsZVtdID0gW107XG5cbiAgICB0aGlzLnNjcm9sbENvbnRhaW5lcnMuZm9yRWFjaCgoX3N1YnNjcmlwdGlvbjogU3Vic2NyaXB0aW9uLCBzY3JvbGxhYmxlOiBDZGtTY3JvbGxhYmxlKSA9PiB7XG4gICAgICBpZiAodGhpcy5fc2Nyb2xsYWJsZUNvbnRhaW5zRWxlbWVudChzY3JvbGxhYmxlLCBlbGVtZW50T3JFbGVtZW50UmVmKSkge1xuICAgICAgICBzY3JvbGxpbmdDb250YWluZXJzLnB1c2goc2Nyb2xsYWJsZSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gc2Nyb2xsaW5nQ29udGFpbmVycztcbiAgfVxuXG4gIC8qKiBVc2UgZGVmYXVsdFZpZXcgb2YgaW5qZWN0ZWQgZG9jdW1lbnQgaWYgYXZhaWxhYmxlIG9yIGZhbGxiYWNrIHRvIGdsb2JhbCB3aW5kb3cgcmVmZXJlbmNlICovXG4gIHByaXZhdGUgX2dldFdpbmRvdygpOiBXaW5kb3cge1xuICAgIHJldHVybiB0aGlzLl9kb2N1bWVudC5kZWZhdWx0VmlldyB8fCB3aW5kb3c7XG4gIH1cblxuICAvKiogUmV0dXJucyB0cnVlIGlmIHRoZSBlbGVtZW50IGlzIGNvbnRhaW5lZCB3aXRoaW4gdGhlIHByb3ZpZGVkIFNjcm9sbGFibGUuICovXG4gIHByaXZhdGUgX3Njcm9sbGFibGVDb250YWluc0VsZW1lbnQoXG4gICAgICBzY3JvbGxhYmxlOiBDZGtTY3JvbGxhYmxlLFxuICAgICAgZWxlbWVudE9yRWxlbWVudFJlZjogRWxlbWVudFJlZnxIVE1MRWxlbWVudCk6IGJvb2xlYW4ge1xuICAgIGxldCBlbGVtZW50OiBIVE1MRWxlbWVudCB8IG51bGwgPSBjb2VyY2VFbGVtZW50KGVsZW1lbnRPckVsZW1lbnRSZWYpO1xuICAgIGxldCBzY3JvbGxhYmxlRWxlbWVudCA9IHNjcm9sbGFibGUuZ2V0RWxlbWVudFJlZigpLm5hdGl2ZUVsZW1lbnQ7XG5cbiAgICAvLyBUcmF2ZXJzZSB0aHJvdWdoIHRoZSBlbGVtZW50IHBhcmVudHMgdW50aWwgd2UgcmVhY2ggbnVsbCwgY2hlY2tpbmcgaWYgYW55IG9mIHRoZSBlbGVtZW50c1xuICAgIC8vIGFyZSB0aGUgc2Nyb2xsYWJsZSdzIGVsZW1lbnQuXG4gICAgZG8ge1xuICAgICAgaWYgKGVsZW1lbnQgPT0gc2Nyb2xsYWJsZUVsZW1lbnQpIHsgcmV0dXJuIHRydWU7IH1cbiAgICB9IHdoaWxlIChlbGVtZW50ID0gZWxlbWVudCEucGFyZW50RWxlbWVudCk7XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKiogU2V0cyB1cCB0aGUgZ2xvYmFsIHNjcm9sbCBsaXN0ZW5lcnMuICovXG4gIHByaXZhdGUgX2FkZEdsb2JhbExpc3RlbmVyKCkge1xuICAgIHRoaXMuX2dsb2JhbFN1YnNjcmlwdGlvbiA9IHRoaXMuX25nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICBjb25zdCB3aW5kb3cgPSB0aGlzLl9nZXRXaW5kb3coKTtcbiAgICAgIHJldHVybiBmcm9tRXZlbnQod2luZG93LmRvY3VtZW50LCAnc2Nyb2xsJykuc3Vic2NyaWJlKCgpID0+IHRoaXMuX3Njcm9sbGVkLm5leHQoKSk7XG4gICAgfSk7XG4gIH1cblxuICAvKiogQ2xlYW5zIHVwIHRoZSBnbG9iYWwgc2Nyb2xsIGxpc3RlbmVyLiAqL1xuICBwcml2YXRlIF9yZW1vdmVHbG9iYWxMaXN0ZW5lcigpIHtcbiAgICBpZiAodGhpcy5fZ2xvYmFsU3Vic2NyaXB0aW9uKSB7XG4gICAgICB0aGlzLl9nbG9iYWxTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcbiAgICAgIHRoaXMuX2dsb2JhbFN1YnNjcmlwdGlvbiA9IG51bGw7XG4gICAgfVxuICB9XG59XG4iXX0=