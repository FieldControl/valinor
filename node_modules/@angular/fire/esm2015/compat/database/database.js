import { Inject, Injectable, InjectionToken, NgZone, Optional, PLATFORM_ID } from '@angular/core';
import { getRef } from './utils';
import { createListReference } from './list/create-reference';
import { createObjectReference } from './object/create-reference';
import { ɵAngularFireSchedulers } from '@angular/fire';
import { ɵfirebaseAppFactory, FIREBASE_APP_NAME, FIREBASE_OPTIONS, ɵcacheInstance } from '@angular/fire/compat';
import 'firebase/compat/auth';
import 'firebase/compat/database';
import { AngularFireAuth, USE_EMULATOR as USE_AUTH_EMULATOR, SETTINGS as AUTH_SETTINGS, TENANT_ID, LANGUAGE_CODE, USE_DEVICE_LANGUAGE, PERSISTENCE, ɵauthFactory, } from '@angular/fire/compat/auth';
import { AppCheckInstances } from '@angular/fire/app-check';
import * as i0 from "@angular/core";
import * as i1 from "@angular/fire";
import * as i2 from "@angular/fire/compat/auth";
import * as i3 from "@angular/fire/app-check";
export const URL = new InjectionToken('angularfire2.realtimeDatabaseURL');
export const USE_EMULATOR = new InjectionToken('angularfire2.database.use-emulator');
export class AngularFireDatabase {
    constructor(options, name, databaseURL, 
    // tslint:disable-next-line:ban-types
    platformId, zone, schedulers, _useEmulator, // tuple isn't working here
    auth, useAuthEmulator, authSettings, // can't use firebase.auth.AuthSettings here
    tenantId, languageCode, useDeviceLanguage, persistence, _appCheckInstances) {
        this.schedulers = schedulers;
        const useEmulator = _useEmulator;
        const app = ɵfirebaseAppFactory(options, zone, name);
        if (auth) {
            ɵauthFactory(app, zone, useAuthEmulator, tenantId, languageCode, useDeviceLanguage, authSettings, persistence);
        }
        this.database = ɵcacheInstance(`${app.name}.database.${databaseURL}`, 'AngularFireDatabase', app.name, () => {
            const database = zone.runOutsideAngular(() => app.database(databaseURL || undefined));
            if (useEmulator) {
                database.useEmulator(...useEmulator);
            }
            return database;
        }, [useEmulator]);
    }
    list(pathOrRef, queryFn) {
        const ref = this.schedulers.ngZone.runOutsideAngular(() => getRef(this.database, pathOrRef));
        let query = ref;
        if (queryFn) {
            query = queryFn(ref);
        }
        return createListReference(query, this);
    }
    object(pathOrRef) {
        const ref = this.schedulers.ngZone.runOutsideAngular(() => getRef(this.database, pathOrRef));
        return createObjectReference(ref, this);
    }
    createPushId() {
        const ref = this.schedulers.ngZone.runOutsideAngular(() => this.database.ref());
        return ref.push().key;
    }
}
AngularFireDatabase.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: AngularFireDatabase, deps: [{ token: FIREBASE_OPTIONS }, { token: FIREBASE_APP_NAME, optional: true }, { token: URL, optional: true }, { token: PLATFORM_ID }, { token: i0.NgZone }, { token: i1.ɵAngularFireSchedulers }, { token: USE_EMULATOR, optional: true }, { token: i2.AngularFireAuth, optional: true }, { token: USE_AUTH_EMULATOR, optional: true }, { token: AUTH_SETTINGS, optional: true }, { token: TENANT_ID, optional: true }, { token: LANGUAGE_CODE, optional: true }, { token: USE_DEVICE_LANGUAGE, optional: true }, { token: PERSISTENCE, optional: true }, { token: i3.AppCheckInstances, optional: true }], target: i0.ɵɵFactoryTarget.Injectable });
AngularFireDatabase.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: AngularFireDatabase, providedIn: 'any' });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: AngularFireDatabase, decorators: [{
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
                    args: [URL]
                }] }, { type: Object, decorators: [{
                    type: Inject,
                    args: [PLATFORM_ID]
                }] }, { type: i0.NgZone }, { type: i1.ɵAngularFireSchedulers }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [USE_EMULATOR]
                }] }, { type: i2.AngularFireAuth, decorators: [{
                    type: Optional
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [USE_AUTH_EMULATOR]
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [AUTH_SETTINGS]
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [TENANT_ID]
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [LANGUAGE_CODE]
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [USE_DEVICE_LANGUAGE]
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [PERSISTENCE]
                }] }, { type: i3.AppCheckInstances, decorators: [{
                    type: Optional
                }] }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YWJhc2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvY29tcGF0L2RhdGFiYXNlL2RhdGFiYXNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLGNBQWMsRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUVsRyxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sU0FBUyxDQUFDO0FBQ2pDLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQzlELE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQ2xFLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUV2RCxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsaUJBQWlCLEVBQUUsZ0JBQWdCLEVBQUUsY0FBYyxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDaEgsT0FBTyxzQkFBc0IsQ0FBQztBQUM5QixPQUFPLDBCQUEwQixDQUFDO0FBQ2xDLE9BQU8sRUFDTCxlQUFlLEVBQ2YsWUFBWSxJQUFJLGlCQUFpQixFQUNqQyxRQUFRLElBQUksYUFBYSxFQUN6QixTQUFTLEVBQ1QsYUFBYSxFQUNiLG1CQUFtQixFQUNuQixXQUFXLEVBQ1gsWUFBWSxHQUNiLE1BQU0sMkJBQTJCLENBQUM7QUFFbkMsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0seUJBQXlCLENBQUM7Ozs7O0FBRTVELE1BQU0sQ0FBQyxNQUFNLEdBQUcsR0FBRyxJQUFJLGNBQWMsQ0FBUyxrQ0FBa0MsQ0FBQyxDQUFDO0FBR2xGLE1BQU0sQ0FBQyxNQUFNLFlBQVksR0FBRyxJQUFJLGNBQWMsQ0FBdUIsb0NBQW9DLENBQUMsQ0FBQztBQUszRyxNQUFNLE9BQU8sbUJBQW1CO0lBRzlCLFlBQzRCLE9BQXdCLEVBQ1gsSUFBK0IsRUFDN0MsV0FB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QkFBQyxpQkFBaUI7OzBCQUNwQyxRQUFROzswQkFBSSxNQUFNOzJCQUFDLEdBQUc7OEJBRVUsTUFBTTswQkFBdEMsTUFBTTsyQkFBQyxXQUFXOzswQkFHbEIsUUFBUTs7MEJBQUksTUFBTTsyQkFBQyxZQUFZOzswQkFDL0IsUUFBUTs7MEJBQ1IsUUFBUTs7MEJBQUksTUFBTTsyQkFBQyxpQkFBaUI7OzBCQUNwQyxRQUFROzswQkFBSSxNQUFNOzJCQUFDLGFBQWE7OzBCQUNoQyxRQUFROzswQkFBSSxNQUFNOzJCQUFDLFNBQVM7OzBCQUM1QixRQUFROzswQkFBSSxNQUFNOzJCQUFDLGFBQWE7OzBCQUNoQyxRQUFROzswQkFBSSxNQUFNOzJCQUFDLG1CQUFtQjs7MEJBQ3RDLFFBQVE7OzBCQUFJLE1BQU07MkJBQUMsV0FBVzs7MEJBQzlCLFFBQVEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3QsIEluamVjdGFibGUsIEluamVjdGlvblRva2VuLCBOZ1pvbmUsIE9wdGlvbmFsLCBQTEFURk9STV9JRCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgQW5ndWxhckZpcmVMaXN0LCBBbmd1bGFyRmlyZU9iamVjdCwgRGF0YWJhc2VRdWVyeSwgUGF0aFJlZmVyZW5jZSwgUXVlcnlGbiB9IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyBnZXRSZWYgfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7IGNyZWF0ZUxpc3RSZWZlcmVuY2UgfSBmcm9tICcuL2xpc3QvY3JlYXRlLXJlZmVyZW5jZSc7XG5pbXBvcnQgeyBjcmVhdGVPYmplY3RSZWZlcmVuY2UgfSBmcm9tICcuL29iamVjdC9jcmVhdGUtcmVmZXJlbmNlJztcbmltcG9ydCB7IMm1QW5ndWxhckZpcmVTY2hlZHVsZXJzIH0gZnJvbSAnQGFuZ3VsYXIvZmlyZSc7XG5pbXBvcnQgeyBGaXJlYmFzZU9wdGlvbnMgfSBmcm9tICdmaXJlYmFzZS9hcHAnO1xuaW1wb3J0IHsgybVmaXJlYmFzZUFwcEZhY3RvcnksIEZJUkVCQVNFX0FQUF9OQU1FLCBGSVJFQkFTRV9PUFRJT05TLCDJtWNhY2hlSW5zdGFuY2UgfSBmcm9tICdAYW5ndWxhci9maXJlL2NvbXBhdCc7XG5pbXBvcnQgJ2ZpcmViYXNlL2NvbXBhdC9hdXRoJztcbmltcG9ydCAnZmlyZWJhc2UvY29tcGF0L2RhdGFiYXNlJztcbmltcG9ydCB7XG4gIEFuZ3VsYXJGaXJlQXV0aCxcbiAgVVNFX0VNVUxBVE9SIGFzIFVTRV9BVVRIX0VNVUxBVE9SLFxuICBTRVRUSU5HUyBhcyBBVVRIX1NFVFRJTkdTLFxuICBURU5BTlRfSUQsXG4gIExBTkdVQUdFX0NPREUsXG4gIFVTRV9ERVZJQ0VfTEFOR1VBR0UsXG4gIFBFUlNJU1RFTkNFLFxuICDJtWF1dGhGYWN0b3J5LFxufSBmcm9tICdAYW5ndWxhci9maXJlL2NvbXBhdC9hdXRoJztcbmltcG9ydCBmaXJlYmFzZSBmcm9tICdmaXJlYmFzZS9jb21wYXQvYXBwJztcbmltcG9ydCB7IEFwcENoZWNrSW5zdGFuY2VzIH0gZnJvbSAnQGFuZ3VsYXIvZmlyZS9hcHAtY2hlY2snO1xuXG5leHBvcnQgY29uc3QgVVJMID0gbmV3IEluamVjdGlvblRva2VuPHN0cmluZz4oJ2FuZ3VsYXJmaXJlMi5yZWFsdGltZURhdGFiYXNlVVJMJyk7XG5cbnR5cGUgVXNlRW11bGF0b3JBcmd1bWVudHMgPSBQYXJhbWV0ZXJzPGZpcmViYXNlLmRhdGFiYXNlLkRhdGFiYXNlWyd1c2VFbXVsYXRvciddPjtcbmV4cG9ydCBjb25zdCBVU0VfRU1VTEFUT1IgPSBuZXcgSW5qZWN0aW9uVG9rZW48VXNlRW11bGF0b3JBcmd1bWVudHM+KCdhbmd1bGFyZmlyZTIuZGF0YWJhc2UudXNlLWVtdWxhdG9yJyk7XG5cbkBJbmplY3RhYmxlKHtcbiAgcHJvdmlkZWRJbjogJ2FueSdcbn0pXG5leHBvcnQgY2xhc3MgQW5ndWxhckZpcmVEYXRhYmFzZSB7XG4gIHB1YmxpYyByZWFkb25seSBkYXRhYmFzZTogZmlyZWJhc2UuZGF0YWJhc2UuRGF0YWJhc2U7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgQEluamVjdChGSVJFQkFTRV9PUFRJT05TKSBvcHRpb25zOiBGaXJlYmFzZU9wdGlvbnMsXG4gICAgQE9wdGlvbmFsKCkgQEluamVjdChGSVJFQkFTRV9BUFBfTkFNRSkgbmFtZTogc3RyaW5nIHwgbnVsbCB8IHVuZGVmaW5lZCxcbiAgICBAT3B0aW9uYWwoKSBASW5qZWN0KFVSTCkgZGF0YWJhc2VVUkw6IHN0cmluZyB8IG51bGwsXG4gICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOmJhbi10eXBlc1xuICAgIEBJbmplY3QoUExBVEZPUk1fSUQpIHBsYXRmb3JtSWQ6IE9iamVjdCxcbiAgICB6b25lOiBOZ1pvbmUsXG4gICAgcHVibGljIHNjaGVkdWxlcnM6IMm1QW5ndWxhckZpcmVTY2hlZHVsZXJzLFxuICAgIEBPcHRpb25hbCgpIEBJbmplY3QoVVNFX0VNVUxBVE9SKSBfdXNlRW11bGF0b3I6IGFueSwgLy8gdHVwbGUgaXNuJ3Qgd29ya2luZyBoZXJlXG4gICAgQE9wdGlvbmFsKCkgYXV0aDogQW5ndWxhckZpcmVBdXRoLFxuICAgIEBPcHRpb25hbCgpIEBJbmplY3QoVVNFX0FVVEhfRU1VTEFUT1IpIHVzZUF1dGhFbXVsYXRvcjogYW55LFxuICAgIEBPcHRpb25hbCgpIEBJbmplY3QoQVVUSF9TRVRUSU5HUykgYXV0aFNldHRpbmdzOiBhbnksIC8vIGNhbid0IHVzZSBmaXJlYmFzZS5hdXRoLkF1dGhTZXR0aW5ncyBoZXJlXG4gICAgQE9wdGlvbmFsKCkgQEluamVjdChURU5BTlRfSUQpIHRlbmFudElkOiBzdHJpbmcgfCBudWxsLFxuICAgIEBPcHRpb25hbCgpIEBJbmplY3QoTEFOR1VBR0VfQ09ERSkgbGFuZ3VhZ2VDb2RlOiBzdHJpbmcgfCBudWxsLFxuICAgIEBPcHRpb25hbCgpIEBJbmplY3QoVVNFX0RFVklDRV9MQU5HVUFHRSkgdXNlRGV2aWNlTGFuZ3VhZ2U6IGJvb2xlYW4gfCBudWxsLFxuICAgIEBPcHRpb25hbCgpIEBJbmplY3QoUEVSU0lTVEVOQ0UpIHBlcnNpc3RlbmNlOiBzdHJpbmcgfCBudWxsLFxuICAgIEBPcHRpb25hbCgpIF9hcHBDaGVja0luc3RhbmNlczogQXBwQ2hlY2tJbnN0YW5jZXMsXG4gICkge1xuXG4gICAgY29uc3QgdXNlRW11bGF0b3I6IFVzZUVtdWxhdG9yQXJndW1lbnRzIHwgbnVsbCA9IF91c2VFbXVsYXRvcjtcbiAgICBjb25zdCBhcHAgPSDJtWZpcmViYXNlQXBwRmFjdG9yeShvcHRpb25zLCB6b25lLCBuYW1lKTtcblxuICAgIGlmIChhdXRoKSB7XG4gICAgICDJtWF1dGhGYWN0b3J5KGFwcCwgem9uZSwgdXNlQXV0aEVtdWxhdG9yLCB0ZW5hbnRJZCwgbGFuZ3VhZ2VDb2RlLCB1c2VEZXZpY2VMYW5ndWFnZSwgYXV0aFNldHRpbmdzLCBwZXJzaXN0ZW5jZSk7XG4gICAgfVxuXG4gICAgdGhpcy5kYXRhYmFzZSA9IMm1Y2FjaGVJbnN0YW5jZShgJHthcHAubmFtZX0uZGF0YWJhc2UuJHtkYXRhYmFzZVVSTH1gLCAnQW5ndWxhckZpcmVEYXRhYmFzZScsIGFwcC5uYW1lLCAoKSA9PiB7XG4gICAgICBjb25zdCBkYXRhYmFzZSA9IHpvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4gYXBwLmRhdGFiYXNlKGRhdGFiYXNlVVJMIHx8IHVuZGVmaW5lZCkpO1xuICAgICAgaWYgKHVzZUVtdWxhdG9yKSB7XG4gICAgICAgIGRhdGFiYXNlLnVzZUVtdWxhdG9yKC4uLnVzZUVtdWxhdG9yKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBkYXRhYmFzZTtcbiAgICB9LCBbdXNlRW11bGF0b3JdKTtcbiAgfVxuXG4gIGxpc3Q8VD4ocGF0aE9yUmVmOiBQYXRoUmVmZXJlbmNlLCBxdWVyeUZuPzogUXVlcnlGbik6IEFuZ3VsYXJGaXJlTGlzdDxUPiB7XG4gICAgY29uc3QgcmVmID0gdGhpcy5zY2hlZHVsZXJzLm5nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiBnZXRSZWYodGhpcy5kYXRhYmFzZSwgcGF0aE9yUmVmKSk7XG4gICAgbGV0IHF1ZXJ5OiBEYXRhYmFzZVF1ZXJ5ID0gcmVmO1xuICAgIGlmIChxdWVyeUZuKSB7XG4gICAgICBxdWVyeSA9IHF1ZXJ5Rm4ocmVmKTtcbiAgICB9XG4gICAgcmV0dXJuIGNyZWF0ZUxpc3RSZWZlcmVuY2U8VD4ocXVlcnksIHRoaXMpO1xuICB9XG5cbiAgb2JqZWN0PFQ+KHBhdGhPclJlZjogUGF0aFJlZmVyZW5jZSk6IEFuZ3VsYXJGaXJlT2JqZWN0PFQ+IHtcbiAgICBjb25zdCByZWYgPSB0aGlzLnNjaGVkdWxlcnMubmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IGdldFJlZih0aGlzLmRhdGFiYXNlLCBwYXRoT3JSZWYpKTtcbiAgICByZXR1cm4gY3JlYXRlT2JqZWN0UmVmZXJlbmNlPFQ+KHJlZiwgdGhpcyk7XG4gIH1cblxuICBjcmVhdGVQdXNoSWQoKSB7XG4gICAgY29uc3QgcmVmID0gdGhpcy5zY2hlZHVsZXJzLm5nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB0aGlzLmRhdGFiYXNlLnJlZigpKTtcbiAgICByZXR1cm4gcmVmLnB1c2goKS5rZXk7XG4gIH1cblxufVxuXG5leHBvcnQge1xuICBQYXRoUmVmZXJlbmNlLFxuICBEYXRhYmFzZVNuYXBzaG90LFxuICBDaGlsZEV2ZW50LFxuICBMaXN0ZW5FdmVudCxcbiAgUXVlcnlGbixcbiAgQW5ndWxhckZpcmVMaXN0LFxuICBBbmd1bGFyRmlyZU9iamVjdCxcbiAgQW5ndWxhckZpcmVBY3Rpb24sXG4gIEFjdGlvbixcbiAgU25hcHNob3RBY3Rpb25cbn0gZnJvbSAnLi9pbnRlcmZhY2VzJztcbiJdfQ==