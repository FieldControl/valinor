/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { _getFocusedElementPierceShadowDom } from '@angular/cdk/platform';
import { DOCUMENT } from '@angular/common';
import { Directive, ElementRef, Inject, Injectable, Input, NgZone, } from '@angular/core';
import { take } from 'rxjs/operators';
import { InteractivityChecker } from '../interactivity-checker/interactivity-checker';
import * as i0 from "@angular/core";
import * as i1 from "../interactivity-checker/interactivity-checker";
/**
 * Class that allows for trapping focus within a DOM element.
 *
 * This class currently uses a relatively simple approach to focus trapping.
 * It assumes that the tab order is the same as DOM order, which is not necessarily true.
 * Things like `tabIndex > 0`, flex `order`, and shadow roots can cause the two to be misaligned.
 *
 * @deprecated Use `ConfigurableFocusTrap` instead.
 * @breaking-change 11.0.0
 */
export class FocusTrap {
    /** Whether the focus trap is active. */
    get enabled() {
        return this._enabled;
    }
    set enabled(value) {
        this._enabled = value;
        if (this._startAnchor && this._endAnchor) {
            this._toggleAnchorTabIndex(value, this._startAnchor);
            this._toggleAnchorTabIndex(value, this._endAnchor);
        }
    }
    constructor(_element, _checker, _ngZone, _document, deferAnchors = false) {
        this._element = _element;
        this._checker = _checker;
        this._ngZone = _ngZone;
        this._document = _document;
        this._hasAttached = false;
        // Event listeners for the anchors. Need to be regular functions so that we can unbind them later.
        this.startAnchorListener = () => this.focusLastTabbableElement();
        this.endAnchorListener = () => this.focusFirstTabbableElement();
        this._enabled = true;
        if (!deferAnchors) {
            this.attachAnchors();
        }
    }
    /** Destroys the focus trap by cleaning up the anchors. */
    destroy() {
        const startAnchor = this._startAnchor;
        const endAnchor = this._endAnchor;
        if (startAnchor) {
            startAnchor.removeEventListener('focus', this.startAnchorListener);
            startAnchor.remove();
        }
        if (endAnchor) {
            endAnchor.removeEventListener('focus', this.endAnchorListener);
            endAnchor.remove();
        }
        this._startAnchor = this._endAnchor = null;
        this._hasAttached = false;
    }
    /**
     * Inserts the anchors into the DOM. This is usually done automatically
     * in the constructor, but can be deferred for cases like directives with `*ngIf`.
     * @returns Whether the focus trap managed to attach successfully. This may not be the case
     * if the target element isn't currently in the DOM.
     */
    attachAnchors() {
        // If we're not on the browser, there can be no focus to trap.
        if (this._hasAttached) {
            return true;
        }
        this._ngZone.runOutsideAngular(() => {
            if (!this._startAnchor) {
                this._startAnchor = this._createAnchor();
                this._startAnchor.addEventListener('focus', this.startAnchorListener);
            }
            if (!this._endAnchor) {
                this._endAnchor = this._createAnchor();
                this._endAnchor.addEventListener('focus', this.endAnchorListener);
            }
        });
        if (this._element.parentNode) {
            this._element.parentNode.insertBefore(this._startAnchor, this._element);
            this._element.parentNode.insertBefore(this._endAnchor, this._element.nextSibling);
            this._hasAttached = true;
        }
        return this._hasAttached;
    }
    /**
     * Waits for the zone to stabilize, then focuses the first tabbable element.
     * @returns Returns a promise that resolves with a boolean, depending
     * on whether focus was moved successfully.
     */
    focusInitialElementWhenReady(options) {
        return new Promise(resolve => {
            this._executeOnStable(() => resolve(this.focusInitialElement(options)));
        });
    }
    /**
     * Waits for the zone to stabilize, then focuses
     * the first tabbable element within the focus trap region.
     * @returns Returns a promise that resolves with a boolean, depending
     * on whether focus was moved successfully.
     */
    focusFirstTabbableElementWhenReady(options) {
        return new Promise(resolve => {
            this._executeOnStable(() => resolve(this.focusFirstTabbableElement(options)));
        });
    }
    /**
     * Waits for the zone to stabilize, then focuses
     * the last tabbable element within the focus trap region.
     * @returns Returns a promise that resolves with a boolean, depending
     * on whether focus was moved successfully.
     */
    focusLastTabbableElementWhenReady(options) {
        return new Promise(resolve => {
            this._executeOnStable(() => resolve(this.focusLastTabbableElement(options)));
        });
    }
    /**
     * Get the specified boundary element of the trapped region.
     * @param bound The boundary to get (start or end of trapped region).
     * @returns The boundary element.
     */
    _getRegionBoundary(bound) {
        // Contains the deprecated version of selector, for temporary backwards comparability.
        const markers = this._element.querySelectorAll(`[cdk-focus-region-${bound}], ` + `[cdkFocusRegion${bound}], ` + `[cdk-focus-${bound}]`);
        if (typeof ngDevMode === 'undefined' || ngDevMode) {
            for (let i = 0; i < markers.length; i++) {
                // @breaking-change 8.0.0
                if (markers[i].hasAttribute(`cdk-focus-${bound}`)) {
                    console.warn(`Found use of deprecated attribute 'cdk-focus-${bound}', ` +
                        `use 'cdkFocusRegion${bound}' instead. The deprecated ` +
                        `attribute will be removed in 8.0.0.`, markers[i]);
                }
                else if (markers[i].hasAttribute(`cdk-focus-region-${bound}`)) {
                    console.warn(`Found use of deprecated attribute 'cdk-focus-region-${bound}', ` +
                        `use 'cdkFocusRegion${bound}' instead. The deprecated attribute ` +
                        `will be removed in 8.0.0.`, markers[i]);
                }
            }
        }
        if (bound == 'start') {
            return markers.length ? markers[0] : this._getFirstTabbableElement(this._element);
        }
        return markers.length
            ? markers[markers.length - 1]
            : this._getLastTabbableElement(this._element);
    }
    /**
     * Focuses the element that should be focused when the focus trap is initialized.
     * @returns Whether focus was moved successfully.
     */
    focusInitialElement(options) {
        // Contains the deprecated version of selector, for temporary backwards comparability.
        const redirectToElement = this._element.querySelector(`[cdk-focus-initial], ` + `[cdkFocusInitial]`);
        if (redirectToElement) {
            // @breaking-change 8.0.0
            if ((typeof ngDevMode === 'undefined' || ngDevMode) &&
                redirectToElement.hasAttribute(`cdk-focus-initial`)) {
                console.warn(`Found use of deprecated attribute 'cdk-focus-initial', ` +
                    `use 'cdkFocusInitial' instead. The deprecated attribute ` +
                    `will be removed in 8.0.0`, redirectToElement);
            }
            // Warn the consumer if the element they've pointed to
            // isn't focusable, when not in production mode.
            if ((typeof ngDevMode === 'undefined' || ngDevMode) &&
                !this._checker.isFocusable(redirectToElement)) {
                console.warn(`Element matching '[cdkFocusInitial]' is not focusable.`, redirectToElement);
            }
            if (!this._checker.isFocusable(redirectToElement)) {
                const focusableChild = this._getFirstTabbableElement(redirectToElement);
                focusableChild?.focus(options);
                return !!focusableChild;
            }
            redirectToElement.focus(options);
            return true;
        }
        return this.focusFirstTabbableElement(options);
    }
    /**
     * Focuses the first tabbable element within the focus trap region.
     * @returns Whether focus was moved successfully.
     */
    focusFirstTabbableElement(options) {
        const redirectToElement = this._getRegionBoundary('start');
        if (redirectToElement) {
            redirectToElement.focus(options);
        }
        return !!redirectToElement;
    }
    /**
     * Focuses the last tabbable element within the focus trap region.
     * @returns Whether focus was moved successfully.
     */
    focusLastTabbableElement(options) {
        const redirectToElement = this._getRegionBoundary('end');
        if (redirectToElement) {
            redirectToElement.focus(options);
        }
        return !!redirectToElement;
    }
    /**
     * Checks whether the focus trap has successfully been attached.
     */
    hasAttached() {
        return this._hasAttached;
    }
    /** Get the first tabbable element from a DOM subtree (inclusive). */
    _getFirstTabbableElement(root) {
        if (this._checker.isFocusable(root) && this._checker.isTabbable(root)) {
            return root;
        }
        const children = root.children;
        for (let i = 0; i < children.length; i++) {
            const tabbableChild = children[i].nodeType === this._document.ELEMENT_NODE
                ? this._getFirstTabbableElement(children[i])
                : null;
            if (tabbableChild) {
                return tabbableChild;
            }
        }
        return null;
    }
    /** Get the last tabbable element from a DOM subtree (inclusive). */
    _getLastTabbableElement(root) {
        if (this._checker.isFocusable(root) && this._checker.isTabbable(root)) {
            return root;
        }
        // Iterate in reverse DOM order.
        const children = root.children;
        for (let i = children.length - 1; i >= 0; i--) {
            const tabbableChild = children[i].nodeType === this._document.ELEMENT_NODE
                ? this._getLastTabbableElement(children[i])
                : null;
            if (tabbableChild) {
                return tabbableChild;
            }
        }
        return null;
    }
    /** Creates an anchor element. */
    _createAnchor() {
        const anchor = this._document.createElement('div');
        this._toggleAnchorTabIndex(this._enabled, anchor);
        anchor.classList.add('cdk-visually-hidden');
        anchor.classList.add('cdk-focus-trap-anchor');
        anchor.setAttribute('aria-hidden', 'true');
        return anchor;
    }
    /**
     * Toggles the `tabindex` of an anchor, based on the enabled state of the focus trap.
     * @param isEnabled Whether the focus trap is enabled.
     * @param anchor Anchor on which to toggle the tabindex.
     */
    _toggleAnchorTabIndex(isEnabled, anchor) {
        // Remove the tabindex completely, rather than setting it to -1, because if the
        // element has a tabindex, the user might still hit it when navigating with the arrow keys.
        isEnabled ? anchor.setAttribute('tabindex', '0') : anchor.removeAttribute('tabindex');
    }
    /**
     * Toggles the`tabindex` of both anchors to either trap Tab focus or allow it to escape.
     * @param enabled: Whether the anchors should trap Tab.
     */
    toggleAnchors(enabled) {
        if (this._startAnchor && this._endAnchor) {
            this._toggleAnchorTabIndex(enabled, this._startAnchor);
            this._toggleAnchorTabIndex(enabled, this._endAnchor);
        }
    }
    /** Executes a function when the zone is stable. */
    _executeOnStable(fn) {
        if (this._ngZone.isStable) {
            fn();
        }
        else {
            this._ngZone.onStable.pipe(take(1)).subscribe(fn);
        }
    }
}
/**
 * Factory that allows easy instantiation of focus traps.
 * @deprecated Use `ConfigurableFocusTrapFactory` instead.
 * @breaking-change 11.0.0
 */
export class FocusTrapFactory {
    constructor(_checker, _ngZone, _document) {
        this._checker = _checker;
        this._ngZone = _ngZone;
        this._document = _document;
    }
    /**
     * Creates a focus-trapped region around the given element.
     * @param element The element around which focus will be trapped.
     * @param deferCaptureElements Defers the creation of focus-capturing elements to be done
     *     manually by the user.
     * @returns The created focus trap instance.
     */
    create(element, deferCaptureElements = false) {
        return new FocusTrap(element, this._checker, this._ngZone, this._document, deferCaptureElements);
    }
}
FocusTrapFactory.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: FocusTrapFactory, deps: [{ token: i1.InteractivityChecker }, { token: i0.NgZone }, { token: DOCUMENT }], target: i0.ɵɵFactoryTarget.Injectable });
FocusTrapFactory.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: FocusTrapFactory, providedIn: 'root' });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: FocusTrapFactory, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: function () { return [{ type: i1.InteractivityChecker }, { type: i0.NgZone }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [DOCUMENT]
                }] }]; } });
/** Directive for trapping focus within a region. */
export class CdkTrapFocus {
    /** Whether the focus trap is active. */
    get enabled() {
        return this.focusTrap.enabled;
    }
    set enabled(value) {
        this.focusTrap.enabled = coerceBooleanProperty(value);
    }
    /**
     * Whether the directive should automatically move focus into the trapped region upon
     * initialization and return focus to the previous activeElement upon destruction.
     */
    get autoCapture() {
        return this._autoCapture;
    }
    set autoCapture(value) {
        this._autoCapture = coerceBooleanProperty(value);
    }
    constructor(_elementRef, _focusTrapFactory, 
    /**
     * @deprecated No longer being used. To be removed.
     * @breaking-change 13.0.0
     */
    _document) {
        this._elementRef = _elementRef;
        this._focusTrapFactory = _focusTrapFactory;
        /** Previously focused element to restore focus to upon destroy when using autoCapture. */
        this._previouslyFocusedElement = null;
        this.focusTrap = this._focusTrapFactory.create(this._elementRef.nativeElement, true);
    }
    ngOnDestroy() {
        this.focusTrap.destroy();
        // If we stored a previously focused element when using autoCapture, return focus to that
        // element now that the trapped region is being destroyed.
        if (this._previouslyFocusedElement) {
            this._previouslyFocusedElement.focus();
            this._previouslyFocusedElement = null;
        }
    }
    ngAfterContentInit() {
        this.focusTrap.attachAnchors();
        if (this.autoCapture) {
            this._captureFocus();
        }
    }
    ngDoCheck() {
        if (!this.focusTrap.hasAttached()) {
            this.focusTrap.attachAnchors();
        }
    }
    ngOnChanges(changes) {
        const autoCaptureChange = changes['autoCapture'];
        if (autoCaptureChange &&
            !autoCaptureChange.firstChange &&
            this.autoCapture &&
            this.focusTrap.hasAttached()) {
            this._captureFocus();
        }
    }
    _captureFocus() {
        this._previouslyFocusedElement = _getFocusedElementPierceShadowDom();
        this.focusTrap.focusInitialElementWhenReady();
    }
}
CdkTrapFocus.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: CdkTrapFocus, deps: [{ token: i0.ElementRef }, { token: FocusTrapFactory }, { token: DOCUMENT }], target: i0.ɵɵFactoryTarget.Directive });
CdkTrapFocus.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "15.2.0-rc.0", type: CdkTrapFocus, selector: "[cdkTrapFocus]", inputs: { enabled: ["cdkTrapFocus", "enabled"], autoCapture: ["cdkTrapFocusAutoCapture", "autoCapture"] }, exportAs: ["cdkTrapFocus"], usesOnChanges: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: CdkTrapFocus, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkTrapFocus]',
                    exportAs: 'cdkTrapFocus',
                }]
        }], ctorParameters: function () { return [{ type: i0.ElementRef }, { type: FocusTrapFactory }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [DOCUMENT]
                }] }]; }, propDecorators: { enabled: [{
                type: Input,
                args: ['cdkTrapFocus']
            }], autoCapture: [{
                type: Input,
                args: ['cdkTrapFocusAutoCapture']
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9jdXMtdHJhcC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvYTExeS9mb2N1cy10cmFwL2ZvY3VzLXRyYXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFlLHFCQUFxQixFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDMUUsT0FBTyxFQUFDLGlDQUFpQyxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDeEUsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQ3pDLE9BQU8sRUFFTCxTQUFTLEVBQ1QsVUFBVSxFQUNWLE1BQU0sRUFDTixVQUFVLEVBQ1YsS0FBSyxFQUNMLE1BQU0sR0FLUCxNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUMsSUFBSSxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDcEMsT0FBTyxFQUFDLG9CQUFvQixFQUFDLE1BQU0sZ0RBQWdELENBQUM7OztBQUVwRjs7Ozs7Ozs7O0dBU0c7QUFDSCxNQUFNLE9BQU8sU0FBUztJQVNwQix3Q0FBd0M7SUFDeEMsSUFBSSxPQUFPO1FBQ1QsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDO0lBQ3ZCLENBQUM7SUFDRCxJQUFJLE9BQU8sQ0FBQyxLQUFjO1FBQ3hCLElBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO1FBRXRCLElBQUksSUFBSSxDQUFDLFlBQVksSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ3hDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQ3JELElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1NBQ3BEO0lBQ0gsQ0FBQztJQUdELFlBQ1csUUFBcUIsRUFDdEIsUUFBOEIsRUFDN0IsT0FBZSxFQUNmLFNBQW1CLEVBQzVCLFlBQVks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QkFBa0I7UUFDaEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUUvQixJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUU7WUFDcEIsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1NBQ3RCO0lBQ0gsQ0FBQztJQUVELFNBQVM7UUFDUCxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLEVBQUUsRUFBRTtZQUNqQyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsRUFBRSxDQUFDO1NBQ2hDO0lBQ0gsQ0FBQztJQUVELFdBQVcsQ0FBQyxPQUFzQjtRQUNoQyxNQUFNLGlCQUFpQixHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUVqRCxJQUNFLGlCQUFpQjtZQUNqQixDQUFDLGlCQUFpQixDQUFDLFdBQVc7WUFDOUIsSUFBSSxDQUFDLFdBQVc7WUFDaEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLEVBQUUsRUFDNUI7WUFDQSxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7U0FDdEI7SUFDSCxDQUFDO0lBRU8sYUFBYTtRQUNuQixJQUFJLENBQUMseUJBQXlCLEdBQUcsaUNBQWlDLEVBQUUsQ0FBQztRQUNyRSxJQUFJLENBQUMsU0FBUyxDQUFDLDRCQUE0QixFQUFFLENBQUM7SUFDaEQsQ0FBQzs7OEdBbEZVLFlBQVkseUVBb0NiLFFBQVE7a0dBcENQLFlBQVk7Z0dBQVosWUFBWTtrQkFKeEIsU0FBUzttQkFBQztvQkFDVCxRQUFRLEVBQUUsZ0JBQWdCO29CQUMxQixRQUFRLEVBQUUsY0FBYztpQkFDekI7OzBCQXFDSSxNQUFNOzJCQUFDLFFBQVE7NENBM0JkLE9BQU87c0JBRFYsS0FBSzt1QkFBQyxjQUFjO2dCQWFqQixXQUFXO3NCQURkLEtBQUs7dUJBQUMseUJBQXlCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Qm9vbGVhbklucHV0LCBjb2VyY2VCb29sZWFuUHJvcGVydHl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2VyY2lvbic7XG5pbXBvcnQge19nZXRGb2N1c2VkRWxlbWVudFBpZXJjZVNoYWRvd0RvbX0gZnJvbSAnQGFuZ3VsYXIvY2RrL3BsYXRmb3JtJztcbmltcG9ydCB7RE9DVU1FTlR9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQge1xuICBBZnRlckNvbnRlbnRJbml0LFxuICBEaXJlY3RpdmUsXG4gIEVsZW1lbnRSZWYsXG4gIEluamVjdCxcbiAgSW5qZWN0YWJsZSxcbiAgSW5wdXQsXG4gIE5nWm9uZSxcbiAgT25EZXN0cm95LFxuICBEb0NoZWNrLFxuICBTaW1wbGVDaGFuZ2VzLFxuICBPbkNoYW5nZXMsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHt0YWtlfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5pbXBvcnQge0ludGVyYWN0aXZpdHlDaGVja2VyfSBmcm9tICcuLi9pbnRlcmFjdGl2aXR5LWNoZWNrZXIvaW50ZXJhY3Rpdml0eS1jaGVja2VyJztcblxuLyoqXG4gKiBDbGFzcyB0aGF0IGFsbG93cyBmb3IgdHJhcHBpbmcgZm9jdXMgd2l0aGluIGEgRE9NIGVsZW1lbnQuXG4gKlxuICogVGhpcyBjbGFzcyBjdXJyZW50bHkgdXNlcyBhIHJlbGF0aXZlbHkgc2ltcGxlIGFwcHJvYWNoIHRvIGZvY3VzIHRyYXBwaW5nLlxuICogSXQgYXNzdW1lcyB0aGF0IHRoZSB0YWIgb3JkZXIgaXMgdGhlIHNhbWUgYXMgRE9NIG9yZGVyLCB3aGljaCBpcyBub3QgbmVjZXNzYXJpbHkgdHJ1ZS5cbiAqIFRoaW5ncyBsaWtlIGB0YWJJbmRleCA+IDBgLCBmbGV4IGBvcmRlcmAsIGFuZCBzaGFkb3cgcm9vdHMgY2FuIGNhdXNlIHRoZSB0d28gdG8gYmUgbWlzYWxpZ25lZC5cbiAqXG4gKiBAZGVwcmVjYXRlZCBVc2UgYENvbmZpZ3VyYWJsZUZvY3VzVHJhcGAgaW5zdGVhZC5cbiAqIEBicmVha2luZy1jaGFuZ2UgMTEuMC4wXG4gKi9cbmV4cG9ydCBjbGFzcyBGb2N1c1RyYXAge1xuICBwcml2YXRlIF9zdGFydEFuY2hvcjogSFRNTEVsZW1lbnQgfCBudWxsO1xuICBwcml2YXRlIF9lbmRBbmNob3I6IEhUTUxFbGVtZW50IHwgbnVsbDtcbiAgcHJpdmF0ZSBfaGFzQXR0YWNoZWQgPSBmYWxzZTtcblxuICAvLyBFdmVudCBsaXN0ZW5lcnMgZm9yIHRoZSBhbmNob3JzLiBOZWVkIHRvIGJlIHJlZ3VsYXIgZnVuY3Rpb25zIHNvIHRoYXQgd2UgY2FuIHVuYmluZCB0aGVtIGxhdGVyLlxuICBwcm90ZWN0ZWQgc3RhcnRBbmNob3JMaXN0ZW5lciA9ICgpID0+IHRoaXMuZm9jdXNMYXN0VGFiYmFibGVFbGVtZW50KCk7XG4gIHByb3RlY3RlZCBlbmRBbmNob3JMaXN0ZW5lciA9ICgpID0+IHRoaXMuZm9jdXNGaXJzdFRhYmJhYmxlRWxlbWVudCgpO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBmb2N1cyB0cmFwIGlzIGFjdGl2ZS4gKi9cbiAgZ2V0IGVuYWJsZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2VuYWJsZWQ7XG4gIH1cbiAgc2V0IGVuYWJsZWQodmFsdWU6IGJvb2xlYW4pIHtcbiAgICB0aGlzLl9lbmFibGVkID0gdmFsdWU7XG5cbiAgICBpZiAodGhpcy5fc3RhcnRBbmNob3IgJiYgdGhpcy5fZW5kQW5jaG9yKSB7XG4gICAgICB0aGlzLl90b2dnbGVBbmNob3JUYWJJbmRleCh2YWx1ZSwgdGhpcy5fc3RhcnRBbmNob3IpO1xuICAgICAgdGhpcy5fdG9nZ2xlQW5jaG9yVGFiSW5kZXgodmFsdWUsIHRoaXMuX2VuZEFuY2hvcik7XG4gICAgfVxuICB9XG4gIHByb3RlY3RlZCBfZW5hYmxlZDogYm9vbGVhbiA9IHRydWU7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcmVhZG9ubHkgX2VsZW1lbnQ6IEhUTUxFbGVtZW50LFxuICAgIHByaXZhdGUgX2NoZWNrZXI6IEludGVyYWN0aXZpdHlDaGVja2VyLFxuICAgIHJlYWRvbmx5IF9uZ1pvbmU6IE5nWm9uZSxcbiAgICByZWFkb25seSBfZG9jdW1lbnQ6IERvY3VtZW50LFxuICAgIGRlZmVyQW5jaG9ycyA9IGZhbHNlLFxuICApIHtcbiAgICBpZiAoIWRlZmVyQW5jaG9ycykge1xuICAgICAgdGhpcy5hdHRhY2hBbmNob3JzKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIERlc3Ryb3lzIHRoZSBmb2N1cyB0cmFwIGJ5IGNsZWFuaW5nIHVwIHRoZSBhbmNob3JzLiAqL1xuICBkZXN0cm95KCkge1xuICAgIGNvbnN0IHN0YXJ0QW5jaG9yID0gdGhpcy5fc3RhcnRBbmNob3I7XG4gICAgY29uc3QgZW5kQW5jaG9yID0gdGhpcy5fZW5kQW5jaG9yO1xuXG4gICAgaWYgKHN0YXJ0QW5jaG9yKSB7XG4gICAgICBzdGFydEFuY2hvci5yZW1vdmVFdmVudExpc3RlbmVyKCdmb2N1cycsIHRoaXMuc3RhcnRBbmNob3JMaXN0ZW5lcik7XG4gICAgICBzdGFydEFuY2hvci5yZW1vdmUoKTtcbiAgICB9XG5cbiAgICBpZiAoZW5kQW5jaG9yKSB7XG4gICAgICBlbmRBbmNob3IucmVtb3ZlRXZlbnRMaXN0ZW5lcignZm9jdXMnLCB0aGlzLmVuZEFuY2hvckxpc3RlbmVyKTtcbiAgICAgIGVuZEFuY2hvci5yZW1vdmUoKTtcbiAgICB9XG5cbiAgICB0aGlzLl9zdGFydEFuY2hvciA9IHRoaXMuX2VuZEFuY2hvciA9IG51bGw7XG4gICAgdGhpcy5faGFzQXR0YWNoZWQgPSBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbnNlcnRzIHRoZSBhbmNob3JzIGludG8gdGhlIERPTS4gVGhpcyBpcyB1c3VhbGx5IGRvbmUgYXV0b21hdGljYWxseVxuICAgKiBpbiB0aGUgY29uc3RydWN0b3IsIGJ1dCBjYW4gYmUgZGVmZXJyZWQgZm9yIGNhc2VzIGxpa2UgZGlyZWN0aXZlcyB3aXRoIGAqbmdJZmAuXG4gICAqIEByZXR1cm5zIFdoZXRoZXIgdGhlIGZvY3VzIHRyYXAgbWFuYWdlZCB0byBhdHRhY2ggc3VjY2Vzc2Z1bGx5LiBUaGlzIG1heSBub3QgYmUgdGhlIGNhc2VcbiAgICogaWYgdGhlIHRhcmdldCBlbGVtZW50IGlzbid0IGN1cnJlbnRseSBpbiB0aGUgRE9NLlxuICAgKi9cbiAgYXR0YWNoQW5jaG9ycygpOiBib29sZWFuIHtcbiAgICAvLyBJZiB3ZSdyZSBub3Qgb24gdGhlIGJyb3dzZXIsIHRoZXJlIGNhbiBiZSBubyBmb2N1cyB0byB0cmFwLlxuICAgIGlmICh0aGlzLl9oYXNBdHRhY2hlZCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgdGhpcy5fbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgIGlmICghdGhpcy5fc3RhcnRBbmNob3IpIHtcbiAgICAgICAgdGhpcy5fc3RhcnRBbmNob3IgPSB0aGlzLl9jcmVhdGVBbmNob3IoKTtcbiAgICAgICAgdGhpcy5fc3RhcnRBbmNob3IhLmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgdGhpcy5zdGFydEFuY2hvckxpc3RlbmVyKTtcbiAgICAgIH1cblxuICAgICAgaWYgKCF0aGlzLl9lbmRBbmNob3IpIHtcbiAgICAgICAgdGhpcy5fZW5kQW5jaG9yID0gdGhpcy5fY3JlYXRlQW5jaG9yKCk7XG4gICAgICAgIHRoaXMuX2VuZEFuY2hvciEuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXMnLCB0aGlzLmVuZEFuY2hvckxpc3RlbmVyKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGlmICh0aGlzLl9lbGVtZW50LnBhcmVudE5vZGUpIHtcbiAgICAgIHRoaXMuX2VsZW1lbnQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUodGhpcy5fc3RhcnRBbmNob3IhLCB0aGlzLl9lbGVtZW50KTtcbiAgICAgIHRoaXMuX2VsZW1lbnQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUodGhpcy5fZW5kQW5jaG9yISwgdGhpcy5fZWxlbWVudC5uZXh0U2libGluZyk7XG4gICAgICB0aGlzLl9oYXNBdHRhY2hlZCA9IHRydWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX2hhc0F0dGFjaGVkO1xuICB9XG5cbiAgLyoqXG4gICAqIFdhaXRzIGZvciB0aGUgem9uZSB0byBzdGFiaWxpemUsIHRoZW4gZm9jdXNlcyB0aGUgZmlyc3QgdGFiYmFibGUgZWxlbWVudC5cbiAgICogQHJldHVybnMgUmV0dXJucyBhIHByb21pc2UgdGhhdCByZXNvbHZlcyB3aXRoIGEgYm9vbGVhbiwgZGVwZW5kaW5nXG4gICAqIG9uIHdoZXRoZXIgZm9jdXMgd2FzIG1vdmVkIHN1Y2Nlc3NmdWxseS5cbiAgICovXG4gIGZvY3VzSW5pdGlhbEVsZW1lbnRXaGVuUmVhZHkob3B0aW9ucz86IEZvY3VzT3B0aW9ucyk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZTxib29sZWFuPihyZXNvbHZlID0+IHtcbiAgICAgIHRoaXMuX2V4ZWN1dGVPblN0YWJsZSgoKSA9PiByZXNvbHZlKHRoaXMuZm9jdXNJbml0aWFsRWxlbWVudChvcHRpb25zKSkpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFdhaXRzIGZvciB0aGUgem9uZSB0byBzdGFiaWxpemUsIHRoZW4gZm9jdXNlc1xuICAgKiB0aGUgZmlyc3QgdGFiYmFibGUgZWxlbWVudCB3aXRoaW4gdGhlIGZvY3VzIHRyYXAgcmVnaW9uLlxuICAgKiBAcmV0dXJucyBSZXR1cm5zIGEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHdpdGggYSBib29sZWFuLCBkZXBlbmRpbmdcbiAgICogb24gd2hldGhlciBmb2N1cyB3YXMgbW92ZWQgc3VjY2Vzc2Z1bGx5LlxuICAgKi9cbiAgZm9jdXNGaXJzdFRhYmJhYmxlRWxlbWVudFdoZW5SZWFkeShvcHRpb25zPzogRm9jdXNPcHRpb25zKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPGJvb2xlYW4+KHJlc29sdmUgPT4ge1xuICAgICAgdGhpcy5fZXhlY3V0ZU9uU3RhYmxlKCgpID0+IHJlc29sdmUodGhpcy5mb2N1c0ZpcnN0VGFiYmFibGVFbGVtZW50KG9wdGlvbnMpKSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogV2FpdHMgZm9yIHRoZSB6b25lIHRvIHN0YWJpbGl6ZSwgdGhlbiBmb2N1c2VzXG4gICAqIHRoZSBsYXN0IHRhYmJhYmxlIGVsZW1lbnQgd2l0aGluIHRoZSBmb2N1cyB0cmFwIHJlZ2lvbi5cbiAgICogQHJldHVybnMgUmV0dXJucyBhIHByb21pc2UgdGhhdCByZXNvbHZlcyB3aXRoIGEgYm9vbGVhbiwgZGVwZW5kaW5nXG4gICAqIG9uIHdoZXRoZXIgZm9jdXMgd2FzIG1vdmVkIHN1Y2Nlc3NmdWxseS5cbiAgICovXG4gIGZvY3VzTGFzdFRhYmJhYmxlRWxlbWVudFdoZW5SZWFkeShvcHRpb25zPzogRm9jdXNPcHRpb25zKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPGJvb2xlYW4+KHJlc29sdmUgPT4ge1xuICAgICAgdGhpcy5fZXhlY3V0ZU9uU3RhYmxlKCgpID0+IHJlc29sdmUodGhpcy5mb2N1c0xhc3RUYWJiYWJsZUVsZW1lbnQob3B0aW9ucykpKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIHNwZWNpZmllZCBib3VuZGFyeSBlbGVtZW50IG9mIHRoZSB0cmFwcGVkIHJlZ2lvbi5cbiAgICogQHBhcmFtIGJvdW5kIFRoZSBib3VuZGFyeSB0byBnZXQgKHN0YXJ0IG9yIGVuZCBvZiB0cmFwcGVkIHJlZ2lvbikuXG4gICAqIEByZXR1cm5zIFRoZSBib3VuZGFyeSBlbGVtZW50LlxuICAgKi9cbiAgcHJpdmF0ZSBfZ2V0UmVnaW9uQm91bmRhcnkoYm91bmQ6ICdzdGFydCcgfCAnZW5kJyk6IEhUTUxFbGVtZW50IHwgbnVsbCB7XG4gICAgLy8gQ29udGFpbnMgdGhlIGRlcHJlY2F0ZWQgdmVyc2lvbiBvZiBzZWxlY3RvciwgZm9yIHRlbXBvcmFyeSBiYWNrd2FyZHMgY29tcGFyYWJpbGl0eS5cbiAgICBjb25zdCBtYXJrZXJzID0gdGhpcy5fZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKFxuICAgICAgYFtjZGstZm9jdXMtcmVnaW9uLSR7Ym91bmR9XSwgYCArIGBbY2RrRm9jdXNSZWdpb24ke2JvdW5kfV0sIGAgKyBgW2Nkay1mb2N1cy0ke2JvdW5kfV1gLFxuICAgICkgYXMgTm9kZUxpc3RPZjxIVE1MRWxlbWVudD47XG5cbiAgICBpZiAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSB7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG1hcmtlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgLy8gQGJyZWFraW5nLWNoYW5nZSA4LjAuMFxuICAgICAgICBpZiAobWFya2Vyc1tpXS5oYXNBdHRyaWJ1dGUoYGNkay1mb2N1cy0ke2JvdW5kfWApKSB7XG4gICAgICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAgICAgYEZvdW5kIHVzZSBvZiBkZXByZWNhdGVkIGF0dHJpYnV0ZSAnY2RrLWZvY3VzLSR7Ym91bmR9JywgYCArXG4gICAgICAgICAgICAgIGB1c2UgJ2Nka0ZvY3VzUmVnaW9uJHtib3VuZH0nIGluc3RlYWQuIFRoZSBkZXByZWNhdGVkIGAgK1xuICAgICAgICAgICAgICBgYXR0cmlidXRlIHdpbGwgYmUgcmVtb3ZlZCBpbiA4LjAuMC5gLFxuICAgICAgICAgICAgbWFya2Vyc1tpXSxcbiAgICAgICAgICApO1xuICAgICAgICB9IGVsc2UgaWYgKG1hcmtlcnNbaV0uaGFzQXR0cmlidXRlKGBjZGstZm9jdXMtcmVnaW9uLSR7Ym91bmR9YCkpIHtcbiAgICAgICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgICAgICBgRm91bmQgdXNlIG9mIGRlcHJlY2F0ZWQgYXR0cmlidXRlICdjZGstZm9jdXMtcmVnaW9uLSR7Ym91bmR9JywgYCArXG4gICAgICAgICAgICAgIGB1c2UgJ2Nka0ZvY3VzUmVnaW9uJHtib3VuZH0nIGluc3RlYWQuIFRoZSBkZXByZWNhdGVkIGF0dHJpYnV0ZSBgICtcbiAgICAgICAgICAgICAgYHdpbGwgYmUgcmVtb3ZlZCBpbiA4LjAuMC5gLFxuICAgICAgICAgICAgbWFya2Vyc1tpXSxcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGJvdW5kID09ICdzdGFydCcpIHtcbiAgICAgIHJldHVybiBtYXJrZXJzLmxlbmd0aCA/IG1hcmtlcnNbMF0gOiB0aGlzLl9nZXRGaXJzdFRhYmJhYmxlRWxlbWVudCh0aGlzLl9lbGVtZW50KTtcbiAgICB9XG4gICAgcmV0dXJuIG1hcmtlcnMubGVuZ3RoXG4gICAgICA/IG1hcmtlcnNbbWFya2Vycy5sZW5ndGggLSAxXVxuICAgICAgOiB0aGlzLl9nZXRMYXN0VGFiYmFibGVFbGVtZW50KHRoaXMuX2VsZW1lbnQpO1xuICB9XG5cbiAgLyoqXG4gICAqIEZvY3VzZXMgdGhlIGVsZW1lbnQgdGhhdCBzaG91bGQgYmUgZm9jdXNlZCB3aGVuIHRoZSBmb2N1cyB0cmFwIGlzIGluaXRpYWxpemVkLlxuICAgKiBAcmV0dXJucyBXaGV0aGVyIGZvY3VzIHdhcyBtb3ZlZCBzdWNjZXNzZnVsbHkuXG4gICAqL1xuICBmb2N1c0luaXRpYWxFbGVtZW50KG9wdGlvbnM/OiBGb2N1c09wdGlvbnMpOiBib29sZWFuIHtcbiAgICAvLyBDb250YWlucyB0aGUgZGVwcmVjYXRlZCB2ZXJzaW9uIG9mIHNlbGVjdG9yLCBmb3IgdGVtcG9yYXJ5IGJhY2t3YXJkcyBjb21wYXJhYmlsaXR5LlxuICAgIGNvbnN0IHJlZGlyZWN0VG9FbGVtZW50ID0gdGhpcy5fZWxlbWVudC5xdWVyeVNlbGVjdG9yKFxuICAgICAgYFtjZGstZm9jdXMtaW5pdGlhbF0sIGAgKyBgW2Nka0ZvY3VzSW5pdGlhbF1gLFxuICAgICkgYXMgSFRNTEVsZW1lbnQ7XG5cbiAgICBpZiAocmVkaXJlY3RUb0VsZW1lbnQpIHtcbiAgICAgIC8vIEBicmVha2luZy1jaGFuZ2UgOC4wLjBcbiAgICAgIGlmIChcbiAgICAgICAgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkgJiZcbiAgICAgICAgcmVkaXJlY3RUb0VsZW1lbnQuaGFzQXR0cmlidXRlKGBjZGstZm9jdXMtaW5pdGlhbGApXG4gICAgICApIHtcbiAgICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAgIGBGb3VuZCB1c2Ugb2YgZGVwcmVjYXRlZCBhdHRyaWJ1dGUgJ2Nkay1mb2N1cy1pbml0aWFsJywgYCArXG4gICAgICAgICAgICBgdXNlICdjZGtGb2N1c0luaXRpYWwnIGluc3RlYWQuIFRoZSBkZXByZWNhdGVkIGF0dHJpYnV0ZSBgICtcbiAgICAgICAgICAgIGB3aWxsIGJlIHJlbW92ZWQgaW4gOC4wLjBgLFxuICAgICAgICAgIHJlZGlyZWN0VG9FbGVtZW50LFxuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICAvLyBXYXJuIHRoZSBjb25zdW1lciBpZiB0aGUgZWxlbWVudCB0aGV5J3ZlIHBvaW50ZWQgdG9cbiAgICAgIC8vIGlzbid0IGZvY3VzYWJsZSwgd2hlbiBub3QgaW4gcHJvZHVjdGlvbiBtb2RlLlxuICAgICAgaWYgKFxuICAgICAgICAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSAmJlxuICAgICAgICAhdGhpcy5fY2hlY2tlci5pc0ZvY3VzYWJsZShyZWRpcmVjdFRvRWxlbWVudClcbiAgICAgICkge1xuICAgICAgICBjb25zb2xlLndhcm4oYEVsZW1lbnQgbWF0Y2hpbmcgJ1tjZGtGb2N1c0luaXRpYWxdJyBpcyBub3QgZm9jdXNhYmxlLmAsIHJlZGlyZWN0VG9FbGVtZW50KTtcbiAgICAgIH1cblxuICAgICAgaWYgKCF0aGlzLl9jaGVja2VyLmlzRm9jdXNhYmxlKHJlZGlyZWN0VG9FbGVtZW50KSkge1xuICAgICAgICBjb25zdCBmb2N1c2FibGVDaGlsZCA9IHRoaXMuX2dldEZpcnN0VGFiYmFibGVFbGVtZW50KHJlZGlyZWN0VG9FbGVtZW50KSBhcyBIVE1MRWxlbWVudDtcbiAgICAgICAgZm9jdXNhYmxlQ2hpbGQ/LmZvY3VzKG9wdGlvbnMpO1xuICAgICAgICByZXR1cm4gISFmb2N1c2FibGVDaGlsZDtcbiAgICAgIH1cblxuICAgICAgcmVkaXJlY3RUb0VsZW1lbnQuZm9jdXMob3B0aW9ucyk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5mb2N1c0ZpcnN0VGFiYmFibGVFbGVtZW50KG9wdGlvbnMpO1xuICB9XG5cbiAgLyoqXG4gICAqIEZvY3VzZXMgdGhlIGZpcnN0IHRhYmJhYmxlIGVsZW1lbnQgd2l0aGluIHRoZSBmb2N1cyB0cmFwIHJlZ2lvbi5cbiAgICogQHJldHVybnMgV2hldGhlciBmb2N1cyB3YXMgbW92ZWQgc3VjY2Vzc2Z1bGx5LlxuICAgKi9cbiAgZm9jdXNGaXJzdFRhYmJhYmxlRWxlbWVudChvcHRpb25zPzogRm9jdXNPcHRpb25zKTogYm9vbGVhbiB7XG4gICAgY29uc3QgcmVkaXJlY3RUb0VsZW1lbnQgPSB0aGlzLl9nZXRSZWdpb25Cb3VuZGFyeSgnc3RhcnQnKTtcblxuICAgIGlmIChyZWRpcmVjdFRvRWxlbWVudCkge1xuICAgICAgcmVkaXJlY3RUb0VsZW1lbnQuZm9jdXMob3B0aW9ucyk7XG4gICAgfVxuXG4gICAgcmV0dXJuICEhcmVkaXJlY3RUb0VsZW1lbnQ7XG4gIH1cblxuICAvKipcbiAgICogRm9jdXNlcyB0aGUgbGFzdCB0YWJiYWJsZSBlbGVtZW50IHdpdGhpbiB0aGUgZm9jdXMgdHJhcCByZWdpb24uXG4gICAqIEByZXR1cm5zIFdoZXRoZXIgZm9jdXMgd2FzIG1vdmVkIHN1Y2Nlc3NmdWxseS5cbiAgICovXG4gIGZvY3VzTGFzdFRhYmJhYmxlRWxlbWVudChvcHRpb25zPzogRm9jdXNPcHRpb25zKTogYm9vbGVhbiB7XG4gICAgY29uc3QgcmVkaXJlY3RUb0VsZW1lbnQgPSB0aGlzLl9nZXRSZWdpb25Cb3VuZGFyeSgnZW5kJyk7XG5cbiAgICBpZiAocmVkaXJlY3RUb0VsZW1lbnQpIHtcbiAgICAgIHJlZGlyZWN0VG9FbGVtZW50LmZvY3VzKG9wdGlvbnMpO1xuICAgIH1cblxuICAgIHJldHVybiAhIXJlZGlyZWN0VG9FbGVtZW50O1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyB3aGV0aGVyIHRoZSBmb2N1cyB0cmFwIGhhcyBzdWNjZXNzZnVsbHkgYmVlbiBhdHRhY2hlZC5cbiAgICovXG4gIGhhc0F0dGFjaGVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9oYXNBdHRhY2hlZDtcbiAgfVxuXG4gIC8qKiBHZXQgdGhlIGZpcnN0IHRhYmJhYmxlIGVsZW1lbnQgZnJvbSBhIERPTSBzdWJ0cmVlIChpbmNsdXNpdmUpLiAqL1xuICBwcml2YXRlIF9nZXRGaXJzdFRhYmJhYmxlRWxlbWVudChyb290OiBIVE1MRWxlbWVudCk6IEhUTUxFbGVtZW50IHwgbnVsbCB7XG4gICAgaWYgKHRoaXMuX2NoZWNrZXIuaXNGb2N1c2FibGUocm9vdCkgJiYgdGhpcy5fY2hlY2tlci5pc1RhYmJhYmxlKHJvb3QpKSB7XG4gICAgICByZXR1cm4gcm9vdDtcbiAgICB9XG5cbiAgICBjb25zdCBjaGlsZHJlbiA9IHJvb3QuY2hpbGRyZW47XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCB0YWJiYWJsZUNoaWxkID1cbiAgICAgICAgY2hpbGRyZW5baV0ubm9kZVR5cGUgPT09IHRoaXMuX2RvY3VtZW50LkVMRU1FTlRfTk9ERVxuICAgICAgICAgID8gdGhpcy5fZ2V0Rmlyc3RUYWJiYWJsZUVsZW1lbnQoY2hpbGRyZW5baV0gYXMgSFRNTEVsZW1lbnQpXG4gICAgICAgICAgOiBudWxsO1xuXG4gICAgICBpZiAodGFiYmFibGVDaGlsZCkge1xuICAgICAgICByZXR1cm4gdGFiYmFibGVDaGlsZDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8qKiBHZXQgdGhlIGxhc3QgdGFiYmFibGUgZWxlbWVudCBmcm9tIGEgRE9NIHN1YnRyZWUgKGluY2x1c2l2ZSkuICovXG4gIHByaXZhdGUgX2dldExhc3RUYWJiYWJsZUVsZW1lbnQocm9vdDogSFRNTEVsZW1lbnQpOiBIVE1MRWxlbWVudCB8IG51bGwge1xuICAgIGlmICh0aGlzLl9jaGVja2VyLmlzRm9jdXNhYmxlKHJvb3QpICYmIHRoaXMuX2NoZWNrZXIuaXNUYWJiYWJsZShyb290KSkge1xuICAgICAgcmV0dXJuIHJvb3Q7XG4gICAgfVxuXG4gICAgLy8gSXRlcmF0ZSBpbiByZXZlcnNlIERPTSBvcmRlci5cbiAgICBjb25zdCBjaGlsZHJlbiA9IHJvb3QuY2hpbGRyZW47XG5cbiAgICBmb3IgKGxldCBpID0gY2hpbGRyZW4ubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgIGNvbnN0IHRhYmJhYmxlQ2hpbGQgPVxuICAgICAgICBjaGlsZHJlbltpXS5ub2RlVHlwZSA9PT0gdGhpcy5fZG9jdW1lbnQuRUxFTUVOVF9OT0RFXG4gICAgICAgICAgPyB0aGlzLl9nZXRMYXN0VGFiYmFibGVFbGVtZW50KGNoaWxkcmVuW2ldIGFzIEhUTUxFbGVtZW50KVxuICAgICAgICAgIDogbnVsbDtcblxuICAgICAgaWYgKHRhYmJhYmxlQ2hpbGQpIHtcbiAgICAgICAgcmV0dXJuIHRhYmJhYmxlQ2hpbGQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvKiogQ3JlYXRlcyBhbiBhbmNob3IgZWxlbWVudC4gKi9cbiAgcHJpdmF0ZSBfY3JlYXRlQW5jaG9yKCk6IEhUTUxFbGVtZW50IHtcbiAgICBjb25zdCBhbmNob3IgPSB0aGlzLl9kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICB0aGlzLl90b2dnbGVBbmNob3JUYWJJbmRleCh0aGlzLl9lbmFibGVkLCBhbmNob3IpO1xuICAgIGFuY2hvci5jbGFzc0xpc3QuYWRkKCdjZGstdmlzdWFsbHktaGlkZGVuJyk7XG4gICAgYW5jaG9yLmNsYXNzTGlzdC5hZGQoJ2Nkay1mb2N1cy10cmFwLWFuY2hvcicpO1xuICAgIGFuY2hvci5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJywgJ3RydWUnKTtcbiAgICByZXR1cm4gYW5jaG9yO1xuICB9XG5cbiAgLyoqXG4gICAqIFRvZ2dsZXMgdGhlIGB0YWJpbmRleGAgb2YgYW4gYW5jaG9yLCBiYXNlZCBvbiB0aGUgZW5hYmxlZCBzdGF0ZSBvZiB0aGUgZm9jdXMgdHJhcC5cbiAgICogQHBhcmFtIGlzRW5hYmxlZCBXaGV0aGVyIHRoZSBmb2N1cyB0cmFwIGlzIGVuYWJsZWQuXG4gICAqIEBwYXJhbSBhbmNob3IgQW5jaG9yIG9uIHdoaWNoIHRvIHRvZ2dsZSB0aGUgdGFiaW5kZXguXG4gICAqL1xuICBwcml2YXRlIF90b2dnbGVBbmNob3JUYWJJbmRleChpc0VuYWJsZWQ6IGJvb2xlYW4sIGFuY2hvcjogSFRNTEVsZW1lbnQpIHtcbiAgICAvLyBSZW1vdmUgdGhlIHRhYmluZGV4IGNvbXBsZXRlbHksIHJhdGhlciB0aGFuIHNldHRpbmcgaXQgdG8gLTEsIGJlY2F1c2UgaWYgdGhlXG4gICAgLy8gZWxlbWVudCBoYXMgYSB0YWJpbmRleCwgdGhlIHVzZXIgbWlnaHQgc3RpbGwgaGl0IGl0IHdoZW4gbmF2aWdhdGluZyB3aXRoIHRoZSBhcnJvdyBrZXlzLlxuICAgIGlzRW5hYmxlZCA/IGFuY2hvci5zZXRBdHRyaWJ1dGUoJ3RhYmluZGV4JywgJzAnKSA6IGFuY2hvci5yZW1vdmVBdHRyaWJ1dGUoJ3RhYmluZGV4Jyk7XG4gIH1cblxuICAvKipcbiAgICogVG9nZ2xlcyB0aGVgdGFiaW5kZXhgIG9mIGJvdGggYW5jaG9ycyB0byBlaXRoZXIgdHJhcCBUYWIgZm9jdXMgb3IgYWxsb3cgaXQgdG8gZXNjYXBlLlxuICAgKiBAcGFyYW0gZW5hYmxlZDogV2hldGhlciB0aGUgYW5jaG9ycyBzaG91bGQgdHJhcCBUYWIuXG4gICAqL1xuICBwcm90ZWN0ZWQgdG9nZ2xlQW5jaG9ycyhlbmFibGVkOiBib29sZWFuKSB7XG4gICAgaWYgKHRoaXMuX3N0YXJ0QW5jaG9yICYmIHRoaXMuX2VuZEFuY2hvcikge1xuICAgICAgdGhpcy5fdG9nZ2xlQW5jaG9yVGFiSW5kZXgoZW5hYmxlZCwgdGhpcy5fc3RhcnRBbmNob3IpO1xuICAgICAgdGhpcy5fdG9nZ2xlQW5jaG9yVGFiSW5kZXgoZW5hYmxlZCwgdGhpcy5fZW5kQW5jaG9yKTtcbiAgICB9XG4gIH1cblxuICAvKiogRXhlY3V0ZXMgYSBmdW5jdGlvbiB3aGVuIHRoZSB6b25lIGlzIHN0YWJsZS4gKi9cbiAgcHJpdmF0ZSBfZXhlY3V0ZU9uU3RhYmxlKGZuOiAoKSA9PiBhbnkpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fbmdab25lLmlzU3RhYmxlKSB7XG4gICAgICBmbigpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9uZ1pvbmUub25TdGFibGUucGlwZSh0YWtlKDEpKS5zdWJzY3JpYmUoZm4pO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEZhY3RvcnkgdGhhdCBhbGxvd3MgZWFzeSBpbnN0YW50aWF0aW9uIG9mIGZvY3VzIHRyYXBzLlxuICogQGRlcHJlY2F0ZWQgVXNlIGBDb25maWd1cmFibGVGb2N1c1RyYXBGYWN0b3J5YCBpbnN0ZWFkLlxuICogQGJyZWFraW5nLWNoYW5nZSAxMS4wLjBcbiAqL1xuQEluamVjdGFibGUoe3Byb3ZpZGVkSW46ICdyb290J30pXG5leHBvcnQgY2xhc3MgRm9jdXNUcmFwRmFjdG9yeSB7XG4gIHByaXZhdGUgX2RvY3VtZW50OiBEb2N1bWVudDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIF9jaGVja2VyOiBJbnRlcmFjdGl2aXR5Q2hlY2tlcixcbiAgICBwcml2YXRlIF9uZ1pvbmU6IE5nWm9uZSxcbiAgICBASW5qZWN0KERPQ1VNRU5UKSBfZG9jdW1lbnQ6IGFueSxcbiAgKSB7XG4gICAgdGhpcy5fZG9jdW1lbnQgPSBfZG9jdW1lbnQ7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIGZvY3VzLXRyYXBwZWQgcmVnaW9uIGFyb3VuZCB0aGUgZ2l2ZW4gZWxlbWVudC5cbiAgICogQHBhcmFtIGVsZW1lbnQgVGhlIGVsZW1lbnQgYXJvdW5kIHdoaWNoIGZvY3VzIHdpbGwgYmUgdHJhcHBlZC5cbiAgICogQHBhcmFtIGRlZmVyQ2FwdHVyZUVsZW1lbnRzIERlZmVycyB0aGUgY3JlYXRpb24gb2YgZm9jdXMtY2FwdHVyaW5nIGVsZW1lbnRzIHRvIGJlIGRvbmVcbiAgICogICAgIG1hbnVhbGx5IGJ5IHRoZSB1c2VyLlxuICAgKiBAcmV0dXJucyBUaGUgY3JlYXRlZCBmb2N1cyB0cmFwIGluc3RhbmNlLlxuICAgKi9cbiAgY3JlYXRlKGVsZW1lbnQ6IEhUTUxFbGVtZW50LCBkZWZlckNhcHR1cmVFbGVtZW50czogYm9vbGVhbiA9IGZhbHNlKTogRm9jdXNUcmFwIHtcbiAgICByZXR1cm4gbmV3IEZvY3VzVHJhcChcbiAgICAgIGVsZW1lbnQsXG4gICAgICB0aGlzLl9jaGVja2VyLFxuICAgICAgdGhpcy5fbmdab25lLFxuICAgICAgdGhpcy5fZG9jdW1lbnQsXG4gICAgICBkZWZlckNhcHR1cmVFbGVtZW50cyxcbiAgICApO1xuICB9XG59XG5cbi8qKiBEaXJlY3RpdmUgZm9yIHRyYXBwaW5nIGZvY3VzIHdpdGhpbiBhIHJlZ2lvbi4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tjZGtUcmFwRm9jdXNdJyxcbiAgZXhwb3J0QXM6ICdjZGtUcmFwRm9jdXMnLFxufSlcbmV4cG9ydCBjbGFzcyBDZGtUcmFwRm9jdXMgaW1wbGVtZW50cyBPbkRlc3Ryb3ksIEFmdGVyQ29udGVudEluaXQsIE9uQ2hhbmdlcywgRG9DaGVjayB7XG4gIC8qKiBVbmRlcmx5aW5nIEZvY3VzVHJhcCBpbnN0YW5jZS4gKi9cbiAgZm9jdXNUcmFwOiBGb2N1c1RyYXA7XG5cbiAgLyoqIFByZXZpb3VzbHkgZm9jdXNlZCBlbGVtZW50IHRvIHJlc3RvcmUgZm9jdXMgdG8gdXBvbiBkZXN0cm95IHdoZW4gdXNpbmcgYXV0b0NhcHR1cmUuICovXG4gIHByaXZhdGUgX3ByZXZpb3VzbHlGb2N1c2VkRWxlbWVudDogSFRNTEVsZW1lbnQgfCBudWxsID0gbnVsbDtcblxuICAvKiogV2hldGhlciB0aGUgZm9jdXMgdHJhcCBpcyBhY3RpdmUuICovXG4gIEBJbnB1dCgnY2RrVHJhcEZvY3VzJylcbiAgZ2V0IGVuYWJsZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuZm9jdXNUcmFwLmVuYWJsZWQ7XG4gIH1cbiAgc2V0IGVuYWJsZWQodmFsdWU6IEJvb2xlYW5JbnB1dCkge1xuICAgIHRoaXMuZm9jdXNUcmFwLmVuYWJsZWQgPSBjb2VyY2VCb29sZWFuUHJvcGVydHkodmFsdWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlIGRpcmVjdGl2ZSBzaG91bGQgYXV0b21hdGljYWxseSBtb3ZlIGZvY3VzIGludG8gdGhlIHRyYXBwZWQgcmVnaW9uIHVwb25cbiAgICogaW5pdGlhbGl6YXRpb24gYW5kIHJldHVybiBmb2N1cyB0byB0aGUgcHJldmlvdXMgYWN0aXZlRWxlbWVudCB1cG9uIGRlc3RydWN0aW9uLlxuICAgKi9cbiAgQElucHV0KCdjZGtUcmFwRm9jdXNBdXRvQ2FwdHVyZScpXG4gIGdldCBhdXRvQ2FwdHVyZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fYXV0b0NhcHR1cmU7XG4gIH1cbiAgc2V0IGF1dG9DYXB0dXJlKHZhbHVlOiBCb29sZWFuSW5wdXQpIHtcbiAgICB0aGlzLl9hdXRvQ2FwdHVyZSA9IGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eSh2YWx1ZSk7XG4gIH1cbiAgcHJpdmF0ZSBfYXV0b0NhcHR1cmU6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBfZWxlbWVudFJlZjogRWxlbWVudFJlZjxIVE1MRWxlbWVudD4sXG4gICAgcHJpdmF0ZSBfZm9jdXNUcmFwRmFjdG9yeTogRm9jdXNUcmFwRmFjdG9yeSxcbiAgICAvKipcbiAgICAgKiBAZGVwcmVjYXRlZCBObyBsb25nZXIgYmVpbmcgdXNlZC4gVG8gYmUgcmVtb3ZlZC5cbiAgICAgKiBAYnJlYWtpbmctY2hhbmdlIDEzLjAuMFxuICAgICAqL1xuICAgIEBJbmplY3QoRE9DVU1FTlQpIF9kb2N1bWVudDogYW55LFxuICApIHtcbiAgICB0aGlzLmZvY3VzVHJhcCA9IHRoaXMuX2ZvY3VzVHJhcEZhY3RvcnkuY3JlYXRlKHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudCwgdHJ1ZSk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLmZvY3VzVHJhcC5kZXN0cm95KCk7XG5cbiAgICAvLyBJZiB3ZSBzdG9yZWQgYSBwcmV2aW91c2x5IGZvY3VzZWQgZWxlbWVudCB3aGVuIHVzaW5nIGF1dG9DYXB0dXJlLCByZXR1cm4gZm9jdXMgdG8gdGhhdFxuICAgIC8vIGVsZW1lbnQgbm93IHRoYXQgdGhlIHRyYXBwZWQgcmVnaW9uIGlzIGJlaW5nIGRlc3Ryb3llZC5cbiAgICBpZiAodGhpcy5fcHJldmlvdXNseUZvY3VzZWRFbGVtZW50KSB7XG4gICAgICB0aGlzLl9wcmV2aW91c2x5Rm9jdXNlZEVsZW1lbnQuZm9jdXMoKTtcbiAgICAgIHRoaXMuX3ByZXZpb3VzbHlGb2N1c2VkRWxlbWVudCA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgbmdBZnRlckNvbnRlbnRJbml0KCkge1xuICAgIHRoaXMuZm9jdXNUcmFwLmF0dGFjaEFuY2hvcnMoKTtcblxuICAgIGlmICh0aGlzLmF1dG9DYXB0dXJlKSB7XG4gICAgICB0aGlzLl9jYXB0dXJlRm9jdXMoKTtcbiAgICB9XG4gIH1cblxuICBuZ0RvQ2hlY2soKSB7XG4gICAgaWYgKCF0aGlzLmZvY3VzVHJhcC5oYXNBdHRhY2hlZCgpKSB7XG4gICAgICB0aGlzLmZvY3VzVHJhcC5hdHRhY2hBbmNob3JzKCk7XG4gICAgfVxuICB9XG5cbiAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcykge1xuICAgIGNvbnN0IGF1dG9DYXB0dXJlQ2hhbmdlID0gY2hhbmdlc1snYXV0b0NhcHR1cmUnXTtcblxuICAgIGlmIChcbiAgICAgIGF1dG9DYXB0dXJlQ2hhbmdlICYmXG4gICAgICAhYXV0b0NhcHR1cmVDaGFuZ2UuZmlyc3RDaGFuZ2UgJiZcbiAgICAgIHRoaXMuYXV0b0NhcHR1cmUgJiZcbiAgICAgIHRoaXMuZm9jdXNUcmFwLmhhc0F0dGFjaGVkKClcbiAgICApIHtcbiAgICAgIHRoaXMuX2NhcHR1cmVGb2N1cygpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2NhcHR1cmVGb2N1cygpIHtcbiAgICB0aGlzLl9wcmV2aW91c2x5Rm9jdXNlZEVsZW1lbnQgPSBfZ2V0Rm9jdXNlZEVsZW1lbnRQaWVyY2VTaGFkb3dEb20oKTtcbiAgICB0aGlzLmZvY3VzVHJhcC5mb2N1c0luaXRpYWxFbGVtZW50V2hlblJlYWR5KCk7XG4gIH1cbn1cbiJdfQ==