import { Injectable, Injector, NgZone } from '@angular/core';
import { VERSION } from '@angular/fire';
import { Auth, authState } from '@angular/fire/auth';
import { registerVersion } from 'firebase/app';
import { Analytics } from './analytics';
import { setUserId, isSupported } from './firebase';
import * as i0 from "@angular/core";
import * as i1 from "@angular/fire/auth";
export class UserTrackingService {
    constructor(auth, zone, injector) {
        this.disposables = [];
        registerVersion('angularfire', VERSION.full, 'user-tracking');
        let resolveInitialized;
        this.initialized = zone.runOutsideAngular(() => new Promise(resolve => { resolveInitialized = resolve; }));
        // The APP_INITIALIZER that is making isSupported() sync for the sake of convenient DI
        // may not be done when services are initialized. Guard the functionality by first ensuring
        // that the (global) promise has resolved, then get Analytics from the injector.
        isSupported().then(() => {
            const analytics = injector.get(Analytics);
            if (analytics) {
                this.disposables = [
                    // TODO add credential tracking back in
                    authState(auth).subscribe(user => {
                        setUserId(analytics, user === null || user === void 0 ? void 0 : user.uid);
                        resolveInitialized();
                    }),
                ];
            }
            else {
                resolveInitialized();
            }
        });
    }
    ngOnDestroy() {
        this.disposables.forEach(it => it.unsubscribe());
    }
}
UserTrackingService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: UserTrackingService, deps: [{ token: i1.Auth }, { token: i0.NgZone }, { token: i0.Injector }], target: i0.ɵɵFactoryTarget.Injectable });
UserTrackingService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: UserTrackingService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: UserTrackingService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: i1.Auth }, { type: i0.NgZone }, { type: i0.Injector }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlci10cmFja2luZy5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2FuYWx5dGljcy91c2VyLXRyYWNraW5nLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFhLE1BQU0sZUFBZSxDQUFDO0FBRXhFLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDeEMsT0FBTyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUNyRCxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBRS9DLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFDeEMsT0FBTyxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUUsTUFBTSxZQUFZLENBQUM7OztBQUdwRCxNQUFNLE9BQU8sbUJBQW1CO0lBSzlCLFlBQ0UsSUFBVSxFQUNWLElBQVksRUFDWixRQUFrQjtRQUxaLGdCQUFXLEdBQXdCLEVBQUUsQ0FBQztRQU81QyxlQUFlLENBQUMsYUFBYSxFQUFFLE9BQU8sQ0FBQyxJQUFJLEVBQUUsZUFBZSxDQUFDLENBQUM7UUFDOUQsSUFBSSxrQkFBOEIsQ0FBQztRQUNuQyxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxHQUFHLGtCQUFrQixHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDM0csc0ZBQXNGO1FBQ3RGLDJGQUEyRjtRQUMzRixnRkFBZ0Y7UUFDaEYsV0FBVyxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRTtZQUN0QixNQUFNLFNBQVMsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzFDLElBQUksU0FBUyxFQUFFO2dCQUNiLElBQUksQ0FBQyxXQUFXLEdBQUc7b0JBQ2pCLHVDQUF1QztvQkFDdkMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRTt3QkFDL0IsU0FBUyxDQUFDLFNBQVMsRUFBRSxJQUFJLGFBQUosSUFBSSx1QkFBSixJQUFJLENBQUUsR0FBRyxDQUFDLENBQUM7d0JBQ2hDLGtCQUFrQixFQUFFLENBQUM7b0JBQ3ZCLENBQUMsQ0FBQztpQkFDSCxDQUFDO2FBQ0g7aUJBQU07Z0JBQ0wsa0JBQWtCLEVBQUUsQ0FBQzthQUN0QjtRQUNILENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELFdBQVc7UUFDVCxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO0lBQ25ELENBQUM7O2dIQWxDVSxtQkFBbUI7b0hBQW5CLG1CQUFtQjsyRkFBbkIsbUJBQW1CO2tCQUQvQixVQUFVIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSwgSW5qZWN0b3IsIE5nWm9uZSwgT25EZXN0cm95IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBTdWJzY3JpcHRpb24gfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IFZFUlNJT04gfSBmcm9tICdAYW5ndWxhci9maXJlJztcbmltcG9ydCB7IEF1dGgsIGF1dGhTdGF0ZSB9IGZyb20gJ0Bhbmd1bGFyL2ZpcmUvYXV0aCc7XG5pbXBvcnQgeyByZWdpc3RlclZlcnNpb24gfSBmcm9tICdmaXJlYmFzZS9hcHAnO1xuXG5pbXBvcnQgeyBBbmFseXRpY3MgfSBmcm9tICcuL2FuYWx5dGljcyc7XG5pbXBvcnQgeyBzZXRVc2VySWQsIGlzU3VwcG9ydGVkIH0gZnJvbSAnLi9maXJlYmFzZSc7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBVc2VyVHJhY2tpbmdTZXJ2aWNlIGltcGxlbWVudHMgT25EZXN0cm95IHtcblxuICBwdWJsaWMgcmVhZG9ubHkgaW5pdGlhbGl6ZWQ6IFByb21pc2U8dm9pZD47XG4gIHByaXZhdGUgZGlzcG9zYWJsZXM6IEFycmF5PFN1YnNjcmlwdGlvbj4gPSBbXTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBhdXRoOiBBdXRoLFxuICAgIHpvbmU6IE5nWm9uZSxcbiAgICBpbmplY3RvcjogSW5qZWN0b3IsXG4gICkge1xuICAgIHJlZ2lzdGVyVmVyc2lvbignYW5ndWxhcmZpcmUnLCBWRVJTSU9OLmZ1bGwsICd1c2VyLXRyYWNraW5nJyk7XG4gICAgbGV0IHJlc29sdmVJbml0aWFsaXplZDogKCkgPT4gdm9pZDtcbiAgICB0aGlzLmluaXRpYWxpemVkID0gem9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHsgcmVzb2x2ZUluaXRpYWxpemVkID0gcmVzb2x2ZTsgfSkpO1xuICAgIC8vIFRoZSBBUFBfSU5JVElBTElaRVIgdGhhdCBpcyBtYWtpbmcgaXNTdXBwb3J0ZWQoKSBzeW5jIGZvciB0aGUgc2FrZSBvZiBjb252ZW5pZW50IERJXG4gICAgLy8gbWF5IG5vdCBiZSBkb25lIHdoZW4gc2VydmljZXMgYXJlIGluaXRpYWxpemVkLiBHdWFyZCB0aGUgZnVuY3Rpb25hbGl0eSBieSBmaXJzdCBlbnN1cmluZ1xuICAgIC8vIHRoYXQgdGhlIChnbG9iYWwpIHByb21pc2UgaGFzIHJlc29sdmVkLCB0aGVuIGdldCBBbmFseXRpY3MgZnJvbSB0aGUgaW5qZWN0b3IuXG4gICAgaXNTdXBwb3J0ZWQoKS50aGVuKCgpID0+IHtcbiAgICAgIGNvbnN0IGFuYWx5dGljcyA9IGluamVjdG9yLmdldChBbmFseXRpY3MpO1xuICAgICAgaWYgKGFuYWx5dGljcykge1xuICAgICAgICB0aGlzLmRpc3Bvc2FibGVzID0gW1xuICAgICAgICAgIC8vIFRPRE8gYWRkIGNyZWRlbnRpYWwgdHJhY2tpbmcgYmFjayBpblxuICAgICAgICAgIGF1dGhTdGF0ZShhdXRoKS5zdWJzY3JpYmUodXNlciA9PiB7XG4gICAgICAgICAgICBzZXRVc2VySWQoYW5hbHl0aWNzLCB1c2VyPy51aWQpO1xuICAgICAgICAgICAgcmVzb2x2ZUluaXRpYWxpemVkKCk7XG4gICAgICAgICAgfSksXG4gICAgICAgIF07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXNvbHZlSW5pdGlhbGl6ZWQoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIHRoaXMuZGlzcG9zYWJsZXMuZm9yRWFjaChpdCA9PiBpdC51bnN1YnNjcmliZSgpKTtcbiAgfVxufVxuIl19