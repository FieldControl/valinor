import { __awaiter } from "tslib";
import { Inject, Injectable, InjectionToken, NgZone, Optional, PLATFORM_ID } from '@angular/core';
import { EMPTY, of } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { map, shareReplay, switchMap, observeOn } from 'rxjs/operators';
import { ɵAngularFireSchedulers } from '@angular/fire';
import { ɵlazySDKProxy, ɵapplyMixins, ɵcacheInstance } from '@angular/fire/compat';
import { FirebaseApp } from '@angular/fire/compat';
import { proxyPolyfillCompat } from './base';
import { isSupported } from 'firebase/analytics';
import * as i0 from "@angular/core";
import * as i1 from "@angular/fire/compat";
import * as i2 from "@angular/fire";
export const COLLECTION_ENABLED = new InjectionToken('angularfire2.analytics.analyticsCollectionEnabled');
export const APP_VERSION = new InjectionToken('angularfire2.analytics.appVersion');
export const APP_NAME = new InjectionToken('angularfire2.analytics.appName');
export const DEBUG_MODE = new InjectionToken('angularfire2.analytics.debugMode');
export const CONFIG = new InjectionToken('angularfire2.analytics.config');
const APP_NAME_KEY = 'app_name';
const APP_VERSION_KEY = 'app_version';
const DEBUG_MODE_KEY = 'debug_mode';
const GTAG_CONFIG_COMMAND = 'config';
const GTAG_FUNCTION_NAME = 'gtag'; // TODO rename these
const DATA_LAYER_NAME = 'dataLayer';
const SEND_TO_KEY = 'send_to';
export class AngularFireAnalytics {
    constructor(app, analyticsCollectionEnabled, providedAppVersion, providedAppName, debugModeEnabled, providedConfig, 
    // tslint:disable-next-line:ban-types
    platformId, zone, schedulers) {
        this.analyticsInitialized = new Promise(() => { });
        if (isPlatformBrowser(platformId)) {
            window[DATA_LAYER_NAME] = window[DATA_LAYER_NAME] || [];
            // It turns out we can't rely on the measurementId in the Firebase config JSON
            // this identifier is not stable. firebase/analytics does a call to get a fresh value
            // falling back on the one in the config. Rather than do that ourselves we should listen
            // on our gtag function for a analytics config command
            // e.g, ['config', measurementId, { origin: 'firebase', firebase_id }]
            const parseMeasurementId = (...args) => {
                if (args[0] === 'config' && args[2].origin === 'firebase') {
                    this.measurementId = args[1];
                    return true;
                }
                else {
                    return false;
                }
            };
            const patchGtag = (fn) => {
                window[GTAG_FUNCTION_NAME] = (...args) => {
                    if (fn) {
                        fn(...args);
                    }
                    // Inject app_name and app_version into events
                    // TODO(jamesdaniels): I'm doing this as documented but it's still not
                    //   showing up in the console. Investigate. Guessing it's just part of the
                    //   whole GA4 transition mess.
                    if (args[0] === 'event' && args[2][SEND_TO_KEY] === this.measurementId) {
                        if (providedAppName) {
                            args[2][APP_NAME_KEY] = providedAppName;
                        }
                        if (providedAppVersion) {
                            args[2][APP_VERSION_KEY] = providedAppVersion;
                        }
                    }
                    if (debugModeEnabled && typeof console !== 'undefined') {
                        // tslint:disable-next-line:no-console
                        console.info(...args);
                    }
                    /**
                     * According to the gtag documentation, this function that defines a custom data layer cannot be
                     * an arrow function because 'arguments' is not an array. It is actually an object that behaves
                     * like an array and contains more information then just indexes. Transforming this into arrow function
                     * caused issue #2505 where analytics no longer sent any data.
                     */
                    // tslint:disable-next-line: only-arrow-functions
                    (function (..._args) {
                        window[DATA_LAYER_NAME].push(arguments);
                    })(...args);
                };
            };
            // Unclear if we still need to but I was running into config/events I passed
            // to gtag before ['js' timestamp] weren't getting parsed, so let's make a promise
            // that resolves when firebase/analytics has configured gtag.js that we wait on
            // before sending anything
            const firebaseAnalyticsAlreadyInitialized = window[DATA_LAYER_NAME].some(parseMeasurementId);
            if (firebaseAnalyticsAlreadyInitialized) {
                this.analyticsInitialized = Promise.resolve();
                patchGtag();
            }
            else {
                this.analyticsInitialized = new Promise(resolve => {
                    patchGtag((...args) => {
                        if (parseMeasurementId(...args)) {
                            resolve();
                        }
                    });
                });
            }
            if (providedConfig) {
                this.updateConfig(providedConfig);
            }
            if (debugModeEnabled) {
                this.updateConfig({ [DEBUG_MODE_KEY]: 1 });
            }
        }
        else {
            this.analyticsInitialized = Promise.resolve();
        }
        const analytics = of(undefined).pipe(observeOn(schedulers.outsideAngular), switchMap(isSupported), switchMap(supported => supported ? zone.runOutsideAngular(() => import('firebase/compat/analytics')) : EMPTY), map(() => {
            return ɵcacheInstance(`analytics`, 'AngularFireAnalytics', app.name, () => {
                const analytics = app.analytics();
                if (analyticsCollectionEnabled === false) {
                    analytics.setAnalyticsCollectionEnabled(false);
                }
                return analytics;
            }, [app, analyticsCollectionEnabled, providedConfig, debugModeEnabled]);
        }), shareReplay({ bufferSize: 1, refCount: false }));
        return ɵlazySDKProxy(this, analytics, zone);
    }
    updateConfig(config) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.analyticsInitialized;
            window[GTAG_FUNCTION_NAME](GTAG_CONFIG_COMMAND, this.measurementId, Object.assign(Object.assign({}, config), { update: true }));
        });
    }
}
AngularFireAnalytics.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: AngularFireAnalytics, deps: [{ token: i1.FirebaseApp }, { token: COLLECTION_ENABLED, optional: true }, { token: APP_VERSION, optional: true }, { token: APP_NAME, optional: true }, { token: DEBUG_MODE, optional: true }, { token: CONFIG, optional: true }, { token: PLATFORM_ID }, { token: i0.NgZone }, { token: i2.ɵAngularFireSchedulers }], target: i0.ɵɵFactoryTarget.Injectable });
AngularFireAnalytics.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: AngularFireAnalytics, providedIn: 'any' });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: AngularFireAnalytics, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'any'
                }]
        }], ctorParameters: function () { return [{ type: i1.FirebaseApp }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [COLLECTION_ENABLED]
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [APP_VERSION]
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [APP_NAME]
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [DEBUG_MODE]
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [CONFIG]
                }] }, { type: Object, decorators: [{
                    type: Inject,
                    args: [PLATFORM_ID]
                }] }, { type: i0.NgZone }, { type: i2.ɵAngularFireSchedulers }]; } });
ɵapplyMixins(AngularFireAnalytics, [proxyPolyfillCompat]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5hbHl0aWNzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2NvbXBhdC9hbmFseXRpY3MvYW5hbHl0aWNzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxjQUFjLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDbEcsT0FBTyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDakMsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDcEQsT0FBTyxFQUFFLEdBQUcsRUFBRSxXQUFXLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQ3hFLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUN2RCxPQUFPLEVBQUUsYUFBYSxFQUFpQixZQUFZLEVBQUUsY0FBYyxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDbEcsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBRW5ELE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLFFBQVEsQ0FBQztBQUM3QyxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sb0JBQW9CLENBQUM7Ozs7QUFNakQsTUFBTSxDQUFDLE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxjQUFjLENBQVUsbURBQW1ELENBQUMsQ0FBQztBQUNuSCxNQUFNLENBQUMsTUFBTSxXQUFXLEdBQUcsSUFBSSxjQUFjLENBQVMsbUNBQW1DLENBQUMsQ0FBQztBQUMzRixNQUFNLENBQUMsTUFBTSxRQUFRLEdBQUcsSUFBSSxjQUFjLENBQVMsZ0NBQWdDLENBQUMsQ0FBQztBQUNyRixNQUFNLENBQUMsTUFBTSxVQUFVLEdBQUcsSUFBSSxjQUFjLENBQVUsa0NBQWtDLENBQUMsQ0FBQztBQUMxRixNQUFN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LFFBQVE7OzBCQUFJLE1BQU07MkJBQUMsUUFBUTs7MEJBQzNCLFFBQVE7OzBCQUFJLE1BQU07MkJBQUMsVUFBVTs7MEJBQzdCLFFBQVE7OzBCQUFJLE1BQU07MkJBQUMsTUFBTTs4QkFFTyxNQUFNOzBCQUF0QyxNQUFNOzJCQUFDLFdBQVc7O0FBOEd2QixZQUFZLENBQUMsb0JBQW9CLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3QsIEluamVjdGFibGUsIEluamVjdGlvblRva2VuLCBOZ1pvbmUsIE9wdGlvbmFsLCBQTEFURk9STV9JRCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgRU1QVFksIG9mIH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBpc1BsYXRmb3JtQnJvd3NlciB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQgeyBtYXAsIHNoYXJlUmVwbGF5LCBzd2l0Y2hNYXAsIG9ic2VydmVPbiB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7IMm1QW5ndWxhckZpcmVTY2hlZHVsZXJzIH0gZnJvbSAnQGFuZ3VsYXIvZmlyZSc7XG5pbXBvcnQgeyDJtWxhenlTREtQcm94eSwgybVQcm9taXNlUHJveHksIMm1YXBwbHlNaXhpbnMsIMm1Y2FjaGVJbnN0YW5jZSB9IGZyb20gJ0Bhbmd1bGFyL2ZpcmUvY29tcGF0JztcbmltcG9ydCB7IEZpcmViYXNlQXBwIH0gZnJvbSAnQGFuZ3VsYXIvZmlyZS9jb21wYXQnO1xuaW1wb3J0IGZpcmViYXNlIGZyb20gJ2ZpcmViYXNlL2NvbXBhdC9hcHAnO1xuaW1wb3J0IHsgcHJveHlQb2x5ZmlsbENvbXBhdCB9IGZyb20gJy4vYmFzZSc7XG5pbXBvcnQgeyBpc1N1cHBvcnRlZCB9IGZyb20gJ2ZpcmViYXNlL2FuYWx5dGljcyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29uZmlnIHtcbiAgW2tleTogc3RyaW5nXTogYW55O1xufVxuXG5leHBvcnQgY29uc3QgQ09MTEVDVElPTl9FTkFCTEVEID0gbmV3IEluamVjdGlvblRva2VuPGJvb2xlYW4+KCdhbmd1bGFyZmlyZTIuYW5hbHl0aWNzLmFuYWx5dGljc0NvbGxlY3Rpb25FbmFibGVkJyk7XG5leHBvcnQgY29uc3QgQVBQX1ZFUlNJT04gPSBuZXcgSW5qZWN0aW9uVG9rZW48c3RyaW5nPignYW5ndWxhcmZpcmUyLmFuYWx5dGljcy5hcHBWZXJzaW9uJyk7XG5leHBvcnQgY29uc3QgQVBQX05BTUUgPSBuZXcgSW5qZWN0aW9uVG9rZW48c3RyaW5nPignYW5ndWxhcmZpcmUyLmFuYWx5dGljcy5hcHBOYW1lJyk7XG5leHBvcnQgY29uc3QgREVCVUdfTU9ERSA9IG5ldyBJbmplY3Rpb25Ub2tlbjxib29sZWFuPignYW5ndWxhcmZpcmUyLmFuYWx5dGljcy5kZWJ1Z01vZGUnKTtcbmV4cG9ydCBjb25zdCBDT05GSUcgPSBuZXcgSW5qZWN0aW9uVG9rZW48Q29uZmlnPignYW5ndWxhcmZpcmUyLmFuYWx5dGljcy5jb25maWcnKTtcblxuY29uc3QgQVBQX05BTUVfS0VZID0gJ2FwcF9uYW1lJztcbmNvbnN0IEFQUF9WRVJTSU9OX0tFWSA9ICdhcHBfdmVyc2lvbic7XG5jb25zdCBERUJVR19NT0RFX0tFWSA9ICdkZWJ1Z19tb2RlJztcbmNvbnN0IEdUQUdfQ09ORklHX0NPTU1BTkQgPSAnY29uZmlnJztcbmNvbnN0IEdUQUdfRlVOQ1RJT05fTkFNRSA9ICdndGFnJzsgLy8gVE9ETyByZW5hbWUgdGhlc2VcbmNvbnN0IERBVEFfTEFZRVJfTkFNRSA9ICdkYXRhTGF5ZXInO1xuY29uc3QgU0VORF9UT19LRVkgPSAnc2VuZF90byc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQW5ndWxhckZpcmVBbmFseXRpY3MgZXh0ZW5kcyDJtVByb21pc2VQcm94eTxmaXJlYmFzZS5hbmFseXRpY3MuQW5hbHl0aWNzPiB7XG59XG5cbkBJbmplY3RhYmxlKHtcbiAgcHJvdmlkZWRJbjogJ2FueSdcbn0pXG5leHBvcnQgY2xhc3MgQW5ndWxhckZpcmVBbmFseXRpY3Mge1xuXG4gIHByaXZhdGUgbWVhc3VyZW1lbnRJZDogc3RyaW5nO1xuICBwcml2YXRlIGFuYWx5dGljc0luaXRpYWxpemVkOiBQcm9taXNlPHZvaWQ+ID0gbmV3IFByb21pc2UoKCkgPT4ge30pO1xuXG4gIGFzeW5jIHVwZGF0ZUNvbmZpZyhjb25maWc6IENvbmZpZykge1xuICAgIGF3YWl0IHRoaXMuYW5hbHl0aWNzSW5pdGlhbGl6ZWQ7XG4gICAgd2luZG93W0dUQUdfRlVOQ1RJT05fTkFNRV0oR1RBR19DT05GSUdfQ09NTUFORCwgdGhpcy5tZWFzdXJlbWVudElkLCB7IC4uLmNvbmZpZywgdXBkYXRlOiB0cnVlIH0pO1xuICB9XG5cbiAgY29uc3RydWN0b3IoXG4gICAgYXBwOiBGaXJlYmFzZUFwcCxcbiAgICBAT3B0aW9uYWwoKSBASW5qZWN0KENPTExFQ1RJT05fRU5BQkxFRCkgYW5hbHl0aWNzQ29sbGVjdGlvbkVuYWJsZWQ6IGJvb2xlYW4gfCBudWxsLFxuICAgIEBPcHRpb25hbCgpIEBJbmplY3QoQVBQX1ZFUlNJT04pIHByb3ZpZGVkQXBwVmVyc2lvbjogc3RyaW5nIHwgbnVsbCxcbiAgICBAT3B0aW9uYWwoKSBASW5qZWN0KEFQUF9OQU1FKSBwcm92aWRlZEFwcE5hbWU6IHN0cmluZyB8IG51bGwsXG4gICAgQE9wdGlvbmFsKCkgQEluamVjdChERUJVR19NT0RFKSBkZWJ1Z01vZGVFbmFibGVkOiBib29sZWFuIHwgbnVsbCxcbiAgICBAT3B0aW9uYWwoKSBASW5qZWN0KENPTkZJRykgcHJvdmlkZWRDb25maWc6IENvbmZpZyB8IG51bGwsXG4gICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOmJhbi10eXBlc1xuICAgIEBJbmplY3QoUExBVEZPUk1fSUQpIHBsYXRmb3JtSWQ6IE9iamVjdCxcbiAgICB6b25lOiBOZ1pvbmUsXG4gICAgc2NoZWR1bGVyczogybVBbmd1bGFyRmlyZVNjaGVkdWxlcnMsXG4gICkge1xuXG4gICAgaWYgKGlzUGxhdGZvcm1Ccm93c2VyKHBsYXRmb3JtSWQpKSB7XG5cbiAgICAgIHdpbmRvd1tEQVRBX0xBWUVSX05BTUVdID0gd2luZG93W0RBVEFfTEFZRVJfTkFNRV0gfHwgW107XG5cbiAgICAgIC8vIEl0IHR1cm5zIG91dCB3ZSBjYW4ndCByZWx5IG9uIHRoZSBtZWFzdXJlbWVudElkIGluIHRoZSBGaXJlYmFzZSBjb25maWcgSlNPTlxuICAgICAgLy8gdGhpcyBpZGVudGlmaWVyIGlzIG5vdCBzdGFibGUuIGZpcmViYXNlL2FuYWx5dGljcyBkb2VzIGEgY2FsbCB0byBnZXQgYSBmcmVzaCB2YWx1ZVxuICAgICAgLy8gZmFsbGluZyBiYWNrIG9uIHRoZSBvbmUgaW4gdGhlIGNvbmZpZy4gUmF0aGVyIHRoYW4gZG8gdGhhdCBvdXJzZWx2ZXMgd2Ugc2hvdWxkIGxpc3RlblxuICAgICAgLy8gb24gb3VyIGd0YWcgZnVuY3Rpb24gZm9yIGEgYW5hbHl0aWNzIGNvbmZpZyBjb21tYW5kXG4gICAgICAvLyBlLmcsIFsnY29uZmlnJywgbWVhc3VyZW1lbnRJZCwgeyBvcmlnaW46ICdmaXJlYmFzZScsIGZpcmViYXNlX2lkIH1dXG4gICAgICBjb25zdCBwYXJzZU1lYXN1cmVtZW50SWQgPSAoLi4uYXJnczogYW55W10pID0+IHtcbiAgICAgICAgaWYgKGFyZ3NbMF0gPT09ICdjb25maWcnICYmIGFyZ3NbMl0ub3JpZ2luID09PSAnZmlyZWJhc2UnKSB7XG4gICAgICAgICAgdGhpcy5tZWFzdXJlbWVudElkID0gYXJnc1sxXTtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IHBhdGNoR3RhZyA9IChmbj86ICguLi5hcmdzOiBhbnlbXSkgPT4gdm9pZCkgPT4ge1xuICAgICAgICB3aW5kb3dbR1RBR19GVU5DVElPTl9OQU1FXSA9ICguLi5hcmdzOiBhbnlbXSkgPT4ge1xuICAgICAgICAgIGlmIChmbikge1xuICAgICAgICAgICAgZm4oLi4uYXJncyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIEluamVjdCBhcHBfbmFtZSBhbmQgYXBwX3ZlcnNpb24gaW50byBldmVudHNcbiAgICAgICAgICAvLyBUT0RPKGphbWVzZGFuaWVscyk6IEknbSBkb2luZyB0aGlzIGFzIGRvY3VtZW50ZWQgYnV0IGl0J3Mgc3RpbGwgbm90XG4gICAgICAgICAgLy8gICBzaG93aW5nIHVwIGluIHRoZSBjb25zb2xlLiBJbnZlc3RpZ2F0ZS4gR3Vlc3NpbmcgaXQncyBqdXN0IHBhcnQgb2YgdGhlXG4gICAgICAgICAgLy8gICB3aG9sZSBHQTQgdHJhbnNpdGlvbiBtZXNzLlxuICAgICAgICAgIGlmIChhcmdzWzBdID09PSAnZXZlbnQnICYmIGFyZ3NbMl1bU0VORF9UT19LRVldID09PSB0aGlzLm1lYXN1cmVtZW50SWQpIHtcbiAgICAgICAgICAgIGlmIChwcm92aWRlZEFwcE5hbWUpIHtcbiAgICAgICAgICAgICAgYXJnc1syXVtBUFBfTkFNRV9LRVldID0gcHJvdmlkZWRBcHBOYW1lO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHByb3ZpZGVkQXBwVmVyc2lvbikge1xuICAgICAgICAgICAgICBhcmdzWzJdW0FQUF9WRVJTSU9OX0tFWV0gPSBwcm92aWRlZEFwcFZlcnNpb247XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChkZWJ1Z01vZGVFbmFibGVkICYmIHR5cGVvZiBjb25zb2xlICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWNvbnNvbGVcbiAgICAgICAgICAgIGNvbnNvbGUuaW5mbyguLi5hcmdzKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLyoqXG4gICAgICAgICAgICogQWNjb3JkaW5nIHRvIHRoZSBndGFnIGRvY3VtZW50YXRpb24sIHRoaXMgZnVuY3Rpb24gdGhhdCBkZWZpbmVzIGEgY3VzdG9tIGRhdGEgbGF5ZXIgY2Fubm90IGJlXG4gICAgICAgICAgICogYW4gYXJyb3cgZnVuY3Rpb24gYmVjYXVzZSAnYXJndW1lbnRzJyBpcyBub3QgYW4gYXJyYXkuIEl0IGlzIGFjdHVhbGx5IGFuIG9iamVjdCB0aGF0IGJlaGF2ZXNcbiAgICAgICAgICAgKiBsaWtlIGFuIGFycmF5IGFuZCBjb250YWlucyBtb3JlIGluZm9ybWF0aW9uIHRoZW4ganVzdCBpbmRleGVzLiBUcmFuc2Zvcm1pbmcgdGhpcyBpbnRvIGFycm93IGZ1bmN0aW9uXG4gICAgICAgICAgICogY2F1c2VkIGlzc3VlICMyNTA1IHdoZXJlIGFuYWx5dGljcyBubyBsb25nZXIgc2VudCBhbnkgZGF0YS5cbiAgICAgICAgICAgKi9cbiAgICAgICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6IG9ubHktYXJyb3ctZnVuY3Rpb25zXG4gICAgICAgICAgKGZ1bmN0aW9uKC4uLl9hcmdzOiBhbnlbXSkge1xuICAgICAgICAgICAgd2luZG93W0RBVEFfTEFZRVJfTkFNRV0ucHVzaChhcmd1bWVudHMpO1xuICAgICAgICAgIH0pKC4uLmFyZ3MpO1xuICAgICAgICB9O1xuICAgICAgfTtcblxuICAgICAgLy8gVW5jbGVhciBpZiB3ZSBzdGlsbCBuZWVkIHRvIGJ1dCBJIHdhcyBydW5uaW5nIGludG8gY29uZmlnL2V2ZW50cyBJIHBhc3NlZFxuICAgICAgLy8gdG8gZ3RhZyBiZWZvcmUgWydqcycgdGltZXN0YW1wXSB3ZXJlbid0IGdldHRpbmcgcGFyc2VkLCBzbyBsZXQncyBtYWtlIGEgcHJvbWlzZVxuICAgICAgLy8gdGhhdCByZXNvbHZlcyB3aGVuIGZpcmViYXNlL2FuYWx5dGljcyBoYXMgY29uZmlndXJlZCBndGFnLmpzIHRoYXQgd2Ugd2FpdCBvblxuICAgICAgLy8gYmVmb3JlIHNlbmRpbmcgYW55dGhpbmdcbiAgICAgIGNvbnN0IGZpcmViYXNlQW5hbHl0aWNzQWxyZWFkeUluaXRpYWxpemVkID0gd2luZG93W0RBVEFfTEFZRVJfTkFNRV0uc29tZShwYXJzZU1lYXN1cmVtZW50SWQpO1xuICAgICAgaWYgKGZpcmViYXNlQW5hbHl0aWNzQWxyZWFkeUluaXRpYWxpemVkKSB7XG4gICAgICAgIHRoaXMuYW5hbHl0aWNzSW5pdGlhbGl6ZWQgPSBQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgICAgcGF0Y2hHdGFnKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmFuYWx5dGljc0luaXRpYWxpemVkID0gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICAgICAgcGF0Y2hHdGFnKCguLi5hcmdzKSA9PiB7XG4gICAgICAgICAgICBpZiAocGFyc2VNZWFzdXJlbWVudElkKC4uLmFyZ3MpKSB7XG4gICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChwcm92aWRlZENvbmZpZykge1xuICAgICAgICB0aGlzLnVwZGF0ZUNvbmZpZyhwcm92aWRlZENvbmZpZyk7XG4gICAgICB9XG4gICAgICBpZiAoZGVidWdNb2RlRW5hYmxlZCkge1xuICAgICAgICB0aGlzLnVwZGF0ZUNvbmZpZyh7IFtERUJVR19NT0RFX0tFWV06IDEgfSk7XG4gICAgICB9XG5cbiAgICB9IGVsc2Uge1xuXG4gICAgICB0aGlzLmFuYWx5dGljc0luaXRpYWxpemVkID0gUHJvbWlzZS5yZXNvbHZlKCk7XG5cbiAgICB9XG5cbiAgICBjb25zdCBhbmFseXRpY3MgPSBvZih1bmRlZmluZWQpLnBpcGUoXG4gICAgICBvYnNlcnZlT24oc2NoZWR1bGVycy5vdXRzaWRlQW5ndWxhciksXG4gICAgICBzd2l0Y2hNYXAoaXNTdXBwb3J0ZWQpLFxuICAgICAgc3dpdGNoTWFwKHN1cHBvcnRlZCA9PiBzdXBwb3J0ZWQgPyB6b25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IGltcG9ydCgnZmlyZWJhc2UvY29tcGF0L2FuYWx5dGljcycpKSA6IEVNUFRZKSxcbiAgICAgIG1hcCgoKSA9PiB7XG4gICAgICAgIHJldHVybiDJtWNhY2hlSW5zdGFuY2UoYGFuYWx5dGljc2AsICdBbmd1bGFyRmlyZUFuYWx5dGljcycsIGFwcC5uYW1lLCAoKSA9PiB7XG4gICAgICAgICAgY29uc3QgYW5hbHl0aWNzID0gYXBwLmFuYWx5dGljcygpO1xuICAgICAgICAgIGlmIChhbmFseXRpY3NDb2xsZWN0aW9uRW5hYmxlZCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIGFuYWx5dGljcy5zZXRBbmFseXRpY3NDb2xsZWN0aW9uRW5hYmxlZChmYWxzZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBhbmFseXRpY3M7XG4gICAgICAgIH0sIFthcHAsIGFuYWx5dGljc0NvbGxlY3Rpb25FbmFibGVkLCBwcm92aWRlZENvbmZpZywgZGVidWdNb2RlRW5hYmxlZF0pO1xuICAgICAgfSksXG4gICAgICBzaGFyZVJlcGxheSh7IGJ1ZmZlclNpemU6IDEsIHJlZkNvdW50OiBmYWxzZSB9KVxuICAgICk7XG5cbiAgICByZXR1cm4gybVsYXp5U0RLUHJveHkodGhpcywgYW5hbHl0aWNzLCB6b25lKTtcblxuICB9XG5cbn1cblxuybVhcHBseU1peGlucyhBbmd1bGFyRmlyZUFuYWx5dGljcywgW3Byb3h5UG9seWZpbGxDb21wYXRdKTtcbiJdfQ==