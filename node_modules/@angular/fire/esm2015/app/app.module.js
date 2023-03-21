import { Inject, InjectionToken, Injector, NgModule, NgZone, Optional, PLATFORM_ID, VERSION as NG_VERSION, } from '@angular/core';
import { getApp, registerVersion } from 'firebase/app';
import { FirebaseApp, FirebaseApps } from './app';
import { VERSION, ɵAngularFireSchedulers } from '@angular/fire';
import * as i0 from "@angular/core";
export function defaultFirebaseAppFactory(provided) {
    // Use the provided app, if there is only one, otherwise fetch the default app
    if (provided && provided.length === 1) {
        return provided[0];
    }
    return new FirebaseApp(getApp());
}
// With FIREBASE_APPS I wanted to capture the default app instance, if it is initialized by
// the reserved URL; ɵPROVIDED_FIREBASE_APPS is not for public consumption and serves to ensure that all
// provideFirebaseApp(...) calls are satisfied before FirebaseApp$ or FirebaseApp is resolved
export const PROVIDED_FIREBASE_APPS = new InjectionToken('angularfire2._apps');
// Injecting FirebaseApp will now only inject the default Firebase App
// this allows allows beginners to import /__/firebase/init.js to auto initialize Firebase App
// from the reserved URL.
const DEFAULT_FIREBASE_APP_PROVIDER = {
    provide: FirebaseApp,
    useFactory: defaultFirebaseAppFactory,
    deps: [
        [new Optional(), PROVIDED_FIREBASE_APPS],
    ],
};
const FIREBASE_APPS_PROVIDER = {
    provide: FirebaseApps,
    deps: [
        [new Optional(), PROVIDED_FIREBASE_APPS],
    ],
};
export function firebaseAppFactory(fn) {
    return (zone, injector) => {
        const app = zone.runOutsideAngular(() => fn(injector));
        return new FirebaseApp(app);
    };
}
export class FirebaseAppModule {
    // tslint:disable-next-line:ban-types
    constructor(platformId) {
        registerVersion('angularfire', VERSION.full, 'core');
        registerVersion('angularfire', VERSION.full, 'app');
        registerVersion('angular', NG_VERSION.full, platformId.toString());
    }
}
FirebaseAppModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: FirebaseAppModule, deps: [{ token: PLATFORM_ID }], target: i0.ɵɵFactoryTarget.NgModule });
FirebaseAppModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: FirebaseAppModule });
FirebaseAppModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: FirebaseAppModule, providers: [
        DEFAULT_FIREBASE_APP_PROVIDER,
        FIREBASE_APPS_PROVIDER,
    ] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: FirebaseAppModule, decorators: [{
            type: NgModule,
            args: [{
                    providers: [
                        DEFAULT_FIREBASE_APP_PROVIDER,
                        FIREBASE_APPS_PROVIDER,
                    ]
                }]
        }], ctorParameters: function () { return [{ type: Object, decorators: [{
                    type: Inject,
                    args: [PLATFORM_ID]
                }] }]; } });
// Calling initializeApp({ ... }, 'name') multiple times will add more FirebaseApps into the FIREBASE_APPS
// injection scope. This allows developers to more easily work with multiple Firebase Applications. Downside
// is that DI for app name and options doesn't really make sense anymore.
export function provideFirebaseApp(fn, ...deps) {
    return {
        ngModule: FirebaseAppModule,
        providers: [{
                provide: PROVIDED_FIREBASE_APPS,
                useFactory: firebaseAppFactory(fn),
                multi: true,
                deps: [
                    NgZone,
                    Injector,
                    ɵAngularFireSchedulers,
                    ...deps,
                ],
            }],
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLm1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9hcHAvYXBwLm1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQ0wsTUFBTSxFQUNOLGNBQWMsRUFDZCxRQUFRLEVBRVIsUUFBUSxFQUNSLE1BQU0sRUFDTixRQUFRLEVBQ1IsV0FBVyxFQUNYLE9BQU8sSUFBSSxVQUFVLEdBQ3RCLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBK0IsTUFBTSxFQUFFLGVBQWUsRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUVwRixPQUFPLEVBQUUsV0FBVyxFQUFFLFlBQVksRUFBRSxNQUFNLE9BQU8sQ0FBQztBQUNsRCxPQUFPLEVBQUUsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sZUFBZSxDQUFDOztBQUVoRSxNQUFNLFVBQVUseUJBQXlCLENBQUMsUUFBaUM7SUFDekUsOEVBQThFO0lBQzlFLElBQUksUUFBUSxJQUFJLFFBQVEsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1FBQUUsT0FBTyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FBRTtJQUM5RCxPQUFPLElBQUksV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7QUFDbkMsQ0FBQztBQUVELDJGQUEyRjtBQUMzRix3R0FBd0c7QUFDeEcsNkZBQTZGO0FBQzdGLE1BQU0sQ0FBQyxNQUFNLHNCQUFzQixHQUFHLElBQUksY0FBYyxDQUFxQixvQkFBb0IsQ0FBQyxDQUFDO0FBRW5HLHNFQUFzRTtBQUN0RSw4RkFBOEY7QUFDOUYseUJBQXlCO0FBQ3pCLE1BQU0sNkJBQTZCLEdBQUc7SUFDcEMsT0FBTyxFQUFFLFdBQVc7SUFDcEIsVUFBVSxFQUFFLHlCQUF5QjtJQUNyQyxJQUFJLEVBQUU7UUFDSixDQUFDLElBQUksUUFBUSxFQUFFLEVBQUUsc0JBQXNCLENBQUU7S0FDMUM7Q0FDRixDQUFDO0FBRUYsTUFBTSxzQkFBc0IsR0FBRztJQUM3QixPQUFPLEVBQUUsWUFBWTtJQUNyQixJQUFJLEVBQUU7UUFDSixDQUFDLElBQUksUUFBUSxFQUFFLEVBQUUsc0JBQXNCLENBQUU7S0FDMUM7Q0FDRixDQUFDO0FBRUYsTUFBTSxVQUFVLGtCQUFrQixDQUFDLEVBQXdDO0lBQ3pFLE9BQU8sQ0FBQyxJQUFZLEVBQUUsUUFBa0IsRUFBRSxFQUFFO1FBQzFDLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUN2RCxPQUFPLElBQUksV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQzlCLENBQUMsQ0FBQztBQUNKLENBQUM7QUFRRCxNQUFNLE9BQU8saUJBQWlCO0lBQzVCLHFDQUFxQztJQUNyQyxZQUFpQyxVQUFrQjtRQUNqRCxlQUFlLENBQUMsYUFBYSxFQUFFLE9BQU8sQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDckQsZUFBZSxDQUFDLGFBQWEsRUFBRSxPQUFPLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3BELGVBQWUsQ0FBQyxTQUFTLEVBQUUsVUFBVSxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztJQUNyRSxDQUFDOzs4R0FOVSxpQkFBaUIsa0JBRVIsV0FBVzsrR0FGcEIsaUJBQWlCOytHQUFqQixpQkFBaUIsYUFMakI7UUFDVCw2QkFBNkI7UUFDN0Isc0JBQXNCO0tBQ3ZCOzJGQUVVLGlCQUFpQjtrQkFON0IsUUFBUTttQkFBQztvQkFDUixTQUFTLEVBQUU7d0JBQ1QsNkJBQTZCO3dCQUM3QixzQkFBc0I7cUJBQ3ZCO2lCQUNGOzBEQUc4QyxNQUFNOzBCQUF0QyxNQUFNOzJCQUFDLFdBQVc7O0FBT2pDLDBHQUEwRztBQUMxRyw0R0FBNEc7QUFDNUcseUVBQXlFO0FBQ3pFLE1BQU0sVUFBVSxrQkFBa0IsQ0FBQyxFQUF3QyxFQUFFLEdBQUcsSUFBVztJQUN6RixPQUFPO1FBQ0wsUUFBUSxFQUFFLGlCQUFpQjtRQUMzQixTQUFTLEVBQUUsQ0FBQztnQkFDVixPQUFPLEVBQUUsc0JBQXNCO2dCQUMvQixVQUFVLEVBQUUsa0JBQWtCLENBQUMsRUFBRSxDQUFDO2dCQUNsQyxLQUFLLEVBQUUsSUFBSTtnQkFDWCxJQUFJLEVBQUU7b0JBQ0osTUFBTTtvQkFDTixRQUFRO29CQUNSLHNCQUFzQjtvQkFDdEIsR0FBRyxJQUFJO2lCQUNSO2FBQ0YsQ0FBQztLQUNILENBQUM7QUFDSixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgSW5qZWN0LFxuICBJbmplY3Rpb25Ub2tlbixcbiAgSW5qZWN0b3IsXG4gIE1vZHVsZVdpdGhQcm92aWRlcnMsXG4gIE5nTW9kdWxlLFxuICBOZ1pvbmUsXG4gIE9wdGlvbmFsLFxuICBQTEFURk9STV9JRCxcbiAgVkVSU0lPTiBhcyBOR19WRVJTSU9OLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEZpcmViYXNlQXBwIGFzIElGaXJlYmFzZUFwcCwgZ2V0QXBwLCByZWdpc3RlclZlcnNpb24gfSBmcm9tICdmaXJlYmFzZS9hcHAnO1xuXG5pbXBvcnQgeyBGaXJlYmFzZUFwcCwgRmlyZWJhc2VBcHBzIH0gZnJvbSAnLi9hcHAnO1xuaW1wb3J0IHsgVkVSU0lPTiwgybVBbmd1bGFyRmlyZVNjaGVkdWxlcnMgfSBmcm9tICdAYW5ndWxhci9maXJlJztcblxuZXhwb3J0IGZ1bmN0aW9uIGRlZmF1bHRGaXJlYmFzZUFwcEZhY3RvcnkocHJvdmlkZWQ6IEZpcmViYXNlQXBwW118dW5kZWZpbmVkKSB7XG4gIC8vIFVzZSB0aGUgcHJvdmlkZWQgYXBwLCBpZiB0aGVyZSBpcyBvbmx5IG9uZSwgb3RoZXJ3aXNlIGZldGNoIHRoZSBkZWZhdWx0IGFwcFxuICBpZiAocHJvdmlkZWQgJiYgcHJvdmlkZWQubGVuZ3RoID09PSAxKSB7IHJldHVybiBwcm92aWRlZFswXTsgfVxuICByZXR1cm4gbmV3IEZpcmViYXNlQXBwKGdldEFwcCgpKTtcbn1cblxuLy8gV2l0aCBGSVJFQkFTRV9BUFBTIEkgd2FudGVkIHRvIGNhcHR1cmUgdGhlIGRlZmF1bHQgYXBwIGluc3RhbmNlLCBpZiBpdCBpcyBpbml0aWFsaXplZCBieVxuLy8gdGhlIHJlc2VydmVkIFVSTDsgybVQUk9WSURFRF9GSVJFQkFTRV9BUFBTIGlzIG5vdCBmb3IgcHVibGljIGNvbnN1bXB0aW9uIGFuZCBzZXJ2ZXMgdG8gZW5zdXJlIHRoYXQgYWxsXG4vLyBwcm92aWRlRmlyZWJhc2VBcHAoLi4uKSBjYWxscyBhcmUgc2F0aXNmaWVkIGJlZm9yZSBGaXJlYmFzZUFwcCQgb3IgRmlyZWJhc2VBcHAgaXMgcmVzb2x2ZWRcbmV4cG9ydCBjb25zdCBQUk9WSURFRF9GSVJFQkFTRV9BUFBTID0gbmV3IEluamVjdGlvblRva2VuPEFycmF5PEZpcmViYXNlQXBwPj4oJ2FuZ3VsYXJmaXJlMi5fYXBwcycpO1xuXG4vLyBJbmplY3RpbmcgRmlyZWJhc2VBcHAgd2lsbCBub3cgb25seSBpbmplY3QgdGhlIGRlZmF1bHQgRmlyZWJhc2UgQXBwXG4vLyB0aGlzIGFsbG93cyBhbGxvd3MgYmVnaW5uZXJzIHRvIGltcG9ydCAvX18vZmlyZWJhc2UvaW5pdC5qcyB0byBhdXRvIGluaXRpYWxpemUgRmlyZWJhc2UgQXBwXG4vLyBmcm9tIHRoZSByZXNlcnZlZCBVUkwuXG5jb25zdCBERUZBVUxUX0ZJUkVCQVNFX0FQUF9QUk9WSURFUiA9IHtcbiAgcHJvdmlkZTogRmlyZWJhc2VBcHAsXG4gIHVzZUZhY3Rvcnk6IGRlZmF1bHRGaXJlYmFzZUFwcEZhY3RvcnksXG4gIGRlcHM6IFtcbiAgICBbbmV3IE9wdGlvbmFsKCksIFBST1ZJREVEX0ZJUkVCQVNFX0FQUFMgXSxcbiAgXSxcbn07XG5cbmNvbnN0IEZJUkVCQVNFX0FQUFNfUFJPVklERVIgPSB7XG4gIHByb3ZpZGU6IEZpcmViYXNlQXBwcyxcbiAgZGVwczogW1xuICAgIFtuZXcgT3B0aW9uYWwoKSwgUFJPVklERURfRklSRUJBU0VfQVBQUyBdLFxuICBdLFxufTtcblxuZXhwb3J0IGZ1bmN0aW9uIGZpcmViYXNlQXBwRmFjdG9yeShmbjogKGluamVjdG9yOiBJbmplY3RvcikgPT4gSUZpcmViYXNlQXBwKSB7XG4gIHJldHVybiAoem9uZTogTmdab25lLCBpbmplY3RvcjogSW5qZWN0b3IpID0+IHtcbiAgICBjb25zdCBhcHAgPSB6b25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IGZuKGluamVjdG9yKSk7XG4gICAgcmV0dXJuIG5ldyBGaXJlYmFzZUFwcChhcHApO1xuICB9O1xufVxuXG5ATmdNb2R1bGUoe1xuICBwcm92aWRlcnM6IFtcbiAgICBERUZBVUxUX0ZJUkVCQVNFX0FQUF9QUk9WSURFUixcbiAgICBGSVJFQkFTRV9BUFBTX1BST1ZJREVSLFxuICBdXG59KVxuZXhwb3J0IGNsYXNzIEZpcmViYXNlQXBwTW9kdWxlIHtcbiAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOmJhbi10eXBlc1xuICBjb25zdHJ1Y3RvcihASW5qZWN0KFBMQVRGT1JNX0lEKSBwbGF0Zm9ybUlkOiBPYmplY3QpIHtcbiAgICByZWdpc3RlclZlcnNpb24oJ2FuZ3VsYXJmaXJlJywgVkVSU0lPTi5mdWxsLCAnY29yZScpO1xuICAgIHJlZ2lzdGVyVmVyc2lvbignYW5ndWxhcmZpcmUnLCBWRVJTSU9OLmZ1bGwsICdhcHAnKTtcbiAgICByZWdpc3RlclZlcnNpb24oJ2FuZ3VsYXInLCBOR19WRVJTSU9OLmZ1bGwsIHBsYXRmb3JtSWQudG9TdHJpbmcoKSk7XG4gIH1cbn1cblxuLy8gQ2FsbGluZyBpbml0aWFsaXplQXBwKHsgLi4uIH0sICduYW1lJykgbXVsdGlwbGUgdGltZXMgd2lsbCBhZGQgbW9yZSBGaXJlYmFzZUFwcHMgaW50byB0aGUgRklSRUJBU0VfQVBQU1xuLy8gaW5qZWN0aW9uIHNjb3BlLiBUaGlzIGFsbG93cyBkZXZlbG9wZXJzIHRvIG1vcmUgZWFzaWx5IHdvcmsgd2l0aCBtdWx0aXBsZSBGaXJlYmFzZSBBcHBsaWNhdGlvbnMuIERvd25zaWRlXG4vLyBpcyB0aGF0IERJIGZvciBhcHAgbmFtZSBhbmQgb3B0aW9ucyBkb2Vzbid0IHJlYWxseSBtYWtlIHNlbnNlIGFueW1vcmUuXG5leHBvcnQgZnVuY3Rpb24gcHJvdmlkZUZpcmViYXNlQXBwKGZuOiAoaW5qZWN0b3I6IEluamVjdG9yKSA9PiBJRmlyZWJhc2VBcHAsIC4uLmRlcHM6IGFueVtdKTogTW9kdWxlV2l0aFByb3ZpZGVyczxGaXJlYmFzZUFwcE1vZHVsZT4ge1xuICByZXR1cm4ge1xuICAgIG5nTW9kdWxlOiBGaXJlYmFzZUFwcE1vZHVsZSxcbiAgICBwcm92aWRlcnM6IFt7XG4gICAgICBwcm92aWRlOiBQUk9WSURFRF9GSVJFQkFTRV9BUFBTLFxuICAgICAgdXNlRmFjdG9yeTogZmlyZWJhc2VBcHBGYWN0b3J5KGZuKSxcbiAgICAgIG11bHRpOiB0cnVlLFxuICAgICAgZGVwczogW1xuICAgICAgICBOZ1pvbmUsXG4gICAgICAgIEluamVjdG9yLFxuICAgICAgICDJtUFuZ3VsYXJGaXJlU2NoZWR1bGVycyxcbiAgICAgICAgLi4uZGVwcyxcbiAgICAgIF0sXG4gICAgfV0sXG4gIH07XG59XG4iXX0=