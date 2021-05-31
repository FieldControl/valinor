/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ObserversModule } from '@angular/cdk/observers';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatCommonModule } from '@angular/material/core';
import { MatError } from './error';
import { MatFormField } from './form-field';
import { MatHint } from './hint';
import { MatLabel } from './label';
import { MatPlaceholder } from './placeholder';
import { MatPrefix } from './prefix';
import { MatSuffix } from './suffix';
export class MatFormFieldModule {
}
MatFormFieldModule.decorators = [
    { type: NgModule, args: [{
                declarations: [
                    MatError,
                    MatFormField,
                    MatHint,
                    MatLabel,
                    MatPlaceholder,
                    MatPrefix,
                    MatSuffix,
                ],
                imports: [
                    CommonModule,
                    MatCommonModule,
                    ObserversModule,
                ],
                exports: [
                    MatCommonModule,
                    MatError,
                    MatFormField,
                    MatHint,
                    MatLabel,
                    MatPlaceholder,
                    MatPrefix,
                    MatSuffix,
                ],
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybS1maWVsZC1tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvZm9ybS1maWVsZC9mb3JtLWZpZWxkLW1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0sd0JBQXdCLENBQUM7QUFDdkQsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQzdDLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDdkMsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBQ3ZELE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxTQUFTLENBQUM7QUFDakMsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGNBQWMsQ0FBQztBQUMxQyxPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sUUFBUSxDQUFDO0FBQy9CLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxTQUFTLENBQUM7QUFDakMsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUM3QyxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sVUFBVSxDQUFDO0FBQ25DLE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxVQUFVLENBQUM7QUE0Qm5DLE1BQU0sT0FBTyxrQkFBa0I7OztZQTFCOUIsUUFBUSxTQUFDO2dCQUNSLFlBQVksRUFBRTtvQkFDWixRQUFRO29CQUNSLFlBQVk7b0JBQ1osT0FBTztvQkFDUCxRQUFRO29CQUNSLGNBQWM7b0JBQ2QsU0FBUztvQkFDVCxTQUFTO2lCQUNWO2dCQUNELE9BQU8sRUFBRTtvQkFDUCxZQUFZO29CQUNaLGVBQWU7b0JBQ2YsZUFBZTtpQkFDaEI7Z0JBQ0QsT0FBTyxFQUFFO29CQUNQLGVBQWU7b0JBQ2YsUUFBUTtvQkFDUixZQUFZO29CQUNaLE9BQU87b0JBQ1AsUUFBUTtvQkFDUixjQUFjO29CQUNkLFNBQVM7b0JBQ1QsU0FBUztpQkFDVjthQUNGIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7T2JzZXJ2ZXJzTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jZGsvb2JzZXJ2ZXJzJztcbmltcG9ydCB7Q29tbW9uTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHtOZ01vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge01hdENvbW1vbk1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvY29yZSc7XG5pbXBvcnQge01hdEVycm9yfSBmcm9tICcuL2Vycm9yJztcbmltcG9ydCB7TWF0Rm9ybUZpZWxkfSBmcm9tICcuL2Zvcm0tZmllbGQnO1xuaW1wb3J0IHtNYXRIaW50fSBmcm9tICcuL2hpbnQnO1xuaW1wb3J0IHtNYXRMYWJlbH0gZnJvbSAnLi9sYWJlbCc7XG5pbXBvcnQge01hdFBsYWNlaG9sZGVyfSBmcm9tICcuL3BsYWNlaG9sZGVyJztcbmltcG9ydCB7TWF0UHJlZml4fSBmcm9tICcuL3ByZWZpeCc7XG5pbXBvcnQge01hdFN1ZmZpeH0gZnJvbSAnLi9zdWZmaXgnO1xuXG5ATmdNb2R1bGUoe1xuICBkZWNsYXJhdGlvbnM6IFtcbiAgICBNYXRFcnJvcixcbiAgICBNYXRGb3JtRmllbGQsXG4gICAgTWF0SGludCxcbiAgICBNYXRMYWJlbCxcbiAgICBNYXRQbGFjZWhvbGRlcixcbiAgICBNYXRQcmVmaXgsXG4gICAgTWF0U3VmZml4LFxuICBdLFxuICBpbXBvcnRzOiBbXG4gICAgQ29tbW9uTW9kdWxlLFxuICAgIE1hdENvbW1vbk1vZHVsZSxcbiAgICBPYnNlcnZlcnNNb2R1bGUsXG4gIF0sXG4gIGV4cG9ydHM6IFtcbiAgICBNYXRDb21tb25Nb2R1bGUsXG4gICAgTWF0RXJyb3IsXG4gICAgTWF0Rm9ybUZpZWxkLFxuICAgIE1hdEhpbnQsXG4gICAgTWF0TGFiZWwsXG4gICAgTWF0UGxhY2Vob2xkZXIsXG4gICAgTWF0UHJlZml4LFxuICAgIE1hdFN1ZmZpeCxcbiAgXSxcbn0pXG5leHBvcnQgY2xhc3MgTWF0Rm9ybUZpZWxkTW9kdWxlIHt9XG4iXX0=