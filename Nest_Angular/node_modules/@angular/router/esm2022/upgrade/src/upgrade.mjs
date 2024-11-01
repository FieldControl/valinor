/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Location } from '@angular/common';
import { APP_BOOTSTRAP_LISTENER } from '@angular/core';
import { Router } from '@angular/router';
import { UpgradeModule } from '@angular/upgrade/static';
/**
 * Creates an initializer that sets up `ngRoute` integration
 * along with setting up the Angular router.
 *
 * @usageNotes
 *
 * <code-example language="typescript">
 * @NgModule({
 *  imports: [
 *   RouterModule.forRoot(SOME_ROUTES),
 *   UpgradeModule
 * ],
 * providers: [
 *   RouterUpgradeInitializer
 * ]
 * })
 * export class AppModule {
 *   ngDoBootstrap() {}
 * }
 * </code-example>
 *
 * @publicApi
 */
export const RouterUpgradeInitializer = {
    provide: APP_BOOTSTRAP_LISTENER,
    multi: true,
    useFactory: locationSyncBootstrapListener,
    deps: [UpgradeModule],
};
/**
 * @internal
 */
export function locationSyncBootstrapListener(ngUpgrade) {
    return () => {
        setUpLocationSync(ngUpgrade);
    };
}
/**
 * Sets up a location change listener to trigger `history.pushState`.
 * Works around the problem that `onPopState` does not trigger `history.pushState`.
 * Must be called *after* calling `UpgradeModule.bootstrap`.
 *
 * @param ngUpgrade The upgrade NgModule.
 * @param urlType The location strategy.
 * @see {@link HashLocationStrategy}
 * @see {@link PathLocationStrategy}
 *
 * @publicApi
 */
export function setUpLocationSync(ngUpgrade, urlType = 'path') {
    if (!ngUpgrade.$injector) {
        throw new Error(`
        RouterUpgradeInitializer can be used only after UpgradeModule.bootstrap has been called.
        Remove RouterUpgradeInitializer and call setUpLocationSync after UpgradeModule.bootstrap.
      `);
    }
    const router = ngUpgrade.injector.get(Router);
    const location = ngUpgrade.injector.get(Location);
    ngUpgrade.$injector
        .get('$rootScope')
        .$on('$locationChangeStart', (event, newUrl, oldUrl, newState, oldState) => {
        // Navigations coming from Angular router have a navigationId state
        // property. Don't trigger Angular router navigation again if it is
        // caused by a URL change from the current Angular router
        // navigation.
        const currentNavigationId = router.getCurrentNavigation()?.id;
        const newStateNavigationId = newState?.navigationId;
        if (newStateNavigationId !== undefined && newStateNavigationId === currentNavigationId) {
            return;
        }
        let url;
        if (urlType === 'path') {
            url = resolveUrl(newUrl);
        }
        else if (urlType === 'hash') {
            // Remove the first hash from the URL
            const hashIdx = newUrl.indexOf('#');
            url = resolveUrl(newUrl.substring(0, hashIdx) + newUrl.substring(hashIdx + 1));
        }
        else {
            throw 'Invalid URLType passed to setUpLocationSync: ' + urlType;
        }
        const path = location.normalize(url.pathname);
        router.navigateByUrl(path + url.search + url.hash);
    });
}
/**
 * Normalizes and parses a URL.
 *
 * - Normalizing means that a relative URL will be resolved into an absolute URL in the context of
 *   the application document.
 * - Parsing means that the anchor's `protocol`, `hostname`, `port`, `pathname` and related
 *   properties are all populated to reflect the normalized URL.
 *
 * While this approach has wide compatibility, it doesn't work as expected on IE. On IE, normalizing
 * happens similar to other browsers, but the parsed components will not be set. (E.g. if you assign
 * `a.href = 'foo'`, then `a.protocol`, `a.host`, etc. will not be correctly updated.)
 * We work around that by performing the parsing in a 2nd step by taking a previously normalized URL
 * and assigning it again. This correctly populates all properties.
 *
 * See
 * https://github.com/angular/angular.js/blob/2c7400e7d07b0f6cec1817dab40b9250ce8ebce6/src/ng/urlUtils.js#L26-L33
 * for more info.
 */
let anchor;
function resolveUrl(url) {
    anchor ??= document.createElement('a');
    anchor.setAttribute('href', url);
    anchor.setAttribute('href', anchor.href);
    return {
        // IE does not start `pathname` with `/` like other browsers.
        pathname: `/${anchor.pathname.replace(/^\//, '')}`,
        search: anchor.search,
        hash: anchor.hash,
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBncmFkZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3JvdXRlci91cGdyYWRlL3NyYy91cGdyYWRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUN6QyxPQUFPLEVBQUMsc0JBQXNCLEVBQStCLE1BQU0sZUFBZSxDQUFDO0FBQ25GLE9BQU8sRUFBQyxNQUFNLEVBQWtDLE1BQU0saUJBQWlCLENBQUM7QUFDeEUsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLHlCQUF5QixDQUFDO0FBRXREOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBc0JHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sd0JBQXdCLEdBQUc7SUFDdEMsT0FBTyxFQUFFLHNCQUFzQjtJQUMvQixLQUFLLEVBQUUsSUFBSTtJQUNYLFVBQVUsRUFBRSw2QkFBeUU7SUFDckYsSUFBSSxFQUFFLENBQUMsYUFBYSxDQUFDO0NBQ3RCLENBQUM7QUFFRjs7R0FFRztBQUNILE1BQU0sVUFBVSw2QkFBNkIsQ0FBQyxTQUF3QjtJQUNwRSxPQUFPLEdBQUcsRUFBRTtRQUNWLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQy9CLENBQUMsQ0FBQztBQUNKLENBQUM7QUFFRDs7Ozs7Ozs7Ozs7R0FXRztBQUNILE1BQU0sVUFBVSxpQkFBaUIsQ0FBQyxTQUF3QixFQUFFLFVBQTJCLE1BQU07SUFDM0YsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUN6QixNQUFNLElBQUksS0FBSyxDQUFDOzs7T0FHYixDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsTUFBTSxNQUFNLEdBQVcsU0FBUyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDdEQsTUFBTSxRQUFRLEdBQWEsU0FBUyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7SUFFNUQsU0FBUyxDQUFDLFNBQVM7U0FDaEIsR0FBRyxDQUFDLFlBQVksQ0FBQztTQUNqQixHQUFHLENBQ0Ysc0JBQXNCLEVBQ3RCLENBQ0UsS0FBVSxFQUNWLE1BQWMsRUFDZCxNQUFjLEVBQ2QsUUFBaUQsRUFDakQsUUFBaUQsRUFDakQsRUFBRTtRQUNGLG1FQUFtRTtRQUNuRSxtRUFBbUU7UUFDbkUseURBQXlEO1FBQ3pELGNBQWM7UUFDZCxNQUFNLG1CQUFtQixHQUFHLE1BQU0sQ0FBQyxvQkFBb0IsRUFBRSxFQUFFLEVBQUUsQ0FBQztRQUM5RCxNQUFNLG9CQUFvQixHQUFHLFFBQVEsRUFBRSxZQUFZLENBQUM7UUFDcEQsSUFBSSxvQkFBb0IsS0FBSyxTQUFTLElBQUksb0JBQW9CLEtBQUssbUJBQW1CLEVBQUUsQ0FBQztZQUN2RixPQUFPO1FBQ1QsQ0FBQztRQUVELElBQUksR0FBRyxDQUFDO1FBQ1IsSUFBSSxPQUFPLEtBQUssTUFBTSxFQUFFLENBQUM7WUFDdkIsR0FBRyxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMzQixDQUFDO2FBQU0sSUFBSSxPQUFPLEtBQUssTUFBTSxFQUFFLENBQUM7WUFDOUIscUNBQXFDO1lBQ3JDLE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDcEMsR0FBRyxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2pGLENBQUM7YUFBTSxDQUFDO1lBQ04sTUFBTSwrQ0FBK0MsR0FBRyxPQUFPLENBQUM7UUFDbEUsQ0FBQztRQUNELE1BQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzlDLE1BQU0sQ0FBQyxhQUFhLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3JELENBQUMsQ0FDRixDQUFDO0FBQ04sQ0FBQztBQUVEOzs7Ozs7Ozs7Ozs7Ozs7OztHQWlCRztBQUNILElBQUksTUFBcUMsQ0FBQztBQUMxQyxTQUFTLFVBQVUsQ0FBQyxHQUFXO0lBQzdCLE1BQU0sS0FBSyxRQUFRLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBRXZDLE1BQU0sQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ2pDLE1BQU0sQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUV6QyxPQUFPO1FBQ0wsNkRBQTZEO1FBQzdELFFBQVEsRUFBRSxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsRUFBRTtRQUNsRCxNQUFNLEVBQUUsTUFBTSxDQUFDLE1BQU07UUFDckIsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJO0tBQ2xCLENBQUM7QUFDSixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuZGV2L2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0xvY2F0aW9ufSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHtBUFBfQk9PVFNUUkFQX0xJU1RFTkVSLCBDb21wb25lbnRSZWYsIEluamVjdGlvblRva2VufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7Um91dGVyLCDJtVJlc3RvcmVkU3RhdGUgYXMgUmVzdG9yZWRTdGF0ZX0gZnJvbSAnQGFuZ3VsYXIvcm91dGVyJztcbmltcG9ydCB7VXBncmFkZU1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvdXBncmFkZS9zdGF0aWMnO1xuXG4vKipcbiAqIENyZWF0ZXMgYW4gaW5pdGlhbGl6ZXIgdGhhdCBzZXRzIHVwIGBuZ1JvdXRlYCBpbnRlZ3JhdGlvblxuICogYWxvbmcgd2l0aCBzZXR0aW5nIHVwIHRoZSBBbmd1bGFyIHJvdXRlci5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICpcbiAqIDxjb2RlLWV4YW1wbGUgbGFuZ3VhZ2U9XCJ0eXBlc2NyaXB0XCI+XG4gKiBATmdNb2R1bGUoe1xuICogIGltcG9ydHM6IFtcbiAqICAgUm91dGVyTW9kdWxlLmZvclJvb3QoU09NRV9ST1VURVMpLFxuICogICBVcGdyYWRlTW9kdWxlXG4gKiBdLFxuICogcHJvdmlkZXJzOiBbXG4gKiAgIFJvdXRlclVwZ3JhZGVJbml0aWFsaXplclxuICogXVxuICogfSlcbiAqIGV4cG9ydCBjbGFzcyBBcHBNb2R1bGUge1xuICogICBuZ0RvQm9vdHN0cmFwKCkge31cbiAqIH1cbiAqIDwvY29kZS1leGFtcGxlPlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNvbnN0IFJvdXRlclVwZ3JhZGVJbml0aWFsaXplciA9IHtcbiAgcHJvdmlkZTogQVBQX0JPT1RTVFJBUF9MSVNURU5FUixcbiAgbXVsdGk6IHRydWUsXG4gIHVzZUZhY3Rvcnk6IGxvY2F0aW9uU3luY0Jvb3RzdHJhcExpc3RlbmVyIGFzIChuZ1VwZ3JhZGU6IFVwZ3JhZGVNb2R1bGUpID0+ICgpID0+IHZvaWQsXG4gIGRlcHM6IFtVcGdyYWRlTW9kdWxlXSxcbn07XG5cbi8qKlxuICogQGludGVybmFsXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsb2NhdGlvblN5bmNCb290c3RyYXBMaXN0ZW5lcihuZ1VwZ3JhZGU6IFVwZ3JhZGVNb2R1bGUpIHtcbiAgcmV0dXJuICgpID0+IHtcbiAgICBzZXRVcExvY2F0aW9uU3luYyhuZ1VwZ3JhZGUpO1xuICB9O1xufVxuXG4vKipcbiAqIFNldHMgdXAgYSBsb2NhdGlvbiBjaGFuZ2UgbGlzdGVuZXIgdG8gdHJpZ2dlciBgaGlzdG9yeS5wdXNoU3RhdGVgLlxuICogV29ya3MgYXJvdW5kIHRoZSBwcm9ibGVtIHRoYXQgYG9uUG9wU3RhdGVgIGRvZXMgbm90IHRyaWdnZXIgYGhpc3RvcnkucHVzaFN0YXRlYC5cbiAqIE11c3QgYmUgY2FsbGVkICphZnRlciogY2FsbGluZyBgVXBncmFkZU1vZHVsZS5ib290c3RyYXBgLlxuICpcbiAqIEBwYXJhbSBuZ1VwZ3JhZGUgVGhlIHVwZ3JhZGUgTmdNb2R1bGUuXG4gKiBAcGFyYW0gdXJsVHlwZSBUaGUgbG9jYXRpb24gc3RyYXRlZ3kuXG4gKiBAc2VlIHtAbGluayBIYXNoTG9jYXRpb25TdHJhdGVneX1cbiAqIEBzZWUge0BsaW5rIFBhdGhMb2NhdGlvblN0cmF0ZWd5fVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldFVwTG9jYXRpb25TeW5jKG5nVXBncmFkZTogVXBncmFkZU1vZHVsZSwgdXJsVHlwZTogJ3BhdGgnIHwgJ2hhc2gnID0gJ3BhdGgnKSB7XG4gIGlmICghbmdVcGdyYWRlLiRpbmplY3Rvcikge1xuICAgIHRocm93IG5ldyBFcnJvcihgXG4gICAgICAgIFJvdXRlclVwZ3JhZGVJbml0aWFsaXplciBjYW4gYmUgdXNlZCBvbmx5IGFmdGVyIFVwZ3JhZGVNb2R1bGUuYm9vdHN0cmFwIGhhcyBiZWVuIGNhbGxlZC5cbiAgICAgICAgUmVtb3ZlIFJvdXRlclVwZ3JhZGVJbml0aWFsaXplciBhbmQgY2FsbCBzZXRVcExvY2F0aW9uU3luYyBhZnRlciBVcGdyYWRlTW9kdWxlLmJvb3RzdHJhcC5cbiAgICAgIGApO1xuICB9XG5cbiAgY29uc3Qgcm91dGVyOiBSb3V0ZXIgPSBuZ1VwZ3JhZGUuaW5qZWN0b3IuZ2V0KFJvdXRlcik7XG4gIGNvbnN0IGxvY2F0aW9uOiBMb2NhdGlvbiA9IG5nVXBncmFkZS5pbmplY3Rvci5nZXQoTG9jYXRpb24pO1xuXG4gIG5nVXBncmFkZS4kaW5qZWN0b3JcbiAgICAuZ2V0KCckcm9vdFNjb3BlJylcbiAgICAuJG9uKFxuICAgICAgJyRsb2NhdGlvbkNoYW5nZVN0YXJ0JyxcbiAgICAgIChcbiAgICAgICAgZXZlbnQ6IGFueSxcbiAgICAgICAgbmV3VXJsOiBzdHJpbmcsXG4gICAgICAgIG9sZFVybDogc3RyaW5nLFxuICAgICAgICBuZXdTdGF0ZT86IHtbazogc3RyaW5nXTogdW5rbm93bn0gfCBSZXN0b3JlZFN0YXRlLFxuICAgICAgICBvbGRTdGF0ZT86IHtbazogc3RyaW5nXTogdW5rbm93bn0gfCBSZXN0b3JlZFN0YXRlLFxuICAgICAgKSA9PiB7XG4gICAgICAgIC8vIE5hdmlnYXRpb25zIGNvbWluZyBmcm9tIEFuZ3VsYXIgcm91dGVyIGhhdmUgYSBuYXZpZ2F0aW9uSWQgc3RhdGVcbiAgICAgICAgLy8gcHJvcGVydHkuIERvbid0IHRyaWdnZXIgQW5ndWxhciByb3V0ZXIgbmF2aWdhdGlvbiBhZ2FpbiBpZiBpdCBpc1xuICAgICAgICAvLyBjYXVzZWQgYnkgYSBVUkwgY2hhbmdlIGZyb20gdGhlIGN1cnJlbnQgQW5ndWxhciByb3V0ZXJcbiAgICAgICAgLy8gbmF2aWdhdGlvbi5cbiAgICAgICAgY29uc3QgY3VycmVudE5hdmlnYXRpb25JZCA9IHJvdXRlci5nZXRDdXJyZW50TmF2aWdhdGlvbigpPy5pZDtcbiAgICAgICAgY29uc3QgbmV3U3RhdGVOYXZpZ2F0aW9uSWQgPSBuZXdTdGF0ZT8ubmF2aWdhdGlvbklkO1xuICAgICAgICBpZiAobmV3U3RhdGVOYXZpZ2F0aW9uSWQgIT09IHVuZGVmaW5lZCAmJiBuZXdTdGF0ZU5hdmlnYXRpb25JZCA9PT0gY3VycmVudE5hdmlnYXRpb25JZCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCB1cmw7XG4gICAgICAgIGlmICh1cmxUeXBlID09PSAncGF0aCcpIHtcbiAgICAgICAgICB1cmwgPSByZXNvbHZlVXJsKG5ld1VybCk7XG4gICAgICAgIH0gZWxzZSBpZiAodXJsVHlwZSA9PT0gJ2hhc2gnKSB7XG4gICAgICAgICAgLy8gUmVtb3ZlIHRoZSBmaXJzdCBoYXNoIGZyb20gdGhlIFVSTFxuICAgICAgICAgIGNvbnN0IGhhc2hJZHggPSBuZXdVcmwuaW5kZXhPZignIycpO1xuICAgICAgICAgIHVybCA9IHJlc29sdmVVcmwobmV3VXJsLnN1YnN0cmluZygwLCBoYXNoSWR4KSArIG5ld1VybC5zdWJzdHJpbmcoaGFzaElkeCArIDEpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyAnSW52YWxpZCBVUkxUeXBlIHBhc3NlZCB0byBzZXRVcExvY2F0aW9uU3luYzogJyArIHVybFR5cGU7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcGF0aCA9IGxvY2F0aW9uLm5vcm1hbGl6ZSh1cmwucGF0aG5hbWUpO1xuICAgICAgICByb3V0ZXIubmF2aWdhdGVCeVVybChwYXRoICsgdXJsLnNlYXJjaCArIHVybC5oYXNoKTtcbiAgICAgIH0sXG4gICAgKTtcbn1cblxuLyoqXG4gKiBOb3JtYWxpemVzIGFuZCBwYXJzZXMgYSBVUkwuXG4gKlxuICogLSBOb3JtYWxpemluZyBtZWFucyB0aGF0IGEgcmVsYXRpdmUgVVJMIHdpbGwgYmUgcmVzb2x2ZWQgaW50byBhbiBhYnNvbHV0ZSBVUkwgaW4gdGhlIGNvbnRleHQgb2ZcbiAqICAgdGhlIGFwcGxpY2F0aW9uIGRvY3VtZW50LlxuICogLSBQYXJzaW5nIG1lYW5zIHRoYXQgdGhlIGFuY2hvcidzIGBwcm90b2NvbGAsIGBob3N0bmFtZWAsIGBwb3J0YCwgYHBhdGhuYW1lYCBhbmQgcmVsYXRlZFxuICogICBwcm9wZXJ0aWVzIGFyZSBhbGwgcG9wdWxhdGVkIHRvIHJlZmxlY3QgdGhlIG5vcm1hbGl6ZWQgVVJMLlxuICpcbiAqIFdoaWxlIHRoaXMgYXBwcm9hY2ggaGFzIHdpZGUgY29tcGF0aWJpbGl0eSwgaXQgZG9lc24ndCB3b3JrIGFzIGV4cGVjdGVkIG9uIElFLiBPbiBJRSwgbm9ybWFsaXppbmdcbiAqIGhhcHBlbnMgc2ltaWxhciB0byBvdGhlciBicm93c2VycywgYnV0IHRoZSBwYXJzZWQgY29tcG9uZW50cyB3aWxsIG5vdCBiZSBzZXQuIChFLmcuIGlmIHlvdSBhc3NpZ25cbiAqIGBhLmhyZWYgPSAnZm9vJ2AsIHRoZW4gYGEucHJvdG9jb2xgLCBgYS5ob3N0YCwgZXRjLiB3aWxsIG5vdCBiZSBjb3JyZWN0bHkgdXBkYXRlZC4pXG4gKiBXZSB3b3JrIGFyb3VuZCB0aGF0IGJ5IHBlcmZvcm1pbmcgdGhlIHBhcnNpbmcgaW4gYSAybmQgc3RlcCBieSB0YWtpbmcgYSBwcmV2aW91c2x5IG5vcm1hbGl6ZWQgVVJMXG4gKiBhbmQgYXNzaWduaW5nIGl0IGFnYWluLiBUaGlzIGNvcnJlY3RseSBwb3B1bGF0ZXMgYWxsIHByb3BlcnRpZXMuXG4gKlxuICogU2VlXG4gKiBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyLmpzL2Jsb2IvMmM3NDAwZTdkMDdiMGY2Y2VjMTgxN2RhYjQwYjkyNTBjZThlYmNlNi9zcmMvbmcvdXJsVXRpbHMuanMjTDI2LUwzM1xuICogZm9yIG1vcmUgaW5mby5cbiAqL1xubGV0IGFuY2hvcjogSFRNTEFuY2hvckVsZW1lbnQgfCB1bmRlZmluZWQ7XG5mdW5jdGlvbiByZXNvbHZlVXJsKHVybDogc3RyaW5nKToge3BhdGhuYW1lOiBzdHJpbmc7IHNlYXJjaDogc3RyaW5nOyBoYXNoOiBzdHJpbmd9IHtcbiAgYW5jaG9yID8/PSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG5cbiAgYW5jaG9yLnNldEF0dHJpYnV0ZSgnaHJlZicsIHVybCk7XG4gIGFuY2hvci5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCBhbmNob3IuaHJlZik7XG5cbiAgcmV0dXJuIHtcbiAgICAvLyBJRSBkb2VzIG5vdCBzdGFydCBgcGF0aG5hbWVgIHdpdGggYC9gIGxpa2Ugb3RoZXIgYnJvd3NlcnMuXG4gICAgcGF0aG5hbWU6IGAvJHthbmNob3IucGF0aG5hbWUucmVwbGFjZSgvXlxcLy8sICcnKX1gLFxuICAgIHNlYXJjaDogYW5jaG9yLnNlYXJjaCxcbiAgICBoYXNoOiBhbmNob3IuaGFzaCxcbiAgfTtcbn1cbiJdfQ==