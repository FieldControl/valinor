/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { booleanAttribute, Directive, ElementRef, inject, Injector, Input, NgZone, numberAttribute, PLATFORM_ID, Renderer2, ɵformatRuntimeError as formatRuntimeError, ɵIMAGE_CONFIG as IMAGE_CONFIG, ɵIMAGE_CONFIG_DEFAULTS as IMAGE_CONFIG_DEFAULTS, ɵperformanceMarkFeature as performanceMarkFeature, ɵRuntimeError as RuntimeError, ɵunwrapSafeValue as unwrapSafeValue, ChangeDetectorRef, ApplicationRef, ɵwhenStable as whenStable, } from '@angular/core';
import { isPlatformServer } from '../../platform_id';
import { imgDirectiveDetails } from './error_helper';
import { cloudinaryLoaderInfo } from './image_loaders/cloudinary_loader';
import { IMAGE_LOADER, noopImageLoader, } from './image_loaders/image_loader';
import { imageKitLoaderInfo } from './image_loaders/imagekit_loader';
import { imgixLoaderInfo } from './image_loaders/imgix_loader';
import { netlifyLoaderInfo } from './image_loaders/netlify_loader';
import { LCPImageObserver } from './lcp_image_observer';
import { PreconnectLinkChecker } from './preconnect_link_checker';
import { PreloadLinkCreator } from './preload-link-creator';
import * as i0 from "@angular/core";
/**
 * When a Base64-encoded image is passed as an input to the `NgOptimizedImage` directive,
 * an error is thrown. The image content (as a string) might be very long, thus making
 * it hard to read an error message if the entire string is included. This const defines
 * the number of characters that should be included into the error message. The rest
 * of the content is truncated.
 */
const BASE64_IMG_MAX_LENGTH_IN_ERROR = 50;
/**
 * RegExpr to determine whether a src in a srcset is using width descriptors.
 * Should match something like: "100w, 200w".
 */
const VALID_WIDTH_DESCRIPTOR_SRCSET = /^((\s*\d+w\s*(,|$)){1,})$/;
/**
 * RegExpr to determine whether a src in a srcset is using density descriptors.
 * Should match something like: "1x, 2x, 50x". Also supports decimals like "1.5x, 1.50x".
 */
const VALID_DENSITY_DESCRIPTOR_SRCSET = /^((\s*\d+(\.\d+)?x\s*(,|$)){1,})$/;
/**
 * Srcset values with a density descriptor higher than this value will actively
 * throw an error. Such densities are not permitted as they cause image sizes
 * to be unreasonably large and slow down LCP.
 */
export const ABSOLUTE_SRCSET_DENSITY_CAP = 3;
/**
 * Used only in error message text to communicate best practices, as we will
 * only throw based on the slightly more conservative ABSOLUTE_SRCSET_DENSITY_CAP.
 */
export const RECOMMENDED_SRCSET_DENSITY_CAP = 2;
/**
 * Used in generating automatic density-based srcsets
 */
const DENSITY_SRCSET_MULTIPLIERS = [1, 2];
/**
 * Used to determine which breakpoints to use on full-width images
 */
const VIEWPORT_BREAKPOINT_CUTOFF = 640;
/**
 * Used to determine whether two aspect ratios are similar in value.
 */
const ASPECT_RATIO_TOLERANCE = 0.1;
/**
 * Used to determine whether the image has been requested at an overly
 * large size compared to the actual rendered image size (after taking
 * into account a typical device pixel ratio). In pixels.
 */
const OVERSIZED_IMAGE_TOLERANCE = 1000;
/**
 * Used to limit automatic srcset generation of very large sources for
 * fixed-size images. In pixels.
 */
const FIXED_SRCSET_WIDTH_LIMIT = 1920;
const FIXED_SRCSET_HEIGHT_LIMIT = 1080;
/**
 * Default blur radius of the CSS filter used on placeholder images, in pixels
 */
export const PLACEHOLDER_BLUR_AMOUNT = 15;
/**
 * Placeholder dimension (height or width) limit in pixels. Angular produces a warning
 * when this limit is crossed.
 */
const PLACEHOLDER_DIMENSION_LIMIT = 1000;
/**
 * Used to warn or error when the user provides an overly large dataURL for the placeholder
 * attribute.
 * Character count of Base64 images is 1 character per byte, and base64 encoding is approximately
 * 33% larger than base images, so 4000 characters is around 3KB on disk and 10000 characters is
 * around 7.7KB. Experimentally, 4000 characters is about 20x20px in PNG or medium-quality JPEG
 * format, and 10,000 is around 50x50px, but there's quite a bit of variation depending on how the
 * image is saved.
 */
export const DATA_URL_WARN_LIMIT = 4000;
export const DATA_URL_ERROR_LIMIT = 10000;
/** Info about built-in loaders we can test for. */
export const BUILT_IN_LOADERS = [
    imgixLoaderInfo,
    imageKitLoaderInfo,
    cloudinaryLoaderInfo,
    netlifyLoaderInfo,
];
/**
 * Threshold for the PRIORITY_TRUE_COUNT
 */
const PRIORITY_COUNT_THRESHOLD = 10;
/**
 * This count is used to log a devMode warning
 * when the count of directive instances with priority=true
 * exceeds the threshold PRIORITY_COUNT_THRESHOLD
 */
let IMGS_WITH_PRIORITY_ATTR_COUNT = 0;
/**
 * This function is for testing purpose.
 */
export function resetImagePriorityCount() {
    IMGS_WITH_PRIORITY_ATTR_COUNT = 0;
}
/**
 * Directive that improves image loading performance by enforcing best practices.
 *
 * `NgOptimizedImage` ensures that the loading of the Largest Contentful Paint (LCP) image is
 * prioritized by:
 * - Automatically setting the `fetchpriority` attribute on the `<img>` tag
 * - Lazy loading non-priority images by default
 * - Automatically generating a preconnect link tag in the document head
 *
 * In addition, the directive:
 * - Generates appropriate asset URLs if a corresponding `ImageLoader` function is provided
 * - Automatically generates a srcset
 * - Requires that `width` and `height` are set
 * - Warns if `width` or `height` have been set incorrectly
 * - Warns if the image will be visually distorted when rendered
 *
 * @usageNotes
 * The `NgOptimizedImage` directive is marked as [standalone](guide/components/importing) and can
 * be imported directly.
 *
 * Follow the steps below to enable and use the directive:
 * 1. Import it into the necessary NgModule or a standalone Component.
 * 2. Optionally provide an `ImageLoader` if you use an image hosting service.
 * 3. Update the necessary `<img>` tags in templates and replace `src` attributes with `ngSrc`.
 * Using a `ngSrc` allows the directive to control when the `src` gets set, which triggers an image
 * download.
 *
 * Step 1: import the `NgOptimizedImage` directive.
 *
 * ```typescript
 * import { NgOptimizedImage } from '@angular/common';
 *
 * // Include it into the necessary NgModule
 * @NgModule({
 *   imports: [NgOptimizedImage],
 * })
 * class AppModule {}
 *
 * // ... or a standalone Component
 * @Component({
 *   standalone: true
 *   imports: [NgOptimizedImage],
 * })
 * class MyStandaloneComponent {}
 * ```
 *
 * Step 2: configure a loader.
 *
 * To use the **default loader**: no additional code changes are necessary. The URL returned by the
 * generic loader will always match the value of "src". In other words, this loader applies no
 * transformations to the resource URL and the value of the `ngSrc` attribute will be used as is.
 *
 * To use an existing loader for a **third-party image service**: add the provider factory for your
 * chosen service to the `providers` array. In the example below, the Imgix loader is used:
 *
 * ```typescript
 * import {provideImgixLoader} from '@angular/common';
 *
 * // Call the function and add the result to the `providers` array:
 * providers: [
 *   provideImgixLoader("https://my.base.url/"),
 * ],
 * ```
 *
 * The `NgOptimizedImage` directive provides the following functions:
 * - `provideCloudflareLoader`
 * - `provideCloudinaryLoader`
 * - `provideImageKitLoader`
 * - `provideImgixLoader`
 *
 * If you use a different image provider, you can create a custom loader function as described
 * below.
 *
 * To use a **custom loader**: provide your loader function as a value for the `IMAGE_LOADER` DI
 * token.
 *
 * ```typescript
 * import {IMAGE_LOADER, ImageLoaderConfig} from '@angular/common';
 *
 * // Configure the loader using the `IMAGE_LOADER` token.
 * providers: [
 *   {
 *      provide: IMAGE_LOADER,
 *      useValue: (config: ImageLoaderConfig) => {
 *        return `https://example.com/${config.src}-${config.width}.jpg}`;
 *      }
 *   },
 * ],
 * ```
 *
 * Step 3: update `<img>` tags in templates to use `ngSrc` instead of `src`.
 *
 * ```
 * <img ngSrc="logo.png" width="200" height="100">
 * ```
 *
 * @publicApi
 */
export class NgOptimizedImage {
    constructor() {
        this.imageLoader = inject(IMAGE_LOADER);
        this.config = processConfig(inject(IMAGE_CONFIG));
        this.renderer = inject(Renderer2);
        this.imgElement = inject(ElementRef).nativeElement;
        this.injector = inject(Injector);
        this.isServer = isPlatformServer(inject(PLATFORM_ID));
        this.preloadLinkCreator = inject(PreloadLinkCreator);
        // a LCP image observer - should be injected only in the dev mode
        this.lcpObserver = ngDevMode ? this.injector.get(LCPImageObserver) : null;
        /**
         * Calculate the rewritten `src` once and store it.
         * This is needed to avoid repetitive calculations and make sure the directive cleanup in the
         * `ngOnDestroy` does not rely on the `IMAGE_LOADER` logic (which in turn can rely on some other
         * instance that might be already destroyed).
         */
        this._renderedSrc = null;
        /**
         * Indicates whether this image should have a high priority.
         */
        this.priority = false;
        /**
         * Disables automatic srcset generation for this image.
         */
        this.disableOptimizedSrcset = false;
        /**
         * Sets the image to "fill mode", which eliminates the height/width requirement and adds
         * styles such that the image fills its containing element.
         */
        this.fill = false;
    }
    /** @nodoc */
    ngOnInit() {
        performanceMarkFeature('NgOptimizedImage');
        if (ngDevMode) {
            const ngZone = this.injector.get(NgZone);
            assertNonEmptyInput(this, 'ngSrc', this.ngSrc);
            assertValidNgSrcset(this, this.ngSrcset);
            assertNoConflictingSrc(this);
            if (this.ngSrcset) {
                assertNoConflictingSrcset(this);
            }
            assertNotBase64Image(this);
            assertNotBlobUrl(this);
            if (this.fill) {
                assertEmptyWidthAndHeight(this);
                // This leaves the Angular zone to avoid triggering unnecessary change detection cycles when
                // `load` tasks are invoked on images.
                ngZone.runOutsideAngular(() => assertNonZeroRenderedHeight(this, this.imgElement, this.renderer));
            }
            else {
                assertNonEmptyWidthAndHeight(this);
                if (this.height !== undefined) {
                    assertGreaterThanZero(this, this.height, 'height');
                }
                if (this.width !== undefined) {
                    assertGreaterThanZero(this, this.width, 'width');
                }
                // Only check for distorted images when not in fill mode, where
                // images may be intentionally stretched, cropped or letterboxed.
                ngZone.runOutsideAngular(() => assertNoImageDistortion(this, this.imgElement, this.renderer));
            }
            assertValidLoadingInput(this);
            if (!this.ngSrcset) {
                assertNoComplexSizes(this);
            }
            assertValidPlaceholder(this, this.imageLoader);
            assertNotMissingBuiltInLoader(this.ngSrc, this.imageLoader);
            assertNoNgSrcsetWithoutLoader(this, this.imageLoader);
            assertNoLoaderParamsWithoutLoader(this, this.imageLoader);
            if (this.lcpObserver !== null) {
                const ngZone = this.injector.get(NgZone);
                ngZone.runOutsideAngular(() => {
                    this.lcpObserver.registerImage(this.getRewrittenSrc(), this.ngSrc, this.priority);
                });
            }
            if (this.priority) {
                const checker = this.injector.get(PreconnectLinkChecker);
                checker.assertPreconnect(this.getRewrittenSrc(), this.ngSrc);
                if (!this.isServer) {
                    const applicationRef = this.injector.get(ApplicationRef);
                    assetPriorityCountBelowThreshold(applicationRef);
                }
            }
        }
        if (this.placeholder) {
            this.removePlaceholderOnLoad(this.imgElement);
        }
        this.setHostAttributes();
    }
    setHostAttributes() {
        // Must set width/height explicitly in case they are bound (in which case they will
        // only be reflected and not found by the browser)
        if (this.fill) {
            this.sizes ||= '100vw';
        }
        else {
            this.setHostAttribute('width', this.width.toString());
            this.setHostAttribute('height', this.height.toString());
        }
        this.setHostAttribute('loading', this.getLoadingBehavior());
        this.setHostAttribute('fetchpriority', this.getFetchPriority());
        // The `data-ng-img` attribute flags an image as using the directive, to allow
        // for analysis of the directive's performance.
        this.setHostAttribute('ng-img', 'true');
        // The `src` and `srcset` attributes should be set last since other attributes
        // could affect the image's loading behavior.
        const rewrittenSrcset = this.updateSrcAndSrcset();
        if (this.sizes) {
            this.setHostAttribute('sizes', this.sizes);
        }
        if (this.isServer && this.priority) {
            this.preloadLinkCreator.createPreloadLinkTag(this.renderer, this.getRewrittenSrc(), rewrittenSrcset, this.sizes);
        }
    }
    /** @nodoc */
    ngOnChanges(changes) {
        if (ngDevMode) {
            assertNoPostInitInputChange(this, changes, [
                'ngSrcset',
                'width',
                'height',
                'priority',
                'fill',
                'loading',
                'sizes',
                'loaderParams',
                'disableOptimizedSrcset',
            ]);
        }
        if (changes['ngSrc'] && !changes['ngSrc'].isFirstChange()) {
            const oldSrc = this._renderedSrc;
            this.updateSrcAndSrcset(true);
            const newSrc = this._renderedSrc;
            if (this.lcpObserver !== null && oldSrc && newSrc && oldSrc !== newSrc) {
                const ngZone = this.injector.get(NgZone);
                ngZone.runOutsideAngular(() => {
                    this.lcpObserver?.updateImage(oldSrc, newSrc);
                });
            }
        }
        if (ngDevMode && changes['placeholder']?.currentValue && !this.isServer) {
            assertPlaceholderDimensions(this, this.imgElement);
        }
    }
    callImageLoader(configWithoutCustomParams) {
        let augmentedConfig = configWithoutCustomParams;
        if (this.loaderParams) {
            augmentedConfig.loaderParams = this.loaderParams;
        }
        return this.imageLoader(augmentedConfig);
    }
    getLoadingBehavior() {
        if (!this.priority && this.loading !== undefined) {
            return this.loading;
        }
        return this.priority ? 'eager' : 'lazy';
    }
    getFetchPriority() {
        return this.priority ? 'high' : 'auto';
    }
    getRewrittenSrc() {
        // ImageLoaderConfig supports setting a width property. However, we're not setting width here
        // because if the developer uses rendered width instead of intrinsic width in the HTML width
        // attribute, the image requested may be too small for 2x+ screens.
        if (!this._renderedSrc) {
            const imgConfig = { src: this.ngSrc };
            // Cache calculated image src to reuse it later in the code.
            this._renderedSrc = this.callImageLoader(imgConfig);
        }
        return this._renderedSrc;
    }
    getRewrittenSrcset() {
        const widthSrcSet = VALID_WIDTH_DESCRIPTOR_SRCSET.test(this.ngSrcset);
        const finalSrcs = this.ngSrcset
            .split(',')
            .filter((src) => src !== '')
            .map((srcStr) => {
            srcStr = srcStr.trim();
            const width = widthSrcSet ? parseFloat(srcStr) : parseFloat(srcStr) * this.width;
            return `${this.callImageLoader({ src: this.ngSrc, width })} ${srcStr}`;
        });
        return finalSrcs.join(', ');
    }
    getAutomaticSrcset() {
        if (this.sizes) {
            return this.getResponsiveSrcset();
        }
        else {
            return this.getFixedSrcset();
        }
    }
    getResponsiveSrcset() {
        const { breakpoints } = this.config;
        let filteredBreakpoints = breakpoints;
        if (this.sizes?.trim() === '100vw') {
            // Since this is a full-screen-width image, our srcset only needs to include
            // breakpoints with full viewport widths.
            filteredBreakpoints = breakpoints.filter((bp) => bp >= VIEWPORT_BREAKPOINT_CUTOFF);
        }
        const finalSrcs = filteredBreakpoints.map((bp) => `${this.callImageLoader({ src: this.ngSrc, width: bp })} ${bp}w`);
        return finalSrcs.join(', ');
    }
    updateSrcAndSrcset(forceSrcRecalc = false) {
        if (forceSrcRecalc) {
            // Reset cached value, so that the followup `getRewrittenSrc()` call
            // will recalculate it and update the cache.
            this._renderedSrc = null;
        }
        const rewrittenSrc = this.getRewrittenSrc();
        this.setHostAttribute('src', rewrittenSrc);
        let rewrittenSrcset = undefined;
        if (this.ngSrcset) {
            rewrittenSrcset = this.getRewrittenSrcset();
        }
        else if (this.shouldGenerateAutomaticSrcset()) {
            rewrittenSrcset = this.getAutomaticSrcset();
        }
        if (rewrittenSrcset) {
            this.setHostAttribute('srcset', rewrittenSrcset);
        }
        return rewrittenSrcset;
    }
    getFixedSrcset() {
        const finalSrcs = DENSITY_SRCSET_MULTIPLIERS.map((multiplier) => `${this.callImageLoader({
            src: this.ngSrc,
            width: this.width * multiplier,
        })} ${multiplier}x`);
        return finalSrcs.join(', ');
    }
    shouldGenerateAutomaticSrcset() {
        let oversizedImage = false;
        if (!this.sizes) {
            oversizedImage =
                this.width > FIXED_SRCSET_WIDTH_LIMIT || this.height > FIXED_SRCSET_HEIGHT_LIMIT;
        }
        return (!this.disableOptimizedSrcset &&
            !this.srcset &&
            this.imageLoader !== noopImageLoader &&
            !oversizedImage);
    }
    /**
     * Returns an image url formatted for use with the CSS background-image property. Expects one of:
     * * A base64 encoded image, which is wrapped and passed through.
     * * A boolean. If true, calls the image loader to generate a small placeholder url.
     */
    generatePlaceholder(placeholderInput) {
        const { placeholderResolution } = this.config;
        if (placeholderInput === true) {
            return `url(${this.callImageLoader({
                src: this.ngSrc,
                width: placeholderResolution,
                isPlaceholder: true,
            })})`;
        }
        else if (typeof placeholderInput === 'string') {
            return `url(${placeholderInput})`;
        }
        return null;
    }
    /**
     * Determines if blur should be applied, based on an optional boolean
     * property `blur` within the optional configuration object `placeholderConfig`.
     */
    shouldBlurPlaceholder(placeholderConfig) {
        if (!placeholderConfig || !placeholderConfig.hasOwnProperty('blur')) {
            return true;
        }
        return Boolean(placeholderConfig.blur);
    }
    removePlaceholderOnLoad(img) {
        const callback = () => {
            const changeDetectorRef = this.injector.get(ChangeDetectorRef);
            removeLoadListenerFn();
            removeErrorListenerFn();
            this.placeholder = false;
            changeDetectorRef.markForCheck();
        };
        const removeLoadListenerFn = this.renderer.listen(img, 'load', callback);
        const removeErrorListenerFn = this.renderer.listen(img, 'error', callback);
        callOnLoadIfImageIsLoaded(img, callback);
    }
    /** @nodoc */
    ngOnDestroy() {
        if (ngDevMode) {
            if (!this.priority && this._renderedSrc !== null && this.lcpObserver !== null) {
                this.lcpObserver.unregisterImage(this._renderedSrc);
            }
        }
    }
    setHostAttribute(name, value) {
        this.renderer.setAttribute(this.imgElement, name, value);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: NgOptimizedImage, deps: [], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "16.1.0", version: "18.2.7", type: NgOptimizedImage, isStandalone: true, selector: "img[ngSrc]", inputs: { ngSrc: ["ngSrc", "ngSrc", unwrapSafeUrl], ngSrcset: "ngSrcset", sizes: "sizes", width: ["width", "width", numberAttribute], height: ["height", "height", numberAttribute], loading: "loading", priority: ["priority", "priority", booleanAttribute], loaderParams: "loaderParams", disableOptimizedSrcset: ["disableOptimizedSrcset", "disableOptimizedSrcset", booleanAttribute], fill: ["fill", "fill", booleanAttribute], placeholder: ["placeholder", "placeholder", booleanOrUrlAttribute], placeholderConfig: "placeholderConfig", src: "src", srcset: "srcset" }, host: { properties: { "style.position": "fill ? \"absolute\" : null", "style.width": "fill ? \"100%\" : null", "style.height": "fill ? \"100%\" : null", "style.inset": "fill ? \"0\" : null", "style.background-size": "placeholder ? \"cover\" : null", "style.background-position": "placeholder ? \"50% 50%\" : null", "style.background-repeat": "placeholder ? \"no-repeat\" : null", "style.background-image": "placeholder ? generatePlaceholder(placeholder) : null", "style.filter": "placeholder && shouldBlurPlaceholder(placeholderConfig) ? \"blur(15px)\" : null" } }, usesOnChanges: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: NgOptimizedImage, decorators: [{
            type: Directive,
            args: [{
                    standalone: true,
                    selector: 'img[ngSrc]',
                    host: {
                        '[style.position]': 'fill ? "absolute" : null',
                        '[style.width]': 'fill ? "100%" : null',
                        '[style.height]': 'fill ? "100%" : null',
                        '[style.inset]': 'fill ? "0" : null',
                        '[style.background-size]': 'placeholder ? "cover" : null',
                        '[style.background-position]': 'placeholder ? "50% 50%" : null',
                        '[style.background-repeat]': 'placeholder ? "no-repeat" : null',
                        '[style.background-image]': 'placeholder ? generatePlaceholder(placeholder) : null',
                        '[style.filter]': `placeholder && shouldBlurPlaceholder(placeholderConfig) ? "blur(${PLACEHOLDER_BLUR_AMOUNT}px)" : null`,
                    },
                }]
        }], propDecorators: { ngSrc: [{
                type: Input,
                args: [{ required: true, transform: unwrapSafeUrl }]
            }], ngSrcset: [{
                type: Input
            }], sizes: [{
                type: Input
            }], width: [{
                type: Input,
                args: [{ transform: numberAttribute }]
            }], height: [{
                type: Input,
                args: [{ transform: numberAttribute }]
            }], loading: [{
                type: Input
            }], priority: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], loaderParams: [{
                type: Input
            }], disableOptimizedSrcset: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], fill: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], placeholder: [{
                type: Input,
                args: [{ transform: booleanOrUrlAttribute }]
            }], placeholderConfig: [{
                type: Input
            }], src: [{
                type: Input
            }], srcset: [{
                type: Input
            }] } });
/***** Helpers *****/
/**
 * Sorts provided config breakpoints and uses defaults.
 */
function processConfig(config) {
    let sortedBreakpoints = {};
    if (config.breakpoints) {
        sortedBreakpoints.breakpoints = config.breakpoints.sort((a, b) => a - b);
    }
    return Object.assign({}, IMAGE_CONFIG_DEFAULTS, config, sortedBreakpoints);
}
/***** Assert functions *****/
/**
 * Verifies that there is no `src` set on a host element.
 */
function assertNoConflictingSrc(dir) {
    if (dir.src) {
        throw new RuntimeError(2950 /* RuntimeErrorCode.UNEXPECTED_SRC_ATTR */, `${imgDirectiveDetails(dir.ngSrc)} both \`src\` and \`ngSrc\` have been set. ` +
            `Supplying both of these attributes breaks lazy loading. ` +
            `The NgOptimizedImage directive sets \`src\` itself based on the value of \`ngSrc\`. ` +
            `To fix this, please remove the \`src\` attribute.`);
    }
}
/**
 * Verifies that there is no `srcset` set on a host element.
 */
function assertNoConflictingSrcset(dir) {
    if (dir.srcset) {
        throw new RuntimeError(2951 /* RuntimeErrorCode.UNEXPECTED_SRCSET_ATTR */, `${imgDirectiveDetails(dir.ngSrc)} both \`srcset\` and \`ngSrcset\` have been set. ` +
            `Supplying both of these attributes breaks lazy loading. ` +
            `The NgOptimizedImage directive sets \`srcset\` itself based on the value of ` +
            `\`ngSrcset\`. To fix this, please remove the \`srcset\` attribute.`);
    }
}
/**
 * Verifies that the `ngSrc` is not a Base64-encoded image.
 */
function assertNotBase64Image(dir) {
    let ngSrc = dir.ngSrc.trim();
    if (ngSrc.startsWith('data:')) {
        if (ngSrc.length > BASE64_IMG_MAX_LENGTH_IN_ERROR) {
            ngSrc = ngSrc.substring(0, BASE64_IMG_MAX_LENGTH_IN_ERROR) + '...';
        }
        throw new RuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `${imgDirectiveDetails(dir.ngSrc, false)} \`ngSrc\` is a Base64-encoded string ` +
            `(${ngSrc}). NgOptimizedImage does not support Base64-encoded strings. ` +
            `To fix this, disable the NgOptimizedImage directive for this element ` +
            `by removing \`ngSrc\` and using a standard \`src\` attribute instead.`);
    }
}
/**
 * Verifies that the 'sizes' only includes responsive values.
 */
function assertNoComplexSizes(dir) {
    let sizes = dir.sizes;
    if (sizes?.match(/((\)|,)\s|^)\d+px/)) {
        throw new RuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `${imgDirectiveDetails(dir.ngSrc, false)} \`sizes\` was set to a string including ` +
            `pixel values. For automatic \`srcset\` generation, \`sizes\` must only include responsive ` +
            `values, such as \`sizes="50vw"\` or \`sizes="(min-width: 768px) 50vw, 100vw"\`. ` +
            `To fix this, modify the \`sizes\` attribute, or provide your own \`ngSrcset\` value directly.`);
    }
}
function assertValidPlaceholder(dir, imageLoader) {
    assertNoPlaceholderConfigWithoutPlaceholder(dir);
    assertNoRelativePlaceholderWithoutLoader(dir, imageLoader);
    assertNoOversizedDataUrl(dir);
}
/**
 * Verifies that placeholderConfig isn't being used without placeholder
 */
function assertNoPlaceholderConfigWithoutPlaceholder(dir) {
    if (dir.placeholderConfig && !dir.placeholder) {
        throw new RuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `${imgDirectiveDetails(dir.ngSrc, false)} \`placeholderConfig\` options were provided for an ` +
            `image that does not use the \`placeholder\` attribute, and will have no effect.`);
    }
}
/**
 * Warns if a relative URL placeholder is specified, but no loader is present to provide the small
 * image.
 */
function assertNoRelativePlaceholderWithoutLoader(dir, imageLoader) {
    if (dir.placeholder === true && imageLoader === noopImageLoader) {
        throw new RuntimeError(2963 /* RuntimeErrorCode.MISSING_NECESSARY_LOADER */, `${imgDirectiveDetails(dir.ngSrc)} the \`placeholder\` attribute is set to true but ` +
            `no image loader is configured (i.e. the default one is being used), ` +
            `which would result in the same image being used for the primary image and its placeholder. ` +
            `To fix this, provide a loader or remove the \`placeholder\` attribute from the image.`);
    }
}
/**
 * Warns or throws an error if an oversized dataURL placeholder is provided.
 */
function assertNoOversizedDataUrl(dir) {
    if (dir.placeholder &&
        typeof dir.placeholder === 'string' &&
        dir.placeholder.startsWith('data:')) {
        if (dir.placeholder.length > DATA_URL_ERROR_LIMIT) {
            throw new RuntimeError(2965 /* RuntimeErrorCode.OVERSIZED_PLACEHOLDER */, `${imgDirectiveDetails(dir.ngSrc)} the \`placeholder\` attribute is set to a data URL which is longer ` +
                `than ${DATA_URL_ERROR_LIMIT} characters. This is strongly discouraged, as large inline placeholders ` +
                `directly increase the bundle size of Angular and hurt page load performance. To fix this, generate ` +
                `a smaller data URL placeholder.`);
        }
        if (dir.placeholder.length > DATA_URL_WARN_LIMIT) {
            console.warn(formatRuntimeError(2965 /* RuntimeErrorCode.OVERSIZED_PLACEHOLDER */, `${imgDirectiveDetails(dir.ngSrc)} the \`placeholder\` attribute is set to a data URL which is longer ` +
                `than ${DATA_URL_WARN_LIMIT} characters. This is discouraged, as large inline placeholders ` +
                `directly increase the bundle size of Angular and hurt page load performance. For better loading performance, ` +
                `generate a smaller data URL placeholder.`));
        }
    }
}
/**
 * Verifies that the `ngSrc` is not a Blob URL.
 */
function assertNotBlobUrl(dir) {
    const ngSrc = dir.ngSrc.trim();
    if (ngSrc.startsWith('blob:')) {
        throw new RuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `${imgDirectiveDetails(dir.ngSrc)} \`ngSrc\` was set to a blob URL (${ngSrc}). ` +
            `Blob URLs are not supported by the NgOptimizedImage directive. ` +
            `To fix this, disable the NgOptimizedImage directive for this element ` +
            `by removing \`ngSrc\` and using a regular \`src\` attribute instead.`);
    }
}
/**
 * Verifies that the input is set to a non-empty string.
 */
function assertNonEmptyInput(dir, name, value) {
    const isString = typeof value === 'string';
    const isEmptyString = isString && value.trim() === '';
    if (!isString || isEmptyString) {
        throw new RuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `${imgDirectiveDetails(dir.ngSrc)} \`${name}\` has an invalid value ` +
            `(\`${value}\`). To fix this, change the value to a non-empty string.`);
    }
}
/**
 * Verifies that the `ngSrcset` is in a valid format, e.g. "100w, 200w" or "1x, 2x".
 */
export function assertValidNgSrcset(dir, value) {
    if (value == null)
        return;
    assertNonEmptyInput(dir, 'ngSrcset', value);
    const stringVal = value;
    const isValidWidthDescriptor = VALID_WIDTH_DESCRIPTOR_SRCSET.test(stringVal);
    const isValidDensityDescriptor = VALID_DENSITY_DESCRIPTOR_SRCSET.test(stringVal);
    if (isValidDensityDescriptor) {
        assertUnderDensityCap(dir, stringVal);
    }
    const isValidSrcset = isValidWidthDescriptor || isValidDensityDescriptor;
    if (!isValidSrcset) {
        throw new RuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `${imgDirectiveDetails(dir.ngSrc)} \`ngSrcset\` has an invalid value (\`${value}\`). ` +
            `To fix this, supply \`ngSrcset\` using a comma-separated list of one or more width ` +
            `descriptors (e.g. "100w, 200w") or density descriptors (e.g. "1x, 2x").`);
    }
}
function assertUnderDensityCap(dir, value) {
    const underDensityCap = value
        .split(',')
        .every((num) => num === '' || parseFloat(num) <= ABSOLUTE_SRCSET_DENSITY_CAP);
    if (!underDensityCap) {
        throw new RuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `${imgDirectiveDetails(dir.ngSrc)} the \`ngSrcset\` contains an unsupported image density:` +
            `\`${value}\`. NgOptimizedImage generally recommends a max image density of ` +
            `${RECOMMENDED_SRCSET_DENSITY_CAP}x but supports image densities up to ` +
            `${ABSOLUTE_SRCSET_DENSITY_CAP}x. The human eye cannot distinguish between image densities ` +
            `greater than ${RECOMMENDED_SRCSET_DENSITY_CAP}x - which makes them unnecessary for ` +
            `most use cases. Images that will be pinch-zoomed are typically the primary use case for ` +
            `${ABSOLUTE_SRCSET_DENSITY_CAP}x images. Please remove the high density descriptor and try again.`);
    }
}
/**
 * Creates a `RuntimeError` instance to represent a situation when an input is set after
 * the directive has initialized.
 */
function postInitInputChangeError(dir, inputName) {
    let reason;
    if (inputName === 'width' || inputName === 'height') {
        reason =
            `Changing \`${inputName}\` may result in different attribute value ` +
                `applied to the underlying image element and cause layout shifts on a page.`;
    }
    else {
        reason =
            `Changing the \`${inputName}\` would have no effect on the underlying ` +
                `image element, because the resource loading has already occurred.`;
    }
    return new RuntimeError(2953 /* RuntimeErrorCode.UNEXPECTED_INPUT_CHANGE */, `${imgDirectiveDetails(dir.ngSrc)} \`${inputName}\` was updated after initialization. ` +
        `The NgOptimizedImage directive will not react to this input change. ${reason} ` +
        `To fix this, either switch \`${inputName}\` to a static value ` +
        `or wrap the image element in an *ngIf that is gated on the necessary value.`);
}
/**
 * Verify that none of the listed inputs has changed.
 */
function assertNoPostInitInputChange(dir, changes, inputs) {
    inputs.forEach((input) => {
        const isUpdated = changes.hasOwnProperty(input);
        if (isUpdated && !changes[input].isFirstChange()) {
            if (input === 'ngSrc') {
                // When the `ngSrc` input changes, we detect that only in the
                // `ngOnChanges` hook, thus the `ngSrc` is already set. We use
                // `ngSrc` in the error message, so we use a previous value, but
                // not the updated one in it.
                dir = { ngSrc: changes[input].previousValue };
            }
            throw postInitInputChangeError(dir, input);
        }
    });
}
/**
 * Verifies that a specified input is a number greater than 0.
 */
function assertGreaterThanZero(dir, inputValue, inputName) {
    const validNumber = typeof inputValue === 'number' && inputValue > 0;
    const validString = typeof inputValue === 'string' && /^\d+$/.test(inputValue.trim()) && parseInt(inputValue) > 0;
    if (!validNumber && !validString) {
        throw new RuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `${imgDirectiveDetails(dir.ngSrc)} \`${inputName}\` has an invalid value. ` +
            `To fix this, provide \`${inputName}\` as a number greater than 0.`);
    }
}
/**
 * Verifies that the rendered image is not visually distorted. Effectively this is checking:
 * - Whether the "width" and "height" attributes reflect the actual dimensions of the image.
 * - Whether image styling is "correct" (see below for a longer explanation).
 */
function assertNoImageDistortion(dir, img, renderer) {
    const callback = () => {
        removeLoadListenerFn();
        removeErrorListenerFn();
        const computedStyle = window.getComputedStyle(img);
        let renderedWidth = parseFloat(computedStyle.getPropertyValue('width'));
        let renderedHeight = parseFloat(computedStyle.getPropertyValue('height'));
        const boxSizing = computedStyle.getPropertyValue('box-sizing');
        if (boxSizing === 'border-box') {
            const paddingTop = computedStyle.getPropertyValue('padding-top');
            const paddingRight = computedStyle.getPropertyValue('padding-right');
            const paddingBottom = computedStyle.getPropertyValue('padding-bottom');
            const paddingLeft = computedStyle.getPropertyValue('padding-left');
            renderedWidth -= parseFloat(paddingRight) + parseFloat(paddingLeft);
            renderedHeight -= parseFloat(paddingTop) + parseFloat(paddingBottom);
        }
        const renderedAspectRatio = renderedWidth / renderedHeight;
        const nonZeroRenderedDimensions = renderedWidth !== 0 && renderedHeight !== 0;
        const intrinsicWidth = img.naturalWidth;
        const intrinsicHeight = img.naturalHeight;
        const intrinsicAspectRatio = intrinsicWidth / intrinsicHeight;
        const suppliedWidth = dir.width;
        const suppliedHeight = dir.height;
        const suppliedAspectRatio = suppliedWidth / suppliedHeight;
        // Tolerance is used to account for the impact of subpixel rendering.
        // Due to subpixel rendering, the rendered, intrinsic, and supplied
        // aspect ratios of a correctly configured image may not exactly match.
        // For example, a `width=4030 height=3020` image might have a rendered
        // size of "1062w, 796.48h". (An aspect ratio of 1.334... vs. 1.333...)
        const inaccurateDimensions = Math.abs(suppliedAspectRatio - intrinsicAspectRatio) > ASPECT_RATIO_TOLERANCE;
        const stylingDistortion = nonZeroRenderedDimensions &&
            Math.abs(intrinsicAspectRatio - renderedAspectRatio) > ASPECT_RATIO_TOLERANCE;
        if (inaccurateDimensions) {
            console.warn(formatRuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `${imgDirectiveDetails(dir.ngSrc)} the aspect ratio of the image does not match ` +
                `the aspect ratio indicated by the width and height attributes. ` +
                `\nIntrinsic image size: ${intrinsicWidth}w x ${intrinsicHeight}h ` +
                `(aspect-ratio: ${round(intrinsicAspectRatio)}). \nSupplied width and height attributes: ` +
                `${suppliedWidth}w x ${suppliedHeight}h (aspect-ratio: ${round(suppliedAspectRatio)}). ` +
                `\nTo fix this, update the width and height attributes.`));
        }
        else if (stylingDistortion) {
            console.warn(formatRuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `${imgDirectiveDetails(dir.ngSrc)} the aspect ratio of the rendered image ` +
                `does not match the image's intrinsic aspect ratio. ` +
                `\nIntrinsic image size: ${intrinsicWidth}w x ${intrinsicHeight}h ` +
                `(aspect-ratio: ${round(intrinsicAspectRatio)}). \nRendered image size: ` +
                `${renderedWidth}w x ${renderedHeight}h (aspect-ratio: ` +
                `${round(renderedAspectRatio)}). \nThis issue can occur if "width" and "height" ` +
                `attributes are added to an image without updating the corresponding ` +
                `image styling. To fix this, adjust image styling. In most cases, ` +
                `adding "height: auto" or "width: auto" to the image styling will fix ` +
                `this issue.`));
        }
        else if (!dir.ngSrcset && nonZeroRenderedDimensions) {
            // If `ngSrcset` hasn't been set, sanity check the intrinsic size.
            const recommendedWidth = RECOMMENDED_SRCSET_DENSITY_CAP * renderedWidth;
            const recommendedHeight = RECOMMENDED_SRCSET_DENSITY_CAP * renderedHeight;
            const oversizedWidth = intrinsicWidth - recommendedWidth >= OVERSIZED_IMAGE_TOLERANCE;
            const oversizedHeight = intrinsicHeight - recommendedHeight >= OVERSIZED_IMAGE_TOLERANCE;
            if (oversizedWidth || oversizedHeight) {
                console.warn(formatRuntimeError(2960 /* RuntimeErrorCode.OVERSIZED_IMAGE */, `${imgDirectiveDetails(dir.ngSrc)} the intrinsic image is significantly ` +
                    `larger than necessary. ` +
                    `\nRendered image size: ${renderedWidth}w x ${renderedHeight}h. ` +
                    `\nIntrinsic image size: ${intrinsicWidth}w x ${intrinsicHeight}h. ` +
                    `\nRecommended intrinsic image size: ${recommendedWidth}w x ${recommendedHeight}h. ` +
                    `\nNote: Recommended intrinsic image size is calculated assuming a maximum DPR of ` +
                    `${RECOMMENDED_SRCSET_DENSITY_CAP}. To improve loading time, resize the image ` +
                    `or consider using the "ngSrcset" and "sizes" attributes.`));
            }
        }
    };
    const removeLoadListenerFn = renderer.listen(img, 'load', callback);
    // We only listen to the `error` event to remove the `load` event listener because it will not be
    // fired if the image fails to load. This is done to prevent memory leaks in development mode
    // because image elements aren't garbage-collected properly. It happens because zone.js stores the
    // event listener directly on the element and closures capture `dir`.
    const removeErrorListenerFn = renderer.listen(img, 'error', () => {
        removeLoadListenerFn();
        removeErrorListenerFn();
    });
    callOnLoadIfImageIsLoaded(img, callback);
}
/**
 * Verifies that a specified input is set.
 */
function assertNonEmptyWidthAndHeight(dir) {
    let missingAttributes = [];
    if (dir.width === undefined)
        missingAttributes.push('width');
    if (dir.height === undefined)
        missingAttributes.push('height');
    if (missingAttributes.length > 0) {
        throw new RuntimeError(2954 /* RuntimeErrorCode.REQUIRED_INPUT_MISSING */, `${imgDirectiveDetails(dir.ngSrc)} these required attributes ` +
            `are missing: ${missingAttributes.map((attr) => `"${attr}"`).join(', ')}. ` +
            `Including "width" and "height" attributes will prevent image-related layout shifts. ` +
            `To fix this, include "width" and "height" attributes on the image tag or turn on ` +
            `"fill" mode with the \`fill\` attribute.`);
    }
}
/**
 * Verifies that width and height are not set. Used in fill mode, where those attributes don't make
 * sense.
 */
function assertEmptyWidthAndHeight(dir) {
    if (dir.width || dir.height) {
        throw new RuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `${imgDirectiveDetails(dir.ngSrc)} the attributes \`height\` and/or \`width\` are present ` +
            `along with the \`fill\` attribute. Because \`fill\` mode causes an image to fill its containing ` +
            `element, the size attributes have no effect and should be removed.`);
    }
}
/**
 * Verifies that the rendered image has a nonzero height. If the image is in fill mode, provides
 * guidance that this can be caused by the containing element's CSS position property.
 */
function assertNonZeroRenderedHeight(dir, img, renderer) {
    const callback = () => {
        removeLoadListenerFn();
        removeErrorListenerFn();
        const renderedHeight = img.clientHeight;
        if (dir.fill && renderedHeight === 0) {
            console.warn(formatRuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `${imgDirectiveDetails(dir.ngSrc)} the height of the fill-mode image is zero. ` +
                `This is likely because the containing element does not have the CSS 'position' ` +
                `property set to one of the following: "relative", "fixed", or "absolute". ` +
                `To fix this problem, make sure the container element has the CSS 'position' ` +
                `property defined and the height of the element is not zero.`));
        }
    };
    const removeLoadListenerFn = renderer.listen(img, 'load', callback);
    // See comments in the `assertNoImageDistortion`.
    const removeErrorListenerFn = renderer.listen(img, 'error', () => {
        removeLoadListenerFn();
        removeErrorListenerFn();
    });
    callOnLoadIfImageIsLoaded(img, callback);
}
/**
 * Verifies that the `loading` attribute is set to a valid input &
 * is not used on priority images.
 */
function assertValidLoadingInput(dir) {
    if (dir.loading && dir.priority) {
        throw new RuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `${imgDirectiveDetails(dir.ngSrc)} the \`loading\` attribute ` +
            `was used on an image that was marked "priority". ` +
            `Setting \`loading\` on priority images is not allowed ` +
            `because these images will always be eagerly loaded. ` +
            `To fix this, remove the “loading” attribute from the priority image.`);
    }
    const validInputs = ['auto', 'eager', 'lazy'];
    if (typeof dir.loading === 'string' && !validInputs.includes(dir.loading)) {
        throw new RuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `${imgDirectiveDetails(dir.ngSrc)} the \`loading\` attribute ` +
            `has an invalid value (\`${dir.loading}\`). ` +
            `To fix this, provide a valid value ("lazy", "eager", or "auto").`);
    }
}
/**
 * Warns if NOT using a loader (falling back to the generic loader) and
 * the image appears to be hosted on one of the image CDNs for which
 * we do have a built-in image loader. Suggests switching to the
 * built-in loader.
 *
 * @param ngSrc Value of the ngSrc attribute
 * @param imageLoader ImageLoader provided
 */
function assertNotMissingBuiltInLoader(ngSrc, imageLoader) {
    if (imageLoader === noopImageLoader) {
        let builtInLoaderName = '';
        for (const loader of BUILT_IN_LOADERS) {
            if (loader.testUrl(ngSrc)) {
                builtInLoaderName = loader.name;
                break;
            }
        }
        if (builtInLoaderName) {
            console.warn(formatRuntimeError(2962 /* RuntimeErrorCode.MISSING_BUILTIN_LOADER */, `NgOptimizedImage: It looks like your images may be hosted on the ` +
                `${builtInLoaderName} CDN, but your app is not using Angular's ` +
                `built-in loader for that CDN. We recommend switching to use ` +
                `the built-in by calling \`provide${builtInLoaderName}Loader()\` ` +
                `in your \`providers\` and passing it your instance's base URL. ` +
                `If you don't want to use the built-in loader, define a custom ` +
                `loader function using IMAGE_LOADER to silence this warning.`));
        }
    }
}
/**
 * Warns if ngSrcset is present and no loader is configured (i.e. the default one is being used).
 */
function assertNoNgSrcsetWithoutLoader(dir, imageLoader) {
    if (dir.ngSrcset && imageLoader === noopImageLoader) {
        console.warn(formatRuntimeError(2963 /* RuntimeErrorCode.MISSING_NECESSARY_LOADER */, `${imgDirectiveDetails(dir.ngSrc)} the \`ngSrcset\` attribute is present but ` +
            `no image loader is configured (i.e. the default one is being used), ` +
            `which would result in the same image being used for all configured sizes. ` +
            `To fix this, provide a loader or remove the \`ngSrcset\` attribute from the image.`));
    }
}
/**
 * Warns if loaderParams is present and no loader is configured (i.e. the default one is being
 * used).
 */
function assertNoLoaderParamsWithoutLoader(dir, imageLoader) {
    if (dir.loaderParams && imageLoader === noopImageLoader) {
        console.warn(formatRuntimeError(2963 /* RuntimeErrorCode.MISSING_NECESSARY_LOADER */, `${imgDirectiveDetails(dir.ngSrc)} the \`loaderParams\` attribute is present but ` +
            `no image loader is configured (i.e. the default one is being used), ` +
            `which means that the loaderParams data will not be consumed and will not affect the URL. ` +
            `To fix this, provide a custom loader or remove the \`loaderParams\` attribute from the image.`));
    }
}
/**
 * Warns if the priority attribute is used too often on page load
 */
async function assetPriorityCountBelowThreshold(appRef) {
    if (IMGS_WITH_PRIORITY_ATTR_COUNT === 0) {
        IMGS_WITH_PRIORITY_ATTR_COUNT++;
        await whenStable(appRef);
        if (IMGS_WITH_PRIORITY_ATTR_COUNT > PRIORITY_COUNT_THRESHOLD) {
            console.warn(formatRuntimeError(2966 /* RuntimeErrorCode.TOO_MANY_PRIORITY_ATTRIBUTES */, `NgOptimizedImage: The "priority" attribute is set to true more than ${PRIORITY_COUNT_THRESHOLD} times (${IMGS_WITH_PRIORITY_ATTR_COUNT} times). ` +
                `Marking too many images as "high" priority can hurt your application's LCP (https://web.dev/lcp). ` +
                `"Priority" should only be set on the image expected to be the page's LCP element.`));
        }
    }
    else {
        IMGS_WITH_PRIORITY_ATTR_COUNT++;
    }
}
/**
 * Warns if placeholder's dimension are over a threshold.
 *
 * This assert function is meant to only run on the browser.
 */
function assertPlaceholderDimensions(dir, imgElement) {
    const computedStyle = window.getComputedStyle(imgElement);
    let renderedWidth = parseFloat(computedStyle.getPropertyValue('width'));
    let renderedHeight = parseFloat(computedStyle.getPropertyValue('height'));
    if (renderedWidth > PLACEHOLDER_DIMENSION_LIMIT || renderedHeight > PLACEHOLDER_DIMENSION_LIMIT) {
        console.warn(formatRuntimeError(2967 /* RuntimeErrorCode.PLACEHOLDER_DIMENSION_LIMIT_EXCEEDED */, `${imgDirectiveDetails(dir.ngSrc)} it uses a placeholder image, but at least one ` +
            `of the dimensions attribute (height or width) exceeds the limit of ${PLACEHOLDER_DIMENSION_LIMIT}px. ` +
            `To fix this, use a smaller image as a placeholder.`));
    }
}
function callOnLoadIfImageIsLoaded(img, callback) {
    // https://html.spec.whatwg.org/multipage/embedded-content.html#dom-img-complete
    // The spec defines that `complete` is truthy once its request state is fully available.
    // The image may already be available if it’s loaded from the browser cache.
    // In that case, the `load` event will not fire at all, meaning that all setup
    // callbacks listening for the `load` event will not be invoked.
    // In Safari, there is a known behavior where the `complete` property of an
    // `HTMLImageElement` may sometimes return `true` even when the image is not fully loaded.
    // Checking both `img.complete` and `img.naturalWidth` is the most reliable way to
    // determine if an image has been fully loaded, especially in browsers where the
    // `complete` property may return `true` prematurely.
    if (img.complete && img.naturalWidth) {
        callback();
    }
}
function round(input) {
    return Number.isInteger(input) ? input : input.toFixed(2);
}
// Transform function to handle SafeValue input for ngSrc. This doesn't do any sanitization,
// as that is not needed for img.src and img.srcset. This transform is purely for compatibility.
function unwrapSafeUrl(value) {
    if (typeof value === 'string') {
        return value;
    }
    return unwrapSafeValue(value);
}
// Transform function to handle inputs which may be booleans, strings, or string representations
// of boolean values. Used for the placeholder attribute.
export function booleanOrUrlAttribute(value) {
    if (typeof value === 'string' && value !== 'true' && value !== 'false' && value !== '') {
        return value;
    }
    return booleanAttribute(value);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfb3B0aW1pemVkX2ltYWdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9kaXJlY3RpdmVzL25nX29wdGltaXplZF9pbWFnZS9uZ19vcHRpbWl6ZWRfaW1hZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUNMLGdCQUFnQixFQUNoQixTQUFTLEVBQ1QsVUFBVSxFQUNWLE1BQU0sRUFDTixRQUFRLEVBQ1IsS0FBSyxFQUNMLE1BQU0sRUFDTixlQUFlLEVBSWYsV0FBVyxFQUNYLFNBQVMsRUFFVCxtQkFBbUIsSUFBSSxrQkFBa0IsRUFDekMsYUFBYSxJQUFJLFlBQVksRUFDN0Isc0JBQXNCLElBQUkscUJBQXFCLEVBRS9DLHVCQUF1QixJQUFJLHNCQUFzQixFQUNqRCxhQUFhLElBQUksWUFBWSxFQUU3QixnQkFBZ0IsSUFBSSxlQUFlLEVBQ25DLGlCQUFpQixFQUNqQixjQUFjLEVBQ2QsV0FBVyxJQUFJLFVBQVUsR0FDMUIsTUFBTSxlQUFlLENBQUM7QUFHdkIsT0FBTyxFQUFDLGdCQUFnQixFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFFbkQsT0FBTyxFQUFDLG1CQUFtQixFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDbkQsT0FBTyxFQUFDLG9CQUFvQixFQUFDLE1BQU0sbUNBQW1DLENBQUM7QUFDdkUsT0FBTyxFQUNMLFlBQVksRUFHWixlQUFlLEdBQ2hCLE1BQU0sOEJBQThCLENBQUM7QUFDdEMsT0FBTyxFQUFDLGtCQUFrQixFQUFDLE1BQU0saUNBQWlDLENBQUM7QUFDbkUsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLDhCQUE4QixDQUFDO0FBQzdELE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLGdDQUFnQyxDQUFDO0FBQ2pFLE9BQU8sRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBQ3RELE9B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QXFCLEVBQUUsUUFBc0I7SUFDOUUsZ0ZBQWdGO0lBQ2hGLHdGQUF3RjtJQUN4Riw0RUFBNEU7SUFDNUUsOEVBQThFO0lBQzlFLGdFQUFnRTtJQUNoRSwyRUFBMkU7SUFDM0UsMEZBQTBGO0lBQzFGLGtGQUFrRjtJQUNsRixnRkFBZ0Y7SUFDaEYscURBQXFEO0lBQ3JELElBQUksR0FBRyxDQUFDLFFBQVEsSUFBSSxHQUFHLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDckMsUUFBUSxFQUFFLENBQUM7SUFDYixDQUFDO0FBQ0gsQ0FBQztBQUVELFNBQVMsS0FBSyxDQUFDLEtBQWE7SUFDMUIsT0FBTyxNQUFNLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDNUQsQ0FBQztBQUVELDRGQUE0RjtBQUM1RixnR0FBZ0c7QUFDaEcsU0FBUyxhQUFhLENBQUMsS0FBeUI7SUFDOUMsSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLEVBQUUsQ0FBQztRQUM5QixPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7SUFDRCxPQUFPLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNoQyxDQUFDO0FBRUQsZ0dBQWdHO0FBQ2hHLHlEQUF5RDtBQUN6RCxNQUFNLFVBQVUscUJBQXFCLENBQUMsS0FBdUI7SUFDM0QsSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLElBQUksS0FBSyxLQUFLLE1BQU0sSUFBSSxLQUFLLEtBQUssT0FBTyxJQUFJLEtBQUssS0FBSyxFQUFFLEVBQUUsQ0FBQztRQUN2RixPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7SUFDRCxPQUFPLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ2pDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbmltcG9ydCB7XG4gIGJvb2xlYW5BdHRyaWJ1dGUsXG4gIERpcmVjdGl2ZSxcbiAgRWxlbWVudFJlZixcbiAgaW5qZWN0LFxuICBJbmplY3RvcixcbiAgSW5wdXQsXG4gIE5nWm9uZSxcbiAgbnVtYmVyQXR0cmlidXRlLFxuICBPbkNoYW5nZXMsXG4gIE9uRGVzdHJveSxcbiAgT25Jbml0LFxuICBQTEFURk9STV9JRCxcbiAgUmVuZGVyZXIyLFxuICBTaW1wbGVDaGFuZ2VzLFxuICDJtWZvcm1hdFJ1bnRpbWVFcnJvciBhcyBmb3JtYXRSdW50aW1lRXJyb3IsXG4gIMm1SU1BR0VfQ09ORklHIGFzIElNQUdFX0NPTkZJRyxcbiAgybVJTUFHRV9DT05GSUdfREVGQVVMVFMgYXMgSU1BR0VfQ09ORklHX0RFRkFVTFRTLFxuICDJtUltYWdlQ29uZmlnIGFzIEltYWdlQ29uZmlnLFxuICDJtXBlcmZvcm1hbmNlTWFya0ZlYXR1cmUgYXMgcGVyZm9ybWFuY2VNYXJrRmVhdHVyZSxcbiAgybVSdW50aW1lRXJyb3IgYXMgUnVudGltZUVycm9yLFxuICDJtVNhZmVWYWx1ZSBhcyBTYWZlVmFsdWUsXG4gIMm1dW53cmFwU2FmZVZhbHVlIGFzIHVud3JhcFNhZmVWYWx1ZSxcbiAgQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gIEFwcGxpY2F0aW9uUmVmLFxuICDJtXdoZW5TdGFibGUgYXMgd2hlblN0YWJsZSxcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7UnVudGltZUVycm9yQ29kZX0gZnJvbSAnLi4vLi4vZXJyb3JzJztcbmltcG9ydCB7aXNQbGF0Zm9ybVNlcnZlcn0gZnJvbSAnLi4vLi4vcGxhdGZvcm1faWQnO1xuXG5pbXBvcnQge2ltZ0RpcmVjdGl2ZURldGFpbHN9IGZyb20gJy4vZXJyb3JfaGVscGVyJztcbmltcG9ydCB7Y2xvdWRpbmFyeUxvYWRlckluZm99IGZyb20gJy4vaW1hZ2VfbG9hZGVycy9jbG91ZGluYXJ5X2xvYWRlcic7XG5pbXBvcnQge1xuICBJTUFHRV9MT0FERVIsXG4gIEltYWdlTG9hZGVyLFxuICBJbWFnZUxvYWRlckNvbmZpZyxcbiAgbm9vcEltYWdlTG9hZGVyLFxufSBmcm9tICcuL2ltYWdlX2xvYWRlcnMvaW1hZ2VfbG9hZGVyJztcbmltcG9ydCB7aW1hZ2VLaXRMb2FkZXJJbmZvfSBmcm9tICcuL2ltYWdlX2xvYWRlcnMvaW1hZ2VraXRfbG9hZGVyJztcbmltcG9ydCB7aW1naXhMb2FkZXJJbmZvfSBmcm9tICcuL2ltYWdlX2xvYWRlcnMvaW1naXhfbG9hZGVyJztcbmltcG9ydCB7bmV0bGlmeUxvYWRlckluZm99IGZyb20gJy4vaW1hZ2VfbG9hZGVycy9uZXRsaWZ5X2xvYWRlcic7XG5pbXBvcnQge0xDUEltYWdlT2JzZXJ2ZXJ9IGZyb20gJy4vbGNwX2ltYWdlX29ic2VydmVyJztcbmltcG9ydCB7UHJlY29ubmVjdExpbmtDaGVja2VyfSBmcm9tICcuL3ByZWNvbm5lY3RfbGlua19jaGVja2VyJztcbmltcG9ydCB7UHJlbG9hZExpbmtDcmVhdG9yfSBmcm9tICcuL3ByZWxvYWQtbGluay1jcmVhdG9yJztcblxuLyoqXG4gKiBXaGVuIGEgQmFzZTY0LWVuY29kZWQgaW1hZ2UgaXMgcGFzc2VkIGFzIGFuIGlucHV0IHRvIHRoZSBgTmdPcHRpbWl6ZWRJbWFnZWAgZGlyZWN0aXZlLFxuICogYW4gZXJyb3IgaXMgdGhyb3duLiBUaGUgaW1hZ2UgY29udGVudCAoYXMgYSBzdHJpbmcpIG1pZ2h0IGJlIHZlcnkgbG9uZywgdGh1cyBtYWtpbmdcbiAqIGl0IGhhcmQgdG8gcmVhZCBhbiBlcnJvciBtZXNzYWdlIGlmIHRoZSBlbnRpcmUgc3RyaW5nIGlzIGluY2x1ZGVkLiBUaGlzIGNvbnN0IGRlZmluZXNcbiAqIHRoZSBudW1iZXIgb2YgY2hhcmFjdGVycyB0aGF0IHNob3VsZCBiZSBpbmNsdWRlZCBpbnRvIHRoZSBlcnJvciBtZXNzYWdlLiBUaGUgcmVzdFxuICogb2YgdGhlIGNvbnRlbnQgaXMgdHJ1bmNhdGVkLlxuICovXG5jb25zdCBCQVNFNjRfSU1HX01BWF9MRU5HVEhfSU5fRVJST1IgPSA1MDtcblxuLyoqXG4gKiBSZWdFeHByIHRvIGRldGVybWluZSB3aGV0aGVyIGEgc3JjIGluIGEgc3Jjc2V0IGlzIHVzaW5nIHdpZHRoIGRlc2NyaXB0b3JzLlxuICogU2hvdWxkIG1hdGNoIHNvbWV0aGluZyBsaWtlOiBcIjEwMHcsIDIwMHdcIi5cbiAqL1xuY29uc3QgVkFMSURfV0lEVEhfREVTQ1JJUFRPUl9TUkNTRVQgPSAvXigoXFxzKlxcZCt3XFxzKigsfCQpKXsxLH0pJC87XG5cbi8qKlxuICogUmVnRXhwciB0byBkZXRlcm1pbmUgd2hldGhlciBhIHNyYyBpbiBhIHNyY3NldCBpcyB1c2luZyBkZW5zaXR5IGRlc2NyaXB0b3JzLlxuICogU2hvdWxkIG1hdGNoIHNvbWV0aGluZyBsaWtlOiBcIjF4LCAyeCwgNTB4XCIuIEFsc28gc3VwcG9ydHMgZGVjaW1hbHMgbGlrZSBcIjEuNXgsIDEuNTB4XCIuXG4gKi9cbmNvbnN0IFZBTElEX0RFTlNJVFlfREVTQ1JJUFRPUl9TUkNTRVQgPSAvXigoXFxzKlxcZCsoXFwuXFxkKyk/eFxccyooLHwkKSl7MSx9KSQvO1xuXG4vKipcbiAqIFNyY3NldCB2YWx1ZXMgd2l0aCBhIGRlbnNpdHkgZGVzY3JpcHRvciBoaWdoZXIgdGhhbiB0aGlzIHZhbHVlIHdpbGwgYWN0aXZlbHlcbiAqIHRocm93IGFuIGVycm9yLiBTdWNoIGRlbnNpdGllcyBhcmUgbm90IHBlcm1pdHRlZCBhcyB0aGV5IGNhdXNlIGltYWdlIHNpemVzXG4gKiB0byBiZSB1bnJlYXNvbmFibHkgbGFyZ2UgYW5kIHNsb3cgZG93biBMQ1AuXG4gKi9cbmV4cG9ydCBjb25zdCBBQlNPTFVURV9TUkNTRVRfREVOU0lUWV9DQVAgPSAzO1xuXG4vKipcbiAqIFVzZWQgb25seSBpbiBlcnJvciBtZXNzYWdlIHRleHQgdG8gY29tbXVuaWNhdGUgYmVzdCBwcmFjdGljZXMsIGFzIHdlIHdpbGxcbiAqIG9ubHkgdGhyb3cgYmFzZWQgb24gdGhlIHNsaWdodGx5IG1vcmUgY29uc2VydmF0aXZlIEFCU09MVVRFX1NSQ1NFVF9ERU5TSVRZX0NBUC5cbiAqL1xuZXhwb3J0IGNvbnN0IFJFQ09NTUVOREVEX1NSQ1NFVF9ERU5TSVRZX0NBUCA9IDI7XG5cbi8qKlxuICogVXNlZCBpbiBnZW5lcmF0aW5nIGF1dG9tYXRpYyBkZW5zaXR5LWJhc2VkIHNyY3NldHNcbiAqL1xuY29uc3QgREVOU0lUWV9TUkNTRVRfTVVMVElQTElFUlMgPSBbMSwgMl07XG5cbi8qKlxuICogVXNlZCB0byBkZXRlcm1pbmUgd2hpY2ggYnJlYWtwb2ludHMgdG8gdXNlIG9uIGZ1bGwtd2lkdGggaW1hZ2VzXG4gKi9cbmNvbnN0IFZJRVdQT1JUX0JSRUFLUE9JTlRfQ1VUT0ZGID0gNjQwO1xuLyoqXG4gKiBVc2VkIHRvIGRldGVybWluZSB3aGV0aGVyIHR3byBhc3BlY3QgcmF0aW9zIGFyZSBzaW1pbGFyIGluIHZhbHVlLlxuICovXG5jb25zdCBBU1BFQ1RfUkFUSU9fVE9MRVJBTkNFID0gMC4xO1xuXG4vKipcbiAqIFVzZWQgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgdGhlIGltYWdlIGhhcyBiZWVuIHJlcXVlc3RlZCBhdCBhbiBvdmVybHlcbiAqIGxhcmdlIHNpemUgY29tcGFyZWQgdG8gdGhlIGFjdHVhbCByZW5kZXJlZCBpbWFnZSBzaXplIChhZnRlciB0YWtpbmdcbiAqIGludG8gYWNjb3VudCBhIHR5cGljYWwgZGV2aWNlIHBpeGVsIHJhdGlvKS4gSW4gcGl4ZWxzLlxuICovXG5jb25zdCBPVkVSU0laRURfSU1BR0VfVE9MRVJBTkNFID0gMTAwMDtcblxuLyoqXG4gKiBVc2VkIHRvIGxpbWl0IGF1dG9tYXRpYyBzcmNzZXQgZ2VuZXJhdGlvbiBvZiB2ZXJ5IGxhcmdlIHNvdXJjZXMgZm9yXG4gKiBmaXhlZC1zaXplIGltYWdlcy4gSW4gcGl4ZWxzLlxuICovXG5jb25zdCBGSVhFRF9TUkNTRVRfV0lEVEhfTElNSVQgPSAxOTIwO1xuY29uc3QgRklYRURfU1JDU0VUX0hFSUdIVF9MSU1JVCA9IDEwODA7XG5cbi8qKlxuICogRGVmYXVsdCBibHVyIHJhZGl1cyBvZiB0aGUgQ1NTIGZpbHRlciB1c2VkIG9uIHBsYWNlaG9sZGVyIGltYWdlcywgaW4gcGl4ZWxzXG4gKi9cbmV4cG9ydCBjb25zdCBQTEFDRUhPTERFUl9CTFVSX0FNT1VOVCA9IDE1O1xuXG4vKipcbiAqIFBsYWNlaG9sZGVyIGRpbWVuc2lvbiAoaGVpZ2h0IG9yIHdpZHRoKSBsaW1pdCBpbiBwaXhlbHMuIEFuZ3VsYXIgcHJvZHVjZXMgYSB3YXJuaW5nXG4gKiB3aGVuIHRoaXMgbGltaXQgaXMgY3Jvc3NlZC5cbiAqL1xuY29uc3QgUExBQ0VIT0xERVJfRElNRU5TSU9OX0xJTUlUID0gMTAwMDtcblxuLyoqXG4gKiBVc2VkIHRvIHdhcm4gb3IgZXJyb3Igd2hlbiB0aGUgdXNlciBwcm92aWRlcyBhbiBvdmVybHkgbGFyZ2UgZGF0YVVSTCBmb3IgdGhlIHBsYWNlaG9sZGVyXG4gKiBhdHRyaWJ1dGUuXG4gKiBDaGFyYWN0ZXIgY291bnQgb2YgQmFzZTY0IGltYWdlcyBpcyAxIGNoYXJhY3RlciBwZXIgYnl0ZSwgYW5kIGJhc2U2NCBlbmNvZGluZyBpcyBhcHByb3hpbWF0ZWx5XG4gKiAzMyUgbGFyZ2VyIHRoYW4gYmFzZSBpbWFnZXMsIHNvIDQwMDAgY2hhcmFjdGVycyBpcyBhcm91bmQgM0tCIG9uIGRpc2sgYW5kIDEwMDAwIGNoYXJhY3RlcnMgaXNcbiAqIGFyb3VuZCA3LjdLQi4gRXhwZXJpbWVudGFsbHksIDQwMDAgY2hhcmFjdGVycyBpcyBhYm91dCAyMHgyMHB4IGluIFBORyBvciBtZWRpdW0tcXVhbGl0eSBKUEVHXG4gKiBmb3JtYXQsIGFuZCAxMCwwMDAgaXMgYXJvdW5kIDUweDUwcHgsIGJ1dCB0aGVyZSdzIHF1aXRlIGEgYml0IG9mIHZhcmlhdGlvbiBkZXBlbmRpbmcgb24gaG93IHRoZVxuICogaW1hZ2UgaXMgc2F2ZWQuXG4gKi9cbmV4cG9ydCBjb25zdCBEQVRBX1VSTF9XQVJOX0xJTUlUID0gNDAwMDtcbmV4cG9ydCBjb25zdCBEQVRBX1VSTF9FUlJPUl9MSU1JVCA9IDEwMDAwO1xuXG4vKiogSW5mbyBhYm91dCBidWlsdC1pbiBsb2FkZXJzIHdlIGNhbiB0ZXN0IGZvci4gKi9cbmV4cG9ydCBjb25zdCBCVUlMVF9JTl9MT0FERVJTID0gW1xuICBpbWdpeExvYWRlckluZm8sXG4gIGltYWdlS2l0TG9hZGVySW5mbyxcbiAgY2xvdWRpbmFyeUxvYWRlckluZm8sXG4gIG5ldGxpZnlMb2FkZXJJbmZvLFxuXTtcblxuLyoqXG4gKiBUaHJlc2hvbGQgZm9yIHRoZSBQUklPUklUWV9UUlVFX0NPVU5UXG4gKi9cbmNvbnN0IFBSSU9SSVRZX0NPVU5UX1RIUkVTSE9MRCA9IDEwO1xuXG4vKipcbiAqIFRoaXMgY291bnQgaXMgdXNlZCB0byBsb2cgYSBkZXZNb2RlIHdhcm5pbmdcbiAqIHdoZW4gdGhlIGNvdW50IG9mIGRpcmVjdGl2ZSBpbnN0YW5jZXMgd2l0aCBwcmlvcml0eT10cnVlXG4gKiBleGNlZWRzIHRoZSB0aHJlc2hvbGQgUFJJT1JJVFlfQ09VTlRfVEhSRVNIT0xEXG4gKi9cbmxldCBJTUdTX1dJVEhfUFJJT1JJVFlfQVRUUl9DT1VOVCA9IDA7XG5cbi8qKlxuICogVGhpcyBmdW5jdGlvbiBpcyBmb3IgdGVzdGluZyBwdXJwb3NlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVzZXRJbWFnZVByaW9yaXR5Q291bnQoKSB7XG4gIElNR1NfV0lUSF9QUklPUklUWV9BVFRSX0NPVU5UID0gMDtcbn1cblxuLyoqXG4gKiBDb25maWcgb3B0aW9ucyB1c2VkIGluIHJlbmRlcmluZyBwbGFjZWhvbGRlciBpbWFnZXMuXG4gKlxuICogQHNlZSB7QGxpbmsgTmdPcHRpbWl6ZWRJbWFnZX1cbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBJbWFnZVBsYWNlaG9sZGVyQ29uZmlnIHtcbiAgYmx1cj86IGJvb2xlYW47XG59XG5cbi8qKlxuICogRGlyZWN0aXZlIHRoYXQgaW1wcm92ZXMgaW1hZ2UgbG9hZGluZyBwZXJmb3JtYW5jZSBieSBlbmZvcmNpbmcgYmVzdCBwcmFjdGljZXMuXG4gKlxuICogYE5nT3B0aW1pemVkSW1hZ2VgIGVuc3VyZXMgdGhhdCB0aGUgbG9hZGluZyBvZiB0aGUgTGFyZ2VzdCBDb250ZW50ZnVsIFBhaW50IChMQ1ApIGltYWdlIGlzXG4gKiBwcmlvcml0aXplZCBieTpcbiAqIC0gQXV0b21hdGljYWxseSBzZXR0aW5nIHRoZSBgZmV0Y2hwcmlvcml0eWAgYXR0cmlidXRlIG9uIHRoZSBgPGltZz5gIHRhZ1xuICogLSBMYXp5IGxvYWRpbmcgbm9uLXByaW9yaXR5IGltYWdlcyBieSBkZWZhdWx0XG4gKiAtIEF1dG9tYXRpY2FsbHkgZ2VuZXJhdGluZyBhIHByZWNvbm5lY3QgbGluayB0YWcgaW4gdGhlIGRvY3VtZW50IGhlYWRcbiAqXG4gKiBJbiBhZGRpdGlvbiwgdGhlIGRpcmVjdGl2ZTpcbiAqIC0gR2VuZXJhdGVzIGFwcHJvcHJpYXRlIGFzc2V0IFVSTHMgaWYgYSBjb3JyZXNwb25kaW5nIGBJbWFnZUxvYWRlcmAgZnVuY3Rpb24gaXMgcHJvdmlkZWRcbiAqIC0gQXV0b21hdGljYWxseSBnZW5lcmF0ZXMgYSBzcmNzZXRcbiAqIC0gUmVxdWlyZXMgdGhhdCBgd2lkdGhgIGFuZCBgaGVpZ2h0YCBhcmUgc2V0XG4gKiAtIFdhcm5zIGlmIGB3aWR0aGAgb3IgYGhlaWdodGAgaGF2ZSBiZWVuIHNldCBpbmNvcnJlY3RseVxuICogLSBXYXJucyBpZiB0aGUgaW1hZ2Ugd2lsbCBiZSB2aXN1YWxseSBkaXN0b3J0ZWQgd2hlbiByZW5kZXJlZFxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKiBUaGUgYE5nT3B0aW1pemVkSW1hZ2VgIGRpcmVjdGl2ZSBpcyBtYXJrZWQgYXMgW3N0YW5kYWxvbmVdKGd1aWRlL2NvbXBvbmVudHMvaW1wb3J0aW5nKSBhbmQgY2FuXG4gKiBiZSBpbXBvcnRlZCBkaXJlY3RseS5cbiAqXG4gKiBGb2xsb3cgdGhlIHN0ZXBzIGJlbG93IHRvIGVuYWJsZSBhbmQgdXNlIHRoZSBkaXJlY3RpdmU6XG4gKiAxLiBJbXBvcnQgaXQgaW50byB0aGUgbmVjZXNzYXJ5IE5nTW9kdWxlIG9yIGEgc3RhbmRhbG9uZSBDb21wb25lbnQuXG4gKiAyLiBPcHRpb25hbGx5IHByb3ZpZGUgYW4gYEltYWdlTG9hZGVyYCBpZiB5b3UgdXNlIGFuIGltYWdlIGhvc3Rpbmcgc2VydmljZS5cbiAqIDMuIFVwZGF0ZSB0aGUgbmVjZXNzYXJ5IGA8aW1nPmAgdGFncyBpbiB0ZW1wbGF0ZXMgYW5kIHJlcGxhY2UgYHNyY2AgYXR0cmlidXRlcyB3aXRoIGBuZ1NyY2AuXG4gKiBVc2luZyBhIGBuZ1NyY2AgYWxsb3dzIHRoZSBkaXJlY3RpdmUgdG8gY29udHJvbCB3aGVuIHRoZSBgc3JjYCBnZXRzIHNldCwgd2hpY2ggdHJpZ2dlcnMgYW4gaW1hZ2VcbiAqIGRvd25sb2FkLlxuICpcbiAqIFN0ZXAgMTogaW1wb3J0IHRoZSBgTmdPcHRpbWl6ZWRJbWFnZWAgZGlyZWN0aXZlLlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGltcG9ydCB7IE5nT3B0aW1pemVkSW1hZ2UgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuICpcbiAqIC8vIEluY2x1ZGUgaXQgaW50byB0aGUgbmVjZXNzYXJ5IE5nTW9kdWxlXG4gKiBATmdNb2R1bGUoe1xuICogICBpbXBvcnRzOiBbTmdPcHRpbWl6ZWRJbWFnZV0sXG4gKiB9KVxuICogY2xhc3MgQXBwTW9kdWxlIHt9XG4gKlxuICogLy8gLi4uIG9yIGEgc3RhbmRhbG9uZSBDb21wb25lbnRcbiAqIEBDb21wb25lbnQoe1xuICogICBzdGFuZGFsb25lOiB0cnVlXG4gKiAgIGltcG9ydHM6IFtOZ09wdGltaXplZEltYWdlXSxcbiAqIH0pXG4gKiBjbGFzcyBNeVN0YW5kYWxvbmVDb21wb25lbnQge31cbiAqIGBgYFxuICpcbiAqIFN0ZXAgMjogY29uZmlndXJlIGEgbG9hZGVyLlxuICpcbiAqIFRvIHVzZSB0aGUgKipkZWZhdWx0IGxvYWRlcioqOiBubyBhZGRpdGlvbmFsIGNvZGUgY2hhbmdlcyBhcmUgbmVjZXNzYXJ5LiBUaGUgVVJMIHJldHVybmVkIGJ5IHRoZVxuICogZ2VuZXJpYyBsb2FkZXIgd2lsbCBhbHdheXMgbWF0Y2ggdGhlIHZhbHVlIG9mIFwic3JjXCIuIEluIG90aGVyIHdvcmRzLCB0aGlzIGxvYWRlciBhcHBsaWVzIG5vXG4gKiB0cmFuc2Zvcm1hdGlvbnMgdG8gdGhlIHJlc291cmNlIFVSTCBhbmQgdGhlIHZhbHVlIG9mIHRoZSBgbmdTcmNgIGF0dHJpYnV0ZSB3aWxsIGJlIHVzZWQgYXMgaXMuXG4gKlxuICogVG8gdXNlIGFuIGV4aXN0aW5nIGxvYWRlciBmb3IgYSAqKnRoaXJkLXBhcnR5IGltYWdlIHNlcnZpY2UqKjogYWRkIHRoZSBwcm92aWRlciBmYWN0b3J5IGZvciB5b3VyXG4gKiBjaG9zZW4gc2VydmljZSB0byB0aGUgYHByb3ZpZGVyc2AgYXJyYXkuIEluIHRoZSBleGFtcGxlIGJlbG93LCB0aGUgSW1naXggbG9hZGVyIGlzIHVzZWQ6XG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogaW1wb3J0IHtwcm92aWRlSW1naXhMb2FkZXJ9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG4gKlxuICogLy8gQ2FsbCB0aGUgZnVuY3Rpb24gYW5kIGFkZCB0aGUgcmVzdWx0IHRvIHRoZSBgcHJvdmlkZXJzYCBhcnJheTpcbiAqIHByb3ZpZGVyczogW1xuICogICBwcm92aWRlSW1naXhMb2FkZXIoXCJodHRwczovL215LmJhc2UudXJsL1wiKSxcbiAqIF0sXG4gKiBgYGBcbiAqXG4gKiBUaGUgYE5nT3B0aW1pemVkSW1hZ2VgIGRpcmVjdGl2ZSBwcm92aWRlcyB0aGUgZm9sbG93aW5nIGZ1bmN0aW9uczpcbiAqIC0gYHByb3ZpZGVDbG91ZGZsYXJlTG9hZGVyYFxuICogLSBgcHJvdmlkZUNsb3VkaW5hcnlMb2FkZXJgXG4gKiAtIGBwcm92aWRlSW1hZ2VLaXRMb2FkZXJgXG4gKiAtIGBwcm92aWRlSW1naXhMb2FkZXJgXG4gKlxuICogSWYgeW91IHVzZSBhIGRpZmZlcmVudCBpbWFnZSBwcm92aWRlciwgeW91IGNhbiBjcmVhdGUgYSBjdXN0b20gbG9hZGVyIGZ1bmN0aW9uIGFzIGRlc2NyaWJlZFxuICogYmVsb3cuXG4gKlxuICogVG8gdXNlIGEgKipjdXN0b20gbG9hZGVyKio6IHByb3ZpZGUgeW91ciBsb2FkZXIgZnVuY3Rpb24gYXMgYSB2YWx1ZSBmb3IgdGhlIGBJTUFHRV9MT0FERVJgIERJXG4gKiB0b2tlbi5cbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBpbXBvcnQge0lNQUdFX0xPQURFUiwgSW1hZ2VMb2FkZXJDb25maWd9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG4gKlxuICogLy8gQ29uZmlndXJlIHRoZSBsb2FkZXIgdXNpbmcgdGhlIGBJTUFHRV9MT0FERVJgIHRva2VuLlxuICogcHJvdmlkZXJzOiBbXG4gKiAgIHtcbiAqICAgICAgcHJvdmlkZTogSU1BR0VfTE9BREVSLFxuICogICAgICB1c2VWYWx1ZTogKGNvbmZpZzogSW1hZ2VMb2FkZXJDb25maWcpID0+IHtcbiAqICAgICAgICByZXR1cm4gYGh0dHBzOi8vZXhhbXBsZS5jb20vJHtjb25maWcuc3JjfS0ke2NvbmZpZy53aWR0aH0uanBnfWA7XG4gKiAgICAgIH1cbiAqICAgfSxcbiAqIF0sXG4gKiBgYGBcbiAqXG4gKiBTdGVwIDM6IHVwZGF0ZSBgPGltZz5gIHRhZ3MgaW4gdGVtcGxhdGVzIHRvIHVzZSBgbmdTcmNgIGluc3RlYWQgb2YgYHNyY2AuXG4gKlxuICogYGBgXG4gKiA8aW1nIG5nU3JjPVwibG9nby5wbmdcIiB3aWR0aD1cIjIwMFwiIGhlaWdodD1cIjEwMFwiPlxuICogYGBgXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5ARGlyZWN0aXZlKHtcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbiAgc2VsZWN0b3I6ICdpbWdbbmdTcmNdJyxcbiAgaG9zdDoge1xuICAgICdbc3R5bGUucG9zaXRpb25dJzogJ2ZpbGwgPyBcImFic29sdXRlXCIgOiBudWxsJyxcbiAgICAnW3N0eWxlLndpZHRoXSc6ICdmaWxsID8gXCIxMDAlXCIgOiBudWxsJyxcbiAgICAnW3N0eWxlLmhlaWdodF0nOiAnZmlsbCA/IFwiMTAwJVwiIDogbnVsbCcsXG4gICAgJ1tzdHlsZS5pbnNldF0nOiAnZmlsbCA/IFwiMFwiIDogbnVsbCcsXG4gICAgJ1tzdHlsZS5iYWNrZ3JvdW5kLXNpemVdJzogJ3BsYWNlaG9sZGVyID8gXCJjb3ZlclwiIDogbnVsbCcsXG4gICAgJ1tzdHlsZS5iYWNrZ3JvdW5kLXBvc2l0aW9uXSc6ICdwbGFjZWhvbGRlciA/IFwiNTAlIDUwJVwiIDogbnVsbCcsXG4gICAgJ1tzdHlsZS5iYWNrZ3JvdW5kLXJlcGVhdF0nOiAncGxhY2Vob2xkZXIgPyBcIm5vLXJlcGVhdFwiIDogbnVsbCcsXG4gICAgJ1tzdHlsZS5iYWNrZ3JvdW5kLWltYWdlXSc6ICdwbGFjZWhvbGRlciA/IGdlbmVyYXRlUGxhY2Vob2xkZXIocGxhY2Vob2xkZXIpIDogbnVsbCcsXG4gICAgJ1tzdHlsZS5maWx0ZXJdJzogYHBsYWNlaG9sZGVyICYmIHNob3VsZEJsdXJQbGFjZWhvbGRlcihwbGFjZWhvbGRlckNvbmZpZykgPyBcImJsdXIoJHtQTEFDRUhPTERFUl9CTFVSX0FNT1VOVH1weClcIiA6IG51bGxgLFxuICB9LFxufSlcbmV4cG9ydCBjbGFzcyBOZ09wdGltaXplZEltYWdlIGltcGxlbWVudHMgT25Jbml0LCBPbkNoYW5nZXMsIE9uRGVzdHJveSB7XG4gIHByaXZhdGUgaW1hZ2VMb2FkZXIgPSBpbmplY3QoSU1BR0VfTE9BREVSKTtcbiAgcHJpdmF0ZSBjb25maWc6IEltYWdlQ29uZmlnID0gcHJvY2Vzc0NvbmZpZyhpbmplY3QoSU1BR0VfQ09ORklHKSk7XG4gIHByaXZhdGUgcmVuZGVyZXIgPSBpbmplY3QoUmVuZGVyZXIyKTtcbiAgcHJpdmF0ZSBpbWdFbGVtZW50OiBIVE1MSW1hZ2VFbGVtZW50ID0gaW5qZWN0KEVsZW1lbnRSZWYpLm5hdGl2ZUVsZW1lbnQ7XG4gIHByaXZhdGUgaW5qZWN0b3IgPSBpbmplY3QoSW5qZWN0b3IpO1xuICBwcml2YXRlIHJlYWRvbmx5IGlzU2VydmVyID0gaXNQbGF0Zm9ybVNlcnZlcihpbmplY3QoUExBVEZPUk1fSUQpKTtcbiAgcHJpdmF0ZSByZWFkb25seSBwcmVsb2FkTGlua0NyZWF0b3IgPSBpbmplY3QoUHJlbG9hZExpbmtDcmVhdG9yKTtcblxuICAvLyBhIExDUCBpbWFnZSBvYnNlcnZlciAtIHNob3VsZCBiZSBpbmplY3RlZCBvbmx5IGluIHRoZSBkZXYgbW9kZVxuICBwcml2YXRlIGxjcE9ic2VydmVyID0gbmdEZXZNb2RlID8gdGhpcy5pbmplY3Rvci5nZXQoTENQSW1hZ2VPYnNlcnZlcikgOiBudWxsO1xuXG4gIC8qKlxuICAgKiBDYWxjdWxhdGUgdGhlIHJld3JpdHRlbiBgc3JjYCBvbmNlIGFuZCBzdG9yZSBpdC5cbiAgICogVGhpcyBpcyBuZWVkZWQgdG8gYXZvaWQgcmVwZXRpdGl2ZSBjYWxjdWxhdGlvbnMgYW5kIG1ha2Ugc3VyZSB0aGUgZGlyZWN0aXZlIGNsZWFudXAgaW4gdGhlXG4gICAqIGBuZ09uRGVzdHJveWAgZG9lcyBub3QgcmVseSBvbiB0aGUgYElNQUdFX0xPQURFUmAgbG9naWMgKHdoaWNoIGluIHR1cm4gY2FuIHJlbHkgb24gc29tZSBvdGhlclxuICAgKiBpbnN0YW5jZSB0aGF0IG1pZ2h0IGJlIGFscmVhZHkgZGVzdHJveWVkKS5cbiAgICovXG4gIHByaXZhdGUgX3JlbmRlcmVkU3JjOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcblxuICAvKipcbiAgICogTmFtZSBvZiB0aGUgc291cmNlIGltYWdlLlxuICAgKiBJbWFnZSBuYW1lIHdpbGwgYmUgcHJvY2Vzc2VkIGJ5IHRoZSBpbWFnZSBsb2FkZXIgYW5kIHRoZSBmaW5hbCBVUkwgd2lsbCBiZSBhcHBsaWVkIGFzIHRoZSBgc3JjYFxuICAgKiBwcm9wZXJ0eSBvZiB0aGUgaW1hZ2UuXG4gICAqL1xuICBASW5wdXQoe3JlcXVpcmVkOiB0cnVlLCB0cmFuc2Zvcm06IHVud3JhcFNhZmVVcmx9KSBuZ1NyYyE6IHN0cmluZztcblxuICAvKipcbiAgICogQSBjb21tYSBzZXBhcmF0ZWQgbGlzdCBvZiB3aWR0aCBvciBkZW5zaXR5IGRlc2NyaXB0b3JzLlxuICAgKiBUaGUgaW1hZ2UgbmFtZSB3aWxsIGJlIHRha2VuIGZyb20gYG5nU3JjYCBhbmQgY29tYmluZWQgd2l0aCB0aGUgbGlzdCBvZiB3aWR0aCBvciBkZW5zaXR5XG4gICAqIGRlc2NyaXB0b3JzIHRvIGdlbmVyYXRlIHRoZSBmaW5hbCBgc3Jjc2V0YCBwcm9wZXJ0eSBvZiB0aGUgaW1hZ2UuXG4gICAqXG4gICAqIEV4YW1wbGU6XG4gICAqIGBgYFxuICAgKiA8aW1nIG5nU3JjPVwiaGVsbG8uanBnXCIgbmdTcmNzZXQ9XCIxMDB3LCAyMDB3XCIgLz4gID0+XG4gICAqIDxpbWcgc3JjPVwicGF0aC9oZWxsby5qcGdcIiBzcmNzZXQ9XCJwYXRoL2hlbGxvLmpwZz93PTEwMCAxMDB3LCBwYXRoL2hlbGxvLmpwZz93PTIwMCAyMDB3XCIgLz5cbiAgICogYGBgXG4gICAqL1xuICBASW5wdXQoKSBuZ1NyY3NldCE6IHN0cmluZztcblxuICAvKipcbiAgICogVGhlIGJhc2UgYHNpemVzYCBhdHRyaWJ1dGUgcGFzc2VkIHRocm91Z2ggdG8gdGhlIGA8aW1nPmAgZWxlbWVudC5cbiAgICogUHJvdmlkaW5nIHNpemVzIGNhdXNlcyB0aGUgaW1hZ2UgdG8gY3JlYXRlIGFuIGF1dG9tYXRpYyByZXNwb25zaXZlIHNyY3NldC5cbiAgICovXG4gIEBJbnB1dCgpIHNpemVzPzogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBGb3IgcmVzcG9uc2l2ZSBpbWFnZXM6IHRoZSBpbnRyaW5zaWMgd2lkdGggb2YgdGhlIGltYWdlIGluIHBpeGVscy5cbiAgICogRm9yIGZpeGVkIHNpemUgaW1hZ2VzOiB0aGUgZGVzaXJlZCByZW5kZXJlZCB3aWR0aCBvZiB0aGUgaW1hZ2UgaW4gcGl4ZWxzLlxuICAgKi9cbiAgQElucHV0KHt0cmFuc2Zvcm06IG51bWJlckF0dHJpYnV0ZX0pIHdpZHRoOiBudW1iZXIgfCB1bmRlZmluZWQ7XG5cbiAgLyoqXG4gICAqIEZvciByZXNwb25zaXZlIGltYWdlczogdGhlIGludHJpbnNpYyBoZWlnaHQgb2YgdGhlIGltYWdlIGluIHBpeGVscy5cbiAgICogRm9yIGZpeGVkIHNpemUgaW1hZ2VzOiB0aGUgZGVzaXJlZCByZW5kZXJlZCBoZWlnaHQgb2YgdGhlIGltYWdlIGluIHBpeGVscy5cbiAgICovXG4gIEBJbnB1dCh7dHJhbnNmb3JtOiBudW1iZXJBdHRyaWJ1dGV9KSBoZWlnaHQ6IG51bWJlciB8IHVuZGVmaW5lZDtcblxuICAvKipcbiAgICogVGhlIGRlc2lyZWQgbG9hZGluZyBiZWhhdmlvciAobGF6eSwgZWFnZXIsIG9yIGF1dG8pLiBEZWZhdWx0cyB0byBgbGF6eWAsXG4gICAqIHdoaWNoIGlzIHJlY29tbWVuZGVkIGZvciBtb3N0IGltYWdlcy5cbiAgICpcbiAgICogV2FybmluZzogU2V0dGluZyBpbWFnZXMgYXMgbG9hZGluZz1cImVhZ2VyXCIgb3IgbG9hZGluZz1cImF1dG9cIiBtYXJrcyB0aGVtXG4gICAqIGFzIG5vbi1wcmlvcml0eSBpbWFnZXMgYW5kIGNhbiBodXJ0IGxvYWRpbmcgcGVyZm9ybWFuY2UuIEZvciBpbWFnZXMgd2hpY2hcbiAgICogbWF5IGJlIHRoZSBMQ1AgZWxlbWVudCwgdXNlIHRoZSBgcHJpb3JpdHlgIGF0dHJpYnV0ZSBpbnN0ZWFkIG9mIGBsb2FkaW5nYC5cbiAgICovXG4gIEBJbnB1dCgpIGxvYWRpbmc/OiAnbGF6eScgfCAnZWFnZXInIHwgJ2F1dG8nO1xuXG4gIC8qKlxuICAgKiBJbmRpY2F0ZXMgd2hldGhlciB0aGlzIGltYWdlIHNob3VsZCBoYXZlIGEgaGlnaCBwcmlvcml0eS5cbiAgICovXG4gIEBJbnB1dCh7dHJhbnNmb3JtOiBib29sZWFuQXR0cmlidXRlfSkgcHJpb3JpdHkgPSBmYWxzZTtcblxuICAvKipcbiAgICogRGF0YSB0byBwYXNzIHRocm91Z2ggdG8gY3VzdG9tIGxvYWRlcnMuXG4gICAqL1xuICBASW5wdXQoKSBsb2FkZXJQYXJhbXM/OiB7W2tleTogc3RyaW5nXTogYW55fTtcblxuICAvKipcbiAgICogRGlzYWJsZXMgYXV0b21hdGljIHNyY3NldCBnZW5lcmF0aW9uIGZvciB0aGlzIGltYWdlLlxuICAgKi9cbiAgQElucHV0KHt0cmFuc2Zvcm06IGJvb2xlYW5BdHRyaWJ1dGV9KSBkaXNhYmxlT3B0aW1pemVkU3Jjc2V0ID0gZmFsc2U7XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGltYWdlIHRvIFwiZmlsbCBtb2RlXCIsIHdoaWNoIGVsaW1pbmF0ZXMgdGhlIGhlaWdodC93aWR0aCByZXF1aXJlbWVudCBhbmQgYWRkc1xuICAgKiBzdHlsZXMgc3VjaCB0aGF0IHRoZSBpbWFnZSBmaWxscyBpdHMgY29udGFpbmluZyBlbGVtZW50LlxuICAgKi9cbiAgQElucHV0KHt0cmFuc2Zvcm06IGJvb2xlYW5BdHRyaWJ1dGV9KSBmaWxsID0gZmFsc2U7XG5cbiAgLyoqXG4gICAqIEEgVVJMIG9yIGRhdGEgVVJMIGZvciBhbiBpbWFnZSB0byBiZSB1c2VkIGFzIGEgcGxhY2Vob2xkZXIgd2hpbGUgdGhpcyBpbWFnZSBsb2Fkcy5cbiAgICovXG4gIEBJbnB1dCh7dHJhbnNmb3JtOiBib29sZWFuT3JVcmxBdHRyaWJ1dGV9KSBwbGFjZWhvbGRlcj86IHN0cmluZyB8IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIENvbmZpZ3VyYXRpb24gb2JqZWN0IGZvciBwbGFjZWhvbGRlciBzZXR0aW5ncy4gT3B0aW9uczpcbiAgICogICAqIGJsdXI6IFNldHRpbmcgdGhpcyB0byBmYWxzZSBkaXNhYmxlcyB0aGUgYXV0b21hdGljIENTUyBibHVyLlxuICAgKi9cbiAgQElucHV0KCkgcGxhY2Vob2xkZXJDb25maWc/OiBJbWFnZVBsYWNlaG9sZGVyQ29uZmlnO1xuXG4gIC8qKlxuICAgKiBWYWx1ZSBvZiB0aGUgYHNyY2AgYXR0cmlidXRlIGlmIHNldCBvbiB0aGUgaG9zdCBgPGltZz5gIGVsZW1lbnQuXG4gICAqIFRoaXMgaW5wdXQgaXMgZXhjbHVzaXZlbHkgcmVhZCB0byBhc3NlcnQgdGhhdCBgc3JjYCBpcyBub3Qgc2V0IGluIGNvbmZsaWN0XG4gICAqIHdpdGggYG5nU3JjYCBhbmQgdGhhdCBpbWFnZXMgZG9uJ3Qgc3RhcnQgdG8gbG9hZCB1bnRpbCBhIGxhenkgbG9hZGluZyBzdHJhdGVneSBpcyBzZXQuXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgQElucHV0KCkgc3JjPzogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBWYWx1ZSBvZiB0aGUgYHNyY3NldGAgYXR0cmlidXRlIGlmIHNldCBvbiB0aGUgaG9zdCBgPGltZz5gIGVsZW1lbnQuXG4gICAqIFRoaXMgaW5wdXQgaXMgZXhjbHVzaXZlbHkgcmVhZCB0byBhc3NlcnQgdGhhdCBgc3Jjc2V0YCBpcyBub3Qgc2V0IGluIGNvbmZsaWN0XG4gICAqIHdpdGggYG5nU3Jjc2V0YCBhbmQgdGhhdCBpbWFnZXMgZG9uJ3Qgc3RhcnQgdG8gbG9hZCB1bnRpbCBhIGxhenkgbG9hZGluZyBzdHJhdGVneSBpcyBzZXQuXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgQElucHV0KCkgc3Jjc2V0Pzogc3RyaW5nO1xuXG4gIC8qKiBAbm9kb2MgKi9cbiAgbmdPbkluaXQoKSB7XG4gICAgcGVyZm9ybWFuY2VNYXJrRmVhdHVyZSgnTmdPcHRpbWl6ZWRJbWFnZScpO1xuXG4gICAgaWYgKG5nRGV2TW9kZSkge1xuICAgICAgY29uc3Qgbmdab25lID0gdGhpcy5pbmplY3Rvci5nZXQoTmdab25lKTtcbiAgICAgIGFzc2VydE5vbkVtcHR5SW5wdXQodGhpcywgJ25nU3JjJywgdGhpcy5uZ1NyYyk7XG4gICAgICBhc3NlcnRWYWxpZE5nU3Jjc2V0KHRoaXMsIHRoaXMubmdTcmNzZXQpO1xuICAgICAgYXNzZXJ0Tm9Db25mbGljdGluZ1NyYyh0aGlzKTtcbiAgICAgIGlmICh0aGlzLm5nU3Jjc2V0KSB7XG4gICAgICAgIGFzc2VydE5vQ29uZmxpY3RpbmdTcmNzZXQodGhpcyk7XG4gICAgICB9XG4gICAgICBhc3NlcnROb3RCYXNlNjRJbWFnZSh0aGlzKTtcbiAgICAgIGFzc2VydE5vdEJsb2JVcmwodGhpcyk7XG4gICAgICBpZiAodGhpcy5maWxsKSB7XG4gICAgICAgIGFzc2VydEVtcHR5V2lkdGhBbmRIZWlnaHQodGhpcyk7XG4gICAgICAgIC8vIFRoaXMgbGVhdmVzIHRoZSBBbmd1bGFyIHpvbmUgdG8gYXZvaWQgdHJpZ2dlcmluZyB1bm5lY2Vzc2FyeSBjaGFuZ2UgZGV0ZWN0aW9uIGN5Y2xlcyB3aGVuXG4gICAgICAgIC8vIGBsb2FkYCB0YXNrcyBhcmUgaW52b2tlZCBvbiBpbWFnZXMuXG4gICAgICAgIG5nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PlxuICAgICAgICAgIGFzc2VydE5vblplcm9SZW5kZXJlZEhlaWdodCh0aGlzLCB0aGlzLmltZ0VsZW1lbnQsIHRoaXMucmVuZGVyZXIpLFxuICAgICAgICApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYXNzZXJ0Tm9uRW1wdHlXaWR0aEFuZEhlaWdodCh0aGlzKTtcbiAgICAgICAgaWYgKHRoaXMuaGVpZ2h0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBhc3NlcnRHcmVhdGVyVGhhblplcm8odGhpcywgdGhpcy5oZWlnaHQsICdoZWlnaHQnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy53aWR0aCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgYXNzZXJ0R3JlYXRlclRoYW5aZXJvKHRoaXMsIHRoaXMud2lkdGgsICd3aWR0aCcpO1xuICAgICAgICB9XG4gICAgICAgIC8vIE9ubHkgY2hlY2sgZm9yIGRpc3RvcnRlZCBpbWFnZXMgd2hlbiBub3QgaW4gZmlsbCBtb2RlLCB3aGVyZVxuICAgICAgICAvLyBpbWFnZXMgbWF5IGJlIGludGVudGlvbmFsbHkgc3RyZXRjaGVkLCBjcm9wcGVkIG9yIGxldHRlcmJveGVkLlxuICAgICAgICBuZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT5cbiAgICAgICAgICBhc3NlcnROb0ltYWdlRGlzdG9ydGlvbih0aGlzLCB0aGlzLmltZ0VsZW1lbnQsIHRoaXMucmVuZGVyZXIpLFxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgYXNzZXJ0VmFsaWRMb2FkaW5nSW5wdXQodGhpcyk7XG4gICAgICBpZiAoIXRoaXMubmdTcmNzZXQpIHtcbiAgICAgICAgYXNzZXJ0Tm9Db21wbGV4U2l6ZXModGhpcyk7XG4gICAgICB9XG4gICAgICBhc3NlcnRWYWxpZFBsYWNlaG9sZGVyKHRoaXMsIHRoaXMuaW1hZ2VMb2FkZXIpO1xuICAgICAgYXNzZXJ0Tm90TWlzc2luZ0J1aWx0SW5Mb2FkZXIodGhpcy5uZ1NyYywgdGhpcy5pbWFnZUxvYWRlcik7XG4gICAgICBhc3NlcnROb05nU3Jjc2V0V2l0aG91dExvYWRlcih0aGlzLCB0aGlzLmltYWdlTG9hZGVyKTtcbiAgICAgIGFzc2VydE5vTG9hZGVyUGFyYW1zV2l0aG91dExvYWRlcih0aGlzLCB0aGlzLmltYWdlTG9hZGVyKTtcblxuICAgICAgaWYgKHRoaXMubGNwT2JzZXJ2ZXIgIT09IG51bGwpIHtcbiAgICAgICAgY29uc3Qgbmdab25lID0gdGhpcy5pbmplY3Rvci5nZXQoTmdab25lKTtcbiAgICAgICAgbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgICAgICB0aGlzLmxjcE9ic2VydmVyIS5yZWdpc3RlckltYWdlKHRoaXMuZ2V0UmV3cml0dGVuU3JjKCksIHRoaXMubmdTcmMsIHRoaXMucHJpb3JpdHkpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMucHJpb3JpdHkpIHtcbiAgICAgICAgY29uc3QgY2hlY2tlciA9IHRoaXMuaW5qZWN0b3IuZ2V0KFByZWNvbm5lY3RMaW5rQ2hlY2tlcik7XG4gICAgICAgIGNoZWNrZXIuYXNzZXJ0UHJlY29ubmVjdCh0aGlzLmdldFJld3JpdHRlblNyYygpLCB0aGlzLm5nU3JjKTtcblxuICAgICAgICBpZiAoIXRoaXMuaXNTZXJ2ZXIpIHtcbiAgICAgICAgICBjb25zdCBhcHBsaWNhdGlvblJlZiA9IHRoaXMuaW5qZWN0b3IuZ2V0KEFwcGxpY2F0aW9uUmVmKTtcbiAgICAgICAgICBhc3NldFByaW9yaXR5Q291bnRCZWxvd1RocmVzaG9sZChhcHBsaWNhdGlvblJlZik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHRoaXMucGxhY2Vob2xkZXIpIHtcbiAgICAgIHRoaXMucmVtb3ZlUGxhY2Vob2xkZXJPbkxvYWQodGhpcy5pbWdFbGVtZW50KTtcbiAgICB9XG4gICAgdGhpcy5zZXRIb3N0QXR0cmlidXRlcygpO1xuICB9XG5cbiAgcHJpdmF0ZSBzZXRIb3N0QXR0cmlidXRlcygpIHtcbiAgICAvLyBNdXN0IHNldCB3aWR0aC9oZWlnaHQgZXhwbGljaXRseSBpbiBjYXNlIHRoZXkgYXJlIGJvdW5kIChpbiB3aGljaCBjYXNlIHRoZXkgd2lsbFxuICAgIC8vIG9ubHkgYmUgcmVmbGVjdGVkIGFuZCBub3QgZm91bmQgYnkgdGhlIGJyb3dzZXIpXG4gICAgaWYgKHRoaXMuZmlsbCkge1xuICAgICAgdGhpcy5zaXplcyB8fD0gJzEwMHZ3JztcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zZXRIb3N0QXR0cmlidXRlKCd3aWR0aCcsIHRoaXMud2lkdGghLnRvU3RyaW5nKCkpO1xuICAgICAgdGhpcy5zZXRIb3N0QXR0cmlidXRlKCdoZWlnaHQnLCB0aGlzLmhlaWdodCEudG9TdHJpbmcoKSk7XG4gICAgfVxuXG4gICAgdGhpcy5zZXRIb3N0QXR0cmlidXRlKCdsb2FkaW5nJywgdGhpcy5nZXRMb2FkaW5nQmVoYXZpb3IoKSk7XG4gICAgdGhpcy5zZXRIb3N0QXR0cmlidXRlKCdmZXRjaHByaW9yaXR5JywgdGhpcy5nZXRGZXRjaFByaW9yaXR5KCkpO1xuXG4gICAgLy8gVGhlIGBkYXRhLW5nLWltZ2AgYXR0cmlidXRlIGZsYWdzIGFuIGltYWdlIGFzIHVzaW5nIHRoZSBkaXJlY3RpdmUsIHRvIGFsbG93XG4gICAgLy8gZm9yIGFuYWx5c2lzIG9mIHRoZSBkaXJlY3RpdmUncyBwZXJmb3JtYW5jZS5cbiAgICB0aGlzLnNldEhvc3RBdHRyaWJ1dGUoJ25nLWltZycsICd0cnVlJyk7XG5cbiAgICAvLyBUaGUgYHNyY2AgYW5kIGBzcmNzZXRgIGF0dHJpYnV0ZXMgc2hvdWxkIGJlIHNldCBsYXN0IHNpbmNlIG90aGVyIGF0dHJpYnV0ZXNcbiAgICAvLyBjb3VsZCBhZmZlY3QgdGhlIGltYWdlJ3MgbG9hZGluZyBiZWhhdmlvci5cbiAgICBjb25zdCByZXdyaXR0ZW5TcmNzZXQgPSB0aGlzLnVwZGF0ZVNyY0FuZFNyY3NldCgpO1xuXG4gICAgaWYgKHRoaXMuc2l6ZXMpIHtcbiAgICAgIHRoaXMuc2V0SG9zdEF0dHJpYnV0ZSgnc2l6ZXMnLCB0aGlzLnNpemVzKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNTZXJ2ZXIgJiYgdGhpcy5wcmlvcml0eSkge1xuICAgICAgdGhpcy5wcmVsb2FkTGlua0NyZWF0b3IuY3JlYXRlUHJlbG9hZExpbmtUYWcoXG4gICAgICAgIHRoaXMucmVuZGVyZXIsXG4gICAgICAgIHRoaXMuZ2V0UmV3cml0dGVuU3JjKCksXG4gICAgICAgIHJld3JpdHRlblNyY3NldCxcbiAgICAgICAgdGhpcy5zaXplcyxcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBub2RvYyAqL1xuICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKSB7XG4gICAgaWYgKG5nRGV2TW9kZSkge1xuICAgICAgYXNzZXJ0Tm9Qb3N0SW5pdElucHV0Q2hhbmdlKHRoaXMsIGNoYW5nZXMsIFtcbiAgICAgICAgJ25nU3Jjc2V0JyxcbiAgICAgICAgJ3dpZHRoJyxcbiAgICAgICAgJ2hlaWdodCcsXG4gICAgICAgICdwcmlvcml0eScsXG4gICAgICAgICdmaWxsJyxcbiAgICAgICAgJ2xvYWRpbmcnLFxuICAgICAgICAnc2l6ZXMnLFxuICAgICAgICAnbG9hZGVyUGFyYW1zJyxcbiAgICAgICAgJ2Rpc2FibGVPcHRpbWl6ZWRTcmNzZXQnLFxuICAgICAgXSk7XG4gICAgfVxuICAgIGlmIChjaGFuZ2VzWyduZ1NyYyddICYmICFjaGFuZ2VzWyduZ1NyYyddLmlzRmlyc3RDaGFuZ2UoKSkge1xuICAgICAgY29uc3Qgb2xkU3JjID0gdGhpcy5fcmVuZGVyZWRTcmM7XG4gICAgICB0aGlzLnVwZGF0ZVNyY0FuZFNyY3NldCh0cnVlKTtcbiAgICAgIGNvbnN0IG5ld1NyYyA9IHRoaXMuX3JlbmRlcmVkU3JjO1xuICAgICAgaWYgKHRoaXMubGNwT2JzZXJ2ZXIgIT09IG51bGwgJiYgb2xkU3JjICYmIG5ld1NyYyAmJiBvbGRTcmMgIT09IG5ld1NyYykge1xuICAgICAgICBjb25zdCBuZ1pvbmUgPSB0aGlzLmluamVjdG9yLmdldChOZ1pvbmUpO1xuICAgICAgICBuZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgICAgIHRoaXMubGNwT2JzZXJ2ZXI/LnVwZGF0ZUltYWdlKG9sZFNyYywgbmV3U3JjKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKG5nRGV2TW9kZSAmJiBjaGFuZ2VzWydwbGFjZWhvbGRlciddPy5jdXJyZW50VmFsdWUgJiYgIXRoaXMuaXNTZXJ2ZXIpIHtcbiAgICAgIGFzc2VydFBsYWNlaG9sZGVyRGltZW5zaW9ucyh0aGlzLCB0aGlzLmltZ0VsZW1lbnQpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgY2FsbEltYWdlTG9hZGVyKFxuICAgIGNvbmZpZ1dpdGhvdXRDdXN0b21QYXJhbXM6IE9taXQ8SW1hZ2VMb2FkZXJDb25maWcsICdsb2FkZXJQYXJhbXMnPixcbiAgKTogc3RyaW5nIHtcbiAgICBsZXQgYXVnbWVudGVkQ29uZmlnOiBJbWFnZUxvYWRlckNvbmZpZyA9IGNvbmZpZ1dpdGhvdXRDdXN0b21QYXJhbXM7XG4gICAgaWYgKHRoaXMubG9hZGVyUGFyYW1zKSB7XG4gICAgICBhdWdtZW50ZWRDb25maWcubG9hZGVyUGFyYW1zID0gdGhpcy5sb2FkZXJQYXJhbXM7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmltYWdlTG9hZGVyKGF1Z21lbnRlZENvbmZpZyk7XG4gIH1cblxuICBwcml2YXRlIGdldExvYWRpbmdCZWhhdmlvcigpOiBzdHJpbmcge1xuICAgIGlmICghdGhpcy5wcmlvcml0eSAmJiB0aGlzLmxvYWRpbmcgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIHRoaXMubG9hZGluZztcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMucHJpb3JpdHkgPyAnZWFnZXInIDogJ2xhenknO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRGZXRjaFByaW9yaXR5KCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMucHJpb3JpdHkgPyAnaGlnaCcgOiAnYXV0byc7XG4gIH1cblxuICBwcml2YXRlIGdldFJld3JpdHRlblNyYygpOiBzdHJpbmcge1xuICAgIC8vIEltYWdlTG9hZGVyQ29uZmlnIHN1cHBvcnRzIHNldHRpbmcgYSB3aWR0aCBwcm9wZXJ0eS4gSG93ZXZlciwgd2UncmUgbm90IHNldHRpbmcgd2lkdGggaGVyZVxuICAgIC8vIGJlY2F1c2UgaWYgdGhlIGRldmVsb3BlciB1c2VzIHJlbmRlcmVkIHdpZHRoIGluc3RlYWQgb2YgaW50cmluc2ljIHdpZHRoIGluIHRoZSBIVE1MIHdpZHRoXG4gICAgLy8gYXR0cmlidXRlLCB0aGUgaW1hZ2UgcmVxdWVzdGVkIG1heSBiZSB0b28gc21hbGwgZm9yIDJ4KyBzY3JlZW5zLlxuICAgIGlmICghdGhpcy5fcmVuZGVyZWRTcmMpIHtcbiAgICAgIGNvbnN0IGltZ0NvbmZpZyA9IHtzcmM6IHRoaXMubmdTcmN9O1xuICAgICAgLy8gQ2FjaGUgY2FsY3VsYXRlZCBpbWFnZSBzcmMgdG8gcmV1c2UgaXQgbGF0ZXIgaW4gdGhlIGNvZGUuXG4gICAgICB0aGlzLl9yZW5kZXJlZFNyYyA9IHRoaXMuY2FsbEltYWdlTG9hZGVyKGltZ0NvbmZpZyk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9yZW5kZXJlZFNyYztcbiAgfVxuXG4gIHByaXZhdGUgZ2V0UmV3cml0dGVuU3Jjc2V0KCk6IHN0cmluZyB7XG4gICAgY29uc3Qgd2lkdGhTcmNTZXQgPSBWQUxJRF9XSURUSF9ERVNDUklQVE9SX1NSQ1NFVC50ZXN0KHRoaXMubmdTcmNzZXQpO1xuICAgIGNvbnN0IGZpbmFsU3JjcyA9IHRoaXMubmdTcmNzZXRcbiAgICAgIC5zcGxpdCgnLCcpXG4gICAgICAuZmlsdGVyKChzcmMpID0+IHNyYyAhPT0gJycpXG4gICAgICAubWFwKChzcmNTdHIpID0+IHtcbiAgICAgICAgc3JjU3RyID0gc3JjU3RyLnRyaW0oKTtcbiAgICAgICAgY29uc3Qgd2lkdGggPSB3aWR0aFNyY1NldCA/IHBhcnNlRmxvYXQoc3JjU3RyKSA6IHBhcnNlRmxvYXQoc3JjU3RyKSAqIHRoaXMud2lkdGghO1xuICAgICAgICByZXR1cm4gYCR7dGhpcy5jYWxsSW1hZ2VMb2FkZXIoe3NyYzogdGhpcy5uZ1NyYywgd2lkdGh9KX0gJHtzcmNTdHJ9YDtcbiAgICAgIH0pO1xuICAgIHJldHVybiBmaW5hbFNyY3Muam9pbignLCAnKTtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0QXV0b21hdGljU3Jjc2V0KCk6IHN0cmluZyB7XG4gICAgaWYgKHRoaXMuc2l6ZXMpIHtcbiAgICAgIHJldHVybiB0aGlzLmdldFJlc3BvbnNpdmVTcmNzZXQoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0Rml4ZWRTcmNzZXQoKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGdldFJlc3BvbnNpdmVTcmNzZXQoKTogc3RyaW5nIHtcbiAgICBjb25zdCB7YnJlYWtwb2ludHN9ID0gdGhpcy5jb25maWc7XG5cbiAgICBsZXQgZmlsdGVyZWRCcmVha3BvaW50cyA9IGJyZWFrcG9pbnRzITtcbiAgICBpZiAodGhpcy5zaXplcz8udHJpbSgpID09PSAnMTAwdncnKSB7XG4gICAgICAvLyBTaW5jZSB0aGlzIGlzIGEgZnVsbC1zY3JlZW4td2lkdGggaW1hZ2UsIG91ciBzcmNzZXQgb25seSBuZWVkcyB0byBpbmNsdWRlXG4gICAgICAvLyBicmVha3BvaW50cyB3aXRoIGZ1bGwgdmlld3BvcnQgd2lkdGhzLlxuICAgICAgZmlsdGVyZWRCcmVha3BvaW50cyA9IGJyZWFrcG9pbnRzIS5maWx0ZXIoKGJwKSA9PiBicCA+PSBWSUVXUE9SVF9CUkVBS1BPSU5UX0NVVE9GRik7XG4gICAgfVxuXG4gICAgY29uc3QgZmluYWxTcmNzID0gZmlsdGVyZWRCcmVha3BvaW50cy5tYXAoXG4gICAgICAoYnApID0+IGAke3RoaXMuY2FsbEltYWdlTG9hZGVyKHtzcmM6IHRoaXMubmdTcmMsIHdpZHRoOiBicH0pfSAke2JwfXdgLFxuICAgICk7XG4gICAgcmV0dXJuIGZpbmFsU3Jjcy5qb2luKCcsICcpO1xuICB9XG5cbiAgcHJpdmF0ZSB1cGRhdGVTcmNBbmRTcmNzZXQoZm9yY2VTcmNSZWNhbGMgPSBmYWxzZSk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gICAgaWYgKGZvcmNlU3JjUmVjYWxjKSB7XG4gICAgICAvLyBSZXNldCBjYWNoZWQgdmFsdWUsIHNvIHRoYXQgdGhlIGZvbGxvd3VwIGBnZXRSZXdyaXR0ZW5TcmMoKWAgY2FsbFxuICAgICAgLy8gd2lsbCByZWNhbGN1bGF0ZSBpdCBhbmQgdXBkYXRlIHRoZSBjYWNoZS5cbiAgICAgIHRoaXMuX3JlbmRlcmVkU3JjID0gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCByZXdyaXR0ZW5TcmMgPSB0aGlzLmdldFJld3JpdHRlblNyYygpO1xuICAgIHRoaXMuc2V0SG9zdEF0dHJpYnV0ZSgnc3JjJywgcmV3cml0dGVuU3JjKTtcblxuICAgIGxldCByZXdyaXR0ZW5TcmNzZXQ6IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBpZiAodGhpcy5uZ1NyY3NldCkge1xuICAgICAgcmV3cml0dGVuU3Jjc2V0ID0gdGhpcy5nZXRSZXdyaXR0ZW5TcmNzZXQoKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuc2hvdWxkR2VuZXJhdGVBdXRvbWF0aWNTcmNzZXQoKSkge1xuICAgICAgcmV3cml0dGVuU3Jjc2V0ID0gdGhpcy5nZXRBdXRvbWF0aWNTcmNzZXQoKTtcbiAgICB9XG5cbiAgICBpZiAocmV3cml0dGVuU3Jjc2V0KSB7XG4gICAgICB0aGlzLnNldEhvc3RBdHRyaWJ1dGUoJ3NyY3NldCcsIHJld3JpdHRlblNyY3NldCk7XG4gICAgfVxuICAgIHJldHVybiByZXdyaXR0ZW5TcmNzZXQ7XG4gIH1cblxuICBwcml2YXRlIGdldEZpeGVkU3Jjc2V0KCk6IHN0cmluZyB7XG4gICAgY29uc3QgZmluYWxTcmNzID0gREVOU0lUWV9TUkNTRVRfTVVMVElQTElFUlMubWFwKFxuICAgICAgKG11bHRpcGxpZXIpID0+XG4gICAgICAgIGAke3RoaXMuY2FsbEltYWdlTG9hZGVyKHtcbiAgICAgICAgICBzcmM6IHRoaXMubmdTcmMsXG4gICAgICAgICAgd2lkdGg6IHRoaXMud2lkdGghICogbXVsdGlwbGllcixcbiAgICAgICAgfSl9ICR7bXVsdGlwbGllcn14YCxcbiAgICApO1xuICAgIHJldHVybiBmaW5hbFNyY3Muam9pbignLCAnKTtcbiAgfVxuXG4gIHByaXZhdGUgc2hvdWxkR2VuZXJhdGVBdXRvbWF0aWNTcmNzZXQoKTogYm9vbGVhbiB7XG4gICAgbGV0IG92ZXJzaXplZEltYWdlID0gZmFsc2U7XG4gICAgaWYgKCF0aGlzLnNpemVzKSB7XG4gICAgICBvdmVyc2l6ZWRJbWFnZSA9XG4gICAgICAgIHRoaXMud2lkdGghID4gRklYRURfU1JDU0VUX1dJRFRIX0xJTUlUIHx8IHRoaXMuaGVpZ2h0ISA+IEZJWEVEX1NSQ1NFVF9IRUlHSFRfTElNSVQ7XG4gICAgfVxuICAgIHJldHVybiAoXG4gICAgICAhdGhpcy5kaXNhYmxlT3B0aW1pemVkU3Jjc2V0ICYmXG4gICAgICAhdGhpcy5zcmNzZXQgJiZcbiAgICAgIHRoaXMuaW1hZ2VMb2FkZXIgIT09IG5vb3BJbWFnZUxvYWRlciAmJlxuICAgICAgIW92ZXJzaXplZEltYWdlXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIGltYWdlIHVybCBmb3JtYXR0ZWQgZm9yIHVzZSB3aXRoIHRoZSBDU1MgYmFja2dyb3VuZC1pbWFnZSBwcm9wZXJ0eS4gRXhwZWN0cyBvbmUgb2Y6XG4gICAqICogQSBiYXNlNjQgZW5jb2RlZCBpbWFnZSwgd2hpY2ggaXMgd3JhcHBlZCBhbmQgcGFzc2VkIHRocm91Z2guXG4gICAqICogQSBib29sZWFuLiBJZiB0cnVlLCBjYWxscyB0aGUgaW1hZ2UgbG9hZGVyIHRvIGdlbmVyYXRlIGEgc21hbGwgcGxhY2Vob2xkZXIgdXJsLlxuICAgKi9cbiAgcHJpdmF0ZSBnZW5lcmF0ZVBsYWNlaG9sZGVyKHBsYWNlaG9sZGVySW5wdXQ6IHN0cmluZyB8IGJvb2xlYW4pOiBzdHJpbmcgfCBib29sZWFuIHwgbnVsbCB7XG4gICAgY29uc3Qge3BsYWNlaG9sZGVyUmVzb2x1dGlvbn0gPSB0aGlzLmNvbmZpZztcbiAgICBpZiAocGxhY2Vob2xkZXJJbnB1dCA9PT0gdHJ1ZSkge1xuICAgICAgcmV0dXJuIGB1cmwoJHt0aGlzLmNhbGxJbWFnZUxvYWRlcih7XG4gICAgICAgIHNyYzogdGhpcy5uZ1NyYyxcbiAgICAgICAgd2lkdGg6IHBsYWNlaG9sZGVyUmVzb2x1dGlvbixcbiAgICAgICAgaXNQbGFjZWhvbGRlcjogdHJ1ZSxcbiAgICAgIH0pfSlgO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHBsYWNlaG9sZGVySW5wdXQgPT09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4gYHVybCgke3BsYWNlaG9sZGVySW5wdXR9KWA7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIERldGVybWluZXMgaWYgYmx1ciBzaG91bGQgYmUgYXBwbGllZCwgYmFzZWQgb24gYW4gb3B0aW9uYWwgYm9vbGVhblxuICAgKiBwcm9wZXJ0eSBgYmx1cmAgd2l0aGluIHRoZSBvcHRpb25hbCBjb25maWd1cmF0aW9uIG9iamVjdCBgcGxhY2Vob2xkZXJDb25maWdgLlxuICAgKi9cbiAgcHJpdmF0ZSBzaG91bGRCbHVyUGxhY2Vob2xkZXIocGxhY2Vob2xkZXJDb25maWc/OiBJbWFnZVBsYWNlaG9sZGVyQ29uZmlnKTogYm9vbGVhbiB7XG4gICAgaWYgKCFwbGFjZWhvbGRlckNvbmZpZyB8fCAhcGxhY2Vob2xkZXJDb25maWcuaGFzT3duUHJvcGVydHkoJ2JsdXInKSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBCb29sZWFuKHBsYWNlaG9sZGVyQ29uZmlnLmJsdXIpO1xuICB9XG5cbiAgcHJpdmF0ZSByZW1vdmVQbGFjZWhvbGRlck9uTG9hZChpbWc6IEhUTUxJbWFnZUVsZW1lbnQpOiB2b2lkIHtcbiAgICBjb25zdCBjYWxsYmFjayA9ICgpID0+IHtcbiAgICAgIGNvbnN0IGNoYW5nZURldGVjdG9yUmVmID0gdGhpcy5pbmplY3Rvci5nZXQoQ2hhbmdlRGV0ZWN0b3JSZWYpO1xuICAgICAgcmVtb3ZlTG9hZExpc3RlbmVyRm4oKTtcbiAgICAgIHJlbW92ZUVycm9yTGlzdGVuZXJGbigpO1xuICAgICAgdGhpcy5wbGFjZWhvbGRlciA9IGZhbHNlO1xuICAgICAgY2hhbmdlRGV0ZWN0b3JSZWYubWFya0ZvckNoZWNrKCk7XG4gICAgfTtcblxuICAgIGNvbnN0IHJlbW92ZUxvYWRMaXN0ZW5lckZuID0gdGhpcy5yZW5kZXJlci5saXN0ZW4oaW1nLCAnbG9hZCcsIGNhbGxiYWNrKTtcbiAgICBjb25zdCByZW1vdmVFcnJvckxpc3RlbmVyRm4gPSB0aGlzLnJlbmRlcmVyLmxpc3RlbihpbWcsICdlcnJvcicsIGNhbGxiYWNrKTtcblxuICAgIGNhbGxPbkxvYWRJZkltYWdlSXNMb2FkZWQoaW1nLCBjYWxsYmFjayk7XG4gIH1cblxuICAvKiogQG5vZG9jICovXG4gIG5nT25EZXN0cm95KCkge1xuICAgIGlmIChuZ0Rldk1vZGUpIHtcbiAgICAgIGlmICghdGhpcy5wcmlvcml0eSAmJiB0aGlzLl9yZW5kZXJlZFNyYyAhPT0gbnVsbCAmJiB0aGlzLmxjcE9ic2VydmVyICE9PSBudWxsKSB7XG4gICAgICAgIHRoaXMubGNwT2JzZXJ2ZXIudW5yZWdpc3RlckltYWdlKHRoaXMuX3JlbmRlcmVkU3JjKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHNldEhvc3RBdHRyaWJ1dGUobmFtZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5yZW5kZXJlci5zZXRBdHRyaWJ1dGUodGhpcy5pbWdFbGVtZW50LCBuYW1lLCB2YWx1ZSk7XG4gIH1cbn1cblxuLyoqKioqIEhlbHBlcnMgKioqKiovXG5cbi8qKlxuICogU29ydHMgcHJvdmlkZWQgY29uZmlnIGJyZWFrcG9pbnRzIGFuZCB1c2VzIGRlZmF1bHRzLlxuICovXG5mdW5jdGlvbiBwcm9jZXNzQ29uZmlnKGNvbmZpZzogSW1hZ2VDb25maWcpOiBJbWFnZUNvbmZpZyB7XG4gIGxldCBzb3J0ZWRCcmVha3BvaW50czoge2JyZWFrcG9pbnRzPzogbnVtYmVyW119ID0ge307XG4gIGlmIChjb25maWcuYnJlYWtwb2ludHMpIHtcbiAgICBzb3J0ZWRCcmVha3BvaW50cy5icmVha3BvaW50cyA9IGNvbmZpZy5icmVha3BvaW50cy5zb3J0KChhLCBiKSA9PiBhIC0gYik7XG4gIH1cbiAgcmV0dXJuIE9iamVjdC5hc3NpZ24oe30sIElNQUdFX0NPTkZJR19ERUZBVUxUUywgY29uZmlnLCBzb3J0ZWRCcmVha3BvaW50cyk7XG59XG5cbi8qKioqKiBBc3NlcnQgZnVuY3Rpb25zICoqKioqL1xuXG4vKipcbiAqIFZlcmlmaWVzIHRoYXQgdGhlcmUgaXMgbm8gYHNyY2Agc2V0IG9uIGEgaG9zdCBlbGVtZW50LlxuICovXG5mdW5jdGlvbiBhc3NlcnROb0NvbmZsaWN0aW5nU3JjKGRpcjogTmdPcHRpbWl6ZWRJbWFnZSkge1xuICBpZiAoZGlyLnNyYykge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICBSdW50aW1lRXJyb3JDb2RlLlVORVhQRUNURURfU1JDX0FUVFIsXG4gICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5uZ1NyYyl9IGJvdGggXFxgc3JjXFxgIGFuZCBcXGBuZ1NyY1xcYCBoYXZlIGJlZW4gc2V0LiBgICtcbiAgICAgICAgYFN1cHBseWluZyBib3RoIG9mIHRoZXNlIGF0dHJpYnV0ZXMgYnJlYWtzIGxhenkgbG9hZGluZy4gYCArXG4gICAgICAgIGBUaGUgTmdPcHRpbWl6ZWRJbWFnZSBkaXJlY3RpdmUgc2V0cyBcXGBzcmNcXGAgaXRzZWxmIGJhc2VkIG9uIHRoZSB2YWx1ZSBvZiBcXGBuZ1NyY1xcYC4gYCArXG4gICAgICAgIGBUbyBmaXggdGhpcywgcGxlYXNlIHJlbW92ZSB0aGUgXFxgc3JjXFxgIGF0dHJpYnV0ZS5gLFxuICAgICk7XG4gIH1cbn1cblxuLyoqXG4gKiBWZXJpZmllcyB0aGF0IHRoZXJlIGlzIG5vIGBzcmNzZXRgIHNldCBvbiBhIGhvc3QgZWxlbWVudC5cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0Tm9Db25mbGljdGluZ1NyY3NldChkaXI6IE5nT3B0aW1pemVkSW1hZ2UpIHtcbiAgaWYgKGRpci5zcmNzZXQpIHtcbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgUnVudGltZUVycm9yQ29kZS5VTkVYUEVDVEVEX1NSQ1NFVF9BVFRSLFxuICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIubmdTcmMpfSBib3RoIFxcYHNyY3NldFxcYCBhbmQgXFxgbmdTcmNzZXRcXGAgaGF2ZSBiZWVuIHNldC4gYCArXG4gICAgICAgIGBTdXBwbHlpbmcgYm90aCBvZiB0aGVzZSBhdHRyaWJ1dGVzIGJyZWFrcyBsYXp5IGxvYWRpbmcuIGAgK1xuICAgICAgICBgVGhlIE5nT3B0aW1pemVkSW1hZ2UgZGlyZWN0aXZlIHNldHMgXFxgc3Jjc2V0XFxgIGl0c2VsZiBiYXNlZCBvbiB0aGUgdmFsdWUgb2YgYCArXG4gICAgICAgIGBcXGBuZ1NyY3NldFxcYC4gVG8gZml4IHRoaXMsIHBsZWFzZSByZW1vdmUgdGhlIFxcYHNyY3NldFxcYCBhdHRyaWJ1dGUuYCxcbiAgICApO1xuICB9XG59XG5cbi8qKlxuICogVmVyaWZpZXMgdGhhdCB0aGUgYG5nU3JjYCBpcyBub3QgYSBCYXNlNjQtZW5jb2RlZCBpbWFnZS5cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0Tm90QmFzZTY0SW1hZ2UoZGlyOiBOZ09wdGltaXplZEltYWdlKSB7XG4gIGxldCBuZ1NyYyA9IGRpci5uZ1NyYy50cmltKCk7XG4gIGlmIChuZ1NyYy5zdGFydHNXaXRoKCdkYXRhOicpKSB7XG4gICAgaWYgKG5nU3JjLmxlbmd0aCA+IEJBU0U2NF9JTUdfTUFYX0xFTkdUSF9JTl9FUlJPUikge1xuICAgICAgbmdTcmMgPSBuZ1NyYy5zdWJzdHJpbmcoMCwgQkFTRTY0X0lNR19NQVhfTEVOR1RIX0lOX0VSUk9SKSArICcuLi4nO1xuICAgIH1cbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX0lOUFVULFxuICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIubmdTcmMsIGZhbHNlKX0gXFxgbmdTcmNcXGAgaXMgYSBCYXNlNjQtZW5jb2RlZCBzdHJpbmcgYCArXG4gICAgICAgIGAoJHtuZ1NyY30pLiBOZ09wdGltaXplZEltYWdlIGRvZXMgbm90IHN1cHBvcnQgQmFzZTY0LWVuY29kZWQgc3RyaW5ncy4gYCArXG4gICAgICAgIGBUbyBmaXggdGhpcywgZGlzYWJsZSB0aGUgTmdPcHRpbWl6ZWRJbWFnZSBkaXJlY3RpdmUgZm9yIHRoaXMgZWxlbWVudCBgICtcbiAgICAgICAgYGJ5IHJlbW92aW5nIFxcYG5nU3JjXFxgIGFuZCB1c2luZyBhIHN0YW5kYXJkIFxcYHNyY1xcYCBhdHRyaWJ1dGUgaW5zdGVhZC5gLFxuICAgICk7XG4gIH1cbn1cblxuLyoqXG4gKiBWZXJpZmllcyB0aGF0IHRoZSAnc2l6ZXMnIG9ubHkgaW5jbHVkZXMgcmVzcG9uc2l2ZSB2YWx1ZXMuXG4gKi9cbmZ1bmN0aW9uIGFzc2VydE5vQ29tcGxleFNpemVzKGRpcjogTmdPcHRpbWl6ZWRJbWFnZSkge1xuICBsZXQgc2l6ZXMgPSBkaXIuc2l6ZXM7XG4gIGlmIChzaXplcz8ubWF0Y2goLygoXFwpfCwpXFxzfF4pXFxkK3B4LykpIHtcbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX0lOUFVULFxuICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIubmdTcmMsIGZhbHNlKX0gXFxgc2l6ZXNcXGAgd2FzIHNldCB0byBhIHN0cmluZyBpbmNsdWRpbmcgYCArXG4gICAgICAgIGBwaXhlbCB2YWx1ZXMuIEZvciBhdXRvbWF0aWMgXFxgc3Jjc2V0XFxgIGdlbmVyYXRpb24sIFxcYHNpemVzXFxgIG11c3Qgb25seSBpbmNsdWRlIHJlc3BvbnNpdmUgYCArXG4gICAgICAgIGB2YWx1ZXMsIHN1Y2ggYXMgXFxgc2l6ZXM9XCI1MHZ3XCJcXGAgb3IgXFxgc2l6ZXM9XCIobWluLXdpZHRoOiA3NjhweCkgNTB2dywgMTAwdndcIlxcYC4gYCArXG4gICAgICAgIGBUbyBmaXggdGhpcywgbW9kaWZ5IHRoZSBcXGBzaXplc1xcYCBhdHRyaWJ1dGUsIG9yIHByb3ZpZGUgeW91ciBvd24gXFxgbmdTcmNzZXRcXGAgdmFsdWUgZGlyZWN0bHkuYCxcbiAgICApO1xuICB9XG59XG5cbmZ1bmN0aW9uIGFzc2VydFZhbGlkUGxhY2Vob2xkZXIoZGlyOiBOZ09wdGltaXplZEltYWdlLCBpbWFnZUxvYWRlcjogSW1hZ2VMb2FkZXIpIHtcbiAgYXNzZXJ0Tm9QbGFjZWhvbGRlckNvbmZpZ1dpdGhvdXRQbGFjZWhvbGRlcihkaXIpO1xuICBhc3NlcnROb1JlbGF0aXZlUGxhY2Vob2xkZXJXaXRob3V0TG9hZGVyKGRpciwgaW1hZ2VMb2FkZXIpO1xuICBhc3NlcnROb092ZXJzaXplZERhdGFVcmwoZGlyKTtcbn1cblxuLyoqXG4gKiBWZXJpZmllcyB0aGF0IHBsYWNlaG9sZGVyQ29uZmlnIGlzbid0IGJlaW5nIHVzZWQgd2l0aG91dCBwbGFjZWhvbGRlclxuICovXG5mdW5jdGlvbiBhc3NlcnROb1BsYWNlaG9sZGVyQ29uZmlnV2l0aG91dFBsYWNlaG9sZGVyKGRpcjogTmdPcHRpbWl6ZWRJbWFnZSkge1xuICBpZiAoZGlyLnBsYWNlaG9sZGVyQ29uZmlnICYmICFkaXIucGxhY2Vob2xkZXIpIHtcbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX0lOUFVULFxuICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhcbiAgICAgICAgZGlyLm5nU3JjLFxuICAgICAgICBmYWxzZSxcbiAgICAgICl9IFxcYHBsYWNlaG9sZGVyQ29uZmlnXFxgIG9wdGlvbnMgd2VyZSBwcm92aWRlZCBmb3IgYW4gYCArXG4gICAgICAgIGBpbWFnZSB0aGF0IGRvZXMgbm90IHVzZSB0aGUgXFxgcGxhY2Vob2xkZXJcXGAgYXR0cmlidXRlLCBhbmQgd2lsbCBoYXZlIG5vIGVmZmVjdC5gLFxuICAgICk7XG4gIH1cbn1cblxuLyoqXG4gKiBXYXJucyBpZiBhIHJlbGF0aXZlIFVSTCBwbGFjZWhvbGRlciBpcyBzcGVjaWZpZWQsIGJ1dCBubyBsb2FkZXIgaXMgcHJlc2VudCB0byBwcm92aWRlIHRoZSBzbWFsbFxuICogaW1hZ2UuXG4gKi9cbmZ1bmN0aW9uIGFzc2VydE5vUmVsYXRpdmVQbGFjZWhvbGRlcldpdGhvdXRMb2FkZXIoZGlyOiBOZ09wdGltaXplZEltYWdlLCBpbWFnZUxvYWRlcjogSW1hZ2VMb2FkZXIpIHtcbiAgaWYgKGRpci5wbGFjZWhvbGRlciA9PT0gdHJ1ZSAmJiBpbWFnZUxvYWRlciA9PT0gbm9vcEltYWdlTG9hZGVyKSB7XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgIFJ1bnRpbWVFcnJvckNvZGUuTUlTU0lOR19ORUNFU1NBUllfTE9BREVSLFxuICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIubmdTcmMpfSB0aGUgXFxgcGxhY2Vob2xkZXJcXGAgYXR0cmlidXRlIGlzIHNldCB0byB0cnVlIGJ1dCBgICtcbiAgICAgICAgYG5vIGltYWdlIGxvYWRlciBpcyBjb25maWd1cmVkIChpLmUuIHRoZSBkZWZhdWx0IG9uZSBpcyBiZWluZyB1c2VkKSwgYCArXG4gICAgICAgIGB3aGljaCB3b3VsZCByZXN1bHQgaW4gdGhlIHNhbWUgaW1hZ2UgYmVpbmcgdXNlZCBmb3IgdGhlIHByaW1hcnkgaW1hZ2UgYW5kIGl0cyBwbGFjZWhvbGRlci4gYCArXG4gICAgICAgIGBUbyBmaXggdGhpcywgcHJvdmlkZSBhIGxvYWRlciBvciByZW1vdmUgdGhlIFxcYHBsYWNlaG9sZGVyXFxgIGF0dHJpYnV0ZSBmcm9tIHRoZSBpbWFnZS5gLFxuICAgICk7XG4gIH1cbn1cblxuLyoqXG4gKiBXYXJucyBvciB0aHJvd3MgYW4gZXJyb3IgaWYgYW4gb3ZlcnNpemVkIGRhdGFVUkwgcGxhY2Vob2xkZXIgaXMgcHJvdmlkZWQuXG4gKi9cbmZ1bmN0aW9uIGFzc2VydE5vT3ZlcnNpemVkRGF0YVVybChkaXI6IE5nT3B0aW1pemVkSW1hZ2UpIHtcbiAgaWYgKFxuICAgIGRpci5wbGFjZWhvbGRlciAmJlxuICAgIHR5cGVvZiBkaXIucGxhY2Vob2xkZXIgPT09ICdzdHJpbmcnICYmXG4gICAgZGlyLnBsYWNlaG9sZGVyLnN0YXJ0c1dpdGgoJ2RhdGE6JylcbiAgKSB7XG4gICAgaWYgKGRpci5wbGFjZWhvbGRlci5sZW5ndGggPiBEQVRBX1VSTF9FUlJPUl9MSU1JVCkge1xuICAgICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgUnVudGltZUVycm9yQ29kZS5PVkVSU0laRURfUExBQ0VIT0xERVIsXG4gICAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoXG4gICAgICAgICAgZGlyLm5nU3JjLFxuICAgICAgICApfSB0aGUgXFxgcGxhY2Vob2xkZXJcXGAgYXR0cmlidXRlIGlzIHNldCB0byBhIGRhdGEgVVJMIHdoaWNoIGlzIGxvbmdlciBgICtcbiAgICAgICAgICBgdGhhbiAke0RBVEFfVVJMX0VSUk9SX0xJTUlUfSBjaGFyYWN0ZXJzLiBUaGlzIGlzIHN0cm9uZ2x5IGRpc2NvdXJhZ2VkLCBhcyBsYXJnZSBpbmxpbmUgcGxhY2Vob2xkZXJzIGAgK1xuICAgICAgICAgIGBkaXJlY3RseSBpbmNyZWFzZSB0aGUgYnVuZGxlIHNpemUgb2YgQW5ndWxhciBhbmQgaHVydCBwYWdlIGxvYWQgcGVyZm9ybWFuY2UuIFRvIGZpeCB0aGlzLCBnZW5lcmF0ZSBgICtcbiAgICAgICAgICBgYSBzbWFsbGVyIGRhdGEgVVJMIHBsYWNlaG9sZGVyLmAsXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAoZGlyLnBsYWNlaG9sZGVyLmxlbmd0aCA+IERBVEFfVVJMX1dBUk5fTElNSVQpIHtcbiAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgZm9ybWF0UnVudGltZUVycm9yKFxuICAgICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuT1ZFUlNJWkVEX1BMQUNFSE9MREVSLFxuICAgICAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoXG4gICAgICAgICAgICBkaXIubmdTcmMsXG4gICAgICAgICAgKX0gdGhlIFxcYHBsYWNlaG9sZGVyXFxgIGF0dHJpYnV0ZSBpcyBzZXQgdG8gYSBkYXRhIFVSTCB3aGljaCBpcyBsb25nZXIgYCArXG4gICAgICAgICAgICBgdGhhbiAke0RBVEFfVVJMX1dBUk5fTElNSVR9IGNoYXJhY3RlcnMuIFRoaXMgaXMgZGlzY291cmFnZWQsIGFzIGxhcmdlIGlubGluZSBwbGFjZWhvbGRlcnMgYCArXG4gICAgICAgICAgICBgZGlyZWN0bHkgaW5jcmVhc2UgdGhlIGJ1bmRsZSBzaXplIG9mIEFuZ3VsYXIgYW5kIGh1cnQgcGFnZSBsb2FkIHBlcmZvcm1hbmNlLiBGb3IgYmV0dGVyIGxvYWRpbmcgcGVyZm9ybWFuY2UsIGAgK1xuICAgICAgICAgICAgYGdlbmVyYXRlIGEgc21hbGxlciBkYXRhIFVSTCBwbGFjZWhvbGRlci5gLFxuICAgICAgICApLFxuICAgICAgKTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBWZXJpZmllcyB0aGF0IHRoZSBgbmdTcmNgIGlzIG5vdCBhIEJsb2IgVVJMLlxuICovXG5mdW5jdGlvbiBhc3NlcnROb3RCbG9iVXJsKGRpcjogTmdPcHRpbWl6ZWRJbWFnZSkge1xuICBjb25zdCBuZ1NyYyA9IGRpci5uZ1NyYy50cmltKCk7XG4gIGlmIChuZ1NyYy5zdGFydHNXaXRoKCdibG9iOicpKSB7XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoZGlyLm5nU3JjKX0gXFxgbmdTcmNcXGAgd2FzIHNldCB0byBhIGJsb2IgVVJMICgke25nU3JjfSkuIGAgK1xuICAgICAgICBgQmxvYiBVUkxzIGFyZSBub3Qgc3VwcG9ydGVkIGJ5IHRoZSBOZ09wdGltaXplZEltYWdlIGRpcmVjdGl2ZS4gYCArXG4gICAgICAgIGBUbyBmaXggdGhpcywgZGlzYWJsZSB0aGUgTmdPcHRpbWl6ZWRJbWFnZSBkaXJlY3RpdmUgZm9yIHRoaXMgZWxlbWVudCBgICtcbiAgICAgICAgYGJ5IHJlbW92aW5nIFxcYG5nU3JjXFxgIGFuZCB1c2luZyBhIHJlZ3VsYXIgXFxgc3JjXFxgIGF0dHJpYnV0ZSBpbnN0ZWFkLmAsXG4gICAgKTtcbiAgfVxufVxuXG4vKipcbiAqIFZlcmlmaWVzIHRoYXQgdGhlIGlucHV0IGlzIHNldCB0byBhIG5vbi1lbXB0eSBzdHJpbmcuXG4gKi9cbmZ1bmN0aW9uIGFzc2VydE5vbkVtcHR5SW5wdXQoZGlyOiBOZ09wdGltaXplZEltYWdlLCBuYW1lOiBzdHJpbmcsIHZhbHVlOiB1bmtub3duKSB7XG4gIGNvbnN0IGlzU3RyaW5nID0gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJztcbiAgY29uc3QgaXNFbXB0eVN0cmluZyA9IGlzU3RyaW5nICYmIHZhbHVlLnRyaW0oKSA9PT0gJyc7XG4gIGlmICghaXNTdHJpbmcgfHwgaXNFbXB0eVN0cmluZykge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfSU5QVVQsXG4gICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5uZ1NyYyl9IFxcYCR7bmFtZX1cXGAgaGFzIGFuIGludmFsaWQgdmFsdWUgYCArXG4gICAgICAgIGAoXFxgJHt2YWx1ZX1cXGApLiBUbyBmaXggdGhpcywgY2hhbmdlIHRoZSB2YWx1ZSB0byBhIG5vbi1lbXB0eSBzdHJpbmcuYCxcbiAgICApO1xuICB9XG59XG5cbi8qKlxuICogVmVyaWZpZXMgdGhhdCB0aGUgYG5nU3Jjc2V0YCBpcyBpbiBhIHZhbGlkIGZvcm1hdCwgZS5nLiBcIjEwMHcsIDIwMHdcIiBvciBcIjF4LCAyeFwiLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYXNzZXJ0VmFsaWROZ1NyY3NldChkaXI6IE5nT3B0aW1pemVkSW1hZ2UsIHZhbHVlOiB1bmtub3duKSB7XG4gIGlmICh2YWx1ZSA9PSBudWxsKSByZXR1cm47XG4gIGFzc2VydE5vbkVtcHR5SW5wdXQoZGlyLCAnbmdTcmNzZXQnLCB2YWx1ZSk7XG4gIGNvbnN0IHN0cmluZ1ZhbCA9IHZhbHVlIGFzIHN0cmluZztcbiAgY29uc3QgaXNWYWxpZFdpZHRoRGVzY3JpcHRvciA9IFZBTElEX1dJRFRIX0RFU0NSSVBUT1JfU1JDU0VULnRlc3Qoc3RyaW5nVmFsKTtcbiAgY29uc3QgaXNWYWxpZERlbnNpdHlEZXNjcmlwdG9yID0gVkFMSURfREVOU0lUWV9ERVNDUklQVE9SX1NSQ1NFVC50ZXN0KHN0cmluZ1ZhbCk7XG5cbiAgaWYgKGlzVmFsaWREZW5zaXR5RGVzY3JpcHRvcikge1xuICAgIGFzc2VydFVuZGVyRGVuc2l0eUNhcChkaXIsIHN0cmluZ1ZhbCk7XG4gIH1cblxuICBjb25zdCBpc1ZhbGlkU3Jjc2V0ID0gaXNWYWxpZFdpZHRoRGVzY3JpcHRvciB8fCBpc1ZhbGlkRGVuc2l0eURlc2NyaXB0b3I7XG4gIGlmICghaXNWYWxpZFNyY3NldCkge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfSU5QVVQsXG4gICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5uZ1NyYyl9IFxcYG5nU3Jjc2V0XFxgIGhhcyBhbiBpbnZhbGlkIHZhbHVlIChcXGAke3ZhbHVlfVxcYCkuIGAgK1xuICAgICAgICBgVG8gZml4IHRoaXMsIHN1cHBseSBcXGBuZ1NyY3NldFxcYCB1c2luZyBhIGNvbW1hLXNlcGFyYXRlZCBsaXN0IG9mIG9uZSBvciBtb3JlIHdpZHRoIGAgK1xuICAgICAgICBgZGVzY3JpcHRvcnMgKGUuZy4gXCIxMDB3LCAyMDB3XCIpIG9yIGRlbnNpdHkgZGVzY3JpcHRvcnMgKGUuZy4gXCIxeCwgMnhcIikuYCxcbiAgICApO1xuICB9XG59XG5cbmZ1bmN0aW9uIGFzc2VydFVuZGVyRGVuc2l0eUNhcChkaXI6IE5nT3B0aW1pemVkSW1hZ2UsIHZhbHVlOiBzdHJpbmcpIHtcbiAgY29uc3QgdW5kZXJEZW5zaXR5Q2FwID0gdmFsdWVcbiAgICAuc3BsaXQoJywnKVxuICAgIC5ldmVyeSgobnVtKSA9PiBudW0gPT09ICcnIHx8IHBhcnNlRmxvYXQobnVtKSA8PSBBQlNPTFVURV9TUkNTRVRfREVOU0lUWV9DQVApO1xuICBpZiAoIXVuZGVyRGVuc2l0eUNhcCkge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfSU5QVVQsXG4gICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5uZ1NyYyl9IHRoZSBcXGBuZ1NyY3NldFxcYCBjb250YWlucyBhbiB1bnN1cHBvcnRlZCBpbWFnZSBkZW5zaXR5OmAgK1xuICAgICAgICBgXFxgJHt2YWx1ZX1cXGAuIE5nT3B0aW1pemVkSW1hZ2UgZ2VuZXJhbGx5IHJlY29tbWVuZHMgYSBtYXggaW1hZ2UgZGVuc2l0eSBvZiBgICtcbiAgICAgICAgYCR7UkVDT01NRU5ERURfU1JDU0VUX0RFTlNJVFlfQ0FQfXggYnV0IHN1cHBvcnRzIGltYWdlIGRlbnNpdGllcyB1cCB0byBgICtcbiAgICAgICAgYCR7QUJTT0xVVEVfU1JDU0VUX0RFTlNJVFlfQ0FQfXguIFRoZSBodW1hbiBleWUgY2Fubm90IGRpc3Rpbmd1aXNoIGJldHdlZW4gaW1hZ2UgZGVuc2l0aWVzIGAgK1xuICAgICAgICBgZ3JlYXRlciB0aGFuICR7UkVDT01NRU5ERURfU1JDU0VUX0RFTlNJVFlfQ0FQfXggLSB3aGljaCBtYWtlcyB0aGVtIHVubmVjZXNzYXJ5IGZvciBgICtcbiAgICAgICAgYG1vc3QgdXNlIGNhc2VzLiBJbWFnZXMgdGhhdCB3aWxsIGJlIHBpbmNoLXpvb21lZCBhcmUgdHlwaWNhbGx5IHRoZSBwcmltYXJ5IHVzZSBjYXNlIGZvciBgICtcbiAgICAgICAgYCR7QUJTT0xVVEVfU1JDU0VUX0RFTlNJVFlfQ0FQfXggaW1hZ2VzLiBQbGVhc2UgcmVtb3ZlIHRoZSBoaWdoIGRlbnNpdHkgZGVzY3JpcHRvciBhbmQgdHJ5IGFnYWluLmAsXG4gICAgKTtcbiAgfVxufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBgUnVudGltZUVycm9yYCBpbnN0YW5jZSB0byByZXByZXNlbnQgYSBzaXR1YXRpb24gd2hlbiBhbiBpbnB1dCBpcyBzZXQgYWZ0ZXJcbiAqIHRoZSBkaXJlY3RpdmUgaGFzIGluaXRpYWxpemVkLlxuICovXG5mdW5jdGlvbiBwb3N0SW5pdElucHV0Q2hhbmdlRXJyb3IoZGlyOiBOZ09wdGltaXplZEltYWdlLCBpbnB1dE5hbWU6IHN0cmluZyk6IHt9IHtcbiAgbGV0IHJlYXNvbiE6IHN0cmluZztcbiAgaWYgKGlucHV0TmFtZSA9PT0gJ3dpZHRoJyB8fCBpbnB1dE5hbWUgPT09ICdoZWlnaHQnKSB7XG4gICAgcmVhc29uID1cbiAgICAgIGBDaGFuZ2luZyBcXGAke2lucHV0TmFtZX1cXGAgbWF5IHJlc3VsdCBpbiBkaWZmZXJlbnQgYXR0cmlidXRlIHZhbHVlIGAgK1xuICAgICAgYGFwcGxpZWQgdG8gdGhlIHVuZGVybHlpbmcgaW1hZ2UgZWxlbWVudCBhbmQgY2F1c2UgbGF5b3V0IHNoaWZ0cyBvbiBhIHBhZ2UuYDtcbiAgfSBlbHNlIHtcbiAgICByZWFzb24gPVxuICAgICAgYENoYW5naW5nIHRoZSBcXGAke2lucHV0TmFtZX1cXGAgd291bGQgaGF2ZSBubyBlZmZlY3Qgb24gdGhlIHVuZGVybHlpbmcgYCArXG4gICAgICBgaW1hZ2UgZWxlbWVudCwgYmVjYXVzZSB0aGUgcmVzb3VyY2UgbG9hZGluZyBoYXMgYWxyZWFkeSBvY2N1cnJlZC5gO1xuICB9XG4gIHJldHVybiBuZXcgUnVudGltZUVycm9yKFxuICAgIFJ1bnRpbWVFcnJvckNvZGUuVU5FWFBFQ1RFRF9JTlBVVF9DSEFOR0UsXG4gICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIubmdTcmMpfSBcXGAke2lucHV0TmFtZX1cXGAgd2FzIHVwZGF0ZWQgYWZ0ZXIgaW5pdGlhbGl6YXRpb24uIGAgK1xuICAgICAgYFRoZSBOZ09wdGltaXplZEltYWdlIGRpcmVjdGl2ZSB3aWxsIG5vdCByZWFjdCB0byB0aGlzIGlucHV0IGNoYW5nZS4gJHtyZWFzb259IGAgK1xuICAgICAgYFRvIGZpeCB0aGlzLCBlaXRoZXIgc3dpdGNoIFxcYCR7aW5wdXROYW1lfVxcYCB0byBhIHN0YXRpYyB2YWx1ZSBgICtcbiAgICAgIGBvciB3cmFwIHRoZSBpbWFnZSBlbGVtZW50IGluIGFuICpuZ0lmIHRoYXQgaXMgZ2F0ZWQgb24gdGhlIG5lY2Vzc2FyeSB2YWx1ZS5gLFxuICApO1xufVxuXG4vKipcbiAqIFZlcmlmeSB0aGF0IG5vbmUgb2YgdGhlIGxpc3RlZCBpbnB1dHMgaGFzIGNoYW5nZWQuXG4gKi9cbmZ1bmN0aW9uIGFzc2VydE5vUG9zdEluaXRJbnB1dENoYW5nZShcbiAgZGlyOiBOZ09wdGltaXplZEltYWdlLFxuICBjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzLFxuICBpbnB1dHM6IHN0cmluZ1tdLFxuKSB7XG4gIGlucHV0cy5mb3JFYWNoKChpbnB1dCkgPT4ge1xuICAgIGNvbnN0IGlzVXBkYXRlZCA9IGNoYW5nZXMuaGFzT3duUHJvcGVydHkoaW5wdXQpO1xuICAgIGlmIChpc1VwZGF0ZWQgJiYgIWNoYW5nZXNbaW5wdXRdLmlzRmlyc3RDaGFuZ2UoKSkge1xuICAgICAgaWYgKGlucHV0ID09PSAnbmdTcmMnKSB7XG4gICAgICAgIC8vIFdoZW4gdGhlIGBuZ1NyY2AgaW5wdXQgY2hhbmdlcywgd2UgZGV0ZWN0IHRoYXQgb25seSBpbiB0aGVcbiAgICAgICAgLy8gYG5nT25DaGFuZ2VzYCBob29rLCB0aHVzIHRoZSBgbmdTcmNgIGlzIGFscmVhZHkgc2V0LiBXZSB1c2VcbiAgICAgICAgLy8gYG5nU3JjYCBpbiB0aGUgZXJyb3IgbWVzc2FnZSwgc28gd2UgdXNlIGEgcHJldmlvdXMgdmFsdWUsIGJ1dFxuICAgICAgICAvLyBub3QgdGhlIHVwZGF0ZWQgb25lIGluIGl0LlxuICAgICAgICBkaXIgPSB7bmdTcmM6IGNoYW5nZXNbaW5wdXRdLnByZXZpb3VzVmFsdWV9IGFzIE5nT3B0aW1pemVkSW1hZ2U7XG4gICAgICB9XG4gICAgICB0aHJvdyBwb3N0SW5pdElucHV0Q2hhbmdlRXJyb3IoZGlyLCBpbnB1dCk7XG4gICAgfVxuICB9KTtcbn1cblxuLyoqXG4gKiBWZXJpZmllcyB0aGF0IGEgc3BlY2lmaWVkIGlucHV0IGlzIGEgbnVtYmVyIGdyZWF0ZXIgdGhhbiAwLlxuICovXG5mdW5jdGlvbiBhc3NlcnRHcmVhdGVyVGhhblplcm8oZGlyOiBOZ09wdGltaXplZEltYWdlLCBpbnB1dFZhbHVlOiB1bmtub3duLCBpbnB1dE5hbWU6IHN0cmluZykge1xuICBjb25zdCB2YWxpZE51bWJlciA9IHR5cGVvZiBpbnB1dFZhbHVlID09PSAnbnVtYmVyJyAmJiBpbnB1dFZhbHVlID4gMDtcbiAgY29uc3QgdmFsaWRTdHJpbmcgPVxuICAgIHR5cGVvZiBpbnB1dFZhbHVlID09PSAnc3RyaW5nJyAmJiAvXlxcZCskLy50ZXN0KGlucHV0VmFsdWUudHJpbSgpKSAmJiBwYXJzZUludChpbnB1dFZhbHVlKSA+IDA7XG4gIGlmICghdmFsaWROdW1iZXIgJiYgIXZhbGlkU3RyaW5nKSB7XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoZGlyLm5nU3JjKX0gXFxgJHtpbnB1dE5hbWV9XFxgIGhhcyBhbiBpbnZhbGlkIHZhbHVlLiBgICtcbiAgICAgICAgYFRvIGZpeCB0aGlzLCBwcm92aWRlIFxcYCR7aW5wdXROYW1lfVxcYCBhcyBhIG51bWJlciBncmVhdGVyIHRoYW4gMC5gLFxuICAgICk7XG4gIH1cbn1cblxuLyoqXG4gKiBWZXJpZmllcyB0aGF0IHRoZSByZW5kZXJlZCBpbWFnZSBpcyBub3QgdmlzdWFsbHkgZGlzdG9ydGVkLiBFZmZlY3RpdmVseSB0aGlzIGlzIGNoZWNraW5nOlxuICogLSBXaGV0aGVyIHRoZSBcIndpZHRoXCIgYW5kIFwiaGVpZ2h0XCIgYXR0cmlidXRlcyByZWZsZWN0IHRoZSBhY3R1YWwgZGltZW5zaW9ucyBvZiB0aGUgaW1hZ2UuXG4gKiAtIFdoZXRoZXIgaW1hZ2Ugc3R5bGluZyBpcyBcImNvcnJlY3RcIiAoc2VlIGJlbG93IGZvciBhIGxvbmdlciBleHBsYW5hdGlvbikuXG4gKi9cbmZ1bmN0aW9uIGFzc2VydE5vSW1hZ2VEaXN0b3J0aW9uKFxuICBkaXI6IE5nT3B0aW1pemVkSW1hZ2UsXG4gIGltZzogSFRNTEltYWdlRWxlbWVudCxcbiAgcmVuZGVyZXI6IFJlbmRlcmVyMixcbikge1xuICBjb25zdCBjYWxsYmFjayA9ICgpID0+IHtcbiAgICByZW1vdmVMb2FkTGlzdGVuZXJGbigpO1xuICAgIHJlbW92ZUVycm9yTGlzdGVuZXJGbigpO1xuICAgIGNvbnN0IGNvbXB1dGVkU3R5bGUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShpbWcpO1xuICAgIGxldCByZW5kZXJlZFdpZHRoID0gcGFyc2VGbG9hdChjb21wdXRlZFN0eWxlLmdldFByb3BlcnR5VmFsdWUoJ3dpZHRoJykpO1xuICAgIGxldCByZW5kZXJlZEhlaWdodCA9IHBhcnNlRmxvYXQoY29tcHV0ZWRTdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKCdoZWlnaHQnKSk7XG4gICAgY29uc3QgYm94U2l6aW5nID0gY29tcHV0ZWRTdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKCdib3gtc2l6aW5nJyk7XG5cbiAgICBpZiAoYm94U2l6aW5nID09PSAnYm9yZGVyLWJveCcpIHtcbiAgICAgIGNvbnN0IHBhZGRpbmdUb3AgPSBjb21wdXRlZFN0eWxlLmdldFByb3BlcnR5VmFsdWUoJ3BhZGRpbmctdG9wJyk7XG4gICAgICBjb25zdCBwYWRkaW5nUmlnaHQgPSBjb21wdXRlZFN0eWxlLmdldFByb3BlcnR5VmFsdWUoJ3BhZGRpbmctcmlnaHQnKTtcbiAgICAgIGNvbnN0IHBhZGRpbmdCb3R0b20gPSBjb21wdXRlZFN0eWxlLmdldFByb3BlcnR5VmFsdWUoJ3BhZGRpbmctYm90dG9tJyk7XG4gICAgICBjb25zdCBwYWRkaW5nTGVmdCA9IGNvbXB1dGVkU3R5bGUuZ2V0UHJvcGVydHlWYWx1ZSgncGFkZGluZy1sZWZ0Jyk7XG4gICAgICByZW5kZXJlZFdpZHRoIC09IHBhcnNlRmxvYXQocGFkZGluZ1JpZ2h0KSArIHBhcnNlRmxvYXQocGFkZGluZ0xlZnQpO1xuICAgICAgcmVuZGVyZWRIZWlnaHQgLT0gcGFyc2VGbG9hdChwYWRkaW5nVG9wKSArIHBhcnNlRmxvYXQocGFkZGluZ0JvdHRvbSk7XG4gICAgfVxuXG4gICAgY29uc3QgcmVuZGVyZWRBc3BlY3RSYXRpbyA9IHJlbmRlcmVkV2lkdGggLyByZW5kZXJlZEhlaWdodDtcbiAgICBjb25zdCBub25aZXJvUmVuZGVyZWREaW1lbnNpb25zID0gcmVuZGVyZWRXaWR0aCAhPT0gMCAmJiByZW5kZXJlZEhlaWdodCAhPT0gMDtcblxuICAgIGNvbnN0IGludHJpbnNpY1dpZHRoID0gaW1nLm5hdHVyYWxXaWR0aDtcbiAgICBjb25zdCBpbnRyaW5zaWNIZWlnaHQgPSBpbWcubmF0dXJhbEhlaWdodDtcbiAgICBjb25zdCBpbnRyaW5zaWNBc3BlY3RSYXRpbyA9IGludHJpbnNpY1dpZHRoIC8gaW50cmluc2ljSGVpZ2h0O1xuXG4gICAgY29uc3Qgc3VwcGxpZWRXaWR0aCA9IGRpci53aWR0aCE7XG4gICAgY29uc3Qgc3VwcGxpZWRIZWlnaHQgPSBkaXIuaGVpZ2h0ITtcbiAgICBjb25zdCBzdXBwbGllZEFzcGVjdFJhdGlvID0gc3VwcGxpZWRXaWR0aCAvIHN1cHBsaWVkSGVpZ2h0O1xuXG4gICAgLy8gVG9sZXJhbmNlIGlzIHVzZWQgdG8gYWNjb3VudCBmb3IgdGhlIGltcGFjdCBvZiBzdWJwaXhlbCByZW5kZXJpbmcuXG4gICAgLy8gRHVlIHRvIHN1YnBpeGVsIHJlbmRlcmluZywgdGhlIHJlbmRlcmVkLCBpbnRyaW5zaWMsIGFuZCBzdXBwbGllZFxuICAgIC8vIGFzcGVjdCByYXRpb3Mgb2YgYSBjb3JyZWN0bHkgY29uZmlndXJlZCBpbWFnZSBtYXkgbm90IGV4YWN0bHkgbWF0Y2guXG4gICAgLy8gRm9yIGV4YW1wbGUsIGEgYHdpZHRoPTQwMzAgaGVpZ2h0PTMwMjBgIGltYWdlIG1pZ2h0IGhhdmUgYSByZW5kZXJlZFxuICAgIC8vIHNpemUgb2YgXCIxMDYydywgNzk2LjQ4aFwiLiAoQW4gYXNwZWN0IHJhdGlvIG9mIDEuMzM0Li4uIHZzLiAxLjMzMy4uLilcbiAgICBjb25zdCBpbmFjY3VyYXRlRGltZW5zaW9ucyA9XG4gICAgICBNYXRoLmFicyhzdXBwbGllZEFzcGVjdFJhdGlvIC0gaW50cmluc2ljQXNwZWN0UmF0aW8pID4gQVNQRUNUX1JBVElPX1RPTEVSQU5DRTtcbiAgICBjb25zdCBzdHlsaW5nRGlzdG9ydGlvbiA9XG4gICAgICBub25aZXJvUmVuZGVyZWREaW1lbnNpb25zICYmXG4gICAgICBNYXRoLmFicyhpbnRyaW5zaWNBc3BlY3RSYXRpbyAtIHJlbmRlcmVkQXNwZWN0UmF0aW8pID4gQVNQRUNUX1JBVElPX1RPTEVSQU5DRTtcblxuICAgIGlmIChpbmFjY3VyYXRlRGltZW5zaW9ucykge1xuICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICBmb3JtYXRSdW50aW1lRXJyb3IoXG4gICAgICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX0lOUFVULFxuICAgICAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoZGlyLm5nU3JjKX0gdGhlIGFzcGVjdCByYXRpbyBvZiB0aGUgaW1hZ2UgZG9lcyBub3QgbWF0Y2ggYCArXG4gICAgICAgICAgICBgdGhlIGFzcGVjdCByYXRpbyBpbmRpY2F0ZWQgYnkgdGhlIHdpZHRoIGFuZCBoZWlnaHQgYXR0cmlidXRlcy4gYCArXG4gICAgICAgICAgICBgXFxuSW50cmluc2ljIGltYWdlIHNpemU6ICR7aW50cmluc2ljV2lkdGh9dyB4ICR7aW50cmluc2ljSGVpZ2h0fWggYCArXG4gICAgICAgICAgICBgKGFzcGVjdC1yYXRpbzogJHtyb3VuZChcbiAgICAgICAgICAgICAgaW50cmluc2ljQXNwZWN0UmF0aW8sXG4gICAgICAgICAgICApfSkuIFxcblN1cHBsaWVkIHdpZHRoIGFuZCBoZWlnaHQgYXR0cmlidXRlczogYCArXG4gICAgICAgICAgICBgJHtzdXBwbGllZFdpZHRofXcgeCAke3N1cHBsaWVkSGVpZ2h0fWggKGFzcGVjdC1yYXRpbzogJHtyb3VuZChcbiAgICAgICAgICAgICAgc3VwcGxpZWRBc3BlY3RSYXRpbyxcbiAgICAgICAgICAgICl9KS4gYCArXG4gICAgICAgICAgICBgXFxuVG8gZml4IHRoaXMsIHVwZGF0ZSB0aGUgd2lkdGggYW5kIGhlaWdodCBhdHRyaWJ1dGVzLmAsXG4gICAgICAgICksXG4gICAgICApO1xuICAgIH0gZWxzZSBpZiAoc3R5bGluZ0Rpc3RvcnRpb24pIHtcbiAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgZm9ybWF0UnVudGltZUVycm9yKFxuICAgICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5uZ1NyYyl9IHRoZSBhc3BlY3QgcmF0aW8gb2YgdGhlIHJlbmRlcmVkIGltYWdlIGAgK1xuICAgICAgICAgICAgYGRvZXMgbm90IG1hdGNoIHRoZSBpbWFnZSdzIGludHJpbnNpYyBhc3BlY3QgcmF0aW8uIGAgK1xuICAgICAgICAgICAgYFxcbkludHJpbnNpYyBpbWFnZSBzaXplOiAke2ludHJpbnNpY1dpZHRofXcgeCAke2ludHJpbnNpY0hlaWdodH1oIGAgK1xuICAgICAgICAgICAgYChhc3BlY3QtcmF0aW86ICR7cm91bmQoaW50cmluc2ljQXNwZWN0UmF0aW8pfSkuIFxcblJlbmRlcmVkIGltYWdlIHNpemU6IGAgK1xuICAgICAgICAgICAgYCR7cmVuZGVyZWRXaWR0aH13IHggJHtyZW5kZXJlZEhlaWdodH1oIChhc3BlY3QtcmF0aW86IGAgK1xuICAgICAgICAgICAgYCR7cm91bmQocmVuZGVyZWRBc3BlY3RSYXRpbyl9KS4gXFxuVGhpcyBpc3N1ZSBjYW4gb2NjdXIgaWYgXCJ3aWR0aFwiIGFuZCBcImhlaWdodFwiIGAgK1xuICAgICAgICAgICAgYGF0dHJpYnV0ZXMgYXJlIGFkZGVkIHRvIGFuIGltYWdlIHdpdGhvdXQgdXBkYXRpbmcgdGhlIGNvcnJlc3BvbmRpbmcgYCArXG4gICAgICAgICAgICBgaW1hZ2Ugc3R5bGluZy4gVG8gZml4IHRoaXMsIGFkanVzdCBpbWFnZSBzdHlsaW5nLiBJbiBtb3N0IGNhc2VzLCBgICtcbiAgICAgICAgICAgIGBhZGRpbmcgXCJoZWlnaHQ6IGF1dG9cIiBvciBcIndpZHRoOiBhdXRvXCIgdG8gdGhlIGltYWdlIHN0eWxpbmcgd2lsbCBmaXggYCArXG4gICAgICAgICAgICBgdGhpcyBpc3N1ZS5gLFxuICAgICAgICApLFxuICAgICAgKTtcbiAgICB9IGVsc2UgaWYgKCFkaXIubmdTcmNzZXQgJiYgbm9uWmVyb1JlbmRlcmVkRGltZW5zaW9ucykge1xuICAgICAgLy8gSWYgYG5nU3Jjc2V0YCBoYXNuJ3QgYmVlbiBzZXQsIHNhbml0eSBjaGVjayB0aGUgaW50cmluc2ljIHNpemUuXG4gICAgICBjb25zdCByZWNvbW1lbmRlZFdpZHRoID0gUkVDT01NRU5ERURfU1JDU0VUX0RFTlNJVFlfQ0FQICogcmVuZGVyZWRXaWR0aDtcbiAgICAgIGNvbnN0IHJlY29tbWVuZGVkSGVpZ2h0ID0gUkVDT01NRU5ERURfU1JDU0VUX0RFTlNJVFlfQ0FQICogcmVuZGVyZWRIZWlnaHQ7XG4gICAgICBjb25zdCBvdmVyc2l6ZWRXaWR0aCA9IGludHJpbnNpY1dpZHRoIC0gcmVjb21tZW5kZWRXaWR0aCA+PSBPVkVSU0laRURfSU1BR0VfVE9MRVJBTkNFO1xuICAgICAgY29uc3Qgb3ZlcnNpemVkSGVpZ2h0ID0gaW50cmluc2ljSGVpZ2h0IC0gcmVjb21tZW5kZWRIZWlnaHQgPj0gT1ZFUlNJWkVEX0lNQUdFX1RPTEVSQU5DRTtcbiAgICAgIGlmIChvdmVyc2l6ZWRXaWR0aCB8fCBvdmVyc2l6ZWRIZWlnaHQpIHtcbiAgICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAgIGZvcm1hdFJ1bnRpbWVFcnJvcihcbiAgICAgICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuT1ZFUlNJWkVEX0lNQUdFLFxuICAgICAgICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIubmdTcmMpfSB0aGUgaW50cmluc2ljIGltYWdlIGlzIHNpZ25pZmljYW50bHkgYCArXG4gICAgICAgICAgICAgIGBsYXJnZXIgdGhhbiBuZWNlc3NhcnkuIGAgK1xuICAgICAgICAgICAgICBgXFxuUmVuZGVyZWQgaW1hZ2Ugc2l6ZTogJHtyZW5kZXJlZFdpZHRofXcgeCAke3JlbmRlcmVkSGVpZ2h0fWguIGAgK1xuICAgICAgICAgICAgICBgXFxuSW50cmluc2ljIGltYWdlIHNpemU6ICR7aW50cmluc2ljV2lkdGh9dyB4ICR7aW50cmluc2ljSGVpZ2h0fWguIGAgK1xuICAgICAgICAgICAgICBgXFxuUmVjb21tZW5kZWQgaW50cmluc2ljIGltYWdlIHNpemU6ICR7cmVjb21tZW5kZWRXaWR0aH13IHggJHtyZWNvbW1lbmRlZEhlaWdodH1oLiBgICtcbiAgICAgICAgICAgICAgYFxcbk5vdGU6IFJlY29tbWVuZGVkIGludHJpbnNpYyBpbWFnZSBzaXplIGlzIGNhbGN1bGF0ZWQgYXNzdW1pbmcgYSBtYXhpbXVtIERQUiBvZiBgICtcbiAgICAgICAgICAgICAgYCR7UkVDT01NRU5ERURfU1JDU0VUX0RFTlNJVFlfQ0FQfS4gVG8gaW1wcm92ZSBsb2FkaW5nIHRpbWUsIHJlc2l6ZSB0aGUgaW1hZ2UgYCArXG4gICAgICAgICAgICAgIGBvciBjb25zaWRlciB1c2luZyB0aGUgXCJuZ1NyY3NldFwiIGFuZCBcInNpemVzXCIgYXR0cmlidXRlcy5gLFxuICAgICAgICAgICksXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIGNvbnN0IHJlbW92ZUxvYWRMaXN0ZW5lckZuID0gcmVuZGVyZXIubGlzdGVuKGltZywgJ2xvYWQnLCBjYWxsYmFjayk7XG5cbiAgLy8gV2Ugb25seSBsaXN0ZW4gdG8gdGhlIGBlcnJvcmAgZXZlbnQgdG8gcmVtb3ZlIHRoZSBgbG9hZGAgZXZlbnQgbGlzdGVuZXIgYmVjYXVzZSBpdCB3aWxsIG5vdCBiZVxuICAvLyBmaXJlZCBpZiB0aGUgaW1hZ2UgZmFpbHMgdG8gbG9hZC4gVGhpcyBpcyBkb25lIHRvIHByZXZlbnQgbWVtb3J5IGxlYWtzIGluIGRldmVsb3BtZW50IG1vZGVcbiAgLy8gYmVjYXVzZSBpbWFnZSBlbGVtZW50cyBhcmVuJ3QgZ2FyYmFnZS1jb2xsZWN0ZWQgcHJvcGVybHkuIEl0IGhhcHBlbnMgYmVjYXVzZSB6b25lLmpzIHN0b3JlcyB0aGVcbiAgLy8gZXZlbnQgbGlzdGVuZXIgZGlyZWN0bHkgb24gdGhlIGVsZW1lbnQgYW5kIGNsb3N1cmVzIGNhcHR1cmUgYGRpcmAuXG4gIGNvbnN0IHJlbW92ZUVycm9yTGlzdGVuZXJGbiA9IHJlbmRlcmVyLmxpc3RlbihpbWcsICdlcnJvcicsICgpID0+IHtcbiAgICByZW1vdmVMb2FkTGlzdGVuZXJGbigpO1xuICAgIHJlbW92ZUVycm9yTGlzdGVuZXJGbigpO1xuICB9KTtcblxuICBjYWxsT25Mb2FkSWZJbWFnZUlzTG9hZGVkKGltZywgY2FsbGJhY2spO1xufVxuXG4vKipcbiAqIFZlcmlmaWVzIHRoYXQgYSBzcGVjaWZpZWQgaW5wdXQgaXMgc2V0LlxuICovXG5mdW5jdGlvbiBhc3NlcnROb25FbXB0eVdpZHRoQW5kSGVpZ2h0KGRpcjogTmdPcHRpbWl6ZWRJbWFnZSkge1xuICBsZXQgbWlzc2luZ0F0dHJpYnV0ZXMgPSBbXTtcbiAgaWYgKGRpci53aWR0aCA9PT0gdW5kZWZpbmVkKSBtaXNzaW5nQXR0cmlidXRlcy5wdXNoKCd3aWR0aCcpO1xuICBpZiAoZGlyLmhlaWdodCA9PT0gdW5kZWZpbmVkKSBtaXNzaW5nQXR0cmlidXRlcy5wdXNoKCdoZWlnaHQnKTtcbiAgaWYgKG1pc3NpbmdBdHRyaWJ1dGVzLmxlbmd0aCA+IDApIHtcbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgUnVudGltZUVycm9yQ29kZS5SRVFVSVJFRF9JTlBVVF9NSVNTSU5HLFxuICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIubmdTcmMpfSB0aGVzZSByZXF1aXJlZCBhdHRyaWJ1dGVzIGAgK1xuICAgICAgICBgYXJlIG1pc3Npbmc6ICR7bWlzc2luZ0F0dHJpYnV0ZXMubWFwKChhdHRyKSA9PiBgXCIke2F0dHJ9XCJgKS5qb2luKCcsICcpfS4gYCArXG4gICAgICAgIGBJbmNsdWRpbmcgXCJ3aWR0aFwiIGFuZCBcImhlaWdodFwiIGF0dHJpYnV0ZXMgd2lsbCBwcmV2ZW50IGltYWdlLXJlbGF0ZWQgbGF5b3V0IHNoaWZ0cy4gYCArXG4gICAgICAgIGBUbyBmaXggdGhpcywgaW5jbHVkZSBcIndpZHRoXCIgYW5kIFwiaGVpZ2h0XCIgYXR0cmlidXRlcyBvbiB0aGUgaW1hZ2UgdGFnIG9yIHR1cm4gb24gYCArXG4gICAgICAgIGBcImZpbGxcIiBtb2RlIHdpdGggdGhlIFxcYGZpbGxcXGAgYXR0cmlidXRlLmAsXG4gICAgKTtcbiAgfVxufVxuXG4vKipcbiAqIFZlcmlmaWVzIHRoYXQgd2lkdGggYW5kIGhlaWdodCBhcmUgbm90IHNldC4gVXNlZCBpbiBmaWxsIG1vZGUsIHdoZXJlIHRob3NlIGF0dHJpYnV0ZXMgZG9uJ3QgbWFrZVxuICogc2Vuc2UuXG4gKi9cbmZ1bmN0aW9uIGFzc2VydEVtcHR5V2lkdGhBbmRIZWlnaHQoZGlyOiBOZ09wdGltaXplZEltYWdlKSB7XG4gIGlmIChkaXIud2lkdGggfHwgZGlyLmhlaWdodCkge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfSU5QVVQsXG4gICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5uZ1NyYyl9IHRoZSBhdHRyaWJ1dGVzIFxcYGhlaWdodFxcYCBhbmQvb3IgXFxgd2lkdGhcXGAgYXJlIHByZXNlbnQgYCArXG4gICAgICAgIGBhbG9uZyB3aXRoIHRoZSBcXGBmaWxsXFxgIGF0dHJpYnV0ZS4gQmVjYXVzZSBcXGBmaWxsXFxgIG1vZGUgY2F1c2VzIGFuIGltYWdlIHRvIGZpbGwgaXRzIGNvbnRhaW5pbmcgYCArXG4gICAgICAgIGBlbGVtZW50LCB0aGUgc2l6ZSBhdHRyaWJ1dGVzIGhhdmUgbm8gZWZmZWN0IGFuZCBzaG91bGQgYmUgcmVtb3ZlZC5gLFxuICAgICk7XG4gIH1cbn1cblxuLyoqXG4gKiBWZXJpZmllcyB0aGF0IHRoZSByZW5kZXJlZCBpbWFnZSBoYXMgYSBub256ZXJvIGhlaWdodC4gSWYgdGhlIGltYWdlIGlzIGluIGZpbGwgbW9kZSwgcHJvdmlkZXNcbiAqIGd1aWRhbmNlIHRoYXQgdGhpcyBjYW4gYmUgY2F1c2VkIGJ5IHRoZSBjb250YWluaW5nIGVsZW1lbnQncyBDU1MgcG9zaXRpb24gcHJvcGVydHkuXG4gKi9cbmZ1bmN0aW9uIGFzc2VydE5vblplcm9SZW5kZXJlZEhlaWdodChcbiAgZGlyOiBOZ09wdGltaXplZEltYWdlLFxuICBpbWc6IEhUTUxJbWFnZUVsZW1lbnQsXG4gIHJlbmRlcmVyOiBSZW5kZXJlcjIsXG4pIHtcbiAgY29uc3QgY2FsbGJhY2sgPSAoKSA9PiB7XG4gICAgcmVtb3ZlTG9hZExpc3RlbmVyRm4oKTtcbiAgICByZW1vdmVFcnJvckxpc3RlbmVyRm4oKTtcbiAgICBjb25zdCByZW5kZXJlZEhlaWdodCA9IGltZy5jbGllbnRIZWlnaHQ7XG4gICAgaWYgKGRpci5maWxsICYmIHJlbmRlcmVkSGVpZ2h0ID09PSAwKSB7XG4gICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgIGZvcm1hdFJ1bnRpbWVFcnJvcihcbiAgICAgICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfSU5QVVQsXG4gICAgICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIubmdTcmMpfSB0aGUgaGVpZ2h0IG9mIHRoZSBmaWxsLW1vZGUgaW1hZ2UgaXMgemVyby4gYCArXG4gICAgICAgICAgICBgVGhpcyBpcyBsaWtlbHkgYmVjYXVzZSB0aGUgY29udGFpbmluZyBlbGVtZW50IGRvZXMgbm90IGhhdmUgdGhlIENTUyAncG9zaXRpb24nIGAgK1xuICAgICAgICAgICAgYHByb3BlcnR5IHNldCB0byBvbmUgb2YgdGhlIGZvbGxvd2luZzogXCJyZWxhdGl2ZVwiLCBcImZpeGVkXCIsIG9yIFwiYWJzb2x1dGVcIi4gYCArXG4gICAgICAgICAgICBgVG8gZml4IHRoaXMgcHJvYmxlbSwgbWFrZSBzdXJlIHRoZSBjb250YWluZXIgZWxlbWVudCBoYXMgdGhlIENTUyAncG9zaXRpb24nIGAgK1xuICAgICAgICAgICAgYHByb3BlcnR5IGRlZmluZWQgYW5kIHRoZSBoZWlnaHQgb2YgdGhlIGVsZW1lbnQgaXMgbm90IHplcm8uYCxcbiAgICAgICAgKSxcbiAgICAgICk7XG4gICAgfVxuICB9O1xuXG4gIGNvbnN0IHJlbW92ZUxvYWRMaXN0ZW5lckZuID0gcmVuZGVyZXIubGlzdGVuKGltZywgJ2xvYWQnLCBjYWxsYmFjayk7XG5cbiAgLy8gU2VlIGNvbW1lbnRzIGluIHRoZSBgYXNzZXJ0Tm9JbWFnZURpc3RvcnRpb25gLlxuICBjb25zdCByZW1vdmVFcnJvckxpc3RlbmVyRm4gPSByZW5kZXJlci5saXN0ZW4oaW1nLCAnZXJyb3InLCAoKSA9PiB7XG4gICAgcmVtb3ZlTG9hZExpc3RlbmVyRm4oKTtcbiAgICByZW1vdmVFcnJvckxpc3RlbmVyRm4oKTtcbiAgfSk7XG5cbiAgY2FsbE9uTG9hZElmSW1hZ2VJc0xvYWRlZChpbWcsIGNhbGxiYWNrKTtcbn1cblxuLyoqXG4gKiBWZXJpZmllcyB0aGF0IHRoZSBgbG9hZGluZ2AgYXR0cmlidXRlIGlzIHNldCB0byBhIHZhbGlkIGlucHV0ICZcbiAqIGlzIG5vdCB1c2VkIG9uIHByaW9yaXR5IGltYWdlcy5cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0VmFsaWRMb2FkaW5nSW5wdXQoZGlyOiBOZ09wdGltaXplZEltYWdlKSB7XG4gIGlmIChkaXIubG9hZGluZyAmJiBkaXIucHJpb3JpdHkpIHtcbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX0lOUFVULFxuICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIubmdTcmMpfSB0aGUgXFxgbG9hZGluZ1xcYCBhdHRyaWJ1dGUgYCArXG4gICAgICAgIGB3YXMgdXNlZCBvbiBhbiBpbWFnZSB0aGF0IHdhcyBtYXJrZWQgXCJwcmlvcml0eVwiLiBgICtcbiAgICAgICAgYFNldHRpbmcgXFxgbG9hZGluZ1xcYCBvbiBwcmlvcml0eSBpbWFnZXMgaXMgbm90IGFsbG93ZWQgYCArXG4gICAgICAgIGBiZWNhdXNlIHRoZXNlIGltYWdlcyB3aWxsIGFsd2F5cyBiZSBlYWdlcmx5IGxvYWRlZC4gYCArXG4gICAgICAgIGBUbyBmaXggdGhpcywgcmVtb3ZlIHRoZSDigJxsb2FkaW5n4oCdIGF0dHJpYnV0ZSBmcm9tIHRoZSBwcmlvcml0eSBpbWFnZS5gLFxuICAgICk7XG4gIH1cbiAgY29uc3QgdmFsaWRJbnB1dHMgPSBbJ2F1dG8nLCAnZWFnZXInLCAnbGF6eSddO1xuICBpZiAodHlwZW9mIGRpci5sb2FkaW5nID09PSAnc3RyaW5nJyAmJiAhdmFsaWRJbnB1dHMuaW5jbHVkZXMoZGlyLmxvYWRpbmcpKSB7XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoZGlyLm5nU3JjKX0gdGhlIFxcYGxvYWRpbmdcXGAgYXR0cmlidXRlIGAgK1xuICAgICAgICBgaGFzIGFuIGludmFsaWQgdmFsdWUgKFxcYCR7ZGlyLmxvYWRpbmd9XFxgKS4gYCArXG4gICAgICAgIGBUbyBmaXggdGhpcywgcHJvdmlkZSBhIHZhbGlkIHZhbHVlIChcImxhenlcIiwgXCJlYWdlclwiLCBvciBcImF1dG9cIikuYCxcbiAgICApO1xuICB9XG59XG5cbi8qKlxuICogV2FybnMgaWYgTk9UIHVzaW5nIGEgbG9hZGVyIChmYWxsaW5nIGJhY2sgdG8gdGhlIGdlbmVyaWMgbG9hZGVyKSBhbmRcbiAqIHRoZSBpbWFnZSBhcHBlYXJzIHRvIGJlIGhvc3RlZCBvbiBvbmUgb2YgdGhlIGltYWdlIENETnMgZm9yIHdoaWNoXG4gKiB3ZSBkbyBoYXZlIGEgYnVpbHQtaW4gaW1hZ2UgbG9hZGVyLiBTdWdnZXN0cyBzd2l0Y2hpbmcgdG8gdGhlXG4gKiBidWlsdC1pbiBsb2FkZXIuXG4gKlxuICogQHBhcmFtIG5nU3JjIFZhbHVlIG9mIHRoZSBuZ1NyYyBhdHRyaWJ1dGVcbiAqIEBwYXJhbSBpbWFnZUxvYWRlciBJbWFnZUxvYWRlciBwcm92aWRlZFxuICovXG5mdW5jdGlvbiBhc3NlcnROb3RNaXNzaW5nQnVpbHRJbkxvYWRlcihuZ1NyYzogc3RyaW5nLCBpbWFnZUxvYWRlcjogSW1hZ2VMb2FkZXIpIHtcbiAgaWYgKGltYWdlTG9hZGVyID09PSBub29wSW1hZ2VMb2FkZXIpIHtcbiAgICBsZXQgYnVpbHRJbkxvYWRlck5hbWUgPSAnJztcbiAgICBmb3IgKGNvbnN0IGxvYWRlciBvZiBCVUlMVF9JTl9MT0FERVJTKSB7XG4gICAgICBpZiAobG9hZGVyLnRlc3RVcmwobmdTcmMpKSB7XG4gICAgICAgIGJ1aWx0SW5Mb2FkZXJOYW1lID0gbG9hZGVyLm5hbWU7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoYnVpbHRJbkxvYWRlck5hbWUpIHtcbiAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgZm9ybWF0UnVudGltZUVycm9yKFxuICAgICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuTUlTU0lOR19CVUlMVElOX0xPQURFUixcbiAgICAgICAgICBgTmdPcHRpbWl6ZWRJbWFnZTogSXQgbG9va3MgbGlrZSB5b3VyIGltYWdlcyBtYXkgYmUgaG9zdGVkIG9uIHRoZSBgICtcbiAgICAgICAgICAgIGAke2J1aWx0SW5Mb2FkZXJOYW1lfSBDRE4sIGJ1dCB5b3VyIGFwcCBpcyBub3QgdXNpbmcgQW5ndWxhcidzIGAgK1xuICAgICAgICAgICAgYGJ1aWx0LWluIGxvYWRlciBmb3IgdGhhdCBDRE4uIFdlIHJlY29tbWVuZCBzd2l0Y2hpbmcgdG8gdXNlIGAgK1xuICAgICAgICAgICAgYHRoZSBidWlsdC1pbiBieSBjYWxsaW5nIFxcYHByb3ZpZGUke2J1aWx0SW5Mb2FkZXJOYW1lfUxvYWRlcigpXFxgIGAgK1xuICAgICAgICAgICAgYGluIHlvdXIgXFxgcHJvdmlkZXJzXFxgIGFuZCBwYXNzaW5nIGl0IHlvdXIgaW5zdGFuY2UncyBiYXNlIFVSTC4gYCArXG4gICAgICAgICAgICBgSWYgeW91IGRvbid0IHdhbnQgdG8gdXNlIHRoZSBidWlsdC1pbiBsb2FkZXIsIGRlZmluZSBhIGN1c3RvbSBgICtcbiAgICAgICAgICAgIGBsb2FkZXIgZnVuY3Rpb24gdXNpbmcgSU1BR0VfTE9BREVSIHRvIHNpbGVuY2UgdGhpcyB3YXJuaW5nLmAsXG4gICAgICAgICksXG4gICAgICApO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIFdhcm5zIGlmIG5nU3Jjc2V0IGlzIHByZXNlbnQgYW5kIG5vIGxvYWRlciBpcyBjb25maWd1cmVkIChpLmUuIHRoZSBkZWZhdWx0IG9uZSBpcyBiZWluZyB1c2VkKS5cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0Tm9OZ1NyY3NldFdpdGhvdXRMb2FkZXIoZGlyOiBOZ09wdGltaXplZEltYWdlLCBpbWFnZUxvYWRlcjogSW1hZ2VMb2FkZXIpIHtcbiAgaWYgKGRpci5uZ1NyY3NldCAmJiBpbWFnZUxvYWRlciA9PT0gbm9vcEltYWdlTG9hZGVyKSB7XG4gICAgY29uc29sZS53YXJuKFxuICAgICAgZm9ybWF0UnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLk1JU1NJTkdfTkVDRVNTQVJZX0xPQURFUixcbiAgICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIubmdTcmMpfSB0aGUgXFxgbmdTcmNzZXRcXGAgYXR0cmlidXRlIGlzIHByZXNlbnQgYnV0IGAgK1xuICAgICAgICAgIGBubyBpbWFnZSBsb2FkZXIgaXMgY29uZmlndXJlZCAoaS5lLiB0aGUgZGVmYXVsdCBvbmUgaXMgYmVpbmcgdXNlZCksIGAgK1xuICAgICAgICAgIGB3aGljaCB3b3VsZCByZXN1bHQgaW4gdGhlIHNhbWUgaW1hZ2UgYmVpbmcgdXNlZCBmb3IgYWxsIGNvbmZpZ3VyZWQgc2l6ZXMuIGAgK1xuICAgICAgICAgIGBUbyBmaXggdGhpcywgcHJvdmlkZSBhIGxvYWRlciBvciByZW1vdmUgdGhlIFxcYG5nU3Jjc2V0XFxgIGF0dHJpYnV0ZSBmcm9tIHRoZSBpbWFnZS5gLFxuICAgICAgKSxcbiAgICApO1xuICB9XG59XG5cbi8qKlxuICogV2FybnMgaWYgbG9hZGVyUGFyYW1zIGlzIHByZXNlbnQgYW5kIG5vIGxvYWRlciBpcyBjb25maWd1cmVkIChpLmUuIHRoZSBkZWZhdWx0IG9uZSBpcyBiZWluZ1xuICogdXNlZCkuXG4gKi9cbmZ1bmN0aW9uIGFzc2VydE5vTG9hZGVyUGFyYW1zV2l0aG91dExvYWRlcihkaXI6IE5nT3B0aW1pemVkSW1hZ2UsIGltYWdlTG9hZGVyOiBJbWFnZUxvYWRlcikge1xuICBpZiAoZGlyLmxvYWRlclBhcmFtcyAmJiBpbWFnZUxvYWRlciA9PT0gbm9vcEltYWdlTG9hZGVyKSB7XG4gICAgY29uc29sZS53YXJuKFxuICAgICAgZm9ybWF0UnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLk1JU1NJTkdfTkVDRVNTQVJZX0xPQURFUixcbiAgICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIubmdTcmMpfSB0aGUgXFxgbG9hZGVyUGFyYW1zXFxgIGF0dHJpYnV0ZSBpcyBwcmVzZW50IGJ1dCBgICtcbiAgICAgICAgICBgbm8gaW1hZ2UgbG9hZGVyIGlzIGNvbmZpZ3VyZWQgKGkuZS4gdGhlIGRlZmF1bHQgb25lIGlzIGJlaW5nIHVzZWQpLCBgICtcbiAgICAgICAgICBgd2hpY2ggbWVhbnMgdGhhdCB0aGUgbG9hZGVyUGFyYW1zIGRhdGEgd2lsbCBub3QgYmUgY29uc3VtZWQgYW5kIHdpbGwgbm90IGFmZmVjdCB0aGUgVVJMLiBgICtcbiAgICAgICAgICBgVG8gZml4IHRoaXMsIHByb3ZpZGUgYSBjdXN0b20gbG9hZGVyIG9yIHJlbW92ZSB0aGUgXFxgbG9hZGVyUGFyYW1zXFxgIGF0dHJpYnV0ZSBmcm9tIHRoZSBpbWFnZS5gLFxuICAgICAgKSxcbiAgICApO1xuICB9XG59XG5cbi8qKlxuICogV2FybnMgaWYgdGhlIHByaW9yaXR5IGF0dHJpYnV0ZSBpcyB1c2VkIHRvbyBvZnRlbiBvbiBwYWdlIGxvYWRcbiAqL1xuYXN5bmMgZnVuY3Rpb24gYXNzZXRQcmlvcml0eUNvdW50QmVsb3dUaHJlc2hvbGQoYXBwUmVmOiBBcHBsaWNhdGlvblJlZikge1xuICBpZiAoSU1HU19XSVRIX1BSSU9SSVRZX0FUVFJfQ09VTlQgPT09IDApIHtcbiAgICBJTUdTX1dJVEhfUFJJT1JJVFlfQVRUUl9DT1VOVCsrO1xuICAgIGF3YWl0IHdoZW5TdGFibGUoYXBwUmVmKTtcbiAgICBpZiAoSU1HU19XSVRIX1BSSU9SSVRZX0FUVFJfQ09VTlQgPiBQUklPUklUWV9DT1VOVF9USFJFU0hPTEQpIHtcbiAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgZm9ybWF0UnVudGltZUVycm9yKFxuICAgICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuVE9PX01BTllfUFJJT1JJVFlfQVRUUklCVVRFUyxcbiAgICAgICAgICBgTmdPcHRpbWl6ZWRJbWFnZTogVGhlIFwicHJpb3JpdHlcIiBhdHRyaWJ1dGUgaXMgc2V0IHRvIHRydWUgbW9yZSB0aGFuICR7UFJJT1JJVFlfQ09VTlRfVEhSRVNIT0xEfSB0aW1lcyAoJHtJTUdTX1dJVEhfUFJJT1JJVFlfQVRUUl9DT1VOVH0gdGltZXMpLiBgICtcbiAgICAgICAgICAgIGBNYXJraW5nIHRvbyBtYW55IGltYWdlcyBhcyBcImhpZ2hcIiBwcmlvcml0eSBjYW4gaHVydCB5b3VyIGFwcGxpY2F0aW9uJ3MgTENQIChodHRwczovL3dlYi5kZXYvbGNwKS4gYCArXG4gICAgICAgICAgICBgXCJQcmlvcml0eVwiIHNob3VsZCBvbmx5IGJlIHNldCBvbiB0aGUgaW1hZ2UgZXhwZWN0ZWQgdG8gYmUgdGhlIHBhZ2UncyBMQ1AgZWxlbWVudC5gLFxuICAgICAgICApLFxuICAgICAgKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgSU1HU19XSVRIX1BSSU9SSVRZX0FUVFJfQ09VTlQrKztcbiAgfVxufVxuXG4vKipcbiAqIFdhcm5zIGlmIHBsYWNlaG9sZGVyJ3MgZGltZW5zaW9uIGFyZSBvdmVyIGEgdGhyZXNob2xkLlxuICpcbiAqIFRoaXMgYXNzZXJ0IGZ1bmN0aW9uIGlzIG1lYW50IHRvIG9ubHkgcnVuIG9uIHRoZSBicm93c2VyLlxuICovXG5mdW5jdGlvbiBhc3NlcnRQbGFjZWhvbGRlckRpbWVuc2lvbnMoZGlyOiBOZ09wdGltaXplZEltYWdlLCBpbWdFbGVtZW50OiBIVE1MSW1hZ2VFbGVtZW50KSB7XG4gIGNvbnN0IGNvbXB1dGVkU3R5bGUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShpbWdFbGVtZW50KTtcbiAgbGV0IHJlbmRlcmVkV2lkdGggPSBwYXJzZUZsb2F0KGNvbXB1dGVkU3R5bGUuZ2V0UHJvcGVydHlWYWx1ZSgnd2lkdGgnKSk7XG4gIGxldCByZW5kZXJlZEhlaWdodCA9IHBhcnNlRmxvYXQoY29tcHV0ZWRTdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKCdoZWlnaHQnKSk7XG5cbiAgaWYgKHJlbmRlcmVkV2lkdGggPiBQTEFDRUhPTERFUl9ESU1FTlNJT05fTElNSVQgfHwgcmVuZGVyZWRIZWlnaHQgPiBQTEFDRUhPTERFUl9ESU1FTlNJT05fTElNSVQpIHtcbiAgICBjb25zb2xlLndhcm4oXG4gICAgICBmb3JtYXRSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuUExBQ0VIT0xERVJfRElNRU5TSU9OX0xJTUlUX0VYQ0VFREVELFxuICAgICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5uZ1NyYyl9IGl0IHVzZXMgYSBwbGFjZWhvbGRlciBpbWFnZSwgYnV0IGF0IGxlYXN0IG9uZSBgICtcbiAgICAgICAgICBgb2YgdGhlIGRpbWVuc2lvbnMgYXR0cmlidXRlIChoZWlnaHQgb3Igd2lkdGgpIGV4Y2VlZHMgdGhlIGxpbWl0IG9mICR7UExBQ0VIT0xERVJfRElNRU5TSU9OX0xJTUlUfXB4LiBgICtcbiAgICAgICAgICBgVG8gZml4IHRoaXMsIHVzZSBhIHNtYWxsZXIgaW1hZ2UgYXMgYSBwbGFjZWhvbGRlci5gLFxuICAgICAgKSxcbiAgICApO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNhbGxPbkxvYWRJZkltYWdlSXNMb2FkZWQoaW1nOiBIVE1MSW1hZ2VFbGVtZW50LCBjYWxsYmFjazogVm9pZEZ1bmN0aW9uKTogdm9pZCB7XG4gIC8vIGh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL2VtYmVkZGVkLWNvbnRlbnQuaHRtbCNkb20taW1nLWNvbXBsZXRlXG4gIC8vIFRoZSBzcGVjIGRlZmluZXMgdGhhdCBgY29tcGxldGVgIGlzIHRydXRoeSBvbmNlIGl0cyByZXF1ZXN0IHN0YXRlIGlzIGZ1bGx5IGF2YWlsYWJsZS5cbiAgLy8gVGhlIGltYWdlIG1heSBhbHJlYWR5IGJlIGF2YWlsYWJsZSBpZiBpdOKAmXMgbG9hZGVkIGZyb20gdGhlIGJyb3dzZXIgY2FjaGUuXG4gIC8vIEluIHRoYXQgY2FzZSwgdGhlIGBsb2FkYCBldmVudCB3aWxsIG5vdCBmaXJlIGF0IGFsbCwgbWVhbmluZyB0aGF0IGFsbCBzZXR1cFxuICAvLyBjYWxsYmFja3MgbGlzdGVuaW5nIGZvciB0aGUgYGxvYWRgIGV2ZW50IHdpbGwgbm90IGJlIGludm9rZWQuXG4gIC8vIEluIFNhZmFyaSwgdGhlcmUgaXMgYSBrbm93biBiZWhhdmlvciB3aGVyZSB0aGUgYGNvbXBsZXRlYCBwcm9wZXJ0eSBvZiBhblxuICAvLyBgSFRNTEltYWdlRWxlbWVudGAgbWF5IHNvbWV0aW1lcyByZXR1cm4gYHRydWVgIGV2ZW4gd2hlbiB0aGUgaW1hZ2UgaXMgbm90IGZ1bGx5IGxvYWRlZC5cbiAgLy8gQ2hlY2tpbmcgYm90aCBgaW1nLmNvbXBsZXRlYCBhbmQgYGltZy5uYXR1cmFsV2lkdGhgIGlzIHRoZSBtb3N0IHJlbGlhYmxlIHdheSB0b1xuICAvLyBkZXRlcm1pbmUgaWYgYW4gaW1hZ2UgaGFzIGJlZW4gZnVsbHkgbG9hZGVkLCBlc3BlY2lhbGx5IGluIGJyb3dzZXJzIHdoZXJlIHRoZVxuICAvLyBgY29tcGxldGVgIHByb3BlcnR5IG1heSByZXR1cm4gYHRydWVgIHByZW1hdHVyZWx5LlxuICBpZiAoaW1nLmNvbXBsZXRlICYmIGltZy5uYXR1cmFsV2lkdGgpIHtcbiAgICBjYWxsYmFjaygpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHJvdW5kKGlucHV0OiBudW1iZXIpOiBudW1iZXIgfCBzdHJpbmcge1xuICByZXR1cm4gTnVtYmVyLmlzSW50ZWdlcihpbnB1dCkgPyBpbnB1dCA6IGlucHV0LnRvRml4ZWQoMik7XG59XG5cbi8vIFRyYW5zZm9ybSBmdW5jdGlvbiB0byBoYW5kbGUgU2FmZVZhbHVlIGlucHV0IGZvciBuZ1NyYy4gVGhpcyBkb2Vzbid0IGRvIGFueSBzYW5pdGl6YXRpb24sXG4vLyBhcyB0aGF0IGlzIG5vdCBuZWVkZWQgZm9yIGltZy5zcmMgYW5kIGltZy5zcmNzZXQuIFRoaXMgdHJhbnNmb3JtIGlzIHB1cmVseSBmb3IgY29tcGF0aWJpbGl0eS5cbmZ1bmN0aW9uIHVud3JhcFNhZmVVcmwodmFsdWU6IHN0cmluZyB8IFNhZmVWYWx1ZSk6IHN0cmluZyB7XG4gIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG4gIHJldHVybiB1bndyYXBTYWZlVmFsdWUodmFsdWUpO1xufVxuXG4vLyBUcmFuc2Zvcm0gZnVuY3Rpb24gdG8gaGFuZGxlIGlucHV0cyB3aGljaCBtYXkgYmUgYm9vbGVhbnMsIHN0cmluZ3MsIG9yIHN0cmluZyByZXByZXNlbnRhdGlvbnNcbi8vIG9mIGJvb2xlYW4gdmFsdWVzLiBVc2VkIGZvciB0aGUgcGxhY2Vob2xkZXIgYXR0cmlidXRlLlxuZXhwb3J0IGZ1bmN0aW9uIGJvb2xlYW5PclVybEF0dHJpYnV0ZSh2YWx1ZTogYm9vbGVhbiB8IHN0cmluZyk6IGJvb2xlYW4gfCBzdHJpbmcge1xuICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiB2YWx1ZSAhPT0gJ3RydWUnICYmIHZhbHVlICE9PSAnZmFsc2UnICYmIHZhbHVlICE9PSAnJykge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuICByZXR1cm4gYm9vbGVhbkF0dHJpYnV0ZSh2YWx1ZSk7XG59XG4iXX0=