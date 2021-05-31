/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { CdkStepperNext, CdkStepperPrevious } from '@angular/cdk/stepper';
import { Directive } from '@angular/core';
/** Button that moves to the next step in a stepper workflow. */
export class MatStepperNext extends CdkStepperNext {
}
MatStepperNext.decorators = [
    { type: Directive, args: [{
                selector: 'button[matStepperNext]',
                host: {
                    'class': 'mat-stepper-next',
                    '[type]': 'type',
                },
                inputs: ['type']
            },] }
];
/** Button that moves to the previous step in a stepper workflow. */
export class MatStepperPrevious extends CdkStepperPrevious {
}
MatStepperPrevious.decorators = [
    { type: Directive, args: [{
                selector: 'button[matStepperPrevious]',
                host: {
                    'class': 'mat-stepper-previous',
                    '[type]': 'type',
                },
                inputs: ['type']
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RlcHBlci1idXR0b24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvc3RlcHBlci9zdGVwcGVyLWJ1dHRvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsY0FBYyxFQUFFLGtCQUFrQixFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFDeEUsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUV4QyxnRUFBZ0U7QUFTaEUsTUFBTSxPQUFPLGNBQWUsU0FBUSxjQUFjOzs7WUFSakQsU0FBUyxTQUFDO2dCQUNULFFBQVEsRUFBRSx3QkFBd0I7Z0JBQ2xDLElBQUksRUFBRTtvQkFDSixPQUFPLEVBQUUsa0JBQWtCO29CQUMzQixRQUFRLEVBQUUsTUFBTTtpQkFDakI7Z0JBQ0QsTUFBTSxFQUFFLENBQUMsTUFBTSxDQUFDO2FBQ2pCOztBQUlELG9FQUFvRTtBQVNwRSxNQUFNLE9BQU8sa0JBQW1CLFNBQVEsa0JBQWtCOzs7WUFSekQsU0FBUyxTQUFDO2dCQUNULFFBQVEsRUFBRSw0QkFBNEI7Z0JBQ3RDLElBQUksRUFBRTtvQkFDSixPQUFPLEVBQUUsc0JBQXNCO29CQUMvQixRQUFRLEVBQUUsTUFBTTtpQkFDakI7Z0JBQ0QsTUFBTSxFQUFFLENBQUMsTUFBTSxDQUFDO2FBQ2pCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Q2RrU3RlcHBlck5leHQsIENka1N0ZXBwZXJQcmV2aW91c30gZnJvbSAnQGFuZ3VsYXIvY2RrL3N0ZXBwZXInO1xuaW1wb3J0IHtEaXJlY3RpdmV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG4vKiogQnV0dG9uIHRoYXQgbW92ZXMgdG8gdGhlIG5leHQgc3RlcCBpbiBhIHN0ZXBwZXIgd29ya2Zsb3cuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdidXR0b25bbWF0U3RlcHBlck5leHRdJyxcbiAgaG9zdDoge1xuICAgICdjbGFzcyc6ICdtYXQtc3RlcHBlci1uZXh0JyxcbiAgICAnW3R5cGVdJzogJ3R5cGUnLFxuICB9LFxuICBpbnB1dHM6IFsndHlwZSddXG59KVxuZXhwb3J0IGNsYXNzIE1hdFN0ZXBwZXJOZXh0IGV4dGVuZHMgQ2RrU3RlcHBlck5leHQge1xufVxuXG4vKiogQnV0dG9uIHRoYXQgbW92ZXMgdG8gdGhlIHByZXZpb3VzIHN0ZXAgaW4gYSBzdGVwcGVyIHdvcmtmbG93LiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnYnV0dG9uW21hdFN0ZXBwZXJQcmV2aW91c10nLFxuICBob3N0OiB7XG4gICAgJ2NsYXNzJzogJ21hdC1zdGVwcGVyLXByZXZpb3VzJyxcbiAgICAnW3R5cGVdJzogJ3R5cGUnLFxuICB9LFxuICBpbnB1dHM6IFsndHlwZSddXG59KVxuZXhwb3J0IGNsYXNzIE1hdFN0ZXBwZXJQcmV2aW91cyBleHRlbmRzIENka1N0ZXBwZXJQcmV2aW91cyB7XG59XG4iXX0=