import { __awaiter } from "tslib";
import { ComponentFactoryResolver, Injectable, NgZone, Optional } from '@angular/core';
import { switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AngularFireAnalytics } from './analytics';
import { Title } from '@angular/platform-browser';
import { UserTrackingService } from './user-tracking.service';
import firebase from 'firebase/compat/app';
import { VERSION } from '@angular/fire';
import { ɵscreenViewEvent } from '@angular/fire/analytics';
import * as i0 from "@angular/core";
import * as i1 from "./analytics";
import * as i2 from "@angular/router";
import * as i3 from "@angular/platform-browser";
import * as i4 from "./user-tracking.service";
const SCREEN_VIEW_EVENT = 'screen_view';
export class ScreenTrackingService {
    constructor(analytics, router, title, componentFactoryResolver, zone, userTrackingService) {
        firebase.registerVersion('angularfire', VERSION.full, 'compat-screen-tracking');
        if (!router || !analytics) {
            return this;
        }
        zone.runOutsideAngular(() => {
            this.disposable = ɵscreenViewEvent(router, title, componentFactoryResolver).pipe(switchMap((params) => __awaiter(this, void 0, void 0, function* () {
                if (userTrackingService) {
                    yield userTrackingService.initialized;
                }
                return yield analytics.logEvent(SCREEN_VIEW_EVENT, params);
            }))).subscribe();
        });
    }
    ngOnDestroy() {
        if (this.disposable) {
            this.disposable.unsubscribe();
        }
    }
}
ScreenTrackingService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: ScreenTrackingService, deps: [{ token: i1.AngularFireAnalytics }, { token: i2.Router, optional: true }, { token: i3.Title, optional: true }, { token: i0.ComponentFactoryResolver }, { token: i0.NgZone }, { token: i4.UserTrackingService, optional: true }], target: i0.ɵɵFactoryTarget.Injectable });
ScreenTrackingService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: ScreenTrackingService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: ScreenTrackingService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: i1.AngularFireAnalytics }, { type: i2.Router, decorators: [{
                    type: Optional
                }] }, { type: i3.Title, decorators: [{
                    type: Optional
                }] }, { type: i0.ComponentFactoryResolver }, { type: i0.NgZone }, { type: i4.UserTrackingService, decorators: [{
                    type: Optional
                }] }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NyZWVuLXRyYWNraW5nLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvY29tcGF0L2FuYWx5dGljcy9zY3JlZW4tdHJhY2tpbmcuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLHdCQUF3QixFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQWEsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRWxHLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUMzQyxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDekMsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sYUFBYSxDQUFDO0FBQ25ELE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUNsRCxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUM5RCxPQUFPLFFBQVEsTUFBTSxxQkFBcUIsQ0FBQztBQUMzQyxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3hDLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLHlCQUF5QixDQUFDOzs7Ozs7QUFFM0QsTUFBTSxpQkFBaUIsR0FBRyxhQUFhLENBQUM7QUFHeEMsTUFBTSxPQUFPLHFCQUFxQjtJQUloQyxZQUNFLFNBQStCLEVBQ25CLE1BQWMsRUFDZCxLQUFZLEVBQ3hCLHdCQUFrRCxFQUNsRCxJQUFZLEVBQ0EsbUJBQXdDO1FBRXBELFFBQVEsQ0FBQyxlQUFlLENBQUMsYUFBYSxFQUFFLE9BQU8sQ0FBQyxJQUFJLEVBQUUsd0JBQXdCLENBQUMsQ0FBQztRQUNoRixJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsU0FBUyxFQUFFO1lBQUUsT0FBTyxJQUFJLENBQUM7U0FBRTtRQUMzQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsR0FBRyxFQUFFO1lBQzFCLElBQUksQ0FBQyxVQUFVLEdBQUcsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSx3QkFBd0IsQ0FBQyxDQUFDLElBQUksQ0FDNUUsU0FBUyxDQUFDLENBQU0sTUFBTSxFQUFDLEVBQUU7Z0JBQ3ZCLElBQUksbUJBQW1CLEVBQUU7b0JBQ3ZCLE1BQU0sbUJBQW1CLENBQUMsV0FBVyxDQUFDO2lCQUN2QztnQkFDRCxPQUFPLE1BQU0sU0FBUyxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUM3RCxDQUFDLENBQUEsQ0FBQyxDQUNMLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDaEIsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQsV0FBVztRQUNULElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRTtZQUNuQixJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsRUFBRSxDQUFDO1NBQy9CO0lBQ0gsQ0FBQzs7a0hBOUJVLHFCQUFxQjtzSEFBckIscUJBQXFCOzJGQUFyQixxQkFBcUI7a0JBRGpDLFVBQVU7OzBCQU9OLFFBQVE7OzBCQUNSLFFBQVE7OzBCQUdSLFFBQVEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIsIEluamVjdGFibGUsIE5nWm9uZSwgT25EZXN0cm95LCBPcHRpb25hbCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgU3Vic2NyaXB0aW9uIH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBzd2l0Y2hNYXAgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5pbXBvcnQgeyBSb3V0ZXIgfSBmcm9tICdAYW5ndWxhci9yb3V0ZXInO1xuaW1wb3J0IHsgQW5ndWxhckZpcmVBbmFseXRpY3MgfSBmcm9tICcuL2FuYWx5dGljcyc7XG5pbXBvcnQgeyBUaXRsZSB9IGZyb20gJ0Bhbmd1bGFyL3BsYXRmb3JtLWJyb3dzZXInO1xuaW1wb3J0IHsgVXNlclRyYWNraW5nU2VydmljZSB9IGZyb20gJy4vdXNlci10cmFja2luZy5zZXJ2aWNlJztcbmltcG9ydCBmaXJlYmFzZSBmcm9tICdmaXJlYmFzZS9jb21wYXQvYXBwJztcbmltcG9ydCB7IFZFUlNJT04gfSBmcm9tICdAYW5ndWxhci9maXJlJztcbmltcG9ydCB7IMm1c2NyZWVuVmlld0V2ZW50IH0gZnJvbSAnQGFuZ3VsYXIvZmlyZS9hbmFseXRpY3MnO1xuXG5jb25zdCBTQ1JFRU5fVklFV19FVkVOVCA9ICdzY3JlZW5fdmlldyc7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBTY3JlZW5UcmFja2luZ1NlcnZpY2UgaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xuXG4gIHByaXZhdGUgZGlzcG9zYWJsZTogU3Vic2NyaXB0aW9uIHwgdW5kZWZpbmVkO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIGFuYWx5dGljczogQW5ndWxhckZpcmVBbmFseXRpY3MsXG4gICAgQE9wdGlvbmFsKCkgcm91dGVyOiBSb3V0ZXIsXG4gICAgQE9wdGlvbmFsKCkgdGl0bGU6IFRpdGxlLFxuICAgIGNvbXBvbmVudEZhY3RvcnlSZXNvbHZlcjogQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyLFxuICAgIHpvbmU6IE5nWm9uZSxcbiAgICBAT3B0aW9uYWwoKSB1c2VyVHJhY2tpbmdTZXJ2aWNlOiBVc2VyVHJhY2tpbmdTZXJ2aWNlLFxuICApIHtcbiAgICBmaXJlYmFzZS5yZWdpc3RlclZlcnNpb24oJ2FuZ3VsYXJmaXJlJywgVkVSU0lPTi5mdWxsLCAnY29tcGF0LXNjcmVlbi10cmFja2luZycpO1xuICAgIGlmICghcm91dGVyIHx8ICFhbmFseXRpY3MpIHsgcmV0dXJuIHRoaXM7IH1cbiAgICB6b25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgIHRoaXMuZGlzcG9zYWJsZSA9IMm1c2NyZWVuVmlld0V2ZW50KHJvdXRlciwgdGl0bGUsIGNvbXBvbmVudEZhY3RvcnlSZXNvbHZlcikucGlwZShcbiAgICAgICAgICBzd2l0Y2hNYXAoYXN5bmMgcGFyYW1zID0+IHtcbiAgICAgICAgICAgIGlmICh1c2VyVHJhY2tpbmdTZXJ2aWNlKSB7XG4gICAgICAgICAgICAgIGF3YWl0IHVzZXJUcmFja2luZ1NlcnZpY2UuaW5pdGlhbGl6ZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gYXdhaXQgYW5hbHl0aWNzLmxvZ0V2ZW50KFNDUkVFTl9WSUVXX0VWRU5ULCBwYXJhbXMpO1xuICAgICAgICAgIH0pXG4gICAgICApLnN1YnNjcmliZSgpO1xuICAgIH0pO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgaWYgKHRoaXMuZGlzcG9zYWJsZSkge1xuICAgICAgdGhpcy5kaXNwb3NhYmxlLnVuc3Vic2NyaWJlKCk7XG4gICAgfVxuICB9XG5cbn1cbiJdfQ==