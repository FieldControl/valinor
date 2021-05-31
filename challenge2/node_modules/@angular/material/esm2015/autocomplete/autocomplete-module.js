/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayModule } from '@angular/cdk/overlay';
import { MatOptionModule, MatCommonModule } from '@angular/material/core';
import { CdkScrollableModule } from '@angular/cdk/scrolling';
import { MatAutocomplete } from './autocomplete';
import { MatAutocompleteTrigger, MAT_AUTOCOMPLETE_SCROLL_STRATEGY_FACTORY_PROVIDER, } from './autocomplete-trigger';
import { MatAutocompleteOrigin } from './autocomplete-origin';
export class MatAutocompleteModule {
}
MatAutocompleteModule.decorators = [
    { type: NgModule, args: [{
                imports: [
                    OverlayModule,
                    MatOptionModule,
                    MatCommonModule,
                    CommonModule
                ],
                exports: [
                    MatAutocomplete,
                    MatAutocompleteTrigger,
                    MatAutocompleteOrigin,
                    CdkScrollableModule,
                    MatOptionModule,
                    MatCommonModule,
                ],
                declarations: [MatAutocomplete, MatAutocompleteTrigger, MatAutocompleteOrigin],
                providers: [MAT_AUTOCOMPLETE_SCROLL_STRATEGY_FACTORY_PROVIDER],
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0b2NvbXBsZXRlLW1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9hdXRvY29tcGxldGUvYXV0b2NvbXBsZXRlLW1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3ZDLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUM3QyxPQUFPLEVBQUMsYUFBYSxFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFDbkQsT0FBTyxFQUFDLGVBQWUsRUFBRSxlQUFlLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUN4RSxPQUFPLEVBQUMsbUJBQW1CLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUMzRCxPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDL0MsT0FBTyxFQUNMLHNCQUFzQixFQUN0QixpREFBaUQsR0FDbEQsTUFBTSx3QkFBd0IsQ0FBQztBQUNoQyxPQUFPLEVBQUMscUJBQXFCLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQXFCNUQsTUFBTSxPQUFPLHFCQUFxQjs7O1lBbEJqQyxRQUFRLFNBQUM7Z0JBQ1IsT0FBTyxFQUFFO29CQUNQLGFBQWE7b0JBQ2IsZUFBZTtvQkFDZixlQUFlO29CQUNmLFlBQVk7aUJBQ2I7Z0JBQ0QsT0FBTyxFQUFFO29CQUNQLGVBQWU7b0JBQ2Ysc0JBQXNCO29CQUN0QixxQkFBcUI7b0JBQ3JCLG1CQUFtQjtvQkFDbkIsZUFBZTtvQkFDZixlQUFlO2lCQUNoQjtnQkFDRCxZQUFZLEVBQUUsQ0FBQyxlQUFlLEVBQUUsc0JBQXNCLEVBQUUscUJBQXFCLENBQUM7Z0JBQzlFLFNBQVMsRUFBRSxDQUFDLGlEQUFpRCxDQUFDO2FBQy9EIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7TmdNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtDb21tb25Nb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQge092ZXJsYXlNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2Nkay9vdmVybGF5JztcbmltcG9ydCB7TWF0T3B0aW9uTW9kdWxlLCBNYXRDb21tb25Nb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL2NvcmUnO1xuaW1wb3J0IHtDZGtTY3JvbGxhYmxlTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jZGsvc2Nyb2xsaW5nJztcbmltcG9ydCB7TWF0QXV0b2NvbXBsZXRlfSBmcm9tICcuL2F1dG9jb21wbGV0ZSc7XG5pbXBvcnQge1xuICBNYXRBdXRvY29tcGxldGVUcmlnZ2VyLFxuICBNQVRfQVVUT0NPTVBMRVRFX1NDUk9MTF9TVFJBVEVHWV9GQUNUT1JZX1BST1ZJREVSLFxufSBmcm9tICcuL2F1dG9jb21wbGV0ZS10cmlnZ2VyJztcbmltcG9ydCB7TWF0QXV0b2NvbXBsZXRlT3JpZ2lufSBmcm9tICcuL2F1dG9jb21wbGV0ZS1vcmlnaW4nO1xuXG5cbkBOZ01vZHVsZSh7XG4gIGltcG9ydHM6IFtcbiAgICBPdmVybGF5TW9kdWxlLFxuICAgIE1hdE9wdGlvbk1vZHVsZSxcbiAgICBNYXRDb21tb25Nb2R1bGUsXG4gICAgQ29tbW9uTW9kdWxlXG4gIF0sXG4gIGV4cG9ydHM6IFtcbiAgICBNYXRBdXRvY29tcGxldGUsXG4gICAgTWF0QXV0b2NvbXBsZXRlVHJpZ2dlcixcbiAgICBNYXRBdXRvY29tcGxldGVPcmlnaW4sXG4gICAgQ2RrU2Nyb2xsYWJsZU1vZHVsZSxcbiAgICBNYXRPcHRpb25Nb2R1bGUsXG4gICAgTWF0Q29tbW9uTW9kdWxlLFxuICBdLFxuICBkZWNsYXJhdGlvbnM6IFtNYXRBdXRvY29tcGxldGUsIE1hdEF1dG9jb21wbGV0ZVRyaWdnZXIsIE1hdEF1dG9jb21wbGV0ZU9yaWdpbl0sXG4gIHByb3ZpZGVyczogW01BVF9BVVRPQ09NUExFVEVfU0NST0xMX1NUUkFURUdZX0ZBQ1RPUllfUFJPVklERVJdLFxufSlcbmV4cG9ydCBjbGFzcyBNYXRBdXRvY29tcGxldGVNb2R1bGUge31cbiJdfQ==