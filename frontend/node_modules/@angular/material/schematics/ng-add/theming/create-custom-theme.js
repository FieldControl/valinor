"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCustomTheme = void 0;
/** Create custom theme for the given application configuration. */
function createCustomTheme(name = 'app') {
    return `
// Custom Theming for Angular Material
// For more information: https://material.angular.io/guide/theming
@use '@angular/material' as mat;
// Plus imports for other components in your app.

// Include the common styles for Angular Material. We include this here so that you only
// have to load a single css file for Angular Material in your app.
// Be sure that you only ever include this mixin once!
@include mat.core();

// Define the palettes for your theme using the Material Design palettes available in palette.scss
// (imported above). For each palette, you can optionally specify a default, lighter, and darker
// hue. Available color palettes: https://material.io/design/color/
$${name}-primary: mat.define-palette(mat.$indigo-palette);
$${name}-accent: mat.define-palette(mat.$pink-palette, A200, A100, A400);

// The warn palette is optional (defaults to red).
$${name}-warn: mat.define-palette(mat.$red-palette);

// Create the theme object. A theme consists of configurations for individual
// theming systems such as "color" or "typography".
$${name}-theme: mat.define-light-theme((
  color: (
    primary: $${name}-primary,
    accent: $${name}-accent,
    warn: $${name}-warn,
  ),
  typography: mat.define-typography-config(),
  density: 0
));

// Include theme styles for core and each component used in your app.
// Alternatively, you can import and @include the theme mixins for each component
// that you are using.
@include mat.all-component-themes($${name}-theme);

`;
}
exports.createCustomTheme = createCustomTheme;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLWN1c3RvbS10aGVtZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9zY2hlbWF0aWNzL25nLWFkZC90aGVtaW5nL2NyZWF0ZS1jdXN0b20tdGhlbWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgsbUVBQW1FO0FBQ25FLFNBQWdCLGlCQUFpQixDQUFDLE9BQWUsS0FBSztJQUNwRCxPQUFPOzs7Ozs7Ozs7Ozs7OztHQWNOLElBQUk7R0FDSixJQUFJOzs7R0FHSixJQUFJOzs7O0dBSUosSUFBSTs7Z0JBRVMsSUFBSTtlQUNMLElBQUk7YUFDTixJQUFJOzs7Ozs7Ozs7cUNBU29CLElBQUk7O0NBRXhDLENBQUM7QUFDRixDQUFDO0FBdkNELDhDQXVDQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG4vKiogQ3JlYXRlIGN1c3RvbSB0aGVtZSBmb3IgdGhlIGdpdmVuIGFwcGxpY2F0aW9uIGNvbmZpZ3VyYXRpb24uICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQ3VzdG9tVGhlbWUobmFtZTogc3RyaW5nID0gJ2FwcCcpIHtcbiAgcmV0dXJuIGBcbi8vIEN1c3RvbSBUaGVtaW5nIGZvciBBbmd1bGFyIE1hdGVyaWFsXG4vLyBGb3IgbW9yZSBpbmZvcm1hdGlvbjogaHR0cHM6Ly9tYXRlcmlhbC5hbmd1bGFyLmlvL2d1aWRlL3RoZW1pbmdcbkB1c2UgJ0Bhbmd1bGFyL21hdGVyaWFsJyBhcyBtYXQ7XG4vLyBQbHVzIGltcG9ydHMgZm9yIG90aGVyIGNvbXBvbmVudHMgaW4geW91ciBhcHAuXG5cbi8vIEluY2x1ZGUgdGhlIGNvbW1vbiBzdHlsZXMgZm9yIEFuZ3VsYXIgTWF0ZXJpYWwuIFdlIGluY2x1ZGUgdGhpcyBoZXJlIHNvIHRoYXQgeW91IG9ubHlcbi8vIGhhdmUgdG8gbG9hZCBhIHNpbmdsZSBjc3MgZmlsZSBmb3IgQW5ndWxhciBNYXRlcmlhbCBpbiB5b3VyIGFwcC5cbi8vIEJlIHN1cmUgdGhhdCB5b3Ugb25seSBldmVyIGluY2x1ZGUgdGhpcyBtaXhpbiBvbmNlIVxuQGluY2x1ZGUgbWF0LmNvcmUoKTtcblxuLy8gRGVmaW5lIHRoZSBwYWxldHRlcyBmb3IgeW91ciB0aGVtZSB1c2luZyB0aGUgTWF0ZXJpYWwgRGVzaWduIHBhbGV0dGVzIGF2YWlsYWJsZSBpbiBwYWxldHRlLnNjc3Ncbi8vIChpbXBvcnRlZCBhYm92ZSkuIEZvciBlYWNoIHBhbGV0dGUsIHlvdSBjYW4gb3B0aW9uYWxseSBzcGVjaWZ5IGEgZGVmYXVsdCwgbGlnaHRlciwgYW5kIGRhcmtlclxuLy8gaHVlLiBBdmFpbGFibGUgY29sb3IgcGFsZXR0ZXM6IGh0dHBzOi8vbWF0ZXJpYWwuaW8vZGVzaWduL2NvbG9yL1xuJCR7bmFtZX0tcHJpbWFyeTogbWF0LmRlZmluZS1wYWxldHRlKG1hdC4kaW5kaWdvLXBhbGV0dGUpO1xuJCR7bmFtZX0tYWNjZW50OiBtYXQuZGVmaW5lLXBhbGV0dGUobWF0LiRwaW5rLXBhbGV0dGUsIEEyMDAsIEExMDAsIEE0MDApO1xuXG4vLyBUaGUgd2FybiBwYWxldHRlIGlzIG9wdGlvbmFsIChkZWZhdWx0cyB0byByZWQpLlxuJCR7bmFtZX0td2FybjogbWF0LmRlZmluZS1wYWxldHRlKG1hdC4kcmVkLXBhbGV0dGUpO1xuXG4vLyBDcmVhdGUgdGhlIHRoZW1lIG9iamVjdC4gQSB0aGVtZSBjb25zaXN0cyBvZiBjb25maWd1cmF0aW9ucyBmb3IgaW5kaXZpZHVhbFxuLy8gdGhlbWluZyBzeXN0ZW1zIHN1Y2ggYXMgXCJjb2xvclwiIG9yIFwidHlwb2dyYXBoeVwiLlxuJCR7bmFtZX0tdGhlbWU6IG1hdC5kZWZpbmUtbGlnaHQtdGhlbWUoKFxuICBjb2xvcjogKFxuICAgIHByaW1hcnk6ICQke25hbWV9LXByaW1hcnksXG4gICAgYWNjZW50OiAkJHtuYW1lfS1hY2NlbnQsXG4gICAgd2FybjogJCR7bmFtZX0td2FybixcbiAgKSxcbiAgdHlwb2dyYXBoeTogbWF0LmRlZmluZS10eXBvZ3JhcGh5LWNvbmZpZygpLFxuICBkZW5zaXR5OiAwXG4pKTtcblxuLy8gSW5jbHVkZSB0aGVtZSBzdHlsZXMgZm9yIGNvcmUgYW5kIGVhY2ggY29tcG9uZW50IHVzZWQgaW4geW91ciBhcHAuXG4vLyBBbHRlcm5hdGl2ZWx5LCB5b3UgY2FuIGltcG9ydCBhbmQgQGluY2x1ZGUgdGhlIHRoZW1lIG1peGlucyBmb3IgZWFjaCBjb21wb25lbnRcbi8vIHRoYXQgeW91IGFyZSB1c2luZy5cbkBpbmNsdWRlIG1hdC5hbGwtY29tcG9uZW50LXRoZW1lcygkJHtuYW1lfS10aGVtZSk7XG5cbmA7XG59XG4iXX0=