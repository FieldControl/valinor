/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { _getEventTarget } from '@angular/cdk/platform';
import { getMutableClientRect, adjustClientRect } from './client-rect';
/** Keeps track of the scroll position and dimensions of the parents of an element. */
export class ParentPositionTracker {
    constructor(_document) {
        this._document = _document;
        /** Cached positions of the scrollable parent elements. */
        this.positions = new Map();
    }
    /** Clears the cached positions. */
    clear() {
        this.positions.clear();
    }
    /** Caches the positions. Should be called at the beginning of a drag sequence. */
    cache(elements) {
        this.clear();
        this.positions.set(this._document, {
            scrollPosition: this.getViewportScrollPosition(),
        });
        elements.forEach(element => {
            this.positions.set(element, {
                scrollPosition: { top: element.scrollTop, left: element.scrollLeft },
                clientRect: getMutableClientRect(element),
            });
        });
    }
    /** Handles scrolling while a drag is taking place. */
    handleScroll(event) {
        const target = _getEventTarget(event);
        const cachedPosition = this.positions.get(target);
        if (!cachedPosition) {
            return null;
        }
        const scrollPosition = cachedPosition.scrollPosition;
        let newTop;
        let newLeft;
        if (target === this._document) {
            const viewportScrollPosition = this.getViewportScrollPosition();
            newTop = viewportScrollPosition.top;
            newLeft = viewportScrollPosition.left;
        }
        else {
            newTop = target.scrollTop;
            newLeft = target.scrollLeft;
        }
        const topDifference = scrollPosition.top - newTop;
        const leftDifference = scrollPosition.left - newLeft;
        // Go through and update the cached positions of the scroll
        // parents that are inside the element that was scrolled.
        this.positions.forEach((position, node) => {
            if (position.clientRect && target !== node && target.contains(node)) {
                adjustClientRect(position.clientRect, topDifference, leftDifference);
            }
        });
        scrollPosition.top = newTop;
        scrollPosition.left = newLeft;
        return { top: topDifference, left: leftDifference };
    }
    /**
     * Gets the scroll position of the viewport. Note that we use the scrollX and scrollY directly,
     * instead of going through the `ViewportRuler`, because the first value the ruler looks at is
     * the top/left offset of the `document.documentElement` which works for most cases, but breaks
     * if the element is offset by something like the `BlockScrollStrategy`.
     */
    getViewportScrollPosition() {
        return { top: window.scrollY, left: window.scrollX };
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyZW50LXBvc2l0aW9uLXRyYWNrZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL2RyYWctZHJvcC9kb20vcGFyZW50LXBvc2l0aW9uLXRyYWNrZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQ3RELE9BQU8sRUFBQyxvQkFBb0IsRUFBRSxnQkFBZ0IsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQVFyRSxzRkFBc0Y7QUFDdEYsTUFBTSxPQUFPLHFCQUFxQjtJQVVoQyxZQUFvQixTQUFtQjtRQUFuQixjQUFTLEdBQVQsU0FBUyxDQUFVO1FBVHZDLDBEQUEwRDtRQUNqRCxjQUFTLEdBQUcsSUFBSSxHQUFHLEVBTXpCLENBQUM7SUFFc0MsQ0FBQztJQUUzQyxtQ0FBbUM7SUFDbkMsS0FBSztRQUNILElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDekIsQ0FBQztJQUVELGtGQUFrRjtJQUNsRixLQUFLLENBQUMsUUFBZ0M7UUFDcEMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ2IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUNqQyxjQUFjLEVBQUUsSUFBSSxDQUFDLHlCQUF5QixFQUFFO1NBQ2pELENBQUMsQ0FBQztRQUVILFFBQVEsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUU7WUFDekIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFO2dCQUMxQixjQUFjLEVBQUUsRUFBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLFVBQVUsRUFBQztnQkFDbEUsVUFBVSxFQUFFLG9CQUFvQixDQUFDLE9BQU8sQ0FBQzthQUMxQyxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCxzREFBc0Q7SUFDdEQsWUFBWSxDQUFDLEtBQVk7UUFDdkIsTUFBTSxNQUFNLEdBQUcsZUFBZSxDQUF5QixLQUFLLENBQUUsQ0FBQztRQUMvRCxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUVsRCxJQUFJLENBQUMsY0FBYyxFQUFFO1lBQ25CLE9BQU8sSUFBSSxDQUFDO1NBQ2I7UUFFRCxNQUFNLGNBQWMsR0FBRyxjQUFjLENBQUMsY0FBYyxDQUFDO1FBQ3JELElBQUksTUFBYyxDQUFDO1FBQ25CLElBQUksT0FBZSxDQUFDO1FBRXBCLElBQUksTUFBTSxLQUFLLElBQUksQ0FBQyxTQUFTLEVBQUU7WUFDN0IsTUFBTSxzQkFBc0IsR0FBRyxJQUFJLENBQUMseUJBQXlCLEVBQUUsQ0FBQztZQUNoRSxNQUFNLEdBQUcsc0JBQXNCLENBQUMsR0FBRyxDQUFDO1lBQ3BDLE9BQU8sR0FBRyxzQkFBc0IsQ0FBQyxJQUFJLENBQUM7U0FDdkM7YUFBTTtZQUNMLE1BQU0sR0FBSSxNQUFzQixDQUFDLFNBQVMsQ0FBQztZQUMzQyxPQUFPLEdBQUksTUFBc0IsQ0FBQyxVQUFVLENBQUM7U0FDOUM7UUFFRCxNQUFNLGFBQWEsR0FBRyxjQUFjLENBQUMsR0FBRyxHQUFHLE1BQU0sQ0FBQztRQUNsRCxNQUFNLGNBQWMsR0FBRyxjQUFjLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQztRQUVyRCwyREFBMkQ7UUFDM0QseURBQXlEO1FBQ3pELElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxFQUFFO1lBQ3hDLElBQUksUUFBUSxDQUFDLFVBQVUsSUFBSSxNQUFNLEtBQUssSUFBSSxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ25FLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsYUFBYSxFQUFFLGNBQWMsQ0FBQyxDQUFDO2FBQ3RFO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFFSCxjQUFjLENBQUMsR0FBRyxHQUFHLE1BQU0sQ0FBQztRQUM1QixjQUFjLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQztRQUU5QixPQUFPLEVBQUMsR0FBRyxFQUFFLGFBQWEsRUFBRSxJQUFJLEVBQUUsY0FBYyxFQUFDLENBQUM7SUFDcEQsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gseUJBQXlCO1FBQ3ZCLE9BQU8sRUFBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLE9BQU8sRUFBQyxDQUFDO0lBQ3JELENBQUM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge19nZXRFdmVudFRhcmdldH0gZnJvbSAnQGFuZ3VsYXIvY2RrL3BsYXRmb3JtJztcbmltcG9ydCB7Z2V0TXV0YWJsZUNsaWVudFJlY3QsIGFkanVzdENsaWVudFJlY3R9IGZyb20gJy4vY2xpZW50LXJlY3QnO1xuXG4vKiogT2JqZWN0IGhvbGRpbmcgdGhlIHNjcm9sbCBwb3NpdGlvbiBvZiBzb21ldGhpbmcuICovXG5pbnRlcmZhY2UgU2Nyb2xsUG9zaXRpb24ge1xuICB0b3A6IG51bWJlcjtcbiAgbGVmdDogbnVtYmVyO1xufVxuXG4vKiogS2VlcHMgdHJhY2sgb2YgdGhlIHNjcm9sbCBwb3NpdGlvbiBhbmQgZGltZW5zaW9ucyBvZiB0aGUgcGFyZW50cyBvZiBhbiBlbGVtZW50LiAqL1xuZXhwb3J0IGNsYXNzIFBhcmVudFBvc2l0aW9uVHJhY2tlciB7XG4gIC8qKiBDYWNoZWQgcG9zaXRpb25zIG9mIHRoZSBzY3JvbGxhYmxlIHBhcmVudCBlbGVtZW50cy4gKi9cbiAgcmVhZG9ubHkgcG9zaXRpb25zID0gbmV3IE1hcDxcbiAgICBEb2N1bWVudCB8IEhUTUxFbGVtZW50LFxuICAgIHtcbiAgICAgIHNjcm9sbFBvc2l0aW9uOiBTY3JvbGxQb3NpdGlvbjtcbiAgICAgIGNsaWVudFJlY3Q/OiBDbGllbnRSZWN0O1xuICAgIH1cbiAgPigpO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX2RvY3VtZW50OiBEb2N1bWVudCkge31cblxuICAvKiogQ2xlYXJzIHRoZSBjYWNoZWQgcG9zaXRpb25zLiAqL1xuICBjbGVhcigpIHtcbiAgICB0aGlzLnBvc2l0aW9ucy5jbGVhcigpO1xuICB9XG5cbiAgLyoqIENhY2hlcyB0aGUgcG9zaXRpb25zLiBTaG91bGQgYmUgY2FsbGVkIGF0IHRoZSBiZWdpbm5pbmcgb2YgYSBkcmFnIHNlcXVlbmNlLiAqL1xuICBjYWNoZShlbGVtZW50czogcmVhZG9ubHkgSFRNTEVsZW1lbnRbXSkge1xuICAgIHRoaXMuY2xlYXIoKTtcbiAgICB0aGlzLnBvc2l0aW9ucy5zZXQodGhpcy5fZG9jdW1lbnQsIHtcbiAgICAgIHNjcm9sbFBvc2l0aW9uOiB0aGlzLmdldFZpZXdwb3J0U2Nyb2xsUG9zaXRpb24oKSxcbiAgICB9KTtcblxuICAgIGVsZW1lbnRzLmZvckVhY2goZWxlbWVudCA9PiB7XG4gICAgICB0aGlzLnBvc2l0aW9ucy5zZXQoZWxlbWVudCwge1xuICAgICAgICBzY3JvbGxQb3NpdGlvbjoge3RvcDogZWxlbWVudC5zY3JvbGxUb3AsIGxlZnQ6IGVsZW1lbnQuc2Nyb2xsTGVmdH0sXG4gICAgICAgIGNsaWVudFJlY3Q6IGdldE11dGFibGVDbGllbnRSZWN0KGVsZW1lbnQpLFxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAvKiogSGFuZGxlcyBzY3JvbGxpbmcgd2hpbGUgYSBkcmFnIGlzIHRha2luZyBwbGFjZS4gKi9cbiAgaGFuZGxlU2Nyb2xsKGV2ZW50OiBFdmVudCk6IFNjcm9sbFBvc2l0aW9uIHwgbnVsbCB7XG4gICAgY29uc3QgdGFyZ2V0ID0gX2dldEV2ZW50VGFyZ2V0PEhUTUxFbGVtZW50IHwgRG9jdW1lbnQ+KGV2ZW50KSE7XG4gICAgY29uc3QgY2FjaGVkUG9zaXRpb24gPSB0aGlzLnBvc2l0aW9ucy5nZXQodGFyZ2V0KTtcblxuICAgIGlmICghY2FjaGVkUG9zaXRpb24pIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IHNjcm9sbFBvc2l0aW9uID0gY2FjaGVkUG9zaXRpb24uc2Nyb2xsUG9zaXRpb247XG4gICAgbGV0IG5ld1RvcDogbnVtYmVyO1xuICAgIGxldCBuZXdMZWZ0OiBudW1iZXI7XG5cbiAgICBpZiAodGFyZ2V0ID09PSB0aGlzLl9kb2N1bWVudCkge1xuICAgICAgY29uc3Qgdmlld3BvcnRTY3JvbGxQb3NpdGlvbiA9IHRoaXMuZ2V0Vmlld3BvcnRTY3JvbGxQb3NpdGlvbigpO1xuICAgICAgbmV3VG9wID0gdmlld3BvcnRTY3JvbGxQb3NpdGlvbi50b3A7XG4gICAgICBuZXdMZWZ0ID0gdmlld3BvcnRTY3JvbGxQb3NpdGlvbi5sZWZ0O1xuICAgIH0gZWxzZSB7XG4gICAgICBuZXdUb3AgPSAodGFyZ2V0IGFzIEhUTUxFbGVtZW50KS5zY3JvbGxUb3A7XG4gICAgICBuZXdMZWZ0ID0gKHRhcmdldCBhcyBIVE1MRWxlbWVudCkuc2Nyb2xsTGVmdDtcbiAgICB9XG5cbiAgICBjb25zdCB0b3BEaWZmZXJlbmNlID0gc2Nyb2xsUG9zaXRpb24udG9wIC0gbmV3VG9wO1xuICAgIGNvbnN0IGxlZnREaWZmZXJlbmNlID0gc2Nyb2xsUG9zaXRpb24ubGVmdCAtIG5ld0xlZnQ7XG5cbiAgICAvLyBHbyB0aHJvdWdoIGFuZCB1cGRhdGUgdGhlIGNhY2hlZCBwb3NpdGlvbnMgb2YgdGhlIHNjcm9sbFxuICAgIC8vIHBhcmVudHMgdGhhdCBhcmUgaW5zaWRlIHRoZSBlbGVtZW50IHRoYXQgd2FzIHNjcm9sbGVkLlxuICAgIHRoaXMucG9zaXRpb25zLmZvckVhY2goKHBvc2l0aW9uLCBub2RlKSA9PiB7XG4gICAgICBpZiAocG9zaXRpb24uY2xpZW50UmVjdCAmJiB0YXJnZXQgIT09IG5vZGUgJiYgdGFyZ2V0LmNvbnRhaW5zKG5vZGUpKSB7XG4gICAgICAgIGFkanVzdENsaWVudFJlY3QocG9zaXRpb24uY2xpZW50UmVjdCwgdG9wRGlmZmVyZW5jZSwgbGVmdERpZmZlcmVuY2UpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgc2Nyb2xsUG9zaXRpb24udG9wID0gbmV3VG9wO1xuICAgIHNjcm9sbFBvc2l0aW9uLmxlZnQgPSBuZXdMZWZ0O1xuXG4gICAgcmV0dXJuIHt0b3A6IHRvcERpZmZlcmVuY2UsIGxlZnQ6IGxlZnREaWZmZXJlbmNlfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBzY3JvbGwgcG9zaXRpb24gb2YgdGhlIHZpZXdwb3J0LiBOb3RlIHRoYXQgd2UgdXNlIHRoZSBzY3JvbGxYIGFuZCBzY3JvbGxZIGRpcmVjdGx5LFxuICAgKiBpbnN0ZWFkIG9mIGdvaW5nIHRocm91Z2ggdGhlIGBWaWV3cG9ydFJ1bGVyYCwgYmVjYXVzZSB0aGUgZmlyc3QgdmFsdWUgdGhlIHJ1bGVyIGxvb2tzIGF0IGlzXG4gICAqIHRoZSB0b3AvbGVmdCBvZmZzZXQgb2YgdGhlIGBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnRgIHdoaWNoIHdvcmtzIGZvciBtb3N0IGNhc2VzLCBidXQgYnJlYWtzXG4gICAqIGlmIHRoZSBlbGVtZW50IGlzIG9mZnNldCBieSBzb21ldGhpbmcgbGlrZSB0aGUgYEJsb2NrU2Nyb2xsU3RyYXRlZ3lgLlxuICAgKi9cbiAgZ2V0Vmlld3BvcnRTY3JvbGxQb3NpdGlvbigpIHtcbiAgICByZXR1cm4ge3RvcDogd2luZG93LnNjcm9sbFksIGxlZnQ6IHdpbmRvdy5zY3JvbGxYfTtcbiAgfVxufVxuIl19