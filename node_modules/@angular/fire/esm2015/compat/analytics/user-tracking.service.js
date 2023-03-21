import { isPlatformServer } from '@angular/common';
import { Inject, Injectable, NgZone, PLATFORM_ID } from '@angular/core';
import { AngularFireAnalytics } from './analytics';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { VERSION } from '@angular/fire';
import * as i0 from "@angular/core";
import * as i1 from "./analytics";
import * as i2 from "@angular/fire/compat/auth";
export class UserTrackingService {
    // TODO a user properties injector
    constructor(analytics, 
    // tslint:disable-next-line:ban-types
    platformId, auth, zone) {
        this.disposables = [];
        firebase.registerVersion('angularfire', VERSION.full, 'compat-user-tracking');
        if (!isPlatformServer(platformId)) {
            let resolveInitialized;
            this.initialized = zone.runOutsideAngular(() => new Promise(resolve => resolveInitialized = resolve));
            this.disposables = [
                auth.authState.subscribe(user => {
                    analytics.setUserId(user === null || user === void 0 ? void 0 : user.uid);
                    resolveInitialized();
                }),
                auth.credential.subscribe(credential => {
                    if (credential) {
                        const method = credential.user.isAnonymous ? 'anonymous' : credential.additionalUserInfo.providerId;
                        if (credential.additionalUserInfo.isNewUser) {
                            analytics.logEvent('sign_up', { method });
                        }
                        analytics.logEvent('login', { method });
                    }
                })
            ];
        }
        else {
            this.initialized = Promise.resolve();
        }
    }
    ngOnDestroy() {
        this.disposables.forEach(it => it.unsubscribe());
    }
}
UserTrackingService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: UserTrackingService, deps: [{ token: i1.AngularFireAnalytics }, { token: PLATFORM_ID }, { token: i2.AngularFireAuth }, { token: i0.NgZone }], target: i0.ɵɵFactoryTarget.Injectable });
UserTrackingService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: UserTrackingService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: UserTrackingService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: i1.AngularFireAnalytics }, { type: Object, decorators: [{
                    type: Inject,
                    args: [PLATFORM_ID]
                }] }, { type: i2.AngularFireAuth }, { type: i0.NgZone }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlci10cmFja2luZy5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2NvbXBhdC9hbmFseXRpY3MvdXNlci10cmFja2luZy5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQ25ELE9BQU8sRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBYSxXQUFXLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDbkYsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sYUFBYSxDQUFDO0FBQ25ELE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUU1RCxPQUFPLFFBQVEsTUFBTSxxQkFBcUIsQ0FBQztBQUMzQyxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sZUFBZSxDQUFDOzs7O0FBR3hDLE1BQU0sT0FBTyxtQkFBbUI7SUFLOUIsa0NBQWtDO0lBQ2xDLFlBQ0UsU0FBK0I7SUFDL0IscUNBQXFDO0lBQ2hCLFVBQWtCLEVBQ3ZDLElBQXFCLEVBQ3JCLElBQVk7UUFSTixnQkFBVyxHQUF3QixFQUFFLENBQUM7UUFVNUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxhQUFhLEVBQUUsT0FBTyxDQUFDLElBQUksRUFBRSxzQkFBc0IsQ0FBQyxDQUFDO1FBQzlFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsRUFBRTtZQUNqQyxJQUFJLGtCQUFrQixDQUFDO1lBQ3ZCLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsa0JBQWtCLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUN0RyxJQUFJLENBQUMsV0FBVyxHQUFHO2dCQUNmLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFO29CQUM5QixTQUFTLENBQUMsU0FBUyxDQUFDLElBQUksYUFBSixJQUFJLHVCQUFKLElBQUksQ0FBRSxHQUFHLENBQUMsQ0FBQztvQkFDL0Isa0JBQWtCLEVBQUUsQ0FBQztnQkFDdkIsQ0FBQyxDQUFDO2dCQUNGLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxFQUFFO29CQUNyQyxJQUFJLFVBQVUsRUFBRTt3QkFDZCxNQUFNLE1BQU0sR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsa0JBQWtCLENBQUMsVUFBVSxDQUFDO3dCQUNwRyxJQUFJLFVBQVUsQ0FBQyxrQkFBa0IsQ0FBQyxTQUFTLEVBQUU7NEJBQzNDLFNBQVMsQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQzt5QkFDM0M7d0JBQ0QsU0FBUyxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO3FCQUN6QztnQkFDSCxDQUFDLENBQUM7YUFDTCxDQUFDO1NBQ0g7YUFBTTtZQUNMLElBQUksQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO1NBQ3RDO0lBRUgsQ0FBQztJQUVELFdBQVc7UUFDVCxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO0lBQ25ELENBQUM7O2dIQXhDVSxtQkFBbUIsc0RBU3BCLFdBQVc7b0hBVFYsbUJBQW1COzJGQUFuQixtQkFBbUI7a0JBRC9CLFVBQVU7NkZBVTBCLE1BQU07MEJBQXRDLE1BQU07MkJBQUMsV0FBVyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGlzUGxhdGZvcm1TZXJ2ZXIgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHsgSW5qZWN0LCBJbmplY3RhYmxlLCBOZ1pvbmUsIE9uRGVzdHJveSwgUExBVEZPUk1fSUQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEFuZ3VsYXJGaXJlQW5hbHl0aWNzIH0gZnJvbSAnLi9hbmFseXRpY3MnO1xuaW1wb3J0IHsgQW5ndWxhckZpcmVBdXRoIH0gZnJvbSAnQGFuZ3VsYXIvZmlyZS9jb21wYXQvYXV0aCc7XG5pbXBvcnQgeyBTdWJzY3JpcHRpb24gfSBmcm9tICdyeGpzJztcbmltcG9ydCBmaXJlYmFzZSBmcm9tICdmaXJlYmFzZS9jb21wYXQvYXBwJztcbmltcG9ydCB7IFZFUlNJT04gfSBmcm9tICdAYW5ndWxhci9maXJlJztcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFVzZXJUcmFja2luZ1NlcnZpY2UgaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xuXG4gIGluaXRpYWxpemVkOiBQcm9taXNlPHZvaWQ+O1xuICBwcml2YXRlIGRpc3Bvc2FibGVzOiBBcnJheTxTdWJzY3JpcHRpb24+ID0gW107XG5cbiAgLy8gVE9ETyBhIHVzZXIgcHJvcGVydGllcyBpbmplY3RvclxuICBjb25zdHJ1Y3RvcihcbiAgICBhbmFseXRpY3M6IEFuZ3VsYXJGaXJlQW5hbHl0aWNzLFxuICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpiYW4tdHlwZXNcbiAgICBASW5qZWN0KFBMQVRGT1JNX0lEKSBwbGF0Zm9ybUlkOiBPYmplY3QsXG4gICAgYXV0aDogQW5ndWxhckZpcmVBdXRoLFxuICAgIHpvbmU6IE5nWm9uZSxcbiAgKSB7XG4gICAgZmlyZWJhc2UucmVnaXN0ZXJWZXJzaW9uKCdhbmd1bGFyZmlyZScsIFZFUlNJT04uZnVsbCwgJ2NvbXBhdC11c2VyLXRyYWNraW5nJyk7XG4gICAgaWYgKCFpc1BsYXRmb3JtU2VydmVyKHBsYXRmb3JtSWQpKSB7XG4gICAgICBsZXQgcmVzb2x2ZUluaXRpYWxpemVkO1xuICAgICAgdGhpcy5pbml0aWFsaXplZCA9IHpvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiByZXNvbHZlSW5pdGlhbGl6ZWQgPSByZXNvbHZlKSk7XG4gICAgICB0aGlzLmRpc3Bvc2FibGVzID0gW1xuICAgICAgICAgIGF1dGguYXV0aFN0YXRlLnN1YnNjcmliZSh1c2VyID0+IHtcbiAgICAgICAgICAgIGFuYWx5dGljcy5zZXRVc2VySWQodXNlcj8udWlkKTtcbiAgICAgICAgICAgIHJlc29sdmVJbml0aWFsaXplZCgpO1xuICAgICAgICAgIH0pLFxuICAgICAgICAgIGF1dGguY3JlZGVudGlhbC5zdWJzY3JpYmUoY3JlZGVudGlhbCA9PiB7XG4gICAgICAgICAgICBpZiAoY3JlZGVudGlhbCkge1xuICAgICAgICAgICAgICBjb25zdCBtZXRob2QgPSBjcmVkZW50aWFsLnVzZXIuaXNBbm9ueW1vdXMgPyAnYW5vbnltb3VzJyA6IGNyZWRlbnRpYWwuYWRkaXRpb25hbFVzZXJJbmZvLnByb3ZpZGVySWQ7XG4gICAgICAgICAgICAgIGlmIChjcmVkZW50aWFsLmFkZGl0aW9uYWxVc2VySW5mby5pc05ld1VzZXIpIHtcbiAgICAgICAgICAgICAgICBhbmFseXRpY3MubG9nRXZlbnQoJ3NpZ25fdXAnLCB7IG1ldGhvZCB9KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBhbmFseXRpY3MubG9nRXZlbnQoJ2xvZ2luJywgeyBtZXRob2QgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSlcbiAgICAgIF07XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSBQcm9taXNlLnJlc29sdmUoKTtcbiAgICB9XG5cbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIHRoaXMuZGlzcG9zYWJsZXMuZm9yRWFjaChpdCA9PiBpdC51bnN1YnNjcmliZSgpKTtcbiAgfVxufVxuIl19