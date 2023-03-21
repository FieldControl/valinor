import { NgModule, Optional, NgZone, InjectionToken, APP_INITIALIZER, Injector } from '@angular/core';
import { ɵgetDefaultInstanceOf, ɵAngularFireSchedulers, VERSION, ɵisAnalyticsSupportedFactory } from '@angular/fire';
import { Analytics, ANALYTICS_PROVIDER_NAME, AnalyticsInstances } from './analytics';
import { FirebaseApps, FirebaseApp } from '@angular/fire/app';
import { registerVersion } from 'firebase/app';
import { ScreenTrackingService } from './screen-tracking.service';
import { UserTrackingService } from './user-tracking.service';
import * as i0 from "@angular/core";
import * as i1 from "./screen-tracking.service";
import * as i2 from "./user-tracking.service";
export const PROVIDED_ANALYTICS_INSTANCES = new InjectionToken('angularfire2.analytics-instances');
export function defaultAnalyticsInstanceFactory(provided, defaultApp) {
    if (!ɵisAnalyticsSupportedFactory.sync()) {
        return null;
    }
    const defaultAnalytics = ɵgetDefaultInstanceOf(ANALYTICS_PROVIDER_NAME, provided, defaultApp);
    return defaultAnalytics && new Analytics(defaultAnalytics);
}
export function analyticsInstanceFactory(fn) {
    return (zone, injector) => {
        if (!ɵisAnalyticsSupportedFactory.sync()) {
            return null;
        }
        const analytics = zone.runOutsideAngular(() => fn(injector));
        return new Analytics(analytics);
    };
}
const ANALYTICS_INSTANCES_PROVIDER = {
    provide: AnalyticsInstances,
    deps: [
        [new Optional(), PROVIDED_ANALYTICS_INSTANCES],
    ]
};
const DEFAULT_ANALYTICS_INSTANCE_PROVIDER = {
    provide: Analytics,
    useFactory: defaultAnalyticsInstanceFactory,
    deps: [
        [new Optional(), PROVIDED_ANALYTICS_INSTANCES],
        FirebaseApp,
    ]
};
export class AnalyticsModule {
    constructor(_screenTrackingService, _userTrackingService) {
        registerVersion('angularfire', VERSION.full, 'analytics');
    }
}
AnalyticsModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: AnalyticsModule, deps: [{ token: i1.ScreenTrackingService, optional: true }, { token: i2.UserTrackingService, optional: true }], target: i0.ɵɵFactoryTarget.NgModule });
AnalyticsModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: AnalyticsModule });
AnalyticsModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: AnalyticsModule, providers: [
        DEFAULT_ANALYTICS_INSTANCE_PROVIDER,
        ANALYTICS_INSTANCES_PROVIDER,
        {
            provide: APP_INITIALIZER,
            useValue: ɵisAnalyticsSupportedFactory.async,
            multi: true,
        }
    ] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: AnalyticsModule, decorators: [{
            type: NgModule,
            args: [{
                    providers: [
                        DEFAULT_ANALYTICS_INSTANCE_PROVIDER,
                        ANALYTICS_INSTANCES_PROVIDER,
                        {
                            provide: APP_INITIALIZER,
                            useValue: ɵisAnalyticsSupportedFactory.async,
                            multi: true,
                        }
                    ]
                }]
        }], ctorParameters: function () { return [{ type: i1.ScreenTrackingService, decorators: [{
                    type: Optional
                }] }, { type: i2.UserTrackingService, decorators: [{
                    type: Optional
                }] }]; } });
export function provideAnalytics(fn, ...deps) {
    return {
        ngModule: AnalyticsModule,
        providers: [{
                provide: PROVIDED_ANALYTICS_INSTANCES,
                useFactory: analyticsInstanceFactory(fn),
                multi: true,
                deps: [
                    NgZone,
                    Injector,
                    ɵAngularFireSchedulers,
                    FirebaseApps,
                    ...deps,
                ]
            }]
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5hbHl0aWNzLm1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9hbmFseXRpY3MvYW5hbHl0aWNzLm1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsY0FBYyxFQUF1QixlQUFlLEVBQUUsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRTNILE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxzQkFBc0IsRUFBRSxPQUFPLEVBQUUsNEJBQTRCLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDckgsT0FBTyxFQUFFLFNBQVMsRUFBRSx1QkFBdUIsRUFBRSxrQkFBa0IsRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUNyRixPQUFPLEVBQUUsWUFBWSxFQUFFLFdBQVcsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQzlELE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFDL0MsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDbEUsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0seUJBQXlCLENBQUM7Ozs7QUFFOUQsTUFBTSxDQUFDLE1BQU0sNEJBQTRCLEdBQUcsSUFBSSxjQUFjLENBQWMsa0NBQWtDLENBQUMsQ0FBQztBQUVoSCxNQUFNLFVBQVUsK0JBQStCLENBQUMsUUFBdUMsRUFBRSxVQUF1QjtJQUM5RyxJQUFJLENBQUMsNEJBQTRCLENBQUMsSUFBSSxFQUFFLEVBQUU7UUFBRSxPQUFPLElBQUksQ0FBQztLQUFFO0lBQzFELE1BQU0sZ0JBQWdCLEdBQUcscUJBQXFCLENBQW9CLHVCQUF1QixFQUFFLFFBQVEsRUFBRSxVQUFVLENBQUMsQ0FBQztJQUNqSCxPQUFPLGdCQUFnQixJQUFJLElBQUksU0FBUyxDQUFDLGdCQUFnQixDQUFDLENBQUM7QUFDN0QsQ0FBQztBQUVELE1BQU0sVUFBVSx3QkFBd0IsQ0FBQyxFQUE2QztJQUNwRixPQUFPLENBQUMsSUFBWSxFQUFFLFFBQWtCLEVBQUUsRUFBRTtRQUMxQyxJQUFJLENBQUMsNEJBQTRCLENBQUMsSUFBSSxFQUFFLEVBQUU7WUFBRSxPQUFPLElBQUksQ0FBQztTQUFFO1FBQzFELE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUM3RCxPQUFPLElBQUksU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ2xDLENBQUMsQ0FBQztBQUNKLENBQUM7QUFFRCxNQUFNLDRCQUE0QixHQUFHO0lBQ25DLE9BQU8sRUFBRSxrQkFBa0I7SUFDM0IsSUFBSSxFQUFFO1FBQ0osQ0FBQyxJQUFJLFFBQVEsRUFBRSxFQUFFLDRCQUE0QixDQUFFO0tBQ2hEO0NBQ0YsQ0FBQztBQUVGLE1BQU0sbUNBQW1DLEdBQUc7SUFDMUMsT0FBTyxFQUFFLFNBQVM7SUFDbEIsVUFBVSxFQUFFLCtCQUErQjtJQUMzQyxJQUFJLEVBQUU7UUFDSixDQUFDLElBQUksUUFBUSxFQUFFLEVBQUUsNEJBQTRCLENBQUU7UUFDL0MsV0FBVztLQUNaO0NBQ0YsQ0FBQztBQWFGLE1BQU0sT0FBTyxlQUFlO0lBQzFCLFlBQ2Msc0JBQTZDLEVBQzdDLG9CQUF5QztRQUVyRCxlQUFlLENBQUMsYUFBYSxFQUFFLE9BQU8sQ0FBQyxJQUFJLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFDNUQsQ0FBQzs7NEdBTlUsZUFBZTs2R0FBZixlQUFlOzZHQUFmLGVBQWUsYUFWZjtRQUNULG1DQUFtQztRQUNuQyw0QkFBNEI7UUFDNUI7WUFDRSxPQUFPLEVBQUUsZUFBZTtZQUN4QixRQUFRLEVBQUUsNEJBQTRCLENBQUMsS0FBSztZQUM1QyxLQUFLLEVBQUUsSUFBSTtTQUNaO0tBQ0Y7MkZBRVUsZUFBZTtrQkFYM0IsUUFBUTttQkFBQztvQkFDUixTQUFTLEVBQUU7d0JBQ1QsbUNBQW1DO3dCQUNuQyw0QkFBNEI7d0JBQzVCOzRCQUNFLE9BQU8sRUFBRSxlQUFlOzRCQUN4QixRQUFRLEVBQUUsNEJBQTRCLENBQUMsS0FBSzs0QkFDNUMsS0FBSyxFQUFFLElBQUk7eUJBQ1o7cUJBQ0Y7aUJBQ0Y7OzBCQUdJLFFBQVE7OzBCQUNSLFFBQVE7O0FBTWIsTUFBTSxVQUFVLGdCQUFnQixDQUFDLEVBQTZDLEVBQUUsR0FBRyxJQUFXO0lBQzVGLE9BQU87UUFDTCxRQUFRLEVBQUUsZUFBZTtRQUN6QixTQUFTLEVBQUUsQ0FBQztnQkFDVixPQUFPLEVBQUUsNEJBQTRCO2dCQUNyQyxVQUFVLEVBQUUsd0JBQXdCLENBQUMsRUFBRSxDQUFDO2dCQUN4QyxLQUFLLEVBQUUsSUFBSTtnQkFDWCxJQUFJLEVBQUU7b0JBQ0osTUFBTTtvQkFDTixRQUFRO29CQUNSLHNCQUFzQjtvQkFDdEIsWUFBWTtvQkFDWixHQUFHLElBQUk7aUJBQ1I7YUFDRixDQUFDO0tBQ0gsQ0FBQztBQUNKLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOZ01vZHVsZSwgT3B0aW9uYWwsIE5nWm9uZSwgSW5qZWN0aW9uVG9rZW4sIE1vZHVsZVdpdGhQcm92aWRlcnMsIEFQUF9JTklUSUFMSVpFUiwgSW5qZWN0b3IgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEFuYWx5dGljcyBhcyBGaXJlYmFzZUFuYWx5dGljcyB9IGZyb20gJ2ZpcmViYXNlL2FuYWx5dGljcyc7XG5pbXBvcnQgeyDJtWdldERlZmF1bHRJbnN0YW5jZU9mLCDJtUFuZ3VsYXJGaXJlU2NoZWR1bGVycywgVkVSU0lPTiwgybVpc0FuYWx5dGljc1N1cHBvcnRlZEZhY3RvcnkgfSBmcm9tICdAYW5ndWxhci9maXJlJztcbmltcG9ydCB7IEFuYWx5dGljcywgQU5BTFlUSUNTX1BST1ZJREVSX05BTUUsIEFuYWx5dGljc0luc3RhbmNlcyB9IGZyb20gJy4vYW5hbHl0aWNzJztcbmltcG9ydCB7IEZpcmViYXNlQXBwcywgRmlyZWJhc2VBcHAgfSBmcm9tICdAYW5ndWxhci9maXJlL2FwcCc7XG5pbXBvcnQgeyByZWdpc3RlclZlcnNpb24gfSBmcm9tICdmaXJlYmFzZS9hcHAnO1xuaW1wb3J0IHsgU2NyZWVuVHJhY2tpbmdTZXJ2aWNlIH0gZnJvbSAnLi9zY3JlZW4tdHJhY2tpbmcuc2VydmljZSc7XG5pbXBvcnQgeyBVc2VyVHJhY2tpbmdTZXJ2aWNlIH0gZnJvbSAnLi91c2VyLXRyYWNraW5nLnNlcnZpY2UnO1xuXG5leHBvcnQgY29uc3QgUFJPVklERURfQU5BTFlUSUNTX0lOU1RBTkNFUyA9IG5ldyBJbmplY3Rpb25Ub2tlbjxBbmFseXRpY3NbXT4oJ2FuZ3VsYXJmaXJlMi5hbmFseXRpY3MtaW5zdGFuY2VzJyk7XG5cbmV4cG9ydCBmdW5jdGlvbiBkZWZhdWx0QW5hbHl0aWNzSW5zdGFuY2VGYWN0b3J5KHByb3ZpZGVkOiBGaXJlYmFzZUFuYWx5dGljc1tdfHVuZGVmaW5lZCwgZGVmYXVsdEFwcDogRmlyZWJhc2VBcHApIHtcbiAgaWYgKCHJtWlzQW5hbHl0aWNzU3VwcG9ydGVkRmFjdG9yeS5zeW5jKCkpIHsgcmV0dXJuIG51bGw7IH1cbiAgY29uc3QgZGVmYXVsdEFuYWx5dGljcyA9IMm1Z2V0RGVmYXVsdEluc3RhbmNlT2Y8RmlyZWJhc2VBbmFseXRpY3M+KEFOQUxZVElDU19QUk9WSURFUl9OQU1FLCBwcm92aWRlZCwgZGVmYXVsdEFwcCk7XG4gIHJldHVybiBkZWZhdWx0QW5hbHl0aWNzICYmIG5ldyBBbmFseXRpY3MoZGVmYXVsdEFuYWx5dGljcyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhbmFseXRpY3NJbnN0YW5jZUZhY3RvcnkoZm46IChpbmplY3RvcjogSW5qZWN0b3IpID0+IEZpcmViYXNlQW5hbHl0aWNzKSB7XG4gIHJldHVybiAoem9uZTogTmdab25lLCBpbmplY3RvcjogSW5qZWN0b3IpID0+IHtcbiAgICBpZiAoIcm1aXNBbmFseXRpY3NTdXBwb3J0ZWRGYWN0b3J5LnN5bmMoKSkgeyByZXR1cm4gbnVsbDsgfVxuICAgIGNvbnN0IGFuYWx5dGljcyA9IHpvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4gZm4oaW5qZWN0b3IpKTtcbiAgICByZXR1cm4gbmV3IEFuYWx5dGljcyhhbmFseXRpY3MpO1xuICB9O1xufVxuXG5jb25zdCBBTkFMWVRJQ1NfSU5TVEFOQ0VTX1BST1ZJREVSID0ge1xuICBwcm92aWRlOiBBbmFseXRpY3NJbnN0YW5jZXMsXG4gIGRlcHM6IFtcbiAgICBbbmV3IE9wdGlvbmFsKCksIFBST1ZJREVEX0FOQUxZVElDU19JTlNUQU5DRVMgXSxcbiAgXVxufTtcblxuY29uc3QgREVGQVVMVF9BTkFMWVRJQ1NfSU5TVEFOQ0VfUFJPVklERVIgPSB7XG4gIHByb3ZpZGU6IEFuYWx5dGljcyxcbiAgdXNlRmFjdG9yeTogZGVmYXVsdEFuYWx5dGljc0luc3RhbmNlRmFjdG9yeSxcbiAgZGVwczogW1xuICAgIFtuZXcgT3B0aW9uYWwoKSwgUFJPVklERURfQU5BTFlUSUNTX0lOU1RBTkNFUyBdLFxuICAgIEZpcmViYXNlQXBwLFxuICBdXG59O1xuXG5ATmdNb2R1bGUoe1xuICBwcm92aWRlcnM6IFtcbiAgICBERUZBVUxUX0FOQUxZVElDU19JTlNUQU5DRV9QUk9WSURFUixcbiAgICBBTkFMWVRJQ1NfSU5TVEFOQ0VTX1BST1ZJREVSLFxuICAgIHtcbiAgICAgIHByb3ZpZGU6IEFQUF9JTklUSUFMSVpFUixcbiAgICAgIHVzZVZhbHVlOiDJtWlzQW5hbHl0aWNzU3VwcG9ydGVkRmFjdG9yeS5hc3luYyxcbiAgICAgIG11bHRpOiB0cnVlLFxuICAgIH1cbiAgXVxufSlcbmV4cG9ydCBjbGFzcyBBbmFseXRpY3NNb2R1bGUge1xuICBjb25zdHJ1Y3RvcihcbiAgICBAT3B0aW9uYWwoKSBfc2NyZWVuVHJhY2tpbmdTZXJ2aWNlOiBTY3JlZW5UcmFja2luZ1NlcnZpY2UsXG4gICAgQE9wdGlvbmFsKCkgX3VzZXJUcmFja2luZ1NlcnZpY2U6IFVzZXJUcmFja2luZ1NlcnZpY2UsXG4gICkge1xuICAgIHJlZ2lzdGVyVmVyc2lvbignYW5ndWxhcmZpcmUnLCBWRVJTSU9OLmZ1bGwsICdhbmFseXRpY3MnKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcHJvdmlkZUFuYWx5dGljcyhmbjogKGluamVjdG9yOiBJbmplY3RvcikgPT4gRmlyZWJhc2VBbmFseXRpY3MsIC4uLmRlcHM6IGFueVtdKTogTW9kdWxlV2l0aFByb3ZpZGVyczxBbmFseXRpY3NNb2R1bGU+IHtcbiAgcmV0dXJuIHtcbiAgICBuZ01vZHVsZTogQW5hbHl0aWNzTW9kdWxlLFxuICAgIHByb3ZpZGVyczogW3tcbiAgICAgIHByb3ZpZGU6IFBST1ZJREVEX0FOQUxZVElDU19JTlNUQU5DRVMsXG4gICAgICB1c2VGYWN0b3J5OiBhbmFseXRpY3NJbnN0YW5jZUZhY3RvcnkoZm4pLFxuICAgICAgbXVsdGk6IHRydWUsXG4gICAgICBkZXBzOiBbXG4gICAgICAgIE5nWm9uZSxcbiAgICAgICAgSW5qZWN0b3IsXG4gICAgICAgIMm1QW5ndWxhckZpcmVTY2hlZHVsZXJzLFxuICAgICAgICBGaXJlYmFzZUFwcHMsXG4gICAgICAgIC4uLmRlcHMsXG4gICAgICBdXG4gICAgfV1cbiAgfTtcbn1cbiJdfQ==