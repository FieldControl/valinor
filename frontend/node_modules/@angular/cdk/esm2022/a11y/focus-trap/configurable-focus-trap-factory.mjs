/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, Optional, NgZone } from '@angular/core';
import { InteractivityChecker } from '../interactivity-checker/interactivity-checker';
import { ConfigurableFocusTrap } from './configurable-focus-trap';
import { FOCUS_TRAP_INERT_STRATEGY } from './focus-trap-inert-strategy';
import { EventListenerFocusTrapInertStrategy } from './event-listener-inert-strategy';
import { FocusTrapManager } from './focus-trap-manager';
import * as i0 from "@angular/core";
import * as i1 from "../interactivity-checker/interactivity-checker";
import * as i2 from "./focus-trap-manager";
/** Factory that allows easy instantiation of configurable focus traps. */
export class ConfigurableFocusTrapFactory {
    constructor(_checker, _ngZone, _focusTrapManager, _document, _inertStrategy) {
        this._checker = _checker;
        this._ngZone = _ngZone;
        this._focusTrapManager = _focusTrapManager;
        this._document = _document;
        // TODO split up the strategies into different modules, similar to DateAdapter.
        this._inertStrategy = _inertStrategy || new EventListenerFocusTrapInertStrategy();
    }
    create(element, config = { defer: false }) {
        let configObject;
        if (typeof config === 'boolean') {
            configObject = { defer: config };
        }
        else {
            configObject = config;
        }
        return new ConfigurableFocusTrap(element, this._checker, this._ngZone, this._document, this._focusTrapManager, this._inertStrategy, configObject);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.2.0", ngImport: i0, type: ConfigurableFocusTrapFactory, deps: [{ token: i1.InteractivityChecker }, { token: i0.NgZone }, { token: i2.FocusTrapManager }, { token: DOCUMENT }, { token: FOCUS_TRAP_INERT_STRATEGY, optional: true }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "17.2.0", ngImport: i0, type: ConfigurableFocusTrapFactory, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.2.0", ngImport: i0, type: ConfigurableFocusTrapFactory, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: () => [{ type: i1.InteractivityChecker }, { type: i0.NgZone }, { type: i2.FocusTrapManager }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [DOCUMENT]
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [FOCUS_TRAP_INERT_STRATEGY]
                }] }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlndXJhYmxlLWZvY3VzLXRyYXAtZmFjdG9yeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvYTExeS9mb2N1cy10cmFwL2NvbmZpZ3VyYWJsZS1mb2N1cy10cmFwLWZhY3RvcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQ3pDLE9BQU8sRUFBQyxNQUFNLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDbkUsT0FBTyxFQUFDLG9CQUFvQixFQUFDLE1BQU0sZ0RBQWdELENBQUM7QUFDcEYsT0FBTyxFQUFDLHFCQUFxQixFQUFDLE1BQU0sMkJBQTJCLENBQUM7QUFFaEUsT0FBTyxFQUFDLHlCQUF5QixFQUF5QixNQUFNLDZCQUE2QixDQUFDO0FBQzlGLE9BQU8sRUFBQyxtQ0FBbUMsRUFBQyxNQUFNLGlDQUFpQyxDQUFDO0FBQ3BGLE9BQU8sRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLHNCQUFzQixDQUFDOzs7O0FBRXRELDBFQUEwRTtBQUUxRSxNQUFNLE9BQU8sNEJBQTRCO0lBSXZDLFlBQ1UsUUFBOEIsRUFDOUIsT0FBZSxFQUNmLGlCQUFtQyxFQUN6QixTQUFjLEVBQ2UsY0FBdUM7UUFKOUUsYUFBUSxHQUFSLFFBQVEsQ0FBc0I7UUFDOUIsWUFBTyxHQUFQLE9BQU8sQ0FBUTtRQUNmLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBa0I7UUFJM0MsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7UUFDM0IsK0VBQStFO1FBQy9FLElBQUksQ0FBQyxjQUFjLEdBQUcsY0FBYyxJQUFJLElBQUksbUNBQW1DLEVBQUUsQ0FBQztJQUNwRixDQUFDO0lBZ0JELE1BQU0sQ0FDSixPQUFvQixFQUNwQixTQUFnRCxFQUFDLEtBQUssRUFBRSxLQUFLLEVBQUM7UUFFOUQsSUFBSSxZQUF5QyxDQUFDO1FBQzlDLElBQUksT0FBTyxNQUFNLEtBQUssU0FBUyxFQUFFLENBQUM7WUFDaEMsWUFBWSxHQUFHLEVBQUMsS0FBSyxFQUFFLE1BQU0sRUFBQyxDQUFDO1FBQ2pDLENBQUM7YUFBTSxDQUFDO1lBQ04sWUFBWSxHQUFHLE1BQU0sQ0FBQztRQUN4QixDQUFDO1FBQ0QsT0FBTyxJQUFJLHFCQUFxQixDQUM5QixPQUFPLEVBQ1AsSUFBSSxDQUFDLFFBQVEsRUFDYixJQUFJLENBQUMsT0FBTyxFQUNaLElBQUksQ0FBQyxTQUFTLEVBQ2QsSUFBSSxDQUFDLGlCQUFpQixFQUN0QixJQUFJLENBQUMsY0FBYyxFQUNuQixZQUFZLENBQ2IsQ0FBQztJQUNKLENBQUM7OEdBakRVLDRCQUE0Qiw0R0FRN0IsUUFBUSxhQUNJLHlCQUF5QjtrSEFUcEMsNEJBQTRCLGNBRGhCLE1BQU07OzJGQUNsQiw0QkFBNEI7a0JBRHhDLFVBQVU7bUJBQUMsRUFBQyxVQUFVLEVBQUUsTUFBTSxFQUFDOzswQkFTM0IsTUFBTTsyQkFBQyxRQUFROzswQkFDZixRQUFROzswQkFBSSxNQUFNOzJCQUFDLHlCQUF5QiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0RPQ1VNRU5UfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHtJbmplY3QsIEluamVjdGFibGUsIE9wdGlvbmFsLCBOZ1pvbmV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtJbnRlcmFjdGl2aXR5Q2hlY2tlcn0gZnJvbSAnLi4vaW50ZXJhY3Rpdml0eS1jaGVja2VyL2ludGVyYWN0aXZpdHktY2hlY2tlcic7XG5pbXBvcnQge0NvbmZpZ3VyYWJsZUZvY3VzVHJhcH0gZnJvbSAnLi9jb25maWd1cmFibGUtZm9jdXMtdHJhcCc7XG5pbXBvcnQge0NvbmZpZ3VyYWJsZUZvY3VzVHJhcENvbmZpZ30gZnJvbSAnLi9jb25maWd1cmFibGUtZm9jdXMtdHJhcC1jb25maWcnO1xuaW1wb3J0IHtGT0NVU19UUkFQX0lORVJUX1NUUkFURUdZLCBGb2N1c1RyYXBJbmVydFN0cmF0ZWd5fSBmcm9tICcuL2ZvY3VzLXRyYXAtaW5lcnQtc3RyYXRlZ3knO1xuaW1wb3J0IHtFdmVudExpc3RlbmVyRm9jdXNUcmFwSW5lcnRTdHJhdGVneX0gZnJvbSAnLi9ldmVudC1saXN0ZW5lci1pbmVydC1zdHJhdGVneSc7XG5pbXBvcnQge0ZvY3VzVHJhcE1hbmFnZXJ9IGZyb20gJy4vZm9jdXMtdHJhcC1tYW5hZ2VyJztcblxuLyoqIEZhY3RvcnkgdGhhdCBhbGxvd3MgZWFzeSBpbnN0YW50aWF0aW9uIG9mIGNvbmZpZ3VyYWJsZSBmb2N1cyB0cmFwcy4gKi9cbkBJbmplY3RhYmxlKHtwcm92aWRlZEluOiAncm9vdCd9KVxuZXhwb3J0IGNsYXNzIENvbmZpZ3VyYWJsZUZvY3VzVHJhcEZhY3Rvcnkge1xuICBwcml2YXRlIF9kb2N1bWVudDogRG9jdW1lbnQ7XG4gIHByaXZhdGUgX2luZXJ0U3RyYXRlZ3k6IEZvY3VzVHJhcEluZXJ0U3RyYXRlZ3k7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBfY2hlY2tlcjogSW50ZXJhY3Rpdml0eUNoZWNrZXIsXG4gICAgcHJpdmF0ZSBfbmdab25lOiBOZ1pvbmUsXG4gICAgcHJpdmF0ZSBfZm9jdXNUcmFwTWFuYWdlcjogRm9jdXNUcmFwTWFuYWdlcixcbiAgICBASW5qZWN0KERPQ1VNRU5UKSBfZG9jdW1lbnQ6IGFueSxcbiAgICBAT3B0aW9uYWwoKSBASW5qZWN0KEZPQ1VTX1RSQVBfSU5FUlRfU1RSQVRFR1kpIF9pbmVydFN0cmF0ZWd5PzogRm9jdXNUcmFwSW5lcnRTdHJhdGVneSxcbiAgKSB7XG4gICAgdGhpcy5fZG9jdW1lbnQgPSBfZG9jdW1lbnQ7XG4gICAgLy8gVE9ETyBzcGxpdCB1cCB0aGUgc3RyYXRlZ2llcyBpbnRvIGRpZmZlcmVudCBtb2R1bGVzLCBzaW1pbGFyIHRvIERhdGVBZGFwdGVyLlxuICAgIHRoaXMuX2luZXJ0U3RyYXRlZ3kgPSBfaW5lcnRTdHJhdGVneSB8fCBuZXcgRXZlbnRMaXN0ZW5lckZvY3VzVHJhcEluZXJ0U3RyYXRlZ3koKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgZm9jdXMtdHJhcHBlZCByZWdpb24gYXJvdW5kIHRoZSBnaXZlbiBlbGVtZW50LlxuICAgKiBAcGFyYW0gZWxlbWVudCBUaGUgZWxlbWVudCBhcm91bmQgd2hpY2ggZm9jdXMgd2lsbCBiZSB0cmFwcGVkLlxuICAgKiBAcGFyYW0gY29uZmlnIFRoZSBmb2N1cyB0cmFwIGNvbmZpZ3VyYXRpb24uXG4gICAqIEByZXR1cm5zIFRoZSBjcmVhdGVkIGZvY3VzIHRyYXAgaW5zdGFuY2UuXG4gICAqL1xuICBjcmVhdGUoZWxlbWVudDogSFRNTEVsZW1lbnQsIGNvbmZpZz86IENvbmZpZ3VyYWJsZUZvY3VzVHJhcENvbmZpZyk6IENvbmZpZ3VyYWJsZUZvY3VzVHJhcDtcblxuICAvKipcbiAgICogQGRlcHJlY2F0ZWQgUGFzcyBhIGNvbmZpZyBvYmplY3QgaW5zdGVhZCBvZiB0aGUgYGRlZmVyQ2FwdHVyZUVsZW1lbnRzYCBmbGFnLlxuICAgKiBAYnJlYWtpbmctY2hhbmdlIDExLjAuMFxuICAgKi9cbiAgY3JlYXRlKGVsZW1lbnQ6IEhUTUxFbGVtZW50LCBkZWZlckNhcHR1cmVFbGVtZW50czogYm9vbGVhbik6IENvbmZpZ3VyYWJsZUZvY3VzVHJhcDtcblxuICBjcmVhdGUoXG4gICAgZWxlbWVudDogSFRNTEVsZW1lbnQsXG4gICAgY29uZmlnOiBDb25maWd1cmFibGVGb2N1c1RyYXBDb25maWcgfCBib29sZWFuID0ge2RlZmVyOiBmYWxzZX0sXG4gICk6IENvbmZpZ3VyYWJsZUZvY3VzVHJhcCB7XG4gICAgbGV0IGNvbmZpZ09iamVjdDogQ29uZmlndXJhYmxlRm9jdXNUcmFwQ29uZmlnO1xuICAgIGlmICh0eXBlb2YgY29uZmlnID09PSAnYm9vbGVhbicpIHtcbiAgICAgIGNvbmZpZ09iamVjdCA9IHtkZWZlcjogY29uZmlnfTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uZmlnT2JqZWN0ID0gY29uZmlnO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IENvbmZpZ3VyYWJsZUZvY3VzVHJhcChcbiAgICAgIGVsZW1lbnQsXG4gICAgICB0aGlzLl9jaGVja2VyLFxuICAgICAgdGhpcy5fbmdab25lLFxuICAgICAgdGhpcy5fZG9jdW1lbnQsXG4gICAgICB0aGlzLl9mb2N1c1RyYXBNYW5hZ2VyLFxuICAgICAgdGhpcy5faW5lcnRTdHJhdGVneSxcbiAgICAgIGNvbmZpZ09iamVjdCxcbiAgICApO1xuICB9XG59XG4iXX0=