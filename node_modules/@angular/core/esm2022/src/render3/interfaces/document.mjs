/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { RuntimeError } from '../../errors';
/**
 * Most of the use of `document` in Angular is from within the DI system so it is possible to simply
 * inject the `DOCUMENT` token and are done.
 *
 * Ivy is special because it does not rely upon the DI and must get hold of the document some other
 * way.
 *
 * The solution is to define `getDocument()` and `setDocument()` top-level functions for ivy.
 * Wherever ivy needs the global document, it calls `getDocument()` instead.
 *
 * When running ivy outside of a browser environment, it is necessary to call `setDocument()` to
 * tell ivy what the global `document` is.
 *
 * Angular does this for us in each of the standard platforms (`Browser` and `Server`)
 * by calling `setDocument()` when providing the `DOCUMENT` token.
 */
let DOCUMENT = undefined;
/**
 * Tell ivy what the `document` is for this platform.
 *
 * It is only necessary to call this if the current platform is not a browser.
 *
 * @param document The object representing the global `document` in this environment.
 */
export function setDocument(document) {
    DOCUMENT = document;
}
/**
 * Access the object that represents the `document` for this platform.
 *
 * Ivy calls this whenever it needs to access the `document` object.
 * For example to create the renderer or to do sanitization.
 */
export function getDocument() {
    if (DOCUMENT !== undefined) {
        return DOCUMENT;
    }
    else if (typeof document !== 'undefined') {
        return document;
    }
    throw new RuntimeError(210 /* RuntimeErrorCode.MISSING_DOCUMENT */, (typeof ngDevMode === 'undefined' || ngDevMode) &&
        `The document object is not available in this context. Make sure the DOCUMENT injection token is provided.`);
    // No "document" can be found. This should only happen if we are running ivy outside Angular and
    // the current platform is not a browser. Since this is not a supported scenario at the moment
    // this should not happen in Angular apps.
    // Once we support running ivy outside of Angular we will need to publish `setDocument()` as a
    // public API.
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9jdW1lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy9yZW5kZXIzL2ludGVyZmFjZXMvZG9jdW1lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFlBQVksRUFBbUIsTUFBTSxjQUFjLENBQUM7QUFFNUQ7Ozs7Ozs7Ozs7Ozs7OztHQWVHO0FBQ0gsSUFBSSxRQUFRLEdBQXlCLFNBQVMsQ0FBQztBQUUvQzs7Ozs7O0dBTUc7QUFDSCxNQUFNLFVBQVUsV0FBVyxDQUFDLFFBQThCO0lBQ3hELFFBQVEsR0FBRyxRQUFRLENBQUM7QUFDdEIsQ0FBQztBQUVEOzs7OztHQUtHO0FBQ0gsTUFBTSxVQUFVLFdBQVc7SUFDekIsSUFBSSxRQUFRLEtBQUssU0FBUyxFQUFFLENBQUM7UUFDM0IsT0FBTyxRQUFRLENBQUM7SUFDbEIsQ0FBQztTQUFNLElBQUksT0FBTyxRQUFRLEtBQUssV0FBVyxFQUFFLENBQUM7UUFDM0MsT0FBTyxRQUFRLENBQUM7SUFDbEIsQ0FBQztJQUVELE1BQU0sSUFBSSxZQUFZLDhDQUVwQixDQUFDLE9BQU8sU0FBUyxLQUFLLFdBQVcsSUFBSSxTQUFTLENBQUM7UUFDN0MsMkdBQTJHLENBQzlHLENBQUM7SUFFRixnR0FBZ0c7SUFDaEcsOEZBQThGO0lBQzlGLDBDQUEwQztJQUMxQyw4RkFBOEY7SUFDOUYsY0FBYztBQUNoQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuZGV2L2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1J1bnRpbWVFcnJvciwgUnVudGltZUVycm9yQ29kZX0gZnJvbSAnLi4vLi4vZXJyb3JzJztcblxuLyoqXG4gKiBNb3N0IG9mIHRoZSB1c2Ugb2YgYGRvY3VtZW50YCBpbiBBbmd1bGFyIGlzIGZyb20gd2l0aGluIHRoZSBESSBzeXN0ZW0gc28gaXQgaXMgcG9zc2libGUgdG8gc2ltcGx5XG4gKiBpbmplY3QgdGhlIGBET0NVTUVOVGAgdG9rZW4gYW5kIGFyZSBkb25lLlxuICpcbiAqIEl2eSBpcyBzcGVjaWFsIGJlY2F1c2UgaXQgZG9lcyBub3QgcmVseSB1cG9uIHRoZSBESSBhbmQgbXVzdCBnZXQgaG9sZCBvZiB0aGUgZG9jdW1lbnQgc29tZSBvdGhlclxuICogd2F5LlxuICpcbiAqIFRoZSBzb2x1dGlvbiBpcyB0byBkZWZpbmUgYGdldERvY3VtZW50KClgIGFuZCBgc2V0RG9jdW1lbnQoKWAgdG9wLWxldmVsIGZ1bmN0aW9ucyBmb3IgaXZ5LlxuICogV2hlcmV2ZXIgaXZ5IG5lZWRzIHRoZSBnbG9iYWwgZG9jdW1lbnQsIGl0IGNhbGxzIGBnZXREb2N1bWVudCgpYCBpbnN0ZWFkLlxuICpcbiAqIFdoZW4gcnVubmluZyBpdnkgb3V0c2lkZSBvZiBhIGJyb3dzZXIgZW52aXJvbm1lbnQsIGl0IGlzIG5lY2Vzc2FyeSB0byBjYWxsIGBzZXREb2N1bWVudCgpYCB0b1xuICogdGVsbCBpdnkgd2hhdCB0aGUgZ2xvYmFsIGBkb2N1bWVudGAgaXMuXG4gKlxuICogQW5ndWxhciBkb2VzIHRoaXMgZm9yIHVzIGluIGVhY2ggb2YgdGhlIHN0YW5kYXJkIHBsYXRmb3JtcyAoYEJyb3dzZXJgIGFuZCBgU2VydmVyYClcbiAqIGJ5IGNhbGxpbmcgYHNldERvY3VtZW50KClgIHdoZW4gcHJvdmlkaW5nIHRoZSBgRE9DVU1FTlRgIHRva2VuLlxuICovXG5sZXQgRE9DVU1FTlQ6IERvY3VtZW50IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuXG4vKipcbiAqIFRlbGwgaXZ5IHdoYXQgdGhlIGBkb2N1bWVudGAgaXMgZm9yIHRoaXMgcGxhdGZvcm0uXG4gKlxuICogSXQgaXMgb25seSBuZWNlc3NhcnkgdG8gY2FsbCB0aGlzIGlmIHRoZSBjdXJyZW50IHBsYXRmb3JtIGlzIG5vdCBhIGJyb3dzZXIuXG4gKlxuICogQHBhcmFtIGRvY3VtZW50IFRoZSBvYmplY3QgcmVwcmVzZW50aW5nIHRoZSBnbG9iYWwgYGRvY3VtZW50YCBpbiB0aGlzIGVudmlyb25tZW50LlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0RG9jdW1lbnQoZG9jdW1lbnQ6IERvY3VtZW50IHwgdW5kZWZpbmVkKTogdm9pZCB7XG4gIERPQ1VNRU5UID0gZG9jdW1lbnQ7XG59XG5cbi8qKlxuICogQWNjZXNzIHRoZSBvYmplY3QgdGhhdCByZXByZXNlbnRzIHRoZSBgZG9jdW1lbnRgIGZvciB0aGlzIHBsYXRmb3JtLlxuICpcbiAqIEl2eSBjYWxscyB0aGlzIHdoZW5ldmVyIGl0IG5lZWRzIHRvIGFjY2VzcyB0aGUgYGRvY3VtZW50YCBvYmplY3QuXG4gKiBGb3IgZXhhbXBsZSB0byBjcmVhdGUgdGhlIHJlbmRlcmVyIG9yIHRvIGRvIHNhbml0aXphdGlvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldERvY3VtZW50KCk6IERvY3VtZW50IHtcbiAgaWYgKERPQ1VNRU5UICE9PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gRE9DVU1FTlQ7XG4gIH0gZWxzZSBpZiAodHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJykge1xuICAgIHJldHVybiBkb2N1bWVudDtcbiAgfVxuXG4gIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgUnVudGltZUVycm9yQ29kZS5NSVNTSU5HX0RPQ1VNRU5ULFxuICAgICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpICYmXG4gICAgICBgVGhlIGRvY3VtZW50IG9iamVjdCBpcyBub3QgYXZhaWxhYmxlIGluIHRoaXMgY29udGV4dC4gTWFrZSBzdXJlIHRoZSBET0NVTUVOVCBpbmplY3Rpb24gdG9rZW4gaXMgcHJvdmlkZWQuYCxcbiAgKTtcblxuICAvLyBObyBcImRvY3VtZW50XCIgY2FuIGJlIGZvdW5kLiBUaGlzIHNob3VsZCBvbmx5IGhhcHBlbiBpZiB3ZSBhcmUgcnVubmluZyBpdnkgb3V0c2lkZSBBbmd1bGFyIGFuZFxuICAvLyB0aGUgY3VycmVudCBwbGF0Zm9ybSBpcyBub3QgYSBicm93c2VyLiBTaW5jZSB0aGlzIGlzIG5vdCBhIHN1cHBvcnRlZCBzY2VuYXJpbyBhdCB0aGUgbW9tZW50XG4gIC8vIHRoaXMgc2hvdWxkIG5vdCBoYXBwZW4gaW4gQW5ndWxhciBhcHBzLlxuICAvLyBPbmNlIHdlIHN1cHBvcnQgcnVubmluZyBpdnkgb3V0c2lkZSBvZiBBbmd1bGFyIHdlIHdpbGwgbmVlZCB0byBwdWJsaXNoIGBzZXREb2N1bWVudCgpYCBhcyBhXG4gIC8vIHB1YmxpYyBBUEkuXG59XG4iXX0=