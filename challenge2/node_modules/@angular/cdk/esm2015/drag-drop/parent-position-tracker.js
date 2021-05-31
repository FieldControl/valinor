/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { getMutableClientRect, adjustClientRect } from './client-rect';
/** Keeps track of the scroll position and dimensions of the parents of an element. */
export class ParentPositionTracker {
    constructor(_document, _viewportRuler) {
        this._document = _document;
        this._viewportRuler = _viewportRuler;
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
            scrollPosition: this._viewportRuler.getViewportScrollPosition(),
        });
        elements.forEach(element => {
            this.positions.set(element, {
                scrollPosition: { top: element.scrollTop, left: element.scrollLeft },
                clientRect: getMutableClientRect(element)
            });
        });
    }
    /** Handles scrolling while a drag is taking place. */
    handleScroll(event) {
        const target = event.target;
        const cachedPosition = this.positions.get(target);
        if (!cachedPosition) {
            return null;
        }
        // Used when figuring out whether an element is inside the scroll parent. If the scrolled
        // parent is the `document`, we use the `documentElement`, because IE doesn't support
        // `contains` on the `document`.
        const scrolledParentNode = target === this._document ? target.documentElement : target;
        const scrollPosition = cachedPosition.scrollPosition;
        let newTop;
        let newLeft;
        if (target === this._document) {
            const viewportScrollPosition = this._viewportRuler.getViewportScrollPosition();
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
            if (position.clientRect && target !== node && scrolledParentNode.contains(node)) {
                adjustClientRect(position.clientRect, topDifference, leftDifference);
            }
        });
        scrollPosition.top = newTop;
        scrollPosition.left = newLeft;
        return { top: topDifference, left: leftDifference };
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyZW50LXBvc2l0aW9uLXRyYWNrZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL2RyYWctZHJvcC9wYXJlbnQtcG9zaXRpb24tdHJhY2tlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFHSCxPQUFPLEVBQUMsb0JBQW9CLEVBQUUsZ0JBQWdCLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFRckUsc0ZBQXNGO0FBQ3RGLE1BQU0sT0FBTyxxQkFBcUI7SUFPaEMsWUFBb0IsU0FBbUIsRUFBVSxjQUE2QjtRQUExRCxjQUFTLEdBQVQsU0FBUyxDQUFVO1FBQVUsbUJBQWMsR0FBZCxjQUFjLENBQWU7UUFOOUUsMERBQTBEO1FBQ2pELGNBQVMsR0FBRyxJQUFJLEdBQUcsRUFHeEIsQ0FBQztJQUU0RSxDQUFDO0lBRWxGLG1DQUFtQztJQUNuQyxLQUFLO1FBQ0gsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUN6QixDQUFDO0lBRUQsa0ZBQWtGO0lBQ2xGLEtBQUssQ0FBQyxRQUFnQztRQUNwQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDYixJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFO1lBQ2pDLGNBQWMsRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLHlCQUF5QixFQUFFO1NBQ2hFLENBQUMsQ0FBQztRQUVILFFBQVEsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUU7WUFDekIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFO2dCQUMxQixjQUFjLEVBQUUsRUFBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLFVBQVUsRUFBQztnQkFDbEUsVUFBVSxFQUFFLG9CQUFvQixDQUFDLE9BQU8sQ0FBQzthQUMxQyxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCxzREFBc0Q7SUFDdEQsWUFBWSxDQUFDLEtBQVk7UUFDdkIsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLE1BQWdDLENBQUM7UUFDdEQsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFbEQsSUFBSSxDQUFDLGNBQWMsRUFBRTtZQUNuQixPQUFPLElBQUksQ0FBQztTQUNiO1FBRUQseUZBQXlGO1FBQ3pGLHFGQUFxRjtRQUNyRixnQ0FBZ0M7UUFDaEMsTUFBTSxrQkFBa0IsR0FBRyxNQUFNLEtBQUssSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO1FBQ3ZGLE1BQU0sY0FBYyxHQUFHLGNBQWMsQ0FBQyxjQUFjLENBQUM7UUFDckQsSUFBSSxNQUFjLENBQUM7UUFDbkIsSUFBSSxPQUFlLENBQUM7UUFFcEIsSUFBSSxNQUFNLEtBQUssSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUM3QixNQUFNLHNCQUFzQixHQUFHLElBQUksQ0FBQyxjQUFlLENBQUMseUJBQXlCLEVBQUUsQ0FBQztZQUNoRixNQUFNLEdBQUcsc0JBQXNCLENBQUMsR0FBRyxDQUFDO1lBQ3BDLE9BQU8sR0FBRyxzQkFBc0IsQ0FBQyxJQUFJLENBQUM7U0FDdkM7YUFBTTtZQUNMLE1BQU0sR0FBSSxNQUFzQixDQUFDLFNBQVMsQ0FBQztZQUMzQyxPQUFPLEdBQUksTUFBc0IsQ0FBQyxVQUFVLENBQUM7U0FDOUM7UUFFRCxNQUFNLGFBQWEsR0FBRyxjQUFjLENBQUMsR0FBRyxHQUFHLE1BQU0sQ0FBQztRQUNsRCxNQUFNLGNBQWMsR0FBRyxjQUFjLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQztRQUVyRCwyREFBMkQ7UUFDM0QseURBQXlEO1FBQ3pELElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxFQUFFO1lBQ3hDLElBQUksUUFBUSxDQUFDLFVBQVUsSUFBSSxNQUFNLEtBQUssSUFBSSxJQUFJLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDL0UsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxhQUFhLEVBQUUsY0FBYyxDQUFDLENBQUM7YUFDdEU7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUVILGNBQWMsQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDO1FBQzVCLGNBQWMsQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDO1FBRTlCLE9BQU8sRUFBQyxHQUFHLEVBQUUsYUFBYSxFQUFFLElBQUksRUFBRSxjQUFjLEVBQUMsQ0FBQztJQUNwRCxDQUFDO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtWaWV3cG9ydFJ1bGVyfSBmcm9tICdAYW5ndWxhci9jZGsvc2Nyb2xsaW5nJztcbmltcG9ydCB7Z2V0TXV0YWJsZUNsaWVudFJlY3QsIGFkanVzdENsaWVudFJlY3R9IGZyb20gJy4vY2xpZW50LXJlY3QnO1xuXG4vKiogT2JqZWN0IGhvbGRpbmcgdGhlIHNjcm9sbCBwb3NpdGlvbiBvZiBzb21ldGhpbmcuICovXG5pbnRlcmZhY2UgU2Nyb2xsUG9zaXRpb24ge1xuICB0b3A6IG51bWJlcjtcbiAgbGVmdDogbnVtYmVyO1xufVxuXG4vKiogS2VlcHMgdHJhY2sgb2YgdGhlIHNjcm9sbCBwb3NpdGlvbiBhbmQgZGltZW5zaW9ucyBvZiB0aGUgcGFyZW50cyBvZiBhbiBlbGVtZW50LiAqL1xuZXhwb3J0IGNsYXNzIFBhcmVudFBvc2l0aW9uVHJhY2tlciB7XG4gIC8qKiBDYWNoZWQgcG9zaXRpb25zIG9mIHRoZSBzY3JvbGxhYmxlIHBhcmVudCBlbGVtZW50cy4gKi9cbiAgcmVhZG9ubHkgcG9zaXRpb25zID0gbmV3IE1hcDxEb2N1bWVudHxIVE1MRWxlbWVudCwge1xuICAgIHNjcm9sbFBvc2l0aW9uOiBTY3JvbGxQb3NpdGlvbixcbiAgICBjbGllbnRSZWN0PzogQ2xpZW50UmVjdFxuICB9PigpO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX2RvY3VtZW50OiBEb2N1bWVudCwgcHJpdmF0ZSBfdmlld3BvcnRSdWxlcjogVmlld3BvcnRSdWxlcikge31cblxuICAvKiogQ2xlYXJzIHRoZSBjYWNoZWQgcG9zaXRpb25zLiAqL1xuICBjbGVhcigpIHtcbiAgICB0aGlzLnBvc2l0aW9ucy5jbGVhcigpO1xuICB9XG5cbiAgLyoqIENhY2hlcyB0aGUgcG9zaXRpb25zLiBTaG91bGQgYmUgY2FsbGVkIGF0IHRoZSBiZWdpbm5pbmcgb2YgYSBkcmFnIHNlcXVlbmNlLiAqL1xuICBjYWNoZShlbGVtZW50czogcmVhZG9ubHkgSFRNTEVsZW1lbnRbXSkge1xuICAgIHRoaXMuY2xlYXIoKTtcbiAgICB0aGlzLnBvc2l0aW9ucy5zZXQodGhpcy5fZG9jdW1lbnQsIHtcbiAgICAgIHNjcm9sbFBvc2l0aW9uOiB0aGlzLl92aWV3cG9ydFJ1bGVyLmdldFZpZXdwb3J0U2Nyb2xsUG9zaXRpb24oKSxcbiAgICB9KTtcblxuICAgIGVsZW1lbnRzLmZvckVhY2goZWxlbWVudCA9PiB7XG4gICAgICB0aGlzLnBvc2l0aW9ucy5zZXQoZWxlbWVudCwge1xuICAgICAgICBzY3JvbGxQb3NpdGlvbjoge3RvcDogZWxlbWVudC5zY3JvbGxUb3AsIGxlZnQ6IGVsZW1lbnQuc2Nyb2xsTGVmdH0sXG4gICAgICAgIGNsaWVudFJlY3Q6IGdldE11dGFibGVDbGllbnRSZWN0KGVsZW1lbnQpXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBIYW5kbGVzIHNjcm9sbGluZyB3aGlsZSBhIGRyYWcgaXMgdGFraW5nIHBsYWNlLiAqL1xuICBoYW5kbGVTY3JvbGwoZXZlbnQ6IEV2ZW50KTogU2Nyb2xsUG9zaXRpb24gfCBudWxsIHtcbiAgICBjb25zdCB0YXJnZXQgPSBldmVudC50YXJnZXQgYXMgSFRNTEVsZW1lbnQgfCBEb2N1bWVudDtcbiAgICBjb25zdCBjYWNoZWRQb3NpdGlvbiA9IHRoaXMucG9zaXRpb25zLmdldCh0YXJnZXQpO1xuXG4gICAgaWYgKCFjYWNoZWRQb3NpdGlvbikge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLy8gVXNlZCB3aGVuIGZpZ3VyaW5nIG91dCB3aGV0aGVyIGFuIGVsZW1lbnQgaXMgaW5zaWRlIHRoZSBzY3JvbGwgcGFyZW50LiBJZiB0aGUgc2Nyb2xsZWRcbiAgICAvLyBwYXJlbnQgaXMgdGhlIGBkb2N1bWVudGAsIHdlIHVzZSB0aGUgYGRvY3VtZW50RWxlbWVudGAsIGJlY2F1c2UgSUUgZG9lc24ndCBzdXBwb3J0XG4gICAgLy8gYGNvbnRhaW5zYCBvbiB0aGUgYGRvY3VtZW50YC5cbiAgICBjb25zdCBzY3JvbGxlZFBhcmVudE5vZGUgPSB0YXJnZXQgPT09IHRoaXMuX2RvY3VtZW50ID8gdGFyZ2V0LmRvY3VtZW50RWxlbWVudCA6IHRhcmdldDtcbiAgICBjb25zdCBzY3JvbGxQb3NpdGlvbiA9IGNhY2hlZFBvc2l0aW9uLnNjcm9sbFBvc2l0aW9uO1xuICAgIGxldCBuZXdUb3A6IG51bWJlcjtcbiAgICBsZXQgbmV3TGVmdDogbnVtYmVyO1xuXG4gICAgaWYgKHRhcmdldCA9PT0gdGhpcy5fZG9jdW1lbnQpIHtcbiAgICAgIGNvbnN0IHZpZXdwb3J0U2Nyb2xsUG9zaXRpb24gPSB0aGlzLl92aWV3cG9ydFJ1bGVyIS5nZXRWaWV3cG9ydFNjcm9sbFBvc2l0aW9uKCk7XG4gICAgICBuZXdUb3AgPSB2aWV3cG9ydFNjcm9sbFBvc2l0aW9uLnRvcDtcbiAgICAgIG5ld0xlZnQgPSB2aWV3cG9ydFNjcm9sbFBvc2l0aW9uLmxlZnQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5ld1RvcCA9ICh0YXJnZXQgYXMgSFRNTEVsZW1lbnQpLnNjcm9sbFRvcDtcbiAgICAgIG5ld0xlZnQgPSAodGFyZ2V0IGFzIEhUTUxFbGVtZW50KS5zY3JvbGxMZWZ0O1xuICAgIH1cblxuICAgIGNvbnN0IHRvcERpZmZlcmVuY2UgPSBzY3JvbGxQb3NpdGlvbi50b3AgLSBuZXdUb3A7XG4gICAgY29uc3QgbGVmdERpZmZlcmVuY2UgPSBzY3JvbGxQb3NpdGlvbi5sZWZ0IC0gbmV3TGVmdDtcblxuICAgIC8vIEdvIHRocm91Z2ggYW5kIHVwZGF0ZSB0aGUgY2FjaGVkIHBvc2l0aW9ucyBvZiB0aGUgc2Nyb2xsXG4gICAgLy8gcGFyZW50cyB0aGF0IGFyZSBpbnNpZGUgdGhlIGVsZW1lbnQgdGhhdCB3YXMgc2Nyb2xsZWQuXG4gICAgdGhpcy5wb3NpdGlvbnMuZm9yRWFjaCgocG9zaXRpb24sIG5vZGUpID0+IHtcbiAgICAgIGlmIChwb3NpdGlvbi5jbGllbnRSZWN0ICYmIHRhcmdldCAhPT0gbm9kZSAmJiBzY3JvbGxlZFBhcmVudE5vZGUuY29udGFpbnMobm9kZSkpIHtcbiAgICAgICAgYWRqdXN0Q2xpZW50UmVjdChwb3NpdGlvbi5jbGllbnRSZWN0LCB0b3BEaWZmZXJlbmNlLCBsZWZ0RGlmZmVyZW5jZSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBzY3JvbGxQb3NpdGlvbi50b3AgPSBuZXdUb3A7XG4gICAgc2Nyb2xsUG9zaXRpb24ubGVmdCA9IG5ld0xlZnQ7XG5cbiAgICByZXR1cm4ge3RvcDogdG9wRGlmZmVyZW5jZSwgbGVmdDogbGVmdERpZmZlcmVuY2V9O1xuICB9XG59XG4iXX0=