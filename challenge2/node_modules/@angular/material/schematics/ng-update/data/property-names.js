"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.propertyNames = void 0;
const schematics_1 = require("@angular/cdk/schematics");
exports.propertyNames = {
    [schematics_1.TargetVersion.V11]: [
        {
            pr: 'https://github.com/angular/components/pull/20449',
            changes: [
                {
                    replace: 'getPopupConnectionElementRef',
                    replaceWith: 'getConnectedOverlayOrigin',
                    limitedTo: { classes: ['MatDatepickerInput'] }
                }
            ]
        }
    ],
    [schematics_1.TargetVersion.V9]: [
        {
            pr: 'https://github.com/angular/components/pull/17333',
            changes: [
                {
                    replace: 'afterOpen',
                    replaceWith: 'afterOpened',
                    limitedTo: { classes: ['MatDialogRef'] }
                },
                {
                    replace: 'beforeClose',
                    replaceWith: 'beforeClosed',
                    limitedTo: { classes: ['MatDialogRef'] }
                },
                {
                    replace: 'afterOpen',
                    replaceWith: 'afterOpened',
                    limitedTo: { classes: ['MatDialog'] }
                }
            ]
        }
    ],
    [schematics_1.TargetVersion.V6]: [
        {
            pr: 'https://github.com/angular/components/pull/10163',
            changes: [
                { replace: 'change', replaceWith: 'selectionChange', limitedTo: { classes: ['MatSelect'] } }, {
                    replace: 'onOpen',
                    replaceWith: 'openedChange.pipe(filter(isOpen => isOpen))',
                    limitedTo: { classes: ['MatSelect'] }
                },
                {
                    replace: 'onClose',
                    replaceWith: 'openedChange.pipe(filter(isOpen => !isOpen))',
                    limitedTo: { classes: ['MatSelect'] }
                }
            ]
        },
        {
            pr: 'https://github.com/angular/components/pull/10218',
            changes: [{
                    replace: 'align',
                    replaceWith: 'labelPosition',
                    limitedTo: { classes: ['MatRadioGroup', 'MatRadioButton'] }
                }]
        },
        {
            pr: 'https://github.com/angular/components/pull/10253',
            changes: [{
                    replace: 'extraClasses',
                    replaceWith: 'panelClass',
                    limitedTo: { classes: ['MatSnackBarConfig'] }
                }]
        },
        {
            pr: 'https://github.com/angular/components/pull/10279',
            changes: [
                {
                    replace: 'align',
                    replaceWith: 'position',
                    limitedTo: { classes: ['MatDrawer', 'MatSidenav'] }
                },
                {
                    replace: 'onAlignChanged',
                    replaceWith: 'onPositionChanged',
                    limitedTo: { classes: ['MatDrawer', 'MatSidenav'] }
                },
                {
                    replace: 'onOpen',
                    replaceWith: 'openedChange.pipe(filter(isOpen => isOpen))',
                    limitedTo: { classes: ['MatDrawer', 'MatSidenav'] }
                },
                {
                    replace: 'onClose',
                    replaceWith: 'openedChange.pipe(filter(isOpen => !isOpen))',
                    limitedTo: { classes: ['MatDrawer', 'MatSidenav'] }
                }
            ]
        },
        {
            pr: 'https://github.com/angular/components/pull/10293',
            changes: [{
                    replace: 'shouldPlaceholderFloat',
                    replaceWith: 'shouldLabelFloat',
                    limitedTo: { classes: ['MatFormFieldControl', 'MatSelect'] }
                }]
        },
        {
            pr: 'https://github.com/angular/components/pull/10294',
            changes: [
                { replace: 'dividerColor', replaceWith: 'color', limitedTo: { classes: ['MatFormField'] } }, {
                    replace: 'floatPlaceholder',
                    replaceWith: 'floatLabel',
                    limitedTo: { classes: ['MatFormField'] }
                }
            ]
        },
        {
            pr: 'https://github.com/angular/components/pull/10309',
            changes: [
                {
                    replace: 'selectChange',
                    replaceWith: 'selectedTabChange',
                    limitedTo: { classes: ['MatTabGroup'] }
                },
                {
                    replace: '_dynamicHeightDeprecated',
                    replaceWith: 'dynamicHeight',
                    limitedTo: { classes: ['MatTabGroup'] }
                }
            ]
        },
        {
            pr: 'https://github.com/angular/components/pull/10311',
            changes: [
                { replace: 'destroy', replaceWith: 'destroyed', limitedTo: { classes: ['MatChip'] } },
                { replace: 'onRemove', replaceWith: 'removed', limitedTo: { classes: ['MatChip'] } }
            ]
        },
        {
            pr: 'https://github.com/angular/components/pull/10342',
            changes: [{ replace: 'align', replaceWith: 'labelPosition', limitedTo: { classes: ['MatCheckbox'] } }]
        },
        {
            pr: 'https://github.com/angular/components/pull/10344',
            changes: [{
                    replace: '_positionDeprecated',
                    replaceWith: 'position',
                    limitedTo: { classes: ['MatTooltip'] }
                }]
        },
        {
            pr: 'https://github.com/angular/components/pull/10373',
            changes: [
                {
                    replace: '_thumbLabelDeprecated',
                    replaceWith: 'thumbLabel',
                    limitedTo: { classes: ['MatSlider'] }
                },
                {
                    replace: '_tickIntervalDeprecated',
                    replaceWith: 'tickInterval',
                    limitedTo: { classes: ['MatSlider'] }
                }
            ]
        },
    ]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvcGVydHktbmFtZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvc2NoZW1hdGljcy9uZy11cGRhdGUvZGF0YS9wcm9wZXJ0eS1uYW1lcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFFSCx3REFBK0Y7QUFFbEYsUUFBQSxhQUFhLEdBQTRDO0lBQ3BFLENBQUMsMEJBQWEsQ0FBQyxHQUFHLENBQUMsRUFBRTtRQUNuQjtZQUNFLEVBQUUsRUFBRSxrREFBa0Q7WUFDdEQsT0FBTyxFQUFFO2dCQUNQO29CQUNFLE9BQU8sRUFBRSw4QkFBOEI7b0JBQ3ZDLFdBQVcsRUFBRSwyQkFBMkI7b0JBQ3hDLFNBQVMsRUFBRSxFQUFDLE9BQU8sRUFBRSxDQUFDLG9CQUFvQixDQUFDLEVBQUM7aUJBQzdDO2FBQ0Y7U0FDRjtLQUNGO0lBQ0QsQ0FBQywwQkFBYSxDQUFDLEVBQUUsQ0FBQyxFQUFFO1FBQ2xCO1lBQ0UsRUFBRSxFQUFFLGtEQUFrRDtZQUN0RCxPQUFPLEVBQUU7Z0JBQ1A7b0JBQ0UsT0FBTyxFQUFFLFdBQVc7b0JBQ3BCLFdBQVcsRUFBRSxhQUFhO29CQUMxQixTQUFTLEVBQUUsRUFBQyxPQUFPLEVBQUUsQ0FBQyxjQUFjLENBQUMsRUFBQztpQkFDdkM7Z0JBQ0Q7b0JBQ0UsT0FBTyxFQUFFLGFBQWE7b0JBQ3RCLFdBQVcsRUFBRSxjQUFjO29CQUMzQixTQUFTLEVBQUUsRUFBQyxPQUFPLEVBQUUsQ0FBQyxjQUFjLENBQUMsRUFBQztpQkFDdkM7Z0JBQ0Q7b0JBQ0UsT0FBTyxFQUFFLFdBQVc7b0JBQ3BCLFdBQVcsRUFBRSxhQUFhO29CQUMxQixTQUFTLEVBQUUsRUFBQyxPQUFPLEVBQUUsQ0FBQyxXQUFXLENBQUMsRUFBQztpQkFDcEM7YUFDRjtTQUNGO0tBQ0Y7SUFDRCxDQUFDLDBCQUFhLENBQUMsRUFBRSxDQUFDLEVBQUU7UUFDbEI7WUFD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eUI7b0JBQ2xDLFdBQVcsRUFBRSxjQUFjO29CQUMzQixTQUFTLEVBQUUsRUFBQyxPQUFPLEVBQUUsQ0FBQyxXQUFXLENBQUMsRUFBQztpQkFDcEM7YUFDRjtTQUNGO0tBQ0Y7Q0FDRixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7UHJvcGVydHlOYW1lVXBncmFkZURhdGEsIFRhcmdldFZlcnNpb24sIFZlcnNpb25DaGFuZ2VzfSBmcm9tICdAYW5ndWxhci9jZGsvc2NoZW1hdGljcyc7XG5cbmV4cG9ydCBjb25zdCBwcm9wZXJ0eU5hbWVzOiBWZXJzaW9uQ2hhbmdlczxQcm9wZXJ0eU5hbWVVcGdyYWRlRGF0YT4gPSB7XG4gIFtUYXJnZXRWZXJzaW9uLlYxMV06IFtcbiAgICB7XG4gICAgICBwcjogJ2h0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2NvbXBvbmVudHMvcHVsbC8yMDQ0OScsXG4gICAgICBjaGFuZ2VzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICByZXBsYWNlOiAnZ2V0UG9wdXBDb25uZWN0aW9uRWxlbWVudFJlZicsXG4gICAgICAgICAgcmVwbGFjZVdpdGg6ICdnZXRDb25uZWN0ZWRPdmVybGF5T3JpZ2luJyxcbiAgICAgICAgICBsaW1pdGVkVG86IHtjbGFzc2VzOiBbJ01hdERhdGVwaWNrZXJJbnB1dCddfVxuICAgICAgICB9XG4gICAgICBdXG4gICAgfVxuICBdLFxuICBbVGFyZ2V0VmVyc2lvbi5WOV06IFtcbiAgICB7XG4gICAgICBwcjogJ2h0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2NvbXBvbmVudHMvcHVsbC8xNzMzMycsXG4gICAgICBjaGFuZ2VzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICByZXBsYWNlOiAnYWZ0ZXJPcGVuJyxcbiAgICAgICAgICByZXBsYWNlV2l0aDogJ2FmdGVyT3BlbmVkJyxcbiAgICAgICAgICBsaW1pdGVkVG86IHtjbGFzc2VzOiBbJ01hdERpYWxvZ1JlZiddfVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgcmVwbGFjZTogJ2JlZm9yZUNsb3NlJyxcbiAgICAgICAgICByZXBsYWNlV2l0aDogJ2JlZm9yZUNsb3NlZCcsXG4gICAgICAgICAgbGltaXRlZFRvOiB7Y2xhc3NlczogWydNYXREaWFsb2dSZWYnXX1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHJlcGxhY2U6ICdhZnRlck9wZW4nLFxuICAgICAgICAgIHJlcGxhY2VXaXRoOiAnYWZ0ZXJPcGVuZWQnLFxuICAgICAgICAgIGxpbWl0ZWRUbzoge2NsYXNzZXM6IFsnTWF0RGlhbG9nJ119XG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9XG4gIF0sXG4gIFtUYXJnZXRWZXJzaW9uLlY2XTogW1xuICAgIHtcbiAgICAgIHByOiAnaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvY29tcG9uZW50cy9wdWxsLzEwMTYzJyxcbiAgICAgIGNoYW5nZXM6IFtcbiAgICAgICAge3JlcGxhY2U6ICdjaGFuZ2UnLCByZXBsYWNlV2l0aDogJ3NlbGVjdGlvbkNoYW5nZScsIGxpbWl0ZWRUbzoge2NsYXNzZXM6IFsnTWF0U2VsZWN0J119fSwge1xuICAgICAgICAgIHJlcGxhY2U6ICdvbk9wZW4nLFxuICAgICAgICAgIHJlcGxhY2VXaXRoOiAnb3BlbmVkQ2hhbmdlLnBpcGUoZmlsdGVyKGlzT3BlbiA9PiBpc09wZW4pKScsXG4gICAgICAgICAgbGltaXRlZFRvOiB7Y2xhc3NlczogWydNYXRTZWxlY3QnXX1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHJlcGxhY2U6ICdvbkNsb3NlJyxcbiAgICAgICAgICByZXBsYWNlV2l0aDogJ29wZW5lZENoYW5nZS5waXBlKGZpbHRlcihpc09wZW4gPT4gIWlzT3BlbikpJyxcbiAgICAgICAgICBsaW1pdGVkVG86IHtjbGFzc2VzOiBbJ01hdFNlbGVjdCddfVxuICAgICAgICB9XG4gICAgICBdXG4gICAgfSxcblxuICAgIHtcbiAgICAgIHByOiAnaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvY29tcG9uZW50cy9wdWxsLzEwMjE4JyxcbiAgICAgIGNoYW5nZXM6IFt7XG4gICAgICAgIHJlcGxhY2U6ICdhbGlnbicsXG4gICAgICAgIHJlcGxhY2VXaXRoOiAnbGFiZWxQb3NpdGlvbicsXG4gICAgICAgIGxpbWl0ZWRUbzoge2NsYXNzZXM6IFsnTWF0UmFkaW9Hcm91cCcsICdNYXRSYWRpb0J1dHRvbiddfVxuICAgICAgfV1cbiAgICB9LFxuXG4gICAge1xuICAgICAgcHI6ICdodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9jb21wb25lbnRzL3B1bGwvMTAyNTMnLFxuICAgICAgY2hhbmdlczogW3tcbiAgICAgICAgcmVwbGFjZTogJ2V4dHJhQ2xhc3NlcycsXG4gICAgICAgIHJlcGxhY2VXaXRoOiAncGFuZWxDbGFzcycsXG4gICAgICAgIGxpbWl0ZWRUbzoge2NsYXNzZXM6IFsnTWF0U25hY2tCYXJDb25maWcnXX1cbiAgICAgIH1dXG4gICAgfSxcblxuICAgIHtcbiAgICAgIHByOiAnaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvY29tcG9uZW50cy9wdWxsLzEwMjc5JyxcbiAgICAgIGNoYW5nZXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHJlcGxhY2U6ICdhbGlnbicsXG4gICAgICAgICAgcmVwbGFjZVdpdGg6ICdwb3NpdGlvbicsXG4gICAgICAgICAgbGltaXRlZFRvOiB7Y2xhc3NlczogWydNYXREcmF3ZXInLCAnTWF0U2lkZW5hdiddfVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgcmVwbGFjZTogJ29uQWxpZ25DaGFuZ2VkJyxcbiAgICAgICAgICByZXBsYWNlV2l0aDogJ29uUG9zaXRpb25DaGFuZ2VkJyxcbiAgICAgICAgICBsaW1pdGVkVG86IHtjbGFzc2VzOiBbJ01hdERyYXdlcicsICdNYXRTaWRlbmF2J119XG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICByZXBsYWNlOiAnb25PcGVuJyxcbiAgICAgICAgICByZXBsYWNlV2l0aDogJ29wZW5lZENoYW5nZS5waXBlKGZpbHRlcihpc09wZW4gPT4gaXNPcGVuKSknLFxuICAgICAgICAgIGxpbWl0ZWRUbzoge2NsYXNzZXM6IFsnTWF0RHJhd2VyJywgJ01hdFNpZGVuYXYnXX1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHJlcGxhY2U6ICdvbkNsb3NlJyxcbiAgICAgICAgICByZXBsYWNlV2l0aDogJ29wZW5lZENoYW5nZS5waXBlKGZpbHRlcihpc09wZW4gPT4gIWlzT3BlbikpJyxcbiAgICAgICAgICBsaW1pdGVkVG86IHtjbGFzc2VzOiBbJ01hdERyYXdlcicsICdNYXRTaWRlbmF2J119XG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9LFxuXG4gICAge1xuICAgICAgcHI6ICdodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9jb21wb25lbnRzL3B1bGwvMTAyOTMnLFxuICAgICAgY2hhbmdlczogW3tcbiAgICAgICAgcmVwbGFjZTogJ3Nob3VsZFBsYWNlaG9sZGVyRmxvYXQnLFxuICAgICAgICByZXBsYWNlV2l0aDogJ3Nob3VsZExhYmVsRmxvYXQnLFxuICAgICAgICBsaW1pdGVkVG86IHtjbGFzc2VzOiBbJ01hdEZvcm1GaWVsZENvbnRyb2wnLCAnTWF0U2VsZWN0J119XG4gICAgICB9XVxuICAgIH0sXG5cbiAgICB7XG4gICAgICBwcjogJ2h0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2NvbXBvbmVudHMvcHVsbC8xMDI5NCcsXG4gICAgICBjaGFuZ2VzOiBbXG4gICAgICAgIHtyZXBsYWNlOiAnZGl2aWRlckNvbG9yJywgcmVwbGFjZVdpdGg6ICdjb2xvcicsIGxpbWl0ZWRUbzoge2NsYXNzZXM6IFsnTWF0Rm9ybUZpZWxkJ119fSwge1xuICAgICAgICAgIHJlcGxhY2U6ICdmbG9hdFBsYWNlaG9sZGVyJyxcbiAgICAgICAgICByZXBsYWNlV2l0aDogJ2Zsb2F0TGFiZWwnLFxuICAgICAgICAgIGxpbWl0ZWRUbzoge2NsYXNzZXM6IFsnTWF0Rm9ybUZpZWxkJ119XG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9LFxuXG4gICAge1xuICAgICAgcHI6ICdodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9jb21wb25lbnRzL3B1bGwvMTAzMDknLFxuICAgICAgY2hhbmdlczogW1xuICAgICAgICB7XG4gICAgICAgICAgcmVwbGFjZTogJ3NlbGVjdENoYW5nZScsXG4gICAgICAgICAgcmVwbGFjZVdpdGg6ICdzZWxlY3RlZFRhYkNoYW5nZScsXG4gICAgICAgICAgbGltaXRlZFRvOiB7Y2xhc3NlczogWydNYXRUYWJHcm91cCddfVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgcmVwbGFjZTogJ19keW5hbWljSGVpZ2h0RGVwcmVjYXRlZCcsXG4gICAgICAgICAgcmVwbGFjZVdpdGg6ICdkeW5hbWljSGVpZ2h0JyxcbiAgICAgICAgICBsaW1pdGVkVG86IHtjbGFzc2VzOiBbJ01hdFRhYkdyb3VwJ119XG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9LFxuXG4gICAge1xuICAgICAgcHI6ICdodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9jb21wb25lbnRzL3B1bGwvMTAzMTEnLFxuICAgICAgY2hhbmdlczogW1xuICAgICAgICB7cmVwbGFjZTogJ2Rlc3Ryb3knLCByZXBsYWNlV2l0aDogJ2Rlc3Ryb3llZCcsIGxpbWl0ZWRUbzoge2NsYXNzZXM6IFsnTWF0Q2hpcCddfX0sXG4gICAgICAgIHtyZXBsYWNlOiAnb25SZW1vdmUnLCByZXBsYWNlV2l0aDogJ3JlbW92ZWQnLCBsaW1pdGVkVG86IHtjbGFzc2VzOiBbJ01hdENoaXAnXX19XG4gICAgICBdXG4gICAgfSxcblxuICAgIHtcbiAgICAgIHByOiAnaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvY29tcG9uZW50cy9wdWxsLzEwMzQyJyxcbiAgICAgIGNoYW5nZXM6XG4gICAgICAgICAgW3tyZXBsYWNlOiAnYWxpZ24nLCByZXBsYWNlV2l0aDogJ2xhYmVsUG9zaXRpb24nLCBsaW1pdGVkVG86IHtjbGFzc2VzOiBbJ01hdENoZWNrYm94J119fV1cbiAgICB9LFxuXG4gICAge1xuICAgICAgcHI6ICdodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9jb21wb25lbnRzL3B1bGwvMTAzNDQnLFxuICAgICAgY2hhbmdlczogW3tcbiAgICAgICAgcmVwbGFjZTogJ19wb3NpdGlvbkRlcHJlY2F0ZWQnLFxuICAgICAgICByZXBsYWNlV2l0aDogJ3Bvc2l0aW9uJyxcbiAgICAgICAgbGltaXRlZFRvOiB7Y2xhc3NlczogWydNYXRUb29sdGlwJ119XG4gICAgICB9XVxuICAgIH0sXG5cbiAgICB7XG4gICAgICBwcjogJ2h0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2NvbXBvbmVudHMvcHVsbC8xMDM3MycsXG4gICAgICBjaGFuZ2VzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICByZXBsYWNlOiAnX3RodW1iTGFiZWxEZXByZWNhdGVkJyxcbiAgICAgICAgICByZXBsYWNlV2l0aDogJ3RodW1iTGFiZWwnLFxuICAgICAgICAgIGxpbWl0ZWRUbzoge2NsYXNzZXM6IFsnTWF0U2xpZGVyJ119XG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICByZXBsYWNlOiAnX3RpY2tJbnRlcnZhbERlcHJlY2F0ZWQnLFxuICAgICAgICAgIHJlcGxhY2VXaXRoOiAndGlja0ludGVydmFsJyxcbiAgICAgICAgICBsaW1pdGVkVG86IHtjbGFzc2VzOiBbJ01hdFNsaWRlciddfVxuICAgICAgICB9XG4gICAgICBdXG4gICAgfSxcbiAgXVxufTtcbiJdfQ==