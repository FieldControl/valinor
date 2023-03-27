/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ObserversModule } from '@angular/cdk/observers';
import { NgModule } from '@angular/core';
import { CdkMonitorFocus } from './focus-monitor/focus-monitor';
import { CdkTrapFocus } from './focus-trap/focus-trap';
import { HighContrastModeDetector } from './high-contrast-mode/high-contrast-mode-detector';
import { CdkAriaLive } from './live-announcer/live-announcer';
import * as i0 from "@angular/core";
import * as i1 from "./high-contrast-mode/high-contrast-mode-detector";
export class A11yModule {
    constructor(highContrastModeDetector) {
        highContrastModeDetector._applyBodyHighContrastModeCssClasses();
    }
}
A11yModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: A11yModule, deps: [{ token: i1.HighContrastModeDetector }], target: i0.ɵɵFactoryTarget.NgModule });
A11yModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "15.2.0-rc.0", ngImport: i0, type: A11yModule, declarations: [CdkAriaLive, CdkTrapFocus, CdkMonitorFocus], imports: [ObserversModule], exports: [CdkAriaLive, CdkTrapFocus, CdkMonitorFocus] });
A11yModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: A11yModule, imports: [ObserversModule] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: A11yModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [ObserversModule],
                    declarations: [CdkAriaLive, CdkTrapFocus, CdkMonitorFocus],
                    exports: [CdkAriaLive, CdkTrapFocus, CdkMonitorFocus],
                }]
        }], ctorParameters: function () { return [{ type: i1.HighContrastModeDetector }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYTExeS1tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL2ExMXkvYTExeS1tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBQ3ZELE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDdkMsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLCtCQUErQixDQUFDO0FBQzlELE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSx5QkFBeUIsQ0FBQztBQUNyRCxPQUFPLEVBQUMsd0JBQXdCLEVBQUMsTUFBTSxrREFBa0QsQ0FBQztBQUMxRixPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0saUNBQWlDLENBQUM7OztBQU81RCxNQUFNLE9BQU8sVUFBVTtJQUNyQixZQUFZLHdCQUFrRDtRQUM1RCx3QkFBd0IsQ0FBQyxvQ0FBb0MsRUFBRSxDQUFDO0lBQ2xFLENBQUM7OzRHQUhVLFVBQVU7NkdBQVYsVUFBVSxpQkFITixXQUFXLEVBQUUsWUFBWSxFQUFFLGVBQWUsYUFEL0MsZUFBZSxhQUVmLFdBQVcsRUFBRSxZQUFZLEVBQUUsZUFBZTs2R0FFekMsVUFBVSxZQUpYLGVBQWU7Z0dBSWQsVUFBVTtrQkFMdEIsUUFBUTttQkFBQztvQkFDUixPQUFPLEVBQUUsQ0FBQyxlQUFlLENBQUM7b0JBQzFCLFlBQVksRUFBRSxDQUFDLFdBQVcsRUFBRSxZQUFZLEVBQUUsZUFBZSxDQUFDO29CQUMxRCxPQUFPLEVBQUUsQ0FBQyxXQUFXLEVBQUUsWUFBWSxFQUFFLGVBQWUsQ0FBQztpQkFDdEQiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtPYnNlcnZlcnNNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2Nkay9vYnNlcnZlcnMnO1xuaW1wb3J0IHtOZ01vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0Nka01vbml0b3JGb2N1c30gZnJvbSAnLi9mb2N1cy1tb25pdG9yL2ZvY3VzLW1vbml0b3InO1xuaW1wb3J0IHtDZGtUcmFwRm9jdXN9IGZyb20gJy4vZm9jdXMtdHJhcC9mb2N1cy10cmFwJztcbmltcG9ydCB7SGlnaENvbnRyYXN0TW9kZURldGVjdG9yfSBmcm9tICcuL2hpZ2gtY29udHJhc3QtbW9kZS9oaWdoLWNvbnRyYXN0LW1vZGUtZGV0ZWN0b3InO1xuaW1wb3J0IHtDZGtBcmlhTGl2ZX0gZnJvbSAnLi9saXZlLWFubm91bmNlci9saXZlLWFubm91bmNlcic7XG5cbkBOZ01vZHVsZSh7XG4gIGltcG9ydHM6IFtPYnNlcnZlcnNNb2R1bGVdLFxuICBkZWNsYXJhdGlvbnM6IFtDZGtBcmlhTGl2ZSwgQ2RrVHJhcEZvY3VzLCBDZGtNb25pdG9yRm9jdXNdLFxuICBleHBvcnRzOiBbQ2RrQXJpYUxpdmUsIENka1RyYXBGb2N1cywgQ2RrTW9uaXRvckZvY3VzXSxcbn0pXG5leHBvcnQgY2xhc3MgQTExeU1vZHVsZSB7XG4gIGNvbnN0cnVjdG9yKGhpZ2hDb250cmFzdE1vZGVEZXRlY3RvcjogSGlnaENvbnRyYXN0TW9kZURldGVjdG9yKSB7XG4gICAgaGlnaENvbnRyYXN0TW9kZURldGVjdG9yLl9hcHBseUJvZHlIaWdoQ29udHJhc3RNb2RlQ3NzQ2xhc3NlcygpO1xuICB9XG59XG4iXX0=