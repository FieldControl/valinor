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
@use '~@angular/material' as mat;
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
  )
));

// Include theme styles for core and each component used in your app.
// Alternatively, you can import and @include the theme mixins for each component
// that you are using.
@include mat.all-component-themes($${name}-theme);

`;
}
exports.createCustomTheme = createCustomTheme;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLWN1c3RvbS10aGVtZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9zY2hlbWF0aWNzL25nLWFkZC90aGVtaW5nL2NyZWF0ZS1jdXN0b20tdGhlbWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgsbUVBQW1FO0FBQ25FLFNBQWdCLGlCQUFpQixDQUFDLE9BQWUsS0FBSztJQUN0RCxPQUFPOzs7Ozs7Ozs7Ozs7OztHQWNKLElBQUk7R0FDSixJQUFJOzs7R0FHSixJQUFJOzs7O0dBSUosSUFBSTs7Z0JBRVMsSUFBSTtlQUNMLElBQUk7YUFDTixJQUFJOzs7Ozs7O3FDQU9vQixJQUFJOztDQUV4QyxDQUFDO0FBQ0YsQ0FBQztBQXJDRCw4Q0FxQ0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuLyoqIENyZWF0ZSBjdXN0b20gdGhlbWUgZm9yIHRoZSBnaXZlbiBhcHBsaWNhdGlvbiBjb25maWd1cmF0aW9uLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUN1c3RvbVRoZW1lKG5hbWU6IHN0cmluZyA9ICdhcHAnKSB7XG5yZXR1cm4gYFxuLy8gQ3VzdG9tIFRoZW1pbmcgZm9yIEFuZ3VsYXIgTWF0ZXJpYWxcbi8vIEZvciBtb3JlIGluZm9ybWF0aW9uOiBodHRwczovL21hdGVyaWFsLmFuZ3VsYXIuaW8vZ3VpZGUvdGhlbWluZ1xuQHVzZSAnfkBhbmd1bGFyL21hdGVyaWFsJyBhcyBtYXQ7XG4vLyBQbHVzIGltcG9ydHMgZm9yIG90aGVyIGNvbXBvbmVudHMgaW4geW91ciBhcHAuXG5cbi8vIEluY2x1ZGUgdGhlIGNvbW1vbiBzdHlsZXMgZm9yIEFuZ3VsYXIgTWF0ZXJpYWwuIFdlIGluY2x1ZGUgdGhpcyBoZXJlIHNvIHRoYXQgeW91IG9ubHlcbi8vIGhhdmUgdG8gbG9hZCBhIHNpbmdsZSBjc3MgZmlsZSBmb3IgQW5ndWxhciBNYXRlcmlhbCBpbiB5b3VyIGFwcC5cbi8vIEJlIHN1cmUgdGhhdCB5b3Ugb25seSBldmVyIGluY2x1ZGUgdGhpcyBtaXhpbiBvbmNlIVxuQGluY2x1ZGUgbWF0LmNvcmUoKTtcblxuLy8gRGVmaW5lIHRoZSBwYWxldHRlcyBmb3IgeW91ciB0aGVtZSB1c2luZyB0aGUgTWF0ZXJpYWwgRGVzaWduIHBhbGV0dGVzIGF2YWlsYWJsZSBpbiBwYWxldHRlLnNjc3Ncbi8vIChpbXBvcnRlZCBhYm92ZSkuIEZvciBlYWNoIHBhbGV0dGUsIHlvdSBjYW4gb3B0aW9uYWxseSBzcGVjaWZ5IGEgZGVmYXVsdCwgbGlnaHRlciwgYW5kIGRhcmtlclxuLy8gaHVlLiBBdmFpbGFibGUgY29sb3IgcGFsZXR0ZXM6IGh0dHBzOi8vbWF0ZXJpYWwuaW8vZGVzaWduL2NvbG9yL1xuJCR7bmFtZX0tcHJpbWFyeTogbWF0LmRlZmluZS1wYWxldHRlKG1hdC4kaW5kaWdvLXBhbGV0dGUpO1xuJCR7bmFtZX0tYWNjZW50OiBtYXQuZGVmaW5lLXBhbGV0dGUobWF0LiRwaW5rLXBhbGV0dGUsIEEyMDAsIEExMDAsIEE0MDApO1xuXG4vLyBUaGUgd2FybiBwYWxldHRlIGlzIG9wdGlvbmFsIChkZWZhdWx0cyB0byByZWQpLlxuJCR7bmFtZX0td2FybjogbWF0LmRlZmluZS1wYWxldHRlKG1hdC4kcmVkLXBhbGV0dGUpO1xuXG4vLyBDcmVhdGUgdGhlIHRoZW1lIG9iamVjdC4gQSB0aGVtZSBjb25zaXN0cyBvZiBjb25maWd1cmF0aW9ucyBmb3IgaW5kaXZpZHVhbFxuLy8gdGhlbWluZyBzeXN0ZW1zIHN1Y2ggYXMgXCJjb2xvclwiIG9yIFwidHlwb2dyYXBoeVwiLlxuJCR7bmFtZX0tdGhlbWU6IG1hdC5kZWZpbmUtbGlnaHQtdGhlbWUoKFxuICBjb2xvcjogKFxuICAgIHByaW1hcnk6ICQke25hbWV9LXByaW1hcnksXG4gICAgYWNjZW50OiAkJHtuYW1lfS1hY2NlbnQsXG4gICAgd2FybjogJCR7bmFtZX0td2FybixcbiAgKVxuKSk7XG5cbi8vIEluY2x1ZGUgdGhlbWUgc3R5bGVzIGZvciBjb3JlIGFuZCBlYWNoIGNvbXBvbmVudCB1c2VkIGluIHlvdXIgYXBwLlxuLy8gQWx0ZXJuYXRpdmVseSwgeW91IGNhbiBpbXBvcnQgYW5kIEBpbmNsdWRlIHRoZSB0aGVtZSBtaXhpbnMgZm9yIGVhY2ggY29tcG9uZW50XG4vLyB0aGF0IHlvdSBhcmUgdXNpbmcuXG5AaW5jbHVkZSBtYXQuYWxsLWNvbXBvbmVudC10aGVtZXMoJCR7bmFtZX0tdGhlbWUpO1xuXG5gO1xufVxuIl19