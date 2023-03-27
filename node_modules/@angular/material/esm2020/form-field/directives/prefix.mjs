/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, InjectionToken, Input } from '@angular/core';
import * as i0 from "@angular/core";
/**
 * Injection token that can be used to reference instances of `MatPrefix`. It serves as
 * alternative token to the actual `MatPrefix` class which could cause unnecessary
 * retention of the class and its directive metadata.
 */
export const MAT_PREFIX = new InjectionToken('MatPrefix');
/** Prefix to be placed in front of the form field. */
export class MatPrefix {
    constructor() {
        this._isText = false;
    }
    set _isTextSelector(value) {
        this._isText = true;
    }
}
MatPrefix.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: MatPrefix, deps: [], target: i0.ɵɵFactoryTarget.Directive });
MatPrefix.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "15.2.0-rc.0", type: MatPrefix, selector: "[matPrefix], [matIconPrefix], [matTextPrefix]", inputs: { _isTextSelector: ["matTextPrefix", "_isTextSelector"] }, providers: [{ provide: MAT_PREFIX, useExisting: MatPrefix }], ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: MatPrefix, decorators: [{
            type: Directive,
            args: [{
                    selector: '[matPrefix], [matIconPrefix], [matTextPrefix]',
                    providers: [{ provide: MAT_PREFIX, useExisting: MatPrefix }],
                }]
        }], propDecorators: { _isTextSelector: [{
                type: Input,
                args: ['matTextPrefix']
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlZml4LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL2Zvcm0tZmllbGQvZGlyZWN0aXZlcy9wcmVmaXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFNBQVMsRUFBRSxjQUFjLEVBQUUsS0FBSyxFQUFDLE1BQU0sZUFBZSxDQUFDOztBQUUvRDs7OztHQUlHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sVUFBVSxHQUFHLElBQUksY0FBYyxDQUFZLFdBQVcsQ0FBQyxDQUFDO0FBRXJFLHNEQUFzRDtBQUt0RCxNQUFNLE9BQU8sU0FBUztJQUp0QjtRQVVFLFlBQU8sR0FBRyxLQUFLLENBQUM7S0FDakI7SUFOQyxJQUNJLGVBQWUsQ0FBQyxLQUFTO1FBQzNCLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO0lBQ3RCLENBQUM7OzJHQUpVLFNBQVM7K0ZBQVQsU0FBUywySUFGVCxDQUFDLEVBQUMsT0FBTyxFQUFFLFVBQVUsRUFBRSxXQUFXLEVBQUUsU0FBUyxFQUFDLENBQUM7Z0dBRS9DLFNBQVM7a0JBSnJCLFNBQVM7bUJBQUM7b0JBQ1QsUUFBUSxFQUFFLCtDQUErQztvQkFDekQsU0FBUyxFQUFFLENBQUMsRUFBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLFdBQVcsV0FBVyxFQUFDLENBQUM7aUJBQzNEOzhCQUdLLGVBQWU7c0JBRGxCLEtBQUs7dUJBQUMsZUFBZSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0RpcmVjdGl2ZSwgSW5qZWN0aW9uVG9rZW4sIElucHV0fSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuLyoqXG4gKiBJbmplY3Rpb24gdG9rZW4gdGhhdCBjYW4gYmUgdXNlZCB0byByZWZlcmVuY2UgaW5zdGFuY2VzIG9mIGBNYXRQcmVmaXhgLiBJdCBzZXJ2ZXMgYXNcbiAqIGFsdGVybmF0aXZlIHRva2VuIHRvIHRoZSBhY3R1YWwgYE1hdFByZWZpeGAgY2xhc3Mgd2hpY2ggY291bGQgY2F1c2UgdW5uZWNlc3NhcnlcbiAqIHJldGVudGlvbiBvZiB0aGUgY2xhc3MgYW5kIGl0cyBkaXJlY3RpdmUgbWV0YWRhdGEuXG4gKi9cbmV4cG9ydCBjb25zdCBNQVRfUFJFRklYID0gbmV3IEluamVjdGlvblRva2VuPE1hdFByZWZpeD4oJ01hdFByZWZpeCcpO1xuXG4vKiogUHJlZml4IHRvIGJlIHBsYWNlZCBpbiBmcm9udCBvZiB0aGUgZm9ybSBmaWVsZC4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1ttYXRQcmVmaXhdLCBbbWF0SWNvblByZWZpeF0sIFttYXRUZXh0UHJlZml4XScsXG4gIHByb3ZpZGVyczogW3twcm92aWRlOiBNQVRfUFJFRklYLCB1c2VFeGlzdGluZzogTWF0UHJlZml4fV0sXG59KVxuZXhwb3J0IGNsYXNzIE1hdFByZWZpeCB7XG4gIEBJbnB1dCgnbWF0VGV4dFByZWZpeCcpXG4gIHNldCBfaXNUZXh0U2VsZWN0b3IodmFsdWU6ICcnKSB7XG4gICAgdGhpcy5faXNUZXh0ID0gdHJ1ZTtcbiAgfVxuXG4gIF9pc1RleHQgPSBmYWxzZTtcbn1cbiJdfQ==