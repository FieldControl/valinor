import * as i0 from '@angular/core';
import { InjectionToken, isDevMode, NgZone, Optional, VERSION as VERSION$1, PLATFORM_ID, NgModule, Inject } from '@angular/core';
import firebase from 'firebase/compat/app';
import { VERSION } from '@angular/fire';

// DEBUG quick debugger function for inline logging that typescript doesn't complain about
//       wrote it for debugging the ɵlazySDKProxy, commenting out for now; should consider exposing a
//       verbose mode for AngularFire in a future release that uses something like this in multiple places
//       usage: () => log('something') || returnValue
// const log = (...args: any[]): false => { console.log(...args); return false }
// The problem here are things like ngOnDestroy are missing, then triggering the service
// rather than dig too far; I'm capturing these as I go.
const noopFunctions = ['ngOnDestroy'];
// INVESTIGATE should we make the Proxy revokable and do some cleanup?
//             right now it's fairly simple but I'm sure this will grow in complexity
const ɵlazySDKProxy = (klass, observable, zone, options = {}) => {
    return new Proxy(klass, {
        get: (_, name) => zone.runOutsideAngular(() => {
            var _a;
            if (klass[name]) {
                if ((_a = options === null || options === void 0 ? void 0 : options.spy) === null || _a === void 0 ? void 0 : _a.get) {
                    options.spy.get(name, klass[name]);
                }
                return klass[name];
            }
            if (noopFunctions.indexOf(name) > -1) {
                return () => {
                };
            }
            const promise = observable.toPromise().then(mod => {
                const ret = mod && mod[name];
                // TODO move to proper type guards
                if (typeof ret === 'function') {
                    return ret.bind(mod);
                }
                else if (ret && ret.then) {
                    return ret.then((res) => zone.run(() => res));
                }
                else {
                    return zone.run(() => ret);
                }
            });
            // recurse the proxy
            return new Proxy(() => { }, {
                get: (_, name) => promise[name],
                // TODO handle callbacks as transparently as I can
                apply: (self, _, args) => promise.then(it => {
                    var _a;
                    const res = it && it(...args);
                    if ((_a = options === null || options === void 0 ? void 0 : options.spy) === null || _a === void 0 ? void 0 : _a.apply) {
                        options.spy.apply(name, args, res);
                    }
                    return res;
                })
            });
        })
    });
};
const ɵapplyMixins = (derivedCtor, constructors) => {
    constructors.forEach((baseCtor) => {
        Object.getOwnPropertyNames(baseCtor.prototype || baseCtor).forEach((name) => {
            Object.defineProperty(derivedCtor.prototype, name, Object.getOwnPropertyDescriptor(baseCtor.prototype || baseCtor, name));
        });
    });
};

class FirebaseApp {
    constructor(app) {
        return app;
    }
}

const FIREBASE_OPTIONS = new InjectionToken('angularfire2.app.options');
const FIREBASE_APP_NAME = new InjectionToken('angularfire2.app.name');
function ɵfirebaseAppFactory(options, zone, nameOrConfig) {
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
            log$1('error', `${app.name} Firebase App already initialized with different options${hmr ? ', you may need to reload as Firebase is not HMR aware.' : '.'}`);
        }
    }
    catch (e) { }
    return new FirebaseApp(app);
}
const log$1 = (level, ...args) => {
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
class AngularFireModule {
    // tslint:disable-next-line:ban-types
    constructor(platformId) {
        firebase.registerVersion('angularfire', VERSION.full, 'core');
        firebase.registerVersion('angularfire', VERSION.full, 'app-compat');
        firebase.registerVersion('angular', VERSION$1.full, platformId.toString());
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

function ɵcacheInstance(cacheKey, moduleName, appName, fn, deps) {
    const [, instance, cachedDeps] = globalThis.ɵAngularfireInstanceCache.find((it) => it[0] === cacheKey) || [];
    if (instance) {
        if (!matchDep(deps, cachedDeps)) {
            log('error', `${moduleName} was already initialized on the ${appName} Firebase App with different settings.${IS_HMR ? ' You may need to reload as Firebase is not HMR aware.' : ''}`);
            log('warn', { is: deps, was: cachedDeps });
        }
        return instance;
    }
    else {
        const newInstance = fn();
        globalThis.ɵAngularfireInstanceCache.push([cacheKey, newInstance, deps]);
        return newInstance;
    }
}
function matchDep(a, b) {
    try {
        return a.toString() === b.toString();
    }
    catch (_) {
        return a === b;
    }
}
const IS_HMR = !!module.hot;
const log = (level, ...args) => {
    if (isDevMode() && typeof console !== 'undefined') {
        console[level](...args);
    }
};
globalThis.ɵAngularfireInstanceCache || (globalThis.ɵAngularfireInstanceCache = []);

/**
 * Generated bundle index. Do not edit.
 */

export { AngularFireModule, FIREBASE_APP_NAME, FIREBASE_OPTIONS, FirebaseApp, ɵapplyMixins, ɵcacheInstance, ɵfirebaseAppFactory, ɵlazySDKProxy };
//# sourceMappingURL=angular-fire-compat.js.map
