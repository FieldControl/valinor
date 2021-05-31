/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, InjectionToken, TemplateRef } from '@angular/core';
/**
 * Injection token that can be used to reference instances of `MatTabContent`. It serves as
 * alternative token to the actual `MatTabContent` class which could cause unnecessary
 * retention of the class and its directive metadata.
 */
export const MAT_TAB_CONTENT = new InjectionToken('MatTabContent');
/** Decorates the `ng-template` tags and reads out the template from it. */
export class MatTabContent {
    constructor(
    /** Content for the tab. */ template) {
        this.template = template;
    }
}
MatTabContent.decorators = [
    { type: Directive, args: [{
                selector: '[matTabContent]',
                providers: [{ provide: MAT_TAB_CONTENT, useExisting: MatTabContent }],
            },] }
];
MatTabContent.ctorParameters = () => [
    { type: TemplateRef }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFiLWNvbnRlbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvdGFicy90YWItY29udGVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsU0FBUyxFQUFFLGNBQWMsRUFBRSxXQUFXLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFckU7Ozs7R0FJRztBQUNILE1BQU0sQ0FBQyxNQUFNLGVBQWUsR0FBRyxJQUFJLGNBQWMsQ0FBZ0IsZUFBZSxDQUFDLENBQUM7QUFFbEYsMkVBQTJFO0FBSzNFLE1BQU0sT0FBTyxhQUFhO0lBQ3hCO0lBQ0UsMkJBQTJCLENBQVEsUUFBMEI7UUFBMUIsYUFBUSxHQUFSLFFBQVEsQ0FBa0I7SUFBRyxDQUFDOzs7WUFOcEUsU0FBUyxTQUFDO2dCQUNULFFBQVEsRUFBRSxpQkFBaUI7Z0JBQzNCLFNBQVMsRUFBRSxDQUFDLEVBQUMsT0FBTyxFQUFFLGVBQWUsRUFBRSxXQUFXLEVBQUUsYUFBYSxFQUFDLENBQUM7YUFDcEU7OztZQWJrQyxXQUFXIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RGlyZWN0aXZlLCBJbmplY3Rpb25Ub2tlbiwgVGVtcGxhdGVSZWZ9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG4vKipcbiAqIEluamVjdGlvbiB0b2tlbiB0aGF0IGNhbiBiZSB1c2VkIHRvIHJlZmVyZW5jZSBpbnN0YW5jZXMgb2YgYE1hdFRhYkNvbnRlbnRgLiBJdCBzZXJ2ZXMgYXNcbiAqIGFsdGVybmF0aXZlIHRva2VuIHRvIHRoZSBhY3R1YWwgYE1hdFRhYkNvbnRlbnRgIGNsYXNzIHdoaWNoIGNvdWxkIGNhdXNlIHVubmVjZXNzYXJ5XG4gKiByZXRlbnRpb24gb2YgdGhlIGNsYXNzIGFuZCBpdHMgZGlyZWN0aXZlIG1ldGFkYXRhLlxuICovXG5leHBvcnQgY29uc3QgTUFUX1RBQl9DT05URU5UID0gbmV3IEluamVjdGlvblRva2VuPE1hdFRhYkNvbnRlbnQ+KCdNYXRUYWJDb250ZW50Jyk7XG5cbi8qKiBEZWNvcmF0ZXMgdGhlIGBuZy10ZW1wbGF0ZWAgdGFncyBhbmQgcmVhZHMgb3V0IHRoZSB0ZW1wbGF0ZSBmcm9tIGl0LiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW21hdFRhYkNvbnRlbnRdJyxcbiAgcHJvdmlkZXJzOiBbe3Byb3ZpZGU6IE1BVF9UQUJfQ09OVEVOVCwgdXNlRXhpc3Rpbmc6IE1hdFRhYkNvbnRlbnR9XSxcbn0pXG5leHBvcnQgY2xhc3MgTWF0VGFiQ29udGVudCB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIC8qKiBDb250ZW50IGZvciB0aGUgdGFiLiAqLyBwdWJsaWMgdGVtcGxhdGU6IFRlbXBsYXRlUmVmPGFueT4pIHt9XG59XG4iXX0=