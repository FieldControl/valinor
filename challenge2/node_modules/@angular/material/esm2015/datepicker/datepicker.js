/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { MatDatepickerBase } from './datepicker-base';
import { MAT_SINGLE_DATE_SELECTION_MODEL_PROVIDER } from './date-selection-model';
// TODO(mmalerba): We use a component instead of a directive here so the user can use implicit
// template reference variables (e.g. #d vs #d="matDatepicker"). We can change this to a directive
// if angular adds support for `exportAs: '$implicit'` on directives.
/** Component responsible for managing the datepicker popup/dialog. */
export class MatDatepicker extends MatDatepickerBase {
}
MatDatepicker.decorators = [
    { type: Component, args: [{
                selector: 'mat-datepicker',
                template: '',
                exportAs: 'matDatepicker',
                changeDetection: ChangeDetectionStrategy.OnPush,
                encapsulation: ViewEncapsulation.None,
                providers: [
                    MAT_SINGLE_DATE_SELECTION_MODEL_PROVIDER,
                    { provide: MatDatepickerBase, useExisting: MatDatepicker },
                ]
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZXBpY2tlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9kYXRlcGlja2VyL2RhdGVwaWNrZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLHVCQUF1QixFQUFFLFNBQVMsRUFBRSxpQkFBaUIsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUNwRixPQUFPLEVBQUMsaUJBQWlCLEVBQXVCLE1BQU0sbUJBQW1CLENBQUM7QUFDMUUsT0FBTyxFQUFDLHdDQUF3QyxFQUFDLE1BQU0sd0JBQXdCLENBQUM7QUFFaEYsOEZBQThGO0FBQzlGLGtHQUFrRztBQUNsRyxxRUFBcUU7QUFDckUsc0VBQXNFO0FBWXRFLE1BQU0sT0FBTyxhQUFpQixTQUFRLGlCQUF1RDs7O1lBWDVGLFNBQVMsU0FBQztnQkFDVCxRQUFRLEVBQUUsZ0JBQWdCO2dCQUMxQixRQUFRLEVBQUUsRUFBRTtnQkFDWixRQUFRLEVBQUUsZUFBZTtnQkFDekIsZUFBZSxFQUFFLHVCQUF1QixDQUFDLE1BQU07Z0JBQy9DLGFBQWEsRUFBRSxpQkFBaUIsQ0FBQyxJQUFJO2dCQUNyQyxTQUFTLEVBQUU7b0JBQ1Qsd0NBQXdDO29CQUN4QyxFQUFDLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxXQUFXLEVBQUUsYUFBYSxFQUFDO2lCQUN6RDthQUNGIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Q2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksIENvbXBvbmVudCwgVmlld0VuY2Fwc3VsYXRpb259IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtNYXREYXRlcGlja2VyQmFzZSwgTWF0RGF0ZXBpY2tlckNvbnRyb2x9IGZyb20gJy4vZGF0ZXBpY2tlci1iYXNlJztcbmltcG9ydCB7TUFUX1NJTkdMRV9EQVRFX1NFTEVDVElPTl9NT0RFTF9QUk9WSURFUn0gZnJvbSAnLi9kYXRlLXNlbGVjdGlvbi1tb2RlbCc7XG5cbi8vIFRPRE8obW1hbGVyYmEpOiBXZSB1c2UgYSBjb21wb25lbnQgaW5zdGVhZCBvZiBhIGRpcmVjdGl2ZSBoZXJlIHNvIHRoZSB1c2VyIGNhbiB1c2UgaW1wbGljaXRcbi8vIHRlbXBsYXRlIHJlZmVyZW5jZSB2YXJpYWJsZXMgKGUuZy4gI2QgdnMgI2Q9XCJtYXREYXRlcGlja2VyXCIpLiBXZSBjYW4gY2hhbmdlIHRoaXMgdG8gYSBkaXJlY3RpdmVcbi8vIGlmIGFuZ3VsYXIgYWRkcyBzdXBwb3J0IGZvciBgZXhwb3J0QXM6ICckaW1wbGljaXQnYCBvbiBkaXJlY3RpdmVzLlxuLyoqIENvbXBvbmVudCByZXNwb25zaWJsZSBmb3IgbWFuYWdpbmcgdGhlIGRhdGVwaWNrZXIgcG9wdXAvZGlhbG9nLiAqL1xuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnbWF0LWRhdGVwaWNrZXInLFxuICB0ZW1wbGF0ZTogJycsXG4gIGV4cG9ydEFzOiAnbWF0RGF0ZXBpY2tlcicsXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoLFxuICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lLFxuICBwcm92aWRlcnM6IFtcbiAgICBNQVRfU0lOR0xFX0RBVEVfU0VMRUNUSU9OX01PREVMX1BST1ZJREVSLFxuICAgIHtwcm92aWRlOiBNYXREYXRlcGlja2VyQmFzZSwgdXNlRXhpc3Rpbmc6IE1hdERhdGVwaWNrZXJ9LFxuICBdXG59KVxuZXhwb3J0IGNsYXNzIE1hdERhdGVwaWNrZXI8RD4gZXh0ZW5kcyBNYXREYXRlcGlja2VyQmFzZTxNYXREYXRlcGlja2VyQ29udHJvbDxEPiwgRCB8IG51bGwsIEQ+IHtcbn1cbiJdfQ==