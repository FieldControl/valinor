/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Location } from '@angular/common';
import { provideLocationMocks } from '@angular/common/testing';
import { Compiler, inject, Injector, NgModule } from '@angular/core';
import { ChildrenOutletContexts, NoPreloading, Router, ROUTER_CONFIGURATION, RouteReuseStrategy, RouterModule, ROUTES, TitleStrategy, UrlHandlingStrategy, UrlSerializer, ɵROUTER_PROVIDERS as ROUTER_PROVIDERS, ɵwithPreloading as withPreloading } from '@angular/router';
import * as i0 from "@angular/core";
function isUrlHandlingStrategy(opts) {
    // This property check is needed because UrlHandlingStrategy is an interface and doesn't exist at
    // runtime.
    return 'shouldProcessUrl' in opts;
}
function throwInvalidConfigError(parameter) {
    throw new Error(`Parameter ${parameter} does not match the one available in the injector. ` +
        '`setupTestingRouter` is meant to be used as a factory function with dependencies coming from DI.');
}
/**
 * Router setup factory function used for testing.
 *
 * @publicApi
 * @deprecated Use `provideRouter` or `RouterTestingModule` instead.
 */
export function setupTestingRouter(urlSerializer, contexts, location, compiler, injector, routes, opts, urlHandlingStrategy, routeReuseStrategy, titleStrategy) {
    // Note: The checks below are to detect misconfigured providers and invalid uses of
    // `setupTestingRouter`. This function is not used internally (neither in router code or anywhere
    // in g3). It appears this function was exposed as publicApi by mistake and should not be used
    // externally either. However, if it is, the documented intent is to be used as a factory function
    // and parameter values should always match what's available in DI.
    if (urlSerializer !== inject(UrlSerializer)) {
        throwInvalidConfigError('urlSerializer');
    }
    if (contexts !== inject(ChildrenOutletContexts)) {
        throwInvalidConfigError('contexts');
    }
    if (location !== inject(Location)) {
        throwInvalidConfigError('location');
    }
    if (compiler !== inject(Compiler)) {
        throwInvalidConfigError('compiler');
    }
    if (injector !== inject(Injector)) {
        throwInvalidConfigError('injector');
    }
    if (routes !== inject(ROUTES)) {
        throwInvalidConfigError('routes');
    }
    if (opts) {
        // Handle deprecated argument ordering.
        if (isUrlHandlingStrategy(opts)) {
            if (opts !== inject(UrlHandlingStrategy)) {
                throwInvalidConfigError('opts (UrlHandlingStrategy)');
            }
        }
        else {
            if (opts !== inject(ROUTER_CONFIGURATION)) {
                throwInvalidConfigError('opts (ROUTER_CONFIGURATION)');
            }
        }
    }
    if (urlHandlingStrategy !== inject(UrlHandlingStrategy)) {
        throwInvalidConfigError('urlHandlingStrategy');
    }
    if (routeReuseStrategy !== inject(RouteReuseStrategy)) {
        throwInvalidConfigError('routeReuseStrategy');
    }
    if (titleStrategy !== inject(TitleStrategy)) {
        throwInvalidConfigError('titleStrategy');
    }
    return new Router();
}
/**
 * @description
 *
 * Sets up the router to be used for testing.
 *
 * The modules sets up the router to be used for testing.
 * It provides spy implementations of `Location` and `LocationStrategy`.
 *
 * @usageNotes
 * ### Example
 *
 * ```
 * beforeEach(() => {
 *   TestBed.configureTestingModule({
 *     imports: [
 *       RouterTestingModule.withRoutes(
 *         [{path: '', component: BlankCmp}, {path: 'simple', component: SimpleCmp}]
 *       )
 *     ]
 *   });
 * });
 * ```
 *
 * @publicApi
 */
export class RouterTestingModule {
    static withRoutes(routes, config) {
        return {
            ngModule: RouterTestingModule,
            providers: [
                { provide: ROUTES, multi: true, useValue: routes },
                { provide: ROUTER_CONFIGURATION, useValue: config ? config : {} },
            ]
        };
    }
}
RouterTestingModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.1", ngImport: i0, type: RouterTestingModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
RouterTestingModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "15.2.1", ngImport: i0, type: RouterTestingModule, exports: [RouterModule] });
RouterTestingModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "15.2.1", ngImport: i0, type: RouterTestingModule, providers: [
        ROUTER_PROVIDERS,
        provideLocationMocks(),
        withPreloading(NoPreloading).ɵproviders,
        { provide: ROUTES, multi: true, useValue: [] },
    ], imports: [RouterModule] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.1", ngImport: i0, type: RouterTestingModule, decorators: [{
            type: NgModule,
            args: [{
                    exports: [RouterModule],
                    providers: [
                        ROUTER_PROVIDERS,
                        provideLocationMocks(),
                        withPreloading(NoPreloading).ɵproviders,
                        { provide: ROUTES, multi: true, useValue: [] },
                    ]
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyX3Rlc3RpbmdfbW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvcm91dGVyL3Rlc3Rpbmcvc3JjL3JvdXRlcl90ZXN0aW5nX21vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDekMsT0FBTyxFQUFDLG9CQUFvQixFQUFDLE1BQU0seUJBQXlCLENBQUM7QUFDN0QsT0FBTyxFQUFDLFFBQVEsRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUF1QixRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDeEYsT0FBTyxFQUFDLHNCQUFzQixFQUFnQixZQUFZLEVBQVMsTUFBTSxFQUFFLG9CQUFvQixFQUFFLGtCQUFrQixFQUFFLFlBQVksRUFBRSxNQUFNLEVBQVUsYUFBYSxFQUFFLG1CQUFtQixFQUFFLGFBQWEsRUFBdUIsaUJBQWlCLElBQUksZ0JBQWdCLEVBQUUsZUFBZSxJQUFJLGNBQWMsRUFBQyxNQUFNLGlCQUFpQixDQUFDOztBQUU1VCxTQUFTLHFCQUFxQixDQUFDLElBQ21CO0lBQ2hELGlHQUFpRztJQUNqRyxXQUFXO0lBQ1gsT0FBTyxrQkFBa0IsSUFBSSxJQUFJLENBQUM7QUFDcEMsQ0FBQztBQUVELFNBQVMsdUJBQXVCLENBQUMsU0FBaUI7SUFDaEQsTUFBTSxJQUFJLEtBQUssQ0FDWCxhQUFhLFNBQVMscURBQXFEO1FBQzNFLGtHQUFrRyxDQUFDLENBQUM7QUFDMUcsQ0FBQztBQUVEOzs7OztHQUtHO0FBQ0gsTUFBTSxVQUFVLGtCQUFrQixDQUM5QixhQUE0QixFQUFFLFFBQWdDLEVBQUUsUUFBa0IsRUFDbEYsUUFBa0IsRUFBRSxRQUFrQixFQUFFLE1BQWlCLEVBQ3pELElBQTRDLEVBQUUsbUJBQXlDLEVBQ3ZGLGtCQUF1QyxFQUFFLGFBQTZCO0lBQ3hFLG1GQUFt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QixjQUFjLENBQUMsWUFBWSxDQUFDLENBQUMsVUFBVTt3QkFDdkMsRUFBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBQztxQkFDN0M7aUJBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtMb2NhdGlvbn0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7cHJvdmlkZUxvY2F0aW9uTW9ja3N9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbi90ZXN0aW5nJztcbmltcG9ydCB7Q29tcGlsZXIsIGluamVjdCwgSW5qZWN0b3IsIE1vZHVsZVdpdGhQcm92aWRlcnMsIE5nTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7Q2hpbGRyZW5PdXRsZXRDb250ZXh0cywgRXh0cmFPcHRpb25zLCBOb1ByZWxvYWRpbmcsIFJvdXRlLCBSb3V0ZXIsIFJPVVRFUl9DT05GSUdVUkFUSU9OLCBSb3V0ZVJldXNlU3RyYXRlZ3ksIFJvdXRlck1vZHVsZSwgUk9VVEVTLCBSb3V0ZXMsIFRpdGxlU3RyYXRlZ3ksIFVybEhhbmRsaW5nU3RyYXRlZ3ksIFVybFNlcmlhbGl6ZXIsIMm1ZmxhdHRlbiBhcyBmbGF0dGVuLCDJtVJPVVRFUl9QUk9WSURFUlMgYXMgUk9VVEVSX1BST1ZJREVSUywgybV3aXRoUHJlbG9hZGluZyBhcyB3aXRoUHJlbG9hZGluZ30gZnJvbSAnQGFuZ3VsYXIvcm91dGVyJztcblxuZnVuY3Rpb24gaXNVcmxIYW5kbGluZ1N0cmF0ZWd5KG9wdHM6IEV4dHJhT3B0aW9uc3xcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBVcmxIYW5kbGluZ1N0cmF0ZWd5KTogb3B0cyBpcyBVcmxIYW5kbGluZ1N0cmF0ZWd5IHtcbiAgLy8gVGhpcyBwcm9wZXJ0eSBjaGVjayBpcyBuZWVkZWQgYmVjYXVzZSBVcmxIYW5kbGluZ1N0cmF0ZWd5IGlzIGFuIGludGVyZmFjZSBhbmQgZG9lc24ndCBleGlzdCBhdFxuICAvLyBydW50aW1lLlxuICByZXR1cm4gJ3Nob3VsZFByb2Nlc3NVcmwnIGluIG9wdHM7XG59XG5cbmZ1bmN0aW9uIHRocm93SW52YWxpZENvbmZpZ0Vycm9yKHBhcmFtZXRlcjogc3RyaW5nKTogbmV2ZXIge1xuICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBgUGFyYW1ldGVyICR7cGFyYW1ldGVyfSBkb2VzIG5vdCBtYXRjaCB0aGUgb25lIGF2YWlsYWJsZSBpbiB0aGUgaW5qZWN0b3IuIGAgK1xuICAgICAgJ2BzZXR1cFRlc3RpbmdSb3V0ZXJgIGlzIG1lYW50IHRvIGJlIHVzZWQgYXMgYSBmYWN0b3J5IGZ1bmN0aW9uIHdpdGggZGVwZW5kZW5jaWVzIGNvbWluZyBmcm9tIERJLicpO1xufVxuXG4vKipcbiAqIFJvdXRlciBzZXR1cCBmYWN0b3J5IGZ1bmN0aW9uIHVzZWQgZm9yIHRlc3RpbmcuXG4gKlxuICogQHB1YmxpY0FwaVxuICogQGRlcHJlY2F0ZWQgVXNlIGBwcm92aWRlUm91dGVyYCBvciBgUm91dGVyVGVzdGluZ01vZHVsZWAgaW5zdGVhZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldHVwVGVzdGluZ1JvdXRlcihcbiAgICB1cmxTZXJpYWxpemVyOiBVcmxTZXJpYWxpemVyLCBjb250ZXh0czogQ2hpbGRyZW5PdXRsZXRDb250ZXh0cywgbG9jYXRpb246IExvY2F0aW9uLFxuICAgIGNvbXBpbGVyOiBDb21waWxlciwgaW5qZWN0b3I6IEluamVjdG9yLCByb3V0ZXM6IFJvdXRlW11bXSxcbiAgICBvcHRzPzogRXh0cmFPcHRpb25zfFVybEhhbmRsaW5nU3RyYXRlZ3l8bnVsbCwgdXJsSGFuZGxpbmdTdHJhdGVneT86IFVybEhhbmRsaW5nU3RyYXRlZ3ksXG4gICAgcm91dGVSZXVzZVN0cmF0ZWd5PzogUm91dGVSZXVzZVN0cmF0ZWd5LCB0aXRsZVN0cmF0ZWd5PzogVGl0bGVTdHJhdGVneSkge1xuICAvLyBOb3RlOiBUaGUgY2hlY2tzIGJlbG93IGFyZSB0byBkZXRlY3QgbWlzY29uZmlndXJlZCBwcm92aWRlcnMgYW5kIGludmFsaWQgdXNlcyBvZlxuICAvLyBgc2V0dXBUZXN0aW5nUm91dGVyYC4gVGhpcyBmdW5jdGlvbiBpcyBub3QgdXNlZCBpbnRlcm5hbGx5IChuZWl0aGVyIGluIHJvdXRlciBjb2RlIG9yIGFueXdoZXJlXG4gIC8vIGluIGczKS4gSXQgYXBwZWFycyB0aGlzIGZ1bmN0aW9uIHdhcyBleHBvc2VkIGFzIHB1YmxpY0FwaSBieSBtaXN0YWtlIGFuZCBzaG91bGQgbm90IGJlIHVzZWRcbiAgLy8gZXh0ZXJuYWxseSBlaXRoZXIuIEhvd2V2ZXIsIGlmIGl0IGlzLCB0aGUgZG9jdW1lbnRlZCBpbnRlbnQgaXMgdG8gYmUgdXNlZCBhcyBhIGZhY3RvcnkgZnVuY3Rpb25cbiAgLy8gYW5kIHBhcmFtZXRlciB2YWx1ZXMgc2hvdWxkIGFsd2F5cyBtYXRjaCB3aGF0J3MgYXZhaWxhYmxlIGluIERJLlxuICBpZiAodXJsU2VyaWFsaXplciAhPT0gaW5qZWN0KFVybFNlcmlhbGl6ZXIpKSB7XG4gICAgdGhyb3dJbnZhbGlkQ29uZmlnRXJyb3IoJ3VybFNlcmlhbGl6ZXInKTtcbiAgfVxuICBpZiAoY29udGV4dHMgIT09IGluamVjdChDaGlsZHJlbk91dGxldENvbnRleHRzKSkge1xuICAgIHRocm93SW52YWxpZENvbmZpZ0Vycm9yKCdjb250ZXh0cycpO1xuICB9XG4gIGlmIChsb2NhdGlvbiAhPT0gaW5qZWN0KExvY2F0aW9uKSkge1xuICAgIHRocm93SW52YWxpZENvbmZpZ0Vycm9yKCdsb2NhdGlvbicpO1xuICB9XG4gIGlmIChjb21waWxlciAhPT0gaW5qZWN0KENvbXBpbGVyKSkge1xuICAgIHRocm93SW52YWxpZENvbmZpZ0Vycm9yKCdjb21waWxlcicpO1xuICB9XG4gIGlmIChpbmplY3RvciAhPT0gaW5qZWN0KEluamVjdG9yKSkge1xuICAgIHRocm93SW52YWxpZENvbmZpZ0Vycm9yKCdpbmplY3RvcicpO1xuICB9XG4gIGlmIChyb3V0ZXMgIT09IGluamVjdChST1VURVMpKSB7XG4gICAgdGhyb3dJbnZhbGlkQ29uZmlnRXJyb3IoJ3JvdXRlcycpO1xuICB9XG4gIGlmIChvcHRzKSB7XG4gICAgLy8gSGFuZGxlIGRlcHJlY2F0ZWQgYXJndW1lbnQgb3JkZXJpbmcuXG4gICAgaWYgKGlzVXJsSGFuZGxpbmdTdHJhdGVneShvcHRzKSkge1xuICAgICAgaWYgKG9wdHMgIT09IGluamVjdChVcmxIYW5kbGluZ1N0cmF0ZWd5KSkge1xuICAgICAgICB0aHJvd0ludmFsaWRDb25maWdFcnJvcignb3B0cyAoVXJsSGFuZGxpbmdTdHJhdGVneSknKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKG9wdHMgIT09IGluamVjdChST1VURVJfQ09ORklHVVJBVElPTikpIHtcbiAgICAgICAgdGhyb3dJbnZhbGlkQ29uZmlnRXJyb3IoJ29wdHMgKFJPVVRFUl9DT05GSUdVUkFUSU9OKScpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlmICh1cmxIYW5kbGluZ1N0cmF0ZWd5ICE9PSBpbmplY3QoVXJsSGFuZGxpbmdTdHJhdGVneSkpIHtcbiAgICB0aHJvd0ludmFsaWRDb25maWdFcnJvcigndXJsSGFuZGxpbmdTdHJhdGVneScpO1xuICB9XG5cbiAgaWYgKHJvdXRlUmV1c2VTdHJhdGVneSAhPT0gaW5qZWN0KFJvdXRlUmV1c2VTdHJhdGVneSkpIHtcbiAgICB0aHJvd0ludmFsaWRDb25maWdFcnJvcigncm91dGVSZXVzZVN0cmF0ZWd5Jyk7XG4gIH1cblxuICBpZiAodGl0bGVTdHJhdGVneSAhPT0gaW5qZWN0KFRpdGxlU3RyYXRlZ3kpKSB7XG4gICAgdGhyb3dJbnZhbGlkQ29uZmlnRXJyb3IoJ3RpdGxlU3RyYXRlZ3knKTtcbiAgfVxuXG4gIHJldHVybiBuZXcgUm91dGVyKCk7XG59XG5cbi8qKlxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogU2V0cyB1cCB0aGUgcm91dGVyIHRvIGJlIHVzZWQgZm9yIHRlc3RpbmcuXG4gKlxuICogVGhlIG1vZHVsZXMgc2V0cyB1cCB0aGUgcm91dGVyIHRvIGJlIHVzZWQgZm9yIHRlc3RpbmcuXG4gKiBJdCBwcm92aWRlcyBzcHkgaW1wbGVtZW50YXRpb25zIG9mIGBMb2NhdGlvbmAgYW5kIGBMb2NhdGlvblN0cmF0ZWd5YC5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBgYGBcbiAqIGJlZm9yZUVhY2goKCkgPT4ge1xuICogICBUZXN0QmVkLmNvbmZpZ3VyZVRlc3RpbmdNb2R1bGUoe1xuICogICAgIGltcG9ydHM6IFtcbiAqICAgICAgIFJvdXRlclRlc3RpbmdNb2R1bGUud2l0aFJvdXRlcyhcbiAqICAgICAgICAgW3twYXRoOiAnJywgY29tcG9uZW50OiBCbGFua0NtcH0sIHtwYXRoOiAnc2ltcGxlJywgY29tcG9uZW50OiBTaW1wbGVDbXB9XVxuICogICAgICAgKVxuICogICAgIF1cbiAqICAgfSk7XG4gKiB9KTtcbiAqIGBgYFxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQE5nTW9kdWxlKHtcbiAgZXhwb3J0czogW1JvdXRlck1vZHVsZV0sXG4gIHByb3ZpZGVyczogW1xuICAgIFJPVVRFUl9QUk9WSURFUlMsXG4gICAgcHJvdmlkZUxvY2F0aW9uTW9ja3MoKSxcbiAgICB3aXRoUHJlbG9hZGluZyhOb1ByZWxvYWRpbmcpLsm1cHJvdmlkZXJzLFxuICAgIHtwcm92aWRlOiBST1VURVMsIG11bHRpOiB0cnVlLCB1c2VWYWx1ZTogW119LFxuICBdXG59KVxuZXhwb3J0IGNsYXNzIFJvdXRlclRlc3RpbmdNb2R1bGUge1xuICBzdGF0aWMgd2l0aFJvdXRlcyhyb3V0ZXM6IFJvdXRlcywgY29uZmlnPzogRXh0cmFPcHRpb25zKTpcbiAgICAgIE1vZHVsZVdpdGhQcm92aWRlcnM8Um91dGVyVGVzdGluZ01vZHVsZT4ge1xuICAgIHJldHVybiB7XG4gICAgICBuZ01vZHVsZTogUm91dGVyVGVzdGluZ01vZHVsZSxcbiAgICAgIHByb3ZpZGVyczogW1xuICAgICAgICB7cHJvdmlkZTogUk9VVEVTLCBtdWx0aTogdHJ1ZSwgdXNlVmFsdWU6IHJvdXRlc30sXG4gICAgICAgIHtwcm92aWRlOiBST1VURVJfQ09ORklHVVJBVElPTiwgdXNlVmFsdWU6IGNvbmZpZyA/IGNvbmZpZyA6IHt9fSxcbiAgICAgIF1cbiAgICB9O1xuICB9XG59XG4iXX0=