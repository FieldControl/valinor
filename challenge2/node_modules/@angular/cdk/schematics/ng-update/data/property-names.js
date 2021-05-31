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
const target_version_1 = require("../../update-tool/target-version");
exports.propertyNames = {
    [target_version_1.TargetVersion.V9]: [
        {
            pr: 'https://github.com/angular/components/pull/17084',
            changes: [{
                    replace: 'boundaryElementSelector',
                    replaceWith: 'boundaryElement',
                    limitedTo: { classes: ['CdkDrag'] }
                }]
        },
        {
            pr: 'https://github.com/angular/components/pull/17302',
            changes: [{
                    replace: 'onChange',
                    replaceWith: 'changed',
                    limitedTo: { classes: ['SelectionModel'] }
                }]
        }
    ],
    [target_version_1.TargetVersion.V8]: [],
    [target_version_1.TargetVersion.V7]: [
        {
            pr: 'https://github.com/angular/components/pull/8286',
            changes: [{ replace: 'onChange', replaceWith: 'changed', limitedTo: { classes: ['SelectionModel'] } }]
        },
        {
            pr: 'https://github.com/angular/components/pull/12927',
            changes: [{
                    replace: 'flexibleDiemsions',
                    replaceWith: 'flexibleDimensions',
                    limitedTo: { classes: ['CdkConnectedOverlay'] }
                }]
        }
    ],
    [target_version_1.TargetVersion.V6]: [
        {
            pr: 'https://github.com/angular/components/pull/10161',
            changes: [
                {
                    replace: '_deprecatedOrigin',
                    replaceWith: 'origin',
                    limitedTo: { classes: ['CdkConnectedOverlay', 'ConnectedOverlayDirective'] }
                },
                {
                    replace: '_deprecatedPositions',
                    replaceWith: 'positions',
                    limitedTo: { classes: ['CdkConnectedOverlay', 'ConnectedOverlayDirective'] }
                },
                {
                    replace: '_deprecatedOffsetX',
                    replaceWith: 'offsetX',
                    limitedTo: { classes: ['CdkConnectedOverlay', 'ConnectedOverlayDirective'] }
                },
                {
                    replace: '_deprecatedOffsetY',
                    replaceWith: 'offsetY',
                    limitedTo: { classes: ['CdkConnectedOverlay', 'ConnectedOverlayDirective'] }
                },
                {
                    replace: '_deprecatedWidth',
                    replaceWith: 'width',
                    limitedTo: { classes: ['CdkConnectedOverlay', 'ConnectedOverlayDirective'] }
                },
                {
                    replace: '_deprecatedHeight',
                    replaceWith: 'height',
                    limitedTo: { classes: ['CdkConnectedOverlay', 'ConnectedOverlayDirective'] }
                },
                {
                    replace: '_deprecatedMinWidth',
                    replaceWith: 'minWidth',
                    limitedTo: { classes: ['CdkConnectedOverlay', 'ConnectedOverlayDirective'] }
                },
                {
                    replace: '_deprecatedMinHeight',
                    replaceWith: 'minHeight',
                    limitedTo: { classes: ['CdkConnectedOverlay', 'ConnectedOverlayDirective'] }
                },
                {
                    replace: '_deprecatedBackdropClass',
                    replaceWith: 'backdropClass',
                    limitedTo: { classes: ['CdkConnectedOverlay', 'ConnectedOverlayDirective'] }
                },
                {
                    replace: '_deprecatedScrollStrategy',
                    replaceWith: 'scrollStrategy',
                    limitedTo: { classes: ['CdkConnectedOverlay', 'ConnectedOverlayDirective'] }
                },
                {
                    replace: '_deprecatedOpen',
                    replaceWith: 'open',
                    limitedTo: { classes: ['CdkConnectedOverlay', 'ConnectedOverlayDirective'] }
                },
                {
                    replace: '_deprecatedHasBackdrop',
                    replaceWith: 'hasBackdrop',
                    limitedTo: { classes: ['CdkConnectedOverlay', 'ConnectedOverlayDirective'] }
                }
            ]
        },
        {
            pr: 'https://github.com/angular/components/pull/10257',
            changes: [
                {
                    replace: '_deprecatedPortal',
                    replaceWith: 'portal',
                    limitedTo: { classes: ['CdkPortalOutlet'] }
                },
                {
                    replace: '_deprecatedPortalHost',
                    replaceWith: 'portal',
                    limitedTo: { classes: ['CdkPortalOutlet'] }
                }
            ]
        },
    ]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvcGVydHktbmFtZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL3NjaGVtYXRpY3MvbmctdXBkYXRlL2RhdGEvcHJvcGVydHktbmFtZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgscUVBQStEO0FBZWxELFFBQUEsYUFBYSxHQUE0QztJQUNwRSxDQUFDLDhCQUFhLENBQUMsRUFBRSxDQUFDLEVBQUU7UUFDbEI7WUFDRSxFQUFFLEVBQUUsa0RBQWtEO1lBQ3RELE9BQU8sRUFBRSxDQUFDO29CQUNSLE9BQU8sRUFBRSx5QkFBeUI7b0JBQ2xDLFdBQVcsRUFBRSxpQkFBaUI7b0JBQzlCLFNBQVMsRUFBRSxFQUFDLE9BQU8sRUFBRSxDQUFDLFNBQVMsQ0FBQyxFQUFDO2lCQUNsQyxDQUFDO1NBQ0g7UUFDRDtZQUNFLEVBQUUsRUFBRSxrREFBa0Q7WUFDdEQsT0FBTyxFQUFFLENBQUM7b0JBQ1IsT0FBTyxFQUFFLFVBQVU7b0JBQ25CLFdBQVcsRUFBRSxTQUFTO29CQUN0QixTQUFTLEVBQUUsRUFBQyxPQUFPLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFDO2lCQUN6QyxDQUFDO1NBQ0g7S0FDRjtJQUNELENBQUMsOEJBQWEsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO0lBQ3RCLENBQUMsOEJBQWEsQ0FBQyxFQUFFLENBQUMsRUFBRTtRQUNsQjtZQUNFLEVBQUUsRUFBRSxpREFBaUQ7WUFDckQsT0FBTyxFQUNILENBQUMsRUFBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLEVBQUMsT0FBTyxFQUFFLENBQUMsZ0JBQWdCLENBQUMsRUFBQyxFQUFDLENBQUM7U0FDOUY7UUFFRDtZQUNFLEVBQUUsRUFBRSxrREFBa0Q7WUFDdEQsT0FBTyxFQUFFLENBQUM7b0JBQ1IsT0FBTyxFQUFFLG1CQUFtQjtvQkFD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RSxDQUFDLGlCQUFpQixDQUFDLEVBQUM7aUJBQzFDO2dCQUNEO29CQUNFLE9BQU8sRUFBRSx1QkFBdUI7b0JBQ2hDLFdBQVcsRUFBRSxRQUFRO29CQUNyQixTQUFTLEVBQUUsRUFBQyxPQUFPLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxFQUFDO2lCQUMxQzthQUNGO1NBQ0Y7S0FDRjtDQUNGLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtUYXJnZXRWZXJzaW9ufSBmcm9tICcuLi8uLi91cGRhdGUtdG9vbC90YXJnZXQtdmVyc2lvbic7XG5pbXBvcnQge1ZlcnNpb25DaGFuZ2VzfSBmcm9tICcuLi8uLi91cGRhdGUtdG9vbC92ZXJzaW9uLWNoYW5nZXMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFByb3BlcnR5TmFtZVVwZ3JhZGVEYXRhIHtcbiAgLyoqIFRoZSBwcm9wZXJ0eSBuYW1lIHRvIHJlcGxhY2UuICovXG4gIHJlcGxhY2U6IHN0cmluZztcbiAgLyoqIFRoZSBuZXcgbmFtZSBmb3IgdGhlIHByb3BlcnR5LiAqL1xuICByZXBsYWNlV2l0aDogc3RyaW5nO1xuICAvKiogQ29udHJvbHMgd2hpY2ggY2xhc3NlcyBpbiB3aGljaCB0aGlzIHJlcGxhY2VtZW50IGlzIG1hZGUuICovXG4gIGxpbWl0ZWRUbzoge1xuICAgIC8qKiBSZXBsYWNlIHRoZSBwcm9wZXJ0eSBvbmx5IHdoZW4gaXRzIHR5cGUgaXMgb25lIG9mIHRoZSBnaXZlbiBDbGFzc2VzLiAqL1xuICAgIGNsYXNzZXM6IHN0cmluZ1tdO1xuICB9O1xufVxuXG5leHBvcnQgY29uc3QgcHJvcGVydHlOYW1lczogVmVyc2lvbkNoYW5nZXM8UHJvcGVydHlOYW1lVXBncmFkZURhdGE+ID0ge1xuICBbVGFyZ2V0VmVyc2lvbi5WOV06IFtcbiAgICB7XG4gICAgICBwcjogJ2h0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2NvbXBvbmVudHMvcHVsbC8xNzA4NCcsXG4gICAgICBjaGFuZ2VzOiBbe1xuICAgICAgICByZXBsYWNlOiAnYm91bmRhcnlFbGVtZW50U2VsZWN0b3InLFxuICAgICAgICByZXBsYWNlV2l0aDogJ2JvdW5kYXJ5RWxlbWVudCcsXG4gICAgICAgIGxpbWl0ZWRUbzoge2NsYXNzZXM6IFsnQ2RrRHJhZyddfVxuICAgICAgfV1cbiAgICB9LFxuICAgIHtcbiAgICAgIHByOiAnaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvY29tcG9uZW50cy9wdWxsLzE3MzAyJyxcbiAgICAgIGNoYW5nZXM6IFt7XG4gICAgICAgIHJlcGxhY2U6ICdvbkNoYW5nZScsXG4gICAgICAgIHJlcGxhY2VXaXRoOiAnY2hhbmdlZCcsXG4gICAgICAgIGxpbWl0ZWRUbzoge2NsYXNzZXM6IFsnU2VsZWN0aW9uTW9kZWwnXX1cbiAgICAgIH1dXG4gICAgfVxuICBdLFxuICBbVGFyZ2V0VmVyc2lvbi5WOF06IFtdLFxuICBbVGFyZ2V0VmVyc2lvbi5WN106IFtcbiAgICB7XG4gICAgICBwcjogJ2h0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2NvbXBvbmVudHMvcHVsbC84Mjg2JyxcbiAgICAgIGNoYW5nZXM6XG4gICAgICAgICAgW3tyZXBsYWNlOiAnb25DaGFuZ2UnLCByZXBsYWNlV2l0aDogJ2NoYW5nZWQnLCBsaW1pdGVkVG86IHtjbGFzc2VzOiBbJ1NlbGVjdGlvbk1vZGVsJ119fV1cbiAgICB9LFxuXG4gICAge1xuICAgICAgcHI6ICdodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9jb21wb25lbnRzL3B1bGwvMTI5MjcnLFxuICAgICAgY2hhbmdlczogW3tcbiAgICAgICAgcmVwbGFjZTogJ2ZsZXhpYmxlRGllbXNpb25zJyxcbiAgICAgICAgcmVwbGFjZVdpdGg6ICdmbGV4aWJsZURpbWVuc2lvbnMnLFxuICAgICAgICBsaW1pdGVkVG86IHtjbGFzc2VzOiBbJ0Nka0Nvbm5lY3RlZE92ZXJsYXknXX1cbiAgICAgIH1dXG4gICAgfVxuICBdLFxuXG4gIFtUYXJnZXRWZXJzaW9uLlY2XTogW1xuICAgIHtcbiAgICAgIHByOiAnaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvY29tcG9uZW50cy9wdWxsLzEwMTYxJyxcbiAgICAgIGNoYW5nZXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHJlcGxhY2U6ICdfZGVwcmVjYXRlZE9yaWdpbicsXG4gICAgICAgICAgcmVwbGFjZVdpdGg6ICdvcmlnaW4nLFxuICAgICAgICAgIGxpbWl0ZWRUbzoge2NsYXNzZXM6IFsnQ2RrQ29ubmVjdGVkT3ZlcmxheScsICdDb25uZWN0ZWRPdmVybGF5RGlyZWN0aXZlJ119XG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICByZXBsYWNlOiAnX2RlcHJlY2F0ZWRQb3NpdGlvbnMnLFxuICAgICAgICAgIHJlcGxhY2VXaXRoOiAncG9zaXRpb25zJyxcbiAgICAgICAgICBsaW1pdGVkVG86IHtjbGFzc2VzOiBbJ0Nka0Nvbm5lY3RlZE92ZXJsYXknLCAnQ29ubmVjdGVkT3ZlcmxheURpcmVjdGl2ZSddfVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgcmVwbGFjZTogJ19kZXByZWNhdGVkT2Zmc2V0WCcsXG4gICAgICAgICAgcmVwbGFjZVdpdGg6ICdvZmZzZXRYJyxcbiAgICAgICAgICBsaW1pdGVkVG86IHtjbGFzc2VzOiBbJ0Nka0Nvbm5lY3RlZE92ZXJsYXknLCAnQ29ubmVjdGVkT3ZlcmxheURpcmVjdGl2ZSddfVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgcmVwbGFjZTogJ19kZXByZWNhdGVkT2Zmc2V0WScsXG4gICAgICAgICAgcmVwbGFjZVdpdGg6ICdvZmZzZXRZJyxcbiAgICAgICAgICBsaW1pdGVkVG86IHtjbGFzc2VzOiBbJ0Nka0Nvbm5lY3RlZE92ZXJsYXknLCAnQ29ubmVjdGVkT3ZlcmxheURpcmVjdGl2ZSddfVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgcmVwbGFjZTogJ19kZXByZWNhdGVkV2lkdGgnLFxuICAgICAgICAgIHJlcGxhY2VXaXRoOiAnd2lkdGgnLFxuICAgICAgICAgIGxpbWl0ZWRUbzoge2NsYXNzZXM6IFsnQ2RrQ29ubmVjdGVkT3ZlcmxheScsICdDb25uZWN0ZWRPdmVybGF5RGlyZWN0aXZlJ119XG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICByZXBsYWNlOiAnX2RlcHJlY2F0ZWRIZWlnaHQnLFxuICAgICAgICAgIHJlcGxhY2VXaXRoOiAnaGVpZ2h0JyxcbiAgICAgICAgICBsaW1pdGVkVG86IHtjbGFzc2VzOiBbJ0Nka0Nvbm5lY3RlZE92ZXJsYXknLCAnQ29ubmVjdGVkT3ZlcmxheURpcmVjdGl2ZSddfVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgcmVwbGFjZTogJ19kZXByZWNhdGVkTWluV2lkdGgnLFxuICAgICAgICAgIHJlcGxhY2VXaXRoOiAnbWluV2lkdGgnLFxuICAgICAgICAgIGxpbWl0ZWRUbzoge2NsYXNzZXM6IFsnQ2RrQ29ubmVjdGVkT3ZlcmxheScsICdDb25uZWN0ZWRPdmVybGF5RGlyZWN0aXZlJ119XG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICByZXBsYWNlOiAnX2RlcHJlY2F0ZWRNaW5IZWlnaHQnLFxuICAgICAgICAgIHJlcGxhY2VXaXRoOiAnbWluSGVpZ2h0JyxcbiAgICAgICAgICBsaW1pdGVkVG86IHtjbGFzc2VzOiBbJ0Nka0Nvbm5lY3RlZE92ZXJsYXknLCAnQ29ubmVjdGVkT3ZlcmxheURpcmVjdGl2ZSddfVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgcmVwbGFjZTogJ19kZXByZWNhdGVkQmFja2Ryb3BDbGFzcycsXG4gICAgICAgICAgcmVwbGFjZVdpdGg6ICdiYWNrZHJvcENsYXNzJyxcbiAgICAgICAgICBsaW1pdGVkVG86IHtjbGFzc2VzOiBbJ0Nka0Nvbm5lY3RlZE92ZXJsYXknLCAnQ29ubmVjdGVkT3ZlcmxheURpcmVjdGl2ZSddfVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgcmVwbGFjZTogJ19kZXByZWNhdGVkU2Nyb2xsU3RyYXRlZ3knLFxuICAgICAgICAgIHJlcGxhY2VXaXRoOiAnc2Nyb2xsU3RyYXRlZ3knLFxuICAgICAgICAgIGxpbWl0ZWRUbzoge2NsYXNzZXM6IFsnQ2RrQ29ubmVjdGVkT3ZlcmxheScsICdDb25uZWN0ZWRPdmVybGF5RGlyZWN0aXZlJ119XG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICByZXBsYWNlOiAnX2RlcHJlY2F0ZWRPcGVuJyxcbiAgICAgICAgICByZXBsYWNlV2l0aDogJ29wZW4nLFxuICAgICAgICAgIGxpbWl0ZWRUbzoge2NsYXNzZXM6IFsnQ2RrQ29ubmVjdGVkT3ZlcmxheScsICdDb25uZWN0ZWRPdmVybGF5RGlyZWN0aXZlJ119XG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICByZXBsYWNlOiAnX2RlcHJlY2F0ZWRIYXNCYWNrZHJvcCcsXG4gICAgICAgICAgcmVwbGFjZVdpdGg6ICdoYXNCYWNrZHJvcCcsXG4gICAgICAgICAgbGltaXRlZFRvOiB7Y2xhc3NlczogWydDZGtDb25uZWN0ZWRPdmVybGF5JywgJ0Nvbm5lY3RlZE92ZXJsYXlEaXJlY3RpdmUnXX1cbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0sXG5cbiAgICB7XG4gICAgICBwcjogJ2h0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2NvbXBvbmVudHMvcHVsbC8xMDI1NycsXG4gICAgICBjaGFuZ2VzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICByZXBsYWNlOiAnX2RlcHJlY2F0ZWRQb3J0YWwnLFxuICAgICAgICAgIHJlcGxhY2VXaXRoOiAncG9ydGFsJyxcbiAgICAgICAgICBsaW1pdGVkVG86IHtjbGFzc2VzOiBbJ0Nka1BvcnRhbE91dGxldCddfVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgcmVwbGFjZTogJ19kZXByZWNhdGVkUG9ydGFsSG9zdCcsXG4gICAgICAgICAgcmVwbGFjZVdpdGg6ICdwb3J0YWwnLFxuICAgICAgICAgIGxpbWl0ZWRUbzoge2NsYXNzZXM6IFsnQ2RrUG9ydGFsT3V0bGV0J119XG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9LFxuICBdXG59O1xuIl19