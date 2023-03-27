/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ViewportScroller } from '@angular/common';
import { Injectable, InjectionToken, NgZone } from '@angular/core';
import { NavigationEnd, NavigationStart, Scroll } from './events';
import { NavigationTransitions } from './navigation_transition';
import { UrlSerializer } from './url_tree';
import * as i0 from "@angular/core";
import * as i1 from "./url_tree";
import * as i2 from "./navigation_transition";
import * as i3 from "@angular/common";
export const ROUTER_SCROLLER = new InjectionToken('');
export class RouterScroller {
    /** @nodoc */
    constructor(urlSerializer, transitions, viewportScroller, zone, options = {}) {
        this.urlSerializer = urlSerializer;
        this.transitions = transitions;
        this.viewportScroller = viewportScroller;
        this.zone = zone;
        this.options = options;
        this.lastId = 0;
        this.lastSource = 'imperative';
        this.restoredId = 0;
        this.store = {};
        // Default both options to 'disabled'
        options.scrollPositionRestoration = options.scrollPositionRestoration || 'disabled';
        options.anchorScrolling = options.anchorScrolling || 'disabled';
    }
    init() {
        // we want to disable the automatic scrolling because having two places
        // responsible for scrolling results race conditions, especially given
        // that browser don't implement this behavior consistently
        if (this.options.scrollPositionRestoration !== 'disabled') {
            this.viewportScroller.setHistoryScrollRestoration('manual');
        }
        this.routerEventsSubscription = this.createScrollEvents();
        this.scrollEventsSubscription = this.consumeScrollEvents();
    }
    createScrollEvents() {
        return this.transitions.events.subscribe(e => {
            if (e instanceof NavigationStart) {
                // store the scroll position of the current stable navigations.
                this.store[this.lastId] = this.viewportScroller.getScrollPosition();
                this.lastSource = e.navigationTrigger;
                this.restoredId = e.restoredState ? e.restoredState.navigationId : 0;
            }
            else if (e instanceof NavigationEnd) {
                this.lastId = e.id;
                this.scheduleScrollEvent(e, this.urlSerializer.parse(e.urlAfterRedirects).fragment);
            }
        });
    }
    consumeScrollEvents() {
        return this.transitions.events.subscribe(e => {
            if (!(e instanceof Scroll))
                return;
            // a popstate event. The pop state event will always ignore anchor scrolling.
            if (e.position) {
                if (this.options.scrollPositionRestoration === 'top') {
                    this.viewportScroller.scrollToPosition([0, 0]);
                }
                else if (this.options.scrollPositionRestoration === 'enabled') {
                    this.viewportScroller.scrollToPosition(e.position);
                }
                // imperative navigation "forward"
            }
            else {
                if (e.anchor && this.options.anchorScrolling === 'enabled') {
                    this.viewportScroller.scrollToAnchor(e.anchor);
                }
                else if (this.options.scrollPositionRestoration !== 'disabled') {
                    this.viewportScroller.scrollToPosition([0, 0]);
                }
            }
        });
    }
    scheduleScrollEvent(routerEvent, anchor) {
        this.zone.runOutsideAngular(() => {
            // The scroll event needs to be delayed until after change detection. Otherwise, we may
            // attempt to restore the scroll position before the router outlet has fully rendered the
            // component by executing its update block of the template function.
            setTimeout(() => {
                this.zone.run(() => {
                    this.transitions.events.next(new Scroll(routerEvent, this.lastSource === 'popstate' ? this.store[this.restoredId] : null, anchor));
                });
            }, 0);
        });
    }
    /** @nodoc */
    ngOnDestroy() {
        this.routerEventsSubscription?.unsubscribe();
        this.scrollEventsSubscription?.unsubscribe();
    }
}
RouterScroller.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.0", ngImport: i0, type: RouterScroller, deps: "invalid", target: i0.ɵɵFactoryTarget.Injectable });
RouterScroller.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "15.2.0", ngImport: i0, type: RouterScroller });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.0", ngImport: i0, type: RouterScroller, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: i1.UrlSerializer }, { type: i2.NavigationTransitions }, { type: i3.ViewportScroller }, { type: i0.NgZone }, { type: undefined }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyX3Njcm9sbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvcm91dGVyL3NyYy9yb3V0ZXJfc2Nyb2xsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLGdCQUFnQixFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDakQsT0FBTyxFQUFDLFVBQVUsRUFBRSxjQUFjLEVBQUUsTUFBTSxFQUFZLE1BQU0sZUFBZSxDQUFDO0FBRzVFLE9BQU8sRUFBQyxhQUFhLEVBQUUsZUFBZSxFQUFFLE1BQU0sRUFBQyxNQUFNLFVBQVUsQ0FBQztBQUNoRSxPQUFPLEVBQUMscUJBQXFCLEVBQUMsTUFBTSx5QkFBeUIsQ0FBQztBQUU5RCxPQUFPLEVBQUMsYUFBYSxFQUFDLE1BQU0sWUFBWSxDQUFDOzs7OztBQUV6QyxNQUFNLENBQUMsTUFBTSxlQUFlLEdBQUcsSUFBSSxjQUFjLENBQWlCLEVBQUUsQ0FBQyxDQUFDO0FBR3RFLE1BQU0sT0FBTyxjQUFjO0lBU3pCLGFBQWE7SUFDYixZQUNhLGFBQTRCLEVBQVUsV0FBa0MsRUFDakUsZ0JBQWtDLEVBQW1CLElBQVksRUFDekUsVUFHSixFQUFFO1FBTEcsa0JBQWEsR0FBYixhQUFhLENBQWU7UUFBVSxnQkFBVyxHQUFYLFdBQVcsQ0FBdUI7UUFDakUscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtRQUFtQixTQUFJLEdBQUosSUFBSSxDQUFRO1FBQ3pFLFlBQU8sR0FBUCxPQUFPLENBR1Q7UUFaRixXQUFNLEdBQUcsQ0FBQyxDQUFDO1FBQ1gsZUFBVSxHQUFtRCxZQUFZLENBQUM7UUFDMUUsZUFBVSxHQUFHLENBQUMsQ0FBQztRQUNmLFVBQUssR0FBc0MsRUFBRSxDQUFDO1FBVXBELHFDQUFxQztRQUNyQyxPQUFPLENBQUMseUJBQXlCLEdBQUcsT0FBTyxDQUFDLHlCQUF5QixJQUFJLFVBQVUsQ0FBQztRQUNw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RTtZQUMvQix1RkFBdUY7WUFDdkYseUZBQXlGO1lBQ3pGLG9FQUFvRTtZQUNwRSxVQUFVLENBQUMsR0FBRyxFQUFFO2dCQUNkLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRTtvQkFDakIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksTUFBTSxDQUNuQyxXQUFXLEVBQUUsSUFBSSxDQUFDLFVBQVUsS0FBSyxVQUFVLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQ2hGLE1BQU0sQ0FBQyxDQUFDLENBQUM7Z0JBQ2YsQ0FBQyxDQUFDLENBQUM7WUFDTCxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDUixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCxhQUFhO0lBQ2IsV0FBVztRQUNULElBQUksQ0FBQyx3QkFBd0IsRUFBRSxXQUFXLEVBQUUsQ0FBQztRQUM3QyxJQUFJLENBQUMsd0JBQXdCLEVBQUUsV0FBVyxFQUFFLENBQUM7SUFDL0MsQ0FBQzs7c0hBdkZVLGNBQWM7MEhBQWQsY0FBYztzR0FBZCxjQUFjO2tCQUQxQixVQUFVIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Vmlld3BvcnRTY3JvbGxlcn0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7SW5qZWN0YWJsZSwgSW5qZWN0aW9uVG9rZW4sIE5nWm9uZSwgT25EZXN0cm95fSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7VW5zdWJzY3JpYmFibGV9IGZyb20gJ3J4anMnO1xuXG5pbXBvcnQge05hdmlnYXRpb25FbmQsIE5hdmlnYXRpb25TdGFydCwgU2Nyb2xsfSBmcm9tICcuL2V2ZW50cyc7XG5pbXBvcnQge05hdmlnYXRpb25UcmFuc2l0aW9uc30gZnJvbSAnLi9uYXZpZ2F0aW9uX3RyYW5zaXRpb24nO1xuaW1wb3J0IHtSb3V0ZXJ9IGZyb20gJy4vcm91dGVyJztcbmltcG9ydCB7VXJsU2VyaWFsaXplcn0gZnJvbSAnLi91cmxfdHJlZSc7XG5cbmV4cG9ydCBjb25zdCBST1VURVJfU0NST0xMRVIgPSBuZXcgSW5qZWN0aW9uVG9rZW48Um91dGVyU2Nyb2xsZXI+KCcnKTtcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFJvdXRlclNjcm9sbGVyIGltcGxlbWVudHMgT25EZXN0cm95IHtcbiAgcHJpdmF0ZSByb3V0ZXJFdmVudHNTdWJzY3JpcHRpb24/OiBVbnN1YnNjcmliYWJsZTtcbiAgcHJpdmF0ZSBzY3JvbGxFdmVudHNTdWJzY3JpcHRpb24/OiBVbnN1YnNjcmliYWJsZTtcblxuICBwcml2YXRlIGxhc3RJZCA9IDA7XG4gIHByaXZhdGUgbGFzdFNvdXJjZTogJ2ltcGVyYXRpdmUnfCdwb3BzdGF0ZSd8J2hhc2hjaGFuZ2UnfHVuZGVmaW5lZCA9ICdpbXBlcmF0aXZlJztcbiAgcHJpdmF0ZSByZXN0b3JlZElkID0gMDtcbiAgcHJpdmF0ZSBzdG9yZToge1trZXk6IHN0cmluZ106IFtudW1iZXIsIG51bWJlcl19ID0ge307XG5cbiAgLyoqIEBub2RvYyAqL1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHJlYWRvbmx5IHVybFNlcmlhbGl6ZXI6IFVybFNlcmlhbGl6ZXIsIHByaXZhdGUgdHJhbnNpdGlvbnM6IE5hdmlnYXRpb25UcmFuc2l0aW9ucyxcbiAgICAgIHB1YmxpYyByZWFkb25seSB2aWV3cG9ydFNjcm9sbGVyOiBWaWV3cG9ydFNjcm9sbGVyLCBwcml2YXRlIHJlYWRvbmx5IHpvbmU6IE5nWm9uZSxcbiAgICAgIHByaXZhdGUgb3B0aW9uczoge1xuICAgICAgICBzY3JvbGxQb3NpdGlvblJlc3RvcmF0aW9uPzogJ2Rpc2FibGVkJ3wnZW5hYmxlZCd8J3RvcCcsXG4gICAgICAgIGFuY2hvclNjcm9sbGluZz86ICdkaXNhYmxlZCd8J2VuYWJsZWQnXG4gICAgICB9ID0ge30pIHtcbiAgICAvLyBEZWZhdWx0IGJvdGggb3B0aW9ucyB0byAnZGlzYWJsZWQnXG4gICAgb3B0aW9ucy5zY3JvbGxQb3NpdGlvblJlc3RvcmF0aW9uID0gb3B0aW9ucy5zY3JvbGxQb3NpdGlvblJlc3RvcmF0aW9uIHx8ICdkaXNhYmxlZCc7XG4gICAgb3B0aW9ucy5hbmNob3JTY3JvbGxpbmcgPSBvcHRpb25zLmFuY2hvclNjcm9sbGluZyB8fCAnZGlzYWJsZWQnO1xuICB9XG5cbiAgaW5pdCgpOiB2b2lkIHtcbiAgICAvLyB3ZSB3YW50IHRvIGRpc2FibGUgdGhlIGF1dG9tYXRpYyBzY3JvbGxpbmcgYmVjYXVzZSBoYXZpbmcgdHdvIHBsYWNlc1xuICAgIC8vIHJlc3BvbnNpYmxlIGZvciBzY3JvbGxpbmcgcmVzdWx0cyByYWNlIGNvbmRpdGlvbnMsIGVzcGVjaWFsbHkgZ2l2ZW5cbiAgICAvLyB0aGF0IGJyb3dzZXIgZG9uJ3QgaW1wbGVtZW50IHRoaXMgYmVoYXZpb3IgY29uc2lzdGVudGx5XG4gICAgaWYgKHRoaXMub3B0aW9ucy5zY3JvbGxQb3NpdGlvblJlc3RvcmF0aW9uICE9PSAnZGlzYWJsZWQnKSB7XG4gICAgICB0aGlzLnZpZXdwb3J0U2Nyb2xsZXIuc2V0SGlzdG9yeVNjcm9sbFJlc3RvcmF0aW9uKCdtYW51YWwnKTtcbiAgICB9XG4gICAgdGhpcy5yb3V0ZXJFdmVudHNTdWJzY3JpcHRpb24gPSB0aGlzLmNyZWF0ZVNjcm9sbEV2ZW50cygpO1xuICAgIHRoaXMuc2Nyb2xsRXZlbnRzU3Vic2NyaXB0aW9uID0gdGhpcy5jb25zdW1lU2Nyb2xsRXZlbnRzKCk7XG4gIH1cblxuICBwcml2YXRlIGNyZWF0ZVNjcm9sbEV2ZW50cygpIHtcbiAgICByZXR1cm4gdGhpcy50cmFuc2l0aW9ucy5ldmVudHMuc3Vic2NyaWJlKGUgPT4ge1xuICAgICAgaWYgKGUgaW5zdGFuY2VvZiBOYXZpZ2F0aW9uU3RhcnQpIHtcbiAgICAgICAgLy8gc3RvcmUgdGhlIHNjcm9sbCBwb3NpdGlvbiBvZiB0aGUgY3VycmVudCBzdGFibGUgbmF2aWdhdGlvbnMuXG4gICAgICAgIHRoaXMuc3RvcmVbdGhpcy5sYXN0SWRdID0gdGhpcy52aWV3cG9ydFNjcm9sbGVyLmdldFNjcm9sbFBvc2l0aW9uKCk7XG4gICAgICAgIHRoaXMubGFzdFNvdXJjZSA9IGUubmF2aWdhdGlvblRyaWdnZXI7XG4gICAgICAgIHRoaXMucmVzdG9yZWRJZCA9IGUucmVzdG9yZWRTdGF0ZSA/IGUucmVzdG9yZWRTdGF0ZS5uYXZpZ2F0aW9uSWQgOiAwO1xuICAgICAgfSBlbHNlIGlmIChlIGluc3RhbmNlb2YgTmF2aWdhdGlvbkVuZCkge1xuICAgICAgICB0aGlzLmxhc3RJZCA9IGUuaWQ7XG4gICAgICAgIHRoaXMuc2NoZWR1bGVTY3JvbGxFdmVudChlLCB0aGlzLnVybFNlcmlhbGl6ZXIucGFyc2UoZS51cmxBZnRlclJlZGlyZWN0cykuZnJhZ21lbnQpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBjb25zdW1lU2Nyb2xsRXZlbnRzKCkge1xuICAgIHJldHVybiB0aGlzLnRyYW5zaXRpb25zLmV2ZW50cy5zdWJzY3JpYmUoZSA9PiB7XG4gICAgICBpZiAoIShlIGluc3RhbmNlb2YgU2Nyb2xsKSkgcmV0dXJuO1xuICAgICAgLy8gYSBwb3BzdGF0ZSBldmVudC4gVGhlIHBvcCBzdGF0ZSBldmVudCB3aWxsIGFsd2F5cyBpZ25vcmUgYW5jaG9yIHNjcm9sbGluZy5cbiAgICAgIGlmIChlLnBvc2l0aW9uKSB7XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuc2Nyb2xsUG9zaXRpb25SZXN0b3JhdGlvbiA9PT0gJ3RvcCcpIHtcbiAgICAgICAgICB0aGlzLnZpZXdwb3J0U2Nyb2xsZXIuc2Nyb2xsVG9Qb3NpdGlvbihbMCwgMF0pO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMub3B0aW9ucy5zY3JvbGxQb3NpdGlvblJlc3RvcmF0aW9uID09PSAnZW5hYmxlZCcpIHtcbiAgICAgICAgICB0aGlzLnZpZXdwb3J0U2Nyb2xsZXIuc2Nyb2xsVG9Qb3NpdGlvbihlLnBvc2l0aW9uKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBpbXBlcmF0aXZlIG5hdmlnYXRpb24gXCJmb3J3YXJkXCJcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChlLmFuY2hvciAmJiB0aGlzLm9wdGlvbnMuYW5jaG9yU2Nyb2xsaW5nID09PSAnZW5hYmxlZCcpIHtcbiAgICAgICAgICB0aGlzLnZpZXdwb3J0U2Nyb2xsZXIuc2Nyb2xsVG9BbmNob3IoZS5hbmNob3IpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMub3B0aW9ucy5zY3JvbGxQb3NpdGlvblJlc3RvcmF0aW9uICE9PSAnZGlzYWJsZWQnKSB7XG4gICAgICAgICAgdGhpcy52aWV3cG9ydFNjcm9sbGVyLnNjcm9sbFRvUG9zaXRpb24oWzAsIDBdKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBzY2hlZHVsZVNjcm9sbEV2ZW50KHJvdXRlckV2ZW50OiBOYXZpZ2F0aW9uRW5kLCBhbmNob3I6IHN0cmluZ3xudWxsKTogdm9pZCB7XG4gICAgdGhpcy56b25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgIC8vIFRoZSBzY3JvbGwgZXZlbnQgbmVlZHMgdG8gYmUgZGVsYXllZCB1bnRpbCBhZnRlciBjaGFuZ2UgZGV0ZWN0aW9uLiBPdGhlcndpc2UsIHdlIG1heVxuICAgICAgLy8gYXR0ZW1wdCB0byByZXN0b3JlIHRoZSBzY3JvbGwgcG9zaXRpb24gYmVmb3JlIHRoZSByb3V0ZXIgb3V0bGV0IGhhcyBmdWxseSByZW5kZXJlZCB0aGVcbiAgICAgIC8vIGNvbXBvbmVudCBieSBleGVjdXRpbmcgaXRzIHVwZGF0ZSBibG9jayBvZiB0aGUgdGVtcGxhdGUgZnVuY3Rpb24uXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgdGhpcy56b25lLnJ1bigoKSA9PiB7XG4gICAgICAgICAgdGhpcy50cmFuc2l0aW9ucy5ldmVudHMubmV4dChuZXcgU2Nyb2xsKFxuICAgICAgICAgICAgICByb3V0ZXJFdmVudCwgdGhpcy5sYXN0U291cmNlID09PSAncG9wc3RhdGUnID8gdGhpcy5zdG9yZVt0aGlzLnJlc3RvcmVkSWRdIDogbnVsbCxcbiAgICAgICAgICAgICAgYW5jaG9yKSk7XG4gICAgICAgIH0pO1xuICAgICAgfSwgMCk7XG4gICAgfSk7XG4gIH1cblxuICAvKiogQG5vZG9jICovXG4gIG5nT25EZXN0cm95KCkge1xuICAgIHRoaXMucm91dGVyRXZlbnRzU3Vic2NyaXB0aW9uPy51bnN1YnNjcmliZSgpO1xuICAgIHRoaXMuc2Nyb2xsRXZlbnRzU3Vic2NyaXB0aW9uPy51bnN1YnNjcmliZSgpO1xuICB9XG59XG4iXX0=