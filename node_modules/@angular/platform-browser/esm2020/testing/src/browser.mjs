/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { PlatformLocation } from '@angular/common';
import { MockPlatformLocation } from '@angular/common/testing';
import { APP_ID, createPlatformFactory, NgModule, NgZone, PLATFORM_INITIALIZER, platformCore } from '@angular/core';
import { BrowserModule, ɵBrowserDomAdapter as BrowserDomAdapter } from '@angular/platform-browser';
import { BrowserDetection, createNgZone } from './browser_util';
import { ENABLE_MOCK_PLATFORM_LOCATION } from './mock_platform_location_flag';
import * as i0 from "@angular/core";
function initBrowserTests() {
    BrowserDomAdapter.makeCurrent();
    BrowserDetection.setup();
}
const _TEST_BROWSER_PLATFORM_PROVIDERS = [{ provide: PLATFORM_INITIALIZER, useValue: initBrowserTests, multi: true }];
/**
 * Platform for testing
 *
 * @publicApi
 */
export const platformBrowserTesting = createPlatformFactory(platformCore, 'browserTesting', _TEST_BROWSER_PLATFORM_PROVIDERS);
/**
 * NgModule for testing.
 *
 * @publicApi
 */
export class BrowserTestingModule {
}
BrowserTestingModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.0", ngImport: i0, type: BrowserTestingModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
BrowserTestingModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "15.2.0", ngImport: i0, type: BrowserTestingModule, exports: [BrowserModule] });
BrowserTestingModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "15.2.0", ngImport: i0, type: BrowserTestingModule, providers: [
        { provide: APP_ID, useValue: 'a' },
        { provide: NgZone, useFactory: createNgZone },
        (ENABLE_MOCK_PLATFORM_LOCATION ? [{ provide: PlatformLocation, useClass: MockPlatformLocation }] :
            []),
    ], imports: [BrowserModule] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.0", ngImport: i0, type: BrowserTestingModule, decorators: [{
            type: NgModule,
            args: [{
                    exports: [BrowserModule],
                    providers: [
                        { provide: APP_ID, useValue: 'a' },
                        { provide: NgZone, useFactory: createNgZone },
                        (ENABLE_MOCK_PLATFORM_LOCATION ? [{ provide: PlatformLocation, useClass: MockPlatformLocation }] :
                            []),
                    ]
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJvd3Nlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3BsYXRmb3JtLWJyb3dzZXIvdGVzdGluZy9zcmMvYnJvd3Nlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFDSCxPQUFPLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUNqRCxPQUFPLEVBQUMsb0JBQW9CLEVBQUMsTUFBTSx5QkFBeUIsQ0FBQztBQUM3RCxPQUFPLEVBQUMsTUFBTSxFQUFFLHFCQUFxQixFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsb0JBQW9CLEVBQUUsWUFBWSxFQUFpQixNQUFNLGVBQWUsQ0FBQztBQUNsSSxPQUFPLEVBQUMsYUFBYSxFQUFFLGtCQUFrQixJQUFJLGlCQUFpQixFQUFDLE1BQU0sMkJBQTJCLENBQUM7QUFFakcsT0FBTyxFQUFDLGdCQUFnQixFQUFFLFlBQVksRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQzlELE9BQU8sRUFBQyw2QkFBNkIsRUFBQyxNQUFNLCtCQUErQixDQUFDOztBQUU1RSxTQUFTLGdCQUFnQjtJQUN2QixpQkFBaUIsQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUNoQyxnQkFBZ0IsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUMzQixDQUFDO0FBRUQsTUFBTSxnQ0FBZ0MsR0FDbEMsQ0FBQyxFQUFDLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxRQUFRLEVBQUUsZ0JBQWdCLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7QUFFL0U7Ozs7R0FJRztBQUNILE1BQU0sQ0FBQyxNQUFNLHNCQUFzQixHQUMvQixxQkFBcUIsQ0FBQyxZQUFZLEVBQUUsZ0JBQWdCLEVBQUUsZ0NBQWdDLENBQUMsQ0FBQztBQUU1Rjs7OztHQUlHO0FBVUgsTUFBTSxPQUFPLG9CQUFvQjs7NEhBQXBCLG9CQUFvQjs2SEFBcEIsb0JBQW9CLFlBUnJCLGFBQWE7NkhBUVosb0JBQW9CLGFBUHBCO1FBQ1QsRUFBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLEVBQUM7UUFDaEMsRUFBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxZQUFZLEVBQUM7UUFDM0MsQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxRQUFRLEVBQUUsb0JBQW9CLEVBQUMsQ0FBQyxDQUFDLENBQUM7WUFDL0QsRUFBRSxDQUFDO0tBQ3JDLFlBTlMsYUFBYTtzR0FRWixvQkFBb0I7a0JBVGhDLFFBQVE7bUJBQUM7b0JBQ1IsT0FBTyxFQUFFLENBQUMsYUFBYSxDQUFDO29CQUN4QixTQUFTLEVBQUU7d0JBQ1QsRUFBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLEVBQUM7d0JBQ2hDLEVBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsWUFBWSxFQUFDO3dCQUMzQyxDQUFDLDZCQUE2QixDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsT0FBTyxFQUFFLGdCQUFnQixFQUFFLFFBQVEsRUFBRSxvQkFBb0IsRUFBQyxDQUFDLENBQUMsQ0FBQzs0QkFDL0QsRUFBRSxDQUFDO3FCQUNyQztpQkFDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtQbGF0Zm9ybUxvY2F0aW9ufSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHtNb2NrUGxhdGZvcm1Mb2NhdGlvbn0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uL3Rlc3RpbmcnO1xuaW1wb3J0IHtBUFBfSUQsIGNyZWF0ZVBsYXRmb3JtRmFjdG9yeSwgTmdNb2R1bGUsIE5nWm9uZSwgUExBVEZPUk1fSU5JVElBTElaRVIsIHBsYXRmb3JtQ29yZSwgU3RhdGljUHJvdmlkZXJ9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtCcm93c2VyTW9kdWxlLCDJtUJyb3dzZXJEb21BZGFwdGVyIGFzIEJyb3dzZXJEb21BZGFwdGVyfSBmcm9tICdAYW5ndWxhci9wbGF0Zm9ybS1icm93c2VyJztcblxuaW1wb3J0IHtCcm93c2VyRGV0ZWN0aW9uLCBjcmVhdGVOZ1pvbmV9IGZyb20gJy4vYnJvd3Nlcl91dGlsJztcbmltcG9ydCB7RU5BQkxFX01PQ0tfUExBVEZPUk1fTE9DQVRJT059IGZyb20gJy4vbW9ja19wbGF0Zm9ybV9sb2NhdGlvbl9mbGFnJztcblxuZnVuY3Rpb24gaW5pdEJyb3dzZXJUZXN0cygpIHtcbiAgQnJvd3NlckRvbUFkYXB0ZXIubWFrZUN1cnJlbnQoKTtcbiAgQnJvd3NlckRldGVjdGlvbi5zZXR1cCgpO1xufVxuXG5jb25zdCBfVEVTVF9CUk9XU0VSX1BMQVRGT1JNX1BST1ZJREVSUzogU3RhdGljUHJvdmlkZXJbXSA9XG4gICAgW3twcm92aWRlOiBQTEFURk9STV9JTklUSUFMSVpFUiwgdXNlVmFsdWU6IGluaXRCcm93c2VyVGVzdHMsIG11bHRpOiB0cnVlfV07XG5cbi8qKlxuICogUGxhdGZvcm0gZm9yIHRlc3RpbmdcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjb25zdCBwbGF0Zm9ybUJyb3dzZXJUZXN0aW5nID1cbiAgICBjcmVhdGVQbGF0Zm9ybUZhY3RvcnkocGxhdGZvcm1Db3JlLCAnYnJvd3NlclRlc3RpbmcnLCBfVEVTVF9CUk9XU0VSX1BMQVRGT1JNX1BST1ZJREVSUyk7XG5cbi8qKlxuICogTmdNb2R1bGUgZm9yIHRlc3RpbmcuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5ATmdNb2R1bGUoe1xuICBleHBvcnRzOiBbQnJvd3Nlck1vZHVsZV0sXG4gIHByb3ZpZGVyczogW1xuICAgIHtwcm92aWRlOiBBUFBfSUQsIHVzZVZhbHVlOiAnYSd9LFxuICAgIHtwcm92aWRlOiBOZ1pvbmUsIHVzZUZhY3Rvcnk6IGNyZWF0ZU5nWm9uZX0sXG4gICAgKEVOQUJMRV9NT0NLX1BMQVRGT1JNX0xPQ0FUSU9OID8gW3twcm92aWRlOiBQbGF0Zm9ybUxvY2F0aW9uLCB1c2VDbGFzczogTW9ja1BsYXRmb3JtTG9jYXRpb259XSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW10pLFxuICBdXG59KVxuZXhwb3J0IGNsYXNzIEJyb3dzZXJUZXN0aW5nTW9kdWxlIHtcbn1cbiJdfQ==