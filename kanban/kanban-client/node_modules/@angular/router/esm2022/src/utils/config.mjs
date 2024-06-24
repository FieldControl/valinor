/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { createEnvironmentInjector, isStandalone, ɵisNgModule as isNgModule, ɵRuntimeError as RuntimeError, } from '@angular/core';
import { EmptyOutletComponent } from '../components/empty_outlet';
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
/**
 * Makes a copy of the config and adds any default required properties.
 */
export function standardizeConfig(r) {
    const children = r.children && r.children.map(standardizeConfig);
    const c = children ? { ...r, children } : { ...r };
    if (!c.component &&
        !c.loadComponent &&
        (children || c.loadChildren) &&
        c.outlet &&
        c.outlet !== PRIMARY_OUTLET) {
        c.component = EmptyOutletComponent;
    }
    return c;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvcm91dGVyL3NyYy91dGlscy9jb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUNMLHlCQUF5QixFQUV6QixZQUFZLEVBRVosV0FBVyxJQUFJLFVBQVUsRUFDekIsYUFBYSxJQUFJLFlBQVksR0FDOUIsTUFBTSxlQUFlLENBQUM7QUFFdkIsT0FBTyxFQUFDLG9CQUFvQixFQUFDLE1BQU0sNEJBQTRCLENBQUM7QUFJaEUsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLFdBQVcsQ0FBQztBQUV6Qzs7Ozs7OztHQU9HO0FBQ0gsTUFBTSxVQUFVLGdDQUFnQyxDQUM5QyxLQUFZLEVBQ1osZUFBb0M7SUFFcEMsSUFBSSxLQUFLLENBQUMsU0FBUyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ3hDLEtBQUssQ0FBQyxTQUFTLEdBQUcseUJBQXlCLENBQ3pDLEtBQUssQ0FBQyxTQUFTLEVBQ2YsZUFBZSxFQUNmLFVBQVUsS0FBSyxDQUFDLElBQUksRUFBRSxDQUN2QixDQUFDO0lBQ0osQ0FBQztJQUNELE9BQU8sS0FBSyxDQUFDLFNBQVMsSUFBSSxlQUFlLENBQUM7QUFDNUMsQ0FBQztBQUVELE1BQU0sVUFBVSxlQUFlLENBQUMsS0FBWTtJQUMxQyxPQUFPLEtBQUssQ0FBQyxhQUFhLENBQUM7QUFDN0IsQ0FBQztBQUVELE1BQU0sVUFBVSxpQkFBaUIsQ0FBQyxLQUFZO0lBQzVDLE9BQU8sS0FBSyxDQUFDLGVBQWUsQ0FBQztBQUMvQixDQUFDO0FBQ0QsTUFBTSxVQUFVLGtCQUFrQixDQUFDLEtBQVk7SUFDN0MsT0FBTyxLQUFLLENBQUMsZ0JBQWdCLENBQUM7QUFDaEMsQ0FBQztBQUVELE1BQU0sVUFBVSxvQkFBb0IsQ0FBQyxLQUFZO0lBQy9DLE9BQU8sS0FBSyxDQUFD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WSxDQUFDO0FBQ3RCLENBQUM7QUFFRDs7Ozs7Ozs7Ozs7R0FXRztBQUNILE1BQU0sVUFBVSx1QkFBdUIsQ0FDckMsUUFBZ0M7SUFFaEMsSUFBSSxDQUFDLFFBQVE7UUFBRSxPQUFPLElBQUksQ0FBQztJQUUzQiwrRkFBK0Y7SUFDL0YsOEZBQThGO0lBQzlGLG9EQUFvRDtJQUNwRCxJQUFJLFFBQVEsQ0FBQyxXQUFXLEVBQUUsU0FBUyxFQUFFLENBQUM7UUFDcEMsT0FBTyxRQUFRLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQztJQUN4QyxDQUFDO0lBRUQsS0FBSyxJQUFJLENBQUMsR0FBRyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQzlDLE1BQU0sS0FBSyxHQUFHLENBQUMsQ0FBQyxXQUFXLENBQUM7UUFDNUIsb0ZBQW9GO1FBQ3BGLDhGQUE4RjtRQUM5Riw4RkFBOEY7UUFDOUYsa0VBQWtFO1FBQ2xFLElBQUksS0FBSyxFQUFFLGVBQWU7WUFBRSxPQUFPLEtBQUssQ0FBQyxlQUFlLENBQUM7UUFDekQsSUFBSSxLQUFLLEVBQUUsU0FBUztZQUFFLE9BQU8sS0FBSyxDQUFDLFNBQVMsQ0FBQztJQUMvQyxDQUFDO0lBRUQsT0FBTyxJQUFJLENBQUM7QUFDZCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7XG4gIGNyZWF0ZUVudmlyb25tZW50SW5qZWN0b3IsXG4gIEVudmlyb25tZW50SW5qZWN0b3IsXG4gIGlzU3RhbmRhbG9uZSxcbiAgVHlwZSxcbiAgybVpc05nTW9kdWxlIGFzIGlzTmdNb2R1bGUsXG4gIMm1UnVudGltZUVycm9yIGFzIFJ1bnRpbWVFcnJvcixcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7RW1wdHlPdXRsZXRDb21wb25lbnR9IGZyb20gJy4uL2NvbXBvbmVudHMvZW1wdHlfb3V0bGV0JztcbmltcG9ydCB7UnVudGltZUVycm9yQ29kZX0gZnJvbSAnLi4vZXJyb3JzJztcbmltcG9ydCB7Um91dGUsIFJvdXRlc30gZnJvbSAnLi4vbW9kZWxzJztcbmltcG9ydCB7QWN0aXZhdGVkUm91dGVTbmFwc2hvdH0gZnJvbSAnLi4vcm91dGVyX3N0YXRlJztcbmltcG9ydCB7UFJJTUFSWV9PVVRMRVR9IGZyb20gJy4uL3NoYXJlZCc7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBgRW52aXJvbm1lbnRJbmplY3RvcmAgaWYgdGhlIGBSb3V0ZWAgaGFzIHByb3ZpZGVycyBhbmQgb25lIGRvZXMgbm90IGFscmVhZHkgZXhpc3RcbiAqIGFuZCByZXR1cm5zIHRoZSBpbmplY3Rvci4gT3RoZXJ3aXNlLCBpZiB0aGUgYFJvdXRlYCBkb2VzIG5vdCBoYXZlIGBwcm92aWRlcnNgLCByZXR1cm5zIHRoZVxuICogYGN1cnJlbnRJbmplY3RvcmAuXG4gKlxuICogQHBhcmFtIHJvdXRlIFRoZSByb3V0ZSB0aGF0IG1pZ2h0IGhhdmUgcHJvdmlkZXJzXG4gKiBAcGFyYW0gY3VycmVudEluamVjdG9yIFRoZSBwYXJlbnQgaW5qZWN0b3Igb2YgdGhlIGBSb3V0ZWBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldE9yQ3JlYXRlUm91dGVJbmplY3RvcklmTmVlZGVkKFxuICByb3V0ZTogUm91dGUsXG4gIGN1cnJlbnRJbmplY3RvcjogRW52aXJvbm1lbnRJbmplY3Rvcixcbikge1xuICBpZiAocm91dGUucHJvdmlkZXJzICYmICFyb3V0ZS5faW5qZWN0b3IpIHtcbiAgICByb3V0ZS5faW5qZWN0b3IgPSBjcmVhdGVFbnZpcm9ubWVudEluamVjdG9yKFxuICAgICAgcm91dGUucHJvdmlkZXJzLFxuICAgICAgY3VycmVudEluamVjdG9yLFxuICAgICAgYFJvdXRlOiAke3JvdXRlLnBhdGh9YCxcbiAgICApO1xuICB9XG4gIHJldHVybiByb3V0ZS5faW5qZWN0b3IgPz8gY3VycmVudEluamVjdG9yO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0TG9hZGVkUm91dGVzKHJvdXRlOiBSb3V0ZSk6IFJvdXRlW10gfCB1bmRlZmluZWQge1xuICByZXR1cm4gcm91dGUuX2xvYWRlZFJvdXRlcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldExvYWRlZEluamVjdG9yKHJvdXRlOiBSb3V0ZSk6IEVudmlyb25tZW50SW5qZWN0b3IgfCB1bmRlZmluZWQge1xuICByZXR1cm4gcm91dGUuX2xvYWRlZEluamVjdG9yO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGdldExvYWRlZENvbXBvbmVudChyb3V0ZTogUm91dGUpOiBUeXBlPHVua25vd24+IHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIHJvdXRlLl9sb2FkZWRDb21wb25lbnQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRQcm92aWRlcnNJbmplY3Rvcihyb3V0ZTogUm91dGUpOiBFbnZpcm9ubWVudEluamVjdG9yIHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIHJvdXRlLl9pbmplY3Rvcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlQ29uZmlnKFxuICBjb25maWc6IFJvdXRlcyxcbiAgcGFyZW50UGF0aDogc3RyaW5nID0gJycsXG4gIHJlcXVpcmVTdGFuZGFsb25lQ29tcG9uZW50cyA9IGZhbHNlLFxuKTogdm9pZCB7XG4gIC8vIGZvckVhY2ggZG9lc24ndCBpdGVyYXRlIHVuZGVmaW5lZCB2YWx1ZXNcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb25maWcubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCByb3V0ZTogUm91dGUgPSBjb25maWdbaV07XG4gICAgY29uc3QgZnVsbFBhdGg6IHN0cmluZyA9IGdldEZ1bGxQYXRoKHBhcmVudFBhdGgsIHJvdXRlKTtcbiAgICB2YWxpZGF0ZU5vZGUocm91dGUsIGZ1bGxQYXRoLCByZXF1aXJlU3RhbmRhbG9uZUNvbXBvbmVudHMpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnRTdGFuZGFsb25lKGZ1bGxQYXRoOiBzdHJpbmcsIGNvbXBvbmVudDogVHlwZTx1bmtub3duPiB8IHVuZGVmaW5lZCkge1xuICBpZiAoY29tcG9uZW50ICYmIGlzTmdNb2R1bGUoY29tcG9uZW50KSkge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfUk9VVEVfQ09ORklHLFxuICAgICAgYEludmFsaWQgY29uZmlndXJhdGlvbiBvZiByb3V0ZSAnJHtmdWxsUGF0aH0nLiBZb3UgYXJlIHVzaW5nICdsb2FkQ29tcG9uZW50JyB3aXRoIGEgbW9kdWxlLCBgICtcbiAgICAgICAgYGJ1dCBpdCBtdXN0IGJlIHVzZWQgd2l0aCBzdGFuZGFsb25lIGNvbXBvbmVudHMuIFVzZSAnbG9hZENoaWxkcmVuJyBpbnN0ZWFkLmAsXG4gICAgKTtcbiAgfSBlbHNlIGlmIChjb21wb25lbnQgJiYgIWlzU3RhbmRhbG9uZShjb21wb25lbnQpKSB7XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9ST1VURV9DT05GSUcsXG4gICAgICBgSW52YWxpZCBjb25maWd1cmF0aW9uIG9mIHJvdXRlICcke2Z1bGxQYXRofScuIFRoZSBjb21wb25lbnQgbXVzdCBiZSBzdGFuZGFsb25lLmAsXG4gICAgKTtcbiAgfVxufVxuXG5mdW5jdGlvbiB2YWxpZGF0ZU5vZGUocm91dGU6IFJvdXRlLCBmdWxsUGF0aDogc3RyaW5nLCByZXF1aXJlU3RhbmRhbG9uZUNvbXBvbmVudHM6IGJvb2xlYW4pOiB2b2lkIHtcbiAgaWYgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkge1xuICAgIGlmICghcm91dGUpIHtcbiAgICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9ST1VURV9DT05GSUcsXG4gICAgICAgIGBcbiAgICAgIEludmFsaWQgY29uZmlndXJhdGlvbiBvZiByb3V0ZSAnJHtmdWxsUGF0aH0nOiBFbmNvdW50ZXJlZCB1bmRlZmluZWQgcm91dGUuXG4gICAgICBUaGUgcmVhc29uIG1pZ2h0IGJlIGFuIGV4dHJhIGNvbW1hLlxuXG4gICAgICBFeGFtcGxlOlxuICAgICAgY29uc3Qgcm91dGVzOiBSb3V0ZXMgPSBbXG4gICAgICAgIHsgcGF0aDogJycsIHJlZGlyZWN0VG86ICcvZGFzaGJvYXJkJywgcGF0aE1hdGNoOiAnZnVsbCcgfSxcbiAgICAgICAgeyBwYXRoOiAnZGFzaGJvYXJkJywgIGNvbXBvbmVudDogRGFzaGJvYXJkQ29tcG9uZW50IH0sLCA8PCB0d28gY29tbWFzXG4gICAgICAgIHsgcGF0aDogJ2RldGFpbC86aWQnLCBjb21wb25lbnQ6IEhlcm9EZXRhaWxDb21wb25lbnQgfVxuICAgICAgXTtcbiAgICBgLFxuICAgICAgKTtcbiAgICB9XG4gICAgaWYgKEFycmF5LmlzQXJyYXkocm91dGUpKSB7XG4gICAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfUk9VVEVfQ09ORklHLFxuICAgICAgICBgSW52YWxpZCBjb25maWd1cmF0aW9uIG9mIHJvdXRlICcke2Z1bGxQYXRofSc6IEFycmF5IGNhbm5vdCBiZSBzcGVjaWZpZWRgLFxuICAgICAgKTtcbiAgICB9XG4gICAgaWYgKFxuICAgICAgIXJvdXRlLnJlZGlyZWN0VG8gJiZcbiAgICAgICFyb3V0ZS5jb21wb25lbnQgJiZcbiAgICAgICFyb3V0ZS5sb2FkQ29tcG9uZW50ICYmXG4gICAgICAhcm91dGUuY2hpbGRyZW4gJiZcbiAgICAgICFyb3V0ZS5sb2FkQ2hpbGRyZW4gJiZcbiAgICAgIHJvdXRlLm91dGxldCAmJlxuICAgICAgcm91dGUub3V0bGV0ICE9PSBQUklNQVJZX09VVExFVFxuICAgICkge1xuICAgICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX1JPVVRFX0NPTkZJRyxcbiAgICAgICAgYEludmFsaWQgY29uZmlndXJhdGlvbiBvZiByb3V0ZSAnJHtmdWxsUGF0aH0nOiBhIGNvbXBvbmVudGxlc3Mgcm91dGUgd2l0aG91dCBjaGlsZHJlbiBvciBsb2FkQ2hpbGRyZW4gY2Fubm90IGhhdmUgYSBuYW1lZCBvdXRsZXQgc2V0YCxcbiAgICAgICk7XG4gICAgfVxuICAgIGlmIChyb3V0ZS5yZWRpcmVjdFRvICYmIHJvdXRlLmNoaWxkcmVuKSB7XG4gICAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfUk9VVEVfQ09ORklHLFxuICAgICAgICBgSW52YWxpZCBjb25maWd1cmF0aW9uIG9mIHJvdXRlICcke2Z1bGxQYXRofSc6IHJlZGlyZWN0VG8gYW5kIGNoaWxkcmVuIGNhbm5vdCBiZSB1c2VkIHRvZ2V0aGVyYCxcbiAgICAgICk7XG4gICAgfVxuICAgIGlmIChyb3V0ZS5yZWRpcmVjdFRvICYmIHJvdXRlLmxvYWRDaGlsZHJlbikge1xuICAgICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX1JPVVRFX0NPTkZJRyxcbiAgICAgICAgYEludmFsaWQgY29uZmlndXJhdGlvbiBvZiByb3V0ZSAnJHtmdWxsUGF0aH0nOiByZWRpcmVjdFRvIGFuZCBsb2FkQ2hpbGRyZW4gY2Fubm90IGJlIHVzZWQgdG9nZXRoZXJgLFxuICAgICAgKTtcbiAgICB9XG4gICAgaWYgKHJvdXRlLmNoaWxkcmVuICYmIHJvdXRlLmxvYWRDaGlsZHJlbikge1xuICAgICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX1JPVVRFX0NPTkZJRyxcbiAgICAgICAgYEludmFsaWQgY29uZmlndXJhdGlvbiBvZiByb3V0ZSAnJHtmdWxsUGF0aH0nOiBjaGlsZHJlbiBhbmQgbG9hZENoaWxkcmVuIGNhbm5vdCBiZSB1c2VkIHRvZ2V0aGVyYCxcbiAgICAgICk7XG4gICAgfVxuICAgIGlmIChyb3V0ZS5yZWRpcmVjdFRvICYmIChyb3V0ZS5jb21wb25lbnQgfHwgcm91dGUubG9hZENvbXBvbmVudCkpIHtcbiAgICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9ST1VURV9DT05GSUcsXG4gICAgICAgIGBJbnZhbGlkIGNvbmZpZ3VyYXRpb24gb2Ygcm91dGUgJyR7ZnVsbFBhdGh9JzogcmVkaXJlY3RUbyBhbmQgY29tcG9uZW50L2xvYWRDb21wb25lbnQgY2Fubm90IGJlIHVzZWQgdG9nZXRoZXJgLFxuICAgICAgKTtcbiAgICB9XG4gICAgaWYgKHJvdXRlLmNvbXBvbmVudCAmJiByb3V0ZS5sb2FkQ29tcG9uZW50KSB7XG4gICAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfUk9VVEVfQ09ORklHLFxuICAgICAgICBgSW52YWxpZCBjb25maWd1cmF0aW9uIG9mIHJvdXRlICcke2Z1bGxQYXRofSc6IGNvbXBvbmVudCBhbmQgbG9hZENvbXBvbmVudCBjYW5ub3QgYmUgdXNlZCB0b2dldGhlcmAsXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAocm91dGUucmVkaXJlY3RUbyAmJiByb3V0ZS5jYW5BY3RpdmF0ZSkge1xuICAgICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX1JPVVRFX0NPTkZJRyxcbiAgICAgICAgYEludmFsaWQgY29uZmlndXJhdGlvbiBvZiByb3V0ZSAnJHtmdWxsUGF0aH0nOiByZWRpcmVjdFRvIGFuZCBjYW5BY3RpdmF0ZSBjYW5ub3QgYmUgdXNlZCB0b2dldGhlci4gUmVkaXJlY3RzIGhhcHBlbiBiZWZvcmUgYWN0aXZhdGlvbiBgICtcbiAgICAgICAgICBgc28gY2FuQWN0aXZhdGUgd2lsbCBuZXZlciBiZSBleGVjdXRlZC5gLFxuICAgICAgKTtcbiAgICB9XG4gICAgaWYgKHJvdXRlLnBhdGggJiYgcm91dGUubWF0Y2hlcikge1xuICAgICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX1JPVVRFX0NPTkZJRyxcbiAgICAgICAgYEludmFsaWQgY29uZmlndXJhdGlvbiBvZiByb3V0ZSAnJHtmdWxsUGF0aH0nOiBwYXRoIGFuZCBtYXRjaGVyIGNhbm5vdCBiZSB1c2VkIHRvZ2V0aGVyYCxcbiAgICAgICk7XG4gICAgfVxuICAgIGlmIChcbiAgICAgIHJvdXRlLnJlZGlyZWN0VG8gPT09IHZvaWQgMCAmJlxuICAgICAgIXJvdXRlLmNvbXBvbmVudCAmJlxuICAgICAgIXJvdXRlLmxvYWRDb21wb25lbnQgJiZcbiAgICAgICFyb3V0ZS5jaGlsZHJlbiAmJlxuICAgICAgIXJvdXRlLmxvYWRDaGlsZHJlblxuICAgICkge1xuICAgICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX1JPVVRFX0NPTkZJRyxcbiAgICAgICAgYEludmFsaWQgY29uZmlndXJhdGlvbiBvZiByb3V0ZSAnJHtmdWxsUGF0aH0nLiBPbmUgb2YgdGhlIGZvbGxvd2luZyBtdXN0IGJlIHByb3ZpZGVkOiBjb21wb25lbnQsIGxvYWRDb21wb25lbnQsIHJlZGlyZWN0VG8sIGNoaWxkcmVuIG9yIGxvYWRDaGlsZHJlbmAsXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAocm91dGUucGF0aCA9PT0gdm9pZCAwICYmIHJvdXRlLm1hdGNoZXIgPT09IHZvaWQgMCkge1xuICAgICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX1JPVVRFX0NPTkZJRyxcbiAgICAgICAgYEludmFsaWQgY29uZmlndXJhdGlvbiBvZiByb3V0ZSAnJHtmdWxsUGF0aH0nOiByb3V0ZXMgbXVzdCBoYXZlIGVpdGhlciBhIHBhdGggb3IgYSBtYXRjaGVyIHNwZWNpZmllZGAsXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIHJvdXRlLnBhdGggPT09ICdzdHJpbmcnICYmIHJvdXRlLnBhdGguY2hhckF0KDApID09PSAnLycpIHtcbiAgICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9ST1VURV9DT05GSUcsXG4gICAgICAgIGBJbnZhbGlkIGNvbmZpZ3VyYXRpb24gb2Ygcm91dGUgJyR7ZnVsbFBhdGh9JzogcGF0aCBjYW5ub3Qgc3RhcnQgd2l0aCBhIHNsYXNoYCxcbiAgICAgICk7XG4gICAgfVxuICAgIGlmIChyb3V0ZS5wYXRoID09PSAnJyAmJiByb3V0ZS5yZWRpcmVjdFRvICE9PSB2b2lkIDAgJiYgcm91dGUucGF0aE1hdGNoID09PSB2b2lkIDApIHtcbiAgICAgIGNvbnN0IGV4cCA9IGBUaGUgZGVmYXVsdCB2YWx1ZSBvZiAncGF0aE1hdGNoJyBpcyAncHJlZml4JywgYnV0IG9mdGVuIHRoZSBpbnRlbnQgaXMgdG8gdXNlICdmdWxsJy5gO1xuICAgICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX1JPVVRFX0NPTkZJRyxcbiAgICAgICAgYEludmFsaWQgY29uZmlndXJhdGlvbiBvZiByb3V0ZSAne3BhdGg6IFwiJHtmdWxsUGF0aH1cIiwgcmVkaXJlY3RUbzogXCIke3JvdXRlLnJlZGlyZWN0VG99XCJ9JzogcGxlYXNlIHByb3ZpZGUgJ3BhdGhNYXRjaCcuICR7ZXhwfWAsXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAocmVxdWlyZVN0YW5kYWxvbmVDb21wb25lbnRzKSB7XG4gICAgICBhc3NlcnRTdGFuZGFsb25lKGZ1bGxQYXRoLCByb3V0ZS5jb21wb25lbnQpO1xuICAgIH1cbiAgfVxuICBpZiAocm91dGUuY2hpbGRyZW4pIHtcbiAgICB2YWxpZGF0ZUNvbmZpZyhyb3V0ZS5jaGlsZHJlbiwgZnVsbFBhdGgsIHJlcXVpcmVTdGFuZGFsb25lQ29tcG9uZW50cyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0RnVsbFBhdGgocGFyZW50UGF0aDogc3RyaW5nLCBjdXJyZW50Um91dGU6IFJvdXRlKTogc3RyaW5nIHtcbiAgaWYgKCFjdXJyZW50Um91dGUpIHtcbiAgICByZXR1cm4gcGFyZW50UGF0aDtcbiAgfVxuICBpZiAoIXBhcmVudFBhdGggJiYgIWN1cnJlbnRSb3V0ZS5wYXRoKSB7XG4gICAgcmV0dXJuICcnO1xuICB9IGVsc2UgaWYgKHBhcmVudFBhdGggJiYgIWN1cnJlbnRSb3V0ZS5wYXRoKSB7XG4gICAgcmV0dXJuIGAke3BhcmVudFBhdGh9L2A7XG4gIH0gZWxzZSBpZiAoIXBhcmVudFBhdGggJiYgY3VycmVudFJvdXRlLnBhdGgpIHtcbiAgICByZXR1cm4gY3VycmVudFJvdXRlLnBhdGg7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGAke3BhcmVudFBhdGh9LyR7Y3VycmVudFJvdXRlLnBhdGh9YDtcbiAgfVxufVxuXG4vKipcbiAqIE1ha2VzIGEgY29weSBvZiB0aGUgY29uZmlnIGFuZCBhZGRzIGFueSBkZWZhdWx0IHJlcXVpcmVkIHByb3BlcnRpZXMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdGFuZGFyZGl6ZUNvbmZpZyhyOiBSb3V0ZSk6IFJvdXRlIHtcbiAgY29uc3QgY2hpbGRyZW4gPSByLmNoaWxkcmVuICYmIHIuY2hpbGRyZW4ubWFwKHN0YW5kYXJkaXplQ29uZmlnKTtcbiAgY29uc3QgYyA9IGNoaWxkcmVuID8gey4uLnIsIGNoaWxkcmVufSA6IHsuLi5yfTtcbiAgaWYgKFxuICAgICFjLmNvbXBvbmVudCAmJlxuICAgICFjLmxvYWRDb21wb25lbnQgJiZcbiAgICAoY2hpbGRyZW4gfHwgYy5sb2FkQ2hpbGRyZW4pICYmXG4gICAgYy5vdXRsZXQgJiZcbiAgICBjLm91dGxldCAhPT0gUFJJTUFSWV9PVVRMRVRcbiAgKSB7XG4gICAgYy5jb21wb25lbnQgPSBFbXB0eU91dGxldENvbXBvbmVudDtcbiAgfVxuICByZXR1cm4gYztcbn1cblxuLyoqIFJldHVybnMgdGhlIGByb3V0ZS5vdXRsZXRgIG9yIFBSSU1BUllfT1VUTEVUIGlmIG5vbmUgZXhpc3RzLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldE91dGxldChyb3V0ZTogUm91dGUpOiBzdHJpbmcge1xuICByZXR1cm4gcm91dGUub3V0bGV0IHx8IFBSSU1BUllfT1VUTEVUO1xufVxuXG4vKipcbiAqIFNvcnRzIHRoZSBgcm91dGVzYCBzdWNoIHRoYXQgdGhlIG9uZXMgd2l0aCBhbiBvdXRsZXQgbWF0Y2hpbmcgYG91dGxldE5hbWVgIGNvbWUgZmlyc3QuXG4gKiBUaGUgb3JkZXIgb2YgdGhlIGNvbmZpZ3MgaXMgb3RoZXJ3aXNlIHByZXNlcnZlZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNvcnRCeU1hdGNoaW5nT3V0bGV0cyhyb3V0ZXM6IFJvdXRlcywgb3V0bGV0TmFtZTogc3RyaW5nKTogUm91dGVzIHtcbiAgY29uc3Qgc29ydGVkQ29uZmlnID0gcm91dGVzLmZpbHRlcigocikgPT4gZ2V0T3V0bGV0KHIpID09PSBvdXRsZXROYW1lKTtcbiAgc29ydGVkQ29uZmlnLnB1c2goLi4ucm91dGVzLmZpbHRlcigocikgPT4gZ2V0T3V0bGV0KHIpICE9PSBvdXRsZXROYW1lKSk7XG4gIHJldHVybiBzb3J0ZWRDb25maWc7XG59XG5cbi8qKlxuICogR2V0cyB0aGUgZmlyc3QgaW5qZWN0b3IgaW4gdGhlIHNuYXBzaG90J3MgcGFyZW50IHRyZWUuXG4gKlxuICogSWYgdGhlIGBSb3V0ZWAgaGFzIGEgc3RhdGljIGxpc3Qgb2YgcHJvdmlkZXJzLCB0aGUgcmV0dXJuZWQgaW5qZWN0b3Igd2lsbCBiZSB0aGUgb25lIGNyZWF0ZWQgZnJvbVxuICogdGhvc2UuIElmIGl0IGRvZXMgbm90IGV4aXN0LCB0aGUgcmV0dXJuZWQgaW5qZWN0b3IgbWF5IGNvbWUgZnJvbSB0aGUgcGFyZW50cywgd2hpY2ggbWF5IGJlIGZyb20gYVxuICogbG9hZGVkIGNvbmZpZyBvciB0aGVpciBzdGF0aWMgcHJvdmlkZXJzLlxuICpcbiAqIFJldHVybnMgYG51bGxgIGlmIHRoZXJlIGlzIG5laXRoZXIgdGhpcyBub3IgYW55IHBhcmVudHMgaGF2ZSBhIHN0b3JlZCBpbmplY3Rvci5cbiAqXG4gKiBHZW5lcmFsbHkgdXNlZCBmb3IgcmV0cmlldmluZyB0aGUgaW5qZWN0b3IgdG8gdXNlIGZvciBnZXR0aW5nIHRva2VucyBmb3IgZ3VhcmRzL3Jlc29sdmVycyBhbmRcbiAqIGFsc28gdXNlZCBmb3IgZ2V0dGluZyB0aGUgY29ycmVjdCBpbmplY3RvciB0byB1c2UgZm9yIGNyZWF0aW5nIGNvbXBvbmVudHMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRDbG9zZXN0Um91dGVJbmplY3RvcihcbiAgc25hcHNob3Q6IEFjdGl2YXRlZFJvdXRlU25hcHNob3QsXG4pOiBFbnZpcm9ubWVudEluamVjdG9yIHwgbnVsbCB7XG4gIGlmICghc25hcHNob3QpIHJldHVybiBudWxsO1xuXG4gIC8vIElmIHRoZSBjdXJyZW50IHJvdXRlIGhhcyBpdHMgb3duIGluamVjdG9yLCB3aGljaCBpcyBjcmVhdGVkIGZyb20gdGhlIHN0YXRpYyBwcm92aWRlcnMgb24gdGhlXG4gIC8vIHJvdXRlIGl0c2VsZiwgd2Ugc2hvdWxkIHVzZSB0aGF0LiBPdGhlcndpc2UsIHdlIHN0YXJ0IGF0IHRoZSBwYXJlbnQgc2luY2Ugd2UgZG8gbm90IHdhbnQgdG9cbiAgLy8gaW5jbHVkZSB0aGUgbGF6eSBsb2FkZWQgaW5qZWN0b3IgZnJvbSB0aGlzIHJvdXRlLlxuICBpZiAoc25hcHNob3Qucm91dGVDb25maWc/Ll9pbmplY3Rvcikge1xuICAgIHJldHVybiBzbmFwc2hvdC5yb3V0ZUNvbmZpZy5faW5qZWN0b3I7XG4gIH1cblxuICBmb3IgKGxldCBzID0gc25hcHNob3QucGFyZW50OyBzOyBzID0gcy5wYXJlbnQpIHtcbiAgICBjb25zdCByb3V0ZSA9IHMucm91dGVDb25maWc7XG4gICAgLy8gTm90ZSB0aGF0IHRoZSBvcmRlciBoZXJlIGlzIGltcG9ydGFudC4gYF9sb2FkZWRJbmplY3RvcmAgc3RvcmVkIG9uIHRoZSByb3V0ZSB3aXRoXG4gICAgLy8gYGxvYWRDaGlsZHJlbjogKCkgPT4gTmdNb2R1bGVgIHNvIGl0IGFwcGxpZXMgdG8gY2hpbGQgcm91dGVzIHdpdGggcHJpb3JpdHkuIFRoZSBgX2luamVjdG9yYFxuICAgIC8vIGlzIGNyZWF0ZWQgZnJvbSB0aGUgc3RhdGljIHByb3ZpZGVycyBvbiB0aGF0IHBhcmVudCByb3V0ZSwgc28gaXQgYXBwbGllcyB0byB0aGUgY2hpbGRyZW4gYXNcbiAgICAvLyB3ZWxsLCBidXQgb25seSBpZiB0aGVyZSBpcyBubyBsYXp5IGxvYWRlZCBOZ01vZHVsZVJlZiBpbmplY3Rvci5cbiAgICBpZiAocm91dGU/Ll9sb2FkZWRJbmplY3RvcikgcmV0dXJuIHJvdXRlLl9sb2FkZWRJbmplY3RvcjtcbiAgICBpZiAocm91dGU/Ll9pbmplY3RvcikgcmV0dXJuIHJvdXRlLl9pbmplY3RvcjtcbiAgfVxuXG4gIHJldHVybiBudWxsO1xufVxuIl19