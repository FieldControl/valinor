import { Inject, Injectable, InjectionToken, NgZone, Optional } from '@angular/core';
import { from, of } from 'rxjs';
import { map, observeOn, shareReplay, switchMap } from 'rxjs/operators';
import { ɵAngularFireSchedulers } from '@angular/fire';
import { ɵlazySDKProxy, ɵapplyMixins } from '@angular/fire/compat';
import { ɵfirebaseAppFactory, FIREBASE_APP_NAME, FIREBASE_OPTIONS, ɵcacheInstance } from '@angular/fire/compat';
import { proxyPolyfillCompat } from './base';
import { AppCheckInstances } from '@angular/fire/app-check';
import * as i0 from "@angular/core";
import * as i1 from "@angular/fire";
import * as i2 from "@angular/fire/app-check";
export const ORIGIN = new InjectionToken('angularfire2.functions.origin');
export const REGION = new InjectionToken('angularfire2.functions.region');
export const USE_EMULATOR = new InjectionToken('angularfire2.functions.use-emulator');
export class AngularFireFunctions {
    constructor(options, name, zone, schedulers, region, origin, _useEmulator, // can't use the tuple here
    _appCheckInstances) {
        const useEmulator = _useEmulator;
        const functions = of(undefined).pipe(observeOn(schedulers.outsideAngular), switchMap(() => import('firebase/compat/functions')), map(() => ɵfirebaseAppFactory(options, zone, name)), map(app => ɵcacheInstance(`${app.name}.functions.${region || origin}`, 'AngularFireFunctions', app.name, () => {
            let functions;
            if (region && origin) {
                throw new Error('REGION and ORIGIN can\'t be used at the same time.');
            }
            functions = app.functions(region || origin || undefined);
            if (useEmulator) {
                functions.useEmulator(...useEmulator);
            }
            return functions;
        }, [region, origin, useEmulator])), shareReplay({ bufferSize: 1, refCount: false }));
        this.httpsCallable = (name, options) => (data) => from(functions).pipe(observeOn(schedulers.insideAngular), switchMap(functions => functions.httpsCallable(name, options)(data)), map(r => r.data));
        return ɵlazySDKProxy(this, functions, zone);
    }
}
AngularFireFunctions.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: AngularFireFunctions, deps: [{ token: FIREBASE_OPTIONS }, { token: FIREBASE_APP_NAME, optional: true }, { token: i0.NgZone }, { token: i1.ɵAngularFireSchedulers }, { token: REGION, optional: true }, { token: ORIGIN, optional: true }, { token: USE_EMULATOR, optional: true }, { token: i2.AppCheckInstances, optional: true }], target: i0.ɵɵFactoryTarget.Injectable });
AngularFireFunctions.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: AngularFireFunctions, providedIn: 'any' });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: AngularFireFunctions, decorators: [{
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
                }] }, { type: i0.NgZone }, { type: i1.ɵAngularFireSchedulers }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [REGION]
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [ORIGIN]
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [USE_EMULATOR]
                }] }, { type: i2.AppCheckInstances, decorators: [{
                    type: Optional
                }] }]; } });
ɵapplyMixins(AngularFireFunctions, [proxyPolyfillCompat]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnVuY3Rpb25zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2NvbXBhdC9mdW5jdGlvbnMvZnVuY3Rpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLGNBQWMsRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3JGLE9BQU8sRUFBRSxJQUFJLEVBQWMsRUFBRSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQzVDLE9BQU8sRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBRSxTQUFTLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUN4RSxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDdkQsT0FBTyxFQUFFLGFBQWEsRUFBaUIsWUFBWSxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFFbEYsT0FBTyxFQUFFLG1CQUFtQixFQUFFLGlCQUFpQixFQUFFLGdCQUFnQixFQUFFLGNBQWMsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBRWhILE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLFFBQVEsQ0FBQztBQUU3QyxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQzs7OztBQUU1RCxNQUFNLENBQUMsTUFBTSxNQUFNLEdBQUcsSUFBSSxjQUFjLENBQVMsK0JBQStCLENBQUMsQ0FBQztBQUNsRixNQUFNLENBQUMsTUFBTSxNQUFNLEdBQUcsSUFBSSxjQUFjLENBQVMsK0JBQStCLENBQUMsQ0FBQztBQUdsRixNQUFNLENBQUMsTUFBTSxZQUFZLEdBQUcsSUFBSSxjQUFjLENBQXVCLHFDQUFxQyxDQUFDLENBQUM7QUFTNUcsTUFBTSxPQUFPLG9CQUFvQjtJQUkvQixZQUM0QixPQUF3QixFQUNYLElBQStCLEVBQ3RFLElBQVksRUFDWixVQUFrQyxFQUNOLE1BQXFCLEVBQ3JCLE1BQXFCLEVBQ2YsWUFBaUIsRUFBRSwyQkFBMkI7SUFDcEUsa0JBQXFDO1FBRWpELE1BQU0sV0FBVyxHQUFnQyxZQUFZLENBQUM7UUFFOUQsTUFBTSxTQUFTLEdBQUcsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FDbEMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUMsRUFDcEMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQywyQkFBMkIsQ0FBQyxDQUFDLEVBQ3BELEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQ25ELEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLGNBQWMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxJQUFJLGNBQWMsTUFBTSxJQUFJLE1BQU0sRUFBRSxFQUFFLHNCQUFzQixFQUFFLEdBQUcsQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFO1lBQzVHLElBQUksU0FBdUMsQ0FBQztZQUM1QyxJQUFJLE1BQU0sSUFBSSxNQUFNLEVBQUU7Z0JBQ3BCLE1BQU0sSUFBSSxLQUFLLENBQUMsb0RBQW9ELENBQUMsQ0FBQzthQUN2RTtZQUNELFNBQVMsR0FBRyxHQUFHLENBQUMsU0FBUyxDQUFDLE1BQU0sSUFBSSxNQUFNLElBQUksU0FBUyxDQUFDLENBQUM7WUFDekQsSUFBSSxXQUFXLEVBQUU7Z0JBQ2YsU0FBUyxDQUFDLFdBQVcsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxDQUFDO2FBQ3ZDO1lBQ0QsT0FBTyxTQUFTLENBQUM7UUFDbkIsQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFDLEVBQ2xDLFdBQVcsQ0FBQyxFQUFFLFVBQVUsRUFBRSxDQUFDLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQ2hELENBQUM7UUFFRixJQUFJLENBQUMsYUFBYSxHQUFHLENBQW1CLElBQVksRUFBRSxPQUE4QixFQUFFLEVBQUUsQ0FDdEYsQ0FBQyxJQUFPLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQy9CLFNBQVMsQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLEVBQ25DLFNBQVMsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQ3BFLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFTLENBQUMsQ0FDdEIsQ0FBQztRQUVKLE9BQU8sYUFBYSxDQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFFOUMsQ0FBQzs7aUhBM0NVLG9CQUFvQixrQkFLckIsZ0JBQWdCLGFBQ0osaUJBQWlCLHlGQUdqQixNQUFNLDZCQUNOLE1BQU0sNkJBQ04sWUFBWTtxSEFYdkIsb0JBQW9CLGNBRm5CLEtBQUs7MkZBRU4sb0JBQW9CO2tCQUhoQyxVQUFVO21CQUFDO29CQUNWLFVBQVUsRUFBRSxLQUFLO2lCQUNsQjs7MEJBTUksTUFBTTsyQkFBQyxnQkFBZ0I7OzBCQUN2QixRQUFROzswQkFBSSxNQUFNOzJCQUFDLGlCQUFpQjs7MEJBR3BDLFFBQVE7OzBCQUFJLE1BQU07MkJBQUMsTUFBTTs7MEJBQ3pCLFFBQVE7OzBCQUFJLE1BQU07MkJBQUMsTUFBTTs7MEJBQ3pCLFFBQVE7OzBCQUFJLE1BQU07MkJBQUMsWUFBWTs7MEJBQy9CLFFBQVE7O0FBbUNiLFlBQVksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdCwgSW5qZWN0YWJsZSwgSW5qZWN0aW9uVG9rZW4sIE5nWm9uZSwgT3B0aW9uYWwgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IGZyb20sIE9ic2VydmFibGUsIG9mIH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBtYXAsIG9ic2VydmVPbiwgc2hhcmVSZXBsYXksIHN3aXRjaE1hcCB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7IMm1QW5ndWxhckZpcmVTY2hlZHVsZXJzIH0gZnJvbSAnQGFuZ3VsYXIvZmlyZSc7XG5pbXBvcnQgeyDJtWxhenlTREtQcm94eSwgybVQcm9taXNlUHJveHksIMm1YXBwbHlNaXhpbnMgfSBmcm9tICdAYW5ndWxhci9maXJlL2NvbXBhdCc7XG5pbXBvcnQgeyBGaXJlYmFzZU9wdGlvbnMgfSBmcm9tICdmaXJlYmFzZS9hcHAnO1xuaW1wb3J0IHsgybVmaXJlYmFzZUFwcEZhY3RvcnksIEZJUkVCQVNFX0FQUF9OQU1FLCBGSVJFQkFTRV9PUFRJT05TLCDJtWNhY2hlSW5zdGFuY2UgfSBmcm9tICdAYW5ndWxhci9maXJlL2NvbXBhdCc7XG5pbXBvcnQgZmlyZWJhc2UgZnJvbSAnZmlyZWJhc2UvY29tcGF0L2FwcCc7XG5pbXBvcnQgeyBwcm94eVBvbHlmaWxsQ29tcGF0IH0gZnJvbSAnLi9iYXNlJztcbmltcG9ydCB7IEh0dHBzQ2FsbGFibGVPcHRpb25zIH0gZnJvbSAnQGZpcmViYXNlL2Z1bmN0aW9ucy10eXBlcyc7XG5pbXBvcnQgeyBBcHBDaGVja0luc3RhbmNlcyB9IGZyb20gJ0Bhbmd1bGFyL2ZpcmUvYXBwLWNoZWNrJztcblxuZXhwb3J0IGNvbnN0IE9SSUdJTiA9IG5ldyBJbmplY3Rpb25Ub2tlbjxzdHJpbmc+KCdhbmd1bGFyZmlyZTIuZnVuY3Rpb25zLm9yaWdpbicpO1xuZXhwb3J0IGNvbnN0IFJFR0lPTiA9IG5ldyBJbmplY3Rpb25Ub2tlbjxzdHJpbmc+KCdhbmd1bGFyZmlyZTIuZnVuY3Rpb25zLnJlZ2lvbicpO1xuXG50eXBlIFVzZUVtdWxhdG9yQXJndW1lbnRzID0gUGFyYW1ldGVyczxmaXJlYmFzZS5mdW5jdGlvbnMuRnVuY3Rpb25zWyd1c2VFbXVsYXRvciddPjtcbmV4cG9ydCBjb25zdCBVU0VfRU1VTEFUT1IgPSBuZXcgSW5qZWN0aW9uVG9rZW48VXNlRW11bGF0b3JBcmd1bWVudHM+KCdhbmd1bGFyZmlyZTIuZnVuY3Rpb25zLnVzZS1lbXVsYXRvcicpO1xuXG4vLyBvdmVycmlkZSBodHRwc0NhbGxhYmxlIGZvciBjb21wYXRpYmlsaXR5IHdpdGggNS54XG5leHBvcnQgaW50ZXJmYWNlIEFuZ3VsYXJGaXJlRnVuY3Rpb25zIGV4dGVuZHMgT21pdDzJtVByb21pc2VQcm94eTxmaXJlYmFzZS5mdW5jdGlvbnMuRnVuY3Rpb25zPiwgJ2h0dHBzQ2FsbGFibGUnPiB7XG59XG5cbkBJbmplY3RhYmxlKHtcbiAgcHJvdmlkZWRJbjogJ2FueSdcbn0pXG5leHBvcnQgY2xhc3MgQW5ndWxhckZpcmVGdW5jdGlvbnMge1xuXG4gIHB1YmxpYyByZWFkb25seSBodHRwc0NhbGxhYmxlOiA8VCA9IGFueSwgUiA9IGFueT4obmFtZTogc3RyaW5nLCBvcHRpb25zPzogSHR0cHNDYWxsYWJsZU9wdGlvbnMpID0+IChkYXRhOiBUKSA9PiBPYnNlcnZhYmxlPFI+O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIEBJbmplY3QoRklSRUJBU0VfT1BUSU9OUykgb3B0aW9uczogRmlyZWJhc2VPcHRpb25zLFxuICAgIEBPcHRpb25hbCgpIEBJbmplY3QoRklSRUJBU0VfQVBQX05BTUUpIG5hbWU6IHN0cmluZyB8IG51bGwgfCB1bmRlZmluZWQsXG4gICAgem9uZTogTmdab25lLFxuICAgIHNjaGVkdWxlcnM6IMm1QW5ndWxhckZpcmVTY2hlZHVsZXJzLFxuICAgIEBPcHRpb25hbCgpIEBJbmplY3QoUkVHSU9OKSByZWdpb246IHN0cmluZyB8IG51bGwsXG4gICAgQE9wdGlvbmFsKCkgQEluamVjdChPUklHSU4pIG9yaWdpbjogc3RyaW5nIHwgbnVsbCxcbiAgICBAT3B0aW9uYWwoKSBASW5qZWN0KFVTRV9FTVVMQVRPUikgX3VzZUVtdWxhdG9yOiBhbnksIC8vIGNhbid0IHVzZSB0aGUgdHVwbGUgaGVyZVxuICAgIEBPcHRpb25hbCgpIF9hcHBDaGVja0luc3RhbmNlczogQXBwQ2hlY2tJbnN0YW5jZXMsXG4gICkge1xuICAgIGNvbnN0IHVzZUVtdWxhdG9yOiBVc2VFbXVsYXRvckFyZ3VtZW50cyB8IG51bGwgPSBfdXNlRW11bGF0b3I7XG5cbiAgICBjb25zdCBmdW5jdGlvbnMgPSBvZih1bmRlZmluZWQpLnBpcGUoXG4gICAgICBvYnNlcnZlT24oc2NoZWR1bGVycy5vdXRzaWRlQW5ndWxhciksXG4gICAgICBzd2l0Y2hNYXAoKCkgPT4gaW1wb3J0KCdmaXJlYmFzZS9jb21wYXQvZnVuY3Rpb25zJykpLFxuICAgICAgbWFwKCgpID0+IMm1ZmlyZWJhc2VBcHBGYWN0b3J5KG9wdGlvbnMsIHpvbmUsIG5hbWUpKSxcbiAgICAgIG1hcChhcHAgPT4gybVjYWNoZUluc3RhbmNlKGAke2FwcC5uYW1lfS5mdW5jdGlvbnMuJHtyZWdpb24gfHwgb3JpZ2lufWAsICdBbmd1bGFyRmlyZUZ1bmN0aW9ucycsIGFwcC5uYW1lLCAoKSA9PiB7XG4gICAgICAgIGxldCBmdW5jdGlvbnM6IGZpcmViYXNlLmZ1bmN0aW9ucy5GdW5jdGlvbnM7XG4gICAgICAgIGlmIChyZWdpb24gJiYgb3JpZ2luKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdSRUdJT04gYW5kIE9SSUdJTiBjYW5cXCd0IGJlIHVzZWQgYXQgdGhlIHNhbWUgdGltZS4nKTtcbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbnMgPSBhcHAuZnVuY3Rpb25zKHJlZ2lvbiB8fCBvcmlnaW4gfHwgdW5kZWZpbmVkKTtcbiAgICAgICAgaWYgKHVzZUVtdWxhdG9yKSB7XG4gICAgICAgICAgZnVuY3Rpb25zLnVzZUVtdWxhdG9yKC4uLnVzZUVtdWxhdG9yKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZnVuY3Rpb25zO1xuICAgICAgfSwgW3JlZ2lvbiwgb3JpZ2luLCB1c2VFbXVsYXRvcl0pKSxcbiAgICAgIHNoYXJlUmVwbGF5KHsgYnVmZmVyU2l6ZTogMSwgcmVmQ291bnQ6IGZhbHNlIH0pXG4gICAgKTtcblxuICAgIHRoaXMuaHR0cHNDYWxsYWJsZSA9IDxUID0gYW55LCBSID0gYW55PihuYW1lOiBzdHJpbmcsIG9wdGlvbnM/OiBIdHRwc0NhbGxhYmxlT3B0aW9ucykgPT5cbiAgICAgIChkYXRhOiBUKSA9PiBmcm9tKGZ1bmN0aW9ucykucGlwZShcbiAgICAgICAgb2JzZXJ2ZU9uKHNjaGVkdWxlcnMuaW5zaWRlQW5ndWxhciksXG4gICAgICAgIHN3aXRjaE1hcChmdW5jdGlvbnMgPT4gZnVuY3Rpb25zLmh0dHBzQ2FsbGFibGUobmFtZSwgb3B0aW9ucykoZGF0YSkpLFxuICAgICAgICBtYXAociA9PiByLmRhdGEgYXMgUilcbiAgICAgICk7XG5cbiAgICByZXR1cm4gybVsYXp5U0RLUHJveHkodGhpcywgZnVuY3Rpb25zLCB6b25lKTtcblxuICB9XG5cbn1cblxuybVhcHBseU1peGlucyhBbmd1bGFyRmlyZUZ1bmN0aW9ucywgW3Byb3h5UG9seWZpbGxDb21wYXRdKTtcbiJdfQ==