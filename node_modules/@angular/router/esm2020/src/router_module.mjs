/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { HashLocationStrategy, Location, LocationStrategy, PathLocationStrategy, ViewportScroller } from '@angular/common';
import { APP_BOOTSTRAP_LISTENER, inject, Inject, InjectionToken, NgModule, NgProbeToken, NgZone, Optional, SkipSelf, ɵRuntimeError as RuntimeError } from '@angular/core';
import { EmptyOutletComponent } from './components/empty_outlet';
import { RouterLink } from './directives/router_link';
import { RouterLinkActive } from './directives/router_link_active';
import { RouterOutlet } from './directives/router_outlet';
import { NavigationTransitions } from './navigation_transition';
import { getBootstrapListener, rootRoute, ROUTER_IS_PROVIDED, withDebugTracing, withDisabledInitialNavigation, withEnabledBlockingInitialNavigation, withPreloading } from './provide_router';
import { Router } from './router';
import { ROUTER_CONFIGURATION } from './router_config';
import { RouterConfigLoader, ROUTES } from './router_config_loader';
import { ChildrenOutletContexts } from './router_outlet_context';
import { ROUTER_SCROLLER, RouterScroller } from './router_scroller';
import { ActivatedRoute } from './router_state';
import { DefaultUrlSerializer, UrlSerializer } from './url_tree';
import * as i0 from "@angular/core";
const NG_DEV_MODE = typeof ngDevMode === 'undefined' || ngDevMode;
/**
 * The directives defined in the `RouterModule`.
 */
const ROUTER_DIRECTIVES = [RouterOutlet, RouterLink, RouterLinkActive, EmptyOutletComponent];
/**
 * @docsNotRequired
 */
export const ROUTER_FORROOT_GUARD = new InjectionToken(NG_DEV_MODE ? 'router duplicate forRoot guard' : 'ROUTER_FORROOT_GUARD');
// TODO(atscott): All of these except `ActivatedRoute` are `providedIn: 'root'`. They are only kept
// here to avoid a breaking change whereby the provider order matters based on where the
// `RouterModule`/`RouterTestingModule` is imported. These can/should be removed as a "breaking"
// change in a major version.
export const ROUTER_PROVIDERS = [
    Location,
    { provide: UrlSerializer, useClass: DefaultUrlSerializer },
    Router,
    ChildrenOutletContexts,
    { provide: ActivatedRoute, useFactory: rootRoute, deps: [Router] },
    RouterConfigLoader,
    // Only used to warn when `provideRoutes` is used without `RouterModule` or `provideRouter`. Can
    // be removed when `provideRoutes` is removed.
    NG_DEV_MODE ? { provide: ROUTER_IS_PROVIDED, useValue: true } : [],
];
export function routerNgProbeToken() {
    return new NgProbeToken('Router', Router);
}
/**
 * @description
 *
 * Adds directives and providers for in-app navigation among views defined in an application.
 * Use the Angular `Router` service to declaratively specify application states and manage state
 * transitions.
 *
 * You can import this NgModule multiple times, once for each lazy-loaded bundle.
 * However, only one `Router` service can be active.
 * To ensure this, there are two ways to register routes when importing this module:
 *
 * * The `forRoot()` method creates an `NgModule` that contains all the directives, the given
 * routes, and the `Router` service itself.
 * * The `forChild()` method creates an `NgModule` that contains all the directives and the given
 * routes, but does not include the `Router` service.
 *
 * @see [Routing and Navigation guide](guide/router) for an
 * overview of how the `Router` service should be used.
 *
 * @publicApi
 */
export class RouterModule {
    constructor(guard) { }
    /**
     * Creates and configures a module with all the router providers and directives.
     * Optionally sets up an application listener to perform an initial navigation.
     *
     * When registering the NgModule at the root, import as follows:
     *
     * ```
     * @NgModule({
     *   imports: [RouterModule.forRoot(ROUTES)]
     * })
     * class MyNgModule {}
     * ```
     *
     * @param routes An array of `Route` objects that define the navigation paths for the application.
     * @param config An `ExtraOptions` configuration object that controls how navigation is performed.
     * @return The new `NgModule`.
     *
     */
    static forRoot(routes, config) {
        return {
            ngModule: RouterModule,
            providers: [
                ROUTER_PROVIDERS,
                NG_DEV_MODE ? (config?.enableTracing ? withDebugTracing().ɵproviders : []) : [],
                { provide: ROUTES, multi: true, useValue: routes },
                {
                    provide: ROUTER_FORROOT_GUARD,
                    useFactory: provideForRootGuard,
                    deps: [[Router, new Optional(), new SkipSelf()]]
                },
                { provide: ROUTER_CONFIGURATION, useValue: config ? config : {} },
                config?.useHash ? provideHashLocationStrategy() : providePathLocationStrategy(),
                provideRouterScroller(),
                config?.preloadingStrategy ? withPreloading(config.preloadingStrategy).ɵproviders : [],
                { provide: NgProbeToken, multi: true, useFactory: routerNgProbeToken },
                config?.initialNavigation ? provideInitialNavigation(config) : [],
                provideRouterInitializer(),
            ],
        };
    }
    /**
     * Creates a module with all the router directives and a provider registering routes,
     * without creating a new Router service.
     * When registering for submodules and lazy-loaded submodules, create the NgModule as follows:
     *
     * ```
     * @NgModule({
     *   imports: [RouterModule.forChild(ROUTES)]
     * })
     * class MyNgModule {}
     * ```
     *
     * @param routes An array of `Route` objects that define the navigation paths for the submodule.
     * @return The new NgModule.
     *
     */
    static forChild(routes) {
        return {
            ngModule: RouterModule,
            providers: [{ provide: ROUTES, multi: true, useValue: routes }],
        };
    }
}
RouterModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.1", ngImport: i0, type: RouterModule, deps: [{ token: ROUTER_FORROOT_GUARD, optional: true }], target: i0.ɵɵFactoryTarget.NgModule });
RouterModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "15.2.1", ngImport: i0, type: RouterModule, imports: [RouterOutlet, RouterLink, RouterLinkActive, EmptyOutletComponent], exports: [RouterOutlet, RouterLink, RouterLinkActive, EmptyOutletComponent] });
RouterModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "15.2.1", ngImport: i0, type: RouterModule, imports: [EmptyOutletComponent] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.1", ngImport: i0, type: RouterModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: ROUTER_DIRECTIVES,
                    exports: ROUTER_DIRECTIVES,
                }]
        }], ctorParameters: function () { return [{ type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [ROUTER_FORROOT_GUARD]
                }] }]; } });
/**
 * For internal use by `RouterModule` only. Note that this differs from `withInMemoryRouterScroller`
 * because it reads from the `ExtraOptions` which should not be used in the standalone world.
 */
export function provideRouterScroller() {
    return {
        provide: ROUTER_SCROLLER,
        useFactory: () => {
            const viewportScroller = inject(ViewportScroller);
            const zone = inject(NgZone);
            const config = inject(ROUTER_CONFIGURATION);
            const transitions = inject(NavigationTransitions);
            const urlSerializer = inject(UrlSerializer);
            if (config.scrollOffset) {
                viewportScroller.setOffset(config.scrollOffset);
            }
            return new RouterScroller(urlSerializer, transitions, viewportScroller, zone, config);
        },
    };
}
// Note: For internal use only with `RouterModule`. Standalone setup via `provideRouter` should
// provide hash location directly via `{provide: LocationStrategy, useClass: HashLocationStrategy}`.
function provideHashLocationStrategy() {
    return { provide: LocationStrategy, useClass: HashLocationStrategy };
}
// Note: For internal use only with `RouterModule`. Standalone setup via `provideRouter` does not
// need this at all because `PathLocationStrategy` is the default factory for `LocationStrategy`.
function providePathLocationStrategy() {
    return { provide: LocationStrategy, useClass: PathLocationStrategy };
}
export function provideForRootGuard(router) {
    if (NG_DEV_MODE && router) {
        throw new RuntimeError(4007 /* RuntimeErrorCode.FOR_ROOT_CALLED_TWICE */, `The Router was provided more than once. This can happen if 'forRoot' is used outside of the root injector.` +
            ` Lazy loaded modules should use RouterModule.forChild() instead.`);
    }
    return 'guarded';
}
// Note: For internal use only with `RouterModule`. Standalone router setup with `provideRouter`
// users call `withXInitialNavigation` directly.
function provideInitialNavigation(config) {
    return [
        config.initialNavigation === 'disabled' ? withDisabledInitialNavigation().ɵproviders : [],
        config.initialNavigation === 'enabledBlocking' ?
            withEnabledBlockingInitialNavigation().ɵproviders :
            [],
    ];
}
// TODO(atscott): This should not be in the public API
/**
 * A [DI token](guide/glossary/#di-token) for the router initializer that
 * is called after the app is bootstrapped.
 *
 * @publicApi
 */
export const ROUTER_INITIALIZER = new InjectionToken(NG_DEV_MODE ? 'Router Initializer' : '');
function provideRouterInitializer() {
    return [
        // ROUTER_INITIALIZER token should be removed. It's public API but shouldn't be. We can just
        // have `getBootstrapListener` directly attached to APP_BOOTSTRAP_LISTENER.
        { provide: ROUTER_INITIALIZER, useFactory: getBootstrapListener },
        { provide: APP_BOOTSTRAP_LISTENER, multi: true, useExisting: ROUTER_INITIALIZER },
    ];
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyX21vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3JvdXRlci9zcmMvcm91dGVyX21vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsb0JBQW9CLEVBQUUsUUFBUSxFQUFFLGdCQUFnQixFQUFFLG9CQUFvQixFQUFFLGdCQUFnQixFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDekgsT0FBTyxFQUFDLHNCQUFzQixFQUFnQixNQUFNLEVBQUUsTUFBTSxFQUFFLGNBQWMsRUFBdUIsUUFBUSxFQUFFLFlBQVksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFZLFFBQVEsRUFBRSxhQUFhLElBQUksWUFBWSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRXJOLE9BQU8sRUFBQyxvQkFBb0IsRUFBQyxNQUFNLDJCQUEyQixDQUFDO0FBQy9ELE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSwwQkFBMEIsQ0FBQztBQUNwRCxPQUFPLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxpQ0FBaUMsQ0FBQztBQUNqRSxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sNEJBQTRCLENBQUM7QUFHeEQsT0FBTyxFQUFDLHFCQUFxQixFQUFDLE1BQU0seUJBQXlCLENBQUM7QUFDOUQsT0FBTyxFQUFDLG9CQUFvQixFQUFFLFNBQVMsRUFBRSxrQkFBa0IsRUFBRSxnQkFBZ0IsRUFBRSw2QkFBNkIsRUFBRSxvQ0FBb0MsRUFBRSxjQUFjLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUM1TCxPQUFPLEVBQUMsTUFBTSxFQUFDLE1BQU0sVUFBVSxDQUFDO0FBQ2hDLE9BQU8sRUFBZSxvQkFBb0IsRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQ25FLE9BQU8sRUFBQyxrQkFBa0IsRUFBRSxNQUFNLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUNsRSxPQUFPLEVBQUMsc0JBQXNCLEVBQUMs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RTtLQUNQLENBQUM7QUFDSixDQUFDO0FBRUQsc0RBQXNEO0FBQ3REOzs7OztHQUtHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxjQUFjLENBQ2hELFdBQVcsQ0FBQyxDQUFDLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBRTdDLFNBQVMsd0JBQXdCO0lBQy9CLE9BQU87UUFDTCw0RkFBNEY7UUFDNUYsMkVBQTJFO1FBQzNFLEVBQUMsT0FBTyxFQUFFLGtCQUFrQixFQUFFLFVBQVUsRUFBRSxvQkFBb0IsRUFBQztRQUMvRCxFQUFDLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxrQkFBa0IsRUFBQztLQUNoRixDQUFDO0FBQ0osQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0hhc2hMb2NhdGlvblN0cmF0ZWd5LCBMb2NhdGlvbiwgTG9jYXRpb25TdHJhdGVneSwgUGF0aExvY2F0aW9uU3RyYXRlZ3ksIFZpZXdwb3J0U2Nyb2xsZXJ9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQge0FQUF9CT09UU1RSQVBfTElTVEVORVIsIENvbXBvbmVudFJlZiwgaW5qZWN0LCBJbmplY3QsIEluamVjdGlvblRva2VuLCBNb2R1bGVXaXRoUHJvdmlkZXJzLCBOZ01vZHVsZSwgTmdQcm9iZVRva2VuLCBOZ1pvbmUsIE9wdGlvbmFsLCBQcm92aWRlciwgU2tpcFNlbGYsIMm1UnVudGltZUVycm9yIGFzIFJ1bnRpbWVFcnJvcn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7RW1wdHlPdXRsZXRDb21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9lbXB0eV9vdXRsZXQnO1xuaW1wb3J0IHtSb3V0ZXJMaW5rfSBmcm9tICcuL2RpcmVjdGl2ZXMvcm91dGVyX2xpbmsnO1xuaW1wb3J0IHtSb3V0ZXJMaW5rQWN0aXZlfSBmcm9tICcuL2RpcmVjdGl2ZXMvcm91dGVyX2xpbmtfYWN0aXZlJztcbmltcG9ydCB7Um91dGVyT3V0bGV0fSBmcm9tICcuL2RpcmVjdGl2ZXMvcm91dGVyX291dGxldCc7XG5pbXBvcnQge1J1bnRpbWVFcnJvckNvZGV9IGZyb20gJy4vZXJyb3JzJztcbmltcG9ydCB7Um91dGVzfSBmcm9tICcuL21vZGVscyc7XG5pbXBvcnQge05hdmlnYXRpb25UcmFuc2l0aW9uc30gZnJvbSAnLi9uYXZpZ2F0aW9uX3RyYW5zaXRpb24nO1xuaW1wb3J0IHtnZXRCb290c3RyYXBMaXN0ZW5lciwgcm9vdFJvdXRlLCBST1VURVJfSVNfUFJPVklERUQsIHdpdGhEZWJ1Z1RyYWNpbmcsIHdpdGhEaXNhYmxlZEluaXRpYWxOYXZpZ2F0aW9uLCB3aXRoRW5hYmxlZEJsb2NraW5nSW5pdGlhbE5hdmlnYXRpb24sIHdpdGhQcmVsb2FkaW5nfSBmcm9tICcuL3Byb3ZpZGVfcm91dGVyJztcbmltcG9ydCB7Um91dGVyfSBmcm9tICcuL3JvdXRlcic7XG5pbXBvcnQge0V4dHJhT3B0aW9ucywgUk9VVEVSX0NPTkZJR1VSQVRJT059IGZyb20gJy4vcm91dGVyX2NvbmZpZyc7XG5pbXBvcnQge1JvdXRlckNvbmZpZ0xvYWRlciwgUk9VVEVTfSBmcm9tICcuL3JvdXRlcl9jb25maWdfbG9hZGVyJztcbmltcG9ydCB7Q2hpbGRyZW5PdXRsZXRDb250ZXh0c30gZnJvbSAnLi9yb3V0ZXJfb3V0bGV0X2NvbnRleHQnO1xuaW1wb3J0IHtST1VURVJfU0NST0xMRVIsIFJvdXRlclNjcm9sbGVyfSBmcm9tICcuL3JvdXRlcl9zY3JvbGxlcic7XG5pbXBvcnQge0FjdGl2YXRlZFJvdXRlfSBmcm9tICcuL3JvdXRlcl9zdGF0ZSc7XG5pbXBvcnQge0RlZmF1bHRVcmxTZXJpYWxpemVyLCBVcmxTZXJpYWxpemVyfSBmcm9tICcuL3VybF90cmVlJztcblxuY29uc3QgTkdfREVWX01PREUgPSB0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGU7XG5cbi8qKlxuICogVGhlIGRpcmVjdGl2ZXMgZGVmaW5lZCBpbiB0aGUgYFJvdXRlck1vZHVsZWAuXG4gKi9cbmNvbnN0IFJPVVRFUl9ESVJFQ1RJVkVTID0gW1JvdXRlck91dGxldCwgUm91dGVyTGluaywgUm91dGVyTGlua0FjdGl2ZSwgRW1wdHlPdXRsZXRDb21wb25lbnRdO1xuXG4vKipcbiAqIEBkb2NzTm90UmVxdWlyZWRcbiAqL1xuZXhwb3J0IGNvbnN0IFJPVVRFUl9GT1JST09UX0dVQVJEID0gbmV3IEluamVjdGlvblRva2VuPHZvaWQ+KFxuICAgIE5HX0RFVl9NT0RFID8gJ3JvdXRlciBkdXBsaWNhdGUgZm9yUm9vdCBndWFyZCcgOiAnUk9VVEVSX0ZPUlJPT1RfR1VBUkQnKTtcblxuLy8gVE9ETyhhdHNjb3R0KTogQWxsIG9mIHRoZXNlIGV4Y2VwdCBgQWN0aXZhdGVkUm91dGVgIGFyZSBgcHJvdmlkZWRJbjogJ3Jvb3QnYC4gVGhleSBhcmUgb25seSBrZXB0XG4vLyBoZXJlIHRvIGF2b2lkIGEgYnJlYWtpbmcgY2hhbmdlIHdoZXJlYnkgdGhlIHByb3ZpZGVyIG9yZGVyIG1hdHRlcnMgYmFzZWQgb24gd2hlcmUgdGhlXG4vLyBgUm91dGVyTW9kdWxlYC9gUm91dGVyVGVzdGluZ01vZHVsZWAgaXMgaW1wb3J0ZWQuIFRoZXNlIGNhbi9zaG91bGQgYmUgcmVtb3ZlZCBhcyBhIFwiYnJlYWtpbmdcIlxuLy8gY2hhbmdlIGluIGEgbWFqb3IgdmVyc2lvbi5cbmV4cG9ydCBjb25zdCBST1VURVJfUFJPVklERVJTOiBQcm92aWRlcltdID0gW1xuICBMb2NhdGlvbixcbiAge3Byb3ZpZGU6IFVybFNlcmlhbGl6ZXIsIHVzZUNsYXNzOiBEZWZhdWx0VXJsU2VyaWFsaXplcn0sXG4gIFJvdXRlcixcbiAgQ2hpbGRyZW5PdXRsZXRDb250ZXh0cyxcbiAge3Byb3ZpZGU6IEFjdGl2YXRlZFJvdXRlLCB1c2VGYWN0b3J5OiByb290Um91dGUsIGRlcHM6IFtSb3V0ZXJdfSxcbiAgUm91dGVyQ29uZmlnTG9hZGVyLFxuICAvLyBPbmx5IHVzZWQgdG8gd2FybiB3aGVuIGBwcm92aWRlUm91dGVzYCBpcyB1c2VkIHdpdGhvdXQgYFJvdXRlck1vZHVsZWAgb3IgYHByb3ZpZGVSb3V0ZXJgLiBDYW5cbiAgLy8gYmUgcmVtb3ZlZCB3aGVuIGBwcm92aWRlUm91dGVzYCBpcyByZW1vdmVkLlxuICBOR19ERVZfTU9ERSA/IHtwcm92aWRlOiBST1VURVJfSVNfUFJPVklERUQsIHVzZVZhbHVlOiB0cnVlfSA6IFtdLFxuXTtcblxuZXhwb3J0IGZ1bmN0aW9uIHJvdXRlck5nUHJvYmVUb2tlbigpIHtcbiAgcmV0dXJuIG5ldyBOZ1Byb2JlVG9rZW4oJ1JvdXRlcicsIFJvdXRlcik7XG59XG5cbi8qKlxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogQWRkcyBkaXJlY3RpdmVzIGFuZCBwcm92aWRlcnMgZm9yIGluLWFwcCBuYXZpZ2F0aW9uIGFtb25nIHZpZXdzIGRlZmluZWQgaW4gYW4gYXBwbGljYXRpb24uXG4gKiBVc2UgdGhlIEFuZ3VsYXIgYFJvdXRlcmAgc2VydmljZSB0byBkZWNsYXJhdGl2ZWx5IHNwZWNpZnkgYXBwbGljYXRpb24gc3RhdGVzIGFuZCBtYW5hZ2Ugc3RhdGVcbiAqIHRyYW5zaXRpb25zLlxuICpcbiAqIFlvdSBjYW4gaW1wb3J0IHRoaXMgTmdNb2R1bGUgbXVsdGlwbGUgdGltZXMsIG9uY2UgZm9yIGVhY2ggbGF6eS1sb2FkZWQgYnVuZGxlLlxuICogSG93ZXZlciwgb25seSBvbmUgYFJvdXRlcmAgc2VydmljZSBjYW4gYmUgYWN0aXZlLlxuICogVG8gZW5zdXJlIHRoaXMsIHRoZXJlIGFyZSB0d28gd2F5cyB0byByZWdpc3RlciByb3V0ZXMgd2hlbiBpbXBvcnRpbmcgdGhpcyBtb2R1bGU6XG4gKlxuICogKiBUaGUgYGZvclJvb3QoKWAgbWV0aG9kIGNyZWF0ZXMgYW4gYE5nTW9kdWxlYCB0aGF0IGNvbnRhaW5zIGFsbCB0aGUgZGlyZWN0aXZlcywgdGhlIGdpdmVuXG4gKiByb3V0ZXMsIGFuZCB0aGUgYFJvdXRlcmAgc2VydmljZSBpdHNlbGYuXG4gKiAqIFRoZSBgZm9yQ2hpbGQoKWAgbWV0aG9kIGNyZWF0ZXMgYW4gYE5nTW9kdWxlYCB0aGF0IGNvbnRhaW5zIGFsbCB0aGUgZGlyZWN0aXZlcyBhbmQgdGhlIGdpdmVuXG4gKiByb3V0ZXMsIGJ1dCBkb2VzIG5vdCBpbmNsdWRlIHRoZSBgUm91dGVyYCBzZXJ2aWNlLlxuICpcbiAqIEBzZWUgW1JvdXRpbmcgYW5kIE5hdmlnYXRpb24gZ3VpZGVdKGd1aWRlL3JvdXRlcikgZm9yIGFuXG4gKiBvdmVydmlldyBvZiBob3cgdGhlIGBSb3V0ZXJgIHNlcnZpY2Ugc2hvdWxkIGJlIHVzZWQuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5ATmdNb2R1bGUoe1xuICBpbXBvcnRzOiBST1VURVJfRElSRUNUSVZFUyxcbiAgZXhwb3J0czogUk9VVEVSX0RJUkVDVElWRVMsXG59KVxuZXhwb3J0IGNsYXNzIFJvdXRlck1vZHVsZSB7XG4gIGNvbnN0cnVjdG9yKEBPcHRpb25hbCgpIEBJbmplY3QoUk9VVEVSX0ZPUlJPT1RfR1VBUkQpIGd1YXJkOiBhbnkpIHt9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYW5kIGNvbmZpZ3VyZXMgYSBtb2R1bGUgd2l0aCBhbGwgdGhlIHJvdXRlciBwcm92aWRlcnMgYW5kIGRpcmVjdGl2ZXMuXG4gICAqIE9wdGlvbmFsbHkgc2V0cyB1cCBhbiBhcHBsaWNhdGlvbiBsaXN0ZW5lciB0byBwZXJmb3JtIGFuIGluaXRpYWwgbmF2aWdhdGlvbi5cbiAgICpcbiAgICogV2hlbiByZWdpc3RlcmluZyB0aGUgTmdNb2R1bGUgYXQgdGhlIHJvb3QsIGltcG9ydCBhcyBmb2xsb3dzOlxuICAgKlxuICAgKiBgYGBcbiAgICogQE5nTW9kdWxlKHtcbiAgICogICBpbXBvcnRzOiBbUm91dGVyTW9kdWxlLmZvclJvb3QoUk9VVEVTKV1cbiAgICogfSlcbiAgICogY2xhc3MgTXlOZ01vZHVsZSB7fVxuICAgKiBgYGBcbiAgICpcbiAgICogQHBhcmFtIHJvdXRlcyBBbiBhcnJheSBvZiBgUm91dGVgIG9iamVjdHMgdGhhdCBkZWZpbmUgdGhlIG5hdmlnYXRpb24gcGF0aHMgZm9yIHRoZSBhcHBsaWNhdGlvbi5cbiAgICogQHBhcmFtIGNvbmZpZyBBbiBgRXh0cmFPcHRpb25zYCBjb25maWd1cmF0aW9uIG9iamVjdCB0aGF0IGNvbnRyb2xzIGhvdyBuYXZpZ2F0aW9uIGlzIHBlcmZvcm1lZC5cbiAgICogQHJldHVybiBUaGUgbmV3IGBOZ01vZHVsZWAuXG4gICAqXG4gICAqL1xuICBzdGF0aWMgZm9yUm9vdChyb3V0ZXM6IFJvdXRlcywgY29uZmlnPzogRXh0cmFPcHRpb25zKTogTW9kdWxlV2l0aFByb3ZpZGVyczxSb3V0ZXJNb2R1bGU+IHtcbiAgICByZXR1cm4ge1xuICAgICAgbmdNb2R1bGU6IFJvdXRlck1vZHVsZSxcbiAgICAgIHByb3ZpZGVyczogW1xuICAgICAgICBST1VURVJfUFJPVklERVJTLFxuICAgICAgICBOR19ERVZfTU9ERSA/IChjb25maWc/LmVuYWJsZVRyYWNpbmcgPyB3aXRoRGVidWdUcmFjaW5nKCkuybVwcm92aWRlcnMgOiBbXSkgOiBbXSxcbiAgICAgICAge3Byb3ZpZGU6IFJPVVRFUywgbXVsdGk6IHRydWUsIHVzZVZhbHVlOiByb3V0ZXN9LFxuICAgICAgICB7XG4gICAgICAgICAgcHJvdmlkZTogUk9VVEVSX0ZPUlJPT1RfR1VBUkQsXG4gICAgICAgICAgdXNlRmFjdG9yeTogcHJvdmlkZUZvclJvb3RHdWFyZCxcbiAgICAgICAgICBkZXBzOiBbW1JvdXRlciwgbmV3IE9wdGlvbmFsKCksIG5ldyBTa2lwU2VsZigpXV1cbiAgICAgICAgfSxcbiAgICAgICAge3Byb3ZpZGU6IFJPVVRFUl9DT05GSUdVUkFUSU9OLCB1c2VWYWx1ZTogY29uZmlnID8gY29uZmlnIDoge319LFxuICAgICAgICBjb25maWc/LnVzZUhhc2ggPyBwcm92aWRlSGFzaExvY2F0aW9uU3RyYXRlZ3koKSA6IHByb3ZpZGVQYXRoTG9jYXRpb25TdHJhdGVneSgpLFxuICAgICAgICBwcm92aWRlUm91dGVyU2Nyb2xsZXIoKSxcbiAgICAgICAgY29uZmlnPy5wcmVsb2FkaW5nU3RyYXRlZ3kgPyB3aXRoUHJlbG9hZGluZyhjb25maWcucHJlbG9hZGluZ1N0cmF0ZWd5KS7JtXByb3ZpZGVycyA6IFtdLFxuICAgICAgICB7cHJvdmlkZTogTmdQcm9iZVRva2VuLCBtdWx0aTogdHJ1ZSwgdXNlRmFjdG9yeTogcm91dGVyTmdQcm9iZVRva2VufSxcbiAgICAgICAgY29uZmlnPy5pbml0aWFsTmF2aWdhdGlvbiA/IHByb3ZpZGVJbml0aWFsTmF2aWdhdGlvbihjb25maWcpIDogW10sXG4gICAgICAgIHByb3ZpZGVSb3V0ZXJJbml0aWFsaXplcigpLFxuICAgICAgXSxcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBtb2R1bGUgd2l0aCBhbGwgdGhlIHJvdXRlciBkaXJlY3RpdmVzIGFuZCBhIHByb3ZpZGVyIHJlZ2lzdGVyaW5nIHJvdXRlcyxcbiAgICogd2l0aG91dCBjcmVhdGluZyBhIG5ldyBSb3V0ZXIgc2VydmljZS5cbiAgICogV2hlbiByZWdpc3RlcmluZyBmb3Igc3VibW9kdWxlcyBhbmQgbGF6eS1sb2FkZWQgc3VibW9kdWxlcywgY3JlYXRlIHRoZSBOZ01vZHVsZSBhcyBmb2xsb3dzOlxuICAgKlxuICAgKiBgYGBcbiAgICogQE5nTW9kdWxlKHtcbiAgICogICBpbXBvcnRzOiBbUm91dGVyTW9kdWxlLmZvckNoaWxkKFJPVVRFUyldXG4gICAqIH0pXG4gICAqIGNsYXNzIE15TmdNb2R1bGUge31cbiAgICogYGBgXG4gICAqXG4gICAqIEBwYXJhbSByb3V0ZXMgQW4gYXJyYXkgb2YgYFJvdXRlYCBvYmplY3RzIHRoYXQgZGVmaW5lIHRoZSBuYXZpZ2F0aW9uIHBhdGhzIGZvciB0aGUgc3VibW9kdWxlLlxuICAgKiBAcmV0dXJuIFRoZSBuZXcgTmdNb2R1bGUuXG4gICAqXG4gICAqL1xuICBzdGF0aWMgZm9yQ2hpbGQocm91dGVzOiBSb3V0ZXMpOiBNb2R1bGVXaXRoUHJvdmlkZXJzPFJvdXRlck1vZHVsZT4ge1xuICAgIHJldHVybiB7XG4gICAgICBuZ01vZHVsZTogUm91dGVyTW9kdWxlLFxuICAgICAgcHJvdmlkZXJzOiBbe3Byb3ZpZGU6IFJPVVRFUywgbXVsdGk6IHRydWUsIHVzZVZhbHVlOiByb3V0ZXN9XSxcbiAgICB9O1xuICB9XG59XG5cbi8qKlxuICogRm9yIGludGVybmFsIHVzZSBieSBgUm91dGVyTW9kdWxlYCBvbmx5LiBOb3RlIHRoYXQgdGhpcyBkaWZmZXJzIGZyb20gYHdpdGhJbk1lbW9yeVJvdXRlclNjcm9sbGVyYFxuICogYmVjYXVzZSBpdCByZWFkcyBmcm9tIHRoZSBgRXh0cmFPcHRpb25zYCB3aGljaCBzaG91bGQgbm90IGJlIHVzZWQgaW4gdGhlIHN0YW5kYWxvbmUgd29ybGQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwcm92aWRlUm91dGVyU2Nyb2xsZXIoKTogUHJvdmlkZXIge1xuICByZXR1cm4ge1xuICAgIHByb3ZpZGU6IFJPVVRFUl9TQ1JPTExFUixcbiAgICB1c2VGYWN0b3J5OiAoKSA9PiB7XG4gICAgICBjb25zdCB2aWV3cG9ydFNjcm9sbGVyID0gaW5qZWN0KFZpZXdwb3J0U2Nyb2xsZXIpO1xuICAgICAgY29uc3Qgem9uZSA9IGluamVjdChOZ1pvbmUpO1xuICAgICAgY29uc3QgY29uZmlnOiBFeHRyYU9wdGlvbnMgPSBpbmplY3QoUk9VVEVSX0NPTkZJR1VSQVRJT04pO1xuICAgICAgY29uc3QgdHJhbnNpdGlvbnMgPSBpbmplY3QoTmF2aWdhdGlvblRyYW5zaXRpb25zKTtcbiAgICAgIGNvbnN0IHVybFNlcmlhbGl6ZXIgPSBpbmplY3QoVXJsU2VyaWFsaXplcik7XG4gICAgICBpZiAoY29uZmlnLnNjcm9sbE9mZnNldCkge1xuICAgICAgICB2aWV3cG9ydFNjcm9sbGVyLnNldE9mZnNldChjb25maWcuc2Nyb2xsT2Zmc2V0KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgUm91dGVyU2Nyb2xsZXIodXJsU2VyaWFsaXplciwgdHJhbnNpdGlvbnMsIHZpZXdwb3J0U2Nyb2xsZXIsIHpvbmUsIGNvbmZpZyk7XG4gICAgfSxcbiAgfTtcbn1cblxuLy8gTm90ZTogRm9yIGludGVybmFsIHVzZSBvbmx5IHdpdGggYFJvdXRlck1vZHVsZWAuIFN0YW5kYWxvbmUgc2V0dXAgdmlhIGBwcm92aWRlUm91dGVyYCBzaG91bGRcbi8vIHByb3ZpZGUgaGFzaCBsb2NhdGlvbiBkaXJlY3RseSB2aWEgYHtwcm92aWRlOiBMb2NhdGlvblN0cmF0ZWd5LCB1c2VDbGFzczogSGFzaExvY2F0aW9uU3RyYXRlZ3l9YC5cbmZ1bmN0aW9uIHByb3ZpZGVIYXNoTG9jYXRpb25TdHJhdGVneSgpOiBQcm92aWRlciB7XG4gIHJldHVybiB7cHJvdmlkZTogTG9jYXRpb25TdHJhdGVneSwgdXNlQ2xhc3M6IEhhc2hMb2NhdGlvblN0cmF0ZWd5fTtcbn1cblxuLy8gTm90ZTogRm9yIGludGVybmFsIHVzZSBvbmx5IHdpdGggYFJvdXRlck1vZHVsZWAuIFN0YW5kYWxvbmUgc2V0dXAgdmlhIGBwcm92aWRlUm91dGVyYCBkb2VzIG5vdFxuLy8gbmVlZCB0aGlzIGF0IGFsbCBiZWNhdXNlIGBQYXRoTG9jYXRpb25TdHJhdGVneWAgaXMgdGhlIGRlZmF1bHQgZmFjdG9yeSBmb3IgYExvY2F0aW9uU3RyYXRlZ3lgLlxuZnVuY3Rpb24gcHJvdmlkZVBhdGhMb2NhdGlvblN0cmF0ZWd5KCk6IFByb3ZpZGVyIHtcbiAgcmV0dXJuIHtwcm92aWRlOiBMb2NhdGlvblN0cmF0ZWd5LCB1c2VDbGFzczogUGF0aExvY2F0aW9uU3RyYXRlZ3l9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcHJvdmlkZUZvclJvb3RHdWFyZChyb3V0ZXI6IFJvdXRlcik6IGFueSB7XG4gIGlmIChOR19ERVZfTU9ERSAmJiByb3V0ZXIpIHtcbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLkZPUl9ST09UX0NBTExFRF9UV0lDRSxcbiAgICAgICAgYFRoZSBSb3V0ZXIgd2FzIHByb3ZpZGVkIG1vcmUgdGhhbiBvbmNlLiBUaGlzIGNhbiBoYXBwZW4gaWYgJ2ZvclJvb3QnIGlzIHVzZWQgb3V0c2lkZSBvZiB0aGUgcm9vdCBpbmplY3Rvci5gICtcbiAgICAgICAgICAgIGAgTGF6eSBsb2FkZWQgbW9kdWxlcyBzaG91bGQgdXNlIFJvdXRlck1vZHVsZS5mb3JDaGlsZCgpIGluc3RlYWQuYCk7XG4gIH1cbiAgcmV0dXJuICdndWFyZGVkJztcbn1cblxuLy8gTm90ZTogRm9yIGludGVybmFsIHVzZSBvbmx5IHdpdGggYFJvdXRlck1vZHVsZWAuIFN0YW5kYWxvbmUgcm91dGVyIHNldHVwIHdpdGggYHByb3ZpZGVSb3V0ZXJgXG4vLyB1c2VycyBjYWxsIGB3aXRoWEluaXRpYWxOYXZpZ2F0aW9uYCBkaXJlY3RseS5cbmZ1bmN0aW9uIHByb3ZpZGVJbml0aWFsTmF2aWdhdGlvbihjb25maWc6IFBpY2s8RXh0cmFPcHRpb25zLCAnaW5pdGlhbE5hdmlnYXRpb24nPik6IFByb3ZpZGVyW10ge1xuICByZXR1cm4gW1xuICAgIGNvbmZpZy5pbml0aWFsTmF2aWdhdGlvbiA9PT0gJ2Rpc2FibGVkJyA/IHdpdGhEaXNhYmxlZEluaXRpYWxOYXZpZ2F0aW9uKCkuybVwcm92aWRlcnMgOiBbXSxcbiAgICBjb25maWcuaW5pdGlhbE5hdmlnYXRpb24gPT09ICdlbmFibGVkQmxvY2tpbmcnID9cbiAgICAgICAgd2l0aEVuYWJsZWRCbG9ja2luZ0luaXRpYWxOYXZpZ2F0aW9uKCkuybVwcm92aWRlcnMgOlxuICAgICAgICBbXSxcbiAgXTtcbn1cblxuLy8gVE9ETyhhdHNjb3R0KTogVGhpcyBzaG91bGQgbm90IGJlIGluIHRoZSBwdWJsaWMgQVBJXG4vKipcbiAqIEEgW0RJIHRva2VuXShndWlkZS9nbG9zc2FyeS8jZGktdG9rZW4pIGZvciB0aGUgcm91dGVyIGluaXRpYWxpemVyIHRoYXRcbiAqIGlzIGNhbGxlZCBhZnRlciB0aGUgYXBwIGlzIGJvb3RzdHJhcHBlZC5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjb25zdCBST1VURVJfSU5JVElBTElaRVIgPSBuZXcgSW5qZWN0aW9uVG9rZW48KGNvbXBSZWY6IENvbXBvbmVudFJlZjxhbnk+KSA9PiB2b2lkPihcbiAgICBOR19ERVZfTU9ERSA/ICdSb3V0ZXIgSW5pdGlhbGl6ZXInIDogJycpO1xuXG5mdW5jdGlvbiBwcm92aWRlUm91dGVySW5pdGlhbGl6ZXIoKTogUHJvdmlkZXJbXSB7XG4gIHJldHVybiBbXG4gICAgLy8gUk9VVEVSX0lOSVRJQUxJWkVSIHRva2VuIHNob3VsZCBiZSByZW1vdmVkLiBJdCdzIHB1YmxpYyBBUEkgYnV0IHNob3VsZG4ndCBiZS4gV2UgY2FuIGp1c3RcbiAgICAvLyBoYXZlIGBnZXRCb290c3RyYXBMaXN0ZW5lcmAgZGlyZWN0bHkgYXR0YWNoZWQgdG8gQVBQX0JPT1RTVFJBUF9MSVNURU5FUi5cbiAgICB7cHJvdmlkZTogUk9VVEVSX0lOSVRJQUxJWkVSLCB1c2VGYWN0b3J5OiBnZXRCb290c3RyYXBMaXN0ZW5lcn0sXG4gICAge3Byb3ZpZGU6IEFQUF9CT09UU1RSQVBfTElTVEVORVIsIG11bHRpOiB0cnVlLCB1c2VFeGlzdGluZzogUk9VVEVSX0lOSVRJQUxJWkVSfSxcbiAgXTtcbn1cbiJdfQ==