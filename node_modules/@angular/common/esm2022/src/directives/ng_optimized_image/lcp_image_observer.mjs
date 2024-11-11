/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { inject, Injectable, ɵformatRuntimeError as formatRuntimeError, PLATFORM_ID, } from '@angular/core';
import { DOCUMENT } from '../../dom_tokens';
import { assertDevMode } from './asserts';
import { imgDirectiveDetails } from './error_helper';
import { getUrl } from './url';
import { isPlatformBrowser } from '../../platform_id';
import * as i0 from "@angular/core";
/**
 * Observer that detects whether an image with `NgOptimizedImage`
 * is treated as a Largest Contentful Paint (LCP) element. If so,
 * asserts that the image has the `priority` attribute.
 *
 * Note: this is a dev-mode only class and it does not appear in prod bundles,
 * thus there is no `ngDevMode` use in the code.
 *
 * Based on https://web.dev/lcp/#measure-lcp-in-javascript.
 */
export class LCPImageObserver {
    constructor() {
        // Map of full image URLs -> original `ngSrc` values.
        this.images = new Map();
        this.window = null;
        this.observer = null;
        const isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
        assertDevMode('LCP checker');
        const win = inject(DOCUMENT).defaultView;
        if (isBrowser && typeof PerformanceObserver !== 'undefined') {
            this.window = win;
            this.observer = this.initPerformanceObserver();
        }
    }
    /**
     * Inits PerformanceObserver and subscribes to LCP events.
     * Based on https://web.dev/lcp/#measure-lcp-in-javascript
     */
    initPerformanceObserver() {
        const observer = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            if (entries.length === 0)
                return;
            // We use the latest entry produced by the `PerformanceObserver` as the best
            // signal on which element is actually an LCP one. As an example, the first image to load on
            // a page, by virtue of being the only thing on the page so far, is often a LCP candidate
            // and gets reported by PerformanceObserver, but isn't necessarily the LCP element.
            const lcpElement = entries[entries.length - 1];
            // Cast to `any` due to missing `element` on the `LargestContentfulPaint` type of entry.
            // See https://developer.mozilla.org/en-US/docs/Web/API/LargestContentfulPaint
            const imgSrc = lcpElement.element?.src ?? '';
            // Exclude `data:` and `blob:` URLs, since they are not supported by the directive.
            if (imgSrc.startsWith('data:') || imgSrc.startsWith('blob:'))
                return;
            const img = this.images.get(imgSrc);
            if (!img)
                return;
            if (!img.priority && !img.alreadyWarnedPriority) {
                img.alreadyWarnedPriority = true;
                logMissingPriorityError(imgSrc);
            }
            if (img.modified && !img.alreadyWarnedModified) {
                img.alreadyWarnedModified = true;
                logModifiedWarning(imgSrc);
            }
        });
        observer.observe({ type: 'largest-contentful-paint', buffered: true });
        return observer;
    }
    registerImage(rewrittenSrc, originalNgSrc, isPriority) {
        if (!this.observer)
            return;
        const newObservedImageState = {
            priority: isPriority,
            modified: false,
            alreadyWarnedModified: false,
            alreadyWarnedPriority: false,
        };
        this.images.set(getUrl(rewrittenSrc, this.window).href, newObservedImageState);
    }
    unregisterImage(rewrittenSrc) {
        if (!this.observer)
            return;
        this.images.delete(getUrl(rewrittenSrc, this.window).href);
    }
    updateImage(originalSrc, newSrc) {
        if (!this.observer)
            return;
        const originalUrl = getUrl(originalSrc, this.window).href;
        const img = this.images.get(originalUrl);
        if (img) {
            img.modified = true;
            this.images.set(getUrl(newSrc, this.window).href, img);
            this.images.delete(originalUrl);
        }
    }
    ngOnDestroy() {
        if (!this.observer)
            return;
        this.observer.disconnect();
        this.images.clear();
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: LCPImageObserver, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: LCPImageObserver, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: LCPImageObserver, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: () => [] });
function logMissingPriorityError(ngSrc) {
    const directiveDetails = imgDirectiveDetails(ngSrc);
    console.error(formatRuntimeError(2955 /* RuntimeErrorCode.LCP_IMG_MISSING_PRIORITY */, `${directiveDetails} this image is the Largest Contentful Paint (LCP) ` +
        `element but was not marked "priority". This image should be marked ` +
        `"priority" in order to prioritize its loading. ` +
        `To fix this, add the "priority" attribute.`));
}
function logModifiedWarning(ngSrc) {
    const directiveDetails = imgDirectiveDetails(ngSrc);
    console.warn(formatRuntimeError(2964 /* RuntimeErrorCode.LCP_IMG_NGSRC_MODIFIED */, `${directiveDetails} this image is the Largest Contentful Paint (LCP) ` +
        `element and has had its "ngSrc" attribute modified. This can cause ` +
        `slower loading performance. It is recommended not to modify the "ngSrc" ` +
        `property on any image which could be the LCP element.`));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGNwX2ltYWdlX29ic2VydmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9kaXJlY3RpdmVzL25nX29wdGltaXplZF9pbWFnZS9sY3BfaW1hZ2Vfb2JzZXJ2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUNMLE1BQU0sRUFDTixVQUFVLEVBRVYsbUJBQW1CLElBQUksa0JBQWtCLEVBQ3pDLFdBQVcsR0FDWixNQUFNLGVBQWUsQ0FBQztBQUV2QixPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sa0JBQWtCLENBQUM7QUFHMUMsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLFdBQVcsQ0FBQztBQUN4QyxPQUFPLEVBQUMsbUJBQW1CLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUNuRCxPQUFPLEVBQUMsTUFBTSxFQUFDLE1BQU0sT0FBTyxDQUFDO0FBQzdCLE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLG1CQUFtQixDQUFDOztBQVNwRDs7Ozs7Ozs7O0dBU0c7QUFFSCxNQUFNLE9BQU8sZ0JBQWdCO0lBTzNCO1FBTkEscURBQXFEO1FBQzdDLFdBQU0sR0FBRyxJQUFJLEdBQUcsRUFBOEIsQ0FBQztRQUUvQyxXQUFNLEdBQWtCLElBQUksQ0FBQztRQUM3QixhQUFRLEdBQStCLElBQUksQ0FBQztRQUdsRCxNQUFNLFNBQVMsR0FBRyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztRQUN6RCxhQUFhLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDN0IsTUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFdBQVcsQ0FBQztRQUN6QyxJQUFJLFNBQVMsSUFBSSxPQUFPLG1CQUFtQixLQUFLLFdBQVcsRUFBRSxDQUFDO1lBQzVELElBQUksQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDO1lB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IEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbmltcG9ydCB7XG4gIGluamVjdCxcbiAgSW5qZWN0YWJsZSxcbiAgT25EZXN0cm95LFxuICDJtWZvcm1hdFJ1bnRpbWVFcnJvciBhcyBmb3JtYXRSdW50aW1lRXJyb3IsXG4gIFBMQVRGT1JNX0lELFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtET0NVTUVOVH0gZnJvbSAnLi4vLi4vZG9tX3Rva2Vucyc7XG5pbXBvcnQge1J1bnRpbWVFcnJvckNvZGV9IGZyb20gJy4uLy4uL2Vycm9ycyc7XG5cbmltcG9ydCB7YXNzZXJ0RGV2TW9kZX0gZnJvbSAnLi9hc3NlcnRzJztcbmltcG9ydCB7aW1nRGlyZWN0aXZlRGV0YWlsc30gZnJvbSAnLi9lcnJvcl9oZWxwZXInO1xuaW1wb3J0IHtnZXRVcmx9IGZyb20gJy4vdXJsJztcbmltcG9ydCB7aXNQbGF0Zm9ybUJyb3dzZXJ9IGZyb20gJy4uLy4uL3BsYXRmb3JtX2lkJztcblxuaW50ZXJmYWNlIE9ic2VydmVkSW1hZ2VTdGF0ZSB7XG4gIHByaW9yaXR5OiBib29sZWFuO1xuICBtb2RpZmllZDogYm9vbGVhbjtcbiAgYWxyZWFkeVdhcm5lZFByaW9yaXR5OiBib29sZWFuO1xuICBhbHJlYWR5V2FybmVkTW9kaWZpZWQ6IGJvb2xlYW47XG59XG5cbi8qKlxuICogT2JzZXJ2ZXIgdGhhdCBkZXRlY3RzIHdoZXRoZXIgYW4gaW1hZ2Ugd2l0aCBgTmdPcHRpbWl6ZWRJbWFnZWBcbiAqIGlzIHRyZWF0ZWQgYXMgYSBMYXJnZXN0IENvbnRlbnRmdWwgUGFpbnQgKExDUCkgZWxlbWVudC4gSWYgc28sXG4gKiBhc3NlcnRzIHRoYXQgdGhlIGltYWdlIGhhcyB0aGUgYHByaW9yaXR5YCBhdHRyaWJ1dGUuXG4gKlxuICogTm90ZTogdGhpcyBpcyBhIGRldi1tb2RlIG9ubHkgY2xhc3MgYW5kIGl0IGRvZXMgbm90IGFwcGVhciBpbiBwcm9kIGJ1bmRsZXMsXG4gKiB0aHVzIHRoZXJlIGlzIG5vIGBuZ0Rldk1vZGVgIHVzZSBpbiB0aGUgY29kZS5cbiAqXG4gKiBCYXNlZCBvbiBodHRwczovL3dlYi5kZXYvbGNwLyNtZWFzdXJlLWxjcC1pbi1qYXZhc2NyaXB0LlxuICovXG5ASW5qZWN0YWJsZSh7cHJvdmlkZWRJbjogJ3Jvb3QnfSlcbmV4cG9ydCBjbGFzcyBMQ1BJbWFnZU9ic2VydmVyIGltcGxlbWVudHMgT25EZXN0cm95IHtcbiAgLy8gTWFwIG9mIGZ1bGwgaW1hZ2UgVVJMcyAtPiBvcmlnaW5hbCBgbmdTcmNgIHZhbHVlcy5cbiAgcHJpdmF0ZSBpbWFnZXMgPSBuZXcgTWFwPHN0cmluZywgT2JzZXJ2ZWRJbWFnZVN0YXRlPigpO1xuXG4gIHByaXZhdGUgd2luZG93OiBXaW5kb3cgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBvYnNlcnZlcjogUGVyZm9ybWFuY2VPYnNlcnZlciB8IG51bGwgPSBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIGNvbnN0IGlzQnJvd3NlciA9IGlzUGxhdGZvcm1Ccm93c2VyKGluamVjdChQTEFURk9STV9JRCkpO1xuICAgIGFzc2VydERldk1vZGUoJ0xDUCBjaGVja2VyJyk7XG4gICAgY29uc3Qgd2luID0gaW5qZWN0KERPQ1VNRU5UKS5kZWZhdWx0VmlldztcbiAgICBpZiAoaXNCcm93c2VyICYmIHR5cGVvZiBQZXJmb3JtYW5jZU9ic2VydmVyICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhpcy53aW5kb3cgPSB3aW47XG4gICAgICB0aGlzLm9ic2VydmVyID0gdGhpcy5pbml0UGVyZm9ybWFuY2VPYnNlcnZlcigpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0cyBQZXJmb3JtYW5jZU9ic2VydmVyIGFuZCBzdWJzY3JpYmVzIHRvIExDUCBldmVudHMuXG4gICAqIEJhc2VkIG9uIGh0dHBzOi8vd2ViLmRldi9sY3AvI21lYXN1cmUtbGNwLWluLWphdmFzY3JpcHRcbiAgICovXG4gIHByaXZhdGUgaW5pdFBlcmZvcm1hbmNlT2JzZXJ2ZXIoKTogUGVyZm9ybWFuY2VPYnNlcnZlciB7XG4gICAgY29uc3Qgb2JzZXJ2ZXIgPSBuZXcgUGVyZm9ybWFuY2VPYnNlcnZlcigoZW50cnlMaXN0KSA9PiB7XG4gICAgICBjb25zdCBlbnRyaWVzID0gZW50cnlMaXN0LmdldEVudHJpZXMoKTtcbiAgICAgIGlmIChlbnRyaWVzLmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xuICAgICAgLy8gV2UgdXNlIHRoZSBsYXRlc3QgZW50cnkgcHJvZHVjZWQgYnkgdGhlIGBQZXJmb3JtYW5jZU9ic2VydmVyYCBhcyB0aGUgYmVzdFxuICAgICAgLy8gc2lnbmFsIG9uIHdoaWNoIGVsZW1lbnQgaXMgYWN0dWFsbHkgYW4gTENQIG9uZS4gQXMgYW4gZXhhbXBsZSwgdGhlIGZpcnN0IGltYWdlIHRvIGxvYWQgb25cbiAgICAgIC8vIGEgcGFnZSwgYnkgdmlydHVlIG9mIGJlaW5nIHRoZSBvbmx5IHRoaW5nIG9uIHRoZSBwYWdlIHNvIGZhciwgaXMgb2Z0ZW4gYSBMQ1AgY2FuZGlkYXRlXG4gICAgICAvLyBhbmQgZ2V0cyByZXBvcnRlZCBieSBQZXJmb3JtYW5jZU9ic2VydmVyLCBidXQgaXNuJ3QgbmVjZXNzYXJpbHkgdGhlIExDUCBlbGVtZW50LlxuICAgICAgY29uc3QgbGNwRWxlbWVudCA9IGVudHJpZXNbZW50cmllcy5sZW5ndGggLSAxXTtcblxuICAgICAgLy8gQ2FzdCB0byBgYW55YCBkdWUgdG8gbWlzc2luZyBgZWxlbWVudGAgb24gdGhlIGBMYXJnZXN0Q29udGVudGZ1bFBhaW50YCB0eXBlIG9mIGVudHJ5LlxuICAgICAgLy8gU2VlIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9MYXJnZXN0Q29udGVudGZ1bFBhaW50XG4gICAgICBjb25zdCBpbWdTcmMgPSAobGNwRWxlbWVudCBhcyBhbnkpLmVsZW1lbnQ/LnNyYyA/PyAnJztcblxuICAgICAgLy8gRXhjbHVkZSBgZGF0YTpgIGFuZCBgYmxvYjpgIFVSTHMsIHNpbmNlIHRoZXkgYXJlIG5vdCBzdXBwb3J0ZWQgYnkgdGhlIGRpcmVjdGl2ZS5cbiAgICAgIGlmIChpbWdTcmMuc3RhcnRzV2l0aCgnZGF0YTonKSB8fCBpbWdTcmMuc3RhcnRzV2l0aCgnYmxvYjonKSkgcmV0dXJuO1xuXG4gICAgICBjb25zdCBpbWcgPSB0aGlzLmltYWdlcy5nZXQoaW1nU3JjKTtcbiAgICAgIGlmICghaW1nKSByZXR1cm47XG4gICAgICBpZiAoIWltZy5wcmlvcml0eSAmJiAhaW1nLmFscmVhZHlXYXJuZWRQcmlvcml0eSkge1xuICAgICAgICBpbWcuYWxyZWFkeVdhcm5lZFByaW9yaXR5ID0gdHJ1ZTtcbiAgICAgICAgbG9nTWlzc2luZ1ByaW9yaXR5RXJyb3IoaW1nU3JjKTtcbiAgICAgIH1cbiAgICAgIGlmIChpbWcubW9kaWZpZWQgJiYgIWltZy5hbHJlYWR5V2FybmVkTW9kaWZpZWQpIHtcbiAgICAgICAgaW1nLmFscmVhZHlXYXJuZWRNb2RpZmllZCA9IHRydWU7XG4gICAgICAgIGxvZ01vZGlmaWVkV2FybmluZyhpbWdTcmMpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIG9ic2VydmVyLm9ic2VydmUoe3R5cGU6ICdsYXJnZXN0LWNvbnRlbnRmdWwtcGFpbnQnLCBidWZmZXJlZDogdHJ1ZX0pO1xuICAgIHJldHVybiBvYnNlcnZlcjtcbiAgfVxuXG4gIHJlZ2lzdGVySW1hZ2UocmV3cml0dGVuU3JjOiBzdHJpbmcsIG9yaWdpbmFsTmdTcmM6IHN0cmluZywgaXNQcmlvcml0eTogYm9vbGVhbikge1xuICAgIGlmICghdGhpcy5vYnNlcnZlcikgcmV0dXJuO1xuICAgIGNvbnN0IG5ld09ic2VydmVkSW1hZ2VTdGF0ZTogT2JzZXJ2ZWRJbWFnZVN0YXRlID0ge1xuICAgICAgcHJpb3JpdHk6IGlzUHJpb3JpdHksXG4gICAgICBtb2RpZmllZDogZmFsc2UsXG4gICAgICBhbHJlYWR5V2FybmVkTW9kaWZpZWQ6IGZhbHNlLFxuICAgICAgYWxyZWFkeVdhcm5lZFByaW9yaXR5OiBmYWxzZSxcbiAgICB9O1xuICAgIHRoaXMuaW1hZ2VzLnNldChnZXRVcmwocmV3cml0dGVuU3JjLCB0aGlzLndpbmRvdyEpLmhyZWYsIG5ld09ic2VydmVkSW1hZ2VTdGF0ZSk7XG4gIH1cblxuICB1bnJlZ2lzdGVySW1hZ2UocmV3cml0dGVuU3JjOiBzdHJpbmcpIHtcbiAgICBpZiAoIXRoaXMub2JzZXJ2ZXIpIHJldHVybjtcbiAgICB0aGlzLmltYWdlcy5kZWxldGUoZ2V0VXJsKHJld3JpdHRlblNyYywgdGhpcy53aW5kb3chKS5ocmVmKTtcbiAgfVxuXG4gIHVwZGF0ZUltYWdlKG9yaWdpbmFsU3JjOiBzdHJpbmcsIG5ld1NyYzogc3RyaW5nKSB7XG4gICAgaWYgKCF0aGlzLm9ic2VydmVyKSByZXR1cm47XG4gICAgY29uc3Qgb3JpZ2luYWxVcmwgPSBnZXRVcmwob3JpZ2luYWxTcmMsIHRoaXMud2luZG93ISkuaHJlZjtcbiAgICBjb25zdCBpbWcgPSB0aGlzLmltYWdlcy5nZXQob3JpZ2luYWxVcmwpO1xuICAgIGlmIChpbWcpIHtcbiAgICAgIGltZy5tb2RpZmllZCA9IHRydWU7XG4gICAgICB0aGlzLmltYWdlcy5zZXQoZ2V0VXJsKG5ld1NyYywgdGhpcy53aW5kb3chKS5ocmVmLCBpbWcpO1xuICAgICAgdGhpcy5pbWFnZXMuZGVsZXRlKG9yaWdpbmFsVXJsKTtcbiAgICB9XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICBpZiAoIXRoaXMub2JzZXJ2ZXIpIHJldHVybjtcbiAgICB0aGlzLm9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbiAgICB0aGlzLmltYWdlcy5jbGVhcigpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGxvZ01pc3NpbmdQcmlvcml0eUVycm9yKG5nU3JjOiBzdHJpbmcpIHtcbiAgY29uc3QgZGlyZWN0aXZlRGV0YWlscyA9IGltZ0RpcmVjdGl2ZURldGFpbHMobmdTcmMpO1xuICBjb25zb2xlLmVycm9yKFxuICAgIGZvcm1hdFJ1bnRpbWVFcnJvcihcbiAgICAgIFJ1bnRpbWVFcnJvckNvZGUuTENQX0lNR19NSVNTSU5HX1BSSU9SSVRZLFxuICAgICAgYCR7ZGlyZWN0aXZlRGV0YWlsc30gdGhpcyBpbWFnZSBpcyB0aGUgTGFyZ2VzdCBDb250ZW50ZnVsIFBhaW50IChMQ1ApIGAgK1xuICAgICAgICBgZWxlbWVudCBidXQgd2FzIG5vdCBtYXJrZWQgXCJwcmlvcml0eVwiLiBUaGlzIGltYWdlIHNob3VsZCBiZSBtYXJrZWQgYCArXG4gICAgICAgIGBcInByaW9yaXR5XCIgaW4gb3JkZXIgdG8gcHJpb3JpdGl6ZSBpdHMgbG9hZGluZy4gYCArXG4gICAgICAgIGBUbyBmaXggdGhpcywgYWRkIHRoZSBcInByaW9yaXR5XCIgYXR0cmlidXRlLmAsXG4gICAgKSxcbiAgKTtcbn1cblxuZnVuY3Rpb24gbG9nTW9kaWZpZWRXYXJuaW5nKG5nU3JjOiBzdHJpbmcpIHtcbiAgY29uc3QgZGlyZWN0aXZlRGV0YWlscyA9IGltZ0RpcmVjdGl2ZURldGFpbHMobmdTcmMpO1xuICBjb25zb2xlLndhcm4oXG4gICAgZm9ybWF0UnVudGltZUVycm9yKFxuICAgICAgUnVudGltZUVycm9yQ29kZS5MQ1BfSU1HX05HU1JDX01PRElGSUVELFxuICAgICAgYCR7ZGlyZWN0aXZlRGV0YWlsc30gdGhpcyBpbWFnZSBpcyB0aGUgTGFyZ2VzdCBDb250ZW50ZnVsIFBhaW50IChMQ1ApIGAgK1xuICAgICAgICBgZWxlbWVudCBhbmQgaGFzIGhhZCBpdHMgXCJuZ1NyY1wiIGF0dHJpYnV0ZSBtb2RpZmllZC4gVGhpcyBjYW4gY2F1c2UgYCArXG4gICAgICAgIGBzbG93ZXIgbG9hZGluZyBwZXJmb3JtYW5jZS4gSXQgaXMgcmVjb21tZW5kZWQgbm90IHRvIG1vZGlmeSB0aGUgXCJuZ1NyY1wiIGAgK1xuICAgICAgICBgcHJvcGVydHkgb24gYW55IGltYWdlIHdoaWNoIGNvdWxkIGJlIHRoZSBMQ1AgZWxlbWVudC5gLFxuICAgICksXG4gICk7XG59XG4iXX0=