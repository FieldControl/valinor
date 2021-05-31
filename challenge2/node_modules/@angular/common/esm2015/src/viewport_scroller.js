/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ɵɵdefineInjectable, ɵɵinject } from '@angular/core';
import { DOCUMENT } from './dom_tokens';
/**
 * Defines a scroll position manager. Implemented by `BrowserViewportScroller`.
 *
 * @publicApi
 */
export class ViewportScroller {
}
// De-sugared tree-shakable injection
// See #23917
/** @nocollapse */
ViewportScroller.ɵprov = ɵɵdefineInjectable({
    token: ViewportScroller,
    providedIn: 'root',
    factory: () => new BrowserViewportScroller(ɵɵinject(DOCUMENT), window)
});
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
        if (this.supportsScrolling()) {
            return [this.window.pageXOffset, this.window.pageYOffset];
        }
        else {
            return [0, 0];
        }
    }
    /**
     * Sets the scroll position.
     * @param position The new position in screen coordinates.
     */
    scrollToPosition(position) {
        if (this.supportsScrolling()) {
            this.window.scrollTo(position[0], position[1]);
        }
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
        if (!this.supportsScrolling()) {
            return;
        }
        // TODO(atscott): The correct behavior for `getElementsByName` would be to also verify that the
        // element is an anchor. However, this could be considered a breaking change and should be
        // done in a major version.
        const elSelected = findAnchorFromDocument(this.document, target);
        if (elSelected) {
            this.scrollToElement(elSelected);
            // After scrolling to the element, the spec dictates that we follow the focus steps for the
            // target. Rather than following the robust steps, simply attempt focus.
            this.attemptFocus(elSelected);
        }
    }
    /**
     * Disables automatic scroll restoration provided by the browser.
     */
    setHistoryScrollRestoration(scrollRestoration) {
        if (this.supportScrollRestoration()) {
            const history = this.window.history;
            if (history && history.scrollRestoration) {
                history.scrollRestoration = scrollRestoration;
            }
        }
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
    /**
     * Calls `focus` on the `focusTarget` and returns `true` if the element was focused successfully.
     *
     * If `false`, further steps may be necessary to determine a valid substitute to be focused
     * instead.
     *
     * @see https://html.spec.whatwg.org/#get-the-focusable-area
     * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLOrForeignElement/focus
     * @see https://html.spec.whatwg.org/#focusable-area
     */
    attemptFocus(focusTarget) {
        focusTarget.focus();
        return this.document.activeElement === focusTarget;
    }
    /**
     * We only support scroll restoration when we can get a hold of window.
     * This means that we do not support this behavior when running in a web worker.
     *
     * Lifting this restriction right now would require more changes in the dom adapter.
     * Since webworkers aren't widely used, we will lift it once RouterScroller is
     * battle-tested.
     */
    supportScrollRestoration() {
        try {
            if (!this.supportsScrolling()) {
                return false;
            }
            // The `scrollRestoration` property could be on the `history` instance or its prototype.
            const scrollRestorationDescriptor = getScrollRestorationProperty(this.window.history) ||
                getScrollRestorationProperty(Object.getPrototypeOf(this.window.history));
            // We can write to the `scrollRestoration` property if it is a writable data field or it has a
            // setter function.
            return !!scrollRestorationDescriptor &&
                !!(scrollRestorationDescriptor.writable || scrollRestorationDescriptor.set);
        }
        catch (_a) {
            return false;
        }
    }
    supportsScrolling() {
        try {
            return !!this.window && !!this.window.scrollTo && 'pageXOffset' in this.window;
        }
        catch (_a) {
            return false;
        }
    }
}
function getScrollRestorationProperty(obj) {
    return Object.getOwnPropertyDescriptor(obj, 'scrollRestoration');
}
function findAnchorFromDocument(document, target) {
    const documentResult = document.getElementById(target) || document.getElementsByName(target)[0];
    if (documentResult) {
        return documentResult;
    }
    // `getElementById` and `getElementsByName` won't pierce through the shadow DOM so we
    // have to traverse the DOM manually and do the lookup through the shadow roots.
    if (typeof document.createTreeWalker === 'function' && document.body &&
        (document.body.createShadowRoot || document.body.attachShadow)) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld3BvcnRfc2Nyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL3ZpZXdwb3J0X3Njcm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxrQkFBa0IsRUFBRSxRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFM0QsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGNBQWMsQ0FBQztBQUl0Qzs7OztHQUlHO0FBQ0gsTUFBTSxPQUFnQixnQkFBZ0I7O0FBQ3BDLHFDQUFxQztBQUNyQyxhQUFhO0FBQ2Isa0JBQWtCO0FBQ1gsc0JBQUssR0FBNkIsa0JBQWtCLENBQUM7SUFDMUQsS0FBSyxFQUFFLGdCQUFnQjtJQUN2QixVQUFVLEVBQUUsTUFBTTtJQUNsQixPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSx1QkFBdUIsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEVBQUUsTUFBTSxDQUFDO0NBQ3ZFLENBQUMsQ0FBQztBQW9DTDs7R0FFRztBQUNILE1BQU0sT0FBTyx1QkFBdUI7SUFHbEMsWUFBb0IsUUFBa0IsRUFBVSxNQUFjO1FBQTFDLGFBQVEsR0FBUixRQUFRLENBQVU7UUFBVSxXQUFNLEdBQU4sTUFBTSxDQUFRO1FBRnRELFdBQU0sR0FBMkIsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFFVyxDQUFDO0lBRWxFOzs7OztPQUtHO0lBQ0gsU0FBUyxDQUFDLE1BQWlEO1FBQ3pELElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUN6QixJQUFJLENBQUMsTUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQztTQUM1QjthQUFNO1lBQ0wsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7U0FDdEI7SUFDSCxDQUFDO0lBRUQ7OztPQUdH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LE9BQU8sV0FBVyxFQUFFO1lBQ2xCLE1BQU0sVUFBVSxHQUFHLFdBQVcsQ0FBQyxVQUFVLENBQUM7WUFFMUMsSUFBSSxVQUFVLEVBQUU7Z0JBQ2QsNkRBQTZEO2dCQUM3RCw4Q0FBOEM7Z0JBQzlDLE1BQU0sTUFBTSxHQUNSLFVBQVUsQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLElBQUksVUFBVSxDQUFDLGFBQWEsQ0FBQyxVQUFVLE1BQU0sSUFBSSxDQUFDLENBQUM7Z0JBQ3hGLElBQUksTUFBTSxFQUFFO29CQUNWLE9BQU8sTUFBTSxDQUFDO2lCQUNmO2FBQ0Y7WUFFRCxXQUFXLEdBQUcsVUFBVSxDQUFDLFFBQVEsRUFBd0IsQ0FBQztTQUMzRDtLQUNGO0lBRUQsT0FBTyxJQUFJLENBQUM7QUFDZCxDQUFDO0FBRUQ7O0dBRUc7QUFDSCxNQUFNLE9BQU8sb0JBQW9CO0lBQy9COztPQUVHO0lBQ0gsU0FBUyxDQUFDLE1BQWlELElBQVMsQ0FBQztJQUVyRTs7T0FFRztJQUNILGlCQUFpQjtRQUNmLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDaEIsQ0FBQztJQUVEOztPQUVHO0lBQ0gsZ0JBQWdCLENBQUMsUUFBMEIsSUFBUyxDQUFDO0lBRXJEOztPQUVHO0lBQ0gsY0FBYyxDQUFDLE1BQWMsSUFBUyxDQUFDO0lBRXZDOztPQUVHO0lBQ0gsMkJBQTJCLENBQUMsaUJBQWtDLElBQVMsQ0FBQztDQUN6RSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge8m1ybVkZWZpbmVJbmplY3RhYmxlLCDJtcm1aW5qZWN0fSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtET0NVTUVOVH0gZnJvbSAnLi9kb21fdG9rZW5zJztcblxuXG5cbi8qKlxuICogRGVmaW5lcyBhIHNjcm9sbCBwb3NpdGlvbiBtYW5hZ2VyLiBJbXBsZW1lbnRlZCBieSBgQnJvd3NlclZpZXdwb3J0U2Nyb2xsZXJgLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFZpZXdwb3J0U2Nyb2xsZXIge1xuICAvLyBEZS1zdWdhcmVkIHRyZWUtc2hha2FibGUgaW5qZWN0aW9uXG4gIC8vIFNlZSAjMjM5MTdcbiAgLyoqIEBub2NvbGxhcHNlICovXG4gIHN0YXRpYyDJtXByb3YgPSAvKiogQHB1cmVPckJyZWFrTXlDb2RlICovIMm1ybVkZWZpbmVJbmplY3RhYmxlKHtcbiAgICB0b2tlbjogVmlld3BvcnRTY3JvbGxlcixcbiAgICBwcm92aWRlZEluOiAncm9vdCcsXG4gICAgZmFjdG9yeTogKCkgPT4gbmV3IEJyb3dzZXJWaWV3cG9ydFNjcm9sbGVyKMm1ybVpbmplY3QoRE9DVU1FTlQpLCB3aW5kb3cpXG4gIH0pO1xuXG4gIC8qKlxuICAgKiBDb25maWd1cmVzIHRoZSB0b3Agb2Zmc2V0IHVzZWQgd2hlbiBzY3JvbGxpbmcgdG8gYW4gYW5jaG9yLlxuICAgKiBAcGFyYW0gb2Zmc2V0IEEgcG9zaXRpb24gaW4gc2NyZWVuIGNvb3JkaW5hdGVzIChhIHR1cGxlIHdpdGggeCBhbmQgeSB2YWx1ZXMpXG4gICAqIG9yIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIHRoZSB0b3Agb2Zmc2V0IHBvc2l0aW9uLlxuICAgKlxuICAgKi9cbiAgYWJzdHJhY3Qgc2V0T2Zmc2V0KG9mZnNldDogW251bWJlciwgbnVtYmVyXXwoKCkgPT4gW251bWJlciwgbnVtYmVyXSkpOiB2b2lkO1xuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZXMgdGhlIGN1cnJlbnQgc2Nyb2xsIHBvc2l0aW9uLlxuICAgKiBAcmV0dXJucyBBIHBvc2l0aW9uIGluIHNjcmVlbiBjb29yZGluYXRlcyAoYSB0dXBsZSB3aXRoIHggYW5kIHkgdmFsdWVzKS5cbiAgICovXG4gIGFic3RyYWN0IGdldFNjcm9sbFBvc2l0aW9uKCk6IFtudW1iZXIsIG51bWJlcl07XG5cbiAgLyoqXG4gICAqIFNjcm9sbHMgdG8gYSBzcGVjaWZpZWQgcG9zaXRpb24uXG4gICAqIEBwYXJhbSBwb3NpdGlvbiBBIHBvc2l0aW9uIGluIHNjcmVlbiBjb29yZGluYXRlcyAoYSB0dXBsZSB3aXRoIHggYW5kIHkgdmFsdWVzKS5cbiAgICovXG4gIGFic3RyYWN0IHNjcm9sbFRvUG9zaXRpb24ocG9zaXRpb246IFtudW1iZXIsIG51bWJlcl0pOiB2b2lkO1xuXG4gIC8qKlxuICAgKiBTY3JvbGxzIHRvIGFuIGFuY2hvciBlbGVtZW50LlxuICAgKiBAcGFyYW0gYW5jaG9yIFRoZSBJRCBvZiB0aGUgYW5jaG9yIGVsZW1lbnQuXG4gICAqL1xuICBhYnN0cmFjdCBzY3JvbGxUb0FuY2hvcihhbmNob3I6IHN0cmluZyk6IHZvaWQ7XG5cbiAgLyoqXG4gICAqIERpc2FibGVzIGF1dG9tYXRpYyBzY3JvbGwgcmVzdG9yYXRpb24gcHJvdmlkZWQgYnkgdGhlIGJyb3dzZXIuXG4gICAqIFNlZSBhbHNvIFt3aW5kb3cuaGlzdG9yeS5zY3JvbGxSZXN0b3JhdGlvblxuICAgKiBpbmZvXShodHRwczovL2RldmVsb3BlcnMuZ29vZ2xlLmNvbS93ZWIvdXBkYXRlcy8yMDE1LzA5L2hpc3RvcnktYXBpLXNjcm9sbC1yZXN0b3JhdGlvbikuXG4gICAqL1xuICBhYnN0cmFjdCBzZXRIaXN0b3J5U2Nyb2xsUmVzdG9yYXRpb24oc2Nyb2xsUmVzdG9yYXRpb246ICdhdXRvJ3wnbWFudWFsJyk6IHZvaWQ7XG59XG5cbi8qKlxuICogTWFuYWdlcyB0aGUgc2Nyb2xsIHBvc2l0aW9uIGZvciBhIGJyb3dzZXIgd2luZG93LlxuICovXG5leHBvcnQgY2xhc3MgQnJvd3NlclZpZXdwb3J0U2Nyb2xsZXIgaW1wbGVtZW50cyBWaWV3cG9ydFNjcm9sbGVyIHtcbiAgcHJpdmF0ZSBvZmZzZXQ6ICgpID0+IFtudW1iZXIsIG51bWJlcl0gPSAoKSA9PiBbMCwgMF07XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBkb2N1bWVudDogRG9jdW1lbnQsIHByaXZhdGUgd2luZG93OiBXaW5kb3cpIHt9XG5cbiAgLyoqXG4gICAqIENvbmZpZ3VyZXMgdGhlIHRvcCBvZmZzZXQgdXNlZCB3aGVuIHNjcm9sbGluZyB0byBhbiBhbmNob3IuXG4gICAqIEBwYXJhbSBvZmZzZXQgQSBwb3NpdGlvbiBpbiBzY3JlZW4gY29vcmRpbmF0ZXMgKGEgdHVwbGUgd2l0aCB4IGFuZCB5IHZhbHVlcylcbiAgICogb3IgYSBmdW5jdGlvbiB0aGF0IHJldHVybnMgdGhlIHRvcCBvZmZzZXQgcG9zaXRpb24uXG4gICAqXG4gICAqL1xuICBzZXRPZmZzZXQob2Zmc2V0OiBbbnVtYmVyLCBudW1iZXJdfCgoKSA9PiBbbnVtYmVyLCBudW1iZXJdKSk6IHZvaWQge1xuICAgIGlmIChBcnJheS5pc0FycmF5KG9mZnNldCkpIHtcbiAgICAgIHRoaXMub2Zmc2V0ID0gKCkgPT4gb2Zmc2V0O1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm9mZnNldCA9IG9mZnNldDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmV0cmlldmVzIHRoZSBjdXJyZW50IHNjcm9sbCBwb3NpdGlvbi5cbiAgICogQHJldHVybnMgVGhlIHBvc2l0aW9uIGluIHNjcmVlbiBjb29yZGluYXRlcy5cbiAgICovXG4gIGdldFNjcm9sbFBvc2l0aW9uKCk6IFtudW1iZXIsIG51bWJlcl0ge1xuICAgIGlmICh0aGlzLnN1cHBvcnRzU2Nyb2xsaW5nKCkpIHtcbiAgICAgIHJldHVybiBbdGhpcy53aW5kb3cucGFnZVhPZmZzZXQsIHRoaXMud2luZG93LnBhZ2VZT2Zmc2V0XTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIFswLCAwXTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgc2Nyb2xsIHBvc2l0aW9uLlxuICAgKiBAcGFyYW0gcG9zaXRpb24gVGhlIG5ldyBwb3NpdGlvbiBpbiBzY3JlZW4gY29vcmRpbmF0ZXMuXG4gICAqL1xuICBzY3JvbGxUb1Bvc2l0aW9uKHBvc2l0aW9uOiBbbnVtYmVyLCBudW1iZXJdKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuc3VwcG9ydHNTY3JvbGxpbmcoKSkge1xuICAgICAgdGhpcy53aW5kb3cuc2Nyb2xsVG8ocG9zaXRpb25bMF0sIHBvc2l0aW9uWzFdKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2Nyb2xscyB0byBhbiBlbGVtZW50IGFuZCBhdHRlbXB0cyB0byBmb2N1cyB0aGUgZWxlbWVudC5cbiAgICpcbiAgICogTm90ZSB0aGF0IHRoZSBmdW5jdGlvbiBuYW1lIGhlcmUgaXMgbWlzbGVhZGluZyBpbiB0aGF0IHRoZSB0YXJnZXQgc3RyaW5nIG1heSBiZSBhbiBJRCBmb3IgYVxuICAgKiBub24tYW5jaG9yIGVsZW1lbnQuXG4gICAqXG4gICAqIEBwYXJhbSB0YXJnZXQgVGhlIElEIG9mIGFuIGVsZW1lbnQgb3IgbmFtZSBvZiB0aGUgYW5jaG9yLlxuICAgKlxuICAgKiBAc2VlIGh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvI3RoZS1pbmRpY2F0ZWQtcGFydC1vZi10aGUtZG9jdW1lbnRcbiAgICogQHNlZSBodHRwczovL2h0bWwuc3BlYy53aGF0d2cub3JnLyNzY3JvbGwtdG8tZnJhZ2lkXG4gICAqL1xuICBzY3JvbGxUb0FuY2hvcih0YXJnZXQ6IHN0cmluZyk6IHZvaWQge1xuICAgIGlmICghdGhpcy5zdXBwb3J0c1Njcm9sbGluZygpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIC8vIFRPRE8oYXRzY290dCk6IFRoZSBjb3JyZWN0IGJlaGF2aW9yIGZvciBgZ2V0RWxlbWVudHNCeU5hbWVgIHdvdWxkIGJlIHRvIGFsc28gdmVyaWZ5IHRoYXQgdGhlXG4gICAgLy8gZWxlbWVudCBpcyBhbiBhbmNob3IuIEhvd2V2ZXIsIHRoaXMgY291bGQgYmUgY29uc2lkZXJlZCBhIGJyZWFraW5nIGNoYW5nZSBhbmQgc2hvdWxkIGJlXG4gICAgLy8gZG9uZSBpbiBhIG1ham9yIHZlcnNpb24uXG4gICAgY29uc3QgZWxTZWxlY3RlZCA9IGZpbmRBbmNob3JGcm9tRG9jdW1lbnQodGhpcy5kb2N1bWVudCwgdGFyZ2V0KTtcblxuICAgIGlmIChlbFNlbGVjdGVkKSB7XG4gICAgICB0aGlzLnNjcm9sbFRvRWxlbWVudChlbFNlbGVjdGVkKTtcbiAgICAgIC8vIEFmdGVyIHNjcm9sbGluZyB0byB0aGUgZWxlbWVudCwgdGhlIHNwZWMgZGljdGF0ZXMgdGhhdCB3ZSBmb2xsb3cgdGhlIGZvY3VzIHN0ZXBzIGZvciB0aGVcbiAgICAgIC8vIHRhcmdldC4gUmF0aGVyIHRoYW4gZm9sbG93aW5nIHRoZSByb2J1c3Qgc3RlcHMsIHNpbXBseSBhdHRlbXB0IGZvY3VzLlxuICAgICAgdGhpcy5hdHRlbXB0Rm9jdXMoZWxTZWxlY3RlZCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIERpc2FibGVzIGF1dG9tYXRpYyBzY3JvbGwgcmVzdG9yYXRpb24gcHJvdmlkZWQgYnkgdGhlIGJyb3dzZXIuXG4gICAqL1xuICBzZXRIaXN0b3J5U2Nyb2xsUmVzdG9yYXRpb24oc2Nyb2xsUmVzdG9yYXRpb246ICdhdXRvJ3wnbWFudWFsJyk6IHZvaWQge1xuICAgIGlmICh0aGlzLnN1cHBvcnRTY3JvbGxSZXN0b3JhdGlvbigpKSB7XG4gICAgICBjb25zdCBoaXN0b3J5ID0gdGhpcy53aW5kb3cuaGlzdG9yeTtcbiAgICAgIGlmIChoaXN0b3J5ICYmIGhpc3Rvcnkuc2Nyb2xsUmVzdG9yYXRpb24pIHtcbiAgICAgICAgaGlzdG9yeS5zY3JvbGxSZXN0b3JhdGlvbiA9IHNjcm9sbFJlc3RvcmF0aW9uO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTY3JvbGxzIHRvIGFuIGVsZW1lbnQgdXNpbmcgdGhlIG5hdGl2ZSBvZmZzZXQgYW5kIHRoZSBzcGVjaWZpZWQgb2Zmc2V0IHNldCBvbiB0aGlzIHNjcm9sbGVyLlxuICAgKlxuICAgKiBUaGUgb2Zmc2V0IGNhbiBiZSB1c2VkIHdoZW4gd2Uga25vdyB0aGF0IHRoZXJlIGlzIGEgZmxvYXRpbmcgaGVhZGVyIGFuZCBzY3JvbGxpbmcgbmFpdmVseSB0byBhblxuICAgKiBlbGVtZW50IChleDogYHNjcm9sbEludG9WaWV3YCkgbGVhdmVzIHRoZSBlbGVtZW50IGhpZGRlbiBiZWhpbmQgdGhlIGZsb2F0aW5nIGhlYWRlci5cbiAgICovXG4gIHByaXZhdGUgc2Nyb2xsVG9FbGVtZW50KGVsOiBIVE1MRWxlbWVudCk6IHZvaWQge1xuICAgIGNvbnN0IHJlY3QgPSBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICBjb25zdCBsZWZ0ID0gcmVjdC5sZWZ0ICsgdGhpcy53aW5kb3cucGFnZVhPZmZzZXQ7XG4gICAgY29uc3QgdG9wID0gcmVjdC50b3AgKyB0aGlzLndpbmRvdy5wYWdlWU9mZnNldDtcbiAgICBjb25zdCBvZmZzZXQgPSB0aGlzLm9mZnNldCgpO1xuICAgIHRoaXMud2luZG93LnNjcm9sbFRvKGxlZnQgLSBvZmZzZXRbMF0sIHRvcCAtIG9mZnNldFsxXSk7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbHMgYGZvY3VzYCBvbiB0aGUgYGZvY3VzVGFyZ2V0YCBhbmQgcmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGVsZW1lbnQgd2FzIGZvY3VzZWQgc3VjY2Vzc2Z1bGx5LlxuICAgKlxuICAgKiBJZiBgZmFsc2VgLCBmdXJ0aGVyIHN0ZXBzIG1heSBiZSBuZWNlc3NhcnkgdG8gZGV0ZXJtaW5lIGEgdmFsaWQgc3Vic3RpdHV0ZSB0byBiZSBmb2N1c2VkXG4gICAqIGluc3RlYWQuXG4gICAqXG4gICAqIEBzZWUgaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy8jZ2V0LXRoZS1mb2N1c2FibGUtYXJlYVxuICAgKiBAc2VlIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9IVE1MT3JGb3JlaWduRWxlbWVudC9mb2N1c1xuICAgKiBAc2VlIGh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvI2ZvY3VzYWJsZS1hcmVhXG4gICAqL1xuICBwcml2YXRlIGF0dGVtcHRGb2N1cyhmb2N1c1RhcmdldDogSFRNTEVsZW1lbnQpOiBib29sZWFuIHtcbiAgICBmb2N1c1RhcmdldC5mb2N1cygpO1xuICAgIHJldHVybiB0aGlzLmRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgPT09IGZvY3VzVGFyZ2V0O1xuICB9XG5cbiAgLyoqXG4gICAqIFdlIG9ubHkgc3VwcG9ydCBzY3JvbGwgcmVzdG9yYXRpb24gd2hlbiB3ZSBjYW4gZ2V0IGEgaG9sZCBvZiB3aW5kb3cuXG4gICAqIFRoaXMgbWVhbnMgdGhhdCB3ZSBkbyBub3Qgc3VwcG9ydCB0aGlzIGJlaGF2aW9yIHdoZW4gcnVubmluZyBpbiBhIHdlYiB3b3JrZXIuXG4gICAqXG4gICAqIExpZnRpbmcgdGhpcyByZXN0cmljdGlvbiByaWdodCBub3cgd291bGQgcmVxdWlyZSBtb3JlIGNoYW5nZXMgaW4gdGhlIGRvbSBhZGFwdGVyLlxuICAgKiBTaW5jZSB3ZWJ3b3JrZXJzIGFyZW4ndCB3aWRlbHkgdXNlZCwgd2Ugd2lsbCBsaWZ0IGl0IG9uY2UgUm91dGVyU2Nyb2xsZXIgaXNcbiAgICogYmF0dGxlLXRlc3RlZC5cbiAgICovXG4gIHByaXZhdGUgc3VwcG9ydFNjcm9sbFJlc3RvcmF0aW9uKCk6IGJvb2xlYW4ge1xuICAgIHRyeSB7XG4gICAgICBpZiAoIXRoaXMuc3VwcG9ydHNTY3JvbGxpbmcoKSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICAvLyBUaGUgYHNjcm9sbFJlc3RvcmF0aW9uYCBwcm9wZXJ0eSBjb3VsZCBiZSBvbiB0aGUgYGhpc3RvcnlgIGluc3RhbmNlIG9yIGl0cyBwcm90b3R5cGUuXG4gICAgICBjb25zdCBzY3JvbGxSZXN0b3JhdGlvbkRlc2NyaXB0b3IgPSBnZXRTY3JvbGxSZXN0b3JhdGlvblByb3BlcnR5KHRoaXMud2luZG93Lmhpc3RvcnkpIHx8XG4gICAgICAgICAgZ2V0U2Nyb2xsUmVzdG9yYXRpb25Qcm9wZXJ0eShPYmplY3QuZ2V0UHJvdG90eXBlT2YodGhpcy53aW5kb3cuaGlzdG9yeSkpO1xuICAgICAgLy8gV2UgY2FuIHdyaXRlIHRvIHRoZSBgc2Nyb2xsUmVzdG9yYXRpb25gIHByb3BlcnR5IGlmIGl0IGlzIGEgd3JpdGFibGUgZGF0YSBmaWVsZCBvciBpdCBoYXMgYVxuICAgICAgLy8gc2V0dGVyIGZ1bmN0aW9uLlxuICAgICAgcmV0dXJuICEhc2Nyb2xsUmVzdG9yYXRpb25EZXNjcmlwdG9yICYmXG4gICAgICAgICAgISEoc2Nyb2xsUmVzdG9yYXRpb25EZXNjcmlwdG9yLndyaXRhYmxlIHx8IHNjcm9sbFJlc3RvcmF0aW9uRGVzY3JpcHRvci5zZXQpO1xuICAgIH0gY2F0Y2gge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgc3VwcG9ydHNTY3JvbGxpbmcoKTogYm9vbGVhbiB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiAhIXRoaXMud2luZG93ICYmICEhdGhpcy53aW5kb3cuc2Nyb2xsVG8gJiYgJ3BhZ2VYT2Zmc2V0JyBpbiB0aGlzLndpbmRvdztcbiAgICB9IGNhdGNoIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0U2Nyb2xsUmVzdG9yYXRpb25Qcm9wZXJ0eShvYmo6IGFueSk6IFByb3BlcnR5RGVzY3JpcHRvcnx1bmRlZmluZWQge1xuICByZXR1cm4gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmosICdzY3JvbGxSZXN0b3JhdGlvbicpO1xufVxuXG5mdW5jdGlvbiBmaW5kQW5jaG9yRnJvbURvY3VtZW50KGRvY3VtZW50OiBEb2N1bWVudCwgdGFyZ2V0OiBzdHJpbmcpOiBIVE1MRWxlbWVudHxudWxsIHtcbiAgY29uc3QgZG9jdW1lbnRSZXN1bHQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0YXJnZXQpIHx8IGRvY3VtZW50LmdldEVsZW1lbnRzQnlOYW1lKHRhcmdldClbMF07XG5cbiAgaWYgKGRvY3VtZW50UmVzdWx0KSB7XG4gICAgcmV0dXJuIGRvY3VtZW50UmVzdWx0O1xuICB9XG5cbiAgLy8gYGdldEVsZW1lbnRCeUlkYCBhbmQgYGdldEVsZW1lbnRzQnlOYW1lYCB3b24ndCBwaWVyY2UgdGhyb3VnaCB0aGUgc2hhZG93IERPTSBzbyB3ZVxuICAvLyBoYXZlIHRvIHRyYXZlcnNlIHRoZSBET00gbWFudWFsbHkgYW5kIGRvIHRoZSBsb29rdXAgdGhyb3VnaCB0aGUgc2hhZG93IHJvb3RzLlxuICBpZiAodHlwZW9mIGRvY3VtZW50LmNyZWF0ZVRyZWVXYWxrZXIgPT09ICdmdW5jdGlvbicgJiYgZG9jdW1lbnQuYm9keSAmJlxuICAgICAgKChkb2N1bWVudC5ib2R5IGFzIGFueSkuY3JlYXRlU2hhZG93Um9vdCB8fCBkb2N1bWVudC5ib2R5LmF0dGFjaFNoYWRvdykpIHtcbiAgICBjb25zdCB0cmVlV2Fsa2VyID0gZG9jdW1lbnQuY3JlYXRlVHJlZVdhbGtlcihkb2N1bWVudC5ib2R5LCBOb2RlRmlsdGVyLlNIT1dfRUxFTUVOVCk7XG4gICAgbGV0IGN1cnJlbnROb2RlID0gdHJlZVdhbGtlci5jdXJyZW50Tm9kZSBhcyBIVE1MRWxlbWVudCB8IG51bGw7XG5cbiAgICB3aGlsZSAoY3VycmVudE5vZGUpIHtcbiAgICAgIGNvbnN0IHNoYWRvd1Jvb3QgPSBjdXJyZW50Tm9kZS5zaGFkb3dSb290O1xuXG4gICAgICBpZiAoc2hhZG93Um9vdCkge1xuICAgICAgICAvLyBOb3RlIHRoYXQgYFNoYWRvd1Jvb3RgIGRvZXNuJ3Qgc3VwcG9ydCBgZ2V0RWxlbWVudHNCeU5hbWVgXG4gICAgICAgIC8vIHNvIHdlIGhhdmUgdG8gZmFsbCBiYWNrIHRvIGBxdWVyeVNlbGVjdG9yYC5cbiAgICAgICAgY29uc3QgcmVzdWx0ID1cbiAgICAgICAgICAgIHNoYWRvd1Jvb3QuZ2V0RWxlbWVudEJ5SWQodGFyZ2V0KSB8fCBzaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoYFtuYW1lPVwiJHt0YXJnZXR9XCJdYCk7XG4gICAgICAgIGlmIChyZXN1bHQpIHtcbiAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGN1cnJlbnROb2RlID0gdHJlZVdhbGtlci5uZXh0Tm9kZSgpIGFzIEhUTUxFbGVtZW50IHwgbnVsbDtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbnVsbDtcbn1cblxuLyoqXG4gKiBQcm92aWRlcyBhbiBlbXB0eSBpbXBsZW1lbnRhdGlvbiBvZiB0aGUgdmlld3BvcnQgc2Nyb2xsZXIuXG4gKi9cbmV4cG9ydCBjbGFzcyBOdWxsVmlld3BvcnRTY3JvbGxlciBpbXBsZW1lbnRzIFZpZXdwb3J0U2Nyb2xsZXIge1xuICAvKipcbiAgICogRW1wdHkgaW1wbGVtZW50YXRpb25cbiAgICovXG4gIHNldE9mZnNldChvZmZzZXQ6IFtudW1iZXIsIG51bWJlcl18KCgpID0+IFtudW1iZXIsIG51bWJlcl0pKTogdm9pZCB7fVxuXG4gIC8qKlxuICAgKiBFbXB0eSBpbXBsZW1lbnRhdGlvblxuICAgKi9cbiAgZ2V0U2Nyb2xsUG9zaXRpb24oKTogW251bWJlciwgbnVtYmVyXSB7XG4gICAgcmV0dXJuIFswLCAwXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFbXB0eSBpbXBsZW1lbnRhdGlvblxuICAgKi9cbiAgc2Nyb2xsVG9Qb3NpdGlvbihwb3NpdGlvbjogW251bWJlciwgbnVtYmVyXSk6IHZvaWQge31cblxuICAvKipcbiAgICogRW1wdHkgaW1wbGVtZW50YXRpb25cbiAgICovXG4gIHNjcm9sbFRvQW5jaG9yKGFuY2hvcjogc3RyaW5nKTogdm9pZCB7fVxuXG4gIC8qKlxuICAgKiBFbXB0eSBpbXBsZW1lbnRhdGlvblxuICAgKi9cbiAgc2V0SGlzdG9yeVNjcm9sbFJlc3RvcmF0aW9uKHNjcm9sbFJlc3RvcmF0aW9uOiAnYXV0byd8J21hbnVhbCcpOiB2b2lkIHt9XG59XG4iXX0=