/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { NgModule } from '@angular/core';
import { MatCommonModule } from '@angular/material/core';
import { MAT_DIALOG_SCROLL_STRATEGY_PROVIDER, MatDialog } from './dialog';
import { MatDialogContainer } from './dialog-container';
import { MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle, } from './dialog-content-directives';
export class MatDialogModule {
}
MatDialogModule.decorators = [
    { type: NgModule, args: [{
                imports: [
                    OverlayModule,
                    PortalModule,
                    MatCommonModule,
                ],
                exports: [
                    MatDialogContainer,
                    MatDialogClose,
                    MatDialogTitle,
                    MatDialogContent,
                    MatDialogActions,
                    MatCommonModule,
                ],
                declarations: [
                    MatDialogContainer,
                    MatDialogClose,
                    MatDialogTitle,
                    MatDialogActions,
                    MatDialogContent,
                ],
                providers: [
                    MatDialog,
                    MAT_DIALOG_SCROLL_STRATEGY_PROVIDER,
                ],
                entryComponents: [MatDialogContainer],
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhbG9nLW1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9kaWFsb2cvZGlhbG9nLW1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsYUFBYSxFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFDbkQsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQ2pELE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDdkMsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBQ3ZELE9BQU8sRUFBQyxtQ0FBbUMsRUFBRSxTQUFTLEVBQUMsTUFBTSxVQUFVLENBQUM7QUFDeEUsT0FBTyxFQUFDLGtCQUFrQixFQUFDLE1BQU0sb0JBQW9CLENBQUM7QUFDdEQsT0FBTyxFQUNMLGdCQUFnQixFQUNoQixjQUFjLEVBQ2QsZ0JBQWdCLEVBQ2hCLGNBQWMsR0FDZixNQUFNLDZCQUE2QixDQUFDO0FBOEJyQyxNQUFNLE9BQU8sZUFBZTs7O1lBM0IzQixRQUFRLFNBQUM7Z0JBQ1IsT0FBTyxFQUFFO29CQUNQLGFBQWE7b0JBQ2IsWUFBWTtvQkFDWixlQUFlO2lCQUNoQjtnQkFDRCxPQUFPLEVBQUU7b0JBQ1Asa0JBQWtCO29CQUNsQixjQUFjO29CQUNkLGNBQWM7b0JBQ2QsZ0JBQWdCO29CQUNoQixnQkFBZ0I7b0JBQ2hCLGVBQWU7aUJBQ2hCO2dCQUNELFlBQVksRUFBRTtvQkFDWixrQkFBa0I7b0JBQ2xCLGNBQWM7b0JBQ2QsY0FBYztvQkFDZCxnQkFBZ0I7b0JBQ2hCLGdCQUFnQjtpQkFDakI7Z0JBQ0QsU0FBUyxFQUFFO29CQUNULFNBQVM7b0JBQ1QsbUNBQW1DO2lCQUNwQztnQkFDRCxlQUFlLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQzthQUN0QyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge092ZXJsYXlNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2Nkay9vdmVybGF5JztcbmltcG9ydCB7UG9ydGFsTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jZGsvcG9ydGFsJztcbmltcG9ydCB7TmdNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtNYXRDb21tb25Nb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL2NvcmUnO1xuaW1wb3J0IHtNQVRfRElBTE9HX1NDUk9MTF9TVFJBVEVHWV9QUk9WSURFUiwgTWF0RGlhbG9nfSBmcm9tICcuL2RpYWxvZyc7XG5pbXBvcnQge01hdERpYWxvZ0NvbnRhaW5lcn0gZnJvbSAnLi9kaWFsb2ctY29udGFpbmVyJztcbmltcG9ydCB7XG4gIE1hdERpYWxvZ0FjdGlvbnMsXG4gIE1hdERpYWxvZ0Nsb3NlLFxuICBNYXREaWFsb2dDb250ZW50LFxuICBNYXREaWFsb2dUaXRsZSxcbn0gZnJvbSAnLi9kaWFsb2ctY29udGVudC1kaXJlY3RpdmVzJztcblxuXG5ATmdNb2R1bGUoe1xuICBpbXBvcnRzOiBbXG4gICAgT3ZlcmxheU1vZHVsZSxcbiAgICBQb3J0YWxNb2R1bGUsXG4gICAgTWF0Q29tbW9uTW9kdWxlLFxuICBdLFxuICBleHBvcnRzOiBbXG4gICAgTWF0RGlhbG9nQ29udGFpbmVyLFxuICAgIE1hdERpYWxvZ0Nsb3NlLFxuICAgIE1hdERpYWxvZ1RpdGxlLFxuICAgIE1hdERpYWxvZ0NvbnRlbnQsXG4gICAgTWF0RGlhbG9nQWN0aW9ucyxcbiAgICBNYXRDb21tb25Nb2R1bGUsXG4gIF0sXG4gIGRlY2xhcmF0aW9uczogW1xuICAgIE1hdERpYWxvZ0NvbnRhaW5lcixcbiAgICBNYXREaWFsb2dDbG9zZSxcbiAgICBNYXREaWFsb2dUaXRsZSxcbiAgICBNYXREaWFsb2dBY3Rpb25zLFxuICAgIE1hdERpYWxvZ0NvbnRlbnQsXG4gIF0sXG4gIHByb3ZpZGVyczogW1xuICAgIE1hdERpYWxvZyxcbiAgICBNQVRfRElBTE9HX1NDUk9MTF9TVFJBVEVHWV9QUk9WSURFUixcbiAgXSxcbiAgZW50cnlDb21wb25lbnRzOiBbTWF0RGlhbG9nQ29udGFpbmVyXSxcbn0pXG5leHBvcnQgY2xhc3MgTWF0RGlhbG9nTW9kdWxlIHt9XG4iXX0=