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
const target_version_1 = require("../../update-tool/target-version");
exports.inputNames = {
    [target_version_1.TargetVersion.V6]: [
        {
            pr: 'https://github.com/angular/components/pull/10161',
            changes: [
                {
                    replace: 'origin',
                    replaceWith: 'cdkConnectedOverlayOrigin',
                    limitedTo: { attributes: ['cdk-connected-overlay', 'connected-overlay', 'cdkConnectedOverlay'] }
                },
                {
                    replace: 'positions',
                    replaceWith: 'cdkConnectedOverlayPositions',
                    limitedTo: { attributes: ['cdk-connected-overlay', 'connected-overlay', 'cdkConnectedOverlay'] }
                },
                {
                    replace: 'offsetX',
                    replaceWith: 'cdkConnectedOverlayOffsetX',
                    limitedTo: { attributes: ['cdk-connected-overlay', 'connected-overlay', 'cdkConnectedOverlay'] }
                },
                {
                    replace: 'offsetY',
                    replaceWith: 'cdkConnectedOverlayOffsetY',
                    limitedTo: { attributes: ['cdk-connected-overlay', 'connected-overlay', 'cdkConnectedOverlay'] }
                },
                {
                    replace: 'width',
                    replaceWith: 'cdkConnectedOverlayWidth',
                    limitedTo: { attributes: ['cdk-connected-overlay', 'connected-overlay', 'cdkConnectedOverlay'] }
                },
                {
                    replace: 'height',
                    replaceWith: 'cdkConnectedOverlayHeight',
                    limitedTo: { attributes: ['cdk-connected-overlay', 'connected-overlay', 'cdkConnectedOverlay'] }
                },
                {
                    replace: 'minWidth',
                    replaceWith: 'cdkConnectedOverlayMinWidth',
                    limitedTo: { attributes: ['cdk-connected-overlay', 'connected-overlay', 'cdkConnectedOverlay'] }
                },
                {
                    replace: 'minHeight',
                    replaceWith: 'cdkConnectedOverlayMinHeight',
                    limitedTo: { attributes: ['cdk-connected-overlay', 'connected-overlay', 'cdkConnectedOverlay'] }
                },
                {
                    replace: 'backdropClass',
                    replaceWith: 'cdkConnectedOverlayBackdropClass',
                    limitedTo: { attributes: ['cdk-connected-overlay', 'connected-overlay', 'cdkConnectedOverlay'] }
                },
                {
                    replace: 'scrollStrategy',
                    replaceWith: 'cdkConnectedOverlayScrollStrategy',
                    limitedTo: { attributes: ['cdk-connected-overlay', 'connected-overlay', 'cdkConnectedOverlay'] }
                },
                {
                    replace: 'open',
                    replaceWith: 'cdkConnectedOverlayOpen',
                    limitedTo: { attributes: ['cdk-connected-overlay', 'connected-overlay', 'cdkConnectedOverlay'] }
                },
                {
                    replace: 'hasBackdrop',
                    replaceWith: 'cdkConnectedOverlayHasBackdrop',
                    limitedTo: { attributes: ['cdk-connected-overlay', 'connected-overlay', 'cdkConnectedOverlay'] }
                }
            ]
        },
    ]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5wdXQtbmFtZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL3NjaGVtYXRpY3MvbmctdXBkYXRlL2RhdGEvaW5wdXQtbmFtZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgscUVBQStEO0FBaUJsRCxRQUFBLFVBQVUsR0FBeUM7SUFDOUQsQ0FBQyw4QkFBYSxDQUFDLEVBQUUsQ0FBQyxFQUFFO1FBQ2xCO1lBQ0UsRUFBRSxFQUFFLGtEQUFrRDtZQUN0RCxPQUFPLEVBQUU7Z0JBQ1A7b0JBQ0UsT0FBTyxFQUFFLFFBQVE7b0JBQ2pCLFdBQVcsRUFBRSwyQkFBMkI7b0JBQ3hDLFNBQVMsRUFDTCxFQUFDLFVBQVUsRUFBRSxDQUFDLHVCQUF1QixFQUFFLG1CQUFtQixFQUFFLHFCQUFxQixDQUFDLEVBQUM7aUJBQ3hGO2dCQUNEO29CQUNFLE9BQU8sRUFBRSxXQUFXO29CQUNwQixXQUFXLEVBQUUsOEJBQThCO29CQUMzQyxTQUFTLEVBQ0wsRUFBQyxVQUFVLEVBQUUsQ0FBQyx1QkFBdUIsRUFBRSxtQkFBbUIsRUFBRSxxQkFBcUIsQ0FBQyxFQUFDO2lCQUN4RjtnQkFDRDtvQkFDRSxPQUFPLEVBQUUsU0FBUztvQkFDbEIsV0FBVyxFQUFFLDRCQUE0QjtvQkFDekMsU0FBUyxFQUNMLEVBQUMsVUFBVSxFQUFFLENBQUMsdUJBQXVCLEVBQUUsbUJBQW1CLEVBQUUscUJBQXFCLENBQUMsRUFBQztpQkFDeEY7Z0JBQ0Q7b0JBQ0UsT0FBTyxFQUFFLFNBQVM7b0JBQ2xCLFdBQVcsRUFBRSw0QkFBNEI7b0JBQ3pDLFNBQVMsRUFDTCxFQUFDLFVBQVUsRUFBRSxDQUFDLHVCQUF1QixFQUFFLG1CQUFtQixFQUFFLHFCQUFxQixDQUFDLEVBQUM7aUJBQ3hGO2dCQUNEO29CQUNFLE9BQU8sRUFBRSxPQUFPO29CQUNoQixXQUFXLEVBQUUsMEJBQTBCO29CQUN2QyxTQUFTLEVBQ0wsRUFBQyxVQUFVLEVBQUUsQ0FBQyx1QkFBdUIsRUFBRSxtQkFBbUIsRUFBRSxxQkFBcUIsQ0FBQyxFQUFDO2lCQUN4RjtnQkFDRDtvQkFDRSxPQUFPLEVBQUUsUUFBUTtvQkFDakIsV0FBVyxFQUFFLDJCQUEyQjtvQkFDeEMsU0FBUyxFQUNMLEVBQUMsVUFBVSxFQUFFLENBQUMsdUJBQXVCLEVBQUUsbUJBQW1CLEVBQUUscUJBQXFCLENBQUMsRUFBQztpQkFDeEY7Z0JBQ0Q7b0JBQ0UsT0FBTyxFQUFFLFVBQVU7b0JBQ25CLFdBQVcsRUFBRSw2QkFBNkI7b0JBQzFDLFNBQVMsRUFDTCxFQUFDLFVBQVUsRUFBRSxDQUFDLHVCQUF1QixFQUFFLG1CQUFtQixFQUFFLHFCQUFxQixDQUFDLEVBQUM7aUJBQ3hGO2dCQUNEO29CQUNFLE9BQU8sRUFBRSxXQUFXO29CQUNwQixXQUFXLEVBQUUsOEJBQThCO29CQUMzQyxTQUFTLEVBQ0wsRUFBQyxVQUFVLEVBQUUsQ0FBQyx1QkFBdUIsRUFBRSxtQkFBbUIsRUFBRSxxQkFBcUIsQ0FBQyxFQUFDO2lCQUN4RjtnQkFDRDtvQkFDRSxPQUFPLEVBQUUsZUFBZTtvQkFDeEIsV0FBVyxFQUFFLGtDQUFrQztvQkFDL0MsU0FBUyxFQUNMLEVBQUMsVUFBVSxFQUFFLENBQUMsdUJBQXVCLEVBQUUsbUJBQW1CLEVBQUUscUJBQXFCLENBQUMsRUFBQztpQkFDeEY7Z0JBQ0Q7b0JBQ0UsT0FBTyxFQUFFLGdCQUFnQjtvQkFDekIsV0FBVyxFQUFFLG1DQUFtQztvQkFDaEQsU0FBUyxFQUNMLEVBQUMsVUFBVSxFQUFFLENBQUMsdUJBQXVCLEVBQUUsbUJBQW1CLEVBQUUscUJBQXFCLENBQUMsRUFBQztpQkFDeEY7Z0JBQ0Q7b0JBQ0UsT0FBTyxFQUFFLE1BQU07b0JBQ2YsV0FBVyxFQUFFLHlCQUF5QjtvQkFDdEMsU0FBUyxFQUNMLEVBQUMsVUFBVSxFQUFFLENBQUMsdUJBQXVCLEVBQUUsbUJBQW1CLEVBQUUscUJBQXFCLENBQUMsRUFBQztpQkFDeEY7Z0JBQ0Q7b0JBQ0UsT0FBTyxFQUFFLGFBQWE7b0JBQ3RCLFdBQVcsRUFBRSxnQ0FBZ0M7b0JBQzdDLFNBQVMsRUFDTCxFQUFDLFVBQVUsRUFBRSxDQUFDLHVCQUF1QixFQUFFLG1CQUFtQixFQUFFLHFCQUFxQixDQUFDLEVBQUM7aUJBQ3hGO2FBQ0Y7U0FDRjtLQUNGO0NBQ0YsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1RhcmdldFZlcnNpb259IGZyb20gJy4uLy4uL3VwZGF0ZS10b29sL3RhcmdldC12ZXJzaW9uJztcbmltcG9ydCB7VmVyc2lvbkNoYW5nZXN9IGZyb20gJy4uLy4uL3VwZGF0ZS10b29sL3ZlcnNpb24tY2hhbmdlcyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgSW5wdXROYW1lVXBncmFkZURhdGEge1xuICAvKiogVGhlIEBJbnB1dCgpIG5hbWUgdG8gcmVwbGFjZS4gKi9cbiAgcmVwbGFjZTogc3RyaW5nO1xuICAvKiogVGhlIG5ldyBuYW1lIGZvciB0aGUgQElucHV0KCkuICovXG4gIHJlcGxhY2VXaXRoOiBzdHJpbmc7XG4gIC8qKiBDb250cm9scyB3aGljaCBlbGVtZW50cyBhbmQgYXR0cmlidXRlcyBpbiB3aGljaCB0aGlzIHJlcGxhY2VtZW50IGlzIG1hZGUuICovXG4gIGxpbWl0ZWRUbzoge1xuICAgIC8qKiBMaW1pdCB0byBlbGVtZW50cyB3aXRoIGFueSBvZiB0aGVzZSBlbGVtZW50IHRhZ3MuICovXG4gICAgZWxlbWVudHM/OiBzdHJpbmdbXSxcbiAgICAvKiogTGltaXQgdG8gZWxlbWVudHMgd2l0aCBhbnkgb2YgdGhlc2UgYXR0cmlidXRlcy4gKi9cbiAgICBhdHRyaWJ1dGVzPzogc3RyaW5nW10sXG4gIH07XG59XG5cbmV4cG9ydCBjb25zdCBpbnB1dE5hbWVzOiBWZXJzaW9uQ2hhbmdlczxJbnB1dE5hbWVVcGdyYWRlRGF0YT4gPSB7XG4gIFtUYXJnZXRWZXJzaW9uLlY2XTogW1xuICAgIHtcbiAgICAgIHByOiAnaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvY29tcG9uZW50cy9wdWxsLzEwMTYxJyxcbiAgICAgIGNoYW5nZXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHJlcGxhY2U6ICdvcmlnaW4nLFxuICAgICAgICAgIHJlcGxhY2VXaXRoOiAnY2RrQ29ubmVjdGVkT3ZlcmxheU9yaWdpbicsXG4gICAgICAgICAgbGltaXRlZFRvOlxuICAgICAgICAgICAgICB7YXR0cmlidXRlczogWydjZGstY29ubmVjdGVkLW92ZXJsYXknLCAnY29ubmVjdGVkLW92ZXJsYXknLCAnY2RrQ29ubmVjdGVkT3ZlcmxheSddfVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgcmVwbGFjZTogJ3Bvc2l0aW9ucycsXG4gICAgICAgICAgcmVwbGFjZVdpdGg6ICdjZGtDb25uZWN0ZWRPdmVybGF5UG9zaXRpb25zJyxcbiAgICAgICAgICBsaW1pdGVkVG86XG4gICAgICAgICAgICAgIHthdHRyaWJ1dGVzOiBbJ2Nkay1jb25uZWN0ZWQtb3ZlcmxheScsICdjb25uZWN0ZWQtb3ZlcmxheScsICdjZGtDb25uZWN0ZWRPdmVybGF5J119XG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICByZXBsYWNlOiAnb2Zmc2V0WCcsXG4gICAgICAgICAgcmVwbGFjZVdpdGg6ICdjZGtDb25uZWN0ZWRPdmVybGF5T2Zmc2V0WCcsXG4gICAgICAgICAgbGltaXRlZFRvOlxuICAgICAgICAgICAgICB7YXR0cmlidXRlczogWydjZGstY29ubmVjdGVkLW92ZXJsYXknLCAnY29ubmVjdGVkLW92ZXJsYXknLCAnY2RrQ29ubmVjdGVkT3ZlcmxheSddfVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgcmVwbGFjZTogJ29mZnNldFknLFxuICAgICAgICAgIHJlcGxhY2VXaXRoOiAnY2RrQ29ubmVjdGVkT3ZlcmxheU9mZnNldFknLFxuICAgICAgICAgIGxpbWl0ZWRUbzpcbiAgICAgICAgICAgICAge2F0dHJpYnV0ZXM6IFsnY2RrLWNvbm5lY3RlZC1vdmVybGF5JywgJ2Nvbm5lY3RlZC1vdmVybGF5JywgJ2Nka0Nvbm5lY3RlZE92ZXJsYXknXX1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHJlcGxhY2U6ICd3aWR0aCcsXG4gICAgICAgICAgcmVwbGFjZVdpdGg6ICdjZGtDb25uZWN0ZWRPdmVybGF5V2lkdGgnLFxuICAgICAgICAgIGxpbWl0ZWRUbzpcbiAgICAgICAgICAgICAge2F0dHJpYnV0ZXM6IFsnY2RrLWNvbm5lY3RlZC1vdmVybGF5JywgJ2Nvbm5lY3RlZC1vdmVybGF5JywgJ2Nka0Nvbm5lY3RlZE92ZXJsYXknXX1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHJlcGxhY2U6ICdoZWlnaHQnLFxuICAgICAgICAgIHJlcGxhY2VXaXRoOiAnY2RrQ29ubmVjdGVkT3ZlcmxheUhlaWdodCcsXG4gICAgICAgICAgbGltaXRlZFRvOlxuICAgICAgICAgICAgICB7YXR0cmlidXRlczogWydjZGstY29ubmVjdGVkLW92ZXJsYXknLCAnY29ubmVjdGVkLW92ZXJsYXknLCAnY2RrQ29ubmVjdGVkT3ZlcmxheSddfVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgcmVwbGFjZTogJ21pbldpZHRoJyxcbiAgICAgICAgICByZXBsYWNlV2l0aDogJ2Nka0Nvbm5lY3RlZE92ZXJsYXlNaW5XaWR0aCcsXG4gICAgICAgICAgbGltaXRlZFRvOlxuICAgICAgICAgICAgICB7YXR0cmlidXRlczogWydjZGstY29ubmVjdGVkLW92ZXJsYXknLCAnY29ubmVjdGVkLW92ZXJsYXknLCAnY2RrQ29ubmVjdGVkT3ZlcmxheSddfVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgcmVwbGFjZTogJ21pbkhlaWdodCcsXG4gICAgICAgICAgcmVwbGFjZVdpdGg6ICdjZGtDb25uZWN0ZWRPdmVybGF5TWluSGVpZ2h0JyxcbiAgICAgICAgICBsaW1pdGVkVG86XG4gICAgICAgICAgICAgIHthdHRyaWJ1dGVzOiBbJ2Nkay1jb25uZWN0ZWQtb3ZlcmxheScsICdjb25uZWN0ZWQtb3ZlcmxheScsICdjZGtDb25uZWN0ZWRPdmVybGF5J119XG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICByZXBsYWNlOiAnYmFja2Ryb3BDbGFzcycsXG4gICAgICAgICAgcmVwbGFjZVdpdGg6ICdjZGtDb25uZWN0ZWRPdmVybGF5QmFja2Ryb3BDbGFzcycsXG4gICAgICAgICAgbGltaXRlZFRvOlxuICAgICAgICAgICAgICB7YXR0cmlidXRlczogWydjZGstY29ubmVjdGVkLW92ZXJsYXknLCAnY29ubmVjdGVkLW92ZXJsYXknLCAnY2RrQ29ubmVjdGVkT3ZlcmxheSddfVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgcmVwbGFjZTogJ3Njcm9sbFN0cmF0ZWd5JyxcbiAgICAgICAgICByZXBsYWNlV2l0aDogJ2Nka0Nvbm5lY3RlZE92ZXJsYXlTY3JvbGxTdHJhdGVneScsXG4gICAgICAgICAgbGltaXRlZFRvOlxuICAgICAgICAgICAgICB7YXR0cmlidXRlczogWydjZGstY29ubmVjdGVkLW92ZXJsYXknLCAnY29ubmVjdGVkLW92ZXJsYXknLCAnY2RrQ29ubmVjdGVkT3ZlcmxheSddfVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgcmVwbGFjZTogJ29wZW4nLFxuICAgICAgICAgIHJlcGxhY2VXaXRoOiAnY2RrQ29ubmVjdGVkT3ZlcmxheU9wZW4nLFxuICAgICAgICAgIGxpbWl0ZWRUbzpcbiAgICAgICAgICAgICAge2F0dHJpYnV0ZXM6IFsnY2RrLWNvbm5lY3RlZC1vdmVybGF5JywgJ2Nvbm5lY3RlZC1vdmVybGF5JywgJ2Nka0Nvbm5lY3RlZE92ZXJsYXknXX1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHJlcGxhY2U6ICdoYXNCYWNrZHJvcCcsXG4gICAgICAgICAgcmVwbGFjZVdpdGg6ICdjZGtDb25uZWN0ZWRPdmVybGF5SGFzQmFja2Ryb3AnLFxuICAgICAgICAgIGxpbWl0ZWRUbzpcbiAgICAgICAgICAgICAge2F0dHJpYnV0ZXM6IFsnY2RrLWNvbm5lY3RlZC1vdmVybGF5JywgJ2Nvbm5lY3RlZC1vdmVybGF5JywgJ2Nka0Nvbm5lY3RlZE92ZXJsYXknXX1cbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0sXG4gIF1cbn07XG4iXX0=