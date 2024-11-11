/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { APP_BASE_HREF, CommonModule, HashLocationStrategy, Location, LocationStrategy, PathLocationStrategy, PlatformLocation, } from '@angular/common';
import { Inject, InjectionToken, NgModule, Optional } from '@angular/core';
import { UpgradeModule } from '@angular/upgrade/static';
import { $locationShim, $locationShimProvider } from './location_shim';
import { AngularJSUrlCodec, UrlCodec } from './params';
import * as i0 from "@angular/core";
/**
 * A provider token used to configure the location upgrade module.
 *
 * @publicApi
 */
export const LOCATION_UPGRADE_CONFIGURATION = new InjectionToken(ngDevMode ? 'LOCATION_UPGRADE_CONFIGURATION' : '');
const APP_BASE_HREF_RESOLVED = new InjectionToken(ngDevMode ? 'APP_BASE_HREF_RESOLVED' : '');
/**
 * `NgModule` used for providing and configuring Angular's Unified Location Service for upgrading.
 *
 * @see [Using the Unified Angular Location Service](https://angular.io/guide/upgrade#using-the-unified-angular-location-service)
 *
 * @publicApi
 */
export class LocationUpgradeModule {
    static config(config) {
        return {
            ngModule: LocationUpgradeModule,
            providers: [
                Location,
                {
                    provide: $locationShim,
                    useFactory: provide$location,
                    deps: [UpgradeModule, Location, PlatformLocation, UrlCodec, LocationStrategy],
                },
                { provide: LOCATION_UPGRADE_CONFIGURATION, useValue: config ? config : {} },
                { provide: UrlCodec, useFactory: provideUrlCodec, deps: [LOCATION_UPGRADE_CONFIGURATION] },
                {
                    provide: APP_BASE_HREF_RESOLVED,
                    useFactory: provideAppBaseHref,
                    deps: [LOCATION_UPGRADE_CONFIGURATION, [new Inject(APP_BASE_HREF), new Optional()]],
                },
                {
                    provide: LocationStrategy,
                    useFactory: provideLocationStrategy,
                    deps: [PlatformLocation, APP_BASE_HREF_RESOLVED, LOCATION_UPGRADE_CONFIGURATION],
                },
            ],
        };
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: LocationUpgradeModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.2.7", ngImport: i0, type: LocationUpgradeModule, imports: [CommonModule] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: LocationUpgradeModule, imports: [CommonModule] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: LocationUpgradeModule, decorators: [{
            type: NgModule,
            args: [{ imports: [CommonModule] }]
        }] });
export function provideAppBaseHref(config, appBaseHref) {
    if (config && config.appBaseHref != null) {
        return config.appBaseHref;
    }
    else if (appBaseHref != null) {
        return appBaseHref;
    }
    return '';
}
export function provideUrlCodec(config) {
    const codec = (config && config.urlCodec) || AngularJSUrlCodec;
    return new codec();
}
export function provideLocationStrategy(platformLocation, baseHref, options = {}) {
    return options.useHash
        ? new HashLocationStrategy(platformLocation, baseHref)
        : new PathLocationStrategy(platformLocation, baseHref);
}
export function provide$location(ngUpgrade, location, platformLocation, urlCodec, locationStrategy) {
    const $locationProvider = new $locationShimProvider(ngUpgrade, location, platformLocation, urlCodec, locationStrategy);
    return $locationProvider.$get();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYXRpb25fdXBncmFkZV9tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vdXBncmFkZS9zcmMvbG9jYXRpb25fdXBncmFkZV9tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUNMLGFBQWEsRUFDYixZQUFZLEVBQ1osb0JBQW9CLEVBQ3BCLFFBQVEsRUFDUixnQkFBZ0IsRUFDaEIsb0JBQW9CLEVBQ3BCLGdCQUFnQixHQUNqQixNQUFNLGlCQUFpQixDQUFDO0FBQ3pCLE9BQU8sRUFBQyxNQUFNLEVBQUUsY0FBYyxFQUF1QixRQUFRLEVBQUUsUUFBUSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQzlGLE9BQU8sRUFBQyxhQUFhLEVBQUMsTUFBTSx5QkFBeUIsQ0FBQztBQUV0RCxPQUFPLEVBQUMsYUFBYSxFQUFFLHFCQUFxQixFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDckUsT0FBTyxFQUFDLGlCQUFpQixFQUFFLFFBQVEsRUFBQyxNQUFNLFVBQVUsQ0FBQzs7QUErQnJEOzs7O0dBSUc7QUFDSCxNQUFNLENBQUMsTUFBTSw4QkFBOEIsR0FBRyxJQUFJLGNBQWMsQ0FDOUQsU0FBUyxDQUFDLENBQUMsQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUNsRCxDQUFDO0FBRUYsTUFBTSxzQkFBc0IsR0FBRyxJQUFJLGNBQWMsQ0FDL0MsU0FBUyxDQUFDLENBQUMsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUMxQyxDQUFDO0FBRUY7Ozs7OztHQU1HO0FBRUgsTUFBTSxPQUFPLHFCQUFxQjtJQUNoQyxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQThCO1FBQzFDLE9BQU87WUFDTCxRQUFRLEVBQUUscUJBQXFCO1lBQy9CLFNBQVMsRUFBRTtnQkFDVCxRQUFRO2dCQUNSO29CQUNFLE9BQU8sRUFBRSxhQUFhO29CQUN0QixVQUFVLEVBQUUsZ0JBQWdCO29CQUM1QixJQUFJLEVBQUUsQ0FBQyxhQUFhLEVBQUUsUUFBUSxFQUFFLGdCQUFnQixFQUFFLFFBQVEsRUFBRSxnQkFBZ0IsQ0FBQztpQkFDOUU7Z0JBQ0QsRUFBQyxPQUFPLEVBQUUsOEJBQThCLEVBQUUsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUM7Z0JBQ3pFLEVBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsZUFBZSxFQUFFLElBQUksRUFBRSxDQUFDLDhCQUE4QixDQUFDLEVBQUM7Z0JBQ3hGO29CQUNFLE9BQU8sRUFBRSxzQkFBc0I7b0JBQy9CLFVBQVUsRUFBRSxrQkFBa0I7b0JBQzlCLElBQUksRUFBRSxDQUFDLDhCQUE4QixFQUFFLENBQUMsSUFBSSxNQUFNLENBQUMsYUFBYSxDQUFDLEVBQUUsSUFBSSxRQUFRLEVBQUUsQ0FBQyxDQUFDO2lCQUNwRjtnQkFDRDtvQkFDRSxPQUFPLEVBQUUsZ0JBQWdCO29CQUN6QixVQUFVLEVBQUUsdUJBQXVCO29CQUNuQyxJQUFJLEVBQUUsQ0FBQyxnQkFBZ0IsRUFBRSxzQkFBc0IsRUFBRSw4QkFBOEIsQ0FBQztpQkFDakY7YUFDRjtTQUNGLENBQUM7SUFDSixDQUFDO3lIQXpCVSxxQkFBcUI7MEhBQXJCLHFCQUFxQixZQURiLFlBQVk7MEhBQ3BCLHFCQUFxQixZQURiLFlBQVk7O3NHQUNwQixxQkFBcUI7a0JBRGpDLFFBQVE7bUJBQUMsRUFBQyxPQUFPLEVBQUUsQ0FBQyxZQUFZLENBQUMsRUFBQzs7QUE2Qm5DLE1BQU0sVUFBVSxrQkFBa0IsQ0FBQyxNQUE2QixFQUFFLFdBQW9CO0lBQ3BGLElBQUksTUFBTSxJQUFJLE1BQU0sQ0FBQyxXQUFXLElBQUksSUFBSSxFQUFFLENBQUM7UUFDekMsT0FBTyxNQUFNLENBQUMsV0FBVyxDQUFDO0lBQzVCLENBQUM7U0FBTSxJQUFJLFdBQVcsSUFBSSxJQUFJLEVBQUUsQ0FBQztRQUMvQixPQUFPLFdBQVcsQ0FBQztJQUNyQixDQUFDO0lBQ0QsT0FBTyxFQUFFLENBQUM7QUFDWixDQUFDO0FBRUQsTUFBTSxVQUFVLGVBQWUsQ0FBQyxNQUE2QjtJQUMzRCxNQUFNLEtBQUssR0FBRyxDQUFDLE1BQU0sSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksaUJBQWlCLENBQUM7SUFDL0QsT0FBTyxJQUFLLEtBQWEsRUFBRSxDQUFDO0FBQzlCLENBQUM7QUFFRCxNQUFNLFVBQVUsdUJBQXVCLENBQ3JDLGdCQUFrQyxFQUNsQyxRQUFnQixFQUNoQixVQUFpQyxFQUFFO0lBRW5DLE9BQU8sT0FBTyxDQUFDLE9BQU87UUFDcEIsQ0FBQyxDQUFDLElBQUksb0JBQW9CLENBQUMsZ0JBQWdCLEVBQUUsUUFBUSxDQUFDO1FBQ3RELENBQUMsQ0FBQyxJQUFJLG9CQUFvQixDQUFDLGdCQUFnQixFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQzNELENBQUM7QUFFRCxNQUFNLFVBQVUsZ0JBQWdCLENBQzlCLFNBQXdCLEVBQ3hCLFFBQWtCLEVBQ2xCLGdCQUFrQyxFQUNsQyxRQUFrQixFQUNsQixnQkFBa0M7SUFFbEMsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLHFCQUFxQixDQUNqRCxTQUFTLEVBQ1QsUUFBUSxFQUNSLGdCQUFnQixFQUNoQixRQUFRLEVBQ1IsZ0JBQWdCLENBQ2pCLENBQUM7SUFFRixPQUFPLGlCQUFpQixDQUFDLElBQUksRUFBRSxDQUFDO0FBQ2xDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbmltcG9ydCB7XG4gIEFQUF9CQVNFX0hSRUYsXG4gIENvbW1vbk1vZHVsZSxcbiAgSGFzaExvY2F0aW9uU3RyYXRlZ3ksXG4gIExvY2F0aW9uLFxuICBMb2NhdGlvblN0cmF0ZWd5LFxuICBQYXRoTG9jYXRpb25TdHJhdGVneSxcbiAgUGxhdGZvcm1Mb2NhdGlvbixcbn0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7SW5qZWN0LCBJbmplY3Rpb25Ub2tlbiwgTW9kdWxlV2l0aFByb3ZpZGVycywgTmdNb2R1bGUsIE9wdGlvbmFsfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7VXBncmFkZU1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvdXBncmFkZS9zdGF0aWMnO1xuXG5pbXBvcnQgeyRsb2NhdGlvblNoaW0sICRsb2NhdGlvblNoaW1Qcm92aWRlcn0gZnJvbSAnLi9sb2NhdGlvbl9zaGltJztcbmltcG9ydCB7QW5ndWxhckpTVXJsQ29kZWMsIFVybENvZGVjfSBmcm9tICcuL3BhcmFtcyc7XG5cbi8qKlxuICogQ29uZmlndXJhdGlvbiBvcHRpb25zIGZvciBMb2NhdGlvblVwZ3JhZGUuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgaW50ZXJmYWNlIExvY2F0aW9uVXBncmFkZUNvbmZpZyB7XG4gIC8qKlxuICAgKiBDb25maWd1cmVzIHdoZXRoZXIgdGhlIGxvY2F0aW9uIHVwZ3JhZGUgbW9kdWxlIHNob3VsZCB1c2UgdGhlIGBIYXNoTG9jYXRpb25TdHJhdGVneWBcbiAgICogb3IgdGhlIGBQYXRoTG9jYXRpb25TdHJhdGVneWBcbiAgICovXG4gIHVzZUhhc2g/OiBib29sZWFuO1xuICAvKipcbiAgICogQ29uZmlndXJlcyB0aGUgaGFzaCBwcmVmaXggdXNlZCBpbiB0aGUgVVJMIHdoZW4gdXNpbmcgdGhlIGBIYXNoTG9jYXRpb25TdHJhdGVneWBcbiAgICovXG4gIGhhc2hQcmVmaXg/OiBzdHJpbmc7XG4gIC8qKlxuICAgKiBDb25maWd1cmVzIHRoZSBVUkwgY29kZWMgZm9yIGVuY29kaW5nIGFuZCBkZWNvZGluZyBVUkxzLiBEZWZhdWx0IGlzIHRoZSBgQW5ndWxhckpTQ29kZWNgXG4gICAqL1xuICB1cmxDb2RlYz86IHR5cGVvZiBVcmxDb2RlYztcbiAgLyoqXG4gICAqIENvbmZpZ3VyZXMgdGhlIGJhc2UgaHJlZiB3aGVuIHVzZWQgaW4gc2VydmVyLXNpZGUgcmVuZGVyZWQgYXBwbGljYXRpb25zXG4gICAqL1xuICBzZXJ2ZXJCYXNlSHJlZj86IHN0cmluZztcbiAgLyoqXG4gICAqIENvbmZpZ3VyZXMgdGhlIGJhc2UgaHJlZiB3aGVuIHVzZWQgaW4gY2xpZW50LXNpZGUgcmVuZGVyZWQgYXBwbGljYXRpb25zXG4gICAqL1xuICBhcHBCYXNlSHJlZj86IHN0cmluZztcbn1cblxuLyoqXG4gKiBBIHByb3ZpZGVyIHRva2VuIHVzZWQgdG8gY29uZmlndXJlIHRoZSBsb2NhdGlvbiB1cGdyYWRlIG1vZHVsZS5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjb25zdCBMT0NBVElPTl9VUEdSQURFX0NPTkZJR1VSQVRJT04gPSBuZXcgSW5qZWN0aW9uVG9rZW48TG9jYXRpb25VcGdyYWRlQ29uZmlnPihcbiAgbmdEZXZNb2RlID8gJ0xPQ0FUSU9OX1VQR1JBREVfQ09ORklHVVJBVElPTicgOiAnJyxcbik7XG5cbmNvbnN0IEFQUF9CQVNFX0hSRUZfUkVTT0xWRUQgPSBuZXcgSW5qZWN0aW9uVG9rZW48c3RyaW5nPihcbiAgbmdEZXZNb2RlID8gJ0FQUF9CQVNFX0hSRUZfUkVTT0xWRUQnIDogJycsXG4pO1xuXG4vKipcbiAqIGBOZ01vZHVsZWAgdXNlZCBmb3IgcHJvdmlkaW5nIGFuZCBjb25maWd1cmluZyBBbmd1bGFyJ3MgVW5pZmllZCBMb2NhdGlvbiBTZXJ2aWNlIGZvciB1cGdyYWRpbmcuXG4gKlxuICogQHNlZSBbVXNpbmcgdGhlIFVuaWZpZWQgQW5ndWxhciBMb2NhdGlvbiBTZXJ2aWNlXShodHRwczovL2FuZ3VsYXIuaW8vZ3VpZGUvdXBncmFkZSN1c2luZy10aGUtdW5pZmllZC1hbmd1bGFyLWxvY2F0aW9uLXNlcnZpY2UpXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5ATmdNb2R1bGUoe2ltcG9ydHM6IFtDb21tb25Nb2R1bGVdfSlcbmV4cG9ydCBjbGFzcyBMb2NhdGlvblVwZ3JhZGVNb2R1bGUge1xuICBzdGF0aWMgY29uZmlnKGNvbmZpZz86IExvY2F0aW9uVXBncmFkZUNvbmZpZyk6IE1vZHVsZVdpdGhQcm92aWRlcnM8TG9jYXRpb25VcGdyYWRlTW9kdWxlPiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5nTW9kdWxlOiBMb2NhdGlvblVwZ3JhZGVNb2R1bGUsXG4gICAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgTG9jYXRpb24sXG4gICAgICAgIHtcbiAgICAgICAgICBwcm92aWRlOiAkbG9jYXRpb25TaGltLFxuICAgICAgICAgIHVzZUZhY3Rvcnk6IHByb3ZpZGUkbG9jYXRpb24sXG4gICAgICAgICAgZGVwczogW1VwZ3JhZGVNb2R1bGUsIExvY2F0aW9uLCBQbGF0Zm9ybUxvY2F0aW9uLCBVcmxDb2RlYywgTG9jYXRpb25TdHJhdGVneV0sXG4gICAgICAgIH0sXG4gICAgICAgIHtwcm92aWRlOiBMT0NBVElPTl9VUEdSQURFX0NPTkZJR1VSQVRJT04sIHVzZVZhbHVlOiBjb25maWcgPyBjb25maWcgOiB7fX0sXG4gICAgICAgIHtwcm92aWRlOiBVcmxDb2RlYywgdXNlRmFjdG9yeTogcHJvdmlkZVVybENvZGVjLCBkZXBzOiBbTE9DQVRJT05fVVBHUkFERV9DT05GSUdVUkFUSU9OXX0sXG4gICAgICAgIHtcbiAgICAgICAgICBwcm92aWRlOiBBUFBfQkFTRV9IUkVGX1JFU09MVkVELFxuICAgICAgICAgIHVzZUZhY3Rvcnk6IHByb3ZpZGVBcHBCYXNlSHJlZixcbiAgICAgICAgICBkZXBzOiBbTE9DQVRJT05fVVBHUkFERV9DT05GSUdVUkFUSU9OLCBbbmV3IEluamVjdChBUFBfQkFTRV9IUkVGKSwgbmV3IE9wdGlvbmFsKCldXSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHByb3ZpZGU6IExvY2F0aW9uU3RyYXRlZ3ksXG4gICAgICAgICAgdXNlRmFjdG9yeTogcHJvdmlkZUxvY2F0aW9uU3RyYXRlZ3ksXG4gICAgICAgICAgZGVwczogW1BsYXRmb3JtTG9jYXRpb24sIEFQUF9CQVNFX0hSRUZfUkVTT0xWRUQsIExPQ0FUSU9OX1VQR1JBREVfQ09ORklHVVJBVElPTl0sXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH07XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHByb3ZpZGVBcHBCYXNlSHJlZihjb25maWc6IExvY2F0aW9uVXBncmFkZUNvbmZpZywgYXBwQmFzZUhyZWY/OiBzdHJpbmcpIHtcbiAgaWYgKGNvbmZpZyAmJiBjb25maWcuYXBwQmFzZUhyZWYgIT0gbnVsbCkge1xuICAgIHJldHVybiBjb25maWcuYXBwQmFzZUhyZWY7XG4gIH0gZWxzZSBpZiAoYXBwQmFzZUhyZWYgIT0gbnVsbCkge1xuICAgIHJldHVybiBhcHBCYXNlSHJlZjtcbiAgfVxuICByZXR1cm4gJyc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwcm92aWRlVXJsQ29kZWMoY29uZmlnOiBMb2NhdGlvblVwZ3JhZGVDb25maWcpIHtcbiAgY29uc3QgY29kZWMgPSAoY29uZmlnICYmIGNvbmZpZy51cmxDb2RlYykgfHwgQW5ndWxhckpTVXJsQ29kZWM7XG4gIHJldHVybiBuZXcgKGNvZGVjIGFzIGFueSkoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHByb3ZpZGVMb2NhdGlvblN0cmF0ZWd5KFxuICBwbGF0Zm9ybUxvY2F0aW9uOiBQbGF0Zm9ybUxvY2F0aW9uLFxuICBiYXNlSHJlZjogc3RyaW5nLFxuICBvcHRpb25zOiBMb2NhdGlvblVwZ3JhZGVDb25maWcgPSB7fSxcbikge1xuICByZXR1cm4gb3B0aW9ucy51c2VIYXNoXG4gICAgPyBuZXcgSGFzaExvY2F0aW9uU3RyYXRlZ3kocGxhdGZvcm1Mb2NhdGlvbiwgYmFzZUhyZWYpXG4gICAgOiBuZXcgUGF0aExvY2F0aW9uU3RyYXRlZ3kocGxhdGZvcm1Mb2NhdGlvbiwgYmFzZUhyZWYpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcHJvdmlkZSRsb2NhdGlvbihcbiAgbmdVcGdyYWRlOiBVcGdyYWRlTW9kdWxlLFxuICBsb2NhdGlvbjogTG9jYXRpb24sXG4gIHBsYXRmb3JtTG9jYXRpb246IFBsYXRmb3JtTG9jYXRpb24sXG4gIHVybENvZGVjOiBVcmxDb2RlYyxcbiAgbG9jYXRpb25TdHJhdGVneTogTG9jYXRpb25TdHJhdGVneSxcbikge1xuICBjb25zdCAkbG9jYXRpb25Qcm92aWRlciA9IG5ldyAkbG9jYXRpb25TaGltUHJvdmlkZXIoXG4gICAgbmdVcGdyYWRlLFxuICAgIGxvY2F0aW9uLFxuICAgIHBsYXRmb3JtTG9jYXRpb24sXG4gICAgdXJsQ29kZWMsXG4gICAgbG9jYXRpb25TdHJhdGVneSxcbiAgKTtcblxuICByZXR1cm4gJGxvY2F0aW9uUHJvdmlkZXIuJGdldCgpO1xufVxuIl19