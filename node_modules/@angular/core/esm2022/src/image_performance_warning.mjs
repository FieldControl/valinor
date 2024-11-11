/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { IMAGE_CONFIG, PLATFORM_ID } from './application/application_tokens';
import { Injectable } from './di';
import { inject } from './di/injector_compatibility';
import { formatRuntimeError } from './errors';
import { getDocument } from './render3/interfaces/document';
import * as i0 from "./r3_symbols";
// A delay in milliseconds before the scan is run after onLoad, to avoid any
// potential race conditions with other LCP-related functions. This delay
// happens outside of the main JavaScript execution and will only effect the timing
// on when the warning becomes visible in the console.
const SCAN_DELAY = 200;
const OVERSIZED_IMAGE_TOLERANCE = 1200;
export class ImagePerformanceWarning {
    constructor() {
        // Map of full image URLs -> original `ngSrc` values.
        this.window = null;
        this.observer = null;
        this.options = inject(IMAGE_CONFIG);
        this.isBrowser = inject(PLATFORM_ID) === 'browser';
    }
    start() {
        if (!this.isBrowser ||
            typeof PerformanceObserver === 'undefined' ||
            (this.options?.disableImageSizeWarning && this.options?.disableImageLazyLoadWarning)) {
            return;
        }
        this.observer = this.initPerformanceObserver();
        const doc = getDocument();
        const win = doc.defaultView;
        if (typeof win !== 'undefined') {
            this.window = win;
            // Wait to avoid race conditions where LCP image triggers
            // load event before it's recorded by the performance observer
            const waitToScan = () => {
                setTimeout(this.scanImages.bind(this), SCAN_DELAY);
            };
            const setup = () => {
                // Consider the case when the application is created and destroyed multiple times.
                // Typically, applications are created instantly once the page is loaded, and the
                // `window.load` listener is always triggered. However, the `window.load` event will never
                // be fired if the page is loaded, and the application is created later. Checking for
                // `readyState` is the easiest way to determine whether the page has been loaded or not.
                if (doc.readyState === 'complete') {
                    waitToScan();
                }
                else {
                    this.window?.addEventListener('load', waitToScan, { once: true });
                }
            };
            // Angular doesn't have to run change detection whenever any asynchronous tasks are invoked in
            // the scope of this functionality.
            if (typeof Zone !== 'undefined') {
                Zone.root.run(() => setup());
            }
            else {
                setup();
            }
        }
    }
    ngOnDestroy() {
        this.observer?.disconnect();
    }
    initPerformanceObserver() {
        if (typeof PerformanceObserver === 'undefined') {
            return null;
        }
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
            // Exclude `data:` and `blob:` URLs, since they are fetched resources.
            if (imgSrc.startsWith('data:') || imgSrc.startsWith('blob:'))
                return;
            this.lcpImageUrl = imgSrc;
        });
        observer.observe({ type: 'largest-contentful-paint', buffered: true });
        return observer;
    }
    scanImages() {
        const images = getDocument().querySelectorAll('img');
        let lcpElementFound, lcpElementLoadedCorrectly = false;
        images.forEach((image) => {
            if (!this.options?.disableImageSizeWarning) {
                // Image elements using the NgOptimizedImage directive are excluded,
                // as that directive has its own version of this check.
                if (!image.getAttribute('ng-img') && this.isOversized(image)) {
                    logOversizedImageWarning(image.src);
                }
            }
            if (!this.options?.disableImageLazyLoadWarning && this.lcpImageUrl) {
                if (image.src === this.lcpImageUrl) {
                    lcpElementFound = true;
                    if (image.loading !== 'lazy' || image.getAttribute('ng-img')) {
                        // This variable is set to true and never goes back to false to account
                        // for the case where multiple images have the same src url, and some
                        // have lazy loading while others don't.
                        // Also ignore NgOptimizedImage because there's a different warning for that.
                        lcpElementLoadedCorrectly = true;
                    }
                }
            }
        });
        if (lcpElementFound &&
            !lcpElementLoadedCorrectly &&
            this.lcpImageUrl &&
            !this.options?.disableImageLazyLoadWarning) {
            logLazyLCPWarning(this.lcpImageUrl);
        }
    }
    isOversized(image) {
        if (!this.window) {
            return false;
        }
        // The `isOversized` check may not be applicable or may require adjustments
        // for several types of image formats or scenarios. Currently, we specify only
        // `svg`, but this may also include `gif` since their quality isn’t tied to
        // dimensions in the same way as raster images.
        const nonOversizedImageExtentions = [
            // SVG images are vector-based, which means they can scale
            // to any size without losing quality.
            '.svg',
        ];
        // Convert it to lowercase because this may have uppercase
        // extensions, such as `IMAGE.SVG`.
        // We fallback to an empty string because `src` may be `undefined`
        // if it is explicitly set to `null` by some third-party code
        // (e.g., `image.src = null`).
        const imageSource = (image.src || '').toLowerCase();
        if (nonOversizedImageExtentions.some((extension) => imageSource.endsWith(extension))) {
            return false;
        }
        const computedStyle = this.window.getComputedStyle(image);
        let renderedWidth = parseFloat(computedStyle.getPropertyValue('width'));
        let renderedHeight = parseFloat(computedStyle.getPropertyValue('height'));
        const boxSizing = computedStyle.getPropertyValue('box-sizing');
        const objectFit = computedStyle.getPropertyValue('object-fit');
        if (objectFit === `cover`) {
            // Object fit cover may indicate a use case such as a sprite sheet where
            // this warning does not apply.
            return false;
        }
        if (boxSizing === 'border-box') {
            // If the image `box-sizing` is set to `border-box`, we adjust the rendered
            // dimensions by subtracting padding values.
            const paddingTop = computedStyle.getPropertyValue('padding-top');
            const paddingRight = computedStyle.getPropertyValue('padding-right');
            const paddingBottom = computedStyle.getPropertyValue('padding-bottom');
            const paddingLeft = computedStyle.getPropertyValue('padding-left');
            renderedWidth -= parseFloat(paddingRight) + parseFloat(paddingLeft);
            renderedHeight -= parseFloat(paddingTop) + parseFloat(paddingBottom);
        }
        const intrinsicWidth = image.naturalWidth;
        const intrinsicHeight = image.naturalHeight;
        const recommendedWidth = this.window.devicePixelRatio * renderedWidth;
        const recommendedHeight = this.window.devicePixelRatio * renderedHeight;
        const oversizedWidth = intrinsicWidth - recommendedWidth >= OVERSIZED_IMAGE_TOLERANCE;
        const oversizedHeight = intrinsicHeight - recommendedHeight >= OVERSIZED_IMAGE_TOLERANCE;
        return oversizedWidth || oversizedHeight;
    }
    static { this.ɵfac = function ImagePerformanceWarning_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || ImagePerformanceWarning)(); }; }
    static { this.ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: ImagePerformanceWarning, factory: ImagePerformanceWarning.ɵfac, providedIn: 'root' }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.setClassMetadata(ImagePerformanceWarning, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], null, null); })();
function logLazyLCPWarning(src) {
    console.warn(formatRuntimeError(-913 /* RuntimeErrorCode.IMAGE_PERFORMANCE_WARNING */, `An image with src ${src} is the Largest Contentful Paint (LCP) element ` +
        `but was given a "loading" value of "lazy", which can negatively impact ` +
        `application loading performance. This warning can be addressed by ` +
        `changing the loading value of the LCP image to "eager", or by using the ` +
        `NgOptimizedImage directive's prioritization utilities. For more ` +
        `information about addressing or disabling this warning, see ` +
        `https://angular.dev/errors/NG0913`));
}
function logOversizedImageWarning(src) {
    console.warn(formatRuntimeError(-913 /* RuntimeErrorCode.IMAGE_PERFORMANCE_WARNING */, `An image with src ${src} has intrinsic file dimensions much larger than its ` +
        `rendered size. This can negatively impact application loading performance. ` +
        `For more information about addressing or disabling this warning, see ` +
        `https://angular.dev/errors/NG0913`));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1hZ2VfcGVyZm9ybWFuY2Vfd2FybmluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc3JjL2ltYWdlX3BlcmZvcm1hbmNlX3dhcm5pbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFlBQVksRUFBZSxXQUFXLEVBQUMsTUFBTSxrQ0FBa0MsQ0FBQztBQUN4RixPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQ2hDLE9BQU8sRUFBQyxNQUFNLEVBQUMsTUFBTSw2QkFBNkIsQ0FBQztBQUNuRCxPQUFPLEVBQUMsa0JBQWtCLEVBQW1CLE1BQU0sVUFBVSxDQUFDO0FBRTlELE9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSwrQkFBK0IsQ0FBQzs7QUFFMUQsNEVBQTRFO0FBQzVFLHlFQUF5RTtBQUN6RSxtRkFBbUY7QUFDbkYsc0RBQXNEO0FBQ3RELE1BQU0sVUFBVSxHQUFHLEdBQUcsQ0FBQztBQUV2QixNQUFNLHlCQUF5QixHQUFHLElBQUksQ0FBQztBQUd2QyxNQUFNLE9BQU8sdUJBQXVCO0lBRHBDO1FBRUUscURBQXFEO1FBQzdDLFdBQU0sR0FBa0IsSUFBSSxDQUFDO1FBQzdCLGFBQVEsR0FBK0IsSUFBSSxDQUFDO1FBQzVDLFlBQU8sR0FBZ0IsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ25DLGNBQVMsR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDLEtBQUssU0FBUyxDQUFDO0tBcUtoRTtJQWxLUSxLQUFLO1FBQ1YsSUFDRSxDQUFDLElBQUksQ0FBQyxTQUFTO1lBQ2YsT0FBTyxtQkFBbUIsS0FBSyxXQUFXO1lBQzFDLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSx1QkFBdUIsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLDJCQUEyQixDQUFDLEVBQ3BGLENBQUM7WUFDRCxPQUFPO1FBQ1QsQ0FBQztRQUNELElB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RSx5RUFBeUU7UUFDekUsb0VBQW9FO1FBQ3BFLDBFQUEwRTtRQUMxRSxrRUFBa0U7UUFDbEUsOERBQThEO1FBQzlELG1DQUFtQyxDQUN0QyxDQUNGLENBQUM7QUFDSixDQUFDO0FBRUQsU0FBUyx3QkFBd0IsQ0FBQyxHQUFXO0lBQzNDLE9BQU8sQ0FBQyxJQUFJLENBQ1Ysa0JBQWtCLHdEQUVoQixxQkFBcUIsR0FBRyxzREFBc0Q7UUFDNUUsNkVBQTZFO1FBQzdFLHVFQUF1RTtRQUN2RSxtQ0FBbUMsQ0FDdEMsQ0FDRixDQUFDO0FBQ0osQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtJTUFHRV9DT05GSUcsIEltYWdlQ29uZmlnLCBQTEFURk9STV9JRH0gZnJvbSAnLi9hcHBsaWNhdGlvbi9hcHBsaWNhdGlvbl90b2tlbnMnO1xuaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICcuL2RpJztcbmltcG9ydCB7aW5qZWN0fSBmcm9tICcuL2RpL2luamVjdG9yX2NvbXBhdGliaWxpdHknO1xuaW1wb3J0IHtmb3JtYXRSdW50aW1lRXJyb3IsIFJ1bnRpbWVFcnJvckNvZGV9IGZyb20gJy4vZXJyb3JzJztcbmltcG9ydCB7T25EZXN0cm95fSBmcm9tICcuL2ludGVyZmFjZS9saWZlY3ljbGVfaG9va3MnO1xuaW1wb3J0IHtnZXREb2N1bWVudH0gZnJvbSAnLi9yZW5kZXIzL2ludGVyZmFjZXMvZG9jdW1lbnQnO1xuXG4vLyBBIGRlbGF5IGluIG1pbGxpc2Vjb25kcyBiZWZvcmUgdGhlIHNjYW4gaXMgcnVuIGFmdGVyIG9uTG9hZCwgdG8gYXZvaWQgYW55XG4vLyBwb3RlbnRpYWwgcmFjZSBjb25kaXRpb25zIHdpdGggb3RoZXIgTENQLXJlbGF0ZWQgZnVuY3Rpb25zLiBUaGlzIGRlbGF5XG4vLyBoYXBwZW5zIG91dHNpZGUgb2YgdGhlIG1haW4gSmF2YVNjcmlwdCBleGVjdXRpb24gYW5kIHdpbGwgb25seSBlZmZlY3QgdGhlIHRpbWluZ1xuLy8gb24gd2hlbiB0aGUgd2FybmluZyBiZWNvbWVzIHZpc2libGUgaW4gdGhlIGNvbnNvbGUuXG5jb25zdCBTQ0FOX0RFTEFZID0gMjAwO1xuXG5jb25zdCBPVkVSU0laRURfSU1BR0VfVE9MRVJBTkNFID0gMTIwMDtcblxuQEluamVjdGFibGUoe3Byb3ZpZGVkSW46ICdyb290J30pXG5leHBvcnQgY2xhc3MgSW1hZ2VQZXJmb3JtYW5jZVdhcm5pbmcgaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xuICAvLyBNYXAgb2YgZnVsbCBpbWFnZSBVUkxzIC0+IG9yaWdpbmFsIGBuZ1NyY2AgdmFsdWVzLlxuICBwcml2YXRlIHdpbmRvdzogV2luZG93IHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgb2JzZXJ2ZXI6IFBlcmZvcm1hbmNlT2JzZXJ2ZXIgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBvcHRpb25zOiBJbWFnZUNvbmZpZyA9IGluamVjdChJTUFHRV9DT05GSUcpO1xuICBwcml2YXRlIHJlYWRvbmx5IGlzQnJvd3NlciA9IGluamVjdChQTEFURk9STV9JRCkgPT09ICdicm93c2VyJztcbiAgcHJpdmF0ZSBsY3BJbWFnZVVybD86IHN0cmluZztcblxuICBwdWJsaWMgc3RhcnQoKSB7XG4gICAgaWYgKFxuICAgICAgIXRoaXMuaXNCcm93c2VyIHx8XG4gICAgICB0eXBlb2YgUGVyZm9ybWFuY2VPYnNlcnZlciA9PT0gJ3VuZGVmaW5lZCcgfHxcbiAgICAgICh0aGlzLm9wdGlvbnM/LmRpc2FibGVJbWFnZVNpemVXYXJuaW5nICYmIHRoaXMub3B0aW9ucz8uZGlzYWJsZUltYWdlTGF6eUxvYWRXYXJuaW5nKVxuICAgICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLm9ic2VydmVyID0gdGhpcy5pbml0UGVyZm9ybWFuY2VPYnNlcnZlcigpO1xuICAgIGNvbnN0IGRvYyA9IGdldERvY3VtZW50KCk7XG4gICAgY29uc3Qgd2luID0gZG9jLmRlZmF1bHRWaWV3O1xuICAgIGlmICh0eXBlb2Ygd2luICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhpcy53aW5kb3cgPSB3aW47XG4gICAgICAvLyBXYWl0IHRvIGF2b2lkIHJhY2UgY29uZGl0aW9ucyB3aGVyZSBMQ1AgaW1hZ2UgdHJpZ2dlcnNcbiAgICAgIC8vIGxvYWQgZXZlbnQgYmVmb3JlIGl0J3MgcmVjb3JkZWQgYnkgdGhlIHBlcmZvcm1hbmNlIG9ic2VydmVyXG4gICAgICBjb25zdCB3YWl0VG9TY2FuID0gKCkgPT4ge1xuICAgICAgICBzZXRUaW1lb3V0KHRoaXMuc2NhbkltYWdlcy5iaW5kKHRoaXMpLCBTQ0FOX0RFTEFZKTtcbiAgICAgIH07XG4gICAgICBjb25zdCBzZXR1cCA9ICgpID0+IHtcbiAgICAgICAgLy8gQ29uc2lkZXIgdGhlIGNhc2Ugd2hlbiB0aGUgYXBwbGljYXRpb24gaXMgY3JlYXRlZCBhbmQgZGVzdHJveWVkIG11bHRpcGxlIHRpbWVzLlxuICAgICAgICAvLyBUeXBpY2FsbHksIGFwcGxpY2F0aW9ucyBhcmUgY3JlYXRlZCBpbnN0YW50bHkgb25jZSB0aGUgcGFnZSBpcyBsb2FkZWQsIGFuZCB0aGVcbiAgICAgICAgLy8gYHdpbmRvdy5sb2FkYCBsaXN0ZW5lciBpcyBhbHdheXMgdHJpZ2dlcmVkLiBIb3dldmVyLCB0aGUgYHdpbmRvdy5sb2FkYCBldmVudCB3aWxsIG5ldmVyXG4gICAgICAgIC8vIGJlIGZpcmVkIGlmIHRoZSBwYWdlIGlzIGxvYWRlZCwgYW5kIHRoZSBhcHBsaWNhdGlvbiBpcyBjcmVhdGVkIGxhdGVyLiBDaGVja2luZyBmb3JcbiAgICAgICAgLy8gYHJlYWR5U3RhdGVgIGlzIHRoZSBlYXNpZXN0IHdheSB0byBkZXRlcm1pbmUgd2hldGhlciB0aGUgcGFnZSBoYXMgYmVlbiBsb2FkZWQgb3Igbm90LlxuICAgICAgICBpZiAoZG9jLnJlYWR5U3RhdGUgPT09ICdjb21wbGV0ZScpIHtcbiAgICAgICAgICB3YWl0VG9TY2FuKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy53aW5kb3c/LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCB3YWl0VG9TY2FuLCB7b25jZTogdHJ1ZX0pO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgLy8gQW5ndWxhciBkb2Vzbid0IGhhdmUgdG8gcnVuIGNoYW5nZSBkZXRlY3Rpb24gd2hlbmV2ZXIgYW55IGFzeW5jaHJvbm91cyB0YXNrcyBhcmUgaW52b2tlZCBpblxuICAgICAgLy8gdGhlIHNjb3BlIG9mIHRoaXMgZnVuY3Rpb25hbGl0eS5cbiAgICAgIGlmICh0eXBlb2YgWm9uZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgWm9uZS5yb290LnJ1bigoKSA9PiBzZXR1cCgpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNldHVwKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdGhpcy5vYnNlcnZlcj8uZGlzY29ubmVjdCgpO1xuICB9XG5cbiAgcHJpdmF0ZSBpbml0UGVyZm9ybWFuY2VPYnNlcnZlcigpOiBQZXJmb3JtYW5jZU9ic2VydmVyIHwgbnVsbCB7XG4gICAgaWYgKHR5cGVvZiBQZXJmb3JtYW5jZU9ic2VydmVyID09PSAndW5kZWZpbmVkJykge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IG9ic2VydmVyID0gbmV3IFBlcmZvcm1hbmNlT2JzZXJ2ZXIoKGVudHJ5TGlzdCkgPT4ge1xuICAgICAgY29uc3QgZW50cmllcyA9IGVudHJ5TGlzdC5nZXRFbnRyaWVzKCk7XG4gICAgICBpZiAoZW50cmllcy5sZW5ndGggPT09IDApIHJldHVybjtcbiAgICAgIC8vIFdlIHVzZSB0aGUgbGF0ZXN0IGVudHJ5IHByb2R1Y2VkIGJ5IHRoZSBgUGVyZm9ybWFuY2VPYnNlcnZlcmAgYXMgdGhlIGJlc3RcbiAgICAgIC8vIHNpZ25hbCBvbiB3aGljaCBlbGVtZW50IGlzIGFjdHVhbGx5IGFuIExDUCBvbmUuIEFzIGFuIGV4YW1wbGUsIHRoZSBmaXJzdCBpbWFnZSB0byBsb2FkIG9uXG4gICAgICAvLyBhIHBhZ2UsIGJ5IHZpcnR1ZSBvZiBiZWluZyB0aGUgb25seSB0aGluZyBvbiB0aGUgcGFnZSBzbyBmYXIsIGlzIG9mdGVuIGEgTENQIGNhbmRpZGF0ZVxuICAgICAgLy8gYW5kIGdldHMgcmVwb3J0ZWQgYnkgUGVyZm9ybWFuY2VPYnNlcnZlciwgYnV0IGlzbid0IG5lY2Vzc2FyaWx5IHRoZSBMQ1AgZWxlbWVudC5cbiAgICAgIGNvbnN0IGxjcEVsZW1lbnQgPSBlbnRyaWVzW2VudHJpZXMubGVuZ3RoIC0gMV07XG5cbiAgICAgIC8vIENhc3QgdG8gYGFueWAgZHVlIHRvIG1pc3NpbmcgYGVsZW1lbnRgIG9uIHRoZSBgTGFyZ2VzdENvbnRlbnRmdWxQYWludGAgdHlwZSBvZiBlbnRyeS5cbiAgICAgIC8vIFNlZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvTGFyZ2VzdENvbnRlbnRmdWxQYWludFxuICAgICAgY29uc3QgaW1nU3JjID0gKGxjcEVsZW1lbnQgYXMgYW55KS5lbGVtZW50Py5zcmMgPz8gJyc7XG5cbiAgICAgIC8vIEV4Y2x1ZGUgYGRhdGE6YCBhbmQgYGJsb2I6YCBVUkxzLCBzaW5jZSB0aGV5IGFyZSBmZXRjaGVkIHJlc291cmNlcy5cbiAgICAgIGlmIChpbWdTcmMuc3RhcnRzV2l0aCgnZGF0YTonKSB8fCBpbWdTcmMuc3RhcnRzV2l0aCgnYmxvYjonKSkgcmV0dXJuO1xuICAgICAgdGhpcy5sY3BJbWFnZVVybCA9IGltZ1NyYztcbiAgICB9KTtcbiAgICBvYnNlcnZlci5vYnNlcnZlKHt0eXBlOiAnbGFyZ2VzdC1jb250ZW50ZnVsLXBhaW50JywgYnVmZmVyZWQ6IHRydWV9KTtcbiAgICByZXR1cm4gb2JzZXJ2ZXI7XG4gIH1cblxuICBwcml2YXRlIHNjYW5JbWFnZXMoKTogdm9pZCB7XG4gICAgY29uc3QgaW1hZ2VzID0gZ2V0RG9jdW1lbnQoKS5xdWVyeVNlbGVjdG9yQWxsKCdpbWcnKTtcbiAgICBsZXQgbGNwRWxlbWVudEZvdW5kLFxuICAgICAgbGNwRWxlbWVudExvYWRlZENvcnJlY3RseSA9IGZhbHNlO1xuICAgIGltYWdlcy5mb3JFYWNoKChpbWFnZSkgPT4ge1xuICAgICAgaWYgKCF0aGlzLm9wdGlvbnM/LmRpc2FibGVJbWFnZVNpemVXYXJuaW5nKSB7XG4gICAgICAgIC8vIEltYWdlIGVsZW1lbnRzIHVzaW5nIHRoZSBOZ09wdGltaXplZEltYWdlIGRpcmVjdGl2ZSBhcmUgZXhjbHVkZWQsXG4gICAgICAgIC8vIGFzIHRoYXQgZGlyZWN0aXZlIGhhcyBpdHMgb3duIHZlcnNpb24gb2YgdGhpcyBjaGVjay5cbiAgICAgICAgaWYgKCFpbWFnZS5nZXRBdHRyaWJ1dGUoJ25nLWltZycpICYmIHRoaXMuaXNPdmVyc2l6ZWQoaW1hZ2UpKSB7XG4gICAgICAgICAgbG9nT3ZlcnNpemVkSW1hZ2VXYXJuaW5nKGltYWdlLnNyYyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICghdGhpcy5vcHRpb25zPy5kaXNhYmxlSW1hZ2VMYXp5TG9hZFdhcm5pbmcgJiYgdGhpcy5sY3BJbWFnZVVybCkge1xuICAgICAgICBpZiAoaW1hZ2Uuc3JjID09PSB0aGlzLmxjcEltYWdlVXJsKSB7XG4gICAgICAgICAgbGNwRWxlbWVudEZvdW5kID0gdHJ1ZTtcbiAgICAgICAgICBpZiAoaW1hZ2UubG9hZGluZyAhPT0gJ2xhenknIHx8IGltYWdlLmdldEF0dHJpYnV0ZSgnbmctaW1nJykpIHtcbiAgICAgICAgICAgIC8vIFRoaXMgdmFyaWFibGUgaXMgc2V0IHRvIHRydWUgYW5kIG5ldmVyIGdvZXMgYmFjayB0byBmYWxzZSB0byBhY2NvdW50XG4gICAgICAgICAgICAvLyBmb3IgdGhlIGNhc2Ugd2hlcmUgbXVsdGlwbGUgaW1hZ2VzIGhhdmUgdGhlIHNhbWUgc3JjIHVybCwgYW5kIHNvbWVcbiAgICAgICAgICAgIC8vIGhhdmUgbGF6eSBsb2FkaW5nIHdoaWxlIG90aGVycyBkb24ndC5cbiAgICAgICAgICAgIC8vIEFsc28gaWdub3JlIE5nT3B0aW1pemVkSW1hZ2UgYmVjYXVzZSB0aGVyZSdzIGEgZGlmZmVyZW50IHdhcm5pbmcgZm9yIHRoYXQuXG4gICAgICAgICAgICBsY3BFbGVtZW50TG9hZGVkQ29ycmVjdGx5ID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgICBpZiAoXG4gICAgICBsY3BFbGVtZW50Rm91bmQgJiZcbiAgICAgICFsY3BFbGVtZW50TG9hZGVkQ29ycmVjdGx5ICYmXG4gICAgICB0aGlzLmxjcEltYWdlVXJsICYmXG4gICAgICAhdGhpcy5vcHRpb25zPy5kaXNhYmxlSW1hZ2VMYXp5TG9hZFdhcm5pbmdcbiAgICApIHtcbiAgICAgIGxvZ0xhenlMQ1BXYXJuaW5nKHRoaXMubGNwSW1hZ2VVcmwpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgaXNPdmVyc2l6ZWQoaW1hZ2U6IEhUTUxJbWFnZUVsZW1lbnQpOiBib29sZWFuIHtcbiAgICBpZiAoIXRoaXMud2luZG93KSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gVGhlIGBpc092ZXJzaXplZGAgY2hlY2sgbWF5IG5vdCBiZSBhcHBsaWNhYmxlIG9yIG1heSByZXF1aXJlIGFkanVzdG1lbnRzXG4gICAgLy8gZm9yIHNldmVyYWwgdHlwZXMgb2YgaW1hZ2UgZm9ybWF0cyBvciBzY2VuYXJpb3MuIEN1cnJlbnRseSwgd2Ugc3BlY2lmeSBvbmx5XG4gICAgLy8gYHN2Z2AsIGJ1dCB0aGlzIG1heSBhbHNvIGluY2x1ZGUgYGdpZmAgc2luY2UgdGhlaXIgcXVhbGl0eSBpc27igJl0IHRpZWQgdG9cbiAgICAvLyBkaW1lbnNpb25zIGluIHRoZSBzYW1lIHdheSBhcyByYXN0ZXIgaW1hZ2VzLlxuICAgIGNvbnN0IG5vbk92ZXJzaXplZEltYWdlRXh0ZW50aW9ucyA9IFtcbiAgICAgIC8vIFNWRyBpbWFnZXMgYXJlIHZlY3Rvci1iYXNlZCwgd2hpY2ggbWVhbnMgdGhleSBjYW4gc2NhbGVcbiAgICAgIC8vIHRvIGFueSBzaXplIHdpdGhvdXQgbG9zaW5nIHF1YWxpdHkuXG4gICAgICAnLnN2ZycsXG4gICAgXTtcblxuICAgIC8vIENvbnZlcnQgaXQgdG8gbG93ZXJjYXNlIGJlY2F1c2UgdGhpcyBtYXkgaGF2ZSB1cHBlcmNhc2VcbiAgICAvLyBleHRlbnNpb25zLCBzdWNoIGFzIGBJTUFHRS5TVkdgLlxuICAgIC8vIFdlIGZhbGxiYWNrIHRvIGFuIGVtcHR5IHN0cmluZyBiZWNhdXNlIGBzcmNgIG1heSBiZSBgdW5kZWZpbmVkYFxuICAgIC8vIGlmIGl0IGlzIGV4cGxpY2l0bHkgc2V0IHRvIGBudWxsYCBieSBzb21lIHRoaXJkLXBhcnR5IGNvZGVcbiAgICAvLyAoZS5nLiwgYGltYWdlLnNyYyA9IG51bGxgKS5cbiAgICBjb25zdCBpbWFnZVNvdXJjZSA9IChpbWFnZS5zcmMgfHwgJycpLnRvTG93ZXJDYXNlKCk7XG5cbiAgICBpZiAobm9uT3ZlcnNpemVkSW1hZ2VFeHRlbnRpb25zLnNvbWUoKGV4dGVuc2lvbikgPT4gaW1hZ2VTb3VyY2UuZW5kc1dpdGgoZXh0ZW5zaW9uKSkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBjb25zdCBjb21wdXRlZFN0eWxlID0gdGhpcy53aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShpbWFnZSk7XG4gICAgbGV0IHJlbmRlcmVkV2lkdGggPSBwYXJzZUZsb2F0KGNvbXB1dGVkU3R5bGUuZ2V0UHJvcGVydHlWYWx1ZSgnd2lkdGgnKSk7XG4gICAgbGV0IHJlbmRlcmVkSGVpZ2h0ID0gcGFyc2VGbG9hdChjb21wdXRlZFN0eWxlLmdldFByb3BlcnR5VmFsdWUoJ2hlaWdodCcpKTtcbiAgICBjb25zdCBib3hTaXppbmcgPSBjb21wdXRlZFN0eWxlLmdldFByb3BlcnR5VmFsdWUoJ2JveC1zaXppbmcnKTtcbiAgICBjb25zdCBvYmplY3RGaXQgPSBjb21wdXRlZFN0eWxlLmdldFByb3BlcnR5VmFsdWUoJ29iamVjdC1maXQnKTtcblxuICAgIGlmIChvYmplY3RGaXQgPT09IGBjb3ZlcmApIHtcbiAgICAgIC8vIE9iamVjdCBmaXQgY292ZXIgbWF5IGluZGljYXRlIGEgdXNlIGNhc2Ugc3VjaCBhcyBhIHNwcml0ZSBzaGVldCB3aGVyZVxuICAgICAgLy8gdGhpcyB3YXJuaW5nIGRvZXMgbm90IGFwcGx5LlxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmIChib3hTaXppbmcgPT09ICdib3JkZXItYm94Jykge1xuICAgICAgLy8gSWYgdGhlIGltYWdlIGBib3gtc2l6aW5nYCBpcyBzZXQgdG8gYGJvcmRlci1ib3hgLCB3ZSBhZGp1c3QgdGhlIHJlbmRlcmVkXG4gICAgICAvLyBkaW1lbnNpb25zIGJ5IHN1YnRyYWN0aW5nIHBhZGRpbmcgdmFsdWVzLlxuICAgICAgY29uc3QgcGFkZGluZ1RvcCA9IGNvbXB1dGVkU3R5bGUuZ2V0UHJvcGVydHlWYWx1ZSgncGFkZGluZy10b3AnKTtcbiAgICAgIGNvbnN0IHBhZGRpbmdSaWdodCA9IGNvbXB1dGVkU3R5bGUuZ2V0UHJvcGVydHlWYWx1ZSgncGFkZGluZy1yaWdodCcpO1xuICAgICAgY29uc3QgcGFkZGluZ0JvdHRvbSA9IGNvbXB1dGVkU3R5bGUuZ2V0UHJvcGVydHlWYWx1ZSgncGFkZGluZy1ib3R0b20nKTtcbiAgICAgIGNvbnN0IHBhZGRpbmdMZWZ0ID0gY29tcHV0ZWRTdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKCdwYWRkaW5nLWxlZnQnKTtcbiAgICAgIHJlbmRlcmVkV2lkdGggLT0gcGFyc2VGbG9hdChwYWRkaW5nUmlnaHQpICsgcGFyc2VGbG9hdChwYWRkaW5nTGVmdCk7XG4gICAgICByZW5kZXJlZEhlaWdodCAtPSBwYXJzZUZsb2F0KHBhZGRpbmdUb3ApICsgcGFyc2VGbG9hdChwYWRkaW5nQm90dG9tKTtcbiAgICB9XG5cbiAgICBjb25zdCBpbnRyaW5zaWNXaWR0aCA9IGltYWdlLm5hdHVyYWxXaWR0aDtcbiAgICBjb25zdCBpbnRyaW5zaWNIZWlnaHQgPSBpbWFnZS5uYXR1cmFsSGVpZ2h0O1xuXG4gICAgY29uc3QgcmVjb21tZW5kZWRXaWR0aCA9IHRoaXMud2luZG93LmRldmljZVBpeGVsUmF0aW8gKiByZW5kZXJlZFdpZHRoO1xuICAgIGNvbnN0IHJlY29tbWVuZGVkSGVpZ2h0ID0gdGhpcy53aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyAqIHJlbmRlcmVkSGVpZ2h0O1xuICAgIGNvbnN0IG92ZXJzaXplZFdpZHRoID0gaW50cmluc2ljV2lkdGggLSByZWNvbW1lbmRlZFdpZHRoID49IE9WRVJTSVpFRF9JTUFHRV9UT0xFUkFOQ0U7XG4gICAgY29uc3Qgb3ZlcnNpemVkSGVpZ2h0ID0gaW50cmluc2ljSGVpZ2h0IC0gcmVjb21tZW5kZWRIZWlnaHQgPj0gT1ZFUlNJWkVEX0lNQUdFX1RPTEVSQU5DRTtcbiAgICByZXR1cm4gb3ZlcnNpemVkV2lkdGggfHwgb3ZlcnNpemVkSGVpZ2h0O1xuICB9XG59XG5cbmZ1bmN0aW9uIGxvZ0xhenlMQ1BXYXJuaW5nKHNyYzogc3RyaW5nKSB7XG4gIGNvbnNvbGUud2FybihcbiAgICBmb3JtYXRSdW50aW1lRXJyb3IoXG4gICAgICBSdW50aW1lRXJyb3JDb2RlLklNQUdFX1BFUkZPUk1BTkNFX1dBUk5JTkcsXG4gICAgICBgQW4gaW1hZ2Ugd2l0aCBzcmMgJHtzcmN9IGlzIHRoZSBMYXJnZXN0IENvbnRlbnRmdWwgUGFpbnQgKExDUCkgZWxlbWVudCBgICtcbiAgICAgICAgYGJ1dCB3YXMgZ2l2ZW4gYSBcImxvYWRpbmdcIiB2YWx1ZSBvZiBcImxhenlcIiwgd2hpY2ggY2FuIG5lZ2F0aXZlbHkgaW1wYWN0IGAgK1xuICAgICAgICBgYXBwbGljYXRpb24gbG9hZGluZyBwZXJmb3JtYW5jZS4gVGhpcyB3YXJuaW5nIGNhbiBiZSBhZGRyZXNzZWQgYnkgYCArXG4gICAgICAgIGBjaGFuZ2luZyB0aGUgbG9hZGluZyB2YWx1ZSBvZiB0aGUgTENQIGltYWdlIHRvIFwiZWFnZXJcIiwgb3IgYnkgdXNpbmcgdGhlIGAgK1xuICAgICAgICBgTmdPcHRpbWl6ZWRJbWFnZSBkaXJlY3RpdmUncyBwcmlvcml0aXphdGlvbiB1dGlsaXRpZXMuIEZvciBtb3JlIGAgK1xuICAgICAgICBgaW5mb3JtYXRpb24gYWJvdXQgYWRkcmVzc2luZyBvciBkaXNhYmxpbmcgdGhpcyB3YXJuaW5nLCBzZWUgYCArXG4gICAgICAgIGBodHRwczovL2FuZ3VsYXIuZGV2L2Vycm9ycy9ORzA5MTNgLFxuICAgICksXG4gICk7XG59XG5cbmZ1bmN0aW9uIGxvZ092ZXJzaXplZEltYWdlV2FybmluZyhzcmM6IHN0cmluZykge1xuICBjb25zb2xlLndhcm4oXG4gICAgZm9ybWF0UnVudGltZUVycm9yKFxuICAgICAgUnVudGltZUVycm9yQ29kZS5JTUFHRV9QRVJGT1JNQU5DRV9XQVJOSU5HLFxuICAgICAgYEFuIGltYWdlIHdpdGggc3JjICR7c3JjfSBoYXMgaW50cmluc2ljIGZpbGUgZGltZW5zaW9ucyBtdWNoIGxhcmdlciB0aGFuIGl0cyBgICtcbiAgICAgICAgYHJlbmRlcmVkIHNpemUuIFRoaXMgY2FuIG5lZ2F0aXZlbHkgaW1wYWN0IGFwcGxpY2F0aW9uIGxvYWRpbmcgcGVyZm9ybWFuY2UuIGAgK1xuICAgICAgICBgRm9yIG1vcmUgaW5mb3JtYXRpb24gYWJvdXQgYWRkcmVzc2luZyBvciBkaXNhYmxpbmcgdGhpcyB3YXJuaW5nLCBzZWUgYCArXG4gICAgICAgIGBodHRwczovL2FuZ3VsYXIuZGV2L2Vycm9ycy9ORzA5MTNgLFxuICAgICksXG4gICk7XG59XG4iXX0=