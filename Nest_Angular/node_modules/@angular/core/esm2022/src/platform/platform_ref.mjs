/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { compileNgModuleFactory } from '../application/application_ngmodule_factory_compiler';
import { optionsReducer, } from '../application/application_ref';
import { getNgZoneOptions, internalProvideZoneChangeDetection, } from '../change_detection/scheduling/ng_zone_scheduling';
import { ChangeDetectionScheduler } from '../change_detection/scheduling/zoneless_scheduling';
import { ChangeDetectionSchedulerImpl } from '../change_detection/scheduling/zoneless_scheduling_impl';
import { Injectable, Injector } from '../di';
import { RuntimeError } from '../errors';
import { createNgModuleRefWithProviders } from '../render3/ng_module_ref';
import { getNgZone } from '../zone/ng_zone';
import { bootstrap } from './bootstrap';
import { PLATFORM_DESTROY_LISTENERS } from './platform_destroy_listeners';
import * as i0 from "../r3_symbols";
import * as i1 from "../di";
/**
 * The Angular platform is the entry point for Angular on a web page.
 * Each page has exactly one platform. Services (such as reflection) which are common
 * to every Angular application running on the page are bound in its scope.
 * A page's platform is initialized implicitly when a platform is created using a platform
 * factory such as `PlatformBrowser`, or explicitly by calling the `createPlatform()` function.
 *
 * @publicApi
 */
export class PlatformRef {
    /** @internal */
    constructor(_injector) {
        this._injector = _injector;
        this._modules = [];
        this._destroyListeners = [];
        this._destroyed = false;
    }
    /**
     * Creates an instance of an `@NgModule` for the given platform.
     *
     * @deprecated Passing NgModule factories as the `PlatformRef.bootstrapModuleFactory` function
     *     argument is deprecated. Use the `PlatformRef.bootstrapModule` API instead.
     */
    bootstrapModuleFactory(moduleFactory, options) {
        const scheduleInRootZone = options?.scheduleInRootZone;
        const ngZoneFactory = () => getNgZone(options?.ngZone, {
            ...getNgZoneOptions({
                eventCoalescing: options?.ngZoneEventCoalescing,
                runCoalescing: options?.ngZoneRunCoalescing,
            }),
            scheduleInRootZone,
        });
        const ignoreChangesOutsideZone = options?.ignoreChangesOutsideZone;
        const allAppProviders = [
            internalProvideZoneChangeDetection({
                ngZoneFactory,
                ignoreChangesOutsideZone,
            }),
            { provide: ChangeDetectionScheduler, useExisting: ChangeDetectionSchedulerImpl },
        ];
        const moduleRef = createNgModuleRefWithProviders(moduleFactory.moduleType, this.injector, allAppProviders);
        return bootstrap({
            moduleRef,
            allPlatformModules: this._modules,
            platformInjector: this.injector,
        });
    }
    /**
     * Creates an instance of an `@NgModule` for a given platform.
     *
     * @usageNotes
     * ### Simple Example
     *
     * ```typescript
     * @NgModule({
     *   imports: [BrowserModule]
     * })
     * class MyModule {}
     *
     * let moduleRef = platformBrowser().bootstrapModule(MyModule);
     * ```
     *
     */
    bootstrapModule(moduleType, compilerOptions = []) {
        const options = optionsReducer({}, compilerOptions);
        return compileNgModuleFactory(this.injector, options, moduleType).then((moduleFactory) => this.bootstrapModuleFactory(moduleFactory, options));
    }
    /**
     * Registers a listener to be called when the platform is destroyed.
     */
    onDestroy(callback) {
        this._destroyListeners.push(callback);
    }
    /**
     * Retrieves the platform {@link Injector}, which is the parent injector for
     * every Angular application on the page and provides singleton providers.
     */
    get injector() {
        return this._injector;
    }
    /**
     * Destroys the current Angular platform and all Angular applications on the page.
     * Destroys all modules and listeners registered with the platform.
     */
    destroy() {
        if (this._destroyed) {
            throw new RuntimeError(404 /* RuntimeErrorCode.PLATFORM_ALREADY_DESTROYED */, ngDevMode && 'The platform has already been destroyed!');
        }
        this._modules.slice().forEach((module) => module.destroy());
        this._destroyListeners.forEach((listener) => listener());
        const destroyListeners = this._injector.get(PLATFORM_DESTROY_LISTENERS, null);
        if (destroyListeners) {
            destroyListeners.forEach((listener) => listener());
            destroyListeners.clear();
        }
        this._destroyed = true;
    }
    /**
     * Indicates whether this instance was destroyed.
     */
    get destroyed() {
        return this._destroyed;
    }
    static { this.ɵfac = function PlatformRef_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || PlatformRef)(i0.ɵɵinject(i1.Injector)); }; }
    static { this.ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: PlatformRef, factory: PlatformRef.ɵfac, providedIn: 'platform' }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.setClassMetadata(PlatformRef, [{
        type: Injectable,
        args: [{ providedIn: 'platform' }]
    }], () => [{ type: i1.Injector }], null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxhdGZvcm1fcmVmLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS9zcmMvcGxhdGZvcm0vcGxhdGZvcm1fcmVmLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxzQkFBc0IsRUFBQyxNQUFNLHNEQUFzRCxDQUFDO0FBQzVGLE9BQU8sRUFHTCxjQUFjLEdBQ2YsTUFBTSxnQ0FBZ0MsQ0FBQztBQUN4QyxPQUFPLEVBQ0wsZ0JBQWdCLEVBQ2hCLGtDQUFrQyxHQUNuQyxNQUFNLG1EQUFtRCxDQUFDO0FBQzNELE9BQU8sRUFBQyx3QkFBd0IsRUFBQyxNQUFNLG9EQUFvRCxDQUFDO0FBQzVGLE9BQU8sRUFBQyw0QkFBNEIsRUFBQyxNQUFNLHlEQUF5RCxDQUFDO0FBQ3JHLE9BQU8sRUFBQyxVQUFVLEVBQUUsUUFBUSxFQUFDLE1BQU0sT0FBTyxDQUFDO0FBQzNDLE9BQU8sRUFBQyxZQUFZLEVBQW1CLE1BQU0sV0FBVyxDQUFDO0FBSXpELE9BQU8sRUFBQyw4QkFBOEIsRUFBQyxNQUFNLDBCQUEwQixDQUFDO0FBQ3hFLE9BQU8sRUFBQyxTQUFTLEVBQVMsTUFBTSxpQkFBaUIsQ0FBQztBQUNsRCxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sYUFBYSxDQUFDO0FBQ3RDLE9BQU8sRUFBQywwQkFBMEIsRUFBQyxNQUFNLDhCQUE4QixDQUFDOzs7QUFFeEU7Ozs7Ozs7O0dBUUc7QUFFSCxNQUFNLE9BQU8sV0FBVztJQUt0QixnQkFBZ0I7SUFDaEIsWUFBb0IsU0FBbUI7UUFBbkIsY0FBUyxHQUFULFNBQVMsQ0FBVTtRQUwvQixhQUFRLEdBQXVCLEVBQUUsQ0FBQztRQUNsQyxzQkFBaUIsR0FBc0IsRUFBRSxDQUFDO1FBQzFDLGVBQVUsR0FBWSxLQUFLLENBQUM7SUFHTSxDQUFDO0lBRTNDOzs7OztPQUtHO0lBQ0gsc0JBQXNCLENBQ3BCLGFBQWlD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LFdBQVc7Y0FEdkIsVUFBVTtlQUFDLEVBQUMsVUFBVSxFQUFFLFVBQVUsRUFBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtjb21waWxlTmdNb2R1bGVGYWN0b3J5fSBmcm9tICcuLi9hcHBsaWNhdGlvbi9hcHBsaWNhdGlvbl9uZ21vZHVsZV9mYWN0b3J5X2NvbXBpbGVyJztcbmltcG9ydCB7XG4gIF9jYWxsQW5kUmVwb3J0VG9FcnJvckhhbmRsZXIsXG4gIEJvb3RzdHJhcE9wdGlvbnMsXG4gIG9wdGlvbnNSZWR1Y2VyLFxufSBmcm9tICcuLi9hcHBsaWNhdGlvbi9hcHBsaWNhdGlvbl9yZWYnO1xuaW1wb3J0IHtcbiAgZ2V0Tmdab25lT3B0aW9ucyxcbiAgaW50ZXJuYWxQcm92aWRlWm9uZUNoYW5nZURldGVjdGlvbixcbn0gZnJvbSAnLi4vY2hhbmdlX2RldGVjdGlvbi9zY2hlZHVsaW5nL25nX3pvbmVfc2NoZWR1bGluZyc7XG5pbXBvcnQge0NoYW5nZURldGVjdGlvblNjaGVkdWxlcn0gZnJvbSAnLi4vY2hhbmdlX2RldGVjdGlvbi9zY2hlZHVsaW5nL3pvbmVsZXNzX3NjaGVkdWxpbmcnO1xuaW1wb3J0IHtDaGFuZ2VEZXRlY3Rpb25TY2hlZHVsZXJJbXBsfSBmcm9tICcuLi9jaGFuZ2VfZGV0ZWN0aW9uL3NjaGVkdWxpbmcvem9uZWxlc3Nfc2NoZWR1bGluZ19pbXBsJztcbmltcG9ydCB7SW5qZWN0YWJsZSwgSW5qZWN0b3J9IGZyb20gJy4uL2RpJztcbmltcG9ydCB7UnVudGltZUVycm9yLCBSdW50aW1lRXJyb3JDb2RlfSBmcm9tICcuLi9lcnJvcnMnO1xuaW1wb3J0IHtUeXBlfSBmcm9tICcuLi9pbnRlcmZhY2UvdHlwZSc7XG5pbXBvcnQge0NvbXBpbGVyT3B0aW9uc30gZnJvbSAnLi4vbGlua2VyJztcbmltcG9ydCB7TmdNb2R1bGVGYWN0b3J5LCBOZ01vZHVsZVJlZn0gZnJvbSAnLi4vbGlua2VyL25nX21vZHVsZV9mYWN0b3J5JztcbmltcG9ydCB7Y3JlYXRlTmdNb2R1bGVSZWZXaXRoUHJvdmlkZXJzfSBmcm9tICcuLi9yZW5kZXIzL25nX21vZHVsZV9yZWYnO1xuaW1wb3J0IHtnZXROZ1pvbmUsIE5nWm9uZX0gZnJvbSAnLi4vem9uZS9uZ196b25lJztcbmltcG9ydCB7Ym9vdHN0cmFwfSBmcm9tICcuL2Jvb3RzdHJhcCc7XG5pbXBvcnQge1BMQVRGT1JNX0RFU1RST1lfTElTVEVORVJTfSBmcm9tICcuL3BsYXRmb3JtX2Rlc3Ryb3lfbGlzdGVuZXJzJztcblxuLyoqXG4gKiBUaGUgQW5ndWxhciBwbGF0Zm9ybSBpcyB0aGUgZW50cnkgcG9pbnQgZm9yIEFuZ3VsYXIgb24gYSB3ZWIgcGFnZS5cbiAqIEVhY2ggcGFnZSBoYXMgZXhhY3RseSBvbmUgcGxhdGZvcm0uIFNlcnZpY2VzIChzdWNoIGFzIHJlZmxlY3Rpb24pIHdoaWNoIGFyZSBjb21tb25cbiAqIHRvIGV2ZXJ5IEFuZ3VsYXIgYXBwbGljYXRpb24gcnVubmluZyBvbiB0aGUgcGFnZSBhcmUgYm91bmQgaW4gaXRzIHNjb3BlLlxuICogQSBwYWdlJ3MgcGxhdGZvcm0gaXMgaW5pdGlhbGl6ZWQgaW1wbGljaXRseSB3aGVuIGEgcGxhdGZvcm0gaXMgY3JlYXRlZCB1c2luZyBhIHBsYXRmb3JtXG4gKiBmYWN0b3J5IHN1Y2ggYXMgYFBsYXRmb3JtQnJvd3NlcmAsIG9yIGV4cGxpY2l0bHkgYnkgY2FsbGluZyB0aGUgYGNyZWF0ZVBsYXRmb3JtKClgIGZ1bmN0aW9uLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQEluamVjdGFibGUoe3Byb3ZpZGVkSW46ICdwbGF0Zm9ybSd9KVxuZXhwb3J0IGNsYXNzIFBsYXRmb3JtUmVmIHtcbiAgcHJpdmF0ZSBfbW9kdWxlczogTmdNb2R1bGVSZWY8YW55PltdID0gW107XG4gIHByaXZhdGUgX2Rlc3Ryb3lMaXN0ZW5lcnM6IEFycmF5PCgpID0+IHZvaWQ+ID0gW107XG4gIHByaXZhdGUgX2Rlc3Ryb3llZDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfaW5qZWN0b3I6IEluamVjdG9yKSB7fVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGFuIGluc3RhbmNlIG9mIGFuIGBATmdNb2R1bGVgIGZvciB0aGUgZ2l2ZW4gcGxhdGZvcm0uXG4gICAqXG4gICAqIEBkZXByZWNhdGVkIFBhc3NpbmcgTmdNb2R1bGUgZmFjdG9yaWVzIGFzIHRoZSBgUGxhdGZvcm1SZWYuYm9vdHN0cmFwTW9kdWxlRmFjdG9yeWAgZnVuY3Rpb25cbiAgICogICAgIGFyZ3VtZW50IGlzIGRlcHJlY2F0ZWQuIFVzZSB0aGUgYFBsYXRmb3JtUmVmLmJvb3RzdHJhcE1vZHVsZWAgQVBJIGluc3RlYWQuXG4gICAqL1xuICBib290c3RyYXBNb2R1bGVGYWN0b3J5PE0+KFxuICAgIG1vZHVsZUZhY3Rvcnk6IE5nTW9kdWxlRmFjdG9yeTxNPixcbiAgICBvcHRpb25zPzogQm9vdHN0cmFwT3B0aW9ucyxcbiAgKTogUHJvbWlzZTxOZ01vZHVsZVJlZjxNPj4ge1xuICAgIGNvbnN0IHNjaGVkdWxlSW5Sb290Wm9uZSA9IChvcHRpb25zIGFzIGFueSk/LnNjaGVkdWxlSW5Sb290Wm9uZTtcbiAgICBjb25zdCBuZ1pvbmVGYWN0b3J5ID0gKCkgPT5cbiAgICAgIGdldE5nWm9uZShvcHRpb25zPy5uZ1pvbmUsIHtcbiAgICAgICAgLi4uZ2V0Tmdab25lT3B0aW9ucyh7XG4gICAgICAgICAgZXZlbnRDb2FsZXNjaW5nOiBvcHRpb25zPy5uZ1pvbmVFdmVudENvYWxlc2NpbmcsXG4gICAgICAgICAgcnVuQ29hbGVzY2luZzogb3B0aW9ucz8ubmdab25lUnVuQ29hbGVzY2luZyxcbiAgICAgICAgfSksXG4gICAgICAgIHNjaGVkdWxlSW5Sb290Wm9uZSxcbiAgICAgIH0pO1xuICAgIGNvbnN0IGlnbm9yZUNoYW5nZXNPdXRzaWRlWm9uZSA9IG9wdGlvbnM/Lmlnbm9yZUNoYW5nZXNPdXRzaWRlWm9uZTtcbiAgICBjb25zdCBhbGxBcHBQcm92aWRlcnMgPSBbXG4gICAgICBpbnRlcm5hbFByb3ZpZGVab25lQ2hhbmdlRGV0ZWN0aW9uKHtcbiAgICAgICAgbmdab25lRmFjdG9yeSxcbiAgICAgICAgaWdub3JlQ2hhbmdlc091dHNpZGVab25lLFxuICAgICAgfSksXG4gICAgICB7cHJvdmlkZTogQ2hhbmdlRGV0ZWN0aW9uU2NoZWR1bGVyLCB1c2VFeGlzdGluZzogQ2hhbmdlRGV0ZWN0aW9uU2NoZWR1bGVySW1wbH0sXG4gICAgXTtcbiAgICBjb25zdCBtb2R1bGVSZWYgPSBjcmVhdGVOZ01vZHVsZVJlZldpdGhQcm92aWRlcnMoXG4gICAgICBtb2R1bGVGYWN0b3J5Lm1vZHVsZVR5cGUsXG4gICAgICB0aGlzLmluamVjdG9yLFxuICAgICAgYWxsQXBwUHJvdmlkZXJzLFxuICAgICk7XG5cbiAgICByZXR1cm4gYm9vdHN0cmFwKHtcbiAgICAgIG1vZHVsZVJlZixcbiAgICAgIGFsbFBsYXRmb3JtTW9kdWxlczogdGhpcy5fbW9kdWxlcyxcbiAgICAgIHBsYXRmb3JtSW5qZWN0b3I6IHRoaXMuaW5qZWN0b3IsXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhbiBpbnN0YW5jZSBvZiBhbiBgQE5nTW9kdWxlYCBmb3IgYSBnaXZlbiBwbGF0Zm9ybS5cbiAgICpcbiAgICogQHVzYWdlTm90ZXNcbiAgICogIyMjIFNpbXBsZSBFeGFtcGxlXG4gICAqXG4gICAqIGBgYHR5cGVzY3JpcHRcbiAgICogQE5nTW9kdWxlKHtcbiAgICogICBpbXBvcnRzOiBbQnJvd3Nlck1vZHVsZV1cbiAgICogfSlcbiAgICogY2xhc3MgTXlNb2R1bGUge31cbiAgICpcbiAgICogbGV0IG1vZHVsZVJlZiA9IHBsYXRmb3JtQnJvd3NlcigpLmJvb3RzdHJhcE1vZHVsZShNeU1vZHVsZSk7XG4gICAqIGBgYFxuICAgKlxuICAgKi9cbiAgYm9vdHN0cmFwTW9kdWxlPE0+KFxuICAgIG1vZHVsZVR5cGU6IFR5cGU8TT4sXG4gICAgY29tcGlsZXJPcHRpb25zOlxuICAgICAgfCAoQ29tcGlsZXJPcHRpb25zICYgQm9vdHN0cmFwT3B0aW9ucylcbiAgICAgIHwgQXJyYXk8Q29tcGlsZXJPcHRpb25zICYgQm9vdHN0cmFwT3B0aW9ucz4gPSBbXSxcbiAgKTogUHJvbWlzZTxOZ01vZHVsZVJlZjxNPj4ge1xuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25zUmVkdWNlcih7fSwgY29tcGlsZXJPcHRpb25zKTtcbiAgICByZXR1cm4gY29tcGlsZU5nTW9kdWxlRmFjdG9yeSh0aGlzLmluamVjdG9yLCBvcHRpb25zLCBtb2R1bGVUeXBlKS50aGVuKChtb2R1bGVGYWN0b3J5KSA9PlxuICAgICAgdGhpcy5ib290c3RyYXBNb2R1bGVGYWN0b3J5KG1vZHVsZUZhY3RvcnksIG9wdGlvbnMpLFxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXJzIGEgbGlzdGVuZXIgdG8gYmUgY2FsbGVkIHdoZW4gdGhlIHBsYXRmb3JtIGlzIGRlc3Ryb3llZC5cbiAgICovXG4gIG9uRGVzdHJveShjYWxsYmFjazogKCkgPT4gdm9pZCk6IHZvaWQge1xuICAgIHRoaXMuX2Rlc3Ryb3lMaXN0ZW5lcnMucHVzaChjYWxsYmFjayk7XG4gIH1cblxuICAvKipcbiAgICogUmV0cmlldmVzIHRoZSBwbGF0Zm9ybSB7QGxpbmsgSW5qZWN0b3J9LCB3aGljaCBpcyB0aGUgcGFyZW50IGluamVjdG9yIGZvclxuICAgKiBldmVyeSBBbmd1bGFyIGFwcGxpY2F0aW9uIG9uIHRoZSBwYWdlIGFuZCBwcm92aWRlcyBzaW5nbGV0b24gcHJvdmlkZXJzLlxuICAgKi9cbiAgZ2V0IGluamVjdG9yKCk6IEluamVjdG9yIHtcbiAgICByZXR1cm4gdGhpcy5faW5qZWN0b3I7XG4gIH1cblxuICAvKipcbiAgICogRGVzdHJveXMgdGhlIGN1cnJlbnQgQW5ndWxhciBwbGF0Zm9ybSBhbmQgYWxsIEFuZ3VsYXIgYXBwbGljYXRpb25zIG9uIHRoZSBwYWdlLlxuICAgKiBEZXN0cm95cyBhbGwgbW9kdWxlcyBhbmQgbGlzdGVuZXJzIHJlZ2lzdGVyZWQgd2l0aCB0aGUgcGxhdGZvcm0uXG4gICAqL1xuICBkZXN0cm95KCkge1xuICAgIGlmICh0aGlzLl9kZXN0cm95ZWQpIHtcbiAgICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuUExBVEZPUk1fQUxSRUFEWV9ERVNUUk9ZRUQsXG4gICAgICAgIG5nRGV2TW9kZSAmJiAnVGhlIHBsYXRmb3JtIGhhcyBhbHJlYWR5IGJlZW4gZGVzdHJveWVkIScsXG4gICAgICApO1xuICAgIH1cbiAgICB0aGlzLl9tb2R1bGVzLnNsaWNlKCkuZm9yRWFjaCgobW9kdWxlKSA9PiBtb2R1bGUuZGVzdHJveSgpKTtcbiAgICB0aGlzLl9kZXN0cm95TGlzdGVuZXJzLmZvckVhY2goKGxpc3RlbmVyKSA9PiBsaXN0ZW5lcigpKTtcblxuICAgIGNvbnN0IGRlc3Ryb3lMaXN0ZW5lcnMgPSB0aGlzLl9pbmplY3Rvci5nZXQoUExBVEZPUk1fREVTVFJPWV9MSVNURU5FUlMsIG51bGwpO1xuICAgIGlmIChkZXN0cm95TGlzdGVuZXJzKSB7XG4gICAgICBkZXN0cm95TGlzdGVuZXJzLmZvckVhY2goKGxpc3RlbmVyKSA9PiBsaXN0ZW5lcigpKTtcbiAgICAgIGRlc3Ryb3lMaXN0ZW5lcnMuY2xlYXIoKTtcbiAgICB9XG5cbiAgICB0aGlzLl9kZXN0cm95ZWQgPSB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIEluZGljYXRlcyB3aGV0aGVyIHRoaXMgaW5zdGFuY2Ugd2FzIGRlc3Ryb3llZC5cbiAgICovXG4gIGdldCBkZXN0cm95ZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2Rlc3Ryb3llZDtcbiAgfVxufVxuIl19