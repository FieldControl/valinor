/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBncmFkZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3JvdXRlci91cGdyYWRlL3NyYy91cGdyYWRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUN6QyxPQUFPLEVBQUMsc0JBQXNCLEVBQStCLE1BQU0sZUFBZSxDQUFDO0FBQ25GLE9BQU8sRUFBQyxNQUFNLEVBQWtDLE1BQU0saUJBQWlCLENBQUM7QUFDeEUsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLHlCQUF5QixDQUFDO0FBRXREOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBc0JHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sd0JBQXdCLEdBQUc7SUFDdEMsT0FBTyxFQUFFLHNCQUFzQjtJQUMvQixLQUFLLEVBQUUsSUFBSTtJQUNYLFVBQVUsRUFBRSw2QkFBeUU7SUFDckYsSUFBSSxFQUFFLENBQUMsYUFBYSxDQUFDO0NBQ3RCLENBQUM7QUFFRjs7R0FFRztBQUNILE1BQU0sVUFBVSw2QkFBNkIsQ0FBQyxTQUF3QjtJQUNwRSxPQUFPLEdBQUcsRUFBRTtRQUNWLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQy9CLENBQUMsQ0FBQztBQUNKLENBQUM7QUFFRDs7Ozs7Ozs7Ozs7R0FXRztBQUNILE1BQU0sVUFBVSxpQkFBaUIsQ0FBQyxTQUF3QixFQUFFLFVBQTJCLE1BQU07SUFDM0YsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUN6QixNQUFNLElBQUksS0FBSyxDQUFDOzs7T0FHYixDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsTUFBTSxNQUFNLEdBQVcsU0FBUyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDdEQsTUFBTSxRQUFRLEdBQWEsU0FBUyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7SUFFNUQsU0FBUyxDQUFDLFNBQVM7U0FDaEIsR0FBRyxDQUFDLFlBQVksQ0FBQztTQUNqQixHQUFHLENBQ0Ysc0JBQXNCLEVBQ3RCLENBQ0UsS0FBVSxFQUNWLE1BQWMsRUFDZCxNQUFjLEVBQ2QsUUFBaUQsRUFDakQsUUFBaUQsRUFDakQsRUFBRTtRQUNGLG1FQUFtRTtRQUNuRSxtRUFBbUU7UUFDbkUseURBQXlEO1FBQ3pELGNBQWM7UUFDZCxNQUFNLG1CQUFtQixHQUFHLE1BQU0sQ0FBQyxvQkFBb0IsRUFBRSxFQUFFLEVBQUUsQ0FBQztRQUM5RCxNQUFNLG9CQUFvQixHQUFHLFFBQVEsRUFBRSxZQUFZLENBQUM7UUFDcEQsSUFBSSxvQkFBb0IsS0FBSyxTQUFTLElBQUksb0JBQW9CLEtBQUssbUJBQW1CLEVBQUUsQ0FBQztZQUN2RixPQUFPO1FBQ1QsQ0FBQztRQUVELElBQUksR0FBRyxDQUFDO1FBQ1IsSUFBSSxPQUFPLEtBQUssTUFBTSxFQUFFLENBQUM7WUFDdkIsR0FBRyxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMzQixDQUFDO2FBQU0sSUFBSSxPQUFPLEtBQUssTUFBTSxFQUFFLENBQUM7WUFDOUIscUNBQXFDO1lBQ3JDLE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDcEMsR0FBRyxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2pGLENBQUM7YUFBTSxDQUFDO1lBQ04sTUFBTSwrQ0FBK0MsR0FBRyxPQUFPLENBQUM7UUFDbEUsQ0FBQztRQUNELE1BQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzlDLE1BQU0sQ0FBQyxhQUFhLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3JELENBQUMsQ0FDRixDQUFDO0FBQ04sQ0FBQztBQUVEOzs7Ozs7Ozs7Ozs7Ozs7OztHQWlCRztBQUNILElBQUksTUFBcUMsQ0FBQztBQUMxQyxTQUFTLFVBQVUsQ0FBQyxHQUFXO0lBQzdCLE1BQU0sS0FBSyxRQUFRLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBRXZDLE1BQU0sQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ2pDLE1BQU0sQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUV6QyxPQUFPO1FBQ0wsNkRBQTZEO1FBQzdELFFBQVEsRUFBRSxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsRUFBRTtRQUNsRCxNQUFNLEVBQUUsTUFBTSxDQUFDLE1BQU07UUFDckIsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJO0tBQ2xCLENBQUM7QUFDSixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7TG9jYXRpb259IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQge0FQUF9CT09UU1RSQVBfTElTVEVORVIsIENvbXBvbmVudFJlZiwgSW5qZWN0aW9uVG9rZW59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtSb3V0ZXIsIMm1UmVzdG9yZWRTdGF0ZSBhcyBSZXN0b3JlZFN0YXRlfSBmcm9tICdAYW5ndWxhci9yb3V0ZXInO1xuaW1wb3J0IHtVcGdyYWRlTW9kdWxlfSBmcm9tICdAYW5ndWxhci91cGdyYWRlL3N0YXRpYyc7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBpbml0aWFsaXplciB0aGF0IHNldHMgdXAgYG5nUm91dGVgIGludGVncmF0aW9uXG4gKiBhbG9uZyB3aXRoIHNldHRpbmcgdXAgdGhlIEFuZ3VsYXIgcm91dGVyLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKlxuICogPGNvZGUtZXhhbXBsZSBsYW5ndWFnZT1cInR5cGVzY3JpcHRcIj5cbiAqIEBOZ01vZHVsZSh7XG4gKiAgaW1wb3J0czogW1xuICogICBSb3V0ZXJNb2R1bGUuZm9yUm9vdChTT01FX1JPVVRFUyksXG4gKiAgIFVwZ3JhZGVNb2R1bGVcbiAqIF0sXG4gKiBwcm92aWRlcnM6IFtcbiAqICAgUm91dGVyVXBncmFkZUluaXRpYWxpemVyXG4gKiBdXG4gKiB9KVxuICogZXhwb3J0IGNsYXNzIEFwcE1vZHVsZSB7XG4gKiAgIG5nRG9Cb290c3RyYXAoKSB7fVxuICogfVxuICogPC9jb2RlLWV4YW1wbGU+XG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY29uc3QgUm91dGVyVXBncmFkZUluaXRpYWxpemVyID0ge1xuICBwcm92aWRlOiBBUFBfQk9PVFNUUkFQX0xJU1RFTkVSLFxuICBtdWx0aTogdHJ1ZSxcbiAgdXNlRmFjdG9yeTogbG9jYXRpb25TeW5jQm9vdHN0cmFwTGlzdGVuZXIgYXMgKG5nVXBncmFkZTogVXBncmFkZU1vZHVsZSkgPT4gKCkgPT4gdm9pZCxcbiAgZGVwczogW1VwZ3JhZGVNb2R1bGVdLFxufTtcblxuLyoqXG4gKiBAaW50ZXJuYWxcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxvY2F0aW9uU3luY0Jvb3RzdHJhcExpc3RlbmVyKG5nVXBncmFkZTogVXBncmFkZU1vZHVsZSkge1xuICByZXR1cm4gKCkgPT4ge1xuICAgIHNldFVwTG9jYXRpb25TeW5jKG5nVXBncmFkZSk7XG4gIH07XG59XG5cbi8qKlxuICogU2V0cyB1cCBhIGxvY2F0aW9uIGNoYW5nZSBsaXN0ZW5lciB0byB0cmlnZ2VyIGBoaXN0b3J5LnB1c2hTdGF0ZWAuXG4gKiBXb3JrcyBhcm91bmQgdGhlIHByb2JsZW0gdGhhdCBgb25Qb3BTdGF0ZWAgZG9lcyBub3QgdHJpZ2dlciBgaGlzdG9yeS5wdXNoU3RhdGVgLlxuICogTXVzdCBiZSBjYWxsZWQgKmFmdGVyKiBjYWxsaW5nIGBVcGdyYWRlTW9kdWxlLmJvb3RzdHJhcGAuXG4gKlxuICogQHBhcmFtIG5nVXBncmFkZSBUaGUgdXBncmFkZSBOZ01vZHVsZS5cbiAqIEBwYXJhbSB1cmxUeXBlIFRoZSBsb2NhdGlvbiBzdHJhdGVneS5cbiAqIEBzZWUge0BsaW5rIEhhc2hMb2NhdGlvblN0cmF0ZWd5fVxuICogQHNlZSB7QGxpbmsgUGF0aExvY2F0aW9uU3RyYXRlZ3l9XG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0VXBMb2NhdGlvblN5bmMobmdVcGdyYWRlOiBVcGdyYWRlTW9kdWxlLCB1cmxUeXBlOiAncGF0aCcgfCAnaGFzaCcgPSAncGF0aCcpIHtcbiAgaWYgKCFuZ1VwZ3JhZGUuJGluamVjdG9yKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBcbiAgICAgICAgUm91dGVyVXBncmFkZUluaXRpYWxpemVyIGNhbiBiZSB1c2VkIG9ubHkgYWZ0ZXIgVXBncmFkZU1vZHVsZS5ib290c3RyYXAgaGFzIGJlZW4gY2FsbGVkLlxuICAgICAgICBSZW1vdmUgUm91dGVyVXBncmFkZUluaXRpYWxpemVyIGFuZCBjYWxsIHNldFVwTG9jYXRpb25TeW5jIGFmdGVyIFVwZ3JhZGVNb2R1bGUuYm9vdHN0cmFwLlxuICAgICAgYCk7XG4gIH1cblxuICBjb25zdCByb3V0ZXI6IFJvdXRlciA9IG5nVXBncmFkZS5pbmplY3Rvci5nZXQoUm91dGVyKTtcbiAgY29uc3QgbG9jYXRpb246IExvY2F0aW9uID0gbmdVcGdyYWRlLmluamVjdG9yLmdldChMb2NhdGlvbik7XG5cbiAgbmdVcGdyYWRlLiRpbmplY3RvclxuICAgIC5nZXQoJyRyb290U2NvcGUnKVxuICAgIC4kb24oXG4gICAgICAnJGxvY2F0aW9uQ2hhbmdlU3RhcnQnLFxuICAgICAgKFxuICAgICAgICBldmVudDogYW55LFxuICAgICAgICBuZXdVcmw6IHN0cmluZyxcbiAgICAgICAgb2xkVXJsOiBzdHJpbmcsXG4gICAgICAgIG5ld1N0YXRlPzoge1trOiBzdHJpbmddOiB1bmtub3dufSB8IFJlc3RvcmVkU3RhdGUsXG4gICAgICAgIG9sZFN0YXRlPzoge1trOiBzdHJpbmddOiB1bmtub3dufSB8IFJlc3RvcmVkU3RhdGUsXG4gICAgICApID0+IHtcbiAgICAgICAgLy8gTmF2aWdhdGlvbnMgY29taW5nIGZyb20gQW5ndWxhciByb3V0ZXIgaGF2ZSBhIG5hdmlnYXRpb25JZCBzdGF0ZVxuICAgICAgICAvLyBwcm9wZXJ0eS4gRG9uJ3QgdHJpZ2dlciBBbmd1bGFyIHJvdXRlciBuYXZpZ2F0aW9uIGFnYWluIGlmIGl0IGlzXG4gICAgICAgIC8vIGNhdXNlZCBieSBhIFVSTCBjaGFuZ2UgZnJvbSB0aGUgY3VycmVudCBBbmd1bGFyIHJvdXRlclxuICAgICAgICAvLyBuYXZpZ2F0aW9uLlxuICAgICAgICBjb25zdCBjdXJyZW50TmF2aWdhdGlvbklkID0gcm91dGVyLmdldEN1cnJlbnROYXZpZ2F0aW9uKCk/LmlkO1xuICAgICAgICBjb25zdCBuZXdTdGF0ZU5hdmlnYXRpb25JZCA9IG5ld1N0YXRlPy5uYXZpZ2F0aW9uSWQ7XG4gICAgICAgIGlmIChuZXdTdGF0ZU5hdmlnYXRpb25JZCAhPT0gdW5kZWZpbmVkICYmIG5ld1N0YXRlTmF2aWdhdGlvbklkID09PSBjdXJyZW50TmF2aWdhdGlvbklkKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHVybDtcbiAgICAgICAgaWYgKHVybFR5cGUgPT09ICdwYXRoJykge1xuICAgICAgICAgIHVybCA9IHJlc29sdmVVcmwobmV3VXJsKTtcbiAgICAgICAgfSBlbHNlIGlmICh1cmxUeXBlID09PSAnaGFzaCcpIHtcbiAgICAgICAgICAvLyBSZW1vdmUgdGhlIGZpcnN0IGhhc2ggZnJvbSB0aGUgVVJMXG4gICAgICAgICAgY29uc3QgaGFzaElkeCA9IG5ld1VybC5pbmRleE9mKCcjJyk7XG4gICAgICAgICAgdXJsID0gcmVzb2x2ZVVybChuZXdVcmwuc3Vic3RyaW5nKDAsIGhhc2hJZHgpICsgbmV3VXJsLnN1YnN0cmluZyhoYXNoSWR4ICsgMSkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93ICdJbnZhbGlkIFVSTFR5cGUgcGFzc2VkIHRvIHNldFVwTG9jYXRpb25TeW5jOiAnICsgdXJsVHlwZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwYXRoID0gbG9jYXRpb24ubm9ybWFsaXplKHVybC5wYXRobmFtZSk7XG4gICAgICAgIHJvdXRlci5uYXZpZ2F0ZUJ5VXJsKHBhdGggKyB1cmwuc2VhcmNoICsgdXJsLmhhc2gpO1xuICAgICAgfSxcbiAgICApO1xufVxuXG4vKipcbiAqIE5vcm1hbGl6ZXMgYW5kIHBhcnNlcyBhIFVSTC5cbiAqXG4gKiAtIE5vcm1hbGl6aW5nIG1lYW5zIHRoYXQgYSByZWxhdGl2ZSBVUkwgd2lsbCBiZSByZXNvbHZlZCBpbnRvIGFuIGFic29sdXRlIFVSTCBpbiB0aGUgY29udGV4dCBvZlxuICogICB0aGUgYXBwbGljYXRpb24gZG9jdW1lbnQuXG4gKiAtIFBhcnNpbmcgbWVhbnMgdGhhdCB0aGUgYW5jaG9yJ3MgYHByb3RvY29sYCwgYGhvc3RuYW1lYCwgYHBvcnRgLCBgcGF0aG5hbWVgIGFuZCByZWxhdGVkXG4gKiAgIHByb3BlcnRpZXMgYXJlIGFsbCBwb3B1bGF0ZWQgdG8gcmVmbGVjdCB0aGUgbm9ybWFsaXplZCBVUkwuXG4gKlxuICogV2hpbGUgdGhpcyBhcHByb2FjaCBoYXMgd2lkZSBjb21wYXRpYmlsaXR5LCBpdCBkb2Vzbid0IHdvcmsgYXMgZXhwZWN0ZWQgb24gSUUuIE9uIElFLCBub3JtYWxpemluZ1xuICogaGFwcGVucyBzaW1pbGFyIHRvIG90aGVyIGJyb3dzZXJzLCBidXQgdGhlIHBhcnNlZCBjb21wb25lbnRzIHdpbGwgbm90IGJlIHNldC4gKEUuZy4gaWYgeW91IGFzc2lnblxuICogYGEuaHJlZiA9ICdmb28nYCwgdGhlbiBgYS5wcm90b2NvbGAsIGBhLmhvc3RgLCBldGMuIHdpbGwgbm90IGJlIGNvcnJlY3RseSB1cGRhdGVkLilcbiAqIFdlIHdvcmsgYXJvdW5kIHRoYXQgYnkgcGVyZm9ybWluZyB0aGUgcGFyc2luZyBpbiBhIDJuZCBzdGVwIGJ5IHRha2luZyBhIHByZXZpb3VzbHkgbm9ybWFsaXplZCBVUkxcbiAqIGFuZCBhc3NpZ25pbmcgaXQgYWdhaW4uIFRoaXMgY29ycmVjdGx5IHBvcHVsYXRlcyBhbGwgcHJvcGVydGllcy5cbiAqXG4gKiBTZWVcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIuanMvYmxvYi8yYzc0MDBlN2QwN2IwZjZjZWMxODE3ZGFiNDBiOTI1MGNlOGViY2U2L3NyYy9uZy91cmxVdGlscy5qcyNMMjYtTDMzXG4gKiBmb3IgbW9yZSBpbmZvLlxuICovXG5sZXQgYW5jaG9yOiBIVE1MQW5jaG9yRWxlbWVudCB8IHVuZGVmaW5lZDtcbmZ1bmN0aW9uIHJlc29sdmVVcmwodXJsOiBzdHJpbmcpOiB7cGF0aG5hbWU6IHN0cmluZzsgc2VhcmNoOiBzdHJpbmc7IGhhc2g6IHN0cmluZ30ge1xuICBhbmNob3IgPz89IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcblxuICBhbmNob3Iuc2V0QXR0cmlidXRlKCdocmVmJywgdXJsKTtcbiAgYW5jaG9yLnNldEF0dHJpYnV0ZSgnaHJlZicsIGFuY2hvci5ocmVmKTtcblxuICByZXR1cm4ge1xuICAgIC8vIElFIGRvZXMgbm90IHN0YXJ0IGBwYXRobmFtZWAgd2l0aCBgL2AgbGlrZSBvdGhlciBicm93c2Vycy5cbiAgICBwYXRobmFtZTogYC8ke2FuY2hvci5wYXRobmFtZS5yZXBsYWNlKC9eXFwvLywgJycpfWAsXG4gICAgc2VhcmNoOiBhbmNob3Iuc2VhcmNoLFxuICAgIGhhc2g6IGFuY2hvci5oYXNoLFxuICB9O1xufVxuIl19