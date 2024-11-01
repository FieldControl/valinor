/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { createEnvironmentInjector, isStandalone, ɵisNgModule as isNgModule, ɵRuntimeError as RuntimeError, } from '@angular/core';
import { PRIMARY_OUTLET } from '../shared';
/**
 * Creates an `EnvironmentInjector` if the `Route` has providers and one does not already exist
 * and returns the injector. Otherwise, if the `Route` does not have `providers`, returns the
 * `currentInjector`.
 *
 * @param route The route that might have providers
 * @param currentInjector The parent injector of the `Route`
 */
export function getOrCreateRouteInjectorIfNeeded(route, currentInjector) {
    if (route.providers && !route._injector) {
        route._injector = createEnvironmentInjector(route.providers, currentInjector, `Route: ${route.path}`);
    }
    return route._injector ?? currentInjector;
}
export function getLoadedRoutes(route) {
    return route._loadedRoutes;
}
export function getLoadedInjector(route) {
    return route._loadedInjector;
}
export function getLoadedComponent(route) {
    return route._loadedComponent;
}
export function getProvidersInjector(route) {
    return route._injector;
}
export function validateConfig(config, parentPath = '', requireStandaloneComponents = false) {
    // forEach doesn't iterate undefined values
    for (let i = 0; i < config.length; i++) {
        const route = config[i];
        const fullPath = getFullPath(parentPath, route);
        validateNode(route, fullPath, requireStandaloneComponents);
    }
}
export function assertStandalone(fullPath, component) {
    if (component && isNgModule(component)) {
        throw new RuntimeError(4014 /* RuntimeErrorCode.INVALID_ROUTE_CONFIG */, `Invalid configuration of route '${fullPath}'. You are using 'loadComponent' with a module, ` +
            `but it must be used with standalone components. Use 'loadChildren' instead.`);
    }
    else if (component && !isStandalone(component)) {
        throw new RuntimeError(4014 /* RuntimeErrorCode.INVALID_ROUTE_CONFIG */, `Invalid configuration of route '${fullPath}'. The component must be standalone.`);
    }
}
function validateNode(route, fullPath, requireStandaloneComponents) {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
        if (!route) {
            throw new RuntimeError(4014 /* RuntimeErrorCode.INVALID_ROUTE_CONFIG */, `
      Invalid configuration of route '${fullPath}': Encountered undefined route.
      The reason might be an extra comma.

      Example:
      const routes: Routes = [
        { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
        { path: 'dashboard',  component: DashboardComponent },, << two commas
        { path: 'detail/:id', component: HeroDetailComponent }
      ];
    `);
        }
        if (Array.isArray(route)) {
            throw new RuntimeError(4014 /* RuntimeErrorCode.INVALID_ROUTE_CONFIG */, `Invalid configuration of route '${fullPath}': Array cannot be specified`);
        }
        if (!route.redirectTo &&
            !route.component &&
            !route.loadComponent &&
            !route.children &&
            !route.loadChildren &&
            route.outlet &&
            route.outlet !== PRIMARY_OUTLET) {
            throw new RuntimeError(4014 /* RuntimeErrorCode.INVALID_ROUTE_CONFIG */, `Invalid configuration of route '${fullPath}': a componentless route without children or loadChildren cannot have a named outlet set`);
        }
        if (route.redirectTo && route.children) {
            throw new RuntimeError(4014 /* RuntimeErrorCode.INVALID_ROUTE_CONFIG */, `Invalid configuration of route '${fullPath}': redirectTo and children cannot be used together`);
        }
        if (route.redirectTo && route.loadChildren) {
            throw new RuntimeError(4014 /* RuntimeErrorCode.INVALID_ROUTE_CONFIG */, `Invalid configuration of route '${fullPath}': redirectTo and loadChildren cannot be used together`);
        }
        if (route.children && route.loadChildren) {
            throw new RuntimeError(4014 /* RuntimeErrorCode.INVALID_ROUTE_CONFIG */, `Invalid configuration of route '${fullPath}': children and loadChildren cannot be used together`);
        }
        if (route.redirectTo && (route.component || route.loadComponent)) {
            throw new RuntimeError(4014 /* RuntimeErrorCode.INVALID_ROUTE_CONFIG */, `Invalid configuration of route '${fullPath}': redirectTo and component/loadComponent cannot be used together`);
        }
        if (route.component && route.loadComponent) {
            throw new RuntimeError(4014 /* RuntimeErrorCode.INVALID_ROUTE_CONFIG */, `Invalid configuration of route '${fullPath}': component and loadComponent cannot be used together`);
        }
        if (route.redirectTo && route.canActivate) {
            throw new RuntimeError(4014 /* RuntimeErrorCode.INVALID_ROUTE_CONFIG */, `Invalid configuration of route '${fullPath}': redirectTo and canActivate cannot be used together. Redirects happen before activation ` +
                `so canActivate will never be executed.`);
        }
        if (route.path && route.matcher) {
            throw new RuntimeError(4014 /* RuntimeErrorCode.INVALID_ROUTE_CONFIG */, `Invalid configuration of route '${fullPath}': path and matcher cannot be used together`);
        }
        if (route.redirectTo === void 0 &&
            !route.component &&
            !route.loadComponent &&
            !route.children &&
            !route.loadChildren) {
            throw new RuntimeError(4014 /* RuntimeErrorCode.INVALID_ROUTE_CONFIG */, `Invalid configuration of route '${fullPath}'. One of the following must be provided: component, loadComponent, redirectTo, children or loadChildren`);
        }
        if (route.path === void 0 && route.matcher === void 0) {
            throw new RuntimeError(4014 /* RuntimeErrorCode.INVALID_ROUTE_CONFIG */, `Invalid configuration of route '${fullPath}': routes must have either a path or a matcher specified`);
        }
        if (typeof route.path === 'string' && route.path.charAt(0) === '/') {
            throw new RuntimeError(4014 /* RuntimeErrorCode.INVALID_ROUTE_CONFIG */, `Invalid configuration of route '${fullPath}': path cannot start with a slash`);
        }
        if (route.path === '' && route.redirectTo !== void 0 && route.pathMatch === void 0) {
            const exp = `The default value of 'pathMatch' is 'prefix', but often the intent is to use 'full'.`;
            throw new RuntimeError(4014 /* RuntimeErrorCode.INVALID_ROUTE_CONFIG */, `Invalid configuration of route '{path: "${fullPath}", redirectTo: "${route.redirectTo}"}': please provide 'pathMatch'. ${exp}`);
        }
        if (requireStandaloneComponents) {
            assertStandalone(fullPath, route.component);
        }
    }
    if (route.children) {
        validateConfig(route.children, fullPath, requireStandaloneComponents);
    }
}
function getFullPath(parentPath, currentRoute) {
    if (!currentRoute) {
        return parentPath;
    }
    if (!parentPath && !currentRoute.path) {
        return '';
    }
    else if (parentPath && !currentRoute.path) {
        return `${parentPath}/`;
    }
    else if (!parentPath && currentRoute.path) {
        return currentRoute.path;
    }
    else {
        return `${parentPath}/${currentRoute.path}`;
    }
}
/** Returns the `route.outlet` or PRIMARY_OUTLET if none exists. */
export function getOutlet(route) {
    return route.outlet || PRIMARY_OUTLET;
}
/**
 * Sorts the `routes` such that the ones with an outlet matching `outletName` come first.
 * The order of the configs is otherwise preserved.
 */
export function sortByMatchingOutlets(routes, outletName) {
    const sortedConfig = routes.filter((r) => getOutlet(r) === outletName);
    sortedConfig.push(...routes.filter((r) => getOutlet(r) !== outletName));
    return sortedConfig;
}
/**
 * Gets the first injector in the snapshot's parent tree.
 *
 * If the `Route` has a static list of providers, the returned injector will be the one created from
 * those. If it does not exist, the returned injector may come from the parents, which may be from a
 * loaded config or their static providers.
 *
 * Returns `null` if there is neither this nor any parents have a stored injector.
 *
 * Generally used for retrieving the injector to use for getting tokens for guards/resolvers and
 * also used for getting the correct injector to use for creating components.
 */
export function getClosestRouteInjector(snapshot) {
    if (!snapshot)
        return null;
    // If the current route has its own injector, which is created from the static providers on the
    // route itself, we should use that. Otherwise, we start at the parent since we do not want to
    // include the lazy loaded injector from this route.
    if (snapshot.routeConfig?._injector) {
        return snapshot.routeConfig._injector;
    }
    for (let s = snapshot.parent; s; s = s.parent) {
        const route = s.routeConfig;
        // Note that the order here is important. `_loadedInjector` stored on the route with
        // `loadChildren: () => NgModule` so it applies to child routes with priority. The `_injector`
        // is created from the static providers on that parent route, so it applies to the children as
        // well, but only if there is no lazy loaded NgModuleRef injector.
        if (route?._loadedInjector)
            return route._loadedInjector;
        if (route?._injector)
            return route._injector;
    }
    return null;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvcm91dGVyL3NyYy91dGlscy9jb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUNMLHlCQUF5QixFQUV6QixZQUFZLEVBRVosV0FBVyxJQUFJLFVBQVUsRUFDekIsYUFBYSxJQUFJLFlBQVksR0FDOUIsTUFBTSxlQUFlLENBQUM7QUFLdkIsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLFdBQVcsQ0FBQztBQUV6Qzs7Ozs7OztHQU9HO0FBQ0gsTUFBTSxVQUFVLGdDQUFnQyxDQUM5QyxLQUFZLEVBQ1osZUFBb0M7SUFFcEMsSUFBSSxLQUFLLENBQUMsU0FBUyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ3hDLEtBQUssQ0FBQyxTQUFTLEdBQUcseUJBQXlCLENBQ3pDLEtBQUssQ0FBQyxTQUFTLEVBQ2YsZUFBZSxFQUNmLFVBQVUsS0FBSyxDQUFDLElBQUksRUFBRSxDQUN2QixDQUFDO0lBQ0osQ0FBQztJQUNELE9BQU8sS0FBSyxDQUFDLFNBQVMsSUFBSSxlQUFlLENBQUM7QUFDNUMsQ0FBQztBQUVELE1BQU0sVUFBVSxlQUFlLENBQUMsS0FBWTtJQUMxQyxPQUFPLEtBQUssQ0FBQyxhQUFhLENBQUM7QUFDN0IsQ0FBQztBQUVELE1BQU0sVUFBVSxpQkFBaUIsQ0FBQyxLQUFZO0lBQzVDLE9BQU8sS0FBSyxDQUFDLGVBQWUsQ0FBQztBQUMvQixDQUFDO0FBQ0QsTUFBTSxVQUFVLGtCQUFrQixDQUFDLEtBQVk7SUFDN0MsT0FBTyxLQUFLLENBQUMsZ0JBQWdCLENBQUM7QUFDaEMsQ0FBQztBQUVELE1BQU0sVUFBVSxvQkFBb0IsQ0FBQyxLQUFZO0lBQy9DLE9BQU8sS0FBSyxDQUFDLFNBQVMsQ0FBQztBQUN6QixDQUFDO0FBRUQsTUFBTSxVQUFVLGNBQWMsQ0FD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LEtBQUssQ0FBQyxTQUFTLENBQUM7SUFDL0MsQ0FBQztJQUVELE9BQU8sSUFBSSxDQUFDO0FBQ2QsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtcbiAgY3JlYXRlRW52aXJvbm1lbnRJbmplY3RvcixcbiAgRW52aXJvbm1lbnRJbmplY3RvcixcbiAgaXNTdGFuZGFsb25lLFxuICBUeXBlLFxuICDJtWlzTmdNb2R1bGUgYXMgaXNOZ01vZHVsZSxcbiAgybVSdW50aW1lRXJyb3IgYXMgUnVudGltZUVycm9yLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtSdW50aW1lRXJyb3JDb2RlfSBmcm9tICcuLi9lcnJvcnMnO1xuaW1wb3J0IHtSb3V0ZSwgUm91dGVzfSBmcm9tICcuLi9tb2RlbHMnO1xuaW1wb3J0IHtBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90fSBmcm9tICcuLi9yb3V0ZXJfc3RhdGUnO1xuaW1wb3J0IHtQUklNQVJZX09VVExFVH0gZnJvbSAnLi4vc2hhcmVkJztcblxuLyoqXG4gKiBDcmVhdGVzIGFuIGBFbnZpcm9ubWVudEluamVjdG9yYCBpZiB0aGUgYFJvdXRlYCBoYXMgcHJvdmlkZXJzIGFuZCBvbmUgZG9lcyBub3QgYWxyZWFkeSBleGlzdFxuICogYW5kIHJldHVybnMgdGhlIGluamVjdG9yLiBPdGhlcndpc2UsIGlmIHRoZSBgUm91dGVgIGRvZXMgbm90IGhhdmUgYHByb3ZpZGVyc2AsIHJldHVybnMgdGhlXG4gKiBgY3VycmVudEluamVjdG9yYC5cbiAqXG4gKiBAcGFyYW0gcm91dGUgVGhlIHJvdXRlIHRoYXQgbWlnaHQgaGF2ZSBwcm92aWRlcnNcbiAqIEBwYXJhbSBjdXJyZW50SW5qZWN0b3IgVGhlIHBhcmVudCBpbmplY3RvciBvZiB0aGUgYFJvdXRlYFxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0T3JDcmVhdGVSb3V0ZUluamVjdG9ySWZOZWVkZWQoXG4gIHJvdXRlOiBSb3V0ZSxcbiAgY3VycmVudEluamVjdG9yOiBFbnZpcm9ubWVudEluamVjdG9yLFxuKSB7XG4gIGlmIChyb3V0ZS5wcm92aWRlcnMgJiYgIXJvdXRlLl9pbmplY3Rvcikge1xuICAgIHJvdXRlLl9pbmplY3RvciA9IGNyZWF0ZUVudmlyb25tZW50SW5qZWN0b3IoXG4gICAgICByb3V0ZS5wcm92aWRlcnMsXG4gICAgICBjdXJyZW50SW5qZWN0b3IsXG4gICAgICBgUm91dGU6ICR7cm91dGUucGF0aH1gLFxuICAgICk7XG4gIH1cbiAgcmV0dXJuIHJvdXRlLl9pbmplY3RvciA/PyBjdXJyZW50SW5qZWN0b3I7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRMb2FkZWRSb3V0ZXMocm91dGU6IFJvdXRlKTogUm91dGVbXSB8IHVuZGVmaW5lZCB7XG4gIHJldHVybiByb3V0ZS5fbG9hZGVkUm91dGVzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0TG9hZGVkSW5qZWN0b3Iocm91dGU6IFJvdXRlKTogRW52aXJvbm1lbnRJbmplY3RvciB8IHVuZGVmaW5lZCB7XG4gIHJldHVybiByb3V0ZS5fbG9hZGVkSW5qZWN0b3I7XG59XG5leHBvcnQgZnVuY3Rpb24gZ2V0TG9hZGVkQ29tcG9uZW50KHJvdXRlOiBSb3V0ZSk6IFR5cGU8dW5rbm93bj4gfCB1bmRlZmluZWQge1xuICByZXR1cm4gcm91dGUuX2xvYWRlZENvbXBvbmVudDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFByb3ZpZGVyc0luamVjdG9yKHJvdXRlOiBSb3V0ZSk6IEVudmlyb25tZW50SW5qZWN0b3IgfCB1bmRlZmluZWQge1xuICByZXR1cm4gcm91dGUuX2luamVjdG9yO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVDb25maWcoXG4gIGNvbmZpZzogUm91dGVzLFxuICBwYXJlbnRQYXRoOiBzdHJpbmcgPSAnJyxcbiAgcmVxdWlyZVN0YW5kYWxvbmVDb21wb25lbnRzID0gZmFsc2UsXG4pOiB2b2lkIHtcbiAgLy8gZm9yRWFjaCBkb2Vzbid0IGl0ZXJhdGUgdW5kZWZpbmVkIHZhbHVlc1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGNvbmZpZy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IHJvdXRlOiBSb3V0ZSA9IGNvbmZpZ1tpXTtcbiAgICBjb25zdCBmdWxsUGF0aDogc3RyaW5nID0gZ2V0RnVsbFBhdGgocGFyZW50UGF0aCwgcm91dGUpO1xuICAgIHZhbGlkYXRlTm9kZShyb3V0ZSwgZnVsbFBhdGgsIHJlcXVpcmVTdGFuZGFsb25lQ29tcG9uZW50cyk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydFN0YW5kYWxvbmUoZnVsbFBhdGg6IHN0cmluZywgY29tcG9uZW50OiBUeXBlPHVua25vd24+IHwgdW5kZWZpbmVkKSB7XG4gIGlmIChjb21wb25lbnQgJiYgaXNOZ01vZHVsZShjb21wb25lbnQpKSB7XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9ST1VURV9DT05GSUcsXG4gICAgICBgSW52YWxpZCBjb25maWd1cmF0aW9uIG9mIHJvdXRlICcke2Z1bGxQYXRofScuIFlvdSBhcmUgdXNpbmcgJ2xvYWRDb21wb25lbnQnIHdpdGggYSBtb2R1bGUsIGAgK1xuICAgICAgICBgYnV0IGl0IG11c3QgYmUgdXNlZCB3aXRoIHN0YW5kYWxvbmUgY29tcG9uZW50cy4gVXNlICdsb2FkQ2hpbGRyZW4nIGluc3RlYWQuYCxcbiAgICApO1xuICB9IGVsc2UgaWYgKGNvbXBvbmVudCAmJiAhaXNTdGFuZGFsb25lKGNvbXBvbmVudCkpIHtcbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX1JPVVRFX0NPTkZJRyxcbiAgICAgIGBJbnZhbGlkIGNvbmZpZ3VyYXRpb24gb2Ygcm91dGUgJyR7ZnVsbFBhdGh9Jy4gVGhlIGNvbXBvbmVudCBtdXN0IGJlIHN0YW5kYWxvbmUuYCxcbiAgICApO1xuICB9XG59XG5cbmZ1bmN0aW9uIHZhbGlkYXRlTm9kZShyb3V0ZTogUm91dGUsIGZ1bGxQYXRoOiBzdHJpbmcsIHJlcXVpcmVTdGFuZGFsb25lQ29tcG9uZW50czogYm9vbGVhbik6IHZvaWQge1xuICBpZiAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSB7XG4gICAgaWYgKCFyb3V0ZSkge1xuICAgICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX1JPVVRFX0NPTkZJRyxcbiAgICAgICAgYFxuICAgICAgSW52YWxpZCBjb25maWd1cmF0aW9uIG9mIHJvdXRlICcke2Z1bGxQYXRofSc6IEVuY291bnRlcmVkIHVuZGVmaW5lZCByb3V0ZS5cbiAgICAgIFRoZSByZWFzb24gbWlnaHQgYmUgYW4gZXh0cmEgY29tbWEuXG5cbiAgICAgIEV4YW1wbGU6XG4gICAgICBjb25zdCByb3V0ZXM6IFJvdXRlcyA9IFtcbiAgICAgICAgeyBwYXRoOiAnJywgcmVkaXJlY3RUbzogJy9kYXNoYm9hcmQnLCBwYXRoTWF0Y2g6ICdmdWxsJyB9LFxuICAgICAgICB7IHBhdGg6ICdkYXNoYm9hcmQnLCAgY29tcG9uZW50OiBEYXNoYm9hcmRDb21wb25lbnQgfSwsIDw8IHR3byBjb21tYXNcbiAgICAgICAgeyBwYXRoOiAnZGV0YWlsLzppZCcsIGNvbXBvbmVudDogSGVyb0RldGFpbENvbXBvbmVudCB9XG4gICAgICBdO1xuICAgIGAsXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAoQXJyYXkuaXNBcnJheShyb3V0ZSkpIHtcbiAgICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9ST1VURV9DT05GSUcsXG4gICAgICAgIGBJbnZhbGlkIGNvbmZpZ3VyYXRpb24gb2Ygcm91dGUgJyR7ZnVsbFBhdGh9JzogQXJyYXkgY2Fubm90IGJlIHNwZWNpZmllZGAsXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAoXG4gICAgICAhcm91dGUucmVkaXJlY3RUbyAmJlxuICAgICAgIXJvdXRlLmNvbXBvbmVudCAmJlxuICAgICAgIXJvdXRlLmxvYWRDb21wb25lbnQgJiZcbiAgICAgICFyb3V0ZS5jaGlsZHJlbiAmJlxuICAgICAgIXJvdXRlLmxvYWRDaGlsZHJlbiAmJlxuICAgICAgcm91dGUub3V0bGV0ICYmXG4gICAgICByb3V0ZS5vdXRsZXQgIT09IFBSSU1BUllfT1VUTEVUXG4gICAgKSB7XG4gICAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfUk9VVEVfQ09ORklHLFxuICAgICAgICBgSW52YWxpZCBjb25maWd1cmF0aW9uIG9mIHJvdXRlICcke2Z1bGxQYXRofSc6IGEgY29tcG9uZW50bGVzcyByb3V0ZSB3aXRob3V0IGNoaWxkcmVuIG9yIGxvYWRDaGlsZHJlbiBjYW5ub3QgaGF2ZSBhIG5hbWVkIG91dGxldCBzZXRgLFxuICAgICAgKTtcbiAgICB9XG4gICAgaWYgKHJvdXRlLnJlZGlyZWN0VG8gJiYgcm91dGUuY2hpbGRyZW4pIHtcbiAgICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9ST1VURV9DT05GSUcsXG4gICAgICAgIGBJbnZhbGlkIGNvbmZpZ3VyYXRpb24gb2Ygcm91dGUgJyR7ZnVsbFBhdGh9JzogcmVkaXJlY3RUbyBhbmQgY2hpbGRyZW4gY2Fubm90IGJlIHVzZWQgdG9nZXRoZXJgLFxuICAgICAgKTtcbiAgICB9XG4gICAgaWYgKHJvdXRlLnJlZGlyZWN0VG8gJiYgcm91dGUubG9hZENoaWxkcmVuKSB7XG4gICAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfUk9VVEVfQ09ORklHLFxuICAgICAgICBgSW52YWxpZCBjb25maWd1cmF0aW9uIG9mIHJvdXRlICcke2Z1bGxQYXRofSc6IHJlZGlyZWN0VG8gYW5kIGxvYWRDaGlsZHJlbiBjYW5ub3QgYmUgdXNlZCB0b2dldGhlcmAsXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAocm91dGUuY2hpbGRyZW4gJiYgcm91dGUubG9hZENoaWxkcmVuKSB7XG4gICAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfUk9VVEVfQ09ORklHLFxuICAgICAgICBgSW52YWxpZCBjb25maWd1cmF0aW9uIG9mIHJvdXRlICcke2Z1bGxQYXRofSc6IGNoaWxkcmVuIGFuZCBsb2FkQ2hpbGRyZW4gY2Fubm90IGJlIHVzZWQgdG9nZXRoZXJgLFxuICAgICAgKTtcbiAgICB9XG4gICAgaWYgKHJvdXRlLnJlZGlyZWN0VG8gJiYgKHJvdXRlLmNvbXBvbmVudCB8fCByb3V0ZS5sb2FkQ29tcG9uZW50KSkge1xuICAgICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX1JPVVRFX0NPTkZJRyxcbiAgICAgICAgYEludmFsaWQgY29uZmlndXJhdGlvbiBvZiByb3V0ZSAnJHtmdWxsUGF0aH0nOiByZWRpcmVjdFRvIGFuZCBjb21wb25lbnQvbG9hZENvbXBvbmVudCBjYW5ub3QgYmUgdXNlZCB0b2dldGhlcmAsXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAocm91dGUuY29tcG9uZW50ICYmIHJvdXRlLmxvYWRDb21wb25lbnQpIHtcbiAgICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9ST1VURV9DT05GSUcsXG4gICAgICAgIGBJbnZhbGlkIGNvbmZpZ3VyYXRpb24gb2Ygcm91dGUgJyR7ZnVsbFBhdGh9JzogY29tcG9uZW50IGFuZCBsb2FkQ29tcG9uZW50IGNhbm5vdCBiZSB1c2VkIHRvZ2V0aGVyYCxcbiAgICAgICk7XG4gICAgfVxuICAgIGlmIChyb3V0ZS5yZWRpcmVjdFRvICYmIHJvdXRlLmNhbkFjdGl2YXRlKSB7XG4gICAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfUk9VVEVfQ09ORklHLFxuICAgICAgICBgSW52YWxpZCBjb25maWd1cmF0aW9uIG9mIHJvdXRlICcke2Z1bGxQYXRofSc6IHJlZGlyZWN0VG8gYW5kIGNhbkFjdGl2YXRlIGNhbm5vdCBiZSB1c2VkIHRvZ2V0aGVyLiBSZWRpcmVjdHMgaGFwcGVuIGJlZm9yZSBhY3RpdmF0aW9uIGAgK1xuICAgICAgICAgIGBzbyBjYW5BY3RpdmF0ZSB3aWxsIG5ldmVyIGJlIGV4ZWN1dGVkLmAsXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAocm91dGUucGF0aCAmJiByb3V0ZS5tYXRjaGVyKSB7XG4gICAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfUk9VVEVfQ09ORklHLFxuICAgICAgICBgSW52YWxpZCBjb25maWd1cmF0aW9uIG9mIHJvdXRlICcke2Z1bGxQYXRofSc6IHBhdGggYW5kIG1hdGNoZXIgY2Fubm90IGJlIHVzZWQgdG9nZXRoZXJgLFxuICAgICAgKTtcbiAgICB9XG4gICAgaWYgKFxuICAgICAgcm91dGUucmVkaXJlY3RUbyA9PT0gdm9pZCAwICYmXG4gICAgICAhcm91dGUuY29tcG9uZW50ICYmXG4gICAgICAhcm91dGUubG9hZENvbXBvbmVudCAmJlxuICAgICAgIXJvdXRlLmNoaWxkcmVuICYmXG4gICAgICAhcm91dGUubG9hZENoaWxkcmVuXG4gICAgKSB7XG4gICAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfUk9VVEVfQ09ORklHLFxuICAgICAgICBgSW52YWxpZCBjb25maWd1cmF0aW9uIG9mIHJvdXRlICcke2Z1bGxQYXRofScuIE9uZSBvZiB0aGUgZm9sbG93aW5nIG11c3QgYmUgcHJvdmlkZWQ6IGNvbXBvbmVudCwgbG9hZENvbXBvbmVudCwgcmVkaXJlY3RUbywgY2hpbGRyZW4gb3IgbG9hZENoaWxkcmVuYCxcbiAgICAgICk7XG4gICAgfVxuICAgIGlmIChyb3V0ZS5wYXRoID09PSB2b2lkIDAgJiYgcm91dGUubWF0Y2hlciA9PT0gdm9pZCAwKSB7XG4gICAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfUk9VVEVfQ09ORklHLFxuICAgICAgICBgSW52YWxpZCBjb25maWd1cmF0aW9uIG9mIHJvdXRlICcke2Z1bGxQYXRofSc6IHJvdXRlcyBtdXN0IGhhdmUgZWl0aGVyIGEgcGF0aCBvciBhIG1hdGNoZXIgc3BlY2lmaWVkYCxcbiAgICAgICk7XG4gICAgfVxuICAgIGlmICh0eXBlb2Ygcm91dGUucGF0aCA9PT0gJ3N0cmluZycgJiYgcm91dGUucGF0aC5jaGFyQXQoMCkgPT09ICcvJykge1xuICAgICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX1JPVVRFX0NPTkZJRyxcbiAgICAgICAgYEludmFsaWQgY29uZmlndXJhdGlvbiBvZiByb3V0ZSAnJHtmdWxsUGF0aH0nOiBwYXRoIGNhbm5vdCBzdGFydCB3aXRoIGEgc2xhc2hgLFxuICAgICAgKTtcbiAgICB9XG4gICAgaWYgKHJvdXRlLnBhdGggPT09ICcnICYmIHJvdXRlLnJlZGlyZWN0VG8gIT09IHZvaWQgMCAmJiByb3V0ZS5wYXRoTWF0Y2ggPT09IHZvaWQgMCkge1xuICAgICAgY29uc3QgZXhwID0gYFRoZSBkZWZhdWx0IHZhbHVlIG9mICdwYXRoTWF0Y2gnIGlzICdwcmVmaXgnLCBidXQgb2Z0ZW4gdGhlIGludGVudCBpcyB0byB1c2UgJ2Z1bGwnLmA7XG4gICAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfUk9VVEVfQ09ORklHLFxuICAgICAgICBgSW52YWxpZCBjb25maWd1cmF0aW9uIG9mIHJvdXRlICd7cGF0aDogXCIke2Z1bGxQYXRofVwiLCByZWRpcmVjdFRvOiBcIiR7cm91dGUucmVkaXJlY3RUb31cIn0nOiBwbGVhc2UgcHJvdmlkZSAncGF0aE1hdGNoJy4gJHtleHB9YCxcbiAgICAgICk7XG4gICAgfVxuICAgIGlmIChyZXF1aXJlU3RhbmRhbG9uZUNvbXBvbmVudHMpIHtcbiAgICAgIGFzc2VydFN0YW5kYWxvbmUoZnVsbFBhdGgsIHJvdXRlLmNvbXBvbmVudCk7XG4gICAgfVxuICB9XG4gIGlmIChyb3V0ZS5jaGlsZHJlbikge1xuICAgIHZhbGlkYXRlQ29uZmlnKHJvdXRlLmNoaWxkcmVuLCBmdWxsUGF0aCwgcmVxdWlyZVN0YW5kYWxvbmVDb21wb25lbnRzKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRGdWxsUGF0aChwYXJlbnRQYXRoOiBzdHJpbmcsIGN1cnJlbnRSb3V0ZTogUm91dGUpOiBzdHJpbmcge1xuICBpZiAoIWN1cnJlbnRSb3V0ZSkge1xuICAgIHJldHVybiBwYXJlbnRQYXRoO1xuICB9XG4gIGlmICghcGFyZW50UGF0aCAmJiAhY3VycmVudFJvdXRlLnBhdGgpIHtcbiAgICByZXR1cm4gJyc7XG4gIH0gZWxzZSBpZiAocGFyZW50UGF0aCAmJiAhY3VycmVudFJvdXRlLnBhdGgpIHtcbiAgICByZXR1cm4gYCR7cGFyZW50UGF0aH0vYDtcbiAgfSBlbHNlIGlmICghcGFyZW50UGF0aCAmJiBjdXJyZW50Um91dGUucGF0aCkge1xuICAgIHJldHVybiBjdXJyZW50Um91dGUucGF0aDtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gYCR7cGFyZW50UGF0aH0vJHtjdXJyZW50Um91dGUucGF0aH1gO1xuICB9XG59XG5cbi8qKiBSZXR1cm5zIHRoZSBgcm91dGUub3V0bGV0YCBvciBQUklNQVJZX09VVExFVCBpZiBub25lIGV4aXN0cy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRPdXRsZXQocm91dGU6IFJvdXRlKTogc3RyaW5nIHtcbiAgcmV0dXJuIHJvdXRlLm91dGxldCB8fCBQUklNQVJZX09VVExFVDtcbn1cblxuLyoqXG4gKiBTb3J0cyB0aGUgYHJvdXRlc2Agc3VjaCB0aGF0IHRoZSBvbmVzIHdpdGggYW4gb3V0bGV0IG1hdGNoaW5nIGBvdXRsZXROYW1lYCBjb21lIGZpcnN0LlxuICogVGhlIG9yZGVyIG9mIHRoZSBjb25maWdzIGlzIG90aGVyd2lzZSBwcmVzZXJ2ZWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzb3J0QnlNYXRjaGluZ091dGxldHMocm91dGVzOiBSb3V0ZXMsIG91dGxldE5hbWU6IHN0cmluZyk6IFJvdXRlcyB7XG4gIGNvbnN0IHNvcnRlZENvbmZpZyA9IHJvdXRlcy5maWx0ZXIoKHIpID0+IGdldE91dGxldChyKSA9PT0gb3V0bGV0TmFtZSk7XG4gIHNvcnRlZENvbmZpZy5wdXNoKC4uLnJvdXRlcy5maWx0ZXIoKHIpID0+IGdldE91dGxldChyKSAhPT0gb3V0bGV0TmFtZSkpO1xuICByZXR1cm4gc29ydGVkQ29uZmlnO1xufVxuXG4vKipcbiAqIEdldHMgdGhlIGZpcnN0IGluamVjdG9yIGluIHRoZSBzbmFwc2hvdCdzIHBhcmVudCB0cmVlLlxuICpcbiAqIElmIHRoZSBgUm91dGVgIGhhcyBhIHN0YXRpYyBsaXN0IG9mIHByb3ZpZGVycywgdGhlIHJldHVybmVkIGluamVjdG9yIHdpbGwgYmUgdGhlIG9uZSBjcmVhdGVkIGZyb21cbiAqIHRob3NlLiBJZiBpdCBkb2VzIG5vdCBleGlzdCwgdGhlIHJldHVybmVkIGluamVjdG9yIG1heSBjb21lIGZyb20gdGhlIHBhcmVudHMsIHdoaWNoIG1heSBiZSBmcm9tIGFcbiAqIGxvYWRlZCBjb25maWcgb3IgdGhlaXIgc3RhdGljIHByb3ZpZGVycy5cbiAqXG4gKiBSZXR1cm5zIGBudWxsYCBpZiB0aGVyZSBpcyBuZWl0aGVyIHRoaXMgbm9yIGFueSBwYXJlbnRzIGhhdmUgYSBzdG9yZWQgaW5qZWN0b3IuXG4gKlxuICogR2VuZXJhbGx5IHVzZWQgZm9yIHJldHJpZXZpbmcgdGhlIGluamVjdG9yIHRvIHVzZSBmb3IgZ2V0dGluZyB0b2tlbnMgZm9yIGd1YXJkcy9yZXNvbHZlcnMgYW5kXG4gKiBhbHNvIHVzZWQgZm9yIGdldHRpbmcgdGhlIGNvcnJlY3QgaW5qZWN0b3IgdG8gdXNlIGZvciBjcmVhdGluZyBjb21wb25lbnRzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q2xvc2VzdFJvdXRlSW5qZWN0b3IoXG4gIHNuYXBzaG90OiBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90IHwgdW5kZWZpbmVkLFxuKTogRW52aXJvbm1lbnRJbmplY3RvciB8IG51bGwge1xuICBpZiAoIXNuYXBzaG90KSByZXR1cm4gbnVsbDtcblxuICAvLyBJZiB0aGUgY3VycmVudCByb3V0ZSBoYXMgaXRzIG93biBpbmplY3Rvciwgd2hpY2ggaXMgY3JlYXRlZCBmcm9tIHRoZSBzdGF0aWMgcHJvdmlkZXJzIG9uIHRoZVxuICAvLyByb3V0ZSBpdHNlbGYsIHdlIHNob3VsZCB1c2UgdGhhdC4gT3RoZXJ3aXNlLCB3ZSBzdGFydCBhdCB0aGUgcGFyZW50IHNpbmNlIHdlIGRvIG5vdCB3YW50IHRvXG4gIC8vIGluY2x1ZGUgdGhlIGxhenkgbG9hZGVkIGluamVjdG9yIGZyb20gdGhpcyByb3V0ZS5cbiAgaWYgKHNuYXBzaG90LnJvdXRlQ29uZmlnPy5faW5qZWN0b3IpIHtcbiAgICByZXR1cm4gc25hcHNob3Qucm91dGVDb25maWcuX2luamVjdG9yO1xuICB9XG5cbiAgZm9yIChsZXQgcyA9IHNuYXBzaG90LnBhcmVudDsgczsgcyA9IHMucGFyZW50KSB7XG4gICAgY29uc3Qgcm91dGUgPSBzLnJvdXRlQ29uZmlnO1xuICAgIC8vIE5vdGUgdGhhdCB0aGUgb3JkZXIgaGVyZSBpcyBpbXBvcnRhbnQuIGBfbG9hZGVkSW5qZWN0b3JgIHN0b3JlZCBvbiB0aGUgcm91dGUgd2l0aFxuICAgIC8vIGBsb2FkQ2hpbGRyZW46ICgpID0+IE5nTW9kdWxlYCBzbyBpdCBhcHBsaWVzIHRvIGNoaWxkIHJvdXRlcyB3aXRoIHByaW9yaXR5LiBUaGUgYF9pbmplY3RvcmBcbiAgICAvLyBpcyBjcmVhdGVkIGZyb20gdGhlIHN0YXRpYyBwcm92aWRlcnMgb24gdGhhdCBwYXJlbnQgcm91dGUsIHNvIGl0IGFwcGxpZXMgdG8gdGhlIGNoaWxkcmVuIGFzXG4gICAgLy8gd2VsbCwgYnV0IG9ubHkgaWYgdGhlcmUgaXMgbm8gbGF6eSBsb2FkZWQgTmdNb2R1bGVSZWYgaW5qZWN0b3IuXG4gICAgaWYgKHJvdXRlPy5fbG9hZGVkSW5qZWN0b3IpIHJldHVybiByb3V0ZS5fbG9hZGVkSW5qZWN0b3I7XG4gICAgaWYgKHJvdXRlPy5faW5qZWN0b3IpIHJldHVybiByb3V0ZS5faW5qZWN0b3I7XG4gIH1cblxuICByZXR1cm4gbnVsbDtcbn1cbiJdfQ==