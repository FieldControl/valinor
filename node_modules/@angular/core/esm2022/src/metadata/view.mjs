/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * Defines the CSS styles encapsulation policies for the {@link Component} decorator's
 * `encapsulation` option.
 *
 * See {@link Component#encapsulation encapsulation}.
 *
 * @usageNotes
 * ### Example
 *
 * {@example core/ts/metadata/encapsulation.ts region='longform'}
 *
 * @publicApi
 */
export var ViewEncapsulation;
(function (ViewEncapsulation) {
    // TODO: consider making `ViewEncapsulation` a `const enum` instead. See
    // https://github.com/angular/angular/issues/44119 for additional information.
    /**
     * Emulates a native Shadow DOM encapsulation behavior by adding a specific attribute to the
     * component's host element and applying the same attribute to all the CSS selectors provided
     * via {@link Component#styles styles} or {@link Component#styleUrls styleUrls}.
     *
     * This is the default option.
     */
    ViewEncapsulation[ViewEncapsulation["Emulated"] = 0] = "Emulated";
    // Historically the 1 value was for `Native` encapsulation which has been removed as of v11.
    /**
     * Doesn't provide any sort of CSS style encapsulation, meaning that all the styles provided
     * via {@link Component#styles styles} or {@link Component#styleUrls styleUrls} are applicable
     * to any HTML element of the application regardless of their host Component.
     */
    ViewEncapsulation[ViewEncapsulation["None"] = 2] = "None";
    /**
     * Uses the browser's native Shadow DOM API to encapsulate CSS styles, meaning that it creates
     * a ShadowRoot for the component's host element which is then used to encapsulate
     * all the Component's styling.
     */
    ViewEncapsulation[ViewEncapsulation["ShadowDom"] = 3] = "ShadowDom";
})(ViewEncapsulation || (ViewEncapsulation = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlldy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc3JjL21ldGFkYXRhL3ZpZXcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUg7Ozs7Ozs7Ozs7OztHQVlHO0FBQ0gsTUFBTSxDQUFOLElBQVksaUJBNEJYO0FBNUJELFdBQVksaUJBQWlCO0lBQzNCLHdFQUF3RTtJQUN4RSw4RUFBOEU7SUFFOUU7Ozs7OztPQU1HO0lBQ0gsaUVBQVksQ0FBQTtJQUVaLDRGQUE0RjtJQUU1Rjs7OztPQUlHO0lBQ0gseURBQVEsQ0FBQTtJQUVSOzs7O09BSUc7SUFDSCxtRUFBYSxDQUFBO0FBQ2YsQ0FBQyxFQTVCVyxpQkFBaUIsS0FBakIsaUJBQWlCLFFBNEI1QiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuLyoqXG4gKiBEZWZpbmVzIHRoZSBDU1Mgc3R5bGVzIGVuY2Fwc3VsYXRpb24gcG9saWNpZXMgZm9yIHRoZSB7QGxpbmsgQ29tcG9uZW50fSBkZWNvcmF0b3Inc1xuICogYGVuY2Fwc3VsYXRpb25gIG9wdGlvbi5cbiAqXG4gKiBTZWUge0BsaW5rIENvbXBvbmVudCNlbmNhcHN1bGF0aW9uIGVuY2Fwc3VsYXRpb259LlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIHtAZXhhbXBsZSBjb3JlL3RzL21ldGFkYXRhL2VuY2Fwc3VsYXRpb24udHMgcmVnaW9uPSdsb25nZm9ybSd9XG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZW51bSBWaWV3RW5jYXBzdWxhdGlvbiB7XG4gIC8vIFRPRE86IGNvbnNpZGVyIG1ha2luZyBgVmlld0VuY2Fwc3VsYXRpb25gIGEgYGNvbnN0IGVudW1gIGluc3RlYWQuIFNlZVxuICAvLyBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyL2lzc3Vlcy80NDExOSBmb3IgYWRkaXRpb25hbCBpbmZvcm1hdGlvbi5cblxuICAvKipcbiAgICogRW11bGF0ZXMgYSBuYXRpdmUgU2hhZG93IERPTSBlbmNhcHN1bGF0aW9uIGJlaGF2aW9yIGJ5IGFkZGluZyBhIHNwZWNpZmljIGF0dHJpYnV0ZSB0byB0aGVcbiAgICogY29tcG9uZW50J3MgaG9zdCBlbGVtZW50IGFuZCBhcHBseWluZyB0aGUgc2FtZSBhdHRyaWJ1dGUgdG8gYWxsIHRoZSBDU1Mgc2VsZWN0b3JzIHByb3ZpZGVkXG4gICAqIHZpYSB7QGxpbmsgQ29tcG9uZW50I3N0eWxlcyBzdHlsZXN9IG9yIHtAbGluayBDb21wb25lbnQjc3R5bGVVcmxzIHN0eWxlVXJsc30uXG4gICAqXG4gICAqIFRoaXMgaXMgdGhlIGRlZmF1bHQgb3B0aW9uLlxuICAgKi9cbiAgRW11bGF0ZWQgPSAwLFxuXG4gIC8vIEhpc3RvcmljYWxseSB0aGUgMSB2YWx1ZSB3YXMgZm9yIGBOYXRpdmVgIGVuY2Fwc3VsYXRpb24gd2hpY2ggaGFzIGJlZW4gcmVtb3ZlZCBhcyBvZiB2MTEuXG5cbiAgLyoqXG4gICAqIERvZXNuJ3QgcHJvdmlkZSBhbnkgc29ydCBvZiBDU1Mgc3R5bGUgZW5jYXBzdWxhdGlvbiwgbWVhbmluZyB0aGF0IGFsbCB0aGUgc3R5bGVzIHByb3ZpZGVkXG4gICAqIHZpYSB7QGxpbmsgQ29tcG9uZW50I3N0eWxlcyBzdHlsZXN9IG9yIHtAbGluayBDb21wb25lbnQjc3R5bGVVcmxzIHN0eWxlVXJsc30gYXJlIGFwcGxpY2FibGVcbiAgICogdG8gYW55IEhUTUwgZWxlbWVudCBvZiB0aGUgYXBwbGljYXRpb24gcmVnYXJkbGVzcyBvZiB0aGVpciBob3N0IENvbXBvbmVudC5cbiAgICovXG4gIE5vbmUgPSAyLFxuXG4gIC8qKlxuICAgKiBVc2VzIHRoZSBicm93c2VyJ3MgbmF0aXZlIFNoYWRvdyBET00gQVBJIHRvIGVuY2Fwc3VsYXRlIENTUyBzdHlsZXMsIG1lYW5pbmcgdGhhdCBpdCBjcmVhdGVzXG4gICAqIGEgU2hhZG93Um9vdCBmb3IgdGhlIGNvbXBvbmVudCdzIGhvc3QgZWxlbWVudCB3aGljaCBpcyB0aGVuIHVzZWQgdG8gZW5jYXBzdWxhdGVcbiAgICogYWxsIHRoZSBDb21wb25lbnQncyBzdHlsaW5nLlxuICAgKi9cbiAgU2hhZG93RG9tID0gMyxcbn1cbiJdfQ==