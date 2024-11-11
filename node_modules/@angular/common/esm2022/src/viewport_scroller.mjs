/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { inject, PLATFORM_ID, ɵɵdefineInjectable } from '@angular/core';
import { DOCUMENT } from './dom_tokens';
import { isPlatformBrowser } from './platform_id';
/**
 * Defines a scroll position manager. Implemented by `BrowserViewportScroller`.
 *
 * @publicApi
 */
export class ViewportScroller {
    // De-sugared tree-shakable injection
    // See #23917
    /** @nocollapse */
    static { this.ɵprov = ɵɵdefineInjectable({
        token: ViewportScroller,
        providedIn: 'root',
        factory: () => isPlatformBrowser(inject(PLATFORM_ID))
            ? new BrowserViewportScroller(inject(DOCUMENT), window)
            : new NullViewportScroller(),
    }); }
}
/**
 * Manages the scroll position for a browser window.
 */
export class BrowserViewportScroller {
    constructor(document, window) {
        this.document = document;
        this.window = window;
        this.offset = () => [0, 0];
    }
    /**
     * Configures the top offset used when scrolling to an anchor.
     * @param offset A position in screen coordinates (a tuple with x and y values)
     * or a function that returns the top offset position.
     *
     */
    setOffset(offset) {
        if (Array.isArray(offset)) {
            this.offset = () => offset;
        }
        else {
            this.offset = offset;
        }
    }
    /**
     * Retrieves the current scroll position.
     * @returns The position in screen coordinates.
     */
    getScrollPosition() {
        return [this.window.scrollX, this.window.scrollY];
    }
    /**
     * Sets the scroll position.
     * @param position The new position in screen coordinates.
     */
    scrollToPosition(position) {
        this.window.scrollTo(position[0], position[1]);
    }
    /**
     * Scrolls to an element and attempts to focus the element.
     *
     * Note that the function name here is misleading in that the target string may be an ID for a
     * non-anchor element.
     *
     * @param target The ID of an element or name of the anchor.
     *
     * @see https://html.spec.whatwg.org/#the-indicated-part-of-the-document
     * @see https://html.spec.whatwg.org/#scroll-to-fragid
     */
    scrollToAnchor(target) {
        const elSelected = findAnchorFromDocument(this.document, target);
        if (elSelected) {
            this.scrollToElement(elSelected);
            // After scrolling to the element, the spec dictates that we follow the focus steps for the
            // target. Rather than following the robust steps, simply attempt focus.
            //
            // @see https://html.spec.whatwg.org/#get-the-focusable-area
            // @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLOrForeignElement/focus
            // @see https://html.spec.whatwg.org/#focusable-area
            elSelected.focus();
        }
    }
    /**
     * Disables automatic scroll restoration provided by the browser.
     */
    setHistoryScrollRestoration(scrollRestoration) {
        this.window.history.scrollRestoration = scrollRestoration;
    }
    /**
     * Scrolls to an element using the native offset and the specified offset set on this scroller.
     *
     * The offset can be used when we know that there is a floating header and scrolling naively to an
     * element (ex: `scrollIntoView`) leaves the element hidden behind the floating header.
     */
    scrollToElement(el) {
        const rect = el.getBoundingClientRect();
        const left = rect.left + this.window.pageXOffset;
        const top = rect.top + this.window.pageYOffset;
        const offset = this.offset();
        this.window.scrollTo(left - offset[0], top - offset[1]);
    }
}
function findAnchorFromDocument(document, target) {
    const documentResult = document.getElementById(target) || document.getElementsByName(target)[0];
    if (documentResult) {
        return documentResult;
    }
    // `getElementById` and `getElementsByName` won't pierce through the shadow DOM so we
    // have to traverse the DOM manually and do the lookup through the shadow roots.
    if (typeof document.createTreeWalker === 'function' &&
        document.body &&
        typeof document.body.attachShadow === 'function') {
        const treeWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
        let currentNode = treeWalker.currentNode;
        while (currentNode) {
            const shadowRoot = currentNode.shadowRoot;
            if (shadowRoot) {
                // Note that `ShadowRoot` doesn't support `getElementsByName`
                // so we have to fall back to `querySelector`.
                const result = shadowRoot.getElementById(target) || shadowRoot.querySelector(`[name="${target}"]`);
                if (result) {
                    return result;
                }
            }
            currentNode = treeWalker.nextNode();
        }
    }
    return null;
}
/**
 * Provides an empty implementation of the viewport scroller.
 */
export class NullViewportScroller {
    /**
     * Empty implementation
     */
    setOffset(offset) { }
    /**
     * Empty implementation
     */
    getScrollPosition() {
        return [0, 0];
    }
    /**
     * Empty implementation
     */
    scrollToPosition(position) { }
    /**
     * Empty implementation
     */
    scrollToAnchor(anchor) { }
    /**
     * Empty implementation
     */
    setHistoryScrollRestoration(scrollRestoration) { }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld3BvcnRfc2Nyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL3ZpZXdwb3J0X3Njcm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxNQUFNLEVBQUUsV0FBVyxFQUFFLGtCQUFrQixFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRXRFLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFDdEMsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRWhEOzs7O0dBSUc7QUFDSCxNQUFNLE9BQWdCLGdCQUFnQjtJQUNwQyxxQ0FBcUM7SUFDckMsYUFBYTtJQUNiLGtCQUFrQjthQUNYLFVBQUssR0FBNkIsa0JBQWtCLENBQUM7UUFDMUQsS0FBSyxFQUFFLGdCQUFnQjtRQUN2QixVQUFVLEVBQUUsTUFBTTtRQUNsQixPQUFPLEVBQUUsR0FBRyxFQUFFLENBQ1osaUJBQWlCLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ3BDLENBQUMsQ0FBQyxJQUFJLHVCQUF1QixDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBRSxNQUFNLENBQUM7WUFDdkQsQ0FBQyxDQUFDLElBQUksb0JBQW9CLEVBQUU7S0FDakMsQ0FBQyxDQUFDOztBQW9DTDs7R0FFRztBQUNILE1BQU0sT0FBTyx1QkFBdUI7SUFHbEMsWUFDVSxRQUFrQixFQUNsQixNQUFjO1FBRGQsYUFBUSxHQUFSLFFBQVEsQ0FBVTtRQUNsQixXQUFNLEdBQU4sTUFBTSxDQUFRO1FBSmhCLFdBQU0sR0FBMkIsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFLbkQsQ0FBQztJQUVKOzs7OztPQUtHO0lBQ0gsU0FBUyxDQUFDLE1BQW1EO1FBQzNELElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxN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Z0JBQzlDLE1BQU0sTUFBTSxHQUNWLFVBQVUsQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLElBQUksVUFBVSxDQUFDLGFBQWEsQ0FBQyxVQUFVLE1BQU0sSUFBSSxDQUFDLENBQUM7Z0JBQ3RGLElBQUksTUFBTSxFQUFFLENBQUM7b0JBQ1gsT0FBTyxNQUFNLENBQUM7Z0JBQ2hCLENBQUM7WUFDSCxDQUFDO1lBRUQsV0FBVyxHQUFHLFVBQVUsQ0FBQyxRQUFRLEVBQXdCLENBQUM7UUFDNUQsQ0FBQztJQUNILENBQUM7SUFFRCxPQUFPLElBQUksQ0FBQztBQUNkLENBQUM7QUFFRDs7R0FFRztBQUNILE1BQU0sT0FBTyxvQkFBb0I7SUFDL0I7O09BRUc7SUFDSCxTQUFTLENBQUMsTUFBbUQsSUFBUyxDQUFDO0lBRXZFOztPQUVHO0lBQ0gsaUJBQWlCO1FBQ2YsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNoQixDQUFDO0lBRUQ7O09BRUc7SUFDSCxnQkFBZ0IsQ0FBQyxRQUEwQixJQUFTLENBQUM7SUFFckQ7O09BRUc7SUFDSCxjQUFjLENBQUMsTUFBYyxJQUFTLENBQUM7SUFFdkM7O09BRUc7SUFDSCwyQkFBMkIsQ0FBQyxpQkFBb0MsSUFBUyxDQUFDO0NBQzNFIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuZGV2L2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2luamVjdCwgUExBVEZPUk1fSUQsIMm1ybVkZWZpbmVJbmplY3RhYmxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtET0NVTUVOVH0gZnJvbSAnLi9kb21fdG9rZW5zJztcbmltcG9ydCB7aXNQbGF0Zm9ybUJyb3dzZXJ9IGZyb20gJy4vcGxhdGZvcm1faWQnO1xuXG4vKipcbiAqIERlZmluZXMgYSBzY3JvbGwgcG9zaXRpb24gbWFuYWdlci4gSW1wbGVtZW50ZWQgYnkgYEJyb3dzZXJWaWV3cG9ydFNjcm9sbGVyYC5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBWaWV3cG9ydFNjcm9sbGVyIHtcbiAgLy8gRGUtc3VnYXJlZCB0cmVlLXNoYWthYmxlIGluamVjdGlvblxuICAvLyBTZWUgIzIzOTE3XG4gIC8qKiBAbm9jb2xsYXBzZSAqL1xuICBzdGF0aWMgybVwcm92ID0gLyoqIEBwdXJlT3JCcmVha015Q29kZSAqLyDJtcm1ZGVmaW5lSW5qZWN0YWJsZSh7XG4gICAgdG9rZW46IFZpZXdwb3J0U2Nyb2xsZXIsXG4gICAgcHJvdmlkZWRJbjogJ3Jvb3QnLFxuICAgIGZhY3Rvcnk6ICgpID0+XG4gICAgICBpc1BsYXRmb3JtQnJvd3NlcihpbmplY3QoUExBVEZPUk1fSUQpKVxuICAgICAgICA/IG5ldyBCcm93c2VyVmlld3BvcnRTY3JvbGxlcihpbmplY3QoRE9DVU1FTlQpLCB3aW5kb3cpXG4gICAgICAgIDogbmV3IE51bGxWaWV3cG9ydFNjcm9sbGVyKCksXG4gIH0pO1xuXG4gIC8qKlxuICAgKiBDb25maWd1cmVzIHRoZSB0b3Agb2Zmc2V0IHVzZWQgd2hlbiBzY3JvbGxpbmcgdG8gYW4gYW5jaG9yLlxuICAgKiBAcGFyYW0gb2Zmc2V0IEEgcG9zaXRpb24gaW4gc2NyZWVuIGNvb3JkaW5hdGVzIChhIHR1cGxlIHdpdGggeCBhbmQgeSB2YWx1ZXMpXG4gICAqIG9yIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIHRoZSB0b3Agb2Zmc2V0IHBvc2l0aW9uLlxuICAgKlxuICAgKi9cbiAgYWJzdHJhY3Qgc2V0T2Zmc2V0KG9mZnNldDogW251bWJlciwgbnVtYmVyXSB8ICgoKSA9PiBbbnVtYmVyLCBudW1iZXJdKSk6IHZvaWQ7XG5cbiAgLyoqXG4gICAqIFJldHJpZXZlcyB0aGUgY3VycmVudCBzY3JvbGwgcG9zaXRpb24uXG4gICAqIEByZXR1cm5zIEEgcG9zaXRpb24gaW4gc2NyZWVuIGNvb3JkaW5hdGVzIChhIHR1cGxlIHdpdGggeCBhbmQgeSB2YWx1ZXMpLlxuICAgKi9cbiAgYWJzdHJhY3QgZ2V0U2Nyb2xsUG9zaXRpb24oKTogW251bWJlciwgbnVtYmVyXTtcblxuICAvKipcbiAgICogU2Nyb2xscyB0byBhIHNwZWNpZmllZCBwb3NpdGlvbi5cbiAgICogQHBhcmFtIHBvc2l0aW9uIEEgcG9zaXRpb24gaW4gc2NyZWVuIGNvb3JkaW5hdGVzIChhIHR1cGxlIHdpdGggeCBhbmQgeSB2YWx1ZXMpLlxuICAgKi9cbiAgYWJzdHJhY3Qgc2Nyb2xsVG9Qb3NpdGlvbihwb3NpdGlvbjogW251bWJlciwgbnVtYmVyXSk6IHZvaWQ7XG5cbiAgLyoqXG4gICAqIFNjcm9sbHMgdG8gYW4gYW5jaG9yIGVsZW1lbnQuXG4gICAqIEBwYXJhbSBhbmNob3IgVGhlIElEIG9mIHRoZSBhbmNob3IgZWxlbWVudC5cbiAgICovXG4gIGFic3RyYWN0IHNjcm9sbFRvQW5jaG9yKGFuY2hvcjogc3RyaW5nKTogdm9pZDtcblxuICAvKipcbiAgICogRGlzYWJsZXMgYXV0b21hdGljIHNjcm9sbCByZXN0b3JhdGlvbiBwcm92aWRlZCBieSB0aGUgYnJvd3Nlci5cbiAgICogU2VlIGFsc28gW3dpbmRvdy5oaXN0b3J5LnNjcm9sbFJlc3RvcmF0aW9uXG4gICAqIGluZm9dKGh0dHBzOi8vZGV2ZWxvcGVycy5nb29nbGUuY29tL3dlYi91cGRhdGVzLzIwMTUvMDkvaGlzdG9yeS1hcGktc2Nyb2xsLXJlc3RvcmF0aW9uKS5cbiAgICovXG4gIGFic3RyYWN0IHNldEhpc3RvcnlTY3JvbGxSZXN0b3JhdGlvbihzY3JvbGxSZXN0b3JhdGlvbjogJ2F1dG8nIHwgJ21hbnVhbCcpOiB2b2lkO1xufVxuXG4vKipcbiAqIE1hbmFnZXMgdGhlIHNjcm9sbCBwb3NpdGlvbiBmb3IgYSBicm93c2VyIHdpbmRvdy5cbiAqL1xuZXhwb3J0IGNsYXNzIEJyb3dzZXJWaWV3cG9ydFNjcm9sbGVyIGltcGxlbWVudHMgVmlld3BvcnRTY3JvbGxlciB7XG4gIHByaXZhdGUgb2Zmc2V0OiAoKSA9PiBbbnVtYmVyLCBudW1iZXJdID0gKCkgPT4gWzAsIDBdO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgZG9jdW1lbnQ6IERvY3VtZW50LFxuICAgIHByaXZhdGUgd2luZG93OiBXaW5kb3csXG4gICkge31cblxuICAvKipcbiAgICogQ29uZmlndXJlcyB0aGUgdG9wIG9mZnNldCB1c2VkIHdoZW4gc2Nyb2xsaW5nIHRvIGFuIGFuY2hvci5cbiAgICogQHBhcmFtIG9mZnNldCBBIHBvc2l0aW9uIGluIHNjcmVlbiBjb29yZGluYXRlcyAoYSB0dXBsZSB3aXRoIHggYW5kIHkgdmFsdWVzKVxuICAgKiBvciBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0aGUgdG9wIG9mZnNldCBwb3NpdGlvbi5cbiAgICpcbiAgICovXG4gIHNldE9mZnNldChvZmZzZXQ6IFtudW1iZXIsIG51bWJlcl0gfCAoKCkgPT4gW251bWJlciwgbnVtYmVyXSkpOiB2b2lkIHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShvZmZzZXQpKSB7XG4gICAgICB0aGlzLm9mZnNldCA9ICgpID0+IG9mZnNldDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5vZmZzZXQgPSBvZmZzZXQ7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHJpZXZlcyB0aGUgY3VycmVudCBzY3JvbGwgcG9zaXRpb24uXG4gICAqIEByZXR1cm5zIFRoZSBwb3NpdGlvbiBpbiBzY3JlZW4gY29vcmRpbmF0ZXMuXG4gICAqL1xuICBnZXRTY3JvbGxQb3NpdGlvbigpOiBbbnVtYmVyLCBudW1iZXJdIHtcbiAgICByZXR1cm4gW3RoaXMud2luZG93LnNjcm9sbFgsIHRoaXMud2luZG93LnNjcm9sbFldO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHNjcm9sbCBwb3NpdGlvbi5cbiAgICogQHBhcmFtIHBvc2l0aW9uIFRoZSBuZXcgcG9zaXRpb24gaW4gc2NyZWVuIGNvb3JkaW5hdGVzLlxuICAgKi9cbiAgc2Nyb2xsVG9Qb3NpdGlvbihwb3NpdGlvbjogW251bWJlciwgbnVtYmVyXSk6IHZvaWQge1xuICAgIHRoaXMud2luZG93LnNjcm9sbFRvKHBvc2l0aW9uWzBdLCBwb3NpdGlvblsxXSk7XG4gIH1cblxuICAvKipcbiAgICogU2Nyb2xscyB0byBhbiBlbGVtZW50IGFuZCBhdHRlbXB0cyB0byBmb2N1cyB0aGUgZWxlbWVudC5cbiAgICpcbiAgICogTm90ZSB0aGF0IHRoZSBmdW5jdGlvbiBuYW1lIGhlcmUgaXMgbWlzbGVhZGluZyBpbiB0aGF0IHRoZSB0YXJnZXQgc3RyaW5nIG1heSBiZSBhbiBJRCBmb3IgYVxuICAgKiBub24tYW5jaG9yIGVsZW1lbnQuXG4gICAqXG4gICAqIEBwYXJhbSB0YXJnZXQgVGhlIElEIG9mIGFuIGVsZW1lbnQgb3IgbmFtZSBvZiB0aGUgYW5jaG9yLlxuICAgKlxuICAgKiBAc2VlIGh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvI3RoZS1pbmRpY2F0ZWQtcGFydC1vZi10aGUtZG9jdW1lbnRcbiAgICogQHNlZSBodHRwczovL2h0bWwuc3BlYy53aGF0d2cub3JnLyNzY3JvbGwtdG8tZnJhZ2lkXG4gICAqL1xuICBzY3JvbGxUb0FuY2hvcih0YXJnZXQ6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IGVsU2VsZWN0ZWQgPSBmaW5kQW5jaG9yRnJvbURvY3VtZW50KHRoaXMuZG9jdW1lbnQsIHRhcmdldCk7XG5cbiAgICBpZiAoZWxTZWxlY3RlZCkge1xuICAgICAgdGhpcy5zY3JvbGxUb0VsZW1lbnQoZWxTZWxlY3RlZCk7XG4gICAgICAvLyBBZnRlciBzY3JvbGxpbmcgdG8gdGhlIGVsZW1lbnQsIHRoZSBzcGVjIGRpY3RhdGVzIHRoYXQgd2UgZm9sbG93IHRoZSBmb2N1cyBzdGVwcyBmb3IgdGhlXG4gICAgICAvLyB0YXJnZXQuIFJhdGhlciB0aGFuIGZvbGxvd2luZyB0aGUgcm9idXN0IHN0ZXBzLCBzaW1wbHkgYXR0ZW1wdCBmb2N1cy5cbiAgICAgIC8vXG4gICAgICAvLyBAc2VlIGh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvI2dldC10aGUtZm9jdXNhYmxlLWFyZWFcbiAgICAgIC8vIEBzZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0hUTUxPckZvcmVpZ25FbGVtZW50L2ZvY3VzXG4gICAgICAvLyBAc2VlIGh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvI2ZvY3VzYWJsZS1hcmVhXG4gICAgICBlbFNlbGVjdGVkLmZvY3VzKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIERpc2FibGVzIGF1dG9tYXRpYyBzY3JvbGwgcmVzdG9yYXRpb24gcHJvdmlkZWQgYnkgdGhlIGJyb3dzZXIuXG4gICAqL1xuICBzZXRIaXN0b3J5U2Nyb2xsUmVzdG9yYXRpb24oc2Nyb2xsUmVzdG9yYXRpb246ICdhdXRvJyB8ICdtYW51YWwnKTogdm9pZCB7XG4gICAgdGhpcy53aW5kb3cuaGlzdG9yeS5zY3JvbGxSZXN0b3JhdGlvbiA9IHNjcm9sbFJlc3RvcmF0aW9uO1xuICB9XG5cbiAgLyoqXG4gICAqIFNjcm9sbHMgdG8gYW4gZWxlbWVudCB1c2luZyB0aGUgbmF0aXZlIG9mZnNldCBhbmQgdGhlIHNwZWNpZmllZCBvZmZzZXQgc2V0IG9uIHRoaXMgc2Nyb2xsZXIuXG4gICAqXG4gICAqIFRoZSBvZmZzZXQgY2FuIGJlIHVzZWQgd2hlbiB3ZSBrbm93IHRoYXQgdGhlcmUgaXMgYSBmbG9hdGluZyBoZWFkZXIgYW5kIHNjcm9sbGluZyBuYWl2ZWx5IHRvIGFuXG4gICAqIGVsZW1lbnQgKGV4OiBgc2Nyb2xsSW50b1ZpZXdgKSBsZWF2ZXMgdGhlIGVsZW1lbnQgaGlkZGVuIGJlaGluZCB0aGUgZmxvYXRpbmcgaGVhZGVyLlxuICAgKi9cbiAgcHJpdmF0ZSBzY3JvbGxUb0VsZW1lbnQoZWw6IEhUTUxFbGVtZW50KTogdm9pZCB7XG4gICAgY29uc3QgcmVjdCA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIGNvbnN0IGxlZnQgPSByZWN0LmxlZnQgKyB0aGlzLndpbmRvdy5wYWdlWE9mZnNldDtcbiAgICBjb25zdCB0b3AgPSByZWN0LnRvcCArIHRoaXMud2luZG93LnBhZ2VZT2Zmc2V0O1xuICAgIGNvbnN0IG9mZnNldCA9IHRoaXMub2Zmc2V0KCk7XG4gICAgdGhpcy53aW5kb3cuc2Nyb2xsVG8obGVmdCAtIG9mZnNldFswXSwgdG9wIC0gb2Zmc2V0WzFdKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBmaW5kQW5jaG9yRnJvbURvY3VtZW50KGRvY3VtZW50OiBEb2N1bWVudCwgdGFyZ2V0OiBzdHJpbmcpOiBIVE1MRWxlbWVudCB8IG51bGwge1xuICBjb25zdCBkb2N1bWVudFJlc3VsdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRhcmdldCkgfHwgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeU5hbWUodGFyZ2V0KVswXTtcblxuICBpZiAoZG9jdW1lbnRSZXN1bHQpIHtcbiAgICByZXR1cm4gZG9jdW1lbnRSZXN1bHQ7XG4gIH1cblxuICAvLyBgZ2V0RWxlbWVudEJ5SWRgIGFuZCBgZ2V0RWxlbWVudHNCeU5hbWVgIHdvbid0IHBpZXJjZSB0aHJvdWdoIHRoZSBzaGFkb3cgRE9NIHNvIHdlXG4gIC8vIGhhdmUgdG8gdHJhdmVyc2UgdGhlIERPTSBtYW51YWxseSBhbmQgZG8gdGhlIGxvb2t1cCB0aHJvdWdoIHRoZSBzaGFkb3cgcm9vdHMuXG4gIGlmIChcbiAgICB0eXBlb2YgZG9jdW1lbnQuY3JlYXRlVHJlZVdhbGtlciA9PT0gJ2Z1bmN0aW9uJyAmJlxuICAgIGRvY3VtZW50LmJvZHkgJiZcbiAgICB0eXBlb2YgZG9jdW1lbnQuYm9keS5hdHRhY2hTaGFkb3cgPT09ICdmdW5jdGlvbidcbiAgKSB7XG4gICAgY29uc3QgdHJlZVdhbGtlciA9IGRvY3VtZW50LmNyZWF0ZVRyZWVXYWxrZXIoZG9jdW1lbnQuYm9keSwgTm9kZUZpbHRlci5TSE9XX0VMRU1FTlQpO1xuICAgIGxldCBjdXJyZW50Tm9kZSA9IHRyZWVXYWxrZXIuY3VycmVudE5vZGUgYXMgSFRNTEVsZW1lbnQgfCBudWxsO1xuXG4gICAgd2hpbGUgKGN1cnJlbnROb2RlKSB7XG4gICAgICBjb25zdCBzaGFkb3dSb290ID0gY3VycmVudE5vZGUuc2hhZG93Um9vdDtcblxuICAgICAgaWYgKHNoYWRvd1Jvb3QpIHtcbiAgICAgICAgLy8gTm90ZSB0aGF0IGBTaGFkb3dSb290YCBkb2Vzbid0IHN1cHBvcnQgYGdldEVsZW1lbnRzQnlOYW1lYFxuICAgICAgICAvLyBzbyB3ZSBoYXZlIHRvIGZhbGwgYmFjayB0byBgcXVlcnlTZWxlY3RvcmAuXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9XG4gICAgICAgICAgc2hhZG93Um9vdC5nZXRFbGVtZW50QnlJZCh0YXJnZXQpIHx8IHNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcihgW25hbWU9XCIke3RhcmdldH1cIl1gKTtcbiAgICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgY3VycmVudE5vZGUgPSB0cmVlV2Fsa2VyLm5leHROb2RlKCkgYXMgSFRNTEVsZW1lbnQgfCBudWxsO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBudWxsO1xufVxuXG4vKipcbiAqIFByb3ZpZGVzIGFuIGVtcHR5IGltcGxlbWVudGF0aW9uIG9mIHRoZSB2aWV3cG9ydCBzY3JvbGxlci5cbiAqL1xuZXhwb3J0IGNsYXNzIE51bGxWaWV3cG9ydFNjcm9sbGVyIGltcGxlbWVudHMgVmlld3BvcnRTY3JvbGxlciB7XG4gIC8qKlxuICAgKiBFbXB0eSBpbXBsZW1lbnRhdGlvblxuICAgKi9cbiAgc2V0T2Zmc2V0KG9mZnNldDogW251bWJlciwgbnVtYmVyXSB8ICgoKSA9PiBbbnVtYmVyLCBudW1iZXJdKSk6IHZvaWQge31cblxuICAvKipcbiAgICogRW1wdHkgaW1wbGVtZW50YXRpb25cbiAgICovXG4gIGdldFNjcm9sbFBvc2l0aW9uKCk6IFtudW1iZXIsIG51bWJlcl0ge1xuICAgIHJldHVybiBbMCwgMF07XG4gIH1cblxuICAvKipcbiAgICogRW1wdHkgaW1wbGVtZW50YXRpb25cbiAgICovXG4gIHNjcm9sbFRvUG9zaXRpb24ocG9zaXRpb246IFtudW1iZXIsIG51bWJlcl0pOiB2b2lkIHt9XG5cbiAgLyoqXG4gICAqIEVtcHR5IGltcGxlbWVudGF0aW9uXG4gICAqL1xuICBzY3JvbGxUb0FuY2hvcihhbmNob3I6IHN0cmluZyk6IHZvaWQge31cblxuICAvKipcbiAgICogRW1wdHkgaW1wbGVtZW50YXRpb25cbiAgICovXG4gIHNldEhpc3RvcnlTY3JvbGxSZXN0b3JhdGlvbihzY3JvbGxSZXN0b3JhdGlvbjogJ2F1dG8nIHwgJ21hbnVhbCcpOiB2b2lkIHt9XG59XG4iXX0=