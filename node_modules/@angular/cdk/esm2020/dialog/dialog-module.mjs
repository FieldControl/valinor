/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { NgModule } from '@angular/core';
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { A11yModule } from '@angular/cdk/a11y';
import { Dialog } from './dialog';
import { CdkDialogContainer } from './dialog-container';
import { DIALOG_SCROLL_STRATEGY_PROVIDER } from './dialog-injectors';
import * as i0 from "@angular/core";
export class DialogModule {
}
DialogModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: DialogModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
DialogModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "15.2.0-rc.0", ngImport: i0, type: DialogModule, declarations: [CdkDialogContainer], imports: [OverlayModule, PortalModule, A11yModule], exports: [
        // Re-export the PortalModule so that people extending the `CdkDialogContainer`
        // don't have to remember to import it or be faced with an unhelpful error.
        PortalModule,
        CdkDialogContainer] });
DialogModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: DialogModule, providers: [Dialog, DIALOG_SCROLL_STRATEGY_PROVIDER], imports: [OverlayModule, PortalModule, A11yModule, 
        // Re-export the PortalModule so that people extending the `CdkDialogContainer`
        // don't have to remember to import it or be faced with an unhelpful error.
        PortalModule] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: DialogModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [OverlayModule, PortalModule, A11yModule],
                    exports: [
                        // Re-export the PortalModule so that people extending the `CdkDialogContainer`
                        // don't have to remember to import it or be faced with an unhelpful error.
                        PortalModule,
                        CdkDialogContainer,
                    ],
                    declarations: [CdkDialogContainer],
                    providers: [Dialog, DIALOG_SCROLL_STRATEGY_PROVIDER],
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhbG9nLW1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvZGlhbG9nL2RpYWxvZy1tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN2QyxPQUFPLEVBQUMsYUFBYSxFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFDbkQsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQ2pELE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUM3QyxPQUFPLEVBQUMsTUFBTSxFQUFDLE1BQU0sVUFBVSxDQUFDO0FBQ2hDLE9BQU8sRUFBQyxrQkFBa0IsRUFBQyxNQUFNLG9CQUFvQixDQUFDO0FBQ3RELE9BQU8sRUFBQywrQkFBK0IsRUFBQyxNQUFNLG9CQUFvQixDQUFDOztBQWFuRSxNQUFNLE9BQU8sWUFBWTs7OEdBQVosWUFBWTsrR0FBWixZQUFZLGlCQUhSLGtCQUFrQixhQVB2QixhQUFhLEVBQUUsWUFBWSxFQUFFLFVBQVU7UUFFL0MsK0VBQStFO1FBQy9FLDJFQUEyRTtRQUMzRSxZQUFZO1FBQ1osa0JBQWtCOytHQUtULFlBQVksYUFGWixDQUFDLE1BQU0sRUFBRSwrQkFBK0IsQ0FBQyxZQVIxQyxhQUFhLEVBQUUsWUFBWSxFQUFFLFVBQVU7UUFFL0MsK0VBQStFO1FBQy9FLDJFQUEyRTtRQUMzRSxZQUFZO2dHQU1ILFlBQVk7a0JBWHhCLFFBQVE7bUJBQUM7b0JBQ1IsT0FBTyxFQUFFLENBQUMsYUFBYSxFQUFFLFlBQVksRUFBRSxVQUFVLENBQUM7b0JBQ2xELE9BQU8sRUFBRTt3QkFDUCwrRUFBK0U7d0JBQy9FLDJFQUEyRTt3QkFDM0UsWUFBWTt3QkFDWixrQkFBa0I7cUJBQ25CO29CQUNELFlBQVksRUFBRSxDQUFDLGtCQUFrQixDQUFDO29CQUNsQyxTQUFTLEVBQUUsQ0FBQyxNQUFNLEVBQUUsK0JBQStCLENBQUM7aUJBQ3JEIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7TmdNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtPdmVybGF5TW9kdWxlfSBmcm9tICdAYW5ndWxhci9jZGsvb3ZlcmxheSc7XG5pbXBvcnQge1BvcnRhbE1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY2RrL3BvcnRhbCc7XG5pbXBvcnQge0ExMXlNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2Nkay9hMTF5JztcbmltcG9ydCB7RGlhbG9nfSBmcm9tICcuL2RpYWxvZyc7XG5pbXBvcnQge0Nka0RpYWxvZ0NvbnRhaW5lcn0gZnJvbSAnLi9kaWFsb2ctY29udGFpbmVyJztcbmltcG9ydCB7RElBTE9HX1NDUk9MTF9TVFJBVEVHWV9QUk9WSURFUn0gZnJvbSAnLi9kaWFsb2ctaW5qZWN0b3JzJztcblxuQE5nTW9kdWxlKHtcbiAgaW1wb3J0czogW092ZXJsYXlNb2R1bGUsIFBvcnRhbE1vZHVsZSwgQTExeU1vZHVsZV0sXG4gIGV4cG9ydHM6IFtcbiAgICAvLyBSZS1leHBvcnQgdGhlIFBvcnRhbE1vZHVsZSBzbyB0aGF0IHBlb3BsZSBleHRlbmRpbmcgdGhlIGBDZGtEaWFsb2dDb250YWluZXJgXG4gICAgLy8gZG9uJ3QgaGF2ZSB0byByZW1lbWJlciB0byBpbXBvcnQgaXQgb3IgYmUgZmFjZWQgd2l0aCBhbiB1bmhlbHBmdWwgZXJyb3IuXG4gICAgUG9ydGFsTW9kdWxlLFxuICAgIENka0RpYWxvZ0NvbnRhaW5lcixcbiAgXSxcbiAgZGVjbGFyYXRpb25zOiBbQ2RrRGlhbG9nQ29udGFpbmVyXSxcbiAgcHJvdmlkZXJzOiBbRGlhbG9nLCBESUFMT0dfU0NST0xMX1NUUkFURUdZX1BST1ZJREVSXSxcbn0pXG5leHBvcnQgY2xhc3MgRGlhbG9nTW9kdWxlIHt9XG4iXX0=