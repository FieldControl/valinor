/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, TemplateRef } from '@angular/core';
/**
 * Expansion panel content that will be rendered lazily
 * after the panel is opened for the first time.
 */
export class MatExpansionPanelContent {
    constructor(_template) {
        this._template = _template;
    }
}
MatExpansionPanelContent.decorators = [
    { type: Directive, args: [{
                selector: 'ng-template[matExpansionPanelContent]'
            },] }
];
MatExpansionPanelContent.ctorParameters = () => [
    { type: TemplateRef }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwYW5zaW9uLXBhbmVsLWNvbnRlbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvZXhwYW5zaW9uL2V4cGFuc2lvbi1wYW5lbC1jb250ZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxTQUFTLEVBQUUsV0FBVyxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRXJEOzs7R0FHRztBQUlILE1BQU0sT0FBTyx3QkFBd0I7SUFDbkMsWUFBbUIsU0FBMkI7UUFBM0IsY0FBUyxHQUFULFNBQVMsQ0FBa0I7SUFBRyxDQUFDOzs7WUFKbkQsU0FBUyxTQUFDO2dCQUNULFFBQVEsRUFBRSx1Q0FBdUM7YUFDbEQ7OztZQVJrQixXQUFXIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RGlyZWN0aXZlLCBUZW1wbGF0ZVJlZn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbi8qKlxuICogRXhwYW5zaW9uIHBhbmVsIGNvbnRlbnQgdGhhdCB3aWxsIGJlIHJlbmRlcmVkIGxhemlseVxuICogYWZ0ZXIgdGhlIHBhbmVsIGlzIG9wZW5lZCBmb3IgdGhlIGZpcnN0IHRpbWUuXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ25nLXRlbXBsYXRlW21hdEV4cGFuc2lvblBhbmVsQ29udGVudF0nXG59KVxuZXhwb3J0IGNsYXNzIE1hdEV4cGFuc2lvblBhbmVsQ29udGVudCB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBfdGVtcGxhdGU6IFRlbXBsYXRlUmVmPGFueT4pIHt9XG59XG4iXX0=