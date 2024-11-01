/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ɵformatRuntimeError as formatRuntimeError, ɵRuntimeError as RuntimeError, } from '@angular/core';
import { isAbsoluteUrl, isValidPath } from '../url';
import { IMAGE_LOADER } from './image_loader';
import { PLACEHOLDER_QUALITY } from './constants';
/**
 * Name and URL tester for Netlify.
 */
export const netlifyLoaderInfo = {
    name: 'Netlify',
    testUrl: isNetlifyUrl,
};
const NETLIFY_LOADER_REGEX = /https?\:\/\/[^\/]+\.netlify\.app\/.+/;
/**
 * Tests whether a URL is from a Netlify site. This won't catch sites with a custom domain,
 * but it's a good start for sites in development. This is only used to warn users who haven't
 * configured an image loader.
 */
function isNetlifyUrl(url) {
    return NETLIFY_LOADER_REGEX.test(url);
}
/**
 * Function that generates an ImageLoader for Netlify and turns it into an Angular provider.
 *
 * @param path optional URL of the desired Netlify site. Defaults to the current site.
 * @returns Set of providers to configure the Netlify loader.
 *
 * @publicApi
 */
export function provideNetlifyLoader(path) {
    if (path && !isValidPath(path)) {
        throw new RuntimeError(2959 /* RuntimeErrorCode.INVALID_LOADER_ARGUMENTS */, ngDevMode &&
            `Image loader has detected an invalid path (\`${path}\`). ` +
                `To fix this, supply either the full URL to the Netlify site, or leave it empty to use the current site.`);
    }
    if (path) {
        const url = new URL(path);
        path = url.origin;
    }
    const loaderFn = (config) => {
        return createNetlifyUrl(config, path);
    };
    const providers = [{ provide: IMAGE_LOADER, useValue: loaderFn }];
    return providers;
}
const validParams = new Map([
    ['height', 'h'],
    ['fit', 'fit'],
    ['quality', 'q'],
    ['q', 'q'],
    ['position', 'position'],
]);
function createNetlifyUrl(config, path) {
    // Note: `path` can be undefined, in which case we use a fake one to construct a `URL` instance.
    const url = new URL(path ?? 'https://a/');
    url.pathname = '/.netlify/images';
    if (!isAbsoluteUrl(config.src) && !config.src.startsWith('/')) {
        config.src = '/' + config.src;
    }
    url.searchParams.set('url', config.src);
    if (config.width) {
        url.searchParams.set('w', config.width.toString());
    }
    // When requesting a placeholder image we ask for a low quality image to reduce the load time.
    // If the quality is specified in the loader config - always use provided value.
    const configQuality = config.loaderParams?.['quality'] ?? config.loaderParams?.['q'];
    if (config.isPlaceholder && !configQuality) {
        url.searchParams.set('q', PLACEHOLDER_QUALITY);
    }
    for (const [param, value] of Object.entries(config.loaderParams ?? {})) {
        if (validParams.has(param)) {
            url.searchParams.set(validParams.get(param), value.toString());
        }
        else {
            if (ngDevMode) {
                console.warn(formatRuntimeError(2959 /* RuntimeErrorCode.INVALID_LOADER_ARGUMENTS */, `The Netlify image loader has detected an \`<img>\` tag with the unsupported attribute "\`${param}\`".`));
            }
        }
    }
    // The "a" hostname is used for relative URLs, so we can remove it from the final URL.
    return url.hostname === 'a' ? url.href.replace(url.origin, '') : url.href;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmV0bGlmeV9sb2FkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2RpcmVjdGl2ZXMvbmdfb3B0aW1pemVkX2ltYWdlL2ltYWdlX2xvYWRlcnMvbmV0bGlmeV9sb2FkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUVMLG1CQUFtQixJQUFJLGtCQUFrQixFQUN6QyxhQUFhLElBQUksWUFBWSxHQUM5QixNQUFNLGVBQWUsQ0FBQztBQUd2QixPQUFPLEVBQUMsYUFBYSxFQUFFLFdBQVcsRUFBQyxNQUFNLFFBQVEsQ0FBQztBQUVsRCxPQUFPLEVBQUMsWUFBWSxFQUFxQyxNQUFNLGdCQUFnQixDQUFDO0FBQ2hGLE9BQU8sRUFBQyxtQkFBbUIsRUFBQyxNQUFNLGFBQWEsQ0FBQztBQUVoRDs7R0FFRztBQUNILE1BQU0sQ0FBQyxNQUFNLGlCQUFpQixHQUFvQjtJQUNoRCxJQUFJLEVBQUUsU0FBUztJQUNmLE9BQU8sRUFBRSxZQUFZO0NBQ3RCLENBQUM7QUFFRixNQUFNLG9CQUFvQixHQUFHLHNDQUFzQyxDQUFDO0FBRXBFOzs7O0dBSUc7QUFDSCxTQUFTLFlBQVksQ0FBQyxHQUFXO0lBQy9CLE9BQU8sb0JBQW9CLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3hDLENBQUM7QUFFRDs7Ozs7OztHQU9HO0FBQ0gsTUFBTSxVQUFVLG9CQUFvQixDQUFDLElBQWE7SUFDaEQsSUFBSSxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztRQUMvQixNQUFNLElBQUksWUFBWSx1REFFcEIsU0FBUztZQUNQLGdEQUFnRCxJQUFJLE9BQU87Z0JBQ3pELHlHQUF5RyxDQUM5RyxDQUFDO0lBQ0osQ0FBQztJQUVELElBQUksSUFBSSxFQUFFLENBQUM7UUFDVCxNQUFNLEdBQUcsR0FBRyxJ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QUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQztBQUM1RSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuZGV2L2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1xuICBQcm92aWRlcixcbiAgybVmb3JtYXRSdW50aW1lRXJyb3IgYXMgZm9ybWF0UnVudGltZUVycm9yLFxuICDJtVJ1bnRpbWVFcnJvciBhcyBSdW50aW1lRXJyb3IsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge1J1bnRpbWVFcnJvckNvZGV9IGZyb20gJy4uLy4uLy4uL2Vycm9ycyc7XG5pbXBvcnQge2lzQWJzb2x1dGVVcmwsIGlzVmFsaWRQYXRofSBmcm9tICcuLi91cmwnO1xuXG5pbXBvcnQge0lNQUdFX0xPQURFUiwgSW1hZ2VMb2FkZXJDb25maWcsIEltYWdlTG9hZGVySW5mb30gZnJvbSAnLi9pbWFnZV9sb2FkZXInO1xuaW1wb3J0IHtQTEFDRUhPTERFUl9RVUFMSVRZfSBmcm9tICcuL2NvbnN0YW50cyc7XG5cbi8qKlxuICogTmFtZSBhbmQgVVJMIHRlc3RlciBmb3IgTmV0bGlmeS5cbiAqL1xuZXhwb3J0IGNvbnN0IG5ldGxpZnlMb2FkZXJJbmZvOiBJbWFnZUxvYWRlckluZm8gPSB7XG4gIG5hbWU6ICdOZXRsaWZ5JyxcbiAgdGVzdFVybDogaXNOZXRsaWZ5VXJsLFxufTtcblxuY29uc3QgTkVUTElGWV9MT0FERVJfUkVHRVggPSAvaHR0cHM/XFw6XFwvXFwvW15cXC9dK1xcLm5ldGxpZnlcXC5hcHBcXC8uKy87XG5cbi8qKlxuICogVGVzdHMgd2hldGhlciBhIFVSTCBpcyBmcm9tIGEgTmV0bGlmeSBzaXRlLiBUaGlzIHdvbid0IGNhdGNoIHNpdGVzIHdpdGggYSBjdXN0b20gZG9tYWluLFxuICogYnV0IGl0J3MgYSBnb29kIHN0YXJ0IGZvciBzaXRlcyBpbiBkZXZlbG9wbWVudC4gVGhpcyBpcyBvbmx5IHVzZWQgdG8gd2FybiB1c2VycyB3aG8gaGF2ZW4ndFxuICogY29uZmlndXJlZCBhbiBpbWFnZSBsb2FkZXIuXG4gKi9cbmZ1bmN0aW9uIGlzTmV0bGlmeVVybCh1cmw6IHN0cmluZyk6IGJvb2xlYW4ge1xuICByZXR1cm4gTkVUTElGWV9MT0FERVJfUkVHRVgudGVzdCh1cmwpO1xufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHRoYXQgZ2VuZXJhdGVzIGFuIEltYWdlTG9hZGVyIGZvciBOZXRsaWZ5IGFuZCB0dXJucyBpdCBpbnRvIGFuIEFuZ3VsYXIgcHJvdmlkZXIuXG4gKlxuICogQHBhcmFtIHBhdGggb3B0aW9uYWwgVVJMIG9mIHRoZSBkZXNpcmVkIE5ldGxpZnkgc2l0ZS4gRGVmYXVsdHMgdG8gdGhlIGN1cnJlbnQgc2l0ZS5cbiAqIEByZXR1cm5zIFNldCBvZiBwcm92aWRlcnMgdG8gY29uZmlndXJlIHRoZSBOZXRsaWZ5IGxvYWRlci5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwcm92aWRlTmV0bGlmeUxvYWRlcihwYXRoPzogc3RyaW5nKSB7XG4gIGlmIChwYXRoICYmICFpc1ZhbGlkUGF0aChwYXRoKSkge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfTE9BREVSX0FSR1VNRU5UUyxcbiAgICAgIG5nRGV2TW9kZSAmJlxuICAgICAgICBgSW1hZ2UgbG9hZGVyIGhhcyBkZXRlY3RlZCBhbiBpbnZhbGlkIHBhdGggKFxcYCR7cGF0aH1cXGApLiBgICtcbiAgICAgICAgICBgVG8gZml4IHRoaXMsIHN1cHBseSBlaXRoZXIgdGhlIGZ1bGwgVVJMIHRvIHRoZSBOZXRsaWZ5IHNpdGUsIG9yIGxlYXZlIGl0IGVtcHR5IHRvIHVzZSB0aGUgY3VycmVudCBzaXRlLmAsXG4gICAgKTtcbiAgfVxuXG4gIGlmIChwYXRoKSB7XG4gICAgY29uc3QgdXJsID0gbmV3IFVSTChwYXRoKTtcbiAgICBwYXRoID0gdXJsLm9yaWdpbjtcbiAgfVxuXG4gIGNvbnN0IGxvYWRlckZuID0gKGNvbmZpZzogSW1hZ2VMb2FkZXJDb25maWcpID0+IHtcbiAgICByZXR1cm4gY3JlYXRlTmV0bGlmeVVybChjb25maWcsIHBhdGgpO1xuICB9O1xuXG4gIGNvbnN0IHByb3ZpZGVyczogUHJvdmlkZXJbXSA9IFt7cHJvdmlkZTogSU1BR0VfTE9BREVSLCB1c2VWYWx1ZTogbG9hZGVyRm59XTtcbiAgcmV0dXJuIHByb3ZpZGVycztcbn1cblxuY29uc3QgdmFsaWRQYXJhbXMgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nPihbXG4gIFsnaGVpZ2h0JywgJ2gnXSxcbiAgWydmaXQnLCAnZml0J10sXG4gIFsncXVhbGl0eScsICdxJ10sXG4gIFsncScsICdxJ10sXG4gIFsncG9zaXRpb24nLCAncG9zaXRpb24nXSxcbl0pO1xuXG5mdW5jdGlvbiBjcmVhdGVOZXRsaWZ5VXJsKGNvbmZpZzogSW1hZ2VMb2FkZXJDb25maWcsIHBhdGg/OiBzdHJpbmcpIHtcbiAgLy8gTm90ZTogYHBhdGhgIGNhbiBiZSB1bmRlZmluZWQsIGluIHdoaWNoIGNhc2Ugd2UgdXNlIGEgZmFrZSBvbmUgdG8gY29uc3RydWN0IGEgYFVSTGAgaW5zdGFuY2UuXG4gIGNvbnN0IHVybCA9IG5ldyBVUkwocGF0aCA/PyAnaHR0cHM6Ly9hLycpO1xuICB1cmwucGF0aG5hbWUgPSAnLy5uZXRsaWZ5L2ltYWdlcyc7XG5cbiAgaWYgKCFpc0Fic29sdXRlVXJsKGNvbmZpZy5zcmMpICYmICFjb25maWcuc3JjLnN0YXJ0c1dpdGgoJy8nKSkge1xuICAgIGNvbmZpZy5zcmMgPSAnLycgKyBjb25maWcuc3JjO1xuICB9XG5cbiAgdXJsLnNlYXJjaFBhcmFtcy5zZXQoJ3VybCcsIGNvbmZpZy5zcmMpO1xuXG4gIGlmIChjb25maWcud2lkdGgpIHtcbiAgICB1cmwuc2VhcmNoUGFyYW1zLnNldCgndycsIGNvbmZpZy53aWR0aC50b1N0cmluZygpKTtcbiAgfVxuXG4gIC8vIFdoZW4gcmVxdWVzdGluZyBhIHBsYWNlaG9sZGVyIGltYWdlIHdlIGFzayBmb3IgYSBsb3cgcXVhbGl0eSBpbWFnZSB0byByZWR1Y2UgdGhlIGxvYWQgdGltZS5cbiAgLy8gSWYgdGhlIHF1YWxpdHkgaXMgc3BlY2lmaWVkIGluIHRoZSBsb2FkZXIgY29uZmlnIC0gYWx3YXlzIHVzZSBwcm92aWRlZCB2YWx1ZS5cbiAgY29uc3QgY29uZmlnUXVhbGl0eSA9IGNvbmZpZy5sb2FkZXJQYXJhbXM/LlsncXVhbGl0eSddID8/IGNvbmZpZy5sb2FkZXJQYXJhbXM/LlsncSddO1xuICBpZiAoY29uZmlnLmlzUGxhY2Vob2xkZXIgJiYgIWNvbmZpZ1F1YWxpdHkpIHtcbiAgICB1cmwuc2VhcmNoUGFyYW1zLnNldCgncScsIFBMQUNFSE9MREVSX1FVQUxJVFkpO1xuICB9XG5cbiAgZm9yIChjb25zdCBbcGFyYW0sIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhjb25maWcubG9hZGVyUGFyYW1zID8/IHt9KSkge1xuICAgIGlmICh2YWxpZFBhcmFtcy5oYXMocGFyYW0pKSB7XG4gICAgICB1cmwuc2VhcmNoUGFyYW1zLnNldCh2YWxpZFBhcmFtcy5nZXQocGFyYW0pISwgdmFsdWUudG9TdHJpbmcoKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChuZ0Rldk1vZGUpIHtcbiAgICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAgIGZvcm1hdFJ1bnRpbWVFcnJvcihcbiAgICAgICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9MT0FERVJfQVJHVU1FTlRTLFxuICAgICAgICAgICAgYFRoZSBOZXRsaWZ5IGltYWdlIGxvYWRlciBoYXMgZGV0ZWN0ZWQgYW4gXFxgPGltZz5cXGAgdGFnIHdpdGggdGhlIHVuc3VwcG9ydGVkIGF0dHJpYnV0ZSBcIlxcYCR7cGFyYW19XFxgXCIuYCxcbiAgICAgICAgICApLFxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICAvLyBUaGUgXCJhXCIgaG9zdG5hbWUgaXMgdXNlZCBmb3IgcmVsYXRpdmUgVVJMcywgc28gd2UgY2FuIHJlbW92ZSBpdCBmcm9tIHRoZSBmaW5hbCBVUkwuXG4gIHJldHVybiB1cmwuaG9zdG5hbWUgPT09ICdhJyA/IHVybC5ocmVmLnJlcGxhY2UodXJsLm9yaWdpbiwgJycpIDogdXJsLmhyZWY7XG59XG4iXX0=