/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { BidiModule } from '@angular/cdk/bidi';
import { PortalModule } from '@angular/cdk/portal';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { NgModule } from '@angular/core';
import { Overlay } from './overlay';
import { CDK_CONNECTED_OVERLAY_SCROLL_STRATEGY_PROVIDER, CdkConnectedOverlay, CdkOverlayOrigin, } from './overlay-directives';
export class OverlayModule {
}
OverlayModule.decorators = [
    { type: NgModule, args: [{
                imports: [BidiModule, PortalModule, ScrollingModule],
                exports: [CdkConnectedOverlay, CdkOverlayOrigin, ScrollingModule],
                declarations: [CdkConnectedOverlay, CdkOverlayOrigin],
                providers: [
                    Overlay,
                    CDK_CONNECTED_OVERLAY_SCROLL_STRATEGY_PROVIDER,
                ],
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3ZlcmxheS1tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL292ZXJsYXkvb3ZlcmxheS1tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQzdDLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUNqRCxPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0sd0JBQXdCLENBQUM7QUFDdkQsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN2QyxPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sV0FBVyxDQUFDO0FBQ2xDLE9BQU8sRUFDTCw4Q0FBOEMsRUFDOUMsbUJBQW1CLEVBQ25CLGdCQUFnQixHQUNqQixNQUFNLHNCQUFzQixDQUFDO0FBWTlCLE1BQU0sT0FBTyxhQUFhOzs7WUFUekIsUUFBUSxTQUFDO2dCQUNSLE9BQU8sRUFBRSxDQUFDLFVBQVUsRUFBRSxZQUFZLEVBQUUsZUFBZSxDQUFDO2dCQUNwRCxPQUFPLEVBQUUsQ0FBQyxtQkFBbUIsRUFBRSxnQkFBZ0IsRUFBRSxlQUFlLENBQUM7Z0JBQ2pFLFlBQVksRUFBRSxDQUFDLG1CQUFtQixFQUFFLGdCQUFnQixDQUFDO2dCQUNyRCxTQUFTLEVBQUU7b0JBQ1QsT0FBTztvQkFDUCw4Q0FBOEM7aUJBQy9DO2FBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtCaWRpTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jZGsvYmlkaSc7XG5pbXBvcnQge1BvcnRhbE1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY2RrL3BvcnRhbCc7XG5pbXBvcnQge1Njcm9sbGluZ01vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY2RrL3Njcm9sbGluZyc7XG5pbXBvcnQge05nTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7T3ZlcmxheX0gZnJvbSAnLi9vdmVybGF5JztcbmltcG9ydCB7XG4gIENES19DT05ORUNURURfT1ZFUkxBWV9TQ1JPTExfU1RSQVRFR1lfUFJPVklERVIsXG4gIENka0Nvbm5lY3RlZE92ZXJsYXksXG4gIENka092ZXJsYXlPcmlnaW4sXG59IGZyb20gJy4vb3ZlcmxheS1kaXJlY3RpdmVzJztcblxuXG5ATmdNb2R1bGUoe1xuICBpbXBvcnRzOiBbQmlkaU1vZHVsZSwgUG9ydGFsTW9kdWxlLCBTY3JvbGxpbmdNb2R1bGVdLFxuICBleHBvcnRzOiBbQ2RrQ29ubmVjdGVkT3ZlcmxheSwgQ2RrT3ZlcmxheU9yaWdpbiwgU2Nyb2xsaW5nTW9kdWxlXSxcbiAgZGVjbGFyYXRpb25zOiBbQ2RrQ29ubmVjdGVkT3ZlcmxheSwgQ2RrT3ZlcmxheU9yaWdpbl0sXG4gIHByb3ZpZGVyczogW1xuICAgIE92ZXJsYXksXG4gICAgQ0RLX0NPTk5FQ1RFRF9PVkVSTEFZX1NDUk9MTF9TVFJBVEVHWV9QUk9WSURFUixcbiAgXSxcbn0pXG5leHBvcnQgY2xhc3MgT3ZlcmxheU1vZHVsZSB7fVxuIl19