"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.inputNames = void 0;
const schematics_1 = require("@angular/cdk/schematics");
exports.inputNames = {
    [schematics_1.TargetVersion.V6]: [
        {
            pr: 'https://github.com/angular/components/pull/10218',
            changes: [{
                    replace: 'align',
                    replaceWith: 'labelPosition',
                    limitedTo: { elements: ['mat-radio-group', 'mat-radio-button'] }
                }]
        },
        {
            pr: 'https://github.com/angular/components/pull/10279',
            changes: [{
                    replace: 'align',
                    replaceWith: 'position',
                    limitedTo: { elements: ['mat-drawer', 'mat-sidenav'] }
                }]
        },
        {
            pr: 'https://github.com/angular/components/pull/10294',
            changes: [
                { replace: 'dividerColor', replaceWith: 'color', limitedTo: { elements: ['mat-form-field'] } },
                {
                    replace: 'floatPlaceholder',
                    replaceWith: 'floatLabel',
                    limitedTo: { elements: ['mat-form-field'] }
                }
            ]
        },
        {
            pr: 'https://github.com/angular/components/pull/10309',
            changes: [{
                    replace: 'mat-dynamic-height',
                    replaceWith: 'dynamicHeight',
                    limitedTo: { elements: ['mat-tab-group'] }
                }]
        },
        {
            pr: 'https://github.com/angular/components/pull/10342',
            changes: [
                { replace: 'align', replaceWith: 'labelPosition', limitedTo: { elements: ['mat-checkbox'] } }
            ]
        },
        {
            pr: 'https://github.com/angular/components/pull/10344',
            changes: [{
                    replace: 'tooltip-position',
                    replaceWith: 'matTooltipPosition',
                    limitedTo: { attributes: ['matTooltip'] }
                }]
        },
        {
            pr: 'https://github.com/angular/components/pull/10373',
            changes: [
                { replace: 'thumb-label', replaceWith: 'thumbLabel', limitedTo: { elements: ['mat-slider'] } },
                {
                    replace: 'tick-interval',
                    replaceWith: 'tickInterval',
                    limitedTo: { elements: ['mat-slider'] }
                }
            ]
        }
    ]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5wdXQtbmFtZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvc2NoZW1hdGljcy9uZy11cGRhdGUvZGF0YS9pbnB1dC1uYW1lcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFFSCx3REFBNEY7QUFFL0UsUUFBQSxVQUFVLEdBQXlDO0lBQzlELENBQUMsMEJBQWEsQ0FBQyxFQUFFLENBQUMsRUFBRTtRQUNsQjtZQUNFLEVBQUUsRUFBRSxrREFBa0Q7WUFDdEQsT0FBTyxFQUFFLENBQUM7b0JBQ1IsT0FBTyxFQUFFLE9BQU87b0JBQ2hCLFdBQVcsRUFBRSxlQUFlO29CQUM1QixTQUFTLEVBQUUsRUFBQyxRQUFRLEVBQUUsQ0FBQyxpQkFBaUIsRUFBRSxrQkFBa0IsQ0FBQyxFQUFDO2lCQUMvRCxDQUFDO1NBQ0g7UUFFRDtZQUNFLEVBQUUsRUFBRSxrREFBa0Q7WUFDdEQsT0FBTyxFQUFFLENBQUM7b0JBQ1IsT0FBTyxFQUFFLE9BQU87b0JBQ2hCLFdBQVcsRUFBRSxVQUFVO29CQUN2QixTQUFTLEVBQUUsRUFBQyxRQUFRLEVBQUUsQ0FBQyxZQUFZLEVBQUUsYUFBYSxDQUFDLEVBQUM7aUJBQ3JELENBQUM7U0FDSDtRQUVEO1lBQ0UsRUFBRSxFQUFFLGtEQUFrRDtZQUN0RCxPQUFPLEVBQUU7Z0JBQ1AsRUFBQyxPQUFPLEVBQUUsY0FBYyxFQUFFLFdBQVcsRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLEVBQUMsUUFBUSxFQUFFLENBQUMsZ0JBQWdCLENBQUMsRUFBQyxFQUFDO2dCQUMxRjtvQkFDRSxPQUFPLEVBQUUsa0JBQWtCO29CQUMzQixXQUFXLEVBQUUsWUFBWTtvQkFDekIsU0FBUyxFQUFFLEVBQUMsUUFBUSxFQUFFLENBQUMsZ0JBQWdCLENBQUMsRUFBQztpQkFDMUM7YUFDRjtTQUNGO1FBRUQ7WUFDRSxFQUFFLEVBQUUsa0RBQWtEO1lBQ3RELE9BQU8sRUFBRSxDQUFDO29CQUNSLE9BQU8sRUFBRSxvQkFBb0I7b0JBQzdCLFdBQVcsRUFBRSxlQUFlO29CQUM1QixTQUFTLEVBQUUsRUFBQyxRQUFRLEVBQUUsQ0FBQyxlQUFlLENBQUMsRUFBQztpQkFDekMsQ0FBQztTQUNIO1FBRUQ7WUFDRSxFQUFFLEVBQUUsa0RBQWtEO1lBQ3RELE9BQU8sRUFBRTtnQkFDUCxFQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsV0FBVyxFQUFFLGVBQWUsRUFBRSxTQUFTLEVBQUUsRUFBQyxRQUFRLEVBQUUsQ0FBQyxjQUFjLENBQUMsRUFBQyxFQUFDO2FBQzFGO1NBQ0Y7UUFFRDtZQUNFLEVBQUUsRUFBRSxrREFBa0Q7WUFDdEQsT0FBTyxFQUFFLENBQUM7b0JBQ1IsT0FBTyxFQUFFLGtCQUFrQjtvQkFDM0IsV0FBVyxFQUFFLG9CQUFvQjtvQkFDakMsU0FBUyxFQUFFLEVBQUMsVUFBVSxFQUFFLENBQUMsWUFBWSxDQUFDLEVBQUM7aUJBQ3hDLENBQUM7U0FDSDtRQUVEO1lBQ0UsRUFBRSxFQUFFLGtEQUFrRDtZQUN0RCxPQUFPLEVBQUU7Z0JBQ1AsRUFBQyxPQUFPLEVBQUUsYUFBYSxFQUFFLFdBQVcsRUFBRSxZQUFZLEVBQUUsU0FBUyxFQUFFLEVBQUMsUUFBUSxFQUFFLENBQUMsWUFBWSxDQUFDLEVBQUMsRUFBQztnQkFDMUY7b0JBQ0UsT0FBTyxFQUFFLGVBQWU7b0JBQ3hCLFdBQVcsRUFBRSxjQUFjO29CQUMzQixTQUFTLEVBQUUsRUFBQyxRQUFRLEVBQUUsQ0FBQyxZQUFZLENBQUMsRUFBQztpQkFDdEM7YUFDRjtTQUNGO0tBQ0Y7Q0FDRixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SW5wdXROYW1lVXBncmFkZURhdGEsIFRhcmdldFZlcnNpb24sIFZlcnNpb25DaGFuZ2VzfSBmcm9tICdAYW5ndWxhci9jZGsvc2NoZW1hdGljcyc7XG5cbmV4cG9ydCBjb25zdCBpbnB1dE5hbWVzOiBWZXJzaW9uQ2hhbmdlczxJbnB1dE5hbWVVcGdyYWRlRGF0YT4gPSB7XG4gIFtUYXJnZXRWZXJzaW9uLlY2XTogW1xuICAgIHtcbiAgICAgIHByOiAnaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvY29tcG9uZW50cy9wdWxsLzEwMjE4JyxcbiAgICAgIGNoYW5nZXM6IFt7XG4gICAgICAgIHJlcGxhY2U6ICdhbGlnbicsXG4gICAgICAgIHJlcGxhY2VXaXRoOiAnbGFiZWxQb3NpdGlvbicsXG4gICAgICAgIGxpbWl0ZWRUbzoge2VsZW1lbnRzOiBbJ21hdC1yYWRpby1ncm91cCcsICdtYXQtcmFkaW8tYnV0dG9uJ119XG4gICAgICB9XVxuICAgIH0sXG5cbiAgICB7XG4gICAgICBwcjogJ2h0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2NvbXBvbmVudHMvcHVsbC8xMDI3OScsXG4gICAgICBjaGFuZ2VzOiBbe1xuICAgICAgICByZXBsYWNlOiAnYWxpZ24nLFxuICAgICAgICByZXBsYWNlV2l0aDogJ3Bvc2l0aW9uJyxcbiAgICAgICAgbGltaXRlZFRvOiB7ZWxlbWVudHM6IFsnbWF0LWRyYXdlcicsICdtYXQtc2lkZW5hdiddfVxuICAgICAgfV1cbiAgICB9LFxuXG4gICAge1xuICAgICAgcHI6ICdodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9jb21wb25lbnRzL3B1bGwvMTAyOTQnLFxuICAgICAgY2hhbmdlczogW1xuICAgICAgICB7cmVwbGFjZTogJ2RpdmlkZXJDb2xvcicsIHJlcGxhY2VXaXRoOiAnY29sb3InLCBsaW1pdGVkVG86IHtlbGVtZW50czogWydtYXQtZm9ybS1maWVsZCddfX0sXG4gICAgICAgIHtcbiAgICAgICAgICByZXBsYWNlOiAnZmxvYXRQbGFjZWhvbGRlcicsXG4gICAgICAgICAgcmVwbGFjZVdpdGg6ICdmbG9hdExhYmVsJyxcbiAgICAgICAgICBsaW1pdGVkVG86IHtlbGVtZW50czogWydtYXQtZm9ybS1maWVsZCddfVxuICAgICAgICB9XG4gICAgICBdXG4gICAgfSxcblxuICAgIHtcbiAgICAgIHByOiAnaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvY29tcG9uZW50cy9wdWxsLzEwMzA5JyxcbiAgICAgIGNoYW5nZXM6IFt7XG4gICAgICAgIHJlcGxhY2U6ICdtYXQtZHluYW1pYy1oZWlnaHQnLFxuICAgICAgICByZXBsYWNlV2l0aDogJ2R5bmFtaWNIZWlnaHQnLFxuICAgICAgICBsaW1pdGVkVG86IHtlbGVtZW50czogWydtYXQtdGFiLWdyb3VwJ119XG4gICAgICB9XVxuICAgIH0sXG5cbiAgICB7XG4gICAgICBwcjogJ2h0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2NvbXBvbmVudHMvcHVsbC8xMDM0MicsXG4gICAgICBjaGFuZ2VzOiBbXG4gICAgICAgIHtyZXBsYWNlOiAnYWxpZ24nLCByZXBsYWNlV2l0aDogJ2xhYmVsUG9zaXRpb24nLCBsaW1pdGVkVG86IHtlbGVtZW50czogWydtYXQtY2hlY2tib3gnXX19XG4gICAgICBdXG4gICAgfSxcblxuICAgIHtcbiAgICAgIHByOiAnaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvY29tcG9uZW50cy9wdWxsLzEwMzQ0JyxcbiAgICAgIGNoYW5nZXM6IFt7XG4gICAgICAgIHJlcGxhY2U6ICd0b29sdGlwLXBvc2l0aW9uJyxcbiAgICAgICAgcmVwbGFjZVdpdGg6ICdtYXRUb29sdGlwUG9zaXRpb24nLFxuICAgICAgICBsaW1pdGVkVG86IHthdHRyaWJ1dGVzOiBbJ21hdFRvb2x0aXAnXX1cbiAgICAgIH1dXG4gICAgfSxcblxuICAgIHtcbiAgICAgIHByOiAnaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvY29tcG9uZW50cy9wdWxsLzEwMzczJyxcbiAgICAgIGNoYW5nZXM6IFtcbiAgICAgICAge3JlcGxhY2U6ICd0aHVtYi1sYWJlbCcsIHJlcGxhY2VXaXRoOiAndGh1bWJMYWJlbCcsIGxpbWl0ZWRUbzoge2VsZW1lbnRzOiBbJ21hdC1zbGlkZXInXX19LFxuICAgICAgICB7XG4gICAgICAgICAgcmVwbGFjZTogJ3RpY2staW50ZXJ2YWwnLFxuICAgICAgICAgIHJlcGxhY2VXaXRoOiAndGlja0ludGVydmFsJyxcbiAgICAgICAgICBsaW1pdGVkVG86IHtlbGVtZW50czogWydtYXQtc2xpZGVyJ119XG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9XG4gIF1cbn07XG4iXX0=