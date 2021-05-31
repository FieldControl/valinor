/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** Cached result of the way the browser handles the horizontal scroll axis in RTL mode. */
let rtlScrollAxisType;
/** Cached result of the check that indicates whether the browser supports scroll behaviors. */
let scrollBehaviorSupported;
/** Check whether the browser supports scroll behaviors. */
export function supportsScrollBehavior() {
    if (scrollBehaviorSupported == null) {
        // If we're not in the browser, it can't be supported. Also check for `Element`, because
        // some projects stub out the global `document` during SSR which can throw us off.
        if (typeof document !== 'object' || !document || typeof Element !== 'function' || !Element) {
            scrollBehaviorSupported = false;
            return scrollBehaviorSupported;
        }
        // If the element can have a `scrollBehavior` style, we can be sure that it's supported.
        if ('scrollBehavior' in document.documentElement.style) {
            scrollBehaviorSupported = true;
        }
        else {
            // At this point we have 3 possibilities: `scrollTo` isn't supported at all, it's
            // supported but it doesn't handle scroll behavior, or it has been polyfilled.
            const scrollToFunction = Element.prototype.scrollTo;
            if (scrollToFunction) {
                // We can detect if the function has been polyfilled by calling `toString` on it. Native
                // functions are obfuscated using `[native code]`, whereas if it was overwritten we'd get
                // the actual function source. Via https://davidwalsh.name/detect-native-function. Consider
                // polyfilled functions as supporting scroll behavior.
                scrollBehaviorSupported = !/\{\s*\[native code\]\s*\}/.test(scrollToFunction.toString());
            }
            else {
                scrollBehaviorSupported = false;
            }
        }
    }
    return scrollBehaviorSupported;
}
/**
 * Checks the type of RTL scroll axis used by this browser. As of time of writing, Chrome is NORMAL,
 * Firefox & Safari are NEGATED, and IE & Edge are INVERTED.
 */
export function getRtlScrollAxisType() {
    // We can't check unless we're on the browser. Just assume 'normal' if we're not.
    if (typeof document !== 'object' || !document) {
        return 0 /* NORMAL */;
    }
    if (rtlScrollAxisType == null) {
        // Create a 1px wide scrolling container and a 2px wide content element.
        const scrollContainer = document.createElement('div');
        const containerStyle = scrollContainer.style;
        scrollContainer.dir = 'rtl';
        containerStyle.width = '1px';
        containerStyle.overflow = 'auto';
        containerStyle.visibility = 'hidden';
        containerStyle.pointerEvents = 'none';
        containerStyle.position = 'absolute';
        const content = document.createElement('div');
        const contentStyle = content.style;
        contentStyle.width = '2px';
        contentStyle.height = '1px';
        scrollContainer.appendChild(content);
        document.body.appendChild(scrollContainer);
        rtlScrollAxisType = 0 /* NORMAL */;
        // The viewport starts scrolled all the way to the right in RTL mode. If we are in a NORMAL
        // browser this would mean that the scrollLeft should be 1. If it's zero instead we know we're
        // dealing with one of the other two types of browsers.
        if (scrollContainer.scrollLeft === 0) {
            // In a NEGATED browser the scrollLeft is always somewhere in [-maxScrollAmount, 0]. For an
            // INVERTED browser it is always somewhere in [0, maxScrollAmount]. We can determine which by
            // setting to the scrollLeft to 1. This is past the max for a NEGATED browser, so it will
            // return 0 when we read it again.
            scrollContainer.scrollLeft = 1;
            rtlScrollAxisType =
                scrollContainer.scrollLeft === 0 ? 1 /* NEGATED */ : 2 /* INVERTED */;
        }
        scrollContainer.parentNode.removeChild(scrollContainer);
    }
    return rtlScrollAxisType;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2Nyb2xsaW5nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9wbGF0Zm9ybS9mZWF0dXJlcy9zY3JvbGxpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBcUJILDJGQUEyRjtBQUMzRixJQUFJLGlCQUE4QyxDQUFDO0FBRW5ELCtGQUErRjtBQUMvRixJQUFJLHVCQUEwQyxDQUFDO0FBRS9DLDJEQUEyRDtBQUMzRCxNQUFNLFVBQVUsc0JBQXNCO0lBQ3BDLElBQUksdUJBQXVCLElBQUksSUFBSSxFQUFFO1FBQ25DLHdGQUF3RjtRQUN4RixrRkFBa0Y7UUFDbEYsSUFBSSxPQUFPLFFBQVEsS0FBSyxRQUFRLElBQUksQ0FBQyxRQUFRLElBQUksT0FBTyxPQUFPLEtBQUssVUFBVSxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQzFGLHVCQUF1QixHQUFHLEtBQUssQ0FBQztZQUNoQyxPQUFPLHVCQUF1QixDQUFDO1NBQ2hDO1FBRUQsd0ZBQXdGO1FBQ3hGLElBQUksZ0JBQWdCLElBQUksUUFBUSxDQUFDLGVBQWdCLENBQUMsS0FBSyxFQUFFO1lBQ3ZELHVCQUF1QixHQUFHLElBQUksQ0FBQztTQUNoQzthQUFNO1lBQ0wsaUZBQWlGO1lBQ2pGLDhFQUE4RTtZQUM5RSxNQUFNLGdCQUFnQixHQUF1QixPQUFPLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQztZQUV4RSxJQUFJLGdCQUFnQixFQUFFO2dCQUNwQix3RkFBd0Y7Z0JBQ3hGLHlGQUF5RjtnQkFDekYsMkZBQTJGO2dCQUMzRixzREFBc0Q7Z0JBQ3RELHVCQUF1QixHQUFHLENBQUMsMkJBQTJCLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7YUFDMUY7aUJBQU07Z0JBQ0wsdUJBQXVCLEdBQUcsS0FBSyxDQUFDO2FBQ2pDO1NBQ0Y7S0FDRjtJQUVELE9BQU8sdUJBQXVCLENBQUM7QUFDakMsQ0FBQztBQUVEOzs7R0FHRztBQUNILE1BQU0sVUFBVSxvQkFBb0I7SUFDbEMsaUZBQWlGO0lBQ2pGLElBQUksT0FBTyxRQUFRLEtBQUssUUFBUSxJQUFJLENBQUMsUUFBUSxFQUFFO1FBQzdDLHNCQUFnQztLQUNqQztJQUVELElBQUksaUJBQWlCLElBQUksSUFBSSxFQUFFO1FBQzdCLHdFQUF3RTtRQUN4RSxNQUFNLGVBQWUsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3RELE1BQU0sY0FBYyxHQUFHLGVBQWUsQ0FBQyxLQUFLLENBQUM7UUFDN0MsZUFBZSxDQUFDLEdBQUcsR0FBRyxLQUFLLENBQUM7UUFDNUIsY0FBYyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDN0IsY0FBYyxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUM7UUFDakMsY0FBYyxDQUFDLFVBQVUsR0FBRyxRQUFRLENBQUM7UUFDckMsY0FBYyxDQUFDLGFBQWEsR0FBRyxNQUFNLENBQUM7UUFDdEMsY0FBYyxDQUFDLFFBQVEsR0FBRyxVQUFVLENBQUM7UUFFckMsTUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM5QyxNQUFNLFlBQVksR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDO1FBQ25DLFlBQVksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQzNCLFlBQVksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO1FBRTVCLGVBQWUsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDckMsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsZUFBZSxDQUFDLENBQUM7UUFFM0MsaUJBQWlCLGlCQUEyQixDQUFDO1FBRTdDLDJGQUEyRjtRQUMzRiw4RkFBOEY7UUFDOUYsdURBQXVEO1FBQ3ZELElBQUksZUFBZSxDQUFDLFVBQVUsS0FBSyxDQUFDLEVBQUU7WUFDcEMsMkZBQTJGO1lBQzNGLDZGQUE2RjtZQUM3Rix5RkFBeUY7WUFDekYsa0NBQWtDO1lBQ2xDLGVBQWUsQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDO1lBQy9CLGlCQUFpQjtnQkFDYixlQUFlLENBQUMsVUFBVSxLQUFLLENBQUMsQ0FBQyxDQUFDLGlCQUEyQixDQUFDLGlCQUEyQixDQUFDO1NBQy9GO1FBRUQsZUFBZSxDQUFDLFVBQVcsQ0FBQyxXQUFXLENBQUMsZUFBZSxDQUFDLENBQUM7S0FDMUQ7SUFDRCxPQUFPLGlCQUFpQixDQUFDO0FBQzNCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuLyoqIFRoZSBwb3NzaWJsZSB3YXlzIHRoZSBicm93c2VyIG1heSBoYW5kbGUgdGhlIGhvcml6b250YWwgc2Nyb2xsIGF4aXMgaW4gUlRMIGxhbmd1YWdlcy4gKi9cbmV4cG9ydCBjb25zdCBlbnVtIFJ0bFNjcm9sbEF4aXNUeXBlIHtcbiAgLyoqXG4gICAqIHNjcm9sbExlZnQgaXMgMCB3aGVuIHNjcm9sbGVkIGFsbCB0aGUgd2F5IGxlZnQgYW5kIChzY3JvbGxXaWR0aCAtIGNsaWVudFdpZHRoKSB3aGVuIHNjcm9sbGVkXG4gICAqIGFsbCB0aGUgd2F5IHJpZ2h0LlxuICAgKi9cbiAgTk9STUFMLFxuICAvKipcbiAgICogc2Nyb2xsTGVmdCBpcyAtKHNjcm9sbFdpZHRoIC0gY2xpZW50V2lkdGgpIHdoZW4gc2Nyb2xsZWQgYWxsIHRoZSB3YXkgbGVmdCBhbmQgMCB3aGVuIHNjcm9sbGVkXG4gICAqIGFsbCB0aGUgd2F5IHJpZ2h0LlxuICAgKi9cbiAgTkVHQVRFRCxcbiAgLyoqXG4gICAqIHNjcm9sbExlZnQgaXMgKHNjcm9sbFdpZHRoIC0gY2xpZW50V2lkdGgpIHdoZW4gc2Nyb2xsZWQgYWxsIHRoZSB3YXkgbGVmdCBhbmQgMCB3aGVuIHNjcm9sbGVkXG4gICAqIGFsbCB0aGUgd2F5IHJpZ2h0LlxuICAgKi9cbiAgSU5WRVJURURcbn1cblxuLyoqIENhY2hlZCByZXN1bHQgb2YgdGhlIHdheSB0aGUgYnJvd3NlciBoYW5kbGVzIHRoZSBob3Jpem9udGFsIHNjcm9sbCBheGlzIGluIFJUTCBtb2RlLiAqL1xubGV0IHJ0bFNjcm9sbEF4aXNUeXBlOiBSdGxTY3JvbGxBeGlzVHlwZXx1bmRlZmluZWQ7XG5cbi8qKiBDYWNoZWQgcmVzdWx0IG9mIHRoZSBjaGVjayB0aGF0IGluZGljYXRlcyB3aGV0aGVyIHRoZSBicm93c2VyIHN1cHBvcnRzIHNjcm9sbCBiZWhhdmlvcnMuICovXG5sZXQgc2Nyb2xsQmVoYXZpb3JTdXBwb3J0ZWQ6IGJvb2xlYW58dW5kZWZpbmVkO1xuXG4vKiogQ2hlY2sgd2hldGhlciB0aGUgYnJvd3NlciBzdXBwb3J0cyBzY3JvbGwgYmVoYXZpb3JzLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN1cHBvcnRzU2Nyb2xsQmVoYXZpb3IoKTogYm9vbGVhbiB7XG4gIGlmIChzY3JvbGxCZWhhdmlvclN1cHBvcnRlZCA9PSBudWxsKSB7XG4gICAgLy8gSWYgd2UncmUgbm90IGluIHRoZSBicm93c2VyLCBpdCBjYW4ndCBiZSBzdXBwb3J0ZWQuIEFsc28gY2hlY2sgZm9yIGBFbGVtZW50YCwgYmVjYXVzZVxuICAgIC8vIHNvbWUgcHJvamVjdHMgc3R1YiBvdXQgdGhlIGdsb2JhbCBgZG9jdW1lbnRgIGR1cmluZyBTU1Igd2hpY2ggY2FuIHRocm93IHVzIG9mZi5cbiAgICBpZiAodHlwZW9mIGRvY3VtZW50ICE9PSAnb2JqZWN0JyB8fCAhZG9jdW1lbnQgfHwgdHlwZW9mIEVsZW1lbnQgIT09ICdmdW5jdGlvbicgfHwgIUVsZW1lbnQpIHtcbiAgICAgIHNjcm9sbEJlaGF2aW9yU3VwcG9ydGVkID0gZmFsc2U7XG4gICAgICByZXR1cm4gc2Nyb2xsQmVoYXZpb3JTdXBwb3J0ZWQ7XG4gICAgfVxuXG4gICAgLy8gSWYgdGhlIGVsZW1lbnQgY2FuIGhhdmUgYSBgc2Nyb2xsQmVoYXZpb3JgIHN0eWxlLCB3ZSBjYW4gYmUgc3VyZSB0aGF0IGl0J3Mgc3VwcG9ydGVkLlxuICAgIGlmICgnc2Nyb2xsQmVoYXZpb3InIGluIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCEuc3R5bGUpIHtcbiAgICAgIHNjcm9sbEJlaGF2aW9yU3VwcG9ydGVkID0gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gQXQgdGhpcyBwb2ludCB3ZSBoYXZlIDMgcG9zc2liaWxpdGllczogYHNjcm9sbFRvYCBpc24ndCBzdXBwb3J0ZWQgYXQgYWxsLCBpdCdzXG4gICAgICAvLyBzdXBwb3J0ZWQgYnV0IGl0IGRvZXNuJ3QgaGFuZGxlIHNjcm9sbCBiZWhhdmlvciwgb3IgaXQgaGFzIGJlZW4gcG9seWZpbGxlZC5cbiAgICAgIGNvbnN0IHNjcm9sbFRvRnVuY3Rpb246IEZ1bmN0aW9ufHVuZGVmaW5lZCA9IEVsZW1lbnQucHJvdG90eXBlLnNjcm9sbFRvO1xuXG4gICAgICBpZiAoc2Nyb2xsVG9GdW5jdGlvbikge1xuICAgICAgICAvLyBXZSBjYW4gZGV0ZWN0IGlmIHRoZSBmdW5jdGlvbiBoYXMgYmVlbiBwb2x5ZmlsbGVkIGJ5IGNhbGxpbmcgYHRvU3RyaW5nYCBvbiBpdC4gTmF0aXZlXG4gICAgICAgIC8vIGZ1bmN0aW9ucyBhcmUgb2JmdXNjYXRlZCB1c2luZyBgW25hdGl2ZSBjb2RlXWAsIHdoZXJlYXMgaWYgaXQgd2FzIG92ZXJ3cml0dGVuIHdlJ2QgZ2V0XG4gICAgICAgIC8vIHRoZSBhY3R1YWwgZnVuY3Rpb24gc291cmNlLiBWaWEgaHR0cHM6Ly9kYXZpZHdhbHNoLm5hbWUvZGV0ZWN0LW5hdGl2ZS1mdW5jdGlvbi4gQ29uc2lkZXJcbiAgICAgICAgLy8gcG9seWZpbGxlZCBmdW5jdGlvbnMgYXMgc3VwcG9ydGluZyBzY3JvbGwgYmVoYXZpb3IuXG4gICAgICAgIHNjcm9sbEJlaGF2aW9yU3VwcG9ydGVkID0gIS9cXHtcXHMqXFxbbmF0aXZlIGNvZGVcXF1cXHMqXFx9Ly50ZXN0KHNjcm9sbFRvRnVuY3Rpb24udG9TdHJpbmcoKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzY3JvbGxCZWhhdmlvclN1cHBvcnRlZCA9IGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBzY3JvbGxCZWhhdmlvclN1cHBvcnRlZDtcbn1cblxuLyoqXG4gKiBDaGVja3MgdGhlIHR5cGUgb2YgUlRMIHNjcm9sbCBheGlzIHVzZWQgYnkgdGhpcyBicm93c2VyLiBBcyBvZiB0aW1lIG9mIHdyaXRpbmcsIENocm9tZSBpcyBOT1JNQUwsXG4gKiBGaXJlZm94ICYgU2FmYXJpIGFyZSBORUdBVEVELCBhbmQgSUUgJiBFZGdlIGFyZSBJTlZFUlRFRC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFJ0bFNjcm9sbEF4aXNUeXBlKCk6IFJ0bFNjcm9sbEF4aXNUeXBlIHtcbiAgLy8gV2UgY2FuJ3QgY2hlY2sgdW5sZXNzIHdlJ3JlIG9uIHRoZSBicm93c2VyLiBKdXN0IGFzc3VtZSAnbm9ybWFsJyBpZiB3ZSdyZSBub3QuXG4gIGlmICh0eXBlb2YgZG9jdW1lbnQgIT09ICdvYmplY3QnIHx8ICFkb2N1bWVudCkge1xuICAgIHJldHVybiBSdGxTY3JvbGxBeGlzVHlwZS5OT1JNQUw7XG4gIH1cblxuICBpZiAocnRsU2Nyb2xsQXhpc1R5cGUgPT0gbnVsbCkge1xuICAgIC8vIENyZWF0ZSBhIDFweCB3aWRlIHNjcm9sbGluZyBjb250YWluZXIgYW5kIGEgMnB4IHdpZGUgY29udGVudCBlbGVtZW50LlxuICAgIGNvbnN0IHNjcm9sbENvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGNvbnN0IGNvbnRhaW5lclN0eWxlID0gc2Nyb2xsQ29udGFpbmVyLnN0eWxlO1xuICAgIHNjcm9sbENvbnRhaW5lci5kaXIgPSAncnRsJztcbiAgICBjb250YWluZXJTdHlsZS53aWR0aCA9ICcxcHgnO1xuICAgIGNvbnRhaW5lclN0eWxlLm92ZXJmbG93ID0gJ2F1dG8nO1xuICAgIGNvbnRhaW5lclN0eWxlLnZpc2liaWxpdHkgPSAnaGlkZGVuJztcbiAgICBjb250YWluZXJTdHlsZS5wb2ludGVyRXZlbnRzID0gJ25vbmUnO1xuICAgIGNvbnRhaW5lclN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcblxuICAgIGNvbnN0IGNvbnRlbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBjb25zdCBjb250ZW50U3R5bGUgPSBjb250ZW50LnN0eWxlO1xuICAgIGNvbnRlbnRTdHlsZS53aWR0aCA9ICcycHgnO1xuICAgIGNvbnRlbnRTdHlsZS5oZWlnaHQgPSAnMXB4JztcblxuICAgIHNjcm9sbENvbnRhaW5lci5hcHBlbmRDaGlsZChjb250ZW50KTtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHNjcm9sbENvbnRhaW5lcik7XG5cbiAgICBydGxTY3JvbGxBeGlzVHlwZSA9IFJ0bFNjcm9sbEF4aXNUeXBlLk5PUk1BTDtcblxuICAgIC8vIFRoZSB2aWV3cG9ydCBzdGFydHMgc2Nyb2xsZWQgYWxsIHRoZSB3YXkgdG8gdGhlIHJpZ2h0IGluIFJUTCBtb2RlLiBJZiB3ZSBhcmUgaW4gYSBOT1JNQUxcbiAgICAvLyBicm93c2VyIHRoaXMgd291bGQgbWVhbiB0aGF0IHRoZSBzY3JvbGxMZWZ0IHNob3VsZCBiZSAxLiBJZiBpdCdzIHplcm8gaW5zdGVhZCB3ZSBrbm93IHdlJ3JlXG4gICAgLy8gZGVhbGluZyB3aXRoIG9uZSBvZiB0aGUgb3RoZXIgdHdvIHR5cGVzIG9mIGJyb3dzZXJzLlxuICAgIGlmIChzY3JvbGxDb250YWluZXIuc2Nyb2xsTGVmdCA9PT0gMCkge1xuICAgICAgLy8gSW4gYSBORUdBVEVEIGJyb3dzZXIgdGhlIHNjcm9sbExlZnQgaXMgYWx3YXlzIHNvbWV3aGVyZSBpbiBbLW1heFNjcm9sbEFtb3VudCwgMF0uIEZvciBhblxuICAgICAgLy8gSU5WRVJURUQgYnJvd3NlciBpdCBpcyBhbHdheXMgc29tZXdoZXJlIGluIFswLCBtYXhTY3JvbGxBbW91bnRdLiBXZSBjYW4gZGV0ZXJtaW5lIHdoaWNoIGJ5XG4gICAgICAvLyBzZXR0aW5nIHRvIHRoZSBzY3JvbGxMZWZ0IHRvIDEuIFRoaXMgaXMgcGFzdCB0aGUgbWF4IGZvciBhIE5FR0FURUQgYnJvd3Nlciwgc28gaXQgd2lsbFxuICAgICAgLy8gcmV0dXJuIDAgd2hlbiB3ZSByZWFkIGl0IGFnYWluLlxuICAgICAgc2Nyb2xsQ29udGFpbmVyLnNjcm9sbExlZnQgPSAxO1xuICAgICAgcnRsU2Nyb2xsQXhpc1R5cGUgPVxuICAgICAgICAgIHNjcm9sbENvbnRhaW5lci5zY3JvbGxMZWZ0ID09PSAwID8gUnRsU2Nyb2xsQXhpc1R5cGUuTkVHQVRFRCA6IFJ0bFNjcm9sbEF4aXNUeXBlLklOVkVSVEVEO1xuICAgIH1cblxuICAgIHNjcm9sbENvbnRhaW5lci5wYXJlbnROb2RlIS5yZW1vdmVDaGlsZChzY3JvbGxDb250YWluZXIpO1xuICB9XG4gIHJldHVybiBydGxTY3JvbGxBeGlzVHlwZTtcbn1cbiJdfQ==