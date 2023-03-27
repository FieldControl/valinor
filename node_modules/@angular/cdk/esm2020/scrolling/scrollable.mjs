/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directionality } from '@angular/cdk/bidi';
import { getRtlScrollAxisType, supportsScrollBehavior, } from '@angular/cdk/platform';
import { Directive, ElementRef, NgZone, Optional } from '@angular/core';
import { fromEvent, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ScrollDispatcher } from './scroll-dispatcher';
import * as i0 from "@angular/core";
import * as i1 from "./scroll-dispatcher";
import * as i2 from "@angular/cdk/bidi";
/**
 * Sends an event when the directive's element is scrolled. Registers itself with the
 * ScrollDispatcher service to include itself as part of its collection of scrolling events that it
 * can be listened to through the service.
 */
export class CdkScrollable {
    constructor(elementRef, scrollDispatcher, ngZone, dir) {
        this.elementRef = elementRef;
        this.scrollDispatcher = scrollDispatcher;
        this.ngZone = ngZone;
        this.dir = dir;
        this._destroyed = new Subject();
        this._elementScrolled = new Observable((observer) => this.ngZone.runOutsideAngular(() => fromEvent(this.elementRef.nativeElement, 'scroll')
            .pipe(takeUntil(this._destroyed))
            .subscribe(observer)));
    }
    ngOnInit() {
        this.scrollDispatcher.register(this);
    }
    ngOnDestroy() {
        this.scrollDispatcher.deregister(this);
        this._destroyed.next();
        this._destroyed.complete();
    }
    /** Returns observable that emits when a scroll event is fired on the host element. */
    elementScrolled() {
        return this._elementScrolled;
    }
    /** Gets the ElementRef for the viewport. */
    getElementRef() {
        return this.elementRef;
    }
    /**
     * Scrolls to the specified offsets. This is a normalized version of the browser's native scrollTo
     * method, since browsers are not consistent about what scrollLeft means in RTL. For this method
     * left and right always refer to the left and right side of the scrolling container irrespective
     * of the layout direction. start and end refer to left and right in an LTR context and vice-versa
     * in an RTL context.
     * @param options specified the offsets to scroll to.
     */
    scrollTo(options) {
        const el = this.elementRef.nativeElement;
        const isRtl = this.dir && this.dir.value == 'rtl';
        // Rewrite start & end offsets as right or left offsets.
        if (options.left == null) {
            options.left = isRtl ? options.end : options.start;
        }
        if (options.right == null) {
            options.right = isRtl ? options.start : options.end;
        }
        // Rewrite the bottom offset as a top offset.
        if (options.bottom != null) {
            options.top =
                el.scrollHeight - el.clientHeight - options.bottom;
        }
        // Rewrite the right offset as a left offset.
        if (isRtl && getRtlScrollAxisType() != 0 /* RtlScrollAxisType.NORMAL */) {
            if (options.left != null) {
                options.right =
                    el.scrollWidth - el.clientWidth - options.left;
            }
            if (getRtlScrollAxisType() == 2 /* RtlScrollAxisType.INVERTED */) {
                options.left = options.right;
            }
            else if (getRtlScrollAxisType() == 1 /* RtlScrollAxisType.NEGATED */) {
                options.left = options.right ? -options.right : options.right;
            }
        }
        else {
            if (options.right != null) {
                options.left =
                    el.scrollWidth - el.clientWidth - options.right;
            }
        }
        this._applyScrollToOptions(options);
    }
    _applyScrollToOptions(options) {
        const el = this.elementRef.nativeElement;
        if (supportsScrollBehavior()) {
            el.scrollTo(options);
        }
        else {
            if (options.top != null) {
                el.scrollTop = options.top;
            }
            if (options.left != null) {
                el.scrollLeft = options.left;
            }
        }
    }
    /**
     * Measures the scroll offset relative to the specified edge of the viewport. This method can be
     * used instead of directly checking scrollLeft or scrollTop, since browsers are not consistent
     * about what scrollLeft means in RTL. The values returned by this method are normalized such that
     * left and right always refer to the left and right side of the scrolling container irrespective
     * of the layout direction. start and end refer to left and right in an LTR context and vice-versa
     * in an RTL context.
     * @param from The edge to measure from.
     */
    measureScrollOffset(from) {
        const LEFT = 'left';
        const RIGHT = 'right';
        const el = this.elementRef.nativeElement;
        if (from == 'top') {
            return el.scrollTop;
        }
        if (from == 'bottom') {
            return el.scrollHeight - el.clientHeight - el.scrollTop;
        }
        // Rewrite start & end as left or right offsets.
        const isRtl = this.dir && this.dir.value == 'rtl';
        if (from == 'start') {
            from = isRtl ? RIGHT : LEFT;
        }
        else if (from == 'end') {
            from = isRtl ? LEFT : RIGHT;
        }
        if (isRtl && getRtlScrollAxisType() == 2 /* RtlScrollAxisType.INVERTED */) {
            // For INVERTED, scrollLeft is (scrollWidth - clientWidth) when scrolled all the way left and
            // 0 when scrolled all the way right.
            if (from == LEFT) {
                return el.scrollWidth - el.clientWidth - el.scrollLeft;
            }
            else {
                return el.scrollLeft;
            }
        }
        else if (isRtl && getRtlScrollAxisType() == 1 /* RtlScrollAxisType.NEGATED */) {
            // For NEGATED, scrollLeft is -(scrollWidth - clientWidth) when scrolled all the way left and
            // 0 when scrolled all the way right.
            if (from == LEFT) {
                return el.scrollLeft + el.scrollWidth - el.clientWidth;
            }
            else {
                return -el.scrollLeft;
            }
        }
        else {
            // For NORMAL, as well as non-RTL contexts, scrollLeft is 0 when scrolled all the way left and
            // (scrollWidth - clientWidth) when scrolled all the way right.
            if (from == LEFT) {
                return el.scrollLeft;
            }
            else {
                return el.scrollWidth - el.clientWidth - el.scrollLeft;
            }
        }
    }
}
CdkScrollable.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: CdkScrollable, deps: [{ token: i0.ElementRef }, { token: i1.ScrollDispatcher }, { token: i0.NgZone }, { token: i2.Directionality, optional: true }], target: i0.ɵɵFactoryTarget.Directive });
CdkScrollable.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "15.2.0-rc.0", type: CdkScrollable, isStandalone: true, selector: "[cdk-scrollable], [cdkScrollable]", ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: CdkScrollable, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdk-scrollable], [cdkScrollable]',
                    standalone: true,
                }]
        }], ctorParameters: function () { return [{ type: i0.ElementRef }, { type: i1.ScrollDispatcher }, { type: i0.NgZone }, { type: i2.Directionality, decorators: [{
                    type: Optional
                }] }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2Nyb2xsYWJsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvc2Nyb2xsaW5nL3Njcm9sbGFibGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQ2pELE9BQU8sRUFDTCxvQkFBb0IsRUFFcEIsc0JBQXNCLEdBQ3ZCLE1BQU0sdUJBQXVCLENBQUM7QUFDL0IsT0FBTyxFQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFxQixRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDekYsT0FBTyxFQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFXLE1BQU0sTUFBTSxDQUFDO0FBQzlELE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUN6QyxPQUFPLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQzs7OztBQXFCckQ7Ozs7R0FJRztBQUtILE1BQU0sT0FBTyxhQUFhO0lBV3hCLFlBQ1ksVUFBbUMsRUFDbkMsZ0JBQWtDLEVBQ2xDLE1BQWMsRUFDRixHQUFvQjtRQUhoQyxlQUFVLEdBQVYsVUFBVSxDQUF5QjtRQUNuQyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1FBQ2xDLFdBQU0sR0FBTixNQUFNLENBQVE7UUFDRixRQUFHLEdBQUgsR0FBRyxDQUFpQjtRQWR6QixlQUFVLEdBQUcsSUFBSSxPQUFPLEVBQVEsQ0FBQztRQUUxQyxxQkFBZ0IsR0FBc0IsSUFBSSxVQUFVLENBQUMsQ0FBQyxRQUF5QixFQUFFLEVBQUUsQ0FDM0YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLEVBQUUsQ0FDakMsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsYUFBYSxFQUFFLFFBQVEsQ0FBQzthQUMvQyxJQUFJLENBQUMsU0FBUyxDQUFDLElB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Q0FBOEIsRUFBRTtZQUNqRSw2RkFBNkY7WUFDN0YscUNBQXFDO1lBQ3JDLElBQUksSUFBSSxJQUFJLElBQUksRUFBRTtnQkFDaEIsT0FBTyxFQUFFLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDLFVBQVUsQ0FBQzthQUN4RDtpQkFBTTtnQkFDTCxPQUFPLEVBQUUsQ0FBQyxVQUFVLENBQUM7YUFDdEI7U0FDRjthQUFNLElBQUksS0FBSyxJQUFJLG9CQUFvQixFQUFFLHFDQUE2QixFQUFFO1lBQ3ZFLDZGQUE2RjtZQUM3RixxQ0FBcUM7WUFDckMsSUFBSSxJQUFJLElBQUksSUFBSSxFQUFFO2dCQUNoQixPQUFPLEVBQUUsQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUMsV0FBVyxDQUFDO2FBQ3hEO2lCQUFNO2dCQUNMLE9BQU8sQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDO2FBQ3ZCO1NBQ0Y7YUFBTTtZQUNMLDhGQUE4RjtZQUM5RiwrREFBK0Q7WUFDL0QsSUFBSSxJQUFJLElBQUksSUFBSSxFQUFFO2dCQUNoQixPQUFPLEVBQUUsQ0FBQyxVQUFVLENBQUM7YUFDdEI7aUJBQU07Z0JBQ0wsT0FBTyxFQUFFLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDLFVBQVUsQ0FBQzthQUN4RDtTQUNGO0lBQ0gsQ0FBQzs7K0dBM0pVLGFBQWE7bUdBQWIsYUFBYTtnR0FBYixhQUFhO2tCQUp6QixTQUFTO21CQUFDO29CQUNULFFBQVEsRUFBRSxtQ0FBbUM7b0JBQzdDLFVBQVUsRUFBRSxJQUFJO2lCQUNqQjs7MEJBZ0JJLFFBQVEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtEaXJlY3Rpb25hbGl0eX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2JpZGknO1xuaW1wb3J0IHtcbiAgZ2V0UnRsU2Nyb2xsQXhpc1R5cGUsXG4gIFJ0bFNjcm9sbEF4aXNUeXBlLFxuICBzdXBwb3J0c1Njcm9sbEJlaGF2aW9yLFxufSBmcm9tICdAYW5ndWxhci9jZGsvcGxhdGZvcm0nO1xuaW1wb3J0IHtEaXJlY3RpdmUsIEVsZW1lbnRSZWYsIE5nWm9uZSwgT25EZXN0cm95LCBPbkluaXQsIE9wdGlvbmFsfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7ZnJvbUV2ZW50LCBPYnNlcnZhYmxlLCBTdWJqZWN0LCBPYnNlcnZlcn0gZnJvbSAncnhqcyc7XG5pbXBvcnQge3Rha2VVbnRpbH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0IHtTY3JvbGxEaXNwYXRjaGVyfSBmcm9tICcuL3Njcm9sbC1kaXNwYXRjaGVyJztcblxuZXhwb3J0IHR5cGUgX1dpdGhvdXQ8VD4gPSB7W1AgaW4ga2V5b2YgVF0/OiBuZXZlcn07XG5leHBvcnQgdHlwZSBfWE9SPFQsIFU+ID0gKF9XaXRob3V0PFQ+ICYgVSkgfCAoX1dpdGhvdXQ8VT4gJiBUKTtcbmV4cG9ydCB0eXBlIF9Ub3AgPSB7dG9wPzogbnVtYmVyfTtcbmV4cG9ydCB0eXBlIF9Cb3R0b20gPSB7Ym90dG9tPzogbnVtYmVyfTtcbmV4cG9ydCB0eXBlIF9MZWZ0ID0ge2xlZnQ/OiBudW1iZXJ9O1xuZXhwb3J0IHR5cGUgX1JpZ2h0ID0ge3JpZ2h0PzogbnVtYmVyfTtcbmV4cG9ydCB0eXBlIF9TdGFydCA9IHtzdGFydD86IG51bWJlcn07XG5leHBvcnQgdHlwZSBfRW5kID0ge2VuZD86IG51bWJlcn07XG5leHBvcnQgdHlwZSBfWEF4aXMgPSBfWE9SPF9YT1I8X0xlZnQsIF9SaWdodD4sIF9YT1I8X1N0YXJ0LCBfRW5kPj47XG5leHBvcnQgdHlwZSBfWUF4aXMgPSBfWE9SPF9Ub3AsIF9Cb3R0b20+O1xuXG4vKipcbiAqIEFuIGV4dGVuZGVkIHZlcnNpb24gb2YgU2Nyb2xsVG9PcHRpb25zIHRoYXQgYWxsb3dzIGV4cHJlc3Npbmcgc2Nyb2xsIG9mZnNldHMgcmVsYXRpdmUgdG8gdGhlXG4gKiB0b3AsIGJvdHRvbSwgbGVmdCwgcmlnaHQsIHN0YXJ0LCBvciBlbmQgb2YgdGhlIHZpZXdwb3J0IHJhdGhlciB0aGFuIGp1c3QgdGhlIHRvcCBhbmQgbGVmdC5cbiAqIFBsZWFzZSBub3RlOiB0aGUgdG9wIGFuZCBib3R0b20gcHJvcGVydGllcyBhcmUgbXV0dWFsbHkgZXhjbHVzaXZlLCBhcyBhcmUgdGhlIGxlZnQsIHJpZ2h0LFxuICogc3RhcnQsIGFuZCBlbmQgcHJvcGVydGllcy5cbiAqL1xuZXhwb3J0IHR5cGUgRXh0ZW5kZWRTY3JvbGxUb09wdGlvbnMgPSBfWEF4aXMgJiBfWUF4aXMgJiBTY3JvbGxPcHRpb25zO1xuXG4vKipcbiAqIFNlbmRzIGFuIGV2ZW50IHdoZW4gdGhlIGRpcmVjdGl2ZSdzIGVsZW1lbnQgaXMgc2Nyb2xsZWQuIFJlZ2lzdGVycyBpdHNlbGYgd2l0aCB0aGVcbiAqIFNjcm9sbERpc3BhdGNoZXIgc2VydmljZSB0byBpbmNsdWRlIGl0c2VsZiBhcyBwYXJ0IG9mIGl0cyBjb2xsZWN0aW9uIG9mIHNjcm9sbGluZyBldmVudHMgdGhhdCBpdFxuICogY2FuIGJlIGxpc3RlbmVkIHRvIHRocm91Z2ggdGhlIHNlcnZpY2UuXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tjZGstc2Nyb2xsYWJsZV0sIFtjZGtTY3JvbGxhYmxlXScsXG4gIHN0YW5kYWxvbmU6IHRydWUsXG59KVxuZXhwb3J0IGNsYXNzIENka1Njcm9sbGFibGUgaW1wbGVtZW50cyBPbkluaXQsIE9uRGVzdHJveSB7XG4gIHByb3RlY3RlZCByZWFkb25seSBfZGVzdHJveWVkID0gbmV3IFN1YmplY3Q8dm9pZD4oKTtcblxuICBwcm90ZWN0ZWQgX2VsZW1lbnRTY3JvbGxlZDogT2JzZXJ2YWJsZTxFdmVudD4gPSBuZXcgT2JzZXJ2YWJsZSgob2JzZXJ2ZXI6IE9ic2VydmVyPEV2ZW50PikgPT5cbiAgICB0aGlzLm5nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PlxuICAgICAgZnJvbUV2ZW50KHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LCAnc2Nyb2xsJylcbiAgICAgICAgLnBpcGUodGFrZVVudGlsKHRoaXMuX2Rlc3Ryb3llZCkpXG4gICAgICAgIC5zdWJzY3JpYmUob2JzZXJ2ZXIpLFxuICAgICksXG4gICk7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJvdGVjdGVkIGVsZW1lbnRSZWY6IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+LFxuICAgIHByb3RlY3RlZCBzY3JvbGxEaXNwYXRjaGVyOiBTY3JvbGxEaXNwYXRjaGVyLFxuICAgIHByb3RlY3RlZCBuZ1pvbmU6IE5nWm9uZSxcbiAgICBAT3B0aW9uYWwoKSBwcm90ZWN0ZWQgZGlyPzogRGlyZWN0aW9uYWxpdHksXG4gICkge31cblxuICBuZ09uSW5pdCgpIHtcbiAgICB0aGlzLnNjcm9sbERpc3BhdGNoZXIucmVnaXN0ZXIodGhpcyk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLnNjcm9sbERpc3BhdGNoZXIuZGVyZWdpc3Rlcih0aGlzKTtcbiAgICB0aGlzLl9kZXN0cm95ZWQubmV4dCgpO1xuICAgIHRoaXMuX2Rlc3Ryb3llZC5jb21wbGV0ZSgpO1xuICB9XG5cbiAgLyoqIFJldHVybnMgb2JzZXJ2YWJsZSB0aGF0IGVtaXRzIHdoZW4gYSBzY3JvbGwgZXZlbnQgaXMgZmlyZWQgb24gdGhlIGhvc3QgZWxlbWVudC4gKi9cbiAgZWxlbWVudFNjcm9sbGVkKCk6IE9ic2VydmFibGU8RXZlbnQ+IHtcbiAgICByZXR1cm4gdGhpcy5fZWxlbWVudFNjcm9sbGVkO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIEVsZW1lbnRSZWYgZm9yIHRoZSB2aWV3cG9ydC4gKi9cbiAgZ2V0RWxlbWVudFJlZigpOiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PiB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudFJlZjtcbiAgfVxuXG4gIC8qKlxuICAgKiBTY3JvbGxzIHRvIHRoZSBzcGVjaWZpZWQgb2Zmc2V0cy4gVGhpcyBpcyBhIG5vcm1hbGl6ZWQgdmVyc2lvbiBvZiB0aGUgYnJvd3NlcidzIG5hdGl2ZSBzY3JvbGxUb1xuICAgKiBtZXRob2QsIHNpbmNlIGJyb3dzZXJzIGFyZSBub3QgY29uc2lzdGVudCBhYm91dCB3aGF0IHNjcm9sbExlZnQgbWVhbnMgaW4gUlRMLiBGb3IgdGhpcyBtZXRob2RcbiAgICogbGVmdCBhbmQgcmlnaHQgYWx3YXlzIHJlZmVyIHRvIHRoZSBsZWZ0IGFuZCByaWdodCBzaWRlIG9mIHRoZSBzY3JvbGxpbmcgY29udGFpbmVyIGlycmVzcGVjdGl2ZVxuICAgKiBvZiB0aGUgbGF5b3V0IGRpcmVjdGlvbi4gc3RhcnQgYW5kIGVuZCByZWZlciB0byBsZWZ0IGFuZCByaWdodCBpbiBhbiBMVFIgY29udGV4dCBhbmQgdmljZS12ZXJzYVxuICAgKiBpbiBhbiBSVEwgY29udGV4dC5cbiAgICogQHBhcmFtIG9wdGlvbnMgc3BlY2lmaWVkIHRoZSBvZmZzZXRzIHRvIHNjcm9sbCB0by5cbiAgICovXG4gIHNjcm9sbFRvKG9wdGlvbnM6IEV4dGVuZGVkU2Nyb2xsVG9PcHRpb25zKTogdm9pZCB7XG4gICAgY29uc3QgZWwgPSB0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudDtcbiAgICBjb25zdCBpc1J0bCA9IHRoaXMuZGlyICYmIHRoaXMuZGlyLnZhbHVlID09ICdydGwnO1xuXG4gICAgLy8gUmV3cml0ZSBzdGFydCAmIGVuZCBvZmZzZXRzIGFzIHJpZ2h0IG9yIGxlZnQgb2Zmc2V0cy5cbiAgICBpZiAob3B0aW9ucy5sZWZ0ID09IG51bGwpIHtcbiAgICAgIG9wdGlvbnMubGVmdCA9IGlzUnRsID8gb3B0aW9ucy5lbmQgOiBvcHRpb25zLnN0YXJ0O1xuICAgIH1cblxuICAgIGlmIChvcHRpb25zLnJpZ2h0ID09IG51bGwpIHtcbiAgICAgIG9wdGlvbnMucmlnaHQgPSBpc1J0bCA/IG9wdGlvbnMuc3RhcnQgOiBvcHRpb25zLmVuZDtcbiAgICB9XG5cbiAgICAvLyBSZXdyaXRlIHRoZSBib3R0b20gb2Zmc2V0IGFzIGEgdG9wIG9mZnNldC5cbiAgICBpZiAob3B0aW9ucy5ib3R0b20gIT0gbnVsbCkge1xuICAgICAgKG9wdGlvbnMgYXMgX1dpdGhvdXQ8X0JvdHRvbT4gJiBfVG9wKS50b3AgPVxuICAgICAgICBlbC5zY3JvbGxIZWlnaHQgLSBlbC5jbGllbnRIZWlnaHQgLSBvcHRpb25zLmJvdHRvbTtcbiAgICB9XG5cbiAgICAvLyBSZXdyaXRlIHRoZSByaWdodCBvZmZzZXQgYXMgYSBsZWZ0IG9mZnNldC5cbiAgICBpZiAoaXNSdGwgJiYgZ2V0UnRsU2Nyb2xsQXhpc1R5cGUoKSAhPSBSdGxTY3JvbGxBeGlzVHlwZS5OT1JNQUwpIHtcbiAgICAgIGlmIChvcHRpb25zLmxlZnQgIT0gbnVsbCkge1xuICAgICAgICAob3B0aW9ucyBhcyBfV2l0aG91dDxfTGVmdD4gJiBfUmlnaHQpLnJpZ2h0ID1cbiAgICAgICAgICBlbC5zY3JvbGxXaWR0aCAtIGVsLmNsaWVudFdpZHRoIC0gb3B0aW9ucy5sZWZ0O1xuICAgICAgfVxuXG4gICAgICBpZiAoZ2V0UnRsU2Nyb2xsQXhpc1R5cGUoKSA9PSBSdGxTY3JvbGxBeGlzVHlwZS5JTlZFUlRFRCkge1xuICAgICAgICBvcHRpb25zLmxlZnQgPSBvcHRpb25zLnJpZ2h0O1xuICAgICAgfSBlbHNlIGlmIChnZXRSdGxTY3JvbGxBeGlzVHlwZSgpID09IFJ0bFNjcm9sbEF4aXNUeXBlLk5FR0FURUQpIHtcbiAgICAgICAgb3B0aW9ucy5sZWZ0ID0gb3B0aW9ucy5yaWdodCA/IC1vcHRpb25zLnJpZ2h0IDogb3B0aW9ucy5yaWdodDtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKG9wdGlvbnMucmlnaHQgIT0gbnVsbCkge1xuICAgICAgICAob3B0aW9ucyBhcyBfV2l0aG91dDxfUmlnaHQ+ICYgX0xlZnQpLmxlZnQgPVxuICAgICAgICAgIGVsLnNjcm9sbFdpZHRoIC0gZWwuY2xpZW50V2lkdGggLSBvcHRpb25zLnJpZ2h0O1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuX2FwcGx5U2Nyb2xsVG9PcHRpb25zKG9wdGlvbnMpO1xuICB9XG5cbiAgcHJpdmF0ZSBfYXBwbHlTY3JvbGxUb09wdGlvbnMob3B0aW9uczogU2Nyb2xsVG9PcHRpb25zKTogdm9pZCB7XG4gICAgY29uc3QgZWwgPSB0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudDtcblxuICAgIGlmIChzdXBwb3J0c1Njcm9sbEJlaGF2aW9yKCkpIHtcbiAgICAgIGVsLnNjcm9sbFRvKG9wdGlvbnMpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAob3B0aW9ucy50b3AgIT0gbnVsbCkge1xuICAgICAgICBlbC5zY3JvbGxUb3AgPSBvcHRpb25zLnRvcDtcbiAgICAgIH1cbiAgICAgIGlmIChvcHRpb25zLmxlZnQgIT0gbnVsbCkge1xuICAgICAgICBlbC5zY3JvbGxMZWZ0ID0gb3B0aW9ucy5sZWZ0O1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBNZWFzdXJlcyB0aGUgc2Nyb2xsIG9mZnNldCByZWxhdGl2ZSB0byB0aGUgc3BlY2lmaWVkIGVkZ2Ugb2YgdGhlIHZpZXdwb3J0LiBUaGlzIG1ldGhvZCBjYW4gYmVcbiAgICogdXNlZCBpbnN0ZWFkIG9mIGRpcmVjdGx5IGNoZWNraW5nIHNjcm9sbExlZnQgb3Igc2Nyb2xsVG9wLCBzaW5jZSBicm93c2VycyBhcmUgbm90IGNvbnNpc3RlbnRcbiAgICogYWJvdXQgd2hhdCBzY3JvbGxMZWZ0IG1lYW5zIGluIFJUTC4gVGhlIHZhbHVlcyByZXR1cm5lZCBieSB0aGlzIG1ldGhvZCBhcmUgbm9ybWFsaXplZCBzdWNoIHRoYXRcbiAgICogbGVmdCBhbmQgcmlnaHQgYWx3YXlzIHJlZmVyIHRvIHRoZSBsZWZ0IGFuZCByaWdodCBzaWRlIG9mIHRoZSBzY3JvbGxpbmcgY29udGFpbmVyIGlycmVzcGVjdGl2ZVxuICAgKiBvZiB0aGUgbGF5b3V0IGRpcmVjdGlvbi4gc3RhcnQgYW5kIGVuZCByZWZlciB0byBsZWZ0IGFuZCByaWdodCBpbiBhbiBMVFIgY29udGV4dCBhbmQgdmljZS12ZXJzYVxuICAgKiBpbiBhbiBSVEwgY29udGV4dC5cbiAgICogQHBhcmFtIGZyb20gVGhlIGVkZ2UgdG8gbWVhc3VyZSBmcm9tLlxuICAgKi9cbiAgbWVhc3VyZVNjcm9sbE9mZnNldChmcm9tOiAndG9wJyB8ICdsZWZ0JyB8ICdyaWdodCcgfCAnYm90dG9tJyB8ICdzdGFydCcgfCAnZW5kJyk6IG51bWJlciB7XG4gICAgY29uc3QgTEVGVCA9ICdsZWZ0JztcbiAgICBjb25zdCBSSUdIVCA9ICdyaWdodCc7XG4gICAgY29uc3QgZWwgPSB0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudDtcbiAgICBpZiAoZnJvbSA9PSAndG9wJykge1xuICAgICAgcmV0dXJuIGVsLnNjcm9sbFRvcDtcbiAgICB9XG4gICAgaWYgKGZyb20gPT0gJ2JvdHRvbScpIHtcbiAgICAgIHJldHVybiBlbC5zY3JvbGxIZWlnaHQgLSBlbC5jbGllbnRIZWlnaHQgLSBlbC5zY3JvbGxUb3A7XG4gICAgfVxuXG4gICAgLy8gUmV3cml0ZSBzdGFydCAmIGVuZCBhcyBsZWZ0IG9yIHJpZ2h0IG9mZnNldHMuXG4gICAgY29uc3QgaXNSdGwgPSB0aGlzLmRpciAmJiB0aGlzLmRpci52YWx1ZSA9PSAncnRsJztcbiAgICBpZiAoZnJvbSA9PSAnc3RhcnQnKSB7XG4gICAgICBmcm9tID0gaXNSdGwgPyBSSUdIVCA6IExFRlQ7XG4gICAgfSBlbHNlIGlmIChmcm9tID09ICdlbmQnKSB7XG4gICAgICBmcm9tID0gaXNSdGwgPyBMRUZUIDogUklHSFQ7XG4gICAgfVxuXG4gICAgaWYgKGlzUnRsICYmIGdldFJ0bFNjcm9sbEF4aXNUeXBlKCkgPT0gUnRsU2Nyb2xsQXhpc1R5cGUuSU5WRVJURUQpIHtcbiAgICAgIC8vIEZvciBJTlZFUlRFRCwgc2Nyb2xsTGVmdCBpcyAoc2Nyb2xsV2lkdGggLSBjbGllbnRXaWR0aCkgd2hlbiBzY3JvbGxlZCBhbGwgdGhlIHdheSBsZWZ0IGFuZFxuICAgICAgLy8gMCB3aGVuIHNjcm9sbGVkIGFsbCB0aGUgd2F5IHJpZ2h0LlxuICAgICAgaWYgKGZyb20gPT0gTEVGVCkge1xuICAgICAgICByZXR1cm4gZWwuc2Nyb2xsV2lkdGggLSBlbC5jbGllbnRXaWR0aCAtIGVsLnNjcm9sbExlZnQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZWwuc2Nyb2xsTGVmdDtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGlzUnRsICYmIGdldFJ0bFNjcm9sbEF4aXNUeXBlKCkgPT0gUnRsU2Nyb2xsQXhpc1R5cGUuTkVHQVRFRCkge1xuICAgICAgLy8gRm9yIE5FR0FURUQsIHNjcm9sbExlZnQgaXMgLShzY3JvbGxXaWR0aCAtIGNsaWVudFdpZHRoKSB3aGVuIHNjcm9sbGVkIGFsbCB0aGUgd2F5IGxlZnQgYW5kXG4gICAgICAvLyAwIHdoZW4gc2Nyb2xsZWQgYWxsIHRoZSB3YXkgcmlnaHQuXG4gICAgICBpZiAoZnJvbSA9PSBMRUZUKSB7XG4gICAgICAgIHJldHVybiBlbC5zY3JvbGxMZWZ0ICsgZWwuc2Nyb2xsV2lkdGggLSBlbC5jbGllbnRXaWR0aDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiAtZWwuc2Nyb2xsTGVmdDtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gRm9yIE5PUk1BTCwgYXMgd2VsbCBhcyBub24tUlRMIGNvbnRleHRzLCBzY3JvbGxMZWZ0IGlzIDAgd2hlbiBzY3JvbGxlZCBhbGwgdGhlIHdheSBsZWZ0IGFuZFxuICAgICAgLy8gKHNjcm9sbFdpZHRoIC0gY2xpZW50V2lkdGgpIHdoZW4gc2Nyb2xsZWQgYWxsIHRoZSB3YXkgcmlnaHQuXG4gICAgICBpZiAoZnJvbSA9PSBMRUZUKSB7XG4gICAgICAgIHJldHVybiBlbC5zY3JvbGxMZWZ0O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGVsLnNjcm9sbFdpZHRoIC0gZWwuY2xpZW50V2lkdGggLSBlbC5zY3JvbGxMZWZ0O1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIl19