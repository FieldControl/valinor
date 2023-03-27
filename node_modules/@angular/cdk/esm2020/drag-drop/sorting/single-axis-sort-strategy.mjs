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
import { adjustClientRect, getMutableClientRect, isInsideClientRect } from '../dom/client-rect';
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
                adjustClientRect(sibling.clientRect, 0, offset);
            }
            else {
                elementToOffset.style.transform = combineTransforms(`translate3d(0, ${Math.round(sibling.offset)}px, 0)`, sibling.initialTransform);
                adjustClientRect(sibling.clientRect, offset, 0);
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
            adjustClientRect(clientRect, topDifference, leftDifference);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2luZ2xlLWF4aXMtc29ydC1zdHJhdGVneS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvZHJhZy1kcm9wL3NvcnRpbmcvc2luZ2xlLWF4aXMtc29ydC1zdHJhdGVneS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFJSCxPQUFPLEVBQUMsYUFBYSxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFFcEQsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUM5QyxPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUNqRCxPQUFPLEVBQUMsZ0JBQWdCLEVBQUUsb0JBQW9CLEVBQUUsa0JBQWtCLEVBQUMsTUFBTSxvQkFBb0IsQ0FBQztBQXNCOUY7Ozs7R0FJRztBQUNILE1BQU0sT0FBTyxzQkFBc0I7SUFzQmpDLFlBQ1UsUUFBK0MsRUFDL0MsaUJBQStDO1FBRC9DLGFBQVEsR0FBUixRQUFRLENBQXVDO1FBQy9DLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBOEI7UUFsQnpELHFFQUFxRTtRQUM3RCxtQkFBYyxHQUE0QixFQUFFLENBQUM7UUFTckQsK0NBQStDO1FBQy9DLGdCQUFXLEdBQThCLFVBQVUsQ0FBQztRQVVwRDs7OztXQUlHO1FBQ0ssa0JBQWEsR0FBRztZQUN0QixJQUFJLEVBQUUsSUFBZ0I7WUFDdEIsS0FBSyxFQUFFLENBQUM7WUFDUixRQUFRLEVBQUUsS0FBSztTQUNoQixDQUFDO0lBWEMsQ0FBQztJQWFKOzs7T0FHRztJQUNILEtBQUssQ0FBQyxLQUFtQjtRQUN2QixJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3hCLENBQUM7SUFFRDs7Ozs7O09BTUc7SUFDSCxJQUFJLENBQUMsSUFBTyxFQUFFLFFBQWdCLEVBQUUsUUFBZ0IsRUFBRSxZQUFvQztRQUNwRixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMs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Ii8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0RpcmVjdGlvbn0gZnJvbSAnQGFuZ3VsYXIvY2RrL2JpZGknO1xuaW1wb3J0IHtFbGVtZW50UmVmfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7Y29lcmNlRWxlbWVudH0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvZXJjaW9uJztcbmltcG9ydCB7RHJhZ0Ryb3BSZWdpc3RyeX0gZnJvbSAnLi4vZHJhZy1kcm9wLXJlZ2lzdHJ5JztcbmltcG9ydCB7bW92ZUl0ZW1JbkFycmF5fSBmcm9tICcuLi9kcmFnLXV0aWxzJztcbmltcG9ydCB7Y29tYmluZVRyYW5zZm9ybXN9IGZyb20gJy4uL2RvbS9zdHlsaW5nJztcbmltcG9ydCB7YWRqdXN0Q2xpZW50UmVjdCwgZ2V0TXV0YWJsZUNsaWVudFJlY3QsIGlzSW5zaWRlQ2xpZW50UmVjdH0gZnJvbSAnLi4vZG9tL2NsaWVudC1yZWN0JztcbmltcG9ydCB7XG4gIERyb3BMaXN0U29ydFN0cmF0ZWd5LFxuICBEcm9wTGlzdFNvcnRTdHJhdGVneUl0ZW0sXG4gIFNvcnRQcmVkaWNhdGUsXG59IGZyb20gJy4vZHJvcC1saXN0LXNvcnQtc3RyYXRlZ3knO1xuXG4vKipcbiAqIEVudHJ5IGluIHRoZSBwb3NpdGlvbiBjYWNoZSBmb3IgZHJhZ2dhYmxlIGl0ZW1zLlxuICogQGRvY3MtcHJpdmF0ZVxuICovXG5pbnRlcmZhY2UgQ2FjaGVkSXRlbVBvc2l0aW9uPFQ+IHtcbiAgLyoqIEluc3RhbmNlIG9mIHRoZSBkcmFnIGl0ZW0uICovXG4gIGRyYWc6IFQ7XG4gIC8qKiBEaW1lbnNpb25zIG9mIHRoZSBpdGVtLiAqL1xuICBjbGllbnRSZWN0OiBDbGllbnRSZWN0O1xuICAvKiogQW1vdW50IGJ5IHdoaWNoIHRoZSBpdGVtIGhhcyBiZWVuIG1vdmVkIHNpbmNlIGRyYWdnaW5nIHN0YXJ0ZWQuICovXG4gIG9mZnNldDogbnVtYmVyO1xuICAvKiogSW5saW5lIHRyYW5zZm9ybSB0aGF0IHRoZSBkcmFnIGl0ZW0gaGFkIHdoZW4gZHJhZ2dpbmcgc3RhcnRlZC4gKi9cbiAgaW5pdGlhbFRyYW5zZm9ybTogc3RyaW5nO1xufVxuXG4vKipcbiAqIFN0cmF0ZWd5IHRoYXQgb25seSBzdXBwb3J0cyBzb3J0aW5nIGFsb25nIGEgc2luZ2xlIGF4aXMuXG4gKiBJdGVtcyBhcmUgcmVvcmRlcmVkIHVzaW5nIENTUyB0cmFuc2Zvcm1zIHdoaWNoIGFsbG93cyBmb3Igc29ydGluZyB0byBiZSBhbmltYXRlZC5cbiAqIEBkb2NzLXByaXZhdGVcbiAqL1xuZXhwb3J0IGNsYXNzIFNpbmdsZUF4aXNTb3J0U3RyYXRlZ3k8VCBleHRlbmRzIERyb3BMaXN0U29ydFN0cmF0ZWd5SXRlbT5cbiAgaW1wbGVtZW50cyBEcm9wTGlzdFNvcnRTdHJhdGVneTxUPlxue1xuICAvKiogRnVuY3Rpb24gdXNlZCB0byBkZXRlcm1pbmUgaWYgYW4gaXRlbSBjYW4gYmUgc29ydGVkIGludG8gYSBzcGVjaWZpYyBpbmRleC4gKi9cbiAgcHJpdmF0ZSBfc29ydFByZWRpY2F0ZTogU29ydFByZWRpY2F0ZTxUPjtcblxuICAvKiogQ2FjaGUgb2YgdGhlIGRpbWVuc2lvbnMgb2YgYWxsIHRoZSBpdGVtcyBpbnNpZGUgdGhlIGNvbnRhaW5lci4gKi9cbiAgcHJpdmF0ZSBfaXRlbVBvc2l0aW9uczogQ2FjaGVkSXRlbVBvc2l0aW9uPFQ+W10gPSBbXTtcblxuICAvKipcbiAgICogRHJhZ2dhYmxlIGl0ZW1zIHRoYXQgYXJlIGN1cnJlbnRseSBhY3RpdmUgaW5zaWRlIHRoZSBjb250YWluZXIuIEluY2x1ZGVzIHRoZSBpdGVtc1xuICAgKiB0aGF0IHdlcmUgdGhlcmUgYXQgdGhlIHN0YXJ0IG9mIHRoZSBzZXF1ZW5jZSwgYXMgd2VsbCBhcyBhbnkgaXRlbXMgdGhhdCBoYXZlIGJlZW4gZHJhZ2dlZFxuICAgKiBpbiwgYnV0IGhhdmVuJ3QgYmVlbiBkcm9wcGVkIHlldC5cbiAgICovXG4gIHByaXZhdGUgX2FjdGl2ZURyYWdnYWJsZXM6IFRbXTtcblxuICAvKiogRGlyZWN0aW9uIGluIHdoaWNoIHRoZSBsaXN0IGlzIG9yaWVudGVkLiAqL1xuICBvcmllbnRhdGlvbjogJ3ZlcnRpY2FsJyB8ICdob3Jpem9udGFsJyA9ICd2ZXJ0aWNhbCc7XG5cbiAgLyoqIExheW91dCBkaXJlY3Rpb24gb2YgdGhlIGRyb3AgbGlzdC4gKi9cbiAgZGlyZWN0aW9uOiBEaXJlY3Rpb247XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBfZWxlbWVudDogSFRNTEVsZW1lbnQgfCBFbGVtZW50UmVmPEhUTUxFbGVtZW50PixcbiAgICBwcml2YXRlIF9kcmFnRHJvcFJlZ2lzdHJ5OiBEcmFnRHJvcFJlZ2lzdHJ5PFQsIHVua25vd24+LFxuICApIHt9XG5cbiAgLyoqXG4gICAqIEtlZXBzIHRyYWNrIG9mIHRoZSBpdGVtIHRoYXQgd2FzIGxhc3Qgc3dhcHBlZCB3aXRoIHRoZSBkcmFnZ2VkIGl0ZW0sIGFzIHdlbGwgYXMgd2hhdCBkaXJlY3Rpb25cbiAgICogdGhlIHBvaW50ZXIgd2FzIG1vdmluZyBpbiB3aGVuIHRoZSBzd2FwIG9jY3VycmVkIGFuZCB3aGV0aGVyIHRoZSB1c2VyJ3MgcG9pbnRlciBjb250aW51ZWQgdG9cbiAgICogb3ZlcmxhcCB3aXRoIHRoZSBzd2FwcGVkIGl0ZW0gYWZ0ZXIgdGhlIHN3YXBwaW5nIG9jY3VycmVkLlxuICAgKi9cbiAgcHJpdmF0ZSBfcHJldmlvdXNTd2FwID0ge1xuICAgIGRyYWc6IG51bGwgYXMgVCB8IG51bGwsXG4gICAgZGVsdGE6IDAsXG4gICAgb3ZlcmxhcHM6IGZhbHNlLFxuICB9O1xuXG4gIC8qKlxuICAgKiBUbyBiZSBjYWxsZWQgd2hlbiB0aGUgZHJhZyBzZXF1ZW5jZSBzdGFydHMuXG4gICAqIEBwYXJhbSBpdGVtcyBJdGVtcyB0aGF0IGFyZSBjdXJyZW50bHkgaW4gdGhlIGxpc3QuXG4gICAqL1xuICBzdGFydChpdGVtczogcmVhZG9ubHkgVFtdKSB7XG4gICAgdGhpcy53aXRoSXRlbXMoaXRlbXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRvIGJlIGNhbGxlZCB3aGVuIGFuIGl0ZW0gaXMgYmVpbmcgc29ydGVkLlxuICAgKiBAcGFyYW0gaXRlbSBJdGVtIHRvIGJlIHNvcnRlZC5cbiAgICogQHBhcmFtIHBvaW50ZXJYIFBvc2l0aW9uIG9mIHRoZSBpdGVtIGFsb25nIHRoZSBYIGF4aXMuXG4gICAqIEBwYXJhbSBwb2ludGVyWSBQb3NpdGlvbiBvZiB0aGUgaXRlbSBhbG9uZyB0aGUgWSBheGlzLlxuICAgKiBAcGFyYW0gcG9pbnRlckRlbHRhIERpcmVjdGlvbiBpbiB3aGljaCB0aGUgcG9pbnRlciBpcyBtb3ZpbmcgYWxvbmcgZWFjaCBheGlzLlxuICAgKi9cbiAgc29ydChpdGVtOiBULCBwb2ludGVyWDogbnVtYmVyLCBwb2ludGVyWTogbnVtYmVyLCBwb2ludGVyRGVsdGE6IHt4OiBudW1iZXI7IHk6IG51bWJlcn0pIHtcbiAgICBjb25zdCBzaWJsaW5ncyA9IHRoaXMuX2l0ZW1Qb3NpdGlvbnM7XG4gICAgY29uc3QgbmV3SW5kZXggPSB0aGlzLl9nZXRJdGVtSW5kZXhGcm9tUG9pbnRlclBvc2l0aW9uKGl0ZW0sIHBvaW50ZXJYLCBwb2ludGVyWSwgcG9pbnRlckRlbHRhKTtcblxuICAgIGlmIChuZXdJbmRleCA9PT0gLTEgJiYgc2libGluZ3MubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3QgaXNIb3Jpem9udGFsID0gdGhpcy5vcmllbnRhdGlvbiA9PT0gJ2hvcml6b250YWwnO1xuICAgIGNvbnN0IGN1cnJlbnRJbmRleCA9IHNpYmxpbmdzLmZpbmRJbmRleChjdXJyZW50SXRlbSA9PiBjdXJyZW50SXRlbS5kcmFnID09PSBpdGVtKTtcbiAgICBjb25zdCBzaWJsaW5nQXROZXdQb3NpdGlvbiA9IHNpYmxpbmdzW25ld0luZGV4XTtcbiAgICBjb25zdCBjdXJyZW50UG9zaXRpb24gPSBzaWJsaW5nc1tjdXJyZW50SW5kZXhdLmNsaWVudFJlY3Q7XG4gICAgY29uc3QgbmV3UG9zaXRpb24gPSBzaWJsaW5nQXROZXdQb3NpdGlvbi5jbGllbnRSZWN0O1xuICAgIGNvbnN0IGRlbHRhID0gY3VycmVudEluZGV4ID4gbmV3SW5kZXggPyAxIDogLTE7XG5cbiAgICAvLyBIb3cgbWFueSBwaXhlbHMgdGhlIGl0ZW0ncyBwbGFjZWhvbGRlciBzaG91bGQgYmUgb2Zmc2V0LlxuICAgIGNvbnN0IGl0ZW1PZmZzZXQgPSB0aGlzLl9nZXRJdGVtT2Zmc2V0UHgoY3VycmVudFBvc2l0aW9uLCBuZXdQb3NpdGlvbiwgZGVsdGEpO1xuXG4gICAgLy8gSG93IG1hbnkgcGl4ZWxzIGFsbCB0aGUgb3RoZXIgaXRlbXMgc2hvdWxkIGJlIG9mZnNldC5cbiAgICBjb25zdCBzaWJsaW5nT2Zmc2V0ID0gdGhpcy5fZ2V0U2libGluZ09mZnNldFB4KGN1cnJlbnRJbmRleCwgc2libGluZ3MsIGRlbHRhKTtcblxuICAgIC8vIFNhdmUgdGhlIHByZXZpb3VzIG9yZGVyIG9mIHRoZSBpdGVtcyBiZWZvcmUgbW92aW5nIHRoZSBpdGVtIHRvIGl0cyBuZXcgaW5kZXguXG4gICAgLy8gV2UgdXNlIHRoaXMgdG8gY2hlY2sgd2hldGhlciBhbiBpdGVtIGhhcyBiZWVuIG1vdmVkIGFzIGEgcmVzdWx0IG9mIHRoZSBzb3J0aW5nLlxuICAgIGNvbnN0IG9sZE9yZGVyID0gc2libGluZ3Muc2xpY2UoKTtcblxuICAgIC8vIFNodWZmbGUgdGhlIGFycmF5IGluIHBsYWNlLlxuICAgIG1vdmVJdGVtSW5BcnJheShzaWJsaW5ncywgY3VycmVudEluZGV4LCBuZXdJbmRleCk7XG5cbiAgICBzaWJsaW5ncy5mb3JFYWNoKChzaWJsaW5nLCBpbmRleCkgPT4ge1xuICAgICAgLy8gRG9uJ3QgZG8gYW55dGhpbmcgaWYgdGhlIHBvc2l0aW9uIGhhc24ndCBjaGFuZ2VkLlxuICAgICAgaWYgKG9sZE9yZGVyW2luZGV4XSA9PT0gc2libGluZykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGlzRHJhZ2dlZEl0ZW0gPSBzaWJsaW5nLmRyYWcgPT09IGl0ZW07XG4gICAgICBjb25zdCBvZmZzZXQgPSBpc0RyYWdnZWRJdGVtID8gaXRlbU9mZnNldCA6IHNpYmxpbmdPZmZzZXQ7XG4gICAgICBjb25zdCBlbGVtZW50VG9PZmZzZXQgPSBpc0RyYWdnZWRJdGVtXG4gICAgICAgID8gaXRlbS5nZXRQbGFjZWhvbGRlckVsZW1lbnQoKVxuICAgICAgICA6IHNpYmxpbmcuZHJhZy5nZXRSb290RWxlbWVudCgpO1xuXG4gICAgICAvLyBVcGRhdGUgdGhlIG9mZnNldCB0byByZWZsZWN0IHRoZSBuZXcgcG9zaXRpb24uXG4gICAgICBzaWJsaW5nLm9mZnNldCArPSBvZmZzZXQ7XG5cbiAgICAgIC8vIFNpbmNlIHdlJ3JlIG1vdmluZyB0aGUgaXRlbXMgd2l0aCBhIGB0cmFuc2Zvcm1gLCB3ZSBuZWVkIHRvIGFkanVzdCB0aGVpciBjYWNoZWRcbiAgICAgIC8vIGNsaWVudCByZWN0cyB0byByZWZsZWN0IHRoZWlyIG5ldyBwb3NpdGlvbiwgYXMgd2VsbCBhcyBzd2FwIHRoZWlyIHBvc2l0aW9ucyBpbiB0aGUgY2FjaGUuXG4gICAgICAvLyBOb3RlIHRoYXQgd2Ugc2hvdWxkbid0IHVzZSBgZ2V0Qm91bmRpbmdDbGllbnRSZWN0YCBoZXJlIHRvIHVwZGF0ZSB0aGUgY2FjaGUsIGJlY2F1c2UgdGhlXG4gICAgICAvLyBlbGVtZW50cyBtYXkgYmUgbWlkLWFuaW1hdGlvbiB3aGljaCB3aWxsIGdpdmUgdXMgYSB3cm9uZyByZXN1bHQuXG4gICAgICBpZiAoaXNIb3Jpem9udGFsKSB7XG4gICAgICAgIC8vIFJvdW5kIHRoZSB0cmFuc2Zvcm1zIHNpbmNlIHNvbWUgYnJvd3NlcnMgd2lsbFxuICAgICAgICAvLyBibHVyIHRoZSBlbGVtZW50cywgZm9yIHN1Yi1waXhlbCB0cmFuc2Zvcm1zLlxuICAgICAgICBlbGVtZW50VG9PZmZzZXQuc3R5bGUudHJhbnNmb3JtID0gY29tYmluZVRyYW5zZm9ybXMoXG4gICAgICAgICAgYHRyYW5zbGF0ZTNkKCR7TWF0aC5yb3VuZChzaWJsaW5nLm9mZnNldCl9cHgsIDAsIDApYCxcbiAgICAgICAgICBzaWJsaW5nLmluaXRpYWxUcmFuc2Zvcm0sXG4gICAgICAgICk7XG4gICAgICAgIGFkanVzdENsaWVudFJlY3Qoc2libGluZy5jbGllbnRSZWN0LCAwLCBvZmZzZXQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZWxlbWVudFRvT2Zmc2V0LnN0eWxlLnRyYW5zZm9ybSA9IGNvbWJpbmVUcmFuc2Zvcm1zKFxuICAgICAgICAgIGB0cmFuc2xhdGUzZCgwLCAke01hdGgucm91bmQoc2libGluZy5vZmZzZXQpfXB4LCAwKWAsXG4gICAgICAgICAgc2libGluZy5pbml0aWFsVHJhbnNmb3JtLFxuICAgICAgICApO1xuICAgICAgICBhZGp1c3RDbGllbnRSZWN0KHNpYmxpbmcuY2xpZW50UmVjdCwgb2Zmc2V0LCAwKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIE5vdGUgdGhhdCBpdCdzIGltcG9ydGFudCB0aGF0IHdlIGRvIHRoaXMgYWZ0ZXIgdGhlIGNsaWVudCByZWN0cyBoYXZlIGJlZW4gYWRqdXN0ZWQuXG4gICAgdGhpcy5fcHJldmlvdXNTd2FwLm92ZXJsYXBzID0gaXNJbnNpZGVDbGllbnRSZWN0KG5ld1Bvc2l0aW9uLCBwb2ludGVyWCwgcG9pbnRlclkpO1xuICAgIHRoaXMuX3ByZXZpb3VzU3dhcC5kcmFnID0gc2libGluZ0F0TmV3UG9zaXRpb24uZHJhZztcbiAgICB0aGlzLl9wcmV2aW91c1N3YXAuZGVsdGEgPSBpc0hvcml6b250YWwgPyBwb2ludGVyRGVsdGEueCA6IHBvaW50ZXJEZWx0YS55O1xuXG4gICAgcmV0dXJuIHtwcmV2aW91c0luZGV4OiBjdXJyZW50SW5kZXgsIGN1cnJlbnRJbmRleDogbmV3SW5kZXh9O1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIGFuIGl0ZW0gaXMgYmVpbmcgbW92ZWQgaW50byB0aGUgY29udGFpbmVyLlxuICAgKiBAcGFyYW0gaXRlbSBJdGVtIHRoYXQgd2FzIG1vdmVkIGludG8gdGhlIGNvbnRhaW5lci5cbiAgICogQHBhcmFtIHBvaW50ZXJYIFBvc2l0aW9uIG9mIHRoZSBpdGVtIGFsb25nIHRoZSBYIGF4aXMuXG4gICAqIEBwYXJhbSBwb2ludGVyWSBQb3NpdGlvbiBvZiB0aGUgaXRlbSBhbG9uZyB0aGUgWSBheGlzLlxuICAgKiBAcGFyYW0gaW5kZXggSW5kZXggYXQgd2hpY2ggdGhlIGl0ZW0gZW50ZXJlZC4gSWYgb21pdHRlZCwgdGhlIGNvbnRhaW5lciB3aWxsIHRyeSB0byBmaWd1cmUgaXRcbiAgICogICBvdXQgYXV0b21hdGljYWxseS5cbiAgICovXG4gIGVudGVyKGl0ZW06IFQsIHBvaW50ZXJYOiBudW1iZXIsIHBvaW50ZXJZOiBudW1iZXIsIGluZGV4PzogbnVtYmVyKTogdm9pZCB7XG4gICAgY29uc3QgbmV3SW5kZXggPVxuICAgICAgaW5kZXggPT0gbnVsbCB8fCBpbmRleCA8IDBcbiAgICAgICAgPyAvLyBXZSB1c2UgdGhlIGNvb3JkaW5hdGVzIG9mIHdoZXJlIHRoZSBpdGVtIGVudGVyZWQgdGhlIGRyb3BcbiAgICAgICAgICAvLyB6b25lIHRvIGZpZ3VyZSBvdXQgYXQgd2hpY2ggaW5kZXggaXQgc2hvdWxkIGJlIGluc2VydGVkLlxuICAgICAgICAgIHRoaXMuX2dldEl0ZW1JbmRleEZyb21Qb2ludGVyUG9zaXRpb24oaXRlbSwgcG9pbnRlclgsIHBvaW50ZXJZKVxuICAgICAgICA6IGluZGV4O1xuXG4gICAgY29uc3QgYWN0aXZlRHJhZ2dhYmxlcyA9IHRoaXMuX2FjdGl2ZURyYWdnYWJsZXM7XG4gICAgY29uc3QgY3VycmVudEluZGV4ID0gYWN0aXZlRHJhZ2dhYmxlcy5pbmRleE9mKGl0ZW0pO1xuICAgIGNvbnN0IHBsYWNlaG9sZGVyID0gaXRlbS5nZXRQbGFjZWhvbGRlckVsZW1lbnQoKTtcbiAgICBsZXQgbmV3UG9zaXRpb25SZWZlcmVuY2U6IFQgfCB1bmRlZmluZWQgPSBhY3RpdmVEcmFnZ2FibGVzW25ld0luZGV4XTtcblxuICAgIC8vIElmIHRoZSBpdGVtIGF0IHRoZSBuZXcgcG9zaXRpb24gaXMgdGhlIHNhbWUgYXMgdGhlIGl0ZW0gdGhhdCBpcyBiZWluZyBkcmFnZ2VkLFxuICAgIC8vIGl0IG1lYW5zIHRoYXQgd2UncmUgdHJ5aW5nIHRvIHJlc3RvcmUgdGhlIGl0ZW0gdG8gaXRzIGluaXRpYWwgcG9zaXRpb24uIEluIHRoaXNcbiAgICAvLyBjYXNlIHdlIHNob3VsZCB1c2UgdGhlIG5leHQgaXRlbSBmcm9tIHRoZSBsaXN0IGFzIHRoZSByZWZlcmVuY2UuXG4gICAgaWYgKG5ld1Bvc2l0aW9uUmVmZXJlbmNlID09PSBpdGVtKSB7XG4gICAgICBuZXdQb3NpdGlvblJlZmVyZW5jZSA9IGFjdGl2ZURyYWdnYWJsZXNbbmV3SW5kZXggKyAxXTtcbiAgICB9XG5cbiAgICAvLyBJZiB3ZSBkaWRuJ3QgZmluZCBhIG5ldyBwb3NpdGlvbiByZWZlcmVuY2UsIGl0IG1lYW5zIHRoYXQgZWl0aGVyIHRoZSBpdGVtIGRpZG4ndCBzdGFydCBvZmZcbiAgICAvLyBpbiB0aGlzIGNvbnRhaW5lciwgb3IgdGhhdCB0aGUgaXRlbSByZXF1ZXN0ZWQgdG8gYmUgaW5zZXJ0ZWQgYXQgdGhlIGVuZCBvZiB0aGUgbGlzdC5cbiAgICBpZiAoXG4gICAgICAhbmV3UG9zaXRpb25SZWZlcmVuY2UgJiZcbiAgICAgIChuZXdJbmRleCA9PSBudWxsIHx8IG5ld0luZGV4ID09PSAtMSB8fCBuZXdJbmRleCA8IGFjdGl2ZURyYWdnYWJsZXMubGVuZ3RoIC0gMSkgJiZcbiAgICAgIHRoaXMuX3Nob3VsZEVudGVyQXNGaXJzdENoaWxkKHBvaW50ZXJYLCBwb2ludGVyWSlcbiAgICApIHtcbiAgICAgIG5ld1Bvc2l0aW9uUmVmZXJlbmNlID0gYWN0aXZlRHJhZ2dhYmxlc1swXTtcbiAgICB9XG5cbiAgICAvLyBTaW5jZSB0aGUgaXRlbSBtYXkgYmUgaW4gdGhlIGBhY3RpdmVEcmFnZ2FibGVzYCBhbHJlYWR5IChlLmcuIGlmIHRoZSB1c2VyIGRyYWdnZWQgaXRcbiAgICAvLyBpbnRvIGFub3RoZXIgY29udGFpbmVyIGFuZCBiYWNrIGFnYWluKSwgd2UgaGF2ZSB0byBlbnN1cmUgdGhhdCBpdCBpc24ndCBkdXBsaWNhdGVkLlxuICAgIGlmIChjdXJyZW50SW5kZXggPiAtMSkge1xuICAgICAgYWN0aXZlRHJhZ2dhYmxlcy5zcGxpY2UoY3VycmVudEluZGV4LCAxKTtcbiAgICB9XG5cbiAgICAvLyBEb24ndCB1c2UgaXRlbXMgdGhhdCBhcmUgYmVpbmcgZHJhZ2dlZCBhcyBhIHJlZmVyZW5jZSwgYmVjYXVzZVxuICAgIC8vIHRoZWlyIGVsZW1lbnQgaGFzIGJlZW4gbW92ZWQgZG93biB0byB0aGUgYm90dG9tIG9mIHRoZSBib2R5LlxuICAgIGlmIChuZXdQb3NpdGlvblJlZmVyZW5jZSAmJiAhdGhpcy5fZHJhZ0Ryb3BSZWdpc3RyeS5pc0RyYWdnaW5nKG5ld1Bvc2l0aW9uUmVmZXJlbmNlKSkge1xuICAgICAgY29uc3QgZWxlbWVudCA9IG5ld1Bvc2l0aW9uUmVmZXJlbmNlLmdldFJvb3RFbGVtZW50KCk7XG4gICAgICBlbGVtZW50LnBhcmVudEVsZW1lbnQhLmluc2VydEJlZm9yZShwbGFjZWhvbGRlciwgZWxlbWVudCk7XG4gICAgICBhY3RpdmVEcmFnZ2FibGVzLnNwbGljZShuZXdJbmRleCwgMCwgaXRlbSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvZXJjZUVsZW1lbnQodGhpcy5fZWxlbWVudCkuYXBwZW5kQ2hpbGQocGxhY2Vob2xkZXIpO1xuICAgICAgYWN0aXZlRHJhZ2dhYmxlcy5wdXNoKGl0ZW0pO1xuICAgIH1cblxuICAgIC8vIFRoZSB0cmFuc2Zvcm0gbmVlZHMgdG8gYmUgY2xlYXJlZCBzbyBpdCBkb2Vzbid0IHRocm93IG9mZiB0aGUgbWVhc3VyZW1lbnRzLlxuICAgIHBsYWNlaG9sZGVyLnN0eWxlLnRyYW5zZm9ybSA9ICcnO1xuXG4gICAgLy8gTm90ZSB0aGF0IHVzdWFsbHkgYHN0YXJ0YCBpcyBjYWxsZWQgdG9nZXRoZXIgd2l0aCBgZW50ZXJgIHdoZW4gYW4gaXRlbSBnb2VzIGludG8gYSBuZXdcbiAgICAvLyBjb250YWluZXIuIFRoaXMgd2lsbCBjYWNoZSBpdGVtIHBvc2l0aW9ucywgYnV0IHdlIG5lZWQgdG8gcmVmcmVzaCB0aGVtIHNpbmNlIHRoZSBhbW91bnRcbiAgICAvLyBvZiBpdGVtcyBoYXMgY2hhbmdlZC5cbiAgICB0aGlzLl9jYWNoZUl0ZW1Qb3NpdGlvbnMoKTtcbiAgfVxuXG4gIC8qKiBTZXRzIHRoZSBpdGVtcyB0aGF0IGFyZSBjdXJyZW50bHkgcGFydCBvZiB0aGUgbGlzdC4gKi9cbiAgd2l0aEl0ZW1zKGl0ZW1zOiByZWFkb25seSBUW10pOiB2b2lkIHtcbiAgICB0aGlzLl9hY3RpdmVEcmFnZ2FibGVzID0gaXRlbXMuc2xpY2UoKTtcbiAgICB0aGlzLl9jYWNoZUl0ZW1Qb3NpdGlvbnMoKTtcbiAgfVxuXG4gIC8qKiBBc3NpZ25zIGEgc29ydCBwcmVkaWNhdGUgdG8gdGhlIHN0cmF0ZWd5LiAqL1xuICB3aXRoU29ydFByZWRpY2F0ZShwcmVkaWNhdGU6IFNvcnRQcmVkaWNhdGU8VD4pOiB2b2lkIHtcbiAgICB0aGlzLl9zb3J0UHJlZGljYXRlID0gcHJlZGljYXRlO1xuICB9XG5cbiAgLyoqIFJlc2V0cyB0aGUgc3RyYXRlZ3kgdG8gaXRzIGluaXRpYWwgc3RhdGUgYmVmb3JlIGRyYWdnaW5nIHdhcyBzdGFydGVkLiAqL1xuICByZXNldCgpIHtcbiAgICAvLyBUT0RPKGNyaXNiZXRvKTogbWF5IGhhdmUgdG8gd2FpdCBmb3IgdGhlIGFuaW1hdGlvbnMgdG8gZmluaXNoLlxuICAgIHRoaXMuX2FjdGl2ZURyYWdnYWJsZXMuZm9yRWFjaChpdGVtID0+IHtcbiAgICAgIGNvbnN0IHJvb3RFbGVtZW50ID0gaXRlbS5nZXRSb290RWxlbWVudCgpO1xuXG4gICAgICBpZiAocm9vdEVsZW1lbnQpIHtcbiAgICAgICAgY29uc3QgaW5pdGlhbFRyYW5zZm9ybSA9IHRoaXMuX2l0ZW1Qb3NpdGlvbnMuZmluZChwID0+IHAuZHJhZyA9PT0gaXRlbSk/LmluaXRpYWxUcmFuc2Zvcm07XG4gICAgICAgIHJvb3RFbGVtZW50LnN0eWxlLnRyYW5zZm9ybSA9IGluaXRpYWxUcmFuc2Zvcm0gfHwgJyc7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLl9pdGVtUG9zaXRpb25zID0gW107XG4gICAgdGhpcy5fYWN0aXZlRHJhZ2dhYmxlcyA9IFtdO1xuICAgIHRoaXMuX3ByZXZpb3VzU3dhcC5kcmFnID0gbnVsbDtcbiAgICB0aGlzLl9wcmV2aW91c1N3YXAuZGVsdGEgPSAwO1xuICAgIHRoaXMuX3ByZXZpb3VzU3dhcC5vdmVybGFwcyA9IGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgYSBzbmFwc2hvdCBvZiBpdGVtcyBjdXJyZW50bHkgaW4gdGhlIGxpc3QuXG4gICAqIENhbiBpbmNsdWRlIGl0ZW1zIHRoYXQgd2UgZHJhZ2dlZCBpbiBmcm9tIGFub3RoZXIgbGlzdC5cbiAgICovXG4gIGdldEFjdGl2ZUl0ZW1zU25hcHNob3QoKTogcmVhZG9ubHkgVFtdIHtcbiAgICByZXR1cm4gdGhpcy5fYWN0aXZlRHJhZ2dhYmxlcztcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBpbmRleCBvZiBhIHNwZWNpZmljIGl0ZW0uICovXG4gIGdldEl0ZW1JbmRleChpdGVtOiBUKTogbnVtYmVyIHtcbiAgICAvLyBJdGVtcyBhcmUgc29ydGVkIGFsd2F5cyBieSB0b3AvbGVmdCBpbiB0aGUgY2FjaGUsIGhvd2V2ZXIgdGhleSBmbG93IGRpZmZlcmVudGx5IGluIFJUTC5cbiAgICAvLyBUaGUgcmVzdCBvZiB0aGUgbG9naWMgc3RpbGwgc3RhbmRzIG5vIG1hdHRlciB3aGF0IG9yaWVudGF0aW9uIHdlJ3JlIGluLCBob3dldmVyXG4gICAgLy8gd2UgbmVlZCB0byBpbnZlcnQgdGhlIGFycmF5IHdoZW4gZGV0ZXJtaW5pbmcgdGhlIGluZGV4LlxuICAgIGNvbnN0IGl0ZW1zID1cbiAgICAgIHRoaXMub3JpZW50YXRpb24gPT09ICdob3Jpem9udGFsJyAmJiB0aGlzLmRpcmVjdGlvbiA9PT0gJ3J0bCdcbiAgICAgICAgPyB0aGlzLl9pdGVtUG9zaXRpb25zLnNsaWNlKCkucmV2ZXJzZSgpXG4gICAgICAgIDogdGhpcy5faXRlbVBvc2l0aW9ucztcblxuICAgIHJldHVybiBpdGVtcy5maW5kSW5kZXgoY3VycmVudEl0ZW0gPT4gY3VycmVudEl0ZW0uZHJhZyA9PT0gaXRlbSk7XG4gIH1cblxuICAvKiogVXNlZCB0byBub3RpZnkgdGhlIHN0cmF0ZWd5IHRoYXQgdGhlIHNjcm9sbCBwb3NpdGlvbiBoYXMgY2hhbmdlZC4gKi9cbiAgdXBkYXRlT25TY3JvbGwodG9wRGlmZmVyZW5jZTogbnVtYmVyLCBsZWZ0RGlmZmVyZW5jZTogbnVtYmVyKSB7XG4gICAgLy8gU2luY2Ugd2Uga25vdyB0aGUgYW1vdW50IHRoYXQgdGhlIHVzZXIgaGFzIHNjcm9sbGVkIHdlIGNhbiBzaGlmdCBhbGwgb2YgdGhlXG4gICAgLy8gY2xpZW50IHJlY3RhbmdsZXMgb3Vyc2VsdmVzLiBUaGlzIGlzIGNoZWFwZXIgdGhhbiByZS1tZWFzdXJpbmcgZXZlcnl0aGluZyBhbmRcbiAgICAvLyB3ZSBjYW4gYXZvaWQgaW5jb25zaXN0ZW50IGJlaGF2aW9yIHdoZXJlIHdlIG1pZ2h0IGJlIG1lYXN1cmluZyB0aGUgZWxlbWVudCBiZWZvcmVcbiAgICAvLyBpdHMgcG9zaXRpb24gaGFzIGNoYW5nZWQuXG4gICAgdGhpcy5faXRlbVBvc2l0aW9ucy5mb3JFYWNoKCh7Y2xpZW50UmVjdH0pID0+IHtcbiAgICAgIGFkanVzdENsaWVudFJlY3QoY2xpZW50UmVjdCwgdG9wRGlmZmVyZW5jZSwgbGVmdERpZmZlcmVuY2UpO1xuICAgIH0pO1xuXG4gICAgLy8gV2UgbmVlZCB0d28gbG9vcHMgZm9yIHRoaXMsIGJlY2F1c2Ugd2Ugd2FudCBhbGwgb2YgdGhlIGNhY2hlZFxuICAgIC8vIHBvc2l0aW9ucyB0byBiZSB1cC10by1kYXRlIGJlZm9yZSB3ZSByZS1zb3J0IHRoZSBpdGVtLlxuICAgIHRoaXMuX2l0ZW1Qb3NpdGlvbnMuZm9yRWFjaCgoe2RyYWd9KSA9PiB7XG4gICAgICBpZiAodGhpcy5fZHJhZ0Ryb3BSZWdpc3RyeS5pc0RyYWdnaW5nKGRyYWcpKSB7XG4gICAgICAgIC8vIFdlIG5lZWQgdG8gcmUtc29ydCB0aGUgaXRlbSBtYW51YWxseSwgYmVjYXVzZSB0aGUgcG9pbnRlciBtb3ZlXG4gICAgICAgIC8vIGV2ZW50cyB3b24ndCBiZSBkaXNwYXRjaGVkIHdoaWxlIHRoZSB1c2VyIGlzIHNjcm9sbGluZy5cbiAgICAgICAgZHJhZy5fc29ydEZyb21MYXN0UG9pbnRlclBvc2l0aW9uKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKiogUmVmcmVzaGVzIHRoZSBwb3NpdGlvbiBjYWNoZSBvZiB0aGUgaXRlbXMgYW5kIHNpYmxpbmcgY29udGFpbmVycy4gKi9cbiAgcHJpdmF0ZSBfY2FjaGVJdGVtUG9zaXRpb25zKCkge1xuICAgIGNvbnN0IGlzSG9yaXpvbnRhbCA9IHRoaXMub3JpZW50YXRpb24gPT09ICdob3Jpem9udGFsJztcblxuICAgIHRoaXMuX2l0ZW1Qb3NpdGlvbnMgPSB0aGlzLl9hY3RpdmVEcmFnZ2FibGVzXG4gICAgICAubWFwKGRyYWcgPT4ge1xuICAgICAgICBjb25zdCBlbGVtZW50VG9NZWFzdXJlID0gZHJhZy5nZXRWaXNpYmxlRWxlbWVudCgpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGRyYWcsXG4gICAgICAgICAgb2Zmc2V0OiAwLFxuICAgICAgICAgIGluaXRpYWxUcmFuc2Zvcm06IGVsZW1lbnRUb01lYXN1cmUuc3R5bGUudHJhbnNmb3JtIHx8ICcnLFxuICAgICAgICAgIGNsaWVudFJlY3Q6IGdldE11dGFibGVDbGllbnRSZWN0KGVsZW1lbnRUb01lYXN1cmUpLFxuICAgICAgICB9O1xuICAgICAgfSlcbiAgICAgIC5zb3J0KChhLCBiKSA9PiB7XG4gICAgICAgIHJldHVybiBpc0hvcml6b250YWxcbiAgICAgICAgICA/IGEuY2xpZW50UmVjdC5sZWZ0IC0gYi5jbGllbnRSZWN0LmxlZnRcbiAgICAgICAgICA6IGEuY2xpZW50UmVjdC50b3AgLSBiLmNsaWVudFJlY3QudG9wO1xuICAgICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgb2Zmc2V0IGluIHBpeGVscyBieSB3aGljaCB0aGUgaXRlbSB0aGF0IGlzIGJlaW5nIGRyYWdnZWQgc2hvdWxkIGJlIG1vdmVkLlxuICAgKiBAcGFyYW0gY3VycmVudFBvc2l0aW9uIEN1cnJlbnQgcG9zaXRpb24gb2YgdGhlIGl0ZW0uXG4gICAqIEBwYXJhbSBuZXdQb3NpdGlvbiBQb3NpdGlvbiBvZiB0aGUgaXRlbSB3aGVyZSB0aGUgY3VycmVudCBpdGVtIHNob3VsZCBiZSBtb3ZlZC5cbiAgICogQHBhcmFtIGRlbHRhIERpcmVjdGlvbiBpbiB3aGljaCB0aGUgdXNlciBpcyBtb3ZpbmcuXG4gICAqL1xuICBwcml2YXRlIF9nZXRJdGVtT2Zmc2V0UHgoY3VycmVudFBvc2l0aW9uOiBDbGllbnRSZWN0LCBuZXdQb3NpdGlvbjogQ2xpZW50UmVjdCwgZGVsdGE6IDEgfCAtMSkge1xuICAgIGNvbnN0IGlzSG9yaXpvbnRhbCA9IHRoaXMub3JpZW50YXRpb24gPT09ICdob3Jpem9udGFsJztcbiAgICBsZXQgaXRlbU9mZnNldCA9IGlzSG9yaXpvbnRhbFxuICAgICAgPyBuZXdQb3NpdGlvbi5sZWZ0IC0gY3VycmVudFBvc2l0aW9uLmxlZnRcbiAgICAgIDogbmV3UG9zaXRpb24udG9wIC0gY3VycmVudFBvc2l0aW9uLnRvcDtcblxuICAgIC8vIEFjY291bnQgZm9yIGRpZmZlcmVuY2VzIGluIHRoZSBpdGVtIHdpZHRoL2hlaWdodC5cbiAgICBpZiAoZGVsdGEgPT09IC0xKSB7XG4gICAgICBpdGVtT2Zmc2V0ICs9IGlzSG9yaXpvbnRhbFxuICAgICAgICA/IG5ld1Bvc2l0aW9uLndpZHRoIC0gY3VycmVudFBvc2l0aW9uLndpZHRoXG4gICAgICAgIDogbmV3UG9zaXRpb24uaGVpZ2h0IC0gY3VycmVudFBvc2l0aW9uLmhlaWdodDtcbiAgICB9XG5cbiAgICByZXR1cm4gaXRlbU9mZnNldDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBvZmZzZXQgaW4gcGl4ZWxzIGJ5IHdoaWNoIHRoZSBpdGVtcyB0aGF0IGFyZW4ndCBiZWluZyBkcmFnZ2VkIHNob3VsZCBiZSBtb3ZlZC5cbiAgICogQHBhcmFtIGN1cnJlbnRJbmRleCBJbmRleCBvZiB0aGUgaXRlbSBjdXJyZW50bHkgYmVpbmcgZHJhZ2dlZC5cbiAgICogQHBhcmFtIHNpYmxpbmdzIEFsbCBvZiB0aGUgaXRlbXMgaW4gdGhlIGxpc3QuXG4gICAqIEBwYXJhbSBkZWx0YSBEaXJlY3Rpb24gaW4gd2hpY2ggdGhlIHVzZXIgaXMgbW92aW5nLlxuICAgKi9cbiAgcHJpdmF0ZSBfZ2V0U2libGluZ09mZnNldFB4KFxuICAgIGN1cnJlbnRJbmRleDogbnVtYmVyLFxuICAgIHNpYmxpbmdzOiBDYWNoZWRJdGVtUG9zaXRpb248VD5bXSxcbiAgICBkZWx0YTogMSB8IC0xLFxuICApIHtcbiAgICBjb25zdCBpc0hvcml6b250YWwgPSB0aGlzLm9yaWVudGF0aW9uID09PSAnaG9yaXpvbnRhbCc7XG4gICAgY29uc3QgY3VycmVudFBvc2l0aW9uID0gc2libGluZ3NbY3VycmVudEluZGV4XS5jbGllbnRSZWN0O1xuICAgIGNvbnN0IGltbWVkaWF0ZVNpYmxpbmcgPSBzaWJsaW5nc1tjdXJyZW50SW5kZXggKyBkZWx0YSAqIC0xXTtcbiAgICBsZXQgc2libGluZ09mZnNldCA9IGN1cnJlbnRQb3NpdGlvbltpc0hvcml6b250YWwgPyAnd2lkdGgnIDogJ2hlaWdodCddICogZGVsdGE7XG5cbiAgICBpZiAoaW1tZWRpYXRlU2libGluZykge1xuICAgICAgY29uc3Qgc3RhcnQgPSBpc0hvcml6b250YWwgPyAnbGVmdCcgOiAndG9wJztcbiAgICAgIGNvbnN0IGVuZCA9IGlzSG9yaXpvbnRhbCA/ICdyaWdodCcgOiAnYm90dG9tJztcblxuICAgICAgLy8gR2V0IHRoZSBzcGFjaW5nIGJldHdlZW4gdGhlIHN0YXJ0IG9mIHRoZSBjdXJyZW50IGl0ZW0gYW5kIHRoZSBlbmQgb2YgdGhlIG9uZSBpbW1lZGlhdGVseVxuICAgICAgLy8gYWZ0ZXIgaXQgaW4gdGhlIGRpcmVjdGlvbiBpbiB3aGljaCB0aGUgdXNlciBpcyBkcmFnZ2luZywgb3IgdmljZSB2ZXJzYS4gV2UgYWRkIGl0IHRvIHRoZVxuICAgICAgLy8gb2Zmc2V0IGluIG9yZGVyIHRvIHB1c2ggdGhlIGVsZW1lbnQgdG8gd2hlcmUgaXQgd2lsbCBiZSB3aGVuIGl0J3MgaW5saW5lIGFuZCBpcyBpbmZsdWVuY2VkXG4gICAgICAvLyBieSB0aGUgYG1hcmdpbmAgb2YgaXRzIHNpYmxpbmdzLlxuICAgICAgaWYgKGRlbHRhID09PSAtMSkge1xuICAgICAgICBzaWJsaW5nT2Zmc2V0IC09IGltbWVkaWF0ZVNpYmxpbmcuY2xpZW50UmVjdFtzdGFydF0gLSBjdXJyZW50UG9zaXRpb25bZW5kXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNpYmxpbmdPZmZzZXQgKz0gY3VycmVudFBvc2l0aW9uW3N0YXJ0XSAtIGltbWVkaWF0ZVNpYmxpbmcuY2xpZW50UmVjdFtlbmRdO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBzaWJsaW5nT2Zmc2V0O1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiBwb2ludGVyIGlzIGVudGVyaW5nIGluIHRoZSBmaXJzdCBwb3NpdGlvblxuICAgKiBAcGFyYW0gcG9pbnRlclggUG9zaXRpb24gb2YgdGhlIHVzZXIncyBwb2ludGVyIGFsb25nIHRoZSBYIGF4aXMuXG4gICAqIEBwYXJhbSBwb2ludGVyWSBQb3NpdGlvbiBvZiB0aGUgdXNlcidzIHBvaW50ZXIgYWxvbmcgdGhlIFkgYXhpcy5cbiAgICovXG4gIHByaXZhdGUgX3Nob3VsZEVudGVyQXNGaXJzdENoaWxkKHBvaW50ZXJYOiBudW1iZXIsIHBvaW50ZXJZOiBudW1iZXIpIHtcbiAgICBpZiAoIXRoaXMuX2FjdGl2ZURyYWdnYWJsZXMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgY29uc3QgaXRlbVBvc2l0aW9ucyA9IHRoaXMuX2l0ZW1Qb3NpdGlvbnM7XG4gICAgY29uc3QgaXNIb3Jpem9udGFsID0gdGhpcy5vcmllbnRhdGlvbiA9PT0gJ2hvcml6b250YWwnO1xuXG4gICAgLy8gYGl0ZW1Qb3NpdGlvbnNgIGFyZSBzb3J0ZWQgYnkgcG9zaXRpb24gd2hpbGUgYGFjdGl2ZURyYWdnYWJsZXNgIGFyZSBzb3J0ZWQgYnkgY2hpbGQgaW5kZXhcbiAgICAvLyBjaGVjayBpZiBjb250YWluZXIgaXMgdXNpbmcgc29tZSBzb3J0IG9mIFwicmV2ZXJzZVwiIG9yZGVyaW5nIChlZzogZmxleC1kaXJlY3Rpb246IHJvdy1yZXZlcnNlKVxuICAgIGNvbnN0IHJldmVyc2VkID0gaXRlbVBvc2l0aW9uc1swXS5kcmFnICE9PSB0aGlzLl9hY3RpdmVEcmFnZ2FibGVzWzBdO1xuICAgIGlmIChyZXZlcnNlZCkge1xuICAgICAgY29uc3QgbGFzdEl0ZW1SZWN0ID0gaXRlbVBvc2l0aW9uc1tpdGVtUG9zaXRpb25zLmxlbmd0aCAtIDFdLmNsaWVudFJlY3Q7XG4gICAgICByZXR1cm4gaXNIb3Jpem9udGFsID8gcG9pbnRlclggPj0gbGFzdEl0ZW1SZWN0LnJpZ2h0IDogcG9pbnRlclkgPj0gbGFzdEl0ZW1SZWN0LmJvdHRvbTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgZmlyc3RJdGVtUmVjdCA9IGl0ZW1Qb3NpdGlvbnNbMF0uY2xpZW50UmVjdDtcbiAgICAgIHJldHVybiBpc0hvcml6b250YWwgPyBwb2ludGVyWCA8PSBmaXJzdEl0ZW1SZWN0LmxlZnQgOiBwb2ludGVyWSA8PSBmaXJzdEl0ZW1SZWN0LnRvcDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgaW5kZXggb2YgYW4gaXRlbSBpbiB0aGUgZHJvcCBjb250YWluZXIsIGJhc2VkIG9uIHRoZSBwb3NpdGlvbiBvZiB0aGUgdXNlcidzIHBvaW50ZXIuXG4gICAqIEBwYXJhbSBpdGVtIEl0ZW0gdGhhdCBpcyBiZWluZyBzb3J0ZWQuXG4gICAqIEBwYXJhbSBwb2ludGVyWCBQb3NpdGlvbiBvZiB0aGUgdXNlcidzIHBvaW50ZXIgYWxvbmcgdGhlIFggYXhpcy5cbiAgICogQHBhcmFtIHBvaW50ZXJZIFBvc2l0aW9uIG9mIHRoZSB1c2VyJ3MgcG9pbnRlciBhbG9uZyB0aGUgWSBheGlzLlxuICAgKiBAcGFyYW0gZGVsdGEgRGlyZWN0aW9uIGluIHdoaWNoIHRoZSB1c2VyIGlzIG1vdmluZyB0aGVpciBwb2ludGVyLlxuICAgKi9cbiAgcHJpdmF0ZSBfZ2V0SXRlbUluZGV4RnJvbVBvaW50ZXJQb3NpdGlvbihcbiAgICBpdGVtOiBULFxuICAgIHBvaW50ZXJYOiBudW1iZXIsXG4gICAgcG9pbnRlclk6IG51bWJlcixcbiAgICBkZWx0YT86IHt4OiBudW1iZXI7IHk6IG51bWJlcn0sXG4gICk6IG51bWJlciB7XG4gICAgY29uc3QgaXNIb3Jpem9udGFsID0gdGhpcy5vcmllbnRhdGlvbiA9PT0gJ2hvcml6b250YWwnO1xuICAgIGNvbnN0IGluZGV4ID0gdGhpcy5faXRlbVBvc2l0aW9ucy5maW5kSW5kZXgoKHtkcmFnLCBjbGllbnRSZWN0fSkgPT4ge1xuICAgICAgLy8gU2tpcCB0aGUgaXRlbSBpdHNlbGYuXG4gICAgICBpZiAoZHJhZyA9PT0gaXRlbSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIGlmIChkZWx0YSkge1xuICAgICAgICBjb25zdCBkaXJlY3Rpb24gPSBpc0hvcml6b250YWwgPyBkZWx0YS54IDogZGVsdGEueTtcblxuICAgICAgICAvLyBJZiB0aGUgdXNlciBpcyBzdGlsbCBob3ZlcmluZyBvdmVyIHRoZSBzYW1lIGl0ZW0gYXMgbGFzdCB0aW1lLCB0aGVpciBjdXJzb3IgaGFzbid0IGxlZnRcbiAgICAgICAgLy8gdGhlIGl0ZW0gYWZ0ZXIgd2UgbWFkZSB0aGUgc3dhcCwgYW5kIHRoZXkgZGlkbid0IGNoYW5nZSB0aGUgZGlyZWN0aW9uIGluIHdoaWNoIHRoZXkncmVcbiAgICAgICAgLy8gZHJhZ2dpbmcsIHdlIGRvbid0IGNvbnNpZGVyIGl0IGEgZGlyZWN0aW9uIHN3YXAuXG4gICAgICAgIGlmIChcbiAgICAgICAgICBkcmFnID09PSB0aGlzLl9wcmV2aW91c1N3YXAuZHJhZyAmJlxuICAgICAgICAgIHRoaXMuX3ByZXZpb3VzU3dhcC5vdmVybGFwcyAmJlxuICAgICAgICAgIGRpcmVjdGlvbiA9PT0gdGhpcy5fcHJldmlvdXNTd2FwLmRlbHRhXG4gICAgICAgICkge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gaXNIb3Jpem9udGFsXG4gICAgICAgID8gLy8gUm91bmQgdGhlc2UgZG93biBzaW5jZSBtb3N0IGJyb3dzZXJzIHJlcG9ydCBjbGllbnQgcmVjdHMgd2l0aFxuICAgICAgICAgIC8vIHN1Yi1waXhlbCBwcmVjaXNpb24sIHdoZXJlYXMgdGhlIHBvaW50ZXIgY29vcmRpbmF0ZXMgYXJlIHJvdW5kZWQgdG8gcGl4ZWxzLlxuICAgICAgICAgIHBvaW50ZXJYID49IE1hdGguZmxvb3IoY2xpZW50UmVjdC5sZWZ0KSAmJiBwb2ludGVyWCA8IE1hdGguZmxvb3IoY2xpZW50UmVjdC5yaWdodClcbiAgICAgICAgOiBwb2ludGVyWSA+PSBNYXRoLmZsb29yKGNsaWVudFJlY3QudG9wKSAmJiBwb2ludGVyWSA8IE1hdGguZmxvb3IoY2xpZW50UmVjdC5ib3R0b20pO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIGluZGV4ID09PSAtMSB8fCAhdGhpcy5fc29ydFByZWRpY2F0ZShpbmRleCwgaXRlbSkgPyAtMSA6IGluZGV4O1xuICB9XG59XG4iXX0=