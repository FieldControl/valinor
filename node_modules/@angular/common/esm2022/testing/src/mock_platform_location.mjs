/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { DOCUMENT, ɵPlatformNavigation as PlatformNavigation, } from '@angular/common';
import { Inject, inject, Injectable, InjectionToken, Optional } from '@angular/core';
import { Subject } from 'rxjs';
import { FakeNavigation } from './navigation/fake_navigation';
import * as i0 from "@angular/core";
/**
 * Parser from https://tools.ietf.org/html/rfc3986#appendix-B
 * ^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?
 *  12            3  4          5       6  7        8 9
 *
 * Example: http://www.ics.uci.edu/pub/ietf/uri/#Related
 *
 * Results in:
 *
 * $1 = http:
 * $2 = http
 * $3 = //www.ics.uci.edu
 * $4 = www.ics.uci.edu
 * $5 = /pub/ietf/uri/
 * $6 = <undefined>
 * $7 = <undefined>
 * $8 = #Related
 * $9 = Related
 */
const urlParse = /^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/;
function parseUrl(urlStr, baseHref) {
    const verifyProtocol = /^((http[s]?|ftp):\/\/)/;
    let serverBase;
    // URL class requires full URL. If the URL string doesn't start with protocol, we need to add
    // an arbitrary base URL which can be removed afterward.
    if (!verifyProtocol.test(urlStr)) {
        serverBase = 'http://empty.com/';
    }
    let parsedUrl;
    try {
        parsedUrl = new URL(urlStr, serverBase);
    }
    catch (e) {
        const result = urlParse.exec(serverBase || '' + urlStr);
        if (!result) {
            throw new Error(`Invalid URL: ${urlStr} with base: ${baseHref}`);
        }
        const hostSplit = result[4].split(':');
        parsedUrl = {
            protocol: result[1],
            hostname: hostSplit[0],
            port: hostSplit[1] || '',
            pathname: result[5],
            search: result[6],
            hash: result[8],
        };
    }
    if (parsedUrl.pathname && parsedUrl.pathname.indexOf(baseHref) === 0) {
        parsedUrl.pathname = parsedUrl.pathname.substring(baseHref.length);
    }
    return {
        hostname: (!serverBase && parsedUrl.hostname) || '',
        protocol: (!serverBase && parsedUrl.protocol) || '',
        port: (!serverBase && parsedUrl.port) || '',
        pathname: parsedUrl.pathname || '/',
        search: parsedUrl.search || '',
        hash: parsedUrl.hash || '',
    };
}
/**
 * Provider for mock platform location config
 *
 * @publicApi
 */
export const MOCK_PLATFORM_LOCATION_CONFIG = new InjectionToken('MOCK_PLATFORM_LOCATION_CONFIG');
/**
 * Mock implementation of URL state.
 *
 * @publicApi
 */
export class MockPlatformLocation {
    constructor(config) {
        this.baseHref = '';
        this.hashUpdate = new Subject();
        this.popStateSubject = new Subject();
        this.urlChangeIndex = 0;
        this.urlChanges = [{ hostname: '', protocol: '', port: '', pathname: '/', search: '', hash: '', state: null }];
        if (config) {
            this.baseHref = config.appBaseHref || '';
            const parsedChanges = this.parseChanges(null, config.startUrl || 'http://_empty_/', this.baseHref);
            this.urlChanges[0] = { ...parsedChanges };
        }
    }
    get hostname() {
        return this.urlChanges[this.urlChangeIndex].hostname;
    }
    get protocol() {
        return this.urlChanges[this.urlChangeIndex].protocol;
    }
    get port() {
        return this.urlChanges[this.urlChangeIndex].port;
    }
    get pathname() {
        return this.urlChanges[this.urlChangeIndex].pathname;
    }
    get search() {
        return this.urlChanges[this.urlChangeIndex].search;
    }
    get hash() {
        return this.urlChanges[this.urlChangeIndex].hash;
    }
    get state() {
        return this.urlChanges[this.urlChangeIndex].state;
    }
    getBaseHrefFromDOM() {
        return this.baseHref;
    }
    onPopState(fn) {
        const subscription = this.popStateSubject.subscribe(fn);
        return () => subscription.unsubscribe();
    }
    onHashChange(fn) {
        const subscription = this.hashUpdate.subscribe(fn);
        return () => subscription.unsubscribe();
    }
    get href() {
        let url = `${this.protocol}//${this.hostname}${this.port ? ':' + this.port : ''}`;
        url += `${this.pathname === '/' ? '' : this.pathname}${this.search}${this.hash}`;
        return url;
    }
    get url() {
        return `${this.pathname}${this.search}${this.hash}`;
    }
    parseChanges(state, url, baseHref = '') {
        // When the `history.state` value is stored, it is always copied.
        state = JSON.parse(JSON.stringify(state));
        return { ...parseUrl(url, baseHref), state };
    }
    replaceState(state, title, newUrl) {
        const { pathname, search, state: parsedState, hash } = this.parseChanges(state, newUrl);
        this.urlChanges[this.urlChangeIndex] = {
            ...this.urlChanges[this.urlChangeIndex],
            pathname,
            search,
            hash,
            state: parsedState,
        };
    }
    pushState(state, title, newUrl) {
        const { pathname, search, state: parsedState, hash } = this.parseChanges(state, newUrl);
        if (this.urlChangeIndex > 0) {
            this.urlChanges.splice(this.urlChangeIndex + 1);
        }
        this.urlChanges.push({
            ...this.urlChanges[this.urlChangeIndex],
            pathname,
            search,
            hash,
            state: parsedState,
        });
        this.urlChangeIndex = this.urlChanges.length - 1;
    }
    forward() {
        const oldUrl = this.url;
        const oldHash = this.hash;
        if (this.urlChangeIndex < this.urlChanges.length) {
            this.urlChangeIndex++;
        }
        this.emitEvents(oldHash, oldUrl);
    }
    back() {
        const oldUrl = this.url;
        const oldHash = this.hash;
        if (this.urlChangeIndex > 0) {
            this.urlChangeIndex--;
        }
        this.emitEvents(oldHash, oldUrl);
    }
    historyGo(relativePosition = 0) {
        const oldUrl = this.url;
        const oldHash = this.hash;
        const nextPageIndex = this.urlChangeIndex + relativePosition;
        if (nextPageIndex >= 0 && nextPageIndex < this.urlChanges.length) {
            this.urlChangeIndex = nextPageIndex;
        }
        this.emitEvents(oldHash, oldUrl);
    }
    getState() {
        return this.state;
    }
    /**
     * Browsers are inconsistent in when they fire events and perform the state updates
     * The most easiest thing to do in our mock is synchronous and that happens to match
     * Firefox and Chrome, at least somewhat closely
     *
     * https://github.com/WICG/navigation-api#watching-for-navigations
     * https://docs.google.com/document/d/1Pdve-DJ1JCGilj9Yqf5HxRJyBKSel5owgOvUJqTauwU/edit#heading=h.3ye4v71wsz94
     * popstate is always sent before hashchange:
     * https://developer.mozilla.org/en-US/docs/Web/API/Window/popstate_event#when_popstate_is_sent
     */
    emitEvents(oldHash, oldUrl) {
        this.popStateSubject.next({
            type: 'popstate',
            state: this.getState(),
            oldUrl,
            newUrl: this.url,
        });
        if (oldHash !== this.hash) {
            this.hashUpdate.next({
                type: 'hashchange',
                state: null,
                oldUrl,
                newUrl: this.url,
            });
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: MockPlatformLocation, deps: [{ token: MOCK_PLATFORM_LOCATION_CONFIG, optional: true }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: MockPlatformLocation }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: MockPlatformLocation, decorators: [{
            type: Injectable
        }], ctorParameters: () => [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [MOCK_PLATFORM_LOCATION_CONFIG]
                }, {
                    type: Optional
                }] }] });
/**
 * Mock implementation of URL state.
 */
export class FakeNavigationPlatformLocation {
    constructor() {
        this._platformNavigation = inject(PlatformNavigation);
        this.window = inject(DOCUMENT).defaultView;
        this.config = inject(MOCK_PLATFORM_LOCATION_CONFIG, { optional: true });
        if (!(this._platformNavigation instanceof FakeNavigation)) {
            throw new Error('FakePlatformNavigation cannot be used without FakeNavigation. Use ' +
                '`provideFakeNavigation` to have all these services provided together.');
        }
    }
    getBaseHrefFromDOM() {
        return this.config?.appBaseHref ?? '';
    }
    onPopState(fn) {
        this.window.addEventListener('popstate', fn);
        return () => this.window.removeEventListener('popstate', fn);
    }
    onHashChange(fn) {
        this.window.addEventListener('hashchange', fn);
        return () => this.window.removeEventListener('hashchange', fn);
    }
    get href() {
        return this._platformNavigation.currentEntry.url;
    }
    get protocol() {
        return new URL(this._platformNavigation.currentEntry.url).protocol;
    }
    get hostname() {
        return new URL(this._platformNavigation.currentEntry.url).hostname;
    }
    get port() {
        return new URL(this._platformNavigation.currentEntry.url).port;
    }
    get pathname() {
        return new URL(this._platformNavigation.currentEntry.url).pathname;
    }
    get search() {
        return new URL(this._platformNavigation.currentEntry.url).search;
    }
    get hash() {
        return new URL(this._platformNavigation.currentEntry.url).hash;
    }
    pushState(state, title, url) {
        this._platformNavigation.pushState(state, title, url);
    }
    replaceState(state, title, url) {
        this._platformNavigation.replaceState(state, title, url);
    }
    forward() {
        this._platformNavigation.forward();
    }
    back() {
        this._platformNavigation.back();
    }
    historyGo(relativePosition = 0) {
        this._platformNavigation.go(relativePosition);
    }
    getState() {
        return this._platformNavigation.currentEntry.getHistoryState();
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: FakeNavigationPlatformLocation, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: FakeNavigationPlatformLocation }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: FakeNavigationPlatformLocation, decorators: [{
            type: Injectable
        }], ctorParameters: () => [] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9ja19wbGF0Zm9ybV9sb2NhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi90ZXN0aW5nL3NyYy9tb2NrX3BsYXRmb3JtX2xvY2F0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFDTCxRQUFRLEVBSVIsbUJBQW1CLElBQUksa0JBQWtCLEdBQzFDLE1BQU0saUJBQWlCLENBQUM7QUFDekIsT0FBTyxFQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLGNBQWMsRUFBRSxRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDbkYsT0FBTyxFQUFDLE9BQU8sRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUU3QixPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sOEJBQThCLENBQUM7O0FBRTVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FrQkc7QUFDSCxNQUFNLFFBQVEsR0FBRywrREFBK0QsQ0FBQztBQUVqRixTQUFTLFFBQVEsQ0FBQyxNQUFjLEVBQUUsUUFBZ0I7SUFDaEQsTUFBTSxjQUFjLEdBQUcsd0JBQXdCLENBQUM7SUFDaEQsSUFBSSxVQUE4QixDQUFDO0lBRW5DLDZGQUE2RjtJQUM3Rix3REFBd0Q7SUFDeEQsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztRQUNqQyxVQUFVLEdBQUcsbUJBQW1CLENBQUM7SUFDbkMsQ0FBQztJQUNELElBQUksU0FPSCxDQUFDO0lBQ0YsSUFBSSxDQUFDO1FBQ0gsU0FBUyxHQUFHLElBQUksR0FBRyxDQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsQ0FBQztJQUMxQyxDQUFDO0lBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztRQUNYLE1BQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsVUFBVSxJQUFJLEVBQUUsR0FBRyxNQUFNLENBQUMsQ0FBQztR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QUFJLENBQUMsTUFBTSxDQUFDLG1CQUFtQixDQUFDLFlBQVksRUFBRSxFQUFTLENBQUMsQ0FBQztJQUN4RSxDQUFDO0lBRUQsSUFBSSxJQUFJO1FBQ04sT0FBTyxJQUFJLENBQUMsbUJBQW1CLENBQUMsWUFBWSxDQUFDLEdBQUksQ0FBQztJQUNwRCxDQUFDO0lBQ0QsSUFBSSxRQUFRO1FBQ1YsT0FBTyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsWUFBWSxDQUFDLEdBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQztJQUN0RSxDQUFDO0lBQ0QsSUFBSSxRQUFRO1FBQ1YsT0FBTyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsWUFBWSxDQUFDLEdBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQztJQUN0RSxDQUFDO0lBQ0QsSUFBSSxJQUFJO1FBQ04sT0FBTyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsWUFBWSxDQUFDLEdBQUksQ0FBQyxDQUFDLElBQUksQ0FBQztJQUNsRSxDQUFDO0lBQ0QsSUFBSSxRQUFRO1FBQ1YsT0FBTyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsWUFBWSxDQUFDLEdBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQztJQUN0RSxDQUFDO0lBQ0QsSUFBSSxNQUFNO1FBQ1IsT0FBTyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsWUFBWSxDQUFDLEdBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQztJQUNwRSxDQUFDO0lBQ0QsSUFBSSxJQUFJO1FBQ04sT0FBTyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsWUFBWSxDQUFDLEdBQUksQ0FBQyxDQUFDLElBQUksQ0FBQztJQUNsRSxDQUFDO0lBRUQsU0FBUyxDQUFDLEtBQVUsRUFBRSxLQUFhLEVBQUUsR0FBVztRQUM5QyxJQUFJLENBQUMsbUJBQW1CLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDeEQsQ0FBQztJQUVELFlBQVksQ0FBQyxLQUFVLEVBQUUsS0FBYSxFQUFFLEdBQVc7UUFDakQsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQzNELENBQUM7SUFFRCxPQUFPO1FBQ0wsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQ3JDLENBQUM7SUFFRCxJQUFJO1FBQ0YsSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksRUFBRSxDQUFDO0lBQ2xDLENBQUM7SUFFRCxTQUFTLENBQUMsbUJBQTJCLENBQUM7UUFDcEMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBQ2hELENBQUM7SUFFRCxRQUFRO1FBQ04sT0FBTyxJQUFJLENBQUMsbUJBQW1CLENBQUMsWUFBWSxDQUFDLGVBQWUsRUFBRSxDQUFDO0lBQ2pFLENBQUM7eUhBeEVVLDhCQUE4Qjs2SEFBOUIsOEJBQThCOztzR0FBOUIsOEJBQThCO2tCQUQxQyxVQUFVIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuZGV2L2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1xuICBET0NVTUVOVCxcbiAgTG9jYXRpb25DaGFuZ2VFdmVudCxcbiAgTG9jYXRpb25DaGFuZ2VMaXN0ZW5lcixcbiAgUGxhdGZvcm1Mb2NhdGlvbixcbiAgybVQbGF0Zm9ybU5hdmlnYXRpb24gYXMgUGxhdGZvcm1OYXZpZ2F0aW9uLFxufSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHtJbmplY3QsIGluamVjdCwgSW5qZWN0YWJsZSwgSW5qZWN0aW9uVG9rZW4sIE9wdGlvbmFsfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7U3ViamVjdH0gZnJvbSAncnhqcyc7XG5cbmltcG9ydCB7RmFrZU5hdmlnYXRpb259IGZyb20gJy4vbmF2aWdhdGlvbi9mYWtlX25hdmlnYXRpb24nO1xuXG4vKipcbiAqIFBhcnNlciBmcm9tIGh0dHBzOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMzOTg2I2FwcGVuZGl4LUJcbiAqIF4oKFteOi8/I10rKTopPygvLyhbXi8/I10qKSk/KFtePyNdKikoXFw/KFteI10qKSk/KCMoLiopKT9cbiAqICAxMiAgICAgICAgICAgIDMgIDQgICAgICAgICAgNSAgICAgICA2ICA3ICAgICAgICA4IDlcbiAqXG4gKiBFeGFtcGxlOiBodHRwOi8vd3d3Lmljcy51Y2kuZWR1L3B1Yi9pZXRmL3VyaS8jUmVsYXRlZFxuICpcbiAqIFJlc3VsdHMgaW46XG4gKlxuICogJDEgPSBodHRwOlxuICogJDIgPSBodHRwXG4gKiAkMyA9IC8vd3d3Lmljcy51Y2kuZWR1XG4gKiAkNCA9IHd3dy5pY3MudWNpLmVkdVxuICogJDUgPSAvcHViL2lldGYvdXJpL1xuICogJDYgPSA8dW5kZWZpbmVkPlxuICogJDcgPSA8dW5kZWZpbmVkPlxuICogJDggPSAjUmVsYXRlZFxuICogJDkgPSBSZWxhdGVkXG4gKi9cbmNvbnN0IHVybFBhcnNlID0gL14oKFteOlxcLz8jXSspOik/KFxcL1xcLyhbXlxcLz8jXSopKT8oW14/I10qKShcXD8oW14jXSopKT8oIyguKikpPy87XG5cbmZ1bmN0aW9uIHBhcnNlVXJsKHVybFN0cjogc3RyaW5nLCBiYXNlSHJlZjogc3RyaW5nKSB7XG4gIGNvbnN0IHZlcmlmeVByb3RvY29sID0gL14oKGh0dHBbc10/fGZ0cCk6XFwvXFwvKS87XG4gIGxldCBzZXJ2ZXJCYXNlOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG5cbiAgLy8gVVJMIGNsYXNzIHJlcXVpcmVzIGZ1bGwgVVJMLiBJZiB0aGUgVVJMIHN0cmluZyBkb2Vzbid0IHN0YXJ0IHdpdGggcHJvdG9jb2wsIHdlIG5lZWQgdG8gYWRkXG4gIC8vIGFuIGFyYml0cmFyeSBiYXNlIFVSTCB3aGljaCBjYW4gYmUgcmVtb3ZlZCBhZnRlcndhcmQuXG4gIGlmICghdmVyaWZ5UHJvdG9jb2wudGVzdCh1cmxTdHIpKSB7XG4gICAgc2VydmVyQmFzZSA9ICdodHRwOi8vZW1wdHkuY29tLyc7XG4gIH1cbiAgbGV0IHBhcnNlZFVybDoge1xuICAgIHByb3RvY29sOiBzdHJpbmc7XG4gICAgaG9zdG5hbWU6IHN0cmluZztcbiAgICBwb3J0OiBzdHJpbmc7XG4gICAgcGF0aG5hbWU6IHN0cmluZztcbiAgICBzZWFyY2g6IHN0cmluZztcbiAgICBoYXNoOiBzdHJpbmc7XG4gIH07XG4gIHRyeSB7XG4gICAgcGFyc2VkVXJsID0gbmV3IFVSTCh1cmxTdHIsIHNlcnZlckJhc2UpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgY29uc3QgcmVzdWx0ID0gdXJsUGFyc2UuZXhlYyhzZXJ2ZXJCYXNlIHx8ICcnICsgdXJsU3RyKTtcbiAgICBpZiAoIXJlc3VsdCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIFVSTDogJHt1cmxTdHJ9IHdpdGggYmFzZTogJHtiYXNlSHJlZn1gKTtcbiAgICB9XG4gICAgY29uc3QgaG9zdFNwbGl0ID0gcmVzdWx0WzRdLnNwbGl0KCc6Jyk7XG4gICAgcGFyc2VkVXJsID0ge1xuICAgICAgcHJvdG9jb2w6IHJlc3VsdFsxXSxcbiAgICAgIGhvc3RuYW1lOiBob3N0U3BsaXRbMF0sXG4gICAgICBwb3J0OiBob3N0U3BsaXRbMV0gfHwgJycsXG4gICAgICBwYXRobmFtZTogcmVzdWx0WzVdLFxuICAgICAgc2VhcmNoOiByZXN1bHRbNl0sXG4gICAgICBoYXNoOiByZXN1bHRbOF0sXG4gICAgfTtcbiAgfVxuICBpZiAocGFyc2VkVXJsLnBhdGhuYW1lICYmIHBhcnNlZFVybC5wYXRobmFtZS5pbmRleE9mKGJhc2VIcmVmKSA9PT0gMCkge1xuICAgIHBhcnNlZFVybC5wYXRobmFtZSA9IHBhcnNlZFVybC5wYXRobmFtZS5zdWJzdHJpbmcoYmFzZUhyZWYubGVuZ3RoKTtcbiAgfVxuICByZXR1cm4ge1xuICAgIGhvc3RuYW1lOiAoIXNlcnZlckJhc2UgJiYgcGFyc2VkVXJsLmhvc3RuYW1lKSB8fCAnJyxcbiAgICBwcm90b2NvbDogKCFzZXJ2ZXJCYXNlICYmIHBhcnNlZFVybC5wcm90b2NvbCkgfHwgJycsXG4gICAgcG9ydDogKCFzZXJ2ZXJCYXNlICYmIHBhcnNlZFVybC5wb3J0KSB8fCAnJyxcbiAgICBwYXRobmFtZTogcGFyc2VkVXJsLnBhdGhuYW1lIHx8ICcvJyxcbiAgICBzZWFyY2g6IHBhcnNlZFVybC5zZWFyY2ggfHwgJycsXG4gICAgaGFzaDogcGFyc2VkVXJsLmhhc2ggfHwgJycsXG4gIH07XG59XG5cbi8qKlxuICogTW9jayBwbGF0Zm9ybSBsb2NhdGlvbiBjb25maWdcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTW9ja1BsYXRmb3JtTG9jYXRpb25Db25maWcge1xuICBzdGFydFVybD86IHN0cmluZztcbiAgYXBwQmFzZUhyZWY/OiBzdHJpbmc7XG59XG5cbi8qKlxuICogUHJvdmlkZXIgZm9yIG1vY2sgcGxhdGZvcm0gbG9jYXRpb24gY29uZmlnXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY29uc3QgTU9DS19QTEFURk9STV9MT0NBVElPTl9DT05GSUcgPSBuZXcgSW5qZWN0aW9uVG9rZW48TW9ja1BsYXRmb3JtTG9jYXRpb25Db25maWc+KFxuICAnTU9DS19QTEFURk9STV9MT0NBVElPTl9DT05GSUcnLFxuKTtcblxuLyoqXG4gKiBNb2NrIGltcGxlbWVudGF0aW9uIG9mIFVSTCBzdGF0ZS5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBNb2NrUGxhdGZvcm1Mb2NhdGlvbiBpbXBsZW1lbnRzIFBsYXRmb3JtTG9jYXRpb24ge1xuICBwcml2YXRlIGJhc2VIcmVmOiBzdHJpbmcgPSAnJztcbiAgcHJpdmF0ZSBoYXNoVXBkYXRlID0gbmV3IFN1YmplY3Q8TG9jYXRpb25DaGFuZ2VFdmVudD4oKTtcbiAgcHJpdmF0ZSBwb3BTdGF0ZVN1YmplY3QgPSBuZXcgU3ViamVjdDxMb2NhdGlvbkNoYW5nZUV2ZW50PigpO1xuICBwcml2YXRlIHVybENoYW5nZUluZGV4OiBudW1iZXIgPSAwO1xuICBwcml2YXRlIHVybENoYW5nZXM6IHtcbiAgICBob3N0bmFtZTogc3RyaW5nO1xuICAgIHByb3RvY29sOiBzdHJpbmc7XG4gICAgcG9ydDogc3RyaW5nO1xuICAgIHBhdGhuYW1lOiBzdHJpbmc7XG4gICAgc2VhcmNoOiBzdHJpbmc7XG4gICAgaGFzaDogc3RyaW5nO1xuICAgIHN0YXRlOiB1bmtub3duO1xuICB9W10gPSBbe2hvc3RuYW1lOiAnJywgcHJvdG9jb2w6ICcnLCBwb3J0OiAnJywgcGF0aG5hbWU6ICcvJywgc2VhcmNoOiAnJywgaGFzaDogJycsIHN0YXRlOiBudWxsfV07XG5cbiAgY29uc3RydWN0b3IoXG4gICAgQEluamVjdChNT0NLX1BMQVRGT1JNX0xPQ0FUSU9OX0NPTkZJRykgQE9wdGlvbmFsKCkgY29uZmlnPzogTW9ja1BsYXRmb3JtTG9jYXRpb25Db25maWcsXG4gICkge1xuICAgIGlmIChjb25maWcpIHtcbiAgICAgIHRoaXMuYmFzZUhyZWYgPSBjb25maWcuYXBwQmFzZUhyZWYgfHwgJyc7XG5cbiAgICAgIGNvbnN0IHBhcnNlZENoYW5nZXMgPSB0aGlzLnBhcnNlQ2hhbmdlcyhcbiAgICAgICAgbnVsbCxcbiAgICAgICAgY29uZmlnLnN0YXJ0VXJsIHx8ICdodHRwOi8vX2VtcHR5Xy8nLFxuICAgICAgICB0aGlzLmJhc2VIcmVmLFxuICAgICAgKTtcbiAgICAgIHRoaXMudXJsQ2hhbmdlc1swXSA9IHsuLi5wYXJzZWRDaGFuZ2VzfTtcbiAgICB9XG4gIH1cblxuICBnZXQgaG9zdG5hbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMudXJsQ2hhbmdlc1t0aGlzLnVybENoYW5nZUluZGV4XS5ob3N0bmFtZTtcbiAgfVxuICBnZXQgcHJvdG9jb2woKSB7XG4gICAgcmV0dXJuIHRoaXMudXJsQ2hhbmdlc1t0aGlzLnVybENoYW5nZUluZGV4XS5wcm90b2NvbDtcbiAgfVxuICBnZXQgcG9ydCgpIHtcbiAgICByZXR1cm4gdGhpcy51cmxDaGFuZ2VzW3RoaXMudXJsQ2hhbmdlSW5kZXhdLnBvcnQ7XG4gIH1cbiAgZ2V0IHBhdGhuYW1lKCkge1xuICAgIHJldHVybiB0aGlzLnVybENoYW5nZXNbdGhpcy51cmxDaGFuZ2VJbmRleF0ucGF0aG5hbWU7XG4gIH1cbiAgZ2V0IHNlYXJjaCgpIHtcbiAgICByZXR1cm4gdGhpcy51cmxDaGFuZ2VzW3RoaXMudXJsQ2hhbmdlSW5kZXhdLnNlYXJjaDtcbiAgfVxuICBnZXQgaGFzaCgpIHtcbiAgICByZXR1cm4gdGhpcy51cmxDaGFuZ2VzW3RoaXMudXJsQ2hhbmdlSW5kZXhdLmhhc2g7XG4gIH1cbiAgZ2V0IHN0YXRlKCkge1xuICAgIHJldHVybiB0aGlzLnVybENoYW5nZXNbdGhpcy51cmxDaGFuZ2VJbmRleF0uc3RhdGU7XG4gIH1cblxuICBnZXRCYXNlSHJlZkZyb21ET00oKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5iYXNlSHJlZjtcbiAgfVxuXG4gIG9uUG9wU3RhdGUoZm46IExvY2F0aW9uQ2hhbmdlTGlzdGVuZXIpOiBWb2lkRnVuY3Rpb24ge1xuICAgIGNvbnN0IHN1YnNjcmlwdGlvbiA9IHRoaXMucG9wU3RhdGVTdWJqZWN0LnN1YnNjcmliZShmbik7XG4gICAgcmV0dXJuICgpID0+IHN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICB9XG5cbiAgb25IYXNoQ2hhbmdlKGZuOiBMb2NhdGlvbkNoYW5nZUxpc3RlbmVyKTogVm9pZEZ1bmN0aW9uIHtcbiAgICBjb25zdCBzdWJzY3JpcHRpb24gPSB0aGlzLmhhc2hVcGRhdGUuc3Vic2NyaWJlKGZuKTtcbiAgICByZXR1cm4gKCkgPT4gc3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG4gIH1cblxuICBnZXQgaHJlZigpOiBzdHJpbmcge1xuICAgIGxldCB1cmwgPSBgJHt0aGlzLnByb3RvY29sfS8vJHt0aGlzLmhvc3RuYW1lfSR7dGhpcy5wb3J0ID8gJzonICsgdGhpcy5wb3J0IDogJyd9YDtcbiAgICB1cmwgKz0gYCR7dGhpcy5wYXRobmFtZSA9PT0gJy8nID8gJycgOiB0aGlzLnBhdGhuYW1lfSR7dGhpcy5zZWFyY2h9JHt0aGlzLmhhc2h9YDtcbiAgICByZXR1cm4gdXJsO1xuICB9XG5cbiAgZ2V0IHVybCgpOiBzdHJpbmcge1xuICAgIHJldHVybiBgJHt0aGlzLnBhdGhuYW1lfSR7dGhpcy5zZWFyY2h9JHt0aGlzLmhhc2h9YDtcbiAgfVxuXG4gIHByaXZhdGUgcGFyc2VDaGFuZ2VzKHN0YXRlOiB1bmtub3duLCB1cmw6IHN0cmluZywgYmFzZUhyZWY6IHN0cmluZyA9ICcnKSB7XG4gICAgLy8gV2hlbiB0aGUgYGhpc3Rvcnkuc3RhdGVgIHZhbHVlIGlzIHN0b3JlZCwgaXQgaXMgYWx3YXlzIGNvcGllZC5cbiAgICBzdGF0ZSA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoc3RhdGUpKTtcbiAgICByZXR1cm4gey4uLnBhcnNlVXJsKHVybCwgYmFzZUhyZWYpLCBzdGF0ZX07XG4gIH1cblxuICByZXBsYWNlU3RhdGUoc3RhdGU6IGFueSwgdGl0bGU6IHN0cmluZywgbmV3VXJsOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCB7cGF0aG5hbWUsIHNlYXJjaCwgc3RhdGU6IHBhcnNlZFN0YXRlLCBoYXNofSA9IHRoaXMucGFyc2VDaGFuZ2VzKHN0YXRlLCBuZXdVcmwpO1xuXG4gICAgdGhpcy51cmxDaGFuZ2VzW3RoaXMudXJsQ2hhbmdlSW5kZXhdID0ge1xuICAgICAgLi4udGhpcy51cmxDaGFuZ2VzW3RoaXMudXJsQ2hhbmdlSW5kZXhdLFxuICAgICAgcGF0aG5hbWUsXG4gICAgICBzZWFyY2gsXG4gICAgICBoYXNoLFxuICAgICAgc3RhdGU6IHBhcnNlZFN0YXRlLFxuICAgIH07XG4gIH1cblxuICBwdXNoU3RhdGUoc3RhdGU6IGFueSwgdGl0bGU6IHN0cmluZywgbmV3VXJsOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCB7cGF0aG5hbWUsIHNlYXJjaCwgc3RhdGU6IHBhcnNlZFN0YXRlLCBoYXNofSA9IHRoaXMucGFyc2VDaGFuZ2VzKHN0YXRlLCBuZXdVcmwpO1xuICAgIGlmICh0aGlzLnVybENoYW5nZUluZGV4ID4gMCkge1xuICAgICAgdGhpcy51cmxDaGFuZ2VzLnNwbGljZSh0aGlzLnVybENoYW5nZUluZGV4ICsgMSk7XG4gICAgfVxuICAgIHRoaXMudXJsQ2hhbmdlcy5wdXNoKHtcbiAgICAgIC4uLnRoaXMudXJsQ2hhbmdlc1t0aGlzLnVybENoYW5nZUluZGV4XSxcbiAgICAgIHBhdGhuYW1lLFxuICAgICAgc2VhcmNoLFxuICAgICAgaGFzaCxcbiAgICAgIHN0YXRlOiBwYXJzZWRTdGF0ZSxcbiAgICB9KTtcbiAgICB0aGlzLnVybENoYW5nZUluZGV4ID0gdGhpcy51cmxDaGFuZ2VzLmxlbmd0aCAtIDE7XG4gIH1cblxuICBmb3J3YXJkKCk6IHZvaWQge1xuICAgIGNvbnN0IG9sZFVybCA9IHRoaXMudXJsO1xuICAgIGNvbnN0IG9sZEhhc2ggPSB0aGlzLmhhc2g7XG4gICAgaWYgKHRoaXMudXJsQ2hhbmdlSW5kZXggPCB0aGlzLnVybENoYW5nZXMubGVuZ3RoKSB7XG4gICAgICB0aGlzLnVybENoYW5nZUluZGV4Kys7XG4gICAgfVxuICAgIHRoaXMuZW1pdEV2ZW50cyhvbGRIYXNoLCBvbGRVcmwpO1xuICB9XG5cbiAgYmFjaygpOiB2b2lkIHtcbiAgICBjb25zdCBvbGRVcmwgPSB0aGlzLnVybDtcbiAgICBjb25zdCBvbGRIYXNoID0gdGhpcy5oYXNoO1xuICAgIGlmICh0aGlzLnVybENoYW5nZUluZGV4ID4gMCkge1xuICAgICAgdGhpcy51cmxDaGFuZ2VJbmRleC0tO1xuICAgIH1cbiAgICB0aGlzLmVtaXRFdmVudHMob2xkSGFzaCwgb2xkVXJsKTtcbiAgfVxuXG4gIGhpc3RvcnlHbyhyZWxhdGl2ZVBvc2l0aW9uOiBudW1iZXIgPSAwKTogdm9pZCB7XG4gICAgY29uc3Qgb2xkVXJsID0gdGhpcy51cmw7XG4gICAgY29uc3Qgb2xkSGFzaCA9IHRoaXMuaGFzaDtcbiAgICBjb25zdCBuZXh0UGFnZUluZGV4ID0gdGhpcy51cmxDaGFuZ2VJbmRleCArIHJlbGF0aXZlUG9zaXRpb247XG4gICAgaWYgKG5leHRQYWdlSW5kZXggPj0gMCAmJiBuZXh0UGFnZUluZGV4IDwgdGhpcy51cmxDaGFuZ2VzLmxlbmd0aCkge1xuICAgICAgdGhpcy51cmxDaGFuZ2VJbmRleCA9IG5leHRQYWdlSW5kZXg7XG4gICAgfVxuICAgIHRoaXMuZW1pdEV2ZW50cyhvbGRIYXNoLCBvbGRVcmwpO1xuICB9XG5cbiAgZ2V0U3RhdGUoKTogdW5rbm93biB7XG4gICAgcmV0dXJuIHRoaXMuc3RhdGU7XG4gIH1cblxuICAvKipcbiAgICogQnJvd3NlcnMgYXJlIGluY29uc2lzdGVudCBpbiB3aGVuIHRoZXkgZmlyZSBldmVudHMgYW5kIHBlcmZvcm0gdGhlIHN0YXRlIHVwZGF0ZXNcbiAgICogVGhlIG1vc3QgZWFzaWVzdCB0aGluZyB0byBkbyBpbiBvdXIgbW9jayBpcyBzeW5jaHJvbm91cyBhbmQgdGhhdCBoYXBwZW5zIHRvIG1hdGNoXG4gICAqIEZpcmVmb3ggYW5kIENocm9tZSwgYXQgbGVhc3Qgc29tZXdoYXQgY2xvc2VseVxuICAgKlxuICAgKiBodHRwczovL2dpdGh1Yi5jb20vV0lDRy9uYXZpZ2F0aW9uLWFwaSN3YXRjaGluZy1mb3ItbmF2aWdhdGlvbnNcbiAgICogaHR0cHM6Ly9kb2NzLmdvb2dsZS5jb20vZG9jdW1lbnQvZC8xUGR2ZS1ESjFKQ0dpbGo5WXFmNUh4Ukp5QktTZWw1b3dnT3ZVSnFUYXV3VS9lZGl0I2hlYWRpbmc9aC4zeWU0djcxd3N6OTRcbiAgICogcG9wc3RhdGUgaXMgYWx3YXlzIHNlbnQgYmVmb3JlIGhhc2hjaGFuZ2U6XG4gICAqIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9XaW5kb3cvcG9wc3RhdGVfZXZlbnQjd2hlbl9wb3BzdGF0ZV9pc19zZW50XG4gICAqL1xuICBwcml2YXRlIGVtaXRFdmVudHMob2xkSGFzaDogc3RyaW5nLCBvbGRVcmw6IHN0cmluZykge1xuICAgIHRoaXMucG9wU3RhdGVTdWJqZWN0Lm5leHQoe1xuICAgICAgdHlwZTogJ3BvcHN0YXRlJyxcbiAgICAgIHN0YXRlOiB0aGlzLmdldFN0YXRlKCksXG4gICAgICBvbGRVcmwsXG4gICAgICBuZXdVcmw6IHRoaXMudXJsLFxuICAgIH0gYXMgTG9jYXRpb25DaGFuZ2VFdmVudCk7XG4gICAgaWYgKG9sZEhhc2ggIT09IHRoaXMuaGFzaCkge1xuICAgICAgdGhpcy5oYXNoVXBkYXRlLm5leHQoe1xuICAgICAgICB0eXBlOiAnaGFzaGNoYW5nZScsXG4gICAgICAgIHN0YXRlOiBudWxsLFxuICAgICAgICBvbGRVcmwsXG4gICAgICAgIG5ld1VybDogdGhpcy51cmwsXG4gICAgICB9IGFzIExvY2F0aW9uQ2hhbmdlRXZlbnQpO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIE1vY2sgaW1wbGVtZW50YXRpb24gb2YgVVJMIHN0YXRlLlxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgRmFrZU5hdmlnYXRpb25QbGF0Zm9ybUxvY2F0aW9uIGltcGxlbWVudHMgUGxhdGZvcm1Mb2NhdGlvbiB7XG4gIHByaXZhdGUgX3BsYXRmb3JtTmF2aWdhdGlvbiA9IGluamVjdChQbGF0Zm9ybU5hdmlnYXRpb24pIGFzIEZha2VOYXZpZ2F0aW9uO1xuICBwcml2YXRlIHdpbmRvdyA9IGluamVjdChET0NVTUVOVCkuZGVmYXVsdFZpZXchO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIGlmICghKHRoaXMuX3BsYXRmb3JtTmF2aWdhdGlvbiBpbnN0YW5jZW9mIEZha2VOYXZpZ2F0aW9uKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAnRmFrZVBsYXRmb3JtTmF2aWdhdGlvbiBjYW5ub3QgYmUgdXNlZCB3aXRob3V0IEZha2VOYXZpZ2F0aW9uLiBVc2UgJyArXG4gICAgICAgICAgJ2Bwcm92aWRlRmFrZU5hdmlnYXRpb25gIHRvIGhhdmUgYWxsIHRoZXNlIHNlcnZpY2VzIHByb3ZpZGVkIHRvZ2V0aGVyLicsXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgY29uZmlnID0gaW5qZWN0KE1PQ0tfUExBVEZPUk1fTE9DQVRJT05fQ09ORklHLCB7b3B0aW9uYWw6IHRydWV9KTtcbiAgZ2V0QmFzZUhyZWZGcm9tRE9NKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuY29uZmlnPy5hcHBCYXNlSHJlZiA/PyAnJztcbiAgfVxuXG4gIG9uUG9wU3RhdGUoZm46IExvY2F0aW9uQ2hhbmdlTGlzdGVuZXIpOiBWb2lkRnVuY3Rpb24ge1xuICAgIHRoaXMud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3BvcHN0YXRlJywgZm4pO1xuICAgIHJldHVybiAoKSA9PiB0aGlzLndpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdwb3BzdGF0ZScsIGZuKTtcbiAgfVxuXG4gIG9uSGFzaENoYW5nZShmbjogTG9jYXRpb25DaGFuZ2VMaXN0ZW5lcik6IFZvaWRGdW5jdGlvbiB7XG4gICAgdGhpcy53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignaGFzaGNoYW5nZScsIGZuIGFzIGFueSk7XG4gICAgcmV0dXJuICgpID0+IHRoaXMud2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2hhc2hjaGFuZ2UnLCBmbiBhcyBhbnkpO1xuICB9XG5cbiAgZ2V0IGhyZWYoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fcGxhdGZvcm1OYXZpZ2F0aW9uLmN1cnJlbnRFbnRyeS51cmwhO1xuICB9XG4gIGdldCBwcm90b2NvbCgpOiBzdHJpbmcge1xuICAgIHJldHVybiBuZXcgVVJMKHRoaXMuX3BsYXRmb3JtTmF2aWdhdGlvbi5jdXJyZW50RW50cnkudXJsISkucHJvdG9jb2w7XG4gIH1cbiAgZ2V0IGhvc3RuYW1lKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIG5ldyBVUkwodGhpcy5fcGxhdGZvcm1OYXZpZ2F0aW9uLmN1cnJlbnRFbnRyeS51cmwhKS5ob3N0bmFtZTtcbiAgfVxuICBnZXQgcG9ydCgpOiBzdHJpbmcge1xuICAgIHJldHVybiBuZXcgVVJMKHRoaXMuX3BsYXRmb3JtTmF2aWdhdGlvbi5jdXJyZW50RW50cnkudXJsISkucG9ydDtcbiAgfVxuICBnZXQgcGF0aG5hbWUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gbmV3IFVSTCh0aGlzLl9wbGF0Zm9ybU5hdmlnYXRpb24uY3VycmVudEVudHJ5LnVybCEpLnBhdGhuYW1lO1xuICB9XG4gIGdldCBzZWFyY2goKTogc3RyaW5nIHtcbiAgICByZXR1cm4gbmV3IFVSTCh0aGlzLl9wbGF0Zm9ybU5hdmlnYXRpb24uY3VycmVudEVudHJ5LnVybCEpLnNlYXJjaDtcbiAgfVxuICBnZXQgaGFzaCgpOiBzdHJpbmcge1xuICAgIHJldHVybiBuZXcgVVJMKHRoaXMuX3BsYXRmb3JtTmF2aWdhdGlvbi5jdXJyZW50RW50cnkudXJsISkuaGFzaDtcbiAgfVxuXG4gIHB1c2hTdGF0ZShzdGF0ZTogYW55LCB0aXRsZTogc3RyaW5nLCB1cmw6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuX3BsYXRmb3JtTmF2aWdhdGlvbi5wdXNoU3RhdGUoc3RhdGUsIHRpdGxlLCB1cmwpO1xuICB9XG5cbiAgcmVwbGFjZVN0YXRlKHN0YXRlOiBhbnksIHRpdGxlOiBzdHJpbmcsIHVybDogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5fcGxhdGZvcm1OYXZpZ2F0aW9uLnJlcGxhY2VTdGF0ZShzdGF0ZSwgdGl0bGUsIHVybCk7XG4gIH1cblxuICBmb3J3YXJkKCk6IHZvaWQge1xuICAgIHRoaXMuX3BsYXRmb3JtTmF2aWdhdGlvbi5mb3J3YXJkKCk7XG4gIH1cblxuICBiYWNrKCk6IHZvaWQge1xuICAgIHRoaXMuX3BsYXRmb3JtTmF2aWdhdGlvbi5iYWNrKCk7XG4gIH1cblxuICBoaXN0b3J5R28ocmVsYXRpdmVQb3NpdGlvbjogbnVtYmVyID0gMCk6IHZvaWQge1xuICAgIHRoaXMuX3BsYXRmb3JtTmF2aWdhdGlvbi5nbyhyZWxhdGl2ZVBvc2l0aW9uKTtcbiAgfVxuXG4gIGdldFN0YXRlKCk6IHVua25vd24ge1xuICAgIHJldHVybiB0aGlzLl9wbGF0Zm9ybU5hdmlnYXRpb24uY3VycmVudEVudHJ5LmdldEhpc3RvcnlTdGF0ZSgpO1xuICB9XG59XG4iXX0=