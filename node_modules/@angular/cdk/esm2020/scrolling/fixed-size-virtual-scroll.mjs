/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { coerceNumberProperty } from '@angular/cdk/coercion';
import { Directive, forwardRef, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { VIRTUAL_SCROLL_STRATEGY } from './virtual-scroll-strategy';
import * as i0 from "@angular/core";
/** Virtual scrolling strategy for lists with items of known fixed size. */
export class FixedSizeVirtualScrollStrategy {
    /**
     * @param itemSize The size of the items in the virtually scrolling list.
     * @param minBufferPx The minimum amount of buffer (in pixels) before needing to render more
     * @param maxBufferPx The amount of buffer (in pixels) to render when rendering more.
     */
    constructor(itemSize, minBufferPx, maxBufferPx) {
        this._scrolledIndexChange = new Subject();
        /** @docs-private Implemented as part of VirtualScrollStrategy. */
        this.scrolledIndexChange = this._scrolledIndexChange.pipe(distinctUntilChanged());
        /** The attached viewport. */
        this._viewport = null;
        this._itemSize = itemSize;
        this._minBufferPx = minBufferPx;
        this._maxBufferPx = maxBufferPx;
    }
    /**
     * Attaches this scroll strategy to a viewport.
     * @param viewport The viewport to attach this strategy to.
     */
    attach(viewport) {
        this._viewport = viewport;
        this._updateTotalContentSize();
        this._updateRenderedRange();
    }
    /** Detaches this scroll strategy from the currently attached viewport. */
    detach() {
        this._scrolledIndexChange.complete();
        this._viewport = null;
    }
    /**
     * Update the item size and buffer size.
     * @param itemSize The size of the items in the virtually scrolling list.
     * @param minBufferPx The minimum amount of buffer (in pixels) before needing to render more
     * @param maxBufferPx The amount of buffer (in pixels) to render when rendering more.
     */
    updateItemAndBufferSize(itemSize, minBufferPx, maxBufferPx) {
        if (maxBufferPx < minBufferPx && (typeof ngDevMode === 'undefined' || ngDevMode)) {
            throw Error('CDK virtual scroll: maxBufferPx must be greater than or equal to minBufferPx');
        }
        this._itemSize = itemSize;
        this._minBufferPx = minBufferPx;
        this._maxBufferPx = maxBufferPx;
        this._updateTotalContentSize();
        this._updateRenderedRange();
    }
    /** @docs-private Implemented as part of VirtualScrollStrategy. */
    onContentScrolled() {
        this._updateRenderedRange();
    }
    /** @docs-private Implemented as part of VirtualScrollStrategy. */
    onDataLengthChanged() {
        this._updateTotalContentSize();
        this._updateRenderedRange();
    }
    /** @docs-private Implemented as part of VirtualScrollStrategy. */
    onContentRendered() {
        /* no-op */
    }
    /** @docs-private Implemented as part of VirtualScrollStrategy. */
    onRenderedOffsetChanged() {
        /* no-op */
    }
    /**
     * Scroll to the offset for the given index.
     * @param index The index of the element to scroll to.
     * @param behavior The ScrollBehavior to use when scrolling.
     */
    scrollToIndex(index, behavior) {
        if (this._viewport) {
            this._viewport.scrollToOffset(index * this._itemSize, behavior);
        }
    }
    /** Update the viewport's total content size. */
    _updateTotalContentSize() {
        if (!this._viewport) {
            return;
        }
        this._viewport.setTotalContentSize(this._viewport.getDataLength() * this._itemSize);
    }
    /** Update the viewport's rendered range. */
    _updateRenderedRange() {
        if (!this._viewport) {
            return;
        }
        const renderedRange = this._viewport.getRenderedRange();
        const newRange = { start: renderedRange.start, end: renderedRange.end };
        const viewportSize = this._viewport.getViewportSize();
        const dataLength = this._viewport.getDataLength();
        let scrollOffset = this._viewport.measureScrollOffset();
        // Prevent NaN as result when dividing by zero.
        let firstVisibleIndex = this._itemSize > 0 ? scrollOffset / this._itemSize : 0;
        // If user scrolls to the bottom of the list and data changes to a smaller list
        if (newRange.end > dataLength) {
            // We have to recalculate the first visible index based on new data length and viewport size.
            const maxVisibleItems = Math.ceil(viewportSize / this._itemSize);
            const newVisibleIndex = Math.max(0, Math.min(firstVisibleIndex, dataLength - maxVisibleItems));
            // If first visible index changed we must update scroll offset to handle start/end buffers
            // Current range must also be adjusted to cover the new position (bottom of new list).
            if (firstVisibleIndex != newVisibleIndex) {
                firstVisibleIndex = newVisibleIndex;
                scrollOffset = newVisibleIndex * this._itemSize;
                newRange.start = Math.floor(firstVisibleIndex);
            }
            newRange.end = Math.max(0, Math.min(dataLength, newRange.start + maxVisibleItems));
        }
        const startBuffer = scrollOffset - newRange.start * this._itemSize;
        if (startBuffer < this._minBufferPx && newRange.start != 0) {
            const expandStart = Math.ceil((this._maxBufferPx - startBuffer) / this._itemSize);
            newRange.start = Math.max(0, newRange.start - expandStart);
            newRange.end = Math.min(dataLength, Math.ceil(firstVisibleIndex + (viewportSize + this._minBufferPx) / this._itemSize));
        }
        else {
            const endBuffer = newRange.end * this._itemSize - (scrollOffset + viewportSize);
            if (endBuffer < this._minBufferPx && newRange.end != dataLength) {
                const expandEnd = Math.ceil((this._maxBufferPx - endBuffer) / this._itemSize);
                if (expandEnd > 0) {
                    newRange.end = Math.min(dataLength, newRange.end + expandEnd);
                    newRange.start = Math.max(0, Math.floor(firstVisibleIndex - this._minBufferPx / this._itemSize));
                }
            }
        }
        this._viewport.setRenderedRange(newRange);
        this._viewport.setRenderedContentOffset(this._itemSize * newRange.start);
        this._scrolledIndexChange.next(Math.floor(firstVisibleIndex));
    }
}
/**
 * Provider factory for `FixedSizeVirtualScrollStrategy` that simply extracts the already created
 * `FixedSizeVirtualScrollStrategy` from the given directive.
 * @param fixedSizeDir The instance of `CdkFixedSizeVirtualScroll` to extract the
 *     `FixedSizeVirtualScrollStrategy` from.
 */
export function _fixedSizeVirtualScrollStrategyFactory(fixedSizeDir) {
    return fixedSizeDir._scrollStrategy;
}
/** A virtual scroll strategy that supports fixed-size items. */
export class CdkFixedSizeVirtualScroll {
    constructor() {
        this._itemSize = 20;
        this._minBufferPx = 100;
        this._maxBufferPx = 200;
        /** The scroll strategy used by this directive. */
        this._scrollStrategy = new FixedSizeVirtualScrollStrategy(this.itemSize, this.minBufferPx, this.maxBufferPx);
    }
    /** The size of the items in the list (in pixels). */
    get itemSize() {
        return this._itemSize;
    }
    set itemSize(value) {
        this._itemSize = coerceNumberProperty(value);
    }
    /**
     * The minimum amount of buffer rendered beyond the viewport (in pixels).
     * If the amount of buffer dips below this number, more items will be rendered. Defaults to 100px.
     */
    get minBufferPx() {
        return this._minBufferPx;
    }
    set minBufferPx(value) {
        this._minBufferPx = coerceNumberProperty(value);
    }
    /**
     * The number of pixels worth of buffer to render for when rendering new items. Defaults to 200px.
     */
    get maxBufferPx() {
        return this._maxBufferPx;
    }
    set maxBufferPx(value) {
        this._maxBufferPx = coerceNumberProperty(value);
    }
    ngOnChanges() {
        this._scrollStrategy.updateItemAndBufferSize(this.itemSize, this.minBufferPx, this.maxBufferPx);
    }
}
CdkFixedSizeVirtualScroll.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: CdkFixedSizeVirtualScroll, deps: [], target: i0.ɵɵFactoryTarget.Directive });
CdkFixedSizeVirtualScroll.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "15.2.0-rc.0", type: CdkFixedSizeVirtualScroll, isStandalone: true, selector: "cdk-virtual-scroll-viewport[itemSize]", inputs: { itemSize: "itemSize", minBufferPx: "minBufferPx", maxBufferPx: "maxBufferPx" }, providers: [
        {
            provide: VIRTUAL_SCROLL_STRATEGY,
            useFactory: _fixedSizeVirtualScrollStrategyFactory,
            deps: [forwardRef(() => CdkFixedSizeVirtualScroll)],
        },
    ], usesOnChanges: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: CdkFixedSizeVirtualScroll, decorators: [{
            type: Directive,
            args: [{
                    selector: 'cdk-virtual-scroll-viewport[itemSize]',
                    standalone: true,
                    providers: [
                        {
                            provide: VIRTUAL_SCROLL_STRATEGY,
                            useFactory: _fixedSizeVirtualScrollStrategyFactory,
                            deps: [forwardRef(() => CdkFixedSizeVirtualScroll)],
                        },
                    ],
                }]
        }], propDecorators: { itemSize: [{
                type: Input
            }], minBufferPx: [{
                type: Input
            }], maxBufferPx: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZml4ZWQtc2l6ZS12aXJ0dWFsLXNjcm9sbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvc2Nyb2xsaW5nL2ZpeGVkLXNpemUtdmlydHVhbC1zY3JvbGwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLG9CQUFvQixFQUFjLE1BQU0sdUJBQXVCLENBQUM7QUFDeEUsT0FBTyxFQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFZLE1BQU0sZUFBZSxDQUFDO0FBQ3RFLE9BQU8sRUFBYSxPQUFPLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDekMsT0FBTyxFQUFDLG9CQUFvQixFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDcEQsT0FBTyxFQUFDLHVCQUF1QixFQUF3QixNQUFNLDJCQUEyQixDQUFDOztBQUd6RiwyRUFBMkU7QUFDM0UsTUFBTSxPQUFPLDhCQUE4QjtJQWtCekM7Ozs7T0FJRztJQUNILFlBQVksUUFBZ0IsRUFBRSxXQUFtQixFQUFFLFdBQW1CO1FBdEJyRCx5QkFBb0IsR0FBRyxJQUFJLE9BQU8sRUFBVSxDQUFDO1FBRTlELGtFQUFrRTtRQUNsRSx3QkFBbUIsR0FBdUIsSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLENBQUM7UUFFakcsNkJBQTZCO1FBQ3JCLGNBQVMsR0FBb0MsSUFBSSxDQUFDO1FBaUJ4RCxJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQztRQUMxQixJQUFJLENBQUMsWUFBWSxHQUFHLFdBQVcsQ0FBQztRQUNoQyxJQUFJLENBQUMsWUFBWSxHQUFHLFdBQVcsQ0FBQztJQUNsQyxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsTUFBTSxDQUFDLFFBQWtDO1FBQ3ZDLElBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDO1FBQzFCLElBQUksQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO1FB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UUFDVDtZQUNFLE9BQU8sRUFBRSx1QkFBdUI7WUFDaEMsVUFBVSxFQUFFLHNDQUFzQztZQUNsRCxJQUFJLEVBQUUsQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMseUJBQXlCLENBQUMsQ0FBQztTQUNwRDtLQUNGO2dHQUVVLHlCQUF5QjtrQkFYckMsU0FBUzttQkFBQztvQkFDVCxRQUFRLEVBQUUsdUNBQXVDO29CQUNqRCxVQUFVLEVBQUUsSUFBSTtvQkFDaEIsU0FBUyxFQUFFO3dCQUNUOzRCQUNFLE9BQU8sRUFBRSx1QkFBdUI7NEJBQ2hDLFVBQVUsRUFBRSxzQ0FBc0M7NEJBQ2xELElBQUksRUFBRSxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsMEJBQTBCLENBQUMsQ0FBQzt5QkFDcEQ7cUJBQ0Y7aUJBQ0Y7OEJBSUssUUFBUTtzQkFEWCxLQUFLO2dCQWNGLFdBQVc7c0JBRGQsS0FBSztnQkFhRixXQUFXO3NCQURkLEtBQUsiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtjb2VyY2VOdW1iZXJQcm9wZXJ0eSwgTnVtYmVySW5wdXR9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2VyY2lvbic7XG5pbXBvcnQge0RpcmVjdGl2ZSwgZm9yd2FyZFJlZiwgSW5wdXQsIE9uQ2hhbmdlc30gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge09ic2VydmFibGUsIFN1YmplY3R9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtkaXN0aW5jdFVudGlsQ2hhbmdlZH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0IHtWSVJUVUFMX1NDUk9MTF9TVFJBVEVHWSwgVmlydHVhbFNjcm9sbFN0cmF0ZWd5fSBmcm9tICcuL3ZpcnR1YWwtc2Nyb2xsLXN0cmF0ZWd5JztcbmltcG9ydCB7Q2RrVmlydHVhbFNjcm9sbFZpZXdwb3J0fSBmcm9tICcuL3ZpcnR1YWwtc2Nyb2xsLXZpZXdwb3J0JztcblxuLyoqIFZpcnR1YWwgc2Nyb2xsaW5nIHN0cmF0ZWd5IGZvciBsaXN0cyB3aXRoIGl0ZW1zIG9mIGtub3duIGZpeGVkIHNpemUuICovXG5leHBvcnQgY2xhc3MgRml4ZWRTaXplVmlydHVhbFNjcm9sbFN0cmF0ZWd5IGltcGxlbWVudHMgVmlydHVhbFNjcm9sbFN0cmF0ZWd5IHtcbiAgcHJpdmF0ZSByZWFkb25seSBfc2Nyb2xsZWRJbmRleENoYW5nZSA9IG5ldyBTdWJqZWN0PG51bWJlcj4oKTtcblxuICAvKiogQGRvY3MtcHJpdmF0ZSBJbXBsZW1lbnRlZCBhcyBwYXJ0IG9mIFZpcnR1YWxTY3JvbGxTdHJhdGVneS4gKi9cbiAgc2Nyb2xsZWRJbmRleENoYW5nZTogT2JzZXJ2YWJsZTxudW1iZXI+ID0gdGhpcy5fc2Nyb2xsZWRJbmRleENoYW5nZS5waXBlKGRpc3RpbmN0VW50aWxDaGFuZ2VkKCkpO1xuXG4gIC8qKiBUaGUgYXR0YWNoZWQgdmlld3BvcnQuICovXG4gIHByaXZhdGUgX3ZpZXdwb3J0OiBDZGtWaXJ0dWFsU2Nyb2xsVmlld3BvcnQgfCBudWxsID0gbnVsbDtcblxuICAvKiogVGhlIHNpemUgb2YgdGhlIGl0ZW1zIGluIHRoZSB2aXJ0dWFsbHkgc2Nyb2xsaW5nIGxpc3QuICovXG4gIHByaXZhdGUgX2l0ZW1TaXplOiBudW1iZXI7XG5cbiAgLyoqIFRoZSBtaW5pbXVtIGFtb3VudCBvZiBidWZmZXIgcmVuZGVyZWQgYmV5b25kIHRoZSB2aWV3cG9ydCAoaW4gcGl4ZWxzKS4gKi9cbiAgcHJpdmF0ZSBfbWluQnVmZmVyUHg6IG51bWJlcjtcblxuICAvKiogVGhlIG51bWJlciBvZiBidWZmZXIgaXRlbXMgdG8gcmVuZGVyIGJleW9uZCB0aGUgZWRnZSBvZiB0aGUgdmlld3BvcnQgKGluIHBpeGVscykuICovXG4gIHByaXZhdGUgX21heEJ1ZmZlclB4OiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBpdGVtU2l6ZSBUaGUgc2l6ZSBvZiB0aGUgaXRlbXMgaW4gdGhlIHZpcnR1YWxseSBzY3JvbGxpbmcgbGlzdC5cbiAgICogQHBhcmFtIG1pbkJ1ZmZlclB4IFRoZSBtaW5pbXVtIGFtb3VudCBvZiBidWZmZXIgKGluIHBpeGVscykgYmVmb3JlIG5lZWRpbmcgdG8gcmVuZGVyIG1vcmVcbiAgICogQHBhcmFtIG1heEJ1ZmZlclB4IFRoZSBhbW91bnQgb2YgYnVmZmVyIChpbiBwaXhlbHMpIHRvIHJlbmRlciB3aGVuIHJlbmRlcmluZyBtb3JlLlxuICAgKi9cbiAgY29uc3RydWN0b3IoaXRlbVNpemU6IG51bWJlciwgbWluQnVmZmVyUHg6IG51bWJlciwgbWF4QnVmZmVyUHg6IG51bWJlcikge1xuICAgIHRoaXMuX2l0ZW1TaXplID0gaXRlbVNpemU7XG4gICAgdGhpcy5fbWluQnVmZmVyUHggPSBtaW5CdWZmZXJQeDtcbiAgICB0aGlzLl9tYXhCdWZmZXJQeCA9IG1heEJ1ZmZlclB4O1xuICB9XG5cbiAgLyoqXG4gICAqIEF0dGFjaGVzIHRoaXMgc2Nyb2xsIHN0cmF0ZWd5IHRvIGEgdmlld3BvcnQuXG4gICAqIEBwYXJhbSB2aWV3cG9ydCBUaGUgdmlld3BvcnQgdG8gYXR0YWNoIHRoaXMgc3RyYXRlZ3kgdG8uXG4gICAqL1xuICBhdHRhY2godmlld3BvcnQ6IENka1ZpcnR1YWxTY3JvbGxWaWV3cG9ydCkge1xuICAgIHRoaXMuX3ZpZXdwb3J0ID0gdmlld3BvcnQ7XG4gICAgdGhpcy5fdXBkYXRlVG90YWxDb250ZW50U2l6ZSgpO1xuICAgIHRoaXMuX3VwZGF0ZVJlbmRlcmVkUmFuZ2UoKTtcbiAgfVxuXG4gIC8qKiBEZXRhY2hlcyB0aGlzIHNjcm9sbCBzdHJhdGVneSBmcm9tIHRoZSBjdXJyZW50bHkgYXR0YWNoZWQgdmlld3BvcnQuICovXG4gIGRldGFjaCgpIHtcbiAgICB0aGlzLl9zY3JvbGxlZEluZGV4Q2hhbmdlLmNvbXBsZXRlKCk7XG4gICAgdGhpcy5fdmlld3BvcnQgPSBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZSB0aGUgaXRlbSBzaXplIGFuZCBidWZmZXIgc2l6ZS5cbiAgICogQHBhcmFtIGl0ZW1TaXplIFRoZSBzaXplIG9mIHRoZSBpdGVtcyBpbiB0aGUgdmlydHVhbGx5IHNjcm9sbGluZyBsaXN0LlxuICAgKiBAcGFyYW0gbWluQnVmZmVyUHggVGhlIG1pbmltdW0gYW1vdW50IG9mIGJ1ZmZlciAoaW4gcGl4ZWxzKSBiZWZvcmUgbmVlZGluZyB0byByZW5kZXIgbW9yZVxuICAgKiBAcGFyYW0gbWF4QnVmZmVyUHggVGhlIGFtb3VudCBvZiBidWZmZXIgKGluIHBpeGVscykgdG8gcmVuZGVyIHdoZW4gcmVuZGVyaW5nIG1vcmUuXG4gICAqL1xuICB1cGRhdGVJdGVtQW5kQnVmZmVyU2l6ZShpdGVtU2l6ZTogbnVtYmVyLCBtaW5CdWZmZXJQeDogbnVtYmVyLCBtYXhCdWZmZXJQeDogbnVtYmVyKSB7XG4gICAgaWYgKG1heEJ1ZmZlclB4IDwgbWluQnVmZmVyUHggJiYgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkpIHtcbiAgICAgIHRocm93IEVycm9yKCdDREsgdmlydHVhbCBzY3JvbGw6IG1heEJ1ZmZlclB4IG11c3QgYmUgZ3JlYXRlciB0aGFuIG9yIGVxdWFsIHRvIG1pbkJ1ZmZlclB4Jyk7XG4gICAgfVxuICAgIHRoaXMuX2l0ZW1TaXplID0gaXRlbVNpemU7XG4gICAgdGhpcy5fbWluQnVmZmVyUHggPSBtaW5CdWZmZXJQeDtcbiAgICB0aGlzLl9tYXhCdWZmZXJQeCA9IG1heEJ1ZmZlclB4O1xuICAgIHRoaXMuX3VwZGF0ZVRvdGFsQ29udGVudFNpemUoKTtcbiAgICB0aGlzLl91cGRhdGVSZW5kZXJlZFJhbmdlKCk7XG4gIH1cblxuICAvKiogQGRvY3MtcHJpdmF0ZSBJbXBsZW1lbnRlZCBhcyBwYXJ0IG9mIFZpcnR1YWxTY3JvbGxTdHJhdGVneS4gKi9cbiAgb25Db250ZW50U2Nyb2xsZWQoKSB7XG4gICAgdGhpcy5fdXBkYXRlUmVuZGVyZWRSYW5nZSgpO1xuICB9XG5cbiAgLyoqIEBkb2NzLXByaXZhdGUgSW1wbGVtZW50ZWQgYXMgcGFydCBvZiBWaXJ0dWFsU2Nyb2xsU3RyYXRlZ3kuICovXG4gIG9uRGF0YUxlbmd0aENoYW5nZWQoKSB7XG4gICAgdGhpcy5fdXBkYXRlVG90YWxDb250ZW50U2l6ZSgpO1xuICAgIHRoaXMuX3VwZGF0ZVJlbmRlcmVkUmFuZ2UoKTtcbiAgfVxuXG4gIC8qKiBAZG9jcy1wcml2YXRlIEltcGxlbWVudGVkIGFzIHBhcnQgb2YgVmlydHVhbFNjcm9sbFN0cmF0ZWd5LiAqL1xuICBvbkNvbnRlbnRSZW5kZXJlZCgpIHtcbiAgICAvKiBuby1vcCAqL1xuICB9XG5cbiAgLyoqIEBkb2NzLXByaXZhdGUgSW1wbGVtZW50ZWQgYXMgcGFydCBvZiBWaXJ0dWFsU2Nyb2xsU3RyYXRlZ3kuICovXG4gIG9uUmVuZGVyZWRPZmZzZXRDaGFuZ2VkKCkge1xuICAgIC8qIG5vLW9wICovXG4gIH1cblxuICAvKipcbiAgICogU2Nyb2xsIHRvIHRoZSBvZmZzZXQgZm9yIHRoZSBnaXZlbiBpbmRleC5cbiAgICogQHBhcmFtIGluZGV4IFRoZSBpbmRleCBvZiB0aGUgZWxlbWVudCB0byBzY3JvbGwgdG8uXG4gICAqIEBwYXJhbSBiZWhhdmlvciBUaGUgU2Nyb2xsQmVoYXZpb3IgdG8gdXNlIHdoZW4gc2Nyb2xsaW5nLlxuICAgKi9cbiAgc2Nyb2xsVG9JbmRleChpbmRleDogbnVtYmVyLCBiZWhhdmlvcjogU2Nyb2xsQmVoYXZpb3IpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fdmlld3BvcnQpIHtcbiAgICAgIHRoaXMuX3ZpZXdwb3J0LnNjcm9sbFRvT2Zmc2V0KGluZGV4ICogdGhpcy5faXRlbVNpemUsIGJlaGF2aW9yKTtcbiAgICB9XG4gIH1cblxuICAvKiogVXBkYXRlIHRoZSB2aWV3cG9ydCdzIHRvdGFsIGNvbnRlbnQgc2l6ZS4gKi9cbiAgcHJpdmF0ZSBfdXBkYXRlVG90YWxDb250ZW50U2l6ZSgpIHtcbiAgICBpZiAoIXRoaXMuX3ZpZXdwb3J0KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5fdmlld3BvcnQuc2V0VG90YWxDb250ZW50U2l6ZSh0aGlzLl92aWV3cG9ydC5nZXREYXRhTGVuZ3RoKCkgKiB0aGlzLl9pdGVtU2l6ZSk7XG4gIH1cblxuICAvKiogVXBkYXRlIHRoZSB2aWV3cG9ydCdzIHJlbmRlcmVkIHJhbmdlLiAqL1xuICBwcml2YXRlIF91cGRhdGVSZW5kZXJlZFJhbmdlKCkge1xuICAgIGlmICghdGhpcy5fdmlld3BvcnQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCByZW5kZXJlZFJhbmdlID0gdGhpcy5fdmlld3BvcnQuZ2V0UmVuZGVyZWRSYW5nZSgpO1xuICAgIGNvbnN0IG5ld1JhbmdlID0ge3N0YXJ0OiByZW5kZXJlZFJhbmdlLnN0YXJ0LCBlbmQ6IHJlbmRlcmVkUmFuZ2UuZW5kfTtcbiAgICBjb25zdCB2aWV3cG9ydFNpemUgPSB0aGlzLl92aWV3cG9ydC5nZXRWaWV3cG9ydFNpemUoKTtcbiAgICBjb25zdCBkYXRhTGVuZ3RoID0gdGhpcy5fdmlld3BvcnQuZ2V0RGF0YUxlbmd0aCgpO1xuICAgIGxldCBzY3JvbGxPZmZzZXQgPSB0aGlzLl92aWV3cG9ydC5tZWFzdXJlU2Nyb2xsT2Zmc2V0KCk7XG4gICAgLy8gUHJldmVudCBOYU4gYXMgcmVzdWx0IHdoZW4gZGl2aWRpbmcgYnkgemVyby5cbiAgICBsZXQgZmlyc3RWaXNpYmxlSW5kZXggPSB0aGlzLl9pdGVtU2l6ZSA+IDAgPyBzY3JvbGxPZmZzZXQgLyB0aGlzLl9pdGVtU2l6ZSA6IDA7XG5cbiAgICAvLyBJZiB1c2VyIHNjcm9sbHMgdG8gdGhlIGJvdHRvbSBvZiB0aGUgbGlzdCBhbmQgZGF0YSBjaGFuZ2VzIHRvIGEgc21hbGxlciBsaXN0XG4gICAgaWYgKG5ld1JhbmdlLmVuZCA+IGRhdGFMZW5ndGgpIHtcbiAgICAgIC8vIFdlIGhhdmUgdG8gcmVjYWxjdWxhdGUgdGhlIGZpcnN0IHZpc2libGUgaW5kZXggYmFzZWQgb24gbmV3IGRhdGEgbGVuZ3RoIGFuZCB2aWV3cG9ydCBzaXplLlxuICAgICAgY29uc3QgbWF4VmlzaWJsZUl0ZW1zID0gTWF0aC5jZWlsKHZpZXdwb3J0U2l6ZSAvIHRoaXMuX2l0ZW1TaXplKTtcbiAgICAgIGNvbnN0IG5ld1Zpc2libGVJbmRleCA9IE1hdGgubWF4KFxuICAgICAgICAwLFxuICAgICAgICBNYXRoLm1pbihmaXJzdFZpc2libGVJbmRleCwgZGF0YUxlbmd0aCAtIG1heFZpc2libGVJdGVtcyksXG4gICAgICApO1xuXG4gICAgICAvLyBJZiBmaXJzdCB2aXNpYmxlIGluZGV4IGNoYW5nZWQgd2UgbXVzdCB1cGRhdGUgc2Nyb2xsIG9mZnNldCB0byBoYW5kbGUgc3RhcnQvZW5kIGJ1ZmZlcnNcbiAgICAgIC8vIEN1cnJlbnQgcmFuZ2UgbXVzdCBhbHNvIGJlIGFkanVzdGVkIHRvIGNvdmVyIHRoZSBuZXcgcG9zaXRpb24gKGJvdHRvbSBvZiBuZXcgbGlzdCkuXG4gICAgICBpZiAoZmlyc3RWaXNpYmxlSW5kZXggIT0gbmV3VmlzaWJsZUluZGV4KSB7XG4gICAgICAgIGZpcnN0VmlzaWJsZUluZGV4ID0gbmV3VmlzaWJsZUluZGV4O1xuICAgICAgICBzY3JvbGxPZmZzZXQgPSBuZXdWaXNpYmxlSW5kZXggKiB0aGlzLl9pdGVtU2l6ZTtcbiAgICAgICAgbmV3UmFuZ2Uuc3RhcnQgPSBNYXRoLmZsb29yKGZpcnN0VmlzaWJsZUluZGV4KTtcbiAgICAgIH1cblxuICAgICAgbmV3UmFuZ2UuZW5kID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oZGF0YUxlbmd0aCwgbmV3UmFuZ2Uuc3RhcnQgKyBtYXhWaXNpYmxlSXRlbXMpKTtcbiAgICB9XG5cbiAgICBjb25zdCBzdGFydEJ1ZmZlciA9IHNjcm9sbE9mZnNldCAtIG5ld1JhbmdlLnN0YXJ0ICogdGhpcy5faXRlbVNpemU7XG4gICAgaWYgKHN0YXJ0QnVmZmVyIDwgdGhpcy5fbWluQnVmZmVyUHggJiYgbmV3UmFuZ2Uuc3RhcnQgIT0gMCkge1xuICAgICAgY29uc3QgZXhwYW5kU3RhcnQgPSBNYXRoLmNlaWwoKHRoaXMuX21heEJ1ZmZlclB4IC0gc3RhcnRCdWZmZXIpIC8gdGhpcy5faXRlbVNpemUpO1xuICAgICAgbmV3UmFuZ2Uuc3RhcnQgPSBNYXRoLm1heCgwLCBuZXdSYW5nZS5zdGFydCAtIGV4cGFuZFN0YXJ0KTtcbiAgICAgIG5ld1JhbmdlLmVuZCA9IE1hdGgubWluKFxuICAgICAgICBkYXRhTGVuZ3RoLFxuICAgICAgICBNYXRoLmNlaWwoZmlyc3RWaXNpYmxlSW5kZXggKyAodmlld3BvcnRTaXplICsgdGhpcy5fbWluQnVmZmVyUHgpIC8gdGhpcy5faXRlbVNpemUpLFxuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgZW5kQnVmZmVyID0gbmV3UmFuZ2UuZW5kICogdGhpcy5faXRlbVNpemUgLSAoc2Nyb2xsT2Zmc2V0ICsgdmlld3BvcnRTaXplKTtcbiAgICAgIGlmIChlbmRCdWZmZXIgPCB0aGlzLl9taW5CdWZmZXJQeCAmJiBuZXdSYW5nZS5lbmQgIT0gZGF0YUxlbmd0aCkge1xuICAgICAgICBjb25zdCBleHBhbmRFbmQgPSBNYXRoLmNlaWwoKHRoaXMuX21heEJ1ZmZlclB4IC0gZW5kQnVmZmVyKSAvIHRoaXMuX2l0ZW1TaXplKTtcbiAgICAgICAgaWYgKGV4cGFuZEVuZCA+IDApIHtcbiAgICAgICAgICBuZXdSYW5nZS5lbmQgPSBNYXRoLm1pbihkYXRhTGVuZ3RoLCBuZXdSYW5nZS5lbmQgKyBleHBhbmRFbmQpO1xuICAgICAgICAgIG5ld1JhbmdlLnN0YXJ0ID0gTWF0aC5tYXgoXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgTWF0aC5mbG9vcihmaXJzdFZpc2libGVJbmRleCAtIHRoaXMuX21pbkJ1ZmZlclB4IC8gdGhpcy5faXRlbVNpemUpLFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLl92aWV3cG9ydC5zZXRSZW5kZXJlZFJhbmdlKG5ld1JhbmdlKTtcbiAgICB0aGlzLl92aWV3cG9ydC5zZXRSZW5kZXJlZENvbnRlbnRPZmZzZXQodGhpcy5faXRlbVNpemUgKiBuZXdSYW5nZS5zdGFydCk7XG4gICAgdGhpcy5fc2Nyb2xsZWRJbmRleENoYW5nZS5uZXh0KE1hdGguZmxvb3IoZmlyc3RWaXNpYmxlSW5kZXgpKTtcbiAgfVxufVxuXG4vKipcbiAqIFByb3ZpZGVyIGZhY3RvcnkgZm9yIGBGaXhlZFNpemVWaXJ0dWFsU2Nyb2xsU3RyYXRlZ3lgIHRoYXQgc2ltcGx5IGV4dHJhY3RzIHRoZSBhbHJlYWR5IGNyZWF0ZWRcbiAqIGBGaXhlZFNpemVWaXJ0dWFsU2Nyb2xsU3RyYXRlZ3lgIGZyb20gdGhlIGdpdmVuIGRpcmVjdGl2ZS5cbiAqIEBwYXJhbSBmaXhlZFNpemVEaXIgVGhlIGluc3RhbmNlIG9mIGBDZGtGaXhlZFNpemVWaXJ0dWFsU2Nyb2xsYCB0byBleHRyYWN0IHRoZVxuICogICAgIGBGaXhlZFNpemVWaXJ0dWFsU2Nyb2xsU3RyYXRlZ3lgIGZyb20uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBfZml4ZWRTaXplVmlydHVhbFNjcm9sbFN0cmF0ZWd5RmFjdG9yeShmaXhlZFNpemVEaXI6IENka0ZpeGVkU2l6ZVZpcnR1YWxTY3JvbGwpIHtcbiAgcmV0dXJuIGZpeGVkU2l6ZURpci5fc2Nyb2xsU3RyYXRlZ3k7XG59XG5cbi8qKiBBIHZpcnR1YWwgc2Nyb2xsIHN0cmF0ZWd5IHRoYXQgc3VwcG9ydHMgZml4ZWQtc2l6ZSBpdGVtcy4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ2Nkay12aXJ0dWFsLXNjcm9sbC12aWV3cG9ydFtpdGVtU2l6ZV0nLFxuICBzdGFuZGFsb25lOiB0cnVlLFxuICBwcm92aWRlcnM6IFtcbiAgICB7XG4gICAgICBwcm92aWRlOiBWSVJUVUFMX1NDUk9MTF9TVFJBVEVHWSxcbiAgICAgIHVzZUZhY3Rvcnk6IF9maXhlZFNpemVWaXJ0dWFsU2Nyb2xsU3RyYXRlZ3lGYWN0b3J5LFxuICAgICAgZGVwczogW2ZvcndhcmRSZWYoKCkgPT4gQ2RrRml4ZWRTaXplVmlydHVhbFNjcm9sbCldLFxuICAgIH0sXG4gIF0sXG59KVxuZXhwb3J0IGNsYXNzIENka0ZpeGVkU2l6ZVZpcnR1YWxTY3JvbGwgaW1wbGVtZW50cyBPbkNoYW5nZXMge1xuICAvKiogVGhlIHNpemUgb2YgdGhlIGl0ZW1zIGluIHRoZSBsaXN0IChpbiBwaXhlbHMpLiAqL1xuICBASW5wdXQoKVxuICBnZXQgaXRlbVNpemUoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5faXRlbVNpemU7XG4gIH1cbiAgc2V0IGl0ZW1TaXplKHZhbHVlOiBOdW1iZXJJbnB1dCkge1xuICAgIHRoaXMuX2l0ZW1TaXplID0gY29lcmNlTnVtYmVyUHJvcGVydHkodmFsdWUpO1xuICB9XG4gIF9pdGVtU2l6ZSA9IDIwO1xuXG4gIC8qKlxuICAgKiBUaGUgbWluaW11bSBhbW91bnQgb2YgYnVmZmVyIHJlbmRlcmVkIGJleW9uZCB0aGUgdmlld3BvcnQgKGluIHBpeGVscykuXG4gICAqIElmIHRoZSBhbW91bnQgb2YgYnVmZmVyIGRpcHMgYmVsb3cgdGhpcyBudW1iZXIsIG1vcmUgaXRlbXMgd2lsbCBiZSByZW5kZXJlZC4gRGVmYXVsdHMgdG8gMTAwcHguXG4gICAqL1xuICBASW5wdXQoKVxuICBnZXQgbWluQnVmZmVyUHgoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fbWluQnVmZmVyUHg7XG4gIH1cbiAgc2V0IG1pbkJ1ZmZlclB4KHZhbHVlOiBOdW1iZXJJbnB1dCkge1xuICAgIHRoaXMuX21pbkJ1ZmZlclB4ID0gY29lcmNlTnVtYmVyUHJvcGVydHkodmFsdWUpO1xuICB9XG4gIF9taW5CdWZmZXJQeCA9IDEwMDtcblxuICAvKipcbiAgICogVGhlIG51bWJlciBvZiBwaXhlbHMgd29ydGggb2YgYnVmZmVyIHRvIHJlbmRlciBmb3Igd2hlbiByZW5kZXJpbmcgbmV3IGl0ZW1zLiBEZWZhdWx0cyB0byAyMDBweC5cbiAgICovXG4gIEBJbnB1dCgpXG4gIGdldCBtYXhCdWZmZXJQeCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9tYXhCdWZmZXJQeDtcbiAgfVxuICBzZXQgbWF4QnVmZmVyUHgodmFsdWU6IE51bWJlcklucHV0KSB7XG4gICAgdGhpcy5fbWF4QnVmZmVyUHggPSBjb2VyY2VOdW1iZXJQcm9wZXJ0eSh2YWx1ZSk7XG4gIH1cbiAgX21heEJ1ZmZlclB4ID0gMjAwO1xuXG4gIC8qKiBUaGUgc2Nyb2xsIHN0cmF0ZWd5IHVzZWQgYnkgdGhpcyBkaXJlY3RpdmUuICovXG4gIF9zY3JvbGxTdHJhdGVneSA9IG5ldyBGaXhlZFNpemVWaXJ0dWFsU2Nyb2xsU3RyYXRlZ3koXG4gICAgdGhpcy5pdGVtU2l6ZSxcbiAgICB0aGlzLm1pbkJ1ZmZlclB4LFxuICAgIHRoaXMubWF4QnVmZmVyUHgsXG4gICk7XG5cbiAgbmdPbkNoYW5nZXMoKSB7XG4gICAgdGhpcy5fc2Nyb2xsU3RyYXRlZ3kudXBkYXRlSXRlbUFuZEJ1ZmZlclNpemUodGhpcy5pdGVtU2l6ZSwgdGhpcy5taW5CdWZmZXJQeCwgdGhpcy5tYXhCdWZmZXJQeCk7XG4gIH1cbn1cbiJdfQ==