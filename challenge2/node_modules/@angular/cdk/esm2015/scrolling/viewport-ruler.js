/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Platform } from '@angular/cdk/platform';
import { Injectable, NgZone, Optional, Inject } from '@angular/core';
import { Subject } from 'rxjs';
import { auditTime } from 'rxjs/operators';
import { DOCUMENT } from '@angular/common';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/platform";
import * as i2 from "@angular/common";
/** Time in ms to throttle the resize events by default. */
export const DEFAULT_RESIZE_TIME = 20;
/**
 * Simple utility for getting the bounds of the browser viewport.
 * @docs-private
 */
export class ViewportRuler {
    constructor(_platform, ngZone, document) {
        this._platform = _platform;
        /** Stream of viewport change events. */
        this._change = new Subject();
        /** Event listener that will be used to handle the viewport change events. */
        this._changeListener = (event) => {
            this._change.next(event);
        };
        this._document = document;
        ngZone.runOutsideAngular(() => {
            if (_platform.isBrowser) {
                const window = this._getWindow();
                // Note that bind the events ourselves, rather than going through something like RxJS's
                // `fromEvent` so that we can ensure that they're bound outside of the NgZone.
                window.addEventListener('resize', this._changeListener);
                window.addEventListener('orientationchange', this._changeListener);
            }
            // We don't need to keep track of the subscription,
            // because we complete the `change` stream on destroy.
            this.change().subscribe(() => this._updateViewportSize());
        });
    }
    ngOnDestroy() {
        if (this._platform.isBrowser) {
            const window = this._getWindow();
            window.removeEventListener('resize', this._changeListener);
            window.removeEventListener('orientationchange', this._changeListener);
        }
        this._change.complete();
    }
    /** Returns the viewport's width and height. */
    getViewportSize() {
        if (!this._viewportSize) {
            this._updateViewportSize();
        }
        const output = { width: this._viewportSize.width, height: this._viewportSize.height };
        // If we're not on a browser, don't cache the size since it'll be mocked out anyway.
        if (!this._platform.isBrowser) {
            this._viewportSize = null;
        }
        return output;
    }
    /** Gets a ClientRect for the viewport's bounds. */
    getViewportRect() {
        // Use the document element's bounding rect rather than the window scroll properties
        // (e.g. pageYOffset, scrollY) due to in issue in Chrome and IE where window scroll
        // properties and client coordinates (boundingClientRect, clientX/Y, etc.) are in different
        // conceptual viewports. Under most circumstances these viewports are equivalent, but they
        // can disagree when the page is pinch-zoomed (on devices that support touch).
        // See https://bugs.chromium.org/p/chromium/issues/detail?id=489206#c4
        // We use the documentElement instead of the body because, by default (without a css reset)
        // browsers typically give the document body an 8px margin, which is not included in
        // getBoundingClientRect().
        const scrollPosition = this.getViewportScrollPosition();
        const { width, height } = this.getViewportSize();
        return {
            top: scrollPosition.top,
            left: scrollPosition.left,
            bottom: scrollPosition.top + height,
            right: scrollPosition.left + width,
            height,
            width,
        };
    }
    /** Gets the (top, left) scroll position of the viewport. */
    getViewportScrollPosition() {
        // While we can get a reference to the fake document
        // during SSR, it doesn't have getBoundingClientRect.
        if (!this._platform.isBrowser) {
            return { top: 0, left: 0 };
        }
        // The top-left-corner of the viewport is determined by the scroll position of the document
        // body, normally just (scrollLeft, scrollTop). However, Chrome and Firefox disagree about
        // whether `document.body` or `document.documentElement` is the scrolled element, so reading
        // `scrollTop` and `scrollLeft` is inconsistent. However, using the bounding rect of
        // `document.documentElement` works consistently, where the `top` and `left` values will
        // equal negative the scroll position.
        const document = this._document;
        const window = this._getWindow();
        const documentElement = document.documentElement;
        const documentRect = documentElement.getBoundingClientRect();
        const top = -documentRect.top || document.body.scrollTop || window.scrollY ||
            documentElement.scrollTop || 0;
        const left = -documentRect.left || document.body.scrollLeft || window.scrollX ||
            documentElement.scrollLeft || 0;
        return { top, left };
    }
    /**
     * Returns a stream that emits whenever the size of the viewport changes.
     * @param throttleTime Time in milliseconds to throttle the stream.
     */
    change(throttleTime = DEFAULT_RESIZE_TIME) {
        return throttleTime > 0 ? this._change.pipe(auditTime(throttleTime)) : this._change;
    }
    /** Use defaultView of injected document if available or fallback to global window reference */
    _getWindow() {
        return this._document.defaultView || window;
    }
    /** Updates the cached viewport size. */
    _updateViewportSize() {
        const window = this._getWindow();
        this._viewportSize = this._platform.isBrowser ?
            { width: window.innerWidth, height: window.innerHeight } :
            { width: 0, height: 0 };
    }
}
ViewportRuler.ɵprov = i0.ɵɵdefineInjectable({ factory: function ViewportRuler_Factory() { return new ViewportRuler(i0.ɵɵinject(i1.Platform), i0.ɵɵinject(i0.NgZone), i0.ɵɵinject(i2.DOCUMENT, 8)); }, token: ViewportRuler, providedIn: "root" });
ViewportRuler.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] }
];
ViewportRuler.ctorParameters = () => [
    { type: Platform },
    { type: NgZone },
    { type: undefined, decorators: [{ type: Optional }, { type: Inject, args: [DOCUMENT,] }] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld3BvcnQtcnVsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL3Njcm9sbGluZy92aWV3cG9ydC1ydWxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDL0MsT0FBTyxFQUFDLFVBQVUsRUFBRSxNQUFNLEVBQWEsUUFBUSxFQUFFLE1BQU0sRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUM5RSxPQUFPLEVBQWEsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQ3pDLE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUN6QyxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0saUJBQWlCLENBQUM7Ozs7QUFFekMsMkRBQTJEO0FBQzNELE1BQU0sQ0FBQyxNQUFNLG1CQUFtQixHQUFHLEVBQUUsQ0FBQztBQVF0Qzs7O0dBR0c7QUFFSCxNQUFNLE9BQU8sYUFBYTtJQWV4QixZQUFvQixTQUFtQixFQUMzQixNQUFjLEVBQ2dCLFFBQWE7UUFGbkMsY0FBUyxHQUFULFNBQVMsQ0FBVTtRQVh2Qyx3Q0FBd0M7UUFDdkIsWUFBTyxHQUFHLElBQUksT0FBTyxFQUFTLENBQUM7UUFFaEQsNkVBQTZFO1FBQ3JFLG9CQUFlLEdBQUcsQ0FBQyxLQUFZLEVBQUUsRUFBRTtZQUN6QyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUMzQixDQUFDLENBQUE7UUFRQyxJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQztRQUUxQixNQUFNLENBQUMsaUJBQWlCLENBQUMsR0FBRyxFQUFFO1lBQzVCLElBQUksU0FBUyxDQUFDLFNBQVMsRUFBRTtnQkFDdkIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO2dCQUVqQyx1RkFBdUY7Z0JBQ3ZGLDhF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QUFRLFlBQUksTUFBTSxTQUFDLFFBQVEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtQbGF0Zm9ybX0gZnJvbSAnQGFuZ3VsYXIvY2RrL3BsYXRmb3JtJztcbmltcG9ydCB7SW5qZWN0YWJsZSwgTmdab25lLCBPbkRlc3Ryb3ksIE9wdGlvbmFsLCBJbmplY3R9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtPYnNlcnZhYmxlLCBTdWJqZWN0fSBmcm9tICdyeGpzJztcbmltcG9ydCB7YXVkaXRUaW1lfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5pbXBvcnQge0RPQ1VNRU5UfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuXG4vKiogVGltZSBpbiBtcyB0byB0aHJvdHRsZSB0aGUgcmVzaXplIGV2ZW50cyBieSBkZWZhdWx0LiAqL1xuZXhwb3J0IGNvbnN0IERFRkFVTFRfUkVTSVpFX1RJTUUgPSAyMDtcblxuLyoqIE9iamVjdCB0aGF0IGhvbGRzIHRoZSBzY3JvbGwgcG9zaXRpb24gb2YgdGhlIHZpZXdwb3J0IGluIGVhY2ggZGlyZWN0aW9uLiAqL1xuZXhwb3J0IGludGVyZmFjZSBWaWV3cG9ydFNjcm9sbFBvc2l0aW9uIHtcbiAgdG9wOiBudW1iZXI7XG4gIGxlZnQ6IG51bWJlcjtcbn1cblxuLyoqXG4gKiBTaW1wbGUgdXRpbGl0eSBmb3IgZ2V0dGluZyB0aGUgYm91bmRzIG9mIHRoZSBicm93c2VyIHZpZXdwb3J0LlxuICogQGRvY3MtcHJpdmF0ZVxuICovXG5ASW5qZWN0YWJsZSh7cHJvdmlkZWRJbjogJ3Jvb3QnfSlcbmV4cG9ydCBjbGFzcyBWaWV3cG9ydFJ1bGVyIGltcGxlbWVudHMgT25EZXN0cm95IHtcbiAgLyoqIENhY2hlZCB2aWV3cG9ydCBkaW1lbnNpb25zLiAqL1xuICBwcml2YXRlIF92aWV3cG9ydFNpemU6IHt3aWR0aDogbnVtYmVyOyBoZWlnaHQ6IG51bWJlcn07XG5cbiAgLyoqIFN0cmVhbSBvZiB2aWV3cG9ydCBjaGFuZ2UgZXZlbnRzLiAqL1xuICBwcml2YXRlIHJlYWRvbmx5IF9jaGFuZ2UgPSBuZXcgU3ViamVjdDxFdmVudD4oKTtcblxuICAvKiogRXZlbnQgbGlzdGVuZXIgdGhhdCB3aWxsIGJlIHVzZWQgdG8gaGFuZGxlIHRoZSB2aWV3cG9ydCBjaGFuZ2UgZXZlbnRzLiAqL1xuICBwcml2YXRlIF9jaGFuZ2VMaXN0ZW5lciA9IChldmVudDogRXZlbnQpID0+IHtcbiAgICB0aGlzLl9jaGFuZ2UubmV4dChldmVudCk7XG4gIH1cblxuICAvKiogVXNlZCB0byByZWZlcmVuY2UgY29ycmVjdCBkb2N1bWVudC93aW5kb3cgKi9cbiAgcHJvdGVjdGVkIF9kb2N1bWVudDogRG9jdW1lbnQ7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfcGxhdGZvcm06IFBsYXRmb3JtLFxuICAgICAgICAgICAgICBuZ1pvbmU6IE5nWm9uZSxcbiAgICAgICAgICAgICAgQE9wdGlvbmFsKCkgQEluamVjdChET0NVTUVOVCkgZG9jdW1lbnQ6IGFueSkge1xuICAgIHRoaXMuX2RvY3VtZW50ID0gZG9jdW1lbnQ7XG5cbiAgICBuZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgaWYgKF9wbGF0Zm9ybS5pc0Jyb3dzZXIpIHtcbiAgICAgICAgY29uc3Qgd2luZG93ID0gdGhpcy5fZ2V0V2luZG93KCk7XG5cbiAgICAgICAgLy8gTm90ZSB0aGF0IGJpbmQgdGhlIGV2ZW50cyBvdXJzZWx2ZXMsIHJhdGhlciB0aGFuIGdvaW5nIHRocm91Z2ggc29tZXRoaW5nIGxpa2UgUnhKUydzXG4gICAgICAgIC8vIGBmcm9tRXZlbnRgIHNvIHRoYXQgd2UgY2FuIGVuc3VyZSB0aGF0IHRoZXkncmUgYm91bmQgb3V0c2lkZSBvZiB0aGUgTmdab25lLlxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy5fY2hhbmdlTGlzdGVuZXIpO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignb3JpZW50YXRpb25jaGFuZ2UnLCB0aGlzLl9jaGFuZ2VMaXN0ZW5lcik7XG4gICAgICB9XG5cbiAgICAgIC8vIFdlIGRvbid0IG5lZWQgdG8ga2VlcCB0cmFjayBvZiB0aGUgc3Vic2NyaXB0aW9uLFxuICAgICAgLy8gYmVjYXVzZSB3ZSBjb21wbGV0ZSB0aGUgYGNoYW5nZWAgc3RyZWFtIG9uIGRlc3Ryb3kuXG4gICAgICB0aGlzLmNoYW5nZSgpLnN1YnNjcmliZSgoKSA9PiB0aGlzLl91cGRhdGVWaWV3cG9ydFNpemUoKSk7XG4gICAgfSk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICBpZiAodGhpcy5fcGxhdGZvcm0uaXNCcm93c2VyKSB7XG4gICAgICBjb25zdCB3aW5kb3cgPSB0aGlzLl9nZXRXaW5kb3coKTtcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLl9jaGFuZ2VMaXN0ZW5lcik7XG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignb3JpZW50YXRpb25jaGFuZ2UnLCB0aGlzLl9jaGFuZ2VMaXN0ZW5lcik7XG4gICAgfVxuXG4gICAgdGhpcy5fY2hhbmdlLmNvbXBsZXRlKCk7XG4gIH1cblxuICAvKiogUmV0dXJucyB0aGUgdmlld3BvcnQncyB3aWR0aCBhbmQgaGVpZ2h0LiAqL1xuICBnZXRWaWV3cG9ydFNpemUoKTogUmVhZG9ubHk8e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfT4ge1xuICAgIGlmICghdGhpcy5fdmlld3BvcnRTaXplKSB7XG4gICAgICB0aGlzLl91cGRhdGVWaWV3cG9ydFNpemUoKTtcbiAgICB9XG5cbiAgICBjb25zdCBvdXRwdXQgPSB7d2lkdGg6IHRoaXMuX3ZpZXdwb3J0U2l6ZS53aWR0aCwgaGVpZ2h0OiB0aGlzLl92aWV3cG9ydFNpemUuaGVpZ2h0fTtcblxuICAgIC8vIElmIHdlJ3JlIG5vdCBvbiBhIGJyb3dzZXIsIGRvbid0IGNhY2hlIHRoZSBzaXplIHNpbmNlIGl0J2xsIGJlIG1vY2tlZCBvdXQgYW55d2F5LlxuICAgIGlmICghdGhpcy5fcGxhdGZvcm0uaXNCcm93c2VyKSB7XG4gICAgICB0aGlzLl92aWV3cG9ydFNpemUgPSBudWxsITtcbiAgICB9XG5cbiAgICByZXR1cm4gb3V0cHV0O1xuICB9XG5cbiAgLyoqIEdldHMgYSBDbGllbnRSZWN0IGZvciB0aGUgdmlld3BvcnQncyBib3VuZHMuICovXG4gIGdldFZpZXdwb3J0UmVjdCgpOiBDbGllbnRSZWN0IHtcbiAgICAvLyBVc2UgdGhlIGRvY3VtZW50IGVsZW1lbnQncyBib3VuZGluZyByZWN0IHJhdGhlciB0aGFuIHRoZSB3aW5kb3cgc2Nyb2xsIHByb3BlcnRpZXNcbiAgICAvLyAoZS5nLiBwYWdlWU9mZnNldCwgc2Nyb2xsWSkgZHVlIHRvIGluIGlzc3VlIGluIENocm9tZSBhbmQgSUUgd2hlcmUgd2luZG93IHNjcm9sbFxuICAgIC8vIHByb3BlcnRpZXMgYW5kIGNsaWVudCBjb29yZGluYXRlcyAoYm91bmRpbmdDbGllbnRSZWN0LCBjbGllbnRYL1ksIGV0Yy4pIGFyZSBpbiBkaWZmZXJlbnRcbiAgICAvLyBjb25jZXB0dWFsIHZpZXdwb3J0cy4gVW5kZXIgbW9zdCBjaXJjdW1zdGFuY2VzIHRoZXNlIHZpZXdwb3J0cyBhcmUgZXF1aXZhbGVudCwgYnV0IHRoZXlcbiAgICAvLyBjYW4gZGlzYWdyZWUgd2hlbiB0aGUgcGFnZSBpcyBwaW5jaC16b29tZWQgKG9uIGRldmljZXMgdGhhdCBzdXBwb3J0IHRvdWNoKS5cbiAgICAvLyBTZWUgaHR0cHM6Ly9idWdzLmNocm9taXVtLm9yZy9wL2Nocm9taXVtL2lzc3Vlcy9kZXRhaWw/aWQ9NDg5MjA2I2M0XG4gICAgLy8gV2UgdXNlIHRoZSBkb2N1bWVudEVsZW1lbnQgaW5zdGVhZCBvZiB0aGUgYm9keSBiZWNhdXNlLCBieSBkZWZhdWx0ICh3aXRob3V0IGEgY3NzIHJlc2V0KVxuICAgIC8vIGJyb3dzZXJzIHR5cGljYWxseSBnaXZlIHRoZSBkb2N1bWVudCBib2R5IGFuIDhweCBtYXJnaW4sIHdoaWNoIGlzIG5vdCBpbmNsdWRlZCBpblxuICAgIC8vIGdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLlxuICAgIGNvbnN0IHNjcm9sbFBvc2l0aW9uID0gdGhpcy5nZXRWaWV3cG9ydFNjcm9sbFBvc2l0aW9uKCk7XG4gICAgY29uc3Qge3dpZHRoLCBoZWlnaHR9ID0gdGhpcy5nZXRWaWV3cG9ydFNpemUoKTtcblxuICAgIHJldHVybiB7XG4gICAgICB0b3A6IHNjcm9sbFBvc2l0aW9uLnRvcCxcbiAgICAgIGxlZnQ6IHNjcm9sbFBvc2l0aW9uLmxlZnQsXG4gICAgICBib3R0b206IHNjcm9sbFBvc2l0aW9uLnRvcCArIGhlaWdodCxcbiAgICAgIHJpZ2h0OiBzY3JvbGxQb3NpdGlvbi5sZWZ0ICsgd2lkdGgsXG4gICAgICBoZWlnaHQsXG4gICAgICB3aWR0aCxcbiAgICB9O1xuICB9XG5cbiAgLyoqIEdldHMgdGhlICh0b3AsIGxlZnQpIHNjcm9sbCBwb3NpdGlvbiBvZiB0aGUgdmlld3BvcnQuICovXG4gIGdldFZpZXdwb3J0U2Nyb2xsUG9zaXRpb24oKTogVmlld3BvcnRTY3JvbGxQb3NpdGlvbiB7XG4gICAgLy8gV2hpbGUgd2UgY2FuIGdldCBhIHJlZmVyZW5jZSB0byB0aGUgZmFrZSBkb2N1bWVudFxuICAgIC8vIGR1cmluZyBTU1IsIGl0IGRvZXNuJ3QgaGF2ZSBnZXRCb3VuZGluZ0NsaWVudFJlY3QuXG4gICAgaWYgKCF0aGlzLl9wbGF0Zm9ybS5pc0Jyb3dzZXIpIHtcbiAgICAgIHJldHVybiB7dG9wOiAwLCBsZWZ0OiAwfTtcbiAgICB9XG5cbiAgICAvLyBUaGUgdG9wLWxlZnQtY29ybmVyIG9mIHRoZSB2aWV3cG9ydCBpcyBkZXRlcm1pbmVkIGJ5IHRoZSBzY3JvbGwgcG9zaXRpb24gb2YgdGhlIGRvY3VtZW50XG4gICAgLy8gYm9keSwgbm9ybWFsbHkganVzdCAoc2Nyb2xsTGVmdCwgc2Nyb2xsVG9wKS4gSG93ZXZlciwgQ2hyb21lIGFuZCBGaXJlZm94IGRpc2FncmVlIGFib3V0XG4gICAgLy8gd2hldGhlciBgZG9jdW1lbnQuYm9keWAgb3IgYGRvY3VtZW50LmRvY3VtZW50RWxlbWVudGAgaXMgdGhlIHNjcm9sbGVkIGVsZW1lbnQsIHNvIHJlYWRpbmdcbiAgICAvLyBgc2Nyb2xsVG9wYCBhbmQgYHNjcm9sbExlZnRgIGlzIGluY29uc2lzdGVudC4gSG93ZXZlciwgdXNpbmcgdGhlIGJvdW5kaW5nIHJlY3Qgb2ZcbiAgICAvLyBgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50YCB3b3JrcyBjb25zaXN0ZW50bHksIHdoZXJlIHRoZSBgdG9wYCBhbmQgYGxlZnRgIHZhbHVlcyB3aWxsXG4gICAgLy8gZXF1YWwgbmVnYXRpdmUgdGhlIHNjcm9sbCBwb3NpdGlvbi5cbiAgICBjb25zdCBkb2N1bWVudCA9IHRoaXMuX2RvY3VtZW50O1xuICAgIGNvbnN0IHdpbmRvdyA9IHRoaXMuX2dldFdpbmRvdygpO1xuICAgIGNvbnN0IGRvY3VtZW50RWxlbWVudCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCE7XG4gICAgY29uc3QgZG9jdW1lbnRSZWN0ID0gZG9jdW1lbnRFbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG4gICAgY29uc3QgdG9wID0gLWRvY3VtZW50UmVjdC50b3AgfHwgZG9jdW1lbnQuYm9keS5zY3JvbGxUb3AgfHwgd2luZG93LnNjcm9sbFkgfHxcbiAgICAgICAgICAgICAgICAgZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcCB8fCAwO1xuXG4gICAgY29uc3QgbGVmdCA9IC1kb2N1bWVudFJlY3QubGVmdCB8fCBkb2N1bWVudC5ib2R5LnNjcm9sbExlZnQgfHwgd2luZG93LnNjcm9sbFggfHxcbiAgICAgICAgICAgICAgICAgIGRvY3VtZW50RWxlbWVudC5zY3JvbGxMZWZ0IHx8IDA7XG5cbiAgICByZXR1cm4ge3RvcCwgbGVmdH07XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIHN0cmVhbSB0aGF0IGVtaXRzIHdoZW5ldmVyIHRoZSBzaXplIG9mIHRoZSB2aWV3cG9ydCBjaGFuZ2VzLlxuICAgKiBAcGFyYW0gdGhyb3R0bGVUaW1lIFRpbWUgaW4gbWlsbGlzZWNvbmRzIHRvIHRocm90dGxlIHRoZSBzdHJlYW0uXG4gICAqL1xuICBjaGFuZ2UodGhyb3R0bGVUaW1lOiBudW1iZXIgPSBERUZBVUxUX1JFU0laRV9USU1FKTogT2JzZXJ2YWJsZTxFdmVudD4ge1xuICAgIHJldHVybiB0aHJvdHRsZVRpbWUgPiAwID8gdGhpcy5fY2hhbmdlLnBpcGUoYXVkaXRUaW1lKHRocm90dGxlVGltZSkpIDogdGhpcy5fY2hhbmdlO1xuICB9XG5cbiAgLyoqIFVzZSBkZWZhdWx0VmlldyBvZiBpbmplY3RlZCBkb2N1bWVudCBpZiBhdmFpbGFibGUgb3IgZmFsbGJhY2sgdG8gZ2xvYmFsIHdpbmRvdyByZWZlcmVuY2UgKi9cbiAgcHJpdmF0ZSBfZ2V0V2luZG93KCk6IFdpbmRvdyB7XG4gICAgcmV0dXJuIHRoaXMuX2RvY3VtZW50LmRlZmF1bHRWaWV3IHx8IHdpbmRvdztcbiAgfVxuXG4gIC8qKiBVcGRhdGVzIHRoZSBjYWNoZWQgdmlld3BvcnQgc2l6ZS4gKi9cbiAgcHJpdmF0ZSBfdXBkYXRlVmlld3BvcnRTaXplKCkge1xuICAgIGNvbnN0IHdpbmRvdyA9IHRoaXMuX2dldFdpbmRvdygpO1xuICAgIHRoaXMuX3ZpZXdwb3J0U2l6ZSA9IHRoaXMuX3BsYXRmb3JtLmlzQnJvd3NlciA/XG4gICAgICAgIHt3aWR0aDogd2luZG93LmlubmVyV2lkdGgsIGhlaWdodDogd2luZG93LmlubmVySGVpZ2h0fSA6XG4gICAgICAgIHt3aWR0aDogMCwgaGVpZ2h0OiAwfTtcbiAgfVxufVxuIl19