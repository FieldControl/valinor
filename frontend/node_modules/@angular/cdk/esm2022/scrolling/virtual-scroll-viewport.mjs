/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directionality } from '@angular/cdk/bidi';
import { booleanAttribute, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, inject, Inject, Input, NgZone, Optional, Output, ViewChild, ViewEncapsulation, } from '@angular/core';
import { Platform } from '@angular/cdk/platform';
import { animationFrameScheduler, asapScheduler, Observable, Subject, Subscription, } from 'rxjs';
import { auditTime, startWith, takeUntil } from 'rxjs/operators';
import { ScrollDispatcher } from './scroll-dispatcher';
import { CdkScrollable } from './scrollable';
import { VIRTUAL_SCROLL_STRATEGY } from './virtual-scroll-strategy';
import { ViewportRuler } from './viewport-ruler';
import { CdkVirtualScrollable, VIRTUAL_SCROLLABLE } from './virtual-scrollable';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/bidi";
import * as i2 from "./scroll-dispatcher";
import * as i3 from "./viewport-ruler";
import * as i4 from "./virtual-scrollable";
/** Checks if the given ranges are equal. */
function rangesEqual(r1, r2) {
    return r1.start == r2.start && r1.end == r2.end;
}
/**
 * Scheduler to be used for scroll events. Needs to fall back to
 * something that doesn't rely on requestAnimationFrame on environments
 * that don't support it (e.g. server-side rendering).
 */
const SCROLL_SCHEDULER = typeof requestAnimationFrame !== 'undefined' ? animationFrameScheduler : asapScheduler;
/** A viewport that virtualizes its scrolling with the help of `CdkVirtualForOf`. */
export class CdkVirtualScrollViewport extends CdkVirtualScrollable {
    /** The direction the viewport scrolls. */
    get orientation() {
        return this._orientation;
    }
    set orientation(orientation) {
        if (this._orientation !== orientation) {
            this._orientation = orientation;
            this._calculateSpacerSize();
        }
    }
    constructor(elementRef, _changeDetectorRef, ngZone, _scrollStrategy, dir, scrollDispatcher, viewportRuler, scrollable) {
        super(elementRef, scrollDispatcher, ngZone, dir);
        this.elementRef = elementRef;
        this._changeDetectorRef = _changeDetectorRef;
        this._scrollStrategy = _scrollStrategy;
        this.scrollable = scrollable;
        this._platform = inject(Platform);
        /** Emits when the viewport is detached from a CdkVirtualForOf. */
        this._detachedSubject = new Subject();
        /** Emits when the rendered range changes. */
        this._renderedRangeSubject = new Subject();
        this._orientation = 'vertical';
        /**
         * Whether rendered items should persist in the DOM after scrolling out of view. By default, items
         * will be removed.
         */
        this.appendOnly = false;
        // Note: we don't use the typical EventEmitter here because we need to subscribe to the scroll
        // strategy lazily (i.e. only if the user is actually listening to the events). We do this because
        // depending on how the strategy calculates the scrolled index, it may come at a cost to
        // performance.
        /** Emits when the index of the first element visible in the viewport changes. */
        this.scrolledIndexChange = new Observable((observer) => this._scrollStrategy.scrolledIndexChange.subscribe(index => Promise.resolve().then(() => this.ngZone.run(() => observer.next(index)))));
        /** A stream that emits whenever the rendered range changes. */
        this.renderedRangeStream = this._renderedRangeSubject;
        /**
         * The total size of all content (in pixels), including content that is not currently rendered.
         */
        this._totalContentSize = 0;
        /** A string representing the `style.width` property value to be used for the spacer element. */
        this._totalContentWidth = '';
        /** A string representing the `style.height` property value to be used for the spacer element. */
        this._totalContentHeight = '';
        /** The currently rendered range of indices. */
        this._renderedRange = { start: 0, end: 0 };
        /** The length of the data bound to this viewport (in number of items). */
        this._dataLength = 0;
        /** The size of the viewport (in pixels). */
        this._viewportSize = 0;
        /** The last rendered content offset that was set. */
        this._renderedContentOffset = 0;
        /**
         * Whether the last rendered content offset was to the end of the content (and therefore needs to
         * be rewritten as an offset to the start of the content).
         */
        this._renderedContentOffsetNeedsRewrite = false;
        /** Whether there is a pending change detection cycle. */
        this._isChangeDetectionPending = false;
        /** A list of functions to run after the next change detection cycle. */
        this._runAfterChangeDetection = [];
        /** Subscription to changes in the viewport size. */
        this._viewportChanges = Subscription.EMPTY;
        if (!_scrollStrategy && (typeof ngDevMode === 'undefined' || ngDevMode)) {
            throw Error('Error: cdk-virtual-scroll-viewport requires the "itemSize" property to be set.');
        }
        this._viewportChanges = viewportRuler.change().subscribe(() => {
            this.checkViewportSize();
        });
        if (!this.scrollable) {
            // No scrollable is provided, so the virtual-scroll-viewport needs to become a scrollable
            this.elementRef.nativeElement.classList.add('cdk-virtual-scrollable');
            this.scrollable = this;
        }
    }
    ngOnInit() {
        // Scrolling depends on the element dimensions which we can't get during SSR.
        if (!this._platform.isBrowser) {
            return;
        }
        if (this.scrollable === this) {
            super.ngOnInit();
        }
        // It's still too early to measure the viewport at this point. Deferring with a promise allows
        // the Viewport to be rendered with the correct size before we measure. We run this outside the
        // zone to avoid causing more change detection cycles. We handle the change detection loop
        // ourselves instead.
        this.ngZone.runOutsideAngular(() => Promise.resolve().then(() => {
            this._measureViewportSize();
            this._scrollStrategy.attach(this);
            this.scrollable
                .elementScrolled()
                .pipe(
            // Start off with a fake scroll event so we properly detect our initial position.
            startWith(null), 
            // Collect multiple events into one until the next animation frame. This way if
            // there are multiple scroll events in the same frame we only need to recheck
            // our layout once.
            auditTime(0, SCROLL_SCHEDULER), 
            // Usually `elementScrolled` is completed when the scrollable is destroyed, but
            // that may not be the case if a `CdkVirtualScrollableElement` is used so we have
            // to unsubscribe here just in case.
            takeUntil(this._destroyed))
                .subscribe(() => this._scrollStrategy.onContentScrolled());
            this._markChangeDetectionNeeded();
        }));
    }
    ngOnDestroy() {
        this.detach();
        this._scrollStrategy.detach();
        // Complete all subjects
        this._renderedRangeSubject.complete();
        this._detachedSubject.complete();
        this._viewportChanges.unsubscribe();
        super.ngOnDestroy();
    }
    /** Attaches a `CdkVirtualScrollRepeater` to this viewport. */
    attach(forOf) {
        if (this._forOf && (typeof ngDevMode === 'undefined' || ngDevMode)) {
            throw Error('CdkVirtualScrollViewport is already attached.');
        }
        // Subscribe to the data stream of the CdkVirtualForOf to keep track of when the data length
        // changes. Run outside the zone to avoid triggering change detection, since we're managing the
        // change detection loop ourselves.
        this.ngZone.runOutsideAngular(() => {
            this._forOf = forOf;
            this._forOf.dataStream.pipe(takeUntil(this._detachedSubject)).subscribe(data => {
                const newLength = data.length;
                if (newLength !== this._dataLength) {
                    this._dataLength = newLength;
                    this._scrollStrategy.onDataLengthChanged();
                }
                this._doChangeDetection();
            });
        });
    }
    /** Detaches the current `CdkVirtualForOf`. */
    detach() {
        this._forOf = null;
        this._detachedSubject.next();
    }
    /** Gets the length of the data bound to this viewport (in number of items). */
    getDataLength() {
        return this._dataLength;
    }
    /** Gets the size of the viewport (in pixels). */
    getViewportSize() {
        return this._viewportSize;
    }
    // TODO(mmalerba): This is technically out of sync with what's really rendered until a render
    // cycle happens. I'm being careful to only call it after the render cycle is complete and before
    // setting it to something else, but its error prone and should probably be split into
    // `pendingRange` and `renderedRange`, the latter reflecting whats actually in the DOM.
    /** Get the current rendered range of items. */
    getRenderedRange() {
        return this._renderedRange;
    }
    measureBoundingClientRectWithScrollOffset(from) {
        return this.getElementRef().nativeElement.getBoundingClientRect()[from];
    }
    /**
     * Sets the total size of all content (in pixels), including content that is not currently
     * rendered.
     */
    setTotalContentSize(size) {
        if (this._totalContentSize !== size) {
            this._totalContentSize = size;
            this._calculateSpacerSize();
            this._markChangeDetectionNeeded();
        }
    }
    /** Sets the currently rendered range of indices. */
    setRenderedRange(range) {
        if (!rangesEqual(this._renderedRange, range)) {
            if (this.appendOnly) {
                range = { start: 0, end: Math.max(this._renderedRange.end, range.end) };
            }
            this._renderedRangeSubject.next((this._renderedRange = range));
            this._markChangeDetectionNeeded(() => this._scrollStrategy.onContentRendered());
        }
    }
    /**
     * Gets the offset from the start of the viewport to the start of the rendered data (in pixels).
     */
    getOffsetToRenderedContentStart() {
        return this._renderedContentOffsetNeedsRewrite ? null : this._renderedContentOffset;
    }
    /**
     * Sets the offset from the start of the viewport to either the start or end of the rendered data
     * (in pixels).
     */
    setRenderedContentOffset(offset, to = 'to-start') {
        // In appendOnly, we always start from the top
        offset = this.appendOnly && to === 'to-start' ? 0 : offset;
        // For a horizontal viewport in a right-to-left language we need to translate along the x-axis
        // in the negative direction.
        const isRtl = this.dir && this.dir.value == 'rtl';
        const isHorizontal = this.orientation == 'horizontal';
        const axis = isHorizontal ? 'X' : 'Y';
        const axisDirection = isHorizontal && isRtl ? -1 : 1;
        let transform = `translate${axis}(${Number(axisDirection * offset)}px)`;
        this._renderedContentOffset = offset;
        if (to === 'to-end') {
            transform += ` translate${axis}(-100%)`;
            // The viewport should rewrite this as a `to-start` offset on the next render cycle. Otherwise
            // elements will appear to expand in the wrong direction (e.g. `mat-expansion-panel` would
            // expand upward).
            this._renderedContentOffsetNeedsRewrite = true;
        }
        if (this._renderedContentTransform != transform) {
            // We know this value is safe because we parse `offset` with `Number()` before passing it
            // into the string.
            this._renderedContentTransform = transform;
            this._markChangeDetectionNeeded(() => {
                if (this._renderedContentOffsetNeedsRewrite) {
                    this._renderedContentOffset -= this.measureRenderedContentSize();
                    this._renderedContentOffsetNeedsRewrite = false;
                    this.setRenderedContentOffset(this._renderedContentOffset);
                }
                else {
                    this._scrollStrategy.onRenderedOffsetChanged();
                }
            });
        }
    }
    /**
     * Scrolls to the given offset from the start of the viewport. Please note that this is not always
     * the same as setting `scrollTop` or `scrollLeft`. In a horizontal viewport with right-to-left
     * direction, this would be the equivalent of setting a fictional `scrollRight` property.
     * @param offset The offset to scroll to.
     * @param behavior The ScrollBehavior to use when scrolling. Default is behavior is `auto`.
     */
    scrollToOffset(offset, behavior = 'auto') {
        const options = { behavior };
        if (this.orientation === 'horizontal') {
            options.start = offset;
        }
        else {
            options.top = offset;
        }
        this.scrollable.scrollTo(options);
    }
    /**
     * Scrolls to the offset for the given index.
     * @param index The index of the element to scroll to.
     * @param behavior The ScrollBehavior to use when scrolling. Default is behavior is `auto`.
     */
    scrollToIndex(index, behavior = 'auto') {
        this._scrollStrategy.scrollToIndex(index, behavior);
    }
    /**
     * Gets the current scroll offset from the start of the scrollable (in pixels).
     * @param from The edge to measure the offset from. Defaults to 'top' in vertical mode and 'start'
     *     in horizontal mode.
     */
    measureScrollOffset(from) {
        // This is to break the call cycle
        let measureScrollOffset;
        if (this.scrollable == this) {
            measureScrollOffset = (_from) => super.measureScrollOffset(_from);
        }
        else {
            measureScrollOffset = (_from) => this.scrollable.measureScrollOffset(_from);
        }
        return Math.max(0, measureScrollOffset(from ?? (this.orientation === 'horizontal' ? 'start' : 'top')) -
            this.measureViewportOffset());
    }
    /**
     * Measures the offset of the viewport from the scrolling container
     * @param from The edge to measure from.
     */
    measureViewportOffset(from) {
        let fromRect;
        const LEFT = 'left';
        const RIGHT = 'right';
        const isRtl = this.dir?.value == 'rtl';
        if (from == 'start') {
            fromRect = isRtl ? RIGHT : LEFT;
        }
        else if (from == 'end') {
            fromRect = isRtl ? LEFT : RIGHT;
        }
        else if (from) {
            fromRect = from;
        }
        else {
            fromRect = this.orientation === 'horizontal' ? 'left' : 'top';
        }
        const scrollerClientRect = this.scrollable.measureBoundingClientRectWithScrollOffset(fromRect);
        const viewportClientRect = this.elementRef.nativeElement.getBoundingClientRect()[fromRect];
        return viewportClientRect - scrollerClientRect;
    }
    /** Measure the combined size of all of the rendered items. */
    measureRenderedContentSize() {
        const contentEl = this._contentWrapper.nativeElement;
        return this.orientation === 'horizontal' ? contentEl.offsetWidth : contentEl.offsetHeight;
    }
    /**
     * Measure the total combined size of the given range. Throws if the range includes items that are
     * not rendered.
     */
    measureRangeSize(range) {
        if (!this._forOf) {
            return 0;
        }
        return this._forOf.measureRangeSize(range, this.orientation);
    }
    /** Update the viewport dimensions and re-render. */
    checkViewportSize() {
        // TODO: Cleanup later when add logic for handling content resize
        this._measureViewportSize();
        this._scrollStrategy.onDataLengthChanged();
    }
    /** Measure the viewport size. */
    _measureViewportSize() {
        this._viewportSize = this.scrollable.measureViewportSize(this.orientation);
    }
    /** Queue up change detection to run. */
    _markChangeDetectionNeeded(runAfter) {
        if (runAfter) {
            this._runAfterChangeDetection.push(runAfter);
        }
        // Use a Promise to batch together calls to `_doChangeDetection`. This way if we set a bunch of
        // properties sequentially we only have to run `_doChangeDetection` once at the end.
        if (!this._isChangeDetectionPending) {
            this._isChangeDetectionPending = true;
            this.ngZone.runOutsideAngular(() => Promise.resolve().then(() => {
                this._doChangeDetection();
            }));
        }
    }
    /** Run change detection. */
    _doChangeDetection() {
        this._isChangeDetectionPending = false;
        // Apply the content transform. The transform can't be set via an Angular binding because
        // bypassSecurityTrustStyle is banned in Google. However the value is safe, it's composed of
        // string literals, a variable that can only be 'X' or 'Y', and user input that is run through
        // the `Number` function first to coerce it to a numeric value.
        this._contentWrapper.nativeElement.style.transform = this._renderedContentTransform;
        // Apply changes to Angular bindings. Note: We must call `markForCheck` to run change detection
        // from the root, since the repeated items are content projected in. Calling `detectChanges`
        // instead does not properly check the projected content.
        this.ngZone.run(() => this._changeDetectorRef.markForCheck());
        const runAfterChangeDetection = this._runAfterChangeDetection;
        this._runAfterChangeDetection = [];
        for (const fn of runAfterChangeDetection) {
            fn();
        }
    }
    /** Calculates the `style.width` and `style.height` for the spacer element. */
    _calculateSpacerSize() {
        this._totalContentHeight =
            this.orientation === 'horizontal' ? '' : `${this._totalContentSize}px`;
        this._totalContentWidth =
            this.orientation === 'horizontal' ? `${this._totalContentSize}px` : '';
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.2.0", ngImport: i0, type: CdkVirtualScrollViewport, deps: [{ token: i0.ElementRef }, { token: i0.ChangeDetectorRef }, { token: i0.NgZone }, { token: VIRTUAL_SCROLL_STRATEGY, optional: true }, { token: i1.Directionality, optional: true }, { token: i2.ScrollDispatcher }, { token: i3.ViewportRuler }, { token: VIRTUAL_SCROLLABLE, optional: true }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "16.1.0", version: "17.2.0", type: CdkVirtualScrollViewport, isStandalone: true, selector: "cdk-virtual-scroll-viewport", inputs: { orientation: "orientation", appendOnly: ["appendOnly", "appendOnly", booleanAttribute] }, outputs: { scrolledIndexChange: "scrolledIndexChange" }, host: { properties: { "class.cdk-virtual-scroll-orientation-horizontal": "orientation === \"horizontal\"", "class.cdk-virtual-scroll-orientation-vertical": "orientation !== \"horizontal\"" }, classAttribute: "cdk-virtual-scroll-viewport" }, providers: [
            {
                provide: CdkScrollable,
                useFactory: (virtualScrollable, viewport) => virtualScrollable || viewport,
                deps: [[new Optional(), new Inject(VIRTUAL_SCROLLABLE)], CdkVirtualScrollViewport],
            },
        ], viewQueries: [{ propertyName: "_contentWrapper", first: true, predicate: ["contentWrapper"], descendants: true, static: true }], usesInheritance: true, ngImport: i0, template: "<!--\n  Wrap the rendered content in an element that will be used to offset it based on the scroll\n  position.\n-->\n<div #contentWrapper class=\"cdk-virtual-scroll-content-wrapper\">\n  <ng-content></ng-content>\n</div>\n<!--\n  Spacer used to force the scrolling container to the correct size for the *total* number of items\n  so that the scrollbar captures the size of the entire data set.\n-->\n<div class=\"cdk-virtual-scroll-spacer\"\n     [style.width]=\"_totalContentWidth\" [style.height]=\"_totalContentHeight\"></div>\n", styles: ["cdk-virtual-scroll-viewport{display:block;position:relative;transform:translateZ(0)}.cdk-virtual-scrollable{overflow:auto;will-change:scroll-position;contain:strict;-webkit-overflow-scrolling:touch}.cdk-virtual-scroll-content-wrapper{position:absolute;top:0;left:0;contain:content}[dir=rtl] .cdk-virtual-scroll-content-wrapper{right:0;left:auto}.cdk-virtual-scroll-orientation-horizontal .cdk-virtual-scroll-content-wrapper{min-height:100%}.cdk-virtual-scroll-orientation-horizontal .cdk-virtual-scroll-content-wrapper>dl:not([cdkVirtualFor]),.cdk-virtual-scroll-orientation-horizontal .cdk-virtual-scroll-content-wrapper>ol:not([cdkVirtualFor]),.cdk-virtual-scroll-orientation-horizontal .cdk-virtual-scroll-content-wrapper>table:not([cdkVirtualFor]),.cdk-virtual-scroll-orientation-horizontal .cdk-virtual-scroll-content-wrapper>ul:not([cdkVirtualFor]){padding-left:0;padding-right:0;margin-left:0;margin-right:0;border-left-width:0;border-right-width:0;outline:none}.cdk-virtual-scroll-orientation-vertical .cdk-virtual-scroll-content-wrapper{min-width:100%}.cdk-virtual-scroll-orientation-vertical .cdk-virtual-scroll-content-wrapper>dl:not([cdkVirtualFor]),.cdk-virtual-scroll-orientation-vertical .cdk-virtual-scroll-content-wrapper>ol:not([cdkVirtualFor]),.cdk-virtual-scroll-orientation-vertical .cdk-virtual-scroll-content-wrapper>table:not([cdkVirtualFor]),.cdk-virtual-scroll-orientation-vertical .cdk-virtual-scroll-content-wrapper>ul:not([cdkVirtualFor]){padding-top:0;padding-bottom:0;margin-top:0;margin-bottom:0;border-top-width:0;border-bottom-width:0;outline:none}.cdk-virtual-scroll-spacer{height:1px;transform-origin:0 0;flex:0 0 auto}[dir=rtl] .cdk-virtual-scroll-spacer{transform-origin:100% 0}"], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.2.0", ngImport: i0, type: CdkVirtualScrollViewport, decorators: [{
            type: Component,
            args: [{ selector: 'cdk-virtual-scroll-viewport', host: {
                        'class': 'cdk-virtual-scroll-viewport',
                        '[class.cdk-virtual-scroll-orientation-horizontal]': 'orientation === "horizontal"',
                        '[class.cdk-virtual-scroll-orientation-vertical]': 'orientation !== "horizontal"',
                    }, encapsulation: ViewEncapsulation.None, changeDetection: ChangeDetectionStrategy.OnPush, standalone: true, providers: [
                        {
                            provide: CdkScrollable,
                            useFactory: (virtualScrollable, viewport) => virtualScrollable || viewport,
                            deps: [[new Optional(), new Inject(VIRTUAL_SCROLLABLE)], CdkVirtualScrollViewport],
                        },
                    ], template: "<!--\n  Wrap the rendered content in an element that will be used to offset it based on the scroll\n  position.\n-->\n<div #contentWrapper class=\"cdk-virtual-scroll-content-wrapper\">\n  <ng-content></ng-content>\n</div>\n<!--\n  Spacer used to force the scrolling container to the correct size for the *total* number of items\n  so that the scrollbar captures the size of the entire data set.\n-->\n<div class=\"cdk-virtual-scroll-spacer\"\n     [style.width]=\"_totalContentWidth\" [style.height]=\"_totalContentHeight\"></div>\n", styles: ["cdk-virtual-scroll-viewport{display:block;position:relative;transform:translateZ(0)}.cdk-virtual-scrollable{overflow:auto;will-change:scroll-position;contain:strict;-webkit-overflow-scrolling:touch}.cdk-virtual-scroll-content-wrapper{position:absolute;top:0;left:0;contain:content}[dir=rtl] .cdk-virtual-scroll-content-wrapper{right:0;left:auto}.cdk-virtual-scroll-orientation-horizontal .cdk-virtual-scroll-content-wrapper{min-height:100%}.cdk-virtual-scroll-orientation-horizontal .cdk-virtual-scroll-content-wrapper>dl:not([cdkVirtualFor]),.cdk-virtual-scroll-orientation-horizontal .cdk-virtual-scroll-content-wrapper>ol:not([cdkVirtualFor]),.cdk-virtual-scroll-orientation-horizontal .cdk-virtual-scroll-content-wrapper>table:not([cdkVirtualFor]),.cdk-virtual-scroll-orientation-horizontal .cdk-virtual-scroll-content-wrapper>ul:not([cdkVirtualFor]){padding-left:0;padding-right:0;margin-left:0;margin-right:0;border-left-width:0;border-right-width:0;outline:none}.cdk-virtual-scroll-orientation-vertical .cdk-virtual-scroll-content-wrapper{min-width:100%}.cdk-virtual-scroll-orientation-vertical .cdk-virtual-scroll-content-wrapper>dl:not([cdkVirtualFor]),.cdk-virtual-scroll-orientation-vertical .cdk-virtual-scroll-content-wrapper>ol:not([cdkVirtualFor]),.cdk-virtual-scroll-orientation-vertical .cdk-virtual-scroll-content-wrapper>table:not([cdkVirtualFor]),.cdk-virtual-scroll-orientation-vertical .cdk-virtual-scroll-content-wrapper>ul:not([cdkVirtualFor]){padding-top:0;padding-bottom:0;margin-top:0;margin-bottom:0;border-top-width:0;border-bottom-width:0;outline:none}.cdk-virtual-scroll-spacer{height:1px;transform-origin:0 0;flex:0 0 auto}[dir=rtl] .cdk-virtual-scroll-spacer{transform-origin:100% 0}"] }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: i0.ChangeDetectorRef }, { type: i0.NgZone }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [VIRTUAL_SCROLL_STRATEGY]
                }] }, { type: i1.Directionality, decorators: [{
                    type: Optional
                }] }, { type: i2.ScrollDispatcher }, { type: i3.ViewportRuler }, { type: i4.CdkVirtualScrollable, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [VIRTUAL_SCROLLABLE]
                }] }], propDecorators: { orientation: [{
                type: Input
            }], appendOnly: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], scrolledIndexChange: [{
                type: Output
            }], _contentWrapper: [{
                type: ViewChild,
                args: ['contentWrapper', { static: true }]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlydHVhbC1zY3JvbGwtdmlld3BvcnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL3Njcm9sbGluZy92aXJ0dWFsLXNjcm9sbC12aWV3cG9ydC50cyIsIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvc2Nyb2xsaW5nL3ZpcnR1YWwtc2Nyb2xsLXZpZXdwb3J0Lmh0bWwiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBRWpELE9BQU8sRUFDTCxnQkFBZ0IsRUFDaEIsdUJBQXVCLEVBQ3ZCLGlCQUFpQixFQUNqQixTQUFTLEVBQ1QsVUFBVSxFQUNWLE1BQU0sRUFDTixNQUFNLEVBQ04sS0FBSyxFQUNMLE1BQU0sRUFHTixRQUFRLEVBQ1IsTUFBTSxFQUNOLFNBQVMsRUFDVCxpQkFBaUIsR0FDbEIsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQy9DLE9BQU8sRUFDTCx1QkFBdUIsRUFDdkIsYUFBYSxFQUNiLFVBQVUsRUFDVixPQUFPLEVBRVAsWUFBWSxHQUNiLE1BQU0sTUFBTSxDQUFDO0FBQ2QsT0FBTyxFQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDL0QsT0FBTyxFQUFDLGdCQUFnQixFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDckQsT0FBTyxFQUFDLGFBQWEsRUFBMEIsTUFBTSxjQUFjLENBQUM7QUFDcEUsT0FBTyxFQUFDLHVCQUF1QixFQUF3QixNQUFNLDJCQUEyQixDQUFDO0FBQ3pGLE9BQU8sRUFBQyxhQUFhLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUUvQyxPQUFPLEVBQUMsb0JBQW9CLEVBQUUsa0JBQWtCLEVBQUMsTUFBTSxzQkFBc0IsQ0FBQzs7Ozs7O0FBRTlFLDRDQUE0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QUdSLFFBQVE7OzBCQUFJLE1BQU07MkJBQUMsa0JBQWtCO3lDQTdGcEMsV0FBVztzQkFEZCxLQUFLO2dCQWlCZ0MsVUFBVTtzQkFBL0MsS0FBSzt1QkFBQyxFQUFDLFNBQVMsRUFBRSxnQkFBZ0IsRUFBQztnQkFRM0IsbUJBQW1CO3NCQUQzQixNQUFNO2dCQVFzQyxlQUFlO3NCQUEzRCxTQUFTO3VCQUFDLGdCQUFnQixFQUFFLEVBQUMsTUFBTSxFQUFFLElBQUksRUFBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0RpcmVjdGlvbmFsaXR5fSBmcm9tICdAYW5ndWxhci9jZGsvYmlkaSc7XG5pbXBvcnQge0xpc3RSYW5nZX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvbGxlY3Rpb25zJztcbmltcG9ydCB7XG4gIGJvb2xlYW5BdHRyaWJ1dGUsXG4gIENoYW5nZURldGVjdGlvblN0cmF0ZWd5LFxuICBDaGFuZ2VEZXRlY3RvclJlZixcbiAgQ29tcG9uZW50LFxuICBFbGVtZW50UmVmLFxuICBpbmplY3QsXG4gIEluamVjdCxcbiAgSW5wdXQsXG4gIE5nWm9uZSxcbiAgT25EZXN0cm95LFxuICBPbkluaXQsXG4gIE9wdGlvbmFsLFxuICBPdXRwdXQsXG4gIFZpZXdDaGlsZCxcbiAgVmlld0VuY2Fwc3VsYXRpb24sXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtQbGF0Zm9ybX0gZnJvbSAnQGFuZ3VsYXIvY2RrL3BsYXRmb3JtJztcbmltcG9ydCB7XG4gIGFuaW1hdGlvbkZyYW1lU2NoZWR1bGVyLFxuICBhc2FwU2NoZWR1bGVyLFxuICBPYnNlcnZhYmxlLFxuICBTdWJqZWN0LFxuICBPYnNlcnZlcixcbiAgU3Vic2NyaXB0aW9uLFxufSBmcm9tICdyeGpzJztcbmltcG9ydCB7YXVkaXRUaW1lLCBzdGFydFdpdGgsIHRha2VVbnRpbH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0IHtTY3JvbGxEaXNwYXRjaGVyfSBmcm9tICcuL3Njcm9sbC1kaXNwYXRjaGVyJztcbmltcG9ydCB7Q2RrU2Nyb2xsYWJsZSwgRXh0ZW5kZWRTY3JvbGxUb09wdGlvbnN9IGZyb20gJy4vc2Nyb2xsYWJsZSc7XG5pbXBvcnQge1ZJUlRVQUxfU0NST0xMX1NUUkFURUdZLCBWaXJ0dWFsU2Nyb2xsU3RyYXRlZ3l9IGZyb20gJy4vdmlydHVhbC1zY3JvbGwtc3RyYXRlZ3knO1xuaW1wb3J0IHtWaWV3cG9ydFJ1bGVyfSBmcm9tICcuL3ZpZXdwb3J0LXJ1bGVyJztcbmltcG9ydCB7Q2RrVmlydHVhbFNjcm9sbFJlcGVhdGVyfSBmcm9tICcuL3ZpcnR1YWwtc2Nyb2xsLXJlcGVhdGVyJztcbmltcG9ydCB7Q2RrVmlydHVhbFNjcm9sbGFibGUsIFZJUlRVQUxfU0NST0xMQUJMRX0gZnJvbSAnLi92aXJ0dWFsLXNjcm9sbGFibGUnO1xuXG4vKiogQ2hlY2tzIGlmIHRoZSBnaXZlbiByYW5nZXMgYXJlIGVxdWFsLiAqL1xuZnVuY3Rpb24gcmFuZ2VzRXF1YWwocjE6IExpc3RSYW5nZSwgcjI6IExpc3RSYW5nZSk6IGJvb2xlYW4ge1xuICByZXR1cm4gcjEuc3RhcnQgPT0gcjIuc3RhcnQgJiYgcjEuZW5kID09IHIyLmVuZDtcbn1cblxuLyoqXG4gKiBTY2hlZHVsZXIgdG8gYmUgdXNlZCBmb3Igc2Nyb2xsIGV2ZW50cy4gTmVlZHMgdG8gZmFsbCBiYWNrIHRvXG4gKiBzb21ldGhpbmcgdGhhdCBkb2Vzbid0IHJlbHkgb24gcmVxdWVzdEFuaW1hdGlvbkZyYW1lIG9uIGVudmlyb25tZW50c1xuICogdGhhdCBkb24ndCBzdXBwb3J0IGl0IChlLmcuIHNlcnZlci1zaWRlIHJlbmRlcmluZykuXG4gKi9cbmNvbnN0IFNDUk9MTF9TQ0hFRFVMRVIgPVxuICB0eXBlb2YgcmVxdWVzdEFuaW1hdGlvbkZyYW1lICE9PSAndW5kZWZpbmVkJyA/IGFuaW1hdGlvbkZyYW1lU2NoZWR1bGVyIDogYXNhcFNjaGVkdWxlcjtcblxuLyoqIEEgdmlld3BvcnQgdGhhdCB2aXJ0dWFsaXplcyBpdHMgc2Nyb2xsaW5nIHdpdGggdGhlIGhlbHAgb2YgYENka1ZpcnR1YWxGb3JPZmAuICovXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdjZGstdmlydHVhbC1zY3JvbGwtdmlld3BvcnQnLFxuICB0ZW1wbGF0ZVVybDogJ3ZpcnR1YWwtc2Nyb2xsLXZpZXdwb3J0Lmh0bWwnLFxuICBzdHlsZVVybDogJ3ZpcnR1YWwtc2Nyb2xsLXZpZXdwb3J0LmNzcycsXG4gIGhvc3Q6IHtcbiAgICAnY2xhc3MnOiAnY2RrLXZpcnR1YWwtc2Nyb2xsLXZpZXdwb3J0JyxcbiAgICAnW2NsYXNzLmNkay12aXJ0dWFsLXNjcm9sbC1vcmllbnRhdGlvbi1ob3Jpem9udGFsXSc6ICdvcmllbnRhdGlvbiA9PT0gXCJob3Jpem9udGFsXCInLFxuICAgICdbY2xhc3MuY2RrLXZpcnR1YWwtc2Nyb2xsLW9yaWVudGF0aW9uLXZlcnRpY2FsXSc6ICdvcmllbnRhdGlvbiAhPT0gXCJob3Jpem9udGFsXCInLFxuICB9LFxuICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lLFxuICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5Lk9uUHVzaCxcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbiAgcHJvdmlkZXJzOiBbXG4gICAge1xuICAgICAgcHJvdmlkZTogQ2RrU2Nyb2xsYWJsZSxcbiAgICAgIHVzZUZhY3Rvcnk6IChcbiAgICAgICAgdmlydHVhbFNjcm9sbGFibGU6IENka1ZpcnR1YWxTY3JvbGxhYmxlIHwgbnVsbCxcbiAgICAgICAgdmlld3BvcnQ6IENka1ZpcnR1YWxTY3JvbGxWaWV3cG9ydCxcbiAgICAgICkgPT4gdmlydHVhbFNjcm9sbGFibGUgfHwgdmlld3BvcnQsXG4gICAgICBkZXBzOiBbW25ldyBPcHRpb25hbCgpLCBuZXcgSW5qZWN0KFZJUlRVQUxfU0NST0xMQUJMRSldLCBDZGtWaXJ0dWFsU2Nyb2xsVmlld3BvcnRdLFxuICAgIH0sXG4gIF0sXG59KVxuZXhwb3J0IGNsYXNzIENka1ZpcnR1YWxTY3JvbGxWaWV3cG9ydCBleHRlbmRzIENka1ZpcnR1YWxTY3JvbGxhYmxlIGltcGxlbWVudHMgT25Jbml0LCBPbkRlc3Ryb3kge1xuICBwcml2YXRlIF9wbGF0Zm9ybSA9IGluamVjdChQbGF0Zm9ybSk7XG5cbiAgLyoqIEVtaXRzIHdoZW4gdGhlIHZpZXdwb3J0IGlzIGRldGFjaGVkIGZyb20gYSBDZGtWaXJ0dWFsRm9yT2YuICovXG4gIHByaXZhdGUgcmVhZG9ubHkgX2RldGFjaGVkU3ViamVjdCA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XG5cbiAgLyoqIEVtaXRzIHdoZW4gdGhlIHJlbmRlcmVkIHJhbmdlIGNoYW5nZXMuICovXG4gIHByaXZhdGUgcmVhZG9ubHkgX3JlbmRlcmVkUmFuZ2VTdWJqZWN0ID0gbmV3IFN1YmplY3Q8TGlzdFJhbmdlPigpO1xuXG4gIC8qKiBUaGUgZGlyZWN0aW9uIHRoZSB2aWV3cG9ydCBzY3JvbGxzLiAqL1xuICBASW5wdXQoKVxuICBnZXQgb3JpZW50YXRpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuX29yaWVudGF0aW9uO1xuICB9XG5cbiAgc2V0IG9yaWVudGF0aW9uKG9yaWVudGF0aW9uOiAnaG9yaXpvbnRhbCcgfCAndmVydGljYWwnKSB7XG4gICAgaWYgKHRoaXMuX29yaWVudGF0aW9uICE9PSBvcmllbnRhdGlvbikge1xuICAgICAgdGhpcy5fb3JpZW50YXRpb24gPSBvcmllbnRhdGlvbjtcbiAgICAgIHRoaXMuX2NhbGN1bGF0ZVNwYWNlclNpemUoKTtcbiAgICB9XG4gIH1cbiAgcHJpdmF0ZSBfb3JpZW50YXRpb246ICdob3Jpem9udGFsJyB8ICd2ZXJ0aWNhbCcgPSAndmVydGljYWwnO1xuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHJlbmRlcmVkIGl0ZW1zIHNob3VsZCBwZXJzaXN0IGluIHRoZSBET00gYWZ0ZXIgc2Nyb2xsaW5nIG91dCBvZiB2aWV3LiBCeSBkZWZhdWx0LCBpdGVtc1xuICAgKiB3aWxsIGJlIHJlbW92ZWQuXG4gICAqL1xuICBASW5wdXQoe3RyYW5zZm9ybTogYm9vbGVhbkF0dHJpYnV0ZX0pIGFwcGVuZE9ubHk6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAvLyBOb3RlOiB3ZSBkb24ndCB1c2UgdGhlIHR5cGljYWwgRXZlbnRFbWl0dGVyIGhlcmUgYmVjYXVzZSB3ZSBuZWVkIHRvIHN1YnNjcmliZSB0byB0aGUgc2Nyb2xsXG4gIC8vIHN0cmF0ZWd5IGxhemlseSAoaS5lLiBvbmx5IGlmIHRoZSB1c2VyIGlzIGFjdHVhbGx5IGxpc3RlbmluZyB0byB0aGUgZXZlbnRzKS4gV2UgZG8gdGhpcyBiZWNhdXNlXG4gIC8vIGRlcGVuZGluZyBvbiBob3cgdGhlIHN0cmF0ZWd5IGNhbGN1bGF0ZXMgdGhlIHNjcm9sbGVkIGluZGV4LCBpdCBtYXkgY29tZSBhdCBhIGNvc3QgdG9cbiAgLy8gcGVyZm9ybWFuY2UuXG4gIC8qKiBFbWl0cyB3aGVuIHRoZSBpbmRleCBvZiB0aGUgZmlyc3QgZWxlbWVudCB2aXNpYmxlIGluIHRoZSB2aWV3cG9ydCBjaGFuZ2VzLiAqL1xuICBAT3V0cHV0KClcbiAgcmVhZG9ubHkgc2Nyb2xsZWRJbmRleENoYW5nZTogT2JzZXJ2YWJsZTxudW1iZXI+ID0gbmV3IE9ic2VydmFibGUoKG9ic2VydmVyOiBPYnNlcnZlcjxudW1iZXI+KSA9PlxuICAgIHRoaXMuX3Njcm9sbFN0cmF0ZWd5LnNjcm9sbGVkSW5kZXhDaGFuZ2Uuc3Vic2NyaWJlKGluZGV4ID0+XG4gICAgICBQcm9taXNlLnJlc29sdmUoKS50aGVuKCgpID0+IHRoaXMubmdab25lLnJ1bigoKSA9PiBvYnNlcnZlci5uZXh0KGluZGV4KSkpLFxuICAgICksXG4gICk7XG5cbiAgLyoqIFRoZSBlbGVtZW50IHRoYXQgd3JhcHMgdGhlIHJlbmRlcmVkIGNvbnRlbnQuICovXG4gIEBWaWV3Q2hpbGQoJ2NvbnRlbnRXcmFwcGVyJywge3N0YXRpYzogdHJ1ZX0pIF9jb250ZW50V3JhcHBlcjogRWxlbWVudFJlZjxIVE1MRWxlbWVudD47XG5cbiAgLyoqIEEgc3RyZWFtIHRoYXQgZW1pdHMgd2hlbmV2ZXIgdGhlIHJlbmRlcmVkIHJhbmdlIGNoYW5nZXMuICovXG4gIHJlYWRvbmx5IHJlbmRlcmVkUmFuZ2VTdHJlYW06IE9ic2VydmFibGU8TGlzdFJhbmdlPiA9IHRoaXMuX3JlbmRlcmVkUmFuZ2VTdWJqZWN0O1xuXG4gIC8qKlxuICAgKiBUaGUgdG90YWwgc2l6ZSBvZiBhbGwgY29udGVudCAoaW4gcGl4ZWxzKSwgaW5jbHVkaW5nIGNvbnRlbnQgdGhhdCBpcyBub3QgY3VycmVudGx5IHJlbmRlcmVkLlxuICAgKi9cbiAgcHJpdmF0ZSBfdG90YWxDb250ZW50U2l6ZSA9IDA7XG5cbiAgLyoqIEEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgYHN0eWxlLndpZHRoYCBwcm9wZXJ0eSB2YWx1ZSB0byBiZSB1c2VkIGZvciB0aGUgc3BhY2VyIGVsZW1lbnQuICovXG4gIF90b3RhbENvbnRlbnRXaWR0aCA9ICcnO1xuXG4gIC8qKiBBIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIGBzdHlsZS5oZWlnaHRgIHByb3BlcnR5IHZhbHVlIHRvIGJlIHVzZWQgZm9yIHRoZSBzcGFjZXIgZWxlbWVudC4gKi9cbiAgX3RvdGFsQ29udGVudEhlaWdodCA9ICcnO1xuXG4gIC8qKlxuICAgKiBUaGUgQ1NTIHRyYW5zZm9ybSBhcHBsaWVkIHRvIHRoZSByZW5kZXJlZCBzdWJzZXQgb2YgaXRlbXMgc28gdGhhdCB0aGV5IGFwcGVhciB3aXRoaW4gdGhlIGJvdW5kc1xuICAgKiBvZiB0aGUgdmlzaWJsZSB2aWV3cG9ydC5cbiAgICovXG4gIHByaXZhdGUgX3JlbmRlcmVkQ29udGVudFRyYW5zZm9ybTogc3RyaW5nO1xuXG4gIC8qKiBUaGUgY3VycmVudGx5IHJlbmRlcmVkIHJhbmdlIG9mIGluZGljZXMuICovXG4gIHByaXZhdGUgX3JlbmRlcmVkUmFuZ2U6IExpc3RSYW5nZSA9IHtzdGFydDogMCwgZW5kOiAwfTtcblxuICAvKiogVGhlIGxlbmd0aCBvZiB0aGUgZGF0YSBib3VuZCB0byB0aGlzIHZpZXdwb3J0IChpbiBudW1iZXIgb2YgaXRlbXMpLiAqL1xuICBwcml2YXRlIF9kYXRhTGVuZ3RoID0gMDtcblxuICAvKiogVGhlIHNpemUgb2YgdGhlIHZpZXdwb3J0IChpbiBwaXhlbHMpLiAqL1xuICBwcml2YXRlIF92aWV3cG9ydFNpemUgPSAwO1xuXG4gIC8qKiB0aGUgY3VycmVudGx5IGF0dGFjaGVkIENka1ZpcnR1YWxTY3JvbGxSZXBlYXRlci4gKi9cbiAgcHJpdmF0ZSBfZm9yT2Y6IENka1ZpcnR1YWxTY3JvbGxSZXBlYXRlcjxhbnk+IHwgbnVsbDtcblxuICAvKiogVGhlIGxhc3QgcmVuZGVyZWQgY29udGVudCBvZmZzZXQgdGhhdCB3YXMgc2V0LiAqL1xuICBwcml2YXRlIF9yZW5kZXJlZENvbnRlbnRPZmZzZXQgPSAwO1xuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoZSBsYXN0IHJlbmRlcmVkIGNvbnRlbnQgb2Zmc2V0IHdhcyB0byB0aGUgZW5kIG9mIHRoZSBjb250ZW50IChhbmQgdGhlcmVmb3JlIG5lZWRzIHRvXG4gICAqIGJlIHJld3JpdHRlbiBhcyBhbiBvZmZzZXQgdG8gdGhlIHN0YXJ0IG9mIHRoZSBjb250ZW50KS5cbiAgICovXG4gIHByaXZhdGUgX3JlbmRlcmVkQ29udGVudE9mZnNldE5lZWRzUmV3cml0ZSA9IGZhbHNlO1xuXG4gIC8qKiBXaGV0aGVyIHRoZXJlIGlzIGEgcGVuZGluZyBjaGFuZ2UgZGV0ZWN0aW9uIGN5Y2xlLiAqL1xuICBwcml2YXRlIF9pc0NoYW5nZURldGVjdGlvblBlbmRpbmcgPSBmYWxzZTtcblxuICAvKiogQSBsaXN0IG9mIGZ1bmN0aW9ucyB0byBydW4gYWZ0ZXIgdGhlIG5leHQgY2hhbmdlIGRldGVjdGlvbiBjeWNsZS4gKi9cbiAgcHJpdmF0ZSBfcnVuQWZ0ZXJDaGFuZ2VEZXRlY3Rpb246IEZ1bmN0aW9uW10gPSBbXTtcblxuICAvKiogU3Vic2NyaXB0aW9uIHRvIGNoYW5nZXMgaW4gdGhlIHZpZXdwb3J0IHNpemUuICovXG4gIHByaXZhdGUgX3ZpZXdwb3J0Q2hhbmdlcyA9IFN1YnNjcmlwdGlvbi5FTVBUWTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgb3ZlcnJpZGUgZWxlbWVudFJlZjogRWxlbWVudFJlZjxIVE1MRWxlbWVudD4sXG4gICAgcHJpdmF0ZSBfY2hhbmdlRGV0ZWN0b3JSZWY6IENoYW5nZURldGVjdG9yUmVmLFxuICAgIG5nWm9uZTogTmdab25lLFxuICAgIEBPcHRpb25hbCgpXG4gICAgQEluamVjdChWSVJUVUFMX1NDUk9MTF9TVFJBVEVHWSlcbiAgICBwcml2YXRlIF9zY3JvbGxTdHJhdGVneTogVmlydHVhbFNjcm9sbFN0cmF0ZWd5LFxuICAgIEBPcHRpb25hbCgpIGRpcjogRGlyZWN0aW9uYWxpdHksXG4gICAgc2Nyb2xsRGlzcGF0Y2hlcjogU2Nyb2xsRGlzcGF0Y2hlcixcbiAgICB2aWV3cG9ydFJ1bGVyOiBWaWV3cG9ydFJ1bGVyLFxuICAgIEBPcHRpb25hbCgpIEBJbmplY3QoVklSVFVBTF9TQ1JPTExBQkxFKSBwdWJsaWMgc2Nyb2xsYWJsZTogQ2RrVmlydHVhbFNjcm9sbGFibGUsXG4gICkge1xuICAgIHN1cGVyKGVsZW1lbnRSZWYsIHNjcm9sbERpc3BhdGNoZXIsIG5nWm9uZSwgZGlyKTtcblxuICAgIGlmICghX3Njcm9sbFN0cmF0ZWd5ICYmICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpKSB7XG4gICAgICB0aHJvdyBFcnJvcignRXJyb3I6IGNkay12aXJ0dWFsLXNjcm9sbC12aWV3cG9ydCByZXF1aXJlcyB0aGUgXCJpdGVtU2l6ZVwiIHByb3BlcnR5IHRvIGJlIHNldC4nKTtcbiAgICB9XG5cbiAgICB0aGlzLl92aWV3cG9ydENoYW5nZXMgPSB2aWV3cG9ydFJ1bGVyLmNoYW5nZSgpLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICB0aGlzLmNoZWNrVmlld3BvcnRTaXplKCk7XG4gICAgfSk7XG5cbiAgICBpZiAoIXRoaXMuc2Nyb2xsYWJsZSkge1xuICAgICAgLy8gTm8gc2Nyb2xsYWJsZSBpcyBwcm92aWRlZCwgc28gdGhlIHZpcnR1YWwtc2Nyb2xsLXZpZXdwb3J0IG5lZWRzIHRvIGJlY29tZSBhIHNjcm9sbGFibGVcbiAgICAgIHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2Nkay12aXJ0dWFsLXNjcm9sbGFibGUnKTtcbiAgICAgIHRoaXMuc2Nyb2xsYWJsZSA9IHRoaXM7XG4gICAgfVxuICB9XG5cbiAgb3ZlcnJpZGUgbmdPbkluaXQoKSB7XG4gICAgLy8gU2Nyb2xsaW5nIGRlcGVuZHMgb24gdGhlIGVsZW1lbnQgZGltZW5zaW9ucyB3aGljaCB3ZSBjYW4ndCBnZXQgZHVyaW5nIFNTUi5cbiAgICBpZiAoIXRoaXMuX3BsYXRmb3JtLmlzQnJvd3Nlcikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnNjcm9sbGFibGUgPT09IHRoaXMpIHtcbiAgICAgIHN1cGVyLm5nT25Jbml0KCk7XG4gICAgfVxuICAgIC8vIEl0J3Mgc3RpbGwgdG9vIGVhcmx5IHRvIG1lYXN1cmUgdGhlIHZpZXdwb3J0IGF0IHRoaXMgcG9pbnQuIERlZmVycmluZyB3aXRoIGEgcHJvbWlzZSBhbGxvd3NcbiAgICAvLyB0aGUgVmlld3BvcnQgdG8gYmUgcmVuZGVyZWQgd2l0aCB0aGUgY29ycmVjdCBzaXplIGJlZm9yZSB3ZSBtZWFzdXJlLiBXZSBydW4gdGhpcyBvdXRzaWRlIHRoZVxuICAgIC8vIHpvbmUgdG8gYXZvaWQgY2F1c2luZyBtb3JlIGNoYW5nZSBkZXRlY3Rpb24gY3ljbGVzLiBXZSBoYW5kbGUgdGhlIGNoYW5nZSBkZXRlY3Rpb24gbG9vcFxuICAgIC8vIG91cnNlbHZlcyBpbnN0ZWFkLlxuICAgIHRoaXMubmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+XG4gICAgICBQcm9taXNlLnJlc29sdmUoKS50aGVuKCgpID0+IHtcbiAgICAgICAgdGhpcy5fbWVhc3VyZVZpZXdwb3J0U2l6ZSgpO1xuICAgICAgICB0aGlzLl9zY3JvbGxTdHJhdGVneS5hdHRhY2godGhpcyk7XG5cbiAgICAgICAgdGhpcy5zY3JvbGxhYmxlXG4gICAgICAgICAgLmVsZW1lbnRTY3JvbGxlZCgpXG4gICAgICAgICAgLnBpcGUoXG4gICAgICAgICAgICAvLyBTdGFydCBvZmYgd2l0aCBhIGZha2Ugc2Nyb2xsIGV2ZW50IHNvIHdlIHByb3Blcmx5IGRldGVjdCBvdXIgaW5pdGlhbCBwb3NpdGlvbi5cbiAgICAgICAgICAgIHN0YXJ0V2l0aChudWxsKSxcbiAgICAgICAgICAgIC8vIENvbGxlY3QgbXVsdGlwbGUgZXZlbnRzIGludG8gb25lIHVudGlsIHRoZSBuZXh0IGFuaW1hdGlvbiBmcmFtZS4gVGhpcyB3YXkgaWZcbiAgICAgICAgICAgIC8vIHRoZXJlIGFyZSBtdWx0aXBsZSBzY3JvbGwgZXZlbnRzIGluIHRoZSBzYW1lIGZyYW1lIHdlIG9ubHkgbmVlZCB0byByZWNoZWNrXG4gICAgICAgICAgICAvLyBvdXIgbGF5b3V0IG9uY2UuXG4gICAgICAgICAgICBhdWRpdFRpbWUoMCwgU0NST0xMX1NDSEVEVUxFUiksXG4gICAgICAgICAgICAvLyBVc3VhbGx5IGBlbGVtZW50U2Nyb2xsZWRgIGlzIGNvbXBsZXRlZCB3aGVuIHRoZSBzY3JvbGxhYmxlIGlzIGRlc3Ryb3llZCwgYnV0XG4gICAgICAgICAgICAvLyB0aGF0IG1heSBub3QgYmUgdGhlIGNhc2UgaWYgYSBgQ2RrVmlydHVhbFNjcm9sbGFibGVFbGVtZW50YCBpcyB1c2VkIHNvIHdlIGhhdmVcbiAgICAgICAgICAgIC8vIHRvIHVuc3Vic2NyaWJlIGhlcmUganVzdCBpbiBjYXNlLlxuICAgICAgICAgICAgdGFrZVVudGlsKHRoaXMuX2Rlc3Ryb3llZCksXG4gICAgICAgICAgKVxuICAgICAgICAgIC5zdWJzY3JpYmUoKCkgPT4gdGhpcy5fc2Nyb2xsU3RyYXRlZ3kub25Db250ZW50U2Nyb2xsZWQoKSk7XG5cbiAgICAgICAgdGhpcy5fbWFya0NoYW5nZURldGVjdGlvbk5lZWRlZCgpO1xuICAgICAgfSksXG4gICAgKTtcbiAgfVxuXG4gIG92ZXJyaWRlIG5nT25EZXN0cm95KCkge1xuICAgIHRoaXMuZGV0YWNoKCk7XG4gICAgdGhpcy5fc2Nyb2xsU3RyYXRlZ3kuZGV0YWNoKCk7XG5cbiAgICAvLyBDb21wbGV0ZSBhbGwgc3ViamVjdHNcbiAgICB0aGlzLl9yZW5kZXJlZFJhbmdlU3ViamVjdC5jb21wbGV0ZSgpO1xuICAgIHRoaXMuX2RldGFjaGVkU3ViamVjdC5jb21wbGV0ZSgpO1xuICAgIHRoaXMuX3ZpZXdwb3J0Q2hhbmdlcy51bnN1YnNjcmliZSgpO1xuXG4gICAgc3VwZXIubmdPbkRlc3Ryb3koKTtcbiAgfVxuXG4gIC8qKiBBdHRhY2hlcyBhIGBDZGtWaXJ0dWFsU2Nyb2xsUmVwZWF0ZXJgIHRvIHRoaXMgdmlld3BvcnQuICovXG4gIGF0dGFjaChmb3JPZjogQ2RrVmlydHVhbFNjcm9sbFJlcGVhdGVyPGFueT4pIHtcbiAgICBpZiAodGhpcy5fZm9yT2YgJiYgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkpIHtcbiAgICAgIHRocm93IEVycm9yKCdDZGtWaXJ0dWFsU2Nyb2xsVmlld3BvcnQgaXMgYWxyZWFkeSBhdHRhY2hlZC4nKTtcbiAgICB9XG5cbiAgICAvLyBTdWJzY3JpYmUgdG8gdGhlIGRhdGEgc3RyZWFtIG9mIHRoZSBDZGtWaXJ0dWFsRm9yT2YgdG8ga2VlcCB0cmFjayBvZiB3aGVuIHRoZSBkYXRhIGxlbmd0aFxuICAgIC8vIGNoYW5nZXMuIFJ1biBvdXRzaWRlIHRoZSB6b25lIHRvIGF2b2lkIHRyaWdnZXJpbmcgY2hhbmdlIGRldGVjdGlvbiwgc2luY2Ugd2UncmUgbWFuYWdpbmcgdGhlXG4gICAgLy8gY2hhbmdlIGRldGVjdGlvbiBsb29wIG91cnNlbHZlcy5cbiAgICB0aGlzLm5nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICB0aGlzLl9mb3JPZiA9IGZvck9mO1xuICAgICAgdGhpcy5fZm9yT2YuZGF0YVN0cmVhbS5waXBlKHRha2VVbnRpbCh0aGlzLl9kZXRhY2hlZFN1YmplY3QpKS5zdWJzY3JpYmUoZGF0YSA9PiB7XG4gICAgICAgIGNvbnN0IG5ld0xlbmd0aCA9IGRhdGEubGVuZ3RoO1xuICAgICAgICBpZiAobmV3TGVuZ3RoICE9PSB0aGlzLl9kYXRhTGVuZ3RoKSB7XG4gICAgICAgICAgdGhpcy5fZGF0YUxlbmd0aCA9IG5ld0xlbmd0aDtcbiAgICAgICAgICB0aGlzLl9zY3JvbGxTdHJhdGVneS5vbkRhdGFMZW5ndGhDaGFuZ2VkKCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fZG9DaGFuZ2VEZXRlY3Rpb24oKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqIERldGFjaGVzIHRoZSBjdXJyZW50IGBDZGtWaXJ0dWFsRm9yT2ZgLiAqL1xuICBkZXRhY2goKSB7XG4gICAgdGhpcy5fZm9yT2YgPSBudWxsO1xuICAgIHRoaXMuX2RldGFjaGVkU3ViamVjdC5uZXh0KCk7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgbGVuZ3RoIG9mIHRoZSBkYXRhIGJvdW5kIHRvIHRoaXMgdmlld3BvcnQgKGluIG51bWJlciBvZiBpdGVtcykuICovXG4gIGdldERhdGFMZW5ndGgoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fZGF0YUxlbmd0aDtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBzaXplIG9mIHRoZSB2aWV3cG9ydCAoaW4gcGl4ZWxzKS4gKi9cbiAgZ2V0Vmlld3BvcnRTaXplKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX3ZpZXdwb3J0U2l6ZTtcbiAgfVxuXG4gIC8vIFRPRE8obW1hbGVyYmEpOiBUaGlzIGlzIHRlY2huaWNhbGx5IG91dCBvZiBzeW5jIHdpdGggd2hhdCdzIHJlYWxseSByZW5kZXJlZCB1bnRpbCBhIHJlbmRlclxuICAvLyBjeWNsZSBoYXBwZW5zLiBJJ20gYmVpbmcgY2FyZWZ1bCB0byBvbmx5IGNhbGwgaXQgYWZ0ZXIgdGhlIHJlbmRlciBjeWNsZSBpcyBjb21wbGV0ZSBhbmQgYmVmb3JlXG4gIC8vIHNldHRpbmcgaXQgdG8gc29tZXRoaW5nIGVsc2UsIGJ1dCBpdHMgZXJyb3IgcHJvbmUgYW5kIHNob3VsZCBwcm9iYWJseSBiZSBzcGxpdCBpbnRvXG4gIC8vIGBwZW5kaW5nUmFuZ2VgIGFuZCBgcmVuZGVyZWRSYW5nZWAsIHRoZSBsYXR0ZXIgcmVmbGVjdGluZyB3aGF0cyBhY3R1YWxseSBpbiB0aGUgRE9NLlxuXG4gIC8qKiBHZXQgdGhlIGN1cnJlbnQgcmVuZGVyZWQgcmFuZ2Ugb2YgaXRlbXMuICovXG4gIGdldFJlbmRlcmVkUmFuZ2UoKTogTGlzdFJhbmdlIHtcbiAgICByZXR1cm4gdGhpcy5fcmVuZGVyZWRSYW5nZTtcbiAgfVxuXG4gIG1lYXN1cmVCb3VuZGluZ0NsaWVudFJlY3RXaXRoU2Nyb2xsT2Zmc2V0KGZyb206ICdsZWZ0JyB8ICd0b3AnIHwgJ3JpZ2h0JyB8ICdib3R0b20nKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5nZXRFbGVtZW50UmVmKCkubmF0aXZlRWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVtmcm9tXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSB0b3RhbCBzaXplIG9mIGFsbCBjb250ZW50IChpbiBwaXhlbHMpLCBpbmNsdWRpbmcgY29udGVudCB0aGF0IGlzIG5vdCBjdXJyZW50bHlcbiAgICogcmVuZGVyZWQuXG4gICAqL1xuICBzZXRUb3RhbENvbnRlbnRTaXplKHNpemU6IG51bWJlcikge1xuICAgIGlmICh0aGlzLl90b3RhbENvbnRlbnRTaXplICE9PSBzaXplKSB7XG4gICAgICB0aGlzLl90b3RhbENvbnRlbnRTaXplID0gc2l6ZTtcbiAgICAgIHRoaXMuX2NhbGN1bGF0ZVNwYWNlclNpemUoKTtcbiAgICAgIHRoaXMuX21hcmtDaGFuZ2VEZXRlY3Rpb25OZWVkZWQoKTtcbiAgICB9XG4gIH1cblxuICAvKiogU2V0cyB0aGUgY3VycmVudGx5IHJlbmRlcmVkIHJhbmdlIG9mIGluZGljZXMuICovXG4gIHNldFJlbmRlcmVkUmFuZ2UocmFuZ2U6IExpc3RSYW5nZSkge1xuICAgIGlmICghcmFuZ2VzRXF1YWwodGhpcy5fcmVuZGVyZWRSYW5nZSwgcmFuZ2UpKSB7XG4gICAgICBpZiAodGhpcy5hcHBlbmRPbmx5KSB7XG4gICAgICAgIHJhbmdlID0ge3N0YXJ0OiAwLCBlbmQ6IE1hdGgubWF4KHRoaXMuX3JlbmRlcmVkUmFuZ2UuZW5kLCByYW5nZS5lbmQpfTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX3JlbmRlcmVkUmFuZ2VTdWJqZWN0Lm5leHQoKHRoaXMuX3JlbmRlcmVkUmFuZ2UgPSByYW5nZSkpO1xuICAgICAgdGhpcy5fbWFya0NoYW5nZURldGVjdGlvbk5lZWRlZCgoKSA9PiB0aGlzLl9zY3JvbGxTdHJhdGVneS5vbkNvbnRlbnRSZW5kZXJlZCgpKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgb2Zmc2V0IGZyb20gdGhlIHN0YXJ0IG9mIHRoZSB2aWV3cG9ydCB0byB0aGUgc3RhcnQgb2YgdGhlIHJlbmRlcmVkIGRhdGEgKGluIHBpeGVscykuXG4gICAqL1xuICBnZXRPZmZzZXRUb1JlbmRlcmVkQ29udGVudFN0YXJ0KCk6IG51bWJlciB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLl9yZW5kZXJlZENvbnRlbnRPZmZzZXROZWVkc1Jld3JpdGUgPyBudWxsIDogdGhpcy5fcmVuZGVyZWRDb250ZW50T2Zmc2V0O1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIG9mZnNldCBmcm9tIHRoZSBzdGFydCBvZiB0aGUgdmlld3BvcnQgdG8gZWl0aGVyIHRoZSBzdGFydCBvciBlbmQgb2YgdGhlIHJlbmRlcmVkIGRhdGFcbiAgICogKGluIHBpeGVscykuXG4gICAqL1xuICBzZXRSZW5kZXJlZENvbnRlbnRPZmZzZXQob2Zmc2V0OiBudW1iZXIsIHRvOiAndG8tc3RhcnQnIHwgJ3RvLWVuZCcgPSAndG8tc3RhcnQnKSB7XG4gICAgLy8gSW4gYXBwZW5kT25seSwgd2UgYWx3YXlzIHN0YXJ0IGZyb20gdGhlIHRvcFxuICAgIG9mZnNldCA9IHRoaXMuYXBwZW5kT25seSAmJiB0byA9PT0gJ3RvLXN0YXJ0JyA/IDAgOiBvZmZzZXQ7XG5cbiAgICAvLyBGb3IgYSBob3Jpem9udGFsIHZpZXdwb3J0IGluIGEgcmlnaHQtdG8tbGVmdCBsYW5ndWFnZSB3ZSBuZWVkIHRvIHRyYW5zbGF0ZSBhbG9uZyB0aGUgeC1heGlzXG4gICAgLy8gaW4gdGhlIG5lZ2F0aXZlIGRpcmVjdGlvbi5cbiAgICBjb25zdCBpc1J0bCA9IHRoaXMuZGlyICYmIHRoaXMuZGlyLnZhbHVlID09ICdydGwnO1xuICAgIGNvbnN0IGlzSG9yaXpvbnRhbCA9IHRoaXMub3JpZW50YXRpb24gPT0gJ2hvcml6b250YWwnO1xuICAgIGNvbnN0IGF4aXMgPSBpc0hvcml6b250YWwgPyAnWCcgOiAnWSc7XG4gICAgY29uc3QgYXhpc0RpcmVjdGlvbiA9IGlzSG9yaXpvbnRhbCAmJiBpc1J0bCA/IC0xIDogMTtcbiAgICBsZXQgdHJhbnNmb3JtID0gYHRyYW5zbGF0ZSR7YXhpc30oJHtOdW1iZXIoYXhpc0RpcmVjdGlvbiAqIG9mZnNldCl9cHgpYDtcbiAgICB0aGlzLl9yZW5kZXJlZENvbnRlbnRPZmZzZXQgPSBvZmZzZXQ7XG4gICAgaWYgKHRvID09PSAndG8tZW5kJykge1xuICAgICAgdHJhbnNmb3JtICs9IGAgdHJhbnNsYXRlJHtheGlzfSgtMTAwJSlgO1xuICAgICAgLy8gVGhlIHZpZXdwb3J0IHNob3VsZCByZXdyaXRlIHRoaXMgYXMgYSBgdG8tc3RhcnRgIG9mZnNldCBvbiB0aGUgbmV4dCByZW5kZXIgY3ljbGUuIE90aGVyd2lzZVxuICAgICAgLy8gZWxlbWVudHMgd2lsbCBhcHBlYXIgdG8gZXhwYW5kIGluIHRoZSB3cm9uZyBkaXJlY3Rpb24gKGUuZy4gYG1hdC1leHBhbnNpb24tcGFuZWxgIHdvdWxkXG4gICAgICAvLyBleHBhbmQgdXB3YXJkKS5cbiAgICAgIHRoaXMuX3JlbmRlcmVkQ29udGVudE9mZnNldE5lZWRzUmV3cml0ZSA9IHRydWU7XG4gICAgfVxuICAgIGlmICh0aGlzLl9yZW5kZXJlZENvbnRlbnRUcmFuc2Zvcm0gIT0gdHJhbnNmb3JtKSB7XG4gICAgICAvLyBXZSBrbm93IHRoaXMgdmFsdWUgaXMgc2FmZSBiZWNhdXNlIHdlIHBhcnNlIGBvZmZzZXRgIHdpdGggYE51bWJlcigpYCBiZWZvcmUgcGFzc2luZyBpdFxuICAgICAgLy8gaW50byB0aGUgc3RyaW5nLlxuICAgICAgdGhpcy5fcmVuZGVyZWRDb250ZW50VHJhbnNmb3JtID0gdHJhbnNmb3JtO1xuICAgICAgdGhpcy5fbWFya0NoYW5nZURldGVjdGlvbk5lZWRlZCgoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLl9yZW5kZXJlZENvbnRlbnRPZmZzZXROZWVkc1Jld3JpdGUpIHtcbiAgICAgICAgICB0aGlzLl9yZW5kZXJlZENvbnRlbnRPZmZzZXQgLT0gdGhpcy5tZWFzdXJlUmVuZGVyZWRDb250ZW50U2l6ZSgpO1xuICAgICAgICAgIHRoaXMuX3JlbmRlcmVkQ29udGVudE9mZnNldE5lZWRzUmV3cml0ZSA9IGZhbHNlO1xuICAgICAgICAgIHRoaXMuc2V0UmVuZGVyZWRDb250ZW50T2Zmc2V0KHRoaXMuX3JlbmRlcmVkQ29udGVudE9mZnNldCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5fc2Nyb2xsU3RyYXRlZ3kub25SZW5kZXJlZE9mZnNldENoYW5nZWQoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNjcm9sbHMgdG8gdGhlIGdpdmVuIG9mZnNldCBmcm9tIHRoZSBzdGFydCBvZiB0aGUgdmlld3BvcnQuIFBsZWFzZSBub3RlIHRoYXQgdGhpcyBpcyBub3QgYWx3YXlzXG4gICAqIHRoZSBzYW1lIGFzIHNldHRpbmcgYHNjcm9sbFRvcGAgb3IgYHNjcm9sbExlZnRgLiBJbiBhIGhvcml6b250YWwgdmlld3BvcnQgd2l0aCByaWdodC10by1sZWZ0XG4gICAqIGRpcmVjdGlvbiwgdGhpcyB3b3VsZCBiZSB0aGUgZXF1aXZhbGVudCBvZiBzZXR0aW5nIGEgZmljdGlvbmFsIGBzY3JvbGxSaWdodGAgcHJvcGVydHkuXG4gICAqIEBwYXJhbSBvZmZzZXQgVGhlIG9mZnNldCB0byBzY3JvbGwgdG8uXG4gICAqIEBwYXJhbSBiZWhhdmlvciBUaGUgU2Nyb2xsQmVoYXZpb3IgdG8gdXNlIHdoZW4gc2Nyb2xsaW5nLiBEZWZhdWx0IGlzIGJlaGF2aW9yIGlzIGBhdXRvYC5cbiAgICovXG4gIHNjcm9sbFRvT2Zmc2V0KG9mZnNldDogbnVtYmVyLCBiZWhhdmlvcjogU2Nyb2xsQmVoYXZpb3IgPSAnYXV0bycpIHtcbiAgICBjb25zdCBvcHRpb25zOiBFeHRlbmRlZFNjcm9sbFRvT3B0aW9ucyA9IHtiZWhhdmlvcn07XG4gICAgaWYgKHRoaXMub3JpZW50YXRpb24gPT09ICdob3Jpem9udGFsJykge1xuICAgICAgb3B0aW9ucy5zdGFydCA9IG9mZnNldDtcbiAgICB9IGVsc2Uge1xuICAgICAgb3B0aW9ucy50b3AgPSBvZmZzZXQ7XG4gICAgfVxuICAgIHRoaXMuc2Nyb2xsYWJsZS5zY3JvbGxUbyhvcHRpb25zKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTY3JvbGxzIHRvIHRoZSBvZmZzZXQgZm9yIHRoZSBnaXZlbiBpbmRleC5cbiAgICogQHBhcmFtIGluZGV4IFRoZSBpbmRleCBvZiB0aGUgZWxlbWVudCB0byBzY3JvbGwgdG8uXG4gICAqIEBwYXJhbSBiZWhhdmlvciBUaGUgU2Nyb2xsQmVoYXZpb3IgdG8gdXNlIHdoZW4gc2Nyb2xsaW5nLiBEZWZhdWx0IGlzIGJlaGF2aW9yIGlzIGBhdXRvYC5cbiAgICovXG4gIHNjcm9sbFRvSW5kZXgoaW5kZXg6IG51bWJlciwgYmVoYXZpb3I6IFNjcm9sbEJlaGF2aW9yID0gJ2F1dG8nKSB7XG4gICAgdGhpcy5fc2Nyb2xsU3RyYXRlZ3kuc2Nyb2xsVG9JbmRleChpbmRleCwgYmVoYXZpb3IpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIGN1cnJlbnQgc2Nyb2xsIG9mZnNldCBmcm9tIHRoZSBzdGFydCBvZiB0aGUgc2Nyb2xsYWJsZSAoaW4gcGl4ZWxzKS5cbiAgICogQHBhcmFtIGZyb20gVGhlIGVkZ2UgdG8gbWVhc3VyZSB0aGUgb2Zmc2V0IGZyb20uIERlZmF1bHRzIHRvICd0b3AnIGluIHZlcnRpY2FsIG1vZGUgYW5kICdzdGFydCdcbiAgICogICAgIGluIGhvcml6b250YWwgbW9kZS5cbiAgICovXG4gIG92ZXJyaWRlIG1lYXN1cmVTY3JvbGxPZmZzZXQoXG4gICAgZnJvbT86ICd0b3AnIHwgJ2xlZnQnIHwgJ3JpZ2h0JyB8ICdib3R0b20nIHwgJ3N0YXJ0JyB8ICdlbmQnLFxuICApOiBudW1iZXIge1xuICAgIC8vIFRoaXMgaXMgdG8gYnJlYWsgdGhlIGNhbGwgY3ljbGVcbiAgICBsZXQgbWVhc3VyZVNjcm9sbE9mZnNldDogSW5zdGFuY2VUeXBlPHR5cGVvZiBDZGtWaXJ0dWFsU2Nyb2xsYWJsZT5bJ21lYXN1cmVTY3JvbGxPZmZzZXQnXTtcbiAgICBpZiAodGhpcy5zY3JvbGxhYmxlID09IHRoaXMpIHtcbiAgICAgIG1lYXN1cmVTY3JvbGxPZmZzZXQgPSAoX2Zyb206IE5vbk51bGxhYmxlPHR5cGVvZiBmcm9tPikgPT4gc3VwZXIubWVhc3VyZVNjcm9sbE9mZnNldChfZnJvbSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG1lYXN1cmVTY3JvbGxPZmZzZXQgPSAoX2Zyb206IE5vbk51bGxhYmxlPHR5cGVvZiBmcm9tPikgPT5cbiAgICAgICAgdGhpcy5zY3JvbGxhYmxlLm1lYXN1cmVTY3JvbGxPZmZzZXQoX2Zyb20pO1xuICAgIH1cblxuICAgIHJldHVybiBNYXRoLm1heChcbiAgICAgIDAsXG4gICAgICBtZWFzdXJlU2Nyb2xsT2Zmc2V0KGZyb20gPz8gKHRoaXMub3JpZW50YXRpb24gPT09ICdob3Jpem9udGFsJyA/ICdzdGFydCcgOiAndG9wJykpIC1cbiAgICAgICAgdGhpcy5tZWFzdXJlVmlld3BvcnRPZmZzZXQoKSxcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIE1lYXN1cmVzIHRoZSBvZmZzZXQgb2YgdGhlIHZpZXdwb3J0IGZyb20gdGhlIHNjcm9sbGluZyBjb250YWluZXJcbiAgICogQHBhcmFtIGZyb20gVGhlIGVkZ2UgdG8gbWVhc3VyZSBmcm9tLlxuICAgKi9cbiAgbWVhc3VyZVZpZXdwb3J0T2Zmc2V0KGZyb20/OiAndG9wJyB8ICdsZWZ0JyB8ICdyaWdodCcgfCAnYm90dG9tJyB8ICdzdGFydCcgfCAnZW5kJykge1xuICAgIGxldCBmcm9tUmVjdDogJ2xlZnQnIHwgJ3RvcCcgfCAncmlnaHQnIHwgJ2JvdHRvbSc7XG4gICAgY29uc3QgTEVGVCA9ICdsZWZ0JztcbiAgICBjb25zdCBSSUdIVCA9ICdyaWdodCc7XG4gICAgY29uc3QgaXNSdGwgPSB0aGlzLmRpcj8udmFsdWUgPT0gJ3J0bCc7XG4gICAgaWYgKGZyb20gPT0gJ3N0YXJ0Jykge1xuICAgICAgZnJvbVJlY3QgPSBpc1J0bCA/IFJJR0hUIDogTEVGVDtcbiAgICB9IGVsc2UgaWYgKGZyb20gPT0gJ2VuZCcpIHtcbiAgICAgIGZyb21SZWN0ID0gaXNSdGwgPyBMRUZUIDogUklHSFQ7XG4gICAgfSBlbHNlIGlmIChmcm9tKSB7XG4gICAgICBmcm9tUmVjdCA9IGZyb207XG4gICAgfSBlbHNlIHtcbiAgICAgIGZyb21SZWN0ID0gdGhpcy5vcmllbnRhdGlvbiA9PT0gJ2hvcml6b250YWwnID8gJ2xlZnQnIDogJ3RvcCc7XG4gICAgfVxuXG4gICAgY29uc3Qgc2Nyb2xsZXJDbGllbnRSZWN0ID0gdGhpcy5zY3JvbGxhYmxlLm1lYXN1cmVCb3VuZGluZ0NsaWVudFJlY3RXaXRoU2Nyb2xsT2Zmc2V0KGZyb21SZWN0KTtcbiAgICBjb25zdCB2aWV3cG9ydENsaWVudFJlY3QgPSB0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVtmcm9tUmVjdF07XG5cbiAgICByZXR1cm4gdmlld3BvcnRDbGllbnRSZWN0IC0gc2Nyb2xsZXJDbGllbnRSZWN0O1xuICB9XG5cbiAgLyoqIE1lYXN1cmUgdGhlIGNvbWJpbmVkIHNpemUgb2YgYWxsIG9mIHRoZSByZW5kZXJlZCBpdGVtcy4gKi9cbiAgbWVhc3VyZVJlbmRlcmVkQ29udGVudFNpemUoKTogbnVtYmVyIHtcbiAgICBjb25zdCBjb250ZW50RWwgPSB0aGlzLl9jb250ZW50V3JhcHBlci5uYXRpdmVFbGVtZW50O1xuICAgIHJldHVybiB0aGlzLm9yaWVudGF0aW9uID09PSAnaG9yaXpvbnRhbCcgPyBjb250ZW50RWwub2Zmc2V0V2lkdGggOiBjb250ZW50RWwub2Zmc2V0SGVpZ2h0O1xuICB9XG5cbiAgLyoqXG4gICAqIE1lYXN1cmUgdGhlIHRvdGFsIGNvbWJpbmVkIHNpemUgb2YgdGhlIGdpdmVuIHJhbmdlLiBUaHJvd3MgaWYgdGhlIHJhbmdlIGluY2x1ZGVzIGl0ZW1zIHRoYXQgYXJlXG4gICAqIG5vdCByZW5kZXJlZC5cbiAgICovXG4gIG1lYXN1cmVSYW5nZVNpemUocmFuZ2U6IExpc3RSYW5nZSk6IG51bWJlciB7XG4gICAgaWYgKCF0aGlzLl9mb3JPZikge1xuICAgICAgcmV0dXJuIDA7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9mb3JPZi5tZWFzdXJlUmFuZ2VTaXplKHJhbmdlLCB0aGlzLm9yaWVudGF0aW9uKTtcbiAgfVxuXG4gIC8qKiBVcGRhdGUgdGhlIHZpZXdwb3J0IGRpbWVuc2lvbnMgYW5kIHJlLXJlbmRlci4gKi9cbiAgY2hlY2tWaWV3cG9ydFNpemUoKSB7XG4gICAgLy8gVE9ETzogQ2xlYW51cCBsYXRlciB3aGVuIGFkZCBsb2dpYyBmb3IgaGFuZGxpbmcgY29udGVudCByZXNpemVcbiAgICB0aGlzLl9tZWFzdXJlVmlld3BvcnRTaXplKCk7XG4gICAgdGhpcy5fc2Nyb2xsU3RyYXRlZ3kub25EYXRhTGVuZ3RoQ2hhbmdlZCgpO1xuICB9XG5cbiAgLyoqIE1lYXN1cmUgdGhlIHZpZXdwb3J0IHNpemUuICovXG4gIHByaXZhdGUgX21lYXN1cmVWaWV3cG9ydFNpemUoKSB7XG4gICAgdGhpcy5fdmlld3BvcnRTaXplID0gdGhpcy5zY3JvbGxhYmxlLm1lYXN1cmVWaWV3cG9ydFNpemUodGhpcy5vcmllbnRhdGlvbik7XG4gIH1cblxuICAvKiogUXVldWUgdXAgY2hhbmdlIGRldGVjdGlvbiB0byBydW4uICovXG4gIHByaXZhdGUgX21hcmtDaGFuZ2VEZXRlY3Rpb25OZWVkZWQocnVuQWZ0ZXI/OiBGdW5jdGlvbikge1xuICAgIGlmIChydW5BZnRlcikge1xuICAgICAgdGhpcy5fcnVuQWZ0ZXJDaGFuZ2VEZXRlY3Rpb24ucHVzaChydW5BZnRlcik7XG4gICAgfVxuXG4gICAgLy8gVXNlIGEgUHJvbWlzZSB0byBiYXRjaCB0b2dldGhlciBjYWxscyB0byBgX2RvQ2hhbmdlRGV0ZWN0aW9uYC4gVGhpcyB3YXkgaWYgd2Ugc2V0IGEgYnVuY2ggb2ZcbiAgICAvLyBwcm9wZXJ0aWVzIHNlcXVlbnRpYWxseSB3ZSBvbmx5IGhhdmUgdG8gcnVuIGBfZG9DaGFuZ2VEZXRlY3Rpb25gIG9uY2UgYXQgdGhlIGVuZC5cbiAgICBpZiAoIXRoaXMuX2lzQ2hhbmdlRGV0ZWN0aW9uUGVuZGluZykge1xuICAgICAgdGhpcy5faXNDaGFuZ2VEZXRlY3Rpb25QZW5kaW5nID0gdHJ1ZTtcbiAgICAgIHRoaXMubmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+XG4gICAgICAgIFByb21pc2UucmVzb2x2ZSgpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIHRoaXMuX2RvQ2hhbmdlRGV0ZWN0aW9uKCk7XG4gICAgICAgIH0pLFxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICAvKiogUnVuIGNoYW5nZSBkZXRlY3Rpb24uICovXG4gIHByaXZhdGUgX2RvQ2hhbmdlRGV0ZWN0aW9uKCkge1xuICAgIHRoaXMuX2lzQ2hhbmdlRGV0ZWN0aW9uUGVuZGluZyA9IGZhbHNlO1xuXG4gICAgLy8gQXBwbHkgdGhlIGNvbnRlbnQgdHJhbnNmb3JtLiBUaGUgdHJhbnNmb3JtIGNhbid0IGJlIHNldCB2aWEgYW4gQW5ndWxhciBiaW5kaW5nIGJlY2F1c2VcbiAgICAvLyBieXBhc3NTZWN1cml0eVRydXN0U3R5bGUgaXMgYmFubmVkIGluIEdvb2dsZS4gSG93ZXZlciB0aGUgdmFsdWUgaXMgc2FmZSwgaXQncyBjb21wb3NlZCBvZlxuICAgIC8vIHN0cmluZyBsaXRlcmFscywgYSB2YXJpYWJsZSB0aGF0IGNhbiBvbmx5IGJlICdYJyBvciAnWScsIGFuZCB1c2VyIGlucHV0IHRoYXQgaXMgcnVuIHRocm91Z2hcbiAgICAvLyB0aGUgYE51bWJlcmAgZnVuY3Rpb24gZmlyc3QgdG8gY29lcmNlIGl0IHRvIGEgbnVtZXJpYyB2YWx1ZS5cbiAgICB0aGlzLl9jb250ZW50V3JhcHBlci5uYXRpdmVFbGVtZW50LnN0eWxlLnRyYW5zZm9ybSA9IHRoaXMuX3JlbmRlcmVkQ29udGVudFRyYW5zZm9ybTtcbiAgICAvLyBBcHBseSBjaGFuZ2VzIHRvIEFuZ3VsYXIgYmluZGluZ3MuIE5vdGU6IFdlIG11c3QgY2FsbCBgbWFya0ZvckNoZWNrYCB0byBydW4gY2hhbmdlIGRldGVjdGlvblxuICAgIC8vIGZyb20gdGhlIHJvb3QsIHNpbmNlIHRoZSByZXBlYXRlZCBpdGVtcyBhcmUgY29udGVudCBwcm9qZWN0ZWQgaW4uIENhbGxpbmcgYGRldGVjdENoYW5nZXNgXG4gICAgLy8gaW5zdGVhZCBkb2VzIG5vdCBwcm9wZXJseSBjaGVjayB0aGUgcHJvamVjdGVkIGNvbnRlbnQuXG4gICAgdGhpcy5uZ1pvbmUucnVuKCgpID0+IHRoaXMuX2NoYW5nZURldGVjdG9yUmVmLm1hcmtGb3JDaGVjaygpKTtcblxuICAgIGNvbnN0IHJ1bkFmdGVyQ2hhbmdlRGV0ZWN0aW9uID0gdGhpcy5fcnVuQWZ0ZXJDaGFuZ2VEZXRlY3Rpb247XG4gICAgdGhpcy5fcnVuQWZ0ZXJDaGFuZ2VEZXRlY3Rpb24gPSBbXTtcbiAgICBmb3IgKGNvbnN0IGZuIG9mIHJ1bkFmdGVyQ2hhbmdlRGV0ZWN0aW9uKSB7XG4gICAgICBmbigpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBDYWxjdWxhdGVzIHRoZSBgc3R5bGUud2lkdGhgIGFuZCBgc3R5bGUuaGVpZ2h0YCBmb3IgdGhlIHNwYWNlciBlbGVtZW50LiAqL1xuICBwcml2YXRlIF9jYWxjdWxhdGVTcGFjZXJTaXplKCkge1xuICAgIHRoaXMuX3RvdGFsQ29udGVudEhlaWdodCA9XG4gICAgICB0aGlzLm9yaWVudGF0aW9uID09PSAnaG9yaXpvbnRhbCcgPyAnJyA6IGAke3RoaXMuX3RvdGFsQ29udGVudFNpemV9cHhgO1xuICAgIHRoaXMuX3RvdGFsQ29udGVudFdpZHRoID1cbiAgICAgIHRoaXMub3JpZW50YXRpb24gPT09ICdob3Jpem9udGFsJyA/IGAke3RoaXMuX3RvdGFsQ29udGVudFNpemV9cHhgIDogJyc7XG4gIH1cbn1cbiIsIjwhLS1cbiAgV3JhcCB0aGUgcmVuZGVyZWQgY29udGVudCBpbiBhbiBlbGVtZW50IHRoYXQgd2lsbCBiZSB1c2VkIHRvIG9mZnNldCBpdCBiYXNlZCBvbiB0aGUgc2Nyb2xsXG4gIHBvc2l0aW9uLlxuLS0+XG48ZGl2ICNjb250ZW50V3JhcHBlciBjbGFzcz1cImNkay12aXJ0dWFsLXNjcm9sbC1jb250ZW50LXdyYXBwZXJcIj5cbiAgPG5nLWNvbnRlbnQ+PC9uZy1jb250ZW50PlxuPC9kaXY+XG48IS0tXG4gIFNwYWNlciB1c2VkIHRvIGZvcmNlIHRoZSBzY3JvbGxpbmcgY29udGFpbmVyIHRvIHRoZSBjb3JyZWN0IHNpemUgZm9yIHRoZSAqdG90YWwqIG51bWJlciBvZiBpdGVtc1xuICBzbyB0aGF0IHRoZSBzY3JvbGxiYXIgY2FwdHVyZXMgdGhlIHNpemUgb2YgdGhlIGVudGlyZSBkYXRhIHNldC5cbi0tPlxuPGRpdiBjbGFzcz1cImNkay12aXJ0dWFsLXNjcm9sbC1zcGFjZXJcIlxuICAgICBbc3R5bGUud2lkdGhdPVwiX3RvdGFsQ29udGVudFdpZHRoXCIgW3N0eWxlLmhlaWdodF09XCJfdG90YWxDb250ZW50SGVpZ2h0XCI+PC9kaXY+XG4iXX0=