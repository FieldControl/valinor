/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, InjectionToken } from '@angular/core';
/**
 * Injection token that can be used to reference instances of `MatPrefix`. It serves as
 * alternative token to the actual `MatPrefix` class which could cause unnecessary
 * retention of the class and its directive metadata.
 */
export const MAT_PREFIX = new InjectionToken('MatPrefix');
/** Prefix to be placed in front of the form field. */
export class MatPrefix {
}
MatPrefix.decorators = [
    { type: Directive, args: [{
                selector: '[matPrefix]',
                providers: [{ provide: MAT_PREFIX, useExisting: MatPrefix }],
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlZml4LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL2Zvcm0tZmllbGQvcHJlZml4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxTQUFTLEVBQUUsY0FBYyxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRXhEOzs7O0dBSUc7QUFDSCxNQUFNLENBQUMsTUFBTSxVQUFVLEdBQUcsSUFBSSxjQUFjLENBQVksV0FBVyxDQUFDLENBQUM7QUFFckUsc0RBQXNEO0FBS3RELE1BQU0sT0FBTyxTQUFTOzs7WUFKckIsU0FBUyxTQUFDO2dCQUNULFFBQVEsRUFBRSxhQUFhO2dCQUN2QixTQUFTLEVBQUUsQ0FBQyxFQUFDLE9BQU8sRUFBRSxVQUFVLEVBQUUsV0FBVyxFQUFFLFNBQVMsRUFBQyxDQUFDO2FBQzNEIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RGlyZWN0aXZlLCBJbmplY3Rpb25Ub2tlbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbi8qKlxuICogSW5qZWN0aW9uIHRva2VuIHRoYXQgY2FuIGJlIHVzZWQgdG8gcmVmZXJlbmNlIGluc3RhbmNlcyBvZiBgTWF0UHJlZml4YC4gSXQgc2VydmVzIGFzXG4gKiBhbHRlcm5hdGl2ZSB0b2tlbiB0byB0aGUgYWN0dWFsIGBNYXRQcmVmaXhgIGNsYXNzIHdoaWNoIGNvdWxkIGNhdXNlIHVubmVjZXNzYXJ5XG4gKiByZXRlbnRpb24gb2YgdGhlIGNsYXNzIGFuZCBpdHMgZGlyZWN0aXZlIG1ldGFkYXRhLlxuICovXG5leHBvcnQgY29uc3QgTUFUX1BSRUZJWCA9IG5ldyBJbmplY3Rpb25Ub2tlbjxNYXRQcmVmaXg+KCdNYXRQcmVmaXgnKTtcblxuLyoqIFByZWZpeCB0byBiZSBwbGFjZWQgaW4gZnJvbnQgb2YgdGhlIGZvcm0gZmllbGQuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbbWF0UHJlZml4XScsXG4gIHByb3ZpZGVyczogW3twcm92aWRlOiBNQVRfUFJFRklYLCB1c2VFeGlzdGluZzogTWF0UHJlZml4fV0sXG59KVxuZXhwb3J0IGNsYXNzIE1hdFByZWZpeCB7fVxuIl19