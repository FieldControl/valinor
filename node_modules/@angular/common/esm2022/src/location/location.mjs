/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { EventEmitter, Injectable, ɵɵinject } from '@angular/core';
import { LocationStrategy } from './location_strategy';
import { joinWithSlash, normalizeQueryParams, stripTrailingSlash } from './util';
import * as i0 from "@angular/core";
import * as i1 from "./location_strategy";
/**
 * @description
 *
 * A service that applications can use to interact with a browser's URL.
 *
 * Depending on the `LocationStrategy` used, `Location` persists
 * to the URL's path or the URL's hash segment.
 *
 * @usageNotes
 *
 * It's better to use the `Router.navigate()` service to trigger route changes. Use
 * `Location` only if you need to interact with or create normalized URLs outside of
 * routing.
 *
 * `Location` is responsible for normalizing the URL against the application's base href.
 * A normalized URL is absolute from the URL host, includes the application's base href, and has no
 * trailing slash:
 * - `/my/app/user/123` is normalized
 * - `my/app/user/123` **is not** normalized
 * - `/my/app/user/123/` **is not** normalized
 *
 * ### Example
 *
 * <code-example path='common/location/ts/path_location_component.ts'
 * region='LocationComponent'></code-example>
 *
 * @publicApi
 */
export class Location {
    constructor(locationStrategy) {
        /** @internal */
        this._subject = new EventEmitter();
        /** @internal */
        this._urlChangeListeners = [];
        /** @internal */
        this._urlChangeSubscription = null;
        this._locationStrategy = locationStrategy;
        const baseHref = this._locationStrategy.getBaseHref();
        // Note: This class's interaction with base HREF does not fully follow the rules
        // outlined in the spec https://www.freesoft.org/CIE/RFC/1808/18.htm.
        // Instead of trying to fix individual bugs with more and more code, we should
        // investigate using the URL constructor and providing the base as a second
        // argument.
        // https://developer.mozilla.org/en-US/docs/Web/API/URL/URL#parameters
        this._basePath = _stripOrigin(stripTrailingSlash(_stripIndexHtml(baseHref)));
        this._locationStrategy.onPopState((ev) => {
            this._subject.emit({
                'url': this.path(true),
                'pop': true,
                'state': ev.state,
                'type': ev.type,
            });
        });
    }
    /** @nodoc */
    ngOnDestroy() {
        this._urlChangeSubscription?.unsubscribe();
        this._urlChangeListeners = [];
    }
    /**
     * Normalizes the URL path for this location.
     *
     * @param includeHash True to include an anchor fragment in the path.
     *
     * @returns The normalized URL path.
     */
    // TODO: vsavkin. Remove the boolean flag and always include hash once the deprecated router is
    // removed.
    path(includeHash = false) {
        return this.normalize(this._locationStrategy.path(includeHash));
    }
    /**
     * Reports the current state of the location history.
     * @returns The current value of the `history.state` object.
     */
    getState() {
        return this._locationStrategy.getState();
    }
    /**
     * Normalizes the given path and compares to the current normalized path.
     *
     * @param path The given URL path.
     * @param query Query parameters.
     *
     * @returns True if the given URL path is equal to the current normalized path, false
     * otherwise.
     */
    isCurrentPathEqualTo(path, query = '') {
        return this.path() == this.normalize(path + normalizeQueryParams(query));
    }
    /**
     * Normalizes a URL path by stripping any trailing slashes.
     *
     * @param url String representing a URL.
     *
     * @returns The normalized URL string.
     */
    normalize(url) {
        return Location.stripTrailingSlash(_stripBasePath(this._basePath, _stripIndexHtml(url)));
    }
    /**
     * Normalizes an external URL path.
     * If the given URL doesn't begin with a leading slash (`'/'`), adds one
     * before normalizing. Adds a hash if `HashLocationStrategy` is
     * in use, or the `APP_BASE_HREF` if the `PathLocationStrategy` is in use.
     *
     * @param url String representing a URL.
     *
     * @returns  A normalized platform-specific URL.
     */
    prepareExternalUrl(url) {
        if (url && url[0] !== '/') {
            url = '/' + url;
        }
        return this._locationStrategy.prepareExternalUrl(url);
    }
    // TODO: rename this method to pushState
    /**
     * Changes the browser's URL to a normalized version of a given URL, and pushes a
     * new item onto the platform's history.
     *
     * @param path  URL path to normalize.
     * @param query Query parameters.
     * @param state Location history state.
     *
     */
    go(path, query = '', state = null) {
        this._locationStrategy.pushState(state, '', path, query);
        this._notifyUrlChangeListeners(this.prepareExternalUrl(path + normalizeQueryParams(query)), state);
    }
    /**
     * Changes the browser's URL to a normalized version of the given URL, and replaces
     * the top item on the platform's history stack.
     *
     * @param path  URL path to normalize.
     * @param query Query parameters.
     * @param state Location history state.
     */
    replaceState(path, query = '', state = null) {
        this._locationStrategy.replaceState(state, '', path, query);
        this._notifyUrlChangeListeners(this.prepareExternalUrl(path + normalizeQueryParams(query)), state);
    }
    /**
     * Navigates forward in the platform's history.
     */
    forward() {
        this._locationStrategy.forward();
    }
    /**
     * Navigates back in the platform's history.
     */
    back() {
        this._locationStrategy.back();
    }
    /**
     * Navigate to a specific page from session history, identified by its relative position to the
     * current page.
     *
     * @param relativePosition  Position of the target page in the history relative to the current
     *     page.
     * A negative value moves backwards, a positive value moves forwards, e.g. `location.historyGo(2)`
     * moves forward two pages and `location.historyGo(-2)` moves back two pages. When we try to go
     * beyond what's stored in the history session, we stay in the current page. Same behaviour occurs
     * when `relativePosition` equals 0.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/History_API#Moving_to_a_specific_point_in_history
     */
    historyGo(relativePosition = 0) {
        this._locationStrategy.historyGo?.(relativePosition);
    }
    /**
     * Registers a URL change listener. Use to catch updates performed by the Angular
     * framework that are not detectible through "popstate" or "hashchange" events.
     *
     * @param fn The change handler function, which take a URL and a location history state.
     * @returns A function that, when executed, unregisters a URL change listener.
     */
    onUrlChange(fn) {
        this._urlChangeListeners.push(fn);
        this._urlChangeSubscription ??= this.subscribe((v) => {
            this._notifyUrlChangeListeners(v.url, v.state);
        });
        return () => {
            const fnIndex = this._urlChangeListeners.indexOf(fn);
            this._urlChangeListeners.splice(fnIndex, 1);
            if (this._urlChangeListeners.length === 0) {
                this._urlChangeSubscription?.unsubscribe();
                this._urlChangeSubscription = null;
            }
        };
    }
    /** @internal */
    _notifyUrlChangeListeners(url = '', state) {
        this._urlChangeListeners.forEach((fn) => fn(url, state));
    }
    /**
     * Subscribes to the platform's `popState` events.
     *
     * Note: `Location.go()` does not trigger the `popState` event in the browser. Use
     * `Location.onUrlChange()` to subscribe to URL changes instead.
     *
     * @param value Event that is triggered when the state history changes.
     * @param exception The exception to throw.
     *
     * @see [onpopstate](https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onpopstate)
     *
     * @returns Subscribed events.
     */
    subscribe(onNext, onThrow, onReturn) {
        return this._subject.subscribe({ next: onNext, error: onThrow, complete: onReturn });
    }
    /**
     * Normalizes URL parameters by prepending with `?` if needed.
     *
     * @param  params String of URL parameters.
     *
     * @returns The normalized URL parameters string.
     */
    static { this.normalizeQueryParams = normalizeQueryParams; }
    /**
     * Joins two parts of a URL with a slash if needed.
     *
     * @param start  URL string
     * @param end    URL string
     *
     *
     * @returns The joined URL string.
     */
    static { this.joinWithSlash = joinWithSlash; }
    /**
     * Removes a trailing slash from a URL string if needed.
     * Looks for the first occurrence of either `#`, `?`, or the end of the
     * line as `/` characters and removes the trailing slash if one exists.
     *
     * @param url URL string.
     *
     * @returns The URL string, modified if needed.
     */
    static { this.stripTrailingSlash = stripTrailingSlash; }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: Location, deps: [{ token: i1.LocationStrategy }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: Location, providedIn: 'root', useFactory: createLocation }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: Location, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root',
                    // See #23917
                    useFactory: createLocation,
                }]
        }], ctorParameters: () => [{ type: i1.LocationStrategy }] });
export function createLocation() {
    return new Location(ɵɵinject(LocationStrategy));
}
function _stripBasePath(basePath, url) {
    if (!basePath || !url.startsWith(basePath)) {
        return url;
    }
    const strippedUrl = url.substring(basePath.length);
    if (strippedUrl === '' || ['/', ';', '?', '#'].includes(strippedUrl[0])) {
        return strippedUrl;
    }
    return url;
}
function _stripIndexHtml(url) {
    return url.replace(/\/index.html$/, '');
}
function _stripOrigin(baseHref) {
    // DO NOT REFACTOR! Previously, this check looked like this:
    // `/^(https?:)?\/\//.test(baseHref)`, but that resulted in
    // syntactically incorrect code after Closure Compiler minification.
    // This was likely caused by a bug in Closure Compiler, but
    // for now, the check is rewritten to use `new RegExp` instead.
    const isAbsoluteUrl = new RegExp('^(https?:)?//').test(baseHref);
    if (isAbsoluteUrl) {
        const [, pathname] = baseHref.split(/\/\/[^\/]+/);
        return pathname;
    }
    return baseHref;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2xvY2F0aW9uL2xvY2F0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxZQUFZLEVBQUUsVUFBVSxFQUFhLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUc1RSxPQUFPLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUNyRCxPQUFPLEVBQUMsYUFBYSxFQUFFLG9CQUFvQixFQUFFLGtCQUFrQixFQUFDLE1BQU0sUUFBUSxDQUFDOzs7QUFVL0U7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQTJCRztBQU1ILE1BQU0sT0FBTyxRQUFRO0lBWW5CLFlBQVksZ0JBQWtDO1FBWDlDLGdCQUFnQjtRQUNoQixhQUFRLEdBQXNCLElBQUksWUFBWSxFQUFFLENBQUM7UUFLakQsZ0JBQWdCO1FBQ2hCLHdCQUFtQixHQUE4QyxFQUFFLENBQUM7UUFDcEUsZ0JBQWdCO1FBQ2hCLDJCQUFzQixHQUE0QixJQUFJLENBQUM7UUFHckQsSUFBSSxDQUFDLGlCQUFpQixHQUFHLGdCQUFnQixDQUFDO1FBQzFDLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUN0RCxnRkFBZ0Y7UUFDaEYscUVBQXFFO1FBQ3JFLDhFQUE4RTtRQUM5RSwyRUFBMkU7UUFDM0UsWUFBWTtRQUNaLHNFQUFzRTtRQUN0RSxJQUFJLENBQUMsU0FBUyxHQUFHLFlBQVksQ0FBQyxrQkFBa0IsQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzdFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRTtZQUN2QyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQztnQkFD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QVc7SUFDbEMsT0FBTyxHQUFHLENBQUMsT0FBTyxDQUFDLGVBQWUsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUMxQyxDQUFDO0FBRUQsU0FBUyxZQUFZLENBQUMsUUFBZ0I7SUFDcEMsNERBQTREO0lBQzVELDJEQUEyRDtJQUMzRCxvRUFBb0U7SUFDcEUsMkRBQTJEO0lBQzNELCtEQUErRDtJQUMvRCxNQUFNLGFBQWEsR0FBRyxJQUFJLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDakUsSUFBSSxhQUFhLEVBQUUsQ0FBQztRQUNsQixNQUFNLENBQUMsRUFBRSxRQUFRLENBQUMsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ2xELE9BQU8sUUFBUSxDQUFDO0lBQ2xCLENBQUM7SUFDRCxPQUFPLFFBQVEsQ0FBQztBQUNsQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuZGV2L2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0V2ZW50RW1pdHRlciwgSW5qZWN0YWJsZSwgT25EZXN0cm95LCDJtcm1aW5qZWN0fSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7U3Vic2NyaXB0aW9uTGlrZX0gZnJvbSAncnhqcyc7XG5cbmltcG9ydCB7TG9jYXRpb25TdHJhdGVneX0gZnJvbSAnLi9sb2NhdGlvbl9zdHJhdGVneSc7XG5pbXBvcnQge2pvaW5XaXRoU2xhc2gsIG5vcm1hbGl6ZVF1ZXJ5UGFyYW1zLCBzdHJpcFRyYWlsaW5nU2xhc2h9IGZyb20gJy4vdXRpbCc7XG5cbi8qKiBAcHVibGljQXBpICovXG5leHBvcnQgaW50ZXJmYWNlIFBvcFN0YXRlRXZlbnQge1xuICBwb3A/OiBib29sZWFuO1xuICBzdGF0ZT86IGFueTtcbiAgdHlwZT86IHN0cmluZztcbiAgdXJsPzogc3RyaW5nO1xufVxuXG4vKipcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIEEgc2VydmljZSB0aGF0IGFwcGxpY2F0aW9ucyBjYW4gdXNlIHRvIGludGVyYWN0IHdpdGggYSBicm93c2VyJ3MgVVJMLlxuICpcbiAqIERlcGVuZGluZyBvbiB0aGUgYExvY2F0aW9uU3RyYXRlZ3lgIHVzZWQsIGBMb2NhdGlvbmAgcGVyc2lzdHNcbiAqIHRvIHRoZSBVUkwncyBwYXRoIG9yIHRoZSBVUkwncyBoYXNoIHNlZ21lbnQuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqXG4gKiBJdCdzIGJldHRlciB0byB1c2UgdGhlIGBSb3V0ZXIubmF2aWdhdGUoKWAgc2VydmljZSB0byB0cmlnZ2VyIHJvdXRlIGNoYW5nZXMuIFVzZVxuICogYExvY2F0aW9uYCBvbmx5IGlmIHlvdSBuZWVkIHRvIGludGVyYWN0IHdpdGggb3IgY3JlYXRlIG5vcm1hbGl6ZWQgVVJMcyBvdXRzaWRlIG9mXG4gKiByb3V0aW5nLlxuICpcbiAqIGBMb2NhdGlvbmAgaXMgcmVzcG9uc2libGUgZm9yIG5vcm1hbGl6aW5nIHRoZSBVUkwgYWdhaW5zdCB0aGUgYXBwbGljYXRpb24ncyBiYXNlIGhyZWYuXG4gKiBBIG5vcm1hbGl6ZWQgVVJMIGlzIGFic29sdXRlIGZyb20gdGhlIFVSTCBob3N0LCBpbmNsdWRlcyB0aGUgYXBwbGljYXRpb24ncyBiYXNlIGhyZWYsIGFuZCBoYXMgbm9cbiAqIHRyYWlsaW5nIHNsYXNoOlxuICogLSBgL215L2FwcC91c2VyLzEyM2AgaXMgbm9ybWFsaXplZFxuICogLSBgbXkvYXBwL3VzZXIvMTIzYCAqKmlzIG5vdCoqIG5vcm1hbGl6ZWRcbiAqIC0gYC9teS9hcHAvdXNlci8xMjMvYCAqKmlzIG5vdCoqIG5vcm1hbGl6ZWRcbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIDxjb2RlLWV4YW1wbGUgcGF0aD0nY29tbW9uL2xvY2F0aW9uL3RzL3BhdGhfbG9jYXRpb25fY29tcG9uZW50LnRzJ1xuICogcmVnaW9uPSdMb2NhdGlvbkNvbXBvbmVudCc+PC9jb2RlLWV4YW1wbGU+XG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5ASW5qZWN0YWJsZSh7XG4gIHByb3ZpZGVkSW46ICdyb290JyxcbiAgLy8gU2VlICMyMzkxN1xuICB1c2VGYWN0b3J5OiBjcmVhdGVMb2NhdGlvbixcbn0pXG5leHBvcnQgY2xhc3MgTG9jYXRpb24gaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xuICAvKiogQGludGVybmFsICovXG4gIF9zdWJqZWN0OiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfYmFzZVBhdGg6IHN0cmluZztcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfbG9jYXRpb25TdHJhdGVneTogTG9jYXRpb25TdHJhdGVneTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfdXJsQ2hhbmdlTGlzdGVuZXJzOiAoKHVybDogc3RyaW5nLCBzdGF0ZTogdW5rbm93bikgPT4gdm9pZClbXSA9IFtdO1xuICAvKiogQGludGVybmFsICovXG4gIF91cmxDaGFuZ2VTdWJzY3JpcHRpb246IFN1YnNjcmlwdGlvbkxpa2UgfCBudWxsID0gbnVsbDtcblxuICBjb25zdHJ1Y3Rvcihsb2NhdGlvblN0cmF0ZWd5OiBMb2NhdGlvblN0cmF0ZWd5KSB7XG4gICAgdGhpcy5fbG9jYXRpb25TdHJhdGVneSA9IGxvY2F0aW9uU3RyYXRlZ3k7XG4gICAgY29uc3QgYmFzZUhyZWYgPSB0aGlzLl9sb2NhdGlvblN0cmF0ZWd5LmdldEJhc2VIcmVmKCk7XG4gICAgLy8gTm90ZTogVGhpcyBjbGFzcydzIGludGVyYWN0aW9uIHdpdGggYmFzZSBIUkVGIGRvZXMgbm90IGZ1bGx5IGZvbGxvdyB0aGUgcnVsZXNcbiAgICAvLyBvdXRsaW5lZCBpbiB0aGUgc3BlYyBodHRwczovL3d3dy5mcmVlc29mdC5vcmcvQ0lFL1JGQy8xODA4LzE4Lmh0bS5cbiAgICAvLyBJbnN0ZWFkIG9mIHRyeWluZyB0byBmaXggaW5kaXZpZHVhbCBidWdzIHdpdGggbW9yZSBhbmQgbW9yZSBjb2RlLCB3ZSBzaG91bGRcbiAgICAvLyBpbnZlc3RpZ2F0ZSB1c2luZyB0aGUgVVJMIGNvbnN0cnVjdG9yIGFuZCBwcm92aWRpbmcgdGhlIGJhc2UgYXMgYSBzZWNvbmRcbiAgICAvLyBhcmd1bWVudC5cbiAgICAvLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvVVJML1VSTCNwYXJhbWV0ZXJzXG4gICAgdGhpcy5fYmFzZVBhdGggPSBfc3RyaXBPcmlnaW4oc3RyaXBUcmFpbGluZ1NsYXNoKF9zdHJpcEluZGV4SHRtbChiYXNlSHJlZikpKTtcbiAgICB0aGlzLl9sb2NhdGlvblN0cmF0ZWd5Lm9uUG9wU3RhdGUoKGV2KSA9PiB7XG4gICAgICB0aGlzLl9zdWJqZWN0LmVtaXQoe1xuICAgICAgICAndXJsJzogdGhpcy5wYXRoKHRydWUpLFxuICAgICAgICAncG9wJzogdHJ1ZSxcbiAgICAgICAgJ3N0YXRlJzogZXYuc3RhdGUsXG4gICAgICAgICd0eXBlJzogZXYudHlwZSxcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqIEBub2RvYyAqL1xuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLl91cmxDaGFuZ2VTdWJzY3JpcHRpb24/LnVuc3Vic2NyaWJlKCk7XG4gICAgdGhpcy5fdXJsQ2hhbmdlTGlzdGVuZXJzID0gW107XG4gIH1cblxuICAvKipcbiAgICogTm9ybWFsaXplcyB0aGUgVVJMIHBhdGggZm9yIHRoaXMgbG9jYXRpb24uXG4gICAqXG4gICAqIEBwYXJhbSBpbmNsdWRlSGFzaCBUcnVlIHRvIGluY2x1ZGUgYW4gYW5jaG9yIGZyYWdtZW50IGluIHRoZSBwYXRoLlxuICAgKlxuICAgKiBAcmV0dXJucyBUaGUgbm9ybWFsaXplZCBVUkwgcGF0aC5cbiAgICovXG4gIC8vIFRPRE86IHZzYXZraW4uIFJlbW92ZSB0aGUgYm9vbGVhbiBmbGFnIGFuZCBhbHdheXMgaW5jbHVkZSBoYXNoIG9uY2UgdGhlIGRlcHJlY2F0ZWQgcm91dGVyIGlzXG4gIC8vIHJlbW92ZWQuXG4gIHBhdGgoaW5jbHVkZUhhc2g6IGJvb2xlYW4gPSBmYWxzZSk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMubm9ybWFsaXplKHRoaXMuX2xvY2F0aW9uU3RyYXRlZ3kucGF0aChpbmNsdWRlSGFzaCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlcG9ydHMgdGhlIGN1cnJlbnQgc3RhdGUgb2YgdGhlIGxvY2F0aW9uIGhpc3RvcnkuXG4gICAqIEByZXR1cm5zIFRoZSBjdXJyZW50IHZhbHVlIG9mIHRoZSBgaGlzdG9yeS5zdGF0ZWAgb2JqZWN0LlxuICAgKi9cbiAgZ2V0U3RhdGUoKTogdW5rbm93biB7XG4gICAgcmV0dXJuIHRoaXMuX2xvY2F0aW9uU3RyYXRlZ3kuZ2V0U3RhdGUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBOb3JtYWxpemVzIHRoZSBnaXZlbiBwYXRoIGFuZCBjb21wYXJlcyB0byB0aGUgY3VycmVudCBub3JtYWxpemVkIHBhdGguXG4gICAqXG4gICAqIEBwYXJhbSBwYXRoIFRoZSBnaXZlbiBVUkwgcGF0aC5cbiAgICogQHBhcmFtIHF1ZXJ5IFF1ZXJ5IHBhcmFtZXRlcnMuXG4gICAqXG4gICAqIEByZXR1cm5zIFRydWUgaWYgdGhlIGdpdmVuIFVSTCBwYXRoIGlzIGVxdWFsIHRvIHRoZSBjdXJyZW50IG5vcm1hbGl6ZWQgcGF0aCwgZmFsc2VcbiAgICogb3RoZXJ3aXNlLlxuICAgKi9cbiAgaXNDdXJyZW50UGF0aEVxdWFsVG8ocGF0aDogc3RyaW5nLCBxdWVyeTogc3RyaW5nID0gJycpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5wYXRoKCkgPT0gdGhpcy5ub3JtYWxpemUocGF0aCArIG5vcm1hbGl6ZVF1ZXJ5UGFyYW1zKHF1ZXJ5KSk7XG4gIH1cblxuICAvKipcbiAgICogTm9ybWFsaXplcyBhIFVSTCBwYXRoIGJ5IHN0cmlwcGluZyBhbnkgdHJhaWxpbmcgc2xhc2hlcy5cbiAgICpcbiAgICogQHBhcmFtIHVybCBTdHJpbmcgcmVwcmVzZW50aW5nIGEgVVJMLlxuICAgKlxuICAgKiBAcmV0dXJucyBUaGUgbm9ybWFsaXplZCBVUkwgc3RyaW5nLlxuICAgKi9cbiAgbm9ybWFsaXplKHVybDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gTG9jYXRpb24uc3RyaXBUcmFpbGluZ1NsYXNoKF9zdHJpcEJhc2VQYXRoKHRoaXMuX2Jhc2VQYXRoLCBfc3RyaXBJbmRleEh0bWwodXJsKSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIE5vcm1hbGl6ZXMgYW4gZXh0ZXJuYWwgVVJMIHBhdGguXG4gICAqIElmIHRoZSBnaXZlbiBVUkwgZG9lc24ndCBiZWdpbiB3aXRoIGEgbGVhZGluZyBzbGFzaCAoYCcvJ2ApLCBhZGRzIG9uZVxuICAgKiBiZWZvcmUgbm9ybWFsaXppbmcuIEFkZHMgYSBoYXNoIGlmIGBIYXNoTG9jYXRpb25TdHJhdGVneWAgaXNcbiAgICogaW4gdXNlLCBvciB0aGUgYEFQUF9CQVNFX0hSRUZgIGlmIHRoZSBgUGF0aExvY2F0aW9uU3RyYXRlZ3lgIGlzIGluIHVzZS5cbiAgICpcbiAgICogQHBhcmFtIHVybCBTdHJpbmcgcmVwcmVzZW50aW5nIGEgVVJMLlxuICAgKlxuICAgKiBAcmV0dXJucyAgQSBub3JtYWxpemVkIHBsYXRmb3JtLXNwZWNpZmljIFVSTC5cbiAgICovXG4gIHByZXBhcmVFeHRlcm5hbFVybCh1cmw6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgaWYgKHVybCAmJiB1cmxbMF0gIT09ICcvJykge1xuICAgICAgdXJsID0gJy8nICsgdXJsO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fbG9jYXRpb25TdHJhdGVneS5wcmVwYXJlRXh0ZXJuYWxVcmwodXJsKTtcbiAgfVxuXG4gIC8vIFRPRE86IHJlbmFtZSB0aGlzIG1ldGhvZCB0byBwdXNoU3RhdGVcbiAgLyoqXG4gICAqIENoYW5nZXMgdGhlIGJyb3dzZXIncyBVUkwgdG8gYSBub3JtYWxpemVkIHZlcnNpb24gb2YgYSBnaXZlbiBVUkwsIGFuZCBwdXNoZXMgYVxuICAgKiBuZXcgaXRlbSBvbnRvIHRoZSBwbGF0Zm9ybSdzIGhpc3RvcnkuXG4gICAqXG4gICAqIEBwYXJhbSBwYXRoICBVUkwgcGF0aCB0byBub3JtYWxpemUuXG4gICAqIEBwYXJhbSBxdWVyeSBRdWVyeSBwYXJhbWV0ZXJzLlxuICAgKiBAcGFyYW0gc3RhdGUgTG9jYXRpb24gaGlzdG9yeSBzdGF0ZS5cbiAgICpcbiAgICovXG4gIGdvKHBhdGg6IHN0cmluZywgcXVlcnk6IHN0cmluZyA9ICcnLCBzdGF0ZTogYW55ID0gbnVsbCk6IHZvaWQge1xuICAgIHRoaXMuX2xvY2F0aW9uU3RyYXRlZ3kucHVzaFN0YXRlKHN0YXRlLCAnJywgcGF0aCwgcXVlcnkpO1xuICAgIHRoaXMuX25vdGlmeVVybENoYW5nZUxpc3RlbmVycyhcbiAgICAgIHRoaXMucHJlcGFyZUV4dGVybmFsVXJsKHBhdGggKyBub3JtYWxpemVRdWVyeVBhcmFtcyhxdWVyeSkpLFxuICAgICAgc3RhdGUsXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGFuZ2VzIHRoZSBicm93c2VyJ3MgVVJMIHRvIGEgbm9ybWFsaXplZCB2ZXJzaW9uIG9mIHRoZSBnaXZlbiBVUkwsIGFuZCByZXBsYWNlc1xuICAgKiB0aGUgdG9wIGl0ZW0gb24gdGhlIHBsYXRmb3JtJ3MgaGlzdG9yeSBzdGFjay5cbiAgICpcbiAgICogQHBhcmFtIHBhdGggIFVSTCBwYXRoIHRvIG5vcm1hbGl6ZS5cbiAgICogQHBhcmFtIHF1ZXJ5IFF1ZXJ5IHBhcmFtZXRlcnMuXG4gICAqIEBwYXJhbSBzdGF0ZSBMb2NhdGlvbiBoaXN0b3J5IHN0YXRlLlxuICAgKi9cbiAgcmVwbGFjZVN0YXRlKHBhdGg6IHN0cmluZywgcXVlcnk6IHN0cmluZyA9ICcnLCBzdGF0ZTogYW55ID0gbnVsbCk6IHZvaWQge1xuICAgIHRoaXMuX2xvY2F0aW9uU3RyYXRlZ3kucmVwbGFjZVN0YXRlKHN0YXRlLCAnJywgcGF0aCwgcXVlcnkpO1xuICAgIHRoaXMuX25vdGlmeVVybENoYW5nZUxpc3RlbmVycyhcbiAgICAgIHRoaXMucHJlcGFyZUV4dGVybmFsVXJsKHBhdGggKyBub3JtYWxpemVRdWVyeVBhcmFtcyhxdWVyeSkpLFxuICAgICAgc3RhdGUsXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBOYXZpZ2F0ZXMgZm9yd2FyZCBpbiB0aGUgcGxhdGZvcm0ncyBoaXN0b3J5LlxuICAgKi9cbiAgZm9yd2FyZCgpOiB2b2lkIHtcbiAgICB0aGlzLl9sb2NhdGlvblN0cmF0ZWd5LmZvcndhcmQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBOYXZpZ2F0ZXMgYmFjayBpbiB0aGUgcGxhdGZvcm0ncyBoaXN0b3J5LlxuICAgKi9cbiAgYmFjaygpOiB2b2lkIHtcbiAgICB0aGlzLl9sb2NhdGlvblN0cmF0ZWd5LmJhY2soKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBOYXZpZ2F0ZSB0byBhIHNwZWNpZmljIHBhZ2UgZnJvbSBzZXNzaW9uIGhpc3RvcnksIGlkZW50aWZpZWQgYnkgaXRzIHJlbGF0aXZlIHBvc2l0aW9uIHRvIHRoZVxuICAgKiBjdXJyZW50IHBhZ2UuXG4gICAqXG4gICAqIEBwYXJhbSByZWxhdGl2ZVBvc2l0aW9uICBQb3NpdGlvbiBvZiB0aGUgdGFyZ2V0IHBhZ2UgaW4gdGhlIGhpc3RvcnkgcmVsYXRpdmUgdG8gdGhlIGN1cnJlbnRcbiAgICogICAgIHBhZ2UuXG4gICAqIEEgbmVnYXRpdmUgdmFsdWUgbW92ZXMgYmFja3dhcmRzLCBhIHBvc2l0aXZlIHZhbHVlIG1vdmVzIGZvcndhcmRzLCBlLmcuIGBsb2NhdGlvbi5oaXN0b3J5R28oMilgXG4gICAqIG1vdmVzIGZvcndhcmQgdHdvIHBhZ2VzIGFuZCBgbG9jYXRpb24uaGlzdG9yeUdvKC0yKWAgbW92ZXMgYmFjayB0d28gcGFnZXMuIFdoZW4gd2UgdHJ5IHRvIGdvXG4gICAqIGJleW9uZCB3aGF0J3Mgc3RvcmVkIGluIHRoZSBoaXN0b3J5IHNlc3Npb24sIHdlIHN0YXkgaW4gdGhlIGN1cnJlbnQgcGFnZS4gU2FtZSBiZWhhdmlvdXIgb2NjdXJzXG4gICAqIHdoZW4gYHJlbGF0aXZlUG9zaXRpb25gIGVxdWFscyAwLlxuICAgKiBAc2VlIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9IaXN0b3J5X0FQSSNNb3ZpbmdfdG9fYV9zcGVjaWZpY19wb2ludF9pbl9oaXN0b3J5XG4gICAqL1xuICBoaXN0b3J5R28ocmVsYXRpdmVQb3NpdGlvbjogbnVtYmVyID0gMCk6IHZvaWQge1xuICAgIHRoaXMuX2xvY2F0aW9uU3RyYXRlZ3kuaGlzdG9yeUdvPy4ocmVsYXRpdmVQb3NpdGlvbik7XG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXJzIGEgVVJMIGNoYW5nZSBsaXN0ZW5lci4gVXNlIHRvIGNhdGNoIHVwZGF0ZXMgcGVyZm9ybWVkIGJ5IHRoZSBBbmd1bGFyXG4gICAqIGZyYW1ld29yayB0aGF0IGFyZSBub3QgZGV0ZWN0aWJsZSB0aHJvdWdoIFwicG9wc3RhdGVcIiBvciBcImhhc2hjaGFuZ2VcIiBldmVudHMuXG4gICAqXG4gICAqIEBwYXJhbSBmbiBUaGUgY2hhbmdlIGhhbmRsZXIgZnVuY3Rpb24sIHdoaWNoIHRha2UgYSBVUkwgYW5kIGEgbG9jYXRpb24gaGlzdG9yeSBzdGF0ZS5cbiAgICogQHJldHVybnMgQSBmdW5jdGlvbiB0aGF0LCB3aGVuIGV4ZWN1dGVkLCB1bnJlZ2lzdGVycyBhIFVSTCBjaGFuZ2UgbGlzdGVuZXIuXG4gICAqL1xuICBvblVybENoYW5nZShmbjogKHVybDogc3RyaW5nLCBzdGF0ZTogdW5rbm93bikgPT4gdm9pZCk6IFZvaWRGdW5jdGlvbiB7XG4gICAgdGhpcy5fdXJsQ2hhbmdlTGlzdGVuZXJzLnB1c2goZm4pO1xuXG4gICAgdGhpcy5fdXJsQ2hhbmdlU3Vic2NyaXB0aW9uID8/PSB0aGlzLnN1YnNjcmliZSgodikgPT4ge1xuICAgICAgdGhpcy5fbm90aWZ5VXJsQ2hhbmdlTGlzdGVuZXJzKHYudXJsLCB2LnN0YXRlKTtcbiAgICB9KTtcblxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBjb25zdCBmbkluZGV4ID0gdGhpcy5fdXJsQ2hhbmdlTGlzdGVuZXJzLmluZGV4T2YoZm4pO1xuICAgICAgdGhpcy5fdXJsQ2hhbmdlTGlzdGVuZXJzLnNwbGljZShmbkluZGV4LCAxKTtcblxuICAgICAgaWYgKHRoaXMuX3VybENoYW5nZUxpc3RlbmVycy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgdGhpcy5fdXJsQ2hhbmdlU3Vic2NyaXB0aW9uPy51bnN1YnNjcmliZSgpO1xuICAgICAgICB0aGlzLl91cmxDaGFuZ2VTdWJzY3JpcHRpb24gPSBudWxsO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9ub3RpZnlVcmxDaGFuZ2VMaXN0ZW5lcnModXJsOiBzdHJpbmcgPSAnJywgc3RhdGU6IHVua25vd24pIHtcbiAgICB0aGlzLl91cmxDaGFuZ2VMaXN0ZW5lcnMuZm9yRWFjaCgoZm4pID0+IGZuKHVybCwgc3RhdGUpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdWJzY3JpYmVzIHRvIHRoZSBwbGF0Zm9ybSdzIGBwb3BTdGF0ZWAgZXZlbnRzLlxuICAgKlxuICAgKiBOb3RlOiBgTG9jYXRpb24uZ28oKWAgZG9lcyBub3QgdHJpZ2dlciB0aGUgYHBvcFN0YXRlYCBldmVudCBpbiB0aGUgYnJvd3Nlci4gVXNlXG4gICAqIGBMb2NhdGlvbi5vblVybENoYW5nZSgpYCB0byBzdWJzY3JpYmUgdG8gVVJMIGNoYW5nZXMgaW5zdGVhZC5cbiAgICpcbiAgICogQHBhcmFtIHZhbHVlIEV2ZW50IHRoYXQgaXMgdHJpZ2dlcmVkIHdoZW4gdGhlIHN0YXRlIGhpc3RvcnkgY2hhbmdlcy5cbiAgICogQHBhcmFtIGV4Y2VwdGlvbiBUaGUgZXhjZXB0aW9uIHRvIHRocm93LlxuICAgKlxuICAgKiBAc2VlIFtvbnBvcHN0YXRlXShodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvV2luZG93RXZlbnRIYW5kbGVycy9vbnBvcHN0YXRlKVxuICAgKlxuICAgKiBAcmV0dXJucyBTdWJzY3JpYmVkIGV2ZW50cy5cbiAgICovXG4gIHN1YnNjcmliZShcbiAgICBvbk5leHQ6ICh2YWx1ZTogUG9wU3RhdGVFdmVudCkgPT4gdm9pZCxcbiAgICBvblRocm93PzogKChleGNlcHRpb246IGFueSkgPT4gdm9pZCkgfCBudWxsLFxuICAgIG9uUmV0dXJuPzogKCgpID0+IHZvaWQpIHwgbnVsbCxcbiAgKTogU3Vic2NyaXB0aW9uTGlrZSB7XG4gICAgcmV0dXJuIHRoaXMuX3N1YmplY3Quc3Vic2NyaWJlKHtuZXh0OiBvbk5leHQsIGVycm9yOiBvblRocm93LCBjb21wbGV0ZTogb25SZXR1cm59KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBOb3JtYWxpemVzIFVSTCBwYXJhbWV0ZXJzIGJ5IHByZXBlbmRpbmcgd2l0aCBgP2AgaWYgbmVlZGVkLlxuICAgKlxuICAgKiBAcGFyYW0gIHBhcmFtcyBTdHJpbmcgb2YgVVJMIHBhcmFtZXRlcnMuXG4gICAqXG4gICAqIEByZXR1cm5zIFRoZSBub3JtYWxpemVkIFVSTCBwYXJhbWV0ZXJzIHN0cmluZy5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgbm9ybWFsaXplUXVlcnlQYXJhbXM6IChwYXJhbXM6IHN0cmluZykgPT4gc3RyaW5nID0gbm9ybWFsaXplUXVlcnlQYXJhbXM7XG5cbiAgLyoqXG4gICAqIEpvaW5zIHR3byBwYXJ0cyBvZiBhIFVSTCB3aXRoIGEgc2xhc2ggaWYgbmVlZGVkLlxuICAgKlxuICAgKiBAcGFyYW0gc3RhcnQgIFVSTCBzdHJpbmdcbiAgICogQHBhcmFtIGVuZCAgICBVUkwgc3RyaW5nXG4gICAqXG4gICAqXG4gICAqIEByZXR1cm5zIFRoZSBqb2luZWQgVVJMIHN0cmluZy5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgam9pbldpdGhTbGFzaDogKHN0YXJ0OiBzdHJpbmcsIGVuZDogc3RyaW5nKSA9PiBzdHJpbmcgPSBqb2luV2l0aFNsYXNoO1xuXG4gIC8qKlxuICAgKiBSZW1vdmVzIGEgdHJhaWxpbmcgc2xhc2ggZnJvbSBhIFVSTCBzdHJpbmcgaWYgbmVlZGVkLlxuICAgKiBMb29rcyBmb3IgdGhlIGZpcnN0IG9jY3VycmVuY2Ugb2YgZWl0aGVyIGAjYCwgYD9gLCBvciB0aGUgZW5kIG9mIHRoZVxuICAgKiBsaW5lIGFzIGAvYCBjaGFyYWN0ZXJzIGFuZCByZW1vdmVzIHRoZSB0cmFpbGluZyBzbGFzaCBpZiBvbmUgZXhpc3RzLlxuICAgKlxuICAgKiBAcGFyYW0gdXJsIFVSTCBzdHJpbmcuXG4gICAqXG4gICAqIEByZXR1cm5zIFRoZSBVUkwgc3RyaW5nLCBtb2RpZmllZCBpZiBuZWVkZWQuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHN0cmlwVHJhaWxpbmdTbGFzaDogKHVybDogc3RyaW5nKSA9PiBzdHJpbmcgPSBzdHJpcFRyYWlsaW5nU2xhc2g7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVMb2NhdGlvbigpIHtcbiAgcmV0dXJuIG5ldyBMb2NhdGlvbijJtcm1aW5qZWN0KExvY2F0aW9uU3RyYXRlZ3kgYXMgYW55KSk7XG59XG5cbmZ1bmN0aW9uIF9zdHJpcEJhc2VQYXRoKGJhc2VQYXRoOiBzdHJpbmcsIHVybDogc3RyaW5nKTogc3RyaW5nIHtcbiAgaWYgKCFiYXNlUGF0aCB8fCAhdXJsLnN0YXJ0c1dpdGgoYmFzZVBhdGgpKSB7XG4gICAgcmV0dXJuIHVybDtcbiAgfVxuICBjb25zdCBzdHJpcHBlZFVybCA9IHVybC5zdWJzdHJpbmcoYmFzZVBhdGgubGVuZ3RoKTtcbiAgaWYgKHN0cmlwcGVkVXJsID09PSAnJyB8fCBbJy8nLCAnOycsICc/JywgJyMnXS5pbmNsdWRlcyhzdHJpcHBlZFVybFswXSkpIHtcbiAgICByZXR1cm4gc3RyaXBwZWRVcmw7XG4gIH1cbiAgcmV0dXJuIHVybDtcbn1cblxuZnVuY3Rpb24gX3N0cmlwSW5kZXhIdG1sKHVybDogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHVybC5yZXBsYWNlKC9cXC9pbmRleC5odG1sJC8sICcnKTtcbn1cblxuZnVuY3Rpb24gX3N0cmlwT3JpZ2luKGJhc2VIcmVmOiBzdHJpbmcpOiBzdHJpbmcge1xuICAvLyBETyBOT1QgUkVGQUNUT1IhIFByZXZpb3VzbHksIHRoaXMgY2hlY2sgbG9va2VkIGxpa2UgdGhpczpcbiAgLy8gYC9eKGh0dHBzPzopP1xcL1xcLy8udGVzdChiYXNlSHJlZilgLCBidXQgdGhhdCByZXN1bHRlZCBpblxuICAvLyBzeW50YWN0aWNhbGx5IGluY29ycmVjdCBjb2RlIGFmdGVyIENsb3N1cmUgQ29tcGlsZXIgbWluaWZpY2F0aW9uLlxuICAvLyBUaGlzIHdhcyBsaWtlbHkgY2F1c2VkIGJ5IGEgYnVnIGluIENsb3N1cmUgQ29tcGlsZXIsIGJ1dFxuICAvLyBmb3Igbm93LCB0aGUgY2hlY2sgaXMgcmV3cml0dGVuIHRvIHVzZSBgbmV3IFJlZ0V4cGAgaW5zdGVhZC5cbiAgY29uc3QgaXNBYnNvbHV0ZVVybCA9IG5ldyBSZWdFeHAoJ14oaHR0cHM/Oik/Ly8nKS50ZXN0KGJhc2VIcmVmKTtcbiAgaWYgKGlzQWJzb2x1dGVVcmwpIHtcbiAgICBjb25zdCBbLCBwYXRobmFtZV0gPSBiYXNlSHJlZi5zcGxpdCgvXFwvXFwvW15cXC9dKy8pO1xuICAgIHJldHVybiBwYXRobmFtZTtcbiAgfVxuICByZXR1cm4gYmFzZUhyZWY7XG59XG4iXX0=