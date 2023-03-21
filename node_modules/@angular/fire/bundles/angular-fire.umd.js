(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('firebase/app'), require('firebase/remote-config'), require('firebase/messaging'), require('firebase/analytics'), require('rxjs'), require('rxjs/operators')) :
    typeof define === 'function' && define.amd ? define('@angular/fire', ['exports', '@angular/core', 'firebase/app', 'firebase/remote-config', 'firebase/messaging', 'firebase/analytics', 'rxjs', 'rxjs/operators'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.angular = global.angular || {}, global.angular.fire = {}), global.ng, global.firebase, global.remoteConfig, global.messaging, global.analytics, global.rxjs, global.rxjs.operators));
}(this, (function (exports, i0, app, remoteConfig, messaging, analytics, rxjs, operators) { 'use strict';

    function _interopNamespace(e) {
        if (e && e.__esModule) return e;
        var n = Object.create(null);
        if (e) {
            Object.keys(e).forEach(function (k) {
                if (k !== 'default') {
                    var d = Object.getOwnPropertyDescriptor(e, k);
                    Object.defineProperty(n, k, d.get ? d : {
                        enumerable: true,
                        get: function () {
                            return e[k];
                        }
                    });
                }
            });
        }
        n['default'] = e;
        return Object.freeze(n);
    }

    var i0__namespace = /*#__PURE__*/_interopNamespace(i0);

    var VERSION = new i0.Version('7.5.0');
    var isAnalyticsSupportedValueSymbol = '__angularfire_symbol__analyticsIsSupportedValue';
    var isAnalyticsSupportedPromiseSymbol = '__angularfire_symbol__analyticsIsSupported';
    var isRemoteConfigSupportedValueSymbol = '__angularfire_symbol__remoteConfigIsSupportedValue';
    var isRemoteConfigSupportedPromiseSymbol = '__angularfire_symbol__remoteConfigIsSupported';
    var isMessagingSupportedValueSymbol = '__angularfire_symbol__messagingIsSupportedValue';
    var isMessagingSupportedPromiseSymbol = '__angularfire_symbol__messagingIsSupported';
    globalThis[isAnalyticsSupportedPromiseSymbol] || (globalThis[isAnalyticsSupportedPromiseSymbol] = analytics.isSupported().then(function (it) { return globalThis[isAnalyticsSupportedValueSymbol] = it; }).catch(function () { return globalThis[isAnalyticsSupportedValueSymbol] = false; }));
    globalThis[isMessagingSupportedPromiseSymbol] || (globalThis[isMessagingSupportedPromiseSymbol] = messaging.isSupported().then(function (it) { return globalThis[isMessagingSupportedValueSymbol] = it; }).catch(function () { return globalThis[isMessagingSupportedValueSymbol] = false; }));
    globalThis[isRemoteConfigSupportedPromiseSymbol] || (globalThis[isRemoteConfigSupportedPromiseSymbol] = remoteConfig.isSupported().then(function (it) { return globalThis[isRemoteConfigSupportedValueSymbol] = it; }).catch(function () { return globalThis[isRemoteConfigSupportedValueSymbol] = false; }));
    var isSupportedError = function (module) { return "The APP_INITIALIZER that is \"making\" isSupported() sync for the sake of convenient DI has not resolved in this\ncontext. Rather than injecting " + module + " in the constructor, first ensure that " + module + " is supported by calling\n`await isSupported()`, then retrieve the instance from the injector manually `injector.get(" + module + ")`."; };
    var ɵisMessagingSupportedFactory = {
        async: function () { return globalThis[isMessagingSupportedPromiseSymbol]; },
        sync: function () {
            var ret = globalThis[isMessagingSupportedValueSymbol];
            if (ret === undefined) {
                throw new Error(isSupportedError('Messaging'));
            }
            return ret;
        }
    };
    var ɵisRemoteConfigSupportedFactory = {
        async: function () { return globalThis[isRemoteConfigSupportedPromiseSymbol]; },
        sync: function () {
            var ret = globalThis[isRemoteConfigSupportedValueSymbol];
            if (ret === undefined) {
                throw new Error(isSupportedError('RemoteConfig'));
            }
            return ret;
        }
    };
    var ɵisAnalyticsSupportedFactory = {
        async: function () { return globalThis[isAnalyticsSupportedPromiseSymbol]; },
        sync: function () {
            var ret = globalThis[isAnalyticsSupportedValueSymbol];
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
            var providedUsingDefaultApp = provided.filter(function (it) { return it.app === defaultApp; });
            // Was provide* only called once, using the default app? If so use that
            if (providedUsingDefaultApp.length === 1) {
                return providedUsingDefaultApp[0];
            }
        }
        // Grab the default instance from the defaultApp
        var defaultAppWithContainer = defaultApp;
        var provider = defaultAppWithContainer.container.getProvider(identifier);
        return provider.getImmediate({ optional: true });
    }
    var ɵgetAllInstancesOf = function (identifier, app$1) {
        var apps = app$1 ? [app$1] : app.getApps();
        var instances = [];
        apps.forEach(function (app) {
            var provider = app.container.getProvider(identifier);
            provider.instances.forEach(function (instance) {
                if (!instances.includes(instance)) {
                    instances.push(instance);
                }
            });
        });
        return instances;
    };

    var _this_1 = this;
    function noop() {
    }
    /**
     * Schedules tasks so that they are invoked inside the Zone that is passed in the constructor.
     */
    // tslint:disable-next-line:class-name
    var ɵZoneScheduler = /** @class */ (function () {
        function ɵZoneScheduler(zone, delegate) {
            if (delegate === void 0) { delegate = rxjs.queueScheduler; }
            this.zone = zone;
            this.delegate = delegate;
        }
        ɵZoneScheduler.prototype.now = function () {
            return this.delegate.now();
        };
        ɵZoneScheduler.prototype.schedule = function (work, delay, state) {
            var targetZone = this.zone;
            // Wrap the specified work function to make sure that if nested scheduling takes place the
            // work is executed in the correct zone
            var workInZone = function (state) {
                var _this_1 = this;
                targetZone.runGuarded(function () {
                    work.apply(_this_1, [state]);
                });
            };
            // Scheduling itself needs to be run in zone to ensure setInterval calls for async scheduling are done
            // inside the correct zone. This scheduler needs to schedule asynchronously always to ensure that
            // firebase emissions are never synchronous. Specifying a delay causes issues with the queueScheduler delegate.
            return this.delegate.schedule(workInZone, delay, state);
        };
        return ɵZoneScheduler;
    }());
    var BlockUntilFirstOperator = /** @class */ (function () {
        function BlockUntilFirstOperator(zone) {
            this.zone = zone;
            this.task = null;
        }
        BlockUntilFirstOperator.prototype.call = function (subscriber, source) {
            var unscheduleTask = this.unscheduleTask.bind(this);
            this.task = this.zone.run(function () { return Zone.current.scheduleMacroTask('firebaseZoneBlock', noop, {}, noop, noop); });
            return source.pipe(operators.tap({ next: unscheduleTask, complete: unscheduleTask, error: unscheduleTask })).subscribe(subscriber).add(unscheduleTask);
        };
        BlockUntilFirstOperator.prototype.unscheduleTask = function () {
            var _this_1 = this;
            // maybe this is a race condition, invoke in a timeout
            // hold for 10ms while I try to figure out what is going on
            setTimeout(function () {
                if (_this_1.task != null && _this_1.task.state === 'scheduled') {
                    _this_1.task.invoke();
                    _this_1.task = null;
                }
            }, 10);
        };
        return BlockUntilFirstOperator;
    }());
    // tslint:disable-next-line:class-name
    var ɵAngularFireSchedulers = /** @class */ (function () {
        function ɵAngularFireSchedulers(ngZone) {
            this.ngZone = ngZone;
            this.outsideAngular = ngZone.runOutsideAngular(function () { return new ɵZoneScheduler(Zone.current); });
            this.insideAngular = ngZone.run(function () { return new ɵZoneScheduler(Zone.current, rxjs.asyncScheduler); });
            globalThis.ɵAngularFireScheduler || (globalThis.ɵAngularFireScheduler = this);
        }
        return ɵAngularFireSchedulers;
    }());
    ɵAngularFireSchedulers.ɵfac = i0__namespace.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0__namespace, type: ɵAngularFireSchedulers, deps: [{ token: i0__namespace.NgZone }], target: i0__namespace.ɵɵFactoryTarget.Injectable });
    ɵAngularFireSchedulers.ɵprov = i0__namespace.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0__namespace, type: ɵAngularFireSchedulers, providedIn: 'root' });
    i0__namespace.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0__namespace, type: ɵAngularFireSchedulers, decorators: [{
                type: i0.Injectable,
                args: [{
                        providedIn: 'root',
                    }]
            }], ctorParameters: function () { return [{ type: i0__namespace.NgZone }]; } });
    function getSchedulers() {
        var schedulers = globalThis.ɵAngularFireScheduler;
        if (!schedulers) {
            throw new Error("Either AngularFireModule has not been provided in your AppModule (this can be done manually or implictly using\nprovideFirebaseApp) or you're calling an AngularFire method outside of an NgModule (which is not supported).");
        }
        return schedulers;
    }
    function runOutsideAngular(fn) {
        return getSchedulers().ngZone.runOutsideAngular(function () { return fn(); });
    }
    function run(fn) {
        return getSchedulers().ngZone.run(function () { return fn(); });
    }
    function observeOutsideAngular(obs$) {
        return obs$.pipe(operators.observeOn(getSchedulers().outsideAngular));
    }
    function observeInsideAngular(obs$) {
        return obs$.pipe(operators.observeOn(getSchedulers().insideAngular));
    }
    function keepUnstableUntilFirst(obs$) {
        var scheduler = getSchedulers();
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
            operators.subscribeOn(schedulers.outsideAngular), 
            // Run operators inside the angular zone (e.g. side effects via tap())
            operators.observeOn(schedulers.insideAngular)
            // INVESTIGATE https://github.com/angular/angularfire/pull/2315
            // share()
            );
        };
    }
    var zoneWrapFn = function (it, macrotask) {
        var _this = _this_1;
        // function() is needed for the arguments object
        // tslint:disable-next-line:only-arrow-functions
        return function () {
            var _arguments = arguments;
            if (macrotask) {
                setTimeout(function () {
                    if (macrotask.state === 'scheduled') {
                        macrotask.invoke();
                    }
                }, 10);
            }
            return run(function () { return it.apply(_this, _arguments); });
        };
    };
    var ɵzoneWrap = function (it, blockUntilFirst) {
        // function() is needed for the arguments object
        // tslint:disable-next-line:only-arrow-functions
        return function () {
            var _this_1 = this;
            var macrotask;
            var _arguments = arguments;
            // if this is a callback function, e.g, onSnapshot, we should create a microtask and invoke it
            // only once one of the callback functions is tripped.
            for (var i = 0; i < arguments.length; i++) {
                if (typeof _arguments[i] === 'function') {
                    if (blockUntilFirst) {
                        macrotask || (macrotask = run(function () { return Zone.current.scheduleMacroTask('firebaseZoneBlock', noop, {}, noop, noop); }));
                    }
                    // TODO create a microtask to track callback functions
                    _arguments[i] = zoneWrapFn(_arguments[i], macrotask);
                }
            }
            var ret = runOutsideAngular(function () { return it.apply(_this_1, _arguments); });
            if (!blockUntilFirst) {
                if (ret instanceof rxjs.Observable) {
                    var schedulers = getSchedulers();
                    return ret.pipe(operators.subscribeOn(schedulers.outsideAngular), operators.observeOn(schedulers.insideAngular));
                }
                else {
                    return run(function () { return ret; });
                }
            }
            if (ret instanceof rxjs.Observable) {
                return ret.pipe(keepUnstableUntilFirst);
            }
            else if (ret instanceof Promise) {
                return run(function () { return new Promise(function (resolve, reject) { return ret.then(function (it) { return run(function () { return resolve(it); }); }, function (reason) { return run(function () { return reject(reason); }); }); }); });
            }
            else if (typeof ret === 'function' && macrotask) {
                // Handle unsubscribe
                // function() is needed for the arguments object
                // tslint:disable-next-line:only-arrow-functions
                return function () {
                    setTimeout(function () {
                        if (macrotask && macrotask.state === 'scheduled') {
                            macrotask.invoke();
                        }
                    }, 10);
                    return ret.apply(this, arguments);
                };
            }
            else {
                // TODO how do we handle storage uploads in Zone? and other stuff with cancel() etc?
                return run(function () { return ret; });
            }
        };
    };

    /**
     * Generated bundle index. Do not edit.
     */

    exports.VERSION = VERSION;
    exports.keepUnstableUntilFirst = keepUnstableUntilFirst;
    exports.observeInsideAngular = observeInsideAngular;
    exports.observeOutsideAngular = observeOutsideAngular;
    exports.ɵAngularFireSchedulers = ɵAngularFireSchedulers;
    exports.ɵZoneScheduler = ɵZoneScheduler;
    exports.ɵgetAllInstancesOf = ɵgetAllInstancesOf;
    exports.ɵgetDefaultInstanceOf = ɵgetDefaultInstanceOf;
    exports.ɵisAnalyticsSupportedFactory = ɵisAnalyticsSupportedFactory;
    exports.ɵisMessagingSupportedFactory = ɵisMessagingSupportedFactory;
    exports.ɵisRemoteConfigSupportedFactory = ɵisRemoteConfigSupportedFactory;
    exports.ɵkeepUnstableUntilFirstFactory = ɵkeepUnstableUntilFirstFactory;
    exports.ɵzoneWrap = ɵzoneWrap;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=angular-fire.umd.js.map
