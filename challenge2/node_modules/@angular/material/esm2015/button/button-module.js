/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { NgModule } from '@angular/core';
import { MatCommonModule, MatRippleModule } from '@angular/material/core';
import { MatAnchor, MatButton } from './button';
export class MatButtonModule {
}
MatButtonModule.decorators = [
    { type: NgModule, args: [{
                imports: [
                    MatRippleModule,
                    MatCommonModule,
                ],
                exports: [
                    MatButton,
                    MatAnchor,
                    MatCommonModule,
                ],
                declarations: [
                    MatButton,
                    MatAnchor,
                ],
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnV0dG9uLW1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9idXR0b24vYnV0dG9uLW1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3ZDLE9BQU8sRUFBQyxlQUFlLEVBQUUsZUFBZSxFQUFDLE1BQU0sd0JBQXdCLENBQUM7QUFDeEUsT0FBTyxFQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUMsTUFBTSxVQUFVLENBQUM7QUFrQjlDLE1BQU0sT0FBTyxlQUFlOzs7WUFmM0IsUUFBUSxTQUFDO2dCQUNSLE9BQU8sRUFBRTtvQkFDUCxlQUFlO29CQUNmLGVBQWU7aUJBQ2hCO2dCQUNELE9BQU8sRUFBRTtvQkFDUCxTQUFTO29CQUNULFNBQVM7b0JBQ1QsZUFBZTtpQkFDaEI7Z0JBQ0QsWUFBWSxFQUFFO29CQUNaLFNBQVM7b0JBQ1QsU0FBUztpQkFDVjthQUNGIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7TmdNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtNYXRDb21tb25Nb2R1bGUsIE1hdFJpcHBsZU1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvY29yZSc7XG5pbXBvcnQge01hdEFuY2hvciwgTWF0QnV0dG9ufSBmcm9tICcuL2J1dHRvbic7XG5cblxuQE5nTW9kdWxlKHtcbiAgaW1wb3J0czogW1xuICAgIE1hdFJpcHBsZU1vZHVsZSxcbiAgICBNYXRDb21tb25Nb2R1bGUsXG4gIF0sXG4gIGV4cG9ydHM6IFtcbiAgICBNYXRCdXR0b24sXG4gICAgTWF0QW5jaG9yLFxuICAgIE1hdENvbW1vbk1vZHVsZSxcbiAgXSxcbiAgZGVjbGFyYXRpb25zOiBbXG4gICAgTWF0QnV0dG9uLFxuICAgIE1hdEFuY2hvcixcbiAgXSxcbn0pXG5leHBvcnQgY2xhc3MgTWF0QnV0dG9uTW9kdWxlIHt9XG4iXX0=