/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** Class to be added to the overlay pane wrapper. */
const wrapperClass = 'cdk-global-overlay-wrapper';
/**
 * A strategy for positioning overlays. Using this strategy, an overlay is given an
 * explicit position relative to the browser's viewport. We use flexbox, instead of
 * transforms, in order to avoid issues with subpixel rendering which can cause the
 * element to become blurry.
 */
export class GlobalPositionStrategy {
    constructor() {
        this._cssPosition = 'static';
        this._topOffset = '';
        this._bottomOffset = '';
        this._alignItems = '';
        this._xPosition = '';
        this._xOffset = '';
        this._width = '';
        this._height = '';
        this._isDisposed = false;
    }
    attach(overlayRef) {
        const config = overlayRef.getConfig();
        this._overlayRef = overlayRef;
        if (this._width && !config.width) {
            overlayRef.updateSize({ width: this._width });
        }
        if (this._height && !config.height) {
            overlayRef.updateSize({ height: this._height });
        }
        overlayRef.hostElement.classList.add(wrapperClass);
        this._isDisposed = false;
    }
    /**
     * Sets the top position of the overlay. Clears any previously set vertical position.
     * @param value New top offset.
     */
    top(value = '') {
        this._bottomOffset = '';
        this._topOffset = value;
        this._alignItems = 'flex-start';
        return this;
    }
    /**
     * Sets the left position of the overlay. Clears any previously set horizontal position.
     * @param value New left offset.
     */
    left(value = '') {
        this._xOffset = value;
        this._xPosition = 'left';
        return this;
    }
    /**
     * Sets the bottom position of the overlay. Clears any previously set vertical position.
     * @param value New bottom offset.
     */
    bottom(value = '') {
        this._topOffset = '';
        this._bottomOffset = value;
        this._alignItems = 'flex-end';
        return this;
    }
    /**
     * Sets the right position of the overlay. Clears any previously set horizontal position.
     * @param value New right offset.
     */
    right(value = '') {
        this._xOffset = value;
        this._xPosition = 'right';
        return this;
    }
    /**
     * Sets the overlay to the start of the viewport, depending on the overlay direction.
     * This will be to the left in LTR layouts and to the right in RTL.
     * @param offset Offset from the edge of the screen.
     */
    start(value = '') {
        this._xOffset = value;
        this._xPosition = 'start';
        return this;
    }
    /**
     * Sets the overlay to the end of the viewport, depending on the overlay direction.
     * This will be to the right in LTR layouts and to the left in RTL.
     * @param offset Offset from the edge of the screen.
     */
    end(value = '') {
        this._xOffset = value;
        this._xPosition = 'end';
        return this;
    }
    /**
     * Sets the overlay width and clears any previously set width.
     * @param value New width for the overlay
     * @deprecated Pass the `width` through the `OverlayConfig`.
     * @breaking-change 8.0.0
     */
    width(value = '') {
        if (this._overlayRef) {
            this._overlayRef.updateSize({ width: value });
        }
        else {
            this._width = value;
        }
        return this;
    }
    /**
     * Sets the overlay height and clears any previously set height.
     * @param value New height for the overlay
     * @deprecated Pass the `height` through the `OverlayConfig`.
     * @breaking-change 8.0.0
     */
    height(value = '') {
        if (this._overlayRef) {
            this._overlayRef.updateSize({ height: value });
        }
        else {
            this._height = value;
        }
        return this;
    }
    /**
     * Centers the overlay horizontally with an optional offset.
     * Clears any previously set horizontal position.
     *
     * @param offset Overlay offset from the horizontal center.
     */
    centerHorizontally(offset = '') {
        this.left(offset);
        this._xPosition = 'center';
        return this;
    }
    /**
     * Centers the overlay vertically with an optional offset.
     * Clears any previously set vertical position.
     *
     * @param offset Overlay offset from the vertical center.
     */
    centerVertically(offset = '') {
        this.top(offset);
        this._alignItems = 'center';
        return this;
    }
    /**
     * Apply the position to the element.
     * @docs-private
     */
    apply() {
        // Since the overlay ref applies the strategy asynchronously, it could
        // have been disposed before it ends up being applied. If that is the
        // case, we shouldn't do anything.
        if (!this._overlayRef || !this._overlayRef.hasAttached()) {
            return;
        }
        const styles = this._overlayRef.overlayElement.style;
        const parentStyles = this._overlayRef.hostElement.style;
        const config = this._overlayRef.getConfig();
        const { width, height, maxWidth, maxHeight } = config;
        const shouldBeFlushHorizontally = (width === '100%' || width === '100vw') &&
            (!maxWidth || maxWidth === '100%' || maxWidth === '100vw');
        const shouldBeFlushVertically = (height === '100%' || height === '100vh') &&
            (!maxHeight || maxHeight === '100%' || maxHeight === '100vh');
        const xPosition = this._xPosition;
        const xOffset = this._xOffset;
        const isRtl = this._overlayRef.getConfig().direction === 'rtl';
        let marginLeft = '';
        let marginRight = '';
        let justifyContent = '';
        if (shouldBeFlushHorizontally) {
            justifyContent = 'flex-start';
        }
        else if (xPosition === 'center') {
            justifyContent = 'center';
            if (isRtl) {
                marginRight = xOffset;
            }
            else {
                marginLeft = xOffset;
            }
        }
        else if (isRtl) {
            if (xPosition === 'left' || xPosition === 'end') {
                justifyContent = 'flex-end';
                marginLeft = xOffset;
            }
            else if (xPosition === 'right' || xPosition === 'start') {
                justifyContent = 'flex-start';
                marginRight = xOffset;
            }
        }
        else if (xPosition === 'left' || xPosition === 'start') {
            justifyContent = 'flex-start';
            marginLeft = xOffset;
        }
        else if (xPosition === 'right' || xPosition === 'end') {
            justifyContent = 'flex-end';
            marginRight = xOffset;
        }
        styles.position = this._cssPosition;
        styles.marginLeft = shouldBeFlushHorizontally ? '0' : marginLeft;
        styles.marginTop = shouldBeFlushVertically ? '0' : this._topOffset;
        styles.marginBottom = this._bottomOffset;
        styles.marginRight = shouldBeFlushHorizontally ? '0' : marginRight;
        parentStyles.justifyContent = justifyContent;
        parentStyles.alignItems = shouldBeFlushVertically ? 'flex-start' : this._alignItems;
    }
    /**
     * Cleans up the DOM changes from the position strategy.
     * @docs-private
     */
    dispose() {
        if (this._isDisposed || !this._overlayRef) {
            return;
        }
        const styles = this._overlayRef.overlayElement.style;
        const parent = this._overlayRef.hostElement;
        const parentStyles = parent.style;
        parent.classList.remove(wrapperClass);
        parentStyles.justifyContent =
            parentStyles.alignItems =
                styles.marginTop =
                    styles.marginBottom =
                        styles.marginLeft =
                            styles.marginRight =
                                styles.position =
                                    '';
        this._overlayRef = null;
        this._isDisposed = true;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2xvYmFsLXBvc2l0aW9uLXN0cmF0ZWd5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9vdmVybGF5L3Bvc2l0aW9uL2dsb2JhbC1wb3NpdGlvbi1zdHJhdGVneS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFLSCxxREFBcUQ7QUFDckQsTUFBTSxZQUFZLEdBQUcsNEJBQTRCLENBQUM7QUFFbEQ7Ozs7O0dBS0c7QUFDSCxNQUFNLE9BQU8sc0JBQXNCO0lBQW5DO1FBR1UsaUJBQVksR0FBRyxRQUFRLENBQUM7UUFDeEIsZUFBVSxHQUFHLEVBQUUsQ0FBQztRQUNoQixrQkFBYSxHQUFHLEVBQUUsQ0FBQztRQUNuQixnQkFBVyxHQUFHLEVBQUUsQ0FBQztRQUNqQixlQUFVLEdBQUcsRUFBRSxDQUFDO1FBQ2hCLGFBQVEsR0FBRyxFQUFFLENBQUM7UUFDZCxXQUFNLEdBQUcsRUFBRSxDQUFDO1FBQ1osWUFBTyxHQUFHLEVBQUUsQ0FBQztRQUNiLGdCQUFXLEdBQUcsS0FBSyxDQUFDO0lBcU85QixDQUFDO0lBbk9DLE1BQU0sQ0FBQyxVQUE0QjtRQUNqQyxNQUFNLE1BQU0sR0FBRyxVQUFVLENBQUMsU0FBUyxFQUFFLENBQUM7UUFFdEMsSUFBSSxDQUFDLFdBQVcsR0FBRyxVQUFVLENBQUM7UUFFOUIsSUFBSSxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRTtZQUNoQyxVQUFVLENBQUMsVUFBVSxDQUFDLEVBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUMsQ0FBQyxDQUFDO1NBQzdDO1FBRUQsSUFBSSxJQUFJLENBQUMsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRTtZQUNsQyxVQUFVLENBQUMsVUFBVSxDQUFDLEVBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUMsQ0FBQyxDQUFDO1NBQy9DO1FBRUQs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QVksR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDO1FBQ3pDLE1BQU0sQ0FBQyxXQUFXLEdBQUcseUJBQXlCLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDO1FBQ25FLFlBQVksQ0FBQyxjQUFjLEdBQUcsY0FBYyxDQUFDO1FBQzdDLFlBQVksQ0FBQyxVQUFVLEdBQUcsdUJBQXVCLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQztJQUN0RixDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsT0FBTztRQUNMLElBQUksSUFBSSxDQUFDLFdBQVcsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUU7WUFDekMsT0FBTztTQUNSO1FBRUQsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDO1FBQ3JELE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDO1FBQzVDLE1BQU0sWUFBWSxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUM7UUFFbEMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDdEMsWUFBWSxDQUFDLGNBQWM7WUFDekIsWUFBWSxDQUFDLFVBQVU7Z0JBQ3ZCLE1BQU0sQ0FBQyxTQUFTO29CQUNoQixNQUFNLENBQUMsWUFBWTt3QkFDbkIsTUFBTSxDQUFDLFVBQVU7NEJBQ2pCLE1BQU0sQ0FBQyxXQUFXO2dDQUNsQixNQUFNLENBQUMsUUFBUTtvQ0FDYixFQUFFLENBQUM7UUFFUCxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUssQ0FBQztRQUN6QixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztJQUMxQixDQUFDO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtQb3NpdGlvblN0cmF0ZWd5fSBmcm9tICcuL3Bvc2l0aW9uLXN0cmF0ZWd5JztcbmltcG9ydCB7T3ZlcmxheVJlZmVyZW5jZX0gZnJvbSAnLi4vb3ZlcmxheS1yZWZlcmVuY2UnO1xuXG4vKiogQ2xhc3MgdG8gYmUgYWRkZWQgdG8gdGhlIG92ZXJsYXkgcGFuZSB3cmFwcGVyLiAqL1xuY29uc3Qgd3JhcHBlckNsYXNzID0gJ2Nkay1nbG9iYWwtb3ZlcmxheS13cmFwcGVyJztcblxuLyoqXG4gKiBBIHN0cmF0ZWd5IGZvciBwb3NpdGlvbmluZyBvdmVybGF5cy4gVXNpbmcgdGhpcyBzdHJhdGVneSwgYW4gb3ZlcmxheSBpcyBnaXZlbiBhblxuICogZXhwbGljaXQgcG9zaXRpb24gcmVsYXRpdmUgdG8gdGhlIGJyb3dzZXIncyB2aWV3cG9ydC4gV2UgdXNlIGZsZXhib3gsIGluc3RlYWQgb2ZcbiAqIHRyYW5zZm9ybXMsIGluIG9yZGVyIHRvIGF2b2lkIGlzc3VlcyB3aXRoIHN1YnBpeGVsIHJlbmRlcmluZyB3aGljaCBjYW4gY2F1c2UgdGhlXG4gKiBlbGVtZW50IHRvIGJlY29tZSBibHVycnkuXG4gKi9cbmV4cG9ydCBjbGFzcyBHbG9iYWxQb3NpdGlvblN0cmF0ZWd5IGltcGxlbWVudHMgUG9zaXRpb25TdHJhdGVneSB7XG4gIC8qKiBUaGUgb3ZlcmxheSB0byB3aGljaCB0aGlzIHN0cmF0ZWd5IGlzIGF0dGFjaGVkLiAqL1xuICBwcml2YXRlIF9vdmVybGF5UmVmOiBPdmVybGF5UmVmZXJlbmNlO1xuICBwcml2YXRlIF9jc3NQb3NpdGlvbiA9ICdzdGF0aWMnO1xuICBwcml2YXRlIF90b3BPZmZzZXQgPSAnJztcbiAgcHJpdmF0ZSBfYm90dG9tT2Zmc2V0ID0gJyc7XG4gIHByaXZhdGUgX2FsaWduSXRlbXMgPSAnJztcbiAgcHJpdmF0ZSBfeFBvc2l0aW9uID0gJyc7XG4gIHByaXZhdGUgX3hPZmZzZXQgPSAnJztcbiAgcHJpdmF0ZSBfd2lkdGggPSAnJztcbiAgcHJpdmF0ZSBfaGVpZ2h0ID0gJyc7XG4gIHByaXZhdGUgX2lzRGlzcG9zZWQgPSBmYWxzZTtcblxuICBhdHRhY2gob3ZlcmxheVJlZjogT3ZlcmxheVJlZmVyZW5jZSk6IHZvaWQge1xuICAgIGNvbnN0IGNvbmZpZyA9IG92ZXJsYXlSZWYuZ2V0Q29uZmlnKCk7XG5cbiAgICB0aGlzLl9vdmVybGF5UmVmID0gb3ZlcmxheVJlZjtcblxuICAgIGlmICh0aGlzLl93aWR0aCAmJiAhY29uZmlnLndpZHRoKSB7XG4gICAgICBvdmVybGF5UmVmLnVwZGF0ZVNpemUoe3dpZHRoOiB0aGlzLl93aWR0aH0pO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9oZWlnaHQgJiYgIWNvbmZpZy5oZWlnaHQpIHtcbiAgICAgIG92ZXJsYXlSZWYudXBkYXRlU2l6ZSh7aGVpZ2h0OiB0aGlzLl9oZWlnaHR9KTtcbiAgICB9XG5cbiAgICBvdmVybGF5UmVmLmhvc3RFbGVtZW50LmNsYXNzTGlzdC5hZGQod3JhcHBlckNsYXNzKTtcbiAgICB0aGlzLl9pc0Rpc3Bvc2VkID0gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgdG9wIHBvc2l0aW9uIG9mIHRoZSBvdmVybGF5LiBDbGVhcnMgYW55IHByZXZpb3VzbHkgc2V0IHZlcnRpY2FsIHBvc2l0aW9uLlxuICAgKiBAcGFyYW0gdmFsdWUgTmV3IHRvcCBvZmZzZXQuXG4gICAqL1xuICB0b3AodmFsdWU6IHN0cmluZyA9ICcnKTogdGhpcyB7XG4gICAgdGhpcy5fYm90dG9tT2Zmc2V0ID0gJyc7XG4gICAgdGhpcy5fdG9wT2Zmc2V0ID0gdmFsdWU7XG4gICAgdGhpcy5fYWxpZ25JdGVtcyA9ICdmbGV4LXN0YXJ0JztcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBsZWZ0IHBvc2l0aW9uIG9mIHRoZSBvdmVybGF5LiBDbGVhcnMgYW55IHByZXZpb3VzbHkgc2V0IGhvcml6b250YWwgcG9zaXRpb24uXG4gICAqIEBwYXJhbSB2YWx1ZSBOZXcgbGVmdCBvZmZzZXQuXG4gICAqL1xuICBsZWZ0KHZhbHVlOiBzdHJpbmcgPSAnJyk6IHRoaXMge1xuICAgIHRoaXMuX3hPZmZzZXQgPSB2YWx1ZTtcbiAgICB0aGlzLl94UG9zaXRpb24gPSAnbGVmdCc7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgYm90dG9tIHBvc2l0aW9uIG9mIHRoZSBvdmVybGF5LiBDbGVhcnMgYW55IHByZXZpb3VzbHkgc2V0IHZlcnRpY2FsIHBvc2l0aW9uLlxuICAgKiBAcGFyYW0gdmFsdWUgTmV3IGJvdHRvbSBvZmZzZXQuXG4gICAqL1xuICBib3R0b20odmFsdWU6IHN0cmluZyA9ICcnKTogdGhpcyB7XG4gICAgdGhpcy5fdG9wT2Zmc2V0ID0gJyc7XG4gICAgdGhpcy5fYm90dG9tT2Zmc2V0ID0gdmFsdWU7XG4gICAgdGhpcy5fYWxpZ25JdGVtcyA9ICdmbGV4LWVuZCc7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgcmlnaHQgcG9zaXRpb24gb2YgdGhlIG92ZXJsYXkuIENsZWFycyBhbnkgcHJldmlvdXNseSBzZXQgaG9yaXpvbnRhbCBwb3NpdGlvbi5cbiAgICogQHBhcmFtIHZhbHVlIE5ldyByaWdodCBvZmZzZXQuXG4gICAqL1xuICByaWdodCh2YWx1ZTogc3RyaW5nID0gJycpOiB0aGlzIHtcbiAgICB0aGlzLl94T2Zmc2V0ID0gdmFsdWU7XG4gICAgdGhpcy5feFBvc2l0aW9uID0gJ3JpZ2h0JztcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBvdmVybGF5IHRvIHRoZSBzdGFydCBvZiB0aGUgdmlld3BvcnQsIGRlcGVuZGluZyBvbiB0aGUgb3ZlcmxheSBkaXJlY3Rpb24uXG4gICAqIFRoaXMgd2lsbCBiZSB0byB0aGUgbGVmdCBpbiBMVFIgbGF5b3V0cyBhbmQgdG8gdGhlIHJpZ2h0IGluIFJUTC5cbiAgICogQHBhcmFtIG9mZnNldCBPZmZzZXQgZnJvbSB0aGUgZWRnZSBvZiB0aGUgc2NyZWVuLlxuICAgKi9cbiAgc3RhcnQodmFsdWU6IHN0cmluZyA9ICcnKTogdGhpcyB7XG4gICAgdGhpcy5feE9mZnNldCA9IHZhbHVlO1xuICAgIHRoaXMuX3hQb3NpdGlvbiA9ICdzdGFydCc7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgb3ZlcmxheSB0byB0aGUgZW5kIG9mIHRoZSB2aWV3cG9ydCwgZGVwZW5kaW5nIG9uIHRoZSBvdmVybGF5IGRpcmVjdGlvbi5cbiAgICogVGhpcyB3aWxsIGJlIHRvIHRoZSByaWdodCBpbiBMVFIgbGF5b3V0cyBhbmQgdG8gdGhlIGxlZnQgaW4gUlRMLlxuICAgKiBAcGFyYW0gb2Zmc2V0IE9mZnNldCBmcm9tIHRoZSBlZGdlIG9mIHRoZSBzY3JlZW4uXG4gICAqL1xuICBlbmQodmFsdWU6IHN0cmluZyA9ICcnKTogdGhpcyB7XG4gICAgdGhpcy5feE9mZnNldCA9IHZhbHVlO1xuICAgIHRoaXMuX3hQb3NpdGlvbiA9ICdlbmQnO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIG92ZXJsYXkgd2lkdGggYW5kIGNsZWFycyBhbnkgcHJldmlvdXNseSBzZXQgd2lkdGguXG4gICAqIEBwYXJhbSB2YWx1ZSBOZXcgd2lkdGggZm9yIHRoZSBvdmVybGF5XG4gICAqIEBkZXByZWNhdGVkIFBhc3MgdGhlIGB3aWR0aGAgdGhyb3VnaCB0aGUgYE92ZXJsYXlDb25maWdgLlxuICAgKiBAYnJlYWtpbmctY2hhbmdlIDguMC4wXG4gICAqL1xuICB3aWR0aCh2YWx1ZTogc3RyaW5nID0gJycpOiB0aGlzIHtcbiAgICBpZiAodGhpcy5fb3ZlcmxheVJlZikge1xuICAgICAgdGhpcy5fb3ZlcmxheVJlZi51cGRhdGVTaXplKHt3aWR0aDogdmFsdWV9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fd2lkdGggPSB2YWx1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBvdmVybGF5IGhlaWdodCBhbmQgY2xlYXJzIGFueSBwcmV2aW91c2x5IHNldCBoZWlnaHQuXG4gICAqIEBwYXJhbSB2YWx1ZSBOZXcgaGVpZ2h0IGZvciB0aGUgb3ZlcmxheVxuICAgKiBAZGVwcmVjYXRlZCBQYXNzIHRoZSBgaGVpZ2h0YCB0aHJvdWdoIHRoZSBgT3ZlcmxheUNvbmZpZ2AuXG4gICAqIEBicmVha2luZy1jaGFuZ2UgOC4wLjBcbiAgICovXG4gIGhlaWdodCh2YWx1ZTogc3RyaW5nID0gJycpOiB0aGlzIHtcbiAgICBpZiAodGhpcy5fb3ZlcmxheVJlZikge1xuICAgICAgdGhpcy5fb3ZlcmxheVJlZi51cGRhdGVTaXplKHtoZWlnaHQ6IHZhbHVlfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2hlaWdodCA9IHZhbHVlO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIENlbnRlcnMgdGhlIG92ZXJsYXkgaG9yaXpvbnRhbGx5IHdpdGggYW4gb3B0aW9uYWwgb2Zmc2V0LlxuICAgKiBDbGVhcnMgYW55IHByZXZpb3VzbHkgc2V0IGhvcml6b250YWwgcG9zaXRpb24uXG4gICAqXG4gICAqIEBwYXJhbSBvZmZzZXQgT3ZlcmxheSBvZmZzZXQgZnJvbSB0aGUgaG9yaXpvbnRhbCBjZW50ZXIuXG4gICAqL1xuICBjZW50ZXJIb3Jpem9udGFsbHkob2Zmc2V0OiBzdHJpbmcgPSAnJyk6IHRoaXMge1xuICAgIHRoaXMubGVmdChvZmZzZXQpO1xuICAgIHRoaXMuX3hQb3NpdGlvbiA9ICdjZW50ZXInO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIENlbnRlcnMgdGhlIG92ZXJsYXkgdmVydGljYWxseSB3aXRoIGFuIG9wdGlvbmFsIG9mZnNldC5cbiAgICogQ2xlYXJzIGFueSBwcmV2aW91c2x5IHNldCB2ZXJ0aWNhbCBwb3NpdGlvbi5cbiAgICpcbiAgICogQHBhcmFtIG9mZnNldCBPdmVybGF5IG9mZnNldCBmcm9tIHRoZSB2ZXJ0aWNhbCBjZW50ZXIuXG4gICAqL1xuICBjZW50ZXJWZXJ0aWNhbGx5KG9mZnNldDogc3RyaW5nID0gJycpOiB0aGlzIHtcbiAgICB0aGlzLnRvcChvZmZzZXQpO1xuICAgIHRoaXMuX2FsaWduSXRlbXMgPSAnY2VudGVyJztcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBBcHBseSB0aGUgcG9zaXRpb24gdG8gdGhlIGVsZW1lbnQuXG4gICAqIEBkb2NzLXByaXZhdGVcbiAgICovXG4gIGFwcGx5KCk6IHZvaWQge1xuICAgIC8vIFNpbmNlIHRoZSBvdmVybGF5IHJlZiBhcHBsaWVzIHRoZSBzdHJhdGVneSBhc3luY2hyb25vdXNseSwgaXQgY291bGRcbiAgICAvLyBoYXZlIGJlZW4gZGlzcG9zZWQgYmVmb3JlIGl0IGVuZHMgdXAgYmVpbmcgYXBwbGllZC4gSWYgdGhhdCBpcyB0aGVcbiAgICAvLyBjYXNlLCB3ZSBzaG91bGRuJ3QgZG8gYW55dGhpbmcuXG4gICAgaWYgKCF0aGlzLl9vdmVybGF5UmVmIHx8ICF0aGlzLl9vdmVybGF5UmVmLmhhc0F0dGFjaGVkKCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBzdHlsZXMgPSB0aGlzLl9vdmVybGF5UmVmLm92ZXJsYXlFbGVtZW50LnN0eWxlO1xuICAgIGNvbnN0IHBhcmVudFN0eWxlcyA9IHRoaXMuX292ZXJsYXlSZWYuaG9zdEVsZW1lbnQuc3R5bGU7XG4gICAgY29uc3QgY29uZmlnID0gdGhpcy5fb3ZlcmxheVJlZi5nZXRDb25maWcoKTtcbiAgICBjb25zdCB7d2lkdGgsIGhlaWdodCwgbWF4V2lkdGgsIG1heEhlaWdodH0gPSBjb25maWc7XG4gICAgY29uc3Qgc2hvdWxkQmVGbHVzaEhvcml6b250YWxseSA9XG4gICAgICAod2lkdGggPT09ICcxMDAlJyB8fCB3aWR0aCA9PT0gJzEwMHZ3JykgJiZcbiAgICAgICghbWF4V2lkdGggfHwgbWF4V2lkdGggPT09ICcxMDAlJyB8fCBtYXhXaWR0aCA9PT0gJzEwMHZ3Jyk7XG4gICAgY29uc3Qgc2hvdWxkQmVGbHVzaFZlcnRpY2FsbHkgPVxuICAgICAgKGhlaWdodCA9PT0gJzEwMCUnIHx8IGhlaWdodCA9PT0gJzEwMHZoJykgJiZcbiAgICAgICghbWF4SGVpZ2h0IHx8IG1heEhlaWdodCA9PT0gJzEwMCUnIHx8IG1heEhlaWdodCA9PT0gJzEwMHZoJyk7XG4gICAgY29uc3QgeFBvc2l0aW9uID0gdGhpcy5feFBvc2l0aW9uO1xuICAgIGNvbnN0IHhPZmZzZXQgPSB0aGlzLl94T2Zmc2V0O1xuICAgIGNvbnN0IGlzUnRsID0gdGhpcy5fb3ZlcmxheVJlZi5nZXRDb25maWcoKS5kaXJlY3Rpb24gPT09ICdydGwnO1xuICAgIGxldCBtYXJnaW5MZWZ0ID0gJyc7XG4gICAgbGV0IG1hcmdpblJpZ2h0ID0gJyc7XG4gICAgbGV0IGp1c3RpZnlDb250ZW50ID0gJyc7XG5cbiAgICBpZiAoc2hvdWxkQmVGbHVzaEhvcml6b250YWxseSkge1xuICAgICAganVzdGlmeUNvbnRlbnQgPSAnZmxleC1zdGFydCc7XG4gICAgfSBlbHNlIGlmICh4UG9zaXRpb24gPT09ICdjZW50ZXInKSB7XG4gICAgICBqdXN0aWZ5Q29udGVudCA9ICdjZW50ZXInO1xuXG4gICAgICBpZiAoaXNSdGwpIHtcbiAgICAgICAgbWFyZ2luUmlnaHQgPSB4T2Zmc2V0O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbWFyZ2luTGVmdCA9IHhPZmZzZXQ7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChpc1J0bCkge1xuICAgICAgaWYgKHhQb3NpdGlvbiA9PT0gJ2xlZnQnIHx8IHhQb3NpdGlvbiA9PT0gJ2VuZCcpIHtcbiAgICAgICAganVzdGlmeUNvbnRlbnQgPSAnZmxleC1lbmQnO1xuICAgICAgICBtYXJnaW5MZWZ0ID0geE9mZnNldDtcbiAgICAgIH0gZWxzZSBpZiAoeFBvc2l0aW9uID09PSAncmlnaHQnIHx8IHhQb3NpdGlvbiA9PT0gJ3N0YXJ0Jykge1xuICAgICAgICBqdXN0aWZ5Q29udGVudCA9ICdmbGV4LXN0YXJ0JztcbiAgICAgICAgbWFyZ2luUmlnaHQgPSB4T2Zmc2V0O1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoeFBvc2l0aW9uID09PSAnbGVmdCcgfHwgeFBvc2l0aW9uID09PSAnc3RhcnQnKSB7XG4gICAgICBqdXN0aWZ5Q29udGVudCA9ICdmbGV4LXN0YXJ0JztcbiAgICAgIG1hcmdpbkxlZnQgPSB4T2Zmc2V0O1xuICAgIH0gZWxzZSBpZiAoeFBvc2l0aW9uID09PSAncmlnaHQnIHx8IHhQb3NpdGlvbiA9PT0gJ2VuZCcpIHtcbiAgICAgIGp1c3RpZnlDb250ZW50ID0gJ2ZsZXgtZW5kJztcbiAgICAgIG1hcmdpblJpZ2h0ID0geE9mZnNldDtcbiAgICB9XG5cbiAgICBzdHlsZXMucG9zaXRpb24gPSB0aGlzLl9jc3NQb3NpdGlvbjtcbiAgICBzdHlsZXMubWFyZ2luTGVmdCA9IHNob3VsZEJlRmx1c2hIb3Jpem9udGFsbHkgPyAnMCcgOiBtYXJnaW5MZWZ0O1xuICAgIHN0eWxlcy5tYXJnaW5Ub3AgPSBzaG91bGRCZUZsdXNoVmVydGljYWxseSA/ICcwJyA6IHRoaXMuX3RvcE9mZnNldDtcbiAgICBzdHlsZXMubWFyZ2luQm90dG9tID0gdGhpcy5fYm90dG9tT2Zmc2V0O1xuICAgIHN0eWxlcy5tYXJnaW5SaWdodCA9IHNob3VsZEJlRmx1c2hIb3Jpem9udGFsbHkgPyAnMCcgOiBtYXJnaW5SaWdodDtcbiAgICBwYXJlbnRTdHlsZXMuanVzdGlmeUNvbnRlbnQgPSBqdXN0aWZ5Q29udGVudDtcbiAgICBwYXJlbnRTdHlsZXMuYWxpZ25JdGVtcyA9IHNob3VsZEJlRmx1c2hWZXJ0aWNhbGx5ID8gJ2ZsZXgtc3RhcnQnIDogdGhpcy5fYWxpZ25JdGVtcztcbiAgfVxuXG4gIC8qKlxuICAgKiBDbGVhbnMgdXAgdGhlIERPTSBjaGFuZ2VzIGZyb20gdGhlIHBvc2l0aW9uIHN0cmF0ZWd5LlxuICAgKiBAZG9jcy1wcml2YXRlXG4gICAqL1xuICBkaXNwb3NlKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9pc0Rpc3Bvc2VkIHx8ICF0aGlzLl9vdmVybGF5UmVmKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qgc3R5bGVzID0gdGhpcy5fb3ZlcmxheVJlZi5vdmVybGF5RWxlbWVudC5zdHlsZTtcbiAgICBjb25zdCBwYXJlbnQgPSB0aGlzLl9vdmVybGF5UmVmLmhvc3RFbGVtZW50O1xuICAgIGNvbnN0IHBhcmVudFN0eWxlcyA9IHBhcmVudC5zdHlsZTtcblxuICAgIHBhcmVudC5jbGFzc0xpc3QucmVtb3ZlKHdyYXBwZXJDbGFzcyk7XG4gICAgcGFyZW50U3R5bGVzLmp1c3RpZnlDb250ZW50ID1cbiAgICAgIHBhcmVudFN0eWxlcy5hbGlnbkl0ZW1zID1cbiAgICAgIHN0eWxlcy5tYXJnaW5Ub3AgPVxuICAgICAgc3R5bGVzLm1hcmdpbkJvdHRvbSA9XG4gICAgICBzdHlsZXMubWFyZ2luTGVmdCA9XG4gICAgICBzdHlsZXMubWFyZ2luUmlnaHQgPVxuICAgICAgc3R5bGVzLnBvc2l0aW9uID1cbiAgICAgICAgJyc7XG5cbiAgICB0aGlzLl9vdmVybGF5UmVmID0gbnVsbCE7XG4gICAgdGhpcy5faXNEaXNwb3NlZCA9IHRydWU7XG4gIH1cbn1cbiJdfQ==