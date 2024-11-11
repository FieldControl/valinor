/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Inject, Injectable, InjectionToken } from '../di';
import { NgZone } from '../zone/ng_zone';
import * as i0 from "../r3_symbols";
import * as i1 from "../zone/ng_zone";
/**
 * Internal injection token that can used to access an instance of a Testability class.
 *
 * This token acts as a bridge between the core bootstrap code and the `Testability` class. This is
 * needed to ensure that there are no direct references to the `Testability` class, so it can be
 * tree-shaken away (if not referenced). For the environments/setups when the `Testability` class
 * should be available, this token is used to add a provider that references the `Testability`
 * class. Otherwise, only this token is retained in a bundle, but the `Testability` class is not.
 */
export const TESTABILITY = new InjectionToken('');
/**
 * Internal injection token to retrieve Testability getter class instance.
 */
export const TESTABILITY_GETTER = new InjectionToken('');
/**
 * The Testability service provides testing hooks that can be accessed from
 * the browser.
 *
 * Angular applications bootstrapped using an NgModule (via `@NgModule.bootstrap` field) will also
 * instantiate Testability by default (in both development and production modes).
 *
 * For applications bootstrapped using the `bootstrapApplication` function, Testability is not
 * included by default. You can include it into your applications by getting the list of necessary
 * providers using the `provideProtractorTestingSupport()` function and adding them into the
 * `options.providers` array. Example:
 *
 * ```typescript
 * import {provideProtractorTestingSupport} from '@angular/platform-browser';
 *
 * await bootstrapApplication(RootComponent, providers: [provideProtractorTestingSupport()]);
 * ```
 *
 * @publicApi
 */
export class Testability {
    constructor(_ngZone, registry, testabilityGetter) {
        this._ngZone = _ngZone;
        this.registry = registry;
        this._isZoneStable = true;
        this._callbacks = [];
        this.taskTrackingZone = null;
        // If there was no Testability logic registered in the global scope
        // before, register the current testability getter as a global one.
        if (!_testabilityGetter) {
            setTestabilityGetter(testabilityGetter);
            testabilityGetter.addToWindow(registry);
        }
        this._watchAngularEvents();
        _ngZone.run(() => {
            this.taskTrackingZone =
                typeof Zone == 'undefined' ? null : Zone.current.get('TaskTrackingZone');
        });
    }
    _watchAngularEvents() {
        this._ngZone.onUnstable.subscribe({
            next: () => {
                this._isZoneStable = false;
            },
        });
        this._ngZone.runOutsideAngular(() => {
            this._ngZone.onStable.subscribe({
                next: () => {
                    NgZone.assertNotInAngularZone();
                    queueMicrotask(() => {
                        this._isZoneStable = true;
                        this._runCallbacksIfReady();
                    });
                },
            });
        });
    }
    /**
     * Whether an associated application is stable
     */
    isStable() {
        return this._isZoneStable && !this._ngZone.hasPendingMacrotasks;
    }
    _runCallbacksIfReady() {
        if (this.isStable()) {
            // Schedules the call backs in a new frame so that it is always async.
            queueMicrotask(() => {
                while (this._callbacks.length !== 0) {
                    let cb = this._callbacks.pop();
                    clearTimeout(cb.timeoutId);
                    cb.doneCb();
                }
            });
        }
        else {
            // Still not stable, send updates.
            let pending = this.getPendingTasks();
            this._callbacks = this._callbacks.filter((cb) => {
                if (cb.updateCb && cb.updateCb(pending)) {
                    clearTimeout(cb.timeoutId);
                    return false;
                }
                return true;
            });
        }
    }
    getPendingTasks() {
        if (!this.taskTrackingZone) {
            return [];
        }
        // Copy the tasks data so that we don't leak tasks.
        return this.taskTrackingZone.macroTasks.map((t) => {
            return {
                source: t.source,
                // From TaskTrackingZone:
                // https://github.com/angular/zone.js/blob/master/lib/zone-spec/task-tracking.ts#L40
                creationLocation: t.creationLocation,
                data: t.data,
            };
        });
    }
    addCallback(cb, timeout, updateCb) {
        let timeoutId = -1;
        if (timeout && timeout > 0) {
            timeoutId = setTimeout(() => {
                this._callbacks = this._callbacks.filter((cb) => cb.timeoutId !== timeoutId);
                cb();
            }, timeout);
        }
        this._callbacks.push({ doneCb: cb, timeoutId: timeoutId, updateCb: updateCb });
    }
    /**
     * Wait for the application to be stable with a timeout. If the timeout is reached before that
     * happens, the callback receives a list of the macro tasks that were pending, otherwise null.
     *
     * @param doneCb The callback to invoke when Angular is stable or the timeout expires
     *    whichever comes first.
     * @param timeout Optional. The maximum time to wait for Angular to become stable. If not
     *    specified, whenStable() will wait forever.
     * @param updateCb Optional. If specified, this callback will be invoked whenever the set of
     *    pending macrotasks changes. If this callback returns true doneCb will not be invoked
     *    and no further updates will be issued.
     */
    whenStable(doneCb, timeout, updateCb) {
        if (updateCb && !this.taskTrackingZone) {
            throw new Error('Task tracking zone is required when passing an update callback to ' +
                'whenStable(). Is "zone.js/plugins/task-tracking" loaded?');
        }
        this.addCallback(doneCb, timeout, updateCb);
        this._runCallbacksIfReady();
    }
    /**
     * Registers an application with a testability hook so that it can be tracked.
     * @param token token of application, root element
     *
     * @internal
     */
    registerApplication(token) {
        this.registry.registerApplication(token, this);
    }
    /**
     * Unregisters an application.
     * @param token token of application, root element
     *
     * @internal
     */
    unregisterApplication(token) {
        this.registry.unregisterApplication(token);
    }
    /**
     * Find providers by name
     * @param using The root element to search from
     * @param provider The name of binding variable
     * @param exactMatch Whether using exactMatch
     */
    findProviders(using, provider, exactMatch) {
        // TODO(juliemr): implement.
        return [];
    }
    static { this.ɵfac = function Testability_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || Testability)(i0.ɵɵinject(i1.NgZone), i0.ɵɵinject(TestabilityRegistry), i0.ɵɵinject(TESTABILITY_GETTER)); }; }
    static { this.ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: Testability, factory: Testability.ɵfac }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.setClassMetadata(Testability, [{
        type: Injectable
    }], () => [{ type: i1.NgZone }, { type: TestabilityRegistry }, { type: undefined, decorators: [{
                type: Inject,
                args: [TESTABILITY_GETTER]
            }] }], null); })();
/**
 * A global registry of {@link Testability} instances for specific elements.
 * @publicApi
 */
export class TestabilityRegistry {
    constructor() {
        /** @internal */
        this._applications = new Map();
    }
    /**
     * Registers an application with a testability hook so that it can be tracked
     * @param token token of application, root element
     * @param testability Testability hook
     */
    registerApplication(token, testability) {
        this._applications.set(token, testability);
    }
    /**
     * Unregisters an application.
     * @param token token of application, root element
     */
    unregisterApplication(token) {
        this._applications.delete(token);
    }
    /**
     * Unregisters all applications
     */
    unregisterAllApplications() {
        this._applications.clear();
    }
    /**
     * Get a testability hook associated with the application
     * @param elem root element
     */
    getTestability(elem) {
        return this._applications.get(elem) || null;
    }
    /**
     * Get all registered testabilities
     */
    getAllTestabilities() {
        return Array.from(this._applications.values());
    }
    /**
     * Get all registered applications(root elements)
     */
    getAllRootElements() {
        return Array.from(this._applications.keys());
    }
    /**
     * Find testability of a node in the Tree
     * @param elem node
     * @param findInAncestors whether finding testability in ancestors if testability was not found in
     * current node
     */
    findTestabilityInTree(elem, findInAncestors = true) {
        return _testabilityGetter?.findTestabilityInTree(this, elem, findInAncestors) ?? null;
    }
    static { this.ɵfac = function TestabilityRegistry_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || TestabilityRegistry)(); }; }
    static { this.ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: TestabilityRegistry, factory: TestabilityRegistry.ɵfac, providedIn: 'platform' }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.setClassMetadata(TestabilityRegistry, [{
        type: Injectable,
        args: [{ providedIn: 'platform' }]
    }], null, null); })();
/**
 * Set the {@link GetTestability} implementation used by the Angular testing framework.
 * @publicApi
 */
export function setTestabilityGetter(getter) {
    _testabilityGetter = getter;
}
let _testabilityGetter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdGFiaWxpdHkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy90ZXN0YWJpbGl0eS90ZXN0YWJpbGl0eS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsTUFBTSxFQUFFLFVBQVUsRUFBRSxjQUFjLEVBQUMsTUFBTSxPQUFPLENBQUM7QUFDekQsT0FBTyxFQUFDLE1BQU0sRUFBQyxNQUFNLGlCQUFpQixDQUFDOzs7QUFvQ3ZDOzs7Ozs7OztHQVFHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sV0FBVyxHQUFHLElBQUksY0FBYyxDQUFjLEVBQUUsQ0FBQyxDQUFDO0FBRS9EOztHQUVHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxjQUFjLENBQWlCLEVBQUUsQ0FBQyxDQUFDO0FBRXpFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBbUJHO0FBRUgsTUFBTSxPQUFPLFdBQVc7SUFNdEIsWUFDVSxPQUFlLEVBQ2YsUUFBNkIsRUFDVCxpQkFBaUM7UUFGckQsWUFBTyxHQUFQLE9BQU8sQ0FBUTtRQUNmLGFBQVEsR0FBUixRQUFRLENBQXFCO1FBUC9CLGtCQUFhLEdBQVksSUFBSSxDQUFDO1FBQzlCLGVBQVUsR0FBbUIsRUFBRSxDQUFDO1FBRWhDLHFCQUFnQixHQUFnQyxJQUFJLENBQUM7UUFPM0QsbUVBQW1FO1FBQ25FLG1FQUFtRTtRQUNuRSxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztZQUN4QixvQkFBb0IsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBQ3hDLGlCQUFpQixDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMxQyxDQUFDO1FBQ0QsSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7UUFDM0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUU7WUFDZixJQUFJLENBQUMsZ0JBQWdCO2dCQUNuQixP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RztJQUNILHFCQUFxQixDQUFDLElBQVUsRUFBRSxrQkFBMkIsSUFBSTtRQUMvRCxPQUFPLGtCQUFrQixFQUFFLHFCQUFxQixDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsZUFBZSxDQUFDLElBQUksSUFBSSxDQUFDO0lBQ3hGLENBQUM7b0hBMURVLG1CQUFtQjt1RUFBbkIsbUJBQW1CLFdBQW5CLG1CQUFtQixtQkFEUCxVQUFVOztnRkFDdEIsbUJBQW1CO2NBRC9CLFVBQVU7ZUFBQyxFQUFDLFVBQVUsRUFBRSxVQUFVLEVBQUM7O0FBNkVwQzs7O0dBR0c7QUFDSCxNQUFNLFVBQVUsb0JBQW9CLENBQUMsTUFBc0I7SUFDekQsa0JBQWtCLEdBQUcsTUFBTSxDQUFDO0FBQzlCLENBQUM7QUFFRCxJQUFJLGtCQUE4QyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuZGV2L2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdCwgSW5qZWN0YWJsZSwgSW5qZWN0aW9uVG9rZW59IGZyb20gJy4uL2RpJztcbmltcG9ydCB7Tmdab25lfSBmcm9tICcuLi96b25lL25nX3pvbmUnO1xuXG4vKipcbiAqIFRlc3RhYmlsaXR5IEFQSS5cbiAqIGBkZWNsYXJlYCBrZXl3b3JkIGNhdXNlcyB0c2lja2xlIHRvIGdlbmVyYXRlIGV4dGVybnMsIHNvIHRoZXNlIG1ldGhvZHMgYXJlXG4gKiBub3QgcmVuYW1lZCBieSBDbG9zdXJlIENvbXBpbGVyLlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZGVjbGFyZSBpbnRlcmZhY2UgUHVibGljVGVzdGFiaWxpdHkge1xuICBpc1N0YWJsZSgpOiBib29sZWFuO1xuICB3aGVuU3RhYmxlKGNhbGxiYWNrOiBGdW5jdGlvbiwgdGltZW91dD86IG51bWJlciwgdXBkYXRlQ2FsbGJhY2s/OiBGdW5jdGlvbik6IHZvaWQ7XG4gIGZpbmRQcm92aWRlcnModXNpbmc6IGFueSwgcHJvdmlkZXI6IHN0cmluZywgZXhhY3RNYXRjaDogYm9vbGVhbik6IGFueVtdO1xufVxuXG4vLyBBbmd1bGFyIGludGVybmFsLCBub3QgaW50ZW5kZWQgZm9yIHB1YmxpYyBBUEkuXG5leHBvcnQgaW50ZXJmYWNlIFBlbmRpbmdNYWNyb3Rhc2sge1xuICBzb3VyY2U6IHN0cmluZztcbiAgY3JlYXRpb25Mb2NhdGlvbjogRXJyb3I7XG4gIHJ1bkNvdW50PzogbnVtYmVyO1xuICBkYXRhPzogVGFza0RhdGE7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgVGFza0RhdGEge1xuICB0YXJnZXQ/OiBYTUxIdHRwUmVxdWVzdDtcbiAgZGVsYXk/OiBudW1iZXI7XG4gIGlzUGVyaW9kaWM/OiBib29sZWFuO1xufVxuXG5pbnRlcmZhY2UgV2FpdENhbGxiYWNrIHtcbiAgLy8gTmVlZHMgdG8gYmUgJ2FueScgLSBzZXRUaW1lb3V0IHJldHVybnMgYSBudW1iZXIgYWNjb3JkaW5nIHRvIEVTNiwgYnV0XG4gIC8vIG9uIE5vZGVKUyBpdCByZXR1cm5zIGEgVGltZXIuXG4gIHRpbWVvdXRJZDogYW55O1xuICBkb25lQ2I6IEZ1bmN0aW9uO1xuICB1cGRhdGVDYj86IEZ1bmN0aW9uO1xufVxuXG4vKipcbiAqIEludGVybmFsIGluamVjdGlvbiB0b2tlbiB0aGF0IGNhbiB1c2VkIHRvIGFjY2VzcyBhbiBpbnN0YW5jZSBvZiBhIFRlc3RhYmlsaXR5IGNsYXNzLlxuICpcbiAqIFRoaXMgdG9rZW4gYWN0cyBhcyBhIGJyaWRnZSBiZXR3ZWVuIHRoZSBjb3JlIGJvb3RzdHJhcCBjb2RlIGFuZCB0aGUgYFRlc3RhYmlsaXR5YCBjbGFzcy4gVGhpcyBpc1xuICogbmVlZGVkIHRvIGVuc3VyZSB0aGF0IHRoZXJlIGFyZSBubyBkaXJlY3QgcmVmZXJlbmNlcyB0byB0aGUgYFRlc3RhYmlsaXR5YCBjbGFzcywgc28gaXQgY2FuIGJlXG4gKiB0cmVlLXNoYWtlbiBhd2F5IChpZiBub3QgcmVmZXJlbmNlZCkuIEZvciB0aGUgZW52aXJvbm1lbnRzL3NldHVwcyB3aGVuIHRoZSBgVGVzdGFiaWxpdHlgIGNsYXNzXG4gKiBzaG91bGQgYmUgYXZhaWxhYmxlLCB0aGlzIHRva2VuIGlzIHVzZWQgdG8gYWRkIGEgcHJvdmlkZXIgdGhhdCByZWZlcmVuY2VzIHRoZSBgVGVzdGFiaWxpdHlgXG4gKiBjbGFzcy4gT3RoZXJ3aXNlLCBvbmx5IHRoaXMgdG9rZW4gaXMgcmV0YWluZWQgaW4gYSBidW5kbGUsIGJ1dCB0aGUgYFRlc3RhYmlsaXR5YCBjbGFzcyBpcyBub3QuXG4gKi9cbmV4cG9ydCBjb25zdCBURVNUQUJJTElUWSA9IG5ldyBJbmplY3Rpb25Ub2tlbjxUZXN0YWJpbGl0eT4oJycpO1xuXG4vKipcbiAqIEludGVybmFsIGluamVjdGlvbiB0b2tlbiB0byByZXRyaWV2ZSBUZXN0YWJpbGl0eSBnZXR0ZXIgY2xhc3MgaW5zdGFuY2UuXG4gKi9cbmV4cG9ydCBjb25zdCBURVNUQUJJTElUWV9HRVRURVIgPSBuZXcgSW5qZWN0aW9uVG9rZW48R2V0VGVzdGFiaWxpdHk+KCcnKTtcblxuLyoqXG4gKiBUaGUgVGVzdGFiaWxpdHkgc2VydmljZSBwcm92aWRlcyB0ZXN0aW5nIGhvb2tzIHRoYXQgY2FuIGJlIGFjY2Vzc2VkIGZyb21cbiAqIHRoZSBicm93c2VyLlxuICpcbiAqIEFuZ3VsYXIgYXBwbGljYXRpb25zIGJvb3RzdHJhcHBlZCB1c2luZyBhbiBOZ01vZHVsZSAodmlhIGBATmdNb2R1bGUuYm9vdHN0cmFwYCBmaWVsZCkgd2lsbCBhbHNvXG4gKiBpbnN0YW50aWF0ZSBUZXN0YWJpbGl0eSBieSBkZWZhdWx0IChpbiBib3RoIGRldmVsb3BtZW50IGFuZCBwcm9kdWN0aW9uIG1vZGVzKS5cbiAqXG4gKiBGb3IgYXBwbGljYXRpb25zIGJvb3RzdHJhcHBlZCB1c2luZyB0aGUgYGJvb3RzdHJhcEFwcGxpY2F0aW9uYCBmdW5jdGlvbiwgVGVzdGFiaWxpdHkgaXMgbm90XG4gKiBpbmNsdWRlZCBieSBkZWZhdWx0LiBZb3UgY2FuIGluY2x1ZGUgaXQgaW50byB5b3VyIGFwcGxpY2F0aW9ucyBieSBnZXR0aW5nIHRoZSBsaXN0IG9mIG5lY2Vzc2FyeVxuICogcHJvdmlkZXJzIHVzaW5nIHRoZSBgcHJvdmlkZVByb3RyYWN0b3JUZXN0aW5nU3VwcG9ydCgpYCBmdW5jdGlvbiBhbmQgYWRkaW5nIHRoZW0gaW50byB0aGVcbiAqIGBvcHRpb25zLnByb3ZpZGVyc2AgYXJyYXkuIEV4YW1wbGU6XG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogaW1wb3J0IHtwcm92aWRlUHJvdHJhY3RvclRlc3RpbmdTdXBwb3J0fSBmcm9tICdAYW5ndWxhci9wbGF0Zm9ybS1icm93c2VyJztcbiAqXG4gKiBhd2FpdCBib290c3RyYXBBcHBsaWNhdGlvbihSb290Q29tcG9uZW50LCBwcm92aWRlcnM6IFtwcm92aWRlUHJvdHJhY3RvclRlc3RpbmdTdXBwb3J0KCldKTtcbiAqIGBgYFxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFRlc3RhYmlsaXR5IGltcGxlbWVudHMgUHVibGljVGVzdGFiaWxpdHkge1xuICBwcml2YXRlIF9pc1pvbmVTdGFibGU6IGJvb2xlYW4gPSB0cnVlO1xuICBwcml2YXRlIF9jYWxsYmFja3M6IFdhaXRDYWxsYmFja1tdID0gW107XG5cbiAgcHJpdmF0ZSB0YXNrVHJhY2tpbmdab25lOiB7bWFjcm9UYXNrczogVGFza1tdfSB8IG51bGwgPSBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgX25nWm9uZTogTmdab25lLFxuICAgIHByaXZhdGUgcmVnaXN0cnk6IFRlc3RhYmlsaXR5UmVnaXN0cnksXG4gICAgQEluamVjdChURVNUQUJJTElUWV9HRVRURVIpIHRlc3RhYmlsaXR5R2V0dGVyOiBHZXRUZXN0YWJpbGl0eSxcbiAgKSB7XG4gICAgLy8gSWYgdGhlcmUgd2FzIG5vIFRlc3RhYmlsaXR5IGxvZ2ljIHJlZ2lzdGVyZWQgaW4gdGhlIGdsb2JhbCBzY29wZVxuICAgIC8vIGJlZm9yZSwgcmVnaXN0ZXIgdGhlIGN1cnJlbnQgdGVzdGFiaWxpdHkgZ2V0dGVyIGFzIGEgZ2xvYmFsIG9uZS5cbiAgICBpZiAoIV90ZXN0YWJpbGl0eUdldHRlcikge1xuICAgICAgc2V0VGVzdGFiaWxpdHlHZXR0ZXIodGVzdGFiaWxpdHlHZXR0ZXIpO1xuICAgICAgdGVzdGFiaWxpdHlHZXR0ZXIuYWRkVG9XaW5kb3cocmVnaXN0cnkpO1xuICAgIH1cbiAgICB0aGlzLl93YXRjaEFuZ3VsYXJFdmVudHMoKTtcbiAgICBfbmdab25lLnJ1bigoKSA9PiB7XG4gICAgICB0aGlzLnRhc2tUcmFja2luZ1pvbmUgPVxuICAgICAgICB0eXBlb2YgWm9uZSA9PSAndW5kZWZpbmVkJyA/IG51bGwgOiBab25lLmN1cnJlbnQuZ2V0KCdUYXNrVHJhY2tpbmdab25lJyk7XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIF93YXRjaEFuZ3VsYXJFdmVudHMoKTogdm9pZCB7XG4gICAgdGhpcy5fbmdab25lLm9uVW5zdGFibGUuc3Vic2NyaWJlKHtcbiAgICAgIG5leHQ6ICgpID0+IHtcbiAgICAgICAgdGhpcy5faXNab25lU3RhYmxlID0gZmFsc2U7XG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgdGhpcy5fbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgIHRoaXMuX25nWm9uZS5vblN0YWJsZS5zdWJzY3JpYmUoe1xuICAgICAgICBuZXh0OiAoKSA9PiB7XG4gICAgICAgICAgTmdab25lLmFzc2VydE5vdEluQW5ndWxhclpvbmUoKTtcbiAgICAgICAgICBxdWV1ZU1pY3JvdGFzaygoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLl9pc1pvbmVTdGFibGUgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5fcnVuQ2FsbGJhY2tzSWZSZWFkeSgpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogV2hldGhlciBhbiBhc3NvY2lhdGVkIGFwcGxpY2F0aW9uIGlzIHN0YWJsZVxuICAgKi9cbiAgaXNTdGFibGUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2lzWm9uZVN0YWJsZSAmJiAhdGhpcy5fbmdab25lLmhhc1BlbmRpbmdNYWNyb3Rhc2tzO1xuICB9XG5cbiAgcHJpdmF0ZSBfcnVuQ2FsbGJhY2tzSWZSZWFkeSgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5pc1N0YWJsZSgpKSB7XG4gICAgICAvLyBTY2hlZHVsZXMgdGhlIGNhbGwgYmFja3MgaW4gYSBuZXcgZnJhbWUgc28gdGhhdCBpdCBpcyBhbHdheXMgYXN5bmMuXG4gICAgICBxdWV1ZU1pY3JvdGFzaygoKSA9PiB7XG4gICAgICAgIHdoaWxlICh0aGlzLl9jYWxsYmFja3MubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgbGV0IGNiID0gdGhpcy5fY2FsbGJhY2tzLnBvcCgpITtcbiAgICAgICAgICBjbGVhclRpbWVvdXQoY2IudGltZW91dElkKTtcbiAgICAgICAgICBjYi5kb25lQ2IoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFN0aWxsIG5vdCBzdGFibGUsIHNlbmQgdXBkYXRlcy5cbiAgICAgIGxldCBwZW5kaW5nID0gdGhpcy5nZXRQZW5kaW5nVGFza3MoKTtcbiAgICAgIHRoaXMuX2NhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrcy5maWx0ZXIoKGNiKSA9PiB7XG4gICAgICAgIGlmIChjYi51cGRhdGVDYiAmJiBjYi51cGRhdGVDYihwZW5kaW5nKSkge1xuICAgICAgICAgIGNsZWFyVGltZW91dChjYi50aW1lb3V0SWQpO1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBnZXRQZW5kaW5nVGFza3MoKTogUGVuZGluZ01hY3JvdGFza1tdIHtcbiAgICBpZiAoIXRoaXMudGFza1RyYWNraW5nWm9uZSkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIC8vIENvcHkgdGhlIHRhc2tzIGRhdGEgc28gdGhhdCB3ZSBkb24ndCBsZWFrIHRhc2tzLlxuICAgIHJldHVybiB0aGlzLnRhc2tUcmFja2luZ1pvbmUubWFjcm9UYXNrcy5tYXAoKHQ6IFRhc2spID0+IHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHNvdXJjZTogdC5zb3VyY2UsXG4gICAgICAgIC8vIEZyb20gVGFza1RyYWNraW5nWm9uZTpcbiAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvem9uZS5qcy9ibG9iL21hc3Rlci9saWIvem9uZS1zcGVjL3Rhc2stdHJhY2tpbmcudHMjTDQwXG4gICAgICAgIGNyZWF0aW9uTG9jYXRpb246ICh0IGFzIGFueSkuY3JlYXRpb25Mb2NhdGlvbiBhcyBFcnJvcixcbiAgICAgICAgZGF0YTogdC5kYXRhLFxuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgYWRkQ2FsbGJhY2soY2I6IEZ1bmN0aW9uLCB0aW1lb3V0PzogbnVtYmVyLCB1cGRhdGVDYj86IEZ1bmN0aW9uKSB7XG4gICAgbGV0IHRpbWVvdXRJZDogYW55ID0gLTE7XG4gICAgaWYgKHRpbWVvdXQgJiYgdGltZW91dCA+IDApIHtcbiAgICAgIHRpbWVvdXRJZCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLl9jYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3MuZmlsdGVyKChjYikgPT4gY2IudGltZW91dElkICE9PSB0aW1lb3V0SWQpO1xuICAgICAgICBjYigpO1xuICAgICAgfSwgdGltZW91dCk7XG4gICAgfVxuICAgIHRoaXMuX2NhbGxiYWNrcy5wdXNoKDxXYWl0Q2FsbGJhY2s+e2RvbmVDYjogY2IsIHRpbWVvdXRJZDogdGltZW91dElkLCB1cGRhdGVDYjogdXBkYXRlQ2J9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBXYWl0IGZvciB0aGUgYXBwbGljYXRpb24gdG8gYmUgc3RhYmxlIHdpdGggYSB0aW1lb3V0LiBJZiB0aGUgdGltZW91dCBpcyByZWFjaGVkIGJlZm9yZSB0aGF0XG4gICAqIGhhcHBlbnMsIHRoZSBjYWxsYmFjayByZWNlaXZlcyBhIGxpc3Qgb2YgdGhlIG1hY3JvIHRhc2tzIHRoYXQgd2VyZSBwZW5kaW5nLCBvdGhlcndpc2UgbnVsbC5cbiAgICpcbiAgICogQHBhcmFtIGRvbmVDYiBUaGUgY2FsbGJhY2sgdG8gaW52b2tlIHdoZW4gQW5ndWxhciBpcyBzdGFibGUgb3IgdGhlIHRpbWVvdXQgZXhwaXJlc1xuICAgKiAgICB3aGljaGV2ZXIgY29tZXMgZmlyc3QuXG4gICAqIEBwYXJhbSB0aW1lb3V0IE9wdGlvbmFsLiBUaGUgbWF4aW11bSB0aW1lIHRvIHdhaXQgZm9yIEFuZ3VsYXIgdG8gYmVjb21lIHN0YWJsZS4gSWYgbm90XG4gICAqICAgIHNwZWNpZmllZCwgd2hlblN0YWJsZSgpIHdpbGwgd2FpdCBmb3JldmVyLlxuICAgKiBAcGFyYW0gdXBkYXRlQ2IgT3B0aW9uYWwuIElmIHNwZWNpZmllZCwgdGhpcyBjYWxsYmFjayB3aWxsIGJlIGludm9rZWQgd2hlbmV2ZXIgdGhlIHNldCBvZlxuICAgKiAgICBwZW5kaW5nIG1hY3JvdGFza3MgY2hhbmdlcy4gSWYgdGhpcyBjYWxsYmFjayByZXR1cm5zIHRydWUgZG9uZUNiIHdpbGwgbm90IGJlIGludm9rZWRcbiAgICogICAgYW5kIG5vIGZ1cnRoZXIgdXBkYXRlcyB3aWxsIGJlIGlzc3VlZC5cbiAgICovXG4gIHdoZW5TdGFibGUoZG9uZUNiOiBGdW5jdGlvbiwgdGltZW91dD86IG51bWJlciwgdXBkYXRlQ2I/OiBGdW5jdGlvbik6IHZvaWQge1xuICAgIGlmICh1cGRhdGVDYiAmJiAhdGhpcy50YXNrVHJhY2tpbmdab25lKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICdUYXNrIHRyYWNraW5nIHpvbmUgaXMgcmVxdWlyZWQgd2hlbiBwYXNzaW5nIGFuIHVwZGF0ZSBjYWxsYmFjayB0byAnICtcbiAgICAgICAgICAnd2hlblN0YWJsZSgpLiBJcyBcInpvbmUuanMvcGx1Z2lucy90YXNrLXRyYWNraW5nXCIgbG9hZGVkPycsXG4gICAgICApO1xuICAgIH1cbiAgICB0aGlzLmFkZENhbGxiYWNrKGRvbmVDYiwgdGltZW91dCwgdXBkYXRlQ2IpO1xuICAgIHRoaXMuX3J1bkNhbGxiYWNrc0lmUmVhZHkoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlcnMgYW4gYXBwbGljYXRpb24gd2l0aCBhIHRlc3RhYmlsaXR5IGhvb2sgc28gdGhhdCBpdCBjYW4gYmUgdHJhY2tlZC5cbiAgICogQHBhcmFtIHRva2VuIHRva2VuIG9mIGFwcGxpY2F0aW9uLCByb290IGVsZW1lbnRcbiAgICpcbiAgICogQGludGVybmFsXG4gICAqL1xuICByZWdpc3RlckFwcGxpY2F0aW9uKHRva2VuOiBhbnkpIHtcbiAgICB0aGlzLnJlZ2lzdHJ5LnJlZ2lzdGVyQXBwbGljYXRpb24odG9rZW4sIHRoaXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFVucmVnaXN0ZXJzIGFuIGFwcGxpY2F0aW9uLlxuICAgKiBAcGFyYW0gdG9rZW4gdG9rZW4gb2YgYXBwbGljYXRpb24sIHJvb3QgZWxlbWVudFxuICAgKlxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIHVucmVnaXN0ZXJBcHBsaWNhdGlvbih0b2tlbjogYW55KSB7XG4gICAgdGhpcy5yZWdpc3RyeS51bnJlZ2lzdGVyQXBwbGljYXRpb24odG9rZW4pO1xuICB9XG5cbiAgLyoqXG4gICAqIEZpbmQgcHJvdmlkZXJzIGJ5IG5hbWVcbiAgICogQHBhcmFtIHVzaW5nIFRoZSByb290IGVsZW1lbnQgdG8gc2VhcmNoIGZyb21cbiAgICogQHBhcmFtIHByb3ZpZGVyIFRoZSBuYW1lIG9mIGJpbmRpbmcgdmFyaWFibGVcbiAgICogQHBhcmFtIGV4YWN0TWF0Y2ggV2hldGhlciB1c2luZyBleGFjdE1hdGNoXG4gICAqL1xuICBmaW5kUHJvdmlkZXJzKHVzaW5nOiBhbnksIHByb3ZpZGVyOiBzdHJpbmcsIGV4YWN0TWF0Y2g6IGJvb2xlYW4pOiBhbnlbXSB7XG4gICAgLy8gVE9ETyhqdWxpZW1yKTogaW1wbGVtZW50LlxuICAgIHJldHVybiBbXTtcbiAgfVxufVxuXG4vKipcbiAqIEEgZ2xvYmFsIHJlZ2lzdHJ5IG9mIHtAbGluayBUZXN0YWJpbGl0eX0gaW5zdGFuY2VzIGZvciBzcGVjaWZpYyBlbGVtZW50cy5cbiAqIEBwdWJsaWNBcGlcbiAqL1xuQEluamVjdGFibGUoe3Byb3ZpZGVkSW46ICdwbGF0Zm9ybSd9KVxuZXhwb3J0IGNsYXNzIFRlc3RhYmlsaXR5UmVnaXN0cnkge1xuICAvKiogQGludGVybmFsICovXG4gIF9hcHBsaWNhdGlvbnMgPSBuZXcgTWFwPGFueSwgVGVzdGFiaWxpdHk+KCk7XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVycyBhbiBhcHBsaWNhdGlvbiB3aXRoIGEgdGVzdGFiaWxpdHkgaG9vayBzbyB0aGF0IGl0IGNhbiBiZSB0cmFja2VkXG4gICAqIEBwYXJhbSB0b2tlbiB0b2tlbiBvZiBhcHBsaWNhdGlvbiwgcm9vdCBlbGVtZW50XG4gICAqIEBwYXJhbSB0ZXN0YWJpbGl0eSBUZXN0YWJpbGl0eSBob29rXG4gICAqL1xuICByZWdpc3RlckFwcGxpY2F0aW9uKHRva2VuOiBhbnksIHRlc3RhYmlsaXR5OiBUZXN0YWJpbGl0eSkge1xuICAgIHRoaXMuX2FwcGxpY2F0aW9ucy5zZXQodG9rZW4sIHRlc3RhYmlsaXR5KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVbnJlZ2lzdGVycyBhbiBhcHBsaWNhdGlvbi5cbiAgICogQHBhcmFtIHRva2VuIHRva2VuIG9mIGFwcGxpY2F0aW9uLCByb290IGVsZW1lbnRcbiAgICovXG4gIHVucmVnaXN0ZXJBcHBsaWNhdGlvbih0b2tlbjogYW55KSB7XG4gICAgdGhpcy5fYXBwbGljYXRpb25zLmRlbGV0ZSh0b2tlbik7XG4gIH1cblxuICAvKipcbiAgICogVW5yZWdpc3RlcnMgYWxsIGFwcGxpY2F0aW9uc1xuICAgKi9cbiAgdW5yZWdpc3RlckFsbEFwcGxpY2F0aW9ucygpIHtcbiAgICB0aGlzLl9hcHBsaWNhdGlvbnMuY2xlYXIoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYSB0ZXN0YWJpbGl0eSBob29rIGFzc29jaWF0ZWQgd2l0aCB0aGUgYXBwbGljYXRpb25cbiAgICogQHBhcmFtIGVsZW0gcm9vdCBlbGVtZW50XG4gICAqL1xuICBnZXRUZXN0YWJpbGl0eShlbGVtOiBhbnkpOiBUZXN0YWJpbGl0eSB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLl9hcHBsaWNhdGlvbnMuZ2V0KGVsZW0pIHx8IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGFsbCByZWdpc3RlcmVkIHRlc3RhYmlsaXRpZXNcbiAgICovXG4gIGdldEFsbFRlc3RhYmlsaXRpZXMoKTogVGVzdGFiaWxpdHlbXSB7XG4gICAgcmV0dXJuIEFycmF5LmZyb20odGhpcy5fYXBwbGljYXRpb25zLnZhbHVlcygpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYWxsIHJlZ2lzdGVyZWQgYXBwbGljYXRpb25zKHJvb3QgZWxlbWVudHMpXG4gICAqL1xuICBnZXRBbGxSb290RWxlbWVudHMoKTogYW55W10ge1xuICAgIHJldHVybiBBcnJheS5mcm9tKHRoaXMuX2FwcGxpY2F0aW9ucy5rZXlzKCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEZpbmQgdGVzdGFiaWxpdHkgb2YgYSBub2RlIGluIHRoZSBUcmVlXG4gICAqIEBwYXJhbSBlbGVtIG5vZGVcbiAgICogQHBhcmFtIGZpbmRJbkFuY2VzdG9ycyB3aGV0aGVyIGZpbmRpbmcgdGVzdGFiaWxpdHkgaW4gYW5jZXN0b3JzIGlmIHRlc3RhYmlsaXR5IHdhcyBub3QgZm91bmQgaW5cbiAgICogY3VycmVudCBub2RlXG4gICAqL1xuICBmaW5kVGVzdGFiaWxpdHlJblRyZWUoZWxlbTogTm9kZSwgZmluZEluQW5jZXN0b3JzOiBib29sZWFuID0gdHJ1ZSk6IFRlc3RhYmlsaXR5IHwgbnVsbCB7XG4gICAgcmV0dXJuIF90ZXN0YWJpbGl0eUdldHRlcj8uZmluZFRlc3RhYmlsaXR5SW5UcmVlKHRoaXMsIGVsZW0sIGZpbmRJbkFuY2VzdG9ycykgPz8gbnVsbDtcbiAgfVxufVxuXG4vKipcbiAqIEFkYXB0ZXIgaW50ZXJmYWNlIGZvciByZXRyaWV2aW5nIHRoZSBgVGVzdGFiaWxpdHlgIHNlcnZpY2UgYXNzb2NpYXRlZCBmb3IgYVxuICogcGFydGljdWxhciBjb250ZXh0LlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBHZXRUZXN0YWJpbGl0eSB7XG4gIGFkZFRvV2luZG93KHJlZ2lzdHJ5OiBUZXN0YWJpbGl0eVJlZ2lzdHJ5KTogdm9pZDtcbiAgZmluZFRlc3RhYmlsaXR5SW5UcmVlKFxuICAgIHJlZ2lzdHJ5OiBUZXN0YWJpbGl0eVJlZ2lzdHJ5LFxuICAgIGVsZW06IGFueSxcbiAgICBmaW5kSW5BbmNlc3RvcnM6IGJvb2xlYW4sXG4gICk6IFRlc3RhYmlsaXR5IHwgbnVsbDtcbn1cblxuLyoqXG4gKiBTZXQgdGhlIHtAbGluayBHZXRUZXN0YWJpbGl0eX0gaW1wbGVtZW50YXRpb24gdXNlZCBieSB0aGUgQW5ndWxhciB0ZXN0aW5nIGZyYW1ld29yay5cbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldFRlc3RhYmlsaXR5R2V0dGVyKGdldHRlcjogR2V0VGVzdGFiaWxpdHkpOiB2b2lkIHtcbiAgX3Rlc3RhYmlsaXR5R2V0dGVyID0gZ2V0dGVyO1xufVxuXG5sZXQgX3Rlc3RhYmlsaXR5R2V0dGVyOiBHZXRUZXN0YWJpbGl0eSB8IHVuZGVmaW5lZDtcbiJdfQ==