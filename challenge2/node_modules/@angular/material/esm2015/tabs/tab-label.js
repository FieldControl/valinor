/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, InjectionToken } from '@angular/core';
import { CdkPortal } from '@angular/cdk/portal';
/**
 * Injection token that can be used to reference instances of `MatTabLabel`. It serves as
 * alternative token to the actual `MatTabLabel` class which could cause unnecessary
 * retention of the class and its directive metadata.
 */
export const MAT_TAB_LABEL = new InjectionToken('MatTabLabel');
/** Used to flag tab labels for use with the portal directive */
export class MatTabLabel extends CdkPortal {
}
MatTabLabel.decorators = [
    { type: Directive, args: [{
                selector: '[mat-tab-label], [matTabLabel]',
                providers: [{ provide: MAT_TAB_LABEL, useExisting: MatTabLabel }],
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFiLWxhYmVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL3RhYnMvdGFiLWxhYmVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxTQUFTLEVBQUUsY0FBYyxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3hELE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUU5Qzs7OztHQUlHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sYUFBYSxHQUFHLElBQUksY0FBYyxDQUFjLGFBQWEsQ0FBQyxDQUFDO0FBRTVFLGdFQUFnRTtBQUtoRSxNQUFNLE9BQU8sV0FBWSxTQUFRLFNBQVM7OztZQUp6QyxTQUFTLFNBQUM7Z0JBQ1QsUUFBUSxFQUFFLGdDQUFnQztnQkFDMUMsU0FBUyxFQUFFLENBQUMsRUFBQyxPQUFPLEVBQUUsYUFBYSxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUMsQ0FBQzthQUNoRSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0RpcmVjdGl2ZSwgSW5qZWN0aW9uVG9rZW59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtDZGtQb3J0YWx9IGZyb20gJ0Bhbmd1bGFyL2Nkay9wb3J0YWwnO1xuXG4vKipcbiAqIEluamVjdGlvbiB0b2tlbiB0aGF0IGNhbiBiZSB1c2VkIHRvIHJlZmVyZW5jZSBpbnN0YW5jZXMgb2YgYE1hdFRhYkxhYmVsYC4gSXQgc2VydmVzIGFzXG4gKiBhbHRlcm5hdGl2ZSB0b2tlbiB0byB0aGUgYWN0dWFsIGBNYXRUYWJMYWJlbGAgY2xhc3Mgd2hpY2ggY291bGQgY2F1c2UgdW5uZWNlc3NhcnlcbiAqIHJldGVudGlvbiBvZiB0aGUgY2xhc3MgYW5kIGl0cyBkaXJlY3RpdmUgbWV0YWRhdGEuXG4gKi9cbmV4cG9ydCBjb25zdCBNQVRfVEFCX0xBQkVMID0gbmV3IEluamVjdGlvblRva2VuPE1hdFRhYkxhYmVsPignTWF0VGFiTGFiZWwnKTtcblxuLyoqIFVzZWQgdG8gZmxhZyB0YWIgbGFiZWxzIGZvciB1c2Ugd2l0aCB0aGUgcG9ydGFsIGRpcmVjdGl2ZSAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW21hdC10YWItbGFiZWxdLCBbbWF0VGFiTGFiZWxdJyxcbiAgcHJvdmlkZXJzOiBbe3Byb3ZpZGU6IE1BVF9UQUJfTEFCRUwsIHVzZUV4aXN0aW5nOiBNYXRUYWJMYWJlbH1dLFxufSlcbmV4cG9ydCBjbGFzcyBNYXRUYWJMYWJlbCBleHRlbmRzIENka1BvcnRhbCB7fVxuIl19