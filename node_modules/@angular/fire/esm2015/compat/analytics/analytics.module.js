import { NgModule, Optional } from '@angular/core';
import { ScreenTrackingService } from './screen-tracking.service';
import { AngularFireAnalytics } from './analytics';
import { UserTrackingService } from './user-tracking.service';
import firebase from 'firebase/compat/app';
import { VERSION } from '@angular/fire';
import * as i0 from "@angular/core";
import * as i1 from "./analytics";
import * as i2 from "./screen-tracking.service";
import * as i3 from "./user-tracking.service";
export class AngularFireAnalyticsModule {
    constructor(analytics, screenTracking, userTracking) {
        firebase.registerVersion('angularfire', VERSION.full, 'analytics-compat');
        // calling anything on analytics will eagerly load the SDK
        // tslint:disable-next-line:no-unused-expression
        analytics.app.then(() => { });
    }
}
AngularFireAnalyticsModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: AngularFireAnalyticsModule, deps: [{ token: i1.AngularFireAnalytics }, { token: i2.ScreenTrackingService, optional: true }, { token: i3.UserTrackingService, optional: true }], target: i0.ɵɵFactoryTarget.NgModule });
AngularFireAnalyticsModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: AngularFireAnalyticsModule });
AngularFireAnalyticsModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: AngularFireAnalyticsModule, providers: [AngularFireAnalytics] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: AngularFireAnalyticsModule, decorators: [{
            type: NgModule,
            args: [{
                    providers: [AngularFireAnalytics]
                }]
        }], ctorParameters: function () { return [{ type: i1.AngularFireAnalytics }, { type: i2.ScreenTrackingService, decorators: [{
                    type: Optional
                }] }, { type: i3.UserTrackingService, decorators: [{
                    type: Optional
                }] }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5hbHl0aWNzLm1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jb21wYXQvYW5hbHl0aWNzL2FuYWx5dGljcy5tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDbkQsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDbEUsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sYUFBYSxDQUFDO0FBQ25ELE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQzlELE9BQU8sUUFBUSxNQUFNLHFCQUFxQixDQUFDO0FBQzNDLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxlQUFlLENBQUM7Ozs7O0FBS3hDLE1BQU0sT0FBTywwQkFBMEI7SUFDckMsWUFDRSxTQUErQixFQUNuQixjQUFxQyxFQUNyQyxZQUFpQztRQUU3QyxRQUFRLENBQUMsZUFBZSxDQUFDLGFBQWEsRUFBRSxPQUFPLENBQUMsSUFBSSxFQUFFLGtCQUFrQixDQUFDLENBQUM7UUFDMUUsMERBQTBEO1FBQzFELGdEQUFnRDtRQUNoRCxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRSxDQUFDLENBQUMsQ0FBQztJQUMvQixDQUFDOzt1SEFWVSwwQkFBMEI7d0hBQTFCLDBCQUEwQjt3SEFBMUIsMEJBQTBCLGFBRjFCLENBQUUsb0JBQW9CLENBQUU7MkZBRXhCLDBCQUEwQjtrQkFIdEMsUUFBUTttQkFBQztvQkFDUixTQUFTLEVBQUUsQ0FBRSxvQkFBb0IsQ0FBRTtpQkFDcEM7OzBCQUlJLFFBQVE7OzBCQUNSLFFBQVEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOZ01vZHVsZSwgT3B0aW9uYWwgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFNjcmVlblRyYWNraW5nU2VydmljZSB9IGZyb20gJy4vc2NyZWVuLXRyYWNraW5nLnNlcnZpY2UnO1xuaW1wb3J0IHsgQW5ndWxhckZpcmVBbmFseXRpY3MgfSBmcm9tICcuL2FuYWx5dGljcyc7XG5pbXBvcnQgeyBVc2VyVHJhY2tpbmdTZXJ2aWNlIH0gZnJvbSAnLi91c2VyLXRyYWNraW5nLnNlcnZpY2UnO1xuaW1wb3J0IGZpcmViYXNlIGZyb20gJ2ZpcmViYXNlL2NvbXBhdC9hcHAnO1xuaW1wb3J0IHsgVkVSU0lPTiB9IGZyb20gJ0Bhbmd1bGFyL2ZpcmUnO1xuXG5ATmdNb2R1bGUoe1xuICBwcm92aWRlcnM6IFsgQW5ndWxhckZpcmVBbmFseXRpY3MgXVxufSlcbmV4cG9ydCBjbGFzcyBBbmd1bGFyRmlyZUFuYWx5dGljc01vZHVsZSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIGFuYWx5dGljczogQW5ndWxhckZpcmVBbmFseXRpY3MsXG4gICAgQE9wdGlvbmFsKCkgc2NyZWVuVHJhY2tpbmc6IFNjcmVlblRyYWNraW5nU2VydmljZSxcbiAgICBAT3B0aW9uYWwoKSB1c2VyVHJhY2tpbmc6IFVzZXJUcmFja2luZ1NlcnZpY2UsXG4gICkge1xuICAgIGZpcmViYXNlLnJlZ2lzdGVyVmVyc2lvbignYW5ndWxhcmZpcmUnLCBWRVJTSU9OLmZ1bGwsICdhbmFseXRpY3MtY29tcGF0Jyk7XG4gICAgLy8gY2FsbGluZyBhbnl0aGluZyBvbiBhbmFseXRpY3Mgd2lsbCBlYWdlcmx5IGxvYWQgdGhlIFNES1xuICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby11bnVzZWQtZXhwcmVzc2lvblxuICAgIGFuYWx5dGljcy5hcHAudGhlbigoKSA9PiB7fSk7XG4gIH1cbn1cbiJdfQ==