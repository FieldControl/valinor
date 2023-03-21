import { InjectionToken, Inject, isDevMode, NgModule, NgZone, Optional, PLATFORM_ID, VERSION as NG_VERSION } from '@angular/core';
import firebase from 'firebase/compat/app';
import { VERSION } from '@angular/fire';
import { FirebaseApp } from './firebase.app';
import * as i0 from "@angular/core";
export const FIREBASE_OPTIONS = new InjectionToken('angularfire2.app.options');
export const FIREBASE_APP_NAME = new InjectionToken('angularfire2.app.name');
export function ɵfirebaseAppFactory(options, zone, nameOrConfig) {
    const name = typeof nameOrConfig === 'string' && nameOrConfig || '[DEFAULT]';
    const config = typeof nameOrConfig === 'object' && nameOrConfig || {};
    config.name = config.name || name;
    // Added any due to some inconsistency between @firebase/app and firebase types
    const existingApp = firebase.apps.filter(app => app && app.name === config.name)[0];
    // We support FirebaseConfig, initializeApp's public type only accepts string; need to cast as any
    // Could be solved with https://github.com/firebase/firebase-js-sdk/pull/1206
    const app = (existingApp || zone.runOutsideAngular(() => firebase.initializeApp(options, config)));
    try {
        if (JSON.stringify(options) !== JSON.stringify(app.options)) {
            const hmr = !!module.hot;
            log('error', `${app.name} Firebase App already initialized with different options${hmr ? ', you may need to reload as Firebase is not HMR aware.' : '.'}`);
        }
    }
    catch (e) { }
    return new FirebaseApp(app);
}
const log = (level, ...args) => {
    if (isDevMode() && typeof console !== 'undefined') {
        console[level](...args);
    }
};
const FIREBASE_APP_PROVIDER = {
    provide: FirebaseApp,
    useFactory: ɵfirebaseAppFactory,
    deps: [
        FIREBASE_OPTIONS,
        NgZone,
        [new Optional(), FIREBASE_APP_NAME]
    ]
};
export class AngularFireModule {
    // tslint:disable-next-line:ban-types
    constructor(platformId) {
        firebase.registerVersion('angularfire', VERSION.full, 'core');
        firebase.registerVersion('angularfire', VERSION.full, 'app-compat');
        firebase.registerVersion('angular', NG_VERSION.full, platformId.toString());
    }
    static initializeApp(options, nameOrConfig) {
        return {
            ngModule: AngularFireModule,
            providers: [
                { provide: FIREBASE_OPTIONS, useValue: options },
                { provide: FIREBASE_APP_NAME, useValue: nameOrConfig }
            ]
        };
    }
}
AngularFireModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: AngularFireModule, deps: [{ token: PLATFORM_ID }], target: i0.ɵɵFactoryTarget.NgModule });
AngularFireModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: AngularFireModule });
AngularFireModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: AngularFireModule, providers: [FIREBASE_APP_PROVIDER] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: AngularFireModule, decorators: [{
            type: NgModule,
            args: [{
                    providers: [FIREBASE_APP_PROVIDER]
                }]
        }], ctorParameters: function () { return [{ type: Object, decorators: [{
                    type: Inject,
                    args: [PLATFORM_ID]
                }] }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlyZWJhc2UuYXBwLm1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wYXQvZmlyZWJhc2UuYXBwLm1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQ0wsY0FBYyxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQXVCLFFBQVEsRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxPQUFPLElBQUksVUFBVSxFQUN2SCxNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLFFBQVEsTUFBTSxxQkFBcUIsQ0FBQztBQUUzQyxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3hDLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQzs7QUFFN0MsTUFBTSxDQUFDLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxjQUFjLENBQWtCLDBCQUEwQixDQUFDLENBQUM7QUFDaEcsTUFBTSxDQUFDLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxjQUFjLENBQXFCLHVCQUF1QixDQUFDLENBQUM7QUFHakcsTUFBTSxVQUFVLG1CQUFtQixDQUFDLE9BQXdCLEVBQUUsSUFBWSxFQUFFLFlBQWtEO0lBQzVILE1BQU0sSUFBSSxHQUFHLE9BQU8sWUFBWSxLQUFLLFFBQVEsSUFBSSxZQUFZLElBQUksV0FBVyxDQUFDO0lBQzdFLE1BQU0sTUFBTSxHQUFHLE9BQU8sWUFBWSxLQUFLLFFBQVEsSUFBSSxZQUFZLElBQUksRUFBRSxDQUFDO0lBQ3RFLE1BQU0sQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUM7SUFDbEMsK0VBQStFO0lBQy9FLE1BQU0sV0FBVyxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxJQUFJLEtBQUssTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3BGLGtHQUFrRztJQUNsRyw2RUFBNkU7SUFDN0UsTUFBTSxHQUFHLEdBQUcsQ0FBQyxXQUFXLElBQUksSUFBSSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLE1BQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMxRyxJQUFJO1FBQ0YsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxLQUFLLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQzNELE1BQU0sR0FBRyxHQUFHLENBQUMsQ0FBRSxNQUFjLENBQUMsR0FBRyxDQUFDO1lBQ2xDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsR0FBRyxHQUFHLENBQUMsSUFBSSwyREFBMkQsR0FBRyxDQUFDLENBQUMsQ0FBQyx3REFBd0QsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztTQUM1SjtLQUNGO0lBQUMsT0FBTyxDQUFDLEVBQUUsR0FBRztJQUNmLE9BQU8sSUFBSSxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDOUIsQ0FBQztBQUVELE1BQU0sR0FBRyxHQUFHLENBQUMsS0FBa0MsRUFBRSxHQUFHLElBQVMsRUFBRSxFQUFFO0lBQy9ELElBQUksU0FBUyxFQUFFLElBQUksT0FBTyxPQUFPLEtBQUssV0FBVyxFQUFFO1FBQ2pELE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO0tBQ3pCO0FBQ0gsQ0FBQyxDQUFDO0FBRUYsTUFBTSxxQkFBcUIsR0FBRztJQUM1QixPQUFPLEVBQUUsV0FBVztJQUNwQixVQUFVLEVBQUUsbUJBQW1CO0lBQy9CLElBQUksRUFBRTtRQUNKLGdCQUFnQjtRQUNoQixNQUFNO1FBQ04sQ0FBQyxJQUFJLFFBQVEsRUFBRSxFQUFFLGlCQUFpQixDQUFDO0tBQ3BDO0NBQ0YsQ0FBQztBQUtGLE1BQU0sT0FBTyxpQkFBaUI7SUFXNUIscUNBQXFDO0lBQ3JDLFlBQWlDLFVBQWtCO1FBQ2pELFFBQVEsQ0FBQyxlQUFlLENBQUMsYUFBYSxFQUFFLE9BQU8sQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDOUQsUUFBUSxDQUFDLGVBQWUsQ0FBQyxhQUFhLEVBQUUsT0FBTyxDQUFDLElBQUksRUFBRSxZQUFZLENBQUMsQ0FBQztRQUNwRSxRQUFRLENBQUMsZUFBZSxDQUFDLFNBQVMsRUFBRSxVQUFVLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO0lBQzlFLENBQUM7SUFmRCxNQUFNLENBQUMsYUFBYSxDQUFDLE9BQXdCLEVBQUUsWUFBMkM7UUFDeEYsT0FBTztZQUNMLFFBQVEsRUFBRSxpQkFBaUI7WUFDM0IsU0FBUyxFQUFFO2dCQUNULEVBQUMsT0FBTyxFQUFFLGdCQUFnQixFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUM7Z0JBQzlDLEVBQUMsT0FBTyxFQUFFLGlCQUFpQixFQUFFLFFBQVEsRUFBRSxZQUFZLEVBQUM7YUFDckQ7U0FDRixDQUFDO0lBQ0osQ0FBQzs7OEdBVFUsaUJBQWlCLGtCQVlSLFdBQVc7K0dBWnBCLGlCQUFpQjsrR0FBakIsaUJBQWlCLGFBRmpCLENBQUMscUJBQXFCLENBQUM7MkZBRXZCLGlCQUFpQjtrQkFIN0IsUUFBUTttQkFBQztvQkFDUixTQUFTLEVBQUUsQ0FBQyxxQkFBcUIsQ0FBQztpQkFDbkM7MERBYThDLE1BQU07MEJBQXRDLE1BQU07MkJBQUMsV0FBVyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIEluamVjdGlvblRva2VuLCBJbmplY3QsIGlzRGV2TW9kZSwgTW9kdWxlV2l0aFByb3ZpZGVycywgTmdNb2R1bGUsIE5nWm9uZSwgT3B0aW9uYWwsIFBMQVRGT1JNX0lELCBWRVJTSU9OIGFzIE5HX1ZFUlNJT04sIFZlcnNpb25cbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgZmlyZWJhc2UgZnJvbSAnZmlyZWJhc2UvY29tcGF0L2FwcCc7XG5pbXBvcnQgeyBGaXJlYmFzZU9wdGlvbnMsIEZpcmViYXNlQXBwU2V0dGluZ3MgfSBmcm9tICdmaXJlYmFzZS9hcHAnO1xuaW1wb3J0IHsgVkVSU0lPTiB9IGZyb20gJ0Bhbmd1bGFyL2ZpcmUnO1xuaW1wb3J0IHsgRmlyZWJhc2VBcHAgfSBmcm9tICcuL2ZpcmViYXNlLmFwcCc7XG5cbmV4cG9ydCBjb25zdCBGSVJFQkFTRV9PUFRJT05TID0gbmV3IEluamVjdGlvblRva2VuPEZpcmViYXNlT3B0aW9ucz4oJ2FuZ3VsYXJmaXJlMi5hcHAub3B0aW9ucycpO1xuZXhwb3J0IGNvbnN0IEZJUkVCQVNFX0FQUF9OQU1FID0gbmV3IEluamVjdGlvblRva2VuPHN0cmluZyB8IHVuZGVmaW5lZD4oJ2FuZ3VsYXJmaXJlMi5hcHAubmFtZScpO1xuXG5cbmV4cG9ydCBmdW5jdGlvbiDJtWZpcmViYXNlQXBwRmFjdG9yeShvcHRpb25zOiBGaXJlYmFzZU9wdGlvbnMsIHpvbmU6IE5nWm9uZSwgbmFtZU9yQ29uZmlnPzogc3RyaW5nIHwgRmlyZWJhc2VBcHBTZXR0aW5ncyB8IG51bGwpIHtcbiAgY29uc3QgbmFtZSA9IHR5cGVvZiBuYW1lT3JDb25maWcgPT09ICdzdHJpbmcnICYmIG5hbWVPckNvbmZpZyB8fCAnW0RFRkFVTFRdJztcbiAgY29uc3QgY29uZmlnID0gdHlwZW9mIG5hbWVPckNvbmZpZyA9PT0gJ29iamVjdCcgJiYgbmFtZU9yQ29uZmlnIHx8IHt9O1xuICBjb25maWcubmFtZSA9IGNvbmZpZy5uYW1lIHx8IG5hbWU7XG4gIC8vIEFkZGVkIGFueSBkdWUgdG8gc29tZSBpbmNvbnNpc3RlbmN5IGJldHdlZW4gQGZpcmViYXNlL2FwcCBhbmQgZmlyZWJhc2UgdHlwZXNcbiAgY29uc3QgZXhpc3RpbmdBcHAgPSBmaXJlYmFzZS5hcHBzLmZpbHRlcihhcHAgPT4gYXBwICYmIGFwcC5uYW1lID09PSBjb25maWcubmFtZSlbMF07XG4gIC8vIFdlIHN1cHBvcnQgRmlyZWJhc2VDb25maWcsIGluaXRpYWxpemVBcHAncyBwdWJsaWMgdHlwZSBvbmx5IGFjY2VwdHMgc3RyaW5nOyBuZWVkIHRvIGNhc3QgYXMgYW55XG4gIC8vIENvdWxkIGJlIHNvbHZlZCB3aXRoIGh0dHBzOi8vZ2l0aHViLmNvbS9maXJlYmFzZS9maXJlYmFzZS1qcy1zZGsvcHVsbC8xMjA2XG4gIGNvbnN0IGFwcCA9IChleGlzdGluZ0FwcCB8fCB6b25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IGZpcmViYXNlLmluaXRpYWxpemVBcHAob3B0aW9ucywgY29uZmlnIGFzIGFueSkpKTtcbiAgdHJ5IHtcbiAgICBpZiAoSlNPTi5zdHJpbmdpZnkob3B0aW9ucykgIT09IEpTT04uc3RyaW5naWZ5KGFwcC5vcHRpb25zKSkge1xuICAgICAgY29uc3QgaG1yID0gISEobW9kdWxlIGFzIGFueSkuaG90O1xuICAgICAgbG9nKCdlcnJvcicsIGAke2FwcC5uYW1lfSBGaXJlYmFzZSBBcHAgYWxyZWFkeSBpbml0aWFsaXplZCB3aXRoIGRpZmZlcmVudCBvcHRpb25zJHtobXIgPyAnLCB5b3UgbWF5IG5lZWQgdG8gcmVsb2FkIGFzIEZpcmViYXNlIGlzIG5vdCBITVIgYXdhcmUuJyA6ICcuJ31gKTtcbiAgICB9XG4gIH0gY2F0Y2ggKGUpIHsgfVxuICByZXR1cm4gbmV3IEZpcmViYXNlQXBwKGFwcCk7XG59XG5cbmNvbnN0IGxvZyA9IChsZXZlbDogJ2xvZyd8J2Vycm9yJ3wnaW5mbyd8J3dhcm4nLCAuLi5hcmdzOiBhbnkpID0+IHtcbiAgaWYgKGlzRGV2TW9kZSgpICYmIHR5cGVvZiBjb25zb2xlICE9PSAndW5kZWZpbmVkJykge1xuICAgIGNvbnNvbGVbbGV2ZWxdKC4uLmFyZ3MpO1xuICB9XG59O1xuXG5jb25zdCBGSVJFQkFTRV9BUFBfUFJPVklERVIgPSB7XG4gIHByb3ZpZGU6IEZpcmViYXNlQXBwLFxuICB1c2VGYWN0b3J5OiDJtWZpcmViYXNlQXBwRmFjdG9yeSxcbiAgZGVwczogW1xuICAgIEZJUkVCQVNFX09QVElPTlMsXG4gICAgTmdab25lLFxuICAgIFtuZXcgT3B0aW9uYWwoKSwgRklSRUJBU0VfQVBQX05BTUVdXG4gIF1cbn07XG5cbkBOZ01vZHVsZSh7XG4gIHByb3ZpZGVyczogW0ZJUkVCQVNFX0FQUF9QUk9WSURFUl1cbn0pXG5leHBvcnQgY2xhc3MgQW5ndWxhckZpcmVNb2R1bGUge1xuICBzdGF0aWMgaW5pdGlhbGl6ZUFwcChvcHRpb25zOiBGaXJlYmFzZU9wdGlvbnMsIG5hbWVPckNvbmZpZz86IHN0cmluZyB8IEZpcmViYXNlQXBwU2V0dGluZ3MpOiBNb2R1bGVXaXRoUHJvdmlkZXJzPEFuZ3VsYXJGaXJlTW9kdWxlPiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5nTW9kdWxlOiBBbmd1bGFyRmlyZU1vZHVsZSxcbiAgICAgIHByb3ZpZGVyczogW1xuICAgICAgICB7cHJvdmlkZTogRklSRUJBU0VfT1BUSU9OUywgdXNlVmFsdWU6IG9wdGlvbnN9LFxuICAgICAgICB7cHJvdmlkZTogRklSRUJBU0VfQVBQX05BTUUsIHVzZVZhbHVlOiBuYW1lT3JDb25maWd9XG4gICAgICBdXG4gICAgfTtcbiAgfVxuXG4gIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpiYW4tdHlwZXNcbiAgY29uc3RydWN0b3IoQEluamVjdChQTEFURk9STV9JRCkgcGxhdGZvcm1JZDogT2JqZWN0KSB7XG4gICAgZmlyZWJhc2UucmVnaXN0ZXJWZXJzaW9uKCdhbmd1bGFyZmlyZScsIFZFUlNJT04uZnVsbCwgJ2NvcmUnKTtcbiAgICBmaXJlYmFzZS5yZWdpc3RlclZlcnNpb24oJ2FuZ3VsYXJmaXJlJywgVkVSU0lPTi5mdWxsLCAnYXBwLWNvbXBhdCcpO1xuICAgIGZpcmViYXNlLnJlZ2lzdGVyVmVyc2lvbignYW5ndWxhcicsIE5HX1ZFUlNJT04uZnVsbCwgcGxhdGZvcm1JZC50b1N0cmluZygpKTtcbiAgfVxufVxuIl19