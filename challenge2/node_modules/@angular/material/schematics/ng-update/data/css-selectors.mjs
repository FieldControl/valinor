"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.cssSelectors = void 0;
const schematics_1 = require("@angular/cdk/schematics");
exports.cssSelectors = {
    [schematics_1.TargetVersion.V6]: [
        {
            pr: 'https://github.com/angular/components/pull/10296',
            changes: [
                { replace: '.mat-form-field-placeholder', replaceWith: '.mat-form-field-label' },
                { replace: '.mat-input-container', replaceWith: '.mat-form-field' },
                { replace: '.mat-input-flex', replaceWith: '.mat-form-field-flex' },
                { replace: '.mat-input-hint-spacer', replaceWith: '.mat-form-field-hint-spacer' },
                { replace: '.mat-input-hint-wrapper', replaceWith: '.mat-form-field-hint-wrapper' },
                { replace: '.mat-input-infix', replaceWith: '.mat-form-field-infix' },
                { replace: '.mat-input-invalid', replaceWith: '.mat-form-field-invalid' },
                { replace: '.mat-input-placeholder', replaceWith: '.mat-form-field-label' },
                { replace: '.mat-input-placeholder-wrapper', replaceWith: '.mat-form-field-label-wrapper' },
                { replace: '.mat-input-prefix', replaceWith: '.mat-form-field-prefix' },
                { replace: '.mat-input-ripple', replaceWith: '.mat-form-field-ripple' },
                { replace: '.mat-input-subscript-wrapper', replaceWith: '.mat-form-field-subscript-wrapper' },
                { replace: '.mat-input-suffix', replaceWith: '.mat-form-field-suffix' },
                { replace: '.mat-input-underline', replaceWith: '.mat-form-field-underline' },
                { replace: '.mat-input-wrapper', replaceWith: '.mat-form-field-wrapper' }
            ]
        },
        // TODO(devversion): this shouldn't be here because it's not a CSS selector. Move into misc
        // rule.
        {
            pr: 'https://github.com/angular/components/pull/10430',
            changes: [{
                    replace: '$mat-font-family',
                    replaceWith: 'Roboto, \'Helvetica Neue\', sans-serif',
                    replaceIn: { stylesheet: true }
                }]
        }
    ]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3NzLXNlbGVjdG9ycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9zY2hlbWF0aWNzL25nLXVwZGF0ZS9kYXRhL2Nzcy1zZWxlY3RvcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgsd0RBQXNFO0FBcUJ6RCxRQUFBLFlBQVksR0FBNEM7SUFDbkUsQ0FBQywwQkFBYSxDQUFDLEVBQUUsQ0FBQyxFQUFFO1FBQ2xCO1lBQ0UsRUFBRSxFQUFFLGtEQUFrRDtZQUN0RCxPQUFPLEVBQUU7Z0JBQ1AsRUFBQyxPQUFPLEVBQUUsNkJBQTZCLEVBQUUsV0FBVyxFQUFFLHVCQUF1QixFQUFDO2dCQUM5RSxFQUFDLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxXQUFXLEVBQUUsaUJBQWlCLEVBQUM7Z0JBQ2pFLEVBQUMsT0FBTyxFQUFFLGlCQUFpQixFQUFFLFdBQVcsRUFBRSxzQkFBc0IsRUFBQztnQkFDakUsRUFBQyxPQUFPLEVBQUUsd0JBQXdCLEVBQUUsV0FBVyxFQUFFLDZCQUE2QixFQUFDO2dCQUMvRSxFQUFDLE9BQU8sRUFBRSx5QkFBeUIsRUFBRSxXQUFXLEVBQUUsOEJBQThCLEVBQUM7Z0JBQ2pGLEVBQUMsT0FBTyxFQUFFLGtCQUFrQixFQUFFLFdBQVcsRUFBRSx1QkFBdUIsRUFBQztnQkFDbkUsRUFBQyxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsV0FBVyxFQUFFLHlCQUF5QixFQUFDO2dCQUN2RSxFQUFDLE9BQU8sRUFBRSx3QkFBd0IsRUFBRSxXQUFXLEVBQUUsdUJBQXVCLEVBQUM7Z0JBQ3pFLEVBQUMsT0FBTyxFQUFFLGdDQUFnQyxFQUFFLFdBQVcsRUFBRSwrQkFBK0IsRUFBQztnQkFDekYsRUFBQyxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsV0FBVyxFQUFFLHdCQUF3QixFQUFDO2dCQUNyRSxFQUFDLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxXQUFXLEVBQUUsd0JBQXdCLEVBQUM7Z0JBQ3JFLEVBQUMsT0FBTyxFQUFFLDhCQUE4QixFQUFFLFdBQVcsRUFBRSxtQ0FBbUMsRUFBQztnQkFDM0YsRUFBQyxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsV0FBVyxFQUFFLHdCQUF3QixFQUFDO2dCQUNyRSxFQUFDLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxXQUFXLEVBQUUsMkJBQTJCLEVBQUM7Z0JBQzNFLEVBQUMsT0FBTyxFQUFFLG9CQUFvQixFQUFFLFdBQVcsRUFBRSx5QkFBeUIsRUFBQzthQUN4RTtTQUNGO1FBRUQsMkZBQTJGO1FBQzNGLFFBQVE7UUFDUjtZQUNFLEVBQUUsRUFBRSxrREFBa0Q7WUFDdEQsT0FBTyxFQUFFLENBQUM7b0JBQ1IsT0FBTyxFQUFFLGtCQUFrQjtvQkFDM0IsV0FBVyxFQUFFLHdDQUF3QztvQkFDckQsU0FBUyxFQUFFLEVBQUMsVUFBVSxFQUFFLElBQUksRUFBQztpQkFDOUIsQ0FBQztTQUNIO0tBQ0Y7Q0FDRixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7VGFyZ2V0VmVyc2lvbiwgVmVyc2lvbkNoYW5nZXN9IGZyb20gJ0Bhbmd1bGFyL2Nkay9zY2hlbWF0aWNzJztcblxuZXhwb3J0IGludGVyZmFjZSBNYXRlcmlhbENzc1NlbGVjdG9yRGF0YSB7XG4gIC8qKiBUaGUgQ1NTIHNlbGVjdG9yIHRvIHJlcGxhY2UuICovXG4gIHJlcGxhY2U6IHN0cmluZztcbiAgLyoqIFRoZSBuZXcgQ1NTIHNlbGVjdG9yLiAqL1xuICByZXBsYWNlV2l0aDogc3RyaW5nO1xuICAvKipcbiAgICogQ29udHJvbHMgd2hpY2ggZmlsZSB0eXBlcyBpbiB3aGljaCB0aGlzIHJlcGxhY2VtZW50IGlzIG1hZGUuIElmIG9taXR0ZWQsIGl0IGlzIG1hZGUgaW4gYWxsXG4gICAqIGZpbGVzLlxuICAgKi9cbiAgcmVwbGFjZUluPzoge1xuICAgIC8qKiBSZXBsYWNlIHRoaXMgbmFtZSBpbiBzdHlsZXNoZWV0IGZpbGVzLiAqL1xuICAgIHN0eWxlc2hlZXQ/OiBib29sZWFuLFxuICAgIC8qKiBSZXBsYWNlIHRoaXMgbmFtZSBpbiBIVE1MIGZpbGVzLiAqL1xuICAgIGh0bWw/OiBib29sZWFuLFxuICAgIC8qKiBSZXBsYWNlIHRoaXMgbmFtZSBpbiBUeXBlU2NyaXB0IHN0cmluZ3MuICovXG4gICAgdHNTdHJpbmdMaXRlcmFscz86IGJvb2xlYW5cbiAgfTtcbn1cblxuZXhwb3J0IGNvbnN0IGNzc1NlbGVjdG9yczogVmVyc2lvbkNoYW5nZXM8TWF0ZXJpYWxDc3NTZWxlY3RvckRhdGE+ID0ge1xuICBbVGFyZ2V0VmVyc2lvbi5WNl06IFtcbiAgICB7XG4gICAgICBwcjogJ2h0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2NvbXBvbmVudHMvcHVsbC8xMDI5NicsXG4gICAgICBjaGFuZ2VzOiBbXG4gICAgICAgIHtyZXBsYWNlOiAnLm1hdC1mb3JtLWZpZWxkLXBsYWNlaG9sZGVyJywgcmVwbGFjZVdpdGg6ICcubWF0LWZvcm0tZmllbGQtbGFiZWwnfSxcbiAgICAgICAge3JlcGxhY2U6ICcubWF0LWlucHV0LWNvbnRhaW5lcicsIHJlcGxhY2VXaXRoOiAnLm1hdC1mb3JtLWZpZWxkJ30sXG4gICAgICAgIHtyZXBsYWNlOiAnLm1hdC1pbnB1dC1mbGV4JywgcmVwbGFjZVdpdGg6ICcubWF0LWZvcm0tZmllbGQtZmxleCd9LFxuICAgICAgICB7cmVwbGFjZTogJy5tYXQtaW5wdXQtaGludC1zcGFjZXInLCByZXBsYWNlV2l0aDogJy5tYXQtZm9ybS1maWVsZC1oaW50LXNwYWNlcid9LFxuICAgICAgICB7cmVwbGFjZTogJy5tYXQtaW5wdXQtaGludC13cmFwcGVyJywgcmVwbGFjZVdpdGg6ICcubWF0LWZvcm0tZmllbGQtaGludC13cmFwcGVyJ30sXG4gICAgICAgIHtyZXBsYWNlOiAnLm1hdC1pbnB1dC1pbmZpeCcsIHJlcGxhY2VXaXRoOiAnLm1hdC1mb3JtLWZpZWxkLWluZml4J30sXG4gICAgICAgIHtyZXBsYWNlOiAnLm1hdC1pbnB1dC1pbnZhbGlkJywgcmVwbGFjZVdpdGg6ICcubWF0LWZvcm0tZmllbGQtaW52YWxpZCd9LFxuICAgICAgICB7cmVwbGFjZTogJy5tYXQtaW5wdXQtcGxhY2Vob2xkZXInLCByZXBsYWNlV2l0aDogJy5tYXQtZm9ybS1maWVsZC1sYWJlbCd9LFxuICAgICAgICB7cmVwbGFjZTogJy5tYXQtaW5wdXQtcGxhY2Vob2xkZXItd3JhcHBlcicsIHJlcGxhY2VXaXRoOiAnLm1hdC1mb3JtLWZpZWxkLWxhYmVsLXdyYXBwZXInfSxcbiAgICAgICAge3JlcGxhY2U6ICcubWF0LWlucHV0LXByZWZpeCcsIHJlcGxhY2VXaXRoOiAnLm1hdC1mb3JtLWZpZWxkLXByZWZpeCd9LFxuICAgICAgICB7cmVwbGFjZTogJy5tYXQtaW5wdXQtcmlwcGxlJywgcmVwbGFjZVdpdGg6ICcubWF0LWZvcm0tZmllbGQtcmlwcGxlJ30sXG4gICAgICAgIHtyZXBsYWNlOiAnLm1hdC1pbnB1dC1zdWJzY3JpcHQtd3JhcHBlcicsIHJlcGxhY2VXaXRoOiAnLm1hdC1mb3JtLWZpZWxkLXN1YnNjcmlwdC13cmFwcGVyJ30sXG4gICAgICAgIHtyZXBsYWNlOiAnLm1hdC1pbnB1dC1zdWZmaXgnLCByZXBsYWNlV2l0aDogJy5tYXQtZm9ybS1maWVsZC1zdWZmaXgnfSxcbiAgICAgICAge3JlcGxhY2U6ICcubWF0LWlucHV0LXVuZGVybGluZScsIHJlcGxhY2VXaXRoOiAnLm1hdC1mb3JtLWZpZWxkLXVuZGVybGluZSd9LFxuICAgICAgICB7cmVwbGFjZTogJy5tYXQtaW5wdXQtd3JhcHBlcicsIHJlcGxhY2VXaXRoOiAnLm1hdC1mb3JtLWZpZWxkLXdyYXBwZXInfVxuICAgICAgXVxuICAgIH0sXG5cbiAgICAvLyBUT0RPKGRldnZlcnNpb24pOiB0aGlzIHNob3VsZG4ndCBiZSBoZXJlIGJlY2F1c2UgaXQncyBub3QgYSBDU1Mgc2VsZWN0b3IuIE1vdmUgaW50byBtaXNjXG4gICAgLy8gcnVsZS5cbiAgICB7XG4gICAgICBwcjogJ2h0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2NvbXBvbmVudHMvcHVsbC8xMDQzMCcsXG4gICAgICBjaGFuZ2VzOiBbe1xuICAgICAgICByZXBsYWNlOiAnJG1hdC1mb250LWZhbWlseScsXG4gICAgICAgIHJlcGxhY2VXaXRoOiAnUm9ib3RvLCBcXCdIZWx2ZXRpY2EgTmV1ZVxcJywgc2Fucy1zZXJpZicsXG4gICAgICAgIHJlcGxhY2VJbjoge3N0eWxlc2hlZXQ6IHRydWV9XG4gICAgICB9XVxuICAgIH1cbiAgXVxufTtcbiJdfQ==