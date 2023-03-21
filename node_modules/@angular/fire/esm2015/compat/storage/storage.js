import { Inject, Injectable, InjectionToken, NgZone, Optional, PLATFORM_ID } from '@angular/core';
import { createStorageRef } from './ref';
import { ɵAngularFireSchedulers } from '@angular/fire';
import { ɵfirebaseAppFactory, FIREBASE_APP_NAME, FIREBASE_OPTIONS, ɵcacheInstance } from '@angular/fire/compat';
import 'firebase/compat/storage';
import { AppCheckInstances } from '@angular/fire/app-check';
import * as i0 from "@angular/core";
import * as i1 from "@angular/fire";
import * as i2 from "@angular/fire/app-check";
export const BUCKET = new InjectionToken('angularfire2.storageBucket');
export const MAX_UPLOAD_RETRY_TIME = new InjectionToken('angularfire2.storage.maxUploadRetryTime');
export const MAX_OPERATION_RETRY_TIME = new InjectionToken('angularfire2.storage.maxOperationRetryTime');
export const USE_EMULATOR = new InjectionToken('angularfire2.storage.use-emulator');
/**
 * AngularFireStorage Service
 *
 * This service is the main entry point for this feature module. It provides
 * an API for uploading and downloading binary files from Cloud Storage for
 * Firebase.
 */
export class AngularFireStorage {
    constructor(options, name, storageBucket, 
    // tslint:disable-next-line:ban-types
    platformId, zone, schedulers, maxUploadRetryTime, maxOperationRetryTime, _useEmulator, _appCheckInstances) {
        const app = ɵfirebaseAppFactory(options, zone, name);
        this.storage = ɵcacheInstance(`${app.name}.storage.${storageBucket}`, 'AngularFireStorage', app.name, () => {
            const storage = zone.runOutsideAngular(() => app.storage(storageBucket || undefined));
            const useEmulator = _useEmulator;
            if (useEmulator) {
                storage.useEmulator(...useEmulator);
            }
            if (maxUploadRetryTime) {
                storage.setMaxUploadRetryTime(maxUploadRetryTime);
            }
            if (maxOperationRetryTime) {
                storage.setMaxOperationRetryTime(maxOperationRetryTime);
            }
            return storage;
        }, [maxUploadRetryTime, maxOperationRetryTime]);
    }
    ref(path) {
        return createStorageRef(this.storage.ref(path));
    }
    refFromURL(path) {
        return createStorageRef(this.storage.refFromURL(path));
    }
    upload(path, data, metadata) {
        const storageRef = this.storage.ref(path);
        const ref = createStorageRef(storageRef);
        return ref.put(data, metadata);
    }
}
AngularFireStorage.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: AngularFireStorage, deps: [{ token: FIREBASE_OPTIONS }, { token: FIREBASE_APP_NAME, optional: true }, { token: BUCKET, optional: true }, { token: PLATFORM_ID }, { token: i0.NgZone }, { token: i1.ɵAngularFireSchedulers }, { token: MAX_UPLOAD_RETRY_TIME, optional: true }, { token: MAX_OPERATION_RETRY_TIME, optional: true }, { token: USE_EMULATOR, optional: true }, { token: i2.AppCheckInstances, optional: true }], target: i0.ɵɵFactoryTarget.Injectable });
AngularFireStorage.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: AngularFireStorage, providedIn: 'any' });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: AngularFireStorage, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'any'
                }]
        }], ctorParameters: function () { return [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [FIREBASE_OPTIONS]
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [FIREBASE_APP_NAME]
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [BUCKET]
                }] }, { type: Object, decorators: [{
                    type: Inject,
                    args: [PLATFORM_ID]
                }] }, { type: i0.NgZone }, { type: i1.ɵAngularFireSchedulers }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [MAX_UPLOAD_RETRY_TIME]
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [MAX_OPERATION_RETRY_TIME]
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [USE_EMULATOR]
                }] }, { type: i2.AppCheckInstances, decorators: [{
                    type: Optional
                }] }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RvcmFnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jb21wYXQvc3RvcmFnZS9zdG9yYWdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLGNBQWMsRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUNsRyxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxPQUFPLENBQUM7QUFDekMsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRXZELE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxpQkFBaUIsRUFBRSxnQkFBZ0IsRUFBRSxjQUFjLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUVoSCxPQUFPLHlCQUF5QixDQUFDO0FBRWpDLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLHlCQUF5QixDQUFDOzs7O0FBRTVELE1BQU0sQ0FBQyxNQUFNLE1BQU0sR0FBRyxJQUFJLGNBQWMsQ0FBUyw0QkFBNEIsQ0FBQyxDQUFDO0FBQy9FLE1BQU0sQ0FBQyxNQUFNLHFCQUFxQixHQUFHLElBQUksY0FBYyxDQUFTLHlDQUF5QyxDQUFDLENBQUM7QUFDM0csTUFBTSxDQUFDLE1BQU0sd0JBQXdCLEdBQUcsSUFBSSxjQUFjLENBQVMsNENBQTRDLENBQUMsQ0FBQztBQUdqSCxNQUFNLENBQUMsTUFBTSxZQUFZLEdBQUcsSUFBSSxjQUFjLENBQXVCLG1DQUFtQyxDQUFDLENBQUM7QUFFMUc7Ozs7OztHQU1HO0FBSUgsTUFBTSxPQUFPLGtCQUFrQjtJQUc3QixZQUM0QixPQUF3QixFQUNYLElBQStCLEVBQzFDLGFBQTRCO0lBQ3hELHFDQUFxQztJQUNoQixVQUFrQixFQUN2QyxJQUFZLEVBQ1osVUFBa0MsRUFDUyxrQkFBZ0MsRUFDN0IscUJBQW1DLEVBQy9DLFlBQWlCLEVBQ3ZDLGtCQUFxQztRQUVqRCxNQUFNLEdBQUcsR0FBRyxtQkFBbUIsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3JELElBQUksQ0FBQyxPQUFPLEdBQUcsY0FBYyxDQUFDLEdBQUcsR0FBRyxDQUFDLElBQUksWUFBWSxhQUFhLEVBQUUsRUFBRSxvQkFBb0IsRUFBRSxHQUFHLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRTtZQUN6RyxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxhQUFhLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQztZQUN0RixNQUFNLFdBQVcsR0FBRyxZQUF5QyxDQUFDO1lBQzlELElBQUksV0FBVyxFQUFFO2dCQUNmLE9BQU8sQ0FBQyxXQUFXLENBQUMsR0FBRyxXQUFXLENBQUMsQ0FBQzthQUNyQztZQUNELElBQUksa0JBQWtCLEVBQUU7Z0JBQ3RCLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO2FBQ25EO1lBQ0QsSUFBSSxxQkFBcUIsRUFBRTtnQkFDekIsT0FBTyxDQUFDLHdCQUF3QixDQUFDLHFCQUFxQixDQUFDLENBQUM7YUFDekQ7WUFDRCxPQUFPLE9BQU8sQ0FBQztRQUNqQixDQUFDLEVBQUUsQ0FBQyxrQkFBa0IsRUFBRSxxQkFBcUIsQ0FBQyxDQUFDLENBQUM7SUFDbEQsQ0FBQztJQUVELEdBQUcsQ0FBQyxJQUFZO1FBQ2QsT0FBTyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ2xELENBQUM7SUFFRCxVQUFVLENBQUMsSUFBWTtRQUNyQixPQUFPLGdCQUFnQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDekQsQ0FBQztJQUVELE1BQU0sQ0FBQyxJQUFZLEVBQUUsSUFBUyxFQUFFLFFBQXlCO1FBQ3ZELE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzFDLE1BQU0sR0FBRyxHQUFHLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3pDLE9BQU8sR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDakMsQ0FBQzs7K0dBN0NVLGtCQUFrQixrQkFJbkIsZ0JBQWdCLGFBQ0osaUJBQWlCLDZCQUNqQixNQUFNLDZCQUVsQixXQUFXLHlFQUdDLHFCQUFxQiw2QkFDckIsd0JBQXdCLDZCQUN4QixZQUFZO21IQWJ2QixrQkFBa0IsY0FGakIsS0FBSzsyRkFFTixrQkFBa0I7a0JBSDlCLFVBQVU7bUJBQUM7b0JBQ1YsVUFBVSxFQUFFLEtBQUs7aUJBQ2xCOzswQkFLSSxNQUFNOzJCQUFDLGdCQUFnQjs7MEJBQ3ZCLFFBQVE7OzBCQUFJLE1BQU07MkJBQUMsaUJBQWlCOzswQkFDcEMsUUFBUTs7MEJBQUksTUFBTTsyQkFBQyxNQUFNOzhCQUVPLE1BQU07MEJBQXRDLE1BQU07MkJBQUMsV0FBVzs7MEJBR2xCLFFBQVE7OzBCQUFJLE1BQU07MkJBQUMscUJBQXFCOzswQkFDeEMsUUFBUTs7MEJBQUksTUFBTTsyQkFBQyx3QkFBd0I7OzBCQUMzQyxRQUFROzswQkFBSSxNQUFNOzJCQUFDLFlBQVk7OzBCQUMvQixRQUFRIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0LCBJbmplY3RhYmxlLCBJbmplY3Rpb25Ub2tlbiwgTmdab25lLCBPcHRpb25hbCwgUExBVEZPUk1fSUQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IGNyZWF0ZVN0b3JhZ2VSZWYgfSBmcm9tICcuL3JlZic7XG5pbXBvcnQgeyDJtUFuZ3VsYXJGaXJlU2NoZWR1bGVycyB9IGZyb20gJ0Bhbmd1bGFyL2ZpcmUnO1xuaW1wb3J0IHsgRmlyZWJhc2VPcHRpb25zIH0gZnJvbSAnZmlyZWJhc2UvYXBwJztcbmltcG9ydCB7IMm1ZmlyZWJhc2VBcHBGYWN0b3J5LCBGSVJFQkFTRV9BUFBfTkFNRSwgRklSRUJBU0VfT1BUSU9OUywgybVjYWNoZUluc3RhbmNlIH0gZnJvbSAnQGFuZ3VsYXIvZmlyZS9jb21wYXQnO1xuaW1wb3J0IHsgVXBsb2FkTWV0YWRhdGEgfSBmcm9tICcuL2ludGVyZmFjZXMnO1xuaW1wb3J0ICdmaXJlYmFzZS9jb21wYXQvc3RvcmFnZSc7XG5pbXBvcnQgZmlyZWJhc2UgZnJvbSAnZmlyZWJhc2UvY29tcGF0L2FwcCc7XG5pbXBvcnQgeyBBcHBDaGVja0luc3RhbmNlcyB9IGZyb20gJ0Bhbmd1bGFyL2ZpcmUvYXBwLWNoZWNrJztcblxuZXhwb3J0IGNvbnN0IEJVQ0tFVCA9IG5ldyBJbmplY3Rpb25Ub2tlbjxzdHJpbmc+KCdhbmd1bGFyZmlyZTIuc3RvcmFnZUJ1Y2tldCcpO1xuZXhwb3J0IGNvbnN0IE1BWF9VUExPQURfUkVUUllfVElNRSA9IG5ldyBJbmplY3Rpb25Ub2tlbjxudW1iZXI+KCdhbmd1bGFyZmlyZTIuc3RvcmFnZS5tYXhVcGxvYWRSZXRyeVRpbWUnKTtcbmV4cG9ydCBjb25zdCBNQVhfT1BFUkFUSU9OX1JFVFJZX1RJTUUgPSBuZXcgSW5qZWN0aW9uVG9rZW48bnVtYmVyPignYW5ndWxhcmZpcmUyLnN0b3JhZ2UubWF4T3BlcmF0aW9uUmV0cnlUaW1lJyk7XG5cbnR5cGUgVXNlRW11bGF0b3JBcmd1bWVudHMgPSBQYXJhbWV0ZXJzPGZpcmViYXNlLnN0b3JhZ2UuU3RvcmFnZVsndXNlRW11bGF0b3InXT47XG5leHBvcnQgY29uc3QgVVNFX0VNVUxBVE9SID0gbmV3IEluamVjdGlvblRva2VuPFVzZUVtdWxhdG9yQXJndW1lbnRzPignYW5ndWxhcmZpcmUyLnN0b3JhZ2UudXNlLWVtdWxhdG9yJyk7XG5cbi8qKlxuICogQW5ndWxhckZpcmVTdG9yYWdlIFNlcnZpY2VcbiAqXG4gKiBUaGlzIHNlcnZpY2UgaXMgdGhlIG1haW4gZW50cnkgcG9pbnQgZm9yIHRoaXMgZmVhdHVyZSBtb2R1bGUuIEl0IHByb3ZpZGVzXG4gKiBhbiBBUEkgZm9yIHVwbG9hZGluZyBhbmQgZG93bmxvYWRpbmcgYmluYXJ5IGZpbGVzIGZyb20gQ2xvdWQgU3RvcmFnZSBmb3JcbiAqIEZpcmViYXNlLlxuICovXG5ASW5qZWN0YWJsZSh7XG4gIHByb3ZpZGVkSW46ICdhbnknXG59KVxuZXhwb3J0IGNsYXNzIEFuZ3VsYXJGaXJlU3RvcmFnZSB7XG4gIHB1YmxpYyByZWFkb25seSBzdG9yYWdlOiBmaXJlYmFzZS5zdG9yYWdlLlN0b3JhZ2U7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgQEluamVjdChGSVJFQkFTRV9PUFRJT05TKSBvcHRpb25zOiBGaXJlYmFzZU9wdGlvbnMsXG4gICAgQE9wdGlvbmFsKCkgQEluamVjdChGSVJFQkFTRV9BUFBfTkFNRSkgbmFtZTogc3RyaW5nIHwgbnVsbCB8IHVuZGVmaW5lZCxcbiAgICBAT3B0aW9uYWwoKSBASW5qZWN0KEJVQ0tFVCkgc3RvcmFnZUJ1Y2tldDogc3RyaW5nIHwgbnVsbCxcbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6YmFuLXR5cGVzXG4gICAgQEluamVjdChQTEFURk9STV9JRCkgcGxhdGZvcm1JZDogT2JqZWN0LFxuICAgIHpvbmU6IE5nWm9uZSxcbiAgICBzY2hlZHVsZXJzOiDJtUFuZ3VsYXJGaXJlU2NoZWR1bGVycyxcbiAgICBAT3B0aW9uYWwoKSBASW5qZWN0KE1BWF9VUExPQURfUkVUUllfVElNRSkgbWF4VXBsb2FkUmV0cnlUaW1lOiBudW1iZXIgfCBhbnksXG4gICAgQE9wdGlvbmFsKCkgQEluamVjdChNQVhfT1BFUkFUSU9OX1JFVFJZX1RJTUUpIG1heE9wZXJhdGlvblJldHJ5VGltZTogbnVtYmVyIHwgYW55LFxuICAgIEBPcHRpb25hbCgpIEBJbmplY3QoVVNFX0VNVUxBVE9SKSBfdXNlRW11bGF0b3I6IGFueSxcbiAgICBAT3B0aW9uYWwoKSBfYXBwQ2hlY2tJbnN0YW5jZXM6IEFwcENoZWNrSW5zdGFuY2VzLFxuICApIHtcbiAgICBjb25zdCBhcHAgPSDJtWZpcmViYXNlQXBwRmFjdG9yeShvcHRpb25zLCB6b25lLCBuYW1lKTtcbiAgICB0aGlzLnN0b3JhZ2UgPSDJtWNhY2hlSW5zdGFuY2UoYCR7YXBwLm5hbWV9LnN0b3JhZ2UuJHtzdG9yYWdlQnVja2V0fWAsICdBbmd1bGFyRmlyZVN0b3JhZ2UnLCBhcHAubmFtZSwgKCkgPT4ge1xuICAgICAgY29uc3Qgc3RvcmFnZSA9IHpvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4gYXBwLnN0b3JhZ2Uoc3RvcmFnZUJ1Y2tldCB8fCB1bmRlZmluZWQpKTtcbiAgICAgIGNvbnN0IHVzZUVtdWxhdG9yID0gX3VzZUVtdWxhdG9yIGFzIFVzZUVtdWxhdG9yQXJndW1lbnRzfG51bGw7XG4gICAgICBpZiAodXNlRW11bGF0b3IpIHtcbiAgICAgICAgc3RvcmFnZS51c2VFbXVsYXRvciguLi51c2VFbXVsYXRvcik7XG4gICAgICB9XG4gICAgICBpZiAobWF4VXBsb2FkUmV0cnlUaW1lKSB7XG4gICAgICAgIHN0b3JhZ2Uuc2V0TWF4VXBsb2FkUmV0cnlUaW1lKG1heFVwbG9hZFJldHJ5VGltZSk7XG4gICAgICB9XG4gICAgICBpZiAobWF4T3BlcmF0aW9uUmV0cnlUaW1lKSB7XG4gICAgICAgIHN0b3JhZ2Uuc2V0TWF4T3BlcmF0aW9uUmV0cnlUaW1lKG1heE9wZXJhdGlvblJldHJ5VGltZSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gc3RvcmFnZTtcbiAgICB9LCBbbWF4VXBsb2FkUmV0cnlUaW1lLCBtYXhPcGVyYXRpb25SZXRyeVRpbWVdKTtcbiAgfVxuXG4gIHJlZihwYXRoOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gY3JlYXRlU3RvcmFnZVJlZih0aGlzLnN0b3JhZ2UucmVmKHBhdGgpKTtcbiAgfVxuXG4gIHJlZkZyb21VUkwocGF0aDogc3RyaW5nKSB7XG4gICAgcmV0dXJuIGNyZWF0ZVN0b3JhZ2VSZWYodGhpcy5zdG9yYWdlLnJlZkZyb21VUkwocGF0aCkpO1xuICB9XG5cbiAgdXBsb2FkKHBhdGg6IHN0cmluZywgZGF0YTogYW55LCBtZXRhZGF0YT86IFVwbG9hZE1ldGFkYXRhKSB7XG4gICAgY29uc3Qgc3RvcmFnZVJlZiA9IHRoaXMuc3RvcmFnZS5yZWYocGF0aCk7XG4gICAgY29uc3QgcmVmID0gY3JlYXRlU3RvcmFnZVJlZihzdG9yYWdlUmVmKTtcbiAgICByZXR1cm4gcmVmLnB1dChkYXRhLCBtZXRhZGF0YSk7XG4gIH1cblxufVxuIl19