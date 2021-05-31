/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Inject, Injectable, InjectionToken, Optional } from './di';
import { isObservable, isPromise } from './util/lang';
import { noop } from './util/noop';
/**
 * A [DI token](guide/glossary#di-token "DI token definition") that you can use to provide
 * one or more initialization functions.
 *
 * The provided functions are injected at application startup and executed during
 * app initialization. If any of these functions returns a Promise or an Observable, initialization
 * does not complete until the Promise is resolved or the Observable is completed.
 *
 * You can, for example, create a factory function that loads language data
 * or an external configuration, and provide that function to the `APP_INITIALIZER` token.
 * The function is executed during the application bootstrap process,
 * and the needed data is available on startup.
 *
 * @see `ApplicationInitStatus`
 *
 * @usageNotes
 *
 * The following example illustrates how to configure a multi-provider using `APP_INITIALIZER` token
 * and a function returning a promise.
 *
 * ```
 *  function initializeApp(): Promise<any> {
 *    return new Promise((resolve, reject) => {
 *      // Do some asynchronous stuff
 *      resolve();
 *    });
 *  }
 *
 *  @NgModule({
 *   imports: [BrowserModule],
 *   declarations: [AppComponent],
 *   bootstrap: [AppComponent],
 *   providers: [{
 *     provide: APP_INITIALIZER,
 *     useFactory: () => initializeApp,
 *     multi: true
 *    }]
 *   })
 *  export class AppModule {}
 * ```
 *
 * It's also possible to configure a multi-provider using `APP_INITIALIZER` token and a function
 * returning an observable, see an example below. Note: the `HttpClient` in this example is used for
 * demo purposes to illustrate how the factory function can work with other providers available
 * through DI.
 *
 * ```
 *  function initializeApp(httpClient: HttpClient): Observable<any> {
 *   return httpClient.get("https://someUrl.com/api/user")
 *     .pipe(
 *        tap(user => { ... })
 *     )
 *  }
 *
 *  @NgModule({
 *    imports: [BrowserModule, HttpClientModule],
 *    declarations: [AppComponent],
 *    bootstrap: [AppComponent],
 *    providers: [{
 *      provide: APP_INITIALIZER,
 *      useFactory: initializeApp,
 *      deps: [HttpClient],
 *      multi: true
 *    }]
 *  })
 *  export class AppModule {}
 * ```
 *
 * @publicApi
 */
export const APP_INITIALIZER = new InjectionToken('Application Initializer');
/**
 * A class that reflects the state of running {@link APP_INITIALIZER} functions.
 *
 * @publicApi
 */
export class ApplicationInitStatus {
    constructor(appInits) {
        this.appInits = appInits;
        this.resolve = noop;
        this.reject = noop;
        this.initialized = false;
        this.done = false;
        this.donePromise = new Promise((res, rej) => {
            this.resolve = res;
            this.reject = rej;
        });
    }
    /** @internal */
    runInitializers() {
        if (this.initialized) {
            return;
        }
        const asyncInitPromises = [];
        const complete = () => {
            this.done = true;
            this.resolve();
        };
        if (this.appInits) {
            for (let i = 0; i < this.appInits.length; i++) {
                const initResult = this.appInits[i]();
                if (isPromise(initResult)) {
                    asyncInitPromises.push(initResult);
                }
                else if (isObservable(initResult)) {
                    const observableAsPromise = new Promise((resolve, reject) => {
                        initResult.subscribe({ complete: resolve, error: reject });
                    });
                    asyncInitPromises.push(observableAsPromise);
                }
            }
        }
        Promise.all(asyncInitPromises)
            .then(() => {
            complete();
        })
            .catch(e => {
            this.reject(e);
        });
        if (asyncInitPromises.length === 0) {
            complete();
        }
        this.initialized = true;
    }
}
ApplicationInitStatus.decorators = [
    { type: Injectable }
];
ApplicationInitStatus.ctorParameters = () => [
    { type: undefined, decorators: [{ type: Inject, args: [APP_INITIALIZER,] }, { type: Optional }] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwbGljYXRpb25faW5pdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc3JjL2FwcGxpY2F0aW9uX2luaXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBR0gsT0FBTyxFQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUUsY0FBYyxFQUFFLFFBQVEsRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUNsRSxPQUFPLEVBQUMsWUFBWSxFQUFFLFNBQVMsRUFBQyxNQUFNLGFBQWEsQ0FBQztBQUNwRCxPQUFPLEVBQUMsSUFBSSxFQUFDLE1BQU0sYUFBYSxDQUFDO0FBR2pDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FxRUc7QUFDSCxNQUFNLENBQUMsTUFBTSxlQUFlLEdBQ3hCLElBQUksY0FBYyxDQUNkLHlCQUF5QixDQUFDLENBQUM7QUFFbkM7Ozs7R0FJRztBQUVILE1BQU0sT0FBTyxxQkFBcUI7SUFPaEMsWUFBa0UsUUFDYztRQURkLGFBQVEsR0FBUixRQUFRLENBQ007UUFQeEUsWUFBTyxHQUFHLElBQUksQ0FBQztRQUNmLFdBQU0sR0FBRyxJQUFJLENBQUM7UUFDZCxnQkFBVyxHQUFHLEtBQUssQ0FBQztRQUVaLFNBQUksR0FBRyxLQUFLLENBQUM7UUFJM0IsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLE9BQU8sQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRTtZQUMxQyxJQUFJLENBQUMsT0FBTyxHQUFHLEdBQUcsQ0FBQztZQUNuQixJQUFJLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQztRQUNwQixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCxnQkFBZ0I7SUFDaEIsZUFBZTtRQUNiLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRTtZQUNwQixPQUFPO1NBQ1I7UUFFRCxNQUFNLGlCQUFpQixHQUFtQixFQUFFLENBQUM7UUFFN0MsTUFBTSxRQUFRLEdBQUcsR0FBRyxFQUFFO1lBQ25CLElBQXdCLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztZQUN0QyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDakIsQ0FBQyxDQUFDO1FBRUYsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ2pCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDN0MsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO2dCQUN0QyxJQUFJLFNBQVMsQ0FBQyxVQUFVLENBQUMsRUFBRTtvQkFDekIsaUJBQWlCLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2lCQUNwQztxQkFBTSxJQUFJLFlBQVksQ0FBQyxVQUFVLENBQUMsRUFBRTtvQkFDbkMsTUFBTSxtQkFBbUIsR0FBRyxJQUFJLE9BQU8sQ0FBTyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTt3QkFDaEUsVUFBVSxDQUFDLFNBQVMsQ0FBQyxFQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBQyxDQUFDLENBQUM7b0JBQzNELENBQUMsQ0FBQyxDQUFDO29CQUNILGlCQUFpQixDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO2lCQUM3QzthQUNGO1NBQ0Y7UUFFRCxPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDO2FBQ3pCLElBQUksQ0FBQyxHQUFHLEVBQUU7WUFDVCxRQUFRLEVBQUUsQ0FBQztRQUNiLENBQUMsQ0FBQzthQUNELEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRTtZQUNULElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDakIsQ0FBQyxDQUFDLENBQUM7UUFFUCxJQUFJLGlCQUFpQixDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDbEMsUUFBUSxFQUFFLENBQUM7U0FDWjtRQUNELElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO0lBQzFCLENBQUM7OztZQXZERixVQUFVOzs7NENBUUksTUFBTSxTQUFDLGVBQWUsY0FBRyxRQUFRIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7T2JzZXJ2YWJsZX0gZnJvbSAncnhqcyc7XG5pbXBvcnQge0luamVjdCwgSW5qZWN0YWJsZSwgSW5qZWN0aW9uVG9rZW4sIE9wdGlvbmFsfSBmcm9tICcuL2RpJztcbmltcG9ydCB7aXNPYnNlcnZhYmxlLCBpc1Byb21pc2V9IGZyb20gJy4vdXRpbC9sYW5nJztcbmltcG9ydCB7bm9vcH0gZnJvbSAnLi91dGlsL25vb3AnO1xuXG5cbi8qKlxuICogQSBbREkgdG9rZW5dKGd1aWRlL2dsb3NzYXJ5I2RpLXRva2VuIFwiREkgdG9rZW4gZGVmaW5pdGlvblwiKSB0aGF0IHlvdSBjYW4gdXNlIHRvIHByb3ZpZGVcbiAqIG9uZSBvciBtb3JlIGluaXRpYWxpemF0aW9uIGZ1bmN0aW9ucy5cbiAqXG4gKiBUaGUgcHJvdmlkZWQgZnVuY3Rpb25zIGFyZSBpbmplY3RlZCBhdCBhcHBsaWNhdGlvbiBzdGFydHVwIGFuZCBleGVjdXRlZCBkdXJpbmdcbiAqIGFwcCBpbml0aWFsaXphdGlvbi4gSWYgYW55IG9mIHRoZXNlIGZ1bmN0aW9ucyByZXR1cm5zIGEgUHJvbWlzZSBvciBhbiBPYnNlcnZhYmxlLCBpbml0aWFsaXphdGlvblxuICogZG9lcyBub3QgY29tcGxldGUgdW50aWwgdGhlIFByb21pc2UgaXMgcmVzb2x2ZWQgb3IgdGhlIE9ic2VydmFibGUgaXMgY29tcGxldGVkLlxuICpcbiAqIFlvdSBjYW4sIGZvciBleGFtcGxlLCBjcmVhdGUgYSBmYWN0b3J5IGZ1bmN0aW9uIHRoYXQgbG9hZHMgbGFuZ3VhZ2UgZGF0YVxuICogb3IgYW4gZXh0ZXJuYWwgY29uZmlndXJhdGlvbiwgYW5kIHByb3ZpZGUgdGhhdCBmdW5jdGlvbiB0byB0aGUgYEFQUF9JTklUSUFMSVpFUmAgdG9rZW4uXG4gKiBUaGUgZnVuY3Rpb24gaXMgZXhlY3V0ZWQgZHVyaW5nIHRoZSBhcHBsaWNhdGlvbiBib290c3RyYXAgcHJvY2VzcyxcbiAqIGFuZCB0aGUgbmVlZGVkIGRhdGEgaXMgYXZhaWxhYmxlIG9uIHN0YXJ0dXAuXG4gKlxuICogQHNlZSBgQXBwbGljYXRpb25Jbml0U3RhdHVzYFxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKlxuICogVGhlIGZvbGxvd2luZyBleGFtcGxlIGlsbHVzdHJhdGVzIGhvdyB0byBjb25maWd1cmUgYSBtdWx0aS1wcm92aWRlciB1c2luZyBgQVBQX0lOSVRJQUxJWkVSYCB0b2tlblxuICogYW5kIGEgZnVuY3Rpb24gcmV0dXJuaW5nIGEgcHJvbWlzZS5cbiAqXG4gKiBgYGBcbiAqICBmdW5jdGlvbiBpbml0aWFsaXplQXBwKCk6IFByb21pc2U8YW55PiB7XG4gKiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICogICAgICAvLyBEbyBzb21lIGFzeW5jaHJvbm91cyBzdHVmZlxuICogICAgICByZXNvbHZlKCk7XG4gKiAgICB9KTtcbiAqICB9XG4gKlxuICogIEBOZ01vZHVsZSh7XG4gKiAgIGltcG9ydHM6IFtCcm93c2VyTW9kdWxlXSxcbiAqICAgZGVjbGFyYXRpb25zOiBbQXBwQ29tcG9uZW50XSxcbiAqICAgYm9vdHN0cmFwOiBbQXBwQ29tcG9uZW50XSxcbiAqICAgcHJvdmlkZXJzOiBbe1xuICogICAgIHByb3ZpZGU6IEFQUF9JTklUSUFMSVpFUixcbiAqICAgICB1c2VGYWN0b3J5OiAoKSA9PiBpbml0aWFsaXplQXBwLFxuICogICAgIG11bHRpOiB0cnVlXG4gKiAgICB9XVxuICogICB9KVxuICogIGV4cG9ydCBjbGFzcyBBcHBNb2R1bGUge31cbiAqIGBgYFxuICpcbiAqIEl0J3MgYWxzbyBwb3NzaWJsZSB0byBjb25maWd1cmUgYSBtdWx0aS1wcm92aWRlciB1c2luZyBgQVBQX0lOSVRJQUxJWkVSYCB0b2tlbiBhbmQgYSBmdW5jdGlvblxuICogcmV0dXJuaW5nIGFuIG9ic2VydmFibGUsIHNlZSBhbiBleGFtcGxlIGJlbG93LiBOb3RlOiB0aGUgYEh0dHBDbGllbnRgIGluIHRoaXMgZXhhbXBsZSBpcyB1c2VkIGZvclxuICogZGVtbyBwdXJwb3NlcyB0byBpbGx1c3RyYXRlIGhvdyB0aGUgZmFjdG9yeSBmdW5jdGlvbiBjYW4gd29yayB3aXRoIG90aGVyIHByb3ZpZGVycyBhdmFpbGFibGVcbiAqIHRocm91Z2ggREkuXG4gKlxuICogYGBgXG4gKiAgZnVuY3Rpb24gaW5pdGlhbGl6ZUFwcChodHRwQ2xpZW50OiBIdHRwQ2xpZW50KTogT2JzZXJ2YWJsZTxhbnk+IHtcbiAqICAgcmV0dXJuIGh0dHBDbGllbnQuZ2V0KFwiaHR0cHM6Ly9zb21lVXJsLmNvbS9hcGkvdXNlclwiKVxuICogICAgIC5waXBlKFxuICogICAgICAgIHRhcCh1c2VyID0+IHsgLi4uIH0pXG4gKiAgICAgKVxuICogIH1cbiAqXG4gKiAgQE5nTW9kdWxlKHtcbiAqICAgIGltcG9ydHM6IFtCcm93c2VyTW9kdWxlLCBIdHRwQ2xpZW50TW9kdWxlXSxcbiAqICAgIGRlY2xhcmF0aW9uczogW0FwcENvbXBvbmVudF0sXG4gKiAgICBib290c3RyYXA6IFtBcHBDb21wb25lbnRdLFxuICogICAgcHJvdmlkZXJzOiBbe1xuICogICAgICBwcm92aWRlOiBBUFBfSU5JVElBTElaRVIsXG4gKiAgICAgIHVzZUZhY3Rvcnk6IGluaXRpYWxpemVBcHAsXG4gKiAgICAgIGRlcHM6IFtIdHRwQ2xpZW50XSxcbiAqICAgICAgbXVsdGk6IHRydWVcbiAqICAgIH1dXG4gKiAgfSlcbiAqICBleHBvcnQgY2xhc3MgQXBwTW9kdWxlIHt9XG4gKiBgYGBcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjb25zdCBBUFBfSU5JVElBTElaRVIgPVxuICAgIG5ldyBJbmplY3Rpb25Ub2tlbjxSZWFkb25seUFycmF5PCgpID0+IE9ic2VydmFibGU8dW5rbm93bj58IFByb21pc2U8dW5rbm93bj58IHZvaWQ+PihcbiAgICAgICAgJ0FwcGxpY2F0aW9uIEluaXRpYWxpemVyJyk7XG5cbi8qKlxuICogQSBjbGFzcyB0aGF0IHJlZmxlY3RzIHRoZSBzdGF0ZSBvZiBydW5uaW5nIHtAbGluayBBUFBfSU5JVElBTElaRVJ9IGZ1bmN0aW9ucy5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBBcHBsaWNhdGlvbkluaXRTdGF0dXMge1xuICBwcml2YXRlIHJlc29sdmUgPSBub29wO1xuICBwcml2YXRlIHJlamVjdCA9IG5vb3A7XG4gIHByaXZhdGUgaW5pdGlhbGl6ZWQgPSBmYWxzZTtcbiAgcHVibGljIHJlYWRvbmx5IGRvbmVQcm9taXNlOiBQcm9taXNlPGFueT47XG4gIHB1YmxpYyByZWFkb25seSBkb25lID0gZmFsc2U7XG5cbiAgY29uc3RydWN0b3IoQEluamVjdChBUFBfSU5JVElBTElaRVIpIEBPcHRpb25hbCgpIHByaXZhdGUgcmVhZG9ubHkgYXBwSW5pdHM6XG4gICAgICAgICAgICAgICAgICBSZWFkb25seUFycmF5PCgpID0+IE9ic2VydmFibGU8dW5rbm93bj58IFByb21pc2U8dW5rbm93bj58IHZvaWQ+KSB7XG4gICAgdGhpcy5kb25lUHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXMsIHJlaikgPT4ge1xuICAgICAgdGhpcy5yZXNvbHZlID0gcmVzO1xuICAgICAgdGhpcy5yZWplY3QgPSByZWo7XG4gICAgfSk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIHJ1bkluaXRpYWxpemVycygpIHtcbiAgICBpZiAodGhpcy5pbml0aWFsaXplZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGFzeW5jSW5pdFByb21pc2VzOiBQcm9taXNlPGFueT5bXSA9IFtdO1xuXG4gICAgY29uc3QgY29tcGxldGUgPSAoKSA9PiB7XG4gICAgICAodGhpcyBhcyB7ZG9uZTogYm9vbGVhbn0pLmRvbmUgPSB0cnVlO1xuICAgICAgdGhpcy5yZXNvbHZlKCk7XG4gICAgfTtcblxuICAgIGlmICh0aGlzLmFwcEluaXRzKSB7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuYXBwSW5pdHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgaW5pdFJlc3VsdCA9IHRoaXMuYXBwSW5pdHNbaV0oKTtcbiAgICAgICAgaWYgKGlzUHJvbWlzZShpbml0UmVzdWx0KSkge1xuICAgICAgICAgIGFzeW5jSW5pdFByb21pc2VzLnB1c2goaW5pdFJlc3VsdCk7XG4gICAgICAgIH0gZWxzZSBpZiAoaXNPYnNlcnZhYmxlKGluaXRSZXN1bHQpKSB7XG4gICAgICAgICAgY29uc3Qgb2JzZXJ2YWJsZUFzUHJvbWlzZSA9IG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGluaXRSZXN1bHQuc3Vic2NyaWJlKHtjb21wbGV0ZTogcmVzb2x2ZSwgZXJyb3I6IHJlamVjdH0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIGFzeW5jSW5pdFByb21pc2VzLnB1c2gob2JzZXJ2YWJsZUFzUHJvbWlzZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBQcm9taXNlLmFsbChhc3luY0luaXRQcm9taXNlcylcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIGNvbXBsZXRlKCk7XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaChlID0+IHtcbiAgICAgICAgICB0aGlzLnJlamVjdChlKTtcbiAgICAgICAgfSk7XG5cbiAgICBpZiAoYXN5bmNJbml0UHJvbWlzZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICBjb21wbGV0ZSgpO1xuICAgIH1cbiAgICB0aGlzLmluaXRpYWxpemVkID0gdHJ1ZTtcbiAgfVxufVxuIl19