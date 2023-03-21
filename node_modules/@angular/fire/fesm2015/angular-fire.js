import * as i0 from '@angular/core';
import { Version, Injectable } from '@angular/core';
import { getApps } from 'firebase/app';
import { isSupported as isSupported$2 } from 'firebase/remote-config';
import { isSupported as isSupported$1 } from 'firebase/messaging';
import { isSupported } from 'firebase/analytics';
import { queueScheduler, asyncScheduler, Observable } from 'rxjs';
import { tap, observeOn, subscribeOn } from 'rxjs/operators';

const VERSION = new Version('7.5.0');
const isAnalyticsSupportedValueSymbol = '__angularfire_symbol__analyticsIsSupportedValue';
const isAnalyticsSupportedPromiseSymbol = '__angularfire_symbol__analyticsIsSupported';
const isRemoteConfigSupportedValueSymbol = '__angularfire_symbol__remoteConfigIsSupportedValue';
const isRemoteConfigSupportedPromiseSymbol = '__angularfire_symbol__remoteConfigIsSupported';
const isMessagingSupportedValueSymbol = '__angularfire_symbol__messagingIsSupportedValue';
const isMessagingSupportedPromiseSymbol = '__angularfire_symbol__messagingIsSupported';
globalThis[isAnalyticsSupportedPromiseSymbol] || (globalThis[isAnalyticsSupportedPromiseSymbol] = isSupported().then(it => globalThis[isAnalyticsSupportedValueSymbol] = it).catch(() => globalThis[isAnalyticsSupportedValueSymbol] = false));
globalThis[isMessagingSupportedPromiseSymbol] || (globalThis[isMessagingSupportedPromiseSymbol] = isSupported$1().then(it => globalThis[isMessagingSupportedValueSymbol] = it).catch(() => globalThis[isMessagingSupportedValueSymbol] = false));
globalThis[isRemoteConfigSupportedPromiseSymbol] || (globalThis[isRemoteConfigSupportedPromiseSymbol] = isSupported$2().then(it => globalThis[isRemoteConfigSupportedValueSymbol] = it).catch(() => globalThis[isRemoteConfigSupportedValueSymbol] = false));
const isSupportedError = (module) => `The APP_INITIALIZER that is "making" isSupported() sync for the sake of convenient DI has not resolved in this
context. Rather than injecting ${module} in the constructor, first ensure that ${module} is supported by calling
\`await isSupported()\`, then retrieve the instance from the injector manually \`injector.get(${module})\`.`;
const ɵisMessagingSupportedFactory = {
    async: () => globalThis[isMessagingSupportedPromiseSymbol],
    sync: () => {
        const ret = globalThis[isMessagingSupportedValueSymbol];
        if (ret === undefined) {
            throw new Error(isSupportedError('Messaging'));
        }
        return ret;
    }
};
const ɵisRemoteConfigSupportedFactory = {
    async: () => globalThis[isRemoteConfigSupportedPromiseSymbol],
    sync: () => {
        const ret = globalThis[isRemoteConfigSupportedValueSymbol];
        if (ret === undefined) {
            throw new Error(isSupportedError('RemoteConfig'));
        }
        return ret;
    }
};
const ɵisAnalyticsSupportedFactory = {
    async: () => globalThis[isAnalyticsSupportedPromiseSymbol],
    sync: () => {
        const ret = globalThis[isAnalyticsSupportedValueSymbol];
        if (ret === undefined) {
            throw new Error(isSupportedError('Analytics'));
        }
        return ret;
    }
};
function ɵgetDefaultInstanceOf(identifier, provided, defaultApp) {
    if (provided) {
        // Was provide* only called once? If so grab that
        if (provided.length === 1) {
            return provided[0];
        }
        const providedUsingDefaultApp = provided.filter((it) => it.app === defaultApp);
        // Was provide* only called once, using the default app? If so use that
        if (providedUsingDefaultApp.length === 1) {
            return providedUsingDefaultApp[0];
        }
    }
    // Grab the default instance from the defaultApp
    const defaultAppWithContainer = defaultApp;
    const provider = defaultAppWithContainer.container.getProvider(identifier);
    return provider.getImmediate({ optional: true });
}
const ɵgetAllInstancesOf = (identifier, app) => {
    const apps = app ? [app] : getApps();
    const instances = [];
    apps.forEach((app) => {
        const provider = app.container.getProvider(identifier);
        provider.instances.forEach((instance) => {
            if (!instances.includes(instance)) {
                instances.push(instance);
            }
        });
    });
    return instances;
};

function noop() {
}
/**
 * Schedules tasks so that they are invoked inside the Zone that is passed in the constructor.
 */
// tslint:disable-next-line:class-name
class ɵZoneScheduler {
    constructor(zone, delegate = queueScheduler) {
        this.zone = zone;
        this.delegate = delegate;
    }
    now() {
        return this.delegate.now();
    }
    schedule(work, delay, state) {
        const targetZone = this.zone;
        // Wrap the specified work function to make sure that if nested scheduling takes place the
        // work is executed in the correct zone
        const workInZone = function (state) {
            targetZone.runGuarded(() => {
                work.apply(this, [state]);
            });
        };
        // Scheduling itself needs to be run in zone to ensure setInterval calls for async scheduling are done
        // inside the correct zone. This scheduler needs to schedule asynchronously always to ensure that
        // firebase emissions are never synchronous. Specifying a delay causes issues with the queueScheduler delegate.
        return this.delegate.schedule(workInZone, delay, state);
    }
}
class BlockUntilFirstOperator {
    constructor(zone) {
        this.zone = zone;
        this.task = null;
    }
    call(subscriber, source) {
        const unscheduleTask = this.unscheduleTask.bind(this);
        this.task = this.zone.run(() => Zone.current.scheduleMacroTask('firebaseZoneBlock', noop, {}, noop, noop));
        return source.pipe(tap({ next: unscheduleTask, complete: unscheduleTask, error: unscheduleTask })).subscribe(subscriber).add(unscheduleTask);
    }
    unscheduleTask() {
        // maybe this is a race condition, invoke in a timeout
        // hold for 10ms while I try to figure out what is going on
        setTimeout(() => {
            if (this.task != null && this.task.state === 'scheduled') {
                this.task.invoke();
                this.task = null;
            }
        }, 10);
    }
}
// tslint:disable-next-line:class-name
class ɵAngularFireSchedulers {
    constructor(ngZone) {
        this.ngZone = ngZone;
        this.outsideAngular = ngZone.runOutsideAngular(() => new ɵZoneScheduler(Zone.current));
        this.insideAngular = ngZone.run(() => new ɵZoneScheduler(Zone.current, asyncScheduler));
        globalThis.ɵAngularFireScheduler || (globalThis.ɵAngularFireScheduler = this);
    }
}
ɵAngularFireSchedulers.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: ɵAngularFireSchedulers, deps: [{ token: i0.NgZone }], target: i0.ɵɵFactoryTarget.Injectable });
ɵAngularFireSchedulers.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: ɵAngularFireSchedulers, providedIn: 'root' });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: ɵAngularFireSchedulers, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root',
                }]
        }], ctorParameters: function () { return [{ type: i0.NgZone }]; } });
function getSchedulers() {
    const schedulers = globalThis.ɵAngularFireScheduler;
    if (!schedulers) {
        throw new Error(`Either AngularFireModule has not been provided in your AppModule (this can be done manually or implictly using
provideFirebaseApp) or you're calling an AngularFire method outside of an NgModule (which is not supported).`);
    }
    return schedulers;
}
function runOutsideAngular(fn) {
    return getSchedulers().ngZone.runOutsideAngular(() => fn());
}
function run(fn) {
    return getSchedulers().ngZone.run(() => fn());
}
function observeOutsideAngular(obs$) {
    return obs$.pipe(observeOn(getSchedulers().outsideAngular));
}
function observeInsideAngular(obs$) {
    return obs$.pipe(observeOn(getSchedulers().insideAngular));
}
function keepUnstableUntilFirst(obs$) {
    const scheduler = getSchedulers();
    return ɵkeepUnstableUntilFirstFactory(getSchedulers())(obs$);
}
/**
 * Operator to block the zone until the first value has been emitted or the observable
 * has completed/errored. This is used to make sure that universal waits until the first
 * value from firebase but doesn't block the zone forever since the firebase subscription
 * is still alive.
 */
function ɵkeepUnstableUntilFirstFactory(schedulers) {
    return function keepUnstableUntilFirst(obs$) {
        obs$ = obs$.lift(new BlockUntilFirstOperator(schedulers.ngZone));
        return obs$.pipe(
        // Run the subscribe body outside of Angular (e.g. calling Firebase SDK to add a listener to a change event)
        subscribeOn(schedulers.outsideAngular), 
        // Run operators inside the angular zone (e.g. side effects via tap())
        observeOn(schedulers.insideAngular)
        // INVESTIGATE https://github.com/angular/angularfire/pull/2315
        // share()
        );
    };
}
const zoneWrapFn = (it, macrotask) => {
    const _this = this;
    // function() is needed for the arguments object
    // tslint:disable-next-line:only-arrow-functions
    return function () {
        const _arguments = arguments;
        if (macrotask) {
            setTimeout(() => {
                if (macrotask.state === 'scheduled') {
                    macrotask.invoke();
                }
            }, 10);
        }
        return run(() => it.apply(_this, _arguments));
    };
};
const ɵzoneWrap = (it, blockUntilFirst) => {
    // function() is needed for the arguments object
    // tslint:disable-next-line:only-arrow-functions
    return function () {
        let macrotask;
        const _arguments = arguments;
        // if this is a callback function, e.g, onSnapshot, we should create a microtask and invoke it
        // only once one of the callback functions is tripped.
        for (let i = 0; i < arguments.length; i++) {
            if (typeof _arguments[i] === 'function') {
                if (blockUntilFirst) {
                    macrotask || (macrotask = run(() => Zone.current.scheduleMacroTask('firebaseZoneBlock', noop, {}, noop, noop)));
                }
                // TODO create a microtask to track callback functions
                _arguments[i] = zoneWrapFn(_arguments[i], macrotask);
            }
        }
        const ret = runOutsideAngular(() => it.apply(this, _arguments));
        if (!blockUntilFirst) {
            if (ret instanceof Observable) {
                const schedulers = getSchedulers();
                return ret.pipe(subscribeOn(schedulers.outsideAngular), observeOn(schedulers.insideAngular));
            }
            else {
                return run(() => ret);
            }
        }
        if (ret instanceof Observable) {
            return ret.pipe(keepUnstableUntilFirst);
        }
        else if (ret instanceof Promise) {
            return run(() => new Promise((resolve, reject) => ret.then(it => run(() => resolve(it)), reason => run(() => reject(reason)))));
        }
        else if (typeof ret === 'function' && macrotask) {
            // Handle unsubscribe
            // function() is needed for the arguments object
            // tslint:disable-next-line:only-arrow-functions
            return function () {
                setTimeout(() => {
                    if (macrotask && macrotask.state === 'scheduled') {
                        macrotask.invoke();
                    }
                }, 10);
                return ret.apply(this, arguments);
            };
        }
        else {
            // TODO how do we handle storage uploads in Zone? and other stuff with cancel() etc?
            return run(() => ret);
        }
    };
};

/**
 * Generated bundle index. Do not edit.
 */

export { VERSION, keepUnstableUntilFirst, observeInsideAngular, observeOutsideAngular, ɵAngularFireSchedulers, ɵZoneScheduler, ɵgetAllInstancesOf, ɵgetDefaultInstanceOf, ɵisAnalyticsSupportedFactory, ɵisMessagingSupportedFactory, ɵisRemoteConfigSupportedFactory, ɵkeepUnstableUntilFirstFactory, ɵzoneWrap };
//# sourceMappingURL=angular-fire.js.map
