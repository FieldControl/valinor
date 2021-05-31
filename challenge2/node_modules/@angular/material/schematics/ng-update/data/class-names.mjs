"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.classNames = void 0;
const schematics_1 = require("@angular/cdk/schematics");
exports.classNames = {
    [schematics_1.TargetVersion.V10]: [
        {
            pr: 'https://github.com/angular/components/pull/19289',
            changes: [
                { replace: 'MatButtonToggleGroupMultiple', replaceWith: 'MatButtonToggleGroup' }
            ]
        }
    ],
    [schematics_1.TargetVersion.V6]: [
        {
            pr: 'https://github.com/angular/components/pull/10291',
            changes: [
                { replace: 'FloatPlaceholderType', replaceWith: 'FloatLabelType' },
                { replace: 'MAT_PLACEHOLDER_GLOBAL_OPTIONS', replaceWith: 'MAT_LABEL_GLOBAL_OPTIONS' },
                { replace: 'PlaceholderOptions', replaceWith: 'LabelOptions' }
            ]
        },
    ]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xhc3MtbmFtZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvc2NoZW1hdGljcy9uZy11cGRhdGUvZGF0YS9jbGFzcy1uYW1lcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFFSCx3REFBNEY7QUFFL0UsUUFBQSxVQUFVLEdBQXlDO0lBQzlELENBQUMsMEJBQWEsQ0FBQyxHQUFHLENBQUMsRUFBRTtRQUNuQjtZQUNFLEVBQUUsRUFBRSxrREFBa0Q7WUFDdEQsT0FBTyxFQUFFO2dCQUNQLEVBQUMsT0FBTyxFQUFFLDhCQUE4QixFQUFFLFdBQVcsRUFBRSxzQkFBc0IsRUFBQzthQUMvRTtTQUNGO0tBQ0Y7SUFDRCxDQUFDLDBCQUFhLENBQUMsRUFBRSxDQUFDLEVBQUU7UUFDbEI7WUFDRSxFQUFFLEVBQUUsa0RBQWtEO1lBQ3RELE9BQU8sRUFBRTtnQkFDUCxFQUFDLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxXQUFXLEVBQUUsZ0JBQWdCLEVBQUM7Z0JBQ2hFLEVBQUMsT0FBTyxFQUFFLGdDQUFnQyxFQUFFLFdBQVcsRUFBRSwwQkFBMEIsRUFBQztnQkFDcEYsRUFBQyxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsV0FBVyxFQUFFLGNBQWMsRUFBQzthQUM3RDtTQUNGO0tBQ0Y7Q0FDRixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Q2xhc3NOYW1lVXBncmFkZURhdGEsIFRhcmdldFZlcnNpb24sIFZlcnNpb25DaGFuZ2VzfSBmcm9tICdAYW5ndWxhci9jZGsvc2NoZW1hdGljcyc7XG5cbmV4cG9ydCBjb25zdCBjbGFzc05hbWVzOiBWZXJzaW9uQ2hhbmdlczxDbGFzc05hbWVVcGdyYWRlRGF0YT4gPSB7XG4gIFtUYXJnZXRWZXJzaW9uLlYxMF06IFtcbiAgICB7XG4gICAgICBwcjogJ2h0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2NvbXBvbmVudHMvcHVsbC8xOTI4OScsXG4gICAgICBjaGFuZ2VzOiBbXG4gICAgICAgIHtyZXBsYWNlOiAnTWF0QnV0dG9uVG9nZ2xlR3JvdXBNdWx0aXBsZScsIHJlcGxhY2VXaXRoOiAnTWF0QnV0dG9uVG9nZ2xlR3JvdXAnfVxuICAgICAgXVxuICAgIH1cbiAgXSxcbiAgW1RhcmdldFZlcnNpb24uVjZdOiBbXG4gICAge1xuICAgICAgcHI6ICdodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9jb21wb25lbnRzL3B1bGwvMTAyOTEnLFxuICAgICAgY2hhbmdlczogW1xuICAgICAgICB7cmVwbGFjZTogJ0Zsb2F0UGxhY2Vob2xkZXJUeXBlJywgcmVwbGFjZVdpdGg6ICdGbG9hdExhYmVsVHlwZSd9LFxuICAgICAgICB7cmVwbGFjZTogJ01BVF9QTEFDRUhPTERFUl9HTE9CQUxfT1BUSU9OUycsIHJlcGxhY2VXaXRoOiAnTUFUX0xBQkVMX0dMT0JBTF9PUFRJT05TJ30sXG4gICAgICAgIHtyZXBsYWNlOiAnUGxhY2Vob2xkZXJPcHRpb25zJywgcmVwbGFjZVdpdGg6ICdMYWJlbE9wdGlvbnMnfVxuICAgICAgXVxuICAgIH0sXG4gIF1cbn07XG4iXX0=