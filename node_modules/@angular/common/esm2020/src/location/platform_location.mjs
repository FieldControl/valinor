/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Inject, Injectable, InjectionToken, ɵɵinject } from '@angular/core';
import { getDOM } from '../dom_adapter';
import { DOCUMENT } from '../dom_tokens';
import * as i0 from "@angular/core";
/**
 * This class should not be used directly by an application developer. Instead, use
 * {@link Location}.
 *
 * `PlatformLocation` encapsulates all calls to DOM APIs, which allows the Router to be
 * platform-agnostic.
 * This means that we can have different implementation of `PlatformLocation` for the different
 * platforms that Angular supports. For example, `@angular/platform-browser` provides an
 * implementation specific to the browser environment, while `@angular/platform-server` provides
 * one suitable for use with server-side rendering.
 *
 * The `PlatformLocation` class is used directly by all implementations of {@link LocationStrategy}
 * when they need to interact with the DOM APIs like pushState, popState, etc.
 *
 * {@link LocationStrategy} in turn is used by the {@link Location} service which is used directly
 * by the {@link Router} in order to navigate between routes. Since all interactions between {@link
 * Router} /
 * {@link Location} / {@link LocationStrategy} and DOM APIs flow through the `PlatformLocation`
 * class, they are all platform-agnostic.
 *
 * @publicApi
 */
export class PlatformLocation {
    historyGo(relativePosition) {
        throw new Error('Not implemented');
    }
}
PlatformLocation.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.1", ngImport: i0, type: PlatformLocation, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
PlatformLocation.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "15.2.1", ngImport: i0, type: PlatformLocation, providedIn: 'platform', useFactory: useBrowserPlatformLocation });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.1", ngImport: i0, type: PlatformLocation, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'platform',
                    // See #23917
                    useFactory: useBrowserPlatformLocation
                }]
        }] });
export function useBrowserPlatformLocation() {
    return ɵɵinject(BrowserPlatformLocation);
}
/**
 * @description
 * Indicates when a location is initialized.
 *
 * @publicApi
 */
export const LOCATION_INITIALIZED = new InjectionToken('Location Initialized');
/**
 * `PlatformLocation` encapsulates all of the direct calls to platform APIs.
 * This class should not be used directly by an application developer. Instead, use
 * {@link Location}.
 *
 * @publicApi
 */
export class BrowserPlatformLocation extends PlatformLocation {
    constructor(_doc) {
        super();
        this._doc = _doc;
        this._location = window.location;
        this._history = window.history;
    }
    getBaseHrefFromDOM() {
        return getDOM().getBaseHref(this._doc);
    }
    onPopState(fn) {
        const window = getDOM().getGlobalEventTarget(this._doc, 'window');
        window.addEventListener('popstate', fn, false);
        return () => window.removeEventListener('popstate', fn);
    }
    onHashChange(fn) {
        const window = getDOM().getGlobalEventTarget(this._doc, 'window');
        window.addEventListener('hashchange', fn, false);
        return () => window.removeEventListener('hashchange', fn);
    }
    get href() {
        return this._location.href;
    }
    get protocol() {
        return this._location.protocol;
    }
    get hostname() {
        return this._location.hostname;
    }
    get port() {
        return this._location.port;
    }
    get pathname() {
        return this._location.pathname;
    }
    get search() {
        return this._location.search;
    }
    get hash() {
        return this._location.hash;
    }
    set pathname(newPath) {
        this._location.pathname = newPath;
    }
    pushState(state, title, url) {
        if (supportsState()) {
            this._history.pushState(state, title, url);
        }
        else {
            this._location.hash = url;
        }
    }
    replaceState(state, title, url) {
        if (supportsState()) {
            this._history.replaceState(state, title, url);
        }
        else {
            this._location.hash = url;
        }
    }
    forward() {
        this._history.forward();
    }
    back() {
        this._history.back();
    }
    historyGo(relativePosition = 0) {
        this._history.go(relativePosition);
    }
    getState() {
        return this._history.state;
    }
}
BrowserPlatformLocation.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.1", ngImport: i0, type: BrowserPlatformLocation, deps: [{ token: DOCUMENT }], target: i0.ɵɵFactoryTarget.Injectable });
BrowserPlatformLocation.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "15.2.1", ngImport: i0, type: BrowserPlatformLocation, providedIn: 'platform', useFactory: createBrowserPlatformLocation });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.1", ngImport: i0, type: BrowserPlatformLocation, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'platform',
                    // See #23917
                    useFactory: createBrowserPlatformLocation,
                }]
        }], ctorParameters: function () { return [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [DOCUMENT]
                }] }]; } });
export function supportsState() {
    return !!window.history.pushState;
}
export function createBrowserPlatformLocation() {
    return new BrowserPlatformLocation(ɵɵinject(DOCUMENT));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxhdGZvcm1fbG9jYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2xvY2F0aW9uL3BsYXRmb3JtX2xvY2F0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxNQUFNLEVBQUUsVUFBVSxFQUFFLGNBQWMsRUFBRSxRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFM0UsT0FBTyxFQUFDLE1BQU0sRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQ3RDLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7O0FBRXZDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FxQkc7QUFNSCxNQUFNLE9BQWdCLGdCQUFnQjtJQTRCcEMsU0FBUyxDQUFFLGdCQUF3QjtRQUNqQyxNQUFNLElBQUksS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFDckMsQ0FBQzs7d0hBOUJtQixnQkFBZ0I7NEhBQWhCLGdCQUFnQixjQUp4QixVQUFVLGNBRVYsMEJBQTBCO3NHQUVsQixnQkFBZ0I7a0JBTHJDLFVBQVU7bUJBQUM7b0JBQ1YsVUFBVSxFQUFFLFVBQVU7b0JBQ3RCLGFBQWE7b0JBQ2IsVUFBVSxFQUFFLDBCQUEwQjtpQkFDdkM7O0FBa0NELE1BQU0sVUFBVSwwQkFBMEI7SUFDeEMsT0FBTyxRQUFRLENBQUMsdUJBQXVCLENBQUMsQ0FBQztBQUMzQyxDQUFDO0FBRUQ7Ozs7O0dBS0c7QUFDSCxNQUFNLENBQUMsTUFBTSxvQkFBb0IsR0FBRyxJQUFJLGNBQWMsQ0FBZSxzQkFBc0IsQ0FBQyxDQUFDO0FBc0I3Rjs7Ozs7O0dBTUc7QUFNSCxNQUFNLE9BQU8sdUJBQXdCLFNBQVEsZ0JBQWdCO0lBSTNELFlBQXNDLElBQVM7UUFDN0MsS0FBSyxFQUFFLENBQUM7UUFENEIsU0FBSSxHQUFKLElBQUksQ0FBSztRQUU3QyxJQUFJLENBQUMs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QUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUNyQyxDQUFDO0lBRVEsUUFBUTtRQUNmLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUM7SUFDN0IsQ0FBQzs7K0hBakZVLHVCQUF1QixrQkFJZCxRQUFRO21JQUpqQix1QkFBdUIsY0FKdEIsVUFBVSxjQUVWLDZCQUE2QjtzR0FFOUIsdUJBQXVCO2tCQUxuQyxVQUFVO21CQUFDO29CQUNWLFVBQVUsRUFBRSxVQUFVO29CQUN0QixhQUFhO29CQUNiLFVBQVUsRUFBRSw2QkFBNkI7aUJBQzFDOzswQkFLYyxNQUFNOzJCQUFDLFFBQVE7O0FBZ0Y5QixNQUFNLFVBQVUsYUFBYTtJQUMzQixPQUFPLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQztBQUNwQyxDQUFDO0FBQ0QsTUFBTSxVQUFVLDZCQUE2QjtJQUMzQyxPQUFPLElBQUksdUJBQXVCLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7QUFDekQsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdCwgSW5qZWN0YWJsZSwgSW5qZWN0aW9uVG9rZW4sIMm1ybVpbmplY3R9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge2dldERPTX0gZnJvbSAnLi4vZG9tX2FkYXB0ZXInO1xuaW1wb3J0IHtET0NVTUVOVH0gZnJvbSAnLi4vZG9tX3Rva2Vucyc7XG5cbi8qKlxuICogVGhpcyBjbGFzcyBzaG91bGQgbm90IGJlIHVzZWQgZGlyZWN0bHkgYnkgYW4gYXBwbGljYXRpb24gZGV2ZWxvcGVyLiBJbnN0ZWFkLCB1c2VcbiAqIHtAbGluayBMb2NhdGlvbn0uXG4gKlxuICogYFBsYXRmb3JtTG9jYXRpb25gIGVuY2Fwc3VsYXRlcyBhbGwgY2FsbHMgdG8gRE9NIEFQSXMsIHdoaWNoIGFsbG93cyB0aGUgUm91dGVyIHRvIGJlXG4gKiBwbGF0Zm9ybS1hZ25vc3RpYy5cbiAqIFRoaXMgbWVhbnMgdGhhdCB3ZSBjYW4gaGF2ZSBkaWZmZXJlbnQgaW1wbGVtZW50YXRpb24gb2YgYFBsYXRmb3JtTG9jYXRpb25gIGZvciB0aGUgZGlmZmVyZW50XG4gKiBwbGF0Zm9ybXMgdGhhdCBBbmd1bGFyIHN1cHBvcnRzLiBGb3IgZXhhbXBsZSwgYEBhbmd1bGFyL3BsYXRmb3JtLWJyb3dzZXJgIHByb3ZpZGVzIGFuXG4gKiBpbXBsZW1lbnRhdGlvbiBzcGVjaWZpYyB0byB0aGUgYnJvd3NlciBlbnZpcm9ubWVudCwgd2hpbGUgYEBhbmd1bGFyL3BsYXRmb3JtLXNlcnZlcmAgcHJvdmlkZXNcbiAqIG9uZSBzdWl0YWJsZSBmb3IgdXNlIHdpdGggc2VydmVyLXNpZGUgcmVuZGVyaW5nLlxuICpcbiAqIFRoZSBgUGxhdGZvcm1Mb2NhdGlvbmAgY2xhc3MgaXMgdXNlZCBkaXJlY3RseSBieSBhbGwgaW1wbGVtZW50YXRpb25zIG9mIHtAbGluayBMb2NhdGlvblN0cmF0ZWd5fVxuICogd2hlbiB0aGV5IG5lZWQgdG8gaW50ZXJhY3Qgd2l0aCB0aGUgRE9NIEFQSXMgbGlrZSBwdXNoU3RhdGUsIHBvcFN0YXRlLCBldGMuXG4gKlxuICoge0BsaW5rIExvY2F0aW9uU3RyYXRlZ3l9IGluIHR1cm4gaXMgdXNlZCBieSB0aGUge0BsaW5rIExvY2F0aW9ufSBzZXJ2aWNlIHdoaWNoIGlzIHVzZWQgZGlyZWN0bHlcbiAqIGJ5IHRoZSB7QGxpbmsgUm91dGVyfSBpbiBvcmRlciB0byBuYXZpZ2F0ZSBiZXR3ZWVuIHJvdXRlcy4gU2luY2UgYWxsIGludGVyYWN0aW9ucyBiZXR3ZWVuIHtAbGlua1xuICogUm91dGVyfSAvXG4gKiB7QGxpbmsgTG9jYXRpb259IC8ge0BsaW5rIExvY2F0aW9uU3RyYXRlZ3l9IGFuZCBET00gQVBJcyBmbG93IHRocm91Z2ggdGhlIGBQbGF0Zm9ybUxvY2F0aW9uYFxuICogY2xhc3MsIHRoZXkgYXJlIGFsbCBwbGF0Zm9ybS1hZ25vc3RpYy5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBJbmplY3RhYmxlKHtcbiAgcHJvdmlkZWRJbjogJ3BsYXRmb3JtJyxcbiAgLy8gU2VlICMyMzkxN1xuICB1c2VGYWN0b3J5OiB1c2VCcm93c2VyUGxhdGZvcm1Mb2NhdGlvblxufSlcbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBQbGF0Zm9ybUxvY2F0aW9uIHtcbiAgYWJzdHJhY3QgZ2V0QmFzZUhyZWZGcm9tRE9NKCk6IHN0cmluZztcbiAgYWJzdHJhY3QgZ2V0U3RhdGUoKTogdW5rbm93bjtcbiAgLyoqXG4gICAqIFJldHVybnMgYSBmdW5jdGlvbiB0aGF0LCB3aGVuIGV4ZWN1dGVkLCByZW1vdmVzIHRoZSBgcG9wc3RhdGVgIGV2ZW50IGhhbmRsZXIuXG4gICAqL1xuICBhYnN0cmFjdCBvblBvcFN0YXRlKGZuOiBMb2NhdGlvbkNoYW5nZUxpc3RlbmVyKTogVm9pZEZ1bmN0aW9uO1xuICAvKipcbiAgICogUmV0dXJucyBhIGZ1bmN0aW9uIHRoYXQsIHdoZW4gZXhlY3V0ZWQsIHJlbW92ZXMgdGhlIGBoYXNoY2hhbmdlYCBldmVudCBoYW5kbGVyLlxuICAgKi9cbiAgYWJzdHJhY3Qgb25IYXNoQ2hhbmdlKGZuOiBMb2NhdGlvbkNoYW5nZUxpc3RlbmVyKTogVm9pZEZ1bmN0aW9uO1xuXG4gIGFic3RyYWN0IGdldCBocmVmKCk6IHN0cmluZztcbiAgYWJzdHJhY3QgZ2V0IHByb3RvY29sKCk6IHN0cmluZztcbiAgYWJzdHJhY3QgZ2V0IGhvc3RuYW1lKCk6IHN0cmluZztcbiAgYWJzdHJhY3QgZ2V0IHBvcnQoKTogc3RyaW5nO1xuICBhYnN0cmFjdCBnZXQgcGF0aG5hbWUoKTogc3RyaW5nO1xuICBhYnN0cmFjdCBnZXQgc2VhcmNoKCk6IHN0cmluZztcbiAgYWJzdHJhY3QgZ2V0IGhhc2goKTogc3RyaW5nO1xuXG4gIGFic3RyYWN0IHJlcGxhY2VTdGF0ZShzdGF0ZTogYW55LCB0aXRsZTogc3RyaW5nLCB1cmw6IHN0cmluZyk6IHZvaWQ7XG5cbiAgYWJzdHJhY3QgcHVzaFN0YXRlKHN0YXRlOiBhbnksIHRpdGxlOiBzdHJpbmcsIHVybDogc3RyaW5nKTogdm9pZDtcblxuICBhYnN0cmFjdCBmb3J3YXJkKCk6IHZvaWQ7XG5cbiAgYWJzdHJhY3QgYmFjaygpOiB2b2lkO1xuXG4gIGhpc3RvcnlHbz8ocmVsYXRpdmVQb3NpdGlvbjogbnVtYmVyKTogdm9pZCB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQnKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdXNlQnJvd3NlclBsYXRmb3JtTG9jYXRpb24oKSB7XG4gIHJldHVybiDJtcm1aW5qZWN0KEJyb3dzZXJQbGF0Zm9ybUxvY2F0aW9uKTtcbn1cblxuLyoqXG4gKiBAZGVzY3JpcHRpb25cbiAqIEluZGljYXRlcyB3aGVuIGEgbG9jYXRpb24gaXMgaW5pdGlhbGl6ZWQuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY29uc3QgTE9DQVRJT05fSU5JVElBTElaRUQgPSBuZXcgSW5qZWN0aW9uVG9rZW48UHJvbWlzZTxhbnk+PignTG9jYXRpb24gSW5pdGlhbGl6ZWQnKTtcblxuLyoqXG4gKiBAZGVzY3JpcHRpb25cbiAqIEEgc2VyaWFsaXphYmxlIHZlcnNpb24gb2YgdGhlIGV2ZW50IGZyb20gYG9uUG9wU3RhdGVgIG9yIGBvbkhhc2hDaGFuZ2VgXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgaW50ZXJmYWNlIExvY2F0aW9uQ2hhbmdlRXZlbnQge1xuICB0eXBlOiBzdHJpbmc7XG4gIHN0YXRlOiBhbnk7XG59XG5cbi8qKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgaW50ZXJmYWNlIExvY2F0aW9uQ2hhbmdlTGlzdGVuZXIge1xuICAoZXZlbnQ6IExvY2F0aW9uQ2hhbmdlRXZlbnQpOiBhbnk7XG59XG5cblxuXG4vKipcbiAqIGBQbGF0Zm9ybUxvY2F0aW9uYCBlbmNhcHN1bGF0ZXMgYWxsIG9mIHRoZSBkaXJlY3QgY2FsbHMgdG8gcGxhdGZvcm0gQVBJcy5cbiAqIFRoaXMgY2xhc3Mgc2hvdWxkIG5vdCBiZSB1c2VkIGRpcmVjdGx5IGJ5IGFuIGFwcGxpY2F0aW9uIGRldmVsb3Blci4gSW5zdGVhZCwgdXNlXG4gKiB7QGxpbmsgTG9jYXRpb259LlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQEluamVjdGFibGUoe1xuICBwcm92aWRlZEluOiAncGxhdGZvcm0nLFxuICAvLyBTZWUgIzIzOTE3XG4gIHVzZUZhY3Rvcnk6IGNyZWF0ZUJyb3dzZXJQbGF0Zm9ybUxvY2F0aW9uLFxufSlcbmV4cG9ydCBjbGFzcyBCcm93c2VyUGxhdGZvcm1Mb2NhdGlvbiBleHRlbmRzIFBsYXRmb3JtTG9jYXRpb24ge1xuICBwcml2YXRlIF9sb2NhdGlvbjogTG9jYXRpb247XG4gIHByaXZhdGUgX2hpc3Rvcnk6IEhpc3Rvcnk7XG5cbiAgY29uc3RydWN0b3IoQEluamVjdChET0NVTUVOVCkgcHJpdmF0ZSBfZG9jOiBhbnkpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuX2xvY2F0aW9uID0gd2luZG93LmxvY2F0aW9uO1xuICAgIHRoaXMuX2hpc3RvcnkgPSB3aW5kb3cuaGlzdG9yeTtcbiAgfVxuXG4gIG92ZXJyaWRlIGdldEJhc2VIcmVmRnJvbURPTSgpOiBzdHJpbmcge1xuICAgIHJldHVybiBnZXRET00oKS5nZXRCYXNlSHJlZih0aGlzLl9kb2MpITtcbiAgfVxuXG4gIG92ZXJyaWRlIG9uUG9wU3RhdGUoZm46IExvY2F0aW9uQ2hhbmdlTGlzdGVuZXIpOiBWb2lkRnVuY3Rpb24ge1xuICAgIGNvbnN0IHdpbmRvdyA9IGdldERPTSgpLmdldEdsb2JhbEV2ZW50VGFyZ2V0KHRoaXMuX2RvYywgJ3dpbmRvdycpO1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdwb3BzdGF0ZScsIGZuLCBmYWxzZSk7XG4gICAgcmV0dXJuICgpID0+IHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdwb3BzdGF0ZScsIGZuKTtcbiAgfVxuXG4gIG92ZXJyaWRlIG9uSGFzaENoYW5nZShmbjogTG9jYXRpb25DaGFuZ2VMaXN0ZW5lcik6IFZvaWRGdW5jdGlvbiB7XG4gICAgY29uc3Qgd2luZG93ID0gZ2V0RE9NKCkuZ2V0R2xvYmFsRXZlbnRUYXJnZXQodGhpcy5fZG9jLCAnd2luZG93Jyk7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2hhc2hjaGFuZ2UnLCBmbiwgZmFsc2UpO1xuICAgIHJldHVybiAoKSA9PiB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignaGFzaGNoYW5nZScsIGZuKTtcbiAgfVxuXG4gIG92ZXJyaWRlIGdldCBocmVmKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX2xvY2F0aW9uLmhyZWY7XG4gIH1cbiAgb3ZlcnJpZGUgZ2V0IHByb3RvY29sKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX2xvY2F0aW9uLnByb3RvY29sO1xuICB9XG4gIG92ZXJyaWRlIGdldCBob3N0bmFtZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9sb2NhdGlvbi5ob3N0bmFtZTtcbiAgfVxuICBvdmVycmlkZSBnZXQgcG9ydCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9sb2NhdGlvbi5wb3J0O1xuICB9XG4gIG92ZXJyaWRlIGdldCBwYXRobmFtZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9sb2NhdGlvbi5wYXRobmFtZTtcbiAgfVxuICBvdmVycmlkZSBnZXQgc2VhcmNoKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX2xvY2F0aW9uLnNlYXJjaDtcbiAgfVxuICBvdmVycmlkZSBnZXQgaGFzaCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9sb2NhdGlvbi5oYXNoO1xuICB9XG4gIG92ZXJyaWRlIHNldCBwYXRobmFtZShuZXdQYXRoOiBzdHJpbmcpIHtcbiAgICB0aGlzLl9sb2NhdGlvbi5wYXRobmFtZSA9IG5ld1BhdGg7XG4gIH1cblxuICBvdmVycmlkZSBwdXNoU3RhdGUoc3RhdGU6IGFueSwgdGl0bGU6IHN0cmluZywgdXJsOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAoc3VwcG9ydHNTdGF0ZSgpKSB7XG4gICAgICB0aGlzLl9oaXN0b3J5LnB1c2hTdGF0ZShzdGF0ZSwgdGl0bGUsIHVybCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2xvY2F0aW9uLmhhc2ggPSB1cmw7XG4gICAgfVxuICB9XG5cbiAgb3ZlcnJpZGUgcmVwbGFjZVN0YXRlKHN0YXRlOiBhbnksIHRpdGxlOiBzdHJpbmcsIHVybDogc3RyaW5nKTogdm9pZCB7XG4gICAgaWYgKHN1cHBvcnRzU3RhdGUoKSkge1xuICAgICAgdGhpcy5faGlzdG9yeS5yZXBsYWNlU3RhdGUoc3RhdGUsIHRpdGxlLCB1cmwpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9sb2NhdGlvbi5oYXNoID0gdXJsO1xuICAgIH1cbiAgfVxuXG4gIG92ZXJyaWRlIGZvcndhcmQoKTogdm9pZCB7XG4gICAgdGhpcy5faGlzdG9yeS5mb3J3YXJkKCk7XG4gIH1cblxuICBvdmVycmlkZSBiYWNrKCk6IHZvaWQge1xuICAgIHRoaXMuX2hpc3RvcnkuYmFjaygpO1xuICB9XG5cbiAgb3ZlcnJpZGUgaGlzdG9yeUdvKHJlbGF0aXZlUG9zaXRpb246IG51bWJlciA9IDApOiB2b2lkIHtcbiAgICB0aGlzLl9oaXN0b3J5LmdvKHJlbGF0aXZlUG9zaXRpb24pO1xuICB9XG5cbiAgb3ZlcnJpZGUgZ2V0U3RhdGUoKTogdW5rbm93biB7XG4gICAgcmV0dXJuIHRoaXMuX2hpc3Rvcnkuc3RhdGU7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN1cHBvcnRzU3RhdGUoKTogYm9vbGVhbiB7XG4gIHJldHVybiAhIXdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVCcm93c2VyUGxhdGZvcm1Mb2NhdGlvbigpIHtcbiAgcmV0dXJuIG5ldyBCcm93c2VyUGxhdGZvcm1Mb2NhdGlvbijJtcm1aW5qZWN0KERPQ1VNRU5UKSk7XG59XG4iXX0=