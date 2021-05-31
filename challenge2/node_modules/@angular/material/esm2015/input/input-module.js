/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { TextFieldModule } from '@angular/cdk/text-field';
import { NgModule } from '@angular/core';
import { ErrorStateMatcher, MatCommonModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTextareaAutosize } from './autosize';
import { MatInput } from './input';
export class MatInputModule {
}
MatInputModule.decorators = [
    { type: NgModule, args: [{
                declarations: [MatInput, MatTextareaAutosize],
                imports: [
                    TextFieldModule,
                    MatFormFieldModule,
                    MatCommonModule,
                ],
                exports: [
                    TextFieldModule,
                    // We re-export the `MatFormFieldModule` since `MatInput` will almost always
                    // be used together with `MatFormField`.
                    MatFormFieldModule,
                    MatInput,
                    MatTextareaAutosize,
                ],
                providers: [ErrorStateMatcher],
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5wdXQtbW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL2lucHV0L2lucHV0LW1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0seUJBQXlCLENBQUM7QUFDeEQsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN2QyxPQUFPLEVBQUMsaUJBQWlCLEVBQUUsZUFBZSxFQUFDLE1BQU0sd0JBQXdCLENBQUM7QUFDMUUsT0FBTyxFQUFDLGtCQUFrQixFQUFDLE1BQU0sOEJBQThCLENBQUM7QUFDaEUsT0FBTyxFQUFDLG1CQUFtQixFQUFDLE1BQU0sWUFBWSxDQUFDO0FBQy9DLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxTQUFTLENBQUM7QUFtQmpDLE1BQU0sT0FBTyxjQUFjOzs7WUFqQjFCLFFBQVEsU0FBQztnQkFDUixZQUFZLEVBQUUsQ0FBQyxRQUFRLEVBQUUsbUJBQW1CLENBQUM7Z0JBQzdDLE9BQU8sRUFBRTtvQkFDUCxlQUFlO29CQUNmLGtCQUFrQjtvQkFDbEIsZUFBZTtpQkFDaEI7Z0JBQ0QsT0FBTyxFQUFFO29CQUNQLGVBQWU7b0JBQ2YsNEVBQTRFO29CQUM1RSx3Q0FBd0M7b0JBQ3hDLGtCQUFrQjtvQkFDbEIsUUFBUTtvQkFDUixtQkFBbUI7aUJBQ3BCO2dCQUNELFNBQVMsRUFBRSxDQUFDLGlCQUFpQixDQUFDO2FBQy9CIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7VGV4dEZpZWxkTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jZGsvdGV4dC1maWVsZCc7XG5pbXBvcnQge05nTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7RXJyb3JTdGF0ZU1hdGNoZXIsIE1hdENvbW1vbk1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvY29yZSc7XG5pbXBvcnQge01hdEZvcm1GaWVsZE1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvZm9ybS1maWVsZCc7XG5pbXBvcnQge01hdFRleHRhcmVhQXV0b3NpemV9IGZyb20gJy4vYXV0b3NpemUnO1xuaW1wb3J0IHtNYXRJbnB1dH0gZnJvbSAnLi9pbnB1dCc7XG5cbkBOZ01vZHVsZSh7XG4gIGRlY2xhcmF0aW9uczogW01hdElucHV0LCBNYXRUZXh0YXJlYUF1dG9zaXplXSxcbiAgaW1wb3J0czogW1xuICAgIFRleHRGaWVsZE1vZHVsZSxcbiAgICBNYXRGb3JtRmllbGRNb2R1bGUsXG4gICAgTWF0Q29tbW9uTW9kdWxlLFxuICBdLFxuICBleHBvcnRzOiBbXG4gICAgVGV4dEZpZWxkTW9kdWxlLFxuICAgIC8vIFdlIHJlLWV4cG9ydCB0aGUgYE1hdEZvcm1GaWVsZE1vZHVsZWAgc2luY2UgYE1hdElucHV0YCB3aWxsIGFsbW9zdCBhbHdheXNcbiAgICAvLyBiZSB1c2VkIHRvZ2V0aGVyIHdpdGggYE1hdEZvcm1GaWVsZGAuXG4gICAgTWF0Rm9ybUZpZWxkTW9kdWxlLFxuICAgIE1hdElucHV0LFxuICAgIE1hdFRleHRhcmVhQXV0b3NpemUsXG4gIF0sXG4gIHByb3ZpZGVyczogW0Vycm9yU3RhdGVNYXRjaGVyXSxcbn0pXG5leHBvcnQgY2xhc3MgTWF0SW5wdXRNb2R1bGUge31cbiJdfQ==