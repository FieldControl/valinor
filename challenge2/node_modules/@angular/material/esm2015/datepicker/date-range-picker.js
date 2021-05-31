/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { MatDatepickerBase } from './datepicker-base';
import { MAT_RANGE_DATE_SELECTION_MODEL_PROVIDER } from './date-selection-model';
import { MAT_CALENDAR_RANGE_STRATEGY_PROVIDER } from './date-range-selection-strategy';
// TODO(mmalerba): We use a component instead of a directive here so the user can use implicit
// template reference variables (e.g. #d vs #d="matDateRangePicker"). We can change this to a
// directive if angular adds support for `exportAs: '$implicit'` on directives.
/** Component responsible for managing the date range picker popup/dialog. */
export class MatDateRangePicker extends MatDatepickerBase {
    _forwardContentValues(instance) {
        super._forwardContentValues(instance);
        const input = this.datepickerInput;
        if (input) {
            instance.comparisonStart = input.comparisonStart;
            instance.comparisonEnd = input.comparisonEnd;
        }
    }
}
MatDateRangePicker.decorators = [
    { type: Component, args: [{
                selector: 'mat-date-range-picker',
                template: '',
                exportAs: 'matDateRangePicker',
                changeDetection: ChangeDetectionStrategy.OnPush,
                encapsulation: ViewEncapsulation.None,
                providers: [
                    MAT_RANGE_DATE_SELECTION_MODEL_PROVIDER,
                    MAT_CALENDAR_RANGE_STRATEGY_PROVIDER,
                    { provide: MatDatepickerBase, useExisting: MatDateRangePicker },
                ]
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZS1yYW5nZS1waWNrZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvZGF0ZXBpY2tlci9kYXRlLXJhbmdlLXBpY2tlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsdUJBQXVCLEVBQUUsU0FBUyxFQUFFLGlCQUFpQixFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3BGLE9BQU8sRUFBQyxpQkFBaUIsRUFBNkMsTUFBTSxtQkFBbUIsQ0FBQztBQUNoRyxPQUFPLEVBQUMsdUNBQXVDLEVBQVksTUFBTSx3QkFBd0IsQ0FBQztBQUMxRixPQUFPLEVBQUMsb0NBQW9DLEVBQUMsTUFBTSxpQ0FBaUMsQ0FBQztBQVdyRiw4RkFBOEY7QUFDOUYsNkZBQTZGO0FBQzdGLCtFQUErRTtBQUMvRSw2RUFBNkU7QUFhN0UsTUFBTSxPQUFPLGtCQUFzQixTQUFRLGlCQUN6QjtJQUNOLHFCQUFxQixDQUFDLFFBQStDO1FBQzdFLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUV0QyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDO1FBRW5DLElBQUksS0FBSyxFQUFFO1lBQ1QsUUFBUSxDQUFDLGVBQWUsR0FBRyxLQUFLLENBQUMsZUFBZSxDQUFDO1lBQ2pELFFBQVEsQ0FBQyxhQUFhLEdBQUcsS0FBSyxDQUFDLGFBQWEsQ0FBQztTQUM5QztJQUNILENBQUM7OztZQXZCRixTQUFTLFNBQUM7Z0JBQ1QsUUFBUSxFQUFFLHVCQUF1QjtnQkFDakMsUUFBUSxFQUFFLEVBQUU7Z0JBQ1osUUFBUSxFQUFFLG9CQUFvQjtnQkFDOUIsZUFBZSxFQUFFLHVCQUF1QixDQUFDLE1BQU07Z0JBQy9DLGFBQWEsRUFBRSxpQkFBaUIsQ0FBQyxJQUFJO2dCQUNyQyxTQUFTLEVBQUU7b0JBQ1QsdUNBQXVDO29CQUN2QyxvQ0FBb0M7b0JBQ3BDLEVBQUMsT0FBTyxFQUFFLGlCQUFpQixFQUFFLFdBQVcsRUFBRSxrQkFBa0IsRUFBQztpQkFDOUQ7YUFDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NoYW5nZURldGVjdGlvblN0cmF0ZWd5LCBDb21wb25lbnQsIFZpZXdFbmNhcHN1bGF0aW9ufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7TWF0RGF0ZXBpY2tlckJhc2UsIE1hdERhdGVwaWNrZXJDb250ZW50LCBNYXREYXRlcGlja2VyQ29udHJvbH0gZnJvbSAnLi9kYXRlcGlja2VyLWJhc2UnO1xuaW1wb3J0IHtNQVRfUkFOR0VfREFURV9TRUxFQ1RJT05fTU9ERUxfUFJPVklERVIsIERhdGVSYW5nZX0gZnJvbSAnLi9kYXRlLXNlbGVjdGlvbi1tb2RlbCc7XG5pbXBvcnQge01BVF9DQUxFTkRBUl9SQU5HRV9TVFJBVEVHWV9QUk9WSURFUn0gZnJvbSAnLi9kYXRlLXJhbmdlLXNlbGVjdGlvbi1zdHJhdGVneSc7XG5cbi8qKlxuICogSW5wdXQgdGhhdCBjYW4gYmUgYXNzb2NpYXRlZCB3aXRoIGEgZGF0ZSByYW5nZSBwaWNrZXIuXG4gKiBAZG9jcy1wcml2YXRlXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTWF0RGF0ZVJhbmdlUGlja2VySW5wdXQ8RD4gZXh0ZW5kcyBNYXREYXRlcGlja2VyQ29udHJvbDxEPiB7XG4gIGNvbXBhcmlzb25TdGFydDogRHxudWxsO1xuICBjb21wYXJpc29uRW5kOiBEfG51bGw7XG59XG5cbi8vIFRPRE8obW1hbGVyYmEpOiBXZSB1c2UgYSBjb21wb25lbnQgaW5zdGVhZCBvZiBhIGRpcmVjdGl2ZSBoZXJlIHNvIHRoZSB1c2VyIGNhbiB1c2UgaW1wbGljaXRcbi8vIHRlbXBsYXRlIHJlZmVyZW5jZSB2YXJpYWJsZXMgKGUuZy4gI2QgdnMgI2Q9XCJtYXREYXRlUmFuZ2VQaWNrZXJcIikuIFdlIGNhbiBjaGFuZ2UgdGhpcyB0byBhXG4vLyBkaXJlY3RpdmUgaWYgYW5ndWxhciBhZGRzIHN1cHBvcnQgZm9yIGBleHBvcnRBczogJyRpbXBsaWNpdCdgIG9uIGRpcmVjdGl2ZXMuXG4vKiogQ29tcG9uZW50IHJlc3BvbnNpYmxlIGZvciBtYW5hZ2luZyB0aGUgZGF0ZSByYW5nZSBwaWNrZXIgcG9wdXAvZGlhbG9nLiAqL1xuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnbWF0LWRhdGUtcmFuZ2UtcGlja2VyJyxcbiAgdGVtcGxhdGU6ICcnLFxuICBleHBvcnRBczogJ21hdERhdGVSYW5nZVBpY2tlcicsXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoLFxuICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lLFxuICBwcm92aWRlcnM6IFtcbiAgICBNQVRfUkFOR0VfREFURV9TRUxFQ1RJT05fTU9ERUxfUFJPVklERVIsXG4gICAgTUFUX0NBTEVOREFSX1JBTkdFX1NUUkFURUdZX1BST1ZJREVSLFxuICAgIHtwcm92aWRlOiBNYXREYXRlcGlja2VyQmFzZSwgdXNlRXhpc3Rpbmc6IE1hdERhdGVSYW5nZVBpY2tlcn0sXG4gIF1cbn0pXG5leHBvcnQgY2xhc3MgTWF0RGF0ZVJhbmdlUGlja2VyPEQ+IGV4dGVuZHMgTWF0RGF0ZXBpY2tlckJhc2U8TWF0RGF0ZVJhbmdlUGlja2VySW5wdXQ8RD4sXG4gIERhdGVSYW5nZTxEPiwgRD4ge1xuICBwcm90ZWN0ZWQgX2ZvcndhcmRDb250ZW50VmFsdWVzKGluc3RhbmNlOiBNYXREYXRlcGlja2VyQ29udGVudDxEYXRlUmFuZ2U8RD4sIEQ+KSB7XG4gICAgc3VwZXIuX2ZvcndhcmRDb250ZW50VmFsdWVzKGluc3RhbmNlKTtcblxuICAgIGNvbnN0IGlucHV0ID0gdGhpcy5kYXRlcGlja2VySW5wdXQ7XG5cbiAgICBpZiAoaW5wdXQpIHtcbiAgICAgIGluc3RhbmNlLmNvbXBhcmlzb25TdGFydCA9IGlucHV0LmNvbXBhcmlzb25TdGFydDtcbiAgICAgIGluc3RhbmNlLmNvbXBhcmlzb25FbmQgPSBpbnB1dC5jb21wYXJpc29uRW5kO1xuICAgIH1cbiAgfVxufVxuIl19