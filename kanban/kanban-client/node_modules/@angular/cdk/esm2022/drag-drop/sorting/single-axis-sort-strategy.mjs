/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { coerceElement } from '@angular/cdk/coercion';
import { moveItemInArray } from '../drag-utils';
import { combineTransforms } from '../dom/styling';
import { adjustDomRect, getMutableClientRect, isInsideClientRect } from '../dom/dom-rect';
/**
 * Strategy that only supports sorting along a single axis.
 * Items are reordered using CSS transforms which allows for sorting to be animated.
 * @docs-private
 */
export class SingleAxisSortStrategy {
    constructor(_element, _dragDropRegistry) {
        this._element = _element;
        this._dragDropRegistry = _dragDropRegistry;
        /** Cache of the dimensions of all the items inside the container. */
        this._itemPositions = [];
        /** Direction in which the list is oriented. */
        this.orientation = 'vertical';
        /**
         * Keeps track of the item that was last swapped with the dragged item, as well as what direction
         * the pointer was moving in when the swap occurred and whether the user's pointer continued to
         * overlap with the swapped item after the swapping occurred.
         */
        this._previousSwap = {
            drag: null,
            delta: 0,
            overlaps: false,
        };
    }
    /**
     * To be called when the drag sequence starts.
     * @param items Items that are currently in the list.
     */
    start(items) {
        this.withItems(items);
    }
    /**
     * To be called when an item is being sorted.
     * @param item Item to be sorted.
     * @param pointerX Position of the item along the X axis.
     * @param pointerY Position of the item along the Y axis.
     * @param pointerDelta Direction in which the pointer is moving along each axis.
     */
    sort(item, pointerX, pointerY, pointerDelta) {
        const siblings = this._itemPositions;
        const newIndex = this._getItemIndexFromPointerPosition(item, pointerX, pointerY, pointerDelta);
        if (newIndex === -1 && siblings.length > 0) {
            return null;
        }
        const isHorizontal = this.orientation === 'horizontal';
        const currentIndex = siblings.findIndex(currentItem => currentItem.drag === item);
        const siblingAtNewPosition = siblings[newIndex];
        const currentPosition = siblings[currentIndex].clientRect;
        const newPosition = siblingAtNewPosition.clientRect;
        const delta = currentIndex > newIndex ? 1 : -1;
        // How many pixels the item's placeholder should be offset.
        const itemOffset = this._getItemOffsetPx(currentPosition, newPosition, delta);
        // How many pixels all the other items should be offset.
        const siblingOffset = this._getSiblingOffsetPx(currentIndex, siblings, delta);
        // Save the previous order of the items before moving the item to its new index.
        // We use this to check whether an item has been moved as a result of the sorting.
        const oldOrder = siblings.slice();
        // Shuffle the array in place.
        moveItemInArray(siblings, currentIndex, newIndex);
        siblings.forEach((sibling, index) => {
            // Don't do anything if the position hasn't changed.
            if (oldOrder[index] === sibling) {
                return;
            }
            const isDraggedItem = sibling.drag === item;
            const offset = isDraggedItem ? itemOffset : siblingOffset;
            const elementToOffset = isDraggedItem
                ? item.getPlaceholderElement()
                : sibling.drag.getRootElement();
            // Update the offset to reflect the new position.
            sibling.offset += offset;
            // Since we're moving the items with a `transform`, we need to adjust their cached
            // client rects to reflect their new position, as well as swap their positions in the cache.
            // Note that we shouldn't use `getBoundingClientRect` here to update the cache, because the
            // elements may be mid-animation which will give us a wrong result.
            if (isHorizontal) {
                // Round the transforms since some browsers will
                // blur the elements, for sub-pixel transforms.
                elementToOffset.style.transform = combineTransforms(`translate3d(${Math.round(sibling.offset)}px, 0, 0)`, sibling.initialTransform);
                adjustDomRect(sibling.clientRect, 0, offset);
            }
            else {
                elementToOffset.style.transform = combineTransforms(`translate3d(0, ${Math.round(sibling.offset)}px, 0)`, sibling.initialTransform);
                adjustDomRect(sibling.clientRect, offset, 0);
            }
        });
        // Note that it's important that we do this after the client rects have been adjusted.
        this._previousSwap.overlaps = isInsideClientRect(newPosition, pointerX, pointerY);
        this._previousSwap.drag = siblingAtNewPosition.drag;
        this._previousSwap.delta = isHorizontal ? pointerDelta.x : pointerDelta.y;
        return { previousIndex: currentIndex, currentIndex: newIndex };
    }
    /**
     * Called when an item is being moved into the container.
     * @param item Item that was moved into the container.
     * @param pointerX Position of the item along the X axis.
     * @param pointerY Position of the item along the Y axis.
     * @param index Index at which the item entered. If omitted, the container will try to figure it
     *   out automatically.
     */
    enter(item, pointerX, pointerY, index) {
        const newIndex = index == null || index < 0
            ? // We use the coordinates of where the item entered the drop
                // zone to figure out at which index it should be inserted.
                this._getItemIndexFromPointerPosition(item, pointerX, pointerY)
            : index;
        const activeDraggables = this._activeDraggables;
        const currentIndex = activeDraggables.indexOf(item);
        const placeholder = item.getPlaceholderElement();
        let newPositionReference = activeDraggables[newIndex];
        // If the item at the new position is the same as the item that is being dragged,
        // it means that we're trying to restore the item to its initial position. In this
        // case we should use the next item from the list as the reference.
        if (newPositionReference === item) {
            newPositionReference = activeDraggables[newIndex + 1];
        }
        // If we didn't find a new position reference, it means that either the item didn't start off
        // in this container, or that the item requested to be inserted at the end of the list.
        if (!newPositionReference &&
            (newIndex == null || newIndex === -1 || newIndex < activeDraggables.length - 1) &&
            this._shouldEnterAsFirstChild(pointerX, pointerY)) {
            newPositionReference = activeDraggables[0];
        }
        // Since the item may be in the `activeDraggables` already (e.g. if the user dragged it
        // into another container and back again), we have to ensure that it isn't duplicated.
        if (currentIndex > -1) {
            activeDraggables.splice(currentIndex, 1);
        }
        // Don't use items that are being dragged as a reference, because
        // their element has been moved down to the bottom of the body.
        if (newPositionReference && !this._dragDropRegistry.isDragging(newPositionReference)) {
            const element = newPositionReference.getRootElement();
            element.parentElement.insertBefore(placeholder, element);
            activeDraggables.splice(newIndex, 0, item);
        }
        else {
            coerceElement(this._element).appendChild(placeholder);
            activeDraggables.push(item);
        }
        // The transform needs to be cleared so it doesn't throw off the measurements.
        placeholder.style.transform = '';
        // Note that usually `start` is called together with `enter` when an item goes into a new
        // container. This will cache item positions, but we need to refresh them since the amount
        // of items has changed.
        this._cacheItemPositions();
    }
    /** Sets the items that are currently part of the list. */
    withItems(items) {
        this._activeDraggables = items.slice();
        this._cacheItemPositions();
    }
    /** Assigns a sort predicate to the strategy. */
    withSortPredicate(predicate) {
        this._sortPredicate = predicate;
    }
    /** Resets the strategy to its initial state before dragging was started. */
    reset() {
        // TODO(crisbeto): may have to wait for the animations to finish.
        this._activeDraggables.forEach(item => {
            const rootElement = item.getRootElement();
            if (rootElement) {
                const initialTransform = this._itemPositions.find(p => p.drag === item)?.initialTransform;
                rootElement.style.transform = initialTransform || '';
            }
        });
        this._itemPositions = [];
        this._activeDraggables = [];
        this._previousSwap.drag = null;
        this._previousSwap.delta = 0;
        this._previousSwap.overlaps = false;
    }
    /**
     * Gets a snapshot of items currently in the list.
     * Can include items that we dragged in from another list.
     */
    getActiveItemsSnapshot() {
        return this._activeDraggables;
    }
    /** Gets the index of a specific item. */
    getItemIndex(item) {
        // Items are sorted always by top/left in the cache, however they flow differently in RTL.
        // The rest of the logic still stands no matter what orientation we're in, however
        // we need to invert the array when determining the index.
        const items = this.orientation === 'horizontal' && this.direction === 'rtl'
            ? this._itemPositions.slice().reverse()
            : this._itemPositions;
        return items.findIndex(currentItem => currentItem.drag === item);
    }
    /** Used to notify the strategy that the scroll position has changed. */
    updateOnScroll(topDifference, leftDifference) {
        // Since we know the amount that the user has scrolled we can shift all of the
        // client rectangles ourselves. This is cheaper than re-measuring everything and
        // we can avoid inconsistent behavior where we might be measuring the element before
        // its position has changed.
        this._itemPositions.forEach(({ clientRect }) => {
            adjustDomRect(clientRect, topDifference, leftDifference);
        });
        // We need two loops for this, because we want all of the cached
        // positions to be up-to-date before we re-sort the item.
        this._itemPositions.forEach(({ drag }) => {
            if (this._dragDropRegistry.isDragging(drag)) {
                // We need to re-sort the item manually, because the pointer move
                // events won't be dispatched while the user is scrolling.
                drag._sortFromLastPointerPosition();
            }
        });
    }
    /** Refreshes the position cache of the items and sibling containers. */
    _cacheItemPositions() {
        const isHorizontal = this.orientation === 'horizontal';
        this._itemPositions = this._activeDraggables
            .map(drag => {
            const elementToMeasure = drag.getVisibleElement();
            return {
                drag,
                offset: 0,
                initialTransform: elementToMeasure.style.transform || '',
                clientRect: getMutableClientRect(elementToMeasure),
            };
        })
            .sort((a, b) => {
            return isHorizontal
                ? a.clientRect.left - b.clientRect.left
                : a.clientRect.top - b.clientRect.top;
        });
    }
    /**
     * Gets the offset in pixels by which the item that is being dragged should be moved.
     * @param currentPosition Current position of the item.
     * @param newPosition Position of the item where the current item should be moved.
     * @param delta Direction in which the user is moving.
     */
    _getItemOffsetPx(currentPosition, newPosition, delta) {
        const isHorizontal = this.orientation === 'horizontal';
        let itemOffset = isHorizontal
            ? newPosition.left - currentPosition.left
            : newPosition.top - currentPosition.top;
        // Account for differences in the item width/height.
        if (delta === -1) {
            itemOffset += isHorizontal
                ? newPosition.width - currentPosition.width
                : newPosition.height - currentPosition.height;
        }
        return itemOffset;
    }
    /**
     * Gets the offset in pixels by which the items that aren't being dragged should be moved.
     * @param currentIndex Index of the item currently being dragged.
     * @param siblings All of the items in the list.
     * @param delta Direction in which the user is moving.
     */
    _getSiblingOffsetPx(currentIndex, siblings, delta) {
        const isHorizontal = this.orientation === 'horizontal';
        const currentPosition = siblings[currentIndex].clientRect;
        const immediateSibling = siblings[currentIndex + delta * -1];
        let siblingOffset = currentPosition[isHorizontal ? 'width' : 'height'] * delta;
        if (immediateSibling) {
            const start = isHorizontal ? 'left' : 'top';
            const end = isHorizontal ? 'right' : 'bottom';
            // Get the spacing between the start of the current item and the end of the one immediately
            // after it in the direction in which the user is dragging, or vice versa. We add it to the
            // offset in order to push the element to where it will be when it's inline and is influenced
            // by the `margin` of its siblings.
            if (delta === -1) {
                siblingOffset -= immediateSibling.clientRect[start] - currentPosition[end];
            }
            else {
                siblingOffset += currentPosition[start] - immediateSibling.clientRect[end];
            }
        }
        return siblingOffset;
    }
    /**
     * Checks if pointer is entering in the first position
     * @param pointerX Position of the user's pointer along the X axis.
     * @param pointerY Position of the user's pointer along the Y axis.
     */
    _shouldEnterAsFirstChild(pointerX, pointerY) {
        if (!this._activeDraggables.length) {
            return false;
        }
        const itemPositions = this._itemPositions;
        const isHorizontal = this.orientation === 'horizontal';
        // `itemPositions` are sorted by position while `activeDraggables` are sorted by child index
        // check if container is using some sort of "reverse" ordering (eg: flex-direction: row-reverse)
        const reversed = itemPositions[0].drag !== this._activeDraggables[0];
        if (reversed) {
            const lastItemRect = itemPositions[itemPositions.length - 1].clientRect;
            return isHorizontal ? pointerX >= lastItemRect.right : pointerY >= lastItemRect.bottom;
        }
        else {
            const firstItemRect = itemPositions[0].clientRect;
            return isHorizontal ? pointerX <= firstItemRect.left : pointerY <= firstItemRect.top;
        }
    }
    /**
     * Gets the index of an item in the drop container, based on the position of the user's pointer.
     * @param item Item that is being sorted.
     * @param pointerX Position of the user's pointer along the X axis.
     * @param pointerY Position of the user's pointer along the Y axis.
     * @param delta Direction in which the user is moving their pointer.
     */
    _getItemIndexFromPointerPosition(item, pointerX, pointerY, delta) {
        const isHorizontal = this.orientation === 'horizontal';
        const index = this._itemPositions.findIndex(({ drag, clientRect }) => {
            // Skip the item itself.
            if (drag === item) {
                return false;
            }
            if (delta) {
                const direction = isHorizontal ? delta.x : delta.y;
                // If the user is still hovering over the same item as last time, their cursor hasn't left
                // the item after we made the swap, and they didn't change the direction in which they're
                // dragging, we don't consider it a direction swap.
                if (drag === this._previousSwap.drag &&
                    this._previousSwap.overlaps &&
                    direction === this._previousSwap.delta) {
                    return false;
                }
            }
            return isHorizontal
                ? // Round these down since most browsers report client rects with
                    // sub-pixel precision, whereas the pointer coordinates are rounded to pixels.
                    pointerX >= Math.floor(clientRect.left) && pointerX < Math.floor(clientRect.right)
                : pointerY >= Math.floor(clientRect.top) && pointerY < Math.floor(clientRect.bottom);
        });
        return index === -1 || !this._sortPredicate(index, item) ? -1 : index;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2luZ2xlLWF4aXMtc29ydC1zdHJhdGVneS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvZHJhZy1kcm9wL3NvcnRpbmcvc2luZ2xlLWF4aXMtc29ydC1zdHJhdGVneS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFJSCxPQUFPLEVBQUMsYUFBYSxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFFcEQsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUM5QyxPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUNqRCxPQUFPLEVBQUMsYUFBYSxFQUFFLG9CQUFvQixFQUFFLGtCQUFrQixFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFzQnhGOzs7O0dBSUc7QUFDSCxNQUFNLE9BQU8sc0JBQXNCO0lBc0JqQyxZQUNVLFFBQStDLEVBQy9DLGlCQUErQztRQUQvQyxhQUFRLEdBQVIsUUFBUSxDQUF1QztRQUMvQyxzQkFBaUIsR0FBakIsaUJBQWlCLENBQThCO1FBbEJ6RCxxRUFBcUU7UUFDN0QsbUJBQWMsR0FBNEIsRUFBRSxDQUFDO1FBU3JELCtDQUErQztRQUMvQyxnQkFBVyxHQUE4QixVQUFVLENBQUM7UUFVcEQ7Ozs7V0FJRztRQUNLLGtCQUFhLEdBQUc7WUFDdEIsSUFBSSxFQUFFLElBQWdCO1lBQ3RCLEtBQUssRUFBRSxDQUFDO1lBQ1IsUUFBUSxFQUFFLEtBQUs7U0FDaEIsQ0FBQztJQVhDLENBQUM7SUFhSjs7O09BR0c7SUFDSCxLQUFLLENBQUMsS0FBbUI7UUFDdkIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUN4QixDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0gsSUFBSSxDQUFDLElBQU8sRUFBRSxRQUFnQixFQUFFLFFBQWdCLEVBQUUsWUFBb0M7UUFDcEYsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLGNB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QyxNQUFNLENBQUMsQ0FBQztRQUN6RixDQUFDLENBQUMsQ0FBQztRQUVILE9BQU8sS0FBSyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7SUFDeEUsQ0FBQztDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RGlyZWN0aW9ufSBmcm9tICdAYW5ndWxhci9jZGsvYmlkaSc7XG5pbXBvcnQge0VsZW1lbnRSZWZ9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtjb2VyY2VFbGVtZW50fSBmcm9tICdAYW5ndWxhci9jZGsvY29lcmNpb24nO1xuaW1wb3J0IHtEcmFnRHJvcFJlZ2lzdHJ5fSBmcm9tICcuLi9kcmFnLWRyb3AtcmVnaXN0cnknO1xuaW1wb3J0IHttb3ZlSXRlbUluQXJyYXl9IGZyb20gJy4uL2RyYWctdXRpbHMnO1xuaW1wb3J0IHtjb21iaW5lVHJhbnNmb3Jtc30gZnJvbSAnLi4vZG9tL3N0eWxpbmcnO1xuaW1wb3J0IHthZGp1c3REb21SZWN0LCBnZXRNdXRhYmxlQ2xpZW50UmVjdCwgaXNJbnNpZGVDbGllbnRSZWN0fSBmcm9tICcuLi9kb20vZG9tLXJlY3QnO1xuaW1wb3J0IHtcbiAgRHJvcExpc3RTb3J0U3RyYXRlZ3ksXG4gIERyb3BMaXN0U29ydFN0cmF0ZWd5SXRlbSxcbiAgU29ydFByZWRpY2F0ZSxcbn0gZnJvbSAnLi9kcm9wLWxpc3Qtc29ydC1zdHJhdGVneSc7XG5cbi8qKlxuICogRW50cnkgaW4gdGhlIHBvc2l0aW9uIGNhY2hlIGZvciBkcmFnZ2FibGUgaXRlbXMuXG4gKiBAZG9jcy1wcml2YXRlXG4gKi9cbmludGVyZmFjZSBDYWNoZWRJdGVtUG9zaXRpb248VD4ge1xuICAvKiogSW5zdGFuY2Ugb2YgdGhlIGRyYWcgaXRlbS4gKi9cbiAgZHJhZzogVDtcbiAgLyoqIERpbWVuc2lvbnMgb2YgdGhlIGl0ZW0uICovXG4gIGNsaWVudFJlY3Q6IERPTVJlY3Q7XG4gIC8qKiBBbW91bnQgYnkgd2hpY2ggdGhlIGl0ZW0gaGFzIGJlZW4gbW92ZWQgc2luY2UgZHJhZ2dpbmcgc3RhcnRlZC4gKi9cbiAgb2Zmc2V0OiBudW1iZXI7XG4gIC8qKiBJbmxpbmUgdHJhbnNmb3JtIHRoYXQgdGhlIGRyYWcgaXRlbSBoYWQgd2hlbiBkcmFnZ2luZyBzdGFydGVkLiAqL1xuICBpbml0aWFsVHJhbnNmb3JtOiBzdHJpbmc7XG59XG5cbi8qKlxuICogU3RyYXRlZ3kgdGhhdCBvbmx5IHN1cHBvcnRzIHNvcnRpbmcgYWxvbmcgYSBzaW5nbGUgYXhpcy5cbiAqIEl0ZW1zIGFyZSByZW9yZGVyZWQgdXNpbmcgQ1NTIHRyYW5zZm9ybXMgd2hpY2ggYWxsb3dzIGZvciBzb3J0aW5nIHRvIGJlIGFuaW1hdGVkLlxuICogQGRvY3MtcHJpdmF0ZVxuICovXG5leHBvcnQgY2xhc3MgU2luZ2xlQXhpc1NvcnRTdHJhdGVneTxUIGV4dGVuZHMgRHJvcExpc3RTb3J0U3RyYXRlZ3lJdGVtPlxuICBpbXBsZW1lbnRzIERyb3BMaXN0U29ydFN0cmF0ZWd5PFQ+XG57XG4gIC8qKiBGdW5jdGlvbiB1c2VkIHRvIGRldGVybWluZSBpZiBhbiBpdGVtIGNhbiBiZSBzb3J0ZWQgaW50byBhIHNwZWNpZmljIGluZGV4LiAqL1xuICBwcml2YXRlIF9zb3J0UHJlZGljYXRlOiBTb3J0UHJlZGljYXRlPFQ+O1xuXG4gIC8qKiBDYWNoZSBvZiB0aGUgZGltZW5zaW9ucyBvZiBhbGwgdGhlIGl0ZW1zIGluc2lkZSB0aGUgY29udGFpbmVyLiAqL1xuICBwcml2YXRlIF9pdGVtUG9zaXRpb25zOiBDYWNoZWRJdGVtUG9zaXRpb248VD5bXSA9IFtdO1xuXG4gIC8qKlxuICAgKiBEcmFnZ2FibGUgaXRlbXMgdGhhdCBhcmUgY3VycmVudGx5IGFjdGl2ZSBpbnNpZGUgdGhlIGNvbnRhaW5lci4gSW5jbHVkZXMgdGhlIGl0ZW1zXG4gICAqIHRoYXQgd2VyZSB0aGVyZSBhdCB0aGUgc3RhcnQgb2YgdGhlIHNlcXVlbmNlLCBhcyB3ZWxsIGFzIGFueSBpdGVtcyB0aGF0IGhhdmUgYmVlbiBkcmFnZ2VkXG4gICAqIGluLCBidXQgaGF2ZW4ndCBiZWVuIGRyb3BwZWQgeWV0LlxuICAgKi9cbiAgcHJpdmF0ZSBfYWN0aXZlRHJhZ2dhYmxlczogVFtdO1xuXG4gIC8qKiBEaXJlY3Rpb24gaW4gd2hpY2ggdGhlIGxpc3QgaXMgb3JpZW50ZWQuICovXG4gIG9yaWVudGF0aW9uOiAndmVydGljYWwnIHwgJ2hvcml6b250YWwnID0gJ3ZlcnRpY2FsJztcblxuICAvKiogTGF5b3V0IGRpcmVjdGlvbiBvZiB0aGUgZHJvcCBsaXN0LiAqL1xuICBkaXJlY3Rpb246IERpcmVjdGlvbjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIF9lbGVtZW50OiBIVE1MRWxlbWVudCB8IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+LFxuICAgIHByaXZhdGUgX2RyYWdEcm9wUmVnaXN0cnk6IERyYWdEcm9wUmVnaXN0cnk8VCwgdW5rbm93bj4sXG4gICkge31cblxuICAvKipcbiAgICogS2VlcHMgdHJhY2sgb2YgdGhlIGl0ZW0gdGhhdCB3YXMgbGFzdCBzd2FwcGVkIHdpdGggdGhlIGRyYWdnZWQgaXRlbSwgYXMgd2VsbCBhcyB3aGF0IGRpcmVjdGlvblxuICAgKiB0aGUgcG9pbnRlciB3YXMgbW92aW5nIGluIHdoZW4gdGhlIHN3YXAgb2NjdXJyZWQgYW5kIHdoZXRoZXIgdGhlIHVzZXIncyBwb2ludGVyIGNvbnRpbnVlZCB0b1xuICAgKiBvdmVybGFwIHdpdGggdGhlIHN3YXBwZWQgaXRlbSBhZnRlciB0aGUgc3dhcHBpbmcgb2NjdXJyZWQuXG4gICAqL1xuICBwcml2YXRlIF9wcmV2aW91c1N3YXAgPSB7XG4gICAgZHJhZzogbnVsbCBhcyBUIHwgbnVsbCxcbiAgICBkZWx0YTogMCxcbiAgICBvdmVybGFwczogZmFsc2UsXG4gIH07XG5cbiAgLyoqXG4gICAqIFRvIGJlIGNhbGxlZCB3aGVuIHRoZSBkcmFnIHNlcXVlbmNlIHN0YXJ0cy5cbiAgICogQHBhcmFtIGl0ZW1zIEl0ZW1zIHRoYXQgYXJlIGN1cnJlbnRseSBpbiB0aGUgbGlzdC5cbiAgICovXG4gIHN0YXJ0KGl0ZW1zOiByZWFkb25seSBUW10pIHtcbiAgICB0aGlzLndpdGhJdGVtcyhpdGVtcyk7XG4gIH1cblxuICAvKipcbiAgICogVG8gYmUgY2FsbGVkIHdoZW4gYW4gaXRlbSBpcyBiZWluZyBzb3J0ZWQuXG4gICAqIEBwYXJhbSBpdGVtIEl0ZW0gdG8gYmUgc29ydGVkLlxuICAgKiBAcGFyYW0gcG9pbnRlclggUG9zaXRpb24gb2YgdGhlIGl0ZW0gYWxvbmcgdGhlIFggYXhpcy5cbiAgICogQHBhcmFtIHBvaW50ZXJZIFBvc2l0aW9uIG9mIHRoZSBpdGVtIGFsb25nIHRoZSBZIGF4aXMuXG4gICAqIEBwYXJhbSBwb2ludGVyRGVsdGEgRGlyZWN0aW9uIGluIHdoaWNoIHRoZSBwb2ludGVyIGlzIG1vdmluZyBhbG9uZyBlYWNoIGF4aXMuXG4gICAqL1xuICBzb3J0KGl0ZW06IFQsIHBvaW50ZXJYOiBudW1iZXIsIHBvaW50ZXJZOiBudW1iZXIsIHBvaW50ZXJEZWx0YToge3g6IG51bWJlcjsgeTogbnVtYmVyfSkge1xuICAgIGNvbnN0IHNpYmxpbmdzID0gdGhpcy5faXRlbVBvc2l0aW9ucztcbiAgICBjb25zdCBuZXdJbmRleCA9IHRoaXMuX2dldEl0ZW1JbmRleEZyb21Qb2ludGVyUG9zaXRpb24oaXRlbSwgcG9pbnRlclgsIHBvaW50ZXJZLCBwb2ludGVyRGVsdGEpO1xuXG4gICAgaWYgKG5ld0luZGV4ID09PSAtMSAmJiBzaWJsaW5ncy5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCBpc0hvcml6b250YWwgPSB0aGlzLm9yaWVudGF0aW9uID09PSAnaG9yaXpvbnRhbCc7XG4gICAgY29uc3QgY3VycmVudEluZGV4ID0gc2libGluZ3MuZmluZEluZGV4KGN1cnJlbnRJdGVtID0+IGN1cnJlbnRJdGVtLmRyYWcgPT09IGl0ZW0pO1xuICAgIGNvbnN0IHNpYmxpbmdBdE5ld1Bvc2l0aW9uID0gc2libGluZ3NbbmV3SW5kZXhdO1xuICAgIGNvbnN0IGN1cnJlbnRQb3NpdGlvbiA9IHNpYmxpbmdzW2N1cnJlbnRJbmRleF0uY2xpZW50UmVjdDtcbiAgICBjb25zdCBuZXdQb3NpdGlvbiA9IHNpYmxpbmdBdE5ld1Bvc2l0aW9uLmNsaWVudFJlY3Q7XG4gICAgY29uc3QgZGVsdGEgPSBjdXJyZW50SW5kZXggPiBuZXdJbmRleCA/IDEgOiAtMTtcblxuICAgIC8vIEhvdyBtYW55IHBpeGVscyB0aGUgaXRlbSdzIHBsYWNlaG9sZGVyIHNob3VsZCBiZSBvZmZzZXQuXG4gICAgY29uc3QgaXRlbU9mZnNldCA9IHRoaXMuX2dldEl0ZW1PZmZzZXRQeChjdXJyZW50UG9zaXRpb24sIG5ld1Bvc2l0aW9uLCBkZWx0YSk7XG5cbiAgICAvLyBIb3cgbWFueSBwaXhlbHMgYWxsIHRoZSBvdGhlciBpdGVtcyBzaG91bGQgYmUgb2Zmc2V0LlxuICAgIGNvbnN0IHNpYmxpbmdPZmZzZXQgPSB0aGlzLl9nZXRTaWJsaW5nT2Zmc2V0UHgoY3VycmVudEluZGV4LCBzaWJsaW5ncywgZGVsdGEpO1xuXG4gICAgLy8gU2F2ZSB0aGUgcHJldmlvdXMgb3JkZXIgb2YgdGhlIGl0ZW1zIGJlZm9yZSBtb3ZpbmcgdGhlIGl0ZW0gdG8gaXRzIG5ldyBpbmRleC5cbiAgICAvLyBXZSB1c2UgdGhpcyB0byBjaGVjayB3aGV0aGVyIGFuIGl0ZW0gaGFzIGJlZW4gbW92ZWQgYXMgYSByZXN1bHQgb2YgdGhlIHNvcnRpbmcuXG4gICAgY29uc3Qgb2xkT3JkZXIgPSBzaWJsaW5ncy5zbGljZSgpO1xuXG4gICAgLy8gU2h1ZmZsZSB0aGUgYXJyYXkgaW4gcGxhY2UuXG4gICAgbW92ZUl0ZW1JbkFycmF5KHNpYmxpbmdzLCBjdXJyZW50SW5kZXgsIG5ld0luZGV4KTtcblxuICAgIHNpYmxpbmdzLmZvckVhY2goKHNpYmxpbmcsIGluZGV4KSA9PiB7XG4gICAgICAvLyBEb24ndCBkbyBhbnl0aGluZyBpZiB0aGUgcG9zaXRpb24gaGFzbid0IGNoYW5nZWQuXG4gICAgICBpZiAob2xkT3JkZXJbaW5kZXhdID09PSBzaWJsaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3QgaXNEcmFnZ2VkSXRlbSA9IHNpYmxpbmcuZHJhZyA9PT0gaXRlbTtcbiAgICAgIGNvbnN0IG9mZnNldCA9IGlzRHJhZ2dlZEl0ZW0gPyBpdGVtT2Zmc2V0IDogc2libGluZ09mZnNldDtcbiAgICAgIGNvbnN0IGVsZW1lbnRUb09mZnNldCA9IGlzRHJhZ2dlZEl0ZW1cbiAgICAgICAgPyBpdGVtLmdldFBsYWNlaG9sZGVyRWxlbWVudCgpXG4gICAgICAgIDogc2libGluZy5kcmFnLmdldFJvb3RFbGVtZW50KCk7XG5cbiAgICAgIC8vIFVwZGF0ZSB0aGUgb2Zmc2V0IHRvIHJlZmxlY3QgdGhlIG5ldyBwb3NpdGlvbi5cbiAgICAgIHNpYmxpbmcub2Zmc2V0ICs9IG9mZnNldDtcblxuICAgICAgLy8gU2luY2Ugd2UncmUgbW92aW5nIHRoZSBpdGVtcyB3aXRoIGEgYHRyYW5zZm9ybWAsIHdlIG5lZWQgdG8gYWRqdXN0IHRoZWlyIGNhY2hlZFxuICAgICAgLy8gY2xpZW50IHJlY3RzIHRvIHJlZmxlY3QgdGhlaXIgbmV3IHBvc2l0aW9uLCBhcyB3ZWxsIGFzIHN3YXAgdGhlaXIgcG9zaXRpb25zIGluIHRoZSBjYWNoZS5cbiAgICAgIC8vIE5vdGUgdGhhdCB3ZSBzaG91bGRuJ3QgdXNlIGBnZXRCb3VuZGluZ0NsaWVudFJlY3RgIGhlcmUgdG8gdXBkYXRlIHRoZSBjYWNoZSwgYmVjYXVzZSB0aGVcbiAgICAgIC8vIGVsZW1lbnRzIG1heSBiZSBtaWQtYW5pbWF0aW9uIHdoaWNoIHdpbGwgZ2l2ZSB1cyBhIHdyb25nIHJlc3VsdC5cbiAgICAgIGlmIChpc0hvcml6b250YWwpIHtcbiAgICAgICAgLy8gUm91bmQgdGhlIHRyYW5zZm9ybXMgc2luY2Ugc29tZSBicm93c2VycyB3aWxsXG4gICAgICAgIC8vIGJsdXIgdGhlIGVsZW1lbnRzLCBmb3Igc3ViLXBpeGVsIHRyYW5zZm9ybXMuXG4gICAgICAgIGVsZW1lbnRUb09mZnNldC5zdHlsZS50cmFuc2Zvcm0gPSBjb21iaW5lVHJhbnNmb3JtcyhcbiAgICAgICAgICBgdHJhbnNsYXRlM2QoJHtNYXRoLnJvdW5kKHNpYmxpbmcub2Zmc2V0KX1weCwgMCwgMClgLFxuICAgICAgICAgIHNpYmxpbmcuaW5pdGlhbFRyYW5zZm9ybSxcbiAgICAgICAgKTtcbiAgICAgICAgYWRqdXN0RG9tUmVjdChzaWJsaW5nLmNsaWVudFJlY3QsIDAsIG9mZnNldCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBlbGVtZW50VG9PZmZzZXQuc3R5bGUudHJhbnNmb3JtID0gY29tYmluZVRyYW5zZm9ybXMoXG4gICAgICAgICAgYHRyYW5zbGF0ZTNkKDAsICR7TWF0aC5yb3VuZChzaWJsaW5nLm9mZnNldCl9cHgsIDApYCxcbiAgICAgICAgICBzaWJsaW5nLmluaXRpYWxUcmFuc2Zvcm0sXG4gICAgICAgICk7XG4gICAgICAgIGFkanVzdERvbVJlY3Qoc2libGluZy5jbGllbnRSZWN0LCBvZmZzZXQsIDApO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gTm90ZSB0aGF0IGl0J3MgaW1wb3J0YW50IHRoYXQgd2UgZG8gdGhpcyBhZnRlciB0aGUgY2xpZW50IHJlY3RzIGhhdmUgYmVlbiBhZGp1c3RlZC5cbiAgICB0aGlzLl9wcmV2aW91c1N3YXAub3ZlcmxhcHMgPSBpc0luc2lkZUNsaWVudFJlY3QobmV3UG9zaXRpb24sIHBvaW50ZXJYLCBwb2ludGVyWSk7XG4gICAgdGhpcy5fcHJldmlvdXNTd2FwLmRyYWcgPSBzaWJsaW5nQXROZXdQb3NpdGlvbi5kcmFnO1xuICAgIHRoaXMuX3ByZXZpb3VzU3dhcC5kZWx0YSA9IGlzSG9yaXpvbnRhbCA/IHBvaW50ZXJEZWx0YS54IDogcG9pbnRlckRlbHRhLnk7XG5cbiAgICByZXR1cm4ge3ByZXZpb3VzSW5kZXg6IGN1cnJlbnRJbmRleCwgY3VycmVudEluZGV4OiBuZXdJbmRleH07XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gYW4gaXRlbSBpcyBiZWluZyBtb3ZlZCBpbnRvIHRoZSBjb250YWluZXIuXG4gICAqIEBwYXJhbSBpdGVtIEl0ZW0gdGhhdCB3YXMgbW92ZWQgaW50byB0aGUgY29udGFpbmVyLlxuICAgKiBAcGFyYW0gcG9pbnRlclggUG9zaXRpb24gb2YgdGhlIGl0ZW0gYWxvbmcgdGhlIFggYXhpcy5cbiAgICogQHBhcmFtIHBvaW50ZXJZIFBvc2l0aW9uIG9mIHRoZSBpdGVtIGFsb25nIHRoZSBZIGF4aXMuXG4gICAqIEBwYXJhbSBpbmRleCBJbmRleCBhdCB3aGljaCB0aGUgaXRlbSBlbnRlcmVkLiBJZiBvbWl0dGVkLCB0aGUgY29udGFpbmVyIHdpbGwgdHJ5IHRvIGZpZ3VyZSBpdFxuICAgKiAgIG91dCBhdXRvbWF0aWNhbGx5LlxuICAgKi9cbiAgZW50ZXIoaXRlbTogVCwgcG9pbnRlclg6IG51bWJlciwgcG9pbnRlclk6IG51bWJlciwgaW5kZXg/OiBudW1iZXIpOiB2b2lkIHtcbiAgICBjb25zdCBuZXdJbmRleCA9XG4gICAgICBpbmRleCA9PSBudWxsIHx8IGluZGV4IDwgMFxuICAgICAgICA/IC8vIFdlIHVzZSB0aGUgY29vcmRpbmF0ZXMgb2Ygd2hlcmUgdGhlIGl0ZW0gZW50ZXJlZCB0aGUgZHJvcFxuICAgICAgICAgIC8vIHpvbmUgdG8gZmlndXJlIG91dCBhdCB3aGljaCBpbmRleCBpdCBzaG91bGQgYmUgaW5zZXJ0ZWQuXG4gICAgICAgICAgdGhpcy5fZ2V0SXRlbUluZGV4RnJvbVBvaW50ZXJQb3NpdGlvbihpdGVtLCBwb2ludGVyWCwgcG9pbnRlclkpXG4gICAgICAgIDogaW5kZXg7XG5cbiAgICBjb25zdCBhY3RpdmVEcmFnZ2FibGVzID0gdGhpcy5fYWN0aXZlRHJhZ2dhYmxlcztcbiAgICBjb25zdCBjdXJyZW50SW5kZXggPSBhY3RpdmVEcmFnZ2FibGVzLmluZGV4T2YoaXRlbSk7XG4gICAgY29uc3QgcGxhY2Vob2xkZXIgPSBpdGVtLmdldFBsYWNlaG9sZGVyRWxlbWVudCgpO1xuICAgIGxldCBuZXdQb3NpdGlvblJlZmVyZW5jZTogVCB8IHVuZGVmaW5lZCA9IGFjdGl2ZURyYWdnYWJsZXNbbmV3SW5kZXhdO1xuXG4gICAgLy8gSWYgdGhlIGl0ZW0gYXQgdGhlIG5ldyBwb3NpdGlvbiBpcyB0aGUgc2FtZSBhcyB0aGUgaXRlbSB0aGF0IGlzIGJlaW5nIGRyYWdnZWQsXG4gICAgLy8gaXQgbWVhbnMgdGhhdCB3ZSdyZSB0cnlpbmcgdG8gcmVzdG9yZSB0aGUgaXRlbSB0byBpdHMgaW5pdGlhbCBwb3NpdGlvbi4gSW4gdGhpc1xuICAgIC8vIGNhc2Ugd2Ugc2hvdWxkIHVzZSB0aGUgbmV4dCBpdGVtIGZyb20gdGhlIGxpc3QgYXMgdGhlIHJlZmVyZW5jZS5cbiAgICBpZiAobmV3UG9zaXRpb25SZWZlcmVuY2UgPT09IGl0ZW0pIHtcbiAgICAgIG5ld1Bvc2l0aW9uUmVmZXJlbmNlID0gYWN0aXZlRHJhZ2dhYmxlc1tuZXdJbmRleCArIDFdO1xuICAgIH1cblxuICAgIC8vIElmIHdlIGRpZG4ndCBmaW5kIGEgbmV3IHBvc2l0aW9uIHJlZmVyZW5jZSwgaXQgbWVhbnMgdGhhdCBlaXRoZXIgdGhlIGl0ZW0gZGlkbid0IHN0YXJ0IG9mZlxuICAgIC8vIGluIHRoaXMgY29udGFpbmVyLCBvciB0aGF0IHRoZSBpdGVtIHJlcXVlc3RlZCB0byBiZSBpbnNlcnRlZCBhdCB0aGUgZW5kIG9mIHRoZSBsaXN0LlxuICAgIGlmIChcbiAgICAgICFuZXdQb3NpdGlvblJlZmVyZW5jZSAmJlxuICAgICAgKG5ld0luZGV4ID09IG51bGwgfHwgbmV3SW5kZXggPT09IC0xIHx8IG5ld0luZGV4IDwgYWN0aXZlRHJhZ2dhYmxlcy5sZW5ndGggLSAxKSAmJlxuICAgICAgdGhpcy5fc2hvdWxkRW50ZXJBc0ZpcnN0Q2hpbGQocG9pbnRlclgsIHBvaW50ZXJZKVxuICAgICkge1xuICAgICAgbmV3UG9zaXRpb25SZWZlcmVuY2UgPSBhY3RpdmVEcmFnZ2FibGVzWzBdO1xuICAgIH1cblxuICAgIC8vIFNpbmNlIHRoZSBpdGVtIG1heSBiZSBpbiB0aGUgYGFjdGl2ZURyYWdnYWJsZXNgIGFscmVhZHkgKGUuZy4gaWYgdGhlIHVzZXIgZHJhZ2dlZCBpdFxuICAgIC8vIGludG8gYW5vdGhlciBjb250YWluZXIgYW5kIGJhY2sgYWdhaW4pLCB3ZSBoYXZlIHRvIGVuc3VyZSB0aGF0IGl0IGlzbid0IGR1cGxpY2F0ZWQuXG4gICAgaWYgKGN1cnJlbnRJbmRleCA+IC0xKSB7XG4gICAgICBhY3RpdmVEcmFnZ2FibGVzLnNwbGljZShjdXJyZW50SW5kZXgsIDEpO1xuICAgIH1cblxuICAgIC8vIERvbid0IHVzZSBpdGVtcyB0aGF0IGFyZSBiZWluZyBkcmFnZ2VkIGFzIGEgcmVmZXJlbmNlLCBiZWNhdXNlXG4gICAgLy8gdGhlaXIgZWxlbWVudCBoYXMgYmVlbiBtb3ZlZCBkb3duIHRvIHRoZSBib3R0b20gb2YgdGhlIGJvZHkuXG4gICAgaWYgKG5ld1Bvc2l0aW9uUmVmZXJlbmNlICYmICF0aGlzLl9kcmFnRHJvcFJlZ2lzdHJ5LmlzRHJhZ2dpbmcobmV3UG9zaXRpb25SZWZlcmVuY2UpKSB7XG4gICAgICBjb25zdCBlbGVtZW50ID0gbmV3UG9zaXRpb25SZWZlcmVuY2UuZ2V0Um9vdEVsZW1lbnQoKTtcbiAgICAgIGVsZW1lbnQucGFyZW50RWxlbWVudCEuaW5zZXJ0QmVmb3JlKHBsYWNlaG9sZGVyLCBlbGVtZW50KTtcbiAgICAgIGFjdGl2ZURyYWdnYWJsZXMuc3BsaWNlKG5ld0luZGV4LCAwLCBpdGVtKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29lcmNlRWxlbWVudCh0aGlzLl9lbGVtZW50KS5hcHBlbmRDaGlsZChwbGFjZWhvbGRlcik7XG4gICAgICBhY3RpdmVEcmFnZ2FibGVzLnB1c2goaXRlbSk7XG4gICAgfVxuXG4gICAgLy8gVGhlIHRyYW5zZm9ybSBuZWVkcyB0byBiZSBjbGVhcmVkIHNvIGl0IGRvZXNuJ3QgdGhyb3cgb2ZmIHRoZSBtZWFzdXJlbWVudHMuXG4gICAgcGxhY2Vob2xkZXIuc3R5bGUudHJhbnNmb3JtID0gJyc7XG5cbiAgICAvLyBOb3RlIHRoYXQgdXN1YWxseSBgc3RhcnRgIGlzIGNhbGxlZCB0b2dldGhlciB3aXRoIGBlbnRlcmAgd2hlbiBhbiBpdGVtIGdvZXMgaW50byBhIG5ld1xuICAgIC8vIGNvbnRhaW5lci4gVGhpcyB3aWxsIGNhY2hlIGl0ZW0gcG9zaXRpb25zLCBidXQgd2UgbmVlZCB0byByZWZyZXNoIHRoZW0gc2luY2UgdGhlIGFtb3VudFxuICAgIC8vIG9mIGl0ZW1zIGhhcyBjaGFuZ2VkLlxuICAgIHRoaXMuX2NhY2hlSXRlbVBvc2l0aW9ucygpO1xuICB9XG5cbiAgLyoqIFNldHMgdGhlIGl0ZW1zIHRoYXQgYXJlIGN1cnJlbnRseSBwYXJ0IG9mIHRoZSBsaXN0LiAqL1xuICB3aXRoSXRlbXMoaXRlbXM6IHJlYWRvbmx5IFRbXSk6IHZvaWQge1xuICAgIHRoaXMuX2FjdGl2ZURyYWdnYWJsZXMgPSBpdGVtcy5zbGljZSgpO1xuICAgIHRoaXMuX2NhY2hlSXRlbVBvc2l0aW9ucygpO1xuICB9XG5cbiAgLyoqIEFzc2lnbnMgYSBzb3J0IHByZWRpY2F0ZSB0byB0aGUgc3RyYXRlZ3kuICovXG4gIHdpdGhTb3J0UHJlZGljYXRlKHByZWRpY2F0ZTogU29ydFByZWRpY2F0ZTxUPik6IHZvaWQge1xuICAgIHRoaXMuX3NvcnRQcmVkaWNhdGUgPSBwcmVkaWNhdGU7XG4gIH1cblxuICAvKiogUmVzZXRzIHRoZSBzdHJhdGVneSB0byBpdHMgaW5pdGlhbCBzdGF0ZSBiZWZvcmUgZHJhZ2dpbmcgd2FzIHN0YXJ0ZWQuICovXG4gIHJlc2V0KCkge1xuICAgIC8vIFRPRE8oY3Jpc2JldG8pOiBtYXkgaGF2ZSB0byB3YWl0IGZvciB0aGUgYW5pbWF0aW9ucyB0byBmaW5pc2guXG4gICAgdGhpcy5fYWN0aXZlRHJhZ2dhYmxlcy5mb3JFYWNoKGl0ZW0gPT4ge1xuICAgICAgY29uc3Qgcm9vdEVsZW1lbnQgPSBpdGVtLmdldFJvb3RFbGVtZW50KCk7XG5cbiAgICAgIGlmIChyb290RWxlbWVudCkge1xuICAgICAgICBjb25zdCBpbml0aWFsVHJhbnNmb3JtID0gdGhpcy5faXRlbVBvc2l0aW9ucy5maW5kKHAgPT4gcC5kcmFnID09PSBpdGVtKT8uaW5pdGlhbFRyYW5zZm9ybTtcbiAgICAgICAgcm9vdEVsZW1lbnQuc3R5bGUudHJhbnNmb3JtID0gaW5pdGlhbFRyYW5zZm9ybSB8fCAnJztcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMuX2l0ZW1Qb3NpdGlvbnMgPSBbXTtcbiAgICB0aGlzLl9hY3RpdmVEcmFnZ2FibGVzID0gW107XG4gICAgdGhpcy5fcHJldmlvdXNTd2FwLmRyYWcgPSBudWxsO1xuICAgIHRoaXMuX3ByZXZpb3VzU3dhcC5kZWx0YSA9IDA7XG4gICAgdGhpcy5fcHJldmlvdXNTd2FwLm92ZXJsYXBzID0gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyBhIHNuYXBzaG90IG9mIGl0ZW1zIGN1cnJlbnRseSBpbiB0aGUgbGlzdC5cbiAgICogQ2FuIGluY2x1ZGUgaXRlbXMgdGhhdCB3ZSBkcmFnZ2VkIGluIGZyb20gYW5vdGhlciBsaXN0LlxuICAgKi9cbiAgZ2V0QWN0aXZlSXRlbXNTbmFwc2hvdCgpOiByZWFkb25seSBUW10ge1xuICAgIHJldHVybiB0aGlzLl9hY3RpdmVEcmFnZ2FibGVzO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIGluZGV4IG9mIGEgc3BlY2lmaWMgaXRlbS4gKi9cbiAgZ2V0SXRlbUluZGV4KGl0ZW06IFQpOiBudW1iZXIge1xuICAgIC8vIEl0ZW1zIGFyZSBzb3J0ZWQgYWx3YXlzIGJ5IHRvcC9sZWZ0IGluIHRoZSBjYWNoZSwgaG93ZXZlciB0aGV5IGZsb3cgZGlmZmVyZW50bHkgaW4gUlRMLlxuICAgIC8vIFRoZSByZXN0IG9mIHRoZSBsb2dpYyBzdGlsbCBzdGFuZHMgbm8gbWF0dGVyIHdoYXQgb3JpZW50YXRpb24gd2UncmUgaW4sIGhvd2V2ZXJcbiAgICAvLyB3ZSBuZWVkIHRvIGludmVydCB0aGUgYXJyYXkgd2hlbiBkZXRlcm1pbmluZyB0aGUgaW5kZXguXG4gICAgY29uc3QgaXRlbXMgPVxuICAgICAgdGhpcy5vcmllbnRhdGlvbiA9PT0gJ2hvcml6b250YWwnICYmIHRoaXMuZGlyZWN0aW9uID09PSAncnRsJ1xuICAgICAgICA/IHRoaXMuX2l0ZW1Qb3NpdGlvbnMuc2xpY2UoKS5yZXZlcnNlKClcbiAgICAgICAgOiB0aGlzLl9pdGVtUG9zaXRpb25zO1xuXG4gICAgcmV0dXJuIGl0ZW1zLmZpbmRJbmRleChjdXJyZW50SXRlbSA9PiBjdXJyZW50SXRlbS5kcmFnID09PSBpdGVtKTtcbiAgfVxuXG4gIC8qKiBVc2VkIHRvIG5vdGlmeSB0aGUgc3RyYXRlZ3kgdGhhdCB0aGUgc2Nyb2xsIHBvc2l0aW9uIGhhcyBjaGFuZ2VkLiAqL1xuICB1cGRhdGVPblNjcm9sbCh0b3BEaWZmZXJlbmNlOiBudW1iZXIsIGxlZnREaWZmZXJlbmNlOiBudW1iZXIpIHtcbiAgICAvLyBTaW5jZSB3ZSBrbm93IHRoZSBhbW91bnQgdGhhdCB0aGUgdXNlciBoYXMgc2Nyb2xsZWQgd2UgY2FuIHNoaWZ0IGFsbCBvZiB0aGVcbiAgICAvLyBjbGllbnQgcmVjdGFuZ2xlcyBvdXJzZWx2ZXMuIFRoaXMgaXMgY2hlYXBlciB0aGFuIHJlLW1lYXN1cmluZyBldmVyeXRoaW5nIGFuZFxuICAgIC8vIHdlIGNhbiBhdm9pZCBpbmNvbnNpc3RlbnQgYmVoYXZpb3Igd2hlcmUgd2UgbWlnaHQgYmUgbWVhc3VyaW5nIHRoZSBlbGVtZW50IGJlZm9yZVxuICAgIC8vIGl0cyBwb3NpdGlvbiBoYXMgY2hhbmdlZC5cbiAgICB0aGlzLl9pdGVtUG9zaXRpb25zLmZvckVhY2goKHtjbGllbnRSZWN0fSkgPT4ge1xuICAgICAgYWRqdXN0RG9tUmVjdChjbGllbnRSZWN0LCB0b3BEaWZmZXJlbmNlLCBsZWZ0RGlmZmVyZW5jZSk7XG4gICAgfSk7XG5cbiAgICAvLyBXZSBuZWVkIHR3byBsb29wcyBmb3IgdGhpcywgYmVjYXVzZSB3ZSB3YW50IGFsbCBvZiB0aGUgY2FjaGVkXG4gICAgLy8gcG9zaXRpb25zIHRvIGJlIHVwLXRvLWRhdGUgYmVmb3JlIHdlIHJlLXNvcnQgdGhlIGl0ZW0uXG4gICAgdGhpcy5faXRlbVBvc2l0aW9ucy5mb3JFYWNoKCh7ZHJhZ30pID0+IHtcbiAgICAgIGlmICh0aGlzLl9kcmFnRHJvcFJlZ2lzdHJ5LmlzRHJhZ2dpbmcoZHJhZykpIHtcbiAgICAgICAgLy8gV2UgbmVlZCB0byByZS1zb3J0IHRoZSBpdGVtIG1hbnVhbGx5LCBiZWNhdXNlIHRoZSBwb2ludGVyIG1vdmVcbiAgICAgICAgLy8gZXZlbnRzIHdvbid0IGJlIGRpc3BhdGNoZWQgd2hpbGUgdGhlIHVzZXIgaXMgc2Nyb2xsaW5nLlxuICAgICAgICBkcmFnLl9zb3J0RnJvbUxhc3RQb2ludGVyUG9zaXRpb24oKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBSZWZyZXNoZXMgdGhlIHBvc2l0aW9uIGNhY2hlIG9mIHRoZSBpdGVtcyBhbmQgc2libGluZyBjb250YWluZXJzLiAqL1xuICBwcml2YXRlIF9jYWNoZUl0ZW1Qb3NpdGlvbnMoKSB7XG4gICAgY29uc3QgaXNIb3Jpem9udGFsID0gdGhpcy5vcmllbnRhdGlvbiA9PT0gJ2hvcml6b250YWwnO1xuXG4gICAgdGhpcy5faXRlbVBvc2l0aW9ucyA9IHRoaXMuX2FjdGl2ZURyYWdnYWJsZXNcbiAgICAgIC5tYXAoZHJhZyA9PiB7XG4gICAgICAgIGNvbnN0IGVsZW1lbnRUb01lYXN1cmUgPSBkcmFnLmdldFZpc2libGVFbGVtZW50KCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgZHJhZyxcbiAgICAgICAgICBvZmZzZXQ6IDAsXG4gICAgICAgICAgaW5pdGlhbFRyYW5zZm9ybTogZWxlbWVudFRvTWVhc3VyZS5zdHlsZS50cmFuc2Zvcm0gfHwgJycsXG4gICAgICAgICAgY2xpZW50UmVjdDogZ2V0TXV0YWJsZUNsaWVudFJlY3QoZWxlbWVudFRvTWVhc3VyZSksXG4gICAgICAgIH07XG4gICAgICB9KVxuICAgICAgLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgICAgcmV0dXJuIGlzSG9yaXpvbnRhbFxuICAgICAgICAgID8gYS5jbGllbnRSZWN0LmxlZnQgLSBiLmNsaWVudFJlY3QubGVmdFxuICAgICAgICAgIDogYS5jbGllbnRSZWN0LnRvcCAtIGIuY2xpZW50UmVjdC50b3A7XG4gICAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBvZmZzZXQgaW4gcGl4ZWxzIGJ5IHdoaWNoIHRoZSBpdGVtIHRoYXQgaXMgYmVpbmcgZHJhZ2dlZCBzaG91bGQgYmUgbW92ZWQuXG4gICAqIEBwYXJhbSBjdXJyZW50UG9zaXRpb24gQ3VycmVudCBwb3NpdGlvbiBvZiB0aGUgaXRlbS5cbiAgICogQHBhcmFtIG5ld1Bvc2l0aW9uIFBvc2l0aW9uIG9mIHRoZSBpdGVtIHdoZXJlIHRoZSBjdXJyZW50IGl0ZW0gc2hvdWxkIGJlIG1vdmVkLlxuICAgKiBAcGFyYW0gZGVsdGEgRGlyZWN0aW9uIGluIHdoaWNoIHRoZSB1c2VyIGlzIG1vdmluZy5cbiAgICovXG4gIHByaXZhdGUgX2dldEl0ZW1PZmZzZXRQeChjdXJyZW50UG9zaXRpb246IERPTVJlY3QsIG5ld1Bvc2l0aW9uOiBET01SZWN0LCBkZWx0YTogMSB8IC0xKSB7XG4gICAgY29uc3QgaXNIb3Jpem9udGFsID0gdGhpcy5vcmllbnRhdGlvbiA9PT0gJ2hvcml6b250YWwnO1xuICAgIGxldCBpdGVtT2Zmc2V0ID0gaXNIb3Jpem9udGFsXG4gICAgICA/IG5ld1Bvc2l0aW9uLmxlZnQgLSBjdXJyZW50UG9zaXRpb24ubGVmdFxuICAgICAgOiBuZXdQb3NpdGlvbi50b3AgLSBjdXJyZW50UG9zaXRpb24udG9wO1xuXG4gICAgLy8gQWNjb3VudCBmb3IgZGlmZmVyZW5jZXMgaW4gdGhlIGl0ZW0gd2lkdGgvaGVpZ2h0LlxuICAgIGlmIChkZWx0YSA9PT0gLTEpIHtcbiAgICAgIGl0ZW1PZmZzZXQgKz0gaXNIb3Jpem9udGFsXG4gICAgICAgID8gbmV3UG9zaXRpb24ud2lkdGggLSBjdXJyZW50UG9zaXRpb24ud2lkdGhcbiAgICAgICAgOiBuZXdQb3NpdGlvbi5oZWlnaHQgLSBjdXJyZW50UG9zaXRpb24uaGVpZ2h0O1xuICAgIH1cblxuICAgIHJldHVybiBpdGVtT2Zmc2V0O1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIG9mZnNldCBpbiBwaXhlbHMgYnkgd2hpY2ggdGhlIGl0ZW1zIHRoYXQgYXJlbid0IGJlaW5nIGRyYWdnZWQgc2hvdWxkIGJlIG1vdmVkLlxuICAgKiBAcGFyYW0gY3VycmVudEluZGV4IEluZGV4IG9mIHRoZSBpdGVtIGN1cnJlbnRseSBiZWluZyBkcmFnZ2VkLlxuICAgKiBAcGFyYW0gc2libGluZ3MgQWxsIG9mIHRoZSBpdGVtcyBpbiB0aGUgbGlzdC5cbiAgICogQHBhcmFtIGRlbHRhIERpcmVjdGlvbiBpbiB3aGljaCB0aGUgdXNlciBpcyBtb3ZpbmcuXG4gICAqL1xuICBwcml2YXRlIF9nZXRTaWJsaW5nT2Zmc2V0UHgoXG4gICAgY3VycmVudEluZGV4OiBudW1iZXIsXG4gICAgc2libGluZ3M6IENhY2hlZEl0ZW1Qb3NpdGlvbjxUPltdLFxuICAgIGRlbHRhOiAxIHwgLTEsXG4gICkge1xuICAgIGNvbnN0IGlzSG9yaXpvbnRhbCA9IHRoaXMub3JpZW50YXRpb24gPT09ICdob3Jpem9udGFsJztcbiAgICBjb25zdCBjdXJyZW50UG9zaXRpb24gPSBzaWJsaW5nc1tjdXJyZW50SW5kZXhdLmNsaWVudFJlY3Q7XG4gICAgY29uc3QgaW1tZWRpYXRlU2libGluZyA9IHNpYmxpbmdzW2N1cnJlbnRJbmRleCArIGRlbHRhICogLTFdO1xuICAgIGxldCBzaWJsaW5nT2Zmc2V0ID0gY3VycmVudFBvc2l0aW9uW2lzSG9yaXpvbnRhbCA/ICd3aWR0aCcgOiAnaGVpZ2h0J10gKiBkZWx0YTtcblxuICAgIGlmIChpbW1lZGlhdGVTaWJsaW5nKSB7XG4gICAgICBjb25zdCBzdGFydCA9IGlzSG9yaXpvbnRhbCA/ICdsZWZ0JyA6ICd0b3AnO1xuICAgICAgY29uc3QgZW5kID0gaXNIb3Jpem9udGFsID8gJ3JpZ2h0JyA6ICdib3R0b20nO1xuXG4gICAgICAvLyBHZXQgdGhlIHNwYWNpbmcgYmV0d2VlbiB0aGUgc3RhcnQgb2YgdGhlIGN1cnJlbnQgaXRlbSBhbmQgdGhlIGVuZCBvZiB0aGUgb25lIGltbWVkaWF0ZWx5XG4gICAgICAvLyBhZnRlciBpdCBpbiB0aGUgZGlyZWN0aW9uIGluIHdoaWNoIHRoZSB1c2VyIGlzIGRyYWdnaW5nLCBvciB2aWNlIHZlcnNhLiBXZSBhZGQgaXQgdG8gdGhlXG4gICAgICAvLyBvZmZzZXQgaW4gb3JkZXIgdG8gcHVzaCB0aGUgZWxlbWVudCB0byB3aGVyZSBpdCB3aWxsIGJlIHdoZW4gaXQncyBpbmxpbmUgYW5kIGlzIGluZmx1ZW5jZWRcbiAgICAgIC8vIGJ5IHRoZSBgbWFyZ2luYCBvZiBpdHMgc2libGluZ3MuXG4gICAgICBpZiAoZGVsdGEgPT09IC0xKSB7XG4gICAgICAgIHNpYmxpbmdPZmZzZXQgLT0gaW1tZWRpYXRlU2libGluZy5jbGllbnRSZWN0W3N0YXJ0XSAtIGN1cnJlbnRQb3NpdGlvbltlbmRdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2libGluZ09mZnNldCArPSBjdXJyZW50UG9zaXRpb25bc3RhcnRdIC0gaW1tZWRpYXRlU2libGluZy5jbGllbnRSZWN0W2VuZF07XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHNpYmxpbmdPZmZzZXQ7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIGlmIHBvaW50ZXIgaXMgZW50ZXJpbmcgaW4gdGhlIGZpcnN0IHBvc2l0aW9uXG4gICAqIEBwYXJhbSBwb2ludGVyWCBQb3NpdGlvbiBvZiB0aGUgdXNlcidzIHBvaW50ZXIgYWxvbmcgdGhlIFggYXhpcy5cbiAgICogQHBhcmFtIHBvaW50ZXJZIFBvc2l0aW9uIG9mIHRoZSB1c2VyJ3MgcG9pbnRlciBhbG9uZyB0aGUgWSBheGlzLlxuICAgKi9cbiAgcHJpdmF0ZSBfc2hvdWxkRW50ZXJBc0ZpcnN0Q2hpbGQocG9pbnRlclg6IG51bWJlciwgcG9pbnRlclk6IG51bWJlcikge1xuICAgIGlmICghdGhpcy5fYWN0aXZlRHJhZ2dhYmxlcy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBjb25zdCBpdGVtUG9zaXRpb25zID0gdGhpcy5faXRlbVBvc2l0aW9ucztcbiAgICBjb25zdCBpc0hvcml6b250YWwgPSB0aGlzLm9yaWVudGF0aW9uID09PSAnaG9yaXpvbnRhbCc7XG5cbiAgICAvLyBgaXRlbVBvc2l0aW9uc2AgYXJlIHNvcnRlZCBieSBwb3NpdGlvbiB3aGlsZSBgYWN0aXZlRHJhZ2dhYmxlc2AgYXJlIHNvcnRlZCBieSBjaGlsZCBpbmRleFxuICAgIC8vIGNoZWNrIGlmIGNvbnRhaW5lciBpcyB1c2luZyBzb21lIHNvcnQgb2YgXCJyZXZlcnNlXCIgb3JkZXJpbmcgKGVnOiBmbGV4LWRpcmVjdGlvbjogcm93LXJldmVyc2UpXG4gICAgY29uc3QgcmV2ZXJzZWQgPSBpdGVtUG9zaXRpb25zWzBdLmRyYWcgIT09IHRoaXMuX2FjdGl2ZURyYWdnYWJsZXNbMF07XG4gICAgaWYgKHJldmVyc2VkKSB7XG4gICAgICBjb25zdCBsYXN0SXRlbVJlY3QgPSBpdGVtUG9zaXRpb25zW2l0ZW1Qb3NpdGlvbnMubGVuZ3RoIC0gMV0uY2xpZW50UmVjdDtcbiAgICAgIHJldHVybiBpc0hvcml6b250YWwgPyBwb2ludGVyWCA+PSBsYXN0SXRlbVJlY3QucmlnaHQgOiBwb2ludGVyWSA+PSBsYXN0SXRlbVJlY3QuYm90dG9tO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBmaXJzdEl0ZW1SZWN0ID0gaXRlbVBvc2l0aW9uc1swXS5jbGllbnRSZWN0O1xuICAgICAgcmV0dXJuIGlzSG9yaXpvbnRhbCA/IHBvaW50ZXJYIDw9IGZpcnN0SXRlbVJlY3QubGVmdCA6IHBvaW50ZXJZIDw9IGZpcnN0SXRlbVJlY3QudG9wO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBpbmRleCBvZiBhbiBpdGVtIGluIHRoZSBkcm9wIGNvbnRhaW5lciwgYmFzZWQgb24gdGhlIHBvc2l0aW9uIG9mIHRoZSB1c2VyJ3MgcG9pbnRlci5cbiAgICogQHBhcmFtIGl0ZW0gSXRlbSB0aGF0IGlzIGJlaW5nIHNvcnRlZC5cbiAgICogQHBhcmFtIHBvaW50ZXJYIFBvc2l0aW9uIG9mIHRoZSB1c2VyJ3MgcG9pbnRlciBhbG9uZyB0aGUgWCBheGlzLlxuICAgKiBAcGFyYW0gcG9pbnRlclkgUG9zaXRpb24gb2YgdGhlIHVzZXIncyBwb2ludGVyIGFsb25nIHRoZSBZIGF4aXMuXG4gICAqIEBwYXJhbSBkZWx0YSBEaXJlY3Rpb24gaW4gd2hpY2ggdGhlIHVzZXIgaXMgbW92aW5nIHRoZWlyIHBvaW50ZXIuXG4gICAqL1xuICBwcml2YXRlIF9nZXRJdGVtSW5kZXhGcm9tUG9pbnRlclBvc2l0aW9uKFxuICAgIGl0ZW06IFQsXG4gICAgcG9pbnRlclg6IG51bWJlcixcbiAgICBwb2ludGVyWTogbnVtYmVyLFxuICAgIGRlbHRhPzoge3g6IG51bWJlcjsgeTogbnVtYmVyfSxcbiAgKTogbnVtYmVyIHtcbiAgICBjb25zdCBpc0hvcml6b250YWwgPSB0aGlzLm9yaWVudGF0aW9uID09PSAnaG9yaXpvbnRhbCc7XG4gICAgY29uc3QgaW5kZXggPSB0aGlzLl9pdGVtUG9zaXRpb25zLmZpbmRJbmRleCgoe2RyYWcsIGNsaWVudFJlY3R9KSA9PiB7XG4gICAgICAvLyBTa2lwIHRoZSBpdGVtIGl0c2VsZi5cbiAgICAgIGlmIChkcmFnID09PSBpdGVtKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgaWYgKGRlbHRhKSB7XG4gICAgICAgIGNvbnN0IGRpcmVjdGlvbiA9IGlzSG9yaXpvbnRhbCA/IGRlbHRhLnggOiBkZWx0YS55O1xuXG4gICAgICAgIC8vIElmIHRoZSB1c2VyIGlzIHN0aWxsIGhvdmVyaW5nIG92ZXIgdGhlIHNhbWUgaXRlbSBhcyBsYXN0IHRpbWUsIHRoZWlyIGN1cnNvciBoYXNuJ3QgbGVmdFxuICAgICAgICAvLyB0aGUgaXRlbSBhZnRlciB3ZSBtYWRlIHRoZSBzd2FwLCBhbmQgdGhleSBkaWRuJ3QgY2hhbmdlIHRoZSBkaXJlY3Rpb24gaW4gd2hpY2ggdGhleSdyZVxuICAgICAgICAvLyBkcmFnZ2luZywgd2UgZG9uJ3QgY29uc2lkZXIgaXQgYSBkaXJlY3Rpb24gc3dhcC5cbiAgICAgICAgaWYgKFxuICAgICAgICAgIGRyYWcgPT09IHRoaXMuX3ByZXZpb3VzU3dhcC5kcmFnICYmXG4gICAgICAgICAgdGhpcy5fcHJldmlvdXNTd2FwLm92ZXJsYXBzICYmXG4gICAgICAgICAgZGlyZWN0aW9uID09PSB0aGlzLl9wcmV2aW91c1N3YXAuZGVsdGFcbiAgICAgICAgKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBpc0hvcml6b250YWxcbiAgICAgICAgPyAvLyBSb3VuZCB0aGVzZSBkb3duIHNpbmNlIG1vc3QgYnJvd3NlcnMgcmVwb3J0IGNsaWVudCByZWN0cyB3aXRoXG4gICAgICAgICAgLy8gc3ViLXBpeGVsIHByZWNpc2lvbiwgd2hlcmVhcyB0aGUgcG9pbnRlciBjb29yZGluYXRlcyBhcmUgcm91bmRlZCB0byBwaXhlbHMuXG4gICAgICAgICAgcG9pbnRlclggPj0gTWF0aC5mbG9vcihjbGllbnRSZWN0LmxlZnQpICYmIHBvaW50ZXJYIDwgTWF0aC5mbG9vcihjbGllbnRSZWN0LnJpZ2h0KVxuICAgICAgICA6IHBvaW50ZXJZID49IE1hdGguZmxvb3IoY2xpZW50UmVjdC50b3ApICYmIHBvaW50ZXJZIDwgTWF0aC5mbG9vcihjbGllbnRSZWN0LmJvdHRvbSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gaW5kZXggPT09IC0xIHx8ICF0aGlzLl9zb3J0UHJlZGljYXRlKGluZGV4LCBpdGVtKSA/IC0xIDogaW5kZXg7XG4gIH1cbn1cbiJdfQ==