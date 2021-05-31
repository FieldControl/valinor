/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { NgModule } from '@angular/core';
import { MatLineModule, MatCommonModule } from '@angular/material/core';
import { MatGridTile, MatGridTileText, MatGridTileFooterCssMatStyler, MatGridTileHeaderCssMatStyler, MatGridAvatarCssMatStyler } from './grid-tile';
import { MatGridList } from './grid-list';
export class MatGridListModule {
}
MatGridListModule.decorators = [
    { type: NgModule, args: [{
                imports: [MatLineModule, MatCommonModule],
                exports: [
                    MatGridList,
                    MatGridTile,
                    MatGridTileText,
                    MatLineModule,
                    MatCommonModule,
                    MatGridTileHeaderCssMatStyler,
                    MatGridTileFooterCssMatStyler,
                    MatGridAvatarCssMatStyler
                ],
                declarations: [
                    MatGridList,
                    MatGridTile,
                    MatGridTileText,
                    MatGridTileHeaderCssMatStyler,
                    MatGridTileFooterCssMatStyler,
                    MatGridAvatarCssMatStyler
                ],
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JpZC1saXN0LW1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9ncmlkLWxpc3QvZ3JpZC1saXN0LW1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3ZDLE9BQU8sRUFBQyxhQUFhLEVBQUUsZUFBZSxFQUFDLE1BQU0sd0JBQXdCLENBQUM7QUFDdEUsT0FBTyxFQUNMLFdBQVcsRUFBRSxlQUFlLEVBQUUsNkJBQTZCLEVBQzNELDZCQUE2QixFQUFFLHlCQUF5QixFQUN6RCxNQUFNLGFBQWEsQ0FBQztBQUNyQixPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0sYUFBYSxDQUFDO0FBd0J4QyxNQUFNLE9BQU8saUJBQWlCOzs7WUFyQjdCLFFBQVEsU0FBQztnQkFDUixPQUFPLEVBQUUsQ0FBQyxhQUFhLEVBQUUsZUFBZSxDQUFDO2dCQUN6QyxPQUFPLEVBQUU7b0JBQ1AsV0FBVztvQkFDWCxXQUFXO29CQUNYLGVBQWU7b0JBQ2YsYUFBYTtvQkFDYixlQUFlO29CQUNmLDZCQUE2QjtvQkFDN0IsNkJBQTZCO29CQUM3Qix5QkFBeUI7aUJBQzFCO2dCQUNELFlBQVksRUFBRTtvQkFDWixXQUFXO29CQUNYLFdBQVc7b0JBQ1gsZUFBZTtvQkFDZiw2QkFBNkI7b0JBQzdCLDZCQUE2QjtvQkFDN0IseUJBQXlCO2lCQUMxQjthQUNGIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7TmdNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtNYXRMaW5lTW9kdWxlLCBNYXRDb21tb25Nb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL2NvcmUnO1xuaW1wb3J0IHtcbiAgTWF0R3JpZFRpbGUsIE1hdEdyaWRUaWxlVGV4dCwgTWF0R3JpZFRpbGVGb290ZXJDc3NNYXRTdHlsZXIsXG4gIE1hdEdyaWRUaWxlSGVhZGVyQ3NzTWF0U3R5bGVyLCBNYXRHcmlkQXZhdGFyQ3NzTWF0U3R5bGVyXG59IGZyb20gJy4vZ3JpZC10aWxlJztcbmltcG9ydCB7TWF0R3JpZExpc3R9IGZyb20gJy4vZ3JpZC1saXN0JztcblxuXG5ATmdNb2R1bGUoe1xuICBpbXBvcnRzOiBbTWF0TGluZU1vZHVsZSwgTWF0Q29tbW9uTW9kdWxlXSxcbiAgZXhwb3J0czogW1xuICAgIE1hdEdyaWRMaXN0LFxuICAgIE1hdEdyaWRUaWxlLFxuICAgIE1hdEdyaWRUaWxlVGV4dCxcbiAgICBNYXRMaW5lTW9kdWxlLFxuICAgIE1hdENvbW1vbk1vZHVsZSxcbiAgICBNYXRHcmlkVGlsZUhlYWRlckNzc01hdFN0eWxlcixcbiAgICBNYXRHcmlkVGlsZUZvb3RlckNzc01hdFN0eWxlcixcbiAgICBNYXRHcmlkQXZhdGFyQ3NzTWF0U3R5bGVyXG4gIF0sXG4gIGRlY2xhcmF0aW9uczogW1xuICAgIE1hdEdyaWRMaXN0LFxuICAgIE1hdEdyaWRUaWxlLFxuICAgIE1hdEdyaWRUaWxlVGV4dCxcbiAgICBNYXRHcmlkVGlsZUhlYWRlckNzc01hdFN0eWxlcixcbiAgICBNYXRHcmlkVGlsZUZvb3RlckNzc01hdFN0eWxlcixcbiAgICBNYXRHcmlkQXZhdGFyQ3NzTWF0U3R5bGVyXG4gIF0sXG59KVxuZXhwb3J0IGNsYXNzIE1hdEdyaWRMaXN0TW9kdWxlIHt9XG4iXX0=